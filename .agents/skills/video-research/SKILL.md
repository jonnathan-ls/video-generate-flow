---
name: video-research
description: Pesquisa de um vídeo selecionado (tendência do tema, referências estruturais com heatmap, lacunas, dossiê de fontes) e gera research.md.
argument-hint: "<canal>/<id-do-video>"
---
1. Gate: `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to researched --check-only`.
2. Siga `protocols/video-research.md` por completo. A coleta pesada vai para subagentes/scripts e grava em `research/raw/` do vídeo; só o resumo volta ao contexto principal.
3. Escreva `channels/$ARGUMENTS/research.md` com as 6 seções obrigatórias.
4. `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to researched`.
