# QA independente: piloto híbrido da cena 4 (S04)

- Revisor: agente `reviewer`, ciclo 1 (R6) · data: 2026-11-20
- Objeto: `media/pt-br-historia/vietna/render/S04.mp4` (22,73 s, 1920×1080, 30 fps), spec `scenes_spec.json` (S04), código `studio/remotion/src/vietna/plates.tsx` (ImgPlate) e `shots.tsx` (PairShot)
- Método: quadros extraídos em 0,2 / 1,7 / 3,3 / 3,5 / 6,0 / 8,8 / 9,0 / 10,5 / 11,7 / 12,0 / 12,2 / 13,5 / 15,5 / 18,9 / 19,1 / 21,0 / 22,6 s; série a 10 fps com diferença entre quadros; recortes ampliados; comparação com as 4 imagens originais do Flow; leitura das 3 fontes (Country Study 22 e as duas páginas do Commons).

## Veredito: REFAZER

Motivos: V2 = 2, V3 = 3 e V5 = 3 (abaixo do mínimo 4); `fx_check` FAIL (F6); anacronismo visível (mausoléu de Ho Chi Minh, construído em 1973–75, na tomada rotulada "PRAÇA DE BA DINH"); dupla exposição (fantasma) em todas as tomadas com imagem do Flow.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py` | PASS | S04 PASS (todas as cenas PASS) |
| freezedetect (via `scene_gates.py`) | PASS | nenhum trecho parado ≥ 2 s no limiar 0,002 |
| Loudness | informativo | −14,9 LUFS, pico −1,7 dBFS |
| `fx_check.py` F1–F7 | **FAIL** | `[FAIL] F6: paper@12.27s está a 1.10s da palavra 'declaracao' (máx. 0,3)` |
| F7 (voz) | PASS | 0,5% das janelas < 10 dB; mediana 29,3 dB |
| F8 (`--asr`) | PASS | erro voz 1,5% · mix 1,5% · diferença +0,0 p.p. |

Observação: `scene_gates.py` regrava `S04_sheet.jpg` como efeito colateral; a folha original foi restaurada a partir de cópia.

## Rubrica visual (V1–V7)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | As quatro imagens do Flow têm o mesmo traço (ilustração chapada, luz baixa, paleta sépia com vermelho). A tomada dos documentos (12,1–19,0 s) troca para mesa escura com mapa-múndi noturno e reproduções fotográficas: estilo diferente, mas é a convenção de documento dos lotes anteriores. |
| V2 Profundidade | **2** | Não há camadas reais. `ImgPlate` usa a **mesma imagem duas vezes**: a cópia de trás com escala `z0+(z1−z0)·t·0,55` e a da frente, mascarada abaixo do horizonte, com `·1,35`. Na faixa de transição da máscara (±9% em torno do horizonte) as duas cópias se sobrepõem com escalas diferentes e aparecem cabeças, chapéus, mastros e bandeiras **translúcidos e duplicados**: 6,0 s (faixa y≈400–600, multidão inteira), 10,5 s (y≈350–550, bandeiras e mastros duplos à direita), 21,0 s (bandeiras e sacadas duplicadas à direita, y≈550–750), 1,7 s (árvores e bandeiras ao centro, y≈500–750). O defeito cresce com o tempo de cada tomada, já que a diferença de escala cresce. A frente não "respira" de forma perceptível: o balanço é `sin(f/16)·sway·0,5` px (2,5 px no máximo) e rotação de 0,12°. |
| V3 Movimento | **3** | Freezedetect passa, mas a sensação é de **imagem parada com zoom**. O que se move: zoom/pan lento com easing (diferença entre quadros quase nula no início e no fim de cada tomada: 3,6–4,5 s, 7,5–8,4 s, 11,4–11,8 s, 19,2–19,8 s), poeira e raios quase invisíveis, tags entrando, números e cartas deslizando. O que **não** se move: bandeiras (nenhuma tremula), multidão (nenhum braço, nenhum chapéu), o orador, ciclistas e pedestres das ruas, fumaça/névoa da imagem. Na tomada dos documentos, de 12,9 a 15,3 s e de 15,9 a 18,9 s, só há o empurrão de câmera de 7% em 200 quadros (diferença entre quadros ≈0,7, o menor valor da cena). É exatamente o que o usuário reprovou ("praticamente imagens estáticas"). |
| V4 Ritmo | 4 | 5 tomadas em 22,7 s (3,4 / 5,5 / 3,2 / 6,9 / 3,75 s), todas ≤ 7 s, tipos diferentes. Ressalvas: 3,4→12,1 s são duas multidões quase iguais em seguida (crowd_a e crowd_b, mesmo enquadramento de fundo com palanque central), contra a regra 4 de `shot-planning.md`; 12,0–12,3 s tem mergulho para quase preto (luminância média 15–20) e mesa vazia enquanto a voz diz "Dinh". |
| V5 Tipografia | **3** | Duas famílias (serifa + sans), hierarquia correta. Mas os rótulos pequenos em latão com espaçamento largo somem: "2 DE SETEMBRO" (0,2–3,3 s) sobre céu claro e árvore escura, o "2" quase invisível em 1,7 s; "PRAÇA DE BA DINH" (9,5–12,0 s) em latão sobre multidão clara, ilegível na folha a 640×360. |
| V6 Atmosfera | 4 | Raios, poeira, névoa e grão em 5/5 tomadas; a poeira quase não se vê a 1080p. |
| V7 Rótulos | 4 | Data (0,3 s), nome (4,5 s), lugar "PRAÇA DE BA DINH" (9,5 s), documentos com país e ano. Falta "HANÓI" na tomada de abertura (a fala diz "em Hanói" em 2,7 s); o lugar só aparece 6 s depois. |

## Fidelidade histórica

| Ponto | Situação |
|---|---|
| Mausoléu de Ho Chi Minh no fundo de `crowd_b.jpg` | **Anacronismo grave.** O prédio de colunas no canto superior esquerdo é o mausoléu (inaugurado em 1975, 30 anos depois). Aparece de 8,9 a 12,0 s, exatamente sob o rótulo "PRAÇA DE BA DINH". Quem conhece a praça reconhece de imediato. `crowd_a.jpg` tem ao fundo, no centro, um pequeno pavilhão de colunas parecido; menos evidente, mas conferir. |
| Bandeiras vermelhas com estrela amarela | Corretas para o Viet Minh em 1945 (diferença de proporção da estrela do desenho de 1955 é imperceptível neste estilo). |
| Chapéus cônicos, roupas claras, quepes, palanque de madeira, microfone | Plausíveis para 2/9/1945. |
| Pessoas reais identificáveis | Nenhuma. O orador tem poucos pixels e não tem traços de Ho Chi Minh; o nome vem só da etiqueta. OK. |
| Ruas de Hanói (`hanoi_a`, `hanoi_b`) | Arquitetura colonial francesa, bandeiras nas fachadas: plausível. Os dois arquivos foram gerados como "amanhecer" (nomes originais `Hanoi_at_dawn_in_1945`, `Hanoi_boulevard_at_dawn_Septembe…`); não há afirmação de horário na fala, então não é erro, só não há fonte sobre a decoração das ruas. |
| Ligação imagem ↔ frase em 19,0–22,75 s | Fraca: "ele pede que os aliados reconheçam o novo país" sobre rua vazia ao amanhecer. Regra 2 de `shot-planning.md`. |

## Textos na tela vs. fala e fontes

| Texto | Fala | Fonte | Situação |
|---|---|---|---|
| "2 DE SETEMBRO / 1945" | "2 de setembro de 1945" | HO45 (Country Study 22): "On September 2, half a million people gathered in Ba Dinh Square" | OK |
| "HO CHI MINH · lê a declaração de independência" | idem | HO45: "to hear Ho read the Vietnamese Declaration of Independence" | OK |
| "PRAÇA DE BA DINH · ≈ 500 mil · pessoas, estimam as fontes" | "cerca de 500 mil" | HO45: "half a million people" | OK (a ressalva "estimam" é adequada; sources.md registra a outra estimativa de 400 mil) |
| Cartas "Declaração de Independência · Estados Unidos, 1776" e "Declaração dos Direitos do Homem e do Cidadão · França, 1789" | idem | HO45: "based on the American Declaration of Independence and the French Declaration of the Rights of Man and the Citizen" | OK |
| "RECONHECER O NOVO PAÍS · o pedido aos aliados" | "pede que os aliados reconheçam o novo país" | HO45: "an appeal to the victorious Allies to recognize the independence of Vietnam" | Fato OK, mas é texto decorativo que repete a fala sem ser dado (regra 6 de `shot-planning.md`) |

## Licença e conformidade

| Item | Situação |
|---|---|
| IMG-US | Domínio público confirmado na página do Commons ("mere mechanical scan or photocopy of a public domain original"). **Registro errado:** sources.md diz "NARA"; a página diz que é "a version of the 1823 William Stone facsimile" e não cita a NARA. Também diz "miniatura 1600 px", mas o arquivo tem 1280×1519. Corrigir o registro. |
| IMG-FR | Domínio público confirmado; pintura de Jean-Jacques-François Le Barbier, c. 1789, Musée Carnavalet (P809). Registrar o autor. Mesma divergência de tamanho (arquivo 1280×1623, registro diz 1600 px). |
| FLOW-S04: uso comercial | **Pendente.** sources.md diz "termos de uso comercial do plano a conferir antes da publicação" e `licenses.md` também manda verificar. R13 exige licença confirmada; não bloqueia o piloto, bloqueia a publicação. Registrar a conferência em `decisions.md`. |
| FLOW-S04: rastreabilidade | Os nomes do registro (hanoi_a, crowd_a…) não existem em `src_img/flow/`; lá estão `z29/` e `z30/` com nomes do Flow. Pelo tamanho em bytes: crowd_a = `Crowd_gathering_in_Ba_Dinh_c34a6d17.jpg`, crowd_b = `Crowd_gathering_in_Hanoi_a9e82508.jpg`, hanoi_a = `Hanoi_at_dawn_in_1945_6f4d89ec.jpg`, hanoi_b = `Hanoi_boulevard_at_dawn_Septembe…_d5fe8f27.jpg`. Registrar o mapeamento e os prompts usados. |
| Marcação "altered or synthetic content" (R14) | Decisão pelo critério de `policies-ai.md`: exige marcação o conteúdo **realista** que possa enganar; não exige para "animações e ilustrações claramente irreais". As 4 imagens são ilustração chapada de pôster, sem aparência de foto, e não mostram pessoa real identificável: **não exigem marcação por si**. Duas condições para manter essa decisão: (a) se qualquer imagem futura do Flow for fotorrealista, marcar; (b) o anacronismo do mausoléu tem de sair, porque é um lugar real retratado de forma falsa. Registrar a decisão em `decisions.md`. A frase do registro "só se o YouTube exigir" é vaga e deve ser substituída pela decisão. |
| Marca d'água visível | Nenhuma marca visível nas 4 imagens (SynthID é invisível). |

## Resolução

As imagens do Flow têm 1376×768. O `objectFit: cover` amplia 1,395× para 1080p e a camada da frente ainda aplica até 1,38× (crowd_b: z1 = 1,3, frente ×1,35 → 1,08+0,22·1,35 = 1,377), ou seja, até **≈1,9× de ampliação**. A perda é visível: rostos e chapéus viram manchas com artefato de JPEG nos recortes de 6,0 s e 10,5 s; medida de bordas (variância do filtro de bordas) cai de 1367 (crowd_b ampliada a 1920) para 261 no quadro de 12,0 s, e de 935 para 178 em hanoi_b (22,6 s). A 1080p em tela cheia o fim das tomadas de crowd_b e hanoi_b fica nitidamente mole.

## Sombra / vinheta nas bordas

A vinheta global foi reduzida a 0,3 (alpha máximo só nos cantos extremos) e não é mais o problema. Ainda escurecem as bordas: o degradê superior de 0,7 da cartela de data (0–3,4 s, `VietnaScene.tsx` linha 66) e o degradê lateral esquerdo de 0,7 da tomada de número (8,9–12,1 s, `shots.tsx` linha 23), que cobre 56% da largura. Em 10,5 s o terço esquerdo inteiro fica escuro. É aceitável para dar leitura ao texto, mas o usuário reclamou de sombra: preferir uma tarja local atrás do texto em vez de escurecer meio quadro. A tomada dos documentos tem cantos em luminância ≈9/255 por desenho (mesa escura).

## Som (`rubrics/sound-fx.md`)

- F6 FAIL: o som de papel da primeira carta está em 12,27 s, 1,10 s antes de "Declaração" (13,37 s). A carta entra na fala "o texto se inspira", o que faz sentido; corrigir a âncora (`word:inspira` ou `word:texto`) ou o `offset` da carta.
- O roteiro pede "som ambiente de multidão, baixo" para a cena 4; não há evento de multidão (só `bed`, 2 `sweep`, 2 `label`, 2 `paper`). As duas tomadas de multidão (3,4–12,1 s) estão mudas fora da trilha.
- O movimento de câmera de crowd_b (8,9–12,1 s) não tem `sweep` (F11 pede som em movimento relevante); baixa prioridade.

## Lista de defeitos (com tempo)

1. **3,4–12,1 s, 0–3,4 s e 19,0–22,75 s: dupla exposição** na faixa do horizonte (cabeças, bandeiras e mastros fantasmas). Pior em 6,0 s, 10,5 s e 21,0 s.
2. **8,9–12,0 s: mausoléu de 1975** no fundo, sob o rótulo "PRAÇA DE BA DINH".
3. **Toda a cena: nada age dentro da imagem.** Bandeiras, multidão, orador e pedestres parados; só zoom.
4. **12,9–15,3 s e 15,9–18,9 s: tomada dos documentos quase estática.**
5. **12,0–12,3 s: mergulho para quase preto** e mesa vazia; F6 FAIL em 12,27 s.
6. **8,9–12,1 s e 19,0–22,75 s: perda de nitidez** visível (até 1,9× de ampliação).
7. **0,2–3,3 s: "2 DE SETEMBRO" ilegível**; 9,5–12,0 s: "PRAÇA DE BA DINH" ilegível em 360p.
8. **3,4–12,1 s: duas multidões quase iguais em seguida.**
9. **19,0–22,75 s: rua vazia para "pede que os aliados reconheçam"**, com tag decorativa "RECONHECER O NOVO PAÍS".
10. **0–3,4 s: falta o rótulo "HANÓI".**
11. Registros: IMG-US com origem errada (NARA → fac-símile de William Stone, 1823); tamanho "1600 px" errado nos dois PD; mapeamento dos arquivos do Flow e prompts ausentes; uso comercial do Flow pendente; decisão de R14 não registrada.

## Correções acionáveis

1. **Profundidade real em vez de imagem duplicada.** Separar frente e fundo de verdade: gerar no Flow o fundo (céu, prédios, palanque) e a multidão em PNG separados, ou recortar a multidão com máscara e preencher o fundo por inpainting no Flow. Sem isso, pelo menos trocar a máscara para que a camada de trás nunca apareça por baixo da da frente (fundo sem a multidão), eliminando o fantasma. Com 3 camadas reais: céu/prédios, palanque e fileiras de trás, fileira da frente.
2. **Fazer algo acontecer na imagem.** Opções baratas e verificáveis: animar as bandeiras (recorte de cada bandeira grande + deformação senoidal em código, ou clipe curto de vídeo do Flow com a bandeira tremulando); punhos que sobem na fileira da frente (2–3 recortes com rotação); fumaça/névoa como camada própria em movimento; pedestres e ciclistas das ruas deslizando alguns pixels. Alternativa: gerar com o Flow um clipe de vídeo de 4–6 s a partir de cada imagem e usar como base, com o código por cima (tags, números). O critério de aceite: em cada tomada, pelo menos um elemento da imagem se move por conta própria, não só a câmera.
3. **Regenerar crowd_b sem o mausoléu** (prompt com "1945, before any mausoleum; colonial-era Ba Dinh square, open field, flagpole, wooden stage") e conferir crowd_a. Reverificar o fundo com recorte ampliado antes de usar.
4. **Nitidez:** ampliar as imagens do Flow com Real-ESRGAN (BSD-3, já em `licenses.md`) para ≥ 2752×1536 antes de usar, ou limitar o zoom total a ≤ 1,15× sobre o 1080p. Se o Flow permitir, gerar em resolução maior.
5. **Documentos:** destacar na carta americana a frase que Ho citou (marca-texto animado ou recorte ampliado de "all men are created equal") e na francesa o artigo 1; manter movimento até o fim da tomada. Remover o mergulho a preto em 12,0–12,3 s (corte direto ou carta já entrando).
6. **F6:** ancorar o som da primeira carta em `word:inspira` (ou mover a entrada da carta para 13,37 − 0,3 s) e rodar `fx_check` de novo.
7. **Tipografia:** rótulos pequenos com tarja escura local atrás (em vez de degradê de meia tela), corpo ≥ 36 px e contraste alto; "2 DE SETEMBRO" e "PRAÇA DE BA DINH" legíveis a 640×360.
8. **19,0–22,75 s:** trocar a imagem por algo ligado ao pedido (o orador visto de perto no palanque com microfone, ou bandeiras dos aliados ao fundo) e remover a tag "RECONHECER O NOVO PAÍS" ou trocá-la por dado.
9. **0–3,4 s:** acrescentar "HANÓI" na cartela de data.
10. Separar as duas multidões com a tomada de documento ou de rua no meio, ou usar enquadramentos realmente diferentes (palanque de perto vs. multidão aérea).
11. **Som:** adicionar ambiente de multidão baixo (com `reason` `scene:S04`, abaixo da voz por F7) de 3,4 a 12,1 s; `sweep` no movimento de crowd_b se o movimento for mantido.
12. **sources.md:** IMG-US: "fac-símile de William Stone (1823) do documento de 1776; Commons, domínio público", sem NARA; IMG-FR: autor Le Barbier; corrigir o tamanho dos arquivos (1280 px); FLOW-S04: mapear nome final → arquivo original e registrar os prompts; registrar a conferência dos termos comerciais do Flow (R13) e a decisão de R14 em `decisions.md`.

Depois das correções: rodar `scene_gates.py` (freezedetect + fx), `fx_check --asr`, `shot_check` e repetir este QA (ciclo 2 de 2).

---

# Ciclo 2 (último, R6)

- Revisor: agente `reviewer`, ciclo 2 de 2 · data: 2026-11-20
- Objeto: `media/pt-br-historia/vietna/render/S04.mp4` (22,73 s, 1920×1080, 30 fps), render de 01:02; `plates.tsx` (ImgPlate, linhas 561–590), `shots.tsx`, `scenes_spec.json` (S04), imagens novas `crowd_c.jpg` e `flag_a.jpg` (1376×768).
- Método: quadros em 0,2 / 1,7 / 3,3 / 3,5 / 6,0 / 8,8 / 9,0 / 10,5 / 11,7 / 12,0 / 12,2 / 12,5 / 13,5 / 15,5 / 17,5 / 18,9 / 19,1 / 21,0 / 22,6 s; folha a 2 fps; diferença entre quadros a 10 fps; luminância média quadro a quadro em 11,8–13,0 s; **medida da ondulação**: 31 quadros consecutivos (30 fps) em 4 tomadas de imagem e na tomada dos documentos (controle), campo de deslocamento por correlação de fase em blocos de 96 px, ajuste do movimento de câmera (translação + escala + rotação) e resíduo não rígido; recortes 1:1 e 2× da bandeira, do mastro e da multidão, comparados com a imagem original.
- `scene_gates.py` rodado sobre uma **cópia** da pasta de render (rascunho do revisor), para não regravar `S04_sheet.jpg`.

## Veredito: REFAZER (fim do ciclo 2: escalar ao usuário)

Motivos: V2 = 2, V3 = 3, V5 = 3 (mínimo 4 em todos). A ondulação nova cria um defeito visível: o mastro de `flag_a` (19,0–22,75 s) fica ondulado e muda de forma a cada quadro. Os validadores automáticos passam.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py` | PASS | S01–S10 PASS |
| freezedetect (`scene_gates.py`) | PASS | nenhum trecho parado ≥ 2 s (limiar 0,002) |
| Loudness | informativo | −14,9 LUFS, pico −1,6 dBFS |
| `fx_check.py` F1–F7 | PASS | 9 eventos, 0 pesados, 0 whooshes; F7: 0,5% das janelas < 10 dB, mediana 27,8 dB |
| F8 (`--asr`, referência = palavras do props) | PASS | erro voz 1,5% · mix 1,5% · diferença +0,0 p.p. |

