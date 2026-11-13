import { fb, hs } from '../core/math.js';
import { TH, TW } from '../gameplay/rules.js';
import { BK, blocksState } from './blocks.js';
import { newG, rgb, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { scene, SHADOWS } from './scene.js';
import { THREE } from './three.js';
import { CH, FLG, HT, LAND, occ, pth, stairs, ter, terrainState } from '../world/terrain-state.js';

/* ================= BLOCK WORLD PROPS (switch `blocksState.on` + `decor`) =================
   Trees, rocks, ore, bushes and stumps are voxels on the world block grid (one block = blocksState.DBLK world units);
   flowers, tufts, mushrooms and reeds are boxes on the pixel grid (16 pixels per block). A chunk collects the voxels of its
   tiles plus a one-tile margin, then draws only the faces that touch air: touching canopies share no hidden or doubled
   face, whatever the chunk a tree stands in. Every choice comes from a hash of the tile or block position (never from
   call order), so both co-op machines and every rebuild draw the same thing. Visual only. */
const PAL=[],PIX=new Map();
const pc=h=>{let i=PIX.get(h);if(i===undefined){i=PAL.length;PAL.push(rgb(h));PIX.set(h,i)}return i};
const LEAF=[['#3f7f2a','#4a8e32','#336f22'],['#46862e','#549638','#3a7626'],['#3a7a34','#468a3e','#2f6a2a']].map(a=>a.map(pc));
const PINE=[['#2f7a4a','#3d8f58','#276a3e'],['#2a6e48','#37835a','#215c3a']].map(a=>a.map(pc));
const BIRL=['#8fb84a','#a2c858','#7ea23e'].map(pc);
const OAKT=['#6b4a2a','#5b3f22'].map(pc),PINT=['#4f3418','#3f2a14'].map(pc),BIRT=pc('#e8e4d8');
const ROCK=[['#9aa1ac','#a9b0bb','#7e8590'],['#868d98','#9ea5b0','#6a717e'],['#a8aeb8','#b8bec8','#8c929e'],['#707784','#868d9a','#5a606c'],['#9c9a92','#adab9f','#7f7d74'],['#8a9098','#9aa0aa','#6f757f']].map(a=>a.map(pc));
const ORE=pc('#8a8a8a');
const FLW=[['#f0f0e8','#e8c020'],['#f0d020','#e8a010'],['#c8282a','#2a2a2a'],['#4a6ad8','#2a3a8a'],['#b060d8','#7a2a9a']].map(a=>a.map(rgb));
const STEM=rgb('#3f7f2a'),BLADE=['#6aae46','#7cbc52','#5a9e3c'].map(rgb),REED=rgb('#94c86a'),REEDH=rgb('#6a9a48'),MSTEM=rgb('#e8e0d0'),MCAP=[rgb('#c8282a'),rgb('#9a6a4a')];
const FK=[1,.9,.8,.86,.77,.55],RING8=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]],PLUS4=[[0,-1],[1,0],[0,1],[-1,0]];

