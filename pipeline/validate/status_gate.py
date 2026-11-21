#!/usr/bin/env python3
"""Gate da máquina de estados do vídeo (protocols/status-machine.md).

Uso:
  status_gate.py <pasta-do-video> --to <status> [--check-only] [--note "motivo"]

Verifica se os artefatos exigidos para ENTRAR em <status> existem e são válidos.
Se passar e não for --check-only, atualiza o status em brief.md e registra no histórico.
Esta é a ÚNICA forma permitida de mudar o status (o hook bloqueia edições diretas).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import REPO, STATUS_ORDER, Report, kv_file, load_json, read_frontmatter  # noqa: E402

STATE_DIR = REPO / ".claude" / "state"


def table_rows(path: Path) -> int:
    """Conta linhas de dados em tabelas markdown (exclui cabeçalho e separador)."""
    if not path.exists():
        return 0
    rows = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s.startswith("|") and not re.match(r"^\|[\s\-:|]+\|$", s):
            cells = [c.strip() for c in s.strip("|").split("|")]
            if any(cells) and not any(c.lower() in ("#", "afirmação no roteiro", "asset") for c in cells[:2]):
                rows += 1
    return rows


def missing_sections(path: Path, sections: list[str]) -> list[str]:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    return [s for s in sections if s not in text]


def check(video: Path, target: str, r: Report) -> None:
    brief = video / "brief.md"
    approval = kv_file(video / "approval.md")
    meta = load_json(video / "metadata.json") or {}
    fm = read_frontmatter(brief) if brief.exists() else {}
    vid = fm.get("id") or video.name

    if target == "selected":
        text = brief.read_text(encoding="utf-8") if brief.exists() else ""
        for field in ("Promessa", "Outlier(s) de referência", "Ângulo original"):
            m = re.search(rf"\*\*{re.escape(field)}[^*\n]*:\*\*[ \t]*(.*)$", text, re.M)
            if not m or not m.group(1).strip():
                r.err(f"brief.md: campo '{field}' vazio")
            elif field.startswith("Outlier") and "http" not in m.group(1):
                r.err("brief.md: outlier de referência precisa de URL (R1)")
    elif target == "researched":
        rs = video / "research.md"
        if not rs.exists():
            r.err("research.md não existe (protocols/video-research.md)")
        else:
            miss = missing_sections(rs, ["## Panorama", "## Referências estruturais", "## Modelo identificado", "## Lacunas e ângulo", "## Dossiê de fontes", "## Hipóteses de embalagem", "## Riscos"])
            if miss:
                r.err("research.md sem as seções: " + ", ".join(miss))
            urls = len(re.findall(r"https?://", rs.read_text(encoding="utf-8")))
            if urls < 8:
                r.err(f"research.md com {urls} URLs (mínimo 8: panorama + fontes)")
    elif target == "structured":
        st = video / "structure.md"
        if not st.exists():
            r.err("structure.md não existe (protocols/video-structure.md)")
        else:
            miss = missing_sections(st, ["## Promessa e contrato", "## Modelo identificado e desvios", "## Beat sheet", "## Abertura", "## Plano de retenção", "## Mapa de cenas e estilo", "## Hipóteses e métricas-alvo", "## Shorts derivados"])
            if miss:
                r.err("structure.md sem as seções: " + ", ".join(miss))
            txt = st.read_text(encoding="utf-8")
            beat = txt.split("## Beat sheet", 1)[-1].split("\n## ", 1)[0]
            rows = [l for l in beat.splitlines() if l.strip().startswith("|") and not re.match(r"^\|[\s\-:|]+\|$", l.strip())]
            if len(rows) - 1 < 5:
                r.err(f"Beat sheet com {max(0, len(rows) - 1)} atos (mínimo 5)")
            hip = txt.split("## Hipóteses e métricas-alvo", 1)[-1].split("\n## ", 1)[0]
            if len(re.findall(r"\d+(?:[.,]\d+)?\s*%", hip)) < 2:
                r.err("Hipóteses sem previsões numéricas (mínimo 2 percentuais: ex. CTR 6%, retenção aos 30 s 70%)")
    elif target == "packaged":
        p = video / "packaging.md"
        m = re.search(r"ESCOLHA_USUARIO:\s*(.+)", p.read_text(encoding="utf-8")) if p.exists() else None
        if not m or not m.group(1).strip().strip('"'):
            r.err("packaging.md: ESCOLHA_USUARIO não preenchida (escolha do usuário obrigatória)")
    elif target == "scripted":
        s = video / "script.md"
        if not s.exists() or "[CENA" not in s.read_text(encoding="utf-8"):
            r.err("script.md ausente ou sem marcações [CENA ...]")
        if table_rows(video / "sources.md") < 1:
            r.err("sources.md sem nenhuma fonte registrada (R1)")
    elif target == "reviewed":
        rv = video / "review.md"
        if not rv.exists() or not re.search(r"VEREDITO:\s*APROVADO", rv.read_text(encoding="utf-8")):
            r.err("review.md ausente ou sem 'VEREDITO: APROVADO'")
    elif target == "script_approved":
        if approval.get("APROVADO_ROTEIRO", "").lower() != "sim" or not approval.get("CITACAO_ROTEIRO"):
            r.err("approval.md: APROVADO_ROTEIRO != sim ou CITACAO_ROTEIRO vazia")
    elif target == "produced":
        scenes = load_json(video / "scenes.json")
        if not scenes or not isinstance(scenes.get("scenes"), list) or not scenes["scenes"]:
            r.err("scenes.json ausente/inválido (precisa de lista 'scenes' não vazia)")
        final = REPO / "media" / vid / "render" / "final.mp4"
        if not final.exists():
            r.err(f"render final não encontrado: {final.relative_to(REPO)}")
    elif target == "qa_passed":
        qa = video / "qa.md"
        t = qa.read_text(encoding="utf-8") if qa.exists() else ""
        if not t or "FAIL" in t or "PASS" not in t:
            r.err("qa.md ausente, sem PASS ou contendo FAIL")
    elif target == "uploaded_private":
        if not meta.get("video_id"):
            r.err("metadata.json sem video_id")
        if meta.get("privacy") not in (None, "private"):
            r.err("upload deve estar como 'private' antes da aprovação de publicação (R12)")
    elif target == "publish_approved":
        if approval.get("APROVADO_PUBLICACAO", "").lower() != "sim" or not approval.get("CITACAO_PUBLICACAO"):
            r.err("approval.md: APROVADO_PUBLICACAO != sim ou CITACAO_PUBLICACAO vazia")
    elif target == "scheduled":
        if not meta.get("publish_at"):
            r.err("metadata.json sem publish_at")
    elif target == "published":
        if not meta.get("published_at"):
            r.err("metadata.json sem published_at")
    elif target == "analyzed":
        pm = video / "postmortem.md"
        if not pm.exists() or "## Lições" not in pm.read_text(encoding="utf-8"):
            r.err("postmortem.md ausente ou sem seção '## Lições'")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video_dir")
    ap.add_argument("--to", required=True, choices=STATUS_ORDER)
    ap.add_argument("--check-only", action="store_true")
    ap.add_argument("--note", default="")
    a = ap.parse_args()

    video = Path(a.video_dir).resolve()
    brief = video / "brief.md"
    r = Report()
    if not brief.exists():
        r.err(f"brief.md não encontrado em {video}")
        return r.finish("status_gate")

    current = read_frontmatter(brief).get("status", "idea")
    if current not in STATUS_ORDER:
        r.err(f"status atual inválido: {current}")
        return r.finish("status_gate")

    ci, ti = STATUS_ORDER.index(current), STATUS_ORDER.index(a.to)
    allowed_next = {ci + 1}
    if current == "publish_approved":  # pode ir para scheduled ou direto para published
        allowed_next.add(STATUS_ORDER.index("published"))
    if current == "scheduled":
        allowed_next = {STATUS_ORDER.index("published")}
    if a.check_only:
        # Para --check-only, valida os pré-requisitos da etapa ANTERIOR ao alvo.
        prev = STATUS_ORDER[ti - 1] if ti > 0 else None
        if prev and STATUS_ORDER.index(current) < ti - 1:
            r.err(f"status atual '{current}' ainda não chegou em '{prev}' (exigido antes de '{a.to}')")
        return r.finish("status_gate --check-only")
    if ti not in allowed_next:
        r.err(f"transição proibida: {current} → {a.to} (não pule etapas; ver protocols/status-machine.md)")
        return r.finish("status_gate")

    check(video, a.to, r)
    code = r.finish(f"status_gate {current} → {a.to}")
    if code:
        return code

    text = brief.read_text(encoding="utf-8")
    text = re.sub(r"^status:\s*\S+", f"status: {a.to}", text, count=1, flags=re.M)
    stamp = dt.date.today().isoformat()
    text = text.rstrip() + f"\n- {stamp}: {current} → {a.to}" + (f" — {a.note}" if a.note else "") + "\n"
    brief.write_text(text, encoding="utf-8")

    if a.to == "publish_approved":
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        (STATE_DIR / "publish_token.json").write_text(json.dumps(
            {"video_dir": str(video), "created": time.time()}), encoding="utf-8")
        print("Janela de publicação aberta por 2h (.claude/state/publish_token.json).")
    if a.to in ("scheduled", "published"):
        (STATE_DIR / "publish_token.json").unlink(missing_ok=True)
    print(f"Status atualizado: {current} → {a.to}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
