/* ================= WORLD (lazy chunks) ================= */
const CH=32,NCX=Math.ceil(TW/CH),NCY=Math.ceil(TH/CH);
const LAND=12,BED=7,WLV=LAND-.08,ROCKH=LAND+11,SNOW=LAND+21;
const HT=new Uint8Array(N),ter=new Uint8Array(N),amt=new Uint8Array(N),pth=new Uint8Array(N),FLG=new Uint8Array(N),genF=new Uint8Array(NCX*NCY);
const occ=new Map(),stairs=new Map(),CAMPS=new Map(),TFL=new Uint8Array(N);
const mc=cvs(TW,TH),mg=mc.getContext('2d');
let CX=TW>>1,CY=TH>>1;
let GORD=[],GI=0,genN=0;function mkGord(){const o=[],ccx=CX/CH,ccy=CY/CH;for(let j=0;j<NCY;j++)for(let i=0;i<NCX;i++)o.push([Math.min(hyp(i+.5-ccx,j+.5-ccy),SITE2?hyp(i+.5-SITE2.tx/CH,j+.5-SITE2.ty/CH):1e9),j*NCX+i]);o.sort((a,b)=>a[0]-b[0]);GORD=o.map(a=>a[1])}mkGord();
function bgGen(ms){const t0=performance.now();while(GI<GORD.length&&performance.now()-t0<ms){const k=GORD[GI++];if(!genF[k])genChunk(k%NCX,(k/NCX)|0)}}
let SEED=0,GPR={},ROUTES=[],RCH=new Map(),gateSolid=true,FP=null;
const D4=[[1,0],[-1,0],[0,1],[0,-1]],D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],FD=[null];
const gOK=(x,y)=>x>=0&&y>=0&&x<TW&&y<TH&&genF[((y/CH)|0)*NCX+((x/CH)|0)]===1;
function mkRoutes(){ROUTES=[];RCH=new Map();const a0=Math.random()*6.283,CT=SITE2?[[CX,CY],[SITE2.tx,SITE2.ty]]:[[CX,CY]];
 for(let k=0;k<3*CT.length;k++){const CX=CT[(k/3)|0][0],CY=CT[(k/3)|0][1],th=a0+k*2.094+(Math.random()-.5)*.9,ex=Math.cos(th),ey=Math.sin(th),px=-ey,py=ex,A=30+Math.random()*34,ph=Math.random()*90,pts=[],wps=[];
  const dX=ex>1e-6?(TW-12-CX)/ex:ex<-1e-6?(12-CX)/ex:1e9,dY=ey>1e-6?(TH-12-CY)/ey:ey<-1e-6?(12-CY)/ey:1e9,D=Math.min(dX,dY);
  for(let d=D,n=0;d>=8;d-=1.5,n++){const lat=(fb(d*.02,ph,SEED+k*7)-.5)*4*A*Math.min(1,(D-d)/40)*Math.min(1,(d-8)/40);
   const p=[Math.max(9,Math.min(TW-10,CX+.5+ex*d+px*lat)),Math.max(9,Math.min(TH-10,CY+.5+ey*d+py*lat))];pts.push(p);if(n%3===0)wps.push(p)}
  ROUTES.push({th,pts,wps,dir:['E','SE','S','SW','W','NW','N','NE'][((Math.round(th/.7854)%8)+8)%8]});
  for(const p of pts){const c0=Math.floor((p[0]-17)/CH),c1=Math.floor((p[0]+17)/CH),r0=Math.floor((p[1]-17)/CH),r1=Math.floor((p[1]+17)/CH);
   for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){if(c<0||r<0||c>=NCX||r>=NCY)continue;const key=r*NCX+c;let L=RCH.get(key);if(!L){L=[];RCH.set(key,L)}L.push(p[0],p[1])}}}}
/* natural ramps carved into terraces: chains of sloped tiles, 2 wide */
function carveRamps(cx,cy){const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),sd=SEED,used=new Set(),ok1=i=>ter[i]===0||ter[i]===2;
 for(let y=y0+2;y<y1-2;y++)for(let x=x0+2;x<x1-2;x++){const P=y*TW+x;if(!ok1(P)||FLG[P])continue;
  for(let di=0;di<4;di++){const[dx,dy]=D4[di],Q=P+dy*TW+dx;if(!ok1(Q)||FLG[Q])continue;const diff=HT[Q]-HT[P];if(diff<1||diff>12)continue;
   if(hs(x*1.3+di,y*1.7,sd+31)>.085)continue;
   const step=diff<=6?1:2,n=Math.ceil(diff/step),lo=HT[P],hi=HT[Q],mx=-dy,my=dx;let good=true;const T1=[];
   for(let k=0;k<=n&&good;k++){const qx=x+dx*(k+1),qy=y+dy*(k+1);if(qx<x0+1||qy<y0+1||qx>=x1-1||qy>=y1-1){good=false;break}
    for(const t of[0,1,2]){const ii=(qy+my*t)*TW+qx+mx*t;if(HT[ii]!==hi||!ok1(ii)||FLG[ii]||used.has(ii)||stairs.has(ii)){good=false;break}if(k<n)T1.push([ii,k,t])}}
   const P2=P+my*TW+mx,P3=P2+my*TW+mx;if(!good||HT[P2]!==lo||!ok1(P2)||HT[P3]!==lo||!ok1(P3)||used.has(P))continue;
   /* accessibility: both ends must be clear, same-height, free ground (no tree/rock/water) */
   {let acc=ter[P]===0&&ter[P2]===0&&ter[P3]===0;const fl=(ii,h)=>HT[ii]===h&&ter[ii]===0&&!stairs.has(ii);
    for(const t of[0,1,2]){if(!acc)break;const bx=x-dx+mx*t,by=y-dy+my*t,tx2=x+dx*(n+1)+mx*t,ty2=y+dy*(n+1)+my*t,ux=x+dx*(n+2)+mx*t,uy=y+dy*(n+2)+my*t;
     if(bx<x0||by<y0||bx>=x1||by>=y1||ux<x0||uy<y0||ux>=x1||uy>=y1){acc=false;break}
     if(!fl(by*TW+bx,lo)||!fl(ty2*TW+tx2,hi)||!fl(uy*TW+ux,hi))acc=false}
    if(!acc)continue}
   for(const[ii,k,t]of T1){const lk=lo+k*step,hk=Math.min(hi,lk+step);HT[ii]=lk;ter[ii]=0;amt[ii]=0;stairs.set(ii,{ax:dx?0:1,sg:(dx+dy)>0?1:-1,lo:lk,hi:hk,nat:1});
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)used.add(ii+b*TW+a)}
   for(let k=-3;k<=n+3;k++)for(let t=-4;t<=6;t++){const ii=(y+dy*(k+1)+my*t)*TW+x+dx*(k+1)+mx*t;used.add(ii)}
   used.add(P);used.add(P2);used.add(P3);break}}}
