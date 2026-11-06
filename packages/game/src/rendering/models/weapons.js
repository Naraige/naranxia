import { newG, toGeo } from '../geometry.js';
import { PD, PDP, pxBox, pxN, pxRot, pxScene, shadeHex, teamPal } from './pixel-geometry.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ================= GEAR: Naranxia arms, in the Blockbench item manner =================
   our own designs (steel, leather, wood, team colours, a little brass) built the Blockbench way: chunky bevelled 3D parts
   for hilts, sockets, bosses and rims, flat 2D pixel parts with finer pixels for blades and painted faces, wrapped grips
   with bands; built on the item grid then scaled down like items in a Minecraft hand.
   tool space: x = thickness, y = width, z = length; grip at the origin */
let RGO;
let RRU;
let RSV;
export let RDS;
let RLE;
export let RWD;

/* bevelled part: bright top row and left column, dark lip below; works for any palette */
export const pBev=P=>(f,u,v,W,H)=>{if(f==='T')return (u===0||v===0)&&W>2?P[4]:P[3];if(f==='D')return P[0];if(H>=2&&v===H-1)return P[4];if(H>=3&&v===0)return P[1];return (u===0&&W>=3)?P[3]:P[2]};

let pGo;

const pGem=P=>(f,u,v,W,H)=>{if(f==='D')return P[0];if(W>=3&&H>=3){if(u===0||v===0||u===W-1||v===H-1)return P[1];return (u===1&&v===H-2)?P[3]:P[2]}return (u===0&&v===H-1)?P[3]:((u===W-1||v===0)?P[0]:P[1])};

const pWrap=P=>(f,u,v,W,H)=>{if(f==='T'||f==='D')return P[2];const q=(f==='F'||f==='B')?v:u;return (q+v)%2?P[1]:P[3]};

const gx=(G,x,y,z,w,h,d,p,o)=>pxBox(G,x,y,z,w,h,d,p,Object.assign({mat:4},o||{}));

const gem=(G,x,y,z,w,h,d,P)=>gx(G,x,y,z,w,h,d,pGem(P||RRU),{mat:5,grid:[Math.max(2,Math.round(w*2)),Math.max(2,Math.round(h*2)),Math.max(2,Math.round(d*2))]});

const GSC=.72,gScale=(geo,k)=>{geo.scale(k,k,k);return geo};

const teamGem=()=>{const T=teamPal(thp());return[T[0],T[2],T[3],T[4]]};

/* flat pixel sprite from a colour function on a W x H grid of cells of size ps (v = 0 is the bottom row) */
export function pxSpriteF(G,W,H,col,o){const ps=o.ps||1,d=o.d||1,mat=o.mat===undefined?4:o.mat;
 for(let v=0;v<H;v++){let u=0;while(u<W){const c=col(u,v);if(!c){u++;continue}let e=u;while(e<W&&col(e,v)===c)e++;
   if(o.plane==='yz')pxBox(G,-d/2+(o.x||0),o.y+v*ps,o.z+u*ps,d,ps,(e-u)*ps,(f)=>f==='R'||f==='L'?c:shadeHex(c,f==='T'?.96:.8),{mat,ao:false,grid:[1,1,1]});
   else pxBox(G,o.x+u*ps,o.y+v*ps,-d/2+(o.z||0),(e-u)*ps,ps,d,(f)=>f==='F'?c:(f==='B'?(o.back||c):shadeHex(c,f==='T'?.96:.8)),{mat,ao:false,grid:[1,1,1]});
   u=e}}}

/* ---------------- knight's arming sword ----------------
   flat steel blade in fine pixels (bright edge, fuller, a few glints, stepped point), a straight steel cross-guard with
   blocky flared ends, a brown leather grip with a steel band, a steel wheel pommel with a team-coloured stone */