## A ondulação é perceptível? (o que realmente se move)

Medida do movimento que sobra depois de descontar a câmera (pixels em 1080p, mediana / p90 dos blocos):

| Tomada | 1 quadro | 3 quadros | 10 quadros (0,33 s) |
|---|---|---|---|
| hanoi_a (1,0–2,0 s) | 0,19 / 0,47 | 0,45 / 1,67 | 2,06 / 7,27 |
| crowd_a (5,0–6,0 s) | 0,17 / 0,56 | 0,61 / 1,36 | 1,93 / 5,28 |
| crowd_c (10,0–11,0 s) | 0,24 / 0,69 | 0,52 / 1,83 | 2,75 / 8,62 |
| flag_a (20,0–21,0 s) | 0,30 / 0,75 | 0,62 / 2,01 | 1,96 / 5,17 |
| documentos (14,0–15,0 s), sem filtro: controle | 0,03 / 0,08 | 0,25 / 0,58 | 0,58 / 2,05 |

Conclusão: a ondulação existe e é mensurável (≈ 3–4× o ruído do controle; cerca de 6 px por segundo), mas **é uma deformação lenta e uniforme da imagem inteira**, não um elemento agindo. O mapa de resíduo por bloco é parecido no céu, nos prédios, nas cabeças e nas bandeiras. Na prática:

