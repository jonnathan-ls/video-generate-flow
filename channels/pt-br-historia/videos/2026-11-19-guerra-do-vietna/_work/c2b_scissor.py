#!/usr/bin/env python3
"""Gera poses B/C de uma coluna a partir da pose A, separando cada pessoa em duas
metades de perna e girando cada metade no quadril em sentido oposto (fallback quando
o Flow devolve a mesma pose). Uso:
  c2b_scissor.py entrada.png saida.png angulo_graus
"""
import sys
from PIL import Image

src, out, ang = sys.argv[1], sys.argv[2], float(sys.argv[3])
im = Image.open(src).convert('RGBA')
W, H = im.size
a = im.split()[-1]

# soldados: colunas vazias na faixa do tronco (topo 45%)
top = int(H * 0.45)
cols = []
band = a.crop((0, 0, W, top))
for x in range(W):
    c = band.crop((x, 0, x + 1, top))
    n = sum(1 for p in c.getdata() if p > 0)
    cols.append(1 if n > top * 0.2 else 0)
segs = []
inseg = False
for x in range(W):
    if cols[x] and not inseg:
        start = x; inseg = True
    elif not cols[x] and inseg:
        if x - start > W * 0.01:
            segs.append((start, x))
        inseg = False
if inseg:
    segs.append((start, W))

canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for (x0, x1) in segs:
    sub = im.crop((x0, 0, x1, H))
    sw = x1 - x0
    # base do soldado
    bb = sub.split()[-1].getbbox()
    y_bot = bb[3]
    hip = int(bb[1] + (y_bot - bb[1]) * 0.52)
    xs = x0 + sw // 2
    upper = sub.crop((0, 0, sw, hip))
    low = sub.crop((0, hip, sw, H))
    lw = xs - x0
    left = low.crop((0, 0, lw, low.size[1]))
    right = low.crop((lw, 0, sw, low.size[1]))
    def rot(layer, ang_deg, pivot_x):
        # gira em volta do quadril (pivot_x, hip) dentro do recorte do soldado
        pad = int(H * 0.3)
        big = Image.new('RGBA', (sw + 2 * pad, low.size[1] + 2 * pad), (0, 0, 0, 0))
        big.paste(layer, (pad, pad))
        r = big.rotate(ang_deg, resample=Image.BICUBIC, center=(pad + pivot_x, pad), fillcolor=(0, 0, 0, 0))
        return r.crop((pad, pad, pad + sw, pad + low.size[1]))
    L = rot(left, -ang, lw)    # metade de trás: gira no quadril (borda direita do recorte)
    R = rot(right, ang, 0)     # metade da frente: gira no quadril (borda esquerda do recorte)
    merged = Image.alpha_composite(Image.alpha_composite(
        Image.new('RGBA', (sw, low.size[1]), (0, 0, 0, 0)), L), R)
    # recompõe: tronco + pernas
    sold = Image.new('RGBA', (sw, H), (0, 0, 0, 0))
    sold.paste(upper, (0, 0))
    sold.alpha_composite(merged, (0, hip))
    canvas.alpha_composite(sold, (x0, 0))

bb = canvas.split()[-1].getbbox()
canvas.crop(bb).save(out)
print(out, canvas.crop(bb).size, 'soldados', len(segs), 'angulo', ang)
