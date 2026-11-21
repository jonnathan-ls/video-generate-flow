#!/usr/bin/env python3
"""Originalidade do roteiro (knowledge/modeling.md): sobreposição de sequências de N palavras com transcrições de referência.

Uso: originality_check.py script.md ref1.vtt ref2.txt ... [--n 6] [--max 0.03]
Falha se a fração de sequências do roteiro que aparecem em QUALQUER referência passar do limite.
Transcrições .vtt/.srt são limpas (tempos, tags, legendas rolantes repetidas).
"""
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import Report  # noqa: E402


def clean_subs(text: str) -> str:
    out, last = [], ""
    for line in text.splitlines():
        s = line.strip()
        if not s or s == "WEBVTT" or "-->" in s or re.match(r"^\d+$", s) or s.startswith(("Kind:", "Language:", "NOTE")):
            continue
        s = re.sub(r"<[^>]+>", "", s)
        if s and s != last:
            out.append(s)
            last = s
    return " ".join(out)


def read_ref(path: str) -> str:
    raw = Path(path).read_text(encoding="utf-8", errors="ignore")
    if path.endswith(".json3"):
        import json
        d = json.loads(raw)
        return " ".join("".join(s.get("utf8", "") for s in e.get("segs", [])) for e in d.get("events", []) if e.get("segs"))
    return clean_subs(raw) if path.endswith((".vtt", ".srt")) else raw


def tokens(text: str) -> list[str]:
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", text)


def script_text(path: Path) -> str:
    keep = []
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith(("#", "[CENA", ">", "<!--", "---", "|")):
            continue
        keep.append(s)
    return " ".join(keep)


def shingles(words: list[str], n: int) -> set[tuple[str, ...]]:
    return {tuple(words[i : i + n]) for i in range(len(words) - n + 1)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("refs", nargs="+")
    ap.add_argument("--n", type=int, default=6)
    ap.add_argument("--max", type=float, default=0.03)
    a = ap.parse_args()
    r = Report()
    mine = shingles(tokens(script_text(Path(a.script))), a.n)
    if not mine:
        r.err("roteiro curto demais para medir")
        return r.finish("originality_check")
    for ref in a.refs:
        theirs = shingles(tokens(read_ref(ref)), a.n)
        frac = len(mine & theirs) / len(mine)
        print(f"{Path(ref).name}: {frac:.2%} das sequências de {a.n} palavras coincidem")
        if frac > a.max:
            r.err(f"{Path(ref).name}: {frac:.1%} de sobreposição (máx. {a.max:.0%}); reescrever os trechos coincidentes")
    return r.finish("originality_check")


if __name__ == "__main__":
    sys.exit(main())
