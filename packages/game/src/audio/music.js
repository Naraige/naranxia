import { AC, MB, MDUCK, nbuf, sndOn } from './sound.js';
import { TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { swNear } from '../gameplay/swarm.js';
import { wavesState } from '../gameplay/waves.js';
import { dayK } from '../rendering/lighting.js';
import { CAM } from '../rendering/scene.js';
import { seasonIdx } from '../rendering/weather.js';

/* ---------------- music: generative score, modes menu / calm / night / battle ---------------- */
export const mus={step:0,next:0,mode:'menu',cur:'menu',loop:0};

const mf=m=>440*Math.pow(2,(m-69)/12);

const SCO=[[38,[62,65,69]],[34,[58,62,65]],[41,[60,65,69]],[36,[60,64,67]],[43,[62,67,70]],[38,[62,65,69]],[45,[61,64,69]],[38,[62,65,69]]];

const MEL=[[0,74,6],[6,72,2],[8,74,4],[12,77,4],[16,74,6],[22,70,2],[24,72,8],[32,69,6],[38,72,2],[40,77,4],[44,76,4],[48,74,8],[56,72,4],[60,67,4],
 [64,79,6],[70,77,2],[72,74,4],[76,79,4],[80,77,6],[86,76,2],[88,74,8],[96,73,6],[102,76,2],[104,81,8],[112,77,4],[116,76,4],[120,74,8]];

function vo(f,t,d,type,v,lp,det,att,dst,rel){const o=AC.createOscillator(),g=AC.createGain(),fl=AC.createBiquadFilter();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;fl.type='lowpass';fl.frequency.value=lp||2000;
 const a=att||.02,r=rel||.12;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-r));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);fl.connect(g);g.connect(dst||MB);o.start(t);o.stop(t+d+.05)}

function strings(n,t,d,v,lp){for(const det of[-9,0,8])vo(mf(n),t,d,'sawtooth',v*.38,lp||1200,det,Math.min(.45,d*.3),MDUCK,Math.min(.5,d*.35))}

function choir(n,t,d,v){const o=AC.createOscillator(),out=AC.createGain();o.type='sawtooth';o.frequency.value=mf(n);const vb=AC.createOscillator(),vg=AC.createGain();vb.frequency.value=4.6;vg.gain.value=mf(n)*.008;vb.connect(vg);vg.connect(o.frequency);
 for(const[ff,qq,gg]of[[700,6,1],[1150,8,.55],[2600,10,.18]]){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=ff;b.Q.value=qq;const g=AC.createGain();g.gain.value=gg;o.connect(b);b.connect(g);g.connect(out)}
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(v,t+d*.35);out.gain.setValueAtTime(v,t+d*.7);out.gain.exponentialRampToValueAtTime(.0001,t+d);out.connect(MDUCK);o.start(t);o.stop(t+d+.05);vb.start(t);vb.stop(t+d+.05)}

function pluck(n,t,v,d){d=d||1.2;const f=mf(n);vo(f,t,d,'triangle',v,3200,0,.004,MB,d*.9);vo(f*2,t,d*.5,'sine',v*.35,4000,0,.004,MB,d*.45);vo(f*3,t,d*.25,'sine',v*.12,5000,0,.003,MB,d*.22)}

function bell(n,t,v){const f=mf(n);for(const[k,g,d]of[[1,1,1.6],[2.76,.45,.9],[5.4,.22,.5],[8.9,.1,.3]])vo(f*k,t,d,'sine',v*g,9000,0,.003,MB,d*.9)}

function bassN(n,t,d,v,lp){const f=mf(n);vo(f,t,d,'sine',v,400,0,.008,MDUCK,.06);vo(f,t,d,'sawtooth',v*.45,lp||520,0,.008,MDUCK,.06)}

function brass(n,t,d,v){const f=mf(n),o1=AC.createOscillator(),o2=AC.createOscillator(),lp=AC.createBiquadFilter(),g=AC.createGain();o1.type=o2.type='sawtooth';o1.frequency.value=f;o2.frequency.value=f;o1.detune.value=-6;o2.detune.value=7;
 lp.type='lowpass';lp.frequency.setValueAtTime(500,t);lp.frequency.linearRampToValueAtTime(2200,t+.09);lp.frequency.setTargetAtTime(1300,t+.1,.25);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.06);g.gain.setValueAtTime(v*.85,t+Math.max(.08,d-.12));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(MB);o1.start(t);o2.start(t);o1.stop(t+d+.05);o2.stop(t+d+.05)}

function kick(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(g);g.connect(MB);o.start(t);o.stop(t+.45);
 const c=AC.createBufferSource();c.buffer=nbuf;const cf=AC.createBiquadFilter();cf.type='highpass';cf.frequency.value=3000;const cg=AC.createGain();cg.gain.setValueAtTime(v*.25,t);cg.gain.exponentialRampToValueAtTime(.0001,t+.02);c.connect(cf);cf.connect(cg);cg.connect(MB);c.start(t,Math.random(),.03);
 MDUCK.gain.cancelScheduledValues(t);MDUCK.gain.setValueAtTime(.45,t);MDUCK.gain.linearRampToValueAtTime(1,t+.22)}

