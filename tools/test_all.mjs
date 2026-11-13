#!/usr/bin/env node
// Cross-platform test runner used by the root `npm test` script.
import { createWriteStream, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logDir = path.join(root, 'dist', 'test-logs');
mkdirSync(logDir, { recursive: true });
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const suite = {
  smoke: { args: ['tools/run.py', 'tests/smoke.js', '-', '1280', '720', '300', 'naranxia.html'], pass: /^ERRS \[\]/m },
  det: { args: ['tools/run.py', 'tests/det.js'], pass: /"same":true/ },
  tools: { args: ['tests/tools.py'], pass: /^RESULT OK/m },
  features: { args: ['tools/run.py', 'tests/features.js'], pass: /"ok":true/ },
  spearman: { args: ['tools/run.py', 'tests/spearman.js'], pass: /"ok":true/ },
  kingxp: { args: ['tools/run.py', 'tests/kingxp.js'], pass: /"ok":true/ },
  mp_kxp: { args: ['tests/mp_kxp.py', 'naranxia_readable.html', '30'], pass: /^RESULT OK/m },
  compat: { args: ['tools/run.py', 'tests/compat.js'], pass: /"ok":true/ },
  bossabil: { args: ['tools/run.py', 'tests/bossabil.js'], pass: /"ok":true/ },
  envoy: { args: ['tools/run.py', 'tests/envoy.js'], pass: /"ok":true/ },
  ruins: { args: ['tools/run.py', 'tests/ruins.js'], pass: /"ok":true/ },
  events: { args: ['tools/run.py', 'tests/events.js'], pass: /"ok":true/ },
  traps: { args: ['tools/run.py', 'tests/traps.js'], pass: /"ok":true/ },
  mp_events: { args: ['tests/mp_events.py', 'naranxia_readable.html', '90'], pass: /^RESULT OK/m },
  bastion: { args: ['tools/run.py', 'tests/bastion.js'], pass: /"ok":true/ },
  research: { args: ['tools/run.py', 'tests/research.js'], pass: /"ok":true/ },
  market: { args: ['tools/run.py', 'tests/market.js'], pass: /"ok":true/ },
  quests: { args: ['tools/run.py', 'tests/quests.js'], pass: /"ok":true/ },
  ui: { args: ['tools/run.py', 'tests/ui.js', '-', '1280', '720'], pass: /"ok":true/ },
  waves: { args: ['tools/run.py', 'tests/waves.js'], pass: /"ok":true/ },
  mp8: { args: ['tests/mp8.py', 'naranxia_readable.html', '40'], pass: /^ERRS \[\] \[\]/m },
  mpk: { args: ['tests/mpk.py', 'naranxia_readable.html', '40'], pass: /^ERRS \[\] \[\]/m },
  mp_resync: { args: ['tests/mp_resync.py', 'naranxia_readable.html', '220'], pass: /^RESULT OK/m },
  mp_quests: { args: ['tests/mp_quests.py', 'naranxia_readable.html', '400'], pass: /^RESULT OK/m },
  mp_convoy: { args: ['tests/mp_convoy.py', 'naranxia_readable.html', '400'], pass: /^RESULT OK/m },
  save: { args: ['tools/run.py', 'tests/save.js'], pass: /"same0":true/ },
};
const quick = ['smoke', 'det', 'tools', 'features', 'spearman', 'traps', 'kingxp', 'compat', 'ruins', 'envoy', 'bossabil', 'bastion', 'market', 'research', 'quests', 'ui', 'waves', 'events', 'mp8', 'mpk', 'mp_resync', 'mp_kxp', 'mp_convoy', 'mp_quests', 'mp_events', 'save'];
const args = process.argv.slice(2);
const names = args.includes('--full')
  ? [...new Set([...quick, 'save'])]
  : args.filter((name) => name !== '--full');
const selected = names.length ? names : quick;
const unknown = selected.filter((name) => !suite[name]);
if (unknown.length) {
  console.error(`Unknown test(s): ${unknown.join(', ')}. Available: ${Object.keys(suite).join(', ')}`);
  process.exit(2);
}

const concurrency = Math.max(1, Number.parseInt(process.env.J || '1', 10) || 1);
const timeoutMs = 20 * 60 * 1000;
let next = 0;
let failures = 0;

function run(name) {
  return new Promise((resolve) => {
    const spec = suite[name];
    const started = Date.now();
    const logPath = path.join(logDir, `${name}.log`);
    const log = createWriteStream(logPath);
    const child = spawn(python, spec.args, { cwd: root, windowsHide: true });
    let output = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);
    for (const stream of [child.stdout, child.stderr]) {
      stream?.on('data', (chunk) => {
        log.write(chunk);
        output += chunk.toString();
      });
    }
    child.on('error', (error) => { output += `\n${error}\n`; });
    child.on('close', (code) => {
      clearTimeout(timer);
      log.end();
      const clean = !/^Traceback|^EXC|FIRST DIVERGENCE|^ERRS \['|^ERRS \[\] \['|"ds":true/m.test(output);
      const passed = !timedOut && code === 0 && clean && spec.pass.test(output);
      if (!passed) failures++;
      const seconds = Math.floor((Date.now() - started) / 1000);
      console.log(`${passed ? 'PASS' : 'FAIL'} ${name.padEnd(10)} ${String(seconds).padStart(4)}s`);
      if (!passed) console.log(`     log: ${path.relative(root, logPath)}${timedOut ? ' (timed out)' : ''}`);
      /* the CI job log is all that can be read after a failure (the test-logs artifact cannot be downloaded): show the end of the log */
      if (!passed) console.log(output.trimEnd().split('\n').slice(-15).map((line) => `     | ${line.slice(0, 400)}`).join('\n'));
      resolve();
    });
  });
}

async function worker() {
  while (next < selected.length) {
    const name = selected[next++];
    await run(name);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, worker));
if (failures) {
  console.error(`SOME FAILED: see ${path.relative(root, logDir)}/`);
  process.exit(1);
}
console.log('ALL PASS');
