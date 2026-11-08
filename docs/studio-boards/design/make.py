#!/usr/bin/env python3
"""Renders the design board images (palette, team colours, bars) with Pillow and writes spec.json. Run: python3 make.py"""
from PIL import Image, ImageDraw, ImageFont
import json,os
D=os.path.dirname(os.path.abspath(__file__));W,H=900,420
def font(s):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p):return ImageFont.truetype(p,s)
    return ImageFont.load_default()
F=font(18);FS=font(13)
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
# ---- 1. palette ----
PAL={'A':dict(bg='#1b1712',ground='#5d7f3a',ground2='#4f6e31',panel='#2a2218',edge='#6b5638',txt='#ead8ba',acc='#ffd23c',btn='#4a3a24',water='#2f5f8a',stone='#8a8478'),
 'B':dict(bg='#12161f',ground='#6a8a52',ground2='#5b7a47',panel='#1f2634',edge='#53627d',txt='#dfe7f2',acc='#7fd0ff',btn='#33425c',water='#2a6fa0',stone='#9aa3ad'),
 'C':dict(bg='#14201a',ground='#7a9a3c',ground2='#698831',panel='#223329',edge='#5e7f58',txt='#f2ead2',acc='#f0b43c',btn='#35503e',water='#2d7a86',stone='#a79f8a')}
