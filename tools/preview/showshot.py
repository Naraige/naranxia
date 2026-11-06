import json,base64,sys,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
from playwright.sync_api import sync_playwright
# usage: python3 tools/preview/showshot.py naranxia_readable.html "window.__U='knight,guard';window.__B='-';window.__TL='sword,sh_knight'" outdir
# optional 4th arg: tools/preview/j_show2.js, whose __U entries are type~variant~hint~yaw (zombie~3, zombie~1~knight, king~~~3.6)
# window.__U units (name@yaw), __B buildings ('-' none), __TL tools/shields (key@yaw@AL@pitch@v), __N size, __SH shadows, __GR grade, __BG background
html=sys.argv[1];pre=sys.argv[2];outdir=sys.argv[3]
os.makedirs(outdir,exist_ok=True)
html_path=Path(html)
if not html_path.is_absolute():html_path=ROOT/'dist'/html_path
show_script=Path(sys.argv[4]) if len(sys.argv)>4 else ROOT/'tools/preview/j_show.js'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':600,'height':400});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e.stack)[:400]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto(html_path.resolve().as_uri());pg.wait_for_timeout(2500)
    pg.evaluate(pre)
    d=json.loads(pg.evaluate(show_script.read_text(encoding='utf-8')))
    for k,v in d.items(): open(os.path.join(outdir,k+'.jpg'),'wb').write(base64.b64decode(v.split(',')[1]))
    print(len(d),'ERRS',errs[:3]);b.close()
