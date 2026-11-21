# Rubrica: QA do vídeo inteiro (render final)

Origem: adaptada de `skills/revisao-profissional/references/criterios.md` e `edicao-narrativa.md` (repositório antigo kit-flow-generate, só leitura). Cortados os itens de 3D, avatar e Three.js. Complementa `rubrics/visual.md` (lote de cenas) e `rubrics/sound-fx.md` (som). Esta rubrica avalia o MP4 completo, depois que todos os lotes passaram.

Nota de 0 a 5 por critério. **Mínimo 4 em todos e média ≥ 4,3** para ir ao usuário. Gancho e Entrega têm nota mínima 4 e nenhum bloqueador aberto. Abaixo disso, volta ao produtor (máx. 2 ciclos, depois escala, R6/R8).

| # | Critério | Peso | O que se confere |
|---|---|---|---|
| Q1 | **Gancho** (0–45 s) | 3 | Primeiro quadro mostra uma situação reconhecível. A pergunta do título nasce de uma imagem concreta. Cada intervalo acrescenta informação, expectativa ou consequência. A resposta fica guardada para mais adiante. Escuridão, zoom e corte rápido sozinhos não contam como tensão. |
| Q2 | **Encadeamento** | 2 | Cada cena segue a anterior por causa e lugar. Mudança de tempo, lugar e personagem se entende na primeira passagem. O fio do Brasil reaparece onde o roteiro promete. A narração não explica o que a imagem deveria mostrar. |
| Q3 | **Progressão visual** | 3 | Cada tomada traz um evento, uma evidência ou uma mudança de estado. Mantenha um registro de retornos no vídeo inteiro: o mesmo enquadramento ou evento só volta se orienta, compara ou paga uma pergunta. Outro zoom ou outra cor sobre a mesma cena conta como repetição. |
| Q4 | **Ritmo** | 2 | Abertura mais rápida que o corpo. Mudança de padrão a cada ≤ 45 s. Nenhuma cena longa sem sub-beat. Corte no fim da frase ou da ação, nunca no meio da frase. Sem duração fixa por plano. |
| Q5 | **Ação e época** | 2 | Vale `rubrics/visual.md` (V9, V10) no vídeo todo: objetos se movem na palavra, têm chão e contato, uniforme, veículo e bandeira são do ano certo. Cota de mapa e texto ≤ 20%. |
| Q6 | **Voz** | 3 | Escutar o vídeo inteiro: pronúncia, nomes próprios, ênfase, pausa e respiro (0,25–0,45 s entre frases, 0,8–1,2 s entre parágrafos). `pipeline/validate/transcript_check.py` PASS em todas as cenas. Aprovar a voz de uma cena não aprova as outras. |
| Q7 | **Som** | 2 | `rubrics/sound-fx.md` e `fx_check.py` PASS. Voz sempre entendível. Música e ambiente sustentam a cena, sem encobrir a fala. Silêncio deliberado conta. Sem repetição automática do mesmo acento. |
| Q8 | **Entrega** | 3 | O arquivo toca do começo ao fim. Áudio presente e sincronizado. Duração, proporção e início e fim corretos (sem quadro parado ou mudo no começo). Texto legível em 360p. `render_check.py` PASS no master: −14 LUFS ±2, pico ≤ −1 dBTP, sem tela preta, congelado ou silêncio longo. Legenda no texto aprovado. |

Nota final = média ponderada. Bloqueador (qualquer um reprova, qualquer nota):
- fato sem fonte em `sources.md` (R1);
- som, voz ou imagem sem licença comercial (R13);
- conteúdo realista sem o aviso de conteúdo sintético quando exigido (R14);
- cena que não passou em `scene-production.md`.

## Como avaliar
1. Rode os validadores antes de olhar: `render_check.py`, `scene_gates.py`, `fx_check.py`, `transcript_check.py` por cena.
2. Folha de contato de 1 fps do master (`pipeline/research/contact_sheet.py --fps 1`). Procure repetição de enquadramento e cenas longas sem mudança.
3. Escute o vídeo inteiro, não só trechos. Quem não escutou marca o item como `not-verified`.
4. Verifique as junções entre lotes e entre capítulos, onde mais aparecem salto de estilo, de volume e de continuidade.
5. Registre por critério: nota, tempo e quadro da evidência, defeito e prioridade. Cada defeito P0/P1 volta ao produtor com o trecho, o problema, a consequência e o critério de aceite.

## Regras de evidência
- Status por checagem: `pass`, `fail` ou `not-verified`. Som não escutado e movimento não visto ficam `not-verified`.
- Escopo explícito: a aprovação de uma abertura ou lote não aprova o vídeo.
- Evidência antiga não prova correção nova: refaça a checagem depois de cada correção.
- Contagem de cenas, de efeitos ou de camadas não compensa um defeito de narrativa.
- Duas correções que não resolvem o mesmo defeito pedem replanejar a cena, não uma terceira tentativa igual (R8).

## Exemplo de reprovação (gancho)
Um ponto pequeno sobre horizonte escuro, sem ninguém olhando e sem a situação se desenvolver, reprova Q1 e Q2 mesmo com câmera e render perfeitos. Corrigir é mostrar quem observa, fazer o sinal ser descoberto e acompanhar uma mudança concreta. Mais corte e mais partícula não resolvem.
