import { snd } from '../audio/sound.js';
import { sessionState } from '../gameplay/session.js';
import { i18nDom, T_, TC, tw } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { svApply } from '../persistence/restore.js';
import { svPack } from '../persistence/save-format.js';
import { SVST } from '../persistence/save-storage.js';
import { BANNER } from '../rendering/structures.js';
import { canvasesState } from './canvases.js';
import { hudDisplayState } from './hud-state.js';
import { bevelBtn, kitScreen, listBegin, listEnd } from './menu-kit.js';

export const saveMenuState = {
  saveOpen: false,
  svList: null,
  delAsk: null,
  last: undefined,
};

let svBusy = '';
let svSel = -1;

const svName=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return 'Wave '+sessionState.waveN+' - '+d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+'h'+p(d.getMinutes())};

async function svRefresh(){try{saveMenuState.svList=await SVST.list()}catch(e){saveMenuState.svList=[];svBusy='Saves are not available here'}saveMenuState.last=saveMenuState.svList[0]||null}

/* title screen: look for the newest save once (Continue button), and load it */
export async function svPeek(){try{const l=await SVST.list();saveMenuState.last=l&&l[0]||null}catch(e){saveMenuState.last=null}}
export async function continueLast(){if(svBusy)return;const s=saveMenuState.last;if(s)await loadGame(s.name)}

export async function saveGame(name,quiet){if(MP.on||!sessionState.inGame||sessionState.over){if(!quiet){hudDisplayState.msgS=MP.on?'Saving is for solo games':'Nothing to save';hudDisplayState.msgT=3}return}
 svBusy='Saving...';try{const d=await svPack();await SVST.put(name||svName(),d,{date:Date.now(),wave:sessionState.waveN});svBusy='';if(!quiet){hudDisplayState.msgS='Game saved';hudDisplayState.msgT=3;snd('build')}await svRefresh()}catch(e){svBusy='';hudDisplayState.msgS='Save failed: '+e.message;hudDisplayState.msgT=4;console.error(e)}}

async function loadGame(name){svBusy='Loading...';try{const d=await SVST.get(name);if(!d)throw new Error('save not found');await svApply(d);svBusy=''}catch(e){svBusy='';hudDisplayState.msgS='Load failed: '+e.message;hudDisplayState.msgT=4;console.error(e)}}

/* Load game / Save-Load: one row per save (banner thumbnail, wave tag, name, date); the selected row unfolds its Load / Delete line */
export function drawSaves(UW,UH,fh,back){const ig=sessionState.inGame&&!MP.on,b=kitScreen(UW,UH,{key:'sav',title:ig?'Save / Load':'Load game',close:back,fh,maxW:480}),g=canvasesState.ctx;
 if(!saveMenuState.svList){saveMenuState.svList=[];svRefresh()}let y=b.y+2;
 if(ig&&!sessionState.over){bevelBtn(b.x,y,b.w,24,svBusy||'Save the game now','go',()=>{if(!svBusy)saveGame()},{sc:.9});y+=32}
 else if(svBusy){TC(svBusy,b.x+b.w/2,y,'#ffd25a',.9);y+=16}
 const fold=window.NARX?20:0,l=listBegin('sav',b.x,y,b.w,b.y+b.h-y-14-fold),list=saveMenuState.svList;
 l.section('Saved games');
 if(!list.length)l.para('No saved games yet','#b59773',.88);
 list.forEach(s=>{const on=svSel===s.name,wv=/^Wave (\d+)/.exec(String(s.name)),d=new Date(s.t||0);
  l.row({label:String(s.name).slice(0,30),raw:true,tag:wv?['Wave '+wv[1],'#e9b93c']:null,value:s.t?d.toLocaleDateString()+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'',vcol:'#b9b2a2',vsc:.72,on,
   ic:(x,yy,sz)=>{g.imageSmoothingEnabled=true;g.drawImage(BANNER,x+2,yy,sz*2/3,sz)},fn:()=>{svSel=on?-1:s.name;saveMenuState.delAsk=null}},24);
  if(on){const w2=Math.min(150,(b.w-30)/2),yy=l.y-1;g.fillStyle='rgba(240,205,115,.5)';g.fillRect(b.x,yy-2,2,26);
   bevelBtn(b.x+12,yy,w2,21,'Load','go',()=>{if(!svBusy)loadGame(s.name)},{sc:.9});
   bevelBtn(b.x+18+w2,yy,w2,21,saveMenuState.delAsk===s.name?'Sure?':'Delete','red',async()=>{if(saveMenuState.delAsk!==s.name){saveMenuState.delAsk=s.name;setTimeout(()=>{if(saveMenuState.delAsk===s.name)saveMenuState.delAsk=null},2500);return}saveMenuState.delAsk=null;svSel=-1;await SVST.del(s.name);svRefresh()},{sc:.9});l.gap(28)}});
 listEnd();
 if(fold)bevelBtn(b.x,b.y+b.h-fold-12,Math.min(150,b.w),18,'Open saves folder','dark',()=>NARX.openFolder(),{sc:.85});
 {const t=ig?'The autosave keeps your latest game.':'Select a save, then Load or Delete.';let sc=.75;while(sc>.6&&tw(t,sc)>b.w)sc-=.03;T_(t,b.x+1,b.y+b.h-9,'#948e80',sc)}}

export function initializeSaveMenu() {
  try{setTimeout(()=>{try{i18nDom()}catch(e){}},0)}catch(e){}
}
