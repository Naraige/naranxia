## Menu UX: colour-blind mode + contextual hints
- Pref `dk_cb` (core/prefs.js: cbOn/cbSet/cb(a,b)), Settings > Graphics toggle; palette applied to minimap (routes, swarm, enemies, hordes, spawns, own structs) and RDB/GRN frames (drawing.js applyCB, recoloured in place). Visual only.
- ui/tutorial.js hintBar: 3 one-line non-blocking hints (pop cap, idle peasants 20 s, first wave <=20 s), once each ever (`dk_hint_<id>`), hidden while the guided tutorial runs, solo only, real-time timers. Texts in docs/studio-texts/menu-ux.json.
- Lead: merge texts with tools/addtexts.py, run fitcheck (new Settings row + hint bar); det unaffected in principle (no sim code touched).

## Touch mode + full colour-blind (branch studio/menu-ux)
- Touch (`inputState.touch`: coarse pointer or first finger; rs() then raises UIS 2 / 2.6 / 3): 44 css px hit slop (`touchHit` in input/desktop.js, nearest centre wins), long press 480 ms = tooltip (tap fires on lift when the hit has a tip), finger pick radius 34 and double-tap window 520 ms (select same type on screen, existing logic), floating camera-pan and cancel buttons (ui/hud.js, left edge), wave texts wrap to their own strip on narrow screens. Texts: docs/studio-texts/touch-cb.json. Debug globals inputState/hudState added in debug/browser-console.js.
- `dk_cb`: minimap shapes (own = circle, zombies/hordes = diamond, rival kingdoms = square), 2D bars over units/buildings and rally flag in Okabe-Ito (blue 56b4e9, yellow f0e442, purple cc79a7). Lead: merge texts, fitcheck, no sim code touched (det unaffected).
