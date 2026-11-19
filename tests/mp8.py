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
    with p.chromium.launch(args=harness.FLAGS) as browser:
        A,ea=harness.load(browser,html);B,eb=harness.load(browser,html)
        for pg in (A,B):pg.evaluate(INIT)
        A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
        # Stable nearby sites; generated terrain and every rule are production code.
        A.evaluate("""()=>{let s=103;const old=Math.random;Math.random=()=>{s=s*16807%2147483647;return(s-1)/2147483646};
          rollWorld();buildPreview();let a=null,b=null;for(let t=0;t<20000&&!b;t++){randomSite();if(!pickPos?.ok)continue;const q={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=q;else{const d=Math.hypot(a.tx-q.tx,a.ty-q.ty);if(d>=24&&d<=60)b=q}}Math.random=old;window.__ab=[a,b];mpWorldSync()}""")
        harness.flush(A,B)
        A.evaluate("()=>{[MP.mine,MP.theirs]=window.__ab;mpStart()}");harness.flush(A,B)
        A.evaluate(REC);B.evaluate(REC);harness.observe(A,B)
        FIND="""(t)=>{const c=CURPL?CS2:CS;for(let r=5;r<26;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
          if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=c.tx+dx,y=c.ty+dy,tt=tilesFor(t,x,y,BSZ[t]||2);
          if(tt.every(([i,j])=>gOK(i,j)&&valid(i,j)&&HT[j*TW+i]===HT[y*TW+x])){build(t,x,y);return[x,y]}}return null}"""
        for pg in (A,B):
            pg.evaluate("()=>roleAdj('b',3)")
            for kind in ('academy','farm','forester','guild'):
                harness.check('free construction site '+kind,pg.evaluate(FIND,kind) is not None)
                waitT(.5)
        P("phase", "natural construction")
        waitT(90)
        for pg in (A,B):
            built=pg.evaluate("()=>[0,1].every(p=>['academy','farm','forester','guild'].every(t=>structs.some(s=>s.type===t&&(s.pl|0)===p&&s.prog>=1&&s.hp>0)))")
            harness.check('both players completed all four buildings',built)
            if not built:raise AssertionError('Natural construction did not complete')
        P("phase", "research")
        A.evaluate("()=>{selB=structs.find(s=>s.type==='academy'&&(s.pl|0)===0);buy('upgrade')}");waitT(48)
        harness.check('masonry completed on both',all(pg.evaluate('()=>RS.done') for pg in (A,B)))
        A.evaluate("()=>buy('iron')");waitT(1)
        B.evaluate("()=>buy('tools')");waitT(1)
        harness.check('concurrent research refused',A.evaluate('()=>RS2.on'), 'iron')
        waitT(40)
        B.evaluate("()=>buy('plate')");waitT(52)
        for pg in (A,B):
            harness.check('iron and plate complete, competing tools absent',pg.evaluate('()=>[RS2.done.iron,RS2.done.plate,RS2.done.tools]'),[True,True,False])
        A.evaluate("()=>roleAdj('r',1)");B.evaluate("()=>roleAdj('t',1)");waitT(2)
        harness.check('role command ownership',A.evaluate("()=>SAVA.ROLE[0]().map(r=>[r.b,r.r,r.t])"),[[3,1,0],[3,0,1]])
        P("phase", "quests and wave")
        B.evaluate('()=>questSwitch(false)');waitT(1)
        harness.check('guest quest switch',all(pg.evaluate('()=>QST.on===0') for pg in (A,B)))
        A.evaluate('()=>questSwitch(true)');waitT(1)
        harness.check('host quest switch',all(pg.evaluate('()=>QST.on===1') for pg in (A,B)))
        A.evaluate("()=>{mpPush({k:'zz',n:14,r:13,p:0});mpPush({k:'zz',n:14,r:13,p:1})}");waitT(1)
        harness.check('enemies spawned at both castles',A.evaluate('()=>units.filter(u=>u.t===1).length')>=28)
        B.evaluate('()=>callWave()');waitT(2)
        harness.check('guest wave command executed',A.evaluate('()=>waveN'),1)
        waitT(DUR)
        check()
        harness.check('no unrequested resync',A.evaluate('()=>MP.ep'),0)
        harness.check('matching final tick',A.evaluate('()=>MP.tick'),B.evaluate('()=>MP.tick'))
        harness.finish('mp8',bad[0] is None,A,B,ea+eb,harness.compared)
