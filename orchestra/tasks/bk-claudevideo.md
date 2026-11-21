# bk-claudevideo: abordagem "kit claude-video" (laboratório)
Leia `lab/bakeoff-saigon/BRIEF.md`. Use a skill `~/.claude/skills/claude-video/SKILL.md` só na etapa C, passos 4 a 8, sem pedir aprovação (é um teste).
- **Estilo:** `porto-de-nova-york`. Leia a ficha `~/.claude/skills/claude-video/estilos/porto-de-nova-york/ESTILO.md`. Use o mesmo método e troque o tema pelo brief.
- **Projetos:**
  - `bash ~/.claude/skills/claude-video/scripts/novo-projeto.sh lab/bakeoff-saigon/claudevideo_16x9 16x9 15 porto-de-nova-york`;
  - outro igual em `lab/bakeoff-saigon/claudevideo_9x16`, com `9x16`.
- Faça cada batida cair na palavra (`palavras.json`). Gere frames, renderize e junte a narração com ffmpeg (`-map 0:v -map 1:a -shortest`) para `lab/bakeoff-saigon/out/claudevideo_16x9.mp4` e `_9x16.mp4`.
- Rode `ritmo.py` nos dois.

Altere só `lab/bakeoff-saigon/`. Resultado: `orchestra/results/bk-claudevideo.json`.