- **Bandeiras:** não tremulam. A bandeira grande de crowd_a (recortes de 5,0 / 5,5 / 6,0 / 6,5 s) muda um pouco o contorno e a ponta da estrela, mas as dobras não andam. Quem olha vê uma imagem "respirando", não um pano batendo.
- **Multidão:** nenhum braço sobe, nenhum chapéu mexe; as cabeças se deformam 1–3 px.
- **Defeito novo, mastro de borracha:** em flag_a o mastro, reto na imagem original, aparece sinuoso e com curvas que mudam ao longo da tomada (recortes em 19,6 / 20,3 / 21,0 / 21,7 / 22,4 s, x≈880–1040). É o centro da composição; dá para ver em tela cheia. O mesmo vale para mastros de crowd_a e para as linhas retas dos prédios de hanoi_a, em grau menor.
- **Serrilhado:** o `feDisplacementMap` amostra sem suavização e o `feConvolveMatrix` reforça as bordas: contornos de chapéus e cabeças ficam em degraus que não existem na imagem original (recorte 4× em 5,0 s, x 600–840, y 550–700). Em movimento isso vira bordas que "fervem".
- **Zona parada do ruído:** o `feOffset dx=f·3, dy=f·1,2` empurra o ruído para fora da região do filtro; a faixa esquerda (x < 3f − 154 px) e a de cima ficam sem ruído e, portanto, sem ondulação. Nas tomadas atuais isso é pouco (até ≈340 px à esquerda no fim de crowd_a); em tomadas mais longas cresce. Usar ruído que não se desloca (animar só `seed`/fase ou `baseFrequency`) ou ladrilhar.
- **O resto que se move:** câmera (zoom ≤ 1,15× com easing; diferença entre quadros cai a 2–3 no começo e no fim de cada tomada), raios e poeira, tags, número e cartas.
- **Documentos (12,1–19,0 s):** diferença entre quadros de 1–2 em 13,0–15,3 s e ≈3 em 15,9–18,7 s: continua só o empurrão de câmera.

