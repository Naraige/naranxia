import { addBox, geometryState, rgb } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { VX } from './unit-parts.js';
import { PXON } from './units.js';
import { pxZombie } from './zombie-skins.js';
import { mut2 } from './mutant-style.js';
import { pxMutant } from './mutants.js';
import { thp } from '../../ui/kingdom-theme.js';

export const zombiesState = {
  ZVAR: null,
};

/* ================= v73: medieval undead — decomposition, half-skeletons, skeletons ================= */

export const ZNV={zombie:24,husk:12,runner:12,brute:8,bomber:6,acid:6,miner:6};

const ZSK={livid:['#8a9078','#666c58','#a6ac92'],putrid:['#6e7e4c','#4e5a34','#8a9a62'],grave:['#7c8070','#5a5e50','#9a9e8c'],bruise:['#74626e','#544650','#907e8a'],
 waxy:['#aea88e','#868068','#c8c2a6'],rot:['#5e5236','#40381f','#7a6c48'],drown:['#6e8488','#4e6266','#8aa2a6'],dried:['#7c6040','#58422a','#9a7c56'],ash:['#8e8a80','#6a665e','#aaa69c'],moss:['#5f7a46','#435832','#7a9660']};

const ZBN=[['#e0d6b8','#bcb092','#8a7e62'],['#d2c6a2','#ada07e','#7e7256'],['#c8bc98','#a49674','#766a4e']];

export const ZCL={linen:'#bdae8c',linen2:'#a89a78',wool:'#6a4e32',dkwool:'#4a3622',green:'#56603e',red:'#72352a',woad:'#46566a',grey:'#68645a',black:'#2e2a26',ochre:'#84662e',burlap:'#96805a'};

const ZTUN=['wool','dkwool','green','red','woad','grey','linen2','ochre','burlap','black'],ZHOSE=['wool','dkwool','green','woad','grey','linen2','black'];

const ZEYE=['#ff3a2a','#ff3a2a','#ff6a20','#ffb02a','#9affd8','#c8f0ff','#7aff6a'];

const MPIV={T:12,H:24,AR:0,AL:0,L:12};

export const MUTX={brute:{T:[1.32,1.06,1.38,0,-.2],H:[.84,.84,.86,-2.6,1.7],AR:[1.8,1.42,1.8,0,0],AL:[1.12,1.05,1.12,0,0],L:[1.28,1,1.3,0,0]},
 runner:{T:[.84,1.04,.86,0,0],H:[.9,.92,1,-.4,.9],AR:[.8,1.28,.8,0,0],AL:[.8,1.28,.8,0,0],L:[.84,1,.86,0,0]},
 bomber:{T:[1.42,.98,1.8,0,.5],H:[.78,.8,.8,-1.6,.6],AR:[1.1,.78,1.1,0,0],AL:[1.1,.78,1.1,0,0],L:[1.34,1,1.34,0,0]},
 acid:{T:[1,1,1.15,0,0],H:[.95,.95,.95,-2.4,2],AR:[.95,1.14,.95,0,0],AL:[.95,1.14,.95,0,0],L:[.95,1,.95,0,0]},
 miner:{T:[1.16,1,1.25,0,0],H:[.95,.95,.95,-1.2,1],AR:[1.15,1.05,1.15,0,0],AL:[1.2,1,1.2,0,0],L:[1.15,1,1.15,0,0]}};

function zRand(seed){let s=((seed|0)*2654435761>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}

/* hint = former type of a converted unit (knight, archer, peasant...) */
export function zSpec(kind,v,hint){const r=zRand(v*7919+({zombie:1,husk:2,runner:3,brute:4}[kind]||5)*104729+(hint?hint.length*977:0)),pick=a=>a[(r()*a.length)|0];
 const decay=kind==='husk'?pick(['dried','dried','mummy','dried']):kind==='runner'?pick(['bones','skel','skel','rot']):kind==='brute'?pick(['rot','rot','bones']):pick(['rot','rot','rot','rot','bones','bones','bones','skel','skel','skel']);
 const S={kind,v,decay,sk:ZSK[kind==='husk'?pick(['dried','rot','ash','dried']):pick(['livid','putrid','grave','bruise','waxy','rot','drown','ash','moss'])],bn:pick(ZBN),
  tun:ZCL[pick(ZTUN)],tun2:ZCL[pick(['red','woad','green','ochre','black'])],hose:ZCL[pick(ZHOSE)],eye:pick(ZEYE),shoes:pick(['leather','leather','wrap','bare']),legwrap:r()<.35,
  hairc:pick(['#2a1a10','#4a3a2a','#6a6a62','#1a1a1a','#6a4a24','#8a8a80']),hair:pick(['none','patchy','stringy','long','none']),arrows:r()<.3?1+(r()<.3?1:0):0,
  armL:r()<.5,armR:r()<.5,legB:r()<.4,cheek:r()<.5?(r()<.5?-1:1):0,skullPatch:r()<.45,jawOff:r()<.3,crack:r()<.5,slvL:r()<.5,slvR:r()<.5,patches:3+((r()*5)|0),seed:(r()*1e9)|0};
 S.outfit=kind==='husk'?(decay==='mummy'?'shroud':pick(['shroud','rags','monk','bare','rags'])):kind==='brute'?pick(['bare','rags','soldier','gambeson','bare']):kind==='runner'?pick(['rags','bare','tunic','peasant','rags']):
  pick(['tunic','peasant','soldier','gambeson','monk','noble','rags','shroud','bare','tunic','soldier','peasant']);
 const o=S.outfit;S.head=o==='soldier'?pick(['kettle','nasal','coif','nasal','none']):o==='monk'?'hood':o==='peasant'?pick(['straw','lcoif','none','none']):o==='noble'?pick(['circlet','none','hood']):o==='tunic'?pick(['lcoif','none','hood','none']):o==='shroud'&&decay!=='mummy'?pick(['shroud','none']):'none';
 if(hint==='knight'||hint==='spearman'||hint==='captain'||hint==='bannerman'||hint==='king'||hint==='guard'){S.outfit='soldier';S.tun2=thp();S.head=pick(['nasal','kettle','coif'])}
 else if(hint==='archer'){S.outfit='hooded';S.tun=ZCL.green;S.head='ghood'}
 else if(hint==='peasant'){S.outfit=pick(['peasant','tunic']);S.head=pick(['straw','lcoif','none'])}
 if(kind==='brute'){S.decay='rot';S.outfit=pick(['bare','bare','rags']);S.head='none';S.sk=ZSK[pick(['bruise','putrid','bruise','moss'])];S.arrows=0;S.eye=pick(['#ff3a2a','#ff6a20'])}
 if(kind==='bomber'){S.decay='rot';S.outfit='bare';S.head='none';S.legwrap=false;S.hair='none';S.sk=ZSK[pick(['putrid','bruise','livid','moss'])];S.arrows=0;S.eye=pick(['#ffb02a','#ff6a20'])}
 else if(kind==='acid'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['bare','bare','rags']);S.head='none';S.hair=pick(['none','patchy']);S.sk=['#8c9a3c','#6a7a28','#aab858'];S.eye='#c8ff40';S.arrows=0}
 else if(kind==='miner'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['peasant','tunic','rags']);S.head='mhelm';S.sk=ZSK[pick(['grave','ash','livid','rot'])];S.eye=pick(['#ff3a2a','#ffb02a'])}
 return S}

