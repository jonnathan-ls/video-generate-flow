// motor.js — um relógio só: render(t) monta o quadro inteiro a partir do tempo.
// Mesmo mecanismo do estilo "porto de Nova York": shader WebGL2 para céu, nuvens, sol e chão;
// silhuetas em canvas 2D como textura; helicóptero, tanque, portão, pessoas e fuzis na camada de cima.
const glc = document.getElementById('gl');
const W = glc.width, H = glc.height, DUR = 15, CAMH = 2.5;
const VERT = H > W;
const FOVK = VERT ? 0.57 : 1;                  // no 9x16 a câmera recompõe: campo horizontal estreito
const RAD = Math.PI / 180;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const sine = x => 0.5 - 0.5 * Math.cos(Math.PI * cl(x));
const seg = (t, a, b, f = sine) => f(cl((t - a) / (b - a)));
const dirOf = (az, el) => [Math.sin(az * RAD) * Math.cos(el * RAD), Math.sin(el * RAD), Math.cos(az * RAD) * Math.cos(el * RAD)];
const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };

// ───────── a câmera: um plano só, quatro batidas. Giros = os picos de movimento do estilo ─────────
const CAMK = [
  [0.00,  6.0, 53, 0.62],
  [0.90,  7.2, 52, 0.62],
  [3.45,  9.2, 50, 0.60],
  [4.90,  9.8, 49, 0.60],   // decolagem em "evacuam" (3,49)
  [6.40, 51.5, 55, 0.57],   // giro 1 (pico)
  [7.30, 56.8, 46, 0.57],
  [8.90, 57.2, 42, 0.57],   // portão cai em "palácio" (7,96)
  [10.90, 57.3, 32, 0.55],  // aproximação lenta
  [12.30, 57.7, 27, 0.55],  // contador em "dois dias" (12,07)
  [12.90, 57.8, 30, 0.56],
  [13.70, 56.6, 37, 0.53],  // giro 2, abre na rua
  [15.00, 56.0, 39, 0.52]
];
function camAt(t) {
  let i = 0; while (i < CAMK.length - 2 && t >= CAMK[i + 1][0]) i++;
  const a = CAMK[i], b = CAMK[i + 1], k = sine((t - a[0]) / (b[0] - a[0]));
  let az = lerp(a[1], b[1], k), hor = lerp(a[3], b[3], k);
  const fov = lerp(a[2], b[2], k) * FOVK;
  // o soco do portão: um tremor curto em 7,96
  if (t > 7.96) {
    const d = t - 7.96, q = Math.exp(-d * 11);
    az += 0.16 * q * Math.sin(d * 62); hor += 0.006 * q * Math.sin(d * 48 + 1.1);
  }
  const tanH = Math.tan(fov / 2 * RAD), tanV = tanH * H / W;
  const pitch = Math.atan((2 * hor - 1) * tanV);
  const cy = Math.cos(az * RAD), sy = Math.sin(az * RAD), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const F = [sy * cp, sp, cy * cp], R = [cy, 0, -sy];
  const U = [F[1] * R[2] - F[2] * R[1], F[2] * R[0] - F[0] * R[2], F[0] * R[1] - F[1] * R[0]];
  return { az, fov, pitch, tanH, tanV, F, R, U };
}
function proj(c, d) {
  const x = d[0] * c.R[0] + d[1] * c.R[1] + d[2] * c.R[2], y = d[0] * c.U[0] + d[1] * c.U[1] + d[2] * c.U[2], z = d[0] * c.F[0] + d[1] * c.F[1] + d[2] * c.F[2];
  if (z <= 0.02) return null;
  return [(x / z / c.tanH + 1) / 2 * W, (1 - y / z / c.tanV) / 2 * H, z];
}
// caixa de um sprite em ângulo → pixels, com a base (o chão) no ponto az/el
function baseBox(c, az, el, wdeg, hdeg) {
  const p = proj(c, dirOf(az, el)); if (!p) return null;
  const s = (W / 2 / c.tanH) / p[2];
  return { x: p[0], y: p[1], w: s * Math.tan(wdeg * RAD), h: s * Math.tan(hdeg * RAD) };
}

// ───────── paleta: tarde empoeirada → crepúsculo → noite, a mesma curva do estilo ─────────
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const KEYS = ['zen', 'mid', 'hor', 'glow', 'glowK', 'belt', 'beltK', 'cLit', 'cDark', 'cloud', 'wispC', 'wispK', 'water', 'silNear', 'amb', 'moonC'];
const PAL = [
  [0.0,  '#8a729e', '#d79e9c', '#f6c99c', '#ffab7a', 0.85, '#e0a2a8', 0.16, '#f2b598', '#a1788e', 0.58, '#e2b0b4', 0.12, '#3b2c3a', '#2a1f2e', '#ffffff', '#f3ddb0'],
  [4.9,  '#8d739c', '#d9a09a', '#f4c397', '#ffa674', 0.75, '#e0a2a8', 0.14, '#f0b296', '#a2788c', 0.55, '#e2b0b4', 0.10, '#392a38', '#291e2c', '#ffffff', '#f3ddb0'],
  [8.6,  '#6c5a93', '#b98aa4', '#eeae8e', '#ff9a68', 0.40, '#d795b4', 0.55, '#e7a0a4', '#8f6a8c', 0.42, '#d5a6bd', 0.06, '#31253a', '#241a2b', '#f6eef6', '#f3ddb0'],
  [10.6, '#4a4384', '#7e6496', '#c08c9a', '#f0a080', 0.12, '#b57fae', 0.30, '#d894b0', '#7c6294', 0.22, '#b08fc0', 0.02, '#251d34', '#1c1526', '#c9c4e0', '#f3ddb0'],
  [12.6, '#1d2044', '#282c52', '#41456a', '#f0a2b2', 0.0,  '#3a3f66', 0.0,  '#a08ab0', '#6a5a80', 0.06, '#7c78a8', 0.0,  '#171325', '#100d18', '#6a6f9a', '#f6efd8'],
  [15.0, '#191c3e', '#24274a', '#3a3e60', '#f0a2b2', 0.0,  '#343a60', 0.0,  '#a08ab0', '#6a5a80', 0.05, '#75719e', 0.0,  '#141121', '#0e0b16', '#62678f', '#f6efd8']
].map(row => [row[0], ...row.slice(1).map(v => typeof v === 'string' ? hex(v) : v)]);
function palAt(t) {
  let i = 0; while (i < PAL.length - 2 && t >= PAL[i + 1][0]) i++;
  const a = PAL[i], b = PAL[i + 1], k = sine((t - a[0]) / (b[0] - a[0])), o = {};
  KEYS.forEach((key, j) => { const x = a[j + 1], y = b[j + 1]; o[key] = Array.isArray(x) ? x.map((v, n) => lerp(v, y[n], k)) : lerp(x, y, k); });
  return o;
}

