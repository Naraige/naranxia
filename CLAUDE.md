# Naranxia: guide for Claude

Naranxia is a browser strategy / tower-defence game (castle, peasants, army, zombie waves, 2-player co-op), one HTML file,
3D with Three.js r128, made by Naraige (the user, "King Naraige"; the King unit is named after him).
Talk to him in French, briefly. He plays the builds himself and reports bugs and wishes in lists.

## Repository

| path | what |
|---|---|
| `src/game.js` | the whole game, readable (about 5000 long lines, 850 KB). **Edit this.** |
| `src/shell.html` | HTML/CSS shell around the script (title, fonts, canvases, Three.js r128 from cdnjs) |
| `game/naranxia.html` | the shipped build (packed). Changing it or `game/VERSION` on `main` **publishes a release** |
| `game/VERSION`, `game/NOTES.md` | current version (`v88`) and the player-facing notes of that release |
| `app/` | Electron desktop launcher: it downloads the `.html` of the latest GitHub release at start-up; `installers.yml` rebuilds the installers when `app/**` changes |
| `announce/` | Discord texts `vNN.md`; pushing a change to `announce/QUEUE` reposts the versions it lists |
| `tools/` | `build.sh`, `build_dist.mjs`, `run.py` (headless test runner), `fontroute.py`, `preview/` (renders units, buildings and gear to images) |
| `tests/` | headless tests, see below |
| `wip/` | unreleased work (the Minecraft / Blockbench restyle), see `wip/restyle/README.md` |

## Build and test (from the repo root; node 18+, python3 with playwright and chromium)

```sh
npm ci                                   # once: terser, zopfli, three r128 and the fonts used by the tests
bash tools/build.sh                      # dist/naranxia_readable.html + syntax check
bash tools/build.sh --dist               # + dist/naranxia_min.html and dist/naranxia.html (packed: what ships)
python3 tools/run.py tests/smoke.js - 1280 720 300 naranxia.html   # loads the packed build and plays a wave
python3 tools/run.py tests/det.js        # the same game twice must give identical state hashes ("same":true)
python3 tools/run.py tests/save.js       # save / load round trip (slow: several minutes)
python3 tests/mp8.py naranxia_readable.html 40   # 2 headless clients in co-op: economy, research, waves; prints FIRST DIVERGENCE on a desync
python3 tests/mpk.py naranxia_readable.html 40   # co-op: king, royal guards, orders, fights
python3 tests/mp_resync.py naranxia_readable.html 120   # co-op: one machine is corrupted on purpose, the automatic resync must bring both back (RESULT OK)
```

`tools/run.py script.js` evaluates the function written in `script.js` inside the loaded game, so a test is plain game code.
Building `src/game.js` at v86 reproduces the shipped `game/naranxia.html` byte for byte (terser and zopfli are deterministic).

## Releasing a version

The King chose "versions directes": code a batch, test it, release it as the next version.

1. Edit `src/game.js`. Bump `game/VERSION` (`vNN`) and rewrite `game/NOTES.md` (3 to 8 short bullets for players, in English).
2. `bash tools/build.sh --dist`, run all the tests above, look at the game (screenshots with `tools/run.py`).
3. `cp dist/naranxia.html game/naranxia.html`, commit, push to `main`: `release.yml` creates release `vNN`
   (the launchers update themselves) and posts the notes on Discord.
4. Publish `dist/naranxia.html` to the claude.ai artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 (same URL every time).
5. Tell the King in French what changed, one line per point.

## Rules

- The Discord webhook lives only in the GitHub secret `DISCORD_WEBHOOK`: never print, log, commit or paste it.
- Nothing ships (no change under `game/`, no Discord post) without the King's go-ahead for that batch.
- Co-op is lockstep over PeerJS: both clients run the same simulation from the same seed and exchange only player
  commands (`mpPush` then `mpExec`) and a state hash per tick (`mpChk`). Every gameplay change must stay deterministic:
  the simulation uses its seeded RNG, never `Math.random()` or `Date` inside `update()`, iterates in a stable order, and
  player actions go through commands. Run `tests/mp8.py`, `tests/mpk.py` and `tests/mp_resync.py` after touching gameplay.
- When the hashes differ the host freezes the lockstep, sends a snapshot (save format, `mpResync`), the guest loads it, then the host
  loads the same snapshot (`mpResApply`); command and hash messages carry an epoch (`MP.ep`). Anything that must survive a resync
  has to be in `SAVA` (the save registry).
- Every text shown to players goes through `T_()` with its translations (EN, FR, ES, DE, IT, PT) in the table near `const LANGS`.
- Art direction approved by the King: Minecraft characters made the Blockbench way: the MC player model (8 px head,
  8x12x4 body, 4x12x4 limbs, outer layer with transparent pixels) plus 2 or 3 extra cubes per unit, the detail in pixel
  textures; gear in the Blockbench item manner (voxel weapons; shields built like the Minecraft shield: 12x22x1 planks,
  iron rim, rivets, bracket handle). Take the style of a reference, never copy a third-party model.

## Code map (`src/game.js`, find with grep)

- world: `rollWorld` (seed and terrain), `reset`, `startGame`, `freeTile`, terraces and ramps (`stairs`, ramp blocks), `pathTo`
- simulation: `update(dt)` main step, `mkU(team,type,x,y)`, `units`, `structs`, `build(type,x,y)`, `train(type)`, `wave()`
- rendering: `render3D`, `sGeo(s)` building geometry, `humanKit` unit models, `TOOLG` weapons, `shieldGeo`, `icoUnit`
- UI: `tb(...)` toolbar buttons, `openMenu` (Esc menu), `pickUnit` (selection; double click selects all of a type), `home()`
- co-op: `MP` state, `confirmPick` (castle site), `sitesFar`, `mpStart`, `mpBegin`, `mpMsg`, `mpExec`, `mpChk`, `lobbyRender`
- text: `T_()`, `LANGS`
