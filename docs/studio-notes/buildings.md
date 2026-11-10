# Buildings (hd-model): redesign of every building, Minecraft style. NOT merged: the King validates the board first

Base: release-v84. Visual only: no footprint, collision, exit point, garrison height, simulation or save change. Nothing under `game/`.
Board: `docs/studio-boards/buildings/board.html` (29 rows, A = current, B = new; stone, wood, night; town day/night; ruins; building site).

## What changed
- **Pixel textures for buildings** (`rendering/materials.js`, shader of `matV`, building material ids only: 1 stone, 2 wood, 3 plaster, 6 tiles, new 8 window glass, new 9 thatch; units keep 0, 4, 5, 7 untouched):
  every brick, plank and roof tile gets one of 3-4 tones with a pixel bevel, straw strands for thatch, the detail fades with distance (no shimmer). Shadow hatching is cut to 30 % on these materials.
- **Windows lit at night**: glass is material 8 (`bG` in `building-parts.js`, used by `qWin`); `NGU` (materials.js) follows `nightK` (one line in `lighting.js`). Smooth noise keeps a few houses dark. No extra geometry, no extra light.
- **Wood tier really distinct** (`geometry.js` `bxm`): thatched roofs (any roof drawn in the `WRF` tones is material 9), plank walls, and the footing and chimney bricks stay stone (grey cobble). Players see this tier first (every building starts at tier 0).
- **Kit** (`models/building-parts.js`): stepped timber bargeboards on every gable (`qRoof`), `qSack`, `qAnvil`, `qGrind`, `qLadder`, `qFire`, `qSign`, `qWheel`, `qTree`; `qChim` registers the chimney top in `geometry.userData.chim`.
- **Chimney smoke** (`lighting.js` `chimneySmoke`, `effects.js` exports `smk`): stateless sprites computed from the clock (nothing stored in `sessionState.pt`, so nothing reaches saves or resync snapshots), finished player buildings near the camera, off with Reduce motion.
- **Ten bastion buildings rebuilt** (`models/bastion-buildings.js`), each with its own outline: observatory (round tower, gallery, slit dome, brass telescope, armillary), granary (barn on staddle stones, hoist and sack, ramp, sheaves), bell (belfry, bronze bell, spire, pull rope), sanctuary (buttressed chapel, golden roof, bell-cote, glowing sun window, apse), beacon (tapering tower, corbelled crown, iron fire basket, ladder, banner, woodpile), orchard (tiered apple trees, ladder, baskets, beehive, wheelbarrow), forge (great brick chimney, open lean-to over the glowing hearth, anvil, bellows, quench barrel, grindstone, blades, sign), embassy (two floors, hipped roof, pillared porch and balcony, carpet, banners and flags in the kingdom colour), war room (flag turret, striped command tent over the map table, spear rack, shields, drum), sappers (shed, timbered mine mouth in a mound, rails and ore cart, powder kegs, cog).
- **Touch-ups**: house (dormer on every house, log pile, rain barrel), barracks (straw dummy), castle 5x5 (covered well, hay cart, smoking chimney on the keep), ruins (`rendering/ruins.js`: same tower stump chosen by the King, now brick courses, broken crown, ivy, fallen column, iron-bound chest).
- **Bug found and fixed** (`models/structures.js` `sGeo`): the wood variant cache key was derived with `k.replace('w','')`, which removes the first `w` of `warroom`: once a wood war room had been built, the stone war room kept the wood model for the rest of the session.

## Cost (same merged geometry per building, one draw call each)
- Town of 78 structures at the game camera: 183 draw calls before and after; triangles on screen 408 668 -> 429 212 (+5 %).
- Per building (triangles, before -> after): bastion buildings 500-1100 -> 1100-2750 (now on par with the core buildings, 1700-4000); house 3420 -> 3996; storage 2304 -> 2496; barracks 2496 -> 2748; guild 2892 -> 3084; forester 2028 -> 2220; castle 5x5 11 558 -> 12 506; walls, gates, towers, keep, farm, market, academy, torch, siege engines unchanged. Full table: `tris` in `spec.json` notes.
- Frame time: software renderer on a loaded shared machine (15-18 s per frame for both builds, +-30 % noise): no measurable difference. To be confirmed on a real GPU.

## Verified
- `npm run build`; `npm test -- det smoke`: det PASS (588 s), smoke PASS (1184 s; the first try hit the 1200 s cap, the machine was at load 18).
- det hash lists are byte-identical between the release-v84 build and this branch (`tests/det.js` run on both).
- Per-building renders of every type in stone, wood and night; town day/night before/after; no page error in any run.

## Not done / left
- Spike traps: their look lives in `gameplay/traps.js` (`spkSync`), outside my scope. Proposal: square plank-framed pit and 4 iron stakes.
- Walls, gates, towers, keep, castle 3x3, siege engines: geometry untouched (units stand on them; garrison heights and lamp positions depend on it); they only get the new textures.
- Scaffolding (`scafGeo`) and the damaged state (smoke and embers under 50 % hp) are unchanged; scaffold heights in `frame.js` still cover the new models.
- Building icons (`model-icons.js`) are renders of the models: they follow automatically; `fitcheck` not needed (no text).
- Regenerate the board: `python3 docs/studio-boards/buildings/_src/render.py <html> <dir>` for A (release-v84 build) and B, `town.py <html> <prefix>` for both, then `make.py <dirA> <dirB> <townA> <townB>` (machine loaded: 2 min per render pass, 15-25 min per town).
- Lead should run after merge: `det smoke tools features bastion ruins traps` and look at one night in game on a real GPU.
