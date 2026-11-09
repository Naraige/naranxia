import { bastionHas } from './economy.js';
import { BASES } from '../ai/kingdoms.js';
import { bossSpawn } from '../ai/wave-boss.js';
import { WSPN, zcount } from '../ai/zombie-lanes.js';
import { snd } from '../audio/sound.js';
import { hyp, rnd } from '../core/math.js';
import { ach } from './achievements.js';
import { mkU } from './entities.js';
import { kingWaveXp } from './king-skills.js';
import { aliveC, playersState } from './players.js';
import { pickLanes } from './reset.js';
import { TS } from './rules.js';
import { D_, sessionState } from './session.js';
import { SW, swarmState, swPending, swQueue } from './swarm.js';
import { MP } from '../multiplayer/session.js';
import { puff } from '../rendering/effects.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { mmss } from '../ui/minimap.js';
import { saveGame } from '../ui/save-menu.js';
import { ensureAround, terrainState } from '../world/terrain.js';
import { freeTile, solid, solidAt } from '../world/traversal.js';

export const wavesState = {
  hordeT: -1e9,
  hordeOn: false,
  waveOn: false,
  burnAt: 0,
  hordeD: 1e9,
  nightLv: 0,
  nightCk: 0,
  waveST: -1e9,
  WAVEZ: 0,
};

let wmsg='';

export function wave(){const L0=sessionState.nextL.slice();wave0();if(!MP.on&&sessionState.waveN>1)setTimeout(()=>saveGame('Autosave',true),400);const bm=sessionState.waveN%5===3&&sessionState.waveN>=3,mc=sessionState.waveN%4===2;
 if(bm){for(const L of L0){const an=spawnAnchor(L),p=an.p;let hk=0;for(let i=0,nE=Math.round((12+sessionState.waveN*5)*D_().zm*laneK(L,L0));i<nE;i++){if(i%3&&swarmState.SWF>0){hk++;continue}if(zcount()>=720)break;const x=(p[0]+rnd(-5,5))*TS,y=(p[1]+rnd(-5,5))*TS;if(solidAt(x,y))continue;const zu=mkU(1,i%3?'husk':'runner',x,y,null,L);zu.hp*=1+.05*sessionState.waveN;zu.ph=an.ph;sessionState.units.push(zu)}if(hk)swQueue(L,an,hk*swarmState.SWF)}snd('bloodmoon');sessionState.bannerS2='BLOOD MOON - a bigger, faster horde! '+sessionState.bannerS2}
 bossSpawn(L0);if(mc){const g=40+sessionState.waveN*10,w=30+sessionState.waveN*6,st=20+sessionState.waveN*5;for(let pi=0;pi<playersState.RESP.length;pi++){const R=playersState.RESP[pi],m=bastionHas(pi,'embassy')?1.5:1;R.g+=Math.round(g*m);R.w+=Math.round(w*m);R.s+=Math.round(st*m)}snd('caravan');const cm='A merchant caravan passes: +'+g+' gold, +'+w+' wood, +'+st+' stone';if(ZNEW[sessionState.waveN]){hudDisplayState.msgS+='  --  '+cm;hudDisplayState.msgT=12}else{hudDisplayState.msgS=cm;hudDisplayState.msgT=6}}
 const wn=sessionState.waveN;
 if(wn>=7&&wn%9===7){for(const L of L0){const an=spawnAnchor(L),p=an.p;for(let i=0,nE=Math.round((6+wn*2)*D_().zm*laneK(L,L0));i<nE;i++){if(zcount()>=720)break;const x=(p[0]+rnd(-5,5))*TS,y=(p[1]+rnd(-5,5))*TS;if(solidAt(x,y))continue;const zu=mkU(1,'runner',x,y,null,L);zu.hp*=1+.03*wn;zu.ph=an.ph;sessionState.units.push(zu)}}snd('wolves');sessionState.bannerS2='WOLF PACK - fast raiders from the wild! '+sessionState.bannerS2}
 if(wn>=8&&wn%11===8){for(const u of sessionState.units)if(u.t===1&&u.lane>=0)u.hp*=1.15;const rg=40+wn*8;for(let pi=0;pi<playersState.RESP.length;pi++)playersState.RESP[pi].g+=Math.round(rg*(bastionHas(pi,'embassy')?1.5:1));snd('eclipse');sessionState.bannerS2='ECLIPSE - the dead grow stronger, but relics fall: +'+rg+' gold. '+sessionState.bannerS2}
 const EV=sessionState.waveN%6===4?['Rebel envoys bring tribute from a nearby camp',{g:30+sessionState.waveN*6,f:40+sessionState.waveN*5}]:sessionState.waveN%7===5?['A meteor shower: rare stone falls near the walls',{s:60+sessionState.waveN*8}]:null;
 if(EV){snd(sessionState.waveN%6===4?'envoy':'meteor');for(let pi=0;pi<playersState.RESP.length;pi++){const R=playersState.RESP[pi],m=bastionHas(pi,'embassy')?1.5:1;for(const k in EV[1])R[k]+=Math.round(EV[1][k]*m)}const em=EV[0]+': '+Object.entries(EV[1]).map(([k,v])=>'+'+v+' '+({g:'gold',w:'wood',s:'stone',f:'food'})[k]).join(', ');hudDisplayState.msgS=(hudDisplayState.msgT>0&&(mc||ZNEW[sessionState.waveN])?hudDisplayState.msgS+'  --  ':'')+em;hudDisplayState.msgT=Math.max(hudDisplayState.msgT,8)}
 if(wn===30||wn===50){const dm=wn===30?'The sky pales in the east. Dawn may still come: hold the bastion.':'Fifty waves. Even the rebels light fires in your honor.';hudDisplayState.msgS=(hudDisplayState.msgT>0?hudDisplayState.msgS+'  --  ':'')+dm;hudDisplayState.msgT=Math.max(hudDisplayState.msgT,10)}
 wavesState.WAVEZ=SW.n+swPending();for(const u of sessionState.units)if(u.t===1&&u.lane>=0)wavesState.WAVEZ++}

