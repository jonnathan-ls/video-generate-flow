# Protocolo: produção de cena com ação (padrão R18)

**Etapa:** `script_approved` → `produced` · **Aprovado pelo usuário em 2026-11-20** (piloto S05, "Aprovado, produza o vídeo completo... aplicando esse padrão")
**Validadores:** `shot_check.py`, `scene_gates.py` (freezedetect, loudness, `fx_check.py`) · **Rubrica:** `rubrics/visual.md` V1–V10 (todas ≥ 4, média ≥ 4,3) · **Som:** `rubrics/sound-fx.md` (R16)

## Por que existe
O usuário reprovou três padrões em sequência: mapa estático (S01 v1), "só texto e mapa" (lote S02–S10 v1) e "imagens estáticas com efeitos" (ilustração em código e S04 com fundo do Flow parado). Ele aprovou o S05, com fundo do Flow e objetos recortados que **se movem no tempo da palavra**. Este protocolo transforma o S05 em receita, com as lições dos dois ciclos de revisão dele (D1–D13 em `qa-piloto-s05.md`).

## Fluxo em 3 fases: mídias primeiro, render depois (revisto em 2026-11-21, decisão do usuário)
**Motivo:** o Flow roda no servidor do Google e não pesa a máquina. O render pesa e travava o uso do PC quando ia junto com cada lote. Mídia errada é barata de corrigir **antes** do render (uma imagem nova no Flow), cara depois (render de novo).

- **Fase A, mídias (todas as cenas restantes, sem render):** passos 1 a 5 para todas as cenas. O Flow vai em chamadas de até 50 imagens, na fila única. O gate de época roda em toda imagem. Ao fim de cada grupo de 4 a 6 cenas: folha de contato só de imagens paradas (`qa-midias-<lote>.jpg`), com revisão do Gemini e conferência reduzida pelo maestro (época, estilo igual à âncora S05, recorte limpo, chão livre no fundo).
  **DoD da fase A:** 0 imagem reprovada no `periodo.sh`; todo fundo, recorte e efeito do plano de tomadas tem arquivo e linha `FLOW-<lote>` em `sources.md`.
- **Fase B, montagem (sem render completo):** passo 6. Specs escritas em paralelo (`orchestra/paralelo.sh`, uma tarefa por cena, sem Flow) e conferidas por quadros parados nas palavras de ação (`bash orchestra/tools/quadros.sh Sxx auto`, cerca de 15 s por cena): escala, ordem das camadas, chão, rótulo legível, objeto na palavra. Erro de composição se corrige no spec. Só volta à fase A a imagem que precisa ser trocada.
  **Pilotos de movimento:** antes de montar em série, todo tipo de ação ainda sem modelo em `scene-templates.md` (navio, coluna, tanque, avião, multidão, documento...) ganha **uma cena-piloto renderizada** que passa pelos passos 7 a 9. Só depois esse tipo é replicado. Isso pega cedo o defeito que só aparece em movimento (velocidade, passada, sincronia com a palavra).
- **Fase C, render em bloco:** passos 7 a 9 em sequência, no máximo 2 renders de GPU ao mesmo tempo, de preferência na janela em que o usuário não usa o PC. Revisão com nota por lote de 4 a 6 cenas, como antes (ciclo 1 e ciclo 2, depois escalar).

Cenas já aprovadas não são refeitas. Tipos de cena que se repetem viram **modelos** em `protocols/scene-templates.md` à medida que forem aprovados: copie o modelo e ajuste, em vez de escrever do zero.

