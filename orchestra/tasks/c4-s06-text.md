# c4-s06-text: escalonamento crítico de L1 pelo Sonnet (R15/R18)

## Leitura permitida
Leia a tarefa, `AGENTS.md`, `CLAUDE.md` (R8, R15, R18 e render), `protocols/scene-production.md`, `orchestra/results/c3.json`, a entrada S06 de `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json` e `scenes.json`, e `studio/remotion/src/vietna/shots.tsx` e `VietnaScene.tsx`.

## Diagnóstico
O ciclo c3 terminou com falhas de rubrica e mostrou um problema visual real: em S06 a cartela “US$ 10 milhões” cobre o cargueiro/guindaste e a carga suspensa. O executor grátis/OpenCode atingiu o limite; o Gemini Flash-Lite deixou passar o problema. R15/R18 determinam escalonamento crítico para Sonnet quando o executor grátis falha duas vezes. Este trabalho é essa escalada; prossiga sem perguntar ao usuário.

## Objetivo
Reposicione e reduza apenas a cartela estatística do trecho S06 de 5,8–10,2 s, de modo que “US$ 10 milhões” e “em 1950” fiquem legíveis em 640×360 e não cubram navio, guindaste, cabo nem carga. A área superior esquerda do céu está livre. Preserve texto, timing por palavra, narração, atores, demais tomadas e todas as outras cenas.

Se o `StatShot` não suportar posição/escala configurável, acrescente em `StatSpec` opções opcionais para uma posição superior esquerda e tamanho da cifra; o padrão ausente deve preservar exatamente o visual das outras cenas. Configure somente o objeto `stat` de S06 com essas opções. Evite mudanças globais de aparência ou timing.

## Permissões
- Editar somente o objeto S06 em `scenes_spec.json`.
- Editar `studio/remotion/src/vietna/shots.tsx` apenas para implementar opções opcionais da cartela `StatShot`, mantendo o padrão de outras cenas.
- A preparação/render pode atualizar `scenes.json`, `render/props/S06.json`, `render/S06.mp4`, `render/S06_sheet.jpg` e os quadros derivados.
- Criar `orchestra/results/c4-s06-text.json` e log em `orchestra/logs/c4-s06-text-sonnet.log`.
- Não ler `.env`; não editar áudio, fontes, outras cenas, outros componentes ou scripts do pipeline. Não usar Flow nem consumir créditos.

## Validação
1. Rode `.venv/bin/python pipeline/assembly/vietna_prep.py channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna media/pt-br-historia/vietna/voz media/pt-br-historia/vietna/render --only S06`.
2. Rode `bash orchestra/tools/quadros.sh S06` e confira `media/pt-br-historia/vietna/render/quadros/S06/folha.jpg`; ajuste até a cartela não cobrir as ações e ficar legível.
3. Renderize uma vez: `bash pipeline/assembly/vietna_render_batch.sh S06` (GPU/Vulkan).
4. Rode `shot_check.py` para S06, `scene_gates.py` para S06 e `render_check.py` no MP4 final.
5. Física permanece PASS do c3 (24 perguntas S02–S06, zero falhas); registre que esta mudança é só tipográfica e não altera os movimentos.
6. Grave `orchestra/results/c4-s06-text.json` no formato obrigatório de `AGENTS.md`, com status, files, validators, summary e issues.
