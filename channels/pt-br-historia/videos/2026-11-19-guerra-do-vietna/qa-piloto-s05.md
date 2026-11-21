# QA independente: piloto de recortes animados da cena 5 (S05)

- Revisor: agente `reviewer`, ciclo 1 (R6) · data: 2026-11-20
- Objeto: `media/pt-br-historia/vietna/render/S05.mp4` (28,50 s, 1920×1080, 30 fps), spec `scenes_spec.json` (S05, 5 tomadas), código `studio/remotion/src/vietna/scene.tsx`, eventos `S05_mix.events.json`, palavras `render/props/S05.json`, fonte `FLOW-S05` e `HO45`/`FR46` em `sources.md`.
- Método: quadros em 0,3 / 3,0 / 5,0 / 5,9 / 7,0 / 7,2 / 8,5 / 9,5 / 12,0 / 14,0 / 15,3 / 17,0 / 21,0 / 21,4 / 21,8 / 22,6 / 24,0 / 24,5 / 27,5 s; séries a 5 fps (6,4–9,2 s; 21,2–22,8 s) e a 10 fps (24,0–24,5 s); recortes ampliados em resolução cheia; os três PNG recortados sobre fundo magenta e análise de pixels esverdeados na borda; quadros reduzidos a 640×360; energia por 0,5 s do mix menos a voz; leitura das páginas 22 e 23 do Country Study (countrystudies.us).
- Learnings aplicáveis: L01 (som só com motivo narrativo, dentro do orçamento) e L02 (movimento relevante tem som baixo com a duração do movimento). Erro de referência em `mistakes.md`: cena 1 entregue como imagem estática ("não ficou bom").

## Veredito: REFAZER

Motivos: V2 = 3, V3 = 3 e V5 = 3 (abaixo do mínimo 4); F9 viola a rubrica de som/efeitos (tremor de 14 px e clarão de 0,55, num evento `visual: false`); a ação não é crível em três das cinco tomadas (soldados andando sobre o rio, soldados deslizando a cerca de 10 vezes a velocidade de uma caminhada, fogo desenhado como retângulos luminosos); 5,4 s da tomada da usina sem nenhum objeto se movendo, que é exatamente o que o usuário reprovou.

O piloto está mais perto do pedido do usuário do que o S04: navio, lanchas e coluna se deslocam no tempo da fala, e a explosão cai na palavra "usina". Os defeitos abaixo têm correção pontual.

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| freezedetect (via `scene_gates.py`, cópia em scratchpad) | PASS | nenhum trecho parado ≥ 2 s (limiar 0,002) |
| Loudness | informativo | −14,8 LUFS integrado, pico −1,6 dBFS |
| `fx_check.py` F1–F6, F11 | PASS | 16 eventos, 1 pesado, 0 whoosh; 0 erros, 0 avisos |
| F7 (`--voice`) | PASS | 0,4% das janelas de fala < 10 dB; mediana 28,2 dB |
| F8 (`--asr`) | PASS | erro voz 0,0% · mix 0,0% · diferença +0,0 p.p. (referência: texto das palavras de `props/S05.json`) |
| F9 (revisão de `scene.tsx`) | **FAIL** | ver D4 |
| `shot_check.py` | não rodado nesta revisão | durações das tomadas conferidas à mão: 6,5 / 2,5 / 6,8 / 7,0 / 5,7 s (todas ≤ 7 s) |

Observações: a folha `S05_sheet.jpg` da produção não foi alterada (md5 igual antes e depois; o script rodou com links em scratchpad). O `--asr` do `fx_check.py` espera um arquivo de texto de referência; passar o `.wav` gera `UnicodeDecodeError`. Vale documentar isso no uso do script.

## Ação por tomada (o que se move de fato)