export function pxSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,52,9,(u,v)=>{const L=52,hw=u<L-9?4:Math.max(0,4-(u-(L-9))*.5),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-10)return S[0];const n=pxN('F',u>>1,v,5);if(n>.9)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.2,ps:.5,d:1.2});
  gx(G,-.85,-1.7,2.2,1.7,3.4,1.3,pBev(RSV));
  gx(G,-.95,-4.6,1,1.9,9.2,1.4,pBev(RSV));gx(G,-1.15,-5.9,.7,2.3,1.7,2,pBev(RSV));gx(G,-1.15,4.2,.7,2.3,1.7,2,pBev(RSV));
  gx(G,-.75,-.75,-5.2,1.5,1.5,6.2,pWrap(RLE),{mat:0});gx(G,-.95,-.95,-2.6,1.9,1.9,.8,pBev(RSV));
  gx(G,-.85,-1.7,-7.6,1.7,3.4,2.4,pBev(RSV));gem(G,.85,-.6,-7,.35,1.2,1.2,teamGem());gem(G,-1.2,-.6,-7,.35,1.2,1.2,teamGem());
 });return gScale(toGeo(G),.9)}

/* ---------------- shields: the Minecraft shield ----------------
   built like the Minecraft shield (reference: "Minecraft Shield" by bugbilly, CC BY 4.0): a 12 x 22 plate one pixel thick,
   five vertical planks two pixels wide (light left pixel, dark right pixel, lighter end grain on top), an iron rim one pixel
   wide standing a little proud of the wood, eight rivets in two columns with a shadow pixel under each (small raised studs
   on the front), the same planks and rivets on the back, and an iron bracket handle with a leather-wrapped grip.
   Our heraldry is painted on the front planks, so the plank lines still show through the paint. */
let SHW;
let SHI;
let SHG;
let SHK;

const SH_RIV=[[2,3],[9,3],[2,8],[9,8],[2,13],[9,13],[2,18],[9,18]];

function pxMcShield(art,pal,AL){const G=newG(),IR=AL>=2?SHG:SHI;
 const riv=(u,r)=>{for(const q of SH_RIV)if(q[0]===u&&q[1]===r)return true;return false};
 const wood=(u,r,f)=>{const x=u-1,lf=(x&1)===0,n=pxN('W',x,Math.floor((r+x*3)/3),7),k=pxN(f,u,r,9);
  if(r===1)return lf?SHW[4]:SHW[3];if(r===20)return lf?SHW[2]:SHW[1];
  if(lf)return n>.8?SHW[4]:(k<.06?SHW[2]:SHW[3]);return n<.15?SHW[1]:(k>.95?SHW[3]:SHW[2])};
 const chAt=(u,r,front)=>front&&art?((art[r-1]||'')[u-1]||'.'):'.';
 const isField=c=>c==='.'||c==='T'||c==='R';
 const base=(u,r,f,front)=>{const c=chAt(u,r,front);if(c!=='.'&&pal[c]){const lf=((u-1)&1)===0;return r===1?pal[c][0]:(lf?pal[c][0]:pal[c][1])}return wood(u,r,f)};
 /* u 1..10 across, r 1..20 down; the rivet, its shadow below and a darker pixel to its right */
 const face=(u,r,f,front)=>{const c=chAt(u,r,front),b=base(u,r,f,front);if(!isField(c))return b;
  if(riv(u,r))return front?SHI[3]:SHI[2];if(riv(u,r-1)&&isField(chAt(u,r-1,front)))return shadeHex(b,.62);if(riv(u-1,r)&&isField(chAt(u-1,r,front)))return shadeHex(b,.84);return b};
 const rim=side=>(f,u,v,W,H)=>{if(f==='T')return IR[3];if(f==='D')return IR[0];
  if(f==='F'||f==='B'){if(side==='t')return (u===0||u===W-1)?IR[4]:IR[3];if(side==='b')return (u===0||u===W-1)?IR[2]:IR[1];return IR[2]}
  return IR[2]};
 pxScene(()=>{
  /* planks: front painted, back bare */
  gx(G,-5,-10,-.5,10,20,1,(f,u,v,W,H)=>face(u+1,20-v,f,f==='F'),{mat:0,grid:[10,20,1],no:'RLTD'});
  /* iron rim, a little thicker than the wood */
  gx(G,-6,10,-.65,12,1,1.3,rim('t'),{grid:[12,1,1]});gx(G,-6,-11,-.65,12,1,1.3,rim('b'),{grid:[12,1,1]});
  gx(G,-6,-10,-.65,1,20,1.3,rim('l'),{grid:[1,20,1]});gx(G,5,-10,-.65,1,20,1.3,rim('r'),{grid:[1,20,1]});
  /* raised rivet studs on the front (only where the paint is field or bare wood) */
  for(const[u,r]of SH_RIV){if(!isField(chAt(u,r,true)))continue;const x=-6+u+.5,y=11-r-.5;
   gx(G,x-.32,y-.32,.5,.64,.64,.24,(f)=>f==='T'?SHI[4]:(f==='D'?SHI[1]:(f==='F'?SHI[3]:SHI[2])),{grid:[1,1,1]})}
  /* bracket handle: two iron arms out of the back and a grip bar wrapped in leather */
  const pK=(f,u,v,W,H)=>f==='T'?SHK[3]:(f==='D'?SHK[0]:(v===H-1?SHK[3]:SHK[2]));
  gx(G,-2,2,-5.2,4,1.4,4.7,pK,{grid:[4,1,4]});gx(G,-2,-3.4,-5.2,4,1.4,4.7,pK,{grid:[4,1,4]});
  gx(G,-2,-3.4,-6.6,4,6.8,1.4,pK,{grid:[4,6,1]});gx(G,-2.15,-1.7,-6.75,4.3,3.4,1.7,pWrap(RLE),{mat:0,grid:[4,4,2]});
 });return G}

