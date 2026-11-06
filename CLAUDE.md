# Naranxia: guide for Claude

Naranxia is a browser strategy / tower-defence game (castle, peasants, army, zombie waves, 2-player co-op), one HTML file,
3D with Three.js r128, made by Naraige (the user, "King Naraige"; the King unit is named after him).
Talk to him in French, briefly, one line per point. He plays the builds himself and reports bugs and wishes in lists.
He wants sessions cheap: follow "Working efficiently" below and log every batch in `docs/JOURNAL.md`.

## Start of a session (do this, nothing more)

1. Read the top 2 entries of `docs/JOURNAL.md` (newest first): state, what was verified, what is left. Trust it: do not re-check what it says is verified.
2. Open issues = the backlog: `gh api 'repos/Naraige/naranxia/issues?state=open&per_page=50' --jq '.[]|"#\(.number) [\(.labels|map(.name)|join(","))] \(.title)"'`.
3. `npm ci` only if `node_modules/` is missing; then `bash tools/build.sh`.
A list from the King goes into issues first (one per item, labels below), then into a batch.

## Repository

| path | what |
|---|---|
| `src/game/NN_*.js` | the whole game, readable, in 31 ordered parts (joined in name order by the build into `dist/game.js`). **Edit these.** |
| `src/game/14_texts.js` | translations, one key per line; add with `tools/addtexts.py` |
| `src/shell.html` | HTML/CSS shell around the script (title, fonts, canvases, Three.js r128 from cdnjs) |
| `game/naranxia.html` | the shipped build (packed). Changing it or `game/VERSION` on `main` **publishes a release** (after the tests) |
| `game/VERSION`, `game/NOTES.md` | current version (`v91`) and the player-facing notes of that release |
| `docs/JOURNAL.md` | what was done, verified and decided, per batch (newest first) |
| `app/` | Electron desktop launcher: it downloads the `.html` of the latest GitHub release at start-up; `installers.yml` rebuilds the installers when `app/**` changes |
| `announce/` | Discord texts `vNN.md`; pushing a change to `announce/QUEUE` reposts the versions it lists |
| `tools/` | `build.sh`, `build_dist.mjs`, `test_all.sh`, `release.sh`, `ci_status.sh`, `addtexts.py`, `repro.py`, `board.py`, `run.py`, `fontroute.py`, `preview/` |
| `tests/` | headless tests (see below) |
| `wip/` | unreleased work (the Minecraft / Blockbench restyle), see `wip/restyle/README.md` |

## Build, test, release (from the repo root; node 18+, python3 with playwright and chromium)

```sh
bash tools/build.sh            # dist/game.js + dist/naranxia_readable.html + syntax check
bash tools/build.sh --dist     # + dist/naranxia.html (packed: what ships)
bash tools/test_all.sh         # quick suite, one line per test, logs in dist/test-logs/ (about 6 min)
bash tools/test_all.sh det mp8 # only some: smoke det tools features mp8 mpk mp_resync mp_convoy save
python3 tools/run.py X.js [out.png|-] [W H wait] [html]   # evaluates the JS function in X.js inside the loaded game
python3 tools/repro.py report.json [sec] [after.png]      # opens a player's bug report (F8): errors, screenshot, replays the save
python3 tools/addtexts.py texts.json                      # {"English": [FR, ES, DE, IT, PT]} into the block of the next version
bash tools/release.sh vNN "title"                         # bump, build, smoke, copy, commit, push (see Releasing)
bash tools/ci_status.sh [--wait]                          # GitHub Actions runs (tests, release)
```

Tests: `smoke` (packed build plays a wave), `det` (same game twice = same hashes), `tools` (test mode and bug report), `features` (v91 features: seasons, traps, boss, king skills, stats, goals),
`mp8` / `mpk` (2 headless co-op clients: economy, research, waves / king, guards, fights; FIRST DIVERGENCE on a desync),
`mp_resync` (one machine corrupted on purpose, the auto resync must fix it), `mp_convoy` (convoy delivered at the same tick on both),
`save` (save / load round trip, slow; same0 must be true, sameCont=false is known). GitHub runs the quick suite on every push
touching code (`.github/workflows/test.yml`) and before every release. The packed build is deterministic (terser + zopfli).

## Releasing a version

The King chose "versions directes": code a batch, test it, release it as the next version (no extra go-ahead needed for a batch he asked for).

1. Edit `src/game/`. Rewrite `game/NOTES.md` (3 to 8 short bullets for players, in English). Add the journal entry `## YYYY-MM-DD · vNN` on top of `docs/JOURNAL.md`.
2. Run locally only the tests the change touches (gameplay: `det mp8 mpk`, co-op: `mp_resync`, visuals: a screenshot).
3. `COMMIT_TRAILER="<attribution lines>" bash tools/release.sh vNN "title"` then `bash tools/ci_status.sh --wait`:
   GitHub runs all the tests, then creates release vNN (the launchers update themselves) and posts the notes on Discord.
4. When green: publish `dist/naranxia.html` to the claude.ai artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 (same URL every time).
5. Close the issues of the batch (`gh api -X PATCH repos/Naraige/naranxia/issues/N -f state=closed`), tell the King in French, one line per point.

## Working efficiently (the King asked to keep usage low)

