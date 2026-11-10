import { mus, musBench, musTick } from './music.js';
import { hyp } from '../core/math.js';
import { REALR } from '../core/random.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { languageState } from '../i18n/language.js';
import { dayK } from '../rendering/lighting.js';
import { CAM } from '../rendering/scene.js';
import { seasonIdx, WX } from '../rendering/weather.js';
import { convoyPanelState } from '../ui/convoy-panel.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { modeState } from '../ui/mode-select.js';
import { saveMenuState } from '../ui/save-menu.js';
import { settingsState } from '../ui/settings.js';
import { troopPanelState } from '../ui/troop-panel.js';

/* slider positions 0..1 (Settings > Display & sound), saved in dk_vol. The gain is the square of the position (a slider that feels even). */
export const soundState = {
  vM: .55,
  vS: .55,
};
/* bus gains at slider = 1 and the trim after the limiter; set from the offline measurements in docs/studio-notes/audio.md */
const MUSK=1.7,SFXK=.85,TRIM=.285,FADE=1.6;

/* every random draw of the audio code: the real generator, never the seeded one of the simulation */
const R=()=>(REALR||Math.random)(),ri=n=>(R()*n)|0;

export function saveVol(){try{localStorage.setItem('dk_vol',JSON.stringify({m:soundState.vM,s:soundState.vS}))}catch(e){}}

const musG=()=>soundState.vM*soundState.vM*MUSK,sfxG=()=>soundState.vS*soundState.vS*SFXK;
export function applyVol(){if(!AC)return;const t=AC.currentTime;MB.gain.setTargetAtTime(musG(),t,.03);SB.gain.setTargetAtTime(sfxG(),t,.03)}

/* ================= AUDIO: procedural orchestra and layered effects, no assets =================
   graph: world effects -> panner -> FXB (ducked by alerts) --+--> SB (effects volume) --+--> MG (on/off, fade) -> glue compressor -> limiter -> trim -> speakers
          menu clicks and alerts -> UIB ----------------------+                         |
          music voices -> theme bus -> MB (music volume) -> MF (fade-in at launch) -----+     reverb send from SB and MB (generated hall impulse) */
export let AC = null;
let MG = null;
export let SB = null;
export let MB = null;
let MF = null;
let FXB = null;
let UIB = null;
let OUT = null;
let RV = null;
export let sndOn = true;
export let nbuf = null;
let lastS = {};
let lastP = {};
let lastA = {};
let VO = [];
let bud = 0;
let budT = 0;
let WIND = null;
let woke = false;
/* offline measurement: BENCH on, BT = time of the sound being scheduled */
export let BENCH = false;
let BT = 0;
/* per-sound variation, set by snd(): pitch factor, name */
let PV = 1;
let CUR = '';
let ERRN = 0;

function mkIR(sec,dec){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){const t=i/n,w=R()*2-1;lp+=(w-lp)*(.35+.5*(1-t));d[i]=lp*Math.pow(1-t,dec)*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1)}}return b}

