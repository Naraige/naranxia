import { snd } from '../audio/sound.js';
import { qActive, qById, QCH, qCur, qList, qProg, questsState } from '../gameplay/quests.js';
import { sessionState } from '../gameplay/session.js';
import { L, T_, TC, TTL, tw } from '../i18n/language.js';
import { questSwitch } from '../multiplayer/commands.js';
import { canvasesState } from './canvases.js';
import { BTN, BTNH, CHAT, frame, GRN, GRNH, PAN, RDB, UIT } from './drawing.js';
import { hudState, U } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { kitFrame } from './menu-kit.js';
import { pill } from './minimap.js';
import { questMarker } from './quest-marker.js';
import { settingsState } from './settings.js';
import { btnReset } from './typography.js';

/* ================= QUEST PANEL AND QUEST LOG (display only) =================
   Reads gameplay/quests.js and never writes simulation state: the On / Off button of the log goes through questSwitch (a command in co-op).
   Panel: top left under the resource bar (title, what to do, progress, reward); [Log] opens the log, [x] folds it into a small
   "Quests" button (kept in localStorage dk_qhide, per player, not in the save). In co-op the shared goals line (objBar) is centred
   on the first row under the top bar and this panel starts 38 px lower on the left, so the two never share a row. */
export const questPanelState = { log: false };

let hide=null;
const hidden=()=>{if(hide===null){try{hide=localStorage.getItem('dk_qhide')==='1'}catch(e){hide=false}}return hide};
const setHidden=v=>{hide=!!v;try{localStorage.setItem('dk_qhide',v?'1':'0')}catch(e){}};

const RWN={g:'gold',w:'wood',s:'stone',f:'food'},RWC={g:'#ffd23c',w:'#e8b27a',s:'#d4dae6',f:'#f2c14e'};
const rwd=q=>{for(const k in q.r)return ['+'+q.r[k]+' '+RWN[k],RWC[k]];return ['','#fff']};

/* word wrap of a translated text (the lines are drawn as they are) */
function wrap(s,sc,maxW){const W=L(s).split(' '),out=[];let cur='';for(const w of W){const t=cur?cur+' '+w:w;if(cur&&tw(t,sc)>maxW){out.push(cur);cur=w}else cur=t}if(cur)out.push(cur);return out}

function box(x,y,s,st){const g=canvasesState.ctx;g.fillStyle=st===2?'#1d5a2a':'rgba(0,0,0,.45)';g.fillRect(x,y,s,s);g.strokeStyle=st===2?'#7be08a':st===1?'#f2c862':'#6b7384';g.lineWidth=1;g.strokeRect(x+.5,y+.5,s-1,s-1);
 if(st===2){g.strokeStyle='#d8ffd8';g.lineWidth=Math.max(1.2,s*.17);g.beginPath();g.moveTo(x+s*.22,y+s*.52);g.lineTo(x+s*.43,y+s*.74);g.lineTo(x+s*.8,y+s*.26);g.stroke()}
 else if(st===1){g.fillStyle='#f2c862';g.fillRect(x+s*.36,y+s*.36,Math.max(1,s*.28),Math.max(1,s*.28))}
 else if(st===3){g.fillStyle='#6b7384';g.fillRect(x+s*.25,y+s*.45,Math.max(1,s*.5),1)}}

function pbar(x,y,w,h,f,col){const g=canvasesState.ctx;g.fillStyle='#000';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle='#2b2f3a';g.fillRect(x,y,w,h);g.fillStyle=col;g.fillRect(x,y,Math.round(w*Math.max(0,Math.min(1,f))),h);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x,y,Math.round(w*Math.max(0,Math.min(1,f))),1)}

const count=(LS,Q)=>{let n=0;for(const q of LS)if(Q.d[q.id])n++;return n};

export function questPanel(UW,UH){hudDisplayState.qbox=null;if(!qActive()||sessionState.over||sessionState.showMap||questPanelState.log)return;
 const Q=questsState.Q,LS=qList(),N=LS.length,nd=count(LS,Q),x=4,y=settingsState.TOPH+Math.max(38,hudDisplayState.barsH|0),lastQ=Q.last?qById(Q.last):null,just=!!lastQ&&sessionState.time-Q.dt<5&&sessionState.time>=Q.dt,cur=qCur();
 if(hidden()||(!cur&&!just)){const lab='Quests '+nd+'/'+N,w=tw(lab,.75)+14;hudDisplayState.qbox=[x,y,w,15];hudState.uiRects.push(U(x,y,w,15));pill(x,y,w,15,lab,BTN,BTNH,()=>{questPanelState.log=true;snd('click')},null,.75);return}
 const w=Math.min(184,UW-8),q=just?lastQ:cur,num=Math.max(0,LS.indexOf(q))+1,dl=wrap(q.d,.75,w-14).slice(0,3),h=30+dl.length*10+(just?13:22);
 hudDisplayState.qbox=[x,y,w,h];frame(x,y,w,h,CHAT,6);hudState.uiRects.push(U(x,y,w,h));
 T_('Quest '+num+'/'+N,x+7,y+5,'#f2d48a',.72);
 pill(x+w-17,y+3,14,12,'x',BTN,BTNH,()=>{setHidden(true);snd('click')},null,.7);
 {const lw=Math.max(26,tw('Log',.7)+10);pill(x+w-20-lw,y+3,lw,12,'Log',BTN,BTNH,()=>{questPanelState.log=true;snd('click')},null,.7)}
 box(x+7,y+17,9,just?2:1);{let sc=.9;while(sc>.6&&tw(q.t,sc)>w-27)sc-=.03;T_(q.t,x+20,y+17,just?'#9af0a8':'#ffffff',sc)}
 let yy=y+29;for(const s of dl){T_(s,x+7,yy,'#c9d2e0',.75);yy+=10}
 const [rt,rc]=rwd(q);
 if(just){T_('Quest complete!',x+7,yy+2,'#9af0a8',.75);T_(rt,x+w-7-tw(rt,.75),yy+2,rc,.75);return}
 const p=qProg(q),ps=p+'/'+q.n,bw=w-14-tw(ps,.72)-6;pbar(x+7,yy+4,bw,4,p/q.n,'#e0b84a');T_(ps,x+w-7-tw(ps,.72),yy+1,'#ffffff',.72);
 T_('Reward',x+7,yy+12,'#9aa3b4',.7);T_(rt,x+11+tw('Reward',.7),yy+12,rc,.7)}

