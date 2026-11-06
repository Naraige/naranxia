import { AC, nbuf, ns, SB, sndOn } from '../audio/sound.js';
import { REALR } from '../core/random.js';
import { sessionState } from '../gameplay/session.js';
import { dayK } from './lighting.js';
import { LMU } from './materials.js';
import { CAM, hemi, scene, sun } from './scene.js';
import { gh } from './terrain.js';
import { THREE } from './three.js';

/* ================= SEASONS AND WEATHER (#6) =================
   Visual and audio only: the season and the weather are derived from the wave number (simulation state, equal on both co-op machines),
   everything drawn here is smoothed with the real frame time and never touches units, structures or the seeded RNG.
   A season lasts 4 waves (Spring, Summer, Autumn, Winter, then again). Each wave has one weather: Clear, Rain, Fog or Snow. */
const SEAS = ['Spring','Summer','Autumn','Winter'];
export const SEASC = ['#9be07a','#ffd86a','#ff9a4a','#bfe4ff'];
const WXN = ['Clear','Rain','Fog','Snow'];

const SEAST=[[1,1.03,.98],[1.05,1.02,.93],[1.12,.96,.82],[.9,.98,1.12]];

export let WX;

let _wgR;
let _wgF;
let _wgS;
let _wg;

export const seasonIdx=()=>sessionState.inGame&&sessionState.started?(((sessionState.waveN|0)/4)|0)%4:0;

export function wxKind(){const w=sessionState.waveN|0;if(!sessionState.inGame||!sessionState.started||w<1)return 0;const s=seasonIdx(),h=((w*2654435761+s*40503)>>>0)%100;
 if(s===0)return h<38?1:h<48?2:0;if(s===1)return h<12?2:h<22?1:0;if(s===2)return h<30?2:h<60?1:0;return h<55?3:h<65?2:0}

export const wxLabel=()=>SEAS[seasonIdx()]+(wxKind()?' - '+WXN[wxKind()]:'');

const NRD=900,NSN=700;

function wxInit(){if(WX.rp)return;
 WX.rx=new Float32Array(NRD*3);WX.sx=new Float32Array(NSN*4);
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NRD*6),3));
 WX.rp=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xc4d6ec,transparent:true,opacity:.5,fog:false,depthWrite:false}));WX.rp.frustumCulled=false;WX.rp.visible=false;WX.rp.renderOrder=9;scene.add(WX.rp);
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NSN*3),3));
 WX.sp=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.17,sizeAttenuation:true,transparent:true,opacity:.92,fog:false,depthWrite:false}));WX.sp.frustumCulled=false;WX.sp.visible=false;WX.sp.renderOrder=9;scene.add(WX.sp);
 for(let i=0;i<NRD;i++){WX.rx[i*3]=REALR();WX.rx[i*3+1]=REALR();WX.rx[i*3+2]=REALR()}
 for(let i=0;i<NSN;i++){WX.sx[i*4]=REALR();WX.sx[i*4+1]=REALR();WX.sx[i*4+2]=REALR();WX.sx[i*4+3]=REALR()*6.28}}

function wxSnd(){const mk=(f,q,fq)=>{const s=AC.createBufferSource();s.buffer=nbuf;s.loop=true;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=fq;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;
  const g=AC.createGain();g.gain.value=0;s.connect(hp);hp.connect(bp);bp.connect(g);g.connect(SB);s.start(0,REALR()*1.5);return g};WX.rs=mk(5200,.5,1800);WX.gs=mk(520,.8,160)}

function wxHide(){if(WX.rp){WX.rp.visible=false;WX.sp.visible=false}WX.fl=0;if(WX.rs&&AC){WX.rs.gain.setTargetAtTime(0,AC.currentTime,.3);WX.gs.gain.setTargetAtTime(0,AC.currentTime,.3)}}

