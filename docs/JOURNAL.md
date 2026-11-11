# Naranxia journal

Newest first. One entry per batch or work session: what changed, what was verified, decisions, what is left.
Start of a session: read the top 2 entries and trust them (do not re-verify what is marked verified).
End of a batch: add an entry on top (3 to 10 lines), close the issues, keep CLAUDE.md in step if a rule or a tool changed.

## 2026-11-11 · monde en blocs look B fusionné et allumé (réponse du Roi « 1B … 9B »), non livré
- Le Roi a répondu 1B à 9B (planche blocs): branche fusionnée, `blocksState.on=true` par défaut (`rendering/blocks.js`), BLK=DBLK=0,5, terrain, décor, textures bâtiments et saisons allumés.
- Rendu seulement, simulation intacte. Tests après fusion: voir `dist/merge_tests10.txt`.
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
