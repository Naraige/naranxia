#!/usr/bin/env python3
"""Builds the cards and the spec of the gear board from the renders of render.py.
usage: python3 docs/studio-boards/gear/_src/compose.py renders_dir [game_px=46]
Each card (900x690): the item(s) alone on the left, the unit(s) holding it on the right, and below the unit at game size (1:1 and 2:1)
on a grass tile. Writes docs/studio-boards/gear/rNN_{A,B}.jpg, spec.json and rows.json; then:
python3 tools/board.py docs/studio-boards/gear/spec.json docs/studio-boards/gear/board.html"""
import sys,json
from pathlib import Path
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;src=Path(sys.argv[1]);GP=int(sys.argv[2]) if len(sys.argv)>2 else 46
BG=(21,19,26);GR=(86,118,62)
# row: (name FR, item renders, unit renders (first = game size), game-size factor, note A, note B, keys for GEAR2_ON)
ROWS=[
 ("Épée du chevalier (de gauche à droite : sans recherche, mailles, plates, rebelle)",['sword0','sword1','sword2','swordR'],['knight0','knight2','rebel'],1.2,
  "Lame fine en demi-pixels, garde d'acier, la même épée à tous les niveaux.","Lame large sur la grille de pixels des unités, 4 tons d'acier, gouttière sombre ; garde de fer, puis d'acier à pommeau de laiton, puis dorée avec les recherches ; émail du pommeau à la couleur du royaume (rebelles : la leur).",'sword'),
 ("Épée du capitaine",['gsword'],['captain'],1.2,"Lame fine, garde à bouts dorés.","Lame plus longue à gouttière incrustée d'or, garde dorée aux bouts tournés vers la lame, bagues d'or, pierre lumineuse à la couleur du royaume.",'gsword'),
 ("Épée du Roi",['rsword'],['king'],1.2,"Lame fine à points d'or, garde dorée, rubis.","Lame large à gouttière d'or, lourde garde dorée avec un rubis sur chaque face, fusée rouge baguée d'or, pommeau à rubis.",'rsword'),
 ("Hallebarde du garde royal",['halberd'],['guard'],1.2,"Fer en croissant, crochet, gland bleu.","Fer plus grand à deux encoches et tranchant clair, bec, pointe de lance, douille d'acier, collier d'or, gland à la couleur du royaume, hampe claire.",'halberd'),
 ("Arc de l'archer",['bow'],['archer'],1.2,"Branches en segments inclinés, anneaux de laiton.","Arc en voxels : branches en escalier (ventre clair, dos sombre), bagues d'or, pointes de corne, poignée de cuir à bande du royaume.",'bow'),
 ("Bouclier du chevalier (sans recherche, mailles, plates, rebelle, dos)",['shield0','shield1','shield2','shieldR','shieldback'],['knight0','knight2'],1.2,
  "Bouclier Minecraft 12x22x1 : planches, bord de fer, rivets, poignée.","Même construction ; palette commune, bord de fer sombre puis d'acier puis d'or avec les recherches, bord éclairé à gauche et ombré à droite, peinture éclairée en haut et ombrée en bas.",'shield'),
 ("Bouclier du capitaine",['cshield'],['captain'],1.2,"Soleil d'or, chevron, bord de fer.","Mêmes armes, bord toujours doré, peinture ombrée en 3 tons.",'cshield'),
 ("Bouclier du garde royal",['gshield'],['guard'],1.2,"Pal rouge, couronne et soleil.","Mêmes armes, bord de la palette commune (fer, acier, or selon la recherche), peinture ombrée.",'gshield'),
 ("Outils du paysan : hache, pioche, houe, marteau",['axe','pick','hoe','hammer'],['p_axe','p_pick','p_hoe','p_hammer'],1.2,
  "Cubes unis : manche orange, fer gris clair.","Manche à veines en 3 tons, poignée de cuir, têtes de fer sombre à tranchant clair, dessinées pixel par pixel.",'axe,pick,hoe,hammer'),
 ("Charges portées : bois, or, pierre",['cw','cg','cs'],['c_w','c_g','c_s'],1.2,"Cubes unis.","Rondins à écorce et bois de bout sous une sangle de cuir ; coffret cerclé de fer avec son or ; blocs de pierre taillée en 3 tons.",'carry'),
 ("Hampe de l'étendard",[],['bannerman'],2.9,"Hampe unie, viroles et pointe en cubes unis.","Hampe à veines, poignée de cuir, viroles et embouts d'or ombrés, pointe de lance d'acier en gradins. L'étoffe ne change pas.",'banner'),
 ("Canon",['cannon'],['cannon'],2.1,"Fût de bronze, affût de planches, roues à rayons.","Même construction, repeinte : fût éclairé dessus et sombre dessous, bouche cerclée, planches veinées à ferrures, boulets à reflet.",'cannon'),
]
def im(n,m,size):
    p=src/f'{n}_{m}.png'
    return Image.open(p).convert('RGB').resize((size,size),Image.LANCZOS) if p.exists() else None
