import { mus, musTick } from './music.js';
import { hyp } from '../core/math.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { dayK } from '../rendering/lighting.js';
import { CAM } from '../rendering/scene.js';
import { seasonIdx, WX } from '../rendering/weather.js';
import { hudDisplayState } from '../ui/hud-state.js';

export const soundState = {
  vM: .9,
  vS: .5,
};

/* ================= AUDIO (procedural WebAudio, no assets) ================= */

export function saveVol(){try{localStorage.setItem('dk_vol',JSON.stringify({m:soundState.vM,s:soundState.vS}))}catch(e){}}

export function applyVol(){if(MB)MB.gain.value=soundState.vM;if(SB)SB.gain.value=soundState.vS*.6}

/* ================= AUDIO (v68): procedural orchestra, Arcane-style beats, layered effects, reverb and stereo =================
   graph: effects -> stereo panner -> SFX bus --+--> master -> glue compressor -> limiter -> speakers
          music voices -> (duck) -> music bus --+--> reverb send (generated hall impulse) -> master */
export let AC = null;
let MG = null;
export let SB = null;
export let MB = null;
let OUT = null;
let RV = null;
export let MDUCK = null;
export let sndOn = true;
export let nbuf = null;
let lastS = {};
let bud = 0;
let budT = 0;
let WIND = null;

function mkIR(sec,dec){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){const t=i/n,w=Math.random()*2-1;lp+=(w-lp)*(.35+.5*(1-t));d[i]=lp*Math.pow(1-t,dec)*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1)}}return b}

export function aInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;AC=new A();
 MG=AC.createGain();MG.gain.value=sndOn?.9:0;const cp=AC.createDynamicsCompressor();cp.threshold.value=-18;cp.ratio.value=3.5;cp.attack.value=.006;cp.release.value=.22;
 const lim=AC.createDynamicsCompressor();lim.threshold.value=-2.5;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.08;MG.connect(cp);cp.connect(lim);lim.connect(AC.destination);
 RV=AC.createConvolver();RV.buffer=mkIR(2.8,2.6);const rvo=AC.createGain();rvo.gain.value=.55;const rlp=AC.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=5200;RV.connect(rlp);rlp.connect(rvo);rvo.connect(MG);
 SB=AC.createGain();SB.connect(MG);const ss=AC.createGain();ss.gain.value=.16;SB.connect(ss);ss.connect(RV);
 MB=AC.createGain();MB.connect(MG);const ms=AC.createGain();ms.gain.value=.34;MB.connect(ms);ms.connect(RV);MDUCK=AC.createGain();MDUCK.connect(MB);applyVol();OUT=SB;
 nbuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 /* wind bed: two band-passed noise layers breathing slowly */
 WIND=[];for(const[f,q,v]of[[320,.7,.05],[900,1.4,.018]]){const w=AC.createBufferSource();w.buffer=nbuf;w.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=AC.createGain();g.gain.value=v;
  const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.07+Math.random()*.05;lg.gain.value=f*.45;l.connect(lg);lg.connect(bp.frequency);l.start();w.connect(bp);bp.connect(g);g.connect(SB);w.start(0,Math.random()*1.5);WIND.push(g)}
 mus.next=AC.currentTime+.15;setInterval(()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})},400);['pointerdown','keydown','touchstart','touchend','click'].forEach(ev=>addEventListener(ev,()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})},{passive:true}));
 setInterval(ambTick,900);setInterval(musTick,50)}catch(e){AC=null}}

export function toggleSound(){sndOn=!sndOn;try{localStorage.setItem('dk_snd',sndOn?'1':'0')}catch(e){}aInit();if(MG)MG.gain.setTargetAtTime(sndOn?.9:0,AC.currentTime,.05);hudDisplayState.msgS='Sound '+(sndOn?'on':'off');hudDisplayState.msgT=1.5}

/* ---- synthesis kit ---- */
function env(g,t,a,v,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(a+.01,d))}

function tn(f,d,type,v,f2,t0,dst){const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
 env(g,t,Math.min(.01,d/4),v,d);o.connect(g);g.connect(dst||OUT);o.start(t);o.stop(t+d+.05)}

export function ns(d,v,ft,f0,f1,q,t0,dst){const t=AC.currentTime+(t0||0),s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type=ft||'lowpass';f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);f.Q.value=q||1;
 const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dst||OUT);s.start(t,Math.random()*1.5,d+.06)}

function metal(fs,d,v,t0){for(let i=0;i<fs.length;i++)tn(fs[i],d*(1-i*.12),'sine',v/(1+i*.6),fs[i]*.995,t0)}

