import { frameState } from './frame.js';
import { bxc, newG, toGeo } from './geometry.js';
import { GLN, LMU, matV } from './materials.js';
import { heraldryState } from './models/heraldry.js';
import { HANDY, mkModel, toolGeos, UM, VX } from './models/unit-parts.js';
import { uv2 } from './models/unit-style.js';
import { mut2 } from './models/mutant-style.js';
import { alv, unitsState } from './models/units.js';
import { zombiesState } from './models/zombies.js';
import { scene, SHADOWS } from './scene.js';
import { unitG } from './terrain.js';
import { THREE } from './three.js';
import { CORPSES } from './unit-animation.js';

/* Minecraft-skin shading for characters: per-skin-pixel noise in model space (no world grid lines) */
export const GLTOON=`
 {vec3 alb=max(diffuseColor.rgb,vec3(.004));vec3 irr=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/alb;float li=dot(irr,vec3(.299,.587,.114));float r=li/max(uLMax,.05);
  float bd=mix(.42,1.12,smoothstep(.04,1.2,r));vec3 tnt=mix(vec3(.76,.83,1.05),vec3(1.04,1.,.94),smoothstep(.25,.8,r));
  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;reflectedLight.indirectDiffuse=vec3(0.);}
`;

const GLUMAT=`
 {if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.);float gl=smoothstep(.62,.9,dot(normal,normalize(vec3(-.35,.8,.5))));
  reflectedLight.directDiffuse=reflectedLight.directDiffuse*(.88+.16*gl)+diffuseColor.rgb*(fr*.42+gl*.26)*uLMax+vec3(1.,.95,.86)*fr*.08*uLMax;}
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse*=.35;totalEmissiveRadiance+=diffuseColor.rgb*1.3;}}
`;

