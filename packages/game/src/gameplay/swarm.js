import { laneFieldQ, LFLD, LFQS, LFQT, LSEG, zombieLanesState } from '../ai/zombie-lanes.js';
import { snd } from '../audio/sound.js';
import { hyp, rnd } from '../core/math.js';
import { ach } from './achievements.js';
import { target } from './combat.js';
import { ALERTS, economyState } from './economy.js';
import { aliveC, LC, playersState } from './players.js';
import { H, RS2, T, TH, TS, TW, W } from './rules.js';
import { sessionState } from './session.js';
import { blood, puff } from '../rendering/effects.js';
import { NAMES } from '../ui/build-catalog.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { D4, D8, FD, gOK } from '../world/routes.js';
import { ensureRect, genChunk } from '../world/terrain.js';
import { CH, genF, HT, NCX, occ, ter, terrainState } from '../world/terrain-state.js';
import { blk, canStepZ, fv, solidAt } from '../world/traversal.js';

export const swarmState = {
  SWARMS: [],
  SWF: 100,
  FZ: null,
};

/* ================= THE SWARM: the wave husks as a light-weight crowd (tens of thousands of zombies) =================
   typed arrays stepped at 20 Hz - path fields + tile density drive the flow - cell lists answer the combat queries */
const SWMAX = 30000;
export const SWDT = .05;
const SWCS = 4;
let SWCW;
let SWCH;
const SWSP = 31;

export const SW={n:0,acc:0,step:0,fxN:0,gacc:[0,0],q:[],
 x:new Float32Array(SWMAX),y:new Float32Array(SWMAX),px:new Float32Array(SWMAX),py:new Float32Array(SWMAX),hp:new Float32Array(SWMAX),cd:new Float32Array(SWMAX),
 ln:new Int8Array(SWMAX),ph:new Uint16Array(SWMAX),ri:new Uint16Array(SWMAX),k:new Uint8Array(SWMAX),ti:new Int32Array(SWMAX),fa:new Float32Array(SWMAX),ta:new Float32Array(SWMAX),mx:new Float32Array(SWMAX),my:new Float32Array(SWMAX),sd:new Uint16Array(SWMAX),id:new Uint32Array(SWMAX),st:new Uint8Array(SWMAX),sa:new Int32Array(SWMAX),sk:new Uint8Array(SWMAX),nid:0};
/* a zombie that cannot go on: every SWCK steps (3.2 s) each zombie is looked at (its turn comes from sd, not from id: nid is not reset between games); one that bites nothing and has not left the 3x3 tiles around the tile noted in sa
   counts one more look in sk. At SWGH looks (32 s) it gives up its path and walks straight at the nearest castle over any ground, as the horde already does
   where a lane has no way through (buildings still stop it, and it bites them): earth works, cliffs and water delay the horde but never keep it out.
   A zombie that still stands SWRM looks later (80 s more) is taken away without gold or a kill. sa and sk are saved with the swarm. */
const SWCK=64,SWGH=10,SWRM=25;

export let SWD;
export let SWH;
export const SWN = new Int32Array(SWMAX);
let UNF;
/* per-lane constants of one step: way points in pixels (flat) and the lane's castle */
const LWX=[],LWY=[],LCA=[];
const TS2=TS*2;
function swLanes(){const RT=terrainState.ROUTES;for(let L=0;L<RT.length;L++){const Wp=RT[L].wps,n=Wp.length;let X=LWX[L],Y=LWY[L];if(!X||X.length!==n){X=LWX[L]=new Float64Array(n);Y=LWY[L]=new Float64Array(n)}
  for(let p=0;p<n;p++){X[p]=Wp[p][0]*TS;Y[p]=Wp[p][1]*TS}LCA[L]=LC(L)}LCA.length=RT.length}
const D9N = [[0,0],[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]];

export const SWP={x:0,y:0,t:1,type:'husk',hp:1,swi:-1,swarm:true};

