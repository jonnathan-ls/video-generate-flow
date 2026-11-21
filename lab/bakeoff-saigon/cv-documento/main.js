
// =====================================================================================
// Saigon, 29–30/04: papel (helicópteros) → portal no ponto final → noite (tanque, portão, cartão do presidente) → papel (armas)
// Marcos de tempo vêm de palavras.json: evacuam 3,49 · palácio 7,97 · Duong 10,61 · dois 12,07 · deporem 13,81
// =====================================================================================
const W0 = 1920, H0 = 1080;
const CORTE_IDA = 4.93, CORTE_VOLTA = 12.95, S_MAX = 150;
const ease = (x) => x * x * (3 - 2 * x);
const inQuad = (x) => x * x;
const OLIVA = "#6e7a3c", VERDE = "#4d6b3b", AREIA = "#c9b98a";

// ---------- lápis: preenchimento com hachura diagonal ----------
const lapis = (ctx, desenha, cor, bk, forca = 0.8, passo = 9, dens = 0.5) => {
  ctx.save();
  desenha();
  ctx.fillStyle = rgba(cor, forca);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = rgba(mix(cor, "#000000", 0.35), dens);
  ctx.lineWidth = 1.4;
  const off = (bk % 3) * 0.8;
  ctx.beginPath();
  for (let x = -H0; x < W0 + 60; x += passo) {
    ctx.moveTo(x + off, H0 + 40);
    ctx.lineTo(x + off + H0 * 0.7, -40);
  }
  ctx.stroke();
  ctx.restore();
};
const linha = (ctx, pts, cor, lw, bk, amp = 1.1, sem = 0) => {
  ctx.strokeStyle = cor;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  caminho(ctx, tremor(pts, amp, bk * 5.1 + sem));
  ctx.stroke();
};
const retangulo = (ctx, x, y, w, h) => {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
};

