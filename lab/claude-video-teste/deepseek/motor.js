// paper-cut, versão autoral S03: três cidades em papel recortado — Hanói 1945, Saigon 1975, Brasil 1965.
// Um relógio só: render(t) desenha o quadro inteiro a partir do tempo. Sem Math.random, Date.now ou timers.

// ---------------------------------------------------------------- variáveis do estilo
const W = 1920, H = 1080, DUR = 9.91, TAU = Math.PI * 2;
const COR = { creme: '#F2E8D5', areia: '#E3CBA8', salvia: '#9CB49A', salviaEscura: '#5E7F6A', petroleo: '#2F5D62', tinta: '#2B2B2B', acento: '#B5483B' };
const FONTE = "'EB Garamond'";
const LINHAS = [
  { txt: 'Hanói',  tam: 210, base: 505, x: 150, cor: COR.petroleo,     t0: 3.50, passo: 0.030, tOut: 4.30 },
  { txt: '1945',   tam: 210, base: 712, x: 152, cor: COR.salviaEscura, t0: 3.62, passo: 0.030, tOut: 4.40 },
  { txt: 'Saigon', tam: 210, base: 505, x: 150, cor: COR.petroleo,     t0: 6.60, passo: 0.030, tOut: 7.52 },
  { txt: '1975',   tam: 210, base: 712, x: 152, cor: COR.salviaEscura, t0: 6.72, passo: 0.030, tOut: 7.60 },
  { txt: 'Brasil', tam: 210, base: 505, x: 150, cor: COR.petroleo,     t0: 9.10, passo: 0.030, tOut: 99 },
  { txt: '1965',   tam: 210, base: 712, x: 152, cor: COR.salviaEscura, t0: 9.22, passo: 0.030, tOut: 99 },
];
const CAM_BALANCO = [10, 5], CAM_EMPURRAO = 0.012;        // px de balanço e fração de empurrão (× profundidade)

