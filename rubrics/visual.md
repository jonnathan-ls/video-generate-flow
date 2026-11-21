# Rubrica: Qualidade visual de um vídeo

Extraída da análise das aberturas do Ampulheta (`research/visual-reference-ampulheta.md`) e calibrada no teste de estilos (`lab/bakeoff-2026-11/`). Nota de 0 a 5 por critério. **Mínimo 4 em todos** para aprovar um trecho. V8 é a avaliação do usuário e decide.

| # | Critério | Como se mede |
|---|---|---|
| V1 | **Consistência de estilo** (traço, paleta, luz) em todas as cenas | Folha de contato do trecho: nenhuma cena "de outro vídeo" |
| V2 | **Profundidade**: pelo menos 3 camadas com parallax nas cenas ilustradas | Inspeção das cenas + quadros |
| V3 | **Movimento contínuo**: nenhum trecho parado por mais de 2 s | `freezedetect` do FFmpeg (limiar 0,002, 2 s): automático |
| V4 | **Ritmo**: abertura (0–45 s) acelerada; corpo com mudança de padrão a cada ≤ 45 s | `script_check` (cenas marcadas) + detecção de cortes |
| V5 | **Tipografia**: no máximo 2 famílias, hierarquia fixa (cartela, rótulo, impacto), legível em 360p | Quadros reduzidos a 640×360 |
| V6 | **Atmosfera**: luz, partículas ou textura em ≥ 70% das cenas | Checklist por cena |
| V7 | **Rótulos de contexto** (lugar/data/nome) quando o roteiro muda de lugar ou tempo | Cruzamento roteiro × cenas |
| V9 | **Ação ligada à fala** (R18): em cada tomada um objeto se desloca ou um efeito acontece na palavra que o nomeia (±0,4 s); nenhum trecho > 2 s sem objeto em movimento | `shot_check.py` (cobertura de ação) + quadros na palavra |
| V10 | **Credibilidade física e de época**: tudo tem chão e contato (pés no chão, casco na água, sombra); escala e velocidade reais (caminhada ≈ 0,5–1 altura de corpo/s); uniforme, veículo, avião, bandeira e prédio corretos para o ano; nada sob a legenda (base dos objetos acima de 85% da altura) | Quadros consecutivos + fonte iconográfica em `sources.md` |
| V8 | **Lado a lado com a referência**: não parece amador | Avaliação do usuário |

## Regra de aprovação e loop de revisão (R6, R18)
1. **Autochecagem do produtor** antes do revisor: `shot_check.py`, `scene_gates.py` (freezedetect, loudness, fx_check), folha de contato e quadros na palavra de cada ação. O produtor confere sozinho, quadro a quadro, os itens de V9 e V10.
2. **Ciclo 1 do revisor independente** (agente `reviewer`, modelo mais forte): nota de 0 a 5 em V1–V7, V9 e V10, cada uma com a evidência (tempo e quadro), e uma tabela de defeitos com prioridade. Aprovação exige **todas as notas ≥ 4 e média ≥ 4,3**, nenhum FAIL de validador e nenhum defeito de prioridade alta.
3. Reprovou → o produtor corrige **todos** os defeitos de prioridade alta e média → **ciclo 2**. Se o ciclo 2 não aprovar, pare e escale ao usuário com o diagnóstico (R6/R8).
4. O resultado vai em `qa-lote-XX.md` do vídeo, com as notas de cada ciclo. Nada chega ao usuário sem esse arquivo aprovado.
5. No fim, o **QA do vídeo completo** repete V1–V10 na montagem inteira (continuidade entre lotes, ritmo global, cota de 20% de mapa/texto) antes do V8.

Som e efeitos têm rubrica própria: `rubrics/sound-fx.md` (R16).