/* E(region,x0,y0,z0,x1,y1,z1,colour,mat,skin) — px boxes; regions: T torso (abs), H head (abs), AL/AR arm (local: x +outer, y -12..0 from shoulder, z front), L leg (local: x +outer, y 0..12) */
export function zBuild(S,E){const LD=!!S.lod,r=zRand(S.seed^1540483477),[SK,SKD,SKL]=S.sk,[BN,BN2,BND]=S.bn,FL='#5e1a12',DK='#120a06',RU='#7a4a2a',o=S.outfit,dc=S.decay,WR='#cbbd98',WR2='#a99c7a';
 const MT=MUTX[S.kind];let mut=!!MT;
 const b=(R,x0,y0,z0,x1,y1,z1,c,m,sk)=>{if(mut){const t=MT[R];if(t){const py=MPIV[R];x0*=t[0];x1*=t[0];y0=(y0-py)*t[1]+py+t[3];y1=(y1-py)*t[1]+py+t[3];z0=z0*t[2]+t[4];z1=z1*t[2]+t[4]}}E(R,x0,y0,z0,x1,y1,z1,c,m||0,sk||0)},rn=(a,c)=>a+r()*(c-a);
 const skel=dc==='skel',half=dc==='bones',dried=dc==='dried'||dc==='mummy',mum=dc==='mummy';
 const TUN=o==='soldier'?'#6e7078':o==='gambeson'?'#b6a684':o==='monk'?(r()<.5?ZCL.wool:ZCL.black):o==='shroud'?WR:o==='rags'||o==='peasant'?ZCL.burlap:o==='hooded'?'#5a3a22':S.tun;
 /* ---- legs ---- */
 if(skel||(half&&S.legB)){b('L',-.75,6.4,-.75,.75,12,.75,BN);b('L',-1.05,5.4,-.95,1.05,6.6,1.15,BN2);b('L',-.6,1.2,-.55,.6,5.6,.55,BN);b('L',-.25,1.4,-.9,.25,5.4,-.5,BN2);b('L',-1.1,0,-1.1,1.1,1.25,1.0,BN2);
  if(!LD){b('L',-.9,0,1.0,-.35,.6,2.1,BN);b('L',-.15,0,1.0,.4,.6,2.3,BN);b('L',.6,0,1.0,1.0,.55,1.9,BN)}
  if(o!=='bare'&&!mum){const HC=o==='monk'?TUN:S.hose;b('L',-1.75,8.6,-1.75,1.75,12,1.75,HC);if(!LD)for(let i=0;i<3;i++){const x=-1.75+i*1.17;b('L',x,8.6-rn(.4,1.2),-1.76,x+.7,8.6,1.76,HC)}}}
 else{const bareL=o==='bare'||mum;b('L',-2,0,-2,2,12,2,bareL?SK:o==='monk'?TUN:S.hose,0,bareL?1:0);
  if(mum)for(let y=.4;y<12;y+=1.9)b('L',-2.06,y,-2.06,2.06,y+1.1,2.06,((y*3)|0)%2?WR:WR2);
  else if(S.legwrap&&!bareL&&o!=='monk')for(let y=1.4;y<10.5;y+=1.7)b('L',-2.07,y,-2.07,2.07,y+.75,2.07,r()<.5?ZCL.linen2:ZCL.wool);
  if(!bareL&&o!=='monk'&&r()<.5){const y=rn(4,9);b('L',-.8,y,1.98,.9,y+rn(1.2,2.2),2.07,SKD,0,1);b('L',-.4,y+.4,2.04,.5,y+1.1,2.1,FL)}
  if(bareL&&!mum){for(let i=0;i<2;i++){const y=rn(2,10);b('L',1.98,y,rn(-1.6,.2),2.07,y+rn(1,2),rn(.4,1.6),r()<.5?FL:SKD,0,1)}b('L',-.8,5.2,1.98,.8,6.6,2.1,BN)}
  if(S.shoes==='leather'&&!bareL)b('L',-2.08,0,-2.14,2.08,1.5,2.18,'#4a3220');
  else if(S.shoes==='wrap'&&!bareL)b('L',-2.07,0,-2.1,2.07,1.4,2.14,ZCL.linen2);
  else{b('L',-2.05,0,-2.05,2.05,.9,2.05,SKD,0,1);if(!LD){b('L',-1.4,0,2.0,-.6,.5,2.6,BN);b('L',-.3,0,2.0,.5,.5,2.7,BN);b('L',.8,0,2.0,1.4,.45,2.5,BN)}}}
 /* ---- torso ---- */
 const soldierFront=z0=>{for(let i=0;i<(LD?2:6);i++){const x=rn(-3.6,2.8),y=rn(13,22.6);b('T',x,y,z0,x+rn(.5,1.1),y+rn(.4,.9),z0+.07,RU)}b('T',-2.6,12.8,z0,2.6,23.5,z0+.13,S.tun2);
  if(!LD)for(let i=0;i<5;i++){const x=-2.6+i*1.04;b('T',x,12.8,z0+.01,x+.6,12.8+rn(.4,1.8),z0+.14,'#6e7078',4)}b('T',-.35,15.2,z0+.12,.35,21.4,z0+.17,'#cfc290');b('T',-1.6,19.2,z0+.12,1.6,19.9,z0+.17,'#cfc290')};
 if(skel){
  if(o==='soldier'||o==='gambeson'){b('T',-4,12.6,-2,4,24,2,TUN,o==='soldier'?4:0);
   if(o==='soldier')soldierFront(1.99);else{if(!LD)for(let x=-3.4;x<3.6;x+=1.35)b('T',x,12.6,1.99,x+.12,24,2.05,'#8a7c5e');b('T',-4.06,22.8,-2.06,4.06,24.06,2.06,lighten(TUN,-.12))}
   const s=r()<.5?-1:1,x0=s<0?-3.5:.9,x1=s<0?-.9:3.5;b('T',x0,15.6,2.1,x1,20.4,2.2,DK);for(let y=16;y<20;y+=1.3)b('T',x0+.2,y,2.16,x1-.2,y+.5,2.24,BN);
   b('T',-3.3,12,-1.7,3.3,12.7,1.7,BN2)}
  else{/* rib cage: hollow, spine, pelvis, sternum, ribs, collar bones */
   b('T',-3,12.8,-1.3,3,23,1.3,DK);b('T',-.6,12,-2,.6,24,-1.1,BN2);b('T',-3.3,12,-1.7,3.3,13.8,1.7,BN2);b('T',-3.7,12.8,-1.2,-2.5,14.4,1.2,BN);b('T',2.5,12.8,-1.2,3.7,14.4,1.2,BN);b('T',-.5,16.2,1.3,.5,22.8,2.0,BN);
   const n=LD?3:5,st=LD?2.0:1.25;for(let i=0;i<n;i++){const y=16.6+i*st;
    if(LD){b('T',-3.5,y,1.25,3.5,y+.6,1.95,BN);b('T',-3.7,y,-1.6,-3.0,y+.6,1.6,BN2);b('T',3.0,y,-1.6,3.7,y+.6,1.6,BN2)}
    else{b('T',-3.5,y,1.2,-.5,y+.55,1.9,BN);b('T',.5,y,1.2,3.5,y+.55,1.9,BN);b('T',-3.7,y,-1.6,-3.0,y+.55,1.6,BN2);b('T',3.0,y,-1.6,3.7,y+.55,1.6,BN2);b('T',-3.4,y,-1.9,3.4,y+.55,-1.25,BN2)}}
   b('T',-3.9,23.2,-1.0,3.9,24,1.0,BN);b('T',-.5,24,-1.4,.5,24.7,-.3,BN2);
   if(o!=='bare'){b('T',-3.7,12,-1.85,3.7,14.4,1.85,TUN);if(!LD)for(let i=0;i<5;i++){const x=-3.7+i*1.48;b('T',x,12-rn(.3,1.4),-1.86,x+.9,12,1.86,TUN)}
    const s=r()<.5?-1:1;b('T',s<0?-3.95:1.0,20.8,-1.95,s<0?-1.0:3.95,24.06,1.95,TUN);if(!LD)b('T',s<0?-3.95:1.0,19.6,1.9,s<0?-2.6:2.4,20.8,1.98,TUN);
    if(o==='noble')b('T',-3.75,13.8,1.84,3.75,14.4,1.9,'#c8a040',4);if(o==='monk'||o==='shroud')b('T',-3.95,14.4,-1.95,3.95,16.2,1.95,TUN)}
   else b('T',-3.4,12,-1.75,3.4,13.4,1.75,ZCL.linen2)}}
 else{const bare=o==='bare'||mum;b('T',-4,12,-2,4,24,2,bare?SK:TUN,0,bare?1:0);
  if(mum){for(let y=12.3;y<24;y+=1.7){if(r()<.15)continue;b('T',-4.06,y,-2.06,4.06,y+rn(.8,1.1),2.06,r()<.5?WR:WR2)}b('T',2.4,14.6,2.06,3.2,18.4,2.14,WR2)}
  else if(o==='bare'){b('T',-3.5,12,-2.06,3.5,13.4,2.06,ZCL.linen2);b('T',-1.4,10.8,1.9,1.4,12,2.1,ZCL.linen2)}
  else{
   if(o==='tunic'||o==='peasant'||o==='hooded'){b('T',-4.06,14.2,-2.06,4.06,14.9,2.06,'#7a5a2e');b('T',-.7,21.8,1.98,.7,24.02,2.07,DK);if(!LD)b('T',-.9,22.6,2.04,.9,22.9,2.1,'#7a5a2e')}
   if(o==='peasant')for(let i=0;i<2;i++){const x=rn(-3.4,1.6),y=rn(15.5,21);b('T',x,y,1.99,x+1.6,y+1.6,2.06,lighten(TUN,-.15))}
   if(o==='hooded'){b('T',-3.4,14.9,1.99,3.4,21.6,2.12,'#4a2e18');b('T',-4.1,21.4,-2.1,4.1,24.05,2.1,ZCL.green)}
   if(o==='soldier'){soldierFront(1.99);b('T',-4.06,13.2,-2.06,4.06,14.3,2.06,'#4a3018')}
   if(o==='gambeson'){if(!LD)for(let x=-3.4;x<3.6;x+=1.35)b('T',x,12,1.99,x+.12,24,2.05,'#8a7c5e');b('T',-4.06,22.8,-2.06,4.06,24.06,2.06,lighten(TUN,-.12));b('T',-4.06,13.2,-2.06,4.06,14.1,2.06,'#4a3018')}
   if(o==='monk'){b('T',-4.06,14.6,-2.06,4.06,15.2,2.06,'#c8b88a');b('T',-.3,11.4,2.0,.3,14.6,2.1,'#c8b88a')}
   if(o==='noble'){b('T',-4.06,12,-2.06,4.06,12.7,2.06,'#c8a040',4);b('T',-.4,12.7,2.0,.4,24,2.1,'#c8a040',4);b('T',-4.1,22.4,-2.1,4.1,24.1,2.1,'#d8d0c0');if(!LD)for(let i=0;i<4;i++){const x=rn(-3.9,3.2);b('T',x,22.6,2.08,x+.4,23.8,2.16,'#8a8478')}}
   if(o==='shroud'){for(let i=0;i<3;i++){const y=rn(13,22);b('T',-4.07,y,-2.07,4.07,y+.6,2.07,WR2)}for(let i=0;i<2;i++){const x=rn(-3.4,2),y=rn(14,21);b('T',x,y,1.99,x+rn(1,2),y+rn(.8,1.6),2.06,'#7a6a4a')}}
   if(o==='rags')for(let i=0;i<4;i++){const x=rn(-3.6,2.4),y=rn(13.5,21.5),f=r()<.65;b('T',x,y,f?1.99:-2.07,x+rn(1,1.8),y+rn(1,1.8),f?2.07:-1.99,r()<.5?SKD:DK,0,1)}
   if(!LD&&o!=='noble'&&o!=='soldier')for(let i=0;i<5;i++){const x=-3.8+i*1.6+rn(-.2,.2);if(r()<.6)b('T',x,12,1.98,x+rn(.6,1.1),12+rn(.5,1.5),2.07,SKD,0,1)}}
  /* decomposition: torn flesh, ribs through it */
  if(half||(dc==='rot'&&r()<.6)||(o==='bare'&&!mum)){const s=r()<.5?-1:1,x0=s<0?-3.6:.6,x1=s<0?-.6:3.6,y0=rn(14.6,16),y1=rn(19.6,21.6);
   b('T',x0-.2,y0-.3,1.99,x1+.2,y1+.3,2.05,FL);b('T',x0,y0,2.0,x1,y1,2.07,DK);for(let y=y0+.35;y<y1-.4;y+=1.15)b('T',x0+(s<0?rn(.1,.5):.15),y,2.03,x1-(s<0?.15:rn(.1,.5)),y+.5,2.11,BN);b('T',s<0?-1.0:.6,y0,2.0,s<0?-.6:1.0,y1,2.12,BN2)}
  if(dried){if(!LD)for(let y=16.4;y<22;y+=1.2)b('T',-3.6,y,1.99,3.6,y+.4,2.05,SKD,0,1);b('T',-.4,13,1.99,.4,15.5,2.05,DK)}
  if(o==='bare'&&!mum)for(let i=0;i<(LD?1:S.patches);i++){const x=rn(-3.8,2.8),y=rn(13.5,23),f=r()<.6;b('T',x,y,f?1.99:-2.07,x+rn(.7,1.5),y+rn(.6,1.3),f?2.07:-1.99,r()<.5?FL:SKD,0,r()<.5?0:1)}
  if(!bare&&!LD){const x=rn(-3.2,2),y=rn(14,21);b('T',x,y,1.99,x+rn(1,1.8),y+rn(.8,1.5),2.07,'#4a1a10')}}
 /* arrows still stuck in the body */
 for(let i=0;i<S.arrows;i++){const x=rn(-2.6,2.2),y=rn(15,22);
  if(r()<.6){b('T',x,y,-6.4,x+.3,y+.3,-1.9,'#8a6a3a');b('T',x-.35,y-.2,-6.3,x+.65,y+.5,-5.5,'#e8e2d0')}else{b('T',x,y,1.9,x+.3,y+.3,5.4,'#8a6a3a');b('T',x-.35,y-.2,4.6,x+.65,y+.5,5.4,'#e8e2d0')}}
 /* ---- arms ---- */
 for(const A of['AL','AR']){const bone=skel||(half&&(A==='AL'?S.armL:S.armR)),torn=A==='AL'?S.slvL:S.slvR,SL=o==='bare'||mum?null:o==='soldier'?'#6e7078':o==='hooded'?ZCL.green:TUN;
  if(bone){b(A,-.65,-5.9,-.65,.65,0,.65,BN);b(A,-.95,-6.7,-.9,.95,-5.6,.9,BN2);b(A,-.8,-11.2,-.5,-.12,-6.4,.5,BN);b(A,.12,-11.2,-.5,.8,-6.4,.5,BN2);b(A,-.9,-12.1,-.75,.9,-11.1,.75,BN2);
   if(!LD)for(const x of[-.85,-.2,.45])b(A,x,-13.0,-.22,x+.4,-12.1,.22,BN);
   if(SL){const cut=-rn(3,5);b(A,-1.9,cut,-1.9,1.9,0,1.9,SL,o==='soldier'?4:0);if(!LD)for(let i=0;i<3;i++){const x=-1.9+i*1.27;b(A,x,cut-rn(.3,1.1),-1.91,x+.8,cut,1.91,SL)}}}
  else{b(A,-2,-12,-2,2,0,2,mum?SKD:SK,0,1);
   if(SL){const cut=torn?-rn(4,6.5):o==='monk'?-11:o==='noble'?-10:-8.6;b(A,-2.03,cut,-2.03,2.03,0,2.03,SL,o==='soldier'?4:0);
    if(o==='monk')b(A,-2.25,-11,-2.25,2.25,-9.6,2.25,TUN);if(o==='noble')b(A,-2.08,-10,-2.08,2.08,-9.3,2.08,'#d8d0c0');
    if(torn&&!LD)for(let i=0;i<4;i++)b(A,-2.04+i,cut-((S.seed>>(i+4))&1?1:.4),-2.04,-1.04+i,cut,2.04,SL)}
   if(mum)for(let y=-11.4;y<-.4;y+=2.1)b(A,-2.07,y,-2.07,2.07,y+1.05,2.07,((y*-3)|0)%2?WR:WR2);
   if(!mum&&r()<.6){const y=rn(-9,-5);b(A,1.98,y,-1.2,2.07,y+rn(1.2,2),1.0,FL);b(A,2.03,y+.3,-.5,2.11,y+1.0,.4,BN)}
   b(A,-2.03,-12,-2.03,2.03,-11.3,2.03,SKD,0,1);if(!LD)for(const x of[-1.5,-.35,.8])b(A,x,-13.0,-.3,x+.55,-12,.3,dried||dc==='rot'?BN2:SKD)}}
 /* ---- head ---- */
 if(skel||half){
  b('H',-4,27.2,-4,4,32,3.2,BN);b('H',-3.5,25.4,-3.5,3.5,30.2,3.9,BN);b('H',-3.9,26.4,2.2,-2.6,27.8,3.92,BN2);b('H',2.6,26.4,2.2,3.9,27.8,3.92,BN2);
  for(const s of[-1,1]){const x0=s<0?-3.0:1.0;b('H',x0,27.6,3.0,x0+2,29.6,3.95,DK);b('H',x0+.55,28.1,3.9,x0+1.45,29.0,3.99,S.eye,5)}
  b('H',-.6,26.5,3.5,.6,27.5,3.96,DK);b('H',-.3,27.5,3.5,.3,28.0,3.96,DK);
  b('H',-2.2,25.4,3.55,2.2,26.2,4.0,BN);if(!LD)for(const x of[-1.5,-.5,.5,1.5])b('H',x-.07,25.4,3.98,x+.07,26.2,4.03,'#3a2a1a');
  const jy=S.jawOff?-.8:0;b('H',-3.0,23.6+jy,-.8,3.0,25.0+jy,3.6,BN2);b('H',-2.0,24.6+jy,3.3,2.0,25.0+jy,3.75,BN);b('H',-2.2,25.0+jy,3.3,2.2,25.4,3.9,DK);
  if(S.crack&&!LD){b('H',rn(-2,1),29.6,3.19,rn(1.3,2.6),29.8,3.24,BND);b('H',-.2,30.4,3.19,0,31.9,3.24,BND)}
  if(half){const s=r()<.5?-1:1;b('H',s<0?-4.06:.4,24.8,-4.06,s<0?-.4:4.06,30.8,1.4,SKD,0,1);b('H',s<0?-4.08:1.6,27,-1,s<0?-1.6:4.08,29,3.94,SK,0,1);
   if(S.hair!=='none'&&S.head==='none')for(let i=0;i<(LD?3:7);i++){const x=rn(-3.8,3.2),side=r();if(side<.6)b('H',x,rn(25.4,28),-4.1,x+.5,32.15,-3.95,S.hairc);else b('H',side<.8?-4.1:3.95,rn(25.6,28.4),x,side<.8?-3.95:4.1,32.15,x+.5,S.hairc)}}}
 else{b('H',-4,24,-4,4,32,4,mum?SKD:SK,0,1);
  for(let i=0;i<(LD?2:S.patches);i++){const f=r(),x=rn(-3.8,2.6),y=rn(24.4,31),c=r()<.6?SKD:r()<.5?SKL:FL;
   if(f<.45)b('H',x,y,3.99,x+rn(.7,1.4),y+rn(.6,1.2),4.06,c,0,1);else if(f<.75)b('H',r()<.5?3.99:-4.06,y,x,r()<.5?4.06:-3.99,y+rn(.6,1.2),x+rn(.7,1.4),c,0,1);else b('H',x,31.99,rn(-3.6,2.6),x+rn(.8,1.4),32.06,rn(-1,3.8),c,0,1)}
  b('H',-3.7,29.3,3.99,3.7,30.0,4.16,SKD,0,1);
  for(const s of[-1,1]){const x0=s<0?-3.2:1.2;b('H',x0,27.4,3.99,x0+2,29.3,4.1,DK);b('H',x0+.6,27.9,4.05,x0+1.4,28.8,4.2,S.eye,5)}
  b('H',-.6,26.5,3.99,.6,27.5,4.1,DK);
  b('H',-2.4,24.8,3.99,2.4,26.3,4.08,DK);b('H',-2.2,25.6,4.02,2.2,26.3,4.14,BN);if(!LD)for(const x of[-1.4,-.4,.6,1.6])b('H',x-.07,25.6,4.1,x+.07,26.3,4.17,'#3a2a1a');b('H',-1.8,24.8,4.02,1.8,25.3,4.13,BN2);
  if(S.cheek&&!mum){const s=S.cheek,x0=s<0?-3.9:1.8,x1=s<0?-1.8:3.9;b('H',x0,24.3,3.99,x1,27.0,4.1,FL);b('H',x0+.3,24.5,4.06,x1-.3,26.6,4.16,BN);if(!LD)for(let i=0;i<3;i++){const x=x0+.4+i*.6;b('H',x,25.3,4.12,x+.12,26.4,4.2,'#3a2a1a')}}
  if(S.skullPatch&&S.head==='none'&&!mum&&S.hair!=='long'){const x=rn(-3,.4),zz=rn(-3,0);b('H',x,31.99,zz,x+2.6,32.07,zz+2.4,FL);b('H',x+.4,32.03,zz+.4,x+2.2,32.13,zz+2.0,BN)}
  if(dried&&!mum){b('H',-3.6,26.6,3.99,-2.4,27.8,4.12,BN2);b('H',2.4,26.6,3.99,3.6,27.8,4.12,BN2)}
  if(mum)for(let y=24.3;y<32;y+=1.4){if(y>27.1&&y<29.6){b('H',-4.06,y,-4.06,4.06,y+.9,-1,WR);for(const s of[-1,1])b('H',s<0?-4.06:3.4,y,-1,s<0?-3.4:4.06,y+.9,4.06,WR2);b('H',-.8,y,3.4,.8,y+.9,4.06,WR);continue}b('H',-4.06,y,-4.06,4.06,y+rn(.7,.95),4.06,r()<.5?WR:WR2)}
  if(!mum&&(S.head==='none'||S.head==='circlet')){const hc=S.hairc;
   if(S.hair==='long'){b('H',-4.08,31.0,-4.08,4.08,32.3,4.08,hc);b('H',-4.1,26,-4.1,4.1,31,-3.4,hc);for(const s of[-1,1])b('H',s<0?-4.12:3.6,25.4,-4.12,s<0?-3.6:4.12,31,-.6,hc)}
   else if(S.hair==='patchy'){const st=LD?4:2;for(let gx=-4;gx<4;gx+=st)for(let gz=-4;gz<4;gz+=st)if(r()<.55)b('H',gx-.06,31.2,gz-.06,gx+st+.06,32.25,gz+st+.06,hc)}
   else if(S.hair==='stringy')for(let i=0;i<(LD?4:9);i++){const x=rn(-3.8,3.2),side=r();if(side<.6)b('H',x,rn(25.2,28),-4.12,x+.55,32.2,-3.98,hc);else b('H',side<.8?-4.12:3.98,rn(25.5,28.5),x,side<.8?-3.98:4.12,32.2,x+.55,hc)}}}
 /* medieval headgear */
 const hd=S.head,IR='#6a6a66',IR2='#57564f';
 if(hd==='kettle'){b('H',-5.4,30.9,-5.4,5.4,31.5,5.4,IR,4);b('H',-4.25,31.5,-4.25,4.25,33.4,4.25,IR2,4);b('H',-2.8,33.4,-2.8,2.8,34.0,2.8,IR2,4);for(let i=0;i<(LD?1:4);i++){const x=rn(-4,3);b('H',x,rn(31.6,32.8),4.22,x+rn(.6,1.2),rn(33,33.4),4.3,RU)}}
 else if(hd==='nasal'){b('H',-4.3,30.0,-4.3,4.3,32.6,4.3,IR,4);b('H',-3.1,32.6,-3.1,3.1,33.6,3.1,IR,4);b('H',-1.6,33.6,-1.6,1.6,34.3,1.6,IR2,4);b('H',-.42,26.6,4.22,.42,30.2,4.55,IR2,4);b('H',-4.32,30.0,-4.32,4.32,30.5,4.32,'#4a4842',4);
  if(!LD)for(let i=0;i<3;i++){const x=rn(-3.6,2.8);b('H',x,rn(30.6,32),4.27,x+1,rn(32,32.6),4.34,RU)}}
 else if(hd==='coif'){const MA='#76787e';b('H',-4.3,24.2,-4.3,4.3,32.4,-1.2,MA,4);for(const s of[-1,1])b('H',s<0?-4.3:3.95,24.2,-1.2,s<0?-3.95:4.3,32.4,4.25,MA,4);b('H',-4.3,31.0,-1.2,4.3,32.4,4.25,MA,4);b('H',-4.3,24.2,3.0,4.3,25.0,4.3,MA,4)}
 else if(hd==='lcoif'){const LN='#cbbf9f';b('H',-4.15,29.8,-4.15,4.15,32.25,3.4,LN);for(const s of[-1,1])b('H',s<0?-4.15:3.85,25.6,-1.4,s<0?-3.85:4.15,29.8,3.0,LN);b('H',-2.8,23.8,1.4,2.8,24.3,2.6,LN)}
 else if(hd==='straw'){b('H',-5.6,31.3,-5.6,5.6,31.9,5.6,'#bfa458');b('H',-3.7,31.9,-3.7,3.7,33.7,3.7,'#cdb164');b('H',-3.72,32.1,-3.72,3.72,32.7,3.72,'#6a3a24');if(!LD)for(let i=0;i<3;i++){const x=rn(-5,3.6),zz=rn(-5,3.6);b('H',x,31.28,zz,x+1,31.94,zz+1,DK)}}
 else if(hd==='hood'||hd==='ghood'||hd==='shroud'){const HC=hd==='ghood'?ZCL.green:hd==='shroud'?WR:TUN;b('H',-4.4,25.4,-4.4,4.4,32.6,-1,HC);b('H',-4.4,31.0,-1,4.4,32.6,4.35,HC);for(const s of[-1,1])b('H',s<0?-4.4:3.95,25.4,-1,s<0?-3.95:4.4,31,4.35,HC);if(hd!=='shroud')b('H',-.55,29.5,-6.2,.55,30.6,-4.4,HC)}
 else if(hd==='circlet'){b('H',-4.12,30.0,-4.12,4.12,30.6,4.12,'#c8a040',4);b('H',-.45,30.0,4.1,.45,30.9,4.24,'#a02424')}
 /* ---- mutations (drawn on the re-proportioned body, in its final coordinates) ---- */
 mut=false;const FLM='#8e2f26',FLD='#5e1a14',IRN='#4a4844';
 /* brute: a hunched abomination - back hump with bone spikes, raw muscle, sunken tusked head, one giant shackled arm */
 if(S.kind==='brute'){
  b('T',-4.8,18.5,-5.8,4.8,25.8,-2.3,SK,0,1);b('T',-3.6,19.4,-6.5,3.6,25.1,-5.7,SKD,0,1);
  for(let i=0;i<4;i++){const x=-2.7+i*1.8,y=25.6+(i%2)*.7;b('T',x-.5,y-.8,-5.4,x+.5,y+2.4+(i%2)*.9,-4.3,BN);b('T',x-.3,y+2.2+(i%2)*.9,-5.2,x+.3,y+3.0+(i%2)*.9,-4.5,BN2)}
  b('T',-4.4,21.6,-6.2,-2.6,23.4,-5.7,FLM);b('T',1.6,19.4,-6.25,3.6,21.0,-5.7,FLM);
  b('T',2.6,19.2,-3.0,5.7,25.5,3.0,FLM);for(let y=19.8;y<25;y+=1.3)b('T',2.7,y,2.96,5.6,y+.45,3.06,FLD);
  b('T',-5.1,15,2.7,-2.4,19.6,2.9,DK);for(let y=15.4;y<19;y+=1.1)b('T',-4.9,y,2.8,-2.6,y+.5,3.02,BN);
  b('H',-3.4,26.7,4.6,3.4,27.6,5.3,BN2);b('H',-2.5,21.4,4.6,-1.6,24.2,5.5,BN);b('H',1.6,21.4,4.6,2.5,24.2,5.5,BN);b('H',-2.2,21.9,4.5,2.2,23.0,5.2,DK);
  for(let i=0;i<3;i++){const y=-6.5-i*3.4;b('AR',3.3,y-1.8,-.6,5.3,y,.6,BN);b('AR',5.2,y-1.2,-.35,6.1,y-.4,.35,BN2)}
  b('AR',-3.9,-19.4,-3.9,3.9,-16.0,3.9,SKD,0,1);for(const x of[-2.6,-.9,.8,2.5])b('AR',x-.65,-20.1,3.1,x+.65,-18.2,4.5,BN2);
  b('AR',-3.7,-9,-3.75,3.7,-6.4,3.75,FLM);b('AR',-3.8,-12.2,-3.8,3.8,-11.0,3.8,IRN,4);for(let i=0;i<4;i++)b('AR',-.55,-13.4-i*1.5,-4.2,.55,-12.3-i*1.5,-3.5,IRN,4);
  b('L',-.7,6.0,2.5,.7,7.6,4.1,BN);b('L',-2.6,2,-.6,-2.5,10,.6,FLD);for(const x of[-1.7,-.5,.7,1.9])b('L',x-.4,0,2.5,x+.4,.8,3.6,BN2);
  for(const y of[-4.6,-13.6])b('AR',-3.65,y,-3.65,3.65,y+1.6,3.65,FLM);b('AR',-3.66,-16,-1.2,-3.55,-2,1.2,FLD);b('AR',3.55,-15,-2.4,3.7,-3,-1.2,FLD);
  for(let i=0;i<3;i++){const y=-3.6-i*4.2;b('AR',-2.6,y-2.2,3.6,2.6,y,4.3,BN2);b('AR',-1.8,y-1.6,4.25,1.8,y-.6,4.6,BN)}
  const VN='#9cff4a';b('AR',-.2,-15.4,3.72,.2,-1.2,3.8,VN,5);b('AR',3.72,-11,-.2,3.8,-2.4,.2,VN,5);b('T',-1.4,14.2,2.95,-1.0,22.6,3.05,VN,5);b('T',-1.0,18.4,2.95,2.4,18.8,3.05,VN,5);b('T',-4.4,17.6,-2.9,-4.0,24.4,-2.75,VN,5);
  b('H',.9,24.1,5.18,2.7,26.0,5.3,DK);b('H',1.2,24.4,5.25,2.4,25.7,5.45,'#ffd23a',5)}
 /* runner: a lanky stalker - long bone claws, a ridge of vertebrae, a split jaw */
 if(S.kind==='runner'){
  for(const A of['AR','AL'])for(const x of[-1.1,0,1.1])b(A,x-.26,-20.2,-.3,x+.26,-15.0,.3,BN2);
  if(!LD)for(let i=0;i<3;i++){const y=15+i*3.1;b('T',-.45,y,-3.0,.45,y+1.6,-1.6,BN)}
  b('H',-2.3,21.9,2.4,2.3,23.8,4.9,SKD,0,1);b('H',-1.9,23.2,4.2,1.9,23.9,5.0,DK);if(!LD)for(const x of[-1.4,-.5,.4,1.3])b('H',x-.13,23.0,4.75,x+.13,23.9,5.05,BN)}
 /* bomber: a bloated walking blister - stretched belly glowing through its cracks, pustules everywhere */
 if(S.kind==='bomber'){const PU='#ffb03a',PU2='#ffe27a',CR='#ff7a1a',SW1=SKL,SW2=SK,VE='#5a2a3a';
  /* a round swollen mass: stacked boxes shrinking in every direction, hanging over the hips */
  b('T',-6.4,10.6,-3.2,6.4,22.6,5.8,SW2,0,1);b('T',-7.1,12.6,-2.2,7.1,20.6,5.0,SW2,0,1);b('T',-5.6,9.8,-3.9,5.6,23.4,6.9,SW2,0,1);b('T',-4.4,11.2,6.8,4.4,21.8,7.9,SW1,0,1);b('T',-2.8,12.8,7.8,2.8,20.2,8.5,SW1,0,1);
  b('T',-5.2,11.4,-4.6,5.2,22.4,-3.8,SW2,0,1);b('T',-7.7,14.2,-1.2,7.7,19.0,4.0,SW2,0,1);
  /* glowing cracks of the stretched skin */
  b('T',-3.6,16.6,8.45,1.6,17.1,8.6,CR,5);b('T',.9,13.6,8.5,1.4,18.8,8.62,CR,5);b('T',-1.8,18.6,7.95,-1.3,21.2,8.1,CR,5);b('T',-7.75,15.2,.4,-7.6,18.6,.9,CR,5);b('T',7.6,14.6,1.2,7.75,17.8,1.7,CR,5);
  /* big pustules: a dark rim, a raised blister, a glowing core */
  const PS=[[3.4,19.6,7.0,1.9],[-3.2,13.8,7.1,1.7],[-4.6,20.2,5.6,1.4],[0,21.8,6.5,1.3],[4.4,13.4,6.2,1.3],[-.6,16.4,8.5,1.2],[-3,22.2,-4.0,1.3],[2.6,17,-4.2,1.5],[-1,12.4,-4.2,1.0],[5.6,21.6,1,1.0],[-6.1,21.4,-.6,1.1]];
  for(const[x,y,z,s]of PS){const bz=z>0?1:-1,f=z>0?Math.max(z,0):z;b('T',x-s-.3,y-s-.3,f-.25*bz,x+s+.3,y+s+.3,f+.2*bz,'#6a3a2a');b('T',x-s,y-s,f,x+s,y+s,f+.55*bz,PU,5);b('T',x-s*.55,y-s*.55,f+.5*bz,x+s*.55,y+s*.55,f+.85*bz,PU2,5)}
  for(const[x,y,w]of[[-5.6,15.6,2.6],[2.4,21.6,2.4],[-1.4,11.2,3.0]])b('T',x,y,7.0,x+w,y+.34,7.4,VE);
  /* small sunken head: gaping mouth, a blister on the scalp */
  b('H',-1.9,23.0,3.55,1.9,24.4,3.85,DK);b('H',-1.5,22.2,3.6,-.9,23.2,3.9,PU2,5);b('H',-2.6,28.4,-1.2,-.6,29.4,1.0,PU,5);
  /* stubby arms with blisters */
  b('AR',-2.3,-7,-2.3,2.3,-5.6,2.3,PU,5);b('AL',-2.3,-5,-2.3,2.3,-3.8,2.3,PU,5)}
 /* acid spitter: hunched forward, three swollen acid sacs on the back, a bulging throat and an unhinged drooling jaw */
 if(S.kind==='acid'){const AC='#a8e030',AC2='#d0ff60',AV='#4a6a18';
  for(const[x0,y0,x1,y1,z]of[[-4.2,15,-.8,21.6,-2.3],[.2,16.8,4.0,23.6,-2.3],[-3.0,21.4,1.8,28.4,-2.1]]){b('T',x0,y0,z-2.4,x1,y1,z,AC,5);b('T',x0+.5,y0+.5,z-2.9,x1-.5,y1-.5,z-2.3,AC2,5);
   b('T',x0+.2,(y0+y1)/2,z-2.95,x1-.2,(y0+y1)/2+.3,z-2.85,AV);b('T',(x0+x1)/2,y0+.3,z-2.95,(x0+x1)/2+.3,y1-.3,z-2.85,AV)}
  b('T',-3.3,16.8,2.0,3.3,24.6,5.4,AC,5);b('T',-2.6,17.6,5.3,2.6,23.6,6.3,AC2,5);b('T',-.18,17.8,6.25,.18,23.4,6.4,AV);b('T',-2.2,20.4,6.25,2.2,20.7,6.4,AV);b('T',-3.35,16.6,1.9,3.35,17.2,5.0,SKD,0,1);b('T',2.4,21.6,-1.6,4.9,25.2,1.9,AC,5);b('T',2.9,22.2,-1.9,4.4,24.6,2.2,AC2,5);
  for(const[x,y,s]of[[-2.6,17.4,.8],[1.4,15.2,.7],[-.6,13.4,.6],[3.0,18.6,.55]]){b('T',x-s-.2,y-s-.2,1.98,x+s+.2,y+s+.2,2.25,SKD,0,1);b('T',x-s,y-s,2.2,x+s,y+s,2.55,AC,5)}
  for(const A of['AR','AL'])b(A,-.4,-15.4,-.4,.4,-13.6,.4,AC2,5);
  b('H',-3.0,19.4,2.6,3.0,21.6,6.2,SKD,0,1);b('H',-2.6,21.5,2.8,2.6,22.4,6.0,DK);for(const x of[-2,-1,0,1,2])b('H',x-.15,21.5,5.7,x+.15,22.3,6.05,BN);
  b('H',-.45,16.4,5.5,.3,19.6,6.0,AC2,5);b('H',1.1,17.6,5.3,1.6,19.6,5.8,AC,5);
  b('H',-3.5,27.6,-1.4,-.8,30.4,1.8,AC,5);b('H',1.4,28.6,-.4,3.2,30.2,1.4,AC,5);b('AR',-2.06,-10,-2.06,2.06,-7.6,2.06,'#6a7a28',0,1)}
 /* miner: a burrower - leather helmet and lamp on a thrust-out head, ore grown into its back, a forearm turned into a bone pick and digging claws */
 if(S.kind==='miner'){const LE='#5a4630',LE2='#463624',OR='#ffd23c',ST='#8a8a92';
  b('H',-4.1,28.6,-3.0,4.1,31.4,5.0,LE);b('H',-4.8,28.4,-3.7,4.8,29.0,5.8,LE2);b('H',-4.12,29.4,-3.02,4.12,29.9,5.02,'#3a2a1a');b('H',-1.2,29.0,4.9,1.2,31.0,5.7,'#5e5e5a',4);b('H',-.85,29.3,5.6,.85,30.7,6.0,'#ffe890',5);
  for(const[x,y,c,s]of[[-2.6,20,ST,1.4],[1.8,22.4,OR,1.0],[-.4,16.8,ST,1.2],[3.0,17.4,OR,.8],[-3.6,23.2,ST,1.0],[.6,19.6,'#6a6a72',.9]])b('T',x-s,y-s,-3.5,x+s,y+s,-2.4,c,c===OR?4:0);
  b('T',-3.6,12.4,2.5,3.6,20.4,2.8,'#6a4a2a');b('T',-4.66,14.4,-2.56,4.66,15.2,2.56,'#2e2014');
  b('AR',-2.3,-13,-2.3,2.3,-6,2.3,'#5a4632');b('AR',-1.7,-17,-1.7,1.7,-12,1.7,BN);b('AR',-1.3,-21,-1.3,1.3,-16.8,1.3,BN2);b('AR',-1.3,-23.6,-8.6,1.3,-20.8,9.4,BN);b('AR',-1,-23.2,9.2,1,-21.2,11.6,BN2);b('AR',-1,-23.2,-10.6,1,-21.2,-8.4,BN2);b('AR',-.6,-22.9,11.4,.6,-21.5,12.6,'#e8e2d0');b('AR',-.6,-22.9,-11.6,.6,-21.5,-10.4,'#e8e2d0');b('AL',-2.3,-12,-2.3,2.3,-6,2.3,'#5a4632');
  b('T',-3.8,19,-6.8,3.8,27.4,-2.5,'#6a5434');b('T',-3.0,26.8,-6.2,3.0,27.9,-3.0,'#4e3c24');b('T',-2.2,21.2,-6.9,-.6,22.8,-6.7,OR,4);b('T',.8,23.4,-6.9,2.6,25.0,-6.7,OR,4);b('T',-.4,24.8,-6.9,1.2,26.2,-6.7,'#8a8a92');
  for(const x of[-1.45,0,1.45])b('AL',x-.55,-16.6,-.9,x+.55,-11.4,.9,BN2)}}