// ---------------------------------------------------------------- utilidades
const ease = (() => { const c = {}; return n => c[n] || (c[n] = gsap.parseEase(n)); })();
const seg = (t, ini, dur, curva) => ease(curva || 'power2.out')(Math.min(1, Math.max(0, (t - ini) / dur)));
const mix = (a, b, p) => a + (b - a) * p;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
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
const treme = (pts, R, k) => pts.map(([x, y]) => { const q = k == null ? 1.2 : k; return [x + (R() - 0.5) * q, y + (R() - 0.5) * q]; });
function disco(cx, cy, r, sem) {
  const R = semente(sem), f = [R() * TAU, R() * TAU, R() * TAU], n = Math.ceil(TAU * r / 13), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + 0.004 * Math.sin(3 * a + f[0]) + 0.0025 * Math.sin(7 * a + f[1]) + 0.0012 * Math.sin(15 * a + f[2])); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return { polis: [treme(pts, R)] };
}
function oval(cx, cy, rx, ry, sem) {
  const R = semente(sem), n = Math.ceil(TAU * Math.max(rx, ry) / 14), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([cx + rx * Math.cos(a) * (1 + 0.006 * Math.sin(5 * a)), cy + ry * Math.sin(a) * (1 + 0.006 * Math.cos(4 * a))]); }
  return { polis: [treme(pts, R)] };
}
function ondulado(y0, amp, cl, sem) {                              // faixa com festões irregulares (rio, mar)
  const R = semente(sem), pts = []; let x = -1160;
  while (x < 3080) { const w = cl * (0.72 + 0.56 * R()), a = amp * (0.78 + 0.4 * R()), n = Math.ceil(w / 12); for (let i = 0; i < n; i++) { const u = i / n; pts.push([x + u * w, y0 - a * Math.pow(Math.sin(Math.PI * u), 0.75)]); } x += w; }
  pts.push([x, y0 + 620], [-1160, y0 + 620]);
  return { polis: [treme(pts, R)] };
}
function casaEm(cx, base, w, h, corCorpo, corTelhado, prof, tIn, tOut, sem) {
  // corpo retangular de papel + telhado de duas águas por cima (duas folhas, como no estilo)
  const R = semente(sem), x0 = cx - w / 2, x1 = cx + w / 2, linha = base - h * 0.62, ov = w * 0.1;
  const janelas = [];
  const jn = w > 200 ? 2 : 1, jw = w * 0.16, jh = h * 0.16;
  for (let i = 0; i < jn; i++) {
    const jx = cx - (jn === 2 ? w * 0.24 : 0) + i * w * 0.48 - jw / 2, jy = base - h * 0.42;
    janelas.push({ polis: [treme([[jx, jy], [jx + jw, jy], [jx + jw, jy + jh], [jx, jy + jh]], R, 0.7)] });
  }
  return [
    peca({ polis: [treme([[x0, linha], [x1, linha], [x1, base], [x0, base]], R)], detalhes: janelas }, corCorpo, prof, [cx, base], { tIn, tOut, giro: -3, resp: 5, ciclos: 2, fase: (sem % 7) / 7 }),
    peca({ polis: [treme([[x0 - ov, linha + 8], [cx, base - h], [x1 + ov, linha + 8]], semente(sem + 5), 1)] }, corTelhado, prof + 0.04, [cx, base], { tIn: tIn + 0.14, tOut, giro: 3, resp: 5, ciclos: 2, fase: (sem % 5) / 5 }),
  ];
}
function predio(x, topo, w, base, sem, cols, rows) {               // quarteirão com janelas recortadas
  const R = semente(sem), h = base - topo;
  const det = [], mx = w * 0.16, my = h * 0.10, iw = w - 2 * mx, ih = h - 2 * my;
  const cw = iw / cols, ch = ih / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wx = x + mx + i * cw + cw * 0.22, wy = topo + my + j * ch + ch * 0.2, ww = cw * 0.56, wh = Math.min(ch * 0.5, ww * 0.9);
    det.push({ polis: [treme([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], R, 0.7)] });
  }
  return { polis: [treme([[x, topo], [x + w, topo], [x + w, base], [x, base]], R)], detalhes: det };
}
function morro(cx, base, w, alt, sem) {                            // pão de açúcar: curva arredondada
  const R = semente(sem), pts = [], n = Math.ceil(w / 14);
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([cx - w / 2 + u * w, base - alt * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 0.85)]); }
  pts.push([cx + w / 2, base + 500], [cx - w / 2, base + 500]);
  return { polis: [treme(pts, R)] };
}
function pano(x0, y0, w, h, sem) {                                 // pano de bandeira, borda inferior ondulada
  const R = semente(sem), pts = [], n = 14;
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x0 + u * w, y0 - h * 0.03 * Math.sin(Math.PI * u)]); }
  for (let i = n; i >= 0; i--) { const u = i / n; pts.push([x0 + u * w, y0 + h + h * 0.06 * Math.sin(Math.PI * u * 1.4)]); }
  return { polis: [treme(pts, R)] };
}
function losango(cx, cy, hw, hh, sem) {
  const R = semente(sem);
  return { polis: [treme([[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]], R)] };
}
function estrela(cx, cy, r, sem) {
  const R = semente(sem), pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return { polis: [treme(pts, R, 1.0)] };
}
function folha(bx, by, len, wid, ang, sem) {                        // folha recortada: base no cabo, ponta na direção do ângulo
  const R = semente(sem), a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
  const nx = -dy, ny = dx, N = 22, pts = [];
  const larg = u => wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 0.72);
  for (let i = 0; i <= N; i++) { const u = i / N, w = larg(u); pts.push([bx + dx * len * u + nx * w, by + dy * len * u + ny * w]); }
  for (let i = N; i >= 0; i--) { const u = i / N, w = larg(u); pts.push([bx + dx * len * u - nx * w, by + dy * len * u - ny * w]); }
  const nervuras = [[[bx + dx * len * 0.04, by + dy * len * 0.04], [bx + dx * len * 0.93, by + dy * len * 0.93]]];
  for (let k = 0; k < 3; k++) {
    const u = 0.28 + k * 0.2, w = larg(u), px = bx + dx * len * u, py = by + dy * len * u;
    nervuras.push([[px, py], [px + dx * len * 0.16 + nx * w * 1.45, py + dy * len * 0.16 + ny * w * 1.45]]);
    nervuras.push([[px, py], [px + dx * len * 0.16 - nx * w * 1.45, py + dy * len * 0.16 - ny * w * 1.45]]);
  }
  return { polis: [treme(pts, R, 1.6)], nervuras };
}
function cabo(x1, y1, x2, y2, esp, sem) {                          // cabinho fino de papel que ancora as folhas no canto
  const ex = x2 - x1, ey = y2 - y1, L = Math.hypot(ex, ey), nx = -ey / L * esp, ny = ex / L * esp;
  return { polis: [treme([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], semente(sem), 0.8)] };
}
// ramo de canto: folhas presas no canto de cima, entram girando pelo cabo e saem com a cena
function ramo(tIn, tOut, sem, caboPts, folhas) {
  const out = [peca(cabo(caboPts[0], caboPts[1], caboPts[2], caboPts[3], 10, sem + 40), COR.salviaEscura, 0.66,
    [caboPts[0], caboPts[1]], { tIn, tOut: tOut - 0.12, giro: -8, resp: 2, ciclos: 1, fase: 0.2 })];
  folhas.forEach(([bx, by, len, wid, ang, cor, prof, giro], i) => out.push(
    peca(folha(bx, by, len, wid, ang, sem + i), cor, prof, [bx, by],
      { tIn: tIn + 0.12 + i * 0.10, tOut: tOut + i * 0.12, giro, resp: 3, ciclos: 1, fase: (sem % 5) / 5 + i * 0.2, nervura: mistura(cor, COR.tinta, 0.5) })));
  return out;
}

