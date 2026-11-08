import { pref } from './prefs.js';
import { sessionState } from '../gameplay/session.js';
import { update } from '../gameplay/statistics.js';
import { inputState, keys } from '../input/state.js';
import { mpFrame } from '../multiplayer/lockstep.js';
import { MP } from '../multiplayer/session.js';
import { hudState } from '../ui/hud.js';
import { settingsState } from '../ui/settings.js';

export const backgroundLoopState = {
  autoPaused: false,
};

/* QoL: auto-pause when the tab is hidden (solo), Delete = demolish the selected building */
/* alt-tab / hidden tab: solo games pause themselves (and keys held down are released); co-op keeps simulating so the partner is never stalled */

function focusLost(why){for(const k in keys)keys[k]=false;inputState.ptr=null;inputState.box=null;hudState.mmDrag=false;settingsState.sliderDrag=null;
 if(pref('ap',true)&&!MP.on&&sessionState.started&&sessionState.inGame&&!sessionState.over&&!sessionState.paused){sessionState.paused=true;backgroundLoopState.autoPaused=true}}

/* while the tab is hidden requestAnimationFrame stops: keep the co-op lockstep running from timers and from incoming packets */
let bgLast=0;

export function bgTick(){if(document.hidden&&!MP.on&&sessionState.started&&sessionState.inGame&&!sessionState.over&&!sessionState.paused){const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(30,(n-bgLast)/1000);if(e<.05)return;bgLast=n;try{while(e>.001){const d=Math.min(.05,e);for(let k=0;k<sessionState.spd;k++)update(d);e-=d}}catch(er){}return}
 if(!(document.hidden&&MP.on&&sessionState.started&&!sessionState.over)){bgLast=0;return}const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(2,(n-bgLast)/1000);if(e<.03)return;bgLast=n;
 try{while(e>0){const d=Math.min(.25,e);mpFrame(d);e-=d;if(MP.stall)break}}catch(er){}}

export function initializeBackgroundLoop() {
  document.addEventListener('visibilitychange',()=>{if(document.hidden)focusLost('tab hidden')});

  addEventListener('blur',()=>focusLost('window inactive'));

  setInterval(bgTick,100);
  try{const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),200)'],{type:'text/javascript'})));wk.onmessage=()=>{if(document.hidden)bgTick()}}catch(e){}
}
