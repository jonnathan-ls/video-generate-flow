#!/usr/bin/env python3
"""Specs do lote 2 (S07-S11): colagem com ação. Grava só S07..S11 em scenes_spec.json.
Tempos são segundos da cena (palavras de render/props/Sxx.json). x = centro, y = base do ator (% da tela)."""
import json, pathlib
V = pathlib.Path("channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json")
AR = dict(cedula=0.77, gun_crew=2.97, vm_column=2.27, fr_column54=2.27, arvn_col=2.07, us_col63=2.0, monks=2.24, crowd_run=3.02,
          police_line=2.125, icc_trio=1.9, advisor=0.544, h21=2.83, steamer=2.85, sampan=2.13, sedan_54=2.92, limo_61=3.96,
          us_truck=2.16, jeep_us=1.99, cyclo=1.64, farmer_buffalo=2.01, camera=1.9, flag_bud=1.8, flag_sv=1.74, flag_vn=1.71)
def A(n, **k):
    src = "vietna/" + n[3:] + ".png" if n.startswith("../") else f"vietna/l2_{n}.png"
    a = {"src": src, "ar": AR.get(n, 1.5), "sfx": "none"}; a.update(k); return a
def walk(n, h, x0, x1, t0, t1, y, note, flip=False, **k):
    h = min(h * 1.45, 44)
    d = {"from": [x0, y], "to": [x1, y], "h": h, "t0_s": t0, "t1_s": t1, "ease": "linear", "slices": 12, "gait": 9,
         "flip": flip, "sfx": "steps", "note": note, "faces": "right", "on": "road"}; d.update(k); return A(n, **d)
def drive(n, h, x0, x1, t0, t1, y, note, sfx="jeep", ease="linear", on="road", **k):
    h = h * (1.0 if n == "h21" else 1.5)
    d = {"from": [x0, y], "to": [x1, y], "h": h, "t0_s": t0, "t1_s": t1, "ease": ease, "bob": 1,
         "sfx": sfx, "note": note, "faces": "right", "on": on}; d.update(k); return A(n, **d)
FX = pathlib.Path("studio/remotion/public/vietna/faixas.json")
FAIXAS = json.loads(FX.read_text()) if FX.exists() else {}
CAP = 82.0  # base máxima antes do zoom (legenda)
def snap(bgfile, a):
    """Compilador: põe a base do ator dentro da faixa medida do fundo (chão, água, mesa, céu). Física por construção."""
    fb = FAIXAS.get(bgfile); on = a.get("on")
    if not fb or on not in ("road", "ground", "floor", "water", "air"): return a
    if on == "air":
        lim = fb.get("ceu_ate")
        if lim is None: return a
        fix = lambda y: min(y, lim - 2 + a.get("h", 0))
    else:
        band = (fb.get("agua") if on == "water" else ([fb["mesa"][0] - 3, fb["mesa"][0] + 3] if on == "floor" and fb.get("mesa") else fb.get("chao")))
        if not band: return a
        lo, hi = band[0] + 1, min(band[1] - 1, CAP)
        if lo > hi: a["_faixa_aviso"] = f"faixa {band} abaixo da legenda"; return a
        fix = lambda y: max(lo, min(hi, y))
    for k in ("from", "to"):
        if k in a: a[k] = [a[k][0], round(fix(a[k][1]), 1)]
    if "path" in a: a["path"] = [[p[0], round(fix(p[1]), 1)] for p in a["path"]]
    return a
def sc(bg, actors, z=(1.03, 1.1), o=("50%", "60%"), **k):
    actors = [snap(f"l2_{bg}.jpg", a) for a in actors]
    d = {"bg": f"vietna/l2_{bg}.jpg", "z0": z[0], "z1": z[1], "ox": o[0], "oy": o[1], "actors": actors}; d.update(k); return d
def shot(kind, a, b, cue, motion, scene, **k):
    d = {"kind": kind, "start_s": a, "end_s": b, "cue": cue, "motion": motion, "layers": ["céu/fundo", "cena em planos", "atmosfera+rótulo"], "scene": scene}; d.update(k); return d
def nm(text, sub, w, out): return [{"text": text, "sub": sub, "at_word": w, "out_s": out}]

