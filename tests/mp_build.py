import json,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
# co-op: what the GUEST (player 2) places must appear where he clicked, as his, on both machines (issues #26, #3, #4).
# The lobby is played as the game does (the guest confirms his site in the picker, the host starts). Then, on the guest's screen, with a
# real mouse: one structure of each kind near his own castle, a wall and a path, a gate, a rally point, the King. For each click the tile
# under the mouse (pickGround) is compared with the tile of the new structure on the host and on the guest, with its owner, and with
# the mesh the guest must see. The same clicks are then made by the host, so that a mix-up of the two players shows in either direction.
# usage: python3 tests/mp_build.py [naranxia_readable.html]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=90000;R.w=90000;R.s=90000;R.f=90000}waveT=1e9};
 return 'ok'}"""
def P(*a):print(*a,flush=True)
cmds=[]
def pump(A,B,n=1):
    for _ in range(n):
        a=A.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        b=B.evaluate("()=>{const o=window.__out;window.__out=[];return o}")
        for who,L in(('A',a),('B',b)):
            for s in L:
                if s.startswith('{"k":"c"') and '"c":[]' not in s:cmds.append((who,json.loads(s)['c']))
        if a:B.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",a)
        if b:A.evaluate("(L)=>{for(const s of L)mpMsg(JSON.parse(s))}",b)
        time.sleep(.015)
def waitT(sec):
    t0=time.time()
    while time.time()-t0<sec:pump(A,B)
ok=[True]
def need(c,msg):
    if not c:ok[0]=False;P('FAIL',msg)
ST="()=>JSON.stringify({tick:MP.tick,ep:MP.ep,ds:MP.desync,pl:CURPL,cs:[CS.tx,CS.ty,CS.rot|0,CS.pl|0],cs2:CS2&&[CS2.tx,CS2.ty,CS2.rot|0,CS2.pl|0],cam:[Math.round(CAM.x),Math.round(CAM.z)],h:mpHash()})"
SL="()=>JSON.stringify(structs.map(s=>[s.sid,s.type,s.tx,s.ty,s.pl|0,s.t,!!s.o3,(s.tiles||[]).length]))"
# free ground for a 2x2 building near the player's own castle (flat, nothing on it), a few tiles apart
SPOTS="""(n)=>{const me=CURPL?CS2:CS,ot=CURPL?CS:CS2,out=[];
 for(let r=5;r<22&&out.length<n;r++)for(let j=-r;j<=r&&out.length<n;j++)for(let i=-r;i<=r&&out.length<n;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=me.tx+2+i,ty=me.ty+2+j;
  let free=true;for(let b=-1;b<=2&&free;b++)for(let a=-1;a<=2&&free;a++){const k=(ty+b)*TW+tx+a;if(!valid(tx+a,ty+b)||occ.get(k)||ter[k]||pth[k]||HT[k]!==HT[ty*TW+tx])free=false}
  if(!free||out.some(u=>Math.abs(u.tx-tx)<5&&Math.abs(u.ty-ty)<5))continue;out.push({tx,ty,dMe:Math.round(Math.hypot(tx-me.tx,ty-me.ty)),dOt:Math.round(Math.hypot(tx-ot.tx,ty-ot.ty))})}
 return JSON.stringify(out)}"""
UNDER="(p)=>{const g=pickGround(p[0]*cv.width/innerWidth,p[1]*cv.height/innerHeight);return g?[Math.floor(g.x),Math.floor(g.z)]:null}"
KINDS=['house','farm','storage','barracks','academy','market','forester','guild','tower','wall','path','gate']
def place_all(pg,who,pl):
    """pg clicks one structure of each kind near its own castle; returns the number of structures checked"""
    other=B if pg is A else A
    spots=json.loads(pg.evaluate(SPOTS,len(KINDS)+4));P(who,'free spots',len(spots),spots[:3])
    need(len(spots)>=len(KINDS),who+': not enough free ground (%d)'%len(spots))
    need(all(s['dMe']<s['dOt'] for s in spots),who+': spots not on its own side')
    done=0
    for kind,sp in zip(KINDS,spots):
        before={s[0] for s in json.loads(A.evaluate(SL))}|{s[0] for s in json.loads(B.evaluate(SL))}
        # the player scrolls to the spot and clicks in the middle of his screen
        sp['px']=640;sp['py']=380
        pg.evaluate("(q)=>{CAM.x=q[0]+.5;CAM.z=q[1]+.5}",[sp['tx'],sp['ty']]);waitT(.4)
        pg.evaluate("(t)=>{mode=t}",kind);pg.mouse.move(sp['px']-3,sp['py']-3);pg.mouse.move(sp['px'],sp['py']);pump(A,B,2)
        under=pg.evaluate(UNDER,[sp['px'],sp['py']])
        if not under:need(False,who+' '+kind+': no ground under the mouse');continue
        need(max(abs(under[0]-sp['tx']),abs(under[1]-sp['ty']))<=3,who+' '+kind+': the middle of the screen is not the spot scrolled to: %s vs %s'%(under,sp))
        pg.mouse.down();pg.mouse.up()
        # the two machines are read at different ticks: wait until both have run the command, and look only at the player's structures of that kind
        NEW="(a)=>JSON.stringify(structs.filter(s=>s.t===0&&s.type===a[0]&&!a[1].includes(s.sid)).map(s=>[s.sid,s.type,s.tx,s.ty,s.pl|0,s.t,!!s.o3,(s.tiles||[]).length]))"
        PT="(q)=>q?pth[q[1]*TW+q[0]]:0"
        t0=time.time()
        while time.time()-t0<25:
            waitT(.5)
            if kind=='path':
                if A.evaluate(PT,under) and B.evaluate(PT,under):break
            elif json.loads(A.evaluate(NEW,[kind,sorted(before)])) and json.loads(B.evaluate(NEW,[kind,sorted(before)])):break
        msg=pg.evaluate("()=>msgS+'|'+mode");pg.evaluate("()=>{mode=null}")
        if kind=='path':
            pa=A.evaluate(PT,under);pb=B.evaluate(PT,under)
            need(pa and pb,who+' path: not laid under the mouse on both (%s %s) %s'%(pa,pb,msg));done+=1;continue
        na=json.loads(A.evaluate(NEW,[kind,sorted(before)]));nb=json.loads(B.evaluate(NEW,[kind,sorted(before)]))
        if not na and not nb:need(False,who+' '+kind+': nothing built, message: '+msg);continue
        need(len(na)==1 and len(nb)==1,who+' '+kind+': %d new on host, %d on guest'%(len(na),len(nb)))
        a=na[0];b=nb[0] if nb else None
        need(a==b,who+' '+kind+': differs between machines: host %s guest %s'%(a,b))
        need(a[1]==kind and a[4]==pl,who+' '+kind+': type / owner wrong: %s'%a)
        d=max(abs(a[2]-under[0]),abs(a[3]-under[1]))
        need(d<=2,who+' '+kind+': built at %s,%s but the mouse was on %s (%d tiles away)'%(a[2],a[3],under,d))
        need(a[6] and b and b[6],who+' '+kind+': no mesh (invisible) host %s guest %s'%(a[6],b and b[6]))
        done+=1
    return done
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport={'width':1280,'height':720});errs=[]
        pg.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:300]))
        fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
        pg.goto((Path(ROOT)/'dist'/html).resolve().as_uri(),timeout=600000);pg.wait_for_timeout(2500)
        P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    # the lobby: the host rolls a world and finds two sites (seeded), each player confirms his own in the picker, the host starts
    A.evaluate("""()=>{const R0=Math.random;let s=103;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
     Math.random=R0;window.__ab=[a,b];mpWorldSync()}""");pump(A,B,3)
    ab=json.loads(A.evaluate("()=>JSON.stringify(window.__ab)"));P('sites',ab)
    B.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[1]);pump(A,B,3)
    A.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[0]);pump(A,B,3)
    P('lobby',A.evaluate("()=>JSON.stringify({mine:MP.mine,theirs:MP.theirs})"),B.evaluate("()=>JSON.stringify({mine:MP.mine,theirs:MP.theirs})"))
    A.evaluate("()=>{mpStart()}");pump(A,B,3);waitT(3)
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST));P('A',sa);P('B',sb)
    # #3: each castle on the site its player chose, the same on both machines, each player looking at his own
    need(sa['cs']==sb['cs'] and sa['cs2']==sb['cs2'],'castles differ between machines')
    need(sa['cs'][:2]==[ab[0]['tx']-2,ab[0]['ty']-2] and sa['cs'][3]==0,'host castle not on the host site')
    need(sa['cs2'] and sa['cs2'][:2]==[ab[1]['tx']-2,ab[1]['ty']-2] and sa['cs2'][3]==1,'guest castle not on the guest site')
    need(abs(sb['cam'][0]-ab[1]['tx'])<=3 and abs(sb['cam'][1]-ab[1]['ty'])<=3,'guest camera not on its castle: %s'%sb['cam'])
    need(abs(sa['cam'][0]-ab[0]['tx'])<=3 and abs(sa['cam'][1]-ab[0]['ty'])<=3,'host camera not on its castle: %s'%sa['cam'])
    need(sa['pl']==0 and sb['pl']==1,'player index wrong')
    n=place_all(B,'guest',1);P('guest placed and checked',n)
    n2=place_all(A,'host',0);P('host placed and checked',n2)
    need(n==len(KINDS) and n2==len(KINDS),'not every kind was placed');NK=len(KINDS)
    # rally point of the guest's castle, and the King: at the guest's castle
    sp=json.loads(B.evaluate(SPOTS,1))
    if sp:
        s0=sp[0];s0['px']=640;s0['py']=380;B.evaluate("(q)=>{CAM.x=q[0]+.5;CAM.z=q[1]+.5}",[s0['tx'],s0['ty']]);waitT(.4);B.evaluate("()=>{mode='rallyc'}");B.mouse.move(s0['px']-3,s0['py']);B.mouse.move(s0['px'],s0['py']);pump(A,B,2);u=B.evaluate(UNDER,[s0['px'],s0['py']]);B.mouse.down();B.mouse.up();waitT(3)
        R="()=>JSON.stringify([CS.rally?[Math.floor(CS.rally.x/TS),Math.floor(CS.rally.y/TS)]:null,CS2.rally?[Math.floor(CS2.rally.x/TS),Math.floor(CS2.rally.y/TS)]:null])"
        ra=json.loads(A.evaluate(R));rb=json.loads(B.evaluate(R));P('rally',ra,rb,'mouse',u)
        need(ra==rb and ra[1]==u and ra[0] is None,'castle rally of the guest: %s %s, mouse %s'%(ra,rb,u))
    P('train king',B.evaluate("()=>{mode=null;selB=CS2;msgS='';train('king');return msgS+'|out '+JSON.stringify(MP.out)}"));waitT(1)
    for _ in range(60):
        if 'king' in A.evaluate("()=>units.map(u=>u.type).join()"):break
        waitT(1)
    K="()=>JSON.stringify(units.filter(u=>u.type==='king').map(u=>[u.pl|0,Math.round(u.x/TS),Math.round(u.y/TS),Math.round(Math.hypot(u.x-CS2.x,u.y-CS2.y)/TS),Math.round(Math.hypot(u.x-CS.x,u.y-CS.y)/TS)]))"
    ka=json.loads(A.evaluate(K));kb=json.loads(B.evaluate(K));P('king',ka,kb)
    need(len(ka)==1 and ka==kb and ka[0][0]==1 and ka[0][3]<ka[0][4],'the guest King is not at the guest castle: %s %s'%(ka,kb))
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST));P('before resync A',sa);P('before resync B',sb)
    need(sa['ep']==0 and sb['ep']==0 and not sa['ds'] and not sb['ds'],'a resync happened by itself')
    # a resync must leave each player where he was looking, and the guest still builds at home after it
    B.evaluate("()=>{CAM.x=CS2.tx-9;CAM.z=CS2.ty+7;CAM.yaw=.6}");A.evaluate("()=>{CAM.x=CS.tx+8;CAM.z=CS.ty-6;CAM.yaw=-.4}");waitT(.5)
    C0="()=>JSON.stringify([+CAM.x.toFixed(2),+CAM.z.toFixed(2),+CAM.yaw.toFixed(2),+CAM.dist.toFixed(1)])"
    ca=A.evaluate(C0);cb=B.evaluate(C0);B.evaluate("()=>{RESP[0].g+=17}")
    t0=time.time()
    while time.time()-t0<240:
        pump(A,B);a=json.loads(A.evaluate(ST));b=json.loads(B.evaluate(ST))
        if a['ep']==1 and b['ep']==1 and not a['ds'] and not b['ds']:break
    need(a['ep']==1 and b['ep']==1,'no resync after the corruption');waitT(1)
    need(A.evaluate(C0)==ca and B.evaluate(C0)==cb,'the resync moved a camera: host %s -> %s, guest %s -> %s'%(ca,A.evaluate(C0),cb,B.evaluate(C0)))
    need(json.loads(B.evaluate(ST))['pl']==1,'guest player index after resync')
    KINDS[:]=['house','tower'];n3=place_all(B,'guest after resync',1);need(n3==2,'guest building after the resync')
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST));P('end A',sa);P('end B',sb)
    waitT(2);OWN="()=>JSON.stringify(structs.filter(s=>s.t===0).map(s=>[s.sid,s.type,s.tx,s.ty,s.pl|0]))"
    need(A.evaluate(OWN)==B.evaluate(OWN),'the players\' structures differ at the end')
    P('commands sent',len(cmds),json.dumps(cmds[:6]))
    P('RESULT','OK' if ok[0] else 'FAIL')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