| Tomada | Objeto em movimento | Bate com a fala? | Crível? |
|---|---|---|---|
| 1 · 0,0–6,5 Saigon | navio entra pela direita (0,2 s) e para em 5,8 s; balanço, fumaça da chaminé | sim: entra em "não aceita" e está em quadro em "Soldados britânicos" (1,28 s); rótulo em "sul" (3,42 s) | parcial. Flutua na linha d'água sem casco vermelho aparecendo, mas não há esteira visível e a fumaça se solta da chaminé (D6). O spec pede "atraca"; o navio para no meio do rio, longe do cais |
| 2 · 6,5–9,0 Saigon | coluna de 6 soldados, da esquerda para a direita | sim: entra em "tropas" (6,60 s) e "SAIGON" aparece em "francesas" (6,86 s) | **não**. Os pés estão sobre a água do rio, abaixo do cais (D1); a coluna cruza a tela em cerca de 1,5 s e sai do quadro em cerca de 8,0 s (D2); de 8,0 a 9,0 s o quadro fica vazio |
| 3 · 9,0–15,8 Tonkin | 2 lanchas da esquerda para a praia, com aproximação (escala 1,3–1,35); navio ao fundo balançando | sim: começam em "março" (9,16 s). A lancha da frente encalha em 15,2 s; a palavra "desembarcam" é 13,70 s (1,5 s antes) | sim, com ressalvas: corte reto na linha d'água, sem esteira visível; cores vermelho e branco num barco militar (D9) |
| 4 · 15,8–22,8 usina | nada se move até 21,25 s; depois explosão, apagão, fogo e fumaça | explosão exatamente em "usina" (21,20 s) | **não** até 21,2 s (D3). Explosão: bola laranja desfocada com "destroços" de pixels quadrados; o clarão lava o quadro inteiro de cinza em 21,4 s (D4/D5). Depois do apagão as janelas da usina continuam acesas (D5) |
| 5 · 22,8–28,5 rua | coluna de 6 soldados, da esquerda para a direita; 2 fogos e fumaça | sim: entra em "outras instalações" (22,82 s) | parcial. Velocidade plausível (cerca de 0,6 altura de corpo por segundo), mas as pernas estão congeladas na mesma passada em todos os quadros e a figura só pula (fatias com `|sin|`), então desliza (D2). Fogo como retângulos luminosos na fachada e no céu (D5) |

## Rubrica visual (V1–V7)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | Os quatro fundos do Flow têm o mesmo traço (ilustração chapada, luz baixa, sépia com vermelho). Os recortes têm mais textura que os fundos, mas cabem no estilo. A lancha vermelha e branca destoa da paleta militar das outras peças (12,0–15,3 s). |
| V2 Profundidade | 3 | Cada tomada tem fundo plano + ator + partículas/rótulo, mas o fundo é uma imagem única só com zoom (sem parallax entre planos). Na tomada 4 (15,8–21,2 s) não há ator: fundo + texto + partículas. O ator da tomada 2 não está no plano do chão (anda sobre a água), o que desmonta a profundidade. |
| V3 Movimento contínuo | 3 | freezedetect PASS. Mas o critério do usuário é objeto em movimento: 15,8–21,2 s só zoom lento sobre a usina; 8,0–9,0 s cais vazio depois que a coluna sai; soldados deslizam com pernas paradas (6,5–8,0 s e 23,0–28,4 s). |
| V4 Ritmo | 4 | 5 tomadas de 2,5 a 7,0 s, cada uma com outro lugar ou tipo de visual; transição por escurecimento curto entre tomadas. |
| V5 Tipografia | 3 | Duas famílias (serifada + sem serifa), hierarquia mantida. Em 640×360 as sublinhas vermelhas dos rótulos ("chegam os soldados britânicos", "≈ 15 mil soldados franceses desembarcam") têm cerca de 5 px de altura de maiúscula: lê-se com esforço. "RETOMADA PELAS TROPAS FRANCESAS" (7,4–9,0 s) é cinza sobre a água bege, contraste baixo. Em 26,8–28,5 s "França × Viet / Minh" quebra o nome "Viet Minh" em duas linhas. A legenda queimada cobre a lancha em 14,0 s e os pés da coluna na tomada 5. |
| V6 Atmosfera | 4 | Raios de luz e poeira (tomadas 1–3), brasas, fumaça e fogo (tomadas 4–5) em 5/5 tomadas. |
| V7 Rótulos de contexto | 5 | "SAIGON · SETEMBRO DE 1945" (em "sul"), "TONKIN · MARÇO DE 1946" (em "março"), "HANÓI · 19 DE DEZEMBRO / 1946"; a tomada 5 continua em Hanói, sem troca de lugar. |

## Rubrica de som e efeitos

