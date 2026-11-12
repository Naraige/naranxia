# Naranxia journal

Newest first. One entry per batch or work session: what changed, what was verified, decisions, what is left.
Start of a session: read the top 2 entries and trust them (do not re-verify what is marked verified).
End of a batch: add an entry on top (3 to 10 lines), close the issues, keep CLAUDE.md in step if a rule or a tool changed.

## 2026-11-12 · v93

- Released as the batch the King asked for ("fait le tout", "ajoute la traduction pour les textes maj", "des ** qui trainent"): lots texts (#22, #25), convoys (#20), guide (#23), spearman 2 (#24), small fixes, swarm performance (#21, share only slightly down).
- Notes of v93 written in `game/NOTES.md` with their 8 translations (`docs/studio-texts/notes-v93*.json`); `tools/release.sh` now refuses untranslated notes (`node tools/textaudit.mjs --notes`).
- Verified: each lot's own tests (see the entries below); after the last merge `det` PASS with the hashes of lot "spearman 2"; CI green on 5973d54 (guide + spearman 2); the release workflow runs the whole suite on the final commit.
- Not verified: sounds of the guide by ear, a real AZERTY keyboard, F4 in the launcher, a real map cut by a river for the skipped convoy quest, two real machines, real GPU.
- Open for the King: default keys for torch and barracks rally point on AZERTY (their old keys are now digits 4 and 6; T and Y are taken by trebuchet and raise), rebel spearmen shares (1/4, 1/3, 1/2), guide sound level, example amounts in guide clips, swarm options that change behaviour (10 Hz step, cell order, pressure per cell).
- CLAUDE.md still to update (new tests `ui`, `mp_quests`, `mp_events`, tools `textaudit.mjs`, `qa_shots.py`, swarm line): needs the King's word since agents must not edit it.

## 2026-11-12 · v93 lot "small fixes": convoy quest skipped, guide closes, AZERTY digits, quest arrow, shots tool (hd-qa worktree, not merged, not released)

- King: "fait le tout" on the leftovers of the v92 pass. Six small items, nothing under `game/` or `announce/`.
- Convoy quest (co-op): skipped for both, without reward, when no convoy can go: `convoyLinked()` in `multiplayer/convoys.js` floods the walkable land from each castle (`bfsW`, small rectangle first, then the wide one) and says yes when a castle tile or a peasant of the sender is in the partner's flood, or when a flood comes within 7 tiles of the other castle (the rule of the command); a fallen castle also skips. Looked at when the quest comes up, then every 30 s of simulation time (`QST.ct`, saved, so both machines look at the same ticks, also after a resync). `qTick` now pays a fulfilled quest before it looks at the skip. Message "Quest skipped: {0}" and "Skipped" on the row of the quest log (2 new keys, 8 languages, `docs/studio-texts/fixes-v93.json`).
- Video guide: `guideWatch()` (called by `drawUI` every frame) closes it when a game starts or resumes under it, when the player is back on the title, and when the game ends while it plays (co-op); in that last case the game view comes back so the end panel shows.
- Texts: "All visible {0}s selected" and "All your {0}s selected ({1})" reworded in FR, ES, DE, IT, PT so the unit name stands alone ("Unités visibles sélectionnées : {0}"); no other key glues a suffix. `tools/langcheck.mjs` now fails on `{n}s` in any of the 8 languages.
- AZERTY digits: confirmed on the unchanged build (headless, `key:'&', code:'Digit1'`: no peasant; Shift + digit goes to the control groups; `à` does nothing; the 4 key types `'` and placed a torch). `input/desktop.js` now takes an unshifted digit-row key by `e.code` unless the typed character is a key the player chose himself (`kbCustom`, so keys saved from an AZERTY keyboard keep working); when rebinding, a digit-row key that types a sign is stored as its digit, so the settings show the digit. `KB` and `dk_keys` keep their format.
- Quest arrow (`ui/quest-marker.js`): never on the HUD. Its tip stays under the top bar and the centre bars (raid, boss, goals, King: new `hudDisplayState.cbar`); a building whose roof is behind them keeps a lowered arrow; a building off screen or behind the menu, the tabs or the minimap gets an arrow on the edge of the free screen, turned toward it.
- `tools/announce_shots.py`: writes to `dist/announce-shots/` (`SHOT_OUT` for another place), never under `announce/`. `tools/shots/_prelude.js`: `startWave(n)` starts the wave as the simulation does (`waveOn`, `hordeOn`: without them the night never fell) and `calm(seconds)` gives the other pictures a real countdown.
- New quick test `ui` (`tests/ui.js`: 12 key cases, arrow sweep of 135 camera positions, 4 guide cases); `tests/quests.js` extended (convoy quest stays when linked, waits 30 s, `ct` kept by a snapshot, skipped without reward behind a closed ring of walls, paid first when already delivered, same twice).
- Tests (2 cores shared, load 3 to 6): `ui` PASS, `quests` PASS, `tools` PASS (908 s, the load), `det` PASS with the hashes of lot "spearman 2" unchanged (1289907662, 78342706, -1731518221, 1421632697, -2023083426, -766400875, 432483754, 1830404059), `mp_quests` PASS once (1997 equal hashes, convoy quest paid to both). `textaudit` table OK, 0 dead key in the v93 block; `langcheck` 0 / 0 / 0. Seen once: `04-night.png` (dark, torches lit, "Wave 3 / Night") and `01-bastion.png` ("Next 1:35").
- Not verified: a real AZERTY keyboard and a real two-machine game; the edge arrow by eye (positions and directions are tested, no picture taken); the time of the route check on a cut map (two wide floods once; the first version with path searches took 1.4 s and was replaced, the flood version was not timed); pictures 02 and 03 not looked at; `mp8`, `mpk`, `mp_resync`, `mp_convoy`, `save` not run (CI).
- Left to the King: on AZERTY the torch (`'`) and the barracks rally point (`-`) defaults are now the 4 and 6 keys, which train a bannerman and build a wall: two new defaults to choose; a castle walled in without a gate, with every peasant inside, also skips the convoy quest; the night picture shows an "Achievement" toast over the "Night falls" line and the minimap is nearly black in every picture (as before); `CLAUDE.md` does not list the `ui` test yet.

## 2026-11-12 · v93 lot "texts": Update page translated, registers (#22, #25) (hd-localization worktree, not merged, not released)

- Update page (#22): `core/notes.js` `notesLines()` turns `game/NOTES.md` into lines; `**Title**` (or `# Title`) is drawn with `l.section`, a dash line as a bullet, the intro as a plain paragraph; `**`, backticks, `__`, links are stripped. Each stripped line is one key, looked up whole by `L()` (exact match first), English when missing. No other `**` reaches the screen (searched the sources and the tables).
- The 19 lines of the v92 notes translated in FR ES DE IT PT (`docs/studio-texts/notes-v92.json`, block v93) and NL PL TR (`notes-v92-nl-pl-tr.json`, appended to `i18n/langs/*.js`).
- Guard: `node tools/textaudit.mjs --notes` (check 0 of the audit, also in the full run) exits 1 when a line of `game/NOTES.md` is not a key with all 8 languages or keeps a marker; `tools/release.sh` calls it before the version bump and the build. So each release: write the notes, add their translations, then release. Old notes keys then show as "reached by no source" in the audit and can be removed.
- Registers (#25), decided for the King ("fait le tout"): Portuguese = European, formal (the interface already said ecrã, guardar, rato, controlos, quinta, "está a ser", partilhar, câmara; Brazilian only in "zumbi" on 45 lines and 6 phrases): zumbi(s) to zombie(s), "Gerando", "Salvo", "Pressione ... selecioná-los", "Conserta", "se consertam", "se ferem", "encontrá-los" fixed. German = "du" everywhere: the Chronicle line "Haltet ... Euer Volk", 3 "Eure" lines, "Haltet das letzte Licht" and 4 title tips ("Baut", "Bildet", "Erforscht") to the singular; kept on purpose: "Haltet die Linie!" (order to the troops) and plurals speaking to both co-op players.
- Plurals: the English suffix `{1}` ('s') was printed by NL, PL and TR ("2 boers", "2 köylüs", "Chłopów: 2s"): the 7 peasant / villager / sapling keys reworded without it in the three files; NL "All your / All visible {0}s" and DE "Alle deine {0}s" reworded. `tools/langcheck.mjs` now counts a kept suffix as a fault.
- Verified: `textaudit` table OK and notes 0 problem, `langcheck` 0 / 0 for the three, `npm run build`, `npm test -- smoke tools` PASS (a first run under load timed out at page load). Seen by eye at 1280x720: Update page in French and German, top of the list (intro, both first headings, bullets), no asterisk, wraps inside the panel, no overflow reported.
- Not verified: the bottom of the page (Comfort; the wheel did not scroll headless); the guard with a failing notes file (nothing under `game/` was touched); NL / PL / TR by a native speaker; fitcheck not rerun (no button label changed length upward except tips drawn with fitting).
- Left to the King: FR / ES / PT "Tous vos {0}s" still glue an "s" to the unit name; NL "de {1}" in two repair messages ignores de / het; "Você" kept for "You".
## 2026-11-12 · v93 lot "convoys" (#20, hd-coop worktree, not merged, not released)

- Causes found on 120 seeded pairs (v92: 17 not delivered, the 1 in 7 of the QA probe). (a) 6 pairs: the land route exists but is a long detour, the 120 s of the whole trip ran out. (b) 8 pairs "no path / porters stay home or stop on the way": there is no land route at all (river, or a castle standing on a ledge of 25 to 800 tiles without a ramp: `levelGround` only flags ring tiles 1 level off, `siteOK` does not check the way out); the porters walked to the closest tile they could reach and stood there. (c) 3 pairs "stop 5 to 7 tiles short": same thing at the partner's end, his castle is on a small ledge and the closest tile is at its foot, just outside the 4.6 tiles.
- Fix, `multiplayer/convoys.js` only: a porter whose path ends within 8 tiles of the castle has arrived (also on the way home); `c.t` is now the time without progress along the path field (reset when `stepF` notes progress, `u.pfT`), 120 s, plus a hard cap `c.tt` of 900 s; a porter that cannot walk home after delivery goes back to work where it stands instead of staying a porter for ever; at the command, the route of the first porter is computed and, without a land route to within 7 tiles of the partner's castle, the convoy is refused at once with the existing text "The convoy cannot reach your partner" (nothing leaves the stock).
- Determinism: the check runs inside the command (`mpExec`), on simulation state only; the new counters are on `u.cv` (units are saved whole, so they survive a resync); `pfS` is not saved but is only compared by identity and both machines reload the same snapshot.
- Probe `tests/convoy_probe.js` rewritten: 36 well-mixed seeded pairs, one line per pair as it ends, "refused" pairs checked with a BFS 300 tiles wider than the pair (`bfsW` exposed in `debug/browser-console.js`). v92: 32 of 36 delivered. Now: 35 delivered (7 to 163 s), 1 refused (trial 28, sender's castle on a 30-tile ledge, not linked). The 13 other failing pairs of the 120: 5 delivered (25 to 185 s), 8 refused, none linked in the wide BFS.
- Tests (machine loaded 9 to 23, other agents): `mp_convoy` PASS (302 s), `mp_resync` PASS, `det` PASS (same game twice, same hashes; convoys are not in the det scenario, solo). `mp_quests` NOT green locally, twice: run 1 the convoy quest closed, 2857 equal hashes, no desync, no error, but the 6 s real-time waits of the test for the house and farm sites ran out under load (RESULT FAIL); run 2 the page did not load in 180 s (load 23). To rerun on a quiet machine or on CI.
- Not verified: a real two-machine game; the 103 pairs of the 120 that already worked were not rerun past trial 35; a pair whose porters other than the first have no route (their share comes back after 120 s as before).
- For the King (not done, rule choice): about 1 site in 12 puts a castle on a closed ledge or behind a river: the convoy quest cannot be done there until the player builds a ramp or a bridge. Either `siteOK` refuses such sites, or the levelling cuts a way down, or the co-op convoy quest is skipped when the two castles are not linked.
## 2026-11-12 · video guide lot for v93 (hd-menu-ux, issue #23, committed on the worktree branch, not pushed, not released)

- King: "fait le tout" on the four open points of the guide. Detail in `docs/studio-notes/guide.md`.
- Sounds in the clips: per-chapter `[time, sound]` lists played through `snd` (visual side, REALR) when the clip time crosses them; `snd` now returns the gain node of its voice so the guide fades its voices on pause, chapter change and close. Sound on/off and the effects volume apply as everywhere.
- "Guide" row in the Esc menu (`drawGameMenu`): solo is stopped by the menu itself, the co-op lockstep is untouched, no command, nothing in SAVA.
- Five chapters (Traps, Seasons, Market and barter, Rebel camps and envoys, King talents): 14 in all, list rows shrink to fit (18 px at 1280x720), no list at 390x700 (header + previous / next).
- "Play the tutorial game" removed with `playTut` and its key (table, NL / PL / TR, guide.json). 20 new keys (`docs/studio-texts/guide2.json`, v93 block; NL / PL / TR).
- Seen once (headless, `tools/qa_shots.py` steps 10, 13a-13e, 14, 33-35): the 14-row list at 1280x720, the Traps, Seasons (winter), Market, Camps (tribute and event banner) and Talents clips, the 390x700 layout, the Esc menu with its Guide row, the guide over a running game. No page error.
- Tests: `quests` PASS, `det` PASS, `tools/textwidth.py` 43 captions x 9 languages all fit, `textaudit` 0 dead key in the v93 block, `langcheck` 0 missing. `smoke` and `tools` did NOT pass locally: 20 min timeout twice each with an empty log, machine load 8 to 14 on 2 cores; `smoke` on an untouched v92 copy timed out the same way in the same conditions, so the load is the likely cause, not established for `tools`. To rerun on a quiet machine or on CI.
- Not verified: the sounds by ear (no audio in headless), a real GPU / phone, a real two-machine co-op game with the guide open, native proofreading of the new captions.
- Left to the King: sound level and density; the amounts in the clips are examples.

## 2026-11-12 · v93 lot "spearman 2": rebel spearmen, F4 key (hd-gameplay, branch `worktree-agent-ab29372462c98b8a5`, not merged, not released)

- Issue #24, the King: "fait le tout". Decided for him: bonus x1.6 and price stay. Details in `docs/studio-notes/spearman.md` ("Lot 2").
- Rebel camps (`ai/kingdoms.js`, the AI kingdoms and their settlements, the only AI force with knights or archers) now train spearmen: share of the melee fighters by trait, merchants 1 in 4, wary 1 in 3, warlike 1 in 2 (`spearN`, `SPEAR_DIV`), at least 1 from 2 melee fighters on, always 1 knight kept; camp price 30 g 10 w 15 f. Soldier count per camp unchanged. No RNG added, nothing new in `SAVA` (units saved whole, trait on the camp); v92 saves load unchanged. `matBase` (old static camps) is dead code and was left alone.
- Default key of the spearman: `F4` instead of `\` (keys are matched by `e.key`; every letter and every character that is one plain press on both QWERTY and AZERTY is taken). Still rebindable; saved keys that still hold `\` move to F4 once per browser (marker `dk_keyv`), unless F4 is bound elsewhere (`loadKB` in `ui/settings.js`). A bound function key no longer triggers the browser default.
- No text added (so no `docs/studio-texts/spearman2.json`); the spearman texts of v92 are already in NL, PL, TR.
- `det` hashes CHANGED, as expected (a camp trains its first spearman at about 75 s): samples 1 and 2 identical to v92, 3 to 8 differ, the two runs equal. New reference (first field of the 8 samples): 1289907662, 78342706, -1731518221, 1421632697, -2023083426, -766400875, 432483754, 1830404059 (v92: 1289907662, 78342706, -118423406, -488580333, -981978411, -1779167516, -915779825, 103508539). `tools/profile.py` hashes will differ from v92 for the same reason (not run).
- Tests (2 cores shared, load 6 to 14): `det` PASS, `mpk` PASS, `features` PASS, `spearman` PASS (extended: share rule, three grown camps 7k2s / 6k3s / 5k4s with 4 archers each, losses replaced in kind, rebel spearman 17.6 on a brute, F4 queues a spearman, 4 key migration cases). The first `spearman` run of the suite failed on a page load over 180 s (machine load, the base build did the same), not on the test.
- Seen: one picture 1280x720 of a warlike camp, 4 knights and 4 spearmen in the camp colour in line before the keep (`dist/rebel-spearmen.png`, not committed).
- Not verified: `mp8`, `mp_resync`, `save`, `events`, `envoy` with the change (CI will run them); a real AZERTY keyboard; F4 in the Electron launcher and on laptops where F keys need Fn; a long game (camp survival with fewer knights).
- Found, not changed: on AZERTY the digit defaults (peasant 1, knight 2 ... and stances 1 to 4) need Shift, and Shift + digit is taken by the control groups: read in the code only. Proposed: match digit actions by `e.code`.
- Left to the King: the shares per trait; spearmen replacing knights 1 for 1 (or 3 for 2 at equal price); F4 or another key; the AZERTY digits.
## 2026-11-12 · swarm performance, issue #21 (hd-perf worktree, not merged, not released)

- Cause of "36 % instead of 20 %": nothing grew. The same profile on 16526d6 (the commit that wrote "~20 %") gives `swStep` 35.2 %, `swPick` 9.7 %, `swDn` 4.9 % of the simulation, as at v92 (35.0 / 9.2 / 4.7). The 20 % was the share of the whole profile, which is half `(program)` (time outside the page script, not simulation): `swStep` is 17 % of that at v92. In wall time the swarm (everything inside `swUpdate`) is about 70 % of the 6000-tick scenario (26 000 zombies).
- Changed, `gameplay/swarm.js` only, same results: way points of each lane flat in pixels and the lane's castle read once per step (`swLanes`); aim jitter and walking speed from tables built with the same expressions (`SWJ`, `SWV`); `swPick` visits only the set bits of the mask, in the same order; one flag array for units and structures (`UNF` bits 1 and 2, `SNF` gone); local names for the `SW` arrays in `swStep`; `swDn` written inline; `fv1` for a single path field.
- Hashes: the 8 hashes of `tools/profile.py` identical to the baseline taken on b28db24 before the first change, after each step and at the end (11 runs); `det` PASS.
- Numbers, 6000 ticks, same machine, runs alternated, swarm time = time inside `swUpdate` (load 1.1 to 1.8): before 39.6 / 34.6 / 39.5 / 36.2 s in all, swarm 27.3 / 25.3 / 27.4 / 26.0 s; after 37.1 / 32.5 / 32.4 / 29.6 s, swarm 24.4 / 22.5 / 21.3 / 20.8 s. Means: 37.5 to 32.9 s (-12 %), swarm 26.5 to 22.2 s (-16 %).
- Profile shares of the simulation (script time only): before (load 1.4 to 3.5, then 3.5 to 6.3) swarm functions with `fv` 60.3 / 59.1 %, `swStep` + `swDn` + `fv` 43.2 / 40.9 %, `swPick` 9.2 / 8.7 %; after (load 1.3 to 2.2) 56.6 / 57.8 %, 39.4 / 40.8 %, 8.1 / 7.9 %. The share moves little because it is a share: the gain is in the times.
- By step: flat way points alone gave nothing visible in the profile under load (59.3 %); tables + set bits + one flag array + local arrays gave most of the gain (swarm 22.7 s mean over 4 runs); `swDn` inline + `fv1` are within the noise (22.2 s), kept.
- Not done, changes of behaviour (hashes would change, still deterministic), for the King: swarm step at 10 Hz instead of 20 Hz (about half the swarm time, movement drawn by interpolation as today); zombies stepped in cell order (better memory locality, gain not measured); crowd pressure once per tile instead of once per zombie.
- Not verified: the gain in a real browser with a GPU (measured in headless Chromium only), games with other sizes of horde, co-op tests other than `mpk`.

## 2026-11-12 · v92

- Released on the King's go ("sors la v92"): everything merged on release-v84 since v91 (block look, units and buildings B, mutants, last bastion, events, bosses, King XP, research paths, quests solo and co-op with marker, spearman, video guide, leaderboard, Update page, NL/PL/TR complete).
- Notes: `docs/release-v92/NOTES.md` copied to `game/NOTES.md`; 4 pictures retaken in `announce/img/v92/` (the "night" one is in daylight, two show an odd "Next" countdown).
- Verified before release: local smoke, quests, save, mp_convoy, mp_resync, mp_quests (3 of 3 on a fixed world), mp_events (2 of 2), det; the release workflow runs the whole suite.
- Known, not fixed (King: after v92): convoys fail on about 1 pair of sites in 7 (porters stop 6 tiles short, no path at start, or detour over 120 s); proposed fix in `multiplayer/convoys.js` (arrival within ~8 tiles, 120 s without progress). Swarm at 36 % of sim time: performance lot after v92.
- Not established: CI failure of mp_resync on 3e35792; a one-tick unit hash gap after a resync seen once under load in mp_events.
- Defaults kept without an answer: spearman x1.6 and key `\`, guide silent, "Play the tutorial game" kept, PT/DE register, NL plural.

## 2026-11-12 · co-op tests made stable (mp_quests, mp_convoy, mp_events, mp_resync); convoy defect found, not fixed (hd-qa, not released)

- Game defect, NOT fixed (rule decision for the King): a co-op convoy between two valid sites fails in about 1 pair out of 7 (probe `tests/convoy_probe.js`, 36 random pairs 24 to 60 tiles apart: 31 delivered in 10 to 71 s, 5 not). Three ways: porters stop about 6 tiles from the partner's castle with no order left and never come within the 4.6 tiles that count as arrived (2 pairs); no path found at the start, porters stand at home (2 pairs); route so long that the 120 s of `convoyStep` run out (1 pair, another delivered at 120 s). The goods then go back ("The convoy cannot reach your partner"). Zombies are not the cause.
- Smallest fix proposed (`multiplayer/convoys.js`): count a porter as arrived when its path is finished within about 8 tiles of the castle, and make the 120 s a time without progress instead of the whole trip. Both change a rule slightly; `det mp8 mpk mp_convoy mp_quests` to run after.
- `mp_quests`, `mp_convoy`: world and sites fixed (seeded `Math.random` for the roll and the site search, in ONE page call: frames between two calls draw random numbers), sites (1126,624) and (1101,599), convoy delivered in about 10 s. `mp_quests` also compared the stocks of the two machines read a few ticks apart (failed once under load): removed, the per-tick hashes cover them.
- `mp_events` (failed twice on CI): fault of the test, not a time budget and not the game. It required the gold to be exactly unchanged during one second; a peasant bringing 10 gold in broke it (depends on the random site; reproduced locally 1 run in 2). Now a tolerance below the tribute (120). Its hashes are keyed by epoch (a tick replayed after a resync is not compared with the old one) and the epoch is printed; one local run under load 9 showed a unit-hash difference at one tick right after the resync, not seen again in 2 runs: if it comes back the log now says which epoch.
- `mp_resync` (failed once on CI at 292 s = its whole 220 s wait): locally the resync takes 5 to 9 s. The wait needed to SEE the resync flag between two polls; it now also accepts the epoch having moved. Budget unchanged.
- `tools/test_all.mjs`: a failing test prints the last 15 lines of its log (the CI artifact cannot be downloaded).
- Runs on the merged `release-v84` (machine loaded, 5 to 10): `mp_quests` PASS x3, `mp_convoy` PASS, `mp_events` PASS x2, `mp_resync` PASS, `det` PASS (8 hashes identical to the reference). Before the fixes: `mp_events` 3 PASS / 2 FAIL, `mp_resync` 2 PASS.
- Not verified: the cause of the CI failure of `mp_resync` (no log), the convoy defect in a real two-machine game, the next CI run.

## 2026-11-12 · full pass merged, King's choices (branch release-v84, not released)

- Merged: localization pass (NL/PL/TR complete, proofreading, fit fixes) and QA pass (HUD bars vs quest panel, title hint, save test without rendering, mp_quests / mp_events / save in the quick suite).
- King's choices: HAMMERDAWNSTUDIO without a space is wanted; red banners over the quest panel stay; grass tufts lighter (BLADE colours in `rendering/terrain-props-blocks.js`); one research name "Masonry" (was also "Stonemasonry"; keys renamed in sources, translations, NL/PL/TR); swarm performance lot after v92.
- Verified locally after the merges: smoke, quests, save (83 s), mp_convoy, mp_resync PASS; title screen seen with the Masonry hint.
- NOT stable: `mp_quests` failed 2 of 4 local runs at the convoy step (goods returned, 19 other quests paid, no desync). Cause not established (random sites not linked, or a real convoy defect); given back to the QA agent. Logs `dist/mpq_fail/`.
- Not seen by eye: the lighter tufts in game.
- Left before release: stable mp_quests, green CI, the 4 screenshots of `announce/img/v92/`, the King's go.

## 2026-11-11 · localization pass before v92 (hd-localization worktree, text only, not merged, not released)

- Audit (static, new `tools/textaudit.mjs`): 1463 keys, the 414 keys new in v92 checked. FR ES DE IT PT: none missing, `{0}` kept everywhere, no French "tu". Six texts were English only: barter title and message ("Swap 50 wood for stone", "Swapped 50 ..."), "You get N wood / stone / food", "Saving...": added in 8 languages (`docs/studio-texts/localization-v92.json`).
- Removed 9 keys no source uses: 4 from quests lot 1 ("Power", "The long night", two old descriptions), 5 from the old tutorial bar (2 steps, "Tutorial {0}/{1}", "Tutorial: on / off"). Removed 5 v92 copies of keys an older block redefines (the lower block wins: "Exit to desktop", "Co-op", "Best runs", "Tutorial", "Cancel"), no visible change. Table now 1460 keys.
- Dutch, Polish, Turkish are shipped languages (language list, announced): each lacked the 414 v92 keys, now 0 missing (`node tools/langcheck.mjs`), 415 lines added per file.
- 40 corrections in the v92 texts: German "Sie / Ihr" back to "du" in tooltips, "Bollwerk" to "Bastion", Portuguese "Recebes" and "Levanta-te" to the formal form, "zombies" to "zumbis", Italian "zombie" to "zombi", "cancello" to "porta", "accampamento" to "campo", French "Invoquez" to "Appelez", "météorites" to "météores", small typos.
- `tools/fitcheck.py 1280 720 x 9`: 3 overflows, all in the 34-wide peasant task buttons (FR "Construire", PT "3 inativo(s)", PL "3 bezczynnych"). Shortened: "Build" FR "Bâtir", "{0} idle" FR / ES "libres", PT "livres", NL "vrij", PL "wolni". Rerun on FR, PT, PL: 0 (the idle label only shows when peasants are idle at that moment, so a clean run is not proof). fitcheck now takes a language list (`1,5,7`).
- Quest panel, quest log and guide captions (fitcheck opens neither): new `tools/textwidth.py` measures them with Inter Medium outside the browser, 21 quests and 27 captions in 9 languages, all fit. Not looked at in a browser.
- `docs/release-v92/NOTES.md`: "New events" listed blood moons and caravans, both already in v91; line now says wolf packs, eclipses and meteor showers, and that caravans and rebel envoys now ask you to choose. To confirm with the King.
- Not verified: NL / PL / TR texts read by a native speaker; guide chapter list and quest log by eye; "eleven new buildings" and "levels up to 5" in the notes; no gameplay test run (text only).
- To the King: Portuguese mixes European and Brazilian forms (pick one); German lore lines use "Ihr / Euer" while the interface uses "du"; Dutch plural "2 boers" (old keys with `{1}`) is wrong; add `textaudit.mjs` and `textwidth.py` to the tool list in CLAUDE.md.
## 2026-11-11 · full QA pass before v92 (hd-qa worktree, not merged, not released)

- Base `release-v84` d49e027 (CI green on it: quick suite with `mp_resync`, `mp_convoy`). Nothing under `game/` or `announce/`, nothing pushed. Pictures: `dist/qa/shots/` (not committed), tool `tools/qa_shots.py`.
- `save` is NOT slower: alone it took 562 s (tPack 223 s, tLoad 248 s) only because the live loop draws a software-WebGL frame at every `await` of pack / load; with `renderer.render` stubbed the same test gives tPack 1.3 s, tLoad 1.6 s, 91 s in all, `same0` true. `tests/save.js` now stubs it (one real frame after the load). The frames got heavier with the look / block lots, not the save code.
- New test `mp_quests` (2 clients): wood, ore, house, farm, barracks, knights paid to BOTH players at the same tick; 3 + 4 spearmen trained and fighting on both; convoy quest closed by a real delivery (+30 food each); 2940 equal hashes. Passed 2 runs out of 2 after a placement retry was added (a first run failed in the test itself: spot refused by the build rules).
- Quick suite now also runs `mp_quests`, `mp_events` (PASS, was in no suite) and `save` (cheap now). `mp_convoy`: the second site was searched in 300 random tries only (my first `mp_quests` run found none with the same code): 20000.
- Fixed (render / layout / text only, no simulation change, `det` 8 hashes identical to the reference, `profile.py` hashes identical):
  - `ui/hud.js`, `ui/hud-state.js` (`barX`, `qbox`, `barsH`), `ui/quest-panel.js`, `ui/event-bar.js`, `ui/tutorial.js`: with a King, the message line, the caravan / envoy bar and the hint bar covered the right end of the quest panel (Log and x buttons). Wide screens: they move right of the panel; narrow and medium screens: the panel sits under the bars.
  - `ui/quest-marker.js`: the arrow above a building standing behind the quest panel was drawn over its buttons; it goes under the panel.
  - `ui/title-menu.js` + texts: title tip said "Research Stonemasonry in the castle menu"; it is at the Academy (new key, 6 languages + NL / PL / TR, `docs/studio-texts/qa-v92.json`).
  - `rendering/materials.js`: dry-grass strokes back (terrain keeps the `8.5` test); visible only with the block world off.
  - `docs/studio-boards/revamp/cap_boot.py` works again (class `go`, whole `#boot` line). `debug/browser-console.js`: `openGuide`, `guideState`, `openPicker`, `sitePickerState`, `icoPart` for tools.
- Seen by eye (1280x720 unless said): title without / with 10 scores, title 390x700, leaderboard, Update, settings (3 tabs), guide Build / Population / Walls / Research + 390x700, site picker in blocks, day HUD with King bar, quest panel, quest log (20, solo), markers (Build tab, barracks arrow, knight entry, King entry, market, guild, research, envoy, War cry), summer, autumn fog, winter, raid wave 10 with boss bar and caravan, spearmen in a fight (close), night (forced, `qa_shots.py` step 72: lit windows, torches, fireflies), HUD + quest log 390x700, 900x600.
- After the fixes, on the final build: `smoke quests events features tools save det` PASS, `mp_quests` PASS.
- Not verified: night falling by itself (it is driven by the frame loop, forced for the picture), hint bar by eye, quest log with 21 quests (co-op) by eye, far swarm, real GPU, phone / touch, sounds, launcher, `fitcheck` (not run), `mp_resync` / `mp_convoy` locally (CI).
- Profile (6000 ticks, 33.5 s): `swStep` 36 % of the run (CLAUDE.md says ~20 %), `swPick` 9.5 %, `update0` 5 %, `swDn` 4.7 %; swarm functions together ~57 %.
- Left for the King / other lots: NL / PL / TR miss 414 of 1464 texts (English shown; the v92 notes say "more languages"); big red banners ("KING NARAIGE HAS FALLEN") draw over the quest panel for 3 s; marker arrow of a King skill overlaps the top bar numbers; no marker when the building is under the HUD or off screen; grass tufts read as black dots from far (look B); "Masonry" and "Stonemasonry" both used; `HAMMERDAWNSTUDIO` without a space; restyle not started (far-swarm models, projectiles, stone banners, building re-grid).

## 2026-11-11 · video guide merged, old tutorial bar removed, pushed (not released)

- Merged `worktree-agent-aaffcd280bd956aae` (c35fc26): `ui/video-guide.js`, 9 scripted chapters on the menu canvas (no video file), opened by the Tutorial button; `TUTS` / `tutBar` / `TUT` / `dk_tut` and the Settings line removed, `hintBar` kept. Conflicts: journal and translations (both sides kept). Agent's entry below, notes `docs/studio-notes/guide.md`.
- Agent: `smoke quests det tools` PASS on its merged branch, det hashes unchanged. After this merge (with spearman): build, push, CI.
- Left to the King: rename or remove "Play the tutorial game", sounds in clips, guide from the Esc menu, more chapters.
- Next: the full pass asked by the King (test everything, improve everything), then his go-ahead for v92.

## 2026-11-11 · spearman merged and pushed (not released)

- Merged `worktree-agent-a32a61bc6cb6d6ef9` (93d2b76, b667670), no conflict. Unit `spearman` at the barracks: 85 HP, 11 dmg / 1 s, reach 36, x1.6 against brute and boss, 90 gold 30 wood 25 food, 15 s. Agent's entry below, notes `docs/studio-notes/spearman.md`.
- Agent on the merged result: `det features spearman quests mp8 mpk` PASS, det hashes unchanged by the unit. New test `spearman` in the quick suite. CI on the branch was green at 7f37d07 (timeout raised to 100 min).
- Not verified: title screen with the new pikemen, spearmen in co-op, `save` / `smoke` / `mp_resync` after merge (CI runs the quick suite).
- Left to the King: bonus 1.6 or 1.4, default key `\` (awkward on AZERTY), spearmen for rebels and AI, price and HP.
- Still running: video guide (also removes the old tutorial bar).

## 2026-11-11 · lancier (spearman): nouvelle unité jouable, allumée, non fusionnée, non livrée
- Demande du Roi: « oui tu peux creer le lancier » (les piquiers de l'écran titre n'existaient pas en jeu). Branche de worktree hd-gameplay, rien dans `game/`, rien poussé. Détail, tableau et mesures: `docs/studio-notes/spearman.md`.
- Unité `spearman`, caserne, dès le début: 85 PV, 11 dégâts / 1 s, portée 36 (chevalier 14: frappe par-dessus le premier rang), x1,6 contre brute et boss (`SPEAR_BIG`), 90 or 30 bois 25 nourriture, 15 s, 1 population. Pas de bouclier, pas de règle spéciale contre l'acide (moins de PV suffit).
- Courbe: par ressource contre les zombies ordinaires il vaut moins que le chevalier (13,2 contre 11,0 par DPS), par tête il vaut moins contre tout; meilleur seulement par ressource contre les brutes. Duels mesurés dans les notes.
- Câblage: règles, `hit()`, rang de formation, menu caserne, infobulle, panneau des troupes, carte d'unité, raccourci `\` réassignable, icônes, brouillard, zombie converti. Entraînement par la commande `buy` existante (co-op sans nouvelle commande); unités sauvées entières, rien dans `SAVA`.
- Look: `px2Spearman` (chapel de fer, jaque matelassée à la couleur du royaume, col, baudrier, couverture roulée) et lance `g2Spear` (palette gear2, pennon à la couleur du royaume); animation du hallebardier (estoc, lance droite au repos, inclinée en marche). Écran titre: les blocs de piques sont ces lanciers avec cette lance (`pikeGeo()` supprimé).
- IA et camps rebelles inchangés exprès: aucune lance dans la partie par défaut, hachages `det` identiques à la base.
- Textes: 8 clés en 6 langues (`docs/studio-texts/spearman.json`). Nouveau test `spearman` (`tests/spearman.js`, ajouté à la suite rapide).
- Vérifié avant fusion (branche seule): `det` (8 hachages identiques à la base d'avant quêtes), `features`, `mp8`, `mpk` (2e passage; le 1er a expiré au chargement, machine chargée), `save` (same0 vrai), `spearman` PASS; 3 captures 1280x720 (combat, menu caserne, carte d'unité).
- Vérifié après fusion de `release-v84` (quêtes, 3 conflits: journal, traductions, `tools/test_all.mjs`, les deux côtés gardés): `npm run build`; `det features spearman quests mp8 mpk` (résultats: `dist/spear/tests4.txt`); hachages `det` identiques à ceux de `release-v84` avec quêtes (ils ne diffèrent de l'ancienne base que par l'état des quêtes, pas par le lancier); une capture du combat.
- Non vérifié: `save` après fusion (SAVA non touché), `smoke` (build compressé), `mp_resync`, fitcheck, vrai GPU, mobile, lanciers en co-op à l'œil (aucun test co-op n'en forme), écran titre non regardé (piquiers changés de modèle), NL/PL/TR en anglais pour les 8 textes.
- Au Roi: bonus x1,6 contre les brutes (ou 1,4), touche `\` par défaut, lanciers chez les rebelles / royaumes IA (changerait les hachages `det`), galons de grade, prix.
## 2026-11-11 · guide vidéo derrière le bouton Tutoriel, ancienne barre de tutoriel retirée (branche hd-menu-ux, non fusionné, non livré)
- Demande du Roi: « make the tutorial more like a video guide ». Le bouton Tutoriel (T) du titre ouvre un écran lecteur (`ui/video-guide.js`, nouveau): 9 chapitres à gauche, « vidéo » à droite (légende, barre de progression, précédent / pause / suivant, enchaînement automatique). Détail, tableau des chapitres, reste à faire: `docs/studio-notes/guide.md`.
- Les clips ne sont pas des fichiers vidéo: scènes 2D scriptées sur le canvas du menu (320 x 180, fonction pure du temps), icônes des vrais bâtiments (`IC`/`ICT`) et sprites tirés ici des vrais modèles d'unités posés par `animUnit` (89 petits rendus, par tranches de 10 ms à l'ouverture). Rien ne touche la simulation: unités jetables hors `sessionState`, horloge murale, `Math.random` remplacé par `REALR` pendant les rendus.
- Décision du Roi: les quêtes remplacent l'ancienne barre de tutoriel en 5 étapes. Retirés: `TUTS`, `tutStart`, `tutEnd`, `tutBar` (`ui/tutorial.js` ne garde que `hintBar` et ses 3 astuces), l'appel dans `ui/hud.js` et `gameplay/reset.js`, `TUT` (`gameplay/traps.js`), la ligne « Tutoriel » des Options, la clé `dk_tut` (aussi dans `tools/announce_shots.py`). « Jouer la partie guidée » ouvre seulement Nouveau royaume.
- `release-v84` (quêtes) fusionné dans la branche; conflit dans `i18n/translations.js` (deux blocs v92), les deux côtés gardés. Textes du guide: 31 clés (`docs/studio-texts/guide.json`).
- Vérifié après fusion et retrait: `npm run build`; `npm test -- smoke quests det tools` ALL PASS (853 s, 275 s, 416 s, 474 s); les 8 hachages de `det` identiques à `dist/test-logs/det.log` du dépôt principal (18:59, release-v84 avec quêtes); captures 1280x720: guide (5 chapitres regardés en tout: Récolter, Former une armée, La nuit et la horde, Le Roi, Coop), en jeu (panneau de quête, plus de barre « Tutoriel 1/5 »); captures 390x700 et 760x360 du guide; `__ovf` vide; légendes: 27 x 6 langues mesurées hors navigateur avec Inter 500, aucune ne déborde (420 et 182 sur 2 lignes, 360 et 240 sur 1 ligne, colonne de 130 et 110).
- Taille du build compressé: +17 752 octets pour le guide (704 592 -> 722 344 mesuré avant la fusion des quêtes); 735 084 après fusion et retrait (base avec quêtes non remesurée).
- Non vérifié: vrai GPU, vrai téléphone, tactile, manette, clavier dans le lecteur (Gauche / Droite / Espace); 4 chapitres non regardés en image (Construire en 1280, Population, Murs et tours, Recherche); `rg` ne trouve plus aucune référence retirée, mais les traductions des 5 anciennes étapes restent dans la table; `tools/fitcheck.py` n'ouvre pas le guide.
- Incident: en nettoyant après un délai dépassé, j'ai tué par erreur le navigateur headless d'un autre agent (`docs/studio-boards/banner/cap.py sheet,small`), signalé au lead.

## 2026-11-11 · quests lot 3 merged: button marker, mp8 test fixed (not released)

- Merged `worktree-agent-a42328e0c65a6fedd` (50f526a): `ui/quest-marker.js`, render only (gold pulse + arrow on the button of the active quest, or on what opens it). Agent's entry below.
- `mp8` failure after lot 2 explained: the test sent the `qs` switch after the kingdom had fallen (lockstep stopped); the test now sends it before the wave and waits on ticks. Agent: `quests det mp8` PASS, `det` hashes unchanged.
- After merge: build and push; GitHub runs the quick suite on the branch.
- Left: remove the tutorial bar (after the video guide), spearman, full pass. King may want a stronger marker on tabs.

## 2026-11-11 · v92 mega update announcement drafted (not released)

- The King: prepare the mega update announcement with everything pushed since the GitHub cut, sent the way the system does at the next update.
- `docs/release-v92/NOTES.md` rewritten (look, new to play, comfort); `README.md` there says how it ships (copied to `game/NOTES.md`, posted by `release.yml` through `tools/announce.sh` with `announce/img/v92/`). Old `announce-v92.md` draft removed (duplicate).
- Before release: confirm bullets for spearman, video guide, quest marker (in progress), retake the 4 screenshots (they predate the new looks), King's go-ahead after the full pass.
## 2026-11-11 · quêtes lot 3: repère sur le bouton à presser (branche hd-gameplay, non fusionné, non livré)
- Demande du Roi: un repère visuel sur le bouton de la quête active. `ui/quest-marker.js` (nouveau, affichage seul): contour or qui pulse + petite flèche qui rebondit, sur l'entrée du menu, sinon sur l'onglet ou la catégorie qui l'ouvre, sinon flèche au-dessus du bâtiment à cliquer. Table quête -> cible dans `docs/studio-notes/quests.md`.
- Crochets: une ligne dans `drawItem` et `drawTabs` (`ui/build-menu.js`), une dans `kingBar` (`gameplay/king-skills.js`), appel depuis `questLog` (`ui/quest-panel.js`); `ui/hud.js`, `ui/tutorial.js`, `ui/title-menu.js` non touchés. Aucun texte nouveau.
- Choix: repère visible même panneau replié; caché si quêtes éteintes, F10, fin de partie, pause, carte, journal ouvert. Pas de repère sur les ressources (récolte) ni sur le camp rebelle.
- `mp8` (échec vu par le coordinateur après fusion du lot 2): cause = la partie était finie (`over` vrai, château tombé) quand le test envoyait la commande `qs` en fin de test; le lockstep ne tourne plus, la commande ne s'exécute jamais. Ni la charge ni la commande. Test corrigé: bascule envoyée avant la vague, attente sur les ticks (invité coupe: vu après 19 ticks; hôte rallume: 8 ticks).
- Vérifié: build; `quests`, `det` PASS, hachages `det` identiques à release-v84 (journal du dépôt principal); `mp8` PASS; 3 captures 1280x720 (`dist/qs/m1.png` onglet Build, `m2.png` entrée Maison, `m3.png` bouton Chevalier).
- Non vérifié: flèche au-dessus d'un bâtiment (non capturée), boutons du Roi, marché, guilde, recherche, convoi (même mécanisme, non regardés), écrans étroits / tactile, co-op à l'œil.

## 2026-11-11 · quests lot 2 merged, HUD bars fix (not released)

- The King decided: quests in co-op too, quests replace the tutorial bar, adjust amounts, add market / guild / siege / envoy.
- Merged `worktree-agent-a42328e0c65a6fedd` (a171c46): 21 quests in 7 chapters (20 solo, convoy is co-op only), shared line in co-op, switch is the lockstep command `qs`, quest state in the lockstep hash, `SAVA.QST` v2 by id. `det` hashes changed (expected). Agent's entry below.
- Fixed in `ui/hud.js`: `objBar`, `kingBar`, `tutBar`, `hintBar` were inside the raid block (`WAVEZ>0`) since the module migration, so shown only during a raid; brace moved, they show all the time again. Not seen by eye yet.
- Not done yet: unhook the old tutorial bar (list in the agent's report: `ui/hud.js`, `gameplay/reset.js`, `gameplay/traps.js`, `ui/settings.js`, `dk_tut`) after the video guide merge.
- `save`: same0 true but 20 min 12 s under load (tPack 430 s, tLoad 562 s), over the 1200 s limit; to re-measure on a quiet machine.
- Tests after merge: `dist/merge_tests12.txt`.

## 2026-11-11 · GitHub back, branch pushed (not released)

- The King: GitHub is up again; keep the repository organised by folders as it is, no `html` folder.
- Checked: top level of `release-v84` equals `main` (`packages/ apps/ docs/ game/ announce/ tests/ tools/ .github/`) plus `.claude/agents/` (15 studio agents). Only HTML tracked outside review boards: `packages/game/index.html`, `apps/desktop/src/launcher.html`. `dist/` stays untracked.
- Pushed `release-v84` (179 commits) to `origin/release-v84`. `main` untouched: no release, no Discord (those workflows run on `main` only); the test workflow runs on the branch.
- Open: `save` test fails locally at the 1200 s limit with an empty log after the quests merge (direct run without limit in progress, `dist/save_direct.txt`).
## 2026-11-11 · quêtes lot 2: co-op, marché, guilde, siège, envoyé (branche hd-gameplay, non fusionné, non livré)
- Décisions du Roi appliquées: quêtes aussi en co-op, les quêtes remplacent la barre Tutorial en 5 étapes, montants / ordre / noms revus, quêtes marché, guilde, siège, envoyé (+ convoi, co-op seulement). 21 quêtes en 7 chapitres (20 en solo). Tableau et règles: `docs/studio-notes/quests.md`.
- Co-op: une seule ligne partagée, évaluée dans le tick, récompense payée aux DEUX joueurs (comme `objectives.js`), une partie co-op démarre toujours quêtes allumées. Interrupteur = commande lockstep `qs` (`questSwitch` dans `commands.js`, `case 'qs'` dans `mpExec`). État des quêtes ajouté au hachage lockstep (`mpHashX`).
- État: `SAVA.QST` v2, par identifiant (`d:{id:1|2}`), plus par indice. Sauvegarde du lot 1 (indice sur 16 quêtes) migrée par identifiant dans `qFix`; sauvegarde sans quêtes = quêtes éteintes (inchangé).
- Écran co-op: panneau à gauche 38 px sous la barre du haut, ligne des objectifs co-op centrée sur la première rangée: jamais sur la même rangée.
- Barre Tutorial: `ui/tutorial.js` et `ui/title-menu.js` non touchés; les 5 étapes sont couvertes par les quêtes 1, 2, 3, 6, 8, 9; liste de ce qu'il faut décrocher dans les notes.
- Textes: 18 clés de plus dans le bloc v92 (`docs/studio-texts/quests.json`).
- Tests: `tests/quests.js` étendu (nouvelles quêtes, migration lot 1, co-op sur une machine: mêmes hachages deux fois, commande, instantané); `tests/mp8.py` compare l'état des quêtes des deux clients et envoie la commande depuis l'invité; `tests/mp_resync.py` corrompt aussi l'état des quêtes. Résultats: `det features mpk mp_resync quests save` PASS (same0 vrai), `mp8` PASS après correction de ma comparaison (compteurs lus à des ticks différents). Capture co-op 1280x720 avec les deux barres: `dist/qs/coop.png`.
- Trouvé, non corrigé: dans `ui/hud.js` les barres `objBar`, `kingBar`, `tutBar`, `hintBar` sont dans le bloc `if(wavesState.WAVEZ>0...)` (accolade fermée après `hintBar`, depuis la migration en modules a022204): elles ne s'affichent que pendant un raid. Décision au Roi / coordinateur.
- Non vérifié: `smoke`, `mp_convoy`, `mp_events`, `mp_kxp`, `fitcheck`, écrans étroits, autres langues à l'œil, quête convoi en vrai co-op à deux châteaux.
- `det`: les 8 hachages changent (il tourne avec `MP.on`: +20 or de la quête bois, et l'état des quêtes est dans le hachage); les deux passes restent identiques.

## 2026-11-11 · quests merged (not released)

- Merged `worktree-agent-a42328e0c65a6fedd` (commit c3d0612): 16 solo quests in 6 chapters, state in `SAVA.QST`, panel top left, log, Settings > Game switch. Details in the agent's entry below and `docs/studio-notes/quests.md`.
- Agent verified: build, `quests` (new, in the quick suite), `det`, `features`, `mp8`, `save`. After merge: see `dist/merge_tests11.txt`.
- Left to the King: quests in co-op or not, keep the 5-step tutorial bar or not, amounts / order / names, quests for market, guild, siege, envoy.
- Still running: video guide (`aaffcd280bd956aae`), spearman (`a32a61bc6cb6d6ef9`). After them the King asked for a full pass: improve and test everything.

## 2026-11-11 · bannière C (gonfanon sur mât) fusionnée et allumée (réponse du Roi « 1C 2C 3C »), non livré
- `BANNER2='C'` dans `rendering/banner-icon.js`: petite icône (HUD, sauvegardes) et grande bannière (carte du royaume). `npm run build:release` fait, build de test republié.
- Non relancé: tests (aucun fichier de simulation touché). Reste: bannières de pierre 3D sur l'ancien dessin, emblème illisible à 16 px, or sur or peu contrasté (`docs/studio-notes/banner.md`).

## 2026-11-11 · liste du Roi: Update, carte Leaderboard, 3 agents lancés (bannière, quêtes, guide vidéo), non livré
- Liste du Roi (GitHub suspendu, donc pas d'issues): « What's new » -> « Update »; leaderboard en carte séparée sous la carte du haut avec aperçu du top 10; icône de bannière à refaire façon porte-étendard; tutoriel façon guide vidéo; quêtes pour guider les nouveaux joueurs; « où sont les lanciers du menu en jeu ? ».
- Fait: `ui/title-menu.js` (libellé et titre « Update », texte ajouté via `docs/studio-texts/update.json`; carte Leaderboard sous la carte de saison, autant de lignes que la place le permet jusqu'à 10, clic = écran complet; `topRuns()` partagé avec l'écran). Vérifié: une capture 1280x720 avec 11 scores factices (10 lignes affichées). Non vérifié: écrans étroits/bas, fitcheck, tests non relancés (interface seule).
- Lanciers: décor de l'écran titre seulement (`rendering/models/title-army.js`, chevaliers avec une pique), aucune unité lancier en jeu. Question posée au Roi: créer l'unité ou les retirer du titre.
- Agents en worktree (rien fusionné): bannière (planche `docs/studio-boards/banner/`), quêtes (`gameplay/quests.js`, `docs/studio-notes/quests.md`), guide vidéo (`ui/video-guide.js`, `docs/studio-notes/guide.md`).
## 2026-11-11 · icône de bannière façon porte-étendard: planche A/B/C/D, interrupteur éteint (non fusionné, non livré)
- Demande du Roi: « i'm still not happy about the icon for banner rework the banner maybe something more like the bannerman ». Branche de worktree hd-design, rien dans `game/`, rien poussé.
- `rendering/banner-icon.js` (nouveau): `BANNER2=''` (défaut = image actuelle), 'B' étendard du porte-étendard, 'C' gonfanon sur mât, 'D' bannière murale; sprites 24x36 qui suivent couleur, 2e couleur, motif et emblème (16 emblèmes redessinés en 11x11). Deux lettres = petite puis grande image ('DB'). HUD, liste des sauvegardes et carte Nouveau royaume passent par `bannerIcon()`.
- Planche `docs/studio-boards/banner/board.html` (3 lignes + référence du porte-étendard en jeu), `rows.json`; détail et constat: `docs/studio-notes/banner.md`. En attente du code du Roi.
- Vérifié: `npm run build`; 24 captures du jeu sans erreur (4 variantes x 3 royaumes sur Nouveau royaume, sauvegardes, HUD, 16 et 32 px); feuille des 16 emblèmes x 3 variantes regardée une fois. Interrupteur éteint: `bannerIcon()` rend le canevas `BANNER` lui-même, mêmes rectangles.
- Non vérifié: `npm test` (aucun fichier de simulation touché), vrai GPU, mobile, co-op. Non traité: texture 3D des bannières de pierre (reste A), pastilles d'emblème du menu (vectorielles), emblème or sur motif or peu contrasté.
## 2026-11-11 · quêtes pour guider un nouveau joueur (branche hd-gameplay, non fusionné, non livré)
- Demande du Roi: « add quest in game to guide new player ». 16 quêtes en 6 chapitres, une active à la fois: bois, pierre et or, maison, ferme, caserne, 2 chevaliers, 2 archers, 6 murs + porte, tour, 3 pièges, vague 1, académie + recherche, Roi, compétence du Roi, vague 5, vague 10. Liste, récompenses et règles: `docs/studio-notes/quests.md`.
- Code: `gameplay/quests.js` (état `questsState.Q`, `qBegin`/`qTick` dans l'enveloppe `update` de `statistics.js`), `ui/quest-panel.js` (panneau en haut à gauche, journal des quêtes, bouton replié), petits crochets dans `hud.js`, `reset.js`, `save-format.js` (`SAVA.QST`), `restore.js`, `settings.js` (ligne Quests On/Off), `input/desktop.js` (Échap ferme le journal). `ui/tutorial.js` et `ui/title-menu.js` non touchés.
- Décisions: solo seulement (`qTick` ne fait rien si `MP.on`), rien en mode test F10, ancienne sauvegarde sans `QST` = quêtes éteintes. Récompenses au total 540 or, 120 bois, 40 pierre, 80 nourriture (avant la vague 1: 130 or, 120 bois, 40 pierre, 30 nourriture).
- Textes: 54 clés dans le bloc v92 (`docs/studio-texts/quests.json`), 6 langues; NL, PL, TR retombent sur l'anglais.
- Vérifié: `npm run build`; `quests` (nouveau test, dans la suite rapide), `det`, `features`, `mp8` PASS; les 8 hachages de `det` identiques à ceux du dépôt principal (`det` tourne avec `MP.on`, les quêtes n'y bougent pas); `save` PASS (same0 vrai, sameCont faux connu). Deux captures 1280x720 (panneau, journal) dans `dist/qs/`.
- Non vérifié: `mpk`, `mp_resync`, `smoke`, `fitcheck`, écrans étroits et tactile, les 5 autres langues à l'œil. Machine partagée très chargée: plusieurs tests ont dû être relancés (délai de chargement de page).
- Reste au Roi: quêtes en co-op ou non, garder ou retirer la barre Tutorial en 5 étapes (double emploi), montants, ordre.

## 2026-11-11 · monde en blocs look B fusionné et allumé (réponse du Roi « 1B … 9B »), non livré
- Le Roi a répondu 1B à 9B (planche blocs): branche fusionnée, `blocksState.on=true` par défaut (`rendering/blocks.js`), BLK=DBLK=0,5, terrain, décor, textures bâtiments et saisons allumés.
- Rendu seulement, simulation intacte. Tests après fusion: smoke det tools mp8 mpk ALL PASS (`dist/merge_tests10.txt`); une capture du village avec mutants, armes et blocs allumés, sans erreur; build de test republié.
- Reste (`docs/studio-notes/blocks.md`): géométrie des bâtiments non reconstruite en blocs (gros lot), arbres B plus grands (cachent plus les unités), écran titre et choix du site non regardés, vrai GPU, traits d'herbe sèche coupés depuis le lot bâtiments (correctif d'une ligne décrit, non fait).

## 2026-11-11 · armes et outils look B fusionné et allumé (réponse du Roi « 1B … 15B »), non livré
- Le Roi a répondu 1B à 15B (planche armes, 12 lignes + 3 vues d'armée): branche fusionnée, `GEAR2_ON='all'` (`rendering/models/gear-style.js`).
- Conflit de fusion dans `rendering/unit-instances.js` (clé de cache: mutants `m` + `gearSig()`), résolu à la main.
- Tests après fusion: smoke det mp8 mpk mp_resync, résultat dans `dist/merge_tests9.txt`; build de test republié. Détail et reste à faire: `docs/studio-notes/gear.md` (projectiles, armes des morts-vivants, baliste, trébuchet, icônes non refaits).
- Planche blocs toujours en attente du code du Roi (non fusionnée).

## 2026-11-10 · mutants look B fusionné et allumé (réponse du Roi « 1B … 8B »), non livré
- Le Roi a répondu « 1B 2B 3B 4B 5B 6B 7B 8B »: branche fusionnée, `MUT2_ON='all'`, `npm run build:release` fait.
- Tests après fusion: smoke det mp8 mpk ALL PASS (`dist/merge_tests8.txt`). Build de test republié (artifact de test).
- Reste: nuée lointaine (ancien aspect pour momie et coureur), yeux/lueurs de nuit non regardés, cadavres, brute +54 % et boss +72 % de triangles, vrai GPU.
- Planches armes/outils (`gear`) et blocs (`blocks`) prêtes dans leurs worktrees, non fusionnées, en attente des codes du Roi.

## 2026-11-10 · mutants en monstruosités: planche A/B, interrupteur éteint (historique)
- Demande du Roi: « améliore les mutants pour ressembler à des monstruosités ». Branche de worktree hd-model, rien dans `game/`, rien poussé.
- Look B des 6 mutants + boss dans `rendering/models/mutants.js`, interrupteur `MUT2_ON` (`mutant-style.js`, défaut '' = rien ne change). Détail, coûts, reste à faire: `docs/studio-notes/mutants.md`.
- Planche: `docs/studio-boards/mutants/board.html` (8 lignes: brute, coureur, artificier, cracheur, mineur, momie, boss, horde), `rows.json`. En attente du code du Roi (« 1B 2A ... »).
- Vérifié: poses repos/marche/attaque, triangles (6 mutants +17 %, scène horde +5,1 %, draw calls identiques), `npm test -- det smoke` (voir notes). Non traité: nuée instanciée lointaine (garde l'ancien aspect), nuit, co-op.
## 2026-11-10 · monde en blocs derrière un interrupteur éteint (non livré, planche en attente du Roi)
- Demande du Roi: terrain, bâtiments et décors sur une seule taille de bloc, façon Minecraft. Étude et mesures: `docs/studio-notes/blocks.md`. Bloc retenu: 0,5 unité (2 blocs par case, unité = 1,7 bloc, 16 pixels par bloc); alternative 1/3.
- `rendering/blocks.js` (nouveau): `blocksState` (éteint par défaut), parties `terrain`, `decor`, `build`, `seasons`, `setBlocks()`, localStorage `dk_blocks`. Terrain: mêmes colonnes et hauteurs, textures de blocs dans le shader, falaises fusionnées, liseré d'herbe, chemins en blocs, eau en pixels. Décor (`terrain-props-blocks.js`, nouveau): arbres, rochers, minerai, buissons en voxels fusionnés par chunk, plantes sur la grille de pixels, tout choisi par hachage de position. Bâtiments: seule la densité de texture change (18 -> 32 px par unité), modèles intacts. Saisons: neige et automne dessinés sur les blocs.
- Vérifié: `npm run build`; `npm test -- det smoke` PASS (det 436 s, smoke 1110 s); listes de hachages `det` identiques octet pour octet entre release-v84, cette branche interrupteur éteint et cette branche interrupteur allumé. Coût: appels de dessin inchangés (154 village, 199 carte entière), triangles -34 % (village) et -41 % (carte entière), construction des chunks pas plus lente.
- Planche `docs/studio-boards/blocks/board.html` (9 lignes), codes dans `rows.json`. Rien à fusionner avant la réponse du Roi.
- Reste: re-grille de la géométrie des bâtiments (non contenue, décrite dans les notes), contrôle sur un vrai GPU, co-op à l'œil. Régression probable notée (pas corrigée): depuis le lot bâtiments, l'id matière 9 (chaume) coupe les traits peints de l'herbe sèche du terrain.

## 2026-11-10 · logo Hammerdawn 1C appliqué, armes/outils en cours (non livré)
- Planche `docs/studio-boards/hds/` (gen.py): le Roi a répondu « 1c » (soleil uni + 4 rayons + marteau droit). Appliqué aux calques de la carte d'intro (`packages/game/index.html`), animations inchangées. Ligne 2 (écriture du nom) sans réponse: nom laissé tel quel.
- Vérifié: build:release, une capture de l'intro. Tests non relancés (HTML de l'intro seul). Icônes desktop et favicon non changés.
- Agent hd-model en cours: revamp armes/outils, planche `docs/studio-boards/gear/`, interrupteur par défaut éteint, rien à fusionner avant la réponse du Roi.
## 2026-11-10 · armes et outils look B derrière un interrupteur (planche gear, non fusionné, non livré)
- Demande du Roi: « revamp tout les armes / outils pour harmoniser le tout ». Interrupteur `GEAR2_ON` (`rendering/models/gear-style.js`), '' par défaut: rien ne change en jeu tant que le Roi n'a pas répondu.
- Look B (`rendering/models/gear2.js`): une palette commune, épées (chevalier par niveau de recherche, capitaine, Roi), hallebarde, arc, 3 boucliers, 4 outils du paysan, charges portées, hampe d'étendard, canon. Détail et non-traités: `docs/studio-notes/gear.md`.
- Planche: `docs/studio-boards/gear/board.html` (12 lignes + armée A/B), `rows.json` (ligne -> clés).
- Vérifié (interrupteur éteint): `npm test -- det smoke` ALL PASS; les 8 hashes de `det` identiques à `release-v84` (base reconstruite à part). Scène de 157 unités: 348 draw calls en A et en B, 494 688 -> 494 420 triangles.
- Non vérifié: temps de frame sur vraie carte graphique, `det` avec B activé (rendu seul), écran titre et icônes avec B, co-op. Non traités: projectiles (cubes instanciés), objets cuits dans les skins B des unités, armes des morts-vivants.

## 2026-11-10 · retours du Roi sur le build de test: son, intro, classement (non livré)
- « Plus de son »: non reproduit en headless (musique mesurée ~-25 dBFS sur le titre, rendu neutralisé). Cause probable: ancien `dk_vol` bas ou `dk_snd=0` + nouvelle courbe au carré + -11 dB. Correctif: `TRIM` .285 -> .45 (+4 dB), remise à zéro unique de `dk_vol`/`dk_snd` (clé `dk_aud=2`). À confirmer par le Roi.
- Carte Claude: jouée dans la sonde (`tools/bootprobe.py`); un clic pendant l'intro la sautait. Maintenant un clic ne saute plus, 2e clic ou Échap/Entrée/Espace saute.
- Son sans clic: impossible dans un navigateur; launcher Electron: `autoplay-policy=no-user-gesture-required` (non testé).
- Records -> Leaderboard: top 10 local en premier, nom du royaume enregistré dans `dk_sb` (`n`). Pas de classement en ligne (pas de serveur).
- Note: le build compressé charge three.js depuis un CDN; les sondes doivent le router en local (comme `bootprobe.py`).

## 2026-11-10 · bâtiments et unités look B fusionnés (Roi: tout B), non livré
- Bâtiments: textures 3-4 tons, fenêtres éclairées la nuit, niveau bois distinct, fumée, 10 bâtiments refaits (`docs/studio-notes/buildings.md`). Unités: `UV2_ON='all'` dans `rendering/models/unit-style.js` (`docs/studio-notes/units.md`).
- Vérifié sur l'arbre fusionné: smoke det tools features mp8 mpk mp_resync ALL PASS (`dist/merge_tests6.txt`). Build de test republié.
- Non vérifié: coût sur vrai GPU (+5 % et +3,5 % de triangles), icônes de menu et écran titre avec les nouveaux looks, 7 cartes d'unités non relues, fitcheck.
- Reste: pièges, échafaudage, canon, armes/boucliers, nuée au loin non traités; réponses du Roi sur l'audio.

## 2026-11-10 · audio refait, planches bâtiments et unités publiées (non livré)
- Audio fusionné: lancement -11 dB (compresseurs sans rattrapage, limiteur, fondus, défauts 0,55), 7 thèmes variés, effets à hauteur/timbre variables, plafonds de voix, sons de menu; son d'onglet branché dans `kitTabs`. Détail: `docs/studio-notes/audio.md`. Aucune écoute humaine.
- Vérifié sur l'arbre fusionné (intro + audio): smoke det mp8 mpk mp_resync, voir `dist/merge_tests5.txt`. `tools` non relancé depuis le correctif d'intro.
- Build de test republié (artifact FibK3cKvLVe3mSuJDUb49d).
- Planches publiées (index + batiments.html + unites.html sur l'artifact des planches), NON fusionnées: branches `worktree-agent-a67e365d50939b80a` (bâtiments) et `worktree-agent-adc00a47b23dd80ba` (unités, types choisis à mettre dans `UV2_ON`, `docs/studio-boards/units/rows.json`).
- À trancher par le Roi: niveau sonore, remise des curseurs au nouveau défaut, thème triomphe et silences; codes des deux planches.

## 2026-11-10 · intro de lancement dégelée, emblèmes annulés, build de test (non livré)
- Intro: le démarrage était une seule tâche synchrone et l'intro comptait en horloge murale, donc finie avant d'être vue. `core/boot.js` découpe `main.js` en tranches de 30 ms; cartes en `transform`/`opacity`, lancées à la première image peinte; rideau ouvert quand le titre dessine. Détail: `docs/studio-notes/boot.md`.
- Sous `navigator.webdriver` le démarrage reste synchrone (les tests ne couvrent pas le vrai chemin; `tools/bootprobe.py` le force).
- Vérifié (branche agent): build, build:release, det PASS (hashes inchangés). NON vérifié: smoke et tools (dépassement, machine chargée) à relancer; vrai GPU, iframe claude.ai, launcher.
- Refonte des emblèmes et propositions de logo refusées par le Roi (1A..5A): commits annulés, logo actuel gardé. En attente: ce qui manquait.
- Build de test: artifact FibK3cKvLVe3mSuJDUb49d (séparé du jeu officiel). `cap_boot.py` du board revamp ne capture plus la carte (classe `go` requise).
- En cours (agents): audio, unités (planche), bâtiments (planche). Les planches ne se fusionnent pas avant la réponse du Roi.

## 2026-11-10 · refonte fenêtres de lancement, menus, logos, animations (non livrée)
- `ui/menu-kit.js` (gabarit plein écran), `menu-fx.js`; titre en lobby (Play + mode, pastilles L/T/O, carte version/saison), tous les écrans de lancement, Réglages, Esc, fin au gabarit; logo NARANXIA en blocs, carte Hammerdawn, favicon; animations sur horloge murale, coupées par Reduce motion.
- Vérifié (branche agent): build, det tools smoke, fitcheck TOTAL 1 (connu). Arbre fusionné d'avant la refonte: det smoke events mp8 mpk mp_resync ALL PASS. Après refonte: tests relancés (dist/merge_tests4.txt), fitcheck à refaire avec les 17 nouvelles clés.
- Planche avant/après publiée (docs/studio-boards/revamp). Non testé: tactile réel, manette, launcher, Esc en co-op. Icônes desktop .ico/.icns non refaites.

## 2026-11-09 · menus du Roi (1B 2B 3C 4B 5B 6B 7C 8C) appliqués, non livrés
- Double filet doré, boutons plaques, pied de page Back/Select, titre en cadre avec braises, choix du mode en 3 cartes, fiche de détail unité/bâtiment, onglets à icônes + NEW (`dk_newslots`, jamais dans la sim ni la sauvegarde), onglets en PageUp/PageDown (Q/E déjà pris).
- Bug corrigé: `hud.js` `const L=menuItems()` masquait `L()` (« L is not a function » à la sélection d'une unité).
- Vérifié (branche agent): build, det tools smoke, captures. fitcheck TOTAL 1 (« Construire » FR dans un slot peasant, déjà présent). 63 clés ajoutées. À faire: textes d'ambiance relus par hd-lore, tests mp8 mpk mp_resync events sur l'arbre fusionné, fitcheck.
- Rien poussé (GitHub suspendu).

## 2026-11-09 · look du Roi (1C 2C 3B 4B 5B) appliqué, non livré
- Liseré doré + coins pixel, troupes en cartes par type, slots Build icône+coût, titres en Pixelify Sans (repli Inter), écran de fin en 3 niveaux. UI seulement. Vérifié: build, det, smoke, fitcheck 0. Reste: tests mp8 mpk mp_resync après fusion, police hors ligne réelle.

## 2026-11-09 · lots design / qualité / simplicité (non livrés, v92 en préparation)
- Corrections qualité fusionnées; kit Discord (anglais) et `tools/announce.sh` (embed + images, dry-run seulement); images d'annonce v92 dans `announce/img/v92/` (minimap noire, barre du Roi absente sur 03).
- Menus: Esc à 4 boutons, tutoriel 5 étapes, réglages 3 onglets, raccourcis ponctuation masqués, Build: niche masquée avant académie/vague 1, boutons maison/ferme/mur, `UIT` + `focusRing`.
- Planche de look publiée (docs/studio-boards/look), en attente de la réponse du Roi. Aucun changement de look appliqué.
- À vérifier: erreur « L2 is not a function » en sélectionnant le Roi; tests det smoke events mp8 mpk relancés après fusion (dist/merge_tests.txt).
- Rien poussé (GitHub suspendu).

## 2026-11-09 · model variants cleaned, scout/engineer/envoy in pixel layer (local, not released)
- Deleted refused variants + `window.__MV` (model-variants.js, unit-variants.js); units.js / bastion-buildings.js back to the pre-variant behaviour for king, guard, buildings. `pxScout`, `pxEngineer`, `pxEnvoy` added in royal-skins.js (B silhouettes). Visual only.
- Verified: build, `det` PASS, showshot front/back of the 3 units; bbox tops sit under the bar height (scout h 16, engineer 16.4, envoy 16). Not run: smoke.

## 2026-11-09 · Remaining workshops merged (v92, not released)
- Research exclusive paths (Steel/Mail, Fire arrows/Boiling oil, Crop rotation/Better tools; `RS2.ch`, Iron age after either of Steel or Mail), market fatigue (`FAT` in SAVA, sell floor .80, barter .85), envoy tribute -25 % per visit with per-camp caps (700 gold, 350 food).
- Events with a choice (caravan: take now or escort for x2.5 after 40 s; rebel envoys: accept or refuse for renown +10 %/point): `gameplay/events.js`, `ui/event-bar.js`, command `ev` in mpExec, state `EVT` in SAVA, first click decides in co-op, default after 30 s of sim time. Rebel camp traits (merchant x1.5 tribute, warlike +25 % horde hp, wary first envoy turned away) by pure hash of seed and camp id.
- King XP and talents: state on the king unit (`kxp`, `kt`, `kdr`), levels 1-5, 8 talents in 2 branches, command `kt`.
- Touch (44 px hit margin, long press tooltip, camera and cancel buttons) and colour-blind shapes/colours; animation LOD tried and dropped (gain below noise, see perf.md).
- Conflicts in 6 files resolved by combining both sides; events test fixed (envoy decay reused on the same camp).
- Verified: det events envoy research kingxp market features smoke compat save mp8 mpk mp_resync mp_kxp mp_events all PASS. fitcheck of the new texts started, touch/long-press and the colour-blind minimap shapes not tried by hand.
- Left: release v92 when GitHub is back (drafts in docs/release-v92, to update with the new features), recolour selection rings and zombie eyes for colour-blind mode, a fatigue indicator on market buttons.

## 2026-11-08 (night) · King's board answers applied (v92, not released)
- Answers "1A 2A 3B 4A 5A 6A 7A 8B 9A 10A 11B 12X 13B 14X" (X = keep current): palette, team colours and seasons unchanged; unit bars = 10 pixel segments with bevel (`drawBars` in ui/hud.js); knight plume red, archer/tower/barracks icons already match A; team skin = full tabard; rank stripes 0-3 (min(3, xp/4), knight and archer, player team, model rebuilt on rank change, `u.mrk`); scout, engineer, envoy use model variant B (`MV_DEFAULT` in rendering/models/model-variants.js); king, guard, bastion buildings unchanged.
- `tools/run.py` now serves the fonts offline (fontroute), it hung on Google Fonts before.
- Verified: det, smoke PASS after the merge; one screenshot shows the segmented bars. Not seen: rank stripes and tabard in game (small, shield hides the knight's left arm), scout/engineer/envoy variant B in game.
- Left: delete the refused model variants and the `window.__MV` selector (model.md step 1-3: pixel-texture the scout/engineer/envoy), release when GitHub is back.

## 2026-11-08 · Studio agents merged (v92, not released)
- Hammerdawn Studio: 15 agents in `.claude/agents/hd-*.md`, guide `docs/STUDIO_AGENT_GUIDE.md`, org chart + game-structure map (units, buildings, research, enemies, events, links) in artifact PiQPNmRtfsp8cFWuKDs2BS (view button "Structure du jeu", data from rules.js).
- Merged 11 agent branches (no conflicts): coop audit (ruins loot timer was not deterministic, fixed), menu-ux (colour-blind mode `dk_cb`, 3 one-time hints), animation (hit flash/recoil, construction scaffold, visual only), lore (boss legends, realm journal `JRN` in SAVA, 4 Chronicle fragments), audio (11 synthesized sounds), gameplay (market barter x*, wave preview `wave-preview.js`, tests/market.js), localization (L() fixes, 45 texts), model (variants via `window.__MV`, off by default), perf (no measurable cost of new features, hashes identical), community notes.
- Texts merged with addtexts (lore 17, menu-ux 5, gameplay 17, localization 45); "Waves survived: {0}" fixed by hand. A merge replaced `node_modules` by a self-looping symlink committed by an agent: untracked, `.gitignore` now ignores the symlink, `npm ci` redone.
- Verified locally: det market compat ruins envoy bossabil mp8 mpk mp_resync features smoke PASS. Not run: fitcheck (new texts), screenshots of colour-blind mode / scaffold, listening to sounds.
- Waiting for the King's choice on 3 review boards (not published yet): design (palette, team colours, bars) in docs/studio-boards/design, texture (7 rows) in docs/studio-boards/texture, model (4 rows) in docs/studio-boards/model. Answers like "1B 2C".
- Not done: market fatigue, envoy gain cap, event choices, King XP/talents (need new SAVA counters). GitHub account suspended: nothing pushed, ~60 local commits on release-v84.

## 2026-11-07 · Design refresh: glass UI, Inter, cool light (v92, not released)
- Waiting list DONE: rebel envoy (T/C/TRAIN envoy g80 f20 12 s, trained at the castle once an embassy is owned, hp45 spd120 vision 14; sim loop in simulation.js: within 8 tiles of an alive rebel base (BASES) and base.envT free -> +80+8*wave gold, +40+4*wave food, envoy consumed, base cooldown 300 s; model approved by eye only, white-robe diplomat with flag, board not used); ruins now have 3 looks by variant (pillar court, broken arch, tower stump), board published (1 row A/B/C, answer pending: keep one or mix). Tests: envoy (new, quick suite), det features mp8 mpk mp_resync pass; ruins/compat/save passed before the looks. NOT run: fitcheck, save after envoy. Visual note: envoy flag is thin edge-on from the front.
- Ruins DONE (King chose 'ruines seules'; world camps are disabled in code so no envoy): `RUINS` map in world/terrain.js (mkRuin per chunk, >=48 tiles from castle, 20% of chunks, flat 3x3 spot, pure hs hashing so world gen is unchanged), saved in SAVA; gameplay/ruins.js loots once when a player unit comes within 2.5 tiles (3 loot kinds by variant, amount 40+0.8*distance, embassy not applied, English message); rendering/ruins.js placeholder model (slab, 4 broken pillars, chest that disappears when looted), synced in render3D. Debug globals RUINS/ensureAround/hudDisplayState. tests/ruins.js in the quick suite. Screenshot checked once. NOT done: rebel envoy unit (needs camps), minimap marker, ruin art board (placeholder look), translations of the message.
- Events lot 2: wolf pack (wave 7 then every 9th: extra fast runners on every lane, hp +3%/wave, banner) and eclipse (wave 8 then every 11th: living zombies +15% hp, +40+8*wave gold per player, embassy x1.5), in waves.js, seeded rnd only. Messages English like the other events. Still queued: ruins to explore, rebel envoy unit. Tests: see next entry.
- Save compatibility: `svMigrate` (persistence/save-format.js) never rejects a save by version; chain `SVMIG` (key = version upgraded FROM) is where a future format change goes, with `SVVER` bumped; newer saves load as far as understood. `svFix` drops units/structs of unknown types, fills hp/x/y/buff/cd, clears dangling garrison refs; `svApply` resets const SAVA containers missing from an old save. Used by svApply and co-op resync. `tests/compat.js` (quick suite): old/newer/no version, unknown key, missing keys, ghost unit type, missing hp. RULE for new fields: must tolerate being absent. Unpushed (GitHub suspended).
- Units lot 1 DONE (models approved 1A 2A; tools were floating: AE z is the CENTER of the box, fixed): scout (g40 f20, barracks, spd 155, vision 26 tiles, weak melee) and engineer (g70 w40 s20, castle, repairs own buildings within 3 tiles at 12 hp/s, dmg 2). New test tests/bastion.js (in the quick suite): 10 buildings placed, orchard food, sanctuary heal, sappers + engineer repair. det features bastion mp8 mpk pass; mp_resync + save passed for lots 2-3 before the units. Not run after units: mp_resync, save. Rebel envoy still waiting (needs camp interactions). Queue: eclipse/wolves, ruins.
- Bastion buildings lot 3 DONE (models approved 1A-4A): royal forge (s100 g80, troops +8% damage, combat.js), embassy (w80 g100, caravan + event gains x1.5), war room (w90 s60 g60, training x1.15 speed), sappers' workshop (w70 s40, buildings within 8 tiles regain 2 hp/s). Helper bastionHas(p,type) in economy.js (cached per tick). Menu: forge+war room in Town, embassy in Economy, sappers in Defense. det features mp8 mpk pass. Not run: save, mp_resync; effects and menu layout (Town now 9 entries) not seen in play. Next in queue: units (engineer, scout, envoy), eclipse/wolves, ruins.
- Chronicle fragments: 4 extra lore paragraphs unlocked by best wave (5, 10, 20, 30), 'Reach a higher wave to read more.' while some stay locked; EN/FR/ES/DE/IT/PT. Checked by screenshot with best wave 12 (5 and 10 shown). Queue (docs/IDEAS.md + task list): buildings lot 3, units without duplicates (engineer, scout, envoy), eclipse/wolves, ruins.
- Bastion buildings lot 2 DONE (models approved 1A 2A): watch beacon (w40 s60, light radius 12, vision 20, in Defense) and orchard (w60, +2 food every 6 s without a peasant, in Economy). det features mp8 mpk pass. Not run for lot 2: save / mp_resync (same mechanism as lot 1, which passed); effects and placement not observed in play.
- Chronicle page (title menu, bottom pill next to 'Join a game'): 4 lore paragraphs (last bastion, King Naraige, rebel camps), translated EN/FR/ES/DE/IT/PT. Page checked by screenshot; the pill position at 1280x720 not seen (headless entry fade) and not checked on narrow screens (fitcheck not rerun).
- Events + lore: wave events in waves.js (every 6th wave from 4: rebel envoys tribute gold+food; every 7th from 5: meteor shower, stone), 3 new title taglines (last bastion, rebel camps, last light). mp_resync + save pass with the bastion buildings; det mp8 features pass after the events. Events are resource gifts only (messages English, like the caravan). Still not built: eclipse, wolves, units, ruins, kingdom journal.
- Bastion buildings lot 1 DONE (models approved 1A 2A 3A 4A): observatory (w60 s80, vision 30 tiles), granary (w70 s20, +4 pop cap), alarm bell (w50 g30, troops within ~8 tiles attack 15% faster), sanctuary (s90 g60, heals troops nearby). In menu: granary under Economy, the other three under Town. No hotkeys yet. det features mp8 mpk pass. Seen in game: placement + menu counts; effects not observed in play, mp_resync / save round trip not run. Unverified: icons in the menu for the new types.
- Bastion buildings lot 1 (draft): models only (rendering/models/bastion-buildings.js: observatory, granary, bell, sanctuary, registered in sGeo, not buildable yet). Board published for the King's choice; next: costs, menu, icons, effects, translations, tests once he answers. Dist/bastion has the previews.
- Content 1: named wave bosses (BOSSN in ai/wave-boss.js: Hollow Warden, Bell-Bearer, Frost King, Hive Queen; name on the boss bar, index in unit.bn). det + features pass. Lore chosen by the King: Naranxia = last bastion of humanity, AI kingdoms = rebel camps (docs/IDEAS.md). New buildings/units need a model board first (art direction rule), then one batch each with det/mp8/mpk.
- QoL 2: right-click a queued unit icon = cancel + full refund (command 'cq', co-op safe); hover tick sound on buttons; co-op ping (pg/pr, shows 'slow connection' above 250 ms); F8 also copies a short summary to the clipboard. det mp8 mpk mp_resync pass. Not covered by tests: cancel itself, hover sound. Skipped: select-all-of-type (double-click already does it), tooltips (already show shortcuts), loading transition, last-mode memory, auto-reconnect.
- QoL (Settings > Game, prefs in localStorage via core/prefs.js): pause when tab/window is away (solo, default on), autosave every 3 min to slot 'Autosave' (solo), reduce motion (skips intro, stops logo shimmer), studio intro first launch only. smoke + det pass. Already existed: UI size, alerts, pings, chat, control groups, Continue first. Not done: co-op latency indicator, F8 copy button, tooltips/shortcuts, select-all-of-type, queue right-click cancel, loading transition, hover sound.
- Buttons: glass look (translucent body, top gloss, light rim + dark hairline, soft shadow, base under tinted ones). Checked on Settings only.

- The King chose on the review board: 1A glass buttons/frames, 2A top bar, 3A build tiles, 4A title, 5A Inter, 6C cool world light (rows in `dist/board/spec.json`).
- `ui/drawing.js`: `frame()` now draws dark glass (soft shadow, 1 px light edge, cyan accent on hover/confirm, teal/red tints); slots, tooltips, chat/top bar restyled; `arcDeco` removed; selection ring cyan.
- Fonts: Inter 500-800 (Google Fonts link, `@fontsource/inter` for tests via `tools/fontroute.py`) replaces Cinzel/Marcellus/NaxNum in canvas (`ui/typography.js`), co-op CSS, boot; `naranxia-numerals.woff2` deleted. `fontOf` sizes retuned (.88 body, .8 heading).
- `rendering/lighting.js`: sky `0xb9d2ee`, sun `0xe6f0ff`, intensities x1.19 sun / x1.06 hemi.
- Verified: build, title + in-game screenshots, no page errors. NOT verified: fitcheck (running), det/mp tests (visual-only change), title logo look (headless clock too slow), co-op window look.
- Launch polish: splash in dark blue/cyan with white logo and cyan bar (`styles/boot.css`), title logo white/cyan, entry sequence logo .1-.8 s, menu .4-1.1 s, hints/pills 1-1.6 s (`ui/title-menu.js`), duplicate 'Naranxia' label removed, title scene hemisphere light 1.15. Checked on a virtual-clock filmstrip (`launch.py`, scratchpad); the real-time fade lengths were not measured (headless clock is slow). Splash bar is indeterminate (no load progress hook).
- Studio intro as 2 cards (studio 2 s, then 'Made with Claude' 1.9 s, any key/click skips): hammer-and-dawn mark + HAMMERDAWN STUDIO (HDS) + PRESENTS + 'Made with Claude' (text only, localized FR/ES/DE/IT/PT via navigator.language in index.html), then the NARANXIA splash; hideBoot waits for it (frame-loop.js). Checked with a paused-animation screenshot.
- Launch order now: studio card, Claude card, title (NARANXIA splash removed at the King's request; boot hides at 4.9 s).
- 2nd intro card now plays the Lottie the King supplied (Claude logo + wordmark; wordmark recolored light for the dark card): `ui/intro-claude.js` (lottie-web light, bundled), `assets/claude-intro.json`; frames 0-100 at 1.4x, card 2.9 s, splash delayed to 4.9 s; falls back to text if Lottie fails. Verified frame by frame in an isolated page; full-boot timing not measurable headless. Check Anthropic brand terms before shipping.
- LIGHT THEME, then narrowed by the King ('pas sur le fond du menu mais sur les boutons'): only BUTTONS, tiles and slots are translucent white; panels, top bar, tooltips, title veil, pause veil and co-op window stay dark glass; the intro cards stay white. Button text is dark via a per-frame list of button rectangles (`btnAdd/btnReset/inBtn` in `ui/typography.js`, `btnReset()` called in frame-loop after the 3D render); text outside buttons keeps its light colors. Earlier wording of this entry (whole UI white) is superseded:
- (superseded) LIGHT THEME: `LIGHT` flag + `ink()` in `ui/typography.js` maps UI text colors to dark inks (used by `T_`, `TTL`, `TN`, hud); `frame()`/slots/tooltips in `ui/drawing.js` are translucent white glass with blue accent (transparency kept as in the dark glass); title veil white, logo navy with white outline; intro cards on white with the original black Claude wordmark; co-op overlay overridden in `styles/coop.css`. Set `LIGHT=false` for the text mapping only (frames are hard-coded light). Checked: title, HUD, settings, language screens. NOT checked: build sub-menus, save menu, records, convoy/troop panels, tutorial popups, co-op window, fitcheck, boss/raid labels drawn directly on the world.
- Left: 3D units/buildings polish (second board), unpushed (GitHub suspended), release v92 with NOTES.md.

## 2026-11-07 · Text never spills out of buttons (v92, not released)

- The King: nothing may overflow a button, in every menu and language. `fitSc()` (language.js) shrinks a label to fit (min .45), used by `pill` and `langBtn`; `TCf()` shrinks then ends with an ellipsis (build tiles: name, Done / Free / Locked / Masonry, costs down to .34); `uiBtn` clips its content to the button and reports any text that still sticks out (`setClipBox` in `T_`); HTML buttons of the co-op window wrap (`#mp button` CSS).
- `tools/fitcheck.py [W H x N]`: one headless page per language, walks title, records, notes, language list, 4 settings tabs, then in game (HUD, build menu, pause menu, troop panel F2, test mode F10, map) and the co-op window; prints overflows (`window.__ovf`). Result: 0 overflows in 9 languages at 1280x720, 700x420 and 360x640 (title/settings only for 360). Catching a real case: German build tile "Steinmetzkunst" / "Sammelpunkt: Bu" was cut, now fits / ends with an ellipsis. Not covered: build sub-menus (Defense, Economy...), convoy dialog, save menu, tutorial popups.
- Still to do from the "yes" for the 6 other languages: turn the sentence fragments joined in code into whole-sentence keys with {0} (about 60 sites in build-menu.js, waves.js, desktop.js, lobby.js...), then RU, UK, JA, ZH, KO, AR (RTL).

## 2026-11-07 · Menu polish, public lobby, languages (v92, not released: GitHub access suspended)

- Asked by the King ("tout" + "un lobby pour voir toutes les parties publiques"). Menu: tip of the day (a tutorial line, by day), key / pad hint line (`padOn()`), season diamond before the weather label, time-of-day tint + stars on the title (real clock, UI only), first-launch language from `navigator.language` (never saved, the picker still wins), keyboard nav also in the solo pause menu (Space ignored in game, off in co-op), "Records" panel (best, last run, top runs from `dk_sb`).
- Public lobby, 100% peer to peer (the King: no server of ours): `multiplayer/registry.js`. The first player who opens the lobby claims the PeerJS id `nrx-hub-1` and becomes the hub (list of open games in memory, 40 s TTL); others connect to it, ask `{k:'list'}`, hosts announce `{k:'pub'}` every 15 s and `unpub` on connect / reset; if the hub leaves, the next one claims the id. Only code, host name and version travel; the game itself is joined with its room code as before. UI in the co-op window: "Public games" list with Join, "List my game in the public lobby" checkbox on Host. `loadPeer` / `peerConfig` exported from `connection.js`.
- Lobby: host checkbox now says "Private game: only with the code" / "Public game: listed in the lobby" (lock / globe); title screen has a "Join a game" pill (opens the co-op window on the code field).
- Languages: Dutch, Polish and Turkish complete (`i18n/langs/`, `node tools/langcheck.mjs`). RU, UK, JA, ZH, KO, AR not done: sentence fragments joined in code and Arabic RTL need code work first.
- Verified: build, langcheck 0 missing, menu nav by state (`NAV.sel`), P2P lobby end to end with a local PeerJS broker and two browsers (hub lists, host publishes, both see the game), screenshot of the title (FR auto, night). Also verified with the local broker: Join from the list connects both players; hub hand-over (hub page closed, the host's announcements get no `ack` within 6 s, it reconnects and claims the hub id, a new player then sees the game; takes up to ~1 min). Not verified: the real PeerJS cloud broker, gamepad hardware, the pause-menu nav in a real game.
- Limit: the hub is a player's page, so the list is empty/short when nobody is online; release v92 (VERSION, NOTES.md) when GitHub is back.

## 2026-11-07 · Launch splash (v92, not released: GitHub access suspended)

- New launch: `#boot` splash in `index.html` + `styles/boot.css` (dark ember sky, gold NARANXIA logo, shimmering bar), shown by the HTML before any script runs (the page used to flash light blue), faded out by `hideBoot()` in `core/frame-loop.js` after 4 frames of the title scene; then the logo fades in (0.5 to 1.4 s) and the menu after it (1 to 1.9 s) in `ui/title-menu.js` (`ent`/`ease`, globalAlpha, title only, in-game menu unchanged). No new texts.
- Verified: build, splash alone (screenshot), title mid-entrance (screenshot), splash element removed after load, no page errors. Not verified: real browser load time on a slow network, touch devices.

## 2026-11-06 · Title screen, menu and settings (v92, not released: GitHub access suspended)

- Asked by the King ("guide moi", answers: season and weather, Continue first, tabs): title screen shows the season and weather of the last game over the army scene (`ui/title-weather.js`, 2D particles: rain, fog, snow, petals, pollen, leaves; last wave stored in `localStorage dk_last` by `saveBest`; `wxKindFor(w)` exported from `rendering/weather.js`).
- Main menu: Continue (newest save, `svPeek` / `continueLast` in `ui/save-menu.js`) first when a save exists, then Singleplayer, Multiplayer, Load game, Tutorial (clears `dk_tut`), then one row Options / Sound / Language; "Last game: wave N - K zombies slain" and the season label under it. In-game menu unchanged.
- Settings in 4 tabs: Game (language, tutorial on/off, King skill keys), Graphics, Sound, Controls. 7 new texts in 6 languages (v92 block).
- Verified: screenshots 1280x720 (title with snow / autumn leaves / spring petals, Continue with a forced save, Game tab). IndexedDB does not work from file:// in the headless browser, so Continue was checked with a forced `saveMenuState.last`. Not verified: FR/DE text widths, small screens, touch, real desktop launcher.
- Not committed to a release: no NOTES.md bump and no version change yet; release when GitHub is back.

## 2026-11-06 · CI, tooling and save investigation (#5)

- `mp_convoy` budget raised to 400 s (it failed twice on the slow CI runner only); Chromium cached in CI; new `tools/profile.py` (CPU profile of 6000 sim ticks). The swarm (`swStep`) is already tuned: hoisting closures gave no measurable gain.
- `tests/save.js` now pauses the live loop during pack/load (it skewed `sameCont`). #5 root cause found, not fixed: `svEncode` skips `zf zft _tc pfS` (SVSKIP); after a load `u.pfS` is undefined so `movement.js` resets `pfB` (stuck detection), and worker paths drift from tick ~20-50 on. Terrain and cosmetic fields are not the cause. Fix idea: save the path field key of `pfS` and rebind it after load. Harmless for players.
- GitHub answered "account was suspended" (403) at the end of the session, so the #5 comment with this analysis is not posted yet: post it when access is back.

## 2026-11-06 · Source migration

- Replaced the numbered script fragments and tracked HTML bundle with domain ES modules, styles, and assets in `packages/game`. The Electron workspace is under `apps/desktop`.
- Build and test commands run from the npm workspace. Release CI publishes the browser artifact from the successful test job.
- Verified the v91 browser suite and repeated all four co-op scenarios with strict test setup. The archived and modular title and in-game captures matched pixel for pixel at 680×420.
- Loaded an archived v91 save in the modular build and matched the original state fingerprint. Mixed archived and modular peers delivered both convoys on the same ticks and matched all 554 sampled hashes.
- Built Windows and Linux Electron packages and checked the offline installation and save handlers with isolated profiles. The macOS build matrix remains in CI, since the Windows test host could not create the package symlinks.

## 2026-11-06 · v91
- All 13 ideas of the King (issues #6-#18) in one batch, "tout ensemble". Removed by him: events, day/night cycle, co-op roles, difficulty modes. Added by him: seasons with weather.
- Seasons and weather (`23_weather.js`, #6): season = 4 waves, weather fixed per wave from a hash of waveN, rain/snow/petals/leaves particles, thunder, sounds, top-bar label; visual and audio only (terrain colours are baked, so the season tints light, sky and fog).
- Boss every 10th wave (`25_boss.js`, #7), King skills on `<` and `>` (`27_king_skills.js`, #8, co-op command `ks`), spike traps + Boiling oil + Iron age (`28_traps.js`, #9, #12: Iron age is stats only, no building look change, no palisade, no 3rd tier look), co-op goals (`26_coop_goals.js`, #11) and typed pings Alt/Shift/Ctrl (#10).
- Stats, records by map and the `update` wrapper in `24_stats.js` (#18, #13: records are local, three best runs per seed, no online board), tutorial (`29_tutorial.js`, #16), touch layer (`30_touch.js`, #17: key rebinding already existed), hit sparks and construction dust (#14). Music (#15) already had calm / night / battle modes: only added winter bells and an autumn pluck.
- New test `features` (tests/features.js). Verified locally: det, features, tools PASS, screenshots of the HUD (boss bar, king buttons, tutorial, typed pings), the end screen and snow; mp8, mpk and save PASS too (solo save round trip same0). GitHub runs smoke, mp_resync and mp_convoy before the release. Left: real devices for touch, visual check of the ping label, Iron age look, spike pits as a palisade variant, online leaderboard (needs a server).

## 2026-11-06 · v90
- The whole restyle shipped (issues #1, #2): the King chose castle A (square fortress, now also the wooden tier via `pxCastleA(true)`),
  textures on buildings kept (he answered only "A"; taken for both boards). The wip patch was merged into `src/game/` with
  `wip/restyle/restyle.py` run on the joined parts (markers), result identical to the preview build (cmp). Toggles left in the code:
  `PXON` (const true), `window.__KV` (king, default B), `window.__CV` (castle, default A), `window.__ZOLD` (old zombies).
- Verified locally: det PASS, tools PASS, one in-game screenshot (wooden castle A, terrain, units). GitHub runs the rest before releasing.
- CI: the release run passed every test and published v90; the parallel standalone run failed mp_resync once (slow runner, J=2):
  its time budget raised from 120 to 220 s in test_all.sh. Watch it.
- wip/restyle is now history: do not run restyle.py again on src (its strings are already replaced).

## 2026-11-06 · restyle round 4: buildings (wip, not released)
- Buildings are already block-built; round 4 adds Minecraft block textures in the matV surface shader (restyle.py `PXSH`, not on
  terrain: `#ifndef TERR`): 18 pixels per tile, stone = staggered bricks with mortar, wood = planks with butt joints, per-pixel noise,
  painted ink lines at 30%. No geometry change, no cost on the CPU.
- Board version 3: A with textures / B without. He answered that the castle needs redoing (dislikes its design): two new stone castles
  in `sets_units2.js` (pxCastleA square fortress, pxCastleB great keep; `castleGeo5` patched, window.__CV picks), board version 4 (A/B, C = old).
  Waiting for his choice (and A/B for the textures); the wood castle (tier 0) will follow the chosen design; then ship the whole revamp (rounds 2-4) in one release, credit bugbilly.

## 2026-11-06 · restyle round 3 (wip, not released)
- Pixel capes (king cape + cape2 velvet and ermine with gold crown medallion, captain team cape with gold sun and hem, guard red cape
  with team collar and gold sun) via `pxCapes` before `fin()` in mcModel; the bannerman's banner as one 20x30 Minecraft banner over the
  three chained cloth pieces (`pxBanner`: gold border, fleur-de-lis, swallow tail); `pxCannon` (bronze barrel with rings, plank
  carriage, iron-tyred wheels, balls); the swarm (swGeoV) takes the zombies' green tint (`pxZg`), geometry unchanged. Knight cape, plumes, pole, pennant: old.
- Board updated (same URL, version 2, rows 1-3). He moved on to buildings without remarks: taken as approved. Then buildings (#2), then ship everything in one release.

## 2026-11-06 · restyle round 2 (wip, not released)
- The King said "Go pour le revamp" (issue #1). New pixel-skin builders in `wip/restyle/sets_units2.js`: king (A face + beard + crown,
  B royal helm + crown), captain (gilded breastplate, red sash, open bascinet, gold pauldrons, chevron shield, gilded sword), bannerman
  (kettle hat, gambeson, cross tabard), gunners (gunner2 keeps the old ramrod), zombies (same zSpec variety and MUTX proportions as before,
  skins pulled toward Minecraft green), royal sword. `restyle.py` now reads `sets_skin.js` + `sets_units2.js` (no embedded copy).
- Board published: https://claude.ai/artifact/HsTZDU2YgpyBYxceCBFiJr (rows 1-8, code like "1A 2A ..."). Approved the same night, no remarks: king B (helm + crown, now the default), everything else as shown.
- Not done yet: capes, banner, cannon, swarm crowd, buildings (#2). Ship only when the whole set is approved; credit bugbilly for the shield.

## 2026-11-06 · v89
- Batch 4 of the King's list of 2026-11-02 (the list is now complete): troops panel (F2 / army button, units by type and task,
  click to select), peasant tasks (Wood, Stone, Gold, Farm, Build in the peasant menu, `assignJob`), co-op convoys (castle menu >
  Co-op > Send: porters carry gold / wood / stone / food to the partner, dots on the map, refund after 120 s), Fire arrows research
  (Academy after Fletching: zombies burn 3 s, 6 + 0.2 x wave dps; swarm hits x1.35), selection label and unit names translated.
- Tools asked by the King ("met tout en place, consomme le moins possible, garde en mémoire chaque action"):
  `src/game.js` split into `src/game/00..22` (packed build byte-identical, checked with cmp), translations one per line + `tools/addtexts.py`,
  bug report F8 (+ Esc menu button) and `tools/repro.py` (loads the save in 1 s with the renderer stubbed), test mode F10 (solo, blocks achievements),
  `tools/test_all.sh`, GitHub CI `test.yml` (release.yml waits for it), `tools/release.sh`, `tools/ci_status.sh`, `tools/board.py`, this journal,
  GitHub issues as the backlog (labels + templates), CLAUDE.md "Working efficiently".
- Verified locally: smoke, det, tools, mp8, mpk, mp_resync, mp_convoy all PASS; convoy: 2 porters, 60 wood + 30 stone each, delivered at ticks 698 / 745
  on both machines, porters home, 1331 hash checks equal.
- CI: ubuntu-latest became 26.04, unsupported by Playwright 1.56 -> test.yml pinned to ubuntu-24.04. The first v89 release run was blocked by that,
  re-run by hand (release.yml now has workflow_dispatch, and posts on Discord only for a new release) -> all green, release v89 out,
  the CI build equals the shipped file. Local suite on the 2-core agent box takes ~25 min (smoke 274 s, tools 288 s, mp* ~200 s each): let CI run it.
- Artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 updated to v89. The King saved the `/naranxia` skill (session start + batch routine).
- Left: restyle of king, captain, bannerman, gunner, zombies, then buildings (issues #1, #2). Second player's placement and invisible
  buildings were never reproduced (identical in a real 2-client lobby test): waiting for an F8 report (#3, #4). Save/load continuation differs (#5).

## 2026-11-05 · v88
- Co-op automatic resync: hash mismatch -> host freezes, sends its save in 48 KB chunks ('rs0'/'rs1'), guest loads, then host loads the same
  snapshot (`mpResApply`, seeded Math.random during the load), lockstep restarts at a new epoch (`MP.ep`); banner "Co-op: resynchronizing...".
- Desync cause fixed: zombies / AI units took `pl` from CURPL (differs per machine), now `pl:t===0?CURPL:0`.
- Verified: mp_resync RESULT OK (resync in 7-9 s), mp8 / mpk no divergence, det same.

## 2026-11-05 · v87
- Castle turned with R while placing (door check `castleRotAt`), partner's castle visible in the live picker (ghost, beam, name tag, cursor),
  distance rule reduced to "castles must not overlap" (`sitesFar` >= 10 tiles), castles no longer sink (`smChunk` keeps the pad height),
  units use ramps (`canStep` / `canStepZ`, TFL 1 levelled 2 miner 3 player-made), double click selects all buildings of a type + group upgrade,
  tower / castle range ring on click, "Quit game" (and "Exit to desktop" in the app), co-op version check, AI kingdoms and hordes treat both castles alike.
- Decisions: public repo; "versions directes"; CLAUDE.md + headless tests + release workflow with Discord post.

## Before v87 (restyle track, unreleased, in wip/restyle)
- Approved by the King: armour of knight / royal guard / archer / peasant in the Minecraft-skin style; knight shield B (Minecraft shield);
  royal guard shield "blason 1" (red pale, gold crown and sun); voxel halberd; shield pressed on the forearm (SHZ 1.35).
- Credit "Minecraft Shield" by bugbilly (CC BY 4.0) in the release notes when the shields ship. Never copy third-party models (crimson heir: style only).
