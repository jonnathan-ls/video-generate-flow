#!/usr/bin/env python3
"""Medição de OFERTA de um tema (gate de espaço, rubrics/idea-scoring.md). Um script, mesma conta para todo tema.

Uso: supply.py <slug> --regex "geada|1975" -q "geada negra 1975" -q "geada negra paraná café" ... [--min-queries 8]
Saída: data/supply/<slug>.json + resumo no terminal. Sem subagentes: só yt-dlp.

Rigor embutido (erro de 2026-11-19: triagem com 5 buscas deu mediana 47 mil; com mais buscas, 6,4 mil):
- exige >= 8 consultas e mede CONVERGÊNCIA (vídeos novos relevantes por consulta);
- relatório diz se a medida é "NÍVEL DECISÃO" (>= 8 consultas, >= 12 vídeos e convergência) ou "TRIAGEM" (não serve para decidir);
- mediana vem com a fração de vídeos abaixo de 5 mil e com a mediana sem os 2 maiores (a mediana de poucos vídeos é instável).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import statistics as st
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import ytapi  # noqa: E402

REPO = Path(__file__).resolve().parents[2]
TODAY = dt.date.today()


def run(cmd: list[str]) -> str:
    cmd = [cmd[0], "--sleep-requests", "1.5"] + cmd[1:]  # pausa entre requisições: evita bloqueio anti-bot
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.stdout


def search(q: str, n: int) -> list[dict]:
    out = []
    for mode in ("ytsearch", "ytsearchdate"):
        txt = run(["yt-dlp", "--flat-playlist", "--skip-download", "-j", f"{mode}{n}:{q}"])
        for l in txt.splitlines():
            try:
                out.append(json.loads(l))
            except Exception:
                pass
    return out


def meta(vid: str) -> dict | None:
    f = "%(id)s\t%(title)s\t%(channel)s\t%(channel_follower_count)s\t%(upload_date)s\t%(view_count)s\t%(duration)s"
    txt = run(["yt-dlp", "--skip-download", "--print", f, f"https://www.youtube.com/watch?v={vid}"]).strip()
    p = txt.split("\t")
    if len(p) < 7 or p[4] in ("NA", ""):
        return None
    try:
        d = dt.datetime.strptime(p[4], "%Y%m%d").date()
        return {"id": p[0], "title": p[1], "channel": p[2], "subs": None if p[3] == "NA" else int(p[3]),
                "date": d.isoformat(), "age": (TODAY - d).days, "views": int(p[5]) if p[5] != "NA" else 0,
                "min": round(float(p[6]) / 60, 1) if p[6] != "NA" else 0}
    except Exception:
        return None


ES_EN = re.compile(r"[ñ¿¡]|\b(el|los|las|del|una|con|por qué|qué|cómo|the|of|and|how|why|what|story|war|full|documentary)\b", re.I)
PT = re.compile(r"[ãõç]|\b(de|do|da|dos|das|em|que|como|uma|um|não|foi|por|os|as|para)\b", re.I)


def is_pt(m: dict) -> bool:
    """Português: idioma do áudio informado pelo canal, ou, sem ele, heurística de título (marcadores de PT e ausência de ES/EN)."""
    lang = (m.get("lang") or "").lower()
    if lang:
        return lang.startswith("pt")
    return bool(PT.search(m["title"])) and not ES_EN.search(m["title"])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--regex", required=True, help="título deve casar (descarta homônimos)")
    ap.add_argument("-q", action="append", required=True)
    ap.add_argument("--min-queries", type=int, default=8)
    ap.add_argument("--any-lang", action="store_true", help="contar vídeos em qualquer idioma (padrão: só português)")
    ap.add_argument("-n", type=int, default=30)
    a = ap.parse_args()
    rx = re.compile(a.regex, re.I)
    seen: dict[str, dict] = {}
    new_per_query = []
    for q in a.q:
        flat = search(q, a.n)
        fresh = 0
        for e in flat:
            vid = e.get("id")
            title = e.get("title") or ""
            dur = e.get("duration") or 0
            if not vid or vid in seen or not rx.search(title) or (dur and dur < 900):
                continue
            seen[vid] = {"id": vid, "title": title, "q": q}
            fresh += 1
        new_per_query.append((q, fresh))
        print(f"  consulta «{q}»: +{fresh} candidatos novos (total {len(seen)})", file=sys.stderr)
    apimeta = ytapi.videos(list(seen))
    subs = ytapi.channels(sorted({m["cid"] for m in apimeta.values()}))
    metas = [{"id": m["id"], "title": m["title"], "channel": m["channel"], "subs": subs.get(m["cid"], {}).get("subs"),
              "date": m["date"], "age": m["age"], "views": m["views"], "min": m["min"], "lang": m.get("lang", "")} for m in apimeta.values()]
    n_api = len(metas)
    if not a.any_lang:
        metas = [m for m in metas if is_pt(m)]
    falhou = len(seen) > 0 and n_api < 0.7 * len(seen)  # com a API, falha só se o id sumiu (vídeo removido)
    win = [m for m in metas if m["min"] >= 15 and 7 <= m["age"] <= 120 and rx.search(m["title"])]
    ch = {}
    for m in win:
        ch[m["channel"]] = max(ch.get(m["channel"], 0), m["views"])
    vs = sorted((m["views"] for m in win), reverse=True)
    med = st.median(vs[1:]) if len(vs) > 2 else None
    med2 = st.median(vs[2:]) if len(vs) > 4 else None
    below = sum(1 for v in vs[1:] if v < 5000) / max(1, len(vs) - 1)
    conv = len(new_per_query) >= 2 and sum(n for _, n in new_per_query[-2:]) <= max(1, int(0.1 * len(seen)))
    decision = len(a.q) >= a.min_queries and conv and not falhou  # oferta baixa também é resultado: o que vale é a convergência das buscas
    res = {"slug": a.slug, "date": TODAY.isoformat(), "queries": a.q, "new_per_query": new_per_query,
           "S_videos": len(win), "S_channels": len(ch), "leader_views": vs[0] if vs else 0,
           "median_without_leader": med, "median_without_top2": med2, "share_below_5k": round(below, 2),
           "convergence": conv, "meta_ok": f"{len(metas)}/{len(seen)}", "grade": "COLETA FALHOU (bloqueio do YouTube: repetir mais tarde, não é oferta zero)" if falhou else ("NÍVEL DECISÃO" if decision else "TRIAGEM (não serve para decidir)"),
           "videos": sorted(win, key=lambda m: -m["views"])}
    out = REPO / "data" / "supply"; out.mkdir(parents=True, exist_ok=True)
    (out / f"{a.slug}.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{a.slug}: {len(win)} vídeos longos de {len(ch)} canais na janela (7-120 d) | líder {res['leader_views']:,} | "
          f"mediana sem líder {med} | sem os 2 maiores {med2} | {int(below*100)}% abaixo de 5 mil | "
          f"convergência {'sim' if conv else 'não'} | {res['grade']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
