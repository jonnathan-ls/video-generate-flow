# QA independente: lote 1 do Vietnã (S02, S03, S04, S05 acabamento, S06)

- Revisor: agente `reviewer`, ciclo 1 de 2 (R6) · data: 2026-11-20
- Objeto: `media/pt-br-historia/vietna/render/S02.mp4` a `S06.mp4` (renders de 11:43 a 11:47; 28,1 / 9,9 / 22,7 / 28,5 / 32,0 s; 1920×1080, 30 fps), `scenes_spec.json`, `render/props/S02–S06.json`, `Sxx_mix.events.json`, `studio/remotion/src/vietna/scene.tsx`, `lab/plan-vietna-lote1.md`, `sources.md` (FLOW-LOTE1, HAI46, ICO-*), `script.md`.
- Método: validadores rodados por mim (abaixo); quadros na palavra de cada ação; séries de quadros consecutivos a 30 fps (diplomata 6,4–6,8 s; coluna brasileira 10,0–10,4 s), a 15 fps (pernas 10,0–10,5 s), a 10 fps (bandeiras 8,0–8,8 s do S03 e 11,5–12,3 s do S04; explosão 21,2–22,0 s), a 6 fps (bandeiras da multidão 20,0–21,0 s; atracação 13,3–14,6 s), a 3 fps (entrada dos moradores 1,0–3,3 s do S04); recortes em resolução cheia; quadros reduzidos a 640×360 e ampliados (rótulos e bandeiras); análise de pixels verdes na borda dos 15 PNG do lote; leitura do código de `scene.tsx` (fatias, passada, tremor, clarão, flash).
- Fontes reabertas nesta revisão: FRUS225 (history.state.gov d225), HAI46 (indochine.uqam.ca), ICO-FR46 (Wikipedia CEFEO), AID2 (Wikisource, Pentagon Papers p. 43), AID (Miller Center), ICO-C47 (Wikipedia Operation Castor), ICO-BRFLAG (Wikipedia Flag of Brazil), COM (Wikimedia Commons CH-53).
- Learnings aplicáveis: L01 (som só com motivo e dentro do orçamento), L02 (movimento relevante tem som com a duração do movimento), L03 (voz nivelada). Defeitos que não podem voltar: D1–D13 e N1–N3 de `qa-piloto-s05.md`.
- Folhas de contato da produção (`S02_sheet.jpg` a `S06_sheet.jpg`) não foram alteradas: md5 igual antes e depois; `scene_gates.py` rodou sobre links em scratchpad.

## Veredito: REFAZER

Motivos:
1. Quatro defeitos de prioridade alta: bandeiras em tiras com emendas visíveis em 360p (S03 t3, S04 t4); guindaste que não iça (cabo descendo do céu, S06 t3); tropa de Haiphong que surge do nada no cais, em escala 4 a 5 vezes maior que o navio e desenhada na frente da perna do guindaste (S05 t3).
2. Notas abaixo do mínimo: V10 = 3 em todas as cenas e no lote; V5 = 3 no S04 e no lote; V1 = 3 no S03. Média do lote 3,89 (mínimo 4,3).
3. A passada das colunas (D2 do piloto) continua sem articulação: as colunas de S02 t3, S03 t1, S04 t1 e S05 usam o padrão `gait` 9 (inclinação da metade de baixo), que inclina as duas pernas juntas; a figura desliza. Só o embaixador (S02 t2) tem passada configurada, e mesmo assim parcial.

Os validadores automáticos passaram todos. O lote acerta a sincronia (quase todas as ações caem na palavra), a explosão do S05 melhorou muito (imagem do Flow, sem retângulos) e o apagão agora apaga as janelas. Os problemas são de credibilidade física e de legibilidade, que os validadores não medem.

## Validadores (rodados pelo revisor)

| Item | S02 | S03 | S04 | S05 | S06 |
|---|---|---|---|---|---|
| `shot_check.py` (cópia do spec, props da produção) | PASS | PASS | PASS | PASS | PASS |
| cota mapa/texto/doc sem cena | PASS: 0% de 121 s | | | | |
| freezedetect (`scene_gates.py`) | PASS, nenhum | PASS | PASS | PASS | PASS |
| Loudness (informativo) | −14,6 LUFS, pico −1,6 | −14,6 / −1,6 | −14,9 / −1,6 | −14,8 / −1,4 | −14,8 / −1,7 |
| `fx_check.py` F1–F6, F11 | PASS (13 eventos, 0 pesados, 0 whoosh) | PASS (7) | PASS (12) | PASS (15, 1 pesado) | PASS (17) |
| F7 `--voice` (janelas < 10 dB · mediana) | PASS 2,5% · 27,4 dB | PASS 1,2% · 23,8 dB | PASS 3,0% · 22,2 dB | PASS 0,8% · 24,3 dB | PASS 3,2% · 25,9 dB |
| F8 `--asr` (referência: texto das palavras de `props/Sxx.json`) | PASS voz 0,0% · mix 0,0% · +0,0 p.p. | PASS 13,8% · 13,8% · +0,0 | PASS 1,5% · 1,5% · +0,0 | PASS 0,0% · 1,6% · **+1,6 p.p.** | PASS 0,7% · 0,7% · +0,0 |
| F9 (revisão de `scene.tsx`) | PASS: tremor só em fx `explosion` (7,5 px), clarão 0,33; o S05 não usa mais fx `explosion` (a explosão é ator do Flow), então não há tremor; o flash de câmera do S06 é luz local, não clarão de tela; eventos `flash` com `visual: true` | | | | |

