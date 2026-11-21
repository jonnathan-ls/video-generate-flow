#!/usr/bin/env python3
"""Recorta uma folha de ciclo de caminhada (N poses em linha, fundo verde #00FF00) em N PNGs alinhados.
Cada pose vai para uma tela do mesmo tamanho, com os pés na base e o tronco (centroide do alfa no terço de cima)
no centro horizontal: trocar as poses não faz o corpo pular de lado.

Uso: python3 pipeline/assembly/sprite_split.py folha.jpg saida_prefixo [N=4]
Gera saida_prefixo_0.png ... _N-1.png e imprime a razão largura/altura (campo `ar` não é preciso com frames).
"""
import subprocess, sys, os
from PIL import Image
import numpy as np

src, pre = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 4
tmp = pre + '.tmp.png'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vf', 'colorkey=0x00FF00:0.30:0.08,despill=type=green:mix=0.6:expand=0.1,format=rgba', tmp], check=True)
im = Image.open(tmp); os.remove(tmp)
A = np.array(im)[:, :, 3] > 40
cols = A.sum(0) > 2
# segmentos de colunas com conteúdo
segs, on, s0 = [], False, 0
for x, c in enumerate(cols):
    if c and not on: on, s0 = True, x
    if not c and on:
        on = False
        if x - s0 > 20: segs.append((s0, x))
if on: segs.append((s0, len(cols)))
# junta segmentos muito próximos até sobrar n
while len(segs) > n:
    gaps = [segs[i + 1][0] - segs[i][1] for i in range(len(segs) - 1)]
    k = int(np.argmin(gaps)); segs[k] = (segs[k][0], segs[k + 1][1]); del segs[k + 1]
if len(segs) < n:
    # objetos na mão (bandeira) encostam no vizinho: separa pelas pernas (40% de baixo) e corta no meio do vão
    rows_all = np.where(A.any(1))[0]
    low = A[rows_all[-1] - (rows_all[-1] - rows_all[0]) * 2 // 5: rows_all[-1] + 1]
    lc = low.sum(0) > 2
    ls, on, s0 = [], False, 0
    for x, c in enumerate(lc):
        if c and not on: on, s0 = True, x
        if not c and on:
            on = False
            if x - s0 > 10: ls.append((s0, x))
    if on: ls.append((s0, len(lc)))
    while len(ls) > n:
        gaps = [ls[i + 1][0] - ls[i][1] for i in range(len(ls) - 1)]
        k = int(np.argmin(gaps)); ls[k] = (ls[k][0], ls[k + 1][1]); del ls[k + 1]
    cuts = [0] + [(ls[i][1] + ls[i + 1][0]) // 2 for i in range(len(ls) - 1)] + [A.shape[1]]
    segs = list(zip(cuts[:-1], cuts[1:]))
assert len(segs) == n, f'achei {len(segs)} poses, esperava {n}'
parts = []
for a, b in segs:
    sub = A[:, a:b]
    rows = np.where(sub.any(1))[0]; top, bot = rows[0], rows[-1] + 1
    third = sub[top: top + (bot - top) // 3]
    cx = a + float(np.mean(np.where(third)[1]))
    parts.append((a, b, top, bot, cx))
H = max(p[3] - p[2] for p in parts)
half = max(max(p[4] - p[0], p[1] - p[4]) for p in parts)
W = int(2 * half) + 4
for i, (a, b, top, bot, cx) in enumerate(parts):
    crop = im.crop((a, top, b, bot))
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.paste(crop, (int(W / 2 - (cx - a)), H - (bot - top)), crop)
    canvas.save(f'{pre}_{i}.png')
print(pre, 'poses', n, 'tamanho', (W, H), 'ar', round(W / H, 3))
