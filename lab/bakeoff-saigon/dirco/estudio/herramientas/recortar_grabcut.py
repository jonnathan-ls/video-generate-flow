#!/usr/bin/env python3
"""Recorta una figura cuando ni el recorte automático ni el de color sirven (foto con viñeta o con sombras
del mismo tono que el fondo). Usa GrabCut de OpenCV con un rectángulo alrededor de la figura.
Uso: python3 recortar_grabcut.py entrada.jpg salida.png [margen_en_px]
El rectángulo es la imagen entera menos el margen (por defecto, el 4 % del lado corto)."""
import sys
import cv2
import numpy as np

ent, sal = sys.argv[1], sys.argv[2]
img = cv2.imread(ent)
h, w = img.shape[:2]
m = int(sys.argv[3]) if len(sys.argv) > 3 else int(min(h, w) * 0.04)
mask = np.zeros((h, w), np.uint8)
bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, (m, m, w - 2 * m, h - 2 * m), bg, fg, 6, cv2.GC_INIT_WITH_RECT)
alfa = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# se queda con la pieza más grande y suaviza el borde
n, lab, st, _ = cv2.connectedComponentsWithStats(alfa)
if n > 1:
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    alfa = np.where(lab == k, 255, 0).astype(np.uint8)
alfa = cv2.GaussianBlur(alfa, (0, 0), 1.2)
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = alfa
ys, xs = np.where(alfa > 8)
rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
cv2.imwrite(sal, rgba)
print("ok", sal, rgba.shape[1], "x", rgba.shape[0])
