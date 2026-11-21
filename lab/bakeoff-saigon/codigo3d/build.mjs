// Gera storyboard.json (16x9 e 9x16) do bake-off Saigon para o kit-video-3d.
// Uso: node build.mjs   -> escreve codigo3d/16x9/storyboard.json e codigo3d/9x16/storyboard.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const DUR = 15.0;

// ---------- utilidades ----------
const r2 = (n) => Math.round(n * 100) / 100;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (k) => k * k * (3 - 2 * k);
const sample = (t0, t1, fn, step = 0.2) => {
  const ks = [];
  for (let t = t0; t < t1 - 1e-6; t += step) ks.push([r2(t), fn(t).map(r2)]);
  ks.push([r2(t1), fn(t1).map(r2)]);
  return ks;
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// peça de forma livre que segue um caminho (keyframes = caminho + deslocamento local)
function peca(id, off, tipo, tam, cor, opt = {}, cam = null, t0 = 0, t1 = DUR) {
  const o = { id, asset: 'forma', pos: add(opt.base || [0, 0, 0], off).map(r2), params: { tipo, tamanho: tam, cor, apoiada: opt.apoiada ?? true, brilho: !!opt.brilho, emissivo: !!opt.emissivo } };
  if (opt.opac !== undefined) o.opacidade = opt.opac;
  const anim = {};
  if (cam) { anim.pos = sample(t0, t1, (t) => add(cam(t), off)); anim.suave = false; }
  if (opt.eixo) { anim.eixo = opt.eixo; anim.giro = [[0, opt.giro]]; }
  if (opt.animExtra) Object.assign(anim, opt.animExtra);
  if (Object.keys(anim).length) o.anim = anim;
  return o;
}

// ---------- helicóptero (CH-46/53 simplificado, verde-oliva) ----------
const OLIVA = '#4d5a2a';
function heli(pref, cam, t0, t1, rot = 420) {
  const P = [];
  const f = (suf, off, tipo, tam, cor, opt) => P.push(peca(`${pref}_${suf}`, off, tipo, tam, cor, opt, cam, t0, t1));
  f('corpo', [0, 0.35, 0], 'caixa', [8.2, 2.6, 2.7], OLIVA);
  f('nariz', [4.6, 0.55, 0], 'caixa', [1.8, 2.1, 2.5], '#44502a');
  f('vidro', [5.52, 1.5, 0], 'caixa', [0.12, 0.9, 1.9], '#a6c8dc', { brilho: true });
  f('cauda', [-6.0, 2.0, 0], 'caixa', [5.2, 0.9, 0.9], OLIVA);
  f('leme', [-8.3, 2.0, 0], 'caixa', [0.9, 2.3, 0.2], OLIVA);
  f('motor', [-0.4, 2.95, 0], 'caixa', [3.2, 1.0, 1.5], '#39431f');
  f('mastro', [1.0, 3.0, 0], 'cilindro', [0.35, 0.7, 0.35], '#2c2c2c');
  f('janela1', [1.4, 1.5, 1.36], 'caixa', [0.9, 0.7, 0.05], '#a6c8dc', { brilho: true });
  f('janela2', [-0.6, 1.5, 1.36], 'caixa', [0.9, 0.7, 0.05], '#a6c8dc', { brilho: true });
  for (const [i, [x, z]] of [[3.2, 1.0], [3.2, -1.0], [-2.2, 1.0], [-2.2, -1.0]].entries()) f(`roda${i}`, [x, 0, z], 'cilindro', [0.7, 0.55, 0.7], '#222222', { eixo: 'x', giro: 90, apoiada: false, base: [0, 0.3, 0] });
  // rotores: hélice com eixo vertical (rotor principal) e lateral (rotor de cauda)
  const rotor = { id: `${pref}_rotor`, asset: 'helice', pos: add([1.0, 3.7, 0], [0, 0, 0]), params: { pas: 4, raio: 3.9, cor: '#2f3318', velocidade: rot }, anim: { eixo: 'x', giro: [[0, -90]], pos: sample(t0, t1, (t) => add(cam(t), [1.0, 3.7, 0])), suave: false } };
  const rotC = { id: `${pref}_rotorc`, asset: 'helice', pos: [-8.3, 2.7, 0.3], params: { pas: 3, raio: 0.9, cor: '#2f3318', velocidade: rot * 1.6 }, anim: { pos: sample(t0, t1, (t) => add(cam(t), [-8.3, 2.7, 0.3])), suave: false } };
  P.push(rotor, rotC);
  return P;
}

// ---------- tanque T-54 simplificado, avançando para -z ----------
function tanque(pref, cam, t0, t1) {
  const P = [];
  const f = (suf, off, tipo, tam, cor, opt) => P.push(peca(`${pref}_${suf}`, off, tipo, tam, cor, opt, cam, t0, t1));
  f('esqE', [-1.75, 0, 0], 'caixa', [0.85, 1.0, 7.0], '#2a2a24');
  f('esqD', [1.75, 0, 0], 'caixa', [0.85, 1.0, 7.0], '#2a2a24');
  f('casco', [0, 0.45, 0.1], 'caixa', [3.0, 0.95, 6.4], '#4a5a2e');
  f('proa', [0, 0.55, -3.3], 'caixa', [2.6, 0.7, 0.8], '#46552b');
  f('torre', [0, 1.4, -0.3], 'cilindro', [2.2, 0.85, 2.2], '#475629');
  f('cupula', [0.5, 2.2, 0.0], 'cilindro', [0.7, 0.3, 0.7], '#3f4d24');
  f('canhao', [0, 1.85, -3.5], 'cilindro', [0.24, 5.0, 0.24], '#2f3a1b', { eixo: 'x', giro: 90, apoiada: false });
  f('saiaE', [-1.4, 0.2, 0], 'caixa', [0.15, 0.7, 6.6], '#3a4622');
  f('saiaD', [1.4, 0.2, 0], 'caixa', [0.15, 0.7, 6.6], '#3a4622');
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) f(`rd${i}${s > 0 ? 'D' : 'E'}`, [s * 1.35, 0.5, -2.4 + i * 1.2], 'cilindro', [0.9, 0.15, 0.9], '#1e1e1a', { eixo: 'z', giro: 90, apoiada: false });
  return P;
}

