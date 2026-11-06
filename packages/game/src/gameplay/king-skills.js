import { snd } from '../audio/sound.js';
import { dist } from '../core/math.js';
import { playersState } from './players.js';
import { TS } from './rules.js';
import { sessionState } from './session.js';
import { puff, ring, shake } from '../rendering/effects.js';
import { BTN, BTNH, GRN, GRNH } from '../ui/drawing.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { pill } from '../ui/minimap.js';
import { KB, kdisp } from '../ui/settings.js';

/* ================= KING SKILLS (#8) =================
   War cry [<]: every unit of yours within 10 tiles hits 35% harder for 8 s (45 s cooldown).
   Royal charge [>]: the King runs 2.2x faster and hits 1.8x harder for 4 s and throws every zombie within 3 tiles for damage (35 s cooldown).
   In co-op the key sends a command (kingSkill wrapper + case 'ks' in mpExec); timers use sim time and live on the King (units are saved whole). */
const KSK={cry:{cd:45,name:'War cry',key:'cry'},charge:{cd:35,name:'Royal charge',key:'charge'}};

export function kingOf(p){for(const u of sessionState.units)if(u.t===0&&u.type==='king'&&u.hp>0&&!u.kdead&&(u.pl|0)===p)return u;return null}

export const kskLeft=(k,n)=>Math.max(0,(k['sk_'+n]||0)-sessionState.time);

export function kingSkill0(n){const k=kingOf(playersState.CURPL|0);if(!k||!KSK[n]||kskLeft(k,n)>0)return;k['sk_'+n]=sessionState.time+KSK[n].cd;
 if(n==='cry'){for(const a of sessionState.units)if(a.t===0&&a.hp>0&&(a.pl|0)===(k.pl|0)&&dist(a.x,a.y,k.x,k.y)<TS*10)a.wcT=sessionState.time+8;ring(k.x,k.y,'#ffd23c',34,340);ring(k.x,k.y,'#fff3c0',20,200);snd('horn',k.x,k.y);shake(.15);hudDisplayState.msgS='War cry!';hudDisplayState.msgT=2}
 else{k.chT=sessionState.time+4;for(const e of sessionState.units)if(e.t===1&&e.hp>0&&dist(e.x,e.y,k.x,k.y)<TS*3){e.hp-=60+sessionState.waveN*2;e.hurt=.25}puff(k.x,k.y,'#e8d8a8',14,120,{T:.6,z:.2,vz:1.2,g:-.3,s:.2});snd('boom',k.x,k.y);shake(.2);hudDisplayState.msgS='Royal charge!';hudDisplayState.msgT=2}}

export function kingTick(){for(const u of sessionState.units)if(u.t===0&&u.type==='king'){u.spdK=u.chT>sessionState.time?2.2:1}}

export function kingBar(UW,y){const k=sessionState.started&&!sessionState.over?kingOf(playersState.CURPL|0):null;if(!k)return 0;const w=Math.min(112,(UW-24)/2),x0=Math.round(UW/2-w-3);
 [['cry','War cry','<'],['charge','Royal charge','>']].forEach(([n,lab,def],i)=>{const l=kskLeft(k,n),ky=kdisp(KB[n]||def),act=(n==='cry'?k.wcT:k.chT)>sessionState.time;
  pill(x0+i*(w+6),y,w,15,l>0?lab+' ['+ky+'] '+Math.ceil(l)+'s':lab+' ['+ky+']',act?GRN:BTN,act?GRNH:BTNH,()=>kingSkill(n),null,.68,act,l>0)});return 19}

export let kingSkill = function kingSkill(n){kingSkill0(n)};
/* Multiplayer installs a command handler during startup. */

export function setKingSkillHandler(handler) {
  kingSkill = handler;
}
