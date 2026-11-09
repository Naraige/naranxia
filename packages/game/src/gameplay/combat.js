import { bastionHas } from './economy.js';
import { snd } from '../audio/sound.js';
import { dist, hyp, rnd } from '../core/math.js';
import { ALERTS, economyState } from './economy.js';
import { aliveC, LPL } from './players.js';
import { LH, RANKN, RS2, T, TS } from './rules.js';
import { sessionState } from './session.js';
import { simulationState } from './simulation.js';
import {
  SGC,
  sgFresh,
  SGH,
  SGHt,
  SGN,
  SGU,
  SGW,
  UGC,
  ugFresh,
  UGH,
  UGHt,
  UGN,
  UGU,
  UGW,
} from './spatial-index.js';
import { SW, swLine, swNear, swSplash } from './swarm.js';
import { blood, puff, ring, shake, spark, vflash } from '../rendering/effects.js';
import { gh } from '../rendering/terrain.js';
import { NAMES } from '../ui/build-menu.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { D4 } from '../world/routes.js';
import { LAND, terrainState } from '../world/terrain.js';
import { fv, solid } from '../world/traversal.js';

export function target(u,range,tt){const C=u._tc;if(C&&C.tt===tt&&C.r===range&&((simulationState.SIMTK+(u.uid||u.sid||0))%3)!==0&&C.tk>=simulationState.SIMTK-2){const e=C.b;
 if(e===null)return[null,range];if(e.hp>0&&!e.gar&&(e.t===tt||(tt===0&&e.t===2))){const dd=dist(u.x,u.y,e.x,e.y)-(e.type in T?T[e.type].r:e.rad);if(dd<range)return[e,dd]}}
 const res=target0(u,range,tt);if(C){C.tt=tt;C.r=range;C.tk=simulationState.SIMTK;C.b=res[0]}else u._tc={tt,r:range,tk:simulationState.SIMTK,b:res[0]};return res}

function target0(u,range,tt){ugFresh();let b=null,bd=range,bk=1e9;
 {const Hh=UGH[tt===1?1:0],R=range+30,x0=Math.max(0,((u.x-R)/UGC)|0),x1=Math.min(UGW-1,((u.x+R)/UGC)|0),y0=Math.max(0,((u.y-R)/UGC)|0),y1=Math.min(UGHt-1,((u.y+R)/UGC)|0);
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=Hh[cy*UGW+cx];k>=0;k=UGN[k]){const e=UGU[k];if((e.t===tt||(tt===0&&e.t===2))&&e.hp>0&&!e.gar){const dd=dist(u.x,u.y,e.x,e.y)-T[e.type].r;if(dd<bd||(dd===bd&&b!==null&&k<bk)){bd=dd;b=e;bk=k}}}}
 sgFresh();const R=range+200,x0=Math.max(0,((u.x-R)/SGC)|0),x1=Math.min(SGW-1,((u.x+R)/SGC)|0),y0=Math.max(0,((u.y-R)/SGC)|0),y1=Math.min(SGHt-1,((u.y+R)/SGC)|0);let sb=null,sbd=bd,sbt=bd,sk=1e9;
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=SGH[cy*SGW+cx];k>=0;k=SGN[k]){const s=SGU[k];if(s.t===tt||(tt===0&&s.t===2)){const td=dist(u.x,u.y,s.x,s.y)-s.rad;if(td>=range)continue;const dd=td+(u.t===1&&s.zq?Math.min(6,s.zq)*TS*.85*(u._tc&&u._tc.b===s?0:1):0);if(dd<sbd||(dd===sbd&&sb!==null&&k<sk)){sbd=dd;sbt=td;sb=s;sk=k}}}
 if(sb!==null&&sbd<bd){b=sb;bd=sbt}
 return[b,bd]}

