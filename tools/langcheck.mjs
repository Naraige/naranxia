#!/usr/bin/env node
// Coverage of the extra languages (packages/game/src/i18n/langs/*.js) against the English table.
//   node tools/langcheck.mjs              -> one line per language: missing keys, placeholder mismatches
//   node tools/langcheck.mjs --keys out.json  -> writes {"0": "English key", ...} (for translators)
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tr = await import(pathToFileURL(path.join(root, 'packages/game/src/i18n/translations.js')));
tr.initializeTranslations();
const keys = Object.keys(tr.TRD);
const ph = (s) => (s.match(/\{\d\}/g) || []).sort().join('');
if (process.argv[2] === '--keys') {
  writeFileSync(process.argv[3], JSON.stringify(Object.fromEntries(keys.map((k, i) => [i, k])), null, 0));
  console.log(`${keys.length} keys written`);
  process.exit(0);
}
const { EXTRA } = await import(pathToFileURL(path.join(root, 'packages/game/src/i18n/langs/index.js')));
console.log(`English table: ${keys.length} keys`);
/* an English plural "s" glued to a placeholder ("All your {0}s selected") must not be kept by a translation: it prints "Tous vos chevaliers
   sélectionnés" only by luck and "Todos os seus arqueiros" never; reword so the name stands alone ("Unités sélectionnées : {0}") */
const glued = (v) => typeof v === 'string' && /\{\d\}s(?![\p{L}])/u.test(v);
{
  const MAIN = ['FR', 'ES', 'DE', 'IT', 'PT'];
  const bad = [];
  for (const k of keys) (tr.TRD[k] || []).forEach((v, i) => { if (glued(v)) bad.push(`${MAIN[i]} ${JSON.stringify(k)} -> ${JSON.stringify(v)}`); });
  console.log(`main table   glued plural suffixes ${bad.length}`);
  for (const b of bad.slice(0, 8)) console.log('   ', b);
  if (bad.length) process.exitCode = 1;
}
for (const e of EXTRA) {
  const miss = keys.filter((k) => !e.tr[k]);
  /* the English plural suffix ({0} peasant{1}, replaced by 's') must be dropped: kept, it prints "2 boers" */
  const bad = keys.filter((k) => e.tr[k] && ph(k.replace(/(peasant|villager|sapling)\{\d\}/g, '$1')) !== ph(e.tr[k]));
  const glue = keys.filter((k) => glued(e.tr[k]));
  console.log(`${e.name.padEnd(12)} missing ${miss.length}  placeholder mismatches ${bad.length}  glued plural suffixes ${glue.length}`);
  for (const k of [...bad, ...glue].slice(0, 5)) console.log('   ', JSON.stringify(k), '->', JSON.stringify(e.tr[k]));
  if (glue.length) process.exitCode = 1;
}
