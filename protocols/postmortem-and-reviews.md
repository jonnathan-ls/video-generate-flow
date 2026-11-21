# Protocolo: Post-mortem, revisão semanal e estratégia mensal

**Agente:** analyst · **Fonte de dados:** `data/metrics.sqlite` (YouTube Analytics API). Nunca estimar métricas (R3).

## Checkpoints por vídeo
| Quando | O que olhar | Ação possível |
|---|---|---|
| 24 h | Impressões, CTR, views vs. mediana dos vídeos do canal | CTR < 60% da mediana do canal com impressões ≥ 1.000 → considerar trocar a thumbnail (se não houver Test & Compare rodando) |
| 72 h | Retenção aos 30 s, APV, origem do tráfego | Registrar no post-mortem parcial |
| 7 d | Curva de retenção completa, inscritos/1k views, shorts: % viewed vs swiped | Post-mortem v1 |
| 28 d | Tudo + desempenho relativo ao canal | Post-mortem final → learnings |

## Diagnóstico (árvore fixa — seguir na ordem)
1. **Impressões baixas** (< 50% da mediana do canal)? → tema/demanda ou sinal fraco de vídeos anteriores. Hipótese: tema.
2. **CTR baixo** (< 70% da mediana do canal)? → embalagem.
3. **Retenção aos 30 s baixa** (< 65% em longos)? → gancho não confirmou a promessa ou demorou.
4. **Quedas acentuadas no meio** (inclinação maior que a média da curva)? → localizar o timestamp, abrir o `script.md` na cena correspondente e classificar (enchimento, tangente, visual monótono, áudio).
5. **APV bom e inscritos/1k baixo?** → promessa do canal pouco clara ou falta de CTA para o próximo vídeo.
6. **Shorts:** viewed < 60%? → frame 0 / primeira frase.

## Saída `postmortem.md`
Métricas (tabela com fonte e data), diagnóstico pela árvore, comparação com a hipótese do brief, **1 a 3 lições** no formato de `learnings.md`, decisão sobre experimentos.

## Promoção para `learnings.md`
- Lição nova → `hipótese` (confiança baixa).
- Confirmada em ≥ 2 vídeos → `obrigatória`.
- Contradita por 2 vídeos → `revogada` (manter a linha, para histórico).

## Revisão semanal (segunda-feira)
1. Tabela dos vídeos da semana vs. mediana do canal.
2. Top 1 e pior 1, com o porquê (pela árvore).
3. Status dos experimentos.
4. Erros operacionais (`mistakes.md`) e as correções aplicadas.
5. Até 3 ajustes concretos para a próxima semana + o pedido de decisão ao usuário (B6).

## Estratégia mensal
1. Tendência de 28 dias: inscritos, horas de exibição, views, RPM (se houver).
2. Quais formatos/séries dobrar, manter ou cortar (com dados).
3. Revisar `competitors.md` (entrou alguém? quem cresceu?).
4. Progresso para o YPP (requisitos em `knowledge/benchmarks.md`).
5. Propor no máximo 3 mudanças estratégicas ao usuário.