// ───────── WebGL2 ─────────
const VS = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 frag;
uniform vec2 uRes; uniform float uT;
uniform vec3 uF, uR, uU; uniform vec2 uTan;
uniform vec3 uZen, uMid, uHor, uGlow, uBelt, uCLit, uCDark, uWispC, uWater, uSilNear, uAmb, uMoonC;
uniform float uGlowK, uBeltK, uCloud, uWispK, uLight, uMoonK, uSunK;
uniform vec3 uSun, uMoon;
uniform sampler2D tA, tDay, tNight, tAux;
uniform vec4 uA, uH;
const float R2D = 57.2957795;
const float CAMH = ${CAMH.toFixed(2)};

uint hsh(uvec2 v) { v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; return v.x; }
float h2(vec2 p) { return float(hsh(uvec2(ivec2(p) + 65536))) * (1.0 / 4294967295.0); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p, int oct) { float a = 0.5, s = 0.0; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * vnoise(p); p = m * p + 3.1; a *= 0.5; } return s; }
float angDeg(vec3 a, vec3 b) { return atan(length(cross(a, b)), dot(a, b)) * R2D; }

vec3 skyBase(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.2, e));
  c = mix(c, uZen, smoothstep(0.16, 0.62, e));
  vec2 sh = normalize(uSun.xz + vec2(1e-6)), dh = normalize(d.xz + vec2(1e-6));
  float anti = -dot(sh, dh);
  float belt = smoothstep(0.02, 0.1, e) * (1.0 - smoothstep(0.14, 0.34, e)) * smoothstep(-0.4, 0.6, anti);
  c = mix(c, uBelt, uBeltK * belt);
  float cs = max(dot(d, uSun), 0.0), low = 1.0 - smoothstep(0.0, 0.5, e);
  c += uGlow * uGlowK * (0.13 * pow(cs, 4.0) * low + 0.05 * pow(cs, 40.0) + 0.04 * pow(cs, 900.0));
  return c;
}
vec3 addDiscs(vec3 d, vec3 c) {
  float as = angDeg(d, uSun);
  c = mix(c, vec3(1.0, 0.975, 0.92), uSunK * (1.0 - smoothstep(0.9, 0.96, as)));
  return c;
}
vec4 clouds(vec3 d, int oct) {
  if (uCloud <= 0.001 || d.y < 0.003) return vec4(0.0);
  vec2 p = d.xz / d.y * 2.1 + vec2(0.022, 0.008) * uT;
  vec2 q = vec2(p.x * 0.6 + p.y * 0.15, p.y * 1.5 - p.x * 0.15);
  vec2 w = vec2(fbm(q * 0.7 + vec2(11.0, 3.0), oct), fbm(q * 0.7 + vec2(23.0, 9.0), oct));
  float n = fbm(q * 1.5 + w * 2.4, oct) + 0.05 * sin((q.x * 0.5 + q.y * 2.6) * 5.0 + w.y * 9.0);
  float th = mix(0.76, 0.46, uCloud);
  float aa = 0.018 + 0.09 * (1.0 - smoothstep(0.0, 0.25, d.y));
  float m = smoothstep(th, th + aa, n), hi = smoothstep(th + 0.045, th + 0.045 + aa, n);
  vec3 col = mix(uCDark, uCLit, hi) + uGlow * uGlowK * 0.3 * pow(max(dot(d, uSun), 0.0), 6.0);
  return vec4(col, m * smoothstep(0.018, 0.14, d.y) * smoothstep(0.0, 0.25, uCloud));
}
vec4 wisps(vec3 d) {
  if (uWispK <= 0.001 || d.y < 0.003) return vec4(0.0);
  vec2 p = d.xz / d.y * 1.3 + vec2(0.012, 0.0) * uT;
  vec2 q = vec2(dot(p, vec2(-0.438, -0.899)) * 0.45, dot(p, vec2(0.899, -0.438)) * 1.3);
  float n = fbm(q + 1.6 * vec2(fbm(q * 0.7 + 5.0, 3), fbm(q * 0.7 + 9.0, 3)), 4);
  float m = smoothstep(0.64, 0.7, n) * (1.0 - 0.6 * smoothstep(0.74, 0.8, n));
  return vec4(uWispC, m * smoothstep(0.03, 0.16, d.y) * uWispK);
}
vec3 skyAll(vec3 d, int oct) {
  vec3 c = addDiscs(d, skyBase(d));
  vec4 w = wisps(d); c = mix(c, w.rgb, w.a);
  vec4 k = clouds(d, oct); c = mix(c, k.rgb, k.a);
  return c;
}
vec2 azs(vec3 d) { return vec2(atan(d.x, d.z) * R2D, d.y / max(length(d.xz), 1e-5) * R2D); }
vec3 hazeCol(float az) { float a = az / R2D; return skyBase(normalize(vec3(sin(a), 0.035, cos(a)))); }
vec2 uvOf(vec2 a, vec4 B) { return vec2((a.x - B.x) / (B.y - B.x), (B.w - a.y) / (B.w - B.z)); }
float inside(vec2 uv) { return step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0); }
vec4 silH(vec2 a, float lod) {
  vec2 uv = uvOf(a, uH);
  float ins = inside(uv);
  vec4 dy = (lod < 0.0 ? texture(tDay, uv) : textureLod(tDay, uv, lod)) * ins;
  vec3 nt = (lod < 0.0 ? texture(tNight, uv) : textureLod(tNight, uv, lod)).rgb * ins;
  vec4 ax = lod < 0.0 ? texture(tAux, uv) : textureLod(tAux, uv, lod);
  float hz = clamp(ax.g / max(dy.a, 0.004), 0.0, 1.0);
  vec3 c = mix(dy.rgb * uAmb, hazeCol(a.x) * dy.a, clamp(hz * 0.9, 0.0, 1.0));
  float on = smoothstep(ax.r - 0.035, ax.r, uLight);
  vec3 e = nt * (1.0 - 0.45 * hz);
  float wl = on * clamp(max(e.r, max(e.g, e.b)) * 1.6, 0.0, 1.0);
  return vec4(mix(c, e, wl), dy.a);
}
vec3 bloom(vec3 d) {
  vec2 a = azs(d), uv = uvOf(a, uH);
  float ins = smoothstep(-0.05, 0.0, uv.x) * smoothstep(1.05, 1.0, uv.x) * smoothstep(-0.4, 0.0, uv.y) * smoothstep(1.3, 1.0, uv.y);
  vec2 uc = clamp(uv, 0.0, 1.0);
  float kEst = 0.06 + 0.8 * clamp(a.y / 8.5, 0.0, 1.0);
  float on = smoothstep(kEst - 0.12, kEst + 0.08, uLight) * smoothstep(0.02, 0.3, uLight);
  vec3 g = textureLod(tNight, uc, 4.0).rgb * 0.22 + textureLod(tNight, uc, 6.0).rgb * 0.24;
  return g * on * ins;
}
// o chão: asfalto seco, reflexo fraco do céu (era água no estilo; mesmo mecanismo, outro peso)
vec3 groundCol(vec3 d) {
  float dist = CAMH / max(-d.y, 1e-4);
  vec2 p = d.xz * dist;
  float pa = 2.0 * uTan.y / uRes.y, fp = dist * pa * sqrt(dist / CAMH);
  vec2 g = vec2(0.0);
  for (int i = 0; i < 7; i++) {
    float fi = float(i), L = 8.5 * pow(0.66, fi), k = 6.28318 / L, an = 0.6 + fi * 2.39996;
    vec2 dir = vec2(cos(an), sin(an));
    float att = exp(-pow(k * fp * 0.9, 2.0));
    g += dir * (0.0032 * mix(1.0, 0.25, fi / 6.0) * cos(dot(dir, p) * k - sqrt(9.81 * k) * uT * 0.3 + fi * 1.7)) * att;
  }
  // grão do asfalto: quebra o reflexo em manchas, não em espelho
  float gr = fbm(p * 3.4 + vec2(0.0, uT * 0.12), 3) - 0.5;
  float gr2 = fbm(p * 11.0 - vec2(uT * 0.08, 0.0), 2) - 0.5;
  g += vec2(gr, -gr) * 0.035 + vec2(gr2, -gr2) * 0.02;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 r = reflect(d, n); r.y = max(abs(r.y), 0.004); r = normalize(r);
  vec3 refl = skyAll(r, 3);
  vec4 s = silH(azs(r), 3.5);
  refl = refl * (1.0 - s.a) + s.rgb * 0.3 + bloom(r) * 0.9;
  refl = mix(uWater, refl, 0.85 + 0.15 * gr);
  float fres = 0.024 + 0.11 * pow(1.0 - clamp(dot(-d, n), 0.0, 1.0), 2.2);
  vec3 c = mix(uWater, refl, fres);
  // o sol baixo deixa um rastro comprido no asfalto
  float ss = max(dot(r, uSun), 0.0);
  c += uGlow * uGlowK * (pow(ss, 500.0) * 0.55 + pow(ss, 40.0) * 0.07);
  return c;
}
vec3 rayAt(vec2 fc) {
  vec2 q = fc / uRes * 2.0 - 1.0;
  vec2 v = vec2(q.x * uTan.x, q.y * uTan.y);
  return normalize(uF + v.x * uR + v.y * uU);
}
void main() {
  vec3 d = rayAt(gl_FragCoord.xy);
  vec2 a = azs(d); vec4 s = silH(a, -1.0);
  vec3 c;
  if (d.y > 0.0) c = skyAll(d, 5);
  else {
    c = vec3(0.0);
    for (int i = 0; i < 2; i++) { vec2 o = vec2(float(i & 1), 0.0) * 0.5 - 0.25; vec3 di = rayAt(gl_FragCoord.xy + o); c += groundCol(vec3(di.x, min(di.y, -1e-4), di.z)); }
    c *= 0.5;
  }
  c = c * (1.0 - s.a) + s.rgb + bloom(d);
  vec2 vq = gl_FragCoord.xy / uRes - 0.5;
  c *= 1.0 - 0.3 * pow(clamp(length(vq * vec2(1.0, 0.85)) * 1.3, 0.0, 1.0), 2.4);
  c += (h2(floor(gl_FragCoord.xy)) - 0.5) / 255.0;
  frag = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

const gl = glc.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, alpha: false });
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog); gl.bindVertexArray(gl.createVertexArray());
const LOC = {}; const u = n => LOC[n] ?? (LOC[n] = gl.getUniformLocation(prog, n));

