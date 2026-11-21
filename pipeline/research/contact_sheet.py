#!/usr/bin/env python3
"""Folha de contato de um vídeo de referência (quadros com tempo + mudança entre quadros).

Origem: adaptado de `research/extract-4fps-contact.py` (repositório antigo kit-flow-generate, só
leitura). Aqui o script recebe qualquer vídeo, serve para 16:9 e 9:16 e não tem lista fixa de fontes.
Sem rede: o vídeo precisa estar no disco (ex.: `media/reference/`).

Uso:
  python3 pipeline/research/contact_sheet.py VIDEO [--out DIR] [--fps 4] [--cols 4] [--rows 5]
                                             [--start S] [--end S]
Saída em DIR (padrão `media/reference/contact/<nome do vídeo>/`):
  NN-<ini>-<fim>.jpg  folhas de cols x rows quadros, cada quadro com o tempo no canto
  manifest.json       duração, resolução, fps e a métrica de mudança entre quadros

Métrica `frame_change`: diferença média em tons de cinza entre quadros vizinhos (0 a 1). Mede
mudança de imagem, não retenção nem movimento de objeto. `below_0_01_fraction` alta = imagem parada.
Use o python3 do sistema (tem PIL).
"""
from __future__ import annotations

import argparse
import json
import math
import statistics
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
GAP, HEADER_H = 4, 30


def percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, math.ceil(p * len(ordered)) - 1)]


def font(size: int):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--fps", type=float, default=4)
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--rows", type=int, default=5)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=None)
    a = ap.parse_args()
    if not a.video.is_file():
        raise SystemExit(f"vídeo não encontrado: {a.video}")

    probe = json.loads(subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-show_entries", "format=duration", "-of", "json", str(a.video)],
        check=True, capture_output=True, text=True).stdout)
    st = probe["streams"][0]
    w, h = int(st["width"]), int(st["height"])
    duration = float(probe["format"]["duration"])
    end = min(a.end, duration) if a.end else duration

    cell_w = 270 if h > w else 384
    cell_h = round(cell_w * h / w)
    per_page = a.cols * a.rows
    page_w = a.cols * cell_w + (a.cols + 1) * GAP
    page_h = HEADER_H + a.rows * cell_h + (a.rows + 1) * GAP
    out = a.out or ROOT / "media/reference/contact" / a.video.stem
    out.mkdir(parents=True, exist_ok=True)
    f_head, f_stamp = font(15), font(16)

    with tempfile.TemporaryDirectory(prefix="contact-") as tmp:
        tmp = Path(tmp)
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(a.start), "-t", str(end - a.start),
             "-i", str(a.video), "-vf", f"fps={a.fps},scale={cell_w}:{cell_h}", "-q:v", "3", str(tmp / "%05d.jpg")],
            check=True)
        frames = sorted(tmp.glob("*.jpg"))
        diffs: list[float] = []
        prev = None
        for fp in frames:
            with Image.open(fp) as im:
                g = im.convert("L").resize((90, 90), Image.Resampling.BILINEAR)
            if prev is not None:
                diffs.append(sum(ImageChops.difference(g, prev).getdata()) / (90 * 90 * 255))
            prev = g

        sheets = []
        for page, off in enumerate(range(0, len(frames), per_page)):
            chunk = frames[off:off + per_page]
            t0 = a.start + off / a.fps
            t1 = min(end, a.start + (off + len(chunk)) / a.fps)
            canvas = Image.new("RGB", (page_w, page_h), (18, 26, 29))
            d = ImageDraw.Draw(canvas)
            d.text((GAP, 6), f"{a.video.name} | {t0:06.2f}s a {t1:06.2f}s | {a.fps:g} quadros/s",
                   font=f_head, fill=(242, 245, 246))
            for k, fp in enumerate(chunk):
                r, c = divmod(k, a.cols)
                x, y = GAP + c * (cell_w + GAP), HEADER_H + GAP + r * (cell_h + GAP)
                with Image.open(fp) as im:
                    canvas.paste(im.convert("RGB"), (x, y))
                stamp = f"{a.start + (off + k) / a.fps:06.2f}s"
                box = d.textbbox((x + 6, y + 5), stamp, font=f_stamp)
                d.rounded_rectangle((box[0] - 4, box[1] - 2, box[2] + 4, box[3] + 2), radius=3, fill=(0, 0, 0))
                d.text((x + 6, y + 5), stamp, font=f_stamp, fill=(255, 255, 255))
            target = out / f"{page + 1:02d}-{t0:06.2f}-{t1:06.2f}.jpg"
            canvas.save(target, quality=88, optimize=True)
            sheets.append(target.name)

    manifest = {
        "video": str(a.video), "duration_seconds": round(duration, 3), "resolution": [w, h],
        "source_fps": st["r_frame_rate"], "sample_fps": a.fps, "range_seconds": [a.start, round(end, 3)],
        "sample_count": len(frames), "sheets": sheets,
        "frame_change": {
            "mean": round(statistics.fmean(diffs), 4) if diffs else 0.0,
            "median": round(statistics.median(diffs), 4) if diffs else 0.0,
            "p90": round(percentile(diffs, 0.90), 4),
            "below_0_01_fraction": round(sum(v < 0.01 for v in diffs) / len(diffs), 4) if diffs else 0.0,
            "above_0_15_fraction": round(sum(v > 0.15 for v in diffs) / len(diffs), 4) if diffs else 0.0,
        },
        "method": "ffmpeg fps=N; diferença média em cinza entre quadros vizinhos; mede mudança de imagem, não retenção.",
    }
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(frames)} quadros, {len(sheets)} folhas, {duration:.1f}s → {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
