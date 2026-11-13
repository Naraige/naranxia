# Naranxia: guide for Claude

Naranxia is a browser strategy and tower defence game with solo play and two-player co-op, built with Three.js r128.
It was made by Naraige ("King Naraige", after whom the King unit is named).
Talk to him in French, briefly, one line per point. He plays the builds himself and reports bugs and wishes in lists.
He wants sessions cheap: follow "Working efficiently" below and log every batch in `docs/JOURNAL.md`.

## Start of a session (do this, nothing more)

1. Read the top 2 entries of `docs/JOURNAL.md` (newest first): state, what was verified, what is left. Trust it: do not re-check what it says is verified.
2. Open issues = the backlog: `gh api 'repos/Naraige/naranxia/issues?state=open&per_page=50' --jq '.[]|"#\(.number) [\(.labels|map(.name)|join(","))] \(.title)"'`.
3. Run `npm ci` when dependencies need installing, then `npm run build`.
A list from the King goes into issues first (one per item, labels below), then into a batch.

## Repository

| path | what |
|---|---|
| `packages/game/src/` | game implementation by system, with browser startup in `main.js` |
| `packages/game/src/i18n/translations.js` | translations, one key per line. Add keys with `tools/addtexts.py` |
| `packages/game/index.html` | browser entry point |
| `dist/naranxia.html` | generated compressed game, attached to the GitHub release |
| `game/VERSION`, `game/NOTES.md` | release version and player-facing notes |
| `docs/JOURNAL.md` | what was done, verified and decided, per batch (newest first) |
| `apps/desktop/` | Electron launcher, save bridge, and platform installers. The launcher checks the latest GitHub release at startup |
| `announce/` | Discord texts `vNN.md`; pushing a change to `announce/QUEUE` reposts the versions it lists |
| `tools/` | build, release, test, translation, and preview tools |
| `tests/` | headless tests (see below) |

## Build, test, and release

```sh
npm run dev                    # load ES modules from the development server
npm run build                  # build dist/naranxia_readable.html
npm run build:release          # also build dist/naranxia.html for releases
npm run quality                # ESLint, Prettier and architectural dependency checks
npm test                       # quick suite, logs in dist/test-logs/
npm test -- --full             # quick suite plus deep resync and 6000-tick co-op soak
npm test -- det mp8            # select tests by name
python3 tools/run.py X.js [out.png|-] [W H wait] [html]   # evaluates the JS function in X.js inside the loaded game
python3 tools/fitcheck.py 1280 720 x 9                    # button text overflow in every language (after npm run build; slow, run in background)
python3 tools/profile.py                                  # CPU profile of 6000 sim ticks (after npm run build); hashes must not change
python3 tools/repro.py report.json [sec] [after.png]      # opens a player's bug report (F8): errors, screenshot, replays the save
python3 tools/addtexts.py texts.json                      # {"English": [FR, ES, DE, IT, PT]} into the block of the next version
node tools/textaudit.mjs [--notes]                        # static text audit; --notes: every line of game/NOTES.md must be translated (release.sh runs it)
node tools/langcheck.mjs                                  # NL, PL, TR tables (i18n/langs/*.js): missing keys, placeholders, glued plurals
python3 tools/qa_shots.py dist/qa/NAME [steps]            # many screenshots in one page load (title, guide, quests, HUD...)
python3 tools/announce_shots.py                           # the 4 announcement pictures, written to dist/announce-shots/
node tools/test_all.mjs det ui                            # run tests without rebuilding (npm test rebuilds first)
bash tools/release.sh vNN "title"                         # bump, build, test, commit, and push (see Releasing)
bash tools/ci_status.sh [--wait]                          # GitHub Actions runs (tests, release)
```

Tests: `smoke` (packed build plays a wave), `det` (same game twice = same hashes), `tools` (test mode and bug report), `features` (v91 features: seasons, traps, boss, king skills, stats, goals),
`mp8` / `mpk` (2 headless co-op clients: economy, research, waves / king, guards, fights; FIRST DIVERGENCE on a desync),
`mp_resync` (one machine corrupted on purpose, the auto resync must fix it), `mp_convoy` (convoy delivered at the same tick on both),
`mp_quests` (co-op quests paid to both, fixed world), `mp_events` (events and a resync in co-op), `quests`, `spearman`, `ui` (keys on QWERTY and AZERTY, quest arrow, banners),
`save` (save / load round trip and continuation must match; shared terrain references must survive restore), `waves` (routing and stuck-wave safety),
`mp_build` (guest/host placement and ownership), `runner` (test-result contracts), `desktop` (preload/save bridge).
`--full` also runs `mp_resync_deep` (five corruption/recovery cases) and `mp_soak` (6000 ticks without divergence or resync).
GitHub runs quality checks and the quick suite on every push touching code (`.github/workflows/test.yml`) and before every release.
The packed build is deterministic (terser + zopfli). See `CONTRIBUTING.md` and `docs/ARCHITECTURE.md` for coding and ownership rules.

