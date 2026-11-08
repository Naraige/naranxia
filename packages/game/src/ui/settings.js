import { pref, setPref } from '../core/prefs.js';
import { applyVol, saveVol, sndOn, soundState, toggleSound } from '../audio/sound.js';
import { startGame } from '../gameplay/lifecycle.js';
import { sessionState } from '../gameplay/session.js';
import { LANG, langBtn, languageState, T_, TC, TTL, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { saveTheme } from '../rendering/kingdom-banner.js';
import { rs } from '../rendering/resolution.js';
import { DRS, GQU, renderer, sceneState, SHADOWS, sun } from '../rendering/scene.js';
import { HK, uiBtn } from './build-menu.js';
import { BTN, BTNH, BTNX, frame, GRN, GRNH, PAN } from './drawing.js';
import { hudState, inR, U } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { THEME } from './kingdom-theme.js';
import { pill } from './minimap.js';
import { FF } from './typography.js';

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

function slider(x,y,w,val,set){const v=Math.max(0,Math.min(1,val));frame(x-4,y-1,w+8,13,BTNX,0);frame(Math.round(x-4+(w)*v),y-2,8,15,inR(inputState.mouse,U(x-5,y-2,w+10,15))?BTNH:BTN,0);
 hudState.uiHits.push({...U(x-5,y-2,w+10,15),fn:()=>{settingsState.sliderDrag={x,w,set};set(Math.max(0,Math.min(1,(inputState.mouse.x/hudDisplayState.UIS-x)/w)))},tip:null})}

function setGfx(v){sceneState.GQ=v?1:0;GQU.value=sceneState.GQ;try{localStorage.setItem('dk_gfx',sceneState.GQ)}catch(e){}DRS.lv=0;DRS.sum=DRS.cs=DRS.n=DRS.t=DRS.ok=DRS.chk=0;DRS.noDn=DRS.noUp=0;rs();if(SHADOWS){const ss=sceneState.GQ?2048:1024;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}renderer.shadowMap.needsUpdate=true}}

let setTab=0;

export const settingsDebug = { tab(n) { setTab = n } };

const tutOn=()=>{try{return localStorage.getItem('dk_tut')!=='1'}catch(e){return true}};
const tutSet=on=>{try{if(on)localStorage.removeItem('dk_tut');else localStorage.setItem('dk_tut','1')}catch(e){}};

