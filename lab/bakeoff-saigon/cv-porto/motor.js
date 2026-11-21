// motor.js — Saigon, 29–30/04/1975. Um relógio só: render(t) monta o quadro inteiro a partir do tempo.
// Céu, nuvens e sol saem do shader do estilo "porto de Nova York"; o horizonte vem de cena.js; o resto (helicóptero, tanque, portão, palácio, soldados) é desenhado por cima.
const DUR = 15, W = 1920, H = 1080, CAMH = 8.0;
const RAD = Math.PI / 180;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const sine = x => 0.5 - 0.5 * Math.cos(Math.PI * cl(x));
const outc = x => 1 - Math.pow(1 - cl(x), 3);
const seg = (t, a, b, f = sine) => f(cl((t - a) / (b - a)));
const dirOf = (az, el) => [Math.sin(az * RAD) * Math.cos(el * RAD), Math.sin(el * RAD), Math.cos(az * RAD) * Math.cos(el * RAD)];
const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };

// ───────── a câmera: um plano só. Giros nos cortes de assunto, paradas em volta ─────────
function camAt(t) {
  const yaw = 52 * seg(t, 4.55, 6.05) + 3 * seg(t, 6.0, 9.0, x => x) + 45 * seg(t, 9.0, 10.3) + 3 * seg(t, 10.3, 12.6, x => x) + 37 * seg(t, 12.6, 13.7) + 2 * seg(t, 13.7, 15, x => x);
  const fov = 56 - 14 * seg(t, 4.55, 6.05) - 4 * seg(t, 6.05, 8.2) + 11 * seg(t, 8.9, 10.3) - 3 * seg(t, 10.3, 12.6) - 4 * seg(t, 12.6, 13.7) - 3 * seg(t, 13.7, 15);
  const hor = 0.6 - 0.26 * seg(t, 4.55, 6.05) + 0.16 * seg(t, 8.9, 10.3) - 0.17 * seg(t, 12.6, 13.7);
  const tanH = Math.tan(fov / 2 * RAD), tanV = tanH * H / W;
  const pitch = Math.atan((2 * hor - 1) * tanV), roll = 0;
  const cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const F = [sy * cp, sp, cy * cp], R = [cy, 0, -sy];
  const U = [F[1] * R[2] - F[2] * R[1], F[2] * R[0] - F[0] * R[2], F[0] * R[1] - F[1] * R[0]];
  return { yaw, fov, pitch, roll, tanH, tanV, F, R, U };
}
function proj(c, d) {
  const x = d[0] * c.R[0] + d[1] * c.R[1] + d[2] * c.R[2], y = d[0] * c.U[0] + d[1] * c.U[1] + d[2] * c.U[2], z = d[0] * c.F[0] + d[1] * c.F[1] + d[2] * c.F[2];
  if (z <= 0.02) return null;
  const vx = x / z, vy = y / z;
  return [(vx / c.tanH + 1) / 2 * W, (1 - vy / c.tanV) / 2 * H, z];
}
// ponto do mundo: azimute-base, distância, deslocamento lateral em metros e altura do chão → tela + metros por pixel
function at(c, az, D, x, h) {
  const a = az * RAD, v = [Math.sin(a) * D + Math.cos(a) * x, h - CAMH, Math.cos(a) * D - Math.sin(a) * x];
  const len = Math.hypot(...v), p = proj(c, v.map(q => q / len)); if (!p) return null;
  return { x: p[0], y: p[1], m: (W / 2 / c.tanH) / (len * p[2]) };
}