function upload(unit, data, w, h, name) {
  const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u(name), unit);
}
const pixels = cv => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
function premul(d) { for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; d[i] = Math.round(d[i] * a); d[i + 1] = Math.round(d[i + 1] * a); d[i + 2] = Math.round(d[i + 2] * a); } return new Uint8Array(d.buffer); }
const PS = cenaS();
upload(0, new Uint8Array(4), 1, 1, 'tA');
upload(1, premul(pixels(PS.cv.day)), PS.W, PS.H, 'tDay');
upload(2, new Uint8Array(pixels(PS.cv.night).buffer), PS.W, PS.H, 'tNight');
{ const k = pixels(PS.cv.key), z = pixels(PS.cv.haze), a = new Uint8Array(k.length);
  for (let i = 0; i < k.length; i += 4) { a[i] = k[i]; a[i + 1] = z[i]; a[i + 3] = 255; }
  upload(3, a, PS.W, PS.H, 'tAux'); }
const BOX = P => [P.az0, P.az1, P.s0, P.s1];

// ───────── a camada de cima: helicóptero, pessoas, tanque, portão, presidente, soldados ─────────
const ov = document.getElementById('ov').getContext('2d');
const veu = document.getElementById('veu');
const rgb = (c, k = 1, a = 1) => `rgba(${Math.round(cl(c[0] * k) * 255)},${Math.round(cl(c[1] * k) * 255)},${Math.round(cl(c[2] * k) * 255)},${a})`;
const ACC = [1.0, 0.47, 0.27];                       // a cor de destaque, uma só
const olive = (k = 1) => [0.20 * k, 0.235 * k, 0.185 * k];
const warm = (P, k = 1) => [P.glow[0] * k, P.glow[1] * k, P.glow[2] * k];