// ---------- cenário reutilizável ----------
function cidadeTelhado(fmt) {
  const O = [];
  O.push({ id: 'predio', asset: 'forma', pos: [0, 0, 0], params: { tipo: 'caixa', tamanho: [17, 18, 17], cor: '#d4c7a4' } });
  for (const [i, [x, z, w, d]] of [[0, 8.2, 17.4, 0.7], [0, -8.2, 17.4, 0.7], [8.2, 0, 0.7, 16], [-8.2, 0, 0.7, 16]].entries())
    O.push({ id: `mureta${i}`, asset: 'forma', pos: [x, 18, z], params: { tipo: 'caixa', tamanho: [w, 1.0, d], cor: '#bfb18c' } });
  O.push({ id: 'casa_maq', asset: 'forma', pos: [-6, 18, -5.5], params: { tipo: 'caixa', tamanho: [3, 2.6, 3], cor: '#b8ab88' } });
  for (const [i, x] of [-4.5, 4.5].entries()) O.push({ id: `pad${i}`, asset: 'forma', pos: [x, 18, 0], params: { tipo: 'cilindro', tamanho: [6.2, 0.06, 6.2], cor: '#e8d9a0' } });
  O.push({ id: 'padH0', asset: 'forma', pos: [-4.5, 18.06, 0], params: { tipo: 'cilindro', tamanho: [4.6, 0.04, 4.6], cor: '#6b6552' } });
  O.push({ id: 'padH1', asset: 'forma', pos: [4.5, 18.06, 0], params: { tipo: 'cilindro', tamanho: [4.6, 0.04, 4.6], cor: '#6b6552' } });
  const vizinhos = [['predio_apartamentos', [-28, 0, -10], 'azul'], ['predio_apartamentos', [27, 0, -14], 'rosa'], ['predio_apartamentos', [-46, 0, 36], 'alto'], ['predio_apartamentos', [30, 0, 22], 'azul'], ['arranha_ceu', [-52, 0, -48], undefined], ['arranha_ceu', [48, 0, -52], 'escuro'], ['loja', [0, 0, -34], undefined], ['predio_apartamentos', [-8, 0, 44], 'rosa']];
  vizinhos.forEach(([a, p, v], i) => O.push({ id: `viz${i}`, asset: a, pos: p, ...(v ? { variante: v } : {}), giro: i % 2 ? 20 : -15 }));
  return O;
}

