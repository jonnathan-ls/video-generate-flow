# c2-d: acabamento S02/S04, cores de época e parallax (M3, M4, M6, M8, B1, B7, B10, V2)
**Modo rápido (obrigatório):** siga AGENTS.md 4a/4b. Confira por `bash orchestra/tools/quadros.sh SXX` (cerca de 15 s), peça todas as imagens do Flow numa só chamada `flow_agent_images` e rode o render completo uma vez só, no fim. Se já houver trabalho parcial desta tarefa (props, PNGs), aproveite.
Leia os itens M3, M4, M6, M8, B1, B7 e B10 em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/qa-lote-01.md`, e as conclusões de `orchestra/results/l1-icono.json`.
- **S04:** as bandeiras da multidão tremulam (use o campo `cloth` do motor, o mesmo da bandeira do S03); as declarações ficam deitadas na mesa, em perspectiva.
- **S02:**
  - o embaixador entra pelo vão da porta, em escala coerente com ela, e chega à mesa;
  - a pasta não pousa sobre a luminária;
  - "TROPAS" não cobre "EMPRÉSTIMO";
  - o telegrama só entra depois da pergunta da fala.
- **Cores de época:** nenhuma calça vermelha nem capacete azul. Corrija com `tint` ou com imagem nova do Flow.
- **V2:** coloque `pan` + `depth` (parallax real) em pelo menos 1 tomada por cena de S02 a S06.

Toda imagem nova do Flow passa por `bash orchestra/periodo.sh <pasta> "Vietnã, 1950–1965: <lugar e equipamentos da cena>"` antes do recorte; reprovada volta ao Flow com o prompt corrigido.
Edite só S02 a S06 no spec. Prep, render, `shot_check` e `scene_gates` de S02 a S06.
Resultado: `orchestra/results/c2-d.json`.