def grid(C,names,m,x0,y0,w,h,pre):
    n=len(names)
    if not n:return
    cols=1 if n==1 else 2 if n<=4 else 3;rows=(n+cols-1)//cols;sz=min(w//cols,h//rows)
    ox=x0+(w-sz*cols)//2;oy=y0+(h-sz*rows)//2
    for i,nm in enumerate(names):
        x=im(pre+nm,m,sz)
        if x:C.paste(x,(ox+(i%cols)*sz,oy+(i//cols)*sz))
def card(row,m):
    name,items,us,gf=row[0],row[1],row[2],row[3];C=Image.new('RGB',(900,690),BG);d=ImageDraw.Draw(C)
    if items:grid(C,items,m,0,0,540,540,'i_');grid(C,us,m,548,0,352,540,'u_')
    else:grid(C,us,m,0,0,900,540,'u_')
    # game size: the unit picture scaled so the unit is GP px tall (a normal close-up frames 1.2 x the model height)
    s=round(GP*gf);g=im('u_'+us[0],m,s)
    if g:
        T=Image.new('RGB',(s+12,s+12),GR);px=g.load();bg=px[1,1]
        mask=Image.new('L',(s,s),0);mp=mask.load()
        for y in range(s):
            for x in range(s):
                r,gg,bb=px[x,y];mp[x,y]=0 if abs(r-bg[0])+abs(gg-bg[1])+abs(bb-bg[2])<14 else 255
        T.paste(g,(6,6),mask);d.text((12,548),'Taille en jeu (x1, x2)',fill=(230,220,190))
        if T.height<=142:C.paste(T,(170,688-T.height))
        T2=T.resize((T.width*2,T.height*2),Image.NEAREST)
        if T2.height<=142:C.paste(T2,(180+T.width,688-T2.height))
        elif T.height>142:
            T3=T.crop((0,0,T.width,142));C.paste(T3,(170,546))
    return C
spec={'title':'Armes et outils : A actuel, B nouveau','intro':"Chaque ligne : A = objet actuel, B = proposition (une seule palette pour tous les objets : acier, fer, or, bois, cuir, étoffe, en 3 à 4 tons comme les nouvelles unités ; armes en voxels sur la grille de pixels des unités). À gauche l'objet seul, à droite l'unité qui le tient, en bas la taille en jeu. Répondez par un code du type « 1B 2B 3A ». Rien n'est appliqué tant que vous n'avez pas répondu.",'sections':[]}
for i,row in enumerate(ROWS,1):
    vs=[]
    for m,note in(('A',row[4]),('B',row[5])):
        fn=f'r{i:02d}_{m}.jpg';card(row,m).save(OUT/fn,quality=88);vs.append({'id':m,'img':fn,'note':note})
    spec['sections'].append({'name':row[0],'variants':vs})
if (OUT/'army_A.png').exists():
    spec['sections'].append({'name':'Armée en jeu, distance de jeu (pour comparer, pas de choix à faire)','variants':[{'id':'A','img':'army_A.png','note':'Objets actuels : 157 unités à l’écran.'},{'id':'B','img':'army_B.png','note':'Tous les objets en B : mêmes unités, même caméra.'}]})
    if (OUT/'armyf_A.png').exists():spec['sections'].append({'name':'Armée vue de face, caméra plus proche (pour comparer)','variants':[{'id':'A','img':'armyf_A.png','note':'Objets actuels.'},{'id':'B','img':'armyf_B.png','note':'Objets B.'}]})
    if (OUT/'army_A_x2.png').exists():spec['sections'].append({'name':'Vue de face, agrandie x2 (pixels du jeu)','variants':[{'id':'A','img':'army_A_x2.png','note':'Objets actuels.'},{'id':'B','img':'army_B_x2.png','note':'Objets B.'}]})
json.dump(spec,open(OUT/'spec.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
json.dump({str(i):r[6] for i,r in enumerate(ROWS,1)},open(OUT/'rows.json','w'),indent=1)
print(len(ROWS),'rows')
