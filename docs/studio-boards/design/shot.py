#!/usr/bin/env python3
"""One 1280x720 capture of board.html -> capture_1280x720.png"""
import os
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':720})
    pg.goto('file://'+os.path.join(D,'board.html'));pg.wait_for_timeout(1500)
    pg.screenshot(path=os.path.join(D,'capture_1280x720.png'));b.close()
