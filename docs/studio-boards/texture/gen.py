#!/usr/bin/env python3
"""Texture board generator (original pixels, nothing copied). python3 gen.py -> png files + spec.json in this folder."""
import json,os
from PIL import Image,ImageDraw
D=os.path.dirname(os.path.abspath(__file__))
def hx(h):
    if not isinstance(h,str):return h
    h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))
BG=hx('#1d1a22')
def H(x,y,s=0):
    n=(x*374761393+y*668265263+s*2147483647)&0xffffffff;n=((n^(n>>13))*1274126177)&0xffffffff;return (n^(n>>16))&0xffff
def sheet(w,h):return Image.new('RGB',(w,h),BG)
def px(d,ox,oy,x,y,w,h,c,sc):d.rectangle([ox+x*sc,oy+y*sc,ox+(x+w)*sc-1,oy+(y+h)*sc-1],fill=hx(c))
def blit(im,grid,pal,ox,oy,sc):
    d=ImageDraw.Draw(im)
    for j,r in enumerate(grid):
        for i,c in enumerate(r):
            if c!='.' and c in pal:px(d,ox,oy,i,j,1,1,pal[c],sc)

# ---------- 1. ICONS (16x16) ----------
G_KNIGHT=["................",".......aa.......","......aaaa.......",".....oooooo.....","....oiiwwiio....","...oiiwiiiiio...","...oiiiiiiiio...","...oddddddddo...","...ovvvddvvvo...","...oiiidddiio...","...oiiidddiio...","...oiiiiiiiio...","....oiiiiiio....",".....oiiiio.....","......oooo......","................"]
G_ARCHER=["................",".....oooooo.....","....ohhhhhho....","...ohhhhlhhho...","..ohhhhhhhhhho..","..ohhHHHHHHhho..","..ohHsssssssHo..","..ohHsesssesHo..","..ohHssssssSHo..","..ohhHsmmmsHho..","...ohhHHHHHhho..","...ohhhhhhhho...","....ohhhhhho....",".....oooooo.....","................","................"]
G_TOWER=["................","..ooo.oooo.ooo..","..oss.osso.oss..","..osooosssooos..","...osslsssssso..","...ossssslsso...","...osdssssdsso..","...osdssssdsso..","...ossooooosso..","...osso...osso..","...osso.k.osso..","...ossokkkosso..","...ossokkkosso..","..oooookooooooo.","................","................"]
G_BARR=["................","......aaaa......",".....aaaaaa.....","....aaaaaaaa....","...orrrrrrrro...","..orrrllrrrrro..","..oRRRRRRRRRRo..","..owwwwwwwwwwo..","..owsswwwsswwo..","..owsswwwsswwo..","..owwwwkkwwwwo..","..owwwwkkwwwwo..","..owwwwkkwwwwo..","..oooooooooooo..","................","................"]
for g in (G_KNIGHT,G_ARCHER,G_TOWER,G_BARR):
    for i,r in enumerate(g):g[i]=(r+'.'*16)[:16]
PL='#3a4660'
def icon_row(name,grid,pals):
    out=[]
    for v,(pal,st) in zip('ABC',pals):
        sc=14;im=sheet(16*sc+40+80,16*sc+20);ox,oy=20,10
        if st=='plate':px(ImageDraw.Draw(im),ox,oy,0,0,16,16,PL,sc)
        blit(im,grid,pal,ox,oy,sc)
        sm=Image.new('RGB',(16,16),hx(PL) if st=='plate' else BG);blit(sm,grid,pal,0,0,1)
        im.paste(sm.resize((64,64),Image.NEAREST),(ox+16*sc+10,oy));im.paste(sm,(ox+16*sc+10,oy+80))
        f='ico_%s_%s.png'%(name,v);im.save(os.path.join(D,f));out.append((v,f))
    return out
