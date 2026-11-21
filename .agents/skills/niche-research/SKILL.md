---
name: niche-research
description: Executa a Fase 0 — pesquisa e pontuação de nichos para um idioma (pt-br ou en) e apresenta o top 3 ao usuário. Use quando o usuário pedir para definir nicho ou abrir um canal novo.
argument-hint: "<pt-br|en>"
---
1. Leia `AGENTS.md` e `protocols/niche-research.md` por completo.
2. Delegue a coleta de evidência ao agente `trend-researcher` (pode paralelizar por categoria) e a pontuação e a síntese ao `strategist`.
3. Salve em `research/niche-$ARGUMENTS-<AAAA-MM-DD>.md`.
4. Verifique o Definition of Done do protocolo item a item. Só então apresente o top 3 ao usuário, com a recomendação primeiro.
