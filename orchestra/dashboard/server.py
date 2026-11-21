#!/usr/bin/env python3
"""Painel local da produção. Uso: python3 orchestra/dashboard/server.py  → http://localhost:8765
Lê só estado em disco e processos; nunca lê .env."""
import json, os, re, subprocess, time, glob
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path("/home/jonnathan/projects/ai-youtube-channel")
O = ROOT / "orchestra"
ANSI = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
WATCH = ("opencode run", "opencode --standalone run", "gemini -m", "claude -p", "dsh headless", "remotion render", "ffmpeg", "orchestra/run.sh", "orchestra/review.sh", "bakeoff/run.sh", "calib.sh")


def jload(p, default=None):
    try:
        return json.loads(Path(p).read_text())
    except Exception:
        return default


def tail(p, n=3):
    try:
        with open(p, "rb") as f:
            f.seek(0, 2); size = f.tell(); f.seek(max(0, size - 4000))
            lines = [ANSI.sub("", l).strip() for l in f.read().decode("utf-8", "replace").splitlines()]
        return [l for l in lines if l][-n:]
    except Exception:
        return []


def procs():
    out = subprocess.run(["ps", "-eo", "pid,etimes,pcpu,args"], capture_output=True, text=True).stdout.splitlines()[1:]
    res = []
    for l in out:
        parts = l.split(None, 3)
        if len(parts) < 4: continue
        pid, et, cpu, args = parts
        if "zsh -c" in args or "grep" in args or "server.py" in args or args.startswith("timeout "): continue
        kind = next((w for w in WATCH if w in args), None)
        if not kind: continue
        m = re.search(r"-m\s+(\S+)", args)
        task = re.search(r"tasks/([\w\-]+)\.md|run\.sh (?:opencode|gemini) ([\w\-]+)|review\.sh (S\d+)", args)
        res.append({"pid": int(pid), "secs": int(et), "cpu": float(cpu), "kind": kind.split()[0].split("/")[-1],
                    "model": m.group(1) if m else "", "task": next((g for g in (task.groups() if task else []) if g), ""),
                    "args": args[:140]})
    return res


def scenes(prod):
    vd = ROOT / prod["video_dir"]; rd = ROOT / prod["render_dir"]
    sc = (jload(vd / "scenes.json", {}) or {}).get("scenes", [])
    lote_of = {s: l["id"] for l in prod["lotes"] for s in l["scenes"]}
    out = []
    for s in sc:
        sid = s["id"]; mp4 = rd / f"{sid}.mp4"
        revs = sorted(glob.glob(str(O / "results" / f"review-{sid}-c[0-9]*.json")), key=os.path.getmtime)  # só ciclos reais; calibração e bake-off ficam de fora
        rv = jload(revs[-1], {}) if revs else {}
        state = "todo"
        if mp4.exists(): state = "rendered"
        if rv.get("veredito") == "REFAZER": state = "rejected"
        if rv.get("veredito") == "APROVADO": state = "review_ok"
        if sid in prod.get("approved_scenes", []): state = "approved"
        out.append({"id": sid, "dur": round(s.get("duration", 0), 1), "lote": lote_of.get(sid, ""), "state": state,
                    "render_at": time.strftime("%d/%m %H:%M", time.localtime(mp4.stat().st_mtime)) if mp4.exists() else "",
                    "review": {"veredito": rv.get("veredito"), "media": rv.get("media"), "defeitos": len(rv.get("defeitos", []))} if rv else None,
                    "text": (s.get("text") or "")[:160]})
    return out