/* heraldry, 10 x 20 inside the rim (top row first); '.' leaves the wood bare, T is the team colour, H its light edge */
const ART_KNIGHT_A=['....TT....','....TT....','....TT....','....TT....','HHHHHHHHHH','TTTTTTTTTT','....TT....','....TT....','....TT....','....TT....',
 '....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....'];

const ART_KNIGHT_B=['TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','CCCCCCCCCC','cccccccccc','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT',
 'TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT'];

const ART_CROWN=['TTTTTTTTTT','TTTTTTTTTT','TgTTggTTgT','TggTggTggT','TggggggggT','TgrgrrgrgT','TkkkkkkkkT','TTTTTTTTTT'];

let ART_GUARD_A;

let ART_GUARD_B;

/* royal guard arms, like its tabard: a red pale between team flanks with a gold crown on top, the gold sun below and a gold base */
const ART_GUARD_R1=['TTRRRRRRTT','TTgRggRgTT','TTggggggTT','TTgrggrgTT','TTkkkkkkTT','TTRRRRRRTT','TTRRRRRRTT','TTRRRRRRTT','TTRRggRRTT','TTRgGGgRTT',
 'TTgGYYGgTT','TTgGYYGgTT','TTRgGGgRTT','TTRRggRRTT','TTRRRRRRTT','TTRRRRRRTT','TTRRRRRRTT','TTkkkkkkTT','TTggggggTT','TTRRRRRRTT'];

/* royal guard arms, chief: the crown on a team chief over a gold line, the gold sun on red below */
const ART_GUARD_R2=['TTTTTTTTTT','TgTTggTTgT','TggTggTggT','TggggggggT','TgrgrrgrgT','TkkkkkkkkT','TTTTTTTTTT','YYYYYYYYYY','RRRRRRRRRR','RRRRRRRRRR',
 'RRRRRRRRRR','RRRRggRRRR','RRRgGGgRRR','RRgGYYGgRR','RRgGYYGgRR','RRRgGGgRRR','RRRRggRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR'];

