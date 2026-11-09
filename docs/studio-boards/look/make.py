#!/usr/bin/env python3
"""Look board images. A = real captures (capture.py: a_hud.png, a_end.png, 1280x720). B/C = Pillow mock-ups drawn over those captures
(real icons, real background, redrawn panels/text). Writes the r*.png and spec.json. Fonts: Inter (system), Pixelify Sans + Silkscreen
(fonts/, from google/fonts, OFL). Run: python3 make.py && python3 ../../../tools/board.py spec.json board.html"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json,os
D=os.path.dirname(os.path.abspath(__file__))
P=lambda n:os.path.join(D,n)
HUD=Image.open(P('a_hud.png')).convert('RGBA');END=Image.open(P('a_end.png')).convert('RGBA')
GOLD=(201,162,79,255)
def inter(s,w='Bold'):return ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-%s.otf'%w,s)
def pix(s):
    f=ImageFont.truetype(P('fonts/p.ttf'),s)
    try:f.set_variation_by_axes([700])
    except Exception:pass
    return f
def silk(s):return ImageFont.truetype(P('fonts/s.ttf'),s)
def over(im,box,fill,r=0,outline=None,w=1):
    L=Image.new('RGBA',im.size,(0,0,0,0));ImageDraw.Draw(L).rounded_rectangle(box,r,fill=fill,outline=outline,width=w);return Image.alpha_composite(im,L)
def text(im,xy,s,f,fill,anchor='la',sp=0,shadow=None):
    d=ImageDraw.Draw(im)
    if sp:
        x,y=xy;tot=sum(d.textlength(c,font=f)+sp for c in s)-sp
        if anchor[0]=='m':x-=tot/2
        for c in s:
            if shadow:d.text((x+2,y+2),c,font=f,fill=shadow,anchor='l'+anchor[1])
            d.text((x,y),c,font=f,fill=fill,anchor='l'+anchor[1]);x+=d.textlength(c,font=f)+sp
        return
    if shadow:d.text((xy[0]+2,xy[1]+2),s,font=f,fill=shadow,anchor=anchor)
    d.text(xy,s,font=f,fill=fill,anchor=anchor)
def soften(im,box):
    """hide existing text under box: replace by a heavy blur of the same area (mock-up only)"""
    reg=im.crop(box).filter(ImageFilter.GaussianBlur(10));im.paste(reg,box[:2]);return im
def soften2(im,box):
    reg=im.crop(box).filter(ImageFilter.GaussianBlur(28));im.paste(reg,box[:2]);return im
def stack(parts,gap=8,bg=(22,20,26,255)):
    W=max(p.width for p in parts);H=sum(p.height for p in parts)+gap*(len(parts)-1);o=Image.new('RGBA',(W,H),bg);y=0
    for p in parts:o.paste(p,(0,y));y+=p.height+gap
    return o
def save(im,n):im.convert('RGB').save(P(n))

# ---------- geometry measured on a_hud.png ----------
PANELS=[(10,133,370,268),(28,495,918,708),(955,530,1270,708)]
SLOTS=[(36,523,104,597),(110,523,195,597),(203,523,288,597),(308,523,375,597),(383,523,450,597),(458,523,523,597),(531,523,597,597),(605,523,671,597),
 (693,523,759,597),(767,523,833,597),(841,523,908,597),(36,623,104,697),(111,623,177,697)]
TSLOTS=[(16,170,132,196),(16,202,132,228),(16,234,132,260),(142,170,202,196),(210,170,282,196),(290,170,358,196),(142,202,238,228),(142,234,238,260),(330,136,364,162)]
CROP1=(0,120,930,710)

# ---------- 1. gold hairline ----------
def bevel(d,b,c,k):
    x0,y0,x1,y1=b
    pts=[(x0+k,y0),(x1-k,y0),(x1,y0+k),(x1,y1-k),(x1-k,y1),(x0+k,y1),(x0,y1-k),(x0,y0+k),(x0+k,y0)]
    d.line(pts,fill=c,width=1)
def row1(v):
    im=HUD.copy()
    if v!='A':
        L=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(L)
        for b in PANELS+SLOTS+TSLOTS:
            big=(b[2]-b[0])>150 and (b[3]-b[1])>100
            if v=='B':d.rounded_rectangle(b,9 if big else 6,outline=GOLD,width=1)
            else:
                k=4 if big else 3;bevel(d,b,GOLD,k)
                ib=(b[0]+2,b[1]+2,b[2]-2,b[3]-2);bevel(d,ib,(255,235,170,70),k-1)       # inner highlight, pixel bevel
                for cx,cy in((b[0],b[1]),(b[2],b[1]),(b[0],b[3]),(b[2],b[3])):d.rectangle([cx-1,cy-1,cx+1,cy+1],fill=(255,226,140,255) if False else (0,0,0,0))
                d.line([(b[0]+k+1,b[1]+1),(b[2]-k-1,b[1]+1)],fill=(255,236,170,110))
        im=Image.alpha_composite(im,L)
    save(im.crop(CROP1),'r1%s.png'%v)

# ---------- 2. troop panel ----------
TC=(0,125,430,305);S2=2
def troopbase():return HUD.crop(TC).resize(((TC[2]-TC[0])*S2,(TC[3]-TC[1])*S2),Image.LANCZOS)
ICON={'Peasant':(21,172,43,194),'Knight':(21,204,43,226),'Archer':(21,236,43,258)}
def icon(n,s):return HUD.crop(ICON[n]).resize((s,s),Image.LANCZOS)
DATA=[('Peasant',7,'Gold 1  Wood 5  Stone 1',0.55),('Knight',2,'On guard 2',0.9),('Archer',3,'On guard 3',0.75)]
def hpbar(im,x,y,w,h,f):
    d=ImageDraw.Draw(im);d.rectangle([x-1,y-1,x+w,y+h],fill=(8,10,14,255))
    n=10
    for i in range(n):
        x0=x+i*w//n;x1=x+(i+1)*w//n-1;col=(111,220,111,255) if f>.6 else (255,210,60,255) if f>.3 else (216,40,40,255)
        d.rectangle([x0,y,x1,y+h-1],fill=col if i<round(f*n) else (60,64,72,255))
def row2(v):
    if v=='A':save(troopbase(),'r2A.png');return
    im=troopbase();cov=(14,10,746,292);im=soften2(im,cov)
    PANC=(20,27,40,238);box=(20,16,740,286);im=over(im,box,PANC,18,(255,255,255,45))
    text(im,(46,44),'Troops (12)',inter(30,'SemiBold'),(242,212,138,255),'lm')
    d=ImageDraw.Draw(im);d.rounded_rectangle((690,28,722,60),6,fill=(235,238,244,255));d.line([(698,36),(714,52)],fill=(40,44,56,255),width=3);d.line([(714,36),(698,52)],fill=(40,44,56,255),width=3)
    if v=='B':
        for i,(n,c,_,hp) in enumerate(DATA):
            y=82+i*62;im.alpha_composite(icon(n,44),(44,y))
            text(im,(104,y+22),n,inter(28,'SemiBold'),(255,255,255,255),'lm');text(im,(300,y+22),'x%d'%c,inter(28,'ExtraBold'),(255,226,120,255),'lm')
            hpbar(im,372,y+12,270,20,hp);text(im,(718,y+22),'%d%%'%(hp*100),inter(22,'Medium'),(200,210,225,255),'rm')
    else:
        for i,(n,c,st,hp) in enumerate(DATA):
            x=40+i*228;y=76;im=over(im,(x,y,x+214,y+196),(255,255,255,30),12,(255,255,255,60))
            im.alpha_composite(icon(n,60),(x+12,y+12));text(im,(x+202,y+14),str(c),inter(50,'ExtraBold'),(255,255,255,255),'ra')
            text(im,(x+12,y+92),n,inter(26,'SemiBold'),(235,238,244,255),'lm')
            hpbar(im,x+12,y+122,190,14,hp)
            dot=(255,154,138,255) if n=='Knight' else (255,210,122,255) if n=='Archer' else (160,200,255,255)
            ImageDraw.Draw(im).ellipse([x+12,y+156,x+26,y+170],fill=dot);text(im,(x+36,y+163),{'Peasant':'working 7','Knight':'on guard 2','Archer':'on guard 3'}[n],inter(20,'Medium'),(200,210,225,255),'lm')
    save(im,'r2%s.png'%v)

# ---------- 3. build slots ----------
BC=(28,495,920,710)
def glass(im,b,hot=False):
    x0,y0,x1,y1=b;L=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(L)
    d.rounded_rectangle(b,8,fill=(224,228,236,235),outline=(255,255,255,200) if not hot else (47,125,246,255),width=1 if not hot else 2)
    d.rounded_rectangle((x0+1,y0+1,x1-1,y0+(y1-y0)//2),7,fill=(255,255,255,60));return Image.alpha_composite(im,L)
COSTS={0:[('60','#ffd23c'),('25','#e8b27a')],1:[('70','#ffd23c'),('40','#e8b27a'),('20','#b8c0cc')],2:[('400','#ffd23c'),('120','#e8b27a'),('80','#b8c0cc')],11:[],12:[('100','#ffd23c'),('150','#e8b27a')],
 3:[('7 types','#555')],4:[('7 types','#555')],5:[('9 types','#555')],6:[('4 types','#555')]}
def costline(im,cx,y,items,fs):
    d=ImageDraw.Draw(im);f=inter(fs,'Bold');tot=sum(d.textlength(t,font=f)+fs*1.1 for t,_ in items)-fs*.3;x=cx-tot/2
    for t,c in items:
        if c=='#555':d.text((x,y),t,font=f,fill=(70,76,90,255),anchor='lm');x+=d.textlength(t,font=f)+fs*1.1
        else:
            d.ellipse([x,y-fs*.3,x+fs*.6,y+fs*.3],fill=c);x+=fs*.8;d.text((x,y),t,font=f,fill=(40,44,56,255),anchor='lm');x+=d.textlength(t,font=f)+fs*.4
def row3(v):
    im=HUD.copy();src=HUD.copy()
    if v!='A':
        im=over(im,(28,495,918,708),(20,27,40,250),16,(255,255,255,45))
        for lab,x in(('Train',38),('Build',310),('Command',694)):text(im,(x,509),lab,inter(13,'SemiBold'),(200,210,225,255),'lm')
        for i,b in enumerate(SLOTS):
            x0,y0,x1,y1=b;w=x1-x0;cxm=(x0+x1)//2
            if v=='B':
                im=glass(im,b);ic=src.crop((x0+8,y0+3,x1-8,y0+42)).resize((52,52),Image.LANCZOS) if False else src.crop((x0+8,y0+3,x1-8,y0+42))
                im.alpha_composite(ic,(x0+(w-ic.width)//2,y0+8));costline(im,cxm,y0+62,COSTS.get(i,[]),12)
            else:
                s=(x0+4,y0+4,x1-4,y0+4+w-8);im=glass(im,s,hot=(i==0));ic=src.crop((x0+8,y0+3,x1-8,y0+42));ic=ic.resize((int(ic.width*1.25),int(ic.height*1.25)),Image.LANCZOS)
                im.alpha_composite(ic,(cxm-ic.width//2,y0+4+(w-8-ic.height)//2))
        b=SLOTS[0]
        if v=='C':
            pill=(b[0]-4,b[1]-52,b[0]+150,b[1]-6);im=over(im,pill,(12,16,24,248),8,GOLD);text(im,(b[0]+8,b[1]-38),'Peasant',inter(14,'SemiBold'),(255,255,255,255),'lm')
            d=ImageDraw.Draw(im);f=inter(13,'Bold');x=b[0]+8
            for t,c in COSTS[0]:
                d.ellipse([x,b[1]-24,x+8,b[1]-16],fill=c);d.text((x+12,b[1]-20),t,font=f,fill=(255,255,255,255),anchor='lm');x+=50
        else:
            pill=(b[0]-4,b[1]-34,b[0]+170,b[1]-6);im=over(im,pill,(12,16,24,248),8,(255,255,255,70));text(im,(b[0]+8,b[1]-20),'Peasant   hotkey 1',inter(13,'Medium'),(235,238,244,255),'lm')
    save(im.crop((20,470,930,715)),'r3%s.png'%v)

# ---------- 4. heading fonts ----------
def row4(v):
    t=END.crop((375,190,905,335));t=t.resize((t.width*3//2,t.height*3//2),Image.LANCZOS)
    h=HUD.crop((10,133,370,200));h=h.resize((h.width*3//2,h.height*3//2),Image.LANCZOS)
    if v!='A':
        t=soften(t,(0,8,t.width,100));h=soften(h,(10,4,140,40))
        if v=='B':
            ft=pix(62);text(t,(t.width//2,56),'Your kingdom fell!',ft,(255,214,90,255),'mm',shadow=(60,24,0,255));text(h,(16,24),'Troops (12)',pix(26),(242,212,138,255),'lm')
        else:
            text(t,(t.width//2,56),'YOUR KINGDOM FELL!',inter(38,'ExtraBold'),(255,214,90,255),'mm',sp=6,shadow=(60,24,0,255));text(h,(16,24),'TROOPS (12)',inter(18,'SemiBold'),(242,212,138,255),'lm',sp=3)
    save(stack([t,h]),'r4%s.png'%v)

# ---------- 5. end screen ----------
def tint():
    im=HUD.copy();g=Image.new('RGBA',im.size);px=g.load()
    for y in range(im.height):
        k=y/(im.height-1);c=(int(80+90*k),int(16*k),int(16*k),int((.45+.23*k)*255))
        for x in range(im.width):px[x,y]=c
    return Image.alpha_composite(im,g)
def btn(im,b,s,primary):
    x0,y0,x1,y1=b;L=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(L)
    d.rounded_rectangle(b,9,fill=(246,226,160,255) if primary else (235,238,244,235),outline=GOLD if primary else (255,255,255,230),width=2 if primary else 1);im=Image.alpha_composite(im,L)
    text(im,((x0+x1)//2,(y0+y1)//2),s,inter(24 if primary else 19,'Bold' if primary else 'SemiBold'),(40,28,10,255) if primary else (30,34,46,255),'mm');return im
def row5(v):
    if v=='A':save(END,'r5A.png');return
    im=tint();cx=640
    if v=='B':
        text(im,(cx,112),'Your kingdom fell!',inter(46,'ExtraBold'),(255,214,90,255),'mm',shadow=(60,0,0,255));text(im,(cx,154),'Highwatch has fallen to the horde',inter(20,'Medium'),(235,235,235,255),'mm')
        text(im,(cx,212),'SCORE',inter(15,'SemiBold'),(255,226,160,255),'mm',sp=5);text(im,(cx,262),'1287',inter(88,'ExtraBold'),(255,255,85,255),'mm',shadow=(60,0,0,255))
        im=over(im,(cx-110,316,cx+110,344),(0,0,0,110),14);text(im,(cx,330),'Best: wave 0',inter(15,'SemiBold'),(255,235,170,255),'mm')
        for i,(k,val) in enumerate([('Waves survived','12'),('Zombies slain','87'),('Units lost','0')]):
            x=cx-250+i*250;text(im,(x,398),val,inter(34,'Bold'),(255,255,255,255),'mm');text(im,(x,430),k,inter(14,'Medium'),(235,205,175,255),'mm')
        text(im,(cx,478),'Earned: 0 gold   0 wood   0 stone   0 food     Best unit: -',inter(14,'Medium'),(240,220,168,255),'mm')
        im=btn(im,(cx-170,520,cx+170,576),'Play again',True);text(im,(cx,606),'Title Screen',inter(18,'SemiBold'),(255,240,225,255),'mm');ImageDraw.Draw(im).line([(cx-48,618),(cx+48,618)],fill=(255,240,225,160),width=1)
    else:
        card=(cx-270,70,cx+270,650);im=over(im,card,(14,18,28,232),18,(255,255,255,50));im=over(im,(card[0]+1,card[1]+1,card[2]-1,card[3]-1),(0,0,0,0),17,GOLD)
        text(im,(cx,122),'Your kingdom fell!',inter(38,'ExtraBold'),(255,214,90,255),'mm');text(im,(cx,162),'Highwatch has fallen to the horde',inter(17,'Medium'),(220,224,232,255),'mm')
        ImageDraw.Draw(im).line([(cx-200,190),(cx+200,190)],fill=(255,255,255,50))
        text(im,(cx,222),'Score',inter(15,'Medium'),(200,210,225,255),'mm');text(im,(cx,272),'1287',inter(56,'ExtraBold'),(255,255,85,255),'mm')
        grid=[('Waves survived','12'),('Zombies slain','87'),('Units lost','0'),('Best wave','0')]
        for i,(k,val) in enumerate(grid):
            x=cx-232+(i%2)*236;y=330+(i//2)*70;im=over(im,(x,y,x+228,y+60),(255,255,255,22),9,(255,255,255,40));text(im,(x+14,y+30),k,inter(15,'Medium'),(200,210,225,255),'lm');text(im,(x+214,y+30),val,inter(26,'Bold'),(255,255,255,255),'rm')
        text(im,(cx,486),'Earned: 0 gold   0 wood   0 stone   0 food',inter(14,'Medium'),(240,220,168,255),'mm');text(im,(cx,510),'Best unit: -',inter(14,'Medium'),(196,163,122,255),'mm')
        im=btn(im,(cx-232,548,cx-6,614),'Play again',True);im=btn(im,(cx+6,548,cx+232,614),'Title Screen',False)
    save(im,'r5%s.png'%v)

for v in 'ABC':
    for f in(row1,row2,row3,row4,row5):f(v)
SEC=[('Liseré doré sur panneaux et slots verre',['rien (capture réelle)','liseré doré 1 px (maquette sur capture)','liseré doré + coins biseautés pixel (maquette sur capture)'],'r1'),
 ('Panneau des troupes',['actuel (capture réelle)','liste compacte icône + PV + barre (maquette; PV d\'exemple, le jeu n\'a pas ce champ affiché)','cartes par type avec compteur (maquette)'],'r2'),
 ('Slots du menu de construction',['actuel (capture réelle)','icône + coût, nom en infobulle (maquette, vraies icônes et coûts)','icône seule, coût au survol (maquette)'],'r3'),
 ('Police des titres',['actuelle: Inter (capture réelle)','Pixelify Sans pour les titres seulement, corps inchangé (maquette, vraie police)','police actuelle en capitales espacées (maquette)'],'r4'),
 ('Écran de fin',['actuel (capture réelle; chiffres de test)','3 niveaux: score, détails, actions (maquette)','carte verre centrale (maquette)'],'r5')]
spec={'title':'Look: liseré, troupes, construction, titres, écran de fin','intro':'Ligne par ligne, A = rendu actuel du jeu (capture réelle 1280x720, v91 branche v84) ; B et C = maquettes dessinées sur ces captures. Réponds avec un code comme "1A 2B 3C 4A 5B".',
 'sections':[{'name':n,'variants':[{'id':'ABC'[i],'img':p+'ABC'[i]+'.png','note':notes[i]} for i in range(3)]} for n,notes,p in SEC]}
json.dump(spec,open(P('spec.json'),'w'),ensure_ascii=False,indent=1)
