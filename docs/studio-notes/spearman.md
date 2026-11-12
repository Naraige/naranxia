# Spearman (lancier): new trained unit

Asked by the King ("we see the spearman in the menu where are they in game ?", then "oui tu peux creer le lancier").
Branch `worktree-agent-a32a61bc6cb6d6ef9`, from `release-v84`. Not merged, not shipped, nothing under `game/`.

## Numbers (`gameplay/rules.js`, `initializeRules`)

| | Knight | Spearman | Archer |
|---|---|---|---|
| Health | 130 | **85** | 45 |
| Damage / cooldown | 16 / 0.8 s | **11 / 1.0 s** | 9 / 1.0 s |
| DPS | 20 | **11** (17.6 against brute and boss) | 9 |
| Reach (`rng` + own radius) | 14 + 10 = 24 | **36 + 7 = 43** | 120 + 6 |
| Speed | 110 | 108 | 100 |
| Cost | 150 g, 30 s, 40 f | **90 g, 30 w, 25 f** | 120 g, 30 w, 30 f |
| Cost, all resources added | 220 | **145** | 180 |
| Training (x0.65 at the barracks) | 22 s | **15 s** | 16 s |
| Population | 1 | 1 | 1 |
| Cost per HP | 1.69 | 1.71 | 4.0 |
| Cost per DPS | 11.0 | 13.2 (8.2 against brute and boss) | 20 |
| Gold per DPS | 7.5 | 8.2 | 13.3 |
| Cleave on the husk swarm | 3 | 2 | line of 3 |
| Shield | yes (visual) | none | none |

