#!/usr/bin/env python3
"""Corta uma folha de 3 linhas (ciclo de caminhada) em 3 quadros alinhados.
Uso: c2b_sheet.py folha.jpg prefixo
Salva studio/remotion/public/vietna/<prefixo>_a|b|c.png com o mesmo tamanho.
"""
import subprocess, sys, statistics
from PIL import Image

src, prefix = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
W, H = im.size
outs = []
for i in range(3):
    band = im.crop((0, round(i * H / 3), W, round((i + 1) * H / 3)))
    tmp = f'/tmp/c2b_band{i}.jpg'
    band.save(tmp, quality=95)
    out = f'channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/_work/_cut{i}.png'
    subprocess.run(['python3', 'pipeline/assembly/chroma_cut.py', tmp, out], check=True)
    outs.append(out)
cuts = []
for p in outs:
    c = Image.open(p).convert('RGBA')
    cuts.append(c)
tw = round(statistics.median(c.size[0] for c in cuts))
th = round(statistics.median(c.size[1] for c in cuts))
print('alvo', tw, th, [c.size for c in cuts])
for name, c in zip('abc', cuts):
    c2 = c.resize((tw, th), Image.LANCZOS)
    dst = f'studio/remotion/public/vietna/{prefix}_{name}.png'
    c2.save(dst)
    print(dst, c2.size)
