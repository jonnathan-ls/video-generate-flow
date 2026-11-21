#!/usr/bin/env python3
"""Gates de um trecho do Vietnã: freezedetect, loudness, fx_check (eventos + voz) e folha de contato.
Uso: .venv/bin/python pipeline/validate/scene_gates.py <render-dir> S02 S03 ..."""
import json, subprocess, sys, re
from pathlib import Path
R = Path(sys.argv[1]); ids = sys.argv[2:]
for sid in ids:
    props = json.loads((R / "props" / f"{sid}.json").read_text()); dur = props["durationSec"]
    ev = json.loads((R / f"{sid}_mix.events.json").read_text())
    Path(f"/tmp/{sid}_fx.json").write_text(json.dumps({"events": ev, "duration": dur}))
    Path(f"/tmp/{sid}_sc.json").write_text(json.dumps({"scenes": [{"id": sid, "kind": "shots", "start": 0, "end": dur}]}))
    Path(f"/tmp/{sid}_w.json").write_text(json.dumps({"words": [{"word": w["word"], "start": w["start"], "end": w["end"]} for w in props["words"]]}))
    mp4 = R / f"{sid}.mp4"
    fz = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-vf", "freezedetect=n=0.002:d=2", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    freezes = re.findall(r"freeze_duration: ([\d.]+)", fz)
    lu = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", lu)[-1]; tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lu)[-1]
    fx = subprocess.run([sys.executable, "pipeline/validate/fx_check.py", f"/tmp/{sid}_fx.json", f"/tmp/{sid}_sc.json", f"/tmp/{sid}_w.json", "--voice", str(R / f"{sid}_mix.voice.wav"), "--mix", str(R / f"{sid}_mix.wav")], capture_output=True, text=True)
    fails = [l for l in (fx.stdout + fx.stderr).splitlines() if l.startswith("[FAIL]")]
    shots = props["spec"]["shots"]
    for i, sh in enumerate(shots):
        t = (sh["start_s"] + sh["end_s"]) / 2
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t), "-i", str(mp4), "-frames:v", "1", "-vf", "scale=640:360", f"/tmp/{sid}_f{i}.jpg"])
    n = len(shots); cols = min(4, n); rows = (n + cols - 1) // cols
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    for i in range(n): cmd += ["-i", f"/tmp/{sid}_f{i}.jpg"]
    lay = "|".join(f"{(i % cols) * 640}_{(i // cols) * 360}" for i in range(n))
    cmd += ["-filter_complex", f"xstack=inputs={n}:layout={lay}" if n > 1 else "copy", str(R / f"{sid}_sheet.jpg")]
    subprocess.run(cmd)
    print(f"{sid}: {dur:.1f}s · {n} tomadas · parados {freezes or 'nenhum'} · {lufs} LUFS pico {tp} · fx {'PASS' if not fails else 'FAIL ' + ' | '.join(fails)}")
