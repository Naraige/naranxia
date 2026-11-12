#!/usr/bin/env python3
"""QA pictures of the main screens in ONE page load (a headless load is slow): title, leaderboard card, Update, settings, video guide,
site picker, then a seeded kingdom by day (HUD bars, quest panel, quest log, quest markers), each season, a night raid with a boss,
spearmen in the fight, and the narrow screen (390x700).
usage: python3 tools/qa_shots.py [outdir, default dist/qa/shots] [only: comma list of step-name prefixes]   (after npm run build)
Prints one line per picture; pictures are JPEG 1280x720 unless the step says otherwise. Not a test: it is for looking."""
import sys, json, time
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'dist/qa/shots'
ONLY = sys.argv[2].split(',') if len(sys.argv) > 2 else None
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1280, 720
NARROW = (390, 700)

RUNS = {"0.1234": [{"w": 31, "k": 4120, "s": 7220, "d": 1, "n": "Naranxia"}, {"w": 24, "k": 2900, "s": 5300, "d": 2, "n": "Eldoria"}, {"w": 19, "k": 2100, "s": 4000, "d": 3, "n": "Valmont"}],
        "0.2345": [{"w": 17, "k": 1800, "s": 3500, "d": 4, "n": "Brisevent"}, {"w": 14, "k": 1500, "s": 2900, "d": 5, "n": "Hammerdawn"}, {"w": 12, "k": 1100, "s": 2300, "d": 6, "n": "Rochenoire"}],
        "0.3456": [{"w": 10, "k": 900, "s": 1900, "d": 7, "n": "Hautmont"}, {"w": 8, "k": 700, "s": 1500, "d": 8, "n": "Longue-Garde-du-Nord"}, {"w": 6, "k": 400, "s": 1000, "d": 9, "n": "Port-Azur"}],
        "0.4567": [{"w": 4, "k": 200, "s": 600, "d": 10, "n": "Dix"}, {"w": 2, "k": 90, "s": 290, "d": 11, "n": "Onze"}]}

# seeded kingdom: castle, one building per menu, an army with spearmen and the King, land explored (same helpers as tools/shots/_prelude.js)
GAME = """async()=>{let s=7;window.__RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 const rr=renderer.render;renderer.render=function(){};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 for(const R of RESP){R.g=900;R.w=700;R.s=500;R.f=300}
 const cast={x:CX*TS,y:CY*TS},ft=(x,y)=>freeTile(Math.round(x),Math.round(y));
 const SLOTS=[[-8,-1],[-8,5],[-13,2],[-13,8],[8,-1],[8,5],[13,2],[13,8]];
 ['barracks','market','guild','academy','tower','house','farm','tower'].forEach((t,i)=>{const sl=SLOTS[i],f=ft(CS.tx+2+sl[0],CS.ty+2+sl[1]);build(t,f[0],f[1]);const st=structs.filter(x=>x.type===t).pop();if(st){st.prog=1;st.hp=st.max}});
 ['knight','spearman','archer','spearman','knight','spearman','archer','spearman','spearman','archer','king'].forEach((t,i)=>{units.push(mkU(0,t,cast.x+(-4+(i%6)*1.6)*TS,cast.y+(4+((i/6)|0)*1.6)*TS))});
 for(let dx=-48;dx<=48;dx+=16)for(let dy=-48;dy<=48;dy+=16)ensureAround(Math.max(1,Math.min(TW-2,CX+dx)),Math.max(1,Math.min(TW-2,CY+dy)),1);
 for(let i=0;i<40;i++)update(.1);
 CAM.x=CX;CAM.z=CY+3;CAM.dist=24;CAM.pitch=.9;CAM.yaw=0;renderer.render=rr;icoPart("units");/* the heads were redrawn by reset() while nothing was drawn */
 window.__qset=id=>{const Q=QST;Q.on=1;Q.d={};Q.last='';Q.dt=-1e9;for(const q of QUESTS){if(q.id===id)break;Q.d[q.id]=1}selB=null;for(const u of units)u.sel=false;questPanelState.log=false};
 window.__sel=t=>{selB=structs.find(x=>x.type===t&&x.t===0)||null};
 return JSON.stringify({u:units.length,s:structs.map(x=>x.type).join(','),q:(qCur()||{}).id})}"""

