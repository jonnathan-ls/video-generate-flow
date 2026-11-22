# Estado do laboratório (atualizado 2026-11-22)

Arquivo de passagem **só do lab**. Um chat novo de lab lê isto, `CLAUDE.md` (seções Orquestração e R15) e `lab/bakeoff-saigon/BRIEF.md`. A produção do Vietnã fica em outro chat (`orchestra/ESTADO.md`): não mexer nela daqui.

## O teste
- **Trecho fixo:** a queda de Saigon, 15 s, narração `lab/bakeoff-saigon/narracao.wav`, palavras com tempo `lab/bakeoff-saigon/palavras.json`. Saídas em `lab/bakeoff-saigon/out/<estilo>_16x9.mp4`.
- **Prompt styles:** `lab/bakeoff-saigon/kits/kit-style-video-prompts/*.md` (37 estilos em three.js, com STAGE e SOUND). Brief modelo: `orchestra/tasks/bk-ps-lowpoly.md`.
- **Galeria:** `python3 lab/bakeoff-saigon/galeria.py` gera `out/galeria.html`. Para abrir: `python3 -m http.server 8780 -d lab/bakeoff-saigon/out` → http://localhost:8780/galeria.html (no app: `preview_start` com o nome `lab-galeria`). Um vídeo por vez ou lado a lado, com play sincronizado. Rode o script de novo quando entrar vídeo novo.

## Já feito (13 vídeos na galeria)
Rodadas 1–3: colagem nossa, kit director-de-collage, pedido direto, claude-video (risografia, porto, mesa, documento), diorama, código 3D, Ink and Toon, Paper Pop-Up, Low-Poly, Soft Clay.
**Opinião do usuário:** colagem é a melhor abordagem; Ink and Toon (3) e Low-Poly (5) acertaram de primeira; diorama e código 3D com ressalvas; claude-video serve a motion graphics.

## Pendente (pausado em 2026-11-22 por consumo alto; nada terminou)
1. **Rodada 4, vídeo**, 6 prompt styles: Spotlight Stage, Inflated, Painted, Voxel, Pencil Sketch, Shadowbox. Briefs prontos: `orchestra/tasks/bk-ps-{spotlight,inflated,painted,voxel,pencil,shadowbox}.md`. Há código parcial em `lab/bakeoff-saigon/ps-spotlight/` e `ps-inflated/`: aproveitar.
2. **Estilos novos, só 4 imagens cada** (ver o estilo antes de renderizar vídeo): Crochê/amigurumi, Cartoon, 3D cinematográfico. Cada um cria um prompt style novo no formato do kit e uma prancha 2×2 em `out/estilos/<id>-prancha.jpg`, que a galeria mostra numa seção própria. Briefs: `orchestra/tasks/est-{croche,cartoon,3d-cine}.md`. Há código parcial em `lab/bakeoff-saigon/est-croche/`. Massinha já existe (Soft Clay).

## Como rodar barato (lição de 2026-11-22)
- **Uma tarefa por vez:** `setsid nohup bash orchestra/paralelo.sh 1 <lista> > orchestra/logs/paralelo-lab.log 2>&1 &`, com linhas `claude <id> sonnet`. Cada estilo leva cerca de 25 min de Sonnet (do plano). Três ao mesmo tempo esgotaram o limite.
- Pergunte ao usuário por quais 2 estilos começar, e mostre esses antes de seguir.
- **Ao pausar:** matar a fila **e** os `claude -p` filhos (`ps -eo pid,cmd | grep "claude -p"`), porque eles sobrevivem à fila. Conferir com o mesmo comando que sobrou 0.
- Laço em zsh: não use `set -- $par` (o zsh não divide a string). Use `${par%%:*}` / `${par##*:}` e confira a lista (`cat`) antes de disparar.
- Espera em segundo plano só por arquivo ou log, nunca `pgrep -f` com texto do próprio comando.
- Render só na GPU (flags Vulkan no brief modelo). Gate de física no brief: tanque na avenida, nariz para onde vai, pés no chão.
