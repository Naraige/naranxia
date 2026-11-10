import sys,json,os
from PIL import Image,ImageDraw
# usage: sheet.py dir suffix(_A_f) out.png cols cell   -> contact sheet of every unit for one look
d,suf,out,cols,cell=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),int(sys.argv[5])
U=[u[0] for u in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'units.json')))]
U=[u for u in U if os.path.exists(os.path.join(d,u+suf+'.png'))]
rows=(len(U)+cols-1)//cols;S=Image.new('RGB',(cols*cell,rows*cell),(21,19,26));dr=ImageDraw.Draw(S)
for i,u in enumerate(U):
    im=Image.open(os.path.join(d,u+suf+'.png')).convert('RGB').resize((cell,cell),Image.LANCZOS);S.paste(im,((i%cols)*cell,(i//cols)*cell));dr.text(((i%cols)*cell+4,(i//cols)*cell+2),u,fill=(255,220,120))
S.save(out);print(out,S.size)
