import json,subprocess,concurrent.futures as cf,datetime as dt
from pathlib import Path
OUT=Path("/home/jonnathan/projects/ai-youtube-channel/data/radar/2026-11-19/agente2")
rows=json.loads((OUT/"search_flat.json").read_text())["rows"]
longs=[r for r in rows if (r["duration"] or 0)>900]
F="id,title,channel,channel_id,channel_follower_count,upload_date,view_count,duration"
def get(vid):
    p=subprocess.run(["yt-dlp","--extractor-args","youtube:lang=pt","--skip-download","--print",f"%(.{{{F}}})j",f"https://youtu.be/{vid}"],capture_output=True,text=True)
    try: return json.loads(p.stdout.strip().splitlines()[-1])
    except Exception: return {"id":vid,"error":p.stderr[-200:]}
ids=sorted({r["id"] for r in longs})
meta={}
with cf.ThreadPoolExecutor(10) as ex:
    for d in ex.map(get,ids): meta[d["id"]]=d
today=dt.date(2026,11,19)
out=[]
for r in longs:
    m=meta[r["id"]]
    if "error" in m: out.append({**r,"error":m["error"]}); continue
    age=(today-dt.datetime.strptime(m["upload_date"],"%Y%m%d").date()).days
    out.append({**r,**m,"age_days":age,"url":f"https://youtu.be/{r['id']}"})
(OUT/"long_meta.json").write_text(json.dumps(out,ensure_ascii=False,indent=1))
for r in sorted(out,key=lambda x:(x["theme"],x.get("age_days",9999))):
    if r.get("age_days",9999)<=365:
        print(r["theme"],r["age_days"],r["view_count"],r["channel_follower_count"],r["duration"]//60,r["id"],r["channel"],"|",r["title"][:90])
print("errors",sum(1 for r in out if "error" in r))
