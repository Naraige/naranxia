import { dist } from '../core/math.js';
import { inDoor, tfo } from '../gameplay/construction.js';
import { moveTo, stepF } from '../gameplay/movement.js';
import { aliveC, BAD, playersState } from '../gameplay/players.js';
import { FARMT, FARMY, RS2, TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { leaveSquad } from '../gameplay/squads.js';
import { puff } from '../rendering/effects.js';
import { markP } from '../rendering/terrain.js';
import { ringOf, sameComp } from '../world/connectivity.js';
import { mmTile } from '../world/minimap.js';
import { gField } from '../world/pathfinding.js';
import { D4, gOK } from '../world/routes.js';
import { amt, occ, pth, stairs, ter } from '../world/terrain.js';
import { solid } from '../world/traversal.js';

export const workplacesState = {
  saplT: 0,
};

/* workplaces: a farm (and a forester's hut) is worked by one peasant. Idle peasants take a free one first;
   right-clicking it with a peasant assigns him. While farming, the peasant walks the furrows inside the field. */
export const WKT = new Set(['farm','forester']);
let FSPOT;

const wkJob=s=>s.type==='farm'?'f':'p';

export function wkOf(s){const w=s.wk;return w&&w.hp>0&&w.wk===s&&w.job===wkJob(s)?w:null}

export function wkFree(u){let b=null,bd=(70*TS)**2;const ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS);
 for(const s of sessionState.structs){if(s.t!==0||!WKT.has(s.type)||s.prog<1||s.hp<=0||(s.pl|0)!==(u.pl|0)||wkOf(s))continue;const d=(s.x-u.x)**2+(s.y-u.y)**2;if(d>=bd)continue;
  let ok=false;for(const[x,y]of ringOf(s))if(sameComp(ux,uy,x,y)){ok=true;break}if(ok){bd=d;b=s}}return b}

export function wkSet(u,s){if(u.onF)farmOff(u);u.role=null;u.job=wkJob(s);u.wk=s;s.wk=u;u.tl=-1;u.o=null;u.rb=null;u.rk=0;u.work=0;u.fs=(u.uid|0)&3;u.pt=-1;leaveSquad(u)}

function farmSpot(s,k){const p=FSPOT[k&3],th=(s.hm?0:(s.rot|0))*Math.PI/2,c=Math.cos(th),n=Math.sin(th),ox=p[0]-1,oz=p[1]-1;return{x:s.x+(ox*c+oz*n)*TS,y:s.y+(-ox*n+oz*c)*TS,f:p[2]+th}}

export const wkLive=u=>{const s=u.wk;return !!s&&s.hp>0&&s.prog>=1&&sessionState.structs.includes(s)};

/* leaving the field: step out onto the nearest free tile around it */
export function farmOff(u){u.onF=0;const s=u.wk;if(!s||!sessionState.structs.includes(s)||s.hp<=0)return;let b=null,bd=1e18;for(const[x,y]of ringOf(s)){const px=(x+.5)*TS,py=(y+.5)*TS,d=(px-u.x)**2+(py-u.y)**2;if(d<bd){bd=d;b=[px,py]}}if(b){u.x=b[0];u.y=b[1]}}

export function farmer(u,dt){const s=u.wk;if(!wkLive(u)){u.job=null;u.wk=null;return}
 const o=wkOf(s);if(o&&o!==u){u.job=null;u.wk=null;return}s.wk=u;
 if(!u.onF){if(u.x>(s.tx-.7)*TS&&u.x<(s.tx+s.sz+.7)*TS&&u.y>(s.ty-.7)*TS&&u.y<(s.ty+s.sz+.7)*TS){u.onF=1;u.work=0}
  else{u.work=0;stepF(u,gField('s'+s.ty*TW+s.tx,s.tx,s.ty,s.sz),s.x,s.y,dt);return}}
 u.gz=(s.bh||0)+.1;const p=farmSpot(s,u.fs|0);
 if(dist(u.x,u.y,p.x,p.y)>3){moveTo(u,p.x,p.y,dt*.55);u.work=0}else{u.work+=dt;u.face=p.f;if(u.work>3.4){u.work=0;u.fs=((u.fs|0)+1)&3}}
 s.fw=(s.fw||0)+dt;if(s.fw>=FARMT){s.fw-=FARMT;playersState.RESP[u.pl|0].f+=FARMY*(RS2.done.harvest?1.5:1);puff(s.x,s.y,'#f2d060',5,36,{T:.8,z:.4,vz:1.6,g:-.6,s:.07})}}

/* saplings: tile -> {t: planted at, s: hut}. Every 4th tile of a sparse pattern, never beside a building, a road, a ramp
   or near a castle, so forests stay walkable; a sapling becomes a tree (3 wood harvests) after GROWT seconds */
export const SAPL = new Map();
export const PRES = new Map();
export const GROWT = 75;
export const FOR_R = 7;
const FOR_MAX = 10;

