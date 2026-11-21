"""Recorta un objeto quitando el fondo por su color (el de las esquinas). Para papeles, telas o
cosas claras que el recorte automático confunde con el fondo.
Uso:  uv run --with pillow --with numpy --with scipy python herramientas/recortar_por_color.py entrada.jpg salida.png [tolerancia=28]"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

entrada, salida = sys.argv[1], sys.argv[2]
tol = float(sys.argv[3]) if len(sys.argv) > 3 else 28
a = np.asarray(Image.open(entrada).convert("RGB")).astype(float)
esquinas = np.concatenate([a[:20, :20].reshape(-1, 3), a[-20:, -20:].reshape(-1, 3), a[:20, -20:].reshape(-1, 3), a[-20:, :20].reshape(-1, 3)])
fondo = np.median(esquinas, 0)
m = np.sqrt(((a - fondo) ** 2).sum(2)) > tol
m = nd.binary_opening(m, iterations=2)
lab, n = nd.label(m)
m = lab == (1 + np.argmax(nd.sum(m, lab, range(1, n + 1))))
m = nd.binary_fill_holes(m)
alfa = nd.gaussian_filter(m.astype(float), 1.2) * 255
im = Image.fromarray(np.dstack([a, alfa]).astype(np.uint8), "RGBA")
im = im.crop(im.getbbox()); im.save(salida); print(salida, im.size)