function formant(f,d,v,t0,vow,wob){const t=AC.currentTime+(t0||0),o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*(wob||.82),t+d);const out=AC.createGain();env(out,t,.06,v,d);
 for(const[ff,qq,gg]of(vow||[[520,8,1],[1150,10,.6]])){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=ff;b.Q.value=qq;const g=AC.createGain();g.gain.value=gg;o.connect(b);b.connect(g);g.connect(out)}out.connect(OUT);o.start(t);o.stop(t+d+.05)}

function horn(f,d,v,t0){const t=AC.currentTime+(t0||0),out=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.linearRampToValueAtTime(1500,t+.25);lp.frequency.setValueAtTime(1500,t+d-.3);lp.frequency.linearRampToValueAtTime(400,t+d);
 const vib=AC.createOscillator(),vg=AC.createGain();vib.frequency.value=5.2;vg.gain.value=f*.012;vib.connect(vg);
 for(const det of[-7,6]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.14);o.detune.value=det;vg.connect(o.frequency);o.connect(lp);o.start(t);o.stop(t+d+.05)}
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(v,t+.12);out.gain.setValueAtTime(v,t+d-.3);out.gain.exponentialRampToValueAtTime(.0001,t+d);lp.connect(out);out.connect(OUT);vib.start(t);vib.stop(t+d+.05)}

function coinSnd(){metal([1568,2350,3730],.24,.08,.3);metal([2093,3140],.3,.06,.38)}

function knock(t0,f,v){tn(f,.09,'sine',v,f*.55,t0);ns(.05,v*.7,'bandpass',f*5,f*3,4,t0)}

