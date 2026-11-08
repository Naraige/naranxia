import { snd } from '../audio/sound.js';
import { rnd } from '../core/math.js';
import { T, TS } from './rules.js';
import { sessionState } from './session.js';
import { hordeDist, smst, wavesState } from './waves.js';
import { puff } from '../rendering/effects.js';
import { hudDisplayState } from '../ui/hud-state.js';

export const lightingState = {
  LITL: [],
  darkT: 0,
};

export function nightTick(dt){wavesState.nightCk-=dt;if(wavesState.nightCk>0)return;wavesState.nightCk=.5;const n0=wavesState.nightLv;if(wavesState.hordeOn){wavesState.hordeD=hordeDist();wavesState.nightLv=Math.max(wavesState.nightLv,1-smst(60,260,wavesState.hordeD))}else{wavesState.hordeD=1e9;if(sessionState.time-wavesState.hordeT>25)wavesState.nightLv=0}
 if(n0<.3&&wavesState.nightLv>=.3){hudDisplayState.msgS='Night falls - the horde is coming. The villagers shelter in the castle; keep your soldiers in the light!';hudDisplayState.msgT=6;snd('night')}}

export function nightSim(){if(!sessionState.inGame)return 0;return wavesState.hordeOn?wavesState.nightLv:wavesState.nightLv*(1-smst(0,25,sessionState.time-wavesState.hordeT))}

const LIGHTR={castle:16,keep:12,tower:10,gate:5,barracks:5,academy:5,market:5,storage:5,house:4,torch:7,forester:4,guild:5,observatory:6,granary:4,bell:5,sanctuary:7};

const lampWall=s=>s.type==='wall'&&((s.tiles[0][0]+s.tiles[0][1]*3)%5===0);

export function lightSources(){const L=[];for(const s of sessionState.structs){if(s.prog<1||s.hp<=0)continue;let r=LIGHTR[s.type]||(lampWall(s)?4:0);if(s.type==='castle'&&s.tier)r=18;if(r)L.push([s.x,s.y,r*TS])}
 for(const u of sessionState.units)if(u.hp>0&&u.t!==1&&!u.gar&&(u.type==='bannerman'||u.type==='captain'))L.push([u.x,u.y,(u.type==='bannerman'?5.5:4.5)*TS]);return L}
let darkMsg = -1e9;

export const litAt=(x,y)=>{for(const l of lightingState.LITL){const dx=x-l[0],dy=y-l[1];if(dx*dx+dy*dy<l[2]*l[2])return true}return false};

export function darkTick(dt){lightingState.darkT-=dt;if(lightingState.darkT>0)return;lightingState.darkT=.5;if(nightSim()<.55){if(lightingState.LITL.length){lightingState.LITL=[];for(const u of sessionState.units)u.dk=false}return}lightingState.LITL=lightSources();let hurt=0;
 for(const u of sessionState.units){if(u.t!==0||u.hp<=0||u.gar){u.dk=false;continue}u.dk=!litAt(u.x,u.y);if(u.dk){u.hp-=Math.max(.3,T[u.type].hp*.01);u.hurt=.1;hurt++;if(Math.random()<.35)puff(u.x,u.y,'#4a2a6a',2,18,{T:.9,z:.7,vz:.9,g:-.4,s:.1})}}
 for(const s of sessionState.structs){if(s.t!==0||s.prog<1||s.hp<=0||LIGHTR[s.type]||lampWall(s))continue;if(!litAt(s.x,s.y)&&s.hp>s.max*.25){s.hp=Math.max(s.max*.25,s.hp-Math.max(.4,s.max*.0015));if(Math.random()<.2)puff(s.x+rnd(-14,14),s.y+rnd(-14,14),'#2e1e40',2,22,{T:1.1,z:1,vz:.6,g:-.3,s:.13})}}
 if(hurt&&sessionState.time-darkMsg>45){darkMsg=sessionState.time;hudDisplayState.msgS='The darkness hurts! Stay near the castle, towers, torches or a bannerman';hudDisplayState.msgT=5}}
