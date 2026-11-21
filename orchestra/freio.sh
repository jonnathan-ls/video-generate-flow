#!/bin/bash
# Freio de gasto do DeepSeek: a cada 60 s compara o saldo com o do início; se a tarefa passar do limite, interrompe o executor dela.
# Uso (pela fila): bash orchestra/freio.sh <id-da-tarefa> <saldo-inicial> [limite-usd, padrão 0.10]
cd /home/jonnathan/projects/ai-youtube-channel
ID=$1; B0=$2; LIM=${3:-0.10}
saldo() {
  K="$(grep -m1 '^DEEPSEEK_API_KEY=' .env | cut -d= -f2- | tr -d "\"' ")"
  curl -s https://api.deepseek.com/user/balance -H "Authorization: Bearer $K" | python3 -c "import sys,json;print(json.load(sys.stdin)['balance_infos'][0]['total_balance'])" 2>/dev/null
}
while sleep 60; do
  B=$(saldo)
  [ -z "$B" ] && continue
  if python3 -c "import sys; sys.exit(0 if float('$B0') - float('$B') > float('$LIM') else 1)"; then
    echo "$(date +%H:%M) $ID passou do limite de US\$ $LIM: interrompida"
    pkill -f -- "--title $ID "
    exit 0
  fi
done
