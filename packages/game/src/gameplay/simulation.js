import { updateCamps } from '../ai/camps.js';
import { aiUnit, TOWR, updateHordes } from '../ai/kingdoms.js';
import { RHAS, roleTick } from '../ai/worker-roles.js';
import { peasant, toLight } from '../ai/workers.js';
import { farmOff, saplTick, wkLive } from '../ai/workplaces.js';
import { zombieLanesState } from '../ai/zombie-lanes.js';
import { acidSplash, acidTick, fireTick, zDeathFx, zomb } from '../ai/zombies.js';
import { snd } from '../audio/sound.js';
import { dist, rnd } from '../core/math.js';
import { ach, achB } from './achievements.js';
import { cannonHit, castleFire, exposed, hit, reach } from './combat.js';
import { constructionState, HEAL_R, HEAL_RATE, mergeTowers } from './construction.js';
import { extraSim, finishResearch, priceTick } from './economy.js';
import { mkU, spawnPos } from './entities.js';
import { capField, fgTick, fgUnit, garrison, garSlot, garTarget, royalEscort, ungar } from './formations.js';
import { darkTick, lightingState, nightTick } from './lighting.js';
import { chase, collide, moveTo, walk } from './movement.js';
import { HOMEC, killPl, LPL, playersState, setPl } from './players.js';
import { GRNG, RS, RS2, RT_TIME, rulesState, SH, T, TS, TW } from './rules.js';
import { selectionState } from './selection.js';
import { sessionState } from './session.js';
import { shelGo, shelState, shelTick } from './shelter.js';
import { ugBuild, ugNear, UGU } from './spatial-index.js';
import { kingFell, leaveSquad, royalSpawn, slotPos } from './squads.js';
import { gstKill, saveBest } from './statistics.js';
import { SW, swDense, swLine, SWP, swSplash, swUpdate, targetZ } from './swarm.js';
import { demolish } from './terraforming.js';
import { wave, wavesState, waveTick } from './waves.js';
import { MP } from '../multiplayer/session.js';
import { effectsState, ember, puff, ring, shake, smoke, spark, vflash } from '../rendering/effects.js';
import { fowUpdate, VRN, vsnOf } from '../rendering/fog.js';
import { gtopOf } from '../rendering/models/fortifications.js';
import { refreshNear, rmStruct } from '../rendering/structures.js';
import { gh, markP, markT } from '../rendering/terrain.js';
import { mcCorpse } from '../rendering/unit-animation.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { calcFD } from '../world/connectivity.js';
import { mmTile } from '../world/minimap.js';
import { GF, mkG } from '../world/pathfinding.js';
import { gOK } from '../world/routes.js';
import { CH, ensureAround, HT, LAND, NCX, occ, stairs, ter } from '../world/terrain.js';
import { LVO } from '../world/traversal.js';

export const simulationState = {
  SIMTK: 0,
  shelOn: false,
  shelRel: 0,
};

export const SEPM=new Map();
let SEPN=new Int32Array(1024);