export function swReset(){SW.n=0;SW.acc=0;SW.step=0;SW.q=[];SW.gacc=[0,0];swarmState.SWARMS=[];SWD.fill(0);SWH.fill(-1);LFLD.clear();LFQT.fill(-1);LFQS.fill(null)}

export function swPending(){let n=0;for(const q of SW.q)n+=q.left;return n}

export function swQueue(L,an,cnt){cnt=Math.round(cnt*(sessionState.waveN<=1?.45:sessionState.waveN===2?.6:sessionState.waveN===3?.75:sessionState.waveN===4?.9:1));if(cnt>0)SW.q.push({ln:L,x:an.p[0],y:an.p[1],ph:an.ph,left:cnt,rate:Math.max(45,cnt/30),hp:5*(1+.04*sessionState.waveN)})}

/* terrain-only passability (buildings ignored): the swarm's way to a walled-in castle goes through the walls */
const tsol=(x,y)=>!gOK(x,y)||ter[y*TW+x]>0;

function blkT(tx,ty,i,j){if(tsol(i,j))return true;const a=ty*TW+tx,b=j*TW+i;if(HT[a]===HT[b])return false;if(i!==tx&&j!==ty)return true;return !canStepZ(a,b)}

export const ringT=c=>{const s=[];for(let j=c.ty-1;j<=c.ty+c.sz;j++)for(let i=c.tx-1;i<=c.tx+c.sz;i++)if(!tsol(i,j)&&!(i>=c.tx&&i<c.tx+c.sz&&j>=c.ty&&j<c.ty+c.sz))s.push([i,j]);return s};

export function bfsT(seeds,x0,y0,w,h){x0=Math.max(0,x0);y0=Math.max(0,y0);w=Math.min(w,TW-x0);h=Math.min(h,TH-y0);ensureRect(x0,y0,w,h);
 const F=new Uint16Array(w*h).fill(65535),Q=new Int32Array(w*h);let hd=0,tl=0;
 for(const[sx,sy]of seeds){if(sx<x0||sy<y0||sx>=x0+w||sy>=y0+h)continue;const k=(sy-y0)*w+sx-x0;if(F[k]===0)continue;F[k]=0;Q[tl++]=k}
 while(hd<tl){const k=Q[hd++],lx=k%w,ly=(k/w)|0,tx=lx+x0,ty=ly+y0,d=F[k]+1,a=ty*TW+tx;
  for(const[dx,dy]of D4){const nx=lx+dx,ny=ly+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx;if(F[n]!==65535)continue;const gx=tx+dx,gy=ty+dy;if(tsol(gx,gy)||!canStepZ(a,gy*TW+gx))continue;F[n]=d;Q[tl++]=n}}
 return{F,x0,y0,w,h}}

/* best downhill neighbour (D8 index) of a path field, cached per field: -1 at a minimum, -2 outside or unreachable */

/* downhill neighbours of a path field as a bit mask (cached per field): each zombie takes the least crowded of them, so a horde spreads into a wide front */
function fmask(S,tx,ty,terr){const lx=tx-S.x0,ly=ty-S.y0;if(lx<0||ly<0||lx>=S.w||ly>=S.h)return -2;let M=S.msk;if(!M)M=S.msk=new Int16Array(S.w*S.h).fill(-3);
 const k=ly*S.w+lx;let m=M[k];if(m!==-3)return m;const v0=S.F[k];if(v0===65535){M[k]=-2;return -2}m=0;const B=terr?blkT:blk;
 for(let q=0;q<8;q++){const dx=D8[q][0],dy=D8[q][1],a=lx+dx,b=ly+dy;if(a<0||b<0||a>=S.w||b>=S.h)continue;const v=S.F[b*S.w+a];if(v>=v0)continue;const X=tx+dx,Y=ty+dy;
  if(dx&&dy?(HT[ty*TW+X]!==HT[ty*TW+tx]||HT[Y*TW+tx]!==HT[ty*TW+tx]||B(tx,ty,X,ty)||B(tx,ty,tx,Y)||B(tx,ty,X,Y)):B(tx,ty,X,Y))continue;m|=1<<q}
 M[k]=m;return m}

