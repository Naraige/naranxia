import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
# co-op choice events (events-camps): the decision is a lockstep command, the first click decides for both, an unanswered event
# takes its default after its sim-time deadline, and an event open during a resync survives it. Both machines must stay identical.
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
DUR=float(sys.argv[2]) if len(sys.argv)>2 else 90
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 render3D=function(){};
 const _e=mpExec;mpExec=function(c,m){if(c.k==='zz'){const cs=c.p?CS2:CS;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,i%5===4?'runner':'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}
  if(c.k==='zev'){evPush(c.e);if(c.ttl&&EVS.cur&&EVS.cur.i===c.e.i)EVS.cur.exp=time+c.ttl;return}return _e(c,m)};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=5000;R.w=5000;R.s=5000}};
 return 'ok'}"""
REC="""()=>{window.__H={};const _u=update;update=function(dt){_u(dt);if(!MP.on)return;const t=MP.tick;
  const us=units.map(u=>u.uid+':'+u.type+':'+u.t+':'+u.x.toFixed(2)+','+u.y.toFixed(2)+':'+(u.hp|0)).join('|');
  const rs=RESP.map(R=>R.g.toFixed(2)+','+R.w.toFixed(2)+','+R.s.toFixed(2)+','+(R.f||0).toFixed(2)+','+(R.ren|0)).join('/');
  const h=s=>{let x=0;for(let i=0;i<s.length;i++)x=(Math.imul(x,31)+s.charCodeAt(i))|0;return x};
  window.__H[t]=[h(us),h(rs),h(JSON.stringify(EVS)),units.length,structs.length].join(',')}}"""
def P(*a):print(*a,flush=True)
def pump(A,B,n=1):
    for _ in range(n):
        a=A.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        b=B.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        if a:B.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",a)
        if b:A.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",b)
        time.sleep(.015)
GETH="()=>{const o=window.__H;window.__H={};return o}"
HA={};HB={};bad=[None]
def check():
    HA.update(A.evaluate(GETH));HB.update(B.evaluate(GETH))
    for t in sorted(set(HA)&set(HB),key=int):
        if HA[t]!=HB[t] and bad[0] is None:
            bad[0]=t;P('FIRST DIVERGENCE tick',t,'A',HA[t],'B',HB[t])
        if t in HA and t in HB:
            del HA[t];del HB[t]
def waitT(sec):
    t0=time.time();k=0
    while time.time()-t0<sec:
        pump(A,B);k+=1
        if k%10==0:check()
    check()
SNAP="()=>JSON.stringify({cur:EVS.cur?{k:EVS.cur.k,i:EVS.cur.i,left:Math.round(EVS.cur.exp-time)}:null,q:EVS.q.length,pay:EVS.pay.map(p=>p.g),ren:RESP.map(R=>R.ren|0),g:RESP.map(R=>Math.round(R.g)),f:RESP.map(R=>Math.round(R.f||0)),ds:MP.desync})"
def snap(lbl):
    a=json.loads(A.evaluate(SNAP));b=json.loads(B.evaluate(SNAP));same=(a==b)
    P(lbl,'A',json.dumps(a),'' if same else 'B '+json.dumps(b));return a,b,same
ok=[True]
def need(c,msg):
    if not c:ok[0]=False;P('FAIL',msg)
CAR=lambda i:{'k':'car','i':i,'a':{'g':100,'w':60,'s':40}}
ENV=lambda i:{'k':'env','i':i,'a':{'g':80,'f':50},'cn':'Ironhold - merchants','mu':1.5}
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport={'width':480,'height':320});errs=[]
        pg.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:300]))
        fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.goto((Path(ROOT)/'dist'/html).resolve().as_uri(),timeout=180000);pg.wait_for_timeout(2500)
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("()=>{rollWorld();mpWorldSync()}");pump(A,B,3)
    r=A.evaluate("""()=>{if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<300&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else if(Math.hypot(a.tx-s.tx,a.ty-s.ty)>=40)b=s}
     MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    A.evaluate(REC);pump(A,B,1);B.evaluate(REC);P('start',r)
    waitT(3);snap('start')
    # 1. the guest clicks "escort": command through lockstep, same result on both
    A.evaluate("(e)=>{mpPush({k:'zev',e})}",CAR(9001));waitT(1.5)
    a,b,s=snap('car open');need(s and a['cur'] and a['cur']['i']==9001,'car open on both')
    g0=a['g'][0]
    B.evaluate("()=>{evChoose(1)}");waitT(1.5)
    a,b,s=snap('car escorted');need(s and a['cur'] is None and a['pay']==[250],'escort chosen on both: '+json.dumps(a))
    need(a['g'][0]==g0,'escort pays later, not now')
    # 2. both click at the same moment, differently: the first command decides, both machines agree
    A.evaluate("(e)=>{mpPush({k:'zev',e})}",ENV(9002));waitT(1.5)
    a,b,s=snap('env open');need(s and a['cur'] and a['cur']['k']=='env','env open on both')
    A.evaluate("()=>{evChoose(0)}");B.evaluate("()=>{evChoose(1)}");waitT(2)
    a,b,s=snap('env decided');need(s and a['cur'] is None,'env decided identically')
    need((a['ren']==[0,0]) or (a['ren']==[1,1]),'renown consistent: '+json.dumps(a['ren']))
    # a late click on the closed event does nothing
    B.evaluate("()=>{evChoose(1)}");waitT(1)
    a2,b2,s=snap('late click');need(s and a2['ren']==a['ren'] and a2['g']==a['g'],'late click ignored')
    # 3. nobody answers: default choice after the sim-time deadline
    A.evaluate("(e)=>{mpPush({k:'zev',e,ttl:3})}",CAR(9003));waitT(1)
    a,b,s=snap('car timing');need(s and a['cur'] and a['cur']['i']==9003,'timed car open')
    g1=a['g'][0]
    waitT(6)
    a,b,s=snap('car timed out');need(s and a['cur'] is None and a['g'][0]>=g1+100,'timeout took the goods on both: '+json.dumps(a))
    # 4. an escorted caravan lands at the same tick on both
    need(a['pay']==[250] or a['pay']==[],'pay list tolerated')
    # 5. an event open during a resync survives it
    A.evaluate("(e)=>{mpPush({k:'zev',e,ttl:60})}",ENV(9004));waitT(1.5)
    a,b,s=snap('env before resync');need(s and a['cur'] and a['cur']['i']==9004,'env open before resync')
    P('corrupt B',B.evaluate("()=>{RESP[0].g+=17;EVS.pay.push({t:time+500,g:1});return 1}"))
    RSQ="()=>JSON.stringify({ep:MP.ep,rsy:MP.rsy})"
    t0=time.time();seen=False
    while time.time()-t0<DUR:
        pump(A,B)
        a=json.loads(A.evaluate(RSQ));b=json.loads(B.evaluate(RSQ))
        if a['rsy'] or b['rsy']:seen=True
        if seen and a['ep']==1 and b['ep']==1 and not a['rsy'] and not b['rsy']:break
    P('resync seen',seen,'after',round(time.time()-t0,1),'s')
    need(seen,'resync happened')
    HA.clear();HB.clear();A.evaluate(GETH);B.evaluate(GETH)
    waitT(3)
    a,b,s=snap('after resync');need(s and a['cur'] and a['cur']['i']==9004,'open event identical after resync: '+json.dumps([a,b]))
    A.evaluate("()=>{evChoose(1)}");waitT(2)
    a,b,s=snap('final');need(s and a['cur'] is None and a['pay'] in ([250],[]),'final identical (escorted caravan on its way or already paid, same on both)')
    need(s and not a['ds'],'no desync flag')
    need(bad[0] is None,'no divergence')
    P('RESULT','OK' if ok[0] else 'FAIL','divergence' if bad[0] else '')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
