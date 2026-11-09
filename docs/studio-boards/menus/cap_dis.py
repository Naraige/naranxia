#!/usr/bin/env python3
"""Load 3 (~90 s): ui_dis.png = title UI layer with the 'Load game' pill forced disabled (dist/naranxia_dis.html from cap_prep.py)."""
import sys,base64,time
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
GR="""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=1280;o.height=720;const x=o.getContext('2d');
 for(const id of['cw','c']){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,1280,720)}R(o.toDataURL('image/png'))})))"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_dis.html').as_uri(),timeout=120000);pg.evaluate("()=>{window.__cam={p:[-3,2.4,13],l:[0,5.8,-40]};renderer.render=()=>{}}")
    pg.mouse.move(60,300);pg.wait_for_timeout(9000)
    d=pg.evaluate(GR);(D/'ui_dis.png').write_bytes(base64.b64decode(d.split(',')[1]));print('ui_dis.png')
    b.close()
