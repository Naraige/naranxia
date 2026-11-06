import { rangeOf } from '../ai/kingdoms.js';
import { SAPL, wkOf, WKT } from '../ai/workplaces.js';
import { aInit, snd, toggleSound } from '../audio/sound.js';
import { backgroundLoopState } from '../core/background-loop.js';
import { hyp } from '../core/math.js';
import { build, constructionState, FORMS, tfo } from '../gameplay/construction.js';
import { army, buy } from '../gameplay/economy.js';
import { formationsState, order, setStance } from '../gameplay/formations.js';
import { kingSkill } from '../gameplay/king-skills.js';
import { openMenu, startGame } from '../gameplay/lifecycle.js';
import { HOMEC, playersState } from '../gameplay/players.js';
import { ROTT, TH, TS, TW, UPC } from '../gameplay/rules.js';
import { sel, selectionState, TRB } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { callWave } from '../gameplay/waves.js';
import { inputState, keys } from './state.js';
import { lobbyShow } from '../multiplayer/lobby.js';
import { setPause } from '../multiplayer/lockstep.js';
import { MP } from '../multiplayer/session.js';
import { home, scr, wpos } from '../rendering/camera.js';
import { puff } from '../rendering/effects.js';
import { PKL, pkLiveFocus } from '../rendering/live-site-preview.js';
import { rs } from '../rendering/resolution.js';
import { CAM, camera } from '../rendering/scene.js';
import { PK, pkSet, PKU } from '../rendering/site-picker.js';
import { pickStruct } from '../rendering/structures.js';
import { buildMenuState, NAMES } from '../ui/build-menu.js';
import { cv } from '../ui/canvases.js';
import { hudState, inR, mmRect, selIdle, selPeas } from '../ui/hud.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { KB, nmI, saveKB, settingsState } from '../ui/settings.js';
import { confirmPick, openPicker, pkRotate, PVH, PVW, sitePickerState } from '../ui/site-picker.js';
import { occ } from '../world/terrain.js';

/* ---- input ---- */
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}};

function mmGo(p){CAM.x=Math.max(2,Math.min(TW-2,(p.x-mmRect.x)/mmRect.w*TW));CAM.z=Math.max(2,Math.min(TH-2,(p.y-mmRect.y)/mmRect.h*TH))}

export function camZoom(d){CAM.dist=Math.max(7,Math.min(80,CAM.dist*(d>0?1.18:1/1.18)))}

export function panCam(dx,dy){const u=2*CAM.dist*Math.tan(camera.fov*Math.PI/360)/cv.height,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw),sp=Math.sin(CAM.pitch);
 CAM.x-=(dx*c-dy*s/sp)*u;CAM.z-=(-dx*s-dy*c/sp)*u}

export function pickUnit(p){let b=null,bd=20*inputState.DPR;for(const u of sessionState.units)if(u.t===0&&!u.shel){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(!q.ok)continue;const dd=hyp(q.x-p.x,q.y-p.y);if(dd<bd){bd=dd;b=u}}return b}

let lastClk=0,lastTy='';
const paint=()=>{const w=wpos(),tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS);if((sessionState.mode==='raise'||sessionState.mode==='dig')&&tfo.has(ty*TW+tx))return;build(sessionState.mode,tx,ty)};

const BK=['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path'];

