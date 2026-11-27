# Naranxia journal

Newest first. One entry per batch or work session: what changed, what was verified, decisions, what is left.
Start of a session: read the top 2 entries and trust them (do not re-verify what is marked verified).
End of a batch: add an entry on top (3 to 10 lines), close the issues, keep CLAUDE.md in step if a rule or a tool changed.

## 2026-11-27 · rôles Château / Dragon et vue du Roi (#63, #64), branche `claude/castle-dragon-roles`, pas de version

- Demande du Roi: porter le gameplay du prototype Dragon Rider dans le jeu, en coop choisir Château ou Dragon avant de lancer; côté château, commencer en contrôlant le Roi, la vue de dessus pour bâtir.
- Vue du Roi (#64): chaque royaume commence avec son Roi et ses deux gardes (`roleHooks.startKing` dans `reset()`). `input/king-view.js`: caméra proche qui suit le Roi, les touches de caméra le font marcher (commande `kd`, un ordre de marche pour lui seul, sans son), `*` bascule (action `view`), une catégorie du menu Bâtir ou un outil de pose remet la vue de dessus. Cône de transparence `CUTU` dans le shader des blocs (`materials.js`): ce qui dépasse entre la caméra et le Roi n'est pas dessiné (les arbres font 6 à 8 cases, sans cela il est caché).
- Rôle Dragon (#63): bouton de rôle dans la fenêtre coop (`mpRole`, message `role`), au moins un château. Le chevaucheur est toujours le joueur 2 sans château (`st.dr`, `MP.swap` quand c'est l'hôte: `LPL()`), `sessionState.DRG` (sauvé, `SAVA.DRG`). Sa machine vole le dragon (`rendering/dragon-rider.js`: souris, Espace, clic gauche, jauges) et envoie sa place 10 fois par seconde (commande `dg`, nombres entiers); la simulation ne fait que brûler ce qui est sous le souffle (`gameplay/dragon.js`, `dragonTick`). Modèle du prototype porté tel quel (`rendering/models/dragon.js`), cavalier = le Capitaine du jeu.
- Nouveaux modules branchés par `gameplay/role-hooks.js` + `core/roles.js` (aucun nouvel arc de cycle).
- Tests: nouveaux `dragon` (souffle, portée, sauvegarde) et `mp_dragon` (les deux sens: invité puis hôte chevaucheur; 38 assertions). `det` re-fixé (Roi au départ), `features` graine 29, `mp_build` adapté (vue de dessus, un clic déplacé sous les barres du Roi). PASS en local: quality, det, features, ui, save, quests, kingxp, spearman, waves, tools, market, dragon, mp_dragon, mp8, mpk, mp_kxp, mp_resync, mp_build, mp_quests, mp_convoy, mp_events.
- Déjà en échec sur main avant ce lot (vérifié sur b9b2ffb, non corrigés ici): `smoke` (« ramp path »), `stance`, `research`, `mp_side`, `mp_rematch`.
- Pas porté du prototype: niveaux et arbre de talents du dragon, apparence personnalisable, sons du dragon, boule de feu et rugissement. Non vérifié: vol à la souris sur une vraie machine, fenêtre coop à l'écran (bouton de rôle), nuit et brouillard sur le dragon, `mp_soak` et `--full`. Le dragon ne peut pas être blessé.
- Décisions prises sans demander: le Roi et ses gardes sont gratuits au départ (la quête « Roi » est donc remplie d'office); un seul château quand un joueur chevauche; `game/` et la version ne bougent pas.

## 2026-11-23 · lot carte ronde, sans IA, chemins auto (#50 à #62), pas de version
- Rééchelonnage (#159, #160): rayons de corps ×1.6, densité de l'essaim (SWSD 5), or plus proche du château, bouton d'émissaire caché sans camp (`AIK_N` dans rules.js, pas de cycle). Tests: det (re-pinned), ui, save, waves, spearman, mp8, mpk, mp_build, quality verts. Non lancé: mp_soak, --full.

- Demandes du Roi (liste, une issue chacune): carte plus plate pour les gros bâtiments (#50), plus d'IA / autres châteaux (#51), carte ronde (#52), portails au bord de la carte (#53), unités à l'échelle Minecraft (#54), escaliers à hauteur d'un bloc (#55), ressources compactes et séparées (#56), chemins automatiques (#57), bannière du donjon retirée (#58), HUD avec gros stocks (#59), brouillard (#60), menu Bâtir par catégories (#61), même design que le menu principal (#62, fait ensuite: le HUD est dessiné avec la peau du menu `menuSkin`, plaques bleu nuit et bordures or).
- Carte: île ronde de 260 cases de rayon au centre de la carte (`world/island.js`), mer autour; cœur plat et sec (rayon 78) où l'on fonde le château (`ISL_SITE` 0,3). Routes: fin à 0,8 du rayon, portails au bout de la route (`WSPN` illimité): le bord de l'île est à 150-270 cases du château. Avec l'ancien rectangle 2250 x 1250 le bord était à 600-1000 cases: l'essaim avance lentement et n'arrivait pas en 900 s (test waves).
- IA: `AIK_N = 0`, plus aucun camp rival (code gardé pour les vieilles sauvegardes); la quête de l'envoyé se saute seule.
- Unités `UNITK` 1,75 (un bloc = une case, le modèle fait 1,03 case, Minecraft 1,8). Escaliers naturels: toujours 1 niveau par marche. Relief: monts, lacs, rivières réduits (`GPR`), `FT` 120. Ressources: bois en bosquets compacts, pierre en amas, moins de cailloux isolés.
- Chemins: l'outil est retiré du menu; `gameplay/auto-paths.js` pose, quand un bâtiment (tour et porte comprises, pas les murs) est fini, un chemin du château au bâtiment (Dijkstra, les chemins existants coûtent moins); `s.lnk` dit qu'il est relié; un bâtiment par tick.
- Brouillard: les contours noirs ne sont plus dessinés sur le terrain inexploré (`post-fog.js`), la mini-carte est opaque hors du vu. HUD: stocks >= 10000 en 12,3k / 1,2M quand la barre manque de place (la valeur exacte dans l'infobulle). Menu Bâtir: seulement les catégories.
- Tests adaptés (monde différent): det re-fixé, features seed 25, waves (ends2 800 s, lac, eau à 90 cases), quests (convoySame sans le hash), spearman (camps seulement s'il y en a), mp_build (<=). quality, ui, save, smoke, tools, mp8, mpk, mp_resync, mp_convoy, mp_quests, mp_events, mp_build, spearman, runner, desktop PASS en local.
- Reste: `mp_soak` et `--full` non lancés, rendu des escaliers non regardé de près, aucune version publiée (le Roi décide).

## 2026-11-23 · icône du lanceur

- Nouvelle icône : casque du roi seul, de face, droit, fond transparent (choix 1A du Roi). `apps/desktop/src/icon.png`, puis `tools/icons.py` (ico, icns). Pas de version du jeu.

## 2026-11-22 · v100

- Une seule mise à jour pour tout (demande du Roi): v98 (voile, Chevalier des Ténèbres, nom du roi), v99 (Festin d'hiver), fenêtre coop (#46), portées, tailles, classement (#48 #49). Les versions v98 et v99 ne sont jamais sorties (runs annulés); `announce/v98.md` et `v99.md` supprimés.
- Notes et traductions: 3 lignes neuves + 1 ligne (tailles) pour l'annonce; les autres reprennent celles de v98/v99.
- Détail de chaque lot: entrées ci-dessous.

## 2026-11-22 · tailles, portées, classement (#48, #49), pour v100

- Demande du Roi: unités / zone de construction / portée des bâtiments à réajuster; classement avec tous les joueurs même en coop; « château détruit = game over pour le joueur » (noté sur #47, pas codé).
- Portée des garnisons `GRNG`: mur et porte 1,6 -> 2,4, tour 2,3 -> 3,6, donjon 2,8 -> 4,2 (portée = archer x coef + 20; la tour fait 8 cases, l'ancienne portée dépassait à peine son pied). La fiche affiche maintenant la vraie portée en cases.
- Sites des bâtiments: écart de hauteur toléré 3 -> 6 (`SITE_DH`, construction.js), le terrain est nivelé de toute façon. Camps rebelles inchangés.
- Unités dessinées à 100 % (`UNITK` 0,76 -> 1), visuel seulement; rayons de collision inchangés.
- Classement: en coop chaque joueur a sa ligne (nom du partenaire `MP.pname`, même score), 6 lignes par carte au lieu de 3.
- Vérifié: quality, `det` re-fixé (même partie deux fois = mêmes empreintes), features, ui, save, waves, mp8, mpk PASS. Non vérifié: rendu (unités plus grandes à côté des bâtiments), ligne du partenaire à l'écran.
- Reste: game over par joueur (avec le lot 4 joueurs #47), jouer sur des cartes vraiment plus plates si 6 niveaux ne suffit pas.

## 2026-11-22 · co-op window like the menus (#46), for v100
- The King, with two captures of the co-op window: "adapter la fenetre de coop comme le menu pour les couleurs buttons", then "un button copier coller pour le code".
- `styles/coop.css`: the buttons of the window are the bevel buttons of the menus (`BV.dark` and `BV.go` of `ui/menu-kit.js`: pixel font, square, lit top line, dark lip that sinks when pressed), green for the action that goes on, slate for the others; pixel title in the orange gold of the menu titles, darker panel, green "ready" marks.
- Copy beside the room code (clipboard API, then `execCommand` when the page has no permission), Paste beside the code field of the guest (when the browser refuses to read the clipboard, a line says to press Ctrl+V).
- The captures showed half-translated lines ("Each player fonde their own castle"): two texts of the window had no translation and `L()` translated single words. Both now have one in the 8 languages; the first also said "the economy is shared", which is no longer true (each player has his resources): rewritten.
- Do not run prettier on `packages/game/index.html`: it reflows the template and the build fails.
- Verified: quality, langcheck, a capture of the window in French looked at once, PASS ui, smoke. Not tried: the clipboard buttons in a real browser (the capture does not click them).
- Not released yet: v98 and v99 are still in their release runs; this goes out as v100 after them.

## 2026-11-22 · v99
- The King answered "j'accepte tout" to the v98 report, which ended on the question of what the seasonal events should do (decor only, or rules: enemies, rewards, weather). Read as: the v98 decisions stand, and the events get all of it. Done for the Winter Feast, the next one on the calendar (1 Dec); the three others still only show on the title (#45 stays the record).
- An event travels with the game: `sessionState.sev` is taken in `reset()` (the date of the machine in solo, the host's `ev` of the start message in co-op through `sevPick`), saved as `SEV` (older saves: none), so a game keeps its event to the end and both machines agree. An automated browser has no event unless `window.__EVENT` names one: tests play the same game all year.
- Winter Feast: `seasonIdx()` stays on winter and `wxKind()` snows 72 % of the waves (visual, `rendering/weather.js`). Gift bearers (`giftSpawn` in `ai/wave-boss.js`, called by `wave()`): 1 + wave / 4 husks (6 at most), 1.5 times as tall, 5 times the life, sparkling (`giftAI`, puff only); the kill pays 60 + 6 per wave to the killer's player (`simulation.js`).
- Verified: quality, PASS features (34 assertions: winter held, 2 bearers at wave 6, the gold paid, the calendar), det (pins unchanged), save, mp8, mp_resync, smoke. Screenshot looked at once: winter ground and a sparkling bearer.
- Left: rules for the Spring Fair, Midsummer Fires and Night of the Horde; a marker more telling than sparkles on the bearers if the King wants one.

## 2026-11-22 · v98
- The King, four wishes in a row: "fait en sorte que le brouillard pendant la nuit se transforme en voile tenebreux qui empeche les unités d'y aller" (#42), "donne la possibilité de renommer son roi dans le profil" (#43), "creer le premier boss comme un chevalier des tenebres" (#44), "prepare seasonal event" (#45). Released as v98 (versions directes).
- Dark veil (`gameplay/light-state.js` `veilBars`, applied in `moveTo`): while the night is deep (`LITL` not empty) a player's unit standing in the light cannot step into unlit ground; it slides along the edge, and an order held for half a second ends there. Decisions taken without asking: the veil is the unlit ground (the fog of war is per screen and cannot rule a lockstep simulation); a unit may cross the dark when its order ends in the light (otherwise two lit places of one base are cut from each other); a unit caught outside walks freely and is still hurt; bannerman and captain are never held, a troop follows them. The horde is not concerned. Drawn in the fog shader (`rendering/fog.js`): violet-black wisps over the unlit ground and a bright rim where the light ends (`litP.w` is its clock). Message when a unit of the local player is held.
- King's name: `THEME.k` (14 letters and digits, "Naraige" by default), typed beside the kingdom name on the profile card (`kgI`, `nameTyping()` in `ui/settings.js`). `L()` writes it over "Naraige" in every text and every language (`languageState.king`), the credits excepted. Not sent to the co-op partner.
- First boss: `BOSSN[0]` is "The Knight of Darkness" (was the Hollow Warden; saved journals keep the index). Model `darkknight` in `rendering/models/mutants.js` (same rig as the boss: black plate, horned great helm with a slit of light, cape, great sword, kite shield). His power replaces the regrowth: every light within 7 tiles of him keeps 55 % of its radius, castle and keep excepted (`bossShade` in `ai/wave-boss.js`, read by `lightSources`), so the veil walks with him.
- Seasonal events, groundwork only: `core/seasonal-events.js` holds the calendar (Winter Feast 1 Dec to 6 Jan, Spring Fair, Midsummer Fires, Night of the Horde) and the title screen names the event of the day. Visual only by design: an event that changes rules must be chosen by the host and travel in the start message and the save. What each event does is the King's to choose.
- `det` re-pinned (the veil changes where soldiers stand at night); the two runs of one game still agree.
- Verified: quality; PASS features (30 assertions: veil holds a knight at 16 tiles, bannerman walks out, lit goal, boss dims lights, calendar), market, ui, save, det, mp8, mpk, mp_resync, mp_convoy, waves, smoke. Screenshots looked at once: the veil at night, the knight from behind, the profile card, the title with an event. Not looked at: the knight from the front.
- Left: the content of each seasonal event; the king's name of the partner in co-op.

## 2026-11-22 · launcher picture follows the releases (#41)
- The King: "can you make a thing that update can update the shortcut image ? for futur change".
- `apps/desktop/src/icons.js`: at each start the launcher looks for `icon.png` in the latest release (the answer it already asks for the game); when the asset changed it is downloaded to `<app-data>/icon`, checked (PNG, 4 MB at most, drawable) and used for the window (dock on Mac) and for the shortcuts: on Windows an `.ico` of 7 sizes is written under a new name and the desktop, start menu and pinned shortcuts whose target is the launcher are pointed at it (`shell.writeShortcutLink`, a new path because Windows keeps the picture of a path it knows); on Linux the `Icon=` line of the menu entry. Best effort, never holds the game back.
- One source: `apps/desktop/src/icon.png`. `tools/icons.py` makes `icon.ico` / `icon.icns` from it (`--check` in the installers workflow). `release.yml` and `installers.yml` attach `icon.png` to the release.
- To change the picture: replace the PNG, `python3 tools/icons.py`, push. No game version needed.
- Limits: launchers installed before this do not have the code, players install the new launcher once. The picture inside `Naranxia.exe` (taskbar of a running game on Windows) and the Mac app in Finder change only with a new installer.
- Verified: PASS desktop (92 assertions: Windows shortcuts, foreign shortcut left alone, no second download, bad download refused, Linux entry), runner; the sync run inside real Electron 33 (the `.ico` opens with its 7 sizes). Not tried: a real Windows desktop.

## 2026-11-22 · v97
- The King: "fait en sorte que chacun se connecte avec son profil en coop et assure toi que cela soit bien 2 joueur distinct dans la coop juste pas de teamkill principalement", then "ensuite diffuse la nouvelle maj": his go-ahead for v97, which ships every entry below down to "horde portals" (all marked unreleased until now).
- Profile in co-op: each player links with his own (name, colours, pattern: "hello", then "prof" on a change, entry below); the lobby lists each player under the colour of his kingdom.
- Two distinct players, audited in the code: resources per player (`RESP`), ownership `pl` on units and structures, selection / orders / training / demolition limited to one's own (`sel()`, `withSel`, `selB` and the demolish rule all test `pl === CURPL`), castles apart. No team kill: targets are picked by side and both players are side 0; every area effect (cannon, trebuchet, traps, oil, king skills) picks zombies only; a guard in `hit()` now refuses any strike on one's own side. `det` pins unchanged, so the guard never fired in the reference game.
- Notes and announcement written for everything since v96 (`game/NOTES.md`, `announce/v97.md`, 9 languages).
- Verified before the release: eslint, prettier, architecture, textaudit --notes, langcheck; PASS det, ui, save, features, mp_side, mpk, mp_resync, mp8. GitHub runs the full suite for the release.
- The first release run failed in `mp_resync_deep` (never run since the buildings grew: full runs only happen on releases): its case 5 never resynced because the game was already over. The test sets zombies on rings of 9 and 10 tiles round the middle of each castle, which is inside a castle now 20 tiles wide, so a castle fell before the fifth corruption. Rings moved to 17 and 18 tiles (the same distance beyond the walls); the test prints why when a resync does not come. PASS locally (19 assertions); the release workflow was started again by hand on the fixed commit.
- The second release run passed the full suite and failed in the world sweeps, which also had not run since the buildings grew. Three causes, none in what v97 adds:
  `waves_probe` killed zombies within 8 tiles of a castle that is now 20 wide (they stop 10 tiles from its centre): no wave could end, every world ran its 900 s and the sweep hit its deadline. Now 16, as `tests/waves.js`.
  Both sweeps drew castle pairs the lobby refuses (`sitesFar`: 44 tiles on one axis), so `mpStart` did nothing and the trial played the game of the world before (convoy trials 15 and 27 "returned" at second 0). The pairs now obey the rule.
  Convoy trial 18, a real fault: only the first porter's route was checked when a convoy left; the second stood behind a rock massif, walked to the foot of it and its share came back after two minutes. `sendConvoy0` now checks each porter and the ones with a route carry everything.
  The sweeps get a 45 minute deadline (`tools/test_all.mjs`): 24 waves that end take about 19 minutes on a GitHub runner, the old limit was 20.
- Verified: PASS convoy_probe (76 assertions), mp_convoy, det (hashes unchanged), runner; waves_probe: all 24 worlds end in 329 to 661 s with nothing left (23 in one run cut by my own time limit, world 23 alone).
- Third release run green (full suite, sweeps): GitHub release v97 published, launchers update, Discord posted; game artifact and CHANGELOG updated.
- Not tried: two real machines.

## 2026-11-22 · profile at the first launch: name and banner, the title army follows (unreleased)
- The King: "ajoute la creation d'un profil au lancement avec la personnalisation du nom et de la banniere qui adapt aussi la cinematic du menu".
- `ui/title-menu.js`: the kingdom card (banner as it will hang, name, colour, second colour, 16 patterns) is now `kingdomCard()`, shared by New kingdom and by the new screen `drawProfile` ("Create your kingdom" the first time, "Your kingdom" after; `settingsState.profOpen`). It opens by itself on the title when no kingdom was ever saved on the machine (`themeFresh()` in `ui/kingdom-theme.js`: no `dk_theme`), and from the new row "Your kingdom" of the title card. Closing it saves the theme. Not opened by itself under browser automation (`navigator.webdriver`, same rule as `core/boot.js`), so the tests start on the menu as before.
- The cinematic: the screen has a light veil, the title scene plays behind it; each change calls `retheme()`, which rebuilds the title army (cloth, shields, the bannermen's banners in the pattern of the kingdom). Nothing else in the scene carried colours.
- Texts: "Create your kingdom", "Found the kingdom", one line of explanation (9 languages).
- Verified: eslint, prettier, architecture (807), textaudit, langcheck; PASS ui, smoke, tools, features, save, det, compat, frame_guard, voxel_buildings, azerty_probe. Seen: the profile screen over the title scene with a crimson and gold saltire, the army behind in those colours.
- Co-op (the King: "make sure that the profil is saved even for the coop part"): the profile is saved on each machine at every change (`saveTheme`: name typed, colour or pattern picked, screen closed) and goes to the partner with "hello" when the two link; a change made while linked is sent at once ("prof" message, `setThemeSaved` / `themeSaved`), the partner redraws our things and the lobby shows the new name. Visual only. PASS after it: ui, smoke, det, save, mp_side, mp_resync, mp_build, mp8.
- Not seen: the automatic opening itself (the headless browser is automation, where it is switched off); narrow screens.

## 2026-11-22 · roofs in the kingdom colour, each co-op player in his own colours, the bannerman carries the kingdom banner (unreleased)
- The King: "Make sure that all roof color match the kingdom banner color", "Make sure also in coop that we notice more who is who", "make also the bannerman match the banner kingdom".
- Roofs: `palette()` of the kit gives every building and fortification the roof of the kingdom, tiles in stone and painted shingles in timber (`ROOF.kingdom`, `ROOF.kingdomShingle`, blocks `kingdom_*` coloured by `thd()` in `defOf`); the accent a type had (red barracks, blue castle, thatch) no longer picks the roof. The forge (the King's own plan) keeps its roof.
- Whose colours (`rendering/owner-theme.js`, `ui/kingdom-theme.js`): models take the kingdom colours from the theme being drawn (`drawTheme`, `withTheme`; `thp` / `ths` / `thd` follow it). `ownerTheme(o)`: the player's own, the co-op partner's, or the camp's (camp buildings now have roofs and banners in the camp colour). Geometries are stored per kingdom drawn (`GEO` is a proxy over one store per `themeSig()`, `clearGeo()`), unit models carry the theme in their key.
- Co-op: the "hello" message carries the colours and pattern of the kingdom next to its name (`MP.pth`; visual only, never in the simulation; an older build sends none and is shown in crimson). The partner's buildings (roofs, banners), men (cloth, shields, bannerman) and minimap dots wear his colours on both machines; if both chose the same colour he is shown in his second colour. The name of each kingdom floats over its castle in its colour. The redraw on arrival goes through `partnerRefresh()` in the frame (no import from the network code to the renderer).
- Bannerman: his cloth is the banner of the kingdom (pattern in the second colour, `patShare`), the fixed fleur-de-lis is gone; gold top and edges, folds and swallow tail kept.
- Verified: eslint, prettier, architecture (807 cycle edges). PASS on the final build: voxel_buildings, det (pins unchanged), save, ui, features, frame_guard, compat, smoke, tools, architecture, mp_build, mp8, mpk, mp_resync, mp_side, mp_rematch. Not run: the other co-op tests, mp_resync_deep, mp_soak, seeded sweeps (GitHub).
- Seen in the game: a town in stone (azure) and in timber (crimson) with every roof in the kingdom colour; bannermen with the cross pattern; a co-op game faked on one machine (half the buildings and men given to player 2 with crimson / ivory saltire): red roofs, banners, bannerman and shields beside the blue ones, the name over the castle.
- Not tried: two real machines (the exchange of colours itself is only covered by the co-op tests still passing). The name over a castle sits at its roof top, so it can touch the top bar when the camera is close.

## 2026-11-22 · banners made of patterns only, 16 patterns, standards on poles (unreleased)
- The King, on the pictures of the entry below: "What is this flying flag" (the flag of the barracks: three red blocks in an L on a pole) and "stop with icon in banner just pattern".
- No emblem any more, anywhere: a banner is its two colours and a pattern. `rendering/banner-art.js` lost the 14 x 14 emblems and has 16 patterns in `PATS` (the 8 the kingdoms had, same numbers, then cross, pale, lozenge, roundel, per bend, pile, checky, gradient: the last one is a share of the second colour, not yes / no), the shade to the hem, the light border and the metal fringe stay. `bannerArt({ c, c2, p })`; a face is 36 to 122 rectangles.
- Kingdom (`ui/kingdom-theme.js`): `THEME = { n, c, c2, p, v: 2 }`, 16 patterns, the default banner is the gold cross pattern on azure. A theme saved before (no `v`) that showed the cross emblem on a plain field becomes the cross pattern, the banner it always had; any other keeps its pattern.
- New kingdom card: the emblem row is gone, the pattern row shows the 16 banners the two colours make, each drawn as it will hang (`bannerTile`, pixel for pixel), also on the small card. The vector emblems, `bannerPattern`, `shieldTile`, `drawEmblemR` are deleted (they drew nothing else). The gonfalon of the HUD and the save list (sprites B, C, D of `banner-icon.js`) carries the pattern only, sampled from the same art (`patShare`). Names of the 8 new patterns in the 9 languages.
- The flying flag: `flagPole` of the kit no longer builds a flag of blocks. It marks the top of its pole and a standard hangs there from a crossbar, as a Minecraft banner stands on the ground: both faces painted, it turns a little with the wind (`userData.fl`). `banner` of the kit marks a wall banner the same way. Marks travel with the model (`VB.mark`, `model().marks`, `voxMarks(s)` in `models/structures.js`) and `rendering/structures.js` hangs the banner model on them: this replaces the exported lists of the entry below and `s.flag`.
- Who flies what: castle (standard on the keep roof, one over the gate, two down the keep), barracks (standard on its pole, one on each gate turret), war room (standard, two on its face): the banner of the kingdom, or of the camp on a building of a rebel camp (its colour with a dark saltire; camp fortifications still fly none). Guild: its own two (wine lozenge on gold, gold roundel on teal). Embassy: the banners of four realms on its poles and two on its face. The banner and flag blocks (`banner_*`, `bannerlow_*`, `flag_*`, the `flag` shape) are gone.
- Verified: eslint, prettier, architecture (807 cycle edges), textaudit, langcheck. PASS on the final build: voxel_buildings (the 16 patterns in 14 colours paint the whole cloth, rectangles cover each pixel once, the model builds for a wall and for a pole, each building carries the banners it should: castle 1 pole + 3, barracks and war room 1 + 2, guild 1 + 2, embassy 4 + 2), det (pins unchanged), save, ui, features, frame_guard, compat, smoke, tools, desktop, architecture, runner, mp_build, mp8, mpk, mp_resync. Not run: the other co-op tests, mp_resync_deep, mp_soak, seeded sweeps (GitHub).
- Seen in the game: barracks and war room (the standard where the red flag was), guild, embassy, castle, stone gate, the New kingdom card with three kingdoms, the HUD. Sheets of the 16 patterns in 16 colour pairs looked at outside the game.
- Left as it is: the bannerman's cloth (fixed fleur-de-lis, the King's gear board); no banners on wall pieces or on camp fortifications. Real GPU not tried.

## 2026-11-21 · banners of the kingdom the Minecraft way: crossbar, cloth of 20 x 40 pixels, painted in layers (unreleased)
- The King, with a picture of the banners on a gate and the recipe of a Minecraft banner: "can you make better banner like minecraft". The banners in the world were flat planes carrying the smooth 128 x 192 drawing (pennon, vector emblem), unlit (`MeshBasicMaterial`: pale by day, glowing at night), on stone fortifications only; the castle wore fixed blue block banners whatever the kingdom.
- Art (`rendering/banner-art.js`, pure data, no canvas): a cloth of 20 x 40 pixels, the size of a Minecraft banner, painted in layers: field in the colour of the kingdom, pattern in its second colour (the 8 patterns redrawn on the pixel grid), gradient towards the hem, border in the light colour, metal fringe with five tassels, emblem in gold or silver (the 16 emblems redrawn by hand on 14 x 14: three tones, details in ink, a dark rim so it reads on any field, gold on a gold pattern included). `bannerArt(theme)` gives the pixels, `bannerRects` the 100 to 230 rectangles of one colour they make.
- Model (`rendering/models/banner.js` `bannerGeo`): a crossbar with a gold knob on each end, a cloth one pixel thick, one quad to a rectangle (each laps a twentieth of a pixel over its neighbours: no hairline gaps where three meet). Drawn with the material of the buildings (`matV`, new block kind `BKB.plain`: painted pixels shown as they are), so daylight, night, the shadow of a tower crown and the ink outlines fall on it. `hang()` in `rendering/structures.js` replaces the planes (`bpl`, the banner texture and its material are gone; their two allocations stay in `initializeStructures`, as the comment there asks). The cloth swings out from its crossbar, each banner in its own time (`frame.js`, the list is `o3.userData.bn`; still when motion is reduced). Wall banners take shadows and throw none (no extra draw in the shadow pass).
- Where they hang: gate (both faces of each end) and tower / keep (each face of the shaft), now in timber as in stone; castle: the standard on the pole of the keep roof (painted on both faces, turns slowly), one over the gate, two down the face of the keep (`CASTLE_BANNERS`; the blue blocks are gone from the model); barracks (its two gate turrets) and war room (either side of the window over the door) fly the banner of the kingdom instead of red blocks. Camps and building ghosts: none, as before. The two unreachable branches for the old castle models went with `bpl`.
- Other banners: the two-block wall banner of the kit (guild, embassy) gets a crossbar, a band of gold and a hem with tassels (`bannert` / `bannerb` shapes, blocks `banner_*` over `bannerlow_*`); the flags on poles are now named `flag_*` (same look).
- Picture: `drawBanner()` paints the wall banner on the `BANNER` canvas. `BANNER2 = "CA"`: the HUD and the save list keep the gonfalon the King chose (board of 2026-11-11), the New kingdom card shows the banner itself as it will hang on the walls ('C' puts the gonfalon back there). Debug console: `retheme`.
- Cost, measured in a walled yard with 20 banners in view: 12 more draws out of 298, 3 200 more triangles out of 688 000.
- Verified: eslint, prettier, architecture (808 cycle edges). PASS on the final build: voxel_buildings (extended: every emblem on every pattern paints the whole cloth, its rectangles cover each painted pixel once, the model builds with a plain and a painted back), det (pins unchanged: the simulation is untouched), save, ui, features, frame_guard, compat, smoke, tools, desktop, mp_build, mp8, mpk, mp_resync. Not run: the other co-op tests, mp_resync_deep, mp_soak, seeded sweeps (GitHub).
- Seen in the game: stone and timber gate, tower, castle from the usual camera and from behind (the back of the standard is the mirrored picture, the pole in front of it), barracks, war room, guild, embassy, night, three kingdoms (Azure cross; Crimson and Night per pale with the eagle; Emerald with a gold chevron and the crown), the New kingdom card. Sheets of the 16 emblems and the 8 patterns looked at outside the game.
- Left as it is: the bannerman's cloth (its fixed fleur-de-lis is the King's gear board), the vector emblem tiles of the menu, the gonfalon sprite of the HUD (its emblem is the older 11 x 11 drawing), camps without banners, no banners on wall pieces. Real GPU not tried.

## 2026-11-21 · fortifications on the scale of the buildings: a grid of four tiles (unreleased)
- The King: "i think you need to rework tower / wall / gate readapt the size if needed then push the update". Walls, towers and gates had kept footprints of 1 and 2 x 2 tiles when the buildings went to one block per tile: a fence one block thick beside houses of 12, and four times more pieces to close a base.
- Rules (`rules.js`: `FCELL = 4`, `FSZ`, `fcell`, `gatePost`, `footW` / `footD`, `lampWall`, `edgeDist` for the rectangle of a gate): fortifications are laid on a grid of 4 tiles. Wall piece = one cell, tower of the menu = 2 x 2 cells (8 x 8), camp tower = one cell, gate = 3 cells long (12 x 4, the passage is the middle cell; camps: 2 cells with a passage 4 wide), keep 8 x 8. Costs, hit points and build times unchanged: a piece closes the same share of a base as before the buildings grew.
- Placement (`construction.js`: `fortAt`, `wallTiles`, `fortFit`, `fortPlan`, `stepOff`): the cursor picks the cell (a footprint two cells wide is centred on the nearest corner of the grid). A wall takes the free tiles of its cell (`mk(..., tiles)`): it closes against a building, rock, a ramp or the castle door, spans shore water, clears trees and deposits, and follows the ground without levelling (it stands on its highest land, its footing is drawn below). Towers and gates need their whole footprint, are levelled like buildings (three graded rings, `levelGround(..., grade)`), and replace finished walls of the player with a refund (gates too now; the message was hidden by the site message, fixed). Units standing where a piece is laid step off it.
- What follows the sizes: `solid()` (posts of a gate closed to all, passage open to the living), garrison slots, tower and engine reach counted from the walls of the tower (`towerReach`: + 3/8 of its side, so the reach beyond the walls is the old one), boiling oil, vision, wall lamps, door opening distance, outlines / bars / scaffolds (`o3.userData.mh` from `FORT_H`).
- Camps (`ai/kingdoms.js`): ring on the grid one cell clear of their building ground (`aiRing`, relaid for camps of older saves), towers and walls of one cell, gate of two (`aiFortOK`); builders work from the edge of a site (`edgeDist`: they had to come within 2.2 tiles of its middle, out of reach inside a footprint of 12 tiles or more). Checked by forcing a camp to raise its ring: 7 towers, 49 walls, 1 gate, all on the grid.
- Models (`builds/walls.js`): a wall piece is a rampart 4 thick with a wall walk between two parapets, merlons two wide, a dressed band and blind arches (stone) or a stockade bound by a rail (timber). It is drawn per piece from what stands around it: `wallLook` (per tile: which sides are open country), `wallLookOf` (models/structures.js), `refreshNear` redraws the neighbours; parapets open where another fortification joins. Tower: a foot 8 x 8 as high as the walls (its top a ledge level with their walk, the arches run on round it), shaft 6 x 6, fighting top 8 x 8, a tall turret with lit windows under a pointed roof (none under an engine; ballista and trebuchet are sized to the top, the ballista hangs from a pivot: it sat on a corner of the 2 x 2 tower). Gate: vaulted passage, chamber, deck, two towers (two posts for the two-cell gate); its doors are block models (`gateLeaf`, `portcullis`, new blocks `gate_leaf`, `gate_band`, `flagstone`). `FORT_TOP`: wall 5, gate 8, tower 11 (one cell: 8), keep 15.
- Old saves: fortifications from before the grid are dropped on load and their tiles freed (`svFix`); the rest of the save loads.
- Texts: the gate hint and tip say 12 tiles; "Walls replaced by the gate (refunded)" (9 languages).
- Tools and tests: the `fort` scene of `tools/voxel_preview.py` is a little fortress on the grid (prints triangles: wall 330 to 490, gate 1000 to 2100, tower 3000 to 3300, keep 3900); debug console: `freeSite` knows the grid, `fortPlan`, `garrison`, `garSlot`, `solidFor`, `FCELL`. Tests adapted: `voxel_buildings` (32 pieces, model sizes against the grid), `mp_build` (a fortification lands under the mouse, whole and on the grid), `features` (oil), `save`; `det` re-pinned.
- Verified: eslint, prettier, architecture (809 cycle edges), textaudit, langcheck. PASS on the final build: smoke, det (re-pinned, two runs equal), save, voxel_buildings, ui, features, quests, spearman, kingxp, compat, bossabil, envoy, ruins, events, traps, stance, frame_guard, map_size, portals, mp_side, bastion, research, market, waves, command_contract, azerty_probe, tools, gameplay_fast, architecture, runner, desktop, observer, trap_controls, mp_build (298 checks), mp8, mpk, mp_kxp, mp_events, mp_resync, mp_quests, mp_convoy, mp_lag, mp_rematch, mp_cut. `mp_lag` failed at first (fewer than four buildings a player): it still looked for sites of two-tile buildings; they are now found per footprint.
- Probes in the game: a knight walks through the passage, posts and passage are closed to the dead, six zombies bite the wall and none passes, a tower shoots at 14 tiles and not at 21, a gate laid on three finished walls replaces and refunds them (not on unfinished ones), a wall against a house takes its 7 free tiles, a wall on a shore spans the water, nothing in open water, a save with one-tile walls loads without them and runs. Seen in the game: stone and timber, garrisons on walls / tower / gate, scaffolds, bars, the ghosts of the three pieces, the build menu icons, night lamps and lit turret windows, ballista and trebuchet on a tower.
- Not run: mp_resync_deep, mp_soak, seeded sweeps (GitHub runs them on pull requests and releases).
- Open: walls are still laid one click a piece (no dragging); the keep can only come from four one-cell towers, which only camps build; a camp that finds no room for a building (the 24-tile barracks) tries the same one for ever (`aiStartBuild0`: two camps of three had only a farm and a house after 30 minutes; before this batch their builders could not reach any site of 12 tiles or more); timber pieces are dark beside the stone ones; balance with the larger footprints not retuned; real GPU and two machines not tried.

## 2026-11-21 · every building redesigned, textured blocks, terrain and decor on the same block (unreleased)
- The King: "refais tous les bâtiments en meilleure qualité et meilleurs designs, adapte aussi tout le terrain / l'environnement en conséquence". Correction to the entry below: terrain and decor blocks were still half a tile (`BLK = DBLK = 0.5`), so after it a building block was twice a terrain or tree block. Now `BLK = DBLK = 1`, fixed: one block size everywhere.
- Kit rewritten (`models/voxel-kit.js`): `hall()` (plinth, stone or framed ground floor, jettied framed floors, gabled roof), frames one block proud of their panels (`frameWalls`), roofs with a trim on the verges, thick barge boards, crest and finials (`gabled`, `VB.roof`), `dormer`, `porch`, `oriel`, `breast` / `chimney`, `spireTop`, `buttress`, towers, props (stall with sloped awnings, cart, tent, goods...). `VB.hipRoof`, `cone` with a profile, `dome` in `voxel-build.js`.
- All buildings redrawn in `builds/{homes,civic,military,walls}.js` (the forge stays the King's plan): 3 houses, farm (barn, fields, hen house), storehouse (loading gable, dock), granary (a windmill and a loft on staddle stones), forester, orchard, market (arcade hall, stalls, fountain), guild, academy, observatory, bell tower, sanctuary, embassy, barracks, war room, sappers, beacon, castle (`CASTLE_FLAG`). Timber tier: spruce frames and daub, thatch or shingles, one storey; stone tier: stone ground floor, plastered jettied floor, tiles outlined in slate.
- Blocks are textured, 16 pixels a block in world space, by the block shader: `BKB` kinds in `blocks.js` (planks, logs with rings, stone bricks, bricks, tiles, thatch, glass, doors, barrel, crate, fruit leaves...), `mat = 40 + kind` (`matOfKind`), names to kinds in `voxel-blocks.js` (`texOf`); lying logs swap kind when a building is turned a quarter (`turnedLogs`). Props of a few boxes in 2 or 3 colours in `voxel-model.js` (`SHAPES`: flowers, window boxes, shrubs, crop rows, anvil, bell, sconce, brazier, shield, wheel, rack, sails...).
- Colours set for the game's light: a lit top shows about 2.5 times its albedo, so roofs are dark albedos; side faces are no longer darkened twice (`SHADE`), shadows on block materials are less blue (`materials.js`, `BL` branch).
- Fortifications taller (`FORT_TOP`: wall 4, gate 5, tower 7, great tower 9, keep 12; `GTOP.keep`, gate leaves 4 high, banners moved). Visual only: `u.gz` is not in `mpHash`. Castle arrows leave from 11 blocks up. Night lamps follow (`rendering/lighting.js`: the sconces of the castle gate and keep door, the tops of the forts).
- Environment (`terrain-props-blocks.js`): `treeShape` (trees 4 to 8 blocks, heights vary), deposits as outcrops (boulders, ledges, gold nuggets), bushes / stumps / stones / ferns as pixel boxes (they were full cubes), thicker grass blades, 6 % of open tiles dressed.
- Tool: `tools/voxel_preview.py` (the game's material and daylight without booting the game, seconds per sheet; also `fort`, `trees`, `swatch`). The real look (ink, grade) was checked in the game: every type at both tiers, a town at the default camera.
- Tests of the full tier that the scale change of the entry below had broken and nobody had run: `bastion` (sites by `freeSite`), `mp_quests` (sites by `freeSite`, the zombies ringed round the soldiers), `mp_cut` and `convoy_cut_probe` (the cut river pair is trial 62 now; the list moves with the site rules).
- Verified: eslint, prettier, architecture (811); PASS voxel_buildings det ui save smoke features (final build), tools quests waves spearman research kingxp compat bossabil envoy ruins events bastion azerty_probe traps stance frame_guard map_size portals mp_side market mp8 mpk mp_build mp_resync mp_convoy mp_events mp_quests mp_cut. `det` pins unchanged (no gameplay change). Not run: `mp_resync_deep`, `mp_soak`, the seeded sweeps, textaudit (no tags here).
- Open: triangles per building went up (houses 4 to 8 k, guild / embassy / barracks 11 to 13 k, forge 14 k; no greedy meshing); construction scaffold and damage looks not reviewed; fort footprints unchanged (1 tile, 2 x 2); balance with the large footprints (a castle can fall to 10 zombies while the soldiers stand at a far barracks); old saves not gated; real GPU and two machines not tried.

## 2026-11-20 · one block of a building = one tile (unreleased)
- The King: building blocks must be the size of terrain blocks; asked which way, he chose "buildings x4, units as they are". `BPT = 1`: footprints are the model sizes (house 12, farm / storage / forester / observatory / granary / sappers 16, castle and the 20-block halls 20, barracks and forge 24). Units, speeds and ranges unchanged.
- Sites (`siteFit`, `clearSite` in construction.js): a footprint may cover trees, stone and gold (cleared when built; water, buildings, stairs, the castle door block), is levelled to its middle height when the ground varies by 3 levels at most, and `levelGround` grades three rings around it so every side can be walked to. Castle move uses the same rule (20x20).
- Castle: `CSZ` / `CHALF` in rules.js (20 / 10), door 4 tiles wide, plateau and starter deposits moved out, co-op castles at least 44 tiles apart (`sitesFar`), convoy reach from the walls, `freeTile` looks 16 tiles out (callers pass the castle centre).
- Combat and work use `edgeDist` (distance to the square footprint; a circle left the corners of a 20-tile building out of reach); structure search radius `SRMAX`; builders count from any edge.
- AI camps: ring 60, castle pad for 20x20, spots tried every 4 tiles, trees cleared and paths allowed under their big buildings.
- Fortifications redrawn natively, one block per tile (`builds/walls.js`, `FORT_TOP`): wall 3 high, tower 6 (1 tile) and 8 (2x2) with an overhanging top, gate 4 (lintel; leaves stretched), keep 10, torch. `gtopOf` reads `FORT_TOP`.
- View: default zoom 46, max 160; buildings see from their walls (`vsnOf`).
- Tests adapted (spots found with `freeSite` / `siteFit`, co-op sites 48 to 84 apart, waves world 9 -> 19 for the lake, det re-pinned, oil check now runs under a real horde). Verified: the 29 core tests (co-op mp8, mp_build, mp_convoy, mp_resync, mp_lag, mp_rematch, mp_kxp included) plus smoke, ui, waves, tools, det PASS; eslint, prettier, architecture, langcheck. `--full` (deep resync, soak) not run. `tools/textaudit.mjs` could not run here (the clone has no version tags). Seen in game: town overview and a close view with walls and a tower.
- Open: the tall thin towers and 3-high walls look small beside 16-high houses (their footprint is still 1 / 2x2 tiles: enlarging them is a gameplay change to decide); units are tiny beside doors (the King's choice); ballista / trebuchet / old door leaves keep their old models; balance (costs, build times, AI) not retuned for the bigger map use; real GPU / two machines not tried.

## 2026-11-19 · all buildings redesigned in blocks, fortifications too (unreleased)
- The King found the first block buildings rushed. All 18 types + castle redrawn (forge = his plan, untouched). New kit `rendering/models/voxel-kit.js` (palettes by tier, framed storeys, profiled roofs with dark trim, windows with shutters and flower boxes, doorways, round towers, cones, spires, trees, stalls); designs in `models/builds/{homes,civic,military}.js`. `voxel-parts.js` removed.
- Look: tier 0 = oak planks in dark oak frames on cobble, wooden or thatch roofs; tier 1 = stone ground floor, plaster upper floors, coloured tile roofs with black trim. Roof colour identifies the type in both tiers (market red, academy blue, sanctuary green, observatory copper, castle blue, barracks red). Houses: 3 looks (cottage, jettied town house, L-shaped).
- Fortifications in blocks (`builds/walls.js`, `fortOf` in voxel-buildings.js): walls by neighbour mask (corbelled deck, merlons on outward sides, diagonal fillers), tower 1 tile, great tower 2x2 (round in stone), gates 2 and 3 tiles (door leaves stay the animated meshes), keep, torch. Heights follow `gtopOf` (6 / 13 / 14 / 15 blocks), so no gameplay number changed. Ballista and trebuchet (machines) keep their old models.
- Mesher (`voxel-model.js`): ambient occlusion per vertex, faces looking into sealed rooms skipped, part-block faces covered by the neighbour skipped (about -35 % triangles: house 2.7k, castle 11k). New blocks: plaster, thatch, tile roofs, window, path / paving, flowers, fire...
- Ground level is y = 0 of every model (yard props used to float one block up).
- Verified: voxel_buildings (now also all 144 fortification pieces and every house look), det, save, ui, tools, features, spearman, mp_build, mp8, smoke PASS; eslint, prettier, architecture. Seen in game: a town of all types, walls + towers + torch (`/tmp/shot.py`-style harness: stub the renderer during boot, one real frame for the picture; real frames take ~6 s here).
- Not done: scaffold / damage looks were not reviewed against the new shapes; cursor still at the corner of big footprints; a real GPU / two machines not tried. Preview tool: `tools/voxel_preview_entry.js` (names `type:look@turn!tier`, or `fort`).

## 2026-11-19 · castle in blocks (unreleased)
- Castle (5x5 tiles, wood/stone) is now a block build: curtain wall, 4 corner towers, gatehouse with gate, keep with donjon, animated flag on the pole. `VOXB.castle`, `BSZ.castle=5`; old banners/corner flags skipped.
- Verified: voxel_buildings, save, det, mp8, mp_build, spearman, quests PASS. Still old style: keep, tower, wall, gate, ballista, trebuchet, torch.

## 2026-11-19 · every building drawn in blocks (phase 2), not released

- The King handed over the rework of all buildings ("rework all building in that kind of style"). 18 buildings (house, farm, storage, barracks, academy, market, forester, guild, observatory, granary, bell, sanctuary, beacon, orchard, embassy, warroom, sappers, forge) are now Minecraft-style block builds: stairs roofs, timber frames, windows, lanterns, banners, stalls, fields, trees. One tile = 4 blocks (`BPT`), a model fills its footprint (`BSZ` in `gameplay/rules.js`, 3 to 6 tiles a side instead of 2). The forge is the King's smithy plan (pixl-5 timber, pixl-5-gray stone). Houses come in 3 looks by tile.
- New: `rendering/voxel-build.js` (builder: boxes, walls, gable and hip roofs from stairs), `rendering/models/voxel-parts.js` (halls, towers, stalls, wells, trees, fences), `rendering/models/voxel-buildings.js` (the 18 designs), `rendering/voxel-blocks.js` (block table, shared with the importer), console helpers `freeSite`, `BSZ`, `VOXB`. Houses and farms no longer snap or merge.
- Rules that had the 2x2 size built in: builders and demolishers work from the site edge (`rad`), forester planting ring and spacing (per player now), guild waiting spot, AI base: ring radius 11 to 20, spots scaled to the footprint. Found on the way: `unm` (an "unreachable" message throttle) was set on a structure on one machine only and desynced co-op; now kept off the structure.
- Tests: new `voxel_buildings`; spot searches in mp8, mp_build, mp_cut, mp_quests, market, spearman, ui, mp_side, tools, det now use the building's footprint; `det` re-pinned (same on repeated runs); architecture baseline ratcheted (811 edges).
- Left: castle, keep, towers, walls, gates, ballista, trebuchet, torch still old style; build menu icons and construction scaffold look; damage and demolition crumble for block builds; centring the cursor on large footprints (the cursor tile is the corner for now).

## 2026-11-18 · Minecraft plans import (phase 2 start), not released

- King sent 3 .schem plans (pixl-5, -yellow, -gray: a medieval smithy, 23x24x21 blocks once the yard ring is cropped). New tools: `tools/schem.mjs` (Sponge .schem reader), `tools/blocks.mjs` (block name to colour and shape table; unknown blocks are listed), `tools/schem2voxels.mjs` (crop, strip ground and plants, JSON in `assets/builds/`), `tools/voxel_preview_entry.js` (preview scene). New `rendering/voxel-model.js`: merged geometry, hidden faces culled, stairs (all shapes), slabs, fences, walls, panes, trapdoors, doors, signs, chains, lanterns, log ends, light per-block variation.
- Verified by two screenshots (all three variants, close-up of the gray one): shapes and colours read correctly. Not wired into the game yet: footprint 23x21 tiles is far bigger than the current forge, so it needs the King's call on scale (which building it becomes, tile footprint, collision, build time).
- Left: wire a voxel building as a real structure (footprint, placement, construction), more plans from the King.

## 2026-11-18 · horde portals (phase 1 of the rework), not released

- Each lane gets a huge obsidian portal (9x12 blocks, animated violet plane) at its spawn point, opened by the first horde of that lane (message "A new portal tears open in the <dir>", violet burst). Portals are saved (`sessionState.portals`, SAVA), cleared on reset, at most one per lane, so up to 3 per castle appear over time as lanes unlock (wave 1, 3, 7). New: `rendering/portals.js`, `tests/portals.js`.
- Spawn point unchanged (far end of the route, `laneSpawnIdx`), so `det` hashes did not move. Verified: portals, det, save, waves, features, mp8, mpk, mp_resync, lint, architecture; screenshot checked once.
- Decided not to speed zombies up per lane: the spawn stays ~150 path tiles out (World size caps it). Left: schematic importer (.schem/.litematic/.nbt) once the King sends build files, then voxel terrain (see docs/REWORK_PLAN.md).

## 2026-11-18 · rework request: baseline and plan (no code change)

- King asked to rework map generation, building logic and horde spawning, with no stated defect. Measured the baseline (spawn_probe: 384 lanes none within 90 tiles; spawn_pace wave 3: solo beaten in 434 to 444 s, co-op 310 to 406 s) and wrote `docs/REWORK_PLAN.md` with the constraints (determinism, saves, co-op) and options M1..M3, B1..B3, H1..H3. Suggested first slice: M1 start quality, B1 placement feedback, H2 pincer waves.
- Left: the King's choice of options. Full suite 46/46 earlier today; v97 content ready, not released.

## 2026-11-18 · README screenshots (#40 part)

- `docs/img/title.jpg` (title screen) and `docs/img/kingdom.jpg` (a kingdom, cropped below the top bar because the test world shows a meaningless wave timer) taken with `tools/qa_shots.py` (English; its always-on `87_back_fr` step forces French, so a temporary copy set it to English). README shows them. #40 stays open for the store page and a trailer (needs the King's accounts).

## 2026-11-18 · #37 closed as already done, #36 scoped

- Checked #37 against the code: royal forge, embassy, war room, sappers' workshop, scout, engineer and envoy exist (`gameplay/rules.js`, build menu, models); eclipse, wolves and ruins exist. `docs/IDEAS.md` was stale and is corrected. Only the apothecary is missing and it would duplicate the sanctuary, so #37 is closed.
- #36 (spectator) not started: needs a third peer with command relay by the host, a mid-game snapshot join (resync format) and a spectator role in lockstep, none of which can be tested here (one real connection only). Left open with the design notes in the issue.
- fitcheck 0 overflow with the World size row.

## 2026-11-18 · world size (#34, not released)

- Setting "World size (next game)" in Options, Game tab: Large (default, the whole world, exactly as before), Medium (lanes start at most 380 tiles from the castle), Small (170). Only `world/routes.js` reads it (`MAPD`, `sessionState.mapSize`); it does not change the world, the tile arrays or the save layout. Kept in localStorage `dk_msize`, saved with the game (`mapSize` in SAVA, old saves mean Large), sent by the co-op host in the `w` and `s` messages (`ms`).
- Tests: new `map_size` (lane reach for the three sizes), `mp_rematch` extended (the guest follows the host's small world, same routes on both). `det save mp_rematch mp_lag ui runner architecture` pass, so the default game is unchanged. fitcheck not rerun for the new row.
- Not done: a size choice on the new-kingdom screen and in the co-op lobby (the host sets it in Options first), and no change of the real map extent (it stays 2250x1250 tiles). #34 stays open until the King has played it.

## 2026-11-18 · co-op rematch (#35, not released)

- King: "ok je suis pret" (go on with the tickets). Co-op game over: the button says "Rematch" and brings both players back to the lobby with the connection kept (`mpRematch` in `multiplayer/lobby.js`, reached through `playAgain` in `gameplay/lifecycle.js`, registered in `main.js` so no new import cycle). The host's `rollWorld` syncs the new map, both choose a castle, host presses Play. Before, "Play again" opened the solo setup while the co-op link stayed on.
- New test `mp_rematch` (full tier, mutation checked: fails without the feature): game over on both, rematch, same seed, castles chosen again, second game in step with no resync. Passing: `det ui runner architecture mp_rematch mp_lag tools`, eslint, architecture ratchet unchanged (815).
- #35 stays open until the King has seen it in play (not covered: real two-screen flow, a guest who leaves during the game over screen).

## 2026-11-18 · finish lot 2 (not released)

- King: "tout sauf la difficulté" (one fixed difficulty stays). Done: About screen on the title card (`ui/title-menu.js`, name, version, credits, saves stay local, rights), Fullscreen row in Display settings (`ui/settings.js`), LICENSE (all rights reserved, third-party notices), PRIVACY.md (peer to peer, public lobby hub, third-party loads), README links. Texts in 9 languages; fitcheck 0 overflow; `ui tools frame_guard det runner architecture` pass.
- Not done, tracked as issues: #34 map size/type, #35 co-op rematch, #36 spectator, #37 content lot 3, #38 installer signing (needs certificates), #39 cloud saves, #40 store page + screenshots.
- Kept: `docs/studio-boards` (98 MB) stays tracked: tests read its font (`tools/fontroute.py`) and eslint lints it. Moving it needs those paths changed first.
- LICENSE is the conservative default (all rights reserved); the King may replace it with an open licence.

## 2026-11-18 · professional finish audit (not released)

- King: "fait un audit de mon jeu et travail sur tout pour rendre le jeu plus pro". Audit in `docs/PRO_AUDIT.md`.
- Fixed: the frame loop died on the first exception (`core/frame-loop.js`, now survives, logs, tells the player once; test `frame_guard`, in the core tier). README intro for players, `CHANGELOG.md` + `tools/changelog.py`.
- Verified: eslint, prettier on changed files, architecture check, `det ui tools runner frame_guard`.
- Left for the King: LICENSE choice, 99 MB of design boards in `docs/`, an in-game About screen. No version change.

## 2026-11-18 · v96

- Released on the King's "oui go": swarm perf (#21, occupancy byte table, hashes unchanged) and Esc dropping a selected building before the main menu. Notes, announce/v96.md, translations (FR ES DE IT PT NL PL TR) added; textaudit and langcheck clean.
- Left: the release workflow's automatic banner step has its first real run now (check the Discord post); no open issue.
- v96 banner was missing: the release job ran on ubuntu-latest (now Ubuntu 26.04, no Playwright chromium) and the step is continue-on-error. Fixed: release job pinned to ubuntu-24.04 like tests; banner generated locally and v96 reposted through announce/QUEUE. First automatic banner expected at v97 (check the "Update banner" step log).

## 2026-11-18 · perf of the swarm (#21), no behaviour change

- King: "continue toutes les améliorations" (asked: swarm perf, balance, HUD, robustness). `solid()` was the hot spot of `swFmask` / `swOpen` / `blk` (a Map lookup per tile). `world/terrain-state.js`: `occ` is now an `OccMap` that mirrors its keys into the `OCCB` byte table, `solid()` skips the lookup on free tiles. Same answers, so same hashes.
- Verified: `tools/profile.py` 6000 ticks 45.6 s to 27.6 s (instrumented), solid 8.1 s to 1.2 s; `det`, `save`, `waves`, `mp8`, `mpk`, `mp_resync` pass with the pinned hashes. #21 closed.
- Not released, no version change.

## 2026-11-17 · menu logic (Esc), tickets closed

- #26, #3, #4 closed on the King's request (not reproduced, covered by mp_build / mp_side / mp_lag; full suite 43/43). #21 kept open: swarm already tuned in v93, more gain needs a behaviour change (profile today: swStep 20 %, solid 18 %, swPick 16 %).
- Menus (King: "meilleure logique pour les menus"; asked: navigation, HUD, settings, help; fix directly): in game, Esc now drops a selected building or the castle before it opens the main menu (order: quest log, map, mode / units, building, build category, menu). `input/desktop.js`.
- `tests/ui.js`: `escDropsBuilding`, `escThenMenu` (ui 70/70). Not released, no version change.
- Settings audit (rows, tabs, rebinding, Reset keys) read and the F1 / Esc / menu chain played live: no other logic fault found. Left: any screen the King finds illogical, to be named.

## 2026-11-17 · co-op tested by hand (#26, #3, #4)

- New `tests/mp_lag.py` (in the full tier): two headless clients on a bad network, with a random delay per direction (up to 9 rounds of 5 frames), a slow machine, and both players building, training and moving all the time (about 170 builds over 4 profiles, about 2300 ticks). Result: no desync, no resync, the same structures on both machines, every structure on its owner's side with the right owner and a mesh. 125 s.
- With `mp_build` (real clicks, other window sizes, resync, guest alone) and `mp_side` (save/load side) this covers #26, #3 and #4 from every angle reachable headless. No reproduction: the three stay open, but no F8 report is needed any more; the likely cause of #26 (side lost after loading a co-op save) was fixed in v95.
- Not covered: a real PeerJS connection (the shell has no network to it) and two real screens.

## 2026-11-17 · v95 follow-up (#33)

- #33 was a probe artifact: the "idle" zombies were the tail of a queue in a one-tile corridor (6 to 18 per tile, 15 tiles from the castle). World 0 with 120 s more: left 0, stuck 0. `tests/waves_probe.js` now gives 120 s of grace after the wave is beaten and tolerates 0 stuck again (all 24 worlds PASS, 1033 s).
- Also checked: a v94 save taken in wave 1 (1170 zombies) loads in v95 and runs 1500 ticks without error; the formation ghost shows green discs, snapped to free ground (red only in edge cases, never seen on screen).
- Discord: announce/vNN.md blocks (Add / Change / Fix) and the update banner come from the release workflow; the banner step is untested until the v96 release.

## 2026-11-16 · v95

- Release of the polish batches below (hordes spread, body block, defensive stance, QoL, co-op lot, routes, formation ghost), merged from the three worktree lots plus the earlier cherry-picks on `release-v84`.
- Merge fixes: `det` re-pinned after two identical runs on the merged code; `tests/waves.js` now calls `randomSite(false)` (the legacy rule keeps the worlds it was written for) and presses `mpStart()` twice (lot B's lobby confirm); `convoy_probe` too.
- Verified here: waves (same numbers as lot A: w2 688 s, limit 700), det, save, mpk, ui, stance, traps. Left to CI: the full quick suite.
- Watch: wave 3 of world 2 ends at 688 s (limit 700). If unwanted, `RMAX` back to 24 in `world/routes.js`. Pile 37-40 tiles out along a cliff still holds 100-139 per tile.
- Not verified: two real machines, real AZERTY keys, red formation markers on screen, 10 Hz swarm feel.

## 2026-11-16 · polish lot B co-op

- Lobby over a running game (`multiplayer/lobby.js`): `runningGame()` = `inGame && !over && !MP.on`. Host: the lobby says so, the first Play only asks ("Press Play again to replace your running game with a new co-op game", button "Play again to confirm"), the second starts. Guest: warning line only (the host's `s` command starts the game on both; the guest cannot veto, he can leave). 4 new texts, 8 languages (`langcheck`, `textaudit` OK).
- Spikes in co-op: new `SPO` map tile -> player (`multiplayer/objectives.js`, in `SAVA`, cleared by `reset`, deleted when a trap breaks or is removed). Rule: only the owner or the host (player 0) demolishes a trap (else "This trap belongs to your partner"); refund 100 % goes to the owner (a host removing a guest trap does not collect it). Missing owner (old save, tests) = anyone. Only active when `MP.on`; solo unchanged.
- `mpHash` now folds in the traps (count, and a sum over tile / hp / owner, order independent): cheap (a few traps). det hashes re-pinned (only the first number of each line changed, same counts; `a` = `b` in the run); mp8 mpk mp_resync mp_side save see the line below.
- Random start (`ui/site-picker.js` `randomSite`): preview cells (water, mountain = wall, 4 neighbours) labelled once per world, the biggest piece of land kept; the random pick re-rolls until the castle is on it (falls back to the old rule if none). Manual picks are free. Probe `tests/site_reach_probe.js` (not in the suite), 40 seeded worlds: old pick put 19.1 % of random sites (34 worlds of 40) off the biggest land, new 0; co-op pairs 60 to 220 tiles apart (convoy range), real start + `convoyLinked()`: old 6 of 80 not linked, new 2 of 80.
- Decisions to know: the "biggest land" rule is stricter than reality (19 % of sites excluded, many were fine: fords, 1-cell passes); a river that splits the map in two halves leaves one half to the random pick. The two guests of a co-op can still choose different pieces by hand.
- Tests (run one at a time): traps (6 ownership checks added), det (re-pinned), mp8, mpk, mp_resync, mp_side, save, mp_events PASS; mp_build failed once ("guest King not at the guest castle", King not trained within the wait, machine under load) and PASSED when rerun alone. eslint, prettier on touched files, architecture check clean (SPK and SPO moved to the leaf `gameplay/trap-state.js` to avoid a new import cycle).
- Not verified: two real machines, guest-side confirm UX by eye, the 2 pairs still not linked (not studied), mp_build flake cause.

## 2026-11-16 · polish lot C formations

- Formation slot ghost: small translucent discs on the ground, green on free ground, red where the slot is solid or off the map. Shown while a formation is on (key `form`) at the cursor (3+ selected fighters, no click held, nothing in build mode) and along the right-button drag (replaces the old yellow 2D ellipses; the arrow stays). `formPreview()` in `core/frame-loop.js` computes the slots with `formSlots` (same maths as `order`, King leads 2.2 tiles ahead) into `inputState.fslots`; `formGhostUpdate` in `rendering/frame.js` draws them like `spkGhost`. Visual only: no sim state, no RNG, hashes untouched (no gameplay file changed).
- Stance panel already shows the active stance (`stanceOn` lights the button). Hint of Defensive said "Fight around their post, then walk back to it": now "Strike what is in reach, never chase" + "Walk back to the post if pushed away" (2 new keys FR ES DE IT PT NL PL TR, old key removed). NOTES.md untouched.
- Verified: eslint, prettier, architecture (no new cycle: state lives in `inputState`), langcheck, textaudit. See report for what was not run.

## 2026-11-16 · polish lot A lanes

- Routes (`world/routes.js` `bendOffsets`): reach `RMAX` 24 -> 56 steps (48 -> 112 tiles); side samples now at 4 and 8 tiles (weights 0.4 / 0.15x4) and read from one row of ground calls per way point (3 calls -> 1 per lattice point, so the DP is cheaper than before: confirmPick of 16 worlds 105 s -> 21 s on the loaded machine). `tests/route_probe.js`, 16 worlds, 8475 points: hill 924 (10.9 %) -> 726 (8.6 %), mountain 821 (9.7 %) -> 575 (6.8 %), water 456 -> 373. Old saves keep their saved routes.
- Swarm (`gameplay/swarm.js` `swPick`): on a tile with 12+ zombies the crowd may also step to a neighbour of the same field value (along the contour) when it is emptier by more than 8 (`SWSD`, `SWSP2`). Pile probe wave 8, world 5 (30000 zombies), top tile on the lane stretches 40 to 60 tiles out: 136 / 101 / 130 -> 64 / 54 / 94 per tile; wave end 600 -> 623 s.
- Tried and dropped: a gate of seeds across the route at the end of each lane field (no effect on the peaks); softer contour settings (24/16, 16/10: peaks unchanged or `noneStuck2` failed).
- Found: wave 3 of world 2 went 560 -> 685 s with ANY wider reach (RMAX 32, 40, 56 alike), a lane then takes a different way with a narrow pass (wmax 3 -> 33 to 45); it is the route, not the swarm. Now 688 s (limit 700). w1 faster (503 -> 453), w9 slower (298 -> 346).
- Not fixed: the pile 37 to 40 tiles from the castle (state 4, tile 879,258 world 5) stays at 100 to 139 per tile, a real corridor along a cliff edge.
- Tests: det (re-pinned after two identical runs), waves PASS. mpk, save, mp_resync, features were running when the commit was asked; not verified here. No text added, no version change.

## 2026-11-16 · polish: QoL

- Tab (jump to last attack) only worked while the 5 s alert marker lived. `LASTALERT` (economy.js) keeps where the last marker faded for 60 s, reset in `reset()`; visual only, not saved, not in the hash. ui, smoke, det PASS. No new text.
- Already there (not redone): double-click selects the same type on screen, control groups, `,` idle peasant, pan mode, Tab cycling.

## 2026-11-16 · polish: defensive stance fights in place

- Defensive (`def`) units ran out after zombies (chase within 5.5 tiles, and in a formation slot they left it). Now they strike what is in reach and stay: no chase, walk back to the post when pushed off, still obey move orders. `det` hashes unchanged. New test `stance` (agg chases, def and hold stay put): PASS, in the quick suite.

## 2026-11-16 · polish: spawn patch and body block

- Waves came out in an 11x11 tile patch (up to 250 zombies per tile on wave 8), then gave up their lane. `swSpawn` now uses radius `q.r` = min(14, 5 + cnt/2500) (5 for old saves). Wave 8 world 5: peak pile 224 -> 119 per tile, climbers at 80 s 1325 -> 738. What is left are lane bottlenecks 40 to 60 tiles from the castle.
- Units (not swarm zombies): units exactly stacked were never separated (`dd > 0`); now pushed along a fixed direction from `(a.gi + b.gi) & 7`. Push shared by weight (r squared), a unit that is not walking (`mv` false) weighs triple (body block). Peasant softness 0.08/0.3 -> 0.2/0.45.
- det re-pinned (twice, each run a == b). Tests PASS: det features traps mp8 mpk mp_resync save waves. Not rerun after these: mp_events mp_build ui mp_quests (CI).

## 2026-11-16 · polish cleanup (merge of the 4 polish lots)

- Merged perf, co-op, routes and QA lots into the branch (cherry-picks, journal conflicts only). Removed 4 dead text keys with old key hints (`Torch [']`, `Barracks rally [-]`, `Forester's hut [[]`, `Builders' guild []]`) in translations.js and nl/pl/tr: no source used them; langcheck and textaudit clean.
- Open for the King: v94 notes line "On AZERTY the camera is now on Z Q S D." wraps leaving "D." alone (write ZQSD at release); #26/#3/#4 stay open until a guest F8 report.

## 2026-11-16 · polish lot perf (hd-perf worktree, committed on branch, not merged, not released)

- Task #21 (swarm ~57 % of sim time). Baseline `tools/profile.py` (v94 build): swStep 15.9 s self, swUpdate 3.9 s, swPick 3.2 s, GC 2.8 s, (program) 72 % (software GL). No unsafe or behaviour-changing change attempted: the swarm is already table-driven (v93), so only allocation cuts that give the same numbers.
- Changes (hashes identical, `det` PASS on the pinned contract): `swStep` no longer creates two closures per tile crossing (`pb` and `B` now the module function `blkOcc`), no array-destructuring iterators in the hot per-zombie loop (`D9N`) and in the per-structure tile flagging; `swRender` reuses 4 Float64Array for the frustum planes instead of 4 arrays per frame.
- Measure: NOT conclusive. The machine had load 24 (other agents), so the two profiles (before 54.7 s sim, after 67.9 s; swStep 15.9 -> 20.8 s) differ by noise, not by the change. Re-run `tools/profile.py` on a quiet machine before quoting a gain.
- Tests: `det waves mpk features mp_resync save` all PASS (det 651 s, waves 831, mpk 721, features 581, mp_resync 616, save 615), eslint, prettier, `check:architecture` OK.
- Ideas not done (need hash-safe proof): `swRear` object per call (every 5 steps), `cl` closure in the blocked branch, per-step `UM` Map and `flg`/`sfl` arrays (reuse across steps), `swCompact` copies 20 arrays per move (swap-remove would change order, so hashes).

## 2026-11-16 · polish lot co-op (hd-coop worktree, committed on branch, not merged, not released)

- #26 / #3 / #4: a probable cause found by reading, reproduced by `tests/mp_side.js` (new, in `test_all` and the quick suite; fails on the old code, passes now). A guest whose partner left goes on alone as player 2 (`MP.side = 1`), and solo saving and the 3-minute autosave are then allowed; but `svApply` reset `MP.side` to 0 and `setPl(0)`: loading that save (or the autosave) made the guest play the HOST's kingdom (castle, resources, home key), so his buildings were placed on player 1's site and his own were foreign. Fix: `MPSIDE` in `SAVA` (old saves have none = 0, as before) and `svApply` ends with `setPl(LPL())`. Co-op itself is unchanged (no command, nothing in `mpHash`).
- `moveCastle` of the second castle did not move `SITE2` (host moved `CX/CY`, guest did not): AI camps, hordes and ungenerated chunks used the old site. Now `SITE2.tx/ty` follow `CS2` (runs inside the `b` command on both machines; `SITE2` is in `SAVA`).
- Lobby dead ends: (1) a guest whose partner left had no way out of the lobby panel (no host / join buttons, page reload needed): `lobbyHome()` shows the first panel again, the peer is destroyed, code cleared; (2) a connection that closes before it opens left "Joining room..." for ever: now "Could not connect to your partner. Check the code and try again."; (3) a second Join press leaked the first peer: destroyed; (4) banner after 30 s without answer says the connection is lost and that the menu can be used to leave (it only said it would go on when back). 2 texts, 6 languages + nl/pl/tr (`langcheck` clean).
- Looked at, nothing proved: guest joining a host who is playing solo after a partner left (lobby modal pops over the game; Play restarts the world, as a new co-op game does); resync of a game with a moved castle (heights and `CX` / `SITE2` are saved); build commands in a resync window (re-queued in `mpResApply`, v94).
- Tests (machine at load 15 to 22, so real-time waits fail): PASS `det`, `mp_side` (fails on the old code with 7 notes), `mp8`, `mpk`, `mp_resync`, `mp_quests` (first run FAIL on "place TIMEOUT" waits, PASS on rerun); eslint, prettier on sources, `check:architecture`, `langcheck` clean. FAIL by load only, not rerun to green: `mp_events` (car timeout read on A and B at different ticks, twice), `mp_build` (guest King not trained within its 60 s real-time wait; the castle move and the click before a resync parts of the same run passed). Not verified: two real machines, touch input, zoom / resize mid-placement (covered by the v94 `mp_build`).

## 2026-11-16 · polish lot routes (hd-gameplay worktree, committed on branch, not merged, not released, no version change)

- Finding (#30 follow-up): `world/routes.js` `mkRoutes` laid the lane way points on a noisy straight line from each castle to the map edge without looking at the land; the terrain then cut a flat canyon (radius 3, rising 1 per 4.5 tiles) through whatever mountain or wood lay in the way, so lanes and the red trail ran through massifs, woods and rivers. Raw land read by probe `tests/route_probe.js` (16 seeded worlds, `rawGround` = baseHW before the cut, every 3rd route point 50+ tiles from the castle): 25 % of the points on a hill (3+ above the plains), 22 % beside or on a mountain (5+), 12.6 % on water.
- Fix 1 (`world/routes.js`, `world/terrain.js` `routeGround`): `mkRoutes(ground)` bends the route by dynamic programming over the lateral offset of each way point (2 tile steps, at most 48 tiles off the old curve, 0 within 60 tiles of the castle end and of the map edge, at most 4 tiles change per way point), cost = water 8, height above the plains 0.9 per level, woods 3 (pure noise of seed and GPR: no RNG, no chunk generated, same API, `Math.random` draws unchanged), 0.12 per tile of offset; then smoothed twice and interpolated over `pts` (`wps` = every 3rd point as before). Old saves keep their saved routes (ROUTES and RCH are in SAVA).
- Result (same probe, before -> after): hill 25 % -> 10.9 %, mtn 22 % -> 9.7 %, water 12.6 % -> 5.4 %; total route length 61704 -> 61976 tiles (+0.4 %); planning cost about 50 ms per world. The rest is massifs wider than the 48 tile reach and rivers that must be crossed.
- Fix 2 (`ai/workplaces.js` `saplTick`, `world/terrain-invalidation.js` `landChanged` / `onLandChange`, `ai/zombie-lanes.js` `laneTouch`): a sapling that grows into a tree (solid) does not bump `ver`, so lane fields kept routing through the new tree. Now the fields whose window (way points of the stretch + 16 tiles, stored as `bb`) holds the tile are marked stale (`v = -1`) and rebuilt at their next use inside the usual `lfBud` budget. Cache only, nothing to save; the listener keeps the dependency out of a new import cycle.
- Tests: `waves` PASS (new check `saplLane`; wave 3 ends w0 329 s, w1 503, w2 554 (6225 zombies), w9 298; spawn min straight distance 128..132, picked lanes 130+, no stuck, none in water; was 440/642/570 in the v94 entry), `det` hashes moved (routes differ; two identical runs, re-pinned in `tests/det.js`). Console: `rawGround` added for the probe.
- Also PASS (sequential, loaded machine): `mpk` 482 s, `features` 210 s, `mp_resync` 363 s, `save` 146 s; eslint, prettier, `check:architecture` clean (no new cycle edge).
- Not verified: by eye (red trail on a bent route, screenshot); `mp8`, `mp_convoy`, `smoke`, `ui` (CI); real two-machine co-op; trees felled by lumberjacks do not mark lane fields (they free ground, the old behaviour holds); the red trail still climbs over the ground where a route must cross a hill.

## 2026-11-16 · polish lot QA/UI (hd-qa worktree, committed on branch, not merged, not released)

- Nothing under `game/` or `announce/`, no version change, no push. Build v94 base.
- `tools/fitcheck.py` 1280x720 and 1024x600, 9 languages: 0 overflow (canvas and html). `textaudit`, `langcheck` clean (nl/pl/tr 0 missing). qa_shots (title, Update, settings 4 tabs, guide, HUD, Esc menu): no overlap or clipping; Controls list shows F4 spearman; K defaults KDEF match HK (F3 guild, F6 torch, F7 rally, F9 forester, F4 spearman, KeyW/A/S/D, KeyQ army).
- Bug fixed (`ui/site-picker.js`): the site picker help line built "drag / WASD" + camKeys() before translating, so on AZERTY ("ZQSD") the key no longer matched and the whole line fell back to English; and FR showed ZQSD on QWERTY. Now translated first, then WASD/ZQSD replaced by the real camera keys.
- Seen, not changed: v94 notes line "On AZERTY the camera is now on Z Q S D." wraps with "D." alone on the next line (writing "ZQSD" would fix it; NOTES is frozen). Dead translation keys with old key hints ("Torch [']", "Barracks rally [-]", "Forester's hut [[]", "Builders' guild []]") stay in the tables, unused by code. Tooltip badges show digits only by design (`hkShow`), so F3/F6/F7/F9 appear only in Settings > Controls and notes.
- Tests: `ui`, `det` PASS; eslint, prettier, check:architecture OK.

## 2026-11-16 · upstream synchronization

- Integrated main `61cfe09` with the test overhaul; resolved overlapping trap, wave, multiplayer placement, runner and journal changes.
- Kept upstream's real spike preview and full demolition refund, far spawning, 10 Hz swarm, lane-field corrections and command resend/pruning fixes.
- Preserved the expanded placement scenarios (different DPR/windows, camera rotation, dragging, pause, castle movement, resync and placement logs) on the shared deterministic driver. Paused placement targets the canvas, and paused peers keep rendering/input frames without advancing simulation ticks.
- Kept upstream's v94 reference fingerprints and new wave/spike regressions alongside stricter damage, wear, living-water-escape and visibility assertions. Classified the eight new manual diagnostics explicitly; core retains placement coverage.

## 2026-11-16 · test reliability overhaul (unreleased, v94)

- Audited every test, runner/build/CI path and active branch differences; evidence, per-file dispositions, timings and limits are in `docs/TEST_AUDIT.md`.
- Added strict assertion-bearing results, deterministic frame driving, fresh contexts/browser reuse, five execution tiers, focused fault controls and incremental interruption reports. Removed co-op rule-duration substitutions; isolated scenario RNG from ambient audio/startup draws.
- Fixed spike duplicate previews and demolition through shared placement rules, trap invalidation and a visible cursor; no refund or save-schema change. The new regression failed before the fix, then passed with trusted input and mesh checks.
- Verified full 40/40, all 11 co-op scenarios after RNG isolation, 36 convoy journeys, 120 route pairs, 24 dense wave worlds and 3/3 identical-seed recovery runs. Fifteen relevant source mutants were rejected; a genuine stuck-startup-overlay fault protects actual canvas visibility.
- Isolated repeated features/UI workloads improved 65.3%/72.0%; fast checks take about 1.3 s. Full validation took 13m49s at J=2, with broader assertions/coverage; that is not an equivalent-workload speed claim. Performance reports include software rendering, heap and visible boot phases.
- Baseline/candidate parity passed 146 models, six audio summaries and repeated 6000-tick fingerprints. All nine languages fit at 1280×720 and 960×640; actual gameplay/HUD captures inspected. Windows/Linux packages embed the exact tested packed HTML.
- Gates: quality, fast checks, Python compilation and diff checks. No commit/version/release or remote CI run. Remaining limits include internet/WebRTC, historical save fixtures, exhaustive graph identity, per-pixel trap occlusion, native installers/macOS, physical input/GPUs and calibrated GPU/memory budgets.

## 2026-11-15 · v94 release (merged with main, formatting PR #29)

- Released the whole branch as v94, plus spikes preview/demolish (#31) and lane fields (#30): co-op fixes, waves always end, new default keys, minimap, far wave spawn (`WSPN` 150 / `WSEE` 130), horde pile-up fix (`SWJAM` 0.75, `SWBW` 3.5), swarm at 10 Hz, placement log `MP.plog`, command resend after resync, mp_build prune fix.
- Notes: 2 lines added (far spawn, pile-up and smoother big waves), translated in 8 languages (`docs/studio-texts/notes-v94b.json`, nl/pl/tr).
- CI green on 0481ccc (full quick suite). Smoke test run by `release.sh`; the release workflow runs the full suite.
- Not verified: real two-machine co-op, real AZERTY keyboard, F-keys in the launcher, old saves mid-wave. #26 #3 #4 stay open until a guest F8 report.

## 2026-11-15 · v94 lot "horde pile-up" (hd-gameplay worktree, committed on branch, not merged, not released)

- Finding to explain: wave 3 of world 2 took 875 s with perfect defence (about 700 zombies "piled" 20 to 40 tiles from the castle). Probe `tests/pile_probe.js` (per 50 s: zombies per swarm state, tiles with most zombies, way point index; dumps of the map and of single zombies).
- Cause, two parts. (1) Nobody stood still (0 zombies moved less than 3 tiles in 60 s): the horde was too slow in a dense crowd. `SWJAM` cut the speed to 30 % from 20 zombies per tile, so a stretch the horde must cross at 1 to 2 tiles of width (a gap in a rock massif, a ledge before the castle) lets through only about 11 zombies per second (density x speed x width); 6200 zombies need 550 s. Same ceiling in world 1 (834 s). (2) On the way points without a field (state 3, over rock) all zombies aimed at the same point, so the horde crossed in single file; and the pressure term ignores neighbour tiles in rock. Seen: a stack of 40 to 70 per tile at one way point.
- Fix in `gameplay/swarm.js` only: (1) jam floor 0.3 -> 0.75, slope 0.05 -> 0.04 per zombie (`SWJAM`, and the value past 64); (2) state 3: each zombie aims at the way point plus its own seeded side offset (`SWLT`, up to 3.5 tiles, from `sd`, so a band 7 tiles wide) and moves to the next way point when it passes the line across the route (box test of 2 tiles kept for state 2). Nothing new in SAVA (uses `sd`, `st`, `ph`, all saved), no RNG, stable order: resync and old saves unchanged in format.
- Result (probe, wave 3, perfect defence, end of wave in s, before -> after): w0 581 -> 440, w1 834 -> 642, w2 875 -> 570, w3 708 -> 554, w4 670 -> 564, w5 739 -> 547, w6 601 -> 412, w7 660 -> 488, w8 709 -> 526, w9 586 -> 459, w10 568 -> 410, w11 642 -> 449. All 12 under 700 s; none stood still 60 s in groups of 100+ (also before).
- Tests: `waves` (world 2 added, plays wave 3: 6225 zombies must end under 700 s; `stand` = zombies within 40 tiles of a castle biting nothing and still for 60 s, at most 60; 140 s for the whole test) PASS; `det waves mpk features mp_resync` PASS. det hashes changed (8, identical on two runs): -633168385, 586599147, -6915776, -2117891958, 403569522, 2067057687, 1643546760, 1423044141.
- Not verified: `mp8`, `mp_convoy`, `save`, `smoke`, `ui` (CI); by eye (a denser, faster horde in a corridor); waves 4+ with bosses and miners; the horde reaches defences about 15 to 25 % sooner on every world (not only the slow ones), which may make early waves harder; a save made mid-wave on this build.
- Left to the King: jam floor 0.75 (0.55 gave 735 s in world 1, 661 in world 2; 0.75 gives 642 / 570) and band width 3.5 tiles (`SWBW`); whether the faster arrival is wanted (the far spawn had made first contact later).

## 2026-11-14 · v94 lot "waves spawn far" (hd-gameplay worktree, committed on branch, not merged, not released)

- King: waves must appear at the start of the map, not near, so a co-op player no longer sees the other's wave appear on him. Nothing under `game/` or `announce/`, no push, no version change.
- Before (probe `tests/spawn_probe.js`, 32 worlds x solo / co-op castles 10..60 apart / co-op anywhere, 480 lanes): the spawn was always 110 tiles of route from its own castle (`WSPN`), straight distance 60 to 120 (median 90); 48 % of lanes spawned within 90 tiles (widest zoom) of a castle; co-op near: 8 of 192 lanes spawned within 45 tiles of the OTHER castle (nearest 7), 87 within 90. Cause: the anchor was measured along the lane from its own castle only, never from the other one.
- Fix (`ai/zombie-lanes.js` `laneSpawnIdx`, `gameplay/waves.js` `spawnAnchor`, `gameplay/reset.js` `pickLanes`): spawn = point of the route 150 tiles of path from its castle (`WSPN`), at least 130 straight tiles (`WSEE`) from every castle of both players; else outward to the map edge, then inward, first point far enough (else the farthest). Pure geometry (route + castle tiles), cached on the route, no RNG; wave, blood moon, wolf pack, boss, miners and bombers all use `spawnAnchor`. `pickLanes` draws as before then puts lanes whose far end is too near a castle last (stable, same RNG draws; lane count unchanged). Minimap marker (big map and frame entry) now at the real spawn. No route geometry changed, nothing new in SAVA: old saves keep their zombies, anchors are recomputed from the routes.
- After (same probe): 0 lanes within 90, none within 130 except 1 in 480 (castle by a map edge: 106 and 112), median 132, route 141 to 611 tiles; picked lanes all at 130+.
- Pace (`tests/spawn_pace.js`, wave 3, perfect defence, worlds 0 / 1 / 2 / 9, 10 % of horde at the castle / wave beaten): v94 187-305 s / 456 / 798 / 500 / 488 s; now 258-315 s / 581 / 836 / 875 / 599 s. The swarm walks about 0.8 tile/s, so each 40 tiles more cost about 50 s of first contact. I first tried 260 tiles of walk: worlds 1 and 2 hit the 900 s limit, so 150. World 2 (lane 0) piles about 700 zombies in a stretch 20 to 40 tiles from the castle (state 3, way points without field) for 400 s; already there at 180 and 260, not analysed.
- Tests: `waves` extended (8 more worlds: every lane at 100+ tiles, drawn lanes at 125+, route 110+, real queue of wave 1 in worlds 0, 1, 9); `det waves mpk features mp_resync` PASS. New det hashes (the 8, identical on two runs): -1058406660, 401256943, 711666343, 209404249, 836641923, 1624386777, -1515789622, -1631652357 (all changed, also the first). Probes: `tests/spawn_probe.js`, `tests/spawn_pace.js` (not in the suite). Console: `spawnAnchor`, `pickLanes` exposed. Screenshot dist/spawn_shot.png (co-op, widest zoom toward the spawn, 1280x720): no zombie in view.
- No player text added. Not verified: `mp8`, `mp_convoy`, `save`, `smoke`, `ui` (CI), a save made mid-wave loaded on this build, rebel camps near a longer route (a horde can turn on a camp earlier), later waves with bosses at the new anchor, a real co-op game.
- Left to the King: 150 tiles of walk and 130 of distance (`WSPN`, `WSEE`); first contact about 50 to 80 s later; tail of the wave longer in some worlds (world 2 at 875 s).

## 2026-11-13 · v94 lot "guest placement" #26 #3 #4 (hd-coop worktree, committed on branch, not merged, not released)

- Widened `tests/mp_build.py` (2 headless clients, real mouse): windows of other sizes and ratios (host 1280x720 x1, guest 1024x640 x1.5, then resized while playing to 960x600 and 1500x800), camera turned with the right button and zoomed with the wheel, clicks all over the window, guest building beside the host castle and host beside the guest's, a path dragged across the partner's castle area, placement while paused, guest moving his castle then building and `home()`, a click right before a resync, building after it. Each click: tile under the mouse, tile in the command (`mpPush`), structure and owner on both machines, mesh.
- Result: NOT reproduced. Every guest and host placement lands on the tile under the mouse, owner right, same on both machines, mesh present; dragged path on every tile on both. By reading (rg `LPL(`, `CURPL`, `HOMEC`, `pl===0`, `CS` in gameplay, input, ui, multiplayer): no place uses player 0 or the host castle for the guest. `mpExec` sets the player from `mine`, `wpos()` falls back to `HOMEC()` of the local player, `snapM` and `placeErr` use `CURPL`. The game has no "build near your own castle" rule (`myTerr` in `players.js` is dead code): a guest may build anywhere, also beside the host castle, so nothing to reject.
- Added, no player text: (1) every `b` command carries the sender's player index (`pl`) and the tile under his mouse (`mt`); `mpExec` logs the last 20 (`MP.plog`: tick, who, type, tile, sender index, expected index, player it ran for, tile under mouse, structure made, `bad` when the sender index differs); (2) the F8 report holds `coop.me` (host, side, local index, pending commands, resync state), `coop.castles`, `site2`, `cx`, `win` (window, canvas, ratio) and `coop.plog`; `tools/repro.py` prints them. Log only, nothing in SAVA or the hash. (3) a protective fix: what a player sent for ticks the snapshot did not hold yet (`t >= M.t`) was dropped on both machines at a resync, so a click made in the last 6 ticks before it was silently lost; those commands are now kept (`MP.sl`) and sent again after the resync (`mpResApply`). Not reproduced as a loss in the harness (the click is usually executed before the snapshot); it follows from reading `mpResApply`.
- Tool: `mp_build` was missing from `tools/test_all.mjs` (journal v94 said it was in the quick suite): added, with a 40 min timeout per test. `MPB_WIDE=1` skips the first part to look only at the wide part.
- Found by the test, not a fault: in a small window (960x600) the quest panel lies over the left of the map; a click there opens the quest log (full screen) instead of placing. The test avoids it.
- Not verified: two real machines on a real link (latency, PeerJS, real GPU), a real public lobby, a real touch screen, the re-queue after a resync on a click inside the last 6 ticks.
- For the King: #26 stays open; if it happens again an F8 report from the GUEST right after the bad placement tells enough (plog, castles, window). Ask him which of the two castles the building appeared near and whether the camera moved by itself.

## 2026-11-13 · v94 lot "swarm performance 2" (#21) (hd-perf worktree, committed on branch, not merged, not released)

- Exact step (hashes of profile.py identical): no division for a zombie well inside its tile (0.01 px margin), jam table, `swPick` returns at once when one neighbour is downhill, castle distance only for zombies still on a lane. Gain inside the noise (share of swarm functions excluding `(program)`: 57.2 / 55.6 / 61.0 / 56.6 before, 56.1 / 54.5 / 54.9 / 58.3 after; machine load 4 to 15).
- Behaviour step: swarm at 10 Hz (`SWDT` .1, look every 32 steps = still 3.2 s, bite cap per step x2, `swRear` every 5 steps; render already interpolates). Swarm share excluding `(program)`: 43.9 / 45.6 %, swarm time about 16 to 24 s instead of 25 to 36 s. det hashes change (new ones identical on two runs).
- Waves on worlds 0, 1, 2, 9 (probe, wave 3, perfect defence): end 461/808/508/493 s before, 463/793/505/490 after; kills equal within 20 (6931/10506/6126/11287 vs 6932/10523/6131/11289); no stuck zombie for 60 s, none in water.
- Not verified: by eye in a real browser, bosses and miners at 10 Hz, real GPU.

## 2026-11-15 · v94 lot "spikes preview and demolish" (hd-gameplay worktree, not merged, not released)

- Issue #31 (King: "on ne peut pas prévisualiser les pics et on ne peut pas les détruire"). Nothing under `game/` or `announce/`, no push, no version change.
- Cause 1: mode `spike` had no preview branch in `rendering/frame.js` (only the generic 1.7 high green box, validity ignored trap rules: water, existing trap, occupied tile). Cause 2: a trap is only a `SPK` tile -> hp entry, no structure in `occ`, so the demolish tool fell through to "Click one of your buildings".
- Fix: `spikeFree()` (shared by `placeSpike` and the preview), `spkGhost()` translucent pit + 5 spikes (green / red; visual only, no sim state), demolish hover over a trap shows it red. `removeSpike()` called from the `demolish` branch of `build()` (so it runs inside the "b" command in co-op): instant removal, 100 % refund (10 g + 15 w) to the clicking player like a path tile, `SPKV++` rebuilds the mesh. New text "Trap removed: resources recovered" in 8 languages. SAVA unchanged (SPK stays tile -> hp).
- Tests: `traps` extended (place + demolish through `mpExec` "b", refund, empty tile no refund, `spikeFree`).
- Known limits: a trap has no owner, so in co-op either player can demolish (and be refunded for) the partner's trap; SPK is not in `mpHash` (resources are, so a refund divergence still shows). Not verified: preview seen on screen, a real 2-client co-op demolish.

## 2026-11-15 · v94 lot lanes (#30, unreleased, no version change)

- Report (#30): waves "still jam against trees, or the route wants to cross a mountain". Probes (new, not in the suite): `tests/stuck_probe.js` (stalled zombies per 30 s, tile type, neighbours, state), `tests/lane_gauntlet.js` / `lane_gauntlet_units.js` (a small swarm / lane units over real lane stretches, optional planted forest `GF`), `tests/lane_static.js` (lane fields of whole worlds, no zombies).
- Cause found: the way points of a lane are laid without looking at the land, and a stretch's field targeted its farthest way point with free ground around it (box = way points +-14 tiles). When that point sits in a pocket of rock or wood, or the stretch start is not connected inside the box, the field does not reach the horde: state 3, the zombies walk straight over the rock/trees (the "route through the mountain"), crowded on one tile at 30 % speed, or follow a long detour back and forth. Static check on 18 worlds (about 1150 stretches): 8 stretches had a field that did not reach their start; on the 4 worlds that have them, 6 stretches: 4 reachable by a walk of 1.6 to 4.4 times the straight line outside the box, 2 walled in.
- Fix (`ai/zombie-lanes.js` `laneField`): the target is tried from the next way points back (4 tries, one wider window of 40 tiles) and kept when it reaches the stretch start by a walk of at most 2.2 x straight + 16 tiles; else the former field stands. Deterministic (terrain only, no RNG), nothing new to save. `gameplay/swarm.js`: a zombie that clambers (no path) or stands on a solid tile spreads over any neighbour and is not slowed by its own pile.
- Evidence: unreachable stretches 6 -> 2 on those 4 worlds; perfect-defence wave 3, worlds 0-3: end 461/808/508/589 s -> 462/802/367/595 s, stalled-zombie samples (>14 tiles from the castle) 479/872/231/425 -> 388/598/39/315 (different time windows for world 1). Planted forest 30 % and dense lanes: no stuck zombies in the gauntlet before nor after (the swarm already clambers through woods); unit runners all arrive.
- Verified: `det` same=true (reference re-pinned in `tests/det.js`: the lane fields now generate chunks around the stretch earlier, so T/swarm hashes move), `waves`, `mpk`, `features`, `mp_resync` PASS.
- Not verified / left: wave 3 of co-op world 1 already needs 802 s (808 before), over 700 s, unchanged by this lot; stretches that are walled in or need a detour over 2.2 x straight keep the clamber; defended castles with walls and foresters (probe kills at 8 tiles, nothing blocks); real lanes with the red trail drawn through a mountain are not redrawn (route polyline untouched, a lane that detours is still long: the lane waves a long way round a ridge); no F8 report of the King's exact spot.

## 2026-11-13 · codebase cleanup (unreleased, pinned v94)

- Integrated the cleanup with fetched v94 `4a57714017d38c8d5294445e20962eb4b1e76c11`; this verification stays pinned by request. No release/version/notes change.
- Added ESLint, Prettier, LF conventions, architectural checks and CI gates; all 240 maintained JS syntax trees remain identical through the formatting-only pass. Removed verified dead private code and unused bindings while retaining exported names, arities and effect/RNG evaluation.
- Established language/panel/catalog and terrain/query/traversal/cache owners, explicit synchronous chunk/invalidation registration and music audio-state injection. Removed 331 cyclic edges from v94, added none; one 121-module component with 811 cyclic edges remains under a ratchet.
- Verified `npm run quality`, translation/notes checks, all 31 full-suite scenarios without retries, strict save continuation/shared references, five deep resync recoveries and a 6010-compared-tick multiplayer soak. Disconnected-map regression and caller-relative CLI check also pass.
- Baseline/candidate parity: all 146 model signatures and six audio peak/RMS summaries match; three 6000-tick simulation profiles match, median 13508 -> 13522 ms (about 0.1%). PCM bytes are nondeterministic in unchanged Chromium baseline renders and are diagnostic only.
- Windows/Linux packages build and embedded resource hashes match. Actual preload/save IPC contract passes with Electron mocked. Title/update/settings/desktop/narrow screenshots inspected; no observed visual regression or page error.
- Guidance/evidence/limits: `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/CLEANUP_AUDIT.md`; local reports under `dist/cleanup-review/`. Remaining work includes legacy SCC boundaries; native installers/macOS, physical input, real GPUs and internet co-op were not exercised. Remote CI has not run for these local changes.

## 2026-11-13 · v94

- Released as the batch the King asked for after playing v93 in co-op (his list: guest buildings on player 1's site, zombies lost in water so the wave never ends, unclear sync message) plus "continue de tout tester / améliorer" and "oui fait tout".
- In: wave-end fix (#27), co-op determinism lot (resync and load restore every state the simulation reads, #5 fixed, #28 sync line, guest keeps player 2 after the partner leaves), keys F6/F7/F9/F3 and camera on physical keys (ZQSD on AZERTY), minimap framed on the explored area, QA fixes of v93 (banners vs event bar, top bar), CLAUDE.md update.
- Verified: CI quick suite green on 683ae79 (26 tests, mp_build, waves, ui, save with sameCont true included); det references: 1st of 8 hashes unchanged, 7 changed by the wave routing fix (see the wave-end entry).
- Not reproduced: #26 (guest placement on 2 connected machines), #3, #4; only the "alone after partner left" fault was found and fixed. Ask for an F8 report from the guest if it happens again.
- Not verified: a real AZERTY keyboard, F3/F6/F7/F9 in the Electron launcher, a real internet link between two machines, later waves (bosses, miners) with the new lane rules, real GPU.
- Open for the King: wave safety net delays (32 s, 80 s), zombies now wade lakes, safety net for miners and bosses, sync line thresholds (1.5 s, 6 s), minimap minimum frame (180 tiles), old keys ' [ ] - now unbound by default.

## 2026-11-13 · v94 lot "keys and minimap" (hd-menu-ux worktree, not merged, not released)

- King: "oui fait tout". Nothing under `game/` or `announce/`, no push. Interface and input only; nothing in SAVA, the lockstep or the simulation (`det` unaffected by construction).
- New defaults: torch F6, barracks rally F7, forester F9, guild F3 (F1 F2 F4 F8 F10 are the only F keys the game uses, F11 the launcher's; F3 F6 F7 F9 are free). A bound F key gets `preventDefault` (find, address bar, caret browsing). Saved keys migrate once (marker `dk_keyv` 3) only when still on the old default and the new key is free (`KMIG` in `ui/settings.js`).
- Camera, turn and army by physical key (`KeyW KeyA KeyS KeyD`, turn `KeyZ KeyX`, army `KeyQ`): WASD on QWERTY, ZQSD on AZERTY, army = Q / A, turn = Z X / W X. Every other binding stays a typed character and wins over a physical one (QWERTZ: the key typing y stays "raise"). `kbAct(k, code)` finds the action; held physical keys go in `keys[code]`. Saved custom keys keep working; unchanged QWERTY players see no change. Rebinding a camera key stores the physical key.
- Labels: `kdisp()` shows what the physical key types, from `navigator.keyboard.getLayoutMap()`, else the last character typed there (`dk_lay`, a typed A/Q/W/Z infers the layout), else the browser language (fr -> AZERTY, de -> QWERTZ), else the QWERTY letter. Tooltips "Select army", "Turn camera left/right", the castle-picker hint ("drag / {0}", new key in 8 languages) follow it.
- Hard-wired keys beside the settings, listed and fixed: `p` (pan mode, also demolish), `=` `+` (zoom in, `=` also castle rally), `-` (zoom out, also barracks rally until now), `,` (idle workers, also move castle). They now act only when no action owns the key (before, `p` both demolished and panned). `-` is free for zoom since the rally point left it. Apostrophe, `[`, `]` no longer do anything by default.
- Minimap framed on the explored land (`ui/minimap.js`, `fowBox()` in `rendering/fog.js`): box of seen fog, own buildings and castles (both in co-op), seen camps, plus the camera; 16 % margin, at least 180 tiles wide, world-shaped (square pixels), looked at once a second, moves only when land nears an edge or the camera leaves, glides (4.5 /s), narrows back when 1.5x too wide. Click and drag (`mmGo`), camera rectangle, routes (entry point on the frame edge), alerts and icons use the same frame. The big map (M) still shows everything.
- Tests: `ui` extended (QWERTY / AZERTY / QWERTZ camera, turn, army, labels, four new defaults and preventDefault, hard-wired keys, rebinding, 4 migration cases, minimap click at two framings and while gliding): PASS. `textaudit` table OK, `langcheck` 0 / 0 / 0. Seen once at 1280x720: minimap early game (small framed island with the camera rectangle), mid game (seven camps and knights 60 tiles away widen the frame), Controls page with AZERTY labels (Army A).
- Not verified: a real AZERTY keyboard and `getLayoutMap()` in a real browser, F3 F6 F7 F9 in the Electron launcher, a co-op game (render only, not run), keys settings page below the fold, the minimap on touch.
- Left to the King: minimum frame of 180 tiles (early the island is a third of the box; 120 would fill more but jumps sooner); old keys `'` `[` `]` `-` are now dead unless rebound; "Turn camera left" replaces "Rotate left" in the tooltip (the old key text stays translated for the building rotate).

## 2026-11-13 · v94 lot "QA of v93" (hd-qa worktree, not merged, not released)

- Task: look at and run what v93 shipped unseen. Nothing under `game/` or `announce/`, no text changed (no new key), nothing pushed.
- Seen by eye (1280x720; 390x700 where said): Update page in French, Turkish, Polish (the v93 notes fit on one screen, bottom included: nothing to scroll); the 5 new guide chapters in German (the caption of chapter 13 takes two lines and stops 7 px above the progress bar); quest log with two skipped quests ("Passée", grey, dash box); quest arrow on a building, on the left and bottom edges, under the top bar and under the event bar; Esc menu with Guide (also 390x700); a warlike rebel camp (4 spearmen, 5 knights, 4 archers); the 4 announcement pictures.
- Game faults fixed (`ui/hud.js`, `ui/hud-state.js`, interface only, nothing in the simulation): (1) achievement toasts lay on the event bar buttons and on a long message line: they now go under the message line, the event / hint bars, the raid bars and (narrow screens) the quest panel; (2) the wave banner ("WAVE 6") lay on the two buttons of the caravan / envoy bar that comes with the wave: it now sits under that bar; (3) at 1280x720 the whole block "Wave N / Next m:ss / directions / season" vanished from the top bar when it was too long (weather after the season, an event name, translations): now the weather goes first, then event, season, directions; wave and countdown always stay.
- Tool faults fixed: `tools/shots/*` showed "Next 2:34" over a raid bar (wave() without its flags), quest 1/20 and the opening hint at wave 6, a level 2 King at wave 0, and achievement toasts of a kingdom built in seconds: `grown(id)`, `noToast()`, `startWave(6)`. `tools/build.mjs` writes the build beside and renames it (a page loading during a build never reads half a file). `tools/run.py`, `tools/profile.py`, `tools/fitcheck.py`, `tests/mp8.py`, `tests/mp_convoy.py`: page-load limit raised (loads took 2 to 4 minutes at load 15 to 27 and timed out at 180 s). `tools/qa_shots.py`: steps 80 to 97 (`python3 tools/qa_shots.py dist/qa/v94 8,9`), options `wheel`, `after`, `post`; debug console: `setLang`, `TOASTS`, `bannerT/S/S2`.
- Skipped convoy quest on real maps: `tests/convoy_cut_probe.js` (120 seeded pairs): 114 linked, 6 cut (trials 49, 77, 80, 97, 112, 119; 77, 97, 112, 119 have water between the castles, 49 and 80 are two closed ledges). `tests/mp_cut.py` (2 headless clients, trial 77, river): convoy refused, quest skipped on both at tick 81 without reward, 1627 equal hashes, no desync, two more looks of the 30 s timer change nothing. Cost of `convoyLinked()` (machine at load 15 to 27): linked maps median 0.5 ms (max 52), cut maps median 22 ms (max 134); the FIRST call on a cut map also generates the land of the wide rectangle: 0.6 to 2 s once (a single hitch when the quest comes up, then the quest is skipped and never looked at again).
- Keyboard (`tests/azerty_probe.js`, simulated AZERTY events): no plain key for torch (' is the 4 key), barracks rally (- is the 6 key), forester ([ = AltGr+5), guild (] = AltGr+)), royal charge (> = Shift+<), cannon (/ = Shift+:), idle workers (. = Shift+;). Camera W A S D are the Z Q S D keys on AZERTY (z = rotate left, q = select army; the arrows work). Free on both layouts, one press: F3 F6 F7 F9 Insert End (all 26 letters are taken). Beside `KB`, hard-wired: p = pan mode (also demolish), = and + zoom in (= is also the castle rally point), - zoom out (also barracks rally), , selects idle workers (also move castle).
- Tests on this branch (v93 + the interface fixes): `events` PASS, `envoy` PASS, `features` PASS, `mp8` PASS, `mp_convoy` PASS (RESULT OK, 877 equal hashes), `save` PASS (same0 true, sameCont false as known), `det` PASS with the v93 hashes (1289907662, 78342706, -1731518221, 1421632697, -2023083426, -766400875, 432483754, 1830404059), `ui` PASS with 3 new cases (toasts drawn, toasts clear of every bar, banner under the event bar; the first run caught a mistake of mine in the toast code), `tools/profile.py` twice: same hashes (swStep 12 %). `fitcheck 1280 720`: 0 overflow in the 9 languages (canvas and HTML). `textaudit` table OK, `langcheck` 0 / 0 / 0.
- Not verified: the top-bar fix in other languages (seen on the King picture: "Wave 4 Next 2:07 N SE Summer" is back, the weather name dropped); the night picture and the narrow-screen toasts after the last fixes (seen once before them: night dark, torches lit, one toast left that `noToast` now holds back; toasts on the quest panel at 390 px, since moved under it and covered by `ui` only at 1280); the War cry button under its cooldown reads "War cry [<" with a smudge (not looked into); `mp_cut` judged on its log (its first run said FAIL on a time limit of mine, removed since times follow the load; not rerun); trials 49 and 80 (ledges) not run with 2 clients; `mpk`, `mp_resync`, `mp_quests`, `mp_events`, `smoke`, `tools` not rerun (CI); a real AZERTY keyboard, two real machines, a real GPU; NL / PL / TR read by a native speaker.
- Left to the King: the minimap shows the whole 2250 x 1250 world, so a kingdom is a few pixels and the minimap is nearly black for most of a game (this is what the announcement pictures show; not a tool fault): a minimap framed on the explored land is a design change (M); default keys for the 7 actions above (proposal: torch F6, barracks rally F7, forester F9, guild F3; charge, cannon, idle stay on Shift or get Insert / End); the second line of the wave banner ("BLOOD MOON - ...") runs over the quest panel for a few seconds; on 390 px wide a long message line is cut at the right; the raid bar counts 7 000 (wave 3) to 15 000 (wave 6) zombies "left" in the tool scenes (swarm members): to compare with a real game.

## 2026-11-13 · v94 lot "wave cannot end" (#27) (hd-gameplay worktree, committed on branch, not merged, not released)

- Reproduced (probe `tests/waves_probe.js`, wave 1, perfect defence, 12 seeded worlds, v93): 4 of 12 never end (900 s limit, 945 to 2025 zombies left, no progress for minutes). World 1 (co-op): the lane to the second castle ends in a rock massif and the whole horde piles on one way point 50 tiles out. World 9 (co-op): a lake between spawn and castles, 945 zombies on water tiles that nobody can reach, wave stuck. Worlds 2 and 3: 1170 zombies stuck / 5 stuck at 45 and 23 tiles from the castle. Solo 0, 4, 6, 8, 10 and co-op 5, 7, 11 end fine (about 1 world in 3 broken).
- Cause (`gameplay/swarm.js`): inside 46 tiles of the castle a zombie dropped its lane for the castle's path fields even from a tile those fields do not reach (across a river or below a closed ledge), then fell back to "straight at the castle", where `blk` stops it at the first rock or bank; and when the last way points of a lane stretch lie in rock or water, the zombie waited for a way point it could never reach (`ph` never moved). Zombies that wade in water stayed visible only as heads below the surface of the block world.
- Fix, deterministic (no RNG, stable order): (1) lane is left for the castle fields only from a tile they reach (`hasC`); (2) a stretch whose remaining way points are in rock or water is skipped to the next stretch, or the castle field is used when it reaches the tile (same in `laneWalk` for unit zombies); (3) safety net: each zombie is looked at every 3.2 s (its turn from `sd`); one that bites nothing and stayed within 1 tile counts one look (`sk`); at 10 looks (32 s) it gives up its path and walks straight at the nearest castle over any ground (rock, water, wood; buildings still stop it and are bitten); after 25 more looks (80 s) it is removed without gold and without a kill. Order chosen: reroute first, remove last, and never by walling in: a zombie that bites a wall or a unit never counts as stuck (states 1 and 7 reset it). (4) swarm drawn no deeper than 0.75 below the water level.
- State: `SW.sa` (Int32) and `SW.sk` (Uint8) are saved with `SW` like the other swarm arrays; an old save has none: `swStep` creates them (tested). Spawned zombies start at sk 0.
- Tests: new quick test `waves` (`tests/waves.js`, in `tools/test_all.mjs` quick list): worlds 0, 1, 9 end under 600 s with none stuck or in water, lake crossed by 478 zombies, 30 zombies put on water walk out, a held zombie gives up at 29-32 s and is taken away at about 110 s without a kill, an old swarm without `sa` / `sk` steps. PASS. Same 12 worlds with the fix: 0 of 12 stuck or late. `det` PASS (same:true), `features` PASS, `smoke` PASS, `mpk` PASS (no divergence; run on the build before the last small edit, the final run gave ERRS [] [] too).
- det hashes: the first of the 8 equals lot "spearman 2" (1289907662), the other 7 differ (now 1277869275, 1806847686, -1490071179, -733253062, -1208506384, -1815204722, -19860095) because the horde now takes other routes in the det scenario once past the first 750 ticks; the new reference is these 8. Same twice.
- Not verified: `mp8`, `mp_resync`, `mp_convoy`, `save` (CI); the screenshot (dist/water_after.png, 1280x720, wave 1 world 9) shows zombies wading through the lake with the stuck state gone, the lake zombies look right but I looked once; solo world with a castle on a small ledge; later waves (bosses, miners, bombers) not probed; real GPU; a real co-op game.
- Left to the King: 32 s to give up and 80 s more before removal (tunable `SWGH`, `SWRM`); the zombies that wade through water now cross lakes (they did not die there in v93 either, they only stopped); whether miners and bosses (unit zombies) need the same net (only the lane walk was changed for them).

## 2026-11-13 · v94 lot "determinism" + co-op placement and sync line (hd-coop worktree, not merged, not released)

- Placement (#26, #3, #4): new test `mp_build` (lobby as played, then the guest clicks with a real mouse: 12 kinds incl. wall, path, gate, rally, King; same for the host; resync; partner leaves). No placement fault on 2 connected machines: tile under the mouse = tile built, owner right, same on both, mesh present, castles on their chosen sites, cameras on their own castle. One real fault found: when the partner leaves, `LPL()` fell back to 0 and the guest alone became player 1 (host's resources and buildings, home key to the host castle); fixed with `MP.side` (guest keeps index 1 after `mpLost`, reset on quit, load, new game). Likely what the King saw after a disconnect; not proven for his session (needs an F8 report).
- Resync: a resync no longer throws the camera back to the castle (`build3D` ends with `home()`; `mpResApply` restores `CAM`). Stale `rsq` requests (older epoch) are dropped; a watchdog restarts a resync stuck over 60 s (`mpWatch` in `lockstep.js`); `MP.rsLast` is set when the resync ends.
- Sync line (#28): one function `mpBanner` (lobby.js), refreshed every 300 ms: nothing under 1.5 s of waiting, then "waiting for NAME, N s", after 6 s of silence "no answer from NAME for N s, the game goes on when the connection is back", resync or desync "putting both games back in step, a few seconds (nothing to do)", slow link kept; gone as soon as play resumes. Texts in `docs/studio-texts/coop-v94.json` (FR vous, DE du, PT European) and NL PL TR. In 6000 ticks of a loaded game (`mp_soak`: building by both, waves, convoys both ways, events, quests, King skills) there was no desync and no resync, so on a good link the old line could only come from short waits (it showed "waiting for your partner" at every missing packet) or from a resync; the cause of a lasting banner on his machines is not proven (real internet link not tested).
- Determinism of resync / load: state read by the simulation but missing from the save: the kept target `_tc` (units and towers, 2 ticks) and the rebel base field `zf` / `zft` (30 s) are now saved (they were dropped, so a loaded or resynced game re-targeted at other ticks); `sessionState.fdT` and `fdDirty` (next rebuild of the walking fields) and `constructionState.lastFm` are saved; `restore` / `mpResApply` no longer force `fdDirty` after `calcFD`; `pfS` is not saved, `stepF` keeps the saved `pfB`. Old saves: missing keys get defaults. Cost: the Object-graph save holds `_tc` references (whole units), bigger by a few KB.
- Compared after a resync (`mp_resync_deep`, new): 5 resyncs in one game (open event, convoy on the road, raid with zombies and wolf pack wave, King skills, all at once with the HOST corrupted), per tick `epoch:tick` digest of every plain field of every unit and structure (kept target included), swarm, random draws per tick, resources, prices, events, quests, scalars of SAVA: 218, 215, 239, 217, 223 ticks compared, no divergence (1187 in epoch 1). Before the fixes it diverged at the first tick (units' `cg`, then peasants' `pfT`, then field timers), so the one-tick gap of v92 and the 5130 / 5140 reads were real differences of unsaved state, no longer there.
- Save / load (#5): `tests/save.js` now compares units (every field value that matters), structures, swarm, `mpHash`, prices, random draws and the world, and passes on `ok` (sameCont true): sameCont PASS. Causes found by bisecting over parts: `_tc` (and `zq` that follows from it), `pfS` / `pfB`, and the background chunk generation of solo (`GI`, `genN`), which runs by the wall clock during awaits (the test now stops it; in a real game it changes only when a far chunk is generated, which is world data and seeded, not simulation). Fixes #5.
- Tests: `det` PASS with the same 8 hashes as lot "spearman 2" (1289907662 ... 1830404059): unchanged. `save` PASS (same0, sameCont). `mp_resync`, `mp_resync_deep`, `mp_events`, `mp_build`, `mp_soak` (6057 ticks) PASS; `ui` banner cases PASS; `mp_quests` PASS on the second run (the first failed on a 6 s construction wait under load 20, the guest and host houses built later; no divergence). New tests registered in `tools/test_all.mjs` (`mp_build` in the quick suite; `mp_soak`, `mp_resync_deep` on demand).
- Not verified: a real internet link (the banner texts and thresholds are tuned by reasoning, not by feel), `mp8` `mpk` `mp_convoy` (not run here), real GPU, a long game over 6000 ticks, FR / DE / PT banner texts in a picture (only the lookup is tested).
- Left to the King: thresholds (1.5 s before "waiting", 6 s before "no answer"); whether a guest left alone should keep playing as player 2 (done) or be offered a save; `CLAUDE.md` still says "sameCont=false is known" (agents do not edit it) and does not list `mp_build`, `mp_soak`, `mp_resync_deep`.

## 2026-11-12 · v93

- Released as the batch the King asked for ("fait le tout", "ajoute la traduction pour les textes maj", "des ** qui trainent"): lots texts (#22, #25), convoys (#20), guide (#23), spearman 2 (#24), small fixes, swarm performance (#21, share only slightly down).
- Notes of v93 written in `game/NOTES.md` with their 8 translations (`docs/studio-texts/notes-v93*.json`); `tools/release.sh` now refuses untranslated notes (`node tools/textaudit.mjs --notes`).
- Verified: each lot's own tests (see the entries below); after the last merge `det` PASS with the hashes of lot "spearman 2"; CI green on 5973d54 (guide + spearman 2); the release workflow runs the whole suite on the final commit.
- Not verified: sounds of the guide by ear, a real AZERTY keyboard, F4 in the launcher, a real map cut by a river for the skipped convoy quest, two real machines, real GPU.
- Open for the King: default keys for torch and barracks rally point on AZERTY (their old keys are now digits 4 and 6; T and Y are taken by trebuchet and raise), rebel spearmen shares (1/4, 1/3, 1/2), guide sound level, example amounts in guide clips, swarm options that change behaviour (10 Hz step, cell order, pressure per cell).
- CLAUDE.md still to update (new tests `ui`, `mp_quests`, `mp_events`, tools `textaudit.mjs`, `qa_shots.py`, swarm line): needs the King's word since agents must not edit it.

## 2026-11-12 · v93 lot "small fixes": convoy quest skipped, guide closes, AZERTY digits, quest arrow, shots tool (hd-qa worktree, not merged, not released)

- King: "fait le tout" on the leftovers of the v92 pass. Six small items, nothing under `game/` or `announce/`.
- Convoy quest (co-op): skipped for both, without reward, when no convoy can go: `convoyLinked()` in `multiplayer/convoys.js` floods the walkable land from each castle (`bfsW`, small rectangle first, then the wide one) and says yes when a castle tile or a peasant of the sender is in the partner's flood, or when a flood comes within 7 tiles of the other castle (the rule of the command); a fallen castle also skips. Looked at when the quest comes up, then every 30 s of simulation time (`QST.ct`, saved, so both machines look at the same ticks, also after a resync). `qTick` now pays a fulfilled quest before it looks at the skip. Message "Quest skipped: {0}" and "Skipped" on the row of the quest log (2 new keys, 8 languages, `docs/studio-texts/fixes-v93.json`).
- Video guide: `guideWatch()` (called by `drawUI` every frame) closes it when a game starts or resumes under it, when the player is back on the title, and when the game ends while it plays (co-op); in that last case the game view comes back so the end panel shows.
- Texts: "All visible {0}s selected" and "All your {0}s selected ({1})" reworded in FR, ES, DE, IT, PT so the unit name stands alone ("Unités visibles sélectionnées : {0}"); no other key glues a suffix. `tools/langcheck.mjs` now fails on `{n}s` in any of the 8 languages.
- AZERTY digits: confirmed on the unchanged build (headless, `key:'&', code:'Digit1'`: no peasant; Shift + digit goes to the control groups; `à` does nothing; the 4 key types `'` and placed a torch). `input/desktop.js` now takes an unshifted digit-row key by `e.code` unless the typed character is a key the player chose himself (`kbCustom`, so keys saved from an AZERTY keyboard keep working); when rebinding, a digit-row key that types a sign is stored as its digit, so the settings show the digit. `KB` and `dk_keys` keep their format.
- Quest arrow (`ui/quest-marker.js`): never on the HUD. Its tip stays under the top bar and the centre bars (raid, boss, goals, King: new `hudDisplayState.cbar`); a building whose roof is behind them keeps a lowered arrow; a building off screen or behind the menu, the tabs or the minimap gets an arrow on the edge of the free screen, turned toward it.
- `tools/announce_shots.py`: writes to `dist/announce-shots/` (`SHOT_OUT` for another place), never under `announce/`. `tools/shots/_prelude.js`: `startWave(n)` starts the wave as the simulation does (`waveOn`, `hordeOn`: without them the night never fell) and `calm(seconds)` gives the other pictures a real countdown.
- New quick test `ui` (`tests/ui.js`: 12 key cases, arrow sweep of 135 camera positions, 4 guide cases); `tests/quests.js` extended (convoy quest stays when linked, waits 30 s, `ct` kept by a snapshot, skipped without reward behind a closed ring of walls, paid first when already delivered, same twice).
- Tests (2 cores shared, load 3 to 6): `ui` PASS, `quests` PASS, `tools` PASS (908 s, the load), `det` PASS with the hashes of lot "spearman 2" unchanged (1289907662, 78342706, -1731518221, 1421632697, -2023083426, -766400875, 432483754, 1830404059), `mp_quests` PASS once (1997 equal hashes, convoy quest paid to both). `textaudit` table OK, 0 dead key in the v93 block; `langcheck` 0 / 0 / 0. Seen once: `04-night.png` (dark, torches lit, "Wave 3 / Night") and `01-bastion.png` ("Next 1:35").
- Not verified: a real AZERTY keyboard and a real two-machine game; the edge arrow by eye (positions and directions are tested, no picture taken); the time of the route check on a cut map (two wide floods once; the first version with path searches took 1.4 s and was replaced, the flood version was not timed); pictures 02 and 03 not looked at; `mp8`, `mpk`, `mp_resync`, `mp_convoy`, `save` not run (CI).
- Left to the King: on AZERTY the torch (`'`) and the barracks rally point (`-`) defaults are now the 4 and 6 keys, which train a bannerman and build a wall: two new defaults to choose; a castle walled in without a gate, with every peasant inside, also skips the convoy quest; the night picture shows an "Achievement" toast over the "Night falls" line and the minimap is nearly black in every picture (as before); `CLAUDE.md` does not list the `ui` test yet.

## 2026-11-12 · v93 lot "texts": Update page translated, registers (#22, #25) (hd-localization worktree, not merged, not released)

- Update page (#22): `core/notes.js` `notesLines()` turns `game/NOTES.md` into lines; `**Title**` (or `# Title`) is drawn with `l.section`, a dash line as a bullet, the intro as a plain paragraph; `**`, backticks, `__`, links are stripped. Each stripped line is one key, looked up whole by `L()` (exact match first), English when missing. No other `**` reaches the screen (searched the sources and the tables).
- The 19 lines of the v92 notes translated in FR ES DE IT PT (`docs/studio-texts/notes-v92.json`, block v93) and NL PL TR (`notes-v92-nl-pl-tr.json`, appended to `i18n/langs/*.js`).
- Guard: `node tools/textaudit.mjs --notes` (check 0 of the audit, also in the full run) exits 1 when a line of `game/NOTES.md` is not a key with all 8 languages or keeps a marker; `tools/release.sh` calls it before the version bump and the build. So each release: write the notes, add their translations, then release. Old notes keys then show as "reached by no source" in the audit and can be removed.
- Registers (#25), decided for the King ("fait le tout"): Portuguese = European, formal (the interface already said ecrã, guardar, rato, controlos, quinta, "está a ser", partilhar, câmara; Brazilian only in "zumbi" on 45 lines and 6 phrases): zumbi(s) to zombie(s), "Gerando", "Salvo", "Pressione ... selecioná-los", "Conserta", "se consertam", "se ferem", "encontrá-los" fixed. German = "du" everywhere: the Chronicle line "Haltet ... Euer Volk", 3 "Eure" lines, "Haltet das letzte Licht" and 4 title tips ("Baut", "Bildet", "Erforscht") to the singular; kept on purpose: "Haltet die Linie!" (order to the troops) and plurals speaking to both co-op players.
- Plurals: the English suffix `{1}` ('s') was printed by NL, PL and TR ("2 boers", "2 köylüs", "Chłopów: 2s"): the 7 peasant / villager / sapling keys reworded without it in the three files; NL "All your / All visible {0}s" and DE "Alle deine {0}s" reworded. `tools/langcheck.mjs` now counts a kept suffix as a fault.
- Verified: `textaudit` table OK and notes 0 problem, `langcheck` 0 / 0 for the three, `npm run build`, `npm test -- smoke tools` PASS (a first run under load timed out at page load). Seen by eye at 1280x720: Update page in French and German, top of the list (intro, both first headings, bullets), no asterisk, wraps inside the panel, no overflow reported.
- Not verified: the bottom of the page (Comfort; the wheel did not scroll headless); the guard with a failing notes file (nothing under `game/` was touched); NL / PL / TR by a native speaker; fitcheck not rerun (no button label changed length upward except tips drawn with fitting).
- Left to the King: FR / ES / PT "Tous vos {0}s" still glue an "s" to the unit name; NL "de {1}" in two repair messages ignores de / het; "Você" kept for "You".

## 2026-11-12 · v93 lot "convoys" (#20, hd-coop worktree, not merged, not released)

- Causes found on 120 seeded pairs (v92: 17 not delivered, the 1 in 7 of the QA probe). (a) 6 pairs: the land route exists but is a long detour, the 120 s of the whole trip ran out. (b) 8 pairs "no path / porters stay home or stop on the way": there is no land route at all (river, or a castle standing on a ledge of 25 to 800 tiles without a ramp: `levelGround` only flags ring tiles 1 level off, `siteOK` does not check the way out); the porters walked to the closest tile they could reach and stood there. (c) 3 pairs "stop 5 to 7 tiles short": same thing at the partner's end, his castle is on a small ledge and the closest tile is at its foot, just outside the 4.6 tiles.
- Fix, `multiplayer/convoys.js` only: a porter whose path ends within 8 tiles of the castle has arrived (also on the way home); `c.t` is now the time without progress along the path field (reset when `stepF` notes progress, `u.pfT`), 120 s, plus a hard cap `c.tt` of 900 s; a porter that cannot walk home after delivery goes back to work where it stands instead of staying a porter for ever; at the command, the route of the first porter is computed and, without a land route to within 7 tiles of the partner's castle, the convoy is refused at once with the existing text "The convoy cannot reach your partner" (nothing leaves the stock).
- Determinism: the check runs inside the command (`mpExec`), on simulation state only; the new counters are on `u.cv` (units are saved whole, so they survive a resync); `pfS` is not saved but is only compared by identity and both machines reload the same snapshot.
- Probe `tests/convoy_probe.js` rewritten: 36 well-mixed seeded pairs, one line per pair as it ends, "refused" pairs checked with a BFS 300 tiles wider than the pair (`bfsW` exposed in `debug/browser-console.js`). v92: 32 of 36 delivered. Now: 35 delivered (7 to 163 s), 1 refused (trial 28, sender's castle on a 30-tile ledge, not linked). The 13 other failing pairs of the 120: 5 delivered (25 to 185 s), 8 refused, none linked in the wide BFS.
- Tests (machine loaded 9 to 23, other agents): `mp_convoy` PASS (302 s), `mp_resync` PASS, `det` PASS (same game twice, same hashes; convoys are not in the det scenario, solo). `mp_quests` NOT green locally, twice: run 1 the convoy quest closed, 2857 equal hashes, no desync, no error, but the 6 s real-time waits of the test for the house and farm sites ran out under load (RESULT FAIL); run 2 the page did not load in 180 s (load 23). To rerun on a quiet machine or on CI.
- Not verified: a real two-machine game; the 103 pairs of the 120 that already worked were not rerun past trial 35; a pair whose porters other than the first have no route (their share comes back after 120 s as before).
- For the King (not done, rule choice): about 1 site in 12 puts a castle on a closed ledge or behind a river: the convoy quest cannot be done there until the player builds a ramp or a bridge. Either `siteOK` refuses such sites, or the levelling cuts a way down, or the co-op convoy quest is skipped when the two castles are not linked.

## 2026-11-12 · video guide lot for v93 (hd-menu-ux, issue #23, committed on the worktree branch, not pushed, not released)

- King: "fait le tout" on the four open points of the guide. Detail in `docs/studio-notes/guide.md`.
- Sounds in the clips: per-chapter `[time, sound]` lists played through `snd` (visual side, REALR) when the clip time crosses them; `snd` now returns the gain node of its voice so the guide fades its voices on pause, chapter change and close. Sound on/off and the effects volume apply as everywhere.
- "Guide" row in the Esc menu (`drawGameMenu`): solo is stopped by the menu itself, the co-op lockstep is untouched, no command, nothing in SAVA.
- Five chapters (Traps, Seasons, Market and barter, Rebel camps and envoys, King talents): 14 in all, list rows shrink to fit (18 px at 1280x720), no list at 390x700 (header + previous / next).
- "Play the tutorial game" removed with `playTut` and its key (table, NL / PL / TR, guide.json). 20 new keys (`docs/studio-texts/guide2.json`, v93 block; NL / PL / TR).
- Seen once (headless, `tools/qa_shots.py` steps 10, 13a-13e, 14, 33-35): the 14-row list at 1280x720, the Traps, Seasons (winter), Market, Camps (tribute and event banner) and Talents clips, the 390x700 layout, the Esc menu with its Guide row, the guide over a running game. No page error.
- Tests: `quests` PASS, `det` PASS, `tools/textwidth.py` 43 captions x 9 languages all fit, `textaudit` 0 dead key in the v93 block, `langcheck` 0 missing. `smoke` and `tools` did NOT pass locally: 20 min timeout twice each with an empty log, machine load 8 to 14 on 2 cores; `smoke` on an untouched v92 copy timed out the same way in the same conditions, so the load is the likely cause, not established for `tools`. To rerun on a quiet machine or on CI.
- Not verified: the sounds by ear (no audio in headless), a real GPU / phone, a real two-machine co-op game with the guide open, native proofreading of the new captions.
- Left to the King: sound level and density; the amounts in the clips are examples.

## 2026-11-12 · v93 lot "spearman 2": rebel spearmen, F4 key (hd-gameplay, branch `worktree-agent-ab29372462c98b8a5`, not merged, not released)

- Issue #24, the King: "fait le tout". Decided for him: bonus x1.6 and price stay. Details in `docs/studio-notes/spearman.md` ("Lot 2").
- Rebel camps (`ai/kingdoms.js`, the AI kingdoms and their settlements, the only AI force with knights or archers) now train spearmen: share of the melee fighters by trait, merchants 1 in 4, wary 1 in 3, warlike 1 in 2 (`spearN`, `SPEAR_DIV`), at least 1 from 2 melee fighters on, always 1 knight kept; camp price 30 g 10 w 15 f. Soldier count per camp unchanged. No RNG added, nothing new in `SAVA` (units saved whole, trait on the camp); v92 saves load unchanged. `matBase` (old static camps) is dead code and was left alone.
- Default key of the spearman: `F4` instead of `\` (keys are matched by `e.key`; every letter and every character that is one plain press on both QWERTY and AZERTY is taken). Still rebindable; saved keys that still hold `\` move to F4 once per browser (marker `dk_keyv`), unless F4 is bound elsewhere (`loadKB` in `ui/settings.js`). A bound function key no longer triggers the browser default.
- No text added (so no `docs/studio-texts/spearman2.json`); the spearman texts of v92 are already in NL, PL, TR.
- `det` hashes CHANGED, as expected (a camp trains its first spearman at about 75 s): samples 1 and 2 identical to v92, 3 to 8 differ, the two runs equal. New reference (first field of the 8 samples): 1289907662, 78342706, -1731518221, 1421632697, -2023083426, -766400875, 432483754, 1830404059 (v92: 1289907662, 78342706, -118423406, -488580333, -981978411, -1779167516, -915779825, 103508539). `tools/profile.py` hashes will differ from v92 for the same reason (not run).
- Tests (2 cores shared, load 6 to 14): `det` PASS, `mpk` PASS, `features` PASS, `spearman` PASS (extended: share rule, three grown camps 7k2s / 6k3s / 5k4s with 4 archers each, losses replaced in kind, rebel spearman 17.6 on a brute, F4 queues a spearman, 4 key migration cases). The first `spearman` run of the suite failed on a page load over 180 s (machine load, the base build did the same), not on the test.
- Seen: one picture 1280x720 of a warlike camp, 4 knights and 4 spearmen in the camp colour in line before the keep (`dist/rebel-spearmen.png`, not committed).
- Not verified: `mp8`, `mp_resync`, `save`, `events`, `envoy` with the change (CI will run them); a real AZERTY keyboard; F4 in the Electron launcher and on laptops where F keys need Fn; a long game (camp survival with fewer knights).
- Found, not changed: on AZERTY the digit defaults (peasant 1, knight 2 ... and stances 1 to 4) need Shift, and Shift + digit is taken by the control groups: read in the code only. Proposed: match digit actions by `e.code`.
- Left to the King: the shares per trait; spearmen replacing knights 1 for 1 (or 3 for 2 at equal price); F4 or another key; the AZERTY digits.

## 2026-11-12 · swarm performance, issue #21 (hd-perf worktree, not merged, not released)

- Cause of "36 % instead of 20 %": nothing grew. The same profile on 16526d6 (the commit that wrote "~20 %") gives `swStep` 35.2 %, `swPick` 9.7 %, `swDn` 4.9 % of the simulation, as at v92 (35.0 / 9.2 / 4.7). The 20 % was the share of the whole profile, which is half `(program)` (time outside the page script, not simulation): `swStep` is 17 % of that at v92. In wall time the swarm (everything inside `swUpdate`) is about 70 % of the 6000-tick scenario (26 000 zombies).
- Changed, `gameplay/swarm.js` only, same results: way points of each lane flat in pixels and the lane's castle read once per step (`swLanes`); aim jitter and walking speed from tables built with the same expressions (`SWJ`, `SWV`); `swPick` visits only the set bits of the mask, in the same order; one flag array for units and structures (`UNF` bits 1 and 2, `SNF` gone); local names for the `SW` arrays in `swStep`; `swDn` written inline; `fv1` for a single path field.
- Hashes: the 8 hashes of `tools/profile.py` identical to the baseline taken on b28db24 before the first change, after each step and at the end (11 runs); `det` PASS.
- Numbers, 6000 ticks, same machine, runs alternated, swarm time = time inside `swUpdate` (load 1.1 to 1.8): before 39.6 / 34.6 / 39.5 / 36.2 s in all, swarm 27.3 / 25.3 / 27.4 / 26.0 s; after 37.1 / 32.5 / 32.4 / 29.6 s, swarm 24.4 / 22.5 / 21.3 / 20.8 s. Means: 37.5 to 32.9 s (-12 %), swarm 26.5 to 22.2 s (-16 %).
- Profile shares of the simulation (script time only): before (load 1.4 to 3.5, then 3.5 to 6.3) swarm functions with `fv` 60.3 / 59.1 %, `swStep` + `swDn` + `fv` 43.2 / 40.9 %, `swPick` 9.2 / 8.7 %; after (load 1.3 to 2.2) 56.6 / 57.8 %, 39.4 / 40.8 %, 8.1 / 7.9 %. The share moves little because it is a share: the gain is in the times.
- By step: flat way points alone gave nothing visible in the profile under load (59.3 %); tables + set bits + one flag array + local arrays gave most of the gain (swarm 22.7 s mean over 4 runs); `swDn` inline + `fv1` are within the noise (22.2 s), kept.
- Not done, changes of behaviour (hashes would change, still deterministic), for the King: swarm step at 10 Hz instead of 20 Hz (about half the swarm time, movement drawn by interpolation as today); zombies stepped in cell order (better memory locality, gain not measured); crowd pressure once per tile instead of once per zombie.
- Not verified: the gain in a real browser with a GPU (measured in headless Chromium only), games with other sizes of horde, co-op tests other than `mpk`.

## 2026-11-12 · v92

- Released on the King's go ("sors la v92"): everything merged on release-v84 since v91 (block look, units and buildings B, mutants, last bastion, events, bosses, King XP, research paths, quests solo and co-op with marker, spearman, video guide, leaderboard, Update page, NL/PL/TR complete).
- Notes: `docs/release-v92/NOTES.md` copied to `game/NOTES.md`; 4 pictures retaken in `announce/img/v92/` (the "night" one is in daylight, two show an odd "Next" countdown).
- Verified before release: local smoke, quests, save, mp_convoy, mp_resync, mp_quests (3 of 3 on a fixed world), mp_events (2 of 2), det; the release workflow runs the whole suite.
- Known, not fixed (King: after v92): convoys fail on about 1 pair of sites in 7 (porters stop 6 tiles short, no path at start, or detour over 120 s); proposed fix in `multiplayer/convoys.js` (arrival within ~8 tiles, 120 s without progress). Swarm at 36 % of sim time: performance lot after v92.
- Not established: CI failure of mp_resync on 3e35792; a one-tick unit hash gap after a resync seen once under load in mp_events.
- Defaults kept without an answer: spearman x1.6 and key `\`, guide silent, "Play the tutorial game" kept, PT/DE register, NL plural.

## 2026-11-12 · co-op tests made stable (mp_quests, mp_convoy, mp_events, mp_resync); convoy defect found, not fixed (hd-qa, not released)

- Game defect, NOT fixed (rule decision for the King): a co-op convoy between two valid sites fails in about 1 pair out of 7 (probe `tests/convoy_probe.js`, 36 random pairs 24 to 60 tiles apart: 31 delivered in 10 to 71 s, 5 not). Three ways: porters stop about 6 tiles from the partner's castle with no order left and never come within the 4.6 tiles that count as arrived (2 pairs); no path found at the start, porters stand at home (2 pairs); route so long that the 120 s of `convoyStep` run out (1 pair, another delivered at 120 s). The goods then go back ("The convoy cannot reach your partner"). Zombies are not the cause.
- Smallest fix proposed (`multiplayer/convoys.js`): count a porter as arrived when its path is finished within about 8 tiles of the castle, and make the 120 s a time without progress instead of the whole trip. Both change a rule slightly; `det mp8 mpk mp_convoy mp_quests` to run after.
- `mp_quests`, `mp_convoy`: world and sites fixed (seeded `Math.random` for the roll and the site search, in ONE page call: frames between two calls draw random numbers), sites (1126,624) and (1101,599), convoy delivered in about 10 s. `mp_quests` also compared the stocks of the two machines read a few ticks apart (failed once under load): removed, the per-tick hashes cover them.
- `mp_events` (failed twice on CI): fault of the test, not a time budget and not the game. It required the gold to be exactly unchanged during one second; a peasant bringing 10 gold in broke it (depends on the random site; reproduced locally 1 run in 2). Now a tolerance below the tribute (120). Its hashes are keyed by epoch (a tick replayed after a resync is not compared with the old one) and the epoch is printed; one local run under load 9 showed a unit-hash difference at one tick right after the resync, not seen again in 2 runs: if it comes back the log now says which epoch.
- `mp_resync` (failed once on CI at 292 s = its whole 220 s wait): locally the resync takes 5 to 9 s. The wait needed to SEE the resync flag between two polls; it now also accepts the epoch having moved. Budget unchanged.
- `tools/test_all.mjs`: a failing test prints the last 15 lines of its log (the CI artifact cannot be downloaded).
- Runs on the merged `release-v84` (machine loaded, 5 to 10): `mp_quests` PASS x3, `mp_convoy` PASS, `mp_events` PASS x2, `mp_resync` PASS, `det` PASS (8 hashes identical to the reference). Before the fixes: `mp_events` 3 PASS / 2 FAIL, `mp_resync` 2 PASS.
- Not verified: the cause of the CI failure of `mp_resync` (no log), the convoy defect in a real two-machine game, the next CI run.

## 2026-11-12 · full pass merged, King's choices (branch release-v84, not released)

- Merged: localization pass (NL/PL/TR complete, proofreading, fit fixes) and QA pass (HUD bars vs quest panel, title hint, save test without rendering, mp_quests / mp_events / save in the quick suite).
- King's choices: HAMMERDAWNSTUDIO without a space is wanted; red banners over the quest panel stay; grass tufts lighter (BLADE colours in `rendering/terrain-props-blocks.js`); one research name "Masonry" (was also "Stonemasonry"; keys renamed in sources, translations, NL/PL/TR); swarm performance lot after v92.
- Verified locally after the merges: smoke, quests, save (83 s), mp_convoy, mp_resync PASS; title screen seen with the Masonry hint.
- NOT stable: `mp_quests` failed 2 of 4 local runs at the convoy step (goods returned, 19 other quests paid, no desync). Cause not established (random sites not linked, or a real convoy defect); given back to the QA agent. Logs `dist/mpq_fail/`.
- Not seen by eye: the lighter tufts in game.
- Left before release: stable mp_quests, green CI, the 4 screenshots of `announce/img/v92/`, the King's go.

## 2026-11-11 · localization pass before v92 (hd-localization worktree, text only, not merged, not released)

- Audit (static, new `tools/textaudit.mjs`): 1463 keys, the 414 keys new in v92 checked. FR ES DE IT PT: none missing, `{0}` kept everywhere, no French "tu". Six texts were English only: barter title and message ("Swap 50 wood for stone", "Swapped 50 ..."), "You get N wood / stone / food", "Saving...": added in 8 languages (`docs/studio-texts/localization-v92.json`).
- Removed 9 keys no source uses: 4 from quests lot 1 ("Power", "The long night", two old descriptions), 5 from the old tutorial bar (2 steps, "Tutorial {0}/{1}", "Tutorial: on / off"). Removed 5 v92 copies of keys an older block redefines (the lower block wins: "Exit to desktop", "Co-op", "Best runs", "Tutorial", "Cancel"), no visible change. Table now 1460 keys.
- Dutch, Polish, Turkish are shipped languages (language list, announced): each lacked the 414 v92 keys, now 0 missing (`node tools/langcheck.mjs`), 415 lines added per file.
- 40 corrections in the v92 texts: German "Sie / Ihr" back to "du" in tooltips, "Bollwerk" to "Bastion", Portuguese "Recebes" and "Levanta-te" to the formal form, "zombies" to "zumbis", Italian "zombie" to "zombi", "cancello" to "porta", "accampamento" to "campo", French "Invoquez" to "Appelez", "météorites" to "météores", small typos.
- `tools/fitcheck.py 1280 720 x 9`: 3 overflows, all in the 34-wide peasant task buttons (FR "Construire", PT "3 inativo(s)", PL "3 bezczynnych"). Shortened: "Build" FR "Bâtir", "{0} idle" FR / ES "libres", PT "livres", NL "vrij", PL "wolni". Rerun on FR, PT, PL: 0 (the idle label only shows when peasants are idle at that moment, so a clean run is not proof). fitcheck now takes a language list (`1,5,7`).
- Quest panel, quest log and guide captions (fitcheck opens neither): new `tools/textwidth.py` measures them with Inter Medium outside the browser, 21 quests and 27 captions in 9 languages, all fit. Not looked at in a browser.
- `docs/release-v92/NOTES.md`: "New events" listed blood moons and caravans, both already in v91; line now says wolf packs, eclipses and meteor showers, and that caravans and rebel envoys now ask you to choose. To confirm with the King.
- Not verified: NL / PL / TR texts read by a native speaker; guide chapter list and quest log by eye; "eleven new buildings" and "levels up to 5" in the notes; no gameplay test run (text only).
- To the King: Portuguese mixes European and Brazilian forms (pick one); German lore lines use "Ihr / Euer" while the interface uses "du"; Dutch plural "2 boers" (old keys with `{1}`) is wrong; add `textaudit.mjs` and `textwidth.py` to the tool list in CLAUDE.md.

## 2026-11-11 · full QA pass before v92 (hd-qa worktree, not merged, not released)

- Base `release-v84` d49e027 (CI green on it: quick suite with `mp_resync`, `mp_convoy`). Nothing under `game/` or `announce/`, nothing pushed. Pictures: `dist/qa/shots/` (not committed), tool `tools/qa_shots.py`.
- `save` is NOT slower: alone it took 562 s (tPack 223 s, tLoad 248 s) only because the live loop draws a software-WebGL frame at every `await` of pack / load; with `renderer.render` stubbed the same test gives tPack 1.3 s, tLoad 1.6 s, 91 s in all, `same0` true. `tests/save.js` now stubs it (one real frame after the load). The frames got heavier with the look / block lots, not the save code.
- New test `mp_quests` (2 clients): wood, ore, house, farm, barracks, knights paid to BOTH players at the same tick; 3 + 4 spearmen trained and fighting on both; convoy quest closed by a real delivery (+30 food each); 2940 equal hashes. Passed 2 runs out of 2 after a placement retry was added (a first run failed in the test itself: spot refused by the build rules).
- Quick suite now also runs `mp_quests`, `mp_events` (PASS, was in no suite) and `save` (cheap now). `mp_convoy`: the second site was searched in 300 random tries only (my first `mp_quests` run found none with the same code): 20000.
- Fixed (render / layout / text only, no simulation change, `det` 8 hashes identical to the reference, `profile.py` hashes identical):
  - `ui/hud.js`, `ui/hud-state.js` (`barX`, `qbox`, `barsH`), `ui/quest-panel.js`, `ui/event-bar.js`, `ui/tutorial.js`: with a King, the message line, the caravan / envoy bar and the hint bar covered the right end of the quest panel (Log and x buttons). Wide screens: they move right of the panel; narrow and medium screens: the panel sits under the bars.
  - `ui/quest-marker.js`: the arrow above a building standing behind the quest panel was drawn over its buttons; it goes under the panel.
  - `ui/title-menu.js` + texts: title tip said "Research Stonemasonry in the castle menu"; it is at the Academy (new key, 6 languages + NL / PL / TR, `docs/studio-texts/qa-v92.json`).
  - `rendering/materials.js`: dry-grass strokes back (terrain keeps the `8.5` test); visible only with the block world off.
  - `docs/studio-boards/revamp/cap_boot.py` works again (class `go`, whole `#boot` line). `debug/browser-console.js`: `openGuide`, `guideState`, `openPicker`, `sitePickerState`, `icoPart` for tools.
- Seen by eye (1280x720 unless said): title without / with 10 scores, title 390x700, leaderboard, Update, settings (3 tabs), guide Build / Population / Walls / Research + 390x700, site picker in blocks, day HUD with King bar, quest panel, quest log (20, solo), markers (Build tab, barracks arrow, knight entry, King entry, market, guild, research, envoy, War cry), summer, autumn fog, winter, raid wave 10 with boss bar and caravan, spearmen in a fight (close), night (forced, `qa_shots.py` step 72: lit windows, torches, fireflies), HUD + quest log 390x700, 900x600.
- After the fixes, on the final build: `smoke quests events features tools save det` PASS, `mp_quests` PASS.
- Not verified: night falling by itself (it is driven by the frame loop, forced for the picture), hint bar by eye, quest log with 21 quests (co-op) by eye, far swarm, real GPU, phone / touch, sounds, launcher, `fitcheck` (not run), `mp_resync` / `mp_convoy` locally (CI).
- Profile (6000 ticks, 33.5 s): `swStep` 36 % of the run (CLAUDE.md says ~20 %), `swPick` 9.5 %, `update0` 5 %, `swDn` 4.7 %; swarm functions together ~57 %.
- Left for the King / other lots: NL / PL / TR miss 414 of 1464 texts (English shown; the v92 notes say "more languages"); big red banners ("KING NARAIGE HAS FALLEN") draw over the quest panel for 3 s; marker arrow of a King skill overlaps the top bar numbers; no marker when the building is under the HUD or off screen; grass tufts read as black dots from far (look B); "Masonry" and "Stonemasonry" both used; `HAMMERDAWNSTUDIO` without a space; restyle not started (far-swarm models, projectiles, stone banners, building re-grid).

## 2026-11-11 · video guide merged, old tutorial bar removed, pushed (not released)

- Merged `worktree-agent-aaffcd280bd956aae` (c35fc26): `ui/video-guide.js`, 9 scripted chapters on the menu canvas (no video file), opened by the Tutorial button; `TUTS` / `tutBar` / `TUT` / `dk_tut` and the Settings line removed, `hintBar` kept. Conflicts: journal and translations (both sides kept). Agent's entry below, notes `docs/studio-notes/guide.md`.
- Agent: `smoke quests det tools` PASS on its merged branch, det hashes unchanged. After this merge (with spearman): build, push, CI.
- Left to the King: rename or remove "Play the tutorial game", sounds in clips, guide from the Esc menu, more chapters.
- Next: the full pass asked by the King (test everything, improve everything), then his go-ahead for v92.

## 2026-11-11 · spearman merged and pushed (not released)

- Merged `worktree-agent-a32a61bc6cb6d6ef9` (93d2b76, b667670), no conflict. Unit `spearman` at the barracks: 85 HP, 11 dmg / 1 s, reach 36, x1.6 against brute and boss, 90 gold 30 wood 25 food, 15 s. Agent's entry below, notes `docs/studio-notes/spearman.md`.
- Agent on the merged result: `det features spearman quests mp8 mpk` PASS, det hashes unchanged by the unit. New test `spearman` in the quick suite. CI on the branch was green at 7f37d07 (timeout raised to 100 min).
- Not verified: title screen with the new pikemen, spearmen in co-op, `save` / `smoke` / `mp_resync` after merge (CI runs the quick suite).
- Left to the King: bonus 1.6 or 1.4, default key `\` (awkward on AZERTY), spearmen for rebels and AI, price and HP.
- Still running: video guide (also removes the old tutorial bar).

## 2026-11-11 · lancier (spearman): nouvelle unité jouable, allumée, non fusionnée, non livrée

- Demande du Roi: « oui tu peux creer le lancier » (les piquiers de l'écran titre n'existaient pas en jeu). Branche de worktree hd-gameplay, rien dans `game/`, rien poussé. Détail, tableau et mesures: `docs/studio-notes/spearman.md`.
- Unité `spearman`, caserne, dès le début: 85 PV, 11 dégâts / 1 s, portée 36 (chevalier 14: frappe par-dessus le premier rang), x1,6 contre brute et boss (`SPEAR_BIG`), 90 or 30 bois 25 nourriture, 15 s, 1 population. Pas de bouclier, pas de règle spéciale contre l'acide (moins de PV suffit).
- Courbe: par ressource contre les zombies ordinaires il vaut moins que le chevalier (13,2 contre 11,0 par DPS), par tête il vaut moins contre tout; meilleur seulement par ressource contre les brutes. Duels mesurés dans les notes.
- Câblage: règles, `hit()`, rang de formation, menu caserne, infobulle, panneau des troupes, carte d'unité, raccourci `\` réassignable, icônes, brouillard, zombie converti. Entraînement par la commande `buy` existante (co-op sans nouvelle commande); unités sauvées entières, rien dans `SAVA`.
- Look: `px2Spearman` (chapel de fer, jaque matelassée à la couleur du royaume, col, baudrier, couverture roulée) et lance `g2Spear` (palette gear2, pennon à la couleur du royaume); animation du hallebardier (estoc, lance droite au repos, inclinée en marche). Écran titre: les blocs de piques sont ces lanciers avec cette lance (`pikeGeo()` supprimé).
- IA et camps rebelles inchangés exprès: aucune lance dans la partie par défaut, hachages `det` identiques à la base.
- Textes: 8 clés en 6 langues (`docs/studio-texts/spearman.json`). Nouveau test `spearman` (`tests/spearman.js`, ajouté à la suite rapide).
- Vérifié avant fusion (branche seule): `det` (8 hachages identiques à la base d'avant quêtes), `features`, `mp8`, `mpk` (2e passage; le 1er a expiré au chargement, machine chargée), `save` (same0 vrai), `spearman` PASS; 3 captures 1280x720 (combat, menu caserne, carte d'unité).
- Vérifié après fusion de `release-v84` (quêtes, 3 conflits: journal, traductions, `tools/test_all.mjs`, les deux côtés gardés): `npm run build`; `det features spearman quests mp8 mpk` (résultats: `dist/spear/tests4.txt`); hachages `det` identiques à ceux de `release-v84` avec quêtes (ils ne diffèrent de l'ancienne base que par l'état des quêtes, pas par le lancier); une capture du combat.
- Non vérifié: `save` après fusion (SAVA non touché), `smoke` (build compressé), `mp_resync`, fitcheck, vrai GPU, mobile, lanciers en co-op à l'œil (aucun test co-op n'en forme), écran titre non regardé (piquiers changés de modèle), NL/PL/TR en anglais pour les 8 textes.
- Au Roi: bonus x1,6 contre les brutes (ou 1,4), touche `\` par défaut, lanciers chez les rebelles / royaumes IA (changerait les hachages `det`), galons de grade, prix.

## 2026-11-11 · guide vidéo derrière le bouton Tutoriel, ancienne barre de tutoriel retirée (branche hd-menu-ux, non fusionné, non livré)

- Demande du Roi: « make the tutorial more like a video guide ». Le bouton Tutoriel (T) du titre ouvre un écran lecteur (`ui/video-guide.js`, nouveau): 9 chapitres à gauche, « vidéo » à droite (légende, barre de progression, précédent / pause / suivant, enchaînement automatique). Détail, tableau des chapitres, reste à faire: `docs/studio-notes/guide.md`.
- Les clips ne sont pas des fichiers vidéo: scènes 2D scriptées sur le canvas du menu (320 x 180, fonction pure du temps), icônes des vrais bâtiments (`IC`/`ICT`) et sprites tirés ici des vrais modèles d'unités posés par `animUnit` (89 petits rendus, par tranches de 10 ms à l'ouverture). Rien ne touche la simulation: unités jetables hors `sessionState`, horloge murale, `Math.random` remplacé par `REALR` pendant les rendus.
- Décision du Roi: les quêtes remplacent l'ancienne barre de tutoriel en 5 étapes. Retirés: `TUTS`, `tutStart`, `tutEnd`, `tutBar` (`ui/tutorial.js` ne garde que `hintBar` et ses 3 astuces), l'appel dans `ui/hud.js` et `gameplay/reset.js`, `TUT` (`gameplay/traps.js`), la ligne « Tutoriel » des Options, la clé `dk_tut` (aussi dans `tools/announce_shots.py`). « Jouer la partie guidée » ouvre seulement Nouveau royaume.
- `release-v84` (quêtes) fusionné dans la branche; conflit dans `i18n/translations.js` (deux blocs v92), les deux côtés gardés. Textes du guide: 31 clés (`docs/studio-texts/guide.json`).
- Vérifié après fusion et retrait: `npm run build`; `npm test -- smoke quests det tools` ALL PASS (853 s, 275 s, 416 s, 474 s); les 8 hachages de `det` identiques à `dist/test-logs/det.log` du dépôt principal (18:59, release-v84 avec quêtes); captures 1280x720: guide (5 chapitres regardés en tout: Récolter, Former une armée, La nuit et la horde, Le Roi, Coop), en jeu (panneau de quête, plus de barre « Tutoriel 1/5 »); captures 390x700 et 760x360 du guide; `__ovf` vide; légendes: 27 x 6 langues mesurées hors navigateur avec Inter 500, aucune ne déborde (420 et 182 sur 2 lignes, 360 et 240 sur 1 ligne, colonne de 130 et 110).
- Taille du build compressé: +17 752 octets pour le guide (704 592 -> 722 344 mesuré avant la fusion des quêtes); 735 084 après fusion et retrait (base avec quêtes non remesurée).
- Non vérifié: vrai GPU, vrai téléphone, tactile, manette, clavier dans le lecteur (Gauche / Droite / Espace); 4 chapitres non regardés en image (Construire en 1280, Population, Murs et tours, Recherche); `rg` ne trouve plus aucune référence retirée, mais les traductions des 5 anciennes étapes restent dans la table; `tools/fitcheck.py` n'ouvre pas le guide.
- Incident: en nettoyant après un délai dépassé, j'ai tué par erreur le navigateur headless d'un autre agent (`docs/studio-boards/banner/cap.py sheet,small`), signalé au lead.

## 2026-11-11 · quests lot 3 merged: button marker, mp8 test fixed (not released)

- Merged `worktree-agent-a42328e0c65a6fedd` (50f526a): `ui/quest-marker.js`, render only (gold pulse + arrow on the button of the active quest, or on what opens it). Agent's entry below.
- `mp8` failure after lot 2 explained: the test sent the `qs` switch after the kingdom had fallen (lockstep stopped); the test now sends it before the wave and waits on ticks. Agent: `quests det mp8` PASS, `det` hashes unchanged.
- After merge: build and push; GitHub runs the quick suite on the branch.
- Left: remove the tutorial bar (after the video guide), spearman, full pass. King may want a stronger marker on tabs.

## 2026-11-11 · v92 mega update announcement drafted (not released)

- The King: prepare the mega update announcement with everything pushed since the GitHub cut, sent the way the system does at the next update.
- `docs/release-v92/NOTES.md` rewritten (look, new to play, comfort); `README.md` there says how it ships (copied to `game/NOTES.md`, posted by `release.yml` through `tools/announce.sh` with `announce/img/v92/`). Old `announce-v92.md` draft removed (duplicate).
- Before release: confirm bullets for spearman, video guide, quest marker (in progress), retake the 4 screenshots (they predate the new looks), King's go-ahead after the full pass.

## 2026-11-11 · quêtes lot 3: repère sur le bouton à presser (branche hd-gameplay, non fusionné, non livré)

- Demande du Roi: un repère visuel sur le bouton de la quête active. `ui/quest-marker.js` (nouveau, affichage seul): contour or qui pulse + petite flèche qui rebondit, sur l'entrée du menu, sinon sur l'onglet ou la catégorie qui l'ouvre, sinon flèche au-dessus du bâtiment à cliquer. Table quête -> cible dans `docs/studio-notes/quests.md`.
- Crochets: une ligne dans `drawItem` et `drawTabs` (`ui/build-menu.js`), une dans `kingBar` (`gameplay/king-skills.js`), appel depuis `questLog` (`ui/quest-panel.js`); `ui/hud.js`, `ui/tutorial.js`, `ui/title-menu.js` non touchés. Aucun texte nouveau.
- Choix: repère visible même panneau replié; caché si quêtes éteintes, F10, fin de partie, pause, carte, journal ouvert. Pas de repère sur les ressources (récolte) ni sur le camp rebelle.
- `mp8` (échec vu par le coordinateur après fusion du lot 2): cause = la partie était finie (`over` vrai, château tombé) quand le test envoyait la commande `qs` en fin de test; le lockstep ne tourne plus, la commande ne s'exécute jamais. Ni la charge ni la commande. Test corrigé: bascule envoyée avant la vague, attente sur les ticks (invité coupe: vu après 19 ticks; hôte rallume: 8 ticks).
- Vérifié: build; `quests`, `det` PASS, hachages `det` identiques à release-v84 (journal du dépôt principal); `mp8` PASS; 3 captures 1280x720 (`dist/qs/m1.png` onglet Build, `m2.png` entrée Maison, `m3.png` bouton Chevalier).
- Non vérifié: flèche au-dessus d'un bâtiment (non capturée), boutons du Roi, marché, guilde, recherche, convoi (même mécanisme, non regardés), écrans étroits / tactile, co-op à l'œil.

## 2026-11-11 · quests lot 2 merged, HUD bars fix (not released)

- The King decided: quests in co-op too, quests replace the tutorial bar, adjust amounts, add market / guild / siege / envoy.
- Merged `worktree-agent-a42328e0c65a6fedd` (a171c46): 21 quests in 7 chapters (20 solo, convoy is co-op only), shared line in co-op, switch is the lockstep command `qs`, quest state in the lockstep hash, `SAVA.QST` v2 by id. `det` hashes changed (expected). Agent's entry below.
- Fixed in `ui/hud.js`: `objBar`, `kingBar`, `tutBar`, `hintBar` were inside the raid block (`WAVEZ>0`) since the module migration, so shown only during a raid; brace moved, they show all the time again. Not seen by eye yet.
- Not done yet: unhook the old tutorial bar (list in the agent's report: `ui/hud.js`, `gameplay/reset.js`, `gameplay/traps.js`, `ui/settings.js`, `dk_tut`) after the video guide merge.
- `save`: same0 true but 20 min 12 s under load (tPack 430 s, tLoad 562 s), over the 1200 s limit; to re-measure on a quiet machine.
- Tests after merge: `dist/merge_tests12.txt`.

## 2026-11-11 · GitHub back, branch pushed (not released)

- The King: GitHub is up again; keep the repository organised by folders as it is, no `html` folder.
- Checked: top level of `release-v84` equals `main` (`packages/ apps/ docs/ game/ announce/ tests/ tools/ .github/`) plus `.claude/agents/` (15 studio agents). Only HTML tracked outside review boards: `packages/game/index.html`, `apps/desktop/src/launcher.html`. `dist/` stays untracked.
- Pushed `release-v84` (179 commits) to `origin/release-v84`. `main` untouched: no release, no Discord (those workflows run on `main` only); the test workflow runs on the branch.
- Open: `save` test fails locally at the 1200 s limit with an empty log after the quests merge (direct run without limit in progress, `dist/save_direct.txt`).

## 2026-11-11 · quêtes lot 2: co-op, marché, guilde, siège, envoyé (branche hd-gameplay, non fusionné, non livré)

- Décisions du Roi appliquées: quêtes aussi en co-op, les quêtes remplacent la barre Tutorial en 5 étapes, montants / ordre / noms revus, quêtes marché, guilde, siège, envoyé (+ convoi, co-op seulement). 21 quêtes en 7 chapitres (20 en solo). Tableau et règles: `docs/studio-notes/quests.md`.
- Co-op: une seule ligne partagée, évaluée dans le tick, récompense payée aux DEUX joueurs (comme `objectives.js`), une partie co-op démarre toujours quêtes allumées. Interrupteur = commande lockstep `qs` (`questSwitch` dans `commands.js`, `case 'qs'` dans `mpExec`). État des quêtes ajouté au hachage lockstep (`mpHashX`).
- État: `SAVA.QST` v2, par identifiant (`d:{id:1|2}`), plus par indice. Sauvegarde du lot 1 (indice sur 16 quêtes) migrée par identifiant dans `qFix`; sauvegarde sans quêtes = quêtes éteintes (inchangé).
- Écran co-op: panneau à gauche 38 px sous la barre du haut, ligne des objectifs co-op centrée sur la première rangée: jamais sur la même rangée.
- Barre Tutorial: `ui/tutorial.js` et `ui/title-menu.js` non touchés; les 5 étapes sont couvertes par les quêtes 1, 2, 3, 6, 8, 9; liste de ce qu'il faut décrocher dans les notes.
- Textes: 18 clés de plus dans le bloc v92 (`docs/studio-texts/quests.json`).
- Tests: `tests/quests.js` étendu (nouvelles quêtes, migration lot 1, co-op sur une machine: mêmes hachages deux fois, commande, instantané); `tests/mp8.py` compare l'état des quêtes des deux clients et envoie la commande depuis l'invité; `tests/mp_resync.py` corrompt aussi l'état des quêtes. Résultats: `det features mpk mp_resync quests save` PASS (same0 vrai), `mp8` PASS après correction de ma comparaison (compteurs lus à des ticks différents). Capture co-op 1280x720 avec les deux barres: `dist/qs/coop.png`.
- Trouvé, non corrigé: dans `ui/hud.js` les barres `objBar`, `kingBar`, `tutBar`, `hintBar` sont dans le bloc `if(wavesState.WAVEZ>0...)` (accolade fermée après `hintBar`, depuis la migration en modules a022204): elles ne s'affichent que pendant un raid. Décision au Roi / coordinateur.
- Non vérifié: `smoke`, `mp_convoy`, `mp_events`, `mp_kxp`, `fitcheck`, écrans étroits, autres langues à l'œil, quête convoi en vrai co-op à deux châteaux.
- `det`: les 8 hachages changent (il tourne avec `MP.on`: +20 or de la quête bois, et l'état des quêtes est dans le hachage); les deux passes restent identiques.

## 2026-11-11 · quests merged (not released)

- Merged `worktree-agent-a42328e0c65a6fedd` (commit c3d0612): 16 solo quests in 6 chapters, state in `SAVA.QST`, panel top left, log, Settings > Game switch. Details in the agent's entry below and `docs/studio-notes/quests.md`.
- Agent verified: build, `quests` (new, in the quick suite), `det`, `features`, `mp8`, `save`. After merge: see `dist/merge_tests11.txt`.
- Left to the King: quests in co-op or not, keep the 5-step tutorial bar or not, amounts / order / names, quests for market, guild, siege, envoy.
- Still running: video guide (`aaffcd280bd956aae`), spearman (`a32a61bc6cb6d6ef9`). After them the King asked for a full pass: improve and test everything.

## 2026-11-11 · bannière C (gonfanon sur mât) fusionnée et allumée (réponse du Roi « 1C 2C 3C »), non livré

- `BANNER2='C'` dans `rendering/banner-icon.js`: petite icône (HUD, sauvegardes) et grande bannière (carte du royaume). `npm run build:release` fait, build de test republié.
- Non relancé: tests (aucun fichier de simulation touché). Reste: bannières de pierre 3D sur l'ancien dessin, emblème illisible à 16 px, or sur or peu contrasté (`docs/studio-notes/banner.md`).

## 2026-11-11 · liste du Roi: Update, carte Leaderboard, 3 agents lancés (bannière, quêtes, guide vidéo), non livré

- Liste du Roi (GitHub suspendu, donc pas d'issues): « What's new » -> « Update »; leaderboard en carte séparée sous la carte du haut avec aperçu du top 10; icône de bannière à refaire façon porte-étendard; tutoriel façon guide vidéo; quêtes pour guider les nouveaux joueurs; « où sont les lanciers du menu en jeu ? ».
- Fait: `ui/title-menu.js` (libellé et titre « Update », texte ajouté via `docs/studio-texts/update.json`; carte Leaderboard sous la carte de saison, autant de lignes que la place le permet jusqu'à 10, clic = écran complet; `topRuns()` partagé avec l'écran). Vérifié: une capture 1280x720 avec 11 scores factices (10 lignes affichées). Non vérifié: écrans étroits/bas, fitcheck, tests non relancés (interface seule).
- Lanciers: décor de l'écran titre seulement (`rendering/models/title-army.js`, chevaliers avec une pique), aucune unité lancier en jeu. Question posée au Roi: créer l'unité ou les retirer du titre.
- Agents en worktree (rien fusionné): bannière (planche `docs/studio-boards/banner/`), quêtes (`gameplay/quests.js`, `docs/studio-notes/quests.md`), guide vidéo (`ui/video-guide.js`, `docs/studio-notes/guide.md`).

## 2026-11-11 · icône de bannière façon porte-étendard: planche A/B/C/D, interrupteur éteint (non fusionné, non livré)

- Demande du Roi: « i'm still not happy about the icon for banner rework the banner maybe something more like the bannerman ». Branche de worktree hd-design, rien dans `game/`, rien poussé.
- `rendering/banner-icon.js` (nouveau): `BANNER2=''` (défaut = image actuelle), 'B' étendard du porte-étendard, 'C' gonfanon sur mât, 'D' bannière murale; sprites 24x36 qui suivent couleur, 2e couleur, motif et emblème (16 emblèmes redessinés en 11x11). Deux lettres = petite puis grande image ('DB'). HUD, liste des sauvegardes et carte Nouveau royaume passent par `bannerIcon()`.
- Planche `docs/studio-boards/banner/board.html` (3 lignes + référence du porte-étendard en jeu), `rows.json`; détail et constat: `docs/studio-notes/banner.md`. En attente du code du Roi.
- Vérifié: `npm run build`; 24 captures du jeu sans erreur (4 variantes x 3 royaumes sur Nouveau royaume, sauvegardes, HUD, 16 et 32 px); feuille des 16 emblèmes x 3 variantes regardée une fois. Interrupteur éteint: `bannerIcon()` rend le canevas `BANNER` lui-même, mêmes rectangles.
- Non vérifié: `npm test` (aucun fichier de simulation touché), vrai GPU, mobile, co-op. Non traité: texture 3D des bannières de pierre (reste A), pastilles d'emblème du menu (vectorielles), emblème or sur motif or peu contrasté.

## 2026-11-11 · quêtes pour guider un nouveau joueur (branche hd-gameplay, non fusionné, non livré)

- Demande du Roi: « add quest in game to guide new player ». 16 quêtes en 6 chapitres, une active à la fois: bois, pierre et or, maison, ferme, caserne, 2 chevaliers, 2 archers, 6 murs + porte, tour, 3 pièges, vague 1, académie + recherche, Roi, compétence du Roi, vague 5, vague 10. Liste, récompenses et règles: `docs/studio-notes/quests.md`.
- Code: `gameplay/quests.js` (état `questsState.Q`, `qBegin`/`qTick` dans l'enveloppe `update` de `statistics.js`), `ui/quest-panel.js` (panneau en haut à gauche, journal des quêtes, bouton replié), petits crochets dans `hud.js`, `reset.js`, `save-format.js` (`SAVA.QST`), `restore.js`, `settings.js` (ligne Quests On/Off), `input/desktop.js` (Échap ferme le journal). `ui/tutorial.js` et `ui/title-menu.js` non touchés.
- Décisions: solo seulement (`qTick` ne fait rien si `MP.on`), rien en mode test F10, ancienne sauvegarde sans `QST` = quêtes éteintes. Récompenses au total 540 or, 120 bois, 40 pierre, 80 nourriture (avant la vague 1: 130 or, 120 bois, 40 pierre, 30 nourriture).
- Textes: 54 clés dans le bloc v92 (`docs/studio-texts/quests.json`), 6 langues; NL, PL, TR retombent sur l'anglais.
- Vérifié: `npm run build`; `quests` (nouveau test, dans la suite rapide), `det`, `features`, `mp8` PASS; les 8 hachages de `det` identiques à ceux du dépôt principal (`det` tourne avec `MP.on`, les quêtes n'y bougent pas); `save` PASS (same0 vrai, sameCont faux connu). Deux captures 1280x720 (panneau, journal) dans `dist/qs/`.
- Non vérifié: `mpk`, `mp_resync`, `smoke`, `fitcheck`, écrans étroits et tactile, les 5 autres langues à l'œil. Machine partagée très chargée: plusieurs tests ont dû être relancés (délai de chargement de page).
- Reste au Roi: quêtes en co-op ou non, garder ou retirer la barre Tutorial en 5 étapes (double emploi), montants, ordre.

## 2026-11-11 · monde en blocs look B fusionné et allumé (réponse du Roi « 1B … 9B »), non livré

- Le Roi a répondu 1B à 9B (planche blocs): branche fusionnée, `blocksState.on=true` par défaut (`rendering/blocks.js`), BLK=DBLK=0,5, terrain, décor, textures bâtiments et saisons allumés.
- Rendu seulement, simulation intacte. Tests après fusion: smoke det tools mp8 mpk ALL PASS (`dist/merge_tests10.txt`); une capture du village avec mutants, armes et blocs allumés, sans erreur; build de test republié.
- Reste (`docs/studio-notes/blocks.md`): géométrie des bâtiments non reconstruite en blocs (gros lot), arbres B plus grands (cachent plus les unités), écran titre et choix du site non regardés, vrai GPU, traits d'herbe sèche coupés depuis le lot bâtiments (correctif d'une ligne décrit, non fait).

## 2026-11-11 · armes et outils look B fusionné et allumé (réponse du Roi « 1B … 15B »), non livré

- Le Roi a répondu 1B à 15B (planche armes, 12 lignes + 3 vues d'armée): branche fusionnée, `GEAR2_ON='all'` (`rendering/models/gear-style.js`).
- Conflit de fusion dans `rendering/unit-instances.js` (clé de cache: mutants `m` + `gearSig()`), résolu à la main.
- Tests après fusion: smoke det mp8 mpk mp_resync, résultat dans `dist/merge_tests9.txt`; build de test republié. Détail et reste à faire: `docs/studio-notes/gear.md` (projectiles, armes des morts-vivants, baliste, trébuchet, icônes non refaits).
- Planche blocs toujours en attente du code du Roi (non fusionnée).

## 2026-11-10 · mutants look B fusionné et allumé (réponse du Roi « 1B … 8B »), non livré

- Le Roi a répondu « 1B 2B 3B 4B 5B 6B 7B 8B »: branche fusionnée, `MUT2_ON='all'`, `npm run build:release` fait.
- Tests après fusion: smoke det mp8 mpk ALL PASS (`dist/merge_tests8.txt`). Build de test republié (artifact de test).
- Reste: nuée lointaine (ancien aspect pour momie et coureur), yeux/lueurs de nuit non regardés, cadavres, brute +54 % et boss +72 % de triangles, vrai GPU.
- Planches armes/outils (`gear`) et blocs (`blocks`) prêtes dans leurs worktrees, non fusionnées, en attente des codes du Roi.

## 2026-11-10 · mutants en monstruosités: planche A/B, interrupteur éteint (historique)

- Demande du Roi: « améliore les mutants pour ressembler à des monstruosités ». Branche de worktree hd-model, rien dans `game/`, rien poussé.
- Look B des 6 mutants + boss dans `rendering/models/mutants.js`, interrupteur `MUT2_ON` (`mutant-style.js`, défaut '' = rien ne change). Détail, coûts, reste à faire: `docs/studio-notes/mutants.md`.
- Planche: `docs/studio-boards/mutants/board.html` (8 lignes: brute, coureur, artificier, cracheur, mineur, momie, boss, horde), `rows.json`. En attente du code du Roi (« 1B 2A ... »).
- Vérifié: poses repos/marche/attaque, triangles (6 mutants +17 %, scène horde +5,1 %, draw calls identiques), `npm test -- det smoke` (voir notes). Non traité: nuée instanciée lointaine (garde l'ancien aspect), nuit, co-op.

## 2026-11-10 · monde en blocs derrière un interrupteur éteint (non livré, planche en attente du Roi)

- Demande du Roi: terrain, bâtiments et décors sur une seule taille de bloc, façon Minecraft. Étude et mesures: `docs/studio-notes/blocks.md`. Bloc retenu: 0,5 unité (2 blocs par case, unité = 1,7 bloc, 16 pixels par bloc); alternative 1/3.
- `rendering/blocks.js` (nouveau): `blocksState` (éteint par défaut), parties `terrain`, `decor`, `build`, `seasons`, `setBlocks()`, localStorage `dk_blocks`. Terrain: mêmes colonnes et hauteurs, textures de blocs dans le shader, falaises fusionnées, liseré d'herbe, chemins en blocs, eau en pixels. Décor (`terrain-props-blocks.js`, nouveau): arbres, rochers, minerai, buissons en voxels fusionnés par chunk, plantes sur la grille de pixels, tout choisi par hachage de position. Bâtiments: seule la densité de texture change (18 -> 32 px par unité), modèles intacts. Saisons: neige et automne dessinés sur les blocs.
- Vérifié: `npm run build`; `npm test -- det smoke` PASS (det 436 s, smoke 1110 s); listes de hachages `det` identiques octet pour octet entre release-v84, cette branche interrupteur éteint et cette branche interrupteur allumé. Coût: appels de dessin inchangés (154 village, 199 carte entière), triangles -34 % (village) et -41 % (carte entière), construction des chunks pas plus lente.
- Planche `docs/studio-boards/blocks/board.html` (9 lignes), codes dans `rows.json`. Rien à fusionner avant la réponse du Roi.
- Reste: re-grille de la géométrie des bâtiments (non contenue, décrite dans les notes), contrôle sur un vrai GPU, co-op à l'œil. Régression probable notée (pas corrigée): depuis le lot bâtiments, l'id matière 9 (chaume) coupe les traits peints de l'herbe sèche du terrain.

## 2026-11-10 · logo Hammerdawn 1C appliqué, armes/outils en cours (non livré)

- Planche `docs/studio-boards/hds/` (gen.py): le Roi a répondu « 1c » (soleil uni + 4 rayons + marteau droit). Appliqué aux calques de la carte d'intro (`packages/game/index.html`), animations inchangées. Ligne 2 (écriture du nom) sans réponse: nom laissé tel quel.
- Vérifié: build:release, une capture de l'intro. Tests non relancés (HTML de l'intro seul). Icônes desktop et favicon non changés.
- Agent hd-model en cours: revamp armes/outils, planche `docs/studio-boards/gear/`, interrupteur par défaut éteint, rien à fusionner avant la réponse du Roi.

## 2026-11-10 · armes et outils look B derrière un interrupteur (planche gear, non fusionné, non livré)

- Demande du Roi: « revamp tout les armes / outils pour harmoniser le tout ». Interrupteur `GEAR2_ON` (`rendering/models/gear-style.js`), '' par défaut: rien ne change en jeu tant que le Roi n'a pas répondu.
- Look B (`rendering/models/gear2.js`): une palette commune, épées (chevalier par niveau de recherche, capitaine, Roi), hallebarde, arc, 3 boucliers, 4 outils du paysan, charges portées, hampe d'étendard, canon. Détail et non-traités: `docs/studio-notes/gear.md`.
- Planche: `docs/studio-boards/gear/board.html` (12 lignes + armée A/B), `rows.json` (ligne -> clés).
- Vérifié (interrupteur éteint): `npm test -- det smoke` ALL PASS; les 8 hashes de `det` identiques à `release-v84` (base reconstruite à part). Scène de 157 unités: 348 draw calls en A et en B, 494 688 -> 494 420 triangles.
- Non vérifié: temps de frame sur vraie carte graphique, `det` avec B activé (rendu seul), écran titre et icônes avec B, co-op. Non traités: projectiles (cubes instanciés), objets cuits dans les skins B des unités, armes des morts-vivants.

## 2026-11-10 · retours du Roi sur le build de test: son, intro, classement (non livré)

- « Plus de son »: non reproduit en headless (musique mesurée ~-25 dBFS sur le titre, rendu neutralisé). Cause probable: ancien `dk_vol` bas ou `dk_snd=0` + nouvelle courbe au carré + -11 dB. Correctif: `TRIM` .285 -> .45 (+4 dB), remise à zéro unique de `dk_vol`/`dk_snd` (clé `dk_aud=2`). À confirmer par le Roi.
- Carte Claude: jouée dans la sonde (`tools/bootprobe.py`); un clic pendant l'intro la sautait. Maintenant un clic ne saute plus, 2e clic ou Échap/Entrée/Espace saute.
- Son sans clic: impossible dans un navigateur; launcher Electron: `autoplay-policy=no-user-gesture-required` (non testé).
- Records -> Leaderboard: top 10 local en premier, nom du royaume enregistré dans `dk_sb` (`n`). Pas de classement en ligne (pas de serveur).
- Note: le build compressé charge three.js depuis un CDN; les sondes doivent le router en local (comme `bootprobe.py`).

## 2026-11-10 · bâtiments et unités look B fusionnés (Roi: tout B), non livré

- Bâtiments: textures 3-4 tons, fenêtres éclairées la nuit, niveau bois distinct, fumée, 10 bâtiments refaits (`docs/studio-notes/buildings.md`). Unités: `UV2_ON='all'` dans `rendering/models/unit-style.js` (`docs/studio-notes/units.md`).
- Vérifié sur l'arbre fusionné: smoke det tools features mp8 mpk mp_resync ALL PASS (`dist/merge_tests6.txt`). Build de test republié.
- Non vérifié: coût sur vrai GPU (+5 % et +3,5 % de triangles), icônes de menu et écran titre avec les nouveaux looks, 7 cartes d'unités non relues, fitcheck.
- Reste: pièges, échafaudage, canon, armes/boucliers, nuée au loin non traités; réponses du Roi sur l'audio.

## 2026-11-10 · audio refait, planches bâtiments et unités publiées (non livré)

- Audio fusionné: lancement -11 dB (compresseurs sans rattrapage, limiteur, fondus, défauts 0,55), 7 thèmes variés, effets à hauteur/timbre variables, plafonds de voix, sons de menu; son d'onglet branché dans `kitTabs`. Détail: `docs/studio-notes/audio.md`. Aucune écoute humaine.
- Vérifié sur l'arbre fusionné (intro + audio): smoke det mp8 mpk mp_resync, voir `dist/merge_tests5.txt`. `tools` non relancé depuis le correctif d'intro.
- Build de test republié (artifact FibK3cKvLVe3mSuJDUb49d).
- Planches publiées (index + batiments.html + unites.html sur l'artifact des planches), NON fusionnées: branches `worktree-agent-a67e365d50939b80a` (bâtiments) et `worktree-agent-adc00a47b23dd80ba` (unités, types choisis à mettre dans `UV2_ON`, `docs/studio-boards/units/rows.json`).
- À trancher par le Roi: niveau sonore, remise des curseurs au nouveau défaut, thème triomphe et silences; codes des deux planches.

## 2026-11-10 · intro de lancement dégelée, emblèmes annulés, build de test (non livré)

- Intro: le démarrage était une seule tâche synchrone et l'intro comptait en horloge murale, donc finie avant d'être vue. `core/boot.js` découpe `main.js` en tranches de 30 ms; cartes en `transform`/`opacity`, lancées à la première image peinte; rideau ouvert quand le titre dessine. Détail: `docs/studio-notes/boot.md`.
- Sous `navigator.webdriver` le démarrage reste synchrone (les tests ne couvrent pas le vrai chemin; `tools/bootprobe.py` le force).
- Vérifié (branche agent): build, build:release, det PASS (hashes inchangés). NON vérifié: smoke et tools (dépassement, machine chargée) à relancer; vrai GPU, iframe claude.ai, launcher.
- Refonte des emblèmes et propositions de logo refusées par le Roi (1A..5A): commits annulés, logo actuel gardé. En attente: ce qui manquait.
- Build de test: artifact FibK3cKvLVe3mSuJDUb49d (séparé du jeu officiel). `cap_boot.py` du board revamp ne capture plus la carte (classe `go` requise).
- En cours (agents): audio, unités (planche), bâtiments (planche). Les planches ne se fusionnent pas avant la réponse du Roi.

## 2026-11-10 · refonte fenêtres de lancement, menus, logos, animations (non livrée)

- `ui/menu-kit.js` (gabarit plein écran), `menu-fx.js`; titre en lobby (Play + mode, pastilles L/T/O, carte version/saison), tous les écrans de lancement, Réglages, Esc, fin au gabarit; logo NARANXIA en blocs, carte Hammerdawn, favicon; animations sur horloge murale, coupées par Reduce motion.
- Vérifié (branche agent): build, det tools smoke, fitcheck TOTAL 1 (connu). Arbre fusionné d'avant la refonte: det smoke events mp8 mpk mp_resync ALL PASS. Après refonte: tests relancés (dist/merge_tests4.txt), fitcheck à refaire avec les 17 nouvelles clés.
- Planche avant/après publiée (docs/studio-boards/revamp). Non testé: tactile réel, manette, launcher, Esc en co-op. Icônes desktop .ico/.icns non refaites.

## 2026-11-09 · menus du Roi (1B 2B 3C 4B 5B 6B 7C 8C) appliqués, non livrés

- Double filet doré, boutons plaques, pied de page Back/Select, titre en cadre avec braises, choix du mode en 3 cartes, fiche de détail unité/bâtiment, onglets à icônes + NEW (`dk_newslots`, jamais dans la sim ni la sauvegarde), onglets en PageUp/PageDown (Q/E déjà pris).
- Bug corrigé: `hud.js` `const L=menuItems()` masquait `L()` (« L is not a function » à la sélection d'une unité).
- Vérifié (branche agent): build, det tools smoke, captures. fitcheck TOTAL 1 (« Construire » FR dans un slot peasant, déjà présent). 63 clés ajoutées. À faire: textes d'ambiance relus par hd-lore, tests mp8 mpk mp_resync events sur l'arbre fusionné, fitcheck.
- Rien poussé (GitHub suspendu).

## 2026-11-09 · look du Roi (1C 2C 3B 4B 5B) appliqué, non livré

- Liseré doré + coins pixel, troupes en cartes par type, slots Build icône+coût, titres en Pixelify Sans (repli Inter), écran de fin en 3 niveaux. UI seulement. Vérifié: build, det, smoke, fitcheck 0. Reste: tests mp8 mpk mp_resync après fusion, police hors ligne réelle.

## 2026-11-09 · lots design / qualité / simplicité (non livrés, v92 en préparation)

- Corrections qualité fusionnées; kit Discord (anglais) et `tools/announce.sh` (embed + images, dry-run seulement); images d'annonce v92 dans `announce/img/v92/` (minimap noire, barre du Roi absente sur 03).
- Menus: Esc à 4 boutons, tutoriel 5 étapes, réglages 3 onglets, raccourcis ponctuation masqués, Build: niche masquée avant académie/vague 1, boutons maison/ferme/mur, `UIT` + `focusRing`.
- Planche de look publiée (docs/studio-boards/look), en attente de la réponse du Roi. Aucun changement de look appliqué.
- À vérifier: erreur « L2 is not a function » en sélectionnant le Roi; tests det smoke events mp8 mpk relancés après fusion (dist/merge_tests.txt).
- Rien poussé (GitHub suspendu).

## 2026-11-09 · model variants cleaned, scout/engineer/envoy in pixel layer (local, not released)

- Deleted refused variants + `window.__MV` (model-variants.js, unit-variants.js); units.js / bastion-buildings.js back to the pre-variant behaviour for king, guard, buildings. `pxScout`, `pxEngineer`, `pxEnvoy` added in royal-skins.js (B silhouettes). Visual only.
- Verified: build, `det` PASS, showshot front/back of the 3 units; bbox tops sit under the bar height (scout h 16, engineer 16.4, envoy 16). Not run: smoke.

## 2026-11-09 · Remaining workshops merged (v92, not released)

- Research exclusive paths (Steel/Mail, Fire arrows/Boiling oil, Crop rotation/Better tools; `RS2.ch`, Iron age after either of Steel or Mail), market fatigue (`FAT` in SAVA, sell floor .80, barter .85), envoy tribute -25 % per visit with per-camp caps (700 gold, 350 food).
- Events with a choice (caravan: take now or escort for x2.5 after 40 s; rebel envoys: accept or refuse for renown +10 %/point): `gameplay/events.js`, `ui/event-bar.js`, command `ev` in mpExec, state `EVT` in SAVA, first click decides in co-op, default after 30 s of sim time. Rebel camp traits (merchant x1.5 tribute, warlike +25 % horde hp, wary first envoy turned away) by pure hash of seed and camp id.
- King XP and talents: state on the king unit (`kxp`, `kt`, `kdr`), levels 1-5, 8 talents in 2 branches, command `kt`.
- Touch (44 px hit margin, long press tooltip, camera and cancel buttons) and colour-blind shapes/colours; animation LOD tried and dropped (gain below noise, see perf.md).
- Conflicts in 6 files resolved by combining both sides; events test fixed (envoy decay reused on the same camp).
- Verified: det events envoy research kingxp market features smoke compat save mp8 mpk mp_resync mp_kxp mp_events all PASS. fitcheck of the new texts started, touch/long-press and the colour-blind minimap shapes not tried by hand.
- Left: release v92 when GitHub is back (drafts in docs/release-v92, to update with the new features), recolour selection rings and zombie eyes for colour-blind mode, a fatigue indicator on market buttons.

## 2026-11-08 (night) · King's board answers applied (v92, not released)

- Answers "1A 2A 3B 4A 5A 6A 7A 8B 9A 10A 11B 12X 13B 14X" (X = keep current): palette, team colours and seasons unchanged; unit bars = 10 pixel segments with bevel (`drawBars` in ui/hud.js); knight plume red, archer/tower/barracks icons already match A; team skin = full tabard; rank stripes 0-3 (min(3, xp/4), knight and archer, player team, model rebuilt on rank change, `u.mrk`); scout, engineer, envoy use model variant B (`MV_DEFAULT` in rendering/models/model-variants.js); king, guard, bastion buildings unchanged.
- `tools/run.py` now serves the fonts offline (fontroute), it hung on Google Fonts before.
- Verified: det, smoke PASS after the merge; one screenshot shows the segmented bars. Not seen: rank stripes and tabard in game (small, shield hides the knight's left arm), scout/engineer/envoy variant B in game.
- Left: delete the refused model variants and the `window.__MV` selector (model.md step 1-3: pixel-texture the scout/engineer/envoy), release when GitHub is back.

## 2026-11-08 · Studio agents merged (v92, not released)

- Hammerdawn Studio: 15 agents in `.claude/agents/hd-*.md`, guide `docs/STUDIO_AGENT_GUIDE.md`, org chart + game-structure map (units, buildings, research, enemies, events, links) in artifact PiQPNmRtfsp8cFWuKDs2BS (view button "Structure du jeu", data from rules.js).
- Merged 11 agent branches (no conflicts): coop audit (ruins loot timer was not deterministic, fixed), menu-ux (colour-blind mode `dk_cb`, 3 one-time hints), animation (hit flash/recoil, construction scaffold, visual only), lore (boss legends, realm journal `JRN` in SAVA, 4 Chronicle fragments), audio (11 synthesized sounds), gameplay (market barter x*, wave preview `wave-preview.js`, tests/market.js), localization (L() fixes, 45 texts), model (variants via `window.__MV`, off by default), perf (no measurable cost of new features, hashes identical), community notes.
- Texts merged with addtexts (lore 17, menu-ux 5, gameplay 17, localization 45); "Waves survived: {0}" fixed by hand. A merge replaced `node_modules` by a self-looping symlink committed by an agent: untracked, `.gitignore` now ignores the symlink, `npm ci` redone.
- Verified locally: det market compat ruins envoy bossabil mp8 mpk mp_resync features smoke PASS. Not run: fitcheck (new texts), screenshots of colour-blind mode / scaffold, listening to sounds.
- Waiting for the King's choice on 3 review boards (not published yet): design (palette, team colours, bars) in docs/studio-boards/design, texture (7 rows) in docs/studio-boards/texture, model (4 rows) in docs/studio-boards/model. Answers like "1B 2C".
- Not done: market fatigue, envoy gain cap, event choices, King XP/talents (need new SAVA counters). GitHub account suspended: nothing pushed, ~60 local commits on release-v84.

## 2026-11-07 · Design refresh: glass UI, Inter, cool light (v92, not released)

- Waiting list DONE: rebel envoy (T/C/TRAIN envoy g80 f20 12 s, trained at the castle once an embassy is owned, hp45 spd120 vision 14; sim loop in simulation.js: within 8 tiles of an alive rebel base (BASES) and base.envT free -> +80+8*wave gold, +40+4*wave food, envoy consumed, base cooldown 300 s; model approved by eye only, white-robe diplomat with flag, board not used); ruins now have 3 looks by variant (pillar court, broken arch, tower stump), board published (1 row A/B/C, answer pending: keep one or mix). Tests: envoy (new, quick suite), det features mp8 mpk mp_resync pass; ruins/compat/save passed before the looks. NOT run: fitcheck, save after envoy. Visual note: envoy flag is thin edge-on from the front.
- Ruins DONE (King chose 'ruines seules'; world camps are disabled in code so no envoy): `RUINS` map in world/terrain.js (mkRuin per chunk, >=48 tiles from castle, 20% of chunks, flat 3x3 spot, pure hs hashing so world gen is unchanged), saved in SAVA; gameplay/ruins.js loots once when a player unit comes within 2.5 tiles (3 loot kinds by variant, amount 40+0.8*distance, embassy not applied, English message); rendering/ruins.js placeholder model (slab, 4 broken pillars, chest that disappears when looted), synced in render3D. Debug globals RUINS/ensureAround/hudDisplayState. tests/ruins.js in the quick suite. Screenshot checked once. NOT done: rebel envoy unit (needs camps), minimap marker, ruin art board (placeholder look), translations of the message.
- Events lot 2: wolf pack (wave 7 then every 9th: extra fast runners on every lane, hp +3%/wave, banner) and eclipse (wave 8 then every 11th: living zombies +15% hp, +40+8*wave gold per player, embassy x1.5), in waves.js, seeded rnd only. Messages English like the other events. Still queued: ruins to explore, rebel envoy unit. Tests: see next entry.
- Save compatibility: `svMigrate` (persistence/save-format.js) never rejects a save by version; chain `SVMIG` (key = version upgraded FROM) is where a future format change goes, with `SVVER` bumped; newer saves load as far as understood. `svFix` drops units/structs of unknown types, fills hp/x/y/buff/cd, clears dangling garrison refs; `svApply` resets const SAVA containers missing from an old save. Used by svApply and co-op resync. `tests/compat.js` (quick suite): old/newer/no version, unknown key, missing keys, ghost unit type, missing hp. RULE for new fields: must tolerate being absent. Unpushed (GitHub suspended).
- Units lot 1 DONE (models approved 1A 2A; tools were floating: AE z is the CENTER of the box, fixed): scout (g40 f20, barracks, spd 155, vision 26 tiles, weak melee) and engineer (g70 w40 s20, castle, repairs own buildings within 3 tiles at 12 hp/s, dmg 2). New test tests/bastion.js (in the quick suite): 10 buildings placed, orchard food, sanctuary heal, sappers + engineer repair. det features bastion mp8 mpk pass; mp_resync + save passed for lots 2-3 before the units. Not run after units: mp_resync, save. Rebel envoy still waiting (needs camp interactions). Queue: eclipse/wolves, ruins.
- Bastion buildings lot 3 DONE (models approved 1A-4A): royal forge (s100 g80, troops +8% damage, combat.js), embassy (w80 g100, caravan + event gains x1.5), war room (w90 s60 g60, training x1.15 speed), sappers' workshop (w70 s40, buildings within 8 tiles regain 2 hp/s). Helper bastionHas(p,type) in economy.js (cached per tick). Menu: forge+war room in Town, embassy in Economy, sappers in Defense. det features mp8 mpk pass. Not run: save, mp_resync; effects and menu layout (Town now 9 entries) not seen in play. Next in queue: units (engineer, scout, envoy), eclipse/wolves, ruins.
- Chronicle fragments: 4 extra lore paragraphs unlocked by best wave (5, 10, 20, 30), 'Reach a higher wave to read more.' while some stay locked; EN/FR/ES/DE/IT/PT. Checked by screenshot with best wave 12 (5 and 10 shown). Queue (docs/IDEAS.md + task list): buildings lot 3, units without duplicates (engineer, scout, envoy), eclipse/wolves, ruins.
- Bastion buildings lot 2 DONE (models approved 1A 2A): watch beacon (w40 s60, light radius 12, vision 20, in Defense) and orchard (w60, +2 food every 6 s without a peasant, in Economy). det features mp8 mpk pass. Not run for lot 2: save / mp_resync (same mechanism as lot 1, which passed); effects and placement not observed in play.
- Chronicle page (title menu, bottom pill next to 'Join a game'): 4 lore paragraphs (last bastion, King Naraige, rebel camps), translated EN/FR/ES/DE/IT/PT. Page checked by screenshot; the pill position at 1280x720 not seen (headless entry fade) and not checked on narrow screens (fitcheck not rerun).
- Events + lore: wave events in waves.js (every 6th wave from 4: rebel envoys tribute gold+food; every 7th from 5: meteor shower, stone), 3 new title taglines (last bastion, rebel camps, last light). mp_resync + save pass with the bastion buildings; det mp8 features pass after the events. Events are resource gifts only (messages English, like the caravan). Still not built: eclipse, wolves, units, ruins, kingdom journal.
- Bastion buildings lot 1 DONE (models approved 1A 2A 3A 4A): observatory (w60 s80, vision 30 tiles), granary (w70 s20, +4 pop cap), alarm bell (w50 g30, troops within ~8 tiles attack 15% faster), sanctuary (s90 g60, heals troops nearby). In menu: granary under Economy, the other three under Town. No hotkeys yet. det features mp8 mpk pass. Seen in game: placement + menu counts; effects not observed in play, mp_resync / save round trip not run. Unverified: icons in the menu for the new types.
- Bastion buildings lot 1 (draft): models only (rendering/models/bastion-buildings.js: observatory, granary, bell, sanctuary, registered in sGeo, not buildable yet). Board published for the King's choice; next: costs, menu, icons, effects, translations, tests once he answers. Dist/bastion has the previews.
- Content 1: named wave bosses (BOSSN in ai/wave-boss.js: Hollow Warden, Bell-Bearer, Frost King, Hive Queen; name on the boss bar, index in unit.bn). det + features pass. Lore chosen by the King: Naranxia = last bastion of humanity, AI kingdoms = rebel camps (docs/IDEAS.md). New buildings/units need a model board first (art direction rule), then one batch each with det/mp8/mpk.
- QoL 2: right-click a queued unit icon = cancel + full refund (command 'cq', co-op safe); hover tick sound on buttons; co-op ping (pg/pr, shows 'slow connection' above 250 ms); F8 also copies a short summary to the clipboard. det mp8 mpk mp_resync pass. Not covered by tests: cancel itself, hover sound. Skipped: select-all-of-type (double-click already does it), tooltips (already show shortcuts), loading transition, last-mode memory, auto-reconnect.
- QoL (Settings > Game, prefs in localStorage via core/prefs.js): pause when tab/window is away (solo, default on), autosave every 3 min to slot 'Autosave' (solo), reduce motion (skips intro, stops logo shimmer), studio intro first launch only. smoke + det pass. Already existed: UI size, alerts, pings, chat, control groups, Continue first. Not done: co-op latency indicator, F8 copy button, tooltips/shortcuts, select-all-of-type, queue right-click cancel, loading transition, hover sound.
- Buttons: glass look (translucent body, top gloss, light rim + dark hairline, soft shadow, base under tinted ones). Checked on Settings only.

- The King chose on the review board: 1A glass buttons/frames, 2A top bar, 3A build tiles, 4A title, 5A Inter, 6C cool world light (rows in `dist/board/spec.json`).
- `ui/drawing.js`: `frame()` now draws dark glass (soft shadow, 1 px light edge, cyan accent on hover/confirm, teal/red tints); slots, tooltips, chat/top bar restyled; `arcDeco` removed; selection ring cyan.
- Fonts: Inter 500-800 (Google Fonts link, `@fontsource/inter` for tests via `tools/fontroute.py`) replaces Cinzel/Marcellus/NaxNum in canvas (`ui/typography.js`), co-op CSS, boot; `naranxia-numerals.woff2` deleted. `fontOf` sizes retuned (.88 body, .8 heading).
- `rendering/lighting.js`: sky `0xb9d2ee`, sun `0xe6f0ff`, intensities x1.19 sun / x1.06 hemi.
- Verified: build, title + in-game screenshots, no page errors. NOT verified: fitcheck (running), det/mp tests (visual-only change), title logo look (headless clock too slow), co-op window look.
- Launch polish: splash in dark blue/cyan with white logo and cyan bar (`styles/boot.css`), title logo white/cyan, entry sequence logo .1-.8 s, menu .4-1.1 s, hints/pills 1-1.6 s (`ui/title-menu.js`), duplicate 'Naranxia' label removed, title scene hemisphere light 1.15. Checked on a virtual-clock filmstrip (`launch.py`, scratchpad); the real-time fade lengths were not measured (headless clock is slow). Splash bar is indeterminate (no load progress hook).
- Studio intro as 2 cards (studio 2 s, then 'Made with Claude' 1.9 s, any key/click skips): hammer-and-dawn mark + HAMMERDAWN STUDIO (HDS) + PRESENTS + 'Made with Claude' (text only, localized FR/ES/DE/IT/PT via navigator.language in index.html), then the NARANXIA splash; hideBoot waits for it (frame-loop.js). Checked with a paused-animation screenshot.
- Launch order now: studio card, Claude card, title (NARANXIA splash removed at the King's request; boot hides at 4.9 s).
- 2nd intro card now plays the Lottie the King supplied (Claude logo + wordmark; wordmark recolored light for the dark card): `ui/intro-claude.js` (lottie-web light, bundled), `assets/claude-intro.json`; frames 0-100 at 1.4x, card 2.9 s, splash delayed to 4.9 s; falls back to text if Lottie fails. Verified frame by frame in an isolated page; full-boot timing not measurable headless. Check Anthropic brand terms before shipping.
- LIGHT THEME, then narrowed by the King ('pas sur le fond du menu mais sur les boutons'): only BUTTONS, tiles and slots are translucent white; panels, top bar, tooltips, title veil, pause veil and co-op window stay dark glass; the intro cards stay white. Button text is dark via a per-frame list of button rectangles (`btnAdd/btnReset/inBtn` in `ui/typography.js`, `btnReset()` called in frame-loop after the 3D render); text outside buttons keeps its light colors. Earlier wording of this entry (whole UI white) is superseded:
- (superseded) LIGHT THEME: `LIGHT` flag + `ink()` in `ui/typography.js` maps UI text colors to dark inks (used by `T_`, `TTL`, `TN`, hud); `frame()`/slots/tooltips in `ui/drawing.js` are translucent white glass with blue accent (transparency kept as in the dark glass); title veil white, logo navy with white outline; intro cards on white with the original black Claude wordmark; co-op overlay overridden in `styles/coop.css`. Set `LIGHT=false` for the text mapping only (frames are hard-coded light). Checked: title, HUD, settings, language screens. NOT checked: build sub-menus, save menu, records, convoy/troop panels, tutorial popups, co-op window, fitcheck, boss/raid labels drawn directly on the world.
- Left: 3D units/buildings polish (second board), unpushed (GitHub suspended), release v92 with NOTES.md.

## 2026-11-07 · Text never spills out of buttons (v92, not released)

- The King: nothing may overflow a button, in every menu and language. `fitSc()` (language.js) shrinks a label to fit (min .45), used by `pill` and `langBtn`; `TCf()` shrinks then ends with an ellipsis (build tiles: name, Done / Free / Locked / Masonry, costs down to .34); `uiBtn` clips its content to the button and reports any text that still sticks out (`setClipBox` in `T_`); HTML buttons of the co-op window wrap (`#mp button` CSS).
- `tools/fitcheck.py [W H x N]`: one headless page per language, walks title, records, notes, language list, 4 settings tabs, then in game (HUD, build menu, pause menu, troop panel F2, test mode F10, map) and the co-op window; prints overflows (`window.__ovf`). Result: 0 overflows in 9 languages at 1280x720, 700x420 and 360x640 (title/settings only for 360). Catching a real case: German build tile "Steinmetzkunst" / "Sammelpunkt: Bu" was cut, now fits / ends with an ellipsis. Not covered: build sub-menus (Defense, Economy...), convoy dialog, save menu, tutorial popups.
- Still to do from the "yes" for the 6 other languages: turn the sentence fragments joined in code into whole-sentence keys with {0} (about 60 sites in build-menu.js, waves.js, desktop.js, lobby.js...), then RU, UK, JA, ZH, KO, AR (RTL).

## 2026-11-07 · Menu polish, public lobby, languages (v92, not released: GitHub access suspended)

- Asked by the King ("tout" + "un lobby pour voir toutes les parties publiques"). Menu: tip of the day (a tutorial line, by day), key / pad hint line (`padOn()`), season diamond before the weather label, time-of-day tint + stars on the title (real clock, UI only), first-launch language from `navigator.language` (never saved, the picker still wins), keyboard nav also in the solo pause menu (Space ignored in game, off in co-op), "Records" panel (best, last run, top runs from `dk_sb`).
- Public lobby, 100% peer to peer (the King: no server of ours): `multiplayer/registry.js`. The first player who opens the lobby claims the PeerJS id `nrx-hub-1` and becomes the hub (list of open games in memory, 40 s TTL); others connect to it, ask `{k:'list'}`, hosts announce `{k:'pub'}` every 15 s and `unpub` on connect / reset; if the hub leaves, the next one claims the id. Only code, host name and version travel; the game itself is joined with its room code as before. UI in the co-op window: "Public games" list with Join, "List my game in the public lobby" checkbox on Host. `loadPeer` / `peerConfig` exported from `connection.js`.
- Lobby: host checkbox now says "Private game: only with the code" / "Public game: listed in the lobby" (lock / globe); title screen has a "Join a game" pill (opens the co-op window on the code field).
- Languages: Dutch, Polish and Turkish complete (`i18n/langs/`, `node tools/langcheck.mjs`). RU, UK, JA, ZH, KO, AR not done: sentence fragments joined in code and Arabic RTL need code work first.
- Verified: build, langcheck 0 missing, menu nav by state (`NAV.sel`), P2P lobby end to end with a local PeerJS broker and two browsers (hub lists, host publishes, both see the game), screenshot of the title (FR auto, night). Also verified with the local broker: Join from the list connects both players; hub hand-over (hub page closed, the host's announcements get no `ack` within 6 s, it reconnects and claims the hub id, a new player then sees the game; takes up to ~1 min). Not verified: the real PeerJS cloud broker, gamepad hardware, the pause-menu nav in a real game.
- Limit: the hub is a player's page, so the list is empty/short when nobody is online; release v92 (VERSION, NOTES.md) when GitHub is back.

## 2026-11-07 · Launch splash (v92, not released: GitHub access suspended)

- New launch: `#boot` splash in `index.html` + `styles/boot.css` (dark ember sky, gold NARANXIA logo, shimmering bar), shown by the HTML before any script runs (the page used to flash light blue), faded out by `hideBoot()` in `core/frame-loop.js` after 4 frames of the title scene; then the logo fades in (0.5 to 1.4 s) and the menu after it (1 to 1.9 s) in `ui/title-menu.js` (`ent`/`ease`, globalAlpha, title only, in-game menu unchanged). No new texts.
- Verified: build, splash alone (screenshot), title mid-entrance (screenshot), splash element removed after load, no page errors. Not verified: real browser load time on a slow network, touch devices.

## 2026-11-06 · Title screen, menu and settings (v92, not released: GitHub access suspended)

- Asked by the King ("guide moi", answers: season and weather, Continue first, tabs): title screen shows the season and weather of the last game over the army scene (`ui/title-weather.js`, 2D particles: rain, fog, snow, petals, pollen, leaves; last wave stored in `localStorage dk_last` by `saveBest`; `wxKindFor(w)` exported from `rendering/weather.js`).
- Main menu: Continue (newest save, `svPeek` / `continueLast` in `ui/save-menu.js`) first when a save exists, then Singleplayer, Multiplayer, Load game, Tutorial (clears `dk_tut`), then one row Options / Sound / Language; "Last game: wave N - K zombies slain" and the season label under it. In-game menu unchanged.
- Settings in 4 tabs: Game (language, tutorial on/off, King skill keys), Graphics, Sound, Controls. 7 new texts in 6 languages (v92 block).
- Verified: screenshots 1280x720 (title with snow / autumn leaves / spring petals, Continue with a forced save, Game tab). IndexedDB does not work from file:// in the headless browser, so Continue was checked with a forced `saveMenuState.last`. Not verified: FR/DE text widths, small screens, touch, real desktop launcher.
- Not committed to a release: no NOTES.md bump and no version change yet; release when GitHub is back.

## 2026-11-06 · CI, tooling and save investigation (#5)

- `mp_convoy` budget raised to 400 s (it failed twice on the slow CI runner only); Chromium cached in CI; new `tools/profile.py` (CPU profile of 6000 sim ticks). The swarm (`swStep`) is already tuned: hoisting closures gave no measurable gain.
- `tests/save.js` now pauses the live loop during pack/load (it skewed `sameCont`). #5 root cause found, not fixed: `svEncode` skips `zf zft _tc pfS` (SVSKIP); after a load `u.pfS` is undefined so `movement.js` resets `pfB` (stuck detection), and worker paths drift from tick ~20-50 on. Terrain and cosmetic fields are not the cause. Fix idea: save the path field key of `pfS` and rebind it after load. Harmless for players.
- GitHub answered "account was suspended" (403) at the end of the session, so the #5 comment with this analysis is not posted yet: post it when access is back.

## 2026-11-06 · Source migration

- Replaced the numbered script fragments and tracked HTML bundle with domain ES modules, styles, and assets in `packages/game`. The Electron workspace is under `apps/desktop`.
- Build and test commands run from the npm workspace. Release CI publishes the browser artifact from the successful test job.
- Verified the v91 browser suite and repeated all four co-op scenarios with strict test setup. The archived and modular title and in-game captures matched pixel for pixel at 680×420.
- Loaded an archived v91 save in the modular build and matched the original state fingerprint. Mixed archived and modular peers delivered both convoys on the same ticks and matched all 554 sampled hashes.
- Built Windows and Linux Electron packages and checked the offline installation and save handlers with isolated profiles. The macOS build matrix remains in CI, since the Windows test host could not create the package symlinks.

## 2026-11-06 · v91

- All 13 ideas of the King (issues #6-#18) in one batch, "tout ensemble". Removed by him: events, day/night cycle, co-op roles, difficulty modes. Added by him: seasons with weather.
- Seasons and weather (`23_weather.js`, #6): season = 4 waves, weather fixed per wave from a hash of waveN, rain/snow/petals/leaves particles, thunder, sounds, top-bar label; visual and audio only (terrain colours are baked, so the season tints light, sky and fog).
- Boss every 10th wave (`25_boss.js`, #7), King skills on `<` and `>` (`27_king_skills.js`, #8, co-op command `ks`), spike traps + Boiling oil + Iron age (`28_traps.js`, #9, #12: Iron age is stats only, no building look change, no palisade, no 3rd tier look), co-op goals (`26_coop_goals.js`, #11) and typed pings Alt/Shift/Ctrl (#10).
- Stats, records by map and the `update` wrapper in `24_stats.js` (#18, #13: records are local, three best runs per seed, no online board), tutorial (`29_tutorial.js`, #16), touch layer (`30_touch.js`, #17: key rebinding already existed), hit sparks and construction dust (#14). Music (#15) already had calm / night / battle modes: only added winter bells and an autumn pluck.
- New test `features` (tests/features.js). Verified locally: det, features, tools PASS, screenshots of the HUD (boss bar, king buttons, tutorial, typed pings), the end screen and snow; mp8, mpk and save PASS too (solo save round trip same0). GitHub runs smoke, mp_resync and mp_convoy before the release. Left: real devices for touch, visual check of the ping label, Iron age look, spike pits as a palisade variant, online leaderboard (needs a server).

## 2026-11-06 · v90

- The whole restyle shipped (issues #1, #2): the King chose castle A (square fortress, now also the wooden tier via `pxCastleA(true)`),
  textures on buildings kept (he answered only "A"; taken for both boards). The wip patch was merged into `src/game/` with
  `wip/restyle/restyle.py` run on the joined parts (markers), result identical to the preview build (cmp). Toggles left in the code:
  `PXON` (const true), `window.__KV` (king, default B), `window.__CV` (castle, default A), `window.__ZOLD` (old zombies).
- Verified locally: det PASS, tools PASS, one in-game screenshot (wooden castle A, terrain, units). GitHub runs the rest before releasing.
- CI: the release run passed every test and published v90; the parallel standalone run failed mp_resync once (slow runner, J=2):
  its time budget raised from 120 to 220 s in test_all.sh. Watch it.
- wip/restyle is now history: do not run restyle.py again on src (its strings are already replaced).

## 2026-11-06 · restyle round 4: buildings (wip, not released)

- Buildings are already block-built; round 4 adds Minecraft block textures in the matV surface shader (restyle.py `PXSH`, not on
  terrain: `#ifndef TERR`): 18 pixels per tile, stone = staggered bricks with mortar, wood = planks with butt joints, per-pixel noise,
  painted ink lines at 30%. No geometry change, no cost on the CPU.
- Board version 3: A with textures / B without. He answered that the castle needs redoing (dislikes its design): two new stone castles
  in `sets_units2.js` (pxCastleA square fortress, pxCastleB great keep; `castleGeo5` patched, window.__CV picks), board version 4 (A/B, C = old).
  Waiting for his choice (and A/B for the textures); the wood castle (tier 0) will follow the chosen design; then ship the whole revamp (rounds 2-4) in one release, credit bugbilly.

## 2026-11-06 · restyle round 3 (wip, not released)

- Pixel capes (king cape + cape2 velvet and ermine with gold crown medallion, captain team cape with gold sun and hem, guard red cape
  with team collar and gold sun) via `pxCapes` before `fin()` in mcModel; the bannerman's banner as one 20x30 Minecraft banner over the
  three chained cloth pieces (`pxBanner`: gold border, fleur-de-lis, swallow tail); `pxCannon` (bronze barrel with rings, plank
  carriage, iron-tyred wheels, balls); the swarm (swGeoV) takes the zombies' green tint (`pxZg`), geometry unchanged. Knight cape, plumes, pole, pennant: old.
- Board updated (same URL, version 2, rows 1-3). He moved on to buildings without remarks: taken as approved. Then buildings (#2), then ship everything in one release.

## 2026-11-06 · restyle round 2 (wip, not released)

- The King said "Go pour le revamp" (issue #1). New pixel-skin builders in `wip/restyle/sets_units2.js`: king (A face + beard + crown,
  B royal helm + crown), captain (gilded breastplate, red sash, open bascinet, gold pauldrons, chevron shield, gilded sword), bannerman
  (kettle hat, gambeson, cross tabard), gunners (gunner2 keeps the old ramrod), zombies (same zSpec variety and MUTX proportions as before,
  skins pulled toward Minecraft green), royal sword. `restyle.py` now reads `sets_skin.js` + `sets_units2.js` (no embedded copy).
- Board published: https://claude.ai/artifact/HsTZDU2YgpyBYxceCBFiJr (rows 1-8, code like "1A 2A ..."). Approved the same night, no remarks: king B (helm + crown, now the default), everything else as shown.
- Not done yet: capes, banner, cannon, swarm crowd, buildings (#2). Ship only when the whole set is approved; credit bugbilly for the shield.

## 2026-11-06 · v89

- Batch 4 of the King's list of 2026-11-02 (the list is now complete): troops panel (F2 / army button, units by type and task,
  click to select), peasant tasks (Wood, Stone, Gold, Farm, Build in the peasant menu, `assignJob`), co-op convoys (castle menu >
  Co-op > Send: porters carry gold / wood / stone / food to the partner, dots on the map, refund after 120 s), Fire arrows research
  (Academy after Fletching: zombies burn 3 s, 6 + 0.2 x wave dps; swarm hits x1.35), selection label and unit names translated.
- Tools asked by the King ("met tout en place, consomme le moins possible, garde en mémoire chaque action"):
  `src/game.js` split into `src/game/00..22` (packed build byte-identical, checked with cmp), translations one per line + `tools/addtexts.py`,
  bug report F8 (+ Esc menu button) and `tools/repro.py` (loads the save in 1 s with the renderer stubbed), test mode F10 (solo, blocks achievements),
  `tools/test_all.sh`, GitHub CI `test.yml` (release.yml waits for it), `tools/release.sh`, `tools/ci_status.sh`, `tools/board.py`, this journal,
  GitHub issues as the backlog (labels + templates), CLAUDE.md "Working efficiently".
- Verified locally: smoke, det, tools, mp8, mpk, mp_resync, mp_convoy all PASS; convoy: 2 porters, 60 wood + 30 stone each, delivered at ticks 698 / 745
  on both machines, porters home, 1331 hash checks equal.
- CI: ubuntu-latest became 26.04, unsupported by Playwright 1.56 -> test.yml pinned to ubuntu-24.04. The first v89 release run was blocked by that,
  re-run by hand (release.yml now has workflow_dispatch, and posts on Discord only for a new release) -> all green, release v89 out,
  the CI build equals the shipped file. Local suite on the 2-core agent box takes ~25 min (smoke 274 s, tools 288 s, mp* ~200 s each): let CI run it.
- Artifact https://claude.ai/artifact/QrDKDMuFAotHdCus8kQiz5 updated to v89. The King saved the `/naranxia` skill (session start + batch routine).
- Left: restyle of king, captain, bannerman, gunner, zombies, then buildings (issues #1, #2). Second player's placement and invisible
  buildings were never reproduced (identical in a real 2-client lobby test): waiting for an F8 report (#3, #4). Save/load continuation differs (#5).

## 2026-11-05 · v88

- Co-op automatic resync: hash mismatch -> host freezes, sends its save in 48 KB chunks ('rs0'/'rs1'), guest loads, then host loads the same
  snapshot (`mpResApply`, seeded Math.random during the load), lockstep restarts at a new epoch (`MP.ep`); banner "Co-op: resynchronizing...".
- Desync cause fixed: zombies / AI units took `pl` from CURPL (differs per machine), now `pl:t===0?CURPL:0`.
- Verified: mp_resync RESULT OK (resync in 7-9 s), mp8 / mpk no divergence, det same.

## 2026-11-05 · v87

- Castle turned with R while placing (door check `castleRotAt`), partner's castle visible in the live picker (ghost, beam, name tag, cursor),
  distance rule reduced to "castles must not overlap" (`sitesFar` >= 10 tiles), castles no longer sink (`smChunk` keeps the pad height),
  units use ramps (`canStep` / `canStepZ`, TFL 1 levelled 2 miner 3 player-made), double click selects all buildings of a type + group upgrade,
  tower / castle range ring on click, "Quit game" (and "Exit to desktop" in the app), co-op version check, AI kingdoms and hordes treat both castles alike.
- Decisions: public repo; "versions directes"; CLAUDE.md + headless tests + release workflow with Discord post.

## Before v87 (restyle track, unreleased, in wip/restyle)

- Approved by the King: armour of knight / royal guard / archer / peasant in the Minecraft-skin style; knight shield B (Minecraft shield);
  royal guard shield "blason 1" (red pale, gold crown and sun); voxel halberd; shield pressed on the forearm (SHZ 1.35).
- Credit "Minecraft Shield" by bugbilly (CC BY 4.0) in the release notes when the shields ship. Never copy third-party models (crimson heir: style only).