S = {}
# ---------------- S07 (18,65 s)
S["S07"] = {"kind": "shots", "shots": [
 shot("plate", 0, 2.9, "a guerra francesa termina em Dien Bien Phu", "soldados do Viet Minh descem a encosta do vale",
  sc("dbp_valley", [walk("vm_column", 15, 22, 74, 0.2, 2.8, 80, "coluna do Viet Minh cruza o vale")], o=("50%", "70%")), names=nm("DIEN BIEN PHU", "norte do Vietnã, 1954", "Dien", 2.8)),
 shot("date", 2.9, 6.7, "de 13 de março a 7 de maio de 1954", "a equipe puxa o canhão pela trilha",
  sc("dbp_slope", [walk("gun_crew", 22, 16, 64, 3.0, 6.6, 82, "equipe do Viet Minh puxa canhão", sfx="steps")]), date={"top": "13 DE MARÇO A 7 DE MAIO", "big": "1954"}),
 shot("plate", 6.7, 11.2, "a França combate e perde para o Viet Minh", "a coluna do Viet Minh avança sobre a trincheira",
  sc("dbp_trench", [walk("vm_column", 22, 22, 74, 6.8, 11.1, 82, "coluna do Viet Minh avança", on="ground")], o=("50%", "70%")), names=nm("VIET MINH", "de Ho Chi Minh", "Viet", 11.0)),
 shot("plate", 11.2, 13.0, "a derrota decide a guerra", "a bandeira do Vietnã sobe no mastro do bunker",
  sc("dbp_bunker", [A("flag_vn", **{"from": [50, 38], "h": 12, "flag": {"amp": 14, "pole": 16, "speed": 0.3}, "appear_s": 11.5, "sfx": "flag", "note": "bandeira vitoriosa sobre o bunker"})], o=("50%", "50%"))),
 shot("plate", 13.0, 15.7, "o fim formal só vem com o acordo de Genebra", "o vapor cruza o lago de Genebra",
  sc("geneva_lake", [drive("steamer", 17, 30, 108, 13.0, 15.6, 68, "vapor no lago", sfx="engine", on="water", sink=0.15, wake=True)]), names=nm("ACORDO DE GENEBRA", "o fim formal da guerra", "acordo", 15.5)),
 shot("typo", 15.7, 18.648, "a pergunta passa a ser quem vai governar o país", "o lavrador e o búfalo cruzam o arrozal",
  sc("paddy", [walk("farmer_buffalo", 22, 20, 80, 15.8, 18.6, 82, "lavrador conduz o búfalo", sfx="steps")]),
  typo={"lines": [{"text": "a pergunta passa a ser", "at_word": "pergunta", "size": "m", "color": "brass"}, {"text": "quem vai governar o país?", "at_word": "quem", "size": "xl", "color": "paper"}]}),
]}
# ---------------- S08 (29,67 s)
S["S08"] = {"kind": "shots", "shots": [
 shot("date", 0, 4.4, "20 de julho de 1954", "o carro oficial chega ao Palácio das Nações", sc("geneva_palais", [drive("sedan_54", 14, -15, 62, 0.3, 4.2, 82, "carro oficial chega ao palácio", ease="out")]), date={"top": "20 DE JULHO", "big": "1954"}),
 shot("plate", 4.4, 8.6, "no acordo de Genebra", "a pasta do acordo desliza para a mesa", sc("polling_hall", [A("../pasta", **{"from": [40, 67], "to": [57, 66], "h": 17, "t0_s": 4.6, "t1_s": 8.3, "ease": "out", "rot": [-4, 0], "label": "GENEBRA", "sfx": "paper", "note": "pasta do acordo desliza na mesa", "faces": "none", "on": "floor"})], z=(1.03, 1.06), o=("50%", "70%")), names=nm("ACORDO DE GENEBRA", "20 de julho de 1954", "acordo#1", 8.4)),
 shot("stat", 8.6, 14.2, "zona desmilitarizada de até cinco quilômetros de cada lado da linha", "o sampan cruza o rio na linha militar", sc("benhai_bridge", [drive("sampan", 12, -12, 112, 8.7, 14.0, 78, "sampan cruza o rio Ben Hai", sfx="water", on="water", sink=0.15, wake=True)]),
  stat={"top": "ZONA DESMILITARIZADA", "big": "5 km", "label": "de cada lado da linha", "big_at_word": "cinco", "big_offset": -0.1, "label_at_word": "cada#1", "position": "top-left", "big_size": 110}),
 shot("plate", 14.2, 18.0, "cada lado administra a sua parte", "duas colunas caminham, uma em cada margem", sc("benhai_banks", [walk("vm_column", 20, 20, 62, 14.3, 17.9, 82, "coluna do Norte na margem"), drive("sampan", 8, 95, 40, 14.3, 17.9, 60, "sampan cruza o rio ao fundo", sfx="water", on="water", flip=True, sink=0.15, wake=True)]) ),
 shot("plate", 18.0, 21.5, "as eleições gerais que vão reunificar o Vietnã", "as cédulas caem na urna", sc("polling_hall", [A("cedula", **{"from": [42, 66], "to": [57, 64], "h": 12, "t0_s": s0, "t1_s": s0 + 0.8, "ease": "out", "rot": [0, 0], "sfx": "paper", "note": "cédula desliza na mesa até a urna", "faces": "none", "on": "floor", "hide_s": s0 + 0.85}) for s0 in (18.55, 19.4, 20.3)], o=("50%", "70%")), names=nm("ELEIÇÕES GERAIS", "para reunificar o Vietnã", "eleições", 21.3)),
 shot("typo", 21.5, 24.5, "o cessar-fogo começa em datas diferentes", "o lavrador cruza o arrozal", sc("paddy", [walk("farmer_buffalo", 20, 80, 20, 21.6, 24.4, 82, "lavrador cruza o arrozal", flip=True)]),
  typo={"lines": [{"text": "em datas diferentes", "at_word": "datas", "size": "xl", "color": "paper"}]}),
 shot("date", 24.5, 26.5, "27 de julho no Norte", "a coluna do Norte marcha", sc("paddy", [walk("vm_column", 24, 20, 70, 24.6, 26.4, 82, "coluna do Norte marcha")]), date={"top": "27 DE JULHO · NORTE", "big": "27/07"}),
 shot("date", 26.5, 28.2, "1º de agosto no centro", "o sampan cruza o rio", sc("benhai_bridge", [drive("sampan", 12, 10, 90, 26.6, 28.1, 78, "sampan cruza o rio", sfx="water", on="water", sink=0.15, wake=True)]), date={"top": "1º DE AGOSTO · CENTRO", "big": "01/08"}),
 shot("date", 28.2, 29.668, "11 de agosto no Sul", "o ciclo-riquixá cruza a rua de Saigon", sc("saigon_55", [drive("cyclo", 15, 10, 90, 28.3, 29.6, 82, "ciclo-riquixá em Saigon", sfx="steps")]), date={"top": "11 DE AGOSTO · SUL", "big": "11/08"}),
]}
# ---------------- S09 (31,03 s)
S["S09"] = {"kind": "shots", "shots": [
 shot("plate", 0, 3.6, "a linha era provisória, e as eleições eram o plano para apagá-la", "o sampan cruza a linha", sc("benhai_bridge", [drive("sampan", 12, -12, 112, 0.1, 3.5, 78, "sampan cruza o rio", sfx="water", on="water", sink=0.15, wake=True)]),
  names=nm("LINHA PROVISÓRIA", "as eleições deviam apagá-la", "linha#1", 3.5)),
 shot("plate", 3.6, 8.9, "uma comissão de Canadá, Índia e Polônia", "os três oficiais caminham pela margem", sc("benhai_banks", [walk("icc_trio", 30, 14, 66, 3.8, 8.8, 82, "oficiais da comissão internacional")]), names=nm("COMISSÃO INTERNACIONAL", "Canadá · Índia · Polônia", "comissão", 8.7)),
 shot("date", 8.9, 11.5, "em agosto de 1955", "o ciclo-riquixá cruza a rua", sc("saigon_55", [drive("cyclo", 15, -10, 110, 9.0, 11.4, 82, "ciclo-riquixá em Saigon", sfx="steps")]), date={"top": "AGOSTO", "big": "1955"}),
 shot("plate", 11.5, 14.3, "o primeiro-ministro do Sul, Ngo Dinh Diem", "o carro chega ao palácio", sc("palace_55", [drive("sedan_54", 14, -15, 55, 11.6, 14.0, 82, "carro de Diem chega ao palácio", ease="out")]), names=nm("NGO DINH DIEM", "primeiro-ministro do Sul", "Ngo", 14.2)),
 shot("plate", 14.3, 20.8, "recusa as conversas com o Norte para as eleições previstas para 1956", "a coluna do Norte para diante da ponte", sc("checkpoint", [walk("vm_column", 24, 14, 60, 14.4, 20.7, 82, "coluna do Norte chega à ponte")]), names=nm("ELEIÇÕES PREVISTAS", "1956", "previstas", 20.6)),
 shot("plate", 20.8, 24.0, "o país continua dividido em dois governos", "as duas bandeiras sobem e a coluna cruza a margem", sc("river_poles", [walk("vm_column", 12, 8, 92, 20.9, 23.9, 82, "coluna cruza a margem do rio"), A("flag_vn", **{"from": [17, 42], "h": 10, "flag": {"amp": 12, "pole": 14, "speed": 0.3}, "appear_s": 22.5, "sfx": "flag", "note": "bandeira do Norte"}), A("flag_sv", **{"from": [77, 52], "flip": True, "h": 14, "flag": {"amp": 14, "pole": 16, "speed": 0.3}, "appear_s": 22.9, "sfx": "flag", "note": "bandeira do Sul"})])),
 shot("plate", 24.0, 27.1, "a linha provisória vira uma fronteira de fato", "a coluna francesa marcha até a ponte", sc("benhai_banks", [walk("fr_column54", 22, 20, 70, 24.1, 27.0, 82, "coluna marcha pela margem da linha")]), names=nm("FRONTEIRA DE FATO", "paralelo 17", "fronteira", 26.9)),
 shot("plate", 27.1, 31.03, "os americanos passam a apoiar, no Sul", "o caminhão e o jipe americanos cruzam a rua", sc("saigon_55", [drive("us_truck", 17, -20, 120, 27.2, 30.2, 82, "caminhão americano em Saigon", sfx="jeep"), drive("jeep_us", 13, -40, 100, 28.6, 30.9, 80, "jipe americano", sfx="jeep")]), names=nm("APOIO AMERICANO", "Vietnã do Sul", "americanos", 30.9)),
]}
# ---------------- S10 (28,04 s)
S["S10"] = {"kind": "shots", "shots": [
 shot("plate", 0, 2.6, "os americanos entram aos poucos", "o assessor americano cruza o pátio do aeroporto", sc("airfield_61", [walk("advisor", 30, 20, 70, 0.2, 2.5, 82, "assessor americano caminha")]),
  names=nm("OS AMERICANOS ENTRAM", "aos poucos", "americanos#1", 2.5)),
 shot("date", 2.6, 5.3, "em maio de 1961", "o assessor passa diante da fila de soldados", sc("saigon_55", [walk("advisor", 28, 90, 20, 2.7, 5.2, 82, "assessor caminha em Saigon", flip=True)]), date={"top": "MAIO DE", "big": "1961"}),
 shot("stat", 5.3, 12.1, "685 integrantes do grupo de assessoria militar", "a coluna sul-vietnamita marcha e o assessor passa", sc("airfield_61", [walk("fr_column54", 24, 18, 78, 5.5, 11.9, 82, "coluna sul-vietnamita marcha (farda oliva, capacete M1)"), walk("advisor", 28, 90, 52, 5.4, 8.0, 82, "assessor americano", flip=True)]),
  stat={"top": "MAIO DE 1961", "big": "685", "label": "integrantes do grupo de assessoria militar dos EUA no Vietnã do Sul", "big_at_word": "685", "big_offset": -0.1, "label_at_word": "integrantes", "position": "top-left", "big_size": 110}, silence={"at_s": 4.9, "dur": 0.9}),
 shot("date", 12.1, 15.9, "8 de fevereiro de 1962", "o jipe americano chega ao quartel", sc("macv_hq", [drive("jeep_us", 14, -15, 50, 12.2, 15.7, 82, "jipe chega ao quartel", ease="out")]), date={"top": "8 DE FEVEREIRO", "big": "1962"}),
 shot("plate", 15.9, 19.8, "nasce um comando militar americano para assessorar o governo do Sul", "o helicóptero H-21 cruza o céu sobre o quartel", sc("macv_hq", [drive("h21", 14, -18, 118, 16.0, 19.6, 32, "helicóptero H-21 cruza o céu", sfx="rotor", on="air")], z=(1.02, 1.08)), names=nm("COMANDO MILITAR AMERICANO", "assessora o governo do Sul", "comando", 19.6)),
 shot("date", 19.8, 24.4, "no fim de 1963, ao final do governo Kennedy", "a limusine cruza a entrada da Casa Branca", sc("whitehouse_63", [drive("limo_61", 15, -20, 70, 20.0, 23.8, 82, "limusine em Washington", ease="out")]), date={"top": "FIM DE", "big": "1963"}),
 shot("stat", 24.4, 28.04, "os assessores militares americanos já somam 16 mil", "a coluna americana marcha e o H-21 passa", sc("airfield_61", [walk("us_col63", 24, 20, 74, 24.5, 28.0, 82, "coluna americana marcha"), drive("h21", 12, -15, 115, 25.0, 28.0, 26, "H-21 cruza o céu", sfx="rotor", on="air")]),
  stat={"top": "FIM DE 1963", "big": "16 mil", "label": "assessores militares dos EUA no Vietnã do Sul", "big_at_word": "16", "big_offset": -0.1, "label_at_word": "assessores", "position": "top-left", "big_size": 110}),
]}
# ---------------- S11 (20,82 s)
S["S11"] = {"kind": "shots", "shots": [
 shot("plate", 0, 2.7, "o governo do Sul, porém, está em crise", "o carro cruza diante do palácio", sc("palace_55", [drive("sedan_54", 14, 110, -15, 0.1, 2.6, 82, "carro cruza diante do palácio", flip=True)]),
  names=nm("GOVERNO DO SUL", "em crise", "governo#1", 2.6)),
 shot("date", 2.7, 4.9, "em maio de 1963", "os monges caminham pela margem do rio em Hue", sc("pagoda_pole", [walk("monks", 16, 20, 70, 2.8, 4.8, 82, "monges caminham no pátio do pagode")]), date={"top": "MAIO DE", "big": "1963"}),
 shot("plate", 4.9, 6.9, "a polícia atira contra um ato em Hue", "a multidão corre e a tropa se alinha", sc("hue_night", [A("police_line", **{"from": [72, 82], "h": 22, "appear_s": 5.1, "flip": True, "sfx": "none", "note": "tropa se alinha", "faces": "left", "on": "road"}), walk("crowd_run", 20, 40, 5, 5.3, 6.8, 82, "multidão corre", flip=True, sfx="crowd")]), names=nm("HUÊ", "maio de 1963", "Hue", 6.8)),
 shot("plate", 6.9, 8.7, "contra a proibição da bandeira budista", "a bandeira budista sobe no mastro do pagode", sc("pagoda_pole", [A("flag_bud", **{"from": [50, 40], "h": 12, "flag": {"amp": 12, "pole": 14, "speed": 0.3}, "appear_s": 7.7, "sfx": "flag", "note": "bandeira budista no mastro"})], o=("50%", "50%"))),
 shot("stat", 8.7, 10.3, "e mata nove pessoas", "a multidão recua pela rua de Hue", sc("hue_night", [walk("crowd_run", 20, 10, 80, 8.8, 10.2, 82, "multidão recua", sfx="none")]), stat={"top": "HUÊ · MAIO DE 1963", "big": "9", "label": "mortos", "big_at_word": "nove", "big_offset": -0.1, "label_at_word": "pessoas", "position": "top-left", "big_size": 110}),
 shot("date", 10.3, 13.3, "em 11 de junho, o monge Thich Quang Duc em Saigon", "os monges caminham pela avenida de Saigon", sc("saigon_63", [walk("monks", 13, 15, 62, 10.4, 13.2, 80, "monges caminham em Saigon")]), date={"top": "SAIGON", "big": "11 DE JUNHO"}),
 shot("plate", 13.3, 17.3, "em protesto contra o governo do presidente Ngo Dinh Diem", "os monges marcham até o palácio", sc("palace_55", [walk("monks", 15, 15, 60, 13.5, 17.1, 82, "monges marcham até o palácio")]), names=nm("NGO DINH DIEM", "presidente do Vietnã do Sul", "Ngo", 17.2)),
 shot("plate", 17.3, 20.816, "a foto de Malcolm Browne vence o World Press Photo", "a câmera entra e o flash dispara", sc("saigon_63", [A("camera", **{"from": [50, 62], "h": 26, "appear_s": 17.5, "grow": [0.6, 1], "sfx": "none", "note": "câmera fotográfica", "faces": "none", "on": "air"})], o=("50%", "50%"), fx=[{"kind": "flash", "x": 50, "y": 50, "at_s": 18.0, "size": 0.3}]), names=nm("MALCOLM BROWNE", "World Press Photo · 1963", "Malcolm", 20.6)),
]}
for k in S:
    for sh in S[k]["shots"]:
        if sh["end_s"] - sh["start_s"] >= 3.0 and "pan" not in sh["scene"]:
            sh["scene"]["pan"] = [-30, 4]; break
d = json.loads(V.read_text(encoding="utf-8")); d.update(S)
V.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8"); print("ok", list(S))
