# Texture (hd-texture)

Board answers applied (visual only, no simulation change):
- Team skin B: the knight jacket is now a full tabard in team colours (6 of 8 columns, whole height, gold emblem kept on the chest, hem). `soldier-skins.js` (SK_KNIGHT.jacket F and B).
- Rank skin A: gold bands on the sleeves = rank 0..3 (u.xp/4, same formula as combat). Knight: sleeve rows 4/6/8; archer: arm rows 3/1/5. Player team (t=0) knights and archers only.
  Plumbing: `unitsState.RKB` (units.js) read by `pxRankK` (soldier-skins.js); `buildUnitGroup(type,t,zv,rk)` adds the rank to the model cache key; `mkUnit`/`animUnit` (unit-animation.js) rebuild the mesh when the rank changes (`u.mrk`, same mechanism as armour level `u.mal`). Reads u.xp only, never writes it.
- Knight icon A: helmet crest is now red (#c0392b) instead of gold, dark steel unchanged; the head icon and the 3D unit come from the same model.
- Archer icon A, tower A, barracks A: icons are renders of the real models (forest-green hood, standard stone, brick roof), already matching, not touched.
- Seasons A = current, untouched.

Verified: npm run build; 3D previews of ranks 0..3 (front/back) and tabard.
Lead should run: det (hashes must be identical), a screenshot of mixed ranks in game.
