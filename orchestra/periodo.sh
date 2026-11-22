#!/bin/bash
# Checagem de época por visão, ANTES de animar: cada imagem do Flow é conferida contra o período e o lugar da cena.
# Uso: bash orchestra/periodo.sh <pasta-de-imagens> "<contexto: lugar, data, lados, equipamentos esperados>" [saida.json]
# Ex.: bash orchestra/periodo.sh lab/bakeoff-saigon/colagem/img "Saigon, 29-30/04/1975: CH-53 dos Fuzileiros dos EUA, tanque T-54 norte-vietnamita, Palácio da Independência (modernista, 1966), soldados sul-vietnamitas com M16"
# (a pasta temporária fica fora de .gitignore: o Gemini CLI ignora arquivos ignorados pelo git)
# Gemini Flash (grátis) com as imagens reduzidas a 768 px. Saída: JSON {imagens:[{arquivo, ok, problemas[], correcao_prompt}], reprovadas:n}.
# Imagem reprovada volta ao Flow com o prompt corrigido; não vai para o recorte/animação (protocols/scene-production.md).
cd /home/jonnathan/projects/ai-youtube-channel
P=$1; CTX=$2; OUT=${3:-$P/periodo.json}
T=orchestra/review/periodo_$$; mkdir -p $T; trap '[ -n "$KEEP" ] || rm -rf $T' EXIT
for f in "$P"/*.{jpg,jpeg,png}; do [ -f "$f" ] || continue
  ffmpeg -loglevel error -y -i "$f" -vf "scale=768:-2" "$T/$(basename "${f%.*}").jpg"; done
IMGS=$(ls $T/*.jpg | sed 's/^/@/' | tr '\n' ' ')
export GEMINI_API_KEY="$(grep -m1 "^GEMINI_API_KEY=" .env | cut -d= -f2- | tr -d "\"' ")"
PROMPT="Você é consultor histórico de um documentário (canal Lacre). Contexto da cena: $CTX.
Confira CADA imagem anexada contra esse contexto, com rigor de especialista: uniformes e capacetes, armas (modelo e época), veículos e aeronaves (modelo, cor, marcações), bandeiras, arquitetura (o prédio real, não um genérico), placas e textos, tecnologia e roupas civis. Fundo verde/croma é esperado em recortes: ignore.
Aponte só erro concreto que um espectador atento notaria. Imagens: $IMGS
Responda SÓ um JSON válido: {\"imagens\":[{\"arquivo\":\"nome\",\"ok\":true|false,\"problemas\":[\"...\"],\"correcao_prompt\":\"trecho para trocar no prompt do Flow\"}],\"reprovadas\":n}"
# 2026-11-22: Antigravity CLI (plano Google do usuário) primeiro; Gemini/OpenCode grátis ficam de reserva.
AGY_MODEL=${AGY_MODEL:-gemini-3.8-flash-medium} python3 orchestra/tools/visao.py "${PROMPT//@/}" $(ls $T/*.jpg) --prov ${VISAO_PROV:-agy} 2>$T/err.txt | python3 -c "import json,sys;print(json.load(sys.stdin)['resposta'])" > $T/raw.txt
grep -q '"' $T/raw.txt || GEMINI_CLI_TRUST_WORKSPACE=true timeout 600 gemini -m ${GEMINI_MODEL:-gemini-3.5-flash} -p "$PROMPT" > $T/raw.txt 2>$T/err.txt || true
# Reserva: Gemini sem JSON (cota 429 de imagem no plano grátis, visto em 2026-11-20) → modelo grátis com visão no OpenCode.
if ! grep -q '"imagens"' $T/raw.txt; then
  FILES=$(ls $T/*.jpg | sed 's/^/-f /' | tr '\n' ' ')
  timeout 900 opencode --standalone run --auto --archived -m ${REVIEWER:-opencode/hy4-flash-free} $FILES -- "${PROMPT//@orchestra/orchestra} Não use ferramentas; só olhe as imagens anexadas." > $T/raw.txt 2>>$T/err.txt
fi
python3 - "$T/raw.txt" "$OUT" <<'PY'
import json,re,sys
t=open(sys.argv[1]).read(); m=re.search(r"\{.*\}",t,re.S)
try:
    d=json.loads(m.group(0)); json.dump(d,open(sys.argv[2],"w"),ensure_ascii=False,indent=1)
    print(json.dumps({"reprovadas":d.get("reprovadas"),"problemas":{i["arquivo"]:i["problemas"] for i in d.get("imagens",[]) if not i.get("ok")}},ensure_ascii=False))
except Exception as e: print(json.dumps({"erro":f"JSON inválido do Gemini: {e}"})); sys.exit(1)
PY
