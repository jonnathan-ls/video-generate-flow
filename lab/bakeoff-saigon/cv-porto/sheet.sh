#!/usr/bin/env bash
# sheet.sh t1,t2,... -> stills/folha.jpg (reduzida)
cd "$(dirname "$0")"; rm -f stills/*.png; node render.mjs --stills "$1" >/dev/null 2>&1
fs=(stills/1920x1080_t*.png); ffmpeg -v error -y $(for f in "${fs[@]}"; do echo -i $f; done) -filter_complex "$(for i in $(seq 0 $((${#fs[@]}-1))); do echo -n "[$i:v]scale=640:-2[s$i];"; done)$(for i in $(seq 0 $((${#fs[@]}-1))); do echo -n "[s$i]"; done)xstack=inputs=${#fs[@]}:layout=$(python3 -c "n=${#fs[@]};print('|'.join(f'{(i%3)*640}_{(i//3)*360}' for i in range(n)))")" -frames:v 1 -q:v 5 stills/folha.jpg; echo stills/folha.jpg
