#!/usr/bin/env python3
"""Recorta objeto gerado sobre verde puro (#00FF00) e salva PNG com alfa, cortado na caixa do objeto.
Uso: python3 pipeline/assembly/chroma_cut.py entrada.jpg saida.png"""
import subprocess, sys
src, out = sys.argv[1], sys.argv[2]
tmp = out + '.tmp.png'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vf', 'colorkey=0x00FF00:0.30:0.08,despill=type=green:mix=0.6:expand=0.1,format=rgba', tmp], check=True)
from PIL import Image
im = Image.open(tmp)
a = im.split()[-1].point(lambda v: 255 if v > 40 else 0)
bb = a.getbbox()
im.crop(bb).save(out)
import os; os.remove(tmp)
print(out, im.crop(bb).size)