RAID = """async()=>{const rr=renderer.render;renderer.render=function(){};selB=null;questPanelState.log=false;
 waveN=9;wave();const cast={x:CX*TS,y:CY*TS};let k=0;
 for(let i=0;i<SW.n&&i<220;i++){SW.x[i]=cast.x+(((i*37)%21)-10)*TS;SW.y[i]=cast.y+(8+(i*53)%6)*TS}
 for(const u of units)if(u.t===1&&(k<60||u.boss)){const a=k++;u.x=cast.x+(((a*37)%19)-9)*TS;u.y=cast.y+(8+(a*53)%5)*TS}
 for(let i=0;i<30;i++)update(.1);
 CAM.x=CX;CAM.z=CY+5;CAM.dist=22;CAM.pitch=.9;renderer.render=rr;
 const b=units.find(u=>u.boss);return JSON.stringify({z:units.filter(u=>u.t===1).length,sw:SW.n,boss:!!b,night:+nightLv.toFixed(2),sp:units.filter(u=>u.type==='spearman'&&u.hp>0).length})}"""

FIGHT = """()=>{const sp=units.filter(u=>u.type==='spearman'&&u.hp>0);if(!sp.length)return 'no spearman left';
 let cx=0,cy=0;for(const u of sp){cx+=u.x;cy+=u.y}CAM.x=cx/sp.length/TS;CAM.z=cy/sp.length/TS;CAM.dist=8;CAM.pitch=.7;return sp.length+' spearmen'}"""

# second kingdom (steps 6x, 7x): no knight and no archer (the quest line stays where a step puts it), a King, fresh start (the start message shows)
GAME2 = GAME.replace("['knight','spearman','archer','spearman','knight','spearman','archer','spearman','spearman','archer','king']", "['spearman','spearman','spearman','king']").replace('for(let i=0;i<40;i++)update(.1);', 'for(let i=0;i<5;i++)update(.1);')

# six spearmen against eight zombies on open ground, seen from close
DUEL = """async()=>{const rr=renderer.render;renderer.render=function(){};__qset('walls');for(const u of units)if(u.type==='king')u.hp=0;
 const f=freeTile(CX+2,CY+11),x0=(f[0]+.5)*TS,y0=(f[1]+.5)*TS;
 for(let i=0;i<6;i++)units.push(mkU(0,'spearman',x0+(i-2.5)*TS*.9,y0));
 for(let i=0;i<8;i++)units.push(mkU(1,i===7?'brute':'zombie',x0+(i-3.5)*TS*.8,y0+TS*2.2));
 for(let i=0;i<24;i++)update(.05);
 CAM.x=f[0]+.5;CAM.z=f[1]+1.2;CAM.dist=7;CAM.pitch=.75;CAM.yaw=0;renderer.render=rr;
 return JSON.stringify({sp:units.filter(u=>u.type==='spearman'&&u.hp>0).length,z:units.filter(u=>u.t===1&&u.hp>0).length})}"""

# wave 3 (blood moon): part of the horde brought next to the castle, then the simulation runs until the night has fallen
NIGHT = """async()=>{const rr=renderer.render;renderer.render=function(){};selB=null;
 waveN=2;wave();const cast={x:CX*TS,y:CY*TS};let k=0;
 for(let i=0;i<SW.n&&i<220;i++){SW.x[i]=cast.x+(((i*37)%21)-10)*TS;SW.y[i]=cast.y+(8+(i*53)%6)*TS}
 for(const u of units)if(u.t===1&&u.lane>=0&&k<60){const a=k++;u.x=cast.x+(((a*37)%19)-9)*TS;u.y=cast.y+(8+(a*53)%5)*TS}
 let n=0;for(;n<400&&nightLv<.9;n++)update(.1);
 CAM.x=CX;CAM.z=CY+4;CAM.dist=24;CAM.pitch=.9;renderer.render=rr;
 return JSON.stringify({ticks:n,night:+nightLv.toFixed(2),z:units.filter(u=>u.t===1).length,sw:SW.n,over})}"""

def season(w):
    return "()=>{waveN=%d;selB=null;questPanelState.log=false;CAM.dist=26;return seasonIdx()+'/'+wxLabel()}" % w

