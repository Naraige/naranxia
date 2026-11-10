import json,base64,sys,os
from pathlib import Path
from playwright.sync_api import sync_playwright
# usage: python3 docs/studio-boards/units/_src/render.py outdir modes(AB) [N] [units,comma|-] [back]   (after npm run build)
# A = current look, B = new look (window.__UV2='all'); writes <unit>_<mode>_f.png (3/4 front), _b.png (3/4 back), tri_<modes>.json (triangles, meshes)
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
UNITS=json.load(open(HERE/'units.json'))
outdir=sys.argv[1];modes=list(sys.argv[2]);N=int(sys.argv[3]) if len(sys.argv)>3 else 480
sel=sys.argv[4].split(',') if len(sys.argv)>4 and sys.argv[4]!='-' else None;back=len(sys.argv)>5
os.makedirs(outdir,exist_ok=True)
cfg={'N':N,'modes':modes,'units':[u for u in UNITS if not sel or u[0] in sel],'back':back}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':600,'height':400});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e.stack)[:400]))
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto((ROOT/'dist/naranxia_readable.html').resolve().as_uri(),timeout=900000);pg.wait_for_timeout(2500)
    pg.evaluate('window.__CFG='+json.dumps(cfg))
    d=json.loads(pg.evaluate((HERE/'shots.js').read_text()))
    for k,v in d.items():
        if k=='tri':open(os.path.join(outdir,'tri_'+''.join(modes)+'.json'),'w').write(v);print(v)
        elif k.startswith('ERR'):print(k,v)
        else:open(os.path.join(outdir,k+'.png'),'wb').write(base64.b64decode(v.split(',')[1]))
    print(len(d),'ERRS',errs[:3]);b.close()
