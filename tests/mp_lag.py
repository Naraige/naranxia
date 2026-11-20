import json,sys,os,random
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import mp_harness as harness
# co-op on a bad network (issues #26, #3, #4 were reported on real connections): the two machines do not exchange packets instantly and
# symmetrically as in the other co-op tests. Each direction has its own random delay (in rounds of 5 frames), one machine may be slow (fewer
# frames per round), and both players build, train and move all the time. Whatever the delays, the lockstep must keep both machines
# identical: no desync, no resync, every structure of a player on its owner's side with the right owner and a mesh, the same list on both.
# usage: python3 tests/mp_lag.py [naranxia_readable.html]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=90000;R.w=90000;R.s=90000;R.f=90000}waveT=1e9};
 return 'ok'}"""
def P(*a):print(*a,flush=True)
ok=[True]
def need(c,msg):
    harness.check(msg,bool(c))
    if not c:ok[0]=False;P('FAIL',msg)
ST="()=>JSON.stringify({tick:MP.tick,ep:MP.ep,ds:MP.desync,pl:CURPL,cs:[CS.tx,CS.ty],cs2:CS2&&[CS2.tx,CS2.ty],h:mpHash()})"
SL="()=>JSON.stringify(structs.filter(s=>s.t===0).map(s=>[s.sid,s.type,s.tx,s.ty,s.pl|0,!!s.o3]).sort((a,b)=>a[0]-b[0]))"
SPOTS="""(n)=>{const me=CURPL?CS2:CS,ot=CURPL?CS:CS2,out=[];
 for(let r=5;r<24&&out.length<n;r++)for(let j=-r;j<=r&&out.length<n;j++)for(let i=-r;i<=r&&out.length<n;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=me.tx+2+i,ty=me.ty+2+j;
  let free=true;for(let b=-1;b<=2&&free;b++)for(let a=-1;a<=2&&free;a++){const k=(ty+b)*TW+tx+a;if(!valid(tx+a,ty+b)||occ.get(k)||ter[k]||pth[k]||HT[k]!==HT[ty*TW+tx])free=false}
  if(!free||out.some(u=>Math.abs(u.tx-tx)<4&&Math.abs(u.ty-ty)<4))continue;
  if(Math.hypot(tx-me.tx,ty-me.ty)>=Math.hypot(tx-ot.tx,ty-ot.ty))continue;out.push([tx,ty])}
 return JSON.stringify(out)}"""
KINDS=['house','farm','storage','barracks','forester','tower','house','farm']
inbox={}
def lag_round(pg,other,frames,dmax,rng,rnd):
    """one round for pg: deliver what is due, run `frames` frames, queue its output for `other` after a random delay"""
    due=[m for r,m in inbox.setdefault(pg,[]) if r<=rnd];inbox[pg]=[(r,m) for r,m in inbox[pg] if r>rnd]
    out=pg.evaluate('''([messages,n]) => {for(const s of messages) mpMsg(JSON.parse(s));
        for(let i=0;i<n;i++) __stepFrame();const o=window.__out;window.__out=[];return o}''',[due,frames])
    for m in out:inbox.setdefault(other,[]).append((rnd+1+rng.randint(0,dmax),m))
def drain(A,B,rnd,rounds=40):
    """no more delay, equal speed: every packet arrives, both machines catch up"""
    for i in range(rounds):
        for pg,other in((A,B),(B,A)):
            due=[m for r,m in inbox.setdefault(pg,[])];inbox[pg]=[]
            out=pg.evaluate('''([messages,n]) => {for(const s of messages) mpMsg(JSON.parse(s));
                for(let i=0;i<n;i++) __stepFrame();const o=window.__out;window.__out=[];return o}''',[due,5])
            inbox.setdefault(other,[]).extend((0,m) for m in out)
def settle(A,B):
    """the machine that is behind runs alone (packets still pass at once) until both are at the same tick, to compare their state"""
    TK="()=>MP.tick"
    for _ in range(300):
        ta,tb=A.evaluate(TK),B.evaluate(TK)
        if ta==tb:return
        pg,other=(A,B) if ta<tb else (B,A)
        due=[m for r,m in inbox.setdefault(pg,[])];inbox[pg]=[]
        out=pg.evaluate('''([messages,n]) => {for(const s of messages) mpMsg(JSON.parse(s));
            for(let i=0;i<n;i++) __stepFrame();const o=window.__out;window.__out=[];return o}''',[due,1])
        inbox.setdefault(other,[]).extend((0,m) for m in out)
def profile(A,B,name,seed,dAB,dBA,fA,fB,rounds):
    rng=random.Random(seed);P('profile',name,'delay host->guest',dAB,'guest->host',dBA,'frames',fA,fB)
    spots={0:json.loads(A.evaluate(SPOTS,24)),1:json.loads(B.evaluate(SPOTS,24))}
    used={0:0,1:0};kinds={0:0,1:0};placed={0:[],1:[]}
    for rnd in range(rounds):
        lag_round(A,B,fA,dAB,rng,rnd);lag_round(B,A,fB,dBA,rng,rnd)
        if rnd%3==1:
            who=rng.choice((0,1));pg=A if who==0 else B
            act=rng.random()
            if act<.6 and used[who]<len(spots[who]):
                kind=KINDS[kinds[who]%len(KINDS)];kinds[who]+=1;tx,ty=spots[who][used[who]];used[who]+=1
                pg.evaluate("([k,x,y])=>{selB=CURPL?CS2:CS;build(k,x,y)}",[kind,tx,ty]);placed[who].append((kind,tx,ty))
            elif act<.85:
                pg.evaluate("()=>{selB=CURPL?CS2:CS;train('peasant')}")
            else:
                pg.evaluate("()=>{const me=units.filter(u=>u.t===0&&(u.pl|0)===CURPL&&u.type==='peasant');if(me.length){for(const u of me)u.sel=true;const c=CURPL?CS2:CS;order({x:(c.tx+6)*TS,y:(c.ty+6)*TS})}}")
    drain(A,B,0)
    settle(A,B)
    return placed
with sync_playwright() as p:
    br=p.chromium.launch(args=harness.FLAGS);pages=[]
    for i in range(2):
        pg,errs=harness.load(br,html,640,400);P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("""()=>{const R0=Math.random;let s=103;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite(false);if(!pickPos||!pickPos.ok)continue;const q={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=q;else{const d=Math.hypot(a.tx-q.tx,a.ty-q.ty);if(d >= 48 && d <= 84)b=q}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""")
    harness.pump(A,B,3)
    ab=json.loads(A.evaluate("()=>JSON.stringify(window.__ab)"));P('sites',ab)
    B.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[1]);harness.pump(A,B,3)
    A.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[0]);harness.pump(A,B,3)
    A.evaluate("()=>{mpStart()}");harness.pump(A,B,3);harness.wait_seconds(A,B,3,lambda:None)
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST))
    need(sa['cs']==sb['cs'] and sa['cs2']==sb['cs2'],'castles differ between machines')
    need(sa['pl']==0 and sb['pl']==1,'player index wrong')
    # packets still in flight when the shared harness stopped belong to the first round of this test
    for pg in (A,B):inbox[pg]=[(0,m) for m in harness.pending.pop(pg,[])]
    allp=[]
    for name,seed,dAB,dBA,fA,fB,rounds in (('light jitter',1,2,2,5,5,160),('heavy jitter',2,6,6,5,5,200),('slow guest, uneven delays',3,3,8,5,2,260),('slow host, one-way lag',4,9,1,2,5,260)):
        placed=profile(A,B,name,seed,dAB,dBA,fA,fB,rounds);allp.append(placed)
        a=json.loads(A.evaluate(ST));b=json.loads(B.evaluate(ST));P(' after',name,'A',a['tick'],a['ep'],a['ds'],'B',b['tick'],b['ep'],b['ds'])
        need(a['ep']==0 and b['ep']==0,name+': a resync happened (epoch %d / %d)'%(a['ep'],b['ep']))
        need(not a['ds'] and not b['ds'],name+': desync flagged')
        need(a['tick']==b['tick'],name+': machines at different ticks after draining (%d / %d)'%(a['tick'],b['tick']))
        if a['tick']==b['tick']:need(a['h']==b['h'],name+': state hash differs at tick %d'%a['tick'])
        la=json.loads(A.evaluate(SL));lb=json.loads(B.evaluate(SL))
        need(la==lb,name+': structures differ between machines (%d / %d)'%(len(la),len(lb)))
        for s in la:
            if s[1]=='castle':continue
            own=s[4];c=sa['cs2'] if own==1 else sa['cs'];o=sa['cs'] if own==1 else sa['cs2']
            dm=((s[2]-c[0])**2+(s[3]-c[1])**2)**.5;do=((s[2]-o[0])**2+(s[3]-o[1])**2)**.5
            if dm>=do:need(False,name+': %s of player %d at %d,%d lies nearer the other castle (%.0f vs %.0f)'%(s[1],own,s[2],s[3],dm,do))
        need(all(s[5] for s in la),name+': a structure without mesh')
    n0=sum(1 for pl in allp for _ in pl[0]);n1=sum(1 for pl in allp for _ in pl[1])
    P('placed host',n0,'guest',n1)
    need(n0>=8 and n1>=8,'too few buildings were attempted (%d / %d)'%(n0,n1))
    la=json.loads(A.evaluate(SL))
    need(sum(1 for s in la if s[4]==1 and s[1]!='castle')>=4,'the guest has almost no building after the session')
    need(sum(1 for s in la if s[4]==0 and s[1]!='castle')>=4,'the host has almost no building after the session')
    P('RESULT','OK' if ok[0] else 'FAIL');P('ERRS',ea[:3],eb[:3])
    harness.finish('mp_lag',ok[0],A,B,ea+eb,None)
    br.close()
