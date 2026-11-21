---
name: video-structure
description: Define a estrutura da narrativa (beat sheet), o plano de retenção e as previsões de métricas de um vídeo com embalagem aprovada, e gera structure.md.
argument-hint: "<canal>/<id-do-video>"
---
1. Gate: `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to structured --check-only`.
2. Siga `protocols/video-structure.md` e pontue com `rubrics/structure-retention.md` (mínimo 80%).
3. Escreva `channels/$ARGUMENTS/structure.md` com as 7 seções obrigatórias.
4. `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to structured`.