/* every plateau must be reachable: isolated pockets get a forced ramp (or are levelled), unreachable resources are removed */
function rampCarve(P,dd,x0,y0,x1,y1,low,wide){const px=P%TW,py=(P/TW)|0,dx=dd===1?1:dd===-1?-1:0,dy=dd===TW?1:dd===-TW?-1:0,Q=P+dd,lo=HT[P],hi=HT[Q],diff=hi-lo;if(diff<1||diff>12)return false;
 const step=diff<=6?1:2,n=Math.ceil(diff/step),mx=-dy,my=dx,ax=dx?0:1,sgn=(dx+dy)>0?1:-1,okT=i=>ter[i]!==1&&ter[i]!==5&&!stairs.has(i)&&!occ.has(i),inb=(x,y)=>x>=x0+1&&y>=y0+1&&x<x1-1&&y<y1-1;
 for(const sg of wide?[1,-1]:[0]){const side=wide?[0,sg]:[0];let good=true;const T1=[],L1=[];
  for(const t of side){const bx=low?px+dx+mx*t:px+mx*t,by=low?py+dy+my*t:py+my*t;if(!inb(bx,by)){good=false;break}const b=by*TW+bx;if(!okT(b)||HT[b]!==(low?hi:lo)){good=false;break}L1.push(b)}
  for(let k=0;k<=n&&good;k++)for(const t of side){const qx=low?px-dx*k+mx*t:px+dx*(k+1)+mx*t,qy=low?py-dy*k+my*t:py+dy*(k+1)+my*t;if(!inb(qx,qy)){good=false;break}const ii=qy*TW+qx;if(!okT(ii)||HT[ii]!==(low?lo:hi)||FLG[ii]&3){good=false;break}T1.push([ii,k])}
  if(!good)continue;
  const sv=T1.map(([ii])=>[ii,HT[ii],ter[ii],amt[ii]]).concat(L1.map(i=>[i,HT[i],ter[i],amt[i]]));
  for(const[ii,k]of T1){if(k<n){let lk,hk;if(low){hk=hi-k*step;lk=Math.max(lo,hk-step)}else{lk=lo+k*step;hk=Math.min(hi,lk+step)}HT[ii]=lk;stairs.set(ii,{ax,sg:sgn,lo:lk,hi:hk,nat:1})}ter[ii]=0;amt[ii]=0}
  for(const i of L1){ter[i]=0;amt[i]=0}
  /* the cut must not strand a corner of the terrace it enters: every tile beside the run still reaches the landing */
  if(!rampKeeps(T1.filter(t=>t[1]<n).map(t=>t[0]),T1.filter(t=>t[1]===n).map(t=>t[0]),low?lo:hi,x0,y0,x1,y1)){for(const[ii,h0,t0,a0]of sv){HT[ii]=h0;ter[ii]=t0;amt[ii]=a0;stairs.delete(ii)}continue}
  RAMPT=T1.map(t=>t[0]).concat(L1);return true}
 return false}
function rampKeeps(run,land,h,x0,y0,x1,y1){const S=new Set(run),need=new Set();
 for(const ii of run)for(const[dx,dy]of D4){const b=ii+dy*TW+dx;if(!S.has(b)&&HT[b]===h&&!stairs.has(b)&&ter[b]!==1&&ter[b]!==5)need.add(b)}
 if(!need.size)return true;const seen=new Set(land),Q=[...land];let hd=0;
 while(hd<Q.length&&need.size&&Q.length<1500){const a=Q[hd++];need.delete(a);const ax=a%TW,ay=(a/TW)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<x0||by<y0||bx>=x1||by>=y1)continue;const b=by*TW+bx;if(seen.has(b)||HT[b]!==h||stairs.has(b)||ter[b]===1||ter[b]===5)continue;seen.add(b);Q.push(b)}}
 return need.size===0}
