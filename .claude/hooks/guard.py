#!/usr/bin/env python3
"""PreToolUse guard — aplica as regras R5 e R12 do CLAUDE.md de forma determinística.

Bloqueia (exit 2 + motivo em stderr):
  1. Edição direta do campo `status:` em brief.md (só o status_gate.py pode mudar o status).
  2. approval.md com aprovação "sim" sem citação literal do usuário.
  3. Comandos de upload/publicação com visibilidade pública/agendada sem janela de publicação
     válida (criada pelo status_gate ao entrar em publish_approved; validade de 2h).
  4. Ações no navegador cujo resumo indica publicar/tornar público/agendar, sem a mesma janela.
  5. Uso de modelos com licença não comercial (R13) em comandos.
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
TOKEN = REPO / ".claude" / "state" / "publish_token.json"
TOKEN_TTL = 2 * 3600
NONCOMMERCIAL = re.compile(r"(?<![a-z0-9])(xtts|coqui[-_ ]?tts|f5[-_ ]?tts|musicgen|audiocraft)(?![a-z])", re.I)
PUBLISH_WORDS = re.compile(
    r"(publish|publicar|publique|publica\b|tornar p[uú]blico|make .{0,20}public|set .*public|tornar .{0,20}p[uú]blic[oa]|"
    r"visibilidade.*p[uú]blic|visibility.*public|schedule|agendar|agendamento|premiere|estreia)", re.I)


# Salvar o PERFIL do canal (nome, foto, banner, descrição) não é publicar vídeo. Exceção estreita,
# autorizada pelo usuário em 2026-11-19: o resumo da ação precisa dizer "perfil do canal" e não pode
# citar vídeo/upload/agendamento/visibilidade.
PROFILE_SAVE = re.compile(r"(perfil do canal|channel profile)", re.I)
NOT_PROFILE = re.compile(r"(v[ií]deo|video|upload|agend|schedule|visibilidade|visibility|p[uú]blic[oa]\b|premiere|estreia|short)", re.I)


def block(msg: str) -> None:
    print(f"BLOQUEADO pelo guard (CLAUDE.md): {msg}", file=sys.stderr)
    sys.exit(2)


def publish_window_ok() -> bool:
    try:
        data = json.loads(TOKEN.read_text(encoding="utf-8"))
        return time.time() - float(data["created"]) < TOKEN_TTL
    except Exception:
        return False


def check_edit(tool: str, inp: dict) -> None:
    path = str(inp.get("file_path", ""))
    if tool == "Write":
        new = inp.get("content", "")
    elif tool == "MultiEdit":
        new = "\n".join(e.get("new_string", "") for e in inp.get("edits", []))
    else:
        new = inp.get("new_string", "")

    if path.endswith("brief.md"):
        for m in re.finditer(r"^status:\s*(\S+)", new, re.M):
            if m.group(1) != "idea":
                block("status em brief.md só muda via `python3 pipeline/validate/status_gate.py "
                      "<pasta> --to <status>` (R5).")
    if path.endswith("approval.md"):
        for key in ("ROTEIRO", "PUBLICACAO"):
            if re.search(rf"APROVADO_{key}:\s*sim", new, re.I):
                m = re.search(rf'CITACAO_{key}:\s*"?([^"\n]*)"?', new)
                if not m or len(m.group(1).strip()) < 2:
                    block(f"APROVADO_{key}: sim exige CITACAO_{key} com a mensagem literal do usuário (R12).")


def check_bash(cmd: str) -> None:
    is_search = re.match(r"\s*(cd\s+[^;&|]+&&\s*)?(grep|rg|egrep|find|ls|cat|head|wc)\b", cmd) and not re.search(r"(pip|npm|uv|git clone|python3? -m|\|\s*(sh|bash))", cmd)
    if NONCOMMERCIAL.search(cmd) and not is_search:
        block("ferramenta/modelo com licença não comercial (R13). Use Kokoro/Chatterbox etc.")
    if re.search(r"brief\.md", cmd) and re.search(r"status:", cmd) and "status_gate.py" not in cmd:
        block("não altere status de brief.md pelo shell; use status_gate.py (R5).")
    if re.search(r"hyperframes\s+(publish|share)\b|remotion\s+lambda\b|@remotion/lambda", cmd):
        block("envio de vídeo/projeto para serviço externo (hyperframes publish/share, Remotion Lambda) "
              "exige pedido explícito do usuário no chat.")
    is_upload = re.search(r"pipeline/upload|youtube.*(upload|videos\.update)|videos\.insert", cmd, re.I)
    wants_public = re.search(r"(--privacy|--visibility|privacyStatus)[ =:\"']*(public|unlisted)|--publish-at|publishAt", cmd, re.I)
    if is_upload and wants_public and not publish_window_ok():
        block("publicação/agendamento sem janela válida. Exige approval.md com APROVADO_PUBLICACAO: sim "
              "e `status_gate.py --to publish_approved` nas últimas 2h (R12).")


def check_browser(inp: dict) -> None:
    actions = inp.get("actions") if isinstance(inp.get("actions"), list) else [{"input": inp}]
    for a in actions:
        i = a.get("input", {}) if isinstance(a, dict) else {}
        summary = str(i.get("action_summary", ""))
        value = str(i.get("value", "")).lower()
        if PUBLISH_WORDS.search(summary) or value in ("public", "público", "publico"):
            if PROFILE_SAVE.search(summary) and not NOT_PROFILE.search(summary):
                continue
            if not publish_window_ok():
                block("ação de publicar/agendar no navegador sem janela de publicação válida (R12). "
                      "Peça aprovação ao usuário e rode status_gate --to publish_approved.")


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    tool = payload.get("tool_name", "")
    inp = payload.get("tool_input", {}) or {}
    if tool in ("Edit", "Write", "MultiEdit"):
        check_edit(tool, inp)
    elif tool == "Bash":
        check_bash(inp.get("command", ""))
    elif tool.startswith(("mcp__claude-in-chrome__", "mcp__Claude_Browser__")):
        check_browser(inp)
    sys.exit(0)


if __name__ == "__main__":
    main()
