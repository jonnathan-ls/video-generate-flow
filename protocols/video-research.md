# Protocolo: Pesquisa do vídeo (tendência, referências, lacunas, fontes)

**Agente:** trend-researcher (coleta) + strategist (síntese) · **Status:** `selected` → `researched` · **Saída:** `research.md` na pasta do vídeo · **Usuário:** só vê o resumo (B-pesquisa opcional)

Objetivo: chegar à embalagem e ao roteiro sabendo **o que o público já assiste sobre o tema, como os melhores vídeos prendem a atenção, o que falta neles e onde estão as fontes confiáveis**. Sem isso, o vídeo repete o que já existe ou erra os fatos.

## Leitura obrigatória
`knowledge/retention.md`, `knowledge/hooks.md`, `knowledge/packaging.md`, `channels/<canal>/learnings.md` e `competitors.md`, o `brief.md` do vídeo.

## Economia de contexto (regra da operação)
Coleta pesada (buscas, metadados, legendas, comentários) roda em **subagente ou script**, grava em `research/raw/` do vídeo e devolve **só o resumo**. Transcrições nunca entram inteiras no contexto principal: extraia por script a estrutura (blocos de tempo, palavras-chave, cortes de tópico) e leia só trechos.

## Passos
1. **Panorama de demanda do tema exato.** Toda linha traz **data e idade em dias**; só a janela de recência (7–120 dias) prova demanda, os mais antigos entram como "concorrente estabelecido". Rode `pipeline/research/snapshot.py snap <ids> --tag <vídeo>` para começar a medir o crescimento. Busca no YouTube em PT (e EN para o tema, se houver líder estrangeiro) com filtro "este ano" ordenado por views, mais o autocomplete. Tabela dos 10 melhores: título, canal, inscritos, nº de vídeos, data, duração, views, múltiplo da mediana do canal. Marcar **breakout** (definição em `rubrics/niche-scoring.md`) e **saturado**.
2. **Escolher 3 a 5 referências estruturais**: ≥ 1 breakout de canal pequeno, ≥ 1 líder do tema, ≥ 1 estrangeiro de alta qualidade. Para cada uma, via `yt-dlp`:
   - metadados (`--dump-json`): `chapters`, **`heatmap`** ("mais repetidos": picos = interesse, vales = queda) quando disponível, duração, views, likes;
   - legendas automáticas (`--write-auto-subs`) **só para análise de estrutura**;
   - os 50 comentários mais curtidos.
3. **Modelar a estrutura de cada referência** (siga `knowledge/modeling.md`: o que modelamos e o que nunca copiamos) (por script + leitura de trechos): tempo do gancho, número de atos, viradas, loops abertos e fechados, onde o payoff aparece, duração por bloco, momentos de pico e de vale do heatmap. **Proibido reaproveitar frases, sequência de pontos ou títulos.** O objetivo é aprender o padrão, não copiar.
4. **Modelo identificado.** O padrão comum de ≥ 3 referências, **com números**, para cada aspecto da tabela de `knowledge/modeling.md` (duração, atos, abertura, ritmo, padrão de título, composição de thumbnail, tipo de narrativa). É o que o vídeo vai seguir.
5. **Lacunas e ângulo.** O que as referências omitem, simplificam ou erram; perguntas dos comentários sem resposta; ângulo original com **≥ 2 diferenciais verificáveis**; a conexão com o Brasil (pilar Mundo + Brasil), se aplicável.
6. **Dossiê de fontes.** ≥ 8 fontes, **≥ 3 primárias ou acadêmicas**, cada uma com URL, tipo, o que sustenta e confiabilidade. Anotar controvérsias historiográficas e números contestados (para o roteiro usar "cerca de" ou dar a faixa).
7. **Hipóteses de embalagem.** 5 promessas candidatas, com o desejo ou emoção de cada uma, conferidas contra os outliers do passo 1.
8. **Riscos.** Política de IA e de conteúdo sensível, pessoas vivas, direitos de imagem (só acervos públicos), saturação, risco de desinformação.

## Saída `research.md` (seções obrigatórias, lidas pelo `status_gate`)
`## Panorama` · `## Referências estruturais` · `## Modelo identificado` · `## Lacunas e ângulo` · `## Dossiê de fontes` · `## Hipóteses de embalagem` · `## Riscos`

## Definition of Done
- [ ] As 6 seções existem; a tabela do panorama tem ≥ 8 vídeos com URL e múltiplo.
- [ ] ≥ 3 referências estruturais analisadas, com heatmap ou, na falta dele, justificativa.
- [ ] ≥ 8 fontes com URL, sendo ≥ 3 primárias ou acadêmicas.
- [ ] ≥ 2 diferenciais verificáveis contra as referências.
- [ ] Nenhum número sem fonte (R2); o que não foi verificado está marcado "n/v".

## Erros comuns → ação
| Erro | Ação |
|---|---|
| Pesquisar só os líderes | Incluir breakouts pequenos: são o sinal de que o tema está aberto a canal novo |
| Fontes só de blogs e vídeos | Exigir primárias ou acadêmicas; sem elas, o roteiro fica como opinião |
| Copiar a estrutura de uma referência | Combinar o padrão de ≥ 3 referências e acrescentar o ângulo próprio |
| Ler transcrições inteiras | Usar script de estrutura e amostras (economia de contexto) |

## Quando escalar
- Nenhum diferencial verificável: o tema está saturado; propor trocar o ângulo ou o vídeo.
- Fontes primárias inexistentes ou contraditórias a ponto de impedir uma narrativa responsável.
