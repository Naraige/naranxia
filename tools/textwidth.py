#!/usr/bin/env python3
"""Text widths of the quest panel, the quest log and the video guide captions, in every language, without a browser
   (tools/fitcheck.py opens neither the quest log nor the guide).   python3 tools/textwidth.py [-v]
Measures with Inter Medium (the body font, `fontOf` in ui/typography.js) through PIL, no kerning: a little wider than the real
text, so a clean run is safe and a reported line may still fit by a pixel. Layout numbers are copied from ui/quest-panel.js
(`questPanel`, `questLog`) and ui/video-guide.js (`capFit`): update them here when those change.
Reports: quest titles that must shrink a lot or do not fit, descriptions cut after 3 lines, log footers too long, captions over their lines."""
import json, re, subprocess, sys, glob
from pathlib import Path
from PIL import ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'packages/game/src'
FONT = next(iter(glob.glob('/usr/share/fonts/**/Inter-Medium.otf', recursive=True) + glob.glob(str(ROOT / 'node_modules/@fontsource/inter/files/inter-latin-ext-500-normal.woff')) + glob.glob('/usr/share/fonts/**/DejaVuSans.ttf', recursive=True)), None)
if not FONT: sys.exit('no Inter or DejaVu font found')
VERB = '-v' in sys.argv
_f = {}
def tw(s, sc):
    px = round(9 * sc * 1.25 * .88)
    f = _f.get(px) or _f.setdefault(px, ImageFont.truetype(FONT, px))
    return f.getlength(s)
def wrap(s, w, sc):
    out, cur = [], ''
    for x in s.split(' '):
        t = cur + ' ' + x if cur else x
        if cur and tw(t, sc) > w: out.append(cur); cur = x
        else: cur = t
    if cur: out.append(cur)
    return out

q = (SRC / 'gameplay/quests.js').read_text(encoding='utf-8')
quests = [(m.group(1), m.group(2), m.group(3)) for m in re.finditer(r"\{id:'\w+',c:\d+,t:'((?:[^'\\]|\\.)*)',d:'((?:[^'\\]|\\.)*)',n:(\d+)", q)]
g = (SRC / 'ui/video-guide.js').read_text(encoding='utf-8')
caps = sorted(set(m.group(1) for m in re.finditer(r"\[\s*[\d.]+\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]", g) if ' ' in m.group(1)))
need = sorted(set([t for t, d, n in quests] + [d for t, d, n in quests] + caps + ['Quest complete!', 'Reward', 'Log', 'Quests are off', 'All quests complete', '+{0} gold', '+{0} wood', '+{0} stone', '+{0} food']))
js = """
import {pathToFileURL} from 'node:url';
const S=process.argv[1],need=JSON.parse(process.argv[2]);
const tr=await import(pathToFileURL(S+'/i18n/translations.js'));tr.initializeTranslations();
const {EXTRA}=await import(pathToFileURL(S+'/i18n/langs/index.js'));
const out={names:['FR','ES','DE','IT','PT',...EXTRA.map(e=>e.flag.toUpperCase())],t:{}};
for(const k of need){const v=(tr.TRD[k]||[]).slice(0,5);while(v.length<5)v.push(null);for(const e of EXTRA)v.push(e.tr[k]||null);out.t[k]=v}
console.log(JSON.stringify(out));
"""
d = json.loads(subprocess.run(['node', '--input-type=module', '-e', js, str(SRC), json.dumps(need)], capture_output=True, text=True, check=True).stdout)
names = ['EN'] + d['names']
def L(k, li): return k if li == 0 else (d['t'][k][li - 1] or k)
bad = 0
def say(*a):
    global bad; bad += 1; print(*a)
print('font', FONT, '-', len(quests), 'quests,', len(caps), 'captions,', len(names), 'languages')
if not quests or not caps: sys.exit('quests or captions not found: the parsers of this script need an update')
RW = max  # widest reward text of a quest row
for li, nm in enumerate(names):
    miss = [k for k in need if li and not d['t'][k][li - 1]]
    for k in miss: say(nm, 'no translation:', k)
    rew = max(tw(L('+{0} ' + r, li).replace('{0}', '60'), .75) for r in ('gold', 'wood', 'stone', 'food'))
    for t, ds, n in quests:
        T, D = L(t, li), L(ds, li)
        # panel on the HUD: 184 wide; title shrinks .9 -> .6 in 157; description wrapped at .75 in 170, cut after 3 lines
        sc = .9
        while sc > .6 and tw(T, sc) > 157: sc -= .03
        if tw(T, sc) > 157: say(nm, 'panel title does not fit (%d > 157 at the smallest size):' % tw(T, sc), T)
        elif sc < .75 and VERB: print(nm, 'panel title shrunk to %.2f:' % sc, T)
        ls = wrap(D, 170, .75)
        if len(ls) > 3: say(nm, 'panel description cut (%d lines > 3):' % len(ls), D)
        if any(tw(x, .75) > 170 for x in ls): say(nm, 'panel description has a word wider than the panel:', D)
        # log: one column 330 wide (rows 314) or two columns (rows 285); the row keeps "p/n  reward" on the right at .9 * .85
        for cw, lab in ((314, '1 column'), (285, '2 columns')):
            right = '%s/%s  %s' % (n, n, L('+{0} food', li).replace('{0}', '60'))
            room = cw - 20 - tw(right, .85 * .9) - 6
            ts = .85
            while ts > .5 and tw(T, ts) > room: ts -= .03
            if tw(T, ts) > room: say(nm, 'log title does not fit (%s):' % lab, T)
            elif ts < .62 and VERB: print(nm, 'log title shrunk to %.2f (%s):' % (ts, lab), T)
        # log footer: the description of the current quest on one line, .8 -> .55, in 310 (one column) or 580 (two)
        if tw(D, .55) > 580: say(nm, 'log footer too long even on the wide log (%d > 580):' % tw(D, .55), D)
        elif tw(D, .55) > 310: say(nm, 'log footer too long on the narrow log (%d > 310 at the smallest size):' % tw(D, .55), D)
    done = tw(L('Quest complete!', li), .75) + 8 + rew
    if done > 170: say(nm, '"Quest complete!" + reward too wide (%d > 170)' % done)
    for s in ('Quests are off', 'All quests complete'):
        if tw(L(s, li), .55) > 310: say(nm, 'log footer too long:', L(s, li))
    # guide captions: capFit shrinks .9 -> .62 until the text holds on its lines; 420 x 2 (desktop), 182 x 3 (side column on low screens)
    for c in caps:
        C = L(c, li)
        for w, n in ((420, 2), (182, 3)):
            sc, ok = .9, False
            while sc > .61:
                if len(wrap(C, w, sc)) <= n: ok = True; break
                sc -= .04
            if not ok: say(nm, 'guide caption over %d lines of %d:' % (n, w), C)
            elif sc < .7 and VERB: print(nm, 'guide caption shrunk to %.2f (%d x %d):' % (sc, w, n), C)
print('%d problem(s)' % bad if bad else 'all fit')
sys.exit(1 if bad else 0)
