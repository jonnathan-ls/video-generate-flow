#!/usr/bin/env python3
"""Gera as perguntas do gate de FÍSICA (orchestra/fisica.sh) a partir do spec da cena.
Uso: fisica_perguntas.py <scenes_spec.json> <render/props/Sxx.json> Sxx [saida.json]
Saída (stdout, ou arquivo): [{"t":[início,meio,fim],"ator":"ship","pos":[[x,y]x3],"pergunta":"..."}]
Uma pergunta por ator que se desloca > 3%, com o texto conforme 'on'
(water|road|floor|ground|air). Tempos = início, meio e fim do trajeto (path_s, ou t0_s/t1_s);
'pos' = posição do ator (% da tela) em cada tempo, para o recorte da tira no fisica.sh.
"""
import json
import sys
import pathlib

ONS = ("water", "road", "floor", "ground", "air")
TXT = {
    "water": "{a} está com o casco NA água do rio (água visível embaixo e ao redor do casco), e não por cima do cais, da margem ou dos prédios? Se em ALGUM quadro o casco estiver sobre o cais, a margem ou um telhado, ok=false.",
    "road": "{a} está apoiado no chão livre da estrada, e não por cima de casas, barracas, tendas ou telhados? Olhe embaixo das rodas/pés: se em ALGUM quadro estiverem sobre uma tenda, telhado, caixote ou casa, ok=false.",
    "floor": "{a} está com os pés no piso do ambiente, andando no chão em todos os quadros (não flutua no ar nem desce do alto)? Compare a altura dos pés com a linha do chão/piso do ambiente; móveis e objetos NÃO são piso. Se em ALGUM quadro os pés estiverem acima do chão, ok=false.",
    "ground": "{a} está com os pés no chão em todos os quadros, sem flutuar?",
    "air": "{a} se desloca para um lado da tela entre o quadro de cima e o de baixo. A frente (nariz/cockpit) aponta para esse mesmo lado, ou seja, ele avança com o nariz na frente e não com a cauda na frente (de ré)? Diga no motivo para que lado está o nariz e para que lado ele se desloca. Se em ALGUM quadro avançar com a cauda na frente, ok=false.",
}
TXT_OBJ_PISO = "{a} desliza apoiado sobre a mesa (ou a superfície), sem entrar pelo alto nem flutuar?"
TXT_AIR_SEM_FRENTE = "{a} se move suspenso no ar sem atravessar o chão, as casas ou o mapa?"


def main() -> int:
    if len(sys.argv) < 4:
        print(__doc__)
        return 2
    spec_path, props_path, sid = sys.argv[1:4]
    spec = json.load(open(spec_path, encoding="utf-8"))
    pf = pathlib.Path(props_path)
    sc = spec[sid]
    dur = None
    if pf.exists():
        pj = json.load(open(pf, encoding="utf-8"))
        sc = pj.get("spec") or sc
        dur = pj.get("durationSec")
    out = []
    seen = {}
    dedup = set()
    for sh in sc.get("shots", []):
        a0, b0 = sh.get("start_s", 0.0), sh.get("end_s", dur or 0.0)
        for ac in (sh.get("scene") or {}).get("actors", []):
            on = ac.get("on")
            if on not in ONS:
                continue
            pts = list(ac.get("path") or ([ac["from"]] + ([ac["to"]] if ac.get("to") else [])))
            if len(pts) < 2:
                continue
            far = max(max(abs(p[0] - pts[0][0]), abs(p[1] - pts[0][1])) for p in pts)
            if far <= 3:
                continue
            ps = ac.get("path_s") or []
            if len(ps) == len(pts) and len(ps) >= 2:
                t0, t1 = ps[0], ps[-1]
            else:
                t0 = ac.get("appear_s", ac.get("t0_s", a0)) if ac.get("grow") else ac.get("t0_s", a0)
                t1 = ac.get("t1_s", b0)
            t0, t1 = [max(0.0, min(x, (dur or t1 + 0.4) - 0.05)) for x in (t0, t1)]
            # não amostrar a transição do começo nem a do fim da tomada (cartela/escuro)
            t0 = max(t0, a0 + 0.45)
            cap = max(t0 + 0.3, b0 - 0.6)
            t1 = min(t1, cap)
            tm = (t0 + t1) / 2
            t0, tm, t1 = sorted((t0, tm, t1))
            ator = pathlib.Path(ac["src"]).stem
            # posição do ator em cada quadro (para o recorte em volta dele no fisica.sh)
            tb0, tb1 = t0, t1

            def pos_at(tt):
                if len(ps) == len(pts) and len(ps) >= 2:
                    for (pa, pb), (sa, sb) in zip(zip(pts, pts[1:]), zip(ps, ps[1:])):
                        if sb > sa and sa <= tt <= sb:
                            k = (tt - sa) / (sb - sa)
                            return [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k]
                    return list(pts[-1] if tt >= ps[-1] else pts[0])
                k = 0 if tb1 == tb0 else (tt - tb0) / (tb1 - tb0)
                k = max(0.0, min(1.0, k))
                return [pts[0][0] + (pts[-1][0] - pts[0][0]) * k, pts[0][1] + (pts[-1][1] - pts[0][1]) * k]

            def vis(p):
                return -2 <= p[0] <= 102 and -2 <= p[1] <= 102

            # só amostra enquanto o ator está no quadro (entradas/saídas pela borda dariam quadro vazio)
            while t0 < t1 - 0.3 and not vis(pos_at(t0)):
                t0 += 0.1
            while t1 > t0 + 0.3 and not vis(pos_at(t1)):
                t1 -= 0.1
            tm = (t0 + t1) / 2
            t0, tm, t1 = round(t0, 2), round(tm, 2), round(t1, 2)
            pos = [[round(pos_at(x)[0], 1), round(pos_at(x)[1], 1)] for x in (t0, tm, t1)]
            faces = ac.get("faces")
            if on == "air":
                txt = TXT_AIR_SEM_FRENTE if faces == "none" else TXT["air"]
            elif on == "floor" and faces == "none":
                txt = TXT_OBJ_PISO
            else:
                txt = TXT[on]
            pergunta = txt.format(a=ator)
            n = seen.get((ator, pergunta), 0) + 1
            seen[(ator, pergunta)] = n
            key = (ator, pergunta, tuple(round(x, 2) for x in (t0, tm, t1)))
            if key in dedup:
                continue
            dedup.add(key)
            out.append({"t": [round(t0, 2), round(tm, 2), round(t1, 2)], "ator": ator,
                        "pergunta": pergunta, "cena": sid, "n": n, "pos": pos})
    txt = json.dumps(out, ensure_ascii=False, indent=1)
    if len(sys.argv) > 4:
        p = pathlib.Path(sys.argv[4])
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(txt + "\n", encoding="utf-8")
    else:
        print(txt)
    return 0


if __name__ == "__main__":
    sys.exit(main())
