#!/usr/bin/env python3
"""Prepara as cenas do vídeo "Vietnã": script.md + narração (manifest.json) + words.json + scenes_spec.json
→ scenes.json (na pasta do vídeo), props por cena e a fatia de voz de cada cena.

Uso: python3 pipeline/assembly/vietna_prep.py <pasta-do-video> <pasta-voz> <pasta-saida> [--only S01]
`scenes_spec.json` (na pasta do vídeo): {"S01": {"kind": "map", ..., "pins": [{"at_word": "Brasil.", ...}]}}
Um campo `at_word` vira `at_s` (segundos relativos ao início da cena) pela 1ª ocorrência da palavra na cena.
"""
from __future__ import annotations

import argparse
import json
import sys
import re
import subprocess
import unicodedata
from pathlib import Path


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


AMBIG: list[str] = []


def resolve(spec: dict, words: list[dict]) -> dict:
    def at(word: str, nth: int = 1) -> float:
        explicit = "#" in word
        if explicit:
            word, k = word.rsplit("#", 1)
            nth = int(k)
        n = 0
        hits = [round(w["start"], 2) for w in words if norm(w["word"]) == norm(word)]
        if len(hits) > 1 and not explicit:
            AMBIG.append(f"cue '{word}' ambíguo ({len(hits)} ocorrências em {hits}); escreva '{word}#N'")
        for w in words:
            if norm(w["word"]) == norm(word):
                n += 1
                if n == nth:
                    return round(w["start"], 2)
        raise SystemExit(f"palavra '{word}' (ocorrência {nth}) não achada na cena")

    def cue(word: str, nth: int) -> str:
        if "#" in word:
            word, k = word.rsplit("#", 1); nth = int(k)
        return f"{norm(word)}#{nth}"

    out = json.loads(json.dumps(spec))
    def walk(o):
        if isinstance(o, dict):
            if "at_word" in o:
                w0, n0 = o.pop("at_word"), o.pop("nth", 1)
                o["at_cue"] = cue(w0, n0)
                o["at_s"] = at(w0, n0) + o.pop("offset", 0.0)
            if "from_word" in o:
                o["from_s"] = at(o.pop("from_word")) + o.pop("from_offset", 0.0)
            if "start_word" in o:
                o["start_s"] = max(0.0, at(o.pop("start_word")) + o.pop("start_offset", 0.0))
            if "end_word" in o:
                o["end_s"] = at(o.pop("end_word")) + o.pop("end_offset", 0.0)
            if "to_word" in o:
                o["to_s"] = at(o.pop("to_word")) + o.pop("to_offset", 0.0)
            for k in [k for k in list(o) if k.endswith("_word") and k not in ("at_word", "from_word", "to_word", "start_word", "end_word")]:
                base = k[:-5]
                alt = o.pop(base.replace("_at", "") + "_offset", 0.0)
                w0 = o.pop(k)
                o[base + "_cue"] = cue(w0, 1)
                o[base + "_s"] = at(w0) + o.pop(base + "_offset", alt)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(out)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("voz")
    ap.add_argument("out")
    ap.add_argument("--only")
    a = ap.parse_args()
    video, voz, out = Path(a.video), Path(a.voz), Path(a.out)
    manifest = json.loads((voz / "manifest.json").read_text(encoding="utf-8"))
    words = json.loads((voz / "words.json").read_text(encoding="utf-8"))["words"]
    specs = json.loads((video / "scenes_spec.json").read_text(encoding="utf-8")) if (video / "scenes_spec.json").exists() else {}
    script = (video / "script.md").read_text(encoding="utf-8")
    blocks = re.findall(r"\[CENA (\d+) \| [^|]*\| visual: ([^\]|]*?)(?: \| sfx: ([^\]]*))?\]\n(.*?)\n\n", script + "\n", re.S)
    assert len(blocks) == len(manifest["paragraphs"]), (len(blocks), len(manifest["paragraphs"]))
    (out / "props").mkdir(parents=True, exist_ok=True)
    (out / "voz").mkdir(parents=True, exist_ok=True)
    scenes, w0 = [], 0
    for (n, visual, sfx, text), para in zip(blocks, manifest["paragraphs"]):
        nw = len(text.split())
        ws = words[w0:w0 + nw]
        w0 += nw
        sid = f"S{int(n):02d}"
        start, end = para["start"], para["end"]
        rel = [{"i": k, "word": w["word"], "start": round(w["start"] - start, 3), "end": round(w["end"] - start, 3)} for k, w in enumerate(ws)]
        spec = resolve(specs[sid], rel) if sid in specs else {"kind": "pending"}
        scenes.append({"id": sid, "n": int(n), "start": round(start, 3), "end": round(end, 3), "duration": round(end - start, 3),
                       "text": text, "visual": visual, "sfx": sfx or "", "spec": spec})
        if a.only and sid != a.only:
            continue
        (out / "props" / f"{sid}.json").write_text(json.dumps({"scene": sid, "spec": spec, "words": rel, "events": [], "durationSec": round(end - start + 0.4, 2)}, ensure_ascii=False), encoding="utf-8")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-to", str(end), "-i", str(voz / "narration.wav"), str(out / "voz" / f"{sid}.wav")], check=True)
    assert w0 == len(words), (w0, len(words))
    (video / "scenes.json").write_text(json.dumps({"video": video.name, "voz": manifest["voice"], "speed": manifest["speed"], "duration": manifest["duration"], "scenes": scenes}, ensure_ascii=False, indent=1), encoding="utf-8")
    if AMBIG:
        print("ERRO: cues ambíguos (R9):\n  " + "\n  ".join(sorted(set(AMBIG))), file=sys.stderr)
        return 1
    print(f"{len(scenes)} cenas · {manifest['duration']/60:.1f} min · scenes.json gravado")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
