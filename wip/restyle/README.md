# Restyle in progress (not released)

Minecraft / Blockbench look for units and gear. Shown to the King as preview boards; **do not ship until he approves the whole set**.

- `restyle.py` patches the joined game script (`dist/game.js`, written by `tools/build.sh` from `src/game/*.js`) into a restyled copy:
  `bash tools/build.sh && python3 wip/restyle/restyle.py dist/game.js dist/game_restyle.js`,
  then `GAME_JS=dist/game_restyle.js bash tools/build.sh` and render boards with `tools/preview/showshot.py`.
  The patch uses exact string replacements, so re-check it after editing `src/game/`.
- `sets_skin.js` holds the unit skins and gear (read by `restyle.py`).

Status (Nov 2026):
- approved: armour of knight, royal guard, archer, peasant (MC skin + outer layer, 2-3 extra cubes);
  knight shield B (Minecraft shield, team field and pale cross); royal guard shield "blason 1" (red pale, gold crown and sun);
  voxel halberd; shield sitting on the forearm.
- liked, no objection since: bow, sword (longer).
- round 2 shown on 2026-11-06 (board https://claude.ai/artifact/HsTZDU2YgpyBYxceCBFiJr): king A (face, beard, crown) or B (royal helm
  under the crown), captain (gilded breastplate, red sash, open bascinet, chevron shield, gilded sword), bannerman (kettle hat,
  gambeson, cross tabard), gunners (doublet, apron, bandolier, feather), zombies as pixel skins driven by the same zSpec
  (outfits, headgear, wounds, MUTX proportions; runner skeletons with thin limbs, brute shackle and spikes, bomber keg, acid sacs,
  miner helmet and pick), royal sword. All in `sets_units2.js`. Waiting for the King's codes.
- still old style: capes (king, captain, guard), the banner, the cannon, the swarm crowd (swGeoV, kept light for speed); then buildings.
- build time: 74 pixel zombie variants in 164 ms (old builder 49 ms).
- boards: `bash tools/build.sh && python3 wip/restyle/restyle.py dist/game.js dist/game_restyle.js && GAME_JS=dist/game_restyle.js bash tools/build.sh`,
  copy dist/naranxia_readable.html to dist/restyle.html, render with `python3 tools/preview/showshot.py restyle.html "window.__U='king~~~0.35,zombie~3';window.__B='-';window.__N=520;window.__GR=1;window.__UF=.82" OUTDIR tools/preview/j_show2.js`
  (window.__KV='B' for the king's helm variant, one variant per run), rows with `tools/preview/compose.py`, page with `tools/board.py`.
- the shield plan is based on "Minecraft Shield" by bugbilly (CC BY 4.0): credit him in the release notes when this ships.
