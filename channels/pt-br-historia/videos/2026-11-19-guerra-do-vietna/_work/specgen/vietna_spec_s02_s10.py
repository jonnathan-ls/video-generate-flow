import json
p='/home/jonnathan/projects/ai-youtube-channel/channels/pt-br-historia/videos/2026-11-19-guerra-do-vietna/scenes_spec.json'
S=json.load(open(p))
for k in list(S):
    if k!='S01': del S[k]
BR=[-47.9,-15.8]; SG=[106.7,10.8]; HN=[105.85,21.03]
def sh(kind,a,b,cue,**kw):
    d={"kind":kind,"start_s":a,"end_s":b,"cue":cue,"motion":kw.pop('motion','câmera em movimento + elementos animados'),"layers":kw.pop('layers',["céu/fundo","cena em planos","atmosfera+rótulo"])}
    d.update(kw); return d
def line(text,w,size='l',color='paper'): return {"text":text,"at_word":w,"size":size,"color":color}
def pl(name,**kw): d={"name":name}; d.update(kw); return d
S['S02']={"kind":"shots","shots":[
 sh("stat",0.0,5.8,"empréstimo de 150 milhões de dólares",plate=pl("office-night"),stat={"top":"O EMPRÉSTIMO","big":"150 milhões","label":"de dólares","big_at_word":"empréstimo","label_at_word":"milhões"}),
 sh("plate",5.8,8.9,"o embaixador fez uma pressão muito forte",plate=pl("meeting-table",v="plain"),names=[{"text":"LINCOLN GORDON","sub":"embaixador dos EUA","at_word":"embaixador","out_s":8.6}]),
 sh("map-zoom",8.9,10.95,"por tropas brasileiras no Vietnã",cam0={"center":[22,8],"scale":300},cam1={"center":[22,8],"scale":330},
    pins=[{"at":BR,"label":"BRASIL","at_s":0.0,"align":"left"},{"at":SG,"label":"VIETNÃ","at_word":"Vietnã.","offset":0.2,"align":"right"}],
    route={"pts":[BR,SG],"from_word":"tropas","from_offset":0.0,"to_word":"Vietnã.","to_offset":0.3}),
 sh("typo",10.95,17.7,"tratou os dois assuntos separados, mas o pedido foi feito na mesma conversa",plate=pl("office-night",scale=1.25,ox="70%"),typo={"lines":[line("o governo americano diz:","governo","m","brass"),line("dois assuntos, separados","dois","l"),line("mas o pedido foi feito","mas","m","brass"),line("na mesma conversa","mesma#2","xl","seal")]}),
 sh("doc",17.7,23.8,"a resposta está no documento",doc={"head":"MEMORANDUM","sub":"Washington, December 31, 1965","src":"FRUS 1964–68, vol. XXXI, doc. 225 · memorando de Bundy a Johnson","quote":"we separated the $150 million program loan from the issue of troops","at_word":"documento,","offset":-0.2}),
 sh("typo",23.8,28.05,"antes, como os EUA chegaram a esse pedido",plate=pl("hanoi-dawn"),typo={"lines":[line("antes do pedido","Antes,","m","brass"),line("como os Estados Unidos chegaram até ele","como","l")]})]}
S['S03']={"kind":"shots","shots":[
 sh("timeline",0.0,7.0,"a história começa vinte anos antes do pedido e termina dez anos depois",timeline={"from":1945,"to":1975,"draw":{"from_s":0.0,"to_s":3.4},"marks":[{"year":1965,"label":"1965 · o pedido","at_word":"pedido,","accent":True},{"year":1945,"label":"1945 · Hanói","at_word":"Hanói,"},{"year":1975,"label":"1975 · Saigon","at_s":6.2}]}),
 sh("typo",7.0,9.95,"no meio, há um lugar para o Brasil",plate=pl("brasilia-dusk",scale=1.25,ox="70%"),typo={"lines":[line("no meio,","meio,","m","brass"),line("um lugar para o Brasil","lugar","xl","seal")]})]}
