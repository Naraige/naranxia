import { TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW } from '../gameplay/swarm.js';
import { matV, matWater } from './materials.js';
import { THREE } from './three.js';
import { setUNITSHHandler, UNITSH } from './unit-instances.js';
import { cvs } from '../ui/canvases.js';

export const fogState = {
  fowTm: -9,
};

/* ================= FOG OF WAR (shader-level, works on every material) ================= */
const FWC = 2;
let FW;
let FH;

export let fowVis;
export let fowSeen;
export let fowTex;

export let fowT;

export let FOWU;

export const LITN = 320;
export const litTex = new Uint8Array(LITN*LITN);
export let litT;

/* the pixel shaders of blocks, units and water used to replace this hook (the 3D fog of war had silently vanished): chain it back in */
export let FOWH;

export let FOWC;
let FOWG;
let FOWI;
const FLUT = new Uint8Array(256);
const fowIdx=(x,y)=>Math.min(FH-1,Math.max(0,(y/TS/FWC)|0))*FW+Math.min(FW-1,Math.max(0,(x/TS/FWC)|0));

export const fowVisAt=(x,y)=>fowTex[fowIdx(x,y)]>=190,fowSeenAt=(x,y)=>fowSeen[fowIdx(x,y)]>0;

export let fowRA;
export let fowLo;
export let fowHi;

export function fowReset(){fowSeen.fill(0);fowTex.fill(0);fowVis.fill(0);fogState.fowTm=-9;fowT.needsUpdate=true;fowRA.fill(8);fowLo.fill(0);fowHi.fill(FW-1)}

function fowStamp(x,y,r){const cx=x/TS/FWC,cy=y/TS/FWC,rr=r/FWC,r2=rr*rr,r3=Math.max(0,rr-1.5)*Math.max(0,rr-1.5),x0=Math.max(0,Math.floor(cx-rr)),x1=Math.min(FW-1,Math.ceil(cx+rr)),y0=Math.max(0,Math.floor(cy-rr)),y1=Math.min(FH-1,Math.ceil(cy+rr));
 for(let j=y0;j<=y1;j++){fowRA[j]=8;if(x0<fowLo[j])fowLo[j]=x0;if(x1>fowHi[j])fowHi[j]=x1;const dy=j+.5-cy,dy2=dy*dy;for(let i=x0;i<=x1;i++){const dx=i+.5-cx,d=dx*dx+dy2;if(d>r2)continue;const k=j*FW+i,v=d<=r3?2:1;if(fowVis[k]<v)fowVis[k]=v}}}

export const VRN = {cannon:13,peasant:9,knight:11,spearman:11,archer:14,bannerman:11,captain:13,king:14,guard:11,scout:26,engineer:10,envoy:14};
const VSN = {castle:28,tower:19,barracks:13,gate:8,wall:6,market:9,torch:8,ballista:19,trebuchet:33,forester:9,guild:9,observatory:30,granary:7,bell:7,sanctuary:8,beacon:20,orchard:6,forge:8,embassy:8,warroom:8,sappers:7};
export const vsnOf=s=>s.weapon?Math.max(VSN[s.type]||6,VSN[s.weapon]||0):(VSN[s.type]||6);

export function fowUpdate(dt){fogState.fowTm-=dt;if(fogState.fowTm>0)return;fogState.fowTm=.2;
 for(const u of sessionState.units)if(u.t===0&&u.hp>0)fowStamp(u.x,u.y,VRN[u.type]||10);
 for(const s of sessionState.structs)if(s.t===0)fowStamp(s.x,s.y,s.prog>=1?vsnOf(s):4);
 if(SW.n){const st=Math.max(1,Math.ceil(SW.n/450));for(let i=0;i<SW.n;i+=st)if(SW.hp[i]>0)fowStamp(SW.x[i],SW.y[i],5)}
 for(const u of sessionState.units)if(u.t===1&&u.hp>0&&u.lane>=0)fowStamp(u.x,u.y,5);
 /* a texel settles at most 6 refreshes after it was last in sight, so a row untouched for 8 refreshes is final */
 const im=FOWI.data;let r0=FH,r1=-1,c0=FW,c1=-1;
 for(let j=0;j<FH;j++){if(!fowRA[j])continue;fowRA[j]--;const lo=fowLo[j],hi=fowHi[j];if(j<r0)r0=j;r1=j;if(lo<c0)c0=lo;if(hi>c1)c1=hi;
  for(let k=j*FW+lo,ke=j*FW+hi;k<=ke;k++){const v=fowVis[k];let c=fowTex[k];if(v){fowVis[k]=0;fowSeen[k]=1;const t=v===2?255:205;c=c<t?Math.min(t,c+70):Math.max(t,c-30)}else{const t=fowSeen[k]?128:0;c=c<t?Math.min(t,c+70):Math.max(t,c-24)}fowTex[k]=c;im[k*4+3]=FLUT[c]}
  if(!fowRA[j]){fowLo[j]=32767;fowHi[j]=-1}}
 if(r1>=0){fowT.needsUpdate=true;FOWG.putImageData(FOWI,0,0,c0,r0,c1-c0+1,r1-r0+1)}}

