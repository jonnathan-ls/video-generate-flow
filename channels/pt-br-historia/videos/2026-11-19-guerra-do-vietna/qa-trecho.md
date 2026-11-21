# QA do trecho: Cena 01 (S01.mp4, 15,7 s)

Revisor independente (R6), 2026-11-19. Arquivo: `media/pt-br-historia/vietna/render/S01.mp4` (1920x1080, 30 fps).
Base: `rubrics/visual.md`, `rubrics/sound-fx.md`, `protocols/shot-planning.md`.

## Veredito: REFAZER

Melhorou muito em relação ao mapa estático: 4 tomadas, nenhuma parada, sons de marcador e de rota no tempo certo. Mas há 4 FAIL de validador/medição e 3 notas abaixo de 4 (V2, V5, V7). Não vai ao usuário assim.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py` | PASS | `PASS S01` |
| `freezedetect` (n=0,002, d=2 s) | PASS | nenhum trecho parado |
| Loudness (alvo -14 LUFS) | FAIL | integrado -15,2 LUFS (1,2 LU abaixo); true peak -0,7 dBFS (acima de -1 dBTP, recomendação usual; aviso) |
| `fx_check.py` eventos (F1–F6, F11) | FAIL | `F11: a cena S01 (map) tem movimento de mapa/rota sem som associado (sweep)` |
| `fx_check.py --voice` (F7) | FAIL | 81,0% das janelas de fala com fundo a menos de 10 dB; mediana 4,1 dB (mín. 16) |
| `fx_check.py --asr` (F8) | PASS | erro voz 0,0% · mix 0,0% |

Como rodei o `fx_check.py` (o script espera fx/scenes/words em formato de vídeo inteiro): adaptadores em scratchpad com `{"events": S01_mix.events.json, "duration": 15.7}`, uma cena `{"id":"S01","kind":"map","start":0,"end":15.7}` e as palavras de `props/S01.json`. Voz reamostrada de 24 kHz para 48 kHz (o script não reamostra; sem isso F7 sai inválido). Mix = áudio extraído do `S01.mp4`. Rodado com `.venv/bin/python` (o python do sistema não tem `soundfile`).

Observações sobre os FAIL:
- **F11** é falha de formato, não de ausência de som: os eventos de rota usam `kind: "draw_sweep"` (fora do vocabulário `sweep`) e o `reason` é texto livre, não `word:<palavra>` / `scene:S01`. Consequência: o F6 automático não checa nenhum evento. Corrigir o JSON (`kind: "sweep"`, `reason: "word:pediu"`, `"word:outro"`, `"word:registra"`; pins com `word:Unidos`, `word:Brasil`, `word:mundo`).
- **F7**: medindo direto nas pausas da fala (3,0 s, 10,5 s, 13,0 s), o fundo fica cerca de 22 a 25 dB abaixo do nível da voz, e a razão mix/voz varia de 5 a 12 dB ao longo do trecho (ganho não constante). Isso indica que a voz foi processada (compressão/EQ/limitador) no mix, e a subtração do validador deixa resíduo de voz. Provável falso negativo, mas não verificado. Correção: passar ao `--voice` o stem de voz **já processado** que entra no mix (ou exportar o stem de "tudo menos voz") e rodar de novo. Sem PASS, não aprova.
- **Loudness**: normalizar para -14 LUFS com true peak ≤ -1 dBTP.

### F1, F4, F6, F11 verificados à mão

| Evento | t (s) | Palavra / gatilho | Δ | Resultado |
|---|---|---|---|---|
| pin ESTADOS UNIDOS | 4,54 | "Unidos" 4,64 (offset -0,1) | -0,10 | OK |
| sweep rota EUA→Brasil | 5,02 | "pediu" 5,02 | 0,00 | OK (linha só fica visível perto de 5,9 s; ver D9) |
| pin BRASIL | 6,66 | "Brasil." 7,16 (offset -0,5) | -0,50 da palavra, mas no tempo do marcador na tela | OK com o visual; fora de ±0,3 da palavra |
| sweep rota Brasil→Vietnã | 9,04 | "outro" 9,24 (offset -0,2) | -0,20 | OK |
| pin VIETNÃ | 10,24 | "mundo." 9,94 (+0,3) | +0,30 | OK (no limite) |
| sweep destaque do documento | 13,06 | "registra" 13,36 (-0,3) | -0,30 | OK (no limite) |

- F1: 7/7 com `reason`, mas nenhum no formato exigido (`word:`/`scene:`). Parcial.
- F4: eventos não menores (bed 0,0; sweeps 5,02 / 9,04 / 13,06) a ≥ 4 s um do outro. OK.
- F11: rotas e marcadores têm som. Faltam: entrada da cartela "DEZEMBRO 1965" (0,0–0,5 s, sem `label`) e entrada do documento (10,6 s, sem som de papel). Não verifiquei de ouvido se o som do sweep dura o mesmo que o traço.

## Rubrica visual (0–5; mínimo 4 em todos)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | Paleta única (azul-petróleo, dourado, creme, vermelho de destaque) e a mesma serifada em cartela, marcadores e cabeçalho do documento (sheetA/sheetB). O fundo marrom do documento destoa um pouco do azul dos mapas, mas lê como o mesmo vídeo. |
| V2 Profundidade | 3 | Camadas existem (mapa, grade, rota/marcadores, poeira, vinheta), mas não há parallax visível: marcadores e rota andam presos ao mapa, a poeira quase não aparece nos mapas (quadros 4,7 s, 7,4 s, 9,6 s). Mapas planos. |
| V3 Movimento | 5 | `freezedetect` sem nenhum trecho parado; câmera sempre em deriva/zoom. |
| V4 Ritmo | 4 | Cortes em ~3,0 / 7,9 / 10,6 s (tomadas de 3,0 / 4,9 / 2,7–3,0 / 5,1 s). Ressalva: tomadas 2 e 3 são as duas `map-zoom`, o que contraria a regra 4 do `shot-planning.md` ("duas tomadas seguidas não repetem o mesmo tipo de visual"); `shot_check` deixou passar. |
| V5 Tipografia | 3 | 2 famílias, hierarquia clara. Mas: subtítulo do documento ("GOVERNO DOS ESTADOS UNIDOS · DEZEMBRO DE 1965") ilegível em 640x360 (quadro de 13,5 s reduzido); legendas quebram depois de preposição/artigo ("…AO PRESIDENTE DO" / "BRASIL." em 6,9–7,7 s; "E EXISTE UM DOCUMENTO DO" em 10,8 s; "…QUE REGISTRA O" em 13,5 s). |
| V6 Atmosfera | 4 | Raios de luz e poeira na cartela (0–3 s), vinheta em todas, raios sobre a mesa do documento. Nos mapas a atmosfera se resume a vinheta e grade. |
| V7 Rótulos de contexto | 3 | Rótulos presentes (data, EUA, Brasil, Vietnã, cabeçalho com data), mas o marcador VIETNÃ está em (106°E, 16°N), que fica no Laos, não no Vietnã (a fronteira nessa latitude passa perto de 106,6°E). A rota termina dentro do texto "VIETNÃ". |

## Defeitos concretos (com tempo)

| # | t (s) | Defeito | Correção |
|---|---|---|---|
| D1 | 7,9–8,2 | Dissolve entre dois mapas desalinhados: aparecem **dois rótulos "BRASIL"** lado a lado e dois contornos de continente fantasmas. | Corte seco ou continuidade de câmera (a tomada 3 começa no enquadramento final da 2), ou esconder rótulos antes do dissolve. |
| D2 | 10,2–10,6 | Marcador VIETNÃ em 106°E 16°N cai no Laos. | Usar coordenada dentro do Vietnã (ex.: Da Nang 108,2°E 16,1°N, ou Saigon 106,7°E 10,8°N). |
| D3 | 9,4–10,6 | Rota passa por baixo/através do texto "BRASIL" na saída e termina dentro do texto "VIETNÃ" na chegada. | Rótulo do Brasil à esquerda/abaixo do pino; rota parar no pino, rótulo do Vietnã acima ou à direita. |
| D4 | 10,6–15,7 | Tomada fraca: documento genérico com barras cinza no lugar do texto, apresentado como "o" memorando. O destaque vermelho sublinha uma linha sem conteúdo. O documento real (FRUS 1964–68 v. XXXI, doc. 225, Bundy a Johnson, 31/12/1965) é de domínio público. | Mostrar o documento real (recorte da página FRUS ou recriação com o texto verdadeiro) e destacar a frase "made a very strong pitch on the troops". |
| D5 | 3,0–7,7 | "o embaixador… pediu soldados ao presidente" mostra só países. Regra 4 do `shot-planning.md`: pessoa → retrato ou nome em tipografia. | Pôr os nomes (Lincoln Gordon, Castelo Branco) junto aos marcadores, ou uma tomada de nome. Observação: Gordon estava no Brasil; a seta Washington → Brasília sugere que o pedido veio de lá. Aceitável como "EUA → Brasil", mas o rótulo de pessoa resolve a ambiguidade. |
| D6 | 6,9–7,7; 10,8; 13,5 | Quebra de legenda depois de preposição/artigo ("DO" / "BRASIL."). | Quebrar por unidade de sentido. |
| D7 | 12–15,7 | Subtítulo vermelho do documento ilegível em 360p. | Aumentar ~2x ou remover. |
| D8 | 3,0–3,2 | Dissolve com o "1965" sobre os continentes: número atravessado por contornos, fica turvo. Menor. | Fade do texto antes do mapa entrar. |
| D9 | 5,02–5,9 | Som do traço começa em 5,02 s, mas a linha só aparece na tela por volta de 5,9 s (quadros 5,1 e 5,5 sem linha). Não ouvi; verificar se o som "anda" antes do traço. | Alinhar início do sweep com o primeiro quadro visível da linha. |
| D10 | 0,0 e 10,6 | Cartela de data e entrada do documento sem som próprio (F11). | `label` suave em 0,2 s; papel em 10,6 s. |
| D11 | todo | Loudness -15,2 LUFS; true peak -0,7 dBFS. | Normalizar -14 LUFS, TP ≤ -1 dBTP. |
| D12 | events.json | `draw_sweep` e `reason` em texto livre derrubam F11 e desligam a checagem F6. | Ver acima. |

## Processo (para R9, sugestão)
- `shot_check.py` não pega duas tomadas seguidas do mesmo `kind` (regra 4). Vale adicionar.
- `fx_check.py` não reamostra a voz (24 kHz × 48 kHz) e não tem modo "uma cena"; o produtor deve gravar o stem de voz processado para o F7.

## Artefatos da revisão
Quadros e adaptadores em `/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/` (g1.jpg, g2.jpg, g3.jpg, route.jpg, s360.jpg, fx.json, scenes.json, words.json).

---

# Ciclo 2 (último, R6) — 2026-11-19

Arquivo: `media/pt-br-historia/vietna/render/S01.mp4` (1920x1080, 30 fps, 15,7 s; áudio 48 kHz mono). Mix: `S01_mix.wav` (gerado por `pipeline/assembly/vietna_mix_scene.py`; reproduzi o mix em scratchpad e o resultado saiu **byte a byte idêntico**, então os achados de áudio abaixo valem para o arquivo entregue).

## Veredito: REFAZER (ciclo 2 esgotado → escalar ao usuário com o diagnóstico)

O visual subiu: todas as notas V1–V7 agora ≥ 4, e 9 dos 12 defeitos do ciclo 1 foram resolvidos. Não aprovo porque `fx_check.py` (eventos) continua **FAIL** (5 erros) e porque há 2 defeitos reais novos/remanescentes (som do destaque do documento atrasado; dissolve mapa→documento com rótulos fantasmas). Parte do FAIL do F11 é **erro meu no ciclo 1**: recomendei `reason: "word:<palavra>"` para os sweeps, mas o F11 do validador só aceita sweep cujo `reason` termina com o id da cena (`scene:S01`). A recomendação era incompatível com o validador.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py scenes_spec.json props/` | PASS | `PASS S01` |
| `freezedetect` (n=0,002, d=2 s) | PASS | nenhum trecho parado |
| Loudness (alvo -14 LUFS, TP ≤ -1 dBTP) | PASS | `ebur128` no áudio do MP4: integrado **-14,5 LUFS**, true peak **-1,1 dBTP**, LRA 0,8 LU. Tolerância usada: ±1 LU (o repositório não define tolerância; registrar uma). Obs.: o 1º passe do `loudnorm` caiu em `normalization_type: dynamic` (ganho linear necessário estouraria o pico), por isso não chega a -14,0. |
| `fx_check.py` eventos (F1–F6, F11) | **FAIL** | ver abaixo (5 erros) |
| `fx_check.py --voice` (F7) | PASS (com ressalva) | Stem correto **não foi entregue**: `voz/S01.wav` é a voz crua (24 kHz) e com ela F7 dá FAIL (79,4%, mediana 3,7 dB), igual ao ciclo 1. Reconstruí o stem processado reproduzindo o script (`level_voice` + pico -3 dB + ganho do `loudnorm`): (a) envelope de ganho medido mix_saída/mix_cru aplicado à voz → **0,0% janelas < 10 dB, mediana 22,1 dB**; (b) voz passada pelo mesmo filtro `loudnorm` → 0,0%, mediana 30,0 dB. PASS nas duas. |
| `fx_check.py --asr` (F8) | PASS | voz 0,0% · mix (áudio do MP4) 0,0% · +0,0 p.p. (faster-whisper medium) |

