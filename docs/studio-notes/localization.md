# Localisation: audit des textes manquants

Méthode: analyse AST de tous les littéraux de `packages/game/src` (hors i18n) + concaténations + `index.html`, comparés à `TRD` avec la même logique que `L()` (clé exacte, gabarits, découpe ' - ' ' | ' 3 espaces). Aucun test local lourd, pas de fitcheck.

## Code corrigé (`i18n/language.js`)
- Gabarit `{0} peasant{1}` trop gourmand: toute phrase contenant " peasant" (ex. "2x2 log cabin: its peasant plants saplings") devenait "... paysan(s)". Les `{n}` collés à peasant/villager/sapling n'acceptent plus que 3 caractères (suffixe de pluriel).
- Touche collée au texte ("Wooden wall [6]", "Castle rally [=]", "Academy [;]"): `L()` traduit le texte et garde " [x]".
- Noms en minuscules dans les phrases ("Your tower is under attack!" via `.toLowerCase()`): repli sur l'entrée capitalisée, mise en minuscule sauf allemand (italien, français, espagnol, portugais).

## Textes manquants (45 clés + "building", `docs/studio-texts/localization.json`)
- Bannière "Night falls - ..." (jamais traduite), bandeaux du titre ("100% blocky!", "100x the swarm!"), "2nd colour".
- 19 lignes d'infobulles de `ui/build-menu.js` dont le texte anglais a changé depuis la traduction (école, marché, cabane, atelier, chaumière, dépôt, recherches en %, roi, caserne, porte, rôles de paysans).
- "Stone/Wooden wall|gate|tower|barracks|path" (titres des infobulles de palier), "{0} builder(s)/repairer(s)/terraformer(s) wanted", "Co-op: slow connection ({0} ms)".
- Lobby co-op (HTML): titre, "Host a game", "Join with a code", code de salon, "Create room", "Players".
- "Waves survived: {0}": la traduction existante est fausse ("Vague {0} - {1}", `{1}` vide). `addtexts.py` saute les clés existantes: corriger à la main la ligne ~815 de translations.js.

## Non traité / à noter
- nl/pl/tr (`i18n/langs/`) n'auront pas ces nouvelles clés (anglais en repli).
- `aria-label` "Kingdom name" (settings.js) et l'écran de démarrage `#boot` (fr/es/de/it/pt seulement) hors `L()`: invisibles ou sans clé.
- Noms de royaumes (ai/kingdoms.js, ui/kingdom-theme.js): noms propres, laissés tels quels.

## À tester par le lead
Après `tools/addtexts.py`: `node tools/langcheck.mjs`, puis `fitcheck.py` en fond (nouveaux textes de boutons/infobulles plus longs en FR/DE), `det` n'est pas concerné (affichage seulement).
