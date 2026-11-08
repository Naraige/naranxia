#!/usr/bin/env python3
"""Builds the board images docs/studio-boards/model/rowN_<tag>.png from _raw/<tag>/*.jpg (front | back, or two RTS views)
and writes spec.json. usage: python3 docs/studio-boards/model/_src/compose.py"""
import json
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[4]
B=ROOT/'docs/studio-boards/model'
def bbox(im,bg,thr=26):
    px=im.load();W,H=im.size;xs=[];ys=[]
    for y in range(0,H,2):
        for x in range(0,W,2):
            c=px[x,y]
            if abs(c[0]-bg[0])+abs(c[1]-bg[1])+abs(c[2]-bg[2])>thr:xs.append(x);ys.append(y)
    return (min(xs),min(ys),max(xs),max(ys)) if xs else (0,0,W,H)
def build(row,tag,names,labels):
    ims=[Image.open(B/'_raw'/tag/(row+'_'+n+'.jpg')).convert('RGB') for n in names]
    bg=ims[0].getpixel((2,2));bs=[bbox(i,bg) for i in ims]
    x0=min(b[0] for b in bs);y0=min(b[1] for b in bs);x1=max(b[2] for b in bs);y1=max(b[3] for b in bs);m=14
    box=(max(0,x0-m),max(0,y0-m),min(ims[0].width,x1+m),min(ims[0].height,y1+m))
    crops=[i.crop(box) for i in ims];gap=10;W=sum(c.width for c in crops)+gap*(len(crops)-1);H=crops[0].height
    S=Image.new('RGB',(W,H),bg);x=0
    for c,l in zip(crops,labels):
        S.paste(c,(x,0));ImageDraw.Draw(S).text((x+8,6),l,fill=(230,220,200));x+=c.width+gap
    if S.width>1800:S=S.resize((1800,round(S.height*1800/S.width)),Image.LANCZOS)
    out=B/('%s_%s.png'%(row,tag));S.save(out);return out.name
ROWS=[('r1',['front','back'],['face','dos'],'1 - Eclaireur vs archer (capuche verte)','Archer / eclaireur / archer / eclaireur, de face puis de dos.'),
 ('r2',['front','back'],['face','dos'],'2 - Roi vs garde royal','Garde / roi / garde / roi, de face puis de dos.'),
 ('r3',['front','back'],['face','dos'],'3 - Paysan / ingenieur / emissaire','Paysan, ingenieur, emissaire, ingenieur, emissaire (de face puis de dos).'),
 ('r4',['v0','v1'],['vue RTS','vue RTS plus haute'],'4 - Batiments du bastion lisibles de loin','Observatoire (defense, bleu), grenier (economie, vert), sanctuaire (ville, or), forge (guerre, rouge).')]
NOTES={'r1':{'A':'Manteau court beige, besace + sac roule, casquette plate a plume, longue-vue.','B':'Long manteau beige, grand sac a armature qui depasse la tete, lunettes relevees, bandana.','C':'Poncho beige, chapeau de paille a larges bords, longue-vue en bandouliere sur le dos.'},
 'r2':{'A':'Roi : couronne haute a 5 pointes. Garde : crete plate longue + pavois de planches rouge et or.','B':'Roi : couronne a arceaux et croix sur globe. Garde : crete plate en eventail + pavois bleu a creneaux dores.','C':'Roi : couronne a flèches et bonnet rouge tres hauts. Garde : crete plate dorée haute + pavois pointu orne.'},
 'r3':{'A':'Ingenieur : tablier cuir, casque jaune, gros marteau tenu droit. Emissaire : echarpe rouge aux deux bouts devant, parchemin roule tendu.','B':'Ingenieur : tablier + ceinture d outils, marteau geant dans le dos. Emissaire : echarpe flottant dans le dos, grande feuille deroulee.','C':'Ingenieur : forgeron bras nus, bandana, roue dentee dans le dos. Emissaire : ceinture rouge en bandouliere, toque, parchemin scelle leve.'},
 'r4':{'A':'Toit de la couleur de la fonction + mat a fanion et symbole unique.','B':'Toit de la couleur de la fonction + haute banderole suspendue avec losange lumineux.','C':'Toit de la couleur de la fonction + pilier-lanterne lumineux, visible aussi la nuit.'}}
secs=[]
for row,names,labels,title,desc in ROWS:
    vs=[{'id':'X','img':build(row,'0',names,labels),'note':'Modele actuel (reference, choisir X pour ne rien changer). '+desc}]
    for t in 'ABC':vs.append({'id':t,'img':build(row,t,names,labels),'note':NOTES[row][t]})
    secs.append({'name':title,'variants':vs})
spec={'title':'Hammerdawn Studio - modeles 3D','intro':'Quatre problemes de lisibilite, trois variantes chacun (A, B, C) plus le modele actuel (X). Reponds par un code comme "1A 2B 3C 4A".','sections':secs}
(B/'spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=1),encoding='utf-8');print('ok')