// helicóptero A: decola em "evacuam" (3,48). Helicóptero B: chega e pousa até 2,8 s.
const camA = (t) => {
  if (t < 3.48) return [-4.5, 18.06, 0];
  const k = (t - 3.48);
  return [-4.5 + k * k * 1.1 + k * 0.4, 18.06 + k * 1.6 + k * k * 2.2, -k * 0.6];
};
const camB = (t) => {
  const k = ease(clamp(t / 2.9));
  return [lerp(46, 4.5, k), lerp(34, 18.06, k), lerp(-14, 0, k)];
};

// pessoas subindo a escada do helicóptero A
const SOLD = { skin: '#c99a6e', top: { color: '#5a6b3a' }, bottom: { color: '#4b5a30' }, shoes: '#241d14', hat: { type: 'cap', color: '#5a6b3a' }, hair: { style: 'short', color: '#2a1d12' } };
function pessoasTelhado(fmt) {
  const out = [];
  const subir = (id, preset, over, tStart, tBase, tTopo, p0, vira) => {
    const base = [-4.5, 18, 3.3];
    const topo = [-4.5, 19.5, 1.9];
    const keys = [[0, p0], [tStart, p0], [tBase, base], [tTopo, topo], [tTopo + 0.01, topo]];
    out.push({ id, preset, overrides: over, pos: p0, giro: 180, viraPara: [{ em: 0, alvo: [-4.5, 3.3] }, { em: tBase, alvo: [-4.5, 0] }],
      anim: { pos: keys.map(([t, p]) => [t, p]), suave: false }, some: tTopo + 0.1,
      acoes: [{ clip: 'walk', de: tStart, ate: tTopo, velocidade: 1 }, { clip: 'idle', de: 0, ate: tStart }] });
  };
  subir('p1', 'mulher', { hair: { style: 'bun', color: '#1a1a1a' }, top: { color: '#d8d0b0' } }, 0.0, 1.5, 2.2, [-1.2, 18, 7.0]);
  subir('p2', 'homem', { top: { color: '#7aa0c8' }, bottom: { color: '#3a3a44' } }, 0.8, 2.3, 3.0, [-8.0, 18, 7.2]);
  subir('p3', 'velhinho', {}, 1.6, 3.0, 3.35, [-3.0, 18, 5.8]);
  // fuzileiro orienta a fila e aponta para o helicóptero
  out.push({ id: 'fz', preset: 'homem', overrides: { ...SOLD, hat: { type: 'hardhat', color: '#4f5b30' } }, pos: [-6.4, 18, 3.8], giro: 90, viraPara: [{ em: 0, alvo: [-4.5, 1] }],
    acoes: [{ clip: 'point', de: 0.3, ate: 3.4, params: { dir: 'forward' } }] });
  // quem espera na fila
  out.push({ id: 'q1', preset: 'mulher', overrides: { hair: { style: 'long', color: '#3a2412' }, top: { color: '#b86a5a' } }, pos: [-2.2, 18, 6.4], giro: 200, acoes: [{ clip: 'look_around', de: 0, ate: DUR }] });
  out.push({ id: 'q2', preset: 'crianca', overrides: {}, pos: [-3.2, 18, 6.6], giro: 190, acoes: [{ clip: 'idle', de: 0, ate: DUR }] });
  out.push({ id: 'q3', preset: 'homem', overrides: { top: { color: '#c8c0a0' } }, pos: [-1.0, 18, 5.6], giro: 200, acoes: [{ clip: 'look_around', de: 0, ate: DUR }] });
  return out;
}

function escada() {
  return { id: 'escada', asset: 'escada', pos: [-4.5, 18, 2.7], giro: 180, params: { height: 2.2 } };
}

// ---------- avenida e palácio ----------
const tankPath = (t) => {
  if (t <= 4.9) return [0, 0, -4.3];
  if (t <= 7.96) return [0, 0, lerp(-4.3, -28.8, (t - 4.9) / (7.96 - 4.9))];
  return [0, 0, -28.8 - (t - 7.96) * 3.2];
};

