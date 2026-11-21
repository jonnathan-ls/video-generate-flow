# c2-b: passada real das colunas com poses alternadas (A4, lote 1)
Leia o item A4 em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/qa-lote-01.md`. Hoje as pernas ficam paradas e a figura desliza.
1. No motor `studio/remotion/src/vietna/scene.tsx`, crie campos ADITIVOS no ator: `frames: string[]` (PNG das poses) e `frame_fps` (padrão 6). Enquanto o ator anda, alterne as poses; parado, mostre a 1ª. Mantenha o `gait` antigo para quem não usa `frames`.
2. No Google Flow (ferramentas MCP flow_*), no projeto **lacre-vietna** (crie só se não existir), gere poses de passada para cada coluna que anda no lote:
   - S02 t3: soldados brasileiros de 1965, verde-oliva inteiro, capacete M1, coturno preto;
   - S03 t1 e S04 t1: moradores de Hanói em 1945;
   - S05 t2, t3 e t5: soldados franceses de 1946, cáqui, capacete M1 ou chapéu de mato, sem capacete azul nem bota vermelha.

   Para cada coluna, 2 ou 3 imagens: "same column of N ... walking left to right, side view, full body, evenly spaced; pose A: left legs forward / pose B: right legs forward", com o prefixo de estilo de `lab/flow-prompts-s04.md` e "isolated on a solid pure green background (#00FF00)". Custo 0; se der mais que 0, pare.
3. Baixe em `media/pt-br-historia/vietna/src_img/flow/` com o nome `Sxx_coluna_poseA.jpg`. Recorte com `python3 pipeline/assembly/chroma_cut.py` para `studio/remotion/public/vietna/`. Alinhe as poses pela base, com a mesma escala.
4. Troque os atores dessas colunas para usar `frames`. Velocidade de 0,5 a 1 altura de corpo por segundo. Edite só as cenas do lote no `scenes_spec.json`.
5. Registre as fontes do uniforme em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/sources.md`, a partir de `orchestra/results/l1-icono.json` (URLs já pesquisadas).
6. Prep e render de S02 a S05. Rode `shot_check` e `scene_gates`. Tire 3 quadros seguidos de uma coluna andando e confira se as pernas mudam.
Resultado: `orchestra/results/c2-b.json`.
