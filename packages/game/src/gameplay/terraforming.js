import { SAPL } from '../ai/workplaces.js';
import { snd } from '../audio/sound.js';
import { dist } from '../core/math.js';
import { exposed, reach } from './combat.js';
import { constructionState, tfo } from './construction.js';
import { ungar } from './formations.js';
import { LPL, playersState } from './players.js';
import { TS, TW } from './rules.js';
import { sel } from './selection.js';
import { sessionState } from './session.js';
import { simulationState } from './simulation.js';
import { MP } from '../multiplayer/session.js';
import { puff } from '../rendering/effects.js';
import { markP, markT } from '../world/terrain-invalidation.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { mmTile } from '../world/minimap.js';
import { GF } from '../world/pathfinding.js';
import { D4, gOK } from '../world/routes.js';
import { amt, BED, HT, LAND, occ, pth, ROCKH, stairs, ter, TFL, WLV } from '../world/terrain-state.js';
import { freeTile } from '../world/traversal.js';

export function tfOK(tx,ty,rmp){if(!gOK(tx,ty))return false;const i=ty*TW+tx;if(rmp&&stairs.has(i)&&!occ.has(i))return true;if(ter[i]>1&&ter[i]!==5||occ.has(i)||stairs.has(i))return false;return !D4.some(([dx,dy])=>{const s=stairs.get(i+dy*TW+dx);return s&&!s.blk})}

export function tfOrder(type,tx,ty){const i=ty*TW+tx;if(tfo.has(i)){tfo.delete(i);snd('click');return}
 if(type==='ramp'?!rampOK(tx,ty):!tfOK(tx,ty,true)){hudDisplayState.msgS=type==='ramp'?'No ramp here: free flat ground only':'Cannot reshape this tile';hudDisplayState.msgT=2;snd('err');return}
 if(type==='raise'&&HT[i]>=LAND+14){hudDisplayState.msgS='Too high';hudDisplayState.msgT=2;snd('err');return}
 if(type==='dig'&&ter[i]===1){hudDisplayState.msgS='Already water';hudDisplayState.msgT=2;snd('err');return}
 if(type==='dig'&&HT[i]<=BED){hudDisplayState.msgS='Bedrock: it cannot be dug';hudDisplayState.msgT=2;snd('err');return}
 tfo.set(i,{t:type,w:0,d:constructionState.buildRot&3,pl:playersState.CURPL|0});snd('click');
 sel().filter(u=>u.type==='peasant').forEach(u=>{u.job='t';u.tl=-1;u.o=null;if(simulationState.shelOn)u.nso=1})}

export function rampGroup(i){const st=stairs.get(i);if(!st)return[];const seen=new Set([i]),Q=[i];while(Q.length){const k=Q.pop();for(const[dx,dy]of D4){const n=k+dy*TW+dx,s2=stairs.get(n);if(s2&&s2.ax===st.ax&&!seen.has(n)){seen.add(n);Q.push(n)}}}return[...seen]}

function unRamp(i){const s0=stairs.get(i),G=s0&&s0.blk?[i]:rampGroup(i);if(!G.length)return;for(const ii of G){const st=stairs.get(ii);HT[ii]=st.orig!==undefined?st.orig:st.hi;stairs.delete(ii);const x=ii%TW,y=(ii/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(ii)}
 sessionState.fdDirty=true;GF.clear();sessionState.ver++;const x=i%TW,y=(i/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS);if(!MP.on||playersState.CURPL===LPL()){hudDisplayState.msgS='Ramp removed';hudDisplayState.msgT=2}}

export function doTf(i){const o=tfo.get(i);if(!o)return;tfo.delete(i);const x=i%TW,y=(i/TW)|0;if(o.t==='ramp'){doRamp(x,y,o.d);return}if(o.t==='unramp'){unRamp(i);return}if(stairs.has(i)){unRamp(i);if(o.t==='dig'&&HT[i]<=BED)return}if(o.t==='dig'&&HT[i]<=BED)return;const stn=o.t==='dig'&&HT[i]<=LAND-3;if(o.t==='raise'&&ter[i]===1)HT[i]=LAND;else HT[i]+=o.t==='raise'?1:-1;if(stn){const Rr=playersState.RESP[o.pl|0];if(Rr)Rr.s+=4}if(ter[i]!==1)ter[i]=HT[i]>=ROCKH?5:0;TFL[i]=3;
 for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+dx,y+dy)){markT(x+dx,y+dy);markP(x+dx,y+dy)}mmTile(i);sessionState.fdDirty=true;GF.clear();puff((x+.5)*TS,(y+.5)*TS,stn?'#9a9aa0':'#9d7a50',10,60);snd(stn?'mine':'dirt',(x+.5)*TS,(y+.5)*TS);if(o.t==='dig')flood(i)}

