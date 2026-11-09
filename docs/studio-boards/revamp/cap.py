#!/usr/bin/env python3
"""Captures of every menu screen in one page load (needs npm run build).
   python3 docs/studio-boards/revamp/cap.py PREFIX [W H] [screens,comma]   -> PREFIX_<screen>.png in this folder
   The 3D title scene is grabbed once (plate), then the renderer is stubbed (headless WebGL is slow) and every shot is composed in the page:
   plate (with the CSS filter the game puts on the 3D canvas) + the two UI canvases. The in-game shots (esc, end) reuse the plate as a backdrop."""
import sys,time,base64
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
PRE=sys.argv[1];W=int(sys.argv[2]) if len(sys.argv)>2 else 1280;H=int(sys.argv[3]) if len(sys.argv)>3 else 720
ONLY=sys.argv[4].split(',') if len(sys.argv)>4 else None
T0=time.time()
SAVES="[{name:'Wave 12 - 2026-11-08 21h14',t:Date.now()-864e5},{name:'Wave 7 - 2026-11-07 18h40',t:Date.now()-2*864e5},{name:'Wave 3 - 2026-11-05 09h02',t:Date.now()-4*864e5}]"
CLOSE="titleDebug.rec(false);titleDebug.notes(false);titleDebug.chr(false);titleDebug.modes(false);languageState.langOpen=false;saveMenuState.saveOpen=false;settingsState.setupOpen=false;settingsState.settingsOpen=false;"
SCR=[('title',"0"),('modes',"titleDebug.modes(true)"),('setup',"settingsState.setupOpen=true"),
 ('saves',"saveMenuState.svList=%s;saveMenuState.saveOpen=true"%SAVES),('lang',"languageState.langOpen=true"),
 ('chronicle',"titleDebug.chr(true)"),('records',"titleDebug.rec(true)"),('notes',"titleDebug.notes(true)"),
 ('settings0',"settingsState.settingsOpen=true;settingsDebug.tab(0)"),('settings1',"settingsState.settingsOpen=true;settingsDebug.tab(1)"),('settings3',"settingsState.settingsOpen=true;settingsDebug.tab(3)")]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':W,'height':H})
    ctx.add_init_script("try{localStorage.setItem('dk_last','{\"w\":9,\"k\":120}');localStorage.setItem('dk_seen','1')}catch(e){}")
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto((ROOT/'dist/naranxia_readable.html').as_uri(),timeout=300000);pg.evaluate("()=>{window.__cam={p:[-3,2.4,13],l:[0,5.8,-40]}}");pg.keyboard.press('Shift');pg.wait_for_timeout(7000)
    print('loaded',round(time.time()-T0),flush=True)
    pg.evaluate("""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const e=document.getElementById('g3'),o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;o.getContext('2d').drawImage(e,0,0,o.width,o.height);window.__plate=o;renderer.render=()=>{};R()})))""")
    print('plate',round(time.time()-T0),flush=True)
    pg.mouse.move(W*.75,H*.5)
    GRAB="""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;const x=o.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,o.width,o.height);
      const f=document.getElementById('g3').style.filter;x.filter=f||'none';x.drawImage(window.__plate,0,0);x.filter='none';for(const id of ['cw','c']){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,o.width,o.height)}R(o.toDataURL('image/png'))})))"""
    def shot(n):
        pg.wait_for_timeout(500);d=pg.evaluate(GRAB);(D/('%s_%s.png'%(PRE,n))).write_bytes(base64.b64decode(d.split(',')[1]));print(n,round(time.time()-T0),errs[:2],flush=True)
    for n,js in SCR:
        if ONLY and n not in ONLY:continue
        pg.evaluate("()=>{%s%s}"%(CLOSE,js))
        if n=='saves' and PRE!='A':pg.wait_for_timeout(400);pg.mouse.click(W*.5,H*.253);pg.mouse.move(W*.75,H*.7)
        shot(n)
    if not ONLY or 'esc' in ONLY or 'end' in ONLY:
        pg.evaluate("()=>{%srollWorld();reset();startGame()}"%CLOSE);pg.wait_for_timeout(2500)
        if not ONLY or 'esc' in ONLY:
            pg.keyboard.press('Escape');shot('esc');pg.keyboard.press('Escape')
        if not ONLY or 'end' in ONLY:
            pg.evaluate("()=>{startGame();over=true}");shot('end')
    print('ERRS',errs[:4]);b.close()
