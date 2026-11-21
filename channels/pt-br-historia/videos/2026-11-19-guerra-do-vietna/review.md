# Revisão independente: roteiro "Vietnã: o dia em que os EUA pediram soldados ao Brasil"
Revisor: reviewer (independente; `protocols/review.md`). Data: 2026-11-19. Objeto: `script.md` (53 cenas, 3.094 palavras narradas, 20,6 min a 150 ppm segundo `script_check.py`).
Learnings aplicáveis: L01 (som/efeito com motivo e orçamento, obrigatória), L02 (som de movimento, obrigatória), L03 (nível de voz, hipótese; é de produção).

## Veredito: **REFAZER**
Nota da rubrica: **90,8/100** (mínimo 80). A nota passa, mas o DoD exige fact-check 100% OK e há 3 erros factuais (cenas 4, 8 e 43), 3 afirmações SEM FONTE (cenas 9, 39 e 43) e 22 AJUSTAR, alguns no próprio payoff (cenas 46, 51 e 52). As correções cabem em um ciclo e não mudam a estrutura.

## Validadores rodados
| Validador | Resultado |
|---|---|
| `script_check.py <pasta>` | PASS (0 erros, 15 avisos de slop; 0 frases com mais de 30 palavras; média de 13,1 palavras por frase) |
| `slop_check.py script.md` | FAIL (16 marcas, limite 2). Quase todas são **falsos positivos** de listas de datas e de cifras (cenas 5, 8, 9, 11, 12, 13, 18, 24, 25, 28, 39, 40, 47). As de R17 reais estão na seção R17 abaixo |
| `originality_check.py` contra as 5 transcrições de referência | PASS (máximo de 0,87% contra _mgBkiEKY6E; limite 3%) |

## Fontes reabertas nesta revisão (2026-11-19)
Reabri: FRUS d225, carta UCSB, FRUS v32 d85, tese Marson (pdftotext, p. 44), Gallup, NARA casualty, NSA/Hanyok (press release do NSArchive), Pentagon Papers (NARA e Wikisource), Paris (TAH), Tonkin (Avalon), Genebra (Avalon), War Powers (FRUS v35 d26 e house.gov), Miller Center (Eisenhower, Kennedy, kennedy-commitment), NARA Remembering Vietnam 1-4 e 5-8, history.state.gov (tet, ending-vietnam, gulf-of-tonkin, dien-bien-phu), Country Study 22, 23, 24, 25 e 31, CFR Tonkin, PBS My Lai, FAPESP, healthdata.org e o resumo do BMJ (Europe PMC, PMID 18566045), FRUS 1961-63 v3 d281 (Cabo 243), UCSB (discurso de Nixon de 29/03/1973).
**Não reabri** (status baseado só no trecho do `sources.md`): BR1, BR2, BR3, BUD1, BUD2, DRAFT, IOM, JULY65, KHE1, KHE2, LB2, MAAG, MARCH67, MILL, REF, UNIF, WIL, ANPUH, COM.

## Fact-check linha a linha
Status: OK / AJUSTAR (exagero, imprecisão ou atribuição errada) / SEM FONTE / ERRO (o texto contradiz a fonte).

