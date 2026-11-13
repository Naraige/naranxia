import { THREE } from './three.js';
import { LAND, terrainState } from '../world/terrain-state.js';

export const sceneState = {
  GQ: 1,
};

/* ================= 3D ENGINE ================= */
export let g3;
export let GQU;

export let renderer;

/* dynamic resolution: when the GPU (not our code) is the bottleneck, render fewer pixels; climb back when there is headroom */
export const DRSL=[1,.86,.74,.62,.5],DRS={lv:0,sum:0,cs:0,n:0,t:0,lt:0,noDn:0,noUp:0,upT:-99,chk:0,ftb:0,ok:0,bk:60,ft:0,cpu:0};

export let scene;
export let camera;

const SKY=0x9ccaf0;

export let SHADOWS;

export let hemi;
export let sun;

export let CAM;

export function initializeScene() {
  g3 = document.getElementById('g3');
  try{const v=localStorage.getItem('dk_gfx');if(v!==null)sceneState.GQ=+v?1:0}catch{/* Storage denial keeps the default graphics quality. */}
  GQU = {value:sceneState.GQ};
  renderer = new THREE.WebGLRenderer({canvas:g3,antialias:false,stencil:false,powerPreference:'high-performance'});
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.97;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42,1,.3,420);
  scene.autoUpdate=false;
  scene.background=new THREE.Color(SKY);
  scene.fog=new THREE.Fog(SKY,50,140);
  SHADOWS = window.innerWidth>700;
  hemi = new THREE.HemisphereLight(0xdcecff,0x77704f,.62);
  sun = new THREE.DirectionalLight(0xfff1d2,.78);

  scene.add(hemi,sun,sun.target);

  if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=true;{const ss=sceneState.GQ?2048:1024;sun.shadow.mapSize.set(ss,ss)}renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
   const sc=sun.shadow.camera;sc.left=-36;sc.right=36;sc.top=36;sc.bottom=-36;sc.near=1;sc.far=220;sun.shadow.bias=-.0003;sun.shadow.normalBias=.03}
  CAM = {x:terrainState.CX,z:terrainState.CY,y:LAND,yaw:0,pitch:.92,dist:24};
}