const DX8=[1,-1,0,0,1,1,-1,-1],DY8=[0,0,1,-1,1,-1,1,-1];
/* per-zombie constants read from tables (same expressions as before, so the same numbers): aim jitter inside the tile, walking speed */
const SWJ=new Float64Array(256),SWV=new Float64Array(16);
for(let v=0;v<256;v++)SWJ[v]=(v/255-.5)*.62*TS;
for(let v=0;v<16;v++)SWV[v]=SWSP*(v&8?1.08:1)*(.9+(v&7)*.03);

function swPick(S,tx,ty,terr,o){const m=fmask(S,tx,ty,terr);if(m<=0)return m===0?-1:-2;let bq=-1,bs=1e9;const W=S.w,F=S.F,fb=(ty-S.y0)*W+tx-S.x0,sb=ty*TW+tx;
 for(let b=m;b;b&=b-1){const q=31-Math.clz32(b&-b),dx=DX8[q],dy=DY8[q],sc=F[fb+dy*W+dx]*4+SWD[sb+dy*TW+dx]+((o>>q)&1)*1.5;if(sc<bs){bs=sc;bq=q}}
 return bq}

/* value of one path field at a tile (a list of fields goes to the general fv) */
function fv1(S,tx,ty){if(S.list)return fv(S,tx,ty);const lx=tx-S.x0,ly=ty-S.y0;return lx<0||ly<0||lx>=S.w||ly>=S.h?65535:S.F[ly*S.w+lx]}

function swSpawn(){for(let qi=SW.q.length-1;qi>=0;qi--){const q=SW.q[qi];let m=Math.min(q.left,Math.ceil(q.rate*SWDT));q.left-=m;
  while(m-->0&&SW.n<SWMAX){let x=0,y=0,ok=false;for(let t=0;t<4&&!ok;t++){x=(q.x+rnd(-5,5))*TS;y=(q.y+rnd(-5,5))*TS;ok=!solidAt(x,y)}if(!ok)continue;
   const i=SW.n++;SW.x[i]=SW.px[i]=x;SW.y[i]=SW.py[i]=y;const ti=((SW.y[i]/TS)|0)*TW+((SW.x[i]/TS)|0);SW.hp[i]=q.hp;SW.cd[i]=Math.random();SW.ln[i]=q.ln;SW.ph[i]=q.ph;SW.ri[i]=q.ph*3;
   SW.k[i]=Math.random()<.72?0:1;SW.ti[i]=ti;SW.id[i]=++SW.nid;SW.st[i]=0;SW.sa[i]=ti;SW.sk[i]=0;SW.fa[i]=SW.ta[i]=0;SW.sd[i]=(Math.random()*65536)|0;SWD[ti]++}
  if(q.left<=0)SW.q.splice(qi,1)}}

export function swUpdate(dt){if(!SW.n&&!SW.q.length){if(swarmState.SWARMS.length)swarmState.SWARMS=[];SW.acc=0;return}SW.acc+=dt;let g=0;while(SW.acc>=SWDT&&g++<4){SW.acc-=SWDT;swStep()}if(SW.acc>SWDT)SW.acc=SWDT}

