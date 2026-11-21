"""Recorta figuras y clips sobre FONDO VERDE (o azul) como un croma, sin borde de color y sin comerse el pelo.
Detecta solo si el fondo es verde o azul. Recorte mixto: el recorte automático dice dónde está la figura y el croma
solo limpia el borde (pelo, mangas claras, huecos entre brazos). Lo de dentro de la figura no se toca, aunque sea verde.
Quita el tinte del fondo que se queda pegado al borde.

Imágenes:  uv run --with "rembg[cpu]" --with opencv-python-headless --with numpy --with pillow --with scipy python herramientas/recortar_croma.py public/img foto1.jpg foto2.jpg ...
Clip:      uv run --with "rembg[cpu]" --with opencv-python-headless --with numpy --with pillow --with scipy python herramientas/recortar_croma.py --clip clip.mp4 public/clips/nombre [segundos]
Sin el recorte automático (más rápido; solo croma): añade --solo-croma.
Guarda PNG transparentes; en clips, f_000.png… del mismo tamaño e info.json, igual que recortar_clip.py."""
import sys, os, glob, json, shutil, subprocess
import cv2
import numpy as np
from scipy.ndimage import binary_fill_holes
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
SOLO = "--solo-croma" in sys.argv
CLIP = "--clip" in sys.argv
sesion = None
if not SOLO:
    from rembg import remove, new_session
    sesion = new_session("isnet-general-use")


def fondo_es_azul(bgr):
    h, w = bgr.shape[:2]
    borde = np.concatenate([bgr[:20].reshape(-1, 3), bgr[-20:].reshape(-1, 3), bgr[:, :20].reshape(-1, 3), bgr[:, -20:].reshape(-1, 3)])
    b, g, r = np.median(borde, axis=0)
    return b > g


def croma(bgr):
    """devuelve RGBA con el fondo quitado y sin tinte en el borde"""
    azul = fondo_es_azul(bgr)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    f = bgr.astype(np.float32)
    b, g, r = f[..., 0], f[..., 1], f[..., 2]
    if azul:
        dom = b - np.maximum(r, g); h0, h1 = 95, 130
    else:
        dom = g - np.maximum(r, b); h0, h1 = 50, 95
    # color exacto del fondo (mediana del borde de la imagen): lo que se parece mucho a él es fondo, esté donde esté
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    borde = np.concatenate([lab[:20].reshape(-1, 3), lab[-20:].reshape(-1, 3), lab[:, :20].reshape(-1, 3), lab[:, -20:].reshape(-1, 3)])
    exacto = (np.linalg.norm(lab - np.median(borde, axis=0), axis=2) < 22).astype(np.float32)
    # fondo seguro: el color del croma bien saturado (también su sombra); borde: suave según cuánto domina ese color
    seguro = np.maximum(((H >= h0) & (H <= h1) & (S >= 110) & (V >= 30)).astype(np.float32), exacto)
    suave = np.clip((dom - 14) / 26, 0, 1)
    fondo = np.maximum(seguro, suave)
    # solo cerca del fondo: lo que está a más de 6 px del croma seguro se protege (reflejos dentro del pelo)
    lejos = cv2.distanceTransform((1 - cv2.dilate(seguro, np.ones((3, 3)))).astype(np.uint8), cv2.DIST_L2, 3)
    fondo = np.where(lejos > 6, seguro, fondo)
    a = 1 - fondo
    if sesion is not None:
        # recorte mixto: el recorte automático marca la figura; su interior se queda entero aunque tenga verde,
        # salvo lo que es el color exacto del fondo (el fondo que se ve entre el pelo o entre los brazos)
        m = np.array(remove(Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)), session=sesion, only_mask=True)).astype(np.float32) / 255
        dentro = cv2.erode((m > 0.5).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(np.float32) * (1 - exacto)
        # lo de fuera lo decide el croma, no el recorte automático: así lo que la persona toca (un banco, una mesa)
        # no aparece y desaparece entre fotogramas
        a = np.maximum(a, dentro)
    # huecos cerrados dentro de la figura = figura, y fuera las motas sueltas
    solido = cv2.morphologyEx((a > 0.5).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    a = np.maximum(a, cv2.erode(binary_fill_holes(solido).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32))
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 0.3).astype(np.uint8), 8)
    a = a * np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 2000])
    a = cv2.GaussianBlur(a, (0, 0), 0.8)
    # quitar el tinte del croma solo en el borde (a menos de 8 px del fondo): ese canal baja a la media de los otros dos, queda neutro
    banda = lejos <= 8
    # y el otro canal frío no puede pasar del más alto de los dos restantes (si no, el borde queda azulado o verdoso)
    if azul:
        b = np.where(banda, np.minimum(b, (r + g) / 2), b)
        g = np.where(banda, np.minimum(g, np.maximum(r, b)), g)
    else:
        g = np.where(banda, np.minimum(g, (r + b) / 2), g)
        b = np.where(banda, np.minimum(b, np.maximum(r, g)), b)
    return Image.fromarray(np.dstack([r, g, b, a * 255]).clip(0, 255).astype(np.uint8), "RGBA")


if CLIP:
    clip, destino = args[0], args[1]
    dur = args[2] if len(args) > 2 else None
    tmp = destino + "_tmp"; os.makedirs(tmp, exist_ok=True); os.makedirs(destino, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-i", clip] + (["-t", dur] if dur else []) + [f"{tmp}/r_%03d.png", "-hide_banner", "-loglevel", "error"], check=True)
    salidas = [croma(cv2.imread(f)) for f in sorted(glob.glob(f"{tmp}/r_*.png"))]
    cajas = [s.getbbox() for s in salidas if s.getbbox()]
    caja = (min(c[0] for c in cajas), min(c[1] for c in cajas), max(c[2] for c in cajas), max(c[3] for c in cajas))
    for i, s in enumerate(salidas):
        s.crop(caja).save(f"{destino}/f_{i:03d}.png")
    json.dump({"n": len(salidas), "w": caja[2] - caja[0], "h": caja[3] - caja[1]}, open(f"{destino}/info.json", "w"))
    shutil.rmtree(tmp)
    print(destino, len(salidas), "fotogramas", caja[2] - caja[0], "x", caja[3] - caja[1])
else:
    destino, fotos = args[0], args[1:]
    os.makedirs(destino, exist_ok=True)
    for ruta in fotos:
        sale = croma(cv2.imread(ruta))
        sale = sale.crop(sale.getbbox())
        nombre = os.path.basename(ruta).rsplit(".", 1)[0] + ".png"
        sale.save(os.path.join(destino, nombre))
        print("ok", nombre, sale.size)
