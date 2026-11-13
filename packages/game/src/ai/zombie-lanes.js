import { dist } from '../core/math.js';
import { moveTo, stepF } from '../gameplay/movement.js';
import { nearC } from '../gameplay/players.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW } from '../gameplay/swarm.js';
import { longField } from '../world/connectivity.js';
import { FD, gOK } from '../world/routes.js';
import { ensureAround, terrainState } from '../world/terrain.js';
import { bfsW, fv, solid } from '../world/traversal.js';

export const zombieLanesState = {
  lfBud: 3,
};

/* path field of the zombies toward an AI kingdom, shared by the whole horde and refreshed every 30 s */
export function baseZF(b){if(b.zf!==undefined&&sessionState.time-b.zft<30)return b.zf;const s=[];for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const x=b.tx+i,y=b.ty+j;if(gOK(x,y)&&!solid(x,y))s.push([x,y])}b.zf=s.length?bfsW(s,false,b.tx-56,b.ty-56,113,113):null;b.zft=sessionState.time;return b.zf}

export const zcount=()=>{let n=0;for(const u of sessionState.units)if(u.t===1)n++;return n};

/* far from the castle a horde follows its lane through a chain of local path fields (one per few waypoints), so cliffs, lakes and woods no longer trap it at its spawn;
   where no path exists at all the zombies clamber over the obstacle */
export const WSPN=110,LSEG=8,LFLD=new Map();

export let LFQS;
export let LFQT;

export function laneFieldQ(L,sg){if(L<0||L>5||sg>127)return laneField(L,sg);const k=L*128+sg;if(LFQT[k]===SW.step)return LFQS[k];const S=laneField(L,sg);LFQS[k]=S;LFQT[k]=SW.step;return S}

function laneField(L,sg){const key=L*4096+sg,E=LFLD.get(key);if(E&&(E.v===sessionState.ver||zombieLanesState.lfBud<=0))return E.S;if(E){zombieLanesState.lfBud--;LFLD.delete(key)}let S;
 const Wp=terrainState.ROUTES[L].wps,a=Math.min(Wp.length-1,sg*LSEG),b=Math.min(Wp.length-1,a+LSEG+2);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=a;i<=b;i++){const p=Wp[i];x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
 x0=Math.floor(x0)-14;y0=Math.floor(y0)-14;x1=Math.ceil(x1)+14;y1=Math.ceil(y1)+14;let seeds=[],tg=b;
 for(let k=b;k>a&&!seeds.length;k--){const p=Wp[k],cx=p[0]|0,cy=p[1]|0;ensureAround(cx,cy,1);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if(!solid(cx+i,cy+j))seeds.push([cx+i,cy+j]);tg=k}
 S=seeds.length?bfsW(seeds,false,x0,y0,x1-x0,y1-y0):null;if(S)S.tg=tg;LFLD.set(key,{S,v:sessionState.ver});if(LFLD.size>260)LFLD.delete(LFLD.keys().next().value);return S}

export function laneWalk(u,dt){const Wp=terrainState.ROUTES[u.lane].wps;while(u.ph<Wp.length&&dist(u.x,u.y,Wp[u.ph][0]*TS,Wp[u.ph][1]*TS)<TS*2)u.ph++;if(u.ph>=Wp.length)return false;
 const S=laneField(u.lane,Math.floor(u.ph/LSEG)),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);
 if(S){const v=fv(S,tx,ty);if(v<65535){u.lost=0;u.reAnc=0;if(v<=3&&S.tg+1>u.ph){u.ph=Math.min(Wp.length,S.tg+1);return laneWalk(u,dt)}
  /* the way points left in this stretch lie in rock or water: over land to the castle when its field reaches this tile, else on to the next stretch */
  if(v<=3){if(fv(FD[0],tx,ty)<65535){u.inC=1;return false}u.ph=Math.min(Wp.length,(Math.floor(u.ph/LSEG)+1)*LSEG);u.reAnc=1;return laneWalk(u,dt)}const g=Wp[S.tg];stepF(u,S,g[0]*TS,g[1]*TS,dt);return true}}
 u.lost=(u.lost||0)+dt;
 if(u.lost>1.5&&!u.reAnc){u.reAnc=1;let bj=u.ph,bd=1e18;for(let j=0;j<Wp.length;j++){const dx=Wp[j][0]*TS-u.x,dy=Wp[j][1]*TS-u.y,d=dx*dx+dy*dy;if(d<bd){bd=d;bj=j}}if(bj!==u.ph){u.ph=bj;return laneWalk(u,dt)}}
 if(u.lost>4){const L2=longField(tx,ty);if(L2&&fv(L2,tx,ty)<65535){const hc=nearC(u.x,u.y);stepF(u,L2,hc.x,hc.y,dt);return true}}
 u.clb=.4;moveTo(u,Wp[u.ph][0]*TS,Wp[u.ph][1]*TS,dt);return true}

export function initializeZombieLanes() {
  LFQS = new Array(6*128).fill(null);
  LFQT = new Int32Array(6*128).fill(-1);
}