function swStep(){if(!SW.sk||!SW.sa){SW.sk=new Uint8Array(SWMAX);SW.sa=new Int32Array(SWMAX)}SW.step++;SW.fxN=0;zombieLanesState.lfBud=Math.max(zombieLanesState.lfBud,2);swSpawn();const sX=SW.x,sY=SW.y,sPX=SW.px,sPY=SW.py,sHP=SW.hp,sCD=SW.cd,sLN=SW.ln,sPH=SW.ph,sST=SW.st,sTA=SW.ta,sSD=SW.sd,sK=SW.k,sMX=SW.mx,sMY=SW.my,sTI=SW.ti,sSA=SW.sa,sSK=SW.sk,stp=SW.step;const n=SW.n,gs=terrainState.gateSolid;terrainState.gateSolid=true;
 /* units the swarm can bite: flag their 3x3 tiles */
 const UM=new Map(),flg=[];for(const u of sessionState.units){if(u.t===1||u.hp<=0||u.gar)continue;const tx=(u.x/TS)|0,ty=(u.y/TS)|0,k=ty*TW+tx;let a=UM.get(k);
  if(!a){UM.set(k,a=[]);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=k+j*TW+i;if(q>=0&&q<TW*TH&&!(UNF[q]&1)){UNF[q]|=1;flg.push(q)}}}a.push(u)}
 const sfl=[];for(const s of sessionState.structs){if(s.t!==0||s.hp<=0||!s.tiles)continue;for(const[a,b]of s.tiles)for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++){const k=(b+j)*TW+a+q;if(k>=0&&k<TW*TH&&!(UNF[k]&2)){UNF[k]|=2;sfl.push(k)}}}
 const hitS=new Set(),R46=(46*TS)**2,ZA=FD[0]&&FD[0].list?FD[0].list:FD[0]?[FD[0]]:[],ZZ=swarmState.FZ&&swarmState.FZ.list?swarmState.FZ.list:swarmState.FZ?[swarmState.FZ]:[];swLanes();
 const AC=aliveC(),CS0=sessionState.CS,hasC=(tx,ty)=>{for(const S of ZA)if(S&&fv1(S,tx,ty)<65535)return true;for(const S of ZZ)if(S&&fv1(S,tx,ty)<65535)return true;return false};
 for(let i=0;i<n;i++){const x=sX[i],y=sY[i],o=sSD[i];sPX[i]=x;sPY[i]=y;if(sHP[i]<=0)continue;sCD[i]-=SWDT;
  const tx=(x/TS)|0,ty=(y/TS)|0,ti=ty*TW+tx,fl=UNF[ti];
  if(((stp+o)&(SWCK-1))===0){const s0=sST[i],a=sSA[i];let k=sSK[i];
   if(s0===1||s0===7||Math.abs(a%TW-tx)>1||Math.abs(((a/TW)|0)-ty)>1){sSA[i]=ti;k=k<SWGH?0:SWGH}else if(k<255)k++;
   sSK[i]=k;if(k>=SWGH+SWRM){sHP[i]=0;sST[i]=9;continue}}
  const gho=sSK[i]>=SWGH;
  if(fl&1){let bu=null,bd=1e9;for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++){const a=UM.get(ti+j*TW+q);if(!a)continue;for(const u of a){const d=hyp(u.x-x,u.y-y)-T[u.type].r;if(d<bd){bd=d;bu=u}}}
   if(bu&&bd<=18){sST[i]=1;sTA[i]=Math.atan2(bu.x-x,bu.y-y);if(sCD[i]<=0){sCD[i]=.9+(sSD[i]&7)*.06;bu.swh=(bu.swh||0)+1;hitS.add(bu)}continue}}
  if(fl&2){let bs=null;for(const[dx,dy]of D9N){const s=occ.get(ti+dy*TW+dx);if(s&&s.t===0&&s.hp>0){bs=s;break}}
   if(bs){sST[i]=7;sTA[i]=Math.atan2(bs.x-x,bs.y-y);if(sCD[i]<=0){sCD[i]=.9+(o&7)*.06;bs.swh=(bs.swh||0)+1;hitS.add(bs)}continue}}
  const L=sLN[i],C=LCA[L]||LC(L),dcx=C.x-x,dcy=C.y-y,dc2=dcx*dcx+dcy*dcy;
  let gx=0,gy=0,has=false,dir=-2,ph=false;
  /* the lane is left for the castle's own path fields 46 tiles from the castle, but only from a tile these fields reach: across a river or below a closed ledge the lane goes on */
  if(sPH[i]!==65535&&(gho||(dc2<=R46&&hasC(tx,ty))))sPH[i]=65535;
  if(sPH[i]!==65535){const Wp=terrainState.ROUTES[L].wps,WX=LWX[L],WY=LWY[L],WL=WX.length;let p=sPH[i];while(p<WL&&Math.abs(WX[p]-x)<TS2&&Math.abs(WY[p]-y)<TS2)p++;
   if(p<Wp.length){let S=laneFieldQ(L,(p/LSEG)|0),v=S?fv1(S,tx,ty):65535;if(S&&v<=3&&S.tg+1>p){p=Math.min(Wp.length,S.tg+1);if(p<Wp.length){S=laneFieldQ(L,(p/LSEG)|0);v=S?fv1(S,tx,ty):65535}}
    /* the way points left in this stretch lie in rock or water (its field ends behind this zombie): over land to the castle when its fields reach this tile, else on to the next stretch */
    else if(S&&v<=3){if(hasC(tx,ty))p=65535;else{p=Math.min(Wp.length,(((p/LSEG)|0)+1)*LSEG);if(p<Wp.length){S=laneFieldQ(L,(p/LSEG)|0);v=S?fv1(S,tx,ty):65535}}}
    sPH[i]=p;
    if(p<Wp.length){sST[i]=2;if(S&&v<65535){dir=swPick(S,tx,ty,false,o);if(dir===-1){const g=Wp[S.tg];gx=g[0]*TS;gy=g[1]*TS;has=true}}else{ph=true;sST[i]=3;const g=Wp[p];gx=g[0]*TS;gy=g[1]*TS;has=true}}}
   else sPH[i]=p}
  if(dir===-2&&!has){let bs=null,bv=65535;if(!gho)for(const S of ZA){const v=S?fv1(S,tx,ty):65535;if(v<bv){bv=v;bs=S}}
   if(bs){dir=swPick(bs,tx,ty,false,o);sST[i]=4}else if(!gho){for(const S of ZZ){const v=S?fv1(S,tx,ty):65535;if(v<bv){bv=v;bs=S}}if(bs){dir=swPick(bs,tx,ty,true,o);sST[i]=5}}
   /* no path: straight at the nearest castle; from a tile of water, rock or wood (reached where a lane had no way through), or once it has given up (gho), over any ground */
   if(dir<0){let hc=CS0,hd=1e12;for(const c of AC){const d=(c.x-x)*(c.x-x)+(c.y-y)*(c.y-y);if(d<hd){hd=d;hc=c}}gx=hc.x;gy=hc.y;if(!bs){sST[i]=6;if(gho||ter[ti]>0)ph=true}}}
  if(dir>=0){gx=(tx+DX8[dir]+.5)*TS+SWJ[o&255];gy=(ty+DY8[dir]+.5)*TS+SWJ[(o>>8)&255]}
  let vx=gx-x,vy=gy-y;const l=hyp(vx,vy);if(l>.5){vx/=l;vy/=l}else{vx=0;vy=0}
  const D0=SWD[ti];let jam=1;if(D0>1&&tx>0&&ty>0&&tx<TW-1&&ty<TH-1){const h0=HT[ti];let dl=D0,dr=D0,du=D0,dd=D0,q=ti-1;if(ter[q]===0&&(HT[q]===h0||canStepZ(ti,q)))dl=SWD[q];q=ti+1;if(ter[q]===0&&(HT[q]===h0||canStepZ(ti,q)))dr=SWD[q];q=ti-TW;if(ter[q]===0&&(HT[q]===h0||canStepZ(ti,q)))du=SWD[q];q=ti+TW;if(ter[q]===0&&(HT[q]===h0||canStepZ(ti,q)))dd=SWD[q];
   const pl=(dl-dr)*.07,pu=(du-dd)*.07;vx+=pl>.6?.6:pl<-.6?-.6:pl;vy+=pu>.6?.6:pu<-.6?-.6:pu;if(D0>6)jam=Math.max(.3,1-(D0-6)*.05)}
  const sp=SWV[(sK[i]?8:0)|(o>>13)]*jam*SWDT;let nx=x+vx*sp,ny=y+vy*sp;
  nx=nx<TS?TS:nx>W-TS?W-TS:nx;ny=ny<TS?TS:ny>H-TS?H-TS:ny;const ntx=(nx/TS)|0,nty=(ny/TS)|0;
  if(ntx!==tx||nty!==ty){const pb=(a,b)=>!!occ.get(b*TW+a),B=ph?(a,b,c,d)=>pb(c,d):blk;
   const bl=ntx!==tx&&nty!==ty?(B(tx,ty,ntx,ty)||B(tx,ty,tx,nty)||B(tx,ty,ntx,nty)):B(tx,ty,ntx,nty);
   if(bl){let s=occ.get(nty*TW+ntx);if((!s||s.t===1)&&ntx!==tx)s=occ.get(ty*TW+ntx);if((!s||s.t===1)&&nty!==ty)s=occ.get(nty*TW+tx);
    if(s&&s.t!==1&&s.hp>0){sST[i]=7;sTA[i]=Math.atan2(s.x-x,s.y-y);if(sCD[i]<=0){sCD[i]=.9+(o&7)*.06;s.swh=(s.swh||0)+1;hitS.add(s)}nx=x;ny=y}
    else{const Dc=SWD[ti],cap=Math.min(6,(Dc>=5?1+((Dc-5)/6|0):0)+(sST[i]===6?2:0));let cm=false;
     if(cap){const cl=(a,b)=>{if(tsol(a,b)||occ.get(b*TW+a))return false;const dh=HT[b*TW+a]-HT[ti];return dh>0?dh<=cap:-dh<=2+cap};
      if(ntx!==tx&&nty!==ty){const ax=Math.abs(nx-x)>=Math.abs(ny-y);if(ax&&cl(ntx,ty)){ny=y;cm=true}else if(cl(tx,nty)){nx=x;cm=true}else if(!ax&&cl(ntx,ty)){ny=y;cm=true}}else cm=cl(ntx,nty)}
     if(!cm){const okx=ntx===tx||!B(tx,ty,ntx,ty),oky=nty===ty||!B(tx,ty,tx,nty);if(ntx!==tx&&nty!==ty){if(okx&&!oky)ny=y;else if(oky&&!okx)nx=x;else if(okx&&oky){if(Math.abs(nx-x)>Math.abs(ny-y))ny=y;else nx=x}else{nx=x;ny=y}}else if(ntx!==tx)nx=x;else ny=y}}}}
  if(nx!==x||ny!==y){sX[i]=nx;sY[i]=ny;nx=sX[i];ny=sY[i];sTA[i]=NaN;sMX[i]=nx-x;sMY[i]=ny-y;const nti=((ny/TS)|0)*TW+((nx/TS)|0);
   if(nti!==ti){SWD[ti]--;SWD[nti]++;sTI[i]=nti;if(ph){const ck=((((ny/TS)|0)/CH)|0)*NCX+((((nx/TS)|0)/CH)|0);if(!genF[ck])genChunk(ck%NCX,(ck/NCX)|0)}}}}
 for(const q of flg)UNF[q]=0;for(const q of sfl)UNF[q]=0;
 /* the bites: capped per target so a pile of zombies cannot melt anything in a blink */
 for(const e of hitS){const hits=e.swh||0;e.swh=0;if(!hits||e.hp<=0)continue;const bs=!(e.type in T);
  const one=3*(e.t===0&&RS2.done.plate?.78:1)*(e.t===0&&RS2.done.mail?.85:1)*(bs?(e.t===0&&RS2.done.bastion?.72:1)*1.6:(e.cb?.8:1));
  e.hp-=Math.min(hits*one,bs?1.6:1.2);if(!bs)e.hurt=.2;
  if(e.t===0&&economyState.alertT<=0){economyState.alertT=8;ALERTS.push({x:e.x,y:e.y,t:5});hudDisplayState.msgS=bs?'Your '+(NAMES[e.type]||'building').toLowerCase()+' is under attack!':'Your units are under attack!';hudDisplayState.msgT=3;snd('alarm')}
  if(SW.fxN<14){SW.fxN++;if(bs)puff(e.x+rnd(-14,14),e.y+rnd(-14,14),'#8a8a90',2,40,{T:.4,z:.8,vz:2,g:8,s:.07});else blood(e.x,e.y,'#7a1a1a')}
  snd(bs?'stone':'zhit',e.x,e.y);if(!bs&&e.hp<=0&&e.t!==1)e.conv=true}
 terrainState.gateSolid=gs;swCompact();swCells();if(SW.step%10===0||!SW.n)swRear()}

