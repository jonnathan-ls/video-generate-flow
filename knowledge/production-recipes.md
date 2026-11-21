# Receitas de produção: relógio único, ducking e conferência final

Origem: `kits/kit-motion-graphics-com-fable-5/kit/07-receitas-tecnicas.md`, receitas 1, 12 e 13 (repositório antigo kit-flow-generate, só leitura). Ficaram só as receitas que o projeto ainda não tem. A normalização de loudness em duas passadas já existe em `pipeline/assembly/vietna_mix_scene.py` (alvo −14 LUFS) e a checagem do master em `pipeline/validate/render_check.py`; aqui só entra o que falta nelas. Os valores são ponto de partida de mixagem, a escuta decide.

## 1. Relógio único
**Problema:** a timeline usa segundos, o vídeo usa quadros e a voz usa amostras. Se cada módulo arredonda de um jeito, corte e legenda se afastam da fala.

- Fixe no começo do vídeo: fps de entrega como razão exata (30/1), taxa de áudio (48000 Hz) e duração.
- Intervalos semiabertos `[in, out)`: o quadro de saída já pertence ao trecho seguinte.
- Quadro `f` → tempo `t = f / fps`. Tempo `t` → amostra `round(t × 48000)`.
- A voz (`words.json` de `align_words.py`) manda no tempo. Cena, legenda e efeito se medem contra ela.
- Em 30000/1001 mantenha a razão nos cálculos internos. Não troque por 29,97 em cada passo.
- 2 quadros por segundo é amostragem de revisão, nunca fps de render.
- **Evidência:** `ffprobe` de origem e de entrega gravado no QA do lote.

## 2. Ducking pela voz (alternativa ao envelope de `sound_design.py`)
**Problema:** a música encobre a fala, e baixar o volume fixo tira a energia das pausas.

Use quando for mixar com o ffmpeg direto, sem passar pelo mixer do projeto:

```sh
ffmpeg -n -i voz.wav -i musica.wav -filter_complex \
"[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[voz][controle];\
[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.25[musica];\
[musica][controle]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300[duck];\
[voz][duck]amix=inputs=2:duration=first:normalize=0[mix]" \
-map "[mix]" -c:a pcm_f32le mix.wav
```
- Some os efeitos nas posições da lista de cues antes de masterizar. Se uma cauda passa do fim da voz, planeje a duração, porque `duration=first` corta.
- Escute se o ducking bombeia entre sílabas ou demora a soltar. Ajuste primeiro a relação entre os elementos e depois a masterização.
- Voz e trilha entram alinhadas desde zero e com a mesma duração.

## 3. Loudness: conferir depois do encode
O mixer do projeto já normaliza em duas passadas. A etapa que costuma faltar é medir de novo no arquivo final:
- Rode `render_check.py` no MP4 final, e não só no `mix.wav`. O codec pode mexer nos picos.
- Se a segunda passada usou números medidos, meça de novo quando o áudio mudar. Não reaproveite números de outra mixagem.
- `linear=true` é um pedido, não uma garantia. Confira o modo aplicado no relatório do `loudnorm`.

## 4. Conferência final do master
- ASR independente do áudio final comparado com o texto que devia ser ouvido: `pipeline/validate/transcript_check.py` (por cena, com `--scenes ... --scene SXX`). Forced alignment não serve como teste de fidelidade, porque já recebe o texto esperado.
- Ignore diferença só gráfica (`vinte` e `20`). Examine nomes, números, omissões, trocas e repetições.
- Inspeção estática dos quadros amostrados e movimento nas junções entre lotes. Escute o master inteiro.
- Valide início, fim, proporção, duração, legenda e que não há truncamento. Render concluído é uma etapa, e a entrega depende de o vídeo funcionar para quem assiste.
