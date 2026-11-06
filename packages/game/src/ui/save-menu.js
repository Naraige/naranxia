import { snd } from '../audio/sound.js';
import { sessionState } from '../gameplay/session.js';
import { i18nDom, T_, TC, TTL } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { svApply } from '../persistence/restore.js';
import { svPack } from '../persistence/save-format.js';
import { SVST } from '../persistence/save-storage.js';
import { BTN, BTNH, frame, GRN, GRNH, PAN, RDB } from './drawing.js';
import { hudDisplayState } from './hud-state.js';
import { pill } from './minimap.js';

export const saveMenuState = {
  saveOpen: false,
  svList: null,
};

let svBusy = '';
let svSel = -1;

const svName=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return 'Wave '+sessionState.waveN+' - '+d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+'h'+p(d.getMinutes())};

async function svRefresh(){try{saveMenuState.svList=await SVST.list()}catch(e){saveMenuState.svList=[];svBusy='Saves are not available here'}}

export async function saveGame(name,quiet){if(MP.on||!sessionState.inGame||sessionState.over){if(!quiet){hudDisplayState.msgS=MP.on?'Saving is for solo games':'Nothing to save';hudDisplayState.msgT=3}return}
 svBusy='Saving...';try{const d=await svPack();await SVST.put(name||svName(),d,{date:Date.now(),wave:sessionState.waveN});svBusy='';if(!quiet){hudDisplayState.msgS='Game saved';hudDisplayState.msgT=3;snd('build')}await svRefresh()}catch(e){svBusy='';hudDisplayState.msgS='Save failed: '+e.message;hudDisplayState.msgT=4;console.error(e)}}

async function loadGame(name){svBusy='Loading...';try{const d=await SVST.get(name);if(!d)throw new Error('save not found');await svApply(d);svBusy=''}catch(e){svBusy='';hudDisplayState.msgS='Load failed: '+e.message;hudDisplayState.msgT=4;console.error(e)}}

export function drawSaves(UW,UH,cx){const W=Math.min(UW-12,420),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=8,H=UH-16;frame(X,Y,W,H,PAN,6);TTL(sessionState.inGame&&!MP.on?'Save / Load':'Load game',X+10,Y+7,1.35);
 if(!saveMenuState.svList){saveMenuState.svList=[];svRefresh()}let y=Y+30;
 if(sessionState.inGame&&!MP.on&&!sessionState.over){pill(X+10,y,W-20,20,svBusy||'Save the game now',GRN,GRNH,()=>{if(!svBusy)saveGame()},null,1);y+=28}
 if(svBusy&&!(sessionState.inGame&&!MP.on)){TC(svBusy,X+W/2,y,'#ffd25a',.9);y+=18}
 if(!saveMenuState.svList.length)T_('No saved games yet',X+12,y+4,'#b59773',.85);
 const rows=Math.max(1,Math.floor((Y+H-58-y)/22));
 saveMenuState.svList.slice(0,rows).forEach((s,i)=>{const yy=y+i*22;const d=new Date(s.t||0);T_(String(s.name).slice(0,34),X+12,yy+4,'#ead8ba',.82);
  pill(X+W-128,yy,62,18,'Load',BTN,BTNH,()=>{if(!svBusy)loadGame(s.name)},null,.8);pill(X+W-62,yy,52,18,'Delete',RDB,RDB,async()=>{await SVST.del(s.name);svRefresh()},null,.8)});
 if(window.NARX)pill(X+10,Y+H-24,120,16,'Open saves folder',BTN,BTNH,()=>NARX.openFolder(),null,.75);
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{saveMenuState.saveOpen=false},null,.9)}

export function initializeSaveMenu() {
  try{setTimeout(()=>{try{i18nDom()}catch(e){}},0)}catch(e){}
}
