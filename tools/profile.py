import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
# usage: python3 tools/profile.py  (after npm run build) - CPU profile of the 6000-tick tests/det.js scenario, top self-time functions
# compare the printed hashes before and after an optimisation: they must be identical (determinism)
src=(ROOT/'tests/det.js').read_text(encoding='utf-8')
with sync_playwright() as p:
    sys.path.insert(0,str(ROOT/'tests'))
    from browser_fixture import FLAGS,load_page
    b=p.chromium.launch(args=FLAGS)
    pg,errors,phases=load_page(b)
    c=pg.context.new_cdp_session(pg);c.send('Profiler.enable');c.send('Profiler.setSamplingInterval',{'interval':500});c.send('Profiler.start')
    pg.evaluate('()=>{window.__NX_PROFILE_DET__=true}')
    r=pg.evaluate(src);prof=c.send('Profiler.stop')['profile']
    print(r[:200])
    nodes={n['id']:n for n in prof['nodes']};self={}
    dt=prof['timeDeltas']
    for sid,d in zip(prof['samples'],dt):
        cf=nodes[sid]['callFrame'];k=f"{cf['functionName'] or '(anon)'}:{cf['lineNumber']}"
        self[k]=self.get(k,0)+d
    tot=sum(self.values())
    for k,v in sorted(self.items(),key=lambda x:-x[1])[:18]:print(f"{v/1000:8.0f}ms {100*v/tot:5.1f}% {k}")
    if errors:raise RuntimeError('Profile scenario page errors: '+repr(errors))
    print('startup phases ms',json.dumps(phases))
    b.close()
