import { hyp, rnd } from '../core/math.js';
import { cbOn } from '../core/prefs.js';
import { REALR } from '../core/random.js';
import { lightSources } from '../gameplay/lighting.js';
import { dpt, HOMEC, LPL } from '../gameplay/players.js';
import { TH, TS, TW } from '../gameplay/rules.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { inputState } from '../input/state.js';
import { pickGround } from './camera.js';
import { FOWU, LITN, litT, litTex } from './fog.js';
import { nightK } from './lighting.js';
import { gtopOf } from './models/fortifications.js';
import { CAM, scene } from './scene.js';
import { gh } from './terrain.js';
import { THREE } from './three.js';
import { cvs } from '../ui/canvases.js';
import { hudState, inR } from '../ui/hud.js';
import { gOK } from '../world/routes.js';
import { HT, LAND, occ, ter } from '../world/terrain.js';

export const effectsState = {
  shakeT: 0,
};

export let puff = function puff(x,y,c,n,sp,o){if(sessionState.pt.length>760)return;o=o||{};const soft=o.soft!==undefined?!!o.soft:(o.g!==undefined&&o.g<=0&&(o.s||0)>=.1&&!GLC[c]);for(let i=0;i<(n||8);i++){const a=Math.random()*6.28,s=rnd(.3,1)*(sp||60);sessionState.pt.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:o.T||.6,T:o.T||.6,c,z:o.z,vz:o.vz?o.vz*rnd(.6,1.2):0,g:o.g||0,s:o.s,soft,sp:rnd(-5,5)})}};

export const SLOWK=.22;

export const spark=(x,y,z)=>puff(x,y,'#ffe9a0',5,90,{T:.28,z:z||.6,vz:3,g:12,s:.07});

export const blood=(x,y,c)=>puff(x,y,c,6,60,{T:.5,z:.5,vz:2.5,g:10,s:.08});

export const dust=(x,y)=>puff(x,y,'#b9a98a',2,22,{T:.55,z:.1,vz:.8,g:-.4,s:.14});

export const smoke=(x,y,z)=>puff(x,y,'#5a5a60',1,12,{T:1.6,z:z||2,vz:1.2,g:-.2,s:.38});

export const ember=(x,y)=>puff(x,y,'#ff8a2a',3,40,{T:1.0,z:.6,vz:2,g:-.4,s:.09});

export function ring(x,y,c,n,sp){puff(x,y,c,n||18,sp||220,{T:.45,z:.15,vz:.1,s:.16})}

export const shake=v=>{effectsState.shakeT=Math.max(effectsState.shakeT,v)};
/* ---- fx / particles ---- */
const PMAX = 900;
let partM;

const AMAX = 500;
let fxM;

const colCache=new Map(),colOf=c=>{let v=colCache.get(c);if(!v){v=new THREE.Color(c);colCache.set(c,v)}return v};

export let _o;
let _c1;

/* ---- glow sprites: soft additive billboards for lamps, sparks, arrows, fire and blasts (one draw call for all) ---- */
const GLMAX = 1600;
let GLW;

const SMKMAX = 700;
let SMK;

function smk(x,y,z,s,r,g,b,a,rot){const G=SMK;if(G.n>=SMKMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a;G.Rr[k]=rot||0}

export function smkFlush(){const G=SMK;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){for(const a of[G.ip,G.ic,G.ir]){a.updateRange.offset=0;a.updateRange.count=G.n*a.itemSize;a.needsUpdate=true}}G.n=0}

/* night fireflies drifting around the camera */
const FFL=[];
export function fireflies(dt){if(nightK<.25){FFL.length=0;return}const R=REALR;while(FFL.length<34)FFL.push({x:CAM.x+(R()-.5)*36,z:CAM.z+(R()-.5)*30,ph:R()*6.28,sp:.4+R()*.6});
 for(const f of FFL){f.ph+=dt*f.sp;f.x+=Math.cos(f.ph*.7)*dt*.4;f.z+=Math.sin(f.ph*.53)*dt*.4;if(Math.abs(f.x-CAM.x)>20||Math.abs(f.z-CAM.z)>17){f.x=CAM.x+(R()-.5)*36;f.z=CAM.z+(R()-.5)*30}
  const tx=f.x|0,tz=f.z|0;if(!gOK(tx,tz)||ter[tz*TW+tx]===1)continue;const a=(.5+.5*Math.sin(f.ph*3.1))*nightK;glow(f.x,gh(f.x,f.z)+.6+.35*Math.sin(f.ph*1.3),f.z,.13,.75,1,.35,.85*a)}}

