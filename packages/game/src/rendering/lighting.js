import { hyp } from '../core/math.js';
import { nightSim } from '../gameplay/lighting.js';
import { DIR4, TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { _o, glow } from './effects.js';
import { LMU } from './materials.js';
import { CAM, hemi, scene, sun } from './scene.js';
import { THREE } from './three.js';

/* ---- day / night ---- */
let SKYD;
let SKYN;
let SKYU;
let _sk;
let SUND;
let SUNU;
let _sc;

export let nightK = 0;
let lampT = 0;
let lampN = 0;

function nightTarget(){if(!sessionState.inGame||!sessionState.started)return 0;return nightSim()}

const LP=[];

let LAMPM;
let HALOM;

let LAMPS=[];

function lampList(){LAMPS=[];for(const s of sessionState.structs){if(s.t!==0||s.prog<1)continue;const b=s.bh||0;
  if(s.type==='tower')LAMPS.push([s.x,s.y,b+(s.sz===2?(s.tier===0?4.2:4.6):(s.tier===0?5.45:4.95)),1]);else if(s.type==='gate'){LAMPS.push([s.x,s.y,b+2.6,1])}
  else if(s.type==='castle'){const[fx,fy]=DIR4[(s.rot|0)&3],st=s.tier!==0;for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const fr=dx*fx+dy*fy>0,K=s.sz===5?1.9:1.04;if(st)LAMPS.push([s.x+dx*TS*K,s.y+dy*TS*K,b+(s.sz===5?(fr?6.2:6.9):(fr?5.85:6.6)),1.1]);else if(fr)LAMPS.push([s.x+dx*TS*K*1.04,s.y+dy*TS*K*1.04,b+(s.sz===5?3.1:2.69),.9])}
   const ox=(1.5-1.18)*TS;LAMPS.push(st?[s.x-fx*ox,s.y-fy*ox,b+8.85,1.6]:[s.x-fx*.55*TS,s.y-fy*.55*TS,b+3.44,1.1])}
  else if(s.type==='wall'&&((s.tiles[0][0]+s.tiles[0][1]*3)%5===0))LAMPS.push([s.x,s.y,b+2.2,.6]);else if(s.type==='torch')LAMPS.push([s.x,s.y,b+1.45,.85]);else if(s.type==='market')LAMPS.push([s.x,s.y,b+1.5,.55])}}

function applyLamps(){const N=nightK;if(N<.02){LAMPM.count=0;HALOM.count=0;LP.forEach(l=>l.intensity=0);return}
 if(sessionState.clockT-lampT>.5){lampT=sessionState.clockT;lampList()}
 const cx=CAM.x*TS,cy=CAM.z*TS,R=(CAM.dist*1.8+30)*TS;let n=0;const near=[];
 for(const L of LAMPS){const dd=hyp(L[0]-cx,L[1]-cy);if(dd>R)continue;const fl=1+.12*Math.sin(sessionState.clockT*9+L[0]*.01+L[1]*.02);
  _o.position.set(L[0]/TS,L[2],L[1]/TS);_o.rotation.set(0,sessionState.clockT,0);const sc=.11*L[3]*N;_o.scale.set(sc,sc*1.5,sc);_o.updateMatrix();LAMPM.setMatrixAt(n,_o.matrix);
  glow(L[0]/TS,L[2],L[1]/TS,.8*L[3]*fl,1,.66,.3,.7*N);glow(L[0]/TS,L[2]-.2,L[1]/TS,2.2*L[3],1,.5,.2,.09*N*fl);n++;if(n>=400)break;if(L[3]>=1)near.push([dd,L])}
 LAMPM.count=n;HALOM.count=0;LAMPM.instanceMatrix.needsUpdate=true;
 near.sort((a,b)=>a[0]-b[0]);for(let i=0;i<6;i++){const l=LP[i],q=near[i];if(q){l.position.set(q[1][0]/TS,q[1][2]+.4,q[1][1]/TS);l.intensity=(q[1][3]>1?.58:.4)*N*(1+.1*Math.sin(sessionState.clockT*8+i*2))}else l.intensity=0}}

export function applyDay(dt){const tg=nightTarget();nightK+=(tg-nightK)*Math.min(1,(dt||.016)*1.4);const N=nightK,sm=1-N,dusk=Math.pow(Math.sin(N*Math.PI),2);
 _sk.copy(SKYN).lerp(SKYD,sm).lerp(SKYU,dusk*.45);scene.background.copy(_sk);scene.fog.color.copy(_sk);hemi.intensity=.3+.32*sm;sun.intensity=.12+.66*sm;LMU.value=hemi.intensity+sun.intensity;sun.color.copy(SUND).lerp(SUNU,dusk*.7);dayK=sm;applyLamps()}

export let dayK=1;

export function initializeSceneLighting() {
  SKYD = new THREE.Color(0x9ccaf0);
  SKYN = new THREE.Color(0x141c3c);
  SKYU = new THREE.Color(0xf0a070);
  _sk = new THREE.Color();
  SUND = new THREE.Color(0xfff1d2);
  SUNU = new THREE.Color(0xff9a60);
  _sc = new THREE.Color();
  for(let i=0;i<6;i++){const l=new THREE.PointLight(0xff9a48,0,17,2);l.position.set(0,-50,0);scene.add(l);LP.push(l)}
  LAMPM = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xffc070}),400);
  HALOM = new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff9a40,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}),400);

  [LAMPM,HALOM].forEach(m=>{m.frustumCulled=false;m.count=0;scene.add(m)});
}
