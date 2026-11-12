# Video guide (Tutorial button of the title menu, Guide row of the Esc menu)

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

- `packages/game/src/ui/video-guide.js` (new): screen, player, sprites, the clips (nine in v92, fourteen in v93) and their sounds.
- `packages/game/src/ui/tutorial.js`: only `hintBar` and its three hints are left.
- `packages/game/src/ui/title-menu.js`: 4 small edits (import, screen key, the `guideState.open` branch, the Tutorial button action).
- `packages/game/src/i18n/translations.js`: 31 keys added by `tools/addtexts.py`.
- Tools: `window.__guide` (`at(chapter, seconds, paused)`, `fit(width, lines)`, `ready()`) for screenshots and caption checks.

## v93 lot "guide" (issue #23, King: "fait le tout")

Branch of the hd-menu-ux worktree, committed, not pushed, not shipped.

1. Sounds. Each chapter has a list of `[scene time, sound]` (6th field of `CH`): chop, build, click, select, order, spawn, coin, gate, arrow,
   sword, zombie hit, groan, die, tick, night bell, horn, fanfare, boom, convoy, caravan, envoy, sizzle, clank, notice, dirt. They are the
   game's own sounds, played through `snd` without a position when the clip time crosses them (never on a seek, never while paused): sound
   on/off, the effects volume and the limiter are the game's. `snd` now returns the gain node of the voice it started; the guide keeps its
   voices (at 70 % of the game level) and fades them in 20 ms on pause, chapter change and close (`hush`). No audio file, nothing new.
2. In game. The Esc menu has a "Guide" row (`drawGameMenu`, `ui/title-menu.js`). That menu already sets `started = false`, which stops a solo
   game, and leaves the co-op lockstep running; the guide adds nothing to that: it reads `sessionState.inGame` (veil over the game view) and
   `started` (its Left / Right / Space keys are dead while the game runs), sends no command, writes no state. Esc closes the guide back to
   the game menu.
3. Five chapters in the same scripted style (16 captions, 2 of them existing keys), 14 chapters in all:

| # | title | length (s) | what is shown |
|---|---|---|---|
| 10 | Traps | 18 | the pointer picks the spike trap in the Defense bar and places three on the road (10 gold, 15 wood each); six zombies walk over them ("-6"), three fall, the first trap breaks; Boiling oil is researched, the gate scalds the three that got through ("-12") |
| 11 | Seasons | 17.5 | the same kingdom through spring (rain), summer, autumn (fog), winter (snow on the ground and falling), 4 s each, with the wave number and the season name in the top bar and a season card; the farm keeps giving "+6" |
| 12 | Market and barter | 19 | click on the market, wood sold three times ("+40", "+37", "+34": each sale pays less), the barter slot wood > stone ("-50", "+34"), a merchant caravan rolls in to the market ("+120") |
| 13 | Rebel camps and envoys | 18.5 | an embassy stands; an envoy is trained at the castle, selected and sent to a rebel camp (tents, fire, red banner): "+150" gold, "+60" food; then the "rebel envoys" banner with its two choices, the pointer refuses: renown "+1" |
| 14 | King talents | 19 | the King and his guards fight, the XP bar fills, level 2; the talent panel opens (two branches of four, one point), the first talent of the cry branch is taken; level 3, the first of the charge branch; a cry throws the zombies back |

   The amounts in the clips are examples (the market prices move in the game). New drawings: spike plate, rebel camp, barter slot, event
   banner, talent panel (a few rectangles each); the envoy has its own sprite set (4 walk frames).
   Chapter list: the rows shrink from 18 to 12 px so the 14 chapters show without scrolling (18 px at 1280x720); under that the list scrolls.
   At 390x700 there is no list: the header shows "12/14 title" and the previous / next buttons change the chapter, as before.
4. "Play the tutorial game" removed: the button (both layouts), `playTut`, the `settingsState` import, the key in the table, in NL / PL / TR
   and in `docs/studio-texts/guide.json`.

Texts: `docs/studio-texts/guide2.json` (20 keys: "Guide", 5 titles, 14 captions) added to the v93 block; NL, PL, TR in `i18n/langs/*.js`.
Tools: `tools/qa_shots.py` has steps `13a` to `13e` (the new chapters), `33_game_menu`, `34_guide_ingame`, `35_guide_closed`;
`openMenu` is a debug accessor; `__guide.n` is the number of chapters.

## Left to do / decisions for the King

- Look of the clips on a real GPU and a real phone (only headless captures were looked at).
- The sounds were not heard: the headless browser has no running audio, only the wiring was checked (every sound name exists, the build and
  the tests pass). Level (70 % of the game's), density and choice of sounds are for the King's ear. In co-op the game's own sounds go on
  under the guide.
- The amounts shown in the Market, Traps and Camps clips are examples, not read from the rules.
- If the guide is left open when a co-op game ends, the title shows the guide (Esc closes it).
- `tools/fitcheck.py` does not open the guide (captions are checked by `tools/textwidth.py`: 43 captions, 9 languages, all fit).
- PT / DE register and NL wording of the new captions follow the existing ones; not proofread by a native speaker.

## Old tutorial bar removed (King: the quests replace it)

Removed: the `TUTS` steps, `tutStart`, `tutEnd`, `tutBar` (`ui/tutorial.js`), the `tutBar` call in `ui/hud.js` (now `bossY+=hintBar(...)`),
the `tutStart()` call in `gameplay/reset.js`, `TUT` in `gameplay/traps.js` and its test in `hintBar`, the "Tutorial" line of Settings
(`tutOn` / `tutSet`), every read or write of the `dk_tut` key (also in `tools/announce_shots.py`). `hintBar` and its three hints stay.
The translations of the five old step texts stay in the table (three of them are still the tips of the day and guide captions).
A `dk_tut` value already stored in a browser is simply ignored.