// uma pessoa em silhueta, com os pés na base; k = 0 de pé, 1 agachada para deixar a arma
function pessoa(g, x, yPe, h, col, k = 0, rumo = 1, alpha = 1, arma = false) {
  g.save(); g.translate(x, yPe); g.scale(h, h); g.globalAlpha = alpha;
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  const q = k, dy = 0.1 * q;                       // o corpo desce ao agachar
  // pernas
  g.beginPath(); g.moveTo(-0.1, -0.5 + dy * 0.6); g.lineTo(-0.02, -0.5 + dy * 0.6); g.lineTo(-0.035 - 0.06 * q, -0.2 + dy * 0.3);
  g.lineTo(-0.06, -0.012); g.lineTo(-0.135, -0.012); g.lineTo(-0.125, -0.24 + dy * 0.3); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0.02, -0.5 + dy * 0.6); g.lineTo(0.1, -0.5 + dy * 0.6); g.lineTo(0.115 + 0.05 * q, -0.22 + dy * 0.3);
  g.lineTo(0.14, -0.012); g.lineTo(0.065, -0.012); g.lineTo(0.05, -0.24 + dy * 0.3); g.closePath(); g.fill();
  // tronco e ombros
  g.beginPath();
  g.moveTo(-0.095, -0.49 + dy); g.lineTo(-0.105, -0.83 + dy * 0.8);
  g.quadraticCurveTo(-0.055, -0.885 + dy * 0.8, 0, -0.885 + dy * 0.8);
  g.quadraticCurveTo(0.055, -0.885 + dy * 0.8, 0.105, -0.83 + dy * 0.8);
  g.lineTo(0.095, -0.49 + dy); g.closePath(); g.fill();
  // pescoço e cabeça
  g.fillRect(-0.024, -0.925 + dy * 0.8, 0.048, 0.045);
  g.beginPath(); g.ellipse(0.006 * rumo, -0.955 + dy * 0.8, 0.052, 0.058, 0, 0, Math.PI * 2); g.fill();
  // braços
  g.lineWidth = 0.05;
  if (arma) {
    g.beginPath(); g.moveTo(-0.085, -0.8 + dy * 0.8); g.lineTo(-0.02, -0.56 + dy); g.stroke();
    g.beginPath(); g.moveTo(0.085, -0.8 + dy * 0.8); g.lineTo(0.1 * rumo, -0.56 + dy); g.stroke();
  } else {
    g.beginPath(); g.moveTo(-0.095, -0.8 + dy * 0.8); g.lineTo(-0.115 * rumo, -0.46 + dy); g.stroke();
    g.beginPath(); g.moveTo(0.095, -0.8 + dy * 0.8); g.lineTo(0.14 * rumo, -0.4 + dy * 0.6); g.stroke();
  }
  g.restore();
}
// fuzil em silhueta, com um fio de luz no cano
function fuzil(g, x, y, L, col, alpha = 1, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = alpha;
  g.fillStyle = col; g.strokeStyle = col;
  g.fillRect(-L * 0.5, -L * 0.028, L * 0.62, L * 0.055);              // coronha e corpo
  g.beginPath(); g.moveTo(L * 0.1, -L * 0.012); g.lineTo(L * 0.52, -L * 0.02); g.lineWidth = L * 0.026; g.stroke();
  g.beginPath(); g.moveTo(L * 0.06, L * 0.02); g.lineTo(L * 0.2, L * 0.1); g.lineWidth = L * 0.03; g.stroke();  // carregador
  g.strokeStyle = 'rgba(255,196,146,.55)'; g.lineWidth = Math.max(1.2, L * 0.012);
  g.beginPath(); g.moveTo(L * 0.12, -L * 0.028); g.lineTo(L * 0.52, -L * 0.034); g.stroke();
  g.restore();
}