const SFX={
 click:()=>{tn(1900,.025,'sine',.07,1500);ns(.018,.05,'highpass',5000,0,1)},
 hover:()=>{tn(1250,.02,'sine',.035,1100)},
 ok:()=>{tn(880,.07,'triangle',.08,0);tn(1320,.1,'triangle',.07,0,.05);ns(.02,.03,'highpass',6000,0,1,.05)},
 back:()=>{tn(700,.06,'triangle',.07,520);tn(480,.09,'triangle',.06,380,.04)},
 notice:()=>{tn(1175,.12,'sine',.07,0);tn(1568,.2,'sine',.06,0,.1);tn(2350,.25,'sine',.02,0,.1)},
 caravan:()=>{for(let i=0;i<4;i++){knock(i*.2,130+i%2*25,.14);metal([2800+i*160,4100],.08,.04,i*.2+.03)}tn(262,.5,'triangle',.07,0,.1);tn(330,.5,'triangle',.06,0,.4);tn(392,.7,'triangle',.07,0,.7);metal([1568,2350,3730],.4,.07,.85)},
 convoy:()=>{knock(0,150,.16);knock(.14,170,.14);metal([1760,2640,3960],.3,.08,.2);metal([2093,3140],.35,.06,.3)},
 meteor:()=>{ns(.9,.28,'bandpass',4200,500,1.2);tn(900,.8,'sine',.04,120);for(let i=0;i<4;i++){const t=.5+i*.17+Math.random()*.1;tn(95,.4,'sine',.34,40,t);ns(.3,.3,'lowpass',700,120,1,t);metal([1900,2800],.1,.04,t)}},
 bloodmoon:()=>{tn(55,2.6,'sawtooth',.09,45);tn(82,2.4,'sine',.2,60,.1);formant(70,2.4,.1,.3,[[300,7,1],[760,9,.4]],.8);horn(110,2.2,.1,.6);tn(104,2.2,'sine',.06,98,.6);for(let i=0;i<3;i++)knock(1.1+i*.55,62,.32)},
 wolves:()=>{for(const[t0,f]of[[0,330],[.9,290],[1.6,360]]){tn(f,1.5,'sine',.07,f*1.45,t0);tn(f*1.5,1.3,'triangle',.02,f*2.1,t0+.05);tn(f*1.5,.9,'sine',.05,f*.85,t0+1.3)}ns(.6,.04,'bandpass',600,300,1.5,.2)},
 eclipse:()=>{tn(98,3,'sine',.2,64);tn(147,2.8,'sine',.12,98,.1);metal([196,294,392,588],3,.1,.4);tn(1760,.8,'sine',.05,1320,1.4);tn(1320,.9,'sine',.045,990,1.9);ns(1.8,.1,'bandpass',500,180,1.3,.2)},
 envoy:()=>{horn(262,.6,.09);horn(330,.5,.09,.5);horn(392,.9,.1,.9);metal([1568,2350],.4,.05,1);coinSnd()},
 ruin:()=>{ns(.9,.38,'lowpass',500,80,1);tn(70,.7,'sine',.4,38);for(let i=0;i<4;i++)knock(.15+i*.1,200+Math.random()*120,.1);tn(330,1.4,'sine',.06,0,.45);tn(494,1.4,'sine',.05,0,.52);tn(659,1.6,'sine',.04,0,.6);metal([1568,2350,3730],.7,.05,.7)},
 select:()=>{tn(660,.07,'triangle',.12,0);tn(990,.1,'triangle',.09,0,.04);tn(1980,.08,'sine',.025,0,.04)},
 order:()=>{tn(392,.08,'triangle',.14,330);tn(588,.06,'sine',.05,0,.03);ns(.04,.05,'bandpass',2600,0,3)},
 err:()=>{tn(196,.15,'square',.05,150);tn(185,.15,'square',.04,140);tn(98,.16,'sine',.1,80)},
 build:()=>{knock(0,150,.38);knock(.11,170,.3);ns(.14,.18,'bandpass',900,500,1.6,.03)},
 path:()=>{ns(.09,.22,'bandpass',1500,700,1.2);ns(.06,.12,'highpass',3500,0,1,.03)},
 spawn:()=>{const N=[523,659,784];N.forEach((f,i)=>{tn(f,.28,'triangle',.11,0,i*.07);tn(f*2,.2,'sine',.03,0,i*.07)});ns(.3,.04,'highpass',6000,9000,1,.12)},
 coin:()=>{metal([1568,2350,3730],.24,.11);metal([2093,3140,4980],.3,.09,.07)},
 chop:()=>{tn(170,.1,'sine',.42,80);ns(.08,.55,'bandpass',1300,600,2.8);ns(.03,.3,'highpass',4000,0,1,.005)},
 mine:()=>{metal([2380,3110,4270],.12,.07);ns(.05,.38,'highpass',3200,6000,2);tn(220,.07,'sine',.28,110)},
 sword:()=>{metal([1840,2690,3910,5230],.22,.09);ns(.06,.42,'bandpass',4200,2200,2.5);tn(240,.07,'sine',.16,120)},
 zhit:()=>{tn(110,.13,'sine',.42,55);ns(.13,.38,'lowpass',800,220);ns(.05,.12,'bandpass',1800,900,3,.01)},
 arrow:()=>{tn(210,.06,'triangle',.11,150);ns(.2,.3,'bandpass',900,3800,2.2,.02)},
 stone:()=>{ns(.07,.32,'bandpass',950,450,1.6);tn(140,.06,'sine',.18,90)},
 bolt:()=>{tn(120,.22,'sawtooth',.16,60);ns(.25,.4,'bandpass',700,2600,1.4,.03);metal([980,1430],.14,.04)},
 trebl:()=>{tn(74,.45,'sawtooth',.12,60);ns(.55,.35,'bandpass',260,700,1.8,.1);ns(.4,.3,'lowpass',500,120,1,.35)},
 boom:()=>{ns(1.0,.95,'lowpass',420,45);tn(58,.7,'sine',.85,30);ns(.35,.3,'bandpass',1500,500,1,.05);for(let i=0;i<5;i++)ns(.04,.12,'highpass',2500,0,1,.15+i*.09*Math.random())},
 groan:()=>{const f=85+Math.random()*30;formant(f,.7+Math.random()*.3,.42,0,[[480+Math.random()*80,7,1],[1050,9,.5]],.75)},
 die:()=>{formant(130,.4,.36,0,[[600,6,1],[1300,8,.4]],.55);ns(.15,.25,'lowpass',600,150,1,.12)},
 horn:()=>{horn(147,1.5,.2);horn(220,1.3,.12,.08);tn(73,1.4,'sine',.12,0,.05)},
 fanfare:()=>{[[392,0,.32],[523,.16,.32],[659,.32,.32],[784,.5,.9]].forEach(([f,t,d])=>{horn(f,d,.13,t);tn(f*2,d,'sine',.025,0,t)});metal([2093,3140],.8,.05,.5)},
 victory:()=>{[[294,0,.4],[370,.22,.4],[440,.44,.4],[587,.7,1.4]].forEach(([f,t,d])=>horn(f,d,.12,t));metal([1175,1760,2640],1.4,.06,.7)},
 alarm:()=>{for(let i=0;i<3;i++){metal([880,1320,2210],.32,.1,i*.28);tn(440,.25,'triangle',.06,0,i*.28)}},
 night:()=>{metal([110,220,331,446,580],3.2,.22);metal([164,330,495],2.6,.08,.02);formant(70,2.4,.08,.6,[[350,6,1],[800,8,.4]],.9)},
 crumble:()=>{ns(1.3,.85,'lowpass',520,70);tn(66,.9,'sine',.6,32);for(let i=0;i<7;i++)knock(.1+i*.11*Math.random()+i*.05,240+Math.random()*200,.12)},
 gate:()=>{tn(78,.6,'sawtooth',.08,120);ns(.5,.18,'bandpass',320,560,3);knock(.55,110,.3)},
 heal:()=>{tn(880,.25,'sine',.07);tn(1320,.3,'sine',.06,0,.08);tn(1760,.35,'sine',.04,0,.16);ns(.4,.03,'highpass',7000,0,1,.05)},
 clank:()=>{metal([1500,2280,3460],.14,.06);ns(.07,.3,'highpass',2600,5000,2)},
 dirt:()=>{ns(.22,.48,'lowpass',700,220);ns(.08,.16,'bandpass',1600,700,2,.04)},
 fuse:()=>{ns(1.1,.2,'highpass',3600,7000,1.4);for(let i=0;i<7;i++)ns(.03,.2,'bandpass',5200,0,4,i*.15+Math.random()*.05)},
 spit:()=>{ns(.16,.4,'bandpass',900,300,2.5);tn(190,.12,'sine',.22,90);ns(.1,.18,'highpass',2600,0,1,.06)},
 sizzle:()=>{ns(.9,.17,'highpass',4200,2600,1.2);ns(.5,.09,'bandpass',2200,0,2,.1)}};

