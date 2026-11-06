import { mkU } from '../../gameplay/entities.js';
import { TS } from '../../gameplay/rules.js';
import { geometryState, newG, toGeo } from '../geometry.js';
import { heraldryState, shdPose } from './heraldry.js';
import { HANDY, mkModel, tb, toolGeos, VX } from './unit-parts.js';
import { HA, unitsState } from './units.js';
import { unitG } from '../terrain.js';
import { THREE } from '../three.js';
import { _tm, TARMY, titleDispose, titleSceneState, TS3, TT, TZ } from '../title-scene.js';
import { mkUnit } from '../unit-animation.js';
import { matUI } from '../unit-instances.js';

/* poses for the title army (applied after animUnit) */
export function titlePose(u,d){if(!u.pose||u.atk>0||!d.armL)return;const s=Math.sin(TT*1.1+u.ph0);
 if(u.pose==='guard'){d.armL.rotation.x=-.66+s*.02;d.armL.rotation.z=.14;d.arm.rotation.x=-.45+s*.03;d.arm.rotation.z=-.08;if(d.weap)d.weap.rotation.x=-.62;shdPose(d,.7)}
 else if(u.pose==='shoulder'){d.arm.rotation.x=-1.0+s*.03;d.arm.rotation.z=-.28;if(d.weap)d.weap.rotation.x=-1.38;shdPose(d,0)}
 else{d.arm.rotation.x=-.15+s*.02;if(d.weap)d.weap.rotation.x=1.52;shdPose(d,0)}
 d.body.rotation.z=s*.01}

/* ---- instanced rear ranks of the title army (static posed soldiers, gentle sway) ---- */
export let TRES=null;

function reserveDispose(){if(!TRES)return;for(const im of TRES.ims){TS3.remove(im);im.geometry.dispose()}TRES=null}

function mergePosed2(parts){const P=[],N=[],C=[],Mt=[],I=[];let off=0;
 for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array,ma=g.attributes.mat?g.attributes.mat.array:null,nv=p.length/3;
  for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}for(let i=0;i<nv;i++)Mt.push(ma?ma[i]:0);const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=nv;g.dispose()}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setAttribute('mat',new THREE.Float32BufferAttribute(Mt,1));r.setIndex(I);return r}

let PIKEG=null;

function pikeGeo(){if(PIKEG)return PIKEG;const G=newG(),t=(m,x,y,z,w,h,d,c)=>{const o=geometryState.BMAT;geometryState.BMAT=m;try{tb(G,x,y,z,w,h,d,c)}finally{geometryState.BMAT=o}};
 t(2,0,8.5,0,.44,33,.44,'#6b4423');t(0,0,0,0,.6,1.6,.6,'#4a2e16');t(4,0,25.3,0,.62,.9,.62,HA.st3);t(4,0,27.1,0,.78,2.8,.3,HA.sth);t(4,0,29.0,0,.4,1.1,.24,'#ffffff');t(4,0,24.6,0,1.6,.28,.36,HA.st2);
 PIKEG=toGeo(G);return PIKEG}

function soldierGeo(kind){const ty=kind==='pike'?'knight':kind,ab=unitsState.ALB;unitsState.ALB=2;let mdl;try{mdl=mkModel(ty,0)}finally{unitsState.ALB=ab}
 const o=new THREE.Object3D(),M=(x,y,z,rx,ry,rz)=>{o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.updateMatrix();return o.matrix.clone()};
 const Q={knight:{ar:-1.0,arz:-.28,wr:-1.38,al:-.3,alz:0},pike:{ar:-.62,arz:-.05,wr:0,al:-.3,alz:0},archer:{ar:-.45,arz:0,wr:0,al:-1.28,alz:0}}[kind];
 const P=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,0,.05)],[mdl.leg,M(-mdl.lx,mdl.hip,0)],[mdl.leg,M(mdl.lx,mdl.hip,0)]];
 const A=M(mdl.ax,mdl.sh,0,Q.ar,0,Q.arz);P.push([mdl.arm,A]);const T2=toolGeos();
 if(kind==='knight')P.push([T2.sword,A.clone().multiply(M(0,HANDY*VX,.15*VX,Q.wr))]);
 if(kind==='pike'){const h=new THREE.Vector3(0,HANDY*VX,.15*VX).applyMatrix4(A);P.push([pikeGeo(),M(h.x,h.y,h.z)])}
 if(mdl.armL){const B=M(-mdl.ax,mdl.sh,0,Q.al,0,Q.alz);P.push([mdl.armL,B]);
  if(kind==='archer')P.push([T2.bow,B.clone().multiply(M(0,HANDY*VX,.1*VX))]);
  else if(mdl.shield)P.push([mdl.shield,B.clone().multiply(M(mdl.shp[0],mdl.shp[1],mdl.shp[2],-Q.al+.03,-.14))])}
 const g=mergePosed2(P);g.computeBoundingSphere();
 for(const q of[mdl.torso,mdl.head,mdl.leg,mdl.arm,mdl.armL,mdl.shield])if(q)q.dispose();return g}