/* builds the whole graph on AC (the live context, or an offline one for measurements). Starts silent: audioWake() fades it in. */
function graph(){
 MG=AC.createGain();MG.gain.value=0;const cp=AC.createDynamicsCompressor();cp.threshold.value=-24;cp.knee.value=18;cp.ratio.value=3;cp.attack.value=.008;cp.release.value=.25;
 const lim=AC.createDynamicsCompressor();lim.threshold.value=-6;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.12;
 /* both compressors add make-up gain: TRIM takes it back, so quiet passages are not pushed up and the ceiling sits well under full scale */
 const trim=AC.createGain();trim.gain.value=TRIM;MG.connect(cp);cp.connect(lim);lim.connect(trim);trim.connect(AC.destination);
 RV=AC.createConvolver();RV.buffer=mkIR(2.8,2.6);const rvo=AC.createGain();rvo.gain.value=.5;const rlp=AC.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=5200;RV.connect(rlp);rlp.connect(rvo);rvo.connect(MG);
 SB=AC.createGain();SB.connect(MG);const ss=AC.createGain();ss.gain.value=.16;SB.connect(ss);ss.connect(RV);FXB=AC.createGain();FXB.connect(SB);UIB=AC.createGain();UIB.connect(SB);
 MF=AC.createGain();MF.gain.value=0;MF.connect(MG);MB=AC.createGain();MB.connect(MF);const ms=AC.createGain();ms.gain.value=.3;MB.connect(ms);ms.connect(RV);
 MB.gain.value=musG();SB.gain.value=sfxG();OUT=FXB;
 nbuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
 /* wind bed: two band-passed noise layers breathing slowly */
 WIND=[];for(const[f,q,v]of[[320,.7,.05],[900,1.4,.018]]){const w=AC.createBufferSource();w.buffer=nbuf;w.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=AC.createGain();g.gain.value=v*.4;
  const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.07+R()*.05;lg.gain.value=f*.45;l.connect(lg);lg.connect(bp.frequency);l.start();w.connect(bp);bp.connect(g);g.connect(FXB);w.start(0,R()*1.5);WIND.push(g)}}

/* first moment the context really runs (browsers hold it until a click or a key): master up in .3 s, music in FADE s, score starts on a clean beat */
export function audioWake(){if(woke||!AC||AC.state!=='running')return;woke=true;const t=AC.currentTime;MG.gain.cancelScheduledValues(t);MG.gain.setValueAtTime(0,t);MG.gain.linearRampToValueAtTime(sndOn?1:0,t+.3);
 MF.gain.setValueAtTime(0,t);MF.gain.linearRampToValueAtTime(1,t+FADE)}

export function aInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;AC=new A();graph();
 AC.onstatechange=audioWake;const res=()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})};setInterval(res,400);['pointerdown','keydown','touchstart','touchend','click'].forEach(ev=>addEventListener(ev,res,{passive:true}));
 setInterval(ambTick,900);setInterval(musTick,50);setInterval(uiWatch,90)}catch(e){AC=null}}

export function toggleSound(){sndOn=!sndOn;try{localStorage.setItem('dk_snd',sndOn?'1':'0')}catch(e){}aInit();if(MG){const t=AC.currentTime;woke=woke||AC.state==='running';MG.gain.cancelScheduledValues(t);MG.gain.setTargetAtTime(sndOn?1:0,t,sndOn?.25:.05);if(sndOn){MF.gain.cancelScheduledValues(t);MF.gain.setValueAtTime(0,t);MF.gain.linearRampToValueAtTime(1,t+FADE);mus.next=t+.2}}
 hudDisplayState.msgS='Sound '+(sndOn?'on':'off');hudDisplayState.msgT=1.5}

/* ---- synthesis kit (PV: pitch variation of the sound being played) ---- */
function env(g,t,a,v,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(a+.01,d))}

function tn(f,d,type,v,f2,t0,dst){const t=AC.currentTime+BT+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f*PV,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2*PV),t+d);
 env(g,t,Math.min(.01,d/4),v,d);o.connect(g);g.connect(dst||OUT);o.start(t);o.stop(t+d+.05)}

export function ns(d,v,ft,f0,f1,q,t0,dst){const t=AC.currentTime+BT+(t0||0),s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type=ft||'lowpass';f.frequency.setValueAtTime(f0*PV,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f1*PV),t+d);f.Q.value=q||1;
 const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dst||OUT);s.start(t,R()*1.5,d+.06)}

function metal(fs,d,v,t0){for(let i=0;i<fs.length;i++)tn(fs[i],d*(1-i*.12),'sine',v/(1+i*.6),fs[i]*.995,t0)}

