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
        vw=pg.viewport_size;sp['px']=vw['width']//2;sp['py']=vw['height']//2+20
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
# the two machines do not look alike: another window size and pixel ratio for each (the guest's is a laptop at 1.5)
VIEW=[({'width':1280,'height':720},1),({'width':1024,'height':640},1.5)]
with sync_playwright() as p:
    pages=[];brs=[]
    for i in range(2):
        br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']);brs.append(br)
        pg=br.new_page(viewport=VIEW[i][0],device_scale_factor=VIEW[i][1]);errs=[]
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
    OWN="()=>JSON.stringify(structs.filter(s=>s.t===0).map(s=>[s.sid,s.type,s.tx,s.ty,s.pl|0]))"
    # MPB_WIDE=1 skips the first part (12 kinds each, rally, King, first resync) to look only at the wide part, which is slow under load
    if not os.environ.get('MPB_WIDE'):
        n=place_all(B,'guest',1);P('guest placed and checked',n)
        n2=place_all(A,'host',0);P('host placed and checked',n2)
        need(n==len(KINDS) and n2==len(KINDS),'not every kind was placed');NK=len(KINDS)
        # rally point of the guest's castle, and the King: at the guest's castle
        sp=json.loads(B.evaluate(SPOTS,1))
        if sp:
            s0=sp[0];s0['px']=B.viewport_size['width']//2;s0['py']=B.viewport_size['height']//2+20;B.evaluate("(q)=>{CAM.x=q[0]+.5;CAM.z=q[1]+.5}",[s0['tx'],s0['ty']]);waitT(.4);B.evaluate("()=>{mode='rallyc'}");B.mouse.move(s0['px']-3,s0['py']);B.mouse.move(s0['px'],s0['py']);pump(A,B,2);u=B.evaluate(UNDER,[s0['px'],s0['py']]);B.mouse.down();B.mouse.up();waitT(3)
            R="()=>JSON.stringify([CS.rally?[Math.floor(CS.rally.x/TS),Math.floor(CS.rally.y/TS)]:null,CS2.rally?[Math.floor(CS2.rally.x/TS),Math.floor(CS2.rally.y/TS)]:null])"
            ra=json.loads(A.evaluate(R));rb=json.loads(B.evaluate(R));P('rally',ra,rb,'mouse',u)
            need(ra==rb and ra[1]==u and ra[0] is None,'castle rally of the guest: %s %s, mouse %s'%(ra,rb,u))
        P('train king',B.evaluate("()=>{mode=null;selB=CS2;msgS='';train('king');return msgS+'|out '+JSON.stringify(MP.out)}"));waitT(1)
        for _ in range(60):
            if 'king' in A.evaluate("()=>units.map(u=>u.type).join()"):break
            waitT(1)
        K="()=>JSON.stringify(units.filter(u=>u.type==='king').map(u=>[u.pl|0,Math.round(u.x/TS),Math.round(u.y/TS),Math.round(Math.hypot(u.x-CS2.x,u.y-CS2.y)/TS),Math.round(Math.hypot(u.x-CS.x,u.y-CS.y)/TS)]))"
        ka=json.loads(A.evaluate(K));kb=json.loads(B.evaluate(K));P('king',ka,kb)
        need(len(ka)==1 and len(kb)==1 and ka[0][0]==1 and kb[0][0]==1 and ka[0][3]<ka[0][4] and kb[0][3]<kb[0][4] and abs(ka[0][1]-kb[0][1])<=2 and abs(ka[0][2]-kb[0][2])<=2,'the guest King is not at the guest castle: %s %s'%(ka,kb))
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
    # ---- the way the King plays: other window sizes, a turned and zoomed camera, drags, a pause, a moved castle, a click during a resync ----
    # every click is checked three ways: the tile under the mouse on the player's screen, the tile in the command that left (mpPush), the structure on both machines
    SPOTSAT="""(a)=>{const c=a[0]?CS2:CS,out=[];
     for(let r=a[1];r<a[1]+18&&out.length<a[2];r++)for(let j=-r;j<=r&&out.length<a[2];j++)for(let i=-r;i<=r&&out.length<a[2];i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=c.tx+2+i,ty=c.ty+2+j;
      let free=true;for(let b=-1;b<=2&&free;b++)for(let a=-1;a<=2&&free;a++){const k=(ty+b)*TW+tx+a;if(!valid(tx+a,ty+b)||occ.get(k)||ter[k]||pth[k]||HT[k]!==HT[ty*TW+tx])free=false}
      if(!free||out.some(u=>Math.abs(u.tx-tx)<4&&Math.abs(u.ty-ty)<4))continue;out.push({tx,ty})}
     return JSON.stringify(out)}"""
    PXOF="(q)=>{const v=scr(q[0]+1,HT[q[1]*TW+q[0]],q[1]+1);return[v.x/inputState.DPR,v.y/inputState.DPR,v.ok]}"
    NEWS="(a)=>JSON.stringify(structs.filter(s=>s.t===0&&s.type===a[0]&&!a[1].includes(s.sid)).map(s=>[s.sid,s.tx,s.ty,s.pl|0,!!s.o3]))"
    def sids(pg):return pg.evaluate("()=>structs.map(s=>s.sid)")
    def lastb(n0):
        L=[c for w,cs in cmds[n0:] for c in cs if c.get('k')=='b'];return L[-1] if L else None
    def aim(pg,spot,fx,fy):
        """scroll so that the spot lies at (fx,fy) of the window, as a real player would after dragging the map; returns its css pixel.
        Moving the camera moves the point under any pixel by the same amount, so the picked point is walked onto the spot (the camera follows the next frame)"""
        vw=pg.viewport_size;px,py=fx*vw['width'],fy*vw['height'];tx,tz=spot['tx']+1,spot['ty']+1
        pg.evaluate("(q)=>{CAM.x=q[0];CAM.z=q[1]}",[tx,tz])
        for _ in range(10):
            waitT(.25)
            g=pg.evaluate("(p)=>{const g=pickGround(p[0]*cv.width/innerWidth,p[1]*cv.height/innerHeight);return g?[g.x,g.z]:null}",[px,py])
            if g and abs(g[0]-tx)<.25 and abs(g[1]-tz)<.25:break
            if g:pg.evaluate("(d)=>{CAM.x+=d[0];CAM.z+=d[1]}",[tx-g[0],tz-g[1]])
        waitT(.25);return pg.evaluate(PXOF,[spot['tx'],spot['ty']])
    def click_build(pg,who,kind,spot,fx,fy,want_pl,tol=2):
        n0=len(cmds);ids=sids(A)
        pg.evaluate("()=>{questPanelState.log=false}")   # the quest panel lies over the left of a small window: a click there opens the log, not a building
        x,y,okp=aim(pg,spot,fx,fy);pg.evaluate("(t)=>{mode=t}",kind);pg.mouse.move(x-5,y-4);pg.mouse.move(x,y);pump(A,B,2)
        under=pg.evaluate(UNDER,[x,y]);pg.mouse.down();pg.mouse.up()
        t0=time.time();na=nb=[]
        while time.time()-t0<25:
            waitT(.5);na=json.loads(A.evaluate(NEWS,[kind,ids]));nb=json.loads(B.evaluate(NEWS,[kind,ids]))
            if na and nb:break
        pg.evaluate("()=>{mode=null}");cm=lastb(n0)
        tag='%s %s at %.2f,%.2f of the window'%(who,kind,fx,fy)
        if not(na and nb):
            hud=pg.evaluate("(p)=>JSON.stringify(hudState.uiRects.filter(r=>p[0]*inputState.DPR>=r.x&&p[0]*inputState.DPR<=r.x+r.w&&p[1]*inputState.DPR>=r.y&&p[1]*inputState.DPR<=r.y+r.h).map(r=>[r.x|0,r.y|0,r.w|0,r.h|0]).concat([[innerWidth,innerHeight,hudState.uiRects.length]]))",[x,y])
            if cm is None and len(json.loads(hud))>1:
                P('note:',tag,'- the click fell on the HUD at',(round(x),round(y)),'rects',hud,'no command','state',pg.evaluate("()=>JSON.stringify({over:over,qlog:questPanelState.log,mode:mode,paused:paused,msg:msgS})"))
                if not os.path.exists(os.path.join(ROOT,'dist','test-logs','mp_build_hud.png')):pg.screenshot(path=os.path.join(ROOT,'dist','test-logs','mp_build_hud.png'))
                return
            need(False,tag+': nothing built on both (%s %s) under %s command %s msg %s'%(na,nb,under,cm,pg.evaluate("()=>msgS")));return
        need(len(na)==1 and len(nb)==1,tag+': %d / %d new'%(len(na),len(nb)))
        a,b=na[0],nb[0]
        need(a==b,tag+': differs between machines %s %s'%(a,b))
        need(a[3]==want_pl,tag+': owner %d, wanted %d'%(a[3],want_pl))
        need(cm is not None and under and abs(cm['x']-under[0])<=tol and abs(cm['y']-under[1])<=tol,tag+': command %s but the mouse was on %s'%(cm and (cm['x'],cm['y']),under))
        need(under and max(abs(a[1]-under[0]),abs(a[2]-under[1]))<=tol+1,tag+': built at %s,%s, mouse on %s'%(a[1],a[2],under))
        need(a[4] and b[4],tag+': no mesh')
    # W1: windows of other sizes (resized while playing), camera turned with the right button and zoomed with the wheel, then clicks all over the screen
    B.set_viewport_size({'width':1500,'height':800});A.set_viewport_size({'width':960,'height':600});waitT(1)
    need(B.evaluate("()=>cv.width===Math.floor(innerWidth*inputState.DPR)&&cv.height===Math.floor(innerHeight*inputState.DPR)"),'guest canvas not resized with its window')
    for pg,who,pl in((B,'guest',1),(A,'host',0)):
        vw=pg.viewport_size;pg.mouse.move(vw['width']*.5,vw['height']*.5);pg.mouse.down(button='right');pg.mouse.move(vw['width']*.5+70,vw['height']*.5+25,steps=6);pg.mouse.up(button='right')
        pg.mouse.wheel(0,-250);pg.wait_for_timeout(300);P(who,'camera',pg.evaluate("()=>JSON.stringify([CAM.yaw.toFixed(2),CAM.pitch.toFixed(2),CAM.dist.toFixed(1)])"))
        sp=json.loads(pg.evaluate(SPOTSAT,[pl,6,5]))
        need(len(sp)>=5,who+': no free spots for the wide test')
        for (kind,fx,fy),spot in zip((('house',.55,.3),('farm',.7,.35),('storage',.5,.5),('barracks',.45,.58),('tower',.72,.55)),sp):
            click_build(pg,who+' (turned camera)',kind,spot,fx,fy,pl)
    # W2: the guest scrolls to the host's castle and builds beside it: it is built there, as the guest's (nothing in the rules forbids it); and the host beside the guest's castle
    spo=json.loads(B.evaluate(SPOTSAT,[0,4,3]));P('guest next to the host castle',spo)
    for kind,spot in zip(('house','farm','barracks'),spo):click_build(B,'guest beside the host castle',kind,spot,.5,.45,1)
    spg=json.loads(A.evaluate(SPOTSAT,[1,4,2]))
    for kind,spot in zip(('house','storage'),spg):click_build(A,'host beside the guest castle',kind,spot,.5,.45,0)
    # W3: a drag laying a path across the partner's castle area: every tile under the mouse gets a path on both machines
    PA=json.loads(B.evaluate("""()=>{const c=CS,out=[];for(let r=4;r<24&&out.length<1;r++)for(let j=-r;j<=r&&!out.length;j++)for(let i=-r;i<=r&&!out.length;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=c.tx+2+i,ty=c.ty+2+j;let f=true;for(let k=0;k<9&&f;k++){const q=ty*TW+tx+k;if(!valid(tx+k,ty)||ter[q]!==0||occ.get(q)||pth[q]||HT[q]!==HT[ty*TW+tx])f=false}if(f)out.push([tx,ty])}return JSON.stringify(out)}"""))
    if PA:
        t0_=PA[0];B.evaluate("(q)=>{CAM.x=q[0]+4.5;CAM.z=q[1]+.5}",t0_);waitT(.4)
        x0,y0,_=B.evaluate(PXOF,[t0_[0],t0_[1]]);x1,y1,_=B.evaluate(PXOF,[t0_[0]+8,t0_[1]])
        B.evaluate("()=>{mode='path'}");B.mouse.move(x0,y0);B.mouse.down();seen=[]
        for k in range(1,17):
            B.mouse.move(x0+(x1-x0)*k/16,y0+(y1-y0)*k/16);seen.append(B.evaluate(UNDER,[x0+(x1-x0)*k/16,y0+(y1-y0)*k/16]))
        B.mouse.up();B.evaluate("()=>{mode=null}");waitT(3)
        T2=[list(t) for t in {tuple(t) for t in seen[1:] if t}]
        pa=json.loads(A.evaluate("(l)=>JSON.stringify(l.map(t=>pth[t[1]*TW+t[0]]))",T2));pb=json.loads(B.evaluate("(l)=>JSON.stringify(l.map(t=>pth[t[1]*TW+t[0]]))",T2))
        P('drag across the host castle area: tiles',len(T2),pa);need(pa==pb and 0 not in pa,'the dragged path is not on every tile under the mouse, on both machines: host %s guest %s'%(pa,pb))
    else:P('no free line for the path drag')
    # W4: placing while the game is paused (the pause is shared); nothing is built until the game goes on, then it is built where the mouse was, once
    spp=json.loads(B.evaluate(SPOTSAT,[1,6,2]));ids=sids(A);n0=len(cmds)
    A.evaluate("()=>{paused=true;MP.dc.send(JSON.stringify({k:'p',v:true}))}");waitT(1)
    x,y,_=aim(B,spp[0],.4,.4);B.evaluate("()=>{mode='house'}");B.mouse.move(x-4,y-3);B.mouse.move(x,y);pump(A,B,2);u=B.evaluate(UNDER,[x,y]);B.mouse.down();B.mouse.up();B.evaluate("()=>{mode=null}");waitT(2)
    need(not json.loads(A.evaluate(NEWS,['house',ids])),'a command ran while the game was paused')
    B.evaluate("()=>{CAM.yaw+=.5}");A.evaluate("()=>{paused=false;MP.dc.send(JSON.stringify({k:'p',v:false}))}");t0=time.time()
    while time.time()-t0<25 and not(json.loads(A.evaluate(NEWS,['house',ids])) and json.loads(B.evaluate(NEWS,['house',ids]))):waitT(.5)
    na=json.loads(A.evaluate(NEWS,['house',ids]));nb=json.loads(B.evaluate(NEWS,['house',ids]));cm=lastb(n0)
    need(len(na)==1 and na==nb and na[0][3]==1 and cm and u and abs(cm['x']-u[0])<=2 and abs(na[0][1]-u[0])<=3,'paused placement: %s %s command %s mouse %s'%(na,nb,cm,u))
    # W5: the guest moves his castle (the host sees it move, his own castle stays), then builds beside the new place
    cs0=json.loads(A.evaluate("()=>JSON.stringify([CS.tx,CS.ty,CS2.tx,CS2.ty])"))
    mv=B.evaluate("""()=>{const c=CS2,out=[];for(let r=8;r<16&&!out.length;r++)for(let j=-r;j<=r&&!out.length;j++)for(let i=-r;i<=r&&!out.length;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const tx=c.tx+2+i,ty=c.ty+2+j;let f=true;
      for(let b=-4;b<=4&&f;b++)for(let a=-4;a<=4&&f;a++){const k=(ty+b)*TW+tx+a;if(!valid(tx+a,ty+b)||occ.get(k)||ter[k]||pth[k]||HT[k]!==HT[ty*TW+tx])f=false}if(f)out.push([tx,ty])}return out[0]||null}""")
    if mv:
        x,y,_=aim(B,{'tx':mv[0]-1,'ty':mv[1]-1},.5,.45)
        B.evaluate("()=>{mode='movec'}");B.mouse.move(x-3,y-3);B.mouse.move(x,y);pump(A,B,2);u=B.evaluate(UNDER,[x,y]);B.mouse.down();B.mouse.up();waitT(4)
        ca=json.loads(A.evaluate("()=>JSON.stringify([CS.tx,CS.ty,CS2.tx,CS2.ty])"));cb=json.loads(B.evaluate("()=>JSON.stringify([CS.tx,CS.ty,CS2.tx,CS2.ty])"));P('castle move',cs0,'->',ca,cb,'mouse',u)
        need(ca==cb and ca[:2]==cs0[:2] and ca[2:]!=cs0[2:] and u and abs(ca[2]+2-u[0])<=1 and abs(ca[3]+2-u[1])<=1,'the guest castle did not move to the mouse, or the host castle moved: %s %s'%(ca,cb))
        B.evaluate("()=>{CAM.x=5;CAM.z=5;home()}");hm=json.loads(B.evaluate("()=>JSON.stringify([Math.round(CAM.x),Math.round(CAM.z),CS2.tx+2,CS2.ty+2])"))
        need(abs(hm[0]-hm[2])<=1 and abs(hm[1]-hm[3])<=1,'home() of the guest is not its moved castle: %s'%hm)
        spn=json.loads(B.evaluate(SPOTSAT,[1,4,2]));click_build(B,'guest beside its moved castle','house',spn[0],.5,.45,1)
    else:P('no spot to move the castle to')
    # W6: a click right before a resync must not be swallowed by it
    spr=json.loads(B.evaluate(SPOTSAT,[1,5,3]));ids=sids(A);rs0=json.loads(A.evaluate(ST))['ep']
    x,y,_=aim(B,spr[0],.45,.45);B.evaluate("()=>{mode='tower'}");B.mouse.move(x-3,y-3);B.mouse.move(x,y);pump(A,B,1);u=B.evaluate(UNDER,[x,y]);B.mouse.down();B.mouse.up();B.evaluate("()=>{mode=null;RESP[0].g+=23}")
    t0=time.time()
    while time.time()-t0<240:
        pump(A,B);a=json.loads(A.evaluate(ST));b=json.loads(B.evaluate(ST))
        if a['ep']>rs0 and b['ep']>rs0 and not a['ds'] and not b['ds']:break
    waitT(6)
    na=json.loads(A.evaluate(NEWS,['tower',ids]));nb=json.loads(B.evaluate(NEWS,['tower',ids]));P('click right before a resync: tower',na,nb,'mouse',u,'epoch',a['ep'])
    need(a['ep']>rs0 and na==nb,'resync or machines differ after the click made right before it: %s %s'%(na,nb))
    need(len(na)==1,'the click made right before a resync was lost (%d towers built)'%len(na))
    waitT(1)
    spq=json.loads(B.evaluate(SPOTSAT,[1,8,2]));click_build(B,'guest after the second resync','house',spq[0],.55,.5,1)
    need(A.evaluate(OWN)==B.evaluate(OWN),'the players\' structures differ after the wide phase')
    # the F8 report of the guest must be enough to diagnose a bad placement: who he is, both castles, the window, the last placement commands with their tiles and owners
    B.evaluate("async()=>{await bugReport()}");rep=json.loads(B.evaluate("()=>JSON.stringify(window.__bug&&window.__bug.coop||null)"));A.evaluate("async()=>{await bugReport()}");repA=json.loads(A.evaluate("()=>JSON.stringify(window.__bug&&window.__bug.coop||null)"))
    need(rep and rep.get('me',{}).get('lpl')==1 and not rep['me'].get('host') and len(rep.get('castles',[]))==2 and rep.get('win',{}).get('dpr')==1.5,'the guest report lacks who he is, the castles or the window: %s'%(rep and {k:rep.get(k) for k in('me','castles','win')}))
    pl=(rep or {}).get('plog') or [];P('guest report: %d placement commands, last %s'%(len(pl),pl[-1:]))
    need(len(pl)>=10 and all(e['pl']==1 and e['ex']==1 and e['cur']==1 and not e['bad'] for e in pl if e['mine']==1),'guest placement log wrong or too short: %s'%pl[-3:])
    plA=(repA or {}).get('plog') or [];need(len(plA)>=10 and any(e['mine']==0 and e['pl']==1 and e['ex']==1 and e['cur']==1 for e in plA),'host log lacks the guest commands with owner 1: %s'%plA[-3:])
    need(all(not e['bad'] for e in plA+pl),'a command whose sender index differs from the expected one: %s'%[e for e in plA+pl if e['bad']][:2])
    need(len(pl)<=20 and all(e['mt'] for e in pl if e['mine']==1 and e['t'] not in('rally',)),'the guest log lacks the tile under his mouse')
    # the commands kept for a resync (sent for ticks the snapshot may not hold) are few and recent
    for who_,pg_ in(('host',A),('guest',B)):
        sl=json.loads(pg_.evaluate("()=>JSON.stringify([MP.tick,(MP.sl||[]).map(e=>e[0])])"));need(len(sl[1])<=16 and all(t>=sl[0]-12 for t in sl[1]),who_+': commands kept for a resync are not pruned: %s'%sl)
    # the partner leaves: the guest goes on alone, still as player 2, at home (it used to become player 1: #26)
    B.evaluate("()=>{mpLost()}");B.wait_for_timeout(1500)
    lost=json.loads(B.evaluate("()=>JSON.stringify({on:MP.on,pl:CURPL,lpl:LPL(),res:res===RESP[1]})"));P('guest alone',lost)
    need(lost['on'] is False and lost['pl']==1 and lost['lpl']==1 and lost['res'],'the guest alone is no longer player 2: %s'%lost)
    cs2c=B.evaluate("()=>[CS2.tx+2,CS2.ty+2]");B.evaluate("()=>{CAM.x=5;CAM.z=5;home()}");cam=json.loads(B.evaluate("()=>JSON.stringify([Math.round(CAM.x),Math.round(CAM.z)])"))
    need(abs(cam[0]-cs2c[0])<=3 and abs(cam[1]-cs2c[1])<=3,'home of the guest alone is not its (moved) castle: %s, castle %s'%(cam,cs2c))
    sp=json.loads(B.evaluate(SPOTS,1))[0];ids=B.evaluate("()=>structs.map(s=>s.sid)")
    B.evaluate("(q)=>{CAM.x=q[0]+.5;CAM.z=q[1]+.5}",[sp['tx'],sp['ty']]);B.wait_for_timeout(600);B.evaluate("()=>{mode='farm'}");cx_,cy_=B.viewport_size['width']//2,B.viewport_size['height']//2+20;B.mouse.move(cx_-3,cy_-3);B.mouse.move(cx_,cy_);B.wait_for_timeout(200)
    u=B.evaluate(UNDER,[cx_,cy_]);B.mouse.down();B.mouse.up();B.wait_for_timeout(1200)
    nf=json.loads(B.evaluate("(a)=>JSON.stringify(structs.filter(s=>s.type==='farm'&&!a.includes(s.sid)).map(s=>[s.tx,s.ty,s.pl|0]))",ids));P('farm of the guest alone',nf,'mouse',u)
    need(len(nf)==1 and nf[0][2]==1 and u and max(abs(nf[0][0]-u[0]),abs(nf[0][1]-u[1]))<=2,'the guest alone builds elsewhere or for player 1: %s'%nf)
    P('commands sent',len(cmds),json.dumps(cmds[:6]))
    P('RESULT','OK' if ok[0] else 'FAIL')
    P('ERRS',ea[:3],eb[:3])
    for br in brs:br.close()