function swCompact(){const n=SW.n;let w=0,dead=0;
 for(let i=0;i<n;i++){if(SW.hp[i]>0){if(w!==i){SW.x[w]=SW.x[i];SW.y[w]=SW.y[i];SW.px[w]=SW.px[i];SW.py[w]=SW.py[i];SW.hp[w]=SW.hp[i];SW.cd[w]=SW.cd[i];SW.ln[w]=SW.ln[i];SW.ph[w]=SW.ph[i];SW.ri[w]=SW.ri[i];SW.k[w]=SW.k[i];SW.ti[w]=SW.ti[i];SW.fa[w]=SW.fa[i];SW.ta[w]=SW.ta[i];SW.mx[w]=SW.mx[i];SW.my[w]=SW.my[i];SW.sd[w]=SW.sd[i];SW.id[w]=SW.id[i];SW.st[w]=SW.st[i];SW.sa[w]=SW.sa[i];SW.sk[w]=SW.sk[i]}w++;continue}
  SWD[SW.ti[i]]--;if(SW.st[i]===9)continue;dead++;SW.gacc[sessionState.SITE2&&SW.ln[i]>=3?1:0]+=.06;
  if(SW.fxN<44){SW.fxN++;const x=SW.x[i],y=SW.y[i];puff(x,y,'#efefef',3,26,{T:.6,z:.3,vz:1.3,g:-.6,s:.1});if(SW.fxN<20)puff(x,y,'#b8f040',1,20,{T:1,z:.3,vz:2.2,g:3.4,s:.07})}}
 SW.n=w;
 if(dead){const k0=sessionState.kills;sessionState.kills+=dead;if(k0<1)ach('k1');if(k0<100&&sessionState.kills>=100)ach('k100');if(k0<500&&sessionState.kills>=500)ach('k500');snd('die',SW.x[0]||0,SW.y[0]||0)}
 for(let p=0;p<2;p++)if(SW.gacc[p]>=1){const g=Math.floor(SW.gacc[p]);SW.gacc[p]-=g;playersState.RESP[p].g+=g}}

