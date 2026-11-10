#!/usr/bin/env python3
"""Board of cleaner Hammerdawn Studio logo proposals (pixel grid, flat colours, own 5x7 letters). python3 gen.py -> board.html"""
import math,base64
from pathlib import Path
D=Path(__file__).resolve().parent
NIGHT='#0b1020';GOLD='#f0c24a';PALE='#fff0a0';ORNG='#f09a2c';STEEL='#e8edf5';SHADE='#9aa6bd';WOOD='#9a6a35';WOODD='#6e4820'
F={'A':'01110 10001 10001 11111 10001 10001 10001','D':'11110 10001 10001 10001 10001 10001 11110','E':'11111 10000 10000 11110 10000 10000 11111',
'H':'10001 10001 10001 11111 10001 10001 10001','I':'111 010 010 010 010 010 111','M':'10001 11011 10101 10101 10001 10001 10001',
'N':'10001 11001 10101 10101 10011 10001 10001','O':'01110 10001 10001 10001 10001 10001 01110','R':'11110 10001 10001 11110 10100 10010 10001',
'S':'01111 10000 10000 01110 00001 00001 11110','T':'11111 00100 00100 00100 00100 00100 00100','U':'10001 10001 10001 10001 10001 10001 01110',
'W':'10001 10001 10001 10101 10101 11011 10001',' ':'000 000 000 000 000 000 000'}
class C:
    def __init__(s,w,h):s.w=w;s.h=h;s.r=[]
    def rect(s,x,y,w,h,c):s.r.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>'%(x,y,w,h,c))
    def sun(s,cx,by,r,c,inner=None,ci=None):
        for y in range(r):
            hw=round(math.sqrt(r*r-(y+.5)**2));s.rect(cx-hw,by-y-1,2*hw,1,c)
            if inner and y<inner:
                hw=round(math.sqrt(inner*inner-(y+.5)**2));s.rect(cx-hw,by-y-1,2*hw,1,ci)
    def hammer(s,cx,top,bot,hw=7,hh=5):
        s.rect(cx-1,top+hh,2,bot-top-hh,WOOD);s.rect(cx,top+hh,1,bot-top-hh,WOODD)
        s.rect(cx-hw,top,2*hw,hh,STEEL);s.rect(cx-hw,top+hh-1,2*hw,1,SHADE);s.rect(cx+hw-2,top,2,hh,SHADE)
    def text(s,t,x,y,c,gap=1,px=1):
        for ch in t:
            rows=F[ch].split()
            for j,row in enumerate(rows):
                i=0
                while i<len(row):
                    if row[i]=='1':
                        k=i
                        while k<len(row) and row[k]=='1':k+=1
                        s.rect(x+i*px,y+j*px,(k-i)*px,px,c);i=k
                    else:i+=1
            x+=(len(rows[0])+gap)*px
        return x
    def tw(s,t,gap=1,px=1):return sum((len(F[ch].split()[0])+gap)*px for ch in t)-gap*px
    def ctext(s,t,cx,y,c,gap=1,px=1):s.text(t,cx-s.tw(t,gap,px)/2,y,c,gap,px)
    def svg(s,bg=NIGHT):return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges" style="background:%s">%s</svg>'%(s.w,s.h,bg,''.join(s.r))
def rays(c,cx,by,r0,r1,angs,col):
    for a in angs:
        for r in range(r0,r1):
            x=cx+math.cos(math.radians(a))*r;y=by-math.sin(math.radians(a))*r;c.rect(round(x-1),round(y-1),2,2,col)
def mark_b(c,cx,by):  # épuré: half sun, horizon, hammer
    c.sun(cx,by,10,ORNG,6,GOLD);c.rect(cx-17,by,34,1,PALE);c.hammer(cx,by-20,by)
def mark_c(c,cx,by):  # rayons
    rays(c,cx,by,13,17,[22,52,128,158],GOLD);c.sun(cx,by,10,GOLD);c.rect(cx-17,by,34,1,PALE);c.hammer(cx,by-20,by)
def mark_d(c,cx,by):  # écusson
    x=cx-13;y=by-25;c.rect(x+1,y,24,26,GOLD);c.rect(x,y+1,26,24,GOLD);c.rect(x+2,y+2,22,22,NIGHT)
    c.sun(cx,by-4,7,ORNG,4,GOLD);c.rect(cx-9,by-4,18,1,PALE);c.hammer(cx,by-20,by-4,5,4)