| Cena | Afirmação | Status | Fonte conferida e correção |
|---|---|---|---|
| 01 | Em dez/1965 o embaixador pediu soldados ao presidente do Brasil; documento do governo dos EUA registra o que veio depois | OK | d225: "made a very strong pitch on the troops"; relato da reunião no telegrama de 17/12. A data exata da reunião não aparece (ver Contrato) |
| 02 | Na mesma reunião do empréstimo de US$ 150 milhões, "pressão muito forte por tropas" | AJUSTAR | d225 também diz "we separated the $150 million program loan from the issue of troops". Ao omitir isso, o texto e o rótulo "150 milhões" no arco sugerem uma troca que o memorando nega. Acrescentar: "O governo americano diz que tratou os dois assuntos separados, mas o pedido foi feito na mesma conversa." |
| 03 | "Cada data e cada número vêm de documento ou de pesquisa publicada" | OK (condicional) | Só é verdade depois das correções desta revisão |
| 04 | 02/09/1945, Ba Dinh, ~500 mil, apelo aos aliados | OK | Country Study 22: "half a million people", "appeal to the victorious Allies" |
| 04 | "O texto se inspira nas declarações de independência americana e francesa" | **ERRO** | CS22: "American Declaration of Independence and the French Declaration of the Rights of Man and the Citizen". A França não tem declaração de independência. Texto: "O texto se inspira na Declaração de Independência americana e na Declaração dos Direitos do Homem e do Cidadão, da França." |
| 05 | Britânicos em set/1945; franceses retomam Saigon; ~15 mil franceses no Tonkin em mar/1946 | OK | CS22 |
| 05 | "os vietnamitas atacam a usina elétrica de Hanói" (19/12/1946) | AJUSTAR | CS23: "the Viet Minh responded by attacking the city's electric plant". Trocar "os vietnamitas" por "o Viet Minh" |
| 06 | Os EUA ficam do lado francês | OK | Miller Center: Eisenhower "provided military aid to the French" |
| 06 | US$ 10 milhões em 1950, mais de três quartos em 1954, "O dado é do Miller Center" | AJUSTAR | O Miller Center só dá "more than 75 percent". Os US$ 10 milhões e os 78% vêm dos Documentos do Pentágono (Wikisource, Part II p. 43: "began modestly with $10 million in 1950 ... 78%"). O NARA (ep. 1-4) registra "Truman authorizes $15 million in military aid" em 26/07/1950. Texto: "Segundo os Documentos do Pentágono, a ajuda americana começa com 10 milhões de dólares em 1950 e, em 1954, já paga 78% do custo da guerra francesa." Registrar a fonte PP em `sources.md` |
| 06 | 07/04/1954, princípio do dominó | OK | UCSB (trecho do `sources.md`, não reaberto) |
| 07 | Dien Bien Phu, 13/03 a 07/05/1954; derrota francesa | OK | NARA ep. 1-4: "Viet Minh defeat the French" |
| 07 | "Com essa derrota, a guerra que ela travava ali chega ao fim" | AJUSTAR | NARA: "August 1, 1954: End of First Indochina War"; o cessar-fogo de Genebra vai até 11/08. Texto: "A derrota decide a guerra, mas o fim formal só vem com o acordo de Genebra." Trocar também "forças comunistas de Ho Chi Minh" por "o Viet Minh, de Ho Chi Minh" (termo da fonte) |
| 08 | 20/07/1954; linha militar provisória; cessar-fogo em 27/07, 01/08 e 11/08; eleições para reunificar | OK | Avalon, art. 1, 11 e 14(a) |
| 08 | "zona desmilitarizada de até cinco quilômetros" | **ERRO** | Art. 1: "on either side of the demarcation line, to a width of not more than 5 Kms. from it". São até 5 km **de cada lado**. Texto: "uma zona desmilitarizada de até cinco quilômetros de cada lado da linha" |
| 09 | Comissão de Canadá, Índia e Polônia | OK | Avalon, art. 34 |
| 09 | "As eleições previstas não foram realizadas" | SEM FONTE | Nenhuma fonte do `sources.md` diz isso. O NARA e o history.state.gov só dizem que o acordo "called for an election ... in 1956". O CS25 dá a recusa de Diem (ago/1955). Texto com a fonte disponível: "Em agosto de 1955, Diem recusa as conversas com o Norte que deveriam preparar as eleições de 1956." Para manter "não foram realizadas", registrar uma fonte que diga isso de forma explícita |
| 09 (visual) | rótulo "paralelo 17" | AJUSTAR | O texto do armistício não fala em paralelo 17. Registrar como fonte o NARA ep. 1-4 ("temporary partition of Vietnam at the 17th Parallel") |
| 10 | 685 do MAAG em mai/1961; MACV em 08/02/1962; 16 mil assessores no fim do governo Kennedy | OK | MAAG (não reaberto); NARA ep. 1-4; Miller Center Kennedy: "16,000 American military advisers" |
| 11 | Hue, 9 mortos (mai/1963); Thich Quang Duc, 11/06/1963 | OK | BUD1 (não reaberto) |
| 11 | "A foto do ato é premiada, e o mundo passa a ver o regime de Diem de outro modo" | AJUSTAR | A segunda metade não tem fonte. Texto: "A foto de Malcolm Browne vence o World Press Photo daquele ano." Não mostrar a foto (AP, protegida), como o visual já prevê |
| 12 | Pagodes em 21/08/1963 | OK | NARA ep. 1-4 |
| 12 | "Em 23 de agosto, o Cabo 243 autoriza o embaixador americano a articular a queda de Diem" | AJUSTAR | O documento primário (FRUS 1961-63 v3 d281) é de "Washington, August 24, 1963, 9:36 p.m."; a data de 23 é só da legenda do NARA. O texto do cabo é condicional: "If ... Diem remains obdurate ... Diem himself cannot be preserved". NARA: "green light a plot". Texto: "Em 24 de agosto, o Cabo 243 diz ao embaixador que, se Diem não afastar o irmão, Nhu, os Estados Unidos aceitam que ele seja derrubado. Na prática, é um sinal verde para um golpe." |
| 12 | Miller Center: o que veio antes "convenceram autoridades americanas de que ele precisava sair" | AJUSTAR | Fonte: "convinced **second-tier officials** in the Kennedy White House and the State Department". Texto: "convenceram autoridades do segundo escalão do governo Kennedy de que ele precisava sair" |
| 12 | 01/11/1963, golpe; Diem "morre" | AJUSTAR (leve) | NARA: "assassinated the next day". Texto: "é derrubado por um golpe militar e morto no dia seguinte" |
| 13 | 2/08 ataque ao Maddox; 4/08 EUA dizem que houve 2º ataque | OK | history.state.gov (gulf-of-tonkin); NARA: "Alleged second Tonkin Gulf incident" |
| 14 | 07/08/1964, "all necessary measures", 416 a 0 e 88 a 2 | OK | Avalon; CFR. Observação: a CFR data a votação da Câmara em 6/08. "O Congresso aprova em 7 de agosto" segue o NARA e o Departamento de Estado |
| 15 | Expira quando o presidente decidir ou por resolução do Congresso | OK | Avalon, Section 3 |
| 16 | Estudo de Hanyok (NSA, 2005): não houve ataque em 4/08; "overwhelming body of reports" | OK | Press release do NSArchive, 01/12/2005 |
| 17 | Sem prova de acobertamento; "active effort"; "Doubts later emerged"; CFR "it is clear now that it didn't" | OK | NSArchive; history.state.gov; CFR |
| 18 | Jango deposto em 01/04/1964; Castelo eleito com 361 votos, candidato único; posse em 15/04 | OK | BR1 (não reaberto) |
| 18 | "Quatro meses depois do golpe" | OK | De 01/04 a 11/08 são 4 meses e 10 dias |
| 19 | Carta de 11/08/1964: Carta da ONU, autodefesa, instrução ao representante no Conselho de Segurança; resposta de Johnson em 25/08, "no wider war" | OK, com AJUSTAR leve | UCSB. A carta **responde** a uma mensagem de Johnson ("I have received from your Ambassador, Your Excellency's message"). Texto: "Em 11 de agosto de 1964, Castelo Branco responde a uma mensagem de Johnson." A carta também pede que todos evitem "the aggravation of tensions"; incluir para ser justo |
| 21 | Rolling Thunder, campanha de bombardeios ao Norte; NARA 02/03 x Departamento de Estado 13/02 | OK | NARA ep. 5-8: "a sustained bombing campaign against the north", key date "March 2, 1965"; history.state.gov: "commenced on February 13, 1965" |
| 21 | 3.500 fuzileiros em Da Nang em 08/03/1965 | OK | NARA ep. 5-8 |
| 22 | 28/07/1965: de 75 mil para 125 mil soldados; convocação de 17 mil para 35 mil | OK | JULY65 (não reaberto) |
| 23 | Pico de 543.000 em abr/1969 | OK | NARA ep. 5-8 |
| 24 | Gallup ago-set/1965: 24% | OK | Tabela do Gallup: "1965 Aug 27-Sep 1: 24 61 15" |
| 24 | "entre 1965 e 1973, a pergunta teve outra redação" | AJUSTAR | O símbolo de "wording during Vietnam War" vai de 1966 a 1973; a linha de 1965 não tem o símbolo. Texto: "Durante a guerra, a pergunta usou outra redação." |
| 25 | Ranch Hand: ~19 milhões de galões, ≥ 11 milhões de Agente Laranja, ~3,6 milhões de acres | OK | IOM (não reaberto); a conversão para 1,46 milhão de hectares está certa |
| 26 | Le Duan, dez/1965, negociar só depois de vitórias maiores | OK | WIL (não reaberto) |
| 27 | "Por mais de dois anos ... sem negociação" | AJUSTAR | As negociações oficiais só começam em 10/05/1968 (NARA). Texto: "sem negociação oficial" |
| 28 | Tet no feriado do ano-novo lunar; ~70.000 soldados comunistas; mais de 100 cidades | OK | NARA ep. 5-8: "Tet, a celebration of the lunar new year ... 70,000 Communist troops struck more than 100 towns and cities" |
| 28 | "O Tet começa em 31 de janeiro ... ao mesmo tempo"; "Em Hue, a FNL ataca em 30 e 31" | AJUSTAR | history.state.gov: "The first phase ... began on January 30 and 31". O 30-31 é a data da primeira fase, não especificamente de Hue. "Ao mesmo tempo" contradiz o próprio texto. Texto: "O Tet começa na noite de 30 para 31 de janeiro de 1968, no feriado do ano-novo lunar. Segundo o Arquivo Nacional, cerca de 70 mil soldados comunistas atacam mais de cem cidades e vilas do Sul. Os ataques a Hue e a Saigon têm o maior efeito." |
| 29 | Khe Sanh: Pegasus, 7/04 e 8/04; 77 dias "conforme a contagem"; saída em 6/07/1968 | OK | KHE1 e KHE2 (não reabertos; confiabilidade média). Início do cerco em 21/01: NARA |
| 30 | Cronkite, 27/02/1968, "mired in a stalemate" | OK | NARA ep. 5-8 |
| 30 | "O efeito maior é na opinião ... fev/1968, 46% ... Em 1965, eram 24%" | AJUSTAR (causalidade) | Gallup: **46% já em out/1967** (e 45% em dez/1967). O de 1-6/02/1968 cai nos primeiros dias do Tet, e o número só sobe para 49% em 22-27/02. Do jeito que está, o texto atribui ao Tet uma virada que já tinha acontecido. Texto: "A opinião já vinha mudando: em outubro de 1967, 46% diziam que enviar tropas foi um erro. No fim de fevereiro de 1968, depois do Tet, eram 49%. Em agosto, 53%, e pela primeira vez a maioria." (Gallup: "1968 Aug 7-12: 53") |
| 31 | My Lai, 16/03/1968, entre 347 e 504 civis; Peers | OK | PBS. Escrever "347 e 504 civis mortos" |
| 31 | "cumpre cerca de quatro meses em Leavenworth, antes de ficar em casa" | AJUSTAR | PBS: Nixon manda Calley sair da prisão e ficar "confined to his quarters"; Bilton: "in total, about four months in the stockade at Fort Leavenworth". A ordem dos fatos está invertida. Texto: "William Calley é condenado à prisão perpétua. Nixon manda que ele cumpra a pena nos próprios alojamentos, e no total ele passa cerca de quatro meses na prisão militar de Leavenworth." |
| 32 | 31/03/1968, Johnson desiste da reeleição | OK | NARA ep. 5-8 |
| 33 | 58.220; 40.934 KIA; 47.434 hostis e 10.786 não hostis; "not official statistics" | OK | NARA casualty statistics |
| 34 | Marcha de 21/10/1967, ~100 mil (The Nation), protesto no Pentágono | OK, com nota | O NARA (ep. 5-8) diz "70,000 protesters marched on the Pentagon". Como a cena 3 promete mostrar as duas versões quando as fontes discordam: "100 mil segundo a The Nation; 70 mil no Pentágono, segundo o Arquivo Nacional" |
| 34 | Sorteio de 01/12/1969, nascidos de 1944 a 1950 | OK | DRAFT (não reaberto) |
| 35 | "Em 8 de junho de 1969, começa a retirada" | AJUSTAR | history.state.gov: "on June 8 to announce the first increment of redeployment"; NARA: "Announcement of 25,000 troop withdrawal". Texto: "Em 8 de junho de 1969, Nixon anuncia a primeira retirada, de 25 mil soldados." |
| 35 | 03/11/1969: vietnamização, mais de 60.000 até 15/12, "great silent majority" | OK | MILL (não reaberto); NARA ep. 5-8 dá a data |
| 36 | "Em 30 de abril de 1970, a guerra chega ao Camboja" | AJUSTAR | history.state.gov e NARA: bombardeios secretos no Camboja desde 18/03/1969 ("Menu bombings"); em 30/04/1970 Nixon ordena uma "incursion". Texto: "Em 30 de abril de 1970, Nixon manda tropas americanas e sul-vietnamitas ao Camboja, que os B-52 já bombardeavam em segredo desde 1969." |
| 36 | Kent State, 04/05/1970: "a repressão a um protesto vira notícia" | AJUSTAR (vago) | history.state.gov: "the deaths of four students at Kent State University on May 4". Texto: "Em 4 de maio, quatro estudantes morrem num protesto na Universidade Kent State." |
| 36 | Gallup jan/1973, 60% | OK | Gallup: "1973 Jan 12-15: 60" |
| 37 | Encomendado por McNamara em 1967; ~7.000 páginas; 48 caixas; liberado inteiro em 2011 | OK | NARA (2011 = "40th anniversary of the leak") |
| 37 | "Em junho de 1971, ele vaza para a imprensa" | AJUSTAR | NARA: "small portions of the report were leaked". Texto: "Em junho de 1971, trechos dele vazam para a imprensa." |
| 38 | Out/1972, acordo e recusa de Thieu; Nixon ordena B-52 em 14/12 | OK | history.state.gov (ending-vietnam): "on December 14 Nixon ordered massive B-52 attacks" |
| 38 | 729 de 741 surtidas, 15 B-52, pausa no Natal | OK | LB2 (não reaberto). Fala melhor: "Os B-52 voam 729 das 741 missões planejadas e 15 são derrubados." |
| 39 | Rubricado em 23/01/1973, assinado em 27/01; cessar-fogo às 24h GMT de 27/01; retirada em 60 dias; prisioneiros | OK | TAH (art. 2, 5 e 8a); history.state.gov |
| 39 | "Em 29 de março de 1973, Nixon diz que não há mais forças militares americanas no Vietnã" | AJUSTAR (fonte não registrada) | Verdadeiro, mas não está no `sources.md`. UCSB, "Address to the Nation About Vietnam and Domestic Problems" (29/03/1973): "For the first time in 12 years, no American military forces are in Vietnam." Registrar a fonte |
| 39 | "A Operação Homecoming liberta 591 americanos entre fevereiro e março" | SEM FONTE | Não está no `sources.md` nem no dossiê. Tentei abrir nixonlibrary.gov (404), dpaa.mil (403) e history.navy.mil (erro de TLS). Buscar fonte (DPAA ou NARA) ou trocar por "Nixon diz que todos os prisioneiros americanos estão voltando para casa" (UCSB, mesmo discurso) |
| 40 | Veto derrubado em 07/11/1973; 284-135; 75-18; 48 h; 60 dias "para aprovar ou rejeitar" | OK | FRUS v35 d26; house.gov ("Congress would then have 60 days to approve or reject the action") |
| 41 | Ofensiva nas terras altas em mar/1975; tanques no palácio em 30/04 | OK | history.state.gov (ending-vietnam) |
| 41 | 29/04, CH-53 dos fuzileiros evacuam Saigon | OK | COM (Commons, domínio público, atribuição USMC) |
| 41 | "Duong Van Minh anuncia a rendição" | AJUSTAR (fonte fraca) | Trocar a fonte MINH (clickamericana, média-baixa) pelo Country Study 31 (Library of Congress): "Duong Van Minh ordered ARVN troops to lay down their arms"; presidente desde 28/04. Texto: "e o presidente do Sul, Duong Van Minh, no cargo havia dois dias, manda as tropas deporem as armas." |
| 42 | 02/07/1976, República Socialista do Vietnã, Cidade de Ho Chi Minh; ~125 mil refugiados na primavera de 1975 | OK | UNIF, REF (não reabertos; confiabilidade média) |
| 43 | BMJ 2008: 3,8 milhões de mortes violentas no Vietnã, 1955-2002 | OK | Resumo do BMJ (Europe PMC) e healthdata.org: "ranging from ... to 3.8 million in Vietnam" |
| 43 | "com margem de 3 a 8,7 milhões" | **ERRO** | Resumo do BMJ: "5.4 million violent war deaths (95% confidence interval 3.0 to 8.7 million) **in 13 countries**". O intervalo é do total dos 13 países, não do Vietnã. Cortar a margem e corrigir o visual ("gráfico de intervalo ... faixa de 3 a 8,7") |
| 43 | "O método é contestado por outros pesquisadores" | SEM FONTE | O `sources.md` só diz "método criticado", via busca; nenhuma crítica foi aberta. Registrar uma crítica publicada ou trocar por: "É uma estimativa feita com pesquisas domiciliares, com um método diferente das contagens oficiais." |
| 44 | Memorando de Bundy de 31/12/1965 a Johnson; pressão por tropas na reunião do empréstimo; telegrama 1456 do Rio, 17/12 | OK | d225 (mesma ressalva da cena 02 sobre a separação do empréstimo) |
| 45 | "prayerful consideration"; a Constituição exige o Congresso; o Congresso só volta em março | OK | d225 |
| 46 | "Bundy avalia que Castelo enfrenta um problema político mais difícil do que se esperava" | OK | d225: "bigger and harder political problem than Harriman and I thought possible" |
| 46 | "E escreve que, com o tempo, uma contribuição brasileira de algum tipo poderia ser acertada" | AJUSTAR | Quem pensa isso são Gordon e Walters, segundo Bundy: "Gordon and Walters think that in time a Branco contribution in some form can be worked out". Texto: "Segundo Bundy, o embaixador Gordon e o adido militar Vernon Walters achavam que, com o tempo, alguma contribuição do Brasil poderia ser acertada." |
| 47 | "Em 22 de maio de 1965, a OEA aprovou uma força de paz na República Dominicana e pediu que o Brasil indicasse o comandante" | AJUSTAR | FRUS v32 d85: a resolução de 22/05 trata de "provisions to guide the conduct of the Inter-American Force" (a força já existia) e "requested that Brazil designate a Commander". Texto: "Em 22 de maio de 1965, uma reunião de chanceleres da OEA pediu que o Brasil indicasse o comandante da Força Interamericana na República Dominicana." |
| 47 | Hugo Panasco Alvim; Castelo pediu ao Congresso; 1.250 militares, segundo o embaixador citado na tese | OK | d85; Marson (2021), p. 44: "um contingente de 1.250 militares brasileiros foi enviado para São Domingos". A atribuição está correta ("cerca de" pode sair, a fonte dá o número exato) |
| 48 | Nota dos editores: café e suprimentos médicos; "never sent troops or military supplies"; cita o Exército dos EUA | OK | d225, nota 3: "(Department of the Army, Allied Participation in the Vietnam, p. 169)". "Mesmo conjunto de documentos": a nota está no próprio memorando d225; dizer "Uma nota dos editores, no pé desse mesmo memorando" |
| 49 | Simões: reticência explicada pela geopolítica dos círculos concêntricos da ESG | OK | ANPUH (não reaberto); atribuída como interpretação do autor |
| 50 | Costa e Silva: posse em 15/03/1967, AI-5 em 13/12/1968; nenhum novo pedido encontrado, "lacuna" | OK | BR3 (não reaberto). Lacuna declarada com honestidade |
| 51 | "a grande imprensa foi favorável à ação americana no Vietnã de 1964 até 1971" | AJUSTAR | FAPESP: a frase "favorável à ação no Vietnã de 1964 até 1971" vem logo antes de uma fala sobre a imprensa **norte-americana** e o Iraque; não está claro que trate da imprensa brasileira. Sobre o Brasil, o texto diz que a mídia brasileira "seguiu seu exemplo" e que "esse cenário mudaria rapidamente em 1968". Texto: "A tese de Orivaldo Biagi, da Unicamp, mostra que a grande imprensa brasileira seguiu a americana e usou a guerra para reforçar o discurso do 'perigo comunista'. Os jornais de esquerda a usavam para denunciar o imperialismo e a tortura. Em 1968, depois do Tet, a palavra Vietnã virou palavra de ordem nas greves de Contagem e Osasco." |
| 51 | "A esquerda usava o conflito para criticar o imperialismo" | AJUSTAR (leve) | FAPESP: "pelos jornais de esquerda para denunciar o imperialismo e a tortura". Já resolvido no texto acima |
| 52 | "O Brasil apoiou os Estados Unidos por carta e na ONU" | AJUSTAR | A carta só diz que Castelo instruiu o representante no Conselho de Segurança. Não há fonte de que o Brasil tenha agido na ONU. Texto: "O Brasil apoiou os Estados Unidos por carta, e Castelo Branco disse ter mandado o representante na ONU fazer o mesmo." |
| 52 | "a grande imprensa foi favorável à guerra" | AJUSTAR | Ver cena 51. Texto: "e a grande imprensa repetiu o discurso americano." |
| 52 | "segundo o Departamento de Estado, nenhum soldado brasileiro foi ao Vietnã" | AJUSTAR | A nota 3 diz "Brazil never sent troops or military supplies" e cita o Exército. Isso é o **envio oficial**, não a garantia de que nenhum brasileiro serviu lá (por exemplo, com dupla cidadania no exército americano). Texto: "E, segundo a nota dos editores do Departamento de Estado, o Brasil nunca enviou tropas nem material militar ao Vietnã. Mandou café e remédios." |
| 53 | O embaixador pediu soldados e ouviu que dependia do Congresso; a guerra durou mais dez anos | OK | d225; de 1965 a 1975 |

