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
page='''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>%(t)s</title><style>
:root{--bg:#f4efe6;--fg:#2a2118;--mut:#7a6a58;--card:#fffaf2;--line:#d9ccb8;--acc:#b8862b;--sel:#2f7d4f}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#17130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a}}
:root[data-theme="dark"]{--bg:#17130f;--fg:#efe6d8;--mut:#a8987f;--card:#221c16;--line:#3a3026;--acc:#e0b04a;--sel:#5fc48a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 system-ui,sans-serif;padding:16px 16px 96px}
h1{font-size:1.5rem;margin:.2rem 0 .3rem}p{color:var(--mut);margin:0 0 1rem;max-width:60ch}
section{margin:1.4rem 0}h2{font-size:1.1rem;margin:0 0 .6rem}h2 em{font-style:normal;color:var(--acc);margin-right:.3rem}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%%,230px),1fr));gap:12px}
.card{all:unset;cursor:pointer;background:var(--card);border:2px solid var(--line);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:4px}
.card img{width:100%%;border-radius:6px;image-rendering:auto}.card b{color:var(--acc)}.card span{color:var(--mut);font-size:.9rem}
.card.on{border-color:var(--sel);box-shadow:0 0 0 2px var(--sel)}.card:focus-visible{outline:3px solid var(--acc)}
footer{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
footer code{font-size:1.05rem;color:var(--sel)}footer button{font:inherit;padding:6px 14px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
</style></head><body><h1>%(t)s</h1><p>%(i)s</p>%(s)s
<footer><span>Ton choix :</span><code id="code">-</code><button id="cp">Copier</button></footer>
<script>const pick={};const code=document.getElementById('code');
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{const s=c.dataset.s;pick[s]=c.dataset.v;
document.querySelectorAll('.card[data-s="'+s+'"]').forEach(x=>x.classList.toggle('on',x===c));
code.textContent=Object.keys(pick).sort((a,b)=>a-b).map(k=>k+pick[k]).join(' ')||'-'}));
document.getElementById('cp').onclick=()=>{try{navigator.clipboard.writeText(code.textContent)}catch(e){}};</script></body></html>'''%{'t':E(spec['title']),'i':E(spec.get('intro','')),'s':''.join(secs)}
open(out,'w',encoding='utf-8').write(page);print(out,len(page)//1024,'KB')