let RAMPT=[];
function tryRamp(P,dd,x0,y0,x1,y1){return rampCarve(P,dd,x0,y0,x1,y1,false,true)||rampCarve(P,dd,x0,y0,x1,y1,true,true)||rampCarve(P,dd,x0,y0,x1,y1,false,false)||rampCarve(P,dd,x0,y0,x1,y1,true,false)}
function fixAccess(cx,cy){const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),w=x1-x0,h=y1-y0,lab=new Int16Array(w*h),comps=[];let nl=0;
 const walk=i=>ter[i]!==1&&ter[i]!==5;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,li=(y-y0)*w+(x-x0);if(lab[li]||!walk(i))continue;const id=++nl,st=[i],C={id,t:[],border:false};lab[li]=id;
  while(st.length){const a=st.pop(),ax=a%TW,ay=(a/TW)|0;C.t.push(a);if(ax===x0||ay===y0||ax===x1-1||ay===y1-1)C.border=true;
   for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<x0||by<y0||bx>=x1||by>=y1)continue;const b=by*TW+bx,lb=(by-y0)*w+(bx-x0);if(lab[lb]||!walk(b)||!canStep(a,b))continue;lab[lb]=id;st.push(b)}}
  comps.push(C)}
 if(comps.length<2)return;let big=comps[0];for(const C of comps)if(C.t.length>big.t.length)big=C;
 const par=comps.map((_,i)=>i),find=i=>{while(par[i]!==i)i=par[i]=par[par[i]];return i};
 const order=comps.slice().sort((a,b)=>a.t.length-b.t.length);
 for(const C of order){if(C===big||find(C.id-1)===find(big.id-1))continue;
  const cand=[];for(const a of C.t){const ax=a%TW,ay=(a/TW)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<x0||by<y0||bx>=x1||by>=y1)continue;const b=by*TW+bx,L=lab[(by-y0)*w+(bx-x0)];if(!L||L===C.id||find(L-1)===find(C.id-1)||!walk(b))continue;const df=HT[b]-HT[a];if(df===0||Math.abs(df)>12)continue;
    if(df>0)cand.push([a,b-a,L,hs(a%97,(a/97)|0,SEED+5)]);else cand.push([b,a-b,L,hs(a%97,(a/97)|0,SEED+6)])}}
  cand.sort((p,q)=>p[3]-q[3]);let done=false;
  for(let k=0;k<Math.min(cand.length,240)&&!done;k++){const[P,dd,L]=cand[k];if(tryRamp(P,dd,x0,y0,x1,y1)){par[find(C.id-1)]=find(L-1);done=true}}
  if(done)continue;
  if(C.border)continue;
  const cnt=new Map();for(const a of C.t){const ax=a%TW,ay=(a/TW)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<x0||by<y0||bx>=x1||by>=y1)continue;const b=by*TW+bx;if(lab[(by-y0)*w+(bx-x0)]===C.id||ter[b]===1||ter[b]===5||stairs.has(b))continue;cnt.set(HT[b],(cnt.get(HT[b])||0)+1)}}
  let bh=-1,bc=0;for(const[hh,c]of cnt)if(c>bc){bc=c;bh=hh}
  if(bh>=0&&!C.t.some(a=>stairs.has(a))){for(const a of C.t){HT[a]=bh;if(ter[a]===5)ter[a]=0}}
  else for(const a of C.t)if(ter[a]>=2&&ter[a]<=4){ter[a]=0;amt[a]=0}}}
function mkCamp(cx,cy,k){return;const dc=Math.max(Math.abs(cx*CH+16-CX),Math.abs(cy*CH+16-CY));if(dc<70||hs(cx,cy,SEED+77)>.42)return;
 for(let t=0;t<12;t++){const x=cx*CH+3+((hs(cx,cy,SEED+78+t)*(CH-6))|0),y=cy*CH+3+((hs(cx,cy,SEED+90+t)*(CH-6))|0),i=y*TW+x;if(ter[i]!==0||FLG[i]||stairs.has(i)||HT[i]<=WLV+1)continue;
  const n=2+((hs(cx,cy,SEED+79)*4)|0)+Math.min(8,((dc-70)/70)|0);CAMPS.set(k,{x:(x+.5)*TS,y:(y+.5)*TS,n,act:false,us:[],cx,cy});return}}
let _bwat=false;
function baseHW(x,y){const sd=SEED,P=GPR,wx=x+(fb(x*.011,y*.011,sd+700)-.5)*34,wy=y+(fb(x*.011,y*.011,sd+710)-.5)*34,e=fb(wx*.035,wy*.035,sd),mm=fb(wx*P.fq,wy*P.fq,sd+400),r=1-Math.abs(fb(wx*.02,wy*.02,sd+300)*2-1),dt=fb(x*.2,y*.2,sd+500),bn=fb(x*.02,y*.02,sd+20);
  const up=Math.max(0,mm-P.mt),u=Math.min(1.25,up/.22),E=Math.max(0,u*Math.sqrt(Math.sqrt(u))*P.am*17+Math.max(0,r-P.rg)*P.am*55+(dt-.5)*2*Math.min(1,u*3));
  const h=LAND+(bn<.36?-1:bn>.64?1:0)+(E<4?Math.round(E):4+2*Math.round((E-4)/2));
  const lk=fb(x*.0042,y*.0042,sd+1300),rv1=Math.abs(fb(x*.0065,y*.0065,sd+900)-.5),rv2=Math.abs(fb(x*.011,y*.011,sd+950)-.5),rw=.012+P.rv*.5;
  let water=lk<.27-(P.wl-.28)*.4;if(!water&&h<LAND+9&&(rv1<rw||rv2<rw*.55&&lk<.42))water=true;_bwat=water;return h}
const CTRS=()=>SITE2?[[CX,CY],[SITE2.tx,SITE2.ty]]:[[CX,CY]];
/* height of a castle square: the ground under its centre (rock and the heights stay below the rock line) */
const CSITEHC=new Map();function CSITEH(x,y){const k=SEED+':'+x+':'+y;let v=CSITEHC.get(k);if(v===undefined){const hh=[];for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)hh.push(baseHW(x+i,y+j));hh.sort((a,b)=>a-b);v=Math.max(LAND,Math.min(ROCKH-2,hh[12]));CSITEHC.set(k,v)}return v}
/* ---- terrain stages (pure: any chunk order gives the same world) ----
   raw: noise heights + castle / route limits; smooth: majority filter, slivers narrower than 3 tiles merged into a neighbour terrace,
   majority again; coasts; flat: plateaus or pits smaller than FT tiles take the height of the big terrace around them */