Resumo: 3 ERRO (cenas 4, 8 e 43), 3 SEM FONTE (cenas 9, 39 e 43), 22 AJUSTAR, o resto OK. Zero pendências é condição para aprovar.

## Contrato da embalagem (T01 + thumbnail A "E o Brasil foi?")
- **Gancho em ≤ 10 s: entrega.** A 1ª frase (0:00 a cerca de 0:06) é o título: "Em dezembro de 1965, o embaixador dos Estados Unidos pediu soldados ao presidente do Brasil." O mapa com o arco Brasil–Vietnã repete a thumbnail.
- **Loop em ≤ 30 s: entrega.** "O que o presidente respondeu? A resposta está no documento, e vamos lê-lo no fim" (por volta de 0:25). Casa com a pergunta da thumbnail.
- **Payoff: entrega, com ressalvas.** "E o Brasil foi?" é respondida na cena 48 (18:11) e resumida na cena 52 com documento primário. Problemas: (a) a cena 52 diz mais do que a fonte ("nenhum soldado brasileiro foi"); (b) a cena 46 põe na boca de Bundy uma previsão que é de Gordon e Walters; (c) o resumo usa "apoiou na ONU" e "a imprensa foi favorável à guerra", afirmações mais fortes que as fontes.
- **"O dia": não chega a ser falsa promessa, mas a promessa fica vaga.** O d225 não dá a data da reunião, só o telegrama de 17/12. O roteiro nunca diz "o dia". Sugestão para a cena 44: "A data exata da reunião não aparece; o relato dela é um telegrama de 17 de dezembro." Assim o "dia" do título é tratado de frente. Não pode inventar data.
- **Promessa ampla do `packaging.md`** ("o que o Brasil fez, pediu ou recusou em cada etapa", "cerca de 22 minutos"): o roteiro tem 20,6 min e o fio do Brasil some entre 07:39 e 16:38, com só uma linha na cena 26. Isso não quebra o título, mas é risco de retenção. Sugestão: uma frase de ponte brasileira por volta de 12:00 a 13:00 (por exemplo, o Tet nas greves de 1968, cena 51, adiantado ou anunciado).
- **Implicação da troca empréstimo x tropas (cena 2):** corrigir conforme a tabela; o próprio memorando diz que os assuntos foram separados.

