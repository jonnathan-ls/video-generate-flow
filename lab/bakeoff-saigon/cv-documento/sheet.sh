#!/usr/bin/env bash
# sheet.sh t1,t2,... -> stills/folha.jpg (reduzida)
cd "$(dirname "$0")"; rm -f stills/*.png; node render.mjs --stills "$1" 2>&1 | grep -E "page|error|ready|http" | head
fs=(stills/1920x1080_t*.png); n=${#fs[@]}
ffmpeg -v error -y $(for f in "${fs[@]}"; do echo -i $f; done) -filter_complex "$(for i in $(seq 0 $((n-1))); do echo -n "[$i:v]scale=640:-2[s$i];"; done)$(for i in $(seq 0 $((n-1))); do echo -n "[s$i]"; done)xstack=inputs=$n:layout=$(python3 -c "n=$n;print('|'.join(f'{(i%3)*640}_{(i//3)*360}' for i in range(n)))")" -frames:v 1 -q:v 5 stills/folha.jpg; echo stills/folha.jpg