S['S04']={"kind":"shots","shots":[
 sh("date",0.0,3.4,"2 de setembro de 1945",plate=pl("img-hanoi-a"),date={"top":"HANÓI · 2 DE SETEMBRO","big":"1945"}),
 sh("plate",3.4,8.9,"em Hanói, Ho Chi Minh lê a declaração de independência",plate=pl("img-crowd-a"),ambient="murmur",names=[{"text":"HO CHI MINH","sub":"lê a declaração de independência","at_word":"Ho","out_s":8.6}]),
 sh("stat",8.9,12.1,"multidão de cerca de 500 mil pessoas na praça de Ba Dinh",plate=pl("img-crowd-c"),ambient="murmur",stat={"top":"PRAÇA DE BA DINH","big":"≈ 500 mil","label":"pessoas, estimam as fontes","big_at_word":"500","big_offset":-0.1,"label_at_word":"pessoas,"}),
 sh("pair",12.1,19.0,"o texto se inspira nas declarações americana e francesa",pair={"a":{"src":"vietna/decl_us.jpg","label":"Declaração de Independência","sub":"Estados Unidos, 1776","at_word":"inspira","offset":-0.5},"b":{"src":"vietna/decl_fr.jpg","label":"Declaração dos Direitos do Homem e do Cidadão","sub":"França, 1789","at_word":"Declaração#3","offset":-0.5}}),
 sh("plate",19.0,22.75,"ele pede que os aliados reconheçam o novo país",plate=pl("img-flag-a"))]}
S['S05']={"kind":"shots","shots":[
 sh("plate",0.0,6.5,"soldados britânicos chegam ao sul em setembro de 1945",motion="navio entra no quadro e atraca",scene={"bg":"vietna/bg_saigon.jpg","z0":1.02,"z1":1.1,"ox":"60%","oy":"65%",
    "actors":[{"src":"vietna/ship.png","from":[125,79],"to":[60,79],"h":30,"t0_s":0.2,"t1_s":5.8,"ease":"out","bob":2,"rock":0.5,"period":70,"wake":True,"sink":0.22,"smoke":[53,22]}]},
    names=[{"text":"SAIGON · SETEMBRO DE 1945","sub":"chegam os soldados britânicos","at_word":"sul","out_s":6.2}]),
 sh("stat",6.5,9.0,"tropas francesas retomam Saigon",motion="coluna francesa marcha no cais",scene={"bg":"vietna/bg_saigon.jpg","z0":1.5,"z1":1.6,"ox":"28%","oy":"62%",
    "actors":[{"src":"vietna/soldiers_46.png","from":[28,55.5],"to":[44,55.5],"h":10,"t0_s":6.5,"t1_s":9.0,"ease":"linear","slices":6,"ar":2.104,"bob":3,"rock":1.2}]},
    stat={"big":"SAIGON","label":"retomada pelas tropas francesas","big_at_word":"francesas#1","label_at_word":"retomam"}),
 sh("plate",9.0,15.8,"em março de 1946, 15 mil soldados franceses desembarcam no Tonkin",motion="lanchas cruzam do navio até a praia",scene={"bg":"vietna/bg_tonkin.jpg","z0":1.02,"z1":1.12,"ox":"60%","oy":"70%",
    "actors":[{"src":"vietna/ship.png","from":[22,57],"h":11,"bob":1,"rock":0.3,"period":90,"sink":0.22,"smoke":[53,22]},
              {"src":"vietna/lcvp.png","from":[-8,70],"to":[66,86],"h":13,"scale1":1.35,"t0_s":9.3,"t1_s":13.8,"tint":"saturate(0.15) brightness(0.85)","ease":"inout","bob":3,"rock":0.8,"period":34,"wake":True,"sink":0.18,"land":True},
              {"src":"vietna/lcvp.png","from":[-14,64],"to":[38,74],"h":10,"scale1":1.3,"t0_s":10.4,"t1_s":15.3,"tint":"saturate(0.15) brightness(0.85)","ease":"inout","bob":3,"rock":0.8,"period":30,"wake":True,"sink":0.18}]},
    names=[{"text":"TONKIN · MARÇO DE 1946","sub":"≈ 15 mil soldados franceses chegam ao Tonkin","at_word":"março","out_s":15.4}]),
 sh("date",15.8,22.8,"em 19 de dezembro de 1946, o Viet Minh ataca a usina elétrica de Hanói",motion="a usina explode e a cidade apaga",scene={"bg":"vietna/bg_plant.jpg","z0":1.02,"z1":1.12,"ox":"50%","oy":"45%","night":True,
    "fx":[{"kind":"searchlight","x":20,"y":70},{"kind":"searchlight","x":80,"y":72,"phase":2.5},{"kind":"smoke","x":37,"y":9,"w":50,"from_s":15.8},{"kind":"smoke","x":47,"y":7,"w":50,"from_s":15.8},{"kind":"tracers","x":56,"y":70,"w":700,"from_word":"Viet#1","from_offset":0.0,"to_word":"usina","to_offset":0.0},{"kind":"explosion","x":56,"y":42,"at_word":"usina","offset":0.05,"size":230},{"kind":"blackout","at_word":"usina","offset":0.2},
          {"kind":"fire","x":56,"y":50,"w":220,"from_word":"usina","from_offset":0.4},{"kind":"smoke","x":56,"y":38,"w":140,"from_word":"usina","from_offset":0.3}]},
    date={"top":"HANÓI · 19 DE DEZEMBRO","big":"1946"}),
 sh("typo",22.8,28.49,"outras instalações francesas; o começo da guerra entre a França e o Viet Minh",motion="fogo nas ruas e a coluna francesa avança",scene={"bg":"vietna/bg_street.jpg","z0":1.04,"z1":1.13,"ox":"55%","oy":"65%","night":True,
    "actors":[{"src":"vietna/soldiers_46.png","from":[66,93],"to":[84,93],"h":30,"t0_s":23.0,"t1_s":28.4,"ease":"linear","slices":6,"ar":2.104,"bob":6,"rock":1.2}],
    "fx":[{"kind":"fire","x":25,"y":60,"w":200,"from_s":22.8},{"kind":"fire","x":82,"y":55,"w":160,"from_s":22.8},{"kind":"smoke","x":40,"y":40,"w":160,"from_s":22.8}]},
    typo={"lines":[line("é o começo da guerra","começo","m","paper"),line("França × Viet Minh","França#2","xl")]})]}