## Rubrica (`rubrics/script-long.md`)
| # | Critério | Peso | Nota | Justificativa (trecho) |
|---|---|---|---|---|
| 1 ⛔ | Gancho confirma a promessa em ≤ 10 s | 2 | 5 | "Em dezembro de 1965, o embaixador dos Estados Unidos pediu soldados ao presidente do Brasil." É a 1ª frase |
| 2 ⛔ | Loop em ≤ 30 s | 1 | 5 | "O que o presidente respondeu? A resposta está no documento, e vamos lê-lo no fim deste vídeo." |
| 3 | Contexto enxuto | 1 | 3 | A cena 3 inteira descreve o processo ("Cada data e cada número vêm de documento... eu mostro as duas versões") em vez de mostrar fato |
| 4 ⛔ | Ritmo, mudança a cada ≤ 45 s | 2 | 4 | Marcações a cada 13 a 29 s (`script_check` PASS); muitas cenas seguidas de "data + número" no mesmo molde (cenas 32 a 40) |
| 5 | Pontes entre atos | 1 | 3 | Boas pontes: "Guarde a data, 4 de agosto" (cena 13); "Apoiar por carta e na ONU custa pouco. Soldados são outra conta." (cena 20); "Até que, no começo de 1968, um ataque muda..." (cena 27). Faltam de 32 para 33, de 36 para 37 e de 42 para 43, e o fio do Brasil some por 9 min |
| 6 ⛔ | Payoff entrega 100% | 2 | 4 | A cena 48 responde com documento; as cenas 46 e 52 dizem mais do que as fontes |
| 7 | Densidade | 1 | 3 | Enchimentos: cena 3; "mas ele mostra o tamanho do que estava em jogo" (23); "Por isso este vídeo sempre diz de onde vem cada número" (33); "É uma diferença que muda o sentido da história" (46) |
| 8 | Linguagem falada | 1 | 4 | 13,1 palavras por frase; trechos densos de números difíceis de ouvir: cena 33 (quatro números de 5 dígitos), cena 38 ("são 729 de 741 surtidas planejadas") |
| 9 | Especificidade | 1 | 4 | Muito concreto (416 a 0, 58.220, telegrama 1456), mas com números errados ou mal atribuídos (BMJ, US$ 10 milhões) |
| 10 | Fechamento + direcionamento | 0,5 | 2 | "Se você quer ver outro capítulo brasileiro... diga qual nos comentários." Não aponta para outro vídeo |
| 11 | Originalidade vs outliers | 1 | 4 | Ângulo próprio (Brasil, documentos primários); sobreposição máxima de 0,87%. Mas a cronologia geral segue a mesma ordem de atos de aE4eMP6leA0 e _mgBkiEKY6E (ver item 7) |
| 12 | Learnings aplicados | 0,5 | 3 | L01 e L02 só em parte (ver Learnings) |
Σ = 10 + 5 + 3 + 8 + 3 + 8 + 3 + 4 + 4 + 1 + 4 + 1,5 = **54,5/60 = 90,8**. Nenhum ⛔ abaixo de 3.