| Regra | Resultado | Evidência |
|---|---|---|
| F1–F6, F11 | PASS (`fx_check`) | todos os eventos com `reason`; impacto em `word:usina#1` (21,25 s); encalhe em 15,2 s junto do fim do trajeto da lancha |
| F7 / F8 | PASS | ver tabela de validadores |
| F9 | **FAIL** | `scene.tsx`: tremor `(1 - k/20) * 14` px (máx. 8); clarão de tela `[0, 0.55, 0]` (máx. 0,35); o evento `impact` de 21,25 s está `visual: false`, e a rubrica só permite tremor e clarão em eventos `visual: true` |
| Eventos duplicados | defeito | dois eventos `ambient` "estalo de fogo baixo" idênticos em 22,8 s (D8) |
| Audibilidade dos ambientes (L02) | duvidoso | Fora da explosão, tudo o que não é voz (trilha + água + passos + fogo) fica entre −34 e −44 dBFS em janelas de 0,5 s, 20 a 28 dB abaixo da voz. Não ouvi o arquivo; pela medida, água, passos e fogo provavelmente não se distinguem. Na explosão (21,0–22,0 s) o resto chega a −18 dBFS, 3 a 5 dB abaixo da voz em "usina elétrica"; F7/F8 passam porque a energia está nos graves |
| Passos sobre a água | descasado | o ambiente "passos" (6,5 s) acompanha soldados que pisam no rio; depois de 8,0 s não há soldados na tela |
| F10 Silêncio | aceitável | pausas em 15,5 s e 24,5 s com trilha baixa |

Revisão humana (a nota que decide) ainda não feita: o usuário precisa ouvir.

## Fidelidade histórica e texto

Fontes conferidas: Country Study 22 e 23.

| Item | Situação | Detalhe |
|---|---|---|
| Britânicos chegam ao sul em set/1945 | OK com ressalva | A página 22 diz que a força expedicionária britânica "arrived in early September". Não diz que chegou de navio. Os primeiros britânicos em Saigon chegaram de avião (conhecimento geral; não está em `sources.md`). Navio de transporte é aceitável como imagem genérica de chegada, sem afirmar o meio. O navio desenhado (vapor dos anos 1930/40, chaminé única, canhões no convés, botes) é plausível para a época. |
| França retoma Saigon | OK | A página 22: tropas francesas, rearmadas pelos britânicos, "seized control of the city". Não dá data; a fala não afirma data além da sequência. |
| ≈15 mil franceses "desembarcam" no Tonkin em mar/1946 | **AJUSTAR (leve)** | A fonte diz "some 15,000 French troops arrived in Tonkin", logo depois do acordo de "early March". Não diz "desembarcar" nem onde. A imagem mostra desembarque anfíbio em praia, com lanchas encalhando, o que sugere um assalto. Os franceses chegaram pelo porto de Haiphong (conhecimento geral, não está em `sources.md`). Opções: trocar o rótulo para "chegam" e mostrar navio no porto, ou registrar uma fonte para Haiphong e para o desembarque. |
| Lanchas estilo LCVP em 1946 | OK no formato, errado na cor | Rampa na proa, posto do timoneiro atrás; a França recebeu embarcações americanas e britânicas. O casco vermelho e branco não é militar (LCVP era cinza). |
| Uniformes franceses de 1946 | **DEFEITO (médio)** | `soldiers_fr.png`: capacete Adrian azul ou cáqui, túnica de gola alta, perneiras, fuzil tipo Lebel/Berthier: visual da Primeira Guerra. O corpo expedicionário de 1945–46 usava sobretudo equipamento britânico e americano (capacete M1 ou chapéu de mato, uniforme cáqui de tropa colonial), conhecimento geral sem fonte no arquivo. Também é inconsistente dentro da cena: os soldados das lanchas usam capacete M1. |
| Usina elétrica de Hanói | OK | A página 23: em 19/12 o Viet Minh atacou "the city's electric plant and other French installations". A cidade é Hanói pelo contexto da frase anterior. Fábrica de tijolos com duas chaminés é plausível. |
| "Começo da guerra" | OK | A página 23: "as full-scale war broke out". |
| Texto na tela × fala | OK | Todos os rótulos repetem dado (lugar, data, número, nome). |
| Licença (R13) | **pendente** | `sources.md` FLOW-S05: "Pendente R13 (termos comerciais do Flow)". Não bloqueia o piloto; bloqueia a publicação. |
| Política (conteúdo sintético) | OK | Ilustração estilizada, sem pessoa real identificável; não precisa de marcação pela política. A regra interna "na dúvida, marcar" segue valendo para o vídeo inteiro. |

## Recorte

