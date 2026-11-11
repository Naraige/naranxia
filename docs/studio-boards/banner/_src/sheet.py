#!/usr/bin/env python3
"""Second half of sheet.mjs: draws every emblem x variant (x3, then HUD size, 16 px, 32 px) in a blank page -> _src/sheet.png"""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent;ROOT=D.parents[3]
JS="""()=>{const o=document.createElement('canvas');o.width=16*100+8;o.height=3*200+8;const g=o.getContext('2d');g.fillStyle='#1b2230';g.fillRect(0,0,o.width,o.height);
 ['B','C','D'].forEach((v,r)=>{for(let i=0;i<16;i++){window.__BANNER2=v;Object.assign(TH(),{c:i%14,e:i,c2:(i*5+10)%14,p:i%8});const s=bannerIcon();g.imageSmoothingEnabled=false;g.drawImage(s,8+i*100,8+r*200,72,108);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(s,8+i*100,124+r*200,26,39);g.drawImage(s,44+i*100,124+r*200,10.67,16);g.drawImage(s,64+i*100,124+r*200,21.33,32)}});return o.toDataURL('image/png')}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();pg.on('pageerror',lambda e:print('ERR',str(e)[:300]))
    pg.set_content('<!doctype html><body></body>');pg.add_script_tag(content=(ROOT/'dist/banner_bundle.js').read_text())
    (D/'sheet.png').write_bytes(base64.b64decode(pg.evaluate(JS).split(',')[1]));print('sheet.png');b.close()
