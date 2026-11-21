# Direção de colagem: camadas, prompts do Flow, câmera e continuidade

Origem: reescrita em PT-BR a partir de `kits/kit-director-de-collage/references/{escenas-y-prompts,estilo-archivo,animar}.md` e `skills/direcao-visual/SKILL.md` (repositório antigo kit-flow-generate, só leitura). O material de `kit-director-de-collage` é de terceiros e sem licença explícita, por isso aqui só entram o método e exemplos próprios do Lacre. Não entram o motor `collage.tsx`, as paletas e as fontes do estilo "Archivo". O estilo do Lacre é o do prefixo fixo de `lab/flow-prompts-s04.md` (ilustração pintada, paleta vinho, pergaminho, carvão, latão e azul-ardósia). Padrão visual: R18 e `protocols/scene-production.md`.

## 1. Roteiro que funciona em colagem
- Frase curta, uma ideia por cena.
- Cada cena tem algo que se vê e se anima: "o navio atraca", não "a França decide".
- O texto na tela tem 2 a 6 palavras (lugar, data, termo), nunca o roteiro inteiro.
- Cerca de 2,5 palavras por segundo de voz. O tempo da cena vem da fala (ver `knowledge/longform-production-lessons.md`).

## 2. Ficha de cena
Para cada cena, registre: tempo, fala coberta, acontecimento, estado inicial e final, foco, enquadramento, camadas e função de cada uma, movimento e pausa, som, transição e o motivo dela. Declare só o que ajuda a entender a ação.

Antes de desenhar, responda:
1. Qual verbo concreto descreve a ação, e o que muda do começo ao fim?
2. O que o espectador precisa perceber, e que imagem prova isso?
3. Onde estão sujeito, objeto e destino, e para que lado se movem?
4. Qual é o foco principal? Dois focos de mesma força disputando a atenção reprovam.
5. Em que palavra a ação acontece? (R18: ±0,4 s.)

## 3. Camadas
| Camada | O que é | Como pedir ao Flow |
|---|---|---|
| Fundo | O lugar, sem ninguém na frente | Plano aberto, espaço livre no centro, "no people in the foreground". |
| Figura ou objeto principal | Navio, coluna, avião, multidão, carro | Isolado sobre verde `#00B140`, luz uniforme, sem sombra no fundo, borda limpa para recorte. Se o objeto tem verde, use azul `#0047BB`. Inteiro, com margem. |
| Primeiro plano | Poste, galho, bandeira, grade, que cruza a câmera e dá profundidade | Igual à figura, sobre verde. |
| Efeito | Fumaça, fogo, explosão, poeira | Sobre fundo preto ou verde, para recorte e composição por cima. |

Regras:
- Heurística: uma âncora e até duas camadas de apoio. Mais camadas só se cada uma tiver função e profundidade legíveis.
- Recorte com `python3 pipeline/assembly/chroma_cut.py in.jpg out.png`. Confira o recorte sobre uma cor forte e veja se sobrou tinta verde na borda.
- Camadas diferentes por escala, plano, sombra e material. Evite camadas coplanares e transparências empilhadas.
- A camada de apoio não precisa se mover junto com a principal. Um movimento dominante por vez.

## 4. Modelo de prompt de imagem
O prefixo fixo vai completo em todo prompt, inclusive de objeto sobre verde. Sem ele a imagem sai realista e destoa.

```
[PREFIXO FIXO de lab/flow-prompts-s04.md] [O que é, em uma frase]. [Detalhes: roupa, material, luz, gesto]. [Enquadramento]. [Fundo: o lugar, ou "isolated on a plain flat chroma key green background (pure #00B140, evenly lit, no shadows on the background), clean sharp edges for cutout, no ground"]. No text, no letters, no logos, no watermark.
```

Boas práticas:
- Escreva época e lugar no prompt (ano, uniforme, veículo, bandeira). Liste o que não pode aparecer: "no monuments, no modern buildings" (lição do mausoléu de Hanói 1945).
- Fundo com "open space in the center" quando algo vai entrar no meio.
- Texto, número e rótulo nunca saem da imagem. Entram como camada de texto.
- Imagem do Flow a 16:9, Nano Banana, 0 crédito, em lote numa chamada só (`AGENTS.md` 4b).

Exemplo de fundo: `[prefixo] Saigon harbor in September 1945, wide empty quay with French colonial buildings with yellow walls and red tile roofs, calm brown river water, overcast tropical light. No people and no ships in the foreground, open space in the center of the frame.`

Exemplo de objeto: `[prefixo] A British troop transport ship from 1945 seen from the side, grey hull, one funnel, whole ship visible with generous margin, isolated on a plain flat chroma key green background (pure #00B140, evenly lit, no shadows on the background), clean sharp edges for cutout, no water, no ground.`

## 5. Câmera, profundidade e textura
- Todo movimento tem motivo: acompanhar a ação, mostrar um detalhe, ligar duas evidências, mostrar distância. Dê preparação, deslocamento e assentamento.
- Câmera, movimento interno do objeto e corte são escolhas diferentes. Se o sujeito já se move, a câmera pode ficar estável. Não some zoom, pan, rotação, partícula e flash sem funções diferentes.
- Profundidade: o que está perto fica nítido e passa rápido, o que está longe fica suave e passa devagar (parallax). Camada de primeiro plano cruza a câmera.
- Textura: grão de papel e de filme leves, atmosfera (névoa, poeira, luz) em pelo menos 70% das cenas (V6). Vinheta pesada não: o usuário recusou (2026-11-20).
- Ar vivo: pelo menos uma coisa sempre se move (fumaça, bandeira, água, poeira). Nada parado por mais de 2 s (V3).
- Chão: o objeto tem apoio e contato (casco na água, pés no chão, sombra). Velocidade real: caminhada de 0,5 a 1 altura de corpo por segundo.

## 6. Transições
- Corte seco é a transição padrão dentro de um bloco. Dissolve, passagem por objeto, borda de papel ou máscara só quando ligam as duas cenas por algo que se vê.
- O corte cai quando a ação muda, não por intervalo fixo e não por palavra solta.
- Preserve eixo e direção: se o navio sai para a direita, o próximo plano o recebe pela esquerda.
- Mudança de lugar ou ano leva rótulo curto na tela (V7).

## 7. Animação de pessoa a partir de imagem do Flow
Se a cena pede uma pessoa se movendo no Flow (imagem sobre verde como primeiro quadro), o prompt de vídeo fixa a câmera e descreve um movimento pequeno e natural:

```
Locked-off static camera, no camera movement, no zoom, same framing and lighting for the whole shot. [Quem] stays in the same position. [Movimento pequeno: respira, pisca, levanta o olhar, escreve uma linha]. The flat chroma green background stays flat and unchanged. No snow, no particles, no text, no music, no voice.
```
Vídeo gasta crédito. Antes de gerar, a tarefa precisa de autorização do maestro (AGENTS.md, regra 2).

## 8. Inspeção
Veja a cena em movimento, na velocidade normal. Confira: o foco aparece de imediato, a imagem prova a fala, eixo e direção se mantêm, cada camada acrescenta algo, nada tem borda acidental, flicker, texto cortado ou tremor. Se um elemento pode sair sem perda, tire. Registre o que foi visto e o que não foi.
