import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
# usage: python3 town.py <html in dist/> <out prefix>   -> <prefix>_day.png, <prefix>_night.png, <prefix>.json (frame time, calls, triangles)
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/'tools'))
html=ROOT/'dist'/sys.argv[1];pre=sys.argv[2];TMO=900000
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    try:
        import fontroute;fontroute.setup(pg)
    except Exception:pass
    pg.add_init_script("try{localStorage.setItem('dk_tut','1')}catch(e){}")
    pg.goto(html.resolve().as_uri(),timeout=TMO);pg.wait_for_timeout(3500)
    r=pg.evaluate((HERE/'town_day.js').read_text());print(r,flush=True);open(pre+'.json','w').write(r)
    pg.wait_for_timeout(1500);pg.screenshot(path=pre+'_day.png',timeout=TMO)
    for w in ('ruin','site'):
        pg.evaluate("window.__W='%s'"%w);print(pg.evaluate((HERE/'town_ruin.js').read_text()),flush=True)
        pg.wait_for_timeout(500);pg.screenshot(path=pre+'_'+w+'.png',timeout=TMO)
    pg.evaluate("CAM.x=CS.tx+2.5;CAM.z=CS.ty+11;CAM.dist=+(window.__CD||34);CAM.pitch=.86")
    print(pg.evaluate((HERE/'town_night.js').read_text()),flush=True)
    pg.wait_for_timeout(500);pg.screenshot(path=pre+'_night.png',timeout=TMO)
    print('ERRS',errs[:4]);b.close()
