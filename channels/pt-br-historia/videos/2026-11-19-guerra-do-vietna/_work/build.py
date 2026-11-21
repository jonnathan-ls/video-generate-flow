import re,datetime
from scenes import SC
WPM=150
SRC={
"CS25":("https://countrystudies.us/vietnam/25.htm","Country Study (Library of Congress), cap. 25: em agosto de 1955 Diem recusa as conversas com o Norte previstas para preparar as eleições de 1956. LIDO pelo revisor."),
"CABLE243":("https://history.state.gov/historicaldocuments/frus1961-63v03/d281","FRUS 1961-63 v. III, doc. 281: Telegrama 243, Washington, 24/08/1963, para o embaixador Lodge: se Diem não afastar Nhu, os EUA aceitam que não podem mais apoiá-lo; planejar a substituição se necessário. LIDO pelo revisor. NARA chama de 'green light'."),
"NIXON73":("https://www.presidency.ucsb.edu/documents/address-the-nation-about-vietnam-and-domestic-problems","Discurso de Nixon, 29/03/1973: 'no American military forces are in Vietnam'. LIDO pelo revisor."),
"CS31":("https://countrystudies.us/vietnam/31.htm","Country Study cap. 31: Duong Van Minh 'ordered ARVN troops to lay down their arms'; presidente desde 28/04/1975. LIDO pelo revisor."),
"FRUS225":("https://history.state.gov/historicaldocuments/frus1964-68v31/d225","Memorando de Bundy a Johnson, Washington, 31/12/1965: Gordon, na reunião em que falou do empréstimo de US$ 150 milhões, 'made a very strong pitch on the troops'; Castelo Branco prometeu 'prayerful consideration', lembrou que a Constituição exige aprovação do Congresso para tropas no exterior e que o Congresso só voltaria em março; Bundy: 'in time a Branco contribution in some form can be worked out'; relato da reunião no telegrama 1456 do Rio, 17/12; nota 3 dos editores: o Brasil 'never sent troops or military supplies to Vietnam', forneceu café e suprimentos médicos (cita Department of the Army). LIDO nesta sessão."),
"UCSB":("https://www.presidency.ucsb.edu/documents/exchange-messages-with-the-president-brazil","Carta de Castelo Branco, 11/08/1964 (uso da força pelo Vietnã do Norte contrário à Carta da ONU; instruiu o representante no Conselho de Segurança); carta de Johnson, 25/08/1964 (agradece; 'no wider war'). LIDO."),
"FRUS32":("https://history.state.gov/historicaldocuments/frus1964-68v32/d85","Nota editorial 85: Décima Reunião de Consulta da OEA, 22/05/1965, resolução sobre a Força Interamericana na República Dominicana; pediu que o Brasil designasse o comandante; General Hugo Panasco Alvim, do Brasil, designado; voto 14 a 4 (2 abstenções). LIDO. Não traz número de tropas."),
"MARSON":("https://www.teses.usp.br/teses/disponiveis/101/101131/tde-31032022-163103/publico/Ana_Carolina_Araujo_Marson_VCorrigida.pdf","Tese da USP (Marson, 2022), p. 44: segundo o embaixador Magalhães, Castelo Branco pediu autorização ao Congresso; depois dela, 'um contingente de 1.250 militares brasileiros foi enviado' a Santo Domingo. LIDO via pdftotext. É o relato do embaixador citado pela tese; atribuir."),
"NARA12":("https://www.archives.gov/exhibits/remembering-vietnam-online-exhibit-episodes-1-4","Dien Bien Phu 13/03 a 07/05/1954; Diem derrubado 01/11/1963; MACV criado 08/02/1962; Cabo 243 em 23/08/1963; raides aos pagodes 21/08/1963; Tonkin 02, 04 ('alleged') e 07/08/1964. LIDO (dossiê). A página se contradiz sobre a morte de Diem (02/11 x 23/11)."),
"NARA13":("https://www.archives.gov/exhibits/remembering-vietnam-online-exhibit-episodes-5-8","Rolling Thunder 02/03/1965; 3.500 fuzileiros em Da Nang 08/03/1965; pico de 543.000 em abr/1969; Tet começa 31/01/1968 (~70.000 soldados, mais de 100 cidades); Cronkite 27/02/1968 ('mired in a stalemate'); LBJ 31/03/1968. LIDO (dossiê)."),
"RT":("https://history.state.gov/milestones/1961-1968/gulf-of-tonkin","Office of the Historian: Rolling Thunder 'began on February 13, 1965'. Conflito de data com o NARA (02/03/1965): o roteiro cita as duas."),
"GEN":("https://avalon.law.yale.edu/20th_century/inch001.asp","Acordo de Cessar-Fogo, Genebra, 20/07/1954: linha 'provisional military demarcation line'; zona desmilitarizada até 5 km; art. 14(a) administração 'pending the general elections which will bring about the unification of Viet-Nam'; cessar-fogo Norte 27/07, Centro 01/08, Sul 11/08; comissão Canadá, Índia, Polônia (art. 34). LIDO."),
"STATE":("https://history.state.gov/milestones/1961-1968/gulf-of-tonkin","Ataques de 2 e 4/08/1964 a Maddox e Turner Joy; 'Doubts later emerged' sobre o 2º; Resolução 07/08/1964; Senado 2 contra, Câmara unânime. LIDO."),
"TON1":("https://avalon.law.yale.edu/20th_century/tonkin-g.asp","Resolução conjunta de 07/08/1964: 'take all necessary measures to repel any armed attack'; Sec. 3: expira quando o Presidente determinar que a paz e a segurança da área estão razoavelmente asseguradas, ou antes por resolução concorrente do Congresso. LIDO."),
"CFR":("https://www.cfr.org/article/the-1964-gulf-of-tonkin-resolution","Câmara 416 x 0, Senado 88 x 2; 'it is clear now that it didn't' (2º ataque). LIDO."),
"NSA":("https://nsarchive2.gwu.edu/NSAEBB/NSAEBB132/press20051201.htm","Estudo de Robert Hanyok, liberado 01/12/2005: não houve 2º ataque em 04/08/1964; 'the overwhelming body of reports, if used, would have told the story that no attack occurred'; sem prova de acobertamento combinado, mas 'active effort to make SIGINT fit the claim'. LIDO."),
"HO45":("https://countrystudies.us/vietnam/22.htm","02/09/1945, Ba Dinh: Ho Chi Minh lê a Declaração de Independência (~500.000, estimativa), texto inspirado nas declarações americana e francesa; britânicos em set/1945; França toma Saigon; ~15.000 soldados franceses no Tonkin em mar/1946. LIDO (espelho do Country Study, Library of Congress)."),
"FR46":("https://countrystudies.us/vietnam/23.htm","Em 19/12/1946 o Viet Minh ataca a usina elétrica de Hanói e outras instalações francesas; 'full-scale war'. LIDO."),
"AID":("https://millercenter.org/president/eisenhower/foreign-affairs","Em 1954, o governo Eisenhower cobria 'over three-quarters' dos custos da guerra francesa. LIDO. Os US$ 10 milhões de 1950 e os 78% vêm dos Documentos do Pentágono (AID2)."),
"AID2":("https://en.wikisource.org/wiki/Page:Pentagon-Papers-Part_II.djvu/43","Documentos do Pentágono, parte II: ajuda 'began modestly with $10 million in 1950'; 78% do custo da guerra francesa em 1954. LIDO pelo revisor (transcrição do NARA). Entrevista de Eisenhower de 07/04/1954 com o 'falling domino principle': https://presidency.ucsb.edu/documents/the-presidents-news-conference-361 (LIDO)."),
"MAAG":("https://en.wikisource.org/wiki/Page:Pentagon-Papers-Part_IV._A._4.djvu/56","MAAG com 685 integrantes no Vietnã do Sul em 05/1961. LIDO (transcrição)."),
"MAAG63":("https://millercenter.org/president/kennedy/foreign-affairs","Ao fim do governo Kennedy, 16.000 assessores militares americanos no Vietnã. LIDO (arredondado)."),
"BUD1":("https://www.cfr.org/article/the-self-immolation-of-thich-quang-duc","Maio/1963: polícia mata nove em Hue em ato contra a proibição da bandeira budista; 11/06/1963: Thich Quang Duc se imola em Saigon. LIDO."),
"BUD2":("https://www.worldpressphoto.org/collection/photo-contest/1963/malcolm-browne/1","Foto de Malcolm Browne, Foto do Ano no World Press Photo. LIDO (conferir URL exata no pacote fatos_extras.md)."),
"DIEM":("https://millercenter.org/kennedy-commitment","Crise budista, lei marcial de 21/08 e raides aos pagodes convenceram autoridades do segundo escalão do governo Kennedy e do Departamento de Estado de que Diem tinha de sair; Diem morto em golpe em 01/11/1963. LIDO."),
"JULY65":("https://millercenter.org/the-presidency/presidential-speeches/july-28-1965-press-conference","28/07/1965: forças de 75.000 para 125.000; convocação de 17.000 para 35.000 por mês. LIDO."),
"GALLUP":("https://news.gallup.com/poll/2299/americans-look-back-vietnam-war.aspx","Série 'foi um erro': ago-set/1965 24%; out/1967 46%; dez/1967 45%; 22-27/02/1968 49%; 7-12/08/1968 53%; jan/1973 60%; nov/2000 69%. Aviso: a redação mudou durante a guerra. LIDO (revisor reconferiu)."),
"IOM":("https://www.nationalacademies.org/read/2141/chapter/4","Ranch Hand 1962-1971: quase 19 milhões de galões de herbicidas; ao menos 11 milhões de Agente Laranja; ~3,6 milhões de acres pulverizados ao menos uma vez. LIDO."),
"WIL":("https://www.wilsoncenter.org/publication/north-vietnams-talk-fight-strategy-and-the-1968-peace-negotiations-the-united-states","Le Duan, dez/1965: negociar só depois de 'greater and more complete victories on the battlefield'; texto de Merle Pribbenow com documentos do Partido. LIDO."),
"HUE":("https://history.state.gov/milestones/1961-1968/tet","The first phase of the Tet Offensive began on January 30 and 31, 1968; ataques a Hue e Saigon com forte impacto psicológico. LIDO pelo revisor."),
"KHE1":("https://encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/khe-sanh-siege","Cerco desde 20/21/01/1968; Operação Pegasus (~30.000) faz contato em 07/04/1968; EUA deixam a base em 06/07/1968; 'seventy-eight day siege'. LIDO (confiabilidade média)."),
"KHE2":("https://historynet.com/breaking-the-siege-at-khe-sanh/","Pegasus: alívio oficial em 08/04/1968 às 08h; 77 dias de resistência. LIDO (média)."),
"PBS":("https://www.pbs.org/wgbh/americanexperience/films/mylai","My Lai 16/03/1968; 'between 347 and 504 civilians'; Calley, prisão perpétua, cerca de 4 meses em Leavenworth, ficou em casa; Peers: 'a tragedy of major proportions'. LIDO."),
"NARACAS":("https://www.archives.gov/research/military/vietnam-war/casualty-statistics","58.220 registros de mortos militares dos EUA; 40.934 'killed in action'; 47.434 hostis e 10.786 não hostis; 'informational purposes only, not official statistics'; base de 29/04/2008. LIDO."),
"MARCH67":("https://www.thenation.com/article/archive/october-21-1967-100000-march-against-the-vietnam-war","21/10/1967: marcha de 100.000 contra a guerra, protesto no Pentágono. LIDO (média; público no Pentágono n/v)."),
"DRAFT":("https://ebsco.com/research-starters/military-history-and-science/draft-lottery-1969","Primeiro sorteio em 01/12/1969, nascidos em 1944-1950, ordem de convocação de 1970. LIDO (média-alta)."),
"END":("https://history.state.gov/milestones/1969-1976/ending-vietnam","Em 08/06/1969 Nixon anuncia a primeira retirada (25.000, NARA); Camboja 30/04/1970; Kent State 04/05/1970; acordo Kissinger-Le Duc Tho 11-12/10/1972, Thieu rejeita; Nixon ordena ataques maciços em 14/12/1972; acordo rubricado 23/01/1973 e assinado 27/01/1973; tanques do NVA no palácio 30/04/1975; grande ofensiva nas terras altas em 03/1975. LIDO (página 'retired')."),
"MILL":("https://millercenter.org/the-presidency/presidential-speeches/november-3-1969-address-nation-war-vietnam","Nixon, 03/11/1969: 'great silent majority'; vietnamização; mais de 60.000 homens retirados até 15/12; recusa divulgar cronograma. LIDO."),
"PP":("https://www.archives.gov/research/pentagon-papers","Relatório encomendado por McNamara em 1967; vazado em jun/1971; ~7.000 páginas, 48 caixas; liberado inteiro em 2011. LIDO."),
"LB2":("https://www.airandspaceforces.com/article/1197linebacker/","Linebacker II, 18 a 29/12/1972: 729 de 741 surtidas de B-52 planejadas, 15 B-52 perdidos, pausa em 25/12, retomada em 26/12. LIDO (média-alta)."),
"PARIS":("https://teachingamericanhistory.org/document/the-paris-accords/","Art. 2: cessar-fogo no Sul 'as of 2400 hours G.M.T., on January 27, 1973'; art. 5: retirada total em 60 dias; art. 8(a): devolução de prisioneiros. LIDO (reprodução)."),
"WPR":("https://history.state.gov/historicaldocuments/frus1969-76v35/d26","Nixon vetou em 24/10/1973; Congresso derrubou em 07/11/1973 (Câmara 284-135, Senado 75-18); 48 horas e 60 dias (https://history.house.gov/Historical-Highlights/1951-2000/The-War-Powers-Resolution/). LIDO."),
"COM":("https://commons.wikimedia.org/wiki/File:CH-53s_evacuate_people_from_LZ_39_in_Saigon_1975.JPG","Imagem USMC, 29/04/1975, helicópteros CH-53 em Saigon; domínio público. Atribuição: USMC, 'U.S. Marines in Vietnam: The War that Would not End 1973-1975', p. 189. LIDO."),
"_MINH_OLD":("https://clickamericana.com/media/newspapers/us-pulls-out-of-vietnam-saigon-government-surrenders-1975","Duong Van Minh presidente desde 28/04/1975; rendição incondicional anunciada em 30/04/1975. LIDO (confiabilidade média-baixa: confirmar em fonte melhor antes da aprovação)."),
"UNIF":("https://vietnamlawmagazine.vn/the-vietnam-states-structure-and-operation-during-the-1975-1986-period-4503.html","02/07/1976: Assembleia Nacional adota o nome República Socialista do Vietnã e rebatiza Saigon-Gia Dinh como Cidade de Ho Chi Minh. LIDO (média)."),
"REF":("https://www.ebsco.com/research-starters/social-sciences-and-humanities/vietnamese-immigrants","~125.000 vietnamitas chegam aos EUA na primavera de 1975, 'one of the single largest short-term influxes'. LIDO (aproximação)."),
"BMJ":("https://pubmed.ncbi.nlm.nih.gov/18566045/","Obermeyer et al., BMJ 2008 (PMID 18566045): 3,8 milhões de mortes violentas de guerra no Vietnã (1955-2002) entre 5,4 milhões em 13 países (IC 95% 3,0 a 8,7 milhões é do TOTAL dos 13 países, não do Vietnã); método: pesquisa domiciliar com informação sobre irmãos. LIDO pelo revisor (resumo)."),
"BR1":("https://www2.camara.leg.br/atividade-legislativa/plenario/discursos/escrevendohistoria/golpe-de-1964/golpe-militar","Jango deposto em 01/04/1964; AI-1 em 09/04; Castelo Branco eleito em 11/04 (candidato único, 361 votos), posse em 15/04/1964. LIDO (dossiê fatos_extras.md)."),
"BR2":("https://www18.fgv.br/CPDOC/acervo/dicionarios/verbete-biografico/humberto-de-alencar-castelo-branco","CPDOC/FGV: Castelo Branco apoiou o levante de 31/03/1964. LIDO."),
"BR3":("https://www18.fgv.br/CPDOC/acervo/dicionarios/verbete-biografico/artur-da-costa-e-silva","Costa e Silva: eleito em 03/10/1966, posse em 15/03/1967, AI-5 em 13/12/1968, afastado em 31/08/1969. LIDO (CPDOC)."),
"FAPESP":("https://revistapesquisa.fapesp.br/o-vietna-foi-aqui/","Tese de Orivaldo Leme Biagi (Unicamp): grande imprensa 'favorável à ação no Vietnã de 1964 até 1971'; esquerda usou a guerra contra o imperialismo; após o Tet, 'Vietnã' palavra de ordem nas greves de Contagem e Osasco. LIDO (reportagem sobre a tese)."),
"ANPUH":("https://www.anpuh.org.br/uploads/anais-simposios/pdf/2019-01/1548772192_ea438c4071210168f9d967c2e4dcc862.pdf","Simões: 'A reticência brasileira em enviar tropas ao Vietnã pode ser explicada nesses termos' (geopolítica dos círculos concêntricos da ESG). LIDO. Interpretação do autor."),
}
# tempos pelo número de palavras (WPM) e escrita do script.md
t=0.0; out=[]; scenes=[]
for i,(vis,sfx,src,txt) in enumerate(SC,1):
    mm,ss=divmod(int(round(t)),60)
    head=f"[CENA {i:02d} | {mm:02d}:{ss:02d} | visual: {vis}"+(f" | sfx: {sfx}" if sfx else "")+"]"
    out.append(head+"\n"+txt+"\n")
    scenes.append((i,f"{mm:02d}:{ss:02d}",src))
    t+=len(txt.split())/WPM*60