// CH-46 / CH-53 verde-oliva, de 1975: em silhueta com contraluz, pousando no telhado
function helicoptero(t, c, P) {
  const lift = seg(t, 3.49, 4.6, x => x * x * (3 - 2 * x));
  const land = seg(t, 0.2, 2.05);
  const az = 10.4 + 0.3 * Math.sin(t * 0.7) + 1.6 * lift;
  const base = lerp(10.9, 6.55, land) + 5.6 * lift + 0.05 * Math.sin(t * 2.1) * (1 - lift);
  const b = baseBox(c, az, base, 10.6, 4.6);
  if (!b) return;
  const { x, y, w, h } = b; if (x < -w || x > W + w) return;
  const g = ov, col = rgb(olive(1 - 0.5 * seg(t, 8.4, 12)), 1, 0.98);
  const rim = rgb(warm(P, 1.05), 1, 0.5);
  g.save(); g.translate(x, y); g.rotate(-0.07 - 0.06 * lift); g.scale(w, h);
  g.fillStyle = col;
  // fuselagem: bico arredondado, dorso reto, cauda erguida e rampa aberta
  g.beginPath();
  g.moveTo(-0.46, -0.10); g.lineTo(-0.40, -0.42); g.quadraticCurveTo(-0.1, -0.52, 0.2, -0.5);
  g.quadraticCurveTo(0.48, -0.48, 0.52, -0.30); g.quadraticCurveTo(0.545, -0.16, 0.50, -0.10);
  g.lineTo(0.20, -0.06); g.lineTo(-0.30, -0.08); g.closePath(); g.fill();
  // rampa traseira aberta
  g.beginPath(); g.moveTo(-0.44, -0.1); g.lineTo(-0.56, -0.24); g.lineTo(-0.40, -0.26); g.closePath(); g.fill();
  // carenagens laterais (flutuadores)
  g.beginPath(); g.ellipse(0.06, -0.09, 0.2, 0.075, 0, 0, Math.PI * 2); g.fill();
  // nariz: janelas do cockpit, um pouco mais claras
  g.fillStyle = 'rgba(18,14,16,.9)';
  g.beginPath(); g.moveTo(0.42, -0.42); g.lineTo(0.51, -0.34); g.lineTo(0.5, -0.26); g.lineTo(0.4, -0.3); g.closePath(); g.fill();
  // fileira de vigias
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(-0.26 + i * 0.14, -0.38, 0.045, 0.033, 0, 0, Math.PI * 2); g.fill(); }
  // mastro e pás
  g.fillStyle = col; g.fillRect(0.22, -0.56, 0.035, 0.08); g.fillRect(-0.24, -0.55, 0.035, 0.07);
  const av = t * 1.9;
  for (const [cx, rx] of [[0.235, 0.3], [-0.225, 0.3]]) {
    g.save(); g.translate(cx, -0.58);
    g.fillStyle = 'rgba(32,26,30,.25)'; g.beginPath(); g.ellipse(0, 0, rx, rx * 0.11, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 3; k++) {
      g.save(); g.rotate(av + k * Math.PI / 1.5); g.fillStyle = 'rgba(28,22,26,.62)';
      g.beginPath(); g.ellipse(0, 0, rx, rx * 0.05, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.restore();
  }
  // trem de pouso
  g.fillStyle = col;
  for (const px of [-0.22, -0.02, 0.3]) { g.fillRect(px - 0.012, -0.09, 0.024, 0.085); g.beginPath(); g.arc(px, 0, 0.032, 0, Math.PI * 2); g.fill(); }
  // contraluz
  g.strokeStyle = rim; g.lineWidth = 0.011;
  g.beginPath(); g.moveTo(-0.4, -0.42); g.quadraticCurveTo(-0.1, -0.52, 0.2, -0.5); g.quadraticCurveTo(0.46, -0.48, 0.51, -0.31); g.stroke();
  g.restore();
  // farol de sinalização: o único ponto de cor de destaque no céu
  const pulse = 0.5 + 0.5 * Math.sin(t * 6.4);
  g.save(); g.globalAlpha = 0.4 + 0.6 * pulse;
  g.fillStyle = rgb(ACC, 1, 1); g.beginPath(); g.arc(x - w * 0.06, y - h * 0.58, Math.max(2.2, w * 0.011), 0, Math.PI * 2); g.fill();
  g.restore();
}

// T-54 / Type 59 verde, de 1975: avança pela avenida, encosta no portão e entra no jardim
function tanque(t, c, P) {
  if (t > 9.65) return;
  const mover = seg(t, 6.2, 7.94, x => 1 - Math.pow(1 - x, 1.6));
  const entrar = seg(t, 8.05, 9.45);
  const az = lerp(43.4, 57.55, mover) + 0.25 * entrar;
  const base = -3.0 + 3.1 * entrar;
  const b = baseBox(c, az, base, 11, 4.5 - 1.7 * entrar);
  if (!b) return;
  const { x, y, w, h } = b; if (x < -w || x > W + w) return;
  const g = ov, col = rgb(olive(1 - 0.82 * entrar), 1, 0.98);
  const rim = rgb(warm(P, 0.95), 1, 0.45 * (1 - entrar));
  const sr = w * 0.62, sg = g.createRadialGradient(x, y, 0, x, y, sr);
  sg.addColorStop(0, 'rgba(6,4,10,.55)'); sg.addColorStop(1, 'rgba(6,4,10,0)');
  g.fillStyle = sg; g.fillRect(x - sr, y - sr * 0.16, 2 * sr, sr * 0.32);
  g.save(); g.translate(x, y); g.scale(w, h);
  g.fillStyle = col;
  // casco com a frente inclinada
  g.beginPath(); g.moveTo(-0.5, -0.24); g.lineTo(0.34, -0.24); g.lineTo(0.5, -0.4); g.lineTo(-0.42, -0.42); g.closePath(); g.fill();
  // esteira e rodas
  g.beginPath(); g.moveTo(-0.52, -0.16); g.lineTo(0.5, -0.16); g.lineTo(0.52, 0.0); g.lineTo(-0.52, 0.0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(14,12,14,.95)';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-0.4 + i * 0.2, -0.055, 0.075, 0, Math.PI * 2); g.fill(); }
  g.fillRect(-0.52, -0.17, 1.04, 0.03);
  g.strokeStyle = 'rgba(140,130,118,.3)'; g.lineWidth = 0.014;
  const roda = (t * 2.4) % 1;
  for (let i = 0; i < 14; i++) { const px = -0.52 + ((i + roda) % 14) / 14 * 1.04; g.beginPath(); g.moveTo(px, -0.16); g.lineTo(px + 0.012, 0.0); g.stroke(); }
  // torre arredondada e escotilha
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-0.2, -0.42); g.quadraticCurveTo(-0.18, -0.7, 0.04, -0.7); g.quadraticCurveTo(0.2, -0.7, 0.22, -0.42); g.closePath(); g.fill();
  g.fillRect(-0.02, -0.74, 0.1, 0.05);
  // canhão longo, um pouco erguido
  g.beginPath(); g.moveTo(0.16, -0.64); g.lineTo(0.78, -0.7); g.lineTo(0.78, -0.63); g.lineTo(0.16, -0.57); g.closePath(); g.fill();
  // antena
  g.strokeStyle = col; g.lineWidth = 0.016; g.beginPath(); g.moveTo(-0.16, -0.68); g.lineTo(-0.28, -1.0); g.stroke();
  // contraluz
  g.strokeStyle = rim; g.lineWidth = 0.014;
  g.beginPath(); g.moveTo(-0.48, -0.405); g.lineTo(0.33, -0.385); g.stroke();
  g.beginPath(); g.moveTo(-0.19, -0.43); g.quadraticCurveTo(-0.17, -0.69, 0.04, -0.69); g.quadraticCurveTo(0.19, -0.69, 0.21, -0.43); g.stroke();
  g.beginPath(); g.moveTo(0.17, -0.64); g.lineTo(0.77, -0.7); g.stroke();
  g.restore();
  // poeira atrás da esteira
  const db = baseBox(c, az - 4.2, Math.max(-2.6, base) + 0.2, 6, 2.4);
  if (db && mover > 0.02) {
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.5 + i * 0.33) % 1;
      const rr = db.w * (0.12 + ph * 0.26), px = db.x - ph * db.w * 0.45, py = db.y - ph * db.h * 0.35;
      const gr = g.createRadialGradient(px, py, 0, px, py, rr);
      gr.addColorStop(0, rgb(warm(P, 1), 1, (1 - ph) * 0.15 * mover * (1 - entrar)));
      gr.addColorStop(1, rgb(warm(P, 1), 1, 0));
      g.fillStyle = gr; g.fillRect(px - rr, py - rr, 2 * rr, 2 * rr);
    }
  }
}

