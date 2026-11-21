# BRIEF: S03 do vídeo "Guerra do Vietnã" no estilo livro-pop-up (teste da skill claude-video)

- **Quadro:** 1920 × 1080, 30 fps, **9,91 s**, sem loop, sem som (a narração entra depois na montagem).
- **Estilo:** `livro-pop-up` (`~/.claude/skills/claude-video/estilos/livro-pop-up/ESTILO.md`): página creme `#F2E8D5` com grão. Folhas de papel recortado pousam uma a uma, com sombra larga no ar e justa ao assentar (back.out(1.2), 0,8 s), em 5 a 7 camadas com paralaxe. Cada letra é papel e cai com a própria sombra (EB Garamond 500 itálico, Google Fonts).
- **Paleta:**
  - areia `#E3CBA8`;
  - sálvia `#9CB49A`;
  - sálvia escura `#5E7F6A`;
  - petróleo `#2F5D62`;
  - tinta `#2B2B2B`;
  - **um acento só:** vermelho-bandeira `#B5483B`, que troca o rosa.
- **Narração (tempos em segundos, a ação cai na palavra):** A@0.0 história@0.2 começa@0.5 vinte@0.9 anos@1.2 antes@1.5 do@1.8 pedido@2.0 num@2.7 discurso@2.8 em@3.3 **Hanói@3.5** e@4.2 termina@4.4 quase@4.6 dez@5.0 anos@5.2 depois@5.5 dele@6.1 em@6.3 **Saigon@6.6** No@7.7 meio@7.9 há@8.1 um@8.3 lugar@8.4 para@8.7 o@8.9 **Brasil@9.1**

## Batidas
| Tempo | O que acontece |
|---|---|
| 0,0–4,2 | **Hanói 1945.** Pousam colinas, telhados baixos de papel e o acento: bandeira vermelha de estrela amarela, que pousa em "discurso" (2,8). As letras "Hanói 1945" caem em "Hanói" (3,5). |
| 4,2–7,7 | As folhas de Hanói levantam e saem, em ordem inversa, a partir de "termina" (4,4). **Saigon 1975:** pousam rio, prédios e um helicóptero de papel, que atravessa em "depois" (5,5). As letras "Saigon 1975" caem em "Saigon" (6,6). |
| 7,7–9,91 | As folhas de Saigon saem em "No" (7,7). **Brasil 1965:** pousam o morro (Pão de Açúcar), o mar e uma bandeira verde e amarela, que fica sem acento novo. As letras "Brasil 1965" caem em "Brasil" (9,1). |

## Não pode
- gradiente mudando de cor, brilho ou bloom;
- movimento linear no que o olho acompanha;
- tudo centralizado (o texto fica na margem esquerda);
- nada crescendo do zero;
- mais de 6 palavras na tela;
- mais de uma cor de acento.

Não copie o tema da peça de referência, só o método.

## Metas de movimento (pericia-movimento.py)
- amplitude ≥ 2,2x;
- quase-parada ≤ 40%;
- pelo menos 2 picos;
- nenhum trecho parado acima de 1,0 s (`ritmo.py`).