## Passos
1. **Ler** (R4): este protocolo, `shot-planning.md`, `learnings.md`, `mistakes.md`, os `qa-*.md` do vídeo (os defeitos já apontados não podem voltar) e as frases das cenas em `script.md` + `render/props/<cena>.json` (palavras com tempo).
2. **Plano de tomadas** (em `lab/plan-<video>-<lote>.md`): para cada tomada, registre:
   - tempo, com 3 a 6 s por tomada;
   - **o que se move e em qual palavra**;
   - fundo;
   - recortes;
   - efeitos;
   - som de movimento;
   - itens de época com referência: uniforme, veículo, avião, navio, bandeira, prédio, com o ano. Na dúvida, a referência iconográfica vai para `sources.md`.

   Para cada tipo de frase, a ação correspondente:

   | Frase | Ação na tela |
   |---|---|
   | sobre deslocamento | o objeto se desloca (navio, coluna, avião, helicóptero, carro, tanque) |
   | sobre ataque | tiros e explosão na palavra |
   | sobre decisão ou documento | o papel desliza na mesa, o carimbo cai, a caneta assina, a máquina de escrever corre, a bandeira tremula, o flash das câmeras dispara |
   | sobre multidão | a multidão em fatias levanta braços e cartazes, ou a coluna de manifestantes avança |
   | sobre número | gráfico ou contador **sobre uma cena**: fundo com ação + dado como camada |

   Mapa, documento, gráfico e texto **sem cena** somam no máximo 20% do vídeo.
3. **Prompts do Flow** (em `lab/flow-prompts-<lote>.md`):
   - **Fundo:** o prefixo de estilo fixo de `lab/flow-prompts-s04.md` + cena + época + "no text, no letters, no logos, no watermark" + negativos da época (ex.: Hanói 1945 → "no monuments, no mausoleum, no modern buildings"). O fundo deixa **espaço livre e chão** onde os atores vão passar (rua vazia, cais vazio, céu livre), porque os atores entram por recorte.
   - **Objeto para recorte:** o mesmo prefixo + "isolated on a solid pure green background (#00FF00), full object visible, side view, flat even lighting, no ground shadow, no other objects". Pessoas em coluna: "a column of N soldiers walking left to right, side view, full body including feet, evenly spaced, not overlapping".
   - **Fogo, explosão, fumaça:** "isolated on pure black background", recortado por `blend: 'screen'`, sem chroma.
   - **Variação de estado:** o mesmo fundo com luzes apagadas, prédio destruído ou noite, feito por edição da imagem no Flow, entra em `bg2` com `bg2_at_s` na palavra.
4. **Gerar** (revisto em 2026-11-20): **uma chamada `flow_agent_images` por lote** (até 50 imagens, 0 crédito, projeto do Flow da produção, ex. `lacre-vietna`; visualização Grid S). Para manter o estilo igual nas 54 cenas, passe em `references` o **quadro-guia de estilo** (um fundo do S05 aprovado, nome `estilo`) e os personagens/veículos recorrentes, e em `scene_references` quais cenas usam cada um. O prefixo de estilo do vídeo vai em todo prompt. Se o custo for maior que 0, pare e pergunte. Vídeo do Flow (24 créditos por clipe) só com OK do usuário.
   - **Gate de época (obrigatório, antes de recortar):** `bash orchestra/periodo.sh <pasta> "<lugar, data, lados, equipamentos>"`. Imagem reprovada volta ao Flow com o `correcao_prompt` sugerido; nunca segue para animação. (Motivo: no lab Saigon passaram palácio gótico e fuzil de ferrolho em 1975.)
   - Rejeite também: texto na imagem, membro deformado, sombra no chão do recorte.

   Copie o original para `media/<canal>/<video>/src_img/flow/<lote>/` e registre `FLOW-<lote>` em `sources.md`, com prompt, arquivo e uso.
5. **Recortar:** `python3 pipeline/assembly/chroma_cut.py in.jpg studio/remotion/public/<video>/x.png`. Confira sobre magenta: sem halo verde, pés inteiros.
6. **Spec** (`scenes_spec.json`, kind `shots`; cada tomada com `scene`). Use os campos da tabela abaixo, com cues por palavra (`*_word`, `palavra#N` quando repete).
7. **Preparar, renderizar e mixar:**
   - `vietna_prep.py ... --only Sxx`;
   - `pipeline/assembly/vietna_render_batch.sh Sxx ...`;
   - eventos de som com `reason` (R16), passos, motor, água e tiros acompanhando o movimento (L02).
