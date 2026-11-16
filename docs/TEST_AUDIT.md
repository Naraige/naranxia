# Test infrastructure audit

Audit started 2026-11-15 at `86881a5`, on `feature/codebase-quality-v94`. The objective is observable regression evidence, followed by removing measured execution overhead. Passing a script or printing an empty error list is not evidence that its scenario happened.

## Branch reconciliation and baseline

The checkout was clean. `origin/main` (`4a57714`) is an ancestor of this branch; the two later commits introduce ownership/quality checks and formatting. The existing v94 wave routing, snapshot restoration and disconnected guest fixes are already present. Local v92/v93 branches predate these fixes; `feature/codebase-quality` and `refactor/modular-game` point to older modularization work (`f7a25c7`). No older runner or game implementation was transplanted, and no branch was reset or merged.

Baseline tests and harnesses were copied under `dist/test-audit/baseline/`; only paths were adjusted for relocation. The original HTML is retained as `dist/test-audit/baseline.html`. This separates baseline execution from edits to maintained tests and the candidate game build. The full exploratory baseline uses one worker. Its timings include concurrent exploratory probes and are **not** an isolated speed comparison. The relocated `tools.py` initially failed because its root path was escaped incorrectly; that failure is excluded from performance evidence.

The host has global Playwright 1.64 without a matching browser. The existing `dist/qa-venv` provides CI's Playwright 1.56. Chromium 141 / revision 1194 was installed under `dist/pw-browsers`. Browser subprocesses require execution outside the desktop filesystem/process sandbox. All before/after measurements use this same Python environment, browser and SwiftShader flags. UTF-8 output is explicit; otherwise Windows keyboard labels can break pipe decoding.

## Ranked findings

| Priority | Finding | Evidence / action |
|---|---|---|
| Critical | `mp8` and `mpk` accepted `ERRS [] []` as success. | The baseline `mp8` passed with `aca: []`, no completed research and no worker-role changes. Replace marker-based acceptance with structured, named behavior assertions. Rebuild `mp8` around natural construction and research completion. |
| High | Co-op fixtures rewrote construction progress, research times and training times. | Remove the `_N.build`, `RT2` and `TRAIN` substitutions. Seed resources/terrain as scenario inputs; run the real command, construction, training and research logic. |
| High | Independent live reads compared peers at different ticks. | Freeze scheduled animation frames before boot. Advance the production frame callback explicitly, relay serialized production messages and compare recorded `epoch:tick` state. Wall time remains a failure deadline, never a success condition. |
| High | API readiness did not prove visible startup in the new manual-frame fixture. | Visual inspection caught screenshots covered by the launch curtain. Rendering checks now advance the actual production boot across browser turns, then require the curtain to disappear. A genuine stuck-curtain mutant disables both completion paths and must fail this requirement. Nonvisual cases retain cheap binding readiness. |
| High | Ambient startup/audio draws could move the initial scenario RNG stream. | Three recovery runs passed but one selected a different world. Reset the scenario stream after initialization, separately from production `REALR`; record input seed, castle sites, epoch/tick and production hash. Revalidate every multiplayer scenario. |
| High | Sappers repair could pass because the target was outside repair range. | Position the damaged target inside the radius and require actual bounded healing. |
| High | Frost damage could be caused by normal combat rather than the boss ability. | Trigger one production ability update, outside melee/stomp range, and require exact chill damage. |
| High | Wave disappearance could satisfy navigation assertions through the stuck-unit cleanup. | Count arrivals at the defence and living zombies that actually emerge from water. Keep independent cleanup-delay and no-kill-credit assertions. |
| High | Trap duplicate preview and demolition were untested and broken. | A new regression failed before changes: duplicate preview remained green; demolition had no target and did not remove the trap. Share placement validation with the preview, add trap demolition and invalidate trap meshes. Do not invent trap refunds or add save fields. |
| High | Save digests sampled terrain and rounded unit values. | Retain continuation and shared terrain-reference checks; add a saved trap sentinel and corruption control. The existing digest remains a fingerprint, not a proof of complete object-graph identity. |
| Medium | Every browser snippet launched Chromium and waited 3.5 seconds while software rendering continued. | Batch independent snippets in one browser with a new context for every scenario. Use the existing installed console bindings as the readiness condition. Stop incidental animation during async save/load; keep explicit rendering scenarios. |
| Medium | Every multiplayer random draw built stack traces. | Count/hash RNG values during the normal run. Retain bounded state details for the first divergence; do not allocate `Error().stack` per draw. |
| Medium | Default `npm test` always minified and compressed a release. | Build readable HTML for core scenarios; pack only when the packed smoke test is selected. Full/release coverage still executes the packed asset. |
| Medium | Result parsing trusted regex matches and could accept missing or malformed completion. | Require versioned records, exact identities, completion, finite durations, nonzero assertions and consistent success status. Reject exceptions, desynchronization, malformed error lists and nonzero exits. |
| Medium | The disconnected-map co-op test and useful probes were manual only. | Register `mp_cut` in full coverage; convert probes from diagnostic totals to assertions and place expensive world sweeps in stress coverage. |
| Medium | Architecture/model/audio/desktop checks have different evidentiary limits. | Keep architecture checks fast, actual preload/save IPC tests, release model/audio comparison, packed browser smoke and native packaging as distinct checks. Mocked Electron APIs do not establish installer or OS integration correctness. |

