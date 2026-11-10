#!/usr/bin/env python3
"""Builds the cards and the spec of the units board from the renders of render.py.
usage: python3 docs/studio-boards/units/_src/compose.py renders_dir [game_px=46]
Each card (900x690): 3/4 front close-up, 3/4 back, the other variants of the row, and the unit at game size (1:1 and 2:1) on a grass tile.
Writes docs/studio-boards/units/rNN_{A,B}.jpg and spec.json; then: python3 tools/board.py docs/studio-boards/units/spec.json docs/studio-boards/units/board.html"""
import sys,json,os
from pathlib import Path
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;src=Path(sys.argv[1]);GP=int(sys.argv[2]) if len(sys.argv)>2 else 46
BG=(21,19,26);GR=(86,118,62)
# row: (name FR, main render, extra renders, note A, note B, types for UV2_ON)
ROWS=[
 ('Paysan (6 variantes)','peasant',['peasant2','peasant3','peasant4'],'Tunique unie, tablier, chapeau.','Tunique 3 tons, bretelles et tablier, ceinture de corde, bourse, manches roulées, hotte en osier dans le dos.','peasant'),
 ('Archer','archer',[],'Capuche verte, jaque de cuir, carquois.','Capuche profonde à pointe, camail à liseré aux couleurs du royaume, jaque lacée, brassards, bourse, carquois empenné.','archer'),
 ('Chevalier (à droite : plates + rang 3, puis rebelle)','knight',['knight_plate','rebel'],'Heaume, mailles, tabard.','Grand heaume à croix dorée et cimier, tabard à croix, doubles épaulières, braconnière (jupe de plates), liserés dorés avec la recherche.','knight'),
 ('Capitaine','captain',[],'Bassinet ouvert, cuirasse dorée, écharpe.','Casque ailé de champion, cuirasse dorée ombrée, écharpe rouge, jupe du royaume, doubles épaulières dorées.','captain'),
 ('Porte-étendard','bannerman',[],'Chapel de fer, gambison, tabard.','Chapel de fer, gambison matelassé, camail du royaume à liseré doré, gants de cuir, cor à la hanche.','bannerman'),
 ('Canonniers (équipe du canon)','cannon',[],'Pourpoint, bonnet à plume.','Pourpoint à boutons de laiton, feutre à large bord et plume, bandoulière, tablier, corne à poudre.','gunner,gunner2'),
 ('Garde royal','guard',[],'Plates du royaume, tabard au soleil.','Heaume fermé à bandeau doré et haut cimier, doubles épaulières, braconnière, tabard cramoisi au soleil.','guard'),
 ('Roi Naraige','king',[],'Couronne, heaume, hermine (modèle validé).','Même modèle validé, ombré en 3-4 tons, braconnière dorée et lame sous chaque épaulière.','king'),
 ('Éclaireur','scout',[],'Modèle validé hier.','Même silhouette, visage et étoffes ombrés en 3-4 tons.','scout'),
 ('Ingénieur','engineer',[],'Modèle validé hier.','Même silhouette, visage et étoffes ombrés en 3-4 tons.','engineer'),
 ('Émissaire','envoy',[],'Modèle validé hier.','Même silhouette, visage et étoffes ombrés en 3-4 tons.','envoy'),
 ('Zombie (24 variantes ; à droite : squelettes, noble, chevalier tombé)','zombie3',['zombie','zombie2','zombie4','zknight'],'Mort-vivant aléatoire.','Ombrage par pixels, accessoire selon la graine (corde au cou, épée fichée, cape en lambeaux), épaulière cabossée pour les soldats tombés.','zombie'),
 ('Momie / desséché','husk',[],'Petit mort desséché.','Ombrage, bandelettes qui pendent derrière la tête.','husk'),
 ('Coureur','runner',[],'Mort rapide et maigre.','Bandeau de couleur à pans flottants, griffes d\'os.','runner'),
 ('Brute','brute',[],'Bras énorme, chaîne.','Collier de fer, épaulière rouillée à pointe, épines d\'os dans le dos.','brute'),
 ('Artificier','bomber',[],'Baril de poudre dans le dos.','Deux bombes de fer à mèche allumée à la ceinture.','bomber'),
 ('Cracheur d\'acide','acid',[],'Poches luisantes.','Bave luisante, deux poches de plus aux épaules.','acid'),
 ('Mineur','miner',[],'Casque à lampe, pioche.','Sac de minerai dans le dos, rouleau de corde à l\'épaule.','miner'),
 ('Boss de vague (brute géante)','boss',[],'Aujourd\'hui : une brute agrandie.','Cornes, mâchoire de fer, épaulière, étendard déchiré dans le dos (couleur selon le boss).','boss'),
]
def im(n,m,v,size):
    p=src/f'{n}_{m}_{v}.png'
    return Image.open(p).convert('RGB').resize((size,size),Image.LANCZOS) if p.exists() else None