/* water flows into a dry hole that opens next to it: every connected open tile below the water line fills (buildings and resources stay dry) */
function flood(i0){if(ter[i0]!==0||HT[i0]>=WLV||!D4.some(([dx,dy])=>{const x=i0%TW+dx,y=((i0/TW)|0)+dy;return gOK(x,y)&&ter[y*TW+x]===1}))return;
 const seen=new Set([i0]),Q=[i0],F=[];while(Q.length&&F.length<600){const i=Q.shift();F.push(i);const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*TW+nx;if(!gOK(nx,ny)||seen.has(n))continue;seen.add(n);if(ter[n]===0&&HT[n]<WLV&&!occ.has(n)&&!stairs.has(n))Q.push(n)}}
 for(const i of F){ter[i]=1;amt[i]=0;pth[i]=0;SAPL.delete(i);tfo.delete(i);const x=i%TW,y=(i/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(i)}
 const FS=new Set(F);for(const u of sessionState.units){if(u.hp<=0||u.gar)continue;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(!FS.has(ty*TW+tx))continue;const ft=freeTile(tx,ty);if(ft){u.x=(ft[0]+.5)*TS;u.y=(ft[1]+.5)*TS}}
 sessionState.fdDirty=true;GF.clear();sessionState.ver++;const x=i0%TW,y=(i0/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#8fc4e8',14,70,{T:.8,z:.2,vz:1.6,g:6,s:.12});snd('splash',(x+.5)*TS,(y+.5)*TS)}

function tfNear(_tx,_ty){return true}

function rampFree(i){return ter[i]===0&&!occ.has(i)&&!stairs.has(i)&&HT[i]<LAND+14}

export function rampOK(tx,ty){return gOK(tx,ty)&&rampFree(ty*TW+tx)&&tfNear(tx,ty)}

function doRamp(x,y,d){const i=y*TW+x;if(!gOK(x,y)||!rampFree(i)){hudDisplayState.msgS='The ramp could not be built here';hudDisplayState.msgT=2;return}const[dx,dy]=D4[d&3],h=HT[i];
 stairs.set(i,{ax:dx?0:1,sg:(dx+dy)>0?1:-1,lo:h,hi:h+1,nat:1,orig:h,built:1,blk:1});
 for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b))markT(x+a,y+b);mmTile(i);
 sessionState.fdDirty=true;GF.clear();sessionState.ver++;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS)}

export function demolish(s){if(!sessionState.structs.includes(s))return;if(s.garr)s.garr.slice().forEach(ungar);const R=playersState.RESP[s.pl|0];for(const k in(s.cost||{}))R[k]+=s.cost[k];s.hp=-1;s.dem=false;s.noCrumble=true;puff(s.x,s.y,'#c9b899',18,90,{T:.8,z:.4,vz:2,g:5,s:.16});snd('build',s.x,s.y);if(!MP.on||(s.pl|0)===LPL()){hudDisplayState.msgS='Demolished: resources recovered';hudDisplayState.msgT=3}}

export function nearestTf(u){let b=-1,bd=1e9;for(const[i]of tfo){const x=i%TW,y=(i/TW)|0,d=dist(u.x,u.y,(x+.5)*TS,(y+.5)*TS);if(d<bd&&exposed(x,y)&&reach(x,y)){bd=d;b=i}}return b}
