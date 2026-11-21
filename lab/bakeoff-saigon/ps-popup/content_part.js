  // ---------------------------------------------------------------- content: a pop-up book about the fall of Saigon
  // Spread 1: 29 April, helicopter on a rooftop. Spread 2: 30 April, a tank and the palace gate. Spread 3: the president's
  // name card, "2 days", and soldiers laying down their rifles. Cards marked `slide` come up through a slit in the page.
  const C = { card: '#f5ecd9', cream: '#fbf3df', navy: '#22364e', coral: '#e2604a', pink: '#f3ab99', yellow: '#f5bd35', honey: '#eba020', amber: '#cf7d22', leaf: '#74a25e', sage: '#a6c787', deep: '#2f6753', sky: '#cfe5df',
    olive: '#5d6d38', olive2: '#44512a', olive3: '#7c8a4e', grey: '#8d9593', concrete: '#e6dfcd', shade: '#b9b29c', dusk: '#f4cfa0', slate: '#6c7b86', slate2: '#8d9ba2', red: '#d8372d', blue: '#2a4f9a', brown: '#7a5a3a', skin: '#d9a77c' };
  const PAGE_W = 5.6, PAGE_D = 6.4;
  const TURN = 1.05, TURNS = [-0.7, 3.85, 8.4];        // seconds a page takes to turn, and when each turn starts (spread 3 lands at 9.45)
  const DUR = 15;
  // a card that rises through the page between a and b and sinks back between c and d (d omitted: it stays up)
  const rise = (t, a, b, c, d) => K.seg(t, a, b, K.ease.inOut) * (c === undefined ? 1 : 1 - K.seg(t, c, d, K.ease.inOut));

  const win = (a, x0, y0, cols, rows, dx, dy, w, h, col) => { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) a.box(col, x0 + i * dx, y0 + j * dy, w, h, 0.02); };
  const palm = (a, x, y, h, lean = 0.2) => {
    a.line(C.brown, 0.12, (c) => { c.moveTo(x, y); c.quadraticCurveTo(x + lean * 0.5, y + h * 0.5, x + lean, y + h); });
    for (let k = 0; k < 6; k++) { const q = 0.2 + k * 0.52 + (k > 2 ? 0.0 : 0); const ex = x + lean + Math.cos(q) * 0.85, ey = y + h + Math.sin(q) * 0.5 - 0.25 * (k % 2); a.line(C.deep, 0.1, (c) => { c.moveTo(x + lean, y + h); c.quadraticCurveTo(x + lean + Math.cos(q) * 0.5, y + h + 0.38, ex, ey); }); }
  };
  const person = (a, col, s = 1) => {          // a small standing figure, feet at the origin
    a.box(col, -0.13 * s, 0.32 * s, 0.26 * s, 0.42 * s, 0.07 * s); a.box(C.navy, -0.1 * s, 0, 0.08 * s, 0.36 * s, 0.03 * s); a.box(C.navy, 0.02 * s, 0, 0.08 * s, 0.36 * s, 0.03 * s); a.disc(C.skin, 0, 0.86 * s, 0.1 * s);
  };
  const flagSouth = (a, x, y, w, h) => { a.box(C.yellow, x, y, w, h, 0.02); for (let k = 0; k < 3; k++) a.box(C.red, x, y + h * (0.22 + 0.22 * k), w, h * 0.09); };
  const flagNLF = (a, x, y, w, h) => { a.box(C.red, x, y + h / 2, w, h / 2, 0.01); a.box(C.blue, x, y, w, h / 2, 0.01); a.path(C.yellow, (c) => { for (let k = 0; k < 10; k++) { const r = k % 2 ? h * 0.1 : h * 0.24, q = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(x + w / 2 + Math.cos(q) * r, y + h / 2 - Math.sin(q) * r); } }); };
  const plain = (a, col, x, y, w, h, r = 0.45) => a.box(col, x, y, w, h, r);

  // the CH-53: nose to the right, tail up on the left, wheels on y = 0
  const heli = (a) => {
    a.line(C.navy, 0.07, (c) => { c.moveTo(1.1, 0.22); c.lineTo(1.1, 0.55); }); a.line(C.navy, 0.07, (c) => { c.moveTo(3.4, 0.22); c.lineTo(3.4, 0.55); });
    a.disc(C.navy, 1.1, 0.2, 0.2); a.disc(C.grey, 1.1, 0.2, 0.08); a.disc(C.navy, 3.4, 0.2, 0.2); a.disc(C.grey, 3.4, 0.2, 0.08);
    a.path(C.olive, (c) => { c.moveTo(1.0, 0.9); c.lineTo(0.55, 1.3); c.lineTo(0.18, 2.3); c.lineTo(-0.12, 2.3); c.lineTo(-0.05, 1.2); c.lineTo(0.25, 0.55); c.lineTo(0.6, 0.45); });             // tail pylon
    a.box(C.olive, 0.3, 0.42, 4.0, 1.12, 0.5);                                                                                                                                                       // fuselage
    a.box(C.olive2, 1.0, 0.3, 2.6, 0.32, 0.12);                                                                                                                                                      // sponson
    a.path(C.olive2, (c) => { c.moveTo(0.3, 0.55); c.lineTo(0.3, 1.0); c.lineTo(0.62, 1.0); c.lineTo(0.62, 0.55); });                                                                                // rear ramp, up
    a.box(C.olive3, 0.7, 0.98, 3.1, 0.07);
    a.box('#b5d5cf', 3.55, 0.92, 0.6, 0.4, 0.14);                                                                                                                                                    // cockpit window
    for (let i = 0; i < 4; i++) a.disc('#b5d5cf', 1.45 + i * 0.5, 1.15, 0.1);
    a.box(C.olive2, 1.6, 1.5, 1.7, 0.3, 0.14); a.box(C.navy, 2.35, 1.7, 0.2, 0.5, 0.04);                                                                                                            // engines and rotor mast
    a.ctx.globalAlpha = 0.4; a.disc('#efe6cf', 2.45, 2.2, 2.6, 0.2); a.ctx.globalAlpha = 1;                                                                                                          // the blur of the rotor
    a.line(C.navy, 0.07, (c) => { c.moveTo(-0.15, 2.2); c.lineTo(5.05, 2.2); });
    a.line(C.navy, 0.045, (c) => c.arc(0.02, 2.0, 0.33, 0, 7)); a.disc(C.navy, 0.02, 2.0, 0.07);                                                                                                   // tail rotor
  };
  // the T-54 with its front (the end of the barrel is further on) at x = 0
  const tank = (a) => {
    a.box('#2f3a22', -3.5, 0, 3.5, 0.55, 0.27);
    for (let i = 0; i < 5; i++) { a.disc(C.olive3, -3.1 + i * 0.7, 0.28, 0.2); a.disc('#2f3a22', -3.1 + i * 0.7, 0.28, 0.07); }
    a.path(C.olive, (c) => { c.moveTo(-3.4, 0.45); c.lineTo(-3.4, 0.92); c.lineTo(-0.9, 0.98); c.lineTo(0.05, 0.62); c.lineTo(0.05, 0.45); });                                                       // hull, sloped front
    a.box(C.olive2, -3.4, 0.8, 2.5, 0.07);
    a.disc(C.olive, -1.85, 1.1, 0.9, 0.46); a.disc(C.olive2, -1.85, 1.0, 0.9, 0.12);                                                                                                               // turret
    a.box(C.olive2, -1.1, 1.14, 2.7, 0.15, 0.06); a.box(C.olive2, 1.45, 1.1, 0.25, 0.23, 0.06);                                                                                                     // gun
    a.disc(C.olive2, -2.1, 1.55, 0.2, 0.1); a.line(C.navy, 0.04, (c) => { c.moveTo(-2.6, 1.4); c.lineTo(-2.6, 2.6); }); flagNLF(a, -2.58, 2.0, 0.72, 0.5);                                           // antenna and the flag
    a.box(C.yellow, -2.3, 0.62, 0.22, 0.14, 0.02);
  };
  const ladder = (a) => {
    a.line(C.grey, 0.07, (c) => { c.moveTo(-1.9, 0); c.lineTo(-0.55, 1.45); }); a.line(C.grey, 0.07, (c) => { c.moveTo(-1.5, 0); c.lineTo(-0.15, 1.45); });
    for (let k = 0; k < 6; k++) { const u = 0.1 + k * 0.16; a.line(C.grey, 0.045, (c) => { c.moveTo(-1.9 + 1.35 * u, 1.45 * u); c.lineTo(-1.5 + 1.35 * u, 1.45 * u); }); }
  };
  const soldier = (a, x, armed, col) => {
    a.box(C.olive2, x - 0.3, 0, 0.26, 1.15, 0.08); a.box(C.olive2, x + 0.06, 0, 0.26, 1.15, 0.08);
    a.box(col, x - 0.45, 0.95, 0.9, 1.15, 0.28);                                                                                                  // torso
    a.disc(C.skin, x, 2.4, 0.3, 0.33); a.path(C.olive2, (c) => { c.ellipse(x, 2.5, 0.38, 0.3, 0, Math.PI, 0); c.lineTo(x + 0.5, 2.5); c.lineTo(x - 0.5, 2.5); });                  // helmet
    if (armed) { a.box('#2a2d2f', x + 0.42, 0.8, 0.12, 2.0, 0.04); a.box('#2a2d2f', x + 0.3, 1.7, 0.16, 0.34, 0.03); a.box(col, x + 0.28, 1.1, 0.3, 0.22, 0.1); a.box(col, x - 0.52, 1.0, 0.2, 0.7, 0.1); }
    else { a.box(col, x - 0.62, 0.55, 0.2, 1.3, 0.1); a.box(col, x + 0.44, 0.55, 0.2, 1.3, 0.1); a.disc(C.skin, x - 0.52, 0.5, 0.11); a.disc(C.skin, x + 0.54, 0.5, 0.11); }
  };

  const SPREADS = [
    { // ------------------------------------------------------------ 1. 29 April: helicopters on a rooftop
      words: ['29 de abril', 'Saigon'], em: 0.66,
      floor(a) {
        a.box('#cdc6b4', -5.42, -3.02, 10.84, 6.04, 0.45);
        const r = K.rng(21); for (let i = 0; i < 60; i++) a.disc('#bdb6a3', r.range(-5, 5), r.range(-2.8, 2.8), r.range(0.1, 0.5), r.range(0.06, 0.3), r.range(0, 3));
        a.line('#faf3df', 0.1, (c) => c.ellipse(1.6, -0.1, 2.6, 2.1, 0, 0, 7)); a.line('#f0c34a', 0.05, (c) => c.ellipse(1.6, -0.1, 2.3, 1.85, 0, 0, 7));
        a.line('#faf3df', 0.14, (c) => { c.moveTo(1.1, -0.65); c.lineTo(1.1, 0.45); c.moveTo(2.1, -0.65); c.lineTo(2.1, 0.45); c.moveTo(1.1, -0.1); c.lineTo(2.1, -0.1); });
        a.box(C.shade, -4.9, -2.9, 0.18, 5.8, 0.05);
      },
      parts: [
        { id: 'skyline', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.4], art(a) {
          a.box(C.dusk, -4.9, -0.1, 9.8, 3.4, 0.06); a.disc(C.yellow, -2.7, 2.3, 0.62); a.disc('#f9d46c', -2.7, 2.3, 0.4);
          const r = K.rng(5); let x = -4.8; const cols = [C.slate, C.slate2, '#9a8f86', '#7e8d95'];
          while (x < 4.7) { const w = r.range(0.7, 1.4), h = r.range(0.9, 2.3); a.box(r.pick(cols), x, -0.1, w, h, 0.03); win(a, x + 0.12, 0.2, Math.max(2, Math.floor(w / 0.26)), Math.floor((h - 0.3) / 0.34), 0.24, 0.34, 0.1, 0.15, C.cream); x += w + 0.05; }
          palm(a, -4.4, 0.0, 1.5, -0.15); palm(a, 4.5, 0.0, 1.7, 0.2);
        } },
        { id: 'roof', fold: 'v', z: 0.35, alpha: 68, size: [9.4, 1.35], art(a) {
          a.box(C.concrete, -4.7, -0.1, 9.4, 0.62, 0.05); a.box(C.shade, -4.7, 0.42, 9.4, 0.1); for (let x = -4.4; x < 4.5; x += 0.9) a.box(C.shade, x, -0.1, 0.06, 0.52);
          a.box(C.coral, -4.3, 0.52, 1.35, 0.78, 0.04); a.box(C.cream, -4.05, 0.62, 0.45, 0.58, 0.03); a.box(C.navy, -3.98, 0.68, 0.3, 0.5, 0.02);                  // stairwell hut
          a.box(C.grey, 3.2, 0.52, 0.9, 0.6, 0.05); a.box(C.navy, 3.35, 1.1, 0.6, 0.18, 0.05); a.box(C.brown, 3.35, 0.52, 0.08, 0.5); a.box(C.brown, 3.99, 0.52, 0.08, 0.5);       // water tank
        } },
        { id: 'ladderp', fold: 'float', on: 'roof', side: -1, at: [-1, 0], gap: 0.36, sway: 0, area: [-2.0, -0.05, -0.05, 1.5], art: ladder },
        ...[[C.coral, 0.7], [C.navy, 1.5], [C.cream, 2.2], [C.pink, 2.9]].map(([col, s0], i) => ({ fold: 'float', on: 'roof', side: -1, at: [0, 0], gap: 0.5 + 0.02 * i, sway: 0, area: [-0.35, -0.05, 0.35, 1.0],
          move(t) { const x0 = -2.4 - 0.55 * i, tb = s0 + 0.8, k = K.seg(t, tb, tb + 1.0, K.ease.inOut); if (t > tb + 1.0) return null;
            const walk = K.seg(t, s0, s0 + 0.8, K.ease.inOut); return t < tb ? [K.lerp(x0, -1.85, walk), 0.0, 0] : [-1.85 + 1.35 * k, 1.45 * k, 0]; },
          art: (a) => person(a, col, 1.0) })),
        { fold: 'float', on: 'roof', side: 1, at: [0.3, 0.0], gap: 0.3, sway: 0, area: [-0.6, -0.1, 5.1, 2.7],
          move(t) {
            const land = 3.3 * (1 - K.seg(t, 0.1, 1.5, K.ease.out)), off = K.seg(t, 3.49, 4.8, K.ease.in), bob = (t > 1.5 && t < 3.49 ? 0.012 * Math.sin(t * 38) : 0);
            return [0.0 + 1.6 * K.ease.in(K.seg(t, 3.6, 4.8)), land + 3.6 * off + bob, -0.13 * K.ease.in(K.seg(t, 3.49, 4.3))];
          }, art: heli },
      ],
    },
    { // ------------------------------------------------------------ 2. 30 April: a tank and the gate of the palace
      words: ['30 de', 'abril'], em: 0.8,
      floor(a) {
        a.box('#9fbd7a', -5.42, -3.02, 10.84, 6.04, 0.45);
        a.box('#7d8786', -5.42, -2.75, 10.84, 2.15, 0.1); a.box('#c9c3b1', -5.42, -0.6, 10.84, 0.22); a.box('#c9c3b1', -5.42, -2.97, 10.84, 0.22, 0.1);
        for (let x = -5.0; x < 5.0; x += 1.1) a.box('#f5ecd9', x, -1.72, 0.6, 0.09);
        const r = K.rng(12); for (let i = 0; i < 38; i++) a.disc('#8ab067', r.range(-5, 5), r.range(0, 2.8), r.range(0.1, 0.35), r.range(0.06, 0.2));
      },
      parts: [
        { id: 'palace', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.7], art(a) {
          a.box(C.sky, -4.9, -0.1, 9.8, 3.7, 0.06);
          palm(a, -4.35, 0.0, 1.8, 0.15); palm(a, 4.3, 0.0, 1.9, -0.2);
          a.box(C.deep, -4.9, -0.1, 9.8, 0.3, 0.02);
          a.box(C.concrete, -3.6, 0.15, 7.2, 1.0, 0.04); a.box(C.shade, -3.6, 1.0, 7.2, 0.14);                                            // the base, with a row of columns
          for (let i = 0; i < 15; i++) a.box(C.shade, -3.45 + i * 0.49, 0.15, 0.2, 0.85);
          a.box(C.concrete, -2.9, 1.15, 5.8, 1.0, 0.03); a.box(C.deep, -2.7, 1.3, 5.4, 0.7, 0.03);                                         // second tier with the screen
          for (let i = 0; i < 18; i++) a.box(C.concrete, -2.62 + i * 0.3, 1.3, 0.07, 0.7);
          a.box(C.shade, -2.9, 2.1, 5.8, 0.12); a.box(C.concrete, -1.6, 2.15, 3.2, 0.7, 0.03);                                             // third tier
          for (let i = 0; i < 6; i++) a.box(C.deep, -1.35 + i * 0.5, 2.3, 0.35, 0.4, 0.03);
          a.box(C.shade, -1.6, 2.8, 3.2, 0.1); a.line(C.navy, 0.05, (c) => { c.moveTo(0, 2.85); c.lineTo(0, 3.45); }); flagSouth(a, 0.04, 3.0, 0.6, 0.4);   // flagpole with the flag of the South
        } },
        { id: 'fence', fold: 'v', z: 0.3, alpha: 70, size: [10, 1.15], art(a) {
          for (const sg of [-1, 1]) { const x0 = sg > 0 ? 1.82 : -4.78, w = 2.96; a.box(C.shade, x0, -0.1, w, 0.4, 0.03); }
          a.box(C.shade, 1.82 - 6.6 - 0.0, -0.1, 0.01, 0.01);
          for (let x = -4.6; x < 4.7; x += 0.28) if (Math.abs(x) > 2.0) a.box(C.navy, x, 0.28, 0.06, 0.62);
          a.box(C.navy, -4.78, 0.84, 2.96, 0.07); a.box(C.navy, 1.82, 0.84, 2.96, 0.07);
          for (const x of [-2.15, 1.85]) { a.box(C.cream, x, -0.1, 0.3, 1.2, 0.04); a.box(C.shade, x - 0.03, 1.06, 0.36, 0.08); a.disc(C.yellow, x + 0.15, 1.2, 0.09); }
        } },
        { id: 'gate', fold: 'v', z: 0.33, alpha: 70, size: [3.4, 1.35], slide: (t) => -1.5 * K.seg(t, 7.97, 8.4, K.ease.in) * (1 + 0.03 * Math.sin((t - 7.97) * 50)), art(a) {
          a.box(C.shade, -1.7, -0.1, 3.4, 0.4, 0.03);
          for (let x = -1.55; x < 1.6; x += 0.2) a.box(C.navy, x, 0.28, 0.06, 0.66); a.box(C.navy, -1.6, 0.84, 3.2, 0.08); a.box(C.navy, -1.6, 0.4, 3.2, 0.06);
          a.disc(C.yellow, 0, 0.62, 0.17); a.disc(C.coral, 0, 0.62, 0.08); a.box(C.navy, -0.04, 0.28, 0.08, 0.66);
        } },
        { id: 'burst', fold: 'v', z: 0.45, alpha: 70, size: [3.0, 2.0], slide: (t) => -2.0 * (1 - rise(t, 7.95, 8.05, 8.4, 8.6)), art(a) {
          a.path(C.yellow, (c) => { for (let k = 0; k < 20; k++) { const r = k % 2 ? 0.7 : 1.45, q = k * Math.PI / 10; c.lineTo(Math.cos(q) * r * 1.0, 0.95 + Math.sin(q) * r * 0.62); } });
          a.path(C.coral, (c) => { for (let k = 0; k < 20; k++) { const r = k % 2 ? 0.35 : 0.9, q = k * Math.PI / 10 + 0.15; c.lineTo(Math.cos(q) * r, 0.95 + Math.sin(q) * r * 0.62); } });
        } },
        { fold: 'float', on: 'fence', side: -1, at: [0, 0], gap: 0.42, sway: 0, area: [-3.7, -0.05, 1.8, 2.7],
          move(t) { const e = K.seg(t, 5.2, 7.97, K.ease.out), after = K.seg(t, 7.97, 8.8, K.ease.inOut); return [K.lerp(-6.4, -0.15, e) + 0.9 * after, 0.012 * Math.sin(t * 34) * (t > 5.2 && t < 8 ? 1 : 0), 0]; }, art: tank },
      ],
    },
    { // ------------------------------------------------------------ 3. the president, "2 days", and the rifles
      words: ['', ''], em: 0.8,
      ribbons: [
        { words: ['Duong Van', 'Minh'], em: 0.74, slide: (t) => -1.3 * (1 - rise(t, 10.55, 10.9, 12.05, 12.35)) },
        { words: ['2 dias', 'no cargo'], em: 0.74, slide: (t) => -1.3 * (1 - rise(t, 12.05, 12.35, 12.75, 13.05)) },
        { words: ['Deporem', 'as armas'], em: 0.74, slide: (t) => -1.3 * (1 - rise(t, 13.7, 14.05)) },
      ],
      floor(a) {
        a.box('#e7dcc3', -5.42, -3.02, 10.84, 6.04, 0.45);
        for (let i = -6; i <= 6; i++) { a.box('#d9ccae', i * 0.9 - 0.03, -3.0, 0.06, 6.0); } for (let j = -4; j <= 4; j++) a.box('#d9ccae', -5.4, j * 0.9 - 0.03, 10.8, 0.06);
        a.disc('#9fbd7a', -3.6, 1.3, 1.5, 0.8); a.disc('#9fbd7a', 3.8, 0.4, 1.4, 0.7);
      },
      parts: [
        { id: 'city', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.4], art(a) {
          a.box('#f2c7a4', -4.9, -0.1, 9.8, 3.4, 0.06); a.disc(C.coral, 3.2, 2.2, 0.7); a.disc('#f7a487', 3.2, 2.2, 0.46);
          const r = K.rng(33); let x = -4.8; const cols = [C.slate, C.slate2, '#9a8f86', '#7e8d95'];
          while (x < 4.7) { const w = r.range(0.7, 1.4), h = r.range(0.8, 2.2); a.box(r.pick(cols), x, -0.1, w, h, 0.03); win(a, x + 0.12, 0.2, Math.max(2, Math.floor(w / 0.26)), Math.floor((h - 0.3) / 0.34), 0.24, 0.34, 0.1, 0.15, C.cream); x += w + 0.05; }
          palm(a, -4.4, 0.0, 1.6, 0.15); palm(a, 4.45, 0.0, 1.5, -0.15);
        } },
        { id: 'minh', fold: 'v', z: 0.7, alpha: 58, size: [3.0, 3.2], slide: (t) => -3.3 * (1 - rise(t, 10.5, 10.9, 12.5, 12.9)), art(a) {
          a.box(C.coral, -1.2, -0.1, 2.4, 3.0, 0.2); a.box(C.cream, -1.05, 0.05, 2.1, 2.7, 0.14); a.disc(C.sky, 0, 1.45, 0.95, 1.2);
          a.clip((c) => c.ellipse(0, 1.45, 0.95, 1.2, 0, 0, 7), () => { a.disc(C.navy, 0, 1.75, 0.38); a.path(C.navy, (c) => { c.moveTo(-1.2, 0.0); c.quadraticCurveTo(-1.0, 1.15, -0.28, 1.3); c.lineTo(0.28, 1.3); c.quadraticCurveTo(1.0, 1.15, 1.2, 0.0); }); });
          a.disc(C.yellow, 0, 2.78, 0.1);
        } },
        { id: 'armed', fold: 'v', z: 0.5, alpha: 66, size: [6.8, 2.8], slide: (t) => -3.0 * (1 - rise(t, 12.9, 13.3, 13.75, 14.0)), art(a) { soldier(a, -2.2, true, C.olive); soldier(a, 0, true, C.olive3); soldier(a, 2.2, true, C.olive); a.box(C.shade, -3.2, -0.1, 6.4, 0.2, 0.04); } },
        { id: 'unarmed', fold: 'v', z: 0.45, alpha: 66, size: [6.8, 2.8], slide: (t) => -3.0 * (1 - rise(t, 13.78, 14.1)), art(a) { soldier(a, -2.2, false, C.olive); soldier(a, 0, false, C.olive3); soldier(a, 2.2, false, C.olive); a.box(C.shade, -3.2, -0.1, 6.4, 0.2, 0.04); } },
        { id: 'rifles', fold: 'v', z: 1.2, alpha: 78, size: [7.0, 0.7], slide: (t) => -1.0 * (1 - rise(t, 13.8, 14.1)), art(a) {
          a.box(C.shade, -3.4, -0.1, 6.8, 0.1, 0.03);
          for (const [x, y, q] of [[-2.3, 0.18, 0.04], [0.0, 0.2, -0.03], [2.2, 0.17, 0.05]]) { const c = a.ctx; c.save(); c.translate(x, y); c.rotate(q); a.box('#2a2d2f', -0.9, 0, 1.8, 0.09, 0.03); a.box('#2a2d2f', -0.15, -0.2, 0.14, 0.24, 0.03); a.box('#2a2d2f', 0.35, -0.04, 0.5, 0.14, 0.05); c.restore(); }
        } },
      ],
    },
  ];
