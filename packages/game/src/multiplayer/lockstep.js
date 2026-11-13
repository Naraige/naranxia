import { snd } from '../audio/sound.js';
import { backgroundLoopState, bgTick } from '../core/background-loop.js';
import { REALR, rngf } from '../core/random.js';
import { GVER } from '../core/version.js';
import { startGame } from '../gameplay/lifecycle.js';
import { LPL, playersState, setPl } from '../gameplay/players.js';
import { reset } from '../gameplay/reset.js';
import { FAT, PBASE, PRICE } from '../gameplay/economy.js';
import { eventsState } from '../gameplay/events.js';
import { BASES } from '../ai/kingdoms.js';
import { RUINS } from '../world/terrain.js';
import { questsState } from '../gameplay/quests.js';
import { sessionState } from '../gameplay/session.js';
import { update } from '../gameplay/statistics.js';
import { SW, swarmState } from '../gameplay/swarm.js';
import { mpExec } from './commands.js';
import { lobbyNote, lobbyRender, lobbyShow, mpModal, mpWorldSync } from './lobby.js';
import { mpResMsg, mpResync } from './resync.js';
import { MP } from './session.js';
import { home } from '../rendering/camera.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { settingsState } from '../ui/settings.js';
import { openPicker, sitePickerState } from '../ui/site-picker.js';
import { genChunk, genF, NCX, terrainState } from '../world/terrain.js';

/* ================= Co-op: peer to peer lockstep (WebRTC, manual code exchange) ================= */
export const MPD = 6;
const MPSTEP = 1/30;

export function setPause(v){sessionState.paused=v;backgroundLoopState.autoPaused=false;if(MP.on)mpSend({k:'p',v})}

export function mpSend(o){try{if(MP.dc&&MP.dc.readyState==='open')MP.dc.send(JSON.stringify(o))}catch(e){}}

export function mpHash(){let h=(sessionState.units.length*7+sessionState.structs.length*13+sessionState.queue.length*3+playersState.RESP.reduce((a,R,i)=>Math.imul(a,131)+Math.round(R.g)*3+Math.round(R.w)*5+Math.round(R.s)*11+Math.round(R.f||0)*17+i,0))|0;
 for(const u of sessionState.units)h=(Math.imul(h,31)+((u.x*8)|0)+Math.imul((u.y*8)|0,7)+(u.hp|0)+(u.kxp|0)*3+(u.kt|0)*5)|0;h=(Math.imul(h,31)+SW.n)|0;for(let i=0;i<SW.n;i+=17)h=(Math.imul(h,31)+((SW.x[i]*8)|0)+Math.imul((SW.y[i]*8)|0,7))|0;return mpHashX(h)}

/* state of the newer systems (events, market fatigue and prices, renown, ruins, envoy tribute), in a stable order so that a divergence shows at the next check, not at the next payment */
function mpHashX(h){const E=eventsState,m=(a)=>{h=(Math.imul(h,31)+(a|0))|0};
 m(E.q?E.q.length:0);m(E.pay?E.pay.length:0);if(E.cur){m(E.cur.i);m(Math.round((E.cur.exp||0)*8))}
 if(E.pay)for(const p of E.pay){m(p.g);m(Math.round((p.t||0)*8))}
 for(const k in PBASE){m(Math.round((PRICE[k]||0)*1000));m(Math.round((FAT[k]||0)*1000))}
 for(const R of playersState.RESP)m(R.ren);
 let d=0;for(const r of RUINS.values())if(r.done)d++;m(d);
 for(const b of BASES){m(b.envN);m(b.envG);m(b.envF)}
 {const Q=questsState.Q;if(Q){let n=0;for(const k in Q.d)n+=Q.d[k]|0;m(Q.on);m(n);m(Math.round(Q.a[0]));m(Math.round(Q.a[1]));m(Math.round(Q.a[2]));if(Q.e){m(Q.e.tr);m(Q.e.cv)}}}
 return h}

function mpChk(t){if(MP.hs[t]!==undefined&&MP.hr[t]!==undefined){const hl=MP.hl||(MP.hl=[]);hl.push([t,MP.hs[t],MP.hr[t]]);if(hl.length>60)hl.shift();if(MP.hs[t]!==MP.hr[t]){MP.desync=true;MP.dsN=(MP.dsN|0)+1;if(MP.host)mpResync();else{MP.rsAt=performance.now();mpSend({k:'rsq',e:MP.ep})}}delete MP.hs[t];delete MP.hr[t]}}

function mpGen(){let n=0;while(terrainState.GI<terrainState.GORD.length&&n<2){const k=terrainState.GORD[terrainState.GI++];if(!genF[k]){genChunk(k%NCX,(k/NCX)|0);n++}}}

/* a resync that does not finish (a lost message, a failed load) or that the host put off (8 s between two) is started again, so the two
   games never stay apart and the banner never stays on "back in step" for good */
function mpWatch(){const now=performance.now();
 if(MP.host){if(MP.rsy==='sent'&&now-MP.rsLast>60000){MP.rsy=null;MP.rsTxt=null;MP.desync=true}if(MP.desync&&!MP.rsy&&now-MP.rsLast>=8000)mpResync()}
 else if((MP.rsy==='recv'||MP.rsy==='go')&&now-(MP.rsAt||0)>60000){MP.rsy=null;MP.rsBuf=null;MP.rsAt=now;MP.desync=true;mpSend({k:'rsq',e:MP.ep,f:1})}
 else if(MP.desync&&!MP.rsy&&now-(MP.rsAt||0)>10000){MP.rsAt=now;mpSend({k:'rsq',e:MP.ep})}}

