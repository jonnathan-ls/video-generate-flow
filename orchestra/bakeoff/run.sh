#!/bin/bash
# Roda a mesma tarefa em vários modelos, restaurando os arquivos entre eles.
cd /home/jonnathan/projects/ai-youtube-channel
V=channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna; R=media/pt-br-historia/vietna/render; B=orchestra/bakeoff
cp studio/remotion/src/vietna/scene.tsx $B/scene.tsx.orig; cp $V/scenes_spec.json $B/spec.orig; cp $R/S03.mp4 $B/S03.orig.mp4
for m in "$@"; do
  n=$(basename $m); cp $B/scene.tsx.orig studio/remotion/src/vietna/scene.tsx; cp $B/spec.orig $V/scenes_spec.json
  TIMEOUT=2700 bash orchestra/run.sh opencode bake-s03 $m > $B/$n.result.json
  cp $R/S03.mp4 $B/S03.$n.mp4 2>/dev/null; cp studio/remotion/src/vietna/scene.tsx $B/scene.$n.tsx; cp $V/scenes_spec.json $B/spec.$n.json; cp orchestra/logs/bake-s03.log $B/$n.log
  bash orchestra/review.sh S03 $n > $B/$n.review.json 2>/dev/null
  echo "$n $(head -c 300 $B/$n.result.json)"
done
cp $B/scene.tsx.orig studio/remotion/src/vietna/scene.tsx; cp $B/spec.orig $V/scenes_spec.json; cp $B/S03.orig.mp4 $R/S03.mp4
echo FIM