function buildReserve(L){reserveDispose();const R=Math.random;TRES={ims:[],arr:[],arch:[]};
 for(const k in L){if(!L[k].length)continue;const g=soldierGeo(k),im=new THREE.InstancedMesh(g,matUI,L[k].length);im.frustumCulled=false;TS3.add(im);TRES.ims.push(im);
  L[k].forEach(([x,z],i)=>{TRES.arr.push({im,i,x,z,ry:Math.PI+(R()-.5)*.16,sc:1.35*TZ*(.96+R()*.08),ph:R()*6.28});if(k==='archer')TRES.arch.push({x:x*TS,y:z*TS,atk:0})})}
 resSway(0)}

export function resSway(t){if(!TRES)return;for(const o of TRES.arr){const s=Math.sin(t*1.1+o.ph);_tm.position.set(o.x,0,o.z);_tm.rotation.set(0,o.ry+s*.02,s*.01);_tm.scale.set(o.sc,o.sc*(1+Math.abs(s)*.006),o.sc);_tm.updateMatrix();o.im.setMatrixAt(o.i,_tm.matrix)}
 for(const im of TRES.ims)im.instanceMatrix.needsUpdate=true}

/* the army: battalions of knights in front (2 animated ranks + an instanced third), archer companies behind, pike blocks in reserve, banners over every unit */
export function buildArmy(){titleDispose();reserveDispose();const R=Math.random,J=a=>(R()-.5)*a,L={knight:[],archer:[],pike:[]};
 const mk=(type,x,z,face,pose)=>{const u=mkU(0,type,x*TS,z*TS);u.face=face===undefined?Math.PI:face;u.fa=u.face;u.dy=0;u.hp=1;u.ph0=Math.random()*9;u.ttl=1;u.pose=pose||null;unitsState.ALF=2;let g;try{g=mkUnit(u)}finally{unitsState.ALF=null}unitG.delete(u);g.scale.multiplyScalar(TZ);g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')o.visible=false});TS3.add(g);TARMY.push(u);return u};
 titleSceneState.TCAP=null;
 for(const[cx,files]of[[-19.5,12],[0,15],[19.5,12]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.12+(r%2?.56:0)+J(.16),dx=(x-cx)/(files*.56),z=-5.25+r*1.08+dx*dx*.55+J(.14);
   if(r<2){const u=mk('knight',x,z,Math.PI+J(.1),r===0?'guard':R()<.5?'shoulder':'rest');if(r===0)u.front=1}else L.knight.push([x,z])}
  if(cx)mk('bannerman',cx+J(.6),-1.95+J(.15),Math.PI+J(.06))}
 for(const s of[-1,1])for(let r=0;r<3;r++)for(let f=0;f<7;f++)L.knight.push([s*(30.2+f*1.12+(r%2?.56:0))+J(.16),-5.0+r*1.08+J(.14)]);
 for(const[cx,files]of[[-25.5,9],[-9,11],[9,11],[25.5,9]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.1+(r%2?.55:0)+J(.18),z=-.45+r*1.05+J(.16);if(Math.abs(x-2.8)<2.4&&z>1.4)continue;
   if(r<2)mk('archer',x,z,Math.PI+J(.14));else L.archer.push([x,z])}
  mk('bannerman',cx+J(.6),2.75+J(.15),Math.PI+J(.06))}
 for(const[x0,x1]of[[-31.5,-7.6],[9.6,31.5]])for(let r=0;r<4;r++)for(let x=x0+(r%2?.56:0);x<=x1;x+=1.12)L.pike.push([x+J(.2),4.0+r*1.1+J(.18)]);
 /* King Naraige behind the centre with his royal guard */
 mk('king',0,-1.7,Math.PI);mk('guard',-.66,-1.12,Math.PI);mk('guard',.66,-1.12,Math.PI);for(const sd of[-1,1])mk('bannerman',sd*2.0,-1.8,Math.PI+J(.04));
 heraldryState.MVAR='cine';try{titleSceneState.TCAP=mk('captain',-12,-7.6,Math.PI/2)}finally{heraldryState.MVAR=''}
 buildReserve(L)}
