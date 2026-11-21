#!/usr/bin/env python3
"""Confere o áudio final contra o texto do roteiro (pega erro de pronúncia do TTS).

Origem: adaptado de `compare_transcript.py` (kit-motion-graphics-com-fable-5, repositório antigo,
só leitura). Diferença: aqui o script transcreve o áudio sozinho (faster-whisper, MIT, GPU com
queda para CPU) e compara token a token com o texto falado.

O Whisper escreve o que ouviu, sem usar o roteiro como dica (`initial_prompt` vazio). Palavra
trocada ou omitida no áudio aparece como diferença. Isso pega, por exemplo, "Viet Minh" lido como
"Viet Mim".

Uso (rode `source pipeline/env.sh` antes, para a GPU):
  .venv/bin/python pipeline/validate/transcript_check.py AUDIO --scenes scenes.json --scene S05
  .venv/bin/python pipeline/validate/transcript_check.py AUDIO --script script.md
  .venv/bin/python pipeline/validate/transcript_check.py AUDIO --text "texto falado"
  Extras: --model medium|small, --json saida.json, --max-warn N

Saída: PASS, WARN ou FAIL; exit 0 (PASS/WARN) ou 1 (FAIL).
- FAIL: palavra do roteiro omitida, acrescentada ou trocada por outra sem parentesco.
- WARN: troca por palavra parecida (similaridade >= 0,75, típico de nome próprio que o Whisper
  escreve de outro jeito) ou número dito por extenso contra algarismos. Confira no áudio.
Limite: o Whisper também erra. Toda diferença é pista para escutar o trecho, não veredito sobre o TTS.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

SIM_WARN = 0.75
UNITS = set("zero um uma dois duas tres quatro cinco seis sete oito nove dez onze doze treze catorze quatorze quinze "
            "dezesseis dezessete dezoito dezenove vinte trinta quarenta cinquenta sessenta setenta oitenta noventa "
            "cem cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos "
            "mil milhao milhoes bilhao bilhoes e".split())


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.casefold())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


def tokens(text: str) -> list[str]:
    return [t for t in (norm(w) for w in text.split()) if t]


def spoken_text_from_script(path: Path) -> str:
    """Tira cabeçalhos e marcas `[CENA ...]` do script.md, deixa só o texto falado."""
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("[") or s.lower().startswith(("contrato:", "fonte:")):
            continue
        out.append(re.sub(r"\[[^\]]*\]", "", s))
    return " ".join(out)


def is_number_pair(exp: list[str], obs: list[str]) -> bool:
    digits = lambda ts: any(t.isdigit() for t in ts)
    words = lambda ts: bool(ts) and all(t in UNITS for t in ts)
    return (digits(exp) and words(obs)) or (digits(obs) and words(exp))


def transcribe(audio: Path, model_name: str) -> list[str]:
    from faster_whisper import WhisperModel
    from pipeline.captions.align_words import load_audio
    data = load_audio(audio)
    try:
        model = WhisperModel(model_name, device="cuda", compute_type="int8_float16")
        segs, _ = model.transcribe(data, language="pt", beam_size=5)
        segs = list(segs)
    except RuntimeError:
        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        segs = list(model.transcribe(data, language="pt")[0])
    return [s.text for s in segs]


def compare(expected: str, heard: str) -> dict:
    a, b = tokens(expected), tokens(heard)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    diffs, equal = [], 0
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            equal += i2 - i1
            continue
        exp, obs = a[i1:i2], b[j1:j2]
        ctx = " ".join(a[max(0, i1 - 4):i1] + ["[" + " ".join(exp) + "]"] + a[i2:i2 + 4])
        if op == "replace" and is_number_pair(exp, obs):
            level = "WARN"
            why = "número (algarismos contra extenso)"
        elif op == "replace" and difflib.SequenceMatcher(None, "".join(exp), "".join(obs)).ratio() >= SIM_WARN:
            level = "WARN"
            why = "palavra parecida (grafia do Whisper ou pronúncia próxima)"
        else:
            level = "FAIL"
            why = {"delete": "omitida no áudio", "insert": "acrescentada no áudio", "replace": "trocada no áudio"}[op]
        diffs.append({"level": level, "why": why, "esperado": " ".join(exp), "ouvido": " ".join(obs),
                      "contexto": ctx, "pos_roteiro": i1})
    return {"tokens_roteiro": len(a), "tokens_ouvidos": len(b), "iguais": equal,
            "fracao_igual": round(equal / len(a), 4) if a else None, "diferencas": diffs}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio", type=Path)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--scenes", type=Path, help="scenes.json (use com --scene)")
    g.add_argument("--script", type=Path, help="script.md inteiro")
    g.add_argument("--text", help="texto falado direto")
    ap.add_argument("--scene", help="id da cena, ex. S05")
    ap.add_argument("--model", default="medium")
    ap.add_argument("--json", type=Path, help="grava o resultado completo")
    ap.add_argument("--max-warn", type=int, default=5, help="mais WARN que isso vira FAIL (padrão 5)")
    a = ap.parse_args()

    if a.scenes:
        if not a.scene:
            ap.error("--scenes exige --scene")
        scenes = json.loads(a.scenes.read_text(encoding="utf-8"))["scenes"]
        match = [s for s in scenes if s["id"] == a.scene]
        if not match:
            ap.error(f"cena {a.scene} não existe em {a.scenes}")
        expected = match[0]["text"]
    elif a.script:
        expected = spoken_text_from_script(a.script)
    else:
        expected = a.text

    heard = " ".join(transcribe(a.audio, a.model))
    res = compare(expected, heard)
    fails = [d for d in res["diferencas"] if d["level"] == "FAIL"]
    warns = [d for d in res["diferencas"] if d["level"] == "WARN"]
    verdict = "FAIL" if fails or len(warns) > a.max_warn else ("WARN" if warns else "PASS")
    res.update({"veredito": verdict, "audio": str(a.audio), "modelo": f"faster-whisper/{a.model}"})
    if a.json:
        a.json.parent.mkdir(parents=True, exist_ok=True)
        a.json.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{verdict} · {res['iguais']}/{res['tokens_roteiro']} palavras iguais · {len(fails)} FAIL · {len(warns)} WARN")
    for d in res["diferencas"]:
        print(f"  {d['level']} {d['why']}: esperado «{d['esperado']}» ouvido «{d['ouvido']}» …{d['contexto']}…")
    return 1 if verdict == "FAIL" else 0


if __name__ == "__main__":
    sys.exit(main())