S['S06']={"kind":"shots","shots":[
 sh("typo",0.0,3.0,"os EUA ficam do lado francês",plate=pl("dock-crates"),typo={"lines":[line("Os Estados Unidos","Estados","m","brass"),line("ficam do lado francês","ficam","l")]}),
 sh("plate",3.0,6.9,"segundo os Documentos do Pentágono",plate=pl("command-room",scale=1.2,ox="30%"),names=[{"text":"DOCUMENTOS DO PENTÁGONO","sub":"a ajuda americana à França","at_word":"Documentos","out_s":6.6}]),
 sh("date",6.9,11.9,"a ajuda começa com 10 milhões de dólares em 1950",plate=pl("dock-crates",scale=1.4,ox="20%",oy="90%"),date={"top":"1950 · AJUDA DOS EUA À FRANÇA","big":"US$ 10 milhões"}),
 sh("stat",11.9,16.2,"em 1954 já paga 78% do custo da guerra francesa",plate=pl("saigon-street",scale=1.2),stat={"top":"1954","big":"78%","label":"do custo da guerra francesa","big_at_word":"já","label_at_word":"custo","bar":{"frac":0.78,"at_word":"78%"}}),
 sh("typo",16.2,21.2,"o Miller Center fala em mais de três quartos",plate=pl("meeting-table",v="plain",scale=1.2,ox="30%"),typo={"lines":[line("Miller Center","Miller","m","brass"),line("Universidade da Virgínia","Universidade","m"),line("mais de três quartos","mais","xl")]}),
 sh("date",21.2,25.0,"em 7 de abril de 1954",plate=pl("press-room"),date={"top":"7 DE ABRIL","big":"1954"}),
 sh("domino",25.0,31.98,"Eisenhower cita o princípio do dominó",domino={"top":"O princípio do dominó","sub":"Eisenhower, entrevista de 7 de abril de 1954","fall_word":"dominó:","fall_offset":0.3})]}