const RAWH=new Uint8Array(N),RAWF=new Uint8Array(N),RAWL=new Uint8Array(N),RAWD=new Uint8Array(N),SMH=new Uint8Array(N),SMF=new Uint8Array(N),smDone=new Uint8Array(NCX*NCY),FT=56;
function rawAt(x,y){const i=y*TW+x;if(RAWD[i])return i;RAWD[i]=1;
 let h=baseHW(x,y),water=_bwat,cheb=Math.max(Math.abs(x-CX),Math.abs(y-CY)),hc=CSITEH(CX,CY);if(SITE2){const c2=Math.max(Math.abs(x-SITE2.tx),Math.abs(y-SITE2.ty));if(c2<cheb){cheb=c2;hc=CSITEH(SITE2.tx,SITE2.ty)}}let lim=999,flag=0;
 if(cheb<=3)flag=1;
 const pl=RCH.get(((y/CH)|0)*NCX+((x/CH)|0));
 if(pl&&cheb>44){let md=1e9;for(let j=0;j<pl.length;j+=2){const a=x-pl[j],b=y-pl[j+1],dd=a*a+b*b;if(dd<md)md=dd}md=Math.sqrt(md);
  if(md<=3.1)flag|=2;else if(md<=22){const l2=LAND+Math.ceil((md-3.1)/4.5);if(l2<lim)lim=l2}}
 if(flag&1){h=hc;water=false}else if(flag){h=LAND;water=false}else if(h>lim)h=lim;
 RAWH[i]=h;RAWL[i]=lim>255?255:lim;RAWF[i]=flag|(water?16:0);return i}
const SMC=new Int32Array(256);
/* majority of the 3x3 land tiles (water, map outside and castle / route tiles keep their value); a tie keeps the centre, else the lowest */
function smMode(S,F,ww,wh,r){const O=S.slice();for(let y=r;y<wh-r;y++)for(let x=r;x<ww-r;x++){const q=y*ww+x;if(F[q]&7)continue;
  for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(!(F[p]&5))SMC[S[p]]++}
  const c0=S[q];let bv=c0,bc=SMC[c0];
  for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(F[p]&5)continue;const v=S[p],c=SMC[v];if(c>bc||(c===bc&&bv!==c0&&v<bv)){bc=c;bv=v}}
  for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(!(F[p]&5))SMC[S[p]]=0}
  O[q]=bv}return O}
/* opening: a tile stays on its terrace only if some 3x3 block of that terrace covers it; slivers 1-2 tiles wide take the commonest other height */
function smThin(S,F,ww,wh,r){const O=S.slice(),I=new Uint8Array(ww*wh);
 for(let y=r-1;y<wh-r+1;y++)for(let x=r-1;x<ww-r+1;x++){const q=y*ww+x;if(F[q]&5)continue;const h=S[q];let ok=1;for(let j=-ww;j<=ww&&ok;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(!(F[p]&5)&&S[p]!==h){ok=0;break}}I[q]=ok}
 for(let y=r;y<wh-r;y++)for(let x=r;x<ww-r;x++){const q=y*ww+x;if(F[q]&7)continue;const h=S[q];let sup=0;
  for(let j=-ww;j<=ww&&!sup;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(I[p]&&S[p]===h&&!(F[p]&5)){sup=1;break}}
  if(sup)continue;
  for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(!(F[p]&5)&&S[p]!==h)SMC[S[p]]++}
  let bv=-1,bc=0;for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(F[p]&5||S[p]===h)continue;const v=S[p],c=SMC[v];if(c>bc||(c===bc&&v<bv)){bc=c;bv=v}}
  for(let j=-ww;j<=ww;j+=ww)for(let i=-1;i<=1;i++){const p=q+j+i;if(!(F[p]&5))SMC[S[p]]=0}
  if(bv>=0)O[q]=bv}return O}
function smChunk(cx,cy){if(cx<0||cy<0||cx>=NCX||cy>=NCY)return;const k=cy*NCX+cx;if(smDone[k])return;smDone[k]=1;
 const M=5,x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),wx0=x0-M,wy0=y0-M,ww=x1-x0+2*M,wh=y1-y0+2*M,A=new Uint8Array(ww*wh),F=new Uint8Array(ww*wh);
 for(let y=0;y<wh;y++)for(let x=0;x<ww;x++){const gx=wx0+x,gy=wy0+y,q=y*ww+x;if(gx<0||gy<0||gx>=TW||gy>=TH){F[q]=4;continue}const i=rawAt(gx,gy),f=RAWF[i];A[q]=RAWH[i];F[q]=(f&16?1:0)|(f&3?2:0)}
 const D=smMode(smMode(smThin(smMode(A,F,ww,wh,1),F,ww,wh,2),F,ww,wh,3),F,ww,wh,4);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const q=(y-wy0)*ww+(x-wx0),i=y*TW+x;let fl=RAWF[i]&3;
  if(F[q]&1){let sh=false;for(const[dx,dy]of D4)if(!(F[q+dy*ww+dx]&1)){sh=true;break}SMH[i]=sh?LAND-1:BED;SMF[i]=fl|16|(sh?4:0);continue}
  /* routes run at ground level; a castle pad keeps the height of its site (it used to be dug down to LAND, leaving a castle
     built on a hill at the bottom of a pit) */
  let h=F[q]&2?((RAWF[i]&1)?RAWH[i]:LAND):Math.min(D[q],RAWL[i]),d=3;
  for(let j=-2;j<=2;j++)for(let p=-2;p<=2;p++)if(F[q+j*ww+p]&1){const c=Math.max(Math.abs(j),Math.abs(p));if(c<d)d=c}
  if(d===1){if(h<=LAND+2)h=LAND;fl|=4}else if(d===2){if(h<LAND)h=LAND;fl|=8}
  SMH[i]=h;SMF[i]=fl}}
