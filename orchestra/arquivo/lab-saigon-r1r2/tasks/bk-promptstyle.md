# bk-promptstyle: abordagem "prompt styles" em three.js (laboratório)
Leia `lab/bakeoff-saigon/BRIEF.md`. O kit está em `lab/bakeoff-saigon/kits/kit-style-video-prompts/`: cada `.md` é um estilo three.js com o código de referência.
- **Estilo:** `tiny-diorama.md` (diorama em miniatura). Siga o método do arquivo, sem pedir aprovação de storyboard (é um teste), e reconstrua a cena do brief: telhado com helicóptero, avenida, tanque derrubando o portão do palácio, fuzis no chão.
- **Código:** em `lab/bakeoff-saigon/promptstyle/`. Renderize quadro a quadro a 30 fps com um relógio único (Puppeteer, HyperFrames `npx hyperframes@0.8.181` ou captura de canvas), em 1920×1080 e 1080×1920.
- Junte a narração e grave em `lab/bakeoff-saigon/out/promptstyle_16x9.mp4` e `_9x16.mp4`.

Altere só `lab/bakeoff-saigon/`. Resultado: `orchestra/results/bk-promptstyle.json`.
