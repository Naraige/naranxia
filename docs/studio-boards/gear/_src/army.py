#!/usr/bin/env python3
"""In-game army picture and frame cost for one gear look (A = current, B = window.__GEAR2='all'). usage: python3 docs/studio-boards/gear/_src/army.py A|B out.png [zoom=24] [frames=20]
(after npm run build; one run at a time). Prints units, draw calls, triangles and the median frame time of render3D (software GL: compare A and B, not absolutes)."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/'tools'))
import fontroute
mode=sys.argv[1];out=sys.argv[2];zoom=sys.argv[3] if len(sys.argv)>3 else '24';frames=sys.argv[4] if len(sys.argv)>4 else '20'
# optional camera: pitch yaw ox oy (defaults = the units board camera: .95 0 .3 7.5)
camv=(sys.argv[5:9]+['.95','0','.3','7.5'][len(sys.argv[5:9]):])
pre=(ROOT/'tools/shots/_prelude.js').read_text(encoding='utf-8').replace('SEED_','7')
src=(HERE/'army.js').read_text(encoding='utf-8').replace('//@PRELUDE',pre).replace('MODE_','all' if mode=='B' else '').replace('ZOOM_',zoom).replace('FRAMES_',frames).replace('PITCH_',camv[0]).replace('YAW_',camv[1]).replace('OX_',camv[2]).replace('OY_',camv[3])
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
