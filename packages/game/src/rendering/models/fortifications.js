import { GTOP } from '../../gameplay/rules.js';
import { newG, toGeo } from '../geometry.js';
import {
  bC,
  bM,
  bP,
  bS,
  bW,
  qab,
  qBan,
  QBR,
  QBR2,
  qCornice,
  qDoor,
  qFlag,
  qGem,
  QIR,
  qLamp,
  QLOG,
  QLOGT,
  qMerl,
  QMS,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  QS,
  QSD,
  QSD2,
  QSL,
  qSlit,
  qStone,
  QTC,
  QTR,
  QW1,
  QW2,
  QW3,
  qWin,
} from './building-parts.js';
import { qCorbR, qCyl, qMerlL, QSH, qSpire, qTowR } from './castles.js';
import { DIRS, structureModelsState, WH, WT } from './structures.js';

/* ---- walls: limestone with a cornice and crenels / log palisade with iron bands ---- */
/* ---- v79 walls: a lower, wider wall with a clear wall walk (units stand on the deck), merlons on the edges only ---- */
const WALLH=1.45,WALLT=.74,WDH=1.42;

export function wallGeo(m){const G=newG(),T=WALLT,H=WALLH;qPlinth(G,0,0,0,T+.12,T+.12,.14);qStone(G,0,.18,0,T,T,H-.18,{moss:1});
 for(const[bit,dx,dz]of DIRS)if(m&bit){qab(bS,G,dx,dz,.41,0,0,.2,T+.12,.18,QSD);for(let k=0;k<6;k++)qab(bS,G,dx,dz,.415,0,.18+k*(H-.18)/6,.19,T,(H-.18)/6,k===0?QMS:QS[(k+1)%4])}
 bS(G,0,H,0,T+.05,.07,T+.05,QTR);for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.41,0,H,.2,T+.05,.07,QTR);
 const e=T/2-.06;
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const l of[-1,1]){qab(bS,G,dx,dz,.42,l*e,H+.07,.13,.12,.2,QS[0]);qab(bS,G,dx,dz,.42,l*e,H+.27,.15,.14,.03,QTR)}}
 for(const[bit,dx,dz]of[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]]){if(m&bit)continue;for(const l of[-1,1]){const a=dx?dx*e:l*e*.7,b=dx?l*e*.7:dz*e;bS(G,a,H+.07,b,.13,.2,.13,QS[0]);bS(G,a,H+.27,b,.15,.03,.15,QTR)}if(dx)qSlit(G,dx*(T/2+.005),.7,0,false);else qSlit(G,0,.7,dz*(T/2+.005),true)}
 for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.4,0,.92,.2,T+.012,.05,QTR);bS(G,0,.92,0,T+.012,.05,T+.012,QTR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5,c=.5;qPlinth(G,x,0,z,c+.1,c+.1,.14);qStone(G,x,.18,z,c,c,H-.18,{moss:1});bS(G,x,H,z,c+.05,.07,c+.05,QTR);bS(G,x+dx*.13,H+.07,z+.13,.13,.2,.13,QS[0]);bS(G,x+dx*.13,H+.27,z+.13,.15,.03,.15,QTR);bS(G,x,.92,z,c+.012,.05,c+.012,QTR)}
 if(!(m&15))qPost(G,0,H+.07,0,.22,true);
 return toGeo(G)}

