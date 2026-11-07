import { aInit } from '../audio/sound.js';
import { diagnosticsState } from '../debug/diagnostics.js';
import { bugCapture } from '../debug/tools.js';
import { constructionState } from '../gameplay/construction.js';
import { formSlots } from '../gameplay/formations.js';
import { reset } from '../gameplay/reset.js';
import { TS } from '../gameplay/rules.js';
import { sel } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { update } from '../gameplay/statistics.js';
import { inputState, keys } from '../input/state.js';
import { mpFrame } from '../multiplayer/lockstep.js';
import { drawPings, PINGS } from '../multiplayer/pings.js';
import { MP } from '../multiplayer/session.js';
import { scr } from '../rendering/camera.js';
import { FOWU } from '../rendering/fog.js';
import { render3D } from '../rendering/frame.js';
import { nightK } from '../rendering/lighting.js';
import { PKL, renderPickLive } from '../rendering/live-site-preview.js';
import { icons3D } from '../rendering/model-icons.js';
import { POST } from '../rendering/post-processing.js';
import { drsTick, rs } from '../rendering/resolution.js';
import { CAM, DRS, renderer, SHADOWS } from '../rendering/scene.js';
import { renderPick } from '../rendering/site-picker.js';
import { gh } from '../rendering/terrain.js';
import { renderTitle } from '../rendering/title-scene.js';
import { canvasesState, cv, cw, cwx } from '../ui/canvases.js';
import { drawBars, drawUI } from '../ui/hud.js';
import { minimapState, refreshMM } from '../ui/minimap.js';
import { KB, placeInput } from '../ui/settings.js';
import { sitePickerState } from '../ui/site-picker.js';
import { bgGen, genChunk, genF, NCX, NCY, rollWorld, terrainState } from '../world/terrain.js';

export const frameLoopState = {
  CWD: 1,
  UIT: -1,
};

