#!/usr/bin/env python3
"""Source of the kingdom emblems (pixel art, 24x24, original). Each emblem is a list of layers of simple grid-aligned shapes on a 22x22 field
   (1 px is kept free all round for the outline), sampled at pixel centres. The script shades them (1 px dark outline, light top-left bevel,
   dark bottom-right bevel, corner glints) and writes packages/game/src/rendering/emblem-art.js. It also writes a preview sheet.
   usage: python3 docs/studio-boards/emblems/gen_emblems.py [sheet.png]
   layer ops: '#' metal, '.' erase, 'D' dark crease, 'L' light inlay, 'W' wood, 'halo' = 1 px outline cut into what is already drawn."""
import math,sys
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[2]
N=22
def rect(x0,y0,x1,y1):return lambda x,y:x0<=x<x1 and y0<=y<y1
def circ(cx,cy,r):return lambda x,y:(x-cx)**2+(y-cy)**2<=r*r
def ring(cx,cy,r0,r1):return lambda x,y:r0*r0<=(x-cx)**2+(y-cy)**2<=r1*r1
def poly(*p):
    def f(x,y):
        c=False;n=len(p)
        for i in range(n):
            (x1,y1),(x2,y2)=p[i],p[(i+1)%n]
            if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:c=not c
        return c
    return f
def line(x1,y1,x2,y2,t):
    def f(x,y):
        dx,dy=x2-x1,y2-y1;L=dx*dx+dy*dy;u=max(0,min(1,((x-x1)*dx+(y-y1)*dy)/L));px,py=x1+u*dx,y1+u*dy
        return (x-px)**2+(y-py)**2<=t*t/4
    return f
def U(*f):return lambda x,y:any(g(x,y) for g in f)
def I(*f):return lambda x,y:all(g(x,y) for g in f)
def NOT(f):return lambda x,y:not f(x,y)
def mir(f):return lambda x,y:f(x,y) or f(N-x,y)
def star(cx,cy,R,r,n=5):
    return poly(*[(cx+math.cos(-math.pi/2+i*math.pi/n)*(r if i%2 else R),cy+math.sin(-math.pi/2+i*math.pi/n)*(r if i%2 else R)) for i in range(2*n)])

sw=U(line(7.5,14.5,19.5,2.5,3.2),poly((17,1),(21,1),(21,5)),line(3.5,13.5,8.5,18.5,2.4),line(5.5,16.5,2.5,19.5,2.4),circ(2,20,1.6))
sw2=lambda x,y:sw(N-x,y)
petal=lambda x,y:0<=y<14 and abs(x-11)<=.4+3.3*math.sin(math.pi*min(1,(y+1.5)/15))**.8
side=U(I(ring(5.2,9.2,2.3,5.4),U(rect(0,0,22,9.2),rect(0,0,5.2,12.6))),rect(7.5,9,10.2,15))
def asc(rows):
    return lambda x,y:0<=y<N and 0<=x<N and rows[int(y)][int(x) if x<11 else 21-int(x)]=='#'
LILY=asc(['..........#','.........##','.........##','........###','........###','.###....###','#####...###','######..###','###.###.###','##..###.###','##...###.##',
 '###..###.##','.#...###.##','......##.##','...########','...########','......##.##','.....###.##','....###..##','...###...##','...##.....#','..........#'])
