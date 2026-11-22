// actors.js: peças de época reutilizáveis (S01–S06). Convenção: o ator olha para +x, y é para cima, z é o lado.
// Cada fábrica devolve { group, ... } e, quando se move, um update/pose que depende só do tempo ou da distância andada.
// Regras físicas (R18): quem anda tem passada presa à distância (sem patinar); navio sobre a água (y = 0 é a linha d'água);
// avião e helicóptero têm o nariz em +x, então ficam em yaw = atan2(-dz, dx) do movimento (use LPA.face).
(function () {
  const LP = window.LP, { THREE, K } = window, PAL = LP.PAL, B = LP.B;
  const A = (window.LPA = {});
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // yaw para o ator olhar na direção (dx, dz) do mundo
  A.face = (obj, dx, dz) => { obj.rotation.y = Math.atan2(-dz, dx); return obj; };
  const part = (mesh, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); if (mesh) g.add(mesh); return g; };

  // ------------------------------------------------------------------ soldado e gente
  const UNI = {
    fr: { shirt: PAL.khaki, pants: PAL.khakiDark, helmet: '#7f7b55', kind: 'helmet' },
    uk: { shirt: PAL.khaki, pants: PAL.khaki, helmet: '#8a8760', kind: 'helmet', shorts: true },
    vm: { shirt: PAL.olive, pants: PAL.oliveDark, helmet: '#e8dcb8', kind: 'pith' },
    us: { shirt: PAL.olive, pants: PAL.oliveDark, helmet: '#5d6b45', kind: 'helmet' },
    civil: { shirt: PAL.cream, pants: PAL.slate, helmet: '#d9c48a', kind: 'conical' },
    civil2: { shirt: PAL.coral, pants: PAL.ink, helmet: '#d9c48a', kind: 'conical' },
    civil3: { shirt: PAL.teal, pants: PAL.iron, helmet: PAL.paper, kind: 'none' },
  };
  const LEG = 0.92, AMP = 0.45, STEP = 2 * LEG * Math.sin(AMP); // comprimento do passo = distância por meio ciclo
  A.STEP = STEP;
  // soldier({ kind, seed, rifle }) -> { group, pose(dist, move 0..1, raise 0..1) }
  A.soldier = function ({ kind = 'fr', seed = 1, rifle = true, scale = 1 } = {}) {
    const u = UNI[kind] || UNI.fr, root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const sk = PAL.skin;
    const torso = B(seed).box(0.3, 0.56, 0.44, [0, 0.28, 0], u.shirt, { amt: 0.5 }).box(0.34, 0.1, 0.46, [0, 0.0, 0], u.pants, { amt: 0.4 }).ico(0.12, 1, [0, 0.69, 0], sk, { amt: 0.4 });
    if (u.kind === 'helmet') torso.ico(0.155, 1, [0, 0.74, 0], u.helmet, { scale: [1.05, 0.7, 1.05], amt: 0.5 }).cyl(0.2, 0.2, 0.025, 8, [0, 0.69, 0], u.helmet, { amt: 0.3 });
    else if (u.kind === 'pith') torso.ico(0.17, 1, [0, 0.745, 0], u.helmet, { scale: [1, 0.72, 1], amt: 0.4 }).cyl(0.23, 0.23, 0.02, 8, [0, 0.7, 0], u.helmet, { amt: 0.3 });
    else if (u.kind === 'conical') torso.cone(0.27, 0.2, 8, [0, 0.8, 0], u.helmet, { amt: 0.5 });
    else torso.ico(0.13, 1, [0, 0.76, 0], PAL.ink, { scale: [1, 0.55, 1], amt: 0.3 });
    const tm = torso.mesh(); tm.position.y = LEG; body.add(tm);
    if (rifle) { const r = B(seed + 3).box(0.07, 0.07, 0.9, [0, 0, 0], PAL.trunk, { amt: 0.3 }).box(0.03, 0.03, 0.3, [0, 0, 0.55], PAL.iron).mesh(); r.position.set(0.05, LEG + 0.5, 0.0); r.rotation.set(0, Math.PI / 2, 0.45); body.add(r); }
    const mkLeg = (z) => {
      const g = B(seed + z * 5);
      if (u.shorts) g.box(0.17, 0.4, 0.17, [0, -0.2, 0], u.pants, { amt: 0.4 }).box(0.14, 0.4, 0.14, [0, -0.62, 0], sk, { amt: 0.3 }).box(0.26, 0.1, 0.16, [0.04, -0.87, 0], PAL.ink);
      else g.box(0.17, 0.8, 0.17, [0, -0.4, 0], u.pants, { amt: 0.4 }).box(0.27, 0.12, 0.17, [0.05, -0.86, 0], PAL.ink, { amt: 0.2 });
      return part(g.mesh(), 0, LEG, z);
    };
    const mkArm = (z) => part(B(seed + z * 9).box(0.12, 0.56, 0.12, [0, -0.28, 0], u.shirt, { amt: 0.4 }).ico(0.07, 0, [0, -0.6, 0], sk).mesh(), 0, LEG + 0.52, z);
    const L1 = mkLeg(0.11), L2 = mkLeg(-0.11), A1 = mkArm(0.27), A2 = mkArm(-0.27);
    body.add(L1, L2, A1, A2);
    root.scale.setScalar(scale);
    const ph = (seed * 1.7) % 6.28;
    return {
      group: root,
      // dist: metros andados pelo ator; move: 0 parado, 1 andando; raise: braços para o alto
      pose(dist, move = 1, raise = 0) {
        const s = Math.sin(dist / STEP * Math.PI + ph * 0), a = AMP * move;
        L1.rotation.z = s * a; L2.rotation.z = -s * a;
        body.position.y = LEG * (Math.cos(a * Math.abs(s)) - 1); // quadril desce quando as pernas abrem, o pé não sai do chão
        const sw = 0.5 * move * s, up = K.clamp(raise);
        A1.rotation.z = K.lerp(-sw, Math.PI * 0.88, up); A2.rotation.z = K.lerp(sw, Math.PI * 0.88, up);
        body.rotation.z = -0.03 * move; // leve inclinação para a frente
      },
    };
  };

  // coluna de soldados em fila dupla, olhando +x. update(dist)
  A.column = function ({ n = 8, kind = 'fr', gap = 1.15, files = 2, seed = 1, rifle = true } = {}) {
    const group = new THREE.Group(), list = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / files), f = i % files, s = A.soldier({ kind, seed: seed + i * 3.1, rifle });
      s.group.position.set(-row * gap - (f ? 0.25 : 0), 0, (f - (files - 1) / 2) * 0.95);
      s.off = K.hash(i, seed) * 3; group.add(s.group); list.push(s);
    }
    return { group, soldiers: list, update(dist, move = 1) { for (const s of list) s.pose(dist + s.off * 0.0 + (list.indexOf(s) % 2) * A.STEP, move, 0); } };
  };

  // multidão parada de pé; raise(k, t) levanta os braços na palavra (k 0..1), com atraso individual
  A.crowd = function ({ n = 24, w = 8, d = 4, seed = 3, kinds = ['civil', 'civil2', 'civil3'] } = {}) {
    const group = new THREE.Group(), list = [];
    for (let i = 0; i < n; i++) {
      const s = A.soldier({ kind: kinds[i % kinds.length], seed: seed + i * 2.3, rifle: false, scale: 0.92 + K.hash(i, seed) * 0.16 });
      s.group.position.set((K.hash(i, 1 + seed) - 0.5) * w, 0, (K.hash(i, 2 + seed) - 0.5) * d);
      s.group.rotation.y = (K.hash(i, 3 + seed) - 0.5) * 0.8; s.lag = K.hash(i, 4 + seed) * 0.35; s.fr = K.hash(i, 5 + seed);
      group.add(s.group); list.push(s);
    }
    return { group, people: list, update(t, t0 = 1e9, rise = 0.25) { for (const s of list) { const k = K.seg(t, t0 + s.lag, t0 + s.lag + rise, K.ease.out), bob = k * 0.06 * Math.abs(Math.sin(t * 6 + s.fr * 9)); s.pose(0, 0, k); s.group.position.y = bob; } } };
  };

  // ------------------------------------------------------------------ água
  A.water = function (w, d, { cols = [PAL.water, PAL.waterDeep, PAL.teal], seed = 5, nx = 36, nz = 24, amp = 0.07 } = {}) {
    const g = new THREE.PlaneGeometry(w, d, nx, nz); g.rotateX(-Math.PI / 2);
    const f = LP.facet(g, (c, n, i) => LP.tone(cols[Math.floor(K.hash(i * 0.5, seed) * cols.length) % cols.length], i * 1.1 + seed, 1.1));
    const m = new THREE.Mesh(f, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.55, metalness: 0.0 })); m.receiveShadow = true;
    const base = f.attributes.position.array.slice(), pa = f.attributes.position;
    m.userData.update = (t) => { for (let i = 0; i < pa.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pa.setY(i, amp * (Math.sin(x * 0.55 + t * 1.3 + z * 0.3) + 0.6 * Math.sin(z * 0.8 - t * 1.7 + x * 0.2))); } pa.needsUpdate = true; };
    m.userData.update(0); return m;
  };

  // ------------------------------------------------------------------ navios
  // ship({ L, beam, free, funnels, holds }) -> { group, mouths: [x,y,z], bridgeTop }. Linha d'água em y = 0; proa em +x.
  A.ship = function ({ L = 14, beam = 3.6, free = 1.4, draft = 0.9, funnels = 1, holds = 2, crates = false, hull = PAL.hullBlack, band = PAL.hullRed, house = PAL.cream, funnel = PAL.hullRed, seed = 7 } = {}) {
    const group = new THREE.Group(), plan = (len, w) => { const s = new THREE.Shape(); s.moveTo(-len / 2, -w / 2); s.lineTo(len / 2 - len * 0.22, -w / 2); s.lineTo(len / 2, 0); s.lineTo(len / 2 - len * 0.22, w / 2); s.lineTo(-len / 2, w / 2); s.lineTo(-len / 2 + len * 0.04, 0); s.closePath(); return s; };
    const ext = (len, w, h, y) => { const g = new THREE.ExtrudeGeometry(plan(len, w), { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g; };
    const hb = B(seed).raw(ext(L, beam * 0.86, draft, -draft), [0, 0, 0], band, { amt: 0.5 }).raw(ext(L, beam, free, 0), [0, 0, 0], hull, { amt: 0.4, shade: 0.2 })
      .box(L * 0.74, 0.08, beam * 0.7, [-L * 0.05, free + 0.03, 0], PAL.trunk, { amt: 0.4 });
    // castelo de proa e superestrutura
    const bx = -L * 0.12;
    hb.box(L * 0.2, 1.5, beam * 0.8, [bx, free + 0.78, 0], house, { amt: 0.5 }).box(L * 0.14, 1.0, beam * 0.7, [bx + 0.2, free + 2.0, 0], house, { amt: 0.5 })
      .box(L * 0.15, 0.1, beam * 0.78, [bx + 0.2, free + 2.55, 0], PAL.iron).box(0.05, 0.4, beam * 0.62, [bx + L * 0.075 + 0.2, free + 2.0, 0], PAL.glass);
    for (let i = 0; i < funnels; i++) { const fx = bx - 1.3 - i * 1.7; hb.cyl(0.42, 0.5, 2.3, 8, [fx, free + 2.5 + 0.2, 0], funnel, { amt: 0.4 }).cyl(0.43, 0.43, 0.22, 8, [fx, free + 3.7, 0], PAL.hullBlack).cyl(0.34, 0.34, 0.06, 8, [fx, free + 3.98, 0], PAL.ink); }
    for (let i = 0; i < holds; i++) { const hx = L * 0.2 + i * L * 0.16 - (holds > 2 ? L * 0.08 : 0); hb.box(L * 0.1, 0.35, beam * 0.5, [hx, free + 0.2, 0], PAL.khakiDark, { amt: 0.4 }); if (crates) hb.box(0.9, 0.9, 0.9, [hx - 0.2, free + 0.8, 0.5], PAL.trunk, { amt: 0.6 }).box(0.8, 0.8, 0.8, [hx + 0.3, free + 0.75, -0.5], PAL.khaki, { amt: 0.6 }); }
    hb.cyl(0.05, 0.07, 5.2, 5, [L * 0.3, free + 2.8, 0], PAL.iron).cyl(0.04, 0.05, 4.8, 5, [-L * 0.34, free + 2.6, 0], PAL.iron);
    hb.box(0.5, 0.25, 0.9, [bx + 0.5, free + 1.6, beam * 0.5 + 0.1], PAL.white).box(0.5, 0.25, 0.9, [bx + 0.5, free + 1.6, -beam * 0.5 - 0.1], PAL.white);
    group.add(hb.mesh());
    const mouths = []; for (let i = 0; i < funnels; i++) mouths.push([bx - 1.3 - i * 1.7, free + 4.0, 0]);
    return { group, L, beam, free, mouths, draft };
  };
  A.steamer = (o = {}) => A.ship(Object.assign({ L: 14, beam: 3.6, funnels: 1, holds: 2 }, o));
  A.freighter = (o = {}) => A.ship(Object.assign({ L: 24, beam: 5, free: 1.8, draft: 1.3, funnels: 1, holds: 3, crates: true, hull: '#3a3f46', band: PAL.hullGrey }, o));

  // esteira: V de espuma atrás do casco; update(k) 0..1 pela velocidade
  A.wake = function (L = 14, beam = 3.6) {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: PAL.white, transparent: true, opacity: 0.7, depthWrite: false });
    const arm = (s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.28), mat); m.rotation.x = -Math.PI / 2; m.userData.s = s; g.add(m); return m; };
    const a1 = arm(1), a2 = arm(-1), tail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat), bow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    tail.rotation.x = -Math.PI / 2; bow.rotation.x = -Math.PI / 2; g.add(tail, bow);
    g.userData.update = (k) => {
      g.visible = k > 0.03; g.position.y = 0.06; mat.opacity = 0.75 * K.clamp(k * 1.4);
      const len = (3 + k * 9) * (L / 14);
      for (const a of [a1, a2]) { a.scale.set(len, 1, 1); a.position.set(-L * 0.45 - len * 0.5 * Math.cos(0.3), 0, a.userData.s * (beam * 0.45 + len * 0.5 * Math.sin(0.3))); a.rotation.z = -a.userData.s * 0.3; }
      tail.scale.set(len * 0.7, beam * 0.7, 1); tail.position.set(-L * 0.5 - len * 0.35, 0.01, 0);
      bow.scale.set(L * 0.1 * k + 0.01, beam * 1.05 * K.clamp(k * 2), 1); bow.position.set(L * 0.4, 0.01, 0);
    };
    g.userData.update(0); return g;
  };

  // ------------------------------------------------------------------ guindaste de cais: cabo e gancho
  // crane({ h, jib }) -> { group, update(jibYaw, hookDrop) , hook }. Portal sobre o cais; lança aponta para +x.
  A.crane = function ({ h = 9, jib = 9, seed = 11 } = {}) {
    const group = new THREE.Group();
    const base = B(seed); for (const [x, z] of [[-1.4, -1.5], [1.4, -1.5], [-1.4, 1.5], [1.4, 1.5]]) base.box(0.35, h, 0.35, [x, h / 2, z], PAL.hullRed, { amt: 0.4 });
    base.box(3.4, 0.4, 3.8, [0, h, 0], PAL.hullGrey).box(3.2, 0.3, 0.3, [0, h * 0.5, -1.5], PAL.hullRed).box(3.2, 0.3, 0.3, [0, h * 0.5, 1.5], PAL.hullRed).box(2.4, 1.6, 2.2, [0, h + 1.0, 0], PAL.khakiDark, { amt: 0.4 }).box(0.05, 0.6, 1.4, [1.22, h + 1.2, 0], PAL.glass);
    group.add(base.mesh());
    const pivot = part(B(seed + 1).box(jib, 0.35, 0.4, [jib / 2, 0, 0], PAL.hullGrey).box(jib * 0.5, 0.2, 0.2, [jib * 0.3, 0.6, 0], PAL.iron, { rot: [0, 0, 0.35] }).box(0.8, 0.9, 0.8, [-0.6, 0, 0], PAL.iron).mesh(), 0, h + 1.2, 0);
    group.add(pivot);
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1, 0.04), new THREE.MeshStandardMaterial({ color: PAL.iron }));
    const hook = new THREE.Group(); hook.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: PAL.iron, flatShading: true })));
    group.add(cable, hook);
    const api = { group, hook, jibLen: jib, topY: h + 1.2,
      // hookDrop: metros abaixo da ponta da lança
      update(yaw = 0, hookDrop = 3, reach = jib * 0.92) {
        pivot.rotation.y = yaw; const hx = Math.cos(yaw) * reach, hz = -Math.sin(yaw) * reach, y0 = h + 1.2 - 0.2;
        cable.position.set(hx, y0 - hookDrop / 2, hz); cable.scale.y = Math.max(0.01, hookDrop); hook.position.set(hx, y0 - hookDrop - 0.15, hz);
      } };
    api.update(0, 3); return api;
  };

  // ------------------------------------------------------------------ aviões e helicóptero
  // C-47 (Dakota): fuselagem em x, asas em z. update(t) gira as hélices
  A.c47 = function ({ seed = 21, roundel = PAL.frFlagBlue, gear = false } = {}) {
    const group = new THREE.Group(), body = B(seed);
    body.cyl(1.0, 1.0, 14, 8, [0, 0, 0], PAL.hullGrey, { rot: [0, 0, Math.PI / 2], amt: 0.4 }).cone(1.0, 3, 8, [8.5, 0, 0], PAL.hullGrey, { rot: [0, 0, -Math.PI / 2], amt: 0.4 })
      .cyl(0.45, 1.0, 5.5, 8, [-9.7, 0.3, 0], PAL.hullGrey, { rot: [0, 0, Math.PI / 2], amt: 0.4 }).box(3.4, 0.22, 29, [0.8, -0.15, 0], PAL.hullGrey, { amt: 0.4 }).box(1.2, 0.04, 28.6, [0.9, -0.03, 0], PAL.olive, { amt: 0.3 })
      .box(2.6, 2.6, 0.22, [-11.5, 1.7, 0], PAL.hullGrey, { amt: 0.4 }).box(2.2, 0.16, 8.6, [-11.6, 0.55, 0], PAL.hullGrey, { amt: 0.4 })
      .box(2.0, 0.55, 0.05, [6.3, 0.35, 1.0], PAL.glass).box(2.0, 0.55, 0.05, [6.3, 0.35, -1.0], PAL.glass);
    for (let i = 0; i < 5; i++) body.box(0.45, 0.4, 0.04, [-2 + i * 1.3, 0.35, 1.01], PAL.glass).box(0.45, 0.4, 0.04, [-2 + i * 1.3, 0.35, -1.01], PAL.glass);
    for (const s of [1, -1]) body.cyl(0.55, 0.45, 3.2, 8, [3.0, -0.3, s * 5.2], PAL.olive, { rot: [0, 0, Math.PI / 2], amt: 0.4 }).ico(0.5, 1, [4.7, -0.3, s * 5.2], PAL.iron, { scale: [0.8, 1, 1] });
    if (gear) for (const s of [1, -1]) body.cyl(0.05, 0.05, 1.6, 5, [3.3, -1.0, s * 5.2], PAL.iron).cyl(0.5, 0.5, 0.3, 8, [3.3, -1.7, s * 5.2], PAL.ink, { rot: [Math.PI / 2, 0, 0] });
    group.add(body.mesh());
    const dsk = (z) => { const g = new THREE.Group(); g.position.set(5.0, -0.3, z); const bl = B(seed + 5).box(0.05, 3.4, 0.22, [0, 0, 0], PAL.ink).box(0.05, 0.22, 3.4, [0, 0, 0], PAL.ink).mesh(); g.add(bl); return g; };
    const props = [dsk(5.2), dsk(-5.2)]; props.forEach((p) => group.add(p));
    // cocarda sob a asa e na fuselagem
    const R = new THREE.Group(); for (const s of [1, -1]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 12), new THREE.MeshStandardMaterial({ color: roundel, flatShading: true })); d.rotation.x = Math.PI / 2; d.position.set(-6.2, 0.25, s * 1.0); R.add(d); } group.add(R);
    return { group, update(t) { props.forEach((p, i) => { p.rotation.x = t * 60 + i; }); } };
  };

  // C-119 Flying Boxcar: cauda em duas lanças, asa alta, dois motores. Nariz em +x; use A.face.
  A.c119 = function ({ seed = 26, body = PAL.olive } = {}) {
    const group = new THREE.Group(), b = B(seed);
    b.cyl(1.5, 1.5, 13, 8, [0, 0, 0], body, { rot: [0, 0, Math.PI / 2], amt: 0.4 })
      .cone(1.5, 2.6, 8, [7.8, 0, 0], body, { rot: [0, 0, -Math.PI / 2], amt: 0.4 })
      .box(2.4, 1.5, 0.06, [6.9, 0.55, 1.2], PAL.glass).box(2.4, 1.5, 0.06, [6.9, 0.55, -1.2], PAL.glass)
      .box(2.0, 2.6, 3.4, [-7.4, 0.1, 0], body, { amt: 0.4 })                     // porta de carga traseira
      .box(4.2, 0.24, 30, [-0.6, 1.0, 0], body, { amt: 0.4 });                     // asa alta
    for (const s of [1, -1]) {
      b.box(12.5, 0.7, 0.7, [-3.2, 0.5, s * 3.4], body, { amt: 0.4 })              // lança da cauda
        .box(3.0, 2.0, 0.18, [-9.2, 1.5, s * 3.4], body, { amt: 0.4 });
      b.cyl(0.62, 0.55, 2.6, 8, [0.6, 0.75, s * 5.2], PAL.iron, { rot: [0, 0, Math.PI / 2], amt: 0.4 })
        .ico(0.5, 1, [2.0, 0.75, s * 5.2], PAL.iron, { scale: [0.8, 1, 1] });
    }
    b.box(4.4, 0.16, 10.6, [-9.3, 1.6, 0], body, { amt: 0.4 });                    // estabilizador entre as lanças
    group.add(b.mesh());
    const dsk = (z) => { const g = new THREE.Group(); g.position.set(2.0, 0.75, z); const bl = B(seed + 5).box(0.05, 3.6, 0.24, [0, 0, 0], PAL.ink).box(0.05, 0.24, 3.6, [0, 0, 0], PAL.ink).mesh(); g.add(bl); return g; };
    const props = [dsk(5.2), dsk(-5.2)]; props.forEach((p) => group.add(p));
    for (const s of [1, -1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 12), new THREE.MeshStandardMaterial({ color: PAL.usBlue, flatShading: true })); w.rotation.x = Math.PI / 2; w.position.set(-4.2, 0.2, s * 1.4); group.add(w); }
    return { group, update(t) { props.forEach((p, i) => { p.rotation.x = t * 58 + i; }); } };
  };

  A.heli = function ({ seed = 31, body = PAL.olive } = {}) {    const group = new THREE.Group(), b = B(seed);
    b.ico(1.4, 1, [0, 1.3, 0], body, { scale: [1.5, 0.9, 0.85], amt: 0.5 }).box(0.06, 0.9, 1.4, [1.9, 1.5, 0], PAL.glass).cyl(0.2, 0.34, 4.8, 6, [-3.7, 1.7, 0], body, { rot: [0, 0, Math.PI / 2 + 0.06], amt: 0.4 })
      .box(0.1, 1.1, 0.12, [-6.1, 2.1, 0], body).cyl(0.1, 0.1, 0.5, 6, [0, 2.65, 0], PAL.iron);
    for (const s of [1, -1]) b.box(3.0, 0.08, 0.1, [0.1, 0.2, s * 0.9], PAL.iron).box(0.08, 0.9, 0.08, [0.9, 0.65, s * 0.9], PAL.iron).box(0.08, 0.9, 0.08, [-0.7, 0.65, s * 0.9], PAL.iron);
    group.add(b.mesh());
    const rot = part(B(seed + 2).box(8.6, 0.05, 0.28, [0, 0, 0], PAL.iron).box(0.28, 0.05, 8.6, [0, 0, 0], PAL.iron).mesh(), 0, 2.95, 0), tr = part(B(seed + 3).box(0.06, 1.4, 0.1, [0, 0, 0], PAL.iron).mesh(), -6.1, 2.2, 0.15);
    group.add(rot, tr);
    return { group, update(t, spin = 1) { rot.rotation.y = t * 40 * spin; tr.rotation.z = t * 60 * spin; } };
  };

  // ------------------------------------------------------------------ veículos
  A.jeep = function ({ seed = 41, color = PAL.olive, driver = 'fr' } = {}) {
    const group = new THREE.Group(), b = B(seed);
    b.box(3.2, 0.55, 1.5, [0, 0.62, 0], color, { amt: 0.4 }).box(1.0, 0.45, 1.46, [1.4, 0.95, 0], color, { amt: 0.4 }).box(0.06, 0.55, 1.4, [0.5, 1.2, 0], PAL.glass).box(0.8, 0.12, 1.2, [-0.7, 0.9, 0], PAL.ink).box(0.12, 0.4, 1.3, [1.95, 0.8, 0], PAL.hullGrey)
      .box(0.2, 0.12, 0.2, [1.85, 0.95, 0.5], PAL.flameHot).box(0.2, 0.12, 0.2, [1.85, 0.95, -0.5], PAL.flameHot);
    group.add(b.mesh());
    const wheels = [], mk = (x, z) => { const w = part(B(seed + x).cyl(0.36, 0.36, 0.26, 8, [0, 0, 0], PAL.ink, { rot: [Math.PI / 2, 0, 0] }).box(0.1, 0.1, 0.3, [0.3, 0, 0], PAL.hullGrey).mesh(), x, 0.36, z); group.add(w); wheels.push(w); };
    mk(1.1, 0.78); mk(1.1, -0.78); mk(-1.1, 0.78); mk(-1.1, -0.78);
    if (driver) { const s = A.soldier({ kind: driver, seed: seed + 2, rifle: false }); s.group.position.set(-0.2, -0.3 + 0.0, 0.35); s.group.scale.setScalar(0.9); s.pose(0, 0, 0); group.add(s.group); }
    return { group, update(dist) { for (const w of wheels) w.rotation.z = -dist / 0.36; } };
  };

  A.tank = function ({ seed = 51, color = PAL.olive } = {}) {
    const group = new THREE.Group(), b = B(seed);
    b.box(5.4, 0.9, 2.2, [0, 1.05, 0], color, { amt: 0.4 }).box(1.4, 0.4, 2.0, [3.0, 0.95, 0], color, { amt: 0.4, rot: [0, 0, 0.5] });
    for (const s of [1, -1]) b.box(5.8, 0.85, 0.55, [0, 0.55, s * 1.3], PAL.iron, { amt: 0.3 });
    group.add(b.mesh());
    const tur = part(B(seed + 1).ico(1.2, 1, [0, 0, 0], color, { scale: [1.25, 0.6, 1.0], amt: 0.4 }).box(0.5, 0.35, 0.6, [-1.1, 0.1, 0], color).mesh(), -0.3, 1.8, 0);
    const gun = part(B(seed + 2).cyl(0.1, 0.1, 3.6, 6, [1.8, 0, 0], PAL.iron, { rot: [0, 0, Math.PI / 2] }).mesh(), 1.2, 0.1, 0); tur.add(gun); group.add(tur);
    const tr = []; for (const s of [1, -1]) for (let i = 0; i < 6; i++) { const w = part(B(seed + i).cyl(0.4, 0.4, 0.3, 8, [0, 0, 0], PAL.ink, { rot: [Math.PI / 2, 0, 0] }).mesh(), -2.2 + i * 0.9, 0.42, s * 1.3); group.add(w); tr.push(w); }
    return { group, turret: tur, update(dist) { for (const w of tr) w.rotation.z = -dist / 0.4; } };
  };

  // ------------------------------------------------------------------ mesa, papel, carimbo
  A.desk = function ({ seed = 61 } = {}) {
    const group = new THREE.Group(), b = B(seed);
    b.box(3.0, 0.14, 1.6, [0, 1.0, 0], PAL.trunk, { amt: 0.5 });
    for (const [x, z] of [[-1.35, -0.7], [1.35, -0.7], [-1.35, 0.7], [1.35, 0.7]]) b.box(0.16, 1.0, 0.16, [x, 0.5, z], PAL.trunk, { amt: 0.4 });
    b.box(1.1, 0.03, 0.8, [-0.4, 1.09, 0.1], PAL.paper, { amt: 0.2, rot: [0, 0.08, 0] }).box(0.9, 0.03, 0.7, [0.6, 1.09, -0.2], PAL.paper, { amt: 0.2, rot: [0, -0.15, 0] }).box(0.5, 0.05, 0.3, [0.2, 1.12, 0.45], PAL.coral);
    group.add(b.mesh());
    const st = part(B(seed + 1).cyl(0.14, 0.14, 0.25, 8, [0, 0.12, 0], PAL.hullRed).cyl(0.2, 0.2, 0.06, 8, [0, 0, 0], PAL.ink).mesh(), 0.1, 1.2, -0.2); group.add(st);
    return { group, stamp: st, press(u) { st.position.y = 1.2 + 0.5 * (1 - Math.min(1, Math.abs(Math.sin(u * Math.PI)) * 1.4)) - 0.08; } };
  };

  // ------------------------------------------------------------------ prédios, usina, janelas acesas
  // house({ w, d, h, roof, wall, floors, seed }) -> { group, glow } ; janelas só nas faces z+ e z- (e x+ se side); glow é o material das janelas
  A.house = function ({ w = 6, d = 5, h = 6, wall = PAL.cream, roof = PAL.roof, floors = 2, seed = 71, glow = null, shutters = true } = {}) {
    const group = new THREE.Group(), b = B(seed), win = B(seed + 1);
    b.box(w, h, d, [0, h / 2, 0], wall, { amt: 0.5 }).box(w + 0.3, 0.2, d + 0.3, [0, h + 0.1, 0], PAL.creamDark).cone(Math.max(w, d) * 0.78, 1.6, 4, [0, h + 0.2 + 0.8, 0], roof, { rot: [0, Math.PI / 4, 0], scale: [w / Math.max(w, d), 1, d / Math.max(w, d)], amt: 0.5 });
    const cols = Math.max(2, Math.floor(w / 1.7)), fl = floors, fh = h / fl;
    for (let f = 0; f < fl; f++) for (let c = 0; c < cols; c++) for (const s of [1, -1]) {
      const x = (c + 0.5) / cols * w - w / 2, y = f * fh + fh * 0.55, wz = s * (d / 2 + 0.02);
      win.box(0.7, 0.95, 0.06, [x, y, wz], '#ffffff');
      if (shutters) b.box(0.28, 1.0, 0.05, [x - 0.55, y, wz + s * 0.0], PAL.slate, { amt: 0.3 }).box(0.28, 1.0, 0.05, [x + 0.55, y, wz], PAL.slate, { amt: 0.3 });
    }
    group.add(b.mesh());
    const gm = glow || new THREE.MeshStandardMaterial({ color: PAL.glass, flatShading: true, roughness: 0.4 });
    group.add(new THREE.Mesh(win.geo(), gm));
    return { group, glow: gm };
  };

  // usina elétrica: galpão, duas chaminés (bocas em mouths), janelas acesas e portão
  A.powerplant = function ({ seed = 81, glow } = {}) {
    const group = new THREE.Group(), b = B(seed), win = B(seed + 1);
    b.box(14, 7, 9, [0, 3.5, 0], PAL.brick, { amt: 0.6 }).box(14.4, 0.4, 9.4, [0, 7.2, 0], PAL.brickDark).box(10, 2.6, 7, [0, 8.6, 0], PAL.brick, { amt: 0.6 }).box(10.4, 0.3, 7.4, [0, 10.05, 0], PAL.brickDark)
      .box(2.4, 3.6, 0.2, [0, 1.8, 4.55], PAL.iron);
    for (const x of [-4.5, 4.5]) b.cyl(0.8, 1.2, 15, 8, [x, 7.5 + 2, -1.5], PAL.brickDark, { amt: 0.5 }).cyl(0.95, 0.95, 0.5, 8, [x, 15.2 + 2, -1.5], PAL.iron);
    for (let i = 0; i < 4; i++) for (const s of [1, -1]) { win.box(1.0, 1.7, 0.06, [-5.1 + i * 3.4 + (i > 1 ? 1.2 : 0), 4, s * 4.53], '#ffffff'); }
    for (let i = 0; i < 3; i++) win.box(1.2, 0.9, 0.06, [-3.5 + i * 3.5, 8.8, 3.55], '#ffffff');
    group.add(b.mesh());
    const gm = glow || LP.glowMat(PAL.gold, 1.4); group.add(new THREE.Mesh(win.geo(), gm));
    return { group, glow: gm, mouths: [[-4.5, 17.2, -1.5], [4.5, 17.2, -1.5]] };
  };

  // ------------------------------------------------------------------ fogo, explosão
  // fire({ n, w, h }) -> { group, update(t, k) } ; k 0..1 intensidade (brasas ficam menores)
  A.fire = function ({ n = 8, w = 3, h = 2, seed = 91, power = 1.5 } = {}) {
    const group = new THREE.Group(), outer = LP.glowMat(PAL.flame, power), inner = LP.glowMat(PAL.flameHot, power * 1.2), list = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group(), x = (K.hash(i, seed) - 0.5) * w, z = (K.hash(i, seed + 1) - 0.5) * w * 0.4, r = 0.35 + K.hash(i, seed + 2) * 0.35;
      const a = new THREE.Mesh(new THREE.ConeGeometry(r, h * (0.6 + K.hash(i, seed + 3) * 0.6), 5), outer), c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, h * 0.55, 5), inner);
      a.position.y = h * 0.3; c.position.y = h * 0.2; g.add(a, c); g.position.set(x, 0, z); g.userData = { ph: K.hash(i, seed + 4) * 6.28, a, c }; group.add(g); list.push(g);
    }
    return { group, update(t, k = 1) { group.visible = k > 0.01; for (const g of list) { const f = 0.75 + 0.35 * Math.sin(t * 13 + g.userData.ph) + 0.2 * Math.sin(t * 7.3 + g.userData.ph * 2); g.scale.set(k * (0.9 + 0.2 * f), k * f, k * (0.9 + 0.2 * f)); g.rotation.y = t * 2 + g.userData.ph; } } };
  };

  // bola de fogo + estilhaços: update(u) com u = segundos desde a explosão (u < 0 invisível)
  // vários blobs aditivos (sem silhueta dura) + núcleo branco curto + destroços com peso
  A.blast = function ({ r = 5, seed = 101, debris = 22 } = {}) {
    const group = new THREE.Group(), blobs = [], ds = [];
    for (let i = 0; i < 5; i++) {
      const hot = i === 0;
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hot ? PAL.flameHot : PAL.flame).multiplyScalar(hot ? 2.6 : 1.35), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), m);
      b.userData = { a: K.hash(i, seed + 1) * 6.28, el: (K.hash(i, seed + 2) - 0.5) * 1.2, s: hot ? 0.55 : 0.45 + K.hash(i, seed + 3) * 0.4, ph: K.hash(i, seed + 4) * 6.28 };
      group.add(b); blobs.push(b);
    }
    for (let i = 0; i < debris; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.35), new THREE.MeshStandardMaterial({ color: i % 3 ? PAL.brickDark : PAL.ink, flatShading: true })); m.userData = { a: K.hash(i, seed) * 6.28, v: 4 + K.hash(i, seed + 1) * 9, vy: 6 + K.hash(i, seed + 2) * 11, s: 0.5 + K.hash(i, seed + 3) }; group.add(m); ds.push(m); }
    return { group, update(u) {
      group.visible = u > 0 && u < 1.6; if (!group.visible) return;
      const k = K.ease.outExpo(K.clamp(u / 0.5)), fade = 1 - K.smooth(0.2, 1.05, u);
      for (const b of blobs) {
        const d = b.userData, rr = r * (0.5 + 0.5 * k) * d.s * (1 + 0.32 * u);
        b.visible = fade > 0.01;
        b.position.set(Math.cos(d.a) * r * 0.42 * k, Math.sin(d.el) * r * 0.3 * k + 0.2 * u, Math.sin(d.a) * r * 0.42 * k);
        b.scale.setScalar(Math.max(0.01, rr));
        b.material.opacity = Math.min(1, 0.75 * fade) * (d.s < 0.6 ? 1 : 0.7);
        b.rotation.set(u * 2 + d.ph, u * 1.7, u * 1.3);
      }
      for (const m of ds) { const d = m.userData, x = Math.cos(d.a) * d.v * u, z = Math.sin(d.a) * d.v * u, y = d.vy * u - 6 * u * u; m.position.set(x, Math.max(0.15, y), z); m.rotation.set(u * 6 * d.s, u * 5, u * 4); m.scale.setScalar(1 - K.smooth(2, 3.4, u)); if (y < 0.15) m.position.y = 0.15; }
    } };
  };

  // fumaça lenta de incêndio (grande, escura) sobre um ponto
  A.pillar = (parent, o) => LP.smoke(parent, Object.assign({ n: 28, life: 5, color: PAL.smokeDark, size: 0.9, grow: 3.2, rise: 2.6, opacity: 0.85 }, o));
})();
