import { cbOn, cbSet, pref, setPref } from '../core/prefs.js';
import { applyVol, saveVol, snd, sndOn, soundState, toggleSound } from '../audio/sound.js';
import { startGame } from '../gameplay/lifecycle.js';
import { sessionState } from '../gameplay/session.js';
import { LANG, LANGS, languageState, T_, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { saveTheme } from '../rendering/kingdom-banner.js';
import { rs } from '../rendering/resolution.js';
import { DRS, GQU, renderer, sceneState, SHADOWS, sun } from '../rendering/scene.js';
import { bugReport } from '../debug/tools.js';
import { HK } from './build-menu.js';
import { canvasesState } from './canvases.js';
import { applyCB } from './drawing.js';
import { bevelBtn, keyChip, kitRow, kitScreen, listBegin, listEnd } from './menu-kit.js';
import { hudDisplayState } from './hud-state.js';
import { THEME } from './kingdom-theme.js';
import { FF, FFP } from './typography.js';

export const settingsState = {
  nameBox: null,
  TOPH: 28,
  fromGame: false,
  setupOpen: false,
  settingsOpen: false,
  rebind: null,
  sliderDrag: null,
};

export let nmI;

export function placeInput(){if(!settingsState.nameBox||sessionState.started){nmI.style.display='none';return}const k=hudDisplayState.UIS/inputState.DPR,s=nmI.style;s.display='block';s.left=(settingsState.nameBox.x*k)+'px';s.top=(settingsState.nameBox.y*k)+'px';s.width=(settingsState.nameBox.w*k)+'px';s.height=(settingsState.nameBox.h*k)+'px';s.fontSize=(9.5*k)+'px';if(document.activeElement!==nmI&&nmI.value!==THEME.n)nmI.value=THEME.n}

export let uiMul=1;

const KDEF={cry:'<',charge:'>',cannon:'/',peasant:'1',knight:'2',archer:'3',bannerman:'4',captain:'5',wall:'6',gate:'7',tower:'8',path:'9',ballista:'b',trebuchet:'t',raise:'y',dig:'u',army:'q',idle:'.',form:'v',rotate:'r',sound:'o',wave:'n',home:'h',map:'m',upgrade:'g',barracks:'c',farm:'j',peas:'e',storage:'k',house:'0',movec:',',academy:';',market:':',forester:'[',guild:']',torch:"'",rally:'-',rallyc:'=',ramp:'i',tier:'l',demolish:'p',pause:' ',speed:'f',up:'w',down:'s',left:'a',right:'d',rotL:'z',rotR:'x'};

const ACTL={cry:'King: war cry',charge:'King: royal charge',king:'Summon King Naraige',guard:'Train a royal guard',cannon:'Train cannon',movec:'Move castle',rotate:'Rotate building',peasant:'Train peasant',knight:'Train knight',archer:'Train archer',bannerman:'Train bannerman',captain:'Train captain',upgrade:'Masonry research',barracks:'Build barracks',farm:'Build farm',storage:'Build storage',house:'Build house',academy:'Build academy',market:'Build market',forester:'Build forester hut',guild:'Build builders guild',torch:'Build torch',rally:'Barracks rally point',rallyc:'Castle rally point',peas:'Select all peasants',tier:'Wood / stone tier',demolish:'Demolish building',ramp:'Dig a ramp',wall:'Build wall',gate:'Build gate',tower:'Build tower',path:'Build path',ballista:'Ballista',trebuchet:'Trebuchet',raise:'Raise ground',dig:'Dig ground',army:'Select army',idle:'Idle peasants',form:'Formation',sound:'Mute sound',wave:'Call wave',home:'Back to base',map:'World map',pause:'Pause',speed:'Game speed',up:'Camera up',down:'Camera down',left:'Camera left',right:'Camera right',rotL:'Turn camera left',rotR:'Turn camera right'};

export let KB;

export const kdisp=k=>k===' '?'Space':k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1);

function syncHK(){for(const a of['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path','upgrade','barracks','farm','storage','house','academy','market','forester','guild','torch','rally','rallyc','movec','rotate','ramp','tier','demolish','ballista','trebuchet','raise','dig','army','idle','form'])HK[a]=kdisp(KB[a])}

export function saveKB(){try{localStorage.setItem('dk_keys',JSON.stringify(KB))}catch(e){}syncHK()}

function setGfx(v){sceneState.GQ=v?1:0;GQU.value=sceneState.GQ;try{localStorage.setItem('dk_gfx',sceneState.GQ)}catch(e){}DRS.lv=0;DRS.sum=DRS.cs=DRS.n=DRS.t=DRS.ok=DRS.chk=0;DRS.noDn=DRS.noUp=0;rs();if(SHADOWS){const ss=sceneState.GQ?2048:1024;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}renderer.shadowMap.needsUpdate=true}}

let setTab=0;

export const settingsDebug = { tab(n) { setTab = n } };

const tutOn=()=>{try{return localStorage.getItem('dk_tut')!=='1'}catch(e){return true}};
const tutSet=on=>{try{if(on)localStorage.removeItem('dk_tut');else localStorage.setItem('dk_tut','1')}catch(e){}};

