---
name: review
description: Revisão independente de roteiro (fact-check, rubrica, política) e apresentação ao usuário para aprovação.
argument-hint: "<canal>/<id-do-video>"
---
Agente `reviewer` seguindo `protocols/review.md` em `channels/$ARGUMENTS/`. Se o veredito for REFAZER, devolva ao `scriptwriter` (máx. 2 ciclos — R6). Se for APROVADO, mostre ao usuário o resumo e o link do `script.md` e aguarde. A aprovação dele vai para `approval.md` com a citação literal.
