"""Reproducible production CPU, rendered frame, heap and startup measurements.

PERFORMANCE_MAX_SIM_MS optionally supplies a calibrated machine-specific budget.
Run alone (J=1), on the same browser/driver/power profile when comparing reports.
"""
import json
import ast
import os
import platform
import re
import statistics
import sys
import time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
from browser_fixture import FLAGS,emit,finish_boot,load_page,result
from playwright.sync_api import sync_playwright

started=time.perf_counter()
source=(ROOT/'tests/det.js').read_text(encoding='utf-8')
# The pinned string array is a JS literal with Prettier's trailing comma.
# literal_eval accepts that data syntax without executing source code.
expected=ast.literal_eval(re.search(r'const expected = (\[[\s\S]*?\]);',source).group(1))
assertions=[]
def check(name,actual,expected):
    assertions.append({'name':name,'passed':actual==expected,'actual':actual,'expected':expected})
with sync_playwright() as p:
    t=time.perf_counter()
    with p.chromium.launch(args=FLAGS) as browser:
        launch=(time.perf_counter()-t)*1000
        page,errors,phases=load_page(browser)
        t=time.perf_counter()
        check('production startup reveals the canvas',finish_boot(page),True)
        phases['visibleBoot']=(time.perf_counter()-t)*1000
        page.evaluate('()=>{window.__NX_PROFILE_DET__=true}')
        # One warmup plus three measured runs, all with pinned production hashes.
        samples=[]
        for i in range(4):
            value=json.loads(page.evaluate(source))
            check('6000-tick fingerprint sample '+str(i),value['h'],expected)
            if i:samples.append(value['ms'])
        frames=page.evaluate('''()=>{
            Math.random=rngf(123);rollWorld();randomSite();pickPos={...pickPos,ok:true};confirmPick();paused=true;
            render3D(0);renderer.getContext().finish();
            const times=[];for(let k=0;k<3;k++){const start=performance.now();render3D(0);renderer.getContext().finish();times.push(performance.now()-start)}
            const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
            return {ms:times,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
        }''')
        cdp=page.context.new_cdp_session(page)
        heap=cdp.send('Runtime.getHeapUsage')
        check('no browser exceptions',errors,[])
        check('finite positive simulation samples',all(x>0 for x in samples),True)
        check('three rendered frames completed',len(frames['ms']),3)
        median=statistics.median(samples)
        budget=os.environ.get('PERFORMANCE_MAX_SIM_MS')
        if budget:check('simulation median within calibrated budget',median<=float(budget),True)
        metrics={'simulationMs':samples,'simulationMedianMs':median,'frameMs':frames['ms'],'frameMedianMs':statistics.median(frames['ms']),'heap':heap,'renderer':frames['renderer'],'browser':browser.version,'platform':platform.platform(),'processor':platform.processor(),'launchMs':launch,'loadMs':phases['load'],'visibleStartupMs':phases['load']+phases['visibleBoot']}
        record=result('performance','Production startup, 6000-tick CPU, synchronized GPU frames and JS heap',assertions,started,phases,metrics)
        if budget and median>float(budget):record['category']='performance_regression'
        emit(record)
        page.context.close()
sys.exit(0 if record['status']=='passed' else 1)
