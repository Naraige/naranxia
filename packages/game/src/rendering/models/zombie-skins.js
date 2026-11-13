import { newG } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { PD, PDP, pxBox, pxCat, pxN, pxScene, shadeHex } from './pixel-geometry.js';
import { VX } from './unit-parts.js';
import { RDS, RWD } from './weapons.js';
import { uv2 } from './unit-style.js';
import { MUTX, ZCL, zSpec } from './zombies.js';

/* ================= ZOMBIES: the same random undead (zSpec: skin, decay, outfit, headgear, wounds) as pixel skins =================
   the part sizes follow the old body mutations (MUTX: the brute's big arm, the bomber's barrel chest...); arms are built one by one */
function pxArms2(P,fR,fL){const TR=newG(),TL=newG();pxScene(()=>fR(TR));pxScene(()=>fL(TL));pxCat(P.AG,TR);pxCat(P.LA,TL,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}

export function pxZombie(type,ZV,P){
 const S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null),MT=MUTX[type],sd=S.seed>>>0,o=S.outfit,dc=S.decay,hd=S.head;
 const skel=dc==='skel',bony=dc==='bones',mum=dc==='mummy',dried=dc==='dried'||mum,C=PD;
 const mixH=(a,b,t)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')},
  zg=h=>dried?h:mixH(h,'#4f8a44',.32);
 const SK=C(zg(S.sk[0])),SKD=C(zg(S.sk[1])),SKL=C(zg(S.sk[2])),BN=C(S.bn[0]),BN2=C(S.bn[1]),BND=C(S.bn[2]),DK=C('#160c08'),FL=C('#6a1e14'),FL2=C('#9a3424'),
  WR=C('#cbbd98'),WR2=C('#a99c7a'),HAIR=C(S.hairc),EY=C(S.eye),RU=C('#5a3a20'),ST=PDP(['#2c2e34','#4a4d55','#6d717a','#949aa3']),GO=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const TUNh=o==='soldier'?'#6e7078':o==='gambeson'?'#b6a684':o==='monk'?((sd&1)?ZCL.wool:ZCL.black):o==='shroud'?'#cbbd98':o==='rags'||o==='peasant'?ZCL.burlap:o==='hooded'?'#5a3a22':S.tun;
 const TC=C(TUNh),TD=shadeHex(TC,.78),T2=C(S.tun2||TUNh),T2D=shadeHex(T2,.78),HO=C(S.hose);
 const nz=(f,u,v)=>pxN(f,u+(sd%89),v+((sd>>7)%83),sd%13);
 const tT=(MT&&MT.T)||[1,1,1,0,0];
 /* units board, look B (unit-style.js): hem shadow and lit shoulders on every part, plus identity cubes per kind (see the end of the build) */
 const hint=ZV?ZV.hint:null,boss=hint==='boss',V2=boss||uv2(type),zt=(p,hd)=>(f,u,v,W,H)=>{const c=p(f,u,v,W,H);if(!c||f==='T'||H<8)return c;return v<=1?shadeHex(c,.82):(v>=H-2&&!hd)?shadeHex(c,1.08):c};
 const zb=(R,Gx,x,y,z,w,h,d,paint,op)=>{if(V2&&op&&op.grid&&op.grid[1]>=8&&op.mat!==5)paint=zt(paint,R==='H');const t=MT&&MT[R];if(t){const py=R==='H'?24:R==='T'?12:0;x*=t[0];w*=t[0];y=(y-py)*t[1]+py+t[3];h*=t[1];z=z*t[2]+t[4];d*=t[2]}pxBox(Gx,x,y,z,w,h,d,paint,op)};
 const skin=(f,u,r)=>{const n=nz(f,u,r);if(dried)return n<.18?SKD:(n>.86?SKL:SK);const w=nz('W'+f,u>>1,r>>1);if(w>.95)return (u+r)%2?FL2:FL;if(n<.13)return SKD;if(n>.93)return SKL;return SK};
 const wrap=(f,u,r)=>{const n=nz('w'+f,u,r);if(n<.05)return DK;return ((r+(n<.22?1:0))%2)?WR:WR2};
 const bone=(f,u,r)=>{const n=nz('b'+f,u,r);return n<.15?BN2:(n>.93?BND:BN)};
 /* ---- head ---- */
 const hairOn=S.hair!=='none'&&!skel&&!mum;
 const head=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if((r===3||r===4)&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return DK;if(r===6)return (u===0||u===7)?BN2:(u%2?BN:DK);if(r===7)return (u>=1&&u<=6)?BN2:BND}return bone(f,u,r)}
  if(mum){if(f==='F'&&r===4&&(u===2||u===5||u===6))return DK;return wrap(f,u,r)}
  if(hairOn&&(f==='T'||(f==='B'&&r<6)||((f==='R'||f==='L')&&r<3)||(f==='F'&&r<1))){const n=nz('h'+f,u,r);if(S.hair==='patchy'&&n<.45)return skin(f,u,r);if(S.hair==='stringy'&&n<.25)return skin(f,u,r);return n>.8?shadeHex(HAIR,.8):HAIR}
  if(f==='F'){if(r===4&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return SKD;
   if(type==='acid'&&r>=6&&(u===3||u===4))return C('#b8f040');
   if(r===6&&u>=2&&u<=5)return (S.jawOff||u===3||u===4)?DK:SKD;if(r===7&&S.jawOff&&u>=2&&u<=5)return u%2?BN:DK;
   if(S.cheek&&r>=5&&r<=6&&(S.cheek<0?u<=1:u>=6))return r===5?BN:BN2;if(S.skullPatch&&r<=2&&u<=2)return BN}
  if(S.skullPatch&&f==='T'&&u<3&&r<3)return BN;
  return skin(f,u,r)};
 /* ---- torso, arms, legs (bare body) ---- */
 const body=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if(u===3||u===4)return r<11?BN2:BND;if(r>=1&&r<=7)return r%2?BN:DK;return (r>=8&&r<=9)?DK:BN2}if(f==='B'){if(u===3||u===4)return BN;return (r>=1&&r<=7&&r%2)?BN2:DK}return (r>=1&&r<=7&&r%2)?BN:DK}
  if(mum)return wrap(f,u,r);
  if(bony&&f==='F'&&r>=2&&r<=7&&u>=1&&u<=6&&((S.cheek>=0?u<=3:u>=4)||nz('rb',u,r)<.35))return r%2?BN:FL;
  if(type==='acid'&&nz('p'+f,u,r)>.93)return C('#c8ff60');
  return skin(f,u,r)};
 const limb=(bare,k)=>(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(bare&&r>=6){const n=nz('a'+k+f,u,r);return r>=10?(n<.5?BN:BN2):(n<.3?FL:(n<.7?BN:BN2))}return skin(f,u,r)};
 const leg=(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(o==='bare')return r>=11?SKD:skin(f,u,r);if(r>=10)return r===11?DK:RU;return nz('l'+f,u,r)<.1?shadeHex(HO,.8):HO};
 /* ---- clothes (outer layer): torn hems and holes from the seed ---- */
 const torn=(f,u,r,k,lim)=>{const n=nz('t'+f+k,u,r);return r>=lim-((n*3)|0)};
 const hole=(f,u,r,p)=>nz('o'+f,u,r)<p;
 let jacket=null,sleeve=null,pants=null;
 if(o==='tunic'||o==='peasant'||o==='rags'||o==='gambeson'||o==='hooded'){const qu=o==='gambeson',rag=o==='rags'?.3:.07,BELT=o==='peasant'?C('#c8a868'):C('#4a3622');
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return TC;if(torn(f,u,r,'j',11))return null;if(hole(f,u,r,rag))return null;if(r===6&&o!=='rags')return BELT;
   if(qu)return ((u+r)%3===0)?TD:TC;if(o==='peasant'&&nz('pa'+f,u>>1,r>>1)>.85)return lighten(TC,.1);return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v,len=qu?9:o==='hooded'?11:5;if(f==='D')return null;if(f==='T')return TC;if(r>=len||torn(f,u,r,'s',len))return null;if(hole(f,u,r,rag))return null;return (qu&&(u+r)%3===0)?TD:TC}}
 else if(o==='soldier'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(torn(f,u,r,'j',12))return null;if(hole(f,u,r,.06))return null;
   if((f==='F'||f==='B')&&u>=2&&u<=5&&r>=1)return r===6?C('#4a3622'):(nz('c'+f,u,r)<.12?T2D:T2);return (u+r)%2?ST[1]:ST[2]};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||r>=6||torn(f,u,r,'s',6))return null;return (u+r)%2?ST[1]:ST[2]}}
 else if(o==='monk'||o==='shroud'||o==='noble'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return hole(f,u,r,.12)?null:wrap(f,u,r);
   if(o==='noble'){if(r===0)return C('#e6e0d0');if((f==='F')&&(u===3||u===4)&&r>=1&&r<=8&&r%2)return GO[1];if(torn(f,u,r,'j',12))return null;return nz('c'+f,u,r)<.12?T2D:T2}
   if(r===6)return C('#c8a868');if(hole(f,u,r,.05))return null;return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return (r>=9||hole(f,u,r,.15))?null:wrap(f,u,r);if(r>=(o==='noble'?11:10)||torn(f,u,r,'s',10))return null;return o==='noble'?(r%3===1?GO[1]:T2):TC};
  if(o==='monk')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;if(torn(f,u,r,'p',11))return null;return nz('m'+f,u,r)<.15?TD:TC};
  if(o==='shroud')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;return hole(f,u,r,.25)?null:wrap(f,u,r)}}
 if(o==='bare'&&!skel&&!mum)pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D'||r>3)return null;if(torn(f,u,r,'p',4))return null;return C(ZCL.burlap)};
 if(type==='bomber'){const s0=jacket;jacket=(f,u,v,W,H)=>{const r=H-1-v;if((f==='F'||f==='B')&&Math.abs((f==='F'?u:7-u)-(r*.62+.5))<.9)return C('#4a2e16');if(f==='T'&&(u===1||u===2))return C('#4a2e16');return s0?s0(f,u,v,W,H):null}}
 /* ---- headgear (outer layer) ---- */
 const win=(f,u,r,a,b)=>f==='F'&&r>=a&&r<=b&&u>=1&&u<=6;
 const STEEL=(f,u,r)=>f==='T'?ST[3]:(r===0?ST[3]:(r===1?ST[2]:ST[1]));
 let hat=null,brim=null,lamp=false;
 if(hd==='kettle'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<3?STEEL(f,u,r):null)};brim=[ST[2],ST[1],ST[3]]}
 else if(hd==='nasal')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<3)return STEEL(f,u,r);if(f==='F'&&(u===3||u===4)&&r<6)return ST[2];return null};
 else if(hd==='coif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,6))return null;return (u+r)%2?ST[1]:ST[2]};
 else if(hd==='hood'||hd==='ghood'){const HC=hd==='ghood'?C(ZCL.green):TC;hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,7))return null;if(hole(f,u,r,.06))return null;return nz('hd'+f,u,r)<.15?shadeHex(HC,.8):HC}}
 else if(hd==='straw'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<2?C(nz('st'+f,u,r)<.3?'#a88a42':'#d4b45c'):null)};brim=[C('#d4b45c'),C('#a88a42'),C('#ecd27a')]}
 else if(hd==='lcoif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<2)return C('#d8cbaa');if((f==='R'||f==='L')&&r<6)return C('#c4b694');return null};
 else if(hd==='circlet')hat=(f,u,v,W,H)=>{const r=H-1-v;return (f!=='T'&&f!=='D'&&r===2)?(u%3===1?GO[2]:GO[1]):null};
 else if(hd==='shroud')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,3,5))return null;return wrap(f,u,r)};
 else if(hd==='mhelm'){hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return C(nz('mh',u,r)<.2?'#8a6a2a':'#a8823a');if(r<3)return r===2?C('#5a3a1a'):C('#a8823a');return null};lamp=true}
 /* ---- build ---- */
 const lw=skel?2:4;
 pxScene(()=>{
  zb('H',P.HG,-4,24,-4,8,8,8,head,{mat:0,grid:[8,8,8]});
  if(hat)zb('H',P.HG,-4.5,23.5,-4.5,9,9,9,hat,{mat:hd==='kettle'||hd==='nasal'||hd==='coif'?4:0,grid:[8,8,8],ao:false});
  if(brim)zb('H',P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?brim[2]:brim[0]):(f==='D'?brim[1]:brim[0]),{mat:hd==='kettle'?4:0,grid:[12,1,12]});
  if(lamp){zb('H',P.HG,-1.2,30.2,4.4,2.4,2,1.2,f=>f==='F'?C('#fff2a0'):C('#6a5a3a'),{mat:5,grid:[2,2,1]});zb('H',P.HG,-4.6,29.7,3.2,9.2,.6,2,()=>C('#5a3a1a'),{mat:0,grid:[8,1,2]})}
  /* eyes that glow in the dark sockets (one for a mummy) */
  for(const x of(mum?[1]:[-2,1]))zb('H',P.HG,x,27,4,1,1,.14,()=>EY,{mat:5,grid:[1,1,1],ao:false});
  zb('T',P.G,-4,12,-2,8,12,4,body,{mat:0,grid:[8,12,4]});
  if(jacket)zb('T',P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,jacket,{mat:o==='soldier'?4:0,grid:[8,12,4],ao:false});
  zb('L',P.LG,-lw/2,-12,-lw/2,lw,12,lw,leg,{mat:0,grid:[4,12,4]});
  if(pants&&!skel)zb('L',P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,pants,{mat:0,grid:[4,12,4],ao:false});
  pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true});
  /* arrows stuck in the back */
  for(let i=0;i<S.arrows;i++){const ax=-2.5+5*nz('ar',i,1),ay=15+6*nz('ar',i,2),z0=-2*tT[2]+tT[4];
   pxBox(P.G,ax-.25,ay-.25,z0-5.5,.5,.5,6.2,()=>C('#8a6a3a'),{mat:0,grid:[1,1,6],ao:false});pxBox(P.G,ax-.1,ay-.9,z0-5.6,.2,1.8,1.4,()=>C('#efe9d6'),{mat:0,grid:[1,2,1],ao:false})}
  /* the bomber's powder keg, fuse and spark; the acid spitter's glowing sacs */
  const zB=-2.25*tT[2]+tT[4];
  if(type==='bomber'){const W2=6,yk=(13-12)*tT[1]+12;pxBox(P.G,-W2/2,yk,zB-5,W2,8,5,(f,u,v,_W,_H)=>{if(f==='T'||f==='D')return (u+v)%3?RWD[2]:RWD[1];if(v===1||v===6)return RDS[1];return u%2?RWD[2]:RWD[3]},{mat:0,grid:[6,8,5]});
   pxBox(P.G,-.3,yk+8,zB-2.8,.6,2,.6,()=>C('#3a2a1a'),{mat:0,grid:[1,2,1],ao:false});pxBox(P.G,-.45,yk+10,zB-2.95,.9,.9,.9,()=>C('#ffb02a'),{mat:5,grid:[1,1,1],ao:false})}
  if(type==='acid')for(const[sx,sy,sz,s]of[[-2.6,19,0,3.4],[1.4,16,-.6,2.8],[-.4,21.2,-.2,2.4]])pxBox(P.G,sx,sy*tT[1]+(1-tT[1])*12,zB-s*.75+sz,s,s,s,(f,u,v)=>((u+v)%2?C('#9ae030'):C('#c8ff60')),{mat:5,grid:[2,2,2],ao:false});
  if(V2){const IR=PDP(['#2a2422','#4a403a','#6e625a','#8e8278']),RP=[C('#a08a5a'),C('#7a6840')],bone2=(f,u,v,W,H)=>f==='T'||v===H-1?BN:(v===0?BND:BN2),sold=hint==='knight'||hint==='spearman'||hint==='captain'||hint==='bannerman'||hint==='king'||hint==='guard';
   if(type==='zombie'&&!sold){const pr=sd%3+1;
    if(pr===1){zb('T',P.G,-3.1,22.8,-2.7,6.2,1.5,5.4,(f,u,v)=>RP[(u+v)%2],{mat:0,grid:[6,1,5]});zb('T',P.G,1.1,18,2.3,1.1,5,.9,(f,u,v)=>RP[v%2],{mat:0,grid:[1,5,1],ao:false})}
    if(pr===2){zb('T',P.G,-1.6,17.2,-6.4,1,1.7,11.4,(f,u,_v,_W,_H)=>f==='F'?ST[3]:(u%4===3?RU:ST[2]),{mat:4,grid:[1,1,8]});zb('T',P.G,-3.4,16.6,-5.4,4.6,2.9,.9,()=>RU,{mat:0,grid:[4,1,1]})}
    if(pr===3)zb('T',P.G,-5,16.6,-3.5,10,7.6,1.1,(f,u,v,W,H)=>(v<2&&nz('ck',u,v)<.5)||(v<4&&nz('cl',u,v)<.2)?null:(v===H-1?T2:nz('cm',u,v)<.2?T2D:T2),{mat:0,grid:[10,8,1],ao:false})}
   if(type==='husk'){zb('H',P.HG,2,19.5,-5,1.6,6.5,.8,(f,u,v)=>v%2?WR:WR2,{mat:0,grid:[1,6,1],ao:false});zb('H',P.HG,-3.4,22,-5,1.4,4,.8,(f,u,v)=>v%2?WR2:WR,{mat:0,grid:[1,4,1],ao:false})}
   if(type==='runner'){const HB=C(['#a8332a','#b8862a','#2a6a8a'][sd%3]),HBD=shadeHex(HB,.72);zb('H',P.HG,-4.4,28.4,-4.4,8.8,1.4,8.8,(f,u,_v)=>f==='T'||f==='D'?null:(u%4===1?HBD:HB),{mat:0,grid:[8,1,8],ao:false});
    zb('H',P.HG,.6,25.6,-7,1.4,3.6,2.6,(f,u,v,_W,_H)=>v===0?HBD:HB,{mat:0,grid:[1,3,2],ao:false});zb('H',P.HG,-2.2,26.8,-6.4,1.4,2.4,2,(f,u,v,_W,_H)=>v===0?HBD:HB,{mat:0,grid:[1,2,2],ao:false})}
   if(type==='brute'){zb('T',P.G,-3.7,22.4,-3.1,7.4,2.2,6.2,(f,u,v,W,H)=>f==='T'?IR[2]:(v===H-1?IR[3]:(u%3===1?IR[0]:IR[1])),{mat:4,grid:[7,2,6]});
    for(let i=0;i<3;i++)zb('T',P.G,-.7,20.6-i*3.3,-4.1,1.4,1.8,2.2,bone2,{mat:0,grid:[1,2,2]})}
   if(type==='bomber')for(const x of[-3.7,1.3]){zb('T',P.G,x,12.4,2.1,2.4,2.4,2.3,(f,u,v,W,H)=>f==='T'||(u===0&&v===H-1)?IR[3]:IR[1],{mat:4,grid:[2,2,2]});zb('T',P.G,x+.8,14.8,2.9,.8,1.1,.8,()=>C('#ffb02a'),{mat:5,grid:[1,1,1],ao:false})}
   if(type==='acid'){zb('H',P.HG,-.7,21.8,3.5,1.4,2.4,.8,(f,u,v)=>v?C('#c8ff60'):C('#9ae030'),{mat:5,grid:[1,2,1],ao:false});for(const x of[-4.4,2.2])pxBox(P.G,x,(22.2-12)*tT[1]+12,-1.1+tT[4],2.2,2.4,2.2,(f,u,v)=>((u+v)%2?C('#9ae030'):C('#c8ff60')),{mat:5,grid:[2,2,2],ao:false})}
   if(type==='miner'){zb('T',P.G,-3.2,13.2,-5.9,6.4,6.6,3.7,(f,u,v,W,H)=>f==='T'?((u+v)%3===0?GO[2]:(u+v)%3===1?ST[2]:GO[1]):(v===H-1?C('#5a4a30'):nz('sk'+f,u,v)<.2?C('#7a6844'):C('#96805a')),{mat:0,grid:[6,6,3]});
    zb('T',P.G,2.4,20.6,-2.7,2.3,3.6,5.4,(f,u,v)=>RP[(u+v)%2],{mat:0,grid:[2,3,5]})}
   if(boss){const FLG=C(['#8a1c1c','#5a2a7a','#1c5a4a','#8a5a1c','#2a3a7a','#6a1c4a'][(ZV.v|0)%6]),FLD=shadeHex(FLG,.7);
    for(const sx of[-1,1]){zb('H',P.HG,sx>0?3.6:-6.8,28.6,-1.2,3.2,2.2,2.4,bone2,{mat:0,grid:[3,2,2]});zb('H',P.HG,sx>0?5.6:-7.2,30.6,-1,1.6,3.6,1.8,bone2,{mat:0,grid:[1,3,1]})}
    zb('H',P.HG,-3.8,23.2,3.7,7.6,3.2,1.2,(f,u,v,W,H)=>f==='F'&&v===H-1&&u%2?null:(v===0?IR[1]:(u%2?IR[2]:IR[3])),{mat:4,grid:[7,3,1]});
    zb('T',P.G,1.6,13,-4.4,1,25,1,(f,u,v)=>(v%6===0?RWD[1]:RWD[2]),{mat:0,grid:[1,12,1]});
    zb('T',P.G,-4.4,27.5,-4.2,6,10.5,.7,(f,u,v,W,H)=>(v<2&&(u%3===1))||(v<4&&nz('fg',u,v)<.25)?null:v===H-1?GO[1]:((u===2||u===3)&&(v===6||v===7))||((u===1||u===4)&&v===5)?C('#e6dcc4'):(u%3===0?FLD:FLG),{mat:0,grid:[6,10,1],ao:false})}}
 });
 /* arms one by one: the brute's right arm is huge, shackle and chain on its left wrist, bone spikes on its shoulder; the miner holds a pick */
 const arm=(R)=>T=>{const t=MT&&MT[R],ab=(x,y,z,w,h,d,p,op)=>{if(V2&&op&&op.grid&&op.grid[1]>=8)p=zt(p);if(t){x*=t[0];w*=t[0];y=y*t[1];h*=t[1];z*=t[2];d*=t[2]}pxBox(T,x,y,z,w,h,d,p,op)};
  ab(-lw/2,-12,-lw/2,lw,12,lw,limb(R==='AR'?S.armR:S.armL,R),{mat:0,grid:[4,12,4]});
  if(sleeve&&!skel)ab(-2.25,-12.25,-2.25,4.5,12.5,4.5,sleeve,{mat:o==='soldier'?4:0,grid:[4,12,4],ao:false});
  if(type==='brute'&&R==='AR')for(const[x,z,h]of[[-.8,-1,3.4],[.6,.9,2.6]])ab(x,0,z,1.2,h,1.2,(f)=>f==='T'?BN2:BN,{mat:0,grid:[1,3,1]});
  if(type==='brute'&&R==='AL'){ab(-2.6,-9.6,-2.6,5.2,1.8,5.2,(f,u,_v)=>f==='T'||f==='D'?ST[1]:(u%2?ST[2]:ST[1]),{mat:4,grid:[5,2,5]});for(let i=0;i<3;i++)ab(-.5,-11.2-i*1.4,2.4,1,1.2,.6,()=>ST[i%2?1:2],{mat:4,grid:[1,1,1],ao:false})}
  if(V2){const IR=PDP(['#2a2422','#4a403a','#6e625a','#8e8278']),sold=hint==='knight'||hint==='spearman'||hint==='captain'||hint==='bannerman'||hint==='king'||hint==='guard';
   if(type==='runner')for(const[x,z,l]of[[-1.7,-.5,3.4],[.8,.4,2.8]])ab(x,-12-l,z,.9,l+.4,.9,(f,u,v)=>v===0?BND:BN,{mat:0,grid:[1,3,1],ao:false});
   if((type==='brute'&&R==='AL')||(boss&&R==='AR')||(type==='zombie'&&sold&&R==='AL')){ab(-2.9,-1.5,-2.9,5.8,3.1,5.8,(f,u,v,W,H)=>f==='T'?((u===1||u===3)&&(v===1||v===3)?IR[3]:IR[2]):(v===H-1?IR[3]:v===0?IR[0]:IR[1]),{mat:4,grid:[5,3,5]});
    if(type==='brute')ab(-.6,1.6,-.6,1.2,2.2,1.2,(f)=>f==='T'?BN2:BN,{mat:0,grid:[1,2,1]})}}
  if(type==='miner'&&R==='AR'){ab(-.5,-11.5,-1.5,1,1,11,(f,u,v)=>((u+v)%2?RWD[2]:RWD[3]),{mat:0,grid:[1,1,11]});ab(-.6,-16,8.6,1.2,9,1.5,(f,u,v,W,H)=>v===0||v===H-1?RDS[1]:RDS[3],{mat:4,grid:[1,9,1]})}};
 pxArms2(P,arm('AR'),arm('AL'));
}
