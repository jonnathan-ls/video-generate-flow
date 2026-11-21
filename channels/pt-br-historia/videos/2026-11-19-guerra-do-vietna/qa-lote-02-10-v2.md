# QA do lote v2 (cenas ilustradas): S02 a S10 (230,2 s, 50 tomadas)

Revisor independente (R6), ciclo 1 de 2 do redesenho, 2026-11-19. Renders avaliados: `media/pt-br-historia/vietna/render/S02.mp4` … `S10.mp4` (23:05–23:08), `props/Sxx.json`, `Sxx_mix.events.json`, `studio/remotion/src/vietna/plates.tsx`, `cine.tsx`, `lacre/draw.tsx` (`Cam`).
Base: `rubrics/visual.md`, `rubrics/sound-fx.md`, `protocols/shot-planning.md`, `qa-lote-02-10.md` (ciclos 1 e 2 da versão anterior), `script.md`, `sources.md`. Referência de estilo: `media/lab/bakeoff-2026-11/render/D4.mp4`.
Método: 3 quadros por tomada (início +0,35 s, meio, fim −0,2 s) nas 50 tomadas; quadros a ±0,1 s dos cortes em S06 e S08; 12 quadros em volta da explosão da S05 (20,9–22,75 s); recortes em 1080p das cartelas de data; leitura do código das plates; `blackdetect` nos 9 arquivos; fontes reabertas: Country Study cap. 22 (HO45) e Acordo de Genebra (GEN, Avalon).

## Veredito: REFAZER

Os validadores passam todos. O salto visual é real: 76% do tempo de tela agora tem cena ilustrada no estilo D, a S07 (Dien Bien Phu) e a S04 (Ba Dinh) já parecem cinematografia, e a explosão da usina cai na palavra. Não aprovo por três motivos:

1. **Fidelidade (alta).** As ilustrações afirmam coisas erradas: veleiros de três mastros em 1945, 1946 e 1950; bandeiras dos EUA e do **Brasil** na mesa de "cada lado administra a sua parte" (Vietnã, 1954) e no trecho do Miller Center; Canadá, Índia, Polônia e EUA como as bandeiras da conferência de Genebra; bandeira do Canadá que não existia em 1954; clarões de artilharia sobre "cessar-fogo"; rua de Saigon com bandeira francesa para "a França combate no norte" e para Diem em 1955; bandeira americana na sala de Diem.
2. **V2 em 3 em todas as cenas.** Não há parallax: `Cam` aplica um único zoom/pan ao quadro inteiro, e as camadas de relevo andam todas na mesma velocidade (0,04–0,06 px/quadro). As camadas existem, mas se movem juntas.
3. **Reuso de plates em contexto errado** (meeting-table 3x, saigon-street 4x, command-room 2x, valley-dbp 2x) e texto ainda como elemento principal em 56% do tempo (`typo` 30%, `date` 13%, `stat` 13%), com a ilustração atrás, escurecida.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py scenes_spec.json props/` | PASS | S01–S10 |
| `scene_gates.py` (cópia no scratchpad que não regrava `Sxx_sheet.jpg` na pasta de produção) | PASS 9/9 | sem trecho parado; −14,6 a −14,9 LUFS; pico −1,6 / −1,7 dBFS; fx (F1–F7, F11) PASS |
| `freezedetect` (0,002; 2 s) | PASS | nenhum trecho parado |
| `blackdetect` (0,15 s) | PASS | nenhum corte com preto > 0,15 s |
| F7 com o áudio do MP4 (48 kHz) | PASS | S05 0,0% / mediana 31,0 dB · S08 1,1% / 29,5 dB. Obs.: a 1ª passada deu FAIL porque extraí o MP4 a 24 kHz contra a voz em 48 kHz (erro meu de método, não do mix) |
| F8 `fx_check.py --asr` (mix = áudio do MP4), 4 cenas | PASS | S04 1,5% → 1,5% · S05 0,0% → 0,0% · S08 2,6% → 2,6% · S10 1,7% → 0,0% |
| F6 (alinhamento) | PASS no papel, **não verifica nada** | todo `reason` continua `motion:Sxx@t` com t = tempo do próprio evento (defeito de processo aberto desde o ciclo 1, R9) |
| F4 (espaçamento ≥ 1,0 s) | PASS no validador; **viola o texto da rubrica** | `pin`/`label`/`sweep` ficam fora do F4 (`MINOR`). S10 19,80 / 20,00 / 20,30 / 20,50 s (4 eventos em 0,7 s); S09 22,68 / 22,90 s; S02 10,33 / 10,43 s |

## Rubrica visual por cena (0–5; mínimo 4)

| Cena | V1 | V2 | V3 | V4 | V5 | V6 | V7 | Evidência |
|---|---|---|---|---|---|---|---|---|
| S02 | 4 | **3** | 5 | 4 | 4 | 4 | 4 | Escritório noturno, Brasília ao entardecer, sala de reunião, Hanói: cada tomada tem cena própria. Bandeira dos EUA cortada pela borda superior direita (0–5,8 s). Documento continua só com linhas cinza (17,7–23,8 s) |
| S03 | 4 | **3** | 5 | 4 | **3** | **3** | 4 | 0–7 s ainda é a linha do tempo em fundo escuro (0,35 s: só marcas de ano). "1975 · Saigon" encosta na borda direita (6,80 s). "um lugar para o Brasil" em vermelho sobre o Congresso escuro: baixo contraste (8,47 s). Bandeira cortada na borda (9,75 s) |
| S04 | 4 | **3** | 5 | 4 | **3** | 4 | 5 | Ba Dinh com bandeiras e chapéus cônicos é a melhor ideia do lote, mas a multidão lê como setas repetidas (3,75–11,9 s). Títulos das declarações escritos **por cima dos pergaminhos** (15,55 / 18,80 s). Bandeiras cortadas no topo no zoom (9,25 s). Documento com linhas cinza (19–22,75 s) |
| S05 | 4 | **3** | 5 | 4 | **3** | 4 | 5 | Explosão da usina em 21,20–21,25 s, junto de "usina" (21,20) e do `impact` (21,20): sincronismo certo. Mas a usina é um retângulo com janelas e a explosão é um borrão laranja que apaga o prédio (21,5–22,4 s). **Veleiros** com bandeira britânica/francesa **solta no céu, sem mastro** (0–6,5 e 9–15,8 s). "França × Viet / Minh" quebra o nome (28,29 s). Rua em guerra quase preta (23,15 s) |
| S06 | 4 | **3** | 5 | 4 | **3** | 4 | 4 | Doca com veleiro em 1950 e bandeira americana flutuando sem mastro (0–3 e 6,9–11,9 s). "1954" escrito em cima da bandeira americana (21,55 s). Miller Center sobre a mesa com bandeiras **dos EUA e do Brasil** (16,2–21,2 s). Barra 78% e dominó bons |
| S07 | 4 | **3** | 5 | 4 | **3** | 5 | 4 | Vale de Dien Bien Phu: fumaça, clarões, arame farpado, a melhor atmosfera do lote. "A FRANÇA COMBATE NO NORTE DO VIETNÃ" sobre a rua de **Saigon** com bandeira francesa (6,7–11,2 s), texto em cima das casas. "quem vai governar o país?" em vermelho sobre casas escuras (17,38 s) |
| S08 | 4 | **3** | 5 | **3** | 4 | 4 | 4 | Genebra com bandeiras FR/EUA/CA/IN/PL (0–4,7 s, ver fidelidade). Rio com torres de vigia e névoa: bom (4,7–14,2 s). "cada lado administra a sua parte" na mesa com bandeiras **EUA e Brasil** (14,2–18 s). "cessar-fogo" sobre o vale com **clarões de artilharia** (21,4–24,4 s). 3 das 7 tomadas reaproveitam plates de outras cenas |
| S09 | 4 | **3** | 5 | **3** | 4 | 4 | **3** | 5 das 7 tomadas repetem plates já vistos (dmz, saigon-street, command-room, ballot-box, advisors-line). Mapa de 20,8–27 s **sem linha nenhuma**: "FRONTEIRA" flutua à esquerda (26,80 s) enquanto a fala diz "a linha provisória vira uma fronteira de fato" (mesmo defeito D5 dos ciclos anteriores). Cartão "LINHA PROVISÓRIA" cobre o topo da torre (0,35 s) |
| S10 | 4 | **3** | 5 | **3** | **3** | **3** | 4 | Helicópteros e arrozais: bom movimento (2,7–5,3 s), mas o cartão "MAIO DE 1961" cobre um helicóptero (3,05 s). advisors-line e command-room aparecem 2 vezes cada. Linha do tempo e gráfico (19,7–28,4 s, 8,7 s) voltam ao fundo escuro vazio; título e fonte do gráfico quase transparentes, ilegíveis em 360p; gráfico preso no canto inferior esquerdo (24,75 s: quadro quase vazio) |

**Resposta à pergunta "parece cinematografia ou cartão de texto?"** Metade de cada. As tomadas `plate` (20% do tempo) parecem cinematografia ilustrada e estão no nível do estilo D validado. As tomadas `typo`/`date`/`stat` (56%) são cartões de texto com uma ilustração atrás, escurecida por vinheta e grade de cor; a ilustração não faz nada ligado à frase. Doc, mapa, linha do tempo e gráfico (24%) não mudaram desde a versão reprovada.

**Por que V2 = 3:** `Cam` (`lacre/draw.tsx:298`) escala e desloca o quadro inteiro de uma vez; não existe deslocamento diferente por profundidade. `Ridge`/`Karst` têm `speed` 0,03–0,06 px/quadro (1–2 px/s), iguais entre camadas (ex.: os 3 `Karst` de `valley-dbp` usam o padrão 0,06). Fumaça, partículas, pássaros e bandeiras se movem, mas isso é V6, não parallax. Correção: `Cam` com fator por camada (fundo 0,3x, meio 0,6x, frente 1,2x do pan/zoom), ou passar `depth` a cada componente.

## Fidelidade das ilustrações (texto × fala × fontes × imagem)

Textos na tela: conferidos com `props/Sxx.json` e fontes. HO45 (reaberto) sustenta "British expeditionary forces, which arrived in early September", "some 15,000 French troops arrived in Tonkin" e "half a million people gathered in Ba Dinh Square". GEN (reaberto) sustenta art. 1, 4, 11, 14(a) e art. 34 ("Canada, India and Poland"). Nenhum número na tela contradiz a fala. Os erros estão nas imagens:

| # | Cena / tempo (s) | O que a imagem afirma | Por que está errado | Correção |
|---|---|---|---|---|
| F-1 | S05 0–6,5 e 9–15,8 · S06 0–3 e 6,9–11,9 | Frota de **veleiros de três mastros** (navio de 1807 da plate D) trazendo britânicos em 1945, franceses em 1946 e ajuda americana em 1950 | Anacronismo de 140 anos: navios a vapor/diesel, transportes de tropa e lanchas de desembarque | Plate nova: navio de transporte cinza com chaminé, lanchas de desembarque (1945–46); cargueiro com guindaste (1950) |
| F-2 | S06 16,2–21,2 · S08 14,2–18,0 | Mesa com bandeiras **dos EUA e do Brasil** atrás de "Miller Center, Universidade da Virgínia" e de "cada lado administra a sua parte" | O Brasil não tem relação com essas frases; na S08 a frase é sobre as duas zonas do Vietnã | Variante da plate sem bandeiras, ou com as bandeiras certas (S08: nenhuma, ou a do Norte e a do Estado do Vietnã, cada uma de um lado da mesa) |
| F-3 | S08 0–4,7 | Conferência de Genebra com bandeiras de França, EUA, Canadá, Índia e Polônia | Canadá, Índia e Polônia formam a comissão de fiscalização (art. 34), não eram partes. O acordo de cessar-fogo foi assinado pelo comando da União Francesa e pelo do Exército Popular do Vietnã; os EUA não o assinaram. Faltam Reino Unido, URSS e China (copresidentes e participantes) | Bandeiras de França e do Vietnã do Norte (as partes do acordo citado), ou mastros sem bandeira. Deixar CA/IN/PL só na S09 |
| F-4 | S08 0–4,7 · S09 3,6–8,9 | Bandeira do Canadá desenhada como branco com faixas e círculo vermelhos (lê como a do Japão) | Em 1954 o Canadá usava a Red Ensign; a folha de bordo é de 1965 | Red Ensign simplificada (fundo vermelho, Union Jack no canto, escudo) |
| F-5 | S08 21,4–24,4 | "cessar-fogo" sobre o vale com clarões de artilharia e fumaça | A imagem mostra combate na frase que anuncia o fim do combate | Mesmo vale sem `Flash`, fumaça baixando, ou amanhecer calmo |
| F-6 | S07 6,7–11,2 | "a França combate no norte do Vietnã / perde para o Viet Minh" sobre a rua de **Saigon** com bandeira francesa | Lugar oposto ao da fala | Manter o vale de Dien Bien Phu (zoom de saída) ou mapa do norte |
| F-7 | S09 8,9–11,5 | "AGOSTO 1955" (Diem recusa as conversas) na rua de Saigon com bandeira **francesa** | Em 1955 o Sul é o Estado do Vietnã de Diem; a bandeira francesa sugere domínio francês | Bandeira do Estado do Vietnã (amarela com 3 faixas vermelhas) ou nenhuma |
| F-8 | S09 11,5–17,0 | Diem numa sala com bandeira **americana** | Sugere que Diem governava de dentro de uma sala dos EUA. A plate é a do comando americano (MACV) na S10 | Variante sem bandeira ou com a do Estado do Vietnã |
| F-9 | S09 20,8–27,0 | Mapa sem linha do paralelo 17; "FRONTEIRA" solta | A fala é sobre a linha virar fronteira; a linha some | Desenhar a linha só em terra (~106,5°E a ~107,1°E, 17°N, rio Ben Hai) e prender o rótulo nela |
| F-10 | S10 2,7–5,3 | Helicópteros sobre arrozais em "MAIO DE 1961", logo depois de "os americanos entram" | Não verificado em `sources.md`. Pelo meu conhecimento, as primeiras companhias de helicópteros do Exército dos EUA chegaram em dezembro de 1961; em maio de 1961 o MAAG tinha 685 assessores. Plausível como ilustração do período, mas cola helicóptero americano numa data em que não estavam lá | Usar a plate na tomada de fevereiro de 1962 (MACV), ou trocar a de maio de 1961 por assessores/jipe |
| F-11 | S02 5,8–8,9 | "LINCOLN GORDON, embaixador dos EUA" sobre o Congresso em Brasília | Não verificado: em 1965 a embaixada dos EUA ficava no Rio, e o FRUS225 não diz onde foi a reunião | Plate neutra (escritório) ou confirmar o local |
| F-12 | S08 4,7–14,2 · S09 0–3,6 | Torres de vigia com holofote e arame farpado na zona desmilitarizada em 1954 | Plausível para anos depois, não documentado para 1954 | Aceitável como ilustração; reduzir holofotes, ou registrar como licença artística |

Bandeiras conferidas e corretas: Vietnã do Norte (vermelha com estrela amarela) em Hanói 1945 e Ba Dinh; britânica (Union Jack) na chegada de setembro de 1945; francesa em Saigon e no Tonkin; americana no escritório, na doca, na sala de imprensa e na fila de assessores; Índia e Polônia na comissão. Chapéus cônicos na multidão de Ba Dinh: corretos.

## Defeitos de render (priorizados)

| # | Prioridade | Cena / tempo (s) | Defeito | Correção |
|---|---|---|---|---|
| R-1 | Alta | S05 0–6,5, 9–15,8 · S06 0–3, 6,9–11,9 | Bandeira solta no céu, sem mastro (`pole={0}` em `fleet-dawn` e `dock-crates`) | Mastro no navio ou no cais |
| R-2 | Alta | S04 12,1–19,0 | "Declaração de Independência" e "Declaração dos Direitos do Homem e do Cidadão" escritos por cima dos pergaminhos | Texto acima ou abaixo dos pergaminhos, ou rótulo dentro de cada pergaminho |
| R-3 | Alta | S02 17,7–23,8 · S04 19–22,75 · S06 3–6,9 · S07 11,2–15,7 | Documentos continuam com linhas cinza no lugar do texto (pedido D6 dos ciclos anteriores) | Trecho real: FRUS225 "made a very strong pitch on the troops"; HO45 "an appeal to the victorious Allies to recognize the independence of Vietnam"; GEN art. 14(a) "pending the general elections which will bring about the unification of Viet-Nam" |
| R-4 | Média | S06 21,2–25 | "1954" escrito em cima da bandeira americana | Mover a bandeira ou o cartão |
| R-5 | Média | S03 7–9,95 · S07 15,7–19,05 | Texto XL vermelho (`seal`) sobre prédios escuros: baixo contraste | Cor `paper` ou faixa escura atrás |
| R-6 | Média | S07 6,7–11,2 | Linha "A FRANÇA COMBATE NO NORTE DO VIETNÃ" sobre as casas, em 2 linhas apertadas | Resolver junto do F-6 |
| R-7 | Média | S10 19,7–28,4 | Linha do tempo e gráfico em fundo vazio; título/fonte do gráfico quase transparentes; gráfico no canto inferior esquerdo | Gráfico centralizado sobre plate (advisors-line desfocada), título opaco |
| R-8 | Média | S05 21,3–22,8 | A explosão apaga a usina num borrão; não se vê o prédio atingido | Manter a silhueta da usina, apagar as janelas em cascata, clarão + fumaça subindo do prédio |
| R-9 | Média | S05 28,29 | "França × Viet / Minh" quebra o nome (D15 dos ciclos anteriores) | Não quebrar "Viet Minh" / tamanho menor |
| R-10 | Baixa | S02 0–5,8 · S03 9,0–9,95 · S04 9,25 | Bandeiras cortadas pela borda do quadro com o zoom | Margem segura para bandeiras |
| R-11 | Baixa | S03 6,2–7,0 | "1975 · Saigon" encostado na borda direita | Margem de 5% |
| R-12 | Baixa | S09 0,2–3,4 · S10 2,74–5,1 | Cartão de nome cobre a torre (S09) e um helicóptero (S10) | Posicionar o cartão no céu livre |
| R-13 | Baixa | todas as tomadas `date` | Linha de cima da cartela ("19 DE DEZEMBRO", "ACORDO DE GENEBRA · 20 DE JULHO", "7 DE ABRIL", "8 DE FEVEREIRO") em dourado escuro sobre fundo escuro: legível em 1080p, apagada em 360p | Mais opacidade/peso |
| R-14 | Baixa | S04 3,4–11,9 | Multidão lê como setas repetidas em fileiras regulares | Variar altura, ombros, espaçamento; cabeças sobrepostas |
| R-15 | Baixa | `sources.md` | A tabela de assets não registra as plates procedurais (R13) | Linha "Ilustrações procedurais em código (`plates.tsx`, `cine.tsx`), autoria própria" |

## Som × imagem

- **S05 usina:** `impact` em 21,20 s; palavra "usina" em 21,20 s; clarão começa entre 21,15 e 21,25 s (quadros). **Sincronizado.**
- S02 rota: `sweep` 8,85 s com a rota de 8,85 a 10,43 s; `pin` 10,33 s com "VIETNÃ" (10,75 s no quadro); `hit` 10,43 s. OK, mas `pin` e `hit` a 0,1 s um do outro.
- S06 dominó: `sweep` 27,90 s = `fall_s` 27,9; barra 78%: `sweep` 13,12 s = `bar.at_s`. OK.
- S09 PROVISÓRIA→FRONTEIRA: `sweep` 25,07 / `pin` 25,54 s com a troca (26,80 s no quadro). OK, mas sem a linha no mapa (F-9).
- S10 linha do tempo: 4 eventos em 0,7 s (19,80–20,50). Ouvido como um bloco de cliques. Um `sweep` só basta.
- Clarões sem som: artilharia em S07 0–6,7 e S08 21,4–24,4 (a cada ~1,7 s), flashes da sala de imprensa em S06 21,2–25. Não há som de canhão (bom para a voz), mas a regra F9 diz que flash só em evento `visual: true`. Decidir: ou a regra vale só para a camada `fx.tsx` (registrar no rubric), ou os clarões das plates entram como eventos.
- F10: 4 quedas de trilha (S02 17,3; S06 24,2; S08 9,9; S10 4,9) em 3,8 min. Não remedido neste ciclo.

## Correções pedidas (ordem)

1. F-1 a F-9 (fidelidade das imagens): plates novas ou variantes de `meeting-table`, `saigon-street`, `command-room`, `valley-dbp`, `geneva-lake`; bandeira do Canadá de 1954; linha do paralelo 17 no mapa da S09.
2. Parallax real em `Cam` (V2).
3. R-1 a R-3 (bandeira sem mastro, texto sobre pergaminhos, documentos com texto real).
4. Reduzir reuso: no máximo 2 usos por plate no lote e nunca em contexto de lugar diferente; nas tomadas `typo`/`date`/`stat`, a plate deve mostrar algo ligado à frase.
5. R-4 a R-9, S10 19,7–28,4 (R-7).
6. Processo: F6 com `reason` ligado à palavra ou ao `at_s` do elemento (aberto desde o ciclo 1); F4 do validador × texto da rubrica (decidir e alinhar).
7. Depois: `scene_gates.py`, `shot_check.py`, F8 em 3 cenas e nova folha de quadros (início/meio/fim).

## Artefatos da revisão
Scratchpad `/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/v2/`: `Sxx_mgrid.jpg` (início/meio/fim de cada tomada), `S05_xgrid.jpg` (explosão), `S06_cgrid.jpg` e `S08_cgrid.jpg` (cortes), `z_dates.jpg` (cartelas em 1080p), `D4_sheet.jpg` (referência estilo D), `gates.py` (cópia de `scene_gates.py` que grava no scratchpad), `Sxx_ref.txt` e `Sxx_mp4.wav` (F8).

---

# Ciclo 2 (último, R6) — 2026-11-19

Renders avaliados: `media/pt-br-historia/vietna/render/S02.mp4` … `S10.mp4` (23:21–23:24), `props/Sxx.json`, `Sxx_mix.events.json`, `studio/remotion/src/vietna/cine.tsx` (`Cam2`, `L`), `plates.tsx`, `pipeline/validate/fx_check.py` (F6 novo), `pipeline/assembly/vietna_prep.py`.
Método: 3 quadros por tomada (início +0,35 s, meio, fim −0,2 s) nas 50 tomadas; 9 quadros na explosão da S05 (21,0–22,7 s); 6 nos pergaminhos da S04 (13–18,9 s); 6 na troca PROVISÓRIA→FRONTEIRA (S09 24,9–26 s); 6 na linha do tempo da S10 (19,75–21,3 s); quadros a ±0,1 s de todos os cortes da S06 e da S09; recortes 1080p da bandeira da doca (S06 1,5 s), da sala da S06 (3,35 s) e das cartelas de data. FRUS225 reaberto (history.state.gov, d225). Testes de sensibilidade do F6 com eventos deslocados de propósito (cópias no scratchpad).

## Veredito: REFAZER (ciclo 2 de 2 → escalar ao usuário, R6)

As correções de fidelidade funcionaram: 10 dos 12 problemas de imagem do ciclo 1 foram resolvidos (navios a vapor, mesas sem bandeira, Genebra sem bandeiras, Red Ensign, bandeira do Vietnã do Sul, cessar-fogo calmo, França no vale, Gordon na sala, sem helicópteros em 1961). O parallax agora existe. Mas só a S08 passa em todos os critérios; 7 cenas têm pelo menos uma nota 3, e há 4 defeitos que o autor deu como corrigidos e que continuam na tela: bandeira sem mastro na S06, títulos por cima dos pergaminhos na S04 (agora com o rótulo francês no pergaminho americano), mapa da S09 sem a linha e explosão da usina em borrão.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| `shot_check.py scenes_spec.json props/` | PASS | S01–S10 |
| `scene_gates.py` (cópia em `scratchpad/v3/gates.py` que não grava na produção) | PASS 9/9 | sem trecho parado; −14,6 a −14,9 LUFS; pico −1,6/−1,7 dBFS; fx PASS |
| `blackdetect` (0,15 s) | PASS | 0 nas 9 cenas |
| F7 (áudio do MP4, 48 kHz) | PASS | S04 0,0%/29,3 dB · S05 0,0%/31,0 dB · S08 1,1%/29,5 dB · S10 0,0%/30,2 dB |
| F8 `fx_check.py --asr` (mix = áudio do MP4), 4 cenas | PASS | S04 1,5→1,5% · S05 0,0→0,0% · S08 2,6→2,6% · S10 1,7→0,0% |
| F6 novo (`word:<palavra>#N`) | PASS, **parcial como processo** | Os 44 eventos `word:` caem a ≤ 0,2 s da N-ésima ocorrência (conferido evento a evento). Dois furos: (1) a tolerância de 0,9 s vale para **todo** reason com `#`, não só para eventos visuais (`fx_check.py:81`); todos os 44 têm `#`, então o limite de ±0,3 s da rubrica deixou de ser checado. Teste: `impact` da usina deslocado +0,65 s → PASS; a mensagem de erro ainda diz "máx. 0,3". (2) Os 40 eventos `motion:Sxx@t` continuam com t = tempo do próprio evento: o `sweep` do dominó movido de 27,9 s para 5,0 s (reason `motion:S06@5.00`) → PASS. 13 deles não batem com nenhum `at_s` das props (ex.: S06 14,45 / 21,55 / 29,80; S10 25,6 / 27,76) |
| `vietna_prep.py` cue ambíguo | PASS | `AMBIG` reprova com `return 1`; `at_cue` gravado nas props |
| F4 (texto da rubrica) | **aberto** | S10 19,80 / 20,00 / 20,30 / 20,50 s (4 eventos em 0,7 s, ouvidos como bloco); S09 22,68 / 22,90 s; S02 10,33 / 10,43 s |