// ---------- figuras ----------
// pessoa de lado: alt em px; modo: 'anda' | 'parado' | 'fuzil'
const pessoa = (g, x, y, alt, cor, bk, fase = 0, braco = -0.4, capacete = false, tinta) => {
  const { ctx } = g;
  const hh = alt * 0.16, tronco = alt * 0.34, perna = alt * 0.4;
  const quadril = [x, y - perna], ombro = [x, y - perna - tronco];
  const cabeca = [x, ombro[1] - hh * 1.05];
  const lw = Math.max(2.2, alt * 0.035);
  const passo = Math.sin(fase) * alt * 0.12;
  linha(ctx, [quadril, [x + passo, y]], tinta, lw, bk, 0.6, x);
  linha(ctx, [quadril, [x - passo, y]], tinta, lw, bk, 0.6, x + 3);
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(x - alt * 0.075, quadril[1]);
    ctx.lineTo(x - alt * 0.09, ombro[1]);
    ctx.lineTo(x + alt * 0.09, ombro[1]);
    ctx.lineTo(x + alt * 0.075, quadril[1]);
    ctx.closePath();
  }, cor, bk, 0.9, 5, 0.4);
  linha(ctx, [[x - alt * 0.075, quadril[1]], [x - alt * 0.09, ombro[1]], [x + alt * 0.09, ombro[1]], [x + alt * 0.075, quadril[1]], [x - alt * 0.075, quadril[1]]], tinta, lw * 0.8, bk, 0.6, x + 9);
  const hand = [x + Math.cos(braco) * alt * 0.3, ombro[1] + alt * 0.04 - Math.sin(braco) * alt * 0.3];
  linha(ctx, [[x, ombro[1] + alt * 0.04], hand], tinta, lw, bk, 0.6, x + 5);
  ctx.fillStyle = rgba("#e9d3b4");
  ctx.beginPath();
  ctx.arc(cabeca[0], cabeca[1], hh, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = tinta;
  ctx.lineWidth = lw * 0.7;
  ctx.stroke();
  if (capacete) {
    ctx.fillStyle = rgba(cor);
    ctx.beginPath();
    ctx.arc(cabeca[0], cabeca[1] - hh * 0.1, hh * 1.12, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  return { hand, ombro, cabeca };
};
const rifle = (g, x, y, ang, comp, bk, tinta) => {
  const { ctx } = g;
  const dx = Math.cos(ang), dy = -Math.sin(ang);
  linha(ctx, [[x, y], [x + dx * comp, y + dy * comp]], tinta, 4, bk, 0.5, x);
  linha(ctx, [[x, y], [x + dx * comp * 0.27, y + dy * comp * 0.27]], "#7b4f26", 9, bk, 0.4, x + 2);
};

// ---------- helicóptero (tandem, de lado, voltado para a direita) ----------
const helicoptero = (g, cx, cy, esc, rot, T, bk, tinta, alfa = 1, rotor = 1) => {
  const { ctx } = g;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(esc, esc);
  const lw = 3.6;
  // fuselagem
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-205, -30);
    ctx.lineTo(-215, -92);
    ctx.lineTo(-150, -60);
    ctx.lineTo(-120, -60);
    ctx.lineTo(120, -62);
    ctx.quadraticCurveTo(205, -62, 215, -10);
    ctx.quadraticCurveTo(190, 36, 100, 36);
    ctx.lineTo(-150, 36);
    ctx.quadraticCurveTo(-205, 36, -205, -30);
    ctx.closePath();
  }, OLIVA, bk, 0.92, 7, 0.45);
  linha(ctx, [[-205, -30], [-215, -92], [-150, -60], [-120, -60], [120, -62], [190, -50], [215, -10], [190, 20], [100, 36], [-150, 36], [-205, 10], [-205, -30]], tinta, lw, bk, 1.2, 3);
  // cabine, janelas e porta
  ctx.fillStyle = rgba("#bcd4df", 0.9);
  retangulo(ctx, 128, -52, 62, 30);
  ctx.fill();
  ctx.strokeStyle = tinta;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = rgba(mix(OLIVA, "#000000", 0.45), 0.9);
  retangulo(ctx, -20, -44, 62, 60);
  ctx.fill();
  ctx.stroke();
  [-95, -60, 70, 100].forEach((x) => {
    ctx.fillStyle = rgba("#bcd4df", 0.8);
    ctx.beginPath();
    ctx.arc(x, -30, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });
  // trem de pouso
  linha(ctx, [[-120, 36], [-125, 62], [-95, 62]], tinta, 3, bk, 0.6, 21);
  linha(ctx, [[110, 36], [118, 62], [148, 62]], tinta, 3, bk, 0.6, 22);
  // pilones e rotores
  const hubs = [[105, -92, 1], [-175, -122, 0.82]];
  linha(ctx, [[105, -62], [105, -92]], tinta, 5, bk, 0.5, 31);
  linha(ctx, [[-175, -92], [-175, -122]], tinta, 5, bk, 0.5, 32);
  hubs.forEach(([hx, hy, k], i) => {
    const r = 175 * k;
    const giro = T * (rotor * 38 + i * 3);
    ctx.save();
    ctx.translate(hx, hy);
    // pás: 3 linhas com eixo achatado, quadros com leque borrado
    ctx.strokeStyle = rgba(tinta, 0.75);
    ctx.lineWidth = 4;
    for (let b = 0; b < 3; b++) {
      const a = giro + (b * TAU) / 3;
      const c = Math.cos(a);
      ctx.beginPath();
      ctx.moveTo(-c * r, 0);
      ctx.lineTo(c * r, 0);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(tinta, 0.09);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, 9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = tinta;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
};

// ---------- tanque (T-54, de lado, voltado para a direita; x é a frente do casco) ----------
const tanque = (g, fx, chaoY, esc, T, bk, tinta, alfa = 1, dist = 0) => {
  const { ctx } = g;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(fx, chaoY);
  ctx.scale(esc, esc);
  const lw = 3.4, bob = Math.sin(T * 17) * 1.2;
  ctx.translate(0, bob);
  // esteira
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-285, -8);
    ctx.quadraticCurveTo(-300, -52, -262, -54);
    ctx.lineTo(-42, -52);
    ctx.quadraticCurveTo(-4, -50, 0, -10);
    ctx.quadraticCurveTo(-4, 0, -30, 0);
    ctx.lineTo(-262, 0);
    ctx.quadraticCurveTo(-285, 0, -285, -8);
    ctx.closePath();
  }, mix("#2d3a22", "#000000", 0.2), bk, 0.95, 6, 0.4);
  for (let i = 0; i < 5; i++) {
    const wx = -45 - i * 55, a = -dist / 24 + i;
    ctx.fillStyle = rgba(mix(VERDE, "#000000", 0.25));
    ctx.beginPath();
    ctx.arc(wx, -25, 22, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = tinta;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(a) * 17, -25 + Math.sin(a) * 17);
    ctx.lineTo(wx - Math.cos(a) * 17, -25 - Math.sin(a) * 17);
    ctx.stroke();
  }
  linha(ctx, [[-285, -8], [-300, -30], [-262, -54], [-42, -52], [-4, -50], [0, -10], [-30, 0], [-262, 0], [-285, -8]], tinta, lw, bk, 1, 5);
  // casco
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-270, -52);
    ctx.lineTo(-250, -92);
    ctx.lineTo(-45, -92);
    ctx.lineTo(8, -52);
    ctx.closePath();
  }, VERDE, bk, 0.95, 7, 0.45);
  linha(ctx, [[-270, -52], [-250, -92], [-45, -92], [8, -52], [-270, -52]], tinta, lw, bk, 1, 8);
  // torre (cúpula) e canhão
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-210, -92);
    ctx.quadraticCurveTo(-205, -145, -125, -148);
    ctx.quadraticCurveTo(-60, -145, -52, -92);
    ctx.closePath();
  }, mix(VERDE, "#ffffff", 0.08), bk, 0.95, 7, 0.45);
  linha(ctx, [[-210, -92], [-205, -125], [-160, -148], [-95, -148], [-58, -125], [-52, -92]], tinta, lw, bk, 1, 11);
  const rec = Math.sin(Math.min(1, Math.max(0, dist)) * 0) * 0;
  lapis(ctx, () => retangulo(ctx, -60, -128, 235 + rec, 12), mix(VERDE, "#000000", 0.2), bk, 0.95, 5, 0.4);
  linha(ctx, [[-60, -128], [175, -128], [175, -116], [-60, -116], [-60, -128]], tinta, 2.6, bk, 0.8, 12);
  ctx.fillStyle = tinta;
  ctx.beginPath();
  ctx.arc(-120, -158, 8, 0, TAU);
  ctx.fill();
  ctx.restore();
};