function formant(f,d,v,t0,vow,wob){const t=AC.currentTime+BT+(t0||0),o=AC.createOscillator();o.type='sawtooth';f*=PV;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*(wob||.82),t+d);const out=AC.createGain();env(out,t,.06,v,d);
 for(const[ff,qq,gg]of(vow||[[520,8,1],[1150,10,.6]])){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=ff;b.Q.value=qq;const g=AC.createGain();g.gain.value=gg;o.connect(b);b.connect(g);g.connect(out)}out.connect(OUT);o.start(t);o.stop(t+d+.05)}

function horn(f,d,v,t0){const t=AC.currentTime+BT+(t0||0),out=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.linearRampToValueAtTime(1500,t+.25);lp.frequency.setValueAtTime(1500,t+d-.3);lp.frequency.linearRampToValueAtTime(400,t+d);
 const vib=AC.createOscillator(),vg=AC.createGain();vib.frequency.value=5.2;vg.gain.value=f*.012;vib.connect(vg);
 for(const det of[-7,6]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.14);o.detune.value=det;vg.connect(o.frequency);o.connect(lp);o.start(t);o.stop(t+d+.05)}
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(v,t+.12);out.gain.setValueAtTime(v,t+d-.3);out.gain.exponentialRampToValueAtTime(.0001,t+d);lp.connect(out);out.connect(OUT);vib.start(t);vib.stop(t+d+.05)}

function coinSnd(){metal([1568,2350,3730],.24,.08,.3);metal([2093,3140],.3,.06,.38)}

function knock(t0,f,v){tn(f,.09,'sine',v,f*.55,t0);ns(.05,v*.7,'bandpass',f*5,f*3,4,t0)}

/* one of k timbres for the current sound, never the same twice in a row */
function alt(k){let a=ri(k);if(a===lastA[CUR])a=(a+1+ri(k-1))%k;lastA[CUR]=a;return a}

