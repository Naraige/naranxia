# gear (hd-model): planche « armes et outils », A actuel / B nouveau

## 2026-11-10 · look B pour les objets tenus, derrière un seul interrupteur (non fusionné, non livré)
- Demande du Roi: « revamp tout les armes / outils pour harmoniser le tout » (les unités et les bâtiments viennent de passer au look B, les objets tenus non).
- Interrupteur unique: `rendering/models/gear-style.js`, `GEAR2_ON` ('' = objets actuels partout, valeur par défaut; 'all'; ou liste de clés). `window.__GEAR2` (même format) ne sert qu'aux aperçus; la valeur fait partie des clés de cache (modèles, outils, canon), donc un aperçu peut passer de A à B sans recharger.
- Code du look B: `rendering/models/gear2.js` (palette commune `gearPal`, épées, hallebarde, arc, outils, charges, hampe, canon, palette des boucliers). Branchements: `unit-parts.js` (`toolGeos`: un jeu d'outils par valeur d'interrupteur, couleur de royaume et recherche d'armure), `units.js` (`r.T`), `weapons.js` (`pxMcShield(..., g2)`), `heraldry.js` (`bannerKit` -> `g2Pole`), `unit-accessories.js` (`pxCannon` -> `g2Cannon`).
- Visuel seulement: aucune lecture/écriture de la simulation, mêmes ancrages, mêmes tailles hors tout, même nombre de meshes par unité, animation inchangée, rien dans la sauvegarde.

### Direction
- Une seule palette pour tous les objets, tons des unités B: ST acier, BL acier poli des lames, IR fer, GO or, WD bois, WL bois clair (manches, arc, hampe), LE cuir, CL étoffe/corne, RU rubis, BZ bronze, SN pierre; 5 tons chacun, 3 à 4 par pièce (dessus et rang du haut éclairés, lèvre et dessous sombres, quelques pixels usés: la règle de `pxTone`).
- Armes en voxels sur la grille de pixels des unités (1 cellule = 1 pixel d'unité; les lames actuelles sont en demi-pixels). Parties plates en pixel art (lames, fers), parties épaisses en cubes (gardes, douilles, pommeaux, têtes de marteau).
- Dessins maison; aucun modèle, texture ou icône repris.

### Inventaire traité (12 lignes de la planche = clés pour `GEAR2_ON`)
| ligne | clé(s) | objet | ce qui change en B |
|---|---|---|---|
| 1 | sword | épée du chevalier | une épée par niveau de recherche (garde de fer, d'acier à pommeau de laiton, dorée à gouttière incrustée); émail du pommeau à la couleur du royaume, donc à celle des rebelles pour les rebelles |
| 2 | gsword | épée du capitaine | plus longue, garde dorée aux bouts tournés vers la lame, pierre lumineuse du royaume |
| 3 | rsword | épée du Roi | lame large à gouttière d'or, garde à rubis, fusée rouge |
| 4 | halberd | hallebarde du garde royal | fer plus grand à deux encoches, bec, douille d'acier, collier d'or, gland du royaume |
| 5 | bow | arc | arc recourbé en voxels, bagues d'or, pointes de corne, bande du royaume |
| 6 | shield | bouclier du chevalier | même construction Minecraft (12x22x1, bord, rivets, poignée); bord fer / acier / or selon la recherche, peinture éclairée en haut et ombrée en bas |
| 7 | cshield | bouclier du capitaine | idem, bord toujours doré |
| 8 | gshield | bouclier du garde royal | idem |
| 9 | axe,pick,hoe,hammer | outils du paysan | manche veiné, poignée de cuir, têtes de fer sombre à tranchant clair |
| 10 | carry | charges portées (bois, or, pierre) | rondins sanglés, coffret cerclé avec son or, blocs taillés |
| 11 | banner | hampe d'étendard | hampe veinée, viroles et embouts d'or ombrés, pointe d'acier; étoffe inchangée |
| 12 | cannon | canon | même construction, repeinte avec la palette commune |

### Trouvé mais non traité
- Projectiles (`rendering/effects.js`: flèche, carreau `bolt`, boulet `cball`, pierre): ce sont des cubes mis à l'échelle dans un seul InstancedMesh, pas des modèles. Leur donner une forme demanderait un mesh instancié de plus par type (+1 draw call chacun).
- Objets cuits dans les skins du look B des unités (déjà redessinés le 10/11 avec la palette des unités): carquois et flèches de l'archer, cor du porte-étendard, corne à poudre des canonniers (`unit-skins-v2.js`); longue-vue de l'éclaireur, clé et marteau de l'ingénieur, parchemin de l'émissaire (`royal-skins.js`, validés le 09/11); armes des morts-vivants (`zombie-skins.js` / `zombies.js`: pioche du mineur, chaîne de la brute, baril et bombes de l'artificier, étendard du boss, flèches plantées).
- Étoffe de la bannière et capes (`unit-accessories.js`), piques de l'armée de l'écran titre (`title-army.js`, `pikeGeo`), carreau et tête de baliste, trébuchet (bâtiments), icônes 2D (`pixel-icons.js`, sprites `SPR` de `unit-parts.js`).
- Anciennes versions non pixel (`PXON=false`) de `toolGeos` / `shieldGeo`: code mort conservé tel quel.
- Aucun texte joueur ajouté.

### Coût (mesuré)
- Par objet, triangles A -> B (`docs/studio-boards/gear/tri.json`, clés `i_*`): épée 876 -> 440 (452 dorée), capitaine 796 -> 680, Roi 1092 -> 828, hallebarde 884 -> 808, arc 660 -> ~600, boucliers 748-768 -> 792-808, hache 108 -> 322, pioche 156 -> 500, houe 84 -> 196, marteau 96 -> 198, charges 36-48 -> 184-344, canon 2558 -> 3746. Meshes par unité identiques (8 chevalier, 10 capitaine, 9 Roi et garde, 7 archer et paysan, 12 porte-étendard, 13 canon).
- Scène chargée (`_src/army.py`, 157 unités, 1280x720): caméra de la planche des unités (distance 20) A 348 draw calls / 494 688 triangles, B 348 / 494 420; vue de face (distance 13) A 320 / 626 144, B 320 / 625 876.
- Temps de frame: non concluant (GL logiciel, machine partagée à charge 9-10; médianes A 19,2 ms / B 38,7 ms au premier cadrage, 28,7 / 37,3 au second, B toujours mesuré en second). À mesurer sur une vraie carte graphique.
- Draw calls en plus possibles hors de cette scène: en B l'épée dépend de la recherche et de la couleur du royaume; des chevaliers rebelles à l'écran ajoutent 1 draw call par royaume rebelle (comme leurs boucliers aujourd'hui).

### Planche
- `docs/studio-boards/gear/board.html` (autonome), cartes `rNN_{A,B}.jpg`, `spec.json`, `rows.json` (numéro de ligne -> clés), `tri.json`, captures `army_*.png` (caméra de la planche des unités), `armyf_*.png` (vue de face), `army_*_x2.png` (vue de face agrandie).
- Régénérer: `npm run build`, `python3 docs/studio-boards/gear/_src/render.py dist/gear AB 540` (A et B en un seul chargement), `python3 docs/studio-boards/gear/_src/army.py A|B out.png 20 12` et `... 13 3 .62 0 -6 5`, copier les captures dans le dossier de la planche, `python3 docs/studio-boards/gear/_src/compose.py dist/gear`, `python3 tools/board.py docs/studio-boards/gear/spec.json docs/studio-boards/gear/board.html`, puis ajouter `<!doctype html>` et `<meta charset="utf-8">` en tête (board.py ne les écrit pas). `_src/sheet.py` fait une planche-contact pour relire.

### Après la réponse du Roi (ex. « 1B 2B 6A ... »)
1. Mettre dans `GEAR2_ON` les clés des lignes choisies en B (`rows.json`), ou `'all'`.
2. Lignes restées en A: rien à faire. Quand tout est tranché, supprimer le code du look perdant et l'interrupteur.
3. Tests à lancer par le lead après fusion: `det smoke`, puis `mp8 mpk mp_resync` par principe (aucun fichier de simulation touché).
