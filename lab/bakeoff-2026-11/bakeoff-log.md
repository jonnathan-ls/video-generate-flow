# Log do teste comparativo (bake-off)

## 2026-11-19: voz (pré-requisito; não é critério do teste)
- Kokoro v1.0 (kokoro-onnx 0.6.1, Apache-2.0). Narração de teste: 99 palavras (`lab/bakeoff-2026-11/bakeoff/narration.md`).
- Velocidade 1.0 → ~170 WPM (rápido demais para documentário). Velocidade 0.88 → 157–162 WPM, 36,6–37,9 s.
- Checagem por Whisper medium (GPU), comparando com o texto:
  | Voz | Erro (WER aprox.) | Diferenças reais |
  |---|---|---|
  | pm_santa | 4,7% | nenhuma (só números escritos em algarismos) |
  | pm_alex | 5,7% | "dois" ouvido como "três" |
  | pf_dora | 5,7% | "dois" ouvido como "três" |
- **Escolhida para o teste: pm_santa @ 0.88.** A voz definitiva do canal será decidida depois, com você ouvindo e comparando com a sua voz clonada.
- Aprendizado de processo: a checagem por Whisper pega erro de pronúncia sem ninguém ouvir. Vai virar validador do pipeline (`qa-voice`).

## 2026-11-19: candidato B (colagem documental, Remotion)
- **Assets:** 4 gravuras e pinturas de domínio público do Wikimedia Commons (ver `lab/bakeoff-2026-11/bakeoff/assets.md`). O Rugendas (Salvador) e a "Departure" não baixaram (limite de taxa 429); Salvador virou zoom de mapa.
- **Componentes criados** (`studio/remotion/src/lacre/`): tokens, Grain, Vignette, Desk, Print (Ken Burns com moldura), WaxSeal, PlaceLabel, Stamp, ImpactText, TitleCard e MapScene (d3-geo + Natural Earth, rota animada, pins, câmera).
- **Iteração 1:** a carta náutica ao fundo competia com os litorais; o título cobria o rosto de Napoleão; o porto vazio mostrava só céu.
- **Iteração 2:** textura a 16% com desfoque; título no terço inferior com degradê; novo recorte do cais em tom frio.
- **QA automático:**
  - loudness −19,6 LUFS → corrigido para −14,5 (loudnorm na exportação; a etapa de mix ainda não existe);
  - imagem parada por 2,2 s na frase de impacto (falha em V3) → deriva lenta de escala; nova checagem sem trechos parados.
- **Render:** 39 s de vídeo em 48 s de relógio com concorrência 6, pico de 1,1 GB de RAM. Projeção para 75 min: cerca de 1h30.
- **Iterações usadas:** 2 de 3.

## 2026-11-19: candidatos A, C e A-HF (ver também o resultado em `lab/bakeoff-2026-11/bakeoff-result.md`)
- **A:** 1 iteração; render 36 s, −14,5 LUFS, 0 paradas. Chroma de A3 e A6 sem halo.
- **C:** mistura de cenas de A e B por tabela `PICK`; sem iterações extras.
- **A-HF (HyperFrames):** 3 renders. (1) incompleto, por erro meu: esqueci os mapas e o movimento nas cenas S08 e S09, o que gerou 4 trechos parados; (2) o `check` apontou 2 contratos (camadas de quadro inteiro devem iniciar com opacidade 0; z-index do carimbo); (3) mapas como clipes do Remotion mais deriva lenta. O aviso `text_occluded` do carimbo continuou no check.
- **Telemetria do HyperFrames:** desligada. O "beacon" da skill não foi executado. O `doctor` sugere instalar um modelo de música de licença não comercial; não instalar (R13).
- **Iterações usadas:** B 2 de 3; A 1; C 1; A-HF 3 de 3.

## 2026-11-19: imagens do Flow (estilo A)
- 7 prompts × 2 variações, Nano Banana 2.1, 16:9, **0 créditos**, 1376×768 JPG. Prompts em `lab/bakeoff-2026-11/bakeoff/flow-prompts.md`.
- **Download:** o navegador do app Claude não salva arquivos (3 métodos falharam, R8). **Claude in Chrome funcionou**: o ícone ↓ de cada grupo gera `download.zip` em `~/Downloads`. Os 7 zips foram baixados em ~1 min. Runbook atualizado.
- **Consistência:** as 7 cenas mantêm o mesmo traço e a mesma paleta Lacre (vermelho-cera, bege, azul-ardósia). A3 (corte real) saiu em fila diagonal.
- **Chroma key:** `colorkey 0x00FF00 sim=0.30 + despill` em A3 e A6 deu recorte limpo, sem halo verde. Arquivos em `media/lab/bakeoff-2026-11/flow/cut/`.
- Aprendizado: o Flow nomeia o arquivo com o conteúdo da imagem (ex.: `Crowds_boarding_boats_in_Lisbon_*.jpg`); a identificação do prompt se faz por esse nome.

