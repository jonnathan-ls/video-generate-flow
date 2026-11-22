#!/usr/bin/env python3
"""Valida o plano de tomadas de cada cena (protocols/shot-planning.md, protocols/scene-production.md, R18).
Uso: shot_check.py scenes_spec.json props-dir [S02 S03 ...]
Lê os tempos resolvidos de props-dir/<cena>.json ('spec') quando existem.
Falha se: faltar tomada, tomada > 7 s, média > 6 s, buraco, tipo repetido, < 3 camadas, sem movimento/cue,
>2 s sem objeto em movimento numa tomada com cena (R18/V9), base de ator sob a legenda (V10),
ou se mapa/texto/doc sem cena passar de 20% do tempo das cenas checadas.
Física (mistakes.md 2026-11-21): ator que se desloca > 3% exige 'faces' (left|right|none: lado do nariz no PNG original; none = objeto sem frente)
e 'on' (water|road|floor|ground|air). FAIL se a direção efetiva (faces, invertido por flip) contradiz o sinal de Δx, ou se um ator fora do ar
entra descendo (Δy > 4% com |Δy| > 0,5·|Δx|) sem grow/scale1. O gate de visão é orchestra/fisica.sh."""
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

ONS = ("water", "road", "floor", "ground", "air")

def physics(ac, aid):
    pts = [ac["from"]] + ([ac["to"]] if ac.get("to") else []) + list(ac.get("path", []))[1:]
    if ac.get("path"): pts = list(ac["path"])
    if len(pts) < 2: return []
    name = ac["src"].split("/")[-1].rsplit(".", 1)[0]
    far = max(max(abs(p[0] - pts[0][0]), abs(p[1] - pts[0][1])) for p in pts)
    if far <= 3: return []
    out = []; tag = f"{aid} {name}"
    faces, on = ac.get("faces"), ac.get("on")
    if faces not in ("left", "right", "none"): out.append(f"{tag}: sem 'faces' (left|right|none)")
    if on not in ONS: out.append(f"{tag}: sem 'on' ({'|'.join(ONS)})")
    dx = pts[-1][0] - pts[0][0]
    if faces in ("left", "right") and abs(dx) > 3:
        eff = faces if not ac.get("flip") else ("left" if faces == "right" else "right")
        if (dx > 0) != (eff == "right"):
            out.append(f"{tag}: nariz para a {'esquerda' if eff == 'left' else 'direita'} e move para a {'direita' if dx > 0 else 'esquerda'} (Δx {dx:+.0f}%)")
    if on in ONS and on != "air" and not (ac.get("grow") or (ac.get("scale1") not in (None, 1, 1.0))):
        for p0, p1 in [(pts[0], pts[-1])] + list(zip(pts, pts[1:])):
            ddx, ddy = p1[0] - p0[0], p1[1] - p0[1]
            if ddy > 4 and abs(ddy) > 0.5 * abs(ddx):
                out.append(f"{tag}: entra pelo alto (Δy {ddy:.0f}%)"); break
    return out

# Física determinística (2026-11-22): faixas de chão/água/céu medidas uma vez por fundo (orchestra/tools/faixas.py).
# A base do ator tem de cair dentro da faixa do seu 'on'. Pega pé na água, barco no cais e gente sobre telhado sem chamar modelo.
_FX = pathlib.Path(__file__).resolve().parents[2] / "studio/remotion/public/vietna/faixas.json"
FAIXAS = json.loads(_FX.read_text()) if _FX.exists() else {}
TOL = 3.0

def band_errors(scn):
    fb = FAIXAS.get(str(scn.get("bg", "")).split("/")[-1])
    if not fb: return []
    out = []
    for ac in scn.get("actors", []):
        on, name = ac.get("on"), ac["src"].split("/")[-1].rsplit(".", 1)[0]
        if on not in ("road", "ground", "floor", "water", "air") or ac.get("blend"): continue
        pts = [ac["from"]] + ([ac["to"]] if ac.get("to") else []) + list(ac.get("path", []))
        pts = [p for p in pts if 0 <= p[0] <= 100]  # só o trecho em quadro
        if on == "air":
            lim = fb.get("ceu_ate")
            if lim is not None and any(p[1] - ac.get("h", 0) > lim + TOL for p in pts):
                out.append(f"'{name}' voa abaixo do céu livre (ceu_ate {lim:.0f}%)")
            continue
        if on == "floor" and fb.get("mesa"):
            yb, x0, x1 = fb["mesa"]; band, bx = [yb - 6, yb + 6], [x0, x1]
        elif on == "water":
            band, bx = fb.get("agua"), fb.get("agua_x") or [0, 100]
        else:
            band, bx = fb.get("chao"), fb.get("chao_x") or [0, 100]
        if not band:
            out.append(f"'{name}' em '{on}', mas o fundo não tem essa faixa"); continue
        for p in pts:
            if not (band[0] - TOL <= p[1] <= band[1] + TOL) or not (bx[0] - TOL <= p[0] <= bx[1] + TOL):
                out.append(f"'{name}' com base em ({p[0]:.0f}%, {p[1]:.0f}%) fora da faixa '{on}' y{band[0]:.0f}–{band[1]:.0f} x{bx[0]:.0f}–{bx[1]:.0f}"); break
    return out

fails = 0; info = 0.0; total = 0.0
for sid, sc0 in spec.items():
    if only and sid not in only: continue
    pf = props / f"{sid}.json"
    if not pf.exists(): print("SKIP", sid, "(sem props)"); continue
    errs = []
    pj = json.load(open(pf)); dur = pj.get("durationSec", 0); total += dur
    sc = pj.get("spec") or sc0
    shots = sc.get("shots") or []
    if sc.get("kind") == "map": info += dur
    n_ac = 0
    for sh in sc.get("shots") or []:
        for ac in (sh.get("scene") or {}).get("actors", []):
            n_ac += 1
            for m in physics(ac, f"a{n_ac:02d}"):
                print(f"FAIL {sid} {m}"); errs.append("física: " + m.split(":")[0])
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
            for m in band_errors(scn): errs.append(f"tomada {i+1}: {m} [física por faixa]")
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
