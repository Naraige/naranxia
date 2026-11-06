#!/usr/bin/env python3
"""Add translations to src/game/14_texts.js, one key per line, in the block of the version being made.

usage:  python3 tools/addtexts.py texts.json        (or - to read stdin)
        texts.json = {"English text": ["FR", "ES", "DE", "IT", "PT"], ...}   templates use {0} {1}
The block is "/* texts added in vNN */" with NN = game/VERSION + 1 (created on top of the others if missing).
Keys already in the table are reported and skipped (edit them by hand). Checks 5 translations and the same {n} in each."""
import json,re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P=os.path.join(ROOT,'src/game/14_texts.js')
new=json.load(sys.stdin if sys.argv[1]=='-' else open(sys.argv[1],encoding='utf-8'))
v=int(open(os.path.join(ROOT,'game/VERSION')).read().strip().lstrip('v'))+1
s=open(P,encoding='utf-8').read()
have=set(json.loads('"'+m.group(1)+'"') for m in re.finditer(r'^"((?:[^"\\]|\\.)*)":\[',s,re.M))
bad=[];out=[]
for k,t in new.items():
    if k in have:print('exists, skipped:',k);continue
    if not(isinstance(t,list) and len(t)==5 and all(isinstance(x,str) and x for x in t)):bad.append(('need 5 texts',k));continue
    ph=sorted(re.findall(r'\{\d\}',k))
    if any(sorted(re.findall(r'\{\d\}',x))!=ph for x in t):bad.append(('placeholders differ',k));continue
    out.append(json.dumps(k,ensure_ascii=False)+':'+json.dumps(t,ensure_ascii=False,separators=(',',':')))
if bad:
    for b in bad:print('ERROR',*b)
    sys.exit(1)
if not out:print('nothing to add');sys.exit(0)
tag='/* texts added in v%d */\nObject.assign(TRD,{\n'%v
if tag in s:s=s.replace(tag,tag+',\n'.join(out)+',\n',1)
else:
    i=s.index('/* texts added in v')
    s=s[:i]+tag+',\n'.join(out)+'\n});\n'+s[i:]
open(P,'w',encoding='utf-8').write(s);print('added',len(out),'to v%d'%v)
