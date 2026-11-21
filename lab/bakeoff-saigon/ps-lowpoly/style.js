// ps-lowpoly: estilo "Low-Poly" aplicado à queda de Saigon (29-30/04/1975), 15 s, narração PT-BR.
// Um mundo só (maquete de papel facetado); a câmera viaja do telhado ao palácio. Tudo é função pura de t.
window.STYLE = window.registerStyle((() => {
  // ---------------------------------------------------------------- conteúdo
  const T = {
    land: 1.26,                 // o CH-53 toca o telhado
    lift: 3.49,                 // "evacuam": decola
    heliOut: 4.9,
    tankHit: 7.96,              // "palácio": o portão cai
    tankStop: 8.85,
    nameIn: 10.6, flipName: 12.06, nameOut: 13.0,
    lay: [13.81, 14.06, 14.31, 14.52],
  };
  const FONT = '400 150px "Anton"';
  const ROOF = 1.7;             // altura do telhado
  const HELI_X = -9.3, HELI_Z = -1;
  const GATE_X = 6.2;

  // ---------------------------------------------------------------- paleta curta
  const PAL = {
    olive: '#6c7a4e', oliveDark: '#55633d', oliveLight: '#8a9a62', khaki: '#a09a6c', khakiDark: '#7e7a54',
    cream: '#f1e6d0', creamDark: '#d9c9ac', sand: '#ecd3a0', coral: '#e08a6c', teal: '#4f9aa5', slate: '#47707a',
    grass: '#a5bf66', meadow: '#86ad5c', forest: '#5d9160', pine: '#3f7d62', leaf: '#74a857', trunk: '#7d5e4e',
    road: '#6d6b66', roadLine: '#f4ead6', stone: '#cdbfa6', iron: '#2f343b', ink: '#22303c', accent: '#e9684a',
    track: '#3a3a38', glass: '#2f4b57', skin: '#e6bb95', dust: '#efe3cc', paper: '#fff6e4',
    skyTop: '#66a9cf', skyPale: '#f7ead9', haze: '#f8dcc0', sun: '#ffcf99',
    hill: '#8fb47a', hillFar: '#a9c49a',
  };
  const _hsl = {};
  function tone(hex, key, amount = 1) {
    const c = new THREE.Color(hex); c.getHSL(_hsl);
    return c.setHSL(_hsl.h + (K.hash(key, 1.3) - 0.5) * 0.03 * amount, K.clamp(_hsl.s * (1 + (K.hash(key, 7.7) - 0.5) * 0.22 * amount)), K.clamp(_hsl.l * (1 + (K.hash(key, 13.1) - 0.5) * 0.15 * amount)));
  }

  // ---------------------------------------------------------------- ferramentas de faceta
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _m = new THREE.Vector3();
  function jitter(geo, amount, seed = 1) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 500) * 0.731 + Math.round(p.getY(i) * 500) * 1.913 + Math.round(p.getZ(i) * 500) * 3.377 + seed * 17.17;
      p.setXYZ(i, p.getX(i) + (K.hash(k, 1) - 0.5) * 2 * amount, p.getY(i) + (K.hash(k, 2) - 0.5) * 2 * amount, p.getZ(i) + (K.hash(k, 3) - 0.5) * 2 * amount);
    }
    return geo;
  }
  function facet(src, paint) {
    const g = src.index ? src.toNonIndexed() : src, p = g.attributes.position, pos = [], col = [], nor = [];
    for (let i = 0; i < p.count; i += 3) {
      _a.fromBufferAttribute(p, i); _b.fromBufferAttribute(p, i + 1); _c.fromBufferAttribute(p, i + 2);
      _n.subVectors(_b, _a).cross(_m.subVectors(_c, _a));
      if (_n.length() < 1e-9) continue;
      _n.normalize(); _m.copy(_a).add(_b).add(_c).divideScalar(3);
      const k = paint(_m, _n, i / 3);
      for (const v of [_a, _b, _c]) { pos.push(v.x, v.y, v.z); col.push(k.r, k.g, k.b); nor.push(_n.x, _n.y, _n.z); }
    }
    const out = new THREE.BufferGeometry();
    for (const [name, arr] of [['position', pos], ['color', col], ['normal', nor]]) out.setAttribute(name, new THREE.Float32BufferAttribute(arr, 3));
    return out;
  }
  function merge(list) {
    const out = new THREE.BufferGeometry();
    for (const name of Object.keys(list[0].attributes)) {
      const size = list[0].attributes[name].itemSize, arr = new Float32Array(list.reduce((s, g) => s + g.attributes[name].array.length, 0));
      let o = 0; for (const g of list) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
      out.setAttribute(name, new THREE.BufferAttribute(arr, size));
    }
    return out;
  }
  const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 });
  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _mat = new THREE.Matrix4();
  // B(): monta uma peça a partir de formas simples, cada triângulo com um tom
  function B(seed = 1) {
    const list = []; let n = 0;
    const add = (g, pos, col, o = {}) => {
      if (o.jit) jitter(g, o.jit, seed + n);
      if (o.scale) g.scale(o.scale[0], o.scale[1], o.scale[2]);
      _e.set((o.rot || [0, 0, 0])[0], (o.rot || [0, 0, 0])[1], (o.rot || [0, 0, 0])[2]); _q.setFromEuler(_e);
      g.applyMatrix4(_mat.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), _q, new THREE.Vector3(1, 1, 1)));
      const s = seed * 7 + (n++) * 3.3, amt = o.amt == null ? 0.8 : o.amt, shade = o.shade == null ? 0.12 : o.shade;
      list.push(facet(g, (c, nn, i) => {
        const base = Array.isArray(col) ? col[Math.floor(K.hash(c.x * 9 + c.y * 5 + c.z * 3 + s) * col.length) % col.length] : col;
        return tone(base, c.x * 13 + c.y * 7 + c.z * 3 + s, amt).multiplyScalar(1 + shade * (nn.y - 0.2));
      }));
      return api;
    };
    const api = {
      box: (w, h, d, pos, col, o) => add(new THREE.BoxGeometry(w, h, d, (o && o.seg) || 1, 1, (o && o.seg) || 1), pos, col, o),
      cyl: (rt, rb, h, sides, pos, col, o) => add(new THREE.CylinderGeometry(rt, rb, h, sides, 1), pos, col, o),
      ico: (r, detail, pos, col, o) => add(new THREE.IcosahedronGeometry(r, detail), pos, col, o),
      cone: (r, h, sides, pos, col, o) => add(new THREE.ConeGeometry(r, h, sides, 1), pos, col, o),
      raw: (g, pos, col, o) => add(g, pos, col, o),
      geo: () => merge(list),
      mesh: (o = {}) => { const m = new THREE.Mesh(merge(list), MAT); m.castShadow = o.cast !== false; m.receiveShadow = true; return m; },
    };
    return api;
  }

  // ---------------------------------------------------------------- árvores (instanciadas)
  function pineGeo(seed) {
    const b = B(seed);
    b.cyl(0.04, 0.06, 0.26, 5, [0, 0.13, 0], PAL.trunk);
    [[0.33, 0.46, 0.2], [0.25, 0.42, 0.5], [0.165, 0.4, 0.78]].forEach(([rad, h, y], i) => b.cone(rad, h, 6, [0, y + h / 2, 0], PAL.pine, { jit: 0.02 }));
    return b.geo();
  }
  function treeGeo(seed, colour) {
    const b = B(seed);
    b.cyl(0.035, 0.055, 0.42, 5, [0, 0.21, 0], PAL.trunk);
    b.ico(0.36, 1, [0, 0.7, 0], colour, { jit: 0.05, scale: [1, 0.92, 1] });
    b.ico(0.22, 1, [0.2, 0.52, 0.08], colour, { jit: 0.035 });
    return b.geo();
  }

  // ---------------------------------------------------------------- pessoas, fuzil
  function personGeo(shirt, pants, seed, helmet) {
    const b = B(seed);
    b.cyl(0.055, 0.06, 0.13, 6, [0, 0.065, 0], pants, { amt: 0.5 });
    b.cyl(0.07, 0.06, 0.14, 6, [0, 0.2, 0], shirt, { amt: 0.7 });
    b.ico(0.055, 1, [0, 0.31, 0], PAL.skin, { amt: 0.3, jit: 0.006 });
    if (helmet) b.ico(0.064, 1, [0, 0.335, 0], PAL.oliveDark, { amt: 0.5, scale: [1, 0.7, 1] });
    else b.ico(0.058, 0, [0, 0.335, 0], PAL.ink, { amt: 0.3, scale: [1, 0.55, 1] });
    return b.geo();
  }
  function rifleGeo() {      // M16: coronha, corpo, cano, carregador
    const b = B(41);
    b.box(0.30, 0.032, 0.026, [0, 0, 0], PAL.iron, { shade: 0.2 });
    b.box(0.09, 0.04, 0.03, [-0.19, -0.004, 0], PAL.iron);
    b.box(0.2, 0.014, 0.014, [0.24, 0.004, 0], PAL.iron);
    b.box(0.03, 0.07, 0.02, [0.02, -0.05, 0], PAL.iron, { rot: [0, 0, 0.18] });
    b.box(0.12, 0.014, 0.024, [-0.02, 0.026, 0], PAL.iron);
    return b.geo();
  }

  // ---------------------------------------------------------------- CH-53
  function heliParts() {
    const body = B(11);
    const fus = new THREE.BoxGeometry(3.0, 0.86, 0.78, 3, 1, 1);
    { const p = fus.attributes.position; for (let i = 0; i < p.count; i++) if (p.getX(i) < -1.4) { p.setY(i, p.getY(i) * 0.7 - 0.06); p.setZ(i, p.getZ(i) * 0.7); } }
    body.raw(fus, [0, 0.56, 0], PAL.olive, { amt: 0.6 });
    body.box(1.0, 0.32, 0.2, [0.3, 0.3, 0.5], PAL.oliveDark); body.box(1.0, 0.32, 0.2, [0.3, 0.3, -0.5], PAL.oliveDark);   // sponsons
    body.box(0.5, 0.2, 0.05, [-1.25, 0.8, 0.28], PAL.glass, { amt: 0.3 }); body.box(0.5, 0.2, 0.05, [-1.25, 0.8, -0.28], PAL.glass, { amt: 0.3 });
    body.box(0.34, 0.2, 0.05, [-0.78, 0.82, 0.4], PAL.glass, { amt: 0.3 }); body.box(0.34, 0.2, 0.05, [-0.78, 0.82, -0.4], PAL.glass, { amt: 0.3 });
    body.box(1.1, 0.3, 0.5, [-0.05, 1.12, 0], PAL.oliveDark);                           // motores
    body.box(1.7, 0.42, 0.36, [2.2, 0.88, 0], PAL.olive, { rot: [0, 0, 0.1] });          // cauda
    body.box(0.5, 0.9, 0.1, [3.0, 1.25, 0], PAL.oliveDark, { rot: [0, 0, -0.35] });
    body.cyl(0.05, 0.07, 0.3, 6, [-0.1, 1.42, 0], PAL.iron);
    for (const [x, z] of [[-0.85, 0.34], [-0.85, -0.34], [0.7, 0.55], [0.7, -0.55]]) {
      body.cyl(0.12, 0.12, 0.1, 8, [x, 0.14, z], PAL.iron, { rot: [Math.PI / 2, 0, 0] });
      body.cyl(0.02, 0.02, 0.2, 4, [x, 0.26, z * 0.9], PAL.iron);
    }
    body.box(0.2, 0.05, 0.1, [-1.0, 0.98, 0], PAL.accent, { amt: 0.2 });                   // faixa de identificação
    const rotor = B(12);
    for (let k = 0; k < 5; k++) {
      const a = k * Math.PI * 2 / 5;
      rotor.box(1.95, 0.02, 0.15, [Math.cos(a) * 1.0, 0, -Math.sin(a) * 1.0], '#3a3c34', { rot: [0, a, 0], shade: 0.05 });
      rotor.box(0.2, 0.021, 0.15, [Math.cos(a) * 1.9, 0, -Math.sin(a) * 1.9], PAL.sand, { rot: [0, a, 0], shade: 0.05, amt: 0.2 });
    }
    rotor.cyl(0.1, 0.1, 0.08, 6, [0, 0, 0], PAL.iron);
    const tail = B(13);
    for (let k = 0; k < 2; k++) tail.box(0.52, 0.05, 0.02, [0, 0, 0], '#3a3c34', { rot: [0, 0, k * Math.PI / 2] });
    const ramp = B(14);
    ramp.box(0.72, 0.04, 0.6, [0.36, 0, 0], PAL.oliveDark);
    return { body: body.mesh(), rotor: rotor.mesh({ cast: false }), tail: tail.mesh({ cast: false }), ramp: ramp.mesh() };
  }

  // ---------------------------------------------------------------- T-54
  function tankMesh() {
    const hull = B(21);
    const h = new THREE.BoxGeometry(1.9, 0.34, 0.95, 2, 1, 1);
    { const p = h.attributes.position; for (let i = 0; i < p.count; i++) if (p.getX(i) > 0.8 && p.getY(i) > 0) p.setY(i, p.getY(i) - 0.14); }
    hull.raw(h, [0, 0.33, 0], PAL.olive, { amt: 0.7 });
    hull.box(1.95, 0.22, 0.2, [0, 0.14, 0.52], PAL.track, { shade: 0.05 }); hull.box(1.95, 0.22, 0.2, [0, 0.14, -0.52], PAL.track, { shade: 0.05 });
    for (const z of [0.52, -0.52]) for (let i = 0; i < 5; i++) hull.cyl(0.11, 0.11, 0.22, 8, [-0.75 + i * 0.38, 0.15, z], '#4d4d49', { rot: [Math.PI / 2, 0, 0], amt: 0.4 });
    hull.box(1.9, 0.04, 0.3, [0, 0.34, 0.52], PAL.oliveDark); hull.box(1.9, 0.04, 0.3, [0, 0.34, -0.52], PAL.oliveDark);
    hull.box(0.3, 0.2, 0.22, [-0.9, 0.46, 0.2], PAL.oliveDark);                       // grade do motor
    hull.ico(0.4, 1, [-0.1, 0.62, 0], PAL.olive, { scale: [1.05, 0.45, 0.9], jit: 0.015, amt: 0.7 });
    hull.cyl(0.11, 0.11, 0.05, 6, [-0.2, 0.78, 0.1], PAL.oliveDark);
    hull.box(0.22, 0.2, 0.34, [0.4, 0.62, 0], PAL.oliveDark);
    hull.cyl(0.05, 0.05, 1.3, 6, [1.05, 0.64, 0], PAL.oliveDark, { rot: [0, 0, Math.PI / 2] });
    hull.cyl(0.07, 0.07, 0.18, 6, [1.62, 0.64, 0], PAL.oliveDark, { rot: [0, 0, Math.PI / 2] });
    hull.box(0.1, 0.08, 0.1, [0.15, 0.86, -0.18], PAL.accent, { amt: 0.2 });          // marca de identificação
    return hull.mesh();
  }

  // ---------------------------------------------------------------- portão
  function gateLeaf() {
    const b = B(31);
    b.box(0.05, 0.05, 0.9, [0, 0.025, 0], PAL.iron); b.box(0.05, 0.05, 0.9, [0, 0.675, 0], PAL.iron);
    b.box(0.05, 0.7, 0.05, [0, 0.35, 0.425], PAL.iron); b.box(0.05, 0.7, 0.05, [0, 0.35, -0.425], PAL.iron);
    for (let i = -3; i <= 3; i++) b.box(0.03, 0.62, 0.03, [0, 0.35, i * 0.12], PAL.iron);
    b.box(0.06, 0.16, 0.16, [0, 0.4, 0], '#d9a441', { amt: 0.3 });
    return b.mesh();
  }

  // ---------------------------------------------------------------- placa de papel (bandeira) no mundo
  function flag(num, word, { height = 1.25, side = 1, BH = 0.64 } = {}) {
    const PXH = 250, u = BH / PXH, gap = num ? 34 : 0, pad = 50, notch = 70;
    const meas = document.createElement('canvas').getContext('2d'); meas.font = FONT; meas.letterSpacing = '7px';
    const wn = num ? meas.measureText(String(num)).width : 0, ww = meas.measureText(word).width, W = Math.ceil(pad + wn + gap + ww + pad + notch);
    const x0 = side > 0 ? pad : notch + pad;
    const tex = K.canvasTex(W, PXH, (ctx) => {
      ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, PXH);
      ctx.font = FONT; ctx.letterSpacing = '7px'; ctx.textBaseline = 'alphabetic';
      if (num) { ctx.fillStyle = PAL.accent; ctx.fillText(String(num), x0, PXH / 2 + 56); }
      ctx.fillStyle = PAL.ink; ctx.fillText(word, x0 + wn + gap, PXH / 2 + 56);
    });
    const w = W * u, s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w - notch * u, BH / 2); s.lineTo(w, BH); s.lineTo(0, BH); s.closePath();
    const sg = new THREE.ShapeGeometry(s), uv = sg.attributes.uv, sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const fx = sp.getX(i) / w; uv.setXY(i, side > 0 ? fx : 1 - fx, sp.getY(i) / BH); if (side < 0) sp.setX(i, -sp.getX(i)); }
    if (side < 0) sg.index.array.reverse();
    const board = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.3, roughness: 0.95, side: THREE.DoubleSide }));
    board.position.set(0, height - BH - 0.05, 0.03); board.castShadow = true; board.receiveShadow = true;
    const pg = new THREE.CylinderGeometry(0.022, 0.022, height, 5); pg.translate(0, height / 2, 0);
    const pole = new THREE.Group();
    const pin = new THREE.Mesh(facet(pg, () => new THREE.Color(PAL.ink)), MAT); pin.castShadow = true;
    const head = new THREE.Mesh(facet(new THREE.IcosahedronGeometry(0.075, 0), (c, n, i) => tone(PAL.accent, i, 0.7)), MAT); head.position.y = height + 0.04; head.castShadow = true;
    pole.add(pin, head, board);
    const group = new THREE.Group(); group.add(pole);
    const pop = (t, t0, t1 = 1e9) => {
      const a = K.spring(t - t0, 2.6, 0.38), b = K.spring(t - t0 - 0.14, 2.1, 0.42), o = K.seg(t, t1, t1 + 0.3, K.ease.in);
      group.visible = t > t0 && t < t1 + 0.32;
      pole.scale.set(1, Math.max(0.001, a * (1 - o)), 1);
      board.rotation.y = side * (1 - b) * -1.9 + side * o * 1.6;
      board.scale.set(Math.max(0.001, K.seg(t, t0 + 0.12, t0 + 0.34, K.ease.out) * (1 - o)), 1, 1);
    };
    return { group, pop };
  }

  return {
    id: 'ps-lowpoly-saigon',
    name: 'Low-Poly: a queda de Saigon',
    family: 'Filters over 3D',
    duration: 15,
    fonts: [FONT],
    render: { samples: 40, shutter: 0.4, tone: 'neutral', exposure: 1.0, bloom: 0.3, bloomThreshold: 1.25, vignette: 0.2, grain: 0.012, fov: 30, near: 0.5, far: 400, background: PAL.haze, shadows: true },

    build(S) {
      const { THREE, K, scene, camera } = S;
      const N = K.noise(7), smooth = K.smooth;

      // ------------------------------------------------------------ luz, céu, névoa
      const SUN = new THREE.Vector3(-0.62, 0.55, 0.45).normalize();
      K.env(S, { top: '#7db7dd', horizon: '#ffe2c4', bottom: '#8fa98a', intensity: 0.55, panels: [{ pos: [SUN.x * 30, SUN.y * 30, SUN.z * 30], size: [10, 10], color: PAL.sun, power: 14, round: true }] });
      K.sun(S, { pos: [2 + SUN.x * 50, SUN.y * 50, SUN.z * 50], target: [2, 0, 0], color: '#ffe0ba', power: 3.5, size: 20, soft: 2.0, mapSize: 4096, far: 130, normalBias: 0.03 });
      K.skyLight(S, { color: '#a9c9ff', power: 0.9, size: 20, center: [2, 1, 0], mapSize: 2048, spread: 0.9 });
      scene.fog = new THREE.Fog(PAL.haze, 24, 90);
      const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { top: { value: new THREE.Color(PAL.skyTop) }, pale: { value: new THREE.Color(PAL.skyPale) }, haze: { value: new THREE.Color(PAL.haze) }, sunC: { value: new THREE.Color(PAL.sun) }, sunDir: { value: SUN } },
        vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `varying vec3 vD; uniform vec3 top, haze, pale, sunC, sunDir;
          void main(){ vec3 d = normalize(vD); float s = max(dot(d, sunDir), 0.0);
            float y = max(d.y, 0.0);
            vec3 c = mix(mix(haze, pale, smoothstep(0.0, 0.12, y)), top, smoothstep(0.06, 0.5, y));
            c += sunC * (pow(s, 5.0) * 0.35 + pow(s, 40.0) * 0.8);
            gl_FragColor = vec4(c, 1.0); }`,
      }));
      scene.add(sky);

      // ------------------------------------------------------------ chão facetado
      const hero = (x, z) => Math.max(Math.abs(x - 1.5) - 17, Math.abs(z + 0.5) - 9, 0);
      const gh = (x, z) => { const d = hero(x, z); return d <= 0 ? 0 : smooth(0, 14, d) * (1.2 + 2.6 * (0.5 + 0.5 * N.fbm(x * 0.12, z * 0.12, 3, 3))); };
      {
        const g = new THREE.PlaneGeometry(150, 110, 100, 73); g.rotateX(-Math.PI / 2); g.translate(2, 0, -14);
        jitter(g, 0.28, 3);
        const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, gh(p.getX(i), p.getZ(i)) + (hero(p.getX(i), p.getZ(i)) <= 0 ? 0 : (K.hash(i, 5) - 0.5) * 0.25));
        const land = new THREE.Mesh(facet(g, (c, n, i) => {
          const d = hero(c.x, c.z), base = d > 3 ? (K.hash(Math.floor(c.x * 0.25), Math.floor(c.z * 0.25)) > 0.5 ? PAL.meadow : PAL.hill) : (K.hash(Math.floor(c.x * 0.5), Math.floor(c.z * 0.5), 2) > 0.5 ? PAL.grass : PAL.meadow);
          return tone(base, i * 1.3 + c.x * 3.1, 1.2).lerp(new THREE.Color(PAL.haze), smooth(8, 40, d) * 0.25);
        }), MAT);
        land.receiveShadow = true; scene.add(land);
      }

      // ------------------------------------------------------------ rua, calçadas, avenida
      {
        const r = B(51);
        r.box(12.8, 0.05, 1.3, [0, 0.025, 0], PAL.road, { amt: 0.5, shade: 0.05 });
        r.box(3.4, 0.05, 1.3, [GATE_X + 1.7, 0.026, 0], PAL.stone, { amt: 0.5, shade: 0.05 });
        r.box(12.8, 0.08, 0.28, [0, 0.04, 0.79], PAL.creamDark, { amt: 0.5 }); r.box(12.8, 0.08, 0.28, [0, 0.04, -0.79], PAL.creamDark, { amt: 0.5 });
        for (let i = 0; i < 14; i++) r.box(0.42, 0.012, 0.05, [-5.9 + i * 0.9, 0.058, 0], PAL.roadLine, { amt: 0.2 });
        scene.add(r.mesh({ cast: false }));
      }
      // postes de luz do lado da câmera (finos, não escondem o tanque)
      {
        const l = B(52);
        for (let i = 0; i < 6; i++) { const x = -4.6 + i * 2.1; l.cyl(0.018, 0.024, 0.8, 5, [x, 0.4, 1.05], PAL.iron); l.box(0.1, 0.04, 0.07, [x + 0.03, 0.82, 1.05], '#f6d98a', { amt: 0.2 }); }
        scene.add(l.mesh());
      }

      // ------------------------------------------------------------ prédio do telhado (helicóptero)
      const BX = -9, BZ = -1;
      {
        const b = B(61);
        b.box(6.4, ROOF, 5.2, [BX, ROOF / 2, BZ], PAL.cream, { amt: 0.6, shade: 0.05 });
        // parapeito
        b.box(6.4, 0.12, 0.1, [BX, ROOF + 0.06, BZ + 2.55], PAL.creamDark); b.box(6.4, 0.12, 0.1, [BX, ROOF + 0.06, BZ - 2.55], PAL.creamDark);
        b.box(0.1, 0.12, 5.2, [BX - 3.15, ROOF + 0.06, BZ], PAL.creamDark); b.box(0.1, 0.12, 5.2, [BX + 3.15, ROOF + 0.06, BZ], PAL.creamDark);
        // janelas na fachada de frente e na lateral
        for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) b.box(0.4, 0.34, 0.05, [BX - 2.55 + c * 1.02, 0.5 + r * 0.7, BZ + 2.62], c === 2 && r === 1 ? '#f6d98a' : PAL.slate, { amt: 0.4 });
        for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) b.box(0.05, 0.34, 0.4, [BX + 3.22, 0.5 + r * 0.7, BZ - 1.8 + c * 1.2], PAL.slate, { amt: 0.4 });
        // heliponto com H
        b.cyl(1.65, 1.65, 0.03, 18, [HELI_X, ROOF + 0.015, HELI_Z], '#7c7f86', { amt: 0.5, shade: 0.05 });
        b.box(0.12, 0.02, 0.9, [HELI_X - 0.35, ROOF + 0.04, HELI_Z], PAL.cream, { amt: 0.2 }); b.box(0.12, 0.02, 0.9, [HELI_X + 0.35, ROOF + 0.04, HELI_Z], PAL.cream, { amt: 0.2 }); b.box(0.82, 0.02, 0.12, [HELI_X, ROOF + 0.04, HELI_Z], PAL.cream, { amt: 0.2 });
        // casa da escada e caixa d'água
        b.box(1.1, 0.5, 0.9, [BX - 2.4, ROOF + 0.25, BZ - 1.9], PAL.creamDark); b.box(1.2, 0.05, 1.0, [BX - 2.4, ROOF + 0.52, BZ - 1.9], PAL.stone);
        b.cyl(0.3, 0.3, 0.5, 8, [BX + 2.3, ROOF + 0.62, BZ - 1.9], PAL.coral, { amt: 0.5 }); for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) b.cyl(0.02, 0.02, 0.37, 4, [BX + 2.3 + dx, ROOF + 0.185, BZ - 1.9 + dz], PAL.iron);
        // escada externa, degrau por degrau
        for (let i = 0; i < 9; i++) { const hgt = (i + 1) * ROOF / 9; b.box(3.4 / 9, hgt, 0.7, [-11.7 + (i + 0.5) * 3.4 / 9, hgt / 2, 2.0], PAL.stone, { amt: 0.6, shade: 0.06 }); }
        b.box(1.8, ROOF, 0.7, [-7.4, ROOF / 2, 2.0], PAL.stone, { amt: 0.6 });          // patamar
        for (let i = 0; i <= 4; i++) { const x = -11.7 + i * 0.85, y = ROOF * i / 4; b.cyl(0.015, 0.015, 0.34, 4, [x, y + 0.17 + 0.05, 2.36], PAL.iron); }
        b.box(3.7, 0.025, 0.025, [-9.95, ROOF / 2 + 0.4, 2.36], PAL.iron, { rot: [0, 0, Math.atan2(ROOF, 3.4)] });
        scene.add(b.mesh());
      }
      // prédios da cidade ao fundo (alturas e tons variados)
      {
        const c = B(62);
        const defs = [[-15.5, -7.5, 3.4, 2.2, 1.6, PAL.coral], [-12, -8, 2.4, 2.6, 1.3, PAL.sand], [-8, -8.2, 3.0, 2.8, 1.8, PAL.cream], [-4.4, -7.2, 2.6, 2.4, 1.4, PAL.teal], [-0.6, -7.5, 3.2, 2.6, 1.9, PAL.sand],
          [3.4, -7.0, 2.2, 2.4, 1.2, PAL.cream], [-15, 1.0, 2.2, 2.2, 1.7, PAL.sand], [-14.5, 4.6, 2.4, 2.4, 1.3, PAL.cream], [-3.5, -4.2, 1.7, 2.2, 1.0, PAL.coral], [0.5, -4.3, 1.4, 2.0, 0.9, PAL.sand],
          [3.8, -4.6, 1.5, 1.8, 1.1, PAL.cream], [-1.5, 5.2, 1.5, 2.2, 0.9, PAL.sand], [2.5, 6.4, 1.8, 2.0, 1.1, PAL.cream]];
        defs.forEach(([x, z, w, d, h, col], i) => {
          c.box(w, h, d, [x, h / 2, z], col, { amt: 0.9, shade: 0.06 });
          c.box(w + 0.12, 0.07, d + 0.12, [x, h + 0.035, z], PAL.creamDark, { amt: 0.5 });
          for (let k = 0; k < Math.floor(w / 0.55); k++) c.box(0.26, 0.26, 0.04, [x - w / 2 + 0.4 + k * 0.55, h * 0.55, z + d / 2 + 0.02], PAL.slate, { amt: 0.4 });
        });
        scene.add(c.mesh());
      }

      // ------------------------------------------------------------ cerca, portão, palácio
      const leaves = [];
      {
        const f = B(71);
        for (const sg of [1, -1]) {
          f.box(0.2, 0.34, 3.3, [GATE_X, 0.17, sg * 2.65], PAL.cream, { amt: 0.5 });
          for (let i = 0; i < 12; i++) f.box(0.03, 0.3, 0.03, [GATE_X, 0.49, sg * (1.15 + i * 0.27)], PAL.iron);
          f.box(0.06, 0.03, 3.3, [GATE_X, 0.65, sg * 2.65], PAL.iron);
          f.box(0.26, 0.78, 0.26, [GATE_X, 0.39, sg * 1.03], PAL.stone, { amt: 0.5 }); f.box(0.32, 0.07, 0.32, [GATE_X, 0.8, sg * 1.03], PAL.creamDark);
          f.box(0.2, 0.34, 0.9, [GATE_X, 0.17, sg * 4.55], PAL.cream, { amt: 0.5 });
        }
        scene.add(f.mesh());
        for (const sg of [1, -1]) { const piv = new THREE.Group(); piv.position.set(GATE_X, 0.05, sg * 0.95); const fall = new THREE.Group(); const m = gateLeaf(); m.position.z = -sg * 0.45; fall.add(m); piv.add(fall); scene.add(piv); leaves.push({ piv, fall, sg }); }
      }
      {
        const p = B(72), X0 = 9.2, X1 = 14.6, Z = 0;
        p.box(X1 - X0 + 0.6, 0.28, 7.8, [(X0 + X1) / 2, 0.14, Z], PAL.stone, { amt: 0.5 });
        for (let i = 0; i < 6; i++) p.box(0.5, 0.06 * (i + 1), 2.6, [X0 - 0.3 - (5 - i) * 0 - (5 - i) * 0.0 + 0.0 - i * 0.0, 0.02 * (i + 1), Z], PAL.creamDark, { amt: 0.3 });
        // térreo aberto com pilares
        for (let k = 0; k < 8; k++) { const z = -3.25 + k * 0.93; p.box(0.22, 0.78, 0.22, [X0 + 0.5, 0.28 + 0.39, z], PAL.cream, { amt: 0.4 }); }
        p.box(X1 - X0 - 0.5, 0.78, 6.6, [(X0 + X1) / 2 + 0.5, 0.67, Z], PAL.creamDark, { amt: 0.5 });
        p.box(1.5, 0.78, 2.2, [X0 + 1.2, 0.67, Z], PAL.glass, { amt: 0.3 });                   // saguão
        // pavimento nobre com brise vertical
        p.box(X1 - X0 + 0.2, 0.1, 7.2, [(X0 + X1) / 2 + 0.1, 1.11, Z], PAL.cream, { amt: 0.4 });
        p.box(X1 - X0 - 0.7, 0.72, 6.4, [(X0 + X1) / 2 + 0.55, 1.52, Z], PAL.slate, { amt: 0.4 });
        for (let k = 0; k < 17; k++) p.box(0.12, 0.72, 0.1, [X0 + 0.38, 1.52, -3.2 + k * 0.4], PAL.cream, { amt: 0.4 });
        p.box(X1 - X0 + 0.4, 0.12, 7.0, [(X0 + X1) / 2 + 0.2, 1.94, Z], PAL.cream, { amt: 0.4 });
        // andar superior menor + terraço
        p.box(3.2, 0.6, 4.4, [(X0 + X1) / 2 + 0.8, 2.3, Z], PAL.creamDark, { amt: 0.5 });
        for (let k = 0; k < 9; k++) p.box(0.1, 0.6, 0.08, [(X0 + X1) / 2 - 0.82, 2.3, -2.0 + k * 0.5], PAL.cream, { amt: 0.4 });
        p.box(3.6, 0.1, 4.8, [(X0 + X1) / 2 + 0.8, 2.65, Z], PAL.cream, { amt: 0.4 });
        p.cyl(0.9, 0.9, 0.06, 14, [(X0 + X1) / 2 + 1.5, 2.73, 0.4], PAL.stone, { amt: 0.4 });
        scene.add(p.mesh());
      }

      // ------------------------------------------------------------ vegetação instanciada
      {
        const excl = (x, z) => (x > -13 && x < -5 && z > -4.2 && z < 4.6) || (x > -7.5 && x < 9.2 && Math.abs(z) < 1.5) || (x > 8.2 && x < 16 && z > -4.8 && z < 4.6) || (x > 2.2 && x < 6.8 && z > 2.3 && z < 3.8)
          || defsHit(x, z);
        function defsHit(x, z) { return (x > -17 && x < -2 && z < -5.5 && z > -9.5) || (x > -16.5 && x < -13 && z > -0.3 && z < 6.2) || (x > 1.4 && x < 5 && z < -3.4 && z > -8.5) || (x > -4.6 && x < 4 && z > 4.2 && z < 7.6) || (x > -4.8 && x < 2.2 && z > -5.2 && z < -3.0); }
        const rng = K.rng(5), spots = [];
        let tries = 0;
        while (spots.length < 85 && tries++ < 3000) {
          const x = rng.range(-22, 28), z = rng.range(-26, 14);
          if (excl(x, z)) continue;
          const far = hero(x, z) > 0;
          if (!far && rng() < 0.5) continue;
          spots.push({ x, z, y: gh(x, z), s: far ? rng.range(1.1, 2.2) : rng.range(0.85, 1.3), k: rng() < 0.45 ? 0 : rng() < 0.6 ? 1 : 2, rot: rng.range(0, 6.28), lean: rng.range(-0.05, 0.05) });
        }
        const kinds = [pineGeo(81), treeGeo(82, PAL.leaf), treeGeo(83, PAL.forest)];
        kinds.forEach((geo, k) => {
          const mine = spots.filter((s) => s.k === k), im = new THREE.InstancedMesh(geo, MAT, Math.max(1, mine.length));
          mine.forEach((s, i) => K.place(im, i, [s.x, s.y, s.z], [s.lean, s.rot, s.lean * 0.7], s.s));
          im.count = mine.length; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; im.instanceMatrix.needsUpdate = true; scene.add(im);
        });
        // colinas ao longe: cones recortados
        const hl = B(91);
        [[-30, -34, 7, 13], [-8, -40, 9, 16], [16, -38, 8, 14], [34, -30, 9, 15], [-44, -20, 6, 12], [48, -14, 7, 13], [4, -52, 12, 20]].forEach(([x, z, h, r], i) => hl.cone(r, h, 7, [x, h / 2 - 0.4, z], i % 2 ? PAL.hill : PAL.hillFar, { jit: 0.9, amt: 1.2, shade: 0.1 }));
        scene.add(hl.mesh({ cast: false }));
      }

      // ------------------------------------------------------------ helicóptero
      const hp = heliParts();
      const heli = new THREE.Group(), mast = new THREE.Group(), tailRot = new THREE.Group(), rampPiv = new THREE.Group();
      heli.add(hp.body);
      mast.position.set(-0.1, 1.6, 0); mast.add(hp.rotor); heli.add(mast);
      tailRot.position.set(3.15, 1.35, 0.1); tailRot.add(hp.tail); heli.add(tailRot);
      rampPiv.position.set(1.5, 0.3, 0); rampPiv.add(hp.ramp); heli.add(rampPiv);
      scene.add(heli);
      const heliAt = (t) => {
        const land = K.seg(t, 0, T.land, K.ease.out), up = K.seg(t, T.lift, T.lift + 1.9, (u) => u * u * (3 - 2 * u) * 0.5 + u * 0.5);
        const y = ROOF + 0.02 + 2.0 * (1 - land) + 4.6 * up;
        return { x: HELI_X - 0.5 * (1 - land) - 2.4 * up, y, z: HELI_Z + 0.35 * (1 - land) - 4.2 * Math.pow(up, 1.4), pitch: -0.1 * (1 - land) * land * 3 + 0.2 * K.smooth(T.lift + 0.3, T.lift + 1.5, t), yaw: 0.35 * up };
      };

      // ------------------------------------------------------------ pessoas na escada
      const WP = [[-11.7, 0, 2.0], [-8.3, ROOF, 2.0], [-6.9, ROOF, 1.9], [-6.95, ROOF, -1.0], [-7.7, ROOF + 0.3, -1.0], [-8.5, ROOF + 0.3, -1.0]];
      const CUM = [0]; for (let i = 1; i < WP.length; i++) CUM.push(CUM[i - 1] + Math.hypot(WP[i][0] - WP[i - 1][0], WP[i][1] - WP[i - 1][1], WP[i][2] - WP[i - 1][2]));
      const pathAt = (s) => {
        s = K.clamp(s, 0, CUM[CUM.length - 1]); let i = 1; while (i < CUM.length - 1 && CUM[i] < s) i++;
        const u = (s - CUM[i - 1]) / (CUM[i] - CUM[i - 1]), a = WP[i - 1], b = WP[i];
        return { p: [K.lerp(a[0], b[0], u), K.lerp(a[1], b[1], u), K.lerp(a[2], b[2], u)], d: [b[0] - a[0], b[2] - a[2]] };
      };
      const SHIRTS = [PAL.coral, PAL.cream, PAL.teal, '#e0a646', PAL.cream, PAL.coral];
      const PANTS = [PAL.ink, PAL.khakiDark, PAL.ink, PAL.slate, PAL.ink, PAL.khakiDark];
      // s0 posição na fila, t0 quando começa a andar, v velocidade, sMax até onde vai
      const QUEUE = [
        { s0: 8.0, t0: 1.45, v: 1.15, sMax: CUM[5], board: true },
        { s0: 7.0, t0: 1.55, v: 1.15, sMax: CUM[5], board: true },
        { s0: 6.0, t0: 1.8, v: 1.1, sMax: 7.35, board: false },
        { s0: 4.9, t0: 1.0, v: 0.9, sMax: 6.45, board: false },
        { s0: 3.7, t0: 0.2, v: 0.85, sMax: 5.55, board: false },
        { s0: 2.2, t0: 0.0, v: 0.8, sMax: 4.65, board: false },
      ].map((q, i) => { const g = new THREE.Mesh(personGeo(SHIRTS[i], PANTS[i], 100 + i, false), MAT); g.castShadow = true; scene.add(g); return Object.assign(q, { g }); });

      // ------------------------------------------------------------ tanque
      const tank = tankMesh(); scene.add(tank);
      const tankX = (t) => {
        if (t < T.tankHit) return 5.2 + 1.8 * (t - T.tankHit);
        const dt = Math.min(t - T.tankHit, 0.5); return 5.2 + 1.8 * dt - (1.8 / (2 * 0.5)) * dt * dt;
      };

      // ------------------------------------------------------------ poeira / estilhaços (low-poly)
      const SH = 30, shards = new THREE.InstancedMesh((() => { const g = new THREE.OctahedronGeometry(1, 0); return facet(g, (c, n, i) => tone(PAL.dust, i, 0.8)); })(), MAT, SH);
      shards.castShadow = false; shards.frustumCulled = false; scene.add(shards);
      const rs = K.rng(9);
      const BURSTS = [
        { t0: T.lift - 0.05, o: [HELI_X, ROOF + 0.06, HELI_Z], n: 14, sp: 1.9, up: 0.9, r0: 1.1 },
        { t0: T.tankHit, o: [GATE_X + 0.25, 0.12, 0], n: 16, sp: 1.5, up: 1.7, r0: 0.5 },
      ];
      const SHARD = []; BURSTS.forEach((b, bi) => { for (let i = 0; i < b.n; i++) { const a = rs() * 6.283; SHARD.push({ b: bi, a, v: b.sp * (0.5 + rs() * 0.6), vy: b.up * (0.3 + rs() * 0.8), s: 0.035 + rs() * 0.05, spin: rs() * 6 }); } });

      // ------------------------------------------------------------ soldados e fuzis
      const SOLD = [[3.2, 3.5], [4.0, 3.65], [4.8, 3.5], [5.6, 3.65]].map(([x, z], i) => {
        const g = new THREE.Mesh(personGeo(PAL.khaki, PAL.khakiDark, 200 + i, true), MAT); g.castShadow = true; scene.add(g);
        const r = new THREE.Mesh(rifleGeo(), MAT); r.castShadow = true; scene.add(r);
        return { x, z, g, r, t0: 13.0 + i * 0.1, lay: T.lay[i], face: -Math.PI / 2 + (i % 2 ? 0.2 : -0.15) };
      });

      // ------------------------------------------------------------ Duong Van Minh: silhueta e placa
      const MX = 10.2, MZ = 5.3;
      {
        const m = B(111);
        m.cyl(0.48, 0.55, 0.14, 10, [MX, 0.07, MZ], PAL.stone, { amt: 0.5 });
        m.cyl(0.14, 0.22, 0.55, 6, [MX, 0.14 + 0.275, MZ], PAL.ink, { amt: 0.3, shade: 0.25 });
        m.cyl(0.05, 0.06, 0.07, 6, [MX, 0.14 + 0.585, MZ], PAL.ink, { amt: 0.3 });
        m.ico(0.115, 1, [MX, 0.14 + 0.72, MZ], PAL.ink, { amt: 0.3, jit: 0.01, shade: 0.25 });
        scene.add(m.mesh());
      }
      const flagDate1 = flag('29', 'DE ABRIL · SAIGON', { height: 1.9, side: 1, BH: 0.8 }); flagDate1.group.position.set(-8.2, 0, 4.2); scene.add(flagDate1.group);
      const flagDate2 = flag('30', 'DE ABRIL', { height: 1.75, side: 1, BH: 0.7 }); flagDate2.group.position.set(3.0, 0, -1.7); scene.add(flagDate2.group);
      const flagName = flag('', 'DUONG VAN MINH', { height: 1.5, side: 1, BH: 0.5 }); flagName.group.position.set(MX + 0.75, 0, MZ); scene.add(flagName.group);
      const flagDays = flag('2', 'DIAS NO CARGO', { height: 1.5, side: 1, BH: 0.5 }); flagDays.group.position.set(MX + 0.75, 0, MZ); scene.add(flagDays.group);

      // ------------------------------------------------------------ câmera: uma viagem contínua, do telhado ao palácio
      const cam = {
        pos: K.path([[0, [-8.4, 6.3, 11.8]], [3.5, [-8.8, 6.6, 11.9]], [4.9, [-6.0, 5.2, 10.0]], [6.3, [-1.0, 3.0, 6.4]], [8.0, [-0.2, 3.3, 5.4]], [8.8, [0.2, 3.4, 5.6]], [9.7, [5.0, 3.0, 9.6]], [10.6, [9.2, 2.0, 9.4]], [12.4, [9.8, 2.0, 9.2]], [13.3, [4.4, 1.7, 7.0]], [14.2, [4.3, 1.6, 6.7]], [15, [3.6, 3.4, 11.0]]]),
        aim: K.path([[0, [-9.0, 1.5, 0.6]], [3.5, [-9.0, 2.4, -0.4]], [4.2, [-9.0, 3.2, -1.0]], [4.9, [-4.0, 1.0, 0.5]], [6.3, [3.6, 0.5, 0]], [8.0, [6.4, 0.35, 0]], [8.8, [6.6, 0.35, 0]], [9.7, [8.4, 0.8, 3.0]], [10.6, [10.6, 0.8, 5.1]], [12.4, [10.9, 0.8, 5.1]], [13.3, [4.3, 0.4, 3.6]], [14.2, [4.3, 0.4, 3.6]], [15, [5.9, 0.7, 1.8]]]),
        fov: K.track([[0, 40], [4.9, 38], [6.3, 30], [10, 30], [13, 32], [15, 34]]),
        ap: K.track([[0, 0.05], [15, 0.05]]),
      };

      return {
        update(t) {
          // helicóptero
          const h = heliAt(t); heli.position.set(h.x, h.y, h.z); heli.rotation.set(0, h.yaw, h.pitch);
          mast.rotation.y = t * 38; tailRot.rotation.z = t * 44;
          rampPiv.rotation.z = Math.PI / 2 - (Math.PI / 2 + 0.35) * K.seg(t, 1.2, 1.55, K.ease.out) + (Math.PI / 2 + 0.35) * K.seg(t, 3.15, 3.45, K.ease.in);
          // fila na escada
          QUEUE.forEach((q) => {
            const s = Math.min(q.sMax, q.s0 + q.v * Math.max(0, t - q.t0)), P = pathAt(s), moving = s < q.sMax - 0.001 && t > q.t0;
            q.g.visible = s < CUM[4] + 0.55 || !q.board;
            const bob = moving ? 0.014 * Math.abs(Math.sin(t * 10 + q.s0)) : 0, ang = Math.atan2(-P.d[1], P.d[0]);
            q.g.position.set(P.p[0], P.p[1] + bob, P.p[2]); q.g.rotation.set(0, ang, moving ? 0.05 * Math.sin(t * 10 + q.s0) : 0);
            if (q.board && s > CUM[3] + 0.05) q.g.rotation.x = 0;
          });
          // tanque
          const tx = tankX(t), sp = t < T.tankHit ? 1.8 : Math.max(0, 1.8 * (1 - (t - T.tankHit) / 0.5));
          tank.visible = t > 4.0;
          tank.position.set(tx, 0.03, 0); tank.rotation.set(0, 0, 0.012 * Math.sin(t * 17) * (sp > 0.1 ? 1 : 0.2) - (t > T.tankHit && t < T.tankHit + 0.25 ? 0.03 : 0));
          // portão: as duas folhas caem para dentro, no peso do tanque
          leaves.forEach((L, i) => {
            const sw = K.seg(t, T.tankHit, T.tankHit + 0.3, K.ease.outBack), fl = K.seg(t, T.tankHit + 0.08, T.tankHit + 0.62, K.ease.outBounce);
            L.piv.rotation.set(0, -L.sg * (Math.PI / 2 + 0.05) * sw, 0);
            L.fall.rotation.set(0, 0, -(i ? 0.95 : 0.6) * fl);
          });
          // poeira: sobe e cai, encolhendo
          SHARD.forEach((s, i) => {
            const b = BURSTS[s.b], u = t - b.t0;
            if (u < 0 || u > 1.1) { K.place(shards, i, [0, -50, 0], [0, 0, 0], 0.0001); return; }
            const r = b.r0 * 0 + s.v * u, sc = s.s * (1 - K.smooth(0.55, 1.1, u)) * Math.min(1, u * 12);
            K.place(shards, i, [b.o[0] + Math.cos(s.a) * (0.15 + r), b.o[1] + s.vy * u - 1.6 * u * u, b.o[2] + Math.sin(s.a) * (0.15 + r)], [u * s.spin, u * s.spin * 0.7, 0], sc);
          });
          shards.instanceMatrix.needsUpdate = true;
          // soldados e fuzis: surgem do chão, baixam o fuzil na palavra
          SOLD.forEach((s, i) => {
            const a = K.spring(t - s.t0, 2.6, 0.4), bend = K.seg(t, s.lay - 0.28, s.lay + 0.02, K.ease.inOut) * (1 - K.seg(t, s.lay + 0.3, s.lay + 0.7, K.ease.inOut));
            s.g.visible = t > s.t0; s.g.position.set(s.x, 0, s.z); s.g.scale.set(Math.max(0.001, a), Math.max(0.001, a), Math.max(0.001, a));
            s.g.rotation.set(0, s.face, -0.55 * bend);
            s.r.visible = t > s.t0;
            const u = K.seg(t, s.lay - 0.05, s.lay + 0.3, K.ease.out), yawOn = s.face + 0.9;
            const hand = [s.x + 0.09 * Math.sin(-s.face + 0), 0.2, s.z + 0.075];
            const held = [s.x + 0.075, 0.26 + 0.07 * (1 - Math.max(0, a - 1) * 0), s.z + 0.095];
            const gnd = [s.x + 0.1 + 0.06 * i * 0.2, 0.02, s.z + 0.2];
            const pos = [K.lerp(held[0], gnd[0], u), K.lerp(held[1], gnd[1], u) + 0.07 * Math.sin(u * Math.PI), K.lerp(held[2], gnd[2], u)];
            s.r.position.set(pos[0], pos[1], pos[2]); s.r.rotation.set(0, K.lerp(0.3, 1.1 + i * 0.25, u), K.lerp(Math.PI / 2 - 0.15, 0, u));
            s.r.scale.setScalar(Math.max(0.001, a));
          });
          // placas de papel
          flagDate1.pop(t, 0.05, 4.65); flagDate2.pop(t, 5.1, 8.95);
          flagName.pop(t, T.nameIn, T.flipName + 0.05); flagDays.pop(t, T.flipName, T.nameOut);
          // câmera
          const p = cam.pos(t), a = cam.aim(t);
          K.look(camera, p, a, cam.fov(t)); K.focus(camera, a, cam.ap(t));
          sky.position.copy(camera.position);
        },
      };
    },

    sound(k) {
      const K = globalThis.K, r = K.rng(4);
      k.bed('room', 0, 15, { gain: 0.45 });
      // rotor: pulso grave, forte ao pousar e ao decolar
      for (let t = 0; t < T.heliOut; t += 0.17) {
        const settle = K.smooth(0.0, T.land, t) * (1 - 0.3 * K.smooth(T.land, T.lift, t)), lift = K.smooth(T.lift, T.lift + 0.3, t) * (1 - K.smooth(4.3, 4.9, t));
        k.tone(t, { f: [[0, 58], [0.08, 36]], dur: 0.15, gain: 0.05 * settle + 0.06 * lift, a: 0.01, pan: -0.25 });
      }
      k.noise(0.0, { dur: 4.9, color: 'brown', filter: 'lowpass', f: 260, gain: 0.035, a: 0.8, hold: 3.4 });
      k.play('thud', T.land, { gain: 0.35, f: 120, pan: -0.2 });
      for (let j = 0; j < 8; j++) k.play('tock', 1.5 + j * 0.13, { gain: 0.08, f: 560 + j * 20, pan: -0.3 });
      k.play('whoosh', T.lift, { gain: 0.4, dur: 0.8, top: 2200, pan: -0.2 });
      // tanque
      const d = T.tankStop - 5.0;
      for (const [f, g] of [[1, 0.045], [2.01, 0.02]]) k.tone(4.9, { f: [[0, 44 * f], [1.0, 72 * f], [2.4, 66 * f], [d, 58 * f]], type: 'sawtooth', dur: d + 0.4, a: 0.3, hold: d - 0.3, gain: g, filter: 'lowpass', f2: 380, pan: 0 });
      k.noise(4.9, { dur: d + 0.2, color: 'brown', filter: 'bandpass', f: 240, q: 0.9, gain: 0.05, a: 0.6, hold: d - 0.6 });
      for (let i = 0; i < 11; i++) k.play('tock', 5.2 + i * 0.26, { gain: 0.06, f: 190 + (i % 3) * 20 });
      k.play('impact', T.tankHit, { gain: 0.85 });
      for (let i = 0; i < 6; i++) k.play('tock', T.tankHit + 0.08 + i * 0.07, { gain: 0.2 - i * 0.02, f: 900 + i * 160, pan: 0.1 });
      k.play('thud', T.tankStop, { gain: 0.3, f: 90 });
      // placas
      const pf = (t, f, pan) => { k.play('pop', t, { gain: 0.6, f, pan }); k.play('swish', t + 0.1, { gain: 0.35, pan }); };
      pf(0.05, 620, -0.3); pf(5.1, 700, 0.1); pf(T.nameIn, 640, 0.25); pf(T.flipName, 780, 0.25);
      k.play('count', 12.2, { gain: 0.45, f: 5200, pan: 0.25 }); k.play('count', 12.34, { gain: 0.45, f: 5400, pan: 0.25 });
      // fuzis no chão
      T.lay.forEach((t, i) => { k.play('click', t + 0.02, { gain: 0.5, pan: -0.1 + i * 0.08 }); k.play('tock', t + 0.05, { gain: 0.4, f: 330, pan: -0.1 + i * 0.08 }); });
      k.tone(13.6, { f: 'D3', type: 'triangle', dur: 1.35, gain: 0.035, a: 0.3, hold: 0.7, filter: 'lowpass', f2: 700 });
    },
  };
})());
