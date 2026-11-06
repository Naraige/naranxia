import { newG, toGeo } from '../geometry.js';
import { PD, PDP, pxBox, pxScene, PXV, teamPal } from './pixel-geometry.js';
import { VX } from './unit-parts.js';
import { pBev, RDS, RWD } from './weapons.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ================= ROUND 3: capes, the bannerman's banner, the cannon, the swarm's skin tone ================= */
export const pxZg=h=>{const A=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),B=[0x4f,0x8a,0x44];return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*.32).toString(16).padStart(2,'0')).join('')};

/* capes: a Minecraft cape (one pixel thick, the art on the back) with folds, hems and an emblem; s = 1 / PXV converts old units */
export function pxCapes(type,P0){const X=P0.X;if(!X)return;const s=1/PXV,Tm=teamPal(thp()),C=PD;
 const R=PDP(['#6c111b','#8e1a26','#a62832','#c94450']),E=C('#f3efe6'),Ex=C('#18181c'),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const cape=(Gx,w,h,z,W,H,col)=>pxBox(Gx,-w/2,-h,z,w,h,1.1,(f,u,v)=>{const r=H-1-v;return col(f,u,r,W,H)},{mat:0,grid:[W,H,1]});
 const fold=(u,W)=>u%3===1?1:(u%3===2?2:0);
 const sun=(u,r,u0,r0)=>{const du=u-u0,dr=r-r0;if(Math.abs(du)+Math.abs(dr)<=1)return G[2];if((du===0&&Math.abs(dr)===2)||(dr===0&&Math.abs(du)===2))return G[1];return null};
 if(type==='guard'){X.cape=newG();cape(X.cape,4.5*s,7.6*s,-.65*s,10,16,(f,u,r,W,H)=>{if(r<=1)return r?Tm[2]:Tm[3];if(r===H-1)return G[1];if(f==='B'||f==='F'){const c=sun(u,r,4.5|0,5);if(c&&f==='B')return c}return R[[2,1,3][fold(u)]]})}
 if(type==='captain'){X.cape=newG();cape(X.cape,4.2*s,9*s,-.65*s,10,18,(f,u,r,W,H)=>{if(r>=H-2)return r===H-1?G[0]:G[1];if(f==='B'){const c=sun(u,r,4,4);if(c)return c}return [Tm[3],Tm[2],Tm[4]][fold(u)]})}
 if(type==='king'){X.cape=newG();X.cape2=newG();
  const erm=(u,r,W)=>(u===0||u===W-1)?((r%3===1)?Ex:E):null;
  cape(X.cape,5.6*s,5*s,-.67*s,12,11,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r<=1)return (r===1&&u%3===1)?Ex:E;
   if(f==='B'&&r>=3&&r<=7&&u>=3&&u<=8){const du=u-5.5,dr=r-5;if(Math.abs(du)<=2&&Math.abs(dr)<=2){if(dr===-2)return (u%2)?G[2]:null;return dr===2?G[0]:G[1]}}return R[[2,1,3][fold(u)]]});
  cape(X.cape2,6.6*s,5.3*s,-.67*s,14,12,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r>=H-2)return r===H-1?G[0]:G[2];return R[[2,1,3][fold(u)]]})}}

/* the bannerman's banner: three chained cloth pieces painted as one 20 x 30 Minecraft banner: team field, gold border,
   a gold fleur-de-lis, a swallow tail cut in the bottom */
const FLEUR=['...GG...','..GGGG..','..GGGG..','G..GG..G','GG.GG.GG','GGGGGGGG','.GGGGGG.','...GG...','..GGGG..','...GG...'];

