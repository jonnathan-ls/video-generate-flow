# bk-dirco: a queda de Saigon com o kit director-de-collage — laboratório, 16:9, 15 s
Leia `lab/bakeoff-saigon/BRIEF.md` (batidas; palavras com tempo em `lab/bakeoff-saigon/palavras.json`). Siga o kit em `lab/bakeoff-saigon/kits/kit-director-de-collage/` (SKILL.md e `references/`), estilo «Archivo» padrão, **os três trabalhos em sequência sem pedir aprovação** (o usuário já aprovou o teste). O kit é só leitura: trabalhe numa cópia.
- **Formato:** 16:9, 1920×1080, 30 fps, 15 s, com a narração `lab/bakeoff-saigon/narracao.wav`.
- **Imagens:** gere pelo MCP `flow` (projeto Flow **lacre-lab**; prefira `flow_agent_images` com todos os prompts de uma vez; 0 crédito). Use os prompts e o croma do kit. Downloads só em `lab/bakeoff-saigon/dirco/img/`.
- **Período:** Saigon, 29–30/04/1975: CH-53 dos Fuzileiros dos EUA, tanque T-54 norte-vietnamita, Palácio da Independência (modernista, anos 1960), soldados sul-vietnamitas com M16. Nada de anacronismo.
- **Estúdio:** copie `assets/estudio` para `lab/bakeoff-saigon/dirco/estudio/` e reaproveite `studio/remotion/node_modules` por link simbólico (não rode npm install). 
- **Render sempre na GPU:** `npx remotion render ... --gl=vulkan`. Nunca CPU/SwiftShader.
- Confira quadros de controle (o kit tem `fotogramas.mjs`) e corrija o que estiver errado, no máximo 2 rodadas.
- **Saída:** `lab/bakeoff-saigon/out/dirco_16x9.mp4` (vídeo + narração).
Resultado: `orchestra/results/bk-dirco.json` no esquema do AGENTS.md (summary com tempo de render e o que ficou fraco).
