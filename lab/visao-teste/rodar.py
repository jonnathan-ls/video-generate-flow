import json, sys, time
sys.path.insert(0, "orchestra/tools")
from visao import ask, json_of
prov = sys.argv[1]
Q = {"pessoas": "As pessoas recortadas estão com os pés apoiados num chão firme (rua, estrada, pátio, trilha), e NÃO sobre água, telhado ou no ar?",
     "barco": "O barco tem o casco dentro da água (rio/lago), e NÃO sobre o cais, a calçada ou a margem?",
     "carro": "O carro está com as rodas numa rua ou estrada, e NÃO sobre telhados, casas ou no ar?"}
g = json.load(open("lab/visao-teste/gabarito.json")); hit = 0; t0 = time.time()
for c in g:
    t1 = time.time()
    txt, p = ask(Q[c["tipo"]] + ' Responda SÓ JSON: {"ok": true|false, "motivo": "curto"}', [c["img"]], prov)
    d = json_of(txt) or {}
    r = d.get("ok"); hit += (r == c["ok"])
    print(f'{c["img"].split("/")[-1]:28s} gabarito={c["ok"]!s:5s} resp={r!s:5s} {time.time()-t1:5.1f}s {p} | {str(d.get("motivo"))[:70]}')
print(f"ACERTOS {hit}/{len(g)} em {time.time()-t0:.0f}s ({prov})")