- Halo verde: nenhum. Zero pixels de borda (alfa 10–245) com verde dominante nos três PNG; fundo magenta sem franja visível.
- Casco abaixo da linha d'água: escondido (`sink` 0,22 no navio, 0,18 nas lanchas); hélice e leme não aparecem. A linha de corte é reta e dura, e a esteira (`wake`, gradiente branco a 0,55 × 0,9) quase não aparece sobre a água bege (5,0 s; 14,0 s). Resultado: o barco parece colado, sem contato com a água.
- Fatias dos soldados: as costuras entre fatias não aparecem nos quadros examinados.

## Defeitos priorizados

| # | Prioridade | Tempo (s) | Defeito | Correção sugerida |
|---|---|---|---|---|
| D1 | alta | 6,5–8,0 | Soldados marcham sobre a água do rio, abaixo do cais (pés em y≈63,5% com zoom 1,5) | Subir a coluna para o calçamento do cais (y entre cerca de 52% e 55% no espaço da imagem, conferir na tomada) ou trocar o fundo por um cais com chão em primeiro plano |
| D2 | alta | 6,5–8,0 · 23,0–28,4 | Soldados deslizam: pernas congeladas na mesma passada, só pulos verticais por fatia. Na tomada 2 cruzam a tela em cerca de 1,5 s (cerca de 7,7 alturas de corpo por segundo, contra cerca de 0,8 numa caminhada); saem em 8,0 s e deixam 1 s de quadro vazio | Ciclo de caminhada real: 2 a 4 poses do Flow alternadas a cerca de 4 a 6 quadros por pose, ou recortar as pernas e girar no quadril. Velocidade até cerca de 1 altura de corpo por segundo. Ajustar `to` para que a coluna fique em quadro até 9,0 s |
| D3 | alta | 15,8–21,2 | 5,4 s da usina sem nenhum objeto se movendo (só zoom), o padrão que o usuário reprovou | Fumaça das chaminés desde o início, luzes piscando nas janelas, silhuetas correndo ou um caminhão; ou dividir em duas tomadas (a data entra sobre a cidade, depois a usina) |
| D4 | alta (F9) | 21,25–21,9 | Tremor de 14 px e clarão 0,55 sobre o quadro todo (fica cinza em 21,4 s); evento `visual: false` | Tremor ≤ 8 px, clarão ≤ 0,35 e o evento `impact` com `visual: true`; ou tirar o tremor |
| D5 | média | 21,25–28,5 | Explosão pouco crível (bola laranja borrada, destroços como pixels quadrados de 7 px); fogo desenhado como retângulos luminosos borrados (22,6 s na fachada da usina; 24,0–24,5 s na fachada da esquerda e no céu da direita); janelas da usina seguem acesas depois do "apagão" | Explosão e fogo como sprites ou vídeo com alfa (Flow ou asset com licença comercial) ou chamas com forma irregular e base no telhado; apagão que apague as janelas (máscara das janelas ou uma segunda versão do fundo com as luzes apagadas) |
| D6 | média | 1,0–6,5 | Fumaça da chaminé do navio se descola: a nuvem sobe a cerca de 300 px acima e à direita da chaminé e passa sobre os prédios | A pluma deve nascer no topo da chaminé (conferir `smoke: [56,12]` contra a posição real da chaminé no PNG, que fica perto de x≈52%, y≈22%) e subir de forma contínua |
| D7 | média | 26,8–28,5 · 0,0–15,4 | "Viet / Minh" quebrado em duas linhas; sublinhas dos rótulos com cerca de 5 px em 360p; "RETOMADA PELAS TROPAS FRANCESAS" com contraste baixo | Usar `white-space: nowrap` em "Viet Minh" ou reduzir o tamanho; sublinhas com pelo menos cerca de 9 px de altura de maiúscula em 360p (cerca de 27 px em 1080p) e fundo ou sombra no rótulo da tomada 2 |
| D8 | média | 22,8 | Dois eventos `ambient` de fogo idênticos sobrepostos | Remover um |
| D9 | média | 6,5–9,0 · 22,8–28,5 | Uniforme de Primeira Guerra (capacete Adrian, perneiras) para 1945–46, diferente dos capacetes M1 das lanchas | Gerar coluna com capacete M1 ou chapéu de mato e uniforme cáqui leve; registrar a fonte iconográfica em `sources.md` |
| D10 | baixa | 9,0–15,8 | Desembarque em praia sugere assalto; a fonte só diz "arrived"; rótulo diz "desembarcam" | Rótulo "chegam" ou fonte para Haiphong; navio atracando em porto em vez de praia |
| D11 | baixa | 9,3–15,2 | Lancha encalha em 15,2 s, 1,5 s depois de "desembarcam" (13,70 s); casco vermelho e branco | Encalhar perto de 13,7 s; casco cinza |
| D12 | baixa | 0,2–5,8 · 9,0–15,8 | Navios e lanchas sem contato visível com a água (corte reto, esteira invisível); navio não atraca como o spec pede | Esteira mais escura ou com contraste, pequena onda de proa, reflexo; trajeto até o cais ou trocar o texto do spec |
| D13 | baixa | todas | Ambientes de movimento provavelmente inaudíveis (20 a 28 dB abaixo da voz) | Conferir de ouvido; se sumirem, subir 4 a 6 dB mantendo F7 |