// ---------------------------------------------------------------- as peças
const peca = (forma, cor, prof, origem, o) => Object.assign({ forma, cor, prof, origem, filete: mistura(cor, '#FFFFFF', 0.42) }, o || {});

// Hanói 1945: colinas, telhados baixos, bandeira vermelha com estrela
const HANOI = [
  peca(disco(1640, 1560, 840, 20), COR.areia,  0.20, [1640, 760], { modo: 'afunda', afunda: 520, tIn: 0.00, tOut: 5.28, resp: 9,  ciclos: 1, fase: 0.10 }),
  peca(disco(1880, 1660, 720, 21), COR.salvia, 0.28, [1880, 980], { modo: 'afunda', afunda: 460, tIn: 0.40, tOut: 5.10, resp: 10, ciclos: 1, fase: 0.34 }),
  ...casaEm(1150, 968, 270, 205, COR.petroleo,    COR.salvia,       0.42, 0.95, 4.92, 30),
  ...casaEm(950, 990, 240, 170, COR.salvia,       COR.salviaEscura, 0.50, 1.20, 4.80, 31),
  ...casaEm(782, 1010, 215, 140, COR.areia,       COR.petroleo,     0.58, 1.45, 4.68, 32),
  ...casaEm(1078, 1014, 168, 115, COR.salviaEscura, COR.salvia,     0.66, 1.70, 4.56, 33),
  peca({ polis: [treme([[1240, 330], [1253, 330], [1253, 962], [1240, 962]], semente(70), 0.8)] }, COR.tinta, 0.82, [1246, 962], { tIn: 2.80, tOut: 4.44, sobe: 1520 }),
  peca(pano(1253, 332, 300, 200, 71), COR.acento, 0.88, [1253, 332], { tIn: 2.92, tOut: 4.40, sobe: 1520 }),
  peca(estrela(1403, 432, 64, 72), COR.areia, 0.94, [1403, 432], { tIn: 3.06, tOut: 4.40, sobe: 1520 }),
  ...ramo(1.55, 4.78, 101, [1900, -30, 1840, 140], [
    [1852, 118, 220, 54, 166, COR.petroleo,     0.64, -18],
    [1880,  62, 400, 92, 158, COR.salviaEscura, 0.74, -26],
    [1870,  22, 350, 80, 172, COR.salvia,       0.70, -22],
  ]),
];

