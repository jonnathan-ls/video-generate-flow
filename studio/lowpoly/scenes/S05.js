// scenes/S05.js: Vietnã, 1945–1946. Cinco tomadas num mundo low-poly só:
//   1) navio britânico chega a Saigon (set/1945) e encosta no cais;
//   2) coluna francesa retoma Saigon, bandeira sobe em "retomam";
//   3) navio de transporte entra em Haiphong (mar/1946) e encosta em "desembarcam";
//   4) a coluna desce a prancha e marcha no cais;
//   5) usina de Hanói explode em "usina" e a cidade apaga em "elétrica";
//   6) fogo nas ruas e a coluna avança: "França × Viet Minh".
// Toda ação cai na palavra que a nomeia (R18); todo som leva motivo (R16).
// Física: navio só na água e paralelo ao cais; gente entra pela prancha/porta, pés no piso; escala coerente.
(function () {
  const LP = window.LP, { THREE, K } = window, A = window.LPA, PAL = LP.PAL, B = LP.B;

  window.LPScene = function (props) {
    const WORDS = props.words, DUR = props.durationSec;
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    // tempo da n-ésima ocorrência de uma palavra do props (R18: a ação cai nela)
    const T = (name, n = 1) => {
      const k = norm(name), hits = WORDS.filter((w) => norm(w.word) === k), hit = hits[n - 1];
      if (!hit) throw new Error('S05: palavra não encontrada: ' + name + '#' + n);
      return hit.start;
    };
    const W = {
      chegam: T('chegam'), sul: T('sul'), tropas: T('tropas'), retomam: T('retomam'),
      marco: T('março'), desembarcam: T('desembarcam'), d19: T('19'), viet1: T('Viet', 1),
      usina: T('usina'), eletrica: T('elétrica'), franca2: T('França', 2), viet2: T('Viet', 2),
    };

    // tomadas: início/fim, conjunto e luz (corte seco entre elas, como na colagem)
    const SHOTS = [
      { t0: 0.0, t1: 6.5, set: 'harbor', mode: 'day' },       // 1) navio britânico chega a Saigon
      { t0: 6.5, t1: 9.0, set: 'harbor', mode: 'day' },       // 2) coluna retoma Saigon
      { t0: 9.0, t1: 13.55, set: 'harbor', mode: 'grey' },    // 3) transporte entra em Haiphong
      { t0: 13.55, t1: 15.8, set: 'harbor', mode: 'grey' },   // 4) desembarque no cais
      { t0: 15.8, t1: 22.8, set: 'city', mode: 'night' },     // 5) usina explode, cidade apaga
      { t0: 22.8, t1: DUR + 0.2, set: 'street', mode: 'night' }, // 6) guerra nas ruas
    ];

    const labels = [
      { text: 'SAIGON · SETEMBRO DE 1945', sub: 'chegam os soldados britânicos', t0: W.sul, t1: 6.25 },
      { text: 'SAIGON', sub: 'retomada pelas tropas francesas', t0: W.tropas + 0.06, t1: 8.85 },
      { text: 'HAIPHONG · MARÇO DE 1946', sub: '≈ 15 mil soldados franceses no Tonkin', t0: W.marco, t1: 13.25 },
      { text: 'HANÓI · 19 DE DEZEMBRO', sub: '1946', t0: W.d19, t1: 19.9 },
      { text: 'VIET MINH', sub: 'frente pela independência do Vietnã', t0: W.viet1, t1: 22.55 },
    ];

    // ------------------------------------------------------------------ utilidades de cena
    const lerp = K.lerp;
    const seg = K.seg;
    // caminho em 3D com distância acumulada: posAt(s) -> { p, dx, dz }
    function pathOf(pts) {
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      return {
        len: cum[cum.length - 1],
        at(s) {
          s = K.clamp(s, 0, cum[cum.length - 1]);
          let i = 1; while (i < pts.length - 1 && cum[i] < s) i++;
          const a = pts[i - 1], b = pts[i], seg_len = cum[i] - cum[i - 1] || 1, u = (s - cum[i - 1]) / seg_len;
          return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)], dx: b[0] - a[0], dz: b[2] - a[2] };
        },
      };
    }
    // prancha (gangway) entre dois pontos: caixa inclinada com corrimão e degraus
    function plank(a, b, width = 1.3, seed = 31) {
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
      const g = new THREE.Group();
      const bb = B(seed);
      bb.box(len, 0.14, width, [0, 0, 0], PAL.trunk, { amt: 0.4, shade: 0.16 });
      for (let i = 0; i < Math.floor(len / 0.42); i++) bb.box(0.1, 0.05, width * 0.98, [-len / 2 + 0.3 + i * 0.42, 0.1, 0], PAL.trunk, { amt: 0.3 });
      for (const s of [1, -1]) bb.box(len, 0.05, 0.05, [0, 0.85, s * width * 0.42], PAL.iron).box(len, 0.04, 0.04, [0, 0.5, s * width * 0.42], PAL.iron);
      for (let i = 0; i < 4; i++) for (const s of [1, -1]) bb.box(0.06, 0.9, 0.06, [-len / 2 + 0.15 + i * (len - 0.3) / 3, 0.45, s * width * 0.42], PAL.iron);
      g.add(bb.mesh());
      g.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      g.rotation.order = 'YZX';
      g.rotation.y = Math.atan2(-dz, dx);
      g.rotation.z = Math.asin(dy / len);
      return g;
    }
    // pessoa que anda por um caminho: posição e passada presas à distância (sem patinar)
    function walker(path, { t0, v = 1.15, s0 = 0, kind = 'fr', seed = 1, rifle = true }) {
      const s = A.soldier({ kind, seed, rifle });
      s.group.visible = false;
      return {
        group: s.group, t0, v, s0,
        update(t, yOff = 0.06) {
          const on = t >= t0, d = Math.max(0, t - t0) * v, sp = s0 + d;
          s.group.visible = on;
          if (!on) return;
          const q = path.at(sp);
          s.group.position.set(q.p[0], q.p[1] + yOff, q.p[2]);
          A.face(s.group, q.dx || 1, q.dz);
          s.pose(sp, 1, 0);
        },
      };
    }

    return {
      id: 'vietna-lowpoly-S05',
      name: 'Low-Poly: a guerra começa no Vietnã (S05)',
      duration: DUR,
      fonts: ['400 100px "Anton"', '800 40px "Inter"'],
      render: LP.RENDER,

      build(S) {
        const { scene, camera } = S;
        const rig = LP.rig(S, { center: [0, 0, 0], size: 90 });

        // ================================================================ cais (Saigon / Haiphong)
        const harbor = new THREE.Group(); scene.add(harbor);
        const water = A.water(520, 150, { seed: 5 });
        water.position.set(10, -0.02, 45); harbor.add(water);          // rio entre a câmera e o cais
        {
          const q = B(201);
          q.box(340, 2.2, 18, [10, 1.1, -25], PAL.stone, { amt: 0.55, shade: 0.08 });
          q.box(340, 0.34, 1.4, [10, 2.29, -16.3], PAL.creamDark, { amt: 0.4 });
          q.box(340, 0.1, 17.4, [10, 2.23, -25], PAL.stone, { amt: 0.4, shade: 0.05 });
          // trilhos do guindaste correndo ao longo do cais
          for (const z of [-20.4, -28.4]) q.box(340, 0.09, 0.3, [10, 2.28, z], PAL.iron, { amt: 0.3, shade: 0.05 });
          for (let i = 0; i < 12; i++) q.cyl(0.35, 0.4, 0.8, 6, [-30 + i * 11, 1.3, -16.05], PAL.ink, { amt: 0.3 });   // defensas
          for (let i = 0; i < 14; i++) q.cyl(0.13, 0.16, 0.42, 6, [-40 + i * 13, 2.4, -16.9], PAL.iron, { amt: 0.3 }); // cabeços
          // caixotes e tambores no cais (primeiro plano das tomadas 2 e 4)
          for (let i = 0; i < 9; i++) {
            const x = -36 + i * 11.5;
            if (x > -15 && x < 17) continue;                    // não tapa a coluna da tomada 2
            q.box(1.5, 1.3, 1.4, [x, 2.85, -26.4 + (i % 2) * 1.6], i % 3 ? PAL.trunk : PAL.khaki, { amt: 0.7 });
            if (i % 2) q.box(1.2, 1.0, 1.2, [x + 0.4, 3.7, -26.0], PAL.trunk, { amt: 0.7 });
            if (i % 3 === 0) q.cyl(0.42, 0.42, 1.0, 8, [x + 2.4, 2.7, -27.6], PAL.hullRed, { amt: 0.5 });
          }
          for (let i = 0; i < 3; i++) q.box(1.6, 1.4, 1.5, [45 + i * 3.8, 2.9, -20.4 - (i % 2) * 2.8], i % 2 ? PAL.khaki : PAL.trunk, { amt: 0.7 });
          harbor.add(q.mesh());
        }
        // cidade atrás do cais: armazéns, palmeiras e prédios baixos (profundidade acima do navio)
        {
          const land = LP.ground(360, 110, [PAL.meadow, PAL.grass, PAL.stone], { seed: 9, jit: 0.3 });
          land.position.set(10, 2.2, -88); harbor.add(land);
          const bk = B(202), rng = K.rng(4);
          for (let i = 0; i < 8; i++) {
            const x = -96 + i * 27, h = 6 + rng() * 3;
            const ho = A.house({ w: 15, d: 9, h, wall: i % 2 ? PAL.cream : PAL.sand, roof: PAL.brick, floors: 2, seed: 210 + i * 7, shutters: false });
            ho.group.position.set(x, 2.2, -44 - rng() * 6); harbor.add(ho.group);
          }
          for (let i = 0; i < 22; i++) {
            const x = -150 + rng() * 320, z = -52 - rng() * 40, h = 9 + rng() * 9;
            bk.box(12 + rng() * 10, h, 12, [x, 2.2 + h / 2, z], rng() > 0.5 ? PAL.cream : PAL.sand, { amt: 1, shade: 0.06 });
          }
          for (let i = 0; i < 26; i++) {
            const th = 5 + rng() * 5;
            bk.cone(2.2 + rng() * 2.2, th, 6, [-150 + rng() * 320, 2.2 + th / 2, -36 - rng() * 60], rng() > 0.45 ? PAL.forest : PAL.meadow, { jit: 0.4, amt: 1.2, shade: 0.12 });
          }
          for (let i = 0; i < 7; i++) bk.cone(20 + rng() * 14, 18 + rng() * 14, 7, [-190 + i * 60, 9, -140 - rng() * 40], i % 2 ? PAL.forest : PAL.meadow, { jit: 1.2, amt: 1.2, shade: 0.1 });
          harbor.add(bk.mesh({ cast: false }));
        }

        // ---------------------------------------------------------------- navio britânico (set/1945)
        const shipA = A.steamer({ L: 30, beam: 6.4, free: 3.4, funnels: 2, holds: 3, hull: '#3f4a52', band: PAL.hullRed, funnel: '#3b4147' });
        A.face(shipA.group, -1, 0);          // proa para -x: entra da direita para a esquerda
        harbor.add(shipA.group);
        const wakeA = A.wake(30, 6.4); shipA.group.add(wakeA);
        // bandeira britânica no mastro de ré (navio, não império)
        const flagUK = LP.flag('uk', { w: 1.7, h: 1.1, pole: 2.6 });
        flagUK.position.set(-shipA.L * 0.34, shipA.free + 2.4, 0); shipA.group.add(flagUK);
        // tropas no convés, à vista de quem olha do cais: andam para a proa
        const deckMen = [];
        for (let i = 0; i < 6; i++) {
          const s = A.soldier({ kind: 'uk', seed: 300 + i * 3, rifle: false });
          s.group.position.set(-2 + i * 2.3, shipA.free + 0.06, shipA.beam * 0.5 - 1.2);
          s.group.rotation.y = Math.PI;      // de costas para a amurada, olhando o cais
          s.group.scale.setScalar(0.88);
          shipA.group.add(s.group); deckMen.push(s);
        }
        const smokeA = LP.smoke(harbor, { n: 26, life: 2.8, color: '#c2bcb2', size: 0.3, grow: 2.6, rise: 1.4, wind: [1.5, 0, 0.1], seed: 3, opacity: 0.55 });

        // ---------------------------------------------------------------- navio de transporte francês (mar/1946)
        const shipB = A.ship({ L: 34, beam: 7, free: 3.4, draft: 1.4, funnels: 2, holds: 3, crates: true, hull: '#4d5560', band: PAL.hullGrey, house: PAL.cream, funnel: '#3b4147' });
        A.face(shipB.group, -1, 0);
        shipB.group.visible = false;
        harbor.add(shipB.group);
        const wakeB = A.wake(34, 7); shipB.group.add(wakeB);
        const flagFRship = LP.flag('fr', { w: 1.6, h: 1.05, pole: 2.6 });
        flagFRship.position.set(-shipB.L * 0.34, shipB.free + 2.4, 0); shipB.group.add(flagFRship);
        const smokeB = LP.smoke(harbor, { n: 44, life: 4.0, color: PAL.smoke, size: 0.62, grow: 3.0, rise: 1.8, wind: [0.8, 0, 0.12], seed: 7 });
        // prancha: do convés do navio B para o cais; só aparece quando o navio está encostado
        const gangB = plank([66.2, 3.52, -15.0], [69.4, 2.36, -16.2], 1.5, 33); harbor.add(gangB);
        gangB.visible = false;
        // portal de saída no convés, para ninguém nascer do ar
        { const d = B(34); d.box(2.4, 2.2, 2.6, [64.9, 4.5, -14.5], PAL.cream, { amt: 0.5 }).box(1.0, 1.7, 0.12, [64.9, 4.35, -13.25], PAL.ink); harbor.add(d.mesh()); }
        // prancha do navio britânico (do convés para o cais)
        const gangA = plank([11.0, 3.56, -15.0], [14.2, 2.36, -16.1], 1.3, 35); harbor.add(gangA);
        gangA.visible = false;

        // ---------------------------------------------------------------- guindaste do cais (iça o caixote na tomada 3)
        const crane = A.crane({ h: 9, jib: 9.5, seed: 11 });
        crane.group.position.set(80, 2.2, -20.5); crane.group.rotation.y = -Math.PI / 2;   // lança para +z (sobre o navio)
        crane.group.visible = false;
        harbor.add(crane.group);
        const crate = B(36).box(1.5, 1.3, 1.4, [0, -0.7, 0], PAL.trunk, { amt: 0.7 }).mesh();
        crane.hook.add(crate);
        crane.update(0, 5.0);

        // ---------------------------------------------------------------- coluna francesa na tomada 2
        const col2 = A.column({ n: 10, files: 2, gap: 1.2, kind: 'fr', seed: 5 });
        harbor.add(col2.group);
        const flagFR = LP.flag('fr', { w: 2.1, h: 1.4, pole: 5.4 });
        flagFR.position.set(3.5, 2.2, -20.6); flagFR.rotation.y = -Math.PI / 2; harbor.add(flagFR);
        flagFR.visible = false;

        // ---------------------------------------------------------------- soldados descendo a prancha (tomada 4)
        const rampPath = pathOf([[66.2, 3.52, -15.0], [69.4, 2.36, -16.2], [86, 2.36, -16.9]]);
        const walkB = [];
        for (let i = 0; i < 7; i++) {
          const w = walker(rampPath, { t0: 12.6 + i * 0.34, v: 1.4, s0: -1.6 * i, kind: 'fr', seed: 40 + i * 5 });
          harbor.add(w.group); walkB.push(w);
        }

        // ================================================================ cidade de Hanói à noite
        const cityG = new THREE.Group(); scene.add(cityG);
        const CX = 300;
        const cityGlow = LP.glowMat('#ffd18a', 1.7);
        const plant = A.powerplant({ glow: cityGlow });
        plant.group.position.set(CX, 0, 0); cityG.add(plant.group);
        {
          const gnd = LP.ground(220, 190, [PAL.stone, PAL.sand, PAL.road], { seed: 13 });
          gnd.position.set(CX, 0, -30); cityG.add(gnd);
          const st = B(220);
          st.box(200, 0.06, 16, [CX, 0.03, 14], PAL.road, { amt: 0.5, shade: 0.05 });
          for (let i = 0; i < 24; i++) st.box(0.5, 0.01, 0.06, [CX - 96 + i * 8, 0.07, 8.4], PAL.roadLine, { amt: 0.2 });
          cityG.add(st.mesh({ cast: false }));
          const rng = K.rng(15);
          for (let i = 0; i < 14; i++) {
            const x = CX - 88 + (i % 7) * 29 + (i > 6 ? 14 : 0), z = -34 - (i > 6 ? 16 : 0);
            const h = 7 + rng() * 6;
            const ho = A.house({ w: 11 + rng() * 4, d: 9, h, wall: i % 3 ? PAL.cream : PAL.sand, roof: PAL.brick, floors: Math.max(2, Math.round(h / 3.2)), seed: 400 + i * 7, glow: cityGlow, shutters: false });
            ho.group.position.set(x, 0, z); cityG.add(ho.group);
          }
          // postes de rua (apagam no apagão junto com a cidade)
          const lamp = B(240);
          for (let i = 0; i < 8; i++) { const x = CX - 60 + i * 18; lamp.cyl(0.09, 0.12, 5.4, 6, [x, 2.7, 9.5], PAL.iron).box(0.9, 0.1, 0.1, [x + 0.4, 5.4, 9.5], PAL.iron); }
          cityG.add(lamp.mesh());
          const bulbs = new THREE.Group();
          for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), cityGlow); m.position.set(CX - 60 + i * 18 + 0.85, 5.25, 9.5); bulbs.add(m); }
          cityG.add(bulbs);
        }
        // holofotes de varredura (luz de bateria antiaérea sobre a cidade)
        const beams = [];
        for (const [x, z, ph] of [[CX - 34, -8, 0], [CX + 32, -12, 1.7]]) {
          const g = new THREE.Group(); g.position.set(x, 0, z);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 46, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
          cone.position.y = 23; g.add(cone); cityG.add(g); beams.push({ g, ph, mat: cone.material });
        }
        // rajadas de tiro (Viet Minh) e fogo de palha na fachada
        const tracers = [];
        { const tg = new THREE.Group(); cityG.add(tg);
          const m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd27a').multiplyScalar(2.4), fog: false });
          for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 0.07), m); b.visible = false; tg.add(b); tracers.push({ b, ph: K.hash(i, 3), dz: (K.hash(i, 7) - 0.5) * 5, dy: (K.hash(i, 11) - 0.5) * 3 }); } }
        const blast = A.blast({ r: 4.0, debris: 26, seed: 101 });
        blast.group.position.set(CX - 1, 4.6, 4.4); cityG.add(blast.group);
        const flashLight = new THREE.PointLight('#ffb066', 0, 120, 2); flashLight.position.set(CX, 9, 8); cityG.add(flashLight);
        const blast2 = A.blast({ r: 2.0, debris: 10, seed: 111 });
        blast2.group.position.set(CX - 7.0, 2.6, 4.0); cityG.add(blast2.group);
        const roofFire = A.fire({ n: 16, w: 12, h: 2.2, seed: 92, power: 1.5 });
        roofFire.group.position.set(CX, 10.05, 0.6); cityG.add(roofFire.group);
        const citySmoke = LP.smoke(cityG, { n: 40, life: 5.2, color: PAL.smokeDark, size: 1.0, grow: 3.6, rise: 2.6, wind: [-0.5, 0, 0.2], seed: 17, opacity: 0.8 });
        const chimSmoke = LP.smoke(cityG, { n: 26, life: 4.6, color: '#c9c6c2', size: 0.5, grow: 3.0, rise: 2.2, wind: [-0.45, 0, 0.15], seed: 19, opacity: 0.5 });

        // ================================================================ rua de Hanói em chamas
        const street = new THREE.Group(); scene.add(street);
        const SX = 470;
        const streetGlow = LP.glowMat('#ffcf86', 1.5);
        const fires = [];
        {
          const gnd = LP.ground(150, 90, [PAL.road, PAL.stone, PAL.sand], { seed: 21 });
          gnd.position.set(SX + 8, 0, 0); street.add(gnd);
          const rd = B(221);
          rd.box(120, 0.05, 13, [SX + 10, 0.03, 0], PAL.road, { amt: 0.5, shade: 0.05 });
          rd.box(120, 0.16, 1.6, [SX + 10, 0.06, -7.0], PAL.stone, { amt: 0.4 });
          rd.box(120, 0.16, 1.6, [SX + 10, 0.06, 7.0], PAL.stone, { amt: 0.4 });
          for (let i = 0; i < 20; i++) rd.box(1.2, 0.01, 0.12, [SX - 40 + i * 6, 0.065, 0], PAL.roadLine, { amt: 0.2 });
          street.add(rd.mesh({ cast: false }));
          const rng = K.rng(23);
          for (let i = 0; i < 6; i++) {
            for (const s of [-1, 1]) {
              const h = 7 + rng() * 4, w = 9 + rng() * 4;
              const ho = A.house({ w, d: 8, h, wall: i % 2 ? PAL.creamDark : PAL.sand, roof: PAL.brickDark, floors: 3, seed: 500 + i * 11 + (s > 0 ? 5 : 0), glow: streetGlow });
              ho.group.position.set(SX - 6 + i * 13, 0, s * 13.5); street.add(ho.group);
            }
          }
          // fogo nas fachadas (3 pontos, tremulando)
          for (const [x, y, z, w, h] of [[SX + 2, 3.0, -9.6, 5.4, 2.2], [SX + 19, 4.6, -9.4, 4.6, 2.6], [SX + 33, 2.2, -9.6, 4.0, 1.8]]) {
            const f = A.fire({ n: 14, w, h, seed: 600 + x, power: 1.7 });
            f.group.position.set(x, y, z); street.add(f.group); fires.push(f);
          }
          // postes acesos
          const lamp = B(241);
          for (let i = 0; i < 5; i++) { const x = SX - 4 + i * 14; lamp.cyl(0.09, 0.12, 5.2, 6, [x, 2.6, 8.6], PAL.iron).box(0.9, 0.1, 0.1, [x + 0.4, 5.2, 8.6], PAL.iron); }
          street.add(lamp.mesh());
          for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), streetGlow); m.position.set(SX - 4 + i * 14 + 0.85, 5.05, 8.6); street.add(m); }
        }
        const col6 = A.column({ n: 12, files: 2, gap: 1.25, kind: 'fr', seed: 9 });
        street.add(col6.group);
        const flagFR2 = LP.flag('fr', { w: 2.0, h: 1.35, pole: 6.2 }); flagFR2.position.set(SX + 14, 0, -8.6); street.add(flagFR2);
        const flagVM = LP.flag('vm', { w: 2.0, h: 1.35, pole: 6.2 }); flagVM.position.set(SX - 10, 0, -9.4); street.add(flagVM);
        const streetSmoke = LP.smoke(street, { n: 34, life: 5.0, color: PAL.smokeDark, size: 1.1, grow: 3.2, rise: 2.4, wind: [0.7, 0, 0.1], seed: 29, opacity: 0.75 });
        const distanceFlash = A.blast({ r: 4, debris: 8, seed: 121 }); distanceFlash.group.position.set(SX + 62, 2, -46); street.add(distanceFlash.group);

        // ================================================================ movimento dos navios
        const shipAX = (t) => 32 - 26 * seg(t, 0.15, W.chegam + 0.25, K.ease.out);
        const shipBX = (t) => 88 - 34 * seg(t, 9.15, 13.3, K.ease.out);
        const vel = (f, t) => (f(t) - f(t - 0.12)) / 0.12;

        const base = LP.makeOverlay(WORDS, labels);

        return {
          overlay(ctx, t, w, h) {
            base(ctx, t, w, h);
            // "França × Viet Minh" na palavra
            const a = seg(t, W.franca2, W.franca2 + 0.34, K.ease.out), out = 1 - seg(t, DUR - 0.5, DUR - 0.1);
            if (t >= W.franca2 && out > 0) {
              const k = w / 1920, y = h * 0.36 + (1 - a) * 26 * k;
              ctx.save(); ctx.globalAlpha = a * out;
              ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
              ctx.font = `400 ${132 * k}px "Anton"`;
              const parts = [['França', PAL.paper], [' × ', PAL.gold], ['Viet Minh', PAL.paper]];
              const total = parts.reduce((s, p) => s + ctx.measureText(p[0]).width, 0), x0 = (w - total) / 2;
              ctx.fillStyle = 'rgba(12,10,9,0.5)';
              ctx.fillRect(x0 - 40 * k, y - 112 * k, total + 80 * k, 150 * k);
              let x = x0;
              ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 18 * k; ctx.shadowOffsetY = 5 * k;
              for (const [txt, col] of parts) { ctx.fillStyle = col; ctx.fillText(txt, x, y); x += ctx.measureText(txt).width; }
              ctx.shadowBlur = 0; ctx.fillStyle = PAL.gold; ctx.fillRect(x0, y + 16 * k, total, 5 * k);
              ctx.restore();
            }
          },

          update(t) {
            let si = 0; while (si < SHOTS.length - 1 && t >= SHOTS[si].t1) si++;
            const shot = SHOTS[si];
            harbor.visible = shot.set === 'harbor'; cityG.visible = shot.set === 'city'; street.visible = shot.set === 'street';
            rig.set(shot.mode);
            rig.move(si <= 3 ? [24, 0, -16] : si === 4 ? [CX, 0, 0] : [SX + 8, 0, 0]);
            rig.follow(camera.position);

            // ------------------------------------------------------------ 1) navio britânico chega a Saigon
            if (si === 0) {
              const x = shipAX(t), v = Math.max(0, vel(shipAX, t));
              shipA.group.position.set(x, 0.05 * Math.sin(t * 1.2), -12.4);
              shipA.group.rotation.set(0, Math.PI, 0.02 * Math.sin(t * 0.9));
              wakeA.userData.update(K.clamp(v / 4.5, 0, 1));
              smokeA.update(t, (tt) => {
                const m = shipA.mouths[0], xx = shipAX(tt);
                return [xx - m[0], shipA.group.position.y + m[1], -12.4 - m[2], tt > 0.15 ? (tt < W.chegam + 0.4 ? 1 : 0.55) : 0];
              });
              flagUK.userData.update(t, 1, 0.9);
              // tropas marcham no convés em direção à proa (passada presa à distância)
              const dw = seg(t, 3.3, 6.4) * 3.2;
              deckMen.forEach((s, i) => { s.pose(dw + i * 0.18, 1, 0); });
              gangA.visible = t > W.chegam + 0.05;
              col2.group.visible = false; flagFR.visible = false; walkB.forEach((w) => { w.group.visible = false; });
              crane.group.visible = false; gangB.visible = false;
              const u = seg(t, 0, 5.6, K.ease.inOut);
              const p = [lerp(-26, -21, u), lerp(8.6, 8.0, u), lerp(11, 7, u)];
              K.look(camera, p, [lerp(7, 10, u), 3.4, -12.4], lerp(45, 41, u));
              K.focus(camera, [x, 3.6, -12.4], 0.05);
            }
            // ------------------------------------------------------------ 2) coluna francesa retoma Saigon
            if (si === 1) {
              const u = seg(t, 6.55, 9.0);
              const cx = -5.0 + 3.2 * u;
              col2.group.visible = true; flagFR.visible = true;
              col2.group.position.set(cx, 2.24, -18.6);
              col2.update(1.25 * Math.max(0, t - 6.5), 1);
              shipA.group.position.set(8, 0.05 * Math.sin(t * 1.1), -12.4);
              shipA.group.rotation.set(0, Math.PI, 0.015 * Math.sin(t * 0.8));
              const raise = seg(t, W.retomam - 0.04, W.retomam + 0.72, K.ease.out);
              flagFR.userData.update(t, raise, 1.1);
              flagUK.userData.update(t, 1, 0.7);
              smokeA.update(t, (tt) => { const m = shipA.mouths[0]; return [8 - m[0], shipA.free + 4.0, -12.4, 0.5]; });
              wakeA.userData.update(0.05);
              deckMen.forEach((s, i) => { s.pose(3.2 + i * 0.18, 0, i % 4 === 0 ? 0.7 : 0); });
              walkB.forEach((w) => { w.group.visible = false; });
              crane.group.visible = false; gangB.visible = false;
              const p = [lerp(-15.5, -12.5, u), 3.7, lerp(-23.2, -22.8, u)];
              K.look(camera, p, [cx + 1.6, 3.5, -18.9], 40);
              K.focus(camera, [cx + 2, 3.3, -18.8], 0.05);
            }
            // ------------------------------------------------------------ 3) transporte entra em Haiphong (do rio)
            if (si === 2) {
              const x = shipBX(t), v = Math.max(0, vel(shipBX, t));
              shipB.group.visible = true;
              shipB.group.position.set(x, 0.06 * Math.sin(t * 1.05), -12.0);
              shipB.group.rotation.set(0, Math.PI, 0.015 * Math.sin(t * 0.85));
              wakeB.userData.update(K.clamp(v / 5, 0, 1));
              smokeB.update(t, (tt) => {
                const m = shipB.mouths[Math.floor(K.hash(Math.floor(tt * 12), 5) * 2)];
                const xx = shipBX(tt);
                return [xx - m[0], shipB.group.position.y + m[1], -12.0 - m[2], tt > 9.15 ? 1 : 0];
              });
              flagFRship.userData.update(t, 1, 1.0);
              col2.group.visible = false; flagFR.visible = false;
              walkB.forEach((w) => { w.group.visible = false; });
              gangB.visible = t > 12.45;
              // guindaste: iça o caixote do convés (10.9 a 13.6)
              crane.group.visible = t > 10.3;
              crane.update(0.06 * Math.sin(t * 0.5), 5.0 - 2.6 * seg(t, 10.9, 12.4, K.ease.inOut) + 2.6 * seg(t, 13.0, 14.0, K.ease.inOut), 9.0);
              const u = seg(t, 9.0, 13.55, K.ease.inOut);
              const p = [lerp(27, 22, u), lerp(4.8, 4.4, u), lerp(7, 4, u)];
              K.look(camera, p, [x - 5, 3.7, -13.0], lerp(41, 39, u));
              K.focus(camera, [x - 4, 3.6, -13], 0.05);
            }
            // ------------------------------------------------------------ 4) a coluna desce a prancha
            if (si === 3) {
              shipB.group.visible = true;
              shipB.group.position.set(54, 0.04 * Math.sin(t * 1.05), -12.0);
              shipB.group.rotation.set(0, Math.PI, 0.012 * Math.sin(t * 0.85));
              smokeB.update(t, (tt) => { const m = shipB.mouths[0]; return [54 - m[0], shipB.free + 4.0, -12.0, 0.5]; });
              wakeB.userData.update(0.04);
              flagFRship.userData.update(t, 1, 0.9);
              gangB.visible = true;
              crane.group.visible = true;
              crane.update(0.06 * Math.sin(t * 0.5), 5.0, 9.0);
              walkB.forEach((w) => w.update(t, 0.04));
              col2.group.visible = false; flagFR.visible = false;
              const u = seg(t, 13.55, 15.8);
              const p = [lerp(77, 75, u), 3.5, lerp(-22.6, -22.0, u)];
              K.look(camera, p, [lerp(69.2, 70.6, u), 3.75, -16.2], 43);
              K.focus(camera, [69, 3.4, -16.5], 0.05);
            }
            // ------------------------------------------------------------ 5) usina explode e a cidade apaga
            if (si === 4) {
              const u = seg(t, 15.8, 22.8, K.ease.inOut);
              K.look(camera, [CX - 2 + 2 * u, lerp(6.4, 5.4, u), lerp(35, 30, u)], [CX, lerp(9.6, 8.6, u), 0], lerp(37, 32, u));
              K.focus(camera, [CX, 7, 0], 0.05);
              for (const b of beams) { b.g.rotation.z = 0.34 * Math.sin(t * 0.55 + b.ph); b.g.rotation.x = 0.2 * Math.sin(t * 0.37 + b.ph * 2); }
              // luzes da cidade apagam na palavra "elétrica"
              const blackout = seg(t, W.eletrica - 0.05, W.eletrica + 0.18, K.ease.out);
              LP.setGlow(cityGlow, 1 - 0.94 * blackout);
              for (const b of beams) b.mat.opacity = 0.22 * (1 - 0.8 * blackout);
              chimSmoke.update(t, (tt) => {
                const i = Math.floor(K.hash(Math.floor(tt * 10), 5) * 2);
                const m = plant.mouths[i];
                return [CX + m[0], m[1], m[2], 1];
              });
              // rajadas do Viet Minh cruzam a usina entre "Viet Minh" e "usina"
              const firing = seg(t, W.viet1 - 0.06, W.usina - 0.1);
              tracers.forEach((o) => {
                const live = firing > 0 && firing < 1;
                o.b.visible = live;
                if (!live) return;
                const uu = (((t * 3.4 + o.ph) % 1) + 1) % 1;
                o.b.position.set(CX - 44 + 46 * uu, 1.6 + o.dy + 9 * uu, 12 + o.dz * 0.4);
                o.b.rotation.set(0, 0.26, 0.19);
              });
              flashLight.intensity = t > W.usina + 0.09 ? 520 * Math.exp(-(t - W.usina - 0.09) * 6.5) : 0;
              blast.update(t - (W.usina + 0.06));
              blast2.update(t - (W.usina + 0.22));
              roofFire.update(t, 1.25 * seg(t, W.usina + 0.1, W.usina + 0.6, K.ease.out));
              citySmoke.update(t, (tt) => {
                if (tt < W.usina + 0.1) return [CX - 40, -20, 0, 0];
                const uu = K.clamp((tt - W.usina - 0.1) / 0.7);
                return [CX + 1, 6 + 4 * uu, 2, 1];
              });
            }
            // ------------------------------------------------------------ 6) guerra nas ruas
            if (si === 5) {
              const u = seg(t, 22.8, DUR, K.ease.inOut);
              K.look(camera, [SX - 26 + 3 * u, lerp(4.6, 4.3, u), lerp(12.5, 11.0, u)], [SX - 8.5 + 3 * u, 2.35, -3.0], lerp(42, 38, u));
              K.focus(camera, [SX - 6, 2.2, -2], 0.05);
              const cx = SX - 18 + 1.35 * Math.max(0, t - 23.0);
              col6.group.position.set(cx, 0.03, -2.0);
              col6.update(1.35 * Math.max(0, t - 22.85), 1);
              fires.forEach((f, i) => f.update(t, 0.85 + 0.25 * Math.sin(t * 3 + i * 2)));
              const r1 = seg(t, W.franca2 + 0.02, W.franca2 + 0.66, K.ease.out), r2 = seg(t, W.viet2 + 0.02, W.viet2 + 0.62, K.ease.out);
              flagFR2.userData.update(t, r1, 1.15); flagVM.userData.update(t, r2, 1.15);
              LP.setGlow(streetGlow, 1 - 0.35 * seg(t, W.franca2, W.franca2 + 0.8));
              streetSmoke.update(t, (tt) => [SX + 10, 7.5, -9.0, 1]);
              distanceFlash.update(t - 23.0);
            }
          },
        };
      },

      // ================================================================ som (cada evento com motivo, R16)
      sound(k) {
        const EVENTS = (window.LP_EVENTS = window.LP_EVENTS || []);
        const ev = (t, kind, reason, note) => EVENTS.push({ t: +t.toFixed(2), kind, reason, note });
        const rng = K.rng(12);
        // motor de navio: cama grave contínua (bus amb, não é cama de música)
        const engine = (t0, dur, gain, pan) => {
          k.tone(t0, { f: [[0, 54], [dur * 0.5, 48], [dur, 44]], type: 'sawtooth', dur, gain: 0.05 * gain, a: 0.35, hold: dur - 0.5, filter: 'lowpass', f2: 210, bus: 'amb', pan });
          k.noise(t0, { dur, color: 'brown', filter: 'bandpass', f: 190, q: 0.8, gain: 0.045 * gain, a: 0.5, hold: dur - 0.6, bus: 'amb', pan });
          for (let x = 0; x < dur; x += 1.15) k.tone(t0 + x, { f: 40, type: 'sine', dur: 0.5, gain: 0.006 * gain, bus: 'amb' });
        };

        // tomada 1: navio britânico chega
        engine(0.15, 3.3, 1, -0.35);
        ev(0.2, 'ambient', 'motor do navio britânico chegando ao porto de Saigon', 'cama de motor');
        k.play('thud', W.chegam + 0.22, { gain: 0.55, f: 92, pan: -0.3 });      // casco encontra as defensas
        k.play('tock', W.chegam + 0.33, { gain: 0.3, f: 380, pan: -0.3 });
        k.noise(W.chegam + 0.2, { dur: 0.9, color: 'brown', filter: 'lowpass', f: 300, gain: 0.07, pan: -0.3 });
        ev(W.chegam + 0.22, 'thud', 'word:chegam', 'navio encosta no cais');
        // passos na prancha (uma cama, não um som por pé)
        for (let x = 3.95; x < 6.4; x += 0.44) k.play('tock', x, { gain: 0.075, f: 230 + rng() * 90, pan: -0.25 });
        ev(4.15, 'steps', 'soldados britânicos descem a prancha para o cais', 'passos na prancha');
        k.play('swish', 3.9, { gain: 0.2, dur: 0.5, pan: -0.2 });

        // tomada 2: coluna francesa retoma Saigon
        for (let x = 6.6; x < 9.0; x += 0.42) k.play('tock', x, { gain: 0.085, f: 190 + rng() * 70, pan: -0.05 });
        k.noise(6.6, { dur: 2.4, color: 'brown', filter: 'lowpass', f: 220, gain: 0.03, a: 0.3, hold: 1.8, bus: 'amb' });
        ev(6.55, 'steps', 'word:tropas', 'coluna francesa marcha no cais');
        // bandeira sobe no mastro (pano + catraca)
        k.play('whoosh', W.retomam + 0.12, { gain: 0.22, dur: 0.7, top: 1900, pan: 0.25 });
        for (let x = 0; x < 1.5; x += 0.09) k.noise(W.retomam + 0.1 + x, { dur: 0.14, filter: 'bandpass', f: 700 + rng() * 900, q: 1.1, gain: 0.1, pan: 0.25 });
        ev(W.retomam + 0.12, 'flag', 'word:retomam', 'bandeira francesa sobe no mastro');

        // tomada 3-4: transporte entra em Haiphong e desembarca
        engine(9.15, 4.3, 1.15, -0.2);
        ev(9.3, 'ambient', 'motor do navio de transporte entrando em Haiphong', 'cama de motor');
        k.play('thud', 13.3, { gain: 0.4, f: 78, pan: 0.1 });                  // encosto suave nas defensas
        k.noise(13.3, { dur: 1.1, color: 'brown', filter: 'lowpass', f: 260, gain: 0.05, pan: 0.1 });
        ev(13.3, 'ambient', 'casco do transporte encontra as defensas do cais', 'encosto do casco');
        // guindaste: motor do guincho e o caixote batendo no cais
        k.tone(10.9, { f: [[0, 96], [0.5, 120]], type: 'sawtooth', dur: 1.2, gain: 0.03, a: 0.2, hold: 0.7, filter: 'lowpass', f2: 700, pan: 0.35 });
        for (let x = 0; x < 1.15; x += 0.11) k.play('tock', 10.9 + x, { gain: 0.05, f: 620 + rng() * 260, pan: 0.35 });
        k.play('thud', 12.12, { gain: 0.3, f: 110, pan: 0.35 });
        ev(11.0, 'crane', 'guindaste iça o caixote do convés e o baixa no cais', 'guincho e caixote');
        // passos descendo a prancha e marchando no cais
        for (let x = 13.7; x < 15.7; x += 0.44) k.play('tock', x, { gain: 0.075, f: 210 + rng() * 90, pan: 0.15 });
        k.noise(13.7, { dur: 2.1, color: 'brown', filter: 'bandpass', f: 260, q: 0.9, gain: 0.025, a: 0.2, hold: 1.6, bus: 'amb', pan: 0.15 });
        ev(13.95, 'steps', 'word:desembarcam', 'passos da coluna na prancha e no cais');

        // tomada 5: noite, usina, rajadas, explosão e apagão
        k.noise(15.85, { dur: 6.9, color: 'pink', filter: 'lowpass', f: 420, gain: 0.022, a: 0.8, hold: 5.2, bus: 'amb' });
        ev(16.1, 'ambient', 'noite de Hanói: vento baixo e a usina trabalhando', 'cama noturna');
        k.tone(16.2, { f: 58, type: 'sine', dur: 5.0, gain: 0.012, a: 0.9, hold: 3.4, bus: 'amb' });
        // rajadas de fuzil e metralhadora: estalos rápidos em série
        const fireFrom = W.viet1 - 0.02, fireTo = W.usina - 0.08;
        for (let x = fireFrom, n = 0; x < fireTo; x += 0.055 + rng() * 0.05, n++) {
          k.noise(x, { dur: 0.05, filter: 'highpass', f: 900 + rng() * 700, gain: 0.1 + rng() * 0.06, a: 0.002, pan: -0.45 });
          if (n % 3 === 0) k.tone(x, { f: [[0, 130], [0.09, 60]], dur: 0.1, gain: 0.07, pan: -0.45 });
        }
        ev(fireFrom, 'gunfire', 'word:Viet', 'rajadas do Viet Minh contra a usina');
        // explosão na usina: impacto pesado + estilhaços + fogo no telhado
        k.play('impact', W.usina + 0.06, { gain: 0.95 });
        k.noise(W.usina + 0.06, { dur: 2.2, color: 'brown', filter: 'lowpass', f: [[0, 1800], [1.6, 180]], gain: 0.42, a: 0.004, hold: 0.25, verb: 0.3 });
        for (let i = 0; i < 14; i++) k.play('tock', W.usina + 0.16 + rng() * 0.9, { gain: 0.12 * (1 - i / 16), f: 500 + rng() * 1600, pan: (rng() - 0.5) * 1.2 });
        ev(W.usina + 0.06, 'boom', 'word:usina', 'explosão na usina elétrica de Hanói');
        // apagão: a cidade morre (um corte grave, sem estalo alto)
        k.tone(W.eletrica - 0.02, { f: [[0, 120], [0.8, 34]], dur: 1.0, gain: 0.11, a: 0.01, hold: 0.2, verb: 0.2 });
        k.noise(W.eletrica - 0.02, { dur: 0.5, color: 'brown', filter: 'lowpass', f: 400, gain: 0.09, pan: 0.2 });
        ev(W.eletrica - 0.02, 'sweep', 'word:elétrica', 'apagão: a cidade apaga na palavra');
        for (let x = W.usina + 0.5; x < 22.6; x += 0.16) k.play('tock', x, { gain: 0.03, f: 260 + rng() * 180, pan: 0.15 });

        // tomada 6: fogo nas ruas e a coluna avança
        k.tone(22.9, { f: 44, type: 'sawtooth', dur: 5.5, gain: 0.028, a: 0.6, hold: 4.2, filter: 'lowpass', f2: 260, bus: 'amb' });
        ev(22.9, 'fire', 'fogo nas instalações francesas atacadas', 'fogo nas fachadas');
        for (let x = 23.0; x < DUR; x += 0.28) k.noise(x, { dur: 0.1, color: 'pink', filter: 'bandpass', f: 700 + rng() * 1400, q: 1.4, gain: 0.05 * (0.6 + rng() * 0.6), pan: 0.3 });
        for (let x = 22.95; x < DUR; x += 0.45) k.play('tock', x, { gain: 0.085, f: 200 + rng() * 80, pan: 0.05 });
        k.noise(23.0, { dur: 5.4, color: 'brown', filter: 'lowpass', f: 240, gain: 0.03, a: 0.4, hold: 4.2, bus: 'amb' });
        k.play('impact', 23.0, { gain: 0.25, f: 70, pan: 0.5 });               // outras instalações ao longe
        // as duas bandeiras sobem juntas na frase final
        k.play('whoosh', W.franca2 + 0.05, { gain: 0.2, dur: 1.3, top: 1600, pan: 0.3 });
        for (let x = 0; x < 2.0; x += 0.1) k.noise(W.franca2 + 0.05 + x, { dur: 0.16, filter: 'bandpass', f: 600 + rng() * 1000, q: 1.2, gain: 0.08, pan: 0.3 });
        ev(W.franca2 + 0.05, 'flag', 'word:França#2', 'bandeiras da França e do Viet Minh sobem');
        for (let x = 0; x < 1.4; x += 0.1) k.noise(W.viet2 + 0.02 + x, { dur: 0.16, filter: 'bandpass', f: 600 + rng() * 1000, q: 1.2, gain: 0.07, pan: -0.35 });
      },
    };
  };
})();