# (name, js or None, options): options: frames to wait, vp=(w,h) viewport for this step, key=keyboard key pressed before the js
STEPS = [
    ('01_title_noscores', None, {'wait': 7000, 'real': 2}),
    ('02_title_scores', "()=>{localStorage.setItem('dk_sb',%s);return 'set'}" % json.dumps(json.dumps(RUNS)), {'real': 0}),
    ('03_title_narrow', None, {'vp': NARROW}),
    ('04_leaderboard', "()=>{titleDebug.rec(true)}", {}),
    ('05_update', "()=>{titleDebug.rec(false);titleDebug.notes(true)}", {'real': 0}),
    ('06_settings0', "()=>{titleDebug.notes(false);settingsState.settingsOpen=true;settingsDebug.tab(0)}", {'real': 0}),
    ('07_settings1', "()=>{settingsDebug.tab(1)}", {'real': 0}),
    ('08_settings2', "()=>{settingsDebug.tab(2)}", {'real': 0}),
    ('09_settings3', "()=>{settingsDebug.tab(3)}", {'real': 0}),
    ('10_guide_build', "()=>{settingsState.settingsOpen=false;settingsDebug.tab(0);openGuide()}", {'real': 0, 'guide': (1, 8)}),
    ('11_guide_population', None, {'real': 0, 'guide': (2, 7)}),
    ('12_guide_walls', None, {'real': 0, 'guide': (4, 8)}),
    ('13_guide_research', None, {'real': 0, 'guide': (6, 10)}),
    ('13a_guide_traps', None, {'real': 0, 'guide': (9, 9.5)}),
    ('13b_guide_seasons', None, {'real': 0, 'guide': (10, 14.2)}),
    ('13c_guide_market', None, {'real': 0, 'guide': (11, 12.6)}),
    ('13d_guide_camps', None, {'real': 0, 'guide': (12, 16.6)}),
    ('13e_guide_talents', None, {'real': 0, 'guide': (13, 8.8)}),
    ('14_guide_narrow', None, {'guide': (11, 5), 'vp': NARROW}),
    ('15_picker', "()=>{guideState.open=false;openPicker();return JSON.stringify(sitePickerState.pickPos)}", {'frames': 6}),
    ('20_day_hud', GAME, {'frames': 6}),
    ('21_questlog', "()=>{questPanelState.log=true}", {'real': 0}),
    ('22_mark_building', "()=>{__qset('knights');return (qCur()||{}).id}", {}),
    ('23_mark_train', "()=>{__qset('knights');__sel('barracks')}", {}),
    ('24_mark_king', "()=>{__qset('king');const k=units.find(u=>u.type==='king');if(k)k.hp=0;update(.05);return (qCur()||{}).id}", {}),
    ('25_mark_market', "()=>{__qset('market');__sel('market')}", {}),
    ('26_mark_guild', "()=>{__qset('guild');__sel('guild')}", {}),
    ('27_mark_research', "()=>{__qset('research');__sel('academy')}", {}),
    ('28_mark_siege', "()=>{__qset('siege')}", {}),
    ('29_mark_envoy', "()=>{__qset('envoy')}", {}),
    ('30_mark_skill', "()=>{__qset('skill');units.push(mkU(0,'king',CX*TS,(CY+5)*TS));update(.05);const k=units.find(u=>u.type==='king'&&u.hp>0);if(k)k.sel=true;return !!k}", {}),
    ('31_hud_narrow', "()=>{__qset('farm')}", {'vp': NARROW}),
    ('32_questlog_narrow', "()=>{questPanelState.log=true}", {'real': 0, 'vp': NARROW}),
    # the Esc menu with its Guide row, the guide over the game, then back to the game for the next steps
    ('33_game_menu', "()=>{selB=null;questPanelState.log=false;openMenu()}", {}),
    ('34_guide_ingame', "()=>{openGuide()}", {'real': 0, 'guide': (12, 12.8)}),
    ('35_guide_closed', "()=>{guideState.open=false;startGame();return started}", {}),
    ('40_summer', season(4), {'wait': 6000}),
    ('41_autumn', season(8), {'wait': 6000}),
    ('42_winter', season(12), {'wait': 6000}),
    ('50_raid_boss_night', RAID, {'wait': 3000}),
    ('51_spearmen_fight', FIGHT, {'frames': 5}),
    # second kingdom: overlaps around the quest panel, markers that need an empty army, a clean fight, the night
    ('60_start_message', GAME2, {'frames': 6}),
    ('61_mark_barracks', "()=>{__qset('knights');return (qCur()||{}).id}", {}),
    ('62_mark_knight', "()=>{__qset('knights');__sel('barracks')}", {}),
    ('63_event_bar', "()=>{__qset('walls');evPush({k:'car',i:1,a:{g:40,w:30,s:20}});msgS='Quest complete: Bows on the wall';hudDisplayState.msgT=30;return 1}", {}),
    ('64_hint_bar', "()=>{for(let i=0;i<40;i++)units.push(mkU(0,'peasant',(CX-6+i%8)*TS,(CY+8+(i>>3))*TS));try{localStorage.removeItem('dk_hint_pop')}catch(e){}update(.05);return units.length}", {'wait': 1500}),
    ('65_bars_narrow', None, {'vp': NARROW}),
    ('66_bars_mid', None, {'vp': (900, 600)}),
    ('70_spearmen_duel', DUEL, {'frames': 5}),
    ('71_night_bloodmoon', NIGHT, {'wait': 2000}),
    # the night look is driven by the frame loop (it falls as the horde closes in): forced here, as docs/studio-boards/blocks/_src/shoot.py does
    ('72_night_forced', "()=>{clearInterval(window.__nt);CAM.dist=20;window.__live=1;for(let i=0;i<10;i++){hordeOn=true;nightLv=1;render3D(.5)}window.__live=0;return 'night '+nightLv}", {'real': 0}),
]

