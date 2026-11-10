import json,base64,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
# usage: python3 render.py <html in dist/> <outdir> [key,key..]  -> <outdir>/<key>.jpg, <key>_n.jpg (night), tris.json
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
html=ROOT/'dist'/sys.argv[1];out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);only=set(sys.argv[3].split(',')) if len(sys.argv)>3 else None
SPEC=json.load(open(HERE/'spec_models.json'))
if only:SPEC=[q for q in SPEC if q[0] in only]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':600,'height':400});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto(html.resolve().as_uri(),timeout=180000);pg.wait_for_timeout(3000)
    pg.evaluate('window.__SPEC='+json.dumps(SPEC))
    d=json.loads(pg.evaluate((HERE/'shot.js').read_text()))
    T=json.loads(d.pop('__T'));E=json.loads(d.pop('__E'))
    for k,v in d.items():open(out/(k+'.jpg'),'wb').write(base64.b64decode(v.split(',')[1]))
    prev={}
    if (out/'tris.json').exists():prev=json.load(open(out/'tris.json'))
    prev.update(T);json.dump(prev,open(out/'tris.json','w'),indent=0)
    print(len(d),'imgs',T,'ERR',E,errs[:3]);b.close()
