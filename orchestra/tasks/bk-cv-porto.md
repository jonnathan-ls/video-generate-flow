# bk-cv-porto: a queda de Saigon no estilo "porto-de-nova-york" da skill claude-video — laboratório, só 16:9
Leia `lab/bakeoff-saigon/BRIEF.md` (batidas; palavras com tempo em `lab/bakeoff-saigon/palavras.json`). Use a skill `~/.claude/skills/claude-video/SKILL.md` só na etapa de construção e render, **sem perguntas nem aprovação** (o usuário já aprovou o teste).
- **Estilo obrigatório:** `porto-de-nova-york`. Leia `~/.claude/skills/claude-video/estilos/porto-de-nova-york/ESTILO.md` e o projeto de exemplo da pasta, e reproduza **esse** estilo fielmente (não troque por outro). Só o tema muda.
- **Projeto:** `bash ~/.claude/skills/claude-video/scripts/novo-projeto.sh lab/bakeoff-saigon/cv-porto 16x9 15 porto-de-nova-york`.
- **Conteúdo:** Saigon, 29–30/04/1975: helicópteros evacuam em "evacuam" (3,49 s); tanques entram no palácio em "palácio" (7,97 s); "Duong Van Minh · 2 dias no cargo" em 10,6–12,4 s; armas depostas em "deporem" (13,81 s). Sem anacronismo.
- **Render sempre na GPU:** Chrome headless com `--use-angle=vulkan --use-vulkan --enable-features=Vulkan --ignore-gpu-blocklist --disable-vulkan-surface`, binário `studio/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell` (o Chrome do sistema não sobe WebGL), ou `npx hyperframes@0.8.181 render ... --gpu --browser-gpu`; ffmpeg só com `h264_nvenc`. Nunca SwiftShader nem libx264.
- Confira quadros (`frames.sh`) e rode `ritmo.py`; corrija no máximo 2 rodadas.
- **Saída:** junte a narração com ffmpeg (`-map 0:v -map 1:a -shortest`, vídeo copiado) em `lab/bakeoff-saigon/out/cv_porto_16x9.mp4`.
Altere só `lab/bakeoff-saigon/`. Resultado: `orchestra/results/bk-cv-porto.json` (summary com tempo de trabalho, tempo de render e o que ficou fraco).