/* log palisade with a plank fighting deck on top and pointed stakes along both edges */
export function woodWallGeo(m){const G=newG(),D=WDH,stake=(x,z,h)=>{bW(G,x,0,z,.13,h,.13,QLOG);bW(G,x,h,z,.09,.06,.09,QLOGT);bW(G,x,h+.06,z,.045,.05,.045,QLOGT)};
 for(const[a,b]of[[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]])stake(a,b,D+.3+((a+b)>0?.04:0));
 for(const a of[-.07,.07])for(const b of[-.21,.21]){bW(G,a,0,b,.14,D,.14,QLOG);bW(G,b,0,a,.14,D,.14,QLOG)}
 bW(G,0,D,0,.5,.06,.5,QW3);for(let k=0;k<3;k++)bW(G,-.16+k*.16,D+.06,0,.012,.006,.5,QW2);
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const t of[.3,.43])for(const l of[-.21,.21]){const x=dx?dx*t:l,z=dz?dz*t:l;stake(x,z,D+.3+(((t*10|0)+(l>0?1:0))%2)*.05)}
  for(const t of[.3,.43])for(const l of[-.07,.07])bW(G,dx?dx*t:l,0,dz?dz*t:l,.14,D,.14,QLOG);
  qab(bW,G,dx,dz,.375,0,D,.25,.5,.06,QW3);for(const y of[.42,1.0])for(const l of[-.21,.21])qab(bP,G,dx,dz,.36,l,y,.3,.05,.06,QIR)}
 for(const y of[.42,1.0])for(const[a,b]of[[-.21,0],[.21,0],[0,-.21],[0,.21]])bP(G,a,y,b,a?.05:.46,.06,a?.46:.05,QIR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5;for(const[a,b]of[[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13],[0,0]])stake(x+a,z+b,D+.3+((a+b)>0?.05:0));for(const a of[-.07,.07])for(const b of[-.07,.07])bW(G,x+a,0,z+b,.14,D,.14,QLOG);bW(G,x,D,z,.4,.06,.4,QW3);for(const y of[.42,1.0])bP(G,x,y,z,.44,.06,.44,QIR)}
 if(!(m&15))qLamp(G,0,D+.5,0,false);
 return toGeo(G)}

/* ---- v79 gate: three tiles - two square towers and an arched passage in the middle with a wall walk over it ---- */
export function gateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;qPlinth(G,x,0,0,1.0,.98,.14);qStone(G,x,.18,0,.9,.9,2.44,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.45,-.45,x+.45,.45,.18,2.44);
  qCornice(G,x,2.62,0,.98,.98,.08);bS(G,x,2.7,0,.94,.03,.94,QSD2);qMerl(G,x-.47,-.47,x+.47,.47,2.7,.24,.3);
  qSlit(G,x+sg*.455,1.2,0,false);qSlit(G,x,1.75,.455,true);qSlit(G,x,1.75,-.455,true);qWin(G,x+sg*.457,2.15,0,false,sg,{w:.13,h:.22,glow:1});
  qLamp(G,x-sg*.36,1.3,.5,true);qLamp(G,x-sg*.36,1.3,-.5,true);qGem(G,x,2.3,.455,true,1,.09);qGem(G,x,2.3,-.455,true,-1,.09)});
 qStone(G,0,1.5,0,1.12,.8,.72,{ph:2});bP(G,0,1.44,0,1.12,.06,.1,'#1b1a20');
 for(const sg of[-1,1]){bS(G,sg*.44,1.3,0,.14,.18,.82,QTR);bS(G,sg*.36,1.4,0,.1,.1,.82,QTR)}
 qCornice(G,0,2.22,0,1.12,.86,.08);bS(G,0,2.3,0,1.1,.03,.82,QSD2);
 qMerlL(G,-.44,.37,.44,.37,2.33,.22,.15);qMerlL(G,-.44,-.37,.44,-.37,2.33,.22,.15);
 qBan(G,0,2.2,.42,true,1,.3,.44);qBan(G,0,2.2,-.42,true,-1,.3,.44);bS(G,0,0,0,3.0,.05,.84,QSD2);return toGeo(G)}

export function woodGateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,x+a*.36,0,b*.36,.17,2.75,.17,QLOG);bW(G,x+a*.36,2.75,b*.36,.11,.06,.11,QLOGT)}
  for(const s of[-1,1]){bW(G,x,0,s*.37,.62,1.9,.05,QW1);bW(G,x+s*.37,0,0,.05,1.9,.62,QW1)}for(const y of[.6,1.4])for(const s of[-1,1]){bP(G,x,y,s*.39,.8,.05,.03,QIR);bP(G,x+s*.39,y,0,.03,.05,.8,QIR)}
  bW(G,x,1.95,0,.94,.1,.94,QW3);for(const s of[-1,1]){bW(G,x,2.05,s*.45,.94,.36,.05,QW1);bW(G,x+s*.45,2.05,0,.05,.36,.94,QW1)}
  const t=qPyr(G,x,0,2.81,1.06,1.06,QSH,.1,.034);bW(G,x,t,0,.08,.1,.08,QW2);qLamp(G,x-sg*.3,1.25,.42,false);qLamp(G,x-sg*.3,1.25,-.42,false)});
 bW(G,0,1.46,0,1.2,.16,.5,QW2);bW(G,0,1.62,0,1.16,.28,.46,QLOG);bW(G,0,1.9,0,1.2,.06,.56,QW3);
 for(let i=0;i<5;i++){const x=-.4+i*.2;bW(G,x,1.96,.25,.12,.28+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.25,.12,.28+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.26,true,1,.26,.36);qBan(G,0,1.56,-.26,true,-1,.26,.36);bP(G,0,0,0,3.0,.05,.84,'#6a5a3a');return toGeo(G)}

