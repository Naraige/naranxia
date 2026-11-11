import { snd } from '../audio/sound.js';
import { diagnosticsState } from '../debug/diagnostics.js';
import { SPK } from '../multiplayer/objectives.js';
import { MP } from '../multiplayer/session.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { playersState } from './players.js';
import { RS, RS2 } from './rules.js';
import { sessionState } from './session.js';
import { wavesState } from './waves.js';

/* ================= QUEST LINE (guide for a first game) =================
   Sixteen quests in six chapters, one active at a time, in the order a first game goes. Each one completes from simulation state
   (structures, units, traps, research, waves, resources gathered) and pays a small reward, so everything here IS simulation:
   the progress is questsState.Q (plain numbers, saved in SAVA as QST), checked once per tick in qTick (called by the update wrapper
   in statistics.js), no random numbers, no clock. Solo only: qTick does nothing while MP.on (equal on both co-op machines) and in
   test mode (F10, like the achievements). The panel and the log are in ui/quest-panel.js and only read this state.
   Q = {v, on, i (quests done = index of the active one), a:[gold, wood, stone gathered since the active quest started], dt (sim time of the last completion)} */
export const questsState = { Q: null };

const cntS=(type)=>{let n=0;for(const s of sessionState.structs)if(s.t===0&&s.type===type&&s.prog>=1&&s.hp>0)n++;return n};
const cntU=(type)=>{let n=0;for(const u of sessionState.units)if(u.t===0&&u.type===type&&u.hp>0)n++;return n};
const wavesDone=()=>Math.max(0,sessionState.waveN-(wavesState.waveOn?1:0));
const anyRes=()=>{if(RS.done)return 1;for(const k in RS2.done)if(RS2.done[k])return 1;return 0};
const kingUsed=()=>{for(const u of sessionState.units)if(u.t===0&&u.type==='king'&&(u.sk_cry||u.sk_charge))return 1;return 0};

export const QCH=['First steps','A village','An army','Defences','Power','The long night'];

/* c chapter, t title, d what to do, n goal, p progress (0..n, from simulation state only), r reward */
export const QUESTS=[
 {c:0,t:'Gather wood',d:'Select your peasants and right-click a tree',n:40,p:()=>questsState.Q.a[1],r:{g:20}},
 {c:0,t:'Stone and gold',d:'Send peasants to a rock and to a gold vein',n:60,p:()=>Math.min(30,questsState.Q.a[2])+Math.min(30,questsState.Q.a[0]),r:{w:20}},
 {c:1,t:'A roof for your people',d:'Build a house: each one raises the population limit',n:1,p:()=>cntS('house'),r:{w:30}},
 {c:1,t:'Fill the granary',d:'Build a farm: a peasant working it makes food',n:1,p:()=>cntS('farm'),r:{f:30}},
 {c:2,t:'Raise a barracks',d:'Build a barracks to train soldiers',n:1,p:()=>cntS('barracks'),r:{g:40}},
 {c:2,t:'First knights',d:'Train 2 knights at the barracks',n:2,p:()=>cntU('knight'),r:{g:40}},
 {c:2,t:'Bows on the wall',d:'Train 2 archers: they can garrison walls and towers',n:2,p:()=>cntU('archer'),r:{w:30}},
 {c:3,t:'Close the road',d:'Build 6 walls and a gate across a red line',n:7,p:()=>Math.min(6,cntS('wall'))+Math.min(1,cntS('gate')),r:{w:40}},
 {c:3,t:'Eyes on the road',d:'Build a tower: archers inside shoot far',n:1,p:()=>cntS('tower'),r:{s:40}},
 {c:3,t:'Sharp welcome',d:'Place 3 spike traps where the zombies walk',n:3,p:()=>SPK.size,r:{g:30}},
 {c:3,t:'The first night',d:'Survive wave 1: keep your castle standing',n:1,p:wavesDone,r:{g:60}},
 {c:4,t:'Knowledge',d:'Build an academy and finish a research',n:2,p:()=>{const r=anyRes();return r?2:Math.min(1,cntS('academy'))},r:{g:60}},
 {c:4,t:'Long live the King',d:'Summon King Naraige at the castle',n:1,p:()=>cntU('king'),r:{f:50}},
 {c:4,t:'Royal might',d:'Use War cry or Royal charge with the King',n:1,p:kingUsed,r:{g:40}},
 {c:5,t:'Hold the line',d:'Survive wave 5',n:5,p:wavesDone,r:{g:100}},
 {c:5,t:'The last bastion',d:'Survive wave 10',n:10,p:wavesDone,r:{g:150}}];

/* the player's choice (Settings, quest log) is the default of the next new game; the running game keeps its own flag in Q.on */
export const questsPref=()=>{try{return localStorage.getItem('dk_quests')!=='0'}catch(e){return true}};

const fresh=on=>({v:1,on:on?1:0,i:0,a:[0,0,0],dt:-1e9});

export function qReset(){questsState.Q=fresh(questsPref())}

/* a save without quests (older build) loads with the quest line off: a kingdom at wave 20 does not cash sixteen rewards at once */
export function qFix(v){if(!v||typeof v!=='object')return fresh(false);const a=Array.isArray(v.a)?v.a:[];
 return {v:1,on:v.on?1:0,i:Math.max(0,Math.min(QUESTS.length,v.i|0)),a:[+a[0]||0,+a[1]||0,+a[2]||0],dt:Number.isFinite(v.dt)?v.dt:-1e9}}

export const qActive=()=>{const Q=questsState.Q;return !!Q&&!!Q.on&&!MP.on&&!diagnosticsState.DEVU};

/* solo player action (Settings or the quest log); also remembered for the next new game */
export function qSetOn(on){try{localStorage.setItem('dk_quests',on?'1':'0')}catch(e){}const Q=questsState.Q;if(Q&&sessionState.inGame&&!MP.on)Q.on=on?1:0}

export const qProg=i=>{const q=QUESTS[i];return q?Math.max(0,Math.min(q.n,Math.floor(q.p()))):0};

let g0=0,w0=0,s0=0;

/* called by the update wrapper just before the simulation step: what the step adds to the stock counts as gathered */
export function qBegin(){const R=playersState.RESP[0];g0=R.g;w0=R.w;s0=R.s}

export function qTick(){const Q=questsState.Q;if(!Q||!Q.on||MP.on||diagnosticsState.DEVU||sessionState.over||!sessionState.inGame||Q.i>=QUESTS.length)return;
 const R=playersState.RESP[0];Q.a[0]+=Math.max(0,R.g-g0);Q.a[1]+=Math.max(0,R.w-w0);Q.a[2]+=Math.max(0,R.s-s0);
 const q=QUESTS[Q.i];if(q.p()<q.n)return;
 const r=q.r;if(r.g)R.g+=r.g;if(r.w)R.w+=r.w;if(r.s)R.s+=r.s;if(r.f)R.f=(R.f||0)+r.f;
 Q.i++;Q.a=[0,0,0];Q.dt=sessionState.time;
 hudDisplayState.msgS='Quest complete: '+q.t;hudDisplayState.msgT=4;snd('coin')}
