# Rubrica: Pontuação de ideia (backlog)

Cada critério vale 0–5. **Nota = soma (máx. 30). Mínimo para seleção: 21 e Breakout ≥ 3.** Justificativa de 1 linha por critério.

| Critério | 0 | 3 | 5 |
|---|---|---|---|
| **Breakout** (canal pequeno com vídeo longo ≥ 10× a mediana e ≥ 100 mil views, na janela de recência abaixo, no tema ou em tema vizinho) | Nenhum | 1 canal | ≥ 2 canais distintos |
| Demanda comprovada | Sem sinal | 1 outlier 3× ou busca estável | ≥ 2 outliers ≥ 5× ou tendência em alta |
| Ajuste à promessa do canal | Fora | Tangente | No centro |
| Embalável (título + thumb fortes em 1 frase) | Não consigo | OK | Escrevo 3 títulos fortes em 1 minuto |
| Ângulo original **verificado** (não só proposto) | Igual a vídeo existente | Variação | Recorte que nenhum vídeo encontrado cobre |
| Produzível com nossas ferramentas | Exige o impossível | Com esforço | Natural para Flow/código/stock |

## Regras
- **Sem breakout, a ideia não é selecionada** (exceção só por decisão registrada do usuário). Demanda de canais grandes, sozinha, não prova que o tema está aberto a um canal novo.
- O **ângulo original** só vale nota alta depois de checado contra os vídeos existentes (busca no YouTube). Ângulo apenas proposto vale no máximo 3.
- Histórico: em 2026-11-19 a primeira seleção (Napoleão) teve nota 24/25 sem nenhum breakout. A rubrica antiga não pesava o sinal que o canal adotou como principal. Ver `channels/pt-br-historia/mistakes.md`.

## Recência (regra do usuário, 2026-11-19)
Um vídeo antigo acumula views com o tempo e não diz nada sobre o que funciona **agora**. O algoritmo, o público e o tema mudam. Por isso toda evidência tem idade, e a idade decide se ela vale:

| Idade do vídeo | Classe | Como conta |
|---|---|---|
| < 7 dias | NOVO | Ainda não estabilizou: só acompanhar |
| **7 a 120 dias** | **JANELA** | Conta plenamente como breakout e como demanda |
| 121 a 365 dias | ESTENDIDA | Só conta se houver **crescimento medido** (views/dia nas últimas coletas) ou prova de perenidade |
| > 365 dias | ANTIGO | **Nunca** conta como demanda ou breakout. Serve para **modelar a estrutura** e para saber quem é o concorrente estabelecido, sempre com a ressalva de idade |

- **Como medir o crescimento:** `pipeline/research/snapshot.py` guarda uma "foto" das métricas a cada coleta e, da 2ª foto em diante, calcula as views/dia reais entre elas. É assim que se descobre se um vídeo "veio crescendo" ou parou.
- **Métrica de velocidade:** views por dia desde a publicação, ao lado do múltiplo sobre a mediana do canal.
- Toda tabela de evidência traz a **data de publicação** e a **idade em dias**. Sem data, a evidência vale zero.

## Gate de espaço (regra do usuário, 2026-11-19)
Demanda comprovada não basta: o tema pode ter dono. Em 2026-11-19, o I01 (cidades afogadas por represas) tinha 3 breakouts, todos de **um** canal, e 24 vídeos longos na janela, com mediana de 590 views fora do líder (Vestígio, de mediana 11 mil, fez 3,4 mil nesse tema). O algoritmo entregava o tema a um canal só. Antes de selecionar, medir **no tema exato, na janela de 7 a 120 dias, só vídeos longos (> 15 min)**:

| Métrica | Como medir | Regra |
|---|---|---|
| S (oferta) | nº de vídeos longos de canais distintos | S ≥ 10 com mediana dos demais < 5 mil views = **SATURADO** (não selecionar) |
| Mediana fora do líder | mediana de views dos vídeos, sem o de maior views | < 5 mil com S ≥ 10: reprova; alta mediana = o algoritmo distribui |
| Breakouts distintos | canais pequenos diferentes com ≥ 10× e ≥ 100 mil views na janela | **≥ 2 canais distintos** = demanda distribuída (bom sinal). 1 canal só = demanda capturada |
| Vizinhança | breakout em tema vizinho com poucos vídeos (ex.: Orós, 1.158×, canal de 1,8 mil) | favorece: tema com demanda e sem enxame |

Preferir o tema com **2 ou mais canais pequenos distintos** em breakout e **oferta baixa (S ≤ 8)**. O I01 foi pausado por este gate (`research/raw/panorama.json`).

**Como medir (obrigatório):** só vale a medida do `pipeline/research/supply.py` em NÍVEL DECISÃO. Medidas de triagem ou de subagente não habilitam seleção. Para mediana de poucos vídeos, olhar também a fração abaixo de 5 mil e a mediana sem os 2 maiores.
