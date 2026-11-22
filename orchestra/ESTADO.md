# Estado para retomar (atualizado 2026-11-21)

Arquivo de passagem. Ao retomar, leia este arquivo, `CLAUDE.md`, `orchestra/production.json` e `AGENTS.md`.

## Onde estamos
- **Vídeo:** "Guerra do Vietnã" (54 cenas, ~21 min), em `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/`. Roteiro aprovado; S01 aprovado. O usuário autorizou seguir todos os lotes e trocar de modelo sem pedir nova autorização; publicação continua separada.
- **L1 (S02–S06), c5:** fechado e aprovado após antecipar 0,4 s o rótulo “em 1950” de S06. `shot_check`, `scene_gates`, `render_check` e física PASS; revisão do lote V1–V10 média 4,30. S01 já estava aprovada. Ver `orchestra/results/l1-c5-qa.json` e `orchestra/results/c5-s06-label-cue.json`.
- **L1 transcrição:** S01/S02 PASS; S05 WARN (19/dezenove); S06 PASS no small; S03 “há/a” adjudicado como homófono; S04 “Ba Dinh” ouvido como “Badin” no recorte Gemini, com divergência só de grafia entre ASR. Conteúdo sem omissão ou substituição lexical; decisão registrada em `qa-lote-01.md`.
- **L1 física:** PASS formal em S02–S06: 24 perguntas, uma resposta válida por pergunta, zero falhas, Gemini 3.5 Flash-Lite via CLI autenticado sem ler `.env`.
- **Low-poly S05:** vídeo e `S05_sheet.jpg` entregues; `render_check` e transcrição PASS. `fx_check` F7 ainda falha após duas correções (7,1% das janelas abaixo de 10 dB; mediana 15,7 dB). Física sem modelo. Ver `orchestra/results/lp-base.json`; não reaplicar mais redução de FX nesta tarefa.
- **Revisão visual:** a nota válida de lote foi feita no conjunto (V1/V4/V6 são critérios agregados); média 4,30, todas ≥4. Gemini c5 aprovou S06 com 5,00 após o ajuste. As notas c3 de 4,00 por cena permanecem como diagnóstico, não como média agregada do lote.
- **Flow:** lote de seis imagens no projeto `lacre-vietna` consumiu 0 créditos. `periodo.sh` não devolveu JSON; as seis imagens não foram cortadas nem referenciadas no spec. Não usar até `periodo.sh` PASS.
- **L2–L10:** L1 cumpriu o DoD; iniciar L2 (S07–S11) e seguir em ordem. O usuário autorizou todos os lotes sem nova autorização ao atingir limites; manter gates e custo de Flow em zero. A colagem segue como estilo escolhido; o piloto low-poly é separado.

## Próximo passo
- L1 está fechado; planejar e produzir L2 (S07–S11) em fluxo A/B/C, com imagens do Flow apenas a 0 crédito.
- Continuar para L3–L10 conforme cada DoD passar; se o executor/modelo atingir limite, alternar pelo fluxo registrado sem pedir nova autorização.
- Não publicar. Antes de publicar ainda faltam R13 (termos comerciais do Flow) e fontes iconográficas em `sources.md`.

## Infra que funciona
- Render na GPU: Remotion `--gl=vulkan`; three.js/HyperFrames no Chrome headless com Vulkan; ffmpeg `h264_nvenc`. Nunca SwiftShader, Swangle ou libx264.
- Fila com Flow: `orchestra/fila.sh`; sem Flow: `orchestra/paralelo.sh <N> <lista>`; executores: `orchestra/run.sh claude|opencode|gemini|dsh <id> [modelo]`.
- Flow: um projeto por produção (`lacre-vietna`); imagens em lote via Flow Agent, Grid S, 16:9, 0 crédito. Erro do Agent é falha; sem fallback imagem por imagem.
- Quadros: `bash orchestra/tools/quadros.sh <SXX> <tempos|auto> [props]`. O render final cria `SXX_sheet.jpg`; a revisão visual final é do orquestrador.

## Histórico útil
- Comparativo Saigon: `lab/bakeoff-saigon/out/comparativo_saigon_r3.mp4`; preferência do usuário foi colagem. Ink and Toon e Low-Poly ficam para outros temas salvo decisão posterior.
- Cotas atuais: OpenCode grátis retornou `Free usage limit reached` também em `nemotron-3.5-super-vl-free`; Gemini visual respondeu no c5; Sonnet CLI não autenticado; DeepSeek continua sob o freio de US$ 0,10. Trocar modelo/caminho sem repetir tentativa idêntica; não gastar créditos.
