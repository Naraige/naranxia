# Naranxia — le royaume du roi Naraige

Naranxia is a browser strategy and tower defense game with solo play and two-player co-op. The Electron launcher runs the same game on Windows, macOS, and Linux.

## Development

Run these commands from the repository root. Quality tooling requires Node.js 20.19 or newer; CI uses Node.js 20.

```sh
npm ci
npm run quality
npm run dev
npm run build
npm run build:release
```

The dev server loads the ES modules under `packages/game/src/`. The build produces `dist/naranxia_readable.html`. The release build also produces `dist/naranxia.html`, the compressed HTML used by GitHub releases and the Electron launcher. Both browser builds open directly from disk. Browser builds load Three.js r128 from the existing CDN, and the launcher provides a local copy.

Install Python with Playwright and its Chromium browser to run the test suite.

```sh
python -m pip install playwright
python -m playwright install chromium
npm test -- --full
```

Pass test names to run a subset, for example `npm test -- det save`. Test logs are in `dist/test-logs/`.

`npm run quality` checks JavaScript formatting, ESLint rules, and architectural dependencies. Use `npm run format` to apply formatting. The line-oriented translation table retains its tooling-compatible layout.

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding and verification conventions, [the architecture guide](docs/ARCHITECTURE.md) for system ownership, and [the cleanup audit](docs/CLEANUP_AUDIT.md) for scope, evidence, and remaining limitations.

## Source layout

| Path | Responsibility |
| --- | --- |
| `packages/game/index.html` | Canvas elements, lobby template, and browser entry point |
| `packages/game/src/core/` | Startup services, main loop, and shared utilities |
| `packages/game/src/gameplay/`, `world/`, `ai/` | Match simulation, rules, terrain, traversal, and unit behavior |
| `packages/game/src/rendering/`, `audio/` | Three.js scenes, models, shaders, effects, and synthesized audio |
| `packages/game/src/ui/`, `input/`, `i18n/` | Menus, HUD, controls, and translations |
| `packages/game/src/multiplayer/`, `persistence/` | Co-op commands, lockstep, resync, and the save format and storage |
| `packages/game/src/styles/`, `assets/` | Stylesheets and browser assets |
| `apps/desktop/` | Electron launcher, updater, save bridge, and installers |
| `tests/`, `tools/` | Browser regression tests and build, release, and preview tooling |

`packages/game/src/main.js` runs browser and game initialization in order. Modules import the operations and state they use. Each mutable state object lives with its owning system. Browser test and preview scripts use the adapter in `debug/browser-console.js`.

## Desktop packages and releases

```sh
npm run package:desktop -- win32:x64
```

The desktop build stages the browser artifact in the Electron bundle. Its output is in `apps/desktop/dist/`. The installer workflow wraps those packages for Windows x64, macOS Intel and Apple Silicon, and Linux x64.

`game/VERSION` and `game/NOTES.md` supply the release version and notes. A version bump on `main` runs the tests and builds the release asset from the workspace. See `CLAUDE.md` for the maintainer release procedure.
