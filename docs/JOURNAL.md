# Naranxia journal

Newest first. One entry per batch or work session: what changed, what was verified, decisions, what is left.
Start of a session: read the top 2 entries and trust them (do not re-verify what is marked verified).
End of a batch: add an entry on top (3 to 10 lines), close the issues, keep CLAUDE.md in step if a rule or a tool changed.

## 2026-11-07 · Design refresh: glass UI, Inter, cool light (v92, not released)
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
