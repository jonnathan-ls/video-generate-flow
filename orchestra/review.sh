#!/bin/bash
# Revisor visual independente (Gemini) de uma cena renderizada. Uso: orchestra/review.sh S03 [ciclo]
# Gera quadros nas palavras de ação + séries consecutivas, monta folhas e pede ao Gemini notas V1–V7,V9,V10 em JSON.
set -u
ROOT=/home/jonnathan/projects/ai-youtube-channel; cd "$ROOT"
S=$1; C=${2:-1}; R=media/pt-br-historia/vietna/render; D=orchestra/review/$S; mkdir -p $D; rm -f $D/*.jpg
MP4=${MP4:-$R/$S.mp4}; D=$D/${REVIEWER:-gemini}; D=${D//\//_}; D=orchestra/review/$S/$(basename $D); mkdir -p $D; rm -f $D/*.jpg
python3 - "$R/props/$S.json" "$MP4" "$D" <<'PY'
import json,sys,subprocess
p,mp4,d=sys.argv[1:]; pj=json.load(open(p)); dur=pj["durationSec"]; ts=set()
def walk(o):
    if isinstance(o,dict):
        for k,v in o.items():
            if k.endswith("_s") and isinstance(v,(int,float)) and 0<=v<dur and k not in("end_s",): ts.add(round(v,2))
            walk(v)
    elif isinstance(o,list): [walk(x) for x in o]
walk(pj["spec"]); ts=sorted(ts)
for sh in pj["spec"].get("shots",[]): ts.append(round((sh["start_s"]+sh["end_s"])/2,2))
cuts=[sh["start_s"] for sh in pj["spec"].get("shots",[])]
ts=[t+0.3 if any(abs(t-c)<0.25 for c in cuts) else t for t in ts]  # evita o quadro de transição (fade preto) na virada de tomada
ts=sorted(set(round(t,2) for t in ts if t<dur-0.1))[:24]
for i,t in enumerate(ts):
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(t),"-i",mp4,"-frames:v","1","-vf","scale=640:360",f"{d}/a{i:02d}_{t:05.2f}.jpg"])
# séries consecutivas (0,1 s) no meio de cada tomada para julgar movimento
for j,sh in enumerate(pj["spec"].get("shots",[])):
    m=(sh["start_s"]+sh["end_s"])/2
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(m),"-i",mp4,"-t","0.35","-vf","fps=10,scale=480:270,tile=3x1","-frames:v","1",f"{d}/m{j:02d}_{m:05.2f}.jpg"])
words=" ".join(f'{w["word"]}@{w["start"]:.1f}' for w in pj["words"])
open(f"{d}/ctx.txt","w").write(f"Cena {pj.get('scene')} ({dur:.1f}s). Palavras com tempo: {words}\nTomadas: "+json.dumps([{k:v for k,v in sh.items() if k in('start_s','end_s','cue','motion')} for sh in pj['spec'].get('shots',[])],ensure_ascii=False))
PY
IMGS=$(ls $D/*.jpg | sed 's/^/@/' | tr '\n' ' ')
export GEMINI_API_KEY="$(grep -m1 "^GEMINI_API_KEY=" .env | cut -d= -f2- | tr -d "\"' ")"
PROMPT="Você é revisor independente e cético de um documentário de história no YouTube (canal Lacre). Padrão aprovado pelo usuário: cada tomada é uma cena ilustrada (fundo pintado) em que objetos recortados SE MOVEM de forma crível no tempo da palavra que os nomeia (navio entra, coluna marcha com pernas alternando, explosão na palavra). Reprove: imagem parada só com zoom, objeto sem chão (andando na água), velocidade irreal, pernas paradas deslizando, emendas visíveis, escala errada entre objetos, anacronismo (uniforme, veículo, bandeira, prédio), texto ilegível em 640x360 ou cobrindo o objeto, objeto sob a legenda, estilo inconsistente. Contexto: $(cat $D/ctx.txt)
Imagens: arquivos aNN_T.jpg = quadro no tempo T (s); mNN_T.jpg = 3 quadros seguidos (0,1 s) no meio da tomada NN, para julgar movimento. $IMGS
Dê nota 0–5 com evidência (tempo) em: V1 consistência de estilo, V2 profundidade, V3 movimento contínuo, V4 ritmo, V5 tipografia/legibilidade, V6 atmosfera, V7 rótulos de contexto, V9 ação ligada à fala, V10 credibilidade física e de época. Checagem obrigatória, responda cada uma nos defeitos se falhar: (a) bandeiras: há emendas/degraus/faixas verticais no tecido ou a borda solta do mastro? (b) pessoas andando: as pernas mudam de pose entre os 3 quadros seguidos ou a figura desliza? (c) escala: cada objeto tem tamanho coerente com o vizinho (soldado vs navio/porta)? (d) contato: pés no chão, casco na água, carga presa ao cabo? (e) cores e equipamento são da época? (f) algum texto pequeno com baixo contraste? Seja severo: nota 5 só para nível de documentário profissional; na dúvida, 3. Aprovação exige todas >=4 e média >=4,3 e nenhum defeito alto.
Responda SÓ um JSON válido: {\"cena\":\"$S\",\"ciclo\":\"$C\",\"notas\":{\"V1\":n,...},\"media\":n,\"veredito\":\"APROVADO|REFAZER\",\"defeitos\":[{\"prioridade\":\"alta|media|baixa\",\"tempo\":\"s\",\"defeito\":\"...\",\"correcao\":\"...\"}],\"bom\":[\"...\"]}"
if [ "${REVIEWER:-gemini}" = gemini ]; then GEMINI_CLI_TRUST_WORKSPACE=true timeout 600 gemini -m ${GEMINI_MODEL:-gemini-3.5-flash} -p "$PROMPT" > $D/raw.txt 2>$D/err.txt
else FILES=$(ls $D/*.jpg | sed 's/^/-f /' | tr '\n' ' '); PROMPT2="${PROMPT//@orchestra/orchestra}"; timeout 900 opencode --standalone run --auto --archived -m $REVIEWER $FILES -- "$PROMPT2 Não use ferramentas; só olhe as imagens anexadas." > $D/raw.txt 2>$D/err.txt; fi
python3 - "$D/raw.txt" "orchestra/results/review-$S-c$C-$(basename $D).json" <<'PY'
import json,re,sys
t=open(sys.argv[1]).read(); m=re.search(r"\{.*\}",t,re.S)
try: d=json.loads(m.group(0)); json.dump(d,open(sys.argv[2],"w"),ensure_ascii=False,indent=1); print(json.dumps(d,ensure_ascii=False))
except Exception as e: print(json.dumps({"veredito":"ERRO","issues":[f"JSON inválido do Gemini: {e}; ver {sys.argv[1]}"]}))
PY
