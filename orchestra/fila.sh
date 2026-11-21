#!/bin/bash
# Fila única: roda UMA tarefa por vez, na ordem de orchestra/fila.txt ("executor id [modelo]" por linha).
# Roda desacoplada do Claude (setsid), então sobrevive a reinício do app. Registra o custo do DeepSeek por tarefa.
# Iniciar:  setsid nohup bash orchestra/fila.sh > orchestra/logs/fila.log 2>&1 &
cd /home/jonnathan/projects/ai-youtube-channel
F=orchestra/fila.txt; LOCK=orchestra/.fila.lock
exec 9>$LOCK; flock -n 9 || { echo "fila já está rodando"; exit 0; }
saldo(){ K="$(grep -m1 '^DEEPSEEK_API_KEY=' .env | cut -d= -f2- | tr -d "\"' ")"; curl -s https://api.deepseek.com/user/balance -H "Authorization: Bearer $K" | python3 -c "import sys,json;print(json.load(sys.stdin)['balance_infos'][0]['total_balance'])" 2>/dev/null; }
while true; do
  line=$(grep -v '^\s*#' $F | grep -v '^\s*$' | head -1); [ -z "$line" ] && { echo "$(date +%H:%M) fila vazia"; exit 0; }
  read -r W ID M <<< "$line"
  sed -i "0,/^$W $ID/s//# rodando $W $ID/" $F
  b0=$(saldo); echo "$(date +%H:%M) início $ID ($W $M) saldo=$b0"
  bash orchestra/freio.sh "$ID" "$b0" "${LIMITE_USD:-0.10}" & WD=$!     # freio de gasto por tarefa
  out=$(nice -n 15 bash orchestra/run.sh $W $ID $M)
  kill $WD 2>/dev/null   # prioridade baixa: a máquina segue usável durante o render
  b1=$(saldo); custo=$(python3 -c "print(round(float('${b0:-0}')-float('${b1:-0}'),3))" 2>/dev/null)
  python3 - "$ID" "$custo" <<'PY'
import json,sys,os
p=f"orchestra/results/{sys.argv[1]}.json"
if os.path.exists(p):
    d=json.load(open(p)); d['_custo_usd']=float(sys.argv[2] or 0); json.dump(d,open(p,'w'),ensure_ascii=False,indent=1)
PY
  echo "$(date +%H:%M) fim $ID custo=US\$$custo $(echo "$out" | cut -c1-200)"
  sed -i "s/^# rodando $W $ID/# feito $W $ID (US\$$custo)/" $F
done
