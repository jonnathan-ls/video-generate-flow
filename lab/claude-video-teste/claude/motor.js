// S03 Vietnã (Hanói 1945 → Saigon 1975 → Brasil 1965) no estilo livro pop-up. Base: paper-cut, versão autoral: colinas, sol, ondas, folhas e letras de papel recortado pousando numa página creme.
// Um relógio só: render(t) desenha o quadro inteiro a partir do tempo. Sem Math.random, Date.now ou timers. Loop de 12 s.

// ---------------------------------------------------------------- variáveis do estilo
const W = 1920, H = 1080, DUR = 9.91, TAU = Math.PI * 2;
const COR = { creme: '#F2E8D5', areia: '#E3CBA8', salvia: '#9CB49A', salviaEscura: '#5E7F6A', petroleo: '#2F5D62', tinta: '#2B2B2B', acento: '#B5483B', ouro: '#D9B45A' };
const FONTE = "'EB Garamond'";
const LINHAS = [
  { txt: 'Hanói', tam: 230, base: 560, x: 150, cor: COR.petroleo, t0: 3.45, passo: 0.05, fim: 4.35 },
  { txt: '1945',  tam: 120, base: 720, x: 160, cor: COR.acento,   t0: 3.75, passo: 0.06, fim: 4.25 },
  { txt: 'Saigon', tam: 230, base: 560, x: 150, cor: COR.petroleo, t0: 6.55, passo: 0.05, fim: 7.65 },
  { txt: '1975',   tam: 120, base: 720, x: 160, cor: COR.salviaEscura, t0: 6.85, passo: 0.06, fim: 7.55 },
  { txt: 'Brasil', tam: 230, base: 560, x: 150, cor: COR.petroleo, t0: 9.05, passo: 0.05, fim: 99 },
  { txt: '1965',   tam: 120, base: 720, x: 160, cor: COR.salviaEscura, t0: 9.3, passo: 0.06, fim: 99 },
];
const CAM_BALANCO = [12, 5], CAM_EMPURRAO = 0.012;        // px de balanço e fração de empurrão (× profundidade)

