#!/usr/bin/env python3
"""Validador de som e efeitos (rubrics/sound-fx.md, regra R16).

Uso:
  fx_check.py fx.json scenes.json words.json [--voice narration.wav --mix mix.wav] [--asr roteiro.md]

--voice/--mix : checa F7 (voz ≥ 10 dB acima do resto em ≥ 95% das janelas de fala; mediana ≥ 16 dB)
--asr         : checa F8 (erro de transcrição do mix ≤ erro da voz + 2 pontos); rode `source pipeline/env.sh` antes
"""
from __future__ import annotations

import argparse
import difflib
import json
import math
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import Report  # noqa: E402

HEAVY = {"impact", "boom"}
MINOR = {"drum", "sweep", "pin", "label", "paper", "ambient", "bell", "silence"}  # ambientes e detalhes: não entram no espaçamento (F4)


def norm_word(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


def check_events(fx: dict, scenes: list[dict], words: list[dict], r: Report) -> None:
    ev = fx["events"]
    dur = fx.get("duration") or max(e["t"] for e in ev)
    minutes = dur / 60.0

    missing = [e for e in ev if not e.get("reason")]
    if missing:
        r.err(f"F1: {len(missing)} de {len(ev)} eventos sem 'reason' (ex.: t={missing[0]['t']}s {missing[0]['kind']})")

    heavy = [e for e in ev if e["kind"] in HEAVY]
    cap = max(2, math.ceil(3 * minutes))
    if len(heavy) > cap:
        r.err(f"F2: {len(heavy)} impactos pesados em {dur:.0f}s (máx. {cap}): " + ", ".join(f"{e['t']}s" for e in heavy))

    wh = [e for e in ev if e["kind"] == "whoosh"]
    cap_w = max(1, math.ceil(dur / 15))
    if len(wh) > cap_w:
        r.err(f"F3: {len(wh)} whooshes em {dur:.0f}s (máx. {cap_w}; só em saltos de lugar/tempo)")

    seq = sorted((e for e in ev if e["kind"] not in MINOR), key=lambda e: e["t"])
    for a, b in zip(seq, seq[1:]):
        if b["t"] - a["t"] < 1.0:
            r.err(f"F4: eventos a {b['t'] - a['t']:.2f}s um do outro: {a['kind']}@{a['t']} e {b['kind']}@{b['t']}")

    by_kind: dict[str, list[float]] = {}
    for e in ev:
        by_kind.setdefault(e["kind"], []).append(e["t"])
    for k, ts in by_kind.items():
        ts.sort()
        for i, t0 in enumerate(ts):
            n = sum(1 for t in ts[i:] if t - t0 <= 10)
            if n > 4:
                r.err(f"F5: '{k}' repetido {n}x em 10 s a partir de {t0}s")
                break

    sc = {s["id"]: s for s in scenes}
    ws = [(norm_word(w["word"]), w["start"]) for w in words]
    for e in ev:
        reason = e.get("reason", "")
        if reason.startswith("word:"):
            target = norm_word(reason[5:].split("#")[0])
            cand = [t for w, t in ws if w == target]
            if "#" in reason:
                nth = int(reason.rsplit("#", 1)[1])
                cand = cand[nth - 1:nth]
            if not cand:
                r.err(f"F6: palavra '{target}' do reason não existe no roteiro (t={e['t']}s)")
            elif min(abs(e["t"] - t) for t in cand) > (0.9 if "#" in reason else 0.3) + 1e-6:
                r.err(f"F6: {e['kind']}@{e['t']}s está a {min(abs(e['t'] - t) for t in cand):.2f}s da palavra '{target}' (máx. 0,3)")
        elif reason.startswith(("scene:", "motion:")):
            sid, _, off = reason.split(":", 1)[1].partition("@")
            s = sc.get(sid)
            if not s:
                r.err(f"F6: cena '{sid}' não existe (t={e['t']}s)")
                continue
            if off:
                lo, hi = s["start"] + float(off) - 0.3 - 1e-6, s["start"] + float(off) + 0.3 + 1e-6
            else:
                lo, hi = (s["start"] - 0.3, s["start"] + 0.6) if e.get("visual", True) else (s["start"] - 0.3, s["end"] + 0.3)
            if not lo <= e["t"] <= hi:
                r.err(f"F6: {e['kind']}@{e['t']}s fora da janela da cena {s['id']} ({lo:.1f}–{hi:.1f}s)")

    for s in scenes:
        if s.get("kind") in ("map", "march", "shots") and not any(e["kind"] == "sweep" and (e.get("scene") == s["id"] or e.get("reason", "").endswith(s["id"]) or f":{s['id']}@" in e.get("reason", "")) for e in ev):
            r.err(f"F11: a cena {s['id']} ({s['kind']}) tem movimento de mapa/rota sem som associado (sweep)")

    print(f"Eventos: {len(ev)} em {dur:.0f}s · pesados {len(heavy)} · whooshes {len(wh)} · densidade {len(ev) / minutes:.0f}/min")


def check_voice(voice: Path, mix: Path, r: Report) -> None:
    import numpy as np
    import soundfile as sf

    v, sr = sf.read(voice)
    m, sr2 = sf.read(mix)
    v = v if v.ndim == 1 else v[:, 0]
    m = m if m.ndim == 1 else m[:, 0]
    n = min(len(v), len(m))
    v, m = v[:n], m[:n]
    a = float(np.dot(m, v) / (np.dot(v, v) or 1))
    res = m - a * v

    def band(x: "np.ndarray", lo: float = 200.0, hi: float = 4000.0) -> "np.ndarray":
        X = np.fft.rfft(x)
        f = np.fft.rfftfreq(len(x), 1 / sr)
        X[(f < lo) | (f > hi)] = 0
        return np.fft.irfft(X, len(x))

    # o que mascara a fala é o que cai na faixa da voz; grave profundo (impactos) quase não conta
    v, res = band(v), band(res)
    win = int(0.1 * sr)
    k = n // win
    vr = np.sqrt((v[: k * win].reshape(k, win) ** 2).mean(1))
    rr = np.sqrt((res[: k * win].reshape(k, win) ** 2).mean(1))
    speech = vr > 0.1 * vr.max()
    ratio = 20 * np.log10((vr + 1e-9) / (rr + 1e-9))
    bad = float(((ratio < 10) & speech).sum() / max(1, speech.sum()))
    med = float(np.median(ratio[speech]))
    print(f"F7 (faixa 200–4000 Hz): janelas de fala com voz < 10 dB acima do resto: {bad:.1%} · mediana voz/resto: {med:.1f} dB")
    if bad > 0.05:
        r.err(f"F7: {bad:.1%} das janelas de fala têm o fundo a menos de 10 dB da voz (máx. 5%)")
    if med < 16:
        r.err(f"F7: mediana voz/resto {med:.1f} dB (mín. 16 dB)")


def asr_error(audio: Path, ref: list[str]) -> float:
    import numpy as np
    from faster_whisper import WhisperModel

    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    try:
        model = WhisperModel("medium", device="cuda", compute_type="int8_float16")
        segs, _ = model.transcribe(np.frombuffer(raw, np.float32), language="pt", beam_size=5)
        hyp = [norm_word(w) for s in segs for w in s.text.split()]
    except RuntimeError:
        model = WhisperModel("medium", device="cpu", compute_type="int8")
        segs, _ = model.transcribe(np.frombuffer(raw, np.float32), language="pt")
        hyp = [norm_word(w) for s in segs for w in s.text.split()]
    return 1 - difflib.SequenceMatcher(None, ref, hyp, autojunk=False).ratio()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("fx")
    ap.add_argument("scenes")
    ap.add_argument("words")
    ap.add_argument("--voice")
    ap.add_argument("--mix")
    ap.add_argument("--asr")
    a = ap.parse_args()
    r = Report()
    fx = json.loads(Path(a.fx).read_text())
    scenes = json.loads(Path(a.scenes).read_text())["scenes"]
    words = json.loads(Path(a.words).read_text())["words"]
    check_events(fx, scenes, words, r)
    if a.voice and a.mix:
        check_voice(Path(a.voice), Path(a.mix), r)
    if a.asr and a.voice and a.mix:
        ref = [norm_word(w) for w in Path(a.asr).read_text(encoding="utf-8").split()]
        e_voice, e_mix = asr_error(Path(a.voice), ref), asr_error(Path(a.mix), ref)
        print(f"F8: erro de transcrição: voz sozinha {e_voice:.1%} · mix {e_mix:.1%} · diferença {(e_mix - e_voice) * 100:+.1f} p.p.")
        if e_mix - e_voice > 0.02:
            r.err(f"F8: o mix piora a transcrição em {(e_mix - e_voice) * 100:.1f} p.p. (máx. 2,0)")
    return r.finish("fx_check")


if __name__ == "__main__":
    sys.exit(main())
