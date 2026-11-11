# Quest line (guide for a first game)

Request of the King: "add quest in game to guide new player". Lot 1: 16 solo quests. Lot 2 (decided by the King): quests in co-op too,
quests replace the 5-step tutorial bar, amounts / order / names adjusted, quests for market, guild, siege and envoy.
Branch of worktree hd-gameplay, nothing under `game/`, nothing pushed.

## What the player sees
- A small panel top left under the resource bar: `Quest 3/20`, title, one line of what to do, progress bar and `2/5`, the reward.
  When a quest completes: green check mark, "Quest complete!", the reward, the `coin` sound and the message line; 5 s later the next quest shows.
- `[Log]` opens the quest log (every quest by chapter, done / active / to come, rewards, the line of the active quest). Esc or `Close` closes it.
- `[x]` folds the panel into a small `Quests 3/20` button (kept per player in localStorage `dk_qhide`); the log has `Show panel` / `Hide panel`.
- Off switch: `Turn quests off` in the log, and `Quests` On / Off in Settings > Game. In solo the choice is also the default of the next new solo game (`dk_quests`).
- Co-op: one line shared by both players; the panel sits on the left 38 px under the top bar, the shared goals line (`objBar`) stays centred on the first row under the top bar, so they never share a row.

## The 21 quests (one active at a time, in this order; 20 in a solo game)
| # | id | chapter | title | completes when | reward (each player) |
|---|---|---|---|---|---|
| 1 | wood | First steps | Gather wood | 40 wood gathered since the quest started | +20 gold |
| 2 | ore | First steps | Stone and gold | 30 stone and 30 gold gathered | +20 wood |
| 3 | house | A village | A roof for your people | 1 finished house | +30 wood |
| 4 | farm | A village | Fill the granary | 1 finished farm | +30 food |
| 5 | barracks | An army | Raise a barracks | 1 finished barracks | +40 gold |
| 6 | knights | An army | First knights | 2 knights alive | +40 gold |
| 7 | archers | An army | Bows on the wall | 2 archers alive | +30 wood |
| 8 | walls | Defences | Close the road | 6 finished walls and 1 gate | +40 wood |
| 9 | tower | Defences | Eyes on the road | 1 finished tower | +30 gold |
| 10 | traps | Defences | Sharp welcome | 3 spike traps in place | +30 gold |
| 11 | wave1 | Defences | The first night | wave 1 over | +60 gold |
| 12 | market | Trade and craft | Open for trade | a market built (1/2), then one sale, purchase or swap done (2/2) | +40 wood |
| 13 | guild | Trade and craft | Master builders | a builders guild built (1/2), then at least one builder, repairer or terraformer asked for (2/2) | +40 wood |
| 14 | research | Trade and craft | Knowledge | an academy built (1/2), then any research finished (2/2) | +60 gold |
| 15 | king | The crown | Long live the King | the King is on the field | +50 food |
| 16 | skill | The crown | Royal might | War cry or Royal charge used once | +40 gold |
| 17 | wave5 | The crown | Hold the line | wave 5 over | +100 gold |
| 18 | siege | Beyond the walls | Engines of war | Masonry researched (1/2), then a ballista or trebuchet finished or a cannon trained (2/2) | +60 stone |
| 19 | envoy | Beyond the walls | Friends in the wild | an embassy built (1/2), then a rebel camp paid a tribute to an envoy (2/2) | +60 gold |
| 20 | convoy | Beyond the walls | Share the load (co-op only) | a convoy delivered to the partner | +30 food |
| 21 | wave10 | Beyond the walls | The last bastion | wave 10 over | +150 gold |

Totals per player over the whole line: 630 gold, 200 wood, 60 stone, 110 food (solo: 80 food, no convoy quest).
Before the first wave (quests 1 to 10): 160 gold, 120 wood, 30 food (about one knight: 150 gold, 30 stone, 40 food). For scale, the co-op goal "wave 5" alone pays 150 gold, 100 wood, 100 stone to each player.
Changes against lot 1: tower pays gold instead of stone (+30 gold: the traps that follow cost gold), research moved after the market and the guild, wave 5 before the siege, four new quests plus the co-op convoy, chapter "Power" split into "Trade and craft", "The crown", "Beyond the walls"; three lines reworded to carry what the tutorial bar said.
Things already done when a quest becomes active complete it at once (one quest per tick).
A quest that cannot be done in this game is passed without reward (state 2, a dash in the log): envoy when the map has no rebel camp left and no tribute was ever paid; convoy when there is no second castle.

## Where the state lives, and the rules it follows
- `gameplay/quests.js`: `QUESTS` (definitions, each with a stable `id`), `questsState.Q = {v:2, on, d:{id: 1 done | 2 passed}, a:[gold, wood, stone gathered since the active quest started], e:{tr, cv}, dt, last}`.
  The active quest is the first of the list whose id is not in `d` (`qCur()`); `e` counts trades done (`qNote('tr')` in `economy.js` `trade`) and convoys delivered (`qNote('cv')` in `convoys.js`); `dt` / `last` = time and id of the last completion (5 s check mark).
