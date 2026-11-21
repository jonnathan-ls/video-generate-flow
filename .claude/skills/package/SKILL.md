---
name: package
description: Gera títulos e thumbnails (embalagem) para um vídeo selecionado e pede a escolha do usuário.
argument-hint: "<canal>/<id-do-video>"
---
Siga `protocols/packaging.md` com o agente `packager` para `channels/$ARGUMENTS/`. Gate: `python3 pipeline/validate/status_gate.py channels/$ARGUMENTS --to packaged` após registrar a escolha do usuário.