const SFX={
 click:()=>{tn(1900,.025,'sine',.07,1500);ns(.018,.05,'highpass',5000,0,1)},
 hover:()=>{tn(1250,.02,'sine',.028,1100)},
 tab:()=>{tn(1400,.03,'sine',.045,1750);ns(.03,.022,'bandpass',3200,4200,2)},
 open:()=>{ns(.14,.05,'bandpass',600,1900,1.2);tn(520,.09,'sine',.035,780,.02)},
 close:()=>{ns(.12,.045,'bandpass',1700,500,1.2);tn(700,.08,'sine',.03,460)},
 tick:()=>{tn(2100,.02,'sine',.05,1900);tn(1050,.03,'triangle',.03,1000)},
 ok:()=>{tn(880,.07,'triangle',.08,0);tn(1320,.1,'triangle',.07,0,.05);ns(.02,.03,'highpass',6000,0,1,.05)},
 back:()=>{tn(700,.06,'triangle',.07,520);tn(480,.09,'triangle',.06,380,.04)},
 notice:()=>{tn(1175,.12,'sine',.07,0);tn(1568,.2,'sine',.06,0,.1);tn(2350,.25,'sine',.02,0,.1)},
 caravan:()=>{for(let i=0;i<4;i++){knock(i*.2,130+i%2*25,.14);metal([2800+i*160,4100],.08,.04,i*.2+.03)}tn(262,.5,'triangle',.07,0,.1);tn(330,.5,'triangle',.06,0,.4);tn(392,.7,'triangle',.07,0,.7);metal([1568,2350,3730],.4,.07,.85)},
 convoy:()=>{knock(0,150,.16);knock(.14,170,.14);metal([1760,2640,3960],.3,.08,.2);metal([2093,3140],.35,.06,.3)},
 meteor:()=>{ns(.9,.28,'bandpass',4200,500,1.2);tn(900,.8,'sine',.04,120);for(let i=0;i<4;i++){const t=.5+i*.17+R()*.1;tn(95,.4,'sine',.34,40,t);ns(.3,.3,'lowpass',700,120,1,t);metal([1900,2800],.1,.04,t)}},
 bloodmoon:()=>{tn(55,2.6,'sawtooth',.09,45);tn(82,2.4,'sine',.2,60,.1);formant(70,2.4,.1,.3,[[300,7,1],[760,9,.4]],.8);horn(110,2.2,.1,.6);tn(104,2.2,'sine',.06,98,.6);for(let i=0;i<3;i++)knock(1.1+i*.55,62,.32)},
 wolves:()=>{for(const[t0,f]of[[0,330],[.9+R()*.3,290],[1.6+R()*.4,360]]){const q=f*(.94+R()*.12);tn(q,1.5,'sine',.07,q*1.45,t0);tn(q*1.5,1.3,'triangle',.02,q*2.1,t0+.05);tn(q*1.5,.9,'sine',.05,q*.85,t0+1.3)}ns(.6,.04,'bandpass',600,300,1.5,.2)},
 eclipse:()=>{tn(98,3,'sine',.2,64);tn(147,2.8,'sine',.12,98,.1);metal([196,294,392,588],3,.1,.4);tn(1760,.8,'sine',.05,1320,1.4);tn(1320,.9,'sine',.045,990,1.9);ns(1.8,.1,'bandpass',500,180,1.3,.2)},
 envoy:()=>{horn(262,.6,.09);horn(330,.5,.09,.5);horn(392,.9,.1,.9);metal([1568,2350],.4,.05,1);coinSnd()},
 ruin:()=>{ns(.9,.38,'lowpass',500,80,1);tn(70,.7,'sine',.4,38);for(let i=0;i<4;i++)knock(.15+i*.1,200+R()*120,.1);tn(330,1.4,'sine',.06,0,.45);tn(494,1.4,'sine',.05,0,.52);tn(659,1.6,'sine',.04,0,.6);metal([1568,2350,3730],.7,.05,.7)},
 select:()=>{tn(660,.07,'triangle',.12,0);tn(990,.1,'triangle',.09,0,.04);tn(1980,.08,'sine',.025,0,.04)},
 order:()=>{tn(392,.08,'triangle',.14,330);tn(588,.06,'sine',.05,0,.03);ns(.04,.05,'bandpass',2600,0,3)},
 err:()=>{tn(196,.15,'square',.05,150);tn(185,.15,'square',.04,140);tn(98,.16,'sine',.1,80)},
 build:()=>{const a=alt(3);knock(0,150+a*14,.38);knock(.11+a*.02,170-a*10,.3);if(a===2)knock(.24,140,.2);ns(.14,.18,'bandpass',900,500,1.6,.03)},
 path:()=>{ns(.09,.22,'bandpass',1500,700,1.2);ns(.06,.12,'highpass',3500,0,1,.03)},
 spawn:()=>{const N=[[523,659,784],[523,659,880],[587,740,880]][alt(3)];N.forEach((f,i)=>{tn(f,.28,'triangle',.11,0,i*.07);tn(f*2,.2,'sine',.03,0,i*.07)});ns(.3,.04,'highpass',6000,9000,1,.12)},
 coin:()=>{metal([1568,2350,3730],.24,.11);metal([2093,3140,4980],.3,.09,.05+R()*.05)},
 chop:()=>{const a=alt(3);tn(170-a*18,.1,'sine',.42,80);ns(.08,.55,'bandpass',1300-a*160,600,2.8);ns(.03,.3,'highpass',4000,0,1,.005);if(a===1)ns(.12,.1,'bandpass',2600,1200,3,.05)},
 mine:()=>{const a=alt(3);metal([[2380,3110,4270],[2140,3350,4630],[2620,3480,4010]][a],.12,.07);ns(.05,.38,'highpass',3200,6000,2);tn(220-a*20,.07,'sine',.28,110);if(a===2)ns(.1,.08,'bandpass',900,400,2,.06)},
 sword:()=>{const a=alt(4);metal([[1840,2690,3910,5230],[2060,2940,4380],[1620,2480,3620,4870],[2290,3170,4610]][a],.18+a*.02,.09);ns(.06,.42,'bandpass',4200-a*350,2200,2.5);tn(240,.07,'sine',.16,120);if(a===3)ns(.12,.12,'highpass',5200,7000,1,.03)},
 zhit:()=>{const a=alt(3);tn(110+a*12,.13,'sine',.42,55);ns(.13,.38,'lowpass',800-a*120,220);ns(.05,.12,'bandpass',1800,900,3,.01);if(a===2)tn(70,.1,'sine',.2,45,.03)},
 arrow:()=>{const a=alt(3);tn(210+a*18,.06,'triangle',.11,150);ns(.2-a*.03,.3,'bandpass',900+a*200,3800+a*500,2.2,.02)},
 stone:()=>{const a=alt(3);ns(.07,.32,'bandpass',950-a*130,450,1.6);tn(140-a*14,.06,'sine',.18,90)},
 bolt:()=>{tn(120,.22,'sawtooth',.16,60);ns(.25,.4,'bandpass',700,2600,1.4,.03);metal([980,1430],.14,.04)},
 trebl:()=>{tn(74,.45,'sawtooth',.12,60);ns(.55,.35,'bandpass',260,700,1.8,.1);ns(.4,.3,'lowpass',500,120,1,.35)},
 boom:()=>{ns(1.0,.95,'lowpass',420,45);tn(58,.7,'sine',.85,30);ns(.35,.3,'bandpass',1500,500,1,.05);for(let i=0;i<5;i++)ns(.04,.12,'highpass',2500,0,1,.15+i*.09*R())},
 groan:()=>{const f=85+R()*30;formant(f,.7+R()*.3,.42,0,[[[480+R()*80,7,1],[1050,9,.5]],[[380+R()*60,6,1],[900,8,.5]],[[560+R()*60,7,1],[1250,9,.4]]][alt(3)],.7+R()*.12)},
 die:()=>{const a=alt(3);formant(130-a*14,.4+a*.06,.36,0,[[600-a*60,6,1],[1300-a*90,8,.4]],.55-a*.05);ns(.15,.25,'lowpass',600,150,1,.12)},
 horn:()=>{horn(147,1.5,.2);horn(220,1.3,.12,.08);tn(73,1.4,'sine',.12,0,.05)},
 fanfare:()=>{[[392,0,.32],[523,.16,.32],[659,.32,.32],[784,.5,.9]].forEach(([f,t,d])=>{horn(f,d,.13,t);tn(f*2,d,'sine',.025,0,t)});metal([2093,3140],.8,.05,.5)},
 victory:()=>{[[294,0,.4],[370,.22,.4],[440,.44,.4],[587,.7,1.4]].forEach(([f,t,d])=>horn(f,d,.12,t));metal([1175,1760,2640],1.4,.06,.7)},
 alarm:()=>{for(let i=0;i<3;i++){metal([880,1320,2210],.32,.1,i*.28);tn(440,.25,'triangle',.06,0,i*.28)}},
 night:()=>{metal([110,220,331,446,580],3.2,.22);metal([164,330,495],2.6,.08,.02);formant(70,2.4,.08,.6,[[350,6,1],[800,8,.4]],.9)},
 crumble:()=>{ns(1.3,.85,'lowpass',520,70);tn(66,.9,'sine',.6,32);for(let i=0;i<7;i++)knock(.1+i*.11*R()+i*.05,240+R()*200,.12)},
 gate:()=>{tn(78,.6,'sawtooth',.08,120);ns(.5,.18,'bandpass',320,560,3);knock(.55,110,.3)},
 heal:()=>{tn(880,.25,'sine',.07);tn(1320,.3,'sine',.06,0,.08);tn(1760,.35,'sine',.04,0,.16);ns(.4,.03,'highpass',7000,0,1,.05)},
 clank:()=>{const a=alt(3);metal([[1500,2280,3460],[1340,2460,3180],[1680,2150,3720]][a],.14,.06);ns(.07,.3,'highpass',2600,5000,2)},
 dirt:()=>{const a=alt(2);ns(.22,.48,'lowpass',700-a*150,220);ns(.08,.16,'bandpass',1600,700,2,.04+a*.03)},
 fuse:()=>{ns(1.1,.2,'highpass',3600,7000,1.4);for(let i=0;i<7;i++)ns(.03,.2,'bandpass',5200,0,4,i*.15+R()*.05)},
 spit:()=>{ns(.16,.4,'bandpass',900,300,2.5);tn(190,.12,'sine',.22,90);ns(.1,.18,'highpass',2600,0,1,.06)},
 sizzle:()=>{ns(.9,.17,'highpass',4200,2600,1.2);ns(.5,.09,'bandpass',2200,0,2,.1)}};

