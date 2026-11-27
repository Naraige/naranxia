import json,sys,os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
import mp_harness as harness
# co-op roles (v101): before the game one player chooses Dragon. He founds no castle, is player 2 and flies the dragon; the other holds the
# castle as player 1 whoever hosts. Played twice: the guest rides, then the host rides. Checked on both machines: one castle, player
# indexes, the King at the start, the same dragon (place, flight, breath) once the rider has flown, zombies burnt the same, no desync.
# usage: python3 tests/mp_dragon.py [naranxia_readable.html]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _sg=startGame;startGame=function(){_sg();waveT=1e9};
 return 'ok'}"""
def P(*a):print(*a,flush=True)
ok=[True]
def need(c,msg):
    harness.check(msg,bool(c))
    if not c:ok[0]=False;P('FAIL',msg)
ST="()=>JSON.stringify({tick:MP.tick,ep:MP.ep,ds:MP.desync,pl:CURPL,lpl:LPL(),cs:[CS.tx,CS.ty,CS.pl|0],cs2:!!CS2,drg:DRG,kings:units.filter(u=>u.type==='king').map(u=>u.pl|0),guards:units.filter(u=>u.type==='guard').length,h:mpHash()})"
def play(p,host_rides):
    tag='host rides' if host_rides else 'guest rides'
    br=p.chromium.launch(args=harness.FLAGS);pages=[]
    for i in range(2):
        pg,errs=harness.load(br,html,1024,640);P(tag,'loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    def waitT(sec):harness.wait_seconds(A,B,sec,lambda:None)
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    A.evaluate("""()=>{const R0=Math.random;let s=211;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};rollWorld();randomSite();Math.random=R0;window.__site=pickPos;mpWorldSync()}""");harness.pump(A,B,3)
    site=json.loads(A.evaluate("()=>JSON.stringify(window.__site)"))
    R,C=(A,B) if host_rides else (B,A)   # rider, castle holder
    # the role button of the lobby window, as a player clicks it
    R.evaluate("()=>{document.getElementById('mpRole').click()}");harness.pump(A,B,3)
    need(R.evaluate("()=>MP.role")==1 and C.evaluate("()=>MP.prole")==1,tag+': the role did not reach the partner')
    need(A.evaluate("()=>document.getElementById('mpPlay').disabled") is True,tag+': Play is open before the castle is placed')
    C.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",site);harness.pump(A,B,3)
    need(A.evaluate("()=>document.getElementById('mpPlay').disabled") is False,tag+': Play stays closed with a castle and a rider')
    A.evaluate("()=>{mpStart()}");harness.pump(A,B,3);waitT(2)
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST));P(tag,'A',sa);P(tag,'B',sb)
    need(sa['cs']==sb['cs'] and sa['cs'][:2]==[site['tx']-10,site['ty']-10] and sa['cs'][2]==0,tag+': the castle is not on the chosen site as player 1')
    need(not sa['cs2'] and not sb['cs2'],tag+': a second castle was founded')
    need(sa['drg'] and sa['drg']==sb['drg'],tag+': the dragon differs at the start')
    need(json.loads(R.evaluate(ST))['lpl']==1 and json.loads(C.evaluate(ST))['lpl']==0,tag+': player indexes (rider 2, castle 1)')
    need(sa['kings']==[0] and sb['kings']==[0] and sa['guards']==2,tag+': the King and his two guards must stand at the start: %s'%sa['kings'])
    need(R.evaluate("()=>dragonViewState.P!==null") ,tag+': the rider has no dragon in the hands')
    # the castle holder walks his King with the camera keys
    k0=json.loads(C.evaluate("()=>{const k=units.find(u=>u.type==='king');return JSON.stringify([k.x,k.y])}"))
    C.evaluate("()=>{keys.KeyS=true}");waitT(2.5);C.evaluate("()=>{keys.KeyS=false}");waitT(.5)
    KP="()=>{const k=units.find(u=>u.type==='king');return JSON.stringify([Math.round(k.x),Math.round(k.y)])}"
    ka=json.loads(A.evaluate(KP));kb=json.loads(B.evaluate(KP));mv=((ka[0]-k0[0])**2+(ka[1]-k0[1])**2)**.5
    need(mv>40,tag+': the camera keys did not walk the King (%d)'%mv)
    # the rider takes off, flies, breathes: zombies stand where the breath lands, the same on both machines (a test command of the lockstep)
    R.evaluate("()=>{keys[' ']=true}");waitT(2);R.evaluate("()=>{keys[' ']=false}");waitT(1)
    d=json.loads(A.evaluate("()=>JSON.stringify(DRG)"));need(d['fl']==1 and d['a']>0,tag+': the dragon did not take off on the partner machine: %s'%d)
    R.evaluate("()=>{dragonViewState.fire=true}");waitT(1.5)
    da=json.loads(A.evaluate("()=>JSON.stringify(DRG)"));need(da['f']==1,tag+': the breath did not reach the simulation')
    R.evaluate("()=>{dragonViewState.fire=false}");waitT(1.5)
    need(json.loads(A.evaluate("()=>JSON.stringify(DRG)"))['f']==0,tag+': the breath did not stop')
    # the rider's keys must not build or select anything
    n0=A.evaluate("()=>structs.length");R.evaluate("()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'c',code:'KeyC'}))}");waitT(.5)
    need(R.evaluate("()=>mode")is None and A.evaluate("()=>structs.length")==n0,tag+': a rider key opened a building tool')
    waitT(2)
    sa=json.loads(A.evaluate(ST));sb=json.loads(B.evaluate(ST));P(tag,'end A',sa['tick'],sa['h'],sa['drg']);P(tag,'end B',sb['tick'],sb['h'],sb['drg'])
    need(sa['ep']==0 and sb['ep']==0 and not sa['ds'] and not sb['ds'],tag+': a desync or a resync happened')
    # the rider alone after the partner left: still the rider
    R.evaluate("()=>{mpLost()}")
    need(R.evaluate("()=>LPL()")==1 and R.evaluate("()=>dragonViewState.P!==null"),tag+': the rider alone lost his dragon')
    errs=ea+eb;P(tag,'ERRS',errs[:3]);need(not errs,tag+': page errors')
    return A,B,errs,br
with sync_playwright() as p:
    A,B,e1,br1=play(p,False)
    br1.close()
    A,B,e2,br2=play(p,True)
    P('RESULT','OK' if ok[0] else 'FAIL')
    harness.finish('mp_dragon',ok[0],A,B,e1+e2,None)
    br2.close()