## Releasing a version

The King chose "versions directes": code a batch, test it, release it as the next version (no extra go-ahead needed for a batch he asked for).

1. Edit the relevant modules under `packages/game/src/`. Rewrite `game/NOTES.md` (3 to 8 short bullets for players, in English). Add the journal entry `## YYYY-MM-DD · vNN` on top of `docs/JOURNAL.md`.
2. Run locally only the tests the change touches (gameplay: `det mp8 mpk`, co-op: `mp_resync`, visuals: a screenshot).
3. `COMMIT_TRAILER="<attribution lines>" bash tools/release.sh vNN "title"` then `bash tools/ci_status.sh --wait`:
   GitHub runs all the tests, then creates release vNN (the launchers update themselves) and posts the notes on Discord.
4. When green: publish `dist/naranxia.html` to the claude.ai artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 (same URL every time).
5. Close the issues of the batch (`gh api -X PATCH repos/Naraige/naranxia/issues/N -f state=closed`), tell the King in French, one line per point.

## Working efficiently (the King asked to keep usage low)

- Use the source map in the README and `rg --max-columns 180 NAME packages/game/src` to find the owning module.
- Send long outputs to files under `dist/`. The test runner prints one line per test.
- Headless WebGL is slow: stub `renderer.render` when no picture is needed (as `tests/mp*.py` and `tools/repro.py` do).
  Screenshots only for visual changes, 1280x720, look once.
- Let GitHub run the full suite; locally run the tests of what changed.
- One conversation per batch; the journal and the issues carry the memory between conversations.
- Before building: `ls node_modules/esbuild` (a stale `node_modules` makes `npm run build` fail and leaves an old `dist/`); run `npm ci` if missing.
- CI logs (`actions/jobs/ID/logs`) can be read with `gh api`, but the `test-logs` artifact download is blocked: find the failing test in the job log (`grep -aE "PASS|FAIL"`).
- The swarm (`gameplay/swarm.js`, everything inside `swUpdate`) is about 65 to 70 % of the wall time of the 6000-tick profile scenario; `swStep` alone is ~35 to 40 % of script time
  (the old "20 %" counted `(program)`). Tuned in v93 (tables, flat way points, set bits): further gains need a change of behaviour. Measure with `tools/profile.py` before touching it.
- Headless tests that `await` must stub `renderer.render`, or every await costs a software-rendered frame. Under load a headless page load takes 2 to 4 minutes.
- Release notes: write `game/NOTES.md`, then add each line's translations (`tools/addtexts.py` for FR ES DE IT PT, `i18n/langs/*.js` for NL PL TR), or `release.sh` refuses.
- `mp_convoy` is real-time bound (400 s budget in `tools/test_all.mjs`): a failure on CI alone is usually the slow runner.
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
- Every text shown to players goes through `T_()` / `L()` with its translations (EN, FR, ES, DE, IT, PT) in `i18n/translations.js`.
  Templates use `{0}`; `L()` also splits on ' - ', ' | ' and 3 spaces, not on ': '. French uses "vous", German "du", Portuguese is European.
  Dutch, Polish and Turkish live in `i18n/langs/{nl,pl,tr}.js` and must get every new key too.
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

## Runtime entry points

- `core/frame-loop.js` drives the game. `gameplay/simulation.js` runs the simulation and `gameplay/statistics.js` wraps each tick.
- `world/terrain.js` rolls the world and generates chunks. `world/traversal.js` and `world/pathfinding.js` handle movement queries.
- `multiplayer/lockstep.js` advances co-op ticks. `multiplayer/commands.js` dispatches player actions and `multiplayer/resync.js` handles snapshots.
- `persistence/save-format.js` defines `SAVA` and encodes the object graph. `persistence/restore.js` applies saves, and `persistence/save-storage.js` chooses browser or desktop storage.
- `rendering/frame.js` draws the game view. `rendering/title-scene.js` and `rendering/site-picker.js` draw the other scenes.
