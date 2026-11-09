#!/usr/bin/env python3
"""Load 2 (~120 s): real 1280x720 captures in game, in layers. pg_plate.png = 3D scene only; g_*.png = the 2D UI layers (transparent):
 g_base (nothing selected: build menu), g_castle (castle selected), g_unit (knight selected), g_esc (Esc menu), g_end (end screen).
Needs npm run build. Same setup as docs/studio-boards/look/capture.py. The 3D render is stubbed after the plate."""
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
HUD="""async()=>{let s=7;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;for(const R of RESP){R.g=99999;R.w=99999;R.s=99999;R.f=999}
 const c=CS,cx=c.tx+1,cy=c.ty+1;
 for(const t of['knight','knight','archer','archer','archer','peasant','peasant','peasant','peasant'])units.push(mkU(0,t,(cx+2+Math.random()*3)*TS,(cy+3+Math.random()*3)*TS,null,-1));
 for(let i=0;i<15;i++)update(.1);return 'ok'}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_readable.html').as_uri(),timeout=120000);pg.wait_for_timeout(3000)
    print('loaded',round(time.time()-T0),flush=True)
    print(pg.evaluate(HUD),flush=True);pg.wait_for_timeout(2500)
    save(pg,"['g3']",'pg_plate.png',True)
    pg.evaluate("()=>{renderer.render=()=>{}}");pg.mouse.move(640,300);pg.wait_for_timeout(1500)
    save(pg,"['cw','c']",'g_base.png')
    pg.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&s.t===0)||structs[0];return 1}");pg.wait_for_timeout(1500);save(pg,"['cw','c']",'g_castle.png')
    pg.evaluate("()=>{selB=null;const k=units.find(u=>u.t===0&&u.type==='knight');k.sel=true;return 1}");pg.wait_for_timeout(1500);save(pg,"['cw','c']",'g_unit.png')
    pg.evaluate("()=>{for(const u of units)u.sel=false;return 1}");pg.keyboard.press('Escape');pg.wait_for_timeout(1500);save(pg,"['cw','c']",'g_esc.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(500);pg.evaluate("()=>{waveN=12;kills=87;over=true;return 1}");pg.wait_for_timeout(2500);save(pg,"['cw','c']",'g_end.png')
    b.close()
