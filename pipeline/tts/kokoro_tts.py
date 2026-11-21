#!/usr/bin/env python3
"""Narração PT-BR com Kokoro (kokoro-onnx, pesos Apache-2.0).

Gera uma tomada por parágrafo (parágrafos separados por linha em branco), apara o silêncio
das bordas, insere pausas fixas entre parágrafos e escreve:
  <out>/narration.wav      áudio completo, 24 kHz mono
  <out>/manifest.json      tempos de início e fim de cada parágrafo (base do scenes.json)

Uso:
  .venv/bin/python pipeline/tts/kokoro_tts.py texto.md saida/ --voice pm_alex --speed 1.0
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

REPO = Path(__file__).resolve().parents[2]
MODEL_DIR = REPO / ".tools" / "kokoro"
PAUSE_S = 0.55          # pausa entre parágrafos
EDGE_DB = -42           # limiar de silêncio relativo ao pico


def trim(audio: np.ndarray, sr: int) -> np.ndarray:
    peak = float(np.max(np.abs(audio))) or 1.0
    active = np.flatnonzero(np.abs(audio) > peak * 10 ** (EDGE_DB / 20))
    if not len(active):
        return audio
    return audio[max(0, active[0] - int(0.02 * sr)): active[-1] + int(0.08 * sr)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("text", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--voice", default="pm_alex")
    ap.add_argument("--speed", type=float, default=1.0)
    a = ap.parse_args()
    if not 0.7 <= a.speed <= 1.3:
        ap.error("velocidade fora de 0,7–1,3")

    paragraphs = [re.sub(r"\s+", " ", p).strip()
                  for p in re.split(r"\n\s*\n", a.text.read_text(encoding="utf-8")) if p.strip()]
    if not paragraphs:
        ap.error("texto vazio")

    tts = Kokoro(str(MODEL_DIR / "kokoro-v1.0.onnx"), str(MODEL_DIR / "voices-v1.0.bin"))
    if a.voice not in tts.get_voices() or not a.voice.startswith("p"):
        ap.error(f"voz inválida para PT-BR: {a.voice}. Opções: "
                 + ", ".join(v for v in tts.get_voices() if v.startswith("p")))

    a.out.mkdir(parents=True, exist_ok=True)
    chunks, items, t, sr = [], [], 0.0, 24000
    for i, p in enumerate(paragraphs):
        audio, sr = tts.create(p, voice=a.voice, speed=a.speed, lang="pt-br")
        audio = trim(audio, sr)
        dur = len(audio) / sr
        items.append({"index": i, "text": p, "start": round(t, 3), "end": round(t + dur, 3)})
        chunks.append(audio)
        t += dur
        if i < len(paragraphs) - 1:
            chunks.append(np.zeros(int(PAUSE_S * sr), dtype=audio.dtype))
            t += PAUSE_S

    full = np.concatenate(chunks)
    sf.write(a.out / "narration.wav", full, sr)
    manifest = {"engine": "kokoro-onnx", "model": "kokoro-v1.0", "license": "Apache-2.0",
                "voice": a.voice, "speed": a.speed, "sampleRate": sr,
                "duration": round(len(full) / sr, 3), "paragraphs": items}
    (a.out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    words = sum(len(p.split()) for p in paragraphs)
    print(f"{a.voice}: {manifest['duration']:.1f}s · {words} palavras · {words / manifest['duration'] * 60:.0f} WPM")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