export function spawnAnchor(L){const R=terrainState.ROUTES[L],P=R.pts;let rem=0,i0=0;for(let i=P.length-1;i>0;i--){rem+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(rem>=WSPN){i0=i-1;break}}i0-=i0&1;for(let i=i0;i<R.pts.length;i+=2){const p=R.pts[i];ensureAround(p[0]|0,p[1]|0,1);const f=freeTile(p[0]|0,p[1]|0);if(f&&!solid(f[0],f[1])&&(f[0]-(p[0]|0))**2+(f[1]-(p[1]|0))**2<=16)return{p:[f[0]+.5,f[1]+.5],ph:Math.ceil(i/3)}}return{p:R.pts[0],ph:0}}

const laneK=(L,Ls)=>{const n=Math.max(1,Ls.filter(q=>(q>=3)===(L>=3)).length),b=Math.min(2.2,1+.15*(sessionState.waveN-1));return b/n*(1+.15*(n-1))};

function wave0(){sessionState.waveN++;if(sessionState.waveN>1)kingWaveXp();wmsg='';if(sessionState.waveN===2)ach('w1');if(sessionState.waveN===6)ach('w5');if(sessionState.waveN===11)ach('w10');const df=D_();
 for(const L of sessionState.nextL){const an=spawnAnchor(L),p=an.p;
  const zf=(sessionState.SITE2?.8:1)*laneK(L,sessionState.nextL),nh=Math.min(260,Math.round((16+sessionState.waveN*10)*df.zm*zf)),nz=Math.round(sessionState.waveN*2.2*df.zm*zf),nr=sessionState.waveN>=3?Math.round(sessionState.waveN*.8*df.zm*zf):0,nb=sessionState.waveN%5===0?Math.ceil(sessionState.waveN/5*df.zm*zf):sessionState.waveN>=12?Math.round((sessionState.waveN-10)/8*df.zm*zf):0,
   nbm=sessionState.waveN>=5?Math.round((1.5+(sessionState.waveN-5)*.45)*df.zm*zf):0,nac=sessionState.waveN>=10?Math.round((2+(sessionState.waveN-10)*.5)*df.zm*zf):0,nmi=sessionState.waveN>=15?Math.round((1+(sessionState.waveN-15)*.3)*df.zm*zf):0;
  const add=(type,c,sp)=>{for(let i=0;i<c;i++){if(zcount()>=720)break;const x=(p[0]+rnd(-sp,sp))*TS,y=(p[1]+rnd(-sp,sp))*TS;if(solidAt(x,y))continue;const zu=mkU(1,type,x,y,null,L);zu.hp*=1+.05*sessionState.waveN;zu.ph=an.ph;sessionState.units.push(zu)}};
  const n0=sessionState.units.length;if(swarmState.SWF>0)swQueue(L,an,nh*swarmState.SWF);else add('husk',nh,4.5);add('zombie',nz,3);add('runner',nr,3);add('brute',nb,2);add('bomber',nbm,3);add('acid',nac,3);add('miner',nmi,2);
  let tbb=null,tci=0;if(BASES.length){const R=terrainState.ROUTES[L];let bd=1e9;for(const b of BASES)if(b.alive){let k=-1;for(let j=0;j<R.wps.length;j++)if(hyp(R.wps[j][0]-b.tx,R.wps[j][1]-b.ty)<44){k=j;break}if(k>=0&&k<bd){bd=k;tbb=b;tci=k}}}
  if(tbb){for(let k=n0;k<sessionState.units.length;k++){sessionState.units[k].tb=tbb;sessionState.units[k].tcut=tci}wmsg='The horde turns on '+tbb.name}}
 snd('horn');sessionState.bannerT=5;sessionState.bannerS='WAVE '+sessionState.waveN;sessionState.bannerS2='Horde from '+sessionState.nextL.map(L=>terrainState.ROUTES[L].dir).join(' + ')+(sessionState.waveN%5===0?'  -  BRUTES!':'');const zn=ZNEW[sessionState.waveN];if(zn)sessionState.bannerS2='NEW ZOMBIES: '+zn[0]+'!  -  from '+sessionState.nextL.map(L=>terrainState.ROUTES[L].dir).join(' + ');
 sessionState.nextL=pickLanes();hudDisplayState.msgT=0;if(wmsg){hudDisplayState.msgS=wmsg;hudDisplayState.msgT=5}if(zn){hudDisplayState.msgS=zn[0]+': '+zn[1];hudDisplayState.msgT=10}}

