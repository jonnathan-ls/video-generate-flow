"""Utilitários compartilhados pelos validadores (somente stdlib)."""
from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

STATUS_ORDER = [
    "idea", "selected", "researched", "packaged", "structured", "scripted", "reviewed", "script_approved",
    "produced", "qa_passed", "uploaded_private", "publish_approved",
    "scheduled", "published", "analyzed",
]


def read_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    data = {}
    if m:
        for line in m.group(1).splitlines():
            line = line.split("#", 1)[0]
            if ":" in line:
                k, v = line.split(":", 1)
                data[k.strip()] = v.strip()
    return data


def kv_file(path: Path) -> dict:
    """Lê arquivos no formato CHAVE: valor (ex.: approval.md)."""
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Z_]+):\s*(.*)$", line.strip())
        if m:
            val = m.group(2).split("#", 1)[0].strip().strip('"').strip()
            data[m.group(1)] = val
    return data


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def banned_phrases(lang: str) -> list[str]:
    f = REPO / "pipeline" / "validate" / f"banned_phrases_{lang}.txt"
    if not f.exists():
        return []
    return [l.strip().lower() for l in f.read_text(encoding="utf-8").splitlines()
            if l.strip() and not l.startswith("#")]


def channel_lang(video_dir: Path) -> str:
    """Infere o idioma pelo nome da pasta do canal (pt-br-* / en-*)."""
    for part in video_dir.resolve().parts:
        if part.startswith("en-"):
            return "en"
    return "pt"


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def finish(self, name: str) -> int:
        for w in self.warnings:
            print(f"[WARN] {w}")
        for e in self.errors:
            print(f"[FAIL] {e}")
        print(f"{name}: {'FAIL' if self.errors else 'PASS'} "
              f"({len(self.errors)} erro(s), {len(self.warnings)} aviso(s))")
        return 1 if self.errors else 0