def tasks(running):
    out = []
    for t in sorted(glob.glob(str(O / "tasks" / "*.md")), key=os.path.getmtime, reverse=True):
        tid = Path(t).stem
        first = Path(t).read_text().splitlines()[0].lstrip("# ").strip() if Path(t).stat().st_size else tid
        res = jload(O / "results" / f"{tid}.json")
        log = O / "logs" / f"{tid}.log"
        run = [p for p in running if p["task"] == tid]
        status = "running" if run else (res or {}).get("status", "pending") if res else ("failed" if log.exists() else "pending")
        out.append({"id": tid, "title": first, "status": status, "secs": run[0]["secs"] if run else None,
                    "model": run[0]["model"] if run else "", "summary": (res or {}).get("summary", ""),
                    "issues": (res or {}).get("issues", [])[:4],
                    "log": {"kb": round(log.stat().st_size / 1024, 1), "ago": int(time.time() - log.stat().st_mtime), "tail": tail(log)} if log.exists() else None})
    return out


def tests():
    calib = {}
    for f in sorted(glob.glob(str(O / "calib" / "*.json"))):
        name = Path(f).stem; rv, sc = name.rsplit(".", 1)
        d = jload(f)
        calib.setdefault(rv.replace("opencode_", ""), {})[sc] = {"veredito": d.get("veredito"), "media": d.get("media"), "defeitos": len(d.get("defeitos", []))} if isinstance(d, dict) else {"veredito": "inválido"}
    bake = []
    for f in sorted(glob.glob(str(O / "bakeoff" / "*.result.json"))):
        d = jload(f) or ({"status": "running"} if os.path.getsize(f) == 0 else {})
        rv = jload(str(f).replace(".result.json", ".review.json")) or {}
        bake.append({"model": Path(f).name.replace(".result.json", ""), "status": d.get("status", "sem resultado"), "secs": d.get("_secs"),
                     "validators": d.get("validators", {}), "review": {"veredito": rv.get("veredito"), "media": rv.get("media")} if rv else None})
    return {"calib": calib, "bakeoff": bake}


def machine():
    la = open("/proc/loadavg").read().split()[:3]
    try:
        g = subprocess.run(["nvidia-smi", "--query-gpu=utilization.gpu,memory.used", "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=3).stdout.strip().split(",")
        gpu = {"util": int(g[0]), "mem": int(g[1])}
    except Exception:
        gpu = None
    return {"load": la, "cpus": os.cpu_count(), "gpu": gpu}


def state():
    prod = jload(O / "production.json", {})
    running = procs()
    return {"t": time.strftime("%H:%M:%S"), "prod": prod, "scenes": scenes(prod), "tasks": tasks(running),
            "procs": running, "tests": tests(), "machine": machine()}


class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def send_video(self, f):
        size = f.stat().st_size; rng = self.headers.get("Range"); a, b = 0, size - 1
        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng)
            if m and m.group(1): a = int(m.group(1))
            if m and m.group(2): b = min(int(m.group(2)), size - 1)
            self.send_response(206); self.send_header("Content-Range", f"bytes {a}-{b}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", "video/mp4"); self.send_header("Accept-Ranges", "bytes"); self.send_header("Content-Length", str(b - a + 1)); self.end_headers()
        with open(f, "rb") as fh:
            fh.seek(a); left = b - a + 1
            while left > 0:
                chunk = fh.read(min(1 << 20, left))
                if not chunk: break
                try: self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError): return
                left -= len(chunk)

    def do_GET(self):
        mv = re.match(r"^/video/(S\d{2})(?:\?.*)?$", self.path)
        if mv:
            prod = jload(O / "production.json", {}); f = ROOT / prod.get("render_dir", "") / f"{mv.group(1)}.mp4"
            if f.exists(): return self.send_video(f)
            self.send_response(404); self.end_headers(); return
        if self.path.startswith("/api/state"):
            body = json.dumps(state(), ensure_ascii=False).encode(); ct = "application/json"
        else:
            body = (Path(__file__).parent / "index.html").read_bytes(); ct = "text/html; charset=utf-8"
        self.send_response(200); self.send_header("Content-Type", ct); self.send_header("Cache-Control", "no-store")
        self.end_headers(); self.wfile.write(body)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
