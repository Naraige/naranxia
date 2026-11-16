"""Production HTML fixture: no game-rule substitutions, isolated storage per scenario.

Manual frames stop incidental simulation during async save/load. Visual scenarios
still call real render3D/renderer.render explicitly; multiplayer drives the real
frame callback (and therefore the unmodified production lockstep).
"""
import json
import os
import time
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeout
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import fontroute

FLAGS = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
INIT = r"""(() => {
  let s = 0x4e415258, now = 1000, id = 0;
  Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const frames = new Map();
  window.requestAnimationFrame = f => { frames.set(++id, f); return id; };
  window.cancelAnimationFrame = i => frames.delete(i);
  window.__stepFrame = () => {
    now += 1000 / 30;
    const pending = [...frames.values()]; frames.clear();
    for (const f of pending) f(now);
  };
  window.__useFrameClock = () => { performance.now = () => now; };
})();"""


def load_page(browser, html='naranxia_readable.html', width=1000, height=620, manual=True, init_script='', device_scale_factor=1):
    started = time.perf_counter()
    context = browser.new_context(viewport={'width': width, 'height': height}, locale='en-US', timezone_id='UTC', device_scale_factor=device_scale_factor)
    if manual or init_script:
        context.add_init_script((INIT if manual else '') + '\n' + init_script)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    fontroute.setup(page)
    page.route('**/three.min.js', lambda route: route.fulfill(path=str(ROOT / 'node_modules/three/build/three.min.js'), content_type='application/javascript'))
    # Unused remote services must never turn an offline test into a network wait.
    page.route('**/peerjs**', lambda route: route.abort())
    try:
        page.goto((ROOT / 'dist' / html).resolve().as_uri(), wait_until='domcontentloaded', timeout=120000)
        page.wait_for_function("() => typeof window.svPack === 'function' && typeof window.mpMsg === 'function' && !!window.renderer", polling=100, timeout=120000)
        page.evaluate((ROOT / 'tests/assertions.js').read_text(encoding='utf-8'))
    except Exception:
        context.close()
        raise
    return page, errors, {'load': round((time.perf_counter() - started) * 1000, 3)}


def finish_boot(page):
    """Require the real boot state machine to reveal the canvas, without DOM edits."""
    # bootFrame completes after 4..12 actual frames. Separate browser turns let
    # loading tasks/presentation progress; cold SwiftShader frames can be slow.
    for _ in range(12):
        if page.evaluate("()=>!document.getElementById('boot')||'title' in (window.__nxBoot||{})"):
            break
        page.evaluate('()=>__stepFrame()')
    try:
        page.wait_for_function("()=>{const b=document.getElementById('boot');return !b||+getComputedStyle(b).opacity<=0.01}",polling=50,timeout=5000)
        return True
    except PlaywrightTimeout:
        return False


def result(identity, purpose, assertions, started, phases, metadata=None, error=None):
    purpose=json.loads(os.environ.get('TEST_PURPOSES','{}')).get(identity,purpose)
    failed = [a for a in assertions if not a['passed']]
    category = ('timeout' if isinstance(error, PlaywrightTimeout) else 'infrastructure_failure') if error else ('assertion_failure' if failed else None)
    return {'schema': 1, 'id': identity, 'purpose': purpose, 'complete': True,
            'status': 'failed' if category or not assertions else 'passed',
            'category': category, 'assertions': assertions,
            'durationMs': round((time.perf_counter() - started) * 1000, 3), 'phasesMs': phases,
            'configuration': metadata or {}, 'error': str(error) if error else None}


def emit(record):
    print('TEST_RESULT ' + json.dumps(record, separators=(',', ':')), flush=True)