## Rubrica visual por cena (0–5; mínimo 4)

| Cena | V1 | V2 | V3 | V4 | V5 | V6 | V7 | Evidência |
|---|---|---|---|---|---|---|---|---|
| S02 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | Parallax visível no escritório e na sala de Gordon. Documento com o trecho real do FRUS225 ("we separated the $150 million program loan from the issue of troops", conferido na fonte). Bandeira dos EUA cortada pela borda direita em 5,6 s e de 10,95 a 17,7 s. "150 milhões" (0–5,8 s) ainda é texto grande sobre escritório vazio |
| S03 | 4 | **3** | 5 | 4 | **3** | **3** | 4 | 0–7 s (70% da cena) é linha do tempo sem camada nem ilustração (0,35 s: só marcas). "1975 · Saigon" a ~8 px da borda direita (6,80 s). "um lugar para o Brasil" vermelho sobre o Congresso escuro (8,47 s). Bandeira do Brasil cortada à direita (8,47 / 9,75 s) |
| S04 | 4 | 4 | 5 | 4 | **3** | 4 | 5 | Ba Dinh com zoom em camadas (multidão cresce mais que o prédio). Pergaminhos: os **dois** títulos ficam empilhados sobre o pergaminho da esquerda (bandeira dos EUA); "Declaração dos Direitos do Homem e do Cidadão / FRANÇA" fica sobre o pergaminho americano, não sob a bandeira francesa (16,0–18,9 s); texto claro sobre papel claro. Bandeiras cortadas no topo (9,25–11,9 s e 22,55 s). Multidão ainda em fileiras de setas |
| S05 | 4 | 4 | 5 | 4 | **3** | 4 | 5 | Navios a vapor com chaminé e fumaça: correto. Usina: em 21,25 s um brilho cobre o prédio; de 21,6 a 22,7 s só sobra borrão laranja, o prédio some. "França × Viet / Minh" ainda quebra o nome (28,29 s). "19 DE DEZEMBRO" quase apagado |
| S06 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | Bandeira americana **sem mastro**, solta no céu (0–3 s e 6,9–11,9 s; `dock-crates` em `plates.tsx:330` chama `Flag` sem `pole`, padrão 0). Caixas na frente da multidão com profundidade menor (d 0,5) que ela (d 1,25): a frente anda menos que o fundo. "MILLER CENTER…" por cima de uma silhueta (18,7–21 s). "1954" saiu de cima da bandeira (resolvido) |
| S07 | 4 | 4 | 5 | 4 | **3** | 5 | 4 | "A França combate no norte" agora sobre o vale (resolvido). "quem vai governar o país?" em vermelho por cima das casas vermelhas e creme (17,38 / 18,85 s): baixo contraste |
| S08 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | Genebra sem bandeiras, mesa sem bandeiras, vale calmo no cessar-fogo: corretos. "ELEIÇÕES" sobre a urna (19,7–21,2 s). Cena aprovada |
| S09 | 4 | 4 | 5 | **3** | 4 | 4 | **3** | Red Ensign e bandeira do Vietnã do Sul corretas; cartão não cobre mais a torre. Mapa 20,8–27 s **continua sem a linha do paralelo 17**: "FRONTEIRA" flutua sobre Laos/Tailândia (26,0 s). 5 das 7 tomadas reaproveitam plates. Bandeira do Sul cortada no canto superior direito na sala de Diem (11,85–16,8 s) |
| S10 | 4 | **3** | 5 | **3** | **3** | **3** | 4 | Saigon com bandeira do Sul em maio de 1961 e cartão no céu (resolvido). Linha do tempo + gráfico (19,7–28,44 s, 31% da cena) em fundo vazio, sem camadas; eixo só rotulado "1961"; título e fonte do gráfico quase transparentes; 24,75 e 26,42 s com o quadro praticamente vazio. advisors-line 2x e command-room 2x na mesma cena. Texto sobre as cabeças dos soldados (1,35–2,5 s e 8,65–11,8 s). Bandeira dos EUA cortada no topo (8,65–11,8 s) e à direita (12–19,7 s) |

