// render.mjs — headless Chrome frame-by-frame render of the promptstyle diorama.
// usage:
//   node render.mjs --w 1920 --h 1080 --out ../out/promptstyle_16x9.mp4 [--samples 26]
//   node render.mjs --w 1920 --h 1080 --stills 0.5,3,7.9,14
//   node render.mjs --sfx ../out/sfx.wav
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const requireKit = createRequire('/home/jonnathan/projects/ai-youtube-channel/lab/bakeoff-saigon/kits/kit-video-3d/package.json');
const puppeteer = requireKit('puppeteer-core');
const CHROME = process.env.CHROME_PATH || '/home/jonnathan/projects/ai-youtube-channel/studio/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const W = +opt('w', 1920), H = +opt('h', 1080), SAMPLES = +opt('samples', 26), FPS = +opt('fps', 30);
const OUT = opt('out', null), STILLS = opt('stills', null), SFX = opt('sfx', null);
const FROM = +opt('from', 0), TO = +opt('to', 15), CRF = +opt('crf', 17);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(HERE, url === '/' ? 'index.html' : url);
  if (!f.startsWith(HERE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
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
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('response', (r) => { if (r.status() >= 400) console.log('[http]', r.status(), r.url()); });
await page.goto(`http://127.0.0.1:${port}/index.html?w=${W}&h=${H}&samples=${SAMPLES}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__error', { timeout: 180000 });
const err = await page.evaluate('window.__error');
if (err) { console.error(err); await browser.close(); server.close(); process.exit(1); }
console.log(`ready: ${W}x${H}, samples ${SAMPLES}, duration ${await page.evaluate('window.DURATION')}`);

if (SFX) {
  const t0 = Date.now();
  const res = await page.evaluate(async () => await window.renderSound(48000));
  fs.writeFileSync(SFX, Buffer.from(res.wav, 'base64'));
  console.log(`sfx -> ${SFX} (peak ${res.peak.toFixed(3)}, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

if (STILLS) {
  const dir = path.join(HERE, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of STILLS.split(',')) {
    const t = +s;
    const t0 = Date.now();
    await page.evaluate((x) => window.seek(x), t);
    const file = path.join(dir, `${W}x${H}_t${t.toFixed(2)}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log(`still ${file} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
}

if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const total = Math.round((TO - FROM) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-vcodec', 'mjpeg', '-i', 'pipe:0',
    '-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', String(CRF), '-b:v', '0', '-pix_fmt', 'yuv420p', '-t', String(TO - FROM), '-movflags', '+faststart', OUT],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r) => ff.on('close', r));
  const start = Date.now();
  for (let i = 0; i < total; i++) {
    const t = FROM + i / FPS;
    await page.evaluate((x) => window.seek(x), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 15 === 0 || i === total - 1) {
      const sec = (Date.now() - start) / 1000, left = i > 0 ? (sec / i) * (total - i) : 0;
      process.stdout.write(`\rframe ${i + 1}/${total} ${Math.round((i + 1) / total * 100)}%  elapsed ${Math.round(sec)}s  left ~${Math.round(left)}s   `);
    }
  }
  ff.stdin.end();
  await done;
  process.stdout.write('\n');
  console.log(`video -> ${OUT} in ${((Date.now() - start) / 1000 / 60).toFixed(1)} min`);
}

await browser.close();
server.close();
