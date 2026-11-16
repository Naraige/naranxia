"""Trap placement/preview rules plus trusted browser demolition input."""
import json
import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_fixture import FLAGS,ROOT,emit,finish_boot,load_page,result

started=time.perf_counter()
html=sys.argv[1] if len(sys.argv)>1 else 'naranxia_readable.html'
assertions=[];phases={};error=None;configuration={'html':html,'viewport':[1280,720]}
with sync_playwright() as p:
    with p.chromium.launch(args=FLAGS) as browser:
        page=None
        try:
            page,errors,phases=load_page(browser,html,1280,720)
            value=json.loads(page.evaluate(Path(__file__).with_suffix('.js').read_text(encoding='utf-8')))
            page.evaluate("ok=>__test.check('production startup reveals the canvas',ok)",finish_boot(page))
            tile=value['tile']
            page.evaluate('''([x,y])=>{
                paused=false;build('spike',x,y);mode='demolish';render3D(0);
                __test.check('click scenario starts with a trap',SPK.has(y*TW+x));
            }''',tile)
            # Trusted pointer events exercise pointer capture and the real input handler.
            page.mouse.click(640,720*.53)
            page.evaluate('''([x,y])=>{
                __test.check('mouse demolition removes the hovered trap',SPK.has(y*TW+x),false);
                __test.check('mouse action leaves terrain passable',valid(x,y));
            }''',tile)
            assertions=page.evaluate('()=>__test.assertions')
            configuration.update(page.evaluate('()=>({seed:SEED,tick:MP.tick,epoch:MP.ep})'))
            if errors:raise RuntimeError(repr(errors))
        except Exception as exc:
            error=exc
            if page:
                assertions=page.evaluate('()=>window.__test?.assertions||[]')
                output=Path(os.environ.get('TEST_ARTIFACT_DIR',ROOT/'dist/test-logs'))/'trap-controls-input-failure.png'
                output.parent.mkdir(parents=True,exist_ok=True)
                page.screenshot(path=str(output),timeout=10000)
        finally:
            if page:page.context.close()
record=result('trap_controls','Trap previews, payment, duplicate rejection, demolition and trusted mouse input',assertions,started,phases,configuration,error)
emit(record)
sys.exit(0 if record['status']=='passed' else 1)
