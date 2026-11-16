import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
import mp_harness as harness
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
DUR=float(sys.argv[2]) if len(sys.argv)>2 else 70
RENDER=len(sys.argv)>3 and sys.argv[3]=='render'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 if(!window.__RENDER)render3D=function(){};else renderer.render=function(){};
 const _e=mpExec;mpExec=function(c,m){if(c.k==='zz'){const cs=c.p?CS2:CS;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,i%5===4?'runner':'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}return _e(c,m)};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=99999;R.w=99999;R.s=99999}};
 return 'ok'}"""
REC="""()=>{window.__H={};window.__D={};window.__K={};let rc=0,stk=[];const sr=MP.simR;
 MP.simR=function(){rc++;return sr()};
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
    harness.pump(A,B,n)
GETH="()=>{const o=window.__H;window.__H={};return o}"
HA={};HB={};bad=[None]
def check():
    HA.update(A.evaluate(GETH));HB.update(B.evaluate(GETH))
    for t in sorted(set(HA)&set(HB),key=int):
        harness.compared+=1
        if HA[t]!=HB[t] and bad[0] is None:
            bad[0]=t;harness.divergence(A,B,t);P('FIRST DIVERGENCE tick',t,'A',HA[t],'B',HB[t])
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
    harness.wait_seconds(A,B,sec,check)
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=brs[0] if brs else p.chromium.launch(args=harness.FLAGS)
        if not brs:brs.append(br)
        pg,errs=harness.load(br,html,480,320)
        if RENDER:pg.evaluate('()=>{window.__RENDER=1}')
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("()=>{rollWorld();mpWorldSync()}");pump(A,B,3)
    r=A.evaluate("""()=>{if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<300&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else if(Math.hypot(a.tx-s.tx,a.ty-s.ty)>=40)b=s}
     MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    harness.flush(A,B);A.evaluate(REC);B.evaluate(REC);harness.observe(A,B);pump(A,B,1);P('start',r)
    RS="()=>JSON.stringify({tick:MP.tick,ep:MP.ep,rsy:MP.rsy,ds:MP.desync,h:mpHash(),u:units.length,s:structs.length,hp:units.slice(0,6).map(u=>u.hp|0).join(','),q:JSON.stringify(QST)})"
    waitT(6);P('before A',A.evaluate(RS));P('before B',B.evaluate(RS))
    P('zz',A.evaluate("()=>{mpPush({k:'zz',n:10,r:12,p:0});mpPush({k:'zz',n:10,r:12,p:1});return MP.out.length}"))
    waitT(4)
    P('corrupt B',B.evaluate("()=>{const u=units.find(q=>q.t===0);u.hp-=3;u.x+=20;RESP[0].g+=17;QST.a[1]+=7;QST.d.house=1;return u.uid}"))
    t0=time.time();seen=False
    for _ in range(round(DUR*30/5)):
        pump(A,B)
        a=json.loads(A.evaluate(RS));b=json.loads(B.evaluate(RS))
        if a['rsy'] or b['rsy'] or (a['ep']>=1 and b['ep']>=1):seen=True  # the epoch only moves with a resync: a resync done between two polls counts too
        if seen and a['ep']==1 and b['ep']==1 and not a['rsy'] and not b['rsy']:break
    P('resync seen',seen,'after',round(time.time()-t0,1),'s')
    P('after A',A.evaluate(RS));P('after B',B.evaluate(RS))
    HA.clear();HB.clear();A.evaluate(GETH);B.evaluate(GETH)
    waitT(12)
    a=json.loads(A.evaluate(RS));b=json.loads(B.evaluate(RS))
    P('later A',json.dumps(a));P('later B',json.dumps(b))
    qs=lambda j:{k:json.loads(j)[k] for k in ('v','on','d','e','last')}
    P('RESULT', 'OK' if (seen and a['ep']==b['ep']==1 and not a['ds'] and not b['ds'] and bad[0] is None and qs(a['q'])==qs(b['q']) and '"house"' not in b['q']) else 'FAIL', 'divergence' if bad[0] else '')
    P('ERRS',ea[:3],eb[:3])
    outcome=seen and a['ep']==b['ep']==1 and not a['ds'] and not b['ds'] and bad[0] is None and qs(a['q'])==qs(b['q']) and '"house"' not in b['q']
    harness.check('corruption triggered recovery',seen)
    harness.check('exactly one recovery epoch',[a['ep'],b['ep']],[1,1])
    harness.check('restore completed on both peers',[a['rsy'],b['rsy']],[None,None])
    harness.check('restored quest state',qs(b['q']),qs(a['q']))
    harness.check('corrupted quest completion removed','house' in json.loads(b['q'])['d'],False)
    harness.check('post-recovery matching-tick sequence',bad[0],None)
    harness.finish('mp_resync',outcome,A,B,ea+eb,harness.compared)
    for br in brs:br.close()