// ---------------------------------------------------------------- utilidades
const ease = (() => { const c = {}; return n => c[n] || (c[n] = gsap.parseEase(n)); })();
const seg = (t, ini, dur, curva) => ease(curva || 'power2.out')(Math.min(1, Math.max(0, (t - ini) / dur)));
const mix = (a, b, p) => a + (b - a) * p;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const onda = (t, ciclos, desl) => Math.sin(TAU * ((ciclos || 1) * t / DUR + (desl || 0)));   // sempre fecha o loop
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mistura = (a, b, p) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p)).join(',')})`;
const TINTA = hex(COR.tinta).join(',');
function semente(s) { let a = s >>> 0; return () => { a = (a + 0x9E3779B9) | 0; let x = a ^ (a >>> 16); x = Math.imul(x, 0x21F0AAAD); x ^= x >>> 15; x = Math.imul(x, 0x735A2D97); x ^= x >>> 15; return (x >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- grão de papel (uma textura com semente, em mosaico)
const G = 512, grao = document.createElement('canvas'); grao.width = grao.height = G;
{
  const g = grao.getContext('2d'), img = g.createImageData(G, G), r = semente(23);
  const ondas = []; for (let k = 0; k < 7; k++) ondas.push([1 + Math.floor(r() * 4), 1 + Math.floor(r() * 4), r() * TAU, 0.4 + r() * 0.6]);
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    let m = 0; for (const [kx, ky, ph, a] of ondas) m += a * Math.sin(TAU * (kx * x / G + (ky * y / G) * (kx % 2 ? 1 : -1)) + ph);
    const v = 128 + (r() - 0.5) * 64 + m * 3.5, i = (y * G + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); g.lineCap = 'round';
  for (let f = 0; f < 70; f++) { const x = r() * G, y = r() * G, a = r() * TAU, l = 6 + r() * 18; g.strokeStyle = r() < 0.6 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}

// ---------------------------------------------------------------- recortes à mão: polígonos com tremor pequeno
const treme = (pts, R) => pts.map(([x, y]) => [x + (R() - 0.5) * 1.2, y + (R() - 0.5) * 1.2]);
function disco(cx, cy, r, sem) {
  const R = semente(sem), f = [R() * TAU, R() * TAU, R() * TAU], n = Math.ceil(TAU * r / 13), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + 0.004 * Math.sin(3 * a + f[0]) + 0.0025 * Math.sin(7 * a + f[1]) + 0.0012 * Math.sin(15 * a + f[2])); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return { polis: [treme(pts, R)] };
}
function ondulado(y0, amp, cl, sem) {                              // faixa com festões irregulares (as ondas)
  const R = semente(sem), pts = []; let x = -1160;
  while (x < 3080) { const w = cl * (0.72 + 0.56 * R()), a = amp * (0.78 + 0.4 * R()), n = Math.ceil(w / 12); for (let i = 0; i < n; i++) { const u = i / n; pts.push([x + u * w, y0 - a * Math.pow(Math.sin(Math.PI * u), 0.75)]); } x += w; }
  pts.push([x, y0], [x, 1500], [-1160, 1500]);
  return { polis: [treme(pts, R)] };
}
function folha(px, py, ang, comp, larg, sem) {                      // cabo em (px, py), apontando para ang graus
  const R = semente(sem), a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const P = (x, y) => [px + x * ca - y * sa, py + x * sa + y * ca];
  const n = Math.ceil(comp / 11), cima = [], baixo = [], curva = (R() - 0.5) * 0.12 * comp;
  for (let i = 0; i <= n; i++) { const u = i / n, w = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.9), c = curva * Math.sin(Math.PI * u); cima.push(P(u * comp, c - larg / 2 * w)); baixo.push(P(u * comp, c + larg / 2 * w * 0.92)); }
  const cabo = [P(-120, -4), P(4, -4), P(4, 4), P(-120, 4)];
  const nervuras = [[P(-110, 0)]];
  for (let i = 1; i <= 10; i++) { const u = i / 10 * 0.88; nervuras[0].push(P(u * comp, curva * Math.sin(Math.PI * u))); }
  for (const u of [0.22, 0.4, 0.58, 0.74]) for (const s of [-1, 1]) { const c = curva * Math.sin(Math.PI * u), w = larg / 2 * 0.62 * Math.pow(Math.sin(Math.PI * u), 0.9); nervuras.push([P(u * comp, c), P(u * comp + w * 0.9, c + s * w)]); }
  return { polis: [treme(cima.concat(baixo.reverse()), R), treme(cabo, R)], nervuras };
}


// ---------------------------------------------------------------- recorte de polígono qualquer (prédios, telhados, bandeiras, helicóptero)
function recorte(pts, sem, passo) {
  const R = semente(sem), out = []; passo = passo || 14;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / passo)); for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); }
  return { polis: [treme(out, R)] };
}
const ret = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function estrela(cx, cy, r) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return p; }
const folhaDe = (forma, cor, prof, origem, extra) => Object.assign({ forma, cor, prof, origem, filete: mistura(cor, '#FFFFFF', 0.42) }, extra || {});

// ---------------------------------------------------------------- três páginas: cada folha tem tIn (pousa) e tOut (sai)
// HANÓI 1945 (0,0–4,6): colinas, casario colonial baixo, mastro e bandeira (acento) que pousa em "discurso" 2,8
const casa = (x, w, h, cor, sem, t) => [folhaDe(recorte(ret(x, 1000 - h, w, h + 120), sem), cor, 0.5, [x + w / 2, 1000], { tIn: t, tOut: 4.55 }),
  folhaDe(recorte([[x - 18, 1000 - h], [x + w / 2, 1000 - h - w * 0.32], [x + w + 18, 1000 - h]], sem + 1, 10), COR.acento === cor ? COR.tinta : mistura(COR.acento, COR.areia, 0.35), 0.55, [x + w / 2, 1000 - h], { tIn: t + 0.15, tOut: 4.5 })];
const HANOI = [
  folhaDe(disco(1500, 1400, 820, 20), COR.areia, 0.2, [1500, 600], { tIn: 0.0, tOut: 4.75 }),
  folhaDe(disco(1850, 1300, 600, 21), COR.salvia, 0.3, [1850, 700], { tIn: 0.35, tOut: 4.7 }),
  ...casa(1030, 230, 260, COR.creme, 30, 0.8), ...casa(1290, 190, 320, COR.salvia, 32, 1.0), ...casa(1510, 260, 230, COR.creme, 34, 1.2), ...casa(1800, 200, 290, COR.salviaEscura, 36, 1.4),
  folhaDe(recorte(ret(1610, 300, 14, 470), 40, 20), COR.tinta, 0.6, [1617, 770], { tIn: 2.2, tOut: 4.45 }),
];
const BANDEIRA_VN = folhaDe(recorte(ret(1624, 300, 260, 170), 41), COR.acento, 0.65, [1624, 300], { tIn: 2.8, tOut: 4.4, onda: true });
const ESTRELA_VN = folhaDe(recorte(estrela(1754, 385, 52), 42, 8), COR.ouro, 0.7, [1754, 385], { tIn: 3.0, tOut: 4.4 });
// SAIGON 1975 (4,6–7,8): rio, prédios altos, helicóptero que atravessa em "depois" 5,5
const SAIGON = [
  folhaDe(ondulado(930, 40, 280, 50), COR.petroleo, 0.75, [960, 930], { tIn: 4.65, tOut: 7.75, lado: -1 }),
  folhaDe(recorte(ret(1080, 420, 210, 560), 60), COR.areia, 0.35, [1185, 980], { tIn: 4.75, tOut: 7.7 }),
  folhaDe(recorte(ret(1330, 300, 170, 680), 61), COR.salviaEscura, 0.4, [1415, 980], { tIn: 4.9, tOut: 7.68 }),
  folhaDe(recorte(ret(1540, 470, 250, 510), 62), COR.salvia, 0.45, [1665, 980], { tIn: 5.05, tOut: 7.66 }),
  folhaDe(recorte(ret(1820, 380, 160, 600), 63), COR.areia, 0.5, [1900, 980], { tIn: 5.2, tOut: 7.64 }),
];
// helicóptero: corpo, cauda, patins (recortes); rotor desenhado à parte
const HX = 0, HY = 0;
const HELI = folhaDe({ polis: [
  treme(recorte([[0, 40], [40, 0], [190, -6], [230, 20], [236, 60], [200, 92], [40, 92], [0, 70]], 70, 12).polis[0], semente(71)),
  treme(recorte([[220, 30], [430, 26], [440, 6], [462, 6], [458, 50], [220, 62]], 72, 12).polis[0], semente(73)),
  treme(recorte([[20, 108], [230, 108], [236, 116], [14, 116]], 74, 12).polis[0], semente(75)),
] }, COR.salviaEscura, 1.0, [118, 46], { tIn: 5.0, tOut: 99 });
// BRASIL 1965 (7,8–9,91): mar, Pão de Açúcar, bandeira (verde, losango ouro, círculo petróleo)
const BRASIL = [
  folhaDe(ondulado(960, 44, 300, 80), COR.salvia, 0.7, [960, 960], { tIn: 7.85, tOut: 99, lado: 1 }),
  folhaDe(disco(1380, 1160, 420, 81), COR.salviaEscura, 0.3, [1380, 760], { tIn: 7.95, tOut: 99 }),
  folhaDe(disco(1720, 1080, 270, 82), COR.areia, 0.4, [1720, 820], { tIn: 8.15, tOut: 99 }),
];
const BANDEIRA_BR = [
  folhaDe(recorte(ret(1402, 240, 14, 640), 89, 20), COR.tinta, 0.75, [1409, 880], { tIn: 8.25, tOut: 99 }),
  folhaDe(recorte(ret(1420, 250, 380, 260), 90), COR.salviaEscura, 0.8, [1420, 250], { tIn: 8.4, tOut: 99, onda: true }),
  folhaDe(recorte([[1610, 272], [1778, 380], [1610, 488], [1442, 380]], 91, 10), COR.ouro, 0.85, [1610, 380], { tIn: 8.55, tOut: 99, onda: true }),
  folhaDe(disco(1610, 380, 66, 92), COR.petroleo, 0.9, [1610, 380], { tIn: 8.7, tOut: 99, onda: true }),
];
// ---------------------------------------------------------------- desenho
const cv = document.getElementById('cv'), c = cv.getContext('2d');
let padraoGrao = null;
function poligono(pts) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); }
function caminho(polis) { c.beginPath(); for (const pts of polis) { pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } }
// sombra em função do levantamento L (0 = assentada, 1 = no alto)
function sombra(L, k) {
  k = k || 1; L = clamp(L, 0, 1.2);
  return [[(3 + 16 * L) * k, (5 + 30 * L) * k, (6 + 34 * L) * k, 0.34 - 0.13 * L], [0.8 * k, 1.6 * k, 1.4 * k, 0.32 * (1 - Math.min(1, L))]];
}
function camera(t, prof) {
  const bx = CAM_BALANCO[0] * onda(t, 1) * prof, by = CAM_BALANCO[1] * onda(t, 1, 0.25) * prof;
  const emp = 1 + CAM_EMPURRAO * prof * (0.5 - 0.5 * Math.cos(TAU * t / DUR));
  c.translate(960, 540); c.scale(emp, emp); c.translate(-960 + bx, -540 + by);
}
// desenha uma folha: deslocamento, escala e giro em torno da origem, levantamento L
function desenhaFolha(f, t, x, y, esc, rot, L) {
  c.save(); camera(t, f.prof);
  c.translate(x, y); c.translate(f.origem[0], f.origem[1]); c.rotate((rot || 0) * Math.PI / 180); c.scale(esc, esc); c.translate(-f.origem[0], -f.origem[1]);
  for (const [sx, sy, blur, a] of sombra(L)) { c.save(); c.shadowColor = `rgba(${TINTA},${a})`; c.shadowBlur = blur; c.shadowOffsetX = sx; c.shadowOffsetY = sy; c.fillStyle = f.filete; caminho(f.forma.polis); c.fill(); c.restore(); }
  c.fillStyle = f.filete; caminho(f.forma.polis); c.fill();            // filete claro
  c.save(); c.translate(0.8, 2.4); c.fillStyle = f.cor; caminho(f.forma.polis); c.fill(); c.restore();   // o papel
  c.save(); caminho(f.forma.polis); c.clip();
  if (f.forma.nervuras) { c.strokeStyle = f.nervura; c.lineWidth = 3; c.lineCap = 'round'; c.globalAlpha = 0.55; for (const n of f.forma.nervuras) { c.beginPath(); n.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); } c.globalAlpha = 1; }
  c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.62; c.fillStyle = padraoGrao; c.fillRect(-1200, -600, 4400, 2200);
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- tempos
const pulso = (t, s, d) => Math.sin(Math.PI * seg(t, s, d, 'sine.inOut'));
const pousa = (t, t0, d, curva) => [seg(t, t0, d, curva || 'back.out(1.2)'), 1 - seg(t, t0 + 0.25 * d, 0.85 * d, 'power2.inOut')];   // [p, L]
const sai = (t, t1, d) => [seg(t, t1 + 0.1, d, 'power2.in'), seg(t, t1, 0.22, 'power2.out')];                                      // [q, L]



let letras = null;
function medirLetras() {
  letras = []; const R = semente(77);
  for (const L of LINHAS) {
    c.font = `italic 500 ${L.tam}px ${FONTE}`; let x = L.x, k = 0;
    for (const ch of L.txt) { const w = c.measureText(ch).width; if (ch !== ' ') { letras.push({ ch, x, w, L, k, rot: (R() - 0.5) * 16, dx: (R() - 0.5) * 40, dy: -20 - R() * 40 }); k++; } x += w + 0.01 * L.tam; }
  }
}
function desenhaLetras(t) {
  c.save(); camera(t, 0.6);
  for (const l of letras) {
    const L = l.L, ti = L.t0 + l.k * L.passo, to = L.fim + l.k * L.passo * 0.6;
    if (t < ti - 0.01 || t > to + 0.7) continue;
    const pIn = seg(t, ti, 0.6, 'back.out(1.2)'), a = seg(t, ti, 0.16, 'power1.out');
    const Lin = 1 - seg(t, ti + 0.12, 0.5, 'power2.inOut'), Lout = seg(t, to, 0.18, 'power2.out'), q = seg(t, to + 0.05, 0.36, 'power2.in');
    const saindo = t >= to, lev = saindo ? Lout : Lin, op = saindo ? 1 - seg(t, to + 0.25, 0.16, 'power1.in') : a;
    if (op <= 0.001) continue;
    const esc = 1 + 0.32 * (1 - pIn) + 0.36 * q + 0.03 * lev;
    const x = l.dx * (1 - pIn) - l.dx * q, y = l.dy * (1 - pIn) + l.dy * 1.2 * q, rot = (l.rot * (1 - pIn) - l.rot * q) * Math.PI / 180;
    const ks = L.tam / 230 * 0.55, ox = l.x + l.w / 2, oy = L.base - 0.3 * L.tam;
    c.save(); c.globalAlpha = op; c.translate(ox + x, oy + y); c.rotate(rot); c.scale(esc, esc); c.translate(-ox, -oy);
    c.font = `italic 500 ${L.tam}px ${FONTE}`; c.textBaseline = 'alphabetic'; c.fillStyle = L.cor;
    for (const [sx, sy, blur, al] of [[(3 + 16 * lev) * ks, (5 + 30 * lev) * ks, (6 + 30 * lev) * ks, 0.28 - 0.1 * lev], [0.7 * ks, 1.4 * ks, 1.2 * ks, 0.35 * (1 - Math.min(1, lev))]]) {
      c.shadowColor = `rgba(${TINTA},${al})`; c.shadowBlur = blur; c.shadowOffsetX = sx; c.shadowOffsetY = sy; c.fillText(l.ch, l.x, L.base);
    }
    c.shadowColor = 'transparent'; c.fillText(l.ch, l.x, L.base); c.restore();
  }
  c.restore();
}
// uma folha que sobe de baixo, assenta, respira e sai pra cima
function folhaPadrao(f, t, i, desce) {
  const [p, L1] = pousa(t, f.tIn, 0.8), [q, L2] = sai(t, f.tOut, 0.42);
  if (p <= 0 || q >= 1) return;
  const b = 0.5 + 0.5 * Math.sin(TAU * (t / 2.4 + i * 0.13)), saindo = t >= f.tOut;
  const dy = (desce ? -1 : 1) * (1 - p) * 700 - q * 900 - 6 * b;
  const L = (saindo ? L2 : L1) + 0.12 * b;
  const rot = f.onda ? 1.4 * Math.sin(TAU * (t / 1.6 + i * 0.2)) : 0;
  desenhaFolha(f, t, 0, dy, 1 + 0.035 * (saindo ? L2 : L1), rot, L);
}
function render(t) {
  if (!document.fonts.check(`italic 500 40px ${FONTE}`)) return;
  if (!padraoGrao) padraoGrao = c.createPattern(grao, 'repeat');
  if (!letras) medirLetras();
  c.save();
  c.fillStyle = COR.creme; c.fillRect(0, 0, W, H);
  const vin = c.createRadialGradient(730, 454, 300, 730, 454, 1250); vin.addColorStop(0.55, `rgba(${TINTA},0)`); vin.addColorStop(1, `rgba(${TINTA},0.10)`);
  c.fillStyle = vin; c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.9; c.fillStyle = padraoGrao; c.fillRect(0, 0, W, H); c.restore();
  // Hanói
  HANOI.forEach((f, i) => folhaPadrao(f, t, i));
  folhaPadrao(BANDEIRA_VN, t, 9, true); folhaPadrao(ESTRELA_VN, t, 9, true);
  // Saigon: prédios sobem; rio desliza da lateral
  SAIGON.forEach((f, i) => {
    if (f.lado) { const p = seg(t, f.tIn, 0.85, 'power3.out'), L1 = 1 - seg(t, f.tIn + 0.3, 0.7, 'power2.inOut'), [q, L2] = sai(t, f.tOut, 0.45); if (p <= 0 || q >= 1) return;
      desenhaFolha(f, t, f.lado * (1 - p) * 3300 - f.lado * q * 3300 + 18 * onda(t, 4), 5 * onda(t, 4, 0.25), 1, 0, t < f.tOut ? L1 : L2); }
    else folhaPadrao(f, t, i);
  });
  // Brasil
  BRASIL.forEach((f, i) => {
    if (f.lado) { const p = seg(t, f.tIn, 0.85, 'power3.out'), L1 = 1 - seg(t, f.tIn + 0.3, 0.7, 'power2.inOut'); if (p <= 0) return;
      desenhaFolha(f, t, f.lado * (1 - p) * 3300 + 18 * onda(t, 4, 0.5), 5 * onda(t, 4, 0.75), 1, 0, L1); }
    else folhaPadrao(f, t, i);
  });
  BANDEIRA_BR.forEach((f, i) => folhaPadrao(f, t, 20 + i, true));
  desenhaLetras(t);
  // helicóptero: entra pela direita em 5,0, cruza o céu de Saigon (passa o meio em "depois" 5,5) e sai pela esquerda em 7,6
  if (t >= 5.0 && t <= 7.7) {
    const u = seg(t, 5.0, 2.6, 'sine.inOut'), x = mix(2150, -560, u), y = 190 + 26 * Math.sin(TAU * t / 1.7), tilt = -6 - 3 * Math.sin(TAU * t / 1.7);
    c.save(); camera(t, 1.0); c.translate(x, y); c.rotate(tilt * Math.PI / 180); c.scale(0.95, 0.95);
    const f = HELI; f.origem = [118, 46];
    c.translate(0, 0); desenhaFolha(f, 0, 0, 0, 1, 0, 0.55);
    const ab = 0.6 + 0.4 * Math.abs(Math.sin(t * 31));           // rotor: risco de papel que pisca de largura (pás girando)
    c.fillStyle = COR.tinta; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(118, -22, 240 * ab, 6, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
    c.fillRect(114, -22, 8, 24);
    c.restore();
  }
  c.restore();
}
// ---------------------------------------------------------------- relógio (sem loop: 0 → DUR)
const rel = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(rel, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => render(rel.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.addEventListener('load', () => render(tl.time()));
document.fonts.ready.then(() => { letras = null; render(tl.time()); });
