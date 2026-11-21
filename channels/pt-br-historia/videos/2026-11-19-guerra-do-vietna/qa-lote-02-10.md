# QA do lote: Cenas 02 a 10 (S02–S10.mp4, 230,2 s, 50 tomadas)

Revisor independente (R6), ciclo 1 de 2, 2026-11-19. Referência de padrão: S01 aprovada pelo usuário (`qa-trecho.md`, ciclo 2).
Base: `rubrics/visual.md`, `rubrics/sound-fx.md`, `protocols/shot-planning.md`, `script.md`, `sources.md`, `props/Sxx.json`, `Sxx_mix.events.json`.
Método: folhas de contato do meio da tomada; quadros extras em todos os 41 cortes (−0,10 s e +0,15 s), nos momentos de animação e em 960x540 para mapas; tempo de cada elemento (`at_s`) comparado com o tempo da palavra em `props/Sxx.json`; fontes reabertas onde o texto da tela depende delas (FRUS225, GEN/Avalon, HO45/Country Study 22).

## Veredito: REFAZER

Os validadores automáticos passam (com 3 exceções de pico), a narração está limpa e os cortes não mostram elementos sobrepostos. Não aprovo por quatro motivos: (1) a linha de Genebra está desenhada atravessando o Laos até a Tailândia e entrando no mar (erro geográfico em S08 e S09); (2) três textos e três sons disparam fora do que a fala diz, por um erro no casamento palavra→tempo (S04, S08, S09); (3) três documentos aparecem com tarja preta de censura sobre o próprio trecho que a narração descreve; (4) duas tomadas ficam vazias por cerca de 2 a 2,5 s (S06, S07). Há várias notas V abaixo de 4 (tabela abaixo).

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py scenes_spec.json props/` | PASS | S02–S10 PASS |
| `freezedetect` (n=0,002, d=2 s) | PASS | nenhum trecho parado nas 9 cenas (ver ressalva V3: S06 e S07 têm tela vazia que a deriva de câmera "salva" do detector) |
| Loudness integrado (−14 ±1 LUFS) | PASS | −14,4 a −14,6 LUFS em todas |
| True peak (≤ −1 dBTP, critério usado na S01) | **FAIL** | S02 −0,9 · S07 −0,7 · S08 −0,7 dBFS. As outras: −1,0 a −1,1 |
| `fx_check.py` eventos (F1–F6, F11) | PASS | via `scene_gates.py` (cópia em scratchpad que grava a folha fora da pasta de produção). Ressalva de processo abaixo: o F6 não está checando nada de fato |
| `fx_check.py --voice` (F7) | PASS | S02 0,4% / mediana 30,2 dB · S06 0,7% / 30,1 · S09 0,7% / 28,8 · S10 2,4% / 29,8 (todas as 9 PASS pelo `scene_gates`) |
| `fx_check.py --asr` (F8), 4 cenas | PASS | S02 voz 0,0% / mix 0,0% · S06 1,4% / 0,7% · S09 1,9% / 1,9% · S10 0,9% / 0,9% (mix = áudio do MP4; faster-whisper com `pipeline/env.sh`) |
| F10 silêncio intencional (revisão) | **FAIL** | nenhum evento de silêncio ou queda de trilha em 3 min 50 s. O roteiro pede "silêncio de 2 s antes do trecho" na cena 08, e o trecho do acordo nem está na tela |

**Falha de processo no F6 (para R9):** todos os eventos do lote usam `reason: "motion:Sxx@t"` com `t` igual ao próprio tempo do evento. O F6 compara o evento com ele mesmo, então passa qualquer som em qualquer tempo. Foi assim que passaram três sons sem nada na tela (S04 5,11 s; S08 12,74 s; S09 12,68 s). Correção sugerida: o mix gerar `motion:` a partir do tempo em que o elemento **fica visível** (máx(`at_s`, início da tomada)) e o `fx_check` conferir esse tempo contra o spec, não contra o próprio evento.

## Fatos na tela (texto × script × sources)

| Cena | Texto na tela | Fonte | Resultado |
|---|---|---|---|
| S02 | "O EMPRÉSTIMO 150 milhões de dólares"; "LINCOLN GORDON embaixador dos EUA" | FRUS225 | OK |
| S02 | "o governo americano diz: dois assuntos, separados / mas o pedido foi feito na mesma conversa" | FRUS225: "we separated the $150 million program loan from the issue of troops" / "in the same meeting… he made a very strong pitch on the troops" (reaberto) | OK. O trecho "we separated…" **não está registrado** em `sources.md` (R1: registrar) |
| S02 | MEMORANDUM, "Washington, December 31, 1965", FRUS 1964–68 vol. XXXI doc. 225 | FRUS225 | OK. Mas a tarja preta sugere documento censurado, e ele não é (ver D6) |
| S03 | linha 1945–1975; "1965 · o pedido", "1945 · Hanói", "1975 · Saigon" | roteiro (transição) | OK |
| S04 | "2 DE SETEMBRO 1945"; pino HANÓI (105,85°E 21,03°N); "HO CHI MINH" | HO45 | OK (coordenada certa) |
| S04 | "PRAÇA DE BA DINH ≈ 500 mil pessoas, estimam as fontes" | HO45: "half a million people gathered in Ba Dinh Square" (reaberto) | OK |
| S04 | Declaração de Independência (EUA) / Declaração dos Direitos do Homem e do Cidadão (França) | HO45 (reaberto) | OK |
| S04 | doc "DECLARAÇÃO, Hanói, 2 de setembro de 1945" com tarja | HO45: "an appeal to the victorious Allies to recognize the independence" (reaberto) | Fato OK; a fala "ele pede que os aliados reconheçam" **não tem trecho** em `sources.md` (registrar). A tela tapa exatamente esse trecho (D6) |
| S05 | "SAIGON · BRITÂNICOS · SET. 1945"; "SAIGON retomada pelas tropas francesas"; "MARÇO DE 1946"; "TONKIN · ≈ 15 MIL"; "19 DE DEZEMBRO 1946"; "HANÓI · USINA ELÉTRICA" | HO45, FR46 | OK. Pino de Saigon 106,7°E 10,8°N certo; pino do Tonkin cai na costa do delta, perto de Haiphong (onde os franceses desembarcaram), aceitável para rótulo de região |
| S06 | "1950 · AJUDA DOS EUA À FRANÇA 10 milhões" | AID2 | Fato OK, mas **sem moeda** na tela ("10 milhões" de quê?). A S02 mostra "de dólares"; aqui não |
| S06 | "1954 78% do custo da guerra francesa"; barra | AID2 | OK. Barra medida em 15,5 s: ~77% do trilho (215/280 px) |
| S06 | "Miller Center · Universidade da Virgínia · mais de três quartos"; "7 DE ABRIL 1954"; dominó "Eisenhower, entrevista de 7 de abril de 1954" | AID, AID2 | OK |
| S07 | pino DIEN BIEN PHU (103,02°E 21,38°N); "13 DE MARÇO A 7 DE MAIO 1954" | NARA12 | OK (coordenada certa) |
| S08 | "ACORDO DE GENEBRA · 20 DE JULHO 1954"; "5 km de cada lado da linha, no máximo"; "ELEIÇÕES gerais, para reunificar o Vietnã"; "NORTE · 27 JUL." (Hanói), "CENTRO · 1º AGO." (107,5°E 16,4°N, Hué), "SUL · 11 AGO." (Saigon) | GEN (reaberto: art. 1, 11, 14a) | Textos OK. Pinos OK |
| S08 / S09 | **linha militar provisória** desenhada de 102,8°E a 110,2°E em 17°N | GEN art. 1 e 4 | **ERRADO.** No quadro 10,0 s (S08) a linha começa no interior do Laos/Tailândia e entra ~130 px (de 960) no mar. A linha real ia da fronteira com o Laos (~106,5°E) à costa (~107,1°E), com extensão só nas águas territoriais (art. 4). Mesmo erro na S09 0–3,6 s |
| S09 | "LINHA PROVISÓRIA · eleições em 1956 a apagariam"; "Canadá, Índia, Polônia"; "AGOSTO 1955"; "NGO DINH DIEM primeiro-ministro do Sul"; "eleições previstas 1956"; PROVISÓRIA→FRONTEIRA | GEN, CS25 | Textos OK |
| S10 | "MAIO 1961"; "685 integrantes do grupo de assessoria militar dos EUA no Vietnã do Sul"; "8 DE FEVEREIRO 1962"; "NO FIM DE 1963"; gráfico 685 × 16 mil | MAAG, NARA12, MAAG63 | OK. Gráfico proporcional (685 = barra de ~3 px contra ~135 px de 16 mil, ~2–4%; correto) |

Nenhum número na tela contradiz a fala. Os problemas de fato são o traçado da linha de Genebra e a tarja de censura que não existe nos documentos.

## Rubrica visual por cena (0–5; mínimo 4)

| Cena | V1 | V2 | V3 | V4 | V5 | V6 | V7 | Evidência curta |
|---|---|---|---|---|---|---|---|---|
| S02 | 4 | 4 | 5 | 4 | **3** | 4 | 4 | Paleta e serifada iguais à S01. Legenda quebra número e unidade: "DE UM EMPRÉSTIMO DE 150" / "MILHÕES DE DÓLARES" (2,9 s). "150 milhões" entra em 2,33 s ("empréstimo"), 0,9 s antes de "150" (3,19). Mapa-múndi e rota Brasil→Vietnã repetem a S01 |
| S03 | 4 | **3** | 5 | **3** | **3** | 4 | 4 | Timeline ocupa uma faixa fina; de 0 a ~2 s a tela tem só marcas de ano (quadros 0,5 / 1,5 s). "1975 · Saigon" entra em 6,63 s e a tomada some em 7,0 s: fica ~0,3 s legível. "1945 · Hanói" encosta na borda esquerda (6 px em 640). Anos do eixo ~8 px em 360p. "um lugar para o" / "Brasil" quebra depois de artigo |
| S04 | 4 | 4 | 5 | 4 | **3** | 4 | 5 | Data, lugar, nome: bons rótulos. Ordem das linhas errada (D3). Legenda divide o nome: "NA PRAÇA DE BA" / "DINH" (9,05 s). Subtítulo do cartão "lê a declaração de independência" ~7 px em 360p |
| S05 | 4 | 4 | 5 | 4 | 4 | 4 | 5 | Melhor cena do lote: cada lugar e data rotulado na hora da palavra (3,42 / 9,16 / 14,54 / 21,2 s). Ressalva: terra e mar quase da mesma cor nos zooms (quadros 15,2 e 24,0 s), o mapa lê como abstrato |
| S06 | 4 | **3** | 4 | 4 | **3** | 4 | 4 | 6 de 7 tomadas são texto ou cartão. "10 milhões" some em ~9,8 s e a tela fica vazia até 11,9 s (quadros 10,5 / 11,5 s) enquanto a fala diz "em 1950 e, em 1954". Sem moeda. Subtítulos do doc e do dominó ilegíveis em 360p. Dominó (25–32 s) é a melhor tomada do lote |
| S07 | 4 | **3** | **3** | **3** | 4 | 4 | 4 | De 6,3 a 8,84 s a tela tem só o fundo (quadros 7,0 / 8,0 s) enquanto a fala diz "a França combate no norte do Vietnã": era a frase para o mapa. Doc de Genebra genérico com tarja |
| S08 | 4 | 4 | 5 | 4 | 4 | 4 | **3** | Pinos das três datas no tempo da palavra (−0,2 s). Linha de demarcação atravessa o Laos e entra no mar (quadro 10,0 s). Zona desmilitarizada não aparece no mapa. O "trecho do acordo na tela" pedido no roteiro não existe |
| S09 | 4 | 4 | 5 | 4 | **3** | 4 | **3** | "o Sul" aparece em 27,0 s, antes de "esse país dividido" e de "os americanos passam a apoiar" (quadro 27,3 s: "ESSE PAÍS DIVIDIDO / o Sul" com um buraco no meio). Caixa "PROVISÓRIA/FRONTEIRA" flutua no topo sem linha nenhuma desenhada (quadros 24,6 / 26,2 s) e cobre o pino NORTE; o pino SUL desce para baixo da legenda (24,6–27 s) |
| S10 | 4 | **3** | 5 | **3** | **3** | 4 | 4 | 5 de 7 tomadas são texto em fundo escuro, 3 delas cartões de data no mesmo leiaute (2,7 / 12,0 / 19,7 s); "685" aparece duas vezes (5,3 s e 22,9 s). Gráfico: título quase transparente, fonte ilegível e **sobreposta ao rótulo "FIM DE 1963"** (quadros 27,0 / 28,3 s). Legenda divide "DOS ESTADOS" / "UNIDOS" |

V1 é estável: o lote parece do mesmo vídeo da S01. Transições: os 41 cortes conferidos (−0,1 / +0,15 s) usam mergulho no escuro; nenhum mostra dois elementos sobrepostos (o defeito D1/D13 da S01 não voltou).

## Defeitos (priorizados)

| # | Prioridade | Cena / tempo (s) | Defeito | Correção |
|---|---|---|---|---|
| D1 | Alta (fato) | S08 4,7–10,7 · S09 0–3,6 | Linha de Genebra de 102,8°E a 110,2°E: atravessa Laos e Tailândia e entra no mar | Traçar de ~106,5°E (fronteira com o Laos) a ~107,1°E (costa), com no máximo uma extensão curta no mar; desenhar a faixa da zona desmilitarizada (o roteiro pede "zona desmilitarizada destacada") |
| D2 | Alta | S09 27,0 | "o Sul" com `at_s` 12,68 (primeiro "Sul" da cena) aparece antes da frase; som `label` em 12,68 s soa em cima do pino, sem elemento novo | `at_s` = 30,76 ("Sul." final); remover o evento de 12,68 e pôr o som em 30,76 |
| D3 | Alta | S04 12,1–19,0 · 5,11 | Linhas fora de ordem: "Declaração dos Direitos…" entra em 13,37 s, enquanto a fala ainda diz "Declaração de Independência americana"; a palavra certa é 15,85 s. "Declaração de Independência" está com `at_s` 5,11 (palavra da tomada do mapa), e o som `label` em 5,11 s toca sem nada na tela | `at_s`: 13,37 / 14,77 / 15,85 / 18,59; remover o som de 5,11 s e pôr em 13,37 s |
| D4 | Alta | S08 12,74 | Som `label` em 12,74 s (na tomada "5 km"); "cada lado administra" só aparece em 14,2 s, sem som | `at_s` = 14,24 ("Cada"); som junto |
| D5 | Alta | S09 20,8–27,0 | PROVISÓRIA→FRONTEIRA sem linha na tela; caixa cobre NORTE; SUL some sob a legenda | Redesenhar a linha (já corrigida pelo D1) e prender o rótulo nela; manter os pinos dentro da área segura (acima de ~80% da altura) |
| D6 | Alta (honestidade visual) | S02 20,35 · S04 20,45 · S07 14,93 | Tarja preta de censura sobre o texto. Nenhum dos três documentos é censurado; na S04 a tarja cobre o trecho que a narração descreve | S04: mostrar e grifar o trecho real ("an appeal to the victorious Allies to recognize the independence of Vietnam", Country Study cap. 22, já conferido). S07: grifar o art. 14(a) ou art. 1 de Genebra (texto em GEN). S02: tampar com o selo de cera da marca e "no fim do vídeo", não com tarja de censura |
| D7 | Alta | S07 6,3–8,84 | Tela vazia ~2,5 s em "a França combate no norte do Vietnã" | Manter o mapa da tomada 1 (zoom de saída até o norte) até 8,8 s, ou adiantar a primeira linha |
| D8 | Média | S06 ~9,8–11,9 | "10 milhões" some e a tela fica vazia ~2 s | Manter o número até o corte, ou cortar para "1954 · 78%" em 10,4 s ("em" de "em 1954") |
| D9 | Média | S10 22,4–28,4 | Título do gráfico quase transparente; linha de fonte sobreposta ao rótulo "FIM DE 1963"; gráfico preso no canto inferior esquerdo | Fonte abaixo dos rótulos com espaço próprio ou só na descrição; título em opacidade cheia; gráfico ocupando o centro |
| D10 | Média | S10 0–22,4 | 3 cartões de data no mesmo leiaute em 20 s; "685" duas vezes | Fundir: data dentro do stat ("MAIO DE 1961" já está no topo do stat), cortar o cartão "MAIO 1961"; "8 DE FEVEREIRO 1962" como cartão com o nome do comando (MACV) |
| D11 | Média (som) | S02, S07, S08 | True peak −0,9 / −0,7 / −0,7 dBFS | Limitador para ≤ −1 dBTP |
| D12 | Média (som) | lote | Nenhum silêncio intencional (F10). O roteiro pede 2 s de silêncio antes do trecho do acordo na S08 | Criar a tomada do trecho do acordo na S08 (art. 1 ou 14a) com a queda de trilha antes |
| D13 | Média | S06 6,9–11,9 | "10 milhões" sem moeda | "US$ 10 milhões" ou rótulo "de dólares", como na S02 |
| D14 | Média | S03 6,63–7,0 | "1975 · Saigon" visível só ~0,3 s; "1945 · Hanói" colado na borda | Estender a tomada até ~7,6 s (encurtar a seguinte) ou adiantar o rótulo; margem de 5% nas pontas |
| D15 | Baixa | S02 2,9 · S04 9,05 · S10 ~8,6 | Legenda quebra número e unidade ("150" / "MILHÕES"), nome ("BA" / "DINH"), "ESTADOS" / "UNIDOS" | Lista de pares que não quebram (número + unidade, "Estados Unidos", "Ba Dinh", "Ho Chi Minh", "Viet Minh", "Dien Bien Phu", "Ngo Dinh Diem") no gerador de legenda |
| D16 | Baixa | S09 22,68 | Dois `pin` no mesmo instante (som dobrado, ~+6 dB) | Um só pin, ou 0,3 s entre eles |
| D17 | Baixa | S04, S05, S06, S09 | Subtítulos de cartões de nome, do doc e do dominó com ~7 px em 360p | Aumentar ~1,5x (mesma ressalva da S01) |
| D18 | Baixa | S02 2,33 | "150 milhões" entra 0,9 s antes de "150" | `big_at_s` = 3,19 |
| D19 | Baixa (fontes) | `sources.md` | Trechos usados na tela e na fala sem registro: FRUS225 "we separated the $150 million program loan from the issue of troops"; HO45 "appeal to the victorious Allies to recognize the independence of Vietnam" | Acrescentar os trechos (R1) |

## Som × imagem (conferido evento a evento)

- Pins dos mapas: no tempo da palavra e do marcador (S05 3,42 / 14,54 / 21,2; S08 25,66 / 27,5 / 29,22; S09 12,68 / 15,66). OK.
- Sweeps de rota e barra: S02 8,65→`hit` 10,73 (rota chega); S08 6,64→`hit` 8,86; S09 0,2→`hit` 1,2; S06 13,12 (barra 78%); S10 22,96 / 26,76 (barras). OK.
- Sem som: entrada da tarja/papel tem `paper`/`sweep` (OK); "o Sul" (S09 27,0), "cada lado administra" (S08 14,2) e a linha "Declaração de Independência" (S04 12,1) entram sem som porque o som foi para o tempo errado (D2–D4).
- Densidade: 21 a 32 eventos/min (S09 a mais alta, 17 em 31 s). Está dentro do validador porque `label` e `pin` são "menores", mas o usuário pediu menos som. Com os três sons órfãos e o pin dobrado removidos, a S09 cai para 14.
- Nenhum whoosh no lote. Não é obrigatório, mas o salto Brasil 1965 → Hanói 1945 (S03→S04) é o salto de tempo e lugar mais forte do trecho e é candidato a um whoosh (F3).

## Ritmo do lote

- 50 tomadas em 230 s (média 4,6 s). Distribuição por tempo de tela: texto em fundo escuro (`typo` + `date` + `stat`) **32 tomadas, 130 s, 56%**; mapas 11 tomadas, 62 s, 27%; documentos 4 tomadas, 18 s, 8% (todos com linhas cinza no lugar do texto); visuais únicos (timeline, dominó, gráfico) 3 tomadas, 20 s, 9%. Nenhuma imagem, nenhum retrato.
- O padrão "cartão de data → mapa → frase em tipografia" se repete em quase todas as cenas, e cada corte mergulha no escuro. Em S06 e S10 isso dá 5 a 6 cartões de texto seguidos. Assistido em sequência, o lote cansa a partir da S06.
- O que enriquece sem custo de licença (todos com origem a registrar em `sources.md`, R13):
  1. **Trechos reais dos documentos** em vez de linhas cinza: Genebra (art. 1 "provisional military demarcation line"; art. 14a "pending the general elections…"), a página do Pentagon Papers com "$10 million in 1950" e os 78% (Wikisource/NARA, domínio público), a declaração de 1945 (trecho do apelo aos aliados).
  2. **Fotos de domínio público do governo dos EUA**: Eisenhower na entrevista de 7/4/1954 ou retrato oficial (S06 21–25 s, no lugar do cartão "7 DE ABRIL 1954"); Diem com Eisenhower em 1957 (S09, cartão de nome); assessores do MAAG (S10, US Army). Verificar a licença de cada uma antes de usar.
  3. **Mapas com mais informação**: terra e mar com contraste maior, fronteira Vietnã/Laos/Camboja, a faixa da zona desmilitarizada, o paralelo 17 como objeto que se repete entre S08 e S09.
  4. **Fundir cartões de data** em stat/mapa quando a data só antecede o fato (S06 21,2 s; S10 2,7 / 12,0 / 19,7 s).
  5. Uma tomada de **silêncio + documento** na S08 (D12) quebra o padrão no meio do lote.

## Resumo para o produtor

Corrigir D1–D10 (todas mecânicas ou de spec, exceto D6, que pede o texto real dos documentos), D11–D14 e o processo do F6. Depois rodar de novo `scene_gates.py`, true peak e o F8 em 3 cenas. Ciclo 2 é o último (R6).

## Artefatos da revisão
Scratchpad `/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/l2/`: `gates.py` (cópia do `scene_gates.py` que grava fora da pasta de produção), `cut_Sxx.jpg` (quadros nos cortes), `s06a.jpg`, `s06d.jpg`, `s07b.jpg`, `s09b.jpg`, `s10a.jpg`, `s03b.jpg`, `z_*.jpg` (960x540 dos mapas), `Sxx_ref.txt` e `Sxx_mp4.wav` (F8).

---

# Ciclo 2 (último, R6), 2026-11-19

Revisor independente. Renders reavaliados: `media/pt-br-historia/vietna/render/S02.mp4` … `S10.mp4` (22:17–22:18), `props/Sxx.json`, `Sxx_mix.events.json`, `sources.md`.
Método: `scene_gates.py` (cópia no scratchpad que não grava na pasta de produção), `shot_check.py`, `fx_check.py --asr` em 4 cenas, medição da trilha (mix − voz) nas janelas de silêncio, quadros nos 41 cortes (−0,10 / +0,15 s), quadros nos tempos de cada defeito D1–D19 (640x360; mapas em 960x540; recortes em 1080p).

## Veredito: REFAZER (escalar ao usuário, R6)

Os validadores passam todos e 9 dos 19 defeitos foram resolvidos (todos os de casamento palavra→tempo, as telas vazias, o pico e a moeda). Não aprovo porque 6 cenas ainda têm nota 3 em algum critério. A linha de Genebra continua mais longa que a real e some na tomada em que "vira fronteira" (S08, S09), os números de estilo antigo do cartão `stat` passam por cima do rótulo (S08, S10, defeito novo), a S10 repete "maio de 1961" três vezes e "685" duas, e os defeitos de legenda e de margem marcados como baixos no ciclo 1 não foram tocados.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py scenes_spec.json props/` | PASS | S01–S10 |
| `freezedetect` (n=0,002, d=2 s) | PASS | nenhum trecho parado nas 9 cenas |
| Loudness integrado (−14 ±1 LUFS) | PASS | −14,6 a −14,9 LUFS |
| True peak (≤ −1 dBTP) | PASS | −1,6 a −1,7 dBFS em todas (D11 resolvido) |
| `fx_check.py` eventos F1–F6, F11 | PASS | 9/9. Ressalva: o F6 continua sem checar nada (todo `reason` é `motion:Sxx@t` com t = tempo do próprio evento; ver Processo) |
| `fx_check.py --voice` (F7) | PASS | 9/9. S02 0,4% / 30,6 dB · S06 0,7% / 30,0 · S08 1,5% / 29,2 · S10 0,0% / 30,2 |
| `fx_check.py --asr` (F8), 4 cenas, mix = áudio do MP4 | PASS | S02 0,0% → 0,0% · S06 1,4% → 2,0% (+0,7 p.p.) · S08 2,6% → 2,6% · S10 1,7% → 0,0% |
| F10 silêncio intencional (lote, 230,2 s ≈ 3,8 min) | PASS com ressalva | 4 quedas de trilha (≥ 1/min). Medidas no mix − voz: S06 24,2 s cai de −41 para −82 dB (~0,9 s, bom); S08 9,9 s cai de −28 para −70 dB de 10,0 a 12,0 s, cortada pelo `label` em 11,16 s; S02 17,3 s só fica em silêncio de 17,25 a 17,75 s (o `paper` em 17,85 s entra no meio, o declarado era 1,2 s); S10 4,9 s só ~0,3–0,5 s. O silêncio que o roteiro pede na cena 08 ("2 s antes do trecho") existe, mas o trecho do acordo continua fora da tela |

