# hd-coop: determinism audit of the recent studio additions (read only, one fix)

Scope read: ai/wave-boss.js, gameplay/ruins.js, envoy / engineer / sappers / orchard / bell / sanctuary blocks and the build-queue (war room) in
gameplay/simulation.js:55-101, wave events in gameplay/waves.js:36-45, bastionHas in gameplay/economy.js:77, RUINS in world/terrain.js:42-55,
persistence/save-format.js (svMigrate / svFix), rendering/ruins.js, plus the diff of v91..HEAD in multiplayer/, core/, persistence/restore.js.

## Fixed
- gameplay/ruins.js:18 (was `ruinsState.t`): the 0.5 s loot timer was a module variable, not in SAVA and not reset by reset() / resync.
  Each co-op machine could start at a different phase (leftover from a previous solo game, or a resync that restores everything but
  this timer), so the same ruin was looted on different ticks and the resource totals (hashed in mpHash) diverged. It now fires when
  `floor(time*2)` changes, a pure function of sessionState.time and dt. `ruinsState` removed (no other user).

## Checked, no problem found
- wave-boss.js: all timers (`bt`, `bs`) and fields (`boss`, `bn`, `bmax`, `sv`) are on the unit (saved whole), absent-field tolerant for v91 saves
  (`bn|0`, `bs||8`, `bmax||hp`). Summons use `rnd` (= Math.random, which is the seeded MP.simR during update) and `mkU`; puff / ring / snd / shake
  go through the REALR wrappers in co-op (multiplayer/commands.js:83,85). Units pushed during the unit loop are iterated in array order on both sides.
- waves.js events (wolf pack, eclipse, envoys, meteors, caravans): only sessionState.waveN, seeded `rnd`, ordered loops over RESP and units.
  `hudDisplayState.msgT` is read only to choose the displayed text. The Autosave `setTimeout` is solo only (`!MP.on`).
- simulation.js envoy / engineer / sappers / orchard / bell / sanctuary: stable array order, per-struct timers saved with the struct, `b.envT||0` absent-tolerant.
- economy.js bastionHas: cache key (time, structs array, length). Intra-tick reuse is the same on both machines (same call sequence in the sim); UI calls
  happen between ticks and the first sim call of the next tick always rebuilds because time has advanced. Fragile if someone calls it from mpExec (does not today).
- terrain.js mkRuin: pure hash of (chunk, SEED), reads only tiles of its own chunk (x,y in 4..27, 3x3 neighbourhood stays inside), runs before sealAround of that
  chunk, and no seal can touch a chunk before it is generated. In co-op chunks are generated only by mpGen (2 per tick, GORD order, GI is in SAVA) and by sim
  ensureAround; bgGen (performance.now budget) is solo only and rendering/terrain.js loadChunk refuses to generate in co-op. So RUINS holds the same entries
  on both machines. Iteration order of the Map differs in solo but loot of two ruins in one tick is commutative (integer sums).
- save: RUINS is in SAVA; an old save without it loads with an empty RUINS (restore.js resets absent keys), chunks already generated simply have no ruins.
  svMigrate twice (resync.js:40 then svDecode) is idempotent (v already SVVER).
- Local state: no selection, camera, rmotion or pref read in any sim path (rmotion / pref only in camera, weather, effects, autosave, background-loop with `!MP.on`).
  rendering/unit-animation.js:34 writes `u.sv` with Math.random in render (REALR in co-op); `sv` is read only by renderers, and boss sv=1.6 is set in the sim.

## Remaining (not fixed, low risk or needs a design call)
- persistence/save-format.js:44-46 svFix drops units / structs of unknown type but other objects (squad `sq`, `cap`, base `us` / `ss`, `tb`) may still point at
  the dropped objects. Only matters when loading a save written by a newer build; no effect between same-build co-op machines.
- multiplayer/resync.js:43 `for(k in D) svAssign` does not reset SAVA keys absent from the snapshot (restore.js:26 does). Same build on both ends, so no effect now;
  matters the day a host and guest run different builds or a new SAVA key is added without a default.
- terrain.js:52 mkRuin measures distance from castle 1 only (CX, CY): in a 2-castle game a ruin can appear near castle 2 (FLG excludes the pad itself). Gameplay, not sync.
- waves.js:41 eclipse multiplies hp by 1.15 after bossSpawn, so a boss spawned the same wave gets hp above `bmax` (bar clamps). Gameplay only.

Lead should run: mp8, mpk, mp_resync, save, and tests/ruins.js (loot still fires within 1 s of sim).
