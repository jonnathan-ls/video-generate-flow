#!/usr/bin/env python3
"""Alinha as poses de uma coluna pela base e pela escala e grava um canvas comum.
Uso: c2b_align.py referencia.png poseX.png [...] --prefixo coluna_xx
Cada PNG é cortado no bbox do alfa, escalado para a altura do bbox da referência e
colado no mesmo canvas (mesma largura/altura), com a base no rodapé e o centro no meio.
"""
import sys
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')]
pref = next(a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--prefixo='))
ref = Image.open(args[0]).convert('RGBA')
ref = ref.crop(ref.split()[-1].getbbox())
target_h = ref.size[1]
imgs = []
for p in args:
    im = Image.open(p).convert('RGBA')
    bb = im.split()[-1].getbbox()
    im = im.crop(bb)
    s = target_h / im.size[1]
    if abs(s - 1) > 0.002:
        im = im.resize((max(1, round(im.size[0] * s)), target_h), Image.LANCZOS)
    imgs.append(im)
W = max(im.size[0] for im in imgs)
H = max(im.size[1] for im in imgs)
names = ['a', 'b', 'c', 'd']
for i, im in enumerate(imgs):
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cv.alpha_composite(im, ((W - im.size[0]) // 2, H - im.size[1]))
    out = f'studio/remotion/public/vietna/{pref}_{names[i]}.png'
    cv.save(out)
    print(out, cv.size)
