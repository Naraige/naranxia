#!/usr/bin/env node
// Static audit of the texts (no browser): node tools/textaudit.mjs [--since v91] [--block 92] [--all] [--notes]
//   0. notes: every line of game/NOTES.md is a key with all languages (--notes: this check alone, exit 1 on a fault; used by tools/release.sh)
//   1. table: every key has FR ES DE IT PT, same {n} in each, no French "tu/ton/ta/tes/toi", extra languages coverage
//   2. sources: string literals of packages/game/src (outside i18n) that look like player text and that L() would leave in English
//      (same logic as L(): exact key, trimmed, templates, pieces split on ' - ' ' | ' and 3 spaces, "[key]" suffix, capitalised entry).
//      With --since TAG only the literals that did not exist at that tag are listed (default v91); --all lists every one.
//   3. keys of the block "texts added in vNN" (--block NN, default game/VERSION + 1) that no source literal reaches (candidates to remove).
// Concatenated pieces ('Wave ' + n) count as translated when a template key contains them. Heuristic: read the list, do not trust it blindly.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'packages/game/src');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const since = process.argv.includes('--all') ? null : arg('--since', 'v91');
const block = arg('--block', String(+readFileSync(path.join(root, 'game/VERSION'), 'utf8').trim().replace(/^v/, '') + 1));

const trPath = path.join(SRC, 'i18n/translations.js');
const tr = await import(pathToFileURL(trPath));
tr.initializeTranslations();
const TRD = tr.TRD, keys = Object.keys(TRD), NAMES = ['FR', 'ES', 'DE', 'IT', 'PT'];
/* the plural suffix glued to peasant / villager / sapling ({0} peasant{1}) has no counterpart in the translations */
const ph = (s) => (s.replace(/(peasant|villager|sapling)\{\d\}/g, '$1').match(/\{\d\}/g) || []).sort().join('');
let bad = 0;
const say = (...a) => { bad++; console.log(...a); };
const { EXTRA } = await import(pathToFileURL(path.join(SRC, 'i18n/langs/index.js')));

/* 0. release notes: every line of game/NOTES.md, stripped as the Update page strips it (core/notes.js), must be a key of the table
      with every language (the page looks whole lines up; a missing one is drawn in English). --notes runs this check alone;
      tools/release.sh calls it before the build, so a release cannot ship untranslated notes. */