Observações: o F8 do S05 ficou em +1,6 p.p., perto do limite de 2; a explosão em "usina elétrica" é o trecho provável. O erro de 13,8% da voz sozinha no S03 aparece igual no mix (provável normalização de "vinte" e "dez" escritos por extenso contra números na transcrição); não é problema do mix.

## Ação por tomada

| Cena · tomada | O que se move | Bate com a fala? | Crível? |
|---|---|---|---|
| S02 t1 · 0,0–4,4 | pasta "EMPRÉSTIMO" desliza e para (1,58–2,43) | sim: para em 2,43, "empréstimo" 2,33; "US$ 150 milhões" em 3,19 | parcial: a pasta para em cima da base da luminária (2,7 e 3,3 s), atravessando um objeto que tem volume |
| S02 t2 · 4,4–8,4 | embaixador entra e anda (5,51–8,35) com passada | sim: em quadro em "embaixador" (6,01); nome em 6,01 | parcial: em 5,7 s ele aparece sobre a folha da porta aberta, não no vão; no vão (6,0 s) tem cerca de 75% da altura que a porta pede; as pernas abrem e fecham pouco, a passada fica sempre aberta (12 quadros, 6,4–6,8 s); velocidade cerca de 0,4 altura/s, lenta mas aceitável porque ele também vem em direção à câmera. Não chega à mesa como diz o plano |
| S02 t3 · 8,4–11,9 | coluna de 6 soldados brasileiros (54→89,8%) | sim: "TROPAS" em 8,85 | **não**: pernas na mesma pose em 12 quadros consecutivos (10,0–10,4 s), só a metade de baixo inclina; emendas verticais das fatias cortam botas e coronhas dos vizinhos (10,0–10,5 s, ampliado); um soldado de calça vermelha. Velocidade cerca de 0,7 altura/s (ok). A coluna sai pela direita antes do corte (11,6 s) |
| S02 t4 · 11,9–17,2 | duas pastas se afastam (13,49–14,19) e voltam (16,01–16,66) | sim: "separados" 13,89; "mesma" 16,41 | sim. Ao se juntar, "TROPAS" cobre o fim de "EMPRÉSTIMO" ("EMPRÉSTI", 16,8 s) |
| S02 t5 · 17,2–19,7 | máquina escreve "RIO DE JANEIRO / 17 DEZ 1965 / TELEGRAMA 1456" | sem palavra-gatilho; a fala é "O que o presidente respondeu?" | sim (letras surgem no papel; o carro da máquina não anda). O telegrama 1456 é o relato da reunião, não a resposta do presidente: a imagem e a fala falam de coisas diferentes (baixo) |
| S02 t6 · 19,7–23,6 | memorando entra (até 20,18), selo cai (20,25–20,55), pasta sai (21,86–22,66) | sim: "resposta" 19,83, "documento" 20,55, "fim" 22,21 | sim |
| S02 t7 · 23,6–28,1 | calendário volta de 1965 a 1945 | sim: começa em "Antes" (23,88), chega a 1945 perto de "pedido" (27,07) | sim |
| S03 t1 · 0,0–4,2 | moradores com bandeirinhas andam (−14→24,7%) | sim, desde 0,1 | parcial: passada só inclinada; o grupo ocupa o canto esquerdo |
| S03 t2 · 4,2–7,2 | CH-53 cruza o céu com pás girando | sim: "SAIGON 1975" em 6,63 | movimento sim; época **duvidosa**: casco bege com faixas vermelhas e azuis (6,2 s, recorte cheio). O CH-53 dos fuzileiros em 1975 não usava esse esquema |
| S03 t3 · 7,2–9,9 | bandeira do Brasil "tremula" | sim: "BRASIL / 1965" em 9,07 | **não**: a bandeira ondula em 8 tiras verticais que sobem e descem; losango e círculo quebram em degraus e as emendas aparecem até em 640×360; a tralha se solta do mastro (vão de cerca de 10 px). O desenho vetorial chapado e saturado destoa da pintura do fundo |
| S04 t1 · 0,0–4,4 | moradores andam da direita para a esquerda | sim (entram em cerca de 1 s) | parcial: pés na calçada, escala boa; passada só inclinada |
| S04 t2 · 4,4–7,3 | multidão de costas em fatias que sobem e descem | sim: "HO CHI MINH" em 4,53 | parcial: o movimento é de 9 px por fatia, difícil de ver em 640×360; o resto da multidão (no fundo) está parado |
| S04 t3 · 7,3–10,6 | multidão em fatias | sim: "≈ 500 mil" em 9,55 | parcial: o plano diz "punhos e bandeiras se agitam", mas as bandeiras são do fundo e não se mexem (8,0–8,8 s) |
| S04 t4 · 10,6–13,3 | bandeira vietnamita no mastro | sim: "Ba Đình" em 11,03 | **não**: mesmas tiras com emendas visíveis em 360p e estrela em degraus (11,5–12,3 s); a tralha se solta do mastro |
| S04 t5 · 13,3–19,2 | Declaração americana desliza (14,02–14,82), a francesa (16,36–17,26) | sim: "americana" 14,77, "Homem" 17,21 | parcial: os documentos ficam em pé, no plano da tela, sem perspectiva da mesa; a americana passa da borda da mesa e fica flutuando na frente do tampo (14,8 e 18,8 s). A etiqueta não cobre a Declaração (conferido em 14,8 e 17,3 s); ela cobre a chaminé da lamparina |
| S04 t6 · 19,2–22,7 | multidão em fatias; som de aclamação em "reconheçam" | o som cai em 20,65; a imagem não muda | parcial: as duas bandeiras grandes do primeiro plano estão paradas em 6 quadros (20,0–21,0 s) |
| S05 t1 · 0,0–6,5 | navio entra e para; fumaça; esteira branca | sim | sim: a fumaça nasce na boca da chaminé (1,3–5,0 s); espuma visível na linha d'água (D6 e D12 resolvidos) |
| S05 t2 · 6,5–9,0 | coluna no cais a cerca de 0,7 altura/s | sim | parcial: pés no cais; pernas sem passada real |
| S05 t3 · 9,0–15,8 | navio entra no porto e para (13,65); tropa aparece no cais (13,7) e anda | sim: para em 13,65, "desembarcam" 13,70 | **não**: o navio para na ponta do cais, sem encostar ao longo dele; a tropa surge por fade no meio do cais (13,7–13,9 s, transparente no quadro de 13,8 s), sem prancha nem descida; cada soldado tem a altura da chaminé do navio (escala 4 a 5 vezes maior; 15,2 s); a coluna passa na frente da perna do guindaste, que deveria ficar na frente dela |
| S05 t4 · 15,8–22,8 | fumaça clara nas chaminés; holofotes; tiros (20,0–21,2); explosão do Flow (21,22); apagão por `bg2` (21,35); chamas no telhado | sim: tiros em "ataca", explosão em "usina" (21,20) | sim: explosão com forma de chama e fumaça (21,5–22,0 s); janelas apagadas de fato (22,6 s); fumaça das chaminés visível (D3 e D5 resolvidos). As chamas do telhado são uma faixa reta (22,6 s), aceitável |
| S05 t5 · 22,8–28,5 | coluna a y 82%; chamas nas fachadas; fumaça | sim | parcial: base acima da legenda (24,5 s, N2 resolvido); pernas sem passada |
| S06 t1 · 0,0–3,0 | cargueiro entra e para (0,0–2,2) | sim: para perto de "francês" (1,90); rótulo em 1,9 | parcial: para no meio do rio, longe do cais (2,5 s); o plano diz "chega ao cais" |
| S06 t2 · 3,0–5,8 | pasta "PENTÁGONO" desliza | sim: "Documentos" 3,58 | sim |
| S06 t3 · 5,8–10,2 | caixotes sobem do navio, cruzam e descem no cais (5,9–8,9) | sim: "ajuda americana começa" (5,38–6,24) | **não**: o cabo desce do alto da tela, sem guindaste sobre o navio; o guindaste do cais não gira nem mexe a lança; a carga passa na frente da torre do guindaste e pousa na base dele (6,5 / 7,5 / 8,4 / 9,5 s). "US$ 10 milhões" cobre o navio |
| S06 t4 · 10,2–16,2 | C-47 com cocar francês cruza o vale; 3 paraquedas descem | sim: avião em "1954" (10,66); "78%" em 13,12 | sim no avião; paraquedas abertos já ao aparecer, idênticos (cor, tamanho, balanço) |
| S06 t5 · 16,2–21,0 | jipe cruza o acampamento com poeira | o jipe só fica visível perto de 17,5 s ("Miller" 16,68) | parcial: anda sobre o terreno escuro ao lado das trincheiras, não numa estrada; pequeno; em "três" (20,1) o "3/4" do texto grande fica em cima do jipe (20,2–20,4 s) |
| S06 t6 · 21,0–27,0 | 4 flashes de câmera | sim: "entrevista" 24,16, "Eisenhower" 25,76 | sim; fora dos flashes nada se move, mas nenhum vão passa de 1,0 s |
| S06 t7 · 27,0–32,0 | 1ª peça balança (27,6), cai em "cai" (28,83); as outras em sequência | sim | sim; um só som para 7 peças caindo (L02 pede som com a duração do movimento) |

