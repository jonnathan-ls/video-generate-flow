#!/bin/bash
# espera o ciclo 2 do lote 1 (que usa o Flow) terminar; depois roda colagem e stick film em sequência (um Flow por vez)
cd /home/jonnathan/projects/ai-youtube-channel
while pgrep -f "orchestra/chain.sh" >/dev/null; do sleep 60; done
TIMEOUT=5400 bash orchestra/run.sh opencode bk-colagem deepseek/deepseek-flash | cut -c1-400
TIMEOUT=5400 bash orchestra/run.sh opencode bk-stickfilm deepseek/deepseek-flash | cut -c1-400