// o portão do palácio: duas folhas de grade que caem às 7,96 s
function portao(t, c, P) {
  const k = seg(t, 7.96, 8.5, x => x);
  const col = rgb([0.13, 0.12, 0.14], 1, 1);
  const rim = rgb(warm(P, 0.85), 1, 0.4 * (1 - k));
  for (const [x0, x1, lado] of [[56.25, 59.25, 1], [62.35, 59.35, -1]]) {
    const b = baseBox(c, (x0 + x1) / 2, 0.15, Math.abs(x1 - x0), 2.7);
    if (!b) continue;
    const g = ov; g.save(); g.translate(b.x, b.y); g.globalAlpha = 1 - 0.5 * k;
    g.rotate(lado * k * 0.5); g.scale(b.w * (1 - 0.5 * k), b.h * (1 - 0.62 * k));
    // só as barras, para o jardim aparecer entre elas
    g.strokeStyle = col; g.lineWidth = 0.055;
    for (let i = 0; i < 10; i++) { const px = -0.47 + i * 0.104; g.beginPath(); g.moveTo(px, 0); g.lineTo(px, -0.92); g.stroke(); }
    g.lineWidth = 0.05; g.beginPath(); g.moveTo(-0.5, -0.92); g.lineTo(0.5, -0.92); g.stroke();
    g.beginPath(); g.moveTo(-0.5, -0.1); g.lineTo(0.5, -0.1); g.stroke();
    g.strokeStyle = rim; g.lineWidth = 0.02; g.beginPath(); g.moveTo(-0.5, -0.94); g.lineTo(0.5, -0.94); g.stroke();
    g.restore();
  }
  // a poeira da queda e o degrau do portão
  if (k > 0.02) {
    const b = baseBox(c, 59.3, 0.1, 10, 4.6);
    if (b) {
      const g = ov;
      for (let i = 0; i < 4; i++) {
        const q = cl(k * 1.2 - i * 0.14), rr = b.w * (0.07 + q * 0.3);
        const px = b.x + (i - 1.5) * b.w * 0.1 * q, py = b.y - q * b.h * 0.4;
        const gr = g.createRadialGradient(px, py, 0, px, py, rr);
        gr.addColorStop(0, rgb(warm(P, 1.1), 1, (1 - q) * 0.22));
        gr.addColorStop(1, rgb(warm(P, 1.1), 1, 0));
        g.fillStyle = gr; g.fillRect(px - rr, py - rr, 2 * rr, 2 * rr);
      }
    }
  }
}

// as pessoas no telhado: sobem a escada, atravessam e embarcam
const GENTE = [
  { x0: 8.15, y0: 0.25, y1: 6.45, t0: 1.05, t1: 3.15, fim: [8.6, 9.85] },
  { x0: 8.5, y0: 0.25, y1: 6.45, t0: 1.45, t1: 3.4, fim: [8.7, 9.9] },
  { x0: 7.85, y0: 0.25, y1: 6.45, t0: 1.9, t1: 3.62, fim: [8.4, 9.95] }
];
function pessoas(t, c, P) {
  if (t > 4.6) return;
  const col = rgb([0.10, 0.085, 0.11], 1, 1), rim = rgb(warm(P, 0.95), 1, 0.45);
  for (const g0 of GENTE) {
    const k = seg(t, g0.t0, g0.t1, x => x);
    let az, el;
    if (k < 1) { az = g0.x0; el = lerp(g0.y0, g0.y1, k); }
    else {
      const q = seg(t, g0.t1, g0.t1 + 0.8, x => x);
      if (q >= 0.99) continue;
      az = lerp(g0.fim[0], g0.fim[1], q); el = g0.y1;
    }
    const b = baseBox(c, az, el, 2.3, 2.4); if (!b) continue;
    const g = ov;
    g.save(); g.globalAlpha = 1 - seg(t, 3.95, 4.5);
    pessoa(g, b.x, b.y, b.h * 1.05, col, 0, 1, 1);
    g.globalAlpha = 0.5; g.fillStyle = rim;
    g.fillRect(b.x - b.w * 0.25, b.y - b.h * 1.02, b.w * 0.5, Math.max(1, b.h * 0.02));
    g.restore();
  }
}

