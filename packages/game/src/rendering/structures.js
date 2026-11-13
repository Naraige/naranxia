import { ROTT, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { home } from './camera.js';
import { addBox, newG, rgb, toGeo } from './geometry.js';
import { drawBanner } from './kingdom-banner.js';
import { matV } from './materials.js';
import { icons3D } from './model-icons.js';
import { C5 } from './models/castles.js';
import { doorGeo, doorGeoW, gtopOf } from './models/fortifications.js';
import {
  ballBolt,
  ballHead,
  connMask,
  CONNT,
  GEO,
  pMask,
  sGeo,
  structureModelsState,
  trebArm,
  trebBase,
  trebCW,
} from './models/structures.js';
import { UM } from './models/unit-parts.js';
import { buildRoutes } from './routes.js';
import { CAM, camera, scene, SHADOWS } from './scene.js';
import { CHK, dirtyP, dirtyT, dropChunk, loadChunk, RM, unitG } from './terrain.js';
import { THREE } from './three.js';
import { titleSceneState } from './title-scene.js';
import { cv, cvs } from '../ui/canvases.js';
import { thIcons } from '../ui/icons.js';
import { thp } from '../ui/kingdom-theme.js';
import { D8 } from '../world/routes.js';
import { CH, HT, occ } from '../world/terrain-state.js';

export const structuresState = {
  BPLOFF: false,
};


const structO = new Set();
const stairO = new Set();

export let BANNER;
export let bannerTex;
let bannerMat;
const PLG = {};
const bpl=(w,h,x,y,z,ry)=>{if(structuresState.BPLOFF)return new THREE.Object3D();const k=w+'x'+h,g=PLG[k]||(PLG[k]=new THREE.PlaneGeometry(w,h)),m=new THREE.Mesh(g,bannerMat);m.position.set(x,y,z);m.rotation.y=ry||0;return m};

export function retheme(){structureModelsState.BLU=thp();for(const k in GEO)delete GEO[k];for(const k in UM)delete UM[k];thIcons();icons3D();drawBanner();bannerTex.needsUpdate=true;
 for(const s of sessionState.structs)if(s.o3)buildStructMesh(s);for(const[,g]of unitG){scene.remove(g)}unitG.clear();for(const u of sessionState.units)u.m=null;titleSceneState.titleDirty=true}

export let buildStructMesh = function buildStructMesh(s){structuresState.BPLOFF=s.t===2||s.tier===0;try{buildStructMesh0(s)}finally{structuresState.BPLOFF=false}};

export function buildStructMesh0(s){const g=s.o3;while(g.children.length)g.remove(g.children[0]);let b=0;s.head=null;s.arm=null;s.bolt=null;s.tpv=null;
 for(const[i,j]of s.tiles)b=Math.max(b,HT[j*TW+i]);s.bh=b;
 const m=s.sz===1?connMask(s):s.type==='tower'?pMask(s):0,mesh=new THREE.Mesh(sGeo(s,m),matV);mesh.castShadow=SHADOWS;mesh.receiveShadow=SHADOWS;g.add(mesh);
 if(s.type==='gate'){g.position.set(s.x/TS,b,s.y/TS);g.rotation.y=s.ax?Math.PI/2:0}
 else if(s.sz===1){g.position.set(s.tx+.5,b,s.ty+.5);g.rotation.y=ROTT.has(s.type)&&!s.weapon?(s.rot|0)*Math.PI/2:0}else g.position.set(s.tx,b,s.ty);
 if(s.type==='gate'&&s.gl!==3)mesh.scale.x=(s.gl||2)/2;
 s.door=null;s.flag=null;
 if(s.type==='gate'){const g3=s.gl===3,gk=g3?1:(s.gl||2)/2;(g3?[-1,1]:[-.74*gk,.74*gk]).forEach(x=>{g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?.457:.435,0));g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?-.457:-.435,Math.PI))});let d;if(s.tier===0){const k=g3?1:gk,geo=GEO.doorw||(GEO.doorw=doorGeoW());d=new THREE.Group();d.position.set(0,1.32,0);d.userData.lv=[-1,1].map(sd=>{const pv=new THREE.Group();pv.position.x=sd*.46*k;const m=new THREE.Mesh(geo,matV);m.scale.x=k*.5;m.position.x=-sd*.23*k;m.castShadow=SHADOWS;pv.add(m);d.add(pv);return pv})}else{d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.scale.x=g3?1:gk;d.position.set(0,1.32,0);d.castShadow=SHADOWS}g.add(d);s.door=d;s.dop=s.dop||0}
 if(s.type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='trebuchet'){const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.castShadow=SHADOWS;g.add(a);s.arm=a;a.rotation.y=s.aim||0;const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);cw.castShadow=SHADOWS;a.add(cw);s.cw=cw;a.rotation.order='YXZ';{const P=new THREE.Group();P.position.set(1,0,1);g.add(P);mesh.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(mesh);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'&&s.weapon==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.scale.setScalar(s.sz===2?1:.82);if(s.sz===2)h.position.set(1,gtopOf(s)+.32,1);else h.position.set(0,3.28+.3,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='tower'&&s.weapon==='trebuchet'){const wg=new THREE.Group();if(s.sz===2){wg.scale.setScalar(.7);wg.position.set(.3,gtopOf(s),.3)}else{wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4)}const b2=new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),matV);b2.castShadow=SHADOWS;wg.add(b2);const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.order='YXZ';a.castShadow=SHADOWS;wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);a.add(cw);g.add(wg);s.arm=a;s.cw=cw;{const P=new THREE.Group();P.position.set(1,0,1);wg.add(P);b2.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(b2);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'){if(s.sz===2){[[1,1.86,0],[1,.14,Math.PI],[1.86,1,Math.PI/2],[.14,1,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.4,.72,x,2.75,z,r)))}else[[0,.405,0],[0,-.405,Math.PI],[.405,0,Math.PI/2],[-.405,0,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.3,.5,x,2.0,z,r)))}
 if(s.type==='castle'&&s.sz===5){const st=s.tier!==0,fg=new THREE.Group();fg.position.set(C5.kx,st?C5.flag:C5.wflag,st?C5.kz:1.25);fg.add(bpl(.8,1.1,.43,-.55,0,0));g.add(fg);s.flag=fg;
  if(st){[1.3,3.7].forEach(x=>g.add(bpl(.36,.62,x,2.0,.003,Math.PI)));[[.6,.6,6.6],[4.4,.6,6.6],[.6,4.4,5.85],[4.4,4.4,5.85]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.42,.32,.23,0,0,0));g.add(f2)})}}
 else if(s.type==='castle'){const fg=new THREE.Group();fg.position.set(1.5,8.45,1.18);fg.add(bpl(.7,1.0,.38,-.5,0,0));g.add(fg);s.flag=fg;[.46,2.54].forEach(x=>g.add(bpl(.3,.55,x,2.2,3.007,0)));[1.2,1.8].forEach(x=>g.add(bpl(.34,.6,x,1.45,.044,Math.PI)));
  [[.46,.46,6.25],[2.54,.46,6.25],[.46,2.54,5.5],[2.54,2.54,5.5]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.4,.3,.22,0,0,0));g.add(f2)})}
 if(s.sz>=2){const sz=s.sz,inner=new THREE.Group();while(g.children.length)inner.add(g.children[0]);inner.position.set(-sz/2,0,-sz/2);g.add(inner);g.position.set(s.tx+sz/2,b,s.ty+sz/2);g.rotation.y=(ROTT.has(s.type)&&!s.hm?(s.rot|0):0)*Math.PI/2;}}

