# Protocolo: Plano de tomadas (shots) por cena

**Etapa:** entre `script_approved` e `produced` · **Validador:** `python3 pipeline/validate/shot_check.py <scenes_spec.json> <props-dir>`

## Por que existe
Uma "cena" do roteiro dura 15 a 30 s e tem uma ideia visual. Um vídeo assistido por 20 minutos não pode ter uma imagem por 15 s. Em 2026-11-19 a cena 1 do Vietnã foi renderizada como uma cena inteira: mapa único, uma linha desenhada, nada mais. O teste comparativo aprovado tinha corte ou mudança de enquadramento a cada 3 a 6 s. Faltava esta etapa (a linha 10 de `production-pipeline.md` dizia "hoje à mão").

## Regras
1. Cada cena do roteiro é dividida em **tomadas** de 3 a 6 s (máx. 7 s). Cada tomada muda enquadramento, zoom, elemento principal ou tipo de visual em relação à anterior.
2. Cada tomada liga a uma **palavra ou frase** da narração (o que está sendo dito aparece ou muda na tela).
3. Toda tomada tem movimento próprio (câmera, deriva, desenho) e pelo menos 3 camadas (fundo, elemento principal, rótulo/atmosfera).
4. Mapa só aparece quando a frase é sobre lugar. Frase sobre documento mostra o documento; número mostra gráfico; pessoa mostra imagem/retrato ou tipografia do nome. Duas tomadas seguidas não repetem o mesmo tipo de visual.
5. Rótulo (lugar, data, nome) sempre que o lugar ou o tempo muda (V7).
6. Texto na tela só repete a fala quando é dado (data, número, nome). Nunca decoração.

## Entrega ao usuário
Antes de mostrar qualquer trecho renderizado: (a) `shot_check.py` PASS, (b) `freezedetect`, (c) `fx_check.py`, (d) nota V1–V7 registrada por revisor independente (agente `reviewer`) no arquivo `qa-trecho.md`. Sem isso o trecho não vai ao usuário (R6).

## Modelo
A direção visual (plano de tomadas e revisão do trecho) usa o modelo mais forte disponível (R15).

## Regra 7 (2026-11-19, reprovação do usuário: "só texto e mapa")
O visual de cada tomada é **cena ilustrada** (plate com céu, relevo, personagens e câmera com parallax por camada). Texto, número, data e nome entram como camada secundária (lower-third pequeno, tag), nunca como a imagem. Mapa, linha do tempo e gráfico só quando o dado é o assunto da frase, no máximo 20% do tempo do vídeo. Cada plate no máximo 2 vezes por lote, ligado ao que a frase diz e correto para a época (bandeiras, navios, veículos). O revisor independente avalia antes de o trecho ir ao usuário.

## Regra 8 (2026-11-20, padrão aprovado pelo usuário)
A Regra 7 foi substituída pela produção de cena com ação: `protocols/scene-production.md` (R18). Plate de código e fundo parado com zoom não são mais aceitos como tomada principal.
