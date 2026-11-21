---
name: script
description: Escreve o roteiro (longo + shorts derivados) de um vídeo com embalagem aprovada e o envia para revisão.
argument-hint: "<canal>/<id-do-video>"
---
1. Gate: `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to scripted --check-only`.
2. Agente `scriptwriter` seguindo `protocols/script-long.md` e `protocols/script-short.md`.
3. `python3 pipeline/validate/script_check.py channels/$ARGUMENTS`.
4. Encadeie a skill `review`.
