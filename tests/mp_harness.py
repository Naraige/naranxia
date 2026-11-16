"""Shared deterministic driver for legacy co-op scenarios.

No lockstep implementation here: advance the queued production frame callback,
deliver the real serialized packets, and compare peers only after a pump returns.
"""
import json
import time
from pathlib import Path
from browser_fixture import FLAGS, emit, load_page, result

started = time.perf_counter()
assertions = []
phases = {'load': 0}
compared = 0
pending = {}
states = {}
bridge_calls = 0


def observe(a, b):
    source = Path(__file__).with_name('mp_observer.js').read_text(encoding='utf-8')
    for pg in (a, b):
        pg.evaluate(source)


def divergence(a, b, key):
    if ':' not in str(key):
        key = a.evaluate('(t)=>MP.ep+":"+t', int(key))
    values = [pg.evaluate('(k)=>window.__auditDetails?.[k]', key) for pg in (a,b)]
    if all(values):
        for part in values[0]:
            if values[0][part] != values[1][part]:
                left,right=values[0][part],values[1][part]
                try:
                    left=[json.loads(x) for x in left.split('|')] if part in ('units','structures') else json.loads(left)
                    right=[json.loads(x) for x in right.split('|')] if part in ('units','structures') else json.loads(right)
                except (ValueError,TypeError):
                    pass
                differences=[]
                def walk(x,y,path):
                    if len(differences)>=8 or x==y:return
                    if isinstance(x,dict) and isinstance(y,dict):
                        for field in sorted(set(x)|set(y)):walk(x.get(field,'<missing>'),y.get(field,'<missing>'),path+'.'+field)
                    elif isinstance(x,list) and isinstance(y,list):
                        if len(x)!=len(y):differences.append((path+'.length',len(x),len(y)))
                        for index,(xx,yy) in enumerate(zip(x,y)):walk(xx,yy,path+'['+str(index)+']')
                    else:differences.append((path,str(x)[:300],str(y)[:300]))
                walk(left,right,part)
                print('STATE DIFFERENCE',key,json.dumps(differences),flush=True)


def check(name, actual, expected=True):
    passed = actual == expected
    assertions.append({'name': name, 'passed': passed, 'expected': expected, 'actual': actual})
    if not passed:
        print('FAIL', name, 'expected', expected, 'actual', actual, flush=True)
    return passed


def load(browser, html, width=480, height=320):
    pg, errors, timing = load_page(browser, html, width, height)
    phases['load'] += timing['load']
    # Startup/audio retain REALR, captured during initialization. Give scenario
    # input selection its own stream after boot so ambient draws cannot move it.
    pg.evaluate('() => { __useFrameClock(); renderer.render = () => {}; Math.random = rngf(0x4e415258); }')
    return pg, errors


def flush(a, b):
    aa = pending.pop(b, []) + a.evaluate('() => {const q=window.__out;window.__out=[];return q}')
    bb = pending.pop(a, []) + b.evaluate('() => {const q=window.__out;window.__out=[];return q}')
    if aa:
        b.evaluate('(q) => {for(const s of q) mpMsg(JSON.parse(s))}', aa)
    if bb:
        a.evaluate('(q) => {for(const s of q) mpMsg(JSON.parse(s))}', bb)


def pump(a, b, n=1, frames=5):
    global bridge_calls
    for _ in range(n):
        counts = [frames, frames]
        if a in states and b in states and states[a]['ep'] == states[b]['ep']:
            target = min(states[a]['tick'], states[b]['tick']) + frames
            counts = [max(0, target-states[pg]['tick']) for pg in (a,b)]
        outputs = []
        # Five frames fit inside production MPD=6. Both peers receive packets
        # from the previous batch, so host/guest processing order is symmetric.
        for pg, count in zip((a,b), counts):
            outputs.append(pg.evaluate('''([messages,n]) => {
                for(const s of messages) mpMsg(JSON.parse(s));
                for(let i=0;i<n;i++) __stepFrame();
                const out=window.__out;window.__out=[];
                return {out,tick:MP.tick,ep:MP.ep};
            }''', [pending.pop(pg, []), count]))
            bridge_calls += 1
            states[pg] = outputs[-1]
        pending[a] = outputs[1]['out']
        pending[b] = outputs[0]['out']


def wait_seconds(a, b, seconds, compare):
    # seconds are simulation time, not a sleep or a CPU-dependent tick count.
    total = max(1, round(seconds * 30))
    for i in range(0, total, 5):
        pump(a, b, frames=min(5, total-i))
        if (i // 5) % 6 == 5:
            compare()
    compare()


def finish(identity, ok, a, b, errors, comparisons=None):
    check('scenario requirements', bool(ok))
    check('no browser exceptions', errors, [])
    states = [pg.evaluate('() => ({tick:MP.tick,epoch:MP.ep,desync:MP.desync,seed:SEED,sites:[CS,CS2].map(c=>c?[c.tx,c.ty]:null),hash:mpHash()})') for pg in (a, b)]
    check('matching final epoch', states[0]['epoch'], states[1]['epoch'])
    check('no final desync', any(s['desync'] for s in states), False)
    if comparisons is not None:
        check('nonzero compared ticks', comparisons > 0)
    phases['scenario'] = (time.perf_counter() - started)*1000 - phases['load']
    record = result(identity, 'Production lockstep scenario ' + identity, assertions, started, phases, {'peers': states, 'scenarioRandomSeed':0x4e415258,'manualFrames': True, 'comparedTicks': comparisons, 'bridgeCalls': bridge_calls})
    emit(record)
    if record['status'] != 'passed':
        raise AssertionError(identity + ': scenario failed; see TEST_RESULT assertion details')