8. **Autochecagem** (o produtor, antes do revisor):
   - `shot_check.py` PASS, `scene_gates.py` PASS e folha de contato;
   - `python3 pipeline/validate/render_check.py render/Sxx.mp4 --dur <duração>` PASS (volume -14 ±2 LUFS, pico ≤ -1 dBTP, sem tela preta, sem quadro congelado > 2 s, sem silêncio no meio);
   - `python3 pipeline/validate/transcript_check.py render/Sxx.mp4 --scene Sxx` PASS (a narração bate com o roteiro, palavra por palavra: pega erro de pronúncia do TTS);
   - quadro **na palavra** de cada ação: o objeto está lá?
   - 3 quadros consecutivos de cada ator andando: a passada e a velocidade estão certas?
   - base de cada objeto acima da legenda, e ator com chão;
   - quadro reduzido a 640×360: o rótulo é legível?

   Qualquer falha volta ao passo 6.
9. **Revisão independente** (`bash orchestra/review.sh Sxx <ciclo>`, comparando com a âncora S05 aprovada; Gemini e, se der cota, modelo grátis com visão): ciclo 1 e, se preciso, ciclo 2, conforme `rubrics/visual.md`. Relatório em `qa-lote-XX.md`. Aprovado → segue. Reprovado no ciclo 2 → escalar.
10. **Vídeo inteiro:** antes de pedir aprovação, o vídeo montado passa em `rubrics/render-qa.md` (gancho, encadeamento, ritmo, voz, som, entrega). Leia `knowledge/longform-production-lessons.md` e `knowledge/collage-direction.md` antes do primeiro lote de um vídeo novo.
11. **Entrega ao usuário** na fase C, a cada 2 ou 3 lotes aprovados, ou quando ele pedir. Na fase A, mostre a folha de contato das mídias se ele pedir: prévia 720p com legenda e o resumo das notas.

## Regras físicas (lições do S05)
| Regra | Origem |
|---|---|
| Pés no chão: a base do ator fica no plano do chão do fundo. Confira no quadro. | D1, soldados na água |
| Velocidade real: caminhada de 0,5 a 1 altura de corpo por segundo; tomadas vizinhas com velocidades coerentes; coluna que entra fica em quadro até o fim da tomada, sem quadro vazio. | D2, N3 |
| Pessoas andando: `slices` + `gait` (passada das pernas). Sem `gait`, a figura desliza. | D2 |
| Ação na palavra: chegada/impacto a ±0,4 s da palavra. A lancha "desembarca" na palavra, não 1,5 s depois. | D11 |
| Nenhuma tomada com mais de 2 s sem objeto em movimento (`shot_check`). Zoom não conta. Fumaça sozinha não conta. | D3 |
| Tremor ≤ 8 px e clarão ≤ 0,35, só em evento `visual: true`. | D4, F9 |
| Fumaça nasce **na boca** da chaminé (confira x, y no PNG) e é mais clara que o céu à noite. | D6, D3 do ciclo 2 |
| Apagão apaga de fato: use `bg2` com as luzes apagadas, não só escurecimento. | D5 |
| Fogo e explosão a partir de imagem real (Flow sobre preto + `blend: 'screen'` + `grow`), em vez de bolas desenhadas. | D5 |
| Barco tem contato com a água (`sink` + `wake`); ao encalhar, `land: true` para o balanço. | D12, N1 |
| Nada sob a legenda: base dos atores ≤ 86% da altura na tela (`shot_check`). | N2 |
| Cores de época: equipamento militar em cinza ou oliva, nada de casco vermelho e branco. Uniforme do ano certo: 1946 francês = capacete M1 / chapéu de mato, cáqui. | D9, D11 |
| Rótulo com sublinha ≥ 27 px de letra em 1080p; nome próprio sem quebra de linha. | D7 |
| Um evento de som por ação. Sem duplicata. | D8 |
| Vinheta (borda escura) no máximo 0,2 e suave. Sem moldura escura visível. | usuário, 2026-11-20 |
| Colagens animadas (recortes que entram, se movem e interagem) são o ponto forte. Cada efeito visual tem som casado no mesmo quadro, e cada som tem algo visível. | usuário, 2026-11-20 |
| Ambientes de movimento audíveis: 18 a 24 dB abaixo da voz, não 30. | D13 |