/* royal guard arms, quartered team and red with a small crown and the gold sun on the crossing */
const ART_GUARD_R3=['TTTTTRRRRR','TTgTggRgRR','TTggggggRR','TTkkkkkkRR','TTTTTRRRRR','TTTTTRRRRR','TTTTTRRRRR','TTTTggRRRR','TTTgGGgRRR','TTgGYYGgRR',
 'RRgGYYGgTT','RRRgGGgTTT','RRRRggTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT'];

const shPal=()=>{const T=teamPal(thp());return{T:[T[2],shadeHex(T[2],.84)],H:[T[3],T[2]],c:PDP(['#ece6d4','#d2cab3']),C:PDP(['#fbf7ec','#ece6d4']),
 g:PDP(['#e8ba4c','#c9962e']),G:PDP(['#f6d27a','#e8ba4c']),k:PDP(['#a87818','#8e6412']),r:PDP(['#d42a36','#a81c26']),Y:PDP(['#fff0b8','#f6d27a']),
 R:PDP(['#b42c38','#98222d'])}};

/* variants: default = full banner field (knight: pale cross; royal guard: red pale with crown and sun) */
export function pxShield(AL,vr){const art=vr==='0'?null:(vr==='A'?ART_KNIGHT_A:ART_KNIGHT_B);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.95)}

export function pxGuardShield(AL,vr){const art=vr==='0'?null:(({A:ART_GUARD_A,B:ART_GUARD_B,R2:ART_GUARD_R2,R3:ART_GUARD_R3})[vr]||ART_GUARD_R1);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.98)}

/* ---------------- halberd ----------------
   a Blockbench voxel weapon: every pixel is a cube one shaft-thickness wide. A spear point with two lugs, a crescent axe
   with a hollow and two horns, a back hook, a deep steel socket block, a brass collar with a small team tassel, a banded
   wooden shaft, a wrapped leather grip and a steel foot. Rows are drawn top first, the shaft is column 6. */
const pInPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};

const HALB=[
 '.......L.......','.......L.......','.......L.......','.......L.......','......LMD......','......LMD......','....L.L.D......','...LM..K.......',
 '..LMM..w.......','..LMD..W.......','.LMMD..w.......','.LMD...W.......','LMMDDD.S.DMM...','LMMD.D.S....ML.','LMD....S.....L.','LMD....S.....L.',
 'LMMD.D.S.......','LMMDDD.S.......','.LMD...W.......','.LMMD..G.......','..LMD..wY......','..LMM..WT......','...LM..wT......','....L..WT......'];

export function pxHalberd(){const G=newG(),V=1.4,Tm=teamPal(thp()),N=52,G0=37,
 SV=PDP(['#3c4655','#576579','#8796a8','#b4c1cf','#dce4ec']),
 C={L:PD('#bfcad6'),M:PD('#8796a8'),D:PD('#56637a'),K:PD('#2d343f'),W:PD('#6e4b32'),w:PD('#533724'),V:PD('#7d5a3e'),Y:PD('#e0b040'),T:Tm[2],B:PD('#3d2716'),b:PD('#5a3a22')};
 const rows=[];
 for(let r=0;r<N;r++){if(r<HALB.length){rows.push(HALB[r]);continue}
  let ch=(r>=34&&r<=40)?(r%2?'B':'b'):(['W','w','V'][Math.floor(pxN('P',r,0,4)*3)]);if(r===49)ch='K';if(r>=50)ch=r===50?'M':'D';
  rows.push('.......'+ch+'.......')}
 const zc=r=>(G0-r)*V;
 pxScene(()=>{
  pxSpriteF(G,N,15,(u,v)=>{const ch=rows[N-1-u][v];return (ch==='.'||ch==='S'||ch==='G')?null:C[ch]},{plane:'yz',x:0,y:-7.5*V,z:zc(N-1)-V/2,ps:V,d:V});
  gx(G,-V,-1.5*V,zc(17)-V/2,2*V,3*V,6*V,pBev(SV),{grid:[2,3,6]});
  gx(G,-V,-V,zc(19)-V/2,2*V,2*V,V,pGo,{grid:[2,2,1]});
 });return gScale(toGeo(G),1.0)}

