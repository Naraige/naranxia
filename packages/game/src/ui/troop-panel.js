import { snd } from '../audio/sound.js';
import { LPL } from '../gameplay/players.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { canvasesState } from './canvases.js';
import { L, T_, tw } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { uiBtn } from './build-menu.js';
import { NAMES } from './build-catalog.js';
import { BTN, BTNH, BTNX, frame, PAN, TN } from './drawing.js';
import { hudState, U } from './hud.js';
import { dIc, IC } from './icons.js';
import { troopPanelState } from './panel-state.js';
import { settingsState } from './panel-state.js';

export { troopPanelState };

/* ---- troops panel: all your units by type, and what each group is doing; click a line or a task to select them ---- */
export const PLUN={peasant:'Peasants',knight:'Knights',spearman:'Spearmen',archer:'Archers',bannerman:'Bannermen',captain:'Captains',cannon:'Cannons',guard:'Royal guards',scout:'Scouts',engineer:'Engineers',envoy:'Envoys'};

function unitTask(u){if(u.cv)return'convoy';if(u.gar)return'tower';if(u.shel)return'shelter';if(u.type==='peasant'){if(u.role)return'r'+u.role;if(u.job)return'j'+u.job;return u.o?'move':'idle'}if(u.atk>0||u.cd>0)return'fight';if(u.o)return'move';return'guard'}

const TASKN={convoy:'Convoy',tower:'In a tower',shelter:'Sheltering',idle:'Idle',move:'Moving',fight:'Fighting',guard:'On guard',jw:'Wood',js:'Stone',jg:'Gold',jf:'Farming',jp:'Planting',jt:'Terraforming',jr:'Building',rb:'Builder',rr:'Repairer',rt:'Terraformer'};

const TROOPO=['peasant','knight','spearman','archer','bannerman','captain','scout','engineer','envoy','cannon','king','guard'],TRIC2={king:'crown',guard:'sword'};

function selectUnits(L){sessionState.units.forEach(u=>u.sel=false);for(const u of L)if(u.hp>0)u.sel=true;selectionState.selB=null;selectionState.castleSel=false;selectionState.SELBS=[];sessionState.mode=null;snd('select')}

export function drawTroops(UW,_UH){const mine=sessionState.units.filter(u=>u.t===0&&u.hp>0&&(!MP.on||(u.pl|0)===LPL()));const byT=new Map();
 for(const u of mine){let m=byT.get(u.type);if(!m){m=new Map();byT.set(u.type,m)}const k=unitTask(u);if(!m.has(k))m.set(k,[]);m.get(k).push(u)}
 const types=[...byT.keys()].sort((a,b)=>(TROOPO.indexOf(a)+99)%99-(TROOPO.indexOf(b)+99)%99),WM=Math.min(300,UW-20),x=8,y0=settingsState.TOPH+40,ttl='Troops ('+mine.length+')';
 /* look 2C: one card per type (icon, name, big count; click: select all of them) with one chip per task under it (click: select those). Real data only. */
 const cw=62,gap=3,hh=26,ch=12,ncol=Math.max(1,Math.min(types.length||1,Math.floor((WM+gap)/(cw+gap))));
 const cards=types.map((t,i)=>{const m=byT.get(t);return{t,tasks:[...m],all:[...m.values()].flat(),col:i%ncol,row:(i/ncol)|0}});
 const rowH=[];for(const c of cards){c.h=hh+c.tasks.length*(ch+1)+2;rowH[c.row]=Math.max(rowH[c.row]||0,c.h)}
 const rowY=[];let y=y0+17;for(let r=0;r<rowH.length;r++){rowY[r]=y;y+=rowH[r]+gap}
 if(!types.length)y+=12;
 const W=Math.max(types.length?ncol*(cw+gap)-gap:0,Math.ceil(tw(ttl,.82))+34,types.length?0:70);
 frame(x-3,y0-3,W+6,y-y0+(types.length?1:4),PAN,5);hudState.uiRects.push(U(x-3,y0-3,W+6,y-y0+4));
 TN(ttl,x+4,y0+2,'#f2d48a',.9);uiBtn(x+W-17,y0,16,13,BTN,BTNH,()=>{troopPanelState.troopsOpen=false},['Close [F2]'],(bx,by)=>dIc(IC.close,bx+2,by+.5,12));
 if(!types.length)T_('No troops',x+6,y0+18,'#b59773',.75);
 for(const c of cards){const t=c.t,cx=x+c.col*(cw+gap),cy=rowY[c.row],n=c.all.length,nm=L(NAMES[t]);
  uiBtn(cx,cy,cw,hh,BTN,BTNH,()=>selectUnits(c.all),[NAMES[t]+': select all'],(bx,by)=>{dIc(IC[TRIC2[t]||t]||IC.army,bx+3,by+2.5,14);const cs=1.45,ns=String(n);T_(ns,bx+cw-4-tw(ns,cs),by+3,'#ffffff',cs);let sc=.74;while(sc>.5&&tw(nm,sc)>cw-8)sc-=.03;T_(nm,bx+4,by+17,'#ffffff',sc)});
  c.tasks.forEach(([k,us],j)=>{const ty=cy+hh+1+j*(ch+1),lab=L(TASKN[k])+' '+us.length;
   uiBtn(cx,ty,cw,ch,BTNX,BTNH,()=>selectUnits(us),[TASKN[k]+': select them'],(bx,by)=>{const g=canvasesState.ctx;g.fillStyle=k==='fight'?'#e0605a':k==='idle'?'#e8b84a':'#7aa6e8';g.beginPath();g.arc(bx+6,by+ch/2,2.2,0,6.283);g.fill();let sc=.72;while(sc>.5&&tw(lab,sc)>cw-14)sc-=.03;T_(lab,bx+11,by+3,k==='fight'?'#ff9a8a':k==='idle'?'#ffd27a':'#d6dbe4',sc)})})}}
