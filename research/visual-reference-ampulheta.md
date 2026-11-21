# Referência visual: Ampulheta (aberturas)

**Fonte:** 3 aberturas de 75 s em 720p, baixadas na pesquisa anterior (`kit-flow-generate/temp/research/ampulheta-longform/openings/videos`): 2ª Guerra (mTVdsVL8Y0U), Hitler (lGbl3BFD17k), Roma (6HrCdP_4RZk). Material usado só para análise privada. As folhas de contato estão em `media/reference/ampulheta/*.sheet.jpg`, com 1 quadro a cada 3 s, e ficam fora do git.

**Limite desta análise:** cobre só os **primeiros 75 s**. O ritmo do corpo do vídeo (os 30 a 90 min seguintes) **não foi medido**.

## Métricas medidas (cortes secos, ffmpeg scene > 0,30)
| Vídeo | Cortes/min | Plano mediano | p25 | Maior plano | 0–15 s | 15–45 s | 45–75 s |
|---|---|---|---|---|---|---|---|
| 2ª Guerra | 12,0 | 4,7 s | 1,5 s | 11,2 s | 2 | 10 | 3 |
| Hitler | 13,6 | 3,5 s | 2,4 s | 11,4 s | 3 | 8 | 6 |
| Roma | 15,2 | 1,3 s | 0,8 s | 30,7 s | 6 | 13 | 0 |

**Leitura:**
- O trecho de 15 a 45 s é um trailer acelerado, com 8 a 13 cortes em 30 s.
- Depois o ritmo cai, e aparecem planos longos de até 30 s. Nesses planos, o movimento dentro da cena substitui o corte.
- O detector só pega cortes secos. Transições com movimento contínuo não são contadas, então o ritmo percebido é maior que o medido.

## Linguagem visual observada
1. **Ilustração vetorial plana** (flat 2D), com paleta de cores dessaturadas e cinematográficas que mudam por cena (azul-noite, sépia, neve, fogo). Não usa foto nem vídeo real.
2. **Personagens ilustrados consistentes:** imperador, gladiadores, soldados, diplomatas no vagão de Compiègne. Mesmo traço do começo ao fim.
3. **Cenários em camadas (parallax):** floresta, montanhas, mar e arena em planos de profundidade, com câmera lateral e zoom lento.
4. **Atmosfera:** brilho de fogo, fumaça, neve caindo, chuva, raios de luz e partículas. É o que dá o ar "premium".
5. **Vinheta de abertura:** viagem no tempo ("250 a.C." → "1969 d.C."), depois o logo com ampulheta e o slogan.
6. **Cartela de título:** título em serifada caixa-alta com espaçamento largo, sobre mapa-múndi sépia antigo com linhas de luz.
7. **Rótulos de lugar e data:** ícone de relógio de bolso + "FLORESTA DE COMPIÈGNE / NORTE DA FRANÇA" ou "11 DE NOVEMBRO DE 1918", no canto inferior esquerdo.
8. **Tipografia cinética sobre fundo preto:** frases de impacto com uma palavra em vermelho ("PRA OUTROS, SANGUE E SOBREVIVÊNCIA").
9. **Números em destaque:** "50.000 PESSOAS" sobreposto à cena. Nomes de personagens como rótulo ("TITO, IMPERADOR DE ROMA", "PRISCO", "VERO").
10. **Mapas:** sépia antigo para o contexto global; mapa político plano com a região destacada ("ROMA", "MAR MEDITERRÂNEO"); transição da cena para o mapa por sobreposição.

## Implicações para o Lacre
- **A qualidade dele vem de consistência de estilo + camadas + atmosfera + tipografia disciplinada**, não de realismo.
- Há três caminhos de estilo para o teste comparativo:
  - **A. Ilustração flat em camadas**, o caminho comprovado. Imagens do Flow num estilo fixo, recorte por chroma, animação de parallax por código. Risco: parecer cópia do Ampulheta. Diferenciar pela paleta (vermelho-cera e papel) e pelo traço.
  - **B. Colagem documental:** fotos de arquivo de domínio público recortadas e animadas, com papel, selos e tipografia. É o conceito "Lacre" de documento aberto (kit de colagem). Mais diferenciado, mas sem prova de mercado nesse formato.
  - **C. Híbrido:** ilustração flat para reencenações + documentos e fotos reais como "provas" + mapas por código.
- **Correção do `style-guide.md`:** a v1 tinha a foto de arquivo como base. Isso é hipótese, não fato. O teste comparativo decide.
- **Evitar no slogan e na marca:** a ideia de "o que o tempo guardou" é o slogan dele ("Histórias que o tempo guardou"). A frase do Lacre ("A história do mundo e do Brasil, aberta do começo ao fim.") não colide.

## Rubrica visual (rascunho v0, para calibrar no teste comparativo)
Nota de 0 a 5 por critério. **Mínimo de 4 em todos** para aprovar um trecho.

| # | Critério | Medição |
|---|---|---|
| V1 | Consistência de estilo (traço, paleta, luz) em todas as cenas | Folha de contato do trecho: nenhuma cena "de outro vídeo" |
| V2 | Profundidade: pelo menos 3 camadas com parallax nas cenas ilustradas | Inspeção por cena no `scenes.json` + quadros |
| V3 | Movimento contínuo: nenhum quadro parado por mais de 2 s | Diferença entre quadros (luma) > limiar a cada 2 s, por script |
| V4 | Ritmo: abertura com ≥ 8 cortes entre 15 e 45 s; corpo com mudança de padrão a cada ≤ 45 s | ffmpeg scene + marcações do roteiro |
| V5 | Tipografia: no máximo 2 famílias, hierarquia fixa (cartela, rótulo, impacto), legível em 360p | Quadros reduzidos a 640x360 |
| V6 | Atmosfera: luz, partículas ou textura em ≥ 70% das cenas | Checklist por cena |
| V7 | Rótulos de contexto (lugar/data/nome) sempre que o roteiro muda de lugar ou tempo | Cruzamento roteiro × cenas |
| V8 | Lado a lado com a referência: não parece amador | Avaliação do usuário (decisiva) |
