"""Pillow helpers for the menus board: pixel frames (stair corners, double filet, ornate corners), icons, key caps, embers.
All art is original Naranxia (navy / gold, Pixelify Sans titles, Inter body). Device pixels, UI scale 2 like the game (1 css px = 2 px)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import os,random,math
D=os.path.dirname(os.path.abspath(__file__));P=lambda n:os.path.join(D,n)
GOLD=(184,149,76);GOLDB=(240,205,115);GOLDD=(104,82,40);NAVY=(20,27,40);NAVY2=(10,14,22);TXT=(240,232,214);DIM=(170,160,140)
GREEN=(98,200,140);RED=(222,84,84);BLUE=(47,125,246);STEEL=(190,198,210)
def pix(s,w=700):
    f=ImageFont.truetype(os.path.join(D,'..','look','fonts','p.ttf'),s)
    try:f.set_variation_by_axes([w])
    except Exception:pass
    return f
def inter(s,w='Bold'):return ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-%s.otf'%w,s)
def lay(im):return Image.new('RGBA',im.size,(0,0,0,0))
def rgba(c,a=255):return tuple(c)[:3]+(a,)
def txt(im,xy,s,f,fill,anchor='la',shadow=(0,0,0,190),so=2):
    d=ImageDraw.Draw(im)
    if shadow:d.text((xy[0]+so,xy[1]+so),s,font=f,fill=shadow,anchor=anchor)
    d.text(xy,s,font=f,fill=fill,anchor=anchor)
def tw(s,f):return ImageDraw.Draw(Image.new('L',(1,1))).textlength(s,font=f)
def stair(b,s=4):
    x0,y0,x1,y1=b;t=2*s
    return [(x0+t,y0),(x1-t,y0),(x1-t,y0+s),(x1-s,y0+s),(x1-s,y0+t),(x1,y0+t),(x1,y1-t),(x1-s,y1-t),(x1-s,y1-s),(x1-t,y1-s),(x1-t,y1),(x0+t,y1),(x0+t,y1-s),(x0+s,y1-s),(x0+s,y1-t),(x0,y1-t),(x0,y0+t),(x0+s,y0+t),(x0+s,y0+s),(x0+t,y0+s)]
def poly_fill(im,pts,c0,c1,a0,a1=None):
    """vertical gradient c0->c1 clipped to polygon; returns new image"""
    a1=a0 if a1 is None else a1
    xs=[p[0] for p in pts];ys=[p[1] for p in pts];x0,y0,x1,y1=int(min(xs)),int(min(ys)),int(max(xs))+1,int(max(ys))+1
    m=Image.new('L',(x1-x0,y1-y0),0);ImageDraw.Draw(m).polygon([(x-x0,y-y0) for x,y in pts],fill=255)
    g=Image.new('RGBA',(x1-x0,y1-y0));gd=ImageDraw.Draw(g);h=max(1,y1-y0-1)
    for j in range(y1-y0):
        k=j/h;gd.line([(0,j),(x1-x0,j)],fill=tuple(int(c0[i]+(c1[i]-c0[i])*k) for i in range(3))+(int(a0+(a1-a0)*k),))
    A=ImageChops.multiply(g.split()[3],m);g.putalpha(A);L=lay(im);L.paste(g,(x0,y0));return Image.alpha_composite(im,L)
def line_poly(im,pts,col,w=2,closed=True):
    L=lay(im);ImageDraw.Draw(L).line(pts+([pts[0]] if closed else []),fill=col,width=w);return Image.alpha_composite(im,L)
def rect(im,b,col):
    L=lay(im);ImageDraw.Draw(L).rectangle(b,fill=col);return Image.alpha_composite(im,L)
# ---- square-volute corner ornament, 9x9 cells (G gold, B bright, d dark) ----
VOL=["BBBBBBBBB",
     "BGGGGGGGG",
     "BG.......",
     "BG.BBBBB.",
     "BG.BGGGG.",
     "BG.BG....",
     "BG.BG.BB.",
     "BG.BG.BG.",
     "BG.......".replace('.','.')]
VPAL={'B':GOLDB,'G':GOLD,'d':GOLDD}
def bm(im,x,y,rows,pal,u=2,fx=False,fy=False):
    L=lay(im);d=ImageDraw.Draw(L);H=len(rows);W=len(rows[0])
    for j,r in enumerate(rows):
        for i,c in enumerate(r):
            if c in pal:
                xi=W-1-i if fx else i;yj=H-1-j if fy else j
                d.rectangle([x+xi*u,y+yj*u,x+xi*u+u-1,y+yj*u+u-1],fill=rgba(pal[c]))
    return Image.alpha_composite(im,L)
def corners(im,b,u=3,inset=-3):
    x0,y0,x1,y1=b;n=9*u
    im=bm(im,x0+inset,y0+inset,VOL,VPAL,u)
    im=bm(im,x1-n+1-inset,y0+inset,VOL,VPAL,u,fx=True)
    im=bm(im,x0+inset,y1-n+1-inset,VOL,VPAL,u,fy=True)
    im=bm(im,x1-n+1-inset,y1-n+1-inset,VOL,VPAL,u,fx=True,fy=True);return im
def diamond(im,cx,cy,r,col):
    L=lay(im);ImageDraw.Draw(L).polygon([(cx,cy-r),(cx+r,cy),(cx,cy+r),(cx-r,cy)],fill=rgba(col));return Image.alpha_composite(im,L)
def orn_line(im,cx,y,w,col=GOLD):
    """gold ornamental line: fading both sides, diamond in the middle, two small dots"""
    L=lay(im);d=ImageDraw.Draw(L)
    for i in range(int(w/2)):
        a=int(255*(1-i/(w/2))**.8)
        for sd in(-1,1):d.rectangle([cx+sd*(8+i),y,cx+sd*(8+i),y+1],fill=rgba(col,a))
    im=Image.alpha_composite(im,L);im=diamond(im,cx,y+1,6,GOLDB)
    for sd in(-1,1):im=diamond(im,cx+sd*20,y+1,3,GOLD)
    return im
def panel(im,b,style='A',alpha=205,shadow=True,s=4,fill=True):
    """A = current (gold hairline, stair corners). B = double gold filet. C = ornate corners + inner filet."""
    x0,y0,x1,y1=b
    if shadow:im=poly_fill(im,stair((x0,y0+6,x1,y1+6),s),(0,0,0),(0,0,0),70)
    pts=stair(b,s) if style!='C' else [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
    if fill:im=poly_fill(im,pts,(24,32,48),(10,14,22),alpha)
    if style=='A':im=line_poly(im,stair((x0+1,y0+1,x1-1,y1-1),s),rgba(GOLD,230),2)
    if style=='B':
        im=line_poly(im,stair((x0+1,y0+1,x1-1,y1-1),s),rgba(GOLD,235),2)
        im=line_poly(im,stair((x0+10,y0+10,x1-10,y1-10),s//2),rgba(GOLD,120),2)
        for cx,cy in(((x0+x1)//2,y0+1),((x0+x1)//2,y1-1)):im=diamond(im,cx,cy,7,GOLDB);im=diamond(im,cx,cy,3,NAVY2)
    if style=='C':
        L=lay(im);d=ImageDraw.Draw(L);d.rectangle([x0+1,y0+1,x1-1,y1-1],outline=rgba(GOLD,235),width=2);d.rectangle([x0+12,y0+12,x1-12,y1-12],outline=rgba(GOLD,90),width=2);im=Image.alpha_composite(im,L)
        im=corners(im,(x0,y0,x1,y1),3,-2)
    return im
def shadow_text_c(im,cx,y,s,f,fill,**k):txt(im,(cx,y),s,f,fill,'ma',**k)
# ---- 12x12 pixel icons drawn with primitives, upscaled NEAREST ----
def ico(name,u=3):
    c=Image.new('RGBA',(12,12),(0,0,0,0));d=ImageDraw.Draw(c)
    K=(18,12,16,255);G=rgba(GOLD);GB=rgba(GOLDB);S=rgba(STEEL);W=(120,86,52,255)
    if name=='heart':
        for r,row in enumerate([".KKK.KKK.","KRWRKRRRK","KRRRRRRRK","KRRRRRRRK",".KRRRRRK.","..KRRRK..","...KRK...","....K...."]):
            for i,ch in enumerate(row):
                if ch!='.':d.point((i+1,r+2),fill={'K':(40,8,10,255),'R':(224,52,60,255),'W':(255,170,170,255)}[ch])
    elif name=='sword':
        d.line([(10,1),(4,7)],fill=S,width=1);d.line([(11,2),(5,8)],fill=(120,128,140,255),width=1);d.line([(10,2),(5,7)],fill=(235,240,248,255));d.line([(2,6),(6,10)],fill=GB,width=1);d.line([(3,8),(1,10)],fill=W,width=1);d.point((0,11),fill=G)
    elif name=='shield':
        d.polygon([(2,1),(9,1),(9,6),(5,10),(2,6)],fill=(52,96,190,255),outline=G);d.line([(5,2),(5,8)],fill=GB);d.line([(3,4),(8,4)],fill=GB)
    elif name=='speed':
        for o in(0,4):d.line([(1+o,2),(4+o,6),(1+o,10)],fill=GB if o else G,width=1)
    elif name=='range':
        d.ellipse([1,1,10,10],outline=GB);d.ellipse([3,3,8,8],outline=G);d.rectangle([5,5,6,6],fill=(230,80,70,255))
    elif name=='coin':
        d.ellipse([1,1,10,10],fill=(246,200,60,255),outline=(150,100,20,255));d.line([(5,3),(5,8)],fill=(170,120,20,255))
    elif name=='stone':
        d.polygon([(1,8),(3,3),(8,2),(10,6),(9,10),(3,10)],fill=(160,166,178,255),outline=(70,76,90,255))
    elif name=='food':
        d.ellipse([2,3,9,10],fill=(214,64,48,255),outline=(100,20,20,255));d.line([(6,3),(7,1)],fill=(70,140,60,255))
    elif name=='clock':
        d.ellipse([1,1,10,10],outline=GB);d.line([(5,5),(5,2)],fill=GB);d.line([(5,5),(8,6)],fill=GB)
    elif name=='check':
        d.line([(1,6),(4,9),(10,2)],fill=rgba(GREEN),width=2)
    elif name=='cross':
        d.line([(2,2),(9,9)],fill=rgba(RED),width=2);d.line([(9,2),(2,9)],fill=rgba(RED),width=2)
    elif name=='house':
        d.polygon([(0,6),(5,1),(10,6)],fill=(196,64,48,255),outline=K);d.rectangle([2,6,8,10],fill=(214,180,120,255),outline=K);d.rectangle([4,7,5,10],fill=W)
    elif name=='tower':
        d.rectangle([2,3,8,11],fill=(150,156,170,255),outline=K)
        for x in(2,5,8):d.rectangle([x,1,x+1,3],fill=(150,156,170,255),outline=K)
        d.rectangle([4,7,5,11],fill=(40,44,56,255))
    elif name=='helm':
        d.polygon([(1,10),(1,4),(4,1),(7,1),(10,4),(10,10)],fill=(176,184,198,255),outline=K);d.rectangle([3,5,8,6],fill=(30,34,44,255));d.rectangle([5,6,6,9],fill=(30,34,44,255))
    elif name=='hammer':
        d.line([(3,10),(8,4)],fill=W,width=2);d.rectangle([5,1,10,4],fill=(170,176,190,255),outline=K)
    elif name=='person':
        d.rectangle([4,1,7,4],fill=(224,176,132,255),outline=K);d.rectangle([3,5,8,10],fill=(52,96,190,255),outline=K)
    elif name=='globe':
        d.ellipse([1,1,10,10],fill=(46,110,170,255),outline=K);d.arc([3,1,8,10],0,360,fill=(180,220,240,255));d.line([(1,5),(10,5)],fill=(180,220,240,255));d.rectangle([2,3,4,4],fill=(80,170,90,255))
    elif name=='plus':
        d.rectangle([4,1,7,10],fill=GB);d.rectangle([1,4,10,7],fill=GB)
    return c.resize((12*u,12*u),Image.NEAREST)
def paste_ico(im,name,x,y,u=3):
    L=lay(im);L.alpha_composite(ico(name,u),(int(x),int(y)));return Image.alpha_composite(im,L)
def keycap(im,x,y,label,f,h=40,pad=14,hot=False):
    w=int(tw(label,f))+pad*2
    im=poly_fill(im,stair((x,y+4,x+w,y+h+4),2),(0,0,0),(0,0,0),110)
    im=poly_fill(im,stair((x,y,x+w,y+h),2),(70,82,108),(38,46,64),255)
    im=line_poly(im,stair((x+1,y+1,x+w-1,y+h-1),2),rgba(GOLDB if hot else GOLD,255),2)
    txt(im,(x+w/2,y+h/2+1),label,f,TXT,'mm',shadow=(0,0,0,150),so=1);return im,w
def glass_pill(im,b,label,f,hot=False,dis=False):
    x0,y0,x1,y1=b;r=(y1-y0)//4
    L=lay(im);d=ImageDraw.Draw(L)
    d.rounded_rectangle((x0,y0+3,x1,y1+3),r,fill=(0,0,0,60))
    top=(205,212,224,255) if not dis else (120,128,142,200);bot=(150,158,172,255) if not dis else (96,102,116,200)
    if hot:top,bot=(150,180,240,255),(110,140,210,255)
    d.rounded_rectangle(b,r,fill=bot);d.rounded_rectangle((x0,y0,x1,(y0+y1)//2),r,fill=top)
    d.rounded_rectangle(b,r,outline=(255,255,255,200) if not hot else rgba(BLUE),width=2)
    im=Image.alpha_composite(im,L);txt(im,((x0+x1)/2,(y0+y1)/2+1),label,f,(24,28,40) if not dis else (70,74,86),'mm',shadow=None);return im
def vignette(im,k=.6,r0=.45):
    w,h=im.size;m=Image.new('L',(w,h));px=m.load()
    small=Image.new('L',(160,90))
    sp=small.load()
    for y in range(90):
        for x in range(160):
            dx=(x-80)/80;dy=(y-45)/45;dd=math.sqrt(dx*dx*.8+dy*dy*1.1);v=max(0,min(1,(dd-r0)/(1.15-r0)));sp[x,y]=int(255*v*v*k)
    m=small.resize((w,h),Image.BICUBIC);dark=Image.new('RGBA',(w,h),(2,3,6,255));dark.putalpha(m);return Image.alpha_composite(im,dark)
def blur_dark(plate,blur,dark,vig):
    im=plate.convert('RGBA')
    if blur:im=im.filter(ImageFilter.GaussianBlur(blur))
    if dark:im=Image.alpha_composite(im,Image.new('RGBA',im.size,(4,5,10,int(255*dark))))
    if vig:im=vignette(im,vig)
    return im
def embers(im,n=70,seed=5,box=None,glow=True):
    rnd=random.Random(seed);w,h=im.size;L=lay(im);d=ImageDraw.Draw(L)
    for i in range(n):
        x=rnd.uniform(.12,.88)*w;y=h*(1-rnd.random()**1.7*.92)
        s=rnd.choice([4,4,6,6,8]);a=int(rnd.uniform(110,255));c=rnd.choice([(255,206,110),(255,170,70),(255,226,150),(240,130,50)])
        d.rectangle([x,y,x+s-1,y+s-1],fill=c+(a,))
    if glow:im=Image.alpha_composite(im,L.filter(ImageFilter.GaussianBlur(7)))
    return Image.alpha_composite(im,L)
def checker(im,a=7,s=32):
    L=lay(im);d=ImageDraw.Draw(L);w,h=im.size
    for y in range(0,h,s):
        for x in range(0,w,s):
            if ((x//s)+(y//s))%2==0:d.rectangle([x,y,x+s-1,y+s-1],fill=(255,255,255,a))
    return Image.alpha_composite(im,L)
def save(im,n):im.convert('RGB').save(P(n))
