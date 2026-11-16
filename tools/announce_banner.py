#!/usr/bin/env python3
"""Update banner for the Discord announcements (1280x320 PNG, < 1 MB), offline fonts via tools/fontroute.py.
usage: python3 tools/announce_banner.py [vNN] ["tagline"] [background.png]
vNN defaults to the version in game/VERSION; background defaults to the newest picture in announce/img (a game screenshot, darkened).
Written to dist/announce-shots/banner-vNN.png (SHOT_OUT=dir for another place). Nothing is written under announce/: look at it,
then copy it to announce/img/vNN/ with the batch that ships it. Discord text stays English."""
import os, sys, base64
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
OUT = Path(os.environ.get('SHOT_OUT') or ROOT / 'dist' / 'announce-shots'); OUT.mkdir(parents=True, exist_ok=True)

def newest_bg():
    pics = sorted((ROOT / 'announce' / 'img').glob('v*/*.png'), key=lambda p: (int(p.parent.name[1:]), p.name))
    return pics[-1] if pics else None

def main():
    ver = sys.argv[1] if len(sys.argv) > 1 else (ROOT / 'game' / 'VERSION').read_text().strip()
    ver = ver if ver.startswith('v') else 'v' + ver
    tag = sys.argv[2] if len(sys.argv) > 2 else 'New update - patch notes below'
    bg = Path(sys.argv[3]) if len(sys.argv) > 3 else newest_bg()
    bgdiv = ''
    if bg and bg.is_file():
        bgdiv = ("<div style=\"position:absolute;inset:-20px;background:url(data:image/png;base64," + base64.b64encode(bg.read_bytes()).decode()
                 + ") center 40%/cover;filter:blur(7px) saturate(1.1)\"></div><div style=\"position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,20,.9) 0%,rgba(8,10,20,.72) 60%,rgba(8,10,20,.5) 100%)\"></div>")
    html = """<html><body style="margin:0"><div style="width:1280px;height:320px;position:relative;overflow:hidden;background:#0b0e1a;font-family:'Cinzel',serif;color:#f1e6c6">
%s<div style="position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,#8a6a22,#f0cf6a,#8a6a22)"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,#8a6a22,#f0cf6a,#8a6a22)"></div>
<div style="position:absolute;left:72px;top:58px;font-size:25px;letter-spacing:.5em;color:#d9b95a;font-weight:600">HAMMERDAWN STUDIO</div>
<div style="position:absolute;left:68px;top:96px;font-size:118px;font-weight:700;letter-spacing:.06em;color:#f6dc86;text-shadow:0 4px 0 #6b4d12,0 10px 28px rgba(0,0,0,.7)">NARANXIA</div>
<div style="position:absolute;left:72px;top:238px;font-family:'Marcellus',serif;font-size:30px;letter-spacing:.12em;color:#e9e0c8">%s</div>
<div style="position:absolute;right:64px;top:84px;padding:14px 34px 10px;border:4px solid #f0cf6a;border-radius:14px;background:rgba(10,12,24,.78);font-size:30px;letter-spacing:.3em;color:#d9b95a;text-align:center">UPDATE<div style="font-size:92px;letter-spacing:.04em;color:#f6dc86;line-height:1.05;margin-top:2px">%s</div></div>
</div></body></html>""" % (bgdiv, tag, ver)
    from playwright.sync_api import sync_playwright
    import fontroute
    out = OUT / ('banner-%s.png' % ver)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 320})
        fontroute.setup(pg)
        pg.set_content(html); pg.wait_for_timeout(800)
        pg.screenshot(path=str(out)); b.close()
    from PIL import Image
    im = Image.open(out).convert('RGB'); im.save(out, optimize=True)
    if out.stat().st_size > 1_000_000: im.quantize(256).save(out, optimize=True)
    print(out, out.stat().st_size)

main()
