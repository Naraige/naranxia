import { THEME } from '../ui/kingdom-theme.js';
import { rngf } from '../core/random.js';
import { diagnosticsState } from '../debug/diagnostics.js';
import { kingTick } from './king-skills.js';
import { playersState } from './players.js';
import { LH, rulesState } from './rules.js';
import { sessionState } from './session.js';
import { update0 } from './simulation.js';
import { eraTick, trapTick } from './traps.js';
import { objTick } from '../multiplayer/objectives.js';
import { qBegin, qTick } from './quests.js';
import { terrainState } from '../world/terrain.js';

export const statisticsState = {
  OBJ: {w:1,k:1},
  SBR: null,
};

export function saveBest(){if(diagnosticsState.DEVU)return;sbRec();try{localStorage.setItem('dk_last',JSON.stringify({w:sessionState.waveN,k:sessionState.kills}))}catch(e){}try{if(sessionState.waveN>sessionState.best.w||(sessionState.waveN===sessionState.best.w&&sessionState.kills>sessionState.best.k)){sessionState.best={w:sessionState.waveN,k:sessionState.kills};localStorage.setItem('dk_best',JSON.stringify(sessionState.best))}}catch(e){}}
/* ================= END-OF-GAME STATS (#18) =================
   Counted for the local player only and never read by the simulation: the update wrapper measures what the sim added to the
   resources, hit() records who hit last (LH) so a kill is credited to a unit type, everything else is "Towers and cannons". */
export function gstReset(){rulesState.GST={k:{},g:0,w:0,s:0,f:0,lost:0}}

export function gstKill(z){const t=LH.get(z)||'other';rulesState.GST.k[t]=(rulesState.GST.k[t]|0)+1}

export let update = function update(dt){const R=playersState.RESP[playersState.CURPL|0],g=R.g,w=R.w,s=R.s,f=R.f||0;qBegin();update0(dt);objTick();qTick();kingTick(dt);trapTick(dt);eraTick(dt);
 const G=rulesState.GST;G.g+=Math.max(0,R.g-g);G.w+=Math.max(0,R.w-w);G.s+=Math.max(0,R.s-s);G.f+=Math.max(0,(R.f||0)-f)};

export function gstBest(){let b=null,n=0;for(const k in rulesState.GST.k)if(rulesState.GST.k[k]>n){n=rulesState.GST.k[k];b=k}return b?[b,n]:null}
/* ---- records by map (#13): the three best runs of this seed (waves x100 + kills) kept in this browser; today's daily map is flagged ---- */

const sbKey=()=>(+terrainState.SEED).toFixed(4);

const sbLoad=()=>{try{return JSON.parse(localStorage.getItem('dk_sb')||'{}')}catch(e){return{}}};

function sbDaily(){try{const d=Math.floor(Date.now()/864e5);return Math.abs(rngf(d*2654435761%4294967296)()*500-terrainState.SEED)<1e-6}catch(e){return false}}

export function sbRec(){statisticsState.SBR=null;try{const all=sbLoad(),k=sbKey(),a=all[k]||[],sc=sessionState.waveN*100+sessionState.kills,r={w:sessionState.waveN,k:sessionState.kills,s:sc,d:Date.now(),n:String(THEME&&THEME.n||'').slice(0,24)};a.push(r);a.sort((x,y)=>y.s-x.s||x.d-y.d);const top=a.slice(0,3);all[k]=top;
  const ks=Object.keys(all);if(ks.length>60){ks.sort((x,y)=>all[y][0].d-all[x][0].d);for(const q of ks.slice(60))delete all[q]}
  localStorage.setItem('dk_sb',JSON.stringify(all));statisticsState.SBR={top,rank:top.indexOf(r),daily:sbDaily()}}catch(e){}}

export function setUpdateHandler(handler) {
  update = handler;
}