## Per-file audit and disposition

Every existing file under `tests/` is accounted for below. Scenario setup may place units, grant resources, choose progression state or inject an event; this is input preparation. Replacing the implementation of the rule being asserted is not acceptable. The remaining synthetic co-op commands only establish scenario inputs (units, XP, events or completed quest prerequisites) and then delegate ordinary commands to production `mpExec`.

| Existing test | Actual requirement and assertion quality | Cost, disposition and remaining limit |
|---|---|---|
| `smoke.js` | Packed loader, version, rest period, starting area, path on ramp and wave enemies. Previously did not prove the rendered canvas contained gameplay. | Retain packed/browser rendering. Assert submitted geometry and non-uniform pixel output after a real frame. Forty explicit render frames remain intentional browser coverage. |
| `det.js` | Two 6,000-update scenarios and eight pinned v94 fingerprints. Strong repeatability/reference check; sampled hashes are not all-field identity. | Retain unchanged reference values and simulation workload. Record reference/repetition assertions separately; profile mode supports the performance tier. |
| `features.js` | Seasons/weather, trap costs/damage/wear, oil, bosses, King cooldowns/buffs, kill/stat attribution, records, co-op goals and save registry assignment. | Retain as a broad integration check; register every named check. Focused tests retain distinct timing, research and persistence boundaries. Three explicit rendering calls remain. |
| `spearman.js` | Exact stats, cost, training, range and big-target damage; camp trait composition/refill, rebel ownership, hotkey migration. | Retain. Scenario buildings can be prepared as complete; production training/combat are executed. Damage mutation must fail its assertions. |
| `kingxp.js` | Exact XP sources, caps, talent order/points, skill range/duration, damage reduction, frost ward, old King fields and save restoration. | Retain focused coverage; seeded scenario, real rule functions and save encoder/restore. |
| `traps.js` | Trap/era phase independence across histories. Previously accepted any positive trap damage and thus missed incorrect damage/wear. | Retain history cases. Add isolated exact damage, wear and exhausted-trap removal. No unrelated unit can satisfy the damage assertion. |
| `compat.js` | Old/mixed/newer save envelope, unknown unit filtering, missing health fallback, unit/structure counts and malformed-format rejection. | Retain; record each case's counts and finite health separately. It synthesizes older shapes from the current encoder; independently captured historical save fixtures remain a gap. |
| `bossabil.js` | Four boss abilities. Frost's broad health-decrease assertion could pass on ordinary combat. | Retain summons and healing; isolate frost ability with exact damage. |
| `envoy.js` | Tribute, envoy consumption, cooldown and second envoy staying alive. | Strengthen tribute from positive to exact 80 in this wave-zero scenario. Retain the research/events tests' distinct cap, exhaustion and trait cases. |
| `ruins.js` | Generated ruins, claim, resource reward and save-registry inclusion. | Retain; named claim/reward/registry assertions. Registry presence alone is not a ruin save/load round trip. |
| `events.js` | Camp traits, real command payloads, delayed/default/conflicting event decisions, exact payouts, renown, tribute traits and save assignment. | Retain; instrument its `need` checks. Separate co-op tests verify transport and resync rather than replacing these rules. |
| `bastion.js` | Ten building types, food, sanctuary/sapper/engineer repair and scout stats. | Remove the vacuous distance alternative; require real repair. Prepared completed structures isolate abilities, while `mp8` covers natural construction. |
| `market.js` | Exact barter stock changes, price direction, insufficient stock, missing market, drift and wave preview requirements. | Retain. Preview purity currently compares selected observable state, not every save field. |
| `research.js` | Exclusive branches, prerequisites, old choice state, fatigue, recovery and envoy limits. | Retain. Remove the tautological `oldBaseOk` check; the existing eight actual envoy visits already begin after deleting those fields and exercise their defaults. |
| `quests.js` | Full quest order/reward text, negative/off/dev paths, co-op preference/commands, old saves, snapshot state, convoy reward ordering. | Retain. Direct prerequisite completion isolates quest evaluation; co-op natural construction/training and delivered-convoy tests provide separate integration evidence. |
| `ui.js` | Keyboard layout/rebinding/migration, camera actions, minimap transforms, quest arrows, banners, guide transitions and timed co-op notices. | Retain browser/UI semantics. Most geometry is asserted through drawing/layout state with GPU submission disabled; this is not pixel-level visual parity or a physical keyboard test. |
| `waves.js` | Three difficult seeded worlds, water exit, stuck-unit give-up/removal and pre-v94 swarm fields. | Retain perfect-defence fixture and timer bounds; require arrivals and living water escape to distinguish navigation from deletion. It does not replace later-wave/boss/miner world sweeps. |
| `save.js` | Round trip, deterministic continuation, RNG draw count, prices, whole-unit/structure fingerprints, swarm and shared terrain identities. | Retain 2,400+400+400 updates. Add explicit round-trip/continuation/reference assertions and a trap sentinel; missing trap restoration must fail. Every persisted root typed-array byte is compared with SHA-256. Unit/structure continuation digests remain selective. |
| `mp8.py` | Intended economy/build/research/waves/roles/quest coverage was mostly printed diagnostics. Baseline passed while academies/research were absent. | Redesign around fixed nearby sites, all four buildings for both owners finishing naturally, masonry/iron/plate, competing research rejection, quest switches, spawn and wave commands. Check matching ticks and no unrequested epoch change. |
| `mpk.py` | Intended King/guard/movement/combat coverage accepted empty error lists. | Require both Kings with two correctly linked guards, duplicate/full queue rejection and actual combat kills. Keep production training time. Require host King displacement after a real movement command before combat begins. |
| `mp_kxp.py` | King XP/talents/skills equality; allowed one surviving King and compared independent live states. | Require both level-five Kings with the expected talent mask, production training, actual own-King skill cooldowns and matching-tick observations. |
| `mp_resync.py` | Intentional guest unit/resource/quest corruption must cause one epoch transition and stable deterministic continuation. | Retain corruption and recovery. Add the common wider state/RNG observer; the corrupt interval is intentionally not a normal equality interval. |
| `mp_events.py` | Guest choice, simultaneous choices, stale choice, timeout and open-event resync. | Retain, drive explicit production frames and compare matching moments. Remove temporal ambiguity before tightening exact payout/order assertions. |
| `mp_convoy.py` | Actual guest-to-host porters, equal delivery tick/quantities, return home and no divergence. | Retain distinct delivery trace. Eliminate fixed initial wall wait; keep bounded completion polling. |
| `mp_quests.py` | Both players paid at the same quest-completion ticks, natural building/training, spearmen fighting and convoy quest. | Retain exact completion traces and minimum reward requirements. Remove short test training times; construction/training deadlines must allow production durations. |
| `mp_build.py` | Real guest/host mouse placement for twelve types, coordinates/ownership/meshes, camera, rally, King, resync and guest-alone building. | Retain full browser input path, viewport and production 3D scene updates. Replace startup sleeps and disconnected-player settling waits with explicit frames. Mesh existence is not pixel visibility. |
| `mp_resync_deep.py` | Five corruption/recovery scenarios: event, convoy, raid, active skills and host authority; minimum continuation ticks per epoch. | Retain in full/stress. Intentional corruption cutoffs are epoch-specific. Observe exact fields/RNG in addition to the older rounded digest. |
| `mp_soak.py` | 6,000 compared ticks of scripted builds, events, battles, convoy, quests and skills; no unexpected resync. | Retain workload in full/stress. Some scripted setup commands can be refused (for example absent camps); equality alone does not establish that every action had an effect. Add per-action postconditions incrementally. |
| `mp_cut.py` | Known disconnected map; convoy refused, quest skipped on both with no reward, repeated route checks do not alter state. | Promote from manual-only to full and stress. Keep timings diagnostic rather than comparing different machines to an arbitrary universal threshold. |
| `tools.py` | Developer controls, resources/research/spawns/build/heal/speed/kill, achievement inhibition and complete bug report. | Retain real report capture/save. Use path-safe fixture and one explicit frame to service the capture request. Intentional console error must appear in the report; unexpected page errors still fail. |
| `desktop_bridge.cjs` | Actual preload methods/channels and main-process save/list/delete/info behavior with Electron boundary doubles. | Retain as fast; count native assertions. Does not validate BrowserWindow rendering, real OS dialogs or installation. |
| `architecture-check.test.mjs` | Dependency graph cycles/ratchet/unresolved imports, provider synchronization and shared state references. | Retain in fast and quality. Fixture mutations already prove the checker rejects bad graphs; avoid duplicating engine integration here. |
| `test_runner.mjs` | Success/error-marker parsing. | Strengthen with malformed/missing/duplicate/zero-assertion records, exit/deadline failures, tier selection and full-superset checks. |
| `runtime_parity.py` | Two-artifact model signatures, six audio summaries and three simulation fingerprints; diagnostic PCM hashes. | Retain explicit comparison CLI. Use explicit readiness/frame control. Its comparison CLI remains separate because it requires two independently supplied builds. Audio PCM varies even without a code change; never treat differing PCM alone as a regression. |
| `azerty_probe.js` | Diagnostic inventory of default keyboard accessibility; did not understand newer physical `Key*` bindings. | Add physical QWERTY/AZERTY mapping and symbol-accessibility assertions; include in full. Synthetic layout tables do not prove physical hardware. |
| `convoy_probe.js` | Thirty-six seeded convoy journeys; previously only printed delivery/refusal totals. | Convert every attempted journey to delivery or validated stock-preserving refusal, require all worlds; stress tier. |
| `convoy_cut_probe.js` | 120 seeded route lookups and timings; previously diagnostics only. | Assert repeated lookup stability, unchanged gameplay fingerprint, known river cut and both route classes; stress tier. |
| `waves_probe.js` | Twenty-four worlds, default wave three, perfect defence; previously only counted bad outcomes. | Assert each outcome and all worlds exercised; stress tier. Larger wave numbers remain selectable developer scenarios. |

