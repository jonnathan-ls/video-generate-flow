# Estilos e abordagens para testar no futuro

Fonte: ideias do usuário (2026-11-19). Regra de trabalho: **um teste por vez, em outro momento**, nunca misturado com a produção do primeiro vídeo.

## Em uso (candidatos do Lacre, rodízio E1)
| ID | Estilo | Estado |
|---|---|---|
| A | Ilustração flat em camadas (imagens do Flow + código) | Validado no teste de 39 s |
| D | 100% código (SVG procedural) | Validado; a evoluir: textura, física, pessoas, qualidade de render |
| B | Colagem documental (gravuras de domínio público) | Validado |

## Ideias do usuário para outros canais ou nichos
| Estilo | Observação inicial |
|---|---|
| Massinha de modelar (claymation) | Depende de textura e iluminação; avaliar com o Flow e com shaders por código |
| Textura em crochê | Idem; bom para nichos leves. A pasta do kit antigo tem material sobre "crochê" (ver triagem) |
| Whiteboard / quadro branco | Muito bom em código (traços animados); é o tipo de estilo mais barato de repetir |
| Papel / recorte (paper cutout) | Próximo de B e A; bom com sombras e camadas |
| Estilos de prompt (kit "style-video-prompts") | Biblioteca de prefixos para o Flow; entrar como variação de A |
| Colagem (kit "director-de-collage") | Variação de B com recortes e fundo; o usuário gostou |
| Abordagem de vídeo com Claude Fable (kit "motion-graphics-com-fable-5") | Estratégia de abordagem do vídeo; útil para o protocolo de roteiro e cenas |

## Como cada teste novo deve rodar
1. Mesma narração e mesmo roteiro de cenas; só muda o estilo.
2. Mesmo pacote de som/FX (R16), validado por `fx_check.py`.
3. Rubrica visual V1–V8 + avaliação do usuário.
4. No máximo 3 iterações; registrar em `lab/bakeoff-2026-11/bakeoff-log.md`.
5. Só depois decidir se o estilo vira um candidato de rodízio.

## Melhorias já anotadas para o estilo D (código)
- Texturas: ruído de papel e grão por camada, gradientes mais ricos.
- Física: balanço de navios e tecidos por molas, partículas com gravidade.
- Pessoas: mais poses e silhuetas, variação de roupas e proporções.
- Render: iluminação com luz direcional, sombras projetadas, atmosfera (névoa em camadas).
