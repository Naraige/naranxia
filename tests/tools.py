import json,sys,os
from playwright.sync_api import sync_playwright
# test mode (F10) actions and the bug report (F8): python3 tests/tools.py [naranxia_readable.html] [shot.png]
# writes dist/test_bug.json (a real report) so tools/repro.py can be tried on it
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html';shot=sys.argv[2] if len(sys.argv)>2 else None
def P(*a):print(*a,flush=True)
with sync_playwright() as p:
    import mp_harness as harness
    b=p.chromium.launch(args=harness.FLAGS)
    pg,errs=harness.load(b,html,1280,720)
    r=json.loads(pg.evaluate("""async()=>{let s=21;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
     rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();Math.random=RR;waveT=1e9;
     const O={},R=RESP[0],g0=R.g;devToggle();O.open=devOpen;
     devAct('res');O.res=R.g-g0;
     devAct('rsch');O.rsch=Object.values(RS2.done).every(x=>x)&&RS.done;
     const z0=units.filter(u=>u.t===1).length;devAct('zomb');devAct('brute');O.spawned=units.filter(u=>u.t===1).length-z0;
     devAct('wave');O.waveT=waveT;for(let i=0;i<4;i++)update(.05);O.waveOn=waveOn;
     (()=>{const f=freeSite('house',CS.tx-14,CS.ty-14);if(f)build('house',f[0],f[1])})();const nb=structs.filter(q=>q.t===0&&q.prog<1).length;devAct('build');O.built=[nb,structs.filter(q=>q.t===0&&q.prog<1).length];
     const k=units.find(u=>u.t===0);k.hp=1;devAct('heal');O.healed=k.hp===T[k.type].hp;
     devAct('kill');for(let i=0;i<3;i++)update(.05);O.left=units.filter(u=>u.t===1&&u.hp>0).length+SW.n;
     devAct('spd');O.spd=spd;devAct('spd');devAct('spd');devAct('spd');O.spd2=spd;
     O.devu=DEVU;const a0=ACH.size;ach('res');O.achBlocked=ACH.size===a0;
     console.error('test error from tests/tools.py');
     inGame=true;started=true;
     const capture=bugReport();__stepFrame();await capture;const B=window.__bug;O.report={ver:B.ver,mode:B.mode,test:B.test,seed:B.seed===SEED,save:!!(B.save&&B.save.v),shot:!!(B.shot&&B.shot.length>5000),errors:B.errors.length,msgs:B.messages.length};
     window.__bugtxt=JSON.stringify(B);return JSON.stringify(O)}"""))
    P('result',json.dumps(r))
    txt=pg.evaluate('()=>window.__bugtxt');open(os.path.join(ROOT,'dist','test_bug.json'),'w').write(txt);P('report bytes',len(txt))
    if shot:pg.screenshot(path=shot)
    ok=r['open'] and r['res']==10000 and r['rsch'] and r['spawned']>=15 and r['waveOn'] and r['built'][0]>=1 and r['built'][1]==0 and r['healed'] and r['left']==0 and r['spd']==2 and r['spd2']==1 and r['devu'] and r['achBlocked'] \
       and r['report']['save'] and r['report']['shot'] and r['report']['errors']>=1 and r['report']['test']
    for key in ('open','rsch','waveOn','healed','devu','achBlocked'):
        harness.check(key,r[key],True)
    harness.check('resources granted',r['res'],10000)
    harness.check('all requirements',bool(ok))
    harness.check('page errors',errs,[])
    from browser_fixture import result,emit
    emit(result('tools','Solo-only developer actions, achievement guard and complete bug report',harness.assertions,harness.started,harness.phases,{'html':html}))
    b.close()
    if not ok or errs:sys.exit(1)
