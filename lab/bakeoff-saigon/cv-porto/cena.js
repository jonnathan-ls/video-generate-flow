// cena.js — o horizonte de Saigon desenhado em canvas 2D (só silhueta, com névoa), como o panorama do estilo.
// Panorama em graus: x = azimute, y = elevação em graus de tangente (0 = horizonte).
const D2R = Math.PI / 180;
const c01 = x => Math.max(0, Math.min(1, x));
const gray = v => { const c = Math.round(c01(v) * 255); return `rgb(${c},${c},${c})`; };
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function rect(x0, y0, x1, y1) { const p = new Path2D(); p.rect(x0, y0, x1 - x0, y1 - y0); return p; }
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }

function Pano(az0, az1, e0, e1, ppd) {
  const P = { az0, az1, ppd, s0: Math.tan(e0 * D2R) / D2R, s1: Math.tan(e1 * D2R) / D2R };
  P.W = Math.round((az1 - az0) * ppd); P.H = Math.round((P.s1 - P.s0) * ppd);
  const cv = document.createElement('canvas'); cv.width = P.W; cv.height = P.H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.setTransform(ppd, 0, 0, -ppd, -az0 * ppd, P.s1 * ppd);
  P.g = g; P.cv = cv; return P;
}

// Saigon ao longe: telhados baixos, poucas torres, a catedral de duas torres, copas de árvore e palmeiras.
function cenaS() {
  const P = Pano(-60, 200, -1.2, 9, 26), g = P.g, r = rng(21);
  const F = (path, h, w) => { if (w) { g.strokeStyle = gray(h); g.lineWidth = w; g.lineCap = 'round'; g.stroke(path); } else { g.fillStyle = gray(h); g.fill(path); } };
  // faixa de telhados: três planos, o de trás mais claro (névoa)
  for (const [hz, hmax, lo] of [[0.8, 0.9, 0.2], [0.7, 0.7, 0.25], [0.6, 0.55, 0.3]]) {
    for (let x = -60; x < 200; x += 0.3 + r() * 0.9) {
      const w = 0.35 + r() * 1.2, h = lo + r() * hmax * (r() < 0.12 ? 1.9 : 1);
      F(rect(x, -0.3, x + w, h), hz + r() * 0.04);
      if (r() < 0.25) F(poly([[x - 0.05, h], [x + w * 0.5, h + 0.14], [x + w + 0.05, h]]), hz + 0.02);   // telhado de duas águas
      if (r() < 0.1) F(rect(x + w * 0.4, h, x + w * 0.45, h + 0.4), hz);                                 // antena
    }
  }
  // torres de meio de distância
  [[-34, 1.1, 3.4], [-31.6, 0.9, 2.5], [18, 1.0, 3.0], [21, 0.8, 2.2], [82, 1.2, 3.6], [85.5, 0.9, 2.6], [118, 1.0, 3.1], [165, 1.1, 3.3], [168, 0.8, 2.3]].forEach(([x, w, h]) => {
    F(rect(x - w / 2, -0.3, x + w / 2, h), 0.66); F(rect(x - w / 2 - 0.08, h, x + w / 2 + 0.08, h + 0.08), 0.66);
  });
  // a catedral: duas torres finas com ponta
  [[-14.6, 3.5], [-13.5, 3.5]].forEach(([x, h]) => { F(rect(x - 0.28, -0.3, x + 0.28, h), 0.7); F(poly([[x - 0.34, h], [x, h + 1.2], [x + 0.34, h]]), 0.7); });
  F(rect(-15.0, -0.3, -13.1, 1.9), 0.7);
  // linha de árvores e palmeiras mais perto
  const arv = new Path2D(); arv.moveTo(-60, -0.3);
  for (let x = -60; x <= 200.01; x += 0.12) arv.lineTo(x, 0.22 + 0.13 * Math.sin(x * 1.7) + 0.09 * Math.sin(x * 4.3 + 1) + 0.05 * Math.sin(x * 9.1));
  arv.lineTo(200, -0.3); arv.closePath(); F(arv, 0.3);
  for (let x = -58; x < 198; x += 2.5 + r() * 5) {
    const h = 1.6 + r() * 1.1, q = new Path2D(); q.moveTo(x, -0.2); q.quadraticCurveTo(x + 0.08 * (r() - 0.5), h * 0.5, x + 0.05, h);
    F(q, 0.28, 0.07);
    const f = new Path2D();
    for (let k = 0; k < 7; k++) { const a = Math.PI * (0.08 + k / 6 * 0.84), L = 0.55 + r() * 0.2; f.moveTo(x + 0.05, h); f.quadraticCurveTo(x + 0.05 + Math.cos(a) * L * 0.6, h + Math.sin(a) * L * 0.6 + 0.12, x + 0.05 + Math.cos(a) * L, h + Math.sin(a) * L * 0.5 - 0.18); }
    F(f, 0.28, 0.05);
  }
  return P;
}
