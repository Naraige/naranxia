## Menu UX: colour-blind mode + contextual hints
- Pref `dk_cb` (core/prefs.js: cbOn/cbSet/cb(a,b)), Settings > Graphics toggle; palette applied to minimap (routes, swarm, enemies, hordes, spawns, own structs) and RDB/GRN frames (drawing.js applyCB, recoloured in place). Visual only.
- ui/tutorial.js hintBar: 3 one-line non-blocking hints (pop cap, idle peasants 20 s, first wave <=20 s), once each ever (`dk_hint_<id>`), hidden while the guided tutorial runs, solo only, real-time timers. Texts in docs/studio-texts/menu-ux.json.
- Lead: merge texts with tools/addtexts.py, run fitcheck (new Settings row + hint bar); det unaffected in principle (no sim code touched).