// ───────── paleta: fim de tarde de 29/04 → manhã pálida de 30/04 → crepúsculo do fim ─────────
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const KEYS = ['zen', 'mid', 'hor', 'glow', 'glowK', 'belt', 'beltK', 'cLit', 'cDark', 'cloud', 'wispC', 'wispK', 'water', 'silNear', 'amb', 'moonC'];
const PAL = [
  [0.0,  '#a07ccc', '#e08fba', '#f4b39c', '#ffb894', 1.0,  '#e597c0', 0.0,  '#fdbf98', '#eea0b4', 0.74, '#e0a8c8', 0.0,  '#6e4660', '#4e2a3b', '#ffffff', '#f3ddb0'],
  [4.2,  '#9a74c4', '#dc88b4', '#f2a994', '#ffa882', 1.0,  '#e597c0', 0.0,  '#fdbf98', '#eea0b4', 0.74, '#e0a8c8', 0.0,  '#6a4260', '#4a2838', '#fbe9e4', '#f3ddb0'],
  [6.0,  '#8a86c6', '#c9a4cc', '#f2cdb4', '#ffd2a8', 0.3,  '#e0a8c8', 0.1,  '#f7d3c4', '#c9a0c4', 0.62, '#d0b0d4', 0.0,  '#7a6482', '#5a4466', '#f1e6ee', '#f3ddb0'],
  [9.0,  '#8a86c6', '#c4a2ca', '#eecbb8', '#ffd2a8', 0.2,  '#e0a8c8', 0.1,  '#f2d0c8', '#c0a0c6', 0.6,  '#d0b0d4', 0.0,  '#76627f', '#554263', '#eee4ee', '#f3ddb0'],
  [12.5, '#7a76b8', '#bb98c4', '#e6bcb6', '#f6b6a2', 0.15, '#dc9cc4', 0.1,  '#ecc2c2', '#b394c2', 0.6,  '#c8a4d2', 0.1,  '#6c587a', '#4a3a5c', '#e6dcec', '#f3ddb0'],
  [15.0, '#5c5aa4', '#9a78bc', '#c892bf', '#f2a3ae', 0.1,  '#df90c3', 0.2,  '#d8a0c4', '#a073b8', 0.62, '#b898cf', 0.2,  '#54466e', '#3c3055', '#cfc3e0', '#f3ddb0'],
].map(row => [row[0], ...row.slice(1).map(v => typeof v === 'string' ? hex(v) : v)]);
function palAt(t) {
  let i = 0; while (i < PAL.length - 2 && t >= PAL[i + 1][0]) i++;
  const a = PAL[i], b = PAL[i + 1], k = sine((t - a[0]) / (b[0] - a[0])), o = {};
  KEYS.forEach((key, j) => { const x = a[j + 1], y = b[j + 1]; o[key] = Array.isArray(x) ? x.map((v, n) => lerp(v, y[n], k)) : lerp(x, y, k); });
  return o;
}

// ───────── WebGL2: céu, nuvens, sol, o chão e a silhueta do horizonte ─────────
const VS = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 frag;
uniform vec2 uRes; uniform float uT;
uniform vec3 uF, uR, uU; uniform vec2 uTan; uniform float uRoll;
uniform vec3 uZen, uMid, uHor, uGlow, uBelt, uCLit, uCDark, uWispC, uWater, uSilNear, uAmb, uMoonC;
uniform float uGlowK, uBeltK, uCloud, uWispK, uMoonK, uSunK;
uniform vec3 uSun, uMoon;
uniform sampler2D tA;
uniform vec4 uA;
const float R2D = 57.2957795;
uint hsh(uvec2 v) { v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; return v.x; }
float h2(vec2 p) { return float(hsh(uvec2(ivec2(p) + 65536))) * (1.0 / 4294967295.0); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p, int oct) { float a = 0.5, s = 0.0; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * vnoise(p); p = m * p + 3.1; a *= 0.5; } return s; }
float angDeg(vec3 a, vec3 b) { return atan(length(cross(a, b)), dot(a, b)) * R2D; }