export function glow(x,y,z,s,r,g,b,a){const G=GLW;if(G.n>=GLMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a}

export function glowFlush(){const G=GLW;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){G.ip.updateRange.offset=0;G.ip.updateRange.count=G.n*4;G.ip.needsUpdate=true;G.ic.updateRange.offset=0;G.ic.updateRange.count=G.n*4;G.ic.needsUpdate=true}G.n=0}

/* short-lived light flashes and shock rings (blasts, muzzle flashes); purely visual */
const VFL=[],RINGP=[];
let RINGM;

export function vflash(x,y,h,s,c,T,ring){if(VFL.length<60)VFL.push({x,y,h,s,c,T,t:0,ring})}

let litTm=-9;

export function updateLit(){if(nightK<.02||sessionState.clockT-litTm<.25)return;litTm=sessionState.clockT;litTex.fill(0);
 const ox=Math.round(CAM.x)-(LITN>>1),oz=Math.round(CAM.z)-(LITN>>1);FOWU.litP.value.x=ox;FOWU.litP.value.y=oz;
 for(const L of lightSources()){const lx=L[0]/TS-ox,ly=L[1]/TS-oz,r=L[2]/TS;if(lx+r<1||lx-r>LITN-2||ly+r<1||ly-r>LITN-2)continue;
  for(let j=Math.max(1,Math.floor(ly-r));j<=Math.min(LITN-2,Math.ceil(ly+r));j++)for(let i=Math.max(1,Math.floor(lx-r));i<=Math.min(LITN-2,Math.ceil(lx+r));i++){const d=hyp(i+.5-lx,j+.5-ly)/r;if(d>=1)continue;const v=d<.62?255:Math.round(255*(1-(d-.62)/.38)),k=j*LITN+i;if(litTex[k]<v)litTex[k]=v}}
 litT.needsUpdate=true}