## Política (`knowledge/policies-ai.md`)
- **YMYL:** nada médico, financeiro ou eleitoral. O Agente Laranja aparece sem afirmação de saúde (bom). Sem bloqueio.
- **Pessoas reais:** só falas documentadas (cartas, memorando, Nixon, Cronkite, Peers), traduzidas e atribuídas. Ajustes nas cenas 46 e 52 para não atribuir a alguém o que ele não disse. "Golpe" (cena 18) e "deposto pelos militares" seguem as fontes (Câmara, CPDOC); tom neutro.
- **Conteúdo sensível:** My Lai sem imagem de vítima, com faixa atribuída; imolação "sem imagem da cena". Adequado. Kent State: dizer que quatro estudantes morreram é mais honesto que "repressão vira notícia".
- **R14 (conteúdo sintético):** estilo D (código), sem pessoa nem cena realista gerada por IA. Não precisa marcar, **desde que** nenhuma reconstrução realista entre na produção. O selo do Lacre (Flow) é marca, não cena realista.
- **Direitos de imagem:** **cena 30, "imagem de arquivo de 27 de fevereiro de 1968"** (Cronkite/CBS) é protegida, não é domínio público. Trocar por tipografia da frase com crédito, ou registrar uma licença. Cena 11: não usar a foto de Malcolm Browne (AP). Cena 41: CH-53 do USMC em domínio público, com atribuição registrada (ok). Capa do estudo da NSA e dos Pentagon Papers: obras do governo dos EUA (ok).
- **Inautêntico ou repetitivo:** roteiro autoral com pesquisa própria. Sem bloqueio.

## R17 (tom de IA). Ignorei os falsos positivos de listas de datas do `slop_check`
| Cena | Trecho | Problema | Substituição |
|---|---|---|---|
| 03 | "Cada data e cada número vêm de documento ou de pesquisa publicada. Quando as fontes discordam, eu mostro as duas versões." | descreve o que o vídeo faz | Cortar a cena ou trocar por um fato: "A guerra começa trinta anos antes do pedido, num discurso em Hanói." |
| 22 | "A guerra deixa de ser uma decisão distante e passa a chegar às casas dos americanos." | molde "deixa de ser X, passa a Y" | "A convocação dobra: mais famílias americanas recebem a carta do recrutamento." (só com fonte; se não houver, cortar) |
| 23 | "mas ele mostra o tamanho do que estava em jogo" | frase vazia | Cortar |
| 33 | "Por isso este vídeo sempre diz de onde vem cada número." | autodescrição | Cortar |
| 42 | "A guerra acabou, mas o país que saiu dela ficou outro." | manifesto vago | Cortar, ou dar um fato concreto com fonte |
| 46 | "Ou seja, o presidente brasileiro não disse não. Disse que dependia do Congresso. É uma diferença que muda o sentido da história." | par "não X, Y" + manifesto (e repetido na 52 e na 53) | "Castelo Branco não recusou. Empurrou a decisão para o Congresso, que só voltaria em março." Cortar a última frase |
| 51 | "A guerra dos outros entrou na política brasileira." | manifesto | Cortar (o fato das greves já diz isso) |
| 52 e 53 | "não disse não, disse que dependia do Congresso" aparece 3 vezes (46, 52, 53) | repetição | Manter só na 46. Na 53: "O embaixador saiu da reunião sem soldados e com uma promessa de estudo." |

## Learnings
- **L01 (obrigatória): parcial.** As marcas de sfx não trazem motivo (`reason`). A maioria tem motivo óbvio (multidão em Ba Dinh, sonar em Tonkin, papel nas cartas), mas: cena 22, "som contínuo de contador", é um som repetitivo de risco (exatamente o que o usuário reprovou); cena 27 tem "silêncio de 2 s" no visual e "whoosh" no sfx ao mesmo tempo (conflito); cena 28, "impactos curtos, até 3 por minuto", sobre ataques com mortos pede contenção. A produção deve registrar o `reason` de cada som e passar no `fx_check.py`.
- **L02 (obrigatória): parcial.** Tem som de movimento no arco (cena 2) e no papel (cena 19). Faltam nos movimentos de mapa: cena 5 (tropas chegando), cena 9 (linha riscada), cena 35 (setas de retirada), cena 21 (contador de fuzileiros), cena 25 (contador de galões). A cena 53 ("arco apagando, silêncio") é escolha defensável; registrar o motivo.
- **L03 (hipótese): de produção.** Para a voz: as cenas 33 e 38 têm sequências de números longos que prejudicam a fala por TTS; escrever por extenso ou arredondar na fala e deixar o número exato na tela.

## Sequência de pontos das referências (`research.md`)
- A sobreposição de frases é baixa (0,87% no máximo); não há frase reaproveitada.
- **A ordem dos atos 1 a 5 repete a das referências:** aE4eMP6leA0 tem colonial até Genebra → dominó e Diem → Tonkin e escalada → Tet, My Lai e protestos → Nixon, Paris e queda → consequências, e _mgBkiEKY6E segue a mesma ordem. Os atos 1 a 5 do roteiro seguem isso ponto a ponto (cenas 4 a 42), incluindo a divisão dos mortos dos EUA, que _mgBkiEKY6E também dá. O desvio próprio é o fio do Brasil (cenas 1-2, 18-20, 26, 44-52) e os documentos (Resolução, Hanyok, d225). Isso basta para o ângulo, mas o fio brasileiro precisa aparecer também no miolo (sugestão no Contrato), senão 9 min centrais (07:39 a 16:38) são a mesma sequência de um vídeo de referência.