function avenida(fmt) {
  const O = [];
  O.push({ id: 'rua', asset: 'rua_reta', pos: [0, 0, 0], params: { length: 66, lanes: 4, sidewalk: 3 } });
  O.push({ id: 'patio', asset: 'chao', pos: [0, 0, -50], params: { type: 'concreto', size: 44 } });
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) O.push({ id: `pal${i}${s}`, asset: 'palmeira', pos: [s * 8.2, 0.2, 26 - i * 9], params: { seed: i + 1, height: 8 + (i % 3) } });
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) O.push({ id: `pt${i}${s}`, asset: 'poste_luz', pos: [s * 7.0, 0.2, 22 - i * 16], params: { height: 6.5 } });
  O.push({ id: 'cl1', asset: 'loja', pos: [-17, 0, 14], giro: 90, variante: 'padaria' });
  O.push({ id: 'cl2', asset: 'predio_apartamentos', pos: [-19, 0, -6], giro: 90, variante: 'rosa' });
  O.push({ id: 'cr1', asset: 'predio_apartamentos', pos: [19, 0, 8], giro: -90, variante: 'azul' });
  O.push({ id: 'cr2', asset: 'loja', pos: [17, 0, -14], giro: -90, variante: 'mercado' });
  O.push({ id: 'cr3', asset: 'predio_apartamentos', pos: [20, 0, -22], giro: -90 });
  O.push({ id: 'cl3', asset: 'loja', pos: [-17, 0, -24], giro: 90 });
  O.push({ id: 'taxi', asset: 'carro_sedan', pos: [-3.2, 0.06, 18], giro: 180, variante: 'taxi', movimentos: [] });
  // palácio da Independência (1966): base branca, bloco superior com brise vertical
  O.push({ id: 'p_base', asset: 'forma', pos: [0, 0, -62], params: { tipo: 'caixa', tamanho: [46, 7, 18], cor: '#efe8d6' } });
  O.push({ id: 'p_sup', asset: 'forma', pos: [0, 7, -62], params: { tipo: 'caixa', tamanho: [38, 6.5, 14], cor: '#e6dfcb' } });
  O.push({ id: 'p_cob', asset: 'forma', pos: [0, 13.5, -62], params: { tipo: 'caixa', tamanho: [42, 0.8, 18], cor: '#f4efe3' } });
  O.push({ id: 'p_porta', asset: 'forma', pos: [0, 0, -52.8], params: { tipo: 'caixa', tamanho: [10, 4.5, 0.4], cor: '#3a3430' } });
  for (let i = 0; i < 4; i++) O.push({ id: `p_deg${i}`, asset: 'forma', pos: [0, 0, -52.5 + i * 1.4 - 0], params: { tipo: 'caixa', tamanho: [12 - i, 0.3 * (4 - i), 1.4], cor: '#d9d2c0' } });
  for (let i = 0; i < 15; i++) O.push({ id: `p_br${i}`, asset: 'forma', pos: [-17.5 + i * 2.5, 7, -54.6], params: { tipo: 'caixa', tamanho: [0.5, 6.5, 0.7], cor: '#cfc7b0' } });
  // muro lateral e pilares do portão em z = -32.5
  for (const s of [-1, 1]) {
    O.push({ id: `pil${s}`, asset: 'forma', pos: [s * 6.6, 0, -32.5], params: { tipo: 'caixa', tamanho: [1.3, 4.8, 1.3], cor: '#d8d0bc' } });
    O.push({ id: `muro${s}`, asset: 'forma', pos: [s * 17.2, 0, -32.5], params: { tipo: 'caixa', tamanho: [20, 2.6, 0.5], cor: '#e2dac4' } });
  }
  return O;
}

function portao(tFall) {
  const L = [];
  for (const s of [-1, 1]) {
    L.push({ id: `folha${s}`, asset: 'forma', pos: [s * 3.0, 0, -32.5], params: { tipo: 'caixa', tamanho: [5.6, 3.4, 0.22], cor: '#1f1f1f' },
      anim: { eixo: 'x', giro: [[tFall, 0], [tFall + 0.9, -86]] } });
    L.push({ id: `grade${s}`, asset: 'forma', pos: [s * 3.0, 0, -32.5], params: { tipo: 'caixa', tamanho: [5.0, 2.8, 0.30], cor: '#3a3a3a' }, opacidade: 0.0, anim: { eixo: 'x', giro: [[tFall, 0], [tFall + 0.9, -86]] } });
  }
  return L;
}

