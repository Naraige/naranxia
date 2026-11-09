#!/usr/bin/env python3
"""Load 1 (~110 s): real 1280x720 captures of the title screen, in layers.
 plate.png = 3D scene only (fixed camera, no UI); ui_*.png = the 2D UI layers on transparent background (composited over plate.png by make.py).
 ui_rest, ui_hover (mouse on Singleplayer), ui_settings (gear), ui_setup (Singleplayer setup).
Needs npm run build. Fonts offline via tools/fontroute.py. The 3D render is stubbed after the plate (headless WebGL is slow)."""
import sys,base64,time
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
T0=time.time()
G=lambda ids,bg:"""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=1280;o.height=720;const x=o.getContext('2d');
 %s;for(const id of %s){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,1280,720)}R(o.toDataURL('image/png'))})))"""%(("x.fillStyle='#000';x.fillRect(0,0,1280,720)" if bg else "0"),ids)
def save(pg,ids,name,bg=False):
    d=pg.evaluate(G(ids,bg));(D/name).write_bytes(base64.b64decode(d.split(',')[1]));print(name,round(time.time()-T0),flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_readable.html').as_uri(),timeout=120000);pg.evaluate("()=>{window.__cam={p:[-3,2.4,13],l:[0,5.8,-40]}}");pg.wait_for_timeout(5000)
    print('loaded',round(time.time()-T0),flush=True)
    save(pg,"['g3']",'plate.png',True)
    pg.evaluate("()=>{renderer.render=()=>{}}");pg.mouse.move(60,300);pg.wait_for_timeout(2500)
    save(pg,"['cw','c']",'ui_rest.png')
    pg.mouse.move(640,257);pg.wait_for_timeout(1200);save(pg,"['cw','c']",'ui_hover.png')
    pg.mouse.click(1244,32);pg.wait_for_timeout(1500);save(pg,"['cw','c']",'ui_settings.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(800);pg.mouse.click(640,257);pg.wait_for_timeout(1500);save(pg,"['cw','c']",'ui_setup.png')
    b.close()
