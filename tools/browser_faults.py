"""Prove targeted production faults trigger behavior assertions, with controls."""
import contextlib
import io
import json
import subprocess
import sys
import time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
from browser_fixture import FLAGS,emit,result
from browser_suite import run
from playwright.sync_api import sync_playwright

started=time.perf_counter()
subprocess.run(['node',str(ROOT/'tools/build_test_faults.mjs')],cwd=ROOT,check=True)
cases=json.loads((ROOT/'dist/test-faults/manifest.json').read_text(encoding='utf-8'))
if len(sys.argv)>1:
    requested=set(sys.argv[1:])
    unknown=requested-{c['id'] for c in cases}
    if unknown:raise SystemExit('Unknown fault IDs: '+', '.join(sorted(unknown)))
    cases=[c for c in cases if c['id'] in requested]
assertions=[]
with sync_playwright() as p:
    with p.chromium.launch(args=FLAGS) as browser:
        controls=set()
        for fault in cases:
            for is_control in ([True,False] if fault['id']!='control' and fault['test'] not in controls else [fault['id']=='control']):
                identity='control' if is_control else fault['id']
                output=io.StringIO()
                with contextlib.redirect_stdout(output):
                    run(browser,'tests/'+fault['test']+'.js','test-faults/'+identity+'.html',1280,720)
                records=[json.loads(line[12:]) for line in output.getvalue().splitlines() if line.startswith('TEST_RESULT ')]
                valid=len(records)==1 and records[0]['complete'] and len(records[0]['assertions'])>1
                passed=valid and (records[0]['status']=='passed' if is_control else records[0]['category']=='assertion_failure' and any(not a['passed'] and a['name']!='scenario completed successfully' for a in records[0]['assertions']))
                assertions.append({'name':fault['test']+' '+identity,'passed':bool(passed),'expected':'control passes' if is_control else 'behavior assertion fails','actual':records[0] if records else output.getvalue()[-1000:]})
                print(('CONTROL' if is_control else 'MUTANT'),fault['test'],identity,'PASS' if passed else 'FAIL',flush=True)
                if is_control:controls.add(fault['test'])
record=result('browser_faults','Detect production damage, ownership, dropped command, corrupted save, UI action and wave navigation faults',assertions,started,{}, {'cases':len(cases),'faults':[c['id'] for c in cases]})
emit(record)
sys.exit(0 if record['status']=='passed' else 1)