export function hit(u,e){if(u.type==='cannon'){cannonFire(u,e);return}if(e.swarm){hitSw(u,e);return}if(u.t===0)LH.set(e,u.type);if(u.type!=='archer'&&!u.gar)puff(e.x,e.y,e.t===1?'#9fd084':'#ffd890',2,32,{T:.28,z:.5,vz:.9,g:-.6,s:.1});u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;const z=u.t===1,d=T[u.type],ar=u.type==='archer',fa=ar&&u.t===0&&RS2.done.fire;sessionState.fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,f:fa?1:0,h0:u.gar?u.gz+.42:undefined});if(fa&&e.t===1){e.burn=3;e.burnD=6+.2*sessionState.waveN}
 if(e.t===0&&economyState.alertT<=0){economyState.alertT=8;ALERTS.push({x:e.x,y:e.y,t:5});hudDisplayState.msgS=(e.type in T?'Your units are under attack!':'Your '+(NAMES[e.type]||'building').toLowerCase()+' is under attack!');hudDisplayState.msgT=3;snd('alarm')}const vr=u.t===0?Math.min(3,(u.xp||0)/4|0):0,bs=!(e.type in T);e.hp-=d.dmg*(u.buff||1)*(1+.12*vr)*(u.t===0&&RS2.done.iron?1.25:1)*(u.t===0&&RS2.done.steel?1.2:1)*(u.t===0&&bastionHas(u.pl|0,'forge')?1.08:1)*(u.t===0&&ar&&RS2.done.fletch?1.25:1)*(e.t===0&&RS2.done.plate?.78:1)*(e.t===0&&RS2.done.mail?.85:1)*(e.t===0&&bs&&RS2.done.bastion?.72:1)*(e.cb?.8:1)*(z&&bs?1.6:1)*(e.kdr||1);if(u.t===0&&e.hp<=0&&e.t===1){const r0=Math.min(3,(u.xp||0)/4|0);u.xp=(u.xp||0)+1;const r1=Math.min(3,u.xp/4|0);if(r1>r0){puff(u.x,u.y,'#ffe066',8,40);u.hp=Math.min(T[u.type].hp,u.hp+T[u.type].hp*.3);if(u.pl===LPL()){hudDisplayState.msgS=NAMES[u.type]+' promoted: '+RANKN[r1];hudDisplayState.msgT=2.5}}}snd(ar?'arrow':z?'zhit':'sword',u.x,u.y);if(!(e.type in T))snd('stone',e.x,e.y);u.cd=d.cdt;if(!(e.type in T))puff(e.x,e.y,'#8a8a90',3,50,{T:.4,z:.8,vz:2,g:8,s:.07});else{spark(e.x,e.y);blood(e.x,e.y,z?'#7a1a1a':'#c33');if(!ar)vflash(e.x,e.y,gh(e.x/TS,e.y/TS)+.7,.42,z?[1,.45,.35]:[1,.95,.8],.12)}if(z&&e.hp<=0&&e.t!==1&&e.type in T)e.conv=true}

export const exposed=(x,y)=>D4.some(([dx,dy])=>!solid(x+dx,y+dy));

export const reach=(x,y)=>D4.some(([dx,dy])=>{const a=x+dx,b=y+dy;return !solid(a,b)&&fv(terrainState.FP,a,b)<65535});

function giveXp(u,a){const r0=Math.min(3,(u.xp||0)/4|0);u.xp=(u.xp||0)+a;const r1=Math.min(3,u.xp/4|0);if(r1>r0){puff(u.x,u.y,'#ffe066',8,40);u.hp=Math.min(T[u.type].hp,u.hp+T[u.type].hp*.3);if(u.pl===LPL()){hudDisplayState.msgS=NAMES[u.type]+' promoted: '+RANKN[r1];hudDisplayState.msgT=2.5}}}

/* archers pierce a few husks in a row, melee fighters cleave the little crowd in front of them */
/* ---- cannon: crew of 2, slow; fires a ball on an arc that bursts where it lands (zombies only) ---- */
function cannonFire(u,e){const d=T.cannon;u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.35;u.cd=d.cdt;const dd=dist(u.x,u.y,e.x,e.y),t=.8+dd/420,fx0=u.x+Math.sin(u.face)*20,fy0=u.y+Math.cos(u.face)*20,sa=Math.random()*6.2832,sr=TS*(.15+dd/520*1.25)*Math.sqrt(Math.random());
 sessionState.fx.push({k:'cball',x1:fx0,y1:fy0,x2:e.x+Math.cos(sa)*sr,y2:e.y+Math.sin(sa)*sr,t,T:t,h0:gh(u.x/TS,u.y/TS)+.38,done:0,vr:u.t===0?Math.min(3,(u.xp||0)/4|0):0,bf:u.buff||1});
 snd('boom',u.x,u.y);puff(fx0,fy0,'#d8d0c0',8,40,{soft:1,T:1.4,s:.42,z:.4,vz:.8,g:-.2});puff(fx0,fy0,'#ffb050',5,60,{T:.25,z:.4,vz:1,g:2,s:.09});vflash(fx0,fy0,gh(u.x/TS,u.y/TS)+.5,1.6,[1,.7,.35],.15)}

