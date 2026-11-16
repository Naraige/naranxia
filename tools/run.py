import sys
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_suite import run
ROOT=Path(__file__).resolve().parents[1]
# Compatible positional preview CLI. Test snippets additionally require named assertions.
source=Path(sys.argv[1])
if not source.is_absolute() and not source.is_file(): source=ROOT/source
out=sys.argv[2] if len(sys.argv)>2 and sys.argv[2]!='-' else None
width=int(sys.argv[3]) if len(sys.argv)>3 else 1000
height=int(sys.argv[4]) if len(sys.argv)>4 else 620
wait=int(sys.argv[5]) if len(sys.argv)>5 else 3000
html=sys.argv[6] if len(sys.argv)>6 else 'naranxia_readable.html'
manual=json.loads((ROOT/'tests/manual_diagnostics.json').read_text(encoding='utf-8'))
is_test=source.resolve().parent==ROOT/'tests' and source.name not in manual
from browser_fixture import FLAGS
with sync_playwright() as p:
    with p.chromium.launch(args=FLAGS) as browser:
        ok=run(browser,str(source.resolve()),html,width,height,screenshot=out,diagnostic=not is_test,screenshot_wait_ms=wait if out else 0)
sys.exit(0 if ok else 1)