## Harness and execution contracts

`tools/test_suite.mjs` owns scenario identities and tiers. Named selection and `--full` remain supported. `--full` is a strict superset of core and retains the previous deep resync and 6,000-tick soak. `npm test` now defaults to core; pull requests and release calls select full. The test workflow pins Playwright through `tests/requirements.txt`. Release/full workflow calls additionally run the three seeded world sweeps against the existing build, then upload and publish the exact tested packed artifact. Pull requests run full; ordinary code pushes run core.

| Level | Purpose | Command |
|---|---|---|
| Fast | Production RNG/traversal rules, architecture, runner/CLI contracts, desktop IPC and focused source mutations; no WebGL | `npm run test:fast` |
| Core | Essential rule integration, exact trap controls, save/continuation and representative co-op | `npm test` |
| Full | All maintained gameplay/browser/co-op tests, packed smoke, deep resync, soak and focused browser faults | `npm test -- --full` |
| Stress | Seeded world sweeps, disconnected worlds and resource-intensive co-op | `npm run test:stress` |
| Performance | Startup, 6,000-tick CPU samples, synchronized rendered frames and heap measurements | `npm run test:performance` |

`node tools/test_all.mjs det save` reuses existing built artifacts; `npm test -- det save` rebuilds readable HTML first. Build inputs are not silently inferred from stale distributions. Packed compression is selected only for `smoke`. `J=1` is the reproducible default; `J=2` is available explicitly. Higher values and invalid numbers fail rather than oversubscribing renderers. There are no automatic test retries.