// ---------- cenário noturno: avenida, palácio e portão ----------
const palacio = (g, T, bk, chao) => {
  const { ctx, th } = g;
  const tinta = rgba(th.ink, 0.9);
  const x0 = 1210, x1 = 1800, y1 = chao, yT = chao - 330;
  // corpo principal (modernista: faixas horizontais e brise vertical)
  lapis(ctx, () => retangulo(ctx, x0, yT, x1 - x0, y1 - yT), mix(th.bg, th.ink, 0.14), bk, 0.95, 11, 0.25);
  // brise: hachura vertical clara nas faixas dos andares
  ctx.strokeStyle = rgba(th.ink, 0.28);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0 + 20; x < x1 - 10; x += 22) {
    ctx.moveTo(x, yT + 28);
    ctx.lineTo(x, yT + 175);
  }
  ctx.stroke();
  // andares e laje do telhado (beiral saliente)
  [yT, yT + 28, yT + 175, yT + 205].forEach((y, i) => linha(ctx, [[x0 - (i === 0 ? 30 : 0), y], [x1 + (i === 0 ? 30 : 0), y]], tinta, i === 0 ? 5 : 3, bk, 0.9, i * 7));
  // entrada com pilotis
  for (let i = 0; i < 6; i++) {
    const px = x0 + 80 + i * 105;
    lapis(ctx, () => retangulo(ctx, px - 11, yT + 205, 22, y1 - yT - 205), mix(th.ink, th.bg, 0.5), bk, 0.9, 8, 0.2);
    linha(ctx, [[px - 11, yT + 205], [px - 11, y1], [px + 11, y1], [px + 11, yT + 205]], tinta, 2.6, bk, 0.7, 20 + i);
  }
  linha(ctx, [[x0, yT], [x0, y1], [x1, y1], [x1, yT], [x0, yT]], tinta, 4, bk, 1, 2);
  // escada baixa
  for (let i = 0; i < 3; i++) linha(ctx, [[x0 + 60 - i * 14, y1 - 8 - i * 0], [x1 - 60 + i * 14, y1 - 8]], rgba(th.ink, 0.0), 1, bk);
};
const portao = (g, T, bk, chao) => {
  const { ctx, th } = g;
  const tinta = th.ink;
  const gx = 1075;
  const queda = (d) => {
    const k = seg(T, 7.97 + d, 8.62 + d);
    return Math.PI / 2 * 0.97 * inQuad(k) + (k > 0.0 ? 0.0 : 0);
  };
  // pilares laterais (o da esquerda tomba junto)
  const folha = (x, larg, ang) => {
    ctx.save();
    ctx.translate(x, chao);
    ctx.rotate(ang);
    const alt = 190;
    lapis(ctx, () => retangulo(ctx, 0, -alt, larg, alt), mix(th.bg, th.ink, 0.1), bk, 0.4, 14, 0.2);
    ctx.strokeStyle = rgba(tinta, 0.95);
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      ctx.moveTo(i * (larg / 6), -alt);
      ctx.lineTo(i * (larg / 6), 0);
    }
    ctx.moveTo(0, -alt * 0.78);
    ctx.lineTo(larg, -alt * 0.78);
    ctx.moveTo(0, -alt * 0.22);
    ctx.lineTo(larg, -alt * 0.22);
    ctx.moveTo(0, -alt);
    ctx.lineTo(larg, -alt);
    ctx.stroke();
    ctx.restore();
  };
  // pilar direito (fixo) e folhas
  lapis(ctx, () => retangulo(ctx, gx + 214, chao - 215, 26, 215), mix(th.ink, th.bg, 0.45), bk, 0.9, 9, 0.2);
  linha(ctx, [[gx + 214, chao], [gx + 214, chao - 215], [gx + 240, chao - 215], [gx + 240, chao]], rgba(tinta, 0.95), 3, bk, 0.8, 2);
  folha(gx + 108, 104, queda(0.1));
  folha(gx + 0, 104, queda(0));
};
const poeira = (g, T, bk, chao) => {
  const { ctx, th } = g;
  const t0 = 7.97;
  if (T < t0 || T > t0 + 1.2) return;
  const k = seg(T, t0, t0 + 1.2);
  for (let i = 0; i < 7; i++) {
    const a = hash(i + 4.1);
    const r = (22 + a * 48) * (0.4 + outCubic(k));
    const x = 1075 + 30 + i * 36 + k * (sgn(i + 2) * 50 + 20), y = chao - 18 - k * (30 + a * 70);
    ctx.strokeStyle = rgba(th.ink, 0.6 * (1 - k));
    ctx.fillStyle = rgba(mix(th.bg, th.ink, 0.35), 0.35 * (1 - k));
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(x + sgn(bk + i) * 1.5, y + sgn(bk + i + 7) * 1.5, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
};

// ---------- título à mão, com ponto final que é o portal ----------
const fonteT = (px) => `italic 700 ${px}px Inter, "Helvetica Neue", Arial, sans-serif`;
const tituloGeo = (ctx, texto, px, cx, base) => {
  ctx.font = fonteT(px);
  const larg = ctx.measureText(texto).width;
  const r = px * 0.1;
  const total = larg + px * 0.12 + r * 2;
  const x0 = cx - total / 2;
  return { x0, larg, r, ponto: [x0 + larg + px * 0.12 + r, base - r * 1.05], base, px };
};
const titulo = (g, geo, texto, cor, prog, bk, comPonto = true) => {
  const { ctx } = g;
  ctx.save();
  if (prog < 1) {
    ctx.beginPath();
    ctx.rect(geo.x0 - 30, geo.base - geo.px * 1.2, (geo.larg + 80) * prog, geo.px * 1.6);
    ctx.clip();
  }
  ctx.font = fonteT(geo.px);
  ctx.fillStyle = cor;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(texto, geo.x0 + sgn(bk) * 1.2, geo.base + sgn(bk + 0.3) * 1.2);
  ctx.restore();
  if (comPonto && prog >= 0.98) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(geo.ponto[0], geo.ponto[1], geo.r, 0, TAU);
    ctx.fill();
  }
};
const TIT1 = "29 DE ABRIL · SAIGON";
const TIT2 = "30 DE ABRIL";
const TIT3 = "DEPOR AS ARMAS";
let G1, G3;
const geos = (ctx) => {
  G1 = G1 || tituloGeo(ctx, TIT1, 104, W0 / 2, 190);
  G3 = G3 || tituloGeo(ctx, TIT3, 104, W0 / 2, 190);
};

// ---------- câmera do portal ----------
const cam = (T) => {
  if (T >= 3.95 && T < CORTE_IDA) return Math.pow(S_MAX, Math.pow(seg(T, 3.95, CORTE_IDA), 2.2));
  if (T >= CORTE_VOLTA && T < 13.7) return Math.pow(S_MAX, Math.pow(1 - seg(T, CORTE_VOLTA, 13.7), 2.6));
  return 1;
};
const portalCam = (g, T, ponto, desenhaMundo) => {
  const { ctx, th } = g;
  const s = cam(T);
  const e = ease(clamp(Math.log(s) / Math.log(9)));
  const sx = lerp(ponto[0], W0 / 2, e), sy = lerp(ponto[1], H0 / 2, e);
  ctx.fillStyle = rgba(mix(th.ink, "#ffffff", Math.min(0.3, (s - 1) * 0.05)));
  ctx.fillRect(0, 0, W0, H0);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(s, s);
  ctx.translate(-ponto[0], -ponto[1]);
  if (s < 8) {
    ctx.globalAlpha = 1 - seg(s, 3, 8);
    ctx.drawImage(texturaPapel(th), -W0 * 0.1, -H0 * 0.1, W0 * 1.2, H0 * 1.2);
    ctx.globalAlpha = 1;
  }
  desenhaMundo(s);
  ctx.restore();
  return { s, sx, sy };
};
const aneis = (g, ponto, T, a, b, s) => {
  const { ctx, th } = g;
  const anel = seg(T, a, b) * (1 - seg(s, 2.5, 4));
  if (anel <= 0) return;
  ctx.strokeStyle = rgba(th.bg, 0.55 * anel);
  ctx.lineWidth = 1.9;
  [6, 22].forEach((k) => {
    ctx.beginPath();
    ctx.arc(ponto[0], ponto[1], 11 * k * anel, 0, TAU);
    ctx.stroke();
  });
};


// ---------- raios e miolo do portal, em espaço de tela ----------
const portalTela = (g, T, info, ate, de = 0) => {
  const { ctx } = g;
  const { s, sx, sy } = info;
  if (s > 2.2) miolo(g, sx, sy, 11 * s * 0.86, T);
  const dens = de ? 1 - seg(T, 12.95 + 0.0, 13.55) : seg(T, 4.0, 4.4);
  if (dens > 0 && s > 1.01) raios(g, sx, sy, dens, de ? 1.3 : 0, Math.floor(T * 14));
};

// ---------- 1 · papel: helicópteros (0–4,93) ----------
const CHAO1 = 880;
const papel1 = (g, T) => {
  const { ctx, th } = g;
  geos(ctx);
  const bk = Math.floor(T * 12 + 1e-6);
  const tinta = th.bg;
  const topo = CHAO1;
  const info = portalCam(g, T, G1.ponto, () => {
    // a câmera inclina para seguir o helicóptero que sobe e volta ao lugar antes do mergulho
    ctx.translate(0, 260 * ease(seg(T, 3.49, 3.72)) * (1 - ease(seg(T, 3.72, 4.15))));
    titulo(g, G1, TIT1, tinta, seg(T, 0.12, 0.85), bk);
    ctx.save();
    ctx.translate(250, 0);
    lapis(ctx, () => retangulo(ctx, 150, topo, 1000, 260), mix(th.ink, th.bg, 0.12), bk, 0.9, 13, 0.2);
    linha(ctx, [[60, topo], [1240, topo]], rgba(tinta, 0.95), 5, bk, 1.2, 1);
    linha(ctx, [[150, topo], [150, H0 + 20]], tinta, 3, bk, 0.8, 9);
    linha(ctx, [[1150, topo], [1150, H0 + 20]], tinta, 3, bk, 0.8, 10);
    lapis(ctx, () => retangulo(ctx, 190, topo - 130, 150, 130), mix(th.ink, th.accent2, 0.1), bk, 0.9, 10, 0.3);
    linha(ctx, [[190, topo], [190, topo - 130], [340, topo - 130], [340, topo]], tinta, 4, bk, 1, 3);
    linha(ctx, [[245, topo], [245, topo - 70], [285, topo - 70], [285, topo]], tinta, 3, bk, 0.8, 4);
    // helicóptero distante
    const fx = lerp(1450, 1700, seg(T, 0.2, 4.4)), fy = 470 + Math.sin(T * 1.6) * 8;
    helicoptero(g, fx, fy, 0.3, 0.03, T, bk, rgba(tinta, 0.8), 0.65, 0.9);
    // principal: paira junto ao telhado e sobe em "evacuam"
    const lift = Math.max(0, T - 3.49);
    const hx = 700 + (T > 3.49 ? 190 * lift * lift + 90 * lift : 0);
    const antic = T > 3.39 && T < 3.49 ? seg(T, 3.39, 3.49) * 10 : 0;
    const hy = topo - 215 + antic - (T > 3.49 ? 10 + 300 * inQuad(lift) : 0) + Math.sin(T * 2.3) * 3;
    const rot = T > 3.49 ? -0.12 * ease(seg(T, 3.49, 4.1)) : 0;
    const ladX = 700;
    const topY = hy + 36, topX = hx + 10;
    const sway = Math.sin(T * 3) * 4 + (T > 3.49 ? -45 * ease(seg(T, 3.49, 4.3)) : 0);
    const botX = topX + sway, botY = T < 3.49 ? topo - 6 : topY + 178;
    // pessoas (atrás do helicóptero para entrar na porta)
    const cores = [th.accent, th.accent2, "#8d9a6a", mix(th.accent, th.ink, 0.35), th.accent2, "#8d9a6a"];
    for (let i = 0; i < 6; i++) {
      const t0 = 0.7 + i * 0.4, tf = t0 + 0.6;
      if (T > tf) continue;
      const rank = Math.max(0, i - Math.max(0, (T - 0.7) / 0.4));
      const prog = seg(T, t0, tf);
      let px = ladX + 56 + rank * 56, py = topo, ph = rank > 0 ? T * 9 + i : 0;
      if (T >= t0) {
        px = lerp(ladX + 56, botX, ease(clamp(prog * 3)));
        const subida = ease(clamp((prog - 0.2) / 0.8));
        py = topo - (topo - (topY + 4)) * subida;
        ph = T * 14;
      }
      const alt = 118 * (1 - 0.18 * seg(prog, 0.5, 1));
      ctx.save();
      ctx.globalAlpha = 1 - seg(prog, 0.6, 1);
      pessoa(g, px, py, alt, cores[i], bk, ph, T >= t0 ? 1.0 : -0.5, false, tinta);
      ctx.restore();
    }
    // escada de corda
    ctx.strokeStyle = tinta;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(topX - 15, topY);
    ctx.lineTo(botX - 15, botY);
    ctx.moveTo(topX + 15, topY);
    ctx.lineTo(botX + 15, botY);
    for (let i = 1; i < 8; i++) {
      const k = i / 8, px = lerp(topX, botX, k), py = lerp(topY, botY, k);
      ctx.moveTo(px - 15, py);
      ctx.lineTo(px + 15, py);
    }
    ctx.stroke();
    helicoptero(g, hx, hy, 1, rot, T, bk, tinta, 1, T > 3.49 ? 1.4 : 1);
    ctx.restore();
    aneis(g, G1.ponto, T, 3.7, 3.95, 1);
  });
  portalTela(g, T, info, true);
};

// ---------- 2 · noite: tanque derruba o portão (4,93–8,5) ----------
const CHAO2 = 880;
const noite1 = (g, T) => {
  const { ctx, th, w, h } = g;
  geos(ctx);
  const bk = Math.floor(T * 12 + 1e-6);
  ceu(g);
  const tinta = th.ink;
  let sh = 0;
  if (T > 7.97 && T < 8.3) sh = Math.exp(-(T - 7.97) * 14) * 9 * sgn(Math.floor(T * 60) * 1.7);
  ctx.save();
  ctx.translate(sh, sh * 0.6);
  // título
  const G2 = (g._g2 = g._g2 || tituloGeo(ctx, TIT2, 104, 520, 190));
  titulo(g, G2, TIT2, th.ink, seg(T, 4.98, 5.55), bk, false);
  // soco de câmera no impacto: entra 1→1,32 em 0,15 s e volta até 8,5 s
  const pz = T < 7.97 ? 1 : T < 8.12 ? lerp(1, 1.5, outCubic(seg(T, 7.97, 8.12))) : lerp(1.5, 1, ease(seg(T, 8.12, 8.5)));
  ctx.save();
  ctx.translate(1100, 820);
  ctx.scale(pz, pz);
  ctx.translate(-1100, -820);
  // cenário em escala 1,3: o portão fica perto de x=1050 na tela
  ctx.save();
  ctx.translate(-347, -244);
  ctx.scale(1.3, 1.3);
  // prédios ao longe (contorno fino, só linhas)
  [[280, 200], [420, 270], [560, 170], [690, 240], [830, 190], [950, 150]].forEach(([x, alt], i) => {
    const wd = 110 + (i % 3) * 20;
    linha(ctx, [[x, CHAO2], [x, CHAO2 - alt], [x + wd, CHAO2 - alt], [x + wd, CHAO2]], rgba(th.ink, 0.35), 3, bk, 0.8, 100 + i);
    ctx.strokeStyle = rgba(th.ink, 0.18);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = CHAO2 - alt + 22; y < CHAO2 - 10; y += 26) {
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + wd - 10, y);
    }
    ctx.stroke();
  });
  linha(ctx, [[-500, CHAO2], [2500, CHAO2]], rgba(th.ink, 0.85), 4, bk, 1.2, 77);
  for (let i = -4; i < 24; i++) linha(ctx, [[i * 120, CHAO2 + 24], [i * 120 + 50, CHAO2 + 24]], rgba(th.ink, 0.25), 3, bk, 0.8, i);
  palacio(g, T, bk, CHAO2);
  portao(g, T, bk, CHAO2);
  const imp = 7.97, V = 150;
  const d1 = T < imp ? V * (T - 4.93) : V * (imp - 4.93) + 110 * (T - imp);
  const fx1 = 1075 - V * (imp - 4.93) + d1;
  const d2 = 120 * (T - 4.93);
  const fx2 = Math.min(330 + d2, 780);
  tanque(g, fx2, CHAO2 - 40, 0.62, T, bk, rgba(th.ink, 0.9), 0.85, d2);
  tanque(g, fx1, CHAO2 + 18, 1, T, bk, th.ink, 1, d1);
  poeira(g, T, bk, CHAO2);
  ctx.restore();
  ctx.restore();
  ctx.restore();
  if (T >= 7.97 && T < 8.12) {
    ctx.fillStyle = rgba(mix(th.ink, "#ffffff", 0.4), 0.85 * (1 - seg(T, 7.97, 8.12)));
    ctx.fillRect(0, 0, w, h);
  }
};

