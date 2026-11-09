# Perf (release-v84 @ 3eebeb3)

Profil `tools/profile.py` (6000 ticks de tests/det.js, 1 run, machine chargee: load ~24 sur 2 coeurs, donc +-15 % de bruit). Baseline = 098dda9 (avant evenements, ruines, envoye). Le script d'origine bloquait sur fonts.googleapis.com (proxy): relance avec ces requetes abortees.

| | baseline 098dda9 | HEAD 3eebeb3 |
|---|---|---|
| duree 6000 ticks | 38.7 s | 44.9 s (bruit de charge) |
| swStep / swPick / swDn | 12.9 / 3.4 / 1.6 s | 14.5 / 4.0 / 2.0 s (meme ratio ~14 % du total) |
| update0 / update2 | 2.3 / 1.4 s | 3.0 / 1.8 s |

- Hashes de determinisme IDENTIQUES entre baseline et HEAD (scenario det).
- Aucune fonction des nouveautes (ruines, evenements, pouvoirs de boss, envoye) n'apparait dans le top 25; ecart total = charge machine, pas de code.
- `updateRuins`: toutes les 0.5 s, O(ruines x unites): negligeable. `syncRuins` (rendu): un `new Set` par frame + un mesh par ruine; non couvert par le profil headless (rendu stubbe), a surveiller si beaucoup de ruines chargees.
- Aucune optimisation faite (rien de mesurable); swarm.js non touche.

## LOD d'animation (animUnit), release-v84 6b57d89 - aucun changement de code
Banc `dist/perf/bench.js` via tools/run.py: 800 unites (mix 7 types, moitie en marche, 1/9 en attaque), animUnit seul, 5 x 60 images, cam.dist 24.
- Base: 1.8 a 2.6 ms/image pour 800 unites (~2.6 us/unite), bruit +-30 % (machine partagee).
- Borne haute d'un LOD (la moitie des unites animees 1 image sur 4, soit -37 % d'appels): 1.4 a 3.1 ms, dans le bruit. Gain theorique <= 0.8 ms/image (~5 % d'un budget 16.7 ms), et seulement avec 800 unites a l'ecran.
- frame.js saute deja animUnit hors frustum (sphere test) et hors fog; le cout restant du rendu est matrixWorld/draw calls, que le LOD d'animation ne reduit pas.
- Risque: lerps bases sur dt (k=dt*16) demandent un dt cumule, sauts visibles sur jambes/bras a mi-distance. Gain non net: rien modifie, hashes et simulation intacts.
