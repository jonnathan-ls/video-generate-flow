#!/bin/bash
# Fila paralela para tarefas SEM Flow (o Flow tem uma tela só: tarefas com Flow ficam na fila única).
# Uso: setsid nohup bash orchestra/paralelo.sh <N> <arquivo-com-linhas "executor id [modelo]"> > orchestra/logs/paralelo.log 2>&1 &
# Roda até N tarefas ao mesmo tempo, com prioridade baixa. Render continua na GPU (regra do CLAUDE.md).
cd /home/jonnathan/projects/ai-youtube-channel
N=${1:-3}; LISTA=$2
grep -v '^\s*#' "$LISTA" | grep -v '^\s*$' | xargs -P "$N" -L 1 bash -c 'echo "$(date +%H:%M) início $1"; nice -n 15 bash orchestra/run.sh "$0" "$1" $2 > /dev/null; echo "$(date +%H:%M) fim $1 rc=$?"'
echo "$(date +%H:%M) paralelo concluído"