def card(row,m):
    name,main,extra=row[0],row[1],row[2];C=Image.new('RGB',(900,690),BG);d=ImageDraw.Draw(C)
    f=im(main,m,'f',540)
    if f:C.paste(f,(0,0))
    b=im(main,m,'b',300)
    if b:C.paste(b,(560,0))
    n=len(extra);sz,per=(175,2) if n<=2 else (118,3)
    for i,e in enumerate(extra[:6]):
        x=im(e,m,'f',sz)
        if x:C.paste(x,(545+(i%per)*sz,305+(i//per)*sz))
    # game size: the close-up scaled so the unit is GP px tall (close-up frames 1.2 x the model height)
    if f:
        s=round(GP*1.2*(1.6 if main=='boss' else 1));g=im(main,m,'f',s);T=Image.new('RGB',(s+12,s+12),GR)
        px=g.load();bg=px[1,1]
        mask=Image.new('L',(s,s),0);mp=mask.load()
        for y in range(s):
            for x in range(s):
                r,gg,bb=px[x,y];mp[x,y]=0 if abs(r-bg[0])+abs(gg-bg[1])+abs(bb-bg[2])<14 else 255
        T.paste(g,(6,6),mask);T2=T.resize((T.width*2,T.height*2),Image.NEAREST)
        d.text((12,620),'Taille en jeu (x1, x2)',fill=(230,220,190))
        C.paste(T,(170,688-T.height));C.paste(T2,(180+T.width,688-T2.height))
    return C
spec={'title':'Unités : A actuel, B nouveau','intro':"Chaque ligne : A = modèle actuel, B = proposition (ombrage 3-4 tons par matière, visages refaits, 2 à 4 cubes d'identité). Grande vue de 3/4, dos en haut à droite, et en bas à gauche l'unité à la taille du jeu. Réponds par un code du type « 1B 2B 3A ». Rien n'est appliqué tant que tu n'as pas répondu.",'sections':[]}
for i,row in enumerate(ROWS,1):
    vs=[]
    for m,note in(('A',row[3]),('B',row[4])):
        fn=f'r{i:02d}_{m}.jpg';card(row,m).save(OUT/fn,quality=88);vs.append({'id':m,'img':fn,'note':note})
    spec['sections'].append({'name':row[0],'variants':vs})
if (OUT/'army_A.png').exists():
    spec['sections'].append({'name':'Armée en jeu, distance de jeu (pour comparer, pas de choix à faire)','variants':[{'id':'A','img':'army_A.png','note':'Look actuel : 157 unités à l’écran.'},{'id':'B','img':'army_B.png','note':'Look B partout : mêmes unités, même caméra.'}]})
    spec['sections'].append({'name':'Même capture, agrandie x2 (pixels du jeu)','variants':[{'id':'A','img':'army_A_x2.png','note':'Look actuel.'},{'id':'B','img':'army_B_x2.png','note':'Look B.'}]})
json.dump(spec,open(OUT/'spec.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
json.dump({str(i):r[5] for i,r in enumerate(ROWS,1)},open(OUT/'rows.json','w'),indent=1)
print(len(ROWS),'rows')
