# Blocks (hd-model): one block grid for terrain, decor and buildings. NOT merged: the King validates the board first

Base: release-v84. Request of the King: « il faut revoir la generation de map pour matcher la taille des blocks de terrain /
Build block like minecraft pour les batiments ainsi que tout les décors / arbres ect ».
Visual only, behind a switch that is off by default (`rendering/blocks.js`, `blocksState.on`). Nothing under `game/`, no simulation change.
Board: `docs/studio-boards/blocks/board.html` (9 rows, A = current, B = blocks of 0.5, C = blocks of 1/3 where shown), codes in `rows.json`.

## Step 1: what was measured (in the running game, release-v84 build, seeded town)

| thing | measure |
|---|---|
| world | 2250 x 1250 tiles, 1 tile = 1 world unit in the 3D scene (`TS` = 40 simulation units), chunks of 32 x 32 tiles, 7 x 7 chunks kept around the camera |
| terrain heights | `HT` is integer everywhere (0 non-integer values in 14 400 tiles sampled, range 7 to 32), land level 12, water surface 11.92: one height step = 1 world unit |
| terrain mesh | one top quad per tile, one side quad per world unit of exposed cliff, a 0.28 grass strip on the top of grass columns; vertex colours only, smooth "painted" shader (`matT`, no pixel texture); natural ramps are already drawn as steps of 0.5 |
| paths | `pathTop`: a band with 0.17 margins, cobbles of 0.17, edging 0.05, ruts, pebbles: none of it on a grid |
| buildings (bounding boxes) | house 1.92 x 1.96 x 3.14 high (2 x 2 tiles), storage 2.02 x 2.01 x 2.26, barracks 2.02 x 2.06 x 3.54, academy 2 x 2 x 3.73, guild 2.09 x 2 x 3.02, tower 2 x 2.05 x 6.29, wall 0.86 x 0.86 x 2.08 (walk height 1.7, thickness 0.3), castle 5.34 x 5.52 x 7.02, torch 0.36 x 0.36 x 1.55 |
| building "voxels" | the pixel texture of buildings is 18 pixels per world unit (1 pixel = 0.056); a brick is 8 x 4 pixels = 0.44 x 0.22 |
| trees | cubes of 0.3 scaled 0.95 to 1.25 (0.285 to 0.375), trunk 1 cube wide, canopy 0.9 wide, 1.8 to 2.2 high; forest clumps use 0.5 cubes |
| rocks, ore, bushes | rock 0.75 x 0.7 with a random scale 0.85 to 1.15 and a random offset, gold ore one 0.8 cube, bush 0.44, flowers / tufts 0.03 wide |
| units | Minecraft player of 32 pixels: feet at 0, top of the head at 0.84 world unit (legs 0.281, head top 0.556 above the hip), so 1 unit pixel = 0.026 and a head is 0.21 wide |

So four scales live side by side today: terrain block 1.0, building pixel 1/18, decor cube 0.3 (with random scaling), unit pixel 1/38.
In Minecraft a block is 16 pixels and a player is 1.8 to 2 blocks tall.

## The block unit: 0.5 world unit (B); alternative 1/3 (C)

A block must divide the tile (the simulation grid cannot move), so the candidates are 1, 1/2, 1/3:

| block | tile | height step | unit height | pixel (16 per block) | verdict |
|---|---|---|---|---|---|
| 1.0 | 1 block | 1 block | 0.84 block | 1/16 | a unit is smaller than a block, a trunk fills a tile: no |
| **0.5** | 2 blocks | 2 blocks | **1.68 blocks** | 1/32 | closest to Minecraft (1.8 to 2); unit pixel (1/38) within 19 %; a brick (8 x 4 pixels) = 0.25 x 0.125 = exactly a unit's head, as in Minecraft; the natural ramps already use steps of 0.5 |
| 1/3 | 3 blocks | 3 blocks | 2.5 blocks | 1/48 | trees stay close to today's size, finer textures; units are too tall for the blocks |

