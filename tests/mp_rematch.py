import json,sys,os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import mp_harness as harness
# co-op rematch: at the end of a co-op game "Play again" brings both players back to the lobby with the connection kept (no solo setup screen),
# the host's new map reaches the guest, both choose a castle again, and the second game runs in step on both machines
# usage: python3 tests/mp_rematch.py [naranxia_readable.html]
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
INIT="""()=>{'use strict';window.__out=[];MP.dc={readyState:'open',send:s=>window.__out.push(s)};
 renderer.render=function(){};
 const _sg=startGame;startGame=function(){_sg();for(const R of RESP){R.g=90000;R.w=90000;R.s=90000;R.f=90000}waveT=1e9};
 return 'ok'}"""
ST="()=>JSON.stringify({tick:MP.tick,on:MP.on,conn:MP.conn,ep:MP.ep,ds:MP.desync,seed:SEED,over:over,started:started,mine:!!MP.mine,theirs:!!MP.theirs,h:MP.on?mpHash():null})"
def P(*a):print(*a,flush=True)
SITES="""(s)=>{const R0=Math.random;let q=s,a=null,b=null;Math.random=()=>{q=(q*16807)%2147483647;return (q-1)/2147483646};
 for(let t=0;t<20000&&!(a&&b);t++){randomSite(false);if(!pickPos||!pickPos.ok)continue;const p={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=p;else{const d=Math.hypot(a.tx-p.tx,a.ty-p.ty);if(d>=24&&d<=60)b=p}}
 Math.random=R0;return JSON.stringify([a,b])}"""
def st(pg):return json.loads(pg.evaluate(ST))
def start_game(A,B,seed):
    A.evaluate("()=>{rollWorld();if(pvKey!==SEED)buildPreview()}");harness.pump(A,B,3)
    ab=json.loads(A.evaluate(SITES,seed))
    B.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[1]);harness.pump(A,B,3)
    A.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[0]);harness.pump(A,B,3)
    A.evaluate("()=>{mpStart();if(!MP.on)mpStart()}");harness.pump(A,B,3);harness.wait_seconds(A,B,3,lambda:None)
with sync_playwright() as p:
    br=p.chromium.launch(args=harness.FLAGS);pages=[]
    for i in range(2):
        pg,errs=harness.load(br,html,640,400);P('loaded',i,pg.evaluate(INIT));pages.append((pg,errs))
    A,ea=pages[0];B,eb=pages[1]
    A.evaluate("()=>{MP.host=true;MP.conn=true}");B.evaluate("()=>{MP.host=false;MP.conn=true}")
    start_game(A,B,103)
    a=st(A);b=st(B);P('game 1',a['tick'],b['tick'])
    harness.check('first game runs on both',a['on'] and b['on'] and a['tick']>20 and b['tick']>20)
    seed1=a['seed']
    # both castles fall: the game ends on both machines at the same tick
    for pg in (A,B):pg.evaluate("()=>{CS.hp=0;if(CS2)CS2.hp=0}")
    harness.wait_seconds(A,B,3,lambda:None)
    a=st(A);b=st(B)
    harness.check('game over on both',a['over'] and b['over'])
    # the host plays the second game on a small world: only the host's setting is set, the guest must follow it
    A.evaluate("()=>localStorage.setItem('dk_msize','2')")
    # Play again on each side
    for pg in (A,B):pg.evaluate("()=>playAgain()")
    harness.pump(A,B,6)
    a=st(A);b=st(B);P('after play again',a,b)
    harness.check('co-op stopped on both',not a['on'] and not b['on'])
    harness.check('connection kept',a['conn'] and b['conn'])
    harness.check('back in the lobby, not in the solo setup',not a['started'] and not b['started'] and not A.evaluate("()=>settingsState.setupOpen") and not B.evaluate("()=>settingsState.setupOpen"))
    harness.check('game over flag cleared',not a['over'] and not b['over'])
    harness.check('new map on the host',a['seed']!=seed1)
    harness.check('the guest got the host map',a['seed']==b['seed'])
    harness.check('castles must be chosen again',not a['mine'] and not a['theirs'] and not b['mine'] and not b['theirs'])
    harness.check('the lobby is shown',A.evaluate("()=>getComputedStyle(document.getElementById('mpLobby')).display")!='none' and B.evaluate("()=>getComputedStyle(document.getElementById('mpLobby')).display")!='none')
    # second game
    harness.pump(A,B,3)
    ab=json.loads(A.evaluate(SITES,211))
    B.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[1]);harness.pump(A,B,3)
    A.evaluate("(s)=>{pickPos={tx:s.tx,ty:s.ty,ok:true};confirmPick()}",ab[0]);harness.pump(A,B,3)
    A.evaluate("()=>{mpStart();if(!MP.on)mpStart()}");harness.pump(A,B,3);harness.wait_seconds(A,B,4,lambda:None)
    a=st(A);b=st(B);P('game 2',a['tick'],b['tick'],a['ep'],b['ep'])
    harness.check('second game runs on both',a['on'] and b['on'] and a['tick']>20 and b['tick']>20)
    harness.check('no resync or desync',a['ep']==0 and b['ep']==0 and not a['ds'] and not b['ds'])
    RT="()=>JSON.stringify({far:Math.round(Math.max(...ROUTES.map(r=>Math.max(...r.pts.map(p=>Math.min(Math.hypot(p[0]-CS.tx,p[1]-CS.ty),CS2?Math.hypot(p[0]-CS2.tx,p[1]-CS2.ty):1e9)))))),n:ROUTES.length,p0:ROUTES[0].pts[0]})"
    ra=json.loads(A.evaluate(RT));rb=json.loads(B.evaluate(RT));P('routes',ra,rb)
    harness.check('host lanes are short (small world)',ra['far']<=175)
    harness.check('the guest follows the host world size',rb==ra)
    A.evaluate("()=>localStorage.removeItem('dk_msize')")
    harness.finish('mp_rematch',True,A,B,ea+eb,None)
    br.close()
