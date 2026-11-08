## Lore (boss legends + kingdom journal)
- wave-boss.js: BOSSL legends on spawn banner, jrnAdd/bossFell; simulation.js: one call bossFell on boss death; session/reset/SAVA: `jrn` (JRN, tolerant of absence); title-menu.js: boss stories in Chronicle (best wave 10/20/30/40) + "Journal of the realm" (last 12 entries).
- Texts: docs/studio-texts/lore.json (14 keys, merge with tools/addtexts.py). Test: det, features, save (boss at wave 10), screenshot of Chronicle. Not run: runtime (tools/run.py timed out, fonts blocked); build OK.
