import { snd } from '../audio/sound.js';
import { dist } from '../core/math.js';
import { walk } from '../gameplay/movement.js';
import { LPL, playersState } from '../gameplay/players.js';
import { TS } from '../gameplay/rules.js';
import { qNote } from '../gameplay/quests.js';
import { sessionState } from '../gameplay/session.js';
import { leaveSquad } from '../gameplay/squads.js';
import { L } from '../i18n/language.js';
import { MP } from './session.js';
import { puff } from '../rendering/effects.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { mkG } from '../world/pathfinding.js';

/* ---- co-op convoys: peasants carry resources to the partner's castle, then walk home and go back to work.
   Zombies can kill them on the way: what they carry is lost. Sent as a command, so both machines run the same errand. ---- */
function cvText(a){return[['g','gold'],['w','wood'],['s','stone'],['f','food']].filter(([k])=>a[k]>0).map(([k,n])=>a[k]+' '+L(n)).join(', ')}

function cvGo(u,c){u.o={x:c.x,y:c.y,g:mkG(c.tx+2,c.ty+2,u.x/TS,u.y/TS)}}

export function sendConvoy0(c){const p=playersState.CURPL|0,q=1-p,from=p?sessionState.CS2:sessionState.CS,to=q?sessionState.CS2:sessionState.CS;if(!MP.on||!sessionState.CS2||!from||!to||from.hp<=0||to.hp<=0)return;
 const R=playersState.RESP[p],a={g:Math.max(0,Math.min(Math.floor(R.g),c.g|0)),w:Math.max(0,Math.min(Math.floor(R.w),c.w|0)),s:Math.max(0,Math.min(Math.floor(R.s),c.s|0)),f:Math.max(0,Math.min(Math.floor(R.f||0),c.f|0))},tot=a.g+a.w+a.s+a.f;if(tot<=0)return;
 const P=sessionState.units.filter(u=>u.t===0&&u.hp>0&&(u.pl|0)===p&&u.type==='peasant'&&!u.gar&&!u.shel&&!u.cv);
 P.sort((x,y)=>((x.job||x.o||x.carry)?1:0)-((y.job||y.o||y.carry)?1:0)||dist(x.x,x.y,from.x,from.y)-dist(y.x,y.y,from.x,from.y)||x.uid-y.uid);
 const n=Math.min(P.length,Math.max(1,Math.min(5,Math.ceil(tot/100))));if(!n){if(p===LPL()){hudDisplayState.msgS='No peasant free to carry the convoy';hudDisplayState.msgT=3;snd('err')}return}
 R.g-=a.g;R.w-=a.w;R.s-=a.s;R.f=(R.f||0)-a.f;
 for(let i=0;i<n;i++){const u=P[i],sh=k=>Math.floor(a[k]/n)+(i<a[k]%n?1:0);u.cv={to:q,from:p,g:sh('g'),w:sh('w'),s:sh('s'),f:sh('f'),back:false,t:0,rt:0};
  u.job=null;u.role=null;u.tl=-1;u.work=0;u.carry=true;u.cj=a.g>=a.w&&a.g>=a.s?'g':a.w>=a.s?'w':'s';leaveSquad(u);cvGo(u,to)}
 if(p===LPL()){hudDisplayState.msgS='Convoy sent: '+cvText(a)+' ('+n+' porter'+(n>1?'s':'')+')';hudDisplayState.msgT=4}else MP.note=(MP.pname||'Your partner')+' sends you a convoy: '+cvText(a)}

export let convoyStep = function convoyStep(u,dt){const c=u.cv,dest=c.back?(c.from?sessionState.CS2:sessionState.CS):(c.to?sessionState.CS2:sessionState.CS);c.t+=dt;
 if(!dest||dest.hp<=0||!sessionState.structs.includes(dest)){u.cv=null;u.o=null;u.carry=false;return}
 if(dist(u.x,u.y,dest.x,dest.y)<TS*4.6){
  if(!c.back){const Rr=playersState.RESP[c.to];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;qNote('cv');
   if(c.to===LPL()){hudDisplayState.msgS='Convoy delivered: +'+cvText(c);hudDisplayState.msgT=4}else if(c.from===LPL()){hudDisplayState.msgS='Your convoy reached your partner';hudDisplayState.msgT=3}
   if(c.to===LPL())snd('convoy');puff(u.x,u.y,'#ffd23c',6,40);c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;u.carry=false;cvGo(u,c.from?sessionState.CS2:sessionState.CS)}
  else{u.cv=null;u.o=null;u.carry=false}
  return}
 /* no way through for two minutes: the goods go back to the sender */
 if(!c.back&&c.t>120){const Rr=playersState.RESP[c.from];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;u.carry=false;if(c.from===LPL()){hudDisplayState.msgS='The convoy cannot reach your partner: goods returned';hudDisplayState.msgT=4}cvGo(u,c.from?sessionState.CS2:sessionState.CS);return}
 if(!u.o){if(sessionState.time<c.rt)return;c.rt=sessionState.time+2;cvGo(u,dest)}
 walk(u,dt)};

export function setConvoyStepHandler(handler) {
  convoyStep = handler;
}
