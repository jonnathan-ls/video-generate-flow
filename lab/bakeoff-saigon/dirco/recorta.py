#!/usr/bin/env python3
"""Recorta figura sobre croma (verde ou azul, pelo canto) -> PNG com alfa. Despill só na borda (interior intacto)."""
import subprocess, sys, os
import numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB"); w, h = im.size
px = [im.getpixel(p) for p in [(5,5),(w-6,5),(5,h-6),(w-6,h-6)]]
r, g, b = [sorted(c[i] for c in px)[1] for i in range(3)]
hexc = "0x%02X%02X%02X" % (r, g, b); azul = b > g
tmp = out + ".tmp.png"
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,"-vf",f"colorkey={hexc}:0.28:0.10,format=rgba",tmp],check=True)
a = Image.open(tmp).convert("RGBA"); os.remove(tmp)
al = a.split()[-1].point(lambda v: 255 if v > 40 else 0)
core = al.filter(ImageFilter.MinFilter(9))                  # interior (erosão)
bord = np.array(al, bool) & ~np.array(core, bool)
arr = np.array(a).astype(float)
R, G, B = arr[...,0], arr[...,1], arr[...,2]
if azul: arr[...,2] = np.where(bord, np.minimum(B, (R+G)/2), B)
else:    arr[...,1] = np.where(bord, np.minimum(G, (R+B)/2), G)
arr[...,3] = np.array(al.filter(ImageFilter.GaussianBlur(0.8)))
c = Image.fromarray(arr.clip(0,255).astype("uint8"), "RGBA")
c = c.crop(al.getbbox()); c.save(out); print(out, c.size, hexc)
