# c2-a: rótulos legíveis, sweep só com movimento, rótulo do Viet Minh (lote 1, ciclo 2)
Leia em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/qa-lote-01.md` os itens M1, M7, B2 e B6. Regras: `protocols/scene-production.md`.
1. **M1:** nos componentes de rótulo (NameTag, tag de data e sublinhas em `studio/remotion/src/vietna/VietnaScene.tsx` e `shots.tsx`), deixe toda letra com pelo menos 27 px em 1080p. Use texto claro com fundo escuro translúcido ou sombra forte. Vale para todas as cenas.
2. **M7:** em `pipeline/assembly/vietna_mix_scene.py`, o som de "movimento de câmera" (sweep) só toca se a tomada tiver `pan` ≠ 0 ou um zoom maior que 15%.
3. **S05:** na 1ª menção de "Viet" (palavra `Viet#1`), adicione um `names` na tomada com o texto "VIET MINH" e a sublinha "frente pela independência do Vietnã". Edite só o S05 em `scenes_spec.json` (ler, modificar, gravar).
4. Prep e render do S05. Rode `shot_check` e `scene_gates` do S05.
Resultado: `orchestra/results/c2-a.json`.
