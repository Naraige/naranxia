# mutants (hd-model): planche « monstruosités », A actuel / B nouveau

## 2026-11-10 · look B des 6 mutants + boss, derrière un interrupteur (non fusionné, non livré)
- Demande du Roi: « améliore les mutants pour ressembler à des monstruosités ». Aujourd'hui ce sont des zombies avec un accessoire.
- Interrupteur unique: `packages/game/src/rendering/models/mutant-style.js`, `MUT2_ON` ('' = look actuel, valeur par défaut; 'all'; ou liste: `husk,runner,brute,bomber,acid,miner,boss`). `window.__MUT2` (même format) ne sert qu'aux aperçus.
- Code du look B: `rendering/models/mutants.js` (`pxMutant`, un bloc par type). Raccords (une ligne chacun): `zombies.js` (`zombieKit` choisit `pxMutant` ou `pxZombie`), `models/swarm.js` (`zKeyOf`: le boss a son modèle si `mut2('boss')`), `unit-instances.js` (suffixe `m` de la clé de cache), `rendering/swarm.js` (`zEyes`: position des yeux de nuit, table `MUT2_EYE`).
- Visuel seulement: même rig (torse, tête, 2 bras, une jambe dessinée 2 fois), mêmes pivots, même échelle `sc`, même hauteur `h` (barres de vie), animation non touchée. Rien dans la simulation ni la sauvegarde. Zombies normaux inchangés. Aucune arme tenue en main refaite (la pioche du mineur faisait déjà partie de son bras: elle est devenue une excroissance du poignet).
- Style: base joueur Minecraft déformée par des cubes, détail en pixels 3 tons par matière (sombre, base, clair + ourlet sombre et rang du haut éclairé), lueurs = matériau 5 (émissif du shader des unités), aucune lumière ajoutée. Référence d'esprit: mobs façon Minecraft Dungeons; aucun modèle ni texture repris.

### Ce que fait chaque type (ligne de la planche -> type pour `MUT2_ON`, voir `rows.json`)
| ligne | type | silhouette | accent |
|---|---|---|---|
| 1 | brute | masse bossue asymétrique: un bras démesuré (épaule, chair à vif, plaques d'os, poing aux genoux), l'autre desséché avec fer et chaîne, 2 bosses à pointes d'os, tête enfoncée à défenses, taille qui pend sous les hanches | rouge chair sur violacé |
| 2 | runner | plié en deux (torse tourné de 0,56 rad), crâne long à museau et mâchoire pendante, côtes et vertèbres, jambes en échasses, bras décalés de 5 px terminés par 3 lames d'os | blanc cendre, avant-bras rouge sang |
| 3 | bomber | corps boursouflé, baril fusionné dans le dos (chair qui le recouvre), ventre et dessus fendus sur un cœur incandescent, cloques, mèche | orange |
| 4 | acid | voûté, poche de gorge torse-menton, 3 poches veinées dans le dos, mâchoire décrochée pleine d'acide, filets, un avant-bras à l'os | vert acide |
| 5 | miner | roche sur le dos, une épaule, une hanche, les pieds; cristaux; casque de fer rouillé; lanterne à la place du visage; avant-bras de pierre + pioche; main gauche rocher | ambre + cyan |
| 6 | husk | fendu en deux du crâne au bassin (moitiés décalées, colonne et côtes dans la fente), linceul soudé, bandelettes qui traînent, un œil pâle | lin clair sur brun |
| 7 | boss | autre créature que la brute: crâne nu à cornes sous couronne brisée, gueule verticale dans le torse, côtes en griffes par-dessus les épaules, 2 bras à lames d'os, veines violettes, étendard conservé (couleur selon le boss) | violet |
| 8 | (horde) | vue d'ensemble à la distance du jeu, pas de type | |
Pas de variante C.

### Coût (mesuré, `_src/render.py` et `_src/horde.py`)
- Triangles par modèle, A -> B (une variante par type, 6 meshes dans les deux cas): husk 2604 -> 1992, runner 1862 -> 1420, brute 1826 -> 2806, bomber 2050 -> 2744, acid 1926 -> 2542, miner 2106 -> 2972, boss 2420 -> 4174 (`tri.json`).
- Somme des 6 mutants: 12 374 -> 14 476 (+17 %). Dans une horde le poids dépend de la part de mutants; les zombies normaux ne changent pas.
- Scène horde (`horde.py`, 60 morts-vivants dont 36 mutants + 1 boss, 1280x720, distance 19): A 191 draw calls, 292 906 triangles; B 191 draw calls, 307 788 triangles (+5,1 %). Draw calls identiques (même nombre de modèles et de parties).
- Temps de frame non mesuré (GL logiciel non concluant, voir units.md).

### Vérifié / non vérifié
- Poses: repos, marche et attaque rendues pour les 7 (planche de contrôle, non gardée): rien ne se détache, bras et têtes suivent.
- Toutes les cartes de la planche regardées une fois. `r01_A/B` et `r07_A/B` ont été recomposées ensuite (seule la vignette « taille jeu » a bougé: 1:1 seule pour brute et boss), non re-regardées.
- Non vérifié: variantes autres que celle rendue par type (teinte de peau et bruit changent, pas la forme), nuit (position des yeux `MUT2_EYE` estimée, lueur `mutGlow` du bomber et du cracheur inchangée), cadavres, co-op, vraie carte graphique, `det` avec `MUT2_ON='all'` (le look n'est lu que par le rendu).
- Non traité: la nuée instanciée lointaine (`rendering/swarm.js`) ne contient que zombie / husk / runner en géométrie LOD `zBuild` avec animation dans le shader: elle garde l'ancien aspect. La reprendre demande une version boîtes des nouveaux husk et runner (travail M, +triangles sur des milliers d'instances): à décider après la réponse du Roi.

### Planche
- `docs/studio-boards/mutants/board.html` (autonome, images en data URI, aucune requête externe), cartes `rNN_{A,B}.jpg`, `rows.json`, `horde_{A,B}.png`.
- Régénérer: `npm run build`; `python3 docs/studio-boards/mutants/_src/render.py dist/mut AB 540 - fb .56`; `... render.py dist/mut AB 240 - g .7`; `python3 docs/studio-boards/mutants/_src/horde.py A docs/studio-boards/mutants/horde_A.png 19` puis `B`; `python3 docs/studio-boards/mutants/_src/compose.py dist/mut`. Un rendu à la fois (1 à 6 min chacun).

### Après la réponse du Roi (ex. « 1B 2B 3A ... »)
1. Mettre dans `MUT2_ON` les types des lignes choisies en B (`rows.json`), ou `'all'`. La ligne 8 ne porte pas de type.
2. Lignes restées en A: rien à faire. Quand tout est tranché: supprimer les branches du type perdant (dans `zombie-skins.js` pour A, dans `mutants.js` pour B) et l'interrupteur.
3. Tests par le lead après fusion: `det smoke` (faits ici avec le défaut ''), puis `mp8 mpk` par principe (aucun fichier de simulation touché).
