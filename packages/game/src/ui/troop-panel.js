import { snd } from '../audio/sound.js';
import { LPL } from '../gameplay/players.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { L, T_, tw } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { NAMES, uiBtn } from './build-menu.js';
import { BTN, BTNH, BTNX, frame, PAN, TN } from './drawing.js';
import { hudState, U } from './hud.js';
import { dIc, IC } from './icons.js';
import { settingsState } from './settings.js';

export const troopPanelState = {
  troopsOpen: false,
};

/* ---- troops panel: all your units by type, and what each group is doing; click a line or a task to select them ---- */
export const PLUN={peasant:'Peasants',knight:'Knights',archer:'Archers',bannerman:'Bannermen',captain:'Captains',cannon:'Cannons',guard:'Royal guards',scout:'Scouts',engineer:'Engineers'};

function unitTask(u){if(u.cv)return'convoy';if(u.gar)return'tower';if(u.shel)return'shelter';if(u.type==='peasant'){if(u.role)return'r'+u.role;if(u.job)return'j'+u.job;return u.o?'move':'idle'}if(u.atk>0||u.cd>0)return'fight';if(u.o)return'move';return'guard'}

const TASKN={convoy:'Convoy',tower:'In a tower',shelter:'Sheltering',idle:'Idle',move:'Moving',fight:'Fighting',guard:'On guard',jw:'Wood',js:'Stone',jg:'Gold',jf:'Farming',jp:'Planting',jt:'Terraforming',jr:'Building',rb:'Builder',rr:'Repairer',rt:'Terraformer'};

const TROOPO=['peasant','knight','archer','bannerman','captain','scout','engineer','cannon','king','guard'],TRIC2={king:'crown',guard:'sword'};

function selectUnits(L){sessionState.units.forEach(u=>u.sel=false);for(const u of L)if(u.hp>0)u.sel=true;selectionState.selB=null;selectionState.castleSel=false;selectionState.SELBS=[];sessionState.mode=null;snd('select')}

export function drawTroops(UW,UH){const mine=sessionState.units.filter(u=>u.t===0&&u.hp>0&&(!MP.on||(u.pl|0)===LPL()));const byT=new Map();
 for(const u of mine){let m=byT.get(u.type);if(!m){m=new Map();byT.set(u.type,m)}const k=unitTask(u);if(!m.has(k))m.set(k,[]);m.get(k).push(u)}
 const types=[...byT.keys()].sort((a,b)=>(TROOPO.indexOf(a)+99)%99-(TROOPO.indexOf(b)+99)%99),WM=Math.min(300,UW-20),x=8,lh=14,y0=settingsState.TOPH+40,ttl='Troops ('+mine.length+')';
 /* one line per type: the type on the left (click: select all of them), what they are doing on the right (click: select those) */
 let tw0=58;for(const t of types){let n=0;for(const us of byT.get(t).values())n+=us.length;tw0=Math.max(tw0,tw(L(NAMES[t])+'  '+n,.74)+22)}tw0=Math.min(Math.ceil(tw0),Math.round(WM*.46));
 const rows=[],c0=x+tw0+5;let y=y0+17,mx=x+tw(ttl,.82)+30;
 for(const t of types){const m=byT.get(t);rows.push({t,y,all:[...m.values()].flat()});let cx=c0;
  for(const[k,us]of m){const lab=L(TASKN[k])+' '+us.length,w=Math.ceil(tw(lab,.66))+10;if(cx+w>x+WM&&cx>c0){y+=lh;cx=c0}rows.push({k,us,lab,x:cx,y,w});cx+=w+3;mx=Math.max(mx,cx)}
  y+=lh+2}
 if(!types.length)y+=12;const W=Math.min(WM,Math.max(mx-x,tw0+40));
 frame(x-3,y0-3,W+6,y-y0+4,PAN,5);hudState.uiRects.push(U(x-3,y0-3,W+6,y-y0+4));
 TN(ttl,x+4,y0+3,'#f2d48a',.82);uiBtn(x+W-17,y0,16,13,BTN,BTNH,()=>{troopPanelState.troopsOpen=false},['Close [F2]'],(bx,by)=>dIc(IC.close,bx+2,by+.5,12));
 if(!types.length)T_('No troops',x+6,y0+18,'#b59773',.7);
 for(const r of rows){if(r.t){const t=r.t;uiBtn(x,r.y,tw0,lh,BTN,BTNH,()=>selectUnits(r.all),[NAMES[t]+': select all'],(bx,by)=>{dIc(IC[TRIC2[t]||t]||IC.army,bx+2,by+1,12);T_(L(NAMES[t])+'  '+r.all.length,bx+17,by+2.5,'#ffffff',.74)})}
  else uiBtn(r.x,r.y,r.w,lh,BTNX,BTNH,()=>selectUnits(r.us),[TASKN[r.k]+': select them'],(bx,by)=>T_(r.lab,bx+5,by+2.5,r.k==='fight'?'#ff9a8a':r.k==='idle'?'#ffd27a':'#d6dbe4',.66))}}
