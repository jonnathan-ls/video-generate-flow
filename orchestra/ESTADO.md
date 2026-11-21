# Estado para retomar (atualizado 2026-11-20 23:25)

Arquivo de passagem entre conversas. Um chat novo lê **só isto, `CLAUDE.md`, `orchestra/production.json` e `AGENTS.md`** antes de agir. Atualize ao fim de cada sessão (máx. 60 linhas; o histórico fica em `decisions.md`/`mistakes.md`).

## Onde estamos
- **Vídeo:** "Guerra do Vietnã" (54 cenas, ~21 min), `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/`. Roteiro aprovado. S01 aprovado. Lote 1 (S02–S06) no ciclo 2 de correção: c2-a e c2-b feitos; **c2-c e c2-d PAUSADOS pelo usuário** (c2-c interrompido no meio; o brief manda aproveitar o parcial). Para retomar: descomentar as linhas em `orchestra/fila.txt` e `setsid nohup bash orchestra/fila.sh >> orchestra/logs/fila.log 2>&1 &`. **Estilo decidido (23:20): colagem da produção, com todo o protocolo** (ver `channels/pt-br-historia/decisions.md`). Lab encerrado; Ink and Toon e Low-Poly ficam para outros temas.
- **Laboratório Saigon** (`lab/bakeoff-saigon/`, mesmo trecho de 15 s, narração do S42). Saídas em `lab/bakeoff-saigon/out/`.
  - Rodada 1–2 (prontas): colagem nossa (sem revisão), kit director-de-collage, pedido direto sem kit, claude-video (saiu risografia), diorama (prompt styles), código 3D. Comparativo: `out/comparativo_saigon_6.mp4`.
  - Rodada 3 (rodando em 22:20, `orchestra/paralelo.sh` 2 em paralelo): ps_inktoon (pronto), ps_popup, ps_lowpoly, ps_softclay, cv_porto, cv_mesa, cv_documento. Log: `orchestra/logs/paralelo.log`. Resultados: `orchestra/results/bk-ps-*.json`, `bk-cv-*.json`.
  - **Opinião do usuário até agora:** colagem é a melhor abordagem; gostou de código puro 3D e do prompt style (diorama) com ressalvas; claude-video serve a temas específicos/motion graphics.
- **Próximo passo:** quando c2-d terminar, rodar `orchestra/review.sh` em S02–S06 (ciclo 2), conferir 1 folha de contato reduzida por cena e, com todas as notas ≥ 4 e média ≥ 4,3, mandar o lote 1 ao usuário. Abaixo disso: é o 2º ciclo, então escalar com diagnóstico (R6/R8).

## Infra que funciona (não refazer)
- Render só na GPU: Remotion `--gl=vulkan`; three.js/HyperFrames com Chrome headless do Remotion + flags Vulkan; ffmpeg `h264_nvenc`.
- Fila: `fila.sh` (única, para tarefas com Flow) e `paralelo.sh <N> <lista>` (sem Flow). Ambas com `setsid nohup`.
- Executores: `orchestra/run.sh claude|opencode|gemini|dsh <id> [modelo]`; `MCP=orchestra/mcp-flow.json` dá o Flow ao Sonnet CLI.
- **flow-mcp** (`~/flow-mcp`), corrigido em 2026-11-20 para a interface nova (botão "Flow Agent", painel "Agent settings" em 2 níveis). **Sem fallback um-a-um:** erro de Agent = falha com print em `~/.flow-mcp/debug-agent.png`. Depois de recompilar, matar `node .../flow-mcp/dist/index.js` antigo. Visualização do Flow: Grid S. Projetos: `lacre-vietna` (produção), `lacre-lab` (lab).
- Painel: `python3 orchestra/dashboard/server.py` → http://localhost:8765. Galeria claude-video: http://127.0.0.1:8770/.
- Frames rápidos: `bash orchestra/tools/quadros.sh <cena> <tempos|auto> [props]`.

## Sessão 2026-11-20 (noite)
- Git: repositório `https://github.com/jonnathan-ls/video-generate-flow` (main). Commit + push ao fim de cada etapa. flow-mcp tem ramo `fix/flow-ui-2026-11-20` (local).
- Lab rodada 3 pronta: `lab/bakeoff-saigon/out/comparativo_saigon_r3.mp4` (9 estilos). Usuário escolheu seguir com a colagem da produção.
- Gates novos: `orchestra/periodo.sh`, `render_check.py`, `transcript_check.py`, revisão com âncora S05, `rubrics/render-qa.md`. Ouro do repositório antigo extraído (knowledge/collage-direction, longform-production-lessons, production-recipes). O repositório antigo pode ser arquivado; faltou só o `estudo-e-propostas.md` do Ampulheta (estrutura em 3 escalas), opcional.

## Pendências antes de publicar
- R13: termos comerciais do Flow. Fontes iconográficas (l1-icono) em `sources.md`.
- Saldo DeepSeek ≈ US$ 1,08.

## Ideias de qualidade em aberto (propostas ao usuário, não aprovadas)
1. Levar ao nosso motor de colagem a câmera em camadas e a textura papel/filme do kit director-de-collage.
2. Checagem de período por visão (Gemini) em cada imagem do Flow antes de animar (palácio errado, fuzil de ferrolho apareceram no lab).
3. Limpeza feita em 2026-11-20 (ver decisions.md). Código só de um vídeo fica em `_work/` do vídeo (ex.: `_work/specgen/`).
