import { hyp } from '../core/math.js';
import { TS } from '../gameplay/rules.js';
import { frameState } from './frame.js';
import { matV } from './materials.js';
import { buildArmy, resSway, titlePose, TRES } from './models/title-army.js';
import { mkModel } from './models/unit-parts.js';
import { zombiesState } from './models/zombies.js';
import { postRender } from './post-processing.js';
import { camera } from './scene.js';
import { DEC, FOR, VAR } from './terrain-props.js';
import { THREE } from './three.js';
import { animUnit } from './unit-animation.js';
import { matUI } from './unit-instances.js';
import { cv, cvs } from '../ui/canvases.js';

export const titleSceneState = {
  titleDirty: true,
  TCAP: null,
};

/* ================= EPIC TITLE SCENE: army vs. endless horde at sunset ================= */
export let TS3;
let titleInit = false;
export let TT = 0;
export let TARMY = [];
let THORDE = [];
let TARR = [];
let TCLOUDS = [];
let TFLAMES = [];
let TLH = null;
let TLFL = null;
let TBOLT = null;
let TFLASH = 0;
let TFLN = 6;
let TASH = null;
let TASHP = null;
let TFIRES = [];
let TSMOKE = [];
let TEMB = null;
let TEMBP = null;

export const TZ=1.5;
 // global scale of the title cast
function gradTex(){const c=cvs(4,256),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#150c18');gr.addColorStop(.3,'#3a1522');gr.addColorStop(.58,'#8a2e26');gr.addColorStop(.82,'#d8662c');gr.addColorStop(1,'#ffa85a');g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);return t}

function sqSunTex(){const c=cvs(16,16),g=c.getContext('2d');g.fillStyle='#ffb070';g.fillRect(2,2,12,12);g.fillStyle='#ffd8a0';g.fillRect(3,3,10,10);g.fillStyle='#fff0d0';g.fillRect(4,4,8,8);g.fillStyle='#ffffff';g.fillRect(5,5,6,6);g.fillStyle='rgba(255,176,112,.5)';g.fillRect(1,1,14,1);g.fillRect(1,14,14,1);g.fillRect(1,1,1,14);g.fillRect(14,1,1,14);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}

function glowTex(r,g2,b){const c=cvs(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g2},${b},1)`);gr.addColorStop(.18,`rgba(${r},${g2},${b},.85)`);gr.addColorStop(.5,`rgba(${r},${g2},${b},.25)`);gr.addColorStop(1,`rgba(${r},${g2},${b},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}

function mergePosed(parts){const P=[],N=[],C=[],I=[];let off=0;for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array;for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=p.length/3}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setIndex(I);r.computeBoundingSphere();return r}

function zPose(type,zv){const zo=zombiesState.ZVAR;zombiesState.ZVAR=zv||null;let mdl;try{mdl=mkModel(type,1)}finally{zombiesState.ZVAR=zo}const o=new THREE.Object3D(),M=(x,y,z,rx)=>{o.position.set(x,y,z);o.rotation.set(rx||0,0,0);o.updateMatrix();return o.matrix.clone()};
 if(type==='brute'){/* knuckle-walker: body bent forward from the hips, long arms planted on the ground */const B=new THREE.Matrix4().makeTranslation(0,mdl.hip,0).multiply(new THREE.Matrix4().makeRotationX(.58)).multiply(new THREE.Matrix4().makeTranslation(0,-mdl.hip,0)),W=m=>B.clone().multiply(m);
  const parts=[[mdl.torso,W(M(0,0,0))],[mdl.head,W(M(0,mdl.neck,0,-.42))],[mdl.arm,W(M(mdl.ax,mdl.sh,0,-.95))],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,W(M(-mdl.ax,mdl.sh,0,-.15))]);return{geo:mergePosed(parts),sc:mdl.sc||1.35}}
 const parts=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,.0,.3)],[mdl.arm,M(mdl.ax,mdl.sh,0,-1.45)],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,M(-mdl.ax,mdl.sh,0,-1.35)]);
 return{geo:mergePosed(parts),sc:mdl.sc||1.35}}

