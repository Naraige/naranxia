# Naranxia journal

Newest first. One entry per batch or work session: what changed, what was verified, decisions, what is left.
Start of a session: read the top 2 entries and trust them (do not re-verify what is marked verified).
End of a batch: add an entry on top (3 to 10 lines), close the issues, keep CLAUDE.md in step if a rule or a tool changed.

## 2026-11-06 · v90
- The whole restyle shipped (issues #1, #2): the King chose castle A (square fortress, now also the wooden tier via `pxCastleA(true)`),
  textures on buildings kept (he answered only "A"; taken for both boards). The wip patch was merged into `src/game/` with
  `wip/restyle/restyle.py` run on the joined parts (markers), result identical to the preview build (cmp). Toggles left in the code:
  `PXON` (const true), `window.__KV` (king, default B), `window.__CV` (castle, default A), `window.__ZOLD` (old zombies).
- Verified locally: det PASS, tools PASS, one in-game screenshot (wooden castle A, terrain, units). GitHub runs the rest before releasing.
- wip/restyle is now history: do not run restyle.py again on src (its strings are already replaced).

## 2026-11-06 · restyle round 4: buildings (wip, not released)
- Buildings are already block-built; round 4 adds Minecraft block textures in the matV surface shader (restyle.py `PXSH`, not on
  terrain: `#ifndef TERR`): 18 pixels per tile, stone = staggered bricks with mortar, wood = planks with butt joints, per-pixel noise,
  painted ink lines at 30%. No geometry change, no cost on the CPU.
- Board version 3: A with textures / B without. He answered that the castle needs redoing (dislikes its design): two new stone castles
  in `sets_units2.js` (pxCastleA square fortress, pxCastleB great keep; `castleGeo5` patched, window.__CV picks), board version 4 (A/B, C = old).
  Waiting for his choice (and A/B for the textures); the wood castle (tier 0) will follow the chosen design; then ship the whole revamp (rounds 2-4) in one release, credit bugbilly.

## 2026-11-06 · restyle round 3 (wip, not released)
- Pixel capes (king cape + cape2 velvet and ermine with gold crown medallion, captain team cape with gold sun and hem, guard red cape
  with team collar and gold sun) via `pxCapes` before `fin()` in mcModel; the bannerman's banner as one 20x30 Minecraft banner over the
  three chained cloth pieces (`pxBanner`: gold border, fleur-de-lis, swallow tail); `pxCannon` (bronze barrel with rings, plank
  carriage, iron-tyred wheels, balls); the swarm (swGeoV) takes the zombies' green tint (`pxZg`), geometry unchanged. Knight cape, plumes, pole, pennant: old.
- Board updated (same URL, version 2, rows 1-3). He moved on to buildings without remarks: taken as approved. Then buildings (#2), then ship everything in one release.

## 2026-11-06 · restyle round 2 (wip, not released)
- The King said "Go pour le revamp" (issue #1). New pixel-skin builders in `wip/restyle/sets_units2.js`: king (A face + beard + crown,
  B royal helm + crown), captain (gilded breastplate, red sash, open bascinet, gold pauldrons, chevron shield, gilded sword), bannerman
  (kettle hat, gambeson, cross tabard), gunners (gunner2 keeps the old ramrod), zombies (same zSpec variety and MUTX proportions as before,
  skins pulled toward Minecraft green), royal sword. `restyle.py` now reads `sets_skin.js` + `sets_units2.js` (no embedded copy).
- Board published: https://claude.ai/artifact/HsTZDU2YgpyBYxceCBFiJr (rows 1-8, code like "1A 2A ..."). Approved the same night, no remarks: king B (helm + crown, now the default), everything else as shown.
- Not done yet: capes, banner, cannon, swarm crowd, buildings (#2). Ship only when the whole set is approved; credit bugbilly for the shield.

## 2026-11-06 · v89
- Batch 4 of the King's list of 2026-11-02 (the list is now complete): troops panel (F2 / army button, units by type and task,
  click to select), peasant tasks (Wood, Stone, Gold, Farm, Build in the peasant menu, `assignJob`), co-op convoys (castle menu >
  Co-op > Send: porters carry gold / wood / stone / food to the partner, dots on the map, refund after 120 s), Fire arrows research
  (Academy after Fletching: zombies burn 3 s, 6 + 0.2 x wave dps; swarm hits x1.35), selection label and unit names translated.
- Tools asked by the King ("met tout en place, consomme le moins possible, garde en mémoire chaque action"):
  `src/game.js` split into `src/game/00..22` (packed build byte-identical, checked with cmp), translations one per line + `tools/addtexts.py`,
  bug report F8 (+ Esc menu button) and `tools/repro.py` (loads the save in 1 s with the renderer stubbed), test mode F10 (solo, blocks achievements),
  `tools/test_all.sh`, GitHub CI `test.yml` (release.yml waits for it), `tools/release.sh`, `tools/ci_status.sh`, `tools/board.py`, this journal,
  GitHub issues as the backlog (labels + templates), CLAUDE.md "Working efficiently".
- Verified locally: smoke, det, tools, mp8, mpk, mp_resync, mp_convoy all PASS; convoy: 2 porters, 60 wood + 30 stone each, delivered at ticks 698 / 745
  on both machines, porters home, 1331 hash checks equal.
- CI: ubuntu-latest became 26.04, unsupported by Playwright 1.56 -> test.yml pinned to ubuntu-24.04. The first v89 release run was blocked by that,
  re-run by hand (release.yml now has workflow_dispatch, and posts on Discord only for a new release) -> all green, release v89 out,
  the CI build equals the shipped file. Local suite on the 2-core agent box takes ~25 min (smoke 274 s, tools 288 s, mp* ~200 s each): let CI run it.
- Artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 updated to v89. The King saved the `/naranxia` skill (session start + batch routine).
- Left: restyle of king, captain, bannerman, gunner, zombies, then buildings (issues #1, #2). Second player's placement and invisible
  buildings were never reproduced (identical in a real 2-client lobby test): waiting for an F8 report (#3, #4). Save/load continuation differs (#5).

## 2026-11-05 · v88
- Co-op automatic resync: hash mismatch -> host freezes, sends its save in 48 KB chunks ('rs0'/'rs1'), guest loads, then host loads the same
  snapshot (`mpResApply`, seeded Math.random during the load), lockstep restarts at a new epoch (`MP.ep`); banner "Co-op: resynchronizing...".
- Desync cause fixed: zombies / AI units took `pl` from CURPL (differs per machine), now `pl:t===0?CURPL:0`.
- Verified: mp_resync RESULT OK (resync in 7-9 s), mp8 / mpk no divergence, det same.

## 2026-11-05 · v87
- Castle turned with R while placing (door check `castleRotAt`), partner's castle visible in the live picker (ghost, beam, name tag, cursor),
  distance rule reduced to "castles must not overlap" (`sitesFar` >= 10 tiles), castles no longer sink (`smChunk` keeps the pad height),
  units use ramps (`canStep` / `canStepZ`, TFL 1 levelled 2 miner 3 player-made), double click selects all buildings of a type + group upgrade,
  tower / castle range ring on click, "Quit game" (and "Exit to desktop" in the app), co-op version check, AI kingdoms and hordes treat both castles alike.
- Decisions: public repo; "versions directes"; CLAUDE.md + headless tests + release workflow with Discord post.

## Before v87 (restyle track, unreleased, in wip/restyle)
- Approved by the King: armour of knight / royal guard / archer / peasant in the Minecraft-skin style; knight shield B (Minecraft shield);
  royal guard shield "blason 1" (red pale, gold crown and sun); voxel halberd; shield pressed on the forearm (SHZ 1.35).
- Credit "Minecraft Shield" by bugbilly (CC BY 4.0) in the release notes when the shields ship. Never copy third-party models (crimson heir: style only).