`tools/run.py` retains its positional snippet/screenshot/viewport/wait/HTML interface. The optional screenshot delay is preserved for preview compatibility; it is not a startup readiness contract. Test scripts must establish their requested state before returning. Non-test preview snippets can still return diagnostic text. Test snippets require named behavior assertions.

The browser fixture installs only scheduling/random-input controls before normal production initialization. It does not supply a second game simulation. Pure RNG/traversal tests import production modules directly and need no browser. The broader simulation graph still initializes Three.js, models, UI and audio bindings; eliminating that initialization safely requires additional module boundary work, not a test-only engine.

Browser batches reuse the browser process, never page or storage state. Each scenario gets a fresh context, locale and timezone. Multiplayer shares a process but uses separate contexts. The driver advances the actual queued production frame callback; production `mpFrame`, command lead, RNG, `mpExec`, update and resync code are unchanged. Five-frame exchange batches fit inside `MPD=6`. Epoch/tick alignment holds an ahead peer while the other catches up after an async restore. Hashes are indexed by simulation epoch/tick, not Python polling time.

Multiplayer initialization gives scenario selection a fresh production `rngf(0x4e415258)` stream after boot; audio keeps the previously captured `REALR`. The exact seed/world/sites are recorded. This controls scenario inputs without changing production lockstep or RNG algorithms.

The wider observer records exact numeric unit/structure fields, references, queue, resources/prices/fatigue, quests, events, active swarm arrays and a rolling RNG-value sequence. It excludes presentation objects, selection and rebuilt local path/version caches. Published immutable distance-field arrays are hashed once per reference; active swarm arrays are hashed every tick. Two independent 32-bit accumulators plus length reduce accidental collisions; these are diagnostic fingerprints, not cryptographic proof. The latest 120 ticks of component details remain available for a first-difference report. Research, traps, scalar simulation fields, generated world entities and shared progression are also observed. Terrain stair metadata is fully compared every 30 ticks; other recorded state is compared every tick. Therefore the first terrain discrepancy is an observed checkpoint, not necessarily its originating tick. Local `GST` income history and `BTIER` UI preference deliberately differ by player and are excluded; the observer contract demonstrates these distinctions alongside injected authoritative faults. Old scenario-specific delivery/quest traces are preserved.