wing=poly((9.5,6.5),(5,5),(1,.5),(0,1.5),(0,13),(2,11),(3,15),(5,12.5),(6,16.5),(8,13.5),(9.5,15))
EMB=[
 ('Cross',[('#',U(rect(8,0,14,22),rect(0,6,22,12),rect(7,0,15,2),rect(7,20,15,22),rect(0,5,2,13),rect(20,5,22,13)))]),
 ('Star',[('#',star(11,11.8,11.6,4.9)),('L',star(11,11.8,4.2,1.9))]),
 ('Crown',[('#',U(poly((2,17),(0,5),(6,11),(11,3),(16,11),(22,5),(20,17)),circ(11,2.5,2),circ(1.5,4.5,1.6),circ(20.5,4.5,1.6),rect(2,16,20,21))),
           ('D',rect(3,16,19,17)),('L',U(rect(10,18,12,20),rect(5,18,7,20),rect(15,18,17,20)))]),
 ('Swords',[('#',sw2),('halo',sw),('#',sw)]),
 ('Tower',[('#',U(rect(5,8,17,22),rect(3,4,19,9),rect(3,0,7,5),rect(9,0,13,5),rect(15,0,19,5),rect(4,20,18,22))),
           ('.',U(rect(9,17,13,22),rect(10,16,12,17))),('D',U(rect(10,10,12,13),rect(6,9,16,10)))]),
 ('Sun',[('#',U(circ(11,11,5.4),rect(10,0,12,4),rect(10,18,12,22),rect(0,10,4,12),rect(18,10,22,12),
                line(3.5,3.5,5.5,5.5,2.2),line(18.5,3.5,16.5,5.5,2.2),line(3.5,18.5,5.5,16.5,2.2),line(18.5,18.5,16.5,16.5,2.2)))]),
 ('Tree',[('#',U(poly((11,9),(21,19),(1,19)),rect(9,19,13,22))),('halo',poly((11,4.5),(19,13.5),(3,13.5))),('#',poly((11,4.5),(19,13.5),(3,13.5))),
          ('halo',poly((11,0),(17,7.5),(5,7.5))),('#',poly((11,0),(17,7.5),(5,7.5)))]),
 ('Lightning',[('#',poly((9,0),(17,0),(12.5,8),(18.5,8),(5.5,22),(9,12.5),(3.5,12.5)))]),
 ('Moon',[('#',I(circ(10,11.5,10),NOT(circ(14.8,9.2,7.9)))),('#',lambda x,y:abs(x-16.5)+abs(y-8.5)<=3.1)]),
 ('Anchor',[('#',U(ring(11,3.5,1.3,3.4),rect(9.5,6,12.5,21),rect(5,8,17,10.5),I(ring(11,10.5,7.6,10.6),rect(0,13.5,22,22)),
                   mir(poly((0,9.5),(5.5,13.5),(0,15))),poly((8,19),(14,19),(11,22))))]),
 ('Key',[('#',U(ring(11,6,2.3,6),rect(9,11,13,22),rect(13,14,17,16.5),rect(13,18.5,18,22)))]),
 ('Axe',[('W',rect(7,2,10,22)),('#',U(poly((10,4),(18,1),(18,15),(10,10)),I(circ(12,8,9.4),rect(17,0,22,22)),poly((7,4.5),(7,9.5),(2,7)),rect(6,0,11,2),rect(6,20,11,22))),
         ('D',rect(17,3,18,13))]),
 ('Lily',[('#',LILY)]),
 ('Eagle',[('#',U(circ(11,3,2.6),poly((13,2),(16,3.5),(13,4.5)),poly((8.5,5),(13.5,5),(13.5,15),(11,18),(8.5,15)),mir(wing),poly((9,15.5),(13,15.5),(16,22),(11,19.5),(6,22))))]),
 ('Flame',[('#',poly((11,0),(16.5,7.5),(18.5,13.5),(16,19),(11,22),(6,19),(3.5,13.5),(5.5,7.5),(8.5,11.5))),('L',poly((11,10.5),(14,15.5),(11,19.5),(8,15.5)))]),
 ('Shield',[('#',poly((1.5,0),(20.5,0),(20.5,10),(17.5,16.5),(11,22),(4.5,16.5),(1.5,10))),('D',lambda x,y:2<x<20 and 5.5+abs(x-11)<=y<8.5+abs(x-11))]),
 ('Hammer',[('W',rect(9,9,13,21)),('#',U(rect(2,1,20,9),rect(1,2,21,8),rect(8,20,14,22))),('D',U(rect(5,2,6,8),rect(16,2,17,8)))]),
 ('Mountain',[('#',poly((16,6),(24,22),(8,22))),('L',I(poly((16,6),(24,22),(8,22)),rect(0,0,22,10))),('halo',poly((8,2),(18,22),(-2,22))),('#',poly((8,2),(18,22),(-2,22))),
              ('L',I(poly((8,2),(18,22),(-2,22)),lambda x,y:y<7.5+((x//2)%2)*2))]),
 ('Chalice',[('#',U(poly((2.5,1),(19.5,1),(18.5,7),(15,11.5),(7,11.5),(3.5,7)),rect(9.5,11,12.5,18),rect(8,13.5,14,15.5),poly((4,22),(18,22),(16,19.5),(13,17.5),(9,17.5),(6,19.5)))),
             ('D',rect(4,3,18,4))]),
 ('Skull',[('#',U(circ(11,8.2,8.2),rect(3,8,19,13.5),rect(6,13,16,20))),('.',U(mir(rect(5,7.5,9,11.5)),poly((11,11.5),(13,14.5),(9,14.5)))),('D',U(rect(8,17,9,20),rect(13,17,14,20),rect(10.5,17,11.5,20)))]),
]

def build(layers):
    g=[['.']*N for _ in range(N)]
    for op,f in layers:
        hit=[[f(x+.5,y+.5) for x in range(N)] for y in range(N)]
        if op=='halo':
            for y in range(N):
                for x in range(N):
                    if g[y][x]!='.' and not hit[y][x] and any(0<=y+b<N and 0<=x+a<N and hit[y+b][x+a] for a,b in((1,0),(-1,0),(0,1),(0,-1))):g[y][x]='O'
        else:
            for y in range(N):
                for x in range(N):
                    if hit[y][x]:g[y][x]=op
    # pad to 24 and shade
    P=[['.']*(N+2)]+[['.']+r+['.'] for r in g]+[['.']*(N+2)];M=N+2
    solid=lambda x,y:0<=x<M and 0<=y<M and P[y][x] not in '.O'
    out=[['.']*M for _ in range(M)]
    for y in range(M):
        for x in range(M):
            c=P[y][x]
            if c=='O':out[y][x]='o';continue
            if c=='.':
                if any(solid(x+a,y+b) for a,b in((1,0),(-1,0),(0,1),(0,-1))):out[y][x]='o'
                continue
            up,lf,dn,rt=solid(x,y-1),solid(x-1,y),solid(x,y+1),solid(x+1,y)
            if c=='#':out[y][x]='h' if not up and not lf else 'l' if not up or not lf else 'd' if not dn or not rt else 'm'
            elif c=='W':out[y][x]='w' if not lf or not up else 'v' if not rt or not dn else 'u'
            elif c=='D':out[y][x]='d'
            elif c=='L':out[y][x]='l' if (not dn or not rt) else 'h'
    return [''.join(r) for r in out]

ART=[(n,build(l)) for n,l in EMB]
js=["/* Kingdom emblems: original pixel art, 24x24, one string per row. GENERATED by docs/studio-boards/emblems/gen_emblems.py (edit the shapes there).",
    "   . empty, o outline, h glint, l light, m metal, d shade, w/u/v wood light/mid/dark. The index of an emblem is what THEME.e stores: append only. */",
    "export const EMBG = 24;","export const EMBNAME = ["+", ".join("'%s'"%n for n,_ in ART)+"];","export const EMBART = ["]
for n,r in ART:js.append(" /* %s */ '%s',"%(n,'/'.join(r)))
js.append("].map(s => s.split('/'));\n")
(ROOT/'packages/game/src/rendering/emblem-art.js').write_text('\n'.join(js),encoding='utf-8')
print('emblem-art.js',len(ART),'emblems')

if len(sys.argv)>1:
    from PIL import Image
    PALS={'g':{'o':'#3a2406','h':'#fff6c4','l':'#ffd860','m':'#e8b030','d':'#a8701a','w':'#c79a62','u':'#a37645','v':'#70502c'},
          's':{'o':'#1c2232','h':'#ffffff','l':'#e4e9f2','m':'#b8c2d2','d':'#7c879c','w':'#c79a62','u':'#a37645','v':'#70502c'}}
    def spr(r,pal,bg):
        im=Image.new('RGB',(24,24),bg)
        for y in range(24):
            for x in range(24):
                if r[y][x]!='.':im.putpixel((x,y),tuple(int(pal[r[y][x]][i:i+2],16) for i in(1,3,5)))
        return im
    K=7;cols=10;rows=(len(ART)+cols-1)//cols;CH=24*K+8+56
    sh=Image.new('RGB',(cols*(24*K+8)+8,rows*CH+8),'#0b1020')
    for i,(n,r) in enumerate(ART):
        pal,bg=(PALS['s'],'#c9a227') if i%7==6 else (PALS['g'],'#3f6fd0')
        x0=8+(i%cols)*(24*K+8);y0=8+(i//cols)*CH
        sh.paste(spr(r,pal,bg).resize((24*K,24*K),Image.NEAREST),(x0,y0))
        sh.paste(spr(r,pal,bg),(x0,y0+24*K+4));sh.paste(spr(r,pal,bg).resize((48,48),Image.NEAREST),(x0+30,y0+24*K+4))
    sh.save(sys.argv[1]);print(sys.argv[1],sh.size)
