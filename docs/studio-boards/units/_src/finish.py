#!/usr/bin/env python3
"""After render.py and army.py: merges the triangle counts into tri.json and copies the army pictures (plus a x2 crop of the left half).
usage: python3 docs/studio-boards/units/_src/finish.py renders_dir army_dir"""
import json,sys,glob,os
from pathlib import Path
from PIL import Image
OUT=Path(__file__).resolve().parent.parent;R=Path(sys.argv[1]);AD=Path(sys.argv[2])
A={};B={}
for f in sorted(glob.glob(str(R/'tri_*.json')),key=os.path.getmtime):
    for k,v in json.load(open(f)).items():(A if k.endswith('_A') else B)[k[:-2]]=v
out={k:{'A':{'triangles':A[k][0],'meshes':A[k][1]},'B':{'triangles':B[k][0],'meshes':B[k][1]}} for k in A if k in B}
json.dump(out,open(OUT/'tri.json','w'),indent=1)
print(' '.join(f"{k}:{v['A']['triangles']}>{v['B']['triangles']}" for k,v in out.items()))
print('mesh count differs:',[k for k,v in out.items() if v['A']['meshes']!=v['B']['meshes']])
for m in 'AB':
    im=Image.open(AD/f'army_{m}.png').convert('RGB');im.save(OUT/f'army_{m}.png',optimize=True)
    im.crop((0,60,640,420)).resize((1280,720),Image.NEAREST).save(OUT/f'army_{m}_x2.png',optimize=True)
