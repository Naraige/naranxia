import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
DUR=float(sys.argv[2]) if len(sys.argv)>2 else 70
RENDER=len(sys.argv)>3 and sys.argv[3]=='render'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 if(!window.__RENDER)render3D=function(){};else renderer.render=function(){};
 const _e=mpExec;mpExec=function(c,m){if(c.k==='zz'){const cs=c.p?CS2:CS;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,i%5===4?'runner':'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}return _e(c,m)};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=99999;R.w=99999;R.s=99999}};
 const _b=_N.build;_N.build=function(t,x,y){const n=structs.length;const r=_b(t,x,y);for(let i=n;i<structs.length;i++){const s=structs[i];s.prog=1;s.hp=s.max;if(s.o3)buildStructMesh(s)}return r};
 for(const k in RT2)RT2[k]=3;return 'ok'}"""
REC="""()=>{window.__H={};window.__D={};window.__K={};let rc=0,stk=[];const sr=MP.simR;
 MP.simR=function(){rc++;const e=new Error().stack.split('\\n');stk.push((e[2]||'').trim().replace(/\\(.*html:/,'(').slice(0,60)+' < '+(e[3]||'').trim().replace(/\\(.*html:/,'(').slice(0,50));return sr()};
 const _u=update;update=function(dt){_u(dt);if(!MP.on)return;const t=MP.tick;
  const us=units.map(u=>u.uid+':'+u.type+':'+u.t+':'+u.x.toFixed(2)+','+u.y.toFixed(2)+':'+(u.hp|0)+':'+(u.st||u.state||'')+':'+(u.job||'')).join('|');
  const ss=structs.map(s=>s.sid+':'+s.type+':'+(s.pl|0)+':'+Math.round(s.hp)+':'+(s.prog||0).toFixed(3)+':'+s.tier+':'+s.max).join('|');
  const rs=RESP.map(R=>R.g.toFixed(2)+','+R.w.toFixed(2)+','+R.s.toFixed(2)).join('/');
  let sw=SW.n;for(let i=0;i<SW.n;i++)sw=(Math.imul(sw,31)+((SW.x[i]*8)|0)+Math.imul((SW.y[i]*8)|0,7))|0;
  const h=s=>{let x=0;for(let i=0;i<s.length;i++)x=(Math.imul(x,31)+s.charCodeAt(i))|0;return x};
  window.__H[t]=[rc-(window.__rcp||0),h(us),h(ss),h(rs),sw,units.length,structs.length].join(',');window.__rcp=rc;
  window.__D[t]={us,ss,rs,sw:SW.n};window.__K[t]=stk;stk=[];
  delete window.__D[t-400];delete window.__K[t-400]}}"""
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
            prev=str(int(t)-1)
            dA=A.evaluate("(t)=>JSON.stringify({d:window.__D[t],k:window.__K[t],kp:window.__K[t-1]})",int(t));dB=B.evaluate("(t)=>JSON.stringify({d:window.__D[t],k:window.__K[t],kp:window.__K[t-1]})",int(t))
            dA=json.loads(dA);dB=json.loads(dB)
            for key in ['us','ss','rs']:
                a=(dA['d'] or {}).get(key,'').split('|');b=(dB['d'] or {}).get(key,'').split('|')
                diff=[(x,y) for x,y in zip(a,b) if x!=y]
                P(' ',key,'lenA',len(a),'lenB',len(b),'diffs',diff[:6])
            ka=dA['k'] or [];kb=dB['k'] or []
            P('  rng calls A',len(ka),'B',len(kb))
            for i,(x,y) in enumerate(zip(ka,kb)):
                if x!=y:P('  first rng stack diff at',i,'\n   A:',x,'\n   B:',y);break
            else:
                P('  extra A:',ka[len(kb):len(kb)+5],'\n  extra B:',kb[len(ka):len(ka)+5])
        if t in HA and t in HB: 
            del HA[t];del HB[t]
ST="()=>JSON.stringify({tick:MP.tick,ds:MP.desync,rs2:RS2.on,done:Object.keys(RS2.done).filter(k=>RS2.done[k]),rs:[RS.done,RS.on,Math.round(RS.t)],res:RESP.map(R=>Math.round(R.g)),aca:structs.filter(s=>s.type==='academy').map(s=>s.pl|0),tiers:structs.filter(s=>s.t===0&&UPC[s.type]).map(s=>s.tier).join(''),u:units.length,sw:SW.n,sh:units.filter(u=>u.shel).length,nl:+nightLv.toFixed(2),shelOn,f:RESP.map(R=>Math.round(R.f)),ro:JSON.stringify(RHAS),wk:units.filter(u=>u.job==='f'||u.job==='p').length,sp:SAPL.size})"
def both(lbl):P(lbl,'A',A.evaluate(ST));P(lbl,'B',B.evaluate(ST))
def waitT(sec):
    t0=time.time();k=0
    while time.time()-t0<sec:
        pump(A,B);k+=1
        if k%10==0:check()
    check()
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport={'width':480,'height':320});errs=[]
        pg.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:300]))
        fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.goto((Path(ROOT)/'dist'/html).resolve().as_uri(),timeout=180000);pg.wait_for_timeout(2500)
        if RENDER:pg.evaluate('()=>{window.__RENDER=1}')
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("()=>{rollWorld();mpWorldSync()}");pump(A,B,3)
    r=A.evaluate("""()=>{if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<300&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else if(Math.hypot(a.tx-s.tx,a.ty-s.ty)>=60)b=s}
     MP.mine=a;MP.theirs=b;mpStart();A_REC=1;return JSON.stringify({a,b,on:MP.on})}""".replace("A_REC=1;",""))
    A.evaluate(REC);pump(A,B,1);B.evaluate(REC);P('start',r)
    CAMJ="()=>JSON.stringify({tick:MP.tick,lpl:LPL(),cur:CURPL,cam:[Math.round(CAM.x),Math.round(CAM.z)],cs:[Math.round(CS.x/TS),Math.round(CS.y/TS)],cs2:CS2?[Math.round(CS2.x/TS),Math.round(CS2.y/TS)]:null})"
    P('cam A',A.evaluate(CAMJ));P('cam B',B.evaluate(CAMJ))
    waitT(2)
    KST="()=>JSON.stringify({tick:MP.tick,ds:MP.desync,roy:units.filter(u=>u.type==='king'||u.type==='guard').map(u=>(u.pl|0)+u.type[0]+':'+(u.hp|0)+':'+(u.cap?u.cap.uid:'-')+':'+(u.sq?u.sq.length:'')).join(' '),u:units.length,q:queue.map(q=>q.type).join(',')})"
    for X in (A,B):X.evaluate("()=>{TRAIN.king=4;TRAIN.guard=3;return 1}")
    P('A king',A.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===0);train('king');return MP.out.length}"))
    P('B king',B.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===1);train('king');return MP.out.length}"))
    waitT(12);P('kings A',A.evaluate(KST));P('kings B',B.evaluate(KST))
    P('B king again',B.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===1);train('king');return MP.out.length}"))
    P('A guard (full)',A.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===0);train('guard');return MP.out.length+' '+msgS}"))
    P('A move',A.evaluate("()=>{const K=units.find(u=>u.type==='king'&&(u.pl|0)===0);for(const u of units)u.sel=u===K;order({x:(CS.tx+9)*TS,y:(CS.ty+3)*TS});for(const u of units)u.sel=false;return MP.out.length}"))
    P('zz',A.evaluate("()=>{mpPush({k:'zz',n:24,r:9,p:0});mpPush({k:'zz',n:24,r:9,p:1});return MP.out.length}"))
    waitT(40);P('fight A',A.evaluate(KST));P('fight B',B.evaluate(KST))
    P('A guard',A.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===0);train('guard');return MP.out.length+' '+msgS}"))
    P('B guard',B.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===1);train('guard');return MP.out.length+' '+msgS}"))
    waitT(DUR);P('end A',A.evaluate(KST));P('end B',B.evaluate(KST));both('end')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
