# Architecture

Naranxia has one game implementation under `packages/game/src`. Vite loads its ES modules during development. `tools/build.mjs` bundles the same entry point and assets into a readable standalone HTML file; `tools/build_dist.mjs` minifies and packs that file. Electron stages the packed artifact with a local Three.js r128 copy. The workspace layout and runtime dependency versions are deliberately preserved.

## Startup and frame ownership

`main.js` lists startup operations in dependency order and passes them to `core/boot.js`. Boot slices interactive startup work to keep the launch cards responsive; automation follows the existing synchronous path. Scene creation, browser listener registration, and loop startup must retain that order.

`core/frame-loop.js` owns browser frames. `gameplay/simulation.js` advances the match; `gameplay/statistics.js` wraps each update. `rendering/frame.js` draws the match, while the title and site picker have their own rendering operations. Presentation clocks and simulation clocks serve different purposes and must remain separate.

## System responsibilities

| System | Ownership |
| --- | --- |
| `core` | Startup, frame scheduling, preferences, math, random generator, build version |
| `gameplay` | Session data, rules, economy, entities, combat, waves, quests, achievements |
| `world` | Terrain data and generation, connectivity, routes, traversal and path queries |
| `ai` | Worker assignments, enemy behavior, camps, kingdoms and boss behavior |
| `multiplayer` | Peer connection and lobby, command dispatch, lockstep, snapshots and shared co-op actions |
| `persistence` | Object graph save format, compatibility defaults, restore operations and storage selection |
| `rendering` | Three.js resources, models, shaders, world effects, scene presentation and animation |
| `audio` | WebAudio graph, procedural sound effects and generated music |
| `ui`, `input`, `i18n` | Menus, HUD, controls, language selection and player-facing translations |
| `debug` | Diagnostics, test mode and the stable browser console adapter used by tests and preview tools |
| `apps/desktop` | Electron launcher, offline installation, updater and save IPC bridge |

`gameplay/session.js` and `gameplay/rules.js` are shared data owners. State-only modules should remain leaves. Operations that need browser resources belong with the system that owns those resources, rather than in a generic shared state object.

`world/terrain-state.js` owns the live terrain bindings and collections. `world/terrain.js` allocates them during `initializeTerrain` and retains its existing exports. Height queries live in `terrain-queries.js`, step rules in `traversal-rules.js`, and the pathfinding cache in `pathfinding-state.js`. Chunk preparation delegates synchronously through a provider registered after terrain initialization. Renderer invalidations register during `initializeTerrainRendering`; early marks retain their order until registration.

`ui/build-catalog.js` holds shared names, hotkeys and category metadata without importing the menu implementation. The menu retains the dynamic name setup in its original startup step and re-exports the existing name and hotkey objects. `ui/panel-state.js` and `i18n/language-state.js` similarly expose data independently of their feature implementations.

## Determinism and multiplayer

Solo and co-op use the same simulation. Multiplayer sends player commands through `mpPush`/`mpExec` and advances fixed ticks in `multiplayer/lockstep.js`. Both peers compare hashes. Keep command names, payloads, iteration order, RNG calls, floating point expression order and tick timing stable during cleanup.

Simulation randomness uses the existing seeded stream. Presentation uses `REALR`; a visual or audio refactor must not consume additional simulation random draws. Wall-clock timers belong to presentation and orchestration, outside deterministic updates.

A hash mismatch invokes `multiplayer/resync.js`. The host freezes lockstep, sends a save snapshot, and both peers restore the same snapshot under a seeded stream before moving to a new epoch. Snapshot changes must preserve both peers' state and clear the same caches in the same order.

## Saves and public interfaces

`persistence/save-format.js` defines `SAVA`, the registry of state included in saves and resync snapshots. It preserves shared object references and compresses world arrays. The format version remains `SVVER = 1`. Compatibility defaults and unknown-type handling are intentional; absence of current callers is insufficient evidence to remove them.

Browser storage uses IndexedDB; Electron provides the `window.NARX` bridge. Preserve the bridge methods and IPC channels, save registry keys, serialized object fields, local storage keys, multiplayer messages and exported functions. `debug/browser-console.js` also exposes a public surface used by repository tools. Production modules should import their dependencies directly instead of relying on properties installed by that adapter.

## Boundaries and current coupling

Run `npm run check:architecture` to inspect the dependency graph. The checker and its policy define the boundaries enforced in CI. It includes modules outside the production entry graph, so an unused entry point cannot hide a broken relative import.

The pinned v94 baseline has 172 source inputs (171 JavaScript modules and one JSON asset), 1,883 internal import edges, and one strongly connected component containing 134 modules. After cleanup, 181 inputs have 1,917 imports and one 121-module component; 331 cyclic edges were removed and none added. See [the cleanup audit](CLEANUP_AUDIT.md) for verification and remaining coupling. Do not treat folder names as proof that the current code forms independent layers. Establish a smaller dependency boundary with regression evidence before enforcing it.
