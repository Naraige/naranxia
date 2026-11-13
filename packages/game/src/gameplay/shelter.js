import { peasant } from '../ai/workers.js';
import { dist } from '../core/math.js';
import { doorTiles } from './construction.js';
import { nightSim } from './lighting.js';
import { moveTo, stepF } from './movement.js';
import { aliveC, dpt, LPL, nearC, playersState } from './players.js';
import { DIR4, GET, TS } from './rules.js';
import { sessionState } from './session.js';
import { simulationState } from './simulation.js';
import { leaveSquad } from './squads.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { DSIDE, longField, ringOf } from '../world/connectivity.js';
import { gOK } from '../world/routes.js';
import { terrainState } from '../world/terrain-state.js';
import { fv, solid } from '../world/traversal.js';

/* night shelter. A villager given an order during the night (or sent to repair) stays out until it is idle again.
   Sheltered villagers keep their job; they are not drawn, cannot be selected or attacked, and leave one by one at dawn. */
export function shelState(dt){const nv=nightSim();
 if(!simulationState.shelOn){if(sessionState.inGame&&nv>=.3)simulationState.shelOn=true}
 else if(nv<.12||!sessionState.inGame){simulationState.shelOn=false;let n=0;for(const u of sessionState.units){u.nso=0;u.shf=0;if(u.shel&&(u.pl|0)===LPL())n++}if(n){hudDisplayState.msgS='Dawn - '+n+' villager'+(n>1?'s':'')+' leave the castle and go back to work';hudDisplayState.msgT=4}}
 simulationState.shelRel=simulationState.shelOn?0:Math.min(.6,simulationState.shelRel+dt)}

const shelC=u=>{const own=(u.pl|0)===1&&sessionState.CS2?sessionState.CS2:sessionState.CS;return own&&own.hp>0&&sessionState.structs.includes(own)?own:aliveC().length?nearC(u.x,u.y):null};

export function shelGo(u,dt){if(u.cv){peasant(u,dt);return}let c=shelC(u);if(!c){peasant(u,dt);return}u.work=0;if(u.o&&!u.nso)u.o=null;
 const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),L=terrainState.FP&&terrainState.FP.list?terrainState.FP.list:terrainState.FP?[terrainState.FP]:[];let S=null;for(const q of L)if(q.dep===c){S=q;break}
 let v=S?fv(S,tx,ty):65535;if(v>=65535){const S2=longField(tx,ty),v2=S2?fv(S2,tx,ty):65535;if(v2<65535&&S2.dep&&S2.dep.hp>0){S=S2;v=v2;c=S2.dep}}
 const p=dpt(c),dd=dist(u.x,u.y,p.x,p.y);
 if(dd<TS*.75){const[fx,fy]=DIR4[(c.rot|0)&3],gx=p.x-fx*TS*.38,gy=p.y-fy*TS*.38;moveTo(u,gx,gy,dt);u.si=(u.si||0)+dt;if(dist(u.x,u.y,gx,gy)<8||u.si>1.2)shelIn(u,c);return}
 u.si=0;
 if(v>=65535){u.shf=(u.shf||0)+dt;if(u.shf>4){peasant(u,dt);return}moveTo(u,p.x,p.y,dt);return}
 if(v>=DSIDE){if(dist(u.x,u.y,c.x,c.y)<TS*2.45){shelIn(u,c);return}stepF(u,S,c.x,c.y,dt);return}
 stepF(u,S,p.x,p.y,dt)}

function shelIn(u,c){if(u.carry){playersState.RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0}
 u.sj=u.job?{job:u.job,tl:u.tl,rb:u.rb,rk:u.rk,wk:u.wk}:null;u.job=null;u.tl=-1;u.rb=null;u.rk=0;u.o=null;u.work=0;u.si=0;u.idle=0;
 leaveSquad(u);u.shel=c;u.gar=c;u.sel=false;u.dk=false;u.walk=0;u.x=c.x;u.y=c.y}

export function shelTick(u,_dt){const c=u.shel;u.walk=0;if(c.hp<=0||!sessionState.structs.includes(c)){shelOut(u,c,true);return}u.x=c.x;u.y=c.y;
 if(!simulationState.shelOn&&simulationState.shelRel>=.15){simulationState.shelRel-=.15;shelOut(u,c,false)}}

export function shelOut(u,c,hurt){u.shel=null;u.gar=null;const D=doorTiles(c,1).filter(([x,y])=>gOK(x,y)&&!solid(x,y)),Q=D.length?D:ringOf(c);
 if(Q.length){const[x,y]=Q[(u.uid|0)%Q.length];u.x=(x+.5)*TS+((u.uid*37)%13)-6;u.y=(y+.5)*TS+((u.uid*53)%13)-6}
 u.o=null;u.idle=0;const J=u.sj;u.sj=null;if(J&&J.job&&!hurt){u.job=J.job;u.tl=J.tl;u.rb=J.rb;u.rk=J.rk;u.wk=J.wk;if(u.tl>=0)u.lastT=u.tl}if(hurt)u.hp-=8}