// ---------- 3 · transição: estrela, espectro, cartão do presidente (8,45–12,95) ----------
const cartaoMinh = (g, T, bk, esc, vivo) => {
  const { ctx, th } = g;
  const cx = W0 / 2, cy = H0 / 2 + 10, cw = 760, ch = 700;
  const x0 = cx - cw / 2, y0 = cy - ch / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(esc, esc);
  ctx.translate(-cx, -cy);
  // halo
  const gl = ctx.createRadialGradient(cx, cy, ch * 0.2, cx, cy, ch * 0.95);
  gl.addColorStop(0, rgba(th.accent, 0.4 * vivo));
  gl.addColorStop(1, rgba(th.accent, 0));
  ctx.fillStyle = gl;
  ctx.fillRect(cx - ch, cy - ch, ch * 2, ch * 2);
  ctx.fillStyle = rgba(mix(th.ink, "#ffffff", 0.45));
  capsula(ctx, x0, y0, cw, ch, 22);
  ctx.fill();
  ctx.save();
  capsula(ctx, x0, y0, cw, ch, 22);
  ctx.clip();
  // fundo da ilustração: céu em lápis e sol pálido
  lapis(ctx, () => retangulo(ctx, x0, y0, cw, ch * 0.66), mix(th.accent2, th.ink, 0.62), bk, 0.9, 12, 0.2);
  ctx.fillStyle = rgba(th.accent2, 0.75);
  ctx.beginPath();
  ctx.arc(x0 + cw * 0.78, y0 + ch * 0.2, 52, 0, TAU);
  ctx.fill();
  // silhueta: ombros e cabeça sem rosto, em lápis azul
  const sx = cx - 30, ombroY = y0 + ch * 0.66;
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(sx - 250, ombroY);
    ctx.quadraticCurveTo(sx - 235, y0 + ch * 0.42, sx - 80, y0 + ch * 0.41);
    ctx.lineTo(sx + 80, y0 + ch * 0.41);
    ctx.quadraticCurveTo(sx + 235, y0 + ch * 0.42, sx + 250, ombroY);
    ctx.closePath();
  }, mix(th.bg, th.accent, 0.35), bk, 0.95, 8, 0.4);
  lapis(ctx, () => {
    ctx.beginPath();
    ctx.ellipse(sx, y0 + ch * 0.27, 78, 98, 0, 0, TAU);
  }, mix(th.bg, th.accent, 0.35), bk, 0.95, 8, 0.4);
  ctx.fillStyle = rgba(mix(th.bg, th.accent, 0.35));
  retangulo(ctx, sx - 34, y0 + ch * 0.34, 68, 80);
  ctx.fill();
  linha(ctx, [[sx - 250, ombroY], [sx - 235, y0 + ch * 0.42], [sx - 80, y0 + ch * 0.41]], th.bg, 5, bk, 1.1, 41);
  linha(ctx, [[sx + 80, y0 + ch * 0.41], [sx + 235, y0 + ch * 0.42], [sx + 250, ombroY]], th.bg, 5, bk, 1.1, 42);
  ctx.strokeStyle = th.bg;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(sx + sgn(bk) * 1.2, y0 + ch * 0.27, 78, 98, 0, 0, TAU);
  ctx.stroke();
  // faixa de legenda
  ctx.fillStyle = rgba(mix(th.ink, "#ffffff", 0.45));
  retangulo(ctx, x0, ombroY, cw, ch * 0.34);
  ctx.fill();
  linha(ctx, [[x0, ombroY], [x0 + cw, ombroY]], th.bg, 5, bk, 1, 51);
  ctx.restore();
  // contorno à mão
  const pts = tremor(subdividir([[x0, y0], [x0 + cw, y0], [x0 + cw, y0 + ch], [x0, y0 + ch], [x0, y0]], 5), 1.4, bk * 4.1 + 9);
  ctx.strokeStyle = th.bg;
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  caminho(ctx, pts, true);
  ctx.stroke();
  ctx.restore();
};
const legendasCartao = (g, T, bk) => {
  const { ctx, th } = g;
  const cx = W0 / 2, cy = H0 / 2 + 10, ch = 700;
  const yL = cy - ch / 2 + ch * 0.66 + ch * 0.17;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = th.bg;
  // 9,63 "presidente do Sul" (3 palavras) até 10,6
  const a1 = seg(T, 9.63, 9.95) * (1 - seg(T, 10.5, 10.6));
  if (a1 > 0) {
    ctx.save();
    ctx.globalAlpha = a1;
    ctx.font = fonteT(50);
    ctx.fillText("PRESIDENTE DO SUL", cx + sgn(bk) * 1.2, yL + sgn(bk + 3) * 1.2);
    ctx.restore();
  }
  // 10,61 nome completo (3 palavras), depois contrai para "MINH" quando entra o chip (4 palavras)
  const a2 = seg(T, 10.61, 11.0) * (1 - seg(T, 12.45, 12.7));
  if (a2 > 0) {
    ctx.save();
    ctx.globalAlpha = a2;
    const comp = seg(T, 11.4, 11.75);
    const txA = "DUONG VAN ", txB = "MINH", t1 = "· ", t2 = "DIAS NO CARGO";
    ctx.font = fonteT(52);
    const wA = ctx.measureText(txA).width, wB = ctx.measureText(txB).width;
    const wDot = ctx.measureText(t1).width, wT2 = ctx.measureText(t2).width;
    const grupo = wB + 12 + wDot + 46 + 12 + wT2;
    const xFim = cx - grupo / 2;
    const xB = lerp(cx - (wA + wB) / 2 + wA, xFim, ease(comp));
    const prog = seg(T, 10.61, 11.0);
    ctx.textAlign = "left";
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 400, yL - 60, 800 * prog, 120);
    ctx.clip();
    ctx.globalAlpha = a2 * (1 - comp);
    ctx.fillText(txA, cx - (wA + wB) / 2 + sgn(bk) * 1.2, yL - 30 * ease(comp) + sgn(bk + 3) * 1.2);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 400, yL - 60, 800 * prog + 140, 120);
    ctx.clip();
    ctx.globalAlpha = a2;
    ctx.fillText(txB, xB + sgn(bk + 1) * 1.2, yL + sgn(bk + 3) * 1.2);
    ctx.restore();
    const chip = seg(T, 11.45, 11.75);
    if (chip > 0) {
      ctx.globalAlpha = a2 * chip;
      ctx.fillStyle = th.bg;
      const xs = xFim + wB + 12;
      ctx.fillText(t1, xs, yL + sgn(bk + 2) * 1.2);
      const slot = xs + wDot + 2;
      const carimbo = seg(T, 12.07, 12.2);
      if (carimbo <= 0) {
        linha(ctx, [[slot, yL + 20], [slot + 40, yL + 20]], th.bg, 4, bk, 0.8, 91);
      } else {
        const k = outBack(carimbo, 2.4);
        ctx.save();
        ctx.translate(slot + 22, yL);
        ctx.scale(k, k);
        ctx.fillStyle = th.accent;
        ctx.textAlign = "center";
        ctx.font = fonteT(72);
        ctx.fillText("2", 0, 0);
        ctx.restore();
      }
      ctx.fillStyle = th.bg;
      ctx.textAlign = "left";
      ctx.font = fonteT(52);
      ctx.fillText(t2, slot + 56, yL + sgn(bk + 5) * 1.2);
    }
    ctx.restore();
  }
};
let BMP = null;
const transicao = (g, T) => {
  const { ctx, th, w, h } = g;
  const bk = Math.floor(T * 12 + 1e-6);
  ceu(g);
  const cx = w / 2, cy = h / 2;
  const cores = coresFaixas(th);
  if (T < 8.8) {
    // a cena do tanque continua por baixo e a estrela cresce no portão (8,45–8,8)
    noite1(g, 8.45 + Math.min(T - 8.45, 0.3) * 0.6);
    const k = seg(T, 8.45, 8.78);
    const ex = lerp(1150, cx, ease(seg(T, 8.6, 8.78))), ey = lerp(800, cy, ease(seg(T, 8.6, 8.78)));
    const sr = 60 * Math.pow(32, inQuad(k));
    const gl = ctx.createRadialGradient(ex, ey, 0, ex, ey, sr * 3.4);
    gl.addColorStop(0, rgba(th.ink, 0.95));
    gl.addColorStop(0.25, rgba(mix(th.ink, th.accent2, 0.35), 0.6));
    gl.addColorStop(1, rgba(th.accent2, 0));
    ctx.fillStyle = gl;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = rgba(mix(th.ink, "#ffffff", 0.4));
    estrela(ctx, ex, ey, sr, 0.15);
    ctx.fill();
    const branco = seg(T, 8.7, 8.79);
    if (branco > 0) {
      ctx.fillStyle = rgba(mix(th.ink, "#ffffff", 0.4), branco);
      ctx.fillRect(0, 0, w, h);
    }
    return;
  }
  // espectro: seis faixas entram da esquerda em sequência e depois se juntam num cartão
  const cw = 760, ch = 700, fh = h / 6;
  const entra = (i) => outCubic(seg(T, 8.8 + i * 0.03, 8.9 + i * 0.03));
  const junta = outCubic(seg(T, 9.05, 9.4));
  const cartaoK = seg(T, 9.3, 9.5);
  if (cartaoK < 1) {
    for (let i = 0; i < 6; i++) {
      const e = entra(i);
      const yA0 = i * fh, yA1 = (i + 1) * fh + 1;
      const yB0 = cy - ch / 2 + (i / 6) * ch, yB1 = cy - ch / 2 + ((i + 1) / 6) * ch;
      const xL = lerp(-40, cx - cw / 2, junta), xR = lerp(w + 40, cx + cw / 2, junta);
      const x1 = lerp(xL, xR, e);
      const c = mix(mix(th.ink, "#ffffff", 0.4), cores[i], clamp(seg(T, 8.8, 8.95)));
      ctx.fillStyle = rgba(c, 1 - cartaoK);
      ctx.beginPath();
      ctx.rect(xL, lerp(yA0, yB0, junta), x1 - xL, lerp(yA1, yB1, junta) - lerp(yA0, yB0, junta));
      ctx.fill();
    }
  }
  const esc = T < 12.45 ? lerp(0.96, 1, ease(seg(T, 9.3, 9.6))) * (T < 9.55 ? outBack(seg(T, 9.3, 9.55), 1.8) : 1) : 1;
  if (T >= 9.3 && T < 12.45) {
    ctx.globalAlpha = cartaoK;
    cartaoMinh(g, T, bk, T < 9.55 ? outBack(seg(T, 9.3, 9.55), 1.8) : 1, 1);
    ctx.globalAlpha = 1;
    legendasCartao(g, T, bk);
  }
  // saída (B9): zoom para fora; o cartão vira a célula central de uma grade de cartões iguais
  if (T >= 12.45) {
    const k = seg(T, 12.45, 12.95);
    const sc = Math.pow(0.085, outCubic(k));
    if (!BMP) {
      BMP = novaTela(900, 800);
      const bx = BMP.getContext("2d");
      bx.translate(450 - W0 / 2, 400 - (H0 / 2 + 10));
      cartaoMinh({ ctx: bx, th }, 0, 0, 1, 1);
    }
    ctx.save();
    ctx.translate(cx, cy + 10);
    ctx.scale(sc, sc);
    for (let j = -12; j <= 12; j++)
      for (let i = -17; i <= 17; i++) {
        if (!i && !j) continue;
        const px = cx + i * 860 * sc - cx, py = cy + 10 + j * 780 * sc - (cy + 10);
        if (Math.abs(i * 860 * sc) > w / 2 + 460 * sc || Math.abs(j * 780 * sc) > h / 2 + 400 * sc) continue;
        ctx.globalAlpha = 0.92 * (1 - seg(k, 0.72, 1));
        ctx.drawImage(BMP, i * 860 - 450, j * 780 - 400);
        // moldura colorida em anéis concêntricos
        const anel = Math.max(Math.abs(i), Math.abs(j));
        ctx.strokeStyle = rgba(cores[anel % 6], 0.9 * (1 - seg(k, 0.72, 1)));
        ctx.lineWidth = 9 / Math.max(sc, 0.2);
        ctx.strokeRect(i * 860 - 380, j * 780 - 350, 760, 700);
      }
    ctx.restore();
    ctx.globalAlpha = 1;
    cartaoMinh(g, T, bk, sc, 1);
  }
};