## Rubrica visual por cena

### S02 (média 4,22)
| # | Nota | Evidência |
|---|---|---|
| V1 | 4 | Mesmo traço e luz nas 7 tomadas (folha de contato); pastas e etiquetas iguais às do S06 |
| V2 | 4 | Fundo + ator + raios/poeira + rótulo em todas; sem parallax (nenhum `pan`/`depth` no lote) |
| V3 | 4 | Sempre há algo andando; mas a coluna desliza (10,0–10,4 s) |
| V4 | 5 | 7 tomadas de 2,5 a 5,3 s, cada uma com outro tipo de ação |
| V5 | 4 | Etiquetas legíveis em 360p; "TROPAS" fica a cerca de 50 px da coluna em 8,95 s; a sublinha quebra "NO / VIETNÃ" (9,4 s) |
| V6 | 4 | Raios, poeira, fumaça do cinzeiro |
| V7 | 5 | "LINCOLN GORDON / embaixador dos EUA no Brasil", "MEMORANDO DE 31/12/1965", "RIO DE JANEIRO / 17 DEZ 1965 / TELEGRAMA 1456" |
| V9 | 5 | Todas as ações a ±0,4 s da palavra (tabela acima) |
| V10 | 3 | Coluna sem passada e com emendas; soldado de calça vermelha; farda de 1965 sem referência (pendência aberta pelo próprio produtor); embaixador sobre a folha da porta (5,7 s); pasta sobre a luminária |

