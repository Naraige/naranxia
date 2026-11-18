"""Regenerate CHANGELOG.md from the GitHub releases (needs gh). Run after a release is published: python3 tools/changelog.py"""
import json, subprocess, pathlib
r = json.loads(subprocess.check_output(['gh', 'api', 'repos/Naraige/naranxia/releases?per_page=100']))
out = ['# Changelog', '', 'All notable changes to Naranxia, newest first. Generated from the GitHub releases by `tools/changelog.py`.', '']
for x in r:
    body = (x.get('body') or '').strip().replace('\r', '')
    out += [f"## {x['tag_name']} ({x['published_at'][:10]})", '', body or '_No notes._', '']
(pathlib.Path(__file__).resolve().parents[1] / 'CHANGELOG.md').write_text('\n'.join(out), encoding='utf-8')
