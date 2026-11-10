#!/usr/bin/env python3
"""Builds the buildings review board: one numbered row per building, A = current (release-v84), B = new.
usage: python3 make.py <dirA> <dirB> <townA prefix> <townB prefix>
  dirA / dirB = output folders of render.py (per-building shots + tris.json), town prefixes = outputs of town.py.
Writes rNN_A.jpg / rNN_B.jpg and spec.json next to board.html, then runs tools/board.py."""
import json,os,sys,subprocess
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;ROOT=HERE.parents[3]
A,B,TA,TB=sys.argv[1:5]
tr={'A':json.load(open(os.path.join(A,'tris.json'))),'B':json.load(open(os.path.join(B,'tris.json')))}
ROWS=[('Château','castle castle_w castle_n','puits couvert, charrette de foin et cheminée qui fume dans la cour'),
 ('Donjon','keep keep_w','mêmes volumes, nouvelles textures'),
 ('Maison','house house_w house_n','lucarne, tas de bûches, tonneau, rives de toit, fenêtres éclairées la nuit'),
 ('Ferme','farm','mêmes volumes, nouvelles textures'),
 ('Entrepôt','storage storage_w','rives de toit, chaume et soubassement en pierre au niveau bois'),
 ('Caserne','barracks barracks_w barracks_n','mannequin de paille dans la cour'),
 ('Académie','academy academy_w academy_n','mêmes volumes, tuiles de cuivre texturées'),
 ('Marché','market market_w market_n','mêmes volumes, nouvelles textures'),
 ('Cabane de forestier','forester','mêmes volumes, nouvelles textures'),
 ('Guilde des bâtisseurs','guild guild_w guild_n','mêmes volumes, nouvelles textures'),
 ('Mur','wall wall_w','mêmes volumes (chemin de ronde inchangé), briques à 4 tons'),
 ('Porte','gate gate_w gate_n','mêmes volumes, nouvelles textures'),
 ('Tour 2x2','tower tower_w tower_n','mêmes volumes, nouvelles textures'),
 ('Tour 1x1 et tour à baliste','tower1 tower1_w tower_b','mêmes volumes, nouvelles textures'),
 ('Torche, baliste, trébuchet','torch ballista trebuchet','inchangés (hors textures de la torche)'),
 ('Observatoire','observatory observatory_w observatory_n','tour ronde, galerie en bois, dôme d’ardoise bleue fendu, télescope en laiton, étude, sphère armillaire'),
 ('Grenier','granary granary_w','grange sur pilotis de pierre, potence et sac hissé, rampe, sacs, gerbes de blé'),
 ('Cloche d’alarme','bell bell_w','beffroi : socle de pierre, charpente ouverte, grande cloche de bronze, flèche d’ardoise, corde'),
 ('Sanctuaire','sanctuary sanctuary_w sanctuary_n','chapelle à contreforts, toit doré, clocheton, rosace solaire lumineuse, abside'),
 ('Balise','beacon beacon_w beacon_n','tour effilée, couronne en encorbellement, panier de fer et flammes, échelle, bannière, bûcher'),
 ('Verger','orchard','pommiers à étages chargés de fruits, échelle, paniers, ruche, brouette'),
 ('Forge','forge forge_w forge_n','grande cheminée de brique, appentis ouvert sur le foyer rougeoyant, enclume, soufflet, meule, lames'),
 ('Ambassade','embassy embassy_w embassy_n','deux étages, toit à quatre pans, porche à piliers et balcon, tapis, bannières et drapeaux du royaume'),
 ('Salle de guerre','warroom warroom_w warroom_n','tourelle à drapeau, tente de commandement rayée sur la table des cartes, râtelier de lances, tambour (en A, la version pierre affiche le modèle bois : bug de cache corrigé)'),
 ('Sapeurs','sappers sappers_w sappers_n','atelier, entrée de mine étayée dans un tertre, rails et wagonnet, barils de poudre, roue dentée')]
def strip(d,keys,h=300):
    ims=[Image.open(os.path.join(d,k+'.jpg')).convert('RGB').resize((h,h),Image.LANCZOS) for k in keys if os.path.exists(os.path.join(d,k+'.jpg'))]
    S=Image.new('RGB',(h*len(ims),h),(22,20,26))
    for i,im in enumerate(ims):S.paste(im,(i*h,0))
    return S
secs=[]
for n,(name,keys,note) in enumerate(ROWS,1):
    ks=keys.split();va=[]
    for v,d in (('A',A),('B',B)):
        f='r%02d_%s.jpg'%(n,v);strip(d,ks).save(OUT/f,quality=86)
        t=[tr[v].get(k) for k in ks if not k.endswith('_n') and tr[v].get(k)]
        va.append({'id':v,'img':f,'note':('actuel' if v=='A' else note)+' · '+' / '.join(str(x) for x in t)+' triangles'})
    secs.append({'name':name+' (pierre, bois'+(', nuit' if any(k.endswith('_n') for k in ks) else '')+')' if len(ks)>1 and ks[1].endswith('_w') else name,'variants':va})
def crop(p,box=None,w=900):
    im=Image.open(p).convert('RGB')
    if box:im=im.crop(box)
    return im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
perf={v:json.load(open(p+'.json')) for v,p in (('A',TA),('B',TB))}
for name,suf,box,noteB in (('Ruines anciennes','_ruin',(240,60,1040,660),'souche de tour en assises de brique, couronne brisée, lierre, colonne tombée, coffre ferré'),
  ('Chantier (échafaudage inchangé)','_site',(240,60,1040,660),'même échafaudage, nouveau bâtiment dessous'),
  ('Ville complète, de jour','_day',None,'toutes les matières retexturées, fumée des cheminées'),
  ('Ville complète, de nuit','_night',None,'fenêtres éclairées à la tombée de la nuit')):
    n=len(secs)+1;va=[]
    for v,p in (('A',TA),('B',TB)):
        f='r%02d_%s.jpg'%(n,v);crop(p+suf+'.png',box).save(OUT/f,quality=86)
        q=perf[v];extra=' · %s appels de dessin, %s triangles à l’écran'%(q['calls'],q['tris']) if suf=='_day' else ''
        va.append({'id':v,'img':f,'note':('actuel' if v=='A' else noteB)+extra})
    secs.append({'name':name,'variants':va})
spec={'title':'Bâtiments : avant / après','intro':'Chaque ligne montre un bâtiment : A = actuel (v84), B = nouveau. De gauche à droite : niveau pierre, niveau bois, puis de nuit quand c’est utile. Rien n’est fusionné : réponds par un code (ex. 1B 2A 3B) ou « tout B ». Emprise au sol, collisions et simulation inchangées.','sections':secs}
json.dump(spec,open(OUT/'spec.json','w'),ensure_ascii=False,indent=1)
subprocess.run([sys.executable,str(ROOT/'tools'/'board.py'),str(OUT/'spec.json'),str(OUT/'board.html')],check=True)
