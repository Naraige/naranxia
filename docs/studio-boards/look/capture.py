#!/usr/bin/env python3
"""One game load, three real 1280x720 captures: title (a_title.png), HUD with troop panel + build menu (a_hud.png), end screen (a_end.png).
Needs: npm run build. Same setup as tools/run.py (swiftshader, offline fonts)."""
import sys
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
GRAB="""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=1280;o.height=720;const x=o.getContext('2d');
 for(const id of['g3','cw','c']){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,1280,720)}R(o.toDataURL('image/png'))})))"""
STOP="()=>{window.requestAnimationFrame=()=>0;return 'raf off'}"
HUD="""async()=>{let s=7;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;for(const R of RESP){R.g=99999;R.w=99999;R.s=99999;R.f=999}
 const c=CS,cx=c.tx+1,cy=c.ty+1;
 for(const t of['knight','knight','archer','archer','archer','peasant','peasant','peasant','peasant'])units.push(mkU(0,t,(cx+2+Math.random()*3)*TS,(cy+3+Math.random()*3)*TS,null,-1));
 for(let i=0;i<15;i++)update(.1);
 dispatchEvent(new KeyboardEvent('keydown',{key:'F2'}));return 'ok'}"""
END="""()=>{waveN=12;kills=87;over=true;return 'ok'}"""
import base64
def save(pg,name):
    d=pg.evaluate(GRAB);open(str(D/name),'wb').write(base64.b64decode(d.split(',')[1]));print(name,flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_readable.html').as_uri(),timeout=180000);pg.wait_for_timeout(3500)
    save(pg,'a_title.png')
    pg.evaluate('()=>{pg0=1}') if False else None
    print(pg.evaluate(HUD),flush=True);pg.wait_for_timeout(4000);save(pg,'a_hud.png')
    print(pg.evaluate(END),flush=True);pg.wait_for_timeout(4000);save(pg,'a_end.png')
    b.close()
