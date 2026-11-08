# Hammerdawn Studio: how an agent works on a branch

You work in your own git worktree (a copy of the repo on your own branch `studio/<name>`), so other agents never overwrite your files.

## Setup (once)
1. `cd` into your worktree (the current directory). `ln -s /home/claude/naranxia/node_modules node_modules` (do not run npm install).
2. Read `CLAUDE.md` and the top 2 entries of `docs/JOURNAL.md`. Read your report in `/home/claude/naranxia/dist/ideas/<name>.md` (your improvement ideas).
3. `npm run build` builds `dist/naranxia_readable.html` in YOUR worktree. Rebuild after each change.

## What you may do
- Edit only the files of your own scope (given in your task). If you need a file owned by another agent, do not touch it: describe the change in your final report.
- Texts: never edit `packages/game/src/i18n/translations.js`. Write new player-facing strings to `docs/studio-texts/<name>.json` as `{"English text": ["FR","ES","DE","IT","PT"], ...}` (templates use `{0}`; French uses "vous"). The lead merges them with `tools/addtexts.py`.
- Pictures: `python3 tools/run.py script.js out.png 1280 720` (the JS function runs inside the loaded game; globals such as units, mkU, structs, build, update(dt), render3D, CAM are available; to see a spot, place a player unit near it and run ~30 `update(.1)` ticks first, or fog makes it black) and `python3 tools/preview/showshot.py naranxia_readable.html "window.__U='knight~~~0';window.__B='-'" outdir tools/preview/j_show2.js` for single units. Look at a picture once, at 1280x720.
- Review boards (visual choices go to the King, never decided by you): put variant images in `docs/studio-boards/<name>/` and write `spec.json` there (`{"title","intro" (French),"sections":[{"name","variants":[{"id":"A","img":"x.png","note":"short"}]}]}`); the lead renders it with `tools/board.py` and publishes it. Keep production code on the current look until the King answers; variants must be switchable by one constant or kept in clearly marked code, not left half-wired.

## Hard rules
- Simulation must stay deterministic (seeded RNG, stable iteration, no `Math.random()`/`Date` inside `update()`, player actions as commands, state in SAVA or on units/structures with absent-field tolerance, `svFix`/`SVMIG` for format changes). Visual and audio code uses REALR.
- Do NOT run `npm test` (the lead runs the whole suite after merging, tests are heavy). A quick `python3 tools/run.py` check of your own change is fine.
- Do NOT push, do NOT touch `game/`, `announce/`, the Discord webhook, GitHub, or artifacts.
- Commit on your branch when done: `git add -A && git commit -m "<what>"` with the trailer lines
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01RjDKDR1nq7agPQpxDGEi8u`.
- Add a short entry (3 lines max) to `docs/studio-notes/<name>.md` describing what changed and what the lead must test. Do not edit `docs/JOURNAL.md` (the lead does).

## Final report (French, under 150 words)
Files changed, what works (what you verified and how), what is left or risky, tests the lead should run (det, mp8, mpk, mp_resync, save, compat, features...).