- Don't explore: use the code map below, then `grep -n -o '.\{0,80\}NAME.\{0,80\}' src/game/*.js` (never print whole long lines).
- Edit the part files with Edit; no full-file rewrites, no re-reading files you just edited.
- Long outputs go to files (`> dist/x.log`), read with `tail`/`grep`. Tests print one line each through `test_all.sh`.
- Headless WebGL is slow: stub `renderer.render` when no picture is needed (as `tests/mp*.py` and `tools/repro.py` do).
  Screenshots only for visual changes, 1280x720, look once.
- Let GitHub run the full suite; locally run the tests of what changed.
- One conversation per batch; the journal and the issues carry the memory between conversations.
- Agent shell quirks: a bare `sleep` is refused (use `timeout N bash -c 'until COND; do sleep 5; done'` or a background run);
  the gh GraphQL API may be refused (use `gh api repos/...` REST, as `tools/ci_status.sh`).

## Rules

- The Discord webhook lives only in the GitHub secret `DISCORD_WEBHOOK`: never print, log, commit or paste it.
- Nothing ships (no change under `game/`, no Discord post) without the King's go-ahead for that batch ("versions directes" covers the batches he asks for).
- Co-op is lockstep over PeerJS: both clients run the same simulation from the same seed and exchange only player
  commands (`mpPush` then `mpExec`) and a state hash per tick (`mpChk`). Every gameplay change must stay deterministic:
  the simulation uses its seeded RNG, never `Math.random()` or `Date` inside `update()`, iterates in a stable order, and
  player actions go through commands (wrapper + `case` in `mpExec`, see `sendConvoy`). Visual helpers (`puff`, `snd`) use `REALR`.
- When the hashes differ the host freezes the lockstep, sends a snapshot (save format, `mpResync`), the guest loads it, then the host
  loads the same snapshot (`mpResApply`); command and hash messages carry an epoch (`MP.ep`). Anything that must survive a resync
  has to be in `SAVA` (the save registry) or on units / structures (saved whole).
- Every text shown to players goes through `T_()` / `L()` with its translations (EN, FR, ES, DE, IT, PT) in `14_texts.js`.
  Templates use `{0}`; `L()` also splits on ' - ', ' | ' and 3 spaces, not on ': '. French uses "vous".
- Test mode (F10) is solo only and blocks achievements and the best score (`DEVU`); the bug report (F8) only reads state.
- Art direction approved by the King: Minecraft characters made the Blockbench way: the MC player model (8 px head,
  8x12x4 body, 4x12x4 limbs, outer layer with transparent pixels) plus 2 or 3 extra cubes per unit, the detail in pixel
  textures; gear in the Blockbench item manner (voxel weapons; shields built like the Minecraft shield: 12x22x1 planks,
  iron rim, rivets, bracket handle). Take the style of a reference, never copy a third-party model.
  Visual choices go to the King as a review page (`tools/board.py`) published to https://claude.ai/artifact/HsTZDU2YgpyBYxceCBFiJr
  (same URL for every board), numbered rows of lettered variants; he answers with a code like "1A 2B".

## Issues (backlog)

Labels: `bug`, `idea`, `coop`, `ui`, `gameplay`, `restyle`, `needs-report` (waiting for an F8 report from the King).
Title in English, body: what he said (French is fine), version, solo/co-op. Commits say `Fixes #N` to close them.

## Code map (`src/game/`)

- `00_core` constants, unit stats `T`, error log; `01_world` `rollWorld`, terrain, `smChunk`, `freeTile`, passability `canStep` / `canStepZ` / `rampStep`, stairs
- `02_logic` `reset`, `mkU`, `build`, `train`, research (`RS`, `RS2`), market, castle placement rules; `03_units` unit AI, `hit`, `peasant`, shelter, convoys (`sendConvoy0`, `convoyStep`), roles, zombies (bomber, acid, fire, miner), `wave`
- `04_sim` swarm, night, `update(dt)`, `calcFD`, achievements `ach`, `saveBest`; `05_engine3d` renderer, surfaces, terrain meshes, props, fog
- `06_models_units` `humanKit`, items, `shieldGeo`; `07_models_buildings` `sGeo`; `08_render` fx, camera, overlays, `render3D`, `home`
- `09_pick_live` live castle placement view; `10_audio`; `11_ai` hordes and AI kingdoms; `12_title` title scene, site picker, `icoUnit`
- `13_ui_kit`, `14_texts` (translations), `15_i18n_icons` `L`, `T_`, languages, vector icons; `16_hud` `NAMES`, `TIPS`, menus, tasks (`assignJob`), panels (troops, convoy), `drawUI`, Esc menu
- `17_input` `startGame`, `loop`, input, `pickUnit`, `openMenu`; `18_coop` `MP`, `mpStart`, `mpBegin`, `mpMsg`, `mpExec`, `mpChk`, resync, lobby
- `19_extras` control groups, chat, typed pings, F-keys; `20_icons_mc` 3D icons; `21_save` `svEncode`, `svApply`, `SAVA`; `22_tools` bug report (F8), test mode (F10)
- `23_weather` seasons + weather (visual only, from `waveN`); `24_stats` end stats, records by map, the `update` wrapper (calls `update0` then `objTick`, `kingTick`, `trapTick`, `eraTick`); `25_boss` wave boss; `26_coop_goals`; `27_king_skills`; `28_traps` spike traps + boiling oil; `29_tutorial`; `30_touch`
- Early `let/const` (`GST`, `LH`, `OBJ`, `SPK`, `TUT`) live at the end of `00_core` because `reset()` runs while the parts load