## Fatos na tela (mudanças desde o ciclo 1)

| Cena | Texto/elemento | Fonte | Resultado |
|---|---|---|---|
| S06 | "1950 · AJUDA DOS EUA À FRANÇA / US$ 10 milhões" | AID2 | OK (moeda agora na tela) |
| S08 / S09 | linha provisória de 106,0°E a 107,6°E em 17°N | GEN art. 1 e 4 | **AJUSTAR.** A linha real (rio Ben Hai) vai da fronteira com o Laos (~106,5–106,6°E) à costa (~107,1°E). A linha desenhada começa ~0,5° (~50 km) dentro do Laos e termina ~0,5° no mar (quadros S08 9,0 / 10,4 s: ~90 px em terra a oeste e ~20–30 px de mar a leste, em 960). Melhor que 102,8–110,2°E, mas ainda mais longa que a real. Como o mapa não desenha fronteiras, o leitor não vê o Laos; o erro fica menos visível, mas continua |
| S10 | gráfico 685 × 16 mil, título e fonte no topo | MAAG, MAAG63 | OK, proporção certa |
| `sources.md` | FRUS225-b ("we separated the $150 million program loan from the issue of troops") | — | OK, registrado. Falta ainda o trecho do HO45 que sustenta "ele pede que os aliados reconheçam" (D19 parcial) |

