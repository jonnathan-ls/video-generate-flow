// boot: three.js (local, 0.187.0) -> STAGE kit -> SOUND kit -> the style -> one stage.
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = +(q.get('h') || 1080), SAMPLES = +(q.get('samples') || 26);

window.THREE = THREE;
const load = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('failed to load ' + src)); document.head.appendChild(s); });

try {
  await load('./lib/stage.js');
  await load('./lib/text3d.js');
  await load('./lib/sound.js');
  await load('./style.js');
  await document.fonts.load('600 160px "Fredoka"');

  const canvas = document.getElementById('c');
  canvas.width = W; canvas.height = H;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

  const style = window.STYLES[0];
  const S = await K.run(canvas, style, { samples: SAMPLES, width: W, height: H });
  window.S = S;
  window.DURATION = style.duration;
  window.seek = (t) => S.seek(t);
  window.renderAt = (t) => S.seek(t);
  window.renderSound = async (sr = 48000) => {
    const out = await SOUND.renderOffline((k) => style.sound(k), style.duration, sr, { voiceover: false });
    // interleaved float stereo -> 16-bit WAV, base64
    const n = out.frames, buf = new ArrayBuffer(44 + n * 4), dv = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * 4, true);
    const I = out.inter;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < 2; c++) {
        const v = Math.max(-1, Math.min(1, I[2 * i + c]));
        dv.setInt16(44 + (2 * i + c) * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      }
    }
    const bytes = new Uint8Array(buf); let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { wav: btoa(s), peak: out.peak };
  };
  window.__ready = true;
} catch (e) {
  window.__error = String(e && e.stack || e);
  console.error(e);
}