function loop(ts){const lt0=performance.now(),dt=Math.min(.05,(ts-(sessionState.last||ts))/1000);sessionState.last=ts;sessionState.clockT+=dt;
 if(sessionState.started){const sp=CAM.dist*.9*dt,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);let fx_=0,fz=0;
  if(!sessionState.showMap){if(keys[KB.up]||keys.arrowup)fz-=1;if(keys[KB.down]||keys.arrowdown)fz+=1;if(keys[KB.left]||keys.arrowleft)fx_-=1;if(keys[KB.right]||keys.arrowright)fx_+=1;
   CAM.x+=(fx_*c+fz*s)*sp;CAM.z+=(-fx_*s+fz*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5}
  if(!MP.on&&!sessionState.over&&!sessionState.paused&&!sessionState.showMap)for(let k=0;k<sessionState.spd;k++)update(dt)}
 if(MP.on)mpFrame(dt);

 if(sessionState.started||sessionState.inGame){if(!MP.on){if(sessionState.started&&window.requestIdleCallback){if(!BGI&&terrainState.GI<terrainState.GORD.length){BGI=1;requestIdleCallback(bgIdle,{timeout:700})}}else bgGen(sessionState.started?2.5:14)}if(sessionState.clockT-minimapState.mmT>(terrainState.genN<NCX*NCY?1.2:4)){minimapState.mmT=sessionState.clockT;refreshMM()}}
 FOWU.fowP.value.w=sessionState.started&&sessionState.inGame?1:0;FOWU.fowP.value.z=sessionState.started&&sessionState.inGame?nightK:0;POST.U2.uVig.value=sessionState.started&&sessionState.inGame?1:0;if(SHADOWS&&++SHF>=(DRS.lv>=3?3:2)){SHF=0;renderer.shadowMap.needsUpdate=true}if(sessionState.started)render3D(dt);else if(sitePickerState.picking)(PKL.on?renderPickLive(dt):renderPick(dt));else if(sessionState.inGame&&!sessionState.over)render3D(0);else renderTitle(dt);
 {const hc=canvasesState.ctx;canvasesState.ctx=cwx;try{if(frameLoopState.CWD){canvasesState.ctx.setTransform(1,0,0,1,0,0);canvasesState.ctx.clearRect(0,0,cw.width,cw.height);frameLoopState.CWD=0}if(sessionState.started){frameLoopState.CWD=drawBars()|0;
  if(inputState.ptr&&inputState.ptr.fo&&inputState.ptr.fo.w1&&inputState.ptr.m>8){frameLoopState.CWD=1;const a=inputState.ptr.fo.w0,b=inputState.ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),FM=sel().filter(u=>u.type!=='peasant'&&!u.gar),ft=constructionState.formType;if(!constructionState.formType)constructionState.formType=1;let sl;try{sl=formSlots(FM,a,fm)}finally{constructionState.formType=ft}
   canvasesState.ctx.lineWidth=Math.max(1,inputState.DPR*1.2);for(const q of sl.values()){const P=scr(q.x/TS,gh(q.x/TS,q.y/TS)+.05,q.y/TS);if(!P.ok)continue;canvasesState.ctx.beginPath();canvasesState.ctx.ellipse(P.x,P.y,6*inputState.DPR,3.4*inputState.DPR,0,0,6.283);canvasesState.ctx.fillStyle='rgba(255,225,74,.28)';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle='#ffe14a';canvasesState.ctx.stroke()}
   const P0=scr(a.x/TS,gh(a.x/TS,a.y/TS)+.05,a.y/TS),P1=scr((a.x+Math.sin(fm)*TS*2)/TS,gh(a.x/TS,a.y/TS)+.05,(a.y+Math.cos(fm)*TS*2)/TS);if(P0.ok&&P1.ok){canvasesState.ctx.strokeStyle='#ffe14a';canvasesState.ctx.lineWidth=2*inputState.DPR;canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(P0.x,P0.y);canvasesState.ctx.lineTo(P1.x,P1.y);canvasesState.ctx.stroke();const an=Math.atan2(P1.y-P0.y,P1.x-P0.x);canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(P1.x,P1.y);canvasesState.ctx.lineTo(P1.x-Math.cos(an-.5)*9*inputState.DPR,P1.y-Math.sin(an-.5)*9*inputState.DPR);canvasesState.ctx.lineTo(P1.x-Math.cos(an+.5)*9*inputState.DPR,P1.y-Math.sin(an+.5)*9*inputState.DPR);canvasesState.ctx.closePath();canvasesState.ctx.fillStyle='#ffe14a';canvasesState.ctx.fill()}}
  if(inputState.box){frameLoopState.CWD=1;canvasesState.ctx.strokeStyle='#ffe14a';canvasesState.ctx.lineWidth=Math.max(1,inputState.DPR);canvasesState.ctx.fillStyle='rgba(255,225,74,.15)';const x=Math.min(inputState.box.x1,inputState.box.x2),y=Math.min(inputState.box.y1,inputState.box.y2),w=Math.abs(inputState.box.x2-inputState.box.x1),h=Math.abs(inputState.box.y2-inputState.box.y1);canvasesState.ctx.fillRect(x,y,w,h);canvasesState.ctx.strokeRect(x+.5,y+.5,w,h)}
  if(PINGS.length){frameLoopState.CWD=1;drawPings()}}}finally{canvasesState.ctx=hc}}
 if(!sessionState.started||frameLoopState.UIT<0||ts-frameLoopState.UIT>=22||ts<frameLoopState.UIT){UIDT=frameLoopState.UIT>=0&&ts>frameLoopState.UIT?Math.min(.1,(ts-frameLoopState.UIT)/1000):dt;frameLoopState.UIT=ts;canvasesState.ctx.setTransform(1,0,0,1,0,0);canvasesState.ctx.clearRect(0,0,cv.width,cv.height);drawUI()}
 placeInput();{const cu=sessionState.started&&sessionState.mode?'crosshair':sessionState.started&&inputState.panMode?'grab':'default';if(cu!==CUR0){CUR0=cu;cv.style.cursor=cu}}drsTick(ts,lt0);if(diagnosticsState.BUGQ)bugCapture();hideBoot();requestAnimationFrame(loop)}

/* the launch splash (index.html) fades out once a few frames of the title scene are on screen */
let bootFrames = 0;
let bootSkip=false;function skipBoot(){if(bootSkip)return;bootSkip=true;const b=document.getElementById('boot');if(b)b.classList.add('skip')}
try{for(const ev of['pointerdown','keydown'])addEventListener(ev,skipBoot,{once:true,passive:true})}catch(e){}
function hideBoot(){if(bootFrames>=0&&++bootFrames>=4&&(bootSkip||performance.now()>3300)){bootFrames=-1;const b=document.getElementById('boot');if(b){b.classList.add('done');setTimeout(()=>b.remove(),1300)}}}
export let UIDT = 1/60;
let CUR0 = '';
let SHF = 0;
let BGI = 0;

function bgIdle(d){BGI=0;if(MP.on||!sessionState.started)return;const t0=performance.now();while(terrainState.GI<terrainState.GORD.length&&(d.didTimeout?performance.now()-t0<2.5:d.timeRemaining()>4)){const k=terrainState.GORD[terrainState.GI++];if(!genF[k])genChunk(k%NCX,(k/NCX)|0)}}

export function initializeFrameLoop() {
  rs();
  rollWorld();
  reset();
  icons3D();
  aInit();
  requestAnimationFrame(loop);
}
