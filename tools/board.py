#!/usr/bin/env python3
"""Review page for visual choices (restyle, icons, buildings): numbered rows of lettered variants; the King clicks one per row
and copies the code ("1A 2C 3B") into the chat or a comment on the page. Publish the output as a claude.ai artifact.

usage: python3 tools/board.py spec.json out.html
spec = {"title": "Restyle king", "intro": "one or two sentences (French)",
        "sections": [{"name": "King - armour", "variants": [{"id": "A", "img": "path.png", "note": "short"}, ...]}, ...]}
Images are embedded (JPEG, max 900 px wide when Pillow is installed), so the page is one self-contained file."""
import json,sys,os,base64,io,html
spec=json.load(open(sys.argv[1],encoding='utf-8'));out=sys.argv[2];base=os.path.dirname(os.path.abspath(sys.argv[1]))
def img(p):
    p=p if os.path.isabs(p) else os.path.join(base,p)
    try:
        from PIL import Image
        im=Image.open(p).convert('RGB')
        if im.width>900:im=im.resize((900,round(im.height*900/im.width)),Image.LANCZOS)
        b=io.BytesIO();im.save(b,'JPEG',quality=84);return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
    except ImportError:
        ext=os.path.splitext(p)[1].lstrip('.').lower().replace('jpg','jpeg');return 'data:image/%s;base64,'%ext+base64.b64encode(open(p,'rb').read()).decode()
E=html.escape
secs=[]
for i,s in enumerate(spec['sections'],1):
    cards=''.join('<button class="card" data-s="%d" data-v="%s"><img src="%s" alt="%s"><b>%d%s</b><span>%s</span></button>'%(i,E(v['id']),img(v['img']),E(s['name']+' '+v['id']),i,E(v['id']),E(v.get('note',''))) for v in s['variants'])
    secs.append('<section><h2><em>%d</em> %s</h2><div class="row">%s</div></section>'%(i,E(s['name']),cards))
page='''<title>%(t)s</title><meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&display=swap">
<style>
/* review board: numbered rows of lettered variants, one pick per row, the code in a bar at the bottom */
:root{--bg:#f3eee4;--fg:#2a2118;--mut:#6f604f;--card:#fffaf2;--line:#d8cab4;--acc:#a8741e;--sel:#2f7d4f;--disp:'Pixelify Sans',ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#16130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding-block:20px 110px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font:700 1.7rem/1.2 var(--disp);margin:0 0 .4rem;text-wrap:balance}p{color:var(--mut);margin:0 0 1.2rem;max-width:65ch}
section{margin:1.6rem 0;display:grid;gap:.6rem}h2{font:500 1.15rem/1.3 var(--disp);margin:0;text-wrap:balance}h2 em{font-style:normal;color:var(--acc);margin-right:.35rem}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%%,300px),1fr));gap:12px}
.card{all:unset;cursor:pointer;background:var(--card);border:2px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:4px;min-width:0}
.card img{width:100%%;max-width:100%%;border-radius:4px;background:#16141a}.card b{font-family:var(--disp);color:var(--acc)}.card span{color:var(--mut);font-size:.92rem}
.card.on{border-color:var(--sel);box-shadow:0 0 0 2px var(--sel)}.card:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
footer{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;flex-wrap:wrap;
 padding:10px max(16px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
footer code{font:500 1.1rem var(--disp);color:var(--sel);user-select:all}footer button{font:inherit;padding:6px 14px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
footer small{color:var(--mut)}
@media (prefers-reduced-motion:no-preference){.card{transition:border-color .12s,box-shadow .12s}}
</style>
<h1>%(t)s</h1><p>%(i)s</p>%(s)s
<footer><span>Ton choix :</span><code id="code">-</code><button id="cp" type="button">Copier</button><small id="ok"></small></footer>
<script>const pick={},code=document.getElementById('code'),ok=document.getElementById('ok');
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{const s=c.dataset.s;pick[s]=c.dataset.v;
 document.querySelectorAll('.card[data-s="'+s+'"]').forEach(x=>x.classList.toggle('on',x===c));
 code.textContent=Object.keys(pick).sort((a,b)=>a-b).map(k=>k+pick[k]).join(' ')||'-'}));
document.getElementById('cp').addEventListener('click',()=>{const t=code.textContent;const sel=()=>{const r=document.createRange();r.selectNodeContents(code);const w=getSelection();w.removeAllRanges();w.addRange(r);ok.textContent='Sélectionné : copie-le'};
 try{navigator.clipboard.writeText(t).then(()=>{ok.textContent='Copié'},sel)}catch(e){sel()}});</script>'''%{'t':E(spec['title']),'i':E(spec.get('intro','')),'s':''.join(secs)}
open(out,'w',encoding='utf-8').write(page);print(out,len(page)//1024,'KB')
