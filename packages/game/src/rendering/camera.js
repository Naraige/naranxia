import { HOMEC, LPL } from '../gameplay/players.js';
import { TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { inputState } from '../input/state.js';
import { MP } from '../multiplayer/session.js';
import { effectsState } from './effects.js';
import { CAM, camera, scene, SHADOWS, sun } from './scene.js';
import { gh } from './terrain.js';
import { THREE } from './three.js';
import { cv } from '../ui/canvases.js';
import { LAND } from '../world/terrain.js';

/* ---- camera & picking ---- */
export function updateCamera(dt){CAM.x=Math.max(2,Math.min(TW-2,CAM.x));CAM.z=Math.max(2,Math.min(TH-2,CAM.z));
 {const gy0=(gh(CAM.x,CAM.z)*2+gh(CAM.x+3,CAM.z)+gh(CAM.x-3,CAM.z)+gh(CAM.x,CAM.z+3)+gh(CAM.x,CAM.z-3))/6;CAM.y+=(gy0-CAM.y)*Math.min(1,dt*3)}const d=CAM.dist,cp=Math.cos(CAM.pitch);
 let px=CAM.x+d*Math.sin(CAM.yaw)*cp,py=CAM.y+d*Math.sin(CAM.pitch),pz=CAM.z+d*Math.cos(CAM.yaw)*cp;const gy=gh(px,pz)+2.5;if(py<gy)py=gy;
 if(effectsState.shakeT>0&&dt>0&&sessionState.started&&!sessionState.paused&&!sessionState.over){const k=Math.min(1,effectsState.shakeT)*.3;px+=(Math.random()-.5)*k;py+=(Math.random()-.5)*k;pz+=(Math.random()-.5)*k}camera.position.set(px,py,pz);camera.lookAt(CAM.x,CAM.y,CAM.z);
 scene.fog.near=d*.55+6;scene.fog.far=d*1.9+38;
 if(SHADOWS){const e=Math.round(Math.min(70,Math.max(26,d*.95+14))),sc=sun.shadow.camera;if(sc.right!==e){sc.left=-e;sc.right=e;sc.top=e;sc.bottom=-e;sc.far=e*4+60;sc.updateProjectionMatrix()}}
 {/* shadow map snapped to its texel grid: no shadow crawling when the camera moves */
  const e=SHADOWS?sun.shadow.camera.right:30,tex=2*e/2048,Lz=_LD,Lx=_LR,Ly=_LU;let tx=CAM.x,ty=CAM.y,tz=CAM.z;const a=tx*Lx[0]+ty*Lx[1]+tz*Lx[2],b=tx*Ly[0]+ty*Ly[1]+tz*Ly[2],da=Math.round(a/tex)*tex-a,db=Math.round(b/tex)*tex-b;
  tx+=da*Lx[0]+db*Ly[0];ty+=da*Lx[1]+db*Ly[1];tz+=da*Lx[2]+db*Ly[2];sun.position.set(tx-24,ty+44,tz+18);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld()}}

let _LD;
let _LR;
let _LU;

let _rc;
let _v2;
let _v3;

export function pickGround(px,py){_v2.set(px/cv.width*2-1,-(py/cv.height*2-1));_rc.setFromCamera(_v2,camera);const o=_rc.ray.origin,d=_rc.ray.direction;
 if(d.y>=-1e-4)return null;let t=Math.max(0,(o.y-82)/-d.y),prev=t;
 for(;t<520;t+=.35){const x=o.x+d.x*t,z=o.z+d.z*t,y=o.y+d.y*t;
  if(x>=0&&z>=0&&x<TW&&z<TH&&y<=gh(x,z)){let a=prev,b=t;for(let k=0;k<7;k++){const m=(a+b)/2;if(o.y+d.y*m<=gh(o.x+d.x*m,o.z+d.z*m))b=m;else a=m}return{x:o.x+d.x*b,z:o.z+d.z*b}}
  if(y<0)break;prev=t}
 const tt=(o.y-LAND)/-d.y;return{x:Math.max(0,Math.min(TW-.01,o.x+d.x*tt)),z:Math.max(0,Math.min(TH-.01,o.z+d.z*tt))}}

export const wpos=()=>{const p=pickGround(inputState.mouse.x,inputState.mouse.y);return p?{x:p.x*TS,y:p.z*TS}:{x:HOMEC().x,y:HOMEC().y}};

export function scr(x,y,z){_v3.set(x,y,z).project(camera);return{x:(_v3.x+1)/2*cv.width,y:(1-_v3.y)/2*cv.height,ok:_v3.z<1}}

export function home(){const hc=MP.on&&LPL()===1&&sessionState.CS2?sessionState.CS2:HOMEC();CAM.x=hc.x/TS;CAM.z=hc.y/TS;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.92;CAM.dist=window.innerWidth>=900?24:30}

export function initializeCamera() {
  _LD = (()=>{const v=[-24,44,18],l=Math.hypot(...v);return v.map(q=>q/l)})();
  _LR = (()=>{const d=_LD,u=[0,1,0],r=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]],l=Math.hypot(...r);return r.map(q=>q/l)})();
  _LU = (()=>{const d=_LD,r=_LR;return[d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]]})();
  _rc = new THREE.Raycaster();
  _v2 = new THREE.Vector2();
  _v3 = new THREE.Vector3();
}