let FLB=null,FQ=null;
function tfFlat(x0,y0,x1,y1){const wx0=Math.max(0,x0-FT),wy0=Math.max(0,y0-FT),wx1=Math.min(TW,x1+FT),wy1=Math.min(TH,y1+FT),ww=wx1-wx0,wh=wy1-wy0,n=ww*wh;
 if(!FLB||FLB.length<n){FLB=new Int32Array(n);FQ=new Int32Array(n)}const lab=FLB,Q=FQ,SZ2=[0],TC=[0];lab.fill(0,0,n);
 const ok=i=>!(SMF[i]&16)&&SMH[i]<ROCKH;let nl=0;
 for(let y=0;y<wh;y++)for(let x=0;x<ww;x++){const li=y*ww+x;if(lab[li])continue;const i=(y+wy0)*TW+x+wx0;if(!ok(i))continue;
  const id=++nl,h=SMH[i];let hd=0,tl=0,tc=0;lab[li]=id;Q[tl++]=li;
  while(hd<tl){const a=Q[hd++],ax=a%ww,ay=(a/ww)|0;if((ax===0&&wx0>0)||(ay===0&&wy0>0)||(ax===ww-1&&wx1<TW)||(ay===wh-1&&wy1<TH))tc=1;
   if(ax>0){const b=a-1;if(!lab[b]){const gi=(ay+wy0)*TW+ax-1+wx0;if(ok(gi)&&SMH[gi]===h){lab[b]=id;Q[tl++]=b}}}
   if(ax<ww-1){const b=a+1;if(!lab[b]){const gi=(ay+wy0)*TW+ax+1+wx0;if(ok(gi)&&SMH[gi]===h){lab[b]=id;Q[tl++]=b}}}
   if(ay>0){const b=a-ww;if(!lab[b]){const gi=(ay-1+wy0)*TW+ax+wx0;if(ok(gi)&&SMH[gi]===h){lab[b]=id;Q[tl++]=b}}}
   if(ay<wh-1){const b=a+ww;if(!lab[b]){const gi=(ay+1+wy0)*TW+ax+wx0;if(ok(gi)&&SMH[gi]===h){lab[b]=id;Q[tl++]=b}}}}
  SZ2[id]=tl;TC[id]=tc}
 const big=id=>TC[id]||SZ2[id]>=FT,tgt=new Map();
 const target=id0=>{let r=tgt.get(id0);if(r!==undefined)return r;const V=new Map();let mn=999,hd=0,tl=0;
  for(let y=y0;y<y1&&!tl;y++)for(let x=x0;x<x1;x++){const li=(y-wy0)*ww+x-wx0;if(lab[li]===id0){Q[tl++]=li;break}}
  const seen=new Set([Q[0]]);
  while(hd<tl){const a=Q[hd++],ax=a%ww,ay=(a/ww)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<0||by<0||bx>=ww||by>=wh)continue;const b=by*ww+bx;if(seen.has(b))continue;
    if(lab[b]===id0){seen.add(b);Q[tl++]=b;continue}const gi=(by+wy0)*TW+bx+wx0;if(SMF[gi]&16)continue;const hh=SMH[gi];if(hh<mn)mn=hh;if(lab[b]&&big(lab[b]))V.set(hh,(V.get(hh)||0)+1)}}
  let bv=-1,bc=0;for(const[hh,c]of V)if(c>bc||(c===bc&&hh<bv)){bc=c;bv=hh}r=bv>=0?bv:mn<999?mn:-1;tgt.set(id0,r);return r};
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,f=SMF[i];let h=SMH[i];
  if(!(f&19)&&h<ROCKH){const id0=lab[(y-wy0)*ww+x-wx0];if(id0&&!big(id0)){const t=target(id0);if(t>=0)h=Math.min(t,RAWL[i])}}
  HT[i]=h;ter[i]=f&16?1:h>=ROCKH?5:0;FLG[i]=f&15;pth[i]=0;amt[i]=0}}
const SEALD=new Uint8Array(NCX*NCY);
function sealAround(cx,cy){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=cx+i,y=cy+j;if(x<0||y<0||x>=NCX||y>=NCY)continue;const k=y*NCX+x;if(SEALD[k]||!genF[k])continue;let all=true;
  for(let b=-1;b<=1&&all;b++)for(let a=-1;a<=1;a++){const xx=x+a,yy=y+b;if(xx>=0&&yy>=0&&xx<NCX&&yy<NCY&&!genF[yy*NCX+xx]){all=false;break}}if(all){SEALD[k]=1;seal(x,y);seal(x,y)}}}
