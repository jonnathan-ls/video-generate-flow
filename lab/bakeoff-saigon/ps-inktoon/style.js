// ps-inktoon: "Ink and Toon" applied to the fall of Saigon (29-30 April 1975), 15 s, PT-BR narration already recorded.
// Everything is a pure function of t; no Math.random, no timers.
window.STYLE = (() => {
  const INK = '#1c1622', PAPER = '#f7ecd6';
  const PAL = {
    sand: { lit: '#e3c98f', shade: '#b79256', deep: '#8d6c3a' },
    sandDot: { lit: '#d3b273', shade: '#b79256', deep: '#8d6c3a' },
    road: { lit: '#7b82a0', shade: '#4a5070', deep: '#363b57' },
    olive: { lit: '#86963f', shade: '#4f5a2a', deep: '#363e1c', gloss: '#dfe8a8' },
    oliveD: { lit: '#5f6b2e', shade: '#3a4220', deep: '#262c14', gloss: '#c9d48c' },
    cream: { lit: '#f7e8cc', shade: '#b9c4b4' },
    paper: { lit: '#fffdf6', shade: '#c9dcd4' },
    persimmon: { lit: '#ee5a36', shade: '#ae2f33', gloss: '#ffd2bd' },
    mustard: { lit: '#f6b63c', shade: '#c9722c', gloss: '#fff1c4' },
    navy: { lit: '#3b4568', shade: '#222641', gloss: '#b4c0e6' },
    skin: { lit: '#f0c9a0', shade: '#c58d6a' },
    figure: { lit: '#3a3150', shade: '#1c1622', gloss: '#9a90bd' },
  };
  const DPS = 15, F = 1 / DPS;
  // times (s) from palavras.json; the picture changes on the first drawing at or after each
  const X0 = 3.0, GZ = 3.4;                       // palace avenue centre x, gate wall z
  const HX = -8.0, HY = 2.5;                      // helicopter pad
  const T = { land: 1.26, climb: [1.5, 1.95, 2.4], lift: 3.49, tankIn: 5.3, hit: 7.97, stop: 8.85, fig: 9.3, nameIn: 10.6, flip: 12.07, nameOut: 12.85, soldiers: 12.6, drop: [13.81, 14.05, 14.29] };
  const snap = (t) => Math.ceil(t * DPS - 1e-3) / DPS;
  function inkKit(S, o = {}) {
    const { THREE, K } = S, px = S.H / 1080;
    const G = { res: { value: new THREE.Vector2(S.W, S.H) }, light: { value: new THREE.Vector3(0, 1, 0) }, up: { value: new THREE.Vector3(0, 1, 0) }, seed: { value: 0 }, pitch: { value: (o.pitch || 11) * px } };
    const srgb = (hex) => new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

    // One hard sun. Its direction is the "hand-placed shadow shape": low and from the side gives big readable shadows.
    const sun = K.sun(S, { pos: o.sun || [-6.2, 6.2, 4.8], target: o.sunTarget || [0.3, 1, 0], power: Math.PI, size: o.sunSize || 6.5, mapSize: 4096, normalBias: 0.03 });

    // FILL. MeshToonMaterial with a plain 0..1 ramp as its gradient map, so three.js hands us one number per pixel:
    // how lit it is (half-Lambert times the cast shadow). The patch turns that number into print: lit colour, shadow
    // colour, a band of halftone dots where light turns into shadow, optional hatching inside the shadow, and a
    // hard-edged highlight (a round glint, or a vertical streak down turned shapes).
    const ramp = new THREE.DataTexture(new Uint8Array(1024).map((_, i) => (i % 4 === 3 ? 255 : i >> 2)), 256, 1);
    ramp.minFilter = ramp.magFilter = THREE.LinearFilter; ramp.needsUpdate = true;
    const FILL_PARS = `
      uniform vec3 uLit, uShade, uDeep, uGloss, uUp; uniform float uThr, uBand, uPitch, uHatch, uGlossSize, uStreak;`;
    const FILL_MAIN = `{
      float v = outgoingLight.r;                                            // 0 = in shadow, 1 = facing the light
      float k = clamp((v - uThr) / max(uBand, 1e-4), 0.0, 1.0);             // 0 at the shadow edge, 1 in full light
      vec2 g = mat2(0.819, 0.574, -0.574, 0.819) * gl_FragCoord.xy / uPitch;   // dot screen, turned 35 degrees, fixed to the page
      float rad = 0.74 * (1.0 - k), aa = 0.8 / uPitch;                      // dots grow until they merge into solid shadow
      float tone = v < uThr ? 1.0 : (1.0 - smoothstep(rad - aa, rad + aa, length(fract(g) - 0.5))) * step(k, 0.999);
      vec3 c = mix(uLit, uShade, tone);
      if (uHatch > 0.0) {                                                   // pen hatching inside the shadow
        float sp = uPitch * 1.3, h = abs(fract((gl_FragCoord.x + gl_FragCoord.y) / sp) - 0.5) * sp;
        float lw = uHatch * (0.75 + 0.5 * sin(gl_FragCoord.x * 0.011 - gl_FragCoord.y * 0.017));
        c = mix(c, uDeep, (1.0 - smoothstep(lw - 0.7, lw + 0.7, h)) * step(v, uThr));
      }
      #if NUM_DIR_LIGHTS > 0
        vec3 hv = normalize(directionalLights[0].direction + normalize(vViewPosition));
        float lit = step(uThr + uBand, v);
        if (uGlossSize > 0.0) c = mix(c, uGloss, step(1.0 - uGlossSize, dot(normal, hv)) * lit);
        if (uStreak > 0.0) {                                                // the long glint down a turned shape
          float ny = dot(normal, uUp); vec3 nh = normalize(normal - uUp * ny), hh = normalize(hv - uUp * dot(hv, uUp));
          c = mix(c, uGloss, step(1.0 - uStreak, dot(nh, hh)) * step(abs(ny), 0.55) * lit);
        }
      #endif
      outgoingLight = c;
    }`;
    function fill(c, f = {}) {
      const m = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: ramp, side: f.side || THREE.FrontSide });
      const u = m.userData.u = { uLit: { value: new THREE.Color(c.lit) }, uShade: { value: new THREE.Color(c.shade) }, uDeep: { value: new THREE.Color(c.deep || c.shade) }, uGloss: { value: new THREE.Color(c.gloss || '#ffffff') },
        uUp: G.up, uPitch: G.pitch, uThr: { value: f.thr == null ? 0.56 : f.thr }, uBand: { value: f.band == null ? 0.1 : f.band }, uHatch: { value: (f.hatch || 0) * px }, uGlossSize: { value: f.gloss || 0 }, uStreak: { value: f.streak || 0 } };
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, u);
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + FILL_PARS).replace('#include <opaque_fragment>', FILL_MAIN + '\n#include <opaque_fragment>');
      };
      return m;
    }

    // OUTLINE: the inverted hull. A back-faced copy of the mesh in ink, pushed outwards along its normals by a number
    // of screen pixels. The push is not even: it swells on the side away from the light, thins towards the light and
    // wavers along the form, like a brush line. Needs smooth normals (turned, rounded and tube shapes all have them).
    function hull(width, color) {
      return new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { uRes: G.res, uLight: G.light, uSeed: G.seed, uWidth: { value: width * px }, uColor: { value: new THREE.Color(color) } },
        vertexShader: `uniform vec2 uRes; uniform vec3 uLight; uniform float uWidth, uSeed;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * normal);
            float waver = 0.6 * sin(dot(position, vec3(7.1, 5.3, 6.7)) + uSeed * 2.1) + 0.4 * sin(dot(position, vec3(-17.3, 12.9, 15.1)) + uSeed * 5.3);
            float w = uWidth * (1.0 + 0.3 * waver) * mix(0.55, 1.45, smoothstep(-0.6, 0.8, -dot(n, uLight)));
            // surfaces that face the ground come a little towards the lens, so the line survives where a prop stands on it
            mv.xyz *= 1.0 - 0.006 * smoothstep(0.85, 1.0, -normalize(mat3(modelMatrix) * normal).y);
            gl_Position = projectionMatrix * mv;
            gl_Position.xy += n.xy / max(length(n.xy), 0.35) * w * 2.0 / uRes * gl_Position.w;
          }`,
        fragmentShader: 'uniform vec3 uColor; void main() { gl_FragColor = vec4(uColor, 1.0); }',
      });
    }
    const outline = (mesh, width = 4.2, color = INK) => { const h = new THREE.Mesh(mesh.geometry, hull(width, color)); h.frustumCulled = false; mesh.add(h); return mesh; };
    // a filled, outlined, shadow-casting solid: the basic building block
    const solid = (geo, mat, parent, f = {}) => { const m = new THREE.Mesh(geo, mat); m.castShadow = f.cast !== false; m.receiveShadow = true; if (f.line !== 0) outline(m, f.line); if (parent) parent.add(m); return m; };

    const flat = (color) => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    // INNER LINES: a thin ink line round a turned shape at height y, drawn only part of the way (angles in degrees,
    // 0 = right, 90 = towards the camera) so it breaks off on the lit side. Thinner than the outline on purpose.
    const crease = (parent, r, y, a0 = -70, a1 = 105, w = 0.0085) => { const n = 28, pts = Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
      const m = new THREE.Mesh(K.tube(pts, w, { segments: 56, radial: 5 }), flat(INK)); parent.add(m); return m; };

    // TURNED SHAPES: a profile of [radius, height] points, corners softened, spun round the axis. Draw the profile from
    // the bottom of the axis, out, up the outside, over the lip and back down the inside, so the shape is closed.
    const soften = (pts, n = 2) => { for (; n > 0; n--) { const q = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } q.push(pts[pts.length - 1]); pts = q; } return pts; };
    const turned = (pts, seg = 64, n = 2) => new THREE.LatheGeometry(soften(pts, n).map(([r, y]) => new THREE.Vector2(r, y)), seg);

    // MARKS: brush strokes as flat geometry (speed lines, impact bursts, steam, arrows). strokes([[points, width,
    // taper], ...]) -> one geometry in the XY plane; taper 'both' | 'head' | 'tail' | 'none' thins the ends like a brush.
    function strokes(list, grow = 0) {
      const pos = [], idx = [];
      for (let [pts, w, taper = 'both'] of list) {
        while (pts.length < 5) pts = pts.flatMap((p, i) => (i ? [[(p[0] + pts[i - 1][0]) / 2, (p[1] + pts[i - 1][1]) / 2], p] : [p]));   // short strokes need points to taper over
        const n = pts.length, base = pos.length / 3;
        for (let i = 0; i < n; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, u = i / (n - 1);
          const k = taper === 'both' ? Math.pow(Math.sin(Math.PI * u), 0.5) : taper === 'head' ? Math.pow(1 - u, 0.6) : taper === 'tail' ? Math.pow(u, 0.6) : 1;
          const hw = (w * k + grow * Math.min(1, k * 3)) / 2;
          pos.push(pts[i][0] - dy / l * hw, pts[i][1] + dx / l * hw, 0, pts[i][0] + dy / l * hw, pts[i][1] - dx / l * hw, 0);
          if (i < n - 1) idx.push(base + 2 * i, base + 2 * i + 1, base + 2 * i + 2, base + 2 * i + 1, base + 2 * i + 3, base + 2 * i + 2);
        }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
    }
        // an ink mark, or (with a colour) a coloured mark with an ink edge
    function mark(list, color, edge = 0.03) {
      const g = new THREE.Group();
      if (!color) { g.add(new THREE.Mesh(strokes(list), flat(INK))); return g; }
      g.add(new THREE.Mesh(strokes(list, edge * 2), flat(INK)));
      const top = new THREE.Mesh(strokes(list), flat(color)); top.position.z = 0.004; g.add(top);
      return g;
    }
    const arc = (r, a0, a1, n = 24, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [Math.cos(a) * r, Math.sin(a) * ry]; });
    // radial impact ticks around an ellipse
    const burst = (n, rx, ry, len, w, seed = 1) => { const r = K.rng(seed); return Array.from({ length: n }, (_, i) => { const a = (i + r.range(-0.25, 0.25)) / n * Math.PI * 2, l = len * r.range(0.6, 1.25), c = Math.cos(a), s = Math.sin(a); return [[[c * rx, s * ry], [c * (rx + l * 0.5), s * (ry + l * 0.5)], [c * (rx + l), s * (ry + l)]], w, 'head']; }); };

    // LETTERING: display type drawn like a comic sound effect: slanted, cream face with a dot-screen fade, heavy ink
    // edge and a solid colour block behind it. Returns a flat mesh; `height` is the world height of a capital.
    function lettering(text, f = {}) {
      const fpx = 260, font = `${fpx}px "Anton"`, sk = -0.13, dep = 26, lw = 30, pad = 54, ls = '10px';
      const m = document.createElement('canvas').getContext('2d'); m.font = font; m.letterSpacing = ls;
      const mt = m.measureText(text), asc = Math.ceil(mt.actualBoundingBoxAscent), W = Math.ceil(mt.width + pad * 2 + dep + asc * -sk), H = asc + pad * 2 + dep, x = pad, y = pad + asc;
      const prep = (c) => { c.font = font; c.letterSpacing = ls; c.lineJoin = 'round'; c.textBaseline = 'alphabetic'; c.setTransform(1, 0, sk, 1, -sk * y, 0); c.lineWidth = lw; c.strokeStyle = INK; };
      const tex = K.canvasTex(W, H, (ctx) => {
        prep(ctx);
        for (let k = dep; k >= 0; k -= 2) ctx.strokeText(text, x + k, y + k);                    // ink round the whole block
        ctx.fillStyle = f.block || PAL.persimmon.lit; for (let k = dep; k > 0; k -= 1) ctx.fillText(text, x + k, y + k);   // the block
        ctx.strokeText(text, x, y); ctx.fillStyle = f.face || PAPER; ctx.fillText(text, x, y);   // the face
        const dots = document.createElement('canvas'); dots.width = W; dots.height = H; const d = dots.getContext('2d');   // dot-screen fade up from the baseline
        d.fillStyle = f.dots || PAL.mustard.lit;
        for (let j = -2; j < H / 13 + 2; j++) for (let i = -2; i < W / 13 + 2; i++) { const cx = i * 15 + (j % 2) * 7.5, cy = j * 13, r = 9.4 * K.clamp((cy - (y - asc * 0.62)) / (asc * 0.6)); if (r > 0.5) { d.beginPath(); d.arc(cx, cy, r, 0, 7); d.fill(); } }
        prep(d); d.globalCompositeOperation = 'destination-in'; d.fillStyle = '#000'; d.fillText(text, x, y);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(dots, 0, 0);
      });
      const unit = (f.height || 0.6) / asc, mesh = new THREE.Mesh(new THREE.PlaneGeometry(W * unit, H * unit), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      mesh.userData.size = [W * unit, H * unit]; return mesh;
    }
    // the step number in a starburst
    function badge(text, f = {}) {
      const tex = K.canvasTex(420, 420, (ctx) => {
        const r = K.rng(text + 'b'); ctx.translate(210, 210); ctx.lineJoin = 'round';
        ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = (i % 2 ? 142 : 188) * r.range(0.95, 1.05); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
        ctx.save(); ctx.translate(12, 14); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
        ctx.fillStyle = f.color || PAL.mustard.lit; ctx.fill(); ctx.lineWidth = 15; ctx.strokeStyle = INK; ctx.stroke();
        ctx.font = '230px "Anton"'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK; ctx.fillText(text, 0, 84);
      });
      const s = f.height || 0.8; return new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    }
    // a caption box, as in a graphic novel: hand-written note on a slip of paper with an inked edge
    function caption(text, f = {}) {
      const fpx = 150, font = `700 ${fpx}px "Caveat"`, m = document.createElement('canvas').getContext('2d'); m.font = font;
      const tw = Math.ceil(m.measureText(text).width), bw = tw + 110, bh = 190, W = bw + 60, H = bh + 60;
      const tex = K.canvasTex(W, H, (ctx) => {
        const r = K.rng(text), j = () => r.range(-7, 7), box = (dx, dy) => { ctx.beginPath(); ctx.moveTo(20 + dx + j(), 20 + dy + j()); ctx.lineTo(20 + bw + dx + j(), 20 + dy + j()); ctx.lineTo(20 + bw + dx + j(), 20 + bh + dy + j()); ctx.lineTo(20 + dx + j(), 20 + bh + dy + j()); ctx.closePath(); };
        ctx.lineJoin = 'round'; box(14, 16); ctx.fillStyle = INK; ctx.fill();
        box(0, 0); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.stroke();
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK; ctx.fillText(text, 20 + bw / 2, 20 + bh / 2 + 6);
      });
      const unit = (f.height || 0.42) / bh, mesh = new THREE.Mesh(new THREE.PlaneGeometry(W * unit, H * unit), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      mesh.userData.size = [W * unit, H * unit]; return mesh;
    }

    // PRINT FINISH: a filter over the finished picture. Edges wander by about a pixel and are "redrawn" a few times a
    // second (line boil), paper tooth and fibres multiply through the colour, tiny pinholes where ink did not take,
    // and a hand-ruled panel border with bare paper outside it.
    function print(f = {}) {
      return S.addFilter(`uniform vec3 uPaper, uInk; uniform float uBoil, uBorder;
        float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
        void main(){
          float s = res.y / 1080.0; vec2 px = vUv * res; float b = floor(time * uBoil);
          vec2 w = (vec2(vn(px / (42.0 * s) + b * 7.31), vn(px / (42.0 * s) + 19.7 - b * 3.17)) - 0.5) * 3.0 * s;
          vec3 c = texture2D(tex, (px + w) / res).rgb;
          if (uBorder > 0.0) {
            vec2 q = abs(px + w * 1.6 - res * 0.5) - (res * 0.5 - (uBorder + 16.0) * s);
            float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 16.0 * s, lw = (2.6 + 1.5 * vn(px / (120.0 * s))) * s;
            c = mix(c, uInk, 1.0 - smoothstep(lw - 0.8, lw + 0.8, abs(d)));
            c = mix(c, uPaper, smoothstep(lw - 0.6, lw + 0.8, d));
          }
          float tooth = 0.6 * vn(px / (1.8 * s)) + 0.4 * vn(px / (6.0 * s)), fibre = vn(px * vec2(0.03, 0.8) / s + 3.0);
          c *= mix(vec3(1.0), uPaper, 0.3) * (0.95 + 0.07 * tooth + 0.025 * fibre);
          c = mix(c, uPaper, 0.4 * step(0.9988, h21(floor(px / (2.0 * s)) + 5.0)));
          gl_FragColor = vec4(c, 1.0);
        }`, { uPaper: { value: srgb(PAPER) }, uInk: { value: srgb(INK) }, uBoil: { value: f.boil == null ? 6 : f.boil }, uBorder: { value: f.border == null ? 26 : f.border } });
    }

    // call once per update(t), after the camera is placed: gives the outline and the fills the light and "up" in view space
    const frame = (t, camera) => {
      camera.updateMatrixWorld();
      G.light.value.copy(sun.position).sub(sun.target.position).normalize().transformDirection(camera.matrixWorldInverse);
      G.up.value.set(0, 1, 0).transformDirection(camera.matrixWorldInverse);
      G.seed.value = Math.floor(t * 6);
    };
    return { G, sun, fill, outline, solid, turned, crease, strokes, mark, arc, burst, lettering, badge, caption, print, frame, flat };
  }

  return registerStyle({
    id: 'ps-inktoon',
    name: 'Ink and Toon: Saigon',
    family: 'Filters over 3D',
    duration: 15,
    fonts: ['260px "Anton"', '700 150px "Caveat"'],
    render: { samples: 16, preview: 2, shutter: 0, tone: 'linear', exposure: 1, bloom: 0, vignette: 0, grain: 0, fov: 26, background: PAL.sand.lit },

    build(S) {
      const { THREE, K, scene, camera } = S;
      const ink = inkKit(S, { sun: [-6.5, 6.2, 4.8], sunTarget: [0, 1, 0], sunSize: 8.5 }), { fill, solid, turned, mark, arc, burst } = ink;
      ink.print();
      const M = {
        sand: fill(PAL.sand, { band: 0, hatch: 1.7 }), sandDot: fill(PAL.sandDot, { band: 0, hatch: 1.7 }), road: fill(PAL.road, { band: 0.05, hatch: 1.4 }),
        olive: fill(PAL.olive, { gloss: 0.02, streak: 0.02 }), oliveD: fill(PAL.oliveD, { gloss: 0.03 }), cream: fill(PAL.cream), paper: fill(PAL.paper, { band: 0.06 }),
        persimmon: fill(PAL.persimmon, { gloss: 0.03 }), mustard: fill(PAL.mustard, { gloss: 0.02 }), navy: fill(PAL.navy, { gloss: 0.04 }), skin: fill(PAL.skin), figure: fill(PAL.figure, { gloss: 0.03 }),
      };
      const mk = (parent = scene) => { const g = new THREE.Group(); if (parent) parent.add(g); return g; };
      const sphere = (r) => new THREE.SphereGeometry(r, 20, 14);
      const cyl = (r0, r1, h, seg = 14) => new THREE.CylinderGeometry(r0, r1, h, seg);
      const box = (w, h, d, r, mat, x, y, z, parent = scene, f) => { const m = solid(K.roundedBox(w, h, d, r, 3), mat, parent, f); m.position.set(x, y, z); return m; };
      const pop = (x, d = 0.25) => (x < 0 ? 0 : K.ease.outBack(Math.min(1, (x + F / 2) / d), 2.4));
      const wobble = (x, f = 3.4, k = 9) => (x <= 0 ? 0 : Math.exp(-k * x) * Math.sin(x * 2 * Math.PI * f));
      const Xv = new THREE.Vector3(1, 0, 0), dv = new THREE.Vector3();
      const rig = (inner) => { const outer = mk(), mid = mk(outer); mid.add(inner); return { outer, inner, set(p, p0, max = 0.9) {
        dv.set(p[0] - p0[0], p[1] - p0[1], p[2] - p0[2]); const speed = dv.length() / F, s = 1 + Math.min(max, Math.max(0, speed - 7) * 0.04);
        outer.position.set(p[0], p[1], p[2]); outer.quaternion.identity(); if (s > 1) outer.quaternion.setFromUnitVectors(Xv, dv.normalize());
        mid.quaternion.copy(outer.quaternion).invert(); outer.scale.set(s, 1 / Math.sqrt(s), 1 / Math.sqrt(s));
      } }; };

      // ---- ground, with a field of printed dots near both sets
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), M.sand); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
      { const pts = []; for (const [cx, cz] of [[-8.6, 1.5], [X0, 3.2]]) for (let j = -9; j <= 9; j++) for (let i = -11; i <= 11; i++) { const r = 0.8, x = cx + (i + (j & 1) * 0.5) * r, z = cz + j * r * 0.866, d = Math.hypot(x - cx, (z - cz) * 1.2), s = 0.16 * (1 - K.smooth(3.5, 9, d)); if (s > 0.02) pts.push([x, z, s]); }
        const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 18).rotateX(-Math.PI / 2), M.sandDot, pts.length); dots.receiveShadow = true;
        pts.forEach(([x, z, s], i) => K.place(dots, i, [x, 0.004, z], null, s)); dots.instanceMatrix.needsUpdate = true; scene.add(dots); }

      // ================= SET A: the rooftop, 29 April
      const bld = mk();
      box(6.6, 2.4, 3.6, 0.07, M.cream, -8.5, 1.2, -0.2, bld);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) box(0.55, 0.5, 0.05, 0.02, M.navy, -10.6 + c * 1.05, 0.75 + r * 0.95, 1.62, bld, { line: 2.5 });
      box(6.8, 0.16, 0.16, 0.04, M.paper, -8.5, 2.48, 1.55, bld, { line: 3 }); box(6.8, 0.16, 0.16, 0.04, M.paper, -8.5, 2.48, -1.95, bld, { line: 3 });
      box(0.16, 0.16, 3.6, 0.04, M.paper, -11.75, 2.48, -0.2, bld, { line: 3 }); box(0.16, 0.16, 3.6, 0.04, M.paper, -5.25, 2.48, -0.2, bld, { line: 3 });
      box(1.3, 0.8, 1.0, 0.05, M.mustard, -5.9, 2.8, -1.2, bld);                                                // rooftop box
      solid(cyl(1.75, 1.75, 0.1, 40), M.paper, bld).position.set(HX - 0.2, 2.45, 0);                              // the pad
      { const ring = mark([[arc(1.45, 0, Math.PI * 2, 40), 0.09, 'none']], PAL.mustard.lit, 0.02); ring.rotation.x = -Math.PI / 2; ring.position.set(HX - 0.2, 2.512, 0); bld.add(ring); }
      const STEPX = [-10.55, -10.2, -9.85, -9.5], STEPY = [2.55, 2.64, 2.73, 2.82];
      STEPX.forEach((x, i) => box(0.36, STEPY[i] - 2.4, 0.72, 0.02, M.navy, x, 2.4 + (STEPY[i] - 2.4) / 2, 0, bld, { line: 3 }));
      const yAt = (x) => { const P = [[-13, 2.4], [-10.8, 2.4], [-10.55, 2.55], [-10.2, 2.64], [-9.85, 2.73], [-9.5, 2.82], [-8.6, 2.82]]; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return K.lerp(P[i - 1][1], P[i][1], K.clamp((x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]))); return 2.82; };

      // helicopter (CH-53 Sea Stallion, US Marines, olive drab): nose towards +x, ramp at the rear (-x)
      const heli = mk();
      box(2.0, 0.78, 0.82, 0.2, M.olive, 0, 0.64, 0, heli);                                                      // fuselage
      box(0.75, 0.6, 0.72, 0.22, M.olive, 1.1, 0.56, 0, heli);                                                   // nose
      box(0.3, 0.26, 0.86, 0.06, M.navy, 1.02, 0.78, 0, heli, { line: 2.5 });                                    // cockpit glass
      box(0.5, 0.32, 0.4, 0.1, M.oliveD, 0.1, 1.15, 0, heli);                                                    // engines
      box(0.95, 0.42, 0.44, 0.13, M.olive, -1.5, 0.82, 0, heli);                                                 // tail boom
      { const py = box(0.2, 0.7, 0.3, 0.07, M.olive, -2.05, 1.12, 0, heli); py.rotation.z = 0.3; }
      box(0.9, 0.3, 0.3, 0.1, M.oliveD, 0, 0.3, 0.55, heli); box(0.9, 0.3, 0.3, 0.1, M.oliveD, 0, 0.3, -0.55, heli);   // sponsons
      for (const z of [0.58, -0.58]) { const w = solid(cyl(0.13, 0.13, 0.09, 14).rotateX(Math.PI / 2), M.navy, heli, { line: 3 }); w.position.set(0.1, 0.13, z); }
      box(0.5, 0.045, 0.7, 0.015, M.navy, -1.15, 0.32, 0, heli, { line: 3 });                                    // rear ramp
      const mast = solid(cyl(0.07, 0.09, 0.2, 10), M.navy, heli, { line: 3 }); mast.position.set(0.15, 1.38, 0);
      const rotor = mk(heli); rotor.position.set(0.15, 1.5, 0);
      for (let i = 0; i < 6; i++) { const b = mk(rotor); b.rotation.y = i * Math.PI / 3; const bl = solid(K.roundedBox(1.55, 0.03, 0.12, 0.012, 2), M.navy, b, { line: 2.5 }); bl.position.x = 0.8; }
      const trotor = mk(heli); trotor.position.set(-2.18, 1.34, 0.2);
      for (let i = 0; i < 2; i++) { const b = mk(trotor); b.rotation.z = i * Math.PI / 2; solid(K.roundedBox(0.04, 0.5, 0.05, 0.015, 2), M.navy, b, { line: 2.5 }); }
      const spinA = mark([[arc(1.35, 0.3, 1.6, 14), 0.06, 'tail'], [arc(1.0, 0.5, 1.5, 12), 0.045, 'tail'], [arc(1.35, 3.45, 4.75, 14), 0.06, 'tail'], [arc(1.0, 3.65, 4.65, 12), 0.045, 'tail']], PAPER, 0.018);
      spinA.rotation.x = -Math.PI / 2; spinA.position.set(0.15, 1.56, 0); heli.add(spinA);
      const heliRig = rig(heli);

      // people: built facing +z, arms hang from the shoulders
      const person = (body, o = {}) => { const g = mk(null);
        solid(turned([[0, 0], [0.12, 0], [0.15, 0.03], [0.14, 0.22], [0.11, 0.36], [0.06, 0.42], [0, 0.43]], 24, 1), body, g);
        const head = solid(sphere(0.085), o.skin || M.skin, g, { line: 3 }); head.position.y = 0.51;
        if (o.helmet) { const h = solid(new THREE.SphereGeometry(0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), M.oliveD, g, { line: 3 }); h.position.y = 0.53; }
        const arms = [-1, 1].map((s) => { const p = mk(g); p.position.set(s * 0.15, 0.37, 0); const a = solid(cyl(0.035, 0.035, 0.22, 8).translate(0, -0.11, 0), o.sleeve || body, p, { line: 2.5 }); return p; });
        g.userData.arms = arms; return g; };
      const civ = [M.persimmon, M.navy, M.mustard].map((m) => { const p = person(m); p.scale.setScalar(1.35); scene.add(p); return p; });
      const WAIT = [[-11.0, 0.08], [-11.4, -0.1], [-11.1, 0.28]];
      for (const p of civ) p.userData.arms.forEach((a) => { a.rotation.z = 0.0; });

      // ================= SET B: the avenue, the gate and the palace (Independence Palace, 1966, modernist)
      const road = box(2.6, 0.05, 15, 0.02, M.road, X0, 0.025, 6.5, scene, { line: 3 });
      for (let i = 0; i < 12; i++) box(0.14, 0.03, 0.5, 0.01, M.cream, X0, 0.06, 1.2 + i * 1.0, scene, { line: 0, cast: false });
      const pal = mk(); pal.position.x = X0;
      box(7.2, 0.3, 3.2, 0.04, M.paper, 0, 0.15, -1.8, pal);                                                      // podium
      box(5.8, 0.95, 2.3, 0.05, M.cream, 0, 0.775, -2.0, pal);                                                    // ground floor, set back
      for (let i = 0; i < 9; i++) box(0.17, 0.95, 0.17, 0.05, M.paper, -3.0 + i * 0.75, 0.775, -0.75, pal, { line: 3 });   // pilotis
      box(1.2, 0.72, 0.05, 0.02, M.navy, 0, 0.66, -0.84, pal, { line: 2.5 });                                      // doorway
      box(6.5, 0.9, 2.7, 0.05, M.cream, 0, 1.7, -1.55, pal);                                                      // upper floor, overhanging
      box(6.0, 0.5, 0.04, 0.015, M.navy, 0, 1.7, -0.19, pal, { line: 2.5 });                                       // window band
      for (let i = 0; i < 16; i++) box(0.07, 0.7, 0.12, 0.02, M.paper, -2.9 + i * 0.387, 1.7, -0.12, pal, { line: 2.5 });   // sun screen fins
      box(7.0, 0.12, 3.1, 0.04, M.paper, 0, 2.21, -1.6, pal);                                                     // roof slab
      box(3.4, 0.5, 1.5, 0.05, M.cream, 0, 2.52, -1.9, pal); box(3.6, 0.08, 1.7, 0.03, M.paper, 0, 2.8, -1.9, pal);
      box(2.2, 0.1, 0.9, 0.02, M.paper, 0, 0.05, 0.25, pal, { line: 3 }); box(1.9, 0.2, 0.6, 0.02, M.paper, 0, 0.1, 0.0, pal, { line: 3 });  // steps
      // the gate wall and its two leaves
      const wall = mk();
      for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) box(0.1, 0.8, 0.1, 0.03, M.paper, X0 + s * (1.75 + i * 0.5), 0.4, GZ, wall, { line: 3 });
        box(3.2, 0.06, 0.07, 0.02, M.navy, X0 + s * 3.0, 0.62, GZ, wall, { line: 2.5 }); box(3.2, 0.06, 0.07, 0.02, M.navy, X0 + s * 3.0, 0.2, GZ, wall, { line: 2.5 });
        box(0.26, 1.3, 0.26, 0.05, M.paper, X0 + s * 1.38, 0.65, GZ, wall); box(0.34, 0.1, 0.34, 0.03, M.mustard, X0 + s * 1.38, 1.34, GZ, wall); }
      const leaves = [-1, 1].map((s) => { const piv = mk(); piv.position.set(X0 + s * 0.6, 0.02, GZ); const lf = mk(piv);
        box(1.1, 0.07, 0.07, 0.02, M.navy, 0, 0.93, 0, lf, { line: 3 }); box(1.1, 0.07, 0.07, 0.02, M.navy, 0, 0.08, 0, lf, { line: 3 });
        box(0.07, 0.9, 0.07, 0.02, M.navy, -0.52, 0.5, 0, lf, { line: 3 }); box(0.07, 0.9, 0.07, 0.02, M.navy, 0.52, 0.5, 0, lf, { line: 3 });
        for (let i = 0; i < 5; i++) box(0.04, 0.8, 0.04, 0.015, M.navy, -0.36 + i * 0.18, 0.5, 0, lf, { line: 2 });
        const star = solid(cyl(0.14, 0.14, 0.05, 16).rotateX(Math.PI / 2), M.mustard, lf, { line: 3 }); star.position.set(-s * 0.5, 0.5, 0.0); return piv; });

      // tank (T-54, olive, 1975): hull along z, gun towards -z, raised a little so it clears the gate
      const tank = mk(), tankRig = rig(tank);
      box(1.05, 0.32, 1.85, 0.08, M.olive, 0, 0.48, 0, tank);
      for (const s of [-1, 1]) { box(0.28, 0.36, 2.05, 0.13, M.navy, s * 0.66, 0.26, 0, tank); box(0.34, 0.05, 1.9, 0.02, M.oliveD, s * 0.62, 0.5, 0, tank, { line: 3 });
        for (let i = 0; i < 5; i++) { const w = solid(cyl(0.12, 0.12, 0.05, 14).rotateZ(Math.PI / 2), M.oliveD, tank, { line: 2.5 }); w.position.set(s * 0.83, 0.26, -0.7 + i * 0.35); } }
      const turret = solid(turned([[0, 0], [0.42, 0], [0.46, 0.05], [0.44, 0.16], [0.3, 0.26], [0, 0.29]], 40, 1), M.olive, tank); turret.position.set(0, 0.64, 0.12); turret.scale.set(1, 1, 1.15);
      const gun = mk(tank); gun.position.set(0, 0.8, -0.4); gun.rotation.x = 0.2;
      { const g1 = solid(cyl(0.05, 0.05, 1.15, 10).rotateX(Math.PI / 2), M.oliveD, gun, { line: 3 }); g1.position.z = -0.57; const g2 = solid(cyl(0.075, 0.075, 0.2, 10).rotateX(Math.PI / 2), M.oliveD, gun, { line: 3 }); g2.position.z = -1.1; }
      solid(cyl(0.12, 0.12, 0.08, 12), M.oliveD, tank, { line: 3 }).position.set(0.18, 0.95, 0.22);
      for (const s of [-1, 1]) solid(cyl(0.09, 0.09, 0.5, 10), M.navy, tank, { line: 3 }).position.set(s * 0.3, 0.7, 0.85);
      const TZ = (q) => { if (q < T.hit) return K.lerp(7.3, GZ + 0.95, K.seg(q, T.tankIn, T.hit, K.ease.linear)); return K.lerp(GZ + 0.95, 2.95, K.seg(q, T.hit, T.stop, K.ease.out)); };

      // the president, as a silhouette on the palace porch; soldiers and rifles for the last beat
      const figure = person(M.figure, { skin: M.figure }); figure.scale.setScalar(2.0); figure.position.set(X0 - 1.5, 0.3, 0.1); scene.add(figure);
      const rifleOf = () => { const g = mk(null); const part = (w, h, d, x, y, z, r = 0.015) => { const m = solid(K.roundedBox(w, h, d, r, 2), M.navy, g, { line: 2.5 }); m.position.set(x, y, z); return m; };
        part(0.26, 0.06, 0.06, 0, 0, 0); part(0.3, 0.025, 0.025, 0.27, 0.008, 0, 0.01); part(0.16, 0.07, 0.04, -0.2, -0.02, 0); part(0.14, 0.03, 0.04, 0.0, 0.05, 0); part(0.04, 0.12, 0.045, 0.03, -0.08, 0, 0.012).rotation.z = 0.22; return g; };
      const SOLD = [[X0 - 1.2, 5.0], [X0, 5.25], [X0 + 1.2, 5.0]];
      const soldiers = SOLD.map(([x, z], i) => { const p = person(M.olive, { helmet: true, sleeve: M.olive }); p.position.set(x, 0, z); p.rotation.y = (i - 1) * -0.12; p.scale.setScalar(1.35); scene.add(p);
        const r = rifleOf(); scene.add(r); return { p, r, x, z, i }; });

      // ---- marks that face the lens
      const faceCam = [];
      const sprite = (m) => { scene.add(m); faceCam.push(m); m.visible = false; return m; };
      const puff = (n) => Array.from({ length: n }, () => sprite(mark([[arc(0.5, 0, Math.PI * 2, 18), 1, 'none']], PAPER, 0.12)));
      const lines = sprite(mark([[[[-0.35, 0.1], [-0.35, -0.9]], 0.05, 'tail'], [[[0, 0], [0, -1.2]], 0.06, 'tail'], [[[0.4, 0.1], [0.4, -0.8]], 0.05, 'tail']]));
      const landTicks = sprite(mark(burst(10, 1.2, 0.35, 0.4, 0.07, 3)));
      const hitTicks = sprite(mark(burst(13, 0.9, 0.7, 0.55, 0.08, 5)));
      const dust = puff(4), exhaust = puff(3);
      const tankLines = sprite(mark([[[[-0.45, 0.2], [-0.45, 0.75]], 0.05, 'head'], [[[0.0, 0.0], [0.0, 0.9]], 0.06, 'head'], [[[0.45, 0.25], [0.45, 0.7]], 0.05, 'head']]));
      const rifleTicks = SOLD.map((s, i) => sprite(mark(burst(7, 0.3, 0.12, 0.2, 0.045, 11 + i))));

      // ---- the camera: [aim x, y, z, elevation, azimuth, distance]; the camera alone moves every frame
      const D = Math.PI / 180;
      const cam = K.track([[0, [-9.0, 2.6, 0, 21 * D, -7 * D, 10.2]], [4.9, [-8.8, 2.8, 0, 22 * D, -3 * D, 9.6], 'linear'],
        [5.23, [X0 + 0.2, 0.9, 2.2, 27 * D, 30 * D, 10.3], 'inOutQuint'], [8.8, [X0 + 0.1, 0.9, 2.5, 28 * D, 33 * D, 9.9], 'linear'],
        [9.13, [X0 - 0.9, 1.15, 0.5, 20 * D, -22 * D, 7.4], 'inOutQuint'], [12.8, [X0 - 1.0, 1.2, 0.4, 21 * D, -18 * D, 7.0], 'linear'],
        [13.13, [X0, 0.3, 5.3, 33 * D, 5 * D, 5.8], 'inOutQuint'], [15, [X0, 0.3, 5.3, 32 * D, 2 * D, 5.4], 'linear']]);
      const camPos = (c) => [c[0] + c[5] * Math.sin(c[4]) * Math.cos(c[3]), c[1] + c[5] * Math.sin(c[3]), c[2] + c[5] * Math.cos(c[4]) * Math.cos(c[3])];
      const TAN = Math.tan(S.R.fov / 2 * D);
      const spot = (time, sx, sy, push = 0) => { const c = cam(time), p = camPos(c), e = c[3], a = c[4], d = c[5] + push, hh = d * TAN, hw = hh * S.W / S.H;
        const f = [-Math.sin(a) * Math.cos(e), -Math.sin(e), -Math.cos(a) * Math.cos(e)], r = [Math.cos(a), 0, -Math.sin(a)], u = [-Math.sin(a) * Math.sin(e), Math.cos(e), -Math.cos(a) * Math.sin(e)];
        return { pos: [0, 1, 2].map((i) => p[i] + f[i] * d + r[i] * sx * hw + u[i] * sy * hh), rot: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...r), new THREE.Vector3(...u), new THREE.Vector3(...f).negate())) }; };

      // ---- lettering: a word (and number badge) plus a hand-written caption box, turned to face its own framing
      const label = (step, when, until, at2, cap2, f = {}) => {
        const look = f.look || when + 0.9, g = mk(), [ww, wh] = [0, 0]; let word = null, size = [0, 0], ticks = null, bd = null, cap = null, capG = null;
        if (step.word) { word = ink.lettering(step.word, { height: f.height || 0.56 }); size = word.userData.size; const a = spot(look, ...at2); g.add(word); g.position.set(...a.pos); g.quaternion.copy(a.rot);
          ticks = mark(burst(9, size[0] * 0.56, size[1] * 0.62, 0.3, 0.06, 7 + Math.round(when))); ticks.position.z = -0.01; g.add(ticks);
          if (step.n) { bd = ink.badge(step.n, { height: size[1] * 0.82 }); bd.position.set(-size[0] / 2 + 0.02, size[1] * 0.22, 0.02); g.add(bd); } }
        if (step.note) { cap = ink.caption(step.note, { height: f.cap || 0.36 }); capG = mk(); const b = spot(look, ...cap2); capG.add(cap); capG.position.set(...b.pos); capG.quaternion.copy(b.rot); cap.rotation.z = f.tilt == null ? -0.04 : f.tilt; }
        g.traverse((o) => { if (o.isMesh) { o.material.depthTest = false; o.renderOrder = 5; } }); if (capG) capG.traverse((o) => { if (o.isMesh) { o.material.depthTest = false; o.renderOrder = 5; } });
        return (q) => {
          const x = q - when, out = 1 - K.seg(q, until, until + 2 * F), s = pop(x) * out;
          if (word) { g.visible = x >= 0 && out > 0; g.scale.setScalar(Math.max(s, 1e-3)); word.rotation.z = 0.05 * wobble(x + 0.03, 4, 10);
            ticks.visible = x >= 0 && x < 2 * F - 1e-3; ticks.scale.setScalar(x < F - 1e-3 ? 0.92 : 1.06);
            if (bd) { const b = pop(x - F); bd.scale.setScalar(Math.max(b, 1e-3)); bd.rotation.z = 0.18 - 0.5 * (1 - Math.min(1, b)); } }
          if (cap) { const cs = pop(x - (word ? 3 * F : 0)) * out; capG.visible = x >= (word ? 3 * F : 0) - 1e-3 && out > 0; capG.scale.setScalar(Math.max(cs, 1e-3)); }
        };
      };
      const labels = [
        label({ word: '29 DE ABRIL', note: 'Saigon' }, 0.22, 4.82, [-0.5, -0.62, 0.3], [-0.6, 0.76, -0.3], { tilt: 0.03 }),
        label({ word: '30 DE ABRIL', note: 'Palácio da Independência' }, 5.12, 8.7, [-0.5, 0.7, 0.5], [-0.42, -0.74, -0.2], { tilt: -0.04 }),
        label({ note: 'Presidente do Sul' }, 9.5, T.flip - F, [0, 0, 0], [0.42, -0.72, -0.4], { cap: 0.34, tilt: 0.04 }),
        label({ word: 'DUONG VAN MINH' }, T.nameIn, T.flip - F, [0.3, 0.7, 0.3], [0, 0, 0], { height: 0.34 }),
        label({ word: 'DIAS NO CARGO', n: '2' }, T.flip, T.nameOut, [0.32, 0.68, 0.3], [0, 0, 0], { height: 0.34, look: 12.5 }),
        label({ word: 'DEPOR AS ARMAS' }, 13.81, 99, [0.0, 0.72, 0.2], [0, 0, 0], { height: 0.36 }),
      ];

      const col = new THREE.Color();
      return {
        update(t) {
          const q = Math.floor(t * DPS + 1e-3) / DPS, n = Math.round(q * DPS);
          const c = cam(t).slice(); c[1] += 0.05 * wobble(t - T.hit, 5, 6); c[0] += 0.04 * wobble(t - T.hit, 3.5, 5);
          K.look(camera, camPos(c), c);
          ink.sun.target.position.set(c[0] + 0.3, 1, c[2]); ink.sun.position.set(c[0] - 6.2, 6.2, c[2] + 4.8); ink.sun.target.updateMatrixWorld(); ink.sun.updateMatrixWorld();
          ink.frame(t, camera);

          // ---- helicopter: comes down, waits for the stairs, climbs away in "evacuam"
          const down = K.seg(q, 0, T.land, K.ease.out), land = q - T.land, lift = q - T.lift;
          const hp = (qq) => { const l = qq - T.lift, u = K.seg(qq, T.lift + 2 * F, T.lift + 14 * F, K.ease.in);
            return [HX + 2.4 * u, HY + 1.5 * (1 - K.seg(qq, 0, T.land, K.ease.out)) + 6.5 * u + 0.03 * wobble(qq - T.land, 3.5, 7), 0]; };
          heliRig.set(hp(q), hp(q - F)); heliRig.outer.visible = q < 4.7;
          const crouch = lift >= 0 && lift < 2 * F ? 0.9 : 1, ls = K.seg(q, T.lift + 2 * F, T.lift + 14 * F);
          heli.scale.set(0.85, 0.85 * (crouch + 0.1 * wobble(land + F, 3, 8)), 0.85); heli.rotation.z = -0.28 * K.ease.in(ls) + 0.03 * wobble(land, 3, 8);
          rotor.rotation.y = -n * 0.9; trotor.rotation.z = n * 1.3; spinA.rotation.z = n * 0.7; spinA.visible = n % 2 === 0;
          lines.visible = lift >= 3 * F && lift < 10 * F && n % 2 === 0; { const p = hp(q); lines.position.set(p[0] + 0.1, p[1] - 0.2, 0.5); lines.scale.setScalar(1); }
          landTicks.visible = land >= 0 && land < 2 * F - 1e-3; landTicks.position.set(HX, HY + 0.1, 0.9); landTicks.scale.setScalar(land < F - 1e-3 ? 0.9 : 1.15);

          // ---- people climb the stairs and board through the ramp
          civ.forEach((p, i) => { const s0 = T.climb[i], u = K.seg(q, s0, s0 + 0.9), wx = WAIT[i][0] - 0.0, x = u > 0 ? K.lerp(wx, -8.9, u) : wx, z = u > 0 ? K.lerp(WAIT[i][1], 0, K.seg(u, 0, 0.3)) : WAIT[i][1];
            p.visible = u < 1; p.rotation.y = Math.PI / 2; p.position.set(x, yAt(x) + (u > 0 ? 0.035 * (n % 2) : 0.02 * ((n >> 1) % 2)), z);
            p.userData.arms.forEach((a, k) => { a.rotation.x = u > 0 ? (k ? 0.6 : -0.6) * (n % 2 ? 1 : -1) : 0; }); });

          // ---- gate leaves fall away from the lens when the tank arrives; tank drives in from the foreground
          leaves.forEach((piv, k) => { const x = q - T.hit - k * F, u = K.seg(x, 0, 5 * F, K.ease.in); piv.rotation.x = -(1.5 * u) + 0.08 * wobble(x - 5 * F, 3.5, 7) * (u >= 1 ? 1 : 0); });
          const z0 = TZ(q), z1 = TZ(q - F), tankOn = q >= T.tankIn - F;
          tankRig.set([X0, 0, z0], [X0, 0, z1]); tankRig.outer.visible = tankOn; tank.rotation.z = 0.012 * (n % 2 ? 1 : -1) * (q < T.stop ? 1 : 0); gun.rotation.x = 0.2 - 0.03 * wobble(q - T.hit, 4, 8);
          const moving = q >= T.tankIn && q < T.stop;
          tankLines.visible = moving && q > T.hit - 0.4 && q < T.hit + 0.3 && n % 2 === 0; tankLines.rotation.set(0, 0, 0); tankLines.position.set(X0, 0.35, z0 + 1.3);
          const hx = q - T.hit; hitTicks.visible = hx >= 0 && hx < 2 * F - 1e-3; hitTicks.position.set(X0, 0.65, GZ - 0.2); hitTicks.scale.setScalar(hx < F - 1e-3 ? 0.9 : 1.2);
          // wheels roll while the tank moves
          // the president (silhouette) steps onto the porch and the soldiers appear for the last beat
          const fp = pop(q - T.fig); figure.visible = q >= T.fig && q < 13.0; figure.scale.setScalar(Math.max(2.0 * fp, 1e-3)); figure.rotation.y = 0.35 + 0.02 * wobble(q - T.fig, 3, 6);
          soldiers.forEach((s) => { const sp = T.drop[s.i], on = q >= T.soldiers; s.p.visible = on; s.r.visible = on;
            const u = K.seg(q, sp, sp + 4 * F), ground = u >= 1, lyZ = ground ? 0.42 : K.lerp(0.18, 0.42, u);
            const held = new THREE.Vector3(s.x, 0.26, s.z + 0.18), fall = new THREE.Vector3(s.x - 0.05 + 0.04 * s.i, 0.045, s.z + lyZ + 0.2);
            const rp = on ? (q < sp ? held : (u < 1 ? new THREE.Vector3().lerpVectors(held, fall, u * u).setY(K.lerp(0.26, 0.045, u * u) + 0.12 * Math.sin(Math.PI * u)) : fall.clone().setY(0.045 + 0.04 * Math.max(0, wobble(q - sp - 4 * F, 4, 9))))) : held;
            s.r.position.copy(rp); s.r.rotation.set(0, q < sp ? 0 : (s.i - 1) * 0.5 - 0.2, q < sp ? 0.5 : K.lerp(0.5, 0, u));
            s.p.userData.arms.forEach((a, k) => { a.rotation.x = -1.0 * (1 - K.seg(q, sp - F, sp + 2 * F)); });
            s.p.scale.y = 1 - 0.03 * K.seg(q, sp + 4 * F, sp + 6 * F);
            const tk = rifleTicks[s.i]; const x = q - sp - 4 * F; tk.visible = on && x >= 0 && x < 2 * F - 1e-3; tk.position.set(s.x, 0.12, s.z + 0.62); tk.scale.setScalar(x < F - 1e-3 ? 0.9 : 1.2); });

          for (const f of labels) f(q);
          for (const m of faceCam) m.quaternion.copy(camera.quaternion);
        },
      };
    },

    sound(k) {
      // every time is snapped to the drawing the picture also changes on
      const s = snap;
      k.withMinor(() => { for (let t = 0.1; t < 4.6; t += 0.14) { const e = t < 3.4 ? 1 : Math.max(0, 1 - (t - 3.4) / 1.2); k.noise(s(t), { dur: 0.1, color: 'brown', filter: 'lowpass', f: 230, gain: 0.34 * e, pan: -0.5 }); } });   // rotor chop, fades as it leaves
      k.play('stamp', s(0.22), { gain: 0.5, pan: -0.3 });
      k.play('swish', s(T.lift), { gain: 0.9, dur: 0.5, pan: 0.1 });
      k.play('thud', s(T.land), { gain: 0.5, f: 140 });
      T.climb.forEach((t, i) => { for (let j = 0; j < 4; j++) k.play('tock', s(t + 0.2 * (j + 1)), { gain: 0.3, f: 300 + 40 * j, pan: -0.5 }); });
      k.play('whoosh', s(4.9), { gain: 0.8, dur: 0.38, pan: 0.2 });
      k.play('stamp', s(5.12), { gain: 0.6, pan: -0.3 });
      k.withMinor(() => { for (let t = 5.4; t < 8.9; t += 0.11) k.noise(s(t), { dur: 0.09, color: 'brown', filter: 'lowpass', f: 170, gain: 0.3, pan: 0.2 }); for (let t = 5.6; t < 8.8; t += 0.3) k.play('tock', s(t), { gain: 0.22, f: 190, pan: 0.2 }); });   // engine and tracks
      k.play('impact', s(T.hit), { gain: 0.9, pan: 0.1 }); k.play('paper', s(T.hit) + 0.03, { gain: 0.5, dur: 0.3 }); k.play('thud', s(T.hit) + 0.33, { gain: 0.6, f: 120 });
      k.play('whoosh', s(8.8), { gain: 0.8, dur: 0.38, pan: -0.2 });
      k.play('pop', s(T.fig), { gain: 0.6, f: 420, pan: -0.2 }); k.play('stamp', s(T.nameIn), { gain: 0.7, pan: 0.2 }); k.play('stamp', s(T.flip), { gain: 0.9, pan: 0.2 });
      k.play('whoosh', s(12.8), { gain: 0.8, dur: 0.38, pan: 0.2 });
      T.drop.forEach((t, i) => { k.play('thud', s(t) + 4 * F, { gain: 0.5, f: 210, pan: (i - 1) * 0.4 }); k.play('tick', s(t) + 4 * F, { gain: 0.7, pan: (i - 1) * 0.4 }); });
      k.play('stamp', s(13.81), { gain: 0.8 });
    },
  });
})();