S['S07']={"kind":"shots","shots":[
 sh("plate",0.0,6.7,"a guerra francesa termina em Dien Bien Phu, de 13 de março a 7 de maio de 1954",plate=pl("valley-dbp"),names=[{"text":"DIEN BIEN PHU","sub":"13 de março a 7 de maio de 1954","at_word":"Dien","out_s":6.4}]),
 sh("typo",6.7,11.2,"a França combate no norte e perde para o Viet Minh, de Ho Chi Minh",plate=pl("valley-dbp",scale=1.4,ox="70%"),typo={"lines":[line("a França combate no norte do Vietnã","França","m","brass"),line("perde para","perde","l"),line("o Viet Minh","Viet","xl"),line("de Ho Chi Minh","Ho","m","brass")]}),
 sh("plate",11.2,15.7,"o fim formal só vem com o acordo de Genebra",plate=pl("geneva-lake",scale=1.2,ox="30%"),names=[{"text":"ACORDO DE GENEBRA","sub":"o fim formal da guerra","at_word":"acordo","out_s":15.4}]),
 sh("typo",15.7,19.05,"a pergunta passa a ser quem vai governar o país",plate=pl("hanoi-dawn",scale=1.2,ox="30%"),typo={"lines":[line("a pergunta passa a ser","pergunta","m","brass"),line("quem vai governar o país?","quem","xl","seal")]})]}
S['S08']={"kind":"shots","shots":[
 sh("date",0.0,4.7,"20 de julho de 1954, acordo de Genebra",plate=pl("geneva-lake"),date={"top":"ACORDO DE GENEBRA · 20 DE JULHO","big":"1954"}),
 sh("plate",4.7,10.7,"o texto traça uma linha militar provisória",plate=pl("dmz-river"),names=[{"text":"LINHA MILITAR PROVISÓRIA","sub":"acordo de Genebra, 1954","at_word":"linha#1","out_s":10.4}]),
 sh("stat",10.7,14.2,"zona desmilitarizada de até cinco quilômetros de cada lado",plate=pl("dmz-river",scale=1.4,ox="70%",oy="80%"),stat={"top":"ZONA DESMILITARIZADA","big":"5 km","label":"de cada lado da linha, no máximo","big_at_word":"cinco","big_offset":-0.2,"label_at_word":"quilômetros"}),
 sh("typo",14.2,18.0,"cada lado administra a sua parte",plate=pl("meeting-table",v="plain",scale=1.2,ox="70%"),typo={"lines":[line("cada lado administra","Cada#2","m","brass"),line("a sua parte","sua","xl")]}),
 sh("stat",18.0,21.4,"até as eleições gerais que vão reunificar o Vietnã",plate=pl("ballot-box"),stat={"top":"O PRAZO","big":"ELEIÇÕES","label":"gerais, para reunificar o Vietnã","big_at_word":"eleições","label_at_word":"reunificar"}),
 sh("typo",21.4,24.4,"o cessar-fogo começa em datas diferentes",plate=pl("valley-dbp",v="calm",scale=1.25,ox="30%"),typo={"lines":[line("cessar-fogo","cessar-fogo","m","brass"),line("em datas diferentes","datas","l")]}),
 sh("map-zoom",24.4,30.07,"27 de julho no Norte, 1º de agosto no centro, 11 de agosto no Sul",cam0={"center":[106,15.5],"scale":3300},cam1={"center":[106,15.5],"scale":3800},
    pins=[{"at":HN,"label":"NORTE · 27 JUL.","at_word":"Norte,","offset":-0.2,"align":"right"},{"at":[107.5,16.4],"label":"CENTRO · 1º AGO.","at_word":"centro","offset":-0.2,"align":"right"},{"at":SG,"label":"SUL · 11 AGO.","at_word":"Sul.","offset":-0.2,"align":"right"}])]}