// o presidente do Sul: só a silhueta no vão iluminado, sem rosto
function presidente(t, c) {
  if (t < 8.85) return;
  const a = seg(t, 8.85, 9.35) * (1 - seg(t, 12.62, 13.1));
  if (a <= 0.002) return;
  const b = baseBox(c, DOOR_X + 0.14 * seg(t, 12.06, 12.4), 1.16, 1.15, 2.35); if (!b) return;
  const g = ov;
  g.save(); g.globalAlpha = a;
  const rr = b.w * 2.4, gr = g.createRadialGradient(b.x, b.y - b.h * 0.5, 0, b.x, b.y - b.h * 0.5, rr);
  gr.addColorStop(0, 'rgba(255,186,116,.34)'); gr.addColorStop(1, 'rgba(255,186,116,0)');
  g.fillStyle = gr; g.fillRect(b.x - rr, b.y - b.h * 0.5 - rr, 2 * rr, 2 * rr);
  // a figura: terno escuro, ombros, cabeça, sem traços
  const h2 = b.h, w2 = b.w;
  g.fillStyle = 'rgba(15,10,13,.98)';
  g.beginPath();
  g.moveTo(b.x - w2 * 0.36, b.y);
  g.lineTo(b.x - w2 * 0.34, b.y - h2 * 0.62);
  g.quadraticCurveTo(b.x - w2 * 0.34, b.y - h2 * 0.9, b.x - w2 * 0.15, b.y - h2 * 0.93);
  g.lineTo(b.x + w2 * 0.15, b.y - h2 * 0.93);
  g.quadraticCurveTo(b.x + w2 * 0.34, b.y - h2 * 0.9, b.x + w2 * 0.34, b.y - h2 * 0.62);
  g.lineTo(b.x + w2 * 0.36, b.y);
  g.closePath(); g.fill();
  g.beginPath(); g.ellipse(b.x + w2 * 0.01, b.y - h2 * 1.0, w2 * 0.135, h2 * 0.1, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,184,116,.5)'; g.lineWidth = Math.max(1, w2 * 0.012);
  g.beginPath(); g.moveTo(b.x - w2 * 0.345, b.y - h2 * 0.1); g.lineTo(b.x - w2 * 0.33, b.y - h2 * 0.66); g.stroke();
  g.restore();
}

// os soldados deixam os fuzis no chão, em 13,8 a 14,6
const SOLDADOS = [
  { az: 52.4, tq: 13.8, rumo: 1 },
  { az: 56.9, tq: 14.04, rumo: -1 },
  { az: 61.2, tq: 14.26, rumo: 1 }
];
function soldados(t, c, P) {
  if (t < 12.7) return;
  const col = rgb(olive(0.3), 1, 0.99), rifle = rgb(olive(0.85), 1, 0.99);
  const g = ov;
  for (const s of SOLDADOS) {
    const k = seg(t, s.tq, s.tq + 0.36, x => x) * (1 - seg(t, s.tq + 0.44, s.tq + 0.66, x => x));
    const b = baseBox(c, s.az, -2.5, 2.6, 5.0); if (!b) continue;
    g.save();
    // sombra de contato: prende a figura no chão
    const sr = b.w * 0.8, sg = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, sr);
    sg.addColorStop(0, 'rgba(8,6,12,.5)'); sg.addColorStop(1, 'rgba(8,6,12,0)');
    g.fillStyle = sg; g.fillRect(b.x - sr, b.y - sr * 0.35, 2 * sr, sr * 0.7);
    pessoa(g, b.x, b.y, b.h * 1.02, col, k, s.rumo, 1, true);
    // a arma desce com a mão e fica no chão, ao lado do pé
    const q = seg(t, s.tq, s.tq + 0.42, x => x);
    const rx = b.x + s.rumo * b.w * 0.95, ry = b.y - (1 - q) * b.h * 0.36 + b.h * 0.02;
    fuzil(g, rx, ry, b.w * 1.3, rifle, 0.55 + 0.45 * q, s.rumo * 0.05);
    g.restore();
  }
}

// uma poeira fina, sempre andando rente ao chão (o quadro nunca fica parado)
function poeira(t, c, P) {
  const g = ov;
  for (let i = 0; i < 5; i++) {
    const az = 30 + i * 17 + Math.sin(t * 0.35 + i * 1.7) * 2.2 + t * 0.55;
    const b = baseBox(c, az, -2.9 + 0.2 * Math.sin(t * 0.5 + i), 26, 2.6); if (!b) continue;
    const rr = b.w * 0.5;
    const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, rr);
    gr.addColorStop(0, rgb(warm(P, 1), 1, 0.05)); gr.addColorStop(1, rgb(warm(P, 1), 1, 0));
    g.fillStyle = gr; g.fillRect(b.x - rr, b.y - rr, 2 * rr, 2 * rr);
  }
}