## Rubrica visual (V1–V7)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | crowd_c e flag_a têm o mesmo traço e paleta de hanoi_a e crowd_a (folha a 2 fps). Documentos mantêm a convenção de mesa escura. |
| V2 Profundidade | **2** | Fantasma eliminado (6,0 / 10,5 / 21,0 s limpos). Mas o critério é "pelo menos 3 camadas com parallax" e a imagem é **uma camada**: o código tem um único `<Img>` sob a câmera; raios e poeira estão por cima sem parallax. O próprio autor registra que camadas reais não foram feitas. Sem decisão sobre o Flow (vídeo/segmentação) ou recorte manual, V2 não chega a 4. |
| V3 Movimento | **3** | freezedetect PASS. Ondulação global de ≈ 2 px a cada 0,33 s, perceptível como imagem "viva", mas nada age (ver seção acima), e o mastro ondulado em 19–22,75 s é um artefato. Documentos quase parados por 2,3 s e 2,8 s. |
| V4 Ritmo | 4 | 5 tomadas (3,4 / 5,5 / 3,2 / 6,9 / 3,75 s). As duas multidões agora são enquadramentos diferentes (aberta com palanque × close de punhos e bandeiras). Ressalva: 12,0–12,45 s ainda mergulha para escuro (luminância média 94 → 30) e mostra mesa vazia por ≈ 0,35 s antes da primeira carta. |
| V5 Tipografia | **3** | "HANÓI · 2 DE SETEMBRO" e "1945" legíveis em 640×360. **"PRAÇA DE BA DINH" continua ilegível** em 360p e fraco em 1080p (11,7 s): latão, 30 px, espaçamento 10, sem sombra, sobre multidão clara; a tarja radial fica centrada em 14%/86% e quase não alcança a linha do rótulo (y≈620). O subtítulo "lê a declaração de independência" (vermelho pequeno na etiqueta) também some em 360p. |
| V6 Atmosfera | 4 | Raios e poeira nas 4 tomadas de imagem; mesa com textura nos documentos. |
| V7 Rótulos | 5 | "HANÓI · 2 DE SETEMBRO / 1945" desde 0,3 s; nome em 4,5 s; "PRAÇA DE BA DINH" no número; país e ano nos documentos. |

