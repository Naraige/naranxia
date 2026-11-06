import { PUD } from '../ai/zombies.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW, SWD, SWDT } from '../gameplay/swarm.js';
import { glow, puff } from './effects.js';
import { FOWH, FOWU, fowVisAt, LITN, litTex } from './fog.js';
import { nightK } from './lighting.js';
import { GLN, LMU } from './materials.js';
import { swGeoV, SWV, swVar } from './models/swarm.js';
import { zSpec } from './models/zombies.js';
import { CAM, scene } from './scene.js';
import { gh } from './terrain.js';
import { THREE } from './three.js';
import { angd, UNITK } from './unit-animation.js';
import { _uFr, GLTOON } from './unit-instances.js';
import { HT } from '../world/terrain.js';

export const swarmRenderingState = {
  ZEYN: 0,
};

/* ---- swarm rendering: one instanced draw per skin, limbs animated in the vertex shader (no per-zombie objects) ---- */
const SWR = {meshes:null,cap:4000};
const SWU = {value:0};
const SWN8 = {value:0};
export const SWPX = .023;
const SWHIP = 12*SWPX;
const SWSH = 22*SWPX;


function swMat(){const m=new THREE.MeshLambertMaterial({vertexColors:true});m.onBeforeCompile=function(sh){sh.uniforms.uT=SWU;sh.uniforms.uN=SWN8;sh.uniforms.uLMax=LMU;
 sh.vertexShader='attribute vec4 iPos;attribute vec3 iAnim;attribute float aPart;attribute float aGl;attribute float aSk;uniform float uT;varying vec3 vLP;varying float vGl;\n'+sh.vertexShader
  .replace('#include <color_vertex>','#include <color_vertex>\n{float zh=fract(iAnim.x*5.17),zb=.9+.2*fract(iAnim.x*11.3);vec3 zt=zh<.25?vec3(.9,1.07,.86):zh<.5?vec3(1.07,1.02,.88):zh<.75?vec3(.93,.96,1.07):vec3(1.02,.92,.96);vColor.rgb*=mix(vec3(1.),zt*zb,aSk);}')
  .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{float cy0=cos(iPos.w),sy0=sin(iPos.w);objectNormal=vec3(objectNormal.x*cy0+objectNormal.z*sy0,objectNormal.y,-objectNormal.x*sy0+objectNormal.z*cy0);}')
  .replace('#include <begin_vertex>',`vec3 p=position;vLP=position;vGl=aGl;float ph=iAnim.x+uT*iAnim.z;
 if(aPart>.5&&aPart<2.5){float sd=aPart<1.5?-1.:1.;float a=-1.42+.2*sin(ph*.9+sd*1.3)+(fract(iAnim.x*7.31+sd*.37)-.5)*.42;if(fract(iAnim.x*13.7)<.11&&sd<0.)a=-.26+.06*sin(ph*.8);vec3 q=p-vec3(0.,${SWSH.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWSH.toFixed(4)},0.);p.z+=${((SWSH-SWHIP)*.22).toFixed(4)};p.x+=sin(ph*.5)*${((SWSH-SWHIP)*.08).toFixed(4)};}
 else if(aPart>2.5){float sd=aPart<3.5?-1.:1.;float a=sd*.62*sin(ph);vec3 q=p-vec3(0.,${SWHIP.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWHIP.toFixed(4)},0.);}
 else{p.z+=max(0.,p.y-${SWHIP.toFixed(4)})*.22;p.x+=sin(ph*.5)*max(0.,p.y-${SWHIP.toFixed(4)})*.08;}
 p.y+=abs(sin(ph))*.02;p*=iAnim.y;float cy=cos(iPos.w),sy=sin(iPos.w);vec3 transformed=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy)+iPos.xyz;`);
 sh.fragmentShader='varying vec3 vLP;varying float vGl;uniform float uN;uniform float uLMax;\n'+GLN+sh.fragmentShader
  .replace('#include <color_fragment>','#include <color_fragment>\n{diffuseColor.rgb*=.9+.18*vn3(vLP*26.);}').replace('#include <aomap_fragment>','#include <aomap_fragment>'+GLTOON).replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb+=vGl*vColor*.3;');FOWH.call(this,sh)};return m}

function swInitR(){const mat=swMat();
 SWR.meshes=SWV.map(([kind,v])=>{const src=swGeoV(zSpec(kind,v)),g=new THREE.InstancedBufferGeometry();g.setIndex(src.index);for(const k of['position','normal','color','aPart','aGl','aSk'])g.setAttribute(k,src.attributes[k]);
  const pos=new Float32Array(SWR.cap*4),anim=new Float32Array(SWR.cap*3),ip=new THREE.InstancedBufferAttribute(pos,4),ia=new THREE.InstancedBufferAttribute(anim,3);ip.setUsage(THREE.DynamicDrawUsage);ia.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('iPos',ip);g.setAttribute('iAnim',ia);g.instanceCount=0;const mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);return{mesh,geo:g,pos,anim,ip,ia}})}

/* acid puddles: flat green discs that shrink as they dry, bubbles rising */
let PUDM;

export function pudRender(){let n=0;const o=new THREE.Object3D(),RR=CAM.dist*1.7+26;for(const P of PUD){const X=P.x/TS,Z=P.y/TS;if(Math.abs(X-CAM.x)>RR||Math.abs(Z-CAM.z)>RR||!fowVisAt(P.x,P.y))continue;
  const a=Math.min(1,P.t/1.5)*Math.min(1,(P.T-P.t)/.25),r=P.r/TS*(.35+.65*a),h=gh(X,Z)+.03;o.position.set(X,h,Z);o.rotation.set(0,(P.x*.013)%6.28,0);o.scale.set(r,1,r*.86);o.updateMatrix();PUDM.setMatrixAt(n++,o.matrix);
  glow(X,h+.05,Z,r*.45,.35,.85,.1,.12*a);for(let k=0;k<3;k++){const an=k*2.1+P.x*.01,rr=r*(.25+.2*k),ph=(sessionState.clockT*1.1+k*.37+P.y*.001)%1;glow(X+Math.cos(an)*rr,h+.03+ph*.14,Z+Math.sin(an)*rr,.05*(1-ph)+.02,.6,1,.25,.6*a*(1-ph))}}
 PUDM.count=n;if(n)PUDM.instanceMatrix.needsUpdate=true}

/* a lit bomber: the fuse sparks and the keg glows */
export function mutGlow(u){const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),k=.5+.5*Math.sin(sessionState.clockT*(u.type==='acid'?2.2:3.1)+((u.uid|0)&15));
 if(u.type==='bomber'){const f=.17*s;glow(X+Math.sin(fa)*f,g0+.46*s,Z+Math.cos(fa)*f,.34*s,1,.5,.12,.16+.12*k)}else{const f=-.13*s;glow(X+Math.sin(fa)*f,g0+.6*s,Z+Math.cos(fa)*f,.3*s,.5,1,.2,.12+.1*k)}}

