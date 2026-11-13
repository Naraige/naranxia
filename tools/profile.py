import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
# usage: python3 tools/profile.py  (after npm run build) - CPU profile of the 6000-tick tests/det.js scenario, top self-time functions
# compare the printed hashes before and after an optimisation: they must be identical (determinism)
src=(ROOT/'tests/det.js').read_text()
src=src.replace("const a=runOnce(),b=runOnce();return JSON.stringify({same:JSON.stringify(a)===JSON.stringify(b),a,b})","const t=performance.now();const a=runOnce();return JSON.stringify({ms:Math.round(performance.now()-t),h:a})")
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page();pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.goto((ROOT/'dist/naranxia_readable.html').as_uri(),timeout=900000);pg.wait_for_timeout(3000)
    c=pg.context.new_cdp_session(pg);c.send('Profiler.enable');c.send('Profiler.setSamplingInterval',{'interval':500});c.send('Profiler.start')
    r=pg.evaluate(src);prof=c.send('Profiler.stop')['profile']
    print(r[:200])
    nodes={n['id']:n for n in prof['nodes']};self={}
    dt=prof['timeDeltas']
    for sid,d in zip(prof['samples'],dt):
        cf=nodes[sid]['callFrame'];k=f"{cf['functionName'] or '(anon)'}:{cf['lineNumber']}"
        self[k]=self.get(k,0)+d
    tot=sum(self.values())
    for k,v in sorted(self.items(),key=lambda x:-x[1])[:18]:print(f"{v/1000:8.0f}ms {100*v/tot:5.1f}% {k}")
    b.close()