// céu: degradê por altura, o cinturão rosa do lado oposto ao sol, o brilho do sol
vec3 skyBase(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.2, e));
  c = mix(c, uZen, smoothstep(0.16, 0.62, e));
  vec2 sh = normalize(uSun.xz + vec2(1e-6)), dh = normalize(d.xz + vec2(1e-6));
  float anti = -dot(sh, dh);
  float belt = smoothstep(0.02, 0.1, e) * (1.0 - smoothstep(0.14, 0.34, e)) * smoothstep(-0.4, 0.6, anti);
  c = mix(c, uBelt, uBeltK * belt);
  float cs = max(dot(d, uSun), 0.0), low = 1.0 - smoothstep(0.0, 0.5, e);
  c += uGlow * uGlowK * (0.15 * pow(cs, 4.0) * low + 0.06 * pow(cs, 40.0) + 0.05 * pow(cs, 900.0));
  return c;
}
vec3 addDiscs(vec3 d, vec3 c) {
  float as = angDeg(d, uSun);
  c = mix(c, vec3(1.0, 0.985, 0.93), uSunK * (1.0 - smoothstep(0.88, 0.94, as)));
  if (uMoonK > 0.001) {
    float am = angDeg(d, uMoon);
    c += uMoonC * uMoonK * (0.2 * exp(-am / 2.0) + 0.1 * exp(-am / 7.0));
    if (am < 1.5) {
      vec3 mr = normalize(cross(vec3(0.0, 1.0, 0.0), uMoon)), mu = cross(uMoon, mr);
      vec2 lp = vec2(dot(d, mr), dot(d, mu)) / tan(1.35 / R2D);
      float mar = smoothstep(0.5, 0.56, fbm(lp * 2.2 + 4.0, 4)) * 0.6 + smoothstep(0.62, 0.66, fbm(lp * 5.0 + 1.0, 3)) * 0.3;
      float rr = length(lp);
      vec3 mc = uMoonC * mix(1.0, 0.84, mar) * (1.0 - 0.12 * rr * rr);
      c = mix(c, mc, (1.0 - smoothstep(0.965, 1.02, rr)) * uMoonK);
    }
  }
  return c;
}
// nuvens em escama: ruído torcido num plano do céu, com bordas em faixas
vec4 clouds(vec3 d, int oct) {
  if (uCloud <= 0.001 || d.y < 0.003) return vec4(0.0);
  vec2 p = d.xz / d.y * 2.1 + vec2(0.022, 0.008) * uT;
  vec2 q = vec2(p.x * 0.6 + p.y * 0.15, p.y * 1.5 - p.x * 0.15);
  vec2 w = vec2(fbm(q * 0.7 + vec2(11.0, 3.0), oct), fbm(q * 0.7 + vec2(23.0, 9.0), oct));
  float n = fbm(q * 1.5 + w * 2.4, oct) + 0.05 * sin((q.x * 0.5 + q.y * 2.6) * 5.0 + w.y * 9.0);
  float th = mix(0.74, 0.44, uCloud);
  float aa = 0.018 + 0.09 * (1.0 - smoothstep(0.0, 0.25, d.y));
  float m = smoothstep(th, th + aa, n), hi = smoothstep(th + 0.045, th + 0.045 + aa, n);
  vec3 col = mix(uCDark, uCLit, hi) + uGlow * uGlowK * 0.3 * pow(max(dot(d, uSun), 0.0), 6.0);
  return vec4(col, m * smoothstep(0.018, 0.14, d.y) * smoothstep(0.0, 0.25, uCloud));
}
// fiapos finos do crepúsculo e da noite
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
vec4 silA(vec2 a) {
  vec2 uv = uvOf(a, uA);
  vec4 s = texture(tA, uv) * inside(uv);
  float hz = clamp(s.r / max(s.a, 0.004), 0.0, 1.0);
  return vec4(mix(uSilNear, hazeCol(a.x), hz * 0.96) * s.a, s.a);
}
// o chão: cor lisa que some na névoa do horizonte
vec3 groundCol(vec3 d) {
  float dist = 8.0 / max(-d.y, 1e-4);
  vec3 hz = hazeCol(atan(d.x, d.z) * R2D);
  float k = exp(-dist / 260.0);
  return mix(uWater * 0.7, hz, k * 0.5);
}
vec3 rayAt(vec2 fc) {
  vec2 q = fc / uRes * 2.0 - 1.0;
  vec2 v = vec2(q.x * uTan.x, q.y * uTan.y);
  return normalize(uF + v.x * uR + v.y * uU);
}
void main() {
  vec3 d = rayAt(gl_FragCoord.xy);
  vec4 s = silA(azs(d));
  vec3 c = d.y > 0.0 ? skyAll(d, 5) : groundCol(d);
  c = c * (1.0 - s.a) + s.rgb;
  vec2 vq = gl_FragCoord.xy / uRes - 0.5;
  c *= 1.0 - 0.3 * pow(clamp(length(vq * vec2(1.0, 0.85)) * 1.3, 0.0, 1.0), 2.4);
  c += (h2(floor(gl_FragCoord.xy)) - 0.5) / 255.0;
  frag = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

const glc = document.getElementById('gl');
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
const PA = cenaS();
upload(0, premul(pixels(PA.cv)), PA.W, PA.H, 'tA');

// ───────── a camada de cima ─────────
const ov = document.getElementById('ov').getContext('2d');
const veu = document.getElementById('veu');
const rgb = (c, k = 1, a = 1) => `rgba(${Math.round(cl(c[0] * k) * 255)},${Math.round(cl(c[1] * k) * 255)},${Math.round(cl(c[2] * k) * 255)},${a})`;
const mixc = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
let P = null;                                  // paleta do quadro
const tone = (h, k = 1) => { const c = hex(h); return rgb([c[0] * P.amb[0], c[1] * P.amb[1], c[2] * P.amb[2]], k); };
// objeto de perto: cor própria, escurecida pela luz do momento, e um pouco de névoa
const near = (h, haze = 0.0) => { const c = hex(h), a = P.amb; return rgb(mixc([c[0] * a[0], c[1] * a[1], c[2] * a[2]], P.hor, haze)); };
function sprite(p, scale, fn) { ov.save(); ov.translate(p.x, p.y); ov.scale(p.m * scale, -p.m * scale); fn(); ov.restore(); }
function pl(pts, fill) { ov.beginPath(); ov.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ov.lineTo(pts[i][0], pts[i][1]); ov.closePath(); if (fill) { ov.fillStyle = fill; ov.fill(); } }
function ln(pts, w, col) { ov.beginPath(); ov.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ov.lineTo(pts[i][0], pts[i][1]); ov.lineWidth = w; ov.strokeStyle = col; ov.lineCap = 'round'; ov.lineJoin = 'round'; ov.stroke(); }
function quad(c, az, D, x0, x1, h0, h1, fill) {
  const a = at(c, az, D, x0, h1), b = at(c, az, D, x1, h1), d = at(c, az, D, x0, h0), e = at(c, az, D, x1, h0); if (!a || !b || !d || !e) return;
  ov.beginPath(); ov.moveTo(a.x, a.y); ov.lineTo(b.x, b.y); ov.lineTo(e.x, e.y); ov.lineTo(d.x, d.y); ov.closePath(); ov.fillStyle = fill; ov.fill();
}
const visible = (p, m = 400) => p && p.x > -m && p.x < W + m;
const hub = (a, b, ph) => Math.abs(Math.cos(ph * 2 * Math.PI)) * (b - a) + a;

// helicóptero de transporte de tandem rotores (tipo CH-46, verde-oliva), visto de lado, voltado para a direita; origem no chão
function heliDraw(t, spool) {
  const olive = near('#3f4a35', 0.06), dark = near('#2c3426', 0.04), glass = near('#6a7660', 0.1);
  pl([[-9.2, 1.5], [-9.2, 4.1], [-6.8, 4.8], [5.6, 4.8], [8.2, 3.6], [8.4, 2.6], [7.4, 1.5]], olive);
  pl([[-9.2, 4.1], [-7.8, 4.1], [-6.5, 7.6], [-8.5, 7.6]], olive);          // pilone de trás
  pl([[4.0, 4.8], [5.4, 4.8], [5.2, 6.8], [4.2, 6.8]], olive);              // pilone da frente
  pl([[5.6, 3.4], [7.8, 3.4], [8.2, 3.9], [6.4, 4.6], [5.6, 4.6]], glass);  // cabine
  ln([[-9.0, 1.6], [-9.0, 4.0]], 0.22, dark);                                 // rampa traseira
  for (const x of [-5.5, 4.4]) { ov.beginPath(); ov.arc(x, 0.75, 0.75, 0, 7); ov.fillStyle = dark; ov.fill(); ln([[x, 1.4], [x, 1.9]], 0.25, dark); }
  // rotores: disco fino que borra, mais a pá que passa
  for (const [x, y, r, ph] of [[-7.5, 7.7, 7.4, 0.0], [4.8, 6.9, 7.4, 0.5]]) {
    ov.globalAlpha = 0.16 * spool; ov.beginPath(); ov.ellipse(x, y, r, 0.38, 0, 0, 7); ov.fillStyle = dark; ov.fill();
    ov.globalAlpha = 1; const L = hub(0.25, r, t * 3.1 * spool + ph);
    ln([[x - L, y - 0.05 * L / r], [x + L, y + 0.05 * L / r]], 0.14, dark);
    ln([[x, y - 0.2], [x, y + 0.2]], 0.35, dark);
  }
}
function heli(t, c) {
  const roofH = 14 - 0;                                  // altura do telhado (m)
  const liftT = 3.49;                                    // "evacuam"
  const k = outc((t - liftT) / 2.3), k2 = cl((t - liftT) / 1.4);
  const spool = cl(0.5 + 0.5 * seg(t, 0, 1.5) - 0.0, 0.5, 1);
  const p = at(c, 0, 70, 2 + 11 * Math.pow(k, 1.4), roofH + 0.1 + 26 * k * k * (1.4 - 0.4 * k) * 0.55 + 16 * sine(k2) * 0.0);
  if (!visible(p)) return;
  const tilt = -0.12 * sine(k2) * (1 - cl((t - liftT - 2) / 1.5));
  sprite(p, 1, () => { ov.rotate(tilt); heliDraw(t, spool); });
}
// segundo helicóptero, ao longe, cruzando o céu devagar
function heliLonge(t, c) {
  if (t > 4.9) return;
  const x = lerp(-24, 70, t / 4.9), p = at(c, x, 520, 0, 52 + 4 * Math.sin(t * 0.9)); if (!visible(p)) return;
  sprite(p, 0.8, () => { ov.scale(-1, 1); heliDraw(t * 1.3, 1); });
}
// o prédio com o heliponto, as pessoas na escada
function telhado(t, c) {
  const roofH = 14, D = 70;
  const wall = near('#46304c', 0.14), win = near('#33243a', 0.1), edge = near('#58405a', 0.12);
  quad(c, 0, D, -28, 30, 0, roofH, wall);
  quad(c, 0, D, -28.6, 30.6, roofH, roofH + 0.6, edge);
  for (let f = 0; f < 3; f++) for (let i = 0; i < 17; i++) quad(c, 0, D, -25 + i * 3.3, -23.4 + i * 3.3, 1.3 + f * 4, 3.3 + f * 4, win);
  // corpo de escada no lado esquerdo do telhado, onde as pessoas aparecem
  quad(c, 0, D, -23, -19, roofH + 0.6, roofH + 3.2, edge);
  // marca do heliponto
  quad(c, 0, D, -3, 12, roofH + 0.6, roofH + 0.8, near('#7a5a6a', 0.1));
  // fila subindo a escada de embarque: da porta da escada até a rampa traseira
  if (t < 3.7) for (let i = 0; i < 7; i++) {
    const t0 = 0.35 + i * 0.42, k = (t - t0) / 1.9; if (k < 0 || k > 1) continue;
    const x = lerp(-18.5, -7, cl(k / 0.62)), climb = cl((k - 0.62) / 0.38);
    const p = at(c, 0, D - 3, x + 4.2 * climb, roofH + 0.6 + 2.2 * climb * 0.95); if (!visible(p)) continue;
    const bob = Math.abs(Math.sin(t * 9 + i * 1.7)) * 0.1, s = 1 - 0.0;
    sprite(p, s, () => { ov.translate(0, bob); pessoa(near('#2a2030', 0.05), i % 2 ? 0.18 : 0.1); });
  }
  // escada de embarque (inclinada) até a rampa
  const a = at(c, 0, D - 3, -7 + 0.0, roofH + 0.6), b = at(c, 0, D - 3, -2.8, roofH + 3.0);
  if (a && b && t < 3.6) { ln([[a.x, a.y], [b.x, b.y]], a.m * 0.22, near('#2c2230', 0.05)); ln([[a.x, a.y - a.m * 1.0], [b.x, b.y - a.m * 1.0]], a.m * 0.1, near('#2c2230', 0.05)); }
}
function pessoa(col, lean = 0) {          // metros, origem nos pés, de pé
  ov.fillStyle = col; ov.beginPath(); ov.arc(0, 1.62, 0.12, 0, 7); ov.fill();
  pl([[-0.2, 0.8], [0.2, 0.8], [0.22 + lean, 1.5], [-0.22 + lean, 1.5]], col);
  ln([[-0.08, 0.85], [-0.12, 0.0]], 0.16, col); ln([[0.08, 0.85], [0.14, 0.0]], 0.16, col);
}

// o tanque, de costas, subindo a avenida em direção ao portão (silhueta verde, sem marcação)
function tanqueDraw(t, k) {
  const body = near('#3e4a34', 0.08), dark = near('#2a3223', 0.06), mid = near('#4c5a40', 0.08);
  pl([[-1.7, 0.3], [1.7, 0.3], [1.7, 1.15], [1.3, 1.6], [-1.3, 1.6], [-1.7, 1.15]], body);
  for (const sx of [-1, 1]) { pl([[sx * 1.9, 0.1], [sx * 1.45, 0.1], [sx * 1.45, 1.25], [sx * 1.9, 1.25]], dark); ln([[sx * 1.67, 0.1], [sx * 1.67, 1.2]], 0.06, mid); }
  pl([[-1.1, 1.6], [1.1, 1.6], [0.9, 2.1], [-0.9, 2.1]], mid);                                // torre
  ov.beginPath(); ov.ellipse(0, 2.1, 0.9, 0.2, 0, 0, 7); ov.fillStyle = mid; ov.fill();
  ln([[0.2, 2.0], [0.2, 2.45]], 0.18, dark);                                                   // cano visto de topo
  ln([[-1.2, 1.35], [1.2, 1.35]], 0.08, dark);
}
function tanque(t, c) {
  const t0 = 5.2, t1 = 7.97, rise = 9.6;
  const k = t < t1 ? (t - t0) / (t1 - t0) : 1;
  const D = t < t1 ? lerp(32, 47.2, Math.pow(cl(k), 0.95)) : lerp(47.2, 58, Math.min(1, (t - t1) / 1.4));
  const p = at(c, 54, D, 0.2, 0); if (!visible(p)) return;
  const x0 = D, bump = t > t1 ? 0.06 * Math.sin((t - t1) * 8) * Math.exp(-(t - t1) * 3) : 0;
  sprite(p, 1.5, () => { ov.translate(0, bump); tanqueDraw(t, k); });
  // poeira que fica para trás (sem fogo): círculos chapados que sobem e somem
  for (let i = 0; i < 6; i++) {
    const age = ((t - 5.4) * 0.8 + i * 0.37) % 1.6, tt = t - age * 0.5; if (t < 5.4 || age < 0) continue;
    const q = at(c, 54, Math.max(18, D - 3 - age * 2), 0.2 + Math.sin(i * 2.1) * 1.8, 0.5 + age * 0.9); if (!visible(q)) continue;
    ov.globalAlpha = 0.16 * (1 - age / 1.6); ov.beginPath(); ov.arc(q.x, q.y, q.m * (0.7 + age * 0.9), 0, 7); ov.fillStyle = rgb(mixc(P.hor, [1, 1, 1], 0.2)); ov.fill(); ov.globalAlpha = 1;
  }
}
// palácio, muro e portão
function palacio(t, c) {
  const az = 54, D = 95;
  const flat = near('#5a4460', 0.34), shade = near('#4a3652', 0.3), roof = near('#6a5470', 0.3), dim = near('#3a2a44', 0.28);
  quad(c, az, D, -22, 22, 0, 4.4, dim);                              // térreo recuado
  quad(c, az, D, -24, 24, 4.4, 5.2, roof);                            // laje
  quad(c, az, D, -21, 21, 5.2, 9.6, flat);                            // 2º andar, com brises
  quad(c, az, D, -25, 25, 9.6, 10.4, roof);
  quad(c, az, D, -15, 15, 10.4, 14.6, flat);                          // 3º andar, só no centro
  quad(c, az, D, -17, 17, 14.6, 15.4, roof);
  // brises: barras verticais mais escuras, em vez de janela
  for (let x = -21; x < 21; x += 1.4) quad(c, az, D, x, x + 0.45, 5.2, 9.6, shade);
  for (let x = -15; x < 15; x += 1.4) quad(c, az, D, x, x + 0.45, 10.4, 14.6, shade);
  for (let x = -22; x < 22; x += 5) quad(c, az, D, x, x + 1.2, 0, 4.4, near('#2e2036', 0.2));    // pilotis
  // árvores nos dois lados da avenida
  for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) {
    const dd = 20 + i * 7.5, p = at(c, az, dd, sx * (11 + i * 0.5), 0); if (!visible(p, 300)) continue;
    sprite(p, 0.8, () => { ln([[0, 0], [0, 4.2]], 0.45, near('#2a1d30', 0.1)); for (const [cx, cy, r] of [[0, 6.2, 3.1], [-2, 5.2, 2.2], [2.1, 5.3, 2.3]]) { ov.beginPath(); ov.arc(cx, cy, r, 0, 7); ov.fillStyle = near('#35263c', 0.12 + i * 0.02); ov.fill(); } });
  }
  // avenida
  const rd = near('#6a5470', 0.22);
  const a = at(c, az, 16, -6, 0), b = at(c, az, 16, 6, 0), d = at(c, az, 70, 6, 0), e = at(c, az, 70, -6, 0);
  if (a && b && d && e) { ov.beginPath(); ov.moveTo(a.x, a.y); ov.lineTo(b.x, b.y); ov.lineTo(d.x, d.y); ov.lineTo(e.x, e.y); ov.closePath(); ov.fillStyle = rd; ov.fill(); }
  // muro e portão (D = 48)
  const GD = 48, wall = near('#6a5470', 0.2), bar = near('#2b1f33', 0.08);
  quad(c, az, GD, -34, -5.2, 0, 1.4, wall); quad(c, az, GD, 5.2, 34, 0, 1.4, wall);
  for (let x = -34; x < -5.2; x += 0.5) quad(c, az, GD, x, x + 0.09, 1.4, 2.7, bar);
  for (let x = 5.4; x < 34; x += 0.5) quad(c, az, GD, x, x + 0.09, 1.4, 2.7, bar);
  quad(c, az, GD, -34, -5, 2.6, 2.75, bar); quad(c, az, GD, 5, 34, 2.6, 2.75, bar);
  quad(c, az, GD, -5.5, -4.1, 0, 3.8, wall); quad(c, az, GD, 4.1, 5.5, 0, 3.8, wall);              // pilares
  quad(c, az, GD, -5.8, -3.8, 3.8, 4.3, near('#7a6480', 0.2)); quad(c, az, GD, 3.8, 5.8, 3.8, 4.3, near('#7a6480', 0.2));
  // as duas folhas: caem para trás, achatando, a partir de 7,97
  const th = Math.PI / 2 * outc((t - 7.97) / 0.75), ch = Math.cos(th), sh = Math.sin(th), hh = 3.0;
  for (const sx of [-1, 1]) {
    const xa = sx * 4.1, xb = sx * 0.05;
    const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
    const top = hh * ch, far = hh * sh * 0.0;
    const a1 = at(c, az, GD, x0, 0), a2 = at(c, az, GD, x1, 0), a3 = at(c, az, GD + hh * sh * 1.0, x1, top), a4 = at(c, az, GD + hh * sh * 1.0, x0, top);
    if (!a1 || !a2 || !a3 || !a4) continue;
    ov.beginPath(); ov.moveTo(a1.x, a1.y); ov.lineTo(a2.x, a2.y); ov.lineTo(a3.x, a3.y); ov.lineTo(a4.x, a4.y); ov.closePath(); ov.fillStyle = bar; ov.fill();
    // vãos entre as barras: aparecem enquanto a folha está de pé
    if (ch > 0.3) { ov.save(); ov.clip(); for (let k = 0.12; k < 1; k += 0.14) { const xx = lerp(a1.x, a2.x, k), xt = lerp(a4.x, a3.x, k); ln([[xx, lerp(a1.y, a4.y, 0.12)], [xt, lerp(a1.y, a4.y, 0.92)]], Math.max(1, a1.m * 0.1), near('#6a5470', 0.2)); } ov.restore(); }
  }
}
// poeira do portão (círculos chapados), só depois do impacto
function impacto(t, c) {
  const k = (t - 7.97) / 1.2; if (k < 0 || k > 1) return;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.39996, r = outc(k) * (3 + (i % 3)) , q = at(c, 54, 48 + Math.sin(a) * 1.5, Math.cos(a) * r, 0.4 + Math.abs(Math.sin(a * 1.7)) * 1.8 * outc(k)); if (!q) continue;
    ov.globalAlpha = 0.2 * (1 - k); ov.beginPath(); ov.arc(q.x, q.y, q.m * (0.8 + 1.2 * k), 0, 7); ov.fillStyle = rgb(mixc(P.hor, [1, 1, 1], 0.25)); ov.fill(); ov.globalAlpha = 1;
  }
}
// retrato do presidente do Sul: silhueta chapada num painel, sem rosto
function retrato(t, c) {
  const az = 100, D = 40;
  quad(c, az, D, -4, 24, 0, 11, near('#46304c', 0.22));
  quad(c, az, D, -4.6, 24.6, 11, 11.6, near('#58405a', 0.2));
  const p = at(c, az, D, 10, 3.2); if (!p) return;
  sprite(p, 1, () => {
    pl([[-4.3, 0], [4.3, 0], [4.3, 9.2], [-4.3, 9.2]], near('#f0d9cc', 0.05));              // o painel claro
    ln([[-4.3, 0], [4.3, 0], [4.3, 9.2], [-4.3, 9.2], [-4.3, 0]], 0.2, near('#6a4a5a', 0.05));
    const s = near('#33243a', 0.0);
    ov.beginPath(); ov.ellipse(0, 5.9, 1.05, 1.35, 0, 0, 7); ov.fillStyle = s; ov.fill();   // cabeça
    pl([[-0.45, 4.8], [0.45, 4.8], [0.55, 4.2], [-0.55, 4.2]], s);                          // pescoço
    pl([[-3.2, 0.2], [3.2, 0.2], [3.0, 2.4], [1.6, 3.9], [0.5, 4.3], [-0.5, 4.3], [-1.6, 3.9], [-3.0, 2.4]], s);   // paletó
    pl([[-0.5, 4.3], [0.5, 4.3], [0, 2.6]], near('#f0d9cc', 0.05));                         // gola da camisa
  });
}
// soldados deixando os fuzis no chão
function soldados(t, c) {
  const az = 140, D = 44, N = 5;
  const rd = near('#6a5470', 0.22);
  const a = at(c, az, 18, -9, 0), b = at(c, az, 18, 9, 0), d = at(c, az, 90, 9, 0), e = at(c, az, 90, -9, 0);
  if (a && b && d && e) { ov.beginPath(); ov.moveTo(a.x, a.y); ov.lineTo(b.x, b.y); ov.lineTo(d.x, d.y); ov.lineTo(e.x, e.y); ov.closePath(); ov.fillStyle = rd; ov.fill(); }
  quad(c, az, 60, -22, 22, 0, 2.2, near('#5a4460', 0.3));          // muro baixo ao fundo
  for (let i = 0; i < N; i++) {
    const x = -6 + i * 3.1, t0 = 13.81 + i * 0.1;
    const p = at(c, az, D + (i % 2) * 2, x * 1.1, 0); if (!visible(p)) continue;
    const k = cl((t - t0) / 0.5), up = cl((t - t0 - 0.5) / 0.45), put = sine(k) * (1 - sine(up));
    const col = near('#2a2030', 0.04);
    sprite(p, 1.3, () => {
      const lower = 0.55 * put, bend = 0.4 * put;
      ov.fillStyle = col; ov.beginPath(); ov.arc(bend * 0.9, 1.62 - lower * 1.2, 0.13, 0, 7); ov.fill();                    // cabeça
      pl([[bend * 0.9 - 0.16, 1.7 - lower * 1.2], [bend * 0.9 + 0.16, 1.7 - lower * 1.2], [bend * 0.9 + 0.2, 1.62 - lower * 1.2], [bend * 0.9 - 0.2, 1.62 - lower * 1.2]], col);  // capacete
      pl([[-0.2, 0.85 - lower * 0.7], [0.2, 0.85 - lower * 0.7], [0.22 + bend, 1.5 - lower], [-0.22 + bend, 1.5 - lower]], col);
      ln([[-0.08, 0.85 - lower * 0.7], [-0.14 - bend * 0.2, 0.0]], 0.17, col); ln([[0.1, 0.85 - lower * 0.7], [0.16 + bend * 0.2, 0.0]], 0.17, col);
      // fuzil: de pé ao lado do corpo até a palavra; depois inclina e fica deitado no chão
      const ang = lerp(80, 4, sine(cl((t - t0) / 0.7))) * RAD, bx = 0.5 + 0.6 * sine(cl((t - t0) / 0.7)), by = lerp(0.1, 0.06, sine(cl((t - t0) / 0.7)));
      const L = 1.0;
      ln([[bx, by], [bx + Math.cos(ang) * L, by + Math.sin(ang) * L]], 0.1, col);
      ln([[0.1 + bend, 1.3 - lower], [bx + Math.cos(ang) * L * 0.4, by + Math.sin(ang) * L * 0.4]], 0.09, col);
    });
  }
}

