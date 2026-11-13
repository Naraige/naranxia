import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from playwright.sync_api import sync_playwright
# usage (from anywhere): python tools/run.py tests/x.js [out.png|-] [W H wait] [html in dist/, default naranxia_readable.html]
# the script is the source of a JS function evaluated in the page once the game has loaded; it may return a string
js=Path(sys.argv[1]).read_text(encoding='utf-8');out=Path(sys.argv[2]) if len(sys.argv)>2 and sys.argv[2]!='-' else None
W=int(sys.argv[3]) if len(sys.argv)>3 else 1000;H=int(sys.argv[4]) if len(sys.argv)>4 else 620;wait=int(sys.argv[5]) if len(sys.argv)>5 else 3000
html=sys.argv[6] if len(sys.argv)>6 else 'naranxia_readable.html'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':W,'height':H});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:400]))
    pg.on('console',lambda m:print('LOG',m.text[:400],flush=True) if m.type in('error','log') and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    sys.path.insert(0,str(ROOT/'tools'))
    try:
        import fontroute;fontroute.setup(pg)
    except Exception:pass
    pg.goto((ROOT/'dist'/html).resolve().as_uri(),timeout=900000);pg.wait_for_timeout(3500)
    try:
        r=pg.evaluate(js)
        if r is not None: print(r,flush=True)
    except Exception as e: print('EXC',str(e)[:600])
    if out: pg.wait_for_timeout(wait);pg.screenshot(path=str(out.resolve()),timeout=120000)
    print('ERRS',errs[:4]);b.close()
