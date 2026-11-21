# Tarefa bake-s03: corrigir a cena S03 do vídeo Vietnã (teste comparativo de executores)

Contexto: a cena S03 (9,9 s, 3 tomadas) foi reprovada pelo revisor. O relatório está em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/qa-lote-01.md` (procure "S03", "A1" e "M5"). As regras de produção estão em `protocols/scene-production.md`.

Corrija:
1. **A1 · bandeira do Brasil** (tomada 3, 7,2–9,9 s). Hoje ela ondula em fatias com emendas visíveis, e a borda se solta do mastro. Troque por deformação contínua, sem emenda visível em 640×360:
   - a borda do lado do mastro fica fixa;
   - a amplitude cresce até a ponta.

   Faça isso no motor `studio/remotion/src/vietna/scene.tsx`, de forma ADITIVA: um campo novo, por exemplo `cloth`. Não mude o comportamento de `wave` para as outras cenas. Pode usar filtro SVG (`feTurbulence` + `feDisplacementMap`) com máscara de gradiente, ou fatias de 2–3 px.
2. **M5 · helicóptero CH-53** (tomada 2). Ele está bege com faixas vermelhas e azuis. Use `tint` para deixar oliva ou cinza escuro, mantendo o desenho.
3. Altere em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json` só a cena S03: ler, modificar e gravar as outras cenas intactas.
4. Rode prep, render e validadores do S03, conforme os comandos do AGENTS.md. Confira um quadro em 8,5 s: tire com ffmpeg e olhe a imagem.

Arquivos permitidos: `studio/remotion/src/vietna/scene.tsx` (só adicionar), a cena S03 no `scenes_spec.json` e os renders do S03.
Resultado: `orchestra/results/bake-s03.json` com `validators.shot_check` e `validators.scene_gates`.
