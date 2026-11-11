import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
# tools/run.py with the block world switched on before the game starts: run_on.py tests/det.js <html in dist>
ROOT=Path.cwd();js=Path(sys.argv[1]).read_text(encoding='utf-8');html=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1000,'height':620});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.add_init_script("try{localStorage.setItem('dk_blocks','1')}catch(e){}")
    pg.goto((ROOT/'dist'/html).resolve().as_uri(),timeout=180000);pg.wait_for_timeout(3500)
    print('BLOCKS',pg.evaluate("JSON.stringify([blocksState.on,blocksState.T,blocksState.D])"),flush=True)
    try:
        r=pg.evaluate(js)
        if r is not None: print(r,flush=True)
    except Exception as e: print('EXC',str(e)[:600])
    print('ERRS',errs[:4]);b.close()
