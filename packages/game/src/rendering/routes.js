import { hyp } from '../core/math.js';
import { tfo } from '../gameplay/construction.js';
import { TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { swarmBackIdx, swarmState } from '../gameplay/swarm.js';
import { bxc, newG, quad, toGeo } from './geometry.js';
import { scene } from './scene.js';
import { CHK, keyOf } from './terrain.js';
import { THREE } from './three.js';
import { gOK } from '../world/routes.js';
import { CH, HT, LAND, ter, terrainState, WLV } from '../world/terrain-state.js';

/* ---- zombie route lines: a glowing ribbon with chevrons flowing toward the castle, drawn only ahead of a living horde ---- */
let routeMat;

let beamMat;

const BEAMS=[];
function beamAt(i,x,y,z){let m=BEAMS[i];if(!m){m=new THREE.Mesh(new THREE.CylinderGeometry(.55,.9,26,12,1,true),beamMat);m.renderOrder=4;scene.add(m);BEAMS[i]=m}m.position.set(x,y+13,z);m.visible=true}

let routeMesh=null,routeT=-9;
export const LANE_REAR=[];

/* lanes with a living horde, and for each the rear-most point of the horde along its route */
export function visLanes(){const s=new Set();for(const u of sessionState.units)if(u.t===1&&u.lane>=0)s.add(u.lane);if(typeof swarmState.SWARMS!=='undefined')for(const w of swarmState.SWARMS)if(w.n>0)s.add(w.lane);return s}

function laneRear(){const L=visLanes(),cnt={};for(const k of L)LANE_REAR[k]=1e9;
 for(const u of sessionState.units){if(u.t!==1||u.lane<0||!L.has(u.lane))continue;const k=u.lane;cnt[k]=(cnt[k]||0)+1;if(cnt[k]>260&&((u.uid|0)%4))continue;const P=terrainState.ROUTES[k].pts;let bi=u.rpi|0,bd=1e18;const x=u.x/TS,y=u.y/TS;
  const a0=u.rpi===undefined?0:Math.max(0,u.rpi-14),a1=u.rpi===undefined?P.length:Math.min(P.length,u.rpi+15);for(let i=a0;i<a1;i++){const dx=P[i][0]-x,dy=P[i][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}u.rpi=bi;if(bi<LANE_REAR[k])LANE_REAR[k]=bi}
 if(typeof swarmState.SWARMS!=='undefined')for(const w of swarmState.SWARMS)if(w.n>0)LANE_REAR[w.lane]=Math.min(LANE_REAR[w.lane],Math.max(0,swarmBackIdx(w)));
 for(const k of L)if(LANE_REAR[k]>=1e9)LANE_REAR[k]=0;return L}

export function buildRoutes(){routeT=-9}

function updateRoutes(){if(sessionState.clockT-routeT<.3)return;routeT=sessionState.clockT;const L=laneRear(),P3=[],UV=[],IX=[];let n=0,bi=0;
 const sy=(x,z)=>{const tx=Math.floor(x),tz=Math.floor(z);if(!gOK(tx,tz))return LAND;const i=tz*TW+tx;return(ter[i]===1?WLV:HT[i])+.15};
 for(const k of L){const R=terrainState.ROUTES[k],P=R.pts,ld=i=>CHK.has(keyOf((P[i][0]/CH)|0,(P[i][1]/CH)|0)),r0=Math.max(0,(LANE_REAR[k]|0)-2);let ul=0,prev=null;
  for(let i=r0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(!ld(i)||!ld(i+1)){prev=null;ul+=hyp(b[0]-a[0],b[1]-a[1]);continue}const dx=b[0]-a[0],dz=b[1]-a[1],l=hyp(dx,dz)||1,nx=-dz/l*.5,nz=dx/l*.5,st=Math.max(1,Math.round(l/.5));
   for(let q=(prev?1:0);q<=st;q++){const t=q/st,x=a[0]+dx*t,z=a[1]+dz*t,y=sy(x,z),u2=ul+l*t;P3.push(x-nx,y,z-nz,x+nx,y,z+nz);UV.push(u2,0,u2,1);if(prev!==null||q>0){const v=n;IX.push(v-2,v-1,v+1,v-2,v+1,v);}n+=2;prev=1}
   ul+=l}
  if(r0<5&&ld(0)){const s0=P[0];beamAt(bi++,s0[0],sy(s0[0],s0[1]),s0[1])}}
 for(let k=bi;k<BEAMS.length;k++)BEAMS[k].visible=false;
 if(routeMesh){scene.remove(routeMesh);routeMesh.geometry.dispose()}routeMesh=null;
 if(IX.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3));g.setAttribute('auv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(IX);g.computeBoundingSphere();routeMesh=new THREE.Mesh(g,routeMat);routeMesh.frustumCulled=false;routeMesh.renderOrder=2;scene.add(routeMesh)}}

let tfMesh=null,tfT=-9,tfN=-1;

function updateTf(){if(sessionState.clockT-tfT<.25)return;tfT=sessionState.clockT;let dn=0;for(const s of sessionState.structs)if(s.dem)dn++;const tot=tfo.size+dn;if(!tot&&tfN===0)return;tfN=tot;if(tfMesh){scene.remove(tfMesh);tfMesh.geometry.dispose();tfMesh=null}if(!tot)return;const G=newG();
 for(const s of sessionState.structs)if(s.dem){const bx0=s.x/TS,bz0=s.y/TS,hb=HT[s.tiles[0][1]*TW+s.tiles[0][0]]+((s.bh||0));for(const[x,y]of s.tiles){const h=HT[y*TW+x]+.08;quad(G,[x+.05,h,y+.05],[x+.05,h,y+.95],[x+.95,h,y+.95],[x+.95,h,y+.05],[0,1,0],[1,.2,.15],[1,.2,.15],[1,.2,.15],[1,.2,.15])}bxc(G,bx0,hb+2.6+Math.sin(sessionState.clockT*4)*.12,bz0,.5,.5,.5,[1,.3,.2])}
 for(const[i,o]of tfo){const x=i%TW,y=(i/TW)|0,h=HT[i]+.06,c=o.t==='raise'?[1,.82,.24]:o.t==='ramp'?[.45,.72,1]:o.t==='unramp'?[1,.25,.2]:[.7,.42,.2];quad(G,[x+.08,h,y+.08],[x+.08,h,y+.92],[x+.92,h,y+.92],[x+.92,h,y+.08],[0,1,0],c,c,c,c);bxc(G,x+.5,h,y+.5,.2,.5,.2,o.t==='raise'?[1,1,.6]:[.5,.3,.15])}
 tfMesh=new THREE.Mesh(toGeo(G),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));tfMesh.frustumCulled=false;tfMesh.renderOrder=3;scene.add(tfMesh)}

export function pulseRoutes(){updateTf();updateRoutes();routeMat.uniforms.uT.value=sessionState.clockT;beamMat.uniforms.uT.value=sessionState.clockT}

export function initializeRoutes() {
  routeMat = new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4,
   vertexShader:'attribute vec2 auv;varying vec2 vUv;void main(){vUv=auv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float v=abs(vUv.y-.5)*2.;float edge=1.-smoothstep(.55,1.,v);float core=1.-smoothstep(0.,.3,v);float f=fract(vUv.x*.38-uT*1.15);float ch=1.-smoothstep(0.,.08,abs(f-.5+v*.24)-.06);float fade=smoothstep(0.,6.,vUv.x)*clamp(vUv.y*0.+1.,0.,1.);vec3 c=mix(vec3(.55,.03,.02),vec3(1.,.4,.22),clamp(core*.5+ch*.9,0.,1.));float a=edge*(.32+.5*ch+.18*core)*fade;gl_FragColor=vec4(c,a);}'});
  beamMat = new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float y=vUv.y;float s=.55+.45*sin(y*38.-uT*7.);float a=(1.-y)*(1.-y)*(.55+.35*s);gl_FragColor=vec4(vec3(1.,.18,.1)*a,a);}'});
}
