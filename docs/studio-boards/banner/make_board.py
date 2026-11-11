#!/usr/bin/env python3
"""Builds docs/studio-boards/banner/board.html from the captures of cap.py (in _src/): 3 numbered rows of lettered variants
   (same page and "Votre choix" bar as tools/board.py, plus a reference picture of the in-game bannerman).
   python3 docs/studio-boards/banner/make_board.py"""
import base64,io,html,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
D=Path(__file__).resolve().parent;S=D/'_src';V=['A','B','C','D']
NOTE={'A':'Actuelle: écu lisse sous une tringle dorée.',
      'B':'Étendard du porte-étendard: pointe de lance, flamme, traverse à pommeaux, drap bordé d\'or, queue d\'aronde.',
      'C':'Gonfanon sur mât (écran titre): mât sur socle de pierre, boule dorée, potence, drap à dents, flamme.',
      'D':'Bannière murale: clou et cordons, tringle dorée, grand drap à liseré clair finissant en pointe, gland.'}
def font(n):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        try:return ImageFont.truetype(p,n)
        except Exception:pass
    return ImageFont.load_default()
def uri(im,name):
    im.save(D/name);b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def label(im,x,y,t):ImageDraw.Draw(im).text((x,y),t,fill='#c4a37a',font=font(15))
BG=(22,20,26)
def row1(v):
    """HUD top-left x3, save list line x2, then the icon alone at 16 and 32 px (real size and x4)."""
    hud=Image.open(S/('hud_%s.png'%v)).convert('RGB').crop((0,0,240,48)).resize((720,144),Image.NEAREST)
    sav=Image.open(S/('saves_%s.png'%v)).convert('RGB').crop(SAVES).resize(((SAVES[2]-SAVES[0])*2,(SAVES[3]-SAVES[1])*2),Image.NEAREST)
    sm=Image.open(S/('small_%s.png'%v)).convert('RGB')
    im=Image.new('RGB',(720,144+sav.height+24+24+160+12),BG);label(im,6,2,'');im.paste(hud,(0,0))
    y=144+6;label(im,8,y,'Liste des sauvegardes (x2)');y+=22;im.paste(sav.crop((0,0,720,sav.height)),(0,y));y+=sav.height+6
    label(im,8,y,'Icône seule: 16 px et 32 px, taille réelle puis x4');y+=22;im.paste(sm,(8,y+60));im.paste(sm.resize((240,160),Image.NEAREST),(90,y));return im
def card(v,t):return Image.open(S/('setup_%s_%d.png'%(v,t))).convert('RGB').crop(CARD)
def row2(v):return card(v,0)
def row3(v):
    a,b=card(v,1).crop((0,0,THIN,CARD[3]-CARD[1])),card(v,2).crop((0,0,THIN,CARD[3]-CARD[1]));im=Image.new('RGB',(THIN*2+8,a.height),BG);im.paste(a,(0,0));im.paste(b,(THIN+8,0));return im
SAVES=(200,128,560,200);CARD=(196,124,700,412);THIN=330
if (D/'crops.json').exists():
    c=json.loads((D/'crops.json').read_text());SAVES=tuple(c['saves']);CARD=tuple(c['card']);THIN=c['thin']
ROWS=[('Petite icône: barre du haut en jeu, liste des sauvegardes, 16 et 32 px',row1),
      ('Grande bannière: carte « Votre royaume » (Nouveau royaume)',row2),
      ('Deux autres royaumes: Redmere (rouge, aigle, parti ivoire) et Oakenshield (vert, arbre, fasce ambre)',row3)]
ref=Image.open(D.parent/'gear/r11_B.jpg').convert('RGB').crop((380,20,570,505))
E=html.escape;secs=[]
for i,(name,fn) in enumerate(ROWS,1):
    cards=''.join('<button class="card" data-s="%d" data-v="%s"><img src="%s" alt="%s"><b>%d%s</b><span>%s</span></button>'%(i,v,uri(fn(v),'r%d_%s.png'%(i,v)),E(name+' '+v),i,v,E(NOTE[v])) for v in V)
    secs.append('<section><h2><em>%d</em> %s</h2><div class="row">%s</div></section>'%(i,E(name),cards))
