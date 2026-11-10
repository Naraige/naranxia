#!/usr/bin/env python3
"""Builds the cards and the self-contained board of the mutants from the renders of render.py and horde.py.
usage: python3 docs/studio-boards/mutants/_src/compose.py renders_dir [game_px=46]
Card (900x600): 3/4 front (540), 3/4 back (300), the unit at game size (1:1 and 2:1) on grass from the game camera.
Writes rNN_{A,B}.jpg, r08_{A,B}.jpg (horde), rows.json and board.html (data URI images, no outside request)."""
import sys,json,base64,io,html
from pathlib import Path
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;src=Path(sys.argv[1]);GP=int(sys.argv[2]) if len(sys.argv)>2 else 46
BG=(21,19,26);GR=(86,118,62)
SC={'husk':1.0,'runner':1.2,'brute':2.15,'bomber':1.5,'acid':1.3,'miner':1.35,'boss':2.15*1.6}
# row: (name FR, render name, note A, note B, types for MUT2_ON)
ROWS=[
 ('Brute','brute','Zombie élargi, un gros bras, épaulière et épines.','Masse bossue et asymétrique : un bras démesuré aux plaques d\'os dont le poing descend aux genoux, l\'autre desséché jusqu\'à l\'os avec sa chaîne, bosse hérissée d\'os, chair à vif, petite tête enfoncée à défenses. Accent : rouge chair sur violacé.','brute'),
 ('Coureur','runner','Zombie mince, bandeau, griffes.','Décharné et plié en deux : long crâne à museau, mâchoire pendante, côtes et vertèbres saillantes, jambes en échasses, bras terminés par trois lames d\'os, sang jusqu\'aux coudes. Accent : blanc cendre et rouge sang.','runner'),
 ('Artificier','bomber','Zombie ventru, baril dans le dos, bombes à la ceinture.','Corps boursouflé où le baril a fusionné avec le dos : la chair le recouvre, le ventre se fend sur un cœur de poudre qui luit, cloques incandescentes, mèche allumée. Accent : orange incandescent sur chair rosée.','bomber'),
 ('Cracheur d\'acide','acid','Zombie verdâtre, poches luisantes dans le dos.','Voûté, gorge gonflée en poche d\'acide du torse au menton, trois poches veinées dans le dos, mâchoire décrochée pleine d\'acide qui coule en filets, un avant-bras rongé jusqu\'à l\'os. Accent : vert acide.','acid'),
 ('Mineur','miner','Zombie à casque de cuir et lampe, pioche en main.','La roche a poussé sur lui : dos, épaule et hanche pris dans la pierre, cristaux qui en sortent, casque de fer rouillé, une lanterne à la place du visage, avant-bras de pierre d\'où sort une pioche, l\'autre main changée en rocher. Accent : lanterne ambre, cristaux cyan.','miner'),
 ('Momie / desséché','husk','Petit mort desséché, bandelettes.','Desséché et fendu en deux du crâne au bassin : les deux moitiés ne s\'alignent plus, colonne et côtes dans la fente, linceul soudé à la chair, bandelettes qui traînent, un seul œil pâle. Accent : lin clair sur chair brune.','husk'),
 ('Boss de vague','boss','Brute agrandie : cornes, mâchoire de fer, étendard.','Une autre créature que la brute : crâne nu à longues cornes sous une couronne brisée, seconde gueule verticale dans le torse (dents et lueur), côtes en griffes par-dessus les épaules, deux bras à lames d\'os, veines violettes, étendard du chef déchu (couleur selon le boss). Accent : violet.','boss'),
]
def im(n,m,v,size):
    p=src/f'{n}_{m}_{v}.png'
    return Image.open(p).convert('RGB').resize((size,size),Image.LANCZOS) if p.exists() else None
