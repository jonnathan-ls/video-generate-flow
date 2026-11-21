#!/bin/bash
# Conferência rápida de uma cena: quadros nas palavras de ação, na GPU, em segundos. Uso: orchestra/tools/quadros.sh S05 [t1,t2|auto] [props.json]
ROOT=/home/jonnathan/projects/ai-youtube-channel; S=$1; SEL=${2:-auto}; P=${3:-$ROOT/media/pt-br-historia/vietna/render/props/$S.json}
OUT=$ROOT/media/pt-br-historia/vietna/render/quadros/$S; rm -rf $OUT
cd $ROOT/studio/remotion && node quadros.mjs "$P" "$OUT" "$SEL" 2>&1 | tail -1