function seal(cx,cy){const X0=Math.max(0,(cx-1)*CH),Y0=Math.max(0,(cy-1)*CH),X1=Math.min(TW,(cx+2)*CH),Y1=Math.min(TH,(cy+2)*CH),w=X1-X0,h=Y1-Y0,
  c0x=cx*CH,c0y=cy*CH,c1x=Math.min(TW,c0x+CH),c1y=Math.min(TH,c0y+CH),lab=new Int32Array(w*h),walk=i=>ter[i]!==1&&ter[i]!==5,C=[null];
 for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const li=(y-Y0)*w+x-X0,i=y*TW+x;if(lab[li]||!walk(i))continue;const id=C.length,st=[i],T=[];let open=false;lab[li]=id;
  while(st.length){const a=st.pop(),ax=a%TW,ay=(a/TW)|0;T.push(a);if((ax===X0&&X0>0)||(ay===Y0&&Y0>0)||(ax===X1-1&&X1<TW)||(ay===Y1-1&&Y1<TH))open=true;
   for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<X0||by<Y0||bx>=X1||by>=Y1)continue;const b=by*TW+bx,lb=(by-Y0)*w+bx-X0;if(lab[lb]||!walk(b)||!canStep(a,b))continue;lab[lb]=id;st.push(b)}}
  C.push({T,open})}
 const L=i=>lab[(((i/TW)|0)-Y0)*w+(i%TW)-X0];let changed=false;
 for(let c=1;c<C.length;c++){const K=C[c];if(K.open||K.done||!K.T.some(i=>{const x=i%TW,y=(i/TW)|0;return x>=c0x&&x<c1x&&y>=c0y&&y<c1y}))continue;
  const hO=K.T.some(i=>occ.has(i));
  const cand=[];for(const a of K.T){const ax=a%TW,ay=(a/TW)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<X0||by<Y0||bx>=X1||by>=Y1)continue;const b=by*TW+bx,lb=L(b);if(!lb||lb===c||!walk(b))continue;const df=HT[b]-HT[a];if(!df||Math.abs(df)>12)continue;
    const pr=(C[lb].open?0:1)+hs(a%197,(a/197)|0,SEED+8);if(df>0)cand.push([a,b-a,pr]);else cand.push([b,a-b,pr])}}
  cand.sort((p,q)=>p[2]-q[2]);let ok=false;
  for(let k=0;(K.T.length>=300||hO)&&k<Math.min(cand.length,300)&&!ok;k++){const[P,dd]=cand[k];if(tryRamp(P,dd,X0,Y0,X1,Y1)){ok=true;for(const ii of RAMPT){const x=ii%TW,y=(ii/TW)|0;markT(x,y);markP(x,y);mmTile(ii)}}}
  if(ok){changed=true;K.done=true;continue}
  if(hO)continue;
  const cnt=new Map();let rk=999;for(const a of K.T){const ax=a%TW,ay=(a/TW)|0;for(const[dx,dy]of D4){const bx=ax+dx,by=ay+dy;if(bx<0||by<0||bx>=TW||by>=TH)continue;const b=by*TW+bx;if(L(b)===c&&bx>=X0&&by>=Y0&&bx<X1&&by<Y1)continue;
    if(ter[b]===5){rk=Math.min(rk,HT[b]);continue}if(ter[b]===1||stairs.has(b))continue;const lb=bx>=X0&&by>=Y0&&bx<X1&&by<Y1?L(b):0,wgt=lb&&C[lb].open?3:1;cnt.set(HT[b],(cnt.get(HT[b])||0)+wgt)}}
  let bh=-1,bc=0;for(const[hh,n]of cnt)if(n>bc||(n===bc&&hh<bh)){bc=n;bh=hh}
  for(const a of K.T)stairs.delete(a);
  if(bh>=0){for(const a of K.T){HT[a]=bh;if(bh>=ROCKH){ter[a]=5;amt[a]=0}}}
  else if(rk<999){for(const a of K.T){HT[a]=Math.max(HT[a],rk);ter[a]=5;amt[a]=0}}
  else{let ch=false;for(const a of K.T)if(HT[a]>LAND){HT[a]=LAND;ch=true}if(!ch)continue}
  changed=true;K.done=true;for(const a of K.T){const x=a%TW,y=(a/TW)|0;markT(x,y);markP(x,y);mmTile(a)}}
 if(changed){ver++;GF.clear();fdDirty=true}}
/* a tile at the foot of a cliff (a neighbour 3+ levels higher, from the smoothed heights: the same whatever the chunk order) */
function cliffFoot(x,y,h){for(const[dx,dy]of D8){const a=x+dx,b=y+dy;if(a<0||b<0||a>=TW||b>=TH)continue;const j=b*TW+a;if(!(SMF[j]&16)&&SMH[j]>=h+3)return true}return false}
/* the only deposits laid out for you: 3 gold, 3 stone and 3 trees, about 12 tiles from each castle, each set in a little group;
   picked from the raw terrain (water, castle square and roads avoided), so it does not depend on which chunk is made first */
let STK0="",STL0=null;
function starterTiles(){const key=SEED+','+CX+','+CY+','+(SITE2?SITE2.tx+','+SITE2.ty:'');if(key===STK0&&STL0)return STL0;STK0=key;STL0=new Map();
 for(const[X,Y]of CTRS()){const ga=hs(X&1023,Y&1023,SEED+7)*6.283,used=new Set();
  const okT=(x,y)=>{if(x<3||y<3||x>=TW-3||y>=TH-3)return false;const c=Math.max(Math.abs(x-X),Math.abs(y-Y));if(c<10||c>16)return false;const i=y*TW+x;if(used.has(i)||STL0.has(i))return false;const r=rawAt(x,y);return !(RAWF[r]&19)};
  [[4,40],[3,8],[2,3]].forEach(([code,am],k)=>{
   for(let s=0;s<44;s++){const a=ga+k*2.094+(s%2?1:-1)*Math.ceil(s/2)*.11,r=12.5+(s>=24?1.5:0),ax=Math.round(X+Math.cos(a)*r),ay=Math.round(Y+Math.sin(a)*r);if(!okT(ax,ay))continue;
    const grp=[[ax,ay]];for(const[dx,dy]of code===2?[[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2]]:[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1]]){if(grp.length>=3)break;if(okT(ax+dx,ay+dy))grp.push([ax+dx,ay+dy])}
    if(grp.length<3)continue;for(const[x,y]of grp){const i=y*TW+x;used.add(i);STL0.set(i,[code,am])}break}})}
 return STL0}