export function mpFrame(dt){if(sessionState.over)return;mpWatch();if(MP.rsy)return;MP.acc=Math.min(.3,MP.acc+dt);if(sessionState.paused){MP.acc=0;return}
 let n=0;while(MP.acc>=MPSTEP&&n<8){
  while(MP.sent<MP.tick+MPD){MP.sent++;const c=MP.out;MP.out=[];MP.loc[MP.sent]=c;mpSend({k:'c',t:MP.sent,c,e:MP.ep})}
  const r=MP.rem[MP.tick];if(!r){if(!MP.stall)MP.stallAt=performance.now();MP.stall=true;break}MP.stall=false;
  const L=MP.loc[MP.tick]||[],cm=MP.host?[...L.map(c=>[c,1]),...r.map(c=>[c,0])]:[...r.map(c=>[c,0]),...L.map(c=>[c,1])];
  Math.random=MP.simR;try{mpGen();for(const[c,m]of cm)mpExec(c,m);update(MPSTEP)}finally{Math.random=REALR}
  delete MP.loc[MP.tick];delete MP.rem[MP.tick];MP.tick++;MP.acc-=MPSTEP;n++;
  if(MP.tick%90===0){const h=mpHash();MP.hs[MP.tick]=h;mpSend({k:'h',t:MP.tick,h,e:MP.ep});mpChk(MP.tick)}}
 if(n===8)MP.acc=0}

export function mpBegin(st){hudDisplayState.msgS='Co-op: Alt+click pings the map / Shift: defend / Ctrl: gather / Shift+Ctrl: attack';hudDisplayState.msgT=12;terrainState.SEED=st.seed;terrainState.GPR=st.gpr;terrainState.CX=st.cx;terrainState.CY=st.cy;sessionState.CROT=st.cr&3;sessionState.diffI=0;swarmState.SWF=100;sessionState.SITE2={tx:st.cx2,ty:st.cy2,rot:st.cr2&3};sitePickerState.picking=false;settingsState.setupOpen=false;settingsState.settingsOpen=false;
 MP.on=true;const sd=Math.floor(terrainState.SEED*1e6)+1;Math.random=rngf(sd);try{reset()}finally{Math.random=REALR}
 sessionState.inGame=false;sessionState.camSave=null;startGame();sessionState.spd=1;sessionState.paused=false;sessionState.over=false;setPl(LPL());home();
 MP.simR=rngf(sd+977);MP.tick=0;MP.sent=MPD-1;MP.acc=0;MP.out=[];MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;MP.ep=0;MP.rsy=null;MP.rsLast=-1e9;MP.hl=[];MP.dsN=0;MP.stallAt=0;MP.rxAt=performance.now();MP.rsAt=0;
 for(let i=0;i<MPD;i++){MP.loc[i]=[];MP.rem[i]=[]}
 MP.mine=null;MP.theirs=null;mpModal(false)}

export let mpMsg = function mpMsg(m){MP.rxAt=performance.now();if(m.k==='pg'){mpSend({k:'pr',t:m.t});return}if(m.k==='pr'){MP.rtt=Math.round(performance.now()-m.t);return}
 if(m.k==='c'){if((m.e|0)!==MP.ep)return;MP.rem[m.t]=m.c;if(document.hidden)bgTick()}else if(m.k==='h'){if((m.e|0)!==MP.ep)return;MP.hr[m.t]=m.h;mpChk(m.t)}else if(m.k&&m.k.startsWith('rs')){mpResMsg(m);return}else if(m.k==='p')sessionState.paused=m.v;
 else if(m.k==='hello'){MP.pname=String(m.n||'Player').slice(0,24);MP.pver=String(m.v||'?');snd('spawn');lobbyNote(m.v===GVER?(MP.pname)+' joined the lobby!':'Version mismatch: you run '+GVER+', '+MP.pname+' runs '+(m.v||'an older version')+'. Use the same version or the game will desync.');if(MP.host)mpWorldSync();if(!sitePickerState.picking&&!MP.on)lobbyShow();else lobbyRender()}
 else if(m.k==='w'&&!MP.host){terrainState.SEED=m.seed;terrainState.GPR=m.gpr;sessionState.diffI=m.d;MP.mine=null;MP.theirs=null;if(sitePickerState.picking){openPicker();sitePickerState.pickMsg='The host chose a new map'}lobbyNote('The host chose a map');lobbyRender()}
 else if(m.k==='ready'){const again=!!MP.theirs;MP.theirs={tx:m.cx,ty:m.cy,rot:m.r&3};snd('click');lobbyNote(MP.pname+(again?' moved their castle':' placed their castle'));lobbyRender()}
 else if(m.k==='s'&&!MP.host)mpBegin(m)};

export function mpLost(){if(!MP.conn&&!MP.on)return;const was=MP.on;MP.conn=false;MP.on=false;MP.mine=null;MP.theirs=null;if(was){hudDisplayState.msgS='Partner disconnected - continuing solo';hudDisplayState.msgT=6}lobbyNote('Your partner left the lobby.');lobbyRender()}

export function setMpMsgHandler(handler) {
  mpMsg = handler;
}

export function initializeLockstep() {
  Object.assign(MP,{pc:null,dc:null,tick:0,loc:{},rem:{},out:[],sent:0,acc:0,stall:false,hs:{},hr:{},desync:false,simR:null,lostAt:0});
}

export function initializeMultiplayerFrame() {
  MP.phase='';
  MP.mine=null;
  MP.theirs=null;
  MP.pname='';
  MP.code='';
}
