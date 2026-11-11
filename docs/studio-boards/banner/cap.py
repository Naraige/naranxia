#!/usr/bin/env python3
"""Captures for the banner board, one page load, 3D stubbed after one title plate.
   python3 docs/studio-boards/banner/cap.py [sheet,small,setup,saves,hud]  -> PNG files in _src/ (see make_board.py).
   sheet = every emblem x variant (art check); setup = New kingdom card per variant and theme; saves = save list;
   hud = top-left of the in-game HUD (game started with the 3D stubbed: black background)."""
import sys,time,base64,json
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2];OUT=D/'_src';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
ONLY=sys.argv[1].split(',') if len(sys.argv)>1 else ['sheet','small','setup','saves','hud']
W,H=1280,720;T0=time.time()
THEMES=[{"n":"Goldcrest","c":0,"e":2,"c2":10,"p":2},{"n":"Redmere","c":1,"e":13,"c2":11,"p":1},{"n":"Oakenshield","c":9,"e":6,"c2":3,"p":5}]
VAR=['','B','C','D']
def save(n,d):(OUT/n).write_bytes(base64.b64decode(d.split(',')[1]));print(n,round(time.time()-T0),flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':W,'height':H})
    ctx.add_init_script("try{localStorage.setItem('dk_seen','1');localStorage.setItem('dk_tut','1');localStorage.setItem('dk_theme','%s')}catch(e){}"%json.dumps(THEMES[0]))
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_readable.html').resolve().as_uri(),timeout=300000);pg.keyboard.press('Shift');pg.wait_for_timeout(7000)
    print('loaded',round(time.time()-T0),errs[:2],flush=True)
    pg.evaluate("""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const e=document.getElementById('g3'),o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;o.getContext('2d').drawImage(e,0,0,o.width,o.height);window.__plate=o;renderer.render=()=>{};R()})))""")
    pg.mouse.move(W*.9,H*.95)
    SET="(a)=>{if(a[0])window.__BANNER2=a[0];else delete window.__BANNER2;Object.assign(THEME,a[1]);drawBanner()}"
    GRAB="""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;const x=o.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,o.width,o.height);
      if(!window.__noplate){const f=document.getElementById('g3').style.filter;x.filter=f||'none';x.drawImage(window.__plate,0,0);x.filter='none'}for(const id of ['cw','c']){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,o.width,o.height)}R(o.toDataURL('image/png'))})))"""
    def shot(n):pg.wait_for_timeout(500);save(n,pg.evaluate(GRAB))
    if 'sheet' in ONLY:
        save('sheet.png',pg.evaluate("""()=>{const o=document.createElement('canvas');o.width=16*100+8;o.height=3*200+8;const g=o.getContext('2d');g.fillStyle='#1b2230';g.fillRect(0,0,o.width,o.height);
          ['B','C','D'].forEach((v,r)=>{for(let i=0;i<16;i++){window.__BANNER2=v;Object.assign(THEME,{c:i%14,e:i,c2:(i*5+10)%14,p:i%8});const s=bannerIcon();g.imageSmoothingEnabled=false;g.drawImage(s,8+i*100,8+r*200,72,108);
           g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(s,8+i*100,124+r*200,26,39);g.drawImage(s,44+i*100,124+r*200,10.67,16);g.drawImage(s,64+i*100,124+r*200,21.33,32)}});delete window.__BANNER2;return o.toDataURL('image/png')}"""))
    if 'small' in ONLY:
        for v in VAR:
            pg.evaluate(SET,[v,THEMES[0]])
            save('small_%s.png'%(v or 'A'),pg.evaluate("""()=>{const o=document.createElement('canvas');o.width=60;o.height=40;const g=o.getContext('2d');g.fillStyle='#1b2230';g.fillRect(0,0,60,40);const s=bannerIcon();
              g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(s,6,12,16/1.5,16);g.drawImage(s,30,4,32/1.5,32);return o.toDataURL('image/png')}"""))
    if 'setup' in ONLY:
        pg.evaluate("()=>{settingsState.setupOpen=true}")
        for ti,t in enumerate(THEMES):
            for v in VAR:pg.evaluate(SET,[v,t]);shot('setup_%s_%d.png'%(v or 'A',ti))
    if 'saves' in ONLY:
        pg.evaluate("()=>{settingsState.setupOpen=false;saveMenuState.svList=[{name:'Wave 12 - 2026-11-08 21h14',t:Date.now()-864e5},{name:'Wave 7 - 2026-11-07 18h40',t:Date.now()-2*864e5}];saveMenuState.saveOpen=true}")
        for v in VAR:pg.evaluate(SET,[v,THEMES[0]]);shot('saves_%s.png'%(v or 'A'))
    if 'hud' in ONLY:
        r=pg.evaluate("""async()=>{settingsState.setupOpen=false;saveMenuState.saveOpen=false;window.__noplate=1;let s=7;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
          rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;for(let i=0;i<10;i++)update(.1);Math.random=RR;return 'game ok'}""")
        print(r,errs[:2],flush=True);pg.wait_for_timeout(1500)
        for v in VAR:pg.evaluate(SET,[v,THEMES[0]]);shot('hud_%s.png'%(v or 'A'))
    print('ERRS',errs[:4],round(time.time()-T0));b.close()