/* ---- v79 towers: 2x2 keeps of their own (coordinates 0..2, centre 1,1) - four archers stand on the roof ---- */
const TT2S=3.55,TT2W=3.1;

const TSTB=[[.5,0],[1.5,0],[2,.5],[2,1.5],[.5,2],[1.5,2],[0,.5],[0,1.5]];

function towerStubs(G,m,wood){for(let i=0;i<8;i++){if(!(m&(1<<i)))continue;const sd=i>>1,ax=sd===0||sd===2,[px,pz]=TSTB[i],L=wood?.24:.2,cn=(ax?pz:px)===0?L/2-.01:2-L/2+.01,x=ax?px:cn,z=ax?cn:pz;
 if(wood){const D=WDH;for(const l of[-.21,-.07,.07,.21]){const a=ax?x+l:x,b=ax?z:z+l;bW(G,a,0,b,.14,D+(Math.abs(l)>.1?.3:0),.14,QLOG);if(Math.abs(l)>.1){bW(G,a,D+.3,b,.09,.06,.09,QLOGT)}}bW(G,x,D,z,ax?.5:L,.06,ax?L:.5,QW3);for(const y of[.42,1.0])bP(G,x,y,z,ax?.5:L+.02,.06,ax?L+.02:.5,QIR)}
 else{const T=WALLT,H=WALLH,w=ax?T:L,d=ax?L:T;bS(G,x,0,z,ax?T+.12:L,.18,ax?L:T+.12,QSD);qStone(G,x,.18,z,w,d,H-.18,{moss:1});bS(G,x,H,z,ax?T+.05:L,.07,ax?L:T+.05,QTR);bS(G,x,.92,z,ax?T+.012:L,.05,ax?L:T+.012,QTR);
  for(const l of[-1,1]){const e=T/2-.06,a=ax?x+l*e:x,b=ax?z:z+l*e;bS(G,a,H+.07,b,ax?.12:L,.2,ax?L:.12,QS[0]);bS(G,a,H+.27,b,ax?.14:L,.03,ax?L:.14,QTR)}}}}

export function towerGeo2(m,op){const G=newG(),c=1,W=1.7,H=3.0;towerStubs(G,m|0,false);qPlinth(G,c,0,c,W+.2,W+.2,.18);qStone(G,c,.18,c,W,W,H,{moss:1});qQuoin(G,c-W/2,c-W/2,c+W/2,c+W/2,.18,H);
 for(const[x,z,ax,n]of[[c,c+W/2,true,1],[c,c-W/2,true,-1],[c+W/2,c,false,1],[c-W/2,c,false,-1]]){for(const o of[-.45,.45])qSlit(G,ax?x+o:x+n*.005,1.3,ax?z+n*.005:z+o,ax);qSlit(G,ax?x:x+n*.005,2.3,ax?z+n*.005:z,ax);qWin(G,ax?x-.42:x+n*.01,2.35,ax?z+n*.01:z-.42,ax,n,{w:.13,h:.24,glow:1});qWin(G,ax?x+.42:x+n*.01,2.35,ax?z+n*.01:z+.42,ax,n,{w:.13,h:.24,glow:1})}
 qDoor(G,c,c+W/2+.016,true,1,{y:.18,w:.42,h:.66});qRing(G,c,c,1.85,W+.06,.05,QBR,bM);
 for(let i=0;i<8;i++){const a=-W/2+.12+i*(W-.24)/7;bS(G,c+a,H+.04,c+W/2+.05,.1,.14,.1,QSD);bS(G,c+a,H+.04,c-W/2-.05,.1,.14,.1,QSD);bS(G,c+W/2+.05,H+.04,c+a,.1,.14,.1,QSD);bS(G,c-W/2-.05,H+.04,c+a,.1,.14,.1,QSD)}
 bS(G,c,H+.18,c,W+.2,.1,W+.2,QSD);qStone(G,c,H+.28,c,W+.26,W+.26,.22,{ph:2});qCornice(G,c,TT2S-.05,c,W+.3,W+.3,.05);
 qMerl(G,c-(W+.26)/2,c-(W+.26)/2,c+(W+.26)/2,c+(W+.26)/2,TT2S,.24,.3);
 if(!op){qCyl(G,bS,c,c,TT2S,.6,.62,QS[1]);qCorbR(G,c,c,TT2S+.62,.74,8);qTowR(G,c,c,TT2S+.6,.2,.74,{ph:2});qCyl(G,bC,c,c,TT2S+.8,.05,.78,structureModelsState.BLU);const t=qSpire(G,c,c,TT2S+.85,.76,1.1,QSL,{band:2,eave:'#4c4846'});bM(G,c,t,c,.07,.09,.07,QBR2);qFlag(G,c,t+.09,c,.62);
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])qWin(G,c+a*.31,TT2S+.2,c+b*.31,a===0,a||b,{w:.1,h:.18,glow:1})}
 qLamp(G,c-.5,1.1,c+W/2+.08,true);qLamp(G,c+.5,1.1,c+W/2+.08,true);return toGeo(G)}