- Bonus against big targets: `SPEAR_BIG = 1.6` in `hit()` (`gameplay/combat.js`), when the target is a brute or carries `boss` (the wave boss is a brute).
- Reach 43: a spearman one rank behind a knight still strikes (formation rows are 26 px apart, a zombie stops 16 px from the knight's edge).
  It stays short of a wall tile (40 px + radius): no poking through walls.
- Weak to acid by health alone, no special rule: one splash + burn at wave 10 is 5 + 4 s x 5.5 = 27 damage, 21 % of a knight, 32 % of a spearman.
- Available from the start, at the barracks (second slot, after the knight). No stone in the cost: stone stays for masonry.

## Why it does not bend the difficulty curve

- Per resource against ordinary zombies he is worse than the knight (13.2 against 11.0 per DPS, same per HP).
- Per head (population is what limits the late game) he is worse than the knight against everything, brutes included (17.6 DPS against 20, 85 HP against 130).
- He is better only per resource against brutes and bosses, and by reach in a narrow place.

Measured in the simulation (`update(.05)`, seed 7, open ground, no research, all on "aggressive"):

| Army | 14 zombies | 2 brutes + 6 zombies | 3 brutes |
|---|---|---|---|
| 6 knights (1320) | win 9.8 s, 5 left, 342 HP | lost, 981 / 1190 damage | lost, 928 / 1290 |
| 9 spearmen (1305) | win 12.1 s, 6 left, 286 HP | win 14.1 s, 5 left, 234 HP | win 16.0 s, 3 left, 123 HP |
| 4 knights + 3 spearmen behind (1315) | win 12.3 s, 5 left, 341 HP | lost, 985 / 1190 | lost, 1020 / 1290 |
| 6 spearmen (same heads as 6 knights) | lost, 495 / 770 | lost, 653 / 1190 | lost, 634 / 1290 |

Reading: at equal cost knights are better against the common horde, spearmen against brutes; at equal population knights always win.
The mid game (resources short, population free) gets easier against brutes; `SPEAR_BIG` is the knob (1.4 would bring 9 spearmen close to 6 knights against 3 brutes).

## Where the type is wired

- Rules: `T`, `C`, `TRAIN`, `SPEAR_BIG` (`gameplay/rules.js`); bonus in `hit()` (`gameplay/combat.js`); formation rank between knights and archers (`FPRI`, `gameplay/formations.js`).
- Training goes through the existing `buy` / `train` command (any key of `T` / `C`), so co-op needs no new command. Population 1 (`popOf` default).
- Research: iron, steel, forge, era (damage) and plate, mail (damage taken) apply to every unit of the player, spearman included. Promotion ranks (XP) too.
- Menus: barracks Train list, name, tooltip (`ui/build-menu.js`); troop panel order and plural (`ui/troop-panel.js`); unit card role and flavour, "(melee)" label now up to range 40 (`ui/unit-card.js`).
- Hotkey: `F4` by default since v93 (was `\`), rebindable in Settings > Keys (`ui/settings.js`, `input/desktop.js`). See "Lot 2" below.
- Icons: head icon and 3D icon (`rendering/pixel-icons.js`, `rendering/model-icons.js`); fog sight 11, selection ring.
- Save: units are saved whole, nothing new in `SAVA`. Old saves load unchanged (no spearman in them). A save with spearmen needs this build or later.
- Rebel camps: they train spearmen since v93, in a share set by their trait (see "Lot 2" below). v92 camps trained knights and archers only.
- A spearman turned by the horde rises as a soldier zombie (`rendering/models/zombies.js`, `zombie-skins.js`), like a knight.

## Look

- Skin `px2Spearman` (`rendering/models/unit-skins-v2.js`), units look B: MC player model, wide kettle helmet (brim + crown cubes), padded jack quilted in the kingdom colour,
  cream arming collar (cube), leather baldric and belt, bedroll on the back (cube), leather gloves and boots, no shield.
  Armour research: steel spaulders at level 1, gold band on the helmet at level 2.
- Spear `g2Spear` (`rendering/models/gear2.js`), gear look B palette: leaf blade, steel socket, gold collar, pennant in the kingdom colour, ash haft, leather grip, iron foot; 48 px above the fist, 11 below.
  Key `spear` in `GEAR2_ON`; with the gear switch off the same model is used (one design only).
- Animation (`rendering/unit-animation.js`): the royal guard's halberd drill: upright at rest, thrust with a lunge to attack; on the march the spear slopes back over the shoulder.
- Title screen (`rendering/models/title-army.js`): the pike blocks are now spearmen holding this spear upright; the old `pikeGeo()` is removed.
- Our own design; nothing copied from a third-party model.

## Not done / open

- No rank stripes on the sleeves (knights and archers only, `rkOf`).
- No look A skin: with `UV2_ON` off he would wear the old generic armour.
- Left hand does not hold the shaft; the pennant does not wave.
- `tools/fitcheck.py` not run (no new button text; the tooltip has 4 lines).

## Lot 2 (v93, issue #24): rebel spearmen and the F4 key

The King said "fait le tout" about the open points. Decided for him: bonus x1.6 and price stay.

### Rebel camps (`ai/kingdoms.js`)

- The rebel camps of the game are the AI kingdoms (`b.ai`, 4 per world, plus the settlements they found). They are the only AI force that
  fields knights or archers. `matBase` / `unmatBase` (the old static camps) are never called: left as they were.
- Share of spearmen among the melee fighters (knights + spearmen) of a camp, by trait: `spearN(b,n) = n<2 ? 0 : max(1, floor(n / SPEAR_DIV[trait]))`.

| Trait | Idea | Share | Melee 2 | 4 | 6 | 9 (grown camp) |
|---|---|---|---|---|---|---|
| merchants | they pay for knights | 1 in 4 | 1 | 1 | 1 | 2 |
| wary | spears hold the gate | 1 in 3 | 1 | 1 | 2 | 3 |
| warlike | a levy host | 1 in 2 | 1 | 2 | 3 | 4 |

- Training (`aiTick`, every 8 s with a barracks): archers first as before (2 per tower, at most 60 % of the soldiers), then a spearman
  when the camp holds fewer than `spearN(b, melee + 1)`, else a knight. A fallen spearman is replaced by a spearman.
  A camp is founded with 2 knights as before, so its first barracks soldier is a spearman (the third melee fighter), whatever the trait.
- Camp price `AIC.spearman = {g:30, w:10, f:15}` (camp knight 50 g 20 f, camp archer 35 g 15 w 20 f): same ratio to the knight as the player's prices.
- Number of soldiers of a camp unchanged (`sW`): spearmen take knight places 1 for 1. A camp is a little weaker against the common
  horde (85 HP against 130 per place taken) and stronger against brutes and bosses (17.6 DPS with reach 43 against 20 at reach 24).
- Fighting: `aiUnit` already used `d.rng + d.r`, so the rebel spearman strikes at 43 px; `SPEAR_BIG` in `hit()` has no team test, so it applies.
  Research and ranks do not apply to camp units (unchanged). A camp that falls turns its spearmen into soldier zombies (`aiFall`, `zk`).
- Determinism: no RNG added (the share is a pure function of the trait, itself a hash of world seed and camp id); `aiSpawn` draws the same
  random numbers for a spearman as for a knight. Nothing new in `SAVA`: units are saved whole, the trait is on the camp. A v92 save loads
  unchanged (its camps keep their knights and train spearmen from then on). A save with rebel spearmen loads in v92 too (the unit exists there).
- `det`: the hashes change from the third sample on (tick 2250: a camp trains its first spearman instead of a knight); the two runs stay equal.
  The reference is the list in the journal entry of v93 (the test itself only compares two runs).

### Hotkey F4 (`ui/settings.js`, `input/desktop.js`)

- Keys are matched by `e.key.toLowerCase()` (the character, not the physical key). Every letter is taken, and so is every character that is one
  plain press on both QWERTY and AZERTY (`,` `;` `=` `-` `'`). So the default is a function key: `F4` is unused by the game (F1 help, F2 troops,
  F8 report, F10 test mode) and by browsers (F3 find, F5 reload, F6 address bar, F7 caret, F11 full screen, F12 tools). The game prevents the
  browser default on a bound function key.
- `loadKB()`: defaults, then the saved keys (`dk_keys`). Once per browser (marker `dk_keyv` = 2): saved keys that still hold `\` for the
  spearman move to F4, unless F4 was given to another action. After that a player who chooses `\` keeps it. "Reset keys" gives F4.
- The barracks button shows no key for the spearman (`hkShow` shows digits, `.` and `Q` only), as before.

### Tests

- `tests/spearman.js`: share rule; three camps grown (4 houses, barracks, 2 towers, 4 farms, storage) with the three traits, their training
  run (`campDebug` in `ai/kingdoms.js`, exposed by `debug/browser-console.js`), counts checked against the rule, a fallen spearman and a fallen
  knight replaced in kind, a rebel spearman hits a brute for 17.6 at 46 px, 20 s of simulation; F4 default unique, F4 pressed with the barracks
  selected queues a spearman, migration of saved keys (4 cases).

### Found on the way, not changed

- AZERTY: the digit keys of the defaults (peasant 1, knight 2, archer 3 ... house 0, and the stances 1 to 4) need Shift on AZERTY, and Shift + digit
  is taken by the control groups (`input/control-groups.js` matches `e.code` `Digit1-9` with Shift and stops the event). Read in the code, not
  tried on a real AZERTY keyboard. Fix proposed: match the digit actions by `e.code` (`Digit1` ...), so the same physical key works on both layouts.
- `[` `]` (forester, guild) need AltGr on AZERTY; `:` (market), `<` `>` (King skills) need Shift on QWERTY.
- `-`, `=`, `,` and `p` have a second hard-coded use in `input/desktop.js` (zoom, idle peasants, pan mode) next to their rebindable action.
