import sys,os,json
from PIL import Image
D=sys.argv[1];out=sys.argv[2]
rows=json.loads(sys.argv[3])   # {"name":[files...]}
def crop(p):
    im=Image.open(p).convert('RGB');W,H=im.size;px=im.load();bg=px[2,2]
    xs=[];ys=[]
    for y in range(0,H,2):
        for x in range(0,W,2):
            c=px[x,y]
            if abs(c[0]-bg[0])+abs(c[1]-bg[1])+abs(c[2]-bg[2])>24:xs.append(x);ys.append(y)
    if not xs:return im
    m=12;return im.crop((max(0,min(xs)-m),max(0,min(ys)-m),min(W,max(xs)+m),min(H,max(ys)+m)))
for name,files in rows.items():
    ims=[crop(os.path.join(D,f)) for f in files];Ht=420
    ims=[i.resize((max(1,round(i.width*Ht/i.height)),Ht),Image.LANCZOS) for i in ims]
    gap=24;Wt=sum(i.width for i in ims)+gap*(len(ims)+1);S=Image.new('RGB',(Wt,Ht+2*gap),(22,20,26));x=gap
    for i in ims:S.paste(i,(x,gap));x+=i.width+gap
    if S.width>1800:S=S.resize((1800,round(S.height*1800/S.width)),Image.LANCZOS)
    S.save(os.path.join(D,name+'.jpg'),quality=88);print(name,S.size)