function swCells(){SWH.fill(-1);for(let i=0;i<SW.n;i++){const c=((SW.y[i]/TS/SWCS)|0)*SWCW+((SW.x[i]/TS/SWCS)|0);SWN[i]=SWH[c];SWH[c]=i}}

/* rear-most route point of each lane's swarm (the red trail starts there) */
function swRear(){const R={};
 for(let i=0;i<SW.n;i++){const L=SW.ln[i],P=terrainState.ROUTES[L].pts;let bi=SW.ri[i],bd=1e18;const x=SW.x[i]/TS,y=SW.y[i]/TS,a0=Math.max(0,bi-10),a1=Math.min(P.length,bi+11);
  for(let q=a0;q<a1;q++){const dx=P[q][0]-x,dy=P[q][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=q}}SW.ri[i]=bi;const o=R[L]||(R[L]={lane:L,n:0,rear:1e9});o.n++;if(bi<o.rear)o.rear=bi}
 for(const q of SW.q){const o=R[q.ln]||(R[q.ln]={lane:q.ln,n:0,rear:1e9});o.n+=q.left;o.rear=Math.min(o.rear,q.ph*3)}
 swarmState.SWARMS=Object.values(R).map(o=>({lane:o.lane,n:o.n,rear:o.rear>=1e9?0:o.rear}))}