export function woodTowerGeo2(m,op){const G=newG(),c=1,D=2.95;towerStubs(G,m|0,true);bS(G,c,0,c,1.9,.14,1.9,QSD);
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,c+a*.8,.14,c+b*.8,.2,D+.55,.2,QLOG);bW(G,c+a*.8,D+.69,c+b*.8,.13,.07,.13,QLOGT);for(const y of[.6,1.8])bP(G,c+a*.8,y,c+b*.8,.22,.04,.22,QIR)}
 for(const s of[-1,1]){bW(G,c,.14,c+s*.8,1.5,1.4,.06,QW1);bW(G,c+s*.8,.14,c,.06,1.4,1.5,QW1);for(const y of[1.5,2.4]){bW(G,c,y,c+s*.8,1.62,.08,.07,QW2);bW(G,c+s*.8,y,c,.07,.08,1.62,QW2)}
  for(let k=0;k<5;k++){const u=-.6+k*.3,y=1.6+k*.16;bW(G,c+u,y,c+s*.8,.18,.12,.05,QW2);bW(G,c+s*.8,y,c+u,.05,.12,.18,QW2)}}
 qDoor(G,c,c+.836,true,1,{y:.14,w:.4,h:.62,wood:1});
 bW(G,c,D,c,1.92,.1,1.92,QW3);bW(G,c,D-.1,c,1.7,.1,1.7,QW2);
 for(const s of[-1,1]){bW(G,c,D+.1,c+s*.94,1.92,.38,.05,QW1);bW(G,c+s*.94,D+.1,c,.05,.38,1.92,QW1);bW(G,c,D+.48,c+s*.945,1.96,.06,.06,QW2);bW(G,c+s*.945,D+.48,c,.06,.06,1.96,QW2)}
 if(!op){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,c+a*.28,D+.1,c+b*.28,.09,.9,.09,QLOG);bW(G,c,D+.1,c,.4,.5,.4,QW1);const t=qPyr(G,c,c,D+1.0,.86,.86,QSH,.1,.04);qFlag(G,c,t,c,.6)}
 qLamp(G,c+.5,1.2,c+.86,false);qLamp(G,c-.5,1.2,c+.86,false);return toGeo(G)}

/* garrison height of a building: where its men really stand */
export function gtopOf(s){const st=s.tier!==0;if(s.type==='wall')return st?WALLH+.07:WDH+.06;if(s.type==='gate')return (s.gl||2)===3?(st?2.72:2.05):2.1;if(s.type==='tower')return s.sz===2?(st?TT2S:TT2W+.02):(st?3.28:3.2);return GTOP[s.type]||2}

/* ---- towers ---- */
function qArms(G,m,H){for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<5;k++)qab(bS,G,dx,dz,.4,0,k*H/5,.2,2*WT,H/5,k===0?QSD:QS[k%4]);
 qab(bS,G,dx,dz,.4,0,H,.2,2*WT+.04,.07,QTR);for(const l of[1,-1]){qab(bS,G,dx,dz,.4,l*(WT-.05),H+.07,.12,.1,.2,QS[0]);qab(bS,G,dx,dz,.4,l*(WT-.05),H+.27,.13,.11,.035,QTR)}}}