Each `TEST_RESULT` has schema, identity, purpose, completion/status, named executed assertions with expected/actual values, seed/configuration/tick/epoch, wall duration and phase timings. The runner rejects missing, duplicated, malformed, empty-assertion or contradictory records, unexpected page/child errors and desync. Failure categories are assertion failure, timeout, infrastructure failure, simulation divergence and calibrated performance regression. Successful ordinary scenarios retain compact structured summaries; failed jobs retain full output and browser failure images. Deliberately failed mutation scenarios also retain their diagnostic images. The runner writes an incremental report with `complete: false` after every finished job and marks it complete only when every selected job has finished. Child deadlines terminate the owned process tree so Chromium does not survive a timed-out Python process.

## Mutation evidence and validation

`tools/mutation_check.mjs` compiles disposable bundles of actual production RNG/traversal modules. The unchanged control must pass; each altered RNG multiplier, disabled height collision and broken miner-step rule must fail a native behavior assertion. Compilation, missing module, timeout or launch failure does not count as killing a mutant. The source checkout is never mutated.

`tools/browser_faults.py` builds isolated production HTML variants and runs the same regression test against controls and defects: command ownership, dropped command, spearman damage, trap damage, sapper repair, boss frost damage, omitted trap restoration, one corrupted terrain byte, broken demolition, stale trap geometry and blocked water navigation. A meaningful named behavior assertion must fail; infrastructure exceptions alone are insufficient. The manifest and generated artifacts make each run reproducible.

Raw evidence stays under `dist/test-audit/` and versioned runner results under `dist/test-logs/`. These generated local artifacts are ignored by Git. The assertions, scenarios and commands required to reproduce the checks are versioned.

## Measured execution costs

The isolated comparison used three repetitions of each unchanged scenario workload, the same production artifacts/environment described above, a 1000×620 viewport, one worker and no competing browser work. Only assertion registration was added to these two scenario bodies. Old runs used the original runner; candidate runs shared a browser with fresh contexts. The candidate test duration excludes batch browser launch/close; original duration includes it (approximately 0.11 seconds combined). Python process startup is outside both scenario measurements.

| Repeated workload | Original median | Candidate median | Reduction |
|---|---:|---:|---:|
| `features` | 18.662 s | 6.470 s | 65.3% |
| `ui` | 19.419 s | 5.433 s | 72.0% |

| Phase, median | Original features | Candidate features | Original UI | Candidate UI |
|---|---:|---:|---:|---:|
| Browser launch | 0.083 s | shared batch | 0.083 s | shared batch |
| Navigation/readiness | 9.176 s | 3.326 s | 9.148 s | 3.288 s |
| Fixed startup delay | 3.509 s | absent | 3.514 s | absent |
| Scenario evaluation | 5.349 s | 1.345 s | 6.084 s | 2.080 s |
| Browser close | 0.026 s | shared batch | 0.025 s | shared batch |

Medians of individual phases do not sum to the median total. Browser scheduling between awaited calls is part of the original cost; the candidate stops incidental rendering before boot, while retaining the scenario's explicit render calls. Context cleanup and small bridge/metadata operations are included in total duration. Raw repetitions: `dist/test-audit/comparison/baseline.json` and `candidate.json`.

The expanded multiplayer observer was separately profiled on the same generated world: 31,174 stairs serialized to 1,562,067 bytes inside the progression component. Thirty captures had a 30.0 ms median. Keeping that mutable map on a 30-tick checkpoint reduced ordinary captures to 0.8 ms median; full map captures remain required at checkpoints. This is observer overhead evidence, not a game-engine speed improvement. CPU samples and component sizes are in `observer-profile-before.json` and `observer-profile-after.json`.

Readable compilation measured 0.255 s; release minification/compression measured 8.162 s in `build-phases.json`. Core skips that compression; full still tests the packed asset. Other eliminated costs include per-snippet browser processes, live software rendering during async save operations, fixed readiness sleeps, RNG stack allocation on every draw and repeated Python-to-browser exchanges (two calls per five-frame peer batch). No unique test scenario was deleted.

The full exploratory original run is not an equivalent-workload benchmark: probes overlapped it, assertions were weaker, and multiplayer wall time did not define a reproducible number of simulation updates. The final full run also adds coverage and fault controls. Their per-test costs are reported for planning, without attributing their total difference solely to optimization.

## Completed full regression run

The fresh full run completed on 2026-11-16: **40/40 scenarios passed**, including eight unchanged browser fault controls and eleven killed browser mutants, plus three killed pure-rule mutants. Total runner wall time was **829.44 seconds (13m49s)** at **J=2**. This run is a coverage gate, not an isolated benchmark: two test jobs overlap and native packaging briefly ran alongside it. Default development/CI concurrency remains J=1. The earlier J=1 run was interrupted after its first 20 browser scenarios passed; it is not counted as a completed full run.

