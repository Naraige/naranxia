import { hex } from '../../core/math.js';
import { geometryState, newG, quad, rgb, shade } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { VX } from './unit-parts.js';
import { THREE } from '../three.js';

/* ================= DUNGEON-HERO STYLE CHARACTERS =================
   A Minecraft character (8px head, 8x12x4 body, 4x12x4 limbs) with a face, hair and bare forearms, wearing simple chunky
   armour pieces built from boxes on the same pixel grid. Clean flat pixel colours (base, light top, dark lip). Boxes are
   collected first, then emitted with ambient occlusion at the corners of every merged quad (rays against the other pieces
   of the same body part), which gives soft contact shadows under brims, pauldrons, belts and plates. Units: pixels. */
export const PXV = 5.5/12;
const PXC = new Map();

const pxRGB=h=>{let c=PXC.get(h);if(!c){c=rgb(h);PXC.set(h,c)}return c};

const PXSH={F:.94,B:.78,R:.88,L:.82,T:1,D:.62};

let PXS=null,PXT=null;

let PXAD;

const PXAR=3.4,PXAK=.6,PXMQ=4;

export function pxBox(Gx,x,y,z,w,h,d,paint,o){o=o||{};const b={Gx,x,y,z,w,h,d,paint,mat:o.mat||0,no:o.no||'',ao:o.ao!==false,only:!!o.only,grid:o.grid||null,m:PXT?PXT.m:null,mi:PXT?PXT.mi:null};if(PXS)PXS.push(b);else pxFlush([b])}

export function pxScene(fn){const sv=PXS;PXS=[];let L;try{fn()}finally{L=PXS;PXS=sv}pxFlush(L)}

export function pxRot(Gx,fn,rot,piv){const T=new THREE.Matrix4().makeTranslation(piv[0],piv[1],piv[2]).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0],rot[1],rot[2]))).multiply(new THREE.Matrix4().makeTranslation(-piv[0],-piv[1],-piv[2]));
 const sv=PXT,m=sv?sv.m.clone().multiply(T):T;PXT={m,mi:m.clone().invert()};try{fn(Gx)}finally{PXT=sv}}

const pxMP=(m,p)=>{if(!m)return p;const e=m.elements;return[e[0]*p[0]+e[4]*p[1]+e[8]*p[2]+e[12],e[1]*p[0]+e[5]*p[1]+e[9]*p[2]+e[13],e[2]*p[0]+e[6]*p[1]+e[10]*p[2]+e[14]]};

const pxMD=(m,p)=>{if(!m)return p;const e=m.elements;return[e[0]*p[0]+e[4]*p[1]+e[8]*p[2],e[1]*p[0]+e[5]*p[1]+e[9]*p[2],e[2]*p[0]+e[6]*p[1]+e[10]*p[2]]};

function pxHit(o,d,b){let O=o,D=d;if(b.mi){O=pxMP(b.mi,o);D=pxMD(b.mi,d)}let t0=1e-4,t1=PXAR;const lo=[b.x,b.y,b.z],hi=[b.x+b.w,b.y+b.h,b.z+b.d];
 for(let a=0;a<3;a++){if(Math.abs(D[a])<1e-9){if(O[a]<lo[a]||O[a]>hi[a])return Infinity;continue}let ta=(lo[a]-O[a])/D[a],tb=(hi[a]-O[a])/D[a];if(ta>tb){const t=ta;ta=tb;tb=t}if(ta>t0)t0=ta;if(tb<t1)t1=tb;if(t0>t1)return Infinity}return t0}

function pxOcc(p,n,L,self){const ax=Math.abs(n[0])<.9?[1,0,0]:[0,1,0],t1=[n[1]*ax[2]-n[2]*ax[1],n[2]*ax[0]-n[0]*ax[2],n[0]*ax[1]-n[1]*ax[0]],l1=Math.hypot(t1[0],t1[1],t1[2]);t1[0]/=l1;t1[1]/=l1;t1[2]/=l1;
 const t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]];let s=0;
 for(const q of PXAD){const d=[t1[0]*q[0]+t2[0]*q[1]+n[0]*q[2],t1[1]*q[0]+t2[1]*q[1]+n[1]*q[2],t1[2]*q[0]+t2[2]*q[1]+n[2]*q[2]];let tm=Infinity;
  for(const b of L){if(b===self)continue;const t=pxHit(p,d,b);if(t<tm)tm=t}if(tm<PXAR)s+=1-tm/PXAR}
 return s/PXAD.length}

function pxFlush(L){const by=new Map();for(const b of L){if(!by.has(b.Gx))by.set(b.Gx,[]);by.get(b.Gx).push(b)}
 for(const[,list]of by){const occ=list.filter(b=>b.ao);for(const b of list)if(!b.only)pxEmit(b,occ)}}

