# Naranxia

A browser strategy and tower defence game. Build a kingdom on a procedurally generated world, train an army, research upgrades and hold your castle against night hordes, rebel camps and bosses. Play solo or in two-player co-op.

- **Solo and co-op:** one kingdom alone, or two players sharing the same world over a peer-to-peer connection.
- **Seasons, day and night, events and bosses:** the world changes as the game goes on.
- **Nine languages:** English, French, Spanish, German, Italian, Portuguese, Dutch, Polish and Turkish.
- **Plays anywhere:** a single HTML file in any modern browser, or the Electron launcher for Windows, macOS and Linux, which updates itself from the latest release.
- **Keyboard layouts:** QWERTY, AZERTY and QWERTZ, with rebindable keys, plus a colour-blind mode and reduced motion.

## Play

Download `naranxia.html` from the [latest release](https://github.com/Naraige/naranxia/releases/latest) and open it in a browser, or install the desktop launcher. Saves stay on your machine. See the [changelog](CHANGELOG.md) for what changed in each version.

Made by Naraige (King Naraige). All rights reserved, see [LICENSE](LICENSE); [privacy](PRIVACY.md).

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
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
npm test -- --full
```

`npm run test:fast` runs rules, architecture, runner and desktop contracts without Chromium. `npm test` runs core integration; `npm test -- --full` adds complete browser/co-op coverage, packed rendering and targeted fault checks. Use `npm run test:stress` for world sweeps and `npm run test:performance` for isolated benchmarks.

Pass test names to run a subset, for example `npm test -- det save`. Structured results and failure logs are in `dist/test-logs/`. See [the audit and coverage limits](docs/TEST_AUDIT.md).

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
