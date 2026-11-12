#!/usr/bin/env python3
"""Takes the Discord announcement pictures (1280x720, < 1.5 MB), offline fonts via tools/fontroute.py.
usage: python3 tools/announce_shots.py [01 02 03 04]     (needs dist/naranxia_readable.html; one shot after the other, never in parallel)
The pictures go to dist/announce-shots/ (SHOT_OUT=dir for another place): look at them, then copy the good ones to announce/img/vNN/
with the batch that ships them. Nothing is written under announce/ by this tool.
One script per picture in tools/shots/NN-name.js (shared start: tools/shots/_prelude.js, seed per picture below). Each script builds the scene
(same style as tests/*.js), then renders a frame; Playwright takes the screenshot. SHOT_TIMEOUT = screenshot timeout in s (slow machine)."""
import os, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
SHOTS=ROOT/'tools'/'shots'; OUT=Path(os.environ.get('SHOT_OUT') or ROOT/'dist'/'announce-shots'); OUT.mkdir(parents=True,exist_ok=True)
SEEDS={'01':7,'02':11,'03':7,'04':7}
TMO=int(os.environ.get('SHOT_TIMEOUT','600'))*1000
def optimise(p):
    from PIL import Image
    im=Image.open(p).convert('RGB')
    if im.size!=(1280,720): im=im.resize((1280,720))
    im.save(p,optimize=True)
    if p.stat().st_size>1_400_000:
        im.quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.FLOYDSTEINBERG).save(p,optimize=True)
def main():
    from playwright.sync_api import sync_playwright
    import fontroute
    want=sys.argv[1:] or sorted(SEEDS)
    pre=(SHOTS/'_prelude.js').read_text(encoding='utf-8')
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
        for js in sorted(SHOTS.glob('[0-9][0-9]-*.js')):
            n=js.name[:2]
            if n not in want: continue
            src=js.read_text(encoding='utf-8').replace('//@PRELUDE',pre.replace('SEED_',str(SEEDS[n])))
            pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
            pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
            fontroute.setup(pg)
            pg.goto((ROOT/'dist'/'naranxia_readable.html').resolve().as_uri(),timeout=TMO); pg.wait_for_timeout(3500)
            try: print(n,pg.evaluate(src),flush=True)
            except Exception as e: print(n,'EXC',str(e)[:500]); pg.close(); continue
            pg.wait_for_timeout(2500)
            out=OUT/(js.stem+'.png'); pg.screenshot(path=str(out),timeout=TMO); optimise(out)
            print(' ',out.name,out.stat().st_size//1024,'KB','errors:',errs[:2],flush=True); pg.close()
        b.close()
main()
