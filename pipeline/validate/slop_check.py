#!/usr/bin/env python3
"""Detector de "AI slop" em texto (R17, knowledge/anti-slop.md).

Uso: slop_check.py <arquivo.md|.txt> [--max 2]   ou   echo "texto" | slop_check.py -
Marca padrões típicos de texto de assistente. Saída 1 se houver mais marcas que --max.
É um filtro, não um juiz: texto limpo ainda precisa ser lido por pessoa.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

W = r"[\wÀ-ÿ'’-]+"
CHECKS = [
    ("lista de três itens curtos (ritmo de efeito)", re.compile(rf"\b{W}( {W}){{0,7}}, {W}( {W}){{0,7}},? e {W}( {W}){{0,7}}[.:;!?\n]", re.I)),
    ("'não é X, é Y' / 'mais do que X'", re.compile(r"\b(não (é|foi|são) [^.,;]{1,40}[,;] (é|foi|são)|mais do que (apenas |só )?\w+|não (apenas|só) [^.]{1,40}, mas)", re.I)),
    ("travessão como aposto", re.compile(r"\s[—–]\s|\s-\s[a-zà-ÿ]")),
    ("palavra de anúncio", re.compile(r"\b(mergulh\w+|jornada|imers[ãa]o|imersiv\w+|fascinante|incr[íi]vel|extraordin[áa]ri\w+|surpreendente|revela\w*|desvend\w+|descubra|explor(a|e|ar|amos) )\b", re.I)),
    ("frase de manifesto/slogan", re.compile(r"\b(a hist[óo]ria que (a escola|ningu[ée]m|n[ãa]o)|segredos? (enterrad|ocult|escondid)\w+|o que n[ãa]o te contaram|como nunca antes|vai al[ée]m d[oe])", re.I)),
    ("explica o processo em vez do assunto", re.compile(r"\b(cada v[íi]deo|aqui voc[êe] (encontra|vai)|neste canal|nosso objetivo|com fontes?\b|um (tema|assunto) por v[íi]deo)", re.I)),
    ("pergunta retórica de abertura", re.compile(r"^(voc[êe] j[áa] (se )?(perguntou|imaginou)|e se )", re.I | re.M)),
    ("dois-pontos seguido de revelação", re.compile(r":\s+(a|o|um|uma) [^.]{0,60}\bque\b", re.I)),
]


def check(text: str):
    hits = []
    for name, rx in CHECKS:
        for m in rx.finditer(text):
            hits.append((name, m.group(0).strip().replace("\n", " ")[:70]))
    return hits


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--max", type=int, default=2)
    a = ap.parse_args()
    text = sys.stdin.read() if a.path == "-" else Path(a.path).read_text(encoding="utf-8")
    text = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith(("#", "<!--", "[CENA")))
    hits = check(text)
    for n, s in hits:
        print(f"  slop: {n} -> «{s}»")
    print(f"{len(hits)} marca(s); limite {a.max}")
    return 1 if len(hits) > a.max else 0


if __name__ == "__main__":
    sys.exit(main())