let _rcS;
let _v2S;

export function pickStruct(p){try{_v2S.set(p.x/cv.width*2-1,1-p.y/cv.height*2);_rcS.setFromCamera(_v2S,camera);const L=[],M=new Map();for(const s of sessionState.structs){if(!s.o3||s.hp<=0)continue;s.o3.traverse(o=>{if(o.isMesh&&o.visible){L.push(o);M.set(o,s)}})}const h=_rcS.intersectObjects(L,false);return h.length?M.get(h[0].object):null}catch {return null}}

export let addStruct = function addStruct(s){const g=new THREE.Group();s.o3=g;structO.add(g);buildStructMesh(s);scene.add(g)};

export function rmStruct(s){if(s.o3){scene.remove(s.o3);structO.delete(s.o3);s.o3=null}}

export function refreshNear(s){const seen=new Set(),rw=s.type==='wall'||s.type==='gate'||s.type==='tower'||s.type==='castle'||s.type==='keep';for(const[tx,ty]of s.tiles)for(const[dx,dy]of D8){const o=occ.get((ty+dy)*TW+tx+dx);if(o&&o!==s&&o.o3&&(o.sz===1&&(dx===0||dy===0||o.type==='wall')||(o.type==='tower'&&rw)||(o.type===s.type&&(dx===0||dy===0)&&(o.type==='house'||o.type==='farm'||CONNT.has(o.type))))&&!seen.has(o)){seen.add(o);buildStructMesh(o)}}if(s.o3&&s.hp>0)buildStructMesh(s)}

export let addStairs = function addStairs(i,si){const tx=i%TW,ty=(i/TW)|0,df=si.hi-si.lo,n=df,G=newG();
 for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,a=si.sg>0?u0:1-u1,b=si.sg>0?u1:1-u0,h=(k+1)*df/n,c=rgb(k%2?'#a8a9b4':'#8f909c');
  if(si.ax===0)addBox(G,a,0,0,b,h,1,c);else addBox(G,0,0,a,1,h,b,c)}
 const m=new THREE.Mesh(toGeo(G),matV);m.position.set(tx,si.lo,ty);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);stairO.add(m)};

export let build3D = function build3D(){for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();
 for(const g of structO)scene.remove(g);structO.clear();for(const m of stairO){scene.remove(m);m.geometry.dispose()}stairO.clear();
 for(const[,g]of unitG)scene.remove(g);unitG.clear();
 for(const s of sessionState.structs)addStruct(s);buildRoutes();home();
 const cx0=(CAM.x/CH)|0,cy0=(CAM.z/CH)|0;for(let j=-RM;j<=RM;j++)for(let i=-RM;i<=RM;i++)loadChunk(cx0+i,cy0+j)};

export function setAddStructHandler(handler) {
  addStruct = handler;
}

export function setBuildStructMeshHandler(handler) {
  buildStructMesh = handler;
}

export function setBuild3DHandler(handler) {
  build3D = handler;
}

export function setAddStairsHandler(handler) {
  addStairs = handler;
}

export function initializeStructures() {
  // Preserve Three.js allocation order and UUID random draws.
  new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  BANNER = cvs(128,192);
  bannerTex = new THREE.CanvasTexture(BANNER);
  bannerMat = new THREE.MeshBasicMaterial({map:bannerTex,transparent:true,alphaTest:.25,side:THREE.DoubleSide});
  _rcS = new THREE.Raycaster();
  _v2S = new THREE.Vector2();
}
