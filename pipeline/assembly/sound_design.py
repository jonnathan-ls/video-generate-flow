#!/usr/bin/env python3
"""Sound design 100% sintetizado (sem samples de terceiros, sem licença a verificar).

Entrada: scenes.json + words.json + narration.wav (24 kHz)
Saída:   <out>/mix.wav  (narração + trilha + ambientes + SFX, com ducking sob a voz)
         <out>/fx.json  (eventos de impacto em segundos, lidos pela camada visual para sincronizar flash/zoom/tremor)

Uso: .venv/bin/python pipeline/assembly/sound_design.py scenes.json words.json narration.wav saida/
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 24000
RNG = np.random.default_rng(7)


def t_axis(d: float) -> np.ndarray:
    return np.arange(int(d * SR)) / SR


def fft_band(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def noise(d: float, lo: float = 20, hi: float = 11000) -> np.ndarray:
    n = RNG.standard_normal(int(d * SR))
    n = fft_band(n, lo, hi)
    return n / (np.max(np.abs(n)) or 1)


def decay(d: float, tau: float, attack: float = 0.002) -> np.ndarray:
    t = t_axis(d)
    return np.minimum(1, t / attack) * np.exp(-t / tau)


def saw(f: float, d: float, detune: float = 0.0) -> np.ndarray:
    t = t_axis(d)
    return 2 * ((t * (f + detune)) % 1.0) - 1


# ---------- SFX ----------
def whoosh(d: float = 0.7) -> np.ndarray:
    t = t_axis(d)
    lo, mid, hi = noise(d, 80, 500), noise(d, 500, 2500), noise(d, 2500, 9000)
    bump = lambda c, w: np.exp(-((t / d - c) ** 2) / (2 * w * w))
    out = lo * bump(0.25, 0.18) + mid * bump(0.5, 0.18) + hi * bump(0.75, 0.15)
    return out * np.sin(np.pi * t / d) ** 1.5 * 0.9


def impact(d: float = 2.4) -> np.ndarray:
    t = t_axis(d)
    f = 30 + 70 * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(d, 0.9)
    burst = fft_band(noise(d), 40, 900) * decay(d, 0.22, 0.001) * 1.0
    crack = noise(0.08, 2000, 10000) * np.exp(-t_axis(0.08) / 0.015)
    out = sub + burst
    out[: len(crack)] += crack * 0.7
    return out


def hit(d: float = 0.9) -> np.ndarray:
    t = t_axis(d)
    f = 50 + 70 * np.exp(-t * 14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(d, 0.22) + noise(d, 300, 2500) * decay(d, 0.04) * 0.5


def drum(d: float = 0.5, accent: float = 1.0) -> np.ndarray:
    t = t_axis(d)
    f = 70 + 80 * np.exp(-t * 20)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(d, 0.12) + noise(d, 200, 1800) * decay(d, 0.03) * 0.5) * accent


def thud(d: float = 1.2) -> np.ndarray:
    t = t_axis(d)
    f = 45 + 35 * np.exp(-t * 9)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(d, 0.45)


def tick(d: float = 0.05) -> np.ndarray:
    return noise(d, 1500, 9000) * decay(d, 0.008, 0.0005) * 0.6


def bell(d: float = 5.0, f0: float = 196.0) -> np.ndarray:
    t = t_axis(d)
    out = np.zeros_like(t)
    for ratio, amp, tau in ((1, 1, 3.0), (2.0, 0.6, 2.2), (2.76, 0.5, 1.6), (4.07, 0.35, 1.0), (5.4, 0.2, 0.7)):
        out += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / tau)
    return out * np.minimum(1, t / 0.004) * 0.5


def swell(d: float = 3.0, root: float = 146.83) -> np.ndarray:
    t = t_axis(d)
    out = np.zeros_like(t)
    for ratio in (1, 1.5, 2, 2.5):
        out += saw(root * ratio, d, 0.6) + saw(root * ratio, d, -0.6)
    out = fft_band(out, 50, 500)
    return out / np.max(np.abs(out)) * (t / d) ** 2 * np.sin(np.pi * np.minimum(1, t / d * 1.0) * 0.5 + 0.0) * 0.8


def riser(d: float = 1.2) -> np.ndarray:
    t = t_axis(d)
    return fft_band(noise(d, 400, 9000), 400, 9000) * (t / d) ** 2.5


def draw_sweep(d: float) -> np.ndarray:
    """Traço de linha sendo desenhada: ruído fino com varredura ascendente suave."""
    t = t_axis(d)
    n = noise(d, 3000, 10000)
    lo, hi = fft_band(n, 3000, 5000), fft_band(n, 5000, 10000)
    k = t / d
    env = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.25)
    return (lo * (1 - k) + hi * k) * env


def _ease_inout(x: np.ndarray) -> np.ndarray:
    """cubic-bezier(0.65,0,0.35,1), a MESMA curva do traço da rota no Remotion (E.inOut)."""
    u = np.linspace(0, 1, 2000)
    bx = 3 * (1 - u) ** 2 * u * 0.65 + 3 * (1 - u) * u ** 2 * 0.35 + u ** 3
    by = 3 * (1 - u) * u ** 2 * 1.0 + u ** 3
    return np.interp(x, bx, by)


def eased_sweep(d: float) -> np.ndarray:
    """Traço de rota que segue o movimento REAL da linha: amplitude = velocidade da curva, timbre sobe com o progresso."""
    t = t_axis(d)
    prog = _ease_inout(t / d)
    vel = np.gradient(prog, 1 / SR) * d  # 0 nas pontas, máx. no meio
    vel = vel / (vel.max() or 1)
    n = noise(d, 2500, 10000)
    lo, hi = fft_band(n, 2500, 4500), fft_band(n, 4500, 10000)
    tail = np.minimum(1, (d - t) / 0.05)
    return (lo * (1 - prog) + hi * prog) * np.sqrt(vel) * tail


def arrive(d: float = 0.6) -> np.ndarray:
    """Reforço de chegada da linha ao destino: batida grave curta + nota clara."""
    t = t_axis(d)
    body = np.sin(2 * np.pi * (110 - 40 * t / d) * t) * decay(d, 0.16, 0.003)
    tone = np.sin(2 * np.pi * 880 * t) * decay(d, 0.12, 0.002) * 0.45
    return body * 0.9 + tone


def paper(d: float = 0.35) -> np.ndarray:
    """Papel deslizando: ruído suave de banda média, entra e sai rápido."""
    t = t_axis(d)
    return fft_band(noise(d, 600, 5000), 600, 5000) * np.sin(np.pi * np.minimum(1, t / d)) ** 2


def pin(d: float = 0.3) -> np.ndarray:
    t = t_axis(d)
    return (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 1980 * t)) * decay(d, 0.07, 0.002) * 0.5


def level_voice(v: np.ndarray) -> np.ndarray:
    """Nivelamento suave da narração: reduz quedas de volume (máx. +4 dB / −3 dB) sem achatar a fala."""
    w = int(0.4 * SR)
    rms = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, mode="same"))
    speech = rms > 0.1 * rms.max()
    target = np.median(rms[speech])
    g = np.ones_like(v)
    g[speech] = np.clip(target / rms[speech], 10 ** (-3 / 20), 10 ** (4 / 20))
    s = int(0.3 * SR)
    g = np.convolve(g, np.ones(s) / s, mode="same")
    return v * g


# ---------- beds ----------
def drone(d: float) -> np.ndarray:
    out = np.zeros(int(d * SR))
    t = t_axis(d)
    for f in (36.7, 73.4, 110.0, 146.8, 174.6):  # Ré menor
        out += saw(f, d, 0.4) * 0.5 + saw(f, d, -0.4) * 0.5
    out = fft_band(out, 30, 420)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)
    return out / np.max(np.abs(out)) * lfo


def waves(d: float) -> np.ndarray:
    t = t_axis(d)
    return noise(d, 50, 380) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t))


def rain(d: float) -> np.ndarray:
    return noise(d, 3000, 11000) * 0.8


def murmur(d: float) -> np.ndarray:
    t = t_axis(d)
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t + 1.7 * np.sin(2 * np.pi * 0.7 * t))
    return noise(d, 250, 1800) * am


# ---------- sons de movimento (procedurais, licença própria, R13) ----------
def footsteps(d: float, rate: float = 1.9, n: int = 6) -> np.ndarray:
    """Passos de uma coluna andando: n pessoas fora de fase, batida curta grave + raspado no chão."""
    out = np.zeros(int(d * SR))
    rng = np.random.default_rng(11)
    for k in range(n):
        t = rng.uniform(0, 1 / rate)
        while t < d - 0.12:
            st = drum(0.12, 0.6) * 0.5 + noise(0.12, 300, 3500) * decay(0.12, 0.02) * 0.6
            place(out, st * rng.uniform(0.6, 1.0), t, 1.0)
            t += 1 / rate * rng.uniform(0.95, 1.05)
    return out / (np.max(np.abs(out)) or 1)


def engine(d: float, f0: float = 38.0) -> np.ndarray:
    """Motor de navio: ronco grave com pulsação lenta dos pistões."""
    t = t_axis(d)
    body = saw(f0, d, 0.3) * 0.6 + saw(f0 * 2, d, -0.4) * 0.3
    body = fft_band(body, 25, 300)
    puls = 0.75 + 0.25 * np.sin(2 * np.pi * (f0 / 8) * t)
    out = body / (np.max(np.abs(body)) or 1) * puls + noise(d, 60, 400) * 0.25
    return out / (np.max(np.abs(out)) or 1)


def prop_plane(d: float, f0: float = 95.0) -> np.ndarray:
    """Avião a hélice (bimotor) passando: zumbido com batimento entre os motores e efeito Doppler + aproximação/afastamento."""
    t = t_axis(d)
    k = t / d
    doppler = 1 + 0.06 * (0.5 - k)
    ph1 = 2 * np.pi * np.cumsum(f0 * doppler) / SR
    ph2 = 2 * np.pi * np.cumsum((f0 + 2.3) * doppler) / SR
    tone = np.sign(np.sin(ph1)) * 0.5 + np.sign(np.sin(ph2)) * 0.5
    tone = fft_band(tone, 60, 1600)
    out = tone / (np.max(np.abs(tone)) or 1) + noise(d, 200, 2500) * 0.35
    env = np.exp(-((k - 0.5) ** 2) / 0.08)
    return out * (0.25 + 0.75 * env)


def rotor(d: float, rate: float = 4.6) -> np.ndarray:
    """Helicóptero: batida das pás (blade slap) + turbina aguda baixa."""
    out = np.zeros(int(d * SR))
    t = 0.0
    while t < d - 0.1:
        place(out, (noise(0.08, 80, 900) * decay(0.08, 0.025)) + thud(0.08) * 0.6, t, 1.0)
        t += 1 / rate
    tt = t_axis(d)
    whine = np.sin(2 * np.pi * 1850 * tt) * 0.04 + noise(d, 2000, 6000) * 0.05
    out = out / (np.max(np.abs(out)) or 1) + whine
    k = tt / d
    return out * (0.35 + 0.65 * np.sin(np.pi * np.clip(k, 0, 1)) ** 0.7)


def jeep(d: float) -> np.ndarray:
    """Jipe passando: motor de 4 cilindros em marcha baixa + ruído de pneus na terra."""
    t = t_axis(d)
    f = 28 + 4 * np.sin(2 * np.pi * 0.3 * t)
    pulses = np.maximum(0, np.sin(2 * np.pi * np.cumsum(f) / SR)) ** 6
    body = fft_band(pulses + noise(d, 80, 600) * 0.15, 30, 900)
    gravel = noise(d, 1500, 6000) * 0.12
    out = body / (np.max(np.abs(body)) or 1) + gravel
    k = t / d
    return out * (0.3 + 0.7 * np.exp(-((k - 0.5) ** 2) / 0.1))


def crane(d: float) -> np.ndarray:
    """Guindaste: guincho elétrico (zumbido que sobe e desce) + tilintar de corrente."""
    t = t_axis(d)
    k = t / d
    f = 110 + 60 * np.sin(np.pi * k)
    hum = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * 0.2
    out = hum * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3)
    rng = np.random.default_rng(4)
    for _ in range(int(d * 5)):
        place(out, tick(0.04) * rng.uniform(0.3, 0.8), rng.uniform(0, d - 0.05), 1.0)
    return out


def crowd(d: float) -> np.ndarray:
    """Multidão ao ar livre: murmúrio largo com ondas de voz (sem palavras inteligíveis)."""
    t = t_axis(d)
    base = noise(d, 200, 2400)
    swell_ = 0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t + 0.5) * np.sin(2 * np.pi * 0.11 * t)
    babble = np.zeros_like(t)
    rng = np.random.default_rng(9)
    for _ in range(14):
        f0 = rng.uniform(140, 320)
        am = np.maximum(0, np.sin(2 * np.pi * rng.uniform(2, 4.5) * t + rng.uniform(0, 6))) ** 2
        babble += np.sin(2 * np.pi * f0 * t) * am * 0.08
    out = base * swell_ + babble
    return out / (np.max(np.abs(out)) or 1)


def cheer(d: float = 2.5) -> np.ndarray:
    """Aclamação da multidão: subida rápida e queda lenta."""
    t = t_axis(d)
    env = np.minimum(1, t / 0.35) * np.exp(-np.maximum(0, t - 0.6) / 1.2)
    return crowd(d) * env


def typewriter(d: float, cps: float = 9.0) -> np.ndarray:
    """Máquina de escrever: teclas (clique metálico) em ritmo humano irregular."""
    out = np.zeros(int(d * SR))
    rng = np.random.default_rng(21)
    t = 0.02
    while t < d - 0.05:
        key = noise(0.05, 1200, 8000) * decay(0.05, 0.006, 0.0005) + hit(0.05) * 0.25
        place(out, key * rng.uniform(0.6, 1.0), t, 1.0)
        t += rng.uniform(0.6, 1.4) / cps
    return out / (np.max(np.abs(out)) or 1)


def carriage_bell(d: float = 0.6) -> np.ndarray:
    """Sininho do fim de linha da máquina de escrever."""
    return bell(d, 1760.0) * 0.6


def stamp(d: float = 0.5) -> np.ndarray:
    """Carimbo ou selo batendo no papel sobre a mesa: baque de madeira + estalo."""
    return thud(d) * 0.8 + noise(d, 400, 4000) * decay(d, 0.015, 0.0005) * 0.7


def camera_flash(d: float = 0.6) -> np.ndarray:
    """Flash de câmera de imprensa dos anos 1950: estalo do obturador + pop da lâmpada."""
    t = t_axis(d)
    click = noise(0.03, 1500, 9000) * decay(0.03, 0.004, 0.0003)[: int(0.03 * SR)]
    pop = noise(d, 300, 6000) * decay(d, 0.05, 0.001) * 0.6
    out = pop
    out[: len(click)] += click
    return out


def flips(d: float, n: int = 10) -> np.ndarray:
    """Folhas de calendário arrancadas em sequência."""
    out = np.zeros(int(d * SR))
    for k in range(n):
        place(out, paper(0.18) * (0.6 + 0.4 * np.sin(k)), k * (d - 0.2) / max(1, n - 1), 1.0)
    return out / (np.max(np.abs(out)) or 1)


def domino_clacks(n: int = 7, step: float = 0.3) -> np.ndarray:
    """Peças de dominó caindo uma sobre a outra."""
    out = np.zeros(int((n * step + 0.4) * SR))
    for k in range(n):
        c = noise(0.12, 900, 5000) * decay(0.12, 0.008, 0.0005) + hit(0.12) * 0.15
        place(out, c, k * step + step * 0.9, 1.0)
    return out / (np.max(np.abs(out)) or 1)


def fire_crackle(d: float) -> np.ndarray:
    cr = noise(d, 1500, 7000) * 0.25 + noise(d, 60, 300) * 0.35
    rng = np.random.default_rng(3)
    for _ in range(int(d * 9)):
        i0 = int(rng.uniform(0, max(0.01, d - 0.06)) * SR)
        cr[i0:i0 + 300] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(len(cr[i0:i0 + 300])) / 40.0)
    return cr / (np.max(np.abs(cr)) or 1)


def gunfire(d: float) -> np.ndarray:
    out = np.zeros(int(d * SR))
    rng = np.random.default_rng(5)
    t = 0.0
    while t < d - 0.1:
        g = hit(0.15) * 0.3; g[: len(tick(0.05))] += tick(0.05) * 3
        place(out, g, t, 1.0)
        t += rng.uniform(0.12, 0.35)
    return out / (np.max(np.abs(out)) or 1)


def flag_flap(d: float) -> np.ndarray:
    """Bandeira tremulando ao vento: tecido batendo + vento."""
    t = t_axis(d)
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.6 * t + np.sin(2 * np.pi * 0.4 * t)))
    return noise(d, 150, 1800) * am * 0.8 + noise(d, 40, 300) * 0.3


# ---------- mix ----------
def place(buf: np.ndarray, snd: np.ndarray, t: float, gain: float) -> None:
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(snd))
    buf[i:j] += snd[: j - i] * gain


def bed(buf: np.ndarray, snd_fn, a: float, b: float, gain: float, fade: float = 0.6) -> None:
    d = b - a
    s = snd_fn(d)
    n = len(s)
    env = np.ones(n)
    k = int(fade * SR)
    env[:k] = np.linspace(0, 1, k)
    env[-k:] = np.linspace(1, 0, k)
    place(buf, s * env, a, gain)


def main() -> int:
    """Perfil contido (rubrics/sound-fx.md): poucos eventos, todos com motivo, voz sempre à frente."""
    scenes_p, words_p, narr_p, out = map(Path, sys.argv[1:5])
    sc = {s["id"]: s for s in json.loads(scenes_p.read_text())["scenes"]}
    words = json.loads(words_p.read_text())["words"]
    voice, sr = sf.read(narr_p)
    assert sr == SR, f"narração a {sr} Hz; esperado {SR}"
    dur = sc["S09"]["end"] + 1.0
    n = int(dur * SR)
    v = np.zeros(n)
    v[: len(voice)] = voice if voice.ndim == 1 else voice[:, 0]
    v = level_voice(v)
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / "voice_leveled.wav", v, SR)

    def wt(word: str) -> float:
        return [w["start"] for w in words if w["word"].lower().strip(".,…") == word][0]

    music, amb, sfx = np.zeros(n), np.zeros(n), np.zeros(n)
    events: list[dict] = []

    def ev(t: float, kind: str, reason: str, visual: bool = True) -> None:
        events.append({"t": round(t, 3), "kind": kind, "reason": reason, "visual": visual})

    # trilha: drone baixo e contínuo; dois swells que acompanham chegada e título
    place(music, drone(dur), 0, 0.5)
    place(music, swell(3.2), sc["S07"]["start"] - 0.4, 0.4)
    place(music, swell(4.0, 110.0), sc["S09"]["start"] - 0.8, 0.5)

    # ambientes que existem na cena (e só nela)
    bed(amb, waves, 0, sc["S02"]["start"] + 0.5, 0.7)                       # porto
    bed(amb, murmur, sc["S02"]["start"] - 0.3, sc["S03"]["end"], 0.4)        # multidão
    bed(amb, rain, sc["S05"]["start"] - 0.4, sc["S05"]["end"] + 0.3, 0.35)   # chuva no porto vazio
    bed(amb, waves, sc["S07"]["start"] - 0.5, sc["S07"]["end"], 0.55)        # baía

    # 1) abertura: um sino distante (lugar e hora)
    place(sfx, bell(3.0), 0.1, 0.09)
    ev(0.1, "bell", "scene:S01", False)
    # 2) salto de lugar: cena → mapa (único whoosh)
    place(sfx, whoosh(0.6), sc["S04"]["start"] - 0.18, 0.16)
    ev(sc["S04"]["start"], "whoosh", "scene:S04")
    # 3) a palavra "fugindo": o carimbo cai (impacto 1)
    t = sc["S03"]["impact"]["at"]
    place(sfx, riser(0.9), t - 0.9, 0.25)
    place(sfx, impact(), t, 0.9)
    ev(t, "impact", "word:fugindo")
    # 4) marcha de Junot: quatro batidas suaves, sem acento visual
    for k in range(4):
        tt = sc["S04"]["start"] + 0.5 + k * 1.0
        place(sfx, drum(0.5, 1.0 if k == 0 else 0.75), tt, 0.14)
        ev(tt, "drum", "scene:S04", False)
    # 5) "vazio": o silêncio é o efeito. Trilha e ambiente caem
    t = wt("vazio")
    ev(t, "silence", "word:vazio", False)
    hole = np.ones(n)
    a, b = int((t - 0.2) * SR), int((t + 1.0) * SR)
    ramp = np.linspace(1, 0.12, int(0.25 * SR))
    hole[a : a + len(ramp)] = ramp
    hole[a + len(ramp) : b - len(ramp)] = 0.12
    hole[b - len(ramp) : b] = ramp[::-1]
    music, amb = music * hole, amb * hole
    # 6) chegada à Bahia: um sino mais claro
    place(sfx, bell(3.0, 261.6), sc["S07"]["start"] + 0.2, 0.09)
    ev(sc["S07"]["start"] + 0.2, "bell", "scene:S07", False)
    # 7) frase final: um único acento em NUNCA MAIS (aparece 0,37 s após o início da cena)
    t = sc["S08"]["start"] + 0.37
    place(sfx, hit(), t, 0.35)
    ev(t, "hit", "scene:S08")
    # 8) título: impacto 2 (e nenhum outro efeito depois)
    t = sc["S09"]["start"] + 0.05
    place(sfx, impact(1.2), t, 0.7)
    ev(t, "impact", "scene:S09")
    # o selo de cera cai (movimento visível aos 70 quadros do título)
    place(sfx, thud(0.8), t - 0.05 + 70 / 30, 0.35)
    ev(t - 0.05 + 70 / 30, "hit", "scene:S09@2.33")
    # sons ligados ao movimento da tela (rubrica F11)
    s4, s6 = sc["S04"]["start"], sc["S06"]["start"]
    place(sfx, draw_sweep(3.47), s4 + 6 / 30, 0.13)            # linha da marcha de Junot
    ev(s4 + 6 / 30, "sweep", "motion:S04", False)
    place(sfx, draw_sweep(6.0), s6 + 10 / 30, 0.11)            # rota Lisboa → Salvador
    ev(s6 + 10 / 30, "sweep", "motion:S06", False)
    place(sfx, pin(), s6 + 175 / 30, 0.16)                     # o navio chega a Salvador
    ev(s6 + 175 / 30, "pin", "motion:S06@5.83", False)
    for sid, f in (("S01", 14), ("S05", 14), ("S07", 18)):     # etiqueta de lugar/data entra
        place(sfx, tick(), sc[sid]["start"] + f / 30, 0.12)
        ev(sc[sid]["start"] + f / 30, "label", f"scene:{sid}@{f / 30:.2f}", False)
    # 9) o nome "Napoleão": só um empurrão suave de câmera, sem som
    ev(wt("napoleão"), "punch", "word:napoleão")

    # ducking forte: trilha e ambiente a ~20% quando há voz
    env = np.abs(v)
    k = int(0.25 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    env = np.clip(env / (np.percentile(env, 95) or 1), 0, 1)
    duck = 1 - 0.82 * env
    mix = v * 1.0 + (music * 0.10 + amb * 0.05) * duck + sfx * 0.40
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / "mix.wav", mix, SR)
    (out / "fx.json").write_text(json.dumps({"duration": dur, "events": sorted(events, key=lambda e: e["t"])}, indent=1, ensure_ascii=False))
    print(f"mix.wav {dur:.1f}s · {len(events)} eventos → {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
