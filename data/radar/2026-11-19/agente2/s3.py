import json,subprocess,statistics as st,concurrent.futures as cf,sys
from pathlib import Path
OUT=Path("/home/jonnathan/projects/ai-youtube-channel/data/radar/2026-11-19/agente2")
vids=sys.argv[1:]
LM={r["id"]:r for r in json.load(open(OUT/"long_meta.json")) if "error" not in r}
def vmeta(v):
    m=dict(LM[v]); m.pop("channel_follower_count",None); return m
def chan(cid):
    p=subprocess.run(["yt-dlp","--flat-playlist","--dump-single-json",f"https://www.youtube.com/channel/{cid}/videos"],capture_output=True,text=True)
    d=json.loads(p.stdout)
    ents=[{"id":e["id"],"title":e.get("title"),"duration":e.get("duration"),"view_count":e.get("view_count")} for e in d.get("entries",[])]
    return {"channel_follower_count":d.get("channel_follower_count"),"channel_name":d.get("channel"),"channel_id":cid,"n_videos_tab":len(ents),"playlist_count":d.get("playlist_count"),"entries":ents}
res=[]
for v in vids:
    m=vmeta(v); c=chan(m["channel_id"])
    longs=[e for e in c["entries"] if (e["duration"] or 0)>900 and e["view_count"] is not None][:15]
    med=st.median([e["view_count"] for e in longs]) if longs else None
    m["description"]=(m.get("description") or "")[:600]
    r={"video":m,"channel":c,"last15_long":longs,"median_last15_long":med,"multiple":round(m["view_count"]/med,1) if med else None}
    res.append(r)
    print(v,m["channel"],"subs",c["channel_follower_count"],"videos(tab)",c["n_videos_tab"],c["playlist_count"],"nlong",len(longs),"median",med,"views",m["view_count"],"mult",r["multiple"],"date",m["upload_date"])
    print("   ",m["title"][:100])
json.dump(res,open(OUT/f"channels_{'_'.join(vids)[:60]}.json","w"),ensure_ascii=False,indent=1)