Readable build took 0.316 s and packing 8.971 s. Structured evidence: `dist/test-logs/2026-11-16T09-44-08-689Z-17292/results.json`. The report includes child overhead, per-scenario context load/scenario phases, seeds, ticks/epochs and every executed assertion. The full CLI retained all old scenarios and added nine maintained checks; three formerly manual world sweeps are separately registered in stress.

The following costs have different scopes: the original column is rounded child wall time from the exploratory baseline; the new column is the scenario record duration (browser context initialization included, process startup/close reported separately). Workloads/assertions and concurrency changed. Use the isolated comparison above for speed claims, and this table for locating expensive scenarios. A dash means no corresponding automated baseline.

| Scenario | Original exploratory seconds | New scenario seconds | Assertions | Load seconds | Scenario phase seconds |
|---|---:|---:|---:|---:|---:|
| `smoke` | 116 | 41.866 | 8 | 8.479 | 33.377 |
| `det` | 69 | 69.168 | 3 | 8.484 | 60.519 |
| `features` | 22 | 8.083 | 23 | 3.997 | 1.860 |
| `spearman` | 25 | 5.973 | 24 | 4.212 | 1.715 |
| `kingxp` | 24 | 7.018 | 26 | 3.881 | 3.097 |
| `compat` | 118 | 7.407 | 8 | 3.864 | 3.497 |
| `bossabil` | 21 | 5.299 | 5 | 3.763 | 1.498 |
| `envoy` | 22 | 4.924 | 5 | 3.662 | 1.226 |
| `ruins` | 62 | 6.229 | 4 | 3.696 | 1.679 |
| `events` | 18 | 4.902 | 39 | 3.765 | 1.091 |
| `traps` | 27 | 5.154 | 7 | 3.836 | 1.277 |
| `bastion` | 19 | 7.157 | 7 | 3.680 | 1.650 |
| `research` | 20 | 5.384 | 26 | 4.201 | 1.132 |
| `market` | 19 | 5.237 | 14 | 3.778 | 1.403 |
| `quests` | 36 | 13.051 | 23 | 3.759 | 9.270 |
| `ui` | 23 | 6.473 | 68 | 3.660 | 2.668 |
| `waves` | 37 | 25.042 | 20 | 3.664 | 21.320 |
| `save` | 26 | 10.803 | 5 | 3.685 | 6.005 |
| `command_contract` | — | 4.334 | 12 | 3.590 | 0.707 |
| `azerty_probe` | — | 4.818 | 30 | 3.692 | 1.076 |
| `mp8` | 135 | 166.805 | 26 | 10.108 | 156.697 |
| `mpk` | 142 | 83.986 | 11 | 11.746 | 72.239 |
| `mp_kxp` | 97 | 71.872 | 9 | 12.183 | 59.689 |
| `mp_events` | 76 | 60.749 | 26 | 21.521 | 39.228 |
| `mp_resync` | 71 | 29.595 | 5 | 8.954 | 20.641 |
| `mp_quests` | 68 | 132.461 | 27 | 9.704 | 122.757 |
| `mp_convoy` | 59 | 38.366 | 5 | 11.130 | 27.237 |
| `mp_build` | 168 | 58.216 | 176 | 24.365 | 33.851 |
| `mp_resync_deep` | 146 | 139.250 | 19 | 8.488 | 130.763 |
| `mp_soak` | 250 | 176.134 | 8 | 15.530 | 160.604 |
| `mp_cut` | — | 63.179 | 5 | 28.720 | 34.460 |
| `observer` | — | 18.178 | 23 | 16.274 | — |
| `architecture` | — | 0.535 | 25 | — | — |
| `trap_controls` | — | 9.205 | 16 | 5.330 | — |
| `tools` | infra failure | 7.651 | 9 | 5.814 | — |
| `runner` | 0 | 0.007 | 99 | — | — |
| `desktop` | 0 | 0.046 | 67 | — | — |
| `gameplay_fast` | — | 0.001 | 29 | — | — |
| `faults` | — | 0.506 | 18 | — | — |
| `browser_faults` | — | 165.186 | 19 | — | — |

Assertions are executed claims, not a coverage percentage. Composite scenario checks do not imply exhaustive state coverage. Later focused runs verify the more granular recovery/convoy assertions added during final review; their counts are reported with repeatability results.

