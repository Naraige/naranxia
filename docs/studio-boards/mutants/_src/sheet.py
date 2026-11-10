import sys
from pathlib import Path
from PIL import Image
# contact sheet for a quick look: python3 sheet.py dir out.png cell name1 name2 ...   (names without .png, rows of `cols`)
d=Path(sys.argv[1]);out=sys.argv[2];cell=int(sys.argv[3]);cols=int(sys.argv[4]);names=sys.argv[5:]
rows=(len(names)+cols-1)//cols;S=Image.new('RGB',(cols*cell,rows*cell),(21,19,26))
for i,n in enumerate(names):
    p=d/(n+'.png')
    if p.exists():S.paste(Image.open(p).convert('RGB').resize((cell,cell),Image.LANCZOS),((i%cols)*cell,(i//cols)*cell))
S.save(out);print(out,S.size)
