import { snd } from '../audio/sound.js';
import { TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { T_, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { mpSend } from './lockstep.js';
import { MP } from './session.js';
import { scr, wpos } from '../rendering/camera.js';
import { canvasesState, cv } from '../ui/canvases.js';
import { HT } from '../world/terrain.js';

export const PINGS=[];

const PNGT=[['Look here','#ffd23c'],['Defend here','#6fa8ff'],['Gather here','#7fe08a'],['Attack here','#ff6a6a']];

export function addPing(x,y,mine,p){p=p>=0&&p<4?p|0:0;PINGS.push({x,y,t:p?7:5,mine,p});snd('click')}

export function drawPings(){if(!sessionState.started||!PINGS.length)return;canvasesState.ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,inputState.DPR),dt=Math.min(.05,(performance.now()-(drawPings.t||performance.now()))/1000)||.016;drawPings.t=performance.now();
 for(let i=PINGS.length-1;i>=0;i--){const p=PINGS[i];p.t-=dt;if(p.t<=0){PINGS.splice(i,1);continue}
  const q=scr(p.x/TS,(HT[(p.y/TS|0)*TW+(p.x/TS|0)]||0)+.3,p.y/TS);if(!q.ok)continue;const r=(10+((p.t*2)%1)*22)*k;
  canvasesState.ctx.strokeStyle=p.p?PNGT[p.p][1]:p.mine?'rgba(255,210,60,.95)':'rgba(120,220,255,.95)';canvasesState.ctx.lineWidth=2.5*k;canvasesState.ctx.beginPath();canvasesState.ctx.arc(q.x,q.y,r,0,6.283);canvasesState.ctx.stroke();canvasesState.ctx.beginPath();canvasesState.ctx.arc(q.x,q.y,3*k,0,6.283);canvasesState.ctx.fillStyle=canvasesState.ctx.strokeStyle;canvasesState.ctx.fill();
  if(p.p){canvasesState.ctx.save();canvasesState.ctx.scale(k,k);const lab=PNGT[p.p][0],w=tw(lab,.8)+10,lx=q.x/k-w/2,ly=q.y/k-34;canvasesState.ctx.fillStyle='rgba(20,14,8,.78)';canvasesState.ctx.fillRect(lx,ly,w,13);canvasesState.ctx.fillStyle=PNGT[p.p][1];canvasesState.ctx.fillRect(lx,ly+12,w,1.5);T_(lab,lx+5,ly+3,'#ffffff',.8);canvasesState.ctx.restore()}}}

export function initializePings() {
  cv.addEventListener('pointerdown',e=>{if(e.altKey&&MP.conn&&sessionState.started){const w=wpos(),pt=(e.shiftKey?1:0)+(e.ctrlKey?2:0)+(e.shiftKey&&e.ctrlKey?0:0),pp=e.shiftKey&&e.ctrlKey?3:e.shiftKey?1:e.ctrlKey?2:0;mpSend({k:'ping',x:w.x,y:w.y,p:pp});addPing(w.x,w.y,true,pp);e.stopImmediatePropagation();e.preventDefault()}},true);
}
