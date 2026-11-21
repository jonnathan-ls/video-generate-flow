# lab/: laboratório (testes e experimentos)

**Regra: o laboratório nunca alimenta a produção diretamente.** Tudo aqui é teste, comparação ou exploração. A produção de um vídeo só usa código, regras e dados que estão fora de `lab/` e passaram por revisão.

## Onde fica cada coisa
| O quê | Laboratório | Produção |
|---|---|---|
| Documentos de teste, planos e resultados | `lab/<teste>/` | `protocols/`, `rubrics/`, `knowledge/` |
| Mídia de teste (renders, imagens, áudio) | `media/lab/<teste>/` | `media/<canal>/<video>/` |
| Código de teste (composições Remotion) | `studio/remotion/src/lab/<teste>/` | `studio/remotion/src/videos/<video>/` |
| Componentes reutilizáveis (cores, mapa, rótulos, FX) | — | `studio/remotion/src/lacre/` (recebem dados por parâmetro; **não importam nada de `lab/`**) |
| Ferramentas de pipeline | — | `pipeline/` |
| Aprendizados e decisões | linha no log do teste | `channels/<canal>/learnings.md`, `decisions.md` |

## Como algo sai do laboratório
1. O teste termina com um resultado e uma decisão registrados.
2. O que for aproveitado é **reescrito ou revisado** na área de produção (nunca copiado em bloco), com teste e validador.
3. A decisão vai para `decisions.md` e o aprendizado para `learnings.md`.
4. O teste fica aqui, como histórico. Não é apagado.

## Conteúdo atual
- `bakeoff-2026-11/`: teste de estilos (A flat + Flow, B colagem, D código puro), motor (Remotion × HyperFrames) e pacote de som/FX. Resultado: `bakeoff-result.md`; histórico completo: `bakeoff-log.md`.
- `style-ideas.md`: estilos e abordagens para testar no futuro (massinha, crochê, whiteboard, papel, kits antigos).
- `hyperframes-engine-test/`: projeto do HyperFrames usado só para comparar motores. O Remotion é o motor da produção.
- `skills-hyperframes/`: skills do HyperFrames, tiradas da lista de skills do projeto para não poluir a produção. Para reativar, mova a pasta desejada de volta para `.claude/skills/`.