### S03 (média 3,89)
| # | Nota | Evidência |
|---|---|---|
| V1 | 3 | A bandeira desenhada por código (verde e amarelo chapados) e o CH-53 bege com faixas coloridas destoam dos fundos pintados (folha de contato) |
| V2 | 4 | Fundo + ator + luz + rótulo |
| V3 | 4 | Movimento em todas as tomadas |
| V4 | 4 | 3 tomadas de 2,7 a 4,2 s |
| V5 | 4 | "1945", "SAIGON 1975", "BRASIL 1965" legíveis; "HANÓI" (rótulo de cima) com contraste baixo em 360p |
| V6 | 4 | Raios e névoa (t1), fumaça (t2), nuvens (t3) |
| V7 | 5 | Hanói 1945, Saigon 1975, Brasil 1965 batem com a fala |
| V9 | 4 | Ações no tempo; a única ação de t3 é a bandeira, que não convence |
| V10 | 3 | Bandeira em tiras com emendas e solta do mastro (8,0–8,8 s); esquema de cores do CH-53 duvidoso |

### S04 (média 3,89)
| # | Nota | Evidência |
|---|---|---|
| V1 | 4 | Fundos coerentes; as declarações são fac-símiles reais, aceitável para documento |
| V2 | 4 | Multidão recortada sobre multidão de fundo; sem parallax |
| V3 | 4 | Algo se mexe sempre, mas em t2, t3 e t6 é só o sobe e desce de 9 px das fatias |
| V4 | 4 | 6 tomadas de 2,7 a 5,9 s |
| V5 | 3 | "HANÓI · 2 DE SETEMBRO" dourado escuro sobre céu rosa, mal se lê em 360p (2,0 s); "PRAÇA BA ĐÌNH" quase ilegível sobre a multidão (10,3 s); sublinha "PRAÇA DE HANÓI, 2 DE SETEMBRO DE 1945" clara sobre multidão clara (12,5 s) |
| V6 | 4 | Raios, névoa, luz da lamparina |
| V7 | 5 | "HO CHI MINH / lê a declaração", "≈ 500 mil", "Ba Đình", "Estados Unidos, 1776", "França, 1789" |
| V9 | 4 | Declarações chegam na palavra; a reação em "reconheçam" é só som |
| V10 | 3 | Bandeira em tiras (11,5–12,3 s); bandeiras do fundo paradas (8,0–8,8 e 20,0–21,0 s); documentos em pé flutuando na frente da mesa (14,8 e 18,8 s) |