Targeted browser mutants were killed by named assertions:
- `command_contract ownership`: `foreign selection falls back to guest castle`, `foreign selection preserves host stock`, `king queue owner`, `host stock untouched`, `guest pays king cost`.
- `command_contract dropped-command`: `switch enqueues exactly once`.
- `spearman damage`: `stats`, `reach`, `bigBonus`, `rebelBonus`.
- `traps trap-damage`: `exact trap damage`.
- `bastion sapper-repair`: `sappersRepair`.
- `bossabil frost-damage`: `frost`.
- `save save-traps`: `save round trip state`, `deterministic continuation`.
- `save save-terrain`: `every persisted typed-array byte restored`.
- `trap_controls ui-demolition`: `demolition removes trap`, `demolition clears both trap meshes`.
- `trap_controls trap-mesh-invalidation`: `demolition clears both trap meshes`.
- `waves wave-water`: `noneStuck0`, `noneStuck9`, `waterTraversalNotDeletion`.

The unchanged controls passed; launch failures, exceptions and malformed/empty results do not count as mutant kills. The trap regression also failed on the original production build before the fix (duplicate preview stayed green, demolition preview was absent and the map entry remained). The exact same requirements now pass, including trusted input and removal of both trap meshes. Wave-water controls pass with living escape; no further wave simulation change was needed on this v94 branch.

## Final verification and practical limits

The initial full pass was followed by focused validation after final review fixes. All **11 multiplayer scenarios passed again** after separating scenario randomness from ambient startup/audio draws: `dist/test-logs/2026-11-16T10-50-22-717Z-392/results.json` (494.40 s, J=2). The source change is confined to the fixture; production lockstep, RNG algorithm, command lead and resync are unchanged.

The final visibility checks passed `smoke` (9 assertions) and trusted `trap_controls` (17 assertions): `dist/test-logs/2026-11-16T10-47-09-146Z-3708/results.json`. Boot progression uses the production 4–12-frame rule across browser turns, followed by a bounded condition wait for the curtain fade. No test removes the DOM overlay. Binding readiness alone is deliberately sufficient only for nonvisual scenarios.

The final targeted score is **15/15 relevant source mutants rejected**: three pure-rule and twelve browser/game/UI faults. The last stuck-curtain control and mutant are in `dist/test-audit/startup-fault-proven.log`. A preliminary class-only curtain mutation was excluded from that score because the production fallback timer still removes the overlay; the final fault disables both fade and removal. This validates an actual requirement violation rather than counting any changed implementation as a kill. Focus one fault during development with `python tools/browser_faults.py startup-curtain`; omitting IDs runs all controls/faults.

| Additional seeded coverage | Completed cases | Scenario time | Assertions |
|---|---:|---:|---:|
| Convoy delivery/refusal journeys | 36 | 42.37 s | 76 |
| Stable linked/cut route lookups | 120 | 88.26 s | 244 |
| Dense wave-three worlds | 24 | 604.66 s | 50 |

The two convoy sweeps completed before an interruption; their individual completed records are retained in `dist/test-logs/2026-11-16T09-58-00-111Z-21112/results.json`. That interrupted aggregate is not counted as a passing run. The wave sweep and final granular convoy/build checks completed in `dist/test-logs/2026-11-16T10-09-45-065Z-7584/results.json`. Dense worlds spawned roughly 6,000–12,000 enemies; this is intentional stress cost, separate from daily core coverage. No assertion was relaxed to obtain these results.

Before/after production comparison passed **146 model signatures**, **six nonzero audio peak/RMS summaries**, and **three repeated 6,000-tick fingerprints per artifact**. Paired CPU medians were 14,338 → 14,292 ms; this small difference does not establish an engine speed change. PCM hashes differed and remain diagnostic, as they already vary in unchanged Chromium. Evidence: `dist/test-audit/runtime-parity-final.json`. The only intended production behavior change is the trap preview/demolition correction.

The isolated performance tier passed all eight requirements with one warmup and three measured production samples: 13,801 / 13,498 / 13,442 ms (median **13,498 ms**). Automation-visible cold startup measured **16,350 ms**, including initialization, actual boot frames and the curtain fade; automated startup skips the normal intro cards through the existing production webdriver path. Synchronized software-rendered frame samples were 7.4 / 1.2 / 0.7 ms. JS heap used was about 57.1 MiB plus 158.7 MiB backing storage at the defined post-scenario measurement point. These are measurements, not real GPU FPS or memory-leak guarantees. `dist/test-logs/2026-11-16T10-45-09-658Z-16208/results.json` records browser, platform, renderer and phases. The earlier JavaScript-array/JSON parser failure was corrected with safe literal parsing; no fingerprint was changed. A five-second whole-startup guard was also rejected: cold software rendering legitimately needs more than five seconds. The final helper bounds actual boot frames and separately waits for the production fade, without extending that fade deadline.

`profile.py` completed with the same pinned fingerprints. Text layout checks passed all nine languages at **1280×720 and 960×640**, with zero canvas/HTML overflow and no page errors. Actual gameplay/HUD captures at both sizes were inspected after fixing startup visibility; preview color, target position and mesh removal are also asserted programmatically. Forest occlusion in the captures is not a per-pixel trap-visibility guarantee.

