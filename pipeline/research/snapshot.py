#!/usr/bin/env python3
"""Medidor de recência e crescimento de vídeos de referência (rubrics/idea-scoring.md, "Recência").

Um vídeo antigo acumula views com o tempo; só a idade e o ritmo mostram se o sinal ainda vale. Este script guarda
"fotos" (snapshots) das métricas em cada coleta; a partir da 2ª foto, mede o crescimento real em views/dia.

  snapshot.py snap <id|url> ... [--tag I01]   coleta e acrescenta em data/snapshots/videos.jsonl
  snapshot.py report [--tag I01]              tabela: idade, classe de recência, views/dia (vida e entre fotos)

Classes de recência: JANELA (7–120 dias) · ESTENDIDA (121–365; só conta com crescimento medido) · ANTIGO (>365; nunca conta como demanda).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DB = REPO / "data" / "snapshots" / "videos.jsonl"
FIELDS = "id,title,channel,channel_follower_count,upload_date,view_count,duration,like_count"


def fetch(ref: str) -> dict | None:
    url = ref if ref.startswith("http") else f"https://youtu.be/{ref}"
    p = subprocess.run(["yt-dlp", "--skip-download", "--print", f"%(.{{{FIELDS}}})j", url], capture_output=True, text=True)
    if p.returncode != 0 or not p.stdout.strip():
        print(f"[FALHOU] {ref}: {p.stderr.strip()[:120]}", file=sys.stderr)
        return None
    return json.loads(p.stdout.strip().splitlines()[-1])


def load() -> list[dict]:
    if not DB.exists():
        return []
    return [json.loads(l) for l in DB.read_text(encoding="utf-8").splitlines() if l.strip()]


def klass(age: int) -> str:
    return "JANELA" if 7 <= age <= 120 else ("NOVO(<7d)" if age < 7 else ("ESTENDIDA" if age <= 365 else "ANTIGO"))


def cmd_snap(refs: list[str], tag: str) -> int:
    DB.parent.mkdir(parents=True, exist_ok=True)
    now = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    ok = 0
    with DB.open("a", encoding="utf-8") as f:
        for ref in refs:
            d = fetch(ref)
            if d:
                d.update(ts=now, tag=tag)
                f.write(json.dumps(d, ensure_ascii=False) + "\n")
                ok += 1
                print(f"ok  {d['id']}  {d.get('view_count')} views  {d.get('channel')}")
    print(f"{ok}/{len(refs)} snapshots gravados em {DB.relative_to(REPO)}")
    return 0 if ok == len(refs) else 1


def cmd_report(tag: str | None) -> int:
    by: dict[str, list[dict]] = {}
    for d in load():
        if tag and d.get("tag") != tag:
            continue
        by.setdefault(d["id"], []).append(d)
    today = dt.date.today()
    print(f"{'id':12} {'idade':>6} {'classe':10} {'views':>9} {'v/dia vida':>10} {'v/dia entre fotos':>18}  canal · título")
    for vid, snaps in sorted(by.items(), key=lambda kv: kv[1][-1].get("tag", "")):
        s = snaps[-1]
        up = dt.datetime.strptime(s["upload_date"], "%Y%m%d").date()
        age = (today - up).days
        views = s.get("view_count") or 0
        life = views / max(age, 1)
        growth = "—"
        if len(snaps) >= 2:
            t0, t1 = dt.datetime.fromisoformat(snaps[0]["ts"]), dt.datetime.fromisoformat(snaps[-1]["ts"])
            days = (t1 - t0).total_seconds() / 86400
            if days >= 0.5:
                growth = f"{((snaps[-1]['view_count'] or 0) - (snaps[0]['view_count'] or 0)) / days:,.0f}"
        print(f"{vid:12} {age:>5}d {klass(age):10} {views:>9,} {life:>10,.0f} {growth:>18}  {s.get('channel')} ({s.get('channel_follower_count')}) · {str(s.get('title'))[:46]}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a1 = sub.add_parser("snap")
    a1.add_argument("refs", nargs="+")
    a1.add_argument("--tag", default="")
    a2 = sub.add_parser("report")
    a2.add_argument("--tag")
    # IDs de vídeo do YouTube podem começar com '-': dizer ao argparse que não são opções
    argv = sys.argv[1:]
    if argv and argv[0] == 'snap':
        argv = ['snap'] + [x for x in argv[1:] if not (x.startswith('-') and len(x) == 11 and not x.startswith('--'))] + (['--'] + [x for x in argv[1:] if x.startswith('-') and len(x) == 11 and not x.startswith('--')] if any(x.startswith('-') and len(x) == 11 and not x.startswith('--') for x in argv[1:]) else [])
    a = ap.parse_args(argv)
    return cmd_snap(a.refs, a.tag) if a.cmd == "snap" else cmd_report(a.tag)


if __name__ == "__main__":
    sys.exit(main())
