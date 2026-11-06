import sys,os
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
D0=os.path.dirname(os.path.abspath(__file__));SETS=''.join(open(os.path.join(D0,f),encoding='utf-8').read()+'\n' for f in ['sets_skin.js','sets_units2.js'])   # unit skins and gear: edit sets_skin.js
g=g.replace("let ALB=0,ALF=null;",LIB+"\nconst pE=(u,v,W,H)=>Math.min(u,v,W-1-u,H-1-v);\n"+SETS+"let PXON=true,SHZ=+(window.__SHZ||1.35);let ALB=0,ALF=null;",1)
g=R(g," /* knight / captain / bannerman */\n"," /* knight / captain / bannerman */\n if(type==='knight'&&PXON){pxKnight(P,AL);return null}\n")
g=R(g," if(type==='peasant'){\n  const pv=ZVAR&&ZVAR.hint==='p'"," if(PXON&&(type==='peasant'||type==='archer'||type==='guard')){({peasant:pxPeasant,archer:pxArcher,guard:pxGuard})[type](P,AL);return{h:type==='guard'?21:15.6}}\n if(type==='peasant'){\n  const pv=ZVAR&&ZVAR.hint==='p'")
g=R(g,"parts=[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}","parts=PXON?[{k:'cape',x:0,y:10.8*VX,z:-1.45*VX}]:[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}")
g=R(g," TOOLG.sword=sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');"," TOOLG.sword=PXON?pxSword():sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');")
g=R(g,"function shieldGeo(kind,AL){const G=newG(),","function shieldGeo(kind,AL){if(PXON&&/^knight/.test(kind))return pxShield(AL,kind.slice(6));if(PXON&&/^guard/.test(kind))return pxGuardShield(AL,kind.slice(5));const G=newG(),")
g=R(g,"TOOLG.bow=mk(G=>{","TOOLG.bow=PXON?pxBow():mk(G=>{")
g=R(g,"TOOLG.halberd=mk(G=>{","TOOLG.halberd=PXON?pxHalberd():mk(G=>{")
# round 2: king, captain, bannerman, gunners, zombies and their gear
g=R(g," if(PXON&&(type==='peasant'||type==='archer'||type==='guard')){"," if(PXON&&(type==='king'||type==='captain'||type==='bannerman')){({king:pxKing,captain:pxCaptain,bannerman:pxBannerman})[type](P,AL);return null}\n if(PXON&&(type==='gunner'||type==='gunner2')){pxGunner(P,AL);if(type==='gunner2'){AE(0,0,-4.65,1.6,.3,.3,7.4,'#8a6a3a');AE(0,0,-4.85,5.5,.68,.68,1.0,'#4a3a2a');AE(0,0,-4.75,-2.3,.4,.4,.4,'#5a4428')}return{h:15.6}}\n if(PXON&&(type==='peasant'||type==='archer'||type==='guard')){")
g=R(g,"TOOLG.gsword=sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');","TOOLG.gsword=PXON?pxCapSword():sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');")
g=R(g,"TOOLG.rsword=mk(G=>{","TOOLG.rsword=PXON?pxRoyalSword():mk(G=>{")
g=R(g,"if(PXON&&/^guard/.test(kind))return pxGuardShield(AL,kind.slice(5));","if(PXON&&/^guard/.test(kind))return pxGuardShield(AL,kind.slice(5));if(PXON&&/^captain/.test(kind))return pxCaptainShield(AL,kind.slice(7));")
g=R(g,"function zombieKit(type,ZV,P){","function zombieKit(type,ZV,P){if(PXON&&!window.__ZOLD){pxZombie(type,ZV,P);return}")
# round 3: pixel capes, banner, cannon; the swarm takes the same green tint as the zombies
g=R(g," const T=toolGeos(),r=fin({G,HG,LA,LG,AG,parts:parts,X:P0.X}"," if(PXON)pxCapes(type,P0);\n const T=toolGeos(),r=fin({G,HG,LA,LG,AG,parts:parts,X:P0.X}")
g=R(g,"if(type==='bannerman'){h=40;const B=bannerKit(G);P0.X=B.X;parts=B.parts}","if(type==='bannerman'){h=40;const B=bannerKit(G);P0.X=B.X;parts=B.parts;if(PXON)pxBanner(B.X)}")
g=R(g,"function cannonG(){","function cannonG(){if(PXON)return pxCannon();")
g=R(g,"function swGeoV(S){S.lod=1;","function swGeoV(S){S.lod=1;if(PXON&&S.decay!=='dried'&&S.decay!=='mummy')S=Object.assign({},S,{sk:S.sk.map(pxZg)});")
# the shield sits on the forearm (plate against the sleeve, the bracket behind the arm) instead of floating in front of it
g=R(g,"r.shp=[.2*VX,-5.0*VX,2.1*VX]","r.shp=[.2*VX,-5.0*VX,(PXON?SHZ:2.1)*VX]")
# softer unit light: a smooth ramp instead of hard bands (keeps the warm light / cool shade)
g=R(g,"  float bd=.42+.3*smoothstep(.24,.36,r)+.28*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);vec3 tnt=mix(vec3(.66,.76,1.08),vec3(1.06,1.,.9),smoothstep(.36,.7,r));\n  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;",
      "  float bd=mix(.42,1.12,smoothstep(.04,1.2,r));vec3 tnt=mix(vec3(.76,.83,1.05),vec3(1.04,1.,.94),smoothstep(.25,.8,r));\n  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;")
# buildings (round 4): Minecraft block textures in the surface shader: every surface on a pixel grid (18 per tile), stone in
# staggered bricks with mortar, wood in planks with butt joints, per-pixel colour noise; the painted ink lines are toned down
PXSH=r"""
#ifndef TERR
 {float PXS=+(window.__PXS||18)+0.;vec2 pc=floor(uv*PXS+.001);float pn=hn3(vec3(pc,aN.y>.5?7.3:(aN.x>.5?3.1:5.7)));vec3 c0=diffuseColor.rgb;
  float row=floor(pc.y/4.),bx=mod(pc.x+mod(row,2.)*4.,8.),mor=(mod(pc.y,4.)<.5||bx<.5)?1.:0.;
  float prow=floor(pc.y/4.),pe=mod(pc.x+prow*5.,16.)<.5?1.:0.,pli=(mod(pc.y,4.)<.5||pe>.5)?1.:0.;
  if(aN.y>.5){mor=(mod(pc.x,8.)<.5||mod(pc.y,8.)<.5)?1.:0.;pli=mod(pc.x,4.)<.5?1.:0.;}
  vec3 cS=c0*(.9+.2*pn)*mix(1.,.64,mor),cW=c0*(.86+.2*pn)*mix(1.,.68,pli),cO=c0*(.93+.14*pn);
  float wS=clamp(kS*1.6,0.,1.),wW=clamp(kD*1.4,0.,1.)*(1.-wS);
  diffuseColor.rgb=mix(mix(cO,cW,wW),cS,wS);}
#endif"""
PXSH=PXSH.replace("+(window.__PXS||18)+0.","18.")
g=R(g,"diffuseColor.rgb=mix(bc,bc*vec3(.1,.085,.12),ink);\n#ifdef TERR","diffuseColor.rgb=mix(bc,bc*vec3(.1,.085,.12),ink*.3);"+PXSH+"\n#ifdef TERR")
g=R(g,"function castleGeo5(){const G=newG();","function castleGeo5(){if(PXON)return (window.__CV==='B'?pxCastleB:pxCastleA)();const G=newG();")
open(dst,'w').write(g);print('ok')