// ───────── texto ─────────
const CREME = '#fff1dc', ACENTO = '#e597c0';
function fade(t, a, b, d = 0.35) { return cl((t - a) / d) * cl((b - t) / d); }
function texto(s, x, y, size, col, a, off = 0) {
  if (a <= 0.01) return;
  ov.save(); ov.globalAlpha = a; ov.font = `700 ${size}px 'Barlow Condensed', sans-serif`; ov.letterSpacing = `${(size * 0.1).toFixed(1)}px`; ov.textBaseline = 'alphabetic';
  ov.shadowColor = 'rgba(48,22,56,0.5)'; ov.shadowBlur = 14; ov.fillStyle = col; ov.fillText(s, x + off, y); ov.restore();
}
function legendas(t) {
  const x = 120;
  { const a = fade(t, 0.5, 4.6), o = (1 - outc((t - 0.5) / 0.6)) * 28; texto('29 DE ABRIL', x, 210, 110, CREME, a, -o); texto('SAIGON', x + 4, 280, 60, CREME, a, -o); }
  { const a = fade(t, 5.0, 8.7), o = (1 - outc((t - 5.0) / 0.6)) * 28; texto('30 DE ABRIL', x, 210, 110, CREME, a, -o); }
  { const a = fade(t, 9.3, 10.5), o = (1 - outc((t - 9.3) / 0.6)) * 28; texto('DUONG VAN MINH', x, 520, 100, CREME, a, -o); texto('PRESIDENTE DO SUL', x + 4, 580, 54, CREME, a, -o); }
  { const a = fade(t, 10.6, 12.4, 0.25), o = (1 - outc((t - 10.6) / 0.5)) * 28; texto('MINH · 2 DIAS NO CARGO', x, 520, 78, CREME, a, -o);
    if (a > 0.01) for (let i = 0; i < 2; i++) { const on = t > (i ? 12.06 : 10.7); ov.save(); ov.globalAlpha = a; ov.strokeStyle = ACENTO; ov.lineWidth = 5; ov.strokeRect(x + 4 + i * 70, 550, 56, 56); if (on) { ov.fillStyle = ACENTO; ov.globalAlpha = a * outc((t - (i ? 12.06 : 10.7)) / 0.2); ov.fillRect(x + 4 + i * 70, 550, 56, 56); } ov.restore(); } }
}