## Campos do motor (`studio/remotion/src/vietna/scene.tsx`)
**Cena:**
- `bg`;
- `bg2` + `bg2_at_s` (troca de estado na palavra);
- `z0`/`z1` (zoom), `ox`/`oy` (origem);
- `pan: [dx,dy]` px (parallax com `depth` dos atores);
- `night`, `rays`;
- `actors[]`, `fx[]`.

**Ator:**
- **Posição e trajeto:** `src`, `from`/`to` (% da tela, base do objeto), `path` (pontos), `h` (% da altura), `t0_s`/`t1_s`, `ease`.
- **Balanço:** `bob`/`rock`/`period`.
- **Coluna andando:** `slices` + `ar` + `gait`/`legs`.
- **Bandeira:** `wave`.
- **Água:** `wake`/`sink`/`land`.
- **Rastros:** `smoke` (chaminé) e `emit` (rastro: fumaça, borrifo, poeira com `dir`, `color`, `from_s`/`to_s`).
- **Hélice:** `rotor`.
- **Aparência e tempo:** `flip`, `tint`, `appear_s`, `fade_s`, `hide_s`, `grow`, `scale1`, `rot`, `blend`, `opacity`.
- **Parallax:** `depth`.

**Efeitos** (`fx`):
- `explosion` (`at`);
- `fire` (`from`);
- `smoke`;
- `searchlight`;
- `tracers` (`from`→`to`);
- `blackout` (`at`).

**Adicionados no lote 1 (2026-11-20):**
- Ator: `path_s` (tempo de cada ponto do `path`: pausa, ida e volta), `rope` (cabo de guindaste até o alto da tela), `label` (etiqueta de papel sobre a pasta), `flicker` (chama tremulando, com `blend`), `slices: 1` (uma pessoa andando com passada).
- Efeitos: `flash` (flash de câmera na palavra), `typing` (máquina de escrever letra a letra; `paper: false` escreve sobre o papel do fundo), `calendar` (folhas voltando de um ano a outro), `dominoes` (peças caindo em sequência; `wobble_s`, `fall_s`, `step_s`), `smoke.color` (fumaça clara à noite).
- Fogo e explosão do Flow sobre preto: use `tint: "contrast(1.5) brightness(0.92)"` junto do `blend: 'screen'` para o preto do arquivo não clarear um retângulo no quadro.
- Mapear % do fundo para a tela: a origem do zoom muda tudo. Confira a posição no quadro renderizado (não na grade do fundo): `ys = oy + (y − oy) × z`.

**Som por ator/efeito** (`pipeline/assembly/vietna_mix_scene.py`): `sfx` (steps, step1, water, engine, plane, rotor, crowd, jeep, crane, flag, fire, typewriter, flips; ou one-shot paper, stamp, thud, boom, flash, bell, cheer; `none` para calar), `note` (motivo, R16) e `sfx_at_word` (palavra do one-shot, vira `reason: word:`). Sem `sfx`, o tipo sai do ator (`slices` → passos, `wake` → água e motor, `rotor` → helicóptero). Camas ficam 19–22 dB abaixo da voz (RMS da fala) e camas iguais em tomadas vizinhas viram um som só. Som extra da tomada: `scene.sfx: [{kind, at_s|from_s/to_s, note, at_cue}]`.

Cues: qualquer `*_word` + `*_offset` vira `*_s`.

## Quando escalar
- Duas regenerações no Flow sem um objeto de época correto. Registre e pergunte se pode usar foto de domínio público.
- Revisor reprovou no ciclo 2.
- Custo de crédito maior que 0.
- Afirmação da fala sem fonte para o que a imagem mostra (R1).