export function towerGeo(m,op){const G=newG();qArms(G,m,1.5);qPlinth(G,0,0,0,1.0,1.0,.16);qStone(G,0,.2,0,.8,.8,2.66,{moss:1});qQuoin(G,-.4,-.4,.4,.4,.2,2.66);
 for(const[a,b]of[[0,.4],[0,-.4],[.4,0],[-.4,0]]){const z=Math.abs(b)>0;qSlit(G,a+(z?.2:0),1.25,b,z);qSlit(G,a,2.25,b+(z?0:.2),z)}
 bW(G,0,.2,.405,.28,.48,.03,QW1);bS(G,0,.68,.405,.38,.06,.05,QTR);bS(G,0,.74,.41,.1,.07,.05,QTR);bM(G,.08,.42,.425,.035,.035,.02,QBR);
 qRing(G,0,0,1.72,.86,.05,QBR,bM);bS(G,0,2.86,0,.92,.08,.92,QSD);for(const[a,b]of[[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42],[0,-.44],[0,.44],[-.44,0],[.44,0]])bS(G,a,2.74,b,.1,.14,.1,QSD);
 bS(G,0,2.94,0,1.04,.1,1.04,QS[0]);bS(G,0,3.04,0,1.06,.2,1.06,QS[1]);qCornice(G,0,3.24,0,1.1,1.1,.05);
 if(op){[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]].forEach(([a,b])=>{bS(G,a,3.29,b,.14,.18,.14,QS[0]);bS(G,a,3.47,b,.16,.03,.16,QTR)})}
 else{for(const[a,b]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45],[0,-.45],[0,.45],[-.45,0],[.45,0]]){bS(G,a,3.29,b,.16,.2,.16,QS[0]);bS(G,a,3.49,b,.18,.03,.18,QTR)}
  bC(G,0,3.52,0,1.12,.06,1.12,structureModelsState.BLU);bM(G,0,3.58,0,1.1,.03,1.1,QBR);const t=qPyr(G,0,0,3.61,1.06,1.06,QSL,.2,.1);bM(G,0,t,0,.08,.1,.08,QBR2);qFlag(G,0,t+.1,0,.62)}
 qLamp(G,0,1.0,.48,true);return toGeo(G)}

export function woodTowerGeo(m,op){const G=newG();
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<2;k++){const t=.42;for(const l of[-.09,.09]){const x=dx?dx*t:l,z=dz?dz*t:l;bW(G,x,0,z,.16,WH-.05+(k?.1:0),.16,QLOG)}}qab(bP,G,dx,dz,.42,0,.42,.18,.46,.06,QIR);qab(bP,G,dx,dz,.42,0,1.12,.18,.46,.06,QIR)}
 bS(G,0,0,0,.96,.14,.96,QSD);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,a*.36,.14,b*.36,.16,2.96,.16,QLOG);bP(G,a*.36,.6,b*.36,.18,.04,.18,QIR);bP(G,a*.36,1.9,b*.36,.18,.04,.18,QIR)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]]){bW(G,a,.14,b,ax?.58:.04,1.06,ax?.04:.58,QW1);bW(G,a,1.2,b,ax?.6:.05,.07,ax?.05:.6,QW2);bW(G,a,2.1,b,ax?.6:.05,.07,ax?.05:.6,QW2)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]])for(let s=0;s<4;s++){const u=-.22+s*.15,y=1.3+s*.18;bW(G,ax?a+u:a,y,ax?b:b+u,ax?.14:.04,.16,ax?.04:.14,QW2)}
 bW(G,-.09,.14,.41,.03,2.9,.03,QW3);bW(G,.09,.14,.41,.03,2.9,.03,QW3);for(let y=.35;y<3;y+=.22)bW(G,0,y,.415,.18,.03,.03,QW3);
 bW(G,0,2.98,0,.9,.1,.9,QW2);bW(G,0,3.08,0,1.14,.12,1.14,QW3);
 for(const[a,b]of[[-.54,-.54],[.54,-.54],[-.54,.54],[.54,.54],[0,-.54],[0,.54],[-.54,0],[.54,0]])bW(G,a,3.2,b,.07,.32,.07,QW2);
 for(const s of[-1,1]){bW(G,s*.54,3.44,0,.05,.05,1.1,QW3);bW(G,0,3.44,s*.54,1.1,.05,.05,QW3)}
 if(!op){for(const[a,b]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])bW(G,a,3.2,b,.08,.72,.08,QLOG);const t=qPyr(G,0,0,3.9,1.3,1.3,QTC,.17,.1);qFlag(G,0,t,0,.6)}
 qLamp(G,.3,1.1,.46,false);return toGeo(G)}