export function fuseFx(u){const s=1.5*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),h=g0+.5*s,bx=X+Math.sin(fa)*.17*s,bz=Z+Math.cos(fa)*.17*s,k=.55+.45*Math.sin(sessionState.clockT*38);
 glow(bx,h,bz,.2+.12*k,1,.75,.3,.95);glow(bx,h,bz,.55,1,.4,.1,.25*k);if(Math.random()<.5)puff(u.x+Math.sin(fa)*7,u.y+Math.cos(fa)*7,'#ffd060',1,30,{T:.3,z:h-g0+.05,vz:2,g:6,s:.05})}

/* red eyes in the dark: at night a zombie you cannot see (outside the light, or in the fog) shows only its eyes; in the light they go out */
/* the eyes are queued and drawn after every other glow of the frame, so lamps, fires and arrows always keep theirs */
const EYQ=[];
const eg=(x,h,z,s,r,g2,b,a)=>EYQ.push(x,h,z,s,r,g2,b,a);
export function eyeFlush(){for(let k=0;k<EYQ.length;k+=8)glow(EYQ[k],EYQ[k+1],EYQ[k+2],EYQ[k+3],EYQ[k+4],EYQ[k+5],EYQ[k+6],EYQ[k+7]);EYQ.length=0}

function eyePair(X,Z,h,fa,lat,fwd,sz,a){const fx=Math.sin(fa),fz=Math.cos(fa),x=X+fx*fwd,z=Z+fz*fwd;sz*=Math.max(1,CAM.dist/13);if(CAM.dist>22){eg(x,h,z,sz*1.5,1,.13,.05,a);eg(x,h,z,sz*.5,1,.6,.4,a*.7);return}const ex=fz*lat,ez=-fx*lat;eg(x+ex,h,z+ez,sz,1,.13,.05,a);eg(x-ex,h,z-ez,sz,1,.13,.05,a)}

const litV=(X,Z)=>{const i=Math.floor(X)-FOWU.litP.value.x,j=Math.floor(Z)-FOWU.litP.value.y;return i<0||j<0||i>=LITN||j>=LITN?0:litTex[j*LITN+i]};

export const darkA=(X,Z)=>Math.min(1,nightK*1.3)*Math.max(0,1-litV(X,Z)/150);

