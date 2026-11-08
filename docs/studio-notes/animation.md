## Animation (visuel seulement, aucun texte nouveau)
- Impact: dans animUnit (unit-animation.js), sur `u.hurt`: flash blanc puis rouge, recul 0,05 tuile dans la matrice du groupe (pas u.x/u.y), léger squash; brutes/boss à 40 %. `rmotion()` coupe recul, squash et flash blanc.
- Construction: frame.js `bldAnim` (WeakMap, rien sur la structure): échafaudage qui monte avec `prog`, poussière à chaque cinquième, rebond de 0,5 s quand la fin est vue (la sim a déjà l'anneau). À tester: det (PASS en local), puis un coup d'oeil en jeu.
