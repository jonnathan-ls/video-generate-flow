#!/bin/bash
# Calibra revisores contra o gabarito do revisor Opus (qa-lote-01.md): S03, S05, S06 reprovadas, com defeitos conhecidos.
cd /home/jonnathan/projects/ai-youtube-channel; O=orchestra/calib; mkdir -p $O
for rv in "$@"; do
  for s in S03 S05 S06; do
    mp4=media/pt-br-historia/vietna/render/$s.mp4; [ $s = S03 ] && mp4=orchestra/bakeoff/S03.orig.mp4
    REVIEWER=$rv MP4=$mp4 bash orchestra/review.sh $s calib > $O/$(echo $rv | tr / _).$s.json 2>/dev/null
  done
  echo "$rv ok"
done
