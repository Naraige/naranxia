#!/usr/bin/env python3
"""Hammerdawn Studio logo proposals (board only, nothing is wired into the game). Original pixel art drawn in code on a 32x32 grid:
   the 512 px emblem is the grid x16, the favicon is the grid x1, so every size shows the same pixels.
   usage: python3 docs/studio-boards/emblems/gen_logos.py   -> logo_<B..E>_emblem.png, logo_<B..E>_wide.png, logo_A_*.png (current card, cropped)"""
import math
from pathlib import Path
from PIL import Image
D=Path(__file__).resolve().parent
G=32
NIGHT='#0b1020';NIGHT2='#161d38';PAPER='#f3eee4';OUT='#070a16'
STEEL=dict(h='#ffffff',l='#dfe5ee',m='#aab4c6',d='#6f7b92')
IRON=dict(h='#c9d2e2',l='#9aa6bc',m='#6f7b92',d='#454e66')
GOLD=dict(h='#fff0a0',l='#ffd24a',m='#f0b030',d='#b87a1a')
WOOD=dict(h='#d9a66a',l='#c08a50',m='#9a6a3a',d='#6a4626')
SUN1='#fff0a0';SUN2='#ffc23a';SUN3='#f58a2a';SUN4='#d9541e'
def rect(x0,y0,x1,y1):return lambda x,y:x0<=x<x1 and y0<=y<y1
def circ(cx,cy,r):return lambda x,y:(x-cx)**2+(y-cy)**2<=r*r
def line(x1,y1,x2,y2,t):
    def f(x,y):
        dx,dy=x2-x1,y2-y1;L=dx*dx+dy*dy;u=max(0,min(1,((x-x1)*dx+(y-y1)*dy)/L));px,py=x1+u*dx,y1+u*dy
        return (x-px)**2+(y-py)**2<=t*t/4
    return f
def band(x1,y1,x2,y2,t):
    """rectangle of thickness t along the segment (square ends)"""
    def f(x,y):
        dx,dy=x2-x1,y2-y1;L=math.hypot(dx,dy);u=((x-x1)*dx+(y-y1)*dy)/L;v=((x-x1)*-dy+(y-y1)*dx)/L
        return 0<=u<=L and abs(v)<=t/2
    return f
def U(*f):return lambda x,y:any(g(x,y) for g in f)
def I(*f):return lambda x,y:all(g(x,y) for g in f)
def mir(f):return lambda x,y:f(x,y) or f(G-x,y)

def render(layers):
    """layers: (shape, material) in paint order; material = dict (bevelled), '#rrggbb' (flat) or 'halo' (1 px outline cut into what is below)"""
    col=[[None]*G for _ in range(G)];lay=[[-1]*G for _ in range(G)]
    for i,(f,m) in enumerate(layers):
        hit=[[f(x+.5,y+.5) for x in range(G)] for y in range(G)]
        if m=='halo':
            for y in range(G):
                for x in range(G):
                    if col[y][x] and not hit[y][x] and any(0<=y+b<G and 0<=x+a<G and hit[y+b][x+a] for a,b in((1,0),(-1,0),(0,1),(0,-1))):col[y][x]=OUT;lay[y][x]=-2
            continue
        for y in range(G):
            for x in range(G):
                if hit[y][x]:col[y][x]=m;lay[y][x]=i
    out=[[None]*G for _ in range(G)]
    same=lambda x,y,i:0<=x<G and 0<=y<G and lay[y][x]==i
    for y in range(G):
        for x in range(G):
            m=col[y][x]
            if m is None:
                if any(0<=y+b<G and 0<=x+a<G and col[y+b][x+a] for a,b in((1,0),(-1,0),(0,1),(0,-1))):out[y][x]=OUT
            elif isinstance(m,dict):
                i=lay[y][x];up,lf,dn,rt=same(x,y-1,i),same(x-1,y,i),same(x,y+1,i),same(x+1,y,i)
                out[y][x]=m['h'] if not up and not lf else m['l'] if not up or not lf else m['d'] if not dn or not rt else m['m']
            else:out[y][x]=m
    return out
