import json,subprocess,sys,concurrent.futures as cf
from pathlib import Path
OUT=Path("/home/jonnathan/projects/ai-youtube-channel/data/radar/2026-11-19/agente2")
Q={
"I07":["cerco da lapa","revolução federalista","guerra da degola","revolução federalista 1893 documentário","maragatos e pica-paus","gumercindo saraiva"],
"I08":["balaiada","balaiada documentário","revolta da balaiada maranhão","balaiada caxias","balaiada história completa","cosme bento balaiada"],
"I09":["grande seca de 1877","seca de 1877","seca de 1877 ceará","grande seca 1877 documentário","seca 1877 retirantes","campos de concentração ceará seca"],
"I12":["serra pelada","serra pelada documentário","garimpo de serra pelada","serra pelada história","serra pelada ouro curió","serra pelada garimpeiros"],
"I15":["batalha dos guararapes","batalhas dos guararapes","holandeses em pernambuco","brasil holandês","insurreição pernambucana","nassau recife holandês documentário"],
}
def run(args):
    p=subprocess.run(["yt-dlp","--extractor-args","youtube:lang=pt","--flat-playlist","--dump-json"]+args,capture_output=True,text=True)
    return [json.loads(l) for l in p.stdout.splitlines() if l.strip()]
jobs=[]
for t,qs in Q.items():
    for q in qs:
        jobs.append((t,q,f"ytsearch30:{q}"))
    for q in qs[:2]:
        jobs.append((t,q+" [date]",f"ytsearchdate30:{q}"))
res={}
with cf.ThreadPoolExecutor(8) as ex:
    futs={ex.submit(run,[j[2]]):j for j in jobs}
    for f in cf.as_completed(futs):
        t,q,_=futs[f]
        for e in f.result():
            k=(t,e["id"])
            r=res.setdefault(k,{"theme":t,"id":e["id"],"title":e.get("title"),"channel":e.get("channel"),"channel_id":e.get("channel_id"),"duration":e.get("duration"),"view_count":e.get("view_count"),"queries":[]})
            r["queries"].append(q)
rows=list(res.values())
(OUT/"search_flat.json").write_text(json.dumps({"queries":Q,"date_sorted_extra":"ytsearchdate30 nas 2 primeiras de cada tema","rows":rows},ensure_ascii=False,indent=1))
for t in Q:
    rs=[r for r in rows if r["theme"]==t]
    print(t,len(rs),"long>900:",sum(1 for r in rs if (r["duration"] or 0)>900))
