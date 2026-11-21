# bk-direto: pedido direto, sem kit
Faça um vídeo animado de 15 segundos, 16:9 (1920×1080, 30 fps), sobre a queda de Saigon, para um canal de história no YouTube. A narração já existe: `lab/bakeoff-saigon/narracao.wav` (as palavras com tempo estão em `lab/bakeoff-saigon/palavras.json`). As imagens devem acompanhar o que a narração diz, no momento em que diz. Escolha você o estilo e a técnica, buscando o resultado mais profissional possível.
Regras de ambiente (não são dicas de estilo):
- Trabalhe só em `lab/bakeoff-saigon/direto/`. **Não abra** `lab/bakeoff-saigon/kits/`, `lab/bakeoff-saigon/out/` (exceto para gravar a saída), `studio/`, `pipeline/`, `~/projects/kit-flow-generate` nem `~/.claude/skills` — o teste é o seu trabalho sem kit.
- Se quiser imagens geradas, há o MCP `flow` (Google Flow, projeto **lacre-lab**, 0 crédito com `flow_agent_images`). Node, ffmpeg, Python e o Chrome headless estão disponíveis; não instale nada global.
- Render na GPU (Chrome com `--use-angle=vulkan --use-vulkan --enable-features=Vulkan --ignore-gpu-blocklist --disable-vulkan-surface`, binário `studio/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell` pode ser executado), ou ffmpeg com `h264_nvenc`. Nunca SwiftShader.
- **Saída:** `lab/bakeoff-saigon/out/direto_16x9.mp4` com a narração.
Resultado: `orchestra/results/bk-direto.json` com {status, files, summary (estilo escolhido, técnica, tempo de render, o que ficou fraco), issues}.
