import json,base64,sys,os
from pathlib import Path
from playwright.sync_api import sync_playwright
# usage: python3 docs/studio-boards/mutants/_src/render.py outdir modes(AB) N units|- views(fbsgwa) [rk]   (after npm run build)
# A = current look, B = monstrosities (window.__MUT2='all'); writes <unit>_<mode>_<view>.png and tri_<modes>.json ([triangles, meshes] per model)
# views: f 3/4 front, b 3/4 back, s side, g game camera on grass (walking), w walk pose, a attack pose; rk = framing radius factor (default .78)
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
UNITS=[["husk","husk",1],["runner","runner",2],["brute","brute",0],["bomber","bomber",0],["acid","acid",0],["miner","miner",0],["boss","brute",0,"boss"],
       ["husk2","husk",5],["runner2","runner",7],["brute2","brute",3],["bomber2","bomber",2],["acid2","acid",3],["miner2","miner",4],["boss2","brute",3,"boss"]]
VIEWS={'f':['f',.62,.14,0x15131a,'i'],'b':['b',3.14159+.62,.14,0x15131a,'i'],'s':['s',1.5708,.05,0x15131a,'i'],'g':['g',.5,.82,0x56763e,'w'],'w':['w',1.2,.1,0x15131a,'w'],'a':['a',1.2,.1,0x15131a,'a']}
outdir=sys.argv[1];modes=list(sys.argv[2]);N=int(sys.argv[3]);sel=sys.argv[4].split(',') if sys.argv[4]!='-' else None;views=[VIEWS[c] for c in sys.argv[5]]
os.makedirs(outdir,exist_ok=True)
cfg={'N':N,'modes':modes,'units':[u for u in UNITS if (u[0] in sel if sel else not u[0].endswith('2'))],'views':views}
if len(sys.argv)>6:cfg['rk']=float(sys.argv[6])
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
