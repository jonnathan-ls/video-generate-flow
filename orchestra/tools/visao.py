#!/usr/bin/env python3
"""Pergunta de visão com cadeia de provedores SEM custo (decisão do usuário, 2026-11-22: nada de API paga).
Ordem padrão: local (Ollama na GPU, sem cota) → agy (Antigravity CLI, plano Google do usuário) → gemini (chave grátis).
Uso em código:  from visao import ask; ask(prompt, [imgs], prov="local,agy") -> (texto, provedor)
Uso no shell:   python3 orchestra/tools/visao.py "<prompt>" img1.jpg [img2.jpg] [--prov local,agy]
Variáveis: VISAO_PROV (ordem), OLLAMA_MODEL (padrão qwen3-vl:4b), AGY_MODEL (padrão gemini-3.8-flash-low)."""
import base64, json, os, pathlib, re, subprocess, sys, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[2]
OLLAMA = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
AGY = str(pathlib.Path.home() / ".local/bin/agy")
COTA = re.compile(r"quota|exhausted|RESOURCE_EXHAUSTED|429|rate.?limit", re.I)
_dead = set()  # provedor que deu cota nesta execução não é chamado de novo


def _local(prompt, imgs):
    body = {"model": os.environ.get("OLLAMA_MODEL", "qwen3-vl:4b"), "stream": False, "options": {"temperature": 0},
            "messages": [{"role": "user", "content": prompt,
                          "images": [base64.b64encode(pathlib.Path(i).read_bytes()).decode() for i in imgs]}]}
    req = urllib.request.Request(f"{OLLAMA}/api/chat", json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.loads(r.read())["message"]["content"]


def _agy(prompt, imgs):
    # Pasta isolada só com as imagens: o agy é um agente com acesso a arquivos e, rodando na raiz do projeto,
    # pode ler resultados antigos (ex.: lab/l2gate/obj.json) em vez de olhar as imagens (visto em 2026-11-22).
    import shutil, tempfile
    with tempfile.TemporaryDirectory(prefix="visao_") as d:
        names = []
        for i in imgs:
            n = pathlib.Path(i).name; shutil.copy(i, pathlib.Path(d) / n); names.append(n)
        p = prompt + "\nOlhe só estas imagens desta pasta (não leia outros arquivos, não edite nada): " + ", ".join(names)
        r = subprocess.run([AGY, "-p", p, "--model", os.environ.get("AGY_MODEL", "gemini-3.8-flash-low"), "--output-format", "json"],
                           capture_output=True, text=True, timeout=900, cwd=d)
    d = json.loads(r.stdout or "{}")
    if d.get("status") != "SUCCESS":
        raise RuntimeError(str(d.get("error") or r.stderr)[-300:])
    return d["response"]


def _gemini(prompt, imgs):
    env = dict(os.environ, GEMINI_CLI_TRUST_WORKSPACE="true")
    rel = " ".join("@" + str(pathlib.Path(i).resolve().relative_to(ROOT)) for i in imgs)
    r = subprocess.run(["gemini", "-m", os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite"), "-p", f"{prompt}\nImagens: {rel}"],
                       capture_output=True, text=True, timeout=600, env=env, cwd=ROOT)
    if not r.stdout.strip():
        raise RuntimeError((r.stderr or "")[-300:])
    return r.stdout


PROV = {"local": _local, "agy": _agy, "gemini": _gemini}


def ask(prompt, imgs, prov=None):
    for name in (prov or os.environ.get("VISAO_PROV", "local,agy,gemini")).split(","):
        if name in _dead or name not in PROV:
            continue
        try:
            return PROV[name](prompt, imgs), name
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if COTA.search(msg) or isinstance(e, (ConnectionError, urllib.error.URLError)):
                _dead.add(name)
            print(f"[visao] {name} falhou: {msg[-200:]}", file=sys.stderr)
    return "", None


def json_of(text):
    m = re.search(r"\{.*\}", text or "", re.S)
    try:
        return json.loads(m.group(0)) if m else None
    except json.JSONDecodeError:
        return None


if __name__ == "__main__":
    a = sys.argv[1:]
    prov = None
    if "--prov" in a:
        i = a.index("--prov"); prov = a[i + 1]; a = a[:i] + a[i + 2:]
    t, p = ask(a[0], a[1:], prov)
    print(json.dumps({"provedor": p, "resposta": t}, ensure_ascii=False))