## Fidelidade histórica

| Ponto | Situação |
|---|---|
| Mausoléu (crowd_b) | Resolvido: imagem descartada; crowd_c (close, prédio colonial e árvores ao fundo) e flag_a (prédios baixos coloniais) não mostram monumento. |
| crowd_a, pavilhão ao fundo (ampliado da imagem original, região x 580–1030, y 90–245) | **Em aberto (conferência pedida no ciclo 1).** Atrás do palanque há uma pequena construção de teto plano com colunas quadradas, de silhueta parecida com a do mausoléu, clara e pequena na névoa (≈ 60 px em 1080p, x≈940, y≈235 em 6,0 s). Pouco visível, mas fica exatamente sobre o palanque de "Ho Chi Minh lê a declaração". Sugestão: apagar por retoque (preencher com névoa/árvore) ou regerar crowd_a com o sufixo "no monuments, no mausoleum" já registrado em `lab/flow-prompts-s04.md`. |
| flag_a | Hasteamento de bandeira em 2/9/1945: plausível. A bandeira já está no topo enquanto os homens puxam a corda; aceitável no estilo. |
| Imagem ↔ frase em 19,0–22,75 s | Resolvido: bandeira do novo país sob "pede que os aliados reconheçam o novo país"; tag decorativa removida. |
| Textos vs. fala e fontes (HO45) | Sem mudança desde o ciclo 1: todos OK. |