/* tabs: 0 Game, 1 Display & sound (2 = its old Sound half), 3 Controls. Template: tabs as bevelled buttons, sections, full-width rows with the value on the right. */
export function drawSettings(UW,UH,fh,back){const tb=setTab===2?1:setTab,TABS=[['Game',0],['Display & sound',1],['Controls',3]],ti=Math.max(0,TABS.findIndex(t=>t[1]===tb));
 const b=kitScreen(UW,UH,{key:'set'+tb,title:'Settings',close:back,fh,maxW:tb===3?620:500,tabs:TABS.map(t=>[t[0],()=>{setTab=t[1];settingsState.rebind=null}]),tab:ti});
 const tog=(l,lab,on,set)=>l.row({label:lab,opts:[['On',on,()=>set(true)],['Off',!on,()=>set(false)]],fn:()=>set(!on)}),prow=(l,lab,k,d)=>tog(l,lab,pref(k,d),v=>setPref(k,v));
 if(tb===3){let y=b.y+1;{const t='Click a key, then press the new one  (Esc cancels)',rw=Math.min(110,b.w*.34);let sc=.78;while(sc>.6&&tw(t,sc)>b.w-rw-8)sc-=.03;T_(t,b.x+1,y+5,'#d9b27a',sc);bevelBtn(b.x+b.w-rw,y,rw,18,'Reset keys','dark',()=>{KB={...KDEF};saveKB()},{sc:.85})}y+=25;
  const l=listBegin('set3',b.x,y,b.w,b.y+b.h-y),acts=Object.keys(KDEF),cols=Math.max(1,Math.min(3,Math.floor(b.w/170))),cw=(b.w-(cols-1)*5)/cols,g=canvasesState.ctx;
  l.section('Keyboard');
  for(let i=0;i<acts.length;i+=cols){for(let c=0;c<cols&&i+c<acts.length;c++){const a=acts[i+c],on=settingsState.rebind===a,t=on?'...':kdisp(KB[a]);
    kitRow(b.x+c*(cw+5),l.y,cw,18,{label:ACTL[a],sc:.8,on,fn:()=>{settingsState.rebind=a},right:(rx,yy,h)=>{g.font='700 8px '+FFP;const w=Math.max(14,Math.ceil(g.measureText(t).width)+8);keyChip(rx-w+3,yy+(h-13)/2,t);return w}})}l.gap(21)}
  listEnd();return}
 const l=listBegin('set'+tb,b.x,b.y+1,b.w,b.h-1);
 if(tb===1){l.section('Sound');
  l.row({label:'Music',slider:{val:soundState.vM,set:v=>{soundState.vM=v;applyVol();saveVol()}}});
  l.row({label:'Sound effects',slider:{val:soundState.vS,set:v=>{soundState.vS=v;applyVol();saveVol();snd('tick')}}});
  l.section('Display');
  l.row({label:'Graphics',opts:[['Ultra HD',1],['Fast',0]].map(([n,v])=>[n,sceneState.GQ===v,()=>setGfx(v)]),fn:()=>setGfx(sceneState.GQ?0:1)});
  {const SZ=[['Small',.8],['Normal',1],['Large',1.25],['Huge',1.6]],set=v=>{uiMul=v;try{localStorage.setItem('dk_ui',v)}catch(e){}rs()},ci=Math.max(0,SZ.findIndex(z=>Math.abs(uiMul-z[1])<.01));
   l.row({label:'Interface size',opts:SZ.map(([n,v],i)=>[n,i===ci,()=>set(v)]),fn:()=>set(SZ[(ci+1)%SZ.length][1])})}
  
  tog(l,'Colour-blind mode',cbOn(),v=>{cbSet(v);applyCB()})}
 else{l.section('General');
  l.row({label:'Language',value:LANGS[LANG][0],raw:false,fn:()=>{languageState.langOpen=true;settingsState.settingsOpen=false}});
  tog(l,'Tutorial',tutOn(),tutSet);prow(l,'Pause when away','ap',true);prow(l,'Autosave','as',true);
  {const on=pref('qi',false);l.row({label:'Studio intro',opts:[['First launch only',on,()=>setPref('qi',true)],['Every launch',!on,()=>setPref('qi',false)]],fn:()=>setPref('qi',!on)})}
  l.section('Accessibility');prow(l,'Reduce motion','rm',false);
  l.section('Help');
  l.row({label:'Report a bug [F8]',fn:()=>{settingsState.settingsOpen=false;bugReport()}})}
 listEnd()}

export function settingsBack(){settingsState.settingsOpen=false;settingsState.rebind=null;setTab=0;if(settingsState.fromGame){settingsState.fromGame=false;startGame()}}

export function initializeSettings() {
  nmI = document.createElement('input');
  nmI.type='text';
  nmI.maxLength=18;
  nmI.spellcheck=false;
  nmI.autocomplete='off';
  nmI.setAttribute('aria-label','Kingdom name');

  Object.assign(nmI.style,{position:'fixed',display:'none',zIndex:5,color:'#f2e4c4',background:'#0b0f17',border:'1px solid #c9a24f',borderRadius:'0',padding:'0 7px',outline:'none',boxSizing:'border-box',fontWeight:'400',fontFamily:FF});

  document.body.appendChild(nmI);
  nmI.value=THEME.n;
  nmI.oninput=()=>{THEME.n=nmI.value.slice(0,18)||'Nameless';saveTheme()};
  nmI.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')nmI.blur()};
  try{uiMul=+localStorage.getItem('dk_ui')||1}catch(e){}
  KB = {...KDEF};
  try{Object.assign(KB,JSON.parse(localStorage.getItem('dk_keys')||'{}'))}catch(e){}
  syncHK();
  applyCB();
}
