# Modelagem sem cópia

**Princípio:** vídeos que já deram certo provam que uma **forma** funciona (estrutura, ritmo, retenção). Nós **seguimos a forma** e criamos **todo o conteúdo**. Modelar não é copiar: copiar um título, um roteiro ou uma thumbnail é risco de política (conteúdo inautêntico), de direitos autorais e de reputação, e ainda deixa o canal sem identidade.

## O que modelamos e o que nunca copiamos
| Aspecto | Modelamos (seguir o padrão) | Nunca copiamos (é nosso) |
|---|---|---|
| Duração | A faixa dos breakouts recentes | — |
| Estrutura macro | Nº de atos, proporção entre eles, onde ficam as viradas e o pico | A ordem exata dos pontos e dos exemplos |
| Abertura | O tipo de gancho e o tempo em que ele acontece | Frases, cena e sequência idênticas |
| Ritmo | Frequência de mudança de padrão, uso de mapas e antes/depois | A sequência de cenas |
| Narrativa | O tipo de arco (ex.: mito → "não foi só isso" → história real) | Texto, frases, piadas, transições |
| Título | A estrutura gramatical e o tamanho (ex.: "X não foi só Y: Z") | As palavras: **similaridade < 70%** com qualquer título de referência |
| Thumbnail | A composição (foco único, texto curto, contraste) | A imagem, o layout idêntico e o texto igual |
| Descrição e capítulos | O formato | O texto |
| Visual | O tipo de recurso (mapa, antes/depois, linha do tempo) | Imagens, vídeos e assets de terceiros |
| Conteúdo | — | Os fatos vêm do **nosso dossiê de fontes** (primárias e acadêmicas), nunca do texto de outro vídeo |

## Como é verificado (script, não opinião)
1. **`research.md` → "Modelo identificado"**: o padrão comum de ≥ 3 referências, com números. Sem isso, não há o que seguir.
2. **`structure.md` → "Modelo identificado e desvios"**: a estrutura acompanha o modelo; cada desvio é justificado.
3. **`packaging_check.py`**: reprova título ≥ 70% parecido com um título do panorama do `research.md`.
4. **`originality_check.py`**: no roteiro, mede a sobreposição de sequências de 6 palavras com as transcrições das referências. **Limite: 3%.** Acima disso, reescrever.
5. **Revisão (`protocols/review.md`)**: o revisor confirma que fatos e exemplos vêm do dossiê, não das referências.

## Se a referência for muito pequena ou instável
Um canal de poucos vídeos pode ter números voláteis. Por isso o modelo vem do **padrão comum de ≥ 3 referências**, não de uma só.