### S05 (média 4,11)
| # | Nota | Evidência |
|---|---|---|
| V1 | 4 | Igual ao piloto aprovado; Haiphong no mesmo traço |
| V2 | 4 | Sem parallax |
| V3 | 4 | Movimento em todas; pernas sem passada |
| V4 | 4 | Sem mudança |
| V5 | 4 | Rótulos legíveis; "É O COMEÇO DA GUERRA" aparece duas vezes ao mesmo tempo, no texto e na legenda (25,4–27,5 s) |
| V6 | 5 | Luz, fumaça, holofotes, brasas, fogo |
| V7 | 5 | "HAIPHONG · MARÇO DE 1946" entra em "março" |
| V9 | 4 | O navio para em "desembarcam", mas a tropa surge em vez de descer |
| V10 | 3 | Escala e camada da tropa de Haiphong (15,2 s); capacetes azulados e botas vermelhas na coluna (8,0 s) |

### S06 (média 4,11)
| # | Nota | Evidência |
|---|---|---|
| V1 | 4 | Coerente; avião e jipe no mesmo traço |
| V2 | 4 | Sem parallax |
| V3 | 4 | Movimento sempre; em t6 só os flashes |
| V4 | 5 | 7 tomadas de 2,8 a 6,0 s, com tipos de ação diferentes |
| V5 | 4 | "1954" (rótulo de cima do "78%") quase ilegível em 360p (14,0 s); "3/4" cobre o jipe (20,2 s) |
| V6 | 4 | Raios, fumaça, poeira do jipe, cone de luz da luminária |
| V7 | 5 | "INDOCHINA FRANCESA 1950", "estudo encomendado em 1967", "7 DE ABRIL DE 1954 / entrevista coletiva", "DWIGHT EISENHOWER", "PRINCÍPIO DO DOMINÓ" |
| V9 | 4 | Na palavra, mas o guindaste não faz a ação que o plano promete |
| V10 | 3 | Cabo saindo do céu (6,5–9,5 s); cargueiro parado longe do cais; paraquedas idênticos; jipe fora da estrada |

### Lote
| # | Nota | Justificativa |
|---|---|---|
| V1 | 4 | Coerente no conjunto; S03 t3 é o ponto fora |
| V2 | 4 | 3 ou mais camadas sempre; nenhuma tomada usa parallax (`pan`/`depth` ausentes nos 5 props) |
| V3 | 4 | freezedetect PASS; colunas deslizando em 5 tomadas |
| V4 | 4 | 28 tomadas de 2,5 a 7,0 s, tipos variados |
| V5 | **3** | rótulos de cima com contraste baixo (S03, S04, S06); texto em cima de ator (S06 t5) |
| V6 | 4 | atmosfera em 28/28 tomadas |
| V7 | 5 | rótulo em toda troca de lugar ou data |
| V9 | 4 | sincronia boa; três ações principais não acontecem como descrito (bandeiras, guindaste, desembarque) |
| V10 | **3** | ver defeitos A1–A4 e M1 |

**Média do lote: 3,89.** Mínimo para aprovar: todas ≥ 4 e média ≥ 4,3.

## Som e efeitos

| Regra | Resultado | Evidência |
|---|---|---|
| F1–F8, F11 | PASS | tabela de validadores |
| F9 | PASS | ver validadores |
| `sweep` de câmera | descasado (médio) | Eventos `sweep` "movimento de câmera da cena ilustrada" em S02 4,5 s, S03 4,3 s, S04 13,4 s, S05 0,1 s e S06 0,1 s. Nessas tomadas a câmera só faz zoom de 3 a 6%; não há movimento que o som acompanhe (F6: "som fora do que a cena mostra é erro") |
| Camas de movimento (D13) | OK no papel | notas de 19 a 24 dB abaixo da voz, dentro da faixa do protocolo; o usuário precisa ouvir |
| Dominós (L02) | baixo | um único `hit` em 28,83 s para 7 peças caindo até cerca de 31 s |
| Reação em "reconheçam" | baixo | som de aclamação sem mudança na imagem |
| Duplicatas (D8) | OK | nenhum evento repetido |

## Fidelidade e texto na tela (R1)

