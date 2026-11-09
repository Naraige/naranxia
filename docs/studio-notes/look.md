## look (reponses du Roi 1C 2C 3B 4B 5B), UI seulement, base release-v84
- 1C: `UIT.gold` + `bev()` (drawing.js): liseré doré 1 px et coins en escalier de 2 pas sur panneaux (frame) et slots verre (mcSlot; survol bleu conservé, verrouillé = or atténué). Boutons, infobulles, focusRing inchangés.
- 2C: troop-panel.js, une carte par type (icône, nom, compteur) + une puce par tâche (cliquables, mêmes sélections qu'avant). Pas de barre de PV (donnée non affichée dans le jeu).
- 3B: build-menu.js drawItem: icône + coût/état, le nom n'est plus dessiné (il est la 1re ligne de l'infobulle). Tactile: nom conservé (pas de survol).
- 4B: `FFP` (typography.js) = Pixelify Sans puis Inter: TTL/twH (grands titres) et TN (en-têtes de panneau, Train/Build/Command). Corps en Inter. index.html charge Pixelify Sans 500;700 (Google Fonts, display=swap, repli Inter hors ligne). tools/fontroute.py sert docs/studio-boards/look/fonts/p.ttf pour les tests. Build compressé: aucun nouvel asset inliné.
- 5B: hud.js drawEnd: 3 niveaux sur un curseur y unique (titre+ambiance+score / détails+records / boutons), plus de chevauchement ambiance/Score. Mêmes clés de texte: docs/studio-texts/look.json = {}.
- Lead: tester det smoke (fait), fitcheck, vérifier visuellement en ligne que Pixelify Sans se charge (Google Fonts).
