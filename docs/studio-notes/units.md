# units (hd-model): planche « toutes les unités », A actuel / B nouveau

## 2026-11-10 · look B pour toutes les unités, derrière un seul interrupteur (non fusionné, non livré)
- Demande du Roi: « améliore le design de toutes les unités en respectant le style Minecraft » (référence de qualité: planche de sets d'armures, niveau de détail et silhouettes seulement; aucun modèle ni texture repris).
- Interrupteur unique: `rendering/models/unit-style.js`, `UV2_ON` ('' = look actuel partout, valeur par défaut; 'all'; ou liste de types). `window.__UV2` (même format) ne sert qu'aux aperçus. Le look actuel reste la production tant que le Roi n'a pas répondu.
- Code du look B: `rendering/models/unit-skins-v2.js` (paysan, archer, chevalier, capitaine, porte-étendard, canonniers, garde royal, roi), `pxTone` / `pxHead2` / `skinV2` dans `soldier-skins.js` (ombrage par pixels, visage), branches `V2` dans `zombie-skins.js` (7 morts-vivants + boss), `zKeyOf` dans `swarm.js` (le boss de vague prend son propre modèle quand `uv2('boss')`), une ligne de dispatch dans `units.js` (`humanKit`), clé de cache dans `rendering/unit-instances.js` (suffixe `n`).
- Visuel seulement: aucune lecture/écriture de la simulation (le boss lit `u.boss` / `u.bn`), mêmes parties (torse, tête, bras, jambes, parts animées), mêmes ancrages, mêmes hauteurs `h` (barres de vie, sélection), armes et boucliers inchangés, instancing inchangé, rien dans la sauvegarde.

### Inventaire traité (19 lignes de la planche = types pour `UV2_ON`)
| ligne | type(s) | cubes ajoutés en B | détail |
|---|---|---|---|
| 1 | peasant (6 variantes) | +2 (bourse, hotte) ; +1 bandeau ou visière selon la variante | tunique 3 tons, bretelles, ceinture de corde, manches roulées |
| 2 | archer | +3 (camail, 2e pointe de capuche, bourse) | liseré du camail et empennage aux couleurs du royaume |
| 3 | knight (rangs 0-3, recherche 0-2, rebelles) | +3 (braconnière, lame sous chaque épaulière) | cubes de base cachés non dessinés |
| 4 | captain | +2 ailes de casque (découpes), + lames d'épaulière | cape et plumet animés inchangés |
| 5 | bannerman | +3 (camail, cor en 2 cubes) | bannière inchangée |
| 6 | gunner, gunner2 (équipe du canon) | +2 (bord du feutre, corne à poudre) | canon inchangé |
| 7 | guard | +3 (braconnière, lames d'épaulière) | cape inchangée |
| 8 | king | +3 (braconnière, lames d'épaulière) | modèle validé conservé, seulement ombré |
| 9-11 | scout, engineer, envoy | 0 | modèles validés le 09/11, seulement visage + ombrage |
| 12 | zombie (24 variantes + soldats/archers/paysans tombés) | 0 à 2 selon la graine (corde, épée fichée, cape) ; épaulière pour les soldats tombés | |
| 13 | husk | +2 bandelettes | |
| 14 | runner | +3 (bandeau, 2 pans) + 2 griffes par bras | |
| 15 | brute | +4 (collier, 3 épines) + épaulière à pointe | |
| 16 | bomber | +2 bombes + 2 mèches | |
| 17 | acid | +3 (bave, 2 poches) | |
| 18 | miner | +2 (sac de minerai, corde) | |
| 19 | boss (brute géante de vague 10, 20...) | +8 (cornes, mâchoire, hampe, étendard, épaulière) | modèle propre: +5 draw calls quand un boss est à l'écran |
Non traité: le canon lui-même (machine, `pxCannon`), les armes et boucliers (`weapons.js`, `heraldry.js`), la nuée instanciée (`rendering/swarm.js`, géométrie LOD `zBuild`, inchangée: au loin la horde garde l'ancien aspect), l'armée de l'écran titre (prend automatiquement le look choisi pour knight).

### Coût (mesuré)
- Triangles par modèle (A -> B), même nombre de meshes par unité (vérifié pour les 28 modèles rendus): `docs/studio-boards/units/tri.json`. Les unités en plates baissent (chevalier 5098 -> 3580, garde 5314 -> 3802, capitaine 5298 -> 4288) parce que les cubes de base entièrement couverts ne sont plus dessinés; les unités en tissu montent (paysan 1154 -> 2212, archer 1910 -> 2880, éclaireur 990 -> 1510, équipe du canon 4382 -> 5774); morts-vivants +2 à +30 %.
- Scène chargée (`_src/army.py`, 157 unités: toute la liste en rangs + 63 morts-vivants + un boss, 1280x720, distance 20): A 338 draw calls, 476 498 triangles; B 343 draw calls (+5: le modèle propre du boss), 493 202 triangles (+3,5 %).
- Temps de frame de `render3D` (GL logiciel, machine partagée à charge 12-19, 12 frames): A médiane 10,5 ms / min 6,8 ms; B médiane 15,4 ms / min 5,2 ms. Passages précédents: A 16,5 / 9,3 et B 18,2 / 9,0; A 16,3 / 11,4 et B 19,7 / 14,7 (autre cadrage). La médiane de B est plus haute aux 3 passages (+10 à +45 %) alors que les minimums se valent et que B a toujours été mesuré en second; l'écart entre passages dépasse l'écart A/B. Non concluant: à mesurer sur une vraie carte graphique avant de livrer.
- Tests sur la branche (look par défaut = A): `npm test -- det smoke` ALL PASS. Les 8 hashes de `det` sont identiques à ceux de `release-v84` (base reconstruite à part et rejouée).
- Non fait: `det` avec le look B activé (le look n'est lu que par le rendu), essai sur vraie carte graphique, écran titre et icônes d'unités (`pixel-icons.js` prend la tête du modèle) regardés avec le look B, co-op.

### Planche
- `docs/studio-boards/units/board.html` (autonome, format `tools/board.py`), cartes `rNN_{A,B}.jpg`, `spec.json`, `rows.json` (numéro de ligne -> types), captures d'armée `army_A.png` / `army_B.png`.
- Régénérer: `npm run build`, `python3 docs/studio-boards/units/_src/render.py dist/board A 540 - back` puis `B`, `python3 docs/studio-boards/units/_src/compose.py dist/board`, `python3 tools/board.py docs/studio-boards/units/spec.json docs/studio-boards/units/board.html`, `python3 docs/studio-boards/units/_src/army.py A|B out.png 20`. Machine chargée: 10 à 20 min par rendu, un seul à la fois.

### Après la réponse du Roi (ex. « 1B 2B 3A ... »)
1. Mettre dans `UV2_ON` les types des lignes choisies en B (`rows.json`), ou `'all'`.
2. Lignes restées en A: rien à faire. Quand tout est tranché, supprimer le code du look perdant (ancien `px*` ou `px2*`) et l'interrupteur.
3. Tests à lancer par le lead après fusion: `det smoke` (faits ici), puis `mp8 mpk mp_resync save` par principe (aucun fichier de simulation touché).
