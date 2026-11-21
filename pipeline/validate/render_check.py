#!/usr/bin/env python3
"""Validador do render final (cena ou vídeo inteiro): volume, picos, tela preta, quadro congelado e silêncio.

Uso: python3 pipeline/validate/render_check.py <video.mp4> [--dur 21.4] [--json saida.json] [--freeze 2.0]
Sai com código 1 se algum critério FALHAR. Só lê o arquivo; nunca o altera.

Critérios (YouTube normaliza para cerca de -14 LUFS; R16 exige voz sempre entendível; R18 proíbe imagem parada):
- loudness integrado entre -16 e -12 LUFS; true peak <= -1,0 dBTP;
- tela preta > 0,5 s fora do primeiro e do último segundo = FALHA;
- quadro congelado > --freeze s (padrão 2,0) = FALHA (imagem parada; R18);
- silêncio < -45 dB por > 1,5 s fora das pontas = FALHA (narração caiu);
- duração diferente da esperada (--dur) em mais de 0,3 s = FALHA.
Decodifica com -hwaccel cuda quando disponível (regra: GPU).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys

NUM = r"-?\d+(?:\.\d+)?"


def run(cmd: list[str]) -> str:
    return subprocess.run(cmd, capture_output=True, text=True).stderr


def duration(path: str) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def spans(log: str, kind: str, total: float) -> list[tuple[float, float]]:
    starts = [float(x) for x in re.findall(rf"{kind}_start:\s*({NUM})", log)]
    ends = [float(x) for x in re.findall(rf"{kind}_end:\s*({NUM})", log)]
    return [(s, ends[i] if i < len(ends) else total) for i, s in enumerate(starts)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--dur", type=float)
    ap.add_argument("--json")
    ap.add_argument("--freeze", type=float, default=2.0)
    a = ap.parse_args()
    total = duration(a.video)
    hw = ["-hwaccel", "cuda"]
    vlog = run(["ffmpeg", "-hide_banner", "-nostdin", *hw, "-i", a.video, "-map", "0:v:0", "-vf",
                f"blackdetect=d=0.5:pix_th=0.10,freezedetect=n=-60dB:d={a.freeze}", "-an", "-f", "null", "-"])
    if "Error" in vlog and "blackdetect" not in vlog:  # sem CUDA: decodifica sem aceleração
        vlog = run(["ffmpeg", "-hide_banner", "-nostdin", "-i", a.video, "-map", "0:v:0", "-vf",
                    f"blackdetect=d=0.5:pix_th=0.10,freezedetect=n=-60dB:d={a.freeze}", "-an", "-f", "null", "-"])
    alog = run(["ffmpeg", "-hide_banner", "-nostdin", "-i", a.video, "-map", "0:a:0", "-af",
                "silencedetect=n=-45dB:d=1.5,loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-vn", "-f", "null", "-"])
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", alog, re.S)
    loud = json.loads(m.group(0)) if m else {}
    lufs = float(loud.get("input_i", "nan")) if loud else float("nan")
    tp = float(loud.get("input_tp", "nan")) if loud else float("nan")

    inner = lambda s, e: e > 1.0 and s < total - 1.0
    black = [x for x in spans(vlog, "black", total) if inner(*x)]
    freeze = [(float(s), float(e)) for s, e in zip(re.findall(rf"freeze_start:\s*({NUM})", vlog),
                                                   re.findall(rf"freeze_end:\s*({NUM})", vlog) + [str(total)] * 50)]
    silence = [x for x in spans(alog, "silence", total) if inner(*x)]

    checks = {
        "loudness": {"ok": -16 <= lufs <= -12, "valor": f"{lufs:.1f} LUFS (alvo -14 ±2)"},
        "true_peak": {"ok": tp <= -1.0, "valor": f"{tp:.1f} dBTP (máx. -1,0)"},
        "tela_preta": {"ok": not black, "valor": [f"{s:.2f}-{e:.2f}s" for s, e in black]},
        "congelado": {"ok": not freeze, "valor": [f"{s:.2f}-{e:.2f}s" for s, e in freeze]},
        "silencio": {"ok": not silence, "valor": [f"{s:.2f}-{e:.2f}s" for s, e in silence]},
    }
    if a.dur is not None:
        checks["duracao"] = {"ok": abs(total - a.dur) <= 0.3, "valor": f"{total:.2f}s (esperado {a.dur:.2f}s)"}
    ok = all(c["ok"] for c in checks.values())
    res = {"arquivo": a.video, "duracao_s": round(total, 2), "resultado": "PASS" if ok else "FAIL", "checks": checks}
    if a.json:
        json.dump(res, open(a.json, "w"), ensure_ascii=False, indent=1)
    for k, c in checks.items():
        print(f"{'PASS' if c['ok'] else 'FAIL'}  {k}: {c['valor']}")
    print(res["resultado"])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