// ---------- montagem das cenas ----------
function build(fmt) {
  const V = fmt === '9x16';
  const fv = (a, b) => (V ? b : a); // valor por formato
  const cenas = [];
  const sky = { horario: 'tarde', chao: 'concreto', nuvens: true };
  const cena = (ini, fim, o) => cenas.push({ inicio: ini, fim, ...o });
  const AMB_TELHADO = { ...sky, fundo: 'cidade' };

  // --- 1: telhado ---
  const telhado = () => [...cidadeTelhado(fmt), escada(), ...heli('hA', camA, 0, 4.9), ...heli('hB', camB, 0, 4.9)];
  const poeiraA = { material: 'poeira', origem: [-4.5, 18.3, 0], destino: [-10, 18.4, 4], taxa: 40, de: 3.3, ate: 4.9, dispersao: 2.2, espalha: 3 };
  const poeiraB = { material: 'poeira', origem: [4.5, 18.3, 0], destino: [10, 18.4, -3], taxa: 30, de: 1.8, ate: 3.4, dispersao: 2.0, espalha: 3 };
  const titulo1 = { texto: '29 DE ABRIL · SAIGON', de: 0.15, ate: 4.85, estilo: 'titulo' };
  cena(0, 1.7, { ambiente: AMB_TELHADO, objetos: telhado(), personagens: pessoasTelhado(fmt), fluxos: [poeiraB],
    camera: { tipo: 'travelling', de: { pos: fv([-24, 24, 26], [-20, 25, 32]), olha: [0, 19.6, 0], fov: fv(42, 58) }, para: { pos: fv([-14, 22.4, 17], [-13, 23, 24]), olha: [0, 19.6, 0], fov: fv(42, 58) } }, textos: [titulo1] });
  cena(1.7, 3.4, { ambiente: AMB_TELHADO, objetos: telhado(), personagens: pessoasTelhado(fmt), fluxos: [poeiraB],
    camera: { tipo: 'travelling', de: { pos: fv([-10, 21.4, 10.5], [-8.5, 21.8, 12]), olha: [-4.5, 19.4, 2.6], fov: fv(40, 52) }, para: { pos: fv([-8.2, 21.0, 7.6], [-7.2, 21.4, 8.6]), olha: [-4.5, 19.6, 2.2], fov: fv(40, 52) } }, textos: [titulo1] });
  cena(3.4, 4.9, { ambiente: AMB_TELHADO, objetos: telhado(), personagens: pessoasTelhado(fmt), fluxos: [poeiraA, poeiraB],
    camera: { tipo: 'travelling', de: { pos: fv([-12, 20.9, 11], [-12, 21.2, 13]), olha: [-4.5, 19.8, 0], fov: fv(46, 60) }, para: { pos: fv([-17, 21.5, 14], [-17, 22, 17]), olha: [-1.5, 25.5, -1], fov: fv(46, 60) } }, textos: [titulo1],
    efeitos: [{ tipo: 'tremor', de: 3.48, ate: 4.0, intensidade: 0.25 }] });

  // --- 2: avenida e portão ---
  const tkPath = tankPath;
  const rua = () => [...avenida(fmt), ...portao(7.96), ...tanque('tk', tkPath, 4.9, 8.8)];
  const ancora = (t0, t1) => ({ id: 'tkA', asset: 'forma', pos: tkPath(t0), params: { tipo: 'caixa', tamanho: [0.2, 0.2, 0.2], cor: '#000000' }, opacidade: 0,
    movimentos: [{ de: 4.9, ate: 7.96, para: [0, -28.8] }, { de: 7.96, ate: 8.8, para: [0, -31.5] }] });
  const fluxoTanque = [
    { material: 'fumaca', origem: { ancora: 'tkA', desloca: [0.8, 1.2, -3.0] }, destino: { ancora: 'tkA', desloca: [0.8, 4.5, -5.0] }, taxa: 20, de: 4.9, ate: 8.8, dispersao: 0.2 },
    { material: 'poeira', origem: { ancora: 'tkA', desloca: [0, 0.2, -3.2] }, destino: { ancora: 'tkA', desloca: [0, 0.6, -7.5] }, taxa: 35, de: 4.9, ate: 8.8, dispersao: 1.4, espalha: 1.2 },
  ];
  const AMB_RUA = { ...sky, fundo: 'cidade', chao: 'concreto' };
  const tit2 = { texto: '30 DE ABRIL', de: 4.95, ate: 8.7, estilo: 'titulo' };
  cena(4.9, 6.3, { ambiente: AMB_RUA, objetos: [...rua(), ancora(4.9)], personagens: [], fluxos: fluxoTanque,
    camera: { tipo: 'travelling', de: { pos: fv([-8, 2.2, 9], [-7.5, 2.8, 12]), olha: [0, 1.6, -12], fov: fv(46, 62) }, para: { pos: fv([-9.5, 3.0, -3], [-8.5, 3.4, 0]), olha: [0, 1.8, -22], fov: fv(46, 62) } }, textos: [tit2] });
  cena(6.3, 7.7, { ambiente: AMB_RUA, objetos: [...rua(), ancora(4.9)], personagens: [], fluxos: fluxoTanque,
    camera: { tipo: 'travelling', de: { pos: fv([8, 1.7, -19], [7.5, 2.0, -17]), olha: [0, 1.7, -24], fov: fv(40, 56) }, para: { pos: fv([7.5, 1.9, -23], [7, 2.2, -21]), olha: [0, 1.7, -29], fov: fv(40, 56) } }, textos: [tit2] });
  cena(7.7, 8.8, { ambiente: AMB_RUA, objetos: [...rua(), ancora(4.9)], personagens: [], fluxos: [...fluxoTanque,
      { material: 'poeira', origem: [0, 0.4, -32.5], destino: [0, 2.2, -36], taxa: 90, de: 7.96, ate: 8.8, dispersao: 3, espalha: 3.5 },
      { material: 'fagulha', origem: [0, 0.6, -32.2], destino: [0, 2.0, -34], taxa: 50, de: 7.96, ate: 8.4, dispersao: 2.5, espalha: 2 }],
    camera: { tipo: 'travelling', de: { pos: fv([7.5, 2.0, -21], [7, 2.4, -18]), olha: [0, 1.6, -31], fov: fv(44, 60) }, para: { pos: fv([5.5, 2.6, -24], [5, 3.2, -21]), olha: [0, 1.6, -32.5], fov: fv(44, 60) } },
    textos: [tit2], efeitos: [{ tipo: 'tremor', de: 7.96, ate: 8.6, intensidade: 0.7 }] });

  // --- 3: o presidente (silhueta contra a janela do fim de tarde) ---
  const sala = () => [
    { id: 'janela', asset: 'forma', pos: [0, 0.4, -6.2], params: { tipo: 'caixa', tamanho: [9, 4.6, 0.2], cor: '#c77a2a', emissivo: true } },
    { id: 'moldura1', asset: 'forma', pos: [-4.8, 0, -6.0], params: { tipo: 'caixa', tamanho: [0.6, 5.2, 0.5], cor: '#d8d0bc' } },
    { id: 'moldura2', asset: 'forma', pos: [4.8, 0, -6.0], params: { tipo: 'caixa', tamanho: [0.6, 5.2, 0.5], cor: '#d8d0bc' } },
    { id: 'mesa', asset: 'forma', pos: [0, 0, -3.4], params: { tipo: 'caixa', tamanho: [3.2, 0.85, 1.4], cor: '#4a2f1c' } },
    { id: 'cadeira', asset: 'forma', pos: [0, 0, -4.7], params: { tipo: 'caixa', tamanho: [0.9, 1.2, 0.8], cor: '#2c1d12' } },
    { id: 'tapete', asset: 'forma', pos: [0, 0.01, -1.2], params: { tipo: 'caixa', tamanho: [5, 0.03, 6], cor: '#6b2a28' } },
  ];
  const sil = (t0) => ({ id: 'pres', preset: 'homem', overrides: { skin: '#0c0c0c', top: { color: '#0c0c0c', sleeves: 'long' }, bottom: { color: '#0c0c0c' }, shoes: '#0c0c0c', hair: { style: 'short', color: '#0c0c0c' } }, pos: [0, 0, -1.6], giro: 0, aparece: t0,
    acoes: [{ clip: 'idle', de: 0, ate: DUR }, { clip: 'nod', de: 11.0, ate: 11.5 }] });
  const AMB_SALA = { horario: 'tarde', fundo: 'interior', chao: 'madeira', nuvens: false };
  cena(8.8, 10.5, { ambiente: AMB_SALA, objetos: sala(), personagens: [sil(9.63)],
    camera: { tipo: 'travelling', de: { pos: fv([6, 1.8, 6.2], [4.5, 1.9, 7.5]), olha: [0, 1.5, -2], fov: fv(40, 54) }, para: { pos: fv([3.5, 1.7, 4.2], [2.8, 1.8, 5.2]), olha: [0, 1.5, -1.8], fov: fv(40, 54) } },
    textos: [{ texto: 'PRESIDENTE DO SUL', de: 9.45, ate: 12.0, estilo: 'destaque' }],
    efeitos: [{ tipo: 'zoom', de: 8.8, ate: 10.5, para: 1.06 }] });
  cena(10.5, 12.8, { ambiente: AMB_SALA, objetos: sala(), personagens: [sil(0)],
    camera: { tipo: 'travelling', de: { pos: fv([-1.2, 1.9, 1.6], [-1.0, 2.0, 2.2]), olha: [0, 1.7, -4.5], fov: fv(38, 52) }, para: { pos: fv([-0.5, 1.8, -0.6], [-0.4, 1.9, -0.4]), olha: [0.2, 1.6, -4.8], fov: fv(38, 52) } },
    textos: [{ texto: 'PRESIDENTE DO SUL', de: 10.5, ate: 12.0, estilo: 'destaque' }, { texto: '2 DIAS NO CARGO', de: 12.06, ate: 12.8, estilo: 'destaque' }],
    elementos: [{ tipo: 'etiqueta', texto: 'Duong Van Minh', ancora: 'pres', alturaRel: 0.55, dx: fv(0.14, -0.02), de: 10.55, ate: 12.0, ponto: '#ffd60a' },
      { tipo: 'icone', icone: 'relogio', pos: fv([0.74, 0.46], [0.76, 0.5]), tamanho: 0.12, de: 12.06, ate: 12.8 }] });

  // --- 4: soldados deixam os fuzis ---
  const n = fv(6, 4);
  const sp = fv(1.7, 1.3);
  const sold = [];
  const fuzis = [];
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * sp;
    const td = 13.81 + i * 0.07;
    sold.push({ id: `s${i}`, preset: 'homem', overrides: { ...SOLD, height: 1.7 + (i % 3) * 0.03 }, pos: [x, 0, 0], giro: 0, viraPara: [{ em: 12.8, alvo: 'camera' }],
      acoes: [{ clip: 'idle', de: 12.8, ate: td }, { clip: 'crouch', de: td, ate: td + 0.6 }, { clip: 'idle', de: td + 0.6, ate: DUR }],
      movimentos: [{ de: td + 0.65, ate: DUR, para: [x * 1.08, 0.9], clip: 'walk' }] });
    fuzis.push({ id: `f${i}`, asset: 'forma', pos: [x + 0.32, 0, 0.12], params: { tipo: 'caixa', tamanho: [0.07, 1.05, 0.1], cor: '#262219' },
      anim: { eixo: 'z', giro: [[12.8, 0], [td, 0], [td + 0.55, -88]], pos: [[12.8, [x + 0.32, 0, 0.12]], [td + 0.6, [x + 0.32, 0, 0.12]]] } });
  }
  const patio = () => [
    { id: 'pt', asset: 'chao', pos: [0, 0, 0], params: { type: 'concreto', size: 36 } },
    { id: 'fundo_p', asset: 'forma', pos: [0, 0, -14], params: { tipo: 'caixa', tamanho: [44, 7, 8], cor: '#efe8d6' } },
    { id: 'fundo_s', asset: 'forma', pos: [0, 7, -14], params: { tipo: 'caixa', tamanho: [36, 6, 7], cor: '#e6dfcb' } },
    ...Array.from({ length: 12 }, (_, i) => ({ id: `br${i}`, asset: 'forma', pos: [-16.5 + i * 3, 7, -10.2], params: { tipo: 'caixa', tamanho: [0.5, 6, 0.6], cor: '#cfc7b0' } })),
    { id: 'tkF', asset: 'forma', pos: [11, 0, -4], params: { tipo: 'caixa', tamanho: [3, 1.4, 6.4], cor: '#4a5a2e' } },
    { id: 'tkFt', asset: 'forma', pos: [11, 1.4, -4.2], params: { tipo: 'cilindro', tamanho: [2.2, 0.85, 2.2], cor: '#475629' } },
    { id: 'tkFc', asset: 'forma', pos: [11, 1.85, -7.5], params: { tipo: 'cilindro', tamanho: [0.24, 5, 0.24], cor: '#2f3a1b', apoiada: false }, anim: { eixo: 'x', giro: [[0, 90]] } },
  ];
  const AMB_PATIO = { ...sky, fundo: 'cidade', chao: 'concreto' };
  cena(12.8, 13.8, { ambiente: AMB_PATIO, objetos: [...patio(), ...fuzis], personagens: sold,
    camera: { tipo: 'travelling', de: { pos: fv([1.5, 1.0, 11], [0.5, 1.2, 15]), olha: [0, 1.3, 0], fov: fv(40, 56) }, para: { pos: fv([0.5, 1.1, 8], [0, 1.3, 11.5]), olha: [0, 1.3, 0], fov: fv(40, 56) } } });
  cena(13.8, 14.5, { ambiente: AMB_PATIO, objetos: [...patio(), ...fuzis], personagens: sold,
    camera: { tipo: 'travelling', de: { pos: fv([-5.5, 0.45, 4.2], [-3.2, 0.5, 4.4]), olha: [-1, 0.5, 0], fov: fv(44, 56) }, para: { pos: fv([-2.5, 0.7, 4.0], [-1.6, 0.8, 4.2]), olha: [0, 0.6, 0], fov: fv(44, 56) } } });
  const fim = { id: 'iris', asset: 'forma', pos: [0, 1.4, 8.4], params: { tipo: 'caixa', tamanho: [14, 10, 0.1], cor: '#000000', apoiada: false }, anim: { escala: [[14.5, 0.0001], [14.68, 0.0001], [14.97, 1]] } };
  cena(14.5, DUR, { ambiente: AMB_PATIO, objetos: [...patio(), ...fuzis, fim], personagens: sold,
    camera: { tipo: 'fixa', pos: fv([0, 1.6, 9.6], [0, 1.8, 12.5]), olha: [0, 0.9, 0], fov: fv(38, 54) } });

  for (const c of cenas) {
    const cl = (a) => { if (a.de === undefined && a.ate === undefined) return a; const de = Math.max(a.de ?? c.inicio, c.inicio); const ate = Math.min(a.ate ?? c.fim, c.fim); return ate - de > 0.01 ? { ...a, de: r2(de), ate: r2(ate) } : null; };
    for (const p of c.personagens || []) if (p.acoes) p.acoes = p.acoes.map(cl).filter(Boolean);
    for (const k of ['fluxos', 'textos', 'elementos', 'efeitos']) if (c[k]) c[k] = c[k].map(cl).filter(Boolean);
  }
  return { versao: 1, titulo: 'A queda de Saigon', formato: V ? { largura: 1080, altura: 1920, fps: 30 } : { largura: 1920, altura: 1080, fps: 30 },
    duracao: DUR, audio: 'narracao.wav', palavras: 'palavras.json', legendas: { ativo: false }, ambiente: sky, qualidade: 'alta', cenas };
}

for (const fmt of ['16x9', '9x16']) {
  const dir = path.join(aqui, fmt);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(build(fmt), null, 1));
  const src = path.join(aqui, '..');
  for (const f of ['narracao.wav', 'palavras.json']) fs.copyFileSync(path.join(src, f), path.join(dir, f));
  console.log('ok', fmt);
}
