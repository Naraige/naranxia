import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
# co-op: do both machines really resume from the same tick with the same state after an auto resync?
# Five resyncs in one game: during an open event, a convoy on the road, a raid (wolf pack wave and zombies at the walls), King skills
# running, then everything at once with the HOST corrupted. After each one, every tick is compared between the two machines, indexed by
# epoch:tick, over at least TICKS ticks, with a digest far wider than mpHash: every plain field of every unit and structure (references
# as ids, the kept target _tc included, path objects without their local version counter), the whole swarm, the random draws of the tick, resources, prices, events, quests and every scalar
# of the save registry. Ticks of an epoch after the moment a machine was corrupted on purpose are not compared (they must differ).
# usage: python3 tests/mp_resync_deep.py [naranxia_readable.html] [ticks after each resync, default 200]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
TICKS=int(sys.argv[2]) if len(sys.argv)>2 else 200
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 render3D=function(){};
 const _e=mpExec;mpExec=function(c,m){if(c.k==='kx'){for(const k of units)if(k.type==='king')kingXp(k,c.n);return}
  if(c.k==='zz'){const cs=c.p?CS2:CS;for(let i=0;i<c.n;i++){const a=i/c.n*6.283,f=freeTile(Math.round(cs.tx+Math.cos(a)*c.r),Math.round(cs.ty+Math.sin(a)*c.r));if(f)units.push(mkU(1,i%5===4?'runner':'zombie',(f[0]+.5)*TS,(f[1]+.5)*TS))}return}
  if(c.k==='zev'){evPush(c.e);if(c.ttl&&EVS.cur&&EVS.cur.i===c.e.i)EVS.cur.exp=time+c.ttl;return}
  if(c.k==='zw'){waveN=c.n;waveT=0;return}
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
    for _ in range(n):
        a=A.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        b=B.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        if a:B.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",a)
        if b:A.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",b)
        time.sleep(.01)
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
        if HA[t]!=HB[t] and bad[0] is None:
            bad[0]=t;P('FIRST DIVERGENCE epoch:tick',t,'\n A',HA[t],'\n B',HB[t])
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
    t0=time.time();k=0
    while time.time()-t0<sec:
        pump(A,B);k+=1
        if k%10==0:check()
    check()
RSQ="()=>JSON.stringify({ep:MP.ep,rsy:MP.rsy,tick:MP.tick,ds:MP.desync})"
ok=[True]
def need(c,msg):
    if not c:ok[0]=False;P('FAIL',msg)
def resync(lbl,page,js,state):
    """corrupt one machine, wait for the epoch to move on both, then run TICKS ticks and compare them all"""
    check()
    a=json.loads(A.evaluate(RSQ));ep=a['ep']
    st=A.evaluate(state);P(lbl,'state before',st)
    cut[ep]=json.loads(page.evaluate(RSQ))['tick'];page.evaluate(js)
    t0=time.time();done=False
    while time.time()-t0<240:
        pump(A,B)
        a=json.loads(A.evaluate(RSQ));b=json.loads(B.evaluate(RSQ))
        if a['ep']==ep+1 and b['ep']==ep+1 and not a['rsy'] and not b['rsy']:done=True;break
    need(done,lbl+': resync done');
    if not done:return
    t1=a['tick'];P(lbl,'resynced in',round(time.time()-t0,1),'s, epoch',ep+1,'ticks A',a['tick'],'B',b['tick'],'| state after A',A.evaluate(state),'B',B.evaluate(state))
    t0=time.time();k=0
    while time.time()-t0<400:
        pump(A,B);k+=1
        if k%10==0:
            check();a=json.loads(A.evaluate(RSQ));b=json.loads(B.evaluate(RSQ))
            if min(a['tick'],b['tick'])>=t1+TICKS+8:break
    check();need(nchk.get(ep+1,0)>=TICKS,lbl+': only %d ticks compared'%nchk.get(ep+1,0))
    P(lbl,'compared',nchk.get(ep+1,0),'ticks of epoch',ep+1,'divergence',bad[0])
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport={'width':480,'height':320});errs=[]
        pg.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:300]))
        fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.goto((Path(ROOT)/'dist'/html).resolve().as_uri(),timeout=600000);pg.wait_for_timeout(2500)
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    # the fixed world and sites of mp_convoy.py (a convoy walks from one castle to the other in about 10 s)
    A.evaluate("""()=>{const R0=Math.random;let s=103;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""");pump(A,B,3)
    r=A.evaluate("""()=>{const a=window.__ab[0],b=window.__ab[1];MP.mine=a;MP.theirs=b;mpStart();return JSON.stringify({a,b,on:MP.on})}""")
    A.evaluate(REC);pump(A,B,1);B.evaluate(REC);P('start',r)
    waitT(3)
    A.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===0);train('king')}");B.evaluate("()=>{selB=structs.find(s=>s.type==='castle'&&(s.pl|0)===1);train('king')}")
    # 1. an event open
    A.evaluate("(e)=>{mpPush({k:'zev',e,ttl:600})}",{'k':'env','i':9004,'a':{'g':80,'f':50},'cn':'Ironhold - merchants','mu':1.5});waitT(2)
    EV="()=>JSON.stringify({ev:EVS.cur&&[EVS.cur.k,EVS.cur.i],kings:units.filter(u=>u.type==='king').length})"
    resync('1 event',B,"()=>{RESP[0].g+=17;const u=units.find(q=>q.t===0);u.x+=20;u.hp-=3}",EV)
    # 2. a convoy on the road (the guest sends it)
    for _ in range(40):
        if json.loads(A.evaluate(EV))['kings']>=2:break
        waitT(1)
    B.evaluate("()=>{sendConvoy({g:0,w:120,s:60,f:0})}");waitT(2.5)
    CV="()=>JSON.stringify({ev:EVS.cur&&EVS.cur.i,cv:units.filter(u=>u.cv).map(u=>u.uid+(u.cv.back?'b':'g')).join(' ')})"
    need('g' in json.loads(A.evaluate(CV))['cv'],'convoy on the road before resync 2')
    resync('2 convoy',B,"()=>{RESP[1].w+=9;const u=units.find(q=>q.cv)||units[0];u.x+=6}",CV)
    # 3. a raid: wave 7 brings the wolf pack, and zombies stand at both castles
    A.evaluate("()=>{mpPush({k:'zw',n:6});mpPush({k:'zz',n:14,r:10,p:0});mpPush({k:'zz',n:14,r:10,p:1})}");waitT(3)
    RD="()=>JSON.stringify({wave:waveN,on:waveOn,z:units.filter(u=>u.t===1).length,sw:SW.n,run:units.filter(u=>u.type==='runner').length})"
    resync('3 raid',B,"()=>{RESP[0].g+=17;const u=units.find(q=>q.t===1)||units[0];u.hp-=2;u.y+=9}",RD)
    # 4. King skills running
    A.evaluate("()=>{mpPush({k:'kx',n:300})}");waitT(1.5)
    for i in range(4):
        A.evaluate("()=>{kingTalent(0);kingTalent(1)}");B.evaluate("()=>{kingTalent(1);kingTalent(0)}");waitT(.5)
    A.evaluate("()=>{kingSkill('cry')}");B.evaluate("()=>{kingSkill('charge')}");waitT(.6)
    KS="()=>JSON.stringify({kings:units.filter(u=>u.type==='king').map(u=>[u.pl|0,u.kt|0,Math.round(u.hp),Object.keys(u).filter(k=>k.startsWith('sk_')||k==='chT'||k==='wcT').map(k=>k+'='+(+u[k]).toFixed(1)).join(' ')]),buffed:units.filter(u=>u.buff>1).length,time:+time.toFixed(1)})"
    resync('4 king skill',B,"()=>{RESP[0].g+=17;const u=units.find(q=>q.type==='king')||units[0];u.hp-=5}",KS)
    # 5. everything at once, and this time the HOST is the corrupted machine (its state is the one both keep)
    A.evaluate("(e)=>{mpPush({k:'zev',e,ttl:600});mpPush({k:'zz',n:20,r:9,p:0});mpPush({k:'zz',n:20,r:9,p:1})}",{'k':'car','i':9005,'a':{'g':100,'w':60,'s':40}})
    A.evaluate("()=>{sendConvoy({g:0,w:60,s:30,f:0})}");waitT(2.5)
    ALL="()=>JSON.stringify({ev:EVS.cur&&EVS.cur.i,q:EVS.q.length,cv:units.filter(u=>u.cv).length,z:units.filter(u=>u.t===1).length,sw:SW.n})"
    resync('5 all, host corrupted',A,"()=>{RESP[1].g+=31;const u=units.find(q=>q.t===1)||units[0];u.x+=12}",ALL)
    a=json.loads(A.evaluate(RSQ));b=json.loads(B.evaluate(RSQ))
    need(a['ep']==5 and b['ep']==5,'five resyncs');need(not a['ds'] and not b['ds'],'no desync flag at the end');need(bad[0] is None,'no divergence')
    P('ticks compared per epoch',json.dumps(nchk))
    P('RESULT','OK' if ok[0] else 'FAIL','divergence' if bad[0] else '')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