function snare(t,v){const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=.8;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);s.connect(f);f.connect(g);g.connect(MB);s.start(t,Math.random()*1.5,.25);
 vo(190,t,.1,'triangle',v*.55,1200,0,.002,MB,.08)}

function hat(t,v,open){const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=8000;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+(open?.22:.045));s.connect(f);f.connect(g);g.connect(MB);s.start(t,Math.random()*1.5,.3)}

function taiko(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(52,t+.3);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.connect(g);g.connect(MB);o.start(t);o.stop(t+.75);
 const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=700;const sg=AC.createGain();sg.gain.setValueAtTime(v*.5,t);sg.gain.exponentialRampToValueAtTime(.0001,t+.25);s.connect(f);f.connect(sg);sg.connect(MB);s.start(t,Math.random(),.3)}

function curMode(){if(!sessionState.started)return'menu';let n=0;const cx=CAM.x*TS,cy=CAM.z*TS;for(const u of sessionState.units){if(u.t&&Math.abs(u.x-cx)<TS*30&&Math.abs(u.y-cy)<TS*24&&++n>=7)return'battle'}if(swNear(cx,cy,TS*24)>=0)return'battle';return dayK<.38||wavesState.nightLv>=.5?'night':'calm'}

export function musTick(){if(!AC||!sndOn||AC.state!=='running')return;if(sessionState.paused&&sessionState.started){mus.next=AC.currentTime+.1;return}
 while(mus.next<AC.currentTime+.3){const m=mus.cur,sp=m==='battle'?.163:m==='menu'?.17:m==='night'?.25:.21;musStep(mus.step,mus.next,m,sp);mus.next+=sp;mus.step++;if(mus.step%16===0){const nm=curMode();if(nm!==mus.cur){mus.cur=nm;mus.step=0;mus.loop=0}}if(mus.step%128===0)mus.loop++}}

function musStep(st,t,m,sp){const s128=st%128,bar=(s128/16)|0,s16=st%16,ch=SCO[bar],bd=sp*16,A=mus.loop%2===1;
 if(m==='menu'){
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.03,.06,1300));bassN(ch[0],t,bd,.15,300);choir(ch[1][0]+12,t,bd*1.05,.035);if(bar===0||bar===4)taiko(t,.5)}
  if(s16===8&&bar%2===1)taiko(t,.35);if(s16%4===0)pluck(ch[1][(s16/4+bar)%3]+12,t,.05,.9);
  for(const e of MEL)if(e[0]===s128){brass(e[1]-12,t,e[2]*sp,.075);brass(e[1],t,e[2]*sp,.05);if(e[2]>=6)bell(e[1]+12,t,.035)}
  if(s16===12&&(bar===3||bar===7)){taiko(t,.3);taiko(t+sp,.32);taiko(t+sp*2,.36);taiko(t+sp*3,.42)}}
 else if(m==='calm'){
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.02,.05,900));bassN(ch[0],t,bd,.12,250)}
  if(s16%2===0){const ar=[ch[1][0],ch[1][1],ch[1][2],ch[1][1]+12];pluck(ar[(s16/2)%4]+12,t,.055,1.1)}
  if(A&&s16===0&&bar%2===0){const e=MEL.find(q=>q[0]===s128);if(e)bell(e[1]+12,t,.04)}
  if(seasonIdx()===3&&s16===8&&bar%2===0)bell(ch[1][1]+24,t,.026);if(seasonIdx()===2&&s16===12&&bar%4===1)pluck(ch[1][0]+7,t,.04,1.6);
  if(A)for(const e of MEL)if(e[0]===s128&&e[2]>=4)pluck(e[1]+12,t,.07,2.2)}
 else if(m==='night'){
  if(s16===0){choir(ch[1][0],t,bd*1.05,.04);strings(ch[0]+12,t,bd*1.05,.05,600);bassN(ch[0]-12,t,bd,.1,180)}
  if(s16===6||s16===14)pluck(ch[1][2]+(s16===6?0:12),t,.035,2.5);if(s16===0&&bar%4===3)bell(ch[1][0]+13,t,.03);if(s16===10&&bar%2===1)taiko(t,.18)}
 else{/* battle: half-time trap groove under an orchestral ostinato */
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.02,.045,1700));choir(ch[1][2]+12,t,bd*1.03,.026);brass(ch[1][0],t,sp*3,.06);brass(ch[1][2],t,sp*3,.042)}
  if(s16%2===0)bassN(ch[0]+(s16%8===6?12:0),t,sp*1.7,.12,700);
  vo(mf(ch[1][(s16+bar)%3]+12),t,sp*.8,'sawtooth',.03,2200,0,.004,MDUCK,.04);
  if(s16===0||s16===10||(A&&s16===7))kick(t,.46);if(s16===8)snare(t,.42);if(s16===14&&bar%2===1)snare(t,.2);
  if(s16%2===0)hat(t,.06);else if(A||bar%2)hat(t,.035);if(bar%4===3&&s16>=12){hat(t+sp/2,.04);snare(t+sp/2,.08)}
  if(s16===0&&bar%4===0)taiko(t,.55);if(A)for(const e of MEL)if(e[0]===s128&&e[2]>=6)brass(e[1]-12,t,e[2]*sp*.9,.06)}}