/* per sound: [family, shortest gap (s), length (s), pitch variation (+-), level].
   families: 0 interface, 1 alerts and events (never dropped, duck the rest), 2 combat, 3 work, 4 voices. */
const META={click:[0,.02,.05,.02,1],hover:[0,.05,.03,.03,1],tab:[0,.05,.05,.03,1],open:[0,.15,.15,.04,1],close:[0,.15,.15,.04,1],tick:[0,.07,.04,.02,1],ok:[0,.04,.15,.01,1],back:[0,.04,.15,.01,1],
 select:[0,.03,.14,.02,.8],order:[0,.03,.1,.03,.8],err:[0,.08,.2,.02,1],coin:[0,.08,.3,.03,.8],path:[3,.05,.1,.08,.8],
 notice:[1,.3,.4,0,1],caravan:[1,2,1.3,0,1],convoy:[1,1,.6,.02,1],meteor:[1,2,1.4,.04,.8],bloodmoon:[1,4,2.8,0,.9],wolves:[1,3,2.8,0,1],eclipse:[1,4,3.2,0,.9],envoy:[1,2,1.8,0,1],ruin:[1,1,1.8,.03,.8],
 horn:[1,1,1.6,0,.85],fanfare:[1,1,1.4,0,.9],victory:[1,2,2.1,0,.9],alarm:[1,1.5,.9,0,.9],night:[1,4,3.2,0,.8],
 sword:[2,.06,.22,.07,.8],zhit:[2,.06,.15,.1,.8],arrow:[2,.07,.2,.09,.85],stone:[2,.09,.1,.1,.9],bolt:[2,.08,.28,.07,.85],trebl:[2,.2,.7,.06,.9],boom:[2,.15,1,.08,.7],clank:[2,.06,.15,.08,.85],
 spit:[2,.12,.2,.09,.85],sizzle:[2,.5,.9,.06,.9],fuse:[2,.4,1.1,.05,.9],crumble:[2,.3,1.3,.07,.7],
 build:[3,.12,.25,.06,.8],chop:[3,.1,.12,.08,.7],mine:[3,.1,.14,.06,.75],dirt:[3,.08,.25,.1,.8],gate:[3,.3,.7,.05,.9],heal:[3,.3,.45,.03,1],spawn:[3,.1,.4,.01,.85],
 groan:[4,.5,.9,.1,.6],die:[4,.07,.4,.1,.75]},DEF=[2,.05,.3,.05,.8];