Saída do `fx_check.py` (adaptadores em scratchpad `c2/`: `fx.json` = `S01_mix.events.json` + duração 15,7; uma cena `{"id":"S01","kind":"map"}`; palavras de `props/S01.json`):
```
[FAIL] F6: pin@6.66s está a 0.50s da palavra 'brasil' (máx. 0,3)
[FAIL] F6: pin@10.24s está a 0.30s da palavra 'mundo' (máx. 0,3)
[FAIL] F6: sweep@5.37s está a 0.35s da palavra 'pediu' (máx. 0,3)
[FAIL] F6: whoosh@10.75s está a 0.61s da palavra 'documento' (máx. 0,3)
[FAIL] F11: a cena S01 (map) tem movimento de mapa/rota sem som associado (sweep)
```

### Leitura dos FAIL (som × imagem, medido quadro a quadro)

| Evento | t (s) | O que a tela mostra (medição) | Diagnóstico |
|---|---|---|---|
| sweep rota EUA→Brasil | 5,37 (dura 1,74 s) | traço vermelho começa a aparecer em ~5,45–5,5 s e cresce até ~6,9 s | **Alinhado com a imagem.** O FAIL é de formato: o som segue o movimento, não a palavra. |
| pin BRASIL | 6,66 | marcador aparece com a chegada da rota | Alinhado com a imagem; formato. |
| sweep rota Brasil→Vietnã | 9,39 (1,4 s) | traço aparece em ~9,35–9,4 s, termina ~10,3–10,5 s | Alinhado; formato. |
| pin VIETNÃ | 10,24 | 0,30 s da palavra (limite; falha por arredondamento de ponto flutuante) | Formato/limite. |
| whoosh documento | 10,75 | documento entra em dissolve a partir de 10,6 s | Alinhado com a imagem; formato. Obs.: o relato diz "som de papel", mas o script usa `sd.whoosh(0.45)` (kind `whoosh`). Aceitável por F3 (salto mapa → documento), mas não é papel. |
| **sweep destaque do documento** | **13,41** (0,7 s) | destaque rosa começa em **13,05 s** e já está ~90% desenhado em 13,35 s | **Defeito real**: o deslocamento fixo de +0,35 s, pensado para a rota do mapa, foi aplicado também ao documento. O som chega depois do movimento (viola F11 "o som acompanha o movimento"). |
| label data | 0,35 | "1965" entra entre 0,0 e 0,5 s | OK (F6 PASS) |

