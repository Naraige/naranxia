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
 /* no land route for the first porter (river, castle on a cliff without a ramp): said at once, nothing leaves */
 {const g=mkG(to.tx+2,to.ty+2,P[0].x/TS,P[0].y/TS);g.mk();if(!g.S||(g.alt&&dist(g.alt.x,g.alt.y,to.x,to.y)>TS*(CVE-1))){if(p===LPL()){hudDisplayState.msgS='The convoy cannot reach your partner';hudDisplayState.msgT=4;snd('err')}return}}
 R.g-=a.g;R.w-=a.w;R.s-=a.s;R.f=(R.f||0)-a.f;
 for(let i=0;i<n;i++){const u=P[i],sh=k=>Math.floor(a[k]/n)+(i<a[k]%n?1:0);u.cv={to:q,from:p,g:sh('g'),w:sh('w'),s:sh('s'),f:sh('f'),back:false,t:0,tt:0,rt:0};
  u.job=null;u.role=null;u.tl=-1;u.work=0;u.carry=true;u.cj=a.g>=a.w&&a.g>=a.s?'g':a.w>=a.s?'w':'s';leaveSquad(u);cvGo(u,to)}
 if(p===LPL()){hudDisplayState.msgS='Convoy sent: '+cvText(a)+' ('+n+' porter'+(n>1?'s':'')+')';hudDisplayState.msgT=4}else MP.note=(MP.pname||'Your partner')+' sends you a convoy: '+cvText(a)}

/* a porter is there within 4.6 tiles of the castle, or within 8 when its path ends there (castle on a ledge: the foot of it counts) */
const CVN=4.6,CVE=8,CVW=120,CVMAX=900;

function cvHome(c){return c.from?sessionState.CS2:sessionState.CS}

function cvDrop(u,c){const Rr=playersState.RESP[c.to];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;qNote('cv');
 if(c.to===LPL()){hudDisplayState.msgS='Convoy delivered: +'+cvText(c);hudDisplayState.msgT=4}else if(c.from===LPL()){hudDisplayState.msgS='Your convoy reached your partner';hudDisplayState.msgT=3}
 if(c.to===LPL())snd('convoy');puff(u.x,u.y,'#ffd23c',6,40);c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;c.tt=0;u.carry=false;cvGo(u,cvHome(c))}

export let convoyStep = function convoyStep(u,dt){const c=u.cv,dest=c.back?cvHome(c):(c.to?sessionState.CS2:sessionState.CS);c.t+=dt;c.tt=(c.tt||0)+dt;
 if(!dest||dest.hp<=0||!sessionState.structs.includes(dest)){u.cv=null;u.o=null;u.carry=false;return}
 if(dist(u.x,u.y,dest.x,dest.y)<TS*CVN){if(!c.back)cvDrop(u,c);else{u.cv=null;u.o=null;u.carry=false}return}
 /* two minutes without getting closer along the path (c.t), or a quarter of an hour in all: the goods go back to the sender; a porter that cannot walk home goes back to work where it is */
 if(c.t>CVW||c.tt>CVMAX){if(c.back){u.cv=null;u.o=null;u.carry=false;return}
  const Rr=playersState.RESP[c.from];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;c.tt=0;u.carry=false;if(c.from===LPL()){hudDisplayState.msgS='The convoy cannot reach your partner: goods returned';hudDisplayState.msgT=4}cvGo(u,cvHome(c));return}
 if(!u.o){if(sessionState.time<c.rt)return;c.rt=sessionState.time+2;cvGo(u,dest)}
 walk(u,dt);if(u.pfT===sessionState.time)c.t=0; /* stepF notes the tick of the last progress of a peasant along its path field */
 if(!u.o&&dist(u.x,u.y,dest.x,dest.y)<TS*CVE){if(!c.back)cvDrop(u,c);else{u.cv=null;u.carry=false}}};

export function setConvoyStepHandler(handler) {
  convoyStep = handler;
}
