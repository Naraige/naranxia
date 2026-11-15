import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
from playwright.sync_api import sync_playwright

# Usage (from anywhere): python tools/run.py tests/x.js [out.png|-] [W H wait] [html in dist/, default naranxia_readable.html]
# The script is the source of a JS function evaluated in the page once the game has loaded; it may return a string.
script_path = Path(sys.argv[1])
if not script_path.is_absolute() and not script_path.is_file():
    script_path = ROOT / script_path
js = script_path.read_text(encoding='utf-8')
out = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != '-' else None
width = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
height = int(sys.argv[4]) if len(sys.argv) > 4 else 620
wait = int(sys.argv[5]) if len(sys.argv) > 5 else 3000
html = sys.argv[6] if len(sys.argv) > 6 else 'naranxia_readable.html'
errors = []
eval_failed = False

sys.path.insert(0, str(ROOT / 'tools'))

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'])
    try:
        page = browser.new_page(viewport={'width': width, 'height': height})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)[:300] + ' ' + (error.stack or '')[:400]))
        page.on(
            'console',
            lambda message: print('LOG', message.text[:400], flush=True)
            if message.type in ('error', 'log') and 'Failed to load' not in message.text and 'ERR_' not in message.text
            else None,
        )
        page.route(
            '**/three.min.js',
            lambda route: route.fulfill(
                path=str(ROOT / 'node_modules/three/build/three.min.js'),
                content_type='application/javascript',
            ),
        )
        import fontroute

        fontroute.setup(page)
        page.goto((ROOT / 'dist' / html).resolve().as_uri(), timeout=900000)
        page.wait_for_timeout(3500)
        try:
            result = page.evaluate(js)
            if result is not None:
                print(result, flush=True)
        except Exception as error:
            print('EXC', str(error)[:600], flush=True)
            eval_failed = True
        if out:
            page.wait_for_timeout(wait)
            page.screenshot(path=str(out.resolve()), timeout=120000)
    finally:
        browser.close()

print('ERRS', errors[:4], flush=True)
if eval_failed or errors:
    sys.exit(1)
