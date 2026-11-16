"""Batch production browser scenarios in one Chromium, fresh context per test."""
import argparse
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from browser_fixture import FLAGS, emit, finish_boot, load_page, result
from playwright.sync_api import sync_playwright


def run(browser, name, html='naranxia_readable.html', width=1000, height=620, screenshot=None, diagnostic=False, screenshot_wait_ms=0):
    started = time.perf_counter()
    page = None
    assertions = []
    phases = {}
    metadata = {'html': html, 'viewport': [width, height], 'manualFrames': True}
    error = None
    try:
        page, errors, phases = load_page(browser, html, width, height, manual=not diagnostic)
        if Path(name).stem in ('convoy_probe','convoy_cut_probe','waves_probe'):
            page.on('console',lambda message: print('SCENARIO_LOG',message.text,flush=True) if message.type=='log' else None)
        source = Path(name)
        if not source.is_absolute():
            source = ROOT / source
        t = time.perf_counter()
        value = page.evaluate(source.read_text(encoding='utf-8'))
        phases['scenario'] = round((time.perf_counter() - t) * 1000, 3)
        if value is not None:
            print(value, flush=True)
        if not diagnostic and Path(name).stem in ('smoke','trap_controls'):
            page.evaluate("ok=>__test.check('production startup reveals the canvas',ok)",finish_boot(page))
        if not diagnostic:
            payload = json.loads(value) if isinstance(value, str) else value
            page.evaluate("v => __test.check('scenario completed successfully', v === true)", isinstance(payload, dict) and payload.get('ok') is True)
        assertions = page.evaluate('() => __test.assertions')
        # The completion flag alone is never a meaningful assertion.
        if not diagnostic and len(assertions) < 2:
            raise ValueError(f'{name}: no behavior assertions were recorded')
        metadata.update(page.evaluate('() => ({seed:SEED,tick:MP.tick,epoch:MP.ep,simulationTime:time})'))
        if errors:
            raise RuntimeError('page errors: ' + json.dumps(errors))
        if screenshot:
            if screenshot_wait_ms:
                page.wait_for_timeout(screenshot_wait_ms)
            page.screenshot(path=str(Path(screenshot).resolve()), timeout=30000)
    except Exception as exc:
        error = exc
        if page:
            try:
                assertions = page.evaluate('() => window.__test?.assertions || []')
            except Exception:
                pass
    record = result(Path(name).stem, f'Production browser scenario {Path(name).stem}', assertions, started, phases, metadata, error)
    if diagnostic:
        print('ERRS', [str(error)] if error else [], flush=True)
        if page:
            page.context.close()
        return error is None
    if page:
        if record['status'] != 'passed':
            artifact = Path(os.environ.get('TEST_ARTIFACT_DIR',ROOT / 'dist/test-logs')) / f'{Path(name).stem}-{Path(html).stem}-failure.png'
            artifact.parent.mkdir(parents=True, exist_ok=True)
            try:
                page.screenshot(path=str(artifact), timeout=10000)
            except Exception:
                pass
        page.context.close()
    emit(record)
    return record['status'] == 'passed' or diagnostic and error is None


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('names', nargs='+')
    parser.add_argument('--html', default='naranxia_readable.html')
    args = parser.parse_args()
    with sync_playwright() as p:
        t = time.perf_counter()
        with p.chromium.launch(args=FLAGS) as browser:
            print('BROWSER_LAUNCH_MS', round((time.perf_counter()-t)*1000, 3), flush=True)
            outcomes = [run(browser, name, args.html, 1280 if Path(name).stem in ('ui', 'smoke') else 1000, 720 if Path(name).stem in ('ui', 'smoke') else 620) for name in args.names]
    sys.exit(0 if all(outcomes) else 1)
