#!/usr/bin/env python3
"""Horde at game distance for one look. usage: python3 docs/studio-boards/mutants/_src/horde.py A|B out.png [zoom=15]
(after npm run build; one run at a time). Prints units, draw calls and triangles of one frame."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/'tools'))
import fontroute
mode=sys.argv[1];out=sys.argv[2];zoom=sys.argv[3] if len(sys.argv)>3 else '15'
pre=(ROOT/'tools/shots/_prelude.js').read_text(encoding='utf-8').replace('SEED_','7')
src=(HERE/'horde.js').read_text(encoding='utf-8').replace('//@PRELUDE',pre).replace('MODE_','all' if mode=='B' else '').replace('ZOOM_',zoom)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.add_init_script("try{localStorage.setItem('dk_tut','1')}catch(e){}")
    pg.goto((ROOT/'dist/naranxia_readable.html').resolve().as_uri(),timeout=300000);pg.wait_for_timeout(3500)
    try:print(pg.evaluate(src),flush=True)
    except Exception as e:print('EXC',str(e)[:600])
    pg.wait_for_timeout(1500);pg.screenshot(path=out,timeout=300000);print(out,'errors:',errs[:2]);b.close()
