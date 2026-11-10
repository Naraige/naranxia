import sys,os
from PIL import Image,ImageDraw
# usage: python3 sheet.py <dir> <out.jpg> key,key,.. [cols] [cell]
d=sys.argv[1];out=sys.argv[2];names=sys.argv[3].split(',');cols=int(sys.argv[4]) if len(sys.argv)>4 else 6;s=int(sys.argv[5]) if len(sys.argv)>5 else 300
ims=[(n,Image.open(os.path.join(d,n+'.jpg')).resize((s,s),Image.LANCZOS)) for n in names if os.path.exists(os.path.join(d,n+'.jpg'))]
rows=(len(ims)+cols-1)//cols;S=Image.new('RGB',(cols*s,rows*s),(20,18,24));D=ImageDraw.Draw(S)
for i,(n,im) in enumerate(ims):
    x=(i%cols)*s;y=(i//cols)*s;S.paste(im,(x,y));D.text((x+6,y+4),n,fill=(20,20,20))
S.save(out,quality=86);print(out,S.size)
