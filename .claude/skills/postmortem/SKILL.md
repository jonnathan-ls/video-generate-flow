---
name: postmortem
description: Checkpoint de métricas e post-mortem de um vídeo publicado (24h/72h/7d/28d) com atualização de learnings.
argument-hint: "<canal>/<id-do-video> <24h|72h|7d|28d>"
---
Agente `analyst` seguindo `protocols/postmortem-and-reviews.md`. Os dados vêm de `data/metrics.sqlite` (rode a coleta antes, se estiver desatualizada). No checkpoint de 28d, atualize `learnings.md` e avance para `analyzed`.