## Licença e R14

| Item | Situação |
|---|---|
| IMG-US | Corrigido: "fac-símile de William Stone, 1823, do documento de 1776; 1280 px". Confere com o arquivo (1280×1519). |
| IMG-FR | Tamanho corrigido (1280×1623). **Falta o autor** (Jean-Jacques-François Le Barbier), pedido no ciclo 1. Menor. |
| FLOW-S04 rastreabilidade | Corrigido: mapeamento dos 4 arquivos usados e dos 2 descartados, prompts em `lab/flow-prompts-s04.md`. |
| FLOW-S04 uso comercial (R13) | Ainda pendente em `sources.md` e `decisions.md`. Não bloqueia o piloto; bloqueia publicação. |
| R14 | Decisão registrada em `decisions.md` (2026-11-20) com critério e condição de reavaliação. As duas imagens novas são ilustração chapada, sem pessoa real identificável: a decisão de não marcar continua válida. O texto do registro diz "4 imagens"; com o pavilhão de crowd_a em aberto, a condição "sem lugar real retratado de forma falsa" ainda depende do item acima. |

## Nitidez

Zoom limitado: z1 ≤ 1,15 em todas as tomadas (código, linhas 585–590), ou seja, até 1,395 × 1,15 ≈ 1,6× sobre a imagem de 1376 px, contra 1,9× no ciclo 1. A perda de detalhe no fim das tomadas ficou menor. Real-ESRGAN não foi aplicado. O ganho de nitidez do `feConvolveMatrix`, combinado com o deslocamento, produz bordas em degrau (ver acima): a imagem parece mais "dura", não mais detalhada.

