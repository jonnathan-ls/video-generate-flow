#!/bin/bash
# Renderiza, mixa e junta voz+som das cenas pedidas. Uso: vietna_render_batch.sh S02 S03 ...
set -e
ROOT=/home/jonnathan/projects/ai-youtube-channel; R=$ROOT/media/pt-br-historia/vietna/render
for s in "$@"; do
  (cd $ROOT/studio/remotion && npx remotion render VietnaScene $R/${s}_video.mp4 --props=$R/props/$s.json --concurrency=6 --gl=vulkan >/dev/null 2>&1)
  $ROOT/.venv/bin/python $ROOT/pipeline/assembly/vietna_mix_scene.py $R/voz/$s.wav $R/props/$s.json $R/${s}_mix.wav >/dev/null
  ffmpeg -y -loglevel error -i $R/${s}_video.mp4 -i $R/${s}_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $R/$s.mp4
  echo "$s ok"
done
