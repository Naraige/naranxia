## Icône de la bannière du royaume façon porte-étendard (demande du Roi), base release-v84, visuel seulement, interrupteur éteint

Demande, mot pour mot: « i'm still not happy about the icon for banner rework the banner maybe something more like the bannerman for exemple ».

### Où la bannière est dessinée en 2D (constat)
- `rendering/kingdom-banner.js drawBanner()` peint le canevas `BANNER` 128x192 (vectoriel lissé: écu à pointe rentrante, tringle dorée, emblème `EMB` en métal). Ce canevas sert 4 fois: HUD en haut à gauche (`ui/hud.js`, 13x19,5 unités d'interface), carte « Your kingdom » de Nouveau royaume (`ui/title-menu.js drawSetup`), liste des sauvegardes (`ui/save-menu.js`), et texture 3D des bannières des tours / portes en pierre (`bannerMat`, `rendering/structures.js`).
- `drawEmblemR`, `shieldTile`, `bannerPattern`: pastilles de choix du motif et de l'emblème dans Nouveau royaume (non touchées).
- `rendering/pixel-icons.js`: le dessin 16x16 `ban` (`IC2.bannerman=pc16(...)`) est du code mort: il est remplacé quelques lignes plus bas par la tête du porte-étendard (`miHead('bannerman')`), comme `IC.bannerman` de `ui/icons.js thIcons`. Le menu de la caserne montre donc la tête, pas une bannière.
- En 3D, l'étendard du porte-étendard (`models/heraldry.js bannerKit`, `models/unit-accessories.js pxBanner`, hampe look B `models/gear2.js g2Pole`): hampe à viroles dorées, pointe de lance, traverse à pommeaux, drap 20x30 px bordé d'or, lys d'or fixe (pas l'emblème du royaume), queue d'aronde, flamme fourchue.

### Ce qui est fait
- `rendering/banner-icon.js` (nouveau): `BANNER2` ('' par défaut), `bannerIcon(large)` rend `BANNER` tel quel quand l'interrupteur est éteint, sinon un sprite 24x36 (même boîte 2:3) agrandi x8, mis en cache par variante + thème. `window.__BANNER2` pour les aperçus.
  - B étendard du porte-étendard: pointe de lance, flamme, traverse à pommeaux d'or, drap bordé d'or, queue d'aronde, hampe visible dessous.
  - C gonfanon sur mât (écran titre): mât sur socle de pierre, boule dorée, potence, drap à dents, flamme.
  - D bannière murale: clou, cordons, tringle dorée, grand drap à liseré clair en pointe, gland.
  - Tous suivent le thème: couleur, 2e couleur + motif (`bannerPattern` seuillé en pixels durs), emblème (16 emblèmes redessinés à la main sur 11x11, `EMB11`, même ordre que `EMB`), métal or ou argent comme `embMetal`. Contour d'encre 1 px, 3 tons de métal, plis du drap.
  - Deux lettres = petite image puis grande (ex. 'DB'); 'A' = actuelle.
- `ui/hud.js`, `ui/save-menu.js`, `ui/title-menu.js`: `drawImage(BANNER,...)` devient `drawImage(bannerIcon(),...)` (mêmes rectangles). `debug/browser-console.js`: `THEME`, `drawBanner`, `bannerIcon` exposés pour les captures.
- Planche `docs/studio-boards/banner/board.html` (`cap.py` captures du jeu, `make_board.py`, `_src/sheet.mjs` + `_src/sheet.py` = contrôle rapide du dessin sans charger le jeu), `rows.json`.

### Non fait / à savoir
- La texture 3D des bannières de pierre reste le dessin A (128x192). La passer au sprite choisi = dessiner le sprite dans `drawBanner` (hors demande, à proposer si le Roi choisit B, C ou D).
- Les pastilles d'emblème de Nouveau royaume restent vectorielles: l'emblème 11x11 de la bannière n'est pas exactement le même dessin que la pastille.
- Sprite plus fin que les autres icônes pixel (24x36 dans une boîte de 13x19,5 unités: environ 1 pixel écran par pixel du dessin en 1280x720); à 16 px de haut il est réduit en lissé.
- Infobulle du HUD et textes inchangés. Pas de test `det` relancé: aucun fichier de simulation touché.
