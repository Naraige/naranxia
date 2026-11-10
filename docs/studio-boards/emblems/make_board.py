#!/usr/bin/env python3
"""Builds the emblem / studio logo board: sheets and crops from the captures (cap.py) and the logo images (gen_logos.py), spec.json, then board.html
   through tools/board.py (review-board format: numbered rows, lettered variants). Pixel art is embedded as PNG (board.py falls back to the raw
   file when Pillow is hidden from it), screenshots as JPEG.   usage: python3 docs/studio-boards/emblems/make_board.py"""
import json,sys,runpy
from pathlib import Path
from PIL import Image
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
def jpg(n):
    Image.open(D/(n+'.png')).convert('RGB').save(D/(n+'.jpg'),'JPEG',quality=90);return n+'.jpg'
def crop(n,box,k,out):
    im=Image.open(D/(n+'.png')).convert('RGB').crop(box);im.resize((im.width*k,im.height*k),Image.NEAREST).save(D/out);return out
# row 2: the option rows of the New kingdom screen, enlarged x2 (what the player sees), same width for both
ea=crop('A_setup',(390,190,1090,400),2,'sheet_A.png');eb=crop('B_setup',(390,200,1110,465),2,'sheet_B.png')
# row 3: in-game banner (tower close-up) and the HUD / save list thumbnails
ga=crop('A_game',(400,60,900,420),1,'game_A.png');gb=crop('B_game',(400,60,900,420),1,'game_B.png')
spec={"title":"Naranxia : emblèmes du royaume et logo Hammerdawn Studio",
 "intro":"Lignes 1 à 3 : la personnalisation du royaume redessinée en pixel art (A = avant, B = après, déjà codé sur la branche). Lignes 4 et 5 : le logo du studio, A = carte actuelle, B à E = propositions (rien n'est branché dans le jeu). Répondez avec un code par ligne, par exemple « 1B 2B 3B 4E 5E ».",
 "sections":[
  {"name":"Écran Nouveau royaume","variants":[{"id":"A","img":jpg('A_setup'),"note":"Avant : emblèmes vectoriels lissés, pastilles rondes, sélection en halo bleu."},
    {"id":"B","img":jpg('B_setup'),"note":"Après : bannière plus grande en pixels nets, gemmes taillées, motifs en écu, emblèmes 24x24 dans des cases, sélection cerclée d'or, 4 emblèmes ajoutés en fin de liste."}]},
  {"name":"Tous les emblèmes, couleurs et motifs (agrandi x2)","variants":[{"id":"A","img":ea,"note":"Avant : 16 emblèmes."},
    {"id":"B","img":eb,"note":"Après : 20 emblèmes (les 16 d'origine dans le même ordre, puis marteau, montagne, calice, crâne) ; contour sombre, 4 tons, reflet."}]},
  {"name":"Bannière en jeu (tour en pierre, vue rapprochée)","variants":[{"id":"A","img":ga,"note":"Avant."},
    {"id":"B","img":gb,"note":"Après : même texture 128x192, pixels nets (filtre au plus proche), liseré clair, motif en marches régulières."}]},
  {"name":"Logo Hammerdawn Studio : emblème seul (512 px)","variants":[{"id":"A","img":"logo_A_emblem.png","note":"Actuel (carte d'intro)."},
    {"id":"B","img":"logo_B_emblem.png","note":"Marteau dressé devant le soleil levant, rayons en blocs, reflets sous l'horizon."},
    {"id":"C","img":"logo_C_emblem.png","note":"Marteau qui frappe l'enclume, étincelles, soleil sur l'horizon."},
    {"id":"D","img":"logo_D_emblem.png","note":"Monogramme HD forgé dans un écu, petite aube à la pointe."},
    {"id":"E","img":"logo_E_emblem.png","note":"La tête du marteau fait l'horizon, le soleil se lève derrière."}]},
  {"name":"Logo : version horizontale (fond bleu nuit, fond clair) et favicon 32 px (à droite, taille réelle puis x2)","variants":[{"id":"A","img":"logo_A_wide.png","note":"Actuel."},
    {"id":"B","img":"logo_B_wide.png","note":"Marteau et soleil levant."},{"id":"C","img":"logo_C_wide.png","note":"Enclume et marteau."},
    {"id":"D","img":"logo_D_wide.png","note":"Écu HD."},{"id":"E","img":"logo_E_wide.png","note":"Marteau horizon."}]}]}
(D/'spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
sys.modules['PIL']=None  # board.py then embeds the files as they are (PNG stays PNG)
sys.argv=['board.py',str(D/'spec.json'),str(D/'board.html')]
runpy.run_path(str(ROOT/'tools/board.py'),run_name='__main__')
print('board.html',round((D/'board.html').stat().st_size/1e6,2),'MB')