// ---------- 4 · papel de volta: soldados deixam as armas (12,95–15) ----------
const CHAO3 = 880;
const papel2 = (g, T) => {
  const { ctx, th, w, h } = g;
  geos(ctx);
  const bk = Math.floor(T * 12 + 1e-6);
  const tinta = th.bg;
  const info = portalCam(g, T, G3.ponto, () => {
    linha(ctx, [[-60, CHAO3], [w + 60, CHAO3]], rgba(tinta, 0.9), 5, bk, 1.2, 3);
    for (let i = 0; i < 8; i++) linha(ctx, [[120 + i * 230, CHAO3 + 26], [190 + i * 230, CHAO3 + 26]], rgba(tinta, 0.25), 3, bk, 0.8, i);
    titulo(g, G3, TIT3, tinta, 1, bk);
    // três soldados, de lado, voltados para a direita, fuzis na vertical até as palavras "deporem as armas"
    const xs = [560, 900, 1240];
    const t0s = [13.81, 14.1, 14.4];
    xs.forEach((x, i) => {
      const k = seg(T, t0s[i], t0s[i] + 0.5);
      const abaixa = ease(seg(T, t0s[i], t0s[i] + 0.22));
      const alt = 340;
      const respira = Math.sin(T * 3 + i) * 2;
      const corpo = pessoa(g, x, CHAO3 - 4 + respira * 0.3, alt, i === 1 ? mix(OLIVA, "#000000", 0.0) : OLIVA, bk, 0, lerp(1.2, -1.1, abaixa), true, tinta);
      // fuzil: na mão vertical; ao largar, cai e fica deitado no chão
      const hand = corpo.hand;
      if (T < t0s[i] + 0.2) {
        const ang = lerp(Math.PI / 2 + 0.12, Math.PI / 2 - 0.5, abaixa);
        rifle(g, hand[0] + 8, hand[1] + 40, ang, 270, bk, tinta);
      } else {
        const q = seg(T, t0s[i] + 0.2, t0s[i] + 0.55);
        const ang = lerp(Math.PI / 2 - 0.5, 0.02, inQuad(q));
        const quica = q >= 1 ? Math.exp(-(T - t0s[i] - 0.55) * 14) * Math.abs(Math.sin((T - t0s[i] - 0.55) * 26)) * 10 : 0;
        const ox = hand[0] + 8 + 40 * outCubic(q), oy = lerp(hand[1] + 40, CHAO3 - 8, inQuad(q)) - quica;
        rifle(g, ox, oy, ang, 270, bk, tinta);
      }
    });
  });
  portalTela(g, T, info, true, 1);
  // o quadro fecha (14,6–15)
  const f = outCubic(seg(T, 14.62, 14.95));
  if (f > 0) {
    ctx.strokeStyle = th.bg;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    const m = 36, L = (w - 2 * m) * f, Hh = (h - 2 * m) * f;
    const pts = [[m, m], [m + L, m]];
    const lados = [
      [[m, m], [m + (w - 2 * m) * f, m]],
      [[w - m, m], [w - m, m + (h - 2 * m) * f]],
      [[w - m, h - m], [w - m - (w - 2 * m) * f, h - m]],
      [[m, h - m], [m, h - m - (h - 2 * m) * f]],
    ];
    lados.forEach((l, i) => linha(ctx, subdividir(l, 14), th.bg, 7, bk, 1.4, 60 + i));
  }
};

