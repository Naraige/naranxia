#!/usr/bin/env python3
"""Does any button text spill out of its button? One headless page per language and screen size.
   python3 tools/fitcheck.py [W H]     (needs npm run build first). Prints, per language, the labels that still overflow
   at the smallest font scale, plus HTML buttons (co-op window) whose text is wider than the button."""
import sys, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1280, 720)
LANGS = json.loads(json.dumps(sys.argv[3].split(',') if len(sys.argv) > 3 else None))

def frames(pg, n=4):
    pg.evaluate("()=>new Promise(r=>{let n=%d;const f=()=>--n?requestAnimationFrame(f):r();requestAnimationFrame(f)})" % n)

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'])
    n_lang = int(sys.argv[4]) if len(sys.argv) > 4 else 8
    bad = 0
    for li in range(n_lang):
        ctx = b.new_context(viewport={'width': W, 'height': H})
        ctx.add_init_script("localStorage.setItem('dk_lang','%d');localStorage.setItem('dk_last','{\"w\":9,\"k\":120}')" % li)
        pg = ctx.new_page()
        pg.route('**/three.min.js', lambda r: r.fulfill(path=str(ROOT / 'node_modules/three/build/three.min.js'), content_type='application/javascript'))
        pg.route('**/fonts.g*', lambda r: r.abort())
        pg.goto((ROOT / 'dist/naranxia_readable.html').as_uri(), timeout=180000, wait_until='domcontentloaded')
        time.sleep(10)
        pg.evaluate("()=>{renderer.render=function(){}}")
        name = pg.evaluate("()=>document.title")
        time.sleep(6)  # title fade-in
        def shot(label, js):
            pg.evaluate(js); frames(pg)
        shot('title', "()=>{}")
        shot('records', "()=>{titleDebug.rec(true)}"); shot('', "()=>{titleDebug.rec(false);titleDebug.notes(true)}"); shot('', "()=>{titleDebug.notes(false)}")
        shot('lang', "()=>{languageState.langOpen=true}"); shot('', "()=>{languageState.langOpen=false}")
        for t in range(4):
            shot('settings%d' % t, "()=>{settingsState.settingsOpen=true;settingsDebug.tab(%d)}" % t)
        shot('', "()=>{settingsState.settingsOpen=false;settingsDebug.tab(0)}")
        # in game: hud, build menu, pause menu, troop panel (F2), test mode (F10)
        pg.evaluate("()=>{rollWorld();reset();startGame()}"); time.sleep(3); frames(pg, 6)
        for k in ['Escape', 'Escape', 'F2', 'F2', 'F10', 'F10', 'm', 'm']:
            pg.keyboard.press(k); time.sleep(.3); frames(pg, 3)
        ovf = pg.evaluate("()=>[...new Set(window.__ovf||[])]")
        # HTML (co-op window): any button whose text is wider than itself
        html = pg.evaluate("""()=>{const o=[];const m=document.getElementById('mp');m.style.display='flex';
          for(const id of ['mpHome','mpHostP','mpJoinP','mpPubP']){for(const x of ['mpHome','mpHostP','mpJoinP','mpPubP','mpLobby'])document.getElementById(x).style.display=x===id?'block':'none';
           for(const bt of m.querySelectorAll('button'))if(bt.offsetParent&&(bt.scrollWidth>bt.clientWidth+1||bt.scrollHeight>bt.clientHeight+1))o.push(bt.textContent.trim().slice(0,40))}return [...new Set(o)]}""")
        print('%-12s canvas overflow: %s | html overflow: %s' % (pg.evaluate("()=>LANGS?LANGS:0") if False else li, ovf, html), flush=True)
        bad += len(ovf) + len(html)
        ctx.close()
    b.close()
    print('TOTAL', bad)
    sys.exit(1 if bad else 0)