KN=[({'o':'#1a1612','i':'#a9afb9','d':'#5c626e','w':'#e6e9ef','v':'#15131a','a':'#c0392b'},'flat'),
    ({'o':'#2b2118','i':'#c9ced6','d':'#7a808c','w':'#ffffff','v':'#2a1a14','a':'#e0b43a'},'flat'),
    ({'o':'#101018','i':'#8d8a82','d':'#5a5852','w':'#cfcbbf','v':'#0d0d12','a':'#3b7bd8'},'plate')]
AR=[({'o':'#14180f','h':'#4f7a3a','H':'#375828','l':'#7aa85a','s':'#e0a888','S':'#b88565','e':'#2b2b2b','m':'#8e4a3c'},'flat'),
    ({'o':'#1c1410','h':'#6b8f3f','H':'#4a6a2a','l':'#a3c761','s':'#f0bc96','S':'#c98262','e':'#1a1a1a','m':'#8e4a3c'},'flat'),
    ({'o':'#0c1210','h':'#2f5e4a','H':'#1f4234','l':'#4f8a6e','s':'#e8a684','S':'#b57452','e':'#101010','m':'#8e4a3c'},'plate')]
TW=[({'o':'#1a1814','s':'#8d8a82','l':'#9a968c','d':'#7c7a73','k':'#3a2a1c'},'flat'),
    ({'o':'#2a2620','s':'#a3a095','l':'#c4c0b3','d':'#7c7a73','k':'#6e4a28'},'flat'),
    ({'o':'#101014','s':'#8d8a82','l':'#9a968c','d':'#6a685f','k':'#6e4a28'},'plate')]
BA=[({'o':'#1a1410','a':'#a8461f','r':'#b8532a','l':'#d06a3a','R':'#8a3a1c','w':'#9a7a52','s':'#4a3420','k':'#3a2412'},'flat'),
    ({'o':'#2a1a10','a':'#c0392b','r':'#d4503a','l':'#f08060','R':'#8a2a20','w':'#c4a37a','s':'#5a8ac4','k':'#6e4a28'},'flat'),
    ({'o':'#101014','a':'#3b7bd8','r':'#5a8ae0','l':'#8ab0f0','R':'#2f5aa8','w':'#8d8a82','s':'#e0b43a','k':'#4a3420'},'plate')]
icons=[('Icône : Chevalier (casque)',icon_row('knight',G_KNIGHT,KN),['acier sombre, panache rouge','acier clair, panache or, contour brun','pierre grise, fond bleu équipe, panache bleu']),
('Icône : Archer (capuche)',icon_row('archer',G_ARCHER,AR),['vert forêt sobre','vert vif, visage clair','vert-bleu froid, fond équipe']),
('Icône : Tour',icon_row('tower',G_TOWER,TW),['pierre standard, porte brun foncé','pierre claire, porte bois chaud','pierre froide, fond équipe']),
('Icône : Caserne',icon_row('barracks',G_BARR,BA),['toit brique, bois terne','toit rouge vif, banderole bleue','toit bleu équipe, banderole or'])]