function genChunk(cx,cy){if(cx<0||cy<0||cx>=NCX||cy>=NCY)return;const k=cy*NCX+cx;if(genF[k])return;genF[k]=1;genN++;
 const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),sd=SEED,P=GPR;
 for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++)smChunk(cx+q,cy+j);
 tfFlat(x0,y0,x1,y1);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x;if(ter[i])continue;if(FLG[i]){if((FLG[i]&15)===8&&HT[i]<=LAND+1&&hs(x,y,sd+21)<.012*P.gd){ter[i]=4;amt[i]=40}continue}const al=HT[i]-LAND,f=fb(x*.06,y*.06,sd+50),d=(f-P.tr)/.2;
  /* woods, dense at heart and thinning at the edges; lone trees in the meadows */
  if(d>0&&al<14&&hs(x,y,sd+11)<Math.min(.9,d*.95+.1)){ter[i]=2;amt[i]=3;continue}
  if(al<12&&hs(x,y,sd+12)<P.tc){ter[i]=2;amt[i]=3;continue}
  /* stone: boulder fields in clusters, more of them in the hills, and rockfall at the foot of the cliffs */
  const so=fb(x*.11,y*.11,sd+70),sth=.74-Math.min(.08,Math.max(0,al)*.01);
  if(so>sth&&hs(x,y,sd+13)<(so-sth)*5+.1){if(so>sth+.06&&hs(x,y,sd+20)<.2*P.gd){ter[i]=4;amt[i]=40}else{ter[i]=3;amt[i]=8}continue}
  const cf=cliffFoot(x,y,HT[i]);
  if(cf&&hs(x,y,sd+17)<.12){ter[i]=3;amt[i]=8;continue}
  /* gold: veins in the hills and in the heart of the boulder fields, a few specks where the cliffs rise */
  if(al>=2&&fb(x*.05,y*.05,sd+60)>.765&&hs(x,y,sd+14)<.45*P.gd){ter[i]=4;amt[i]=40;continue}
  if(cf&&al>=1&&hs(x,y,sd+18)<.03*P.gd){ter[i]=4;amt[i]=40;continue}
  if(al>=4&&hs(x,y,sd+16)<.004*P.gd){ter[i]=4;amt[i]=40;continue}
  if(al>=3&&hs(x,y,sd+19)<.006+.002*al){ter[i]=3;amt[i]=8}}
 for(const[i,v]of starterTiles()){const x=i%TW,y=(i/TW)|0;if(x<x0||y<y0||x>=x1||y>=y1||ter[i]===1||ter[i]===5)continue;ter[i]=v[0];amt[i]=v[1]}
 carveRamps(cx,cy);fixAccess(cx,cy);mkCamp(cx,cy,k);mmChunk(cx,cy);sealAround(cx,cy)}
function mmRGB(i){const v=ter[i],h=HT[i];if(v===1)return FLG[i]&4?[74,150,196]:[45,111,174];if(v===0&&FLG[i]&4&&h<=LAND+1)return[214,200,150];if(v===2)return[42,116,56];if(v===3)return[154,161,172];if(v===4)return[255,210,60];if(pth[i]===2)return[146,150,162];if(pth[i])return[169,123,73];
 if(v===5)return h>=SNOW?[238,242,248]:[138,143,153];const k=Math.max(0,Math.min(1,(h-LAND)/24));return[(79+60*k)|0,(157-20*k)|0,(69+30*k)|0]}
function mmChunk(cx,cy){const x0=cx*CH,y0=cy*CH,w=Math.min(CH,TW-x0),h=Math.min(CH,TH-y0),im=mg.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=mmRGB((y0+y)*TW+x0+x),o=(y*w+x)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=255}mg.putImageData(im,x0,y0)}
function mmTile(i){const c=mmRGB(i);mg.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';mg.fillRect(i%TW,(i/TW)|0,1,1)}
function ensureAround(tx,ty,r){const cx=(tx/CH)|0,cy=(ty/CH)|0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)genChunk(cx+i,cy+j)}
function ensureRect(x0,y0,w,h){for(let cy=Math.max(0,(y0/CH)|0);cy<=Math.min(NCY-1,((y0+h)/CH)|0);cy++)for(let cx=Math.max(0,(x0/CH)|0);cx<=Math.min(NCX-1,((x0+w)/CH)|0);cx++)genChunk(cx,cy)}
function rollWorld(){SEED=Math.random()*500;const R=Math.random;GPR={fq:.009+R()*.007,wl:.28+R()*.08,mt:.5+R()*.1,rv:.008+R()*.008,rg:.93+R()*.03,am:.7+R()*.5,tr:.5+R()*.2,gd:.8+R()*.5,tc:.003+R()*.01}}
function initWorld(){mkGord();RAWD.fill(0);smDone.fill(0);SEALD.fill(0);HT.fill(0);ter.fill(0);amt.fill(0);pth.fill(0);FLG.fill(0);genF.fill(0);GI=0;genN=0;occ.clear();stairs.clear();CAMPS.clear();TFL.fill(0);mg.fillStyle='#10151f';mg.fillRect(0,0,TW,TH);mkRoutes();ensureAround(CX,CY,2)}
/* ---- passability ---- */
const solid=(x,y)=>{if(!gOK(x,y))return true;const i=y*TW+x;if(ter[i]>0)return true;const o=occ.get(i);return !!o&&(!o.gate||gateSolid||(o.gl===3&&(o.ax?y!==o.ty+1:x!==o.tx+1)))};
const solidAt=(x,y)=>solid(Math.floor(x/TS),Math.floor(y/TS));
function stairOK(s,d,h){const ax=Math.abs(d)===1?0:1;return ax===s.ax&&(h===s.hi||h===s.lo)}
/* a change of level needs a ramp (stairs). TFL marks terrain reshaped by the game: 1 = levelling around buildings and camps,
   bomb craters (anyone may step 1 level there), 2 = steps cut by zombie miners (only zombies climb them),
   3 = blocks raised or dug by the player (nobody climbs them: build a ramp). canStep is for our units, canStepZ for zombies. */