function plantOK(i){const x=i%TW,y=(i/TW)|0;if(x<2||y<2||x>=TW-2||y>=TH-2||!gOK(x,y)||ter[i]!==0||SAPL.has(i)||inDoor(x,y))return false;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=i+dy*TW+dx;if(occ.has(j)||stairs.has(j)||pth[j]||tfo.has(j))return false}
 /* natural-looking woods: never side by side, one diagonal neighbour at most, a few trees around, and every free tile beside stays open on two sides */
 const tr=j=>ter[j]===2||SAPL.has(j)||pLive(j);for(const[dx,dy]of D4)if(tr(i+dy*TW+dx))return false;
 let nd=0;for(const dx of[-1,1])for(const dy of[-1,1])if(tr(i+dy*TW+dx))nd++;if(nd>1)return false;
 let nt=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if((dx||dy)&&tr(i+dy*TW+dx))nt++;if(nt>4)return false;
 for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*TW+nx;if(solid(nx,ny))continue;let op=0;for(const[ax,ay]of D4){const m=n+ay*TW+ax;if(m!==i&&!solid(nx+ax,ny+ay)&&!SAPL.has(m)&&!pLive(m))op++}if(op<2)return false}
 for(const c of aliveC())if(Math.abs(x-c.tx-1)<=4&&Math.abs(y-c.ty-1)<=4)return false;return true}

const pLive=j=>{const r=PRES.get(j);return !!r&&r.hp>0&&r.pt===j};

function plantPick(u,s){const cx=s.tx+1,cy=s.ty+1,ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS),C=[];
 for(let dy=-FOR_R;dy<=FOR_R;dy++)for(let dx=-FOR_R;dx<=FOR_R;dx++){const r2=dx*dx+dy*dy;if(r2<5||r2>FOR_R*FOR_R+2)continue;const i=(cy+dy)*TW+cx+dx;
  const rv=PRES.get(i);if(rv&&rv!==u&&rv.hp>0&&rv.pt===i)continue;if(BAD.get(i)>sessionState.time)continue;if(plantOK(i))C.push(i)}
 /* a random spot among the free ones, the first he can walk to */
 for(let n=C.length;n>0;n--){const k=Math.floor(Math.random()*n),i=C[k];C[k]=C[n-1];const x=i%TW,y=(i/TW)|0;if(D4.some(([ax,ay])=>!solid(x+ax,y+ay)&&sameComp(ux,uy,x+ax,y+ay)))return i}
 return -1}

export function relPt(u){if(u.pt>=0&&PRES.get(u.pt)===u)PRES.delete(u.pt);u.pt=-1}

function forHome(u,s,dt){u.work=0;if(dist(u.x,u.y,s.x,s.y)>TS*2.2)stepF(u,gField('s'+s.ty*TW+s.tx,s.tx,s.ty,s.sz),s.x,s.y,dt)}

export function forester(u,dt){const s=u.wk;if(!wkLive(u)){relPt(u);u.job=null;u.wk=null;return}
 const o=wkOf(s);if(o&&o!==u){relPt(u);u.job=null;u.wk=null;return}s.wk=u;
 if(u.pt>=0&&(PRES.get(u.pt)!==u||!plantOK(u.pt)))relPt(u);
 if(!(u.pt>=0)){u.pt=-1;u.pwT=(u.pwT||0)-dt;if(u.pwT>0){forHome(u,s,dt);return}
  let n=0;for(const v of SAPL.values())if(v.s===s.sid)n++;
  if(n>=FOR_MAX){u.pwT=4;forHome(u,s,dt);return}
  u.pt=plantPick(u,s);if(u.pt<0){u.pwT=5;forHome(u,s,dt);return}PRES.set(u.pt,u)}
 const x=u.pt%TW,y=(u.pt/TW)|0,px=(x+.5)*TS,py=(y+.5)*TS;
 if(dist(u.x,u.y,px,py)<36){u.work+=dt;u.face=Math.atan2(px-u.x,py-u.y);if(u.work>3){u.work=0;SAPL.set(u.pt,{t:sessionState.time,s:s.sid});PRES.delete(u.pt);u.pt=-1;u.pwT=1;puff(px,py,'#6fbe52',5,26)}}
 else{u.work=0;stepF(u,gField('p'+u.pt,x,y,1),px,py,dt)}}

/* saplings grow once a second; a sapling whose tile was taken dies, one that is stood on waits */
export function saplTick(dt){workplacesState.saplT+=dt;if(workplacesState.saplT<1)return;workplacesState.saplT=0;if(!SAPL.size)return;
 for(const[i,v]of SAPL){const x=i%TW,y=(i/TW)|0;if(ter[i]!==0||occ.has(i)||pth[i]||stairs.has(i)){SAPL.delete(i);continue}if(sessionState.time-v.t<GROWT)continue;
  let busy=false;for(const u of sessionState.units)if(u.hp>0&&!u.gar&&Math.floor(u.x/TS)===x&&Math.floor(u.y/TS)===y){busy=true;break}if(busy)continue;
  SAPL.delete(i);ter[i]=2;amt[i]=3;mmTile(i);markP(x,y);sessionState.fdDirty=true}}

export function initializeWorkplaces() {
  FSPOT = [[1.35,.42,0],[1.6,1.2,Math.PI],[.9,1.58,Math.PI],[.4,1.2,0]];
}
