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
- Hotkey: `\` by default, rebindable in Settings > Keys (`ui/settings.js`, `input/desktop.js`). Every letter and digit was taken.
- Icons: head icon and 3D icon (`rendering/pixel-icons.js`, `rendering/model-icons.js`); fog sight 11, selection ring.
- Save: units are saved whole, nothing new in `SAVA`. Old saves load unchanged (no spearman in them). A save with spearmen needs this build or later.
- AI kingdoms and rebel camps: unchanged on purpose (they still train knights and archers), so the default game holds no spearman and the `det` hashes are the same.
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
- Dutch, Polish and Turkish (`i18n/langs/`) fall back to English for the 8 new texts.
- `tools/fitcheck.py` not run (no new button text; the tooltip has 4 lines).
- Rebel camps and AI kingdoms with spearmen: would change `det` hashes and the balance of camps; left to the King.