export function initializeFog() {
  FW = Math.ceil(TW/FWC);
  FH = Math.ceil(TH/FWC);
  fowVis = new Uint8Array(FW*FH);
  fowSeen = new Uint8Array(FW*FH);
  fowTex = new Uint8Array(FW*FH);
  fowT = new THREE.DataTexture(fowTex,FW,FH,THREE.LuminanceFormat,THREE.UnsignedByteType);
  fowT.minFilter=fowT.magFilter=THREE.LinearFilter;
  fowT.generateMipmaps=false;
  fowT.wrapS=fowT.wrapT=THREE.ClampToEdgeWrapping;
  fowT.unpackAlignment=1;
  FOWU = {tFow:{value:fowT},fowP:{value:new THREE.Vector4(1/TW,1/TH,0,0)}};
  litT = new THREE.DataTexture(litTex,LITN,LITN,THREE.LuminanceFormat,THREE.UnsignedByteType);
  litT.minFilter=litT.magFilter=THREE.LinearFilter;
  litT.generateMipmaps=false;
  litT.wrapS=litT.wrapT=THREE.ClampToEdgeWrapping;
  litT.unpackAlignment=1;
  FOWU.tLit={value:litT};
  FOWU.litP={value:new THREE.Vector4(0,0,1/LITN,0)};

  THREE.Material.prototype.onBeforeCompile=function(sh){
   if(!sh.vertexShader.includes('#include <fog_vertex>')||!sh.fragmentShader.includes('#include <fog_fragment>')||!(sh.vertexShader.includes('#include <begin_vertex>')||sh.vertexShader.includes('vec3 transformed')))return;
   sh.uniforms.tFow=FOWU.tFow;sh.uniforms.fowP=FOWU.fowP;sh.uniforms.tLit=FOWU.tLit;sh.uniforms.litP=FOWU.litP;
   sh.vertexShader='varying vec2 vFow;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n{vec4 fp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfp=instanceMatrix*fp;\n#endif\nfp=modelMatrix*fp;vFow=fp.xz;}');
   sh.fragmentShader='uniform sampler2D tFow;uniform sampler2D tLit;uniform vec4 fowP;uniform vec4 litP;varying vec2 vFow;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\nif(fowP.w>.5){vec2 fq=vFow*fowP.xy;float fv=texture2D(tFow,fq).r;float fk=fv<.5?mix(.0,.4,fv*2.):mix(.4,1.,(fv-.5)*2.);vec3 c=gl_FragColor.rgb;if(fowP.z>.01){vec2 lq=(vFow-litP.xy)*litP.z;float L=(lq.x>0.&&lq.y>0.&&lq.x<1.&&lq.y<1.)?texture2D(tLit,lq).r:0.;c*=mix(1.,.1+.9*L,fowP.z);c=mix(c,c*vec3(1.12,.94,.76),fowP.z*L*.35);}c*=mix(vec3(.62,.7,.88),vec3(1.),smoothstep(.45,.95,fk));gl_FragColor.rgb=mix(vec3(.01,.014,.03),c,fk);}')};
  FOWH = THREE.Material.prototype.onBeforeCompile;

  {const wrap=f=>{const g=function(sh,r){f.call(this,sh,r);FOWH.call(this,sh,r)},k=f.toString()+'/*fow*/';g.toString=()=>k;return g};matV.onBeforeCompile=wrap(matV.onBeforeCompile);matWater.onBeforeCompile=wrap(matWater.onBeforeCompile);setUNITSHHandler(wrap(UNITSH))}
}

export function initializeFogOverlay() {
  FOWC = cvs(FW,FH);
  FOWG = FOWC.getContext('2d');
  FOWI = FOWG.createImageData(FW,FH);

  for(let i=0;i<256;i++)FLUT[i]=Math.round(i<128?238-(i/128)*112:126-((i-128)/127)*126);

  for(let i=0;i<FW*FH;i++){FOWI.data[i*4]=6;FOWI.data[i*4+1]=9;FOWI.data[i*4+2]=16}
  fowRA = new Uint8Array(FH);
  fowLo = new Int16Array(FH).fill(32767);
  fowHi = new Int16Array(FH).fill(-1);
}
