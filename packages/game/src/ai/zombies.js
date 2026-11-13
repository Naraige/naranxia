import { absorbUnit } from './kingdoms.js';
import { bossAI } from './wave-boss.js';
import { SAPL } from './workplaces.js';
import { baseZF, laneWalk } from './zombie-lanes.js';
import { snd } from '../audio/sound.js';
import { dist, hs, rnd } from '../core/math.js';
import { REALR } from '../core/random.js';
import { hit, target } from '../gameplay/combat.js';
import { ALERTS, economyState } from '../gameplay/economy.js';
import { chase, losClear, moveTo, stepF } from '../gameplay/movement.js';
import { LC, nearC } from '../gameplay/players.js';
import { RS2, T, TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { swSplash } from '../gameplay/swarm.js';
import { puff, ring, shake, vflash } from '../rendering/effects.js';
import { gh } from '../world/terrain-queries.js';
import { markP, markT } from '../world/terrain-invalidation.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { longField } from '../world/connectivity.js';
import { mmTile } from '../world/minimap.js';
import { GF } from '../world/pathfinding.js';
import { D4, D8, FD, gOK } from '../world/routes.js';
import { amt, HT, LAND, occ, pth, ROCKH, stairs, ter, TFL } from '../world/terrain-state.js';
import { canStepZ, fv, solidAt } from '../world/traversal.js';

/* bomber: walks up to a building or a soldier, lights its fuse (1.1 s) and blows up; killed, it blows up where it falls (in the horde too) */
function bomberAI(u,d,dt){if(u.fuse>0){u.fuse-=dt;u.walk=0;if(u.fuse<=0){u.boomed=1;boom(u.x,u.y,1);u.hp=0;u.nokill=true}return true}
 const[b,bd]=target(u,150,0);if(b&&bd<=22+d.r){u.fuse=1.1;u.face=Math.atan2(b.x-u.x,b.y-u.y);snd('fuse',u.x,u.y);return true}return false}

function boom(x,y,pw){const R=TS*2.4,X=x/TS,Z=y/TS;let me=false;
 snd('boom',x,y);vflash(x,y,gh(X,Z)+.7,3.8,[1,.62,.25],.6,1);puff(x,y,'#8a7058',22,120,{T:.9,z:.3,vz:4.6,g:10,s:.16});puff(x,y,'#ffb050',14,100,{T:.5,z:.5,vz:3.4,g:6,s:.13});puff(x,y,'#ff8a2a',8,70,{T:.45,z:.6,vz:2.6,g:3,s:.12});
 ring(x,y,'#e8c890',26,340);puff(x,y,'#3e3a38',7,50,{soft:1,T:2.6,s:.85,z:.7,vz:1.8,g:-.25});puff(x,y,'#7a6450',5,90,{soft:1,T:1.5,s:.55,z:.2,vz:.6,g:-.1});shake(.35);
 for(const s of sessionState.structs)if(s.hp>0&&s.t!==1){const dd=Math.max(0,dist(s.x,s.y,x,y)-(s.rad||20));if(dd<R){s.hp-=320*pw*(1-dd/R*.6)*(s.t===0&&RS2.done.bastion?.72:1)*(s.type==='castle'||s.type==='keep'?.5:1);if(s.t===0)me=true}}
 for(const e of sessionState.units)if(e.hp>0&&!e.gar&&!e.shel){const dd=Math.max(0,dist(e.x,e.y,x,y)-T[e.type].r);if(dd<R){e.hp-=(e.t===1?28:75)*pw*(1-dd/R*.6);e.hurt=.25;if(e.t===0)me=true}}
 swSplash(x,y,R,25*pw,400);crater(Math.floor(X),Math.floor(Z));
 if(me&&economyState.alertT<=0){economyState.alertT=8;ALERTS.push({x,y,t:5});hudDisplayState.msgS='A bomber blew up!';hudDisplayState.msgT=3;snd('alarm')}}

export const SCRT=new Set();

/* the blast digs a crater: 2 levels at the centre, 1 around; trees go, rock and ore stay, buildings and ramps are spared; the walls of the hole can be climbed */
function crater(tx,ty){const ch=[];
 const low=(x,y,dd)=>{if(x<1||y<1||x>=TW-1||y>=TH-1||!gOK(x,y))return;const i=y*TW+x;if(ter[i]===1||ter[i]>=3||occ.has(i)||stairs.has(i))return;
  let mn=LAND-3;for(const[ax,ay]of D4)if(ter[i+ay*TW+ax]===1){mn=LAND;break}const nh=Math.max(mn,HT[i]-dd);
  if(ter[i]===2){ter[i]=0;amt[i]=0}else if(nh>=HT[i])return;HT[i]=nh;TFL[i]=1;pth[i]=0;SAPL.delete(i);SCRT.add(i);ch.push(i)};
 for(const[dx,dy]of D8)low(tx+dx,ty+dy,1);for(const[dx,dy]of D4)if(hs(tx+dx*2,ty+dy*2,41)<.6)low(tx+dx*2,ty+dy*2,1);low(tx,ty,2);
 for(const[dx,dy]of D8){const x=tx+dx*2,y=ty+dy*2;if(gOK(x,y)&&ter[y*TW+x]===0&&hs(x,y,43)<.5){SCRT.add(y*TW+x);ch.push(y*TW+x)}}if(!ch.length)return;
 for(const i of ch){const x=i%TW,y=(i/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(i)}sessionState.fdDirty=true;GF.clear()}

/* acid spitter: stops at 3.5 tiles and spits; the acid burns men and buildings for a few seconds and leaves a puddle that burns whoever walks in it */
export const PUD=[];

function acidAI(u,d,_dt){const[b]=target(u,d.rng,0);if(!b)return false;u.face=Math.atan2(b.x-u.x,b.y-u.y);u.walk=0;
 if(u.cd<=0){u.cd=d.cdt*(.85+Math.random()*.3);u.atk=.35;const dd=dist(u.x,u.y,b.x,b.y),t=.5+dd/600;sessionState.fx.push({k:'acid',x1:u.x,y1:u.y,x2:b.x+rnd(-10,10),y2:b.y+rnd(-10,10),t,T:t,h0:gh(u.x/TS,u.y/TS)+.62,done:0});snd('spit',u.x,u.y)}return true}

export function acidSplash(x,y,big){const R=big?TS*1.5:TS*.95,dps=4+.15*sessionState.waveN,tm=big?5:4;let me=false;
 snd('sizzle',x,y);puff(x,y,'#b8f040',big?16:9,big?90:60,{T:.6,z:.3,vz:2.4,g:7,s:.09});puff(x,y,'#6a8a2a',big?4:2,30,{soft:1,T:1.6,s:.45,z:.3,vz:.6,g:-.15});
 for(const e of sessionState.units)if(e.t!==1&&e.hp>0&&!e.gar&&!e.shel){const dd=dist(e.x,e.y,x,y)-T[e.type].r;if(dd<R){e.hp-=big?8:5;e.acid=Math.max(e.acid||0,tm);e.acidD=Math.max(e.acidD||0,dps);e.hurt=.2;if(e.t===0)me=true}}
 for(const s of sessionState.structs)if(s.t!==1&&s.hp>0){const dd=dist(s.x,s.y,x,y)-(s.rad||20);if(dd<R){s.acid=Math.max(s.acid||0,tm);s.acidD=big?14:10;if(s.t===0)me=true}}
 if(PUD.length>=48)PUD.shift();PUD.push({x,y,r:R*.85,t:big?8:5,T:big?8:5});
 if(me&&economyState.alertT<=0){economyState.alertT=8;ALERTS.push({x,y,t:5});hudDisplayState.msgS='Acid! Your men and walls are burning';hudDisplayState.msgT=3;snd('alarm')}}

/* zombies hit by fire arrows burn for 3 s (burnD damage per second) */
export function fireTick(dt){for(const e of sessionState.units)if(e.burn>0){e.burn-=dt;if(e.hp>0){e.hp-=e.burnD*dt;e.hurt=.12;if(REALR()<dt*6)puff(e.x,e.y,REALR()<.5?'#ff8a2a':'#ffd040',1,18,{T:.45,z:.6,vz:1.8,g:-.6,s:.07})}if(e.burn<=0)e.burnD=0}}

export function acidTick(dt){const dps=4+.15*sessionState.waveN;
 for(const e of sessionState.units)if(e.acid>0){e.acid-=dt;if(e.hp>0&&!e.shel&&!e.gar){e.hp-=e.acidD*dt;if(REALR()<dt*4)puff(e.x,e.y,'#b8f040',1,16,{T:.5,z:.5,vz:1.4,g:-.3,s:.06})}if(e.acid<=0)e.acidD=0}
 for(const s of sessionState.structs)if(s.acid>0){s.acid-=dt;if(s.hp>0){s.hp-=s.acidD*dt*(RS2.done.bastion?.72:1);if(REALR()<dt*3)puff(s.x+(REALR()-.5)*TS,s.y+(REALR()-.5)*TS,'#9ad030',1,14,{T:.9,z:.8,vz:1,g:-.3,s:.1})}if(s.acid<=0)s.acidD=0}
 for(let k=PUD.length-1;k>=0;k--){const P=PUD[k];P.t-=dt;if(P.t<=0){PUD.splice(k,1);continue}
  for(const e of sessionState.units)if(e.t!==1&&e.hp>0&&!e.gar&&!e.shel&&Math.abs(e.x-P.x)<P.r&&Math.abs(e.y-P.y)<P.r&&dist(e.x,e.y,P.x,P.y)<P.r){e.acid=Math.max(e.acid||0,1.2);e.acidD=Math.max(e.acidD||0,dps)}}}

/* zombies that die take effect before the bodies are counted: a dead bomber blows up (it can set off others), a dead spitter bursts into a puddle */
export function zDeathFx(){for(let pass=0;pass<6;pass++){let more=false;for(const u of sessionState.units)if(u.hp<=0&&u.t===1&&!u.dfx){u.dfx=1;if(u.nokill)continue;if(u.type==='bomber'&&!u.boomed){u.boomed=1;boom(u.x,u.y,1);more=true}else if(u.type==='acid')acidSplash(u.x,u.y,1)}if(!more)break}}

/* miner: near a castle (40 tiles) he heads straight for it, tile by tile, and digs whatever stands in his way:
   trees, boulders, ore and rock are cleared, a step up is cut down (a step down: he digs his own tile), so the horde can follow */
function digStep(i,n){if(ter[n]===5){HT[n]=Math.max(HT[i]+1,HT[n]-2);ter[n]=HT[n]>=ROCKH?5:0;amt[n]=0}else if(ter[n]>=2){ter[n]=0;amt[n]=0}
 else if(HT[n]>HT[i]+1)HT[n]=Math.max(HT[i]+1,HT[n]-(HT[n]-HT[i]>4?2:1));
 else if(HT[n]<HT[i]-1){if(HT[i]<=LAND-2)return false;HT[i]=Math.max(HT[n]+1,LAND-2,HT[i]-(HT[i]-HT[n]>4?2:1))}
 else if(!canStepZ(i,n)){TFL[n]=2;TFL[i]=2}
 if(TFL[n]!==1)TFL[n]=2;if(TFL[i]!==1)TFL[i]=2;for(const k of[i,n]){const x=k%TW,y=(k/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(k)}
 sessionState.fdDirty=true;GF.clear();const px=(n%TW+.5)*TS,py=(((n/TW)|0)+.5)*TS;puff(px,py,'#9d7a50',8,60,{T:.6,z:.4,vz:2.4,g:9,s:.1});snd('dirt',px,py);return true}

function minerAI(u,d,dt){if(u.home)return false;const hc=nearC(u.x,u.y);if(!hc||dist(u.x,u.y,hc.x,hc.y)>TS*40){u.dg=-1;return false}
 {const[b]=target(u,110,0);if(b){u.dg=-1;return false}}
 const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),i=ty*TW+tx;
 if(u.dg>=0){const n=u.dg,nx=n%TW,ny=(n/TW)|0;
  if(occ.has(n)||ter[n]===1||stairs.has(n)||stairs.has(i)||Math.abs(nx-tx)+Math.abs(ny-ty)!==1)u.dg=-1;
  else if(ter[n]===0&&canStepZ(i,n))u.dg=-1;
  else{u.face=Math.atan2((nx+.5)*TS-u.x,(ny+.5)*TS-u.y);u.walk=0;u.dgT=(u.dgT||0)+dt;if(u.atk<=0){u.atk=.3;snd('mine',u.x,u.y)}
   if(u.dgT>=1.4){u.dgT=0;if(!digStep(i,n)){u.dg=-1;u.mnT=4;return false}}return true}}
 if(u.mnT>0){u.mnT-=dt;return false}
 const cx=Math.floor(hc.x/TS),cy=Math.floor(hc.y/TS),ddx=cx-tx,ddy=cy-ty;if(Math.abs(ddx)<=3&&Math.abs(ddy)<=3)return false;
 const ax=[[Math.sign(ddx),0],[0,Math.sign(ddy)]];if(Math.abs(ddy)>Math.abs(ddx))ax.reverse();let dig=-1;
 for(const[sx,sy]of ax){if(!sx&&!sy)continue;const nx=tx+sx,ny=ty+sy,n=ny*TW+nx;if(!gOK(nx,ny)||ter[n]===1||stairs.has(n))continue;if(occ.has(n))return false;
  if(ter[n]===0&&canStepZ(i,n)){moveTo(u,(nx+.5)*TS,(ny+.5)*TS,dt);return true}if(dig<0&&!stairs.has(i))dig=n}
 if(dig>=0){u.dg=dig;u.dgT=0;return true}return false}

function zTgt(u,b,bd,d,dt){if(bd<=14+d.r){u.tpr=0;if(u.cd<=0)hit(u,b);return}
 if(!(b.type in T)){if(u.tgo!==b||bd<u.tgd-4){u.tgo=b;u.tgd=bd;u.tpr=0}else if((u.tpr=(u.tpr||0)+dt)>3){u.ign=b;u.ignT=sessionState.time+15;u.tpr=0}}/* straight at the target; if that stops gaining ground (a grove, a rock field), follow a path round it for a while */
 if(u.zpb!==b||bd<u.zpd-6){u.zpb=b;u.zpd=bd;u.zpt=0}else u.zpt=(u.zpt||0)+dt;if(u.zpt>3.5){u.zpc=7;u.zpt=0;u.zpd=bd}if(u.zpc>0&&bd>TS*1.2){u.zpc-=dt;chase(u,b,dt)}else moveTo(u,b.x,b.y,dt)}

export function zomb(u,d,dt){if(u.boss)bossAI(u,dt);if(u.home){const hm=u.home,far=dist(u.x,u.y,hm.x,hm.y);let[b,bd]=target(u,far>TS*22?0:260,0);if(b&&b===u.ign&&sessionState.time<u.ignT)b=null;
  if(b){zTgt(u,b,bd,d,dt);if(Math.random()<.002)snd('groan',u.x,u.y);return}
  if(far>TS*2.5){u.wx=undefined;chase(u,hm,dt*.7);return}
  u.wt=(u.wt||0)-dt;if(u.wt<=0){u.wt=2+Math.random()*4;u.wx=hm.x+rnd(-80,80);u.wy=hm.y+rnd(-80,80);if(solidAt(u.wx,u.wy)||!losClear(u.x,u.y,u.wx,u.wy))u.wx=undefined;u.wd=1e9}
  if(u.wx!==undefined){const dd=dist(u.x,u.y,u.wx,u.wy);if(dd<=8||dd>u.wd-.02)u.wx=undefined;else{u.wd=dd;moveTo(u,u.wx,u.wy,dt*.4)}}return}
 if(u.type==='bomber'?bomberAI(u,d,dt):u.type==='acid'?acidAI(u,d,dt):u.type==='miner'?minerAI(u,d,dt):false)return;
 u.spdK=1;let[b,bd]=target(u,150,0);if(b&&b===u.ign&&sessionState.time<u.ignT)b=null;
 if(b){zTgt(u,b,bd,d,dt);return}
 if(u.tb){const bb=u.tb;if(!bb.alive)u.tb=null;else if(u.ph>=u.tcut||dist(u.x,u.y,bb.x,bb.y)<TS*50){if(!bb.mat&&dist(u.x,u.y,bb.x,bb.y)<TS*9){absorbUnit(u,bb);return}
  const d0=dist(u.x,u.y,bb.x,bb.y);if(u.tbd===undefined||d0<u.tbd-TS){u.tbd=d0;u.tbt=0}else if((u.tbt=(u.tbt||0)+dt)>15){u.tb=null;u.tbd=undefined;u.reAnc=0;u.lost=0}
  if(u.tb){const S=baseZF(bb),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(S&&fv(S,tx,ty)<65535)stepF(u,S,bb.x,bb.y,dt);else moveTo(u,bb.x,bb.y,dt);return}}}
 if(u.lane>=0&&!u.inC){if(dist(u.x,u.y,LC(u.lane).x,LC(u.lane).y)>46*TS){if(laneWalk(u,dt))return}else u.inC=1}
 {const hc=nearC(u.x,u.y),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);let S=FD[0];if(fv(S,tx,ty)>=65535){const L2=longField(tx,ty);if(L2&&fv(L2,tx,ty)<65535)S=L2;else{u.clb=.4;moveTo(u,hc.x,hc.y,dt);return}}stepF(u,S,hc.x,hc.y,dt)}}
