#!/bin/bash
# Roda tarefas em sequência; para na primeira que não terminar "done". Uso: orchestra/chain.sh <worker> <modelo> id1 id2 ...
cd /home/jonnathan/projects/ai-youtube-channel; W=$1; M=$2; shift 2
for id in "$@"; do
  out=$(bash orchestra/run.sh $W $id $M); echo "$id $out" | cut -c1-600
  echo "$out" | grep -q '"status": "done"' || { echo "PARADA em $id"; exit 1; }
done; echo FIM