## Problemas por prioridade
**P0: bloqueiam (erro factual ou sem fonte)**
1. Cena 43: tirar "com margem de 3 a 8,7 milhões" e corrigir o visual. Texto: "Do lado vietnamita, não há uma contagem única. Uma estimativa publicada no BMJ em 2008, feita com pesquisas domiciliares, fala em 3,8 milhões de mortes violentas de guerra no Vietnã entre 1955 e 2002. É um método diferente das contagens oficiais. Esse número e o dos americanos usam critérios diferentes e não se somam." (ou registrar uma crítica publicada para manter "contestado")
2. Cena 4: Declaração dos Direitos do Homem e do Cidadão (texto na tabela).
3. Cena 8: "até cinco quilômetros de cada lado da linha".
4. Cena 9: "As eleições previstas não foram realizadas" sem fonte. Usar a recusa de Diem (CS25) ou registrar a fonte.
5. Cena 39: "591 americanos" sem fonte. Registrar ou trocar; registrar o UCSB para a frase de Nixon de 29/03/1973.
**P1: o payoff e o contrato**
6. Cena 52: "o Brasil nunca enviou tropas nem material militar"; "disse ter mandado o representante na ONU"; imprensa conforme a fonte (textos na tabela).
7. Cena 46: atribuir a previsão a Gordon e Walters.
8. Cena 51: reescrever com o que a FAPESP sustenta (texto na tabela).
9. Cena 2 e 44: incluir que o memorando separa empréstimo e tropas; dizer que a data da reunião não aparece.
10. Cena 47: a reunião de 22/05 não "aprovou a força de paz"; pediu o comandante brasileiro.
**P2: exageros e imprecisões**
11. Cena 30: Gallup, a virada é anterior ao Tet (46% em out/1967).
12. Cena 12: Cabo 243 em 24/08 (FRUS), condicional, "segundo escalão".
13. Cena 28: Tet de 30 para 31; sem "ao mesmo tempo"; Hue sem data própria.
14. Cena 36: Camboja (bombardeio secreto desde 1969) e Kent State (quatro mortos).
15. Cena 35: "anuncia a primeira retirada, de 25 mil".
16. Cena 37: "trechos dele vazam".
17. Cena 6: a atribuição do dado (Documentos do Pentágono, 78%).
18. Cena 7: Dien Bien Phu decide a guerra, e o fim formal vem em Genebra.
19. Cena 31: ordem dos fatos de Calley.
20. Cena 41: trocar a fonte de Minh pelo Country Study 31 e escrever "manda as tropas deporem as armas".
21. Cenas 5, 11, 12, 19, 24, 27, 34 e 48: ajustes leves da tabela.
22. Cena 30: tirar a imagem da CBS.
**P3: estilo e learnings**
23. R17: cortes e substituições da seção R17.
24. Fechamento: indicar um próximo vídeo concreto do canal (ou a série "capítulos brasileiros") em vez de só pedir comentário.
25. L01 e L02: notas de som (cenas 22, 27, 28 e movimentos de mapa) para o produtor.
26. `sources.md`: atualizar as chaves AID e AID2 (PP), MINH (CS31), BMJ (resumo do PMID 18566045), Cabo 243 (FRUS 1961-63 v3 d281) e incluir UCSB 29/03/1973 e NARA ep. 1-4 para o paralelo 17. Corrigir a tabela "Conflitos", que cita as cenas 46 e 47 para Minh e BMJ quando o certo é 41 e 43.

## Não verificado nesta revisão
- As fontes listadas como "não reabertas" acima (status por trecho do `sources.md`).
- Uma fonte explícita de que as eleições de 1956 não aconteceram (o CS25 só diz "likelihood ... would not be held" e a recusa de Diem); Operation Homecoming 591 (sites do governo deram 403, 404 ou erro de TLS).
- A data exata da reunião Gordon–Castelo Branco (não está no d225; precisaria do telegrama 1456).

---

## Ciclo 2 (2026-11-19)
Objeto: `script.md` corrigido (54 cenas, 3.214 palavras, 21,4 min a 150 ppm segundo `script_check.py`) e `sources.md` novo. Learnings: L01 e L02 (obrigatórias), L03 (hipótese, produção).

### Veredito do ciclo 2: **REFAZER** (3 correções de texto, mecânicas)
Nota: **101,7** pela fórmula da rubrica (Σ = 61; a fórmula divide por 60, mas a soma dos pesos × 5 dá 70; na escala de 70, **87,1**). Passa no mínimo de 80 de qualquer jeito. Restam **1 ERRO** (cena 9) e **2 exageros** (cenas 28 e 31). As duas últimas vieram do texto que eu mesmo sugeri no ciclo 1; o erro é meu também. Os três são trocas de texto prontas (abaixo) e não pedem novo julgamento. Pelo R6 este é o último ciclo: aplicar as 3 substituições literalmente, conferir por diff e levar ao usuário; se não forem aplicadas, escalar.

### Validadores
| Validador | Resultado |
|---|---|
| `script_check.py <pasta>` | PASS (0 erros, 16 avisos; 2 frases com mais de 30 palavras: cenas 12 (32) e 42 (31)) |
| `slop_check.py script.md` | FAIL (15 marcas, limite 2). Todas são listas de datas, cifras ou fatos (falso positivo, como no ciclo 1). As de R17 reais estão abaixo |
| `originality_check.py` contra as 7 legendas de referência (json3 convertido em texto) | PASS (máximo de 0,93% contra _mgBkiEKY6E; limite 3%). Obs.: rodado direto sobre `.json3` o script dá 0,00% em tudo, porque não lê esse formato; o validador precisa converter json3 antes |

### Fontes reabertas neste ciclo
CS25, CS31, history.state.gov (tet; ending-vietnam), UCSB (cartas de 1964), PBS My Lai, NARA ep. 5-8, FRUS 1961-63 v3 d281 (Cabo 243), Miller Center (kennedy-commitment), NARA Pentagon Papers, Wikisource PP parte II p. 43, FAPESP. Gallup e BMJ: reconferidos no ciclo 1.