Chosen: **0.5**. With it a building tile is 2 x 2 blocks, a house (2 x 2 tiles) stands on 4 x 4 blocks, a wall is 3.4 blocks high.
What has to rescale to sit on that grid: the terrain textures (done), every piece of decor (done), the building textures 18 -> 32 pixels per
unit (done), the building geometry (not done, see below). Units would need x 1.19 to be exactly 2 blocks: not proposed (they would outgrow the doors even more).

## Step 2: what the switch draws (all in `packages/game/src/rendering/`)

- `blocks.js` (new): the switch (`blocksState`, `setBlocks(on, opts)`, localStorage `dk_blocks`), the parts `terrain`, `decor`, `build`, `seasons`,
  the block sizes `BLK` (terrain, building pixels) and `DBLK` (decor), the shader uniforms, and `blkTex`: the pixel texture of a block face
  (16 pixels per block, 3 to 4 tones per pixel, a 1 pixel seam at block borders, one tone per block so the grid still reads from far, detail fading with distance).
  Kinds: grass, dirt, stone, sand, snow, gravel, dirt path, cobble path, grass lip, oak / pine leaves, bark, birch bark, gold ore, rock, plant.
- Terrain (`terrain.js`, block branches in `buildChunk0`): same columns and same heights, so the block tops are exactly the simulated ground.
  Each quad gets its block kind (`kindOf` reads the colour the mesher already computes); cliff sides are merged into one quad per run of the same kind
  (stone under dirt, sand at the shore, gravel under water); the top block of a grass column wears a jagged 2 to 4 pixel grass lip drawn in the shader;
  dirt and cobble paths become whole path blocks (one quad instead of ~100 small boxes per tile); water is sampled on the pixel grid and steps 5 times a second.
- Decor (`terrain-props-blocks.js`, new; `terrain-props.js` only dispatches): trees, rocks, ore, bushes and stumps are voxels on the world block grid.
  Oak (6 variants, trunk 3 to 4 blocks, 3 x 3 canopy, one wide variant), birch (trunk 4 to 5, slim crown), pine (trunk 5 to 6, tiers), chosen by a noise
  of the map seed and the altitude; rocks 1 to 5 blocks, ore 1 to 3 blocks, bush 1 to 2 leaf blocks, stump 1 block. Flowers, tufts, mushrooms and reeds are
  boxes of whole pixels placed on the pixel grid. A chunk collects the voxels of its tiles plus a one-tile margin and draws only the faces that touch air:
  touching canopies share no hidden or doubled face. Every choice is a hash of the tile or block position (never call order, no `Math.random`).
  `markP` also dirties the neighbour chunk when a tile on a chunk border changes (a canopy reaches half a tile over the border).
- Buildings: only the texture density changes (`materials.js`, `PXS` 18 -> 16 pixels per block = 32 per unit). The models are untouched.
- Seasons (`weather.js` feeds `setSeasons`): winter puts snow pixels on grass, canopies, rocks and block tops; autumn yellows the grass and turns the
  leaf blocks yellow / orange / red (pines stay green); summer warms the grass slightly. Driven by the same visual season weights as the light (`WX.s`).
- Off (default): the shaders take the old branches (`uBlk` = 0, `uBpx` = 0), the meshers take the old paths. `det` hashes are identical to release-v84.

## Simulation: nothing changed, nothing needed for what is on the board

- Units and buildings stand on `HT` as before and the block tops are at `HT`: measured offset 0 (no floating, no sinking, no snap needed).
- Points where a simulation change WOULD be needed (described, not made):
  1. Terrain steps of one block (0.5) instead of two: `HT` would need half levels (heights, `canStep`, ramps, pathfinding, saves).
  2. Buildings at true Minecraft proportion (a door 2 blocks = 1.0 unit high for a 0.84 unit): the models would grow about 1.6 x, so the footprints
     (tiles, collisions, placement) would change. Today a house door is lower than a unit; the block grid does not fix that.
  3. Trees one block wide that units could walk around inside a tile: collisions are per tile.
- Visible side effect to judge on the board: with blocks of 0.5 the trees are taller (2.5 to 3.5 units instead of 1.8 to 2.2) and wider (1.5 instead of 0.9),
  so a unit standing behind a tree is hidden more often (first framing of row 5 showed it). With 1/3 the trees keep today's size.