def rgb(c):return tuple(int(c[i:i+2],16) for i in(1,3,5))
def image(px,k,bg):
    im=Image.new('RGB',(G,G),rgb(bg))
    for y in range(G):
        for x in range(G):
            if px[y][x]:im.putpixel((x,y),rgb(px[y][x]))
    return im.resize((G*k,G*k),Image.NEAREST)

def sun(cx,cy,rs,cols):
    top=rect(0,0,G,cy);return [(I(circ(cx,cy,r),top),c) for r,c in zip(rs,cols)]
def rays(cx,cy,r,degs,c=SUN2):
    o=[]
    for a in degs:
        for s in(-1,1):
            x=round(cx+s*math.cos(math.radians(a))*r);y=round(cy-math.sin(math.radians(a))*r);o.append(rect(x-1,y-1,x+1,y+1))
    return [(U(*o),c)]

# B: hammer standing in front of the rising sun, block rays, horizon with two reflections
hamB=U(rect(10,2,22,9),rect(9,3,23,8))
B=sun(16,24,(10.6,7.6,4.6),(SUN3,SUN2,SUN1))+rays(16,24,13.6,(20,45,68))+[(rect(2,24,30,26),GOLD),(rect(6,27,26,28),SUN3),(rect(10,29,22,30),SUN4),
  (U(hamB,rect(14,9,18,27)),'halo'),(rect(14,10,18,27),WOOD),(hamB,STEEL),(U(rect(12,3,13,8),rect(19,3,20,8)),STEEL['d']),(rect(14,9,18,10),GOLD)]
# C: hammer striking the anvil, sparks, the sun on the horizon behind
anv=U(rect(6,15,26,19),rect(3,15,6,18),rect(2,15,3,17),rect(10,19,22,21),rect(12,21,20,23),rect(9,23,23,26))
hd=band(8.5,6.5,15,13,6);hl=band(13,8.5,22.5,-1,2.2)
C=sun(16,26,(11.6,8.2,4.8),(SUN3,SUN2,SUN1))+[(rect(1,26,31,28),GOLD),(rect(6,29,26,30),SUN3),(anv,'halo'),(anv,IRON),(rect(6,15,26,16),IRON['h']),
  (U(hd,hl),'halo'),(hl,WOOD),(hd,STEEL),
  (U(rect(18,12,20,14),rect(22,10,23,11),rect(23,13,24,14),rect(20,8,21,9),rect(25,11,26,12),rect(17,9,18,10)),SUN1)]
# D: HD monogram forged in a shield, a small dawn at the point
HW=[0,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,12,12,11,10,9,8,7,5,4,2,1,0]
sh=lambda x,y:0<=y<G and abs(x-16)<HW[int(y)]
shin=lambda x,y:all(sh(x+a,y+b) for a,b in((2,0),(-2,0),(0,2),(0,-2),(1,1),(-1,1),(1,-1),(-1,-1)))
LH=U(rect(6,6,9,18),rect(12,6,15,18),rect(9,10,12,13))
LD=U(rect(17,6,20,18),rect(20,6,24,9),rect(20,15,24,18),rect(23,8,26,16),rect(24,7,25,17))
Dd=[(sh,GOLD),(shin,NIGHT2)]+[(I(shin,f),c) for f,c in sun(16,25,(6.6,4.2),(SUN3,SUN1))]+[(I(shin,rect(0,25,G,26)),SUN2),(I(shin,rect(0,26,G,G)),'#0e1430'),
  (U(LH,LD),'halo'),(LH,STEEL),(LD,GOLD)]
