#!/usr/bin/env python3
"""Open a bug report made in the game (F8, file naranxia-bug-*.json).

usage: python3 tools/repro.py REPORT.json [seconds=10] [after.png] [check.js]
 - prints what the report holds (version, mode, wave, errors, last messages, co-op hash checks)
 - writes the player's screenshot next to the report (REPORT_shot.jpg)
 - loads the saved game in the headless build (dist/naranxia_readable.html, run tools/build.sh first),
   lets it run for the given seconds (loading takes a few minutes headless), prints the state and new errors; after.png = screenshot at the end;
   check.js = source of a JS function evaluated in the page once the game is loaded (like tools/run.py).
For an exact replay use the build of the report's version: git worktree add ../nx-vNN vNN, build there."""
import json,sys,os,base64
from pathlib import Path
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(ROOT,'tools'))
rp=Path(sys.argv[1]);sec=float(sys.argv[2]) if len(sys.argv)>2 else 10;png=Path(sys.argv[3]) if len(sys.argv)>3 and sys.argv[3]!='-' else None
chk=Path(sys.argv[4]).read_text(encoding='utf-8') if len(sys.argv)>4 else None
R=json.loads(rp.read_text(encoding='utf-8'))
def P(*a):print(*a,flush=True)
P('report',R.get('ver'),R.get('date'),R.get('mode'),'test mode' if R.get('test') else '','|',R.get('lang'),'|',R.get('desktop') and 'desktop app' or 'browser','|',R.get('gpu',''))
P('game: seed',R.get('seed'),'wave',R.get('wave'),'time',R.get('time'),'units',R.get('units'),'buildings',R.get('structs'),'swarm',R.get('swarm'),'speed',R.get('speed'),'over' if R.get('over') else '')
for e in R.get('errors') or []:P('error t=%ss'%e.get('t'),e.get('m'),e.get('at',''),(e.get('s') or '').split('\n')[1:3])
P('last messages:',' | '.join((R.get('messages') or [])[-8:]))
c=R.get('coop')
if c:
    bad=[h for h in c.get('hashes',[]) if h[1]!=h[2]]
    P('co-op: tick',c.get('tick'),'epoch',c.get('ep'),'desyncs',c.get('desyncs'),'partner',c.get('partner'),c.get('partnerVer'),'| hash checks',len(c.get('hashes',[])),'mismatches',bad[:5])
    if c.get('me'):
        P('this machine:',c.get('me'),'| window',c.get('win'),'| castles',c.get('castles'),'site2',c.get('site2'),'cx',c.get('cx'))
        P('last building commands (tk tick, mine = sent by this machine, t type, x y tile of the command, pl sender index, ex index expected, cur player it ran for, mt tile under the sender mouse, s = [sid, tx, ty, owner] or None, bad = sender index differs from expected):')
        for e in c.get('plog') or []:P('  ',json.dumps(e,separators=(',',':')))
if R.get('shot'):
    out=rp.with_name(rp.stem+'_shot.jpg');out.write_bytes(base64.b64decode(R['shot'].split(',',1)[1]));P('player screenshot:',out)
S=R.get('save')
if not S or 'error' in S:P('no saved game in the report',S and S.get('error') or '');sys.exit(0)
from playwright.sync_api import sync_playwright
import fontroute
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    sc=R.get('screen') or [1280,720,1];pg=b.new_page(viewport={'width':min(1600,int(sc[0])),'height':min(1000,int(sc[1]))});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    fontroute.setup(pg);pg.route('**/three.min.js',lambda r:r.fulfill(path=os.path.join(ROOT,'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    pg.goto((Path(ROOT)/'dist'/'naranxia_readable.html').as_uri(),timeout=180000);pg.wait_for_timeout(3000)
    P('build',pg.evaluate('()=>GVER'),'(report',R.get('ver')+')')
    if not png:pg.evaluate("()=>{renderer.render=function(){}}")   # no picture wanted: skip the GPU work (much faster headless)
    import time as _t;t0=_t.time()
    pg.evaluate("""async(a)=>{await svApply(a.s);const c=a.c;if(c){CAM.x=c.x;CAM.z=c.z;CAM.dist=c.dist;CAM.yaw=c.yaw;CAM.pitch=c.pitch}spd=1;paused=false}""",{'s':json.dumps(S),'c':R.get('cam')})
    ST="()=>JSON.stringify({wave:waveN,time:+time.toFixed(1),over,units:units.length,ours:units.filter(u=>u.t===0&&u.hp>0).length,zombies:units.filter(u=>u.t===1&&u.hp>0).length+SW.n,buildings:structs.length,res:RESP.map(R=>[R.g|0,R.w|0,R.s|0,R.f|0]),errors:ERRLOG.length})"
    P('loaded in %ds'%(_t.time()-t0),pg.evaluate(ST))
    if chk:P('check',pg.evaluate(chk))
    pg.wait_for_timeout(int(sec*1000));P('after %gs'%sec,pg.evaluate(ST))
    for e in pg.evaluate('()=>ERRLOG.slice(-5)'):P('new error',e.get('m'),(e.get('s') or '').split('\n')[1:3])
    if png:pg.screenshot(path=str(png.resolve()));P('screenshot',png)
    P('ERRS',errs[:4]);b.close()
