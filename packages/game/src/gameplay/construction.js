import { FOR_R } from '../ai/workplaces.js';
import { snd } from '../audio/sound.js';
import { dist, hyp } from '../core/math.js';
import { ach } from './achievements.js';
import { doUpgrade, ok, pay } from './economy.js';
import { mk } from './entities.js';
import { ungar } from './formations.js';
import { HOMEC, LPL, playersState, stoneOn } from './players.js';
import { C, DIR4, GCAP, GTOP, ROTT, RS, SH, TS, TW } from './rules.js';
import { selectionState } from './selection.js';
import { sessionState } from './session.js';
import { demolish, rampGroup, tfOrder } from './terraforming.js';
import { placeSpike } from './traps.js';
import { MP } from '../multiplayer/session.js';
import { puff } from '../rendering/effects.js';
import { CONNT } from '../rendering/models/structures.js';
import { snapM } from '../rendering/render-settings.js';
import { addStruct, buildStructMesh, refreshNear, rmStruct } from '../rendering/structures.js';
import { markT } from '../world/terrain-invalidation.js';
import { NAMES } from '../ui/build-catalog.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { mmTile } from '../world/minimap.js';
import { gOK } from '../world/routes.js';
import { HT, occ, pth, stairs, ter, terrainState } from '../world/terrain-state.js';
import { levelGround, solid } from '../world/traversal.js';

export const constructionState = {
  gateLen: 3,
  buildRot: 0,
  formType: 0,
  lastFm: 0,
  mergeT: 0,
};

export let HEAL_R;
export const HEAL_RATE = 5;



export const FORMS=['None','Line','Block','Wedge','Ring'];

export const tfo=new Map();


export function gateAxAt(_tx,_ty){return constructionState.buildRot&1}

export function tilesFor(type,tx,ty,sz,ax,gl){if(type==='gate'){gl=gl||constructionState.gateLen;const t=[];for(let k=0;k<gl;k++)t.push(ax?[tx,ty+k]:[tx+k,ty]);return t}const t=[];for(let j=0;j<sz;j++)for(let i=0;i<sz;i++)t.push([tx+i,ty+j]);return t}

export function gateOK(tx,ty,ax,gl){const t=tilesFor('gate',tx,ty,1,ax,gl),hs=t.map(([x,y])=>HT[y*TW+x]);return t.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs)-Math.min(...hs)<=2}

/* the rotation chosen when placing a castle, or the next one (clockwise) whose door opens on free ground */
export function castleRotAt(c,want){for(let k=0;k<4;k++){const r=(want+k)&3;if(doorTiles({tx:c.tx,ty:c.ty,sz:5,rot:r},1).every(([x,y])=>gOK(x,y)&&!solid(x,y)&&!stairs.has(y*TW+x)))return r}return want&3}

export function doorTiles(c,depth){const[dx,dy]=DIR4[(c.rot|0)&3],t=[],z=c.sz||3,a0=(z-3)>>1;for(let a=a0;a<a0+3;a++)for(let d=0;d<depth;d++){if(dy)t.push([c.tx+a,dy>0?c.ty+z+d:c.ty-1-d]);else t.push([dx>0?c.tx+z+d:c.tx-1-d,c.ty+a])}return t}

export const inDoor=(tx,ty)=>{for(const c of[sessionState.CS,sessionState.CS2])if(c&&c.type==='castle'&&doorTiles(c,1).some(([x,y])=>x===tx&&y===ty))return true;return false};

export function pathOK(tx,ty){const i=ty*TW+tx;return gOK(tx,ty)&&ter[i]===0}

const UNIQB={guild:'Guild',academy:'Academy'};

export function placeErr(type,tx,ty){if(UNIQB[type]){for(const s of sessionState.structs)if(s.t===0&&s.type===type&&s.hp>0&&(s.pl|0)===(playersState.CURPL|0))return 'Only one '+UNIQB[type]+' per kingdom'}
 if(type==='forester'){const cx=tx+1,cy=ty+1;for(const s of sessionState.structs)if(s.t===0&&s.type==='forester'&&s.hp>0&&Math.hypot(s.tx+1-cx,s.ty+1-cy)<2*FOR_R+1)return 'Too close to another forester: their planting areas would touch'}return ''}

export function valid(tx,ty){return !solid(tx,ty)&&!inDoor(tx,ty)&&!stairs.has(ty*TW+tx)}

