#!/usr/bin/env python3
"""Studio intro card and favicon, without loading the game: the #boot markup of packages/game/index.html + styles/boot.css in a bare page.
   python3 docs/studio-boards/revamp/cap_boot.py PREFIX  -> PREFIX_boot.png (1280x720, 1.6 s into the card), PREFIX_favicon.png (16 px icon x12)"""
import sys,re,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent;ROOT=D.parents[2];G=ROOT/'packages/game'
PRE=sys.argv[1]
html=(G/'index.html').read_text(encoding='utf-8');css=(G/'src/styles/boot.css').read_text(encoding='utf-8')
# the whole #boot line of index.html (the markup sits on one line, before the launch script); the cards only show with the class `go`
boot=re.search(r'<div id="boot"[^\n]*',html).group(0).replace('<div id="boot"','<div id="boot" class="go"',1)
fav=re.search(r'<link rel="icon" href="([^"]+)"',html)
sys.path.insert(0,str(ROOT/'tools'))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':720})
    try:
        import fontroute;fontroute.setup(pg)
    except Exception:pass
    pg.route('https://fonts.googleapis.com/**',lambda r:r.abort())
    pg.set_content('<!doctype html><html><head><style>body{margin:0;background:#000}%s</style></head><body>%s</body></html>'%(css,boot))
    pg.wait_for_timeout(1600);pg.screenshot(path=str(D/(PRE+'_boot.png')))
    if fav:
        pg.set_content('<body style="margin:0;background:#222"><img src="%s" style="width:192px;height:192px;image-rendering:pixelated;margin:24px"></body>'%fav.group(1))
        pg.set_viewport_size({'width':240,'height':240});pg.wait_for_timeout(300);pg.screenshot(path=str(D/(PRE+'_favicon.png')))
    b.close()
print('ok')