**V2 (parallax).** Resolvido nas tomadas ilustradas: `L` reescala cada camada por profundidade (`cine.tsx:457`), céu d 0,06, relevo 0,3–0,6, frente 1,25–1,7. Nos quadros, a lua e o céu ficam parados enquanto prédio e multidão crescem (S04 3,75→8,70 s). O pan horizontal continua global (`Cam2` aplica `translate` ao quadro todo), então a profundidade vem só do zoom. Linha do tempo, gráfico, mapa e documento não têm camadas: por isso S03 e S10 ficam em 3.

**Cartão de texto ou cena ilustrada?** Melhorou. Agora leem como cena com legenda: S06 7–11,9 s (US$ 10 milhões sobre a doca), S08 10,7–14,2 s (5 km sobre o rio com torres), S09 8,9–11,5 s (1955 em Saigon com a bandeira do Sul), S10 5,3–12 s (685 sobre a fila de assessores), S04 8,9–12,1 s (500 mil sobre a multidão). Ainda leem como cartão com fundo: S02 0–5,8 s e 10,95–17,7 s (escritório vazio, texto domina), S05 15,8–22,8 s (1946 sobre silhueta escura) e 22,8–28,5 s, S06 16,2–21,2 s e S08 14,2–18 s (sala escura com duas silhuetas), S10 15,8–19,7 s, e as linhas do tempo e o gráfico (S03 0–7 s, S10 19,7–28,44 s), que não têm ilustração nenhuma. A luminância média das cenas (40–73) está no nível do D4 (54); o escurecimento do ciclo 1 foi resolvido.