# ---------- 2. SKINS (Minecraft player layout: 8px head, 8x12 body, 4x12 limbs; front + back) ----------
def figure(o):
    sc=7;W=16;im=sheet(2*W*sc+60,32*sc+20);d=ImageDraw.Draw(im)
    for side,ox in ((0,20),(1,20+W*sc+20)):
        oy=10
        R=lambda x,y,w,h,c:px(d,ox,oy,x,y,w,h,c,sc)
        sk=('#a8664c','#c98262','#e8a684')
        R(4,20,4,12,o['pants'][0]);R(8,20,4,12,o['pants'][1])
        R(4,29,4,3,o['boots'][0]);R(8,29,4,3,o['boots'][1])
        R(4,8,8,12,o['shirt'][1]);R(4,8,8,1,o['shirt'][2]);R(4,19,8,1,o['shirt'][0])
        R(0,8,4,12,o['shirt'][0]);R(12,8,4,12,o['shirt'][0]);R(0,17,4,3,sk[0]);R(12,17,4,3,sk[0])
        if o.get('tabard'):
            t=o['tabard'];R(5,8,6,12,t[0]);R(7,8,2,12,t[1]);R(5,19,6,1,t[2])
        if o.get('sash'):R(4,9,8,2,o['sash']);R(4,11,2,2,o['sash']);R(10,15,2,2,o['sash'])
        if o.get('belt'):R(4,15,8,1,o['belt'])
        if o.get('stripes'):
            for k in range(o['stripes']):R(0,9+k*2,4,1,o['stripec']);R(12,9+k*2,4,1,o['stripec'])
        if o.get('pauld'):R(0,8,4,2,o['pauld']);R(12,8,4,2,o['pauld'])
        if o.get('plate'):
            pc=o['plate'];R(4,8,8,7,pc[0]);R(4,8,8,1,pc[1]);R(4,14,8,1,pc[2]);R(7,9,2,5,pc[1])
        R(4,0,8,8,sk[1]);R(4,7,8,1,sk[0])
        if side==0:
            R(5,3,2,1,'#f4f4f4');R(9,3,2,1,'#f4f4f4');R(6,3,1,1,'#3fa65a');R(9,3,1,1,'#3fa65a');R(7,5,2,1,'#8e4a3c')
            R(4,0,8,2,o['hair']);R(4,2,1,2,o['hair']);R(11,2,1,2,o['hair'])
        else:R(4,0,8,5,o['hair'])
        h=o.get('helm')
        if h:
            R(3,0,10,3,h[0]);R(3,3,1,3,h[0]);R(12,3,1,3,h[0]);R(3,0,10,1,h[1])
            if side==0 and o.get('nasal'):R(7,3,2,3,h[0])
            if side==1:R(3,3,10,3,h[0])
        if o.get('crest'):R(7,-1 if False else 0,2,1,o['crest']);R(6,0,4,1,o['crest'])
    return im
base=dict(hair='#4a3020',shirt=('#5a5d66','#7a7e88','#9a9ea8'),pants=('#2a2c34','#34363f'),boots=('#1d1a18','#26221f'))
def mk(**k):
    d=dict(base);d.update(k);return d
def skin_set(name,variants):
    out=[]
    for v,(a,b) in zip('ABC',variants):
        fa,fb=figure(a),figure(b);im=sheet(fa.width*2-40,fa.height);im.paste(fa,(0,0));im.paste(fb,(fa.width-40,0))
        f='skin_%s_%s.png'%(name,v);im.save(os.path.join(D,f));out.append((v,f))
    return out
BLUE=('#2f5aa8','#3b7bd8','#1f3d78');RED=('#a82f2f','#d84a3b','#782020')
team=[(mk(sash='#3b7bd8',belt='#5a3a1c'),mk(sash='#d84a3b',belt='#5a3a1c')),
      (mk(tabard=BLUE,belt='#3a2a1c'),mk(tabard=RED,belt='#3a2a1c')),
      (mk(helm=('#8d8a82','#b8b4a8'),nasal=1,crest='#3b7bd8',pauld='#3b7bd8',belt='#3a2a1c'),mk(helm=('#8d8a82','#b8b4a8'),nasal=1,crest='#d84a3b',pauld='#d84a3b',belt='#3a2a1c'))]
LT=('#6a4a28','#8a6438','#a8804a')
rank=[(mk(shirt=LT),mk(stripes=3,stripec='#e0b43a',shirt=LT)),
      (mk(helm=('#6e4a28','#8a6438'),shirt=LT),mk(helm=('#e0b43a','#f4d46a'),crest='#c0392b',shirt=LT,pauld='#e0b43a')),
      (mk(shirt=LT),mk(plate=('#e0b43a','#f4d46a','#a8801c'),helm=('#e0b43a','#f4d46a'),pauld='#f4d46a'))]
skins=[('Skin soldat : équipe bleue / rouge (face + dos)',skin_set('team',team),['écharpe de couleur + ceinture','tabard plein aux couleurs de l\'équipe','casque à nasal, crête et épaulières d\'équipe']),
('Skin soldat : rang recrue / élite (face + dos)',skin_set('rank',rank),['galons dorés sur les manches (0 puis 3)','casque cuir puis casque or à crête rouge','tenue de toile puis plastron et casque or'])]

