#!/usr/bin/env python3
"""Captures for the emblem board, one page load: New kingdom, save list, in-game banner (castle close-up).
   python3 docs/studio-boards/emblems/cap.py PREFIX [path/to/naranxia_readable.html] [theme json] [setup,saves,game]  -> PREFIX_setup.png, PREFIX_saves.png, PREFIX_game.png here.
   Menus: the 3D title scene is grabbed once, the renderer is stubbed, each shot = plate + UI canvases (as docs/studio-boards/revamp/cap.py)."""
import sys,time,base64
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from playwright.sync_api import sync_playwright
import fontroute
PRE=sys.argv[1];HTML=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT/'dist/naranxia_readable.html'
THEME=sys.argv[3] if len(sys.argv)>3 else '{"n":"Goldcrest","c":0,"e":2,"c2":10,"p":2}'
ONLY=sys.argv[4].split(',') if len(sys.argv)>4 else ['setup','saves','game']
W,H=1280,720;T0=time.time()
SAVES="[{name:'Wave 12 - 2026-11-08 21h14',t:Date.now()-864e5},{name:'Wave 7 - 2026-11-07 18h40',t:Date.now()-2*864e5},{name:'Wave 3 - 2026-11-05 09h02',t:Date.now()-4*864e5}]"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':W,'height':H})
    ctx.add_init_script("try{localStorage.setItem('dk_seen','1');localStorage.setItem('dk_tut','1');localStorage.setItem('dk_theme','%s')}catch(e){}"%THEME)
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    fontroute.setup(pg)
    pg.goto(HTML.resolve().as_uri(),timeout=300000);pg.evaluate("()=>{window.__cam={p:[-3,2.4,13],l:[0,5.8,-40]}}");pg.keyboard.press('Shift');pg.wait_for_timeout(7000)
    print('loaded',round(time.time()-T0),flush=True)
    pg.evaluate("""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const e=document.getElementById('g3'),o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;o.getContext('2d').drawImage(e,0,0,o.width,o.height);window.__plate=o;window.__rr=renderer.render;renderer.render=()=>{};R()})))""")
    pg.mouse.move(W*.9,H*.9)
    GRAB="""()=>new Promise(R=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=document.createElement('canvas');o.width=innerWidth;o.height=innerHeight;const x=o.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,o.width,o.height);
      const f=document.getElementById('g3').style.filter;x.filter=f||'none';x.drawImage(window.__plate,0,0);x.filter='none';for(const id of ['cw','c']){const e=document.getElementById(id);if(e)x.drawImage(e,0,0,o.width,o.height)}R(o.toDataURL('image/png'))})))"""
    def shot(n):
        pg.wait_for_timeout(600);d=pg.evaluate(GRAB);(D/('%s_%s.png'%(PRE,n))).write_bytes(base64.b64decode(d.split(',')[1]));print(n,round(time.time()-T0),errs[:2],flush=True)
    if 'setup' in ONLY:pg.evaluate("()=>{settingsState.setupOpen=true}");shot('setup')
    if 'saves' in ONLY:pg.evaluate("()=>{settingsState.setupOpen=false;saveMenuState.svList=%s;saveMenuState.saveOpen=true}"%SAVES);shot('saves')
    if 'game' not in ONLY:b.close();sys.exit()
    r=pg.evaluate("""async()=>{settingsState.setupOpen=false;saveMenuState.saveOpen=false;window.__cam=null;renderer.render=window.__rr;let s=7;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
      rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
      for(const R of RESP){R.g=9000;R.w=7000;R.s=5000}
      for(const[dx,dy]of[[-3,6],[7,6],[2,8]]){const f=freeTile(CS.tx+dx,CS.ty+dy);build('tower',f[0],f[1])}
      for(let i=0;i<30;i++)update(.1);for(const q of structs){q.prog=1;q.tier=1;buildStructMesh(q)}{const tw=structs.filter(q=>q.type==='tower').pop();CAM.x=tw.tx+1;CAM.z=tw.ty-2.5;CAM.dist=9;CAM.pitch=.5;CAM.yaw=0}
      const o=renderer.render;renderer.render=function(){};await new Promise(r=>setTimeout(r,4000));renderer.render=o;render3D(.05);Math.random=RR;return 'game ok'}""")
    print(r,round(time.time()-T0),flush=True)
    pg.wait_for_timeout(2500);pg.screenshot(path=str(D/('%s_game.png'%PRE)),timeout=300000)
    print('ERRS',errs[:4],round(time.time()-T0));b.close()