// Saigon 1975: aterro, quarteirões, rio na frente, helicóptero de papel atravessando
const SAIGON = [
  peca(ondulado(926, 16, 420, 44), COR.areia, 0.40, [960, 926], { modo: 'desliza', dir: -1, tIn: 4.85, tOut: 8.22 }),
  peca(predio(940, 566, 152, 990, 41, 2, 8),  COR.salviaEscura, 0.50, [940, 990],  { tIn: 4.95, tOut: 8.14, giro: 2,  resp: 5, ciclos: 2, fase: 0.6 }),
  peca(predio(752, 646, 190, 990, 40, 2, 6),  COR.salvia,       0.56, [752, 990],  { tIn: 5.15, tOut: 8.04, giro: -2, resp: 4, ciclos: 2, fase: 0.3 }),
  peca(predio(1084, 700, 214, 990, 42, 3, 5), COR.petroleo,     0.62, [1084, 990], { tIn: 5.35, tOut: 7.96, giro: -3, resp: 5, ciclos: 2, fase: 0.1 }),
  peca(predio(694, 774, 122, 990, 43, 2, 3),  COR.areia,        0.68, [694, 990],  { tIn: 5.55, tOut: 7.86, giro: 3,  resp: 6, ciclos: 2, fase: 0.9 }),
  peca(ondulado(966, 34, 300, 50), COR.petroleo,     0.76, [960, 966],  { modo: 'desliza', dir: 1,  tIn: 5.72, tOut: 7.72 }),
  peca(ondulado(1036, 40, 260, 51), COR.salviaEscura, 0.84, [960, 1036], { modo: 'desliza', dir: -1, tIn: 5.90, tOut: 7.62 }),
  ...ramo(6.02, 8.02, 111, [1902, -22, 1842, 148], [
    [1854, 126, 214, 52, 165, COR.petroleo,     0.62, -18],
    [1882,  70, 394, 90, 158, COR.salvia,       0.72, -26],
    [1872,  30, 344, 78, 172, COR.salviaEscura, 0.68, -22],
  ]),
];

// Brasil 1965: morros, mar na frente, bandeira verde e amarela
const BRASIL = [
  peca(morro(1540, 972, 780, 440, 62), COR.areia,        0.38, [1540, 972], { tIn: 8.15, tOut: 99, resp: 6, ciclos: 1, fase: 0.2 }),
  peca(morro(1190, 968, 500, 268, 63), COR.salviaEscura, 0.46, [1190, 968], { tIn: 8.35, tOut: 99, resp: 7, ciclos: 1, fase: 0.7 }),
  peca(ondulado(958, 38, 320, 60), COR.petroleo, 0.58, [960, 958],  { modo: 'desliza', dir: 1,  tIn: 8.55, tOut: 99 }),
  peca(ondulado(1030, 44, 280, 61), COR.salvia,   0.68, [960, 1030], { modo: 'desliza', dir: -1, tIn: 8.72, tOut: 99 }),
  peca({ polis: [treme([[852, 452], [865, 452], [865, 952], [852, 952]], semente(76), 0.8)] }, COR.petroleo, 0.78, [858, 952], { tIn: 8.85 }),
  peca(pano(865, 454, 232, 164, 77), COR.salviaEscura, 0.84, [865, 454], { tIn: 8.95 }),
  peca(losango(981, 536, 88, 62, 78), COR.areia, 0.90, [981, 536], { tIn: 9.05 }),
  peca(disco(981, 536, 30, 79), COR.petroleo, 0.95, [981, 536], { tIn: 9.14 }),
  ...ramo(8.58, 99, 121, [1898, -26, 1838, 144], [
    [1850, 122, 218, 54, 166, COR.petroleo,     0.62, -18],
    [1878,  66, 398, 92, 158, COR.salvia,       0.72, -24],
    [1868,  26, 348, 80, 172, COR.salviaEscura, 0.68, -28],
  ]),
];

