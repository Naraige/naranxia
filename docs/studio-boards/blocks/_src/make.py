#!/usr/bin/env python3
"""Blocks board: copies the renders (rN_X.jpg) next to the board, writes spec.json and builds board.html with tools/board.py.
usage (from the repo root): python3 docs/studio-boards/blocks/_src/make.py <dir with the renders of shoot.py>
Renders: python3 docs/studio-boards/blocks/_src/shoot.py naranxia_readable.html <outdir> docs/studio-boards/blocks/_src/shots.json 960 600 measure.js"""
import json,shutil,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;ROOT=HERE.parents[3];src=Path(sys.argv[1])
A="Actuel (rien ne change)"
ROWS=[
 ("Terrain de près : herbe, chemin de terre, pavés",[("A",A),("B","Blocs de 0,5 : 2 blocs par case, 16 pixels par bloc, herbe et chemins en pixels à 3-4 tons"),("C","Blocs de 1/3 : 3 blocs par case, pixels plus fins")]),
 ("Falaises et bord de l'eau",[("A",A),("B","Pierre, terre et sable en blocs, liseré d'herbe en pixels en haut des talus, eau en pixels")]),
 ("Arbres et forêt",[("A",A),("B","Blocs de 0,5 : tronc d'un bloc, feuillage en blocs, chênes, bouleaux et sapins (les arbres sont plus grands)"),("C","Blocs de 1/3 : même construction, taille proche de l'actuelle")]),
 ("Rochers, buissons, minerai d'or, fleurs, souches",[("A",A),("B","Blocs de 0,5 : rochers et minerai en blocs entiers, buisson = un bloc de feuilles, fleurs sur la grille de pixels"),("C","Blocs de 1/3")]),
 ("Un bâtiment sur le terrain avec des unités à côté",[("A",A),("B","Même modèle, briques et planches à 16 pixels par bloc (une brique = la tête d'une unité, comme dans Minecraft)")]),
 ("Un village à la distance de jeu",[("A",A),("B","Blocs de 0,5"),("C","Blocs de 1/3")]),
 ("Vue de la carte entière (zoom arrière maximum)",[("A",A),("B","Blocs de 0,5 : deux fois moins de triangles pour le terrain et le décor")]),
 ("Saisons",[("A","Actuel en hiver : seule la lumière change"),("B","Blocs en hiver : neige posée sur l'herbe, les feuillages et les rochers"),("C","Blocs en automne : herbe jaunie, feuillus orange et rouges, sapins verts")]),
 ("Nuit",[("A",A),("B","Blocs de 0,5")]),
]
spec={"title":"Monde en blocs : terrain, décor et bâtiments sur une seule grille",
 "intro":"Vous avez demandé un monde construit en blocs d'une seule taille, comme dans Minecraft. A = le jeu actuel, B = blocs de 0,5 case (une unité mesure 1,7 bloc, une case fait 2 blocs), C = blocs de 1/3 de case quand la ligne en propose un. Choisissez une variante par ligne, puis copiez le code en bas (ex : 1B 2B 3C). Rien ne change dans le jeu avant votre réponse : tout est derrière un interrupteur éteint, et la simulation n'est pas touchée.",
 "sections":[]}
missing=[]
for i,(name,vs) in enumerate(ROWS,1):
    sec={"name":name,"variants":[]}
    for v,note in vs:
        f=src/("r%d_%s.jpg"%(i,v))
        if not f.exists():missing.append(f.name);continue
        shutil.copy(f,OUT/f.name);sec["variants"].append({"id":v,"img":f.name,"note":note})
    spec["sections"].append(sec)
(OUT/"spec.json").write_text(json.dumps(spec,ensure_ascii=False,indent=1),encoding="utf-8")
subprocess.check_call([sys.executable,str(ROOT/"tools/board.py"),str(OUT/"spec.json"),str(OUT/"board.html")])
h=(OUT/"board.html").read_text(encoding="utf-8")
if not h.lstrip().lower().startswith("<!doctype html>"):h='<!doctype html>\n<meta charset="utf-8">\n'+h
(OUT/"board.html").write_text(h,encoding="utf-8")
print("board",len(h),"bytes; missing:",missing)