/* unit models (Minecraft-style groups; 1 px = .46 vb) */
export function zombieKit(type,ZV,P){if(PXON&&!window.__ZOLD){const mk=ZV&&ZV.hint==='boss'?'boss':type;if(mut2(mk))pxMutant(mk,type,ZV,P);else pxZombie(type,ZV,P);return}const{G,HG,LA,LG,AG}=P,k=.46,S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null);
/* fixed tiny epsilon (bxc's counter-based one could swallow sub-pixel details such as eyes) */
 const put=(Gx,m,yo,x0,y0,z0,x1,y1,z1,c)=>{const o=geometryState.BMAT;geometryState.BMAT=m;try{const e=.00012,q=k*VX;addBox(Gx,x0*q-e,(yo+y0*k)*VX-e,z0*q-e,x1*q+e,(yo+y1*k)*VX+e,z1*q+e,rgb(c))}finally{geometryState.BMAT=o}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m)=>{
  if(R==='T')put(G,m,5.5-12*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='H')put(HG,m,11-24*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AR')put(AG,m,0,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AL')put(LA,m,10.45,-2.76/k-x1,y0,z0,-2.76/k-x0,y1,z1,c);
  else if(R==='L')put(LG,m,-5.5,x0,y0,z0,x1,y1,z1,c)});
 return S}
