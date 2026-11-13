import { guildWait, repTick, RHAS } from './worker-roles.js';
import { farmer, forester, relPt, wkFree, wkSet } from './workplaces.js';
import { snd } from '../audio/sound.js';
import { dist } from '../core/math.js';
import { tfo } from '../gameplay/construction.js';
import { ALERTS } from '../gameplay/economy.js';
import { lightingState, litAt } from '../gameplay/lighting.js';
import { stepF, walk } from '../gameplay/movement.js';
import { BAD, dpt, homeOf, LPL, playersState } from '../gameplay/players.js';
import { CLM, nearest, nearestLocal, rclaimed } from '../gameplay/resources.js';
import { CODE, GET, RS2, TS, TW, WORK } from '../gameplay/rules.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { doTf, nearestTf } from '../gameplay/terraforming.js';
import { convoyStep } from '../multiplayer/convoys.js';
import { puff } from '../rendering/effects.js';
import { markP } from '../world/terrain-invalidation.js';
import { NAMES } from '../ui/build-catalog.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { atDepot, depBest, depFieldAt, DSIDE, reachTile, sameComp } from '../world/connectivity.js';
import { mmTile } from '../world/minimap.js';
import { gField, mkG } from '../world/pathfinding.js';
import { D8, gOK } from '../world/routes.js';
import { amt, ter } from '../world/terrain-state.js';
import { canStep, fv, solid } from '../world/traversal.js';

export function peasant(u,dt){if(u.cv){convoyStep(u,dt);return}const hadO=!!u.o;peasant0(u,dt);
 if(u.role&&u.gwT===sessionState.time){u.skt=0;return}
 if(!u.o&&!u.carry&&u.tl<0&&(u.noT||0)>1&&(u.job==='w'||u.job==='s'||u.job==='g')){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty);if(fv(S,tx,ty)>=65535){const f=reachTile(S,tx,ty);if(f){puff(u.x,u.y,'#e8e8e8',5,30);u.x=(f[0]+.5)*TS;u.y=(f[1]+.5)*TS;u.lx=u.x;u.ly=u.y;u.noT=0;return}}}
 if(hadO||u.o||u.work>0||!(u.carry||u.job)||u.wlk!==sessionState.time){u.skt=0;return}
 if(!u.skt||(dist(u.x,u.y,u.skx,u.sky)>TS*.7&&!(sessionState.time-(u.pfT||0)>3))){u.skx=u.x;u.sky=u.y;u.skt=1e-4;u.nudged=0;return}
 u.skt+=dt;
 if(u.skt>1.4&&!u.nudged){u.nudged=1;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),a=ty*TW+tx,o=(Math.random()*8)|0;
  for(let k=0;k<8;k++){const[dx,dy]=D8[(k+o)&7],x=tx+dx,y=ty+dy;if(!gOK(x,y)||solid(x,y)||!canStep(a,y*TW+x)||(dx&&dy&&(solid(tx+dx,ty)||solid(tx,ty+dy)))||!sameComp(tx,ty,x,y))continue;
   u.x+=((x+.5)*TS-u.x)*.6;u.y+=((y+.5)*TS-u.y)*.6;break}return}
 if(u.skt<3)return;
 u.skt=0;u.nudged=0;{
  const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty);
  if(fv(S,tx,ty)>=65535){const f=reachTile(S,tx,ty);if(f){puff(u.x,u.y,'#e8e8e8',5,30);u.x=(f[0]+.5)*TS;u.y=(f[1]+.5)*TS;u.lx=u.x;u.ly=u.y;return}
   /* walled in, far from any way out: tell the player once in a while */
   const c0=sessionState.CS;if((u.pl|0)===LPL()&&c0&&!(c0.cutT>sessionState.time)){c0.cutT=sessionState.time+40;hudDisplayState.msgS='A villager is cut off from your castle and storages - open a way or build a gate';hudDisplayState.msgT=5;ALERTS.push({x:u.x,y:u.y,t:4})}}
  if(u.carry){u.stk2=(u.stk2||0)+1;if(u.stk2>=3){playersState.RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0;return}if(!solid(tx,ty)){u.x=(tx+.5)*TS;u.y=(ty+.5)*TS;u.lx=u.x;u.ly=u.y}u.los=false;u.lt=1}
  else if(u.tl>=0){BAD.set(u.tl,sessionState.time+60);u.tl=-1}
  else if(u.job==='p'&&u.pt>=0){BAD.set(u.pt,sessionState.time+60);relPt(u);u.pwT=2}}}

