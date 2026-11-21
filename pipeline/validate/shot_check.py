#!/usr/bin/env python3
"""Valida o plano de tomadas de cada cena (protocols/shot-planning.md, protocols/scene-production.md, R18).
Uso: shot_check.py scenes_spec.json props-dir [S02 S03 ...]
Lê os tempos resolvidos de props-dir/<cena>.json ('spec') quando existem.
Falha se: faltar tomada, tomada > 7 s, média > 6 s, buraco, tipo repetido, < 3 camadas, sem movimento/cue,
>2 s sem objeto em movimento numa tomada com cena (R18/V9), base de ator sob a legenda (V10),
ou se mapa/texto/doc sem cena passar de 20% do tempo das cenas checadas."""
import json, sys, pathlib
spec = json.load(open(sys.argv[1])); props = pathlib.Path(sys.argv[2])
only = set(sys.argv[3:])
GAP = 2.0; CAPTION_Y = 86.0

def action_intervals(sh, a, b):
    sc = sh.get("scene") or {}
    iv = []
    for ac in sc.get("actors", []):
        t0 = ac.get("t0_s", a); t1 = ac.get("t1_s", b)
        if ac.get("path_s") and len(ac["path_s"]) == len(ac.get("path", [])):
            # trajeto com tempo por ponto: só contam os trechos em que o objeto de fato se desloca (pausa não é movimento)
            for (p0, p1), (s0, s1) in zip(zip(ac["path"], ac["path"][1:]), zip(ac["path_s"], ac["path_s"][1:])):
                if p0 != p1: iv.append((max(a, s0), min(b, s1)))
            continue
        moves = ("to" in ac and ac["to"] != ac["from"]) or len(ac.get("path", [])) > 1 or ac.get("grow")
        if moves: iv.append((max(a, ac.get("appear_s", t0) if ac.get("grow") else t0), min(b, t1)))
        if ac.get("slices") and (not ac.get("to") or ac.get("wave")): iv.append((max(a, ac.get("appear_s", a)), b))
        if ac.get("rotor"): iv.append((max(a, ac.get("appear_s", a)), b))
    for fx in sc.get("fx", []):
        k = fx["kind"]
        if k == "explosion": iv.append((fx["at_s"], fx["at_s"] + 1.5))
        elif k == "tracers": iv.append((fx["from_s"], fx["to_s"]))
        elif k == "fire": iv.append((fx.get("from_s", a), b))
        elif k == "searchlight": iv.append((fx.get("from_s", a), b))
        elif k == "flash": iv.append((fx["at_s"], fx["at_s"] + 0.6))
        elif k in ("typing", "calendar"): iv.append((fx["from_s"], fx["to_s"]))
        elif k == "dominoes":
            n = fx.get("n", 7); st = fx.get("step_s", 0.3)
            iv.append((fx.get("wobble_s", fx["fall_s"]), fx["fall_s"] + n * st + 0.3))
    if sc.get("bg2"): t = sc.get("bg2_at_s", a); iv.append((t, t + 0.6))
    return sorted(iv)

def gaps(iv, a, b):
    out = []; cur = a
    for x, y in iv:
        if x - cur > GAP: out.append((cur, x))
        cur = max(cur, y)
    if b - cur > GAP: out.append((cur, b))
    return out

fails = 0; info = 0.0; total = 0.0
for sid, sc0 in spec.items():
    if only and sid not in only: continue
    pf = props / f"{sid}.json"
    if not pf.exists(): print("SKIP", sid, "(sem props)"); continue
    pj = json.load(open(pf)); dur = pj.get("durationSec", 0); total += dur
    sc = pj.get("spec") or sc0
    shots = sc.get("shots") or []
    errs = []
    if sc.get("kind") == "map": info += dur
    if not shots:
        if sc.get("kind") != "map": errs.append("sem 'shots'")
    else:
        if dur / len(shots) > 6: errs.append(f"média {dur/len(shots):.1f}s por tomada (máx. 6)")
        prev = None; prev_cam1 = None
        if shots[0]["start_s"] > 0.3: errs.append(f"1ª tomada começa em {shots[0]['start_s']:.1f}s")
        if shots[-1]["end_s"] < dur - 0.5: errs.append(f"última tomada termina em {shots[-1]['end_s']:.1f}s, cena dura {dur:.1f}s")
        for a_, b_ in zip(shots, shots[1:]):
            if b_["start_s"] - a_["end_s"] > 0.2: errs.append(f"buraco de {b_['start_s'] - a_['end_s']:.1f}s em {a_['end_s']:.1f}s")
        for i, s in enumerate(shots):
            a, b = s["start_s"], s["end_s"]; d = b - a
            if d > 7: errs.append(f"tomada {i+1} dura {d:.1f}s (máx. 7)")
            if len(s.get("layers", [])) < 3: errs.append(f"tomada {i+1} com menos de 3 camadas")
            if not s.get("motion"): errs.append(f"tomada {i+1} sem movimento")
            if not s.get("cue"): errs.append(f"tomada {i+1} sem ligação com a fala")
            if prev and prev == s["kind"] and not s.get("scene") and not (s["kind"] == "map-zoom" and s.get("cam0") == prev_cam1):
                errs.append(f"tomadas {i} e {i+1} repetem o tipo '{prev}' sem cena nem continuidade de câmera")
            prev = s["kind"]; prev_cam1 = s.get("cam1")
            if not s.get("scene"):
                info += d; continue
            for x, y in gaps(action_intervals(s, a, b), a, b):
                errs.append(f"tomada {i+1}: {y-x:.1f}s sem objeto em movimento ({x:.1f}–{y:.1f}s) [R18/V9]")
            scn = s["scene"]; z = max(scn.get("z0", 1.02), scn.get("z1", 1.1)); oy = float(str(scn.get("oy", "60%")).rstrip("%"))
            for ac in scn.get("actors", []):
                if ac.get("blend") or ac.get("h", 0) < 6 or ac.get("under_caption_ok"): continue
                for pt in [ac["from"], ac.get("to", ac["from"])] + ac.get("path", []):
                    if not (0 <= pt[0] <= 100): continue
                    ys = oy + (pt[1] - (ac.get("sink", 0) * 0) - oy) * z
                    if ys > CAPTION_Y:
                        errs.append(f"tomada {i+1}: base de '{ac['src'].split('/')[-1]}' em y≈{ys:.0f}% na tela, sob a legenda (máx. {CAPTION_Y:.0f}%) [V10]"); break
    print(("FAIL " if errs else "PASS ") + sid, "; ".join(errs))
    fails += bool(errs)
if total:
    pct = 100 * info / total
    ok = pct <= 20
    print(("PASS" if ok else "FAIL") + f" cota mapa/texto/doc sem cena: {pct:.0f}% de {total:.0f}s (máx. 20%)")
    fails += not ok
sys.exit(1 if fails else 0)