// ───────── os rótulos: no máximo 6 palavras por vez, PT-BR simples ─────────
const FONT = 'Archivo';
function txt(g, s, x, y, size, weight, track, col, alpha) {
  g.save(); g.globalAlpha = alpha; g.fillStyle = col;
  g.font = `${weight} ${size}px ${FONT}, Inter, sans-serif`;
  if ('letterSpacing' in g) g.letterSpacing = `${track}px`;
  g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(12,7,14,.72)'; g.shadowBlur = 18; g.shadowOffsetY = 2;
  g.fillText(s, x, y);
  g.restore();
}
const BX = VERT ? 74 : 64, BY = VERT ? 250 : H - 96;
function rotulos(t, c, P) {
  const g = ov;
  const acc = rgb(ACC, 1, 1), paper = 'rgba(255,244,236,.96)', dim = 'rgba(255,226,208,.72)';
  // batida A: 29 de abril · Saigon
  const aA = seg(t, 0.22, 0.6) * (1 - seg(t, 4.32, 4.62));
  if (aA > 0.002) {
    const dy = (1 - seg(t, 0.22, 0.7)) * (VERT ? 16 : 12);
    g.save(); g.globalAlpha = aA;
    g.fillStyle = acc; g.fillRect(BX, BY - (VERT ? 108 : 66) + dy, VERT ? 54 : 40, 3);
    g.restore();
    txt(g, '29 DE ABRIL', BX, BY + dy, VERT ? 62 : 44, 600, VERT ? 4 : 3, paper, aA);
    txt(g, 'SAIGON', BX, BY + dy + (VERT ? 66 : 52), VERT ? 34 : 24, 500, VERT ? 9 : 7, dim, aA);
  }
  // batida B: 30 de abril, e o palácio no instante do portão
  const aB = seg(t, 5.16, 5.5) * (1 - seg(t, 8.62, 8.9));
  if (aB > 0.002) {
    const dy = (1 - seg(t, 5.16, 5.6)) * (VERT ? 16 : 12);
    g.save(); g.globalAlpha = aB;
    g.fillStyle = acc; g.fillRect(BX, BY - (VERT ? 108 : 66) + dy, VERT ? 54 : 40, 3);
    g.restore();
    txt(g, '30 DE ABRIL', BX, BY + dy, VERT ? 62 : 44, 600, VERT ? 4 : 3, paper, aB);
    const aP = seg(t, 7.9, 8.2) * aB;
    if (aP > 0.002) txt(g, 'PALÁCIO PRESIDENCIAL', BX, BY + dy + (VERT ? 66 : 52), VERT ? 32 : 23, 500, VERT ? 8 : 6, dim, aP);
  }
  // batida C: o presidente do Sul (nome + uma silhueta)
  const aC = seg(t, 9.6, 9.96) * (1 - seg(t, 11.98, 12.2));
  if (aC > 0.002) {
    const dy = (1 - seg(t, 9.6, 10.0)) * (VERT ? 16 : 12);
    g.save(); g.globalAlpha = aC;
    g.fillStyle = acc; g.fillRect(BX, BY - (VERT ? 118 : 74) + dy, VERT ? 54 : 40, 3);
    g.restore();
    txt(g, 'DUONG VAN MINH', BX, BY + dy, VERT ? 60 : 46, 600, VERT ? 1 : 0, paper, aC);
    txt(g, 'presidente do Sul', BX, BY + dy + (VERT ? 62 : 48), VERT ? 34 : 26, 400, VERT ? 2 : 1, dim, aC);
  }
  // batida C2: o contador, em "dois dias" (12,07)
  const aN = seg(t, 12.06, 12.36) * (1 - seg(t, 12.98, 13.24));
  if (aN > 0.002) {
    const dy = (1 - seg(t, 12.06, 12.4)) * (VERT ? 18 : 12);
    g.save(); g.globalAlpha = aN;
    g.fillStyle = acc; g.fillRect(BX, BY - (VERT ? 140 : 100) + dy, VERT ? 54 : 40, 3);
    g.restore();
    txt(g, '2', BX, BY + dy, VERT ? 112 : 88, 600, 0, acc, aN);
    txt(g, 'DIAS NO CARGO', BX + (VERT ? 92 : 70), BY + dy, VERT ? 50 : 34, 600, VERT ? 5 : 4, paper, aN);
  }
}

function render(t) {
  const c = camAt(t), P = palAt(t);
  gl.viewport(0, 0, W, H);
  gl.uniform2f(u('uRes'), W, H); gl.uniform1f(u('uT'), t);
  gl.uniform3fv(u('uF'), c.F); gl.uniform3fv(u('uR'), c.R); gl.uniform3fv(u('uU'), c.U);
  gl.uniform2f(u('uTan'), c.tanH, c.tanV);
  for (const [k, n] of [['zen', 'uZen'], ['mid', 'uMid'], ['hor', 'uHor'], ['glow', 'uGlow'], ['belt', 'uBelt'], ['cLit', 'uCLit'], ['cDark', 'uCDark'], ['wispC', 'uWispC'], ['water', 'uWater'], ['silNear', 'uSilNear'], ['amb', 'uAmb'], ['moonC', 'uMoonC']]) gl.uniform3fv(u(n), P[k]);
  for (const [k, n] of [['glowK', 'uGlowK'], ['beltK', 'uBeltK'], ['cloud', 'uCloud'], ['wispK', 'uWispK']]) gl.uniform1f(u(n), P[k]);
  // o sol baixa atrás do palácio e se põe às 9,6 s
  gl.uniform3fv(u('uSun'), dirOf(74, lerp(3.4, -1.9, cl(t / 10.2))));
  gl.uniform1f(u('uSunK'), 1 - seg(t, 9.2, 10.2));
  gl.uniform3fv(u('uMoon'), dirOf(148, 6)); gl.uniform1f(u('uMoonK'), 0.0);
  gl.uniform1f(u('uLight'), 1.08 * seg(t, 8.75, 12.5));
  gl.uniform4fv(u('uA'), BOX(PS)); gl.uniform4fv(u('uH'), BOX(PS));
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  ov.setTransform(1, 0, 0, 1, 0, 0); ov.clearRect(0, 0, W, H);
  helicoptero(t, c, P);
  pessoas(t, c, P);
  tanque(t, c, P);
  portao(t, c, P);
  presidente(t, c);
  soldados(t, c, P);
  poeira(t, c, P);
  rotulos(t, c, P);
  const fim = cl(0.92 * (1 - seg(t, 0.0, 0.85)) + seg(t, 14.35, 15.0));
  veu.style.opacity = String(fim);
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => render(clock.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.__render = render;
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(clock.t));