export let build = function build(type,tx,ty){if(type==='spike'){placeSpike(tx,ty);return}if(type==='upgrade'){if(!sessionState.over)doUpgrade(tx,ty);return}if(sessionState.over||!ok(C[type]))return;
 if(type==='tower'){const t=tilesFor('tower',tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y))))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;
  let rep=0;for(const[x,y]of t){const w=wallAt(x,y);if(!w)continue;rep++;if(w.garr)w.garr.slice().forEach(ungar);const Rr=playersState.RESP[w.pl|0];for(const k in(w.cost||{}))Rr[k]+=w.cost[k];w.hp=-1;w.noCrumble=true;rmStruct(w);for(const[a,b]of w.tiles)if(occ.get(b*TW+a)===w)occ.delete(b*TW+a);sessionState.structs.splice(sessionState.structs.indexOf(w),1);refreshNear(w)}
  if(rep){sessionState.fdDirty=true;if(!MP.on||playersState.CURPL===LPL()){hudDisplayState.msgS='Walls replaced by the tower (refunded)';hudDisplayState.msgT=3}}
  pay(C.tower);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,'tower',tx,ty,2,false);if(rep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}if((type==='ballista'||type==='trebuchet')&&!RS.done){hudDisplayState.msgS='Siege weapons need Masonry';hudDisplayState.msgT=3;snd('err');return}if(type==='upgrade'){doUpgrade(tx,ty);return}const i=ty*TW+tx;const wRep=type==='tower'?wallAt(tx,ty):null;if(type==='ballista'||type==='trebuchet'||type==='raise'||type==='dig'||type==='ramp'||type==='demolish'||type==='rallyc'||type==='rotate'||type==='movec'||wRep){/* These tools and wall replacement apply their own placement checks below. */}else if(type==='path'){if(!pathOK(tx,ty))return}else if(!valid(tx,ty))return;
 if(type==='rotate'){rotateB(occ.get(i));return}
 if(type==='movec'){moveCastle(tx,ty);return}
 if(type==='ballista'||type==='trebuchet'){const o=occ.get(i);if(!o||o.type!=='tower'||o.t!==0||o.prog<1){hudDisplayState.msgS='Mount it on a finished tower';hudDisplayState.msgT=3;snd('err');return}if(o.weapon){hudDisplayState.msgS='This tower already has a siege weapon';hudDisplayState.msgT=3;snd('err');return}pay(C[type]);o.weapon=type;o.aim=constructionState.buildRot*Math.PI/2;o.wcd=2;buildStructMesh(o);puff(o.x,o.y,'#c9c9c9',10,70);snd('build',o.x,o.y);return}
 if(type==='raise'||type==='dig'||type==='ramp'){tfOrder(type,tx,ty);return}
 if(type==='demolish'&&!occ.get(i)&&pth[i]){pth[i]=0;const Rr=playersState.RESP[playersState.CURPL|0];for(const k in C.path)Rr[k]+=C.path[k];mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#b9a68a',3,30);snd('click');if(playersState.CURPL===LPL()){hudDisplayState.msgS='Path removed';hudDisplayState.msgT=2}return}
 if(type==='demolish'&&!occ.get(i)&&stairs.has(i)){const G=rampGroup(i);const q=G.find(k=>tfo.has(k));if(q!==undefined){tfo.delete(q);snd('click');return}tfo.set(i,{t:'unramp',w:0});snd('click');hudDisplayState.msgS='Peasants will remove this ramp';hudDisplayState.msgT=3;return}
 if(type==='demolish'){const o=occ.get(i);if(!o||o.t!==0||o===sessionState.CS||o===sessionState.CS2||o.type==='castle'||(MP.on&&(o.pl|0)!==playersState.CURPL)){hudDisplayState.msgS='Click one of your buildings (not the castle)';hudDisplayState.msgT=2;snd('err');return}if(o.prog<1){demolish(o);if(playersState.CURPL===LPL()){hudDisplayState.msgS='Construction cancelled: resources refunded';hudDisplayState.msgT=3}return}o.dem=!o.dem;o.dp=0;snd('click');if(o.dem){hudDisplayState.msgS='Peasants will tear it down and recover 100% of the cost';hudDisplayState.msgT=3}return}

 if(type==='rally'||type==='rallyc'){const w={x:(tx+.5)*TS,y:(ty+.5)*TS};const rs=type==='rallyc'&&({2:1,3:1,4:1})[ter[ty*TW+tx]];if(!gOK(tx,ty)||(solid(tx,ty)&&!rs))return;
  let rb;if(type==='rallyc')rb=selectionState.selB&&selectionState.selB.type==='castle'&&sessionState.structs.includes(selectionState.selB)?selectionState.selB:HOMEC();
  else{rb=selectionState.selB&&selectionState.selB.type==='barracks'&&sessionState.structs.includes(selectionState.selB)&&(selectionState.selB.pl|0)===(playersState.CURPL|0)?selectionState.selB:null;if(!rb){let bd=1e12;for(const s of sessionState.structs)if(s.t===0&&s.type==='barracks'&&s.prog>=1&&(s.pl|0)===(playersState.CURPL|0)){const d=dist(s.x,s.y,w.x,w.y);if(d<bd){bd=d;rb=s}}}}
  if(!rb){if(playersState.CURPL===LPL()){hudDisplayState.msgS='Build a barracks first';hudDisplayState.msgT=3;snd('err')}return}rb.rally=w;
  if(playersState.CURPL===LPL()){hudDisplayState.msgS=type==='rally'?'Rally point set for this barracks':rs?'Castle rally: new peasants gather this resource':'Castle rally point set';hudDisplayState.msgT=3;sessionState.mode=null}snd('order');puff(w.x,w.y,'#7dffa0',10,50);return}
 if(type==='house'||type==='farm'||CONNT.has(type)){const sp=snapM(type,tx,ty);tx=sp[0];ty=sp[1]}
 if(type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'||type==='observatory'||type==='granary'||type==='bell'||type==='sanctuary'||type==='beacon'||type==='orchard'||type==='forge'||type==='embassy'||type==='warroom'||type==='sappers'){{const pe=placeErr(type,tx,ty);if(pe){if(!MP.on||playersState.CURPL===LPL()){hudDisplayState.msgS=pe;hudDisplayState.msgT=3;snd('err')}return}}const t=tilesFor(type,tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&valid(x,y)))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;pay(C[type]);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,type,tx,ty,2,false);addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='gate'){const ax=gateAxAt(tx,ty),gl=constructionState.gateLen;if(!gateOK(tx,ty,ax,gl))return;pay(C.gate);const t=tilesFor('gate',tx,ty,1,ax,gl),h0=Math.max(...t.map(([x,y])=>HT[y*TW+x]));t.forEach(([x,y])=>levelGround(x,y,1,h0));const s=mk(0,'gate',tx,ty,1,false,ax,gl);s.gate=true;addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',8,60,{soft:1,T:1,s:.38,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='path'){const want=stoneOn()?2:1;if(pth[i]===want)return;pay(C.path);pth[i]=want;mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#d9c9a0',3,30);snd('path',(tx+.5)*TS,(ty+.5)*TS);return}

 if(wRep){if(wRep.garr)wRep.garr.slice().forEach(ungar);const Rr=playersState.RESP[wRep.pl|0];for(const k in(wRep.cost||{}))Rr[k]+=wRep.cost[k];wRep.hp=-1;wRep.noCrumble=true;rmStruct(wRep);for(const[x,y]of wRep.tiles)if(occ.get(y*TW+x)===wRep)occ.delete(y*TW+x);sessionState.structs.splice(sessionState.structs.indexOf(wRep),1);refreshNear(wRep);sessionState.fdDirty=true;if(!MP.on||playersState.CURPL===LPL()){hudDisplayState.msgS='Wall replaced by a tower (wall refunded)';hudDisplayState.msgT=3}}
 pay(C[type]);levelGround(tx,ty,1,HT[i]);const s=mk(0,type,tx,ty,1,false);if(type==='gate')s.gate=true;if(wRep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c9c9',6,50);snd('build',s.x,s.y)};

export function wallAt(tx,ty){const o=occ.get(ty*TW+tx);return o&&o.t===0&&o.type==='wall'&&o.prog>=1&&o.hp>0&&(!MP.on||(o.pl|0)===playersState.CURPL)?o:null}

export function mergeTowers(){const T0=[];for(const s of sessionState.structs)if(s.t===0&&s.type==='tower'&&s.prog>=1&&s.hp>0&&!s.merged)T0.push(s);if(T0.length<4)return;const at=new Map();for(const s of T0)at.set(s.ty*TW+s.tx,s);
 for(const s of T0){if(s.merged)continue;const g=[s,at.get(s.ty*TW+s.tx+1),at.get((s.ty+1)*TW+s.tx),at.get((s.ty+1)*TW+s.tx+1)];if(g.some(q=>!q||q.merged||(q.pl|0)!==(s.pl|0)))continue;
  const garr=[];let tier=1;for(const q of g){if(q.garr){garr.push(...q.garr);q.garr=[]}if(q.weapon){const R=playersState.RESP[q.pl|0],c=C[q.weapon]||{};for(const k in c)R[k]+=c[k];q.weapon=null}if(q.tier===0)tier=0;q.merged=true;q.hp=-1;q.noCrumble=true}
  const prev=playersState.CURPL;playersState.CURPL=s.pl|0;let k;try{k=mk(0,'keep',s.tx,s.ty,2,true)}finally{playersState.CURPL=prev}
  k.tier=tier;k.max=tier?SH.keep:Math.round(SH.keep*.5);k.hp=k.max;k.cost={w:200,s:tier?300:0};
  addStruct(k);refreshNear(k);k.garr=[];for(const u of garr.slice(0,GCAP.keep)){u.gar=k;k.garr.push(u);u.gz=(k.bh||0)+GTOP.keep}for(const u of garr.slice(GCAP.keep)){u.gar=null}
  puff(k.x,k.y,'#d9d9d9',20,100);snd('build',k.x,k.y);if((k.pl|0)===LPL())ach('keep');if(!MP.on||(k.pl|0)===LPL()){hudDisplayState.msgS='Four towers merged into a keep';hudDisplayState.msgT=4}}}

function rotateB(s){if(!s||s.t!==0||!sessionState.structs.includes(s)||!ROTT.has(s.type)||(MP.on&&(s.pl|0)!==playersState.CURPL))return;
 if(s.type==='tower'&&s.weapon){hudDisplayState.msgS='A tower with a siege weapon cannot turn';hudDisplayState.msgT=3;snd('err');return}
 const old=s.rot|0;s.rot=(old+1)&3;
 if(s.type==='castle'){const bad=doorTiles(s,1).some(([x,y])=>!gOK(x,y)||solid(x,y)||stairs.has(y*TW+x));if(bad){s.rot=old;hudDisplayState.msgS='The castle door needs the 3 tiles in front of it free';hudDisplayState.msgT=3;snd('err');return}sessionState.fdDirty=true}
 buildStructMesh(s);snd('click');hudDisplayState.msgS=NAMES[s.type]+' rotated';hudDisplayState.msgT=1.5}

export function moveOK(tx,ty){const c=HOMEC();if(!c||c.hp<=0||!sessionState.structs.includes(c))return false;const x0=tx-2,y0=ty-2,nt=tilesFor('castle',x0,y0,5),own=new Set(c.tiles.map(([x,y])=>y*TW+x));
 if(hyp(x0-c.tx,y0-c.ty)>40)return false;const ty0=c.type;c.type='castle_';let r;try{r=nt.every(([x,y])=>gOK(x,y)&&(own.has(y*TW+x)||valid(x,y)));
  if(r){const hs=nt.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)r=false}
  if(r){const f={tx:x0,ty:y0,rot:c.rot|0};r=doorTiles(f,1).every(([x,y])=>gOK(x,y)&&(own.has(y*TW+x)||(!solid(x,y)&&!stairs.has(y*TW+x))))}}finally{c.type=ty0}return r}

function moveCastle(tx,ty){const c=HOMEC();if(!c||!moveOK(tx,ty)){hudDisplayState.msgS='Cannot move the castle there (5x5 free, within 40 tiles, flat ground)';hudDisplayState.msgT=3;snd('err');return}
 pay(C.movec);
 const x0=tx-2,y0=ty-2,nt=tilesFor('castle',x0,y0,5),ox=c.x,oy=c.y;for(const[x,y]of c.tiles)if(occ.get(y*TW+x)===c)occ.delete(y*TW+x);
 levelGround(x0,y0,5,Math.max(...nt.map(([x,y])=>HT[y*TW+x])));c.tx=x0;c.ty=y0;c.tiles=nt;c.x=(x0+2.5)*TS;c.y=(y0+2.5)*TS;for(const[x,y]of nt)occ.set(y*TW+x,c);
 if(c===sessionState.CS){terrainState.CX=x0+2;terrainState.CY=y0+2}buildStructMesh(c);refreshNear(c);sessionState.fdDirty=true;sessionState.ver++;sessionState.mode=null;puff(ox,oy,'#c9b899',22,110);puff(c.x,c.y,'#d9d9d9',22,110);snd('build',c.x,c.y);
 if(!MP.on||(c.pl|0)===LPL()){ach('move');hudDisplayState.msgS='Castle moved';hudDisplayState.msgT=3}}

export function setBuildHandler(handler) {
  build = handler;
}

export function initializeConstruction() {
  HEAL_R = 7*TS;
}
