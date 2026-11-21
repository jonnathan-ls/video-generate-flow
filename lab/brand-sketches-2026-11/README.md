# Esboços de logotipo do Lacre (2026-11-19)

Teste de direções de marca para o usuário escolher. **Esboços em imagem (raster), gerados no Google Flow; a versão final é refeita em código (vetorial).** Mídia em `media/lab/brand-sketches-2026-11/` (`folha-01-16.jpg` é a folha numerada; `original/` tem os 16 arquivos). 0 créditos (plano Plus), Nano Banana 2.1, formato 1:1.

## As 8 direções (cada uma com 2 variações)
| Direção | Números | Ideia |
|---|---|---|
| Chave com selo de cera | 1, 6 | "Abrir a história guardada" |
| Monograma minimalista | 2, 7 | "L" geométrico em círculo vermelho; o mais legível pequeno |
| Carta com lacre rompido + mapa | 3, 12 | O lacre se abre e revela o mundo |
| Lockup horizontal (selo + nome + frase) | 4, 5 | Selo + LACRE + "HISTÓRIA DO MUNDO E DO BRASIL" |
| Selo com rosa dos ventos e globo | 8, 9 | Mundo + Brasil dentro do selo |
| Escudo heráldico com louros e coluna | 10, 11 | Clássico, "história antiga" |
| Wordmark tipográfico | 13, 14 | Só o nome, com um pequeno selo como ornamento |
| Selo de cera com "L" e fita | 15, 16 | O conceito original, mais próximo do avatar atual |

## Ressalvas (para a decisão)
- **O selo de cera é um motivo muito comum.** Isso dá leitura imediata ("Lacre") e ajuda a lembrar, mas dilui a exclusividade. Uma pesquisa de canais e marcas parecidas deve ser feita antes de fixar o logotipo.
- Os esboços são **imagens de IA**: servem para escolher a direção, não como arquivo final. O texto saiu correto neste teste, mas precisa de conferência.
- Algumas variações têm muito detalhe (escudo 10/11, selo com globo 8/9) e **não resistem a 98 px**; o monograma (2/7) e o selo simples (15/16) resistem.
- Nada foi criado no YouTube.

## Prompts
Prefixo comum: "Logo concept sketch for a history documentary YouTube channel named LACRE…", paleta limitada (vermelho-cera, pergaminho, latão) sobre fundo carvão, "readable at 98 pixels", sem texto além do especificado. Os 8 prompts completos estão no histórico do projeto "nov. 19 - 09:54" no Flow.

- 2026-11-19: o envio de imagens por arquivo não apareceu no chat do usuário (Remote Control) mesmo com "entregue". Passou a ser usada uma página publicada (artefato) para mostrar galerias de imagens e coletar escolhas.

## Rodada 2 (a partir dos favoritos do usuário: 5, 9, 12, 14, 15)
Escolhas da rodada 1: **5** (lockup horizontal), **9** (selo com rosa dos ventos e globo), **12** (carta com lacre rompido e mapa), **14** (wordmark com selo) e **15** (selo com L e fita). O usuário pediu mais exemplos para avaliar.

| Direção da rodada 2 | Números | Derivada de |
|---|---|---|
| Selo com globo simplificado e Brasil em destaque | 29, 30 | 9 |
| Lockup horizontal com L e rosa dos ventos | 27, 28 | 5 e 9 |
| Lockup vertical (selo com fita sobre o nome) | 31, 32 | 5 e 15 |
| Selo que se abre revelando o mapa | 25, 26 | 12 |
| Pergaminho selado com mapa | 21, 22 | 12 |
| Wordmark com o selo no "A" | 23, 24 | 14 |
| Selo L com anel duplo e louros | 19, 20 | 15 |
| Lockup com selo, bússola e linhas de construção | 17, 18 | 5 e 14 |

Mídia: `media/lab/brand-sketches-2026-11/folha-17-32.jpg` e `original/17..32.jpg`. Todos com 0 créditos no Flow. Nenhum arquivo repetiu os da rodada 1 (conferido por checksum).

## Rodada 3: do esboço ao vetor (favoritos: 5, 9, 12, 14, 15, 18, 30, 31, 32)
Os nove favoritos formam três famílias, refeitas em código (`studio/remotion/src/brand/Logos.tsx`, componentes `MarkWorld`, `MarkL`, `MarkMono`, `Lockup`):
| Família | Favoritos | Ideia | Avatar | Assinatura |
|---|---|---|---|---|
| **Mundo** | 9, 30, 18 | Selo com rosa dos ventos e globo; Brasil em ouro (país 076 de `world-atlas`, domínio público) | Selo | Horizontal |
| **Selo L** | 15, 31, 32 | Selo com "L" dourado, anel duplo e fita | Selo com fita | Vertical |
| **Nome** | 5, 14 | LACRE em serifa com selo "L" pequeno de ornamento | Monograma "L" | Centrada |

- O **12** (carta que se abre) fica reservado para a **vinheta animada de abertura** dos vídeos (o selo se rompe e revela o mapa), com o selo da família escolhida.
- Peças renderizadas em `media/pt-br-historia/brand/refinado/` (avatar 800×800, assinatura 1600×700, banner 2560×1440, por família).
- **Erros no caminho (corrigidos):** (1) avatares e assinaturas saíram vazios: o fundo posicionado pintava por cima do conteúdo não posicionado (CSS); (2) a assinatura vertical encostava na borda inferior da área segura do banner; foi reduzida e conferida desenhando o retângulo 1546×423 sobre o banner. Um teste de "área segura" por `cropdetect` que escrevi primeiro não media nada (saída suprimida) e foi descartado; a conferência é visual.
- Página de comparação publicada como artefato (privado).

## Rodada 4: selo real (o usuário rejeitou as versões em código)
**Motivo da rejeição (palavras do usuário):** as famílias desenhadas em código "não têm cara de profissional" e o selo "parece uma borra, uma mancha"; ele quer a qualidade realista de lacre, com textura e relevo, como nos esboços do Flow.
**Decisão:** o selo passa a ser **imagem realista gerada no Flow, recortada** (cera com relevo, brilho e textura). O nome, a frase e o banner continuam em código, para o texto sair nítido e sem erros. A versão do selo em código foi descartada.
- 4 prompts de selo isolado em fundo verde (#00FF00) × 2 variações = 8 selos 1024×1024. Recorte por `colorkey` + `despill`, conferido sobre fundo escuro **e claro** (sem franja verde). Arquivos: `media/pt-br-historia/brand/selos/selo-1..8.png` (recorte) e `lab/brand-sketches-2026-11/seals-raw/` (originais).
- Desenhos: 1–2 "L" com anel duplo; 3–4 rosa dos ventos com "L"; 5–6 rosa dos ventos com globo em relevo; 7–8 "L" ornamentado com fita.
- **Limite do material:** a cera real é de uma cor só, então o Brasil não pode ser destacado em ouro como na versão em código.
- Famílias montadas (`studio/remotion/src/brand/RealLogos.tsx`): **Mundo** (selo 5), **Selo L** (selo 7) e **Bússola e L** (selo 3). Peças em `media/pt-br-historia/brand/real/` (avatar 800×800, assinatura 1600×700, banner 2560×1440).
- **Verificação:** o conteúdo de cada banner foi **medido** contra a área segura 1546×423 (dentro nas três). A assinatura vertical foi reduzida duas vezes (0,7 estourava a área; 0,6 ficava pequena; 0,63 coube).
- Esses `Logos.tsx` (selo em código) ficam como histórico; não usar em produção.
