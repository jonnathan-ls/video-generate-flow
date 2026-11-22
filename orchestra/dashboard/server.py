#!/usr/bin/env python3
"""Painel visual da produção. Uso: python3 orchestra/dashboard/server.py  → http://localhost:8765
Só lê o estado em disco (production.json, scenes.json, renders, reviews). Nunca lê .env nem altera a produção.
Miniaturas ficam em orchestra/dashboard/thumbs/ (cache, fora do git)."""
import glob, json, os, re, subprocess, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path("/home/jonnathan/projects/ai-youtube-channel")
O = ROOT / "orchestra"
HERE = Path(__file__).parent
THUMBS = HERE / "thumbs"
THUMB_LOCK = threading.Lock()
# sufixo do arquivo → nome curto da versão (Sxx.mp4 = final)
SUFIXO = {"": "final", "_video": "sem mix", "_preview": "prévia"}


def jload(p, default=None):
    try:
        return json.loads(Path(p).read_text())
    except Exception:
        return default


def prod():
    return jload(O / "production.json", {}) or {}


def render_dirs(p):
    base = ROOT / p.get("render_dir", "media/pt-br-historia/vietna/render")
    dirs = [base] + sorted(d for d in base.parent.glob(base.name + "_*") if d.is_dir())
    return base, dirs


def versions(sid, p):
    """Todas as versões tocáveis da cena: render/Sxx.mp4 primeiro, depois as outras pastas render_*."""
    base, dirs = render_dirs(p)
    out = []
    for d in dirs:
        tag = d.name[len(base.name) + 1:] if d != base else ""
        for suf, nome in SUFIXO.items():
            f = d / f"{sid}{suf}.mp4"
            if not f.exists():
                continue
            label = (tag + (" " + nome if nome != "final" else "")) if tag else nome
            out.append({"v": label, "url": f"/video/{d.name}/{f.name}?m={int(f.stat().st_mtime)}",
                        "at": time.strftime("%d/%m %H:%M", time.localtime(f.stat().st_mtime))})
    return out


def latest_review(sid):
    revs = [r for r in glob.glob(str(O / "results" / f"review-{sid}-c*.json"))
            if re.search(rf"review-{sid}-c\d+-", r)]  # só ciclos reais (fora calibração e bake-off)
    if not revs:
        return None
    f = max(revs, key=os.path.getmtime)
    d = jload(f, {}) or {}
    defs = d.get("defeitos") or []
    altos = [x for x in defs if str(x.get("prioridade", "")).lower() == "alta"] or defs[:2]
    return {"arquivo": Path(f).name, "ciclo": d.get("ciclo"), "media": d.get("media"), "veredito": d.get("veredito"),
            "n_defeitos": len(defs),
            "defeitos": [{"tempo": str(x.get("tempo", ""))[:40], "prioridade": x.get("prioridade", ""),
                          "texto": str(x.get("defeito", ""))[:260]} for x in altos[:4]]}


def state():
    p = prod()
    vd = ROOT / p.get("video_dir", "")
    sc = (jload(vd / "scenes.json", {}) or {}).get("scenes", [])
    lote_of = {s: l["id"] for l in p.get("lotes", []) for s in l.get("scenes", [])}
    aprovadas = set(p.get("approved_scenes", []))
    scenes = []
    for s in sc:
        sid = s["id"]
        vs = versions(sid, p)
        rv = latest_review(sid)
        final = any(v["v"] == "final" for v in vs)
        if sid in aprovadas:
            st = "aprovada"
        elif not final:
            st = "falta"
        elif rv and rv["veredito"] == "REFAZER":
            st = "reprovada"
        else:
            st = "revisao"
        scenes.append({"id": sid, "dur": round(s.get("duration", 0) or 0, 1), "lote": lote_of.get(sid, ""),
                       "status": st, "versoes": vs, "review": rv, "texto": (s.get("text") or "")[:220]})
    nxt = p.get("next") or []
    return {"t": time.strftime("%H:%M:%S"), "video": p.get("video", ""), "video_status": p.get("video_status", ""),
            "agora": p.get("now", ""), "espera": p.get("waiting_user") or [],
            "proximo": nxt[0] if isinstance(nxt, list) and nxt else nxt,
            "lotes": [{"id": l["id"], "cenas": l.get("scenes", [])} for l in p.get("lotes", [])],
            "scenes": scenes}


def thumb(sid):
    """Quadro do meio de render/Sxx.mp4, refeito quando o render muda."""
    p = prod()
    src = ROOT / p.get("render_dir", "") / f"{sid}.mp4"
    if not src.exists():
        return None
    THUMBS.mkdir(exist_ok=True)
    out = THUMBS / f"{sid}.jpg"
    with THUMB_LOCK:
        if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
            try:
                dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                                           capture_output=True, text=True, timeout=10).stdout.strip() or 0)
            except Exception:
                dur = 0
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur / 2:.2f}", "-i", str(src), "-frames:v", "1",
                            "-vf", "scale=360:-2", "-q:v", "4", str(out)], capture_output=True, timeout=30)
    return out if out.exists() else None


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send_bytes(self, body, ct, cache="no-store"):
        self.send_response(200)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(body)

    def send_video(self, f):
        size = f.stat().st_size
        rng = self.headers.get("Range")
        a, b = 0, size - 1
        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng)
            if m and m.group(1): a = int(m.group(1))
            if m and m.group(2): b = min(int(m.group(2)), size - 1)
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {a}-{b}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(b - a + 1))
        self.end_headers()
        with open(f, "rb") as fh:
            fh.seek(a)
            left = b - a + 1
            while left > 0:
                chunk = fh.read(min(1 << 20, left))
                if not chunk: break
                try: self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError): return
                left -= len(chunk)

    def nf(self):
        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        mv = re.match(r"^/video/(render[\w\-]*)/(S\d{2}(?:_video|_preview)?\.mp4)$", path)
        if mv:
            _, dirs = render_dirs(prod())
            d = next((x for x in dirs if x.name == mv.group(1)), None)
            f = d / mv.group(2) if d else None
            return self.send_video(f) if f and f.exists() else self.nf()
        mt = re.match(r"^/thumb/(S\d{2})\.jpg$", path)
        if mt:
            f = thumb(mt.group(1))
            return self.send_bytes(f.read_bytes(), "image/jpeg", "max-age=30") if f else self.nf()
        if path == "/api/state":
            return self.send_bytes(json.dumps(state(), ensure_ascii=False).encode(), "application/json")
        if path in ("/", "/index.html"):
            return self.send_bytes((HERE / "index.html").read_bytes(), "text/html; charset=utf-8")
        if path == "/favicon.ico":
            return self.send_bytes(b"", "image/x-icon", "max-age=86400")
        self.nf()


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
