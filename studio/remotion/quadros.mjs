// Conferência rápida: gera só os quadros que importam (palavras de ação) na GPU, sem renderizar o vídeo.
// Uso (de dentro de studio/remotion): node quadros.mjs <props.json> <saida-dir> [t1,t2,...|auto] [--largura 640]
// "auto" = todo tempo *_s do spec (ações e efeitos) + o meio de cada tomada. Monta uma folha <saida>/folha.jpg.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process';
const [propsPath, outDir, sel = 'auto'] = process.argv.slice(2);
const props = JSON.parse(fs.readFileSync(propsPath, 'utf8')); const fps = props.fps || 30, dur = props.durationSec;
let ts = [];
if (sel === 'auto') {
  const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k.endsWith('_s') && typeof v === 'number' && k !== 'end_s') ts.push(v); walk(v); } };
  walk(props.spec); (props.spec.shots || []).forEach((s) => ts.push((s.start_s + s.end_s) / 2));
  const cuts = (props.spec.shots || []).map((s) => s.start_s);
  ts = ts.map((t) => (cuts.some((c) => Math.abs(t - c) < 0.25) ? t + 0.3 : t + 0.15));     // um pouco depois da ação; fora do fade
} else ts = sel.split(',').map(Number);
ts = [...new Set(ts.filter((t) => t >= 0 && t < dur - 0.05).map((t) => Math.round(t * fps)))].sort((a, b) => a - b).slice(0, 24);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'VietnaScene', inputProps: props, chromiumOptions: {gl: 'vulkan'}});
const t0 = Date.now(); const files = [];
for (const f of ts) { const o = path.join(outDir, `q_${(f / fps).toFixed(2)}.jpg`); await renderStill({serveUrl, composition: comp, frame: f, output: o, inputProps: props, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, chromiumOptions: {gl: 'vulkan'}}); files.push(o); }
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(outDir, 'q_*.jpg'), '-vf', 'scale=640:-1,tile=4x' + Math.ceil(files.length / 4), '-frames:v', '1', path.join(outDir, 'folha.jpg')]);
console.log(JSON.stringify({quadros: files.length, tempos: ts.map((f) => +(f / fps).toFixed(2)), segundos: +((Date.now() - t0) / 1000).toFixed(1), folha: path.join(outDir, 'folha.jpg')}));
