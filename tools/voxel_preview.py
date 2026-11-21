"""Fast pictures of the block buildings with the game's own material and daylight, without booting the game (a few seconds for a sheet).

usage: python3 tools/voxel_preview.py out.png SHOT [SHOT...]
SHOT = names/tier/yaw/pitch/dist[/cols[/key=val...]]
  names: comma separated building types, "house:2@1!0" = look 2, turned a quarter, tier 0; or fort, trees, swatch
  keys: ly (height the camera looks at), cx, cz (its target), cw (grid step when several names), fov
env: W, H (size of one shot, 960 x 640), COLS (shots per row of the sheet, 2), SWATCH (block names for "swatch"), INFO=1 (sizes and triangles)
example: python3 tools/voxel_preview.py dist/p.png house:1/1/0.6/0.5/34//ly=6 house:1/0/-2.3/0.6/34//ly=5
The real picture (ink outlines, grade, terrain) is still the game's: check there before calling a look done."""
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FLAGS = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--allow-file-access-from-files']


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    out, shots = sys.argv[1], sys.argv[2:]
    W, H, COLS = int(os.environ.get('W', 960)), int(os.environ.get('H', 640)), int(os.environ.get('COLS', 2))
    bundle = ROOT / 'dist' / 'voxel_preview.js'
    bundle.parent.mkdir(exist_ok=True)
    r = subprocess.run(['node', 'tools/voxel_preview_build.mjs', str(bundle)], cwd=ROOT, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-3000:])
        return 1
    html = ROOT / 'dist' / 'voxel_preview.html'
    html.write_text('<!doctype html><html><body><script src="file://%s/node_modules/three/build/three.min.js"></script><script src="file://%s"></script></body></html>' % (ROOT, bundle))
    ims = []
    with sync_playwright() as p:
        with p.chromium.launch(args=FLAGS) as b:
            pg = b.new_page(viewport={'width': W, 'height': H})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
            pg.on('console', lambda m: errs.append(m.text[:400]) if m.type == 'error' else None)
            pg.goto('file://' + str(html))
            pg.wait_for_timeout(300)
            if pg.evaluate('()=>typeof window.__go') != 'function':
                print('LOADERR', errs[:6])
                return 1
            if os.environ.get('SWATCH'):
                pg.evaluate('(s)=>{window.__swatch=s}', os.environ['SWATCH'])
            for k, sh in enumerate(shots):
                a = sh.split('/')
                names = a[0].split(',')
                tier = int(a[1]) if len(a) > 1 and a[1] else 1
                yaw = float(a[2]) if len(a) > 2 and a[2] else 0.6
                pitch = float(a[3]) if len(a) > 3 and a[3] else 0.6
                dist = float(a[4]) if len(a) > 4 and a[4] else 40
                cols = int(a[5]) if len(a) > 5 and a[5] else 4
                o = {'W': W, 'H': H}
                for kv in a[6:]:
                    kk, vv = kv.split('=')
                    o[kk] = float(vv)
                info = pg.evaluate('([n,t,y,p,d,c,o])=>window.__go(n,t,y,p,d,c,o)', [names, tier, yaw, pitch, dist, cols, o])
                if info and (os.environ.get('INFO') or 'UNKNOWN' in info):
                    print(info)
                f = '%s.%d.tmp.png' % (out, k)
                pg.screenshot(path=f)
                ims.append(Image.open(f).convert('RGB').copy())
                os.remove(f)
            if errs:
                print('ERR', errs[:4])
    cols = min(COLS, len(ims))
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * H), (20, 20, 20))
    for k, im in enumerate(ims):
        sheet.paste(im, ((k % cols) * W, (k // cols) * H))
    sheet.save(out)
    print('sheet', sheet.size, len(ims))
    return 0


if __name__ == '__main__':
    sys.exit(main())