def mark_e(c,cx,by):  # monogramme H
    c.rect(cx-10,by-22,4,22,STEEL);c.rect(cx+6,by-22,4,22,STEEL);c.rect(cx-7,by-22,1,22,SHADE);c.rect(cx+9,by-22,1,22,SHADE)
    c.sun(cx,by-9,6,GOLD);c.rect(cx-6,by-9,12,2,PALE)
def card(mark,two=True,word=True):
    c=C(96,60);mark(c,48,34)
    if word:
        if two:c.ctext('HAMMERDAWN',48,40,GOLD,1);c.ctext('STUDIO',48,51,STEEL,3)
        else:c.ctext('HAMMERDAWN STUDIO',48,44,GOLD,1)
    return c.svg()
def small(mark):
    c=C(40,32);mark(c,20,29);return c.svg()
def wordonly(kind):
    c=C(120,26)
    if kind=='A':c.ctext('HAMMERDAWNSTUDIO',60,9,GOLD,2)
    if kind=='B':c.ctext('HAMMERDAWN',60,2,GOLD,1);c.ctext('STUDIO',60,14,STEEL,3)
    if kind=='C':c.ctext('HAMMERDAWN STUDIO',60,9,GOLD,1)
    return c.svg()
cur='data:image/png;base64,'+base64.b64encode((D.parent/'revamp'/'B_boot.png').read_bytes()).decode()
V=[('B','Épuré','Demi-soleil en deux tons, ligne d\'horizon, marteau droit. Plus de points ni de halo.',mark_b),
   ('C','Rayons','Soleil uni, quatre rayons nets de part et d\'autre du marteau.',mark_c),
   ('D','Écusson','Le marteau et l\'aube dans un cadre doré : tient bien en petit (icône, favicon).',mark_d),
   ('E','Monogramme','Un H dont la barre est l\'aube qui se lève. Sans marteau.',mark_e)]
fig=lambda code,name,desc,body:'<figure><div class="im">%s</div><figcaption><b>%s</b> %s<span>%s</span></figcaption></figure>'%(body,code,name,desc)
r1=fig('1A','Actuel','Logo d\'aujourd\'hui (capture de l\'intro).','<img src="%s" alt="logo actuel">'%cur)
r1+=''.join(fig('1'+k,n,d,card(m)+'<div class="sm">%s%s</div>'%(small(m),small(m))) for k,n,d,m in V)
r2=fig('2A','Actuel','Un seul mot : HAMMERDAWNSTUDIO.',wordonly('A'))+fig('2B','Deux lignes','HAMMERDAWN en or, STUDIO en acier, plus petit et espacé.',wordonly('B'))+fig('2C','Une ligne','HAMMERDAWN STUDIO avec l\'espace.',wordonly('C'))
html='''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Logo Hammerdawn</title>
<style>:root{--bg:#f3eee4;--fg:#2a2118;--mut:#6f604f;--card:#fffaf2;--line:#d8cab4;--acc:#a8741f}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14110d;--fg:#efe6d6;--mut:#a89a86;--card:#1e1a14;--line:#3a3226;--acc:#e0b356}}
:root[data-theme="dark"]{--bg:#14110d;--fg:#efe6d6;--mut:#a89a86;--card:#1e1a14;--line:#3a3226;--acc:#e0b356}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}main{max-width:1200px;margin:0 auto;padding:28px 16px 60px}
h1{font-size:24px;margin:0 0 6px}h2{font-size:18px;margin:30px 0 10px;color:var(--acc)}p{color:var(--mut);margin:0 0 8px;max-width:70ch}
.r{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px}
.im{background:#0b1020;border-radius:6px;overflow:hidden}.im svg,.im img{display:block;width:100%;height:auto}
.sm{display:flex;gap:14px;align-items:center;padding:8px 10px;border-top:1px solid #1c2440}.sm svg{width:64px}.sm svg+svg{width:32px}
figcaption{padding:8px 2px 0}figcaption b{color:var(--acc);margin-right:6px}figcaption span{display:block;color:var(--mut);font-size:14px}</style></head><body><main>
<h1>Logo Hammerdawn Studio : versions plus propres</h1>
<p>Même palette (bleu nuit, or, acier), tout sur une grille de pixels, aplats sans halo ni points isolés. Sous chaque logo : le symbole seul en petit, pour juger sa netteté en icône.</p>
<p>Répondez avec un code par ligne, par exemple « 1B 2B ». A = garder l'actuel.</p>
<h2>1. Symbole</h2><div class="r">'''+r1+'''</div>
<h2>2. Écriture du nom</h2><div class="r">'''+r2+'''</div>
</main></body></html>'''
(D/'board.html').write_text(html,encoding='utf-8');print(len(html))
