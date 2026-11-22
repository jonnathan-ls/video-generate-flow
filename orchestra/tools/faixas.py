#!/usr/bin/env python3
"""Mede uma vez, por visão, onde ficam chão, água e céu em cada fundo (em % da imagem) e guarda em cache.
Uso: python3 orchestra/tools/faixas.py <fundo.jpg> [...]   → studio/remotion/public/vietna/faixas.json
Modelo: Gemini CLI com o login do plano Google do usuário (sem chave paga). Fallback de modelo dentro do próprio Gemini.
O compilador (pipeline/assembly/vietna_spec_*.py) usa estas faixas para pôr a base de cada ator no plano certo,
e o shot_check reprova base fora da faixa: física por construção, sem laço de revisão por visão."""
import json, os, re, subprocess, sys, pathlib, hashlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / "studio/remotion/public/vietna/faixas.json"
TMP = ROOT / "orchestra/review/faixas_tmp"; TMP.mkdir(parents=True, exist_ok=True)
MODELS = [m for m in os.environ.get("FAIXAS_MODELS", "gemini-3.5-flash,gemini-3.5-flash-lite").split(",") if m]
PROMPT = """Você mede a geometria de fundos ilustrados de um documentário, para posicionar recortes (pessoas, veículos, barcos) depois.
Para CADA imagem anexada, em porcentagem da imagem (0 = topo/esquerda, 100 = base/direita), devolva:
- "chao": [y_topo, y_base] da faixa horizontal de chão LIVRE e plano onde uma pessoa ou carro pode estar de pé no primeiro/segundo plano (rua, estrada, pátio, cais, trilha). Sem telhados, sem água, sem vegetação densa. null se não houver.
- "chao_x": [x_ini, x_fim] onde essa faixa de chão existe.
- "agua": [y_topo, y_base] da superfície de água navegável (rio, lago, mar) ou null.
- "agua_x": [x_ini, x_fim] ou null.
- "ceu_ate": y onde o céu livre termina (para aviões e helicópteros voarem acima disso).
- "mesa": [y_tampo, x_ini, x_fim] se houver mesa em primeiro plano, senão null.
Imagens: {imgs}
Responda SÓ JSON válido: {{"<nome do arquivo>": {{"chao": ..., "chao_x": ..., "agua": ..., "agua_x": ..., "ceu_ate": ..., "mesa": ...}}, ...}}"""

def key(p): return hashlib.md5(pathlib.Path(p).read_bytes()).hexdigest()[:12]

def ask(paths):
    imgs = []
    for p in paths:
        o = TMP / (pathlib.Path(p).stem + ".jpg")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(p), "-vf", "scale=768:-2", str(o)], check=True)
        imgs.append(f"@{o.relative_to(ROOT)}")
    env = dict(os.environ, GEMINI_CLI_TRUST_WORKSPACE="true")
    env.pop("GEMINI_API_KEY", None)  # sempre pelo login do plano, nunca pela chave
    for m in MODELS:
        r = subprocess.run(["gemini", "-m", m, "-p", PROMPT.format(imgs=" ".join(imgs))], capture_output=True, text=True, timeout=600, env=env, cwd=ROOT)
        mt = re.search(r"\{.*\}", r.stdout or "", re.S)
        if mt:
            try:
                return json.loads(mt.group(0)), m
            except json.JSONDecodeError:
                pass
        print(f"[faixas] {m} sem JSON válido: {(r.stderr or r.stdout)[-200:]!r}", file=sys.stderr)
    return {}, None

def main(paths):
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    todo = [p for p in paths if cache.get(pathlib.Path(p).name, {}).get("_k") != key(p)]
    for i in range(0, len(todo), 6):
        grp = todo[i:i + 6]
        res, m = ask(grp)
        for p in grp:
            n = pathlib.Path(p).name
            d = res.get(n) or res.get(pathlib.Path(p).stem + ".jpg") or res.get(pathlib.Path(p).stem)
            if d:
                d["_k"], d["_m"] = key(p), m
                cache[n] = d
            else:
                print(f"[faixas] sem medida: {n}", file=sys.stderr)
        CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
    miss = [pathlib.Path(p).name for p in paths if pathlib.Path(p).name not in cache]
    print(json.dumps({"medidos": len(paths) - len(miss), "faltam": miss}, ensure_ascii=False))

if __name__ == "__main__":
    main(sys.argv[1:])
