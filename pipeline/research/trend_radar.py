#!/usr/bin/env python3
"""Radar de TENDÊNCIAS por canal (não por tema). Acha "ondas": canais com poucos vídeos longos e views altas em semanas.

Uso: trend_radar.py [--days 45] [--min-views 100000] [-q "consulta" ...]
Saída: data/trends/AAAA-MM-DD.json e tabela no terminal. Só yt-dlp (sem subagentes). É TRIAGEM: cada onda precisa ser confirmada
(supply.py para a oferta do tema; leitura do canal) antes de virar ideia.

Como funciona: busca no YouTube "este mês, ordenada por views" para consultas amplas; fica com vídeos longos (> 15 min) de alto desempenho;
agrupa por canal; mede o canal (inscritos, nº de vídeos longos) e a idade do vídeo; marca ONDA quando o canal é pequeno/novo e o vídeo é grande e recente.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).parent))
import ytapi  # noqa: E402

REPO = Path(__file__).resolve().parents[2]
TODAY = dt.date.today()
SP_MONTH_VIEWS = "CAMSBAgEEAE%253D"  # ordenar por views, este mês, vídeos
DEFAULT_Q = ["história completa documentário", "a história de", "como nasceu", "biografia completa", "o que aconteceu com",
             "história do brasil documentário", "tragédia documentário completo", "guerra história completa", "império ascensão e queda",
             "documentário animado história", "história em animação", "história do mundo documentário"]


def run(cmd):
    cmd = [cmd[0], "--sleep-requests", "1.5"] + cmd[1:]  # pausa entre requisições: evita bloqueio anti-bot
    return subprocess.run(cmd, capture_output=True, text=True).stdout


def search(q: str) -> list[dict]:
    url = f"https://www.youtube.com/results?search_query={quote(q)}&sp={SP_MONTH_VIEWS}"
    out = []
    for l in run(["yt-dlp", "--flat-playlist", "--skip-download", "-j", "--playlist-end", "60", url]).splitlines():
        try:
            out.append(json.loads(l))
        except Exception:
            pass
    time.sleep(1.5)
    return out


def vmeta(vid: str):
    f = "%(upload_date)s\t%(view_count)s\t%(duration)s\t%(channel_follower_count)s\t%(title)s"
    p = run(["yt-dlp", "--skip-download", "--print", f, f"https://www.youtube.com/watch?v={vid}"]).strip().split("\t")
    if len(p) < 5 or p[0] in ("NA", ""):
        return None
    try:
        d = dt.datetime.strptime(p[0], "%Y%m%d").date()
        return {"date": d.isoformat(), "age": (TODAY - d).days, "views": int(p[1]), "min": round(float(p[2]) / 60, 1),
                "subs": None if p[3] == "NA" else int(p[3]), "title": p[4]}
    except Exception:
        return None


def channel_info(cid: str):
    txt = run(["yt-dlp", "--flat-playlist", "--skip-download", "-J", "--playlist-end", "40",
               "--extractor-args", "youtube:lang=en", f"https://www.youtube.com/channel/{cid}/videos"])
    try:
        d = json.loads(txt)
    except Exception:
        return None
    ents = d.get("entries") or []
    longs = [e for e in ents if (e.get("duration") or 0) >= 900]
    vs = sorted((e.get("view_count") or 0 for e in longs))
    return {"subs": d.get("channel_follower_count"), "n_listed": len(ents), "n_long": len(longs),
            "median_long": vs[len(vs) // 2] if vs else None, "max_long": vs[-1] if vs else None}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=45)
    ap.add_argument("--min-views", type=int, default=100000)
    ap.add_argument("-q", action="append")
    a = ap.parse_args()
    qs = a.q or DEFAULT_Q
    cand: dict[str, dict] = {}
    for q in qs:
        for e in search(q):
            if (e.get("duration") or 0) < 900 or (e.get("view_count") or 0) < a.min_views:
                continue
            cid = e.get("channel_id")
            if not cid:
                continue
            c = cand.setdefault(cid, {"channel": e.get("channel"), "cid": cid, "videos": {}})
            c["videos"][e["id"]] = {"views": e.get("view_count"), "title": e.get("title"), "q": q}
        print(f"  «{q}»: {len(cand)} canais candidatos", file=sys.stderr)
    subs = ytapi.channels(list(cand))  # 1 unidade por 50 canais
    waves = []
    for cid, c in cand.items():
        s = subs.get(cid, {})
        if s.get("subs") is None or s["subs"] >= 100000:
            continue
        ups = ytapi.recent_uploads(cid, 50)  # 2 unidades por canal
        longs = sorted((u for u in ups if u["min"] >= 15), key=lambda u: u["date"], reverse=True)
        if not longs or len(longs) > 20 or s["videos"] > 150:
            continue
        med = sorted(u["views"] for u in longs[:15])[min(len(longs[:15]), 15) // 2]
        top = max(longs, key=lambda u: u["views"])
        if top["views"] < a.min_views or not (3 <= top["age"] <= a.days):
            continue
        waves.append({"channel": c["channel"], "cid": cid, "subs": s["subs"], "n_long": len(longs), "video": f"https://youtu.be/{top['id']}",
                      "date": top["date"], "age": top["age"], "views": top["views"], "min": top["min"], "title": top["title"],
                      "views_per_day": round(top["views"] / max(1, top["age"])), "channel_median_long": med,
                      "multiple": round(top["views"] / med, 1) if med else None, "other_videos": len(c["videos"]) - 1})
    waves.sort(key=lambda w: -w["views_per_day"])
    out = REPO / "data" / "trends"; out.mkdir(parents=True, exist_ok=True)
    (out / f"{TODAY.isoformat()}.json").write_text(json.dumps({"queries": qs, "candidates": len(cand), "waves": waves}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[cota da API usada: {ytapi.UNITS['used']} unidades] {len(cand)} canais com vídeo longo ≥ {a.min_views:,} views no mês; {len(waves)} ondas (canal < 100 mil inscritos, ≤ 20 vídeos longos, vídeo de 3 a {a.days} dias):")
    for w in waves:
        print(f"  {w['views_per_day']:>6,}/dia | {w['views']:>9,} v em {w['age']:>2} d | {w['channel']} ({w['subs']} insc., {w['n_long']} longos, mult {w['multiple']}) | {w['title'][:60]} | {w['video']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