## O que está bom e deve ser mantido

- Sincronização de ação com fala: entrada do navio, da coluna e das lanchas e a explosão caem nas palavras certas.
- Recorte limpo, sem halo verde, e casco abaixo da linha d'água escondido.
- Os três rótulos de lugar e data aparecem na troca de lugar; o texto repete só dado.
- Voz limpa: F7 com mediana de 28 dB, F8 sem diferença.

## Para o próximo ciclo (ciclo 2 de 2, R6)

Corrigir D1–D4 (bloqueiam) e D5–D9; rodar de novo `scene_gates.py` e `fx_check.py --asr` e conferir F9 no código; enviar ao revisor com quadros nos mesmos tempos.

---

# Ciclo 2 (último, R6)

- Revisor: agente `reviewer`, ciclo 2 · data: 2026-11-20
- Objeto: `media/pt-br-historia/vietna/render/S05.mp4` (render de 2026-11-20 01:50, 28,50 s), `scenes_spec.json` (S05), `studio/remotion/src/vietna/scene.tsx`, `S05_mix.events.json`, `props/S05.json`, `sources.md` (HO45, FR46, FLOW-S05).
- Método: quadros nos mesmos tempos do ciclo 1 e mais 8,9 / 13,8 / 16,5 / 19,0 / 20,3 / 20,8 / 21,3 / 26,0 / 28,3 s; quadros consecutivos a 30 fps (marcha 7,0–7,4 s e 25,0–25,4 s; destroços 21,33–21,53 s), a 10 fps (tiros 20,0–20,6 s), a 5 fps (fumaça do navio 4,0–5,6 s), a 2,5 fps (encalhe 13,2–15,6 s) e a 1 fps (chaminés 16–19 s); recortes ampliados da linha d'água (2,0 s e 12,0 s); quadros a 640×360; altura das letras medida em pixels; energia por 0,5 s de mix menos voz.
- `scene_gates.py` rodou sobre links em scratchpad; `S05_sheet.jpg` da produção ficou igual (md5 `bb091b3b…` antes e depois).
- Learnings aplicáveis: L01 e L02 (como no ciclo 1).

## Veredito do ciclo 2: APROVADO para ir ao usuário (V8), com ressalvas

Todas as notas V1–V7 ficaram em 4 ou mais e todos os validadores passaram. Os bloqueios do ciclo 1 foram resolvidos (D1, D4, D8, D9, D11) ou melhoraram o bastante para não bloquear (D3). O que sobra é acabamento (D2, D5, D6, D12, D13) e cabe à avaliação do usuário (V8) e à audição dele. Uma afirmação do produtor não se confirma: a fumaça nas chaminés da usina não aparece nos quadros (ver D3).

## Validadores

| Item | Resultado | Detalhe |
|---|---|---|
| freezedetect (`scene_gates.py`) | PASS | nenhum trecho parado ≥ 2 s |
| Loudness | informativo | −14,7 LUFS integrado, pico −1,6 dBFS |
| `fx_check.py` F1–F6, F11 | PASS | 16 eventos, 1 pesado, 0 whoosh, densidade 34/min; 0 erros, 0 avisos |
| F7 (`--voice`) | PASS | 1,2% das janelas de fala < 10 dB; mediana 26,3 dB (era 28,2) |
| F8 (`--asr`, referência = texto de `props/S05.json`) | PASS | voz 0,0% · mix 0,0% · diferença +0,0 p.p. |
| F9 (revisão de `scene.tsx`) | PASS | tremor `(1 - k/20) * 7.5` px (máx. 8), aplicado como `translate` fora do `scale`; clarão `[0, 0.33, 0]` (máx. 0,35); evento `impact` 21,25 s com `visual: true` |
| `shot_check.py` (só S05, cópia do spec) | PASS | 5 tomadas: 6,5 / 2,5 / 6,8 / 7,0 / 5,7 s |