# software WebGL draws a 1280x720 frame in tens of seconds: the screen is drawn only for the frames of a picture (window.__live),
# small off-screen renders (icons, guide sprites) always pass
GATE = """()=>{const rr=renderer.render;window.__live=0;renderer.render=function(){const t=renderer.getRenderTarget&&renderer.getRenderTarget();
 if(window.__live>0||(t&&t.width<=320))return rr.apply(this,arguments)};window.__rr=rr;return 'gated'}"""

def real(pg, n=2):
    """n real frames, then freeze the 3D picture again"""
    pg.evaluate("(n)=>new Promise(r=>{window.__live=1;const f=()=>--n>0?requestAnimationFrame(f):(window.__live=0,r());requestAnimationFrame(f)})", n + 1)

def frames(pg, n):
    pg.evaluate("(n)=>new Promise(r=>{const f=()=>--n>0?requestAnimationFrame(f):r();requestAnimationFrame(f)})", n)

with sync_playwright() as p:
    import fontroute
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': W, 'height': H})
    # skip the two launch cards (quick intro already seen); everything else is the default of a new player
    ctx.add_init_script("try{localStorage.setItem('dk_qi','1');localStorage.setItem('dk_seen','1')}catch(e){}")
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: print('LOG', m.text[:300], flush=True) if m.type == 'error' and 'Failed to load' not in m.text and 'ERR_' not in m.text else None)
    pg.route('**/three.min.js', lambda r: r.fulfill(path=str(ROOT / 'node_modules/three/build/three.min.js'), content_type='application/javascript'))
    fontroute.setup(pg)
    t0 = time.time()
    pg.goto((ROOT / 'dist/naranxia_readable.html').as_uri(), timeout=900000); pg.wait_for_timeout(3000)
    print('loaded', round(time.time() - t0), 's', flush=True)
    print(pg.evaluate(GATE), flush=True)
    vp = (W, H)
    for name, js, o in STEPS:
        if ONLY and not any(name.startswith(x) for x in ONLY) and not o.get('always'):
            # the game scene is needed by every in-game step
            if not (name == '20_day_hud' and any(x[:1] in '2345' for x in ONLY)):
                continue
        t1 = time.time(); r = None
        try:
            want = o.get('vp', (W, H))
            if want != vp:
                pg.set_viewport_size({'width': want[0], 'height': want[1]}); vp = want; frames(pg, 3)
            if js: r = pg.evaluate(js)
            if 'guide' in o:
                c, t = o['guide']
                for _ in range(600):
                    if pg.evaluate("()=>!!(window.__guide&&window.__guide.ready())"): break
                    pg.wait_for_timeout(1000)
                pg.evaluate("([c,t])=>{window.__guide.at(c,t,true)}", [c, t])
            if o.get('wait'): pg.wait_for_timeout(o['wait'])
            frames(pg, o.get('frames', 4))
            if o.get('real', 1): real(pg, o.get('real', 1))
            frames(pg, 2)
            pg.screenshot(path=str(OUT / (name + '.jpg')), type='jpeg', quality=85, timeout=600000)
            ovf = pg.evaluate("()=>{const o=[...new Set(window.__ovf||[])];window.__ovf=[];return o}")
        except Exception as e:
            print(name, 'EXC', str(e)[:300], flush=True); continue
        print(name, round(time.time() - t1), 's', r if r is not None else '', ('OVERFLOW ' + json.dumps(ovf, ensure_ascii=False)) if ovf else '', ('ERR ' + str(errs[-2:])) if errs else '', flush=True)
    print('ERRS', errs[:6]); b.close()
