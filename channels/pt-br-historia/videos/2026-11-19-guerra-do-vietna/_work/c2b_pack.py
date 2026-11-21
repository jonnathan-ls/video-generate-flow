#!/usr/bin/env python3
"""Recompõe as 3 poses de uma coluna com espaçamento fixo. Separa cada pessoa por
componentes conexos do alfa (a pessoa e sua bandeira/braço ficam juntos) e cola em
colunas de passo fixo. Uso: c2b_pack.py prefixo n_pessoas [passo_frac=0.45]
"""
import sys
from collections import deque
from PIL import Image
import numpy as np

pref = sys.argv[1]
n = int(sys.argv[2])
frac = float(sys.argv[3]) if len(sys.argv) > 3 else 0.45
names = 'abc'
SC = 4  # escala da máscara para rotular


def people(im):
    W, H = im.size
    a = np.asarray(im.split()[-1])
    m = a[::SC, ::SC] > 20
    h, w = m.shape
    lab = np.zeros((h, w), int)
    comps = []
    cur = 0
    for y in range(h):
        for x in range(w):
            if m[y, x] and lab[y, x] == 0:
                cur += 1
                q = deque([(y, x)])
                lab[y, x] = cur
                x0 = x1 = x
                y0 = y1 = y
                while q:
                    cy, cx = q.popleft()
                    x0, x1 = min(x0, cx), max(x1, cx)
                    y0, y1 = min(y0, cy), max(y1, cy)
                    for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
                        if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and lab[ny, nx] == 0:
                            lab[ny, nx] = cur
                            q.append((ny, nx))
                comps.append([x0*SC, y0*SC, (x1+1)*SC, (y1+1)*SC])
    big = [c for c in comps if (c[3]-c[1]) > H*0.45 and (c[2]-c[0]) > W*0.005]
    small = [c for c in comps if c not in big]
    # junta partes pequenas (bandeira solta, mão) à pessoa mais próxima na horizontal
    boxes = [list(b) for b in big]
    for s in small:
        if (s[2]-s[0]) <= 1 and (s[3]-s[1]) <= 1:
            continue
        best, bd = None, 1e9
        for i, b in enumerate(boxes):
            d = max(b[0] - s[2], s[0] - b[2], 0)
            if d < bd:
                bd, best = d, i
        if best is not None and bd < W * 0.06:
            b = boxes[best]
            b[0], b[1] = min(b[0], s[0]), min(b[1], s[1])
            b[2], b[3] = max(b[2], s[2]), max(b[3], s[3])
    boxes.sort(key=lambda b: (b[0] + b[2]) / 2)
    out = []
    for b in boxes:
        pad = 2
        crop = im.crop((max(0, b[0]-pad), max(0, b[1]-pad), min(W, b[2]+pad), min(H, b[3]+pad)))
        bb = crop.split()[-1].getbbox()
        out.append(crop.crop(bb))
    return out


frames = [Image.open(f'studio/remotion/public/vietna/{pref}_{x}.png').convert('RGBA') for x in names]
lists = [people(f) for f in frames]
print([len(l) for l in lists])
cnt = min([len(l) for l in lists] + [n])
if cnt < n:
    print('AVISO: só %d pessoas em alguma pose' % cnt)
H0 = max(f.size[1] for f in frames)
pitch = round(H0 * frac)
W = cnt * pitch
for name, lst in zip(names, lists):
    cv = Image.new('RGBA', (W, H0), (0, 0, 0, 0))
    for i, p in enumerate(lst[:cnt]):
        s = (H0 * 0.97) / p.size[1]
        q = p.resize((max(1, round(p.size[0] * s)), round(p.size[1] * s)), Image.LANCZOS)
        cv.alpha_composite(q, (round((i + 0.5) * pitch - q.size[0] / 2), H0 - q.size[1]))
    cv.save(f'studio/remotion/public/vietna/{pref}_{name}.png')
    print(pref, name, cv.size)
