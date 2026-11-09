#!/usr/bin/env python3
"""Full-page screenshot of board.html (width 1280) -> board_capture.png, and a few row crops for checking."""
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':900})
    pg.route('https://fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto((D/'board.html').as_uri());pg.wait_for_timeout(1500)
    pg.screenshot(path=str(D/'board_capture.png'),full_page=True);b.close()
print('ok')
