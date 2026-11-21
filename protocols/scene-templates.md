# Modelos de tomada aprovados (reaproveitar em vez de escrever do zero)

Cada modelo vem de uma tomada **aprovada** (nota ≥ 4 na revisão com âncora). Copie o bloco `scene` para o `scenes_spec.json`, troque `src`/fundo e os tempos (`*_word`). Só entra aqui o que o usuário ou a revisão aprovou.

## M1 — Navio chega e atraca (S05, aprovado pelo usuário em 2026-11-20)
Fonte: `channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json` → `S05.shots[0]` (navio britânico em Saigon) e `S05.shots[2]` (Haiphong, com prancha e tropa descendo por `path`/`path_s`).
- Navio: `from` fora do quadro → `to` no cais, `ease: out`, `bob` 1–2, `rock` 0,25–0,5, `wake: true`, `sink` 0,2, `smoke` na chaminé, `sfx: engine`.
- Tropa descendo: `path` com pausa na prancha, `frames` (3 poses) a 6–7 fps, `sfx: steps`.

## M2 — Coluna marchando (S05.shots[1])
- `frames` de 3 poses da coluna inteira, `frame_fps` 6, `ease: linear`, velocidade ≤ 10% da tela em 2,5 s (passo real), `sfx: steps`.

(Próximos modelos entram à medida que os lotes forem aprovados: tanque avança, avião passa, helicóptero decola, multidão.)
