#!/usr/bin/env python3
"""1280x720 screenshot of board.html (capture_1280x720.png)."""
from playwright.sync_api import sync_playwright
import pathlib
D=pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':720})
    pg.route('https://fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto((D/'board.html').as_uri());pg.wait_for_timeout(1500)
    pg.screenshot(path=str(D/'capture_1280x720.png'));b.close()
