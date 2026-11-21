#!/usr/bin/env python3
"""Spec das cenas do LOTE 1 do vídeo "Vietnã" (S02, S03, S04, S06 novas + acabamento do S05), padrão R18.
Atualiza SÓ essas cenas em scenes_spec.json. Plano em lab/plan-vietna-lote1.md; prompts em lab/flow-prompts-lote1.md.

Uso: python3 pipeline/assembly/vietna_spec_lote1.py <pasta-do-video> <pasta-props>
Os tempos de movimento são calculados das palavras com tempo (props/<cena>.json) para que a chegada/impacto caia
na palavra (±0,4 s, V9). Rótulos e números usam `*_word` (resolvidos por vietna_prep.py).
Coordenadas: % da tela, base (pé/casco/borda de baixo) do objeto. Caminhada a ~0,7 altura de corpo por segundo (N3).
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

VIDEO, PROPS = Path(sys.argv[1]), Path(sys.argv[2])
L3 = ["céu/fundo", "cena em planos", "atmosfera+rótulo"]


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


def words(sid):
    return json.loads((PROPS / f"{sid}.json").read_text())["words"]


def mkW(sid):
    ws = words(sid)

    def W(word, off=0.0):
        nth = 1
        if "#" in word:
            word, k = word.rsplit("#", 1); nth = int(k)
        hits = [w["start"] for w in ws if norm(w["word"]) == norm(word)]
        return round(hits[nth - 1] + off, 2)
    return W


def walk_to(x0, h, ar_unused, t0, t1, bh_per_s=0.7):
    """posição final de uma coluna que anda a bh_per_s alturas de corpo por segundo (h em % da altura)."""
    return round(x0 + bh_per_s * h * 1080 / 1920 * (t1 - t0), 1)


def shot(kind, a, b, cue, motion, scene, **kw):
    d = {"kind": kind, "start_s": round(a, 2), "end_s": round(b, 2), "cue": cue, "motion": motion, "layers": L3, "scene": scene}
    d.update(kw)
    return d


# ---------------------------------------------------------------- S02
def s02():
    W = mkW("S02")
    dur = json.loads((PROPS / "S02.json").read_text())["durationSec"]
    t_emp = W("empréstimo")
    sh = []
    # 1. pasta do empréstimo desliza na mesa na palavra "empréstimo"; número na tela em "150"
    sh.append(shot("stat", 0.0, 4.4, "na mesma reunião em que falou de um empréstimo de 150 milhões de dólares", "a pasta do empréstimo desliza na mesa",
                   {"bg": "vietna/desk_top.jpg", "z0": 1.03, "z1": 1.09, "ox": "62%", "oy": "50%",
                    "actors": [{"src": "vietna/pasta.png", "from": [130, 58], "to": [68, 56], "h": 42, "t0_s": round(t_emp - 0.75, 2), "t1_s": round(t_emp + 0.1, 2), "ease": "out", "rot": [9, -3],
                                "label": "EMPRÉSTIMO", "sfx": "paper", "sfx_at_word": "empréstimo", "sfx_at_offset": -0.6, "note": "a pasta do empréstimo desliza na mesa"}]},
                   stat={"big": "US$ 150 milhões", "label": "empréstimo ao Brasil", "big_at_word": "150", "label_at_word": "milhões"}))
    # 2. o embaixador entra na sala (passos) em "embaixador"
    t0, t1 = W("embaixador", -0.5), 8.35
    sh.append(shot("plate", 4.4, 8.4, "o embaixador fez uma pressão muito forte", "o embaixador entra na sala e anda até a mesa",
                   {"bg": "vietna/office_65b.jpg", "z0": 1.03, "z1": 1.08, "ox": "45%", "oy": "70%",
                    "actors": [{"src": "vietna/diplomata.png", "from": [24, 66], "to": [47, 82], "h": 32, "scale1": 1.22, "t0_s": t0, "t1_s": t1, "ease": "linear",
                                "slices": 1, "ar": 0.513, "gait": 7, "legs": 0.45, "bob": 3, "rock": 0.6, "sfx": "step1", "note": "passos do embaixador entrando na sala"}]},
                   names=[{"text": "LINCOLN GORDON", "sub": "embaixador dos EUA no Brasil", "at_word": "embaixador", "out_s": 8.2}]))
    # 3. coluna de soldados brasileiros (1965) cruza o pátio do quartel em "tropas"
    a, b = 8.4, 11.9
    h = 26
    sh.append(shot("stat", a, b, "por tropas brasileiras no Vietnã", "coluna de soldados brasileiros marcha no pátio do quartel",
                   {"bg": "vietna/quartel_65.jpg", "z0": 1.03, "z1": 1.08, "ox": "40%", "oy": "75%",
                    "actors": [{"src": "vietna/soldados_br65.png", "from": [54, 81], "to": [walk_to(54, h, 0, a, b), 81], "h": h, "t0_s": a, "t1_s": b, "ease": "linear",
                                "slices": 6, "ar": 2.166, "bob": 3, "rock": 1.0, "sfx": "steps", "note": "passos da coluna de soldados brasileiros"}]},
                   stat={"big": "TROPAS", "label": "o pedido: soldados brasileiros no Vietnã", "big_at_word": "tropas", "label_at_word": "brasileiras"}))
    # 4. as duas pastas se separam em "separados" e voltam a se juntar em "mesma conversa"
    ts, tm = W("separados"), W("mesma#2")
    ps = [11.9, round(ts - 0.4, 2), round(ts + 0.3, 2), round(tm - 0.4, 2), round(tm + 0.25, 2)]
    sh.append(shot("plate", 11.9, 17.2, "tratou os dois assuntos separados, mas o pedido foi feito na mesma conversa", "as duas pastas se afastam e depois voltam a se juntar",
                   {"bg": "vietna/desk_top2.jpg", "z0": 1.02, "z1": 1.07, "ox": "50%", "oy": "55%",
                    "actors": [
                        {"src": "vietna/pasta.png", "from": [42, 82], "path": [[42, 82], [42, 82], [27, 82], [27, 82], [40, 81]], "path_s": ps, "h": 40, "rot": [-4, -4], "label": "EMPRÉSTIMO",
                         "sfx": "paper", "sfx_at_word": "separados", "sfx_at_offset": -0.3, "note": "as pastas se afastam: assuntos tratados à parte"},
                        {"src": "vietna/pasta.png", "from": [58, 80], "path": [[58, 80], [58, 80], [73, 80], [73, 80], [60, 83]], "path_s": ps, "h": 40, "rot": [5, 5], "label": "TROPAS",
                         "sfx": "paper", "sfx_at_word": "mesma#2", "sfx_at_offset": -0.2, "note": "as pastas voltam a se juntar: mesma conversa"}]}))
    # 5. a máquina de escrever bate o telegrama que relata a conversa
    sh.append(shot("plate", 17.2, 19.7, "o relato da conversa: telegrama do Rio, 17 de dezembro; o que o presidente respondeu?", "a máquina de escrever bate o cabeçalho do telegrama",
                   {"bg": "vietna/typewriter_65.jpg", "z0": 1.12, "z1": 1.18, "ox": "56%", "oy": "35%",
                    "fx": [{"kind": "typing", "x": 56.4, "y": 27, "w": 400, "size": 34, "paper": False, "lines": ["RIO DE JANEIRO", "17 DEZ 1965", "TELEGRAMA 1456"], "from_s": 17.3, "to_s": 19.4,
                            "note": "teclas batendo o telegrama 1456"}]}))
    # 6. o memorando chega em "resposta", o selo cai em "documento", e a pasta sai de cena em "fim"
    tr, td, tf = W("resposta"), W("documento"), W("fim")
    pth = [[-30, 82], [50, 80], [50, 80], [128, 80]]
    pts = [19.7, round(tr + 0.35, 2), round(tf - 0.35, 2), round(tf + 0.45, 2)]
    sh.append(shot("plate", 19.7, 23.6, "a resposta está no documento, e vamos lê-lo no fim deste vídeo", "o memorando chega à mesa, o selo cai e a pasta é guardada para o fim",
                   {"bg": "vietna/desk_top.jpg", "z0": 1.06, "z1": 1.02, "ox": "50%", "oy": "60%",
                    "actors": [
                        {"src": "vietna/pasta.png", "from": pth[0], "path": pth, "path_s": pts, "h": 54, "rot": [-2, -2], "label": "MEMORANDO",
                         "sfx": "paper", "sfx_at_word": "resposta", "note": "o memorando desliza na mesa"},
                        {"src": "vietna/selo.png", "from": [60, 74], "path": [[60, 74], [60, 74], [138, 74]], "path_s": [round(td, 2), pts[2], pts[3]], "h": 16, "appear_s": round(td - 0.3, 2),
                         "grow": [1.9, 1.0], "t1_s": round(td, 2), "sfx": "stamp", "sfx_at_word": "documento", "note": "o selo de cera cai sobre o memorando"}]},
                   names=[{"text": "MEMORANDO DE 31/12/1965", "sub": "a resposta: no fim do vídeo", "at_word": "documento,", "out_s": 23.4}]))
    # 7. calendário volta de 1965 para 1945 em "Antes"
    ta = W("Antes")
    sh.append(shot("plate", 23.6, dur, "antes, é preciso saber como os EUA chegaram a esse pedido", "o calendário volta de 1965 a 1945, folhas arrancadas",
                   {"bg": "vietna/office_65.jpg", "z0": 1.35, "z1": 1.42, "ox": "74%", "oy": "32%",
                    "fx": [{"kind": "calendar", "x": 74, "y": 33, "w": 250, "from": 1965, "to": 1945, "from_s": round(ta + 0.05, 2), "to_s": round(W("pedido#2", 0.2), 2),
                            "note": "folhas do calendário voltam no tempo"}]}))
    return {"kind": "shots", "shots": sh, "vignette": 0.3}


# ---------------------------------------------------------------- S03
def s03():
    W = mkW("S03")
    dur = json.loads((PROPS / "S03.json").read_text())["durationSec"]
    h = 24
    sh = [
        shot("date", 0.0, 4.2, "a história começa vinte anos antes, num discurso em Hanói", "moradores de Hanói caminham com bandeiras pela avenida",
             {"bg": "vietna/hanoi_45b.jpg", "z0": 1.03, "z1": 1.08, "ox": "50%", "oy": "75%",
              "actors": [{"src": "vietna/civis_45.png", "from": [-14, 84], "to": [walk_to(-14, h, 0, 0.1, 4.2), 84], "h": h, "t0_s": 0.1, "t1_s": 4.2, "ease": "linear",
                          "slices": 6, "ar": 2.232, "bob": 3, "rock": 1.0, "sfx": "steps", "note": "passos de moradores a caminho da praça"}]},
             date={"top": "HANÓI", "big": "1945"}),
        shot("plate", 4.2, 7.2, "e termina quase dez anos depois, em Saigon", "helicóptero cruza o céu de Saigon",
             {"bg": "vietna/saigon_75.jpg", "z0": 1.02, "z1": 1.07, "ox": "50%", "oy": "60%",
              "actors": [{"src": "vietna/ch53.png", "from": [-14, 33], "to": [66, 27], "h": 15, "t0_s": 4.2, "t1_s": 7.2, "ease": "linear", "rot": [2, 0],
                          "rotor": [55, 4, 92], "bob": 3, "period": 50, "sfx": "rotor", "note": "pás do helicóptero sobre Saigon"}]},
             names=[{"text": "SAIGON", "sub": "1975", "at_word": "Saigon", "out_s": 7.1}]),
        shot("stat", 7.2, dur, "no meio, há um lugar para o Brasil", "a bandeira do Brasil tremula no mastro, na baía do Rio",
             {"bg": "vietna/rio_65.jpg", "z0": 1.03, "z1": 1.08, "ox": "30%", "oy": "40%",
              "actors": [{"src": "vietna/bandeira_br.png", "from": [23.2, 21], "h": 16, "slices": 8, "ar": 1.4286, "wave": 6, "tint": "saturate(0.8) sepia(0.15)", "sfx": "flag",
                          "note": "bandeira do Brasil batendo ao vento"}]},
             stat={"big": "BRASIL", "label": "1965", "big_at_word": "Brasil", "label_at_word": "Brasil"}),
    ]
    return {"kind": "shots", "shots": sh, "vignette": 0.3}


# ---------------------------------------------------------------- S04
def s04():
    W = mkW("S04")
    dur = json.loads((PROPS / "S04.json").read_text())["durationSec"]
    h = 24
    crowd = lambda x, y, hh, flip=False: {"src": "vietna/multidao_costas.png", "from": [x, y], "h": hh, "slices": 12, "ar": 2.867, "wave": 9, "flip": flip,
                                          "under_caption_ok": True, "sfx": "crowd", "note": "multidão na praça de Ba Dinh"}
    t_us, t_fr = W("americana"), W("Homem")
    sh = [
        shot("date", 0.0, 4.4, "2 de setembro de 1945, em Hanói", "moradores caminham para a praça",
             {"bg": "vietna/hanoi_a.jpg", "z0": 1.03, "z1": 1.08, "ox": "50%", "oy": "75%",
              "actors": [{"src": "vietna/civis_45.png", "from": [116, 84], "to": [walk_to(116, h, 0, 0.0, 4.4, -0.7), 84], "h": h, "t0_s": 0.0, "t1_s": 4.4, "ease": "linear",
                          "slices": 6, "ar": 2.232, "bob": 3, "rock": 1.0, "flip": True, "sfx": "steps", "note": "passos de moradores a caminho da praça"}]},
             date={"top": "HANÓI · 2 DE SETEMBRO", "big": "1945"}),
        shot("plate", 4.4, 7.3, "Ho Chi Minh lê a declaração de independência", "a multidão de costas ergue os braços diante do palanque",
             {"bg": "vietna/palanque_45.jpg", "z0": 1.04, "z1": 1.12, "ox": "50%", "oy": "55%",
              "actors": [crowd(26, 106, 36), crowd(76, 107, 37, True)]},
             names=[{"text": "HO CHI MINH", "sub": "lê a declaração de independência", "at_word": "Ho", "out_s": 7.1}]),
        shot("stat", 7.3, 10.6, "uma multidão de cerca de 500 mil pessoas", "punhos e bandeiras se agitam na multidão",
             {"bg": "vietna/crowd_c.jpg", "z0": 1.04, "z1": 1.1, "ox": "50%", "oy": "50%",
              "actors": [crowd(30, 112, 34), crowd(80, 113, 35, True)]},
             stat={"top": "PRAÇA BA ĐÌNH", "big": "≈ 500 mil", "label": "pessoas, segundo estimativas", "big_at_word": "500", "big_offset": -0.1, "label_at_word": "pessoas,"}),
        shot("stat", 10.6, 13.3, "na praça de Ba Dinh", "a bandeira vermelha com estrela amarela tremula no alto do mastro",
             {"bg": "vietna/mastro_45.jpg", "z0": 1.03, "z1": 1.09, "ox": "30%", "oy": "6%",
              "actors": [{"src": "vietna/bandeira_vn.png", "from": [30.4, 24], "h": 18, "slices": 8, "ar": 1.667, "wave": 7, "sfx": "flag", "note": "bandeira tremulando sobre a praça"}]},
             stat={"big": "Ba Đình", "label": "praça de Hanói, 2 de setembro de 1945", "big_at_word": "praça", "label_at_word": "Dinh."}),
        shot("plate", 13.3, 19.2, "o texto se inspira na Declaração americana e na Declaração dos Direitos do Homem", "as duas declarações deslizam sobre a mesa",
             {"bg": "vietna/desk_45.jpg", "z0": 1.03, "z1": 1.08, "ox": "40%", "oy": "50%",
              "actors": [
                  {"src": "vietna/decl_us.jpg", "from": [-25, 80], "to": [30, 78], "h": 46, "rot": [-14, -5], "t0_s": round(t_us - 0.75, 2), "t1_s": round(t_us + 0.05, 2), "ease": "out",
                   "sfx": "paper", "sfx_at_word": "americana", "sfx_at_offset": -0.6, "note": "a Declaração americana desliza na mesa"},
                  {"src": "vietna/decl_fr.jpg", "from": [128, 82], "to": [62, 79], "h": 46, "rot": [12, 4], "t0_s": round(t_fr - 0.85, 2), "t1_s": round(t_fr + 0.05, 2), "ease": "out",
                   "sfx": "paper", "sfx_at_word": "Direitos", "note": "a Declaração francesa desliza na mesa"}]},
             names=[{"text": "DECLARAÇÃO DE INDEPENDÊNCIA", "sub": "Estados Unidos, 1776", "at_word": "americana", "out_s": 16.3},
                    {"text": "DIREITOS DO HOMEM E DO CIDADÃO", "sub": "França, 1789", "at_word": "Direitos", "out_s": 19.0}]),
        shot("plate", 19.2, dur, "ele pede que os aliados reconheçam o novo país", "a multidão ergue os braços sob as bandeiras",
             {"bg": "vietna/crowd_a.jpg", "z0": 1.08, "z1": 1.02, "ox": "50%", "oy": "40%",
              "actors": [crowd(24, 110, 33), crowd(74, 111, 34, True)],
              "sfx": [{"kind": "cheer", "at_s": W("reconheçam"), "at_cue": "reconheçam#1", "note": "a multidão reage ao pedido de reconhecimento"}]}),
    ]
    return {"kind": "shots", "shots": sh, "vignette": 0.3}


# ---------------------------------------------------------------- S06
def s06():
    W = mkW("S06")
    dur = json.loads((PROPS / "S06.json").read_text())["durationSec"]
    tdoc = W("Documentos")
    sh = [
        shot("plate", 0.0, 3.0, "os Estados Unidos ficam do lado francês", "cargueiro chega ao cais de Saigon",
             {"bg": "vietna/port_50.jpg", "z0": 1.03, "z1": 1.08, "ox": "40%", "oy": "65%",
              "actors": [{"src": "vietna/cargueiro.png", "from": [-24, 67], "to": [30, 67], "h": 27, "t0_s": 0.0, "t1_s": round(W("francês", 0.3), 2), "ease": "out",
                          "bob": 1.5, "rock": 0.3, "period": 80, "wake": True, "sink": 0.2, "smoke": [44, 22], "sfx": "engine", "note": "motor do cargueiro chegando ao cais"}]},
             names=[{"text": "INDOCHINA FRANCESA", "sub": "1950", "at_word": "francês", "out_s": 2.9}]),
        shot("plate", 3.0, 5.8, "segundo os Documentos do Pentágono", "a pasta dos Documentos do Pentágono desliza na mesa",
             {"bg": "vietna/desk_top2.jpg", "z0": 1.08, "z1": 1.03, "ox": "50%", "oy": "60%",
              "actors": [{"src": "vietna/pasta.png", "from": [-30, 84], "to": [48, 80], "h": 50, "rot": [-10, -2], "t0_s": round(tdoc - 0.4, 2), "t1_s": round(tdoc + 0.3, 2), "ease": "out",
                          "label": "PENTÁGONO", "sfx": "paper", "sfx_at_word": "Documentos", "sfx_at_offset": -0.3, "note": "a pasta dos Documentos do Pentágono desliza na mesa"}]},
             names=[{"text": "DOCUMENTOS DO PENTÁGONO", "sub": "estudo encomendado em 1967", "at_word": "Pentágono,", "out_s": 5.7}]),
        shot("stat", 5.8, 10.2, "a ajuda americana começa com 10 milhões de dólares em 1950", "o guindaste iça os caixotes do navio para o cais",
             {"bg": "vietna/port_50.jpg", "z0": 1.1, "z1": 1.04, "ox": "55%", "oy": "40%",
              "actors": [
                  {"src": "vietna/cargueiro.png", "from": [30, 67], "h": 27, "bob": 1.5, "rock": 0.3, "period": 80, "sink": 0.2, "smoke": [44, 22], "sfx": "none"},
                  {"src": "vietna/caixotes.png", "from": [40, 54], "path": [[40, 54], [40, 30], [62, 30], [66, 60]], "path_s": [5.9, 7.0, 7.9, 8.9], "h": 17, "rope": True,
                   "sfx": "crane", "note": "guincho do guindaste iça a ajuda americana"}]},
             stat={"big": "US$ 10 milhões", "label": "em 1950", "big_at_word": "10", "label_at_word": "1950"}),
        shot("stat", 10.2, 16.2, "em 1954, já paga 78% do custo da guerra francesa", "avião de transporte cruza o vale e lança suprimentos de paraquedas",
             {"bg": "vietna/vale_54.jpg", "z0": 1.02, "z1": 1.07, "ox": "50%", "oy": "40%",
              "actors": [
                  {"src": "vietna/c47.png", "from": [-14, 24], "to": [118, 17], "h": 13, "t0_s": 10.2, "t1_s": 15.2, "ease": "linear", "sfx": "plane", "note": "motores do avião de transporte sobre o vale"},
                  {"src": "vietna/paraquedas.png", "from": [30, 25], "to": [33, 62], "h": 15, "appear_s": 11.3, "t0_s": 11.3, "t1_s": 15.6, "ease": "out", "bob": 3, "rock": 3, "period": 60, "sfx": "none"},
                  {"src": "vietna/paraquedas.png", "from": [46, 24], "to": [48, 60], "h": 14, "appear_s": 12.0, "t0_s": 12.0, "t1_s": 16.1, "ease": "out", "bob": 3, "rock": 3, "period": 55, "sfx": "none"},
                  {"src": "vietna/paraquedas.png", "from": [61, 22], "to": [64, 58], "h": 13, "appear_s": 12.7, "t0_s": 12.7, "t1_s": 16.2, "ease": "out", "bob": 3, "rock": 3, "period": 65, "sfx": "none"}]},
             stat={"top": "1954", "big": "78%", "label": "do custo da guerra francesa", "big_at_word": "78%", "label_at_word": "custo", "bar": {"frac": 0.78, "at_word": "78%"}}),
        shot("stat", 16.2, 21.0, "o Miller Center fala em mais de três quartos", "jipe do exército francês cruza a estrada do acampamento",
             {"bg": "vietna/vale_54.jpg", "z0": 1.14, "z1": 1.08, "ox": "40%", "oy": "70%",
              "actors": [{"src": "vietna/jipe.png", "from": [-10, 75], "to": [58, 74], "h": 15, "tint": "brightness(1.35) contrast(1.05)", "t0_s": 16.3, "t1_s": 20.9, "ease": "linear", "bob": 1.5, "period": 9,
                          "emit": {"at": [8, 92], "color": "rgba(150,130,100,0.45)", "dir": [-1.2, -0.4], "size": 0.9, "rate": 30}, "sfx": "jeep", "note": "jipe passando na estrada de terra"}]},
             stat={"big": "mais de 3/4", "label": "Miller Center, Univ. da Virgínia", "big_at_word": "três", "label_at_word": "Miller"}),
        shot("plate", 21.0, 27.0, "em 7 de abril de 1954, numa entrevista, o presidente Eisenhower", "flashes das câmeras disparam na entrevista",
             {"bg": "vietna/imprensa_54.jpg", "z0": 1.03, "z1": 1.1, "ox": "50%", "oy": "35%",
              "fx": [{"kind": "flash", "x": 14, "y": 30, "at_s": 21.45, "size": 200},
                     {"kind": "flash", "x": 88, "y": 27, "at_s": 22.9, "size": 220},
                     {"kind": "flash", "x": 84, "y": 55, "at_word": "entrevista,", "offset": -0.04, "size": 240, "note": "flash de câmera na entrevista"},
                     {"kind": "flash", "x": 17, "y": 30, "at_word": "Eisenhower", "offset": -0.04, "size": 220, "note": "flash quando Eisenhower fala"}]},
             names=[{"text": "7 DE ABRIL DE 1954", "sub": "entrevista coletiva", "at_word": "abril", "out_s": 25.4},
                    {"text": "DWIGHT EISENHOWER", "sub": "presidente dos EUA", "at_word": "Eisenhower", "out_s": 26.9}]),
        shot("plate", 27.0, dur, "o princípio do dominó: se um país cai, os vizinhos tendem a cair", "a primeira peça balança e cai; as vizinhas caem em sequência",
             {"bg": "vietna/mesa_54.jpg", "z0": 1.03, "z1": 1.09, "ox": "52%", "oy": "62%", "rays": 0,
              "fx": [{"kind": "dominoes", "x": 52, "y": 66, "n": 7, "w": 68, "wobble_word": "dominó:", "fall_word": "cai,", "fall_offset": -0.05, "step_s": 0.3,
                      "note": "as peças do dominó caem uma sobre a outra"}]},
             names=[{"text": "PRINCÍPIO DO DOMINÓ", "sub": "Eisenhower, 7 de abril de 1954", "at_word": "princípio", "out_s": dur - 0.1}]),
    ]
    return {"kind": "shots", "shots": sh, "vignette": 0.3}


# ---------------------------------------------------------------- S05 (acabamento)
def s05(old):
    W = mkW("S05")
    sh = old["shots"]
    # tomada 1: navio de Saigon (mantida); fumaça na boca da chaminé, espuma visível
    a1 = sh[0]["scene"]["actors"][0]
    a1.update({"smoke": [52, 21], "sfx": "engine", "note": "motor do navio britânico chegando"})
    # tomada 2: coluna no cais a ~0,7 altura/s (era 1,4)
    c2 = sh[1]["scene"]["actors"][0]
    c2.update({"from": [31, 55.5], "to": [walk_to(31, 10, 0, 6.5, 9.0), 55.5], "sfx": "steps", "note": "passos da coluna francesa no cais"})
    # tomada 3: porto de Haiphong (HAI46). O navio atraca em "desembarcam" e a coluna desce ao cais.
    td = W("desembarcam")
    h = 11
    sh[2] = shot("plate", 9.0, 15.8, "em março de 1946, cerca de 15 mil soldados franceses desembarcam no Tonkin", "o navio de transporte atraca no cais de Haiphong e a tropa desce ao cais",
                 {"bg": "vietna/haiphong_46.jpg", "z0": 1.03, "z1": 1.1, "ox": "45%", "oy": "68%",
                  "actors": [
                      {"src": "vietna/ship.png", "from": [-20, 74], "to": [39, 74], "h": 24, "t0_s": 9.1, "t1_s": round(td - 0.05, 2), "ease": "out", "bob": 1.2, "rock": 0.25, "period": 90,
                       "wake": True, "sink": 0.2, "smoke": [52, 21], "land": True, "land_note": "o navio encosta no cais", "sfx": "engine", "note": "motor do navio entrando no porto"},
                      {"src": "vietna/soldiers_46.png", "from": [59, 64.5], "to": [walk_to(59, h, 0, td + 0.1, 15.8), 64.5], "h": h, "appear_s": round(td, 2), "t0_s": round(td + 0.1, 2), "t1_s": 15.8,
                       "ease": "linear", "slices": 6, "ar": 2.104, "bob": 2, "rock": 1.0, "sfx": "steps", "note": "passos da tropa descendo ao cais"}]},
                 names=[{"text": "HAIPHONG · MARÇO DE 1946", "sub": "≈ 15 mil soldados franceses chegam ao Tonkin", "at_word": "março", "out_s": 15.5}])
    # tomada 4: usina. Fumaça na boca das chaminés (clara contra o céu), explosão e fogo do Flow, apagão real (bg2)
    s4 = sh[3]["scene"]
    tu = W("usina")
    s4["bg2"] = "vietna/bg_plant_off.jpg"
    s4["bg2_at_word"] = "usina"
    s4["bg2_offset"] = 0.15
    s4["fx"] = [
        {"kind": "searchlight", "x": 20, "y": 70},
        {"kind": "searchlight", "x": 80, "y": 72, "phase": 2.5},
        {"kind": "smoke", "x": 40.2, "y": 7, "w": 46, "from_s": 15.8, "color": "rgba(150,146,150,0.55)"},
        {"kind": "smoke", "x": 59.8, "y": 12.5, "w": 40, "from_s": 15.8, "color": "rgba(150,146,150,0.55)"},
        {"kind": "tracers", "x": 56, "y": 70, "w": 700, "from_word": "Viet#1", "from_offset": 0.0, "to_word": "usina", "to_offset": 0.0, "note": "rajadas de tiro antes do ataque à usina"},
        {"kind": "smoke", "x": 50, "y": 40, "w": 120, "from_word": "usina", "from_offset": 0.9, "color": "rgba(60,56,58,0.6)"},
    ]
    s4["actors"] = [
        {"src": "vietna/explosao.jpg", "from": [51, 72], "h": 52, "blend": "screen", "tint": "contrast(1.5) brightness(0.92)", "appear_s": round(tu + 0.02, 2), "t1_s": round(tu + 0.9, 2), "grow": [0.35, 1.1], "fade_s": round(tu + 0.85, 2),
         "sfx": "boom", "sfx_at_word": "usina", "sfx_at_offset": 0.05, "note": "explosão na usina elétrica de Hanói"},
        {"src": "vietna/chamas.jpg", "from": [50, 47], "h": 22, "blend": "screen", "tint": "contrast(1.5) brightness(0.95)", "appear_s": round(tu + 0.4, 2), "t1_s": round(tu + 1.4, 2), "grow": [0.5, 1.0], "flicker": 0.06,
         "sfx": "fire", "note": "fogo no telhado da usina"},
    ]
    # tomada 5: rua; coluna acima da legenda (N2), velocidade coerente (N3), fogo do Flow
    s5 = sh[4]["scene"]
    h5 = 24
    s5.update({"z0": 1.04, "z1": 1.1, "oy": "70%"})
    s5["actors"] = [
        {"src": "vietna/chamas.jpg", "from": [24, 66], "h": 16, "blend": "screen", "tint": "contrast(1.5) brightness(0.95)", "flicker": 0.07, "sfx": "fire", "note": "fogo nas fachadas da rua"},
        {"src": "vietna/chamas.jpg", "from": [80, 58], "h": 12, "blend": "screen", "tint": "contrast(1.5) brightness(0.95)", "flicker": 0.08, "sfx": "none"},
        {"src": "vietna/soldiers_46.png", "from": [38, 82], "to": [walk_to(38, h5, 0, 23.0, 28.4), 82], "h": h5, "t0_s": 23.0, "t1_s": 28.4, "ease": "linear",
         "slices": 6, "ar": 2.104, "bob": 4, "rock": 1.0, "sfx": "steps", "note": "passos da coluna francesa na rua"},
    ]
    s5["fx"] = [{"kind": "smoke", "x": 40, "y": 40, "w": 150, "from_s": 22.8, "color": "rgba(70,64,64,0.6)"}]
    return old


def main():
    p = VIDEO / "scenes_spec.json"
    spec = json.loads(p.read_text(encoding="utf-8"))
    spec["S02"], spec["S03"], spec["S04"], spec["S06"] = s02(), s03(), s04(), s06()
    spec["S05"] = s05(spec["S05"])
    p.write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
    for k in ("S02", "S03", "S04", "S05", "S06"):
        print(k, len(spec[k]["shots"]), "tomadas:", " | ".join(f"{s['start_s']:.1f}-{s['end_s']:.1f}" for s in spec[k]["shots"]))


if __name__ == "__main__":
    main()
