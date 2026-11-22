import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
import mp_harness as harness
# co-op soak: a long game of two headless clients with everything going on (building by both players, training, fights at both castles,
# waves, convoys both ways, choice events, quests, knights sent against a rebel camp, King skills) and NO corruption: the two machines
# must never differ. The castles are made very tough at the first horde: since the dark veil of the night (v98) soldiers hold at the edge of the light, and a fallen castle ends the game before the last tick. Every tick is compared (epoch:tick) with the wide digest of mp_resync_deep.py; the first difference is printed as
# FIRST DIVERGENCE with the units / structures / parts that differ, and any resync (the epoch moves) fails the test.
# usage: python3 tests/mp_soak.py [naranxia_readable.html] [ticks, default 6000]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
TICKS=int(sys.argv[2]) if len(sys.argv)>2 else 6000
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 render3D=function(){};
 const _e=mpExec;mpExec=function(c,m){if(c.k==='kx'){for(const k of units)if(k.type==='king')kingXp(k,c.n);return}
  if(c.k==='zz'){const cs=c.p?CS2:CS;CS.max=CS.hp=3e5;CS2.max=CS2.hp=3e5;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,i%5===4?'runner':'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}
  if(c.k==='zev'){evPush(c.e);if(c.ttl&&EVS.cur&&EVS.cur.i===c.e.i)EVS.cur.exp=time+c.ttl;return}
  if(c.k==='zw'){waveN=c.n;waveT=0;return}
  if(c.k==='zk'){const cs=c.p?CS2:CS;setPl(c.p);for(let i=0;i<c.n;i++){const f=freeTile(cs.tx+7+i%4,cs.ty+7+((i/4)|0));if(f)units.push(mkU(0,i%3?'knight':'archer',(f[0]+.5)*TS,(f[1]+.5)*TS))}setPl(MP.host?0:1);return}
  return _e(c,m)};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=5000;R.w=5000;R.s=5000}waveT=1e9};
  return 'ok'}"""
REC="""()=>{window.__H={};window.__D={};let rc=0,rc0=0,inner=MP.simR;const w=function(){rc++;return inner()};
 Object.defineProperty(MP,'simR',{configurable:true,get(){return w},set(f){inner=f}});
 const h=s=>{let x=0;for(let i=0;i<s.length;i++)x=(Math.imul(x,31)+s.charCodeAt(i))|0;return x};
 const SK=new Set(['sel','m','o3']);
 const prim=o=>{const ks=Object.keys(o).sort(),p=[];for(const k of ks){if(SK.has(k))continue;const v=o[k],t=typeof v;if(t==='number')p.push(k+'='+(Number.isInteger(v)?v:v.toFixed(4)));else if(t==='string'||t==='boolean')p.push(k+'='+v);else if(v===null)p.push(k+'=null');else if(v===undefined)p.push(k+'=undef');
   else if(k==='_tc')p.push(k+'='+v.tt+'/'+v.r+'/'+v.tk+'/'+(v.b?(v.b.uid!==undefined?'u'+v.b.uid:'s'+v.b.sid):'-'));else if(Array.isArray(v))p.push(k+'=['+v.length+']');else if(v.uid!==undefined)p.push(k+'=u'+v.uid);else if(v.sid!==undefined)p.push(k+'=s'+v.sid);else if(t==='object'&&!v.isObject3D){let q;try{q=JSON.stringify(v,(kk,x)=>kk==='ver'?0:ArrayBuffer.isView(x)?x.length+'#'+h(String.fromCharCode.apply(null,x.length>60000?x.subarray(0,60000):x)):x&&typeof x==='object'&&x.uid!==undefined?'u'+x.uid:x&&typeof x==='object'&&x.sid!==undefined?'s'+x.sid:x&&x.isObject3D?0:x)}catch(e){q='{}'}p.push(k+'='+(q&&q.length<400?q:'{'+(q?h(q):0)+'}'))}}return p.join(',')};
 const _u=update;update=function(dt){_u(dt);if(!MP.on)return;const t=MP.tick,P={};
  P.units=units.map(prim).join('|');P.structs=structs.map(prim).join('|');
  let sw=SW.n;for(let i=0;i<SW.n;i++)sw=(Math.imul(sw,31)+((SW.x[i]*64)|0)+Math.imul((SW.y[i]*64)|0,7))|0;P.swarm=sw+':'+SW.n;
  P.rng=''+(rc-rc0);rc0=rc;P.eco=JSON.stringify(RESP)+JSON.stringify(PRICE)+JSON.stringify(FAT);
  P.evt=JSON.stringify(EVS,(k,v)=>v&&typeof v==='object'&&v.uid!==undefined?'u'+v.uid:v);P.qst=JSON.stringify(QST);
  const sc=[];for(const k in SAVA){const v=SAVA[k][0]();if(v===null||typeof v!=='object')sc.push(k+'='+v)}P.scal=sc.join(',');
  const key=MP.ep+':'+t;window.__H[key]=Object.keys(P).map(k=>k+'~'+h(P[k])).join(' ');window.__D[key]=P;delete window.__D[MP.ep+':'+(t-150)]}}"""
def P(*a):print(*a,flush=True)
def pump(A,B,n=1):
    harness.pump(A,B,n)
GETH="()=>{const o=window.__H;window.__H={};return o}"
HA={};HB={};bad=[None];nchk={};cut={}   # cut[epoch] = first tick not compared (a machine was corrupted there)
kk=lambda k:[int(x) for x in k.split(':')]
def check():
    HA.update(A.evaluate(GETH));HB.update(B.evaluate(GETH))
    for t in sorted(set(HA)&set(HB),key=kk):
        e,n=kk(t)
        if e in cut and n>=cut[e]:
            del HA[t];del HB[t];continue
        nchk[e]=nchk.get(e,0)+1
        harness.compared+=1
        if HA[t]!=HB[t] and bad[0] is None:
            bad[0]=t;harness.divergence(A,B,t);P('FIRST DIVERGENCE epoch:tick',t,'\n A',HA[t],'\n B',HB[t])
            da=json.loads(A.evaluate("(k)=>JSON.stringify(window.__D[k]||null)",t) or 'null');db=json.loads(B.evaluate("(k)=>JSON.stringify(window.__D[k]||null)",t) or 'null')
            if da and db:
                for part in da:
                    if da[part]==db[part]:continue
                    xa=da[part].split('|');xb=db[part].split('|');P('  part',part,'items',len(xa),len(xb))
                    n2=0
                    for x,y in zip(xa,xb):
                        if x!=y and n2<4:
                            n2+=1;fa=x.split(',');fb=y.split(',');sa=set(fa);sb=set(fb)
                            P('   ',[z for z in fa if z.startswith(('uid=','sid=','type='))],'A',[z for z in fa if z not in sb][:10],'B',[z for z in fb if z not in sa][:10])
        del HA[t];del HB[t]
def waitT(sec):
    harness.wait_seconds(A,B,sec,check)
RSQ="()=>JSON.stringify({ep:MP.ep,rsy:MP.rsy,tick:MP.tick,ds:MP.desync,dsN:MP.dsN|0})"
ok=[True]
def need(c,msg):
    harness.check(msg,bool(c))
    if not c:ok[0]=False;P('FAIL',msg)
SPOT="""(n)=>{const me=CURPL?CS2:CS,out=[];for(let r=6;r<26&&out.length<n;r++)for(let j=-r;j<=r&&out.length<n;j++)for(let i=-r;i<=r&&out.length<n;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=me.tx+2+i,ty=me.ty+2+j;
  let free=true;for(let b=-1;b<=2&&free;b++)for(let a=-1;a<=2&&free;a++){const k=(ty+b)*TW+tx+a;if(!valid(tx+a,ty+b)||occ.get(k)||ter[k]||pth[k]||HT[k]!==HT[ty*TW+tx])free=false}
  if(!free||out.some(u=>Math.abs(u[0]-tx)<5&&Math.abs(u[1]-ty)<5))continue;out.push([tx,ty])}return out}"""
BUILD="(a)=>{build(a[0],a[1],a[2])}"
def builds(pg,kinds):
    sp=pg.evaluate(SPOT,len(kinds))
    for k,q in zip(kinds,sp):pg.evaluate(BUILD,[k,q[0],q[1]])
ORDER="""()=>{const me=CURPL,L=units.filter(u=>u.t===0&&(u.pl|0)===me&&(u.type==='knight'||u.type==='archer'));if(!L.length)return 'no troops';
 const cs=me?CS2:CS;let b=null,bd=1e18;for(const c of SAVA.CAMPS[0]().values()){const d=(c.x-cs.x)**2+(c.y-cs.y)**2;if(d<bd){bd=d;b=c}}if(!b)return 'no camp';
 units.forEach(u=>u.sel=L.includes(u));order({x:b.x,y:b.y});units.forEach(u=>u.sel=false);return 'sent '+L.length+' to camp at '+Math.round(Math.sqrt(bd)/TS)+' tiles'}"""
INFO="()=>JSON.stringify({tick:MP.tick,ep:MP.ep,u:units.length,z:units.filter(u=>u.t===1).length,st:structs.filter(s=>s.t===0).length,sw:SW.n,wave:waveN,ev:EVS.cur&&EVS.cur.i,q:QST&&QST.on,cv:units.filter(u=>u.cv).length,kills:kills,camps:[...SAVA.CAMPS[0]().values()].filter(c=>c.act).length,g:RESP.map(R=>Math.round(R.g))})"
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=brs[0] if brs else p.chromium.launch(args=harness.FLAGS)
        if not brs:brs.append(br)
        pg,errs=harness.load(br,html,480,320)
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("""()=>{const R0=Math.random;let s=103;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d >= 48 && d <= 84)b=s}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""");pump(A,B,3)
    r=A.evaluate("""()=>{const a=window.__ab[0],b=window.__ab[1];MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    harness.flush(A,B);A.evaluate(REC);B.evaluate(REC);harness.observe(A,B);pump(A,B,1);P('start',r)
    step=0;evi=9100;t0=time.time()
    def tick():return min(json.loads(A.evaluate(RSQ))['tick'],json.loads(B.evaluate(RSQ))['tick'])
    # the script: (tick, what)
    PLAN=[(60,'king'),(120,'b1'),(400,'troops'),(500,'ev'),(700,'zz'),(900,'b2'),(1100,'cv'),(1300,'camp'),(1500,'ev'),(1700,'wave'),(2000,'skill'),(2200,'b3'),(2500,'cv'),(2700,'zz'),(3000,'ev'),(3300,'camp'),(3600,'wave'),(3900,'b1'),(4200,'cv'),(4500,'zz'),(4800,'ev'),(5100,'skill'),(5400,'camp'),(5700,'zz')]
    last=0
    while True:
        waitT(2);t=tick()
        if bad[0] or t>=TICKS or time.time()-t0>3000:break
        while step<len(PLAN) and t>=PLAN[step][0]:
            w=PLAN[step][1];step+=1
            if w=='king':
                A.evaluate("()=>{selB=CS;train('king');selB=null;questSwitch(true)}");B.evaluate("()=>{selB=CS2;train('king');selB=null}")
            elif w=='b1':builds(A,['house','farm','barracks','tower','storage']);builds(B,['farm','house','tower','barracks','forester'])
            elif w=='b2':builds(A,['academy','market','tower','wall','wall','guild']);builds(B,['market','guild','tower','house','wall'])
            elif w=='b3':builds(A,['farm','house','tower']);builds(B,['storage','academy','farm','tower'])
            elif w=='troops':A.evaluate("()=>{mpPush({k:'zk',n:10,p:0});mpPush({k:'zk',n:10,p:1});mpPush({k:'kx',n:300})}")
            elif w=='ev':
                evi+=1;A.evaluate("(e)=>{mpPush({k:'zev',e,ttl:20})}",{'k':'car','i':evi,'a':{'g':100,'w':60,'s':40}} if evi%2 else {'k':'env','i':evi,'a':{'g':80,'f':50},'cn':'Ironhold - merchants','mu':1.5})
                waitT(1.5);(A if evi%3 else B).evaluate("(c)=>{evChoose(c)}",evi%2)
            elif w=='zz':A.evaluate("()=>{mpPush({k:'zz',n:18,r:11,p:0});mpPush({k:'zz',n:18,r:11,p:1})}")
            elif w=='cv':B.evaluate("()=>{sendConvoy({g:0,w:120,s:60,f:0})}");A.evaluate("()=>{sendConvoy({g:50,w:0,s:40,f:20})}")
            elif w=='camp':P('camp A',A.evaluate(ORDER),'B',B.evaluate(ORDER))
            elif w=='wave':A.evaluate("()=>{callWave()}")
            elif w=='skill':
                for i in range(3):A.evaluate("()=>{kingTalent(0);kingTalent(1)}");B.evaluate("()=>{kingTalent(1);kingTalent(0)}");waitT(.4)
                A.evaluate("()=>{kingSkill('cry')}");B.evaluate("()=>{kingSkill('charge')}")
            P('tick',t,w)
        if t-last>=600:last=t;P('A',A.evaluate(INFO));P('B',B.evaluate(RSQ))
    check()
    a=json.loads(A.evaluate(RSQ));b=json.loads(B.evaluate(RSQ));P('end A',a,A.evaluate(INFO));P('end B',b)
    n=sum(nchk.values());P('ticks compared',n,'per epoch',json.dumps(nchk),'in',round(time.time()-t0),'s')
    need(bad[0] is None,'divergence at '+str(bad[0]));need(a['ep']==0 and b['ep']==0 and not a['dsN'] and not b['dsN'],'a resync happened');need(n>=TICKS,'only %d ticks compared'%n)
    P('RESULT','OK' if ok[0] else 'FAIL','divergence' if bad[0] else '')
    P('ERRS',ea[:3],eb[:3])
    outcome=ok[0] and bad[0] is None
    harness.finish('mp_soak',outcome,A,B,ea+eb,sum(nchk.values()))
    for br in brs:br.close()