export function titleDispose(){for(const u of TARMY){if(u.m){TS3.remove(u.m);u.m.userData.mat.dispose()}}TARMY=[]}

function initTitle(){titleInit=true;TS3.background=gradTex();TS3.fog=new THREE.Fog(0x7a3a30,40,330);
 TLH=new THREE.HemisphereLight(0xc4d2ec,0x3a3a50,1.15);TS3.add(TLH);TLFL=new THREE.DirectionalLight(0xcfe0ff,0);TLFL.position.set(10,80,-60);TS3.add(TLFL);const sun=new THREE.DirectionalLight(0xff9a5a,1.05);sun.position.set(-60,40,-90);TS3.add(sun);const fill=new THREE.DirectionalLight(0x8a6a98,.3);fill.position.set(30,20,60);TS3.add(fill);
 /* voxel terrain in the in-game style: terraced grass hills, dirt, stone, water, blocky trees */
 const CELL=2,X0=-200,NX=200,Z0=-330,NZ2=190,sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 const nz=(x,z)=>Math.sin(x*.045+1.3)*Math.cos(z*.05)+.55*Math.sin(x*.11+z*.07)+.35*Math.sin(z*.13-x*.09+2)+.25*Math.sin(x*.27+z*.23);
 const bg=new THREE.BoxGeometry(1,1,1);bg.translate(0,.5,0);{const pos=bg.attributes.position,nrm=bg.attributes.normal,col=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const top=nrm.getY(i)>.5,bot=nrm.getY(i)<-.5;const c=top?[1,1,1]:bot?[.3,.25,.2]:[.46,.34,.22];col.set(c,i*3)}bg.setAttribute('color',new THREE.BufferAttribute(col,3))}
 const tm=matV.clone(),cells=[];tm.onBeforeCompile=matV.onBeforeCompile;tm.defines={TERR:''};const TH2=new Float32Array(NX*NZ2),KIND=new Uint8Array(NX*NZ2);
 for(let j=0;j<NZ2;j++)for(let i=0;i<NX;i++){const x=X0+i*CELL+CELL/2,z=Z0+j*CELL+CELL/2,az=-z;
  const side=sm(0,22,Math.abs(x)-(26+.72*Math.max(0,az))),back=sm(0,45,az-150),m=Math.max(side,back*1.2);let h=0,kind=0;
  if(m>0){const n=nz(x,z)*.5+.5,lv=Math.floor((n*3.2-.5)*m*1.6+m*1.2);h=Math.max(-.5,lv*1.4);if(lv<0){kind=3;h=-.6}else if(lv>=3){kind=2}else kind=0;if(back>.8&&lv>=2)kind=2}
  else if(az<34&&az>2&&Math.abs(x)<46)kind=1;
  TH2[j*NX+i]=h;KIND[j*NX+i]=kind;
  const jj=.93+.14*(((i*7+j*13)%9)/9),dry=Math.max(0,Math.min(1,(Math.sin(x*.05+2)*Math.cos(z*.06)*.5+.5-.5)*3));let c;
  if(kind===3)c=[.24*jj,.52*jj,.84*jj];else if(kind===2)c=h>=5.6?[.9,.92,.97]:h>=4.2?[.66*jj,.68*jj,.74*jj]:[.5*jj,.54*jj,.5*jj];else if(kind===1)c=[.58*jj,.42*jj,.27*jj];
  else{c=[.3+(.62-.3)*dry*.5,.62+(.6-.62)*dry*.3,.26+(.3-.26)*dry*.5];if(h>=2.8){const t=Math.min(1,(h-2.8)/3);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}c=[c[0]*jj,c[1]*jj,c[2]*jj]}
  cells.push([x,z,h,c])}
 const tI=new THREE.InstancedMesh(bg,tm,cells.length),oo=new THREE.Object3D(),cc=new THREE.Color();cells.forEach(([x,z,h,c],k)=>{oo.position.set(x,-4,z);oo.scale.set(CELL,h+4,CELL);oo.updateMatrix();tI.setMatrixAt(k,oo.matrix);cc.setRGB(c[0],c[1],c[2]);tI.setColorAt(k,cc)});tI.frustumCulled=false;TS3.add(tI);
 const hAt=(x,z)=>{const i=Math.floor((x-X0)/CELL),j=Math.floor((z-Z0)/CELL);return i<0||j<0||i>=NX||j>=NZ2?-9:{h:TH2[j*NX+i],k:KIND[j*NX+i]}};
 /* in-game props: the very same oak / pine / birch / forest / rock / gold / flower models */
 {const sets=[[VAR.t.slice(0,6),.4,'t'],[VAR.t.slice(6,10),.34,'t'],[VAR.t.slice(10),.14,'t'],[FOR,.12,'t']],place=(geo,x,y,z,sc)=>{const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.floor(Math.random()*4)*Math.PI/2),new THREE.Vector3(sc,sc*(.9+Math.random()*.25),sc));(P.get(geo)||P.set(geo,[]).get(geo)).push(m)},P=new Map();
  const pick=arr=>arr[(Math.random()*arr.length)|0];
  for(let tries=0;tries<14000;tries++){const x=-190+Math.random()*380,z=-320+Math.random()*365,az=-z;const inPlay=Math.abs(x)<26+.72*Math.max(0,az)-4&&az<150;const c=hAt(x,z);if(!c||c.k===3)continue;
   if(inPlay){if(c.k!==0||Math.random()>.35)continue;const r=Math.random();if(r<.5){place(pick(DEC.f),x,c.h,z,TZ)}else if(r<.8){place(pick(DEC.t),x,c.h,z,TZ)}else if(r<.93){place(pick(DEC.b),x,c.h,z,TZ)}else if(r<.97){place(DEC.m[0],x,c.h,z,TZ)}else place(DEC.l[0],x,c.h,z,TZ);continue}
   const r=Math.random();if(z>5||(z>-14&&Math.abs(x)<34)){if(c.k===0&&r<.5)place(r<.2?pick(DEC.f):pick(DEC.t),x,c.h,z,TZ);continue}if(c.k===2){if(r<.16)place(pick(VAR.r),x,c.h,z,TZ*1.5);else if(r<.19)place(pick(VAR.g),x,c.h,z,TZ*1.5);else if(r<.3&&c.h<5)place(pick(VAR.t.slice(6,10)),x,c.h,z,TZ*1.3);continue}
   if(r<.55){let q=Math.random(),set=sets[0];for(const st of sets){if(q<st[1]){set=st;break}q-=st[1]}place(pick(set[0]),x,c.h,z,TZ*(.9+Math.random()*.4))}else if(r<.66)place(pick(VAR.r),x,c.h,z,TZ);else if(r<.82)place(pick(DEC.b),x,c.h,z,TZ);else place(pick(DEC.f),x,c.h,z,TZ)}
  for(const[geo,list]of P){const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((m,k)=>im.setMatrixAt(k,m));im.frustumCulled=false;TS3.add(im)}}
 /* blocky clouds */
 TCLOUDS=[];const cm=new THREE.MeshBasicMaterial({color:0x3c2a3a,fog:false,transparent:true,opacity:.96});for(let i=0;i<26;i++){const gp=new THREE.Group();const n=4+(Math.random()*5|0);for(let k=0;k<n;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(9+Math.random()*8,3+Math.random()*2,6+Math.random()*4),cm);b.position.set(k*8-n*4+Math.random()*3,Math.random()*2,Math.random()*5);gp.add(b)}gp.position.set(-260+Math.random()*520,40+Math.random()*30,-240-Math.random()*140);TS3.add(gp);TCLOUDS.push({g:gp,v:1.5+Math.random()*2})}
 /* sun */
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(255,80,40),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(60,30,-300);sp.scale.set(190,190,1);TS3.add(sp);
 const sp2=new THREE.Sprite(new THREE.SpriteMaterial({map:sqSunTex(),transparent:true,depthWrite:false,fog:false}));sp2.position.set(60,30,-299);sp2.scale.set(46,46,1);TS3.add(sp2);
 /* horde: instanced posed zombies */
 const kinds=[['husk',.4,6],['zombie',.42,10],['runner',.12,5],['brute',.06,4]],NZ=1500;
 THORDE=[];for(const[k,f,nv]of kinds){const tot=Math.round(NZ*f);for(let vi=0;vi<nv;vi++){const d=zPose(k,{v:vi,hint:null}),n=Math.max(1,Math.round(tot/nv)),im=new THREE.InstancedMesh(d.geo,matUI,n);im.frustumCulled=false;TS3.add(im);const arr=[];
  for(let i=0;i<n;i++){const depth=Math.pow(Math.random(),.62),z=-12-depth*130,wd=26+(-z)*.7,x=(Math.random()*2-1)*wd;arr.push({x,z,ph:Math.random()*6.28,sp:.7+Math.random()*.8,sc:d.sc*TZ*1.25*(.92+Math.random()*.16)})}
  THORDE.push({im,arr,k})}}

 /* apocalypse: falling ash, ground fires with smoke, lightning */
 {const AN=700,ap=new Float32Array(AN*3);for(let i=0;i<AN;i++){ap[i*3]=(Math.random()-.5)*160;ap[i*3+1]=Math.random()*45;ap[i*3+2]=-Math.random()*130+20}
  const ag2=new THREE.BufferGeometry();ag2.setAttribute('position',new THREE.BufferAttribute(ap,3));TASHP=ap;TASH=new THREE.Points(ag2,new THREE.PointsMaterial({color:0xb8aaa8,size:.22,transparent:true,opacity:.75,depthWrite:false,fog:false}));TASH.frustumCulled=false;TS3.add(TASH)}
 {const pts=[[0,0],[2.5,18],[-1.5,34],[3,52],[-2,72],[1,95],[-3,120]],bm=new THREE.MeshBasicMaterial({color:0xe8f0ff,fog:false});TBOLT=new THREE.Group();for(let k=0;k<pts.length-1;k++){const[ax,ay]=pts[k],[bx,by]=pts[k+1],l=hyp(bx-ax,by-ay),m=new THREE.Mesh(new THREE.BoxGeometry(1.3,l,1.3),bm);m.position.set((ax+bx)/2,(ay+by)/2,0);m.rotation.z=-Math.atan2(bx-ax,by-ay);TBOLT.add(m)}TBOLT.visible=false;TS3.add(TBOLT)}
 /* embers */
 const EN=260,ep=new Float32Array(EN*3);for(let i=0;i<EN;i++){ep[i*3]=(Math.random()-.5)*120;ep[i*3+1]=Math.random()*30;ep[i*3+2]=-Math.random()*110+10}
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ep,3));TEMBP=ep;TEMB=new THREE.Points(eg,new THREE.PointsMaterial({color:0xc8b8b0,size:.3,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEMB.frustumCulled=false;TS3.add(TEMB);
 /* arrows */
 const ag=new THREE.BoxGeometry(.05,.05,1.1),am=new THREE.MeshBasicMaterial({color:0xfff0c0}),ai=new THREE.InstancedMesh(ag,am,170);ai.frustumCulled=false;TS3.add(ai);TARR={im:ai,list:[],next:1};
 buildArmy()}

export let _tm;
let TSH = {i:0,t:0};
export let TFADE = 1;
let TEYE = null;

const TSHOTS=[
 {d:16,f:(t,T)=>({p:[-5+Math.sin(T*.11)*4,2.3+Math.sin(T*.17)*.25,13+Math.sin(T*.09)*1.2],l:[Math.sin(T*.1)*2,5.8,-40]})},
 {d:10,f:t=>{const k=t/10,e=k*k*(3-2*k);return{p:[-6+e*10,3.2+e*17,10-e*3],l:[e*4,1.5-e*1.5,-58]}}},
 {d:10,f:t=>{const k=t/10;return{p:[-21+k*26,1.35,-12.5],l:[-18+k*26,3.4,-2]}}},
 {d:9,f:t=>{const c=titleSceneState.TCAP?titleSceneState.TCAP.x/TS:0,k=t/9;return{p:[c+3.4-k*1.2,1.65,-11.4+k*.6],l:[c,2.7,-7.6]}}},
 {d:10,f:t=>{const k=t/10;return{p:[3.6-k*1.6,1.25,3.3],l:[-2,9+k*5,-34]}}}];

function titleEyes(){const N=THORDE.reduce((a,H)=>a+H.arr.length,0),pos=new Float32Array(N*6),gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(pos,3));
 TEYE=new THREE.Points(gm,new THREE.PointsMaterial({color:0xff3a22,size:.26,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEYE.frustumCulled=false;TS3.add(TEYE)}

/* start-up: build the title scene ahead of its first frame */
export function prepTitle(){if(!titleInit)initTitle()}

export function renderTitle(dt){if(!titleInit)initTitle();if(titleSceneState.titleDirty){buildArmy();titleSceneState.titleDirty=false}TT+=dt;
 /* camera: slow dolly with sway, scene shifted right on wide screens so the menu sits left */
 const wide=cv.width/cv.height>1.25,sh=0,t=TT;
 TSH.t+=dt;let S=TSHOTS[TSH.i];if(TSH.t>=S.d){TSH.t-=S.d;TSH.i=(TSH.i+1)%TSHOTS.length;S=TSHOTS[TSH.i];if(TSH.i===4&&TARR)TARR.next=.3}
 TFADE=TSH.t<.7?1-TSH.t/.7:TSH.t>S.d-.7?(TSH.t-(S.d-.7))/.7:0;const cm=S.f(TSH.t,t);camera.position.set(cm.p[0],cm.p[1],cm.p[2]);camera.lookAt(cm.l[0],cm.l[1],cm.l[2]);
 if(window.__cam){camera.position.set(...__cam.p);camera.lookAt(...__cam.l)}
 /* army idle + occasional volleys */
 frameState.frameN++;
 for(const u of TARMY){u.walk=0;
  if(u===titleSceneState.TCAP){const dir=u.face>0?1:-1;u.x+=dir*dt*TS*.8;u.walk=.25;if(u.x/TS>13&&dir>0)u.face=-Math.PI/2;else if(u.x/TS<-13&&dir<0)u.face=Math.PI/2}
  else{u.x+=Math.sin(TT*.4+u.ph0)*dt*TS*.03;if(u.raise&&u.atk<=0&&Math.random()<dt*.15)u.atk=.35}
  animUnit(u,dt,false,frameState.frameN);if(u.m){u.m.position.y=0;const d=u.m.userData;
   if(u===titleSceneState.TCAP){d.arm.rotation.x=.95;d.arm.rotation.z=-.78;if(d.armL){d.armL.rotation.x=.95;d.armL.rotation.z=.78}d.body.rotation.x=.08}
   else titlePose(u,d)}}
 resSway(TT);
 TARR.next-=dt;if(TARR.next<=0){TARR.next=3.4+Math.random()*2;const ar=TARMY.filter(u=>u.type==='archer').concat(TRES?TRES.arch:[]);for(const u of ar){if(Math.random()<.7){u.atk=.35;TARR.list.push({sx:u.x/TS,sz:u.y/TS-.5,tx:u.x/TS+(Math.random()-.5)*14,tz:-35-Math.random()*45,t0:TT+Math.random()*.25,dur:2.4+Math.random()*.6})}}}
 let ai=0;for(let i=TARR.list.length-1;i>=0;i--){const a=TARR.list[i],p=(TT-a.t0)/a.dur;if(p>1){TARR.list.splice(i,1);continue}if(p<0)continue;if(ai>=170)break;const x=a.sx+(a.tx-a.sx)*p,z=a.sz+(a.tz-a.sz)*p,y=2.2+28*4*p*(1-p)*.55,p2=Math.min(1,p+.02),x2=a.sx+(a.tx-a.sx)*p2,z2=a.sz+(a.tz-a.sz)*p2,y2=2.2+28*4*p2*(1-p2)*.55;
  _tm.position.set(x,y,z);_tm.lookAt(x2,y2,z2);_tm.scale.set(1,1,1);_tm.updateMatrix();TARR.im.setMatrixAt(ai++,_tm.matrix)}TARR.im.count=ai;TARR.im.instanceMatrix.needsUpdate=true;
 /* horde sway */
 if(!TEYE)titleEyes();const EP=TEYE.geometry.attributes.position.array;let ei=0;
 for(const H of THORDE){const im=H.im;for(let i=0;i<H.arr.length;i++){const z=H.arr[i],s=t*z.sp+z.ph,bob=Math.abs(Math.sin(s*2.2))*.16*(H.k==='runner'?1.6:1),px=z.x+Math.sin(s*.5)*.5,pz=z.z+Math.cos(s*.4)*.6+Math.sin(t*.3)*.8,ry=Math.sin(s*.7)*.35+(z.x>0?.04:-.04);
  _tm.position.set(px,bob,pz);_tm.rotation.set(0,ry,Math.sin(s*2.2)*.09);_tm.scale.set(z.sc,z.sc,z.sc);_tm.updateMatrix();im.setMatrixAt(i,_tm.matrix);
  const cy=Math.cos(ry),sy=Math.sin(ry),ey=bob+.597*z.sc,fz=.112*z.sc;for(const ex of[-.045,.045]){const lx=ex*z.sc;EP[ei++]=px+lx*cy+fz*sy;EP[ei++]=ey;EP[ei++]=pz-lx*sy+fz*cy}}im.instanceMatrix.needsUpdate=true}
 TEYE.geometry.attributes.position.needsUpdate=true;TEYE.material.opacity=.7+.3*Math.sin(t*2.1);
 for(const c of TCLOUDS){c.g.position.x+=c.v*dt;if(c.g.position.x>300)c.g.position.x=-300}

 TFLN-=dt;if(TFLN<=0){TFLN=4+Math.random()*7;TFLASH=.55;TBOLT.position.set((Math.random()-.5)*260,-3,-200-Math.random()*70);TBOLT.visible=true}
 if(TFLASH>0){TFLASH-=dt;const k=Math.max(0,TFLASH)/.55,fl=(Math.sin(TFLASH*60)>-.2?1:.3)*k;TLFL.intensity=3.2*fl;TLH.intensity=.8+1.4*fl;if(TFLASH<=.3)TBOLT.visible=false;if(TFLASH<=0){TLFL.intensity=0;TLH.intensity=.8;TBOLT.visible=false}}
 for(const f of TFIRES){const k=1+.3*Math.sin(t*10+f.ph);f.f.scale.set(k,k*1.5,k);f.f.rotation.y=t*2+f.ph;f.f2.scale.set(.6*k,1.1*k,.6*k);if(f.l)f.l.intensity=1.2+.5*Math.sin(t*9+f.ph*3)}
 for(const s2 of TSMOKE){s2.t+=dt;if(s2.t>8)s2.t-=8;const p=s2.t/8;s2.b.position.set(s2.x+p*7+Math.sin(p*5+s2.x)*1.2,2+p*20,s2.z-p*2);const sc=.8+p*2.6;s2.b.scale.set(sc,sc,sc);s2.b.rotation.y=p*3;s2.b.material.opacity=.55*(1-p)}
 for(let i=0;i<TASHP.length;i+=3){TASHP[i+1]-=dt*(2.2+(i%5)*.4);TASHP[i]+=dt*(2.5+Math.sin(t*.7+i)*1.2);if(TASHP[i+1]<0){TASHP[i+1]=45;TASHP[i]=(Math.random()-.5)*160;TASHP[i+2]=-Math.random()*130+20}if(TASHP[i]>90)TASHP[i]-=180}TASH.geometry.attributes.position.needsUpdate=true;
 for(const f of TFLAMES){const k=1+.25*Math.sin(t*11+f.x);f.f.scale.set(k,k*1.3,k);f.f.rotation.y=t*2;f.l.intensity=1.5+.4*Math.sin(t*9+f.x*3)}
 for(let i=0;i<TEMBP.length;i+=3){TEMBP[i+1]+=dt*(1.5+(i%7)*.2);TEMBP[i]+=dt*(.8+Math.sin(t+i)*.6);if(TEMBP[i+1]>32){TEMBP[i+1]=0;TEMBP[i]=(Math.random()-.5)*120;TEMBP[i+2]=-Math.random()*110+10}}TEMB.geometry.attributes.position.needsUpdate=true;
 postRender(TS3,camera,false)}

export function initializeTitleScene() {
  TS3 = new THREE.Scene();
  _tm = new THREE.Object3D();
}