function render(t) {
  const c = camAt(t); P = palAt(t);
  gl.viewport(0, 0, W, H);
  gl.uniform2f(u('uRes'), W, H); gl.uniform1f(u('uT'), t);
  gl.uniform3fv(u('uF'), c.F); gl.uniform3fv(u('uR'), c.R); gl.uniform3fv(u('uU'), c.U);
  gl.uniform2f(u('uTan'), c.tanH, c.tanV); gl.uniform1f(u('uRoll'), c.roll);
  for (const [k, n] of [['zen', 'uZen'], ['mid', 'uMid'], ['hor', 'uHor'], ['glow', 'uGlow'], ['belt', 'uBelt'], ['cLit', 'uCLit'], ['cDark', 'uCDark'], ['wispC', 'uWispC'], ['water', 'uWater'], ['silNear', 'uSilNear'], ['amb', 'uAmb'], ['moonC', 'uMoonC']]) gl.uniform3fv(u(n), P[k]);
  for (const [k, n] of [['glowK', 'uGlowK'], ['beltK', 'uBeltK'], ['cloud', 'uCloud'], ['wispK', 'uWispK']]) gl.uniform1f(u(n), P[k]);
  gl.uniform3fv(u('uSun'), dirOf(8, lerp(2.3, 0.2, seg(t, 0, 5)))); gl.uniform1f(u('uSunK'), 1 - seg(t, 3.6, 5.2));
  gl.uniform3fv(u('uMoon'), dirOf(0, 30)); gl.uniform1f(u('uMoonK'), 0);
  gl.uniform4fv(u('uA'), [PA.az0, PA.az1, PA.s0, PA.s1]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  ov.setTransform(1, 0, 0, 1, 0, 0); ov.clearRect(0, 0, W, H);
  heliLonge(t, c); telhado(t, c); heli(t, c);
  palacio(t, c); tanque(t, c); impacto(t, c);
  retrato(t, c); soldados(t, c);
  legendas(t);
  veu.style.opacity = String(cl(0.88 * (1 - seg(t, 0, 1.3)) + seg(t, 14.2, 15)));
}

const clock = { t: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => render(clock.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.__render = render;
window.seek = t => { render(t); };
document.fonts.load("700 40px 'Barlow Condensed'").catch(() => {}).then(() => { window.__ready = true; render(0); });
