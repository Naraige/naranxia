#!/usr/bin/env python3
"""Writes board.html (before / after, one row per screen) from the captures in this folder. A = before (release-v84), B = after."""
from pathlib import Path
D=Path(__file__).resolve().parent
ROWS=[('title','Écran titre (lobby)','Bouton Jouer biseauté sous la bande du mode, boutons à pastille de touche, carte version / saison / Nouveautés, bandeau d\'astuce, logo en blocs, lueur de feu.'),
 ('modes','Choix du mode','Cartes à coches ; le mode courant est cerclé d\'or. Cliquer une carte la choisit, son bouton lance tout de suite.'),
 ('setup','Nouveau royaume','Même gabarit, gros bouton vert « Choisir le site ».'),
 ('saves','Charger une partie','Lignes avec bannière, étiquette de vague, date ; Charger / Supprimer dépliés sous la ligne choisie.'),
 ('lang','Langue','Lignes pleine largeur, coche sur la langue active.'),
 ('chronicle','Chronique','Sections, texte qui défile (molette, clavier, doigt) au lieu de rétrécir.'),
 ('records','Records','Sections Record / Dernière partie / Meilleures parties.'),
 ('notes','Nouveautés','Liste à puces qui défile.'),
 ('settings0','Réglages : Jeu','Onglets biseautés, sections, valeurs à droite.'),
 ('settings1','Réglages : Affichage et son','Curseurs et choix sur la ligne.'),
 ('settings3','Réglages : Touches','Liste qui défile, pastilles de touche.'),
 ('esc','Menu Échap','Même gabarit sur un voile sombre ; Échap revient au jeu.'),
 ('end','Écran de fin','Voile rouge sombre, cadre à coins ornés, titre doré, boutons biseautés. (Fond de capture : la scène du titre.)'),
 ('boot','Intro Hammerdawn Studio','Marteau et aube en pixel, bleu nuit et or. (Avant : carte blanche, logo au trait bleu ; pas de capture.)'),
 ('favicon','Favicon','N en blocs (nouveau : il n\'y en avait pas).')]
P=[('B390_title','Titre 390x844'),('B390_modes','Modes 390x844'),('B390_saves','Charger 390x844'),('B390_settings0','Réglages 390x844'),('B390_settings1','Affichage et son 390x844')]
h=['<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Naranxia - revamp menus</title>',
 '<style>body{margin:0;background:#0b1020;color:#ece6d8;font:15px/1.45 system-ui,Segoe UI,Arial,sans-serif}main{max-width:1500px;margin:0 auto;padding:18px}h1{color:#f0cd73;font-size:24px;margin:6px 0}h2{color:#f0cd73;font-size:17px;margin:26px 0 4px}p{margin:4px 0 10px;color:#b9b2a2}.r{display:grid;grid-template-columns:1fr 1fr;gap:12px}.r.one{grid-template-columns:1fr}figure{margin:0;background:#141a2e;border:1px solid #3a3420;padding:6px}figcaption{font-weight:700;color:#f0cd73;padding:2px 2px 6px}img{width:100%;height:auto;display:block}.ph{display:flex;gap:12px;flex-wrap:wrap}.ph figure{width:230px}@media(max-width:800px){.r{grid-template-columns:1fr}}</style></head><body><main>',
 '<h1>Naranxia : revamp des fenêtres de lancement, des menus, des logos et des animations</h1>',
 '<p>Une ligne par écran : A = avant, B = après. Répondez avec un code par ligne, par exemple « 1B 2B 3A ». Les animations (entrée des fenêtres, boutons qui s\'enfoncent, reflet du logo, braises, rideau titre vers jeu, pastilles NEW) ne se voient pas sur des images fixes.</p>']
for i,(k,t,n) in enumerate(ROWS,1):
    a=(D/('A_%s.png'%k)).exists();b=(D/('B_%s.png'%k)).exists()
    h.append('<h2>%d. %s</h2><p>%s</p><div class="r%s">'%(i,t,n,'' if a and b else ' one'))
    if a:h.append('<figure><figcaption>%dA avant</figcaption><img src="A_%s.png" alt="avant"></figure>'%(i,k))
    if b:h.append('<figure><figcaption>%dB après</figcaption><img src="B_%s.png" alt="après"%s></figure>'%(i,k,' style="max-width:640px"' if not a else ''))
    h.append('</div>')
h.append('<h2>%d. Téléphone (390x844), après</h2><p>Mêmes écrans en étroit : pile verticale, onglets, lignes sur deux niveaux quand les choix ne tiennent pas.</p><div class="ph">'%(len(ROWS)+1))
for k,t in P:
    if (D/(k+'.png')).exists():h.append('<figure><figcaption>%s</figcaption><img src="%s.png" alt="%s"></figure>'%(t,k,t))
h.append('</div></main></body></html>')
(D/'board.html').write_text('\n'.join(h),encoding='utf-8');print('board.html',len(ROWS)+1,'rows')
