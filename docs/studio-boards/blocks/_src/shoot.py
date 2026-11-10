import sys,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
# usage: shoot.py <html in dist> <outdir> <shots.json> [W H]
# shots: [{name, blocks:0|1|blk, cam:{x,z,dist,pitch,yaw} (x,z relative to the town centre), night, season}]
S=Path(__file__).resolve().parent
ROOT=Path.cwd()
html=ROOT/'dist'/sys.argv[1];out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);shots=json.loads(Path(sys.argv[3]).read_text())
W=int(sys.argv[4]) if len(sys.argv)>4 else 800;H=int(sys.argv[5]) if len(sys.argv)>5 else 500
JS="""async(sh)=>{const[cx,cy]=window.__C,c=sh.cam||{},HB=typeof setBlocks!=='undefined';
 if(HB){const on=!!sh.blocks,bk=sh.blocks>1?1/sh.blocks:.5;if(sh.opts)setBlocks(true,sh.opts);else if(blocksState.on!==on||(on&&(Math.abs(blocksState.BLK-bk)>1e-6||Math.abs(blocksState.DBLK-bk)>1e-6)))setBlocks(on,bk)}
 const fo=sh.at&&window.__F[sh.at]||[0,0];CAM.x=cx+fo[0]+(c.x||0);CAM.z=cy+fo[1]+(c.z||0);CAM.dist=c.dist||30;CAM.pitch=c.pitch||.86;CAM.yaw=c.yaw||0;
 renderer.render=function(){};hordeOn=!!sh.night;nightLv=sh.night?1:0;
 const se=sh.season||0,ss=()=>{for(let i=0;i<4;i++){WX.s[i]=i===se?1:0;}if(HB)setSeasons(WX.s)};
 for(let i=0;i<(sh.night||sh.pre?16:5);i++){ss();render3D(.5);if(HB)blkChunks.updateChunks(1e9)}
 renderer.render=window.__RR;renderer.info.autoReset=false;ss();render3D(.016);ss();renderer.info.reset();const t0=performance.now();render3D(.016);
 const gl=renderer.getContext(),px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
 return JSON.stringify({calls:renderer.info.render.calls,tris:renderer.info.render.triangles,ms:Math.round(performance.now()-t0)})}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':W,'height':H});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.on('console',lambda m:print('LOG',m.text[:400],flush=True) if m.type in('error','warning') and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
    pg.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.add_init_script("try{localStorage.setItem('dk_tut','1')}catch(e){}")
    pg.goto(html.resolve().as_uri(),timeout=600000);pg.wait_for_timeout(3000)
    t0=time.time();print(pg.evaluate((S/'setup.js').read_text()),round(time.time()-t0),flush=True)
    for sh in shots:
        t0=time.time()
        r=pg.evaluate(JS,sh)
        pg.wait_for_timeout(200);pg.screenshot(path=str(out/(sh['name']+'.jpg')),timeout=600000,type='jpeg',quality=88)
        print(sh['name'],r,round(time.time()-t0),flush=True)
    if len(sys.argv)>6:print('MEASURE',pg.evaluate((S/sys.argv[6]).read_text()),flush=True)
    print('ERRS',errs[:4]);b.close()
