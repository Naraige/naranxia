import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
# NOT in the quick suite (two page loads; run by hand): co-op on a map where the two castles have NO land route between them.
# The convoy quest must be skipped (state 2, no reward) on both machines at the same tick, with equal hashes all along, the guest's
# convoy must be refused, and the land-route check (convoyLinked, every 30 s of simulation) must stay cheap: it is timed on both pages.
# World and sites: trial T of tests/convoy_cut_probe.js (default 77: a river between the castles; 49 and 80: both castles on closed ledges).
# Test-only commands go through the lockstep like player commands: `qa` sets the gathered counters, `qd` marks quests done
# without reward (to reach the convoy quest), `zz` spawns zombies around a castle.
# usage: python3 tests/mp_cut.py [naranxia_readable.html] [trial, default 77]
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
TRIAL=int(sys.argv[2]) if len(sys.argv)>2 else 77
INIT="""()=>{'use strict';window.__out=[];window.__q=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _e=mpExec;mpExec=function(c,m){
  if(c.k==='qa'){QST.a=[c.g,c.w,c.s];return}
  if(c.k==='qd'){for(const id of c.ids)if(!QST.d[id])QST.d[id]=2;return}
  if(c.k==='zz'){const cs=c.p?CS2:CS;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}
  return _e(c,m)};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=5000;R.w=5000;R.s=5000;R.f=5000}waveT=1e9};
 const _b=_N.build;_N.build=function(t,x,y){const n=structs.length;const r=_b(t,x,y);for(let i=n;i<structs.length;i++){const s=structs[i];s.prog=1;s.hp=s.max;if(s.o3)buildStructMesh(s)}return r};
 for(const k of ['knight','spearman'])TRAIN[k]=3;return 'ok'}"""
