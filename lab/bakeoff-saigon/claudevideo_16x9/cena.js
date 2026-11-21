// cena.js — Saigon, 29 e 30 de abril de 1975, desenhada em canvas 2D no mesmo mecanismo do estilo
// "porto de Nova York": um panorama em graus (x = azimute, y = elevação) com camadas de dia, noite,
// chave de luz e névoa. O motor lê cada camada como textura.
const D2R = Math.PI / 180;
const c01 = x => Math.max(0, Math.min(1, x));
const gray = v => { const c = Math.round(c01(v) * 255); return `rgb(${c},${c},${c})`; };
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function mulHex(hex, k) { const n = parseInt(hex.slice(1), 16), f = v => Math.round(Math.min(255, v * k)); return `rgb(${f(n >> 16 & 255)},${f(n >> 8 & 255)},${f(n & 255)})`; }

function rect(x0, y0, x1, y1) { const p = new Path2D(); p.rect(x0, y0, x1 - x0, y1 - y0); return p; }
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function oval(x, y, rx, ry) { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; }
function polyline(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); return p; }

function Pano(az0, az1, e0, e1, ppd, layers) {
  const P = { az0, az1, ppd, s0: Math.tan(e0 * D2R) / D2R, s1: Math.tan(e1 * D2R) / D2R, c: {}, cv: {} };
  P.W = Math.round((az1 - az0) * ppd); P.H = Math.round((P.s1 - P.s0) * ppd);
  const BG = { day: null, night: '#000', key: '#fff', haze: '#000' };
  for (const k of layers) {
    const cv = document.createElement('canvas'); cv.width = P.W; cv.height = P.H;
    const g = cv.getContext('2d', { willReadFrequently: true });
    if (BG[k]) { g.fillStyle = BG[k]; g.fillRect(0, 0, P.W, P.H); }
    g.setTransform(ppd, 0, 0, -ppd, -az0 * ppd, P.s1 * ppd);
    P.c[k] = g; P.cv[k] = cv;
  }
  return P;
}
function put(P, path, o, rule = 'nonzero') {
  const go = (g, style) => {
    if (o.w) { g.strokeStyle = style; g.lineWidth = o.w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(path); }
    else { g.fillStyle = style; g.fill(path, rule); }
  };
  const c = P.c;
  if (c.day) go(c.day, o.day);
  if (c.night) go(c.night, o.night || '#000');
  if (c.key) go(c.key, gray(o.key ?? 1));
  if (c.haze) go(c.haze, gray(o.haze ?? 0));
}
function paint(P, path, col, clip, w) {
  const g = P.c.day; g.save(); if (clip) g.clip(clip);
  if (w) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(path); } else { g.fillStyle = col; g.fill(path); }
  g.restore();
}
function light(P, path, col, key, clip, w) {
  for (const [g, s] of [[P.c.night, col], [P.c.key, gray(key)]]) {
    g.save(); if (clip) g.clip(clip);
    if (w) { g.strokeStyle = s; g.lineWidth = w; g.lineCap = 'round'; g.stroke(path); } else { g.fillStyle = s; g.fill(path); }
    g.restore();
  }
}

// ═════════ Saigon, 15 s: o telhado (A), a avenida e o palácio (B/C), a rua (D) ═════════
const PAL_X0 = 48.6, PAL_X1 = 67.6;   // o palácio presidencial, em azimute
const DOOR_X = 57.4;                  // o vão central, onde fica a silhueta do presidente
const GATE_X0 = 56.2, GATE_X1 = 62.4; // o portão, que cai às 7,96 s