let RST;
const pGrip = (f,u,v)=>{const Tm=teamPal(thp()),q=(f==='T'||f==='D')?v:u;return q%2?Tm[1]:Tm[3]};

/* ---------------- bow ----------------
   recurve limbs made of three straight wooden segments each (3D, rotated), brass rings at the joints, a leather grip with
   a team band and an arrow rest, steel nocks with flat (2D) brass horn tips, flat brass leaf plates on the belly, the string */
export function pxBow(){const G=newG(),Wd=RWD,Tm=teamPal(thp());
 const seg=(y0,z0,y1,z1,t,w,P)=>{const L=Math.hypot(y1-y0,z1-z0),cy=(y0+y1)/2,cz=(z0+z1)/2,a=Math.atan2(-(y1-y0),z1-z0);
  pxRot(G,T=>gx(T,-t/2,cy-w/2,cz-L/2-.15,t,w,L+.3,(f,u,v,W,H)=>f==='T'?P[4]:(f==='D'?P[1]:(v===H-1?P[3]:P[2])),{mat:0}),[a,0,0],[0,cy,cz])};
 pxScene(()=>{
  for(const sg of[-1,1]){const pts=[[0,2.4],[1.4,8.6],[3.9,14.2],[3.1,18]].map(([y,z])=>[y,z*sg]);
   seg(pts[0][0],pts[0][1],pts[1][0],pts[1][1],1.5,2,Wd);seg(pts[1][0],pts[1][1],pts[2][0],pts[2][1],1.4,1.8,Wd);seg(pts[2][0],pts[2][1],pts[3][0],pts[3][1],1.3,1.6,Wd);
   for(const k of[1,2]){const[y,z]=pts[k];gx(G,-.95,y-1.1,z-.55,1.9,2.2,1.1,pGo)}
   const[ty,tz]=pts[3];gx(G,-.8,ty-.8,tz-(sg>0?.2:1.2),1.6,1.6,1.4,pBev(RSV));
   pxSpriteF(G,4,5,(u,v)=>{const ok=sg>0?(u<=v&&u>=v-1):(3-u<=v&&3-u>=v-1);return ok?(v>2?RGO[4]:RGO[2]):null},{plane:'yz',x:0,y:ty+.6,z:sg>0?tz-.4:tz-1.6,ps:.5,d:.7});
   pxSpriteF(G,7,3,(u,v)=>{const m=Math.abs(u-3);return (v===1&&m<=3)||(v!==1&&m<=1)?(v===2?RGO[4]:RGO[2]):null},{plane:'yz',x:0,y:-1.9,z:sg>0?3.4:-6.9,ps:.5,d:.6});}
  gx(G,-1.05,-1.25,-2.6,2.1,2.5,5.2,pWrap(RLE),{mat:0});gx(G,-1.15,-1.35,-.45,2.3,2.7,.9,(f,u,v,W,H)=>f==='T'?Tm[4]:(v===H-1?Tm[3]:Tm[2]),{mat:0});
  gx(G,-.5,1.25,-.6,1,.8,1.2,pBev(RSV));
  gx(G,-.15,3.15,-18.2,.3,.3,36.4,()=>PD('#efe9d6'),{mat:0,ao:false});
 });return gScale(toGeo(G),.95)}

/* ---------------- gear: the king's sword, the captain's sword, the captain's shield ---------------- */
export function pxRoyalSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,60,9,(u,v)=>{const L=60,hw=u<L-10?4:Math.max(0,4-(u-(L-10))*.45),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-12)return u%7===3?RGO[3]:S[0];const n=pxN('K',u>>1,v,5);if(n>.9)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.4,ps:.5,d:1.2});
  gx(G,-.85,-1.6,2.6,1.7,3.2,1.2,pGo);
  gx(G,-.95,-5.2,1.6,1.9,10.4,1.6,pGo);gx(G,-1.1,-6.7,.5,2.2,1.9,2.6,pGo);gx(G,-1.1,4.8,.5,2.2,1.9,2.6,pGo);
  gem(G,.9,-.7,1.7,.4,1.4,1.4,RRU);gem(G,-1.3,-.7,1.7,.4,1.4,1.4,RRU);
  gx(G,-.75,-.75,-5.6,1.5,1.5,6.6,pWrap(RRU),{mat:0});gx(G,-.95,-.95,-3,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.3,1.9,1.9,.7,pGo);
  gx(G,-1.1,-1.6,-8.2,2.2,3.2,2.6,pGo);gem(G,1.1,-.6,-7.6,.35,1.2,1.2,RRU);gem(G,-1.45,-.6,-7.6,.35,1.2,1.2,RRU);
 });return gScale(toGeo(G),.92)}

