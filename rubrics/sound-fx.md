# Rubrica: Som e efeitos (SFX/FX)

**Origem:** feedback do usuário na rodada 2 do teste de estilos (2026-11-19). Efeitos e sons em excesso, repetitivos, altos e descasados da cena prejudicaram o entendimento da narração e a atenção; onde o som casava com o que a cena narrava, funcionou. **Critério permanente: todo vídeo passa por esta rubrica e pelo validador antes do QA final.**

## Princípio
**Som e efeito são pontuação, não decoração.** Cada um precisa ter um motivo narrativo verificável. Na dúvida, menos. O silêncio também é ferramenta.

## Regras
| # | Regra | Como se verifica |
|---|---|---|
| F1 | **Todo som/efeito tem `reason`**, ligado a uma palavra do roteiro (`word:<palavra>`) ou a uma cena (`scene:<ID>`) | `fx_check.py` |
| F2 | **Impactos pesados** (impact, boom): no máximo **3 por minuto** (mínimo permitido: 2 em clipes curtos) | `fx_check.py` |
| F3 | **Whooshes**: só em **saltos de lugar ou de tempo** (ex.: cena → mapa); no máximo 1 a cada 15 s. Dissolve comum não leva whoosh | `fx_check.py` + revisão |
| F4 | **Espaçamento**: dois eventos nunca a menos de 1,0 s um do outro (exceto a sequência de marcha de tambor) | `fx_check.py` |
| F5 | **Sem repetição**: o mesmo tipo de som no máximo 4 vezes em qualquer janela de 10 s | `fx_check.py` |
| F6 | **Alinhamento**: o evento acontece no tempo da palavra (±0,3 s) ou do início da cena (−0,3 s a +0,6 s). Som fora do que a cena mostra é erro | `fx_check.py` |
| F7 | **Voz primeiro**: medido na **faixa da fala (200–4000 Hz)**, que é o que mascara a voz. Em pelo menos 95% das janelas de fala (100 ms), a voz fica ≥ 10 dB acima de tudo que não é voz; mediana ≥ 16 dB | `fx_check.py --voice` |
| F8 | **Inteligibilidade**: a transcrição do mix final erra no máximo **2 pontos percentuais a mais** que a da voz sozinha | `fx_check.py --asr` |
| F9 | **FX visuais seguem os sons**: flash, tremor e zoom só nos eventos `visual: true`; amplitude contida (zoom ≤ 5%, tremor ≤ 8 px, flash ≤ 0,35) | revisão da camada `fx.tsx` |
| F11 | **Movimento relevante na tela tem som**: rota de mapa, linha sendo traçada, navio em deslocamento, etiqueta entrando e selo caindo ganham som baixo e com a duração do movimento (`sweep`, `pin`, `label`, `hit`). Cena de mapa ou marcha sem `sweep` reprova. O som acompanha o movimento; não é um som aleatório | `fx_check.py` (mapas) + revisão |
| F10 | **Silêncio intencional**: pelo menos 1 momento de silêncio ou queda de trilha por minuto, ligado a uma frase de peso | revisão |

## Orçamento de referência (por minuto de vídeo)
- impactos pesados: até 3 · whooshes: até 4 · acentos (`hit`): até 4 · sinos/notas: até 3 · trilha: contínua e baixa (ducking sob a voz).
- Vídeos de 50–75 min: o orçamento é **por minuto**, não por vídeo. Não "compensar" cenas calmas com mais efeitos em outras.

## Revisão humana (a nota que decide)
O usuário assiste com som e responde: **algum efeito atrapalhou a narração? algum soou repetitivo? algum não combinou com a cena?** Qualquer "sim" volta para refazer o mix. Registrar a resposta no `qa.md`.