// helicóptero: peças em coordenadas locais, um grupo que atravessa o quadro
const HELI_ESC = 0.92;
const HELI = [
  peca({ polis: [treme([[-274, -8], [-132, -8], [-132, 10], [-274, 10]], semente(80), 0.9)] }, COR.petroleo, 0.95, [0, 0]),
  peca(oval(0, 0, 132, 52, 81), COR.salviaEscura, 0.96, [0, 0]),
  peca(oval(48, -8, 32, 22, 82), COR.areia, 0.97, [0, 0]),
  peca({ polis: [treme([[-8, -88], [8, -88], [8, -48], [-8, -48]], semente(83), 0.7)] }, COR.tinta, 0.97, [0, 0]),
  peca({ polis: [treme([[-176, -96], [176, -96], [176, -87], [-176, -87]], semente(84), 0.8)] }, COR.tinta, 0.98, [0, -91]),
  peca({ polis: [treme([[-268, -32], [-256, -32], [-256, 28], [-268, 28]], semente(88), 0.7)] }, COR.tinta, 0.98, [-262, -2], { spin: 2.1 }),
  peca({ polis: [treme([[-74, 48], [76, 48], [76, 58], [-74, 58]], semente(85), 0.8)] }, COR.tinta, 0.97, [0, 0]),
  peca({ polis: [treme([[-30, 24], [-20, 24], [-20, 50], [-30, 50]], semente(86), 0.6)] }, COR.tinta, 0.96, [0, 0]),
  peca({ polis: [treme([[28, 24], [38, 24], [38, 50], [28, 50]], semente(87), 0.6)] }, COR.tinta, 0.96, [0, 0]),
];

