# Protocolo: Pesquisa e decisão de nicho (Fase 0)

**Agente:** strategist + trend-researcher · **Saída:** `research/niche-<idioma>-<data>.md` · **Decisão:** usuário (B1)

## Entrada
- Idioma/mercado alvo (PT-BR ou EN).
- Restrições fixas: faceless; voz IA/clonada; visuais via Google Flow + código + stock; custo zero; políticas de IA do YouTube.

## Leitura obrigatória
`knowledge/policies-ai.md`, `knowledge/algorithm.md`, `rubrics/niche-scoring.md`.

## Passos
1. **Gerar candidatos (20–25):** combine categorias perenes com bom RPM (finanças pessoais, tecnologia/IA, ciência, história, psicologia, curiosidades, negócios, saúde explicativa não-médica, geografia/geopolítica, mistérios/true crime documental, educação). Para cada um, liste 2–3 sub-nichos específicos (nicho largo demais é desclassificado). **Inclua também, em cada categoria, o recorte "grandes temas, história completa"** (ex.: "2ª Guerra: a história completa"). Em 2026-11-19, a pesquisa PT-BR só olhou recortes específicos e deixou passar o maior breakout do nicho (@ampulheta_ac: 32 mil inscritos e 1,5 mi de views em 1 mês, com temas mundiais amplos).
2. **Coletar evidência por sub-nicho** (sem evidência → nota 0 no critério):
   - 3–5 canais faceless ativos com URL, inscritos e média de views dos últimos 20 vídeos;
   - pelo menos 3 outliers recentes (≤ 12 meses) com views ≥ 3x a mediana do próprio canal;
   - **busca ativa de breakouts de canais pequenos** (definição em `rubrics/niche-scoring.md`): canais com < 50 mil inscritos ou < 50 vídeos que tiveram um vídeo longo ≥ 10× a mediana e ≥ 100 mil views nos últimos 12 meses. Para cada canal: inscritos, nº de vídeos, mediana, vídeo, views, múltiplo. **Shorts não contam.** Procurar com a busca do YouTube filtrada por "este ano" e ordenada por views, e abrir a aba /videos dos canais pequenos que aparecerem;
   - sinais de demanda: sugestões do autocomplete do YouTube e Google Trends (direção 12 meses).
3. **Pontuar** cada sub-nicho com `rubrics/niche-scoring.md`. Registre a justificativa de cada nota em uma linha com a evidência.
4. **Eliminar** sub-nichos com qualquer critério eliminatório (veja a rubrica).
5. **Top 3:** para cada um, escreva promessa do canal, persona, 3 formatos recorrentes (séries), 10 ideias de exemplo com títulos, canal-modelo e plano de diferenciação, riscos.
6. **Recomendar 1** com o motivo em 3 linhas e apresentar ao usuário (B1).
7. Após a escolha: registrar em `decisions.md` do canal, criar `channels/<idioma>-<slug>/` a partir de `_template`, preencher `brand.md`, `audience.md`, `competitors.md` e 30 ideias em `backlog.md`.

## Definition of Done
- [ ] ≥ 20 candidatos e todos os sub-nichos pontuados com evidência por linha.
- [ ] Tabela de breakouts por sub-nicho no relatório (canal, inscritos, nº de vídeos, mediana, vídeo, views, múltiplo). Nenhum candidato do top 3 tem breakout < 3.
- [ ] Os critérios usados pelos pesquisadores seguem a escala da rubrica (risco de política: 5 = risco BAIXO). Quando chegarem em outra escala, converter antes de pontuar.
- [ ] Cada canal citado tem URL verificável (aberta pelo menos uma vez).
- [ ] Nenhum número sem fonte (R2).
- [ ] Top 3 com promessa, persona, séries, 10 ideias e riscos.
- [ ] Recomendação explícita.

## Erros comuns → ação
| Erro | Detectar | Ação |
|---|---|---|
| Nicho genérico ("tecnologia") | Sub-nicho não cabe em uma frase específica | Quebrar em sub-nichos |
| Escolher por "parece legal" | Nota sem evidência | Zerar critério e buscar evidência |
| Ignorar risco de política | Formato = compilação/reupload/slideshow sem narrativa | Marcar eliminatório |
| RPM chutado | Sem fonte | Usar faixa qualitativa (baixo/médio/alto) com referência citada |

## Quando escalar
- Empate (diferença ≤ 5% na nota) entre o 1º e o 2º → apresentar os dois.
- Acesso às fontes bloqueado (cota da API, bloqueio) por mais de 2 tentativas.
