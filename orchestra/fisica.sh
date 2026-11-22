#!/bin/bash
# Gate de FÍSICA por visão, depois do render: para cada pergunta, uma tira com 3 quadros (início, meio, fim do
# trajeto), recortados em volta do ator, e votos de sim/não por ator. Fecha o buraco que o shot_check não vê
# (navio fora do rio, objeto sobre a casa, pessoa que entra do alto, veículo de ré).
# As perguntas saem de orchestra/tools/fisica_perguntas.py.
# Uso: bash orchestra/fisica.sh <mp4> <perguntas.json> [saida.json]
# perguntas.json: [{"t":[ini,meio,fim],"ator":"navio","pos":[[x,y]x3],"pergunta":"O navio está sobre a água..."}]
# Saída: {"fails":n,"itens":[{n,ator,ok,motivo,pergunta,t,tira,votos}]}; código 1 se fails>0.
# Modelo: Gemini Flash (grátis); se a cota acabar, modelo grátis com visão no OpenCode (mesmo caminho do periodo.sh).
# GEMINI_CLI_LOGIN=1 usa a sessão já autenticada do Gemini CLI sem carregar chave do .env.
# REVIEWER=... troca o modelo do fallback; FISICA_VOTOS (padrão 5) = respostas por pergunta (maioria decide).
cd /home/jonnathan/projects/ai-youtube-channel
MP4=$1; Q=$2
[ -f "$MP4" ] || { echo "sem mp4: $MP4"; exit 2; }
[ -f "$Q" ] || { echo "sem perguntas: $Q"; exit 2; }
STEM=$(basename "${MP4%.mp4}")
T=orchestra/review/fisica/$STEM
mkdir -p "$T"
OUT=${3:-$T/fisica.json}
BATCH=${FISICA_BATCH:-3}
VOTOS=${FISICA_VOTOS:-1}  # 2026-11-22: 1 voto; só a pergunta que falhar ganha +2 votos (maioria de 3)

# 1) uma tira por pergunta: 3 quadros de 960 px empilhados (início em cima, fim embaixo), recortados em volta do ator
python3 - "$MP4" "$Q" "$T" <<'PY' || exit 2
import json, subprocess, sys
mp4, qf, t = sys.argv[1:4]
qs = json.load(open(qf))
W, H = map(int, subprocess.check_output(
    ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-of", "csv=p=0", mp4]).decode().strip().split(",")[:2])
man = []
for i, q in enumerate(qs, 1):
    ts = q.get("t") or []
    if len(ts) != 3:
        sys.exit(f"pergunta {i} sem 3 tempos: {ts}")
    pos = q.get("pos") or [[50, 50]] * 3
    files = []
    for k, (tt, p) in enumerate(zip(ts, pos)):
        w, h = int(W * 0.62) // 2 * 2, int(H * 0.62) // 2 * 2
        x = max(0, min(W - w, int(p[0] / 100 * W - w / 2)))
        y = max(0, min(H - h, int((p[1] - 15) / 100 * H - h / 2)))
        f = f"{t}/q{i}_{k}.jpg"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(tt), "-i", mp4, "-frames:v", "1",
                        "-vf", f"crop={w}:{h}:{x}:{y},scale=960:-2", f], check=True)
        files.append(f)
    strip = f"{t}/q{i}.jpg"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", files[0], "-i", files[1], "-i", files[2],
                    "-filter_complex", "vstack=inputs=3", strip], check=True)
    man.append({"n": i, "ator": q.get("ator", ""), "pergunta": q["pergunta"], "tira": strip, "t": ts})
json.dump(man, open(f"{t}/manifest.json", "w"), ensure_ascii=False)
PY

if [ -z "$NOGEMINI" ]; then
  export GEMINI_API_KEY="$(grep -m1 '^GEMINI_API_KEY=' .env | cut -d= -f2- | tr -d "\"' ")"
fi
export GEMINI_MODEL=${GEMINI_MODEL:-gemini-3.5-flash}
export GEMINI_CLI_LOGIN=${GEMINI_CLI_LOGIN:-0}
export FISICA_MODEL=${REVIEWER:-opencode/nemotron-3.5-super-vl-free}

# 2) por pergunta: N votos (o modelo responde {ator, ok, motivo}); a maioria decide; grava a saída
python3 - "$T" "$OUT" "$MP4" "$BATCH" "$VOTOS" <<'PY'
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
t, out, mp4, batch, votos = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
man = json.load(open(f"{t}/manifest.json"))
GEMINI_OK = True