/* ---- gates ---- */
export function gateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.74;qPlinth(G,x,0,0,.62,.92,.14);qStone(G,x,.18,0,.52,.84,2.02,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.26,-.42,x+.26,.42,.18,2.02);
  qCornice(G,x,2.2,0,.6,.92,.08);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bS(G,x+a*.2,2.28,b*.37,.15,.24,.15,QS[0]);bS(G,x+a*.2,2.52,b*.37,.17,.035,.17,QTR)}
  qSlit(G,sg*1.005,1.2,0,false);qLamp(G,x-sg*.3,1.32,.47,true);qLamp(G,x-sg*.3,1.32,-.47,true);qGem(G,x,1.86,.425,true,1,.08);qGem(G,x,1.86,-.425,true,-1,.08)});
 qStone(G,0,1.42,0,.96,.84,.52,{ph:2});bP(G,0,1.36,0,.96,.06,.12,'#1b1a20');[-1,1].forEach(sg=>{bS(G,sg*.42,1.26,0,.12,.16,.84,QTR);bS(G,sg*.34,1.34,0,.08,.08,.84,QTR)});
 qCornice(G,0,1.94,0,.96,.9,.1);[-.34,0,.34].forEach(x=>{bS(G,x,2.04,.37,.14,.22,.14,QS[0]);bS(G,x,2.04,-.37,.14,.22,.14,QS[0]);bS(G,x,2.26,.37,.16,.03,.16,QTR);bS(G,x,2.26,-.37,.16,.03,.16,QTR)});
 qBan(G,0,1.9,.42,true,1,.28,.42);qBan(G,0,1.9,-.42,true,-1,.28,.42);bS(G,0,0,0,1.0,.05,.84,QSD2);return toGeo(G)}

export function woodGateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.78;for(const[a,b]of[[-.1,-.2],[.1,-.2],[-.1,.2],[.1,.2]]){const h=2.35+((a+b)>0?.08:0);bW(G,x+a,0,b,.17,h,.17,QLOG);bW(G,x+a,h,b,.12,.07,.12,QLOGT);bW(G,x+a,h+.07,b,.06,.06,.06,QLOGT)}
  for(const y of[.5,1.4])bP(G,x,y,0,.42,.07,.52,QIR);qLamp(G,x-sg*.26,1.12,.32,false);qLamp(G,x-sg*.26,1.12,-.32,false)});
 bW(G,0,1.42,0,1.2,.16,.5,QW2);bW(G,0,1.58,0,1.16,.3,.46,QLOG);bW(G,0,1.88,0,1.3,.08,.56,QW3);
 for(let i=0;i<7;i++){const x=-.6+i*.2;bW(G,x,1.96,.24,.12,.3+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.24,.12,.3+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.25,true,1,.26,.36);qBan(G,0,1.56,-.25,true,-1,.26,.36);bP(G,0,0,0,1.0,.05,.84,'#6a5a3a');return toGeo(G)}

export function doorGeo(){const G=newG(),w=.92;for(let k=0;k<9;k++){const x=-w/2+.05+k*(w-.1)/8;bP(G,x,-1.3,0,.045,1.28,.05,QIR);bM(G,x,-1.4,0,.03,.1,.03,QBR)}
 for(const y of[-1.15,-.75,-.35])bP(G,0,y,0,w,.045,.06,QIR);bM(G,0,-.06,0,w,.06,.07,QBR);return toGeo(G)}

export function doorGeoW(){const G=newG(),w=.92;for(let k=0;k<6;k++){const x=-w/2+w/12+k*w/6;bW(G,x,-1.3,0,w/6-.01,1.3,.07,k%2?QW1:QW3)}bW(G,0,-1.3,0,.03,1.3,.09,QW2);
 for(const y of[-1.1,-.42])bP(G,0,y,0,w,.07,.09,QIR);for(const x of[-.12,.12])bM(G,x,-.72,.05,.05,.05,.03,QBR);return toGeo(G)}
