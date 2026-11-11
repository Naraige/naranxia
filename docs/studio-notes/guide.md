# Video guide (Tutorial button of the title menu)

Request of the King, word for word: "make the tutorial more like a video guide". Branch of the hd-menu-ux worktree, not merged, not shipped.

## What it is

The Tutorial button (key T) of the title menu now opens a player screen (`ui/video-guide.js`, `drawGuide`) built with the menu kit:
chapters on the left (`listBegin` rows, the current one lit), the "video" on the right with a caption under it, a progress bar with a tick at
each caption change, previous / play-pause / next, the clip time and the chapter count. Chapters follow each other by themselves and loop.
"Play the tutorial game" (under the list) opens New kingdom; the first game is then guided by the quests (`gameplay/quests.js`).
The old five-step tutorial bar is gone (decision of the King, see "Old tutorial bar removed" below).

Controls: mouse / touch on rows and buttons, a click on the picture pauses, a click on the progress bar seeks; Up / Down / Enter and the
gamepad move through rows and buttons like every list screen (NAV); Left / Right change the chapter, Space pauses, Esc (pad B) closes.
Narrow screens (content under 380 units wide) drop the list: a "3/9 title" line over the picture, the tutorial-game button under the controls.
Low screens (content under 170 units high, a phone held sideways) put the picture on the left at full height and the caption, progress bar,
controls and tutorial-game button in a column beside it; if that column would be under 110 units wide the stacked layout stays, with one caption line.

## Chapters (each starts with a 1.3 s title card)

| # | title | s | what the clip shows |
|---|---|---|---|
| 1 | Gather | 17.5 | the pointer drags a selection box over 3 peasants, right-clicks a tree; they walk, chop (trees shake, +1), carry the wood to the castle, the wood counter climbs |
| 2 | Build | 18 | click on the build button, the menu slides in, House is picked, its ghost follows the pointer, a click places it, 2 peasants hammer it up (progress bar), wood and gold drop; then a farm is placed |
| 3 | Population and food | 18 | population 10/10 blinks red, the third house finishes: 10/15; a peasant goes to the farm, "+6" food every 1.5 s; two peasants are trained (food and gold drop, they walk out of the castle) |
| 4 | Train an army | 20.5 | three clicks on Knight and two on Archer in the train bar, the barracks shows the training bar, soldiers come out and line up; a selection box, a right-click, the army marches off |
| 5 | Walls and towers | 20 | red route to the castle; the pointer drags a line of walls across it, adds a gate, then a tower; four zombies come down the road, stop at the gate, the tower shoots them |
| 6 | The night and the horde | 21.5 | wave countdown in the top bar, night falls (torch light), twelve zombies with runners and brutes arrive, knights hold the gate, archers and the tower shoot, dawn |
| 7 | Research | 18 | click on the Academy, a research is chosen, the bar fills; the wooden wall turns to stone segment by segment; a second research, the knights flash |
| 8 | The King | 18 | the King is summoned at the castle with 2 guards and his gold aura, walks out, fights seven zombies, a skill is clicked (gold shockwave, zombies thrown back), his XP bar fills, +1 |
| 9 | Co-op | 20 | two castles and two coloured pointers (P1 / P2); both armies meet in the middle against zombies from north and south; a convoy cart crosses to the partner, "+100" |

Captions: three per chapter, 27 in all (2 reuse existing keys). New keys: `docs/studio-texts/guide.json` (33 entries, 31 new).

## Approach and why

Scripted 2D animation on the menu canvas, 320 x 180 virtual pixels scaled to the player, every clip a pure function of its time
(keyframed paths, no accumulated state): pause, seek and loop cost nothing and nothing can drift.

- Buildings: the game's icons (`IC`, `ICT`), which are renders of the real building models.
- Units: the head icons were not enough to look like footage, so the guide shoots its own sprites from the real unit models in their real
  poses: a throw-away unit object (the fields of `mkU`, without its UID counter or random draws) is posed by `animUnit` (walk cycle,
  attack swing, peasant with axe / hammer / hoe, carrying wood) and rendered with the icon camera into 96 px canvases, with a fixed
  framing per unit type so frames do not jitter. 8 unit types, 89 small renders, done in 10 ms slices after the screen opens, once per
  kingdom colour; the clip waits on its title card until they are ready.
- Trees, rocks, ground, pointer, selection box, menus, counters, night and torch light: a few rectangles each.

Rejected: video files or GIF (size: the game is one HTML file), a live 3D mini-scene (needs a second world and a running simulation, or a
large hand-made scene; costly in headless tests and on weak GPUs), DOM/CSS animation (every other screen is canvas).

Simulation safety: the module never touches `sessionState`, sends no command and uses the wall clock. The posed units never enter
`sessionState.units`; the group that `animUnit` adds to the scene is removed at once (as `icoUnit` does). Mesh builds run with
`Math.random` swapped to `REALR`. The screen only exists on the title menu.

## Files

- `packages/game/src/ui/video-guide.js` (new): screen, player, sprites, the nine clips.
- `packages/game/src/ui/tutorial.js`: only `hintBar` and its three hints are left.
- `packages/game/src/ui/title-menu.js`: 4 small edits (import, screen key, the `guideState.open` branch, the Tutorial button action).
- `packages/game/src/i18n/translations.js`: 31 keys added by `tools/addtexts.py`.
- Tools: `window.__guide` (`at(chapter, seconds, paused)`, `fit(width, lines)`, `ready()`) for screenshots and caption checks.

## Left to do / decisions for the King

- Look of the clips on a real GPU and a real phone (only headless captures were looked at).
- The clips have no sound: a click / chop / horn track from the existing sound set is possible, not done.
- The button is still called "Play the tutorial game" although it now only opens New kingdom (the quests guide the game): rename it ("Start a game"?) or drop it.
- The guide is not reachable from the in-game Esc menu (title only).
- `tools/fitcheck.py` does not open the guide yet (captions were checked with a separate script, see the journal).
- Chapters not covered: traps, seasons, market, events and rebel camps, king talents.

## Old tutorial bar removed (King: the quests replace it)

Removed: the `TUTS` steps, `tutStart`, `tutEnd`, `tutBar` (`ui/tutorial.js`), the `tutBar` call in `ui/hud.js` (now `bossY+=hintBar(...)`),
the `tutStart()` call in `gameplay/reset.js`, `TUT` in `gameplay/traps.js` and its test in `hintBar`, the "Tutorial" line of Settings
(`tutOn` / `tutSet`), every read or write of the `dk_tut` key (also in `tools/announce_shots.py`). `hintBar` and its three hints stay.
The translations of the five old step texts stay in the table (three of them are still the tips of the day and guide captions).
A `dk_tut` value already stored in a browser is simply ignored.
