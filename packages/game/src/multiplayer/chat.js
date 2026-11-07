import { snd } from '../audio/sound.js';
import { sessionState } from '../gameplay/session.js';
import { mpMsg, mpSend, setMpMsgHandler } from './lockstep.js';
import { addPing } from './pings.js';
import { MP } from './session.js';
import { nmI } from '../ui/settings.js';

/* ---- co-op chat & pings ---- */
let mpChatBox;
export let mpChatI;

function chatLine(who,t){const d=document.createElement('div');d.style.cssText='background:rgba(0,0,0,.5);padding:1px 6px;margin-top:0;width:fit-content';const b=document.createElement('span');b.style.color=who==='You'?'#ffff55':'#55ffff';b.textContent='<'+who+'> ';d.appendChild(b);d.appendChild(document.createTextNode(t));mpChatBox.appendChild(d);setTimeout(()=>d.remove(),9000);while(mpChatBox.children.length>6)mpChatBox.firstChild.remove()}

let _mm;

export function initializeChat() {
  mpChatBox = document.createElement('div');
  mpChatI = document.createElement('input');

  Object.assign(mpChatBox.style,{position:'fixed',left:'8px',bottom:'210px',zIndex:9,maxWidth:'46vw',pointerEvents:'none',font:'400 18px VT323,"Courier New",monospace',color:'#ffffff',textShadow:'2px 2px 0 #3f3f3f'});

  Object.assign(mpChatI.style,{position:'fixed',left:'8px',bottom:'180px',width:'min(360px,60vw)',zIndex:10,display:'none',background:'rgba(12,16,24,.88)',color:'#f2e4c4',border:'1px solid #c9a24f',borderRadius:'2px',padding:'5px 9px',font:'400 16px "Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif',outline:'none',boxShadow:'0 0 0 1px #07060b'});

  mpChatI.placeholder='Message to your partner (Enter to send)';
  mpChatI.maxLength=120;
  document.body.appendChild(mpChatBox);
  document.body.appendChild(mpChatI);

  mpChatI.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){const t=mpChatI.value.trim();if(t&&MP.conn){mpSend({k:'chat',t});chatLine('You',t)}mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}else if(e.key==='Escape'){mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}});

  addEventListener('keydown',e=>{if(e.key==='Enter'&&MP.conn&&sessionState.started&&document.activeElement!==mpChatI&&document.activeElement!==nmI){e.preventDefault();mpChatI.style.display='block';mpChatI.focus()}},true);
}

export function initializeChatMessages() {
  _mm = mpMsg;
  setMpMsgHandler(function(m){if(m.k==='chat'){chatLine('Partner',String(m.t||'').slice(0,120));snd('click')}else if(m.k==='ping')addPing(+m.x,+m.y,false,m.p|0);else return _mm(m)});
}