**Bug de validador encontrado (para R9):** o F11 testa `reason.endswith(scene_id)`, então `motion:S01@5.37` (formato que o próprio F6 aceita) não satisfaz o F11; só `scene:S01`/`motion:S01` sem offset passam. E o F6 ignora o offset quando `visual: false`, ou seja, eventos de movimento sem flash visual não têm o tempo checado. Hoje não existe formato de `reason` que (a) diga "este som segue um movimento da tela em t" e (b) passe F6 com checagem de tempo e F11 juntos.

## Rubrica visual (0–5; mínimo 4)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | Mesma paleta e mesma serifada na cartela, mapas, cartões de nome ("LINCOLN GORDON", "CASTELO BRANCO") e cabeçalho "MEMORANDUM". O fundo marrom da mesa do documento ainda destoa do azul dos mapas (folha de contato, 10,6–15,7 s). |
| V2 Profundidade | 4 | Camadas: mapa+grade, rota/marcadores, partículas que ficam paradas na tela enquanto o mapa se move (verificado em 3,6 / 4,6 / 5,6 s: o ponto de poeira fica na mesma posição de tela e a costa da África sobe), cartões de nome fixos sobre o mapa em movimento, vinheta. A "neblina em movimento" não ficou visível nos quadros que realcei; não confirmei. Nota no limite. |
| V3 Movimento | 5 | `freezedetect` sem trecho parado. |
| V4 Ritmo | 4 | Tomadas 0–3,0 / 3,0–8,0 / 8,0–10,6 / 10,6–15,7 s. Corte em 8,0 s com continuidade de câmera: o enquadramento em 7,97 s e 8,03 s é o mesmo, rótulo "BRASIL" no mesmo lugar, sem fantasma (D1 resolvido). `shot_check` agora checa repetição de tipo com continuidade. |
| V5 Tipografia | 4 | Legendas quebram por sentido: "O EMBAIXADOR DOS ESTADOS UNIDOS" / "PEDIU SOLDADOS AO PRESIDENTE" / "DO BRASIL."; "E EXISTE UM DOCUMENTO" / "DO GOVERNO AMERICANO QUE REGISTRA" / "O QUE ACONTECEU DEPOIS." (D6 resolvido). Documento legível em 640x360 (data e citação; quadro 14,0 s). Ressalva: subtítulo dos cartões ("embaixador dos EUA", "presidente do Brasil") fica com ~7 px de altura em 360p; o nome em si é legível. |
| V6 Atmosfera | 4 | Raios e poeira na cartela; partículas e vinheta nos mapas; luz sobre a mesa do documento. |
| V7 Rótulos de contexto | 5 | Data (cartela), nomes das duas pessoas no momento em que são citadas (3,36 s e 6,36 s), países, e documento com data e fonte ("FRUS 1964–68, vol. XXXI, doc. 225 · memorando de Bundy a Johnson · trecho"). Marcador do Vietnã agora no sul da península da Indochina, região de Saigon (quadro 10,45 s ampliado), rota termina no pino e o rótulo fica à direita (D2, D3 resolvidos). |