export function buildPropsB(cx,cy){const B=blocksState.DBLK,N=Math.max(1,Math.round(1/B)),p=B/16,x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 const OFF=4*N,W=CH*N+2*OFF,V=new Map(),KEY=(bx,by,bz)=>((bx+OFF)*W+bz+OFF)*512+by;
 /* a trunk, rock or ore block replaces leaves; otherwise the first block set stays */
 const put=(bx,by,bz,kind,ci)=>{const k=KEY(bx,by,bz),o=V.get(k);if(o===undefined||((o&31)===BK.leaves||(o&31)===BK.pine)&&kind!==BK.leaves&&kind!==BK.pine)V.set(k,ci<<5|kind)};
 const G=newG();G.hm=1;
 const quadM=(a,b,c,d,n,col,m)=>{const o=G.P.length/3;G.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(let q=0;q<4;q++){G.N.push(n[0],n[1],n[2]);G.C.push(col[0],col[1],col[2]);G.M.push(m)}G.I.push(o,o+1,o+2,o,o+2,o+3)};
 const sh=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
 /* a box of whole pixels (plants): five faces, no bottom */
 const box=(X0,Y0,Z0,X1,Y1,Z1,c)=>{const m=20+BK.plant;
  quadM([X0,Y1,Z0],[X0,Y1,Z1],[X1,Y1,Z1],[X1,Y1,Z0],[0,1,0],c,m);quadM([X1,Y0,Z0],[X1,Y1,Z0],[X1,Y1,Z1],[X1,Y0,Z1],[1,0,0],sh(c,FK[1]),m);quadM([X0,Y0,Z1],[X0,Y1,Z1],[X0,Y1,Z0],[X0,Y0,Z0],[-1,0,0],sh(c,FK[2]),m);
  quadM([X1,Y0,Z1],[X1,Y1,Z1],[X0,Y1,Z1],[X0,Y0,Z1],[0,0,1],sh(c,FK[3]),m);quadM([X0,Y0,Z0],[X0,Y1,Z0],[X1,Y1,Z0],[X1,Y0,Z0],[0,0,-1],sh(c,FK[4]),m)};
 const lf=(L,bx,by,bz)=>L[(hs(bx+x0*N,bz+y0*N,300+by)*3)|0];
 const tree=(bx,by,bz,x,y,al)=>{const f=fb(x*.045,y*.045,terrainState.SEED+610),r=hs(x,y,7),v=(hs(x,y,4)*6)|0;
  let sp=al>=7||f>.64?2:f<.34?1:0;if(r<.1)sp=(sp+1+((r*30)|0)%2)%3;
  const leaf=(a,b,c,L,kind)=>put(bx+a,by+b,bz+c,kind,lf(L,bx+a,by+b,bz+c)),keep=(a,c,b,t)=>hs(bx+a+x0*N,bz+c+y0*N,400+b)<t;
  if(sp===0){const th=3+(v&1),L=LEAF[v%3];for(let k=0;k<th;k++)put(bx,by+k,bz,BK.bark,OAKT[k&1]);
   for(const[a,c]of RING8){if(!(a&&c)||keep(a,c,1,.55))leaf(a,th-1,c,L,BK.leaves);if(!(a&&c)||keep(a,c,2,.72))leaf(a,th,c,L,BK.leaves)}
   leaf(0,th,0,L,BK.leaves);leaf(0,th+1,0,L,BK.leaves);for(const[a,c]of PLUS4)if(keep(a,c,3,.8))leaf(a,th+1,c,L,BK.leaves);
   if(v===5)for(const[a,c]of PLUS4)if(keep(a,c,4,.6))leaf(a*2,th-1+(keep(a,c,5,.5)?1:0),c*2,L,BK.leaves)}
  else if(sp===1){const th=4+(v&1);for(let k=0;k<th;k++)put(bx,by+k,bz,BK.birch,BIRT);
   for(const[a,c]of PLUS4){leaf(a,th-2,c,BIRL,BK.leaves);leaf(a,th-1,c,BIRL,BK.leaves);if(keep(a,c,3,.5))leaf(a,th,c,BIRL,BK.leaves)}
   for(const[a,c]of RING8)if(a&&c&&keep(a,c,1,.6))leaf(a,th-1,c,BIRL,BK.leaves);leaf(0,th,0,BIRL,BK.leaves);if(v%3)leaf(0,th+1,0,BIRL,BK.leaves)}
  else{const th=5+(v&1),L=PINE[v%2];for(let k=0;k<th;k++)put(bx,by+k,bz,BK.bark,PINT[k&1]);
   for(let k=2;k<th;k++){const wide=(th-k)%2===0;for(const[a,c]of PLUS4)leaf(a,k,c,L,BK.pine);if(wide)for(const[a,c]of RING8)if(a&&c&&keep(a,c,k,.75))leaf(a,k,c,L,BK.pine)}
   leaf(0,th,0,L,BK.pine);if(v>2)leaf(0,th+1,0,L,BK.pine)}};
 for(let y=Math.max(0,y0-1);y<Math.min(TH,y1+1);y++)for(let x=Math.max(0,x0-1);x<Math.min(TW,x1+1);x++){const i=y*TW+x,v=ter[i];if(v===1||v===5)continue;
  const hh=HT[i],al=hh-LAND,by=Math.round(hh/B),ox=(hs(x,y,61)*N)|0,oz=(hs(x,y,62)*N)|0,bx=(x-x0)*N+ox,bz=(y-y0)*N+oz,ax=N>1?(ox+1<N?1:-1):0,az=N>1?(oz+1<N?1:-1):0,inside=x>=x0&&x<x1&&y>=y0&&y<y1;
  if(v===2){tree(bx,by,bz,x,y,al);continue}
  if(v===3){const C=ROCK[(hs(x,y,6)*6)|0],vv=(hs(x,y,65)*4)|0;put(bx,by,bz,BK.rock,C[0]);if(N>1){if(vv>=1)put(bx+ax,by,bz,BK.rock,C[2]);if(vv>=2)put(bx,by+1,bz,BK.rock,C[1]);if(vv===3){put(bx,by,bz+az,BK.rock,C[1]);put(bx+ax,by,bz+az,BK.rock,C[0])}}continue}
  if(v===4){const vv=(hs(x,y,8)*3)|0;put(bx,by,bz,BK.ore,ORE);if(N>1){if(vv>=1)put(bx+ax,by,bz+az,BK.ore,ORE);if(vv===2)put(bx,by+1,bz,BK.ore,ORE)}continue}
  if(v!==0||pth[i]||occ.has(i)||stairs.has(i)||hh<LAND)continue;const q=hs(x,y,201);if(q>.07)continue;
  const wet=ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1,S=16*N,px=x+Math.round((.3+hs(x,y,61)*.4)*S)/S,pz=y+Math.round((.3+hs(x,y,62)*.4)*S)/S;
  if(wet){if(q<.05&&inside)for(let k=0;k<3;k++){const a=px+[0,4,-3][k]*p,c=pz+[0,2,3][k]*p,h2=(18+((hs(x+k,y,66)*10)|0))*p;box(a,hh,c,a+2*p,hh+h2,c+2*p,REED);box(a,hh+h2,c,a+2*p,hh+h2+3*p,c+2*p,REEDH)}continue}
  if(FLG[i]&12||al>=9||FLG[i]&1)continue;
  if(q<.022){if(inside){const C=FLW[(hs(x,y,202)*5)|0];for(let k=0;k<3;k++){const a=px+[0,6,-5][k]*p,c=pz+[0,4,3][k]*p,h2=(5+(k&1)*2)*p;box(a,hh,c,a+p,hh+h2,c+p,STEM);box(a-p,hh+h2,c-p,a+2*p,hh+h2+2*p,c+2*p,C[0]);box(a,hh+h2+2*p,c,a+p,hh+h2+3*p,c+p,C[1])}}}
  else if(q<.04){if(inside)for(let k=0;k<6;k++){const a=px+[0,2,-2,1,-1,3][k]*p,c=pz+[0,2,1,-2,-2,-1][k]*p;box(a,hh,c,a+p,hh+(5+((hs(x+k,y,67)*6)|0))*p,c+p,BLADE[k%3])}}
  else if(q<.056){const L=LEAF[(hs(x,y,204)*3)|0];put(bx,by,bz,BK.leaves,L[0]);if(N>1&&hs(x,y,68)<.3)put(bx+ax,by,bz,BK.leaves,L[1])}
  else if(q<.062){if(inside){box(px,hh,pz,px+2*p,hh+3*p,pz+2*p,MSTEM);box(px-2*p,hh+3*p,pz-2*p,px+4*p,hh+6*p,pz+4*p,MCAP[0]);box(px+6*p,hh,pz+3*p,px+7*p,hh+2*p,pz+4*p,MSTEM);box(px+5*p,hh+2*p,pz+2*p,px+8*p,hh+4*p,pz+5*p,MCAP[1])}}
  else if(q<.066&&fb(x*.03,y*.03,terrainState.SEED+88)>.5){put(bx,by,bz,BK.bark,OAKT[1])}}
 /* faces that touch air, for the blocks of this chunk only */
 const NX=(x1-x0)*N,NZ=(y1-y0)*N;
 for(const[k,val]of V){const by=k%512,r=(k-by)/512,bz=r%W-OFF,bx=(r-(bz+OFF))/W-OFF;if(bx<0||bz<0||bx>=NX||bz>=NZ)continue;
  const kind=val&31,c=PAL[val>>5],m=20+kind,X0=x0+bx*B,X1=X0+B,Y0=by*B,Y1=Y0+B,Z0=y0+bz*B,Z1=Z0+B,lv=kind===BK.leaves||kind===BK.pine;
  if(!V.has(KEY(bx,by+1,bz)))quadM([X0,Y1,Z0],[X0,Y1,Z1],[X1,Y1,Z1],[X1,Y1,Z0],[0,1,0],c,m);
  if(!V.has(KEY(bx+1,by,bz)))quadM([X1,Y0,Z0],[X1,Y1,Z0],[X1,Y1,Z1],[X1,Y0,Z1],[1,0,0],sh(c,FK[1]),m);
  if(!V.has(KEY(bx-1,by,bz)))quadM([X0,Y0,Z1],[X0,Y1,Z1],[X0,Y1,Z0],[X0,Y0,Z0],[-1,0,0],sh(c,FK[2]),m);
  if(!V.has(KEY(bx,by,bz+1)))quadM([X1,Y0,Z1],[X1,Y1,Z1],[X0,Y1,Z1],[X0,Y0,Z1],[0,0,1],sh(c,FK[3]),m);
  if(!V.has(KEY(bx,by,bz-1)))quadM([X0,Y0,Z0],[X0,Y1,Z0],[X1,Y1,Z0],[X1,Y0,Z0],[0,0,-1],sh(c,FK[4]),m);
  if(lv&&!V.has(KEY(bx,by-1,bz)))quadM([X0,Y0,Z0],[X1,Y0,Z0],[X1,Y0,Z1],[X0,Y0,Z1],[0,-1,0],sh(c,FK[5]),m)}
 if(!G.P.length)return null;const mesh=new THREE.Mesh(toGeo(G),matV);mesh.castShadow=SHADOWS;mesh.receiveShadow=SHADOWS;scene.add(mesh);return mesh}