export function update0(dt){simulationState.SIMTK++;zombieLanesState.lfBud=3;extraSim(dt);fgTick(dt);sessionState.time+=dt;if(sessionState.inGame)fowUpdate(dt);if(RS.on){RS.t+=dt;if(RS.t>=RT_TIME)finishResearch();else{hudDisplayState.msgS='Researching Stonemasonry '+Math.floor(RS.t/RT_TIME*100)+'%';hudDisplayState.msgT=1}}updateCamps(dt);if(sessionState.inGame)updateHordes(dt);sessionState.fdT-=dt;if(sessionState.fdDirty&&sessionState.fdT<=0){calcFD();sessionState.fdT=.4}if(hudDisplayState.msgT>0)hudDisplayState.msgT-=dt;if(sessionState.bannerT>0)sessionState.bannerT-=dt;
 if(sessionState.queue.length){const seen=new Set();for(let i=0;i<sessionState.queue.length;i++){const q=sessionState.queue[i];if(q.b.type!=='castle'&&!sessionState.structs.includes(q.b)){setPl(q.b.pl|0);q.b=HOMEC();setPl(LPL())}if(seen.has(q.b))continue;seen.add(q.b);q.left-=dt;if(q.left<=0){sessionState.queue.splice(i,1);i--;const p=spawnPos(q.b);setPl(q.b.pl|0);const nu=mkU(0,q.type,p.x,p.y);sessionState.units.push(nu);if(nu.type==='king'||nu.type==='guard')royalSpawn(nu,q.b);{const RC=q.b.type==='castle'?q.b.rally:null;if(RC&&nu.type==='peasant'){const rtx=Math.floor(RC.x/TS),rty=Math.floor(RC.y/TS),rj=({2:'w',3:'s',4:'g'})[ter[rty*TW+rtx]];if(rj&&exposed(rtx,rty)&&reach(rtx,rty)){nu.job=rj;nu.tl=rty*TW+rtx}else nu.o={x:RC.x+rnd(-25,25),y:RC.y+rnd(-25,25),g:mkG(rtx,rty,p.x/TS,p.y/TS)}}}{const R=q.b.type==='barracks'?q.b.rally:null;if(R&&nu.type!=='peasant'){nu.o={x:R.x+rnd(-25,25),y:R.y+rnd(-25,25),g:mkG(Math.floor(R.x/TS),Math.floor(R.y/TS),p.x/TS,p.y/TS)}}}setPl(LPL());snd('spawn')}}}
 selectionState.pendB=false;for(const s of sessionState.structs){if(s.dem&&s.hp>0){selectionState.pendB=true;let w=0;{const Q=ugNear(0,s.x,s.y,TS*2.6);for(let q=0;q<Q.length;q++){const u=UGU[Q[q]];if(u.t===0&&u.type==='peasant'&&u.job==='r'&&!u.carry&&dist(u.x,u.y,s.x,s.y)<TS*2.6)w++}}s.dp=(s.dp||0)+dt*w*1.4;if(!w){s.at=(s.at||0)-dt;if(s.at<=0){s.at=2;let bu=null,bd=1e12;if(!RHAS[s.pl|0].b)for(const u of sessionState.units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&!u.carry&&!u.gar&&(!MP.on||(u.pl|0)===(s.pl|0))){const d=dist(u.x,u.y,s.x,s.y);if(d<bd){bd=d;bu=u}}if(bu){bu.job='r';bu.o=null;bu.tl=-1}}}if(w&&Math.random()<.08)puff(s.x+rnd(-20,20),s.y+rnd(-20,20),'#b9a68a',3,50);if(s.dp>=Math.max(2.5,s.bt*.25))demolish(s)}}
 for(const s of sessionState.structs)if(s.prog<1){if(!(s.unr>sessionState.time)&&s.t===0)selectionState.pendB=true;let w=0;{const Q=ugNear(0,s.x,s.y,TS*2.4);for(let q=0;q<Q.length;q++){const u=UGU[Q[q]];if(u.t===0&&u.type==='peasant'&&u.job==='r'&&!u.carry&&dist(u.x,u.y,s.x,s.y)<TS*2.4)w++}}
  if(!w&&s.t===0&&!simulationState.shelOn&&!(s.unr>sessionState.time)){s.at=(s.at||0)-dt;if(s.at<=0){s.at=3;const p=s.pl|0;let nb=0,ns=0;for(const q of sessionState.structs)if(q.t===0&&(q.pl|0)===p&&q.prog<1)ns++;for(const u of sessionState.units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&u.job==='r'&&u.role!=='r')nb++;
   if(nb<Math.min(ns*2,6)){let bu=null,bd=1e12;for(const u of sessionState.units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&!u.carry&&!u.gar&&!u.shel&&!u.role&&!u.o&&u.job!=='f'&&u.job!=='p'&&u.job!=='r'&&u.job!=='t'){const d=dist(u.x,u.y,s.x,s.y);if(d<bd){bd=d;bu=u}}if(bu){bu.job='r';bu.tl=-1;bu.rb=s;bu.work=0}}}}
  const dp=dt*w*1.4/s.bt;const pg0=s.prog;s.prog=Math.min(1,s.prog+dp);if(w>0&&s.prog<1&&(simulationState.SIMTK+(s.tx|0)*7+(s.ty|0))%11===0)puff(s.x,s.y,'#d8cfbf',3,26,{soft:1,T:.9,s:.3,z:.3,vz:.5,g:-.2});if(pg0<1&&s.prog>=1&&s.t===0){achB(s);puff(s.x,s.y,'#ffe066',16,70,{T:1.3,z:.4,vz:3.2,g:-.8,s:.08});puff(s.x,s.y,'#d8cfbf',8,80,{soft:1,T:1.2,s:.45,z:.2,vz:.5,g:-.2});vflash(s.x,s.y,(s.bh||LAND)+.25,1.4+s.sz*.6,[1,.85,.45],.7,1)}if(pg0<1&&s.prog>=1&&s.type==='storage')sessionState.fdDirty=true;s.hp=Math.min(s.max,s.hp+s.max*dp*.88);if(s.prog>=1&&s.hp>s.max*.97)s.hp=s.max}
 ugBuild();for(const s of sessionState.structs)s.zq=0;for(const u of sessionState.units){u.buff=(u.chT>sessionState.time?1.8:u.wcT>sessionState.time?1.35:1)*(u.t===0&&RS2.done.era?1.1:1);u.cb=0;if(u.t===1&&u._tc&&u._tc.b&&!(u._tc.b.type in T))u._tc.b.zq=(u._tc.b.zq||0)+1}for(const c of sessionState.units)if((c.type==='captain'||c.type==='king')&&c.t===0&&c.hp>0){const kg=c.type==='king',R=(kg?10:8)*TS,bf=kg?1.35:1.25,Q=ugNear(0,c.x,c.y,R);for(let q=0;q<Q.length;q++){const a=UGU[Q[q]];if(a.t===0&&a.hp>0&&dist(a.x,a.y,c.x,c.y)<R){a.buff=Math.max(a.buff,bf);a.cb=1}}}
 shelState(dt);
 for(const u of sessionState.units){u.cd-=dt;u.walk-=dt;u.hc-=dt;const d=T[u.type];
  const ck=((u.x/TS/CH)|0)+((u.y/TS/CH)|0)*NCX;if(ck!==u.ck){u.ck=ck;if(u.t===0||u.lane>=0||!u.home)ensureAround((u.x/TS)|0,(u.y/TS)|0,1)}
  u.sT-=dt;if(u.sT<=0){u.sT=.6;if(u.mv&&dist(u.x,u.y,u.px,u.py)<9){u.det=.9;u.dir=Math.random()<.5?1:-1}u.px=u.x;u.py=u.y;u.mv=false}
  if(u.t===0){
   if(u.shel){shelTick(u,dt);continue}
   if(u.gar){const s=u.gar;if(s.hp<=0||!sessionState.structs.includes(s)){ungar(u);u.hp-=8}else{const j=s.garr.indexOf(u),sp=garSlot(s,j);u.x=sp.x;u.y=sp.y;u.gz=(s.bh||0)+gtopOf(s);
     const[b]=targetZ(u,u.type==='cannon'?d.rng+80:d.rng*GRNG[s.type]+20);if(b&&u.cd<=0&&(b.type in T||u.type==='cannon'))hit(u,b);u.walk=0}continue}
   if(u.goG){const s=u.goG;if(!sessionState.structs.includes(s)||s.hp<=0)u.goG=null;else if(s.tiles.some(([tx,ty])=>{const L=TS*((u.o?1:(u.goR||1))+.35);return Math.abs(u.x-(tx+.5)*TS)<L&&Math.abs(u.y-(ty+.5)*TS)<L})){u.goG=null;u.o=null;garrison(u,s);continue}else if(!u.o){const near=s.tiles.some(([tx,ty])=>Math.abs(u.x-(tx+.5)*TS)<TS*3.2&&Math.abs(u.y-(ty+.5)*TS)<TS*3.2);if(near){u.goG=null;garrison(u,s);continue}if((u.goT=(u.goT||0)+1)<=2){const tp=garTarget(s,u);u.goR=tp.r;u.o={x:tp.x,y:tp.y,g:mkG(Math.floor(tp.x/TS),Math.floor(tp.y/TS),u.x/TS,u.y/TS),f:1}}else{u.goG=null;u.goT=0}}}
   if(u.type==='peasant'){if(simulationState.shelOn&&u.nso&&!u.o&&!u.carry&&u.tl<0&&(u.noT||0)>.6&&(u.job==='w'||u.job==='s'||u.job==='g'))u.nso=0;const sg=simulationState.shelOn&&u.role!=='r'&&(!u.nso||(!u.o&&!u.job&&!u.carry));if(u.onF&&(sg||u.job!=='f'||u.o||!wkLive(u)))farmOff(u);if(sg)shelGo(u,dt);else peasant(u,dt);continue}
   if(u.rg&&u.cap&&u.cap.hp>0&&u.cap.type==='king'&&!u.fg&&royalEscort(u,d,dt))continue;
   if(u.fg){fgUnit(u,dt);continue}
   if(u.o&&u.o.f){walk(u,dt);if(!u.o){u.ret=false;u.gx=u.x;u.gy=u.y}continue}
   if(u.dk&&!u.o&&lightingState.LITL.length&&(u.lgT=(u.lgT||0)-dt)<=0){u.lgT=1.5;toLight(u)}
   if(u.cap&&!u.o&&u.hc<=0){u.hc=.7;const C=u.cap,j=C.sq?C.sq.indexOf(u):-1;if(j>=0){const s=slotPos(C,j);if(dist(u.x,u.y,s.x,s.y)>46)u.o={x:s.x,y:s.y,g:capField(C)}}}
   const stn=u.stn||'agg',inR=bd=>bd<=d.rng+d.r;
   if(stn==='hold'){u.o=null;const[b,bd]=targetZ(u,d.rng+d.r+2);if(b){u.face=Math.atan2(b.x-u.x,b.y-u.y);if(inR(bd)&&u.cd<=0)hit(u,b)}continue}
   if(u.fpos&&!u.o){const P=u.fpos,[b,bd]=targetZ(u,d.rng+d.r+TS*1.1);
    if(b&&dist(b.x,b.y,P.x,P.y)<TS*1.1+d.rng+d.r){if(inR(bd)){if(u.cd<=0)hit(u,b)}else if(u.type!=='cannon'&&u.type!=='archer'&&dist(u.x,u.y,P.x,P.y)<TS*.7)chase(u,b,dt);else if(dist(u.x,u.y,P.x,P.y)>6)moveTo(u,P.x,P.y,dt)}
    else if(dist(u.x,u.y,P.x,P.y)>6)moveTo(u,P.x,P.y,dt);else u.face=P.fm;continue}
   if(stn==='def'){if(u.gx===undefined){u.gx=u.x;u.gy=u.y}
    if(u.o&&!u.ret){const[b,bd]=targetZ(u,d.rng+d.r+2);if(b&&inR(bd)){if(u.cd<=0)hit(u,b)}else walk(u,dt);continue}
    const[b,bd]=targetZ(u,TS*5.5);
    if(b&&dist(b.x,b.y,u.gx,u.gy)<TS*7){u.o=null;u.ret=false;if(inR(bd)){if(u.cd<=0)hit(u,b)}else chase(u,b,dt);continue}
    if(u.o){walk(u,dt);if(!u.o)u.ret=false;continue}
    if(dist(u.x,u.y,u.gx,u.gy)>TS*1.5){u.o={x:u.gx,y:u.gy,g:mkG(Math.floor(u.gx/TS),Math.floor(u.gy/TS),u.x/TS,u.y/TS)};u.ret=true}
    continue}
   const[b,bd]=targetZ(u,u.o?110:u.type==='cannon'?d.rng:TS*8.5);
   if(b){if(inR(bd)){if(u.cd<=0)hit(u,b)}else chase(u,b,dt)}
   else if(u.o)walk(u,dt);else if(u.type==='king'&&u.fm!==undefined)u.face=u.fm}
  else if(u.t===2)aiUnit(u,d,dt);else zomb(u,d,dt)}
 swUpdate(dt);waveTick();nightTick(dt);darkTick(dt);priceTick(dt);saplTick(dt);roleTick(dt);acidTick(dt);fireTick(dt);
 for(const bm of sessionState.units)if(bm.type==='bannerman'&&bm.t===0&&bm.hp>0){bm.h2=(bm.h2||0)-dt;let inj=null;const HQ=ugNear(0,bm.x,bm.y,HEAL_R,true).slice();for(let q=0;q<HQ.length;q++){const a=UGU[HQ[q]];if(a.t===0&&a.hp>0&&dist(a.x,a.y,bm.x,bm.y)<HEAL_R){const mx=T[a.type].hp;a.cd-=dt*.2;if(a.hp<mx){a.hp=Math.min(mx,a.hp+HEAL_RATE*dt);if(Math.random()<.2)inj=a}}}
  if(bm.h2<=0&&inj){bm.h2=.4;puff(inj.x,inj.y,'#7dffa0',2,22);snd('heal',inj.x,inj.y)}}
 for(const s of sessionState.structs)if(s.hp<(SH[s.type]||1e9)*.5&&s.prog>=1&&Math.random()<dt*2.2){smoke(s.x,s.y,(s.bh||1)+1);if(s.hp<(SH[s.type]||1e9)*.25)ember(s.x,s.y)}
 for(const s of sessionState.structs)if(s.type==='tower'&&s.prog>=1&&!s.weapon){s.cd-=dt;if(s.cd>0)continue;const st=s.tier!==0,[b]=targetZ(s,TOWR*TS+(st?60:0));if(!b||b.t===0){s.cd=.3;continue}
  const n=st?6:5,dm=(st?12:11)*(RS2.done.fletch?1.4:1),dd=dist(s.x,s.y,b.x,b.y)||1,fl=Math.min(.75,.36+dd/1400),sw=!(b.type in T),cx=b.x+(sw?(b.x-s.x)/dd*TS*.9:0),cy=b.y+(sw?(b.y-s.y)/dd*TS*.9:0);snd('arrow',s.x,s.y);
  for(let k=0;k<n;k++){const a=Math.random()*6.2832,r=TS*(.15+.95*Math.sqrt(Math.random())),t=fl+k*.035,x2=k?cx+Math.cos(a)*r:b.x,y2=k?cy+Math.sin(a)*r:b.y;sessionState.fx.push({x1:s.x,y1:s.y,x2,y2,t,T:t,a:true,arc:1,tw:1,dmg:dm})}s.cd=1.7}
/* can the owner of s see this spot? (sight of their own buildings and units, same on every machine) */
function simSeen(pl,x,y){for(const s of sessionState.structs)if(s.t===0&&(s.pl|0)===pl&&s.prog>=1){const r=vsnOf(s)*TS;if(Math.abs(s.x-x)<r&&Math.abs(s.y-y)<r&&dist(s.x,s.y,x,y)<r)return true}
 for(const u of sessionState.units)if(u.t===0&&u.hp>0&&!u.shel&&(u.pl|0)===pl){const r=(VRN[u.type]||9)*TS;if(Math.abs(u.x-x)<r&&Math.abs(u.y-y)<r&&dist(u.x,u.y,x,y)<r)return true}return false}
 for(const s of sessionState.structs)if(s.weapon&&s.prog>=1){s.wcd=(s.wcd||0)-dt;s.rec=Math.max(0,(s.rec||0)-dt);const tb=s.weapon==='trebuchet';if(s.wcd>0)continue;const hh=(s.bh||0)+3.4;
  const spl=s.pl|0;let b=null;if(!tb){[b]=targetZ(s,720);if(b&&(!(b.type in T)||!simSeen(spl,b.x,b.y)))b=null}
  else{let bs=-1,n=0;for(const e of sessionState.units){if(e.t!==1||e.hp<=0||++n>90)continue;const dd=dist(s.x,s.y,e.x,e.y);if(dd<240||dd>1300||!simSeen(spl,e.x,e.y))continue;let c=0;for(const f of sessionState.units)if(f.t===1&&Math.abs(f.x-e.x)<110&&Math.abs(f.y-e.y)<110&&dist(f.x,f.y,e.x,e.y)<110)c++;if(c>bs){bs=c;b=e}}}
  if(!b&&tb){const i=swDense(s.x,s.y,240,1300);if(i>=0&&simSeen(spl,SW.x[i],SW.y[i])){SWP.x=SW.x[i];SWP.y=SW.y[i];SWP.swi=i;b=SWP}}
  if(!b){s.wcd=.5;continue}s.aim=Math.atan2(b.x-s.x,b.y-s.y);s.rec=.5;
  if(tb){s.wcd=6.2;snd('trebl',s.x,s.y);ring(s.x,s.y,'#d8cfc0',12,150);shake(.12);sessionState.fx.push({k:'rock',x1:s.x,y1:s.y,x2:b.x,y2:b.y,t:1.5,T:1.5,a:true,h0:hh,r:110,dmg:75,done:0})}
  else{s.wcd=3.4;snd('bolt',s.x,s.y);vflash(s.x,s.y,(s.bh||0)+3.5,1.3,[1,.85,.5],.22,0);puff(s.x,s.y,'#ffe9a0',5,70,{T:.25,z:(s.bh||0)+3,vz:.5,s:.1});const dx=Math.sin(s.aim),dy=Math.cos(s.aim),L=760;sessionState.fx.push({k:'bolt',x1:s.x,y1:s.y,x2:s.x+dx*L,y2:s.y+dy*L,t:.35,T:.35,a:true,h0:hh});
   for(const e of sessionState.units)if(e.t===1&&e.hp>0){const rx=e.x-s.x,ry=e.y-s.y,pr=rx*dx+ry*dy;if(pr<0||pr>L)continue;const cr=Math.abs(rx*dy-ry*dx);if(cr<T[e.type].r+10){e.hp-=70;puff(e.x,e.y,'#e55',3,50)}}swLine(s.x,s.y,s.x+dx*L,s.y+dy*L,14,70,90);}}
 /* unit separation (spatial grid) */
 {const grid=SEPM;grid.clear();if(SEPN.length<sessionState.units.length)SEPN=new Int32Array(sessionState.units.length*2);for(let i=sessionState.units.length-1;i>=0;i--){const a=sessionState.units[i];a.gi=i;if(a.gar||a.onF)continue;const k=((a.x/48)|0)*4096+((a.y/48)|0),h=grid.get(k);SEPN[i]=h===undefined?-1:h;grid.set(k,i)}
  for(const a of sessionState.units){if(a.gar||a.onF)continue;const cx=(a.x/48)|0,cy=(a.y/48)|0;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const h=grid.get((cx+ox)*4096+cy+oy);if(h===undefined)continue;for(let q=h;q>=0;q=SEPN[q]){const b=sessionState.units[q];if(b.gi<=a.gi)continue;const m=(T[a.type].r+T[b.type].r)*1.12;if(Math.abs(a.x-b.x)>m||Math.abs(a.y-b.y)>m)continue;const dd=dist(a.x,a.y,b.x,b.y);if(dd<m&&dd>0){const pa=a.type==='peasant',pb2=b.type==='peasant',sk=a.t===b.t&&(pa||pb2)?(pa&&pb2?.08:.3):1,nx=(b.x-a.x)/dd,ny=(b.y-a.y)/dd,p=(m-dd)/2*sk;a.x-=nx*p;a.y-=ny*p;b.x+=nx*p;b.y+=ny*p}}}}}
 zDeathFx();for(const u of sessionState.units){collide(u);if(u.hp<=0){if(u.type==='king'&&u.t===0)kingFell(u);
  if(u.conv){puff(u.x,u.y,'#b04bff',10,70);if(u.sq){u.sq.forEach(f=>{f.cap=null});u.sq=null}leaveSquad(u);u.zk=u.type;u.t=1;u.type='zombie';u.hp=T.zombie.hp;u.conv=false;u.sel=false;u.o=null;u.carry=false;u.cd=1;u.lane=-1;u.home=null;u.base=null;u.hh=null}
  else if(u.nokill){}else{if(!(typeof mcCorpse==='function'&&mcCorpse(u)))puff(u.x,u.y,'#efefef',8,30,{T:.8,z:.35,vz:1.4,g:-.7,s:.12});if(u.type==='brute')shake(.25);snd('die',u.x,u.y);if(u.t===0)rulesState.GST.lost++;if(u.t===1){sessionState.kills++;gstKill(u);if(sessionState.kills===1)ach('k1');if(sessionState.kills===100)ach('k100');if(sessionState.kills===500)ach('k500');const gg=u.boss?400:u.type==='brute'?25:u.type==='miner'?8:u.type==='bomber'?6:u.type==='acid'?5:u.type==='runner'?3:u.type==='husk'?1:2;playersState.RESP[killPl(u)].g+=gg;puff(u.x,u.y,'#ffd23c',3,50)}}}}
 sessionState.units=sessionState.units.filter(u=>u.hp>0);for(const u of sessionState.units){if(u.cap&&(u.cap.hp<=0||u.cap.t===1)){u.cap=null}if(u.sq)u.sq=u.sq.filter(f=>f.hp>0&&f.cap===u)}
 constructionState.mergeT-=dt;if(constructionState.mergeT<=0){constructionState.mergeT=.7;mergeTowers()}
 castleFire(dt);
 for(const s of sessionState.structs)if(s.hp<=0){if(!s.noCrumble){puff(s.x,s.y,'#9a9a9f',22,130,{T:.9,z:.5,vz:3,g:6,s:.18});for(let k=0;k<6;k++)ember(s.x,s.y);ring(s.x,s.y,'#a89f90',16,160);shake(.4);snd('crumble',s.x,s.y)}if(s.garr)s.garr.slice().forEach(ungar);rmStruct(s);sessionState.fdDirty=true;for(const[x,y]of s.tiles)if(occ.get(y*TW+x)===s){occ.delete(y*TW+x);{const k=y*TW+x,lv=LVO.get(k);if(lv){LVO.delete(k);if(HT[k]===lv.h&&!stairs.has(k)){HT[k]=lv.o;GF.clear()}}}for(const[a2,b2]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a2,y+b2)){markT(x+a2,y+b2);markP(x+a2,y+b2)}mmTile(y*TW+x)}refreshNear(s)}
 sessionState.structs=sessionState.structs.filter(s=>s.hp>0);
 sessionState.fx.forEach(f=>f.t-=dt);
 for(const f of sessionState.fx)if(f.k==='rock'&&f.t<=0&&!f.done){f.done=1;snd('boom',f.x2,f.y2);vflash(f.x2,f.y2,gh(f.x2/TS,f.y2/TS)+.7,3.4,[1,.6,.28],.6,1);puff(f.x2,f.y2,'#8a7a5a',20,110,{T:.8,z:.3,vz:4,g:10,s:.15});puff(f.x2,f.y2,'#ffb050',10,90,{T:.5,z:.5,vz:3,g:6,s:.12});ring(f.x2,f.y2,'#e8d8b0',24,300);puff(f.x2,f.y2,'#4a4448',6,40,{soft:1,T:2.2,s:.7,z:.6,vz:1.6,g:-.25});puff(f.x2,f.y2,'#8a7058',5,90,{soft:1,T:1.4,s:.5,z:.2,vz:.6,g:-.1});shake(.3);for(const e of sessionState.units)if(e.t===1&&e.hp>0){const dd=dist(e.x,e.y,f.x2,f.y2);if(dd<f.r)e.hp-=f.dmg*(1-dd/f.r*.5)}swSplash(f.x2,f.y2,f.r,f.dmg*.75,600)}
 for(const f of sessionState.fx)if(f.k==='acid'&&f.t<=0&&!f.done){f.done=1;acidSplash(f.x2,f.y2,0)}else if(f.k==='cball'&&f.t<=0&&!f.done){f.done=1;cannonHit(f)}
 for(const f of sessionState.fx)if(f.tw&&f.t<=0&&!f.done){f.done=1;let h=0;for(const e of sessionState.units)if(e.t===1&&e.hp>0&&Math.abs(e.x-f.x2)<30&&Math.abs(e.y-f.y2)<30&&dist(e.x,e.y,f.x2,f.y2)<T[e.type].r+12){e.hp-=f.dmg;e.hurt=.2;h=1;break}if(!h)swSplash(f.x2,f.y2,TS*.5,f.dmg,3);if(Math.random()<.3)spark(f.x2,f.y2,.5)}
 sessionState.fx=sessionState.fx.filter(f=>f.t>0);
 for(const p of sessionState.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.z!==undefined){p.z+=p.vz*dt;p.vz-=p.g*dt;if(p.z<.05){p.z=.05;p.vz=0;p.vx*=.8;p.vy*=.8}}p.t-=dt}if(effectsState.shakeT>0)effectsState.shakeT-=dt;sessionState.pt=sessionState.pt.filter(p=>p.t>0);
 if(!wavesState.waveOn){sessionState.waveT-=dt;if(sessionState.waveT<=0){wavesState.waveST=sessionState.time;wave();wavesState.waveOn=wavesState.hordeOn=true;wavesState.hordeT=sessionState.time;sessionState.waveT=0}}
 setPl(LPL());if(sessionState.CS.hp<=0&&(!sessionState.CS2||sessionState.CS2.hp<=0)&&!sessionState.over){sessionState.over=true;saveBest()}}
