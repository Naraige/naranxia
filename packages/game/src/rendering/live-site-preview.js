import { TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { L } from '../i18n/language.js';
import { inputState, keys } from '../input/state.js';
import { sitesFar } from '../multiplayer/lobby.js';
import { mpSend } from '../multiplayer/lockstep.js';
import { MP } from '../multiplayer/session.js';
import { sitePreviewState } from '../multiplayer/site-preview.js';
import { buildPreviewState, GB1, GB2, GB3, ghost, ghostMake, govBuild, rangeRing } from './build-preview.js';
import { pickGround, updateCamera } from './camera.js';
import { glowFlush } from './effects.js';
import { postRender } from './post-processing.js';
import { CAM, camera, scene } from './scene.js';
import { CHK, dirtyP, dirtyT, dropChunk, updateChunks } from './terrain.js';
import { THREE } from './three.js';
import { hudState, inR } from '../ui/hud.js';
import { KB } from '../ui/settings.js';
import { PVS, PVW, siteMaskGet, siteOK, sitePickerState } from '../ui/site-picker.js';
import { FFT } from '../ui/typography.js';
import { gOK } from '../world/routes.js';
import { CH, genF, HT, initWorld, LAND, NCX, NCY, terrainState } from '../world/terrain.js';

/* ---- live castle placement: the real generated world, game camera, castle ghost like any building ---- */
export const PKL={on:false,seed:-1,hit:null,beam:null};

function pkLivePrep(){PKL.seed=terrainState.SEED;PKL.site='';terrainState.CX=terrainState.CY=-2000;sessionState.SITE2=null;initWorld();for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();GB2.g.visible=false;GB2.key='';GB1.key=''}

export function pkLiveFocus(tx,ty){CAM.x=tx;CAM.z=ty;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.9;CAM.dist=Math.max(CAM.dist,40)}

/* the live view shows the ground as it will be once the game starts: the castle pad levelled (the castle sits on it instead of
   half buried in a slope), the starting resources and the zombie paths; the partner's site too in co-op */
function pkLiveSync(){const a=sitePickerState.pickPos&&sitePickerState.pickPos.ok?sitePickerState.pickPos:null,b=MP.conn&&MP.theirs?MP.theirs:null,k=terrainState.SEED+'|'+(a?a.tx+','+a.ty:'-')+'|'+(b?b.tx+','+b.ty:'-');if(k===PKL.site)return;PKL.site=k;
 terrainState.CX=a?a.tx:b?b.tx:-2000;terrainState.CY=a?a.ty:b?b.ty:-2000;sessionState.SITE2=a&&b?{tx:b.tx,ty:b.ty}:null;
 initWorld();for(const k2 of[...CHK.keys()])dropChunk(k2);dirtyT.clear();dirtyP.clear();GB1.key='';GB2.key='';GB3.key=''}

export function renderPickLive(dt){if(PKL.seed!==terrainState.SEED)pkLivePrep();pkLiveSync();
 if(!PKL.beam){PKL.beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.5,depthWrite:false}));scene.add(PKL.beam)}
 const k=dt*(keys[KB.up]||keys.arrowup?-1:keys[KB.down]||keys.arrowdown?1:0),k2=dt*(keys[KB.left]||keys.arrowleft?-1:keys[KB.right]||keys.arrowright?1:0),sp=CAM.dist*.9,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);
 CAM.x+=(k2*c+k*s)*sp;CAM.z+=(-k2*s+k*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5;
 updateCamera(dt);updateChunks(12);ghost.visible=rangeRing.visible=false;GB1.g.visible=false;PKL.hit=null;
 {const M=siteMaskGet(),cx=CAM.x|0,cy=CAM.z|0;let gn=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const kx=((cx/CH)|0)+i,ky=((cy/CH)|0)+j;if(kx>=0&&ky>=0&&kx<NCX&&ky<NCY&&genF[ky*NCX+kx])gn++}govBuild('pk'+terrainState.SEED+'|'+((cx/10)|0)+','+((cy/10)|0)+','+gn,cx,cy,56,(x,y)=>!!M[((y/PVS)|0)*PVW+((x/PVS)|0)])}
 const blocked=!(inputState.mouse.x>=0)||hudState.uiRects.some(r=>inR(inputState.mouse,r)),gho=buildPreviewState.GHO;
 buildPreviewState.GHO={tier:0,gl:2,rot:sessionState.PKROT&3};try{
 if(!blocked){const p=pickGround(inputState.mouse.x,inputState.mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const ok=siteOK(tx,ty)&&sitesFar({tx,ty},MP.conn?MP.theirs:null);PKL.hit={tx,ty,ok};if(!(sitePickerState.pickPos&&sitePickerState.pickPos.tx===tx&&sitePickerState.pickPos.ty===ty))ghostMake(GB1,'castle',tx-2,ty-2,0,ok,.6)}}}
 if(sitePickerState.pickPos&&gOK(sitePickerState.pickPos.tx,sitePickerState.pickPos.ty)){ghostMake(GB2,'castle',sitePickerState.pickPos.tx-2,sitePickerState.pickPos.ty-2,0,true,1);PKL.beam.visible=true;PKL.beam.position.set(sitePickerState.pickPos.tx+.5,HT[sitePickerState.pickPos.ty*TW+sitePickerState.pickPos.tx]+30,sitePickerState.pickPos.ty+.5)}else{GB2.g.visible=false;PKL.beam.visible=false}
 }finally{buildPreviewState.GHO=gho}
 /* the partner's castle, or their cursor while they are still choosing: shown in this view too, with a blue beam and their name */
 if(MP.conn){const hh=PKL.hit||sitePickerState.pickPos;if(hh&&performance.now()-sitePreviewState._pcT>90){const kk=hh.tx+','+hh.ty;if(kk!==sitePreviewState._pcL){sitePreviewState._pcL=kk;mpSend({k:'pc',tx:hh.tx,ty:hh.ty})}sitePreviewState._pcT=performance.now()}}
 const PO=MP.conn?(MP.theirs||MP.cur):null;
 if(PO&&gOK(PO.tx,PO.ty)){
  if(MP.theirs){buildPreviewState.GHO={tier:0,gl:2,rot:MP.theirs.rot&3};try{ghostMake(GB3,'castle',PO.tx-2,PO.ty-2,0,true,1)}finally{buildPreviewState.GHO=gho}}else GB3.g.visible=false;
  if(!PKL.beam2){PKL.beam2=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,60,8),new THREE.MeshBasicMaterial({color:0x5aa9ff,transparent:true,opacity:.6,depthWrite:false}));scene.add(PKL.beam2)}
  const h=HT[PO.ty*TW+PO.tx]||LAND;PKL.beam2.visible=true;PKL.beam2.position.set(PO.tx+.5,h+30,PO.ty+.5);pkLiveTag(PO.tx+.5,h+(MP.theirs?7.5:3),PO.ty+.5,(MP.pname||L('Partner'))+(MP.theirs?L(' - castle'):''))}
 else{GB3.g.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}
 glowFlush();scene.updateMatrixWorld();postRender(scene,camera,true);GB2.g.visible=false;GB3.g.visible=false;PKL.beam.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}

/* floating name over the partner's site in the live view */
function pkLiveTag(x,y,z,t){if(!PKL.tag){const c=document.createElement('canvas');c.width=256;c.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.renderOrder=10;sp.userData={c,t:null};scene.add(sp);PKL.tag=sp}
 const sp=PKL.tag;if(sp.userData.t!==t){sp.userData.t=t;const x2=sp.userData.c.getContext('2d');x2.clearRect(0,0,256,64);x2.font='700 28px '+FFT;x2.textAlign='center';x2.lineWidth=6;x2.strokeStyle='#0b0810';x2.fillStyle='#9fd0ff';x2.strokeText(t,128,42);x2.fillText(t,128,42);sp.material.map.needsUpdate=true}
 const k=Math.max(2.4,CAM.dist*.075);sp.scale.set(k*4,k,1);sp.position.set(x,y+k*.5,z);sp.visible=true}