Nenhum outro texto mudou. Nenhum número na tela contradiz a fala.

## Rubrica visual por cena, ciclo 2 (0–5; mínimo 4)

| Cena | V1 | V2 | V3 | V4 | V5 | V6 | V7 | Evidência curta |
|---|---|---|---|---|---|---|---|---|
| S02 | 4 | 4 | 5 | 4 | **3** | 4 | 4 | Doc sem tarja, linhas cinza com destaque rosado (21,5 s). Continua: legenda "DE UM EMPRÉSTIMO DE 150" / "MILHÕES DE DÓLARES" (2,9 s) e "150 milhões" entra em 2,33 s, 0,86 s antes de "150" (3,19 s), quadro 2,5 s |
| S03 | 4 | **3** | 5 | 4 | **3** | 4 | 4 | "1975 · Saigon" agora legível de 6,2 a ~6,9 s (0,7 s; antes 0,3). De 0 a ~2 s a tela segue só com marcas de ano (quadros 0,5 / 1,5 s). "1945 · Hanói" a ~10 px da borda esquerda e "1975 · Saigon" a ~8 px da direita (em 640; quadro 6,4 s) |
| S04 | 4 | 4 | 5 | 4 | **3** | 4 | 5 | Linhas na ordem da fala (13,37 / 14,77 / 15,85 / 18,59 s) e som em 13,37 s: D3 resolvido. Doc sem tarja. Continua: legenda "NA PRAÇA DE BA" / "DINH" (corte 8,9 s); subtítulo do cartão "lê a declaração de independência" ilegível em 360p (4,8 s); tomada do stat vazia de 8,9 a 9,55 s |
| S05 | 4 | 4 | 5 | 4 | 4 | 4 | 5 | Sem mudança, segue a melhor cena |
| S06 | 4 | **3** | 5 | 4 | **3** | 4 | 4 | "US$ 10 milhões" fica até o corte (10,8 s), só o escurecimento em ~11,6–12,0 s: D8 e D13 resolvidos. Continua: 6 de 7 tomadas são texto ou cartão; subtítulos do doc e do dominó ("Eisenhower, entrevista de 7 de abril de 1954") ilegíveis em 360p (29,0 s) |
| S07 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | "a França combate no norte do Vietnã" entra em 6,86 s, logo após o corte de 6,7 s (quadros 6,8 / 7,4 / 8,0 s): D7 resolvido. Doc de Genebra com linhas cinza e destaque, sem tarja |
| S08 | 4 | 4 | 5 | 4 | **3** | 4 | **3** | Câmera perto e linha curta (9,0 s), mas ainda ~0,5° a mais de cada lado (ver fatos); linha fina tracejada, sem a faixa da zona desmilitarizada; o cartão "LINHA MILITAR PROVISÓRIA" fica no canto, longe da linha. Cartão "5 km": o "5" de estilo antigo desce sobre "DE CADA LADO" (recorte 13,0 s, defeito novo D20). "cada lado administra" com som em 14,24 s: D4 resolvido |
| S09 | 4 | 4 | 5 | 4 | 4 | 4 | **3** | "o Sul" em 30,76 s: D2 resolvido. Pinos NORTE/SUL dentro da área segura. Continua: de 20,8 a 27,0 s não há linha no mapa; a caixa PROVISÓRIA→FRONTEIRA flutua à esquerda, sobre o interior do continente, enquanto a fala diz "a linha provisória vira uma fronteira de fato" (quadros 22,0 / 24,6 / 26,4 s). Pinos NORTE e SUL a 0,22 s um do outro (22,68 / 22,90) |
| S10 | 4 | **3** | 5 | **3** | **3** | 4 | 4 | Sobreposição fonte×rótulo resolvida; gráfico no centro. Continua: "MAIO DE 1961" três vezes em 6 s (cartão do mapa 2,74 s, topo do stat 5,3 s, linha do tempo 20,0 s) e "685" duas (5,38 s e 24,6 s); a linha do tempo mostra "mai. 1961" e "fev. 1962" de novo em 20,0–20,3 s enquanto a fala diz "no fim de 1963", com 3 sons em 0,5 s (20,0 / 20,3 / 20,5). O "5" de "685" desce sobre "ASSESSORIA" (recorte 8,6 s, D20). Título do gráfico com opacidade baixa e degradê à esquerda; linha de fonte ~11 px em 1080p, ilegível em 360p. Legenda "DOS ESTADOS" / "UNIDOS" (8,6 s); "para assessorar o governo do" / "Sul" (19,0 s). Densidade 36 eventos/min, a mais alta do lote |