export function cannonHit(f){const R=TS*1.35,X=f.x2,Y=f.y2,dm=T.cannon.dmg*f.bf*(1+.12*f.vr)*(RS2.done.iron?1.25:1)*(RS2.done.steel?1.2:1);
 swSplash(X,Y,R,dm,40);for(const z of sessionState.units)if(z.t===1&&z.hp>0){const dd=dist(z.x,z.y,X,Y);if(dd<R)z.hp-=dm*(1-dd/R*.5)}
 snd('crumble',X,Y);puff(X,Y,'#8a7058',12,90,{T:.8,z:.3,vz:3.6,g:9,s:.13});puff(X,Y,'#ffb050',6,70,{T:.35,z:.4,vz:2.4,g:5,s:.1});puff(X,Y,'#4a4440',4,40,{soft:1,T:1.8,s:.6,z:.5,vz:1.2,g:-.2});ring(X,Y,'#e8c890',16,200);shake(.06)}

function hitSw(u,e){const d=T[u.type],ar=u.type==='archer',fa=ar&&u.t===0&&RS2.done.fire;u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;
 sessionState.fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,f:fa?1:0,h0:u.gar?u.gz+.42:undefined});
 const vr=u.t===0?Math.min(3,(u.xp||0)/4|0):0,dm=d.dmg*(u.buff||1)*(1+.12*vr)*(u.t===0&&RS2.done.iron?1.25:1)*(u.t===0&&RS2.done.steel?1.2:1)*(u.t===0&&bastionHas(u.pl|0,'forge')?1.08:1)*(u.t===0&&ar&&RS2.done.fletch?1.25:1);
 let k;if(ar){const dx=e.x-u.x,dy=e.y-u.y,l=hyp(dx,dy)||1;k=swLine(u.x,u.y,e.x+dx/l*36,e.y+dy/l*36,9,fa?dm*1.35:dm,fa?4:3)}else k=swSplash(e.x,e.y,u.type==='king'?TS:u.type==='guard'?TS*.85:TS*.7,dm,u.type==='king'?7:u.type==='guard'?4:u.type==='captain'?5:u.type==='knight'?3:2);
 if(u.t===0&&k>0)giveXp(u,k*.25);snd(ar?'arrow':'sword',u.x,u.y);u.cd=d.cdt;spark(e.x,e.y);blood(e.x,e.y,'#7a1a1a')}


/* ---- the castle shoots arrows at the nearest zombie in range ---- */
export const CASTLE_RNG=10;

export function castleFire(dt){for(const c of aliveC()){if(c.prog<1)continue;c.ccd=(c.ccd||0)-dt;if(c.ccd>0)continue;const R=CASTLE_RNG*TS;let b=null,bd=R;
  for(const e of sessionState.units)if(e.t===1&&e.hp>0){const dd=dist(c.x,c.y,e.x,e.y);if(dd<bd){bd=dd;b=e}}
  let si=-1;if(!b){si=swNear(c.x,c.y,R);if(si<0){c.ccd=.35;continue}}c.ccd=(c.tier?.8:1.05)/(RS2.done.fletch?1.25:1);c.cv=((c.cv|0)+1)%4;const o=[[-1,-1],[1,-1],[1,1],[-1,1]][c.cv],sx=c.x+o[0]*TS,sy=c.y+o[1]*TS;
  const ex=b?b.x:SW.x[si],ey=b?b.y:SW.y[si],dm=(c.tier?16:11)*(RS2.done.fletch?1.4:1);sessionState.fx.push({x1:sx,y1:sy,x2:ex,y2:ey,t:.3,T:.3,a:1,h0:(c.bh||LAND)+(c.tier?3.5:2.5)});
  if(b)b.hp-=dm;else{swSplash(ex,ey,TS*.95,dm,10);for(let q=0;q<2;q++)sessionState.fx.push({x1:sx,y1:sy,x2:ex+rnd(-26,26),y2:ey+rnd(-26,26),t:.3,T:.3,a:1,h0:(c.bh||LAND)+(c.tier?3.5:2.5)})}snd('arrow',sx,sy);spark(ex,ey,.6)}}