function swEyes(i,X,Z,h,fa,a){const s=(SW.k[i]?1.12:.98)*UNITK;eyePair(X,Z,h+.64*s,fa,.05*s,.1*s,.05+.04*s,a*(.72+.28*Math.sin(sessionState.clockT*1.7+(SW.sd[i]&255))))}

const EYO0=[.642,.1],EYO={brute:[.577,.12],acid:[.594,.135],bomber:[.596,.09],miner:[.621,.11],runner:[.636,.113]};

const ZSC={zombie:1.35,husk:1.0,runner:1.2,brute:2.15,bomber:1.5,acid:1.3,miner:1.35};

export function zEyes(u,a,vis){if(swarmRenderingState.ZEYN>=200||a<.03)return;swarmRenderingState.ZEYN++;const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS;const eo=EYO[u.type]||EYO0;eyePair(X,Z,(vis&&u.dy!=null?u.dy:gh(X,Z))+eo[0]*s,vis&&u.fa!==undefined?u.fa:u.face||0,.051*s,eo[1]*s,.045+.035*s,a*(.72+.28*Math.sin(sessionState.clockT*1.7+((u.uid|0)&255))))}

export function swRender(dt){if(!SWR.meshes)swInitR();const M=SWR.meshes,cnt=SWR.cnt||(SWR.cnt=new Int32Array(M.length));cnt.fill(0);SWU.value=sessionState.clockT;SWN8.value=nightK;
 if(SW.n){const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS,al=Math.min(1,SW.acc/SWDT),k=Math.min(1,dt*9);let ng=0;
  const FP_=_uFr.planes,Fa=[],Fb=[],Fc=[],Fd=[];for(let q=0;q<6;q++){const p=FP_[q];Fa.push(p.normal.x);Fb.push(p.normal.y);Fc.push(p.normal.z);Fd.push(p.constant+1.6)}
  for(let i=0;i<SW.n;i++){const x1=SW.x[i],y1=SW.y[i];if(x1-cx>R||cx-x1>R||y1-cy>R||cy-y1>R||SW.hp[i]<=0)continue;
   {const X=x1/TS,Y=HT[SW.ti[i]]+.5,Z=y1/TS;let out=false;for(let q=0;q<6;q++)if(Fa[q]*X+Fb[q]*Y+Fc[q]*Z+Fd[q]<0){out=true;break}if(out)continue}
   if(!fowVisAt(x1,y1)){if(nightK>.25&&ng<500){ng++;let ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);swEyes(i,x1/TS,y1/TS,gh(x1/TS,y1/TS),ta,Math.min(1,nightK*1.3))}continue}const kd=SW.k[i],vi=swVar(SW.sd[i]),j=cnt[vi];if(j>=SWR.cap)continue;
   const x=SW.px[i]+(x1-SW.px[i])*al,y=SW.py[i]+(y1-SW.py[i])*al;let fa=SW.fa[i],ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);fa+=angd(fa,ta)*k;SW.fa[i]=fa;
   const sd=SW.sd[i],D=SWD[SW.ti[i]];let h=gh(x/TS,y/TS);if(D>3)h+=((sd>>4)&15)/15*Math.min(1.5,(D-3)*.045);
   const m=M[vi],P=m.pos,A=m.anim;P[j*4]=x/TS;P[j*4+1]=h;P[j*4+2]=y/TS;P[j*4+3]=fa;if(nightK>.25&&ng<500){const ea=darkA(x/TS,y/TS);if(ea>.03){ng++;swEyes(i,x/TS,y/TS,h,fa,ea)}}A[j*3]=(sd&1023)*.00614;A[j*3+1]=(kd?1.12:.98)*(.92+((sd>>10)&7)*.024)*UNITK;A[j*3+2]=(5.4+((sd>>6)&7)*.3)*1.25; cnt[vi]=j+1}}
 for(let q=0;q<M.length;q++){const m=M[q],c=cnt[q];m.geo.instanceCount=c;m.mesh.visible=c>0;if(c){m.ip.updateRange.offset=0;m.ip.updateRange.count=c*4;m.ip.needsUpdate=true;m.ia.updateRange.offset=0;m.ia.updateRange.count=c*3;m.ia.needsUpdate=true}}}

export function initializeSwarmRendering() {
  PUDM = (()=>{const gg=new THREE.CircleGeometry(1,20);gg.rotateX(-Math.PI/2);const m=new THREE.MeshBasicMaterial({color:0x8fd030,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const im=new THREE.InstancedMesh(gg,m,48);im.count=0;im.frustumCulled=false;im.renderOrder=2;scene.add(im);return im})();
}
