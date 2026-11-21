#!/usr/bin/env python3
"""Desenha a bandeira do Brasil (versão 1960–1968, 22 estrelas) por código, sem texto deformado de IA.
Uso: python3 pipeline/assembly/flag_brazil.py saida.png
Proporções aproximadas da Lei 5.700 (módulo 20 × 14); estrelas posicionadas de forma esquemática (escala de vídeo)."""
import math, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageChops

out = sys.argv[1]
U = 60
W, H = 20 * U, 14 * U
im = Image.new('RGBA', (W, H), (0, 148, 64, 255))
d = ImageDraw.Draw(im)
d.polygon([(1.7 * U, H / 2), (W / 2, 1.7 * U), (W - 1.7 * U, H / 2), (W / 2, H - 1.7 * U)], fill=(254, 221, 0, 255))
cx, cy, R = W / 2, H / 2, 3.5 * U
circ = Image.new('L', (W, H), 0)
ImageDraw.Draw(circ).ellipse([cx - R, cy - R, cx + R, cy + R], fill=255)
im.paste(Image.new('RGBA', (W, H), (0, 39, 118, 255)), (0, 0), circ)
ac = (12 * U, 14.4 * U)
r1, r2 = 8.0 * U, 8.5 * U
band = Image.new('L', (W, H), 0)
bd = ImageDraw.Draw(band)
bd.ellipse([ac[0] - r2, ac[1] - r2, ac[0] + r2, ac[1] + r2], fill=255)
bd.ellipse([ac[0] - r1, ac[1] - r1, ac[0] + r1, ac[1] + r1], fill=0)
band = ImageChops.multiply(band, circ)
im.paste(Image.new('RGBA', (W, H), (255, 255, 255, 255)), (0, 0), band)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(0.36 * U))
txt = 'ORDEM E PROGRESSO'
rm = (r1 + r2) / 2


def ang_at(x):
    return math.atan2(-math.sqrt(rm * rm - (x - ac[0]) ** 2), x - ac[0])


a0, a1 = ang_at(cx - 2.9 * U), ang_at(cx + 2.9 * U)
for i, ch in enumerate(txt):
    t = (i + 0.5) / len(txt)
    a = a0 + (a1 - a0) * t
    x, y = ac[0] + rm * math.cos(a), ac[1] + rm * math.sin(a)
    g = Image.new('RGBA', (int(U * 0.6), int(U * 0.6)), (0, 0, 0, 0))
    ImageDraw.Draw(g).text((g.width / 2, g.height / 2), ch, font=font, fill=(0, 148, 64, 255), anchor='mm')
    g = g.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC)
    im.alpha_composite(g, (int(x - g.width / 2), int(y - g.height / 2)))
random.seed(4)
pts = []
for _ in range(20000):
    if len(pts) >= 21:
        break
    x = cx + random.uniform(-3.2, 3.2) * U
    y = cy + random.uniform(-1.0, 3.3) * U
    if (x - cx) ** 2 + (y - cy) ** 2 > (3.25 * U) ** 2:
        continue
    if math.hypot(x - ac[0], y - ac[1]) > r1 - 0.15 * U:
        continue
    if any(math.hypot(x - px, y - py) < 0.4 * U for px, py in pts):
        continue
    pts.append((x, y))
pts.append((cx + 0.6 * U, cy - 2.2 * U))
d = ImageDraw.Draw(im)
for x, y in pts:
    r = U * random.choice([0.09, 0.12, 0.15, 0.18])
    d.polygon([(x + (r if k % 2 == 0 else r * 0.42) * math.cos(-math.pi / 2 + k * math.pi / 5),
                y + (r if k % 2 == 0 else r * 0.42) * math.sin(-math.pi / 2 + k * math.pi / 5)) for k in range(10)], fill=(255, 255, 255, 255))
im.save(out)
print(out, im.size, len(pts), 'estrelas')