export const swarmBackIdx=w=>w.rear;

/* ---- combat queries ---- */
export function swNear(x,y,r){if(!SW.n)return -1;const cs=SWCS*TS,ccx=(x/cs)|0,ccy=(y/cs)|0,RR=Math.ceil(r/cs);let bi=-1,bd=r*r;
 for(let rg=0;rg<=RR;rg++){for(let cy=ccy-rg;cy<=ccy+rg;cy++){if(cy<0||cy>=SWCH)continue;const edge=cy===ccy-rg||cy===ccy+rg;for(let cx=ccx-rg;cx<=ccx+rg;cx+=edge?1:2*rg||1){if(cx<0||cx>=SWCW)continue;
   for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const dx=SW.x[i]-x,dy=SW.y[i]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}}}
  if(bi>=0&&bd<(rg*cs)*(rg*cs))break}
 return bi}

export function swSplash(x,y,r,dmg,cap){if(!SW.n)return 0;const cs=SWCS*TS,c0=Math.max(0,((x-r)/cs)|0),c1=Math.min(SWCW-1,((x+r)/cs)|0),r0=Math.max(0,((y-r)/cs)|0),r1=Math.min(SWCH-1,((y+r)/cs)|0),r2=r*r;let n=0,k=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++)for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const dx=SW.x[i]-x,dy=SW.y[i]-y;if(dx*dx+dy*dy>r2)continue;SW.hp[i]-=dmg;if(SW.hp[i]<=0)k++;if(++n>=cap)return k}
 return k}