/* the log: every quest by chapter, done / active / to come, the reward of each, and the On / Off and panel buttons */
export function questLog(UW,UH){questMarker(UW,UH,questPanelState.log);if(!questPanelState.log)return;const Q=questsState.Q;if(!Q||sessionState.over){questPanelState.log=false;return}
 const g=canvasesState.ctx,LS=qList(),N=LS.length,nd=count(LS,Q),cur=qCur();g.fillStyle='rgba(5,8,16,.78)';g.fillRect(0,0,UW,UH);hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];btnReset();/* texts of the log must not take the ink of HUD buttons lying under it */
 const rows=[];let lc=-1;for(const q of LS){if(q.c!==lc){lc=q.c;rows.push({h:q.c})}rows.push({q})}
 const availH=UH-12-30-44,cols=availH/rows.length<11&&UW>=440?2:1,per=Math.ceil(rows.length/cols),w=Math.min(UW-12,cols===2?600:330),rh=Math.max(8,Math.min(13,Math.floor(availH/per))),sc=Math.min(.85,rh/13),
  h=30+per*rh+44,x=Math.round((UW-w)/2),y=Math.max(6,Math.round((UH-h)/2)),cw=(w-16-(cols-1)*14)/cols;
 frame(x,y,w,h,PAN,6);kitFrame(x+2,y+2,w-4,h-4,false,.5);TTL('Quest log',x+w/2,y+8,1.25,'center');
 T_(nd+'/'+N,x+w-12-tw(nd+'/'+N,.8),y+11,'#f2d48a',.8);
 rows.forEach((r,k)=>{const cx=x+8+Math.floor(k/per)*(cw+14),ry=y+28+(k%per)*rh;
  if(r.h!==undefined){T_(QCH[r.h],cx,ry+rh-9*sc-1,'#f2d48a',sc);g.fillStyle=UIT.goldDim;g.fillRect(Math.round(cx+tw(QCH[r.h],sc)+5),Math.round(ry+rh-4),Math.max(0,Math.round(cw-tw(QCH[r.h],sc)-5)),1);return}
  const q=r.q,dn=Q.d[q.id]|0,st=dn===2?3:dn?2:q===cur?1:0,bs=Math.min(9,rh-2),[rt,rc]=rwd(q),right=st===3?'':st===1&&Q.on?qProg(q)+'/'+q.n+'  '+L(rt):L(rt),rw=tw(right,sc*.9);
  if(st===1){g.fillStyle='rgba(242,200,98,.12)';g.fillRect(cx-2,ry,cw+4,rh)}
  box(cx+2,ry+(rh-bs)/2,bs,st);let ts=sc;while(ts>.5&&tw(q.t,ts)>cw-20-rw-6)ts-=.03;
  T_(q.t,cx+16,ry+(rh-9*ts)/2,st===2?'#9af0a8':st===1?'#ffffff':'#8f98a8',ts);if(right)T_(right,cx+cw-rw,ry+(rh-9*sc*.9)/2,st===0?'#7d8696':rc,sc*.9)});
 const fy=y+28+per*rh+4;
 {const s=!Q.on?'Quests are off':cur?cur.d:'All quests complete';let ds=.8;while(ds>.55&&tw(s,ds)>w-20)ds-=.03;TC(s,x+w/2,fy+2,Q.on&&cur?'#ffffff':'#c9d2e0',ds)}
 const bw=Math.min(104,(w-16-12)/3),bx=x+(w-(bw*3+12))/2,by=fy+17;
 pill(bx,by,bw,17,Q.on?'Turn quests off':'Turn quests on',Q.on?RDB:GRN,Q.on?BTNH:GRNH,()=>{questSwitch(!Q.on);snd('click')},null,.75);
 pill(bx+bw+6,by,bw,17,hidden()?'Show panel':'Hide panel',BTN,BTNH,()=>{setHidden(!hidden());snd('click')},null,.75);
 pill(bx+2*(bw+6),by,bw,17,'Close',BTN,BTNH,()=>{questPanelState.log=false;snd('click')},null,.75)}