## Ação por tomada (ciclo 2)

| Tomada | O que se move | Bate com a fala? | Crível? |
|---|---|---|---|
| 1 · 0,0–6,5 | navio entra pela direita e para em 5,8 s; balanço; fumaça | sim (entra em "não aceita", rótulo em "sul") | parcial: a fumaça nasce perto da chaminé, mas a nuvem escura só fica visível uns 40–60 px acima dela (opacidade `sin(πt)` começa em zero), então parece solta em vários quadros (4,0–5,6 s). Linha d'água ainda reta, com sombra fraca |
| 2 · 6,5–9,0 | coluna de 6 soldados sobre o cais | sim (entra em "tropas", "SAIGON" em "francesas") | sim no lugar: pés no calçamento do cais (7,2 s; 8,9 s), em quadro até o fim da tomada. Pernas fixas na mesma passada em todos os 12 quadros consecutivos (7,0–7,4 s), só sobem e descem por fatia. Velocidade na tela: cerca de 355 px em 1,7 s, 1,4 altura de corpo por segundo (marcha rápida, contra 0,8 de uma caminhada) |
| 3 · 9,0–15,8 | 2 lanchas cinzentas até a praia; navio ao fundo | sim: a lancha da frente chega à areia entre 13,6 e 13,8 s, com "desembarcam" em 13,70 s | sim, com ressalvas: depois de encalhar a lancha continua balançando sobre a areia e ninguém desce (rampa fechada) enquanto a fala diz "desembarcam"; a legenda queimada cobre a base do casco de 13,2 a 15,3 s |
| 4 · 15,8–22,8 | holofotes varrendo o céu desde 15,8 s; rajadas de 20,0 a 21,2 s; explosão em 21,25 s; apagão; fogo | sim: tiros em "Viet Minh ataca", explosão em "usina" | parcial: holofotes se movem o tempo todo (16,5 / 19,0 / 20,3 / 20,8 s com ângulos diferentes), o que acaba com o quadro parado. A fumaça das chaminés **não aparece**: nos quadros de 16 a 19 s as duas chaminés não soltam nada (fumaça `rgba(24,22,24,0.7)` sobre céu noturno escuro, e as posições x=37% e x=47% não coincidem com as chaminés, que ficam perto de 40% e 60% da tela). Tiros: riscos finos de baixo para cima atravessando a fachada, com clarões pequenos na rua; leem como tiro. Explosão: bola laranja desfocada com lascas escuras; mais clara que no ciclo 1, ainda sem forma de chama nem coluna de fumaça. Apagão: as janelas escurecem, mas seguem amarelas e legíveis em 22,0 e 22,6 s. Fogo no telhado em 22,6 s: faixa horizontal brilhante e borrada |
| 5 · 22,8–28,5 | coluna de 6 soldados, fogo, fumaça | sim (entra em "outras instalações") | parcial: pernas fixas (12 quadros, 25,0–25,4 s). Velocidade: cerca de 86 px/s, 0,26 altura de corpo por segundo, com o pulo das fatias a cerca de 2 por segundo; parece marchar quase no lugar. A legenda cobre as pernas (24,0 s; 27,5 s) |

## Rubrica visual (ciclo 2)

| # | Nota | Evidência |
|---|---|---|
| V1 Consistência | 4 | Mesmo traço nos quatro fundos; lancha agora cinza (12,0 / 14,0 s) e soldados com capacete M1, iguais aos das lanchas. Os rostos e braços dos soldados ficam avermelhados na tomada 5, coerente com a luz do fogo. |
| V2 Profundidade | 4 | Cada tomada tem fundo + atores ou efeitos (holofotes, tiros, fogo) + partículas e luz em camada separada + rótulo. Os soldados agora estão no plano do chão. Continua sem parallax real: atores e fundo estão no mesmo bloco com zoom; só partículas e raios de luz ficam fora dele. |
| V3 Movimento contínuo | 4 | freezedetect PASS; em todas as tomadas há algo se deslocando (navio, coluna até 9,0 s, lanchas, holofotes desde 15,8 s, coluna). Não é 5 porque as pernas não se articulam (cerca de 8 s de 28,5 s com soldados deslizando). |
| V4 Ritmo | 4 | Sem mudança: 5 tomadas de 2,5 a 7,0 s. |
| V5 Tipografia | 4 | "França × Viet Minh" numa linha (27,5 s). Subtítulos das etiquetas: letra alta de cerca de 21 px em 1080p, cerca de 7 px em 360p (eram 5 px; o alvo do ciclo 1 era cerca de 9 px); lê-se em 640×360 com algum esforço. "RETOMADA PELAS TROPAS FRANCESAS" agora sobre água escurecida: texto a cerca de 235 de brilho contra fundo de 68 (8,5 s). Ressalva: a legenda queimada cobre a base da lancha e as pernas dos soldados. |
| V6 Atmosfera | 5 | Luz, poeira, brasas, holofotes, fumaça e fogo nas 5 tomadas. |
| V7 Rótulos de contexto | 5 | Sem mudança; o rótulo do Tonkin agora diz "≈ 15 mil soldados franceses chegam ao Tonkin". |

