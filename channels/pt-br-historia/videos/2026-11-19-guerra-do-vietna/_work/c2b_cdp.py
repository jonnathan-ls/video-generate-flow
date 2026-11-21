import asyncio, json, sys, urllib.request
import websockets

async def main():
    req = urllib.request.urlopen('http://127.0.0.1:9333/json/list')
    tabs = json.load(req)
    pages = [t for t in tabs if t['type'] == 'page' and 'flow.google.com' in t.get('url', '')]
    if not pages:
        print('no flow page'); return
    ws_url = pages[0]['webSocketDebuggerUrl']
    cmds = json.load(open(sys.argv[1]))
    async with websockets.connect(ws_url, max_size=None) as ws:
        mid = 0
        for c in cmds:
            mid += 1
            c = dict(c); c['id'] = mid
            await ws.send(json.dumps(c))
            while True:
                r = json.loads(await ws.recv())
                if r.get('id') == mid:
                    print(json.dumps(r, ensure_ascii=False)[:12000])
                    break

asyncio.run(main())