Cortes: os 41 cortes conferidos (−0,10 / +0,15 s) seguem com escurecimento e sem elementos sobrepostos.

## Situação dos defeitos do ciclo 1

| # | Situação | Evidência |
|---|---|---|
| D1 | **Parcial** | Linha 106,0–107,6°E (era 102,8–110,2). Real ~106,55–107,1°E. Sem a faixa da zona desmilitarizada que o roteiro pede |
| D2 | Resolvido | "o Sul" `at_s` 30,76; som em 30,76; pin SUL em 12,68 é do primeiro "Sul" (correto, tem pino na tela) |
| D3 | Resolvido | 13,37 / 14,77 / 15,85 / 18,59; sem som em 5,11 |
| D4 | Resolvido | `label` em 14,24 com "cada lado administra"; sem som em 12,74 |
| D5 | **Parcial** | Pinos dentro da área segura; caixa não cobre NORTE. Linha continua ausente na tomada 20,8–27,0 s e a caixa não está presa a nada |
| D6 | Resolvido quanto à tarja; texto real **aberto por decisão do usuário** | S02, S04, S07, S06: linhas cinza com faixa de destaque, nenhuma tarja preta |
| D7 | Resolvido | S07 6,86 s |
| D8 | Resolvido | S06 número até 10,8 s; só o escurecimento do corte |
| D9 | **Parcial** | Sem sobreposição; título ainda apagado, fonte ilegível em 360p |
| D10 | **Parcial** | Cartões de data: 3 → 1. "MAIO DE 1961" 3x, "685" 2x, linha do tempo repete as datas anteriores |
| D11 | Resolvido | −1,6 a −1,7 dBTP |
| D12 | **Parcial** | F10 passa (4 quedas), mas S02 e S10 duram ~0,5 s e a S02 é cortada pelo `paper`; o trecho do acordo na S08 continua ausente (depende do usuário) |
| D13 | Resolvido | "US$ 10 milhões" |
| D14 | **Parcial** | Saigon legível 0,7 s; rótulos das pontas colados às bordas (~8–10 px em 640) |
| D15 | Aberto | "DE 150" / "MILHÕES" (S02 2,9 s), "BA" / "DINH" (S04 ~11,5 s), "ESTADOS" / "UNIDOS" (S10 ~10 s) |
| D16 | **Parcial** | 0,22 s entre os pins (pedido: um só, ou ≥ 0,3 s) |
| D17 | Aberto | subtítulos de cartões, doc e dominó ilegíveis em 360p |
| D18 | Aberto | `big_at_s` 2,33 (pedido 3,19) |
| D19 | **Parcial** | FRUS225-b registrado; trecho do HO45 sobre o apelo aos aliados não registrado |
| Processo F6 | **Aberto** | `reason` continua `motion:Sxx@t` com t igual ao evento. O checador de cue ambíguo no `vietna_prep.py` ataca a causa dos D2–D4 (bom), mas o F6 do `fx_check` segue sem conferir som contra o elemento visível (R9) |

