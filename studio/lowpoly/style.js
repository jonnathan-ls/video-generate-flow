// style.js: estilo único do vídeo Vietnã em low-poly. Paleta, facetas, luz, grão, legenda e rótulos.
// Tudo é função pura de t. Expõe window.LP para actors.js e scenes/Sxx.js. Unidade do mundo: metro.
(function () {
  const LP = (window.LP = {});
  const { THREE, K } = window;

  // ---------------------------------------------------------------- paleta única do vídeo
  LP.PAL = {
    olive: '#6c7a4e', oliveDark: '#55633d', khaki: '#a09a6c', khakiDark: '#7e7a54', cream: '#f1e6d0', creamDark: '#d9c9ac',
    sand: '#ecd3a0', coral: '#e08a6c', teal: '#4f9aa5', slate: '#47707a', grass: '#a5bf66', meadow: '#86ad5c', forest: '#5d9160',
    trunk: '#7d5e4e', road: '#6d6b66', roadLine: '#f4ead6', stone: '#cdbfa6', iron: '#2f343b', ink: '#22303c', accent: '#e9684a',
    glass: '#2f4b57', skin: '#e6bb95', paper: '#fff6e4', brick: '#b3674d', brickDark: '#8c4f3c', roof: '#c4553d', water: '#4a8ca3',
    waterDeep: '#2f6a86', hullBlack: '#2a2f36', hullGrey: '#8a95a0', hullRed: '#a7432f', white: '#f3efe6', gold: '#e3c07a',
    flame: '#ff9a3c', flameHot: '#ffd36a', smoke: '#b9b2a8', smokeDark: '#5b5650', frFlagBlue: '#27408b', frFlagRed: '#c8283a',
    vmRed: '#d4202a', vmYellow: '#ffd21c', usBlue: '#27408b', usRed: '#b8283a', night: '#101a2c', nightHaze: '#1d2a44',
  };
  const PAL = LP.PAL;

  // ---------------------------------------------------------------- render, luz e grão do vídeo
  LP.RENDER = { samples: 32, shutter: 0.4, tone: 'neutral', exposure: 1.0, bloom: 0.3, bloomThreshold: 1.1, vignette: 0.2, grain: 0.012, fov: 32, near: 0.5, far: 600, background: '#f8dcc0', shadows: true };

  // modos de luz: dia quente, dia nublado, noite. Cada cena aplica um por tomada.
  LP.MODES = {
    day: { sun: '#ffe0ba', sunP: 3.4, sky: '#a9c9ff', skyP: 0.9, env: 0.55, top: '#66a9cf', pale: '#f7ead9', haze: '#f8dcc0', fog: [60, 260] },
    grey: { sun: '#e8ecf0', sunP: 2.2, sky: '#b9c8da', skyP: 1.1, env: 0.6, top: '#8fa6bb', pale: '#d9dee2', haze: '#c8d0d6', fog: [50, 220] },
    night: { sun: '#8fa8e0', sunP: 0.55, sky: '#5a6fa8', skyP: 0.35, env: 0.16, top: '#0d1626', pale: '#1b2845', haze: '#1d2a44', fog: [40, 200] },
    dark: { sun: '#6a6f8a', sunP: 0.18, sky: '#3a4666', skyP: 0.2, env: 0.1, top: '#080d18', pale: '#12192b', haze: '#141b2d', fog: [35, 180] },
  };

  LP.rig = function (S, { center = [0, 0, 0], size = 40 } = {}) {
    const { scene } = S;
    const SUN = new THREE.Vector3(-0.62, 0.55, 0.45).normalize();
    K.env(S, { top: '#7db7dd', horizon: '#ffe2c4', bottom: '#8fa98a', intensity: 0.55, panels: [{ pos: [SUN.x * 30, SUN.y * 30, SUN.z * 30], size: [10, 10], color: '#ffcf99', power: 14, round: true }] });
    const sun = K.sun(S, { pos: [center[0] + SUN.x * 60, SUN.y * 60, center[2] + SUN.z * 60], target: center, color: '#ffe0ba', power: 3.4, size, soft: 2.0, mapSize: 4096, far: 160, normalBias: 0.03 });
    const sky = K.skyLight(S, { color: '#a9c9ff', power: 0.9, size, center, mapSize: 2048, spread: 0.9 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color() }, pale: { value: new THREE.Color() }, haze: { value: new THREE.Color() }, sunC: { value: new THREE.Color('#ffcf99') }, sunDir: { value: SUN }, sunK: { value: 1 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vD; uniform vec3 top, haze, pale, sunC, sunDir; uniform float sunK;
        void main(){ vec3 d = normalize(vD); float s = max(dot(d, sunDir), 0.0); float y = max(d.y, 0.0);
          vec3 c = mix(mix(haze, pale, smoothstep(0.0, 0.12, y)), top, smoothstep(0.06, 0.5, y));
          c += sunC * (pow(s, 5.0) * 0.35 + pow(s, 40.0) * 0.8) * sunK; gl_FragColor = vec4(c, 1.0); }`,
    }));
    scene.add(dome);
    scene.fog = new THREE.Fog('#f8dcc0', 60, 260);
    const rig = {
      sun, sky, dome, mode: null,
      set(name) {
        if (rig.mode === name) return; rig.mode = name;
        const m = LP.MODES[name];
        sun.color.set(m.sun); sun.intensity = m.sunP; sky.color.set(m.sky); sky.intensity = m.skyP; scene.environmentIntensity = m.env;
        const u = dome.material.uniforms; u.top.value.set(m.top); u.pale.value.set(m.pale); u.haze.value.set(m.haze); u.sunK.value = name === 'day' ? 1 : name === 'grey' ? 0.2 : 0;
        scene.fog.color.set(m.haze); scene.fog.near = m.fog[0]; scene.fog.far = m.fog[1]; scene.background = new THREE.Color(m.haze);
      },
      follow(p) { dome.position.copy(p); },
      // muda o centro da luz e da sombra (cenas distantes no mesmo mundo: cais, cidade, rua)
      move(p) {
        const x = p[0], z = p[2] == null ? 0 : p[2];
        sun.target.position.set(x, 0, z); sun.position.set(x + SUN.x * 60, SUN.y * 60, z + SUN.z * 60);
        sky.target.position.set(x, 1, z);
        dome.position.set(x, 0, z);
      },
    };
    return rig;
  };

  // ---------------------------------------------------------------- facetas
  const _hsl = {};
  function tone(hex, key, amount = 1) {
    const c = new THREE.Color(hex); c.getHSL(_hsl);
    return c.setHSL(_hsl.h + (K.hash(key, 1.3) - 0.5) * 0.03 * amount, K.clamp(_hsl.s * (1 + (K.hash(key, 7.7) - 0.5) * 0.22 * amount)), K.clamp(_hsl.l * (1 + (K.hash(key, 13.1) - 0.5) * 0.15 * amount)));
  }
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
    for (const name of ['position', 'color', 'normal']) {
      const arr = new Float32Array(list.reduce((s, g) => s + g.attributes[name].array.length, 0)); let o = 0;
      for (const g of list) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
      out.setAttribute(name, new THREE.BufferAttribute(arr, 3));
    }
    return out;
  }
  const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 });
  LP.MAT = MAT;
  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _mat = new THREE.Matrix4();
  // B(): monta uma peça a partir de formas simples; cada triângulo ganha um tom próprio
  function B(seed = 1) {
    const list = []; let n = 0;
    const add = (g, pos, col, o = {}) => {
      if (o.jit) jitter(g, o.jit, seed + n);
      if (o.scale) g.scale(o.scale[0], o.scale[1], o.scale[2]);
      const r = o.rot || [0, 0, 0]; _e.set(r[0], r[1], r[2]); _q.setFromEuler(_e);
      g.applyMatrix4(_mat.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), _q, new THREE.Vector3(1, 1, 1)));
      const s = seed * 7 + (n++) * 3.3, amt = o.amt == null ? 0.8 : o.amt, shade = o.shade == null ? 0.12 : o.shade;
      list.push(facet(g, (c, nn) => {
        const base = Array.isArray(col) ? col[Math.floor(K.hash(c.x * 9 + c.y * 5 + c.z * 3 + s) * col.length) % col.length] : col;
        return tone(base, c.x * 13 + c.y * 7 + c.z * 3 + s, amt).multiplyScalar(1 + shade * (nn.y - 0.2));
      }));
      return api;
    };
    const api = {
      box: (w, h, d, pos, col, o) => add(new THREE.BoxGeometry(w, h, d, 1, 1, 1), pos, col, o),
      cyl: (rt, rb, h, sides, pos, col, o) => add(new THREE.CylinderGeometry(rt, rb, h, sides, 1), pos, col, o),
      ico: (r, detail, pos, col, o) => add(new THREE.IcosahedronGeometry(r, detail), pos, col, o),
      cone: (r, h, sides, pos, col, o) => add(new THREE.ConeGeometry(r, h, sides, 1), pos, col, o),
      raw: (g, pos, col, o) => add(g, pos, col, o),
      geo: () => merge(list),
      mesh: (o = {}) => { const m = new THREE.Mesh(merge(list), MAT); m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false; return m; },
    };
    return api;
  }
  Object.assign(LP, { tone, jitter, facet, merge, B });

  // material emissivo simples (janelas, lâmpadas, chamas): cor > 1 acende o bloom
  LP.glowMat = (hex, power = 1) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), fog: false }); m.userData.base = new THREE.Color(hex).multiplyScalar(power); return m; };
  LP.setGlow = (m, k) => { m.color.copy(m.userData.base).multiplyScalar(k); };

  // chão facetado simples: plano jitterado, cores em retalhos
  LP.ground = function (w, d, cols, o = {}) {
    const g = new THREE.PlaneGeometry(w, d, o.nx || 30, o.nz || 30); g.rotateX(-Math.PI / 2);
    jitter(g, o.jit == null ? 0.05 : o.jit, o.seed || 3);
    const m = new THREE.Mesh(facet(g, (c, n, i) => tone(cols[Math.floor(K.hash(Math.floor(c.x * 0.2), Math.floor(c.z * 0.2), o.seed || 2) * cols.length) % cols.length], i * 1.3 + c.x * 3.1, 1.2)), MAT);
    m.receiveShadow = true; return m;
  };

  // ---------------------------------------------------------------- fumaça (sai da boca, sobe, abre, apaga)
  // emit(t) -> { pos: [x,y,z], rate } ; as bolhas nascem na boca e sobem com o vento
  LP.smoke = function (parent, { n = 36, life = 3.2, color = PAL.smoke, size = 0.5, grow = 2.6, rise = 1.6, wind = [1.0, 0, 0.2], seed = 1, opacity = 0.8 } = {}) {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const mats = [];
    const meshes = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1, transparent: true, opacity: 0, depthWrite: false });
      const me = new THREE.Mesh(g, m); me.visible = false; parent.add(me); meshes.push(me); mats.push(m);
    }
    return {
      meshes,
      // src(t) -> [x,y,z, on 0..1]: posição da boca no mundo e se está emitindo
      update(t, src) {
        for (let i = 0; i < n; i++) {
          const per = life / n, born = Math.floor(t / per) - i; // última bolha que nasceu neste índice
          const t0 = (Math.floor((t - i * per) / life)) * life + i * per, age = t - t0;
          const me = meshes[i], mat = mats[i];
          const s0 = src(t0);
          if (!s0 || s0[3] <= 0 || age < 0 || age > life) { me.visible = false; continue; }
          const u = age / life, r = K.hash(i, t0 * 7.1 + seed);
          me.visible = true;
          me.position.set(s0[0] + wind[0] * age * (0.6 + u) + (r - 0.5) * 0.3, s0[1] + rise * age * (1 - 0.25 * u), s0[2] + wind[2] * age + (K.hash(i, seed + 3) - 0.5) * 0.3);
          const sc = size * (0.6 + grow * K.ease.out(u)); me.scale.set(sc, sc * 0.9, sc);
          me.rotation.set(r * 6, r * 9, 0);
          mat.opacity = opacity * s0[3] * K.smooth(0, 0.08, u) * (1 - K.smooth(0.45, 1, u));
        }
      },
    };
  };

  // ---------------------------------------------------------------- bandeiras de pano (textura de canvas + onda)
  LP.flagTexture = function (kind) {
    const W = 512, H = 340;
    return K.canvasTex(W, H, (c) => {
      if (kind === 'vm') {                                   // Viet Minh: vermelha com estrela amarela de cinco pontas
        c.fillStyle = PAL.vmRed; c.fillRect(0, 0, W, H);
        c.fillStyle = PAL.vmYellow; c.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 56 : 138; c[i ? 'lineTo' : 'moveTo'](W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); }
        c.closePath(); c.fill();
      } else if (kind === 'fr') {                            // França: azul, branco, vermelho na vertical
        c.fillStyle = PAL.frFlagBlue; c.fillRect(0, 0, W / 3, H); c.fillStyle = '#f5f1e8'; c.fillRect(W / 3, 0, W / 3, H); c.fillStyle = PAL.frFlagRed; c.fillRect(2 * W / 3, 0, W / 3, H);
      } else if (kind === 'uk') {                            // Reino Unido: cruz e diagonais (ocupação britânica no sul, 1945)
        c.fillStyle = '#1d3a8f'; c.fillRect(0, 0, W, H);
        const diag = (w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, H); c.moveTo(W, 0); c.lineTo(0, H); c.stroke(); };
        diag(46, '#f5f1e8'); diag(20, PAL.frFlagRed);
        c.fillStyle = '#f5f1e8'; c.fillRect(0, H / 2 - 40, W, 80); c.fillRect(W / 2 - 56, 0, 112, H);
        c.fillStyle = PAL.frFlagRed; c.fillRect(0, H / 2 - 24, W, 48); c.fillRect(W / 2 - 34, 0, 68, H);
      } else {                                               // EUA de 48 estrelas (6 x 8) e 13 listras
        for (let i = 0; i < 13; i++) { c.fillStyle = i % 2 ? '#f5f1e8' : PAL.usRed; c.fillRect(0, i * H / 13, W, H / 13 + 1); }
        c.fillStyle = PAL.usBlue; c.fillRect(0, 0, W * 0.42, H * 7 / 13);
        c.fillStyle = '#f5f1e8';
        for (let r = 0; r < 6; r++) for (let q = 0; q < 8; q++) { c.beginPath(); c.arc(W * 0.42 * (q + 0.5) / 8, (H * 7 / 13) * (r + 0.5) / 6, 5.5, 0, 7); c.fill(); }
      }
    });
  };
  // pano com mastro; wave(t) balança; raise 0..1 sobe pelo mastro
  LP.flag = function (kind, { w = 1.8, h = 1.2, pole = 4.5 } = {}) {
    const grp = new THREE.Group();
    const p = LP.B(9).cyl(0.04, 0.05, pole, 6, [0, pole / 2, 0], PAL.iron).cone(0.07, 0.14, 6, [0, pole + 0.07, 0], PAL.gold).mesh();
    grp.add(p);
    const geo = new THREE.PlaneGeometry(w, h, 12, 8); geo.translate(w / 2, 0, 0);
    const tex = LP.flagTexture(kind);
    const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
    cloth.castShadow = true; grp.add(cloth);
    const base = geo.attributes.position.array.slice();
    grp.userData.update = (t, raise = 1, wind = 1) => {
      cloth.position.set(0.04, K.lerp(0.6, pole - h / 2 - 0.15, K.clamp(raise)), 0);
      const pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const x = base[i * 3], k = x / w;
        pa.setZ(i, Math.sin(t * 5 - x * 3.2) * 0.12 * k * wind + Math.sin(t * 3.1 - x * 2 + 1) * 0.05 * k * wind);
        pa.setY(i, base[i * 3 + 1] - 0.03 * k * k * wind * 2);
      }
      pa.needsUpdate = true; geo.computeVertexNormals();
    };
    grp.userData.update(0, 1);
    return grp;
  };

  // ---------------------------------------------------------------- legenda queimada e rótulos (overlay 2D, nítido)
  function groupWords(words) {
    const g = []; let cur = [];
    for (const w of words) {
      cur.push(w);
      const end = /[.,;:!?]$/.test(w.word);
      if (end || cur.length >= 6) { g.push(cur); cur = []; }
    }
    if (cur.length) g.push(cur);
    return g;
  }
  // padrão da colagem: faixa escura embaixo, caixa alta, palavra falada em dourado
  LP.makeOverlay = function (words, labels) {
    const groups = groupWords(words);
    return (ctx, t, W, H) => {
      const k = W / 1920;
      // rótulos (data/lugar): bloco no alto à esquerda
      for (const L of labels || []) {
        if (t < L.t0 || t > L.t1 + 0.3) continue;
        const inU = K.ease.out(K.clamp((t - L.t0) / 0.3)), outU = 1 - K.clamp((t - L.t1) / 0.3);
        const a = Math.min(inU, outU);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(-(1 - inU) * 80 * k, 0);
        ctx.font = `400 ${74 * k}px "Anton"`; const tw = ctx.measureText(L.text).width;
        ctx.font = `800 ${34 * k}px "Inter"`; const sw = L.sub ? ctx.measureText(L.sub.toUpperCase()).width : 0;
        const bw = Math.max(tw, sw) + 70 * k, bh = (L.sub ? 150 : 108) * k, x = 70 * k, y = 70 * k;
        ctx.fillStyle = 'rgba(14,12,10,0.74)'; ctx.fillRect(x, y, bw, bh);
        ctx.fillStyle = PAL.gold; ctx.fillRect(x, y, 10 * k, bh);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.font = `400 ${74 * k}px "Anton"`; ctx.fillStyle = PAL.paper; ctx.fillText(L.text, x + 36 * k, y + 80 * k);
        if (L.sub) { ctx.font = `800 ${34 * k}px "Inter"`; ctx.fillStyle = PAL.gold; ctx.fillText(L.sub.toUpperCase(), x + 36 * k, y + 130 * k); }
        ctx.restore();
      }
      // legenda: grupo de palavras ativo
      const g = groups.find((grp) => t >= grp[0].start - 0.05 && t <= grp[grp.length - 1].end + 0.35);
      if (!g) return;
      const inT = Math.min(1, (t - (g[0].start - 0.05)) / 0.12);
      ctx.font = `800 ${46 * k}px "Inter"`; ctx.textBaseline = 'alphabetic';
      const gap = 14 * k, ws = g.map((w) => { const s = w.word.toUpperCase(); return { s, w, wd: ctx.measureText(s).width + 1.2 * k * s.length }; });
      const total = ws.reduce((a, b) => a + b.wd, 0) + gap * (ws.length - 1), bw = total + 68 * k, bh = 70 * k, x0 = (W - bw) / 2, y0 = H - 64 * k - bh + (1 - inT) * 12 * k;
      ctx.save(); ctx.globalAlpha = inT; ctx.fillStyle = 'rgba(12,10,8,0.62)'; ctx.beginPath(); ctx.roundRect(x0, y0, bw, bh, 6 * k); ctx.fill();
      let x = x0 + 34 * k;
      for (const q of ws) {
        const active = t >= q.w.start && t < q.w.end + 0.05, past = t >= q.w.end + 0.05;
        ctx.fillStyle = active ? PAL.gold : past ? '#efe6d2' : 'rgba(233,223,200,0.55)';
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10 * k; ctx.shadowOffsetY = 3 * k;
        ctx.fillText(q.s, x, y0 + 50 * k); x += q.wd + gap;
      }
      ctx.restore();
    };
  };
})();