export function pxCapSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,58,9,(u,v)=>{const L=58,hw=u<L-9?4:Math.max(0,4-(u-(L-9))*.5),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-11)return S[0];const n=pxN('Q',u>>1,v,7);if(n>.92)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.3,ps:.5,d:1.2});
  gx(G,-.85,-1.7,2.3,1.7,3.4,1.3,pBev(RSV));
  gx(G,-.95,-5.4,1.1,1.9,10.8,1.4,pBev(RSV));gx(G,-1.15,-6.8,.6,2.3,1.8,2.2,pGo);gx(G,-1.15,5,.6,2.3,1.8,2.2,pGo);
  gx(G,-.75,-.75,-5.8,1.5,1.5,6.8,pWrap(RLE),{mat:0});gx(G,-.95,-.95,-2.8,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.4,1.9,1.9,.7,pGo);
  gx(G,-.95,-1.8,-8.4,1.9,3.6,2.6,pGo);gem(G,.95,-.6,-7.8,.35,1.2,1.2,teamGem());gem(G,-1.3,-.6,-7.8,.35,1.2,1.2,teamGem());
 });return gScale(toGeo(G),.9)}

/* captain's arms: a team chief with the gold sun, a gold chevron, red below */
const ART_CAPTAIN=['TTTTTTTTTT','TTTTggTTTT','TTTgGGgTTT','TTgGYYGgTT','TTTgGGgTTT','TTTTggTTTT','TTTTTTTTTT',
 'TTTTGGTTTT','TTTGggGTTT','TTGgRRgGTT','TGgRRRRgGT','GgRRRRRRgG','gRRRRRRRRg','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR'];

export function pxCaptainShield(AL,vr){return gScale(toGeo(pxMcShield(vr==='0'?null:ART_CAPTAIN,shPal(),AL)),.95)}

export function initializeWeapons() {
  RGO = PDP(['#7a4a10','#b07a22','#d9a83a','#f2cc66','#fff0b0']);
  RRU = PDP(['#7a1018','#c8202e','#ff6a70','#ffc0c8']);
  RSV = PDP(['#5d6674','#8a94a3','#b9c1cc','#dde2e8','#f7f9fb']);
  RDS = PDP(['#2c3038','#454b55','#626a76','#858d99','#a9b0ba']);
  RLE = PDP(['#2e1c0e','#4a2e16','#6b4423','#8a5a32','#a87244']);
  RWD = PDP(['#3a2414','#57361e','#74492a','#8f5e36','#a8743f']);
  pGo = pBev(RGO);
  SHW = PDP(['#463724','#5b4a33','#705c41','#87704f','#9b835e']);
  SHI = PDP(['#3a3f47','#596069','#7f8792','#a3aab4','#c8ced6']);
  SHG = PDP(['#6e4a0e','#a8741e','#d7a83c','#f6d27a','#fff0b8']);
  SHK = PDP(['#262a31','#363c46','#4c5560','#66707c']);
  ART_GUARD_A = ART_CROWN.concat(['TTTTTTTTTT','YYYYYYYYYY','..........','..........','..........','..........','..........','..........','..........','..........','..........','..........']);
  ART_GUARD_B = ART_CROWN.concat(['TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','YYYYYYYYYY','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT']);
  RST = RSV;
}