function drawFlashes(dt){let ri=0;for(let i=VFL.length-1;i>=0;i--){const f=VFL[i];f.t+=dt;const p=f.t/f.T;if(p>=1){VFL.splice(i,1);continue}const a=(1-p)*(1-p);
  glow(f.x/TS,f.h,f.y/TS,f.s*(.55+.9*p),f.c[0],f.c[1],f.c[2],a*.9);glow(f.x/TS,f.h,f.y/TS,f.s*.35,1,1,1,a*.8);
  if(f.ring&&ri<8){let m=RINGP[ri];if(!m){m=new THREE.Mesh(RINGM,new THREE.MeshBasicMaterial({color:0xffd8a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.renderOrder=7;scene.add(m);RINGP[ri]=m}
   const r=.6+f.s*1.5*Math.sqrt(p);m.position.set(f.x/TS,f.h-.45,f.y/TS);m.scale.set(r,1,r);m.material.opacity=.7*(1-p);m.visible=true;ri++}}
 for(let k=ri;k<RINGP.length;k++)RINGP[k].visible=false}

const GLC={'#ffe9a0':[1,.88,.55],'#ff8a2a':[1,.48,.12],'#ffd23c':[1,.78,.2],'#ffb050':[1,.58,.22],'#b8f040':[.55,1,.2],'#f0ff60':[.8,1,.3],'#7dffa0':[.35,1,.55],'#ffe066':[1,.88,.35],'#b04bff':[.7,.3,1],'#e55':[1,.3,.25],'#ffe14a':[1,.86,.3]};

const tw3=(wx,wy)=>{const tx=Math.max(0,Math.min(TW-1,(wx/TS)|0)),ty=Math.max(0,Math.min(TH-1,(wy/TS)|0)),s=occ.get(ty*TW+tx);return s&&s.type==='tower'?s.bh+gtopOf(s)-.15:gh(wx/TS,wy/TS)+.42};

export function syncFx(){let n=0;for(const p of sessionState.pt){const a=Math.max(0,p.t/(p.T||.6));
  if(p.soft){const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),c=colOf(p.c),al=Math.min(1,(1-a)/.14)*a*.78,ss=(p.s||.3)*(1.1+(1-a)*2.2);if(p.r===undefined)p.r=REALR();smk(p.x/TS,py_,p.y/TS,ss,c.r,c.g,c.b,al,p.r*6.28+(1-a)*p.sp*.25);continue}
  if(n>=PMAX)break;const sz=p.s?p.s*(.4+.6*a)*(a>.85?1+(1-a)*2:1):.06+.1*a;
  const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),gc=GLC[p.c];if(gc)glow(p.x/TS,py_,p.y/TS,.14+sz*2.2,gc[0],gc[1],gc[2],.55*a);if(p.r===undefined)p.r=REALR();_o.position.set(p.x/TS,py_,p.y/TS);_o.rotation.set(p.r*6+(1-a)*(p.sp||0),p.r*4+(1-a)*(p.sp||0)*.7,0);_o.scale.set(sz,sz,sz);_o.updateMatrix();partM.setMatrixAt(n,_o.matrix);if(p.r===undefined)p.r=Math.random();_c1.copy(colOf(p.c)).multiplyScalar(.8+.4*p.r);partM.setColorAt(n,_c1);n++}
 partM.count=n;partM.instanceMatrix.needsUpdate=true;if(partM.instanceColor)partM.instanceColor.needsUpdate=true;
 n=0;for(const f of sessionState.fx){if(n>=AMAX)break;const p=1-f.t/f.T;
  if(f.k==='rock'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.3,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*8;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*5,0);_o.scale.set(.42,.42,.42);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#7f7f7f'))}
  else if(f.k==='acid'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.25,ar=.9+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.18,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*7,p*5,0);_o.scale.set(.15,.15,.15);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#a8e030'));
   glow(x/TS,h,y/TS,.34,.55,1,.2,.6);for(let q=1;q<=3;q++){const pq=Math.max(0,p-q*.06),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,f.h0+(h1-f.h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.22-q*.04,.5,1,.2,.35/q)}}
  else if(f.k==='cball'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.2,ar=1+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.32,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*6,0);_o.scale.set(.13,.13,.13);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#2a2a2e'))}
  else if(f.k==='bolt'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h=f.h0+(.5-f.h0+gh(f.x2/TS,f.y2/TS))*p*.6;_o.position.set(x/TS,h,y/TS);_o.lookAt(f.x2/TS,h,f.y2/TS);_o.scale.set(.12,.12,1.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#8a6a42'));glow(x/TS,h,y/TS,.5,1,.9,.6,.55*(1-p))}
  else if(f.a){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h0=f.h0!==undefined?f.h0:tw3(f.x1,f.y1),h1=gh(f.x2/TS,f.y2/TS)+(f.arc?.12:.38),ar=f.arc?1.2+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.12:0,h=h0+(h1-h0)*p+Math.sin(p*Math.PI)*ar;
   _o.position.set(x/TS,h,y/TS);if(f.arc){const q=Math.min(1,p+.04);_o.lookAt((f.x1+(f.x2-f.x1)*q)/TS,h0+(h1-h0)*q+Math.sin(q*Math.PI)*ar,(f.y1+(f.y2-f.y1)*q)/TS)}else _o.lookAt(f.x2/TS,h1,f.y2/TS);if(f.arc)_o.scale.set(.085,.085,.66);else _o.scale.set(.06,.06,.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(f.f?'#ff9a3a':f.arc?'#f4ead0':'#d8c8a0'));
   if(f.f){glow(x/TS,h,y/TS,.34,1,.55,.12,.85);glow(x/TS,h+.06,y/TS,.16,1,.9,.4,.7)}else glow(x/TS,h,y/TS,.17,1,.86,.6,.5);for(let q=1;q<=2;q++){const pq=Math.max(0,p-q*.05),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,h0+(h1-h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.11-q*.03,1,.8,.5,.22/q)}if(p<.18)glow(f.x1/TS,h0,f.y1/TS,.45,1,.8,.45,(1-p/.18)*.55)}
  else{const r=.18+p*.5;_o.position.set(f.x2/TS,gh(f.x2/TS,f.y2/TS)+.45,f.y2/TS);_o.rotation.set(p*3,p*4,0);_o.scale.set(r,r,r);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(p<.5?'#ffffff':'#ffd060'))}
  n++}
 fxM.count=n;fxM.instanceMatrix.needsUpdate=true;if(fxM.instanceColor)fxM.instanceColor.needsUpdate=true;drawFlashes(1/60)}

let RFLAG;

export const rflagUpd=()=>{const pl=LPL(),ok0=b=>b&&b.t===0&&sessionState.structs.includes(b)&&b.prog>=1&&(b.pl|0)===pl,hc=HOMEC(),
  selBar=ok0(selectionState.selB)&&selectionState.selB.type==='barracks'?selectionState.selB:null,anyBar=selBar||sessionState.structs.find(s=>ok0(s)&&s.type==='barracks')||null,
  act=[!!selBar||sessionState.mode==='rally',selectionState.castleSel||sessionState.mode==='rallyc'||(ok0(selectionState.selB)&&selectionState.selB.type==='castle')],src=[selBar||anyBar,ok0(selectionState.selB)&&selectionState.selB.type==='castle'?selectionState.selB:hc];
 let hov=null;if((sessionState.mode==='rally'||sessionState.mode==='rallyc')&&inputState.mouse.x>=0&&!hudState.uiRects.some(r=>inR(inputState.mouse,r))){const p=pickGround(inputState.mouse.x,inputState.mouse.y);if(p)hov={x:p.x*TS,y:p.z*TS}}
 RFLAG.forEach((g,i)=>{if(!i){const cc=cbOn()?0x56b4e9:0x59ff8a,d=g.userData;if(d.cc!==cc){d.cc=cc;d.cl.material.color.setHex(cc);d.rg.material.color.setHex(cc);d.ln.material.color.setHex(cc)}}const b=src[i],set=b?b.rally:null,ph=hov&&sessionState.mode===(i?'rallyc':'rally');if(!i&&!act[0]){g.visible=g.userData.ln.visible=false;return}let w=ph?hov:set;
  if(!w&&act[i]&&b)w=b.type==='castle'?dpt(b):{x:b.x,y:b.y+b.rad+24};
  if(!w||!b){g.visible=g.userData.ln.visible=false;return}
  const tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS),y0=(gOK(tx,ty)?HT[ty*TW+tx]:LAND)+.1;g.visible=true;
  g.position.set(w.x/TS,y0,w.y/TS);g.scale.setScalar(set||ph?1:.7);g.userData.cl.rotation.y=Math.sin(sessionState.clockT*3)*.25;const q=1+Math.sin(sessionState.clockT*4)*.12;g.userData.rg.scale.set(q,q,q);
  const L=g.userData.ln;L.visible=act[i]||ph;if(L.visible){const a=g.userData.lg.attributes.position;a.setXYZ(0,b.x/TS,(b.bh||LAND)+.8,b.y/TS);a.setXYZ(1,w.x/TS,y0+.4,w.y/TS);a.needsUpdate=true;g.userData.lg.computeBoundingSphere()}})};

