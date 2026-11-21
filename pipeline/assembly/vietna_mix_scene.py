#!/usr/bin/env python3
"""Mix de UMA cena do vídeo "Vietnã" (perfil contido, R16): voz nivelada + trilha baixa + sons de movimento dos mapas.
Cada som tem um `reason` registrado em <saida>.events.json (lido por fx_check e pelo QA).

Uso: python3 pipeline/assembly/vietna_mix_scene.py voz/S01.wav props/S01.json saida.wav [--bed drone]
Sons: trilha `drone` contínua e baixa (-30 dB); `pin` quando um marcador aparece (-24 dB); `draw_sweep` com a duração do traço de rota (-27 dB).
Cenas com ação (kind shots + scene): o som de cada ator/efeito vem do spec (`sfx`, `note`, `sfx_at_word`); ver BED/ONE abaixo.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import sound_design as sd  # noqa: E402

SR = sd.SR


def db(x: float) -> float:
    return 10 ** (x / 20)


# ---------- sons das cenas com ação (R16/R18): vêm do spec, não de notas fixas ----------
# Cada ator ou efeito pode ter `sfx` (tipo do som) e `note` (motivo narrativo). Sem `sfx`, o tipo sai do que o ator faz
# (coluna com `slices` → passos; barco com `wake` → água e motor; `rotor` → helicóptero; `land` → encalhe).
# Camas (bed) ficam 18–24 dB abaixo da voz (D13, medido em RMS da fala); um evento por ação (D8).
BED = {  # tipo: (gerador(d), dB abaixo da voz, nota padrão)
    "steps": (lambda d: sd.footsteps(d), 20, "passos da coluna que anda na tela"),
    "step1": (lambda d: sd.footsteps(d, n=1), 21, "passos de quem anda na tela"),
    "water": (lambda d: sd.waves(d) * 0.7 + sd.engine(d) * 0.5, 20, "água e motor do barco em movimento"),
    "engine": (lambda d: sd.engine(d) * 0.8 + sd.waves(d) * 0.4, 20, "motor do navio em movimento"),
    "plane": (lambda d: sd.prop_plane(d), 19, "motores do avião passando"),
    "rotor": (lambda d: sd.rotor(d), 19, "pás do helicóptero passando"),
    "crowd": (lambda d: sd.crowd(d), 24, "multidão na praça"),  # na faixa da fala: mais baixo (F7)
    "jeep": (lambda d: sd.jeep(d), 20, "motor do jipe passando"),
    "crane": (lambda d: sd.crane(d), 20, "guincho do guindaste içando a carga"),
    "flag": (lambda d: sd.flag_flap(d), 22, "bandeira batendo ao vento"),
    "fire": (lambda d: sd.fire_crackle(d), 21, "estalo do fogo"),
    "shots": (lambda d: sd.gunfire(d), 19, "rajadas de tiro"),
    "typewriter": (lambda d: sd.typewriter(d), 19, "teclas da máquina de escrever"),
    "flips": (lambda d: sd.flips(d, 12), 20, "folhas do calendário arrancadas"),
}
ONE = {  # tipo: (gerador, ganho dB, kind do evento, nota padrão, visual)
    "paper": (lambda: sd.paper(0.5), -22, "paper", "papel desliza na mesa", False),
    "stamp": (lambda: sd.stamp(), -18, "hit", "o selo cai sobre o papel", False),
    "thud": (lambda: sd.thud(1.0), -22, "hit", "o casco encosta", False),
    "boom": (lambda: sd.impact(2.4), -18, "impact", "explosão", True),
    "flash": (lambda: sd.camera_flash(), -22, "flash", "flash de câmera dispara", True),
    "bell": (lambda: sd.carriage_bell(), -26, "bell", "sininho do fim de linha da máquina", False),
    "dominoes": (None, -20, "hit", "as peças caem uma sobre a outra", False),
    "cheer": (lambda: sd.cheer(2.5), -29, "ambient", "a multidão reage", False),
}


def scene_sounds(sh, sc):
    a0, b0 = sh["start_s"], sh["end_s"]
    out = []
    for ac in sc.get("actors", []):
        kind = ac.get("sfx")
        if kind == "none":
            continue
        if not kind:
            kind = "rotor" if ac.get("rotor") else "water" if ac.get("wake") else ("steps" if ac.get("slices", 0) > 1 else "step1") if ac.get("slices") and not ac.get("wave") else None
        if not kind:
            continue
        t0 = max(a0, ac.get("appear_s", ac.get("t0_s", a0)) if kind != "water" else a0)
        t1 = min(b0, ac.get("t1_s", b0)) if kind in ("steps", "step1", "plane", "rotor", "jeep", "crane") else b0
        cue = ac.get("sfx_at_cue")
        if kind in BED:
            out.append(("bed", kind, t0, max(t0 + 0.6, t1), ac.get("note"), None))
        elif kind in ONE:
            t = ac.get("sfx_at_s", ac.get("t1_s", t0) if kind in ("stamp", "thud") else t0)
            out.append(("one", kind, t, None, ac.get("note"), cue))
        if ac.get("land") and ac.get("t1_s"):
            out.append(("one", "thud", ac["t1_s"], None, ac.get("land_note", "o casco encosta no cais"), ac.get("t1_cue")))
    for fx in sc.get("fx", []):
        k = fx["kind"]
        if fx.get("sfx") == "none":
            continue
        if k == "explosion":
            out.append(("one", "boom", fx["at_s"], None, fx.get("note"), fx.get("at_cue")))
        elif k == "fire":
            out.append(("bed", "fire", max(a0, fx.get("from_s", a0)), b0, fx.get("note"), None))
        elif k == "tracers":
            out.append(("bed", "shots", fx["from_s"], fx["to_s"], fx.get("note", "rajadas de tiro antes do ataque"), None))
        elif k == "flash":
            out.append(("one", "flash", fx["at_s"], None, fx.get("note"), fx.get("at_cue")))
        elif k == "typing":
            out.append(("bed", "typewriter", fx["from_s"], fx["to_s"], fx.get("note"), None))
        elif k == "calendar":
            out.append(("bed", "flips", fx["from_s"], fx["to_s"], fx.get("note"), None))
        elif k == "dominoes":
            out.append(("one", "dominoes", fx["fall_s"], (fx.get("n", 7), fx.get("step_s", 0.3)), fx.get("note"), fx.get("fall_cue")))
    for extra in sc.get("sfx", []):  # som explícito da tomada: {"kind", "at_s"|"from_s"/"to_s", "note", "at_cue"}
        if extra["kind"] in BED:
            out.append(("bed", extra["kind"], extra["from_s"], extra["to_s"], extra.get("note"), None))
        else:
            out.append(("one", extra["kind"], extra["at_s"], None, extra.get("note"), extra.get("at_cue")))
    return out


def render_scene_sounds(items, mix, n, voice, ev, events):
    w = int(0.1 * SR)
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, mode="same"))
    sp = rms > 0.15 * rms.max()
    vrms = float(np.sqrt(np.mean(voice[sp] ** 2))) if sp.any() else 0.05
    beds = sorted([x for x in items if x[0] == "bed"], key=lambda x: (x[1], x[2]))
    merged = []
    for it in beds:  # mesma cama em tomadas vizinhas vira um som só (um evento por ação)
        if merged and merged[-1][1] == it[1] and it[2] - merged[-1][3] <= 0.35:
            merged[-1] = (it[0], it[1], merged[-1][2], max(merged[-1][3], it[3]), merged[-1][4] or it[4], None)
        else:
            merged.append(it)
    for _, kind, a, b, note, _c in merged:
        fn, rel, dnote = BED[kind]
        d = max(0.6, b - a)
        snd = fn(d)
        r = float(np.sqrt(np.mean(snd ** 2))) or 1.0
        snd = snd / r * vrms * db(-rel)
        k = min(len(snd) // 3, int(0.3 * SR))
        if k > 0:
            snd[:k] *= np.linspace(0, 1, k)
            snd[-k:] *= np.linspace(1, 0, k)
        buf = np.zeros(n); sd.place(buf, snd, a, 1.0); mix += buf
        ev(a, "ambient", a, f"{note or dnote} ({rel} dB abaixo da voz)")
        events[-1]["dur"] = round(d, 2)
    seen = set()
    for _, kind, t, extra, note, cue in sorted([x for x in items if x[0] == "one"], key=lambda x: x[2]):
        key = (kind, round(t, 1))
        if key in seen:
            continue
        seen.add(key)
        fn, gain, ekind, dnote, vis = ONE[kind]
        snd = sd.domino_clacks(*extra) if kind == "dominoes" else fn()
        buf = np.zeros(n); sd.place(buf, snd / (np.max(np.abs(snd)) or 1), t, 1.0); mix += buf * db(gain)
        ev(t, ekind, t, note or dnote, cue)
        events[-1]["visual"] = vis


def has_camera_move(sh) -> bool:
    """M7: o som de movimento de câmera só toca se houver movimento visível de verdade:
    `pan` ≠ 0 ou zoom (z1 vs z0) maior que 15%."""
    sc = sh.get("scene") or {}
    pan = sc.get("pan") or [0, 0]
    if any(abs(float(v)) > 0 for v in pan):
        return True
    try:
        z0 = float(sc.get("z0", 1.0)) or 1.0
        z1 = float(sc.get("z1", z0))
    except (TypeError, ValueError):
        return False
    return abs(z1 - z0) / abs(z0) > 0.15


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("voice")
    ap.add_argument("props")
    ap.add_argument("out")
    ap.add_argument("--bed", default="drone")
    a = ap.parse_args()
    props = json.loads(Path(a.props).read_text(encoding="utf-8"))
    spec = props["spec"]
    v, sr = sf.read(a.voice)
    assert sr == SR
    v = v if v.ndim == 1 else v[:, 0]
    dur = props["durationSec"] + 0.3
    n = int(dur * SR)
    voice = np.zeros(n)
    voice[: len(v)] = v
    voice = sd.level_voice(voice)
    peak = float(np.max(np.abs(voice))) or 1.0
    voice = voice / peak * db(-3)
    mix = voice.copy()
    sf.write(Path(a.out).with_suffix(".voice.wav"), voice, SR)  # stem de voz processado (para fx_check --voice)
    events = []
    bed = sd.drone(dur)
    k = int(0.8 * SR)
    env = np.ones(len(bed)); env[:k] = np.linspace(0, 1, k); env[-k:] = np.linspace(1, 0, k)
    for sh_ in spec.get("shots", []):
        sl = sh_.get("silence")
        if sl:
            a0, a1 = int(sl["at_s"] * SR), int((sl["at_s"] + sl["dur"]) * SR); fd = int(0.25 * SR)
            env[max(0, a0 - fd):a0] = np.minimum(env[max(0, a0 - fd):a0], np.linspace(1, 0, a0 - max(0, a0 - fd)))
            env[a0:a1] = 0
            env[a1:a1 + fd] = np.minimum(env[a1:a1 + fd], np.linspace(0, 1, len(env[a1:a1 + fd])))
    mix += bed * env * db(-30)
    events.append({"t": 0.0, "kind": "bed", "reason": "trilha grave contínua para dar peso à abertura, sempre sob a voz (-30 dB)", "visual": False})
    amb: list = []
    amb_w: list = []
    steps: list = []
    fires: list = []
    pins, routes, extras = list(spec.get("pins", [])), ([spec["route"]] if spec.get("route") else []), []
    scene_snd: list = []
    cam_sweep_done = False
    for sh in spec.get("shots", []):
        pins += [p for p in sh.get("pins", []) if p["at_s"] > sh["start_s"]]
        if sh.get("route"):
            routes.append(sh["route"])
        if sh.get("doc") and sh["doc"].get("at_s") is not None:
            extras.append(("paper", sh["start_s"] + 0.15, "o documento entra na tela"))
            extras.append(("hl", sh["doc"]["at_s"], "o destaque percorre a linha do documento", sh["doc"].get("at_cue")))
        if sh.get("label") or sh["kind"] == "date":
            extras.append(("label", sh["start_s"] + 0.35, "a data aparece na cartela"))
        st = sh.get("stat")
        if st:
            extras.append(("label", st["big_at_s"], st.get("note", "o destaque grande (número, nome ou lugar) aparece na tela"), st.get("big_at_cue")))
            if st.get("bar"):
                routes.append({"from_s": st["bar"]["at_s"], "to_s": st["bar"]["at_s"] + 1.33, "note": "a barra de proporção enche"})
        tl = sh.get("timeline")
        if tl:
            routes.append({"from_s": tl["draw"]["from_s"], "to_s": tl["draw"]["to_s"], "note": "a linha do tempo é traçada", "arrive": False})
            for m in tl["marks"]:
                extras.append(("pin" if m.get("accent") else "label", m["at_s"], f"marco {m['year']} aparece na linha do tempo", m.get("at_cue")))
        ch = sh.get("chart")
        if ch:
            for b in ch["bars"]:
                routes.append({"from_s": b["at_s"], "to_s": b["at_s"] + 1.0, "note": f"a barra '{b['label']}' cresce", "arrive": False})
                extras.append(("pin", b["at_s"] + 1.0, f"valor '{b['display']}' aparece"))
        ty = sh.get("typo")
        if ty:
            for k, l in enumerate(ty["lines"]):
                if k == 0 or l.get("size") == "xl":
                    extras.append(("label", l["at_s"], "texto de destaque entra na tela", l.get("at_cue")))
        if sh["kind"] == "map-zoom" and not sh.get("route") and sh.get("cam0") and sh.get("cam1") and max(sh["cam1"]["scale"] / sh["cam0"]["scale"], sh["cam0"]["scale"] / sh["cam1"]["scale"]) >= 1.25:
            routes.append({"from_s": sh["start_s"] + 0.1, "to_s": sh["start_s"] + 0.1 + 0.7 * (sh["end_s"] - sh["start_s"]), "note": "movimento de câmera do mapa", "arrive": False, "gain": -34})
        if sh.get("scene") and sh["end_s"] - sh["start_s"] >= 3.0 and not cam_sweep_done and has_camera_move(sh):
            cam_sweep_done = True
            routes.append({"from_s": sh["start_s"] + 0.1, "to_s": sh["start_s"] + 0.1 + 0.7 * (sh["end_s"] - sh["start_s"]), "note": "movimento de câmera da cena ilustrada", "arrive": False, "gain": -34})
        pl_ = sh.get("plate") or {}
        if pl_.get("name") == "blackout-hanoi" and pl_.get("at_s") is not None:
            extras.append(("hit", pl_["at_s"], pl_.get("note", "a cidade apaga na tela"), pl_.get("at_cue")))
        if sh.get("ambient") == "murmur":
            amb.append((sh["start_s"], sh["end_s"]))
        sc = sh.get("scene")
        if sc:
            scene_snd.extend(scene_sounds(sh, sc))
        pr = sh.get("pair")
        if pr:
            for k_ in ("a", "b"):
                extras.append(("paper", pr[k_]["at_s"], f"o documento '{pr[k_]['label']}' entra na tela", pr[k_].get("at_cue")))
        dm = sh.get("domino")
        if dm:
            routes.append({"from_s": dm["fall_s"], "to_s": dm["fall_s"] + 1.9, "note": "as peças do dominó caem em sequência"})
        sw = sh.get("swap")
        if sw:
            routes.append({"from_s": sw["swap_s"] - 0.47, "to_s": sw["swap_s"], "note": "traço que risca a palavra", "arrive": False})
            extras.append(("pin", sw["swap_s"], "a palavra nova substitui a riscada"))
    scene = props.get("scene", "S01")
    def ev(t, kind, vis_t, note, cue=None):
        reason = f"word:{cue}" if cue else f"motion:{scene}@{vis_t:.2f}"
        events.append({"t": round(t, 2), "kind": kind, "reason": reason, "scene": scene, "note": note, "visual": False})
    for p in pins:
        buf = np.zeros(n); sd.place(buf, sd.pin(), p["at_s"], 1.0); mix += buf * db(-24)
        ev(p["at_s"], "pin", p["at_s"], f"marcador '{p['label']}' aparece no mapa", p.get("at_cue"))
    for r in routes:
        d = max(0.5, r["to_s"] - r["from_s"])
        buf = np.zeros(n); sd.place(buf, sd.eased_sweep(d), r["from_s"], 1.0); mix += buf * db(r.get("gain", -26))
        ev(r["from_s"], "sweep", r["from_s"], r.get("note", "som segue a velocidade real da linha de rota"))
        if r.get("arrive", True):
            buf = np.zeros(n); sd.place(buf, sd.arrive(), r["to_s"], 1.0); mix += buf * db(-22)
            ev(r["to_s"], "hit", r["to_s"], "reforço quando a linha chega ao destino")
    for a_, b_ in amb_w:
        buf = np.zeros(n); sd.bed(buf, sd.waves, a_, b_, 1.0, 0.5); mix += buf * db(-28)
        ev(a_, "ambient", a_, "água e motor sob o navio em movimento")
    for a_, b_ in steps:
        buf = np.zeros(n); tt = a_
        while tt < b_ - 0.2:
            sd.place(buf, sd.drum(0.18, 0.35), tt, 1.0); tt += 0.52
        mix += buf * db(-30)
        ev(a_, "ambient", a_, "passos da coluna de soldados")
    for a_, b_ in fires:
        d_ = max(0.5, b_ - a_); cr = sd.noise(d_, 1500, 7000) * 0.25
        rng = np.random.default_rng(3)
        for _ in range(int(d_ * 9)):
            i0 = int(rng.uniform(0, d_ - 0.06) * SR); cr[i0:i0 + 300] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(300) / 40.0)
        buf = np.zeros(n); sd.place(buf, cr, a_, 1.0); mix += buf * db(-31)
        ev(a_, "ambient", a_, "estalo de fogo baixo")
    for a_, b_ in amb:
        buf = np.zeros(n); sd.bed(buf, sd.murmur, a_, b_, 1.0, 0.5); mix += buf * db(-36)
        ev(a_, "ambient", a_, "murmúrio de multidão baixo, sob a voz")
    for kind, t, note, *cu in extras:
        cue_ = cu[0] if cu else None
        buf = np.zeros(n)
        if kind == "boom":
            sd.place(buf, sd.impact(2.4), t, 1.0); mix += buf * db(-18); ev(t, "impact", t, note, cue_); events[-1]["visual"] = True
        elif kind == "shots":
            t_end = cu[1] if len(cu) > 1 else t + 1.0; tt = t; rng2 = np.random.default_rng(5)
            while tt < t_end:
                sd.place(buf, sd.tick(0.05) * 3, tt, 1.0); tt += rng2.uniform(0.12, 0.35)
            mix += buf * db(-30); ev(t, "ambient", t, note)
        elif kind == "thud":
            sd.place(buf, sd.thud(1.0), t, 1.0); mix += buf * db(-24); ev(t, "hit", t, note, cue_)
        elif kind == "hit":
            sd.place(buf, sd.impact(1.6), t, 1.0); mix += buf * db(-24); ev(t, "impact", t, note, cue_)
        elif kind == "pin":
            sd.place(buf, sd.pin(), t, 1.0); mix += buf * db(-27); ev(t, "pin", t, note, cue_)
        elif kind == "paper":
            sd.place(buf, sd.paper(), t, 1.0); mix += buf * db(-28); ev(t, "paper", t, note, cue_)
        elif kind == "hl":
            sd.place(buf, sd.eased_sweep(0.5), t, 1.0); mix += buf * db(-27); ev(t, "sweep", t, note, cue_)
        else:
            sd.place(buf, sd.pin(), t, 1.0); mix += buf * db(-26); ev(t, "label", t, note, cue_)
    render_scene_sounds(scene_snd, mix, n, voice, ev, events)
    for sh_ in spec.get("shots", []):
        sl = sh_.get("silence")
        if sl:
            ev(sl["at_s"], "silence", sl["at_s"], f"silêncio de {sl['dur']:.1f} s: a trilha cai antes do trecho que pesa")
    pk = float(np.max(np.abs(mix)))
    if pk > 0.95:
        mix = mix / pk * 0.95
    tmp = Path(a.out).with_suffix(".raw.wav")
    sf.write(tmp, mix, SR)
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.7:LRA=7:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    js = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.7:LRA=7:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
          f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", ln, "-ar", "48000", str(a.out)], check=True)
    tmp.unlink()
    vs = Path(a.out).with_suffix(".voice.wav"); vt = vs.with_suffix(".tmp.wav"); vs.rename(vt)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(vt), "-af", ln, "-ar", "48000", str(vs)], check=True); vt.unlink()
    Path(a.out).with_suffix(".events.json").write_text(json.dumps(events, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"mix {dur:.1f}s · {len(events)} eventos → {a.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