function canStep(a,b){const ha=HT[a],hb=HT[b];if(ha===hb)return true;if((TFL[a]===1||TFL[b]===1)&&Math.abs(ha-hb)<=1)return true;return rampStep(a,b,ha,hb)}
function canStepZ(a,b){const ha=HT[a],hb=HT[b];if(ha===hb)return true;const fa=TFL[a],fb=TFL[b];if(((fa&&fa<3)||(fb&&fb<3))&&Math.abs(ha-hb)<=1)return true;return rampStep(a,b,ha,hb)}
function rampStep(a,b,ha,hb){if(!stairs.size)return false;const d=b-a;let s=stairs.get(a);if(s&&stairOK(s,d,hb))return true;s=stairs.get(b);return !!(s&&stairOK(s,-d,ha))}
function blk(tx,ty,i,j){if(solid(i,j))return true;const a=ty*TW+tx,b=j*TW+i;if(HT[a]===HT[b])return false;if(i!==tx&&j!==ty)return true;return !canStep(a,b)}
function bfsW(seeds,pl,x0,y0,w,h){x0=Math.max(0,x0);y0=Math.max(0,y0);w=Math.min(w,TW-x0);h=Math.min(h,TH-y0);ensureRect(x0,y0,w,h);gateSolid=!pl;
 const F=new Uint16Array(w*h).fill(65535),Q=new Int32Array(w*h);let hd=0,tl=0;
 for(const[sx,sy]of seeds){if(sx<x0||sy<y0||sx>=x0+w||sy>=y0+h)continue;const k=(sy-y0)*w+sx-x0;if(F[k]===0)continue;F[k]=0;Q[tl++]=k}
 while(hd<tl){const k=Q[hd++],lx=k%w,ly=(k/w)|0,tx=lx+x0,ty=ly+y0,d=F[k]+1,a=ty*TW+tx;
  for(const[dx,dy]of D4){const nx=lx+dx,ny=ly+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx;if(F[n]!==65535)continue;const gx=tx+dx,gy=ty+dy;if(solid(gx,gy)||!canStep(a,gy*TW+gx))continue;F[n]=d;Q[tl++]=n}}
 gateSolid=true;return{F,x0,y0,w,h}}
const fv=(S,x,y)=>S&&S.list?S.list.reduce((m,q)=>Math.min(m,fv(q,x,y)),65535):!S||x<S.x0||y<S.y0||x>=S.x0+S.w||y>=S.y0+S.h?65535:S.F[(y-S.y0)*S.w+x-S.x0];
function freeTile(tx,ty){for(let r=0;r<=4;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;if(!solid(tx+i,ty+j))return[tx+i,ty+j]}return null}
/* ---- stairs & ground leveling ---- */
function stairInfo(tx,ty){const i=ty*TW+tx;if(solid(tx,ty)||stairs.has(i)||pth[i])return null;let best=null;
 for(const ax of[0,1]){const a=ax?[tx,ty-1]:[tx-1,ty],b=ax?[tx,ty+1]:[tx+1,ty];if(solid(a[0],a[1])||solid(b[0],b[1]))continue;
  const ha=HT[a[1]*TW+a[0]],hb=HT[b[1]*TW+b[0]],df=Math.abs(ha-hb);if(df<1||df>12)continue;
  const lo=Math.min(ha,hb),sc=(HT[i]===lo?0:1)*100+df;if(!best||sc<best.sc)best={ax,sg:hb>ha?1:-1,lo,hi:Math.max(ha,hb),sc}}
 return best}
const LVO=new Map();
function levelGround(tx,ty,sz,h0){const adj=(x,y)=>D4.some(([dx,dy])=>stairs.has((y+dy)*TW+x+dx));
 for(let j=ty-1;j<=ty+sz;j++)for(let i=tx-1;i<=tx+sz;i++){const k=j*TW+i;if(!gOK(i,j))continue;const inside=i>=tx&&i<tx+sz&&j>=ty&&j<ty+sz;
  if(inside){if(HT[k]!==h0){const lv=LVO.get(k);LVO.set(k,{o:lv?lv.o:HT[k],h:h0});HT[k]=h0;markT(i,j)}continue}
  if(ter[k]!==0||occ.has(k)||stairs.has(k))continue;if(Math.abs(HT[k]-h0)===1)TFL[k]=1}}
let started=false,inGame=false,showMap=false,spd=1,paused=false,diffI=1,bannerT=0,bannerS='',bannerS2='',kills=0,best={w:0,k:0},clockT=0,camSave=null;
const DIFFS=[{n:'Normal',zm:1,tm:1,g:200,first:600}],D_=()=>DIFFS[0];
try{diffI=0;best=JSON.parse(localStorage.getItem('dk_best')||'{"w":0,"k":0}')}catch(e){}
