"""Recorta personas y objetos que están sobre fondo liso (gris) y los guarda en PNG transparente.
Uso:  uv run --with "rembg[cpu]" --with pillow python herramientas/recortar.py public/img foto1.jpg foto2.jpg ...
Si se come algo que no es fondo (un papel claro, una sábana), usa recortar_por_color.py."""
import sys
from rembg import remove, new_session
from PIL import Image

destino, fotos = sys.argv[1], sys.argv[2:]
sesion = new_session("isnet-general-use")
for ruta in fotos:
    im = Image.open(ruta).convert("RGB")
    sale = remove(im, session=sesion, post_process_mask=True)
    sale = sale.crop(sale.getbbox())
    nombre = ruta.rsplit("/", 1)[-1].rsplit(".", 1)[0] + ".png"
    sale.save(f"{destino}/{nombre}")
    print(nombre, sale.size)