## Sombra / vinheta

Resolvido. Vinheta global 0,3; os degradês de meia tela viraram manchas radiais locais (cartela de data no canto superior esquerdo; número no canto inferior esquerdo). Nenhum terço do quadro escurece por inteiro (10,5 s e 1,7 s).

## Som

- F6 resolvido: papel em 12,45 s ancorado em `word:inspira`, coincidindo com a entrada da carta (luminância sobe em 12,5 s); fx_check PASS.
- Ambiente de multidão: eventos `ambient` em 3,4 e 8,9 s, mas o nível do que não é voz (mix − voz) é −36,5 dBFS em 3,4–8,9 s e −39,1 dBFS em 8,9–12,1 s, contra −37,7 dBFS na abertura sem multidão. O murmúrio é praticamente inaudível. Se a intenção é ouvir a praça, subir 4–6 dB (F7 tem folga: mediana 27,8 dB).
- Sem `sweep` no movimento de crowd_c (baixa prioridade, como no ciclo 1).

## Defeitos do ciclo 1: situação

| # | Defeito | Situação | Evidência |
|---|---|---|---|
| 1 | Dupla exposição | **Resolvido** | Uma única `<Img>`; quadros 6,0 / 10,5 / 21,0 s sem fantasma |
| 2 | Mausoléu em crowd_b | **Resolvido** (crowd_a: pavilhão parecido em aberto, ver Fidelidade) | crowd_b descartada |
| 3 | Nada age dentro da imagem | **Parcial** | Ondulação global medida, sem elemento agindo; criou o mastro ondulado e o serrilhado |
| 4 | Documentos quase estáticos | **Aberto** | Diferença entre quadros 1–3; sem destaque de trecho |
| 5 | Mergulho a preto + F6 | **Parcial** | F6 resolvido; ainda escurece (94 → 30) e mostra mesa vazia ≈ 0,35 s em 12,1–12,45 s |
| 6 | Nitidez | **Parcial** | Zoom ≤ 1,15× (feito); sem upscale; serrilhado novo do filtro |
| 7 | Rótulos ilegíveis | **Parcial** | Data legível; "PRAÇA DE BA DINH" ilegível em 360p |
| 8 | Duas multidões iguais | **Resolvido** | Plano aberto × close |
| 9 | Rua vazia para "pede que os aliados" | **Resolvido** | flag_a; tag removida |
| 10 | Falta "HANÓI" | **Resolvido** | "HANÓI · 2 DE SETEMBRO" desde 0,3 s |
| 11 | Registros | **Parcial** | Stone/1823, tamanhos, mapeamento, prompts e R14 feitos; falta Le Barbier e a conferência comercial do Flow |

