# AGENTS.md: instruções para executores (OpenCode e outros)

Você executa **uma tarefa** escrita por um orquestrador (Claude) em `orchestra/tasks/<id>.md`. Você não decide estratégia nem aprova o próprio trabalho.

## Regras
1. Leia a tarefa inteira. Leia **só** os arquivos que ela cita. As regras do projeto ficam em `CLAUDE.md`: R1 (fonte para todo fato), R2 (nunca inventar), R13 (licença comercial), R16 (som com motivo), R17 (texto simples), R18 (padrão visual). O padrão de produção de cena fica em `protocols/scene-production.md`.
2. **Proibido:** ler ou imprimir `.env` (chave de API); tocar em `~/scripts`, `kit-flow-generate` ou Steam; publicar qualquer coisa; gastar crédito no Flow. Se o custo de uma geração for maior que 0, pare e informe em `issues`.
3. Altere só os arquivos que a tarefa permite. Não reescreva arquivos inteiros que outras cenas usam (`scenes_spec.json`: leia, modifique e grave só as suas cenas).
4. Rode os validadores que a tarefa pede e corrija até passar, com no máximo 3 tentativas por erro.
4a. **Conferir por quadros, não por vídeo** (2026-11-20). Depois de mudar o spec, rode `vietna_prep.py --only SXX` e `bash orchestra/tools/quadros.sh SXX`, que gera os quadros nas palavras de ação na GPU, em cerca de 15 s. Olhe `media/pt-br-historia/vietna/render/quadros/SXX/folha.jpg`. Para um momento específico: `bash orchestra/tools/quadros.sh SXX 7.2,7.3,7.4`. **O render completo (`vietna_render_batch.sh`) roda uma vez só, no fim**, depois que os quadros estiverem certos.
4b. **Flow em lote** (2026-11-20). Liste no começo todas as imagens de que a tarefa precisa e peça todas numa chamada `flow_agent_images` (até 50, em paralelo, 0 crédito). Depois um `flow_wait` e um `flow_download`. Nunca peça imagem por imagem esperando cada uma.
5. **Saída obrigatória:** grave `orchestra/results/<id>.json` neste formato:
   ```json
   {"status": "done|failed|blocked", "files": ["caminhos alterados"], "validators": {"shot_check": "PASS|FAIL ...", "scene_gates": "..."}, "summary": "até 10 linhas: o que foi feito", "issues": ["o que ficou fraco ou pendente"]}
   ```
   Sem esse arquivo, a tarefa conta como falha.
6. Seja curto. O orquestrador lê apenas o JSON.

## Comandos do vídeo Vietnã
- **Preparar:** `.venv/bin/python pipeline/assembly/vietna_prep.py channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna media/pt-br-historia/vietna/voz media/pt-br-historia/vietna/render --only SXX`
- **Renderizar e mixar:** `bash pipeline/assembly/vietna_render_batch.sh SXX`
- **Validar:**
  - `.venv/bin/python pipeline/validate/shot_check.py channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json media/pt-br-historia/vietna/render/props SXX`
  - `.venv/bin/python pipeline/validate/scene_gates.py media/pt-br-historia/vietna/render SXX`
- **Render:** sempre na GPU. Remotion: `--gl=vulkan` (já é o padrão do projeto). Chrome headless ou Puppeteer: `--use-gl=angle --use-angle=vulkan` ou `--enable-gpu`. Nunca `swiftshader` nem `swangle`.
- **Recortar fundo verde:** `python3 pipeline/assembly/chroma_cut.py in.jpg out.png`. Use o python3 do sistema, que tem PIL.
- **Google Flow:** ferramentas MCP `flow_*` (servidor `flow`). Imagem com Nano Banana, 16:9, sempre a 0 crédito.
  - **Um projeto por produção:** o vídeo Vietnã usa só o projeto **`lacre-vietna`**. Abra esse projeto e crie apenas se ele não existir. Nunca crie projeto de teste ou por lote.
  - **Uma pasta por produção:** baixe tudo em `media/pt-br-historia/vietna/src_img/flow/`, com nome `<cena>_<objeto>_<n>.jpg`, por exemplo `S07_c47_1.jpg`. Não use subpastas por lote nem outro lugar.
  - **Estilo:** todo prompt começa com o prefixo fixo de `lab/flow-prompts-s04.md`. Isso vale também para objetos sobre verde; sem ele a imagem sai realista e destoa.
- **Flow em lote:** se `flow_wait` ou o job indicar que o modo Agent falhou e as imagens estão saindo uma por uma (fallback), registre isso em `issues` com a mensagem exata do erro (`flow_status`/`job.error`). Não esconda o fallback.
- **flow-mcp:** depois de recompilar, encerre qualquer `node .../flow-mcp/dist/index.js` antigo antes de usar. O modo Agent é o único caminho de lote (sem fallback): erro de Agent = tarefa `failed` com a mensagem.
- **Flow, visualização:** modo **Grid, tamanho S** (testado em 2026-11-20: 66 s contra 81 s no modo Batch M para 2 imagens pelo Agente). Projetos: um projeto do Flow por produção (ex.: `lacre-vietna`) e um único `lacre-lab` para todo o laboratório.
- **Gates novos (2026-11-20):** antes de recortar imagem do Flow, `bash orchestra/periodo.sh <pasta> "<contexto>"` (reprovada volta ao Flow); depois do render, `python3 pipeline/validate/render_check.py <mp4> --dur <s>` precisa dar PASS. Tarefas concluídas de um lote vão para `orchestra/arquivo/<lote>/`.