| Item | Situação | Detalhe |
|---|---|---|
| Gordon, empréstimo de US$ 150 milhões, pressão por tropas, "separamos" | OK | FRUS225: "the same meeting in which Gordon told Castello Branco about the loan" e "we separated the $150 million program loan from the issue of troops". A lista de pessoas do FRUS dá "Gordon, A. Lincoln, Ambassador to Brazil" |
| "MEMORANDO DE 31/12/1965" | OK | FRUS225: "Washington, December 31, 1965" |
| "RIO DE JANEIRO / 17 DEZ 1965 / TELEGRAMA 1456" | OK | nota do FRUS225: "telegram 1456 from Rio de Janeiro, December 17" |
| HANÓI 1945 / SAIGON 1975 / BRASIL 1965 | OK | contas da fala (20 anos antes, quase 10 depois); COM: CH-53, Saigon, 29/04/1975, domínio público |
| Cor do CH-53 | **AJUSTAR (médio)** | COM confirma o tipo, não a cor. O recorte é bege com faixas vermelhas e azuis; os CH-53 dos fuzileiros em 1975 eram de cor escura, verde ou cinza (conhecimento geral; conferir na própria foto do COM) |
| Bandeira do Brasil com 22 estrelas | OK | ICO-BRFLAG: "increased from 21 to 22 on 21 April 1960" e "A 23rd star was added on 30 May 1968" |
| Ba Đình, ≈ 500 mil, declarações de 1776 e 1789 | OK | HO45 (conferido no ciclo do piloto) |
| Haiphong, março de 1946, "desembarcam", ≈ 15 mil | OK | HAI46: navios para "land some 10,000 troops in Haiphong" e tiros chineses "on French ships entering Haiphong harbor" em 6/3; 15 mil segue com HO45. A imagem não precisa mostrar 15 mil |
| Uniforme francês de 1946 (ICO-FR46) | **fraco (baixo)** | A página diz "Mostly organized and equipped along American lines" sobre o corpo como planejado, e só lista "French, British, American" no equipamento; não fala de capacete nem de 1945–46. Os capacetes no render saem azulados e as botas vermelhas (8,0 s) |
| Farda brasileira de 1965 | **SEM FONTE (médio)** | pendência registrada pelo produtor; o recorte tem um soldado de calça vermelha |
| C-47 francês em 1954 | OK | ICO-C47: "took 65 of the 70 operational C-47 Dakota". O cocar não está na fonte, mas é coerente |
| Jipe Willys francês | **SEM FONTE (baixo)** | pendência registrada pelo produtor |
| US$ 10 milhões em 1950; 78% em 1954 | OK | AID2: "began modestly with $10 million in 1950" e "accounted for 78% of the cost of the French war burden" |
| "mais de 3/4", Miller Center | OK com ajuste no registro | A página diz "paying more than 75 percent of the French costs of the war" (1954). O `sources.md` cita "over three-quarters", que não é o texto da página: corrigir a citação |
| "estudo encomendado em 1967" | OK | PP |
| 7/4/1954, entrevista, dominó | OK | AID2 (UCSB, lido pelo revisor anterior) |
| Licença Flow (R13) | pendente | bloqueia publicação, não o lote |

## Recorte

- Halo verde: nenhum. Zero pixels de borda (alfa 10–245) com verde dominante nos 15 PNG do lote. O verde opaco da `bandeira_br.png` é a própria bandeira.
- Emendas de fatias: visíveis nas bandeiras (até em 360p) e na coluna brasileira (botas e coronhas cortadas na divisa das fatias, em resolução cheia).
- Camadas: tropa de Haiphong desenhada na frente da perna do guindaste; carga do S06 na frente da torre do guindaste.

## Defeitos priorizados