total=t
hdr=f"""# Roteiro: Vietnã: o dia em que os EUA pediram soldados ao Brasil
Contrato: título T01 + thumbnail A ("E o Brasil foi?"). Ângulo A: a guerra em ~22 min com o fio do Brasil, em português do Brasil. Estilo D (código). Duração estimada: {total/60:.1f} min a {WPM} palavras/min. Fatos mapeados em `sources.md`. Marcas de cena: `[CENA NN | mm:ss | visual | sfx]`.

"""
open('../script.md','w',encoding='utf-8').write(hdr+"\n".join(out))
# sources.md
src_used=sorted({k for _,_,s in scenes for k in s})
rows=["# Fontes e licenças","Acesso em 2026-11-19. Nenhum vídeo é fonte de fato.","","## Fatos (por fonte; cenas onde é usada)","| Chave | Fonte (URL) | Acessado em | Trecho que sustenta | Cenas |","|---|---|---|---|---|"]
for k in src_used:
    cs=", ".join(str(n) for n,_,s in scenes if k in s)
    u,tr=SRC[k]
    rows.append(f"| {k} | {u} | 2026-11-19 | {tr} | {cs} |")
rows+=["","## Fatos por cena","| Cena | Tempo | Fontes |","|---|---|---|"]
for n,tm,s in scenes: rows.append(f"| {n:02d} | {tm} | {', '.join(s) if s else 'sem afirmação factual (transição)'} |")
rows+=["","## Conflitos e pontos a confirmar antes da aprovação",
"- Rolling Thunder: NARA 02/03/1965 x Departamento de Estado 13/02/1965; o roteiro cita as duas.",
"- Morte de Diem: a página do NARA se contradiz (02/11 x 23/11); o roteiro diz que foi derrubado em 01/11/1963 e morto no dia seguinte.",
"- Público em Ba Dinh (02/09/1945): ~500 mil (Country Study) x mais de 400 mil (outra testemunha); o roteiro diz 'cerca de 500 mil, estimativa das fontes'.",
"- Marcha de 21/10/1967: 100 mil (The Nation) x 70 mil manifestantes no Pentágono (NARA); o roteiro cita as duas.",
"- Intervalo de 3,0 a 8,7 milhões do BMJ é do total de 13 países: não aparece no roteiro.",
"- Número de 1.250 militares brasileiros na República Dominicana: relato do embaixador citado em tese; o roteiro atribui.",
"- Costa e Silva e novo pedido de tropas: n/v, dito como lacuna no roteiro.",
"- Operação Homecoming (591 libertados): sem fonte lida; removida do roteiro.",
"- Fontes que o revisor não reabriu: BR1, BR2, BR3, BUD1, BUD2, DRAFT, IOM, JULY65, KHE1, KHE2, LB2, MAAG, MARCH67, MILL, REF, UNIF, WIL, ANPUH, COM (status do trecho registrado).",
"","## Assets",
"| Asset | Origem | Licença | URL/ID |","|---|---|---|---|",
"| Foto dos CH-53 em Saigon, 29/04/1975 | USMC, Wikimedia Commons | domínio público (obra do governo dos EUA); atribuição USMC | https://commons.wikimedia.org/wiki/File:CH-53s_evacuate_people_from_LZ_39_in_Saigon_1975.JPG |",
"| Mapas (países, linhas, rótulos) | código (Remotion, d3-geo) com Natural Earth 110m | domínio público (Natural Earth) | world-atlas (ISC) |",
"| Textos de documentos na tela | tipografia própria; reproduz apenas trechos curtos com fonte | uso transformador, citação com crédito | ver tabela de fatos |",
"| Selo de cera do Lacre | Flow (imagem) | uso comercial permitido pelo plano | media/pt-br-historia/brand |"]
open('../sources.md','w',encoding='utf-8').write("\n".join(rows)+"\n")
print(len(SC),'cenas;',round(total/60,1),'min;',len(src_used),'fontes')
