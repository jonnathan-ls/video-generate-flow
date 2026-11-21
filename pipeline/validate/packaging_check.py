#!/usr/bin/env python3
"""Validação determinística da embalagem (protocols/packaging.md).

Formato esperado em packaging.md:
  ## Títulos
  - T01: <título>
  ...
Thumbnails em <pasta-do-video>/thumbs/*.jpg|png

Uso: packaging_check.py <pasta-do-video> [--thumbs]
  --thumbs  valida as thumbnails e gera prévias 160x90 em thumbs/preview160/ para checagem visual.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import Report, banned_phrases, channel_lang  # noqa: E402

TITLE_RE = re.compile(r"^-\s*T(\d+):\s*(.+)$", re.M)
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF☀-➿]")
MAX_TITLE = 60
MIN_TITLES = 15
MAX_THUMB_BYTES = 2 * 1024 * 1024


def check_titles(video: Path, r: Report) -> None:
    p = video / "packaging.md"
    if not p.exists():
        r.err("packaging.md não existe")
        return
    titles = TITLE_RE.findall(p.read_text(encoding="utf-8"))
    if len(titles) < MIN_TITLES:
        r.err(f"{len(titles)} títulos (mínimo {MIN_TITLES}, formato '- T01: título')")
    banned = banned_phrases(channel_lang(video))
    for n, t in titles:
        t = t.strip()
        if len(t) > MAX_TITLE:
            r.err(f"T{n}: {len(t)} caracteres (máx. {MAX_TITLE}) — {t}")
        caps = [w for w in re.findall(r"[A-Za-zÀ-ÿ]{3,}", t) if w.isupper()]
        if len(caps) > 1:
            r.err(f"T{n}: {len(caps)} palavras em CAIXA ALTA (máx. 1)")
        if EMOJI_RE.search(t):
            r.err(f"T{n}: emoji no título")
        for b in banned:
            if b in t.lower():
                r.err(f"T{n}: frase proibida '{b}'")


def ref_titles(video: Path) -> list[str]:
    """Títulos do panorama do research.md (linhas de tabela com URL; título = 2ª coluna)."""
    rs = video / "research.md"
    out = []
    if rs.exists():
        for line in rs.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if line.strip().startswith("|") and "http" in line and len(cells) >= 2 and len(cells[1]) > 8:
                out.append(cells[1])
    return out


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", s.lower().replace("ã", "a").replace("á", "a").replace("é", "e").replace("ç", "c").replace("ó", "o").replace("í", "i").replace("ú", "u").replace("â", "a").replace("ê", "e").replace("ô", "o"))


def check_similarity(video: Path, r: Report) -> None:
    refs = ref_titles(video)
    if not refs:
        r.warn("sem títulos de referência em research.md: similaridade não verificada")
        return
    p = video / "packaging.md"
    for n, t in TITLE_RE.findall(p.read_text(encoding="utf-8")) if p.exists() else []:
        for ref in refs:
            ratio = difflib.SequenceMatcher(None, norm(t), norm(ref)).ratio()
            if ratio >= 0.70:
                r.err(f"T{n}: {ratio:.0%} parecido com o título de referência '{ref[:50]}' (máx. 70%; copie o padrão, não as palavras)")


def probe(path: Path) -> tuple[int, int] | None:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height", "-of", "json", str(path)],
            capture_output=True, text=True, check=True).stdout
        s = json.loads(out)["streams"][0]
        return int(s["width"]), int(s["height"])
    except Exception:
        return None


def check_thumbs(video: Path, r: Report) -> None:
    d = video / "thumbs"
    files = sorted([*d.glob("*.jpg"), *d.glob("*.jpeg"), *d.glob("*.png")]) if d.exists() else []
    if len(files) < 3:
        r.err(f"{len(files)} thumbnails em thumbs/ (mínimo 3)")
    prev = d / "preview160"
    for f in files:
        if f.stat().st_size > MAX_THUMB_BYTES:
            r.err(f"{f.name}: {f.stat().st_size/1e6:.1f} MB (máx. 2 MB)")
        dims = probe(f)
        if dims != (1280, 720):
            r.err(f"{f.name}: dimensões {dims} (exigido 1280x720)")
        prev.mkdir(exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(f), "-vf", "scale=160:90",
                        str(prev / (f.stem + ".png"))], check=False)
    if files:
        print(f"Prévias 160x90 em {prev} — inspecione visualmente (legibilidade é critério da rubrica).")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video_dir")
    ap.add_argument("--thumbs", action="store_true")
    a = ap.parse_args()
    video = Path(a.video_dir)
    r = Report()
    check_titles(video, r)
    check_similarity(video, r)
    if a.thumbs:
        check_thumbs(video, r)
    return r.finish("packaging_check")


if __name__ == "__main__":
    sys.exit(main())
