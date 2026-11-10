# boot timeline of a built game: long tasks, frame gaps, when each intro card shows, when the splash leaves
# BP_STUB=1 makes renderer.render a no-op (checks the card sequence quickly; packed build only); BP_RM=1 emulates prefers-reduced-motion
# BP_VIEW=480x270 shrinks the page (software WebGL is slow in headless runs); BP_DIST=dir reads another dist folder
# usage: python3 tools/bootprobe.py [html in dist/, default naranxia.html] [outdir for 0.5 s screenshots|-] [seconds] [cpu throttle] [prefs like qi=1,seen=1] [iframe]
import sys,os,json,time,threading,http.server,functools
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from playwright.sync_api import sync_playwright
A=sys.argv
html=A[1] if len(A)>1 else 'naranxia.html'
out=Path(A[2]) if len(A)>2 and A[2]!='-' else None
secs=float(A[3]) if len(A)>3 else 9
thr=float(A[4]) if len(A)>4 else 1
prefs=A[5] if len(A)>5 and A[5]!='-' else ''
frame=len(A)>6
INIT="""(()=>{if(document.documentElement&&location.pathname.indexOf('__frame')>=0)return;window.__nxBootReal=1;const P=window.__bp={lt:[],fr:[],ev:[],n:0};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())P.lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}
let last=0;const seen={};const mark=(k,t)=>{if(!(k in seen)){seen[k]=1;P.ev.push([k,Math.round(t)])}};
const vis=e=>{if(!e)return false;const s=getComputedStyle(e);return +s.opacity>.5&&s.display!=='none'&&s.visibility!=='hidden'};
function f(t){const b=document.getElementById('boot');if(last&&t-last>50)P.fr.push([Math.round(last),Math.round(t-last)]);last=t;P.n++;
 if(b){if(!b.classList.contains('skip')&&!b.classList.contains('done')){if(vis(b.querySelector('.st:not(.st2)')))mark('card1',t);if(vis(b.querySelector('.st2')))mark('card2',t)}
  if(b.classList.contains('done'))mark('splashDone',t);if(b.classList.contains('skip'))mark('skip',t)}else if(document.body)mark('splashRemoved',t);
 if(window.THREE){mark('three',t);if(window.__bpStub&&!P.stub){P.stub=1;const O=THREE.WebGLRenderer;THREE.WebGLRenderer=function(p){const r=new O(p);r.render=function(){};return r}}}if(document.body&&document.readyState!=='loading'&&!document.getElementById('nxz')&&document.getElementById('c')&&document.getElementById('c').width!==300)mark('gameRunning',t);
 requestAnimationFrame(f)}
requestAnimationFrame(f)})()"""
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
    def do_GET(self):
        if self.path.startswith('/__frame'):
            b=('<!doctype html><body style="margin:0;background:#222"><iframe src="/%s" style="border:0;width:100vw;height:100vh" allow="autoplay"></iframe>'%html).encode()
            self.send_response(200);self.send_header('Content-Type','text/html');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
        else: super().do_GET()
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=os.environ.get('BP_DIST',str(ROOT/'dist'))));port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    VW,VH=[int(x) for x in os.environ.get('BP_VIEW','1280x720').split('x')];cx=b.new_context(viewport={'width':VW,'height':VH});pg=cx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    cx.route('**/three.min.js',lambda r:r.fulfill(path=str(ROOT/'node_modules/three/build/three.min.js'),content_type='application/javascript'))
    sys.path.insert(0,str(ROOT/'tools'))
    import fontroute;fontroute.setup(cx)
    if prefs: cx.add_init_script("try{%s}catch(e){}"%''.join("localStorage.setItem('dk_%s','%s');"%tuple(kv.split('=')) for kv in prefs.split(',')))
    if os.environ.get('BP_STUB'): cx.add_init_script('window.__bpStub=1')
    if os.environ.get('BP_RM'): pg.emulate_media(reduced_motion='reduce')
    cx.add_init_script(INIT)
    if thr>1:
        s=cx.new_cdp_session(pg);s.send('Emulation.setCPUThrottlingRate',{'rate':thr})
    t0=time.time();pg.goto('http://127.0.0.1:%d/%s'%(port,'__frame' if frame else html),wait_until='commit',timeout=180000)
    # with an output folder: a screencast (what the compositor really presented) with one saved image per half second
    casts=[];saved={}
    if out:
        import base64
        out.mkdir(parents=True,exist_ok=True);sc=cx.new_cdp_session(pg)
        def onf(e):
            ts=e['metadata']['timestamp']-t0;casts.append(ts);k=int(ts*2)
            if k not in saved: saved[k]=round(ts,2);(out/('f%02d.jpg'%k)).write_bytes(base64.b64decode(e['data']))
            try: sc.send('Page.screencastFrameAck',{'sessionId':e['sessionId']})
            except Exception: pass
        sc.on('Page.screencastFrame',onf);sc.send('Page.startScreencast',{'format':'jpeg','quality':70,'everyNthFrame':1})
    while time.time()-t0<secs: pg.wait_for_timeout(250)
    if out:
        try: sc.send('Page.stopScreencast')
        except Exception: pass
    fr=pg.frames[-1] if frame else pg.main_frame
    r=fr.evaluate("()=>({lt:__bp.lt,fr:__bp.fr,ev:__bp.ev,n:__bp.n,now:Math.round(performance.now()),fcp:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime|0,boot:window.__nxBoot||null,intro:window.__nxIntro?Math.round(__nxIntro.t0):null})")
    lt=r['lt'];print('html',html,'throttle',thr,'prefs',prefs,'iframe',frame)
    print('FCP ms',r['fcp'],'| events',r['ev'])
    print('long tasks [start,dur] ms',sorted(lt,key=lambda x:-x[1])[:8],'| longest',max([x[1] for x in lt] or [0]),'| total',sum(x[1] for x in lt))
    print('frame gaps >50ms [start,gap]',sorted(r['fr'],key=lambda x:-x[1])[:8],'| frames',r['n'],'in',r['now'],'ms')
    print('intro t0',r['intro'],'| boot',json.dumps(r['boot']))
    if out:
        nb=int(secs*2);cnt=[sum(1 for c in casts if int(c*2)==k) for k in range(nb)]
        print('presented frames per 0.5 s',cnt,'| saved',sorted(saved.items()))
    print('ERRS',errs[:4]);b.close()