function pxEmit(b,occ){const s=PXV*VX,mo=geometryState.BMAT;geometryState.BMAT=b.mat;
 const W=b.grid?b.grid[0]:Math.max(1,Math.round(b.w)),H=b.grid?b.grid[1]:Math.max(1,Math.round(b.h)),D=b.grid?b.grid[2]:Math.max(1,Math.round(b.d)),sx=b.w/W,sy=b.h/H,sz=b.d/D,x0=b.x,y0=b.y,z0=b.z,x1=x0+b.w,y1=y0+b.h,z1=z0+b.d;
 const F=[['F',[x0,y0,z1],[sx,0,0],[0,sy,0],[0,0,1],W,H],['B',[x1,y0,z0],[-sx,0,0],[0,sy,0],[0,0,-1],W,H],['R',[x1,y0,z1],[0,0,-sz],[0,sy,0],[1,0,0],D,H],
  ['L',[x0,y0,z0],[0,0,sz],[0,sy,0],[-1,0,0],D,H],['T',[x0,y1,z1],[sx,0,0],[0,0,-sz],[0,1,0],W,D],['D',[x0,y0,z0],[sx,0,0],[0,0,sz],[0,-1,0],W,D]];
 try{for(const[f,o,du,dv,n,FW,FH]of F){if(b.no.indexOf(f)>=0)continue;const nW=pxMD(b.m,n),C=new Array(FW*FH);
  for(let v=0;v<FH;v++)for(let u=0;u<FW;u++)C[v*FW+u]=b.paint(f,u,v,FW,FH)||null;
  const dn=new Uint8Array(FW*FH),k0=PXSH[f],ac=new Map();
  const aoAt=(uu,vv)=>{const key=uu*1000+vv;let r=ac.get(key);if(r!==undefined)return r;r=0;if(occ.length>1){
    const p=[o[0]+du[0]*uu+dv[0]*vv+n[0]*.03,o[1]+du[1]*uu+dv[1]*vv+n[1]*.03,o[2]+du[2]*uu+dv[2]*vv+n[2]*.03];r=pxOcc(pxMP(b.m,p),nW,occ,b)}ac.set(key,r);return r};
  for(let v=0;v<FH;v++)for(let u=0;u<FW;u++){const i=v*FW+u,c=C[i];if(dn[i]||!c)continue;let w=1;while(u+w<FW&&w<PXMQ&&!dn[i+w]&&C[i+w]===c)w++;
   let h=1;grow:while(v+h<FH&&h<PXMQ){for(let q=0;q<w;q++){const j=(v+h)*FW+u+q;if(dn[j]||C[j]!==c)break grow}h++}
   for(let a=0;a<h;a++)for(let q=0;q<w;q++)dn[(v+a)*FW+u+q]=1;
   const P=(uu,vv)=>{const p=pxMP(b.m,[o[0]+du[0]*uu+dv[0]*vv,o[1]+du[1]*uu+dv[1]*vv,o[2]+du[2]*uu+dv[2]*vv]);return[p[0]*s,p[1]*s,p[2]*s]},
    ins=.3,col=(uu,vv)=>{const a=aoAt(uu+(uu>u?-ins:ins)*0,vv);return shade(pxRGB(c),k0*(1-PXAK*Math.min(1,a*1.3)))};
   let A=P(u+w,v),B=P(u+w,v+h),Cc=P(u,v+h),Dd=P(u,v),cA=col(u+w,v),cB=col(u+w,v+h),cC=col(u,v+h),cD=col(u,v);
   const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[Cc[0]-B[0],Cc[1]-B[1],Cc[2]-B[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
   if(cr[0]*nW[0]+cr[1]*nW[1]+cr[2]*nW[2]<0){let t=A;A=Dd;Dd=t;t=B;B=Cc;Cc=t;t=cA;cA=cD;cD=t;t=cB;cB=cC;cC=t}
   quad(b.Gx,A,B,Cc,Dd,nW,cA,cB,cC,cD)}}}finally{geometryState.BMAT=mo}}

export function pxCat(Gx,T,pf,nf,flip){const o=Gx.P.length/3,n=T.P.length/3;if(Gx.M)while(Gx.M.length<o)Gx.M.push(0);
 for(let i=0;i<n;i++){const p=[T.P[i*3],T.P[i*3+1],T.P[i*3+2]],q=[T.N[i*3],T.N[i*3+1],T.N[i*3+2]],P2=pf?pf(p):p,N2=nf?nf(q):q;
  Gx.P.push(P2[0],P2[1],P2[2]);Gx.N.push(N2[0],N2[1],N2[2]);Gx.C.push(T.C[i*3],T.C[i*3+1],T.C[i*3+2]);if(Gx.M)Gx.M.push((T.M&&T.M[i])||0)}
 for(let i=0;i<T.I.length;i+=3){if(flip)Gx.I.push(T.I[i]+o,T.I[i+2]+o,T.I[i+1]+o);else Gx.I.push(T.I[i]+o,T.I[i+1]+o,T.I[i+2]+o)}if(T.hm)Gx.hm=1}

export function pxArms(P,fn){const T=newG();pxScene(()=>fn(T));pxCat(P.AG,T);pxCat(P.LA,T,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}

export const shadeHex=(c,k)=>{const h=hex(c);return '#'+h.map(q=>Math.max(0,Math.min(255,Math.round(q*k))).toString(16).padStart(2,'0')).join('')};

/* palettes are written as the colour you see; PD turns them into albedo (the toon light lifts lit faces by about 1.4) */
export const PD=h=>shadeHex(h,.704),PDP=a=>a.map(PD);

export let PXLE;
export let PXDK;

export const teamPal=c=>[shadeHex(c,.42),shadeHex(c,.62),shadeHex(c,.82),c,lighten(c,.28)];

/* clean bevel: light top row, dark bottom lip, flat base; light top face, dark underside */
export const pxN=(f,u,v,s)=>{const x=Math.sin(u*12.9898+v*78.233+f.charCodeAt(0)*37.719+s*11.3)*43758.5453;return x-Math.floor(x)};

export function initializePixelGeometry() {
  PXAD = (()=>{const N=14,r=[];for(let i=0;i<N;i++){const z=Math.sqrt(1-(i+.5)/N),q=Math.sqrt(1-z*z),a=i*2.39996;r.push([q*Math.cos(a),q*Math.sin(a),z])}return r})();
  PXLE = PDP(['#3c220e','#5e381c','#86522c','#a96c3c','#c88a54']);
  PXDK = PD('#15171c');
}