## Situação dos defeitos do ciclo 1

| # | Situação | Evidência no ciclo 2 |
|---|---|---|
| F-1 veleiros | **Resolvido** | Navios a vapor (S05 0,35–15,6 s; S06 0,35–11,7 s) |
| F-2 bandeiras EUA/Brasil na mesa | **Resolvido** | S06 16,55–21 s e S08 14,55–17,8 s sem bandeiras |
| F-3 bandeiras em Genebra | **Resolvido** | S07 11,55–15,5 s e S08 0,35–4,5 s sem bandeiras |
| F-4 Canadá 1954 | **Resolvido** | Red Ensign simplificada (S09 3,95–8,7 s) |
| F-5 clarões no cessar-fogo | **Resolvido** | S08 21,75–24,2 s sem clarões |
| F-6 Saigon para "França combate no norte" | **Resolvido** | Vale de Dien Bien Phu (S07 7,05–11 s) |
| F-7 Saigon 1955 com bandeira francesa | **Resolvido** | Bandeira do Estado do Vietnã (S09 9,25–11,3 s) |
| F-8 Diem com bandeira americana | **Resolvido** | Bandeira do Sul (S09 11,85–16,8 s), mas cortada na borda |
| F-9 mapa sem paralelo 17 | **Aberto** | S09 20,8–27 s: só pinos NORTE/SUL e cartão à esquerda |
| F-10 helicópteros em maio de 1961 | **Resolvido** | S10 2,7–5,3 s: Saigon + cartão |
| F-11 Gordon diante do Congresso | **Resolvido** | Sala de reunião (S02 5,8–8,9 s) |
| F-12 torres de vigia em 1954 | Aceito como licença | Não registrado em lugar nenhum; registrar em `decisions.md` |
| R-1 bandeira sem mastro | **Parcial** | S05 resolvido; **S06 0–3 s e 6,9–11,9 s continua** (`dock-crates`, `Flag` sem `pole`) |
| R-2 texto sobre pergaminhos | **Aberto (pior)** | S04 15,55–18,9 s: os dois títulos sobre o pergaminho da esquerda; o rótulo francês fica sob a bandeira americana |
| R-3 documentos com linhas cinza | **Resolvido** | S02 com trecho real do FRUS225; os outros três viraram plates com cartão |
| R-4 "1954" sobre a bandeira | **Resolvido** | S06 21,55–24,8 s |
| R-5 vermelho sobre fundo escuro | **Aberto** | S03 8,47–9,75 s; S07 17,38–18,85 s |
| R-6 linha da S07 sobre as casas | **Resolvido** | Vale; resta a quebra "NORTE DO / VIETNÃ" (cosmético) |
| R-7 S10 linha do tempo e gráfico | **Aberto** | Sem mudança |
| R-8 explosão apaga a usina | **Aberto** | S05 21,6–22,7 s |
| R-9 "Viet / Minh" | **Aberto** | S05 28,29 s |
| R-10 bandeiras cortadas pela borda | **Aberto** | S02 10,95–17,7 s; S03 8,4–9,95 s; S04 9,25–11,9 e 22,55 s; S06 3–6,9 s; S09 11,5–17 s; S10 5,3–19,7 s |
| R-11 "1975 · Saigon" na borda | **Aberto** | S03 6,8 s |
| R-12 cartão sobre torre/helicóptero | **Resolvido** | S09 0,35 s; S10 3,05 s |
| R-13 linha de cima das datas | **Aberto** | Dourado escuro sobre fundo escuro (S04 1,7 s; S10 13,9 s) |
| R-14 multidão em setas | **Aberto** | S04 3,75–11,9 s |
| R-15 plates em `sources.md` | **Aberto** | Nenhuma linha para `plates.tsx`/`cine.tsx` |
| Reuso de plates (máx. 2) | **Parcial** | Contexto de lugar agora bate, mas hanoi-dawn 4x, command-room 4x, saigon-street 4x, dmz-river 3x, advisors-line 3x, meeting-table 3x |
| Processo F6 | **Parcial** | Ver tabela de validadores |
| Processo F4 | **Aberto** | S10 19,8–20,5 s |

