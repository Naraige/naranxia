"""The diagnostic observer must ignore view state and detect real state faults."""
import json
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_fixture import FLAGS,emit,load_page,result

started=time.perf_counter()
with sync_playwright() as p:
    with p.chromium.launch(args=FLAGS) as browser:
        page,errors,phases=load_page(browser)
        page.evaluate(Path(__file__).with_name('command_contract.js').read_text(encoding='utf-8'))
        page.evaluate(Path(__file__).with_name('mp_observer.js').read_text(encoding='utf-8'))
        page.evaluate('''()=>{
            const snapshot=()=>__captureAudit(), initial=snapshot(), unit=units[0];
            const checkChange=(name,part,apply,restore)=>{
                const before=snapshot()[part];apply();
                __test.check(name,snapshot()[part]!==before);restore();
            };
            // Tiny changes that mpHash's rounding does not see must still differ.
            const hp=unit.hp;
            checkChange('observer detects fractional health','units',()=>unit.hp-=0.000001,()=>unit.hp=hp);
            const walk=unit.walk;
            checkChange('movement state remains authoritative','units',()=>unit.walk=0.123456,()=>unit.walk=walk);
            for(const key of ['dy','ap','fa','gwr','kwr','lph','mal','mrk','mt','sr','sv','atk','hurt'])unit[key]=123.456;
            __test.check('camera-dependent animation is excluded',snapshot().units,initial.units);
            checkChange('observer detects trap map corruption','traps',()=>SPK.set(123,77),()=>SPK.delete(123));
            const done=RS2.done.iron;
            checkChange('observer detects research corruption','research',()=>RS2.done.iron=!done,()=>RS2.done.iron=done);
            const time0=time;
            checkChange('observer detects scalar time corruption','scalars',()=>time+=0.000001,()=>time=time0);
            const wanted=SAVA.ROLE[0]()[0].r;
            checkChange('observer detects role ownership state','research',()=>SAVA.ROLE[0]()[0].r++,()=>SAVA.ROLE[0]()[0].r=wanted);
            MP.simR=()=>0.25;MP.simR();const first=snapshot().rng;
            MP.simR=()=>0.75;MP.simR();const second=snapshot().rng;
            __test.check('equal RNG draw counts with different values diverge',first!==second);
            checkChange('observer detects terrain map corruption','terrain',()=>stairs.set(-1,{lo:1,hi:2}),()=>stairs.delete(-1));
            __test.check('terrain checkpoint is present every 30 ticks',Object.hasOwn(__captureAudit(false),'terrain'),MP.tick%30===0);
            const income=GST.w, beforeLocal=snapshot().progression;
            GST.w+=8;
            __test.check('local-player statistics are not shared state',snapshot().progression,beforeLocal);
            GST.w=income;
        }''')
        assertions=page.evaluate('()=>__test.assertions')
        assertions.append({'name':'no browser exceptions','passed':not errors,'expected':[],'actual':errors})
        configuration=page.evaluate('()=>({seed:SEED,tick:MP.tick,epoch:MP.ep})')
        page.context.close()
emit(result('observer','Reject authoritative state/RNG faults while ignoring audited camera-dependent animation',assertions,started,phases,configuration))
sys.exit(0 if all(a['passed'] for a in assertions) else 1)
