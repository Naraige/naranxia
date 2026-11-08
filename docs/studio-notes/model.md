# model (hd-model): boards 3D, variantes A/B/C derriere un selecteur

- King's choices applied (board 1): scout B, engineer B, envoy B; king, guard and bastion buildings stay as they were (X). `window.__MV`, `model-variants.js`, `unit-variants.js` and the king A/B/C, guard A/B/C, building marker A/B/C and refused A/C variants are deleted. `units.js` and `bastion-buildings.js` are back to the pre-variant code (only the new dispatch line for the 3 units is added in `humanKit`).
- `pxScout`, `pxEngineer`, `pxEnvoy` (royal-skins.js, Blockbench manner: player model + outer layer + a few extra cubes) replace the B box kits when `PXON`; the old box kits stay in `humanKit` as the non-pixel fallback. Hand items (spyglass, wrench, sheet) go on the right arm only (`handItems`: own scene, `pxCat(P.AG)`), because `pxArms` mirrors to both arms.
- Heights (`h` in units, bars and selection use `h*sc`): scout 16 (the B boxes said 17.6, but nothing rises above the cap: measured top 0.98 vs bar 1.08), engineer 16.4 (hammer head reaches 15.6 + hat), envoy 16. Measured bbox tops (tile units, sc 1.35): scout 0.979, engineer 1.005, envoy 1.002, knight 1.029.
- Gotcha: `pxMap2` letters `s S w e m 0-5 g G o b B n` are shared (skin, steel, gold, leather); do not reuse `S` for another colour (the envoy's hands and nose turned red), and passing `thp()` overrides `V t T U Y`.
- `docs/studio-boards/model/_src/render.py` still sets `window.__MV` for the old boards: dead since this change (boards are kept as history only).
- Planches: `docs/studio-boards/model/` (`spec.json`, `rowN_{X,A,B,C}.png`; X = modele actuel). Regenerer: `npm run build`, `python3 docs/studio-boards/model/_src/make_script.py`, `python3 docs/studio-boards/model/_src/render.py [0 A B C]`, `python3 docs/studio-boards/model/_src/compose.py` (machine chargee: compter 5 min par variante).

## A cabler apres le choix du Roi (reste)
1. Rien a faire pour king, guard, batiments (choix X: modele actuel). Si le Roi veut un jour la couronne / le pavois / les reperes: les anciennes variantes sont dans l'historique git (commit a63101d, `unit-variants.js`, `model-variants.js`).
2. Tests faits: `npm run build`, `det` PASS (hashes identiques), captures showshot des 3 unites (face et dos). A faire avant release: `smoke`.