const { notesLines } = await import(pathToFileURL(path.join(SRC, 'core/notes.js')));
const noteKeys = new Set(['Update']);
let noteBad = 0;
{
  let md = '';
  try { md = readFileSync(path.join(root, 'game/NOTES.md'), 'utf8'); } catch (e) {}
  const lines = notesLines(md);
  for (const l of lines) {
    noteKeys.add(l.t);
    if (/\*\*|`|^[-*#]\s/.test(l.t)) { noteBad++; console.log('notes: Markdown marker left in', JSON.stringify(l.t)); }
  }
  for (const k of noteKeys) {
    const v = TRD[k], miss = NAMES.filter((n, i) => !(v && typeof v[i] === 'string' && v[i])).concat(EXTRA.filter((e) => !e.tr[k]).map((e) => e.flag.toUpperCase()));
    if (miss.length) { noteBad++; console.log(`notes: no ${miss.length === NAMES.length + EXTRA.length ? 'translation at all' : miss.join(' ')} for`, JSON.stringify(k)); }
  }
  console.log(`== notes: ${lines.length} lines of game/NOTES.md, ${noteBad} problem(s)`);
  if (noteBad) console.log('   add them with tools/addtexts.py (FR ES DE IT PT, key = the line exactly as printed above) and in packages/game/src/i18n/langs/{nl,pl,tr}.js');
  bad += noteBad;
  if (process.argv.includes('--notes')) process.exit(noteBad ? 1 : 0);
}

console.log(`== table: ${keys.length} keys`);
for (const k of keys) {
  const v = TRD[k];
  for (let i = 0; i < 5; i++) {
    if (typeof v[i] !== 'string' || !v[i]) say(`missing ${NAMES[i]}:`, JSON.stringify(k));
    else if (ph(v[i]) !== ph(k)) say(`placeholders ${NAMES[i]}:`, JSON.stringify(k), '->', JSON.stringify(v[i]));
  }
  if (v[0] && /(^|[\s'’(])(tu|ton|ta|tes|toi|t'[a-zé]+)(?=$|[\s,.!?;:)])/i.test(v[0]) && !/\bta\b.*\bta\b/.test(k)) say('French tu?:', JSON.stringify(k), '->', JSON.stringify(v[0]));
}
/* a key written twice: the block lower in the file wins (Object.assign order), so a newer text can be silently overridden */
{
  const seen = new Map();
  readFileSync(trPath, 'utf8').split('\n').forEach((l, i) => {
    const m = /^\s*("(?:[^"\\]|\\.)*")\s*:\s*(\[.*\])\s*,?\s*$/.exec(l);
    if (!m) return;
    const k = JSON.parse(m[1]);
    m[2] = JSON.stringify(JSON.parse(m[2]));
    if (seen.has(k) && seen.get(k).v !== m[2]) say(`key written twice with different texts (lines ${seen.get(k).n} and ${i + 1}, the lower one wins):`, m[1]);
    seen.set(k, { n: i + 1, v: m[2] });
  });
}
for (const e of EXTRA) {
  /* these files may keep the plural suffix ({0} boer{1}) or drop it */
  const raw = (s) => (s.match(/\{\d\}/g) || []).sort().join('');
  const miss = keys.filter((k) => !e.tr[k]), pb = keys.filter((k) => e.tr[k] && ph(k) !== ph(e.tr[k]) && raw(k) !== raw(e.tr[k])), dead = Object.keys(e.tr).filter((k) => !TRD[k]);
  console.log(`${e.name}: missing ${miss.length}, placeholder mismatches ${pb.length}, keys not in the table ${dead.length}`);
  bad += miss.length + pb.length;
  for (const k of pb) console.log('   ', JSON.stringify(k), '->', JSON.stringify(e.tr[k]));
}

/* loaded here: the notes check above must run without node_modules */
const acorn = createRequire(import.meta.url)(path.join(root, 'node_modules/acorn'));
/* the lookup of L(), for "is there a translation" only */
const TRX = new Map(), TRT = [];
for (const k of keys) {
  if (k.indexOf('{0}') < 0) { TRX.set(k, 1); continue; }
  const ids = [];
  const re = k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(\d)\}/g, (m, d, off, str) => { ids.push(+d); return /(peasant|villager|sapling)$/.test(str.slice(0, off)) ? '([^\\s]{0,3})' : '(.*?)'; });
  if (new Set(ids).size !== ids.length) continue;
  TRT.push({ re: new RegExp('^' + re + '$'), k });
}
const used = new Set();
function hit(s, deep = 0) {
  if (TRX.has(s)) { used.add(s); return true; }
  const t = s.trim();
  if (t !== s && t && TRX.has(t)) { used.add(t); return true; }
  for (const x of TRT) if (x.re.test(s)) { used.add(x.k); return true; }
  if (deep < 3) for (const sep of ['  -  ', ' - ', ' | ', '   ']) if (s.indexOf(sep) > 0) { const r = s.split(sep).map((p) => hit(p, deep + 1)); if (r.some(Boolean)) return true; }
  const hk = /^([\s\S]+?)( \[[^\]]{1,3}\])$/.exec(s);
  if (hk && hit(hk[1], deep + 1)) return true;
  if (/^[a-z]/.test(s)) { const c = s[0].toUpperCase() + s.slice(1); if (TRX.has(c)) { used.add(c); return true; } }
  return false;
}
/* a piece of a concatenation ('Wave ' + n + ' of ' + m): fine when a template contains it */
const pieceHit = (s) => { const t = s.trim(); let ok = false; if (t.length < 2) return true; for (const k of keys) if (k.indexOf('{0}') >= 0 && k.indexOf(t) >= 0) { used.add(k); ok = true; } return ok; };

function literals(code, file) {
  const out = [];
  let ast;
  try { ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true }); } catch (e) { console.log('parse error', file, e.message); return out; }
  (function walk(n, par) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal' && typeof n.value === 'string') {
      if (!(par && (par.type === 'ImportDeclaration' || par.type === 'ExportNamedDeclaration' || par.type === 'ExportAllDeclaration' || par.type === 'ImportExpression')))
        out.push({ s: n.value, line: n.loc.start.line, piece: !!(par && par.type === 'BinaryExpression') });
    } else if (n.type === 'TemplateLiteral') for (const q of n.quasis) if (q.value.cooked) out.push({ s: q.value.cooked, line: q.loc.start.line, piece: n.quasis.length > 1 });
    for (const k in n) { const c = n[k]; if (k === 'loc' || !c || typeof c !== 'object') continue; if (Array.isArray(c)) c.forEach((x) => walk(x, n)); else walk(c, n); }
  })(ast, null);
  return out;
}
const files = [];
(function ls(d) { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) { if (f !== 'i18n') ls(p); } else if (f.endsWith('.js')) files.push(p); } })(SRC);
/* looks like text shown to a player: a capitalised word or several words, not an identifier, colour, font, selector, path or code */
const prose = (s) => /[A-Za-z]{3}/.test(s) && (/^[\s(]*[A-Z][a-z]+/.test(s) || /[a-z]{2,} [a-z]{2,}/i.test(s)) &&
  !/^(#|rgba?\(|hsla?\(|\d|[a-z]+[A-Z_]|[\w-]+\.(png|js|json|html|css|mjs)|https?:|data:)/.test(s) && !/[{};=<>]|px |\b(function|return|const)\b|^\s*[A-Z][a-z]*[A-Z]\w*$|^[A-Z][a-z]+(Up|Down|Left|Right)?$|^(Arrow|Key|Digit|Numpad|Shift|Control|Alt|Meta|Float|Int|Uint)/.test(s);
let old = null;
if (since) {
  old = new Set();
  const list = execFileSync('git', ['ls-tree', '-r', '--name-only', since, 'packages/game/src'], { cwd: root, encoding: 'utf8' }).split('\n').filter((f) => f.endsWith('.js') && !f.includes('/i18n/'));
  for (const f of list) for (const l of literals(execFileSync('git', ['show', `${since}:${f}`], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }), f)) old.add(l.s);
}
console.log(`== sources: ${files.length} files, literals not reached by L()` + (since ? ` (new since ${since})` : ''));
let nlit = 0, nmiss = 0;
const all = [];
for (const f of files) {
  const lits = literals(readFileSync(f, 'utf8'), f);
  for (const l of lits) {
    all.push(l.s);
    const ok = hit(l.s) || (l.piece && pieceHit(l.s));
    if (!prose(l.s)) continue;
    nlit++;
    if (ok || (old && old.has(l.s))) continue;
    nmiss++;
    console.log(`  ${path.relative(SRC, f)}:${l.line}${l.piece ? ' (piece)' : ''} ${JSON.stringify(l.s.length > 150 ? l.s.slice(0, 150) + '...' : l.s)}`);
  }
}
console.log(`${nlit} text-like literals, ${nmiss} listed`);

/* keys of the current block that nothing reaches: neither a literal, nor a template match, nor a piece of a concatenation */
const src = readFileSync(trPath, 'utf8'), tag = `/* texts added in v${block} */`, a = src.indexOf(tag);
if (a >= 0) {
  const b = src.indexOf('/* texts added in v', a + 10), blk = src.slice(a, b < 0 ? src.length : b);
  const bk = [...blk.matchAll(/^\s*"((?:[^"\\]|\\.)*)"\s*:\s*\[/gm)].map((m) => JSON.parse('"' + m[1] + '"'));
  const joined = all.join('\u0001') + '\u0001' + readFileSync(path.join(root, 'packages/game/index.html'), 'utf8');
  const dead = bk.filter((k) => {
    if (used.has(k) || noteKeys.has(k)) return false;
    /* a template key: all its fixed parts appear somewhere in the sources */
    const parts = k.split(/\{\d\}/).map((p) => p.trim()).filter((p) => p.length > 1);
    if (k.indexOf('{0}') >= 0 && parts.length && parts.every((p) => joined.indexOf(p) >= 0)) return false;
    return joined.indexOf(k) < 0;
  });
  console.log(`== block v${block}: ${bk.length} keys, ${dead.length} reached by no source literal`);
  for (const k of dead) console.log('  ', JSON.stringify(k));
}
console.log(bad ? `${bad} table problem(s)` : 'table OK');
