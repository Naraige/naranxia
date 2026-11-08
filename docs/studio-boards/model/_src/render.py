#!/usr/bin/env python3
"""Renders the model boards (run `npm run build` and make_script.py first).
usage: python3 docs/studio-boards/model/_src/render.py [tag ...]   tag 0 = production look, A/B/C = variants
output: docs/studio-boards/model/_raw/<tag>/*.jpg (compose.py then builds the board images)"""
import sys,json,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
from playwright.sync_api import sync_playwright
tags=sys.argv[1:] or ['0','A','B','C']
UNITS_ROWS=[{'name':'r1','units':['archer','scout','archer','scout']},
 {'name':'r2','units':['guard','king','guard','king']},
 {'name':'r3','units':['peasant','engineer','envoy','engineer','envoy']}]
BKEYS=['observatory','forge','granary','sanctuary']
BROWS=[{'name':'r4','units':BKEYS,'views':[[.35,.95],[.35,1.2]]}]
for tag in tags:
    mv='' if tag=='0' else ','.join(f'{k}:{tag}' for k in ['scout','king','guard','engineer','envoy']+BKEYS)
    out=ROOT/'docs/studio-boards/model/_raw'/tag;out.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
        pg=b.new_page(viewport={'width':600,'height':400});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e.stack)[:400]))
        pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.route('**/cdn.jsdelivr.net/**',lambda r:r.abort())
        pg.add_init_script('window.requestAnimationFrame=()=>0;window.__MV='+json.dumps(mv));pg.set_default_timeout(240000);pg.goto((ROOT/'dist'/__import__('os').environ.get('HTML','naranxia_readable.html')).resolve().as_uri(),wait_until='domcontentloaded');pg.wait_for_timeout(5000)
        pg.evaluate(f"window.__MV={json.dumps(mv)};window.__N=1280;window.__ROWS={json.dumps(UNITS_ROWS)};window.__BROWS={json.dumps(BROWS)};window.__BSP=2.6;window.__SP=.85")
        d=json.loads(pg.evaluate((ROOT/'docs/studio-boards/model/_src/j_board.js').read_text(encoding='utf-8')))
        for k,v in d.items():(out/(k+'.jpg')).write_bytes(base64.b64decode(v.split(',')[1]))
        print(tag,len(d),'ERRS',errs[:3]);b.close()
