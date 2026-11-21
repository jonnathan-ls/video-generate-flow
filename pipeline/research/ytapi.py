"""Cliente mínimo da YouTube Data API v3 (cota gratuita de 10.000 unidades/dia). Chave em .env (YOUTUBE_API_KEY), nunca no git.
Custos: videos.list 1 (até 50 ids), channels.list 1 (até 50), playlistItems.list 1 (até 50), search.list 100 (evitar: usar yt-dlp --flat-playlist).
Cache em data/cache/yt/ (12 h) para não repetir pedidos."""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CACHE = REPO / "data" / "cache" / "yt"
TTL = 12 * 3600
UNITS = {"used": 0}


def key() -> str:
    k = os.environ.get("YOUTUBE_API_KEY")
    if not k and (REPO / ".env").exists():
        m = re.search(r"^YOUTUBE_API_KEY=(.+)$", (REPO / ".env").read_text(), re.M)
        k = m.group(1).strip() if m else None
    if not k:
        raise SystemExit("YOUTUBE_API_KEY ausente (.env)")
    return k


def call(path: str, params: dict, cost: int = 1) -> dict:
    CACHE.mkdir(parents=True, exist_ok=True)
    ck = CACHE / (re.sub(r"[^A-Za-z0-9]+", "_", path + json.dumps(params, sort_keys=True))[:180] + ".json")
    if ck.exists() and time.time() - ck.stat().st_mtime < TTL:
        return json.loads(ck.read_text())
    url = f"https://www.googleapis.com/youtube/v3/{path}?" + urllib.parse.urlencode({**params, "key": key()})
    for tentativa in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                d = json.load(r)
            UNITS["used"] += cost
            ck.write_text(json.dumps(d))
            return d
        except Exception as e:
            time.sleep(2 * (tentativa + 1))
            err = e
    raise RuntimeError(f"YouTube API falhou: {err}")


def _dur(iso: str) -> float:
    m = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    h, mi, s = (int(x or 0) for x in m.groups())
    return round(h * 60 + mi + s / 60, 1)


def videos(ids: list[str]) -> dict[str, dict]:
    out = {}
    today = dt.date.today()
    for i in range(0, len(ids), 50):
        d = call("videos", {"part": "snippet,statistics,contentDetails", "id": ",".join(ids[i:i + 50])})
        for v in d.get("items", []):
            pub = dt.date.fromisoformat(v["snippet"]["publishedAt"][:10])
            out[v["id"]] = {"id": v["id"], "title": v["snippet"]["title"], "channel": v["snippet"]["channelTitle"],
                            "cid": v["snippet"]["channelId"], "date": pub.isoformat(), "age": (today - pub).days,
                            "views": int(v["statistics"].get("viewCount", 0)), "min": _dur(v["contentDetails"]["duration"]),
                            "lang": (v["snippet"].get("defaultAudioLanguage") or v["snippet"].get("defaultLanguage") or "")}
    return out


def channels(cids: list[str]) -> dict[str, dict]:
    out = {}
    for i in range(0, len(cids), 50):
        d = call("channels", {"part": "snippet,statistics", "id": ",".join(cids[i:i + 50])})
        for c in d.get("items", []):
            st = c["statistics"]
            out[c["id"]] = {"title": c["snippet"]["title"], "subs": None if st.get("hiddenSubscriberCount") else int(st.get("subscriberCount", 0)),
                            "videos": int(st.get("videoCount", 0))}
    return out


def recent_uploads(cid: str, n: int = 50) -> list[dict]:
    """Últimos n uploads do canal com views, data e duração (2 unidades)."""
    d = call("playlistItems", {"part": "contentDetails", "playlistId": "UU" + cid[2:], "maxResults": min(n, 50)})
    ids = [i["contentDetails"]["videoId"] for i in d.get("items", [])]
    return list(videos(ids).values())