export function initializeDesktopInput() {
  cv.oncontextmenu=e=>e.preventDefault();

  cv.addEventListener('pointercancel',()=>{inputState.ptr=null;inputState.box=null;hudState.mmDrag=false;settingsState.sliderDrag=null});
  addEventListener('mouseup',e=>{if(e.target!==cv){inputState.ptr=null;inputState.box=null;hudState.mmDrag=false}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});

  cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);const p=pos(e);inputState.mouse=p;
   aInit();if(backgroundLoopState.autoPaused&&sessionState.paused&&sessionState.started&&!MP.on){sessionState.paused=false;backgroundLoopState.autoPaused=false;inputState.ptr=null;return}const h=hudState.uiHits.find(h=>h.fn&&inR(p,h));if(h){snd('click');h.fn();inputState.ptr=null;return}if(sitePickerState.picking){if(!hudState.uiRects.some(r=>inR(p,r)))inputState.ptr={x:e.clientX,y:e.clientY,m:0,btn:e.button,pk:1};return}if(!sessionState.started||sessionState.over||sessionState.showMap)return;
   if(inR(p,mmRect)){hudState.mmDrag=true;mmGo(p);return}if(hudState.uiRects.some(r=>inR(p,r)))return;
   const fo=e.button===2&&!sessionState.mode&&sel().some(u=>u.type!=='peasant');inputState.ptr={x:e.clientX,y:e.clientY,m:0,pan:e.button===0&&inputState.panMode,rot:e.button!==0&&!fo,fo:fo?{w0:wpos(),w1:null}:null,sx:p.x,sy:p.y,btn:e.button};inputState.box=null};

  cv.onpointermove=e=>{inputState.mouse=pos(e);if(e.pointerType==='mouse'&&e.buttons===0&&(inputState.ptr||hudState.mmDrag||settingsState.sliderDrag)){inputState.ptr=null;inputState.box=null;hudState.mmDrag=false;settingsState.sliderDrag=null}if(settingsState.sliderDrag){settingsState.sliderDrag.set(Math.max(0,Math.min(1,(inputState.mouse.x/hudDisplayState.UIS-settingsState.sliderDrag.x)/settingsState.sliderDrag.w)));return}if(hudState.mmDrag){mmGo(inputState.mouse);return}if(!inputState.ptr)return;const dx=e.clientX-inputState.ptr.x,dy=e.clientY-inputState.ptr.y,k=cv.width/cv.getBoundingClientRect().width;
   inputState.ptr.m+=Math.abs(dx)+Math.abs(dy);inputState.ptr.x=e.clientX;inputState.ptr.y=e.clientY;
   if(inputState.ptr.pk&&PKL.on){if(inputState.ptr.m>6){if(inputState.ptr.btn===0)panCam(dx*k,dy*k);else{CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}return}
   if(inputState.ptr.pk){if(inputState.ptr.m>6&&PK){if(inputState.ptr.btn===0){const sp=PK.dist*.0012*k;PK.tx-=(dx*Math.cos(PK.yaw)-dy*Math.sin(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tz+=(dx*Math.sin(PK.yaw)+dy*Math.cos(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tx=Math.max(0,Math.min(PVW*PKU,PK.tx));PK.tz=Math.max(0,Math.min(PVH*PKU,PK.tz))}else{PK.yaw-=dx*.007;PK.pitch=Math.max(.3,Math.min(1.45,PK.pitch+dy*.005))}}return}

   if(inputState.ptr.fo){if(inputState.ptr.m>8)inputState.ptr.fo.w1=wpos()}
   else if(inputState.ptr.rot){if(inputState.ptr.m>8){CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}
   else if(inputState.ptr.pan){if(inputState.ptr.m>8)panCam(dx*k,dy*k)}
   else if(inputState.ptr.m>8){if((sessionState.mode==='path'||sessionState.mode==='raise'||sessionState.mode==='dig'||sessionState.mode==='upgrade'||sessionState.mode==='spike')&&!sessionState.over)paint();else inputState.box={x1:inputState.ptr.sx,y1:inputState.ptr.sy,x2:inputState.mouse.x,y2:inputState.mouse.y}}};

  cv.onpointerup=()=>{hudState.mmDrag=false;if(inputState.ptr&&inputState.ptr.pk&&PKL.on){if(inputState.ptr.m<=6&&inputState.ptr.btn===0&&PKL.hit){pkSet(PKL.hit.tx,PKL.hit.ty,PKL.hit.ok);sitePickerState.pickMsg=PKL.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click')}inputState.ptr=null;return}
   if(inputState.ptr&&inputState.ptr.pk){if(inputState.ptr.m<=6&&inputState.ptr.btn===0&&PK&&PK.hit){pkSet(PK.hit.tx,PK.hit.ty,PK.hit.ok);sitePickerState.pickMsg=PK.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click');PKL.on=true;pkLiveFocus(PK.hit.tx,PK.hit.ty)}inputState.ptr=null;return}if(settingsState.sliderDrag){settingsState.sliderDrag=null;snd('sword');return}if(!inputState.ptr)return;
   if(inputState.ptr.fo&&inputState.ptr.m>8&&inputState.ptr.fo.w1){const a=inputState.ptr.fo.w0,b=inputState.ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),ft=constructionState.formType;if(!constructionState.formType)constructionState.formType=1;formationsState.FORCEF=fm;try{order(a)}finally{formationsState.FORCEF=null;constructionState.formType=ft}puff(a.x,a.y,'#ffe14a',8,40);inputState.ptr=null;buildMenuState.FPV=null;return}
   if(inputState.ptr.m<=8){const w=wpos(),p=inputState.mouse;
    if(inputState.ptr.btn===2){if(sessionState.mode){sessionState.mode=null}else if(sel().length){const ps=pickStruct(p),w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}}
    else if(sessionState.mode&&!sessionState.over)build(sessionState.mode,Math.floor(w.x/TS),Math.floor(w.y/TS));
    else{const b=pickUnit(p);if(b){snd('select');sessionState.mode=null;const dbl=Date.now()-lastClk<380&&lastTy===b.type&&!b.gar;lastClk=Date.now();lastTy=b.type;sessionState.units.forEach(u=>u.sel=false);if(dbl){sessionState.units.forEach(u=>{if(u.t===0&&u.type===b.type&&!u.gar){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(q.ok&&q.x>=0&&q.x<=cv.width&&q.y>=0&&q.y<=cv.height)u.sel=true}});hudDisplayState.msgS='All visible '+NAMES[b.type]+'s selected';hudDisplayState.msgT=2}else b.sel=true;if(b.rg&&b.cap&&!dbl){b.cap.sel=true;if(b.cap.sq)b.cap.sq.forEach(f=>f.sel=true)}if(b.sq)b.sq.forEach(f=>f.sel=true);selectionState.selB=null;selectionState.castleSel=false}else{const ps=pickStruct(p),o=ps||occ.get(Math.floor(w.y/TS)*TW+Math.floor(w.x/TS));if(o&&o.t===0&&(!MP.on||(o.pl|0)===playersState.CURPL)&&o.prog>=1&&!sel().length){const dblB=Date.now()-selectionState.lastClkB<380&&selectionState.lastTyB===o.type&&o.type!=='castle';selectionState.lastClkB=Date.now();selectionState.lastTyB=o.type;selectionState.SELBS=dblB?sessionState.structs.filter(s=>s.t===0&&s.type===o.type&&s.prog>=1&&s.hp>0&&(!MP.on||(s.pl|0)===playersState.CURPL)):[];selectionState.selB=o===HOMEC()?null:o;selectionState.castleSel=o===HOMEC();snd('select');hudDisplayState.msgS=!TRB.has(o.type)?(NAMES[o.type]||o.type)+': '+Math.ceil(o.hp)+' / '+o.max+' HP'+(o.hp<o.max?' - press Repair':'')+(WKT.has(o.type)?(wkOf(o)?' - worked by a peasant':' - nobody works it: right-click it with a peasant'):'')+(o.type==='forester'?(n=>' - '+n+' sapling'+(n===1?'':'s')+' growing')([...SAPL.values()].filter(v=>v.s===o.sid).length):''):o===HOMEC()?'Castle: shoots arrows at zombies in range, trains peasants and builds'+(n=>n?' - '+n+' villager'+(n>1?'s':'')+' sheltering inside (Repair calls them out)':'')(sessionState.units.filter(u=>u.shel===o).length):o.type==='guild'?'Builders guild: choose how many peasants build, repair and reshape the land':o.type==='academy'?'Academy: research upgrades here':o.type==='market'?'Market: sell wood, stone or food for gold, or buy them':'Barracks: train soldiers here';hudDisplayState.msgT=3;{const rg=rangeOf(o);if(rg)hudDisplayState.msgS+=' - range '+Math.round(rg.r)+' tiles'}if(selectionState.SELBS.length>1){hudDisplayState.msgS='All your '+NAMES[o.type]+'s selected ('+selectionState.SELBS.length+')'+(UPC[o.type]&&selectionState.SELBS.some(s=>s.tier===0)?' - Upgrade turns every wooden one to stone':'');hudDisplayState.msgT=4}}else if(sel().length){const w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}else{selectionState.selB=null;selectionState.castleSel=false;selectionState.SELBS=[]}}}}
   else if(!inputState.ptr.pan&&!inputState.ptr.rot&&inputState.box){const x0=Math.min(inputState.box.x1,inputState.box.x2),x1=Math.max(inputState.box.x1,inputState.box.x2),y0=Math.min(inputState.box.y1,inputState.box.y2),y1=Math.max(inputState.box.y1,inputState.box.y2);
    sessionState.mode=null;selectionState.castleSel=false;sessionState.units.forEach(u=>{if(u.t!==0||u.shel||(MP.on&&(u.pl|0)!==playersState.CURPL)){u.sel=false;return}const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);u.sel=q.ok&&q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1});sessionState.units.forEach(u=>{if(u.sel&&u.rg&&u.cap)u.cap.sel=true});sessionState.units.forEach(u=>{if(u.sel&&u.sq)u.sq.forEach(f=>f.sel=true)})}
   inputState.ptr=null;inputState.box=null};

  cv.onwheel=e=>{e.preventDefault();inputState.mouse=pos(e);if(sessionState.started&&!sessionState.showMap)camZoom(e.deltaY>0?1:-1);else if(sitePickerState.picking&&PKL.on)camZoom(e.deltaY>0?1:-1);else if(sitePickerState.picking&&PK)PK.dist=Math.max(50,Math.min(900,PK.dist*(e.deltaY>0?1.15:1/1.15)))};

  addEventListener('keydown',e=>{aInit();if(document.activeElement===nmI)return;const k=e.key.toLowerCase();
   if(settingsState.rebind){e.preventDefault();if(k==='escape'){settingsState.rebind=null;return}const old=KB[settingsState.rebind];for(const a in KB)if(a!==settingsState.rebind&&KB[a]===k)KB[a]=old;KB[settingsState.rebind]=k;settingsState.rebind=null;saveKB();return}
   keys[k]=true;
   if(!sessionState.started){if(k==='escape'){if(settingsState.settingsOpen){settingsState.settingsOpen=false;if(settingsState.fromGame){settingsState.fromGame=false;startGame()}}else if(sitePickerState.picking){sitePickerState.picking=false;if(MP.conn)lobbyShow()}else if(settingsState.setupOpen)settingsState.setupOpen=false}else if(k==='enter'&&!settingsState.settingsOpen){e.preventDefault();if(sitePickerState.picking)confirmPick();else if(settingsState.setupOpen)openPicker();else if(sessionState.inGame)startGame();else settingsState.setupOpen=true}else if(sitePickerState.picking&&k===KB.rotate&&!settingsState.settingsOpen)pkRotate();return}
   if(sessionState.over)return;
   if(k==='escape'){if(sessionState.showMap)sessionState.showMap=false;else if(sessionState.mode||sel().length){sessionState.mode=null;sessionState.units.forEach(u=>u.sel=false)}else if(buildMenuState.BCAT)buildMenuState.BCAT=null;else openMenu();return}
   if(!e.ctrlKey&&!e.shiftKey&&!e.metaKey&&['1','2','3','4'].includes(k)&&sel().some(u=>u.type!=='peasant')){setStance(['agg','def','hold','stop'][+k-1]);return}
   const a=Object.keys(KB).find(x=>KB[x]===k);if(!a)return;if(k.length===1&&!/[a-z0-9]/.test(k))e.preventDefault();
   if(a==='map'){sessionState.showMap=!sessionState.showMap;return}
   if(a==='cry'||a==='charge'){kingSkill(a);return}
   if(sessionState.showMap)return;
   if(BK.includes(a)||a==='upgrade'||a==='barracks'||a==='farm'||a==='storage'||a==='house'||a==='academy'||a==='market'||a==='forester'||a==='guild'||a==='torch'||a==='rally'||a==='rallyc'||a==='movec'||a==='ramp'||a==='tier'||a==='demolish'||a==='raise'||a==='dig'||a==='ballista'||a==='trebuchet'){buy(a);return}
   if(a==='rotate'){if(sessionState.mode){constructionState.buildRot=(constructionState.buildRot+1)&3;hudDisplayState.msgS='Rotated '+constructionState.buildRot*90+' deg';hudDisplayState.msgT=1.5}else if(selectionState.selB&&selectionState.selB.t===0&&ROTT.has(selectionState.selB.type))build('rotate',selectionState.selB.tx,selectionState.selB.ty)}
   else if(a==='form'){constructionState.formType=(constructionState.formType+1)%FORMS.length;hudDisplayState.msgS='Formation: '+FORMS[constructionState.formType];hudDisplayState.msgT=2}
   else if(a==='sound')toggleSound();else if(a==='idle')selIdle();else if(a==='wave')callWave();else if(a==='home')home();else if(a==='army')army();else if(a==='peas')selPeas();
   else if(a==='pause'){setPause(!sessionState.paused);e.preventDefault()}else if(a==='speed'){if(!MP.on)sessionState.spd=sessionState.spd%3+1}
   if(k==='p'){inputState.panMode=!inputState.panMode;hudDisplayState.msgS=inputState.panMode?'Pan mode: drag moves the camera':'Select mode: drag draws a box';hudDisplayState.msgT=2}if(k==='+'||k==='=')camZoom(-1);if(k==='-')camZoom(1);if(k===','){selIdle()}});

  addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

  addEventListener('resize',rs);
}
