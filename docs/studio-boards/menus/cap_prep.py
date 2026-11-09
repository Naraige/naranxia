#!/usr/bin/env python3
"""Makes dist/naranxia_dis.html: the readable build with the title-menu 'Load game' pill forced disabled (real renderer, forced state), for the 'disabled' capture."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
s=(ROOT/'dist/naranxia_readable.html').read_text(encoding='utf-8')
a='fn, null, 1.15, false, false, k >= 0 && NAV.sel === k);\n      y += bh + gp;'
assert s.count(a)==1
s=s.replace(a,'fn, null, 1.15, false, lab==="Load game", k >= 0 && NAV.sel === k);\n      y += bh + gp;')
(ROOT/'dist/naranxia_dis.html').write_text(s,encoding='utf-8')
print('ok')