## Checagem da fonte do documento (FRUS225)
Abri https://history.state.gov/historicaldocuments/frus1964-68v31/d225. Confirmado: título "Memorandum From the President's Special Assistant for National Security Affairs (Bundy) to President Johnson in Texas"; linha "Washington, December 31, 1965, noon."; a frase diz que, na reunião em que Gordon falou do empréstimo a Castello Branco, "he made a very strong pitch on the troops". O texto na tela, `Gordon "made a very strong pitch on the troops"`, é fiel (Gordon fora das aspas, como sujeito). Data e cabeçalho na tela batem. O resto do documento aparece como barras cinza, identificado como "trecho": aceitável como recriação, já que a citação e a referência são reais.

## Defeitos (ciclo 1 → ciclo 2)

| # | Situação | Evidência |
|---|---|---|
| D1 dissolve com 2 "BRASIL" | Resolvido | corte em 8,0 s, quadros 7,97/8,03 s |
| D2 Vietnã no Laos | Resolvido | pino em 106,7°E 10,8°N, quadro 10,45 s |
| D3 rota sobre os rótulos | Resolvido | 9,7–10,5 s |
| D4 documento genérico | Resolvido | trecho real destacado, fonte conferida |
| D5 sem nomes | Resolvido | cartões em 3,36 s e 6,36 s |
| D6 quebra de legenda | Resolvido | ver V5 |
| D7 subtítulo do doc ilegível | Resolvido | 360p, 14,0 s |
| D8 "1965" sobre os contornos | **Parcial** (menor) | em 3,05 s o "1965" ainda está a ~30% de opacidade sobre os contornos do mapa: o texto some junto com a entrada do mapa, não antes. |
| D9 som do traço antes da linha | Resolvido para as rotas; **regrediu no documento** | ver D14 |
| D10 data e documento sem som | Resolvido (label 0,35 s; whoosh 10,75 s) | |
| D11 loudness | Resolvido | -14,5 LUFS / -1,1 dBTP |
| D12 formato dos eventos | **Não resolvido** | `fx_check` FAIL (F6 x4, F11) |
| **D13 (novo)** dissolve mapa→documento | 10,6–10,9 s | Durante o dissolve aparecem "VIETNÃ", "BRASIL" e a rota tracejada atravessando o documento e o texto "MEMORANDUM" (quadro 10,7 s). Mesmo tipo de problema do D1. Correção: apagar rótulos/rota antes do dissolve (fade de 0,2 s em 10,4 s) ou corte seco com o whoosh. |
| **D14 (novo)** sweep do destaque atrasado | 13,05 s (imagem) × 13,41 s (som) | Não aplicar o +0,35 s ao destaque do documento (som em ~13,05 s) e encurtar para a duração real do destaque (~0,35–0,5 s). |
| **D15 (novo, processo)** stem de voz não exportado | — | `vietna_mix_scene.py` não grava a voz processada; o F7 só passou com reconstrução minha. Exportar `S01_voice.wav` (voz depois de `level_voice`, pico e ganho final) junto do mix. |

