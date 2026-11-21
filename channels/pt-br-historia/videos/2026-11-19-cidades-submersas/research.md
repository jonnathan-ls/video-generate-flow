# Pesquisa do vídeo
Coleta: 2026-11-19 (yt-dlp, WebSearch/WebFetch). Material bruto em `research/raw/` (buscas, metadados, legendas, comentários, scripts de estrutura). Learnings aplicados: L01 a L03 não afetam a pesquisa. Múltiplo = views ÷ mediana dos últimos 15 vídeos longos do canal (a mediana inclui o próprio vídeo; valores arredondados pelo yt-dlp). **Breakout** conforme `rubrics/niche-scoring.md`. Cada linha tem a idade em dias: só 7 a 120 dias prova demanda.

## Panorama
Busca em PT por 9 consultas (Sobradinho, Petrolândia/Itaparica, Pilão Arcado/Remanso/Casa Nova/Sento Sé, Xingó, "cidades debaixo da represa") mais 1 em inglês, 30 resultados cada, ordenados por relevância (**não** pelo filtro "este ano" por views: n/v).

| # | Título | Canal | Inscritos | Vídeos | Data | Duração | Views | Múltiplo | Recência / marca | URL |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | A TRAGÉDIA DE ORÓS no CEARÁ: a barragem rompeu sobre sete cidades | Documentário Completo | Planeta de Antes | 1.830 | 25 | 2026-09-07 (73 d) | 55 min | 482.830 | 1157.9× | JANELA · BREAKOUT | https://youtu.be/ZpsxLW7BncY |
| 2 | Sobradinho Não Foi Só uma Represa: Casa Nova e Mais 3 Cidades Sumiram Debaixo d’Água | Brasil de Outrora | 2.030 | 16 | 2026-11-01 (18 d) | 21 min | 211.943 | 68.4× | JANELA · BREAKOUT | https://youtu.be/SKECk2kRT50 |
| 3 | Canudos Não Acabou em 1897: A Cidade Renasceu E Sumiu Debaixo d`Água | Brasil de Outrora | 2.030 | 16 | 2026-10-17 (33 d) | 23 min | 129.381 | 41.7× | JANELA · BREAKOUT | https://youtu.be/hWBEh5Gzab8 |
| 4 | Petrolândia Não Foi Destruída: A Cidade Inteira Ainda Está Debaixo do Lago (1988) | Brasil de Outrora | 2.030 | 16 | 2026-11-04 (15 d) | 22 min | 59.915 | 19.3× | JANELA | https://youtu.be/H08KvONp2tg |
| 5 | A História de Nova Ponte (1987–2026) — Como uma CIDADE INTEIRA Foi Engolida Por Uma Represa | Brasil Esquecido | 15.000 | 157 | 2026-08-26 (85 d) | 20 min | 81.372 | 28.1× | JANELA | https://youtu.be/LlC2p4NY0HY |
| 6 | Assim era Petrolândia Antes da Inundação | 1988 | A Primeira Cidade Submersa Do Brasil | Revivendo Historias | 1.720 | 31 | 2026-05-07 (196 d) | 15 min | 69.040 | 94.6× | ESTENDIDA | https://youtu.be/4EZSAJYKnMk |
| 7 | TUDO ISSO JÁ FOI CIDADE. MAS A ÁGUA COBRIU TUDO! | Eu no Nordeste | 433.000 | 433 | 2023-05-09 (1290 d) | 40 min | 202.796 | 2.0× | ANTIGO | https://youtu.be/pUAlwwfXH5g |
| 8 | SOBRADINHO: O LUGAR ONDE O SERTÃO VIROU MAR E A HISTÓRIA FICOU SUBMERSA | Luzer On The Trip - Edivan e Camila | 251.000 | 230 | 2026-05-18 (185 d) | 32 min | 76.145 | 0.5× | ESTENDIDA | https://youtu.be/DR22zNBSP8A |
| 9 | Como o Governo AFUNDOU Uma Cidade Para Erguer o Maior Açude do Brasil | Urbana | 184.000 | 188 | 2026-08-26 (85 d) | 14 min | 70.915 | 1.4× | JANELA | https://youtu.be/44n7VycDhp8 |
| 10 | O Brasil Afogou 4 Cidades num Lago 3x Maior que a Cidade do Rio | Vestígio | 2.380 | 14 | 2026-10-02 (48 d) | 25 min | 3.410 | 0.3× | JANELA | https://youtu.be/m9NSRPmhOs8 |
| 11 | Como o sertão virou mar: a barragem de Sobradinho e as 4 cidades que foram para o fundo | Construa mundo Brasil | 77 | 74 | 2026-10-29 (21 d) | 14 min | 2.994 | 18.3× | JANELA | https://youtu.be/xLCBw7Tgucw |
| 12 | O Brasil Afogou Cidades Inteiras Para Gerar Energia — e a Seca Devolve | engenharia esquecida | 33 | 7 | 2026-11-01 (18 d) | 13 min | 2.724 | 2.7× | JANELA | https://youtu.be/-K1PDfVnQdI |

**Leitura do panorama (números do arquivo bruto):**
- Os três breakouts do tema exato são todos do **Brasil de Outrora** (2.030 inscritos): 68,4×, 41,7× e 19,3×, em 18, 33 e 15 dias. O breakout de maior múltiplo (Orós, 1.158×) é de tema vizinho: rompimento de barragem, não alagamento planejado.
- **Saturação:** 24 vídeos longos de 7 a 120 dias sobre exatamente este tema, de cerca de 23 canais. Fora o Brasil de Outrora, a mediana desses vídeos é de 590 views e o máximo é 3.410. Pelo menos 9 saíram nos 18 dias depois do primeiro breakout. A demanda existe, mas quase toda ficou com um canal; imitar não funcionou para os outros.
- **Autocomplete:** "cidades submersas" sugere "no brasil" e "no mundo"; "petrolandia cidade" sugere "submersa mergulho", "submersa" e "velha"; "sobradinho cidades" traz o Sobradinho do Distrito Federal (ambiguidade a evitar no título).
- Concorrente estabelecido (ANTIGO, 1.290 dias, 157 views/dia): Eu no Nordeste, vlog. Não conta como demanda.
- Snapshots gravados em `data/snapshots/videos.jsonl` com a tag I01 (14 vídeos; 3 IDs podem ter linha duplicada). O crescimento real só se mede a partir da próxima coleta.

## Referências estruturais
Heatmap só existe para as referências 3 a 5; para as duas do Brasil de Outrora o YouTube não o fornece (n/v), então a estrutura vem da transcrição por script (`research/raw/structure.py`).

1. **SKECk2kRT50** (https://youtu.be/SKECk2kRT50; 21:03; breakout de canal pequeno). Gancho: cena fria com lugar e data, ruína que a seca revela; pedido de inscrição aos 2:42. 5 atos: abertura 0 a 2:40 (13%); a cidade antes 2:40 a 7:00 (21%); promessas do projeto 7 a 10 (14%); a mudança e a água subindo 10 a 17 (33%); inauguração, números e retorno à seca de 2015, 17 a 21 (19%). Payoff (tamanho do lago e as 4 sedes) aos ~17:25; abertura fechada aos ~20. ~150 palavras/min. Título de 84 caracteres, "X Não Foi Só uma Y: ...".
2. **hWBEh5Gzab8** (https://youtu.be/hWBEh5Gzab8; 23:01; breakout). Mesma fórmula: cena fria com ruína que emerge; nome do lugar aos ~1:00 e volta no tempo aos ~1:25. 6 atos: abertura 8%, guerra 9%, renascimento 22%, plano do açude 13%, últimos dias e a água 30%, apagamento e hoje 17%. ~122 palavras/min. Título de 68 caracteres, "X Não Acabou em ANO: ...".
3. **ZpsxLW7BncY** (https://youtu.be/ZpsxLW7BncY; 55:20; breakout de tema vizinho, com heatmap). Gancho com data exata e "a parede cede" em menos de 40 s. 6 atos: abertura 2%, contexto da seca 20%, a crise 36%, o rompimento 11%, consequências e indenizações 13%, legado 18%. Heatmap: picos em 12:43 (1,0, precedente histórico), 28:13, 33:12–33:45 (o rompimento) e 41:30 (0,87, crítica ao número de mortos); vales em 49–54 min (0,00 a 0,03); por decil sobe até 0,35 aos 60–70% e cai a 0,07 no último décimo. Título de 89 caracteres, "A TRAGÉDIA DE X: ... | Documentário".
4. **pUAlwwfXH5g** (https://youtu.be/pUAlwwfXH5g; 39:40; líder estabelecido, vlog com rosto). Não é modelo de formato. Heatmap: pico aos 9:07–10:19 (0,99) no único trecho histórico; cai para 0,09 no fim. Serve de prova de que a parte histórica é o que mais se revê.
5. **DR22zNBSP8A** (https://youtu.be/DR22zNBSP8A; 31:52; vlog, ESTENDIDA). ~210 palavras/min; picos aos 14:39, 25:10 e 9:33; vale aos 28–30 min (~0).
- **Estrangeiro:** não analisado. "Why England Erased This Welsh Village" (C3ZDSbxhBKI, 522 mil views, 40 min) apareceu na busca em inglês, mas o metadado foi bloqueado pela verificação anti-bot (idade, heatmap e legendas n/v).

## Modelo identificado
Padrão comum das referências 1, 2, 3 e do vídeo H08KvONp2tg (breakouts de canais pequenos); os números vêm do bloco acima.
| Aspecto | Padrão (com números) |
|---|---|
| Duração | 21 a 23 min nos breakouts do tema exato (o de 55 min é tema vizinho) |
| Atos | 5 a 6; o bloco "remoção e água subindo" ocupa 30 a 36%; o fecho com o "hoje" ocupa 17 a 19% |
| Abertura | 3 de 3: cena fria com lugar e data, uma imagem concreta (ruína que reaparece ou parede cedendo), volta no tempo antes dos 2:45 |
| Ritmo | 120 a 155 palavras/min; sem capítulos; picos de retenção em trechos de evidência ou documento |
| Título | 68 a 89 caracteres; 3 de 4 negam um mito seguido de dois-pontos e revelação (**só a estrutura; as palavras são nossas, similaridade < 70%**) |
| Thumbnail | cena ampla fotorrealista de ruína em leito seco ou rachado, sem rosto, nome do lugar no alto, frase de 4 a 6 palavras embaixo; Nova Ponte usa antes/depois com anos |
| Narrativa | micro-história de um lugar e de pessoas, em ordem cronológica, com a abertura retomada no fim |

## Lacunas e ângulo
- **Omissões das referências (contagem na transcrição):** SKECk2kRT50 cita Remanso, Sento Sé e Pilão Arcado só aos 17 e aos 20 min; "CHESF" aparece 0 vezes e "indenização" 1 vez. Nenhuma referência trata de Itaparica junto com Sobradinho, nem cita Xingó, Canindé, Piranhas, Rodelas ou Itacuruba. Nenhuma compara como os atingidos se organizaram.
- **Perguntas e relatos nos comentários (relato de leitor, não é fato):** uma mãe que teria morrido esperando indenização; "3 opções" dadas às famílias (indenização, Serra do Ramalho ou cidade nova); "em Itaparica o povo se organizou, ao contrário de Sobradinho"; Sento Sé reconstruída a cerca de 100 km; saudade de Rodelas; pedidos para mostrar Remanso e Sento Sé.
- **Diferenciais verificáveis (todos com fonte do dossiê):**
  1. **Sobradinho e Itaparica lado a lado, com o que mudou.** Em Itaparica o sindicato ocupou o canteiro por 6 dias e assinou o Acordo de 06/12/1986 (fontes 4, 8, 11); mesmo assim a irrigação só veio em 1993 e o reassentamento custou 4× mais (fonte 9, TCU). Nenhuma referência cobre isso.
  2. **Os documentos da indenização.** Só 13,9% das famílias tinham título (fonte 1); em abr/1975 só 1.426 de 5.837 famílias poderiam ficar na borda do lago (fontes do dossiê F1/F6, linha do tempo); em 26/08/2015 cerca de 230 famílias ainda cobravam indenização no Senado (fonte 3). As referências quase não falam de indenização.
  3. **Os números contestados, ditos às claras.** Sobradinho: entre 60 mil e 72 mil pessoas nas fontes mais bem documentadas (fontes 1 e 2), enquanto "12 mil" circula sem lastro (fontes 3 e 14); Itaparica: cerca de 40 mil pessoas, e "10,5 mil" são famílias (fontes 6, 7, 9).
  4. **Nem toda "cidade submersa" é represa:** Cabeço (SE) sumiu pela erosão e pelo sal depois de Xingó (fonte 14). Serve de contraponto, não de tema central.
- **Conexão com o Brasil:** o tema inteiro é brasileiro (pilar Brasil do canal), com o contraste Nordeste x política de energia nos anos 1970 e 1980.
- **Ângulo recomendado (decisão do usuário na embalagem, R7):** a comparação "Sobradinho calou, Itaparica ocupou o canteiro": o que cada grupo de atingidos conseguiu e o que ficou por cumprir. Alternativas: (B) só Sobradinho, com foco nos documentos da indenização; (C) as 4 cidades de Sobradinho vistas pelas pessoas, como o breakout, mas com os documentos. A A e a B têm diferencial real; a C repete o que o Brasil de Outrora já fez.

## Dossiê de fontes
Acesso: 2026-11-19. Nenhum vídeo é fonte de fato. Trechos e detalhes em `research/raw/fontes.md`.
| # | Fonte (URL) | Tipo | O que sustenta | Confiabilidade | Controvérsia |
|---|---|---|---|---|---|
| 1 | https://memolutas.univasf.edu.br/wp-content/uploads/2022/04/A-construcao-e-as-consequencias-da-barragem-de-Sobradinho.pdf | acadêmica (Univasf; baseada em Sigaud 1986 e Siqueira 1992) | 4 sedes cobertas (Casa Nova, Remanso, Pilão Arcado, Sento Sé); ~72 mil expulsos, 80% camponeses; enchimento total no início de dez/1977; inauguração mar/1978; de 8.619 famílias rurais, 31% na borda do lago, 11% nas novas sedes, 20% na caatinga; 13,9% tinham título | alta (cita páginas e documentos) | o poder público contava 60 mil "transferidos" |
| 2 | https://raizes.revistas.ufcg.edu.br/index.php/raizes/article/download/402/385/750 | acadêmica (Raízes, 2014) | lago de 4.214 km²; "mais de 72 mil" transferidos; lago concluído em jan/1978; usina gerando em 1979 | média-alta | fim do enchimento: dez/1977 x jan/1978 |
| 3 | https://legis.senado.leg.br/escriba-servicosweb/reuniao/pdf/3776 | primária (ata do Senado, 26/08/2015) | cerca de 230 famílias de Sobradinho sem indenização desde 1976; autos sumiram do cartório e foram restaurados | alta como registro; as falas são declarações | um orador diz "12 mil pessoas", de memória |
| 4 | https://fmreview.org/horgan/ | acadêmica (Forced Migration Review, c. 1998) | Itaparica: ~40 mil previstos; acordo após ocupação de 6 dias; Banco Mundial US$ 132 mi (1987); comportas fechadas fev/1988; irrigação só em 1993 | média-alta | diz 120 mil deslocados em Sobradinho, sem fonte |
| 5 | https://periodicos.ufrn.br/revprojetar/article/download/19875/12813/67600 | acadêmica | Itacuruba perdeu 27,21% do território; 3 sedes (Petrolândia, Itacuruba, Rodelas) e Barra do Tarrachil reassentadas; 35.905 habitantes (Chesf 1986); igreja de 1889 | alta | o "63% com depressão" (CREMEPE 2007) precisa checar a nota |
| 6 | https://periodicos.fgv.br/rap/article/download/9404/8468/21235 | acadêmica/primária (RAP 1988, cadastro Chesf de dez/1986) | 39.240 pessoas (7.848 famílias): 12.630 urbanas, 26.610 rurais; 834 km²; obra US$ 1,4 bi, reassentamento ~US$ 300 mi | alta (cadastro contemporâneo) | é previsão, não contagem final |
| 7 | https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/cdhm/noticias/situacao-das-populacoes-atingidas-pelo-sistema-itaparica-sera-discutida-na-cdhm | primária (Agência Câmara, 12/11/2019) | usina inaugurada em jun/1988; 83.400 ha; ~10,5 mil famílias (4,6 mil urbanas, 5,9 mil rurais, 200 Tuxá); itens do acordo de 1986 não cumpridos | alta | 83.400 ha x 828 km² da Chesf (URL abreviada pelo agente; reconfirmar na citação) |
| 8 | https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/cdhm/eventos-2023/ContextualizaoJosePoloSindicalPE_BA.pdf | primária (documento do movimento sindical) | acordo de 1986: posse até abr/1987, reassentamento ago/1987 a jul/1988, lotes de 1,5 a 6 ha; produção só por volta de 1992 | média (fala de uma parte) | versão da Chesf n/v (URL abreviada pelo agente; reconfirmar) |
| 9 | https://ipsnews.net/portuguese/2014/01/ (artigo "desenvolvimento após devastação causada por represa no Brasil") | secundária (IPS, 2014) | oficial 10.500 "deslocados" x ~80 mil (Parry Scott); 6.187 lotes prometidos; 4.910 famílias em 9 projetos; irrigação em 1993; TCU: custo 4× maior | média | confunde famílias e pessoas (URL completa n/v; reconfirmar) |
| 10 | https://revistas.ufpr.br/made/article/download/73278/42383/310055 | acadêmica (2020) | Petrolândia inundada em 1988; ~10.400 famílias, ~40 mil pessoas; procissão de mudança em 06/03/1988 | média-alta | área 834 x 828 km² |
| 11 | https://ufs.emnuvens.com.br/pontadelanca/article/download/14445/11451/44170 e https://periodicos.ufpe.br/revistas/ruralurbano/article/view/262048 | acadêmica | Acordo de 06/12/1986 em Petrolândia; livreto oficial "Mudar para Melhor" omite o conflito | média-alta | n/v |
| 12 | https://brasil.justia.com/nacionales/decretos/93-205-de-2-9-86/gdoc e https://brasil.justia.com/nacionales/decretos/93-664-de-5-12-86/gdoc | primária (decretos) | 02/09/1986: desapropriação para o reservatório de Itaparica; 05/12/1986: terras para irrigação e reassentamento | alta, mas só as ementas foram lidas | área e municípios n/v |
| 13 | https://agenciabrasil.ebc.com.br/geral/noticia/2015-12/reservatorio-de-sobradinho-chega-ao-mais-baixo-nivel-em-quase-40-anos | secundária | em 23/12/2015 Sobradinho tinha 1,98% (cota 380,9 m); 4 cidades cobertas | alta | o texto não descreve ruínas |
| 14 | https://brasildefato.com.br/2024/12/16/a-luta-por-reparacao-de-povoado-que-sumiu-do-mapa-no-brasil/ | secundária | Cabeço (SE) sumiu pela erosão e pelo sal na foz após Xingó; 2022 Chesf responsabilizada; acordo de mai/2024, R$ 40 mi | média | traz "12 mil" para Sobradinho, contradiz as fontes 1 e 2 |
| 15 | https://ri.ufs.br/bitstream/riufs/10591/2/Clarissa_Teixeira_Muniz.pdf | acadêmica (TCC 2018) | Moxotó (1977) cobriu a sede de Glória/BA; Nova Glória; indenização "injusta" | média (graduação) | n/v |
| 16 | https://commons.wikimedia.org/wiki/Category:Sobradinho_Dam | imagens | Correio da Manhã AN 277 (Arquivo Nacional, 23/04/1961): domínio público, atribuir "Arquivo Nacional"; Seca em Sobradinho 01 (Agência Brasil, dez/2015): CC BY 3.0 BR, atribuição obrigatória; demais arquivos: licença n/v | alta na licença | n/v |

**Pendências do dossiê (n/v):** valores em reais/cruzeiros das indenizações; texto integral dos decretos; Xingó (Canindé/Piranhas), Tucuruí e Boa Esperança/Guadalupe; igreja submersa de Petrolândia (só em fontes fracas) e tombamento (Fundarpe); Pilão Arcado possivelmente nunca inundou por inteiro; projeto P006442 do Banco Mundial (a página não abriu).

**Linha do tempo verificada (datas das fontes acima):** 1961 estudo preliminar de Sobradinho; jul/1971 anúncio; jun/1973 início das obras do reservatório; 12/03/1974 Decreto-Lei 1.316; abr/1975 só 1.426 de 5.837 famílias poderiam ficar na borda; 1976 primeiras remoções e dez/1976 enchimento parcial; dez/1977 represamento total; mar/1978 inauguração; 1979 geração e início da obra de Itaparica; 02/09/1986 e 05/12/1986 decretos; 06/12/1986 Acordo de Itaparica após 6 dias de ocupação; fev a mar/1988 comportas fechadas e mudança de Petrolândia (06/03/1988); jun/1988 inauguração; 1993 primeiras plantações irrigadas; 26/08/2015 Senado: 230 famílias sem indenização; 23/12/2015 Sobradinho a 1,98%; mai/2024 acordo do Cabeço.

## Hipóteses de embalagem
Cinco promessas candidatas. As palavras dos títulos saem na embalagem (similaridade < 70% com os títulos do panorama).
| # | Promessa | Emoção/desejo | Apoio (outlier) |
|---|---|---|---|
| 1 | Duas represas, duas respostas: por que em Itaparica os atingidos conseguiram o que Sobradinho nunca teve | injustiça e curiosidade ("o que deu certo?") | padrão de negação de mito + revelação (refs 1, 2); SKECk2kRT50 68,4× |
| 2 | A indenização que nunca chegou: o que os documentos mostram (230 famílias ainda cobravam em 2015) | indignação, descoberta de bastidor | picos de retenção em documentos e números (ref 3, 12:43 e 41:30) |
| 3 | As quatro cidades de Sobradinho vistas por quem teve de sair | empatia, nostalgia | breakouts 1, 2 e H08KvONp2tg; **tema já ocupado** (risco de repetir) |
| 4 | Quantas pessoas foram expulsas? Os números que não batem (de 12 mil a 120 mil) | curiosidade, "a verdade por trás do número" | o pico em 41:30 da ref 3 é a crítica ao número de mortos |
| 5 | A água baixa e a cidade reaparece: o que a seca de 2015 devolveu | choque visual, nostalgia | gancho "ruína que a seca revela" em 3 de 3 referências |

## Riscos
- **Política/sensível:** tema com pessoas reais atingidas e disputa de culpa entre Chesf e governo; usar linguagem de fonte ("segundo a ata do Senado"), nada de culpa sem documento. Evitar teorias sobre mortes ou números sem fonte.
- **Pessoas vivas:** relatos de comentários não entram como fato (são relato de leitor). Sem imagens de pessoas identificáveis geradas por IA; sem nomes de pessoas vivas fora dos documentos públicos.
- **Direitos de imagem:** só acervos públicos e licenças livres (Arquivo Nacional, Wikimedia Commons com CC e atribuição). Imagens de Chesf, IBGE e Petrolândia: licença n/v. Marcar "conteúdo sintético" (R14) em qualquer reconstrução que pareça foto real.
- **Saturação:** 24 vídeos no tema em 120 dias, 9 nos 18 dias após o breakout; um canal captura quase toda a demanda. Só um ângulo com diferencial (itens 1 e 2 acima) justifica entrar.
- **Desinformação:** números contestados (60 a 72 mil, 12 mil, 120 mil em Sobradinho; 10,5 mil famílias x ~40 mil pessoas em Itaparica) exigem "entre X e Y" e a fonte; três URLs do dossiê (7, 8 e 9) foram abreviadas pelo agente e precisam ser reconfirmadas antes de entrar no roteiro.
- **Ambiguidade de título:** "Sobradinho" sozinho remete ao Sobradinho do DF.
- **Dados voláteis:** canal-referência minúsculo; o crescimento real só será medido a partir da próxima coleta de snapshots.