/* ---- voxel clouds ---- */
const CLN = 36;
let cloudM;

const CLD=[];

export function syncClouds(){const o=new THREE.Object3D();let n=0;for(const c of CLD){const px=((c.x+sessionState.clockT*1.2*c.s-CAM.x+200)%400+400)%400-200+CAM.x,pz=((c.z-CAM.z+200)%400+400)%400-200+CAM.z;
  for(let k=0;k<4;k++){o.position.set(px+(k-1.5)*c.w*.3,c.y+(k%2)*1.2,pz+((k*7)%3-1)*c.d*.25);o.scale.set(c.w*(.5+.2*(k%3)),2.6,c.d*(.6+.15*(k%2)));o.updateMatrix();cloudM.setMatrixAt(n++,o.matrix)}}
 cloudM.instanceMatrix.needsUpdate=true}

export function setPuffHandler(handler) {
  puff = handler;
}

export function initializeEffects() {
  partM = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({depthWrite:false}),PMAX);
  partM.frustumCulled=false;
  partM.renderOrder=6;
  partM.setColorAt(0,new THREE.Color(1,1,1));
  partM.count=0;
  scene.add(partM);
  fxM = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial(),AMAX);
  fxM.frustumCulled=false;
  fxM.setColorAt(0,new THREE.Color(1,1,1));
  fxM.count=0;
  scene.add(fxM);
  _o = new THREE.Object3D();
  _c1 = new THREE.Color();
  GLW = (()=>{const c=cvs(64,64),x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.6)');gr.addColorStop(.5,'rgba(255,255,255,.2)');gr.addColorStop(.78,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
   const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
   const P=new Float32Array(GLMAX*4),C=new Float32Array(GLMAX*4),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4);ip.setUsage(THREE.DynamicDrawUsage);ic.setUsage(THREE.DynamicDrawUsage);g.setAttribute('gP',ip);g.setAttribute('gC',ic);g.instanceCount=0;
   const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute vec4 gP;attribute vec4 gC;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=gC;vec4 mv=modelViewMatrix*vec4(gP.xyz,1.);mv.xy+=position.xy*gP.w;mv.z+=min(gP.w*.9,1.6);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){float a=texture2D(tex,vU).a*vC.a;if(a<.003)discard;gl_FragColor=vec4(vC.rgb,a);}'});
   const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=8;scene.add(mesh);return{g,P,C,ip,ic,n:0,mesh}})();
  SMK = (()=>{const c=cvs(64,64),x=c.getContext('2d');
   for(let i=0;i<10;i++){const a=i/10*6.2832,r=11+((i*7)%5)*1.6,cx=32+Math.cos(a)*9*(i%2?1:.55),cy=33+Math.sin(a)*8*(i%2?1:.55),gr=x.createRadialGradient(cx-3,cy-4,0,cx,cy,r+7);
    gr.addColorStop(0,'rgba(255,255,255,.62)');gr.addColorStop(.55,'rgba(190,190,190,.42)');gr.addColorStop(1,'rgba(120,120,120,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)}
   const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
   const P=new Float32Array(SMKMAX*4),C=new Float32Array(SMKMAX*4),Rr=new Float32Array(SMKMAX),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4),ir=new THREE.InstancedBufferAttribute(Rr,1);[ip,ic,ir].forEach(a=>a.setUsage(THREE.DynamicDrawUsage));g.setAttribute('sP',ip);g.setAttribute('sC',ic);g.setAttribute('sR',ir);g.instanceCount=0;
   const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,
    vertexShader:'attribute vec4 sP;attribute vec4 sC;attribute float sR;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=sC;float c=cos(sR),s=sin(sR);vec2 q=vec2(c*position.x-s*position.y,s*position.x+c*position.y);vec4 mv=modelViewMatrix*vec4(sP.xyz,1.);mv.xy+=q*sP.w;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){vec4 t=texture2D(tex,vU);float a=t.a*vC.a;if(a<.004)discard;gl_FragColor=vec4(vC.rgb*(.62+.55*t.r),a);}'});
   const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=7;scene.add(mesh);return{g,P,C,Rr,ip,ic,ir,n:0,mesh}})();
  RINGM = new THREE.RingGeometry(.82,1,40);
  RINGM.rotateX(-Math.PI/2);
}