| # | Prioridade | Cena · tempo (s) | Defeito | Correção acionável |
|---|---|---|---|---|
| A1 | alta | S03 7,2–9,9 · S04 10,6–13,3 | Bandeiras ondulam em tiras verticais com emendas visíveis em 360p; estrela, losango e círculo quebram em degraus; a tralha se solta do mastro | Trocar o modo `wave` em fatias por deformação contínua: malha (ex.: `displacementMap` em SVG com `feTurbulence` animado, ou um PNG por quadro com seno aplicado por coluna de pixel no `vietna_prep.py`), com a borda da tralha fixa (amplitude zero em x = 0 e crescendo até a ponta). Ou gerar no Flow 3 ou 4 poses da bandeira ao vento e alternar a cada 4 a 6 quadros. Conferir em 360p |
| A2 | alta | S06 5,8–10,2 | O guindaste não iça: o cabo desce do alto da tela sobre o navio, a lança não se move, a carga passa na frente da torre e pousa na base dela | Ancorar o cabo na ponta da lança (pegar a coordenada da polia no fundo) e mover a carga só no raio da lança; ou recortar a lança como ator e girá-la (`rot`) enquanto a carga anda; ou trocar a ação pela carga descendo pelo pau de carga do próprio navio. Desenhar a carga atrás da torre quando passar por ela |
| A3 | alta | S05 13,65–15,8 | A tropa surge por fade no cais, sem descer do navio; cada soldado tem a altura da chaminé (4 a 5 vezes a escala do navio); passa na frente da perna do guindaste; o navio para na ponta do cais, sem encostar ao longo dele | Levar o navio até ficar paralelo ao cais (trajeto com `path` terminando ao lado da escada) e aumentar o navio ou reduzir a tropa até um soldado ter cerca de 1/8 da altura da chaminé; fazer a coluna sair de uma prancha ou da escada do cais, sem fade; colocar a coluna atrás do guindaste ou mudar o trajeto para não cruzá-lo |
| A4 | alta (D2 que voltou) | S02 8,4–11,9 · S03 0,1–4,2 · S04 0,0–4,4 · S05 6,5–9,0, 13,8–15,8, 23,0–28,4 | Colunas sem passada articulada: o `gait` padrão 9 inclina a metade de baixo inteira; as pernas ficam na mesma pose (12 quadros, 10,0–10,4 s do S02). O protocolo novo diz "sem `gait`, a figura desliza", e nenhuma dessas colunas tem `gait` configurado | Ciclo de caminhada com 2 a 4 poses do Flow (mesma coluna, pernas em fases diferentes) trocadas a cada 4 a 6 quadros, ou separar as pernas por soldado e girar cada perna no quadril em fase oposta. Conferir com 12 quadros consecutivos antes de enviar |
| M1 | média | S04 2,0 · 10,3 · 12,5; S03 2,0; S06 14,0 | Rótulos de cima ("HANÓI · 2 DE SETEMBRO", "HANÓI", "PRAÇA BA ĐÌNH", "1954") e sublinha "PRAÇA DE HANÓI…" com contraste baixo; "PRAÇA BA ĐÌNH" quase ilegível em 360p | Faixa escura translúcida ou sombra forte atrás do texto pequeno; cor clara (papel) em vez do dourado escuro quando o fundo é claro ou cheio de detalhe; letra alta ≥ 27 px em 1080p |
| M2 | média | S06 20,1–21,0 | "mais de 3/4" cobre o jipe na palavra "três" | Parar o jipe antes do texto ou mudar o texto para o lado direito / mais alto nessa tomada |
| M3 | média | S04 7,3–10,6 · 19,2–22,7 | Bandeiras grandes do fundo paradas enquanto a fala e o plano pedem multidão agitando bandeiras | Recortar 1 ou 2 bandeiras em primeiro plano como atores com ondulação contínua (mesma técnica de A1) ou mascarar as bandeiras do fundo |
| M4 | média | S04 13,3–19,2 | Declarações em pé, no plano da tela, uma delas passando da borda da mesa e flutuando na frente do tampo | Deitar o papel na mesa com perspectiva (transformação `perspective` + `rotateX` de 50 a 60°) ou mostrar o papel numa prancheta/parede; manter a base do papel dentro do tampo |
| M5 | média | S03 4,2–7,2 | CH-53 bege com faixas vermelhas e azuis | Conferir a cor na foto do COM; regenerar ou tingir (`tint`) para verde-oliva/cinza escuro sem faixas coloridas |
| M6 | média | S02 4,4–8,4 | Embaixador aparece sobre a folha da porta em 5,7 s e tem cerca de 75% da altura que o vão pede; não chega à mesa | Começar o trajeto dentro do vão (x do vão no fundo), `h` maior no início, ou máscara para a porta ficar na frente; terminar perto da mesa |
| M7 | média | S02 4,5 · S03 4,3 · S04 13,4 · S05 0,1 · S06 0,1 | Som `sweep` de "movimento de câmera" sem movimento visível (zoom de 3 a 6%) | Remover esses `sweep` ou ligá-los a um movimento real |
| M8 | média | S02 8,4–11,9 · S06 16,2–21,0 · S05 6,5–28,5 | Iconografia sem fonte ou fraca: farda brasileira de 1965 (com um soldado de calça vermelha), jipe Willys francês, uniforme francês de 1946 (capacete azulado, botas vermelhas) | Registrar referência iconográfica em `sources.md` (foto de domínio público ou página que descreva a peça e o ano); tingir calça e botas para cáqui/marrom |
| B1 | baixa | S02 1,58–4,4 | Pasta pousa sobre a base da luminária | Parar a pasta mais à esquerda, sobre o mata-borrão |
| B2 | baixa | S02 8,95 | "TROPAS" a cerca de 50 px da coluna; sublinha quebra "NO / VIETNÃ" | Começar a coluna mais à direita ou deslocar o texto; sublinha em uma linha |
| B3 | baixa | S06 0,0–3,0 | Cargueiro para no meio do rio; o plano diz "chega ao cais" | Terminar o trajeto junto ao cais |
| B4 | baixa | S06 11,3–16,2 | Três paraquedas idênticos (cor, tamanho, balanço) e já abertos ao aparecer | Variar escala, rotação e período; abrir em 0,3 s (`grow`) |
| B5 | baixa | S06 16,2–21,0 | Jipe pequeno, em área escura, fora da estrada | Trajeto sobre a estrada clara; `h` maior |
| B6 | baixa | S05 25,4–28,5 | "É O COMEÇO DA GUERRA" na tela e na legenda ao mesmo tempo | Deixar só "França × Viet Minh" ou trocar a primeira linha por dado |
| B7 | baixa | S02 16,0–17,2 | "TROPAS" cobre o fim de "EMPRÉSTIMO" | Juntar as pastas com menos sobreposição |
| B8 | baixa | S06 27,6–31,0 · S04 20,65 | Um só som para 7 dominós; aclamação sem resposta visual | Som de peças com a duração da queda; braços subindo em "reconheçam" |
| B9 | baixa | `sources.md` AID | Citação "over three-quarters" não é o texto da página | Trocar por "paying more than 75 percent of the French costs of the war" |
| B10 | baixa | S02 17,2–19,7 | Telegrama (relato da reunião) na tela enquanto a fala pergunta pela resposta do presidente | Aceitável; se refizer, digitar a máquina na frase anterior ou usar a pasta do memorando aqui |

