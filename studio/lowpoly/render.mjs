// render.mjs Sxx: renderiza a cena low-poly em Chrome headless na GPU (Vulkan/ANGLE), codifica com h264_nvenc e mixa com a voz.
//   node render.mjs S05                      (vídeo final 1920x1080, 30 fps, 32 amostras)
//   node render.mjs S05 --stills 3,8,13      (quadros 960x540 em render_lowpoly/stills/Sxx, rápido)
// Nunca SwiftShader, nunca libx264.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const require = createRequire(path.join(HERE, 'package.json'));
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME_PATH || path.join(ROOT, 'studio/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell');
const VIETNA = path.join(ROOT, 'media/pt-br-historia/vietna');

const args = process.argv.slice(2);
const SCENE = args[0];
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const STILLS = opt('stills', null);
const W = +opt('w', STILLS ? 960 : 1920), H = +opt('h', STILLS ? 540 : 1080), SAMPLES = +opt('samples', STILLS ? 6 : 32), FPS = 30, CQ = +opt('cq', 19);
const OUTDIR = path.join(VIETNA, 'render_lowpoly');
fs.mkdirSync(OUTDIR, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const f = url.startsWith('/props/') ? path.join(VIETNA, 'render/props', url.slice(7)) : path.join(HERE, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory() || f.includes('node_modules')) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox', '--hide-scrollbars', '--mute-audio', '--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=vulkan', '--use-vulkan', '--enable-features=Vulkan', '--disable-vulkan-surface', `--window-size=${W},${H}`],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('response', (r) => { if (r.status() >= 400) console.log('[http]', r.status(), r.url()); });
await page.goto(`http://127.0.0.1:${port}/index.html?scene=${SCENE}&w=${W}&h=${H}&samples=${SAMPLES}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__error', { timeout: 180000 });
const err = await page.evaluate('window.__error');
if (err) { console.error(err); await browser.close(); server.close(); process.exit(1); }
const gl = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const e = c.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; });
const DUR = await page.evaluate('window.DURATION');
console.log(`pronto: ${W}x${H}, amostras ${SAMPLES}, duração ${DUR}, GL: ${gl}`);
if (/swiftshader|swangle|llvmpipe/i.test(gl)) { console.error('GL em CPU: abortando'); process.exit(2); }

const sfx = path.join(OUTDIR, `${SCENE}_sfx.wav`);
if (!STILLS) {
  const t0 = Date.now();
  const res = await page.evaluate(async () => await window.renderSound(48000));
  fs.writeFileSync(sfx, Buffer.from(res.wav, 'base64'));
  fs.writeFileSync(path.join(OUTDIR, `${SCENE}_events.json`), JSON.stringify({ duration: DUR, events: res.events }, null, 1));
  console.log(`sfx -> ${sfx} (pico ${res.peak.toFixed(3)}, ${((Date.now() - t0) / 1000).toFixed(1)}s, ${res.events.length} eventos)`);
}

if (STILLS) {
  const dir = path.join(OUTDIR, 'stills', SCENE); fs.mkdirSync(dir, { recursive: true });
  for (const s of STILLS.split(',')) {
    await page.evaluate((x) => window.seek(x), +s);
    await page.screenshot({ path: path.join(dir, `t${(+s).toFixed(2)}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log('quadros em', dir);
} else {
  const raw = path.join(OUTDIR, `${SCENE}_raw.mp4`), total = Math.round(DUR * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-vcodec', 'mjpeg', '-i', 'pipe:0',
    '-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', String(CQ), '-b:v', '0', '-pix_fmt', 'yuv420p', '-t', String(DUR), raw], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r) => ff.on('close', r));
  const start = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate((x) => window.seek(x), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await done;
  const secs = (Date.now() - start) / 1000;
  console.log(`vídeo -> ${raw} em ${secs.toFixed(0)} s`);
  fs.writeFileSync(path.join(OUTDIR, `${SCENE}_render_time.txt`), secs.toFixed(1));
  // mix: voz (com silêncio até a duração) + som da cena; -14 LUFS, pico <= -1,5 dBTP; vídeo em cópia
  const voz = path.join(VIETNA, 'render/voz', `${SCENE}.wav`), out = path.join(OUTDIR, `${SCENE}.mp4`), mixwav = path.join(OUTDIR, `${SCENE}_mix.wav`), vowav = path.join(OUTDIR, `${SCENE}_voice.wav`);
  const run = (a) => { const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' }); if (r.status) throw new Error('ffmpeg falhou'); };
  const SFXG = opt('sfxgain', '0.15');
  run(['-i', voz, '-af', `apad=whole_dur=${DUR},aformat=sample_rates=48000:channel_layouts=stereo`, '-t', String(DUR), vowav]);
  run(['-i', vowav, '-i', sfx, '-filter_complex', `[1:a]volume=${SFXG}[s];[0:a][s]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=7`, '-ar', '48000', '-t', String(DUR), mixwav]);
  run(['-i', raw, '-i', mixwav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  console.log('final ->', out);
}
await browser.close();
server.close();
