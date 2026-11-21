# Protocolo: Radar de ideias e seleção semanal

**Agentes:** trend-researcher (radar) → strategist (seleção) · **Status:** `idea` → `selected` · **Usuário:** B2

## Radar (2x por semana)
1. Para cada canal em `competitors.md` (mínimo 10, sendo pelo menos 5 do mesmo porte ou menores): coletar vídeos dos últimos 30 dias com views, data e duração.
2. Calcular **múltiplo de outlier** = views do vídeo ÷ mediana de views dos últimos 20 vídeos do canal. Considerar só vídeos com ≥ 7 dias. **Outlier = múltiplo ≥ 3.** Considerar só vídeos na **janela de recência** (7–120 dias; ver `rubrics/idea-scoring.md`); os de 121–365 dias só com crescimento medido (`snapshot.py`); os mais antigos nunca contam como demanda. Marcar como **breakout** (prioridade máxima no backlog) quando o canal tiver < 50 mil inscritos ou < 50 vídeos, o múltiplo for ≥ 10 e o vídeo tiver ≥ 100 mil views (ver `rubrics/niche-scoring.md`). Além dos concorrentes fixos, buscar todo radar por canais pequenos novos no nicho (busca "este ano" ordenada por views) e adicioná-los a `competitors.md`.
3. Para cada outlier, extrair: tema, ângulo, estrutura do título, conceito da thumbnail, duração.
4. Gerar a ideia para o nosso canal: **mesmo desejo do público, ângulo diferente** (mais profundo, mais atual, outro recorte, outra pergunta). Proibido copiar título ou roteiro.
5. Complementar com demanda: autocomplete do YouTube para palavras-semente do nicho e Google Trends.
6. Pontuar com `rubrics/idea-scoring.md` e inserir em `backlog.md` com status `idea`.

## Radar de tendências por canal (2026-11-19)
`python3 pipeline/research/trend_radar.py` (só yt-dlp, ~3 min) varre o YouTube "este mês, ordenado por views" com consultas amplas e lista **ondas**: canais com ≤ 20 vídeos longos e < 100 mil inscritos cujo vídeo longo recente (3 a 45 dias) tem views altas. Mostra a **fórmula** que está funcionando (formato, duração, tipo de abertura), não só o tema. Resultado em `data/trends/AAAA-MM-DD.json`. Rodar antes de cada seleção; é triagem (a oferta do tema se confirma com `supply.py`). Canal de referência dado pelo usuário: History In Bold (ver `data/trends`).

## Triagem x confirmação (regra do usuário, 2026-11-19)
O radar é **triagem**: serve para listar candidatos, nunca para decidir. Antes de qualquer ideia virar `selected`, rodar a **confirmação de oferta**: `python3 pipeline/research/supply.py <slug> --regex "<termos do tema>" -q ... (≥ 8 consultas)`. Só vale como decisão a medida marcada **NÍVEL DECISÃO** (≥ 8 consultas, ≥ 12 vídeos e convergência). Números de oferta no `brief.md` e no `research.md` vêm desse script; número de subagente ou de triagem entra só como "triagem". Se a medida for TRIAGEM, ampliar as consultas (sem novos subagentes) antes de selecionar. Motivo: em 2026-11-19 a mediana fora do líder da Geada Negra foi 47 mil (triagem), 6.436 (subagente) e 1.080 (script): a decisão foi tomada sobre o número errado.

## Seleção (1x por semana)
1. Ler `learnings.md`, `experiments.md` e o último `weekly-review`.
2. Selecionar o nº de ideias da cadência (padrão: 1 longo + 4–5 shorts). Shorts devem preferir recortes do longo da semana ou ideias com nota de embalagem ≥ 4.
3. Garantir variedade: no máximo 2 vídeos seguidos do mesmo sub-tema, salvo se um learning mandar dobrar a aposta.
4. Associar a cada ideia uma hipótese de `experiments.md`, se houver uma ativa.
5. Apresentar ao usuário: tabela (ideia, nota, outlier de referência, por que agora). Recomendação primeiro.
6. Após a aprovação, criar `videos/<AAAA-MM-DD-slug>/` a partir de `_video-template`, preencher `brief.md` e avançar para `selected`.

## Definition of Done
- [ ] Toda ideia tem pelo menos 1 outlier ou sinal de demanda com URL.
- [ ] Nota calculada pela rubrica, não "estimada".
- [ ] `brief.md` preenchido com promessa, ângulo original e IDs de learnings aplicados.

## Escalar
- Nenhuma ideia ≥ nota mínima na semana → reportar e propor expandir a lista de concorrentes ou o sub-tema.