export function swLine(x1,y1,x2,y2,w,dmg,cap){if(!SW.n)return 0;const cs=SWCS*TS,c0=Math.max(0,((Math.min(x1,x2)-w)/cs)|0),c1=Math.min(SWCW-1,((Math.max(x1,x2)+w)/cs)|0),r0=Math.max(0,((Math.min(y1,y2)-w)/cs)|0),r1=Math.min(SWCH-1,((Math.max(y1,y2)+w)/cs)|0);
 const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy||1;let n=0,k=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++)for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const px=SW.x[i]-x1,py=SW.y[i]-y1,t=(px*dx+py*dy)/L2;if(t<0||t>1)continue;const qx=px-dx*t,qy=py-dy*t;if(qx*qx+qy*qy>w*w)continue;
  SW.hp[i]-=dmg;if(SW.hp[i]<=0)k++;if(++n>=cap)return k}
 return k}

/* densest 4x4-tile cell within [rmin,rmax] (trebuchet aim) */
export function swDense(x,y,rmin,rmax){if(!SW.n)return -1;const cs=SWCS*TS,c0=Math.max(0,((x-rmax)/cs)|0),c1=Math.min(SWCW-1,((x+rmax)/cs)|0),r0=Math.max(0,((y-rmax)/cs)|0),r1=Math.min(SWCH-1,((y+rmax)/cs)|0);let best=-1,bc=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const mx=(cx+.5)*cs-x,my=(cy+.5)*cs-y,d=hyp(mx,my);if(d<rmin||d>rmax)continue;let c=0,f=-1;for(let i=SWH[cy*SWCW+cx];i>=0&&c<200;i=SWN[i])if(SW.hp[i]>0){c++;if(f<0)f=i}if(c>bc){bc=c;best=f}}
 return best}

/* nearest enemy for a defender: a zombie unit or a swarm member (as a shared proxy object) */
export function targetZ(u,range){const R=target(u,range,1);if(!SW.n)return R;const lim=R[0]?Math.min(range,R[1]):range,i=swNear(u.x,u.y,lim+4);if(i<0)return R;
 const d=hyp(SW.x[i]-u.x,SW.y[i]-u.y)-4;if(R[0]&&d>=R[1])return R;SWP.x=SW.x[i];SWP.y=SW.y[i];SWP.swi=i;return[SWP,d]}

export function initializeSwarm() {
  SWCW = Math.ceil(TW/SWCS);
  SWCH = Math.ceil(TH/SWCS);
  SWD = new Uint16Array(TW*TH);
  SWH = new Int32Array(SWCW*SWCH).fill(-1);
  UNF = new Uint8Array(TW*TH);
}