Windows x64 and Linux x64 packages built successfully and both embedded HTML SHA-256 hashes matched the packed browser asset (`c9c4d0b04b85695d…`). Evidence: `desktop-package.log` and `desktop-hashes.json` under `dist/test-audit/`. This is packaging and actual IPC-boundary evidence, not a claim that native installers/macOS or real OS dialogs were exercised. No release, version change, commit or remote CI run was performed.

Three final **same-input recovery runs passed 3/3**, without retries. Every peer in every run used seed **138.97090672980994**, castle sites **[[772, 1047], [730, 493]]**, finished at tick **724**, epoch **1**, and production hash **-496846686**. Each run executed eleven recovery requirements and compared matching-tick state/RNG sequences. Durations: 29.40, 23.97, 24.03 seconds. The earlier three passing runs with differing ambient-derived seeds are not counted as identical-seed evidence. Raw repetitions and aggregate: `dist/test-audit/seed-repeat-*.log` and `reliability-verified.json`.

Final static gates passed: architecture, ESLint, formatting, Python compilation and whitespace checks. Fast coverage remains about 1.3 seconds on this host; no Chromium is required.

## New test and utility responsibilities

- `assertions.js`, `node_report.cjs` and `test_result.mjs`: executed assertion records and strict success/error contracts; runner negative cases exercise malformed, missing, duplicate, empty and contradictory results.
- `browser_fixture.py`, `browser_suite.py` and `mp_harness.py`: isolated production initialization, explicit readiness/frame scheduling, batched browser lifetime, bounded process cleanup and matching-tick relay.
- `mp_observer.js` / `observer_contract.py`: diagnostic serialization, RNG-value tracing, audited view-state exclusions, bounded detail retention and deliberate fractional-health/movement/research/trap/terrain/role/scalar/RNG faults.
- `gameplay_fast.mjs` / `mutation_check.mjs`: production RNG and traversal boundaries with focused source mutants and unchanged controls, without WebGL.
- `command_contract.js`: real enqueue/order/owner resolution and stock/queue consequences, including foreign-building fallback to the local castle.
- `trap_controls.js` / `trap_controls.py`: affordable/invalid/duplicate previews, exact payment, geometry population/removal, repeated demolition and trusted browser pointer input.
- `build_test_faults.mjs` / `browser_faults.py`: disposable bundles of actual production code; controls must pass and mutants must fail behavior assertions. Source checkout remains unchanged.
- `benchmark.py`: one warmup and three measured production CPU samples, pinned fingerprints, startup phases, synchronized rendered frames, renderer identity and JS heap. It reports measurements unless a machine-specific budget is supplied.
- `tools/test_all.sh` and `tools/build.sh` remain thin root-relative compatibility wrappers. `tools/release.sh` builds once, checks the selected local cases against that artifact, then relies on CI for full/release world coverage. `build.mjs` and `build_dist.mjs` retain production bundling/compression; no release compiler or compression algorithm was replaced.
- `profile.py` retains production CPU sampling but uses explicit readiness. `fitcheck.py` waits for local fonts and advances explicit frames through each menu instead of sleeping between screens. `qa_shots.py`, `repro.py` and other preview tools remain manual diagnostics; their requested animation/screenshot waits are intentional, not suite readiness mechanisms.

## Remaining limits

- Local loopback message relay does not exercise PeerJS signaling, real WebRTC, packet loss, internet latency, reconnect handshakes or two physical computers. Existing disconnection/resync scenarios cover application state, not the complete transport stack.
- Multiplayer diagnostic hashes cover the listed authoritative components, not every byte of every world array. Stair metadata is sampled at 30-tick checkpoints; complete root typed-array byte equality is checked by the save round trip. `mp_build` emphasizes trusted input, ownership/mesh postconditions and production hashes, while the other multiplayer scenarios provide the wider per-tick observer.
- Save checks protect every persisted root typed-array byte, selected object fields, continuation and shared references. Independently captured historical saves and exhaustive graph comparison are still needed before claiming complete backwards compatibility.
- Most UI tests inspect behavior/layout state; packed smoke submits real WebGL and reads pixels. Real GPUs, physical keyboards, touchscreen hardware and native OS integration require separate acceptance testing.
- Stress scenarios may reveal legitimate unhandled world/navigation cases. Their assertions must not be relaxed to obtain green runs.
- Performance reports must be compared on the same browser, hardware, driver, rendering mode and power profile. `PERFORMANCE_MAX_SIM_MS` supplies an optional calibrated CPU budget; absent a budget the performance tier measures behavior and reports timings without inventing a universal threshold. GPU frames include synchronous readback and are not player frame-rate measurements.