# per tick: a hash of units, stocks and quest state; and a log of every quest that closes with what each player's stock gained in that tick
REC="""()=>{window.__H={};const _u=update;update=function(dt){
  const r0=RESP.map(R=>[R.g,R.w,R.s,R.f||0]),seen=window.__seen||(window.__seen={});_u(dt);if(!MP.on)return;const t=MP.tick;
  for(const id in QST.d)if(!seen[id]){seen[id]=1;window.__q.push({id,st:QST.d[id],tick:t,gain:RESP.map((R,p)=>[R.g-r0[p][0],R.w-r0[p][1],R.s-r0[p][2],(R.f||0)-r0[p][3]].map(v=>Math.round(v)))})}
  const us=units.map(u=>u.uid+':'+u.type+':'+u.t+':'+(u.pl|0)+':'+u.x.toFixed(2)+','+u.y.toFixed(2)+':'+(u.hp|0)+':'+(u.job||'')).join('|');
  const rs=RESP.map(R=>R.g.toFixed(2)+','+R.w.toFixed(2)+','+R.s.toFixed(2)+','+(R.f||0).toFixed(2)).join('/')+JSON.stringify(QST.d)+QST.a.map(v=>v.toFixed(2)).join(',')+JSON.stringify(QST.e);
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
ST="()=>JSON.stringify({tick:MP.tick,ds:MP.desync,over:over,d:Object.keys(QST.d).join(','),cur:(qCur()||{}).id||'',sp:[0,1].map(p=>units.filter(u=>u.type==='spearman'&&u.t===0&&(u.pl|0)===p&&u.hp>0).length),kn:units.filter(u=>u.type==='knight'&&u.t===0).length,z:units.filter(u=>u.t===1).length,cv:units.filter(u=>u.cv).length,msg:msgS,p0:structs.filter(x=>x.t===0&&(x.pl|0)===0).map(x=>x.type+':'+(x.prog||0).toFixed(1)).join(' '),p1:structs.filter(x=>x.t===0&&(x.pl|0)===1).map(x=>x.type+':'+(x.prog||0).toFixed(1)).join(' '),R:RESP.map(R=>[Math.round(R.g),Math.round(R.w),Math.round(R.s),Math.round(R.f||0)])})"
def st(pg):return json.loads(pg.evaluate(ST))
def wait(cond,sec,lbl):
    """pump until cond(stateA, stateB) holds (both machines) or the time is up"""
    t0=time.time();k=0
    while time.time()-t0<sec:
        pump(A,B);k+=1
        if k%10==0:check()
        if k%25==0:
            a=st(A);b=st(B)
            if cond(a) and cond(b):P(lbl,'ok after',round(time.time()-t0,1),'s tick',a['tick']);check();return True
    check();P(lbl,'TIMEOUT','A',json.dumps(st(A)),'B',json.dumps(st(B)));return False
# the k-th free spot around the player's castle (the real build rules may still refuse a spot: place() then tries the next one)
FIND="""([pl,t,k])=>{const c=pl?CS2:CS;let f=null,n=0;for(let r=5;r<16&&!f;r++)for(let a=0;a<24&&!f;a++){const x=Math.round(c.tx+Math.cos(a/24*6.283+1)*r),y=Math.round(c.ty+Math.sin(a/24*6.283+1)*r);const tt=tilesFor(t,x,y,2);if(tt.every(([i,j])=>gOK(i,j)&&valid(i,j))&&n++===k)f=[x,y]}if(!f)return 'nospot';build(t,f[0],f[1]);return JSON.stringify(f)}"""
def place(pg,pl,t):
    for k in range(0,40,5):
        r=pg.evaluate(FIND,[pl,t,k]);has=lambda s:(t+':1.0') in s['p%d'%pl].split(' ')
        if r!='nospot' and wait(has,6,'%s builds %s at %s'%('AB'[pl],t,r)):return True
    return False
TRAINJ="([pl,t,n])=>{selB=structs.find(s=>s.type==='barracks'&&(s.pl|0)===pl&&s.prog>=1);if(!selB)return 'nobarracks';for(let i=0;i<n;i++)train(t);selB=null;return MP.out.length}"
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
    A.evaluate("""(trial)=>{const R0=Math.random;let sd=(trial*7919+12345)%2147483646+1;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};for(let i=0;i<20;i++)rn();Math.random=rn;
     rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""",TRIAL);pump(A,B,3)
    r=A.evaluate("""()=>{const a=window.__ab[0],b=window.__ab[1];MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    A.evaluate(REC);pump(A,B,1);B.evaluate(REC);P('start',r)
    t0=time.time()
    while time.time()-t0<4:pump(A,B)
    check();P('begin A',json.dumps(st(A)));P('begin B',json.dumps(st(B)))
    ok=[]
    # cost of the route check on this map, on each page (pure read of the simulation state: no hash moves, checked by the run below)
    TIME="()=>{const ms=[];let r;for(let i=0;i<5;i++){const t0=performance.now();r=convoyLinked();ms.push(+(performance.now()-t0).toFixed(1))}return JSON.stringify({linked:r,ms})}"
    ta=json.loads(A.evaluate(TIME));tb=json.loads(B.evaluate(TIME));P('convoyLinked A',json.dumps(ta));P('convoyLinked B',json.dumps(tb))
    ok.append(ta['linked'] is False and tb['linked'] is False)
    # the guest tries a convoy: refused at once, nothing leaves the stock
    w0=B.evaluate("()=>RESP[1].w");P('convoy',B.evaluate("()=>{sendConvoy({g:0,w:120,s:60,f:0});return MP.out?MP.out.length:-1}"))
    t0=time.time()
    while time.time()-t0<3:pump(A,B)
    cvn=[pg.evaluate("()=>JSON.stringify({cv:units.filter(u=>u.cv).length,w:RESP[1].w,msg:msgS})") for pg in (A,B)];P('after convoy command',cvn)
    ok.append(all(json.loads(c)['cv']==0 for c in cvn) and json.loads(cvn[0])['w']==json.loads(cvn[1])['w'])
    done=lambda q:(lambda s:q in s['d'].split(','))
    # jump to the co-op quest: it comes up, the route is looked at, the quest is skipped
    A.evaluate("()=>{mpPush({k:'qd',ids:['wood','ore','house','farm','barracks','knights','archers','walls','tower','traps','wave1','market','guild','research','king','skill','wave5','siege','envoy']})}")
    ok.append(wait(done('convoy'),120,'convoy quest closed'))
    # 70 s of simulation more: two more looks of the 30 s timer must change nothing and cost nothing visible
    tk=st(A)['tick'];ok.append(wait(lambda s:s['tick']>tk+1400,300,'70 s more'))
    qa=json.loads(A.evaluate("()=>JSON.stringify(window.__q)"));qb=json.loads(B.evaluate("()=>JSON.stringify(window.__q)"))
    ca=[q for q in qa if q['id']=='convoy'];cb=[q for q in qb if q['id']=='convoy'];P('convoy quest A',json.dumps(ca));P('convoy quest B',json.dumps(cb))
    a=st(A);b=st(B);P('end A',json.dumps(a));P('end B',json.dumps(b))
    skipped=len(ca)==1 and ca==cb and ca[0]['st']==2 and all(g[3]<30 for g in ca[0]['gain'])  # the reward is 30 food to each; a peasant may bring something home in that tick
    P('skipped on both at tick',ca[0]['tick'] if ca else None,'no reward' if skipped else 'NOT AS EXPECTED')
    res=all(ok) and skipped and qa==qb and a['d']==b['d'] and bad[0] is None and not a['ds'] and not b['ds'] and not a['over'] and not ea and not eb  # times are printed, not judged: they follow the load of the machine (tests/convoy_cut_probe.js gives medians over 120 pairs)
    P('hash checks',nchk[0]);P('ERRS',ea[:3],eb[:3])
    P('RESULT','OK' if res else 'FAIL','divergence' if bad[0] else '')
    for br in brs:br.close()