## Defeitos novos

| # | Prioridade | Cena / tempo (s) | Defeito | Correção |
|---|---|---|---|---|
| D20 | Média | S08 11,8–14,2 · S10 6,8–12,0 | Algarismo de estilo antigo ("5") desce sobre o rótulo do `stat` ("DE CADA LADO", "ASSESSORIA"). Em S06 o "7" de "78%" encosta na barra | Espaço abaixo do `big` medido pela descendente da fonte (ou algarismos alinhados, `font-variant-numeric: lining-nums`) |
| D21 | Baixa | S10 20,0–20,5 | 3 sons em 0,5 s para marcas que repetem datas já ditas | Uma marca só ("fim de 1963") com um som, ou cortar a linha do tempo e ir direto ao gráfico |

## Correções restantes (para o produtor, se o usuário mandar seguir)

1. S08 4,7–10,7 e S09 0–3,6: linha de ~106,55°E a ~107,1°E, faixa da zona desmilitarizada visível, rótulo preso à linha (D1).
2. S09 20,8–27,0: desenhar a mesma linha e prender PROVISÓRIA→FRONTEIRA nela (D5); pins com ≥ 0,3 s (D16).
3. S08 11,8–14,2 e S10 6,8–12,0: espaço entre número e rótulo no `stat` (D20).
4. S10: tirar "MAIO DE 1961" do cartão do mapa ou do stat; linha do tempo só com "fim de 1963" ou removida; título do gráfico em opacidade cheia (D9, D10, D21).
5. S02 2,33 → 3,19 (D18); S03 margem de 5% nas pontas da linha do tempo e 0–2 s com algo na tela (D14).
6. Legenda sem quebrar número+unidade e nomes (D15); subtítulos ~1,5x (D17).
7. `sources.md`: trecho HO45 do apelo aos aliados (D19).
8. Processo F6 (R9).

Itens que dependem do usuário (não contam contra o produtor, mas seguram V2/V7): texto real dos documentos (Genebra, Pentagon Papers, declaração de 1945) e fotos de domínio público.

## Artefatos do ciclo 2
Scratchpad `/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/l3/`: `gates.py`, `grab.sh`, `grid_Sxx_a.jpg` (quadros dos defeitos), `grid_S08_m.jpg` e `grid_S09_m.jpg` (mapas 960x540), `cutsA.jpg` e `cutsB.jpg` (cortes), `zz.jpg` (D20), `f8.out`, `Sxx_ref.txt`, `Sxx_mp4.wav`.