/* voices allowed at once per family, and in total for the world (families 2-4) */
const CAP=[5,4,7,4,3],CAPW=12;

/* an alert passes over the fight: world effects dip while it sounds */
function duck(d){const t=AC.currentTime+BT;FXB.gain.cancelScheduledValues(t);FXB.gain.setTargetAtTime(.45,t,.04);FXB.gain.setTargetAtTime(1,t+Math.min(1.6,d*.7),.35)}

export let snd = function snd(n,x,y){if(!AC||!sndOn||!SFX[n])return;if(!BENCH){if(AC.state!=='running')return;audioWake()}
 const M=META[n]||DEF,c=M[0],t=BENCH?BT*1000:performance.now();if(t-(lastS[n]===undefined?-1e9:lastS[n])<M[1]*1000)return;
 if(c>1){if(t-budT>120||t<budT){budT=t;bud=0}if(bud>=6)return}
 let k=0,w=0;for(let i=VO.length-1;i>=0;i--){const q=VO[i];if(q[0]<=t||q[0]>t+6000)VO.splice(i,1);else{if(q[1]===c)k++;if(q[1]>1)w++}}
 if(k>=CAP[c]||(c>1&&w>=CAPW))return;
 let v=M[4],pan=0;if(x!==undefined){const wx=x/TS-CAM.x,wz=y/TS-CAM.z,d=hyp(wx,wz);v*=Math.pow(Math.max(0,1-d/(CAM.dist+34)),2);if(v<.03)return;pan=Math.max(-.85,Math.min(.85,(wx*Math.cos(CAM.yaw)-wz*Math.sin(CAM.yaw))/(CAM.dist*.9+4)))}
 /* a crowd of the same family gets quieter per voice: a big fight grows denser, not louder */
 if(c>1)v*=(.88+R()*.24)/(1+k*.22);
 lastS[n]=t;if(c>1)bud++;VO.push([t+M[2]*1000,c]);
 /* pitch: random within the range of the sound, pushed away from the last one played */
 {const r=M[3];let p=(R()*2-1)*r;const l=lastP[n]||0;if(r&&Math.abs(p-l)<r*.3)p=(l>0?-1:1)*r*(.35+R()*.65);lastP[n]=p;PV=1+p}
 CUR=n;const g=AC.createGain();g.gain.value=v;const dst=c<2?UIB:FXB;if(pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(dst)}else g.connect(dst);
 if(c===1)duck(M[2]);OUT=g;try{SFX[n]()}catch(e){ERRN++}OUT=FXB;PV=1};