function litGoal(u){const ux=(u.x/TS)|0,uy=(u.y/TS)|0;let b=null,bd=1e12;for(const[x,y,r]of lightingState.LITL){const d=dist(u.x,u.y,x,y);if(d>=bd)continue;let ok=null;
  for(let k=0;k<16&&!ok;k++){const a=k/16*6.2832,rr=Math.min(r*.55,TS*(1.5+(k&3)*.6)),qx=Math.floor((x+Math.cos(a)*rr)/TS),qy=Math.floor((y+Math.sin(a)*rr)/TS);if(gOK(qx,qy)&&!solid(qx,qy)&&sameComp(ux,uy,qx,qy))ok={x:(qx+.5)*TS,y:(qy+.5)*TS}}
  if(ok){bd=d;b=ok}}return b}

export function toLight(u){const L=litGoal(u);if(!L)return false;u.o={x:L.x,y:L.y,g:mkG(Math.floor(L.x/TS),Math.floor(L.y/TS),u.x/TS,u.y/TS)};u.gx=L.x;u.gy=L.y;return true}

function peasant0(u,dt){
 if(u.role&&!u.job){u.job=u.role==='t'?'t':'r';u.rk=u.role==='r'?1:0;u.tl=-1}
 if(!u.job&&!u.o)u.work=0;
 if(u.o){walk(u,dt);return}
 if(u.job==='f'){farmer(u,dt);return}
 if(u.job==='p'){forester(u,dt);return}
 if(u.dk&&!u.carry&&lightingState.LITL.length&&u.job!=='r'&&u.job!=='t'&&u.job!=='f'&&u.job!=='p'){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty),D=depBest(S,tx,ty);let hc,dp;if(!(D&&D.v<65535)&&toLight(u))return;if(D&&D.v<65535){hc=D.S.dep;dp=hc.type==='castle'&&D.v<DSIDE?dpt(hc):{x:hc.x,y:hc.y}}else{hc=homeOf(u);dp=dpt(hc)}stepF(u,S,dp.x,dp.y,dt);u.work=0;if(u.tl>=0){BAD.set(u.tl,sessionState.time+40);u.tl=-1}return}
 if(u.carry){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty),D=depBest(S,tx,ty);let hc,dp;
  if(D&&D.v<65535){hc=D.S.dep;dp=hc.type==='castle'&&D.v<DSIDE?dpt(hc):{x:hc.x,y:hc.y}}else{hc=homeOf(u);dp=dpt(hc)}
  stepF(u,S,dp.x,dp.y,dt);let ok=atDepot(u);if(!ok&&D&&hc.type==='castle'&&D.v>=DSIDE&&D.v<65535&&dist(u.x,u.y,hc.x,hc.y)<TS*2.7)ok=hc;
  if(ok){playersState.RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0;snd('coin',u.x,u.y)}return}
 if(!u.job){const wp=u.hp>0&&!u.gar?wkFree(u):null;if(wp){wkSet(u,wp);return}if(tfo.size&&u.hp>0&&!RHAS[u.pl|0].t){u.job='t';u.tl=-1}else if(selectionState.pendB&&!RHAS[u.pl|0].b){u.job='r'}else{u.idle=(u.idle||0)+dt;if(u.idle<1.5||u.hp<=0||u.gar)return;u.idle=0;let bj=null,bi=-1,bd=1e9;for(const j of['w','s','g']){const i=nearest(j,u.pl,u);if(i<0)continue;const d=dist(u.x,u.y,(i%TW+.5)*TS,((i/TW|0)+.5)*TS);if(d<bd){bd=d;bj=j;bi=i}}if(!bj)return;u.job=bj;u.tl=bi;u.lastT=bi;CLM.set(bi,u);return}}
 if(u.job==='t'){if(u.tl<0||!tfo.has(u.tl))u.tl=nearestTf(u);if(u.tl<0){if(u.role){guildWait(u,dt);return}u.job=null;return}const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;
  if(dist(u.x,u.y,tx,ty)<44){u.work+=dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>2.4){u.work=0;doTf(u.tl);u.tl=-1}}else stepF(u,gField('t'+u.tl,u.tl%TW,(u.tl/TW)|0,1),tx,ty,dt);return}
 if(u.job==='r'){let b=null,bd=1e9;const rb=u.rb;
  if(rb&&sessionState.structs.includes(rb)&&rb.hp>0&&(rb.hp<rb.max||rb.prog<1||rb.dem)&&!(rb.prog>=1&&!rb.dem&&rb.noRep>sessionState.time)){b=rb;bd=dist(u.x,u.y,rb.x,rb.y)}
  else{u.rb=null;for(const s of sessionState.structs)if(s.t===0&&(s.pl|0)===(u.pl|0)&&!(s.unr>sessionState.time)&&(u.role==='r'?(s.prog>=1&&!s.dem&&s.hp<s.max&&!(s.noRep>sessionState.time)):(s.prog<1||s.dem||(u.rk&&s.hp<s.max&&!(s.noRep>sessionState.time))))){if(lightingState.LITL.length&&s.prog>=1&&!s.dem&&!litAt(s.x,s.y))continue;const dd=dist(u.x,u.y,s.x,s.y);if(dd<bd){bd=dd;b=s}}}
  if(b){if(bd-b.rad<40){u.unr=0;if(b.prog>=1&&!b.dem&&!repTick(b,dt)){u.rb=null;u.work=0;if(u.role){guildWait(u,dt);return}u.job=null;u.rk=0;return}u.work=1}else{const G=gField('s'+b.ty*TW+b.tx,b.tx,b.ty,b.sz);
   if(fv(G,Math.floor(u.x/TS),Math.floor(u.y/TS))>=65535){u.unr=(u.unr||0)+dt;if(u.unr>4){u.unr=0;b.unr=sessionState.time+45;u.rb=null;u.work=0;if((b.pl|0)===LPL()&&!(b.unm>sessionState.time)){b.unm=sessionState.time+40;hudDisplayState.msgS=(b.prog<1?'A construction site':'The '+(NAMES[b.type]||'building'))+' cannot be reached by your peasants';hudDisplayState.msgT=4;ALERTS.push({x:b.x,y:b.y,t:4})}if(!u.role){u.job=null;u.rk=0}return}}else u.unr=0;stepF(u,G,b.x,b.y,dt)}}else if(u.role){guildWait(u,dt)}else{u.job=null;u.work=0;u.rk=0}return}
 if(u.tl>=0&&rclaimed(u.tl,u))u.tl=-1;
 if(u.tl<0||ter[u.tl]!==CODE[u.job]){let c=u.lastT>=0?nearestLocal(u.job,u,10):-1;if(c<0)c=nearest(u.job,u.pl,u);u.tl=c}
 if(u.tl<0){u.noT=(u.noT||0)+dt;if(u.noT>1.2){u.noT=0;let bj=null,bi=-1,bw=1e9;for(const j of['w','s','g']){if(j===u.job)continue;const i=nearest(j,u.pl,u);if(i>=0&&nearest.w<bw){bw=nearest.w;bj=j;bi=i}}if(bj){u.job=bj;u.tl=bi;u.lastT=bi;CLM.set(bi,u)}else if(!u.role){u.job=null;u.idle=0}}return}u.noT=0;CLM.set(u.tl,u);u.lastT=u.tl;
 const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;
 if(dist(u.x,u.y,tx,ty)<42){u.work+=dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>WORK*(RS2.done.tools?.75:1)){snd(u.job==='w'?'chop':'mine',u.x,u.y);u.work=0;u.carry=true;u.cj=u.job;if(--amt[u.tl]<=0){const i=u.tl;ter[i]=0;mmTile(i);markP(i%TW,(i/TW)|0)}}}
 else stepF(u,gField(u.tl,u.tl%TW,(u.tl/TW)|0,1),tx,ty,dt)}