## Correções para fechar (todas mecânicas)
1. `events.json`: eventos que seguem a imagem e não a palavra (sweeps das rotas, pin BRASIL, pin VIETNÃ, whoosh do documento) com `reason` de movimento ligado à cena; manter `word:` só onde o som cai na palavra (label "dezembro", pin "Unidos").
2. Corrigir `fx_check.py` (R9): extrair o id da cena de `scene:`/`motion:` antes do F11 (em vez de `endswith`) e checar o offset de `motion:S01@t` mesmo com `visual: false`. Corrigir também a comparação de 0,3 s com tolerância de ponto flutuante.
3. D14: tirar o +0,35 s do sweep do documento.
4. D13: limpar rótulos e rota antes do dissolve para o documento.
5. D15: exportar o stem de voz processado e rodar `--voice` com ele.
6. (Menor) D8: fade do "1965" terminar antes de 3,0 s.

Depois disso, rodar de novo `fx_check.py` (eventos, `--voice`, `--asr`); se tudo PASS, o trecho pode ir ao usuário para V8.

## Artefatos do ciclo 2
Scratchpad `/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/c2/`: `sheet.jpg` (folha 2 fps), `grid1.jpg` (corte 8,0 s e Vietnã), `grid2.jpg` (D8 e D13), `z.jpg`, `doc360.jpg`, `par.jpg`, `mixrepro.py` (reprodução do mix + export de voz), `voice_env.wav`, `rep.voice.wav`, adaptadores `fx.json`/`scenes.json`/`words.json`/`ref.txt`.
