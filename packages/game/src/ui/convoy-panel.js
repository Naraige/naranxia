import { snd } from '../audio/sound.js';
import { sessionState } from '../gameplay/session.js';
import { T_, TC } from '../i18n/language.js';
import { sendConvoy } from '../multiplayer/commands.js';
import { MP } from '../multiplayer/session.js';
import { uiBtn } from './build-menu.js';
import { BTN, BTNH, frame, GRN, GRNH, PAN, TN } from './drawing.js';
import { hudState, U } from './hud.js';
import { dIc, IC } from './icons.js';
import { pill } from './minimap.js';
import { settingsState } from './settings.js';

export const convoyPanelState = {
  convoyOpen: false,
};

/* ---- convoy panel: choose how much of each resource goes to the partner ---- */
export const CVA={g:0,w:0,s:0,f:0};

export function drawConvoy(UW,UH){if(!MP.on||!sessionState.CS2){convoyPanelState.convoyOpen=false;return}const W=Math.min(310,UW-16),H=154,x=Math.round((UW-W)/2),y=Math.round(Math.max(settingsState.TOPH+24,(UH-H)/2-60));
 frame(x,y,W,H,PAN,6);hudState.uiRects.push(U(x,y,W,H));TN('Convoy to '+(MP.pname||'your partner'),x+10,y+6,'#f2d48a',.84);
 [['g','coin'],['w','wood'],['s','stone'],['f','food']].forEach(([k,ic],i)=>{const yy=y+24+i*21,have=Math.max(0,Math.floor(sessionState.res[k]||0));CVA[k]=Math.max(0,Math.min(CVA[k],have));dIc(IC[ic],x+10,yy+1,14);
  const bt=(dx,lab,d)=>uiBtn(x+dx,yy,31,16,BTN,BTNH,()=>{CVA[k]=Math.max(0,Math.min(have,CVA[k]+d));snd('click')},null,(bx,by,bw)=>TC(lab,bx+bw/2,by+3.5,'#ffffff',.68));
  bt(30,'-100',-100);bt(64,'-25',-25);TC(String(CVA[k]),x+Math.round(W/2)+2,yy+3,CVA[k]?'#ffffff':'#8a8a8a',.9);bt(W-104,'+25',25);bt(W-70,'+100',100);T_(String(have),x+W-34,yy+3.5,'#b59773',.62)});
 const tot=CVA.g+CVA.w+CVA.s+CVA.f,np=Math.max(1,Math.min(5,Math.ceil(tot/100)));
 T_(tot?np+' porter'+(np>1?'s':'')+' - zombies can stop them':'Choose what to send',x+10,y+H-34,'#b59773',.64);
 pill(x+W-152,y+H-24,74,18,'Send',GRN,GRNH,()=>{if(!tot)return;sendConvoy({...CVA});CVA.g=CVA.w=CVA.s=CVA.f=0;convoyPanelState.convoyOpen=false},null,.85,false,!tot);
 pill(x+W-74,y+H-24,66,18,'Cancel',BTN,BTNH,()=>{convoyPanelState.convoyOpen=false},null,.85)}