export function weatherTick(dt){if(!sessionState.inGame||!sessionState.started){wxHide();return}wxInit();dt=Math.min(dt||.016,.1);
 const s=seasonIdx(),k=wxKind(),a=Math.min(1,dt*.3),b=Math.min(1,dt*.5);
 for(let i=0;i<4;i++){WX.w[i]+=((i===k?1:0)-WX.w[i])*a;WX.s[i]+=((i===s?1:0)-WX.s[i])*b}
 const rain=WX.w[1],fog=WX.w[2],snow=WX.w[3];let tr=0,tg=0,tb=0;for(let i=0;i<4;i++){tr+=SEAST[i][0]*WX.s[i];tg+=SEAST[i][1]*WX.s[i];tb+=SEAST[i][2]*WX.s[i]}
 /* thunder: a flash, then the rumble a second or two later */
 if(!sessionState.paused){WX.th-=dt;if(rain>.6&&WX.th<=0){WX.th=9+REALR()*20;WX.fl=1;if(AC&&sndOn&&SB)ns(2.2,.5,'lowpass',240,60,.7,.5+REALR()*1.6,SB)}}WX.fl=Math.max(0,WX.fl-dt*3.2);
 /* light and sky: season tint, then the grey of the weather */
 const dk=1-.32*rain-.12*fog-.04*snow;hemi.color.setRGB(.863*tr,.925*tg,tb);hemi.intensity=hemi.intensity*dk+WX.fl*1.3;sun.intensity*=1-.5*rain-.3*fog;sun.color.r*=tr;sun.color.g*=tg;sun.color.b*=tb;LMU.value=hemi.intensity+sun.intensity;
 const wsum=rain+fog+snow;if(wsum>.001){_wg.setRGB((_wgR.r*rain+_wgF.r*fog+_wgS.r*snow)/wsum,(_wgR.g*rain+_wgF.g*fog+_wgS.g*snow)/wsum,(_wgR.b*rain+_wgF.b*fog+_wgS.b*snow)/wsum).multiplyScalar(.2+.8*dayK);
  const m=Math.min(.85,rain*.55+fog*.7+snow*.5);scene.background.r*=tr;scene.background.g*=tg;scene.background.b*=tb;scene.background.lerp(_wg,m)}else{scene.background.r*=tr;scene.background.g*=tg;scene.background.b*=tb}
 scene.fog.color.copy(scene.background);const ff=1-.5*fog-.22*rain-.3*snow;scene.fog.near*=ff;scene.fog.far*=ff;
 /* particles in a box around the camera target */
 const R=Math.max(14,Math.min(30,CAM.dist*.85)),top=CAM.y+15,cx=CAM.x,cz=CAM.z;
 const nr=Math.floor(NRD*Math.min(1,rain)*(R/30+.3)),rp=WX.rp;rp.visible=nr>8;
 if(rp.visible){const P=rp.geometry.attributes.position.array,X=WX.rx;for(let i=0;i<nr;i++){let x=cx+(X[i*3]-.5)*2*R,y=top-X[i*3+1]*15,z=cz+(X[i*3+2]-.5)*2*R;
   y-=22*dt;let gy=gh(x,z);if(y<gy){X[i*3]=REALR();X[i*3+2]=REALR();X[i*3+1]=REALR()*.15;y=top-X[i*3+1]*15}X[i*3+1]=(top-y)/15;
   const o=i*6;P[o]=x;P[o+1]=y;P[o+2]=z;P[o+3]=x-.07;P[o+4]=y+.6;P[o+5]=z}
  rp.geometry.setDrawRange(0,nr*2);rp.geometry.attributes.position.needsUpdate=true}
 /* snow flakes, and in the other cases the season's drift: petals (spring), pollen (summer), leaves (autumn) */
 let ns_=snow,sz=.17,col=0xffffff;if(snow<.25){const q=1-snow;if(s===0&&rain<.5){ns_=.12*q;col=0xffc2d6;sz=.2}else if(s===1&&rain<.5){ns_=.07*q;col=0xffe9a0;sz=.1}else if(s===2){ns_=.2*q;col=0xe0782c;sz=.24}}
 const nn=Math.floor(NSN*Math.min(1,ns_)*(R/30+.3)),sp=WX.sp;sp.visible=nn>6;
 if(sp.visible){WX.pc.lerp(_wg.setHex(col),Math.min(1,dt*2));sp.material.color.copy(WX.pc);sp.material.size=sz;const P=sp.geometry.attributes.position.array,X=WX.sx,fall=snow>.25?1.1:.8;
  for(let i=0;i<nn;i++){const o=i*4;X[o+3]+=dt*(1.2+X[o]);let x=cx+(X[o]-.5)*2*R+Math.sin(X[o+3])*.7,y=top-X[o+1]*15,z=cz+(X[o+2]-.5)*2*R+Math.cos(X[o+3]*.8)*.5;
   y-=fall*(.6+X[o]*.8)*dt;const gy=gh(x,z);if(y<gy+.05){X[o]=REALR();X[o+2]=REALR();X[o+1]=REALR()*.2;y=top-X[o+1]*15}X[o+1]=(top-y)/15;
   P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z}
  sp.geometry.setDrawRange(0,nn);sp.geometry.attributes.position.needsUpdate=true}
 /* sound: rain bed, a soft wind in snow and fog */
 if(AC&&SB&&nbuf){if(!WX.rs)wxSnd();const on=!sessionState.paused&&sndOn;WX.rs.gain.setTargetAtTime(on?rain*.07:0,AC.currentTime,.8);WX.gs.gain.setTargetAtTime(on?(snow*.045+fog*.02):0,AC.currentTime,1)}}

export function initializeWeather() {
  WX = {w:[1,0,0,0],s:[1,0,0,0],fl:0,th:6,rp:null,sp:null,rs:null,gs:null,rx:null,sx:null,pc:new THREE.Color(1,1,1)};
  _wgR = new THREE.Color(0x7d8996);
  _wgF = new THREE.Color(0xb4bcc4);
  _wgS = new THREE.Color(0xdde6f0);
  _wg = new THREE.Color();
}
