// cena.js: Saigon 29–30/04 no estilo documento-vira-video (motor copiado do estilo.js, cena nova).
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (x, a, b) => clamp((x - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const suave = (x) => x * x * (3 - 2 * x);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inCubic = (x) => x * x * x;
const outBack = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const TAU = Math.PI * 2;
const hash = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const sgn = (i) => hash(i) * 2 - 1;

const rgbDe = (cor) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((cor || "").trim());
  if (!m) return [128, 128, 128];
  const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (cor, a = 1) => {
  const [r, g, b] = Array.isArray(cor) ? cor : rgbDe(cor);
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
};
// interpolação de matiz (HSL): o espectro nasce só das duas cores do tema
const hsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2, d = M - m;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const rgbDeHsl = ([h, s, l]) => {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const hh = ((h % 360) + 360) % 360;
  const [r, g, b] = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x] : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};
const matiz = (a, b, k) => {
  const p = hsl(rgbDe(a)), q = hsl(rgbDe(b));
  // o caminho longo do círculo de matizes: passa pelas cores intermediárias e dá um espectro de verdade
  let dh = q[0] - p[0];
  if (Math.abs(dh) < 180) dh = dh > 0 ? dh - 360 : dh + 360;
  return rgbDeHsl([p[0] + dh * k, clamp(lerp(p[1], q[1], k), 0.6, 0.8), clamp(lerp(p[2], q[2], k), 0.45, 0.56)]);
};
const mix = (a, b, k) => {
  const p = Array.isArray(a) ? a : rgbDe(a);
  const q = Array.isArray(b) ? b : rgbDe(b);
  return [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
};

// ---------- caches (chave inclui o tamanho e as cores) ----------
const cache = new Map();
const guardar = (chave, fazer) => {
  if (!cache.has(chave)) {
    if (cache.size > 24) cache.clear();
    cache.set(chave, fazer());
  }
  return cache.get(chave);
};
const novaTela = (w, h) => {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
// papel: manchas suaves de baixa frequência sobre a cor de papel (ink), num buffer pequeno ampliado
const texturaPapel = (th) =>
  guardar(`papel|${th.ink}|${th.bg}`, () => {
    const W = 192, H = 192;
    const c = novaTela(W, H);
    const x = c.getContext("2d");
    const img = x.createImageData(W, H);
    const base = rgbDe(th.ink), tinta = rgbDe(th.bg);
    const ruido = (px, py, f, s) => {
      const gx = (px / W) * f, gy = (py / H) * f;
      const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = suave(gx - x0), fy = suave(gy - y0);
      const v = (i, j) => hash(((i % f) + f) % f * 71.3 + (((j % f) + f) % f) * 13.7 + s);
      return lerp(lerp(v(x0, y0), v(x0 + 1, y0), fx), lerp(v(x0, y0 + 1), v(x0 + 1, y0 + 1), fx), fy);
    };
    for (let j = 0; j < H; j++)
      for (let i = 0; i < W; i++) {
        const n = 0.6 * ruido(i, j, 6, 1) + 0.3 * ruido(i, j, 13, 2) + 0.1 * ruido(i, j, 48, 3);
        const k = clamp((n - 0.35) * 0.16, 0, 0.09);
        const o = (j * W + i) * 4;
        img.data[o] = lerp(base[0], tinta[0], k);
        img.data[o + 1] = lerp(base[1], tinta[1], k);
        img.data[o + 2] = lerp(base[2], tinta[2], k);
        img.data[o + 3] = 255;
      }
    x.putImageData(img, 0, 0);
    return c;
  });
const rascunho = (w, h) => guardar(`rascunho|${w}x${h}`, () => novaTela(w, h));

const tremor = (pts, amp, semente) => pts.map((p, i) => [p[0] + sgn(semente + i * 3.1) * amp, p[1] + sgn(semente + i * 7.7 + 0.5) * amp]);
const caminho = (ctx, pts, fechar = false) => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (fechar) ctx.closePath();
};
const capsula = (ctx, x, y, w, h, r = h / 2) => {
  const q = Math.max(0, Math.min(r, Math.abs(w) / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
};
const estrela = (ctx, x, y, r, k = 0.16, rot = 0) => {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = rot + (i * TAU) / 4, b = a + TAU / 8, c = a + TAU / 4;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.quadraticCurveTo(x + Math.cos(b) * r * k, y + Math.sin(b) * r * k, x + Math.cos(c) * r, y + Math.sin(c) * r);
  }
  ctx.closePath();
};
const subdividir = (pts, n) => {
  const o = [];
  for (let i = 0; i < pts.length - 1; i++)
    for (let k = 0; k < n; k++) o.push([lerp(pts[i][0], pts[i + 1][0], k / n), lerp(pts[i][1], pts[i + 1][1], k / n)]);
  o.push(pts[pts.length - 1]);
  return o;
};

// ---------- peças do papel ----------
const raios = (g, x, y, dens, giro, bk) => {
  const { ctx, th, w, h } = g;
  const u = Math.min(w, h), R = Math.hypot(w, h);
  const n = Math.floor(150 * dens);
  ctx.lineCap = "butt";
  for (let i = 0; i < n; i++) {
    const id = i * 13.1 + bk * 3.3;
    const a = i * 2.39996 + sgn(id) * 0.3 + giro;
    const r0 = u * (0.06 + hash(id + 2) * 0.32), r1 = r0 + u * 0.15 + hash(id + 3) * R;
    ctx.lineWidth = u * (0.0006 + hash(id + 4) * 0.0014);
    ctx.strokeStyle = rgba(th.bg, 0.2 + hash(id + 5) * 0.45);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    ctx.stroke();
  }
};
// miniatura do mundo noturno dentro do portal (em px de tela)
const miolo = (g, x, y, r, T) => {
  const { ctx, th } = g;
  ctx.fillStyle = th.bg;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.clip();
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(mix(th.bg, th.accent, 0.4)));
  gr.addColorStop(1, rgba(th.bg));
  ctx.fillStyle = gr;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  [th.accent, th.accent2, th.ink].forEach((c, i) => {
    ctx.strokeStyle = rgba(c, 0.7);
    ctx.lineWidth = Math.max(0.6, r * 0.012);
    ctx.beginPath();
    ctx.ellipse(x, y, r * (0.5 + i * 0.15), r * (0.22 + i * 0.12), 0.4 + i * 0.9 + T * 0.3, 0, TAU);
    ctx.stroke();
  });
  ctx.fillStyle = rgba(mix(th.ink, th.accent2, 0.15), 0.35);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.18, 0, TAU);
  ctx.fill();
  ctx.fillStyle = th.ink;
  estrela(ctx, x, y, r * 0.09);
  ctx.fill();
  ctx.restore();
};
const ceu = (g) => {
  const { ctx, th, w, h } = g;
  const u = Math.min(w, h);
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, w, h);
  const gr = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) * 0.55);
  gr.addColorStop(0, rgba(mix(th.bg, th.accent, 0.2)));
  gr.addColorStop(1, rgba(th.bg, 0));
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = rgba(th.ink, 0.55);
  for (let i = 0; i < 70; i++) {
    const r = u * (0.0015 + hash(i + 0.7) * 0.002);
    ctx.globalAlpha = 0.35 + hash(i + 3.3) * 0.6;
    ctx.fillRect(hash(i + 1.1) * w, hash(i + 2.2) * h, r, r);
  }
  ctx.globalAlpha = 1;
};
const coresFaixas = (th) => [0, 1, 2, 3, 4, 5].map((i) => matiz(th.accent2, th.accent, i / 5));
