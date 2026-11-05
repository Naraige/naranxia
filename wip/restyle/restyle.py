import sys
def R(s,a,b,cnt=1):
    n=s.count(a);assert n==cnt,(a[:120],n);return s.replace(a,b)
src=sys.argv[1];dst=sys.argv[2]
g=open(src).read()
LIB=r'''
/* ================= DUNGEON-HERO STYLE CHARACTERS =================
   A Minecraft character (8px head, 8x12x4 body, 4x12x4 limbs) with a face, hair and bare forearms, wearing simple chunky
   armour pieces built from boxes on the same pixel grid. Clean flat pixel colours (base, light top, dark lip). Boxes are
   collected first, then emitted with ambient occlusion at the corners of every merged quad (rays against the other pieces
   of the same body part), which gives soft contact shadows under brims, pauldrons, belts and plates. Units: pixels. */
const PXV=5.5/12,PXC=new Map();
const pxRGB=h=>{let c=PXC.get(h);if(!c){c=rgb(h);PXC.set(h,c)}return c};
const PXSH={F:.94,B:.78,R:.88,L:.82,T:1,D:.62};
let PXS=null,PXT=null;
const PXAD=(()=>{const N=14,r=[];for(let i=0;i<N;i++){const z=Math.sqrt(1-(i+.5)/N),q=Math.sqrt(1-z*z),a=i*2.39996;r.push([q*Math.cos(a),q*Math.sin(a),z])}return r})();
const PXAR=3.4,PXAK=.6,PXMQ=4;
function pxBox(Gx,x,y,z,w,h,d,paint,o){o=o||{};const b={Gx,x,y,z,w,h,d,paint,mat:o.mat||0,no:o.no||'',ao:o.ao!==false,only:!!o.only,grid:o.grid||null,m:PXT?PXT.m:null,mi:PXT?PXT.mi:null};if(PXS)PXS.push(b);else pxFlush([b])}
function pxScene(fn){const sv=PXS;PXS=[];let L;try{fn()}finally{L=PXS;PXS=sv}pxFlush(L)}
function pxRot(Gx,fn,rot,piv){const T=new THREE.Matrix4().makeTranslation(piv[0],piv[1],piv[2]).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0],rot[1],rot[2]))).multiply(new THREE.Matrix4().makeTranslation(-piv[0],-piv[1],-piv[2]));
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
function pxEmit(b,occ){const s=PXV*VX,mo=BMAT;BMAT=b.mat;
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
   quad(b.Gx,A,B,Cc,Dd,nW,cA,cB,cC,cD)}}}finally{BMAT=mo}}
function pxCat(Gx,T,pf,nf,flip){const o=Gx.P.length/3,n=T.P.length/3;if(Gx.M)while(Gx.M.length<o)Gx.M.push(0);
 for(let i=0;i<n;i++){const p=[T.P[i*3],T.P[i*3+1],T.P[i*3+2]],q=[T.N[i*3],T.N[i*3+1],T.N[i*3+2]],P2=pf?pf(p):p,N2=nf?nf(q):q;
  Gx.P.push(P2[0],P2[1],P2[2]);Gx.N.push(N2[0],N2[1],N2[2]);Gx.C.push(T.C[i*3],T.C[i*3+1],T.C[i*3+2]);if(Gx.M)Gx.M.push((T.M&&T.M[i])||0)}
 for(let i=0;i<T.I.length;i+=3){if(flip)Gx.I.push(T.I[i]+o,T.I[i+2]+o,T.I[i+1]+o);else Gx.I.push(T.I[i]+o,T.I[i+1]+o,T.I[i+2]+o)}if(T.hm)Gx.hm=1}
function pxArms(P,fn){const T=newG();pxScene(()=>fn(T));pxCat(P.AG,T);pxCat(P.LA,T,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}
const shadeHex=(c,k)=>{const h=hex(c);return '#'+h.map(q=>Math.max(0,Math.min(255,Math.round(q*k))).toString(16).padStart(2,'0')).join('')};
/* palettes are written as the colour you see; PD turns them into albedo (the toon light lifts lit faces by about 1.4) */
const PD=h=>shadeHex(h,.704),PDP=a=>a.map(PD);
const PXST=PDP(['#3f4651','#6b7380','#99a0aa','#c4c9d0','#e6e9ed']),PXGO=PDP(['#7d5410','#b8861c','#ecbd3a','#ffdc6e','#fff2bc']),
 PXLE=PDP(['#3c220e','#5e381c','#86522c','#a96c3c','#c88a54']),PXDK=PD('#15171c');
const teamPal=c=>[shadeHex(c,.42),shadeHex(c,.62),shadeHex(c,.82),c,lighten(c,.28)];
/* clean bevel: light top row, dark bottom lip, flat base; light top face, dark underside */
const pBv=(P,o)=>{o=o||{};return(f,u,v,W,H)=>{if(f==='T')return o.top||P[3];if(f==='D')return P[1];if(H>=2&&v===H-1)return P[3];if(H>=3&&v===0)return o.lip||P[1];return P[2]}};
const pFl=c=>()=>c;
/* a ring of plate (or cloth) around a limb: bright top row, dark lip, a few worn pixels */
const pRing=(P,o)=>{o=o||{};return(f,u,v,W,H)=>{if(f==='T')return P[3];if(f==='D')return P[0];if(v===H-1)return o.hi?P[4]:P[3];if(H>=2&&v===0)return P[1];
 if(o.ln){if(o.ln.indexOf(v)>=0)return P[1];if(o.ln.indexOf(v-1)>=0)return P[3]}if(o.fr&&f==='F'&&(u===Math.floor(W/2)))return P[3];if(o.fg&&f==='F'&&v<=1)return u%2?P[1]:P[3];
 if(o.n!==false){const n=pxN(f,u,v,o.s||0);if(n<.13)return P[1];if(n>.91)return P[3]}return P[2]}};
const pxN=(f,u,v,s)=>{const x=Math.sin(u*12.9898+v*78.233+f.charCodeAt(0)*37.719+s*11.3)*43758.5453;return x-Math.floor(x)};
/* rings stacked down a limb (4px limb centred on x=z=0): each [y0, height, inflate, palette, options] */
function pxRings(T,L){for(const r of L){const[y0,h,inf,Pl,o]=r;pxBox(T,-2-inf,y0,-2-inf,4+2*inf,h,4+2*inf,pRing(Pl,o),{mat:o&&o.mat!==undefined?o.mat:4})}}
const PXWR=PDP(['#6e6250','#948670','#b8a98e','#d4c6aa','#e6dcc4']);
/* ---- faces: skin, eyes, brows, hair; hair styles: 0 short, 1 fringe, 2 long, 3 none ---- */
const SKINS=[['#a8664c','#c98262','#e8a684'],['#8f5a40','#b57452','#d4946e'],['#6e4430','#93603f','#b07a54'],['#b27a5c','#d69c78','#f0bc96']];
function pxHead(P,o){const Sk=PDP(SKINS[o.skin||0]),Hr=o.hair?PDP(o.hair):null,st=o.hs||0,EY=PD(o.eye||'#3fa65a'),WH=PD('#f4f4f4'),BR=Hr?Hr[0]:PD('#4a3020'),MO=PD('#8e4a3c'),Bd=o.beard?PDP(o.beard):null;
 pxBox(P.HG,-4,24,-4,8,8,8,(f,u,v,W,H)=>{
  if(f==='T')return Hr?((u+v)%3===0?Hr[2]:Hr[1]):Sk[1];if(f==='D')return Sk[0];
  if(f==='F'){if(Hr){if(v===7)return Hr[1];if(v===6&&(st===1?(u!==5):(u<=1||u>=6||u===3)))return u===3?Hr[2]:Hr[1];if(v===5&&(u===0||u===7)&&st!==3)return Hr[0]}
   if(v===4&&(u===1||u===2||u===5||u===6))return BR;if(v===3){if(u===1||u===6)return WH;if(u===2||u===5)return EY}
   if(Bd&&v<=2&&!(v>=1&&(u===3||u===4))&&!(v===2&&u>=2&&u<=5))return v===0?Bd[0]:Bd[1];
   if(v===2&&(u===3||u===4))return Sk[1];if(v===1&&(u===3||u===4))return MO;return v===0?Sk[1]:Sk[2]}
  const back=(f==='B')||(f==='R'&&u>=4)||(f==='L'&&u<=3);
  if(Hr){if(v>=6)return Hr[1];if(back&&v>=(st===2?1:3))return v===3&&st!==2?Hr[0]:Hr[1];if(st===2&&(f==='R'?u>=2:f==='L'?u<=5:false)&&v>=2)return Hr[1]}
  if((f==='R'&&u===3||f==='L'&&u===4)&&v===3)return Sk[0];return Sk[1]},{mat:0})}
/* ---- the body underneath: shirt (sleeves), bare forearms, trousers, boots ---- */
function pxBody(P,o){const Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),Pa=PDP(o.pants||['#1d2a42','#2a3b5c','#344a72']),Bt=o.boots?PDP(o.boots):PXLE;
 pxBox(P.G,-4,12,-2,8,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sh[0];if(v===H-1)return Sh[3];if(v<=1)return Sh[1];return Sh[2]},{mat:0});
 pxBox(P.LG,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Pa[2];if(f==='D')return Bt[0];if(v<=3)return v===3?Bt[3]:(v===0?Bt[1]:Bt[2]);return v===4?Pa[0]:Pa[1+(v>9?1:0)]},{mat:0});
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>PXDK,{only:true})}
function pxArm0(T,o){const Sk=PDP(SKINS[o.skin||0]),Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),bare=o.bare!==false,sl=o.sleeve||6;
 pxBox(T,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sk[0];if(!bare||v>=12-sl)return v===12-sl?Sh[1]:Sh[2];return v<=1?Sk[1]:Sk[2]},{mat:0})}
'''
SETS=r'''
/* ================= BLOCKBENCH-STYLE SKINS =================
   Each unit is the plain Minecraft player model: six base cubes and six outer-layer cubes (hat +0.5px, jacket / sleeves /
   trousers +0.25px, texture kept on the 64x64 grid, '.' = transparent so the base layer shows through), plus only a few
   extra cubes (crest, pauldrons, brim, quiver). The detail lives in the pixel art below, one string per row, top row first.
   A face given as '~R' is the mirror of face R; 'F' alone reuses face F. */
function pxPaint(spec,map){return(f,u,v,W,H)=>{let s=spec&&spec[f];if(!s)return null;let mir=false;if(typeof s==='string'){mir=s[0]==='~';s=spec[mir?s.slice(1):s]}
 if(typeof s==='function')return s(u,v,W,H);const row=s[H-1-v];if(!row)return null;const c=row[mir?W-1-u:u];if(c===undefined||c==='.')return null;const col=map[c];return col===undefined?null:col}}
function pxSkin(P,K,map,o){o=o||{};const B=(Gx,x,y,z,w,h,d,spec,g,m,ao)=>{if(spec)pxBox(Gx,x,y,z,w,h,d,pxPaint(spec,map),{mat:m||0,grid:g,ao:ao!==false})};
 B(P.HG,-4,24,-4,8,8,8,K.head,null,0);B(P.HG,-4.5,23.5,-4.5,9,9,9,K.hat,[8,8,8],K.hatMat||0,false);
 B(P.G,-4,12,-2,8,12,4,K.body,null,0);B(P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,K.jacket,[8,12,4],K.jacketMat||0,false);
 B(P.LG,-2,-12,-2,4,12,4,K.leg,null,0);B(P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,K.pants,[4,12,4],K.pantsMat||0,false);
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true})}
function pxSkinArms(T,K,map){if(K.arm)pxBox(T,-2,-12,-2,4,12,4,pxPaint(K.arm,map),{mat:0});if(K.sleeve)pxBox(T,-2.25,-12.25,-2.25,4.5,12.5,4.5,pxPaint(K.sleeve,map),{mat:K.sleeveMat||0,grid:[4,12,4],ao:false})}
/* colour maps: letters to display colours, turned into albedo once */
const pxMap=(o,tm)=>{const m={};for(const k in o)m[k]=PD(o[k]);if(tm){const T=teamPal(tm);m.V=T[0];m.t=T[1];m.T=T[2];m.U=T[3];m.Y=T[4]}return m};
/* ---------------- KNIGHT ---------------- */
const SK_KNIGHT={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
 head:{F:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss'],B:'F',R:'F',L:'F',T:'F',D:'F'},
 hat:{F:['hhhhhhhh','llllllll','mmmGGmmm','kkkGGkkk','mmmGGmmm','mmmggmmm','dmdggdmd','dddddddd'],
  R:['hhhhhhhh','llllllll','mmmmmmml','kkmmGmmm','dmmmmmmm','mmmmmmmm','mmmmmmmd','dddddddd'],L:'~R',
  B:['hhhhhhhh','lllhllll','mmmlmmmm','mmmlmmmm','mmmlmmmm','dmmlmmmd','dmmlmmmd','dddddddd'],
  T:['lhhhhhhl','hlmggmlh','hmmggmmh','hmmggmmh','hmmggmmh','hmmggmmh','hlmggmlh','lhhGGhhl']},
 body:{F:['xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx'],B:'F',R:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],L:'R',T:['dddddddd','dddddddd','dddddddd','dddddddd'],D:'T'},
 jacket:{F:['whhhhhhw','hlmmmmlh','lmtTTtml','lmtGGtml','lmGGggml','dmtggtmd','dmtTTtmd','nbbGGbbn','dltTTtld','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  R:['hhhh','llll','mmml','mmmm','mmmm','dmmm','dddd','bbbn','mmmm','hhhh','mmmm','dddd'],L:'~R',
  B:['hhhhhhhh','llllllll','mmtTTtmm','mmtTTtmm','dmtTTtmd','dmtTTtmd','dmtTTtmd','nbbbbbbn','dmtTTtmd','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  T:['hhhhhhhh','hllllllh','hllllllh','whhhhhhw']},
 arm:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 sleeve:{F:['hhhh','llll','mlmm','dmmd','....','whhw','lmml','....','hhhh','lmml','hhhh','lmlm'],
  R:['hhhh','llll','mmmm','dmmd','....','hhhh','lmml','....','hhhh','mmmm','hhhh','mdmd'],L:'R',
  B:['llll','mmmm','dmmd','dddd','....','hhhh','mmmm','....','llll','mmmm','llll','dmdm'],T:['hhhh','hllh','hllh','hhhh'],D:['dddd','dddd','dddd','dddd']},
 leg:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 pants:{F:['llll','mmmm','dmmd','....','hhhh','hwwh','lmml','....','hllh','lmml','bBBb','dmmd'],
  R:['llll','mmmm','dmmm','....','hhhh','hhhl','lmml','....','hlll','lmml','bBBb','dmmd'],L:'~R',
  B:['llll','mmmm','dmmd','....','llll','mmmm','dmmd','....','llll','mmmm','bbbb','dddd'],T:['llll','llll','llll','llll'],D:['dddd','dddd','dddd','dddd']}};
function pxKnight(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262'},thp()),K=SK_KNIGHT,S=n=>map[n];
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.5,32.5,-4.25,1,1,8.5,pxPaint({F:['G'],B:['o'],R:['GGGGGGGG'],L:'R',T:['g','G','G','G','G','G','G','g'],D:['o','o','o','o','o','o','o','o']},{G:map.G,o:map.o,g:map.g}),{mat:4,grid:[1,1,8]});
  if(AL>=2){pxBox(P.HG,-.5,33.5,-3,1,2,4,pxPaint({F:['U','T'],B:['T','t'],R:['UUUU','TTTT'],L:'R',T:['U','U','U','U'],D:['t','t','t','t']},map),{mat:7,grid:[1,2,4]});pxBox(P.HG,-.5,32,-5.6,1,2.5,2,pxPaint({F:['T','T','t'],B:'F',R:['TT','TT','tt'],L:'R',T:['T','T'],D:['t','t']},map),{mat:7,grid:[1,3,2]})}});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3,-1.25,-3,6,3,6,pxPaint({T:['mllllm','lhhhhl','lhwwhl','lhhhhl','lhhhhl','mllllm'],F:['hhhhhh','lmmmml','oggggo'],B:'F',R:'F',L:'F',D:['dddddd','dddddd','dddddd','dddddd','dddddd','dddddd']},map),{mat:4})});
}
/* ---------------- ROYAL GUARD ---------------- */
const SK_GUARD={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
 head:SK_KNIGHT.head,
 hat:{F:['UUUUUUUU','TTTUUTTT','oggGGggo','TTTTTTTT','kkkkkkkk','tllllllt','tlhllhlt','tddddddt'],
  R:['UUUUUUUU','TTTTTTTU','gggggggo','TTTTTTTT','kkTTTTTT','lltTTTTT','ldtTTTTt','dttttttt'],L:'~R',
  B:['UUUUUUUU','TTTTTTTT','gggggggg','TTTTTTTT','TTTTTTTT','tTTTTTTt','tTTTTTTt','tttttttt'],
  T:['TUUUUUUT','UTTTTTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTTTTTU','TUUUUUUT']},
 body:SK_KNIGHT.body,
 jacket:{F:['UUUUUUUU','TtrRRrtT','TtRgGRtT','TtgGGgtT','TtRgGRtT','TtRRRRtT','TtrRRrtT','nbbGGbbn','TtRRRRtT','UtRRRRtU','TtRRRRtT','ttggggtt'],
  R:['UUUU','TTTT','TTTT','TTTT','TTTT','tTTT','tttt','bbbn','TTTT','UUUU','TTTT','tttt'],L:'~R',
  B:['UUUUUUUU','TTrrrrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TtrRRrtT','nbbbbbbn','TtrRRrtT','UtrRRrtU','TtrRRrtT','ttggggtt'],
  T:['UUUUUUUU','UTTTTTTU','UTTTTTTU','UUUUUUUU']},
 arm:SK_KNIGHT.arm,
 sleeve:{F:['UUUU','TTTT','TTTT','oggo','....','UUUU','TttT','....','hhhh','lmml','GggG','lmlm'],
  R:['UUUU','TTTT','TTTT','oggo','....','UUUU','TTTT','....','hhhh','mmmm','gggo','mdmd'],L:'R',
  B:['TTTT','TTTT','tTTt','oggo','....','UUUU','TTTT','....','llll','mmmm','oggo','dmdm'],T:['UUUU','UTTU','UTTU','UUUU'],D:['dddd','dddd','dddd','dddd']},
 leg:SK_KNIGHT.leg,
 pants:{F:['TTTT','TTTT','tTTt','....','hhhh','hwwh','lmml','....','UUUU','TttT','bBBb','dmmd'],
  R:['TTTT','TTTT','tTTT','....','hhhh','hhhl','lmml','....','UUUU','TTTT','bBBb','dmmd'],L:'~R',
  B:['TTTT','TTTT','tTTt','....','llll','mmmm','dmmd','....','UUUU','TTTT','bbbb','dddd'],T:['TTTT','TTTT','TTTT','TTTT'],D:['dddd','dddd','dddd','dddd']}};
function pxGuard(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262',R:'#a62832',r:'#7a1a24',Q:'#c94450'},thp()),K=SK_GUARD;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.6,32.5,-2.5,1.2,3,3,pxPaint({F:['Q','R','r'],B:'F',R:['QQQ','RRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,3,3]});
  pxBox(P.HG,-.6,31,-5.2,1.2,3.5,2.7,pxPaint({F:['R','R','r','r'],B:'F',R:['QRR','RRR','rRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,4,3]})});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.25,-1.25,-3.25,6.5,3,6.5,pxPaint({T:['TUUUUT','UYYYYU','UYYYYU','UYYYYU','UYYYYU','TUUUUT'],F:['UUUUUU','TTTTTT','oggggo'],B:'F',R:'F',L:'F',D:['tttttt','tttttt','tttttt','tttttt','tttttt','tttttt']},map),{mat:4,grid:[6,3,6]})});
}
/* ---------------- ARCHER ---------------- */
const SK_ARCHER={hatMat:7,jacketMat:0,
 head:{F:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'],
  R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',
  B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
 hat:{F:['GGGGGGGG','gggggggg','g......g','g......g','g......g','g......g','q......q','q......q'],
  R:['GGGGGGGG','gggggggg','gggggggg','qggggggg','qggggggg','qggggggq','qqgggggq','qqqqqqqq'],L:'~R',
  B:['GGGGGGGG','gggggggg','gggggggg','gggqgggg','gggqgggg','gggqgggg','qggqgggq','qqqqqqqq'],
  T:['gggggggg','gGgggGgg','gggggggg','ggGgggGg','gggggggg','gGgggggg','ggggGggg','GGGGGGGG']},
 body:{F:['VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:'F',R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
 jacket:{F:['.bbbbnb.','bBbbbnBb','bbBbnbbb','bbBnbbbb','bbnBbbbb','bnbBbbbb','nbbBbbbn','nnnyynnn','bbbBbbbb','bbbBbbbb','bbbbbbbb','nbbbbbbn'],
  R:['bbbb','bbbb','bbbb','bbbb','bbbb','bbbb','nbbb','nnnn','bbbb','bbbb','bbbb','nnnn'],L:'~R',
  B:['.bbnbbb.','bbbbnbbb','bbbbbnbb','bbbbbbnb','bbbbbbnb','bbbbbbbn','nbbbbbbn','nnnnnnnn','bbbbbbbb','bbbbbbbb','bbbbbbbb','nbbbbbbn'],T:['bbbbbbbb','b......b','b......b','bbbbbbbb']},
 arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
 sleeve:{F:['....','....','....','....','....','VVVV','....','BBBB','bnbb','bybb','nnnn','....'],R:['....','....','....','....','....','VVVV','....','BBBB','bbnb','bbbb','nnnn','....'],L:'R',B:'R',T:null,D:null},
 leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','pPPp','PPPP','bbbb','bbbb','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
 pants:{F:['....','....','....','....','....','....','BBBB','bbbb','bnbb','bbbb','bbbb','nnnn'],R:['....','....','....','....','....','....','BBBB','bbbb','bbnb','bbbb','bbbb','nnnn'],L:'~R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};
function pxArcher(P,AL){const map=pxMap({s:'#e8a684',S:'#c98262',h:'#6b3e1e',r:'#4a2a14',e:'#3fa65a',w:'#f4f4f4',m:'#8e4a3c',
  G:'#58a852',g:'#3f8a3e',q:'#2f6a30',V:'#3f8a3e',v:'#2f6a30',b:'#86522c',B:'#a96c3c',n:'#5e381c',y:'#ecbd3a',P:'#4e3a26',p:'#3a2a1a'}),K=SK_ARCHER;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-1.5,26.5,-5.75,3,3.5,1.25,pxPaint({F:['ggg','ggg','qqq'],B:['GGG','ggg','qqq'],R:['G','g','q'],L:'R',T:['GGG'],D:['qqq']},map),{mat:7,grid:[3,3,1]});
  pxRot(P.G,T=>{pxBox(T,.6,13,-5.1,3,8.5,2.6,pxPaint({F:['BBB','bbb','bbb','bnb','bbb','bbb','yyy','nnn'],B:'F',R:['BB','bb','bb','bb','bb','bb','yy','nn'],L:'R',T:['nnn','nnn'],D:['nnn','nnn']},map),{mat:0,grid:[3,8,2]});
   pxBox(T,1,21.5,-4.4,2.2,1.4,1.2,pxPaint({F:['wQw','ffr'],B:'F',R:['w','f'],L:'R',T:['wQw'],D:['fff']},{w:PD('#f2f2f2'),Q:PD('#d03a2e'),f:PD('#c8a070'),r:PD('#d03a2e')}),{mat:0,grid:[3,2,1]})},[0,0,-.32],[2,17,-4]);
 });
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ---------------- PEASANT (six variants: hat, skin, hair, beard, tunic colour) ---------------- */
function pxPeasant(P,AL){const pv=ZVAR&&ZVAR.hint==='p'?ZVAR.v%6:0;
 const SH=[['#6e4424','#8a5a32'],['#56642c','#6e7e3e'],['#6a3a32','#7c4a42'],['#3e4e62','#55667a'],['#6e6038','#8a7a52'],['#563a54','#6a4a6a']][pv],
  HR=[['#5a3a1a','#3a2410'],['#2a1a10','#160e08'],['#8a6a3a','#6a5028'],['#1e1a18','#120f0e'],['#a0522d','#6e3216'],['#6a6a62','#4a4a44']][pv],
  SK=[['#e8a684','#c98262'],['#f0bc96','#d69c78'],['#d4946e','#b57452'],['#e8a684','#c98262'],['#b07a54','#93603f'],['#f0bc96','#d69c78']][pv],hat=[0,2,0,1,3,0][pv],beard=pv===3||pv===5;
 const map=pxMap({s:SK[0],S:SK[1],h:HR[0],r:HR[1],e:['#3a78c2','#6b4423','#3fa65a','#6b4423','#3a78c2','#6b4423'][pv],w:'#f4f4f4',m:'#8e4a3c',
  V:SH[1],v:SH[0],a:'#ddd0ae',A:'#b4a682',c:'#c8a868',C:'#a08448',P:'#433824',p:'#2e2618',b:'#86522c',n:'#5e381c',W:'#d4c6aa',X:'#b8a98e',
  Z:'#d4b45c',z:'#a88a42',Y:'#ecd27a',k:'#6a5038',K:'#86684a',q:'#d8cbaa',Q:'#b0a284'});
 const face=beard?['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','rssSSssr','rrrmmrrr','rrrrrrrr']:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'];
 const K={jacketMat:0,
  head:{F:face,R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
  hat:hat===0?null
   :hat===1?{F:['KKKKKKKK','kkkkkkkk','kkkkkkkk','........','........','........','........','........'],R:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkk....','........','........','........','........'],L:'~R',B:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkkkkkk','kkkkkkkk','........','........','........'],T:['KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK']}
   :hat===2?{F:['qqqqqqqq','QqqqqqqQ','Q......Q','........','........','........','........','........'],R:['qqqqqqqq','qqqqqqqq','qqqqqqqq','Qqqqqqqq','.Qqqqqqq','..QQqqqq','.....QQq','........'],L:'~R',B:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','QqqqqqqQ','QQqqqqQQ','..QqqQ..'],T:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq']}
   :null,
  body:{F:['VVVVVVVV','VVVssVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:['VVVVVVVV','VVVVVVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
  jacket:{F:['........','........','........','........','cCcCcCcC','.aaaaaa.','.aaaaaa.','.aAaaAa.','.aaaaaa.','.aaaaaa.','.AaaaaA.','..AAAA..'],R:['....','....','....','....','cCcC','....','....','....','....','....','....','....'],L:'R',B:['........','........','........','........','cCcCcCcC','........','........','........','........','........','........','........'],T:null,D:null},
  arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','ssss','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
  sleeve:{F:['....','....','....','....','....','VVVV','....','....','....','....','....','....'],B:'F',R:'F',L:'F',T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
  pants:{F:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],R:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],L:'R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};
 pxScene(()=>{pxSkin(P,K,map);if(hat===0)pxBox(P.HG,-4.25,31.75,-4.25,8.5,2.25,8.5,pxPaint({F:['YZZZZZZY','zZZZZZZz','kkkkkkkk'],B:'F',R:'F',L:'F',T:['ZZZZZZZZ','ZYZZZZYZ','ZZZZZZZZ','ZZZYZZZZ','ZZZZZZZZ','ZYZZZYZZ','ZZZZZZZZ','ZZZZZZZZ'],D:null},map),{mat:0,grid:[8,3,8]});if(hat===0)pxBox(P.HG,-6,31.25,-6,12,.75,12,pxPaint({T:['zZZZZZZZZZZz','ZZYZZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZYZZZZZZ','ZYZZZZZZZZYZ','ZZZZZZZZZZZZ','ZZZZZZZZZZZZ','ZZZYZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZZZYZZZZ','ZZYZZZZZZZZZ','zZZZZZZZZZZz'],F:['zzzzzzzzzzzz'],B:'F',R:'F',L:'F',D:['zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz']},map),{mat:0})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ================= GEAR: Naranxia arms, in the Blockbench item manner =================
   our own designs (steel, leather, wood, team colours, a little brass) built the Blockbench way: chunky bevelled 3D parts
   for hilts, sockets, bosses and rims, flat 2D pixel parts with finer pixels for blades and painted faces, wrapped grips
   with bands; built on the item grid then scaled down like items in a Minecraft hand.
   tool space: x = thickness, y = width, z = length; grip at the origin */
const RGO=PDP(['#7a4a10','#b07a22','#d9a83a','#f2cc66','#fff0b0']),RRU=PDP(['#7a1018','#c8202e','#ff6a70','#ffc0c8']),
 RSV=PDP(['#5d6674','#8a94a3','#b9c1cc','#dde2e8','#f7f9fb']),RDS=PDP(['#2c3038','#454b55','#626a76','#858d99','#a9b0ba']),
 RLE=PDP(['#2e1c0e','#4a2e16','#6b4423','#8a5a32','#a87244']),RWD=PDP(['#3a2414','#57361e','#74492a','#8f5e36','#a8743f']);
/* bevelled part: bright top row and left column, dark lip below; works for any palette */
const pBev=P=>(f,u,v,W,H)=>{if(f==='T')return (u===0||v===0)&&W>2?P[4]:P[3];if(f==='D')return P[0];if(H>=2&&v===H-1)return P[4];if(H>=3&&v===0)return P[1];return (u===0&&W>=3)?P[3]:P[2]};
const pGo=pBev(RGO);
const pGem=P=>(f,u,v,W,H)=>{if(f==='D')return P[0];if(W>=3&&H>=3){if(u===0||v===0||u===W-1||v===H-1)return P[1];return (u===1&&v===H-2)?P[3]:P[2]}return (u===0&&v===H-1)?P[3]:((u===W-1||v===0)?P[0]:P[1])};
const pWrap=P=>(f,u,v,W,H)=>{if(f==='T'||f==='D')return P[2];const q=(f==='F'||f==='B')?v:u;return (q+v)%2?P[1]:P[3]};
const gx=(G,x,y,z,w,h,d,p,o)=>pxBox(G,x,y,z,w,h,d,p,Object.assign({mat:4},o||{}));
const gem=(G,x,y,z,w,h,d,P)=>gx(G,x,y,z,w,h,d,pGem(P||RRU),{mat:5,grid:[Math.max(2,Math.round(w*2)),Math.max(2,Math.round(h*2)),Math.max(2,Math.round(d*2))]});
const GSC=.72,gScale=(geo,k)=>{geo.scale(k,k,k);return geo};
const teamGem=()=>{const T=teamPal(thp());return[T[0],T[2],T[3],T[4]]};
/* flat pixel sprite from a colour function on a W x H grid of cells of size ps (v = 0 is the bottom row) */
function pxSpriteF(G,W,H,col,o){const ps=o.ps||1,d=o.d||1,mat=o.mat===undefined?4:o.mat;
 for(let v=0;v<H;v++){let u=0;while(u<W){const c=col(u,v);if(!c){u++;continue}let e=u;while(e<W&&col(e,v)===c)e++;
   if(o.plane==='yz')pxBox(G,-d/2+(o.x||0),o.y+v*ps,o.z+u*ps,d,ps,(e-u)*ps,(f)=>f==='R'||f==='L'?c:shadeHex(c,f==='T'?.96:.8),{mat,ao:false,grid:[1,1,1]});
   else pxBox(G,o.x+u*ps,o.y+v*ps,-d/2+(o.z||0),(e-u)*ps,ps,d,(f)=>f==='F'?c:(f==='B'?(o.back||c):shadeHex(c,f==='T'?.96:.8)),{mat,ao:false,grid:[1,1,1]});
   u=e}}}
/* ---------------- knight's arming sword ----------------
   flat steel blade in fine pixels (bright edge, fuller, a few glints, stepped point), a straight steel cross-guard with
   blocky flared ends, a brown leather grip with a steel band, a steel wheel pommel with a team-coloured stone */
function pxSword(){const G=newG(),S=RSV;
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
const SHW=PDP(['#463724','#5b4a33','#705c41','#87704f','#9b835e']),SHI=PDP(['#3a3f47','#596069','#7f8792','#a3aab4','#c8ced6']),
 SHG=PDP(['#6e4a0e','#a8741e','#d7a83c','#f6d27a','#fff0b8']),SHK=PDP(['#262a31','#363c46','#4c5560','#66707c']);
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
const ART_GUARD_A=ART_CROWN.concat(['TTTTTTTTTT','YYYYYYYYYY','..........','..........','..........','..........','..........','..........','..........','..........','..........','..........']);
const ART_GUARD_B=ART_CROWN.concat(['TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','YYYYYYYYYY','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT']);
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
function pxShield(AL,vr){const art=vr==='0'?null:(vr==='A'?ART_KNIGHT_A:ART_KNIGHT_B);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.95)}
function pxGuardShield(AL,vr){const art=vr==='0'?null:(({A:ART_GUARD_A,B:ART_GUARD_B,R2:ART_GUARD_R2,R3:ART_GUARD_R3})[vr]||ART_GUARD_R1);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.98)}
/* ---------------- halberd ----------------
   a Blockbench voxel weapon: every pixel is a cube one shaft-thickness wide. A spear point with two lugs, a crescent axe
   with a hollow and two horns, a back hook, a deep steel socket block, a brass collar with a small team tassel, a banded
   wooden shaft, a wrapped leather grip and a steel foot. Rows are drawn top first, the shaft is column 6. */
const pInPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};
const HALB=[
 '.......L.......','.......L.......','.......L.......','.......L.......','......LMD......','......LMD......','....L.L.D......','...LM..K.......',
 '..LMM..w.......','..LMD..W.......','.LMMD..w.......','.LMD...W.......','LMMDDD.S.DMM...','LMMD.D.S....ML.','LMD....S.....L.','LMD....S.....L.',
 'LMMD.D.S.......','LMMDDD.S.......','.LMD...W.......','.LMMD..G.......','..LMD..wY......','..LMM..WT......','...LM..wT......','....L..WT......'];
function pxHalberd(){const G=newG(),V=1.4,Tm=teamPal(thp()),N=52,G0=37,
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
const RST=RSV,pGrip=(f,u,v)=>{const Tm=teamPal(thp()),q=(f==='T'||f==='D')?v:u;return q%2?Tm[1]:Tm[3]};
/* ---------------- bow ----------------
   recurve limbs made of three straight wooden segments each (3D, rotated), brass rings at the joints, a leather grip with
   a team band and an arrow rest, steel nocks with flat (2D) brass horn tips, flat brass leaf plates on the belly, the string */
function pxBow(){const G=newG(),Wd=RWD,Tm=teamPal(thp());
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

'''
g=g.replace("let ALB=0,ALF=null;",LIB+"\nconst pE=(u,v,W,H)=>Math.min(u,v,W-1-u,H-1-v);\n"+SETS+"let PXON=true,SHZ=+(window.__SHZ||1.35);let ALB=0,ALF=null;",1)
g=R(g," /* knight / captain / bannerman */\n"," /* knight / captain / bannerman */\n if(type==='knight'&&PXON){pxKnight(P,AL);return null}\n")
g=R(g," if(type==='peasant'){\n  const pv=ZVAR&&ZVAR.hint==='p'"," if(PXON&&(type==='peasant'||type==='archer'||type==='guard')){({peasant:pxPeasant,archer:pxArcher,guard:pxGuard})[type](P,AL);return{h:type==='guard'?21:15.6}}\n if(type==='peasant'){\n  const pv=ZVAR&&ZVAR.hint==='p'")
g=R(g,"parts=[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}","parts=PXON?[{k:'cape',x:0,y:10.8*VX,z:-1.45*VX}]:[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}")
g=R(g," TOOLG.sword=sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');"," TOOLG.sword=PXON?pxSword():sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');")
g=R(g,"function shieldGeo(kind,AL){const G=newG(),","function shieldGeo(kind,AL){if(PXON&&/^knight/.test(kind))return pxShield(AL,kind.slice(6));if(PXON&&/^guard/.test(kind))return pxGuardShield(AL,kind.slice(5));const G=newG(),")
g=R(g,"TOOLG.bow=mk(G=>{","TOOLG.bow=PXON?pxBow():mk(G=>{")
g=R(g,"TOOLG.halberd=mk(G=>{","TOOLG.halberd=PXON?pxHalberd():mk(G=>{")
# the shield sits on the forearm (plate against the sleeve, the bracket behind the arm) instead of floating in front of it
g=R(g,"r.shp=[.2*VX,-5.0*VX,2.1*VX]","r.shp=[.2*VX,-5.0*VX,(PXON?SHZ:2.1)*VX]")
# softer unit light: a smooth ramp instead of hard bands (keeps the warm light / cool shade)
g=R(g,"  float bd=.42+.3*smoothstep(.24,.36,r)+.28*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);vec3 tnt=mix(vec3(.66,.76,1.08),vec3(1.06,1.,.9),smoothstep(.36,.7,r));\n  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;",
      "  float bd=mix(.42,1.12,smoothstep(.04,1.2,r));vec3 tnt=mix(vec3(.76,.83,1.05),vec3(1.04,1.,.94),smoothstep(.25,.8,r));\n  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;")
open(dst,'w').write(g);print('ok')
