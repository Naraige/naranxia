# Codebase cleanup audit

## Baseline and scope

The cleanup was first prepared against v92, then integrated with v93 and the fetched v94 release. The verification baseline is pinned, by request, to `4a57714017d38c8d5294445e20962eb4b1e76c11` on `feature/codebase-quality-v94`. Upstream v94 save/resync fixes, wave routing, physical controls and minimap behavior are preserved. Earlier cleanup branches and checkpoints remain recoverable. This cleanup does not change the upstream release version or player-facing notes.

The audit covers the full game import graph, desktop JavaScript, build and test tools, browser test snippets, and JavaScript review tools under `docs`. It preserves the workspace layout, game implementation language, runtime dependency pins, standalone distributions, desktop bridge, save schema and multiplayer protocol.

## Changes by category

| Category | Change | Verification approach |
| --- | --- | --- |
| Mechanical formatting | Prettier applies one JavaScript layout across maintained code. The line-oriented translation table is an explicit exception. | Compare syntax trees before and after the formatting-only pass, then run formatter checks. |
| Code quality | ESLint checks defined names, unused bindings, declarations and recommended correctness rules. Intentionally retained unused parameters use an underscore while keeping arity. | Full workspace lint; export and arity inventory for parameter edits. |
| Dead code | Remove verified unused private helpers, unused bindings, permanently disabled branches and unreachable older implementations. Preserve evaluation and random draws when discarding a binding. | Caller and debug-adapter searches; deterministic fingerprints and regression scenarios. |
| Ownership | Extract panel/language state and world state/query/invalidation responsibilities. Preserve existing export paths through re-exports. Remove direct music-to-sound and world-to-renderer imports. | Full graph checks, state identity checks, browser and audio comparisons. |
| Hidden dependencies | Import `SAVA` directly in resync; make browser bridges and camera overrides explicit `window` accesses. | Undefined-name lint, resync scenario and visual checks. |
| Test infrastructure corrections | Smoke requires gameplay success; determinism checks pinned v94 fingerprints; page errors fail direct test invocations; runner rejects malformed/error/desync output. | New test-runner contract tests and complete browser suite. |
| Platform and build tooling | Exercise the actual Electron preload/save IPC bridge with an isolated data directory; resolve release build paths from the tool location. | Desktop bridge contract tests and packaging checks. |
| Enforcement and guidance | Add quality scripts and CI checks, plus contributor and architecture guidance. | Run the same commands locally that CI runs. |

Formatting, structural changes and test infrastructure corrections are distinct passes. Review artifacts under `dist` retain the baseline builds, logs and before-format source snapshots; these generated artifacts are not repository source.

## Architecture findings

The v92 graph had one strongly connected component of 134 modules, containing 1,132 cyclic import edges. The primary reciprocal responsibilities are gameplay/UI, gameplay/rendering, AI/gameplay and gameplay/world. Folder names did not imply independent layers.

The refactors establish natural state owners, remove the world/rendering feedback seam and the four-module world cycle, and separate shared build metadata from the menu implementation. The architecture checker inspects every game JavaScript entry, including code outside the production entry graph. It rejects unresolved relative imports, forbidden boundaries and cyclic edges absent from the reviewed allowlist. Removed edges are pruned from that allowlist so they cannot be reintroduced silently. The check never rewrites its policy.

The unchanged v94 graph contains 172 source inputs, 1,883 internal imports, and 1,142 cyclic edges in one 134-module component. After cleanup, the ratcheted graph contains 181 inputs (180 JavaScript modules and one imported JSON asset) and 1,917 internal imports. One 121-module component remains, with 811 cyclic edges. The allowlist preserves the earlier v92/v93 history and captured v94 baseline; comparison against unchanged v94 confirms 331 cyclic edges removed and none added.

The graph still contains substantial legacy coupling. Eliminating the remaining groups requires further changes around synchronous presentation calls, AI/gameplay operations, lockstep orchestration and persistence registry ownership. A passing dependency check means the reviewed boundaries hold and remaining debt has not grown; it does not mean the entire graph is acyclic.

Further refactors should tackle one responsibility at a time:

| Boundary | Safe next step | Required evidence |
| --- | --- | --- |
| Simulation and presentation | Isolate a specific synchronous rendering operation behind its existing initialization owner. Avoid a general event bus. | Same tick fingerprints, geometry signatures and relevant screenshots. |
| AI and gameplay | Move a cohesive rule or data owner only after enumerating its command, save and debug consumers. | Same deterministic scenario and multiplayer tick digests. |
| Persistence and resync | Make registry ownership clearer without renaming keys or dropping cached simulation state. | Strict save continuation, old-save compatibility and deep resync. |
| Remaining cyclic imports | Remove the reviewed edges from `architecture-baseline.json` after each verified cut. | No new cyclic edges and the appropriate browser scenarios. |

## Deliberate preservation and limitations

