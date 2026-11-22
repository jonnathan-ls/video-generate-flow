# c5-s06-label-cue: corrigir a entrada do rótulo de data em S06

Leia esta tarefa, `AGENTS.md`, `protocols/scene-production.md`, `orchestra/results/c4-s06-text.json`, o trecho S06 de `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json`, `media/pt-br-historia/vietna/render/props/S06.json` e `studio/remotion/src/vietna/shots.tsx`.

## Alvo e diagnóstico
Na tomada S06 de 5,8–10,2 s, o revisor independente identificou que o rótulo secundário “em 1950” ainda está quase transparente no quadro 8,56 s. O rótulo começa exatamente na palavra “1950” e sua animação de entrada leva 14 quadros, por isso ainda não tem contraste no início da palavra.

## Mudança permitida
- Edite somente o objeto `stat` da tomada S06 de 5,8–10,2 s em `scenes_spec.json`.
- Acrescente `label_offset: -0.4` para antecipar a entrada do rótulo pelo limite de 0,4 s do protocolo. Preserve texto, posição, tamanho, número, animação e todos os demais campos/cenas.
- Não edite componente, narração, imagem, fontes ou scripts. Não use Flow e não leia `.env`.

## Verificação
1. Rode `vietna_prep.py --only S06` conforme o comando em `AGENTS.md`.
2. Rode `bash orchestra/tools/quadros.sh S06 8.1,8.3,8.56,8.8,9.0` e confira a folha em 640×360; “em 1950” deve estar legível ao começar a palavra, com o fundo escuro da etiqueta visível.
3. Só então renderize S06 uma vez em Vulkan com `bash pipeline/assembly/vietna_render_batch.sh S06`.
4. Rode `shot_check.py`, `scene_gates.py` e `render_check.py --dur 32`; física PASS é reutilizada de c3, pois apenas o cue tipográfico mudou.
5. Grave `orchestra/results/c5-s06-label-cue.json` logo após os gates, no formato obrigatório de `AGENTS.md`, e registre os arquivos alterados e qualquer pendência.