def prompt(q):
    return (f"A imagem anexada é uma tira com 3 quadros do MESMO movimento, empilhados de cima para baixo: "
            f"o de cima é o início, o do meio e o de baixo é o fim. Pergunta (ator: {q['ator']}): {q['pergunta']}\n"
            f"Julgue a FÍSICA comparando o ator com o cenário: chão, piso, água do rio, estrada, casas, mapa. "
            f"Se ele flutua, desce do alto, sai da água ou da estrada, passa por cima de casas/mapa ou anda de ré, "
            f"a resposta é ok=false. Olhe a linha de contato (pés, rodas, casco) em cada quadro. "
            f"Ignore legendas, cartelas e quadro preto de transição: julgue pelos outros. Não julgue estilo.\n"
            f"Responda APENAS com este objeto JSON, sem nenhum texto antes ou depois: "
            f'{{"ator":"{q["ator"]}","ok":true|false,"motivo":"curto"}}')

def parse(text):
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        d = json.loads(m.group(0))
    except Exception:
        return None
    ok = d.get("ok")
    if isinstance(ok, str):
        ok = ok.strip().lower() in ("true", "sim", "yes", "1")
    if not isinstance(ok, bool):
        return None
    return {"ator": d.get("ator") or "", "ok": ok, "motivo": str(d.get("motivo") or "")}

def ask(q, k):
    global GEMINI_OK
    p = prompt(q)
    raw = f"{t}/raw_q{q['n']}_{k}.txt"
    # 2 tentativas: uma resposta perdida não pode decidir o gate
    for attempt in range(2):
        text = ""
        if (os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_CLI_LOGIN") == "1") and GEMINI_OK:
            env = dict(os.environ, GEMINI_CLI_TRUST_WORKSPACE="true")
            r = subprocess.run(["gemini", "-m", os.environ.get("GEMINI_MODEL", "gemini-3.5-flash"),
                                "-p", p + f"\nImagem: @{q['tira']}"],
                               capture_output=True, text=True, timeout=600, env=env)
            text = r.stdout or ""
            open(raw, "w").write(text)
        a = parse(text) if text else None
        if a is None and text and re.search(r"quota|exhausted|RESOURCE_EXHAUSTED|429", text, re.I):
            GEMINI_OK = False  # só cota esgotada desliga o Gemini; erro isolado tenta de novo
        if a is None:
            r = subprocess.run(["opencode", "--standalone", "run", "--auto", "--archived",
                                "-m", os.environ.get("FISICA_MODEL", "opencode/nemotron-3.5-super-vl-free"),
                                "-f", q["tira"], "--", p + " Não use ferramentas; só olhe a imagem anexada."],
                               capture_output=True, text=True, timeout=900)
            text = (r.stdout or "") + "\n" + (r.stderr or "")
            open(raw, "w").write(text)
            a = parse(text)
        if a is not None:
            return a
    return None

tasks = [(q, k) for q in man for k in range(max(1, votos))]
with ThreadPoolExecutor(max_workers=max(1, batch)) as ex:
    resp = list(ex.map(lambda qk: ask(*qk), tasks))
byq = {q["n"]: [] for q in man}
for (q, k), a in zip(tasks, resp):
    if a is not None:
        byq[q["n"]].append(a)
# Voto adaptativo: pergunta com alguma resposta "falha" (ou sem resposta) ganha mais votos até 3 no total.
redo = [(q, 100 + k) for q in man if len(byq[q["n"]]) < 3 and (not byq[q["n"]] or any(not a["ok"] for a in byq[q["n"]])) for k in range(3 - len(byq[q["n"]]))]
if redo:
    with ThreadPoolExecutor(max_workers=max(1, batch)) as ex:
        for (q, k), a in zip(redo, ex.map(lambda qk: ask(*qk), redo)):
            if a is not None:
                byq[q["n"]].append(a)

itens = []
for q in man:
    ans = byq[q["n"]]
    nfalse = sum(1 for a in ans if not a["ok"])
    ntrue = len(ans) - nfalse
    ok = bool(ans) and nfalse * 2 < len(ans)
    motivo = "ok" if ok else "; ".join(dict.fromkeys(a["motivo"] for a in ans if not a["ok"] and a["motivo"]))
    if not ans:
        motivo = "sem resposta válida do modelo"
    itens.append({"n": q["n"], "ator": q["ator"], "ok": ok, "motivo": motivo or "",
                  "pergunta": q["pergunta"], "t": q["t"], "tira": q["tira"],
                  "votos": f"{ntrue} ok / {nfalse} falha"})
n = sum(1 for i in itens if not i["ok"])
json.dump({"mp4": mp4, "votos_por_pergunta": votos, "fails": n, "itens": itens},
          open(out, "w"), ensure_ascii=False, indent=1)
for i in itens:
    print(("PASS" if i["ok"] else "FAIL") + f" {i['ator']} t={i['t']} [{i['votos']}]: {i['pergunta']}"
          + ("" if i["ok"] else f" → {i['motivo']}"))
print(f"{'PASS' if n == 0 else 'FAIL'} fisica: {n} falha(s) em {len(itens)} pergunta(s); {out}")
sys.exit(1 if n else 0)
PY