## Defeitos novos

| # | Prioridade | Cena / tempo (s) | Defeito | Correção |
|---|---|---|---|---|
| N-1 | Alta | S04 16,0–18,9 | Rótulo da declaração francesa sobre o pergaminho americano (afirma errado qual texto é qual) | Cada título dentro ou abaixo do seu pergaminho, alinhado à sua bandeira |
| N-2 | Média | `fx_check.py:81` | Tolerância de 0,9 s aplicada a todo `#N`, inclusive som de impacto | 0,9 s só com `visual: true` ou só para o elemento visual; som ±0,3 s; mensagem com o limite real |
| N-3 | Média | S06 18,7–21; S08 19,7–21,2; S09 17–20,6; S10 0–2,7, 5,3–11,8, 15,8–19,7 | Texto por cima de silhuetas, urna e cabeças dos soldados | Reservar uma área livre na plate para o texto (céu ou chão) |
| N-4 | Baixa | S06 `dock-crates` | Caixas em primeiro plano com d 0,5, atrás da multidão (d 1,25) em profundidade | Caixas com d ≥ 1,3 |
| N-5 | Baixa | S06 1,5 s; S09 3,7–8,8 s | Bandeiras com listras em degraus (serrilhado da ondulação) | Mais fatias ou suavização na `Flag` |
| N-6 | Baixa | S08 27,23 s | Legenda "NO NORTE, 1º DE AGOSTO" junta pedaços de duas datas enquanto o mapa mostra "NORTE · 27 JUL." | Quebrar a legenda na vírgula: "27 de julho no Norte," / "1º de agosto no centro" |

