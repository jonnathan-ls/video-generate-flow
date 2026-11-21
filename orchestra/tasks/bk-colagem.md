# bk-colagem: abordagem "colagem" (o nosso padrão R18) (laboratório)
Leia `lab/bakeoff-saigon/BRIEF.md` e `protocols/scene-production.md`. Use o nosso motor Remotion (`studio/remotion/src/vietna/scene.tsx`, composição `VietnaScene`), com fundos e recortes gerados no Google Flow (MCP `flow_*`).
- **Flow:** projeto **lacre-lab** (crie se não existir), 0 crédito, prefixo de estilo de `lab/flow-prompts-s04.md`, objetos sobre verde puro.
- **Imagens:**
  - fundos: telhado em Saigon com helicóptero (sem pessoas), avenida com o portão do palácio fechado e a versão com o portão derrubado (`bg2` em "palácio"), pátio do palácio;
  - recortes: CH-53 verde-oliva, tanque T-54 verde, fila de civis, soldados, fuzis no chão.
- **Arquivos:** imagens em `lab/bakeoff-saigon/colagem/img/`. Os recortes vão para `studio/remotion/public/lab/` (só essa subpasta).
- **Montagem:** monte as props num JSON próprio em `lab/bakeoff-saigon/colagem/props.json`, no formato de `media/pt-br-historia/vietna/render/props/S05.json`, com `words` de `palavras.json`, `durationSec` 15 e `scene` "LAB".
- **Render:** `npx remotion render VietnaScene <out> --props=<json>`, a partir de `studio/remotion`, em 1920×1080 e com `--width=1080 --height=1920` (ajuste as posições para o vertical).
- **Áudio:** junte a narração e grave em `lab/bakeoff-saigon/out/colagem_16x9.mp4` e `_9x16.mp4`.

**Não altere** `scenes_spec.json`, os renders do vídeo nem `scene.tsx`. Resultado: `orchestra/results/bk-colagem.json`.