const ZNEW={5:['BOMBERS','they blow up at your walls, or when they die - shoot them from afar, ideally inside the horde'],10:['ACID SPITTERS','their acid keeps burning men and walls - spread your troops'],15:['MINERS','they dig through cliffs, rock and woods to open a way for the horde']};

export let callWave = function callWave(){if(sessionState.over||!sessionState.inGame||sessionState.waveT<8)return;if(wavesState.waveOn){hudDisplayState.msgS='Finish this wave first: the next one comes after the rest time';hudDisplayState.msgT=3;snd('err');return}const b=Math.round((10+sessionState.waveN*4)*Math.max(1,sessionState.waveT/200));sessionState.res.g+=b;sessionState.waveT=0.01;hudDisplayState.msgS='Wave called early: +'+b+' gold';hudDisplayState.msgT=3};
/* ================= NIGHT & LIGHT =================
   one night per wave: it falls as the horde closes in on the base, lasts while the horde fights, dawns 25 s after it is beaten;
   the next wave only spawns once this one is finished, after the usual rest time;
   at night whatever stands outside the light is hurt by the darkness */

export const restT=()=>600*D_().tm;

/* the wave is finished when only a handful of stragglers is left (2%, or after 15 min at worst): the rest timer starts, and at dawn the sun burns the stragglers */
export function waveTick(){let rem=SW.n+swPending();for(const u of sessionState.units)if(u.t===1&&u.lane>=0)rem++;
 wavesState.hordeOn=wavesState.waveOn&&(SW.q.length>0||rem>Math.max(6,wavesState.WAVEZ*.02))&&sessionState.time-wavesState.waveST<900;if(wavesState.hordeOn)wavesState.hordeT=sessionState.time;
 else if(wavesState.waveOn){wavesState.waveOn=false;sessionState.waveT=sessionState.waveI=restT();wavesState.burnAt=sessionState.time+25;sessionState.bannerT=4;sessionState.bannerS='WAVE '+sessionState.waveN+' BEATEN';sessionState.bannerS2='Dawn is coming - next wave in '+mmss(sessionState.waveT);snd('victory')}
 if(wavesState.burnAt&&sessionState.time>=wavesState.burnAt){wavesState.burnAt=0;let nb=0;for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;SW.hp[i]=0;if(nb++<40)puff(SW.x[i],SW.y[i],'#ff9a3c',3,30,{T:.9,z:.5,vz:2.4,g:-.5,s:.1})}
  for(const u of sessionState.units)if(u.t===1&&u.lane>=0&&u.hp>0){u.hp=0;u.nokill=true;if(nb++<60)puff(u.x,u.y,'#ff9a3c',6,40,{T:1,z:.6,vz:2.6,g:-.5,s:.12})}if(nb){hudDisplayState.msgS='The sun burns the last zombies';hudDisplayState.msgT=3}}}

export const smst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

export function hordeDist(){const C=aliveC();let b=1e18;if(!C.length)return 1e9;const st=Math.max(1,Math.ceil(SW.n/700));for(let i=0;i<SW.n;i+=st)for(const c of C){const dx=SW.x[i]-c.x,dy=SW.y[i]-c.y,d=dx*dx+dy*dy;if(d<b)b=d}
 for(const u of sessionState.units)if(u.t===1&&u.lane>=0)for(const c of C){const dx=u.x-c.x,dy=u.y-c.y,d=dx*dx+dy*dy;if(d<b)b=d}return Math.sqrt(b)/TS}

export function setCallWaveHandler(handler) {
  callWave = handler;
}