### Confirmação das correções do ciclo 1
| # | Item | Status | Observação |
|---|---|---|---|
| 1 | Cena 43 (agora 44), BMJ sem a margem de 13 países | OK | Texto e visual corretos; `sources.md` explica o intervalo |
| 2 | Cena 4, Declaração dos Direitos do Homem | OK | |
| 3 | Cena 8, "cinco quilômetros de cada lado" | OK | |
| 4 | Cena 9, eleições sem fonte trocadas pela recusa de Diem (CS25) | AJUSTAR (**ERRO novo**) | A data e o fato batem com o CS25 ("In August 1955, Diem issued a statement formally refusing to participate in consultations"), mas o texto chama Diem de "presidente do Sul". Em agosto de 1955 ele era primeiro-ministro; o CS25 diz que ele se torna presidente da República do Vietnã em outubro de 1955. Ver N1 |
| 5 | Cena 39, "591 americanos" removido; UCSB 29/03/1973 registrado | OK | NIXON73 em `sources.md` |
| 6 | Cena 52 (agora 53), envio oficial, ONU e imprensa | OK | Fiel ao d225, nota 3, à carta e à FAPESP |
| 7 | Cena 46 (agora 47), previsão de Gordon e Walters | OK | |
| 8 | Cena 51 (agora 52 + 33), FAPESP | OK | FAPESP: a mídia brasileira "seguiu seu exemplo"; "perigo comunista"; "jornais de esquerda para denunciar o imperialismo e a tortura"; "nas greves em Contagem e Osasco o nome do país era palavra de ordem", depois de "esse cenário mudaria rapidamente em 1968 ... na ofensiva de Tet" |
| 9 | Cenas 2 e 44 (agora 45), empréstimo separado e data da reunião | OK | Separação dita na narração da cena 2; a falta de data está na legenda da cena 2 e o telegrama de 17/12 na cena 45 |
| 10 | Cena 47 (agora 48), OEA pediu o comandante | OK | |
| 11 | Cena 30, Gallup antes do Tet | OK | 46% out/1967, 49% 22-27/02/1968, 53% 7-12/08/1968 (primeira série acima de 50%), 24% em 1965 |
| 12 | Cena 12, Cabo 243 em 24/08, condicional, segundo escalão, morto no dia seguinte | OK | d281: "Washington, August 24, 1963, 9:36 p.m."; "requires removal of the Nhus"; "Diem himself cannot be preserved". Miller Center: "convinced second-tier officials". "Morto no dia seguinte" segue o NARA ("assassinated the next day"); o Miller Center diz "killed in a coup" em 01/11; conflito registrado em `sources.md` |
| 13 | Cena 28, Tet de 30 para 31, sem "ao mesmo tempo" | AJUSTAR | Datas certas (history.state.gov: "began on January 30 and 31"). Mas "Os ataques a Hue e a Saigon têm o maior efeito" exagera: a fonte diz "had a strong psychological impact", não que foram os de maior efeito. Ver N2 |
| 14 | Cena 36 (agora 37), Camboja e Kent State | OK | history.state.gov: "a US-South Vietnamese 'incursion' into Cambodia on April 30"; "the secret B-52 bombings ... in Cambodia" no primeiro ano de Nixon (NARA: "March 18, 1969: Nixon begins secret bombing of Cambodia"); "the deaths of four students at Kent State" |
| 15 | Cena 35 (agora 36), primeira retirada, 25 mil | OK | NARA: "Announcement of 25,000 troop withdrawal"; history.state.gov: "first increment of redeployment" (sem número). Registrar NARA13 na cena 36 de `sources.md` |
| 16 | Cena 37 (agora 38), trechos vazam | OK | NARA: "small portions of the report were leaked" |
| 17 | Cena 6, Documentos do Pentágono e 78% | OK | PP p. 43: "began modestly with $10 million in 1950"; "78% of the cost of the French war burden" no ano fiscal de 1954 |
| 18 | Cena 7, Genebra encerra formalmente | OK | |
| 19 | Cena 31, ordem dos fatos de Calley | AJUSTAR | A ordem está certa, mas "manda que ele cumpra a pena nos próprios alojamentos" não é o que a fonte diz. PBS: Nixon "ordered Lieutenant William Calley released from the stockade and confined to his quarters", e, segundo Bilton, isso valia "while his appeal hearings were being held". Ver N3 |
| 20 | Cena 41 (agora 42), Minh pelo CS31 | OK | CS31: "took over the presidency on April 28"; "ordered ARVN troops to lay down their arms" |
| 21 | Ajustes leves (cenas 5, 11, 12, 19, 24, 27, 34, 48) | OK | Cena 19: a carta abre com "I have received ... Your Excellency's message" e diz "all governments will endeavor to prevent the aggravation of tensions in Southeast Asia". Cena 35: NARA dá 70 mil na legenda e "nearly 100,000" no texto do episódio 6; o roteiro está certo ao citar 70 mil ao NARA, mas a frase pode ficar só "entre 70 mil e 100 mil, conforme a fonte" |
| 22 | Cena 30, sem imagem da CBS | OK | Visual: "frase de Cronkite em tipografia com crédito, sem imagem de arquivo" |
| 23 | R17 | OK em parte | Ver R17 abaixo |
| 24 | Fechamento com próximo vídeo | NÃO APLICADO | Continua só "diga qual nos comentários". Não bloqueia |
| 25 | L01 e L02 | MELHOR | Ver Learnings abaixo |
| 26 | `sources.md` | OK em parte | AID2, CS25, CS31, CABLE243, BMJ e NIXON73 registrados; tabela de conflitos corrigida. Faltam trechos: HUE ainda diz "Ataques da FLN a Hue em 30 e 31/01" (trocar por "first phase began on January 30 and 31"; "strikes on ... Huế and Saigon had a strong psychological impact"); DIEM ainda diz "autoridades americanas" (trocar por "second-tier officials"); NARA12 não cita o "17th Parallel" usado no visual da cena 9; NARA13 falta na cena 36 (25 mil) |

### Fact-check das frases novas ou reescritas
| Cena | Afirmação | Status | Fonte |
|---|---|---|---|
| 03 | "começa vinte anos antes do pedido ... termina quase dez anos depois dele, em Saigon" | OK | 09/1945 a 12/1965 = 20 anos; 12/1965 a 04/1975 = 9 anos e 4 meses |
| 09 | "Em agosto de 1955, o presidente do Sul, Diem, recusa as conversas" | **ERRO** | CS25: era primeiro-ministro; presidente só em outubro de 1955 |
| 12 | Cabo 243, 24/08, condição de afastar Nhu, sinal verde | OK | d281; NARA |
| 12 | "segundo escalão do governo Kennedy" | OK | Miller Center: "second-tier officials in the Kennedy White House and the State Department" |
| 19 | Responde a mensagem de Johnson; evitar o agravamento das tensões | OK | UCSB |
| 28 | "Os ataques a Hue e a Saigon têm o maior efeito" | AJUSTAR (exagero) | history.state.gov: "strong psychological impact" |
| 30 | Gallup 46/49/53, "pela primeira vez a maioria"; Cronkite 27/02/1968 | OK | Gallup; NARA ep. 5-8 |
| 31 | "manda que ele cumpra a pena nos próprios alojamentos" | AJUSTAR | PBS: tirado da prisão e confinado aos alojamentos enquanto o recurso corria |
| 33 | Brasil em 1968: Contagem e Osasco após o Tet; Costa e Silva desde 15/03/1967; AI-5 em 13/12/1968 | OK | FAPESP; BR3 (CPDOC, não reaberto; datas conhecidas e coerentes) |
| 35 | Marcha de 21/10/1967: 100 mil (The Nation) e 70 mil (NARA) | OK | NARA tem os dois números na mesma página; ver item 21 |
| 36 | Primeira retirada, 25 mil, 08/06/1969 | OK | NARA ep. 5-8 |
| 37 | Camboja: tropas americanas e sul-vietnamitas; B-52 em segredo desde 1969; quatro estudantes | OK | history.state.gov; NARA |
| 38 | "trechos dele vazam" | OK | NARA |
| 42 | Minh "no cargo havia dois dias, manda as tropas deporem as armas" | OK | CS31 (28/04 a 30/04) |
| 06 | "Segundo os Documentos do Pentágono ... 78%" | OK | PP parte II, p. 43 (ano fiscal de 1954) |
| 52 | Biagi: imprensa seguiu a americana, "perigo comunista"; esquerda: imperialismo e tortura | OK | FAPESP |
| 53 | Resumo | OK | d225 nota 3; UCSB; FAPESP |
| 54 | "sem soldados e com uma promessa de estudo"; "A guerra durou quase mais dez anos" | OK | d225. Redação: "A guerra ainda durou quase dez anos" soa melhor |
| 20 | "Apoiar por carta e na ONU custa pouco" | AJUSTAR (leve, não bloqueia) | A carta só diz que Castelo instruiu o representante. "Apoiar por carta custa pouco." |

### Novos problemas e texto de substituição
**Bloqueiam (aplicar antes de levar ao usuário)**
- **N1 (cena 9, ERRO):** trocar "Em agosto de 1955, o presidente do Sul, Diem, recusa as conversas" por **"Em agosto de 1955, o primeiro-ministro do Sul, Ngo Dinh Diem, recusa as conversas"**.
- **N2 (cena 28, exagero):** trocar "Os ataques a Hue e a Saigon têm o maior efeito." por **"Os ataques a Hue e a Saigon têm um forte efeito psicológico."**
- **N3 (cena 31, imprecisão):** trocar "Nixon manda que ele cumpra a pena nos próprios alojamentos, e no total ele passa cerca de quatro meses na prisão militar de Leavenworth." por **"Nixon manda tirá-lo da prisão e deixá-lo nos próprios alojamentos enquanto o recurso corre. No total, ele passa cerca de quatro meses na prisão militar de Leavenworth."**