- The save schema stays at version 1. Save defaults, migration hooks, unknown-type handling and older fields are compatibility contracts, not dead code.
- Upstream v94 fixes the older save/load continuation mismatch and restores simulation-read caches and timers during resync. Its strict continuation assertion is retained; the cleanup additionally verifies that shared terrain arrays and maps retain identity across restore.
- The convoy failures recorded during v92 were addressed upstream in v93. V94 adds deeper resync and soak diagnostics, wave routing fixes and guest-side ownership preservation after a disconnect. These changes are included. Fixed-world tests still do not prove every site pair, wave or network condition works.
- Rendering style alternatives exposed to review tools and existing browser console names remain available. Unused exports alone are insufficient evidence to remove them.
- Every existing direct package dependency has a verified source/tooling consumer; no package was removed merely to reduce the dependency count. Existing npm advisories require separate version and reachability review; runtime packages were not upgraded opportunistically.
- `i18n/translations.js` retains its one-key-per-line layout because translation insertion and duplicate-key tools depend on it. It is still linted. Page-evaluated test and preview snippets intentionally use game-owned globals; the environment-specific lint exceptions are explicit.
- Browser automation cannot establish physical touch/controller behavior, human-perceived animation/audio quality on every device, or every desktop platform's installer behavior. Local and CI coverage must be read with those limits.

## Baseline verification

The original v92 release build succeeded, and all 24 original browser scenarios have baseline pass evidence. Three initially timed out during page load under the globally installed Playwright 1.64; they passed using an isolated Playwright 1.56 environment matching CI. Those historical artifacts and logs remain under `dist/audit-baseline`.

After updating to v93, its five baseline checks and the cleaned 27-scenario suite passed; Windows and Linux desktop packages also passed resource-integrity checks. This is historical evidence, separate from the final v94 verification.

The unchanged pinned v94 release build succeeded (2,755,154 readable bytes; 819,477 packed bytes). Before cleanup integration, determinism, save restoration and continuation, UI/controls, waves and deep multiplayer resync passed. Both deterministic runs matched all eight captured v94 fingerprints. Artifacts, dependency graph, screenshots and logs are retained under `dist/audit-baseline-v94`.

## Final v94 verification

The candidate source was frozen before verification. All 31 scenarios in `npm test -- --full` passed without retries, using the CI-pinned Playwright 1.56 environment. Save restoration matched both immediately and after continuation, with shared terrain references preserved. Deep resync passed five corruption/recovery cases; the soak compared 6,010 ticks with no divergence or resync. The separate disconnected-map `mp_cut` regression also passed, comparing 1,644 hashes and skipping the unreachable convoy quest on both peers without a reward.

| Check | Result |
| --- | --- |
| Quality enforcement | Nine architecture tests, dependency policy, full-workspace ESLint and Prettier checks pass. Translation coverage and release-note translation checks pass. |
| Formatting-only proof | All 240 maintained JavaScript syntax trees match their pre-format snapshots exactly after removing source positions and literal spelling metadata. |
| Shared/public interfaces | All 171 original game JavaScript modules retain their exported names and function arities, including re-exports through legacy paths. Nine cohesive modules were added. |
| Models | All 146 signatures match: 21 unit types for two teams and 26 structure types for two teams and two tiers; geometry, transforms, material data and texture pixels are checked. |
| Audio | All six launch/calibration/battle/calm/night/boss peak/RMS summaries match. Raw PCM hashes are diagnostic: repeated baseline renders are not bitwise stable in Chromium. |
| Simulation and timing | Three 6,000-tick profiles per artifact are internally consistent and match between artifacts. Median: baseline 13,508 ms; candidate 13,522 ms (about 0.1% difference). This sample does not establish performance on every device or workload. |
| Standalone release | Packed smoke and release build pass. Packed size is 819,397 bytes, compared with 819,477 bytes upstream. The readable artifact grows through formatting. |
| Desktop packages | Windows x64 and Linux x64 packages build. Embedded game, Three.js, main process and preload bytes match their sources; executable files are present. The actual save IPC/preload bridge passes with mocked Electron boundaries. |
| Visual review and tools | Title, update, settings, desktop HUD and narrow HUD captures were inspected against baseline; no visual regression observed. Screenshots have no page errors. Caller-relative script precedence in `tools/run.py` passes from a different working directory. |

Windows/Linux package integrity is verified locally; native installer interaction, macOS execution, real GPU behavior, physical touch/controllers/keyboards and a real internet multiplayer session remain outside this verification. Remote CI results must be assessed separately from these local checks.

Local evidence is retained under `dist/cleanup-review`: `v94-pre-format.patch` and `v94-new-files/` separate semantic edits from formatting; `v94-format-equivalence.log`, `v94-public-interface.json`, `v94-full-suite.log`, `v94-final-test-logs/`, `v94-desktop-packages.json`, `v94-mp-cut.log` and `v94-runtime-parity.json` record checks. Baseline and candidate screenshots live in `dist/audit-baseline-v94/screens/` and `dist/qa-final-v94/`. Generated evidence is ignored by Git. The source, policy and tests are maintained in the repository.
