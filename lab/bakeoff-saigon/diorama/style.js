// promptstyle: "Tiny Diorama" applied to the fall of Saigon (29-30 April 1975), 15 s, PT-BR narration.
// One tile: a rooftop evacuation, an avenue, the presidential palace and its gate, soldiers laying down rifles.
// Everything is a pure function of t; no Math.random, no timers.
window.STYLE = window.registerStyle((() => {
  // ---------------------------------------------------------------- content
  // Beat 1 (0-4.9) rooftop, 29 April. Beat 2 (4.9-8.8) tank and gate, 30 April.
  // Beat 3 (8.8-12.8) the name and "2 days in office". Beat 4 (12.8-15) rifles on the ground.
  const T = {
    land: 1.26,                    // the CH-46 touches the pad
    climb: [0.55, 0.95, 1.35],     // three evacuees start up the stair
    board: [2.05, 2.45, 2.85],     // and step into the cabin
    lift: 3.49,                    // "evacuam": the helicopter climbs away
    heliOut: 4.9,
    tankGo: 5.3,                   // "tanques"
    tankHit: 7.96,                 // "palácio": the gate goes down
    tankStop: 8.85,
    name: 9.4,                     // "Duong Van Minh"
    flipName: 12.06,               // "dois dias": the name card flips to the counter
    lay: [13.9, 14.14, 14.38],     // "deporem as armas"
    close: 14.9,
  };
  const labels = { aIn: 0.22, aOut: 4.98, bIn: 5.12, bOut: 9.06, cIn: 9.35, cOut: 13.6 };

  const TILE = { w: 13.4, d: 8.6, r: 1.0 }, FLOOR = -3.5;
  const BLD = { x: -4.35, z: -1.55, w: 3.3, d: 2.8, h: 2.1 };
  const PAL = { x: 3.3, z: -2.25, w: 4.8, d: 1.75 };
  const PAD = { x: -3.5, z: -1.0 };            // helipad on the roof
  const GATE = { z: 0.95, x0: 2.35, x1: 3.65 }; // opening in the fence
  const RIFLES = [[1.55, 0.30], [1.98, 0.36], [2.41, 0.30]];
  const SOLDIERS = [[1.62, 0.62], [2.02, 0.68], [2.42, 0.62]];

  const PALETTE = {
    backdrop: '#c6d3cd', evening: '#b7bec9',
    grass: '#9ebd6f', leaf: ['#6f9b5e', '#4f8259', '#8fae63'], trunk: '#8a6247',
    earth: ['#5b4136', '#8a6047', '#c39263', '#787b88'], stone: ['#adadb2', '#d8ccb6', '#8d8f9b'],
    cream: '#f3e7d1', sand: '#dcc6a0', slate: '#476b79', mustard: '#e3a844',
    accent: '#cf4936', glass: '#2d4653', dark: '#272a32',
    road: '#66665f', olive: '#6d7c50', oliveDark: '#57663f', track: '#3b3a38',
    skin: '#e6bb95', smoke: '#efe9dd', water: '#86bfc8', lampGlow: '#ffc46b',
    red: '#c2352f', yellow: '#e8c33f', stonePale: '#e9ddc6', paperCard: '#ece7dc',
  };
  const P = PALETTE;
  const FONT = '600 160px "Fredoka"';
  const D2R = Math.PI / 180, mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

  // ---------------------------------------------------------------- shapes and paint (diorama kit)
  function ring(w, d, r, n = 10) {
    const pts = [], hx = w / 2 - r, hz = d / 2 - r; let u = 0, px = 0, pz = 0;
    for (let k = 0; k < 4; k++) for (let i = 0; i <= n; i++) {
      const a = (k + i / n) * Math.PI / 2, x = (k === 0 || k === 3 ? hx : -hx) + r * Math.cos(a), z = (k < 2 ? hz : -hz) + r * Math.sin(a);
      if (pts.length) u += Math.hypot(x - px, z - pz);
      px = x; pz = z; pts.push({ x, z, nx: Math.cos(a), nz: Math.sin(a), u });
    }
    pts.push({ ...pts[0], u: u + Math.hypot(pts[0].x - px, pts[0].z - pz) });
    pts.around = pts[pts.length - 1].u;
    return pts;
  }
  function loft(loop, profile, cap = true) {
    const Q = profile.map(([inset, y, a], j) => { const p0 = profile[Math.max(0, j - 1)], p1 = profile[Math.min(profile.length - 1, j + 1)]; return [inset, y, a == null ? Math.atan2(p0[1] - p1[1], p0[0] - p1[0]) : a]; });
    const M = loop.length, pos = [], nor = [], uv = [], idx = [], y0 = Q[0][1], y1 = Q[Q.length - 1][1];
    for (const [inset, y, a] of Q) for (const p of loop) { pos.push(p.x - p.nx * inset, y, p.z - p.nz * inset); nor.push(p.nx * Math.sin(a), Math.cos(a), p.nz * Math.sin(a)); uv.push(p.u / loop.around, (y - y1) / (y0 - y1 || 1)); }
    for (let j = 0; j < Q.length - 1; j++) for (let i = 0; i < M - 1; i++) { const a = j * M + i, b = a + 1, c = a + M, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(), sideCount = idx.length;
    if (cap) {
      const base = pos.length / 3; pos.push(0, y0, 0); nor.push(0, 1, 0); uv.push(0, 0);
      for (const p of loop) { const x = p.x - p.nx * Q[0][0], z = p.z - p.nz * Q[0][0]; pos.push(x, y0, z); nor.push(0, 1, 0); uv.push(x, z); }
      for (let i = 0; i < M - 1; i++) idx.push(base, base + 2 + i, base + 1 + i);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.addGroup(0, sideCount, 0); if (cap) g.addGroup(sideCount, idx.length - sideCount, 1);
    return g;
  }
  const lip = (r, y, n = 5) => Array.from({ length: n + 1 }, (_, i) => { const a = i / n * Math.PI / 2; return [r * (1 - Math.sin(a)), y - r * (1 - Math.cos(a)), a]; });
  function prism(pts, r, depth, bevel = 0.04) {
    const s = new THREE.Shape(), n = pts.length;
    pts.forEach((p, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.min(Array.isArray(r) ? r[i] : r, da / 2, db / 2);
      const p0 = [p[0] + (a[0] - p[0]) * k / da, p[1] + (a[1] - p[1]) * k / da], p1 = [p[0] + (b[0] - p[0]) * k / db, p[1] + (b[1] - p[1]) * k / db];
      if (i === 0) s.moveTo(p0[0], p0[1]); else s.lineTo(p0[0], p0[1]);
      s.quadraticCurveTo(p[0], p[1], p1[0], p1[1]);
    });
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: depth - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -(depth - 2 * bevel) / 2);
    return g;
  }

  const paints = new Map();
  const paint = (hex, rough = 0.86) => { const key = hex + rough; if (!paints.has(key)) paints.set(key, new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 })); return paints.get(key); };
  const lampPaint = (hex = P.glass, glow = P.lampGlow) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45, emissive: glow, emissiveIntensity: 0 });
  function put(parent, geo, mat, p = [0, 0, 0], r, cast = true) {
    const m = new THREE.Mesh(geo, typeof mat === 'string' ? paint(mat) : mat); m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]);
    m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  }
  const box = (parent, w, h, d, color, p, r = 0.06, rot) => put(parent, K.roundedBox(w, h, d, r, 4), color, p, rot);
  const decal = (parent, w, h, r, mat, p, rot) => put(parent, K.roundedRect(w, h, r), mat, p, rot, false);

  // the tile: a cut slab of ground with a grass cap and a painted cross-section
  function tile(parent, { w, d, r }) {
    const g = new THREE.Group(); parent.add(g);
    const rr = K.rng(1975);
    const grass = K.canvasTex(1024, 1024, (ctx, W) => {
      ctx.fillStyle = P.grass; ctx.fillRect(0, 0, W, W);
      for (let i = 0; i < 80; i++) { const x = rr.range(0, W), y = rr.range(0, W), s = rr.range(60, 190), c = rr.chance(0.5) ? '255,246,190' : '60,110,60'; for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) { const gr = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, s); gr.addColorStop(0, `rgba(${c},0.11)`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.fillRect(x + ox - s, y + oy - s, 2 * s, 2 * s); } }
      for (let i = 0; i < 24000; i++) { ctx.fillStyle = rr.chance(0.5) ? 'rgba(255,255,205,0.10)' : 'rgba(40,80,45,0.10)'; ctx.fillRect(rr.range(0, W), rr.range(0, W), 2, 2); }
    }, { repeat: [1 / 5, 1 / 5] });
    const grassMat = new THREE.MeshPhysicalMaterial({ map: grass, roughness: 0.95, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color('#eaf5b4') });
    const cap = put(g, loft(ring(w + 0.18, d + 0.18, r + 0.09, 12), [...lip(0.11, 0), [0, -0.19, Math.PI / 2], [0.1, -0.27, Math.PI]]), [grassMat, grassMat]);
    cap.material[0] = new THREE.MeshPhysicalMaterial({ color: P.grass, roughness: 0.95, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color('#eaf5b4') });

    const H = 1.8, strata = K.canvasTex(2048, 512, (ctx, W, Hh) => {
      const wave = (base, amp, k, ph) => (x) => base + amp * Math.sin(x / W * Math.PI * 2 * k + ph) + amp * 0.5 * Math.sin(x / W * Math.PI * 2 * (k * 2 + 1) + ph * 2.3);
      const band = (top, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, Hh); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, top(x)); ctx.lineTo(W, Hh); ctx.fill(); };
      ctx.fillStyle = P.earth[0]; ctx.fillRect(0, 0, W, Hh);
      band(wave(44, 7, 5, 0.4), P.earth[1]); band(wave(170, 14, 3, 1.9), P.earth[2]); band(wave(292, 16, 2, 4.0), P.earth[3]);
      const blob = (x, y, a, b, rot, color) => { for (const ox of [-W, 0, W]) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x + ox, y, a, b, rot, 0, 7); ctx.fill(); } };
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,240,205,0.28)'; ctx.lineWidth = 5; ctx.beginPath(); const f = wave(194 + i * 15, 12, 3, 1.9 + i * 0.25); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, f(x)); ctx.stroke(); }
      for (let i = 0; i < 46; i++) blob(rr.range(0, W), rr.range(66, 160), rr.range(7, 20), rr.range(5, 12), rr.range(-0.5, 0.5), rr.pick(['#d7c4a6', '#a88a70', '#6f4c3b']));
      for (let i = 0; i < 30; i++) blob(rr.range(0, W), rr.range(322, 500), rr.range(24, 70), rr.range(10, 24), rr.range(-0.3, 0.3), rr.pick(['#8b8e9d', '#6e7181', '#73768a']));
      for (let i = 0; i < 40; i++) { const x = rr.range(0, W); ctx.strokeStyle = 'rgba(60,40,30,0.5)'; ctx.lineWidth = rr.range(2, 4); ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + rr.range(-18, 18), 30, x + rr.range(-26, 26), rr.range(40, 90)); ctx.stroke(); }
    }, { repeat: [2, 1] });
    put(g, loft(ring(w, d, r, 12), [[0, -0.19, Math.PI / 2], [0, -1.32, Math.PI / 2], [0.07, -1.52], [0.3, -1.76], [0.62, -1.9], [0.95, -H - 0.19]], false), new THREE.MeshStandardMaterial({ map: strata, roughness: 0.9 }));
    put(g, loft(ring(w - 1.9, d - 1.9, 0.3), [[0, -H - 0.17, 0]]), P.earth[3]);
    const loop = ring(w, d, r, 12), stones = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), paint('#ffffff', 0.9), 30); stones.castShadow = stones.receiveShadow = true; g.add(stones);
    for (let i = 0; i < stones.count; i++) {
      const at = rr.range(0, loop.around), j = loop.findIndex((q) => q.u >= at), a = loop[Math.max(0, j - 1)], b = loop[j], f = (at - a.u) / (b.u - a.u || 1), p = { x: K.lerp(a.x, b.x, f), z: K.lerp(a.z, b.z, f), nx: b.nx, nz: b.nz }, y = rr.range(-0.45, -1.25), s = rr.range(0.05, 0.11);
      K.place(stones, i, [p.x - p.nx * s * 0.25, y, p.z - p.nz * s * 0.25], [rr.range(0, 3), rr.range(0, 3), 0], [s * rr.range(1, 1.7), s * rr.range(0.6, 1), s]);
      stones.setColorAt(i, new THREE.Color(y > -1.0 ? rr.pick(P.stone) : P.stone[2]));
    }
    g.userData.grass = cap.material[0];
    return g;
  }
  // raised ribbon along a path (road, driveway, sidewalk)
  function ribbon(parent, pts, { width = 1.1, height = 0.05, texture, period = 1, y = 0 } = {}) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal'); curve.arcLengthDivisions = 600;
    const len = curve.getLength(), n = Math.ceil(len * 14), pos = [], uv = [], idx = [], cross = [[-width / 2, 0, 0], [-width / 2 + 0.05, height, 0.06], [width / 2 - 0.05, height, 0.94], [width / 2, 0, 1]];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n), tg = curve.getTangentAt(i / n);
      for (const [o, yy, v] of cross) { pos.push(p.x - tg.z * o, y + yy, p.z + tg.x * o); uv.push(i / n * len / period, v); }
      if (i < n) for (let k = 0; k < 3; k++) { const a = i * 4 + k; idx.push(a, a + 1, a + 4, a + 1, a + 5, a + 4); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    put(parent, g, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }), [0, 0, 0], null, false);
    return Object.assign(curve, { len });
  }
  // a window: frame + pane that can light up
  function windowPane(parent, w, h, p, rotY = 0, frame = P.cream) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.rotation.y = rotY; parent.add(g);
    box(g, w + 0.1, h + 0.1, 0.06, frame, [0, 0, 0], 0.025);
    const m = lampPaint(P.glass, '#ffd79a'); decal(g, w, h, 0.035, m, [0, 0, 0.035]); box(g, 0.028, h, 0.018, frame, [0, 0, 0.04], 0.006);
    return m;
  }
  function peg(parent, color, hat) {
    const g = new THREE.Group(); parent.add(g);
    const body = new THREE.LatheGeometry([[0, 0], [0.14, 0], [0.175, 0.04], [0.16, 0.28], [0.11, 0.4], [0, 0.43]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
    put(g, body, color); put(g, new THREE.SphereGeometry(0.14, 20, 14), P.skin, [0, 0.55, 0]);
    if (hat === 'cap') { put(g, new THREE.SphereGeometry(0.148, 20, 10, 0, 7, 0, 1.25), color, [0, 0.57, 0]); box(g, 0.19, 0.028, 0.13, color, [0, 0.61, 0.14], 0.012); }
    if (hat === 'helmet') put(g, new THREE.SphereGeometry(0.16, 20, 10, 0, 7, 0, 1.5), P.oliveDark, [0, 0.57, 0]);
    if (hat === 'hair') put(g, new THREE.SphereGeometry(0.152, 20, 10, 0, 7, 0, 1.75), P.trunk, [0, 0.56, -0.012], [-0.35, 0, 0]);
    return g;
  }
  // palm: a bent trunk and six drooping blades
  function palm(parent, x, z, s, y = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    const trunk = put(g, new THREE.CylinderGeometry(0.045, 0.075, 1.25, 10), P.trunk, [0.03, 0.62, 0], [0, 0, -0.07]);
    const top = [0.09, 1.24, 0];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.3, leaf = box(g, 0.62, 0.035, 0.16, P.leaf[i % 2 ? 0 : 2], [top[0] + Math.cos(a) * 0.26, top[1] - 0.02, top[2] + Math.sin(a) * 0.26], 0.016, [0, -a, -0.32]);
      leaf.scale.set(1, 1, 1);
    }
    put(g, new THREE.SphereGeometry(0.09, 10, 8), P.leaf[1], [top[0], top[1] + 0.02, top[2]]);
    return g;
  }
  function puffs(parent, count) {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), paint(P.smoke, 0.95), count); m.castShadow = true; m.frustumCulled = false; parent.add(m);
    return {
      mesh: m, set(i, at, age, o) {
        const s = age <= 0 || age >= 1 ? 0 : o.size * K.smooth(0, 0.3, age) * (1 - K.smooth(0.55, 1, age)) * (0.7 + 0.5 * age);
        K.place(m, i, [at[0] + (o.drift || 0) * age * age, at[1] + o.rise * age, at[2] + (o.driftZ || 0) * age], null, Math.max(s, 1e-4));
      },
    };
  }
  const trap = (u, a, b) => { u = K.clamp(u); const v = 1 / (1 - a / 2 - b / 2); return u < a ? v * u * u / (2 * a) : u < 1 - b ? v * (u - a / 2) : 1 - v * (1 - u) * (1 - u) / (2 * b); };
  const hop = (t, t0, len, from, to, height) => { const u = K.clamp((t - t0) / len), e = K.ease.inOut(u), land = t - t0 - len; return [from[0] + (to[0] - from[0]) * e, height * Math.sin(Math.PI * u), from[1] + (to[1] - from[1]) * e, land > 0 ? Math.exp(-land * 14) * Math.sin(land * 30) * 0.12 : 0]; };

  // card signs: a pin, a card and a face that turns over. Text may use \n for two lines.
  function sign(parent, front, back, o = {}) {
    const g = new THREE.Group(), flip = new THREE.Group(); parent.add(g); g.add(flip);
    const PX = 380, SPACING = 0.03, letter = o.letter || 0.30;
    const linesOf = (s) => String(s.text || '').split('\n');
    const meas = (txt) => { const c = document.createElement('canvas').getContext('2d'); c.font = FONT; c.letterSpacing = SPACING * 160 + 'px'; return Math.max(...linesOf({ text: txt }).map((l) => c.measureText(l).width)) / 160 * letter; };
    const bw = Math.max(meas(front.text || ''), meas(back.text || '')) + (o.digit ? 0.66 : 0) + 0.56;
    const lineH = letter * 1.32, rows = Math.max(linesOf(front).length, linesOf(back).length), bh = lineH * rows + letter * 0.55;
    const face = (spec, side) => {
      const s = new THREE.Group(); s.rotation.x = side > 0 ? 0 : Math.PI; flip.add(s);
      const lines = linesOf(spec);
      const tex = K.canvasTex(Math.round(bw * PX), Math.round(bh * PX), (ctx, W, Hh) => {
        ctx.fillStyle = spec.bg; ctx.fillRect(0, 0, W, Hh);
        ctx.fillStyle = spec.fg; ctx.font = FONT.replace('160px', (letter * PX) + 'px'); ctx.letterSpacing = SPACING * PX + 'px';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const cx = W / 2 + (o.digit && side < 0 ? 0.3 * PX : 0), cy = Hh / 2 - (lines.length - 1) * lineH * PX / 2;
        lines.forEach((l, i) => ctx.fillText(l, cx, cy + i * lineH * PX + letter * PX * 0.03));
      });
      decal(s, bw - 0.09, bh - 0.09, 0.04, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82 }), [0, 0, 0.048]);
      return { s, tex };
    };
    box(flip, bw, bh, 0.09, P.paperCard, [0, 0, 0], 0.05);
    put(flip, new THREE.CylinderGeometry(0.1, 0.1, 0.16, 28), P.paperCard, [-bw / 2 + 0.16, 0, 0], [Math.PI / 2, 0, 0]);
    face(front, 1); face(back, -1);
    const pole = put(g, new THREE.CylinderGeometry(0.045, 0.055, 1, 12), P.cream, [0, 0, -0.1]);
    put(g, new THREE.CylinderGeometry(0.12, 0.14, 0.07, 16), P.slate, [0, 0.035, -0.1]);
    return { g, flip, bw, bh, pole, setHeight(h) { flip.position.y = h; pole.scale.y = h; pole.position.y = h / 2; } };
  }

  // ---------------------------------------------------------------- 1975 props
  // CH-46 Sea Knight in olive drab: tandem rotors, rear ramp, open side door, MARINES on the side
  function helicopter(parent, color) {
    const g = new THREE.Group(), body = new THREE.Group(); parent.add(g); g.add(body);
    put(body, prism([[-0.66, 0.16], [0.52, 0.16], [0.66, 0.3], [0.56, 0.52], [-0.26, 0.6], [-0.62, 0.5], [-0.7, 0.3]], [0.08, 0.08, 0.1, 0.12, 0.1, 0.08, 0.1], 0.46, 0.05), color);
    box(body, 0.26, 0.2, 0.4, color, [-0.72, 0.33, 0], 0.05);                       // rear ramp bay
    const glass = paint(P.glass, 0.5);
    decal(body, 0.3, 0.22, 0.05, glass, [0.56, 0.42, 0.238], [0, 0, 0.05]);         // cockpit glass, both sides
    decal(body, 0.3, 0.22, 0.05, glass, [0.56, 0.42, -0.238], [0, Math.PI, -0.05]);
    decal(body, 0.36, 0.3, 0.04, P.dark, [-0.16, 0.34, 0.235]);                      // open side door
    // MARINES and a small star, painted on the side
    const mars = K.canvasTex(512, 128, (ctx, W, Hh) => { ctx.clearRect(0, 0, W, Hh); ctx.fillStyle = '#e9e4d4'; ctx.font = '700 74px "Fredoka"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MARINES', W / 2, Hh / 2); });
    for (const s of [1, -1]) put(body, new THREE.PlaneGeometry(0.42, 0.105), new THREE.MeshBasicMaterial({ map: mars, transparent: true }), [0.12, 0.2, s * 0.237], [0, s > 0 ? 0 : Math.PI, 0], false);
    // landing gear
    for (const [x, z] of [[0.4, 0.15], [0.4, -0.15], [-0.4, 0.16], [-0.4, -0.16]]) {
      put(body, new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), P.dark, [x, 0.1, z * 0.6]);
      put(body, new THREE.CylinderGeometry(0.06, 0.06, 0.05, 14), P.dark, [x, 0.05, z], [Math.PI / 2, 0, 0]);
    }
    // two rotor masts with three blades each, and a faint disc so the blur reads
    const rotors = [];
    for (const [x, dir] of [[0.42, 1], [-0.42, -1]]) {
      put(body, new THREE.CylinderGeometry(0.03, 0.04, 0.16, 8), P.oliveDark, [x, 0.66, 0]);
      const r = new THREE.Group(); r.position.set(x, 0.73, 0); body.add(r); rotors.push({ g: r, dir });
      for (let i = 0; i < 3; i++) { const b = box(r, 0.66, 0.016, 0.06, P.oliveDark, [0, 0, 0], 0.008); b.rotation.y = i / 3 * Math.PI * 2; b.position.set(Math.cos(-i / 3 * Math.PI * 2) * 0.33, 0, Math.sin(-i / 3 * Math.PI * 2) * 0.33); b.rotation.y = -i / 3 * Math.PI * 2; }
      const disc = put(r, new THREE.CircleGeometry(0.66, 32), new THREE.MeshBasicMaterial({ color: P.oliveDark, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }), [0, 0.01, 0], [-Math.PI / 2, 0, 0], false);
      disc.renderOrder = 2;
    }
    return { g, body, rotors };
  }
  // T-54: low hull, dome turret, long gun, red star, dark tracks
  function t54(parent) {
    const g = new THREE.Group(), body = new THREE.Group(); parent.add(g); g.add(body);
    put(body, prism([[-0.58, 0.1], [0.5, 0.1], [0.62, 0.22], [0.5, 0.34], [-0.52, 0.34], [-0.62, 0.24]], [0.05, 0.06, 0.05, 0.06, 0.05, 0.05], 0.46, 0.04), P.olive);
    for (const s of [1, -1]) {
      box(body, 1.14, 0.17, 0.16, P.track, [0.0, 0.1, s * 0.3], 0.03);
      for (const x of [-0.4, -0.14, 0.12, 0.38]) put(body, new THREE.CylinderGeometry(0.075, 0.075, 0.17, 14), P.oliveDark, [x, 0.1, s * 0.3], [Math.PI / 2, 0, 0]);
      decal(body, 0.1, 0.1, 0.01, P.track, [0.0, 0.31, s * 0.232]);
    }
    put(body, new THREE.SphereGeometry(1, 22, 14), P.olive, [-0.04, 0.4, 0]).scale.set(0.3, 0.18, 0.27);
    put(body, new THREE.CylinderGeometry(0.038, 0.05, 0.62, 12), P.oliveDark, [0.36, 0.42, 0], [0, 0, Math.PI / 2]);
    put(body, new THREE.CylinderGeometry(0.055, 0.055, 0.1, 12), P.oliveDark, [0.68, 0.42, 0], [0, 0, Math.PI / 2]);
    put(body, new THREE.CylinderGeometry(0.085, 0.085, 0.05, 16), P.oliveDark, [-0.12, 0.53, 0.06]);
    box(body, 0.02, 0.34, 0.02, P.oliveDark, [-0.2, 0.6, -0.12], 0.006);
    const star = K.canvasTex(128, 128, (ctx, W) => { ctx.clearRect(0, 0, W, W); ctx.fillStyle = '#c2352f'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 * W : 0.5 * W; ctx.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } ctx.fill(); });
    for (const s of [1, -1]) put(body, new THREE.PlaneGeometry(0.15, 0.15), new THREE.MeshBasicMaterial({ map: star, transparent: true }), [-0.03, 0.42, s * 0.268], [0, s > 0 ? 0 : Math.PI, 0], false);
    return { g, body };
  }
  // flat silhouette standee: a man in a suit, no face
  function standee(parent) {
    const s = new THREE.Shape();
    s.moveTo(-0.14, 0); s.lineTo(-0.14, 0.34); s.quadraticCurveTo(-0.14, 0.44, -0.22, 0.48);
    s.quadraticCurveTo(-0.3, 0.52, -0.26, 0.6); s.quadraticCurveTo(-0.13, 0.63, -0.11, 0.66);
    s.absarc(0, 0.73, 0.125, 0, Math.PI, false);
    s.lineTo(0.11, 0.66); s.quadraticCurveTo(0.13, 0.63, 0.26, 0.6); s.quadraticCurveTo(0.3, 0.52, 0.22, 0.48);
    s.quadraticCurveTo(0.14, 0.44, 0.14, 0.34); s.lineTo(0.14, 0); s.closePath();
    const g = new THREE.Group(); parent.add(g);
    const m = put(g, new THREE.ShapeGeometry(s, 12), new THREE.MeshStandardMaterial({ color: P.dark, roughness: 0.75, side: THREE.DoubleSide }), [0, 0.02, 0], null, false);
    put(g, new THREE.CylinderGeometry(0.2, 0.22, 0.03, 20), P.slate, [0, 0.015, 0]);
    return g;
  }
  // rifle: stock, body, magazine, barrel
  function rifle(parent) {
    const g = new THREE.Group(); parent.add(g);
    box(g, 0.26, 0.05, 0.055, P.dark, [-0.04, 0, 0], 0.012);
    box(g, 0.1, 0.075, 0.05, P.dark, [0.02, 0.06, 0], 0.012);
    put(g, new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8), P.dark, [0.19, 0.005, 0], [0, 0, Math.PI / 2]);
    box(g, 0.05, 0.05, 0.03, P.dark, [-0.14, -0.03, 0], 0.008);
    return g;
  }

  return {
    id: 'promptstyle-saigon',
    name: 'Tiny Diorama: the fall of Saigon',
    family: 'Spaces and journeys',
    duration: 15,
    fonts: [FONT],
    render: { samples: 26, shutter: 0.5, tone: 'neutral', exposure: 1.0, bloom: 0.24, bloomThreshold: 1.15, vignette: 0.22, grain: 0.012, saturation: 1.12, contrast: 1.06, fov: 20, near: 1, far: 300, background: P.backdrop },

    build(S) {
      const { THREE, K, scene, camera } = S;
      const portrait = S.H > S.W;

      // ---- light and paper backdrop
      K.env(S, { top: '#cfe0ef', horizon: '#f4e9d6', bottom: '#a7b59a', intensity: 0.4 });
      const sun = K.sun(S, { pos: [-9, 13, 9], color: '#ffe3c0', power: 3.3, size: 13, soft: 1.3, mapSize: 2048, far: 70 });
      const sky = K.skyLight(S, { color: '#bcd3ff', power: 0.95, size: 12, center: [0, 0, 0], mapSize: 1024 });
      put(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ color: P.backdrop }), [0, FLOOR, 0], [-Math.PI / 2, 0, 0], false);
      const shade = put(scene, new THREE.PlaneGeometry(TILE.w + 8, TILE.d + 8), new THREE.MeshBasicMaterial({
        transparent: true, depthWrite: false, map: K.canvasTex(512, 512, (ctx, W) => {
          const sx = W / (TILE.w + 8), sz = W / (TILE.d + 8); ctx.filter = 'blur(26px)'; ctx.fillStyle = 'rgba(38,58,72,0.5)';
          ctx.beginPath(); ctx.roundRect(4 * sx, 4 * sz, TILE.w * sx, TILE.d * sz, 50); ctx.fill();
        }),
      }), [1.6, FLOOR + 0.02, -1.0], [-Math.PI / 2, 0, 0], false);

      // ---- tile, road, paving
      const world = new THREE.Group(); scene.add(world);
      const land = tile(world, TILE);
      const roadTex = K.canvasTex(256, 128, (ctx, W, H) => {
        ctx.fillStyle = P.road; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#efe6d2'; ctx.fillRect(30, H / 2 - 4, 90, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(0, 12, W, 4); ctx.fillRect(0, H - 16, W, 4);
      }, { repeat: [1, 1] });
      roadTex.wrapS = THREE.RepeatWrapping;
      const ROAD = [[-6.6, 2.28], [-4.2, 2.3], [-1.6, 2.28], [1.2, 2.26], [3.2, 2.2], [5.0, 2.12], [6.6, 2.02]];
      const road = ribbon(land, ROAD, { width: 1.5, texture: roadTex, period: 0.9 });
      // courtyard: pale stone slab from the fence up to the palace steps
      box(land, 4.6, 0.09, 2.5, P.stone[1], [3.35, 0.045, -0.32], 0.1);
      const driveTex = K.canvasTex(256, 128, (ctx, W, H) => { ctx.fillStyle = '#c9bda5'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(120,100,80,0.25)'; for (let i = 0; i < 8; i++) ctx.fillRect((i * 37) % W, (i * 61) % H, 22, 3); }, { repeat: [1, 1] });
      driveTex.wrapS = THREE.RepeatWrapping;
      ribbon(land, [[3.05, 2.24], [3.06, 1.6], [3.08, 1.0], [3.1, 0.2], [3.1, -0.6]], { width: 1.2, texture: driveTex, period: 1.2, height: 0.055 });
      box(land, 0.9, 0.06, 2.3, P.stone[1], [-2.55, 0.03, 0.95], 0.08);   // front walk of the apartment block

      // ---- beat 1: the apartment block with the rooftop pad and the outside stair
      const bld = new THREE.Group(); bld.position.set(BLD.x, 0, BLD.z); land.add(bld);
      // roof slab top at 2.16: walls 2.06 + slab
      box(bld, BLD.w, 2.06, BLD.d, P.cream, [0, 1.03, 0], 0.1);
      box(bld, BLD.w + 0.14, 0.1, BLD.d + 0.14, P.stone[1], [0, 2.11, 0], 0.04);
      const ROOF = 2.16;
      // parapet
      for (const [w, d, x, z] of [[BLD.w + 0.1, 0.09, 0, BLD.d / 2 + 0.02], [BLD.w + 0.1, 0.09, 0, -BLD.d / 2 - 0.02], [0.09, BLD.d, BLD.w / 2 + 0.02, 0], [0.09, BLD.d, -BLD.w / 2 - 0.02, 0]]) box(bld, w, 0.16, d, P.stone[1], [x, ROOF + 0.06, z], 0.025);
      // floor bands and windows on the street face (+z) and side (+x)
      const bWin = [];
      for (let f = 0; f < 4; f++) {
        for (let i = -1; i <= 1; i++) bWin.push(windowPane(bld, 0.44, 0.34, [i * 0.92, 0.42 + f * 0.5, BLD.d / 2 + 0.005], 0, P.stone[1]));
        for (let i = -1; i <= 1; i++) bWin.push(windowPane(bld, 0.38, 0.32, [BLD.w / 2 + 0.005, 0.42 + f * 0.5, i * 0.72], Math.PI / 2, P.stone[1]));
        box(bld, BLD.w + 0.04, 0.05, 0.03, P.stone[1], [0, 0.62 + f * 0.5, BLD.d / 2 + 0.02], 0.01);
      }
      box(bld, 0.9, 0.04, 0.04, P.mustard, [0, 0.82, BLD.d / 2 + 0.03], 0.01);   // awning stripe over the door
      box(bld, 0.46, 0.72, 0.06, P.slate, [0, 0.36, BLD.d / 2 + 0.03], 0.02);
      // roof furniture: stair house, water tank, AC units
      box(bld, 0.88, 0.62, 0.72, P.stone[1], [-1.0, ROOF + 0.31, -0.85], 0.045);
      box(bld, 0.34, 0.44, 0.05, P.slate, [-1.0, ROOF + 0.22, -0.47], 0.02);
      put(bld, new THREE.CylinderGeometry(0.2, 0.2, 0.46, 16), P.slate, [0.95, ROOF + 0.4, -1.0]);
      put(bld, new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16), P.cream, [0.95, ROOF + 0.64, -1.0]);
      for (const [x, z] of [[1.2, -0.65], [0.72, -1.05]]) box(bld, 0.3, 0.22, 0.28, P.stone[1], [x, ROOF + 0.11, z], 0.03);
      // helipad: painted ring and two bars
      const padTex = K.canvasTex(512, 512, (ctx, W) => {
        ctx.clearRect(0, 0, W, W);
        ctx.strokeStyle = '#efe9d6'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(W / 2, W / 2, W * 0.39, 0, 7); ctx.stroke();
        ctx.fillStyle = '#efe9d6'; ctx.fillRect(W / 2 - 60, W / 2 - 16, 120, 32);
      });
      put(bld, new THREE.CircleGeometry(0.74, 40), new THREE.MeshStandardMaterial({ map: padTex, transparent: true, roughness: 0.9 }), [PAD.x - BLD.x, ROOF + 0.008, PAD.z - BLD.z], [-Math.PI / 2, 0, 0], false);
      // outside stair: 12 solid steps from the ground to the roof, along the front
      const stair = new THREE.Group(); stair.position.set(0, 0, BLD.d / 2 + 0.3); bld.add(stair);
      const ST_X0 = -1.62, ST_RUN = 0.255, ST_RISE = ROOF / 12;
      for (let i = 0; i < 12; i++) box(stair, ST_RUN + 0.02, ST_RISE * (i + 1), 0.5, P.stone[1], [ST_X0 + (i + 0.5) * ST_RUN, ST_RISE * (i + 1) / 2, 0], 0.02);
      box(stair, 0.06, 0.06, 0.52, P.slate, [ST_X0, 0.03, 0], 0.02);
      // handrail
      const railPts = [];
      for (let i = 0; i <= 6; i++) { const u = i / 6; railPts.push([ST_X0 + u * 12 * ST_RUN, ROOF * u + 0.42, 0.26]); }
      put(stair, K.tube(railPts, 0.028, { radial: 8 }), P.slate);
      for (let i = 0; i <= 6; i++) { const u = i / 6; put(stair, new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8), P.slate, [ST_X0 + u * 12 * ST_RUN, ROOF * u + 0.21, 0.26]); }
      const stairY = (x) => K.clamp((x - ST_X0) / (12 * ST_RUN)) * ROOF;   // local x -> height
      const stairTopX = BLD.x + ST_X0 + 12 * ST_RUN, stairTopZ = BLD.z + BLD.d / 2 + 0.3;

      // ---- the helicopter and its crew
      const heli = helicopter(land, P.olive); heli.g.scale.setScalar(1.18);
      const heliAt = (t) => {
        const land0 = K.seg(t, 0.35, T.land, K.ease.out);
        const up = K.seg(t, T.lift, T.heliOut, K.ease.in);
        const away = K.seg(t, 4.6, 6.2, K.ease.in);
        let x = PAD.x + 0.9 * up - 5.5 * away, z = PAD.z + 2.2 * up + 4.0 * away, y = ROOF + 0.03 + (1 - land0) * 1.6 + 4.2 * up + 5.0 * away;
        const wobble = (1 - land0) * Math.sin(t * 7) * 0.02;
        return { x, y: y + wobble, z, tilt: 0.05 * Math.sin(t * 3) + 0.35 * up, yaw: -0.35 - 1.0 * up };
      };
      const marine = peg(land, P.oliveDark, 'helmet');
      const evac = [peg(land, P.slate, 'hair'), peg(land, P.mustard, 'cap'), peg(land, P.cream, 'hair')];
      const EV_QUEUE = [[-5.85, 0.62], [-5.5, 0.8], [-5.15, 0.6]];
      const EV_START = [-5.9, stairTopZ + 0.02];

      // ---- beat 2: the palace, the fence, the gate
      const pal = new THREE.Group(); pal.position.set(PAL.x, 0, PAL.z); land.add(pal);
      const PAL_TOP = 2.16;
      box(pal, PAL.w + 0.4, 0.18, PAL.d + 0.4, P.stone[1], [0, 0.09, 0], 0.06);
      box(pal, PAL.w, 0.56, PAL.d - 0.16, P.cream, [0, 0.44, 0], 0.06);
      // ground floor colonnade
      for (let i = -8; i <= 8; i++) put(pal, new THREE.CylinderGeometry(0.045, 0.05, 0.56, 10), P.cream, [i * 0.27, 0.44, PAL.d / 2 - 0.24]);
      // three cream slabs with a dark glass band between them, and vertical fins
      for (let f = 0; f < 3; f++) {
        box(pal, PAL.w, 0.3, PAL.d, P.cream, [0, 0.86 + f * 0.44, 0], 0.05);
        box(pal, PAL.w - 0.1, 0.16, PAL.d - 0.1, P.glass, [0, 1.08 + f * 0.44, 0], 0.02);
        const band = 0.16, y0 = 1.0 + f * 0.44;
        const fins = new THREE.InstancedMesh(K.roundedBox(0.045, 0.17, 0.05, 0.02, 2), paint(P.cream), 44);
        let n = 0;
        for (let i = 0; i < 46; i++) {
          const x = -PAL.w / 2 + 0.12 + i * (PAL.w - 0.24) / 45;
          if (Math.abs(x) < 0.56) continue;
          K.place(fins, n++, [x, 1.06 + f * 0.44, PAL.d / 2 + 0.012], null, [1, 1, 1]);
        }
        fins.count = n; fins.castShadow = true; fins.receiveShadow = true; pal.add(fins);
      }
      // central entrance: a projecting bay, a canopy and three steps
      box(pal, 1.06, 1.62, 0.22, P.cream, [0, 1.24, PAL.d / 2 + 0.05], 0.05);
      box(pal, 0.9, 0.32, 0.08, P.glass, [0, 1.26, PAL.d / 2 + 0.17], 0.02);
      for (let i = -3; i <= 3; i++) box(pal, 0.05, 1.0, 0.05, P.cream, [i * 0.065, 1.28, PAL.d / 2 + 0.16], 0.02);
      box(pal, 1.25, 0.07, 0.36, P.cream, [0, 0.73, PAL.d / 2 + 0.28], 0.03);
      for (let i = 0; i < 3; i++) box(pal, 1.5 + i * 0.16, 0.07, 0.2, P.stone[1], [0, 0.11 + i * 0.06, PAL.d / 2 + 0.2 + (2 - i) * 0.18], 0.02);
      // roof, rooftop pad and mast
      box(pal, PAL.w + 0.1, 0.1, PAL.d + 0.1, P.cream, [0, PAL_TOP, 0], 0.04);
      const palPad = K.canvasTex(256, 256, (ctx, W) => { ctx.clearRect(0, 0, W, W); ctx.strokeStyle = '#f3ecd8'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(W / 2, W / 2, W * 0.4, 0, 7); ctx.stroke(); ctx.fillStyle = '#f3ecd8'; ctx.font = '700 90px "Fredoka"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', W / 2, W / 2 + 4); });
      put(pal, new THREE.CircleGeometry(0.42, 32), new THREE.MeshStandardMaterial({ map: palPad, transparent: true, roughness: 0.9 }), [1.55, PAL_TOP + 0.055, 0], [-Math.PI / 2, 0, 0], false);
      put(pal, new THREE.CylinderGeometry(0.014, 0.02, 0.5, 6), P.slate, [-2.0, PAL_TOP + 0.3, -0.4]);
      // flag of South Vietnam on a pole in the courtyard
      const rvn = K.canvasTex(128, 96, (ctx, W, H) => { ctx.fillStyle = '#e8c33f'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#c2352f'; for (let i = 0; i < 3; i++) ctx.fillRect(0, 18 + i * 22, W, 8); });
      put(land, new THREE.CylinderGeometry(0.016, 0.022, 1.5, 8), P.cream, [1.1, 0.75, 0.55]);
      const flag = put(land, new THREE.PlaneGeometry(0.52, 0.34), new THREE.MeshStandardMaterial({ map: rvn, roughness: 0.85, side: THREE.DoubleSide }), [1.36, 1.32, 0.55], [0, 0, 0], false);
      // fence with a gate in the middle
      const fence = new THREE.Group(); fence.position.set(0, 0, GATE.z); land.add(fence);
      box(fence, 4.6, 0.16, 0.09, P.stone[1], [3.32, 0.08, 0], 0.03);
      for (let x = 1.02; x <= 5.62; x += 0.1) {
        if (x > GATE.x0 - 0.05 && x < GATE.x1 + 0.05) continue;
        box(fence, 0.035, 0.46, 0.035, P.cream, [x, 0.39, 0], 0.01);
      }
      box(fence, 4.6, 0.045, 0.05, P.cream, [3.32, 0.62, 0], 0.012);
      for (const x of [GATE.x0, GATE.x1]) { box(fence, 0.11, 0.8, 0.11, P.stone[1], [x, 0.4, 0], 0.03); put(fence, new THREE.SphereGeometry(0.06, 12, 10), P.stone[1], [x, 0.83, 0]); }
      const gateLeaves = [];
      for (const [hx, dir] of [[GATE.x0, 1], [GATE.x1, -1]]) {
        const piv = new THREE.Group(); piv.position.set(hx, 0, 0); fence.add(piv);
        const leaf = new THREE.Group(); piv.add(leaf);
        const w = (GATE.x1 - GATE.x0) / 2;
        leaf.position.x = dir * w;   // hinge at the post
        box(leaf, w - 0.04, 0.04, 0.05, P.cream, [0, 0.63, 0], 0.012);
        box(leaf, w - 0.04, 0.04, 0.05, P.cream, [0, 0.18, 0], 0.012);
        for (let i = 1; i < 9; i++) box(leaf, 0.03, 0.47, 0.03, P.cream, [-w / 2 + i * w / 9, 0.4, 0], 0.008);
        gateLeaves.push({ piv, leaf, dir, w });
      }

      // ---- city around: back blocks, palms, a second tank on the avenue
      const bg = new THREE.Group(); land.add(bg);
      for (const [x, z, w, d, h, col] of [[-1.58, -3.62, 1.5, 1.0, 1.35, P.cream], [0.22, -3.55, 1.2, 1.1, 1.72, P.stone[1]], [1.7, -3.6, 1.35, 1.0, 1.15, P.sand], [5.62, -3.5, 1.5, 1.15, 1.5, P.cream], [-6.1, 2.95, 1.0, 0.9, 1.1, P.sand]]) {
        box(bg, w, h, d, col, [x, h / 2, z], 0.06);
        box(bg, w + 0.08, 0.06, d + 0.08, P.stone[1], [x, h + 0.03, z], 0.02);
      }
      const bgWin = [];
      for (const [x, z, w, h, d] of [[-1.58, -3.62, 1.5, 1.35, 1.0], [0.22, -3.55, 1.2, 1.72, 1.1], [1.7, -3.6, 1.35, 1.15, 1.0]]) {
        for (let i = 0; i < 6; i++) bgWin.push(windowPane(bg, 0.16, 0.15, [x - 0.36 + (i % 3) * 0.36, 0.4 + Math.floor(i / 3) * 0.42, z + d / 2 + 0.005], 0, P.stone[1]));
      }
      const treeSpots = [[-1.05, 1.05], [0.75, 1.1], [5.3, 1.6], [4.85, 3.35], [0.35, 3.45], [-3.3, 3.4], [6.1, 3.3]];
      treeSpots.forEach(([x, z], i) => palm(land, x, z, 0.9 + 0.18 * (i % 3), 0));
      for (const [x, z, s] of [[-2.0, 3.55, 0.24], [2.9, 3.45, 0.2], [-5.6, 3.3, 0.22], [6.2, 1.1, 0.2], [-1.0, -1.9, 0.18]]) put(land, new THREE.SphereGeometry(1, 16, 12), P.leaf[2], [x, s * 0.6, z]).scale.set(s * 1.3, s, s * 1.1);
      const tank2 = t54(land); tank2.g.scale.setScalar(0.94);
      const tank2At = (t) => { const u = trap((t - T.tankGo - 0.35) / 2.6, 0.3, 0.4); return { x: -4.4 + 4.2 * u, z: 2.26, yaw: -Math.PI, y: 0 }; };

      // ---- the main tank and its route
      const tankPts = [[-5.35, 2.3], [-3.0, 2.28], [-0.6, 2.26], [1.5, 2.22], [2.55, 2.05], [2.98, 1.62], [3.05, 1.05], [3.08, 0.4], [3.1, -0.5]];
      const tankPath = new THREE.CatmullRomCurve3(tankPts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal'); tankPath.arcLengthDivisions = 600;
      const tankLen = tankPath.getLength();
      let gateDist = 0; { let best = 1e9; for (let i = 0; i <= 600; i++) { const p = tankPath.getPointAt(i / 600), dd = Math.hypot(p.x - 3.05, p.z - GATE.z); if (dd < best) { best = dd; gateDist = i / 600 * tankLen; } } }
      const tankDist = (t) => t < T.tankHit ? gateDist * trap((t - T.tankGo) / (T.tankHit - T.tankGo), 0.36, 0.05) : gateDist + (tankLen - gateDist) * trap((t - T.tankHit) / (T.tankStop - T.tankHit), 0.02, 0.55);
      const tankAt = (t) => {
        const u = K.clamp(tankDist(t) / tankLen), p = tankPath.getPointAt(u), tg = tankPath.getTangentAt(u);
        return { p, tg, yaw: Math.atan2(-tg.z, tg.x) };
      };
      const tank = t54(land); tank.g.scale.setScalar(1.1);
      const gateAt = { x: 3.05, z: GATE.z };

      // ---- beat 3: the silhouette standee and its card
      const sil = standee(land); sil.position.set(4.52, 0, -1.02); sil.scale.setScalar(1.22);
      // ---- beat 4: three soldiers and their rifles
      const soldiers = [0, 1, 2].map((i) => peg(land, i === 1 ? P.olive : P.oliveDark, 'helmet'));
      const rifles = [0, 1, 2].map(() => rifle(land));

      // ---- signs
      const sA = sign(land, { text: '29 DE ABRIL\nSAIGON', bg: '#ece8df', fg: '#6f7b86' }, { text: '29 DE ABRIL\nSAIGON', bg: P.accent, fg: '#fff4e3' }, { letter: 0.27 });
      sA.g.position.set(-5.62, 0, 1.35); sA.setHeight(2.95);
      const sB = sign(land, { text: '30 DE ABRIL', bg: '#ece8df', fg: '#6f7b86' }, { text: '30 DE ABRIL', bg: P.accent, fg: '#fff4e3' }, { letter: 0.3 });
      sB.g.position.set(0.42, 0, 1.28); sB.setHeight(1.42);
      const sC = sign(land, { text: 'DUONG VAN MINH', bg: '#ece8df', fg: '#5f6b76' }, { text: 'DIAS NO\nCARGO', bg: P.accent, fg: '#fff4e3' }, { letter: 0.25, digit: true });
      sC.g.position.set(4.92, 0, 0.02); sC.setHeight(2.1);
      const digitTex = [0, 1, 2].map((n) => K.canvasTex(256, 320, (ctx, W, H) => { ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#fff4e3'; ctx.font = '600 260px "Fredoka"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), W / 2, H / 2 + 12); }));
      const digit = put(sC.flip, new THREE.PlaneGeometry(0.3, 0.38), new THREE.MeshBasicMaterial({ map: digitTex[0], transparent: true }), [-sC.bw / 2 + 0.3, 0, -0.056], [0, Math.PI, 0], false);

      // ---- dust and debris
      const roofDust = puffs(land, 12), trail = puffs(land, 16), gateDust = puffs(land, 8);
      const debris = new THREE.InstancedMesh(K.roundedBox(0.075, 0.075, 0.075, 0.012, 2), paint(P.cream), 14); debris.castShadow = true; debris.frustumCulled = false; land.add(debris);
      [roofDust, trail, gateDust].forEach((sys) => { for (let i = 0; i < sys.mesh.count; i++) K.place(sys.mesh, i, [0, 0, 0], null, 1e-4); sys.mesh.instanceMatrix.needsUpdate = true; });
      for (let i = 0; i < debris.count; i++) K.place(debris, i, [0, 0, 0], null, 1e-4);
      debris.instanceMatrix.needsUpdate = true;

      // ---- where the story is, for lens and camera
      const toWorld = (p, th) => [p[0] * Math.cos(th) + p[2] * Math.sin(th), p[1], -p[0] * Math.sin(th) + p[2] * Math.cos(th)];
      const turn = (t) => (-11 + 24 * (t / 15) * (1.45 - 0.45 * (t / 15))) * D2R;
      const cam = {
        orbit: K.path([[0, [-12, 27, 19.5]], [4.5, [-9, 27, 19]], [6.2, [-2, 26, 23]], [8.0, [2.5, 25, 20.5]], [9.8, [4.5, 24.5, 17.5]], [12.4, [2.5, 23.5, 17]], [13.6, [0, 22, 14.6]], [15, [-2, 21, 13.2]]]),
        aim: K.path([[0, [-3.85, 2.5, -1.0]], [4.5, [-3.9, 2.55, -1.0]], [5.7, [1.4, 1.25, 1.35]], [7.95, [2.9, 0.8, 0.95]], [9.6, [3.35, 1.5, -0.7]], [12.4, [3.3, 1.6, -0.7]], [13.6, [2.1, 0.7, 0.25]], [15, [2.1, 0.42, 0.3]]]),
      };
      const sunCol = new THREE.Color(), cA = new THREE.Color('#ffe6c6'), cB = new THREE.Color('#ffc994'), skyA = new THREE.Color('#bcd3ff'), skyB = new THREE.Color('#a8b9f2'), paperA = new THREE.Color(P.backdrop), paperB = new THREE.Color(P.evening);

      return {
        update(t) {
          const th = turn(t); world.rotation.y = th;
          const dusk = K.seg(t, 3.0, 13.6, K.ease.inOut);
          sun.position.set(-9 - 2 * dusk, 13 - 2.6 * dusk, 9); sun.intensity = 3.3 - 0.2 * dusk;
          sun.color.copy(sunCol.copy(cA).lerp(cB, dusk));
          scene.background.copy(paperA).lerp(paperB, dusk);
          sky.color.copy(sunCol.copy(skyA).lerp(skyB, dusk));

          // ---- beat 1: the helicopter lands, people climb and board, it lifts at "evacuam"
          const h = heliAt(t);
          heli.g.visible = t < 5.2;
          heli.g.position.set(h.x, h.y, h.z);
          heli.g.rotation.set(h.tilt, h.yaw, 0.04 * Math.sin(t * 2.1));
          heli.rotors.forEach((r, i) => { r.g.rotation.y = t * (i ? -17 : 17) * (t < T.lift + 0.6 ? 1 : 0.6); });
          // rotor wash on the pad
          for (let i = 0; i < 6; i++) {
            const t0 = T.land - 0.6 + i * 0.32, age = (t - t0) / 1.2;
            roofDust.set(i, [PAD.x + K.hash(i, 2) * 1.2 - 0.6, ROOF + 0.05, PAD.z + K.hash(i, 7) * 1.0 - 0.5], age, { size: 0.16, rise: 0.12, drift: K.hash(i, 3) * 0.7 - 0.35, driftZ: K.hash(i, 9) * 0.6 - 0.3 });
          }
          for (let i = 0; i < 4; i++) {
            const t0 = T.lift + i * 0.22, age = (t - t0) / 1.5;
            roofDust.set(6 + i, [PAD.x + K.hash(i, 5) * 1.0 - 0.5, ROOF + 0.04, PAD.z + K.hash(i, 11) * 0.9 - 0.45], age, { size: 0.2, rise: 0.1, drift: K.hash(i, 4) * 1.2 - 0.6, driftZ: K.hash(i, 8) * 1.2 - 0.6 });
          }
          // the three evacuees: queue, stair, roof, cabin
          evac.forEach((e, i) => {
            const c0 = T.climb[i], b0 = T.board[i];
            const startQ = EV_QUEUE[i], bot = [EV_START[0] + i * 0.12, EV_START[1]];
            const climbLen = 1.05, walkLen = 0.42;
            let x, y, z, sc = 1, bob = 0;
            if (t < c0 - 0.22) { x = startQ[0]; y = 0; z = startQ[1]; }
            else if (t < c0) {
              const u = K.seg(t, c0 - 0.22, c0, K.ease.inOut); x = K.lerp(startQ[0], bot[0], u); y = Math.abs(Math.sin(u * Math.PI)) * 0.05; z = K.lerp(startQ[1], bot[1], u);
            } else if (t < c0 + climbLen) {
              const u = K.seg(t, c0, c0 + climbLen, K.ease.inOut);
              x = K.lerp(bot[0], stairTopX, u); z = bot[1]; y = stairY(x - BLD.x); bob = Math.abs(Math.sin(u * 6 * Math.PI)) * 0.018;
            } else if (t < b0) {
              const u = K.seg(t, c0 + climbLen, b0, K.ease.inOut);
              x = K.lerp(stairTopX, PAD.x - 0.12, u); z = K.lerp(stairTopZ, PAD.z + 0.42, u); y = ROOF; bob = Math.abs(Math.sin(u * 5 * Math.PI)) * 0.02;
            } else if (t < b0 + 0.26) {
              const u = K.seg(t, b0, b0 + 0.26, K.ease.in); x = K.lerp(PAD.x - 0.12, PAD.x - 0.08, u); z = K.lerp(PAD.z + 0.42, PAD.z + 0.26, u); y = ROOF; sc = 1 - u;
            } else { sc = 0; x = PAD.x; y = ROOF; z = PAD.z; }
            e.position.set(x, y + bob, z); e.scale.setScalar(Math.max(1e-4, sc));
            e.rotation.y = Math.PI * 0.55;
          });
          marine.position.set(PAD.x - 0.35, ROOF, PAD.z + 0.68 + 0.06 * Math.sin(t * 2)); marine.rotation.y = Math.PI * 0.75;
          marine.position.y = ROOF + (t > 1.4 && t < 3.3 ? Math.abs(Math.sin((t - 1.4) * 4)) * 0.05 : 0);

          // ---- beat 2: the tank comes up the avenue, turns and takes the gate at "palácio"
          const tv = tankAt(t), spd = (tankDist(t + 0.03) - tankDist(t - 0.03)) / 0.06;
          const acc = (tankDist(t + 0.15) - 2 * tankDist(t) + tankDist(t - 0.15)) / 0.0225;
          const bend = (tankAt(t + 0.12).yaw - tankAt(t - 0.12).yaw) / 0.24;
          const stopRock = t > T.tankStop ? Math.exp(-(t - T.tankStop) * 7) * Math.sin((t - T.tankStop) * 18) * 0.02 : 0;
          const hitJolt = t > T.tankHit ? Math.exp(-(t - T.tankHit) * 11) * Math.sin((t - T.tankHit) * 26) * 0.03 : 0;
          tank.g.visible = t > T.tankGo - 0.15;
          tank.g.position.set(tv.p.x, 0.02, tv.p.z); tank.g.rotation.y = tv.yaw;
          tank.body.position.y = -hitJolt;
          tank.body.rotation.set(K.clamp(bend * K.clamp(spd) * 0.02, -0.08, 0.08), 0, K.clamp(acc * 0.004, -0.06, 0.06) - stopRock);
          const t2 = tank2At(t); tank2.g.visible = t > T.tankGo;
          tank2.g.position.set(t2.x, 0.02, t2.z); tank2.g.rotation.y = t2.yaw;
          // tank dust behind the tracks
          for (let i = 0; i < 14; i++) {
            const t0 = T.tankGo + 0.15 + i * 0.21, age = (t - t0) / 1.0, at = tankAt(t0);
            trail.set(i, [at.p.x - at.tg.x * 0.7, 0.12, at.p.z - at.tg.z * 0.7], spd > 0.1 ? age : -1, { size: 0.14, rise: 0.35, drift: K.hash(i, 3) * 0.2 - 0.1, driftZ: 0.1 });
          }
          // the gate: swing in, then fall flat
          const hit = t - T.tankHit;
          gateLeaves.forEach((gl) => {
            const swing = hit > 0 ? K.seg(hit, 0, 0.12, K.ease.out) : 0;
            const drop = hit > 0.1 ? K.seg(hit, 0.1, 0.5, K.ease.in) : 0;
            gl.piv.rotation.y = gl.dir * swing * 0.7;
            gl.piv.rotation.x = drop * 1.35;
          });
          // debris from the gate
          for (let i = 0; i < 14; i++) {
            const a = 0.86 + K.hash(i, 1) * 0.9, v = 1.2 + K.hash(i, 2) * 1.6, dt = Math.max(0, t - T.tankHit);
            const x = gateAt.x + (K.hash(i, 4) - 0.5) * 0.7 + Math.cos(a) * v * dt * 0.25;
            const y = 0.35 + Math.sin(a) * v * dt - 4.9 * dt * dt;
            const z = gateAt.z + (K.hash(i, 5) - 0.3) * 0.35;
            K.place(debris, i, [x, Math.max(-0.4, y), z], [dt * 7 + i, dt * 5, 0], dt < 0.9 ? 1 : 0.001);
          }
          debris.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < 8; i++) {
            const t0 = T.tankHit + 0.02 + i * 0.05, age = (t - t0) / 1.1;
            gateDust.set(i, [gateAt.x + (K.hash(i, 6) - 0.5) * 0.6, 0.2, gateAt.z + (K.hash(i, 7) - 0.5) * 0.5], age, { size: 0.2, rise: 0.3, drift: (K.hash(i, 8) - 0.5) * 1.2, driftZ: -0.3 });
          }
          roofDust.mesh.instanceMatrix.needsUpdate = true; trail.mesh.instanceMatrix.needsUpdate = true; gateDust.mesh.instanceMatrix.needsUpdate = true;

          // ---- beat 3: the name, then "2 days in office"
          const aOn = t >= labels.aIn && t < labels.aOut + 0.3, bOn = t >= labels.bIn && t < labels.bOut + 0.3, cOn = t >= labels.cIn && t < labels.cOut + 0.3;
          const pop = (t0, t1) => { const inS = K.spring(t - t0, 2.4, 0.5), outS = 1 - K.seg(t, t1, t1 + 0.26, K.ease.in); return Math.max(0, inS) * outS; };
          sA.g.scale.setScalar(aOn ? pop(labels.aIn, labels.aOut) : 1e-4);
          sB.g.scale.setScalar(bOn ? pop(labels.bIn, labels.bOut) : 1e-4);
          sC.g.scale.setScalar(cOn ? pop(labels.cIn, labels.cOut) : 1e-4);
          sA.flip.rotation.x = -0.28 + Math.PI * K.spring(t - 4.6, 2.0, 0.5);
          sB.flip.rotation.x = -0.28 + Math.PI * K.spring(t - (T.tankHit + 0.1), 2.0, 0.5);
          const fc = t - T.flipName;
          sC.flip.rotation.x = fc > 0 ? -0.28 + Math.PI * K.spring(fc, 2.2, 0.55) : -0.28;
          sC.flip.position.y = 2.1 + (fc > 0 ? Math.exp(-fc * 7) * Math.sin(fc * 14) * 0.1 : 0);
          const step = t < 12.2 ? 0 : t < 12.34 ? 1 : 2;
          digit.material.map = digitTex[step];
          digit.scale.y = 1 + (fc > 0 && step < 2 ? Math.sin(K.clamp((t - (step === 0 ? 12.06 : 12.2)) / 0.12) * Math.PI) * 0.35 : 0);
          sil.visible = t > 9.3; sil.scale.setScalar(sil.visible ? Math.max(0.001, K.spring(t - 9.3, 2.2, 0.55)) : 1);

          // ---- beat 4: soldiers lay the rifles down at "deporem as armas", then step back
          soldiers.forEach((s, i) => {
            s.visible = t > 12.55;
            const [rx, rz] = RIFLES[i], [sx, sz] = SOLDIERS[i];
            const t0 = 12.92 + i * 0.1, t1 = 13.66 + i * 0.08, tl = T.lay[i], back = tl + 0.24;
            let x, z, y = 0, lean = 0;
            if (t < t0) { x = sx; z = sz - 0.85; }
            else if (t < t1) { const u = K.seg(t, t0, t1, K.ease.inOut); x = K.lerp(sx, rx, u); z = K.lerp(sz - 0.85, rz + 0.3, u); y = Math.abs(Math.sin(u * 5 * Math.PI)) * 0.025; }
            else if (t < back) { const u = K.seg(t, t1, back, K.ease.inOut); x = K.lerp(rx, rx, u); z = K.lerp(rz + 0.3, rz + 0.02, u); lean = Math.sin(Math.PI * K.seg(t, tl - 0.16, tl + 0.2)) * 0.5; }
            else { const u = K.seg(t, back, back + 0.4, K.ease.inOut); x = rx; z = K.lerp(rz + 0.02, rz + 0.55, u); }
            s.position.set(x, y, z); s.rotation.set(lean, 0, 0);
            // the rifle: in hand until the lay, then flat on the ground
            const r = rifles[i], groundY = 0.045;
            if (t < tl - 0.2) { r.visible = t > t0; r.position.set(x, 0.34 + y, z + 0.06); r.rotation.set(Math.PI / 2 - 0.15, 0, 0.5); }
            else if (t < tl) { const u = K.seg(t, tl - 0.2, tl, K.ease.in); r.visible = true; r.position.set(x, K.lerp(0.34 + y, groundY, u), z + K.lerp(0.06, -0.14, u)); r.rotation.set(K.lerp(Math.PI / 2 - 0.15, 0, u), 0, K.lerp(0.5, 0.02, u)); }
            else { const b = Math.exp(-(t - tl) * 16) * Math.abs(Math.sin((t - tl) * 22)) * 0.05; r.visible = true; r.position.set(rx, groundY + b, rz); r.rotation.set(0, 0, 0.02 + i * 0.02); }
          });
          // palace and city lamps come on for the last picture
          const on = K.seg(t, 13.0, 14.2, K.ease.inOut);
          bWin.forEach((m, i) => { m.emissiveIntensity = on * (0.7 + 0.5 * K.hash(i, 3)); });
          bgWin.forEach((m, i) => { m.emissiveIntensity = on * (0.5 + 0.4 * K.hash(i, 5)); });
          flag.rotation.y = 0.1 * Math.sin(t * 1.6);

          // ---- camera and lens
          const [az, el, dist] = cam.orbit(t), ca = cam.aim(t);
          const port = portrait ? 1 : 0;
          const distK = 1 + 0.62 * port, elK = 1 + 0.34 * port;
          const azK = az - 11 * port;
          const cp = [ca[0] + dist * distK * Math.sin(azK * D2R) * Math.cos(el * elK * D2R), ca[1] + dist * distK * Math.sin(el * elK * D2R) + 0.5 * port, ca[2] + dist * distK * Math.cos(azK * D2R) * Math.cos(el * elK * D2R)];
          shade.rotation.z = th;
          const subj = t < 4.5 ? [PAD.x + 0.2, ROOF + 0.5, PAD.z + 0.1]
            : t < 9.0 ? [tv.p.x, 0.6, tv.p.z]
              : t < 12.9 ? [1.9, 1.2, -1.0] : [2.0, 0.35, 0.2];
          K.look(camera, cp, ca, S.R.fov); K.focus(camera, toWorld(subj, th), K.lerp(0.56, 0.26, K.seg(t, 13.2, 14.7, K.ease.inOut)));

          // signs face the lens; the silhouette turns with them
          [sA, sB, sC].forEach((s) => {
            const wp = toWorld([s.g.position.x, 0, s.g.position.z], th);
            s.g.rotation.y = Math.atan2(cp[0] - wp[0], cp[2] - wp[2]) - th;
          });
          if (sil.visible) {
            const sw = toWorld([sil.position.x, 0, sil.position.z], th);
            sil.rotation.y = Math.atan2(cp[0] - sw[0], cp[2] - sw[2]) - th;
          }
        },
      };
    },

    sound(k) {
      const D = 15;
      // city air and a distant rotor, nothing else under the narration
      k.bed('room', 0, D, { gain: 0.5 });
      // CH-46 rotor: a low pulse that gets loud as it settles and again as it climbs
      for (let t = 0; t < T.heliOut; t += 0.185) {
        const settle = K.smooth(0.2, T.land, t) * (1 - 0.25 * K.smooth(T.land, T.lift, t));
        const lift = K.smooth(T.lift, T.lift + 0.3, t) * (1 - K.smooth(4.3, 4.9, t));
        k.tone(t, { f: [[0, 56], [0.09, 36]], dur: 0.16, gain: 0.05 * settle + 0.06 * lift, a: 0.01, pan: -0.25 });
      }
      k.noise(0.2, { dur: 4.6, color: 'brown', filter: 'lowpass', f: 260, gain: 0.035, a: 0.8, hold: 3.2 });
      k.play('thud', T.land, { gain: 0.35, f: 120, pan: -0.2 });
      k.play('tock', T.land + 0.05, { gain: 0.25, f: 240, pan: -0.2 });
      // feet on the metal stair, then the cabin door
      T.climb.forEach((t0, i) => { for (let j = 0; j < 9; j++) k.play('tock', t0 + j * 0.11 + i * 0.02, { gain: 0.12, f: 620 + j * 18, pan: -0.35 + i * 0.06 }); });
      T.board.forEach((t0, i) => k.play('click', t0 + 0.2, { gain: 0.28, pan: -0.3 }));
      k.play('whoosh', T.lift, { gain: 0.4, dur: 0.7, top: 2200, pan: -0.2 });
      k.play('riser', 3.62, { gain: 0.22, dur: 0.9 });
      // the tank: engine up the avenue, a gear change, then the gate
      const d = T.tankStop - T.tankGo;
      for (const [f, g] of [[1, 0.045], [2.01, 0.02]]) k.tone(T.tankGo - 0.1, { f: [[0, 44 * f], [0.9, 72 * f], [2.2, 64 * f], [2.6, 78 * f], [d, 58 * f]], type: 'sawtooth', dur: d + 0.4, a: 0.2, hold: d - 0.1, gain: g, filter: 'lowpass', f2: 460, q: 2, pan: 0.05 });
      k.noise(T.tankGo, { dur: d + 0.2, color: 'brown', filter: 'bandpass', f: 240, q: 0.9, gain: 0.05, a: 0.6, hold: d - 0.6 });
      for (let i = 0; i < 12; i++) k.play('tock', T.tankGo + 0.2 + i * 0.28, { gain: 0.07, f: 190 + (i % 3) * 20, pan: -0.1 });
      k.play('impact', T.tankHit, { gain: 0.85 });
      k.play('paper', T.tankHit + 0.02, { gain: 0.35, dur: 0.3 });
      for (let i = 0; i < 7; i++) k.play('tock', T.tankHit + 0.06 + i * 0.07, { gain: 0.22 - i * 0.02, f: 900 + i * 160, pan: 0.15 });
      k.play('thud', T.tankStop, { gain: 0.3, f: 90, pan: 0.1 });
      // signs: A, B and C turn over with a paper swish and a small bell
      const flipSnd = (t, note, pan) => { k.play('swish', t, { gain: 0.4, pan }); k.play('tock', t + 0.16, { gain: 0.4, f: 780, pan }); k.play('ding', t + 0.17, { gain: 0.4, f: note, pan }); };
      flipSnd(4.62, 'D6', -0.4);
      flipSnd(T.tankHit + 0.12, 'F6', -0.15);
      k.play('swish', labels.cIn, { gain: 0.3, pan: 0.2 }); k.play('pop', labels.cIn + 0.04, { gain: 0.3, pan: 0.2 });
      flipSnd(T.flipName, 'A6', 0.25);
      k.play('count', 12.2, { gain: 0.5, f: 5200, pan: 0.25 }); k.play('count', 12.34, { gain: 0.5, f: 5400, pan: 0.25 });
      k.play('ding', 12.44, { gain: 0.3, f: 'D7', pan: 0.25 });
      // footsteps into the courtyard, then three rifles on the stone
      for (let i = 0; i < 8; i++) k.play('tock', 12.95 + i * 0.14, { gain: 0.07, f: 300 + (i % 2) * 30, pan: 0.25 });
      T.lay.forEach((t, i) => { k.play('click', t, { gain: 0.55, pan: 0.2 + i * 0.05 }); k.play('tock', t + 0.02, { gain: 0.45, f: 330, pan: 0.2 + i * 0.05 }); });
      k.play('tock', 14.62, { gain: 0.12, f: 250, pan: 0.2 });
      // a low, warm closing note, well under the voice
      k.tone(13.6, { f: 'D3', type: 'triangle', dur: 1.35, gain: 0.035, a: 0.3, hold: 0.7, filter: 'lowpass', f2: 700, pan: 0 });
    },
  };
})());