/* tabs: 0 Game, 1 Graphics, 2 Sound, 3 Controls */
export function drawSettings(UW,UH,cx){const W=Math.min(UW-12,setTab===3?560:340),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=6,H=UH-12;frame(X,Y,W,H,PAN,6);TTL('Settings',X+10,Y+7,1.35);
 {const tw0=Math.min(62,(W-96)/4-4);[['Game',0],['Graphics',1],['Sound',2],['Controls',3]].forEach(([n,v],i)=>pill(X+W-10-(tw0+4)*(4-i)+4,Y+7,tw0,15,n,BTN,BTNH,()=>{setTab=v;settingsState.rebind=null},null,.7,setTab===v))}
 let y=Y+28;
 if(setTab===3){T_('Click a key, then press the new one  (Esc cancels)',X+10,y+3,'#d9b27a',.75);pill(X+W-100,y,90,15,'Reset keys',BTN,BTNH,()=>{KB={...KDEF};saveKB()},null,.8);y+=21;
  const acts=Object.keys(KDEF),avail=Y+H-30-y;let cols=Math.max(1,Math.min(4,Math.floor((W-20)/130)));while(cols<4&&avail/Math.ceil(acts.length/cols)<12&&(W-20)/(cols+1)>=96)cols++;
  const rows=Math.ceil(acts.length/cols),cw=(W-20)/cols,rh=Math.min(16,avail/rows);
  acts.forEach((a,i)=>{const c=(i/rows)|0,r=i%rows,x=X+10+c*cw,yy=y+r*rh;const lb=ACTL[a];let sc=.72;while(sc>.5&&tw(lb,sc)>cw-48)sc-=.04;T_(lb,x,yy+Math.max(1,(rh-10)/2),'#ead8ba',sc);
   uiBtn(x+cw-44,yy,38,rh-2,settingsState.rebind===a?GRN:BTN,settingsState.rebind===a?GRNH:BTNH,()=>{settingsState.rebind=a},null,(bx,by,bw,bh)=>TC(settingsState.rebind===a?'...':kdisp(KB[a]),bx+bw/2,by+(bh-6)/2,'#fff',.7))})}
 else if(setTab===2){T_('Music',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,soundState.vM,v=>{soundState.vM=v;applyVol();saveVol()});T_(Math.round(soundState.vM*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=17;
  T_('Sound effects',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,soundState.vS,v=>{soundState.vS=v;applyVol();saveVol()});T_(Math.round(soundState.vS*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=19;
  const bw3=Math.min(100,(W-30)/2);pill(X+10,y,bw3,16,'Sound: '+(sndOn?'on':'off'),BTN,BTNH,toggleSound,null,.85);y+=20}
 else if(setTab===1){T_('Graphics',X+10,y+3,'#ead8ba',.85);{const bw6=Math.min(70,(W-130)/2);[['Ultra HD',1],['Fast',0]].forEach(([n,v],i)=>pill(X+W-10-(bw6+4)*(2-i)+4,y,bw6,16,n,BTN,BTNH,()=>setGfx(v),null,.8,sceneState.GQ===v))}y+=24;
  T_('Interface size',X+10,y+3,'#ead8ba',.85);{const bw4=Math.min(52,(W-130)/4);[['Small',.8],['Normal',1],['Large',1.25],['Huge',1.6]].forEach(([n,v],i)=>pill(X+W-10-(bw4+4)*(4-i)+4,y,bw4,16,n,BTN,BTNH,()=>{uiMul=v;try{localStorage.setItem('dk_ui',v)}catch(e){}rs()},null,.8,Math.abs(uiMul-v)<.01))}y+=24}
 else{T_('Language',X+10,y+3,'#ead8ba',.85);{const lw=Math.min(150,W-120);langBtn(X+W-10-lw,y-2,lw,20,LANG,()=>{languageState.langOpen=true;settingsState.settingsOpen=false},false)}y+=26;
  T_('Tutorial',X+10,y+3,'#ead8ba',.85);{const tb=Math.min(110,W-120),on=tutOn();pill(X+W-10-tb,y,tb,16,on?'Tutorial: on':'Tutorial: off',on?GRN:BTN,on?GRNH:BTNH,()=>tutSet(!on),null,.8)}y+=26;
  {const prow=(lab,k,d,a,b)=>{T_(lab,X+10,y+3,'#ead8ba',.85);const tb=Math.min(110,W-120),on=pref(k,d);pill(X+W-10-tb,y,tb,16,on?a:b,on?GRN:BTN,on?GRNH:BTNH,()=>setPref(k,!on),null,.8);y+=26};
   prow('Pause when away','ap',true,'On','Off');prow('Autosave','as',true,'On','Off');prow('Reduce motion','rm',false,'On','Off');prow('Studio intro','qi',false,'First launch only','Every launch')}
  T_('King skills',X+10,y+1,'#d9b27a',.8);y+=14;
  for(const a of['cry','charge']){T_(ACTL[a],X+14,y+3,'#ead8ba',.8);uiBtn(X+W-54,y,44,16,BTN,BTNH,()=>{setTab=3;settingsState.rebind=a},null,(bx,by,bw,bh)=>TC(kdisp(KB[a]),bx+bw/2,by+(bh-6)/2,'#fff',.75));y+=20}}
 pill(X+W/2-40,Y+H-22,80,16,'Back',BTN,BTNH,()=>{settingsState.settingsOpen=false;settingsState.rebind=null;setTab=0;if(settingsState.fromGame){settingsState.fromGame=false;startGame()}},null,.9)}

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
}
