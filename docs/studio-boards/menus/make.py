#!/usr/bin/env python3
"""Menus board images. A = real 1280x720 captures (cap_title.py, cap_game.py, cap_dis.py: 3D plate + 2D UI layers composited, polices offline).
B / C = Pillow mock-ups drawn over those captures (real plate, real buttons / slots where possible, panels redrawn). Writes r*.png and spec.json.
Run: python3 make.py && python3 ../../../tools/board.py spec.json board.html"""
import json,sys
sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lib import *
def I(n):return Image.open(P(n)).convert('RGBA')
PL=I('plate.png');GP=I('pg_plate.png')
def comp(plate,ui):return Image.alpha_composite(plate,I(ui))
BLK=Image.new('RGBA',(1280,720),(0,0,0,255))
# ---------------- 1. panel frame and background ----------------
def dirt(base):
    s=base.crop((0,0,290,720));row=Image.new('RGBA',(1450,720))
    for i in range(5):row.paste(s if i%2==0 else s.transpose(Image.FLIP_LEFT_RIGHT),(i*290,0))
    return row.crop((0,0,1280,720))
def row1(v):
    base=comp(BLK,'ui_settings.png')
    if v=='A':save(base.crop((230,0,1050,720)),'r1A.png');return
    bg=dirt(base);b=(284,4,996,716) if v=='C' else (292,8,988,712)
    bg=panel(bg,v,230,True)
    bg.alpha_composite(base.crop((308,24,972,696)),(308,24))
    bg=panel(bg,v,230,False,fill=False)
    save(bg.crop((230,0,1050,720)),'r1%s.png'%v)
# patch: panel box differs per variant (see row1), keep one source of truth
def row1(v,_f=row1):
    base=comp(BLK,'ui_settings.png')
    if v=='A':save(base.crop((230,0,1050,720)),'r1A.png');return
    bg=dirt(base);b=(284,4,996,716) if v=='C' else (292,8,988,712)
    bg=panel(bg,b,v,230,True)
    bg.alpha_composite(base.crop((308,24,972,696)),(308,24))
    bg=panel(bg,b,v,230,False,fill=False)
    save(bg.crop((230,0,1050,720)),'r1%s.png'%v)
