import { diagnosticsState } from '../debug/diagnostics.js';
import { sessionState } from '../gameplay/session.js';
import { TUT } from '../gameplay/traps.js';
import { popCap, popUsed } from '../gameplay/economy.js';
import { LPL } from '../gameplay/players.js';
import { wavesState } from '../gameplay/waves.js';
import { T_, tw } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { BTN, BTNH, CHAT, frame } from './drawing.js';
import { pill } from './minimap.js';

/* ================= GUIDED TUTORIAL (#16) =================
   A short list of steps (five steps) shown at the top of the screen in a solo game, the first time only (or until skipped).
   Each step completes by itself when the game state shows it was done; nothing here touches the simulation. Restart it from the Esc menu. */
const TUTS=[
 ['Select your peasants: click one, or double-click to take them all',()=>sessionState.units.some(u=>u.t===0&&u.type==='peasant'&&u.sel)],
 ['Right-click a tree, a rock or gold: your peasants gather it',()=>sessionState.units.some(u=>u.t===0&&u.type==='peasant'&&(u.job||u.carry))],
 ['Build a house in the Town menu to raise your population limit',()=>sessionState.structs.some(s=>s.t===0&&s.type==='house')],
 ['Train a knight in the Train bar: knights fight the zombies',()=>sessionState.units.some(u=>u.t===0&&u.type==='knight')],
 ['Build walls or a tower in the Defense menu: zombies follow the red lines. Good luck!',()=>false]];

export function tutStart(force){let seen=false;try{seen=localStorage.getItem('dk_tut')==='1'}catch(e){}TUT.on=!!force||(!seen&&!MP.on&&!diagnosticsState.DEVU);TUT.i=0}

function tutEnd(){TUT.on=false;try{localStorage.setItem('dk_tut','1')}catch(e){}}

export function tutBar(UW,y){if(!TUT.on||sessionState.over||MP.on||!sessionState.inGame||!sessionState.started)return 0;
 while(TUT.i<TUTS.length-1&&TUTS[TUT.i][1]())TUT.i++;
 const n=TUT.i+1,last=TUT.i===TUTS.length-1,head='Tutorial '+n+'/'+TUTS.length,txt=TUTS[TUT.i][0],sw=last?64:42,w=Math.min(UW-12,Math.max(tw(txt,.85),tw(head,.75))+sw+26),x=Math.round((UW-w)/2);
 frame(x,y,w,28,CHAT,8);T_(head,x+9,y+4,'#f2d48a',.72);T_(txt,x+9,y+15,'#ffffff',.85);
 pill(x+w-sw-6,y+6,sw,16,last?'Close':'Skip',BTN,BTNH,()=>{tutEnd()},null,.7);return 32}


/* ===== contextual first-game hints: one line under the top bar, never blocking, each shown once ever (dk_hint_<id>).
   They only READ game state and use real time (performance.now), so the simulation is untouched. Off while the guided tutorial runs. ===== */
const HINTS={
 pop:['Population limit reached: build houses in the Town menu',()=>{const p=LPL();return popUsed(p)>=popCap(p)}],
 idle:['Idle peasants? Press [.] to select them, then right-click a resource',()=>idleFor>=20],
 wave:['A wave is about to start: gather your troops near the castle and walls',()=>!wavesState.waveOn&&sessionState.waveT<=20&&sessionState.waveN<=1]};
const hintSeen=id=>{try{return localStorage.getItem('dk_hint_'+id)==='1'}catch(e){return false}};
const hintMark=id=>{try{localStorage.setItem('dk_hint_'+id,'1')}catch(e){}};
let hintCur=null,hintT0=0,idleFor=0,idleAt=0;

export function hintBar(UW,y){if(TUT.on||sessionState.over||MP.on||diagnosticsState.DEVU||!sessionState.inGame||!sessionState.started)return 0;
 const now=performance.now();
 {const st=sessionState.time;if(Math.abs(st-idleAt)>5)idleFor=0;const dt=Math.max(0,Math.min(1,st-idleAt));idleAt=st;
  let idle=false;for(const u of sessionState.units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&!u.shel&&!u.job&&!u.o&&!u.carry&&(u.pl|0)===LPL()){idle=true;break}
  idleFor=idle?idleFor+dt:0}
 if(hintCur&&now-hintT0>9000){hintMark(hintCur);hintCur=null}
 if(!hintCur){for(const id in HINTS)if(!hintSeen(id)&&HINTS[id][1]()){hintCur=id;hintT0=now;break}}
 if(!hintCur)return 0;
 const txt=HINTS[hintCur][0],sw=52,w=Math.min(UW-12,tw(txt,.85)+sw+26),x=Math.round((UW-w)/2);
 frame(x,y,w,20,CHAT,8);T_(txt,x+9,y+6,'#ffffff',.85);
 pill(x+w-sw-6,y+2,sw,16,'Got it',BTN,BTNH,()=>{hintMark(hintCur);hintCur=null},null,.7);return 24}
