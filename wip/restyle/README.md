# Restyle in progress (not released)

Minecraft / Blockbench look for units and gear. Shown to the King as preview boards; **do not ship until he approves the whole set**.

- `restyle.py` patches the joined game script (`dist/game.js`, written by `tools/build.sh` from `src/game/*.js`) into a restyled copy:
  `bash tools/build.sh && python3 wip/restyle/restyle.py dist/game.js dist/game_restyle.js`,
  then `GAME_JS=dist/game_restyle.js bash tools/build.sh` and render boards with `tools/preview/showshot.py`.
  The patch uses exact string replacements, so re-check it after editing `src/game/`.
- `sets_skin.js` is the editable copy of the unit skins and gear embedded in `restyle.py` (between `SETS=r'''` and `'''`).

Status (Nov 2026):
- approved: armour of knight, royal guard, archer, peasant (MC skin + outer layer, 2-3 extra cubes);
  knight shield B (Minecraft shield, team field and pale cross); royal guard shield "blason 1" (red pale, gold crown and sun);
  voxel halberd; shield sitting on the forearm.
- liked, no objection since: bow, sword (longer).
- to do: king, captain, bannerman, gunner, zombies and their weapons; buildings.
- the shield plan is based on "Minecraft Shield" by bugbilly (CC BY 4.0): credit him in the release notes when this ships.