T='Bannière du royaume: une icône façon porte-étendard'
INTRO=('Vous avez dit que l\'icône de la bannière ne vous plaisait toujours pas et proposé de la rapprocher du porte-étendard. '
       'Voici la bannière actuelle (A) et trois dessins en pixels (B, C, D) qui suivent votre royaume: couleur, 2e couleur, motif, emblème. '
       'Rien n\'est allumé dans le jeu. Choisissez une lettre par ligne; les lignes 2 et 3 montrent le même grand dessin, la ligne 1 le petit: '
       'vous pouvez prendre un dessin différent pour le petit et le grand (par exemple « 1D 2B 3B »).')
page='''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%(t)s</title><meta name="claude:viewport-fit-sides" content="cover">
<style>
/* review board: numbered rows of lettered variants, one pick per row, the code in a bar at the bottom (as tools/board.py) */
:root{--bg:#f3eee4;--fg:#2a2118;--mut:#6f604f;--card:#fffaf2;--line:#d8cab4;--acc:#a8741e;--sel:#2f7d4f;--disp:ui-monospace,"Cascadia Mono",Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;padding-block:20px 110px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font:700 1.6rem/1.2 var(--disp);margin:0 0 .4rem;text-wrap:balance}p{color:var(--mut);margin:0 0 1.2rem;max-width:70ch}
section{margin:1.6rem 0;display:grid;gap:.6rem}h2{font:500 1.1rem/1.3 var(--disp);margin:0;text-wrap:balance}h2 em{font-style:normal;color:var(--acc);margin-right:.35rem}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%%,300px),1fr));gap:12px}
.card{all:unset;cursor:pointer;background:var(--card);border:2px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:4px;min-width:0;align-content:start}
.card img{width:100%%;max-width:100%%;border-radius:4px;background:#16141a}.card b{font-family:var(--disp);color:var(--acc)}.card span{color:var(--mut);font-size:.92rem}
.card.on{border-color:var(--sel);box-shadow:0 0 0 2px var(--sel)}.card:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
figure{margin:0 0 1rem;display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px;max-width:70ch}
figure img{height:260px;border-radius:4px}figcaption{color:var(--mut);flex:1 1 220px;font-size:.95rem}
footer{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;flex-wrap:wrap;
 padding:10px max(16px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
footer code{font:500 1.1rem var(--disp);color:var(--sel);user-select:all}footer button{font:inherit;padding:6px 14px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
footer small{color:var(--mut)}
@media (prefers-reduced-motion:no-preference){.card{transition:border-color .12s,box-shadow .12s}}
</style>
<h1>%(t)s</h1><p>%(i)s</p>
<figure><img src="%(r)s" alt="Le porte-étendard en jeu"><figcaption><b>Référence: le porte-étendard en jeu.</b> Hampe à pointe de lance, flamme, traverse à pommeaux dorés, drap bordé d'or à queue d'aronde. Son drap porte toujours un lys; les icônes B, C et D portent l'emblème de votre royaume.</figcaption></figure>
%(s)s
<footer><span>Votre choix :</span><code id="code">-</code><button id="cp" type="button">Copier</button><small id="ok"></small></footer>
<script>const pick={},code=document.getElementById('code'),ok=document.getElementById('ok');
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{const s=c.dataset.s;pick[s]=c.dataset.v;
 document.querySelectorAll('.card[data-s="'+s+'"]').forEach(x=>x.classList.toggle('on',x===c));
 code.textContent=Object.keys(pick).sort((a,b)=>a-b).map(k=>k+pick[k]).join(' ')||'-'}));
document.getElementById('cp').addEventListener('click',()=>{const t=code.textContent;const sel=()=>{const r=document.createRange();r.selectNodeContents(code);const w=getSelection();w.removeAllRanges();w.addRange(r);ok.textContent='Sélectionné : copiez-le'};
 try{navigator.clipboard.writeText(t).then(()=>{ok.textContent='Copié'},sel)}catch(e){sel()}});</script>'''%{'t':E(T),'i':E(INTRO),'s':''.join(secs),'r':uri(ref,'ref_bannerman.png')}
(D/'board.html').write_text(page,encoding='utf-8');print('board.html',len(page)//1024,'KB')