def card(row,m):
    n=row[1];C=Image.new('RGB',(900,600),BG);d=ImageDraw.Draw(C)
    f=im(n,m,'f',560)
    if f:C.paste(f,(0,20))
    b=im(n,m,'b',320)
    if b:C.paste(b,(570,0))
    # game size: the g view frames 1.4 x the model height; scaled so the unit is as tall as in the game at the default zoom
    s=max(24,round(GP*SC[n]/1.35/.71))
    g=im(n,m,'g',s)
    if g:
        T=Image.new('RGB',(s+16,s+16),GR);T.paste(g,(8,8));C.paste(T,(590,330+(250-s-16)//2))
        if s*3+16<=300:g2=im(n,m,'g',s*2);C.paste(g2,(900-g2.width-10,330+(250-g2.height)//2))
    d.text((590,322),'taille jeu 1:1 et 2:1' if s*3+16<=300 else 'taille jeu 1:1',fill=(150,140,120))
    p=OUT/f'r{ROWS.index(row)+1:02d}_{m}.jpg';C.save(p,'JPEG',quality=88);return p
def uri(p,w=None):
    i=Image.open(p).convert('RGB')
    if w and i.width>w:i=i.resize((w,round(i.height*w/i.width)),Image.LANCZOS)
    b=io.BytesIO();i.save(b,'JPEG',quality=84);return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
secs=[];E=html.escape;rows={}
for i,row in enumerate(ROWS,1):
    rows[str(i)]=row[4];cards=''
    for m,note in(('A',row[2]),('B',row[3])):
        p=card(row,m);cards+='<button class="card" data-s="%d" data-v="%s"><img src="%s" alt="%s"><b>%d%s · %s</b><span>%s</span></button>'%(i,m,uri(p),E(row[0]+' '+m),i,m,'actuel' if m=='A' else 'nouveau',E(note))
    secs.append('<section><h2><em>%d</em> %s</h2><div class="row">%s</div></section>'%(i,E(row[0]),cards))
n=len(ROWS)+1;rows[str(n)]='(horde : vue d\'ensemble, pas de type)';cards=''
for m,note in(('A','Horde actuelle à la distance du jeu.'),('B','La même horde avec les sept monstruosités (zombies normaux inchangés).')):
    hp=OUT/f'horde_{m}.png';jp=OUT/f'r{n:02d}_{m}.jpg';Image.open(hp).convert('RGB').crop((140,60,1140,700)).save(jp,'JPEG',quality=88)
    cards+='<button class="card" data-s="%d" data-v="%s"><img src="%s" alt="Horde %s"><b>%d%s · %s</b><span>%s</span></button>'%(n,m,uri(jp),m,n,m,'actuel' if m=='A' else 'nouveau',E(note))
secs.append('<section><h2><em>%d</em> Horde à distance de jeu</h2><div class="row wide">%s</div></section>'%(n,cards))
json.dump(rows,open(OUT/'rows.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
page='''<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mutants : monstruosités</title>
<style>
:root{--bg:#f3eee4;--fg:#2a2118;--mut:#6f604f;--card:#fffaf2;--line:#d8cab4;--acc:#a8741e;--sel:#2f7d4f;--disp:ui-monospace,"Cascadia Mono",Menlo,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:20px 16px 110px}
h1{font:700 1.6rem/1.2 var(--disp);margin:0 0 .4rem;text-wrap:balance}p{color:var(--mut);margin:0 0 1.2rem;max-width:70ch}
section{margin:1.6rem 0;display:grid;gap:.6rem}h2{font:600 1.1rem/1.3 var(--disp);margin:0}h2 em{font-style:normal;color:var(--acc);margin-right:.35rem}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%%,420px),1fr));gap:12px}
.card{all:unset;cursor:pointer;background:var(--card);border:2px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:4px;min-width:0;align-content:start}
.card img{width:100%%;max-width:100%%;border-radius:4px;background:#16141a;display:block}.card b{font-family:var(--disp);color:var(--acc)}.card span{color:var(--mut);font-size:.92rem}
.card.on{border-color:var(--sel);box-shadow:0 0 0 2px var(--sel)}.card:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
footer{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 16px}
footer code{font:600 1.1rem var(--disp);color:var(--sel);user-select:all}footer button{font:inherit;padding:6px 14px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
footer small{color:var(--mut)}
</style>
<h1>Mutants : de zombies à monstruosités</h1>
<p>Chaque ligne : A = modèle actuel, B = proposition. Grande vue de 3/4, dos en haut à droite, et en bas à droite l'unité vue par la caméra du jeu (taille réelle, puis doublée). La dernière ligne montre une horde à la distance du jeu. Les zombies normaux ne changent pas. Répondez par un code du type « 1B 2B 3A » : rien n'est appliqué tant que vous n'avez pas répondu.</p>
%s
<footer><span>Votre choix :</span><code id="code">-</code><button id="cp" type="button">Copier</button><small id="ok"></small></footer>
<script>const pick={},code=document.getElementById('code'),ok=document.getElementById('ok');
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{const s=c.dataset.s;pick[s]=c.dataset.v;
 document.querySelectorAll('.card[data-s="'+s+'"]').forEach(x=>x.classList.toggle('on',x===c));
 code.textContent=Object.keys(pick).sort((a,b)=>a-b).map(k=>k+pick[k]).join(' ')||'-'}));
document.getElementById('cp').addEventListener('click',()=>{const t=code.textContent;const sel=()=>{const r=document.createRange();r.selectNodeContents(code);const w=getSelection();w.removeAllRanges();w.addRange(r);ok.textContent='Sélectionné : copiez-le'};
 try{navigator.clipboard.writeText(t).then(()=>{ok.textContent='Copié'},sel)}catch(e){sel()}});</script>
'''%''.join(secs)
open(OUT/'board.html','w',encoding='utf-8').write(page);print('board.html',len(page)//1024,'KB')