export function pxBanner(X){const s=1/PXV,Tm=teamPal(thp()),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']),BW=11.2,SH=5.6,TOT=16.6,W=20,H=30,rp=TOT/H;
 const px=(u,r)=>{if(r>=24){const half=(r-23)*1.55;if(Math.abs(u-9.5)<half)return null}if(r===0)return G[0];if(r===1)return G[2];if(u===0||u===W-1)return G[1];
  if(r===H-1||(r>=24&&Math.abs(Math.abs(u-9.5)-(r-23)*1.55)<.9))return G[0];const fr=r-7,fc=u-6;if(fr>=0&&fr<10&&fc>=0&&fc<8&&FLEUR[fr][fc]!=='.')return fc<4?G[2]:G[1];
  if(r===3||r===21)return G[1];return (u%4===3)?Tm[2]:(r>18?Tm[2]:Tm[3])};
 ['ban','ban2','ban3'].forEach((k,i)=>{X[k]=newG();const g0=-SH*i,g1=i<2?-SH*(i+1):-TOT,r0=Math.round(-g0/rp),r1=Math.round(-g1/rp),nr=r1-r0;
  pxBox(X[k],-BW/2*s,-(g0-g1)*s,-.25*s,BW*s,(g0-g1)*s,.55*s,(f,u,v)=>{if(f==='T'||f==='D')return f==='T'&&i===0?G[1]:null;const r=r0+(nr-1-v);return px(f==='B'?W-1-u:u,r)},{mat:0,grid:[W,nr,1],ao:false})})}

/* the cannon: bronze barrel with reinforcing rings and a cascabel, plank carriage, spoked wheels with iron tyres */
export function pxCannon(){const G=newG(),BZ=PDP(['#5a3a10','#8a5a1e','#b8822e','#dca84a','#f2cc6a']),k=1/(PXV*VX);
 const wood=(f,u,v)=>((u+v)%5===0?RWD[1]:(f==='T'?RWD[3]:RWD[2])),iron=(f)=>f==='T'?RDS[3]:RDS[1];
 pxScene(()=>{
  for(const sx of[-1,1]){const x=sx*11.8,y=7.4,z=15.7,X0=sx>0?x:x-2.2;
   pxBox(G,X0,y-7,z-3,2.2,14,6,iron,{mat:4,grid:[2,14,6]});pxBox(G,X0,y-3,z-7,2.2,6,14,iron,{mat:4,grid:[2,6,14]});pxBox(G,X0,y-5.5,z-5.5,2.2,11,11,iron,{mat:4,grid:[2,11,11]});
   pxBox(G,X0+(sx>0?-.2:.2),y-5.2,z-5.2,2.6,10.4,10.4,(f,u,v)=>(f==='R'||f==='L')?((u===5||v===5||u===v||u===10-v)?RWD[3]:RWD[1]):RWD[2],{mat:0,grid:[2,11,11]});
   pxBox(G,sx>0?x+2.2:x-3.6,y-1.6,z-1.6,1.4,3.2,3.2,pBev(BZ),{grid:[1,3,3]})}
  pxBox(G,-11,6.4,14.6,22,2,2,iron,{mat:4,grid:[22,2,2]});
  pxBox(G,-4,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});pxBox(G,2,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});
  pxBox(G,-3,2,-14,6,4,17,wood,{mat:0,grid:[6,4,17]});pxBox(G,-2.5,1.5,-14.5,5,3,2,iron,{mat:4,grid:[5,3,2]});
  pxBox(G,-3.6,10,-1,7.2,7.2,28,(f,u,v,W,H)=>{if(f==='F')return (u>=2&&u<=4&&v>=2&&v<=4)?RDS[0]:BZ[3];if(f==='B')return BZ[1];const q=f==='T'||f==='D'?v:u;return f==='T'?BZ[3]:(v===H-1?BZ[3]:BZ[2])},{grid:[7,7,28]});
  for(const[z0,l]of[[-1.5,3.5],[11,1.6],[23.6,3.8]])pxBox(G,-4.4,9.2,z0,8.8,8.8,l,pBev(BZ),{grid:[8,8,2]});
  pxBox(G,-1.6,12,-4,3.2,3.2,3,pBev(BZ),{grid:[3,3,3]});
  for(const[x,z]of[[-17,-2],[-14,-3],[-15.5,.5]])pxBox(G,x,0,z,3,3,3,()=>RDS[0],{mat:4,grid:[3,3,3]});
 });return toGeo(G)}