const SMIN={fuse:.4,spit:.12,sizzle:.5,ok:.04,back:.04,notice:.3,caravan:2,convoy:1,meteor:2,bloodmoon:4,wolves:3,eclipse:4,envoy:2,ruin:1,sword:.05,zhit:.05,arrow:.06,stone:.09,die:.05,chop:.1,mine:.1,coin:.08,groan:.4,path:.05,dirt:.08,build:.12,click:.02,hover:.05,heal:.3,gate:.3,alarm:1.5,night:4,fanfare:1,victory:2,horn:1};

export let snd = function snd(n,x,y){if(!AC||!sndOn||AC.state!=='running')return;const t=performance.now();if(t-budT>120){budT=t;bud=0}if(bud>=8)return;if(t-(lastS[n]||0)<(SMIN[n]||.03)*1000)return;
 let v=1,pan=0;if(x!==undefined){const wx=x/TS-CAM.x,wz=y/TS-CAM.z,d=hyp(wx,wz);v=Math.max(0,1-d/(CAM.dist+34));v*=v;if(v<.03)return;pan=Math.max(-.85,Math.min(.85,(wx*Math.cos(CAM.yaw)-wz*Math.sin(CAM.yaw))/(CAM.dist*.9+4)))}
 lastS[n]=t;bud++;const g=AC.createGain();g.gain.value=v;if(pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(SB)}else g.connect(SB);OUT=g;try{SFX[n]()}catch(e){}OUT=SB};

/* ambience: wind always, birds by day, crickets / owls / distant wolves by night */
function ambTick(){if(!AC||!sndOn||AC.state!=='running')return;OUT=SB;const on=sessionState.started&&!sessionState.paused;if(WIND)WIND.forEach((g,i)=>g.gain.setTargetAtTime(on?(i?.016:.045)*(1.2-dayK*.4):.02,AC.currentTime,1.2));if(!on)return;
 if(dayK>.55&&seasonIdx()!==3&&WX.w[1]<.4&&Math.random()<.38){const f=2400+Math.random()*1700,n=2+((Math.random()*4)|0);for(let i=0;i<n;i++){tn(f*(1+i%2*.12),.06,'sine',.028,f*1.35,i*.1);tn(f*2.01,.04,'sine',.008,0,i*.1)}}
 if(dayK<.42){if(Math.random()<.7)for(let i=0;i<4;i++){tn(4400,.05,'sine',.012,4380,i*.07);tn(4400,.05,'sine',.012,4380,.45+i*.07)}
  if(Math.random()<.06){tn(390,.32,'sine',.05,370);tn(330,.5,'sine',.045,315,.42)}
  if(Math.random()<.025){const t0=Math.random()*.3;tn(420,1.6,'triangle',.03,700,t0);tn(700,1.2,'triangle',.022,520,t0+1.4)}}}

export function setSndHandler(handler) {
  snd = handler;
}

export function initializeSound() {
  try{const v=JSON.parse(localStorage.getItem('dk_vol')||'{}');if(typeof v.m==='number')soundState.vM=v.m;if(typeof v.s==='number')soundState.vS=v.s}catch(e){}

  try{sndOn=localStorage.getItem('dk_snd')!=='0'}catch(e){}
}
