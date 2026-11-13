import { dist, rnd } from '../core/math.js';
import { mkU } from '../gameplay/entities.js';
import { fdist } from '../gameplay/players.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { CAMPS, genF } from '../world/terrain-state.js';
import { solidAt } from '../world/traversal.js';

export const campsState = {
  campT: 0,
};

export function updateCamps(dt){campsState.campT-=dt;if(campsState.campT>0)return;campsState.campT=.6;let nz=0;for(const u of sessionState.units)if(u.t===1)nz++;
 for(const[k,c]of CAMPS){if(!genF[k])continue;
  if(!c.act){if(c.n<=0)continue;let near=fdist(c.x,c.y)<56*TS;if(!near)for(const u of sessionState.units)if(u.t===0&&dist(u.x,u.y,c.x,c.y)<44*TS){near=true;break}
   if(near&&nz<420){c.act=true;c.us=[];for(let i=0;i<c.n;i++){const r=Math.random(),ty=r<.68?'husk':r<.93?'zombie':r<.985?'runner':'brute',x=c.x+rnd(-70,70),y=c.y+rnd(-70,70);if(solidAt(x,y))continue;const u=mkU(1,ty,x,y,null,-1);u.home={x:c.x,y:c.y};u.camp=c;sessionState.units.push(u);c.us.push(u);nz++}}}
  else{c.us=c.us.filter(u=>u.hp>0&&sessionState.units.includes(u));c.n=c.us.length;let far=fdist(c.x,c.y)>110*TS;if(far)for(const u of sessionState.units)if(u.t===0&&dist(u.x,u.y,c.x,c.y)<90*TS){far=false;break}
   if(far){for(const u of c.us)u.hp=0,u.nokill=true;c.act=false}}}}