# E: the hammer head is the horizon, the sun rises behind it
hamE=U(rect(4,14,28,21),rect(3,15,29,20))
E=sun(16,14,(9.6,6.8,3.8),(SUN3,SUN2,SUN1))+rays(16,14,12.4,(18,45,90))+[(U(hamE,rect(13,21,19,32)),'halo'),(rect(14,22,18,31),WOOD),(hamE,STEEL),
  (U(rect(7,15,8,20),rect(24,15,25,20)),STEEL['d']),(rect(13,21,19,22),GOLD),(rect(13,30,19,32),GOLD)]
LOGOS={'B':B,'C':C,'D':Dd,'E':E}

FONT={'H':['#...#']*3+['#####']+['#...#']*3,'A':['.###.','#...#','#...#','#####','#...#','#...#','#...#'],'M':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],
 'E':['#####','#....','#....','####.','#....','#....','#####'],'R':['####.','#...#','#...#','####.','#.#..','#..#.','#...#'],'D':['####.','#...#','#...#','#...#','#...#','#...#','####.'],
 'W':['#...#','#...#','#...#','#.#.#','#.#.#','##.##','#...#'],'N':['#...#','##..#','#.#.#','#.#.#','#..##','#...#','#...#'],'S':['.####','#....','#....','.###.','....#','....#','####.'],
 'T':['#####']+['..#..']*6,'U':['#...#']*6+['.###.'],'I':['###']+['.#.']*5+['###'],'O':['.###.']+['#...#']*5+['.###.']}
def text(im,s,x,y,k,cols,shadow,sp=1):
    """cols: 7 row colours (top to bottom); hard shadow one font pixel down-right"""
    for pas in(1,0):
        cx=x
        for ch in s:
            g=FONT[ch]
            for r,row in enumerate(g):
                for c,v in enumerate(row):
                    if v=='#':
                        col=rgb(shadow) if pas else rgb(cols[r]);o=k if pas else 0
                        im.paste(col,(cx+c*k+o,y+r*k+o,cx+c*k+k+o,y+r*k+k+o))
            cx+=(len(g[0])+sp)*k
    return cx
def tw(s,k,sp=1):return sum((len(FONT[c][0])+sp)*k for c in s)-sp*k
GT=['#fff0a0','#ffe07a','#ffd24a','#ffc23a','#f5a630','#f58a2a','#e06a20']
NT=['#27336a','#222c5c','#1c2550','#182046','#141b3c','#101632','#0b1020']
def wide(px,bg,dark):
    W,H=640,176;im=Image.new('RGB',(W,H),rgb(bg));im.paste(image(px,4,bg),(24,24))
    x=24+128+28;k=5
    text(im,'HAMMERDAWN',x,44,k,GT if dark else NT,'#3a1c08' if dark else '#e9a23a',sp=2)
    text(im,'STUDIO',x,44+7*k+18,3,['#dfe5ee']*3+['#aab4c6']*4 if dark else ['#b8651a']*7,'#070a16' if dark else '#f0d9a8',sp=4)
    # favicon, true size (32 px) and x2
    im.paste(image(px,1,bg),(W-52,24));im.paste(image(px,2,bg),(W-84,72))
    return im

for n,l in LOGOS.items():
    px=render(l)
    image(px,16,NIGHT).save(D/('logo_%s_emblem.png'%n))
    a,b=wide(px,NIGHT,True),wide(px,PAPER,False);im=Image.new('RGB',(a.width,a.height*2));im.paste(a,(0,0));im.paste(b,(0,a.height));im.save(D/('logo_%s_wide.png'%n))
    print(n,'ok')
# A: the current studio card (crop of the revamp capture)
src=D.parent/'revamp'/'B_boot.png'
if src.exists():
    im=Image.open(src).convert('RGB');im.crop((440,220,840,420)).resize((800,400),Image.NEAREST).crop((144,0,656,400)).save(D/'logo_A_emblem.png');im.crop((320,220,960,540)).save(D/'logo_A_wide.png');print('A ok')