## Correções restantes (ordem)

1. S06 0–3 e 6,9–11,9 s: mastro na bandeira da doca (R-1).
2. S04 12,1–19 s: títulos dos pergaminhos no lugar certo, fora do papel (R-2, N-1).
3. S09 20,8–27 s: linha do paralelo 17 só em terra, com o cartão preso a ela (F-9).
4. S05 21,2–22,8 s: usina continua visível na explosão (R-8); S05 28,29 s: "Viet Minh" sem quebra (R-9).
5. S03 0–7 s e S10 19,7–28,44 s: linha do tempo e gráfico sobre plate, com título e fonte opacos e gráfico centrado (R-7); S03 8,4–9,95 s e S07 15,7–19,05 s: texto vermelho legível (R-5).
6. Bandeiras dentro do quadro (R-10) e texto fora das figuras (N-3).
7. Processo: F6 com tolerância por tipo de evento e `motion:` ligado ao `at_s` de um elemento das props; F4 na S10.
8. Baixa: R-11, R-13, R-14, R-15, N-4 a N-6, registrar F-12 em `decisions.md`.

Como este foi o 2º ciclo (R6), a próxima rodada precisa de decisão do usuário. Itens 1–4 são correções pontuais em `plates.tsx`/props; o item 5 é o único que exige desenho novo.

## Artefatos
`/tmp/claude-1000/-home-jonnathan-projects-ai-youtube-channel/cab3ab6d-0572-4108-96a3-1f6deef3c491/scratchpad/v3/`: `Sxx_mgrid.jpg` (início/meio/fim de cada tomada), `S05_xgrid.jpg` (explosão), `S04_pgrid.jpg` (pergaminhos), `S09_fgrid.jpg` (troca de rótulo), `S10_tgrid.jpg` (linha do tempo), `S06_cgrid.jpg` e `S09_cgrid.jpg` (cortes), `z_s06_flag.jpg` (bandeira sem mastro), `z_dates.png`, `gates.py`, `t_fx.json`/`t_fx2.json` (testes do F6).