def palette(p):
    im=Image.new('RGB',(W,H),hx(p['bg']));d=ImageDraw.Draw(im)
    for y in range(0,H-120,30):
        for x in range(0,420,30):d.rectangle([x,y,x+29,y+29],fill=hx(p['ground'] if (x//30+y//30)%2 else p['ground2']))
    d.rectangle([0,0,419,29],fill=hx(p['water']));d.rectangle([60,150,150,210],fill=hx(p['stone']));d.polygon([(52,150),(105,110),(158,150)],fill=hx(p['btn']))
    d.rectangle([260,200,330,260],fill=hx(p['stone']));d.rectangle([260,200,330,212],fill=hx(p['acc']))
    d.rectangle([0,H-120,W,H],fill=hx(p['panel']));d.line([0,H-120,W,H-120],fill=hx(p['edge']),width=3)
    for i,t in enumerate(['Construire','Recruter','Recherche','Pause']):
        x=20+i*150;d.rounded_rectangle([x,H-95,x+135,H-45],6,fill=hx(p['btn']),outline=hx(p['edge']),width=2);d.text((x+14,H-83),t,font=F,fill=hx(p['txt']))
    d.rectangle([450,20,W-20,150],fill=hx(p['panel']),outline=hx(p['edge']),width=3)
    d.text((468,32),'Royaume - Vague 7',font=F,fill=hx(p['acc']))
    for i,(k,v) in enumerate([('Bois','412'),('Pierre','188'),('Or','95'),('Nourriture','260')]):
        d.text((468+(i%2)*200,70+(i//2)*36),'%s  %s'%(k,v),font=F,fill=hx(p['txt']))
    d.text((20,H-30),'fond '+p['bg']+'  accent '+p['acc'],font=FS,fill=hx(p['txt']))
    return im
# ---- 2. team colours ----
TEAMS={'A':[('Joueur 1','#6fdc6f'),('Joueur 2','#6fb7ff'),('Rebelles','#c66bff'),('Neutre','#e8c040')],
 'B':[('Joueur 1','#3f7fe0'),('Joueur 2','#f0d040'),('Rebelles','#d0382e'),('Neutre','#9aa0a8')],
 'C':[('Joueur 1','#2fb59b'),('Joueur 2','#f08a2c'),('Rebelles','#8a3a9e'),('Neutre','#c8c0a8')]}
def soldier(d,x,y,c,s=5):
    c=hx(c);dk=tuple(int(v*.6) for v in c)
    d.rectangle([x,y,x+8*s,y+8*s],fill=(224,184,140));d.rectangle([x,y,x+8*s,y+2*s],fill=(70,48,26))
    d.rectangle([x+s,y+3*s,x+2*s,y+4*s],fill=(30,30,30));d.rectangle([x+6*s,y+3*s,x+7*s,y+4*s],fill=(30,30,30))
    d.rectangle([x-2*s,y+8*s,x+10*s,y+20*s],fill=c);d.rectangle([x+3*s,y+8*s,x+5*s,y+20*s],fill=dk)
    d.rectangle([x-6*s,y+8*s,x-2*s,y+20*s],fill=c);d.rectangle([x+10*s,y+8*s,x+14*s,y+20*s],fill=c)
    d.rectangle([x,y+20*s,x+4*s,y+32*s],fill=dk);d.rectangle([x+5*s,y+20*s,x+9*s,y+32*s],fill=dk)
    d.rectangle([x+14*s,y+10*s,x+17*s,y+26*s],fill=(120,120,128));d.rectangle([x-12*s,y+10*s,x-6*s,y+24*s],fill=c,outline=(30,30,30))
def teams(p):
    im=Image.new('RGB',(W,H),(38,52,30));d=ImageDraw.Draw(im)
    for i,(n,c) in enumerate(p):
        x=70+i*215;soldier(d,x,40,c)
        d.line([x+40,255,x+40,330],fill=(90,60,30),width=5);d.polygon([(x+40,255),(x+90,270),(x+40,295)],fill=hx(c))
        d.rectangle([x-20,350,x+100,376],fill=hx(c));d.text((x-14,354),n,font=FS,fill=(255,255,255) if sum(hx(c))<420 else (20,20,20))
    return im
# ---- 3. bars ----
def barA(d,x,y,w,f,c):
    d.rectangle([x-1,y-1,x+w,y+4],fill=(0,0,0));d.rectangle([x,y,x+max(1,int(w*f))-1,y+2],fill=hx(c))
def barB(d,x,y,w,f,c):  # segmented pixel, bevel
    d.rectangle([x-3,y-3,x+w+2,y+11],fill=(14,12,10));d.rectangle([x-2,y-2,x+w+1,y+10],outline=(110,92,64))
    n=10;sw=w//n
    for i in range(n):
        on=i/n<f
        col=hx(c) if on else (52,46,40);d.rectangle([x+i*sw+1,y,x+(i+1)*sw-2,y+8],fill=col)
        if on:d.rectangle([x+i*sw+1,y,x+(i+1)*sw-2,y+2],fill=tuple(min(255,v+60) for v in hx(c)))
def barC(d,x,y,w,f,c):  # glass pill, gradient, ticks
    d.rounded_rectangle([x-3,y-3,x+w+3,y+13],8,fill=(18,16,22))
    d.rounded_rectangle([x-1,y-1,x+w+1,y+11],6,outline=(150,150,170))
    fw=max(8,int(w*f));base=hx(c)
    for yy in range(11):
        k=1.25-yy*0.05;d.line([x+3,y+yy,x+fw-3,y+yy],fill=tuple(min(255,int(v*k)) for v in base))
    d.rounded_rectangle([x,y,x+fw,y+10],5,outline=tuple(min(255,v+40) for v in base))
    for t in (0.25,0.5,0.75):d.line([x+int(w*t),y,x+int(w*t),y+10],fill=(0,0,0))
def bars(s):
    im=Image.new('RGB',(W,H),(66,92,48));d=ImageDraw.Draw(im)
    for yy in range(0,H,40):d.rectangle([0,yy,W,yy+19],fill=(60,85,44))
    rows=[('Soldat (joueur)',70,'#6fdc6f',.8),('Brute (rebelle)',140,'#c66bff',.45),('Tour (blessee)',210,'#6fdc6f',.25),('Chantier (progression)',280,'#ffd23c',.6),('Recherche',350,'#7fd0ff',.35)]
    for n,y,c,f in rows:
        d.text((40,y-6),n,font=F,fill=(255,255,255))
        if s=='A':
            tmp=Image.new('RGB',(60,8),(66,92,48));td=ImageDraw.Draw(tmp);barA(td,2,2,40,f,c)
            im.paste(tmp.resize((60*6,8*6),Image.NEAREST),(420,y-14))
        else:(barB if s=='B' else barC)(d,480,y,260,f,c)
    d.text((40,H-24),'A : taille reelle, agrandie x6 ici' if s=='A' else 'Largeur 40 px en jeu, agrandie ici',font=FS,fill=(255,255,255))
    return im
secs=[]
def add(name,mk,keys,notes):
    vs=[]
    for k in keys:
        fn='r%d%s.png'%(len(secs)+1,k);mk(k).save(os.path.join(D,fn));vs.append(dict(id=k,img=fn,note=notes[k]))
    secs.append(dict(name=name,variants=vs))
add("Palette generale du jeu et de l'interface",lambda k:palette(PAL[k]),'ABC',{'A':'Actuelle : brun chaud, parchemin, accent or (rien ne change)','B':'Nuit et pierre : fond bleu-ardoise, accent bleu clair, plus froid et lisible','C':'Foret et ivoire : fond vert sombre, accent ambre, plus vivant'})
add("Couleurs d'equipe",lambda k:teams(TEAMS[k]),'ABC',{'A':'Actuelles : vert, bleu, violet rebelles, jaune neutre','B':'Classiques : bleu / jaune / rouge rebelles / gris, tres distincts','C':'Originales : turquoise / orange / prune / sable, lisibles pour les daltoniens'})
add('Style des barres de vie et de progression',bars,'ABC',{'A':'Actuel : fine barre plate a contour noir','B':'Segments pixel (10 crans) avec biseau, style Minecraft','C':'Pilule vitree avec degrade et graduations, assortie aux boutons verre'})
json.dump(dict(title='Planche Design : palette, equipes, barres',intro='Trois choix visuels. Reponds avec un code comme "1A 2B 3C". Les variantes A montrent le rendu actuel. Maquettes schematiques, pas des captures du jeu.',sections=secs),open(os.path.join(D,'spec.json'),'w'),ensure_ascii=False,indent=1)