## Correções acionáveis

1. **Ondulação só onde faz sentido.** Aplicar o deslocamento através de uma máscara por imagem (polígonos das bandeiras, e do céu/névoa se quiser), com o resto da imagem intocado; mastros, prédios e cabeças nunca deformam. Nas bandeiras, ruído de frequência mais alta no sentido do pano (onda que anda da haste para a ponta), escala 6–10 px. Fora da máscara, escala 0. Isso não gasta créditos.
2. **Tirar o serrilhado:** remover o `feConvolveMatrix` (ou aplicá-lo só fora da máscara) e suavizar o resultado do deslocamento (`feGaussianBlur` 0,5 px dentro da máscara, ou renderizar a 2× e reduzir).
3. **Ruído que não sai do quadro:** trocar o `feOffset` crescente por animação de fase (ex.: dois `feTurbulence` com `seed` diferentes em crossfade, ou `baseFrequency` oscilando) para não criar faixas paradas em tomadas longas.
4. **"PRAÇA DE BA DINH":** ≥ 36 px, espaçamento ≤ 6, cor clara (papel) ou latão com `textShadow` forte, e a tarja radial centrada na linha do rótulo; conferir em 640×360. Mesma conferência para o subtítulo da etiqueta de nome.
5. **Documentos (12,1–19,0 s):** destacar a frase citada por Ho (carta americana: "all men are created equal"; francesa: artigo 1) com marca-texto ou recorte ampliado; manter movimento até o fim. Tirar o mergulho para escuro em 12,0–12,45 s (corte direto com a carta já entrando).
6. **crowd_a:** retocar ou regerar o pavilhão atrás do palanque.
7. **Som:** subir o murmúrio 4–6 dB nas tomadas 2 e 3 e conferir F7.
8. **sources.md:** autor de IMG-FR (Le Barbier). Antes de publicar: conferência comercial do Flow (R13).
9. **Decisão do usuário (R7), necessária para V2 ≥ 4:** profundidade real exige separar camadas. Opções: (a) vídeo/segmentação no Flow (o autor registra 24 créditos por clipe de 8 s em 720p); (b) recorte manual de 1–2 elementos de frente por imagem (bandeira, fileira da frente) com preenchimento do fundo por inpainting de imagem no Flow, que até aqui saiu a 0 créditos; (c) aceitar V2 < 4 para tomadas com imagem do Flow e registrar a exceção na rubrica. Recomendação do revisor: (b), testado primeiro em flag_a (bandeira e mastro separados do céu resolvem também a correção 1).

Como este é o ciclo 2 de 2 (R6), o trecho não vai ao usuário como aprovado: vai com este diagnóstico e o pedido de decisão do item 9.