## Pontos levantados pelo produtor, conferidos

| Ponto | Confere? | Onde |
|---|---|---|
| Bandeiras rígidas | sim, e pior: as do mastro têm emendas visíveis; as do fundo não se mexem | A1, M3 |
| Multidões com movimento sutil | sim: 9 px por fatia, pouco visível em 360p | V3 do S04 |
| Atores pequenos (tropa no cais, jipe em área escura) | jipe sim (B5); a tropa no cais de Haiphong é o contrário: grande demais para o navio | A3 |
| Paraquedas iguais | sim | B4 |
| Rótulo de data com pouco contraste (S04 t1) | sim, e o mesmo acontece em S03 t1, S04 t3/t4 e S06 t4 | M1 |
| "TROPAS" encostando na coluna (S02 t3) | quase: cerca de 50 px de folga em 8,95 s | B2 |
| Etiqueta cobrindo a Declaração (S04 t5) | não: a etiqueta fica acima do papel (14,8 e 17,3 s); cobre a lamparina | M4 trata do problema real da tomada |
| `sweep` de câmera sem movimento real | sim, em 5 cenas | M7 |

## O que está bom e deve ser mantido

- Sincronia: 25 das 28 ações caem a ±0,4 s da palavra (pastas, selo, declarações, explosão, flashes, dominós).
- S05: fumaça na boca da chaminé, espuma na linha d'água, explosão do Flow, apagão real e coluna acima da legenda (D3, D5, D6, D12, N2 resolvidos).
- Recortes sem halo verde nos 15 PNG.
- Texto na tela: todos os números, datas e nomes conferidos nas fontes (exceto as pendências iconográficas).
- Voz: F7 com mediana de 22 a 27 dB; F8 sem perda (S05 em +1,6 p.p., perto do limite).

## Para o ciclo 2 (último, R6)

Corrigir A1–A4 (bloqueiam) e M1–M8 (o protocolo pede todas as médias). Rodar de novo `shot_check.py`, `scene_gates.py` e `fx_check.py --asr`, e mandar ao revisor junto com: 12 quadros consecutivos de cada coluna andando, 8 quadros consecutivos de cada bandeira, quadros em 640×360 dos rótulos de M1 e quadros de S05 13,5–15,8 e S06 5,8–10,2 a 5 fps. Se o ciclo 2 não aprovar, escalar ao usuário com este diagnóstico (R6/R8). Um ponto que vale perguntar ao usuário já: a passada articulada (A4) depende de gerar poses extras no Flow (custo 0 em Nano Banana) ou de recortar pernas; se as duas falharem duas vezes, registrar em `mistakes.md` e escalar (R8).

## Ciclo 2 — revisão com nota (2026-11-21 00:42, Gemini, âncora S05)
| Cena | Média | Veredito | Defeitos altos |
|---|---|---|---|
| S02 | 3,00 | REFAZER | embaixador flutua e desliza; coluna desliza sem passada |
| S03 | 3,22 | REFAZER | moradores deslizam; helicóptero rápido demais |
| S04 | 3,10 | REFAZER | multidão já começa com braços erguidos; declarações entram por pop-in |
| S05 | 3,44 | REFAZER | "plano final fotorrealista" (**o maestro discorda**: a folha mostra o mesmo estilo pintado); explosão da usina não aparece nos quadros |
| S06 | 3,40 | REFAZER | caixote grande demais no guindaste; "mais de 3/4" sem imagem que ilustre |

**Gates determinísticos:** shot_check, scene_gates e render_check PASS nas 5. transcript_check: "Ba Dinh" (S04) e "Eisenhower" (S06) ouvidos errado pelo Whisper; pode ser pronúncia do TTS (conferir de ouvido). "há/a" (S03) é falso positivo.
**Leitura do maestro (folhas reduzidas S05, S06):** estilo coerente entre as tomadas, composição boa. Defeito recorrente real: passada fraca das colunas (3 poses em `frames` não bastam ou são parecidas demais). Fim do 2º ciclo → escalado ao usuário (R6/R8). Prévia: `media/pt-br-historia/vietna/render/previa_lote1_c2.mp4`.