# ---------- 3. SEASONS (terrain tint; 4 tiles per variant) ----------
SEAST=[[1,1.03,.98],[1.05,1.02,.93],[1.12,.96,.82],[.9,.98,1.12]]
BASEG=['#5f7a45','#6b8a4d','#547040']
def mul(c,m):return tuple(max(0,min(255,round(hx(c)[i]*m[i]))) for i in range(3))
PALS={'A':[[mul(c,SEAST[s]) for c in BASEG] for s in range(4)],
 'B':[('#6fbf4a','#7ccf55','#5aa83a'),('#b5b04a','#c4bf58','#9a9640'),('#b8622a','#cf7a34','#8f4a22'),('#dfe8f0','#f0f6fb','#b8c6d6')],
 'C':[('#7aa356','#88b062','#668f48'),('#8f9a4a','#9ca856','#7b8640'),('#a6703a','#b8803f','#8a5a30'),('#b4c0c8','#c6d2da','#9aa8b2')]}
CAN={'A':[('#3d7a2e','#4f9a3a'),('#4a8030','#5e9a3c'),('#a8501e','#d07a2e'),('#7d9a8e','#dce8ee')],
     'B':[('#4fa83a','#3a8a2a'),('#6ab04a','#4a9038'),('#d0502a','#e8a030'),('#9ab4a8','#e8f0f4')],
     'C':[('#5a8a3e','#487a34'),('#6a8f3c','#587a30'),('#b8602c','#c8882e'),('#7d8f88','#d4dde2')]}
def season_img(v):
    T=26;sc=5;gap=4;im=sheet(4*(T*sc+gap)+16,18*sc+20);d=ImageDraw.Draw(im)
    for s in range(4):
        ox=10+s*(T*sc+gap);oy=10;pal=PALS[v][s]
        for y in range(18):
            for x in range(T):
                c=pal[H(x,y)%3 if H(x,y)%5 else 0]
                if s==3 and H(x,y,3)%4==0 and v!='A':c=hx('#ffffff')
                px(d,ox,oy,x,y,1,1,c,sc)
        px(d,ox,oy,16,9,2,6,'#6e4a28',sc)
        cv=CAN[v][s]
        for yy in range(3,10):
            for xx in range(13,21):
                if (xx-16.5)**2/12+(yy-6)**2/9<1:px(d,ox,oy,xx,yy,1,1,cv[1 if H(xx,yy)%3 else 0],sc)
        for (sx,sy) in ((3,10),(4,10),(3,11),(4,11),(5,11)):px(d,ox,oy,sx,sy,1,1,'#8d8a82' if (sx+sy)%2 else '#9a968c',sc)
        if s==3:px(d,ox,oy,3,10,2,1,'#f4f8fb',sc)
    return im
seas=[]
for v in 'ABC':
    f='seasons_%s.png'%v;season_img(v).save(os.path.join(D,f));seas.append((v,f))
SE=[('Saisons du terrain : printemps / été / automne / hiver',seas,['actuel (multiplicateurs RGB du jeu)','palette vive, automne orange, hiver neige blanche','palette douce et naturelle, plus sobre'])]

secs=[]
for name,vs,notes in icons+skins+SE:
    secs.append({'name':name,'variants':[{'id':i,'img':f,'note':n} for (i,f),n in zip(vs,notes)]})
json.dump({'title':'Planche Texture : icônes, skins, saisons','intro':"Roi, 7 lignes, 3 variantes chacune (pixels style Minecraft/Blockbench). Réponds avec un code comme « 1A 2B 3C 4A 5B 6C 7A ». Rien n'est modifié dans le jeu avant ta réponse.",'sections':secs},open(os.path.join(D,'spec.json'),'w'),ensure_ascii=False,indent=1)
print(len(secs),'rows')
