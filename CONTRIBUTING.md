# Contributing to Naranxia

Use Node.js `^20.19.0 || ^22.13.0 || >=24` and npm from the repository root. Keep the JavaScript workspace, standalone HTML build, and Electron launcher on the same game implementation.

## Daily checks

```sh
npm ci
npm run quality
npm test -- --full
npm run package:desktop -- win32:x64
```

Install the Python Playwright package and its Chromium browser before running browser tests; CI pins the supported version in `.github/workflows/test.yml`. Select scenarios with `npm test -- det save`; logs go to `dist/test-logs/`. Desktop packaging targets depend on the host platform.

Run `npm run format` for mechanical formatting. Git attributes and the editor configuration keep text files on LF line endings across Windows and CI. Review formatting separately from refactors and behavior fixes. Generated distributions and installed dependencies are excluded from formatting and linting.

## JavaScript conventions

- Use ES modules in the game and Node tools that already use them. Keep the Electron CommonJS entry points compatible with their package configuration.
- Let Prettier decide layout. Use `const` unless a binding is reassigned, named exports, explicit imports, and descriptive names for new operations. Follow the owning system's domain terms.
- Preserve existing exported names, browser console properties, save keys, command payloads, storage keys, and Electron IPC channels. An underscore does not prove a name is private.
- Prefix intentionally unused parameters and caught errors with `_` to preserve their arity or catch behavior. Use the exact name `_` only for a deliberately discarded iterator or destructured value; other unused variables remain lint errors.
- Put mutable state with its owner. Read shared state through that owner; route changes through existing commands or operations. Keep new state-only modules free of browser, rendering, and orchestration imports.
- Initialize browser resources and register listeners in explicit startup operations. Preserve the order in `main.js`; imports must not start a second loop, register handlers, or consume simulation randomness unexpectedly.
- Keep simulation iteration order, random draws, floating point operations, and fixed tick timing stable during refactors. Never replace a deterministic algorithm or reorder its arithmetic solely to shorten it.
- Keep errors actionable. Explain intentional best-effort storage or platform fallbacks at the catch site. Propagate failures that prevent a build or test from completing; avoid logging every frame or tick.
- Remove code only after checking imports, string dispatch, browser console adapters, preview tools, save restoration, and desktop consumers. Preserve side effects when removing unused bindings.

## Changing a system

Trace one caller through the owning module before editing it. Prefer a cohesive operation or data owner over a new general-purpose utility. Split a module when it contains independently understandable responsibilities; avoid a separate file for every small helper.

For a refactor, capture the current scenario output first and compare it afterward. The deterministic scenario checks repeated execution and the recorded v94 state fingerprints. Update those references only for an intentional gameplay change, using repeated results from an unchanged upstream build. Run multiplayer tests for simulation, command, or save changes; run save compatibility tests for persistence changes. Render and inspect affected screens for UI, model, shader, style, or animation changes.

For a before/after release comparison, run `python tests/runtime_parity.py BEFORE.html AFTER.html` with Playwright installed. It checks model signatures, audio summaries and repeated simulation fingerprints, and reports median simulation timings. Run it without other browser tests competing for CPU; audio PCM hashes are diagnostic because the browser does not reproduce those bytes consistently. The full suite includes the 6,000-tick multiplayer soak and deep resync scenarios.

Keep a formatting change mechanical. Describe structural refactors and functional corrections separately, including the relevant evidence and tests. Do not change gameplay rules to make a test pass.

See [the architecture guide](docs/ARCHITECTURE.md) for ownership and runtime boundaries and [the cleanup audit](docs/CLEANUP_AUDIT.md) for known limitations. Maintainer release procedures remain in [CLAUDE.md](CLAUDE.md).