// ---------------------------------------------------------------- desenho
const cv = document.getElementById('cv'), c = cv.getContext('2d');
let padraoGrao = null;
function caminho(polis) { c.beginPath(); for (const pts of polis) { pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } }
function sombra(L, k) {
  k = k || 1; L = clamp(L, 0, 1.2);
  return [[(3 + 16 * L) * k, (5 + 30 * L) * k, (6 + 34 * L) * k, 0.34 - 0.13 * L], [0.8 * k, 1.6 * k, 1.4 * k, 0.32 * (1 - Math.min(1, L))]];
}
function camera(t, prof) {
  const s = t / DUR;
  const bx = CAM_BALANCO[0] * Math.sin(TAU * (0.55 * s + 0.08)) * prof;
  const by = CAM_BALANCO[1] * Math.sin(TAU * (0.55 * s + 0.33)) * prof;
  const emp = 1 + CAM_EMPURRAO * prof * (0.5 - 0.5 * Math.cos(Math.PI * s));
  c.translate(960, 540); c.scale(emp, emp); c.translate(-960 + bx, -540 + by);
}
function desenhaPeca(f, t, x, y, esc, rot, L, al) {
  c.save(); camera(t, f.prof);
  if (al != null) c.globalAlpha = al;
  c.translate(x, y);
  const ox = f.origem[0], oy = f.origem[1];
  c.translate(ox, oy); c.rotate((rot || 0) * Math.PI / 180); c.scale(esc, esc); c.translate(-ox, -oy);
  for (const [sx, sy, blur, a] of sombra(L)) { c.save(); c.shadowColor = `rgba(${TINTA},${a})`; c.shadowBlur = blur; c.shadowOffsetX = sx; c.shadowOffsetY = sy; c.fillStyle = f.filete; caminho(f.forma.polis); c.fill(); c.restore(); }
  c.fillStyle = f.filete; caminho(f.forma.polis); c.fill();            // filete claro
  c.save(); c.translate(0.8, 2.4); c.fillStyle = f.cor; caminho(f.forma.polis); c.fill(); c.restore();   // o papel
  c.save(); caminho(f.forma.polis); c.clip();
  if (f.forma.detalhes) { c.fillStyle = mistura(f.cor, COR.creme, 0.62); for (const d of f.forma.detalhes) { caminho(d.polis); c.fill(); } }
  if (f.forma.nervuras) { c.strokeStyle = f.nervura; c.lineWidth = 3; c.lineCap = 'round'; c.globalAlpha = 0.55; for (const n of f.forma.nervuras) { c.beginPath(); n.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); } c.globalAlpha = 1; }
  c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.62; c.fillStyle = padraoGrao; c.fillRect(-2600, -1400, 7000, 3600);
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- batidas
// cada peça pousa (back.out 0,8 s, 3,5% maior no ar, sombra larga) e sai levantando (power2.in)
function desenhaCena(f, t) {
  const p = seg(t, f.tIn, f.dur || 0.8, 'back.out(1.2)');
  const q = seg(t, f.tOut, 0.45, 'power2.in');
  if (p <= 0.0005 || q >= 0.999) return;
  const L1 = 1 - seg(t, f.tIn + 0.18, 0.55, 'power2.inOut');
  const L2 = seg(t, f.tOut, 0.16, 'power2.out');
  const L = Math.max(L1 * (1 - Math.min(1, q * 2.2)), L2);
  const sobe = f.sobe || (f.origem[1] + 520);      // alto o bastante para a peça sair do quadro
  let dx = 0, dy = 0;
  if (f.modo === 'desliza') dx = f.dir * ((1 - p) + q) * 3400;
  else if (f.modo === 'afunda') dy = (1 - p) * sobe + q * (f.afunda || 560);   // chão desce e sai pelo pé do quadro
  else { dy = (1 - p) * sobe - q * sobe; }
  const b = f.resp ? f.resp * Math.sin(TAU * (f.ciclos * t / DUR + f.fase)) : 0;
  dy -= b;
  const esc = 1 + 0.035 * L + 0.004 * Math.abs(b) / 10;
  const rot = (1 - p) * (f.giro || 0) + q * (f.giro || 0) * 0.8;
  desenhaPeca(f, t, dx, dy, esc, rot, L);
}
// helicóptero: cruza o quadro em "depois" (5,5) e já saiu antes das letras de Saigon caírem
function desenhaHelico(t) {
  const t0 = 4.70, dur = 1.95;
  if (t < t0 || t > t0 + dur) return;
  const u = (t - t0) / dur, e = ease('power1.inOut')(u);
  const x = mix(-320, 2260, u * 0.3 + e * 0.7);
  const y = 372 + 24 * Math.sin(TAU * 1.5 * u);
  const incl = -4 + 2.2 * Math.sin(TAU * 2 * u);
  const giroRotor = 560 * (t - t0);
  const L = 0.55 + 0.1 * Math.sin(TAU * 2 * u);
  for (const f of HELI) {
    const rot = incl + (f.spin ? giroRotor * f.spin : 0);
    desenhaPeca(f, t, x, y, HELI_ESC, rot, L);
  }
}