## Som e efeitos (ciclo 2)

| Regra | Resultado | Evidência |
|---|---|---|
| F1–F8, F11 | PASS | tabela de validadores |
| F9 | PASS | ver acima |
| Duplicidade (D8) | resolvido | um evento de fogo em 21,6 s (usina) e outro em 22,8 s (rua), cada um com sua tomada |
| Tiros (novo) | OK | evento `ambient` 20,0 s "rajadas de tiro antes do ataque", junto das rajadas visuais (20,0–21,2 s) |
| Encalhe | OK | `hit` em 13,8 s, quando a lancha toca a areia |
| Audibilidade dos ambientes (D13) | parcial | Fora da explosão, o que não é voz fica entre −32 e −42 dBFS em janelas de 0,5 s (ciclo 1: −34 a −44), de 18 a 27 dB abaixo da voz. Subiu cerca de 2 dB na medida, não os 4 a 6 dB sugeridos. Na tomada 2 (passos) fica entre −38 e −42 dBFS. Sem audição não dá para afirmar que se ouve; o usuário precisa ouvir |
| Explosão × voz | OK | 21,0–22,0 s: resto −19/−20 dBFS contra voz −13/−17; F7 passa |

## Fidelidade e texto (ciclo 2)

| Item | Situação | Detalhe |
|---|---|---|
| Uniformes de 1946 (D9) | OK | `soldiers_46.png`: capacete M1, camisa e calça cáqui ou brancas, mochila. Some o anacronismo do capacete Adrian; fica coerente com as lanchas. Falta registrar em `sources.md` a referência visual do uniforme (pedido do ciclo 1); hoje só há a origem do arquivo do Flow |
| Rótulo "chegam ao Tonkin" (D10) | OK | Repete o "arrived in Tonkin" do Country Study (HO45) |
| Narração "desembarcam" | **AJUSTAR (leve), pendência de roteiro** | A fonte HO45 diz "arrived"; "desembarcar" afirma chegada por mar, que a fonte não diz. A imagem (lanchas na praia) reforça essa leitura. Opções: (a) registrar em `sources.md` uma fonte para a chegada por mar em Haiphong em março de 1946 e manter a narração; (b) trocar por "chegam" no roteiro e regravar a frase. Recomendo (a), que evita regravar. Não bloqueia o piloto visual; bloqueia a publicação (R1) |
| Licença Flow (R13) | pendente | Igual ao ciclo 1: bloqueia publicação, não o piloto |

## Situação dos defeitos do ciclo 1

