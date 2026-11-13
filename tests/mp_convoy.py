import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
# co-op: the guest sends a convoy (wood and stone) to the host; both machines must see the same porters,
# the same delivery at the same tick, the porters must walk back home, and the games must not drift apart.
# usage: python3 tests/mp_convoy.py [naranxia_readable.html] [seconds, default 150] [shot.png]
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
DUR=float(sys.argv[2]) if len(sys.argv)>2 else 150
SHOT=sys.argv[3] if len(sys.argv)>3 else None
INIT="""()=>{'use strict';window.__out=[];window.__dl=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=5000;R.w=5000;R.s=5000}waveT=1e9};
 const _c=convoyStep;convoyStep=function(u,dt){const c=u.cv,b=c&&c.back,k=c&&{to:c.to,from:c.from,g:c.g,w:c.w,s:c.s,f:c.f,t:c.t};_c(u,dt);
  if(k&&!b&&u.cv&&u.cv.back)window.__dl.push({uid:u.uid,tick:MP.tick,to:k.to,from:k.from,g:k.g,w:k.w,s:k.s,f:k.f,ret:k.t>120,R:RESP.map(R=>[Math.round(R.w),Math.round(R.s)])})};
 return 'ok'}"""
REC="""()=>{window.__H={};const _u=update;update=function(dt){_u(dt);if(!MP.on)return;const t=MP.tick;
  const us=units.map(u=>u.uid+':'+u.type+':'+u.t+':'+u.x.toFixed(2)+','+u.y.toFixed(2)+':'+(u.hp|0)+':'+(u.job||'')+':'+(u.cv?u.cv.back+'/'+u.cv.w+'/'+u.cv.s:'')).join('|');
  const rs=RESP.map(R=>R.g.toFixed(2)+','+R.w.toFixed(2)+','+R.s.toFixed(2)+','+(R.f||0).toFixed(2)).join('/');
  const h=s=>{let x=0;for(let i=0;i<s.length;i++)x=(Math.imul(x,31)+s.charCodeAt(i))|0;return x};
  window.__H[t]=h(us)+','+h(rs)}}"""
def P(*a):print(*a,flush=True)
def pump(A,B,n=1):
    for _ in range(n):
        a=A.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        b=B.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        if a:B.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",a)
        if b:A.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",b)
        time.sleep(.015)
GETH="()=>{const o=window.__H;window.__H={};return o}"
HA={};HB={};bad=[None];nchk=[0]
def check():
    HA.update(A.evaluate(GETH));HB.update(B.evaluate(GETH))
    for t in sorted(set(HA)&set(HB),key=int):
        nchk[0]+=1
        if HA[t]!=HB[t] and bad[0] is None:bad[0]=t;P('FIRST DIVERGENCE tick',t,'A',HA[t],'B',HB[t])
        del HA[t];del HB[t]
CV="()=>JSON.stringify({tick:MP.tick,ds:MP.desync,ep:MP.ep,cv:units.filter(u=>u.cv).map(u=>u.uid+(u.cv.back?'b':'g')+':'+Math.round(u.x/TS)+','+Math.round(u.y/TS)).join(' '),R:RESP.map(R=>[Math.round(R.w),Math.round(R.s)]),dl:window.__dl.length,msg:msgS,note:MP.note||''})"
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport={'width':640,'height':400});errs=[]
        pg.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:300]))
        fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.goto((Path(ROOT)/'dist'/html).resolve().as_uri(),timeout=600000);pg.wait_for_timeout(2500)
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    # Fixed world and sites (seeded Math.random for the roll and the site search only): with random sites about 1 pair in 7 cannot be
    # walked by a convoy within its 120 s (long detour, no path, or porters stopped a few tiles short of the castle: see the journal),
    # which made this test fail by chance. Seed 103 gives sites (1126,624) and (1101,599): delivered in about 10 s.
    # (roll and search in one call: frames between two calls draw random numbers too)
    A.evaluate("""()=>{const R0=Math.random;let s=103;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""");pump(A,B,3)
    r=A.evaluate("""()=>{const a=window.__ab[0],b=window.__ab[1];MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    A.evaluate(REC);pump(A,B,1);B.evaluate(REC);P('start',r)
    t0=time.time()
    while time.time()-t0<5:pump(A,B)
    check()
    P('before A',A.evaluate(CV));P('before B',B.evaluate(CV))
    if SHOT:
        B.set_viewport_size({'width':1280,'height':720})
        B.evaluate("()=>{convoyOpen=true;CVA.w=120;CVA.s=60}")
        for _ in range(30):pump(A,B)
        B.screenshot(path=SHOT);B.evaluate("()=>{convoyOpen=false;CVA.w=CVA.s=0}");B.set_viewport_size({'width':640,'height':400})
    P('send',B.evaluate("()=>{sendConvoy({g:0,w:120,s:60,f:0});return MP.out?MP.out.length:-1}"))
    t0=time.time();sent=False;home=False;k=0
    while time.time()-t0<DUR:
        pump(A,B);k+=1
        if k%10==0:check()
        if k%60==0:
            a=json.loads(A.evaluate(CV));b=json.loads(B.evaluate(CV))
            P(round(time.time()-t0),'A',a['tick'],a['cv'],a['R'],'| B',b['tick'],b['cv'],b['R'])
            if a['cv']:sent=True
            if sent and not a['cv'] and not b['cv'] and a['dl'] and b['dl']:home=True;break
    check()
    dA=json.loads(A.evaluate("()=>JSON.stringify(window.__dl)"));dB=json.loads(B.evaluate("()=>JSON.stringify(window.__dl)"))
    P('deliveries A',dA);P('deliveries B',dB)
    a=json.loads(A.evaluate(CV));b=json.loads(B.evaluate(CV))
    P('end A',a);P('end B',b)
    tot=lambda D,k:sum(d[k] for d in D)
    ok=bool(dA) and dA==dB and tot(dA,'w')==120 and tot(dA,'s')==60 and all(d['to']==0 and d['from']==1 and not d['ret'] for d in dA) and home and bad[0] is None and not a['ds'] and not b['ds']
    P('hash checks',nchk[0])
    P('RESULT','OK' if ok else 'FAIL','divergence' if bad[0] else '')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
