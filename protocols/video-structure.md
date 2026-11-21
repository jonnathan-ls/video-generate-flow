# Protocolo: Estrutura do vídeo (modelagem da narrativa e plano de retenção)

**Agente:** strategist + scriptwriter · **Status:** `packaged` → `structured` · **Saída:** `structure.md` · **Depois:** roteiro (`protocols/script-long.md`)

Objetivo: decidir **a forma da narrativa antes de escrever uma linha do roteiro**, com um plano explícito de retenção e **previsões que o post-mortem vai conferir**. A embalagem (título + thumbnail escolhidos) é o contrato.

## Leitura obrigatória
`research.md` do vídeo, `packaging.md`, `knowledge/retention.md`, `knowledge/hooks.md`, `rubrics/structure-retention.md`, `learnings.md` (gancho, ritmo, shorts), `style-guide.md`, `research/visual-reference-ampulheta.md`.

## Passos
1. **Contrato.** Em 1 frase: o que o título e a thumbnail prometem; e "ao final o espectador precisa saber/sentir X". O gancho tem de confirmar essa promessa em ≤ 10 s.
2. **Modelo identificado e desvios.** Registre o **padrão comum** das referências do `research.md` (nº de atos, duração por bloco, padrão de abertura, onde estão as viradas) e **siga esse modelo**: ele é o que o público e o algoritmo já recompensaram. Todo desvio da estrutura macro é listado e justificado com evidência (máx. 2 sem evidência). **O conteúdo, o ângulo, o roteiro e a narração são originais**; só a forma acompanha o modelo.
3. **Três escalas de estrutura** (padrão observado no Ampulheta e confirmado nas referências, a ser **modelado, não copiado**):
   - **Macro:** o arco do vídeo em 5 a 8 atos, com minutos-alvo por ato.
   - **Meso:** cada ato tem uma pergunta, um desenvolvimento e uma **virada** (revelação, inversão ou consequência).
   - **Micro:** a cada 30 a 45 s, uma mudança de padrão (novo tipo de cena, número, pergunta, exemplo, silêncio).
4. **Beat sheet** (tabela): ato · minuto-alvo · objetivo · loop que abre · loop que fecha · virada · visual-chave · tipo de cena.
5. **Abertura (0 a 45 s)** especificada em detalhe: o que aparece e é dito aos 0–5 s, 5–10 s, 10–30 s e 30–45 s; que loop é aberto; se há vinheta de identidade (curta) ou trailer.
6. **Plano de retenção.** Pontos de risco previstos (aprox. 30 s, a passagem do ato 1 para o 2, o meio do vídeo, a véspera do clímax) com a mitigação de cada um (re-hook, loop novo, virada, mudança de ritmo). Onde ficam o **melhor momento (último quarto)** e o **segundo melhor (entre 10% e 25%)**.
7. **Mapa de cenas e estilo.** Estilo visual do vídeo (A, D ou B, conforme o experimento E1), tipos de cena por ato, mapas e rótulos necessários (lugares e datas), "provas" documentais, **orçamento de som/FX** (`rubrics/sound-fx.md`) e onde entram silêncio e impactos.
8. **Hipóteses e métricas-alvo** (relativas à mediana do canal; nos primeiros vídeos, `knowledge/benchmarks.md`): CTR, retenção aos 30 s, % média assistida. Declare **antes** de publicar o que se espera e por quê. O post-mortem compara previsão e resultado.
9. **Shorts derivados:** 4 a 5 momentos candidatos, cada um com gancho próprio que funcione sem contexto.

## Saída `structure.md` (seções obrigatórias, lidas pelo `status_gate`)
`## Promessa e contrato` · `## Modelo identificado e desvios` · `## Beat sheet` (tabela com ≥ 5 atos) · `## Abertura` · `## Plano de retenção` · `## Mapa de cenas e estilo` · `## Hipóteses e métricas-alvo` · `## Shorts derivados`

## Definition of Done
- [ ] Nota na rubrica `structure-retention.md` ≥ 80%.
- [ ] Soma dos minutos-alvo dos atos dentro de ±10% da duração-alvo do `brief.md`.
- [ ] Todo ato tem uma virada; há sempre ≥ 1 loop aberto em qualquer minuto do vídeo.
- [ ] As previsões estão quantificadas (não "vai ir bem").

## Erros comuns → ação
| Erro | Ação |
|---|---|
| Cronologia pura (um fato depois do outro) | Reorganizar em perguntas e viradas; a ordem do vídeo não precisa ser a ordem da história |
| Clímax logo no começo e queda depois | Mover o melhor momento para o último quarto; deixar o 2º melhor no início |
| Estrutura copiada de uma referência | Voltar ao `research.md` e combinar padrões de várias referências |
| Previsão vaga | Reescrever com números e o motivo; sem previsão não há aprendizado |

## Quando escalar
- A narrativa não sustenta a duração-alvo sem enrolação: propor encurtar ou dividir em série.
- Conflito entre o que a embalagem promete e o que a pesquisa permite afirmar: voltar à embalagem.
