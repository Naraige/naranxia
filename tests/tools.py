import json,sys,os
from playwright.sync_api import sync_playwright
# test mode (F10) actions and the bug report (F8): python3 tests/tools.py [naranxia_readable.html] [shot.png]
# writes dist/test_bug.json (a real report) so tools/repro.py can be tried on it
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
import fontroute
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html';shot=sys.argv[2] if len(sys.argv)>2 else None
def P(*a):print(*a,flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':720},accept_downloads=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.goto('file://'+os.path.join(ROOT,'dist',html),timeout=180000);pg.wait_for_timeout(3000)
    r=json.loads(pg.evaluate("""async()=>{let s=21;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
     rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();Math.random=RR;waveT=1e9;
     const O={},R=RESP[0],g0=R.g;devToggle();O.open=devOpen;
     devAct('res');O.res=R.g-g0;
     devAct('rsch');O.rsch=Object.values(RS2.done).every(x=>x)&&RS.done;
     const z0=units.filter(u=>u.t===1).length;devAct('zomb');devAct('brute');O.spawned=units.filter(u=>u.t===1).length-z0;
     devAct('wave');O.waveT=waveT;for(let i=0;i<4;i++)update(.05);O.waveOn=waveOn;
     (()=>{for(let r=0;r<14;r++)for(let q=0;q<14;q++){const x=CS.tx+4+r,y=CS.ty-6+q;if(tilesFor('house',x,y,2,0,0).every(([i,j])=>gOK(i,j)&&valid(i,j)&&!occ.has(j*TW+i))){build('house',x,y);return}}})();const nb=structs.filter(q=>q.t===0&&q.prog<1).length;devAct('build');O.built=[nb,structs.filter(q=>q.t===0&&q.prog<1).length];
     const k=units.find(u=>u.t===0);k.hp=1;devAct('heal');O.healed=k.hp===T[k.type].hp;
     devAct('kill');for(let i=0;i<3;i++)update(.05);O.left=units.filter(u=>u.t===1&&u.hp>0).length+SW.n;
     devAct('spd');O.spd=spd;devAct('spd');devAct('spd');devAct('spd');O.spd2=spd;
     O.devu=DEVU;const a0=ACH.size;ach('res');O.achBlocked=ACH.size===a0;
     console.error('test error from tests/tools.py');
     inGame=true;started=true;await new Promise(r=>setTimeout(r,400));
     await bugReport();const B=window.__bug;O.report={ver:B.ver,mode:B.mode,test:B.test,seed:B.seed===SEED,save:!!(B.save&&B.save.v),shot:!!(B.shot&&B.shot.length>5000),errors:B.errors.length,msgs:B.messages.length};
     window.__bugtxt=JSON.stringify(B);return JSON.stringify(O)}"""))
    P('result',json.dumps(r))
    txt=pg.evaluate('()=>window.__bugtxt');open(os.path.join(ROOT,'dist','test_bug.json'),'w').write(txt);P('report bytes',len(txt))
    if shot:pg.wait_for_timeout(600);pg.screenshot(path=shot)
    ok=r['open'] and r['res']==10000 and r['rsch'] and r['spawned']>=15 and r['waveOn'] and r['built'][0]>=1 and r['built'][1]==0 and r['healed'] and r['left']==0 and r['spd']==2 and r['spd2']==1 and r['devu'] and r['achBlocked'] \
       and r['report']['save'] and r['report']['shot'] and r['report']['errors']>=1 and r['report']['test']
    P('RESULT','OK' if ok and not errs else 'FAIL');P('ERRS',errs[:3]);b.close()