S['S09']={"kind":"shots","shots":[
 sh("plate",0.0,3.6,"a linha era provisória e as eleições eram o plano para apagá-la",plate=pl("dmz-river",scale=1.15,ox="30%",oy="75%"),names=[{"text":"LINHA PROVISÓRIA","sub":"eleições em 1956 a apagariam","at_word":"linha#1","out_s":3.4}]),
 sh("typo",3.6,8.9,"uma comissão de Canadá, Índia e Polônia fiscaliza o acordo",plate=pl("three-flags"),typo={"lines":[line("comissão de fiscalização","comissão","m","brass"),line("Canadá · Índia · Polônia","Canadá,","l")]}),
 sh("date",8.9,11.5,"em agosto de 1955",plate=pl("saigon-street",v="svn",scale=1.1),date={"top":"AGOSTO","big":"1955"}),
 sh("plate",11.5,17.0,"o primeiro-ministro do Sul, Ngo Dinh Diem, recusa as conversas com o Norte",plate=pl("command-room",v="svn",scale=1.1),names=[{"text":"NGO DINH DIEM","sub":"primeiro-ministro do Sul, recusa as conversas","at_word":"Ngo","out_s":16.7}]),
 sh("typo",17.0,20.8,"as eleições previstas para 1956",plate=pl("ballot-box",scale=1.2,ox="70%"),typo={"lines":[line("eleições previstas","preparar","m","brass"),line("1956","1956.","xl")]}),
 sh("map-zoom",20.8,27.0,"o país segue dividido e a linha provisória vira fronteira de fato",cam0={"center":[106.3,15.8],"scale":3000},cam1={"center":[106.3,15.8],"scale":3200},
    pins=[{"at":HN,"label":"NORTE","at_word":"dois","align":"right"},{"at":SG,"label":"SUL","at_word":"governos,","align":"right"}],
    swap={"pos":"left","from":"PROVISÓRIA","to":"FRONTEIRA","at_word":"provisória#2","swap_word":"fronteira","swap_offset":0.1}),
 sh("typo",27.0,31.43,"os americanos passam a apoiar o Sul",plate=pl("advisors-line"),typo={"lines":[line("esse país dividido","esse","m","brass"),line("os americanos passam a apoiar","americanos","l"),line("o Sul","Sul.#2","xl","seal")]})]}
S['S10']={"kind":"shots","shots":[
 sh("typo",0.0,2.7,"os americanos entram aos poucos",plate=pl("advisors-line"),typo={"lines":[line("os americanos entram","americanos#1","m","brass"),line("aos poucos","aos","xl")]}),
 sh("plate",2.7,5.3,"em maio de 1961",plate=pl("saigon-street",v="svn",scale=1.15,ox="30%"),names=[{"text":"MAIO DE 1961","sub":"Vietnã do Sul","at_word":"maio","out_s":5.1}]),
 sh("stat",5.3,12.0,"685 integrantes do grupo de assessoria militar dos EUA no Vietnã do Sul",plate=pl("advisors-line",scale=1.3,ox="30%",oy="85%"),stat={"top":"MAIO DE 1961","big":"685","label":"integrantes do grupo de assessoria militar dos EUA no Vietnã do Sul","big_at_word":"685","big_offset":-0.1,"label_at_word":"integrantes"}),
 sh("date",12.0,15.8,"8 de fevereiro de 1962",plate=pl("command-room"),date={"top":"8 DE FEVEREIRO","big":"1962"}),
 sh("typo",15.8,19.7,"nasce um comando militar americano para assessorar o governo do Sul",plate=pl("command-room",scale=1.3,ox="70%",oy="80%"),typo={"lines":[line("nasce um comando militar americano","nasce","m","brass"),line("para assessorar o governo do Sul","assessorar","l")]}),
 sh("timeline",19.7,24.4,"no fim de 1963, ao final do governo Kennedy",timeline={"from":1961,"to":1964,"draw":{"from_s":19.8,"to_s":21.2},"marks":[{"year":1961,"label":"mai. 1961","at_s":20.0},{"year":1962,"label":"fev. 1962","at_s":20.3},{"year":1963,"label":"fim de 1963","at_word":"1963,","accent":True}]}),
 sh("chart",24.4,28.44,"os assessores militares americanos já somam 16 mil",chart={"title":"Assessores militares dos EUA no Vietnã do Sul","src":"MAAG (maio de 1961) · Miller Center (fim de 1963, valor arredondado)","bars":[{"label":"maio de 1961","value":685,"display":"685","at_s":24.6},{"label":"fim de 1963","value":16000,"display":"16 mil","at_word":"somam"}]})]}
S['S02']['shots'][3]['silence']={"at_s":17.3,"dur":1.2}
S['S08']['shots'][2]['silence']={"at_s":9.9,"dur":2.0}
S['S06']['shots'][6]['silence']={"at_s":24.2,"dur":0.9}
S['S10']['shots'][2]['silence']={"at_s":4.9,"dur":0.9}
for k_ in S:
    if k_!='S01': S[k_]['vignette']=0.3
json.dump(S,open(p,'w'),ensure_ascii=False,indent=1)