# ---------------- 2. main-menu buttons: rest / hover / disabled ----------------
def sheet_bg():return blur_dark(PL.crop((240,170,1040,620)),3,.38,0)
CAP=[('Repos','Multiplayer (Co-op)'),('Survol / sélection clavier','Singleplayer'),('Désactivé','Load game')]
def btn_B(im,b,label,st):
    x0,y0,x1,y1=b;f=pix(27,600)
    if st=='rest':
        im=poly_fill(im,stair(b,4),(40,52,78),(20,27,42),235);im=line_poly(im,stair((x0+1,y0+1,x1-1,y1-1),4),rgba(GOLD,150),2);col=TXT
    elif st=='hover':
        g=lay(im);ImageDraw.Draw(g).polygon(stair((x0-6,y0-6,x1+6,y1+6),4),fill=rgba(GOLDB,70));im=Image.alpha_composite(im,g.filter(ImageFilter.GaussianBlur(8)))
        im=poly_fill(im,stair(b,4),(66,84,124),(32,44,76),245);im=line_poly(im,stair((x0+1,y0+1,x1-1,y1-1),4),rgba(GOLDB),2)
        im=rect(im,(x0+14,y0+5,x1-14,y0+6),(255,255,255,55))
        for sd,cx in((-1,x0+34),(1,x1-34)):im=diamond(im,cx,(y0+y1)//2,7,GOLDB);im=diamond(im,cx,(y0+y1)//2,3,NAVY2)
        col=GOLDB
    else:
        im=poly_fill(im,stair(b,4),(30,34,44),(22,25,33),200);im=line_poly(im,stair((x0+1,y0+1,x1-1,y1-1),4),rgba(GOLDD,130),2);col=(128,120,104)
        cx=x0+34;cy=(y0+y1)//2;L=lay(im);d=ImageDraw.Draw(L);d.rectangle([cx-7,cy-2,cx+7,cy+9],fill=rgba(col));d.arc([cx-5,cy-11,cx+5,cy+3],180,360,fill=rgba(col),width=3);im=Image.alpha_composite(im,L)
    txt(im,((x0+x1)/2,(y0+y1)/2+1),label,f,col,'mm',shadow=(0,0,0,170));return im
def btn_C(im,b,label,st):
    x0,y0,x1,y1=b;f=pix(27,600);L=lay(im);d=ImageDraw.Draw(L)
    base,hi,lo,out={'rest':((86,98,124),(138,150,180),(46,52,70),(12,16,26)),'hover':((100,118,162),(160,180,226),(52,62,98),GOLDB),'dis':((56,60,70),(76,80,92),(42,45,54),(18,20,26))}[st]
    d.rectangle(b,fill=rgba(out));d.rectangle([x0+3,y0+3,x1-3,y1-3],fill=rgba(base));d.rectangle([x0+3,y0+3,x1-3,y0+6],fill=rgba(hi));d.rectangle([x0+3,y0+3,x0+6,y1-3],fill=rgba(hi))
    d.rectangle([x0+3,y1-7,x1-3,y1-3],fill=rgba(lo));d.rectangle([x1-7,y0+3,x1-3,y1-3],fill=rgba(lo))
    if st=='dis':
        for i in range(x0+6,x1-6,10):d.line([(i,y0+8),(i-26,y1-8)],fill=(0,0,0,26),width=2)
    if st=='hover':
        d.rectangle([x0+3,y1-5,x1-3,y1-3],fill=rgba(GOLD))
    im=Image.alpha_composite(im,L);col={'rest':TXT,'hover':GOLDB,'dis':(120,118,110)}[st]
    if st=='hover':txt(im,(x0+30,(y0+y1)/2),'>',f,GOLDB,'lm',shadow=None)
    txt(im,((x0+x1)/2,(y0+y1)/2+1),label,f,col,'mm',shadow=(0,0,0,200));return im
def row2(v):
    bg=sheet_bg()
    for i,(cap,lab) in enumerate(CAP):
        y=64+i*128;txt(bg,(100,y-26),cap.upper(),inter(17,'SemiBold'),(210,196,160),'la',shadow=None)
        st=['rest','hover','dis'][i]
        if v=='A':
            ui=I(['ui_rest.png','ui_hover.png','ui_dis.png'][i]);by=[296,236,356][i]
            crop=ui.crop((330,by-10,950,by+52));bg.alpha_composite(crop,(90,y-10))
        else:bg=(btn_B if v=='B' else btn_C)(bg,(100,y,700,y+48),lab,st)
    save(bg,'r2%s.png'%v)
# ---------------- 3. game mode screen ----------------
def card(im,b,title,sub,icon,rows,sel=False,pill='Play'):
    x0,y0,x1,y1=b;cx=(x0+x1)//2
    if sel:
        g=lay(im);ImageDraw.Draw(g).polygon(stair((x0-8,y0-8,x1+8,y1+8),4),fill=rgba(GOLDB,60));im=Image.alpha_composite(im,g.filter(ImageFilter.GaussianBlur(10)))
    im=panel(im,b,'A',238 if sel else 226,True)
    if sel:im=line_poly(im,stair((x0-5,y0-5,x1+5,y1+5),4),(246,246,255,255),3)
    im=paste_ico(im,icon,cx-30,y0+22,5)
    txt(im,(cx,y0+94),title,pix(38,700),GOLDB if sel else TXT,'ma')
    txt(im,(cx,y0+146),sub,inter(19,'Medium'),DIM,'ma',shadow=(0,0,0,150),so=1)
    im=orn_line(im,cx,y0+186,x1-x0-70)
    ry=y0+206;rh=48
    for i,(ok,t) in enumerate(rows):
        L=lay(im);ImageDraw.Draw(L).rectangle([x0+12,ry,x1-12,ry+rh-2],fill=(0,0,0,70) if i%2==0 else (255,255,255,12));im=Image.alpha_composite(im,L)
        im=paste_ico(im,'check' if ok else 'cross',x0+26,ry+(rh-24)//2-1,2)
        txt(im,(x0+64,ry+rh//2-1),t,inter(20,'Medium'),TXT if ok else (150,140,128),'lm',shadow=(0,0,0,150),so=1);ry+=rh
    im=glass_pill(im,(x0+40,y1-70,x1-40,y1-26),pill,inter(22,'SemiBold'),hot=sel);return im
def footer(im,items,y=672,h=48,center=True,fs=20):
    L=lay(im);d=ImageDraw.Draw(L)
    for j in range(h):d.line([(0,y+j),(im.width,y+j)],fill=(2,3,8,int(200*(j/h)**.6)))
    d.rectangle([0,y,im.width,y],fill=rgba(GOLD,110));im=Image.alpha_composite(im,L)
    f=pix(fs,700);fl=inter(fs,'Medium');W=0;parts=[]
    for k,l in items:parts.append((k,l,int(tw(k,f))+28,int(tw(l,fl))));W+=int(tw(k,f))+28+10+int(tw(l,fl))+34
    x=(im.width-W+34)//2 if center else 40;cy=y+h//2+4
    for k,l,kw,lw in parts:
        im,_=keycap(im,x,cy-20,k,f,40,14);txt(im,(x+kw+10,cy+1),l,fl,TXT,'lm',shadow=(0,0,0,170),so=1);x+=kw+10+lw+34
    return im
HEAD=('Choose your game','Pick how you want to hold the night.')
def row3(v):
    if v=='A':save(comp(PL,'ui_rest.png'),'r3A.png');return
    im=blur_dark(PL,9,.5,.65)
    txt(im,(640,36),HEAD[0],pix(52,700),GOLDB,'ma');im=orn_line(im,640,108,520);txt(im,(640,122),HEAD[1],inter(20,'Medium'),DIM,'ma',shadow=(0,0,0,170),so=1)
    SOLO=[(1,'Pause and game speed'),(1,'Save and load'),(1,'Records and achievements'),(0,'Second player')]
    COOP=[(1,'2 players, one world'),(1,'Chat with your ally'),(1,'Automatic resync'),(0,'Save and load')]
    JOIN=[(1,"Enter the host's code"),(1,'Same world as the host'),(1,'Chat with the host'),(0,'Choose the world')]
    if v=='B':
        im=card(im,(150,176,620,656),'Singleplayer','You alone against the horde','person',SOLO+[(0,'Test mode (F10): no records')][:0],True,'Play')
        im=card(im,(660,176,1130,656),'Co-op','Host a room or join one with a code','plus',COOP,False,'Host / Join')
        im=paste_ico(im,'person',0,0,0) if False else im
    else:
        W=372;xs=[44,454,864]
        im=card(im,(xs[0],176,xs[0]+W,656),'Solo','You alone against the horde','person',SOLO,True,'Play')
        im=card(im,(xs[1],176,xs[1]+W,656),'Co-op','Host a room for a friend','plus',COOP,False,'Host')
        im=card(im,(xs[2],176,xs[2]+W,656),'Join','Enter a friend\'s room code','globe',JOIN,False,'Join')
    im=footer(im,[('Esc','Back'),('Enter','Select')]);save(im,'r3%s.png'%v)
# ---------------- 4. key footer ----------------
def padicon(im,x,y):
    L=lay(im);d=ImageDraw.Draw(L);d.rounded_rectangle((x,y+6,x+54,y+32),9,fill=(70,82,108,255),outline=rgba(GOLD),width=2);d.rectangle([x+9,y+17,x+21,y+20],fill=rgba(TXT));d.rectangle([x+14,y+12,x+16,y+25],fill=rgba(TXT))
    d.ellipse([x+34,y+12,x+40,y+18],fill=rgba(GOLDB));d.ellipse([x+42,y+19,x+48,y+25],fill=rgba(GOLD));return Image.alpha_composite(im,L)
def tapicon(im,x,y):
    L=lay(im);d=ImageDraw.Draw(L);d.ellipse([x,y+4,x+30,y+34],outline=rgba(GOLDB),width=3);d.ellipse([x+9,y+13,x+21,y+25],fill=rgba(TXT));return Image.alpha_composite(im,L)
def row4(v):
    base=comp(PL,'ui_setup.png');base=blur_dark(PL,0,.0,0) if False else base
    if v=='A':save(base,'r4A.png');return
    if v=='B':im=footer(base,[('Esc','Back'),('Enter','Select')])
    else:
        im=base;L=lay(im);d=ImageDraw.Draw(L)
        for j in range(60):d.line([(0,660+j),(1280,660+j)],fill=(2,3,8,int(210*(j/60)**.6)))
        d.rectangle([0,660,1280,660],fill=rgba(GOLD,110));im=Image.alpha_composite(im,L)
        f=pix(18,700);fl=inter(18,'Medium');x=30;cy=694
        for k,l in[('Up/Down','Move'),('Tab','Next tab'),('Enter','Select'),('Esc','Back')]:
            im,w=keycap(im,x,cy-18,k,f,36,10);txt(im,(x+w+8,cy+1),l,fl,TXT,'lm',shadow=(0,0,0,170),so=1);x+=w+8+int(tw(l,fl))+22
        im=rect(im,(x,cy-16,x+1,cy+16),rgba(GOLD,120));x+=18
        im=padicon(im,x,cy-20);x+=64;txt(im,(x,cy+1),'D-pad Move   A Select   B Back',fl,TXT,'lm',shadow=(0,0,0,170),so=1);x+=int(tw('D-pad Move   A Select   B Back',fl))+22
        im=rect(im,(x,cy-16,x+1,cy+16),rgba(GOLD,120));x+=18
        im=tapicon(im,x,cy-20);x+=42;txt(im,(x,cy+1),'Tap: select   X: back',fl,TXT,'lm',shadow=(0,0,0,170),so=1)
    save(im,'r4%s.png'%v)
# ---------------- 5. title background ----------------
def row5(v):
    ui=I('ui_rest.png')
    if v=='A':im=Image.alpha_composite(PL,ui)
    else:
        pl=blur_dark(PL,{'B':4,'C':12}[v],{'B':.2,'C':.55}[v],{'B':.45,'C':.85}[v]);im=Image.alpha_composite(pl,ui)
    save(im,'r5%s.png'%v)
# ---------------- 6. detail panel ----------------
HUDU=Image.alpha_composite(GP,I('g_unit.png'))
KN=[('heart','Health','130'),('sword','Damage','16  (every 0.8 s)'),('range','Range','14  (melee)'),('speed','Speed','110'),('clock','Training','22 s')]
FLAV='He holds the wall so the others do not have to.'
def chip(im,x,y,label,col=GOLD):
    f=pix(17,700);w=int(tw(label,f))+22
    im=poly_fill(im,stair((x,y,x+w,y+30),2),(36,44,64),(22,28,44),255);im=line_poly(im,stair((x+1,y+1,x+w-1,y+29),2),rgba(col),2)
    txt(im,(x+w/2,y+16),label,f,col,'mm',shadow=None);return im,w
def hexbadge(im,cx,cy,r,label):
    s=3;S=Image.new('RGBA',(2*r//s+2,2*r//s+2),(0,0,0,0));d=ImageDraw.Draw(S);c=r//s
    pts=[(c+int(c*math.cos(math.radians(60*i-30))),c+int(c*math.sin(math.radians(60*i-30)))) for i in range(6)]
    d.polygon(pts,fill=rgba(GOLDD));pts2=[(c+int((c-1)*math.cos(math.radians(60*i-30))),c+int((c-1)*math.sin(math.radians(60*i-30)))) for i in range(6)]
    d.polygon(pts2,outline=rgba(GOLDB),fill=(34,44,70,255))
    S=S.resize((S.width*s,S.height*s),Image.NEAREST);L=lay(im);L.alpha_composite(S,(cx-S.width//2,cy-S.height//2));im=Image.alpha_composite(im,L)
    txt(im,(cx,cy+1),label,pix(int(r*.8),700),GOLDB,'mm',shadow=(0,0,0,170),so=1);return im
def row6(v):
    im=HUDU.copy()
    if v=='A':save(im,'r6A.png');return
    im=Image.alpha_composite(im,Image.new('RGBA',im.size,(0,0,0,70)))
    if v=='B':
        b=(800,110,1250,590);im=panel(im,b,'A',226);x=b[0]+26
        txt(im,(x,b[1]+22),'Knight',pix(40,700),GOLDB,'la');im,_=chip(im,x,b[1]+74,'FRONT LINE')
        im=orn_line(im,(b[0]+b[2])//2,b[1]+124,b[2]-b[0]-60)
        y=b[1]+146
        for k,(ic,lab,val) in enumerate(KN):
            if k%2==0:
                L=lay(im);ImageDraw.Draw(L).rectangle([b[0]+14,y-2,b[2]-14,y+36],fill=(0,0,0,70));im=Image.alpha_composite(im,L)
            im=paste_ico(im,ic,x,y+2,3);txt(im,(x+52,y+17),lab,inter(21,'SemiBold'),DIM,'lm',shadow=None);txt(im,(b[2]-28,y+17),val,inter(21,'Bold'),TXT,'rm',shadow=None);y+=42
        fi=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Italic.otf',20)
        txt(im,(x,y+12),'He holds the wall so',fi,(196,176,140),'la',shadow=None);txt(im,(x,y+38),'the others do not have to.',fi,(196,176,140),'la',shadow=None)
    else:
        b=(740,70,1252,676);im=panel(im,b,'C',232);x=b[0]+34
        im=hexbadge(im,b[0]+62,b[1]+62,40,'II');txt(im,(b[0]+120,b[1]+34),'Knight',pix(42,700),GOLDB,'la')
        im,w=chip(im,b[0]+122,b[1]+88,'FRONT LINE');im,_=chip(im,b[0]+122+w+10,b[1]+88,'VETERAN',(255,170,70))
        y=b[1]+130;im=poly_fill(im,stair((x,y,x+104,y+104),4),(236,240,248),(214,220,232),235);im=line_poly(im,stair((x+1,y+1,x+103,y+103),4),rgba(GOLD),2)
        im=paste_ico(im,'helm',x+10,y+8,7)
        ax=x+130;yy=y
        for ic,lab,val in KN[:4]:
            im=paste_ico(im,ic,ax,yy+1,2);txt(im,(ax+34,yy+12),lab,inter(19,'SemiBold'),DIM,'lm',shadow=None);txt(im,(b[2]-34,yy+12),val.split('  ')[0],inter(21,'Bold'),TXT,'rm',shadow=None);yy+=27
        yy=y+118;txt(im,(x,yy),FLAV,ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Italic.otf',19),(196,176,140),'la',shadow=None)
        fb=(x-6,y+196,b[2]-28,y+332);L=lay(im);d=ImageDraw.Draw(L);d.rectangle(fb,outline=rgba(GOLD,200),width=2);im=Image.alpha_composite(im,L)
        tl='Upgrades';f=pix(21,700);tx=(fb[0]+fb[2])//2;gw=int(tw(tl,f))+30;L=lay(im);ImageDraw.Draw(L).rectangle([tx-gw//2,fb[1]-4,tx+gw//2,fb[1]+4],fill=(14,19,30,255));im=Image.alpha_composite(im,L)
        txt(im,(tx,fb[1]),tl,f,GOLDB,'mm',shadow=None)
        sx=fb[0]+26
        for i in range(4):
            sb=(sx+i*112,fb[1]+28,sx+i*112+92,fb[1]+28+92)
            im=poly_fill(im,stair(sb,4),(224,230,240),(196,204,220),215 if i<2 else 120);im=line_poly(im,stair((sb[0]+1,sb[1]+1,sb[2]-1,sb[3]-1),4),rgba(GOLD),2)
            if i==0:im=paste_ico(im,'sword',sb[0]+14,sb[1]+14,5)
            elif i==1:
                im=paste_ico(im,'shield',sb[0]+14,sb[1]+14,5);im=line_poly(im,stair((sb[0]-5,sb[1]-5,sb[2]+5,sb[3]+5),4),(250,250,255,255),3)
            else:
                L=lay(im);d=ImageDraw.Draw(L);cx=(sb[0]+sb[2])//2;cy=(sb[1]+sb[3])//2
                d.line([(cx-16,cy-16),(cx+16,cy+16)],fill=(60,70,92,110),width=5);d.line([(cx+16,cy-16),(cx-16,cy+16)],fill=(60,70,92,110),width=5);im=Image.alpha_composite(im,L)
        txt(im,(x,fb[3]+22),'Cost',inter(19,'SemiBold'),DIM,'la',shadow=None);cxx=x+64
        for ic,val in(('coin','150'),('stone','30'),('food','40')):
            im=paste_ico(im,ic,cxx,fb[3]+18,2);txt(im,(cxx+30,fb[3]+30),val,inter(21,'Bold'),TXT,'lm',shadow=None);cxx+=112
        im=glass_pill(im,(x,b[3]-66,x+170,b[3]-26),'Back  [Esc]',inter(19,'SemiBold'));im=glass_pill(im,(b[2]-34-210,b[3]-66,b[2]-34,b[3]-26),'Train more  [T]',inter(19,'SemiBold'),hot=True)
    save(im,'r6%s.png'%v)
# ---------------- 7. build menu tabs ----------------
BASE7=Image.alpha_composite(GP,I('g_base.png'))
SLOTS7=[(308,523,375,597),(383,523,450,597),(458,523,523,597),(531,523,597,597),(605,523,671,597),(693,523,759,597),(767,523,833,597),(841,523,908,597)]
def tabs(im,x0,y,names,active,dots,v):
    f=pix(21,700);x=x0
    for i,(n,ic) in enumerate(names):
        w=int(tw(n,f))+84;on=i==active;b=(x,y,x+w,y+44)
        im=poly_fill(im,stair(b,4),(34,44,66) if on else (16,21,32),(20,27,40) if on else (10,14,22),240 if on else 215)
        im=line_poly(im,stair((b[0]+1,b[1]+1,b[2]-1,b[3]-1),4),rgba(GOLDB if on else GOLDD,255 if on else 200),2)
        if on:im=rect(im,(b[0]+3,b[3]-2,b[2]-3,b[3]+3),(24,32,48,255))
        im=paste_ico(im,ic,x+16,y+8,2);txt(im,(x+52,y+23),n,f,GOLDB if on else DIM,'lm',shadow=(0,0,0,170),so=1)
        if v=='C' and dots.get(i):
            cx,cy=x+w-6,y+2;L=lay(im);d=ImageDraw.Draw(L);d.ellipse([cx-13,cy-13,cx+13,cy+13],fill=(232,140,36,255),outline=(70,30,6,255),width=3);im=Image.alpha_composite(im,L)
            txt(im,(cx,cy+1),str(dots[i]),pix(17,700),(255,248,226),'mm',shadow=None)
        x+=w+6
    return im
def row7(v):
    if v=='A':save(BASE7.crop((0,440,940,720)),'r7A.png');return
    im=Image.alpha_composite(GP,Image.new('RGBA',GP.size,(0,0,0,0)))
    # real slots cut from the capture, panel redrawn around them
    src=BASE7;pan=(28,536,918,640)
    im=panel(im,pan,'A',236)
    for sl in SLOTS7:
        im.alpha_composite(src.crop(sl),(sl[0]-290+60-(-0)+0,sl[1]-523+552)) if False else None
    sx=48;slots=[]
    for k,sl in enumerate(SLOTS7):
        c=src.crop(sl);im.alpha_composite(c,(sx,552));
        if v=='C' and k in(1,4):
            L=lay(im);d=ImageDraw.Draw(L);d.rectangle([sx+c.width-26,552+6,sx+c.width-8,552+22],fill=rgba(GOLDB));im=Image.alpha_composite(im,L);txt(im,(sx+c.width-17,552+15),'NEW',pix(10,700),(60,34,6),'mm',shadow=None)
        sx+=c.width+14
    names=[('Train','helm'),('Build','house'),('Command','hammer')]
    im=tabs(im,28,490,names,1,{1:2,2:1},v)
    if v=='C':
        im,_=keycap(im,28+3*168+20,494,'Q',pix(17,700),36,10);im,_=keycap(im,28+3*168+70,494,'E',pix(17,700),36,10)
        txt(im,(28+3*168+124,512),'switch tab',inter(17,'Medium'),DIM,'lm',shadow=None)
    # minimap column and top bar kept from the real capture: paste right part back
    im.alpha_composite(src.crop((940,440,1280,720)),(940,440))
    im.alpha_composite(src.crop((0,0,1280,40)),(0,0))
    save(im.crop((0,440,1280,720)).crop((0,0,940,280)),'r7%s.png'%v)
# ---------------- 8. title screen / key art ----------------
def row8(v):
    ui=I('ui_rest.png')
    if v=='A':save(Image.alpha_composite(PL,ui),'r8A.png');return
    plate=blur_dark(PL,2,.42,.55);plate=checker(plate,7,32)
    gear=ui.crop((1210,8,1270,56))
    ui2=ui.copy();L=Image.new('RGBA',ui.size,(0,0,0,0));ui2.paste(L.crop((0,0,1280,225)),(0,0));ui2.paste(L.crop((0,0,1280,80)),(0,640))
    im=Image.alpha_composite(embers(plate,100,7),ui2)
    b=(28,56,1252,672)
    im=panel(im,b,'C',0,False,fill=False)
    # title on the top filet: knock out the line behind the text, then draw it
    f=pix(104,700);cx=640;w=int(tw('NARANXIA',f));gap=(cx-w//2-30,b[1]-6,cx+w//2+30,b[1]+8)
    pl2=Image.alpha_composite(plate,ui2);im.paste(pl2.crop(gap),gap[:2])
    L=lay(im);d=ImageDraw.Draw(L)
    for dx,dy in((6,6),):d.text((cx+dx,b[1]+dy),'NARANXIA',font=f,fill=(0,0,0,170),anchor='mm')
    d.text((cx,b[1]),'NARANXIA',font=f,fill=(255,184,70,255),anchor='mm',stroke_width=5,stroke_fill=(78,34,8,255));im=Image.alpha_composite(im,L)
    L=lay(im);ImageDraw.Draw(L).text((cx,b[1]-14),'NARANXIA',font=f,fill=(255,236,170,120),anchor='mm');im=Image.alpha_composite(im,L) if False else im
    sf=inter(30,'SemiBold');g=lay(im);ImageDraw.Draw(g).text((cx,b[1]+98),'Survive the night!',font=sf,fill=(60,190,255,200),anchor='mm');im=Image.alpha_composite(im,g.filter(ImageFilter.GaussianBlur(6)))
    txt(im,(cx,b[1]+98),'Survive the night!',sf,(200,243,255),'mm',shadow=(4,3,8,200))
    im=orn_line(im,cx,b[1]+130,560)
    if v=='C':
        by=b[3];f2=pix(27,700);label='v91  ·  AUTUMN';bw=int(tw(label,f2))//2+36
        L=lay(im);d=ImageDraw.Draw(L)
        for sd in(-1,1):d.polygon([(cx+sd*(bw-4),by-18),(cx+sd*(bw+62),by-18),(cx+sd*(bw+44),by),(cx+sd*(bw+62),by+18),(cx+sd*(bw-4),by+18)],fill=rgba(GOLDD),outline=rgba(GOLD))
        im=Image.alpha_composite(im,L)
        im=poly_fill(im,stair((cx-bw,by-24,cx+bw,by+24),4),(226,184,86),(160,120,48),255);im=line_poly(im,stair((cx-bw+1,by-23,cx+bw-1,by+23),4),rgba(GOLDB),2)
        im=rect(im,(cx-bw+10,by-17,cx+bw-10,by-16),(255,240,190,140))
        txt(im,(cx,by+1),label,f2,(52,32,8),'mm',shadow=(255,230,160,110),so=1)
    save(im,'r8%s.png'%v)
for r in(row1,row2,row3,row4,row5,row6,row7,row8):
    for v in'ABC':r(v);print(r.__name__,v,flush=True)
S=[('Cadre et fond des panneaux de menu (Réglages pris en exemple)',['capture réelle : liseré doré 1 px, coins en escalier','maquette : double filet doré (liseré extérieur plein, intérieur atténué), losanges au milieu','maquette : coins ornés à volutes carrées + filet intérieur']),
 ('Boutons du menu principal : repos, survol, désactivé',['capture réelle des 3 états (le désactivé est un état forcé sur « Load game » : texte peu lisible)','maquette : plaques bleu nuit à liseré doré, survol avec losanges et lueur, cadenas si désactivé','maquette : bouton pierre biseauté style Minecraft, survol or + chevron, désactivé hachuré']),
 ('Écran de choix du mode de jeu',['capture réelle : aujourd\'hui trois boutons du menu titre (Singleplayer / Multiplayer / Join a game)','maquette : 2 cartes (Solo, Co-op) à lignes ✓/✗, fond flou, pied de page','maquette : 3 cartes (Solo, Co-op hôte, Rejoindre avec code) à lignes ✓/✗']),
 ('Pied de page de touches sur tous les menus (écran Nouveau royaume pris en exemple)',['capture réelle : rien','maquette : Back [Esc] / Select [Entrée]','maquette : clavier + manette + tactile']),
 ('Fond du menu titre : flou + assombri + vignette',['capture réelle : scène 3D nette (rien de plus)','maquette : flou léger, 22 % sombre, vignette douce','maquette : flou fort, 50 % sombre, vignette marquée']),
 ('Panneau de détail d\'une unité (le Chevalier ici ; même gabarit pour les bâtiments)',['capture réelle : aucune fiche, seulement Comportement / Groupe (les stats sont dans l\'infobulle)','maquette : titre pixel, étiquette de rôle, 5 lignes d\'attributs à icône, texte d\'ambiance (stats réelles du jeu)','maquette : badge hexagonal de niveau, portrait, attributs, cadre « Upgrades » à titre sur le filet, slots vides à croix, coût, boutons']),
 ('Menu de construction : onglets à icônes',['capture réelle : trois blocs Train / Build / Command dans un seul panneau','maquette : onglets Train / Build / Command, un seul contenu à la fois (vrais slots de la capture)','maquette : onglets + pastilles « 2 nouveaux », étiquettes NEW sur les slots, touches Q / E pour changer d\'onglet']),
 ('Écran titre / affiche',['capture réelle : logo + menu, sans cadre','maquette : cadre doré à coins ornés, titre sur le filet du haut, braises dorées (animées en jeu, fixes ici), damier quasi invisible','maquette : idem + badge doré « v91 · AUTUMN » sur le filet du bas (version + saison)'])]
spec={'title':'Menus : cadres, boutons, modes de jeu, pied de page, fond, fiche, onglets, affiche','intro':'A = rendu actuel en vraie capture 1280x720 (polices hors ligne) ; B et C = maquettes Pillow dessinées sur ces captures (vraie scène 3D, vrais boutons et slots quand c\'est possible). Style seulement : art original Naranxia (bleu nuit, or, Pixelify Sans). Réponds avec un code comme "1B 2C 3C 4B 5B 6C 7C 8C". Les textes des maquettes sont en anglais comme le jeu.',
 'sections':[{'name':n,'variants':[{'id':'ABC'[i],'img':'r%d%s.png'%(k+1,'ABC'[i]),'note':nt} for i,nt in enumerate(notes)]} for k,(n,notes) in enumerate(S)]}
json.dump(spec,open(P('spec.json'),'w'),ensure_ascii=False,indent=1);print('spec ok')
