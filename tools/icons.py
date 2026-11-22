"""The launcher pictures made from one source: apps/desktop/src/icon.png (square, 1024 px).
python3 tools/icons.py            writes apps/desktop/icon.ico (Windows installer and exe) and apps/desktop/icon.icns (Mac app)
python3 tools/icons.py --check    fails when they are not the ones this source gives (run by the desktop test)
To change the picture for every player: replace the PNG, run this, push. The installers workflow rebuilds the installers and attaches
icon.png to the latest release; launchers already installed take it at their next start (apps/desktop/src/icons.js)."""
import io
import sys
from pathlib import Path
from PIL import Image

D = Path(__file__).resolve().parents[1] / "apps" / "desktop"
SRC = D / "src" / "icon.png"
ICO = [16, 24, 32, 48, 64, 128, 256]


def build():
    im = Image.open(SRC).convert("RGBA")
    if im.width != im.height or im.width < 512:
        sys.exit(f"{SRC}: a square picture of 512 px or more is needed, got {im.width} x {im.height}")
    ico, icns = io.BytesIO(), io.BytesIO()
    im.save(ico, format="ICO", sizes=[(s, s) for s in ICO])
    im.resize((1024, 1024), Image.LANCZOS).save(icns, format="ICNS")
    return {D / "icon.ico": ico.getvalue(), D / "icon.icns": icns.getvalue()}


def pixels(data):
    return Image.open(io.BytesIO(data)).convert("RGBA").tobytes()


out = build()
if "--check" in sys.argv:
    bad = [p.name for p, b in out.items() if not p.exists() or pixels(p.read_bytes()) != pixels(b)]
    if bad:
        sys.exit("not made from apps/desktop/src/icon.png: " + ", ".join(bad) + " (run python3 tools/icons.py)")
    print("icons match", SRC.name)
else:
    for p, b in out.items():
        p.write_bytes(b)
        print("wrote", p.relative_to(D.parents[1]), len(b))