function cenaS() {
  const P = Pano(-8, 112, -4, 17, 40, ['day', 'night', 'key', 'haze']);
  const r = rng(23);
  const WIN = ['#ffcf8c', '#ffe2b2', '#ffc473', '#fff0d0', '#ffd79a', '#e9ecff'];
  const CITY = ['#4c4059', '#57485f', '#453a52', '#5c4d66', '#514460'];
  const winCol = () => WIN[Math.floor(r() * WIN.length)];
  const kAt = y => 0.04 + 0.85 * c01(y / 9);

  // ── prédio de esquina baixo: face + lateral em sombra + janelas ──
  function predio(x, w, h, o = {}) {
    const hz = o.hz ?? 0.42, col = o.col ?? CITY[Math.floor(r() * CITY.length)];
    const x0 = x - w / 2, x1 = x + w / 2, path = o.path || rect(x0, -0.4, x1, h);
    put(P, path, { day: col, haze: hz });
    paint(P, rect(x1 - w * 0.34, -0.4, x1 + 0.01, h + 2), mulHex(col, 0.78), path);
    if (o.win !== false) {
      const fl = o.fl ?? 0.55, cw = o.cw ?? 0.16;
      for (let y = 0.25; y < (o.winTop ?? h) - 0.2; y += fl) {
        if (r() < 0.12) continue;
        for (let xx = x0 + 0.1; xx < x1 - 0.12; xx += cw) {
          if (r() > (o.dens ?? 0.4)) continue;
          light(P, rect(xx, y, xx + cw * 0.5, y + fl * 0.42), winCol(), kAt(y) + 0.1 * r(), path);
        }
      }
    }
    return path;
  }

  // ── 1. a cidade ao longe: casario baixo, torre de igreja, caixas d'água (1975, sem arranha-céu) ──
  for (let x = -8; x < 112; x += 0.55 + r() * 1.1) {
    const h = 0.7 + r() * 1.9 + (x > 70 && x < 92 ? 0.5 : 0);
    predio(x, 0.5 + r() * 1.3, h, { hz: .66 + r() * .06, dens: .3, fl: .5, cw: .14 });
  }
  (function igreja(x) {                     // torre de igreja, sem cruz detalhada: só a silhueta
    const hz = .62, col = '#6a5c78', p = new Path2D();
    p.rect(x - 0.32, -0.4, 0.64, 3.0); p.rect(x - 0.2, 3.0, 0.4, 3.7);
    p.moveTo(x - 0.24, 3.7); p.lineTo(x + 0.24, 3.7); p.lineTo(x, 5.2); p.closePath();
    put(P, p, { day: col, haze: hz });
    light(P, rect(x - 0.07, 3.25, x + 0.07, 3.7), '#ffdc9e', .84, p);
    light(P, rect(x - 0.06, 2.2, x + 0.06, 2.55), '#ffdc9e', .82, p);
  })(33.5);
  for (const [x, h] of [[21.5, 4.1], [45.5, 3.9], [93.5, 4.4], [104, 4.0]]) {   // caixas d'água e antenas
    const hz = .6;
    put(P, poly([[x - 0.34, h], [x + 0.34, h], [x + 0.24, h + 0.55], [x - 0.24, h + 0.55]]), { day: '#5b4d6b', haze: hz });
    put(P, poly([[x - 0.34, h], [x - 0.26, h - 0.7], [x + 0.26, h - 0.7], [x + 0.34, h]]), { day: '#5b4d6b', haze: hz });
    put(P, rect(x - 0.02, h + 0.55, x + 0.02, h + 1.25), { day: '#4d4160', haze: hz, w: 0.035 });
  }
  // fileira da frente, mais escura e mais baixa
  for (let x = -8; x < 112; x += 0.5 + r() * 0.9) {
    const h = 0.5 + r() * 1.35;
    predio(x, 0.5 + r() * 0.9, h, { hz: .48 + r() * .06, dens: .34, fl: .48, cw: .15 });
  }

  // ── 2. mata baixa: árvores de rua, em grupos redondos de tamanhos variados ──
  function mata(x0, x1, hmin, hmax, hz, col, base = -0.4) {
    const ph = [r() * 6.3, r() * 6.3];
    const topo = x => hmin * 0.55 + (hmax - hmin) * 0.55 * (0.5 + 0.5 * Math.sin(x * 1.35 + ph[0])) + 0.06 * Math.sin(x * 4.3 + ph[1]);
    const p = new Path2D(); p.moveTo(x0, base);
    for (let x = x0; x <= x1; x += 0.05) p.lineTo(x, Math.max(0.06, topo(x)));
    p.lineTo(x1, base); p.closePath();
    put(P, p, { day: col, haze: hz });
    const q = new Path2D();
    for (let x = x0 + 0.15; x < x1 - 0.15; x += 0.25 + r() * 0.55) {
      const hh = hmin + r() * (hmax - hmin), n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const rw = (0.16 + r() * 0.3) * Math.min(1, hh * 1.4), cx = x + (k - (n - 1) / 2) * rw * 0.9, cy = hh - rw * (0.7 + r() * 0.35);
        q.moveTo(cx + rw, cy); q.ellipse(cx, cy, rw, rw * (0.8 + r() * 0.25), 0, 0, Math.PI * 2);
      }
    }
    put(P, q, { day: col, haze: hz });
    return p;
  }
  mata(20, 33, 1.6, 3.4, .34, '#3c3348');
  mata(34, 47.5, 1.3, 3.0, .34, '#3c3348');
  mata(68.5, 82, 1.4, 3.2, .2, '#332c40');
  mata(83, 96, 1.2, 2.8, .2, '#332c40');
  mata(97, 111, 1.3, 3.0, .3, '#3c3348');

  // ── 3. o prédio do telhado (cena A): fachada de concreto, escada de mão, caixa de escada ──
  (function telhado() {
    const hz = .1, col = '#413648';
    const X0 = 1.2, X1 = 20.2, ROOF = 6.0, p = rect(X0, -0.6, X1, ROOF);
    put(P, p, { day: col, haze: hz });
    paint(P, rect(X0 + 11.2, -0.6, X1 + 0.02, ROOF + 2), '#352b3d', p);   // lado em sombra
    paint(P, rect(X0, ROOF - 0.18, X1, ROOF), '#57475c', p);              // faixa de laje
    // janelas fundas, uma ou outra acesa; peitoris marcam os andares
    for (let y = 0.55; y < 5.4; y += 0.86) {
      paint(P, rect(X0, y + 0.6, X1, y + 0.66), '#4d3f56', p);
      for (let x = X0 + 0.55; x < X1 - 0.75; x += 1.35) {
        const patio = rect(x, y, x + 0.85, y + 0.5);
        paint(P, patio, '#241d2c', p);
        if (r() < 0.2) light(P, patio, winCol(), kAt(y) + 0.05 * r(), p);
      }
    }
    // toldos baixos na rua
    for (let x = X0 + 0.6; x < X1 - 1.4; x += 1.9 + r() * 1.4) {
      paint(P, poly([[x, 2.75], [x + 1.5, 2.75], [x + 1.28, 2.12], [x + 0.18, 2.12]]), '#3b3044', p);
    }
    // parapeito
    put(P, rect(X0, ROOF, X1, ROOF + 0.42), { day: '#4c3d52', haze: hz });
    paint(P, rect(X0, ROOF + 0.34, X1, ROOF + 0.42), '#5b4a60');
    // caixa de escada: é por ela que as pessoas sobem
    const hut = new Path2D(); hut.rect(X0 + 1.6, ROOF + 0.42, 4.4, 2.1);
    put(P, hut, { day: '#4a3b50', haze: hz });
    paint(P, poly([[X0 + 1.6, ROOF + 2.52], [X0 + 6.0, ROOF + 2.52], [X0 + 6.6, ROOF + 2.72], [X0 + 2.2, ROOF + 2.72]]), '#3a2e42', hut);
    paint(P, rect(X0 + 2.6, ROOF + 0.42, X0 + 3.5, ROOF + 1.55), '#1d1824', hut);   // porta
    light(P, rect(X0 + 2.6, ROOF + 0.7, X0 + 3.5, ROOF + 1.55), '#ffcb8a', .26, hut);
    // antena e mastro
    put(P, rect(X0 + 3.0, ROOF + 2.72, X0 + 3.06, ROOF + 4.6), { day: '#3a2e42', haze: hz, w: 0.05 });
    for (const [yy, wd] of [[ROOF + 3.45, 0.5], [ROOF + 3.95, 0.7], [ROOF + 4.4, 0.45]]) put(P, rect(X0 + 3.03 - wd / 2, yy, X0 + 3.03 + wd / 2, yy + 0.045), { day: '#3a2e42', haze: hz });
    // caixa d'água na outra ponta
    put(P, rect(X0 + 14.2, ROOF + 0.42, X0 + 15.6, ROOF + 0.95), { day: '#352b3d', haze: hz });
    put(P, oval(X0 + 14.9, ROOF + 1.75, 0.7, 0.8), { day: '#4a3b50', haze: hz });
    put(P, rect(X0 + 14.9 - 0.05, ROOF + 0.95, X0 + 14.9 + 0.05, ROOF + 1.2), { day: '#352b3d', haze: hz });
    // escada de mão: da rua ao parapeito, no vão entre duas janelas
    const LAD = 7.9;
    const rail = new Path2D();
    rail.moveTo(LAD, -0.5); rail.lineTo(LAD + 0.9, ROOF + 0.15);
    rail.moveTo(LAD + 0.34, -0.5); rail.lineTo(LAD + 1.24, ROOF + 0.15);
    for (let k = 0; k <= 12; k++) { const yy = -0.4 + k * (ROOF + 0.4) / 12, xx = LAD + 0.02 + k * 0.9 / 12; rail.moveTo(xx, yy); rail.lineTo(xx + 0.34, yy); }
    put(P, rail, { day: '#6d5c73', haze: hz, w: 0.045 });
    // ar condicionado, canos
    for (const [x, y] of [[X0 + 9.2, 3.1], [X0 + 11.4, 4.9], [X0 + 16.9, 2.3]]) paint(P, rect(x, y, x + 0.7, y + 0.4), '#332a3c', p);
  })();

  // ── 4. o palácio presidencial (1966): laje modernista, brise-soleil, jardim e muro com portão ──
  (function palacio() {
    const hz = .09, stone = '#6c5c62', stoneDark = '#50444e';
    // jardim à frente
    put(P, rect(46.5, -0.3, 69.7, 1.02), { day: '#443c48', haze: .1 });
    put(P, rect(46.5, 0.9, 69.7, 1.16), { day: '#554a58', haze: .1 });
    // o corpo: térreo recuado, dois andares de brise, laje de coroamento
    const corpo = new Path2D();
    corpo.rect(PAL_X0 + 1.1, 1.16, (PAL_X1 - PAL_X0) - 2.2, 1.5);
    corpo.rect(PAL_X0, 2.66, PAL_X1 - PAL_X0, 3.95);
    put(P, corpo, { day: stone, haze: hz, key: .34 });
    paint(P, rect(PAL_X0, 2.66, PAL_X1, 2.78), '#96827f', corpo);
    // térreo: sombra funda com colunas
    const terr = rect(PAL_X0 + 1.1, 1.16, PAL_X1 - 1.1, 2.66);
    put(P, terr, { day: '#2e2634', haze: hz, key: .3 });
    for (let x = PAL_X0 + 1.5; x < PAL_X1 - 1.3; x += 1.1) paint(P, rect(x, 1.16, x + 0.28, 2.66), stoneDark);
    // algumas salas acesas no térreo, acendendo de baixo para cima
    for (let x = PAL_X0 + 1.9; x < PAL_X1 - 2; x += 1.9) if (r() < 0.5) light(P, rect(x, 1.5, x + 0.86, 2.3), winCol(), kAt(1.5) + 0.15 * r(), terr);
    // vão central, com luz dentro: é ali que a silhueta aparece
    const door = rect(DOOR_X - 1.05, 1.16, DOOR_X + 1.05, 3.0);
    put(P, door, { day: '#241c28', haze: hz, key: .62, night: '#f0b26a' });
    paint(P, rect(DOOR_X - 1.05, 2.42, DOOR_X + 1.05, 2.66), '#7a676c');
    // brise-soleil: dois andares de lâminas verticais; algumas janelas atrás delas acendem
    for (const [y0, y1] of [[2.78, 4.28], [4.28, 5.78]]) {
      paint(P, rect(PAL_X0 + 0.1, y0, PAL_X1 - 0.1, y1), '#2f2736');
      for (let x = PAL_X0 + 0.4; x < PAL_X1 - 0.45; x += 0.9) if (r() < 0.55) {
        light(P, rect(x, y0 + 0.3, x + 0.5, y0 + 0.74), winCol(), kAt(y0) + 0.14 * r());
      }
      const slats = new Path2D();
      for (let x = PAL_X0 + 0.18; x < PAL_X1 - 0.1; x += 0.3) slats.rect(x, y0 + 0.08, 0.11, y1 - y0 - 0.16);
      put(P, slats, { day: stoneDark, haze: hz, key: .3 });
      paint(P, rect(PAL_X0 + 0.1, y0, PAL_X1 - 0.1, y0 + 0.1), '#a5928c');
    }
    // laje de coroamento, fina e clara
    put(P, rect(PAL_X0 - 0.5, 5.78, PAL_X1 + 0.5, 6.16), { day: '#9c8885', haze: hz, key: .3 });
    paint(P, rect(PAL_X0 - 0.5, 6.02, PAL_X1 + 0.5, 6.16), '#b7a39c');
    // bandeira do Vietnã do Sul, a meio mastro
    put(P, rect(63.2, 6.16, 63.26, 9.4), { day: '#5b4e5c', haze: hz, w: 0.05 });
    put(P, poly([[63.26, 8.55], [65.2, 8.75], [65.2, 9.35], [63.26, 9.2]]), { day: '#b5a374', haze: .22 });
    for (const yy of [8.72, 8.93, 9.14]) paint(P, poly([[63.26, yy], [65.2, yy + 0.09], [65.2, yy + 0.2], [63.26, yy + 0.11]]), '#8a4b4b');
    // muro e grade, com o vão do portão e os pilares
    const muro = new Path2D();
    muro.rect(46.5, 0.16, GATE_X0 - 46.5, 0.84); muro.rect(GATE_X1, 0.16, 69.7 - GATE_X1, 0.84);
    put(P, muro, { day: '#645365', haze: .12 });
    paint(P, rect(46.5, 0.86, GATE_X0, 1.0), '#77637a', muro);
    paint(P, rect(GATE_X1, 0.86, 69.7, 1.0), '#77637a', muro);
    const grade = new Path2D();
    for (let x = 46.8; x < GATE_X0 - 0.3; x += 0.22) { grade.moveTo(x, 0.32); grade.lineTo(x, 0.86); }
    for (let x = GATE_X1 + 0.3; x < 69.6; x += 0.22) { grade.moveTo(x, 0.32); grade.lineTo(x, 0.86); }
    put(P, grade, { day: '#463a4e', haze: .12, w: 0.035 });
    for (const x of [GATE_X0 - 0.55, GATE_X1 + 0.55]) {
      put(P, rect(x - 0.24, 0.05, x + 0.24, 1.55), { day: '#847483', haze: .1, key: .3 });
      paint(P, rect(x - 0.24, 1.42, x + 0.24, 1.55), '#a08c88');
    }
    light(P, rect(GATE_X0 - 0.3, 1.72, GATE_X0 - 0.12, 1.9), '#ffe2a8', .3);
    light(P, rect(GATE_X1 + 0.12, 1.72, GATE_X1 + 0.3, 1.9), '#ffe2a8', .3);
    // a entrada de automóveis atrás do portão: sombra funda até o palácio
    put(P, rect(GATE_X0 + 0.2, -0.3, GATE_X1 - 0.2, 1.5), { day: '#2e2636', haze: .08 });
    paint(P, rect(GATE_X0 + 0.2, 1.26, GATE_X1 - 0.2, 1.5), '#7b6874');
  })();

  // ── 5. muro e casario à direita e à esquerda do palácio ──
  const muroR = rect(69.7, -0.2, 112, 0.9); put(P, muroR, { day: '#6a5b68', haze: .16 });
  paint(P, rect(69.7, 0.78, 112, 0.9), '#7d6c75', muroR);
  for (let x = 70; x < 112; x += 0.9 + r() * 1.6) predio(x, 1.2 + r() * 2.2, 1.4 + r() * 2.4, { hz: .24, dens: .36, fl: .56, cw: .17 });

  // ── 6. postes de luz e fios sobre a avenida ──
  const postes = [23, 30.5, 38, 45.2, 70.5, 78, 86, 94, 103];
  for (const x of postes) {
    put(P, rect(x, -0.2, x + 0.09, 3.3), { day: '#4b4052', haze: .2, w: 0.06 });
    put(P, poly([[x + 0.05, 3.3], [x - 0.6, 3.42], [x - 0.6, 3.46], [x + 0.05, 3.36]]), { day: '#4b4052', haze: .2 });
    light(P, oval(x - 0.55, 3.28, 0.11, 0.09), '#ffd79c', .4);
  }
  const fios = new Path2D();
  for (let i = 0; i < postes.length - 1; i++) {
    const a = postes[i], b = postes[i + 1];
    fios.moveTo(a + 0.05, 3.34); fios.quadraticCurveTo((a + b) / 2, 3.0, b + 0.05, 3.34);
  }
  put(P, fios, { day: '#3d3446', haze: .34, w: 0.03 });

  // ── 7. a rua: calçada clara, meio-fio e asfalto. O chão do shader completa abaixo ──
  put(P, rect(-8, -0.9, 112, -0.2), { day: '#4e4350', haze: .06 });
  paint(P, rect(-8, -0.9, 112, -0.79), '#75657a');
  paint(P, rect(-8, -0.6, 112, -0.52), '#463b4c');
  paint(P, rect(-8, -0.26, 112, -0.2), '#3c3344');
  for (let x = -8; x < 112; x += 3.4) paint(P, rect(x, -2.9, x + 1.7, -2.78), '#5e5160');

  return P;
}