export let UNITSH = function UNITSH(sh){sh.uniforms.uLMax=LMU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;vMat=mat;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying float vMat;uniform float uLMax;'+GLN).replace('#include <color_fragment>','#include <color_fragment>\n{float l0=dot(diffuseColor.rgb,vec3(.299,.587,.114));bool mt=vMat>3.5&&vMat<4.5;diffuseColor.rgb=mix(vec3(l0),diffuseColor.rgb,1.2)*(mt?.97+.05*vn3(vLP*22.):.93+.12*vn3(vLP*22.));}').replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+GLTOON+GLUMAT).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{float l=dot(gl_FragColor.rgb,vec3(.299,.587,.114));gl_FragColor.rgb=mix(vec3(l),gl_FragColor.rgb,1.07)*vec3(1.03,1.0,.96);}')};

export let matUI;

let cubeG;

const RINGS={};
function ringGeo(s){if(RINGS[s])return RINGS[s];const G=newG(),c=[1,.88,.29],t=.05;
 bxc(G,0,0,-s,2*s+t,.03,t,c);bxc(G,0,0,s,2*s+t,.03,t,c);bxc(G,-s,0,0,t,.03,2*s+t,c);bxc(G,s,0,0,t,.03,2*s+t,c);return RINGS[s]=toGeo(G)}

let ringMat;

export let CARRYG;

const RS3={king:.52,guard:.46,gunner:.3,gunner2:.3,cannon:.56,husk:.26,peasant:.3,knight:.4,archer:.34,bannerman:.34,captain:.45,zombie:.32,runner:.3,brute:.5,bomber:.4,acid:.32,miner:.34,scout:.3,engineer:.3,envoy:.3};

export function buildUnitGroup(type,t,zv,rk){unitsState.ALB=t===0?alv():0;rk=rk|0;const k=type+t+'a'+unitsState.ALB+heraldryState.MVAR+(zv?'v'+zv.v+(zv.hint||''):'')+(rk?'k'+rk:'')+(uv2(type)?'n':'')+(mut2(zv&&zv.hint==='boss'?'boss':type)?'m':''),mdl=UM[k]||(UM[k]=(()=>{const zo=zombiesState.ZVAR;zombiesState.ZVAR=zv||null;unitsState.RKB=rk;try{return mkModel(type,t)}finally{zombiesState.ZVAR=zo;unitsState.RKB=0}})()),g=new THREE.Group();
 const mat=matV.clone();mat.onBeforeCompile=UNITSH;mat.emissive=new THREE.Color(0,0,0);
 const mesh=geo=>{const m=new THREE.Mesh(geo,mat);m.castShadow=SHADOWS&&type!=='husk';return m};
 const body=new THREE.Group();body.position.y=mdl.hip;const tor=mesh(mdl.torso);tor.position.y=-mdl.hip;body.add(tor);
 const head=mesh(mdl.head);head.position.set(0,mdl.neck,0);tor.add(head);
 const arm=mesh(mdl.arm);arm.position.set(mdl.ax,mdl.sh,0);tor.add(arm);
 let armL=null,shd=null;if(mdl.armL){armL=mesh(mdl.armL);armL.position.set(-mdl.ax,mdl.sh,0);tor.add(armL);if(mdl.shield){shd=mesh(mdl.shield);shd.position.set(mdl.shp[0],mdl.shp[1],mdl.shp[2]);shd.rotation.set(.33,-.14,0);armL.add(shd)}}
 const lL=mesh(mdl.leg),lR=mesh(mdl.leg);lL.position.set(-mdl.lx,mdl.hip,0);lR.position.set(mdl.lx,mdl.hip,0);g.add(lL,lR,body);
 const ex={};if(mdl.parts)for(const p of mdl.parts){const m=mesh(p.geo);m.position.set(p.x,p.y,p.z);(p.par?ex[p.par]:tor).add(m);ex[p.k]=m}
 const tools={};if(mdl.tools)for(const k2 of['axe','pick','hammer','hoe']){const m=mesh(mdl.tools[k2]);m.visible=false;m.position.set(0,HANDY*VX,.15*VX);arm.add(m);tools[k2]=m}
 let weap=null;if(mdl.weap){const T2=toolGeos(),m=mesh(T2[mdl.weap]);if(mdl.weap==='bow'){if(armL){m.position.set(0,HANDY*VX,.1*VX);armL.add(m);weap=m}}else{m.position.set(0,HANDY*VX,.15*VX);arm.add(m);weap=m}}
 const ring=new THREE.Mesh(ringGeo(RS3[type]),ringMat);ring.position.y=.04;ring.visible=false;g.add(ring);
 const carry=new THREE.Mesh(CARRYG.w,mat);carry.position.set(0,mdl.sh*.55,-.26);carry.visible=false;tor.add(carry);
 g.userData={ex,body,tor,head,lL,lR,arm,armL,shd,tools,weap,ring,carry,mdl,mat,z:t,wr:0};return g}

/* ---- instanced units: the per-unit groups still pose every part (animation code unchanged), but their meshes sit on a hidden layer;
   each frame the posed matrices are copied into one InstancedMesh per part model (and per shadow flag) ---- */
export let _uPV;
export let _uFr;
export let _uSp;

export const UL = 5;
const UIB = new Map();
let _uM;
let _uS;
let UIM=null;

function uiMat(){if(UIM)return UIM;const m=matV.clone();m.onBeforeCompile=function(sh,r){UNITSH(sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 iEm;varying vec3 vEm;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEm=iEm;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vEm;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vEm;')};return UIM=m}

function uiGrow(b,need){let cap=Math.max(32,b.cap);while(cap<need)cap*=2;const g2=new THREE.BufferGeometry();for(const k in b.geo.attributes)g2.setAttribute(k,b.geo.attributes[k]);g2.setIndex(b.geo.index);
 const em=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);em.setUsage(THREE.DynamicDrawUsage);g2.setAttribute('iEm',em);
 const m=new THREE.InstancedMesh(g2,uiMat(),cap);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);m.instanceColor.setUsage(THREE.DynamicDrawUsage);
 if(b.mesh){m.instanceMatrix.array.set(b.mesh.instanceMatrix.array);m.instanceColor.array.set(b.mesh.instanceColor.array);em.array.set(b.em.array);scene.remove(b.mesh);b.mesh.geometry.dispose()}
 m.frustumCulled=false;m.castShadow=b.sh;m.scale.set(-1,1,1);m.count=0;scene.add(m);m.updateMatrixWorld(true);b.mesh=m;b.em=em;b.cap=cap}

function uiAdd(g){const d=g.userData;if(!d.ip)return;const c=d.mat.color,e=d.mat.emissive;
 for(const m of d.ip){if(!m.visible)continue;let p=m.parent,vis=true;while(p&&p!==g){if(!p.visible){vis=false;break}p=p.parent}if(!vis)continue;
  const key=m.geometry.id*2+(m.castShadow?1:0);let b=UIB.get(key);if(!b){b={geo:m.geometry,sh:m.castShadow,cap:0,n:0,mesh:null,em:null};UIB.set(key,b)}
  if(b.n>=b.cap)uiGrow(b,b.n+1);const k=b.n++;_uM.multiplyMatrices(_uS,m.matrixWorld);b.mesh.setMatrixAt(k,_uM);b.mesh.instanceColor.setXYZ(k,c.r,c.g,c.b);b.em.setXYZ(k,e.r,e.g,e.b)}}

export function uiUMW(force){if(this.visible)THREE.Object3D.prototype.updateMatrixWorld.call(this,force)}

export function uiFlush(){for(const b of UIB.values())b.n=0;
 for(const[u,g]of unitG)if(g.userData.frame===frameState.frameN&&g.visible)uiAdd(g);
 for(const c of CORPSES)uiAdd(c.g);
 for(const b of UIB.values()){if(!b.mesh)continue;b.mesh.count=b.n;b.mesh.visible=b.n>0;if(b.n){b.mesh.instanceMatrix.needsUpdate=true;b.mesh.instanceColor.needsUpdate=true;b.em.needsUpdate=true}}}

export function setUNITSHHandler(handler) {
  UNITSH = handler;
}

export function initializeUnitInstances() {
  matUI = (()=>{const m=matV.clone();m.onBeforeCompile=UNITSH;return m})();
  cubeG = new THREE.BoxGeometry(1,1,1);
  ringMat = new THREE.MeshBasicMaterial({vertexColors:true});
  CARRYG = (()=>{const mk=f=>{const G=newG();f(G);return toGeo(G)};return{
   w:mk(G=>{[[0,0,.0],[.01,.11,.1],[.01,.11,-.1]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.46,.12,.12,k?'#a8723a':'#8a5a2a'));bxc(G,0,.05,0,.1,.2,.36,'#5a3a1a')}),
   g:mk(G=>{bxc(G,0,0,0,.3,.32,.22,'#c8a060');bxc(G,0,.3,0,.2,.06,.16,'#b08848');bxc(G,0,.14,.12,.18,.1,.04,'#ffd23c');bxc(G,0,.34,0,.14,.08,.1,'#ffd23c')}),
   s:mk(G=>{bxc(G,0,0,0,.32,.24,.26,'#b8bec8');bxc(G,.05,.2,0,.2,.16,.2,'#d4dae4');bxc(G,-.1,0,.14,.14,.12,.1,'#8e95a2')})}})();
  _uPV = new THREE.Matrix4();
  _uFr = new THREE.Frustum();
  _uSp = new THREE.Sphere(new THREE.Vector3(),3.2);
  _uM = new THREE.Matrix4();
  _uS = new THREE.Matrix4().makeScale(-1,1,1);
}
