# serves the Google fonts of the game from node_modules/@fontsource during headless tests
import os
FD=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'node_modules/@fontsource/')+'/'
PX=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'docs/studio-boards/look/fonts/p.ttf')
FILES={'pixelify.ttf':PX,'cinzel600.woff2':FD+'cinzel/files/cinzel-latin-600-normal.woff2','cinzel700.woff2':FD+'cinzel/files/cinzel-latin-700-normal.woff2','marcellus400.woff2':FD+'marcellus/files/marcellus-latin-400-normal.woff2',**{'inter%d.woff2'%w:FD+'inter/files/inter-latin-%d-normal.woff2'%w for w in (500,600,700,800)}}
CSS="""@font-face{font-family:'Cinzel';font-weight:600;src:url(https://fonts.gstatic.com/local/cinzel600.woff2) format('woff2')}
@font-face{font-family:'Cinzel';font-weight:700;src:url(https://fonts.gstatic.com/local/cinzel700.woff2) format('woff2')}
@font-face{font-family:'Marcellus';font-weight:400;src:url(https://fonts.gstatic.com/local/marcellus400.woff2) format('woff2')}"""+''.join("@font-face{font-family:'Inter';font-weight:%d;src:url(https://fonts.gstatic.com/local/inter%d.woff2) format('woff2')}"%(w,w) for w in (500,600,700,800))+"@font-face{font-family:'Pixelify Sans';font-weight:400 700;src:url(https://fonts.gstatic.com/local/pixelify.ttf) format('truetype')}"
def setup(pg):
    pg.route('https://fonts.googleapis.com/**',lambda r:r.fulfill(body=CSS,content_type='text/css',headers={'Access-Control-Allow-Origin':'*'}))
    def gs(r):
        n=r.request.url.rsplit('/',1)[-1]
        if n in FILES: r.fulfill(path=FILES[n],content_type='font/ttf' if n.endswith('.ttf') else 'font/woff2',headers={'Access-Control-Allow-Origin':'*'})
        else: r.abort()
    pg.route('https://fonts.gstatic.com/**',gs)
