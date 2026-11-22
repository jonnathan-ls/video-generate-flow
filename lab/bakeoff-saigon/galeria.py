#!/usr/bin/env python3
"""Gera lab/bakeoff-saigon/out/galeria.html com todos os vídeos do lab Saigon.
Uso: python3 lab/bakeoff-saigon/galeria.py   (rode de novo quando entrar vídeo novo)
Abre no navegador direto do disco (file://). Um vídeo por vez, ou vários lado a lado com play sincronizado."""
import json, pathlib, html

OUT = pathlib.Path(__file__).parent / "out"
NOMES = {
    "colagem": "Colagem nossa", "dirco": "Kit director-de-collage", "direto": "Pedido direto (sem kit)",
    "claudevideo": "claude-video (risografia)", "diorama": "Diorama (prompt style)", "codigo3d": "Código 3D",
    "ps_inktoon": "Ink and Toon", "ps_popup": "Paper Pop-Up", "ps_lowpoly": "Low-Poly", "ps_softclay": "Soft Clay",
    "cv_porto": "claude-video: Porto", "cv_mesa": "claude-video: Sessão na mesa", "cv_documento": "claude-video: Documento",
    "ps_spotlight": "Spotlight Stage", "ps_inflated": "Inflated", "ps_painted": "Painted", "ps_voxel": "Voxel",
    "ps_pencil": "Pencil Sketch", "ps_shadowbox": "Shadowbox",
}
RODADA = {"colagem": 1, "dirco": 2, "direto": 2, "claudevideo": 1, "diorama": 1, "codigo3d": 1}

vids = []
for f in sorted(OUT.glob("*_16x9.mp4")):
    k = f.name[: -len("_16x9.mp4")]
    r = RODADA.get(k, 3 if k.startswith(("ps_inktoon", "ps_popup", "ps_lowpoly", "ps_softclay", "cv_")) else 4)
    vids.append({"k": k, "nome": NOMES.get(k, k), "src": f.name, "rodada": r})
vids.sort(key=lambda v: (v["rodada"], v["nome"]))
EST = {"croche": "Crochê", "cartoon": "Cartoon", "3d-cine": "3D cinematográfico"}
imgs = [{"nome": EST.get(f.name[:-len("-prancha.jpg")], f.name), "src": "estilos/" + f.name}
        for f in sorted((OUT / "estilos").glob("*-prancha.jpg"))]

page = """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Lab Saigon</title>
<style>
:root{--bg:#111;--fg:#eee;--mut:#999;--card:#1c1c1c;--ac:#e0b04a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.4 system-ui,sans-serif}
header{position:sticky;top:0;background:#000d;backdrop-filter:blur(6px);padding:10px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;z-index:2}
h1{font-size:17px;margin:0 12px 0 0}button{background:#2a2a2a;color:var(--fg);border:1px solid #444;border-radius:6px;padding:6px 12px;cursor:pointer}
button.on{background:var(--ac);color:#000;border-color:var(--ac)}
#lista{display:flex;flex-wrap:wrap;gap:6px;padding:10px 16px}
#lista label{background:var(--card);border:1px solid #333;border-radius:6px;padding:4px 10px;cursor:pointer;user-select:none}
#lista label.sel{border-color:var(--ac);color:var(--ac)}#lista small{color:var(--mut)}
#palco{display:grid;gap:10px;padding:10px 16px}
.cel{background:var(--card);border-radius:8px;overflow:hidden}.cel b{display:block;padding:6px 10px;font-weight:600}
video{width:100%;display:block;background:#000}
.vazio{color:var(--mut);padding:40px;text-align:center}
</style></head><body>
<header><h1>Lab Saigon: estilos</h1>
<button id="m1" class="on">Um por vez</button><button id="mN">Lado a lado</button>
<span style="width:12px"></span>
<button id="play">▶ Tocar todos juntos</button><button id="pause">❚❚ Pausar</button><button id="zero">⟲ Início</button>
<label><input type="checkbox" id="som" checked> som só do 1º</label>
</header>
<div id="lista"></div><div id="palco"></div>
<h2 style="font-size:16px;padding:16px 16px 0;margin:0">Estilos novos: só imagens (antes de virar vídeo)</h2>
<div id="imgs" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:10px;padding:10px 16px 40px"></div>
<script>
const V=__VIDS__;let modo='1',sel=new Set([V.length?V[0].k:'']);
try{const s=JSON.parse(localStorage.getItem('labsel')||'null');if(s)sel=new Set(s);modo=localStorage.getItem('labmodo')||'1'}catch(e){}
const lista=document.getElementById('lista'),palco=document.getElementById('palco');
function salvar(){try{localStorage.setItem('labsel',JSON.stringify([...sel]));localStorage.setItem('labmodo',modo)}catch(e){}}
function desenhaLista(){lista.innerHTML='';V.forEach(v=>{const l=document.createElement('label');l.className=sel.has(v.k)?'sel':'';
 l.innerHTML=v.nome+' <small>r'+v.rodada+'</small>';l.onclick=()=>{if(modo==='1'){sel=new Set([v.k])}else{sel.has(v.k)?sel.delete(v.k):sel.add(v.k)}salvar();desenha()};lista.appendChild(l)})}
function desenhaPalco(){palco.innerHTML='';const vs=V.filter(v=>sel.has(v.k));
 if(!vs.length){palco.innerHTML='<div class="vazio">Escolha um ou mais estilos acima.</div>';return}
 const n=vs.length,cols=modo==='1'?1:(n<=1?1:n<=4?2:3);palco.style.gridTemplateColumns='repeat('+cols+',1fr)';
 palco.style.maxWidth=modo==='1'?'1280px':'none';palco.style.margin='0 auto';
 vs.forEach((v,i)=>{const c=document.createElement('div');c.className='cel';
  c.innerHTML='<b>'+v.nome+'</b><video src="'+v.src+'" controls preload="metadata" playsinline></video>';palco.appendChild(c)});somSo()}
function somSo(){const vs=[...palco.querySelectorAll('video')];const so=document.getElementById('som').checked;vs.forEach((x,i)=>x.muted=so&&i>0)}
function desenha(){document.getElementById('m1').classList.toggle('on',modo==='1');document.getElementById('mN').classList.toggle('on',modo!=='1');desenhaLista();desenhaPalco()}
document.getElementById('m1').onclick=()=>{modo='1';sel=new Set([[...sel][0]||V[0].k]);salvar();desenha()};
document.getElementById('mN').onclick=()=>{modo='N';salvar();desenha()};
const todos=()=>[...palco.querySelectorAll('video')];
document.getElementById('play').onclick=()=>{const t=todos()[0]?todos()[0].currentTime:0;todos().forEach(x=>{x.currentTime=t;x.play()})};
document.getElementById('pause').onclick=()=>todos().forEach(x=>x.pause());
document.getElementById('zero').onclick=()=>todos().forEach(x=>{x.pause();x.currentTime=0});
document.getElementById('som').onchange=somSo;desenha();
const I=__IMGS__,ib=document.getElementById('imgs');
ib.innerHTML=I.length?I.map(x=>'<div class="cel"><b>'+x.nome+'</b><a href="'+x.src+'" target="_blank"><img src="'+x.src+'" style="width:100%;display:block"></a></div>').join(''):'<div class="vazio">Ainda gerando.</div>';
</script></body></html>"""
(OUT / "galeria.html").write_text(page.replace("__VIDS__", json.dumps(vids, ensure_ascii=False)).replace("__IMGS__", json.dumps(imgs, ensure_ascii=False)), encoding="utf-8")
print(f"{len(vids)} vídeos → {OUT/'galeria.html'}")