// ---------------------------------------------------------------- letras: cada uma é um papelzinho
let letras = null;
function medirLetras() {
  letras = [];
  const R = semente(77);
  for (const L of LINHAS) {
    c.font = `italic 500 ${L.tam}px ${FONTE}`;
    const conta = Array.from(L.txt).filter(ch => ch !== ' ').length; L.n = conta;
    let x = L.x, k = 0;
    for (const ch of L.txt) {
      const w = c.measureText(ch).width;
      if (ch !== ' ') { letras.push({ ch, x, w, L, k, rot: (R() - 0.5) * 14, dx: (R() - 0.5) * 34, dy: -20 - R() * 36 }); k++; }
      x += w + 0.01 * L.tam;
    }
  }
}
function desenhaLetras(t) {
  if (!letras) return;
  c.save(); camera(t, 0.6);
  for (const l of letras) {
    const L = l.L, ti = L.t0 + l.k * L.passo;
    if (t < ti) continue;
    const pIn = seg(t, ti, 0.5, 'back.out(1.4)'), a = seg(t, ti, 0.18, 'power1.out');
    const lev = 1 - seg(t, ti + 0.1, 0.42, 'power2.inOut');
    const to = L.tOut + (L.n - l.k) * 0.018;
    const q = t > L.tOut ? seg(t, to, 0.34, 'power2.in') : 0;
    const op = t > L.tOut ? a * (1 - seg(t, to + 0.14, 0.2, 'power1.in')) : a;
    if (op <= 0.002) continue;
    const esc = 1 + 0.32 * (1 - pIn) + 0.36 * q + 0.03 * lev;
    const x = l.dx * (1 - pIn) - l.dx * q, y = l.dy * (1 - pIn) + l.dy * 1.2 * q, rot = (l.rot * (1 - pIn) - l.rot * q) * Math.PI / 180;
    const ks = L.tam / 230 * 0.55, ox = l.x + l.w / 2, oy = L.base - 0.3 * L.tam;
    c.save(); c.globalAlpha = op; c.translate(ox + x, oy + y); c.rotate(rot); c.scale(esc, esc); c.translate(-ox, -oy);
    c.font = `italic 500 ${L.tam}px ${FONTE}`; c.textBaseline = 'alphabetic'; c.fillStyle = L.cor;
    for (const [sx, sy, blur, al] of [[(3 + 16 * lev) * ks, (5 + 30 * lev) * ks, (6 + 30 * lev) * ks, 0.28 - 0.1 * lev], [0.7 * ks, 1.4 * ks, 1.2 * ks, 0.35 * (1 - Math.min(1, lev))]]) {
      c.shadowColor = `rgba(${TINTA},${al})`; c.shadowBlur = blur; c.shadowOffsetX = sx; c.shadowOffsetY = sy; c.fillText(l.ch, l.x, L.base);
    }
    c.shadowColor = 'transparent'; c.fillText(l.ch, l.x, L.base);
    c.restore();
  }
  c.restore();
}

function render(t) {
  if (!document.fonts.check(`italic 500 40px ${FONTE}`)) return;
  if (!padraoGrao) padraoGrao = c.createPattern(grao, 'repeat');
  if (!letras) medirLetras();
  c.save();
  // a página: creme, vinheta leve, grão
  c.fillStyle = COR.creme; c.fillRect(0, 0, W, H);
  const vin = c.createRadialGradient(760, 440, 300, 760, 440, 1260); vin.addColorStop(0.55, `rgba(${TINTA},0)`); vin.addColorStop(1, `rgba(${TINTA},0.10)`);
  c.fillStyle = vin; c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.9; c.fillStyle = padraoGrao; c.fillRect(0, 0, W, H); c.restore();

  for (const f of HANOI) desenhaCena(f, t);
  for (const f of SAIGON) desenhaCena(f, t);
  desenhaHelico(t);
  for (const f of BRASIL) desenhaCena(f, t);
  desenhaLetras(t);
  c.restore();
}

// ---------------------------------------------------------------- relógio
const rel = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(rel, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => render(Math.min(DUR, rel.t)) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.addEventListener('load', () => render(tl.time()));
document.fonts.ready.then(() => { letras = null; render(tl.time()); });
