{
  // ---------------------------------------------------------------- the clay kit (reusable on any subject)
  // 1. THE SURFACE. One tiling height map of what hands and tools leave behind: fingerprints (a shallow dent with
  //    ridges in it), knife drags with a burr, pits, specks, joins that were smoothed over. Grey = untouched.
  let SURFACE = null;
  function claySurface() {
    if (SURFACE) return SURFACE;
    const N = 1024, r = K.rng(3);
    SURFACE = K.canvasTex(N, N, (ctx) => {
      ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, N, N);
      // draw something at (x, y) and again wherever it crosses the edge, so the map tiles
      const tiled = (x, y, pad, draw) => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { if (x + ox < -pad || x + ox > N + pad || y + oy < -pad || y + oy > N + pad) continue; ctx.save(); ctx.translate(x + ox, y + oy); draw(); ctx.restore(); } };
      const pc = document.createElement('canvas'); pc.width = pc.height = 440; const p = pc.getContext('2d');
      for (let i = 0; i < 8; i++) {                                   // fingerprints
        const R = r.range(80, 160), sp = r.range(13, 17), ph = [r.range(0, 6.3), r.range(0, 6.3)], sx = r.range(0.62, 0.82);
        p.setTransform(1, 0, 0, 1, 0, 0); p.globalCompositeOperation = 'source-over'; p.clearRect(0, 0, 440, 440);
        p.translate(220, 220); p.rotate(r.range(0, 6.3));
        let g = p.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, 'rgba(0,0,0,0.26)'); g.addColorStop(0.75, 'rgba(0,0,0,0.2)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        p.fillStyle = g; p.fillRect(-220, -220, 440, 440);            // the press: a shallow dent
        p.strokeStyle = 'rgba(255,255,255,0.5)'; p.lineWidth = sp * 0.4; p.lineJoin = 'round';
        for (let k = 1; k * sp < R * 1.6; k++) {                      // the ridges: loops that crowd toward one side, like a real print
          p.beginPath();
          for (let a = 0; a < 6.283; a += 0.05) { const rr = k * sp * (1 + 0.07 * Math.sin(3 * a + ph[0]) + 0.04 * Math.sin(5 * a + ph[1] + k * 0.4)), X = rr * Math.cos(a) * sx, Y = rr * Math.sin(a) * 1.15 + k * sp * 0.42; if (a === 0) p.moveTo(X, Y); else p.lineTo(X, Y); }
          p.closePath(); p.stroke();
        }
        p.globalCompositeOperation = 'destination-in'; g = p.createRadialGradient(0, 0, R * 0.25, 0, 0, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        p.fillStyle = g; p.fillRect(-220, -220, 440, 440);
        tiled(r.range(0, N), r.range(0, N), 230, () => ctx.drawImage(pc, -220, -220));
      }
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {                                  // tool marks: a drag with a raised burr beside it
        const L = r.range(120, 430), a = r.range(0, 6.3), w = r.range(2, 5), bend = r.range(-30, 30);
        tiled(r.range(0, N), r.range(0, N), 460, () => {
          ctx.rotate(a);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, bend, L / 2, 0); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = w * 0.8; ctx.beginPath(); ctx.moveTo(-L / 2, w); ctx.quadraticCurveTo(0, bend + w, L / 2, w); ctx.stroke();
        });
      }
      for (let i = 0; i < 4; i++) {                                   // joins: two pieces pushed together and smoothed over
        const a = r.range(0, 6.3), pts = Array.from({ length: 9 }, (_, k) => [(k - 4) * 85, r.range(-26, 26)]);
        tiled(r.range(0, N), r.range(0, N), 420, () => {
          ctx.rotate(a);
          for (const [dy, style, w] of [[0, 'rgba(0,0,0,0.4)', 3.5], [5, 'rgba(255,255,255,0.22)', 5]]) { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y + dy) : ctx.moveTo(x, y + dy))); ctx.stroke(); }
        });
      }
      for (let i = 0; i < 170; i++) {                                 // pits (dark) and specks of stuck clay (light)
        const rad = r.range(1.5, 4.5) * (r.chance(0.08) ? 2.4 : 1), up = r.chance(0.22);
        tiled(r.range(0, N), r.range(0, N), 16, () => { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad); g.addColorStop(0, up ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.8)'); g.addColorStop(1, up ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.fill(); });
      }
      const im = ctx.getImageData(0, 0, N, N), d = im.data;           // a fine tooth over everything
      for (let i = 0; i < d.length; i += 4) { const v = d[i] + r.range(-7, 7); d[i] = d[i + 1] = d[i + 2] = v; }
      ctx.putImageData(im, 0, 0);
    }, { data: true, repeat: [1, 1] });
    return SURFACE;
  }

  // 2. THE MATERIAL. clay(colour, { marble, marbleAmount, marbleSize, bump, lump, roughness, sheen, tile }) -> a plasticine material
  //    for ANY geometry: no UVs needed. The surface map is projected from three sides in object space (so marks stay
  //    stuck to the object when it moves or squashes), soft dents are added as noise, a second colour is streaked
  //    through, pressed places come out slightly darker and shinier, and a sheen gives the waxy, velvety edge light.
  const CLAY_GLSL = `
    uniform sampler2D uSurf; uniform vec3 uOff, uMarble; uniform float uTile, uBump, uLump, uLumpSize, uMarbleAmt, uMarbleSize;
    varying vec3 vClayP, vClayN;
    float cHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float cNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      return mix(mix(mix(cHash(i), cHash(i + vec3(1,0,0)), f.x), mix(cHash(i + vec3(0,1,0)), cHash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(cHash(i + vec3(0,0,1)), cHash(i + vec3(1,0,1)), f.x), mix(cHash(i + vec3(0,1,1)), cHash(i + vec3(1,1,1)), f.x), f.y), f.z); }
    // x: height of the surface in world units (fine marks + soft dents), y: the fine marks alone, -0.5..0.5
    vec2 clayH(vec3 p, vec3 w){
      vec3 q = p / uTile + uOff;
      float fine = dot(w, vec3(texture2D(uSurf, q.zy).r, texture2D(uSurf, q.xz).r, texture2D(uSurf, q.xy).r)) - 0.5;
      vec3 l = p / uLumpSize + uOff * 9.0;
      return vec2(uBump * fine + uLump * (cNoise(l) + 0.5 * cNoise(l * 2.3 + 5.0) - 0.75), fine);
    }
    // bend the normal by a height difference per pixel (Mikkelsen's bump mapping, in true units so it holds at any distance)
    vec3 clayBump(vec3 pos, vec3 n, vec2 dH, float face){
      vec3 sx = dFdx(pos), sy = dFdy(pos), r1 = cross(sy, n), r2 = cross(n, sx);
      float det = dot(sx, r1) * face;
      return normalize(abs(det) * n - sign(det) * (dH.x * r1 + dH.y * r2));
    }`;
  let clayCount = 0;
  function clay(colour, o = {}) {
    const [base, mix] = Array.isArray(colour) ? colour : [colour, o.marble || colour], c = new THREE.Color(base), r = K.rng(101 + clayCount++);
    const m = new THREE.MeshPhysicalMaterial({ color: c, roughness: o.roughness == null ? 0.6 : o.roughness, metalness: 0,
      sheen: o.sheen == null ? 0.4 : o.sheen, sheenRoughness: 0.5, sheenColor: c.clone().lerp(new THREE.Color('#ffffff'), 0.2) });
    const u = { uSurf: { value: claySurface() }, uOff: { value: new THREE.Vector3(r(), r(), r()) }, uMarble: { value: new THREE.Color(mix) },
      uTile: { value: o.tile || 1.5 }, uBump: { value: o.bump == null ? 0.007 : o.bump }, uLump: { value: o.lump == null ? 0.02 : o.lump }, uLumpSize: { value: o.lumpSize || 0.3 },
      uMarbleAmt: { value: o.marbleAmount == null ? 0.4 : o.marbleAmount }, uMarbleSize: { value: o.marbleSize || 0.5 } };
    m.userData.clay = u;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vClayP, vClayN;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvClayP = position; vClayN = normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + CLAY_GLSL)
        .replace('#include <map_fragment>', `#include <map_fragment>
          vec3 cW = pow(abs(normalize(vClayN)), vec3(4.0)); cW /= cW.x + cW.y + cW.z;
          vec2 cH = clayH(vClayP, cW);
          vec2 cD = vec2(clayH(vClayP + dFdx(vClayP), cW).x, clayH(vClayP + dFdy(vClayP), cW).x) - cH.x;
          float cM = cNoise(vClayP * 0.7 / uMarbleSize + uOff * 5.0);
          float cS = smoothstep(0.3, 0.95, sin(dot(vClayP, vec3(1.1, 1.8, 0.9)) / uMarbleSize + cM * 9.0 + uOff.x * 40.0)) * (0.35 + cM);
          diffuseColor.rgb = mix(diffuseColor.rgb, uMarble, clamp(uMarbleAmt * cS, 0.0, 1.0));
          diffuseColor.rgb *= 1.0 + 0.3 * cH.y;`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + 0.55 * cH.y + 0.12 * (cM - 0.5), 0.32, 1.0);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = clayBump(-vViewPosition, normal, cD, faceDirection);');
    };
    m.customProgramCacheKey = () => 'soft-clay';
    return m;
  }

  // 3. THE HANDS. lumpy(geometry, { amount, size, dents, dentSize, dentDepth, seed }) -> a copy that was shaped by
  //    fingers: every point is pushed by a smooth 3D field (so nothing stays symmetrical, and split vertices on hard
  //    edges never crack apart), then a few thumb dents are pressed in. Normals follow the warp exactly.
  function lumpy(geo, o = {}) {
    const amount = o.amount == null ? 0.03 : o.amount, f = 1 / (o.size || 0.6), seed = o.seed || 1;
    const g = geo.clone(), n = K.noise(seed), r = K.rng(seed + 77), P = g.attributes.position, N = g.attributes.normal, dents = [];
    for (let i = 0; i < (o.dents || 0); i++) { const k = r.int(0, P.count - 1); dents.push([P.getX(k), P.getY(k), P.getZ(k), N.getX(k), N.getY(k), N.getZ(k), (o.dentSize || 0.25) * r.range(0.7, 1.3), (o.dentDepth || 0.04) * r.range(0.6, 1.2)]); }
    const warp = (x, y, z, out) => {
      let dx = 2 * amount * n.n3(x * f + 31.4, y * f, z * f), dy = 2 * amount * n.n3(x * f, y * f + 47.2, z * f), dz = 2 * amount * n.n3(x * f, y * f, z * f + 12.9);
      for (const d of dents) { const q = Math.hypot(x - d[0], y - d[1], z - d[2]) / d[6]; if (q < 1) { const k = d[7] * (1 - q * q) * (1 - q * q); dx -= d[3] * k; dy -= d[4] * k; dz -= d[5] * k; } }
      return out.set(x + dx, y + dy, z + dz);
    };
    const p = new THREE.Vector3(), nn = new THREE.Vector3(), t1 = new THREE.Vector3(), t2 = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), E = 2e-3;
    for (let i = 0; i < P.count; i++) {
      p.fromBufferAttribute(P, i); nn.fromBufferAttribute(N, i);
      t1.set(0, 1, 0); if (Math.abs(nn.y) > 0.9) t1.set(1, 0, 0);
      t1.crossVectors(nn, t1).normalize(); t2.crossVectors(nn, t1);                       // two directions lying in the surface
      warp(p.x, p.y, p.z, a); warp(p.x + t1.x * E, p.y + t1.y * E, p.z + t1.z * E, b); warp(p.x + t2.x * E, p.y + t2.y * E, p.z + t2.z * E, c);
      b.sub(a); c.sub(a); nn.crossVectors(b, c).normalize();                              // the warped surface's own normal
      P.setXYZ(i, a.x, a.y, a.z); N.setXYZ(i, nn.x, nn.y, nn.z);
    }
    g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }
  const part = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; };

  // ---------------------------------------------------------------- content: the fall of Saigon, 29-30 April 1975, in clay
  const BOX = {
    card: '#1f7f8c',
    cream: ['#f3e6cd', '#eec78c'], coral: ['#de3a26', '#f2814f'], yellow: ['#f4ad08', '#ee7f14'], navy: ['#253677', '#4467b8'],
    olive: ['#66763a', '#8a9a52'], olive2: ['#4a5a2c', '#667a3c'], tank: ['#5d6b34', '#7a8a48'], grey: ['#7d868c', '#a3abb0'], dark: ['#2c3036', '#4a5058'],
    road: ['#4b4f55', '#6a7078'], white: ['#f4f0e6', '#ddd6c4'], brick: ['#c9a27a', '#d9b48e'], skin: ['#e0a878', '#c98b5c'], red: ['#c8281f', '#e0553b'],
    blue: ['#2a5db0', '#4c86d8'], wood: ['#8a5a32', '#a97848'], leaf: ['#3f8b4a', '#6cb05a'], sil: ['#2b2f3a', '#454b5a'],
  };
  const FONT = '600 200px "Fredoka"';
  const DUR = 15;

  const POSES = 15;
  const pose = (t) => Math.floor(t * POSES + 1e-3) / POSES;
  const snap = (t) => Math.round(t * POSES) / POSES;
  const since = (tq, t0) => Math.round((tq - t0) * POSES);
  const nudge = (id, tq, amt) => (K.hash(id, Math.round(tq * POSES)) - 0.5) * 2 * amt;

  // the clock the picture and the sound both read
  const RY = 2.0, PY = 2.6;                       // roof and stairwell-roof heights
  const HELI0 = [1.3, PY + 0.69, -0.28];          // where the helicopter sits
  const LIFT = snap(3.49);                        // "evacuam"
  const GX = 9.6, HIT = snap(7.97);               // gate x, "palacio"
  const CX = 18, DX = 26;                         // president scene, soldiers scene
  const T = {
    climb: [0.45, 0.9, 1.35, 1.75].map(snap),
    wordsA: [{ text: '29', land: snap(0.45) }, { text: 'DE ABRIL', land: snap(0.95) }],
    wordsA2: [{ text: 'SAIGON', land: snap(1.4) }],
    wordsB: [{ text: '30', land: snap(5.73) }, { text: 'DE ABRIL', land: snap(5.95) }],
    tank0: 5.6,
    sil: snap(9.63), slab: snap(10.4), name: [snap(10.61), snap(10.81), snap(11.03)], two: snap(12.07), dias: snap(12.41),
    flagC: snap(9.9),
    sold: [13.0, 13.15, 13.3, 13.45].map(snap), lay: [13.81, 13.97, 14.13, 14.29].map(snap),
  };
  const TANK_V = 2.6, TANK_K = 2.5;
  const tankNose = (tq) => (tq <= HIT ? GX + 0.05 + TANK_V * (HIT - tq) : GX + 0.05 - TANK_V * (1 - Math.exp(-(tq - HIT) * TANK_K)) / TANK_K);

  // ---------------------------------------------------------------- little builders (everything is lumpy clay)
  let seedN = 1000;
  const mk = (geo, colour, o = {}) => {
    const g = lumpy(geo, { amount: o.amt == null ? 0.014 : o.amt, size: o.lsize || 0.5, seed: seedN++, dents: o.dents || 0, dentSize: o.dentSize || 0.2, dentDepth: o.dentDepth || 0.025 });
    const tile = o.tile || 0.7;
    return part(g, clay(colour, { tile, bump: 0.007 * tile / 1.5, lump: o.lump == null ? 0.01 : o.lump, lumpSize: 0.3, marbleSize: o.msize || 0.3, marbleAmount: o.marble == null ? 0.35 : o.marble }));
  };
  const BX = (w, h, d, col, o = {}) => mk(K.roundedBox(w, h, d, o.r == null ? Math.min(w, h, d) * 0.22 : o.r, 4), col, o);
  const SPH = (r, col, o = {}) => mk(new THREE.SphereGeometry(r, 20, 14), col, o);
  const CYL = (r1, r2, h, col, o = {}) => mk(new THREE.CylinderGeometry(r1, r2, h, 22, 3), col, o);
  const CAP = (r, len, col, o = {}) => mk(new THREE.CapsuleGeometry(r, len, 5, 14), col, o);
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const rot = (m, x, y, z) => { m.rotation.set(x, y, z); return m; };
  const add = (g, ...ms) => { ms.forEach((m) => g.add(m)); return g; };

  function person(body, headCol, o = {}) {
    const g = new THREE.Group(), s = o.s || 0.8;
    const b = at(CAP(0.12, 0.2, body, { amt: 0.008, tile: 0.4, marble: 0.3 }), 0, 0.26, 0), h = at(SPH(0.1, headCol, { amt: 0.006, tile: 0.4, marble: 0.2 }), 0, 0.59, 0);
    const aL = at(CAP(0.045, 0.16, body, { amt: 0.005, tile: 0.3 }), -0.16, 0.27, 0), aR = at(CAP(0.045, 0.16, body, { amt: 0.005, tile: 0.3 }), 0.16, 0.27, 0);
    add(g, b, h, aL, aR);
    if (o.helmet) { const hm = at(SPH(0.118, o.helmet, { amt: 0.006, tile: 0.4, marble: 0.2 }), 0, 0.63, 0); hm.scale.set(1, 0.66, 1); g.add(hm); }
    g.scale.setScalar(s); g.userData = { aL, aR, head: h };
    return g;
  }

  // a Republic of Vietnam flag (yellow, three red stripes) or the red-over-blue flag with a yellow star
  function flagSouth(w) {
    const g = new THREE.Group(), h = w * 0.66;
    g.add(BX(w, h, 0.04, BOX.yellow, { r: 0.015, amt: 0.004, marble: 0.1, tile: 0.5 }));
    for (const dy of [-0.2, 0, 0.2]) g.add(at(BX(w * 0.98, h * 0.07, 0.05, BOX.red, { r: 0.01, amt: 0.003, marble: 0.05, tile: 0.5 }), 0, dy * h, 0.012));
    return g;
  }
  function flagNorth(w) {
    const g = new THREE.Group(), h = w * 0.66;
    g.add(at(BX(w, h / 2, 0.04, BOX.red, { r: 0.012, amt: 0.003, marble: 0.1, tile: 0.4 }), 0, h / 4, 0));
    g.add(at(BX(w, h / 2, 0.04, BOX.blue, { r: 0.012, amt: 0.003, marble: 0.1, tile: 0.4 }), 0, -h / 4, 0));
    const star = at(CYL(h * 0.2, h * 0.2, 0.05, BOX.yellow, { amt: 0.003, marble: 0.05, tile: 0.4 }), 0, 0, 0.012); star.rotation.x = Math.PI / 2; g.add(star);
    return g;
  }

  function buildHeli() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    body.add(BX(2.6, 0.95, 0.95, BOX.olive, { r: 0.34, tile: 1.4 }));
    body.add(at(BX(0.55, 0.32, 0.97, BOX.dark, { r: 0.08, tile: 0.6, marble: 0.1 }), 1.0, 0.18, 0));          // cockpit glass
    body.add(at(BX(0.55, 0.22, 0.98, BOX.dark, { r: 0.07, tile: 0.6, marble: 0.1 }), -0.1, 0.12, 0));          // cabin door row
    for (const z of [-0.5, 0.5]) body.add(at(BX(1.0, 0.27, 0.28, BOX.olive2, { r: 0.1, tile: 0.8 }), 0.25, -0.55, z * 0.8));
    body.add(at(CYL(0.04, 0.04, 0.4, BOX.olive2, { tile: 0.5 }), -0.7, -0.62, 0.3));
    for (const z of [-0.2, 0.2]) body.add(rot(at(CYL(0.16, 0.18, 1.0, BOX.olive2, { tile: 0.6 }), -0.15, 0.58, z), 0, 0, Math.PI / 2));
    body.add(at(CYL(0.07, 0.1, 0.3, BOX.dark, { tile: 0.5 }), 0.2, 0.72, 0));
    body.add(rot(at(BX(1.6, 0.36, 0.38, BOX.olive, { r: 0.12, tile: 0.9 }), -1.95, 0.24, 0), 0, 0, 0.2));        // tail boom
    body.add(rot(at(BX(0.36, 0.7, 0.26, BOX.olive, { r: 0.1, tile: 0.7 }), -2.7, 0.58, 0), 0, 0, 0.3));         // tail pylon
    const rotor = new THREE.Group(); rotor.position.set(0.2, 0.9, 0);
    rotor.add(SPH(0.16, BOX.dark, { tile: 0.5, marble: 0.1 }));
    for (let k = 0; k < 6; k++) { const bl = BX(1.7, 0.04, 0.17, BOX.dark, { r: 0.018, amt: 0.006, tile: 0.8, marble: 0.1 }); bl.position.set(0.95, 0, 0); const arm = new THREE.Group(); arm.rotation.y = k * Math.PI / 3; arm.add(bl); rotor.add(arm); }
    body.add(rotor);
    const tail = new THREE.Group(); tail.position.set(-2.78, 0.72, 0.2);
    for (let k = 0; k < 4; k++) { const bl = BX(0.5, 0.07, 0.04, BOX.dark, { r: 0.015, amt: 0.004, tile: 0.4, marble: 0.1 }); bl.position.set(0.26, 0, 0); const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; arm.add(bl); tail.add(arm); }
    body.add(tail);
    g.userData = { body, rotor, tail };
    return g;
  }

  function buildTank() {
    const g = new THREE.Group(), wheels = [];
    g.add(at(BX(2.25, 0.42, 1.0, BOX.tank, { r: 0.14, tile: 1.2 }), 0, 0.44, 0));
    g.add(rot(at(BX(0.7, 0.3, 0.98, BOX.tank, { r: 0.1, tile: 0.8 }), 1.1, 0.5, 0), 0, 0, -0.35));              // sloped front
    for (const z of [-0.6, 0.6]) {
      g.add(at(BX(2.5, 0.3, 0.26, BOX.dark, { r: 0.12, tile: 0.8, marble: 0.15 }), 0, 0.3, z));
      for (let i = 0; i < 5; i++) { const w = rot(at(CYL(0.17, 0.17, 0.1, BOX.grey, { amt: 0.006, tile: 0.4 }), -0.85 + i * 0.44, 0.29, z * 1.12), Math.PI / 2, 0, 0); g.add(w); wheels.push(w); }
    }
    const tur = SPH(0.5, BOX.tank, { tile: 1.0 }); tur.scale.set(1, 0.52, 0.9); tur.position.set(0.1, 0.7, 0); g.add(tur);
    g.add(rot(at(CYL(0.055, 0.055, 1.7, BOX.dark, { tile: 0.5, marble: 0.1 }), 1.15, 0.74, 0), 0, 0, Math.PI / 2));
    g.add(rot(at(CYL(0.09, 0.09, 0.3, BOX.dark, { tile: 0.5, marble: 0.1 }), 0.75, 0.74, 0), 0, 0, Math.PI / 2));
    g.add(at(CYL(0.14, 0.15, 0.1, BOX.tank, { tile: 0.4 }), -0.1, 0.96, 0.15));
    g.add(rot(at(CYL(0.12, 0.12, 0.7, BOX.dark, { tile: 0.5, marble: 0.1 }), -0.95, 0.76, 0.35), Math.PI / 2, 0, 0));    // fuel drum
    g.add(at(CYL(0.012, 0.012, 1.0, BOX.dark, { amt: 0.002, tile: 0.3 }), -0.35, 1.2, -0.25));                // antenna
    const fl = flagNorth(0.5); fl.position.set(-0.35 - 0.25, 1.52, -0.25); g.add(fl);
    g.userData = { wheels, flag: fl };
    return g;
  }

  function buildPalace() {
    const g = new THREE.Group();
    g.add(at(BX(5.2, 0.22, 2.3, BOX.white, { r: 0.06, tile: 2.0 }), 0, 0.11, 0));
    g.add(at(BX(4.5, 0.75, 1.6, BOX.cream, { r: 0.07, tile: 2.0, marble: 0.2 }), 0, 0.6, 0));                    // ground floor
    g.add(at(BX(4.7, 0.12, 1.9, BOX.white, { r: 0.04, tile: 2.0 }), 0, 1.04, 0.1));                              // slab between floors
    g.add(at(BX(4.5, 0.8, 1.6, BOX.dark, { r: 0.05, tile: 2.0, marble: 0.1 }), 0, 1.5, 0));                      // upper floor, dark glass behind the screen
    for (let i = 0; i < 12; i++) g.add(at(BX(0.09, 0.85, 0.12, BOX.white, { r: 0.03, amt: 0.006, tile: 0.8 }), -2.0 + i * 0.364, 1.5, 0.86));   // concrete fins
    g.add(at(BX(4.5, 0.08, 0.12, BOX.white, { r: 0.03, amt: 0.006, tile: 0.8 }), 0, 1.5, 0.87));
    g.add(at(BX(5.0, 0.16, 2.1, BOX.white, { r: 0.05, tile: 2.0 }), 0, 1.96, 0.1));                              // overhanging roof
    for (let i = 0; i < 6; i++) g.add(at(BX(0.12, 0.7, 0.14, BOX.white, { r: 0.04, amt: 0.006, tile: 0.8 }), -1.5 + i * 0.6, 0.6, 0.95));   // ground floor columns
    g.add(at(BX(1.4, 0.18, 0.7, BOX.white, { r: 0.05, tile: 1.0 }), 0, 0.2, 1.3));                               // steps
    g.add(at(BX(1.0, 0.28, 0.5, BOX.cream, { r: 0.06, tile: 1.0 }), 0, 2.2, 0));                                 // roof block
    g.add(at(CYL(0.02, 0.02, 1.0, BOX.dark, { amt: 0.003, tile: 0.3 }), 0.3, 2.84, 0));
    const fl = flagSouth(0.62); fl.position.set(0.62, 3.1, 0); g.add(fl);
    g.userData = { flag: fl };
    return g;
  }

  function buildGate() {
    const leaves = [];
    const post = new THREE.Group();
    for (const z of [-1.4, 1.4]) { post.add(at(BX(0.3, 1.9, 0.3, BOX.white, { r: 0.08, tile: 1.0 }), 0, 0.95, z)); post.add(at(SPH(0.2, BOX.white, { tile: 0.5 }), 0, 2.0, z)); }
    for (const zc of [-0.68, 0.68]) {
      const g = new THREE.Group(); g.position.set(0, 0.06, zc);
      g.add(at(BX(0.07, 0.08, 1.3, BOX.dark, { r: 0.03, tile: 0.5, amt: 0.006 }), 0, 0.05, 0));
      g.add(at(BX(0.07, 0.08, 1.3, BOX.dark, { r: 0.03, tile: 0.5, amt: 0.006 }), 0, 1.65, 0));
      g.add(at(BX(0.07, 0.08, 1.3, BOX.dark, { r: 0.03, tile: 0.5, amt: 0.006 }), 0, 0.9, 0));
      for (let i = 0; i < 6; i++) g.add(at(BX(0.07, 1.7, 0.07, BOX.dark, { r: 0.03, tile: 0.4, amt: 0.005 }), 0, 0.85, -0.58 + i * 0.232));
      g.add(rot(at(CYL(0.19, 0.19, 0.06, BOX.yellow, { tile: 0.4, amt: 0.005 }), 0.05, 1.28, 0), 0, 0, Math.PI / 2));
      leaves.push(g); post.add(g);
    }
    post.position.set(GX, 0, 0.1); post.rotation.y = -0.52;
    return { post, leaves };
  }

  function buildRifle() {
    const g = new THREE.Group();
    g.add(BX(0.5, 0.04, 0.04, BOX.dark, { r: 0.015, amt: 0.003, tile: 0.3, marble: 0.1 }));
    g.add(at(BX(0.16, 0.07, 0.05, BOX.dark, { r: 0.02, amt: 0.003, tile: 0.3, marble: 0.1 }), -0.3, -0.01, 0));
    g.add(at(BX(0.06, 0.13, 0.04, BOX.dark, { r: 0.015, amt: 0.003, tile: 0.3, marble: 0.1 }), 0.02, -0.08, 0));
    g.add(at(BX(0.17, 0.035, 0.04, BOX.dark, { r: 0.012, amt: 0.003, tile: 0.3, marble: 0.1 }), -0.1, 0.045, 0));
    return g;
  }

  // ---------------------------------------------------------------- words pressed onto a surface, one lump per word
  function wordLumps(parts, opts, cx, y, z, depth, parent, seed, mat, list) {
    const full = parts.map((p) => p.text).join(' '), letters = K.text3dLetters(full, opts); let k = 0;
    parts.forEach((w, wi) => {
      const mine = letters.filter((L) => L.index >= k && L.index < k + w.text.length); k += w.text.length + 1;
      const x0 = (mine[0].x + mine[mine.length - 1].x) / 2, grp = new THREE.Group();
      mine.forEach((L, i) => { const m = part(lumpy(L.geometry, { amount: 0.012, size: 0.4, seed: seed + wi * 9 + i }), mat); m.position.set(L.x - x0, L.y, 0); grp.add(m); });
      list.push({ m: grp, land: w.land, at: [cx + x0, y, z], depth, tilt: ((seed + wi) % 5 - 2) * 0.008, id: seed + wi * 3 });
      (parent || scene0).add(grp);
    });
  }
  let scene0 = null;

  registerStyle({
    id: 'soft-clay-saigon',
    name: 'Soft Clay: a queda de Saigon',
    topic: 'A queda de Saigon, 29 e 30 de abril de 1975',
    duration: DUR,
    fonts: [FONT],
    render: { samples: 40, shutter: 0, tone: 'neutral', exposure: 1.0, bloom: 0.05, bloomThreshold: 1.1, vignette: 0.22, grain: 0.014, fov: 28, background: '#0d3a3d' },

    build(S) {
      const { scene, camera } = S; scene0 = scene;
      const rnd = K.rng(11);

      const KEY = 1400;
      K.env(S, { top: '#f6f2ea', horizon: '#b9d2d0', bottom: '#3f6466', intensity: 0.22, panels: [{ pos: [-9, 12, 10], size: [16, 12], color: '#fff2df', power: 2.4 }] });
      const key = K.spot(S, { pos: [-7.5, 11, 9.5], target: [0.4, 1.3, -0.6], color: '#fff0dc', power: KEY, angle: 0.52, penumbra: 1, soft: 1.3, near: 6, far: 50, bias: -0.0003 });
      const sky = K.skyLight(S, { color: '#e2f2ff', power: 0.75, size: 11, center: [0, 1.5, 0], spread: 0.85 });

      // seamless paper sweep (as in the reference), long enough for the whole trip
      const FLOOR_BACK = -1.3, COVE = 1.9, WALL = FLOOR_BACK - COVE;
      {
        const front = 16, height = 16, Lf = front - FLOOR_BACK, La = Math.PI / 2 * COVE, L = Lf + La + height - COVE;
        const g = new THREE.PlaneGeometry(90, 1, 1, 120), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const s = (p.getY(i) + 0.5) * L, x = p.getX(i) + 14;
          if (s < Lf) p.setXYZ(i, x, 0, front - s);
          else if (s < Lf + La) { const a = (s - Lf) / COVE; p.setXYZ(i, x, COVE - COVE * Math.cos(a), FLOOR_BACK - COVE * Math.sin(a)); }
          else p.setXYZ(i, x, COVE + s - Lf - La, WALL);
        }
        g.computeVertexNormals();
        const tooth = K.canvasTex(256, 256, (ctx) => { const im = ctx.createImageData(256, 256), r = K.rng(9); for (let i = 0; i < im.data.length; i += 4) { im.data[i] = im.data[i + 1] = im.data[i + 2] = 128 + r.range(-60, 60); im.data[i + 3] = 255; } ctx.putImageData(im, 0, 0); }, { data: true, repeat: [50, L * 0.6] });
        const card = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: BOX.card, roughness: 0.93, bumpMap: tooth, bumpScale: 0.35 }));
        card.receiveShadow = true; scene.add(card);
      }

      // ================= A: rooftop, helicopter, ladder
      const roofGrp = new THREE.Group(); scene.add(roofGrp);
      roofGrp.add(at(BX(6.4, 1.9, 2.2, BOX.brick, { r: 0.1, tile: 2.2, marble: 0.25 }), 0, 0.95, 0));
      roofGrp.add(at(BX(6.7, 0.12, 2.5, BOX.white, { r: 0.04, tile: 2.2 }), 0, RY - 0.06, 0));
      for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) roofGrp.add(at(BX(0.52, 0.5, 0.06, BOX.navy, { r: 0.04, tile: 0.6, amt: 0.006, marble: 0.1 }), -2.35 + i * 0.94, 0.55 + row * 0.7, 1.12));
      roofGrp.add(at(BX(3.8, 0.6, 1.4, BOX.cream, { r: 0.08, tile: 1.6, marble: 0.2 }), 1.1, RY + 0.3, -0.3));
      // ladder from the roof up to the stairwell roof
      const ladder = new THREE.Group(); ladder.position.set(-0.1, (RY + PY) / 2, (0.95 + 0.46) / 2);
      const lang = Math.atan2(0.95 - 0.46, PY - RY), llen = Math.hypot(0.49, 0.6);
      ladder.rotation.x = lang;
      for (const x of [-0.14, 0.14]) ladder.add(at(BX(0.04, llen + 0.1, 0.05, BOX.wood, { r: 0.015, amt: 0.004, tile: 0.4 }), x, 0, 0));
      for (let i = 0; i < 5; i++) ladder.add(at(BX(0.3, 0.035, 0.04, BOX.wood, { r: 0.012, amt: 0.004, tile: 0.4 }), 0, -llen / 2 + 0.08 + i * (llen - 0.16) / 4, 0.02));
      roofGrp.add(ladder);
      // palms and a water tank on the roof for a bit of Saigon
      const tank = new THREE.Group(); tank.position.set(-2.55, RY, -0.35);
      tank.add(at(CYL(0.35, 0.35, 0.6, BOX.grey, { tile: 0.8 }), 0, 0.3, 0)); tank.add(at(CYL(0.3, 0.38, 0.12, BOX.dark, { tile: 0.6, marble: 0.1 }), 0, 0.66, 0)); roofGrp.add(tank);

      const heli = buildHeli(); scene.add(heli);
      const dust = Array.from({ length: 7 }, (_, i) => { const b = SPH(0.17, BOX.cream, { amt: 0.01, tile: 0.4, marble: 0.1 }); scene.add(b); return { b, a: i / 7 * Math.PI * 2 + 0.3 }; });

      const cols = [BOX.coral, BOX.yellow, BOX.blue, BOX.red, BOX.leaf, BOX.cream];
      const climbers = T.climb.map((s, i) => { const p = person(cols[i], BOX.skin); scene.add(p); return { p, s, qx: -0.85 - i * 0.5, qz: 0.78 + (i % 2) * 0.12 }; });
      const waiting = [[-3.0, 0.85, 4], [-2.75, 1.0, 5]].map(([x, z, c]) => { const p = person(cols[c], BOX.skin); p.position.set(x, RY, z); scene.add(p); return { p, x, z }; });

      // ================= B: avenue, palace, gate, tank
      const road = at(BX(10.5, 0.05, 1.9, BOX.road, { r: 0.02, tile: 2.5, marble: 0.15, amt: 0.01 }), GX + 0.6, 0.025, 0.1); scene.add(road);
      for (let i = 0; i < 9; i++) scene.add(at(BX(0.6, 0.02, 0.1, BOX.cream, { r: 0.008, amt: 0.003, tile: 0.4, marble: 0.1 }), GX - 5.5 + i * 1.1, 0.06, 0.1));
      const palace = buildPalace(); palace.position.set(6.3, 0, -0.9); palace.rotation.y = 0.9; scene.add(palace);
      const gate = buildGate(); scene.add(gate.post);
      for (const [x, z, s] of [[12.6, -1.0, 1.0], [14.2, 1.7, 0.85], [11.2, -0.95, 0.9], [3.2, 1.6, 0.9]]) {       // palms by the road
        const pm = new THREE.Group(); pm.position.set(x, 0, z);
        pm.add(at(CYL(0.07 * s, 0.1 * s, 1.5 * s, BOX.wood, { tile: 0.4, amt: 0.01 }), 0, 0.75 * s, 0));
        for (let k = 0; k < 6; k++) { const lf = at(BX(0.9 * s, 0.05, 0.22 * s, BOX.leaf, { r: 0.02, amt: 0.01, tile: 0.4 }), 0, 1.5 * s, 0); const arm = new THREE.Group(); arm.rotation.y = k * Math.PI / 3; lf.position.set(0.42 * s, 1.5 * s - 0.08 * s, 0); lf.rotation.z = -0.35; arm.add(lf); pm.add(arm); }
        scene.add(pm);
      }
      const tankG = buildTank(); scene.add(tankG);
      const puffs = Array.from({ length: 6 }, (_, i) => { const b = SPH(0.18, BOX.cream, { amt: 0.01, tile: 0.4, marble: 0.1 }); scene.add(b); return { b, a: -0.9 + i * 0.36 }; });

      // ================= C: the president (a silhouette), the flag, the name slab
      const flagC = flagSouth(1.0), poleC = CYL(0.03, 0.03, 2.3, BOX.dark, { amt: 0.004, tile: 0.3 });
      poleC.position.set(CX - 3.0, 1.15, -0.4); scene.add(poleC); flagC.position.set(CX - 3.0 + 0.55, 2.0, -0.4); scene.add(flagC);
      const silG = new THREE.Group(); silG.position.set(CX - 1.5, 0, 0.2); scene.add(silG);
      silG.add(at(CYL(0.55, 0.6, 0.12, BOX.navy, { tile: 0.8 }), 0, 0.06, 0));
      const silB = at(CAP(0.3, 0.55, BOX.sil, { tile: 0.8, marble: 0.2, amt: 0.015 }), 0, 0.82, 0); silG.add(silB);
      const silH = at(SPH(0.22, BOX.sil, { tile: 0.8, marble: 0.2, amt: 0.01 }), 0, 1.5, 0); silH.scale.set(0.92, 1.1, 0.7); silG.add(silH);
      const slab = new THREE.Group(); slab.position.set(CX + 1.9, 0.95, 0.35); slab.rotation.set(-0.1, -0.08, 0.01); scene.add(slab);
      slab.add(BX(5.1, 1.7, 0.26, BOX.navy, { r: 0.12, tile: 2.0, marble: 0.3, amt: 0.03, lsize: 0.9, dents: 4, dentSize: 0.35, dentDepth: 0.03 }));
      slab.add(at(BX(3.4, 0.5, 0.6, BOX.navy, { r: 0.1, tile: 1.4, marble: 0.3, amt: 0.02 }), 0, -1.1, -0.2));   // a foot so it stands

      // ================= D: soldiers laying down rifles
      const soldiers = [0, 1, 2, 3].map((i) => {
        const p = person(BOX.olive, BOX.skin, { helmet: BOX.olive2, s: 1.0 }); const x = DX - 1.9 + i * 1.25, z = (i % 2) * 0.25 - 0.1;
        p.position.set(x, 0, z); scene.add(p);
        const rifle = buildRifle(); scene.add(rifle);
        return { p, x, z, rifle, rz: rnd.range(-0.15, 0.15), face: i % 2 ? -1 : 1 };
      });

      // ================= words
      const stuck = [];
      const wmat = clay(BOX.cream, { marbleAmount: 0.18 });
      wordLumps(T.wordsA, { font: FONT, size: 0.95, depth: 0.38, bevel: 0.12, bevelSegments: 4 }, -2.2, 5.6, WALL, 0.4, null, 40, wmat, stuck);
      wordLumps(T.wordsA2, { font: FONT, size: 0.95, depth: 0.38, bevel: 0.12, bevelSegments: 4 }, -2.2, 4.7, WALL, 0.4, null, 80, clay(BOX.yellow, { marbleAmount: 0.25 }), stuck);
      wordLumps(T.wordsB, { font: FONT, size: 1.25, depth: 0.45, bevel: 0.14, bevelSegments: 4 }, 9.3, 3.9, WALL, 0.45, null, 120, wmat, stuck);
      // the name slab: words slapped onto the front of it
      wordLumps([{ text: 'Duong', land: T.name[0] }, { text: 'Van', land: T.name[1] }, { text: 'Minh', land: T.name[2] }], { font: FONT, size: 0.58, depth: 0.16, bevel: 0.05, bevelSegments: 4 }, 0, 0.32, 0.13, 0.16, slab, 160, clay(BOX.cream, { marbleAmount: 0.12 }), stuck);
      wordLumps([{ text: '2', land: T.two }, { text: 'dias', land: T.dias }], { font: FONT, size: 0.58, depth: 0.16, bevel: 0.05, bevelSegments: 4 }, 0, -0.38, 0.13, 0.16, slab, 200, clay(BOX.yellow, { marbleAmount: 0.25 }), stuck);

      // ================= camera: one continuous dolly from the roof to the soldiers
      const cam = {
        pos: K.path([[0, [-1.6, 3.5, 7.8]], [1.6, [-0.2, 3.7, 9.2]], [3.5, [0.8, 4.0, 10.2]], [4.9, [5.5, 3.4, 11.8]], [5.9, [11.6, 3.0, 12.4]], [7.2, [13.2, 2.9, 9.8]], [8.8, [13.0, 2.8, 9.4]], [9.9, [18.4, 2.6, 9.6]], [12.4, [18.8, 2.6, 9.0]], [13.1, [26.0, 2.2, 6.4]], [15, [26.0, 2.1, 5.6]]]),
        aim: K.path([[0, [-0.6, 3.4, 0]], [1.6, [0.5, 3.6, 0]], [3.5, [0.4, 3.8, 0]], [4.9, [6.5, 2.4, 0]], [5.9, [10.0, 1.6, 0]], [7.2, [9.3, 1.6, 0]], [8.8, [9.0, 1.6, 0]], [9.9, [18.5, 1.0, 0]], [12.4, [18.7, 1.0, 0]], [13.1, [26.0, 0.7, 0]], [15, [26.0, 0.7, 0]]]),
        ap: K.track([[0, 0.04], [4, 0.035], [8, 0.035], [15, 0.035]]),
      };

      return {
        update(t) {
          const tq = pose(t);

          // ----- A: helicopter
          const hu = since(tq, LIFT), hs = Math.max(0, tq - LIFT);
          const hp = heli.userData;
          hp.rotor.rotation.y = -tq * POSES * 0.8; hp.tail.rotation.z = tq * POSES * 1.2;
          let hx = HELI0[0], hy = HELI0[1], hz = HELI0[2], tilt = 0, sq = [1, 1];
          if (hu < 0) { hy += nudge(31, tq, 0.006); tilt = nudge(32, tq, 0.004); }
          else {
            hy += 1.6 * Math.pow(hs, 1.7) + (hu === 0 ? -0.04 : 0); hx += 1.8 * Math.pow(hs, 2.2); hz += 0.3 * hs;
            tilt = -0.2 * Math.min(1, hs / 0.5) + nudge(33, tq, 0.01); sq = hu === 0 ? [1.02, 0.95] : [1, 1];
          }
          heli.position.set(hx, hy, hz); heli.rotation.set(0, 0, tilt); heli.scale.set(sq[0], sq[1], 1);
          for (const d of dust) {
            const a = hu; d.b.visible = a >= 1 && a <= 7;
            if (d.b.visible) { const r = 0.5 + 0.28 * a; d.b.position.set(HELI0[0] + 0.3 + Math.cos(d.a) * r * 1.4, PY + 0.1 + 0.05 * a, HELI0[2] + Math.sin(d.a) * r * 0.6); d.b.scale.setScalar(Math.max(0.1, 1 - a / 8)); }
          }
          // ----- A: people climbing
          const LX = -0.1, DXD = 0.95, bob = (Math.round(tq * POSES / 2) % 2) ? 0.045 : 0;
          for (const c of climbers) {
            const u = tq - c.s; let x = c.qx, y = RY, z = c.qz, vis = true, lean = 0;
            if (u < 0) { y += nudge(c.s * 10, tq, 0.004); }
            else if (u < 0.55) { const f = u / 0.55; x = K.lerp(c.qx, LX, f); z = K.lerp(c.qz, 0.98, f); y = RY + bob; }
            else if (u < 1.2) { const f = (u - 0.55) / 0.65; x = LX; z = K.lerp(0.98, 0.5, f); y = K.lerp(RY, PY, f) + bob * 0.7; lean = -0.22; }
            else if (u < 1.65) { const f = (u - 1.2) / 0.45; x = K.lerp(LX, DXD, f); z = 0.32; y = PY + bob; }
            else vis = false;
            c.p.visible = vis; c.p.position.set(x, y, z); c.p.rotation.set(lean, 0, 0);
            c.p.userData.aL.rotation.z = u > 0 && u < 1.65 ? (bob ? 0.5 : -0.3) : 0; c.p.userData.aR.rotation.z = u > 0 && u < 1.65 ? (bob ? -0.3 : 0.5) : 0;
          }
          for (const w of waiting) { w.p.position.set(w.x + nudge(w.x, tq, 0.01), RY + (nudge(w.z, tq, 0.01) > 0 ? 0.02 : 0), w.z); }

          // ----- B: tank and gate
          const nose = tankNose(tq), tOn = tq >= snap(T.tank0 - 0.4);
          tankG.visible = tOn && nose < GX + 9;
          const ha = since(tq, HIT), moving = tq < HIT + 1.1;
          const tpos = [nose - 1.35, 0, 0.12];
          const recoil = ha === 0 ? 0.05 : ha === 1 ? -0.03 : 0;
          tankG.position.set(tpos[0] + recoil, (moving ? (since(tq, 0) % 2 ? 0.015 : 0) : 0), tpos[2]);
          tankG.rotation.set(0, Math.PI, 0); tankG.rotation.y = Math.PI;      // the tank is built facing +x; it drives toward -x
          tankG.rotation.z = ha >= 0 && ha < 4 ? 0.025 * (ha % 2 ? -1 : 1) : (moving ? nudge(41, tq, 0.008) : 0);
          tankG.userData.flag.rotation.y = nudge(43, tq, 0.35);
          const fall = ha < 0 ? 0 : ha === 0 ? 0.3 : ha === 1 ? 0.8 : ha === 2 ? 1.3 : ha === 3 ? 1.62 : ha === 4 ? 1.5 : 1.545;
          gate.leaves.forEach((l, i) => { l.rotation.z = fall + (ha >= 0 && ha < 6 ? nudge(50 + i, tq, 0.03) : 0); });
          for (const p of puffs) { p.b.visible = ha >= 0 && ha <= 7; if (p.b.visible) { p.b.position.set(GX - 0.3 - 0.35 * ha, 0.14 + 0.07 * ha, 0.1 + Math.sin(p.a * 2.2) * (0.5 + 0.18 * ha)); p.b.scale.setScalar(Math.max(0.1, 1.1 - ha / 8)); } }
          palace.userData.flag.rotation.y = nudge(44, tq, 0.3);

          // ----- C: president, slab, flag
          { const a = since(tq, T.sil), s = a < 0 ? null : a === 0 ? [1.3, 0.5] : a === 1 ? [0.85, 1.22] : a === 2 ? [1.06, 0.94] : [1, 1];
            silG.visible = !!s; if (s) { silG.scale.set(s[0], s[1], s[0]); silG.rotation.z = a < 5 ? nudge(61, tq, 0.02) : 0; } }
          { const a = since(tq, T.flagC); flagC.visible = poleC.visible = a >= 0; flagC.rotation.y = nudge(62, tq, 0.25); }
          { const a = since(tq, T.slab), s = a < 0 ? null : a === 0 ? [1.1, 0.55] : a === 1 ? [0.95, 1.16] : a === 2 ? [1.02, 0.96] : [1, 1];
            slab.visible = !!s; if (s) slab.scale.set(s[0], s[1], 1); }

          // ----- D: soldiers
          soldiers.forEach((sd, i) => {
            const a = since(tq, T.sold[i]), s = a < 0 ? null : a === 0 ? [1.3, 0.5] : a === 1 ? [0.85, 1.25] : a === 2 ? [1.06, 0.94] : [1, 1];
            sd.p.visible = !!s; if (s) { sd.p.scale.set(s[0], s[1], s[0]); }
            const l = since(tq, T.lay[i]);
            // the rifle starts upright by the soldier's side and goes down in four poses
            const ang = l < 0 ? Math.PI / 2 : l === 0 ? 1.05 : l === 1 ? 0.45 : l === 2 ? 0.1 : 0;
            const px = sd.x + 0.22 * sd.face, onGround = l >= 3;
            sd.rifle.visible = !!s;
            if (l < 0) sd.rifle.position.set(px, 0.3, sd.z + 0.05); else if (l <= 2) sd.rifle.position.set(px + 0.12 * sd.face * (l + 1) * 0.5, 0.3 - 0.09 * (l + 1), sd.z + 0.1 + 0.05 * l); else sd.rifle.position.set(sd.x, 0.045, sd.z + 0.55);
            sd.rifle.rotation.set(0, onGround ? sd.rz + (sd.face > 0 ? 0 : Math.PI) : (sd.face > 0 ? 0 : Math.PI), l < 0 ? Math.PI / 2 * sd.face : (sd.face * ang));
            if (l >= 0 && l <= 2) sd.p.userData.aR.rotation.z = 0.3 - 0.1 * l; else if (s) sd.p.userData.aR.rotation.z = 0;
            if (s) sd.p.rotation.z = (l >= 0 && l <= 3) ? nudge(70 + i, tq, 0.02) : 0;
          });

          // ----- stuck words
          for (const w of stuck) {
            const a = since(tq, w.land), s = a === 0 ? [1.2, 0.45] : a === 1 ? [0.93, 1.22] : a === 2 ? [1.03, 0.94] : [1, 1], loose = K.clamp(1 - a / 5);
            w.m.visible = a >= 0;
            w.m.scale.set(s[0], s[0], s[1]);
            w.m.position.set(w.at[0] + nudge(w.id, tq, 0.02) * loose, w.at[1] + nudge(w.id + 0.3, tq, 0.02) * loose, w.at[2] + w.depth * s[1] / 2 - 0.03);
            w.m.rotation.z = w.tilt + nudge(w.id + 0.6, tq, 0.07) * loose;
          }

          // ----- the lamp and the camera follow the shot
          const aim = cam.aim(t), pos = cam.pos(t);
          key.intensity = KEY * (1 + nudge(1, tq, 0.012));
          key.position.set(aim[0] - 7.5, 11, 9.5); key.target.position.set(aim[0] + 0.4, 1.3, -0.6);
          sky.target.position.set(aim[0], 1.5, 0);
          K.look(camera, pos, aim); K.focus(camera, [aim[0], aim[1], -0.3], cam.ap(t));
        },
      };
    },

    sound(k) {
      const K = globalThis.K, r = K.rng(5);
      // rotor: a low chop under the helicopter, fading as it leaves (a reason: the place is loud before it flies off)
      for (let x = 0.1; x < 4.6; x += 0.135) { const g = x < LIFT ? 0.9 : Math.max(0.1, 1 - (x - LIFT) / 1.2); k.noise(x, { dur: 0.07, color: 'brown', filter: 'lowpass', f: 260, gain: 0.2 * g, pan: K.map(x, 0, 4.6, -0.3, 0.5) }); }
      k.play('whoosh', LIFT - 0.05, { gain: 0.3, dur: 0.9, pan: 0.2 });
      // words slapped on the wall and slab
      const slap = (t, f, pan, g = 1) => { k.play('slap', t, { gain: 0.45 * g, pan }); k.play('pop', t, { gain: 0.5 * g, f, pan }); };
      T.wordsA.forEach((w, i) => slap(w.land, 520 + i * 90, -0.3)); T.wordsA2.forEach((w) => slap(w.land, 700, -0.3));
      T.wordsB.forEach((w, i) => slap(w.land, 480 + i * 90, 0));
      // the tank: engine rumble in, hit on the gate
      k.play('roller', T.tank0, { gain: 0.55, dur: HIT - T.tank0 + 0.2, pan: 0.2 });
      k.play('impact', HIT, { gain: 0.9, pan: -0.1 });
      [HIT + 2 / POSES, HIT + 4 / POSES, HIT + 5 / POSES].forEach((t, i) => k.play('tock', t, { gain: 0.5, f: 520 - i * 90, pan: -0.15 }));
      // the president
      k.play('pop', T.sil, { gain: 0.5, f: 300, pan: -0.2 }); k.play('slap', T.slab, { gain: 0.6, pan: 0.2 }); k.play('press', T.slab, { gain: 0.5, pan: 0.2 });
      T.name.forEach((t, i) => slap(t, 330 + i * 60, 0.2));
      slap(T.two, 440, 0.2, 1.1); slap(T.dias, 380, 0.2, 1.1);
      // soldiers and rifles
      T.sold.forEach((t, i) => k.play('pop', t, { gain: 0.45, f: 260 + i * 40, pan: -0.3 + i * 0.2 }));
      T.lay.forEach((t, i) => { k.play('tock', t + 3 / POSES, { gain: 0.7, f: 300 - i * 20, pan: -0.3 + i * 0.2 }); k.noise(t + 3 / POSES, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 700, gain: 0.25, pan: -0.3 + i * 0.2 }); });
      k.bed('room', 0, DUR, { gain: 0.7 });
      k.music('pad', 0, DUR, { bpm: 60, gain: 0.3, chords: [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4']] });
    },
  });
}
