#!/bin/bash
# Executa uma tarefa do orquestrador num executor grátis e imprime SÓ o resultado JSON.
# Uso: orchestra/run.sh opencode|gemini|claude|dsh <task-id> [modelo]   (claude = Sonnet, só para tarefa crítica)
# A tarefa fica em orchestra/tasks/<id>.md; o executor grava orchestra/results/<id>.json; o log vai para orchestra/logs/<id>.log
set -u
ROOT=/home/jonnathan/projects/ai-youtube-channel; cd "$ROOT"
W=$1; ID=$2; M=${3:-}; T=orchestra/tasks/$ID.md; R=orchestra/results/$ID.json; L=orchestra/logs/$ID.log
[ -f "$T" ] || { echo "{\"status\":\"failed\",\"issues\":[\"tarefa $T não existe\"]}"; exit 2; }
rm -f "$R"
MSG="Execute a tarefa em $T seguindo AGENTS.md. Ao final grave $R no formato do AGENTS.md (obrigatório)."
export DEEPSEEK_API_KEY="$(grep -m1 "^DEEPSEEK_API_KEY=" .env | cut -d= -f2- | tr -d "\"' ")"
start=$(date +%s)
case $W in
  opencode) timeout ${TIMEOUT:-3600} opencode --standalone run --auto --archived --title "$ID" ${M:+-m $M} "$MSG" > "$L" 2>&1 ;;
  gemini)   export GEMINI_API_KEY="$(grep -m1 "^GEMINI_API_KEY=" .env | cut -d= -f2- | tr -d "\"' ")"; GEMINI_CLI_TRUST_WORKSPACE=true timeout ${TIMEOUT:-1800} gemini -m ${M:-gemini-3.5-flash} --yolo -p "$MSG" > "$L" 2>&1 ;;
  dsh)      timeout ${TIMEOUT:-3600} dsh headless --approval-policy never "$MSG" > "$L" 2>&1 ;;
  claude)   timeout ${TIMEOUT:-2400} claude -p --model ${M:-sonnet} --permission-mode acceptEdits ${MCP:+--mcp-config $MCP} --allowedTools "Read,Edit,Write,Glob,Grep,Bash,mcp__flow" --disallowedTools "Bash(*.env*)" -- "$MSG" > "$L" 2>&1 ;;
  *) echo "executor desconhecido: $W"; exit 2 ;;
esac
rc=$?; secs=$(( $(date +%s) - start ))
if [ -f "$R" ]; then python3 -c "import json,sys;d=json.load(open('$R'));d['_secs']=$secs;d['_rc']=$rc;print(json.dumps(d,ensure_ascii=False))"
else echo "{\"status\":\"failed\",\"_rc\":$rc,\"_secs\":$secs,\"issues\":[\"sem $R; ver tail de $L\"]}"; fi