**Não bloqueiam (recomendado)**
- Cena 20: "Apoiar por carta custa pouco."
- `sources.md`: atualizar os trechos de HUE, DIEM, NARA12 (paralelo 17) e incluir NARA13 na cena 36 (item 26).
- Cena 54: "A guerra ainda durou quase dez anos, e o Brasil a acompanhou de longe."
- Fechamento: apontar um próximo vídeo concreto ou a série de capítulos brasileiros.
- Cena 12: dividir a frase de 32 palavras: "O Miller Center resume o que veio antes. A crise budista, a lei marcial e os ataques aos pagodes convenceram o segundo escalão do governo Kennedy de que Diem precisava sair."

### R17 (tom de IA)
| Cena | Trecho | Status | Substituição |
|---|---|---|---|
| 03 | autodescrição do método | RESOLVIDO | Virou fato e ponte |
| 22, 23, 33(antiga), 42, 46, 51 | frases vazias e manifestos do ciclo 1 | RESOLVIDO | |
| 52/53 | repetição tripla "não disse não" | RESOLVIDO | |
| 21 | "A guerra deixa de ser assessoria e passa a ter tropas de combate." | RESTA (molde "deixa de ser X, passa a Y") | "São as primeiras tropas de combate americanas no país." (NARA ep. 5-8 trata o desembarque como a chegada das tropas de combate; se não confirmar, cortar) |
| 32 | "A guerra tira um presidente da disputa." | RESTA (frase de efeito) | Cortar; a frase anterior já diz o fato |
| 37 | "A retirada continua, mas a opinião já não espera por ela." | RESTA (vaga) | Cortar |
| 47 | "Empurrou a decisão para o Congresso, que só voltaria em março." | RESTA (repete a cena 46) | "Castelo Branco não recusou. Empurrou a decisão para o Congresso." |
Nenhum desses bloqueia.

### Learnings
- **L01: melhor.** O contador contínuo da cena 22 saiu; o conflito silêncio x whoosh da cena 27 foi resolvido (só whoosh). Ainda falta o campo `reason` por som (produção, `fx_check.py`). Cena 28: "até 3 impactos por minuto" numa cena de 26 s sobre ataques com mortos; recomendo **um** impacto só, na entrada do mapa.
- **L02: atendida no roteiro.** Agora há som de movimento no mapa das tropas (cena 5), na linha riscada (9), no espalhamento (25), nas setas de retirada (36), no arco (2) e no papel (19). Cena 21 tem "som de contador curto" para o contador de fuzileiros (ok, desde que curto e único).
- **L03:** cena 34 (quatro números de 5 dígitos) e cena 39 ("729 de 741 surtidas") continuam densas para TTS; escrever por extenso ou arredondar na fala e deixar o número exato na tela.

### Rubrica (`rubrics/script-long.md`), ciclo 2
| # | Critério | Peso | Nota | Justificativa (trecho) |
|---|---|---|---|---|
| 1 ⛔ | Gancho ≤ 10 s | 2 | 5 | "Em dezembro de 1965, o embaixador dos Estados Unidos pediu soldados ao presidente do Brasil." |
| 2 ⛔ | Loop ≤ 30 s | 1 | 5 | "O que o presidente respondeu? A resposta está no documento, e vamos lê-lo no fim deste vídeo." |
| 3 | Contexto enxuto | 1 | 4 | Cena 3 virou ponte com fato: "A história começa vinte anos antes do pedido, num discurso em Hanói" |
| 4 ⛔ | Ritmo | 2 | 4 | Marcações a cada 8 a 39 s; trechos ainda em molde "data + número" (cenas 34 a 41) |
| 5 | Pontes | 1 | 4 | Fio do Brasil volta no miolo: "No Brasil, 1968 também é o ano em que a guerra aparece nas ruas" (12:36) |
| 6 ⛔ | Payoff | 2 | 5 | "segundo a nota dos editores do Departamento de Estado, o Brasil nunca enviou tropas nem material militar ao Vietnã" (fiel à nota 3) |
| 7 | Densidade | 1 | 4 | Restam "A guerra tira um presidente da disputa" (32) e a repetição de março (46/47) |
| 8 | Linguagem falada | 1 | 4 | 13,7 palavras por frase; 2 frases > 30; números densos nas cenas 34 e 39 |
| 9 | Especificidade | 1 | 5 | "telegrama de 17 de dezembro", "416 a zero", "46% ... 49% ... 53%", com fonte |
| 10 | Fechamento | 0,5 | 2 | "diga qual nos comentários"; sem próximo vídeo |
| 11 | Originalidade | 1 | 4 | 0,93% no máximo; ângulo do Brasil agora também no miolo (cena 33) |
| 12 | Learnings | 0,5 | 4 | L02 atendida; L01 sem `reason` (produção) |
Σ = 10 + 5 + 4 + 8 + 4 + 10 + 4 + 4 + 5 + 1 + 4 + 2 = **61** → 61/60 × 100 = **101,7** (na escala real de 70: **87,1**). Nenhum ⛔ abaixo de 3. **Defeito de processo:** a fórmula da rubrica divide por 60, mas os pesos somam 14 (máximo de 70). Corrigir `rubrics/script-long.md` (dividir por 70) ou ajustar os pesos.

### Política (checklist)
- [x] YMYL: nada médico, financeiro ou eleitoral.
- [x] Pessoas reais: falas documentadas e atribuídas; cenas 47 e 53 corrigidas. Falta só N3 (Calley).
- [x] Conteúdo sensível: My Lai sem imagem de vítima; imolação sem imagem; Kent State com fato e sem dramatização.
- [x] R14: estilo D, sem cena realista gerada por IA; não marcar enquanto isso valer.
- [x] Direitos de imagem: Cronkite em tipografia, sem imagem da CBS; foto de Browne não usada; CH-53 em domínio público com atribuição.
- [x] Inautêntico/repetitivo: roteiro autoral; originalidade PASS.

### Não verificado neste ciclo
BR1, BR3 (CPDOC), BUD1, BUD2, DRAFT, IOM, JULY65, KHE1, KHE2, LB2, MAAG, MARCH67, MILL, REF, UNIF, WIL, ANPUH, COM: status pelo trecho do `sources.md`, como no ciclo 1.

### Veredito final: **REFAZER**
Motivo: 1 erro factual (N1) e 2 frases mais fortes que a fonte (N2, N3). Todo o resto do ciclo 1 foi aplicado e confere com as fontes. Com N1 a N3 aplicados literalmente (conferir por diff, sem nova revisão de mérito), o roteiro cumpre o DoD da revisão e pode ir ao usuário. Se não forem aplicados, escalar pelo R6.

## Fechamento do ciclo 2 (scriptwriter, 2026-11-19)
Correções N1, N2 e N3 aplicadas ao pé da letra, com o texto de substituição do revisor (cenas do 'primeiro-ministro Ngo Dinh Diem', 'forte efeito psicológico' e Calley 'nos próprios alojamentos enquanto o recurso corre'). Também aplicadas as recomendações não bloqueantes: 'e na ONU' removido da ponte, R17 das cenas de Da Nang, Johnson, Camboja e repetição de 'março', e `sources.md` atualizado (HUE, DIEM, END). Validadores após as correções: `script_check` PASS (3.187 palavras, 21,2 min), `originality_check` PASS (máx. 0,94%, agora lendo `.json3`). Ciclo 2 de 2 (R6): sem terceira revisão, por regra; o revisor indicou que o próximo passo é aplicar N1 a N3 e levar ao usuário.
Pendente de confirmação humana ou de produção: data exata da reunião Gordon–Castelo Branco (telegrama de 17/12/1965 não aberto); 19 fontes não reabertas pelo revisor (ver lista no ciclo 1); `reason` de cada som na produção.
VEREDITO: APROVADO (após aplicar N1 a N3; conferido por diff pelo agente principal, ciclo 2 de 2)