| # | Situação | Evidência |
|---|---|---|
| D1 soldados na água | **resolvido** | pés no cais em 7,2 e 8,9 s (`from/to` y=55,5) |
| D2 deslizar / velocidade | **parcial** | Velocidade caiu de cerca de 7,7 para 1,4 altura/s (tomada 2) e está em 0,26 altura/s (tomada 5); coluna fica em quadro até 9,0 s. Pernas continuam fixas na mesma passada (quadros consecutivos 7,0–7,4 s e 25,0–25,4 s). As duas tomadas têm velocidades muito diferentes (1,7 vez e 0,3 vez uma caminhada) |
| D3 usina parada | **parcial (aceito)** | Holofotes se movem desde 15,8 s e tiros de 20,0 a 21,2 s: o quadro não fica mais parado. A fumaça das chaminés anunciada não aparece (16–19 s); `x` da fumaça não coincide com as chaminés e a cor some no céu escuro |
| D4 tremor/clarão (F9) | **resolvido** | 7,5 px; 0,33; `impact` com `visual: true` |
| D5 explosão, fogo, apagão | **parcial** | Destroços agora são lascas (21,33–21,53 s), não pixels quadrados. A explosão segue uma bola laranja borrada; o fogo do telhado (22,6 s) é uma faixa brilhante; as janelas continuam acesas, só mais escuras, depois do apagão (22,0 / 22,6 s). Fogo da tomada 5 melhorou (brilho redondo nas janelas da esquerda) |
| D6 fumaça do navio | **parcial** | Nasce perto da chaminé, mas a parte visível começa uns 40–60 px acima; em 4,0–5,6 s a nuvem parece solta em metade dos quadros |
| D7 tipografia | **resolvido em parte** | "Viet Minh" sem quebra; contraste de "RETOMADA…" bom; subtítulos com cerca de 7 px em 360p (alvo era cerca de 9) |
| D8 fogo duplicado | **resolvido** | eventos em tempos e tomadas diferentes |
| D9 uniforme | **resolvido** | capacete M1, uniforme tropical; falta a fonte iconográfica em `sources.md` |
| D10 desembarque/rótulo | **resolvido no rótulo**; narração pendente | ver Fidelidade |
| D11 tempo e cor da lancha | **resolvido** | chega à areia em 13,6–13,8 s ("desembarcam" 13,70 s); casco cinza |
| D12 linha d'água | **parcial** | sombra escura fraca sob o casco (2,0 s; 12,0 s); espuma quase invisível sobre a água bege; corte ainda reto. O navio continua parando no meio do rio, longe do cais |
| D13 ambientes | **parcial** | +2 dB medidos; ainda 18–27 dB abaixo da voz; depende de audição |

## Observações novas (baixas)

- N1 · 13,8–15,8 s: a lancha encalhada continua balançando sobre a areia e a rampa não abre; ninguém "desembarca". Parar o balanço ao encalhar (`land: true` já existe no spec) e, se houver recorte, baixar a rampa.
- N2 · 13,2–15,3 s e 24,0–28,4 s: a legenda queimada cobre a base da lancha e as pernas da coluna. Subir os atores uns 5% ou posicionar a legenda acima nessas tomadas.
- N3 · tomada 5: a cadência do pulo (cerca de 2 por segundo) não combina com o avanço de 0,26 altura/s; aumentar `to` para cerca de 0,5–0,7 altura/s ou reduzir a frequência do pulo.

## Correções restantes (não bloqueiam o envio ao usuário; recomendadas antes do vídeo final)

1. Fumaça das chaminés da usina (D3): posicionar sobre as chaminés reais e usar cor mais clara que o céu noturno (cinza iluminado por baixo), ou tirar a menção do relatório de produção.
2. Pernas articuladas ou poses alternadas para as colunas (D2) e velocidades coerentes entre as tomadas 2 e 5 (N3).
3. Apagão que apague as janelas de fato e fogo com forma de chama (D5); considerar sprite de explosão e fogo com licença comercial.
4. Fumaça do navio visível desde a boca da chaminé (D6); espuma com contraste na linha d'água (D12).
5. Conferir de ouvido água, passos e fogo (D13); se não se ouvirem, subir mais 3–4 dB mantendo F7.
6. Roteiro/fontes: fonte para a chegada por mar em Haiphong ou troca de "desembarcam" por "chegam"; fonte iconográfica do uniforme de 1946 em `sources.md`.
7. N1 e N2.

V8 (lado a lado com a referência) e a audição são do usuário.

## Atualização das pendências (produtor, lote 1, 2026-11-20)
- **Narração "desembarcam" (R1): resolvida.** Fonte HAI46 em `sources.md` (indochine.uqam.ca: Leclerc mandou navios para desembarcar cerca de 10 mil soldados em Haiphong; em 6/3 tropas chinesas atiraram em navios franceses que entravam no porto). A tomada 3 foi refeita como **porto de Haiphong**: o navio de transporte encosta no cais em "desembarcam" e a tropa desce ao cais. Rótulo "HAIPHONG · MARÇO DE 1946 / ≈ 15 mil soldados franceses chegam ao Tonkin" (15 mil segue com HO45).
- **Referência iconográfica do uniforme de 1946 (D9): registrada** como ICO-FR46 em `sources.md` (CEFEO equipado com material francês, britânico e americano, "along American lines").
- Acabamento D3, D5, D6, D12, D13, N1, N2, N3 feito no lote 1 (ver `lab/plan-vietna-lote1.md`); aguarda o revisor.