## 2026-11-19: rodada 2 (a pedido do usuário)
- **Feedback do usuário:** a v1 não servia para decidir: A, C e A-HF eram praticamente o mesmo vídeo (C mistura A e B; A-HF repete A), os mapas eram idênticos, faltava a versão 100% código e faltavam FX, som, legendas, zooms e momentos de impacto. A prévia do B também não chegou ao celular (reenviada).
- **Correção de processo:** comparar só estilos genuinamente diferentes, com o mesmo pacote de FX/som em todos, para que a única variável seja o estilo.
- **Sound design sintetizado** (`pipeline/assembly/sound_design.py`): drone em Ré menor, swells, ambientes (ondas, chuva, murmúrio), sino, tambor cadenciado, whooshes nas transições, impactos (carimbo e título), baques. Sem samples de terceiros. A trilha abaixa sob a voz (ducking). Gera `fx.json` com 21 eventos que a camada visual usa para sincronizar flash, tremor e zoom.
- **Camada visual comum** (`studio/remotion/src/lacre/fx.tsx`): zoom de impacto, tremor de câmera, flash e queimadura quente, desfoque de transição, pulso de vinheta e legendas palavra a palavra (a palavra falada acende; texto vem do roteiro).
- **Mapas por estilo:** A em papel claro, B em carta náutica envelhecida, D em carta noturna com rota laranja.
- **Estilo D (código puro):** céu, relevo em camadas, água, navios, torre, multidão, casario, palmeiras e silhueta de Napoleão, tudo em SVG procedural. 2 iterações (silhueta de Napoleão e multidão ficaram fracas na 1ª).
- **QA:** os 3 em −14,7 LUFS, 0 trechos parados; render de 39 a 54 s.
- C e A-HF foram descartados desta rodada. O motor segue Remotion.

## 2026-11-19: rodada 3, mix contido (feedback: excesso e descasamento de som/efeito)
- **Critério permanente criado:** R16 em `CLAUDE.md`, `rubrics/sound-fx.md` (F1–F10), validador `pipeline/validate/fx_check.py`, aprendizado L01 e decisão de rodízio de estilos (experimento E1).
- **Prova de que o validador reflete o que o usuário ouviu:** o mix v2 reprovou em 12 verificações. Voz só 5,5 dB acima do fundo (mín. 16), 66% das janelas de fala com fundo a menos de 10 dB, 8 whooshes em 40 s, 4 impactos pesados, eventos a 0,05 s um do outro, 21 de 21 eventos sem motivo registrado.
- **Mix v3:** 12 eventos (1 whoosh, 2 impactos, 1 acento, 4 batidas suaves de tambor, 2 sinos, 1 silêncio intencional, 1 empurrão de câmera), todos com `reason`. Trilha e ambiente a ~20% sob a voz. Impactos e flash/tremor/zoom reduzidos.
- **Resultado:** `fx_check` PASS: F7 em 4,6% das janelas (limite 5%), mediana voz/fundo 29,4 dB; F8 sem piora na transcrição (4,7% = voz sozinha).
- **Atenção, honestidade sobre o método:** na 1ª passada o F7 ainda reprovava (25%). Parte do motivo era a métrica, que contava o grave profundo dos impactos, que quase não mascara a fala. Passei a medir na faixa da fala (200–4000 Hz) **e** baixei de fato os sons que invadiam a fala (sino de abertura, marcha, swell, ondas). Os dois ajustes juntos levaram ao PASS.
- **Risco de exagero oposto:** a margem agora é grande (29 dB) e F7 está a 0,4 p.p. do limite; os impactos podem estar sutis demais. Quem decide é o ouvido do usuário.
- Prévias: A3, B3 e D3 em `media/lab/bakeoff-2026-11/render/` (só A3 foi enviada).

## 2026-11-19: rodada 4 (o usuário validou o teste e quer avançar o fluxo)
- **Feedback:** mix melhorou muito; os impactos podem ser um pouco mais firmes; faltou som no movimento do mapa (linha da rota); a voz às vezes parecia baixar. O usuário considera os testes validados e quer avançar para o fluxo completo até o agendamento.
- **Mudanças:** rubrica F11 (som para movimento relevante), 7 sons de movimento (varredura de linha em S04 e S06, pin na chegada a Salvador, ticks de etiqueta, selo caindo), impactos reforçados no grave (o estalo no agudo foi mantido curto para não encobrir a fala), nivelamento suave da voz, flash e tremor levemente maiores (dentro de F9).
- **Validação:** `fx_check` PASS depois de 3 ajustes: F7 passou de 6,1% para 5,2% e depois para 3,9% (limite 5%), mediana voz/fundo 27,8 dB, transcrição do mix idêntica à da voz (4,7%). O ajuste foi mover o ruído da "linha traçada" para o agudo e estreitar o estalo do impacto.
- **QA dos vídeos:** A4, B4 e D4 em −14,2 LUFS, 0 paradas. Só o A4 foi enviado.
- **Estilos futuros e kits** anotados em `lab/style-ideas.md`. Fluxo completo e ordem de construção em `protocols/production-pipeline.md`.

## 2026-11-19: reorganização (laboratório separado da produção)
- Os documentos, a mídia e o código do teste foram movidos para `lab/bakeoff-2026-11/`, `media/lab/bakeoff-2026-11/` e `studio/remotion/src/lab/bakeoff/`. O motor HyperFrames e suas skills foram para `lab/`.
- A camada de FX (`studio/remotion/src/lacre/fx.tsx`) deixou de importar dados do teste: agora recebe eventos e palavras por parâmetro (`<Shell events words>`). A biblioteca de produção não depende de nada em `lab/`.
- Verificação: `tsc` sem erros e as três composições (A2, B2, D2) renderizam com imagens, legendas e carimbo nos novos caminhos.

## 2026-11-19: esboços de logotipo
- 16 esboços (8 direções × 2) gerados no Flow (0 créditos). Ver `lab/brand-sketches-2026-11/README.md`. Tarefa nova para a operação: o usuário quer ver variações antes de fixar o logotipo; o refinamento final é feito em código.
