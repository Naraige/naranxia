#!/usr/bin/env python3
"""Contact sheet of gear renders, A above B, to look at many at once.
usage: python3 docs/studio-boards/gear/_src/sheet.py renders_dir out.png name1,name2,... [cell=300]   (names without _A/_B)"""
import sys
from pathlib import Path
from PIL import Image,ImageDraw
src=Path(sys.argv[1]);names=sys.argv[3].split(',');c=int(sys.argv[4]) if len(sys.argv)>4 else 300
S=Image.new('RGB',(c*len(names),c*2),(21,19,26));d=ImageDraw.Draw(S)
for i,n in enumerate(names):
    for j,m in enumerate('AB'):
        p=src/f'{n}_{m}.png'
        if p.exists():S.paste(Image.open(p).convert('RGB').resize((c,c),Image.LANCZOS),(i*c,j*c))
        d.text((i*c+4,j*c+4),f'{n} {m}',fill=(240,230,200))
S.save(sys.argv[2]);print(sys.argv[2],S.size)
