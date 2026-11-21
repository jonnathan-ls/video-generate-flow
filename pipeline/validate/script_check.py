#!/usr/bin/env python3
"""Validação determinística de script.md (protocols/script-long.md, script-short.md).

Uso: script_check.py <pasta-do-video> [--wpm 150]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import Report, banned_phrases, channel_lang, read_frontmatter  # noqa: E402
from slop_check import check as slop_hits  # noqa: E402

SCENE_RE = re.compile(r"^\[CENA\s+(\d+)\s*\|\s*(\d{1,2}):(\d{2})\s*\|([^\]]*)\]", re.M)
MAX_GAP_LONG = 45
MAX_GAP_SHORT = 3
MAX_WORDS_SHORT = 130


def narration(text: str) -> str:
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith(("#", "[CENA", ">", "<!--", "---")):
            continue
        lines.append(s)
    return " ".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video_dir")
    ap.add_argument("--wpm", type=float, default=None)
    a = ap.parse_args()
    video = Path(a.video_dir)
    r = Report()

    script = video / "script.md"
    if not script.exists():
        r.err("script.md não existe")
        return r.finish("script_check")
    fm = read_frontmatter(video / "brief.md") if (video / "brief.md").exists() else {}
    fmt = fm.get("formato", "longo")
    lang = channel_lang(video)
    wpm = a.wpm or float(fm.get("wpm") or (150 if lang == "pt" else 155))

    text = script.read_text(encoding="utf-8")
    body = narration(text)
    for _name, _s in slop_hits(body)[:15]:
        r.warn(f"slop (R17): {_name} -> «{_s}»")
    words = len(body.split())
    est_min = words / wpm
    print(f"Palavras narradas: {words} · WPM: {wpm:.0f} · duração estimada: {est_min:.1f} min")

    if fmt == "short":
        if words > MAX_WORDS_SHORT:
            r.err(f"short com {words} palavras (máx. {MAX_WORDS_SHORT})")
    else:
        target = fm.get("duracao_alvo_min")
        if target:
            t = float(target)
            if abs(est_min - t) / t > 0.10:
                r.err(f"duração estimada {est_min:.1f} min fora de ±10% do alvo {t} min")
        else:
            r.warn("brief.md sem duracao_alvo_min")

    scenes = SCENE_RE.findall(text)
    if not scenes:
        r.err("nenhuma marcação [CENA NN | mm:ss | visual: ...] encontrada")
    else:
        nums = [int(n) for n, *_ in scenes]
        if nums != sorted(nums) or len(set(nums)) != len(nums):
            r.err("numeração das cenas fora de ordem ou duplicada")
        times = [int(m) * 60 + int(s) for _, m, s, _ in scenes]
        if times != sorted(times):
            r.err("timestamps das cenas não são crescentes")
        max_gap = MAX_GAP_SHORT if fmt == "short" else MAX_GAP_LONG
        est_end = est_min * 60
        for i, t in enumerate(times):
            nxt = times[i + 1] if i + 1 < len(times) else est_end
            if nxt - t > max_gap:
                r.err(f"cena {scenes[i][0]} dura ~{nxt - t:.0f}s (> {max_gap}s sem mudança de padrão)")
        for n, _, _, attrs in scenes:
            if "visual:" not in attrs:
                r.err(f"cena {n} sem 'visual:'")

    low = body.lower()
    for p in banned_phrases(lang):
        if p in low:
            r.err(f"frase proibida: '{p}'")

    sentences = [s for s in re.split(r"[.!?]+", body) if s.strip()]
    if sentences:
        avg = sum(len(s.split()) for s in sentences) / len(sentences)
        long_ones = sum(1 for s in sentences if len(s.split()) > 30)
        print(f"Média de palavras/frase: {avg:.1f} · frases > 30 palavras: {long_ones}")
        if avg > 20:
            r.err(f"média de {avg:.1f} palavras por frase (máx. 20; texto é falado)")
        if long_ones:
            r.warn(f"{long_ones} frase(s) com mais de 30 palavras")

    src = video / "sources.md"
    if not src.exists():
        r.err("sources.md não existe (R1)")
    return r.finish("script_check")


if __name__ == "__main__":
    sys.exit(main())