/* ambience: wind always, birds by day, crickets / owls / distant wolves by night */
function ambTick(){if(!AC||!sndOn||BENCH||AC.state!=='running')return;OUT=FXB;PV=1;const on=sessionState.started&&!sessionState.paused;if(WIND)WIND.forEach((g,i)=>g.gain.setTargetAtTime(on?(i?.016:.045)*(1.2-dayK*.4):.02,AC.currentTime,1.2));if(!on)return;
 if(dayK>.55&&seasonIdx()!==3&&WX.w[1]<.4&&R()<.38){const f=2400+R()*1700,n=2+ri(4),k=ri(3);
  for(let i=0;i<n;i++){if(k===0){tn(f*(1+i%2*.12),.06,'sine',.028,f*1.35,i*.1);tn(f*2.01,.04,'sine',.008,0,i*.1)}else if(k===1)tn(f*.8,.09,'sine',.024,f*(i%2?.62:1.05),i*.14);else{tn(f*1.1,.03,'sine',.022,f*1.2,i*.06);tn(f*1.1,.03,'sine',.018,f*1.2,i*.06+.03)}}}
 if(dayK<.42){if(R()<.7){const f=4200+R()*400;for(let i=0;i<4;i++){tn(f,.05,'sine',.012,f-20,i*.07);tn(f,.05,'sine',.012,f-20,.45+i*.07)}}
  if(R()<.06){const f=370+R()*40;tn(f,.32,'sine',.05,f*.95);tn(f*.85,.5,'sine',.045,f*.8,.42)}
  if(R()<.025){const t0=R()*.3,f=390+R()*60;tn(f,1.6,'triangle',.03,f*1.65,t0);tn(f*1.65,1.2,'triangle',.022,f*1.25,t0+1.4)}}}

