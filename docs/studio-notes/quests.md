# Quest line (guide for a first game)

Request of the King: "add quest in game to guide new player". Branch of worktree hd-gameplay, nothing under `game/`, nothing pushed.

## What the player sees
- A small panel top left under the resource bar: `Quest 3/16`, title, one line of what to do, progress bar and `2/5`, the reward.
  When a quest completes: green check mark, "Quest complete!", the reward, the `coin` sound and the message line; 5 s later the next quest shows.
- `[Log]` opens the quest log (all 16 quests by chapter, done / active / to come, rewards, the line of the active quest). Esc or `Close` closes it.
- `[x]` folds the panel into a small `Quests 3/16` button (kept per player in localStorage `dk_qhide`); the log has `Show panel` / `Hide panel`.
- Off switch: `Turn quests off` in the log, and `Quests` On / Off in Settings > Game. The choice is also the default of the next new game (`dk_quests`).

## The 16 quests (one active at a time, in this order)
| # | chapter | title | completes when | reward |
|---|---|---|---|---|
| 1 | First steps | Gather wood | 40 wood gathered since the quest started | +20 gold |
| 2 | First steps | Stone and gold | 30 stone and 30 gold gathered | +20 wood |
| 3 | A village | A roof for your people | 1 finished house | +30 wood |
| 4 | A village | Fill the granary | 1 finished farm | +30 food |
| 5 | An army | Raise a barracks | 1 finished barracks | +40 gold |
| 6 | An army | First knights | 2 knights alive | +40 gold |
| 7 | An army | Bows on the wall | 2 archers alive | +30 wood |
| 8 | Defences | Close the road | 6 finished walls and 1 gate | +40 wood |
| 9 | Defences | Eyes on the road | 1 finished tower | +40 stone |
| 10 | Defences | Sharp welcome | 3 spike traps in place | +30 gold |
| 11 | Defences | The first night | wave 1 over | +60 gold |
| 12 | Power | Knowledge | academy built, then any research finished | +60 gold |
| 13 | Power | Long live the King | the King is on the field | +50 food |
| 14 | Power | Royal might | War cry or Royal charge used once | +40 gold |
| 15 | The long night | Hold the line | wave 5 over | +100 gold |
| 16 | The long night | The last bastion | wave 10 over | +150 gold |

Totals over the whole line: 540 gold, 120 wood, 40 stone, 80 food. Before the first wave (quests 1 to 10): 130 gold, 120 wood, 40 stone, 30 food
(less than one knight: 150 gold, 30 stone, 40 food). For scale, the co-op goal "wave 5" alone pays 150 gold, 100 wood, 100 stone to each player.
Things already done when a quest becomes active complete it at once (one quest per tick).

## Where the state lives, and the rules it follows
- `gameplay/quests.js`: `QUESTS` (definitions), `questsState.Q = {v, on, i, a:[gold, wood, stone gathered since the active quest started], dt}`;
  `i` = number of quests done = index of the active one, `dt` = sim time of the last completion (for the 5 s check mark).
- Simulation: `qBegin()` / `qTick()` are called by the update wrapper in `gameplay/statistics.js` around `update0` (same place as `objTick`).
  Only simulation state is read (structures, units, `SPK`, `RS` / `RS2`, `waveN` / `waveOn`, the resources the step added); no random number, no clock, one quest checked per tick.
- Save: `SAVA.QST` (`persistence/save-format.js`), cleaned by `qFix`. A save without `QST` (older build) loads with the line OFF and at quest 1
  (`persistence/restore.js` assigns the default), so an old kingdom does not cash 16 rewards at once; the player can turn it on in the log or Settings. No `SVVER` change (new field, tolerant of absence).
- New game: `qReset()` in `reset()`, on or off from the local preference `dk_quests`.
- Solo only. `qTick` returns while `MP.on` (the same on both machines, so co-op hashes do not move; `Q` still travels in a resync snapshot, unused).
  Co-op already has its shared goals bar (`multiplayer/objectives.js`).
- Test mode (F10): no progress and no reward while `DEVU` is on, like the achievements; the panel is hidden.
- The On / Off switch writes `Q.on` directly: a solo player action (solo actions do not go through `mpPush`). If quests ever run in co-op it must become a command.
- UI: `ui/quest-panel.js` (`questPanel`, `questLog`), hooks in `ui/hud.js` (2 lines), Esc in `input/desktop.js`, the row in `ui/settings.js`.
  `ui/tutorial.js` and `ui/title-menu.js` are untouched.
- Texts: `docs/studio-texts/quests.json` (54 keys added to the v92 block; "The last bastion" existed already).
- Test: `tests/quests.js` (`npm test -- quests`, added to the quick suite): order and rewards, gather counters, off switch, co-op and test mode inert,
  the same run twice gives the same log, save round trip, old save without `QST`.

## Not covered
- Convoy (co-op only) and envoy (needs an embassy, late): no quest. Market, guild, siege, stone upgrade, talents of the King: no quest.
- Co-op: no quests (decision above). Touch layout and narrow screens: laid out by rule (two columns in the log when the screen is low), not looked at.
- The five-step tutorial bar (`ui/tutorial.js`) still runs the first time, centred at the top; the quest panel sits to the left and lower so they do not overlap at 1280x720. They say partly the same thing: the King may want only one.
- Dutch, Polish, Turkish (`i18n/langs/`): the new keys fall back to English.
- No pointer or highlight on the button to press (the line of text is the only guidance); no quest that needs a named menu tab.
- Trap quest counts traps in place: traps worn out by zombies no longer count (in practice the quest comes before the first wave).
