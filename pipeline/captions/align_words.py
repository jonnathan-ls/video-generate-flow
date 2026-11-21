#!/usr/bin/env python3
"""Tempos por palavra da narração (faster-whisper, MIT) → words.json.

Usa o texto do roteiro como verdade: o Whisper só fornece os tempos. As palavras reconhecidas são
casadas com as palavras do roteiro por alinhamento de sequência; palavras sem par recebem tempo
interpolado. Também calcula o erro (WER aproximado) da pronúncia, que o QA de voz usa.

Uso (rode `source pipeline/env.sh` antes, para usar a GPU):
  .venv/bin/python pipeline/captions/align_words.py texto.md narration.wav saida/words.json [--model medium]
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


def load_audio(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000",
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("text", type=Path)
    ap.add_argument("audio", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--model", default="medium")
    a = ap.parse_args()

    script_words = a.text.read_text(encoding="utf-8").split()
    try:
        model = WhisperModel(a.model, device="cuda", compute_type="int8_float16")
        segs, _ = model.transcribe(load_audio(a.audio), language="pt", word_timestamps=True, beam_size=5)
        segs = list(segs)
    except RuntimeError:
        model = WhisperModel(a.model, device="cpu", compute_type="int8")
        segs = list(model.transcribe(load_audio(a.audio), language="pt", word_timestamps=True)[0])
    heard = [w for s in segs for w in (s.words or [])]

    ref = [norm(w) for w in script_words]
    hyp = [norm(w.word) for w in heard]
    times: list[tuple[float, float] | None] = [None] * len(script_words)
    sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k].start, heard[j1 + k].end)
        elif tag == "replace" and j2 > j1:  # ex.: "mil oitocentos e sete" -> "1807": distribui o trecho
            s, e = heard[j1].start, heard[j2 - 1].end
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    # interpolação para palavras sem tempo
    for i, t in enumerate(times):
        if t is None:
            prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev + 0.3)
            times[i] = (prev, max(prev, nxt))

    words = [{"i": i, "word": w, "start": round(t[0], 3), "end": round(t[1], 3)}
             for i, (w, t) in enumerate(zip(script_words, times))]
    wer = 1 - sm.ratio()
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text(json.dumps({"engine": f"faster-whisper/{a.model}", "werApprox": round(wer, 4),
                                 "words": words}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(words)} palavras alinhadas · WER≈{wer:.1%} → {a.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