/* windows opening and closing: read from the menu flags (never written here), so the menus need no sound code of their own */
let UW0=-1;
function uiWatch(){if(BENCH)return;let n=0;try{for(const x of[settingsState.settingsOpen,settingsState.setupOpen,languageState.langOpen,saveMenuState.saveOpen,modeState.open,troopPanelState.troopsOpen,convoyPanelState.convoyOpen,sessionState.showMap])if(x)n++}catch(e){return}
 if(UW0>=0&&n!==UW0)snd(n>UW0?'open':'close');UW0=n}

export function setSndHandler(handler) {
  snd = handler;
}

/* offline measurement of what the speakers get (peak and RMS, dBFS). sc: 'launch' (first click, fade-in, title music), 'battle' (battle music + a
   dense fight through snd()), 'cal' (a quiet sine straight into the master: gain of the chain), or a theme name. Used by tools/run.py, never in play. */
export async function audioBench(sc,sec){const keep=[AC,MG,SB,MB,MF,FXB,UIB,RV,nbuf,WIND,OUT,woke,lastS,lastP,VO,bud,budT],sr=44100;sec=sec||12;
 AC=new OfflineAudioContext(2,sr*sec,sr);graph();BENCH=true;lastS={};lastP={};VO=[];bud=0;budT=0;let b;
 try{MG.gain.setValueAtTime(0,0);MG.gain.linearRampToValueAtTime(1,.3);MF.gain.setValueAtTime(0,0);MF.gain.linearRampToValueAtTime(1,FADE);
  if(sc==='cal'){const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=440;g.gain.value=.01;o.connect(g);g.connect(MG);o.start()}
  else{const ev=sc==='launch'?[['click',0]]:[];if(sc==='battle'){ev.push(['horn',0]);for(let t=.5;t<sec-1;t+=.1){ev.push(['sword',t],['zhit',t+.03],['arrow',t+.05]);if(Math.round(t*10)%4===0)ev.push(['die',t+.02],['groan',t+.06])}ev.push(['boom',2],['boom',5]);ev.sort((p,q)=>p[1]-q[1])}
   musBench(sc==='launch'?'menu':sc,sec);for(const[n,t]of ev){BT=t;snd(n)}}
  BT=0;b=await AC.startRendering()}finally{BENCH=false;BT=0;[AC,MG,SB,MB,MF,FXB,UIB,RV,nbuf,WIND,OUT,woke,lastS,lastP,VO,bud,budT]=keep}
 const L=b.getChannelData(0),Rr=b.getChannelData(1),n=L.length,wn=Math.floor(sr*.4),n3=Math.min(n,sr*3);let pk=0,ss=0,s3=0,mx=0,w=0;
 for(let i=0;i<n;i++){const a=Math.max(Math.abs(L[i]),Math.abs(Rr[i])),e=(L[i]*L[i]+Rr[i]*Rr[i])/2;if(a>pk)pk=a;ss+=e;if(i<n3)s3+=e;w+=e;if(i>=wn){const j=i-wn;w-=(L[j]*L[j]+Rr[j]*Rr[j])/2}if(i>=wn-1&&w>mx)mx=w}
 const db=x=>(20*Math.log10(Math.max(1e-9,x))).toFixed(1);return sc+' '+sec+'s: peak '+db(pk)+' dBFS, RMS '+db(Math.sqrt(ss/n))+', RMS first 3s '+db(Math.sqrt(s3/n3))+', loudest 0.4s RMS '+db(Math.sqrt(mx/wn))}

export function initializeSound() {
  try{const v=JSON.parse(localStorage.getItem('dk_vol')||'{}');if(typeof v.m==='number')soundState.vM=Math.max(0,Math.min(1,v.m));if(typeof v.s==='number')soundState.vS=Math.max(0,Math.min(1,v.s))}catch(e){}

  try{sndOn=localStorage.getItem('dk_snd')!=='0'}catch(e){}
  try{window.__abench=audioBench;window.__audio={mus,snd:n=>snd(n),names:()=>Object.keys(SFX),state:()=>AC?AC.state:'none',errs:()=>ERRN,resume:()=>AC&&AC.resume()}}catch(e){}
}
