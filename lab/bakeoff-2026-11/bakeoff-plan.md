# Teste comparativo de estilo e motor (bake-off): plano

**Objetivo:** decidir com evidência visual (e não por opinião) o **estilo base** do Lacre e o **motor de composição**, antes de construir o pipeline completo.
**Insumos:** `research/visual-reference-ampulheta.md` (referência + rubrica V1–V8) e `research/motion-market-2026-11-19.md` (motores, práticas, licenças).

## Trecho de teste (igual para todos os candidatos)
- **Narração de 40 a 45 s**: abertura de um tema do backlog. Proposta: **W01 Napoleão / 1808**, com cena de impacto, rótulo de lugar e data, mapa da Europa → Atlântico → Rio, número em destaque e frase de impacto.
- A mesma narração (voz Kokoro PT-BR), a mesma música e o mesmo roteiro de cenas para todos. Só o visual muda.

## Candidatos
| ID | Estilo | Motor | Fonte das imagens |
|---|---|---|---|
| **A** | Ilustração flat em camadas (parallax, atmosfera) | Remotion | Google Flow com prompt de estilo fixo + recorte por chroma |
| **B** | Colagem documental (papel, selos, recortes de fotos e gravuras de domínio público) | Remotion | Wikimedia, Library of Congress + Flow para preencher lacunas |
| **C** | Híbrido: flat para as reencenações, documentos reais como "provas", mapas por código | Remotion | Flow + arquivo |
| **A-HF** | O mesmo de A | **HyperFrames** | As mesmas imagens de A, para comparar só o motor |

Os componentes comuns, como mapa d3-geo, rótulo de lugar/data, cartela de título, número em destaque e frase de impacto, são escritos uma vez, com os tokens de design do Lacre.

## Critérios de decisão
1. **Rubrica visual V1–V8**, com mínimo de 4 em todos os critérios. A V8 (sua avaliação lado a lado com o Ampulheta) decide o desempate.
2. **Motor:** número de iterações até a cena ficar correta (medida de quanto o Claude erra), tempo de render de 45 s na sua máquina e estabilidade (crash ou vazamento de memória).
3. **Custo de produção:** imagens do Flow por minuto de vídeo e tempo humano gasto.

## Limites (para não repetir o Titanic v11)
- **Máximo de 3 iterações por candidato.** Na 3ª, o candidato é avaliado como estiver.
- Sem assets 3D e sem catálogo genérico.
- Cada iteração registra o que mudou e por quê em `lab/bakeoff-2026-11/bakeoff-log.md`.

## Pré-requisitos
| Item | Ação | Seu papel |
|---|---|---|
| Node + Remotion + skills oficiais do Remotion para Claude | `npm` no diretório `studio-remotion/` deste repositório | nenhum |
| HyperFrames + skills | `npm` no diretório `studio-hyperframes/` | nenhum |
| Kokoro TTS (PT-BR) | `pip` num venv + download do modelo (~330 MB) | nenhum |
| Google Flow | Operado por mim no navegador, com a sua conta já logada | login, se a sessão não estiver ativa |
| Disco | ~5 GB para dependências e renders | — (116 GB livres) |

## Entregável
Os 4 vídeos de 45 s lado a lado, mais uma folha de contato de cada um ao lado da folha do Ampulheta, a tabela da rubrica e uma recomendação. **Você decide** o estilo e o motor.
