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
for (const e of EXTRA) {
  const miss = keys.filter((k) => !e.tr[k]);
  /* the English plural suffix ({0} peasant{1}, replaced by 's') must be dropped: kept, it prints "2 boers" */
  const bad = keys.filter((k) => e.tr[k] && ph(k.replace(/(peasant|villager|sapling)\{\d\}/g, '$1')) !== ph(e.tr[k]));
  console.log(`${e.name.padEnd(12)} missing ${miss.length}  placeholder mismatches ${bad.length}`);
  for (const k of bad.slice(0, 5)) console.log('   ', JSON.stringify(k), '->', JSON.stringify(e.tr[k]));
}