## Buildings against the block grid (proposal, not applied)

- Texture: fixed by the switch (bricks, planks, tiles and thatch at 16 pixels per block).
- Geometry: off the grid everywhere (footprints 1.92 / 2.02 / 2.09 instead of 2.0, heights 3.14, 2.26, 3.54..., details of 0.02 to 0.06).
  A re-grid is not contained: every model file (`models/buildings.js`, `bastion-buildings.js`, `castles.js`, `fortifications.js`, `building-parts.js`, ~2000 lines)
  must be passed through. Proposed rule for that batch: main volumes on half blocks (0.25): footprint exactly 2.0 per 2 tiles, floors of 2 blocks (1.0),
  roof steps of half a block, doors 1 block wide x 1.5 high, windows 1 block; details snapped to the pixel (1/32).
  Walls, gates, towers and the keep must keep their walk heights (units stand on them): only their pixel snap is free.
- Not shown on the board as a rebuilt model (no time for a faithful one); row 5 shows the texture change only.

## Cost (same seeded town, software renderer, 960 x 600)

| | A (off) | B (0.5) | C (1/3) |
|---|---|---|---|
| draw calls, village at game distance | 154 | 154 | 154 |
| triangles on screen, village | 399 578 | 265 516 (-34 %) | 293 128 (-27 %) |
| draw calls, full map (zoom 80) | 199 | 199 | not rendered |
| triangles on screen, full map | 677 642 | 401 218 (-41 %) | not rendered |
| triangles of the 63 loaded chunks: terrain | 230 486 | 174 182 (-24 %) | 174 182 |
| triangles of the 63 loaded chunks: decor | 978 372 | 417 500 (-57 %) | 507 080 (-48 %) |
| chunk build, terrain (ms per chunk, two runs) | 5.5 / 6.2 | 3.6 / 7.2 | 3.7 / 3.7 |
| chunk build, decor (ms per chunk, two runs) | 8.7 / 11.1 | 3.7 / 6.7 | 4.3 / 4.4 |

Chunk timings are noisy on this shared machine (the second B terrain figure is an outlier); the triangle counts are exact.
Frame time was not compared (software rendering, 5 to 20 s per frame for both): to confirm on a real GPU, the fragment shader does less work per pixel in block mode.

## Verified
- `tests/det.js` on the release-v84 build and on this branch with the switch ON (`_src/run_on.py`): the two hash lists are byte-identical (same md5).
- `npm run build`; `npm test -- det smoke` on this branch (switch off, the default): results in the journal entry.
- After the switch was split into parts: one winter forest render (all parts), one mixed render (terrain 0.5, decor 1/3, seasons and build off), one render with the switch off (same look as A).
- Renders: every row of the board in A and B (C for rows 1, 3, 4, 6, autumn for row 8), no page error in any run.

## Found on the way (not changed)
- Probable regression of the buildings batch (8ee24cc): the terrain marks "dry" tiles with material id 9, and the buildings batch gave id 9 to thatch
  and widened the shader test to `mId<9.5`, which also switches off the painted meadow strokes on dry grass (the A pictures show a flat green ground).
  One-line fix if the King wants the strokes back: keep `8.5` under `#ifdef TERR`. Left as is so that A stays exactly release-v84.

## Not done / left
- Building geometry re-grid (above). Spike traps, ruins, scaffolds, siege engines: untouched (they only get the texture density).
- Minimap, fog of war, territory overlay, build preview: untouched, they follow the tiles.
- The site picker preview uses the same chunk meshers, so it follows the switch; it and the title scene were not rendered for the board.
- Real GPU check of the frame time and of shimmer at mid distance; a look in co-op (the code is render only, `det` passes with the switch on).
- Mixed codes: rows 1-2 share `terrain`/`BLK`, rows 3-4 share `decor`/`DBLK`; the building pixel density follows `BLK`.
- Regenerate the board: `npm run build`, then `python3 docs/studio-boards/blocks/_src/shoot.py naranxia_readable.html <outdir> docs/studio-boards/blocks/_src/shots.json 960 600 measure.js`
  (about 10 minutes, one page load) and `python3 docs/studio-boards/blocks/_src/make.py <outdir>`.