// ---------- cena de um instante ----------
const cena = (g, T) => {
  if (T < CORTE_IDA) papel1(g, T);
  else if (T < 8.45) noite1(g, T);
  else if (T < CORTE_VOLTA) transicao(g, T);
  else papel2(g, T);
};

// ---------- janelas de borrão (sem cruzar cortes) ----------
const JANELAS = [[3.95, CORTE_IDA], [8.45, 9.6], [12.4, CORTE_VOLTA], [CORTE_VOLTA, 13.75]];
export const style = {
  theme: { bg: "#0f0c2c", ink: "#edeae1", accent: "#3b7bf0", accent2: "#e98a4c", font: "Inter" },
  render(ctx, T, theme, w, h) {
    const jan = JANELAS.find(([a, b]) => T >= a && T < b);
    if (!jan) {
      cena({ ctx, w, h, th: theme }, T);
      return;
    }
    const N = 6, obt = 1 / 60;
    const trab = novaTela(w, h);
    const tx = trab.getContext("2d");
    for (let i = 0; i < N; i++) {
      const tt = clamp(T + ((i + 0.5) / N - 0.5) * obt, jan[0], jan[1] - 1e-4);
      tx.save();
      tx.globalAlpha = 1;
      cena({ ctx: tx, w, h, th: theme }, tt);
      tx.restore();
      ctx.save();
      ctx.globalAlpha = 1 / (i + 1);
      ctx.drawImage(trab, 0, 0);
      ctx.restore();
    }
  },
};