- Simulation: `qBegin()` / `qTick()` are called by the update wrapper in `gameplay/statistics.js` around `update0` (same place as `objTick`).
  Only simulation state is read (structures, units, `SPK`, `RS` / `RS2`, `ROLE`, `BASES[].envN`, `waveN` / `waveOn`, what the step added to the stocks, `Q.e`); no random number, no clock, one quest checked per tick, lookups by id only.
- Co-op: the line is shared. Structures and units of both players count, what both gather counts, and a reward is paid to BOTH players (`RESP[0]` and `RESP[1]`), as `multiplayer/objectives.js` does. A co-op game always starts with the line on (a local preference must not make the two machines differ).
  The switch is a lockstep command: `questSwitch(on)` in `multiplayer/commands.js` pushes `{k:'qs',on}`, `case 'qs'` in `mpExec` calls `qSetOn0`; the partner sees "… turned the quests off / on". The quest state is part of the lockstep hash (`mpHashX` in `lockstep.js`), so a divergence shows at the next check.
- Save and resync: `SAVA.QST` (`persistence/save-format.js`), cleaned by `qFix`. A resync snapshot is a save, so it carries the line.
  - save without `QST` (older build): the line is OFF and at quest 1 (`persistence/restore.js` assigns the default); the player can turn it on.
  - save of lot 1 (`{v:1, i}` = index into the 16 quests of that build): the first `i` ids of that list are marked done, so the new quests (market, guild, siege, envoy) show up in their place and nothing is paid twice.
  - unknown ids are dropped; no `SVVER` change (new field, tolerant of absence).
- New game: `qReset()` in `reset()` (solo: on or off from `dk_quests`; co-op: on).
- Test mode (F10, solo): no progress and no reward while `DEVU` is on, like the achievements; the panel is hidden.
- UI: `ui/quest-panel.js` (`questPanel`, `questLog`), hooks in `ui/hud.js` (2 lines), Esc in `input/desktop.js`, the row in `ui/settings.js`.
- Texts: `docs/studio-texts/quests.json` (lot 1: 54 keys, lot 2: 18 keys, v92 block). Lot-1 keys no longer used stay in the table (harmless).
- Tests: `tests/quests.js` (`npm test -- quests`, quick suite): order and rewards, new quests, off switch, test mode, same run twice, save round trip, lot-1 saves, saves without quests,
  co-op on one machine (starts on, same hashes twice, switch = command, snapshot keeps the state). `tests/mp8.py` (two clients) now also checks that both machines hold the same quest state and that the guest's switch command lands on both;
  `tests/mp_resync.py` corrupts the quest state of the guest too and requires both to be equal after the resync.

## The old tutorial bar (to unhook by the coordinator; `ui/tutorial.js` and `ui/title-menu.js` were not touched)
What the five `TUTS` steps taught, and where it is now:
1. select peasants, double-click takes them all -> quest 1 line ("Double-click a peasant to select them all, then right-click a tree"); selection itself is not a quest (local state, not simulation).
2. right-click a tree, a rock or gold -> quests 1 and 2.  3. build a house for the population limit -> quest 3.
4. train a knight, knights fight the zombies -> quest 6.  5. walls or a tower, zombies follow the red lines -> quests 8 and 9.
To remove with the bar: the `tutBar(...)` call in `ui/hud.js` (the line `{const tb=tutBar(...);bossY+=tb||hintBar(...)}` becomes `bossY+=hintBar(...)`), `tutStart()` in `gameplay/reset.js`,
`TUT` in `gameplay/traps.js` (and its use in `hintBar`: `if(TUT.on||...)`), the `Tutorial` On / Off row and `tutOn` / `tutSet` in `ui/settings.js`, the localStorage key `dk_tut`,
the texts `Tutorial {n}/{m}`, `Skip`, and the five step lines. `hintBar` (the three one-line hints) is separate and worth keeping.

## Not covered
- Found, not fixed: in `ui/hud.js` the calls `objBar`, `kingBar`, `tutBar`, `hintBar` sit inside the `if(wavesState.WAVEZ>0&&!sessionState.over){...}` block (its brace closes after `hintBar`, since the module migration a022204), so the co-op goals line, the King buttons, the tutorial bar and the hints are drawn only during a raid. The quest panel is outside that block. Moving one brace fixes it; left to the coordinator because it changes what every player sees.
- The convoy quest was not played in a real two-castle co-op game (the two-client tests do not send a convoy with quests that far).
- No pointer or highlight on the button to press (the line of text is the only guidance).
- Stone upgrade of buildings, talents of the King, terraforming, ruins, events: no quest.
- Touch layout and narrow screens: laid out by rule (two columns in the log when rows would be under 11 px), not looked at. On a narrow co-op screen the King bar or the tutorial bar can reach the panel's rows.
- Dutch, Polish, Turkish (`i18n/langs/`): the new keys fall back to English.
- Trap quest counts traps in place: traps worn out by zombies no longer count (in practice the quest comes before the first wave).
- Gather counters count what the step adds to the stocks: a market purchase or a convoy received also counts as "gathered".
