"""Recorta un clip de vídeo de ía (persona sobre fondo gris, cámara fija) fotograma a fotograma.
Guarda public/clips/<nombre>/f_000.png… todos del mismo tamaño, e info.json con cuántos hay y su tamaño.
Uso:  uv run --with "rembg[cpu]" --with pillow python herramientas/recortar_clip.py clip.mp4 public/clips/nombre [segundos]
Necesita ffmpeg. Tarda unos segundos por fotograma."""
import sys, os, subprocess, glob, json, shutil
from rembg import remove, new_session
from PIL import Image

clip, destino = sys.argv[1], sys.argv[2]
dur = sys.argv[3] if len(sys.argv) > 3 else None
tmp = destino + "_tmp"; os.makedirs(tmp, exist_ok=True); os.makedirs(destino, exist_ok=True)
cmd = ["ffmpeg", "-y", "-i", clip] + (["-t", dur] if dur else []) + [f"{tmp}/r_%03d.png", "-hide_banner", "-loglevel", "error"]
subprocess.run(cmd, check=True)
sesion = new_session("isnet-general-use")
salidas = [remove(Image.open(f).convert("RGB"), session=sesion, post_process_mask=True) for f in sorted(glob.glob(f"{tmp}/r_*.png"))]
cajas = [s.getbbox() for s in salidas]
caja = (min(c[0] for c in cajas), min(c[1] for c in cajas), max(c[2] for c in cajas), max(c[3] for c in cajas))
for i, s in enumerate(salidas):
    s.crop(caja).save(f"{destino}/f_{i:03d}.png")
json.dump({"n": len(salidas), "w": caja[2] - caja[0], "h": caja[3] - caja[1]}, open(f"{destino}/info.json", "w"))
shutil.rmtree(tmp)
print(destino, len(salidas), "fotogramas", caja[2] - caja[0], "x", caja[3] - caja[1])
