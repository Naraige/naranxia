import sys,os,glob
from PIL import Image,ImageDraw
d=sys.argv[1];out=sys.argv[2];names=sys.argv[3].split(',');cols=int(sys.argv[4]) if len(sys.argv)>4 else 6
ims=[]
for n in names:
    p=os.path.join(d,'u_'+n.replace('@','_').replace('.','_')+'.jpg')
    if not os.path.exists(p):p=os.path.join(d,n+'.jpg')
    if os.path.exists(p):ims.append((n,Image.open(p)))
s=ims[0][1].width;rows=(len(ims)+cols-1)//cols;S=Image.new('RGB',(cols*s,rows*(s+18)),(20,18,24));D=ImageDraw.Draw(S)
for i,(n,im) in enumerate(ims):x=(i%cols)*s;y=(i//cols)*(s+18);S.paste(im,(x,y+18));D.text((x+6,y+3),n,fill=(240,220,160))
S.save(out,quality=88);print(out,S.size)