export function initializeWorldEffects() {
  RFLAG = [0x59ff8a,0xffc23c].map(col=>{const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0x2a2018,depthTest:false,transparent:true}),c=new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,depthTest:false,transparent:true});const p=new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,.12),m);p.position.y=1.6;const cl=new THREE.Mesh(new THREE.BoxGeometry(1.5,.9,.05),c);cl.position.set(.78,2.7,0);const rg=new THREE.Mesh(new THREE.RingGeometry(.9,1.2,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));rg.rotation.x=-Math.PI/2;rg.position.y=.08;const bm=new THREE.Mesh(new THREE.BoxGeometry(.14,9,.14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,depthWrite:false}));bm.position.y=4.5;
   const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,1)]),ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.8,depthTest:false}));ln.frustumCulled=false;scene.add(ln);
   [p,cl,rg].forEach(o=>o.renderOrder=7);g.add(p,cl,rg,bm);g.userData={cl,rg,ln,lg,col};g.visible=false;ln.visible=false;scene.add(g);return g});
  cloudM = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8890a0,transparent:true,opacity:.92}),CLN*4);
  cloudM.frustumCulled=false;
  scene.add(cloudM);
  for(let i=0;i<CLN;i++)CLD.push({x:Math.random()*400,z:Math.random()*400,y:92+Math.random()*14,w:6+Math.random()*10,d:5+Math.random()*7,s:1+Math.random()*.6});
}
