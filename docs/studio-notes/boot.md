# Boot / intro (hd-perf, base release-v84)

## Bug
Le Roi (build compressé dans une page claude.ai) : « je n'ai pas vu les animations du lancement, ça a freeze directement puis menu ».

## Cause (mesurée avec `tools/bootprobe.py`, Chromium headless, WebGL logiciel : les durées GPU sont très gonflées, les rapports comptent)
- Tout le démarrage (évaluation du script, ~75 `initialize*`, monde, ~120 icônes rendues en WebGL avec relecture de pixels, puis première image du titre : armée + compilation des shaders) tournait dans UNE tâche synchrone, lancée dès la fin du dépaquetage, avant ou juste après la première peinture.
- La carte Hammerdawn était animée dans le SVG (soleil, rayons, marteau : animations non composées) et par `letter-spacing` / `filter` : figée dès que le thread principal est pris. Le Lottie de la carte Claude est du JS : figé aussi.
- La durée de l'intro était comptée en horloge murale depuis le chargement de la page (`performance.now()>4900`, carte 2 à 2 s en CSS, Lottie à 1,9 s) : le temps passé bloqué était « consommé », donc à la fin du blocage les cartes étaient déjà finies : gel, puis menu.
- Le travail WebGL (contexte, textures, shaders) bloque aussi le compositeur du navigateur : même une animation CSS composée s'arrête pendant ce temps (vérifié : boucle JS pure de 3 s = 25 images / 0,5 s présentées ; démarrage WebGL = 0).

## Correctif
- `index.html` : carte 1 en calques (un `<svg>` par élément animé) ; petit script en ligne qui pose `#boot.go` à la première image réellement peinte (`__nxIntro.t0`), décide du saut (`dk_rm`, `dk_qi`+`dk_seen`), écoute clic / touche.
- `styles/boot.css` : toutes les animations en `transform` / `opacity` sur leur propre calque, déclenchées par classes (`go`, `c1out`, `c2`, `done`, `skip`, `ld`) ; points de chargement ; `prefers-reduced-motion` = fondus seuls.
- `core/boot.js` (nouveau) : exécute les étapes de `main.js` par tranches de 30 ms (les étapes peuvent être des générateurs : `initializeFrameLoop`, `initializePixelIcons`, une icône par pas). Les étapes sans WebGL passent pendant l'entrée de la carte 1 ; tout ce qui touche WebGL attend la fin de cette entrée (1,9 s après la première peinture) et se fait sous la carte immobile, puis une image du titre est dessinée cachée (`prepTitle` + `warmFrame`, avec relecture d'un pixel pour attendre le GPU). Ensuite carte 1 sort, carte Claude (Lottie lancé à ce moment, plus à l'horloge), boucle démarrée pendant son fondu, rideau seulement après 4 images du titre dont 2 rapides (ou 12 images / 3 s). Points de chargement si une attente dépasse 1 s. Les entrées clavier / souris n'atteignent le jeu qu'à l'ouverture du rideau (avant : un clic pendant l'intro pouvait activer un bouton du menu caché).
- `tools/build_dist.mjs` : le dépaquetage gzip+base64 attend deux images d'animation (splash peint) ; repli par minuterie pour un onglet caché.
- `core/frame-loop.js` : `loop` = `frame` + rAF, `warmFrame`, `startFrameLoop` ; l'ancienne logique `hideBoot` / `skipBoot` est partie dans `boot.js`. `ui/intro-claude.js` : `playClaudeIntro()`.
- Sous automatisation (`navigator.webdriver`, donc tous les tests et outils headless) le démarrage reste synchrone et sans cartes, comme avant : les harnais évaluent leur script après une attente fixe. `tools/bootprobe.py` force le vrai chemin (`window.__nxBootReal`).
- Réglages respectés : « Reduce motion » du jeu et « Studio intro : first launch only » (déjà vue) = pas de cartes, chargement immédiat, fond + points si > 1 s, rideau quand le titre est prêt.

## Mesures (build compressé, 640x360, machine partagée très chargée, WebGL logiciel)
| | avant | après |
|---|---|---|
| plus longue tâche pendant que l'intro devrait jouer | 51,8 s (tout le démarrage) | 0 pendant l'entrée de la carte 1 (étapes CPU : 30 ms max) ; ensuite 4,1 s (création du contexte WebGL, carte immobile) |
| images présentées pendant les 2 premières secondes | 71, carte figée (seul le fondu passe) | 99 (17 / 29 / 29 / 24 par 0,5 s), carte animée |
| images présentées ensuite jusqu'au titre | 0 pendant 110 s | continues pendant les icônes et la carte Claude (20 à 30 par 0,5 s) |
| carte Claude (Lottie) | jamais vue (horloge écoulée) | jouée après le chargement, 30 images / 0,5 s |
Captures toutes les 0,5 s : `dist/boot/after/fNN.jpg` (planches `dist/boot/sheet1.png`, `sheet2.png`), avant : `dist/boot/before/`.

## Reste / à tester par le lead
- Vrai GPU et vraie page claude.ai : non mesurables ici. À regarder : entrée de la carte 1 fluide, durée de la carte immobile (points si > 3 s après le début), Lottie fluide, pas de gel à l'ouverture du rideau.
- En WebGL logiciel chaque image du titre prend plusieurs secondes : le fondu de sortie de la carte Claude y saccade (boucle démarrée dessous). Sur GPU réel l'image est déjà compilée.
- L'intro dure ~1 s de plus qu'avant sur machine rapide (le WebGL attend la fin de l'entrée de la carte 1). Constante `C1_ANIM` dans `core/boot.js` si le Roi préfère charger pendant l'animation.
- `docs/studio-boards/revamp/cap_boot.py` capture la carte sans script : il faut maintenant ajouter la classe `go` à `#boot` (et sa regex de fin `</div></div></div>` ne correspond plus).
- Le texte de la carte est `HAMMERDAWNSTUDIO` sans espace dans `index.html` (déjà ainsi avant) : à confirmer.
- Tests : `npm test -- det smoke tools` (voir rapport) ; hashes inchangés attendus (rien dans la simulation).
