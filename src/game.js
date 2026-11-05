const REALR=Math.random,MP={on:false,conn:false,host:false,ex:false};let UID=0,SID=0,CS2=null,SITE2=null,SITEH=null,PKROT=0,CROT=0;
const GVER='v55';const cv=document.getElementById('c'),cw=document.getElementById('cw'),cwx=cw.getContext('2d');let ctx=cv.getContext('2d');
const TW=2250,TH=1250,TS=40,W=TW*TS,H=TH*TS,N=TW*TH;
const T={cannon:{r:9,hp:180,spd:62,dmg:45,rng:520,cdt:5.5,col:'#4a4a50'},peasant:{r:5,hp:30,spd:120,col:'#d9a65a'},knight:{r:10,hp:130,spd:110,dmg:16,rng:14,cdt:.8,col:'#4a7bd8'},archer:{r:6,hp:45,spd:100,dmg:9,rng:120,cdt:1,col:'#4caf50'},zombie:{r:6,hp:55,spd:150,dmg:7,rng:10,cdt:1.1,col:'#7fae5a'},bannerman:{r:6,hp:85,spd:104,dmg:5,rng:12,cdt:1.2,col:'#e8c040'},captain:{r:9,hp:230,spd:108,dmg:22,rng:15,cdt:.85,col:'#f0b830'},runner:{r:5,hp:34,spd:215,dmg:5,rng:10,cdt:.8,col:'#c8785a'},husk:{r:4,hp:24,spd:158,dmg:3,rng:9,cdt:1,col:'#9ab87a'},brute:{r:11,hp:430,spd:112,dmg:26,rng:15,cdt:1.5,col:'#5f8a4a'},king:{r:11,hp:950,spd:100,dmg:44,rng:17,cdt:.9,col:'#3f6fd0'},guard:{r:9,hp:340,spd:100,dmg:26,rng:28,cdt:1.1,col:'#3f6fd0'}};
/* cinematic state (declared early: reset() touches it) */

Object.assign(T,{bomber:{r:7,hp:90,spd:120,dmg:4,rng:10,cdt:1.2,col:'#a08a3a'},acid:{r:6,hp:60,spd:135,dmg:6,rng:115,cdt:2.4,col:'#9ac23a'},miner:{r:6,hp:120,spd:140,dmg:10,rng:10,cdt:1.1,col:'#8a6a4a'}});
const C={cannon:{g:200,w:80,s:60,f:40},peasant:{g:60,f:25},knight:{g:150,s:30,f:40},archer:{g:120,w:30,f:30},bannerman:{g:110,w:40,f:35},captain:{g:220,s:60,f:60},king:{g:450,s:120,f:90},guard:{g:120,s:20,f:30},wall:{w:12},gate:{w:25},tower:{w:50},barracks:{w:100},upgrade:{s:200,w:100},ballista:{w:100,s:80},trebuchet:{w:160,s:220},raise:{},dig:{},ramp:{},demolish:{},tier:{},path:{w:3},};
const TRAIN={cannon:30,peasant:9,knight:22,archer:16,bannerman:20,captain:32,king:40,guard:18},BT={barracks:40,wall:8,gate:14,tower:34,ballista:24,trebuchet:46},SZ={trebuchet:2},GCAP={wall:1,gate:2,tower:3},GRNG={wall:1.6,gate:1.6,tower:2.3},GTOP={wall:1.8,gate:2.1,tower:3.28};
const CWOOD={wall:{w:12},gate:{w:25},tower:{w:50},barracks:{w:100},path:{w:3}},CSTONE={wall:{s:30},gate:{w:30,s:40},tower:{w:80,s:120},barracks:{w:70,s:90},path:{s:2}},RS={done:false,on:false,t:0},RT_TIME=45,UPC={barracks:{s:70},wall:{s:30},gate:{s:70},tower:{s:140,w:20},castle:{s:300,w:100},house:{s:40},farm:{s:20},storage:{s:40},academy:{s:80},market:{s:60},forester:{s:30},guild:{s:60}},SH={wall:400,tower:520,gate:360,barracks:700,castle:3000,ballista:260,trebuchet:420},GET={g:10,w:8,s:7},CODE={g:4,w:2,s:3},WORK=4.5;
function hyp(a,b){return Math.sqrt(a*a+b*b)}
const rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b,c,d)=>hyp(a-c,b-d);
function hs(x,y,s){let h=Math.imul((x*16)|0,0x27d4eb2d)^Math.imul((y*16)|0,0x165667b1)^Math.imul((s*1024)|0,0x2c1b3c6d);h^=h>>>15;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return(h>>>0)/4294967296}
function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hs(xi,yi,s),b=hs(xi+1,yi,s),c=hs(xi,yi+1,s),d=hs(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fb=(x,y,s)=>vn(x,y,s)*.6+vn(x*2.1,y*2.1,s+9)*.3+vn(x*4.3,y*4.3,s+19)*.1;
const hex=c=>c.length===4?[parseInt(c[1]+c[1],16),parseInt(c[2]+c[2],16),parseInt(c[3]+c[3],16)]:[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function rngf(s){s=(s>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

Object.assign(C,{storage:{w:40},ramp:{},farm:{w:60},iron:{g:200,s:60},plate:{g:260,s:120},drill:{g:180,w:80}});Object.assign(CWOOD,{farm:{w:60},storage:{w:40}});Object.assign(CSTONE,{farm:{w:50,s:20},storage:{w:30,s:15}});Object.assign(BT,{farm:26,storage:20});Object.assign(SH,{farm:260,storage:300});
const RS2={on:null,t:0,done:{iron:false,plate:false,drill:false,steel:false,mail:false,tools:false,harvest:false,fletch:false,bastion:false}},RT2={iron:40,plate:50,drill:35,steel:60,mail:70,tools:30,harvest:40,fletch:45,bastion:60},RN2={iron:'Iron weapons',plate:'Plate armor',drill:'Drill training',steel:'Steel weapons',mail:'Chain mail',tools:'Better tools',harvest:'Crop rotation',fletch:'Fletching',bastion:'Bastion walls'},RPRE={steel:'iron',mail:'plate',bastion:'masonry'};
Object.assign(C,{steel:{g:320,s:120},mail:{g:380,s:160},tools:{g:100,w:120},harvest:{g:150,w:100},fletch:{g:200,w:120},bastion:{g:300,s:200},house:{w:50},rally:{},rallyc:{},repair:{},academy:{g:80,w:120}});Object.assign(CWOOD,{house:{w:50},academy:{g:80,w:120}});Object.assign(CSTONE,{house:{w:40,s:20},academy:{g:80,w:80,s:40}});Object.assign(BT,{house:22,academy:40});Object.assign(SH,{house:280,academy:420});
Object.assign(C,{market:{w:120},torch:{w:10}});Object.assign(BT,{market:30,torch:6});Object.assign(SH,{market:320,torch:90});
Object.assign(C,{forester:{w:45},guild:{w:90,g:40}});Object.assign(BT,{forester:20,guild:32});Object.assign(SH,{forester:260,guild:420});
Object.assign(C,{movec:{g:100,w:150},rotate:{}});Object.assign(SZ,{keep:2});Object.assign(SH,{keep:2400});Object.assign(BT,{keep:30});Object.assign(GCAP,{keep:12,tower:4});Object.assign(GRNG,{keep:2.8});Object.assign(GTOP,{keep:3.7});UPC.keep={s:360,w:80};const ROTT=new Set(['barracks','farm','storage','house','academy','market','forester','guild','tower','keep','castle']),DIR4=[[0,1],[1,0],[0,-1],[-1,0]];
const FOOD0=150,FARMT=6,FARMY=6,POPBASE=18,POPHOUSE=6,POPMAX=120,RALLY=[null,null],RALLYC=[null,null],RANKN=['','Veteran','Elite','Champion'];
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
/* ================= GAME LOGIC ================= */
let units,structs,res,fx,pt,over,time,waveT,waveI=160,waveN,nextL,queue,mode,last,CS,fdT=0,fdDirty=true,ver=0,ptr=null,box=null,panMode=false,mouse={x:-1,y:-1},keys={},UIS=2,DPR=1,msgT=0,msgS='';
const PAL=[['Azure','#3f6fd0','#8ab4ff'],['Crimson','#c8353a','#ff9a8a'],['Emerald','#2f9a55','#8be0a8'],['Amber','#d9a020','#ffe08a'],['Violet','#7a48c8','#c8a8ff'],['Teal','#1f9aa8','#8ae8f0'],['Ember','#e0702a','#ffc08a'],['Night','#3a3f4c','#c4cad8'],['Rose','#d0507e','#ffb0cc'],['Forest','#2c6a34','#9ad49a'],['Gold','#c9a227','#fff0a0'],['Ivory','#d8cfb8','#fffaf0'],['Sky','#4aa8e0','#c0e8ff'],['Wine','#7a2338','#e08aa0']];
const KNAMES=['Ashvale','Brightmoor','Crowhold','Dunhaven','Eldermere','Frostmark','Goldcrest','Highwatch','Ironvale','Oakenshield','Stormreach','Whitecliff','Redmere','Silverfen'];
let THEME={n:KNAMES[(Math.random()*KNAMES.length)|0],c:0,e:0,c2:10,p:0};
try{const t=JSON.parse(localStorage.getItem('dk_theme')||'null');if(t&&typeof t.n==='string')THEME={n:t.n.slice(0,18),c:Math.abs(t.c|0)%PAL.length,e:Math.abs(t.e|0)%16,c2:t.c2==null?10:Math.abs(t.c2|0)%PAL.length,p:Math.abs(t.p|0)%8}}catch(e){}
const thp=()=>PAL[THEME.c][1],ths=()=>PAL[THEME.c][2],thd=()=>{const h=hex(PAL[THEME.c][1]);return '#'+h.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join('')};
const HEAL_R=7*TS,HEAL_RATE=5;

let gateAx=0,gateLen=3,buildRot=0,formType=0,lastFm=0;const FORMS=['None','Line','Block','Wedge','Ring'];
const tfo=new Map();

function gateAxAt(tx,ty){return buildRot&1;const w=(x,y)=>isW(x,y);if(w(tx-1,ty)||w(tx+2,ty)||w(tx-1,ty)&&w(tx+2,ty))if(!(w(tx,ty-1)||w(tx,ty+1)))return 0;if(w(tx,ty-1)||w(tx,ty+2))if(!(w(tx-1,ty)||w(tx+1,ty)))return 1;return buildRot&1}
function tilesFor(type,tx,ty,sz,ax,gl){if(type==='gate'){gl=gl||gateLen;const t=[];for(let k=0;k<gl;k++)t.push(ax?[tx,ty+k]:[tx+k,ty]);return t}const t=[];for(let j=0;j<sz;j++)for(let i=0;i<sz;i++)t.push([tx+i,ty+j]);return t}
function gateOK(tx,ty,ax,gl){const t=tilesFor('gate',tx,ty,1,ax,gl),hs=t.map(([x,y])=>HT[y*TW+x]);return t.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs)-Math.min(...hs)<=2}
function mk(t,type,tx,ty,sz,done,ax,gl){gl=type==='gate'?(gl||2):0;const tiles=tilesFor(type,tx,ty,sz,ax,gl),g=type==='gate',s={sid:++SID,pl:CURPL,t,type,tx,ty,sz,tiles,ax:ax||0,gl,rot:t===0&&type!=='castle'&&ROTT.has(type)?(buildRot&3):0,rad:g?20*gl:sz*20,x:g?(tx+(ax?.5:gl/2))*TS:(tx+sz/2)*TS,y:g?(ty+(ax?gl/2:.5))*TS:(ty+sz/2)*TS,hp:SH[type],max:SH[type],cd:0,prog:done?1:0,bt:BT[type]||1};
 s.tier=1;if(t===0)s.cost={...(C[type]||{})};if(t===0&&type!=='ballista'&&type!=='trebuchet'&&type!=='torch'&&type!=='keep'&&!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower'))){s.tier=0;s.max=Math.round(s.max*.5);s.hp=s.max}if(!done){s.hp=s.max*.12;if(t===0){msgS='Peasants must build it: right-click the site';msgT=4}}structs.push(s);for(const[x,y]of tiles)occ.set(y*TW+x,s);fdDirty=true;return s}
/* only our units belong to a player; zombies and AI units are created during the simulation, where CURPL is the local player
   (0 on the host, 1 on the guest), so they would otherwise carry a different owner on each machine */
function mkU(t,type,x,y,jb,lane){return{uid:++UID,pl:t===0?CURPL:0,spj:.88+Math.random()*.24,gar:null,buff:1,t,type,x,y,hp:T[type].hp,cd:0,carry:false,cj:null,work:0,job:jb||null,cap:null,sq:null,hc:0,tl:-1,sel:false,o:null,px:x,py:y,sT:.6,det:0,dir:1,mv:false,walk:0,face:0,atk:0,ph0:Math.random()*9,lane:lane==null?-1:lane,ph:0}}
function pickLanes(){const n=Math.min(3,1+(waveN>2?1:0)+(waveN>6?1:0)+(Math.random()<.25?1:0)),A=[0,1,2].sort(()=>Math.random()-.5).slice(0,n);if(!SITE2)return A;const n2=Math.min(3,1+(waveN>2?1:0)+(waveN>6?1:0)+(Math.random()<.25?1:0));return A.concat([3,4,5].sort(()=>Math.random()-.5).slice(0,n2))}
function reset(){SIMTK=0;FGS=[];FORCEF=null;PUD.length=0;SCRT.clear();LVO.clear();shelOn=false;shelRel=0;for(const o of ROLE.concat(RHAS))o.b=o.r=o.t=0;roleT=0;SAPL.clear();PRES.clear();saplT=0;swReset();hordeT=-1e9;hordeOn=false;waveOn=false;burnAt=0;hordeD=1e9;nightLv=0;nightCk=0;waveST=-1e9;LITL=[];darkT=0;Object.assign(PRICE,PBASE);priceT=0;syncTradeC();CLM.clear();ACH.clear();WAVEZ=0;TOASTS.length=0;RALLY[0]=RALLY[1]=RALLYC[0]=RALLYC[1]=null;RS2.on=null;RS2.t=0;for(const k in RS2.done)RS2.done[k]=false;ALERTS.length=0;alertT=0;farmT=0;UID=0;SID=0;BAD.clear();fowReset();RS.done=false;RS.on=false;RS.t=0;Object.assign(C,CWOOD);BTIER=1;selB=null;if(ICR){icoPart('tier');icoPart('units')}tfo.clear();campT=0;units=[];structs=[];fx=[];pt=[];queue=[];RESP=[{g:D_().g,w:0,s:0,f:FOOD0},{g:D_().g,w:0,s:0,f:FOOD0}];setPl(0);over=false;time=0;waveT=waveI=D_().first;kills=0;paused=false;bannerT=0;waveN=0;mode=null;GF.clear();for(const k in RL)delete RL[k];
 initWorld();CS2=null;CS=mk(0,'castle',CX-2,CY-2,5,true);CS.rot=castleRotAt(CS,CROT);if(SITE2){ensureAround(SITE2.tx,SITE2.ty,3);setPl(1);CS2=mk(0,'castle',SITE2.tx-2,SITE2.ty-2,5,true);CS2.rot=castleRotAt(CS2,SITE2.rot|0);setPl(0)}nextL=pickLanes();calcFD();initAI();
 ['g','w','s'].forEach(j=>spawn(0,'peasant',1,j));if(CS2){setPl(1);['g','w','s'].forEach(j=>spawn(0,'peasant',1,j,CS2));setPl(0)}build3D();home()}
let shakeT=0;
function puff(x,y,c,n,sp,o){if(pt.length>760)return;o=o||{};const soft=o.soft!==undefined?!!o.soft:(o.g!==undefined&&o.g<=0&&(o.s||0)>=.1&&!GLC[c]);for(let i=0;i<(n||8);i++){const a=Math.random()*6.28,s=rnd(.3,1)*(sp||60);pt.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:o.T||.6,T:o.T||.6,c,z:o.z,vz:o.vz?o.vz*rnd(.6,1.2):0,g:o.g||0,s:o.s,soft,sp:rnd(-5,5)})}}
const SLOWK=.22;
const spark=(x,y,z)=>puff(x,y,'#ffe9a0',5,90,{T:.28,z:z||.6,vz:3,g:12,s:.07});
const blood=(x,y,c)=>puff(x,y,c,6,60,{T:.5,z:.5,vz:2.5,g:10,s:.08});
const dust=(x,y)=>puff(x,y,'#b9a98a',2,22,{T:.55,z:.1,vz:.8,g:-.4,s:.14});
const smoke=(x,y,z)=>puff(x,y,'#5a5a60',1,12,{T:1.6,z:z||2,vz:1.2,g:-.2,s:.38});
const ember=(x,y)=>puff(x,y,'#ff8a2a',3,40,{T:1.0,z:.6,vz:2,g:-.4,s:.09});
function ring(x,y,c,n,sp){puff(x,y,c,n||18,sp||220,{T:.45,z:.15,vz:.1,s:.16})}
const shake=v=>{shakeT=Math.max(shakeT,v)};
function spawnPos(s){if(s.type==='castle'&&s.tiles){const D=doorTiles(s,1).filter(([x,y])=>!solid(x,y));if(D.length){const[x,y]=D[(Math.random()*D.length)|0];return{x:(x+.5)*TS+rnd(-8,8),y:(y+.5)*TS+rnd(-8,8)}}}
 for(let k=0;k<40;k++){const a=Math.random()*6.28,r=s.rad+24,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(!solidAt(x,y)&&(k>30||fv(FP,Math.floor(x/TS),Math.floor(y/TS))<65535))return{x,y}}return{x:s.x,y:s.y}}
function spawn(t,type,free,jb,cc){const p=spawnPos(cc||CS);units.push(mkU(t,type,p.x,p.y,jb))}
let selB=null,pendB=false,castleSel=false,SELBS=[],lastClkB=0,lastTyB='';
/* double click on a building selects all of yours of that type (SELBS); it holds while selB is one of them */
const selBs=()=>selB&&SELBS.length>1&&SELBS.includes(selB)?SELBS.filter(s=>structs.includes(s)&&s.hp>0&&s.prog>=1):[];const TRB=new Set(['barracks','academy','market','guild','castle']),curB=()=>selB&&structs.includes(selB)&&selB.prog>=1&&(!MP.on||(selB.pl|0)===CURPL)&&TRB.has(selB.type)?selB:HOMEC();
/* ================= MARKET: sell wood / stone for gold, buy them back; prices move with every trade and drift back ================= */
const PBASE={w:1,s:1.3,f:.8},PRICE={w:1,s:1.3,f:.8},TRADEK=new Set(['sellw','sells','buyw','buys','sellf','buyf']);let priceT=0;
const tradeGain=k=>Math.max(1,Math.round(50*PRICE[k]*.8)),tradeCost=k=>Math.max(1,Math.round(50*PRICE[k]*1.25));
function syncTradeC(){C.sellw={w:50};C.sells={s:50};C.sellf={f:50};C.buyw={g:tradeCost('w')};C.buys={g:tradeCost('s')};C.buyf={g:tradeCost('f')}}syncTradeC();
function hasMarket(p){p|=0;for(const s of structs)if(s.t===0&&s.type==='market'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)return true;return false}
function trade(k){if(over||!TRADEK.has(k))return;if(!hasMarket(CURPL)){msgS='Build a Market to trade';msgT=3;snd('err');return}const r=k[k.length-1],nm=r==='w'?'wood':r==='f'?'food':'stone';
 if(k[0]==='s'){if(res[r]<50){msgS='You need 50 '+nm+' to sell';msgT=2.5;snd('err');return}const g=tradeGain(r);res[r]-=50;res.g+=g;PRICE[r]=Math.max(.3,PRICE[r]*.95);msgS='Sold 50 '+nm+' for '+g+' gold'}
 else{const c=tradeCost(r);if(res.g<c){msgS='You need '+c+' gold to buy 50 '+nm;msgT=2.5;snd('err');return}res.g-=c;res[r]+=50;PRICE[r]=Math.min(4,PRICE[r]*1.05);msgS='Bought 50 '+nm+' for '+c+' gold'}
 msgT=2.5;snd('coin');syncTradeC()}
function priceTick(dt){priceT-=dt;if(priceT>0)return;priceT=5;let ch=0;for(const k in PBASE){const d=PBASE[k]-PRICE[k];if(Math.abs(d)>.002){PRICE[k]+=d*.12;ch=1}}if(ch)syncTradeC()}
function hasAcademy(p){p|=0;for(const s of structs)if(s.t===0&&s.type==='academy'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)return true;return false}
const popOf=t=>t==='cannon'?2:t==='king'?3:t==='guard'?0:1;
/* the king of player p (one at most) and what the castle offers: the king, or a guard to refill his escort */
const royalOf=p=>{p|=0;for(const k of units)if(k.t===0&&k.type==='king'&&k.hp>0&&(k.pl|0)===p)return k;return null};
function royalBtns(){const p=CURPL|0,K=royalOf(p);if(!K)return queue.some(q=>q.type==='king'&&(q.b.pl|0)===p)?[]:['king'];const n=(K.sq?K.sq.length:0)+queue.filter(q=>q.type==='guard'&&(q.b.pl|0)===p).length;return n<2?['guard']:[]}
function popUsed(p){p|=0;let n=0;for(const u of units)if(u.t===0&&u.hp>0&&(u.pl|0)===p)n+=popOf(u.type);for(const q of queue)if((q.b.pl|0)===p)n+=popOf(q.type);return n}
function popCap(p){p|=0;let n=0;for(const s of structs)if(s.t===0&&s.type==='house'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)n++;return Math.min(POPMAX,POPBASE+n*POPHOUSE)}
function train(type){const b=curB();if(b.type==='academy'||b.type==='market'||b.type==='guild')return;if(type==='cannon'&&!RS.done){msgS='The cannon needs Stonemasonry';msgT=3;snd('err');return}if(!over&&popUsed(CURPL)+popOf(type)>popCap(CURPL)){msgS='Population limit: build houses';msgT=3;snd('err');return}if(type==='king'||type==='guard'){if(b.type!=='castle'){msgS='The king is summoned at your castle';msgT=3;snd('err');return}const p=CURPL|0,K=royalOf(p);
  if(type==='king'&&(K||queue.some(q=>q.type==='king'&&(q.b.pl|0)===p))){msgS='Your kingdom already has a king';msgT=3;snd('err');return}
  if(type==='guard'){if(!K){msgS='Royal guards serve King Naraige: summon him first';msgT=3;snd('err');return}if((K.sq?K.sq.length:0)+queue.filter(q=>q.type==='guard'&&(q.b.pl|0)===p).length>=2){msgS='King Naraige already has his 2 royal guards';msgT=3;snd('err');return}}}
 else if(type!=='peasant'&&b.type==='castle'){msgS='Units are trained in a Barracks: build one, then click it';msgT=3;snd('err');return}if(over||queue.filter(q=>q.b===b).length>=6)return;if(!ok(C[type])){if((C[type].f||0)>(res.f||0)&&CURPL===LPL()){msgS='Not enough food: build farms and put a peasant on each';msgT=3;snd('err')}return}pay(C[type]);const tt=TRAIN[type]*(b.type==='castle'?1:.65)*(RS2.done.drill?.75:1);queue.push({type,left:tt,tot:tt,b})}
const ok=c=>Object.entries(c).every(([k,v])=>res[k]>=v),pay=c=>Object.entries(c).forEach(([k,v])=>res[k]-=v);
/* the rotation chosen when placing a castle, or the next one (clockwise) whose door opens on free ground */
function castleRotAt(c,want){for(let k=0;k<4;k++){const r=(want+k)&3;if(doorTiles({tx:c.tx,ty:c.ty,sz:5,rot:r},1).every(([x,y])=>gOK(x,y)&&!solid(x,y)&&!stairs.has(y*TW+x)))return r}return want&3}
function doorTiles(c,depth){const[dx,dy]=DIR4[(c.rot|0)&3],t=[],z=c.sz||3,a0=(z-3)>>1;for(let a=a0;a<a0+3;a++)for(let d=0;d<depth;d++){if(dy)t.push([c.tx+a,dy>0?c.ty+z+d:c.ty-1-d]);else t.push([dx>0?c.tx+z+d:c.tx-1-d,c.ty+a])}return t}
const inDoor=(tx,ty)=>{for(const c of[CS,CS2])if(c&&c.type==='castle'&&doorTiles(c,1).some(([x,y])=>x===tx&&y===ty))return true;return false};
function pathOK(tx,ty){const i=ty*TW+tx;return gOK(tx,ty)&&ter[i]===0}
const UNIQB={guild:'Guild',academy:'Academy'};
function placeErr(type,tx,ty){if(UNIQB[type]){for(const s of structs)if(s.t===0&&s.type===type&&s.hp>0&&(s.pl|0)===(CURPL|0))return 'Only one '+UNIQB[type]+' per kingdom'}
 if(type==='forester'){const cx=tx+1,cy=ty+1;for(const s of structs)if(s.t===0&&s.type==='forester'&&s.hp>0&&Math.hypot(s.tx+1-cx,s.ty+1-cy)<2*FOR_R+1)return 'Too close to another forester: their planting areas would touch'}return ''}
function valid(tx,ty){return !solid(tx,ty)&&!inDoor(tx,ty)&&!stairs.has(ty*TW+tx)}
let alertT=0,farmT=0;const ALERTS=[];
function startResearch2(k){if(over||RS2.done[k])return;if(RS2.on){msgS='One research at a time: '+RN2[RS2.on]+' is in progress';msgT=3;snd('err');return}if(!hasAcademy(CURPL)){msgS='Build an Academy to research';msgT=3;snd('err');return}if(RPRE[k]&&!(RPRE[k]==='masonry'?RS.done:RS2.done[RPRE[k]])){msgS=RN2[k]+' needs '+(RPRE[k]==='masonry'?'Stonemasonry':RN2[RPRE[k]]);msgT=3;snd('err');return}if(!ok(C[k])){msgS=RN2[k]+' is too expensive';msgT=3;snd('err');return}pay(C[k]);RS2.on=k;RS2.t=0;snd('build');msgS='Researching '+RN2[k]+'...';msgT=3}
function farmCount(p){let n=0;for(const s of structs)if(s.t===0&&s.type==='farm'&&s.prog>=1&&(p===undefined||(s.pl|0)===p))n++;return n}
function extraSim(dt){{for(const s of structs)if(s.rally&&s.t===0&&(s.pl|0)===LPL()&&(s.type!=='barracks'||s===selB)&&REALR()<dt*.9)puff(s.rally.x,s.rally.y,'#7dffa0',2,26)}if(alertT>0)alertT-=dt;for(let i=ALERTS.length-1;i>=0;i--){ALERTS[i].t-=dt;if(ALERTS[i].t<=0)ALERTS.splice(i,1)}
 if(RS2.on){RS2.t+=dt;if(RS2.t>=RT2[RS2.on]){const k=RS2.on;RS2.done[k]=true;if(k==='plate'||k==='mail')setTimeout(()=>{try{icoPart('units')}catch(e){}},0);ach('res');RS2.on=null;snd('fanfare');bannerT=4;bannerS=RN2[k].toUpperCase();bannerS2=({iron:'Your soldiers hit 25% harder',plate:'Your side takes 22% less damage',drill:'Units train 25% faster',steel:'Your soldiers hit 20% harder again',mail:'Your side takes 15% less damage again',tools:'Peasants gather 33% faster',harvest:'Farms yield 50% more food',fletch:'Archers and towers hit 25-40% harder',bastion:'Buildings have 40% more strength'})[k]}else{msgS='Researching '+RN2[RS2.on]+' '+Math.floor(RS2.t/RT2[RS2.on]*100)+'%';msgT=1}}
}
function startResearch(){if(RS.done||RS.on||over)return;if(!hasAcademy(CURPL)){msgS='Build an Academy to research';msgT=3;snd('err');return}if(!ok(C.upgrade)){msgS='Stonemasonry needs 200 stone and 100 wood';msgT=3;snd('err');return}pay(C.upgrade);RS.on=true;RS.t=0;snd('build');msgS='Researching Stonemasonry...';msgT=3}
function finishResearch(){ach('res');RS.done=true;RS.on=false;Object.assign(C,BTIER?CSTONE:CWOOD);setTimeout(()=>{try{icoPart('tier')}catch(e){}},0);snd('horn');bannerT=5;bannerS='STONE AGE';bannerS2='Select a building and press Upgrade, or use the Stone upgrade tool'}
function doUpgrade(tx,ty){const o=occ.get(ty*TW+tx);if(!o||o.t!==0||o.tier!==0||o.prog<1)return;if(!RS.done){msgS='Stone upgrades need Stonemasonry (Academy)';msgT=3;snd('err');return}const c=UPC[o.type];if(!c)return;if(!ok(c)){msgS='Not enough resources to upgrade';msgT=2;snd('err');return}pay(c);const r=o.hp/o.max;o.max=SH[o.type];o.hp=Math.round(o.max*r);o.tier=1;buildStructMesh(o);refreshNear(o);puff(o.x,o.y,'#d9d9d9',12,80);snd('build',o.x,o.y)}
function build(type,tx,ty){if(type==='upgrade'){if(!over)doUpgrade(tx,ty);return}if(over||!ok(C[type]))return;
 if(type==='tower'){const t=tilesFor('tower',tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y))))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;
  let rep=0;for(const[x,y]of t){const w=wallAt(x,y);if(!w)continue;rep++;if(w.garr)w.garr.slice().forEach(ungar);const Rr=RESP[w.pl|0];for(const k in(w.cost||{}))Rr[k]+=w.cost[k];w.hp=-1;w.noCrumble=true;rmStruct(w);for(const[a,b]of w.tiles)if(occ.get(b*TW+a)===w)occ.delete(b*TW+a);structs.splice(structs.indexOf(w),1);refreshNear(w)}
  if(rep){fdDirty=true;if(!MP.on||CURPL===LPL()){msgS='Walls replaced by the tower (refunded)';msgT=3}}
  pay(C.tower);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,'tower',tx,ty,2,false);if(rep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}if((type==='ballista'||type==='trebuchet')&&!RS.done){msgS='Siege weapons need Stonemasonry';msgT=3;snd('err');return}if(type==='upgrade'){doUpgrade(tx,ty);return}const i=ty*TW+tx;const wRep=type==='tower'?wallAt(tx,ty):null;if(type==='ballista'||type==='trebuchet'||type==='raise'||type==='dig'||type==='ramp'||type==='demolish'||type==='rallyc'||type==='rotate'||type==='movec'||wRep){}else if(type==='path'){if(!pathOK(tx,ty))return}else if(!valid(tx,ty))return;
 if(type==='rotate'){rotateB(occ.get(i));return}
 if(type==='movec'){moveCastle(tx,ty);return}
 if(type==='ballista'||type==='trebuchet'){const o=occ.get(i);if(!o||o.type!=='tower'||o.t!==0||o.prog<1){msgS='Mount it on a finished tower';msgT=3;snd('err');return}if(o.weapon){msgS='This tower already has a siege weapon';msgT=3;snd('err');return}pay(C[type]);o.weapon=type;o.aim=buildRot*Math.PI/2;o.wcd=2;buildStructMesh(o);puff(o.x,o.y,'#c9c9c9',10,70);snd('build',o.x,o.y);return}
 if(type==='raise'||type==='dig'||type==='ramp'){tfOrder(type,tx,ty);return}
 if(type==='demolish'&&!occ.get(i)&&pth[i]){pth[i]=0;const Rr=RESP[CURPL|0];for(const k in C.path)Rr[k]+=C.path[k];mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#b9a68a',3,30);snd('click');if(CURPL===LPL()){msgS='Path removed';msgT=2}return}
 if(type==='demolish'&&!occ.get(i)&&stairs.has(i)){const G=rampGroup(i);const q=G.find(k=>tfo.has(k));if(q!==undefined){tfo.delete(q);snd('click');return}tfo.set(i,{t:'unramp',w:0});snd('click');msgS='Peasants will remove this ramp';msgT=3;return}
 if(type==='demolish'){const o=occ.get(i);if(!o||o.t!==0||o===CS||o===CS2||o.type==='castle'||(MP.on&&(o.pl|0)!==CURPL)){msgS='Click one of your buildings (not the castle)';msgT=2;snd('err');return}if(o.prog<1){demolish(o);if(CURPL===LPL()){msgS='Construction cancelled: resources refunded';msgT=3}return}o.dem=!o.dem;o.dp=0;snd('click');if(o.dem){msgS='Peasants will tear it down and recover 100% of the cost';msgT=3}return}
 if(false){const sz=SZ[type],t=tilesFor(type,tx,ty,sz),h0=Math.max(...t.map(([x,y])=>HT[y*TW+x]));pay(C[type]);levelGround(tx,ty,sz,h0);const s=mk(0,type,tx,ty,sz,false);addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});return}
 if(type==='rally'||type==='rallyc'){const w={x:(tx+.5)*TS,y:(ty+.5)*TS};const rs=type==='rallyc'&&({2:1,3:1,4:1})[ter[ty*TW+tx]];if(!gOK(tx,ty)||(solid(tx,ty)&&!rs))return;
  let rb=null;if(type==='rallyc')rb=selB&&selB.type==='castle'&&structs.includes(selB)?selB:HOMEC();
  else{rb=selB&&selB.type==='barracks'&&structs.includes(selB)&&(selB.pl|0)===(CURPL|0)?selB:null;if(!rb){let bd=1e12;for(const s of structs)if(s.t===0&&s.type==='barracks'&&s.prog>=1&&(s.pl|0)===(CURPL|0)){const d=dist(s.x,s.y,w.x,w.y);if(d<bd){bd=d;rb=s}}}}
  if(!rb){if(CURPL===LPL()){msgS='Build a barracks first';msgT=3;snd('err')}return}rb.rally=w;
  if(CURPL===LPL()){msgS=type==='rally'?'Rally point set for this barracks':rs?'Castle rally: new peasants gather this resource':'Castle rally point set';msgT=3;mode=null}snd('order');puff(w.x,w.y,'#7dffa0',10,50);return}
 if(type==='house'||type==='farm'||CONNT.has(type)){const sp=snapM(type,tx,ty);tx=sp[0];ty=sp[1]}
 if(type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'){{const pe=placeErr(type,tx,ty);if(pe){if(!MP.on||CURPL===LPL()){msgS=pe;msgT=3;snd('err')}return}}const t=tilesFor(type,tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&valid(x,y)))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;pay(C[type]);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,type,tx,ty,2,false);addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='gate'){const ax=gateAxAt(tx,ty),gl=gateLen;if(!gateOK(tx,ty,ax,gl))return;pay(C.gate);const t=tilesFor('gate',tx,ty,1,ax,gl),h0=Math.max(...t.map(([x,y])=>HT[y*TW+x]));t.forEach(([x,y])=>levelGround(x,y,1,h0));const s=mk(0,'gate',tx,ty,1,false,ax,gl);s.gate=true;addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',8,60,{soft:1,T:1,s:.38,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='path'){const want=stoneOn()?2:1;if(pth[i]===want)return;pay(C.path);pth[i]=want;mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#d9c9a0',3,30);snd('path',(tx+.5)*TS,(ty+.5)*TS);return}

 if(wRep){if(wRep.garr)wRep.garr.slice().forEach(ungar);const Rr=RESP[wRep.pl|0];for(const k in(wRep.cost||{}))Rr[k]+=wRep.cost[k];wRep.hp=-1;wRep.noCrumble=true;rmStruct(wRep);for(const[x,y]of wRep.tiles)if(occ.get(y*TW+x)===wRep)occ.delete(y*TW+x);structs.splice(structs.indexOf(wRep),1);refreshNear(wRep);fdDirty=true;if(!MP.on||CURPL===LPL()){msgS='Wall replaced by a tower (wall refunded)';msgT=3}}
 pay(C[type]);levelGround(tx,ty,1,HT[i]);const s=mk(0,type,tx,ty,1,false);if(type==='gate')s.gate=true;if(wRep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c9c9',6,50);snd('build',s.x,s.y)}
function wallAt(tx,ty){const o=occ.get(ty*TW+tx);return o&&o.t===0&&o.type==='wall'&&o.prog>=1&&o.hp>0&&(!MP.on||(o.pl|0)===CURPL)?o:null}
const sel=()=>units.filter(u=>u.sel&&(!MP.on||u.t!==0||(u.pl|0)===CURPL));
function tfOK(tx,ty,rmp){if(!gOK(tx,ty))return false;const i=ty*TW+tx;if(rmp&&stairs.has(i)&&!occ.has(i))return true;if(ter[i]>1&&ter[i]!==5||occ.has(i)||stairs.has(i))return false;return !D4.some(([dx,dy])=>{const s=stairs.get(i+dy*TW+dx);return s&&!s.blk})}
function tfOrder(type,tx,ty){const i=ty*TW+tx;if(tfo.has(i)){const o=tfo.get(i);tfo.delete(i);snd('click');return}
 if(type==='ramp'?!rampOK(tx,ty):!tfOK(tx,ty,true)){msgS=type==='ramp'?'No ramp here: free flat ground only':'Cannot reshape this tile';msgT=2;snd('err');return}
 if(type==='raise'&&HT[i]>=LAND+14){msgS='Too high';msgT=2;snd('err');return}
 if(type==='dig'&&ter[i]===1){msgS='Already water';msgT=2;snd('err');return}
 if(type==='dig'&&HT[i]<=BED){msgS='Bedrock: it cannot be dug';msgT=2;snd('err');return}
 tfo.set(i,{t:type,w:0,d:buildRot&3,pl:CURPL|0});snd('click');
 sel().filter(u=>u.type==='peasant').forEach(u=>{u.job='t';u.tl=-1;u.o=null;if(shelOn)u.nso=1})}
function rampGroup(i){const st=stairs.get(i);if(!st)return[];const seen=new Set([i]),Q=[i];while(Q.length){const k=Q.pop();for(const[dx,dy]of D4){const n=k+dy*TW+dx,s2=stairs.get(n);if(s2&&s2.ax===st.ax&&!seen.has(n)){seen.add(n);Q.push(n)}}}return[...seen]}
function unRamp(i){const s0=stairs.get(i),G=s0&&s0.blk?[i]:rampGroup(i);if(!G.length)return;for(const ii of G){const st=stairs.get(ii);HT[ii]=st.orig!==undefined?st.orig:st.hi;stairs.delete(ii);const x=ii%TW,y=(ii/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(ii)}
 fdDirty=true;GF.clear();ver++;const x=i%TW,y=(i/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS);if(!MP.on||CURPL===LPL()){msgS='Ramp removed';msgT=2}}
function doTf(i){const o=tfo.get(i);if(!o)return;tfo.delete(i);const x=i%TW,y=(i/TW)|0;if(o.t==='ramp'){doRamp(x,y,o.d);return}if(o.t==='unramp'){unRamp(i);return}if(stairs.has(i)){unRamp(i);if(o.t==='dig'&&HT[i]<=BED)return}if(o.t==='dig'&&HT[i]<=BED)return;const stn=o.t==='dig'&&HT[i]<=LAND-3;if(o.t==='raise'&&ter[i]===1)HT[i]=LAND;else HT[i]+=o.t==='raise'?1:-1;if(stn){const Rr=RESP[o.pl|0];if(Rr)Rr.s+=4}if(ter[i]!==1)ter[i]=HT[i]>=ROCKH?5:0;TFL[i]=3;
 for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+dx,y+dy)){markT(x+dx,y+dy);markP(x+dx,y+dy)}mmTile(i);fdDirty=true;GF.clear();puff((x+.5)*TS,(y+.5)*TS,stn?'#9a9aa0':'#9d7a50',10,60);snd(stn?'mine':'dirt',(x+.5)*TS,(y+.5)*TS);if(o.t==='dig')flood(i)}
/* water flows into a dry hole that opens next to it: every connected open tile below the water line fills (buildings and resources stay dry) */
function flood(i0){if(ter[i0]!==0||HT[i0]>=WLV||!D4.some(([dx,dy])=>{const x=i0%TW+dx,y=((i0/TW)|0)+dy;return gOK(x,y)&&ter[y*TW+x]===1}))return;
 const seen=new Set([i0]),Q=[i0],F=[];while(Q.length&&F.length<600){const i=Q.shift();F.push(i);const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*TW+nx;if(!gOK(nx,ny)||seen.has(n))continue;seen.add(n);if(ter[n]===0&&HT[n]<WLV&&!occ.has(n)&&!stairs.has(n))Q.push(n)}}
 for(const i of F){ter[i]=1;amt[i]=0;pth[i]=0;SAPL.delete(i);tfo.delete(i);const x=i%TW,y=(i/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(i)}
 const FS=new Set(F);for(const u of units){if(u.hp<=0||u.gar)continue;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(!FS.has(ty*TW+tx))continue;const ft=freeTile(tx,ty);if(ft){u.x=(ft[0]+.5)*TS;u.y=(ft[1]+.5)*TS}}
 fdDirty=true;GF.clear();ver++;const x=i0%TW,y=(i0/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#8fc4e8',14,70,{T:.8,z:.2,vz:1.6,g:6,s:.12});snd('splash',(x+.5)*TS,(y+.5)*TS)}
function tfNear(tx,ty){return true}
function rampFree(i){return ter[i]===0&&!occ.has(i)&&!stairs.has(i)&&HT[i]<LAND+14}
function rampOK(tx,ty){return gOK(tx,ty)&&rampFree(ty*TW+tx)&&tfNear(tx,ty)}
function doRamp(x,y,d){const i=y*TW+x;if(!gOK(x,y)||!rampFree(i)){msgS='The ramp could not be built here';msgT=2;return}const[dx,dy]=D4[d&3],h=HT[i];
 stairs.set(i,{ax:dx?0:1,sg:(dx+dy)>0?1:-1,lo:h,hi:h+1,nat:1,orig:h,built:1,blk:1});
 for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b))markT(x+a,y+b);mmTile(i);
 fdDirty=true;GF.clear();ver++;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS)}
function demolish(s){if(!structs.includes(s))return;if(s.garr)s.garr.slice().forEach(ungar);const R=RESP[s.pl|0];for(const k in(s.cost||{}))R[k]+=s.cost[k];s.hp=-1;s.dem=false;s.noCrumble=true;puff(s.x,s.y,'#c9b899',18,90,{T:.8,z:.4,vz:2,g:5,s:.16});snd('build',s.x,s.y);if(!MP.on||(s.pl|0)===LPL()){msgS='Demolished: resources recovered';msgT=3}}
function nearestTf(u){let b=-1,bd=1e9;for(const[i]of tfo){const x=i%TW,y=(i/TW)|0,d=dist(u.x,u.y,(x+.5)*TS,(y+.5)*TS);if(d<bd&&exposed(x,y)&&reach(x,y)){bd=d;b=i}}return b}
function buy(k){if(over)return;if(k==='demolish'&&selB&&structs.includes(selB)&&selB!==HOMEC()&&selB.type!=='castle'){build('demolish',selB.tx,selB.ty);return}if(k==='repair'){const s=selB&&structs.includes(selB)?selB:HOMEC();if(s)repairB(s.sid);return}if(TRADEK.has(k)){trade(k);return}if(k==='rotate'){if(selB&&selB.t===0&&ROTT.has(selB.type))build('rotate',selB.tx,selB.ty);return}if(k==='tier'){if(!RS.done){msgS='Stone needs Stonemasonry';msgT=3;snd('err');return}setTier(!BTIER);msgS='New buildings: '+(BTIER?'stone':'wood');msgT=2;snd('click');return}if(k==='upgrade'){startResearch();return}if(k in RT2){startResearch2(k);return}if((k==='ballista'||k==='trebuchet')&&!RS.done){msgS='Siege weapons need Stonemasonry';msgT=3;snd('err');return}if(k in T){mode=null;snd('click');train(k)}else{units.forEach(u=>u.sel=false);mode=mode===k?null:k}}

function army(){units.forEach(u=>u.sel=u.t===0&&u.type!=='peasant'&&(!MP.on||(u.pl|0)===CURPL))}
/* order fields: Dijkstra over the walk grid where roads are cheaper (dirt 4, stone 3, grass 6), searched in a window that grows when
   the detour leaves it; an unreachable target sends the group to the closest tile they can actually reach (alt) */
function dijW(seeds,pl,x0,y0,w,h){x0=Math.max(0,x0);y0=Math.max(0,y0);w=Math.min(w,TW-x0);h=Math.min(h,TH-y0);ensureRect(x0,y0,w,h);gateSolid=!pl;
 const F=new Uint16Array(w*h).fill(65535),B=[[],[],[],[],[],[],[],[]];let pend=0;
 for(const[sx,sy]of seeds){if(sx<x0||sy<y0||sx>=x0+w||sy>=y0+h)continue;const k=(sy-y0)*w+sx-x0;if(F[k]===0)continue;F[k]=0;B[0].push(k);pend++}
 for(let d=0;pend>0&&d<65000;d++){const q=B[d&7];while(q.length){const k=q.pop();pend--;if(F[k]!==d)continue;const lx=k%w,ly=(k/w)|0,tx=lx+x0,ty=ly+y0,a=ty*TW+tx;
   for(const[dx,dy]of D4){const nx=lx+dx,ny=ly+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx,gx=tx+dx,gy=ty+dy,gi=gy*TW+gx,nd=d+(pth[gi]===2?3:pth[gi]?4:6);
    if(nd>=F[n]||solid(gx,gy)||!canStep(a,gi))continue;F[n]=nd;B[nd&7].push(n);pend++}}}
 gateSolid=true;return{F,x0,y0,w,h}}
function mkG(tx,ty,sx,sy,quick){return{ver:-1,S:null,tx,ty,sx,sy,alt:null,big:0,q:quick?1:0,mk(){const ft=freeTile(tx,ty);this.alt=null;this.ver=ver;if(!ft){this.S=null;return}
  const si=Math.floor(this.sx),sj=Math.floor(this.sy);let x0,y0,x1,y1;
  for(const m of quick?[24]:this.big?[160]:[24,72,160]){x0=Math.floor(Math.min(tx,sx))-m;y0=Math.floor(Math.min(ty,sy))-m;x1=Math.ceil(Math.max(tx,sx))+m;y1=Math.ceil(Math.max(ty,sy))+m;
   if(x1-x0>460){const c=(tx+si)>>1;x0=c-230;x1=c+230}if(y1-y0>460){const c=(ty+sj)>>1;y0=c-230;y1=c+230}
   this.S=dijW([ft],true,x0,y0,x1-x0,y1-y0);if(quick||fv(this.S,si,sj)<65535)return}
  const st=freeTile(si,sj);if(!st)return;const Bf=bfsW([st],true,x0,y0,x1-x0,y1-y0);let bk=-1,bd=1e18;
  for(let k=0;k<Bf.F.length;k++){if(Bf.F[k]===65535)continue;const x=Bf.x0+k%Bf.w,y=Bf.y0+((k/Bf.w)|0),d=(x-tx)*(x-tx)+(y-ty)*(y-ty);if(d<bd||(d===bd&&Bf.F[k]<Bf.F[bk])){bd=d;bk=k}}
  if(bk<0)return;const bx=Bf.x0+bk%Bf.w,by=Bf.y0+((bk/Bf.w)|0);this.S=dijW([[bx,by]],true,x0,y0,x1-x0,y1-y0);this.alt={x:(bx+.5)*TS,y:(by+.5)*TS}}}}
const FRM_COLS=5;
function slotPos(C,j){const f=[Math.sin(C.fm||0),Math.cos(C.fm||0)],p=[f[1],-f[0]];if(C.type==='king'){const s=j?1:-1;return{x:C.x+p[0]*s*30-f[0]*8,y:C.y+p[1]*s*30-f[1]*8}}const row=j>=FRM_COLS?1:0,col=(j%FRM_COLS)-2;return{x:C.x-f[0]*(34+row*30)+p[0]*col*26,y:C.y-f[1]*(34+row*30)+p[1]*col*26}}
function leaveSquad(u){if(u.cap){if(u.cap.sq)u.cap.sq=u.cap.sq.filter(f=>f!==u);u.cap=null}}
function royalSpawn(nu,b){const pl=nu.pl|0;
 if(nu.type==='king'){nu.sq=[];nu.fm=Math.PI;for(const q of units)if(q.t===0&&q.type==='guard'&&q.hp>0&&(q.pl|0)===pl&&!q.cap&&nu.sq.length<2){q.cap=nu;q.rg=1;nu.sq.push(q)}
  while(nu.sq.length<2){const p=spawnPos(b),q=mkU(0,'guard',p.x,p.y);q.cap=nu;q.rg=1;units.push(q);nu.sq.push(q)}
  if(pl===LPL()){bannerT=4.5;bannerS='LONG LIVE KING NARAIGE';bannerS2='King Naraige rides out with his royal guard';snd('fanfare');}}
 else{const K=royalOf(pl);nu.rg=1;if(K){if(!K.sq)K.sq=[];if(K.sq.length<2){nu.cap=K;K.sq.push(nu)}}}}
function kingFell(u){if(u.kdead)return;u.kdead=1;if(u.sq){u.sq.forEach(f=>{f.cap=null});u.sq=null}if((u.pl|0)===LPL()){bannerT=5;bannerS='KING NARAIGE HAS FALLEN';bannerS2=u.conv?'...and he rises among the dead':'His royal guard fights on';snd('horn');ALERTS.push({x:u.x,y:u.y,t:6})}}
function disband(C){if(C.sq)C.sq.forEach(f=>{f.cap=null});C.sq=null}
function groupSel(){const S=sel(),C=S.find(u=>u.type==='captain');if(!C){msgS='Select a captain first';msgT=3;return}
 if(!C.sq)C.sq=[];const free=u=>u.t===0&&!u.cap&&u.type!=='peasant'&&u.type!=='captain'&&u.type!=='king'&&!u.rg&&u.hp>0;
 let cand=S.filter(free);if(!cand.length)cand=units.filter(u=>free(u)&&dist(u.x,u.y,C.x,C.y)<TS*16).sort((a,b)=>dist(a.x,a.y,C.x,C.y)-dist(b.x,b.y,C.x,C.y));
 for(const u of cand){if(C.sq.length>=10)break;C.sq.push(u);u.cap=C;u.o=null;u.sel=true}
 msgS='Squad: '+C.sq.length+' / 10 soldiers';msgT=3;if(C.sq.length)puff(C.x,C.y,'#ffd23c',8,50)}
function ungroupSel(){let n=0;for(const C of sel())if(C.type==='captain'&&C.sq&&C.sq.length){n+=C.sq.length;disband(C)}if(n){msgS='Squad disbanded';msgT=3}}
const RGS=27,RGF=-20;
function royalPost(K,j,fa){const f=[Math.sin(fa),Math.cos(fa)],p=[f[1],-f[0]],s=j?1:-1;return{x:K.x+p[0]*s*RGS+f[0]*RGF,y:K.y+p[1]*s*RGS+f[1]*RGF}}
/* bodyguard: strike whatever comes near the King, otherwise stand at your post beside him (march with him when he walks) */
function royalEscort(u,d,dt){const K=u.cap,j=K.sq?K.sq.indexOf(u):-1;if(j<0)return false;
 const kw=K.walk>0,fa=kw?(K.face||0):K.fpos&&!K.o?K.fpos.fm:(K.fm!==undefined?K.fm:(K.face||0)),inR=bd=>bd<=d.rng+d.r;
 const[b,bd]=targetZ(u,d.rng+d.r+TS*2.2);
 if(b&&(inR(bd)||(!kw&&dist(b.x,b.y,K.x,K.y)<TS*3.4))){u.o=null;if(inR(bd)){if(u.cd<=0)hit(u,b)}else chase(u,b,dt);return true}
 let P=royalPost(K,j,fa),stop=3;
 if(solidAt(P.x,P.y)){const f=[Math.sin(fa),Math.cos(fa)],bk=TS*(.9+j*.7);P={x:K.x-f[0]*bk,y:K.y-f[1]*bk};if(solidAt(P.x,P.y)){P={x:K.x,y:K.y};stop=34}}
 const dp=dist(u.x,u.y,P.x,P.y);
 u.plt=(u.plt||0)-dt;if(u.plt<=0){u.plt=.3;u.pok=dp<TS*5&&losClear(u.x,u.y,P.x,P.y)}
 if(dp<=stop){u.o=null;u.face=fa;return true}
 if(u.pok){u.o=null;moveTo(u,P.x,P.y,dt*Math.min(2.4,1+dp/(TS*1.2)));return true}
 if(!u.o||dist(u.o.x,u.o.y,P.x,P.y)>TS*1.5)u.o={x:P.x,y:P.y,g:capField(K)};walk(u,dt);return true}
function formSquad(C,w,g){const dx=w.x-C.x,dy=w.y-C.y;if(hyp(dx,dy)>30)C.fm=Math.atan2(dx,dy);if(!C.sq||C.type==='king')return;C.sq.forEach((f,j)=>{const s=slotPos({x:w.x,y:w.y,fm:C.fm},j);f.o={x:s.x,y:s.y,g}})}
function capField(C){const tx=Math.floor(C.x/TS),ty=Math.floor(C.y/TS);if(!C.cfg||Math.abs(C.cfg.tx-tx)+Math.abs(C.cfg.ty-ty)>6)C.cfg=mkG(tx,ty,tx,ty,1);return C.cfg}
function garSlot(s,j){if(s.type==='keep'){const a=j/12*6.283;return{x:s.x+Math.cos(a)*26,y:s.y+Math.sin(a)*26}}if(s.type==='tower'){if(s.sz===2){const o=[[-22,-22],[22,-22],[-22,22],[22,22]][j%4];return{x:s.x+o[0],y:s.y+o[1]}}const o=[[-12,-9],[12,-9],[0,12]][j%3];return{x:s.x+o[0],y:s.y+o[1]}}if(s.type==='gate'){const d=j?1:-1,o=s.gl===3?40:30;return s.ax?{x:s.x,y:s.y+d*o}:{x:s.x+d*o,y:s.y}}return{x:s.x,y:s.y}}
function ungar(u){const s=u.gar;if(!s)return;u.gar=null;if(s.garr)s.garr=s.garr.filter(a=>a!==u);const a=Math.random()*6.28;for(let k=0;k<8;k++){const x=s.x+Math.cos(a+k)*(s.rad+14),y=s.y+Math.sin(a+k)*(s.rad+14);if(!solidAt(x,y)){u.x=x;u.y=y;break}}u.o=null}
function garTarget(s,u){for(let r=1;r<=5;r++){let b=null,bd=1e12;for(const[tx,ty]of s.tiles)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=tx+dx,y=ty+dy;if(!gOK(x,y)||solid(x,y))continue;const px=(x+.5)*TS,py=(y+.5)*TS,d=dist(px,py,u.x,u.y);if(d<bd){bd=d;b={x:px,y:py,r}}}if(b)return b}return{x:s.x,y:s.y,r:1}}
function garrison(u,s){u.fg=null;u.fpos=null;if(u.gar===s)return true;s.garr=s.garr||[];if(s.garr.length>=GCAP[s.type])return false;ungar(u);leaveSquad(u);u.o=null;u.gar=s;s.garr.push(u);u.gz=(s.bh||0)+gtopOf(s);return true}
const FPRI={king:0,guard:1,knight:0,captain:0,archer:1,bannerman:2,cannon:3,peasant:4};let FGS=[],FORCEF=null;
function formSlots(U,w,fm){const n=U.length,f=[Math.sin(fm),Math.cos(fm)],p=[f[1],-f[0]],pos=[];const SP=26;
 const add=(row,col)=>pos.push({row,col,x:w.x-f[0]*row*SP+p[0]*col*SP,y:w.y-f[1]*row*SP+p[1]*col*SP});
 if(formType===1){const per=Math.max(6,Math.ceil(n/2));for(let i=0;i<n;i++){const r=(i/per)|0,c=i%per,cnt=Math.min(per,n-r*per);add(r,c-(cnt-1)/2)}}
 else if(formType===2){const cols=Math.max(3,Math.round(Math.sqrt(n*1.4)));for(let i=0;i<n;i++){const r=(i/cols)|0,c=i%cols,cnt=Math.min(cols,n-r*cols);add(r,c-(cnt-1)/2)}}
 else if(formType===3){let r=0,k=0;while(k<n){const cnt=Math.min(n-k,r===0?1:2);for(let j=0;j<cnt;j++){add(r,cnt===1?0:(j?1:-1)*(Math.ceil(r/2)+.0))+(0);k++}r++}
  /* wedge: rows widen */pos.length=0;r=0;k=0;while(k<n){const wd=r+1,cnt=Math.min(n-k,wd);for(let j=0;j<cnt;j++){add(r,j-(cnt-1)/2);k++}r++}pos.forEach(q=>{q.x=w.x-f[0]*q.row*SP+p[0]*q.col*SP*1.15;q.y=w.y-f[1]*q.row*SP+p[1]*q.col*SP*1.15})}
 else{const R=Math.max(34,n*7.5);for(let i=0;i<n;i++){const a=fm+i/n*6.2832;pos.push({row:0,col:i,x:w.x+Math.sin(a)*R,y:w.y+Math.cos(a)*R})}}
 const lat=u=>(u.x*p[0]+u.y*p[1]),us=U.slice().sort((a,b)=>(FPRI[a.type]||0)-(FPRI[b.type]||0)||lat(a)-lat(b));
 const sp=formType===4?pos:pos.slice().sort((a,b)=>a.row-b.row||a.col-b.col);const m=new Map();
 if(formType===4){const ord=us.slice().sort((a,b)=>Math.atan2(a.x-w.x,a.y-w.y)-Math.atan2(b.x-w.x,b.y-w.y));ord.forEach((u,i)=>m.set(u,pos[i]))}
 else{let i=0;const rows=[];sp.forEach(q=>{(rows[q.row]=rows[q.row]||[]).push(q)});for(const R of rows){if(!R)continue;const take=us.slice(i,i+R.length);i+=R.length;take.sort((a,b)=>lat(a)-lat(b));const ci=take.findIndex(u=>u.type==='captain');if(ci>=0&&take.length>2){const c=take.splice(ci,1)[0];take.splice((take.length/2)|0,0,c)}R.forEach((q,j)=>{if(take[j])m.set(take[j],q)})}}
 /* support troops keep a gap behind the fighting line */
 for(const[u,q]of m)if(u.type==='bannerman'||u.type==='cannon'){const gp=u.type==='cannon'?22:14;q.x-=f[0]*gp;q.y-=f[1]*gp}
 return m}
function fgMake(FM,slots,w,g,fm){let cx=0,cy=0;FM.forEach(u=>{cx+=u.x;cy+=u.y});cx/=FM.length;cy/=FM.length;const A=mkU(0,'knight',cx,cy);
 const v=Math.min(...FM.map(u=>T[u.type].spd*(u.spj||1)))*.9;A.spj=v/T.knight.spd;const F={A,w:{x:w.x,y:w.y},g,fm,arr:false,mem:FM.slice(),t:0};
 FM.forEach(u=>{const s=slots.get(u);u.fg=F;u.fof={x:s.x-w.x,y:s.y-w.y};u.fpos=null;u.fwt=0});FGS.push(F);return F}
function fgTick(dt){if(!FGS.length)return;FGS=FGS.filter(F=>{F.mem=F.mem.filter(u=>u.fg===F&&u.hp>0);if(!F.mem.length)return false;
 if(!F.arr){let lag=0;for(const u of F.mem){const d=dist(u.x,u.y,F.A.x+u.fof.x,F.A.y+u.fof.y);if(d>lag)lag=d}
  F.wt=lag<TS*1.8?0:(F.wt||0)+dt;const amv=F.wt===0||F.wt>4;if(amv){const g=F.g;if(g.ver!==ver)g.mk();stepF(F.A,g.S,F.w.x,F.w.y,dt)}F.t+=dt;
  for(const u of F.mem){const d=dist(u.x,u.y,F.A.x+u.fof.x,F.A.y+u.fof.y);if(d>TS*8){u.flag=(u.flag||0)+dt;if(u.flag>12){u.fg=null;u.flag=0;u.o={x:F.w.x+u.fof.x,y:F.w.y+u.fof.y,g:F.g,f:1}}}else u.flag=0}
  {const dg=dist(F.A.x,F.A.y,F.w.x,F.w.y);if(F.bd===undefined||dg<F.bd-4){F.bd=dg;F.st=0}else if(amv)F.st=(F.st||0)+dt}
  if(dist(F.A.x,F.A.y,F.w.x,F.w.y)<12||F.t>300||F.st>5){if(F.st>5){F.w={x:F.A.x,y:F.A.y}}else{F.A.x=F.w.x;F.A.y=F.w.y}F.arr=true}}return true})}
function fgUnit(u,dt){const F=u.fg;let X=F.A.x+u.fof.x,Y=F.A.y+u.fof.y;if(!F.arr&&solidAt(X,Y)){X=F.A.x;Y=F.A.y}const dd=dist(u.x,u.y,X,Y);
 if(F.arr){u.fwt+=dt;if(dd<8||u.fwt>5||solidAt(X,Y)){u.fg=null;u.o=null;u.fpos={x:dd<8?X:u.x,y:dd<8?Y:u.y,fm:F.fm};u.face=F.fm;u.gx=u.x;u.gy=u.y;return}}
 if(dd>3){u.flt=(u.flt||0)-dt;if(u.flt<=0){u.flt=.3;u.flos=losClear(u.x,u.y,X,Y)}if(u.flos||dd<TS*.8)moveTo(u,X,Y,dt);else{if(F.g.ver!==ver)F.g.mk();stepF(u,F.g.S,X,Y,dt)}}else u.face=F.fm}
function order(w){const S0=sel();if(!S0.length)return;if(shelOn)for(const u of S0)if(u.type==='peasant')u.nso=1;const tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS),ti=ty*TW+tx,inW=gOK(tx,ty);
 const P=S0.filter(u=>u.type==='peasant'),rj=inW?({2:'w',3:'s',4:'g'})[ter[ti]]:null,st=inW?occ.get(ti):null;let used=null;
 if(P.length&&rj){if(!(exposed(tx,ty)&&(reach(tx,ty)||reachLong(tx,ty)))){msgS='Peasants cannot reach it';msgT=3}
  else{let given=false;P.forEach(u=>{u.role=null;u.job=rj;u.lastT=ti;u.stk2=0;const ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS);let t=-1;if(!given&&D4.some(([dx,dy])=>!solid(tx+dx,ty+dy)&&sameComp(ux,uy,tx+dx,ty+dy))){t=ti;given=true;CLM.set(ti,u)}u.tl=t;u.o=null;leaveSquad(u)});used=P;puff((tx+.5)*TS,(ty+.5)*TS,rj==='g'?'#ffd23c':rj==='w'?'#8bd06a':'#cfd6e2',8,40)}}
 else if(P.length&&st&&st.t===0&&(st.pl|0)===(CURPL|0)&&st.prog>=1&&WKT.has(st.type)&&(!wkOf(st)||st.hp>=st.max)){const u=P.find(q=>q.wk===st)||P[0];wkSet(u,st);if(shelOn)u.nso=1;used=P;if(CURPL===LPL()){msgS='A peasant now works the '+NAMES[st.type].toLowerCase();msgT=3}}
 else if(P.length&&st&&st.t===0&&(st.pl|0)===(CURPL|0)&&(st.hp<st.max||st.prog<1)){P.forEach(u=>{u.job='r';u.o=null;u.rb=st;u.rk=1;u.tl=-1});used=P;if(st.prog>=1&&CURPL===LPL()){msgS='Repairing the '+NAMES[st.type]+' (uses resources)';msgT=3}}
 const AR=S0.filter(u=>u.type==='archer'||(u.type==='cannon'&&st&&(st.type==='wall'||st.type==='tower'||st.type==='gate')));let gused=[];
 if(AR.length&&st&&st.t===0&&st.prog>=1&&GCAP[st.type]&&(st.pl|0)===(CURPL|0)){let room=GCAP[st.type]-(st.garr||[]).length-units.filter(v=>v.goG===st&&!AR.includes(v)).length,n=0;
  for(const u of AR){if(u.gar===st){gused.push(u);continue}if(room<=0)break;room--;n++;gused.push(u);if(u.gar)ungar(u);leaveSquad(u);u.goG=st;u.goT=0;const tp=garTarget(st,u);u.goR=tp.r;u.o={x:tp.x,y:tp.y,g:mkG(Math.floor(tp.x/TS),Math.floor(tp.y/TS),u.x/TS,u.y/TS),f:1}}
  if(CURPL===LPL()){if(n){msgS=(AR.some(u=>u.type==='cannon')?'Crews':'Archers')+' walking to the '+NAMES[st.type];msgT=3;puff(st.x,st.y,'#9fe870',6,40)}else{msgS=NAMES[st.type]+' is full';msgT=3}}}
 const M=S0.filter(u=>!(used&&used.includes(u))&&!gused.includes(u)).filter(u=>{if(u.cap&&!u.cap.sel&&!u.rg){leaveSquad(u)}return !u.cap});if(!M.length)return;
 let sx=0,sy=0;for(const u of M){sx+=u.x;sy+=u.y}sx=sx/M.length/TS;sy=sy/M.length/TS;const g=mkG(tx,ty,sx,sy);
 const KG=M.find(u=>u.type==='king'),FM=M.filter(u=>u.type!=='peasant'&&!u.gar&&!(KG&&u===KG&&M.length>1));let slots=null,wb=w;
 /* with the King: he leads at the point, his guard on his flanks, the army forms up behind them */
 if(KG&&M.length>1){let cx=0,cy=0;M.forEach(u=>{cx+=u.x;cy+=u.y});cx/=M.length;cy/=M.length;const fm=FORCEF!=null?FORCEF:hyp(w.x-cx,w.y-cy)>40?Math.atan2(w.x-cx,w.y-cy):(KG.fm||0);wb={x:w.x-Math.sin(fm)*TS*2.2,y:w.y-Math.cos(fm)*TS*2.2};if(solidAt(wb.x,wb.y))wb=w;KG.fmK=fm}
 for(const u of M){u.fg=null;u.fpos=null}
 if((formType>0||(KG&&wb!==w))&&FM.length>=(KG&&wb!==w?1:FORCEF!=null?2:3)){let cx=0,cy=0;FM.forEach(u=>{cx+=u.x;cy+=u.y});cx/=FM.length;cy/=FM.length;const dx=w.x-cx,dy=w.y-cy;if(KG&&wb!==w)lastFm=KG.fmK;else if(FORCEF!=null)lastFm=FORCEF;else if(hyp(dx,dy)>40)lastFm=Math.atan2(dx,dy);const ft0=formType;if(!formType)formType=1;try{slots=formSlots(FM,wb,lastFm)}finally{formType=ft0}}
 M.forEach(u=>{if(u.gar)ungar(u);u.goG=null;const sl=slots&&slots.get(u);const wc=KG&&u!==KG?wb:w;u.o=sl?{x:sl.x,y:sl.y,g,f:1}:u===KG?{x:w.x,y:w.y,g,f:1}:{x:wc.x+rnd(-25,25),y:wc.y+rnd(-25,25),g,f:1};if(u.type==='peasant'){u.job=null;u.tl=-1;u.rb=null;u.rk=0}});snd('order');
 if(slots)fgMake(FM.filter(u=>slots.has(u)),slots,wb,g,lastFm);
 M.filter(u=>u.type==='captain'||u.type==='king').forEach(C=>formSquad(C,w,g));if(KG&&KG.fmK!==undefined){KG.fm=KG.fmK;delete KG.fmK}}
function moveTo(u,x,y,dt){let dx=x-u.x,dy=y-u.y;const d=hyp(dx,dy);if(d<1)return;u.mv=true;u.walk=.25;if(Math.random()<.02)dust(u.x,u.y);u.face=Math.atan2(dx,dy);
 if(u.det>0){const c=Math.cos(u.dir*1.3),s=Math.sin(u.dir*1.3);[dx,dy]=[dx*c-dy*s,dx*s+dy*c];u.det-=dt}
 const tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS))),k=pth[ty*TW+tx]===2?2.2:pth[ty*TW+tx]?1.7:1;
 const st=Math.min(d,T[u.type].spd*(u.t===1?SLOWK:1)*k*(u.spdK||1)*(u.spj||1)*dt)/d;const ox=u.x,oy=u.y;u.x+=dx*st;u.y+=dy*st;if(u.t===0&&!u.gar&&!u.onF)pushOut(u,ox,oy)}
function pushOut(u,ox,oy){const gs=gateSolid;gateSolid=false;try{pushOut0(u,ox,oy)}finally{gateSolid=gs}}
function pushOut0(u,ox,oy){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(solid(tx,ty)){if(!solid(Math.floor(ox/TS),Math.floor(oy/TS))){u.x=ox;u.y=oy}return}const R=9;
 for(const[a,b]of D8){const nx=tx+a,ny=ty+b;if(!solid(nx,ny))continue;const cx=Math.max(nx*TS,Math.min(u.x,nx*TS+TS)),cy=Math.max(ny*TS,Math.min(u.y,ny*TS+TS)),dx=u.x-cx,dy=u.y-cy,d=hyp(dx,dy);if(d>=R||d<1e-3)continue;u.x+=dx/d*(R-d);u.y+=dy/d*(R-d)}
 if(solid(Math.floor(u.x/TS),Math.floor(u.y/TS))){u.x=ox;u.y=oy}}
function losClear(x0,y0,x1,y1){const gs=gateSolid;gateSolid=false;try{const d=hyp(x1-x0,y1-y0),n=Math.ceil(d/12),gx=Math.floor(x1/TS),gy=Math.floor(y1/TS);let px=Math.floor(x0/TS),py=Math.floor(y0/TS);
 for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n,tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx===px&&ty===py)continue;if(tx===gx&&ty===gy)return true;if(solid(tx,ty))return false;
  if(tx!==px&&ty!==py){if(blk(px,py,tx,py)||blk(px,py,px,ty)||blk(px,py,tx,ty))return false}else if(blk(px,py,tx,ty))return false;px=tx;py=ty}return true}finally{gateSolid=gs}}
function stepF(u,S,fx_,fy_,dt){u.wlk=time;if(u.t===0&&S&&u.type==='peasant'){const v=fv(S,Math.floor(u.x/TS),Math.floor(u.y/TS)),dg=dist(u.x,u.y,fx_,fy_),gk=Math.round(fx_)*65536+Math.round(fy_);
  if(gk!==u.pfG){u.pfG=gk;u.pfS=S;u.pfB=v;u.pfD=dg;u.pfT=time}else{if(S!==u.pfS){u.pfS=S;u.pfB=v}else if(v<u.pfB){u.pfB=v;u.pfT=time}if(dg<u.pfD-TS*.4){u.pfD=dg;u.pfT=time}}}if(u.t===0&&S){const dd=dist(u.x,u.y,fx_,fy_);if(dd<TS*14&&dd>TS*1.6){u.lt=(u.lt||0)-dt;if(u.lt<=0){u.lt=.25;u.los=losClear(u.x,u.y,fx_,fy_)}if(u.los){moveTo(u,fx_,fy_,dt);return}}else u.los=false}
 const tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS)));
 if(S&&dist(u.x,u.y,fx_,fy_)>TS*1.6){let bd=fv(S,tx,ty),bx=-1,by=0;
  if(bd<65535){const pp=u.type==='peasant',v0=bd,gs0=gateSolid;gateSolid=u.t===1;let pb=null;for(const[dx,dy]of D8){const a=tx+dx,b=ty+dy,v=fv(S,a,b);if(v>=v0)continue;if(dx&&dy?(HT[ty*TW+a]!==HT[ty*TW+tx]||HT[b*TW+tx]!==HT[ty*TW+tx]||blk(tx,ty,tx+dx,ty)||blk(tx,ty,tx,ty+dy)||blk(tx,ty,a,b)):blk(tx,ty,a,b))continue;if(v<bd){bd=v;bx=a;by=b}
    if(pp&&pth[b*TW+a]&&(!pb||v<pb[2]))pb=[a,b,v]}
   gateSolid=gs0;if(pb&&pth[ty*TW+tx]&&pb[2]<=v0-1){bx=pb[0];by=pb[1]}else if(pb&&pb[2]<=bd+1){bx=pb[0];by=pb[1]}}
  if(bx>=0){moveTo(u,(bx+.5)*TS,(by+.5)*TS,dt);return}}
 moveTo(u,fx_,fy_,dt)}
function walk(u,dt){const o=u.o,g=o.g;if(g.ver!==ver)g.mk();
 if(g.alt&&o.ax!==g.alt.x+g.alt.y){o.ax=g.alt.x+g.alt.y;o.x=g.alt.x+((u.uid*37)%21-10);o.y=g.alt.y+((u.uid*53)%21-10);o.bd=undefined}
 stepF(u,g.S,o.x,o.y,dt);const dd=dist(u.x,u.y,o.x,o.y),pv=g.S?fv(g.S,Math.floor(u.x/TS),Math.floor(u.y/TS)):65535,pr=pv<65535?pv:1e5+dd;
 if(o.bd===undefined||dd<o.bd-6){o.bd=dd;o.st=0}else o.st=(o.st||0)+dt;
 if(o.bp===undefined||pr<o.bp-(pv<65535?.5:6)){o.bp=pr;o.sp=0}else o.sp=(o.sp||0)+dt;
 if(dd<16||(dd<60&&solidAt(o.x,o.y))||(dd<TS*2.6&&o.st>1.1)||(o.sp>6&&g.big)){u.o=null;u.gx=u.x;u.gy=u.y;return}
 if(o.sp>6){g.big=1;g.ver=-1;o.sp=0}}
/* chase an enemy: straight when the way is clear, along a small path field when a cliff or wall is in between */
function chase(u,b,dt){u.ct=(u.ct||0)-dt;if(u.ct<=0||u.ctg!==b){u.ct=.4;u.ctg=b;u.clos=losClear(u.x,u.y,b.x,b.y)}
 if(u.clos){moveTo(u,b.x,b.y,dt);return}
 const tx=Math.floor(b.x/TS),ty=Math.floor(b.y/TS),k=ty*TW+tx;u.cgt=(u.cgt||0)-dt;if(!u.cg||(u.cgk!==k&&u.cgt<=0)){u.cg=mkG(tx,ty,u.x/TS,u.y/TS,1);u.cgk=k;u.cgt=1.2}
 const g=u.cg;if(g.ver!==ver)g.mk();stepF(u,g.S,b.x,b.y,dt)}
/* group behaviour: aggressive / defensive / halt, stop, peasants back to work */
function setStance(st){const S=sel();if(!S.length)return;let n=0;
 for(const u of S){if(u.t!==0)continue;if(u.type==='peasant'){if(shelOn)u.nso=1;u.role=null;if(st==='stop'){u.job=null;u.tl=-1;u.o=null;u.carry=u.carry;u.work=0;u.idle=-25;n++}else if(st==='work'){u.o=null;u.job=null;u.tl=-1;u.idle=99;n++}continue}
  u.fg=null;if(st==='stop')u.fpos=null;if(st==='work')continue;if(st==='stop'){u.o=null;u.ret=false;u.gx=u.x;u.gy=u.y;n++;continue}
  u.stn=st;u.ret=false;u.gx=u.x;u.gy=u.y;if(st==='hold'){u.o=null;if(u.cap)leaveSquad(u)}n++}
 if(n&&(!MP.on||CURPL===LPL())){msgS={agg:'Aggressive: chase every enemy in sight',def:'Defensive: guard this spot',hold:'Halt: hold position',stop:'Stopped',work:'Back to work'}[st]+' ('+n+')';msgT=2.5;snd('order')}}
function collide(u){if(u.gar||u.onF)return;const r=T[u.type].r;gateSolid=u.t===1;
 if(u.clb>0){u.clb-=1/30;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),o=gOK(tx,ty)&&occ.get(ty*TW+tx);if(o&&(!o.gate||gateSolid)&&u.lx!==undefined){u.x=u.lx;u.y=u.ly}gateSolid=true;u.x=Math.max(r,Math.min(W-r,u.x));u.y=Math.max(r,Math.min(H-r,u.y));u.lx=u.x;u.ly=u.y;return}
 let tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS)));
 if(u.lx!==undefined){const ptx=Math.floor(u.lx/TS),pty=Math.floor(u.ly/TS);if((ptx!==tx||pty!==ty)&&!solid(ptx,pty)&&blk(ptx,pty,tx,ty)){u.x=u.lx;u.y=u.ly;tx=ptx;ty=pty}}
 if(solid(tx,ty)){const x0=tx*TS,y0=ty*TS,c=[[u.x-x0,-1,0],[x0+TS-u.x,1,0],[u.y-y0,0,-1],[y0+TS-u.y,0,1]].filter(e=>!solid(tx+e[1],ty+e[2])).sort((p,q)=>p[0]-q[0])[0];
  if(c){if(c[1])u.x=c[1]<0?x0-r:x0+TS+r;if(c[2])u.y=c[2]<0?y0-r:y0+TS+r;tx=Math.floor(u.x/TS);ty=Math.floor(u.y/TS)}}
 for(let j=ty-1;j<=ty+1;j++)for(let i=tx-1;i<=tx+1;i++){if(i===tx&&j===ty)continue;if(!blk(tx,ty,i,j))continue;
  const x0=i*TS,y0=j*TS,cx=Math.max(x0,Math.min(x0+TS,u.x)),cy=Math.max(y0,Math.min(y0+TS,u.y)),dd=dist(u.x,u.y,cx,cy);
  if(dd<r&&dd>=.01){u.x+=(u.x-cx)/dd*(r-dd);u.y+=(u.y-cy)/dd*(r-dd)}}
 gateSolid=true;u.x=Math.max(r,Math.min(W-r,u.x));u.y=Math.max(r,Math.min(H-r,u.y));u.lx=u.x;u.ly=u.y}
/* unit grids (rebuilt each tick, or whenever the unit list changed): one for the defenders (players + AI), one for the zombies.
   A query visits only the nearby cells of the side it looks for; ties keep the lowest array index, so every result is exactly
   what the old full scan of the army gave */
const UGC=80,UGW=Math.ceil(W/UGC),UGHt=Math.ceil(H/UGC),UGH=[new Int32Array(UGW*UGHt).fill(-1),new Int32Array(UGW*UGHt).fill(-1)],UGT=[[],[]];let UGN=new Int32Array(1024),UGU=[],UGL=null;const UGQ=[];
function ugBuild(){SGL=null;for(let t=0;t<2;t++){const Hh=UGH[t];for(const c of UGT[t])Hh[c]=-1;UGT[t].length=0}if(UGN.length<units.length)UGN=new Int32Array(units.length*2);UGU=units.slice();UGL=units;
 for(let k=UGU.length-1;k>=0;k--){const e=UGU[k],t=e.t===1?1:0,Hh=UGH[t],c=Math.max(0,Math.min(UGHt-1,(e.y/UGC)|0))*UGW+Math.max(0,Math.min(UGW-1,(e.x/UGC)|0));if(Hh[c]<0)UGT[t].push(c);UGN[k]=Hh[c];Hh[c]=k}}
function ugFresh(){if(UGL!==units||UGU.length!==units.length)ugBuild()}
/* indices of the units of one side whose cell lies within r (+ slack for what moved during this tick); sorted = array order */
function ugNear(t,x,y,r,sorted){ugFresh();const Hh=UGH[t],R=r+30,x0=Math.max(0,((x-R)/UGC)|0),x1=Math.min(UGW-1,((x+R)/UGC)|0),y0=Math.max(0,((y-R)/UGC)|0),y1=Math.min(UGHt-1,((y+R)/UGC)|0),Q=UGQ;Q.length=0;
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=Hh[cy*UGW+cx];k>=0;k=UGN[k])Q.push(k);if(sorted&&Q.length>1)Q.sort((a,b)=>a-b);return Q}
const SGC=320,SGW=Math.ceil(W/SGC),SGHt=Math.ceil(H/SGC),SGH=new Int32Array(SGW*SGHt).fill(-1),SGT=[];let SGN=new Int32Array(512),SGU=[],SGL=null,SGLEN=-1;
function sgFresh(){if(SGL===structs&&SGLEN===structs.length)return;for(const c of SGT)SGH[c]=-1;SGT.length=0;if(SGN.length<structs.length)SGN=new Int32Array(structs.length*2);SGU=structs.slice();SGL=structs;SGLEN=structs.length;
 for(let k=SGU.length-1;k>=0;k--){const s=SGU[k],c=Math.max(0,Math.min(SGHt-1,(s.y/SGC)|0))*SGW+Math.max(0,Math.min(SGW-1,(s.x/SGC)|0));if(SGH[c]<0)SGT.push(c);SGN[k]=SGH[c];SGH[c]=k}}
function target(u,range,tt){const C=u._tc;if(C&&C.tt===tt&&C.r===range&&((SIMTK+(u.uid||u.sid||0))%3)!==0&&C.tk>=SIMTK-2){const e=C.b;
 if(e===null)return[null,range];if(e.hp>0&&!e.gar&&(e.t===tt||(tt===0&&e.t===2))){const dd=dist(u.x,u.y,e.x,e.y)-(e.type in T?T[e.type].r:e.rad);if(dd<range)return[e,dd]}}
 const res=target0(u,range,tt);if(C){C.tt=tt;C.r=range;C.tk=SIMTK;C.b=res[0]}else u._tc={tt,r:range,tk:SIMTK,b:res[0]};return res}
function target0(u,range,tt){ugFresh();let b=null,bd=range,bk=1e9;
 {const Hh=UGH[tt===1?1:0],R=range+30,x0=Math.max(0,((u.x-R)/UGC)|0),x1=Math.min(UGW-1,((u.x+R)/UGC)|0),y0=Math.max(0,((u.y-R)/UGC)|0),y1=Math.min(UGHt-1,((u.y+R)/UGC)|0);
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=Hh[cy*UGW+cx];k>=0;k=UGN[k]){const e=UGU[k];if((e.t===tt||(tt===0&&e.t===2))&&e.hp>0&&!e.gar){const dd=dist(u.x,u.y,e.x,e.y)-T[e.type].r;if(dd<bd||(dd===bd&&b!==null&&k<bk)){bd=dd;b=e;bk=k}}}}
 sgFresh();const R=range+200,x0=Math.max(0,((u.x-R)/SGC)|0),x1=Math.min(SGW-1,((u.x+R)/SGC)|0),y0=Math.max(0,((u.y-R)/SGC)|0),y1=Math.min(SGHt-1,((u.y+R)/SGC)|0);let sb=null,sbd=bd,sbt=bd,sk=1e9;
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=SGH[cy*SGW+cx];k>=0;k=SGN[k]){const s=SGU[k];if(s.t===tt||(tt===0&&s.t===2)){const td=dist(u.x,u.y,s.x,s.y)-s.rad;if(td>=range)continue;const dd=td+(u.t===1&&s.zq?Math.min(6,s.zq)*TS*.85*(u._tc&&u._tc.b===s?0:1):0);if(dd<sbd||(dd===sbd&&sb!==null&&k<sk)){sbd=dd;sbt=td;sb=s;sk=k}}}
 if(sb!==null&&sbd<bd){b=sb;bd=sbt}
 return[b,bd]}
function hit(u,e){if(u.type==='cannon'){cannonFire(u,e);return}if(e.swarm){hitSw(u,e);return}u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;const z=u.t===1,d=T[u.type],ar=u.type==='archer';fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,h0:u.gar?u.gz+.42:undefined});
 if(e.t===0&&alertT<=0){alertT=8;ALERTS.push({x:e.x,y:e.y,t:5});msgS=(e.type in T?'Your units are under attack!':'Your '+(NAMES[e.type]||'building').toLowerCase()+' is under attack!');msgT=3;snd('alarm')}const vr=u.t===0?Math.min(3,(u.xp||0)/4|0):0,bs=!(e.type in T);e.hp-=d.dmg*(u.buff||1)*(1+.12*vr)*(u.t===0&&RS2.done.iron?1.25:1)*(u.t===0&&RS2.done.steel?1.2:1)*(u.t===0&&ar&&RS2.done.fletch?1.25:1)*(e.t===0&&RS2.done.plate?.78:1)*(e.t===0&&RS2.done.mail?.85:1)*(e.t===0&&bs&&RS2.done.bastion?.72:1)*(e.cb?.8:1)*(z&&bs?1.6:1);if(u.t===0&&e.hp<=0&&e.t===1){const r0=Math.min(3,(u.xp||0)/4|0);u.xp=(u.xp||0)+1;const r1=Math.min(3,u.xp/4|0);if(r1>r0){puff(u.x,u.y,'#ffe066',8,40);u.hp=Math.min(T[u.type].hp,u.hp+T[u.type].hp*.3);if(u.pl===LPL()){msgS=NAMES[u.type]+' promoted: '+RANKN[r1];msgT=2.5}}}snd(ar?'arrow':z?'zhit':'sword',u.x,u.y);if(!(e.type in T))snd('stone',e.x,e.y);u.cd=d.cdt;if(!(e.type in T))puff(e.x,e.y,'#8a8a90',3,50,{T:.4,z:.8,vz:2,g:8,s:.07});else{spark(e.x,e.y);blood(e.x,e.y,z?'#7a1a1a':'#c33');if(!ar)vflash(e.x,e.y,gh(e.x/TS,e.y/TS)+.7,.42,z?[1,.45,.35]:[1,.95,.8],.12)}if(z&&e.hp<=0&&e.t!==1&&e.type in T)e.conv=true}
const exposed=(x,y)=>D4.some(([dx,dy])=>!solid(x+dx,y+dy));
const reach=(x,y)=>D4.some(([dx,dy])=>{const a=x+dx,b=y+dy;return !solid(a,b)&&fv(FP,a,b)<65535});
const RL={};
function resList(j,pl){pl=pl|0;const H=pl===1&&CS2?CS2:CS,cx=H.tx,cy=H.ty,K=j+(pl?'_1':'');let L=RL[K];if(L&&time-L.t<4)return L.a;const a=[];const x0=Math.max(0,cx-160),y0=Math.max(0,cy-160),x1=Math.min(TW,cx+161),y1=Math.min(TH,cy+161);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!gOK(x,y))continue;const i=y*TW+x;if(ter[i]===CODE[j])a.push([i,dist((x+.5)*TS,(y+.5)*TS,H.x,H.y)])}
 a.sort((p,q)=>p[1]-q[1]);RL[K]={t:time,a};return a}
const CLM=new Map();const rclaimed=(i,u)=>{const c=CLM.get(i);return !!c&&c!==u&&c.hp>0&&c.tl===i&&c.job===(u?u.job:c.job)&&!c.o};
const inWin=(S,x,y)=>S&&S.list?S.list.some(q=>inWin(q,x,y)):!!S&&x>S.x0&&y>S.y0&&x<S.x0+S.w-1&&y<S.y0+S.h-1;
function nearest(j,pl,u){const NW=time,ux=u?Math.floor(u.x/TS):0,uy=u?Math.floor(u.y/TS):0,nt=LITL.length>0;let best=-1,bw=1e9,k=0,nl=0;
 /* candidates: the resources nearest the castle, plus everything within 12 tiles of the peasant (forester groves included); the peasant takes the closest to himself */
 let C=resList(j,pl);if(u){const loc=[];for(let y=Math.max(0,uy-12);y<=Math.min(TH-1,uy+12);y++)for(let x=Math.max(0,ux-12);x<=Math.min(TW-1,ux+12);x++){const i=y*TW+x;if(ter[i]===CODE[j]&&gOK(x,y))loc.push([i,1])}if(loc.length)C=loc.concat(C)}
 const seen=u?new Set():null;for(const[i,lc]of C){if(seen){if(seen.has(i))continue;seen.add(i)}if(lc===1){if(ter[i]!==CODE[j]||rclaimed(i,u))continue;const x=i%TW,y=(i/TW)|0;if(nt&&!litAt((x+.5)*TS,(y+.5)*TS))continue;if(!D4.some(([dx,dy])=>!solid(x+dx,y+dy)&&sameComp(ux,uy,x+dx,y+dy)))continue;const sc=(Math.abs(x-ux)+Math.abs(y-uy))*1.5;if(sc<bw){bw=sc;best=i}continue}if(ter[i]!==CODE[j]||BAD.get(i)>NW||u&&rclaimed(i,u))continue;const x=i%TW,y=(i/TW)|0;if(nt&&!litAt((x+.5)*TS,(y+.5)*TS))continue;let w=65535;for(const[dx,dy]of D4)if(!solid(x+dx,y+dy)&&(!u||sameComp(ux,uy,x+dx,y+dy)))w=Math.min(w,fv(FP,x+dx,y+dy));if(w>=65535){if(!inWin(FP,x,y)&&Math.abs(x-ux)+Math.abs(y-uy)>8&&nl++<2&&reachLong(x,y))w=60000+k;else{if(inWin(FP,x,y))BAD.set(i,NW+20);continue}}const sc=u?w+(w<60000?(Math.abs(x-ux)+Math.abs(y-uy))*1.5:0):w;if(sc<bw){bw=sc;best=i}if(++k>=140)break}nearest.w=bw;return best}
function nearestLocal(j,u,R){const c=u.lastT,cx=c>=0?c%TW:Math.floor(u.x/TS),cy=c>=0?((c/TW)|0):Math.floor(u.y/TS),ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS),NW=time;let best=-1,bd=1e9;
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!gOK(x,y))continue;const i=y*TW+x;if(ter[i]!==CODE[j]||BAD.get(i)>NW||rclaimed(i,u))continue;const d=(x-cx)*(x-cx)+(y-cy)*(y-cy);if(d>=bd)continue;if(LITL.length&&!litAt((x+.5)*TS,(y+.5)*TS))continue;
  if(!D4.some(([dx,dy])=>!solid(x+dx,y+dy)&&sameComp(ux,uy,x+dx,y+dy)))continue;bd=d;best=i}return best}
const GF=new Map();let gfVer=-1;
function gField(key,tx,ty,sz){if(gfVer!==ver){GF.clear();gfVer=ver}let S=GF.get(key);if(!S){const s=[];
  for(let j=ty-1;j<=ty+sz;j++)for(let i=tx-1;i<=tx+sz;i++){if(i>=tx&&i<tx+sz&&j>=ty&&j<ty+sz)continue;if(!solid(i,j))s.push([i,j])}
  const hq=nearC((tx+.5)*TS,(ty+.5)*TS),x0=Math.min(tx,hq.tx)-60,y0=Math.min(ty,hq.ty)-60,x1=Math.max(tx+sz,hq.tx)+60,y1=Math.max(ty+sz,hq.ty)+60;S=bfsW(s,true,x0,y0,x1-x0,y1-y0);GF.set(key,S);if(GF.size>60)GF.delete(GF.keys().next().value)}return S}
const BAD=new Map();const CASTLES=()=>CS2?[CS,CS2]:[CS];const aliveC=()=>CASTLES().filter(c=>c.hp>0&&structs.includes(c));const nearC=(x,y)=>{let b=CS,bd=1e12;for(const c of aliveC()){const d=(c.x-x)*(c.x-x)+(c.y-y)*(c.y-y);if(d<bd){bd=d;b=c}}return b};let BTIER=1;const stoneOn=()=>RS.done&&BTIER;function setTier(v){BTIER=v?1:0;Object.assign(C,RS.done&&BTIER?CSTONE:CWOOD)}
let CURPL=0,RESP=[{g:0,w:0,s:0,f:0},{g:0,w:0,s:0,f:0}];const LPL=()=>MP.on&&!MP.host?1:0,setPl=p=>{CURPL=p;res=RESP[p]};
const HOMEC=()=>CURPL===1&&CS2?CS2:CS;const killPl=u=>!CS2||!SITE2?0:u.lane>=3?1:u.lane>=0?0:dist(u.x,u.y,CS2.x,CS2.y)<dist(u.x,u.y,CS.x,CS.y)?1:0;const homeOf=u=>{if(u.dpV===ver&&u.dp&&u.dp.hp>0)return u.dp;let b=null,bd=1e12;for(const s of structs)if(s.t===0&&s.hp>0&&s.prog>=1&&(s.type==='castle'||s.type==='storage')){const d=(s.x-u.x)*(s.x-u.x)+(s.y-u.y)*(s.y-u.y);if(d<bd){bd=d;b=s}}u.dp=b||nearC(u.x,u.y);u.dpV=ver;return u.dp};const dpt=h=>{if(h.type!=='castle')return h;const[dx,dy]=DIR4[(h.rot|0)&3],z=h.sz||3;return dy?{x:(h.tx+z/2)*TS,y:(dy>0?h.ty+z+.5:h.ty-.5)*TS}:{x:(dx>0?h.tx+z+.5:h.tx-.5)*TS,y:(h.ty+z/2)*TS}};
const LC=l=>l>=3&&CS2?CS2:CS;
const fdist=(x,y)=>{if(!MP.on)return dist(CAM.x*TS,CAM.z*TS,x,y);let m=1e12;for(const q of aliveC())m=Math.min(m,dist(q.x,q.y,x,y));return m};const focus=()=>MP.on?{x:CS.x,y:CS.y}:{x:CAM.x*TS,y:CAM.z*TS};
const myTerr=(tx,ty)=>!MP.on||!CS2||nearC((tx+.5)*TS,(ty+.5)*TS)===HOMEC()||!aliveC().includes(HOMEC());
/* night shelter. A villager given an order during the night (or sent to repair) stays out until it is idle again.
   Sheltered villagers keep their job; they are not drawn, cannot be selected or attacked, and leave one by one at dawn. */
function shelState(dt){const nv=nightSim();
 if(!shelOn){if(inGame&&nv>=.3)shelOn=true}
 else if(nv<.12||!inGame){shelOn=false;let n=0;for(const u of units){u.nso=0;u.shf=0;if(u.shel&&(u.pl|0)===LPL())n++}if(n){msgS='Dawn - '+n+' villager'+(n>1?'s':'')+' leave the castle and go back to work';msgT=4}}
 shelRel=shelOn?0:Math.min(.6,shelRel+dt)}
const shelC=u=>{const own=(u.pl|0)===1&&CS2?CS2:CS;return own&&own.hp>0&&structs.includes(own)?own:aliveC().length?nearC(u.x,u.y):null};
function shelGo(u,dt){let c=shelC(u);if(!c){peasant(u,dt);return}u.work=0;if(u.o&&!u.nso)u.o=null;
 const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),L=FP&&FP.list?FP.list:FP?[FP]:[];let S=null;for(const q of L)if(q.dep===c){S=q;break}
 let v=S?fv(S,tx,ty):65535;if(v>=65535){const S2=longField(tx,ty),v2=S2?fv(S2,tx,ty):65535;if(v2<65535&&S2.dep&&S2.dep.hp>0){S=S2;v=v2;c=S2.dep}}
 const p=dpt(c),dd=dist(u.x,u.y,p.x,p.y);
 if(dd<TS*.75){const[fx,fy]=DIR4[(c.rot|0)&3],gx=p.x-fx*TS*.38,gy=p.y-fy*TS*.38;moveTo(u,gx,gy,dt);u.si=(u.si||0)+dt;if(dist(u.x,u.y,gx,gy)<8||u.si>1.2)shelIn(u,c);return}
 u.si=0;
 if(v>=65535){u.shf=(u.shf||0)+dt;if(u.shf>4){peasant(u,dt);return}moveTo(u,p.x,p.y,dt);return}
 if(v>=DSIDE){if(dist(u.x,u.y,c.x,c.y)<TS*2.45){shelIn(u,c);return}stepF(u,S,c.x,c.y,dt);return}
 stepF(u,S,p.x,p.y,dt)}
function shelIn(u,c){if(u.carry){RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0}
 u.sj=u.job?{job:u.job,tl:u.tl,rb:u.rb,rk:u.rk,wk:u.wk}:null;u.job=null;u.tl=-1;u.rb=null;u.rk=0;u.o=null;u.work=0;u.si=0;u.idle=0;
 leaveSquad(u);u.shel=c;u.gar=c;u.sel=false;u.dk=false;u.walk=0;u.x=c.x;u.y=c.y}
function shelTick(u,dt){const c=u.shel;u.walk=0;if(c.hp<=0||!structs.includes(c)){shelOut(u,c,true);return}u.x=c.x;u.y=c.y;
 if(!shelOn&&shelRel>=.15){shelRel-=.15;shelOut(u,c,false)}}
function shelOut(u,c,hurt){u.shel=null;u.gar=null;const D=doorTiles(c,1).filter(([x,y])=>gOK(x,y)&&!solid(x,y)),Q=D.length?D:ringOf(c);
 if(Q.length){const[x,y]=Q[(u.uid|0)%Q.length];u.x=(x+.5)*TS+((u.uid*37)%13)-6;u.y=(y+.5)*TS+((u.uid*53)%13)-6}
 u.o=null;u.idle=0;const J=u.sj;u.sj=null;if(J&&J.job&&!hurt){u.job=J.job;u.tl=J.tl;u.rb=J.rb;u.rk=J.rk;u.wk=J.wk;if(u.tl>=0)u.lastT=u.tl}if(hurt)u.hp-=8}
/* workplaces: a farm (and a forester's hut) is worked by one peasant. Idle peasants take a free one first;
   right-clicking it with a peasant assigns him. While farming, the peasant walks the furrows inside the field. */
const WKT=new Set(['farm','forester']),FSPOT=[[1.35,.42,0],[1.6,1.2,Math.PI],[.9,1.58,Math.PI],[.4,1.2,0]];
const wkJob=s=>s.type==='farm'?'f':'p';
function wkOf(s){const w=s.wk;return w&&w.hp>0&&w.wk===s&&w.job===wkJob(s)?w:null}
function wkFree(u){let b=null,bd=(70*TS)**2;const ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS);
 for(const s of structs){if(s.t!==0||!WKT.has(s.type)||s.prog<1||s.hp<=0||(s.pl|0)!==(u.pl|0)||wkOf(s))continue;const d=(s.x-u.x)**2+(s.y-u.y)**2;if(d>=bd)continue;
  let ok=false;for(const[x,y]of ringOf(s))if(sameComp(ux,uy,x,y)){ok=true;break}if(ok){bd=d;b=s}}return b}
function wkSet(u,s){if(u.onF)farmOff(u);u.role=null;u.job=wkJob(s);u.wk=s;s.wk=u;u.tl=-1;u.o=null;u.rb=null;u.rk=0;u.work=0;u.fs=(u.uid|0)&3;u.pt=-1;leaveSquad(u)}
function farmSpot(s,k){const p=FSPOT[k&3],th=(s.hm?0:(s.rot|0))*Math.PI/2,c=Math.cos(th),n=Math.sin(th),ox=p[0]-1,oz=p[1]-1;return{x:s.x+(ox*c+oz*n)*TS,y:s.y+(-ox*n+oz*c)*TS,f:p[2]+th}}
const wkLive=u=>{const s=u.wk;return !!s&&s.hp>0&&s.prog>=1&&structs.includes(s)};
/* leaving the field: step out onto the nearest free tile around it */
function farmOff(u){u.onF=0;const s=u.wk;if(!s||!structs.includes(s)||s.hp<=0)return;let b=null,bd=1e18;for(const[x,y]of ringOf(s)){const px=(x+.5)*TS,py=(y+.5)*TS,d=(px-u.x)**2+(py-u.y)**2;if(d<bd){bd=d;b=[px,py]}}if(b){u.x=b[0];u.y=b[1]}}
function farmer(u,dt){const s=u.wk;if(!wkLive(u)){u.job=null;u.wk=null;return}
 const o=wkOf(s);if(o&&o!==u){u.job=null;u.wk=null;return}s.wk=u;
 if(!u.onF){if(u.x>(s.tx-.7)*TS&&u.x<(s.tx+s.sz+.7)*TS&&u.y>(s.ty-.7)*TS&&u.y<(s.ty+s.sz+.7)*TS){u.onF=1;u.work=0}
  else{u.work=0;stepF(u,gField('s'+s.ty*TW+s.tx,s.tx,s.ty,s.sz),s.x,s.y,dt);return}}
 u.gz=(s.bh||0)+.1;const p=farmSpot(s,u.fs|0);
 if(dist(u.x,u.y,p.x,p.y)>3){moveTo(u,p.x,p.y,dt*.55);u.work=0}else{u.work+=dt;u.face=p.f;if(u.work>3.4){u.work=0;u.fs=((u.fs|0)+1)&3}}
 s.fw=(s.fw||0)+dt;if(s.fw>=FARMT){s.fw-=FARMT;RESP[u.pl|0].f+=FARMY*(RS2.done.harvest?1.5:1);puff(s.x,s.y,'#f2d060',5,36,{T:.8,z:.4,vz:1.6,g:-.6,s:.07})}}
/* saplings: tile -> {t: planted at, s: hut}. Every 4th tile of a sparse pattern, never beside a building, a road, a ramp
   or near a castle, so forests stay walkable; a sapling becomes a tree (3 wood harvests) after GROWT seconds */
const SAPL=new Map(),PRES=new Map(),GROWT=75,FOR_R=7,FOR_MAX=10;let saplT=0;
function plantOK(i){const x=i%TW,y=(i/TW)|0;if(x<2||y<2||x>=TW-2||y>=TH-2||!gOK(x,y)||ter[i]!==0||SAPL.has(i)||inDoor(x,y))return false;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=i+dy*TW+dx;if(occ.has(j)||stairs.has(j)||pth[j]||tfo.has(j))return false}
 /* natural-looking woods: never side by side, one diagonal neighbour at most, a few trees around, and every free tile beside stays open on two sides */
 const tr=j=>ter[j]===2||SAPL.has(j)||pLive(j);for(const[dx,dy]of D4)if(tr(i+dy*TW+dx))return false;
 let nd=0;for(const dx of[-1,1])for(const dy of[-1,1])if(tr(i+dy*TW+dx))nd++;if(nd>1)return false;
 let nt=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if((dx||dy)&&tr(i+dy*TW+dx))nt++;if(nt>4)return false;
 for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*TW+nx;if(solid(nx,ny))continue;let op=0;for(const[ax,ay]of D4){const m=n+ay*TW+ax;if(m!==i&&!solid(nx+ax,ny+ay)&&!SAPL.has(m)&&!pLive(m))op++}if(op<2)return false}
 for(const c of aliveC())if(Math.abs(x-c.tx-1)<=4&&Math.abs(y-c.ty-1)<=4)return false;return true}
const pLive=j=>{const r=PRES.get(j);return !!r&&r.hp>0&&r.pt===j};
function plantPick(u,s){const cx=s.tx+1,cy=s.ty+1,ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS),C=[];
 for(let dy=-FOR_R;dy<=FOR_R;dy++)for(let dx=-FOR_R;dx<=FOR_R;dx++){const r2=dx*dx+dy*dy;if(r2<5||r2>FOR_R*FOR_R+2)continue;const i=(cy+dy)*TW+cx+dx;
  const rv=PRES.get(i);if(rv&&rv!==u&&rv.hp>0&&rv.pt===i)continue;if(BAD.get(i)>time)continue;if(plantOK(i))C.push(i)}
 /* a random spot among the free ones, the first he can walk to */
 for(let n=C.length;n>0;n--){const k=Math.floor(Math.random()*n),i=C[k];C[k]=C[n-1];const x=i%TW,y=(i/TW)|0;if(D4.some(([ax,ay])=>!solid(x+ax,y+ay)&&sameComp(ux,uy,x+ax,y+ay)))return i}
 return -1}
function relPt(u){if(u.pt>=0&&PRES.get(u.pt)===u)PRES.delete(u.pt);u.pt=-1}
function forHome(u,s,dt){u.work=0;if(dist(u.x,u.y,s.x,s.y)>TS*2.2)stepF(u,gField('s'+s.ty*TW+s.tx,s.tx,s.ty,s.sz),s.x,s.y,dt)}
function forester(u,dt){const s=u.wk;if(!wkLive(u)){relPt(u);u.job=null;u.wk=null;return}
 const o=wkOf(s);if(o&&o!==u){relPt(u);u.job=null;u.wk=null;return}s.wk=u;
 if(u.pt>=0&&(PRES.get(u.pt)!==u||!plantOK(u.pt)))relPt(u);
 if(!(u.pt>=0)){u.pt=-1;u.pwT=(u.pwT||0)-dt;if(u.pwT>0){forHome(u,s,dt);return}
  let n=0;for(const v of SAPL.values())if(v.s===s.sid)n++;
  if(n>=FOR_MAX){u.pwT=4;forHome(u,s,dt);return}
  u.pt=plantPick(u,s);if(u.pt<0){u.pwT=5;forHome(u,s,dt);return}PRES.set(u.pt,u)}
 const x=u.pt%TW,y=(u.pt/TW)|0,px=(x+.5)*TS,py=(y+.5)*TS;
 if(dist(u.x,u.y,px,py)<36){u.work+=dt;u.face=Math.atan2(px-u.x,py-u.y);if(u.work>3){u.work=0;SAPL.set(u.pt,{t:time,s:s.sid});PRES.delete(u.pt);u.pt=-1;u.pwT=1;puff(px,py,'#6fbe52',5,26)}}
 else{u.work=0;stepF(u,gField('p'+u.pt,x,y,1),px,py,dt)}}
/* saplings grow once a second; a sapling whose tile was taken dies, one that is stood on waits */
function saplTick(dt){saplT+=dt;if(saplT<1)return;saplT=0;if(!SAPL.size)return;
 for(const[i,v]of SAPL){const x=i%TW,y=(i/TW)|0;if(ter[i]!==0||occ.has(i)||pth[i]||stairs.has(i)){SAPL.delete(i);continue}if(time-v.t<GROWT)continue;
  let busy=false;for(const u of units)if(u.hp>0&&!u.gar&&Math.floor(u.x/TS)===x&&Math.floor(u.y/TS)===y){busy=true;break}if(busy)continue;
  SAPL.delete(i);ter[i]=2;amt[i]=3;mmTile(i);markP(x,y);fdDirty=true}}
/* roles (b builder, r repairer, t terraformer), wanted per player and kept filled while a guild stands:
   role peasants only do that work and wait at the guild when there is none; the others stop doing it on their own.
   Repairers stay out at night to keep the walls up (only lit buildings are repaired in the dark). */
const ROLE=[{b:0,r:0,t:0},{b:0,r:0,t:0}],RHAS=[{b:0,r:0,t:0},{b:0,r:0,t:0}],ROLEN={b:'builder',r:'repairer',t:'terraformer'};let roleT=0;
const guildOf=(p,x,y)=>{let b=null,bd=1e18;for(const s of structs)if(s.t===0&&s.type==='guild'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p){const d=(s.x-x)**2+(s.y-y)**2;if(d<bd){bd=d;b=s}}return b};
function roleOn(u,r){if(u.onF)farmOff(u);u.role=r;u.job=r==='t'?'t':'r';u.rk=r==='r'?1:0;u.tl=-1;u.o=null;u.rb=null;u.work=0;u.wk=null;leaveSquad(u)}
function roleOff(u){u.role=null;u.job=null;u.tl=-1;u.rb=null;u.rk=0;u.work=0}
function roleTick(dt){roleT+=dt;if(roleT<1)return;roleT=0;
 for(let p=0;p<(CS2?2:1);p++){const c0=p===1&&CS2?CS2:CS,G=guildOf(p,c0.x,c0.y);
  for(const r of['b','r','t']){const W=G?ROLE[p][r]:0,cur=units.filter(u=>u.t===0&&u.hp>0&&(u.pl|0)===p&&u.role===r);
   if(cur.length>W)for(const u of cur.slice(W))roleOff(u);
   else if(cur.length<W){const C2=units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&!u.role&&!u.shel&&!u.gar&&u.job!=='f'&&u.job!=='p');
    C2.sort((a,b)=>((!!a.job)-(!!b.job))||(((a.x-G.x)**2+(a.y-G.y)**2)-((b.x-G.x)**2+(b.y-G.y)**2))||(a.uid-b.uid));for(const u of C2.slice(0,W-cur.length)){roleOn(u,r);cur.push(u)}}
   RHAS[p][r]=cur.length}}}
function guildWait(u,dt){u.gwT=time;u.work=0;const G=guildOf(u.pl|0,u.x,u.y);if(!G)return;if(dist(u.x,u.y,G.x,G.y)>TS*2.4)stepF(u,gField('s'+G.ty*TW+G.tx,G.tx,G.ty,G.sz),G.x,G.y,dt)}
function roleAdj0(r,d){if(!(r in ROLE[0]))return;const R0=ROLE[CURPL|0],n=Math.max(0,Math.min(30,R0[r]+d));R0[r]=n;const me=CURPL===LPL();
 if(me){if(!guildOf(CURPL|0,CS.x,CS.y)){msgS='Build a guild first';msgT=3;snd('err');return}msgS=n+' '+ROLEN[r]+(n===1?'':'s')+' wanted';msgT=2.5;snd('click')}}
function peasant(u,dt){const px=u.x,py=u.y,hadO=!!u.o;peasant0(u,dt);
 if(u.role&&u.gwT===time){u.skt=0;return}
 if(!u.o&&!u.carry&&u.tl<0&&(u.noT||0)>1&&(u.job==='w'||u.job==='s'||u.job==='g')){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty);if(fv(S,tx,ty)>=65535){const f=reachTile(S,tx,ty);if(f){puff(u.x,u.y,'#e8e8e8',5,30);u.x=(f[0]+.5)*TS;u.y=(f[1]+.5)*TS;u.lx=u.x;u.ly=u.y;u.noT=0;return}}}
 if(hadO||u.o||u.work>0||!(u.carry||u.job)||u.wlk!==time){u.skt=0;return}
 if(!u.skt||(dist(u.x,u.y,u.skx,u.sky)>TS*.7&&!(time-(u.pfT||0)>3))){u.skx=u.x;u.sky=u.y;u.skt=1e-4;u.nudged=0;return}
 u.skt+=dt;
 if(u.skt>1.4&&!u.nudged){u.nudged=1;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),a=ty*TW+tx,o=(Math.random()*8)|0;
  for(let k=0;k<8;k++){const[dx,dy]=D8[(k+o)&7],x=tx+dx,y=ty+dy;if(!gOK(x,y)||solid(x,y)||!canStep(a,y*TW+x)||(dx&&dy&&(solid(tx+dx,ty)||solid(tx,ty+dy)))||!sameComp(tx,ty,x,y))continue;
   u.x+=((x+.5)*TS-u.x)*.6;u.y+=((y+.5)*TS-u.y)*.6;break}return}
 if(u.skt<3)return;
 u.skt=0;u.nudged=0;{
  const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty);
  if(fv(S,tx,ty)>=65535){const f=reachTile(S,tx,ty);if(f){puff(u.x,u.y,'#e8e8e8',5,30);u.x=(f[0]+.5)*TS;u.y=(f[1]+.5)*TS;u.lx=u.x;u.ly=u.y;return}
   /* walled in, far from any way out: tell the player once in a while */
   const c0=CS;if((u.pl|0)===LPL()&&c0&&!(c0.cutT>time)){c0.cutT=time+40;msgS='A villager is cut off from your castle and storages - open a way or build a gate';msgT=5;ALERTS.push({x:u.x,y:u.y,t:4})}}
  if(u.carry){u.stk2=(u.stk2||0)+1;if(u.stk2>=3){RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0;return}if(!solid(tx,ty)){u.x=(tx+.5)*TS;u.y=(ty+.5)*TS;u.lx=u.x;u.ly=u.y}u.los=false;u.lt=1}
  else if(u.tl>=0){BAD.set(u.tl,time+60);u.tl=-1}
  else if(u.job==='p'&&u.pt>=0){BAD.set(u.pt,time+60);relPt(u);u.pwT=2}}}
/* repairing a finished building costs part of what it was built with (half its price for a full repair) */
const RPF=.5,RNM={g:'gold',w:'wood',s:'stone'};
function repCost(b){return b.cost&&Object.keys(b.cost).some(k=>b.cost[k]>0)?b.cost:{w:150,s:100}}
function repTick(b,dt){const add=Math.min(b.max-b.hp,Math.max(20,b.max*.03)*dt);if(add<=0)return true;const c=repCost(b),Rr=RESP[b.pl|0];b.rpa=b.rpa||{};
 for(const k in c){if(!(c[k]>0))continue;if((b.rpa[k]||0)+c[k]*RPF*add/b.max>=1&&Rr[k]<1){b.noRep=time+6;if((b.pl|0)===LPL()&&!(b.rpm>time)){b.rpm=time+4;msgS='Not enough '+RNM[k]+' to repair the '+(NAMES[b.type]||b.type);msgT=3}return false}}
 for(const k in c){if(!(c[k]>0))continue;b.rpa[k]=(b.rpa[k]||0)+c[k]*RPF*add/b.max;if(b.rpa[k]>=1){const n=Math.floor(b.rpa[k]);Rr[k]-=n;b.rpa[k]-=n}}
 b.hp=Math.min(b.max,b.hp+add);return true}
function repair0(sid){const s=structs.find(q=>q.sid===sid&&q.t===0&&(q.pl|0)===(CURPL|0));if(!s)return;const me=CURPL===LPL();
 if(s.hp>=s.max&&s.prog>=1){if(me){msgS=(NAMES[s.type]||'It')+' is not damaged';msgT=2}return}
 const P=units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&(!u.gar||u.shel)&&(u.pl|0)===(CURPL|0)).sort((a,b)=>((b.rb===s)-(a.rb===s))||(dist(a.x,a.y,s.x,s.y)-dist(b.x,b.y,s.x,s.y))),n=Math.min(P.length,s.sz>=2?4:2);
 for(let i=0;i<n;i++){const u=P[i];if(u.shel)shelOut(u,u.shel,false);u.job='r';u.rb=s;u.rk=1;u.o=null;u.tl=-1;if(shelOn)u.nso=1}s.noRep=0;
 if(me){msgS=n?n+' peasant'+(n>1?'s':'')+' sent to repair the '+(NAMES[s.type]||'building')+' (uses resources)':'No peasants available';msgT=3}snd('order')}
function litGoal(u){const ux=(u.x/TS)|0,uy=(u.y/TS)|0;let b=null,bd=1e12;for(const[x,y,r]of LITL){const d=dist(u.x,u.y,x,y);if(d>=bd)continue;let ok=null;
  for(let k=0;k<16&&!ok;k++){const a=k/16*6.2832,rr=Math.min(r*.55,TS*(1.5+(k&3)*.6)),qx=Math.floor((x+Math.cos(a)*rr)/TS),qy=Math.floor((y+Math.sin(a)*rr)/TS);if(gOK(qx,qy)&&!solid(qx,qy)&&sameComp(ux,uy,qx,qy))ok={x:(qx+.5)*TS,y:(qy+.5)*TS}}
  if(ok){bd=d;b=ok}}return b}
function toLight(u){const L=litGoal(u);if(!L)return false;u.o={x:L.x,y:L.y,g:mkG(Math.floor(L.x/TS),Math.floor(L.y/TS),u.x/TS,u.y/TS)};u.gx=L.x;u.gy=L.y;return true}
function peasant0(u,dt){
 if(u.role&&!u.job){u.job=u.role==='t'?'t':'r';u.rk=u.role==='r'?1:0;u.tl=-1}
 if(!u.job&&!u.o)u.work=0;
 if(u.o){walk(u,dt);return}
 if(u.job==='f'){farmer(u,dt);return}
 if(u.job==='p'){forester(u,dt);return}
 if(u.dk&&!u.carry&&LITL.length&&u.job!=='r'&&u.job!=='t'&&u.job!=='f'&&u.job!=='p'){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty),D=depBest(S,tx,ty);let hc,dp;if(!(D&&D.v<65535)&&toLight(u))return;if(D&&D.v<65535){hc=D.S.dep;dp=hc.type==='castle'&&D.v<DSIDE?dpt(hc):{x:hc.x,y:hc.y}}else{hc=homeOf(u);dp=dpt(hc)}stepF(u,S,dp.x,dp.y,dt);u.work=0;if(u.tl>=0){BAD.set(u.tl,time+40);u.tl=-1}return}
 if(u.carry){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),S=depFieldAt(tx,ty),D=depBest(S,tx,ty);let hc,dp;
  if(D&&D.v<65535){hc=D.S.dep;dp=hc.type==='castle'&&D.v<DSIDE?dpt(hc):{x:hc.x,y:hc.y}}else{hc=homeOf(u);dp=dpt(hc)}
  stepF(u,S,dp.x,dp.y,dt);let ok=atDepot(u);if(!ok&&D&&hc.type==='castle'&&D.v>=DSIDE&&D.v<65535&&dist(u.x,u.y,hc.x,hc.y)<TS*2.7)ok=hc;
  if(ok){RESP[u.pl|0][u.cj]+=GET[u.cj];u.carry=false;u.stk2=0;snd('coin',u.x,u.y)}return}
 if(!u.job){const wp=u.hp>0&&!u.gar?wkFree(u):null;if(wp){wkSet(u,wp);return}if(tfo.size&&u.hp>0&&!RHAS[u.pl|0].t){u.job='t';u.tl=-1}else if(pendB&&!RHAS[u.pl|0].b){u.job='r'}else{u.idle=(u.idle||0)+dt;if(u.idle<1.5||u.hp<=0||u.gar)return;u.idle=0;let bj=null,bi=-1,bd=1e9;for(const j of['w','s','g']){const i=nearest(j,u.pl,u);if(i<0)continue;const d=dist(u.x,u.y,(i%TW+.5)*TS,((i/TW|0)+.5)*TS);if(d<bd){bd=d;bj=j;bi=i}}if(!bj)return;u.job=bj;u.tl=bi;u.lastT=bi;CLM.set(bi,u);return}}
 if(u.job==='t'){if(u.tl<0||!tfo.has(u.tl))u.tl=nearestTf(u);if(u.tl<0){if(u.role){guildWait(u,dt);return}u.job=null;return}const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;
  if(dist(u.x,u.y,tx,ty)<44){u.work+=dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>2.4){u.work=0;doTf(u.tl);u.tl=-1}}else stepF(u,gField('t'+u.tl,u.tl%TW,(u.tl/TW)|0,1),tx,ty,dt);return}
 if(u.job==='r'){let b=null,bd=1e9;const rb=u.rb;
  if(rb&&structs.includes(rb)&&rb.hp>0&&(rb.hp<rb.max||rb.prog<1||rb.dem)&&!(rb.prog>=1&&!rb.dem&&rb.noRep>time)){b=rb;bd=dist(u.x,u.y,rb.x,rb.y)}
  else{u.rb=null;for(const s of structs)if(s.t===0&&(s.pl|0)===(u.pl|0)&&!(s.unr>time)&&(u.role==='r'?(s.prog>=1&&!s.dem&&s.hp<s.max&&!(s.noRep>time)):(s.prog<1||s.dem||(u.rk&&s.hp<s.max&&!(s.noRep>time))))){if(LITL.length&&s.prog>=1&&!s.dem&&!litAt(s.x,s.y))continue;const dd=dist(u.x,u.y,s.x,s.y);if(dd<bd){bd=dd;b=s}}}
  if(b){if(bd-b.rad<40){u.unr=0;if(b.prog>=1&&!b.dem&&!repTick(b,dt)){u.rb=null;u.work=0;if(u.role){guildWait(u,dt);return}u.job=null;u.rk=0;return}u.work=1}else{const G=gField('s'+b.ty*TW+b.tx,b.tx,b.ty,b.sz);
   if(fv(G,Math.floor(u.x/TS),Math.floor(u.y/TS))>=65535){u.unr=(u.unr||0)+dt;if(u.unr>4){u.unr=0;b.unr=time+45;u.rb=null;u.work=0;if((b.pl|0)===LPL()&&!(b.unm>time)){b.unm=time+40;msgS=(b.prog<1?'A construction site':'The '+(NAMES[b.type]||'building'))+' cannot be reached by your peasants';msgT=4;ALERTS.push({x:b.x,y:b.y,t:4})}if(!u.role){u.job=null;u.rk=0}return}}else u.unr=0;stepF(u,G,b.x,b.y,dt)}}else if(u.role){guildWait(u,dt)}else{u.job=null;u.work=0;u.rk=0}return}
 if(u.tl>=0&&rclaimed(u.tl,u))u.tl=-1;
 if(u.tl<0||ter[u.tl]!==CODE[u.job]){let c=u.lastT>=0?nearestLocal(u.job,u,10):-1;if(c<0)c=nearest(u.job,u.pl,u);u.tl=c}
 if(u.tl<0){u.noT=(u.noT||0)+dt;if(u.noT>1.2){u.noT=0;let bj=null,bi=-1,bw=1e9;for(const j of['w','s','g']){if(j===u.job)continue;const i=nearest(j,u.pl,u);if(i>=0&&nearest.w<bw){bw=nearest.w;bj=j;bi=i}}if(bj){u.job=bj;u.tl=bi;u.lastT=bi;CLM.set(bi,u)}else if(!u.role){u.job=null;u.idle=0}}return}u.noT=0;CLM.set(u.tl,u);u.lastT=u.tl;
 const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;
 if(dist(u.x,u.y,tx,ty)<42){u.work+=dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>WORK*(RS2.done.tools?.75:1)){snd(u.job==='w'?'chop':'mine',u.x,u.y);u.work=0;u.carry=true;u.cj=u.job;if(--amt[u.tl]<=0){const i=u.tl;ter[i]=0;mmTile(i);markP(i%TW,(i/TW)|0)}}}
 else stepF(u,gField(u.tl,u.tl%TW,(u.tl/TW)|0,1),tx,ty,dt)}
/* bomber: walks up to a building or a soldier, lights its fuse (1.1 s) and blows up; killed, it blows up where it falls (in the horde too) */
function bomberAI(u,d,dt){if(u.fuse>0){u.fuse-=dt;u.walk=0;if(u.fuse<=0){u.boomed=1;boom(u.x,u.y,1);u.hp=0;u.nokill=true}return true}
 const[b,bd]=target(u,150,0);if(b&&bd<=22+d.r){u.fuse=1.1;u.face=Math.atan2(b.x-u.x,b.y-u.y);snd('fuse',u.x,u.y);return true}return false}
function boom(x,y,pw){const R=TS*2.4,X=x/TS,Z=y/TS;let me=false;
 snd('boom',x,y);vflash(x,y,gh(X,Z)+.7,3.8,[1,.62,.25],.6,1);puff(x,y,'#8a7058',22,120,{T:.9,z:.3,vz:4.6,g:10,s:.16});puff(x,y,'#ffb050',14,100,{T:.5,z:.5,vz:3.4,g:6,s:.13});puff(x,y,'#ff8a2a',8,70,{T:.45,z:.6,vz:2.6,g:3,s:.12});
 ring(x,y,'#e8c890',26,340);puff(x,y,'#3e3a38',7,50,{soft:1,T:2.6,s:.85,z:.7,vz:1.8,g:-.25});puff(x,y,'#7a6450',5,90,{soft:1,T:1.5,s:.55,z:.2,vz:.6,g:-.1});shake(.35);
 for(const s of structs)if(s.hp>0&&s.t!==1){const dd=Math.max(0,dist(s.x,s.y,x,y)-(s.rad||20));if(dd<R){s.hp-=320*pw*(1-dd/R*.6)*(s.t===0&&RS2.done.bastion?.72:1)*(s.type==='castle'||s.type==='keep'?.5:1);if(s.t===0)me=true}}
 for(const e of units)if(e.hp>0&&!e.gar&&!e.shel){const dd=Math.max(0,dist(e.x,e.y,x,y)-T[e.type].r);if(dd<R){e.hp-=(e.t===1?28:75)*pw*(1-dd/R*.6);e.hurt=.25;if(e.t===0)me=true}}
 swSplash(x,y,R,25*pw,400);crater(Math.floor(X),Math.floor(Z));
 if(me&&alertT<=0){alertT=8;ALERTS.push({x,y,t:5});msgS='A bomber blew up!';msgT=3;snd('alarm')}}
const SCRT=new Set();
/* the blast digs a crater: 2 levels at the centre, 1 around; trees go, rock and ore stay, buildings and ramps are spared; the walls of the hole can be climbed */
function crater(tx,ty){const ch=[];
 const low=(x,y,dd)=>{if(x<1||y<1||x>=TW-1||y>=TH-1||!gOK(x,y))return;const i=y*TW+x;if(ter[i]===1||ter[i]>=3||occ.has(i)||stairs.has(i))return;
  let mn=LAND-3;for(const[ax,ay]of D4)if(ter[i+ay*TW+ax]===1){mn=LAND;break}const nh=Math.max(mn,HT[i]-dd);
  if(ter[i]===2){ter[i]=0;amt[i]=0}else if(nh>=HT[i])return;HT[i]=nh;TFL[i]=1;pth[i]=0;SAPL.delete(i);SCRT.add(i);ch.push(i)};
 for(const[dx,dy]of D8)low(tx+dx,ty+dy,1);for(const[dx,dy]of D4)if(hs(tx+dx*2,ty+dy*2,41)<.6)low(tx+dx*2,ty+dy*2,1);low(tx,ty,2);
 for(const[dx,dy]of D8){const x=tx+dx*2,y=ty+dy*2;if(gOK(x,y)&&ter[y*TW+x]===0&&hs(x,y,43)<.5){SCRT.add(y*TW+x);ch.push(y*TW+x)}}if(!ch.length)return;
 for(const i of ch){const x=i%TW,y=(i/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(i)}fdDirty=true;GF.clear()}
/* acid spitter: stops at 3.5 tiles and spits; the acid burns men and buildings for a few seconds and leaves a puddle that burns whoever walks in it */
const PUD=[];
function acidAI(u,d,dt){const[b]=target(u,d.rng,0);if(!b)return false;u.face=Math.atan2(b.x-u.x,b.y-u.y);u.walk=0;
 if(u.cd<=0){u.cd=d.cdt*(.85+Math.random()*.3);u.atk=.35;const dd=dist(u.x,u.y,b.x,b.y),t=.5+dd/600;fx.push({k:'acid',x1:u.x,y1:u.y,x2:b.x+rnd(-10,10),y2:b.y+rnd(-10,10),t,T:t,h0:gh(u.x/TS,u.y/TS)+.62,done:0});snd('spit',u.x,u.y)}return true}
function acidSplash(x,y,big){const R=big?TS*1.5:TS*.95,dps=4+.15*waveN,tm=big?5:4;let me=false;
 snd('sizzle',x,y);puff(x,y,'#b8f040',big?16:9,big?90:60,{T:.6,z:.3,vz:2.4,g:7,s:.09});puff(x,y,'#6a8a2a',big?4:2,30,{soft:1,T:1.6,s:.45,z:.3,vz:.6,g:-.15});
 for(const e of units)if(e.t!==1&&e.hp>0&&!e.gar&&!e.shel){const dd=dist(e.x,e.y,x,y)-T[e.type].r;if(dd<R){e.hp-=big?8:5;e.acid=Math.max(e.acid||0,tm);e.acidD=Math.max(e.acidD||0,dps);e.hurt=.2;if(e.t===0)me=true}}
 for(const s of structs)if(s.t!==1&&s.hp>0){const dd=dist(s.x,s.y,x,y)-(s.rad||20);if(dd<R){s.acid=Math.max(s.acid||0,tm);s.acidD=big?14:10;if(s.t===0)me=true}}
 if(PUD.length>=48)PUD.shift();PUD.push({x,y,r:R*.85,t:big?8:5,T:big?8:5});
 if(me&&alertT<=0){alertT=8;ALERTS.push({x,y,t:5});msgS='Acid! Your men and walls are burning';msgT=3;snd('alarm')}}
function acidTick(dt){const dps=4+.15*waveN;
 for(const e of units)if(e.acid>0){e.acid-=dt;if(e.hp>0&&!e.shel&&!e.gar){e.hp-=e.acidD*dt;if(REALR()<dt*4)puff(e.x,e.y,'#b8f040',1,16,{T:.5,z:.5,vz:1.4,g:-.3,s:.06})}if(e.acid<=0)e.acidD=0}
 for(const s of structs)if(s.acid>0){s.acid-=dt;if(s.hp>0){s.hp-=s.acidD*dt*(RS2.done.bastion?.72:1);if(REALR()<dt*3)puff(s.x+(REALR()-.5)*TS,s.y+(REALR()-.5)*TS,'#9ad030',1,14,{T:.9,z:.8,vz:1,g:-.3,s:.1})}if(s.acid<=0)s.acidD=0}
 for(let k=PUD.length-1;k>=0;k--){const P=PUD[k];P.t-=dt;if(P.t<=0){PUD.splice(k,1);continue}
  for(const e of units)if(e.t!==1&&e.hp>0&&!e.gar&&!e.shel&&Math.abs(e.x-P.x)<P.r&&Math.abs(e.y-P.y)<P.r&&dist(e.x,e.y,P.x,P.y)<P.r){e.acid=Math.max(e.acid||0,1.2);e.acidD=Math.max(e.acidD||0,dps)}}}
/* zombies that die take effect before the bodies are counted: a dead bomber blows up (it can set off others), a dead spitter bursts into a puddle */
function zDeathFx(){for(let pass=0;pass<6;pass++){let more=false;for(const u of units)if(u.hp<=0&&u.t===1&&!u.dfx){u.dfx=1;if(u.nokill)continue;if(u.type==='bomber'&&!u.boomed){u.boomed=1;boom(u.x,u.y,1);more=true}else if(u.type==='acid')acidSplash(u.x,u.y,1)}if(!more)break}}
/* miner: near a castle (40 tiles) he heads straight for it, tile by tile, and digs whatever stands in his way:
   trees, boulders, ore and rock are cleared, a step up is cut down (a step down: he digs his own tile), so the horde can follow */
function digStep(i,n){if(ter[n]===5){HT[n]=Math.max(HT[i]+1,HT[n]-2);ter[n]=HT[n]>=ROCKH?5:0;amt[n]=0}else if(ter[n]>=2){ter[n]=0;amt[n]=0}
 else if(HT[n]>HT[i]+1)HT[n]=Math.max(HT[i]+1,HT[n]-(HT[n]-HT[i]>4?2:1));
 else if(HT[n]<HT[i]-1){if(HT[i]<=LAND-2)return false;HT[i]=Math.max(HT[n]+1,LAND-2,HT[i]-(HT[i]-HT[n]>4?2:1))}
 else if(!canStepZ(i,n)){TFL[n]=2;TFL[i]=2}
 if(TFL[n]!==1)TFL[n]=2;if(TFL[i]!==1)TFL[i]=2;for(const k of[i,n]){const x=k%TW,y=(k/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(k)}
 fdDirty=true;GF.clear();const px=(n%TW+.5)*TS,py=(((n/TW)|0)+.5)*TS;puff(px,py,'#9d7a50',8,60,{T:.6,z:.4,vz:2.4,g:9,s:.1});snd('dirt',px,py);return true}
function minerAI(u,d,dt){if(u.home)return false;const hc=nearC(u.x,u.y);if(!hc||dist(u.x,u.y,hc.x,hc.y)>TS*40){u.dg=-1;return false}
 {const[b]=target(u,110,0);if(b){u.dg=-1;return false}}
 const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),i=ty*TW+tx;
 if(u.dg>=0){const n=u.dg,nx=n%TW,ny=(n/TW)|0;
  if(occ.has(n)||ter[n]===1||stairs.has(n)||stairs.has(i)||Math.abs(nx-tx)+Math.abs(ny-ty)!==1)u.dg=-1;
  else if(ter[n]===0&&canStepZ(i,n))u.dg=-1;
  else{u.face=Math.atan2((nx+.5)*TS-u.x,(ny+.5)*TS-u.y);u.walk=0;u.dgT=(u.dgT||0)+dt;if(u.atk<=0){u.atk=.3;snd('mine',u.x,u.y)}
   if(u.dgT>=1.4){u.dgT=0;if(!digStep(i,n)){u.dg=-1;u.mnT=4;return false}}return true}}
 if(u.mnT>0){u.mnT-=dt;return false}
 const cx=Math.floor(hc.x/TS),cy=Math.floor(hc.y/TS),ddx=cx-tx,ddy=cy-ty;if(Math.abs(ddx)<=3&&Math.abs(ddy)<=3)return false;
 const ax=[[Math.sign(ddx),0],[0,Math.sign(ddy)]];if(Math.abs(ddy)>Math.abs(ddx))ax.reverse();let dig=-1;
 for(const[sx,sy]of ax){if(!sx&&!sy)continue;const nx=tx+sx,ny=ty+sy,n=ny*TW+nx;if(!gOK(nx,ny)||ter[n]===1||stairs.has(n))continue;if(occ.has(n))return false;
  if(ter[n]===0&&canStepZ(i,n)){moveTo(u,(nx+.5)*TS,(ny+.5)*TS,dt);return true}if(dig<0&&!stairs.has(i))dig=n}
 if(dig>=0){u.dg=dig;u.dgT=0;return true}return false}
function zTgt(u,b,bd,d,dt){if(bd<=14+d.r){u.tpr=0;if(u.cd<=0)hit(u,b);return}
 if(!(b.type in T)){if(u.tgo!==b||bd<u.tgd-4){u.tgo=b;u.tgd=bd;u.tpr=0}else if((u.tpr=(u.tpr||0)+dt)>3){u.ign=b;u.ignT=time+15;u.tpr=0}}/* straight at the target; if that stops gaining ground (a grove, a rock field), follow a path round it for a while */
 if(u.zpb!==b||bd<u.zpd-6){u.zpb=b;u.zpd=bd;u.zpt=0}else u.zpt=(u.zpt||0)+dt;if(u.zpt>3.5){u.zpc=7;u.zpt=0;u.zpd=bd}if(u.zpc>0&&bd>TS*1.2){u.zpc-=dt;chase(u,b,dt)}else moveTo(u,b.x,b.y,dt)}
function zomb(u,d,dt){if(u.home){const hm=u.home,far=dist(u.x,u.y,hm.x,hm.y);let[b,bd]=target(u,far>TS*22?0:260,0);if(b&&b===u.ign&&time<u.ignT)b=null;
  if(b){zTgt(u,b,bd,d,dt);if(Math.random()<.002)snd('groan',u.x,u.y);return}
  if(far>TS*2.5){u.wx=undefined;chase(u,hm,dt*.7);return}
  u.wt=(u.wt||0)-dt;if(u.wt<=0){u.wt=2+Math.random()*4;u.wx=hm.x+rnd(-80,80);u.wy=hm.y+rnd(-80,80);if(solidAt(u.wx,u.wy)||!losClear(u.x,u.y,u.wx,u.wy))u.wx=undefined;u.wd=1e9}
  if(u.wx!==undefined){const dd=dist(u.x,u.y,u.wx,u.wy);if(dd<=8||dd>u.wd-.02)u.wx=undefined;else{u.wd=dd;moveTo(u,u.wx,u.wy,dt*.4)}}return}
 if(u.type==='bomber'?bomberAI(u,d,dt):u.type==='acid'?acidAI(u,d,dt):u.type==='miner'?minerAI(u,d,dt):false)return;
 u.spdK=1;let[b,bd]=target(u,150,0);if(b&&b===u.ign&&time<u.ignT)b=null;
 if(b){zTgt(u,b,bd,d,dt);return}
 if(u.tb){const bb=u.tb;if(!bb.alive)u.tb=null;else if(u.ph>=u.tcut||dist(u.x,u.y,bb.x,bb.y)<TS*50){if(!bb.mat&&dist(u.x,u.y,bb.x,bb.y)<TS*9){absorbUnit(u,bb);return}
  const d0=dist(u.x,u.y,bb.x,bb.y);if(u.tbd===undefined||d0<u.tbd-TS){u.tbd=d0;u.tbt=0}else if((u.tbt=(u.tbt||0)+dt)>15){u.tb=null;u.tbd=undefined;u.reAnc=0;u.lost=0}
  if(u.tb){const S=baseZF(bb),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(S&&fv(S,tx,ty)<65535)stepF(u,S,bb.x,bb.y,dt);else moveTo(u,bb.x,bb.y,dt);return}}}
 if(u.lane>=0&&!u.inC){if(dist(u.x,u.y,LC(u.lane).x,LC(u.lane).y)>46*TS){if(laneWalk(u,dt))return}else u.inC=1}
 {const hc=nearC(u.x,u.y),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);let S=FD[0];if(fv(S,tx,ty)>=65535){const L2=longField(tx,ty);if(L2&&fv(L2,tx,ty)<65535)S=L2;else{u.clb=.4;moveTo(u,hc.x,hc.y,dt);return}}stepF(u,S,hc.x,hc.y,dt)}}
/* path field of the zombies toward an AI kingdom, shared by the whole horde and refreshed every 30 s */
function baseZF(b){if(b.zf!==undefined&&time-b.zft<30)return b.zf;const s=[];for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const x=b.tx+i,y=b.ty+j;if(gOK(x,y)&&!solid(x,y))s.push([x,y])}b.zf=s.length?bfsW(s,false,b.tx-56,b.ty-56,113,113):null;b.zft=time;return b.zf}
const zcount=()=>{let n=0;for(const u of units)if(u.t===1)n++;return n};
/* far from the castle a horde follows its lane through a chain of local path fields (one per few waypoints), so cliffs, lakes and woods no longer trap it at its spawn;
   where no path exists at all the zombies clamber over the obstacle */
const WSPN=110,LSEG=8,LFLD=new Map();let lfBud=3;
const LFQS=new Array(6*128).fill(null),LFQT=new Int32Array(6*128).fill(-1);
function laneFieldQ(L,sg){if(L<0||L>5||sg>127)return laneField(L,sg);const k=L*128+sg;if(LFQT[k]===SW.step)return LFQS[k];const S=laneField(L,sg);LFQS[k]=S;LFQT[k]=SW.step;return S}
function laneField(L,sg){const key=L*4096+sg,E=LFLD.get(key);if(E&&(E.v===ver||lfBud<=0))return E.S;if(E){lfBud--;LFLD.delete(key)}let S;
 const Wp=ROUTES[L].wps,a=Math.min(Wp.length-1,sg*LSEG),b=Math.min(Wp.length-1,a+LSEG+2);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=a;i<=b;i++){const p=Wp[i];x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
 x0=Math.floor(x0)-14;y0=Math.floor(y0)-14;x1=Math.ceil(x1)+14;y1=Math.ceil(y1)+14;let seeds=[],tg=b;
 for(let k=b;k>a&&!seeds.length;k--){const p=Wp[k],cx=p[0]|0,cy=p[1]|0;ensureAround(cx,cy,1);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if(!solid(cx+i,cy+j))seeds.push([cx+i,cy+j]);tg=k}
 S=seeds.length?bfsW(seeds,false,x0,y0,x1-x0,y1-y0):null;if(S)S.tg=tg;LFLD.set(key,{S,v:ver});if(LFLD.size>260)LFLD.delete(LFLD.keys().next().value);return S}
function laneWalk(u,dt){const Wp=ROUTES[u.lane].wps;while(u.ph<Wp.length&&dist(u.x,u.y,Wp[u.ph][0]*TS,Wp[u.ph][1]*TS)<TS*2)u.ph++;if(u.ph>=Wp.length)return false;
 const S=laneField(u.lane,Math.floor(u.ph/LSEG)),tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);
 if(S){const v=fv(S,tx,ty);if(v<65535){u.lost=0;u.reAnc=0;if(v<=3&&S.tg+1>u.ph){u.ph=Math.min(Wp.length,S.tg+1);return laneWalk(u,dt)}const g=Wp[S.tg];stepF(u,S,g[0]*TS,g[1]*TS,dt);return true}}
 u.lost=(u.lost||0)+dt;
 if(u.lost>1.5&&!u.reAnc){u.reAnc=1;let bj=u.ph,bd=1e18;for(let j=0;j<Wp.length;j++){const dx=Wp[j][0]*TS-u.x,dy=Wp[j][1]*TS-u.y,d=dx*dx+dy*dy;if(d<bd){bd=d;bj=j}}if(bj!==u.ph){u.ph=bj;return laneWalk(u,dt)}}
 if(u.lost>4){const L2=longField(tx,ty);if(L2&&fv(L2,tx,ty)<65535){const hc=nearC(u.x,u.y);stepF(u,L2,hc.x,hc.y,dt);return true}}
 u.clb=.4;moveTo(u,Wp[u.ph][0]*TS,Wp[u.ph][1]*TS,dt);return true}
let wmsg='';
function wave(){const L0=nextL.slice();wave0();if(!MP.on&&waveN>1)setTimeout(()=>saveGame('Autosave',true),400);const bm=waveN%5===3&&waveN>=3,mc=waveN%4===2;
 if(bm){for(const L of L0){const an=spawnAnchor(L),p=an.p;let hk=0;for(let i=0,nE=Math.round((12+waveN*5)*D_().zm*laneK(L,L0));i<nE;i++){if(i%3&&SWF>0){hk++;continue}if(zcount()>=720)break;const x=(p[0]+rnd(-5,5))*TS,y=(p[1]+rnd(-5,5))*TS;if(solidAt(x,y))continue;const zu=mkU(1,i%3?'husk':'runner',x,y,null,L);zu.hp*=1+.05*waveN;zu.ph=an.ph;units.push(zu)}if(hk)swQueue(L,an,hk*SWF)}bannerS2='BLOOD MOON - a bigger, faster horde! '+bannerS2}
 if(mc){const g=40+waveN*10,w=30+waveN*6,st=20+waveN*5;for(const R of RESP){R.g+=g;R.w+=w;R.s+=st}const cm='A merchant caravan passes: +'+g+' gold, +'+w+' wood, +'+st+' stone';if(ZNEW[waveN]){msgS+='  --  '+cm;msgT=12}else{msgS=cm;msgT=6}}WAVEZ=SW.n+swPending();for(const u of units)if(u.t===1&&u.lane>=0)WAVEZ++}
function spawnAnchor(L){const R=ROUTES[L],P=R.pts;let rem=0,i0=0;for(let i=P.length-1;i>0;i--){rem+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(rem>=WSPN){i0=i-1;break}}i0-=i0&1;for(let i=i0;i<R.pts.length;i+=2){const p=R.pts[i];ensureAround(p[0]|0,p[1]|0,1);const f=freeTile(p[0]|0,p[1]|0);if(f&&!solid(f[0],f[1])&&(f[0]-(p[0]|0))**2+(f[1]-(p[1]|0))**2<=16)return{p:[f[0]+.5,f[1]+.5],ph:Math.ceil(i/3)}}return{p:R.pts[0],ph:0}}
const laneK=(L,Ls)=>{const n=Math.max(1,Ls.filter(q=>(q>=3)===(L>=3)).length),b=Math.min(2.2,1+.15*(waveN-1));return b/n*(1+.15*(n-1))};
function wave0(){waveN++;wmsg='';if(waveN===2)ach('w1');if(waveN===6)ach('w5');if(waveN===11)ach('w10');const df=D_();
 for(const L of nextL){const an=spawnAnchor(L),p=an.p;
  const zf=(SITE2?.8:1)*laneK(L,nextL),nh=Math.min(260,Math.round((16+waveN*10)*df.zm*zf)),nz=Math.round(waveN*2.2*df.zm*zf),nr=waveN>=3?Math.round(waveN*.8*df.zm*zf):0,nb=waveN%5===0?Math.ceil(waveN/5*df.zm*zf):waveN>=12?Math.round((waveN-10)/8*df.zm*zf):0,
   nbm=waveN>=5?Math.round((1.5+(waveN-5)*.45)*df.zm*zf):0,nac=waveN>=10?Math.round((2+(waveN-10)*.5)*df.zm*zf):0,nmi=waveN>=15?Math.round((1+(waveN-15)*.3)*df.zm*zf):0;
  const add=(type,c,sp)=>{for(let i=0;i<c;i++){if(zcount()>=720)break;const x=(p[0]+rnd(-sp,sp))*TS,y=(p[1]+rnd(-sp,sp))*TS;if(solidAt(x,y))continue;const zu=mkU(1,type,x,y,null,L);zu.hp*=1+.05*waveN;zu.ph=an.ph;units.push(zu)}};
  const n0=units.length;if(SWF>0)swQueue(L,an,nh*SWF);else add('husk',nh,4.5);add('zombie',nz,3);add('runner',nr,3);add('brute',nb,2);add('bomber',nbm,3);add('acid',nac,3);add('miner',nmi,2);
  let tbb=null,tci=0;if(BASES.length){const R=ROUTES[L];let bd=1e9;for(const b of BASES)if(b.alive){let k=-1;for(let j=0;j<R.wps.length;j++)if(hyp(R.wps[j][0]-b.tx,R.wps[j][1]-b.ty)<44){k=j;break}if(k>=0&&k<bd){bd=k;tbb=b;tci=k}}}
  if(tbb){for(let k=n0;k<units.length;k++){units[k].tb=tbb;units[k].tcut=tci}wmsg='The horde turns on '+tbb.name}}
 snd('horn');bannerT=5;bannerS='WAVE '+waveN;bannerS2='Horde from '+nextL.map(L=>ROUTES[L].dir).join(' + ')+(waveN%5===0?'  -  BRUTES!':'');const zn=ZNEW[waveN];if(zn)bannerS2='NEW ZOMBIES: '+zn[0]+'!  -  from '+nextL.map(L=>ROUTES[L].dir).join(' + ');
 nextL=pickLanes();msgT=0;if(wmsg){msgS=wmsg;msgT=5}if(zn){msgS=zn[0]+': '+zn[1];msgT=10}}
const ZNEW={5:['BOMBERS','they blow up at your walls, or when they die - shoot them from afar, ideally inside the horde'],10:['ACID SPITTERS','their acid keeps burning men and walls - spread your troops'],15:['MINERS','they dig through cliffs, rock and woods to open a way for the horde']};
function callWave(){if(over||!inGame||waveT<8)return;if(waveOn){msgS='Finish this wave first: the next one comes after the rest time';msgT=3;snd('err');return}const b=Math.round((10+waveN*4)*Math.max(1,waveT/200));res.g+=b;waveT=0.01;msgS='Wave called early: +'+b+' gold';msgT=3}
/* ================= THE SWARM: the wave husks as a light-weight crowd (tens of thousands of zombies) =================
   typed arrays stepped at 20 Hz - path fields + tile density drive the flow - cell lists answer the combat queries */
const SWMAX=30000,SWDT=.05,SWCS=4,SWCW=Math.ceil(TW/SWCS),SWCH=Math.ceil(TH/SWCS),SWSP=31;
const SW={n:0,acc:0,step:0,fxN:0,gacc:[0,0],q:[],
 x:new Float32Array(SWMAX),y:new Float32Array(SWMAX),px:new Float32Array(SWMAX),py:new Float32Array(SWMAX),hp:new Float32Array(SWMAX),cd:new Float32Array(SWMAX),
 ln:new Int8Array(SWMAX),ph:new Uint16Array(SWMAX),ri:new Uint16Array(SWMAX),k:new Uint8Array(SWMAX),ti:new Int32Array(SWMAX),fa:new Float32Array(SWMAX),ta:new Float32Array(SWMAX),mx:new Float32Array(SWMAX),my:new Float32Array(SWMAX),sd:new Uint16Array(SWMAX),id:new Uint32Array(SWMAX),st:new Uint8Array(SWMAX),nid:0};
const SWD=new Uint16Array(TW*TH),SWH=new Int32Array(SWCW*SWCH).fill(-1),SWN=new Int32Array(SWMAX),UNF=new Uint8Array(TW*TH),SNF=new Uint8Array(TW*TH),D9N=[[0,0],[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]];
let SWARMS=[],SWF=100,FZ=null;
const SWP={x:0,y:0,t:1,type:'husk',hp:1,swi:-1,swarm:true};
function swReset(){SW.n=0;SW.acc=0;SW.step=0;SW.q=[];SW.gacc=[0,0];SWARMS=[];SWD.fill(0);SWH.fill(-1);LFLD.clear();LFQT.fill(-1);LFQS.fill(null)}
function swPending(){let n=0;for(const q of SW.q)n+=q.left;return n}
function swQueue(L,an,cnt){cnt=Math.round(cnt*(waveN<=1?.45:waveN===2?.6:waveN===3?.75:waveN===4?.9:1));if(cnt>0)SW.q.push({ln:L,x:an.p[0],y:an.p[1],ph:an.ph,left:cnt,rate:Math.max(45,cnt/30),hp:5*(1+.04*waveN)})}
/* terrain-only passability (buildings ignored): the swarm's way to a walled-in castle goes through the walls */
const tsol=(x,y)=>!gOK(x,y)||ter[y*TW+x]>0;
function blkT(tx,ty,i,j){if(tsol(i,j))return true;const a=ty*TW+tx,b=j*TW+i;if(HT[a]===HT[b])return false;if(i!==tx&&j!==ty)return true;return !canStepZ(a,b)}
const ringT=c=>{const s=[];for(let j=c.ty-1;j<=c.ty+c.sz;j++)for(let i=c.tx-1;i<=c.tx+c.sz;i++)if(!tsol(i,j)&&!(i>=c.tx&&i<c.tx+c.sz&&j>=c.ty&&j<c.ty+c.sz))s.push([i,j]);return s};
function bfsT(seeds,x0,y0,w,h){x0=Math.max(0,x0);y0=Math.max(0,y0);w=Math.min(w,TW-x0);h=Math.min(h,TH-y0);ensureRect(x0,y0,w,h);
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
function swPick(S,tx,ty,terr,o){const m=fmask(S,tx,ty,terr);if(m<=0)return m===0?-1:-2;let bq=-1,bs=1e9;const W=S.w,F=S.F,fb=(ty-S.y0)*W+tx-S.x0,sb=ty*TW+tx;
 for(let q=0;q<8;q++){if(!(m&(1<<q)))continue;const dx=DX8[q],dy=DY8[q],sc=F[fb+dy*W+dx]*4+SWD[sb+dy*TW+dx]+((o>>q)&1)*1.5;if(sc<bs){bs=sc;bq=q}}
 return bq}
function swSpawn(){for(let qi=SW.q.length-1;qi>=0;qi--){const q=SW.q[qi];let m=Math.min(q.left,Math.ceil(q.rate*SWDT));q.left-=m;
  while(m-->0&&SW.n<SWMAX){let x=0,y=0,ok=false;for(let t=0;t<4&&!ok;t++){x=(q.x+rnd(-5,5))*TS;y=(q.y+rnd(-5,5))*TS;ok=!solidAt(x,y)}if(!ok)continue;
   const i=SW.n++;SW.x[i]=SW.px[i]=x;SW.y[i]=SW.py[i]=y;const ti=((SW.y[i]/TS)|0)*TW+((SW.x[i]/TS)|0);SW.hp[i]=q.hp;SW.cd[i]=Math.random();SW.ln[i]=q.ln;SW.ph[i]=q.ph;SW.ri[i]=q.ph*3;
   SW.k[i]=Math.random()<.72?0:1;SW.ti[i]=ti;SW.id[i]=++SW.nid;SW.st[i]=0;SW.fa[i]=SW.ta[i]=0;SW.sd[i]=(Math.random()*65536)|0;SWD[ti]++}
  if(q.left<=0)SW.q.splice(qi,1)}}
/* ================= NIGHT & LIGHT =================
   one night per wave: it falls as the horde closes in on the base, lasts while the horde fights, dawns 25 s after it is beaten;
   the next wave only spawns once this one is finished, after the usual rest time;
   at night whatever stands outside the light is hurt by the darkness */
let hordeT=-1e9,hordeOn=false,waveOn=false,burnAt=0,hordeD=1e9,nightLv=0,nightCk=0,waveST=-1e9;
const restT=()=>600*D_().tm;
/* the wave is finished when only a handful of stragglers is left (2%, or after 15 min at worst): the rest timer starts, and at dawn the sun burns the stragglers */
function waveTick(){let rem=SW.n+swPending();for(const u of units)if(u.t===1&&u.lane>=0)rem++;
 hordeOn=waveOn&&(SW.q.length>0||rem>Math.max(6,WAVEZ*.02))&&time-waveST<900;if(hordeOn)hordeT=time;
 else if(waveOn){waveOn=false;waveT=waveI=restT();burnAt=time+25;bannerT=4;bannerS='WAVE '+waveN+' BEATEN';bannerS2='Dawn is coming - next wave in '+mmss(waveT);snd('victory')}
 if(burnAt&&time>=burnAt){burnAt=0;let nb=0;for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;SW.hp[i]=0;if(nb++<40)puff(SW.x[i],SW.y[i],'#ff9a3c',3,30,{T:.9,z:.5,vz:2.4,g:-.5,s:.1})}
  for(const u of units)if(u.t===1&&u.lane>=0&&u.hp>0){u.hp=0;u.nokill=true;if(nb++<60)puff(u.x,u.y,'#ff9a3c',6,40,{T:1,z:.6,vz:2.6,g:-.5,s:.12})}if(nb){msgS='The sun burns the last zombies';msgT=3}}}
const smst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function hordeDist(){const C=aliveC();let b=1e18;if(!C.length)return 1e9;const st=Math.max(1,Math.ceil(SW.n/700));for(let i=0;i<SW.n;i+=st)for(const c of C){const dx=SW.x[i]-c.x,dy=SW.y[i]-c.y,d=dx*dx+dy*dy;if(d<b)b=d}
 for(const u of units)if(u.t===1&&u.lane>=0)for(const c of C){const dx=u.x-c.x,dy=u.y-c.y,d=dx*dx+dy*dy;if(d<b)b=d}return Math.sqrt(b)/TS}
function nightTick(dt){nightCk-=dt;if(nightCk>0)return;nightCk=.5;const n0=nightLv;if(hordeOn){hordeD=hordeDist();nightLv=Math.max(nightLv,1-smst(60,260,hordeD))}else{hordeD=1e9;if(time-hordeT>25)nightLv=0}
 if(n0<.3&&nightLv>=.3){msgS='Night falls - the horde is coming. The villagers shelter in the castle; keep your soldiers in the light!';msgT=6;snd('night')}}
function nightSim(){if(!inGame)return 0;return hordeOn?nightLv:nightLv*(1-smst(0,25,time-hordeT))}
const LIGHTR={castle:16,keep:12,tower:10,gate:5,barracks:5,academy:5,market:5,storage:5,house:4,torch:7,forester:4,guild:5};
const lampWall=s=>s.type==='wall'&&((s.tiles[0][0]+s.tiles[0][1]*3)%5===0);
function lightSources(){const L=[];for(const s of structs){if(s.prog<1||s.hp<=0)continue;let r=LIGHTR[s.type]||(lampWall(s)?4:0);if(s.type==='castle'&&s.tier)r=18;if(r)L.push([s.x,s.y,r*TS])}
 for(const u of units)if(u.hp>0&&u.t!==1&&!u.gar&&(u.type==='bannerman'||u.type==='captain'))L.push([u.x,u.y,(u.type==='bannerman'?5.5:4.5)*TS]);return L}
let LITL=[],darkT=0,darkMsg=-1e9;
const litAt=(x,y)=>{for(const l of LITL){const dx=x-l[0],dy=y-l[1];if(dx*dx+dy*dy<l[2]*l[2])return true}return false};
function darkTick(dt){darkT-=dt;if(darkT>0)return;darkT=.5;if(nightSim()<.55){if(LITL.length){LITL=[];for(const u of units)u.dk=false}return}LITL=lightSources();let hurt=0;
 for(const u of units){if(u.t!==0||u.hp<=0||u.gar){u.dk=false;continue}u.dk=!litAt(u.x,u.y);if(u.dk){u.hp-=Math.max(.3,T[u.type].hp*.01);u.hurt=.1;hurt++;if(Math.random()<.35)puff(u.x,u.y,'#4a2a6a',2,18,{T:.9,z:.7,vz:.9,g:-.4,s:.1})}}
 for(const s of structs){if(s.t!==0||s.prog<1||s.hp<=0||LIGHTR[s.type]||lampWall(s))continue;if(!litAt(s.x,s.y)&&s.hp>s.max*.25){s.hp=Math.max(s.max*.25,s.hp-Math.max(.4,s.max*.0015));if(Math.random()<.2)puff(s.x+rnd(-14,14),s.y+rnd(-14,14),'#2e1e40',2,22,{T:1.1,z:1,vz:.6,g:-.3,s:.13})}}
 if(hurt&&time-darkMsg>45){darkMsg=time;msgS='The darkness hurts! Stay near the castle, towers, torches or a bannerman';msgT=5}}
function swUpdate(dt){if(!SW.n&&!SW.q.length){if(SWARMS.length)SWARMS=[];SW.acc=0;return}SW.acc+=dt;let g=0;while(SW.acc>=SWDT&&g++<4){SW.acc-=SWDT;swStep()}if(SW.acc>SWDT)SW.acc=SWDT}
function swStep(){SW.step++;SW.fxN=0;lfBud=Math.max(lfBud,2);swSpawn();const n=SW.n,gs=gateSolid;gateSolid=true;
 /* units the swarm can bite: flag their 3x3 tiles */
 const UM=new Map(),flg=[];for(const u of units){if(u.t===1||u.hp<=0||u.gar)continue;const tx=(u.x/TS)|0,ty=(u.y/TS)|0,k=ty*TW+tx;let a=UM.get(k);
  if(!a){UM.set(k,a=[]);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=k+j*TW+i;if(q>=0&&q<TW*TH&&!UNF[q]){UNF[q]=1;flg.push(q)}}}a.push(u)}
 const sfl=[];for(const s of structs){if(s.t!==0||s.hp<=0||!s.tiles)continue;for(const[a,b]of s.tiles)for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++){const k=(b+j)*TW+a+q;if(k>=0&&k<TW*TH&&!SNF[k]){SNF[k]=1;sfl.push(k)}}}
 const hitS=new Set(),R46=(46*TS)**2,R62=(62*TS)**2,ZA=FD[0]&&FD[0].list?FD[0].list:FD[0]?[FD[0]]:[],ZZ=FZ&&FZ.list?FZ.list:FZ?[FZ]:[];
 for(let i=0;i<n;i++){const x=SW.x[i],y=SW.y[i],o=SW.sd[i];SW.px[i]=x;SW.py[i]=y;if(SW.hp[i]<=0)continue;SW.cd[i]-=SWDT;
  const tx=(x/TS)|0,ty=(y/TS)|0,ti=ty*TW+tx;
  if(UNF[ti]){let bu=null,bd=1e9;for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++){const a=UM.get(ti+j*TW+q);if(!a)continue;for(const u of a){const d=hyp(u.x-x,u.y-y)-T[u.type].r;if(d<bd){bd=d;bu=u}}}
   if(bu&&bd<=18){SW.st[i]=1;SW.ta[i]=Math.atan2(bu.x-x,bu.y-y);if(SW.cd[i]<=0){SW.cd[i]=.9+(SW.sd[i]&7)*.06;bu.swh=(bu.swh||0)+1;hitS.add(bu)}continue}}
  if(SNF[ti]){let bs=null;for(const[dx,dy]of D9N){const s=occ.get(ti+dy*TW+dx);if(s&&s.t===0&&s.hp>0){bs=s;break}}
   if(bs){SW.st[i]=7;SW.ta[i]=Math.atan2(bs.x-x,bs.y-y);if(SW.cd[i]<=0){SW.cd[i]=.9+(o&7)*.06;bs.swh=(bs.swh||0)+1;hitS.add(bs)}continue}}
  const L=SW.ln[i],C=LC(L),dcx=C.x-x,dcy=C.y-y,dc2=dcx*dcx+dcy*dcy;
  let gx=0,gy=0,has=false,dir=-2,ph=false;
  if(dc2<=R46)SW.ph[i]=65535;if(dc2>R46&&SW.ph[i]!==65535){const Wp=ROUTES[L].wps;let p=SW.ph[i];while(p<Wp.length&&Math.abs(Wp[p][0]*TS-x)<TS*2&&Math.abs(Wp[p][1]*TS-y)<TS*2)p++;
   if(p<Wp.length){let S=laneFieldQ(L,(p/LSEG)|0),v=S?fv(S,tx,ty):65535;if(S&&v<=3&&S.tg+1>p){p=Math.min(Wp.length,S.tg+1);if(p<Wp.length){S=laneFieldQ(L,(p/LSEG)|0);v=S?fv(S,tx,ty):65535}}SW.ph[i]=p;
    if(p<Wp.length){SW.st[i]=2;if(S&&v<65535){dir=swPick(S,tx,ty,false,o);if(dir===-1){const g=Wp[S.tg];gx=g[0]*TS;gy=g[1]*TS;has=true}}else{ph=true;SW.st[i]=3;const g=Wp[p];gx=g[0]*TS;gy=g[1]*TS;has=true}}}}
  if(dir===-2&&!has){let bs=null,bv=65535;for(const S of ZA){const v=fv(S,tx,ty);if(v<bv){bv=v;bs=S}}
   if(bs){dir=swPick(bs,tx,ty,false,o);SW.st[i]=4}else{for(const S of ZZ){const v=fv(S,tx,ty);if(v<bv){bv=v;bs=S}}if(bs){dir=swPick(bs,tx,ty,true,o);SW.st[i]=5}}
   if(dir<0){const hc=nearC(x,y);gx=hc.x;gy=hc.y;has=true;if(!bs)SW.st[i]=6}}
  if(dir>=0){gx=(tx+D8[dir][0]+.5)*TS+((o&255)/255-.5)*.62*TS;gy=(ty+D8[dir][1]+.5)*TS+(((o>>8)&255)/255-.5)*.62*TS}
  let vx=gx-x,vy=gy-y;const l=hyp(vx,vy);if(l>.5){vx/=l;vy/=l}else{vx=0;vy=0}
  const D0=SWD[ti];let jam=1;if(D0>1&&tx>0&&ty>0&&tx<TW-1&&ty<TH-1){const h0=HT[ti],pl=(swDn(ti,ti-1,h0,D0)-swDn(ti,ti+1,h0,D0))*.07,pu=(swDn(ti,ti-TW,h0,D0)-swDn(ti,ti+TW,h0,D0))*.07;vx+=pl>.6?.6:pl<-.6?-.6:pl;vy+=pu>.6?.6:pu<-.6?-.6:pu;if(D0>6)jam=Math.max(.3,1-(D0-6)*.05)}
  const sp=SWSP*(SW.k[i]?1.08:1)*(.9+(o>>13)*.03)*jam*SWDT;let nx=x+vx*sp,ny=y+vy*sp;
  nx=nx<TS?TS:nx>W-TS?W-TS:nx;ny=ny<TS?TS:ny>H-TS?H-TS:ny;const ntx=(nx/TS)|0,nty=(ny/TS)|0;
  if(ntx!==tx||nty!==ty){const pb=(a,b)=>!!occ.get(b*TW+a),B=ph?(a,b,c,d)=>pb(c,d):blk;
   const bl=ntx!==tx&&nty!==ty?(B(tx,ty,ntx,ty)||B(tx,ty,tx,nty)||B(tx,ty,ntx,nty)):B(tx,ty,ntx,nty);
   if(bl){let s=occ.get(nty*TW+ntx);if((!s||s.t===1)&&ntx!==tx)s=occ.get(ty*TW+ntx);if((!s||s.t===1)&&nty!==ty)s=occ.get(nty*TW+tx);
    if(s&&s.t!==1&&s.hp>0){SW.st[i]=7;SW.ta[i]=Math.atan2(s.x-x,s.y-y);if(SW.cd[i]<=0){SW.cd[i]=.9+(o&7)*.06;s.swh=(s.swh||0)+1;hitS.add(s)}nx=x;ny=y}
    else{const Dc=SWD[ti],cap=Math.min(6,(Dc>=5?1+((Dc-5)/6|0):0)+(SW.st[i]===6?2:0));let cm=false;
     if(cap){const cl=(a,b)=>{if(tsol(a,b)||occ.get(b*TW+a))return false;const dh=HT[b*TW+a]-HT[ti];return dh>0?dh<=cap:-dh<=2+cap};
      if(ntx!==tx&&nty!==ty){const ax=Math.abs(nx-x)>=Math.abs(ny-y);if(ax&&cl(ntx,ty)){ny=y;cm=true}else if(cl(tx,nty)){nx=x;cm=true}else if(!ax&&cl(ntx,ty)){ny=y;cm=true}}else cm=cl(ntx,nty)}
     if(!cm){const okx=ntx===tx||!B(tx,ty,ntx,ty),oky=nty===ty||!B(tx,ty,tx,nty);if(ntx!==tx&&nty!==ty){if(okx&&!oky)ny=y;else if(oky&&!okx)nx=x;else if(okx&&oky){if(Math.abs(nx-x)>Math.abs(ny-y))ny=y;else nx=x}else{nx=x;ny=y}}else if(ntx!==tx)nx=x;else ny=y}}}}
  if(nx!==x||ny!==y){SW.x[i]=nx;SW.y[i]=ny;nx=SW.x[i];ny=SW.y[i];SW.ta[i]=NaN;SW.mx[i]=nx-x;SW.my[i]=ny-y;const nti=((ny/TS)|0)*TW+((nx/TS)|0);
   if(nti!==ti){SWD[ti]--;SWD[nti]++;SW.ti[i]=nti;if(ph){const ck=((((ny/TS)|0)/CH)|0)*NCX+((((nx/TS)|0)/CH)|0);if(!genF[ck])genChunk(ck%NCX,(ck/NCX)|0)}}}}
 for(const q of flg)UNF[q]=0;for(const q of sfl)SNF[q]=0;
 /* the bites: capped per target so a pile of zombies cannot melt anything in a blink */
 for(const e of hitS){const hits=e.swh||0;e.swh=0;if(!hits||e.hp<=0)continue;const bs=!(e.type in T);
  const one=3*(e.t===0&&RS2.done.plate?.78:1)*(e.t===0&&RS2.done.mail?.85:1)*(bs?(e.t===0&&RS2.done.bastion?.72:1)*1.6:(e.cb?.8:1));
  e.hp-=Math.min(hits*one,bs?1.6:1.2);if(!bs)e.hurt=.2;
  if(e.t===0&&alertT<=0){alertT=8;ALERTS.push({x:e.x,y:e.y,t:5});msgS=bs?'Your '+(NAMES[e.type]||'building').toLowerCase()+' is under attack!':'Your units are under attack!';msgT=3;snd('alarm')}
  if(SW.fxN<14){SW.fxN++;if(bs)puff(e.x+rnd(-14,14),e.y+rnd(-14,14),'#8a8a90',2,40,{T:.4,z:.8,vz:2,g:8,s:.07});else blood(e.x,e.y,'#7a1a1a')}
  snd(bs?'stone':'zhit',e.x,e.y);if(!bs&&e.hp<=0&&e.t!==1)e.conv=true}
 gateSolid=gs;swCompact();swCells();if(SW.step%10===0||!SW.n)swRear()}
function swDn(ti,q,h0,D0){return ter[q]===0&&(HT[q]===h0||canStepZ(ti,q))?SWD[q]:D0}
function swCompact(){const n=SW.n;let w=0,dead=0;
 for(let i=0;i<n;i++){if(SW.hp[i]>0){if(w!==i){SW.x[w]=SW.x[i];SW.y[w]=SW.y[i];SW.px[w]=SW.px[i];SW.py[w]=SW.py[i];SW.hp[w]=SW.hp[i];SW.cd[w]=SW.cd[i];SW.ln[w]=SW.ln[i];SW.ph[w]=SW.ph[i];SW.ri[w]=SW.ri[i];SW.k[w]=SW.k[i];SW.ti[w]=SW.ti[i];SW.fa[w]=SW.fa[i];SW.ta[w]=SW.ta[i];SW.mx[w]=SW.mx[i];SW.my[w]=SW.my[i];SW.sd[w]=SW.sd[i];SW.id[w]=SW.id[i];SW.st[w]=SW.st[i]}w++;continue}
  dead++;SWD[SW.ti[i]]--;SW.gacc[SITE2&&SW.ln[i]>=3?1:0]+=.06;
  if(SW.fxN<44){SW.fxN++;const x=SW.x[i],y=SW.y[i];puff(x,y,'#efefef',3,26,{T:.6,z:.3,vz:1.3,g:-.6,s:.1});if(SW.fxN<20)puff(x,y,'#b8f040',1,20,{T:1,z:.3,vz:2.2,g:3.4,s:.07})}}
 SW.n=w;
 if(dead){const k0=kills;kills+=dead;if(k0<1)ach('k1');if(k0<100&&kills>=100)ach('k100');if(k0<500&&kills>=500)ach('k500');snd('die',SW.x[0]||0,SW.y[0]||0)}
 for(let p=0;p<2;p++)if(SW.gacc[p]>=1){const g=Math.floor(SW.gacc[p]);SW.gacc[p]-=g;RESP[p].g+=g}}
function swCells(){SWH.fill(-1);for(let i=0;i<SW.n;i++){const c=((SW.y[i]/TS/SWCS)|0)*SWCW+((SW.x[i]/TS/SWCS)|0);SWN[i]=SWH[c];SWH[c]=i}}
/* rear-most route point of each lane's swarm (the red trail starts there) */
function swRear(){const R={};
 for(let i=0;i<SW.n;i++){const L=SW.ln[i],P=ROUTES[L].pts;let bi=SW.ri[i],bd=1e18;const x=SW.x[i]/TS,y=SW.y[i]/TS,a0=Math.max(0,bi-10),a1=Math.min(P.length,bi+11);
  for(let q=a0;q<a1;q++){const dx=P[q][0]-x,dy=P[q][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=q}}SW.ri[i]=bi;const o=R[L]||(R[L]={lane:L,n:0,rear:1e9});o.n++;if(bi<o.rear)o.rear=bi}
 for(const q of SW.q){const o=R[q.ln]||(R[q.ln]={lane:q.ln,n:0,rear:1e9});o.n+=q.left;o.rear=Math.min(o.rear,q.ph*3)}
 SWARMS=Object.values(R).map(o=>({lane:o.lane,n:o.n,rear:o.rear>=1e9?0:o.rear}))}
const swarmBackIdx=w=>w.rear;
/* ---- combat queries ---- */
function swNear(x,y,r){if(!SW.n)return -1;const cs=SWCS*TS,ccx=(x/cs)|0,ccy=(y/cs)|0,RR=Math.ceil(r/cs);let bi=-1,bd=r*r;
 for(let rg=0;rg<=RR;rg++){for(let cy=ccy-rg;cy<=ccy+rg;cy++){if(cy<0||cy>=SWCH)continue;const edge=cy===ccy-rg||cy===ccy+rg;for(let cx=ccx-rg;cx<=ccx+rg;cx+=edge?1:2*rg||1){if(cx<0||cx>=SWCW)continue;
   for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const dx=SW.x[i]-x,dy=SW.y[i]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}}}
  if(bi>=0&&bd<(rg*cs)*(rg*cs))break}
 return bi}
function swSplash(x,y,r,dmg,cap){if(!SW.n)return 0;const cs=SWCS*TS,c0=Math.max(0,((x-r)/cs)|0),c1=Math.min(SWCW-1,((x+r)/cs)|0),r0=Math.max(0,((y-r)/cs)|0),r1=Math.min(SWCH-1,((y+r)/cs)|0),r2=r*r;let n=0,k=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++)for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const dx=SW.x[i]-x,dy=SW.y[i]-y;if(dx*dx+dy*dy>r2)continue;SW.hp[i]-=dmg;if(SW.hp[i]<=0)k++;if(++n>=cap)return k}
 return k}
function swLine(x1,y1,x2,y2,w,dmg,cap){if(!SW.n)return 0;const cs=SWCS*TS,c0=Math.max(0,((Math.min(x1,x2)-w)/cs)|0),c1=Math.min(SWCW-1,((Math.max(x1,x2)+w)/cs)|0),r0=Math.max(0,((Math.min(y1,y2)-w)/cs)|0),r1=Math.min(SWCH-1,((Math.max(y1,y2)+w)/cs)|0);
 const dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy||1;let n=0,k=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++)for(let i=SWH[cy*SWCW+cx];i>=0;i=SWN[i]){if(SW.hp[i]<=0)continue;const px=SW.x[i]-x1,py=SW.y[i]-y1,t=(px*dx+py*dy)/L2;if(t<0||t>1)continue;const qx=px-dx*t,qy=py-dy*t;if(qx*qx+qy*qy>w*w)continue;
  SW.hp[i]-=dmg;if(SW.hp[i]<=0)k++;if(++n>=cap)return k}
 return k}
/* densest 4x4-tile cell within [rmin,rmax] (trebuchet aim) */
function swDense(x,y,rmin,rmax){if(!SW.n)return -1;const cs=SWCS*TS,c0=Math.max(0,((x-rmax)/cs)|0),c1=Math.min(SWCW-1,((x+rmax)/cs)|0),r0=Math.max(0,((y-rmax)/cs)|0),r1=Math.min(SWCH-1,((y+rmax)/cs)|0);let best=-1,bc=0;
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const mx=(cx+.5)*cs-x,my=(cy+.5)*cs-y,d=hyp(mx,my);if(d<rmin||d>rmax)continue;let c=0,f=-1;for(let i=SWH[cy*SWCW+cx];i>=0&&c<200;i=SWN[i])if(SW.hp[i]>0){c++;if(f<0)f=i}if(c>bc){bc=c;best=f}}
 return best}
/* nearest enemy for a defender: a zombie unit or a swarm member (as a shared proxy object) */
function targetZ(u,range){const R=target(u,range,1);if(!SW.n)return R;const lim=R[0]?Math.min(range,R[1]):range,i=swNear(u.x,u.y,lim+4);if(i<0)return R;
 const d=hyp(SW.x[i]-u.x,SW.y[i]-u.y)-4;if(R[0]&&d>=R[1])return R;SWP.x=SW.x[i];SWP.y=SW.y[i];SWP.swi=i;return[SWP,d]}
function giveXp(u,a){const r0=Math.min(3,(u.xp||0)/4|0);u.xp=(u.xp||0)+a;const r1=Math.min(3,u.xp/4|0);if(r1>r0){puff(u.x,u.y,'#ffe066',8,40);u.hp=Math.min(T[u.type].hp,u.hp+T[u.type].hp*.3);if(u.pl===LPL()){msgS=NAMES[u.type]+' promoted: '+RANKN[r1];msgT=2.5}}}
/* archers pierce a few husks in a row, melee fighters cleave the little crowd in front of them */
/* ---- cannon: crew of 2, slow; fires a ball on an arc that bursts where it lands (zombies only) ---- */
function cannonFire(u,e){const d=T.cannon;u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.35;u.cd=d.cdt;const dd=dist(u.x,u.y,e.x,e.y),t=.8+dd/420,fx0=u.x+Math.sin(u.face)*20,fy0=u.y+Math.cos(u.face)*20,sa=Math.random()*6.2832,sr=TS*(.15+dd/520*1.25)*Math.sqrt(Math.random());
 fx.push({k:'cball',x1:fx0,y1:fy0,x2:e.x+Math.cos(sa)*sr,y2:e.y+Math.sin(sa)*sr,t,T:t,h0:gh(u.x/TS,u.y/TS)+.38,done:0,vr:u.t===0?Math.min(3,(u.xp||0)/4|0):0,bf:u.buff||1});
 snd('boom',u.x,u.y);puff(fx0,fy0,'#d8d0c0',8,40,{soft:1,T:1.4,s:.42,z:.4,vz:.8,g:-.2});puff(fx0,fy0,'#ffb050',5,60,{T:.25,z:.4,vz:1,g:2,s:.09});vflash(fx0,fy0,gh(u.x/TS,u.y/TS)+.5,1.6,[1,.7,.35],.15)}
function cannonHit(f){const R=TS*1.35,X=f.x2,Y=f.y2,dm=T.cannon.dmg*f.bf*(1+.12*f.vr)*(RS2.done.iron?1.25:1)*(RS2.done.steel?1.2:1);
 swSplash(X,Y,R,dm,40);for(const z of units)if(z.t===1&&z.hp>0){const dd=dist(z.x,z.y,X,Y);if(dd<R)z.hp-=dm*(1-dd/R*.5)}
 snd('crumble',X,Y);puff(X,Y,'#8a7058',12,90,{T:.8,z:.3,vz:3.6,g:9,s:.13});puff(X,Y,'#ffb050',6,70,{T:.35,z:.4,vz:2.4,g:5,s:.1});puff(X,Y,'#4a4440',4,40,{soft:1,T:1.8,s:.6,z:.5,vz:1.2,g:-.2});ring(X,Y,'#e8c890',16,200);shake(.06)}
function hitSw(u,e){const d=T[u.type],ar=u.type==='archer';u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;
 fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,h0:u.gar?u.gz+.42:undefined});
 const vr=u.t===0?Math.min(3,(u.xp||0)/4|0):0,dm=d.dmg*(u.buff||1)*(1+.12*vr)*(u.t===0&&RS2.done.iron?1.25:1)*(u.t===0&&RS2.done.steel?1.2:1)*(u.t===0&&ar&&RS2.done.fletch?1.25:1);
 let k;if(ar){const dx=e.x-u.x,dy=e.y-u.y,l=hyp(dx,dy)||1;k=swLine(u.x,u.y,e.x+dx/l*36,e.y+dy/l*36,9,dm,3)}else k=swSplash(e.x,e.y,u.type==='king'?TS:u.type==='guard'?TS*.85:TS*.7,dm,u.type==='king'?7:u.type==='guard'?4:u.type==='captain'?5:u.type==='knight'?3:2);
 if(u.t===0&&k>0)giveXp(u,k*.25);snd(ar?'arrow':'sword',u.x,u.y);u.cd=d.cdt;spark(e.x,e.y);blood(e.x,e.y,'#7a1a1a')}

const DSIDE=3000;let DEPOTS=[],COMPW=[];
const ringOf=c=>{const s=[];for(let j=c.ty-1;j<=c.ty+c.sz;j++)for(let i=c.tx-1;i<=c.tx+c.sz;i++)if(!solid(i,j))s.push([i,j]);return s};
/* peasants' field to a castle: its door wherever the door can be walked to, any side of the castle otherwise (+DSIDE) */
function castleField(c,x0,y0,w,h){const s=ringOf(c),sd=doorTiles(c,1).filter(([i,j])=>!solid(i,j)),F=bfsW(sd.length?sd:s,true,x0,y0,w,h);
 if(sd.length){const Fs=bfsW(s,true,x0,y0,w,h),a=F.F,b=Fs.F;for(let k=0;k<a.length;k++)if(a[k]===65535&&b[k]!==65535)a[k]=Math.min(65000,b[k]+DSIDE)}F.dep=c;return F}
function calcFD(){const A=[],B=[];DEPOTS=[];for(const c of aliveC()){A.push(bfsW(ringOf(c),false,c.tx-63,c.ty-63,129,129));B.push(castleField(c,c.tx-80,c.ty-80,161,161));DEPOTS.push(c)}
 for(const c of structs)if(c.t===0&&c.type==='storage'&&c.prog>=1&&c.hp>0){const F=bfsW(ringOf(c),true,c.tx-48,c.ty-48,97,97);F.dep=c;B.push(F);DEPOTS.push(c)}
 {const Z=aliveC().map(c=>bfsT(ringT(c),c.tx-64,c.ty-64,129,129));FZ=Z.length===1?Z[0]:Z.length?{list:Z}:null}FD[0]=A.length===1?A[0]:{list:A};FP=B.length===1?B[0]:{list:B};compLabel();fdDirty=false;ver++}
/* walkable regions around each castle, so peasants never pick a resource they cannot walk to */
function compLabel(){COMPW=[];const gs=gateSolid;gateSolid=false;try{for(const c of aliveC()){const x0=Math.max(0,c.tx-80),y0=Math.max(0,c.ty-80),w=Math.min(161,TW-x0),h=Math.min(161,TH-y0),L=new Int32Array(w*h).fill(-1),Q=new Int32Array(w*h);let lab=0;
  for(let s0=0;s0<w*h;s0++){if(L[s0]!==-1)continue;const sx=s0%w+x0,sy=((s0/w)|0)+y0;if(solid(sx,sy))continue;L[s0]=lab;let hd=0,tl=0;Q[tl++]=s0;
   while(hd<tl){const k=Q[hd++],lx=k%w,ly=(k/w)|0,tx=lx+x0,ty=ly+y0,a=ty*TW+tx;for(const[dx,dy]of D4){const nx=lx+dx,ny=ly+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx;if(L[n]!==-1)continue;const gx=tx+dx,gy=ty+dy;if(solid(gx,gy)||!canStep(a,gy*TW+gx))continue;L[n]=lab;Q[tl++]=n}}lab++}
  COMPW.push({x0,y0,w,h,L})}}finally{gateSolid=gs}}
function sameComp(ax,ay,bx,by){for(const W of COMPW){if(ax<W.x0||ay<W.y0||ax>=W.x0+W.w||ay>=W.y0+W.h||bx<W.x0||by<W.y0||bx>=W.x0+W.w||by>=W.y0+W.h)continue;const la=W.L[(ay-W.y0)*W.w+ax-W.x0],lb=W.L[(by-W.y0)*W.w+bx-W.x0];return la>=0&&la===lb}return true}
/* far from every depot window: a long field from the nearest castle, cached per 32x32 area */
const LF=new Map();let lfVer=-1;
function longField(tx,ty){if(lfVer!==ver){LF.clear();lfVer=ver}const hc=nearC((tx+.5)*TS,(ty+.5)*TS),gx=Math.floor(tx/32),gy=Math.floor(ty/32),key=hc.sid+':'+gx+','+gy;let S=LF.get(key);
 if(!S){const x0=Math.min(hc.tx,gx*32)-50,y0=Math.min(hc.ty,gy*32)-50,x1=Math.max(hc.tx+3,gx*32+32)+50,y1=Math.max(hc.ty+3,gy*32+32)+50;S=castleField(hc,x0,y0,x1-x0,y1-y0);LF.set(key,S);if(LF.size>24)LF.delete(LF.keys().next().value)}return S}
function depFieldAt(tx,ty){return fv(FP,tx,ty)<65535?FP:longField(tx,ty)}
function depBest(S,tx,ty){const L=S&&S.list?S.list:S?[S]:[];let b=null,bv=65535;for(const q of L){const v=fv(q,tx,ty);if(v<bv){bv=v;b=q}}return b?{S:b,v:bv}:null}
function atDepot(u){for(const s of DEPOTS){if(s.hp<=0||!structs.includes(s))continue;if(s.type==='castle'){const p=dpt(s);if(dist(u.x,u.y,p.x,p.y)<46)return s}else if(dist(u.x,u.y,s.x,s.y)<76)return s}return null}
function reachTile(S,tx,ty){for(let r=1;r<=12;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=tx+i,y=ty+j;if(gOK(x,y)&&!solid(x,y)&&fv(S,x,y)<65535)return[x,y]}return null}
function reachLong(tx,ty){const S=longField(tx,ty);return D4.some(([dx,dy])=>!solid(tx+dx,ty+dy)&&fv(S,tx+dx,ty+dy)<65535)}
function updateCamps(dt){campT-=dt;if(campT>0)return;campT=.6;const cam=focus();let nz=0;for(const u of units)if(u.t===1)nz++;
 for(const[k,c]of CAMPS){if(!genF[k])continue;
  if(!c.act){if(c.n<=0)continue;let near=fdist(c.x,c.y)<56*TS;if(!near)for(const u of units)if(u.t===0&&dist(u.x,u.y,c.x,c.y)<44*TS){near=true;break}
   if(near&&nz<420){c.act=true;c.us=[];for(let i=0;i<c.n;i++){const r=Math.random(),ty=r<.68?'husk':r<.93?'zombie':r<.985?'runner':'brute',x=c.x+rnd(-70,70),y=c.y+rnd(-70,70);if(solidAt(x,y))continue;const u=mkU(1,ty,x,y,null,-1);u.home={x:c.x,y:c.y};u.camp=c;units.push(u);c.us.push(u);nz++}}}
  else{c.us=c.us.filter(u=>u.hp>0&&units.includes(u));c.n=c.us.length;let far=fdist(c.x,c.y)>110*TS;if(far)for(const u of units)if(u.t===0&&dist(u.x,u.y,c.x,c.y)<90*TS){far=false;break}
   if(far){for(const u of c.us)u.hp=0,u.nokill=true;c.act=false}}}}
let campT=0;
let SIMTK=0;const SEPM=new Map();let SEPN=new Int32Array(1024);let shelOn=false,shelRel=0;
function update(dt){SIMTK++;lfBud=3;extraSim(dt);fgTick(dt);time+=dt;if(inGame)fowUpdate(dt);if(RS.on){RS.t+=dt;if(RS.t>=RT_TIME)finishResearch();else{msgS='Researching Stonemasonry '+Math.floor(RS.t/RT_TIME*100)+'%';msgT=1}}updateCamps(dt);if(inGame)updateHordes(dt);fdT-=dt;if(fdDirty&&fdT<=0){calcFD();fdT=.4}if(msgT>0)msgT-=dt;if(bannerT>0)bannerT-=dt;
 if(queue.length){const seen=new Set();for(let i=0;i<queue.length;i++){const q=queue[i];if(q.b.type!=='castle'&&!structs.includes(q.b)){setPl(q.b.pl|0);q.b=HOMEC();setPl(LPL())}if(seen.has(q.b))continue;seen.add(q.b);q.left-=dt;if(q.left<=0){queue.splice(i,1);i--;const p=spawnPos(q.b);setPl(q.b.pl|0);const nu=mkU(0,q.type,p.x,p.y);units.push(nu);if(nu.type==='king'||nu.type==='guard')royalSpawn(nu,q.b);{const RC=q.b.type==='castle'?q.b.rally:null;if(RC&&nu.type==='peasant'){const rtx=Math.floor(RC.x/TS),rty=Math.floor(RC.y/TS),rj=({2:'w',3:'s',4:'g'})[ter[rty*TW+rtx]];if(rj&&exposed(rtx,rty)&&reach(rtx,rty)){nu.job=rj;nu.tl=rty*TW+rtx}else nu.o={x:RC.x+rnd(-25,25),y:RC.y+rnd(-25,25),g:mkG(rtx,rty,p.x/TS,p.y/TS)}}}{const R=q.b.type==='barracks'?q.b.rally:null;if(R&&nu.type!=='peasant'){nu.o={x:R.x+rnd(-25,25),y:R.y+rnd(-25,25),g:mkG(Math.floor(R.x/TS),Math.floor(R.y/TS),p.x/TS,p.y/TS)}}}setPl(LPL());snd('spawn')}}}
 pendB=false;for(const s of structs){if(s.dem&&s.hp>0){pendB=true;let w=0;{const Q=ugNear(0,s.x,s.y,TS*2.6);for(let q=0;q<Q.length;q++){const u=UGU[Q[q]];if(u.t===0&&u.type==='peasant'&&u.job==='r'&&!u.carry&&dist(u.x,u.y,s.x,s.y)<TS*2.6)w++}}s.dp=(s.dp||0)+dt*w*1.4;if(!w){s.at=(s.at||0)-dt;if(s.at<=0){s.at=2;let bu=null,bd=1e12;if(!RHAS[s.pl|0].b)for(const u of units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&!u.carry&&!u.gar&&(!MP.on||(u.pl|0)===(s.pl|0))){const d=dist(u.x,u.y,s.x,s.y);if(d<bd){bd=d;bu=u}}if(bu){bu.job='r';bu.o=null;bu.tl=-1}}}if(w&&Math.random()<.08)puff(s.x+rnd(-20,20),s.y+rnd(-20,20),'#b9a68a',3,50);if(s.dp>=Math.max(2.5,s.bt*.25))demolish(s)}}
 for(const s of structs)if(s.prog<1){if(!(s.unr>time)&&s.t===0)pendB=true;let w=0;{const Q=ugNear(0,s.x,s.y,TS*2.4);for(let q=0;q<Q.length;q++){const u=UGU[Q[q]];if(u.t===0&&u.type==='peasant'&&u.job==='r'&&!u.carry&&dist(u.x,u.y,s.x,s.y)<TS*2.4)w++}}
  if(!w&&s.t===0&&!shelOn&&!(s.unr>time)){s.at=(s.at||0)-dt;if(s.at<=0){s.at=3;const p=s.pl|0;let nb=0,ns=0;for(const q of structs)if(q.t===0&&(q.pl|0)===p&&q.prog<1)ns++;for(const u of units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&u.job==='r'&&u.role!=='r')nb++;
   if(nb<Math.min(ns*2,6)){let bu=null,bd=1e12;for(const u of units)if(u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&!u.carry&&!u.gar&&!u.shel&&!u.role&&!u.o&&u.job!=='f'&&u.job!=='p'&&u.job!=='r'&&u.job!=='t'){const d=dist(u.x,u.y,s.x,s.y);if(d<bd){bd=d;bu=u}}if(bu){bu.job='r';bu.tl=-1;bu.rb=s;bu.work=0}}}}
  const dp=dt*w*1.4/s.bt;const pg0=s.prog;s.prog=Math.min(1,s.prog+dp);if(pg0<1&&s.prog>=1&&s.t===0){achB(s);puff(s.x,s.y,'#ffe066',16,70,{T:1.3,z:.4,vz:3.2,g:-.8,s:.08});puff(s.x,s.y,'#d8cfbf',8,80,{soft:1,T:1.2,s:.45,z:.2,vz:.5,g:-.2});vflash(s.x,s.y,(s.bh||LAND)+.25,1.4+s.sz*.6,[1,.85,.45],.7,1)}if(pg0<1&&s.prog>=1&&s.type==='storage')fdDirty=true;s.hp=Math.min(s.max,s.hp+s.max*dp*.88);if(s.prog>=1&&s.hp>s.max*.97)s.hp=s.max}
 ugBuild();for(const s of structs)s.zq=0;for(const u of units){u.buff=1;u.cb=0;if(u.t===1&&u._tc&&u._tc.b&&!(u._tc.b.type in T))u._tc.b.zq=(u._tc.b.zq||0)+1}for(const c of units)if((c.type==='captain'||c.type==='king')&&c.t===0&&c.hp>0){const kg=c.type==='king',R=(kg?10:8)*TS,bf=kg?1.35:1.25,Q=ugNear(0,c.x,c.y,R);for(let q=0;q<Q.length;q++){const a=UGU[Q[q]];if(a.t===0&&a.hp>0&&dist(a.x,a.y,c.x,c.y)<R){a.buff=Math.max(a.buff,bf);a.cb=1}}}
 shelState(dt);
 for(const u of units){u.cd-=dt;u.walk-=dt;u.hc-=dt;const d=T[u.type];
  const ck=((u.x/TS/CH)|0)+((u.y/TS/CH)|0)*NCX;if(ck!==u.ck){u.ck=ck;if(u.t===0||u.lane>=0||!u.home)ensureAround((u.x/TS)|0,(u.y/TS)|0,1)}
  u.sT-=dt;if(u.sT<=0){u.sT=.6;if(u.mv&&dist(u.x,u.y,u.px,u.py)<9){u.det=.9;u.dir=Math.random()<.5?1:-1}u.px=u.x;u.py=u.y;u.mv=false}
  if(u.t===0){
   if(u.shel){shelTick(u,dt);continue}
   if(u.gar){const s=u.gar;if(s.hp<=0||!structs.includes(s)){ungar(u);u.hp-=8}else{const j=s.garr.indexOf(u),sp=garSlot(s,j);u.x=sp.x;u.y=sp.y;u.gz=(s.bh||0)+gtopOf(s);
     const[b]=targetZ(u,u.type==='cannon'?d.rng+80:d.rng*GRNG[s.type]+20);if(b&&u.cd<=0&&(b.type in T||u.type==='cannon'))hit(u,b);u.walk=0}continue}
   if(u.goG){const s=u.goG;if(!structs.includes(s)||s.hp<=0)u.goG=null;else if(s.tiles.some(([tx,ty])=>{const L=TS*((u.o?1:(u.goR||1))+.35);return Math.abs(u.x-(tx+.5)*TS)<L&&Math.abs(u.y-(ty+.5)*TS)<L})){u.goG=null;u.o=null;garrison(u,s);continue}else if(!u.o){const near=s.tiles.some(([tx,ty])=>Math.abs(u.x-(tx+.5)*TS)<TS*3.2&&Math.abs(u.y-(ty+.5)*TS)<TS*3.2);if(near){u.goG=null;garrison(u,s);continue}if((u.goT=(u.goT||0)+1)<=2){const tp=garTarget(s,u);u.goR=tp.r;u.o={x:tp.x,y:tp.y,g:mkG(Math.floor(tp.x/TS),Math.floor(tp.y/TS),u.x/TS,u.y/TS),f:1}}else{u.goG=null;u.goT=0}}}
   if(u.type==='peasant'){if(shelOn&&u.nso&&!u.o&&!u.carry&&u.tl<0&&(u.noT||0)>.6&&(u.job==='w'||u.job==='s'||u.job==='g'))u.nso=0;const sg=shelOn&&u.role!=='r'&&(!u.nso||(!u.o&&!u.job&&!u.carry));if(u.onF&&(sg||u.job!=='f'||u.o||!wkLive(u)))farmOff(u);if(sg)shelGo(u,dt);else peasant(u,dt);continue}
   if(u.rg&&u.cap&&u.cap.hp>0&&u.cap.type==='king'&&!u.fg&&royalEscort(u,d,dt))continue;
   if(u.fg){fgUnit(u,dt);continue}
   if(u.o&&u.o.f){walk(u,dt);if(!u.o){u.ret=false;u.gx=u.x;u.gy=u.y}continue}
   if(u.dk&&!u.o&&LITL.length&&(u.lgT=(u.lgT||0)-dt)<=0){u.lgT=1.5;toLight(u)}
   if(u.cap&&!u.o&&u.hc<=0){u.hc=.7;const C=u.cap,j=C.sq?C.sq.indexOf(u):-1;if(j>=0){const s=slotPos(C,j);if(dist(u.x,u.y,s.x,s.y)>46)u.o={x:s.x,y:s.y,g:capField(C)}}}
   const stn=u.stn||'agg',inR=bd=>bd<=d.rng+d.r;
   if(stn==='hold'){u.o=null;const[b,bd]=targetZ(u,d.rng+d.r+2);if(b){u.face=Math.atan2(b.x-u.x,b.y-u.y);if(inR(bd)&&u.cd<=0)hit(u,b)}continue}
   if(u.fpos&&!u.o){const P=u.fpos,[b,bd]=targetZ(u,d.rng+d.r+TS*1.1);
    if(b&&dist(b.x,b.y,P.x,P.y)<TS*1.1+d.rng+d.r){if(inR(bd)){if(u.cd<=0)hit(u,b)}else if(u.type!=='cannon'&&u.type!=='archer'&&dist(u.x,u.y,P.x,P.y)<TS*.7)chase(u,b,dt);else if(dist(u.x,u.y,P.x,P.y)>6)moveTo(u,P.x,P.y,dt)}
    else if(dist(u.x,u.y,P.x,P.y)>6)moveTo(u,P.x,P.y,dt);else u.face=P.fm;continue}
   if(stn==='def'){if(u.gx===undefined){u.gx=u.x;u.gy=u.y}
    if(u.o&&!u.ret){const[b,bd]=targetZ(u,d.rng+d.r+2);if(b&&inR(bd)){if(u.cd<=0)hit(u,b)}else walk(u,dt);continue}
    const[b,bd]=targetZ(u,TS*5.5);
    if(b&&dist(b.x,b.y,u.gx,u.gy)<TS*7){u.o=null;u.ret=false;if(inR(bd)){if(u.cd<=0)hit(u,b)}else chase(u,b,dt);continue}
    if(u.o){walk(u,dt);if(!u.o)u.ret=false;continue}
    if(dist(u.x,u.y,u.gx,u.gy)>TS*1.5){u.o={x:u.gx,y:u.gy,g:mkG(Math.floor(u.gx/TS),Math.floor(u.gy/TS),u.x/TS,u.y/TS)};u.ret=true}
    continue}
   const[b,bd]=targetZ(u,u.o?110:u.type==='cannon'?d.rng:TS*8.5);
   if(b){if(inR(bd)){if(u.cd<=0)hit(u,b)}else chase(u,b,dt)}
   else if(u.o)walk(u,dt);else if(u.type==='king'&&u.fm!==undefined)u.face=u.fm}
  else if(u.t===2)aiUnit(u,d,dt);else zomb(u,d,dt)}
 swUpdate(dt);waveTick();nightTick(dt);darkTick(dt);priceTick(dt);saplTick(dt);roleTick(dt);acidTick(dt);
 for(const bm of units)if(bm.type==='bannerman'&&bm.t===0&&bm.hp>0){bm.h2=(bm.h2||0)-dt;let inj=null;const HQ=ugNear(0,bm.x,bm.y,HEAL_R,true).slice();for(let q=0;q<HQ.length;q++){const a=UGU[HQ[q]];if(a.t===0&&a.hp>0&&dist(a.x,a.y,bm.x,bm.y)<HEAL_R){const mx=T[a.type].hp;a.cd-=dt*.2;if(a.hp<mx){a.hp=Math.min(mx,a.hp+HEAL_RATE*dt);if(Math.random()<.2)inj=a}}}
  if(bm.h2<=0&&inj){bm.h2=.4;puff(inj.x,inj.y,'#7dffa0',2,22);snd('heal',inj.x,inj.y)}}
 for(const s of structs)if(s.hp<(SH[s.type]||1e9)*.5&&s.prog>=1&&Math.random()<dt*2.2){smoke(s.x,s.y,(s.bh||1)+1);if(s.hp<(SH[s.type]||1e9)*.25)ember(s.x,s.y)}
 for(const s of structs)if(s.type==='tower'&&s.prog>=1&&!s.weapon){s.cd-=dt;if(s.cd>0)continue;const st=s.tier!==0,[b]=targetZ(s,TOWR*TS+(st?60:0));if(!b||b.t===0){s.cd=.3;continue}
  const n=st?6:5,dm=(st?12:11)*(RS2.done.fletch?1.4:1),dd=dist(s.x,s.y,b.x,b.y)||1,fl=Math.min(.75,.36+dd/1400),sw=!(b.type in T),cx=b.x+(sw?(b.x-s.x)/dd*TS*.9:0),cy=b.y+(sw?(b.y-s.y)/dd*TS*.9:0);snd('arrow',s.x,s.y);
  for(let k=0;k<n;k++){const a=Math.random()*6.2832,r=TS*(.15+.95*Math.sqrt(Math.random())),t=fl+k*.035,x2=k?cx+Math.cos(a)*r:b.x,y2=k?cy+Math.sin(a)*r:b.y;fx.push({x1:s.x,y1:s.y,x2,y2,t,T:t,a:true,arc:1,tw:1,dmg:dm})}s.cd=1.7}
/* can the owner of s see this spot? (sight of their own buildings and units, same on every machine) */
function simSeen(pl,x,y){for(const s of structs)if(s.t===0&&(s.pl|0)===pl&&s.prog>=1){const r=vsnOf(s)*TS;if(Math.abs(s.x-x)<r&&Math.abs(s.y-y)<r&&dist(s.x,s.y,x,y)<r)return true}
 for(const u of units)if(u.t===0&&u.hp>0&&!u.shel&&(u.pl|0)===pl){const r=(VRN[u.type]||9)*TS;if(Math.abs(u.x-x)<r&&Math.abs(u.y-y)<r&&dist(u.x,u.y,x,y)<r)return true}return false}
 for(const s of structs)if(s.weapon&&s.prog>=1){s.wcd=(s.wcd||0)-dt;s.rec=Math.max(0,(s.rec||0)-dt);const tb=s.weapon==='trebuchet';if(s.wcd>0)continue;const hh=(s.bh||0)+3.4;
  const spl=s.pl|0;let b=null;if(!tb){[b]=targetZ(s,720);if(b&&(!(b.type in T)||!simSeen(spl,b.x,b.y)))b=null}
  else{let bs=-1,n=0;for(const e of units){if(e.t!==1||e.hp<=0||++n>90)continue;const dd=dist(s.x,s.y,e.x,e.y);if(dd<240||dd>1300||!simSeen(spl,e.x,e.y))continue;let c=0;for(const f of units)if(f.t===1&&Math.abs(f.x-e.x)<110&&Math.abs(f.y-e.y)<110&&dist(f.x,f.y,e.x,e.y)<110)c++;if(c>bs){bs=c;b=e}}}
  if(!b&&tb){const i=swDense(s.x,s.y,240,1300);if(i>=0&&simSeen(spl,SW.x[i],SW.y[i])){SWP.x=SW.x[i];SWP.y=SW.y[i];SWP.swi=i;b=SWP}}
  if(!b){s.wcd=.5;continue}s.aim=Math.atan2(b.x-s.x,b.y-s.y);s.rec=.5;
  if(tb){s.wcd=6.2;snd('trebl',s.x,s.y);ring(s.x,s.y,'#d8cfc0',12,150);shake(.12);fx.push({k:'rock',x1:s.x,y1:s.y,x2:b.x,y2:b.y,t:1.5,T:1.5,a:true,h0:hh,r:110,dmg:75,done:0})}
  else{s.wcd=3.4;snd('bolt',s.x,s.y);vflash(s.x,s.y,(s.bh||0)+3.5,1.3,[1,.85,.5],.22,0);puff(s.x,s.y,'#ffe9a0',5,70,{T:.25,z:(s.bh||0)+3,vz:.5,s:.1});const dx=Math.sin(s.aim),dy=Math.cos(s.aim),L=760;fx.push({k:'bolt',x1:s.x,y1:s.y,x2:s.x+dx*L,y2:s.y+dy*L,t:.35,T:.35,a:true,h0:hh});
   for(const e of units)if(e.t===1&&e.hp>0){const rx=e.x-s.x,ry=e.y-s.y,pr=rx*dx+ry*dy;if(pr<0||pr>L)continue;const cr=Math.abs(rx*dy-ry*dx);if(cr<T[e.type].r+10){e.hp-=70;puff(e.x,e.y,'#e55',3,50)}}swLine(s.x,s.y,s.x+dx*L,s.y+dy*L,14,70,90);}}
 /* unit separation (spatial grid) */
 {const grid=SEPM;grid.clear();if(SEPN.length<units.length)SEPN=new Int32Array(units.length*2);for(let i=units.length-1;i>=0;i--){const a=units[i];a.gi=i;if(a.gar||a.onF)continue;const k=((a.x/48)|0)*4096+((a.y/48)|0),h=grid.get(k);SEPN[i]=h===undefined?-1:h;grid.set(k,i)}
  for(const a of units){if(a.gar||a.onF)continue;const cx=(a.x/48)|0,cy=(a.y/48)|0;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const h=grid.get((cx+ox)*4096+cy+oy);if(h===undefined)continue;for(let q=h;q>=0;q=SEPN[q]){const b=units[q];if(b.gi<=a.gi)continue;const m=(T[a.type].r+T[b.type].r)*1.12;if(Math.abs(a.x-b.x)>m||Math.abs(a.y-b.y)>m)continue;const dd=dist(a.x,a.y,b.x,b.y);if(dd<m&&dd>0){const pa=a.type==='peasant',pb2=b.type==='peasant',sk=a.t===b.t&&(pa||pb2)?(pa&&pb2?.08:.3):1,nx=(b.x-a.x)/dd,ny=(b.y-a.y)/dd,p=(m-dd)/2*sk;a.x-=nx*p;a.y-=ny*p;b.x+=nx*p;b.y+=ny*p}}}}}
 zDeathFx();for(const u of units){collide(u);if(u.hp<=0){if(u.type==='king'&&u.t===0)kingFell(u);
  if(u.conv){puff(u.x,u.y,'#b04bff',10,70);if(u.sq){u.sq.forEach(f=>{f.cap=null});u.sq=null}leaveSquad(u);u.zk=u.type;u.t=1;u.type='zombie';u.hp=T.zombie.hp;u.conv=false;u.sel=false;u.o=null;u.carry=false;u.cd=1;u.lane=-1;u.home=null;u.base=null;u.hh=null}
  else if(u.nokill){}else{if(!(typeof mcCorpse==='function'&&mcCorpse(u)))puff(u.x,u.y,'#efefef',8,30,{T:.8,z:.35,vz:1.4,g:-.7,s:.12});if(u.type==='brute')shake(.25);snd('die',u.x,u.y);if(u.t===1){kills++;if(kills===1)ach('k1');if(kills===100)ach('k100');if(kills===500)ach('k500');const gg=u.type==='brute'?25:u.type==='miner'?8:u.type==='bomber'?6:u.type==='acid'?5:u.type==='runner'?3:u.type==='husk'?1:2;RESP[killPl(u)].g+=gg;puff(u.x,u.y,'#ffd23c',3,50)}}}}
 units=units.filter(u=>u.hp>0);for(const u of units){if(u.cap&&(u.cap.hp<=0||u.cap.t===1)){u.cap=null}if(u.sq)u.sq=u.sq.filter(f=>f.hp>0&&f.cap===u)}
 mergeT-=dt;if(mergeT<=0){mergeT=.7;mergeTowers()}
 castleFire(dt);
 for(const s of structs)if(s.hp<=0){if(!s.noCrumble){puff(s.x,s.y,'#9a9a9f',22,130,{T:.9,z:.5,vz:3,g:6,s:.18});for(let k=0;k<6;k++)ember(s.x,s.y);ring(s.x,s.y,'#a89f90',16,160);shake(.4);snd('crumble',s.x,s.y)}if(s.garr)s.garr.slice().forEach(ungar);rmStruct(s);fdDirty=true;for(const[x,y]of s.tiles)if(occ.get(y*TW+x)===s){occ.delete(y*TW+x);{const k=y*TW+x,lv=LVO.get(k);if(lv){LVO.delete(k);if(HT[k]===lv.h&&!stairs.has(k)){HT[k]=lv.o;GF.clear()}}}for(const[a2,b2]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a2,y+b2)){markT(x+a2,y+b2);markP(x+a2,y+b2)}mmTile(y*TW+x)}refreshNear(s)}
 structs=structs.filter(s=>s.hp>0);
 fx.forEach(f=>f.t-=dt);
 for(const f of fx)if(f.k==='rock'&&f.t<=0&&!f.done){f.done=1;snd('boom',f.x2,f.y2);vflash(f.x2,f.y2,gh(f.x2/TS,f.y2/TS)+.7,3.4,[1,.6,.28],.6,1);puff(f.x2,f.y2,'#8a7a5a',20,110,{T:.8,z:.3,vz:4,g:10,s:.15});puff(f.x2,f.y2,'#ffb050',10,90,{T:.5,z:.5,vz:3,g:6,s:.12});ring(f.x2,f.y2,'#e8d8b0',24,300);puff(f.x2,f.y2,'#4a4448',6,40,{soft:1,T:2.2,s:.7,z:.6,vz:1.6,g:-.25});puff(f.x2,f.y2,'#8a7058',5,90,{soft:1,T:1.4,s:.5,z:.2,vz:.6,g:-.1});shake(.3);for(const e of units)if(e.t===1&&e.hp>0){const dd=dist(e.x,e.y,f.x2,f.y2);if(dd<f.r)e.hp-=f.dmg*(1-dd/f.r*.5)}swSplash(f.x2,f.y2,f.r,f.dmg*.75,600)}
 for(const f of fx)if(f.k==='acid'&&f.t<=0&&!f.done){f.done=1;acidSplash(f.x2,f.y2,0)}else if(f.k==='cball'&&f.t<=0&&!f.done){f.done=1;cannonHit(f)}
 for(const f of fx)if(f.tw&&f.t<=0&&!f.done){f.done=1;let h=0;for(const e of units)if(e.t===1&&e.hp>0&&Math.abs(e.x-f.x2)<30&&Math.abs(e.y-f.y2)<30&&dist(e.x,e.y,f.x2,f.y2)<T[e.type].r+12){e.hp-=f.dmg;e.hurt=.2;h=1;break}if(!h)swSplash(f.x2,f.y2,TS*.5,f.dmg,3);if(Math.random()<.3)spark(f.x2,f.y2,.5)}
 fx=fx.filter(f=>f.t>0);
 for(const p of pt){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.z!==undefined){p.z+=p.vz*dt;p.vz-=p.g*dt;if(p.z<.05){p.z=.05;p.vz=0;p.vx*=.8;p.vy*=.8}}p.t-=dt}if(shakeT>0)shakeT-=dt;pt=pt.filter(p=>p.t>0);
 if(!waveOn){waveT-=dt;if(waveT<=0){waveST=time;wave();waveOn=hordeOn=true;hordeT=time;waveT=0}}
 setPl(LPL());if(CS.hp<=0&&(!CS2||CS2.hp<=0)&&!over){over=true;saveBest()}}
function saveBest(){try{if(waveN>best.w||(waveN===best.w&&kills>best.k)){best={w:waveN,k:kills};localStorage.setItem('dk_best',JSON.stringify(best))}}catch(e){}}

let mergeT=0;
function mergeTowers(){const T0=[];for(const s of structs)if(s.t===0&&s.type==='tower'&&s.prog>=1&&s.hp>0&&!s.merged)T0.push(s);if(T0.length<4)return;const at=new Map();for(const s of T0)at.set(s.ty*TW+s.tx,s);
 for(const s of T0){if(s.merged)continue;const g=[s,at.get(s.ty*TW+s.tx+1),at.get((s.ty+1)*TW+s.tx),at.get((s.ty+1)*TW+s.tx+1)];if(g.some(q=>!q||q.merged||(q.pl|0)!==(s.pl|0)))continue;
  const garr=[];let tier=1;for(const q of g){if(q.garr){garr.push(...q.garr);q.garr=[]}if(q.weapon){const R=RESP[q.pl|0],c=C[q.weapon]||{};for(const k in c)R[k]+=c[k];q.weapon=null}if(q.tier===0)tier=0;q.merged=true;q.hp=-1;q.noCrumble=true}
  const prev=CURPL;CURPL=s.pl|0;let k;try{k=mk(0,'keep',s.tx,s.ty,2,true)}finally{CURPL=prev}
  k.tier=tier;k.max=tier?SH.keep:Math.round(SH.keep*.5);k.hp=k.max;k.cost={w:200,s:tier?300:0};
  addStruct(k);refreshNear(k);k.garr=[];for(const u of garr.slice(0,GCAP.keep)){u.gar=k;k.garr.push(u);u.gz=(k.bh||0)+GTOP.keep}for(const u of garr.slice(GCAP.keep)){u.gar=null}
  puff(k.x,k.y,'#d9d9d9',20,100);snd('build',k.x,k.y);if((k.pl|0)===LPL())ach('keep');if(!MP.on||(k.pl|0)===LPL()){msgS='Four towers merged into a keep';msgT=4}}}
function rotateB(s){if(!s||s.t!==0||!structs.includes(s)||!ROTT.has(s.type)||(MP.on&&(s.pl|0)!==CURPL))return;
 if(s.type==='tower'&&s.weapon){msgS='A tower with a siege weapon cannot turn';msgT=3;snd('err');return}
 const old=s.rot|0;s.rot=(old+1)&3;
 if(s.type==='castle'){const bad=doorTiles(s,1).some(([x,y])=>!gOK(x,y)||solid(x,y)||stairs.has(y*TW+x));if(bad){s.rot=old;msgS='The castle door needs the 3 tiles in front of it free';msgT=3;snd('err');return}fdDirty=true}
 buildStructMesh(s);snd('click');msgS=NAMES[s.type]+' rotated';msgT=1.5}
function moveOK(tx,ty){const c=HOMEC();if(!c||c.hp<=0||!structs.includes(c))return false;const x0=tx-2,y0=ty-2,nt=tilesFor('castle',x0,y0,5),own=new Set(c.tiles.map(([x,y])=>y*TW+x));
 if(hyp(x0-c.tx,y0-c.ty)>40)return false;const ty0=c.type;c.type='castle_';let r=false;try{r=nt.every(([x,y])=>gOK(x,y)&&(own.has(y*TW+x)||valid(x,y)));
  if(r){const hs=nt.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)r=false}
  if(r){const f={tx:x0,ty:y0,rot:c.rot|0};r=doorTiles(f,1).every(([x,y])=>gOK(x,y)&&(own.has(y*TW+x)||(!solid(x,y)&&!stairs.has(y*TW+x))))}}finally{c.type=ty0}return r}
function moveCastle(tx,ty){const c=HOMEC();if(!c||!moveOK(tx,ty)){msgS='Cannot move the castle there (5x5 free, within 40 tiles, flat ground)';msgT=3;snd('err');return}
 pay(C.movec);
 const x0=tx-2,y0=ty-2,nt=tilesFor('castle',x0,y0,5),ox=c.x,oy=c.y;for(const[x,y]of c.tiles)if(occ.get(y*TW+x)===c)occ.delete(y*TW+x);
 levelGround(x0,y0,5,Math.max(...nt.map(([x,y])=>HT[y*TW+x])));c.tx=x0;c.ty=y0;c.tiles=nt;c.x=(x0+2.5)*TS;c.y=(y0+2.5)*TS;for(const[x,y]of nt)occ.set(y*TW+x,c);
 if(c===CS){CX=x0+2;CY=y0+2}buildStructMesh(c);refreshNear(c);fdDirty=true;ver++;mode=null;puff(ox,oy,'#c9b899',22,110);puff(c.x,c.y,'#d9d9d9',22,110);snd('build',c.x,c.y);
 if(!MP.on||(c.pl|0)===LPL()){ach('move');msgS='Castle moved';msgT=3}}

/* ---- Minecraft-style advancements (toasts) ---- */
const ACH=new Set(),TOASTS=[];
const ACHD={house:['Home Sweet Home','Build a house'],barracks:['Call to Arms','Build a barracks'],academy:['Enchanter','Build an academy'],farm:['A Seedy Place','Build a farm'],storage:['Storage Box','Build a storage'],tower:['Watchtower','Build a tower'],wall:['Stone Wall','Build a wall'],gate:['Open Sesame','Build a gate'],keep:['Keep Calm','Merge four towers into a keep'],move:['Moving Day','Move your castle'],
 w1:['Survivor','Survive your first wave'],w5:['Night Watch','Survive 5 waves'],w10:['Monsters Hunted','Survive 10 waves'],k1:['Monster Hunter','Slay a zombie'],k100:['Zombie Slayer','Slay 100 zombies'],k500:['The End?','Slay 500 zombies'],res:['Getting an Upgrade','Finish a research']};
function ach(k){if(ACH.has(k)||!ACHD[k])return;ACH.add(k);TOASTS.push({k,t:0});if(TOASTS.length>3)TOASTS.shift()}
function achB(s){if((s.pl|0)!==LPL())return;ach(s.type)}
let WAVEZ=0;

/* houses / farms snap onto a neighbour's grid so they line up and merge */
function snapM(type,tx,ty){if(type!=='house'&&type!=='farm'&&!CONNT.has(type))return[tx,ty];const fits=(x,y)=>tilesFor(type,x,y,2).every(([a,b])=>gOK(a,b)&&valid(a,b));let best=null,bd=9;
 for(let j=ty-3;j<=ty+3;j++)for(let i=tx-3;i<=tx+3;i++){const o=occ.get(j*TW+i);if(!o||o.type!==type||o.t!==0||(o.pl|0)!==CURPL||o.tx!==i||o.ty!==j)continue;if(Math.max(o.tx-(tx+2),tx-(o.tx+2))>0||Math.max(o.ty-(ty+2),ty-(o.ty+2))>0)continue;
  for(const[cx,cy]of[[o.tx+2,o.ty],[o.tx-2,o.ty],[o.tx,o.ty+2],[o.tx,o.ty-2]]){const d=Math.abs(cx-tx)+Math.abs(cy-ty);if(d===0)return[tx,ty];if(Math.abs(cx-tx)<=1&&Math.abs(cy-ty)<=1&&d<bd&&fits(cx,cy)){bd=d;best=[cx,cy]}}}
 return best||[tx,ty]}

/* ---- the castle shoots arrows at the nearest zombie in range ---- */
const CASTLE_RNG=10;
function castleFire(dt){for(const c of aliveC()){if(c.prog<1)continue;c.ccd=(c.ccd||0)-dt;if(c.ccd>0)continue;const R=CASTLE_RNG*TS;let b=null,bd=R;
  for(const e of units)if(e.t===1&&e.hp>0){const dd=dist(c.x,c.y,e.x,e.y);if(dd<bd){bd=dd;b=e}}
  let si=-1;if(!b){si=swNear(c.x,c.y,R);if(si<0){c.ccd=.35;continue}}c.ccd=(c.tier?.8:1.05)/(RS2.done.fletch?1.25:1);c.cv=((c.cv|0)+1)%4;const o=[[-1,-1],[1,-1],[1,1],[-1,1]][c.cv],sx=c.x+o[0]*TS,sy=c.y+o[1]*TS;
  const ex=b?b.x:SW.x[si],ey=b?b.y:SW.y[si],dm=(c.tier?16:11)*(RS2.done.fletch?1.4:1);fx.push({x1:sx,y1:sy,x2:ex,y2:ey,t:.3,T:.3,a:1,h0:(c.bh||LAND)+(c.tier?3.5:2.5)});
  if(b)b.hp-=dm;else{swSplash(ex,ey,TS*.95,dm,10);for(let q=0;q<2;q++)fx.push({x1:sx,y1:sy,x2:ex+rnd(-26,26),y2:ey+rnd(-26,26),t:.3,T:.3,a:1,h0:(c.bh||LAND)+(c.tier?3.5:2.5)})}snd('arrow',sx,sy);spark(ex,ey,.6)}}
/* ================= 3D ENGINE ================= */
const g3=document.getElementById('g3');
let GQ=1;try{const v=localStorage.getItem('dk_gfx');if(v!==null)GQ=+v?1:0}catch(e){}const GQU={value:GQ};
const renderer=new THREE.WebGLRenderer({canvas:g3,antialias:false,stencil:false,powerPreference:'high-performance'});
/* dynamic resolution: when the GPU (not our code) is the bottleneck, render fewer pixels; climb back when there is headroom */
const DRSL=[1,.86,.74,.62,.5],DRS={lv:0,sum:0,cs:0,n:0,t:0,lt:0,noDn:0,noUp:0,upT:-99,chk:0,ftb:0,ok:0,bk:60,ft:0,cpu:0};renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.97;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.3,420);scene.autoUpdate=false;
const SKY=0x9ccaf0;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,50,140);
const SHADOWS=window.innerWidth>700;
const hemi=new THREE.HemisphereLight(0xdcecff,0x77704f,.62),sun=new THREE.DirectionalLight(0xfff1d2,.78);
scene.add(hemi,sun,sun.target);
if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=true;{const ss=GQ?2048:1024;sun.shadow.mapSize.set(ss,ss)}renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const sc=sun.shadow.camera;sc.left=-36;sc.right=36;sc.top=36;sc.bottom=-36;sc.near=1;sc.far=220;sun.shadow.bias=-.0003;sun.shadow.normalBias=.03}
const CAM={x:CX,z:CY,y:LAND,yaw:0,pitch:.92,dist:24};
/* ---- geometry helpers ---- */
let BMAT=0;const newG=()=>({P:[],N:[],C:[],I:[],M:[],hm:0});
function quad(G,a,b,c,d,n,ca,cb,cc,cd){const o=G.P.length/3;if(G.M){if(G.M.length<o)for(let i=G.M.length;i<o;i++)G.M.push(0);G.M.push(BMAT,BMAT,BMAT,BMAT);if(BMAT)G.hm=1}G.P.push(...a,...b,...c,...d);G.N.push(...n,...n,...n,...n);G.C.push(...ca,...cb,...cc,...cd);G.I.push(o,o+1,o+2,o,o+2,o+3)}
function tri(G,A,B,C,n,c){const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]],cr=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){const t=B;B=C;C=t}quad(G,A,B,C,C,n,c,c,c,c)}
function toGeo(G){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.C,3));if(G.hm){const n=G.P.length/3,M=G.M.slice(0,n);while(M.length<n)M.push(0);g.setAttribute('mat',new THREE.Float32BufferAttribute(M,1))}g.setIndex(G.I);g.computeBoundingSphere();return g}
const rgb=h=>{const c=hex(h);return[c[0]/255,c[1]/255,c[2]/255]};
const shade=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
const FK=[1,.9,.8,.86,.77,.55];
function addBox(G,x0,y0,z0,x1,y1,z1,c){const s=k=>shade(c,FK[k]),d=k=>shade(c,FK[k]*.78);
 quad(G,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0],s(0),s(0),s(0),s(0));
 quad(G,[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0],d(1),s(1),s(1),d(1));
 quad(G,[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],[-1,0,0],d(2),s(2),s(2),d(2));
 quad(G,[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x0,y0,z1],[0,0,1],d(3),s(3),s(3),d(3));
 quad(G,[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],[0,0,-1],d(4),s(4),s(4),d(4));
 quad(G,[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],s(5),s(5),s(5),s(5))}
let WOODY=false;const WDP=['#4a321f','#5a3b23','#6b4a2c','#7a5333','#8a6038','#9a6c40','#a8814f'],WRF=['#86703c','#947c44','#a3894e'],WDC=new Map();
function woodOf(c,roof){const k=(roof?'r':'')+(typeof c==='string'?c:c.join(','));let v=WDC.get(k);if(v)return v;const q=typeof c==='string'?rgb(c):c,L=q[0]*.3+q[1]*.55+q[2]*.15;
 v=roof?WRF[Math.min(2,Math.max(0,((L-.25)*6)|0))]:WDP[Math.min(6,Math.max(0,((L-.18)*9.5)|0))];WDC.set(k,v);return v}
const bxm=m=>(G,cx,y0,cz,w,h,d,c)=>{const o=BMAT;let mm=m,cc=c;if(WOODY&&(m===1||m===6)&&!(m===1&&(c==='#9a5442'||c==='#87493a'))){cc=woodOf(c,m===6);if(m===1)mm=2}BMAT=mm;try{bxc(G,cx,y0,cz,w,h,d,cc)}finally{BMAT=o}};
let BXN=0;const bxc=(G,cx,y0,cz,w,h,d,c)=>{const e=Math.min((1+(BXN++%4))*.0006,Math.min(w,h,d)*.12);return addBox(G,cx-w/2-e,y0-e,cz-d/2-e,cx+w/2+e,y0+h+e,cz+d/2+e,typeof c==='string'?rgb(c):c)};
/* ================= HD SURFACES =================
   smooth procedural detail in world space (no more 16x16 pixel noise), sharpened by distance-aware fading,
   per-pixel lighting with micro relief, material-aware: grass blades, stone cracks, earth strata, sand ripples */
const GLN=`
float hn3(vec3 p){p=fract(p*.3183099+vec3(.71,.113,.419));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hn3(i),hn3(i+vec3(1.,0.,0.)),f.x),mix(hn3(i+vec3(0.,1.,0.)),hn3(i+vec3(1.,1.,0.)),f.x),f.y),
  mix(mix(hn3(i+vec3(0.,0.,1.)),hn3(i+vec3(1.,0.,1.)),f.x),mix(hn3(i+vec3(0.,1.,1.)),hn3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float fbm3(vec3 p){float s=.5*vn3(p);p=p*2.07+vec3(3.1,1.7,5.3);s+=.25*vn3(p);p=p*2.11+vec3(1.3,7.9,2.2);s+=.125*vn3(p);return s/.875;}
`;
/* bump: perturb the view-space normal from a procedural height (derivative method) */
const GLBUMP=`
vec3 bumpN(vec3 n,vec3 vp,float h,float k){vec3 dpx=dFdx(vp),dpy=dFdy(vp);float dhx=dFdx(h)*k,dhy=dFdy(h)*k;vec3 r1=cross(dpy,n),r2=cross(n,dpx);float det=dot(dpx,r1);vec3 g=sign(det)*(dhx*r1+dhy*r2);return normalize(abs(det)*n-g);}
`;
const LMU={value:1.4};
/* ink: an anti-aliased line of constant screen width along an iso-contour of a value */
const GLINK=`
float inkL(float v,float lv,float w){float dv=max(fwidth(v),1e-4);return 1.-smoothstep(w*dv*.5,w*dv*1.6,abs(v-lv));}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
`;
/* ARCANE-STYLE SURFACES: hand-painted brush strokes (warm / cool), flat painted planes, black ink contours in every texture,
   banded "toon" light with cool shadows and warm light, ink hatching inside the shadows */
const matV=new THREE.MeshPhongMaterial({vertexColors:true,shininess:9,specular:0x0a0a0a});
matV.onBeforeCompile=sh=>{sh.uniforms.uHQ=GQU;sh.uniforms.uLMax=LMU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMat=mat;\n#ifdef USE_INSTANCING\nvWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying float vMat;uniform float uHQ;uniform float uLMax;'+GLN+GLBUMP+GLINK).replace('#include <color_fragment>',`#include <color_fragment>
 vec3 wN=normalize(cross(dFdx(vWP),dFdy(vWP)));vec3 aN=abs(wN);vec3 wq=vWP-wN*.002;
 vec2 uv=aN.y>.5?wq.xz:(aN.x>.5?wq.zy:wq.xy);
 float fw=max(length(dFdx(uv)),length(dFdy(uv)));
 #define FA(f) (1.-smoothstep(.22,.5,(f)*fw))
 bool HQ=uHQ>.5;
 vec3 bc=diffuseColor.rgb;float mxc=max(bc.r,max(bc.g,bc.b)),mnc=min(bc.r,min(bc.g,bc.b)),sat=mxc-mnc,lum=dot(bc,vec3(.299,.587,.114));
 bc=mix(vec3(lum),bc,1.12);
 float kG=clamp((bc.g-max(bc.r,bc.b))*7.,0.,1.);
#ifdef TERR
 float kT=kG;
#else
 float kT=0.;
#endif
 float kS=clamp(1.-sat*9.,0.,1.)*(1.-smoothstep(.78,.9,lum));
 float kD=clamp((bc.r-bc.b)*4.-.4,0.,1.)*(1.-kG)*(1.-smoothstep(.6,.74,lum));
 float kN=clamp((bc.r-bc.b)*3.,0.,1.)*smoothstep(.6,.72,lum)*(1.-kG);
 float mId=floor(vMat+.5);if(mId>.5&&mId<8.5){kG=0.;kT=0.;kS=mId==1.?.55:0.;kD=mId==2.?1.:0.;kN=0.;}
 float macro=vn3(wq*.15);
 bool hz=kD>.5&&aN.y<.5;vec2 rA=hz?uv:vec2(dot(uv,vec2(.866,.5)),dot(uv,vec2(-.5,.866))),rB=hz?uv:vec2(dot(uv,vec2(-.342,.94)),dot(uv,vec2(-.94,-.342)));
 float mk=hz?0.:smoothstep(.35,.65,vn3(wq*.21+11.));
 float sA=mix(vn3(vec3(rA.x*.8,rA.y*4.2,3.7)),vn3(vec3(rB.x*.8,rB.y*4.2,9.1)),mk),sB=HQ?mix(vn3(vec3(rA.x*1.9,rA.y*9.,8.1)),vn3(vec3(rB.x*1.9,rB.y*9.,2.3)),mk):.5;
 float stroke=mix(sA,sA*.75+sB*.25,FA(9.));float fS=FA(4.2);
 float sQ=mix(.5,mix(.5,smoothstep(.3,.7,stroke),.75),fS);
 float ink=0.;
 vec3 tw=mix(vec3(.93,.95,1.03),vec3(1.05,1.02,.95),sQ);
 if(kG>0.){float cl=vn3(wq*1.35+5.);
#ifdef TERR
  float m1=fbm3(wq*.06+3.),m2=vn3(wq*.2+17.);
  /* painted meadow: broad cool / warm patches, then blunt brush strokes of lighter (warm) and darker (cool) paint following a gentle flow */
  vec3 gb=bc*vec3(.66,.82,1.16);gb=mix(vec3(dot(gb,vec3(.3,.59,.11))),gb,.97);
  vec3 g=mix(gb*vec3(.8,.92,1.04),gb*vec3(1.12,1.04,.8),smoothstep(.25,.78,m1))*(.88+.22*m2)*(.95+.08*smoothstep(.25,.75,cl));
  if(aN.y>.5){
   float fD=FA(4.);
   if(fD>.001){vec2 p=uv*2.6,ic=floor(p),fc=fract(p);float ew=fw*2.6;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),c=ic+o;
     float h1=hn3(vec3(c,1.7)),h2=hn3(vec3(c,4.3)),h3=hn3(vec3(c,8.9)),h4=hn3(vec3(c,2.1));
     float an=vn3(vec3(c*.11,7.))*6.2832+(h3-.5)*.6,ca=cos(an),sa=sin(an);
     vec2 d=fc-o-vec2(h1,h2)*.8-.1,q=vec2(d.x*ca+d.y*sa,-d.x*sa+d.y*ca);
     float L=.24+.22*h2,Wd=.11+.06*h1;q.y+=sin(q.x*5.+h3*6.2832)*.025;
     float sd=length(vec2(max(abs(q.x)-L,0.),q.y))-Wd*(1.-.25*clamp(q.x/max(L,.01),-1.,1.));
     float a=(1.-smoothstep(-ew*.7,ew*.7,sd))*fD*.62,tn=h4*2.-1.;
     g=mix(g,g*(1.+tn*.15)*mix(vec3(.96,1.,1.05),vec3(1.05,1.02,.9),h4),a);}}
   float fF=HQ?FA(12.):0.;
   if(fF>.001){vec2 p=uv*6.3,ic=floor(p),fc=fract(p);float ew=fw*6.3;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),c=ic+o;
     float h1=hn3(vec3(c,3.3)),h2=hn3(vec3(c,6.1)),h3=hn3(vec3(c,9.7)),h4=hn3(vec3(c,1.9));
     float an=vn3(vec3(c*.045,7.))*6.2832+(h3-.5)*.8,ca=cos(an),sa=sin(an);
     vec2 d=fc-o-vec2(h1,h2)*.8-.1,q=vec2(d.x*ca+d.y*sa,-d.x*sa+d.y*ca);
     float L=.2+.2*h2,Wd=.1+.05*h1,sd=length(vec2(max(abs(q.x)-L,0.),q.y))-Wd;
     float a=(1.-smoothstep(-ew*.7,ew*.7,sd))*fF*.5,tn=h4*2.-1.;
     g=mix(g,g*(1.+tn*.12),a);}}
  }else g=mix(g,g*.62,inkL(cl,.6,1.4)*.45*FA(3.));
  bc=mix(bc,g,kG);
#else
  float dr=fbm3(wq*.08+3.);bc*=vec3(.84,.93,.96);vec3 g0=bc*vec3(.72,.86,.9),g1=bc*vec3(1.08,1.04,.84);
  bc=mix(bc,mix(g0,g1,clamp(sQ*.6+cl*.5-.05,0.,1.))*mix(1.,1.06,smoothstep(.45,.85,dr)),kG);
  if(aN.y<.5)ink=max(ink,inkL(cl,.6,1.1)*.5*FA(3.)*kG);
#endif
 }
 if(kS>0.){float rr=max(1.-abs(vn3(wq*2.4)*2.-1.),(1.-abs(vn3(wq*4.9+9.)*2.-1.))*.95);
  float pl=floor(vn3(wq*1.6+2.)*3.)/2.;bc=mix(bc,bc*(.86+.26*pl),kS*.85);
  ink=max(ink,smoothstep(.93,.985,rr)*FA(9.)*kS*.9);}
 if(kD>0.){float gr=vn3(vec3(rA.x*.9,rA.y*9.,4.));ink=max(ink,inkL(gr,.5,1.1)*.5*FA(9.)*kD);}
 if(kN>0.){float rp=vn3(vec3(wq.x*.5+wq.z*.9,0.,wq.z*.3)*3.);ink=max(ink,inkL(rp,.5,1.)*.25*FA(3.)*kN);}
 bc*=mix(tw*(.9+.2*macro),vec3(1.),kT*.9);if(aN.y<.5)bc*=.94;
 diffuseColor.rgb=mix(bc,bc*vec3(.1,.085,.12),ink);
#ifdef TERR
 if(vWP.y<11.9&&vMat<8.5){float dw=clamp((11.92-vWP.y)*.32+.25,0.,1.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.09,.24,.3),dw*.85);}
#endif
 float hB=stroke*.6*fS;`).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>').replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 {vec3 alb=max(diffuseColor.rgb,vec3(.004));vec3 irr=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/alb;float li=dot(irr,vec3(.299,.587,.114));
  float r=li/max(uLMax,.05);
  float bd=.4+.3*smoothstep(.24,.36,r)+.3*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);
  vec3 tnt=mix(vec3(.64,.74,1.08),vec3(1.06,1.,.88),smoothstep(.36,.7,r));
  vec3 nI=irr/max(li,1e-4)*bd*uLMax*tnt;
  float h1=0.;if(r<.5){float hl=fract((uv.x+uv.y)*4.+vn3(vec3(uv*2.,1.))*.7);h1=(1.-smoothstep(.06,.17,hl))*(1.-smoothstep(.28,.5,r));
   if(r<.34){float hl2=fract((uv.x-uv.y)*4.+vn3(vec3(uv*2.,2.))*.7);h1=max(h1,(1.-smoothstep(.06,.17,hl2))*(1.-smoothstep(.18,.34,r)));}h1*=FA(4.);}
  nI*=1.-h1*.42*(1.-.55*kT)*(vMat>4.5&&vMat<5.5?0.:1.);
  if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.2);nI=nI*1.08+vec3(1.,.86,.56)*fr*.75*uLMax+vec3(1.,.95,.8)*smoothstep(.62,.9,r)*.35*uLMax;}
  reflectedLight.directDiffuse=alb*nI;reflectedLight.indirectDiffuse=vec3(0.);
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse=alb*.3*uLMax;totalEmissiveRadiance+=alb*1.35;}}`).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{gl_FragColor.rgb*=vec3(1.02,1.,.97);}');};
const matWater=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.84,depthWrite:true,shininess:140,specular:0xa0b0bc}),WUT={value:0};
matWater.onBeforeCompile=sh=>{sh.uniforms.uT=WUT;sh.uniforms.uHQ=GQU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec3 wp0=(modelMatrix*vec4(position,1.0)).xyz;transformed.y+=(sin(wp0.x*1.3+uT*1.4)+sin(wp0.z*1.7+uT*1.1))*.025;vWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uT;uniform float uHQ;'+GLN+GLBUMP).replace('#include <color_fragment>',`#include <color_fragment>
 float w1=vn3(vec3(vWP.xz*1.25+vec2(uT*.33,uT*.21),uT*.14)),w2=vn3(vec3(vWP.xz*3.2-vec2(uT*.47,-uT*.29),uT*.25+7.)),w3=vn3(vec3(vWP.xz*8.5+vec2(uT*.9,uT*.6),uT*.4+3.));
 float fwW=length(fwidth(vWP.xz));float hW=w1*.55+w2*.3*(1.-smoothstep(.07,.16,3.2*fwW))+w3*.15*(1.-smoothstep(.22,.5,8.5*fwW));
 float shf=smoothstep(.3,.8,vColor.r);vec3 wc=mix(vec3(.08,.34,.58),vec3(.16,.58,.64),smoothstep(.2,.3,vColor.r));
 float fp=smoothstep(.5,.78,vn3(vec3(vWP.xz*2.7+vec2(uT*.22,-uT*.17),uT*.45)))*shf+smoothstep(.85,1.,shf)*.35;fp=min(fp,1.);
 diffuseColor.rgb=mix(wc*(.9+.2*w1),vec3(.9,.96,1.),fp*.85);diffuseColor.a=mix(mix(.88,.68,smoothstep(.2,.32,vColor.r)),.95,fp);hW+=fp*.6;float fwF=max(fwidth(fp),1e-4);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.25,(1.-smoothstep(fwF*.6,fwF*1.8,abs(fp-.42)))*.6*step(.05,shf));`).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=bumpN(normal,-vViewPosition,hW,uHQ>.5?.17:.08);').replace('#include <tonemapping_fragment>',`{vec3 Vw=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vw),0.,1.),4.);
 #ifdef USE_FOG
 gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor*1.02,fr*.25);
 #endif
 gl_FragColor.a=mix(gl_FragColor.a,1.,fr*.35);}
#include <tonemapping_fragment>`);};
function gh(x,z){const tx=Math.max(0,Math.min(TW-1,x|0)),ty=Math.max(0,Math.min(TH-1,z|0)),i=ty*TW+tx;
 if(stairs.size){const s=stairs.get(i);if(s){const f=s.ax?z-ty:x-tx,t=s.sg>0?f:1-f;return s.lo+(s.hi-s.lo)*Math.max(0,Math.min(1,t))}}return HT[i]}
/* ---- terrain chunk meshes ---- */
const unitG=new Map(),CHK=new Map(),dirtyT=new Set(),dirtyP=new Set(),RM=3;
const keyOf=(cx,cy)=>cy*NCX+cx;
function markT(tx,ty){const cx=(tx/CH)|0,cy=(ty/CH)|0;dirtyT.add(keyOf(cx,cy));const ex=tx%CH,ey=ty%CH;if(ex===0&&cx>0)dirtyT.add(keyOf(cx-1,cy));if(ex===CH-1&&cx<NCX-1)dirtyT.add(keyOf(cx+1,cy));if(ey===0&&cy>0)dirtyT.add(keyOf(cx,cy-1));if(ey===CH-1&&cy<NCY-1)dirtyT.add(keyOf(cx,cy+1))}
function markP(tx,ty){dirtyP.add(keyOf((tx/CH)|0,(ty/CH)|0))}
const DIRT=[.53,.38,.26],GRASS=[.37,.6,.25],AOK=[1,.8,.66,.55];
function topCol(i,x,y,np){const h=HT[i],v=ter[i],al=h-LAND,j=.97+.06*hs(x,y,9);let b;
 if(!np&&pth[i]===2)return shade([.56,.56,.57],.9+.12*hs(x,y,19)+(((x+y)&1)?.07:0));
 if(!np&&pth[i])return shade([.6,.49,.3],.92+.12*hs(x,y,19)+(((x+y)&1)?.04:0));
 if(v===0&&SCRT.has(i))return shade([.34,.27,.2],.82+.22*hs(x,y,31));
 if(v===1)return shade(FLG[i]&4?[.42,.44,.36]:[.26,.34,.36],j);
 if(v===0&&TFL[i]&&h<LAND){if(h<=BED)return shade([.2,.2,.23],.85+.25*hs(x,y,37));if(h<=LAND-3)return shade([.5,.5,.52],.88+.2*hs(x,y,37)+(((x+y)&1)?.04:0));return shade(DIRT,.9+.16*hs(x,y,37))}
 if(v===5||al>=15){b=h>=SNOW?[.95,.97,.99]:al>=19?[.6,.6,.62]:[.49,.49,.5]}
 else{const m=fb(x*.05,y*.05,SEED+500),dry=Math.max(0,Math.min(1,(m-.5)*3));b=[GRASS[0]+(.62-GRASS[0])*dry*.5,GRASS[1]+(.6-GRASS[1])*dry*.3,GRASS[2]+(.3-GRASS[2])*dry*.5];
  if(al>=8){const t=Math.min(1,(al-8)/12);b=[b[0]+(.5-b[0])*t,b[1]+(.54-b[1])*t,b[2]+(.42-b[2])*t]}
  if(al<=1&&(FLG[i]&4||ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1))b=[.88,.82,.6];else if(FLG[i]&8&&al<=1)b=[(b[0]+.88)/2,(b[1]+.82)/2,(b[2]+.6)/2];
  if(v===2)b=shade(b,.78);else if(v===3)b=[.5,.5,.46];else if(v===4)b=[.42,.4,.36]}
 return shade(b,j)}
function sideCol(i,k,x,y){let b;if(k+1>=SNOW)b=[.9,.92,.95];else if(ter[i]===5||k>=LAND+9)b=shade([.49,.49,.5],1+(k-LAND)*.004);else if(FLG[i]&4&&k>=LAND-2)b=[.8,.74,.52];else b=DIRT;
 if(k<=BED)b=[.2,.2,.23];return shade(b,(((k>>1)&1)?.98:1)*(.94+.12*hs(x*3+k,y*5,k)))}
const OB=(a,b)=>a<0||b<0||a>=TW||b>=TH,SKB=BED-4;
/* ---- v79 paths: a real trail on the grass - the path is drawn as a band joining its neighbours (no more square tiles),
   with a grassy verge; wood = packed earth with wheel ruts and log edging, stone = cobbles with curb stones.
   Along the edges it picks up what grows next to it: leaves and mushrooms by the woods, reeds by water, pebbles by rocks,
   flowers by houses, tufts and wild flowers in the meadow ---- */
function pbox(G,x0,y0,z0,x1,y1,z1,c){const t=shade(c,1.08),s1=shade(c,.86),s2=shade(c,.74);
 quad(G,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0],t,t,t,t);
 quad(G,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],s1,s1,s1,s1);quad(G,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],s2,s2,s2,s2);
 quad(G,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],s1,s1,s1,s1);quad(G,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],s2,s2,s2,s2)}
function pathTop(G,i,x,y,h,gc){const st=pth[i]===2,m=.17,H=h+.012;gc=gc||GRASS;
 quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],gc,gc,gc,gc);
 const cn=(dx,dy)=>{const a=x+dx,b=y+dy;if(a<0||b<0||a>=TW||b>=TH)return false;const j=b*TW+a;if(pth[j])return true;const o=occ.get(j);return !!o&&o.t===0&&(o.type==='gate'||o.type==='castle')},
  N=cn(0,-1),S=cn(0,1),E=cn(1,0),Wd=cn(-1,0),x0=Wd?0:m,x1=E?1:1-m,z0=N?0:m,z1=S?1:1-m;
 /* the band: a centre square plus an arm to each joined side */
 const rects=[[x+m,y+m,x+1-m,y+1-m]];if(N)rects.push([x+m,y,x+1-m,y+m]);if(S)rects.push([x+m,y+1-m,x+1-m,y+1]);if(Wd)rects.push([x,y+m,x+m,y+1-m]);if(E)rects.push([x+1-m,y+m,x+1,y+1-m]);
 if(!st){const base=[.56,.42,.27];
  for(const[a0,b0,a1,b1]of rects){const n=2;for(let u=0;u<n;u++)for(let v=0;v<n;v++){const A=a0+(a1-a0)*u/n,B=b0+(b1-b0)*v/n,C2=a0+(a1-a0)*(u+1)/n,D2=b0+(b1-b0)*(v+1)/n,c=shade(base,.88+.2*hs(x*7+A*13,y*5+B*11,61));quad(G,[A,H,B],[A,H,D2],[C2,H,D2],[C2,H,B],[0,1,0],c,c,c,c)}}
  /* wheel ruts along the main direction */
  const ns=N||S,ew=E||Wd,ax=ew&&!ns?1:0,rc=shade(base,.7);for(const r of[.37,.63]){if(ax){if(Wd||E)quad(G,[x0,H+.002,y+r-.03],[x0,H+.002,y+r+.03],[x1,H+.002,y+r+.03],[x1,H+.002,y+r-.03],[0,1,0],rc,rc,rc,rc)}else quad(G,[x+r-.03,H+.002,z0],[x+r-.03,H+.002,z1],[x+r+.03,H+.002,z1],[x+r+.03,H+.002,z0],[0,1,0],rc,rc,rc,rc)}
  for(let k=0;k<3;k++){const px=x+m+.06+hs(x+k,y,71)*(1-2*m-.12),pz=y+m+.06+hs(x,y+k,73)*(1-2*m-.12),s=.03+hs(x+k,y+k,75)*.03,c=shade([.6,.58,.54],.9+.2*hs(k,x,77));pbox(G,px-s,H,pz-s,px+s,H+s*.9,pz+s,c)}}
 else{for(const[a0,b0,a1,b1]of rects){const nx=Math.max(1,Math.round((a1-a0)/.17)),nz=Math.max(1,Math.round((b1-b0)/.17));for(let u=0;u<nx;u++)for(let v=0;v<nz;v++){const o=(v%2)*.5/nx*(a1-a0);let A=a0+(a1-a0)*u/nx+o,C2=a0+(a1-a0)*(u+1)/nx+o;A=Math.max(a0,A)+.012;C2=Math.min(a1,C2)-.012;if(C2<=A)continue;const B=b0+(b1-b0)*v/nz+.012,D2=b0+(b1-b0)*(v+1)/nz-.012,c=shade([.64,.63,.62],.8+.3*hs(x*9+u,y*7+v,63));pbox(G,A,h,B,C2,H+.02,D2,c)}
   const gm=shade([.36,.35,.33],1);quad(G,[a0,H-.004,b0],[a0,H-.004,b1],[a1,H-.004,b1],[a1,H-.004,b0],[0,1,0],gm,gm,gm,gm)}}
 /* edging along the open sides of the band */
 const edge=(ax0,az0,ax1,az1)=>{if(st)pbox(G,ax0,h,az0,ax1,H+.05,az1,shade([.74,.72,.68],.9+.15*hs(ax0*9,az0*7,67)));else pbox(G,ax0,h,az0,ax1,H+.045,az1,shade([.42,.29,.17],.9+.15*hs(ax0*9,az0*7,69)))};
 const ew2=.05;if(!N)edge(x+m-ew2,y+m-ew2,x+1-m+ew2,y+m);if(!S)edge(x+m-ew2,y+1-m,x+1-m+ew2,y+1-m+ew2);if(!Wd)edge(x+m-ew2,y+m,x+m,y+1-m);if(!E)edge(x+1-m,y+m,x+1-m+ew2,y+1-m);
 if(N){if(!Wd)edge(x+m-ew2,y,x+m,y+m);if(!E)edge(x+1-m,y,x+1-m+ew2,y+m)}if(S){if(!Wd)edge(x+m-ew2,y+1-m,x+m,y+1);if(!E)edge(x+1-m,y+1-m,x+1-m+ew2,y+1)}
 if(Wd){if(!N)edge(x,y+m-ew2,x+m,y+m);if(!S)edge(x,y+1-m,x+m,y+1-m+ew2)}if(E){if(!N)edge(x+1-m,y+m-ew2,x+1,y+m);if(!S)edge(x+1-m,y+1-m,x+1,y+1-m+ew2)}
 /* what grows on the verge depends on the neighbourhood */
 let tr=0,wa=0,rk=0,ho=0;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=TW||yy>=TH)continue;const j=yy*TW+xx,t=ter[j];if(t===2)tr++;else if(t===1)wa++;else if(t===3||t===5)rk++;const o=occ.get(j);if(o&&o.t===0&&o.type!=='wall'&&o.type!=='gate')ho++}
 const spots=[];for(let k=0;k<6;k++){const side=(hs(x,y,80+k)*4)|0,t=.1+hs(x+k,y,90)*.8,d=.03+hs(x,y+k,95)*(m-.06);let px,pz;
  if(side===0){if(N&&t>m&&t<1-m)continue;px=x+t;pz=y+d}else if(side===1){if(S&&t>m&&t<1-m)continue;px=x+t;pz=y+1-d}else if(side===2){if(Wd&&t>m&&t<1-m)continue;px=x+d;pz=y+t}else{if(E&&t>m&&t<1-m)continue;px=x+1-d;pz=y+t}spots.push([px,pz,k])}
 for(const[px,pz,k]of spots){const r=hs(px*13,pz*17,99);
  if(wa>2&&r<.6){const hh=.14+r*.2;pbox(G,px-.012,h,pz-.012,px+.012,h+hh,pz+.012,[.35,.55,.22]);pbox(G,px+.02,h,pz-.01,px+.04,h+hh*.8,pz+.01,[.42,.6,.25]);if(r<.2)pbox(G,px-.018,h+hh,pz-.018,px+.018,h+hh+.05,pz+.018,[.45,.3,.15])}
  else if(tr>3&&r<.55){if(r<.18){pbox(G,px-.012,h,pz-.012,px+.012,h+.05,pz+.012,[.9,.88,.8]);pbox(G,px-.035,h+.05,pz-.035,px+.035,h+.075,pz+.035,r<.09?[.8,.18,.15]:[.62,.45,.3])}else{const c=r<.36?[.75,.45,.15]:[.55,.32,.12];quad(G,[px-.04,h+.004,pz-.03],[px-.03,h+.004,pz+.04],[px+.04,h+.004,pz+.03],[px+.03,h+.004,pz-.04],[0,1,0],c,c,c,c)}}
  else if(rk>2&&r<.6){const s=.025+r*.04;pbox(G,px-s,h,pz-s,px+s,h+s*1.2,pz+s*.8,shade([.58,.58,.6],.85+r*.3))}
  else if(ho>3&&r<.5){pbox(G,px-.01,h,pz-.01,px+.01,h+.08,pz+.01,[.3,.55,.22]);const fc=[[.9,.3,.35],[.95,.85,.3],[.6,.4,.9],[1,1,1]][(r*8|0)%4];pbox(G,px-.025,h+.08,pz-.025,px+.025,h+.11,pz+.025,fc)}
  else if(r<.45){const c=shade(gc,.8+r*.3);pbox(G,px-.01,h,pz-.01,px+.01,h+.06+r*.08,pz+.01,c);pbox(G,px+.012,h,pz-.008,px+.03,h+.05+r*.06,pz+.008,c);if(r<.08)pbox(G,px-.02,h+.09,pz-.02,px+.02,h+.115,pz+.02,[.95,.9,.35])}}}
/* the world ends in a cut: earth and stone walls down the map border, and the rivers that reach it end in a wall of water */
function waterSkirt(G,x,y,h){for(let q=0;q<4;q++){const dx=q===0?1:q===1?-1:0,dy=q===2?1:q===3?-1:0;if(!OB(x+dx,y+dy))continue;const k=[.9,.8,.95,.75][q];
 const face=(b,t,s,s2)=>{if(q===0)quad(G,[x+1,b,y],[x+1,t,y],[x+1,t,y+1],[x+1,b,y+1],[1,0,0],s,s2,s2,s);else if(q===1)quad(G,[x,b,y+1],[x,t,y+1],[x,t,y],[x,b,y],[-1,0,0],s,s2,s2,s);else if(q===2)quad(G,[x+1,b,y+1],[x+1,t,y+1],[x,t,y+1],[x,b,y+1],[0,0,1],s,s2,s2,s);else quad(G,[x,b,y],[x,t,y],[x+1,t,y],[x+1,b,y],[0,0,-1],s,s2,s2,s)};
 for(let b=SKB;b<h;b++){const s=shade(b<h-2?[.5,.5,.5]:DIRT,k*(.9+.2*hs(x*3+b,y*5,b)));face(b,b+1,s,s)}
 face(h,WLV,shade([.14,.33,.6],k),shade([.32,.6,.84],k))}}
function buildChunk(cx,cy){try{return buildChunk0(cx,cy)}finally{BMAT=0}}
const wetT=(x,y)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(gOK(x+i,y+j)&&ter[(y+j)*TW+x+i]===1)return true;return false};
function buildChunk0(cx,cy){const G=newG(),WG=newG(),x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 const nh=(x,y,h)=>gOK(x,y)?HT[y*TW+x]:h;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,h=HT[i],c=topCol(i,x,y);BMAT=wetT(x,y)?0:9;
  const rs=stairs.size?stairs.get(i):null;
  if(rs&&rs.nat){const hl=rs.lo,hh2=rs.hi,sg=rs.sg>0,ax=rs.ax,ns=Math.max(2,Math.round((hh2-hl)*2)),st=(hh2-hl)/ns,rc=shade(DIRT,.8*(.9+.2*hs(x,y,5))),gc=shade(c,.88);
   for(let k=0;k<ns;k++){const u0=k/ns,u1=(k+1)/ns,yt=hl+(k+1)*st,yb=yt-st,p0=sg?u0:1-u1,p1=sg?u1:1-u0,ck=shade(c,.96+.04*(k&1));
    if(ax===0){quad(G,[x+p0,yt,y],[x+p0,yt,y+1],[x+p1,yt,y+1],[x+p1,yt,y],[0,1,0],ck,ck,ck,ck);const rx=sg?x+p0:x+p1,nx=sg?-1:1;
     if(nx<0)quad(G,[rx,yb,y+1],[rx,yt,y+1],[rx,yt,y],[rx,yb,y],[-1,0,0],shade(rc,.75),gc,gc,shade(rc,.75));else quad(G,[rx,yb,y],[rx,yt,y],[rx,yt,y+1],[rx,yb,y+1],[1,0,0],shade(rc,.75),gc,gc,shade(rc,.75));
     for(const sd of[0,1]){const nb=nh(x,y+(sd?1:-1),h);if(nb>=yt)continue;const z=y+sd,yb2=Math.max(h,nb);if(sd)quad(G,[x+p1,yb2,z],[x+p1,yt,z],[x+p0,yt,z],[x+p0,yb2,z],[0,0,1],rc,rc,rc,rc);else quad(G,[x+p0,yb2,z],[x+p0,yt,z],[x+p1,yt,z],[x+p1,yb2,z],[0,0,-1],rc,rc,rc,rc)}}
    else{quad(G,[x,yt,y+p0],[x,yt,y+p1],[x+1,yt,y+p1],[x+1,yt,y+p0],[0,1,0],ck,ck,ck,ck);const rz=sg?y+p0:y+p1,nz=sg?-1:1;
     if(nz<0)quad(G,[x,yb,rz],[x,yt,rz],[x+1,yt,rz],[x+1,yb,rz],[0,0,-1],shade(rc,.75),gc,gc,shade(rc,.75));else quad(G,[x+1,yb,rz],[x+1,yt,rz],[x,yt,rz],[x,yb,rz],[0,0,1],shade(rc,.75),gc,gc,shade(rc,.75));
     for(const sd of[0,1]){const nb=nh(x+(sd?1:-1),y,h);if(nb>=yt)continue;const xx=x+sd,yb2=Math.max(h,nb);if(sd)quad(G,[xx,yb2,y+p0],[xx,yt,y+p0],[xx,yt,y+p1],[xx,yb2,y+p1],[1,0,0],rc,rc,rc,rc);else quad(G,[xx,yb2,y+p1],[xx,yt,y+p1],[xx,yt,y+p0],[xx,yb2,y+p0],[-1,0,0],rc,rc,rc,rc)}}}
   {const bxn=ax===0?(sg?x+1:x-1):x,byn=ax===0?y:(sg?y+1:y-1),nb=nh(bxn,byn,h);if(nb<hh2){const yb2=Math.max(h,nb),s=shade(rc,.85);if(ax===0){const X=sg?x+1:x;if(sg)quad(G,[X,yb2,y],[X,hh2,y],[X,hh2,y+1],[X,yb2,y+1],[1,0,0],s,s,s,s);else quad(G,[X,yb2,y+1],[X,hh2,y+1],[X,hh2,y],[X,yb2,y],[-1,0,0],s,s,s,s)}else{const Z=sg?y+1:y;if(sg)quad(G,[x+1,yb2,Z],[x+1,hh2,Z],[x,hh2,Z],[x,yb2,Z],[0,0,1],s,s,s,s);else quad(G,[x,yb2,Z],[x,hh2,Z],[x+1,hh2,Z],[x+1,yb2,Z],[0,0,-1],s,s,s,s)}}}
   if(false){
const hl=rs.lo,hh2=rs.hi,sg=rs.sg>0,a0=sg?hl:hh2,a1=sg?hh2:hl,nn=rs.ax===0?[-(a1-a0),1,0]:[0,1,-(a1-a0)],nl=Math.hypot(...nn),n2=nn.map(v=>v/nl),c2=shade(c,.97);
   if(rs.ax===0)quad(G,[x,a0,y],[x,a0,y+1],[x+1,a1,y+1],[x+1,a1,y],n2,c2,c2,c2,c2);else quad(G,[x,a0,y],[x,a1,y+1],[x+1,a1,y+1],[x+1,a0,y],n2,c2,c2,c2,c2);
   const sc=shade(DIRT,.85*(.9+.2*hs(x,y,5)));
   for(const sd of[0,1]){if(rs.ax===0){const z=y+sd,nb=nh(x,y+(sd?1:-1),h);if(nb>=hh2)continue;const xl=sg?x:x+1,xh=sg?x+1:x,nz=sd?1:-1;tri(G,[xl,h,z],[xh,h,z],[xh,hh2,z],[0,0,nz],sc)}
    else{const xx=x+sd,nb=nh(x+(sd?1:-1),y,h);if(nb>=hh2)continue;const zl=sg?y:y+1,zh=sg?y+1:y,nx=sd?1:-1;tri(G,[xx,h,zl],[xx,h,zh],[xx,hh2,zh],[nx,0,0],sc)}}}}
  else if(pth[i]&&ter[i]===0&&!occ.has(i))pathTop(G,i,x,y,h,topCol(i,x,y,1));
  else{const oc=(xx,yy)=>gOK(xx,yy)&&HT[yy*TW+xx]>h?1:0,av=(a,b,cn)=>a&&b?3:a+b+cn,L=oc(x-1,y),Rr=oc(x+1,y),U=oc(x,y-1),D=oc(x,y+1),a0=av(L,U,oc(x-1,y-1)),a1=av(L,D,oc(x-1,y+1)),a2=av(Rr,D,oc(x+1,y+1)),a3=av(Rr,U,oc(x+1,y-1));
   if(a0|a1|a2|a3){const c0=shade(c,AOK[a0]),c1=shade(c,AOK[a1]),c2=shade(c,AOK[a2]),c3=shade(c,AOK[a3]);if(a0+a2>a1+a3)quad(G,[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[x,h,y],[0,1,0],c1,c2,c3,c0);else quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],c0,c1,c2,c3)}
   else quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],c,c,c,c)}
  if(ter[i]===1){const cv=(a,b)=>{let ld=0,dp=0,n=0;for(const[u,v]of[[a-2,b-2],[a-1,b-2],[a,b-2],[a+1,b-2],[a-2,b-1],[a-1,b-1],[a,b-1],[a+1,b-1],[a-2,b],[a-1,b],[a,b],[a+1,b],[a-2,b+1],[a-1,b+1],[a,b+1],[a+1,b+1]]){n++;if(!gOK(u,v)||ter[v*TW+u]!==1){if(Math.abs(u-a+.5)<1&&Math.abs(v-b+.5)<1)ld++;continue}dp+=Math.min(4,WLV-HT[v*TW+u])}const t=Math.min(1,dp/n/2.6),c=[.24-.13*t,.5-.2*t,.7-.12*t];if(!ld)return c;const f=Math.min(.22,ld*.07);return[c[0]+(.86-c[0])*f,c[1]+(.94-c[1])*f,c[2]+(.96-c[2])*f]};quad(WG,[x,WLV,y],[x,WLV,y+1],[x+1,WLV,y+1],[x+1,WLV,y],[0,1,0],cv(x,y),cv(x,y+1),cv(x+1,y+1),cv(x+1,y));if(x===0||y===0||x===TW-1||y===TH-1)waterSkirt(G,x,y,h)}
  let e;const capOK=ter[i]===0&&!pth[i]&&h-LAND<8&&!(ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1);
  for(let q=0;q<4;q++){const dx=q===0?1:q===1?-1:0,dy=q===2?1:q===3?-1:0,k=[.9,.8,.95,.75][q];e=OB(x+dx,y+dy)?SKB:nh(x+dx,y+dy,h);
   const face=(b,t,s,sb)=>{sb=sb||s;if(q===0)quad(G,[x+1,b,y],[x+1,t,y],[x+1,t,y+1],[x+1,b,y+1],[1,0,0],sb,s,s,sb);
    else if(q===1)quad(G,[x,b,y+1],[x,t,y+1],[x,t,y],[x,b,y],[-1,0,0],sb,s,s,sb);
    else if(q===2)quad(G,[x+1,b,y+1],[x+1,t,y+1],[x,t,y+1],[x,b,y+1],[0,0,1],sb,s,s,sb);
    else quad(G,[x,b,y],[x,t,y],[x+1,t,y],[x+1,b,y],[0,0,-1],sb,s,s,sb)};
   for(let b=e;b<h;b++){const t=b+1,dep=h-t;let s=shade(sideCol(i,b,x,y),k);
    if(ter[i]!==5&&h-LAND<9&&t<WLV+99){if(dep>=3&&dep>=0&&h-LAND<15)s=shade([.5,.5,.5],k*(.9+.2*hs(x*3+b,y*5,b)))}
    if(t<=WLV&&ter[(y+dy)*TW+x+dx]===1){const dd=Math.max(0,Math.min(1,(WLV-t)/4));s=shade([.36-.14*dd,.32-.1*dd,.24-.04*dd],k)}
    const sb=b===e&&ter[(y+dy)*TW+x+dx]!==1?shade(s,.7):s;if(t===h&&capOK){face(b,t-.28,s,sb);face(t-.28,t,shade(c,k*.92))}else face(b,t,s,sb)}}}
 const m=new THREE.Mesh(toGeo(G),matT);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);
 let w=null;if(WG.P.length){w=new THREE.Mesh(toGeo(WG),matWater);scene.add(w)}return{m,w}}
/* ---- props (trees, rocks, gold, flowers) merged per chunk ---- */
const LEAF=[['#3f7f2a','#4a8e32','#336f22','#5a9c3a'],['#46862e','#549638','#3a7626','#62a442'],['#3a7a34','#468a3e','#2f6a2a','#56984a']],PINEC=[['#2f7a4a','#3d8f58','#276a3e','#4ea068'],['#2a6e48','#37835a','#215c3a','#46966a']],BIRCH=['#a8c85a','#bcd86a','#92b04a','#d0e684'];





function forestGeo(v){const G=newG(),R=rngf(v*389+17),L=LEAF[v%3],T='#5b4326';bxc(G,0,0,0,.3,.6,.3,T);bxc(G,.02,.2,.151,.1,.12,.02,'#4a361e');
 const lc=()=>[L[0],L[1],L[2],L[0]][(R()*4)|0];for(const[a,b]of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]]){bxc(G,a,.55,b,.5,.5,.5,lc());if(R()<.78)bxc(G,a,1.05,b,.5,.5,.5,lc())}
 if(v>=1){bxc(G,0,1.55,0,.5,.5,.5,lc())}if(v===2){bxc(G,.25,1.55,-.25,.5,.25,.5,lc())}if(v>=3){bxc(G,-.25,1.55,.25,.5,.5,.5,lc());bxc(G,.25,1.55,.25,.5,.25,.5,lc())}
 if(v%2&&R()<.5)bxc(G,.26,.8,.51,.08,.08,.02,'#c8282a');return toGeo(G)}
const FOR=[0,1,2,3,4,5].map(forestGeo);
/* ---- Minecraft-style props: everything built from .3 cubes ---- */
const MC_=.3;
function mcLeaves(G,R,cols,layers,s){layers.forEach(([y,pat])=>{const cells=pat==='sq'?[[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]]:pat==='plus'?[[0,0],[1,0],[-1,0],[0,1],[0,-1]]:[[0,0]];
  cells.forEach(([a,b])=>{if(pat==='sq'&&a&&b&&R()<.22)return;bxc(G,a*MC_*s,y*s,b*MC_*s,MC_*s*1.02,MC_*s*1.02,MC_*s*1.02,cols[(R()*cols.length)|0])})})}
function oakGeo(v){const G=newG(),R=rngf(v*977+13),L=LEAF[v%3],s=.95+(v>>1)*.1;
 for(let k=0;k<3;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#6b4a2a':'#5b3f22');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.6,'sq'],[.9,'sq'],[1.2,'plus'],[1.5,'one']],s);
 if(v%3===1)[[.3,.9,.45],[-.35,.6,.42]].forEach(([x,y,z])=>bxc(G,x*s,y*s,z*s,.1,.1,.1,'#e04a3a'));return toGeo(G)}
function pineGeo(v){const G=newG(),R=rngf(v*733+5),L=PINEC[v%2],s=.95+(v>>1)*.15;
 for(let k=0;k<4;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#4f3418':'#3f2a14');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.45,'sq'],[.75,'plus'],[1.05,'sq'],[1.35,'plus'],[1.65,'one'],[1.95,'one']],s);
 if(v>1)[[1.65,0,0],[1.35,.3,0],[1.35,-.3,0]].forEach(([y,x,z])=>bxc(G,x*s,(y+.27)*s,z*s,.2,.06,.2,'#eef4f2'));return toGeo(G)}
function birchGeo(v){const G=newG(),R=rngf(v*511+3),s=.95+v*.1;
 for(let k=0;k<4;k++){bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,'#e8e4d8');if(k%2===0)bxc(G,.03,k*MC_*s+.05,MC_*s/2,.12,.06,.03,'#2a2a2a')}
 mcLeaves(G,R,[BIRCH[0],BIRCH[1],BIRCH[2]],[[.9,'sq'],[1.2,'sq'],[1.5,'plus'],[1.8,'one']],s);return toGeo(G)}
function rockGeo(v){const G=newG(),R=rngf(v*331+9),C=[['#9aa1ac','#a9b0bb','#7e8590'],['#868d98','#9ea5b0','#6a717e'],['#a8aeb8','#b8bec8','#8c929e'],['#707784','#868d9a','#5a606c'],['#9c9a92','#adab9f','#7f7d74'],['#8a9098','#9aa0aa','#6f757f']][v%6];
 bxc(G,0,0,0,.75,.4,.75,C[0]);bxc(G,.18,.4,.1,.42,.3,.42,C[1]);bxc(G,-.25,0,-.3,.34,.3,.34,C[2]);if(v%2)bxc(G,-.28,.3,-.28,.2,.14,.2,C[0]);bxc(G,-.3,.4,.2,.2,.08,.22,'#5d8a4a');
 [[.2,.2,.38],[-.2,.1,.38],[.38,.25,-.1]].forEach(([x,y,z])=>bxc(G,x,y,z,.14,.14,.05,C[2]));return toGeo(G)}
function goldGeo(v){const G=newG();bxc(G,0,0,0,.8,.8,.8,'#7d7d7d');
 [[-.2,.2,.41],[.2,.5,.41],[0,.62,.41],[.41,.3,-.1],[.41,.55,.2],[-.41,.4,.0],[-.15,.82,.1],[.1,.82,-.2],[-.1,.1,-.41],[.25,.35,-.41]].forEach(([x,y,z],k)=>{const q=k%3?.18:.24;bxc(G,x,y,z,Math.abs(x)>.4?.06:q,q,Math.abs(z)>.4?.06:q,k%2?'#ffd23c':'#f0b020')});
 bxc(G,0,.8,0,.5,.04,.5,'#8d8d8d');return toGeo(G)}
const VAR={t:[0,1,2,3,4,5].map(oakGeo).concat([0,1,2,3].map(pineGeo)).concat([0,1,2].map(birchGeo)),r:[0,1,2,3,4,5].map(rockGeo),g:[0,1,2].map(goldGeo)};
/* decor (grass-level, non blocking) */
function bushGeo(v){const G=newG(),L=LEAF[v%3];bxc(G,0,0,0,.44,.38,.44,L[0]);bxc(G,.12,.2,.12,.22,.22,.22,L[1]);bxc(G,-.14,.06,-.1,.2,.2,.2,L[2]);if(v%2)[[.18,.3,.22],[-.2,.22,.16],[.1,.12,-.23]].forEach(([x,y,z])=>bxc(G,x,y,z,.06,.06,.06,'#c8282a'));return toGeo(G)}
function flowerGeo(v){const G=newG(),C=[['#f0f0e8','#e8c020'],['#f0d020','#e8a010'],['#c8282a','#2a2a2a'],['#4a6ad8','#2a3a8a'],['#b060d8','#7a2a9a']][v%5];[[0,0],[.2,.14],[-.16,.12]].forEach(([x,z],k)=>{const h=.18+.05*(k%2);bxc(G,x,0,z,.03,h,.03,'#3f7f2a');bxc(G,x+.04,h*.4,z,.06,.03,.03,'#4a8e32');bxc(G,x,h,z,.1,.08,.1,C[0]);bxc(G,x,h+.03,z,.04,.06,.04,C[1])});return toGeo(G)}
function tuftGeo(v){const G=newG(),c=['#4a8e32','#5a9c3a','#3f7f2a'];[[0,0,.32],[.07,.05,.24],[-.07,.04,.28],[.03,-.07,.22],[-.04,-.06,.2],[.1,-.02,.18]].forEach(([x,z,h],k)=>bxc(G,x,0,z,.03,h,.03,c[k%3]));return toGeo(G)}
function mushGeo(v){const G=newG();bxc(G,0,0,0,.06,.12,.06,'#e8e0d0');bxc(G,0,.12,0,.18,.08,.18,'#c8282a');[[.05,.2,.05],[-.05,.2,-.04]].forEach(([x,y,z])=>bxc(G,x,y,z,.04,.01,.04,'#ffffff'));bxc(G,.15,0,.1,.04,.08,.04,'#e8e0d0');bxc(G,.15,.08,.1,.1,.04,.1,'#9a6a4a');return toGeo(G)}
function reedGeo(v){const G=newG();[[0,0,.75],[.11,.06,.9],[-.09,.08,.6]].forEach(([x,z,h])=>{for(let y=0;y<h;y+=.15){bxc(G,x,y,z,.05,.14,.05,'#94c86a');bxc(G,x,y+.13,z,.06,.02,.06,'#6a9a48')}bxc(G,x+.04,h*.6,z,.06,.02,.03,'#a8d878')});return toGeo(G)}
function logGeo(v){const G=newG();bxc(G,0,0,0,.8,.24,.24,'#5b4326');bxc(G,.4,0,0,.02,.24,.24,'#a88a52');bxc(G,-.4,0,0,.02,.24,.24,'#a88a52');bxc(G,.4,.08,0,.025,.08,.08,'#8a6a3a');bxc(G,-.1,.24,.02,.2,.03,.14,'#4a8e32');return toGeo(G)}
const DEC={b:[0,1,2].map(bushGeo),f:[0,1,2,3,4].map(flowerGeo),t:[0,1].map(tuftGeo),m:[mushGeo(0)],r:[reedGeo(0)],l:[logGeo(0)]};
function mergeVar(G,geo,x,y,z,rk,sc,sy){const p=geo.attributes.position.array,n=geo.attributes.normal.array,c=geo.attributes.color.array,ix=geo.index.array,o=G.P.length/3,cs=[1,0,-1,0][rk],sn=[0,1,0,-1][rk];
 for(let k=0;k<p.length;k+=3){const px=p[k]*sc,pz=p[k+2]*sc;G.P.push(x+px*cs+pz*sn,y+p[k+1]*sy,z-px*sn+pz*cs);G.N.push(n[k]*cs+n[k+2]*sn,n[k+1],-n[k]*sn+n[k+2]*cs);G.C.push(c[k],c[k+1],c[k+2])}
 for(let k=0;k<ix.length;k++)G.I.push(ix[k]+o)}
const FCOL=['#ffffff','#ffe14a','#ff8fb8','#ff5a5a','#b48cff'].map(rgb),TUFT=rgb('#3f8a38');
function buildProps(cx,cy){const G=newG(),x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,v=ter[i],h=hs(x,y,4),hh=HT[i],al=hh-LAND;
  if(v===0){if(pth[i]||occ.has(i)||stairs.has(i)||hh<LAND)continue;const q=hs(x,y,201);if(q>.07)continue;
   const jx0=(hs(x,y,61)-.5)*.5,jy0=(hs(x,y,62)-.5)*.5,rk0=(hs(x,y,63)*4)|0,wet=ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1;
   if(wet){if(q<.05)mergeVar(G,DEC.r[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,66)*.6);continue}if(FLG[i]&12)continue;
   if(al>=9||FLG[i]&1)continue;
   if(q<.022)mergeVar(G,DEC.f[(hs(x,y,202)*5)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.04)mergeVar(G,DEC.t[(hs(x,y,203)*2)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,67)*.5);
   else if(q<.056)mergeVar(G,DEC.b[(hs(x,y,204)*3)|0],x+.5+jx0*.6,hh,y+.5+jy0*.6,rk0,.9+hs(x,y,68)*.4,.9+hs(x,y,69)*.4);
   else if(q<.062)mergeVar(G,DEC.m[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.066&&fb(x*.03,y*.03,SEED+88)>.5)mergeVar(G,DEC.l[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   continue}
  if(v===1||v===5)continue;
  const jx=(hs(x,y,61)-.5)*.3,jy=(hs(x,y,62)-.5)*.3,rk=(hs(x,y,63)*4)|0,sc=.85+hs(x,y,65)*.3,sy=sc*(.9+hs(x,y,64)*.25);
  if(v===2){let nb=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&gOK(x+dx,y+dy)&&ter[i+dy*TW+dx]===2)nb++;
   if(nb>=3)mergeVar(G,FOR[(h*6)|0],x+.5,hh,y+.5,(hs(x,y,63)*4)|0,1,1);else mergeVar(G,VAR.t[0],x+.5,hh,y+.5,0,1,1)}
  else if(v===3)mergeVar(G,VAR.r[(hs(x,y,6)*6)|0],x+.5+jx,hh,y+.5+jy,rk,sc,sy);
  else mergeVar(G,VAR.g[(hs(x,y,8)*3)|0],x+.5+jx,hh,y+.5+jy,rk,1,1)}
 if(!G.P.length)return null;const m=new THREE.Mesh(toGeo(G),matV);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);return m}
function dropChunk(k){const o=CHK.get(k);if(!o)return;for(const q of[o.m,o.w,o.p])if(q){scene.remove(q);q.geometry.dispose()}CHK.delete(k)}
function loadChunk(cx,cy){const k=keyOf(cx,cy);if(MP.on)for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=cx+i,y=cy+j;if(x>=0&&y>=0&&x<NCX&&y<NCY&&!genF[y*NCX+x])return}for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)genChunk(cx+i,cy+j);const o=buildChunk(cx,cy);o.p=buildProps(cx,cy);CHK.set(k,o)}
function updateChunks(ms){const t0=performance.now(),cx0=(CAM.x/CH)|0,cy0=(CAM.z/CH)|0;
 for(const k of dirtyT){dirtyT.delete(k);const o=CHK.get(k);if(!o)continue;for(const q of[o.m,o.w])if(q){scene.remove(q);q.geometry.dispose()}const n=buildChunk(k%NCX,(k/NCX)|0);o.m=n.m;o.w=n.w}
 for(const k of dirtyP){dirtyP.delete(k);const o=CHK.get(k);if(!o)continue;if(o.p){scene.remove(o.p);o.p.geometry.dispose()}o.p=buildProps(k%NCX,(k/NCX)|0)}
 const need=[];for(let j=-RM;j<=RM;j++)for(let i=-RM;i<=RM;i++){const cx=cx0+i,cy=cy0+j;if(cx<0||cy<0||cx>=NCX||cy>=NCY)continue;if(!CHK.has(keyOf(cx,cy)))need.push([i*i+j*j,cx,cy])}
 need.sort((a,b)=>a[0]-b[0]);for(const[,cx,cy]of need){if(performance.now()-t0>ms)break;loadChunk(cx,cy)}
 for(const[k]of CHK){const cx=k%NCX,cy=(k/NCX)|0;if(Math.abs(cx-cx0)>RM+1||Math.abs(cy-cy0)>RM+1)dropChunk(k)}}
/* ================= FOG OF WAR (shader-level, works on every material) ================= */
const FWC=2,FW=Math.ceil(TW/FWC),FH=Math.ceil(TH/FWC);
const fowVis=new Uint8Array(FW*FH),fowSeen=new Uint8Array(FW*FH),fowTex=new Uint8Array(FW*FH);
const fowT=new THREE.DataTexture(fowTex,FW,FH,THREE.LuminanceFormat,THREE.UnsignedByteType);fowT.minFilter=fowT.magFilter=THREE.LinearFilter;fowT.generateMipmaps=false;fowT.wrapS=fowT.wrapT=THREE.ClampToEdgeWrapping;fowT.unpackAlignment=1;
const FOWU={tFow:{value:fowT},fowP:{value:new THREE.Vector4(1/TW,1/TH,0,0)}};
const LITN=320,litTex=new Uint8Array(LITN*LITN),litT=new THREE.DataTexture(litTex,LITN,LITN,THREE.LuminanceFormat,THREE.UnsignedByteType);litT.minFilter=litT.magFilter=THREE.LinearFilter;litT.generateMipmaps=false;litT.wrapS=litT.wrapT=THREE.ClampToEdgeWrapping;litT.unpackAlignment=1;FOWU.tLit={value:litT};FOWU.litP={value:new THREE.Vector4(0,0,1/LITN,0)};
THREE.Material.prototype.onBeforeCompile=function(sh){
 if(!sh.vertexShader.includes('#include <fog_vertex>')||!sh.fragmentShader.includes('#include <fog_fragment>')||!(sh.vertexShader.includes('#include <begin_vertex>')||sh.vertexShader.includes('vec3 transformed')))return;
 sh.uniforms.tFow=FOWU.tFow;sh.uniforms.fowP=FOWU.fowP;sh.uniforms.tLit=FOWU.tLit;sh.uniforms.litP=FOWU.litP;
 sh.vertexShader='varying vec2 vFow;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n{vec4 fp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfp=instanceMatrix*fp;\n#endif\nfp=modelMatrix*fp;vFow=fp.xz;}');
 sh.fragmentShader='uniform sampler2D tFow;uniform sampler2D tLit;uniform vec4 fowP;uniform vec4 litP;varying vec2 vFow;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\nif(fowP.w>.5){vec2 fq=vFow*fowP.xy;float fv=texture2D(tFow,fq).r;float fk=fv<.5?mix(.0,.4,fv*2.):mix(.4,1.,(fv-.5)*2.);vec3 c=gl_FragColor.rgb;if(fowP.z>.01){vec2 lq=(vFow-litP.xy)*litP.z;float L=(lq.x>0.&&lq.y>0.&&lq.x<1.&&lq.y<1.)?texture2D(tLit,lq).r:0.;c*=mix(1.,.1+.9*L,fowP.z);c=mix(c,c*vec3(1.12,.94,.76),fowP.z*L*.35);}c*=mix(vec3(.62,.7,.88),vec3(1.),smoothstep(.45,.95,fk));gl_FragColor.rgb=mix(vec3(.01,.014,.03),c,fk);}')};
/* the pixel shaders of blocks, units and water used to replace this hook (the 3D fog of war had silently vanished): chain it back in */
const FOWH=THREE.Material.prototype.onBeforeCompile;
{const wrap=f=>{const g=function(sh,r){f.call(this,sh,r);FOWH.call(this,sh,r)},k=f.toString()+'/*fow*/';g.toString=()=>k;return g};matV.onBeforeCompile=wrap(matV.onBeforeCompile);matWater.onBeforeCompile=wrap(matWater.onBeforeCompile);UNITSH=wrap(UNITSH)}
const matT=matV.clone();matT.onBeforeCompile=matV.onBeforeCompile;matT.defines={TERR:''};
const FOWC=cvs(FW,FH),FOWG=FOWC.getContext('2d'),FOWI=FOWG.createImageData(FW,FH),FLUT=new Uint8Array(256);
for(let i=0;i<256;i++)FLUT[i]=Math.round(i<128?238-(i/128)*112:126-((i-128)/127)*126);
for(let i=0;i<FW*FH;i++){FOWI.data[i*4]=6;FOWI.data[i*4+1]=9;FOWI.data[i*4+2]=16}
let fowTm=-9;const fowIdx=(x,y)=>Math.min(FH-1,Math.max(0,(y/TS/FWC)|0))*FW+Math.min(FW-1,Math.max(0,(x/TS/FWC)|0));
const fowVisAt=(x,y)=>fowTex[fowIdx(x,y)]>=190,fowSeenAt=(x,y)=>fowSeen[fowIdx(x,y)]>0;
const fowRA=new Uint8Array(FH),fowLo=new Int16Array(FH).fill(32767),fowHi=new Int16Array(FH).fill(-1);
function fowReset(){fowSeen.fill(0);fowTex.fill(0);fowVis.fill(0);fowTm=-9;fowT.needsUpdate=true;fowRA.fill(8);fowLo.fill(0);fowHi.fill(FW-1)}
function fowStamp(x,y,r){const cx=x/TS/FWC,cy=y/TS/FWC,rr=r/FWC,r2=rr*rr,r3=Math.max(0,rr-1.5)*Math.max(0,rr-1.5),x0=Math.max(0,Math.floor(cx-rr)),x1=Math.min(FW-1,Math.ceil(cx+rr)),y0=Math.max(0,Math.floor(cy-rr)),y1=Math.min(FH-1,Math.ceil(cy+rr));
 for(let j=y0;j<=y1;j++){fowRA[j]=8;if(x0<fowLo[j])fowLo[j]=x0;if(x1>fowHi[j])fowHi[j]=x1;const dy=j+.5-cy,dy2=dy*dy;for(let i=x0;i<=x1;i++){const dx=i+.5-cx,d=dx*dx+dy2;if(d>r2)continue;const k=j*FW+i,v=d<=r3?2:1;if(fowVis[k]<v)fowVis[k]=v}}}
const VRN={cannon:13,peasant:9,knight:11,archer:14,bannerman:11,captain:13,king:14,guard:11},VSN={castle:28,tower:19,barracks:13,gate:8,wall:6,market:9,torch:8,ballista:19,trebuchet:33,forester:9,guild:9};const vsnOf=s=>s.weapon?Math.max(VSN[s.type]||6,VSN[s.weapon]||0):(VSN[s.type]||6);
function fowUpdate(dt){fowTm-=dt;if(fowTm>0)return;fowTm=.2;
 for(const u of units)if(u.t===0&&u.hp>0)fowStamp(u.x,u.y,VRN[u.type]||10);
 for(const s of structs)if(s.t===0)fowStamp(s.x,s.y,s.prog>=1?vsnOf(s):4);
 if(SW.n){const st=Math.max(1,Math.ceil(SW.n/450));for(let i=0;i<SW.n;i+=st)if(SW.hp[i]>0)fowStamp(SW.x[i],SW.y[i],5)}
 for(const u of units)if(u.t===1&&u.hp>0&&u.lane>=0)fowStamp(u.x,u.y,5);
 /* a texel settles at most 6 refreshes after it was last in sight, so a row untouched for 8 refreshes is final */
 const im=FOWI.data;let r0=FH,r1=-1,c0=FW,c1=-1;
 for(let j=0;j<FH;j++){if(!fowRA[j])continue;fowRA[j]--;const lo=fowLo[j],hi=fowHi[j];if(j<r0)r0=j;r1=j;if(lo<c0)c0=lo;if(hi>c1)c1=hi;
  for(let k=j*FW+lo,ke=j*FW+hi;k<=ke;k++){const v=fowVis[k];let c=fowTex[k];if(v){fowVis[k]=0;fowSeen[k]=1;const t=v===2?255:205;c=c<t?Math.min(t,c+70):Math.max(t,c-30)}else{const t=fowSeen[k]?128:0;c=c<t?Math.min(t,c+70):Math.max(t,c-24)}fowTex[k]=c;im[k*4+3]=FLUT[c]}
  if(!fowRA[j]){fowLo[j]=32767;fowHi[j]=-1}}
 if(r1>=0){fowT.needsUpdate=true;FOWG.putImageData(FOWI,0,0,c0,r0,c1-c0+1,r1-r0+1)}}
/* ---- unit models: voxel characters with separate head / both arms / tools (1 voxel = .05 tile) ---- */
let NOWEAP=false;const VX=.05,UM={};let RT=null;
function vb(G,cx,y0,cz,w,h,d,c){let T2=G;if(RT&&G===RT.G){if(cx<=-(RT.lax||3.2)&&y0>=1.8&&y0<13)T2=RT.LA;else if(y0>=RT.hy&&Math.abs(cx)<3.6&&cz>-2.9&&y0<24)T2=RT.HG}bxc(T2,cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c)}
/* ---- Minecraft-style items: 16x16 pixel sprites extruded into cubes, outlined ---- */
const SPAL={b:'#7a5a2a',B:'#5a3f1c',w:'#f2f2f2',i:'#c9ced6',d:'#8a909c',g:'#ffd23c',G:'#fff1a0',h:'#c8962a',S:'#e8edf5',K:'#17171c',r:'#c04040',s:'#8a8a92'};
function sprGrid(){return Array.from({length:16},()=>Array(16).fill('.'))}
function sprLine(g,x0,y0,x1,y1,f){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=f(k,n)}}
function sprOutline(g){const o=g.map(r=>r.slice());for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(g[y][x]==='.')for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a>=0&&a<16&&b>=0&&b<16&&g[b][a]!=='.'){o[y][x]='K';break}}return o.map(r=>r.join(''))}
const SPR={};
function sprites(){if(SPR.pick)return SPR;
 const stick=(g,x0,y0,x1,y1)=>sprLine(g,x0,y0,x1,y1,k=>k%2?'B':'b');
 {const g=sprGrid();stick(g,0,15,10,5);for(let s=-5;s<=5;s++){const c=s*s*.07,x=Math.round(10+s*.707-.707*c),y=Math.round(5+s*.707+.707*c);if(x>=0&&x<16&&y>=0&&y<16){g[y][x]=s<-1?'w':s<3?'i':'d';if(x+1<16&&g[y][x+1]==='.')g[y][x+1]=s<1?'i':'d'}}SPR.pick=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);[[1,9,12],[2,8,13],[3,8,14],[4,8,14],[5,9,13],[6,10,12]].forEach(([y,a,b])=>{for(let x=a;x<=b;x++)g[y][x]=y<=2?'w':y>=5?'d':'i'});for(let y=2;y<=4;y++)g[y][14]='d';SPR.axe=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);for(let y=2;y<=6;y++)for(let x=8;x<=12;x++)if(x-8+ (y-2)>=1&&x-8+(y-2)<=7)g[y][x]=(x+y)%5===0?'d':'i';g[2][11]='w';g[3][12]='w';g[2][12]='w';SPR.hammer=sprOutline(g)}
 const sword=(w,i,d,hl)=>{const g=sprGrid();sprLine(g,3,12,14,1,k=>'i');sprLine(g,4,12,14,2,k=>'d');sprLine(g,3,11,13,1,k=>'w');sprLine(g,1,10,5,14,(k)=>'b');sprLine(g,0,15,3,12,k=>k?'B':'g');g[14][1]='b';g[15][0]='g';return sprOutline(g.map(r=>r.map(c=>c==='i'?i:c==='d'?d:c==='w'?w:c==='b'&&hl?'h':c)))};
 SPR.sword=sword('w','i','d',0);SPR.gsword=sword('G','g','h',1);
 {const g=sprGrid();for(let a=-70;a<=70;a+=5){const r=a*Math.PI/180,x=Math.round(Math.cos(r)*8),y=Math.round(8+Math.sin(r)*7.6);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=a%10?'B':'b'}sprLine(g,3,1,3,15,()=>'S');SPR.bow=sprOutline(g)}
 return SPR}
function vsp(G,rows,x,oy,oz,p,th){for(let r=0;r<16;r++)for(let c=0;c<16;c++){const ch=rows[r][c];if(ch==='.')continue;vb(G,x,oy+(15-r)*p,oz+c*p,th||p*1.1,p,p,SPAL[ch])}}
/* tools in the grip frame (voxel units): origin = centre of the fist, handle along +z, the striking edge faces -y (down at the end of a swing) */
const TOOLG={};const HANDY=-4.5;
function tb(G,x,y,z,w,h,d,c){bxc(G,x*VX,(y-h/2)*VX,z*VX,w*VX,h*VX,d*VX,c)}
function handleG(G,L,wood,wrap){tb(G,0,0,(L-1.6)/2,.62,.62,L+1.6,wood);tb(G,0,0,0,.82,.82,1.8,wrap||'#4a2e16');tb(G,0,0,-1.55,.78,.78,.5,'#2e1c0e');tb(G,0,0,L-.25,.72,.72,.5,lighten(wood,-.2))}
function toolGeos(){if(TOOLG.axe)return TOOLG;const mk=f=>{const G=newG();f(G);return toGeo(G)},WD='#9a6a34',IR='#b9c0cc',ID='#7c8492',IL='#eef2f8';
 TOOLG.axe=mk(G=>{handleG(G,8.6,WD);tb(G,0,-.1,7.5,.7,1.1,1.5,ID);tb(G,0,-1.25,7.55,.42,1.5,1.9,IR);tb(G,0,-2.2,7.6,.4,.7,2.35,IR);tb(G,0,-2.62,7.6,.44,.32,2.5,IL);tb(G,0,.75,7.45,.62,.7,1.1,ID)});
 TOOLG.pick=mk(G=>{handleG(G,8.6,WD);tb(G,0,0,7.7,.85,1.2,1.3,ID);[[.95,7.55],[1.8,7.2],[2.55,6.75],[3.15,6.25]].forEach(([y,z],k)=>{tb(G,0,y,z,.55-.06*k,.8,.95,k===3?IL:IR);tb(G,0,-y,z,.55-.06*k,.8,.95,k===3?IL:IR)})});
 TOOLG.hoe=mk(G=>{handleG(G,9.4,WD);tb(G,0,-.55,9.05,.45,1.3,.5,ID);tb(G,0,-1.55,9.1,1.5,.75,.42,IR);tb(G,0,-1.98,9.1,1.56,.22,.46,IL)});
 TOOLG.hammer=mk(G=>{handleG(G,7.4,WD);tb(G,0,-.6,7.15,1.35,2.5,1.7,ID);tb(G,0,-1.95,7.15,1.45,.35,1.8,IL);tb(G,0,.62,7.15,1.4,.3,1.75,IR);tb(G,0,-.6,7.15,1.42,.3,1.78,'#5a606c')});
 const sword=(bl,bd,gd,gd2)=>mk(G=>{tb(G,0,0,0,.7,.7,2.0,'#4a2e16');tb(G,0,0,-1.45,1.0,1.0,.9,gd);tb(G,0,0,-1.95,.6,.6,.3,gd2);tb(G,0,0,1.25,.9,3.4,.75,gd);tb(G,0,1.85,1.25,.7,.5,.8,gd2);tb(G,0,-1.85,1.25,.7,.5,.8,gd2);
  tb(G,0,0,6.0,.34,1.25,8.6,bl);tb(G,0,0,5.6,.38,.32,7.0,bd);tb(G,0,0,10.6,.3,.8,1.0,bl);tb(G,0,0,11.25,.26,.36,.6,bl)});
 TOOLG.sword=sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');TOOLG.gsword=sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');
 TOOLG.rsword=mk(G=>{const GDc='#d4a234',GD2c='#ecc964',ST='#dfe5ee',SD='#9aa3b2',SL='#f7f9fc';
  tb(G,0,0,-.1,.62,.62,2.5,'#1f2c5c');for(const z of[-.9,-.1,.7])tb(G,0,0,z,.68,.68,.16,GDc);
  tb(G,0,0,-1.75,1.0,1.0,.8,GDc);tb(G,0,0,-2.3,.62,.62,.4,GD2c);tb(G,0,0,-1.75,1.08,.42,.42,'#d8283a');
  tb(G,0,0,1.55,.95,5.4,.8,GDc);for(const s of[1,-1]){tb(G,0,s*2.9,1.75,.85,.7,1.1,GD2c);tb(G,0,s*2.95,2.35,.6,.45,.5,GDc)}tb(G,0,0,1.55,1.02,.9,.9,GD2c);tb(G,0,0,1.55,1.06,.46,.46,'#3a7aff');
  tb(G,0,0,2.4,.5,1.7,.9,GDc);
  tb(G,0,0,6.6,.38,1.6,7.6,ST);tb(G,0,0,11.5,.34,1.25,2.2,ST);tb(G,0,0,13.1,.3,.82,1.0,ST);tb(G,0,0,13.9,.24,.4,.6,SL);
  tb(G,0,0,7.2,.42,.36,8.6,SD);for(const s of[1,-1])tb(G,0,s*.74,7.6,.3,.12,10.2,SL)});
 TOOLG.halberd=mk(G=>{const WD='#5e3f24',WD2='#3b2614',ST='#c9d0dc',SD='#7e8797',SL='#f2f5fa',GDc='#d4a234',GD2c='#ecc964',H=15.6;
  tb(G,0,0,5.0,.56,.56,21.6,WD);for(const z of[-1.9,-1.1,-.3,.5])tb(G,0,0,z,.64,.64,.3,WD2);
  tb(G,0,0,-5.75,.74,.74,.6,GDc);tb(G,0,0,-6.15,.5,.5,.3,GD2c);tb(G,0,0,7.2,.66,.66,.36,GDc);
  for(const s of[-1,1])tb(G,0,s*.32,H-1.9,.3,.1,3.6,SD);tb(G,0,0,H+.1,.84,.84,.9,GDc);tb(G,0,0,H-.5,.72,.72,.3,GD2c);
  tb(G,0,0,H+1.1,.42,1.12,1.2,ST);tb(G,0,0,H+2.4,.38,.9,1.4,ST);tb(G,0,0,H+3.8,.32,.64,1.4,ST);tb(G,0,0,H+5.0,.26,.4,1.0,SL);tb(G,0,0,H+5.75,.2,.2,.5,SL);tb(G,0,0,H+2.8,.46,.16,4.4,SL);
  tb(G,0,-.85,H,.34,1.0,2.3,SD);tb(G,0,-1.75,H,.3,.9,3.5,ST);tb(G,0,-2.55,H,.3,.8,4.3,ST);tb(G,0,-3.15,H,.3,.5,4.8,ST);tb(G,0,-3.48,H,.24,.24,4.6,SL);
  tb(G,0,-3.36,H-2.55,.26,.42,.5,ST);tb(G,0,-3.36,H+2.55,.26,.42,.5,ST);tb(G,0,-1.95,H,.38,.62,.62,GDc);tb(G,0,-1.95,H,.42,.28,.28,'#c42a36');
  tb(G,0,.85,H+.1,.3,1.0,.7,SD);tb(G,0,1.7,H-.1,.26,.8,.55,ST);tb(G,0,2.35,H-.4,.22,.6,.45,ST);tb(G,0,2.8,H-.75,.18,.4,.4,SL);
  tb(G,0,0,H-2.6,1.0,1.0,.16,GDc);tb(G,0,0,H-3.1,.96,.96,.8,'#a3202a');tb(G,0,0,H-3.8,.8,.8,.7,'#86161f');tb(G,0,0,H-4.35,.6,.6,.45,'#6a1018')});
 /* bow: grip in the fist, limbs along z, bent toward the archer (+y), string on the archer side */
 TOOLG.bow=mk(G=>{tb(G,0,0,0,.8,.95,1.5,'#4a2e16');for(let k=0;k<6;k++){const z=1.05+k*1.08,y=.07*k*k;[1,-1].forEach(sg=>tb(G,0,y,sg*z,.55-.04*k,.75,1.2,k===5?'#5a3a1a':'#8a5a2a'))}[1,-1].forEach(sg=>tb(G,0,2.6,sg*6.75,.5,.5,.5,'#d9b13a'));
  tb(G,0,2.72,0,.14,.14,13.5,'#efe9d6')});
 return TOOLG}
const vx=(k,cx,y0,cz,w,h,d,c)=>bxc(RT.X[k],cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c);

function fin(P,m){const parts=(P.parts||[]).map(p=>({...p,geo:toGeo(P.X[p.k])}));const t=g=>toGeo(g);const r={torso:t(P.G),head:t(P.HG),leg:t(P.LG),arm:t(P.AG),armL:P.LA.P.length?t(P.LA):null,hip:m.hip*VX,sh:m.sh*VX,neck:m.neck*VX,lx:m.lx*VX,ax:m.ax*VX,h:m.h*VX,sc:m.sc||1.35};
 r.head.translate(0,-r.neck,0);if(r.armL)r.armL.translate(r.ax,-r.sh,0);r.parts=parts;return r}
function mkModel(type,z){if(z>=20){const sv=THEME.c;THEME.c=z-20;try{return mkModel0(type,0)}finally{THEME.c=sv}}return mkModel0(type,z)}


/* ================= Minecraft-style characters: 8x8x8 head, 8x12x4 torso, 4x12x4 limbs (1 px = .46 voxel) ================= */
const MP_=.46,mp=n=>n*MP_;
function mcFace(G,skin,o){o=o||{};const e1=o.eye||'#ffffff',e2=o.pupil||'#3a3a9a',y=12.55;
 vb(G,-.9,y,1.86,.95,.5,.12,e1);vb(G,.9,y,1.86,.95,.5,.12,e1);vb(G,-.62,y,1.9,.5,.5,.12,e2);vb(G,.62,y,1.9,.5,.5,.12,e2);
 vb(G,0,12.0,1.88,.5,.5,.12,lighten(skin,-.12>0?0:0));vb(G,0,11.35,1.86,1.2,.28,.12,o.mouth||'#7a4a3a')}
function mcHead(G,skin,hair,o){o=o||{};vb(G,0,11,0,3.7,3.7,3.7,skin);
 if(hair){vb(G,0,14.05,0,3.85,.7,3.85,hair);vb(G,0,12.9,-1.75,3.85,1.9,.4,hair);vb(G,-1.8,13,0,.4,1.4,3.8,hair);vb(G,1.8,13,0,.4,1.4,3.8,hair);vb(G,0,13.6,1.8,3.85,.55,.3,hair)}
 mcFace(G,skin,o)}
function mcLimbs(G,LG,AG,c){/* legs */
 vb(LG,0,-5.5,0,1.84,5.5,1.84,c.pants);vb(LG,0,-5.5,0,1.9,1.1,2.0,c.shoes||'#4a4a52');
 /* right arm (AG) and left arm (in G, routed to LA) */
 const ax=2.76;vb(AG,0,-5.5,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(AG,0,-5.5,0,1.9,2.6,1.9,c.hand);vb(AG,0,-2.8,0,1.95,.3,1.95,lighten(c.sleeve,-.0));
 vb(G,-ax,5.0,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(G,-ax,5.0,0,1.9,2.6,1.9,c.hand);vb(G,-ax,7.7,0,1.95,.3,1.95,lighten(c.sleeve,-.0))}
function mcTorso(G,c){vb(G,0,5.5,0,3.7,5.5,1.84,c.shirt);vb(G,0,5.5,0,3.78,.5,1.9,c.belt||darkenC(c.shirt));if(c.chest)vb(G,0,7.6,.95,2.4,2.6,.1,c.chest)}
const darkenC=c=>lighten(c,-.0)&&(()=>{const h=hex(c);return '#'+h.map(v=>Math.round(v*.7).toString(16).padStart(2,'0')).join('')})();

let ALB=0,ALF=null;const alv=()=>ALF!=null?ALF:(RS2.done.plate?1:0)+(RS2.done.mail?1:0);
const HA={st:'#a9b0be',st2:'#878e9d',st3:'#666c7a',sth:'#cfd5df',ml:'#7f8591',ml2:'#61666f',br:'#c39a45',br2:'#e2c06a',gd:'#d4a234',gd2:'#ecc964',gdd:'#9a6e1e',lt:'#6b4423',lt2:'#4a2e16',lt3:'#8a5a32',em:'#f4ecd8',hx:'#62e4ff',dk:'#141218'};
function hkPut(Gx,m){return(x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(Gx,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}}}
function humanKit(type,AL,P){
 const{G,HG,LA,LG,AG}=P,t=hkPut(G,0),tm=hkPut(G,4),tc=hkPut(G,7),tg=hkPut(G,5),hd=hkPut(HG,0),hm=hkPut(HG,4),hc=hkPut(HG,7),hg=hkPut(HG,5),k=hkPut(LG,0),km=hkPut(LG,4),
  A=(m,dx,y,z,w,h,d,c)=>{hkPut(AG,m)(dx,y,z,w,h,d,c);hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c)},AE=(m,dx,y,z,w,h,d,c)=>hkPut(AG,m)(dx,y,z,w,h,d,c),AW=(m,dx,y,z,w,h,d,c)=>hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c),
  L=(m,x,y,z,w,h,d,c)=>hkPut(LA,m)(x,y,z,w,h,d,c),P1=thp(),P2=ths(),PD=thd(),skin='#c68a5e';
 if(type==='peasant'){
  const pv=ZVAR&&ZVAR.hint==='p'?ZVAR.v%6:0,psh=['#8a5a32','#6e7a3e','#7c4a42','#55667a','#8a7a52','#6a4a6a'][pv],psk=['#c68a5e','#d8a07a','#a8704a','#c88a62','#b67e56','#dca888'][pv],phr=['#5a3a1a','#2a1a10','#8a6a3a','#1e1a18','#a0522d','#6a6a62'][pv],phat=[0,2,0,1,3,0][pv];
  mcTorso(G,{shirt:psh,belt:'#5a3a1a'});mcLimbs(G,LG,AG,{pants:['#5a4a30','#4a4038','#5e5240','#3e3a36','#5a4a30','#4e4234'][pv],sleeve:psh,hand:psk,shoes:'#3a2a18'});mcHead(G,psk,phr);
  A(7,0,-3.0,0,1.98,.36,1.98,'#9a6a3c');k(0,-5.5,.06,1.96,1.6,2.06,'#3a2a18');k(0,-4.0,.06,2.02,.24,2.1,'#5a3f24');
  if(AL>=1){t(0,5.95,0,3.92,4.3,2.04,'#a88a5a');for(let i=0;i<4;i++)t(0,6.5+i*.95,1.03,3.3,.13,.04,'#7a6038');t(0,6.3,1.03,.13,3.7,.04,'#7a6038');t(0,6.3,-1.03,.13,3.7,.04,'#7a6038')}
  tc(0,5.6,1.06,2.5,3.3,.08,'#e2d3a8');tc(0,8.9,1.06,1.6,.9,.08,'#e2d3a8');tc(-.7,9.8,1.06,.16,1.2,.06,'#c9b78a');tc(.7,9.8,1.06,.16,1.2,.06,'#c9b78a');tc(0,6.6,1.11,1.2,.9,.05,'#cdbd90');
  t(0,5.8,0,3.96,.32,2.16,'#c9a86a');t(.9,5.3,1.08,.18,.6,.1,'#c9a86a');t(-1.35,5.62,1.06,.7,.78,.34,HA.lt);tm(-1.35,6.15,1.24,.22,.18,.04,HA.br);
  t(0,10.35,0,2.6,.62,2.08,'#7a4e2c');
  if(AL>=2){A(0,.1,-1.05,0,2.14,1.05,2.14,HA.lt);A(4,.1,-1.1,0,2.18,.14,2.18,HA.br);A(0,0,-4.5,0,2.0,1.3,2.0,HA.lt);A(4,0,-3.32,0,2.06,.12,2.06,HA.br)}
  if(phat===0){hc(0,14.3,0,5.6,.4,5.6,'#e0c060');hc(0,14.7,0,3.9,.9,3.9,'#f0d878');hc(0,14.62,0,4.0,.32,4.0,'#8a4a2a');hc(0,15.6,0,2.6,.2,2.6,'#e8cc68')}
  else if(phat===1){hc(0,14.05,0,4.0,.95,4.0,'#6a5038');hc(0,14.05,0,4.06,.25,4.06,'#4e3a28');hc(0,15.0,-.4,2.6,.35,2.8,'#6a5038')}
  else if(phat===2){hc(0,13.9,-.1,4.04,1.0,4.0,'#d8cbaa');hc(0,11.6,-1.98,4.04,2.4,.16,'#d8cbaa');hc(1.98,12.1,-.4,.16,1.9,3.0,'#d8cbaa');hc(-1.98,12.1,-.4,.16,1.9,3.0,'#d8cbaa');hc(0,13.85,1.98,4.06,.22,.16,'#b8a984')}
  t(0,6.2,-1.55,2.8,2.8,1.0,'#7a5a2a');t(0,6.8,-2.15,2.2,.6,.3,'#9a7a3a');t(0,8.9,-1.55,2.9,.3,1.06,'#5a3f1c');return{h:15.6}}
 if(type==='gunner'||type==='gunner2'){const CO=P1,COD=PD,LT2=HA.lt2,BRS=HA.br;
  mcTorso(G,{shirt:CO,belt:LT2});mcLimbs(G,LG,AG,{pants:'#3e3a36',sleeve:CO,hand:skin,shoes:'#2a2420'});mcHead(G,skin,'#3a2410');
  t(0,4.5,0,3.94,1.05,2.0,CO);t(0,4.5,0,3.98,.22,2.04,COD);tc(0,5.0,1.0,2.6,4.6,.1,'#6a4a2a');tc(0,5.0,1.0,2.7,.2,.12,'#4a321c');
  for(let i=0;i<7;i++)t(-1.5+i*.5,6.0+i*.68,1.05,.62,.46,.08,LT2);for(const[x,y]of[[-1.0,6.6],[0,7.95],[1.0,9.3]]){tm(x,y,1.13,.44,.56,.2,BRS);tm(x,y+.56,1.13,.2,.16,.14,'#7a5a2a')}
  t(0,5.5,0,3.98,.42,2.08,LT2);tm(0,5.47,1.06,.52,.52,.06,BRS);t(0,10.3,0,2.7,.6,2.06,COD);
  A(0,0,-5.5,0,2.0,1.75,2.0,'#4a3424');A(0,0,-3.85,0,2.07,.32,2.07,'#5e4430');A(7,0,-1.2,0,2.02,.3,2.02,COD);
  k(0,-5.5,.08,2.0,2.5,2.12,'#2a2420');k(0,-3.1,.08,2.08,.32,2.2,'#3a3028');k(0,-1.0,.06,1.94,.3,1.96,COD);
  hc(0,14.35,0,4.7,.34,4.7,'#2e2a2c');hc(0,14.69,0,3.92,.78,3.92,CO);hc(0,14.62,0,4.02,.24,4.02,BRS);hc(1.55,15.0,-.7,.3,1.7,.3,'#f2efe6');hc(1.55,16.5,-1.05,.3,.9,.3,'#e0dccf');hc(1.55,17.2,-1.5,.26,.6,.26,'#cfcabc');
  hd(-.9,11.55,1.88,1.0,.38,.06,'#6a5a4e');hd(.8,12.0,1.88,.6,.3,.06,'#6a5a4e');
  if(type==='gunner2'){AE(0,0,-4.65,1.6,.3,.3,7.4,'#8a6a3a');AE(0,0,-4.85,5.5,.68,.68,1.0,'#4a3a2a');AE(0,0,-4.75,-2.3,.4,.4,.4,'#5a4428')}
  return{h:15.6}}
 if(type==='archer'){const HO='#2f6e35',HOD='#22552a';
  mcTorso(G,{shirt:'#3f9a45',belt:HA.lt});mcLimbs(G,LG,AG,{pants:'#6a5a3a',sleeve:'#3f9a45',hand:skin,shoes:'#3a2a18'});mcHead(G,skin,'#6a3a18');
  t(0,5.5,0,3.86,4.25,1.98,HA.lt3);for(let i=0;i<4;i++){t(-.22,6.25+i*.85,1.0,.34,.1,.04,HA.lt2);t(.22,6.25+i*.85,1.0,.34,.1,.04,HA.lt2)}t(0,6.05,1.0,.1,3.4,.04,HA.lt2);
  tc(0,9.45,0,4.12,1.55,2.26,HO);tc(0,9.3,0,4.16,.2,2.3,HOD);tc(0,6.4,-1.1,3.5,3.1,.14,HO);tc(0,6.4,-1.12,3.56,.2,.16,HOD);
  for(let i=0;i<6;i++)t(-1.55+i*.62,5.9+i*.86,1.04,.66,.52,.1,HA.lt2);
  t(.9,6.0,-1.55,1.4,4.0,1.2,HA.lt);tm(.9,6.4,-1.55,1.48,.2,1.28,HA.br);tm(.9,9.1,-1.55,1.48,.2,1.28,HA.br);
  for(const[x,z,c]of[[.6,-1.3,'#f2f2f2'],[1.1,-1.65,'#e04a3a'],[.82,-1.8,'#f2f2f2'],[1.28,-1.3,'#e04a3a']]){t(x,9.9,z,.08,.6,.08,'#c8a070');tc(x,10.3,z,.24,.62,.24,c)}
  t(0,5.5,0,3.98,.45,2.1,HA.lt2);tm(0,5.47,1.06,.5,.5,.06,AL>=2?HA.gd:HA.br);t(1.3,5.6,1.06,.72,.72,.32,HA.lt);t(-1.35,5.6,1.06,.56,.6,.32,HA.lt);
  AW(0,0,-4.65,0,2.02,1.55,2.02,HA.lt);AW(4,0,-3.2,0,2.08,.14,2.08,HA.br);AE(0,0,-5.5,0,1.98,1.05,1.98,HA.lt2);
  k(0,-5.5,.08,1.98,2.1,2.12,HA.lt2);k(0,-3.55,.08,2.08,.32,2.22,HA.lt);
  hc(0,14.05,-.05,3.98,.9,3.96,HO);hc(1.93,11.0,-.05,.14,3.4,3.9,HO);hc(-1.93,11.0,-.05,.14,3.4,3.9,HO);hc(0,11.0,-1.96,3.98,3.95,.14,HO);hc(0,14.5,-1.45,1.7,.75,1.35,HO);hc(0,15.0,-1.9,.9,.5,.8,HO);hc(0,13.68,1.9,3.98,.44,.18,HOD);hc(1.93,11.0,1.7,.16,2.9,.5,HOD);hc(-1.93,11.0,1.7,.16,2.9,.5,HOD);
  if(AL>=1){for(const[x,y]of[[-1.3,6.6],[1.3,6.6],[-1.3,7.7],[1.3,7.7],[-1.3,8.7],[1.3,8.7]])tm(x,y,1.0,.24,.24,.06,'#d8c890');
   A(0,.12,-.95,0,2.22,1.2,2.22,HA.lt);A(4,.12,-1.0,0,2.28,.16,2.28,HA.br);for(const z of[-.6,0,.6])A(4,.12,-.4,z,.2,.2,2.26,'#d8c890');AE(0,0,-4.65,0,2.02,1.55,2.02,HA.lt)}
  if(AL>=2){A(0,0,-2.75,0,1.96,1.3,1.96,HA.ml);A(4,0,-4.55,0,2.08,1.25,2.08,HA.st3);A(4,0,-3.3,0,2.14,.14,2.14,HA.gd);tm(0,10.45,0,2.9,.55,2.34,HA.st2);
   hc(0,13.66,1.93,4.02,.14,.16,HA.gd);tm(0,5.4,1.1,.7,.7,.06,HA.gd);tg(0,5.55,1.14,.4,.4,.04,HA.hx)}
  return{h:15.6}}
 /* King Naraige: royal blue enamel plate with gilded edges, ermine collar, crowned great helm */
 if(type==='king'){const AR=thp(),ARD=thd(),ARL=lighten(AR,.18),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,RED='#9e1b26',ERM='#f3efe6',ERS='#141418',STL='#c3cad6',STL2='#e2e6ee',STD='#5a6272',DK='#0b0a0e';
  mcTorso(G,{shirt:ARD,belt:GDD});mcLimbs(G,LG,AG,{pants:ARD,sleeve:ARD,hand:STL,shoes:STD,bare:false});
  tm(0,6.25,0,4.18,4.5,2.42,AR);tm(0,6.35,0,.62,4.3,2.52,ARL);tm(0,10.42,0,4.24,.42,2.52,GD);tm(0,6.15,0,4.26,.36,2.54,GD);for(const s of[-1,1])tm(s*2.04,6.35,0,.22,4.1,2.52,GD);
  tm(0,7.45,1.25,1.8,1.8,.12,GD);tm(0,7.8,1.32,1.1,1.1,.08,GD2);tg(0,8.1,1.37,.5,.5,.06,'#ff3b3b');
  for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?1.18:1.36,s=k%2?.28:.36;tm(Math.sin(a)*r,8.35+Math.cos(a)*r-s/2,1.26,s,s,.1,k%2?GD2:GD)}
  tm(0,5.3,0,4.32,.62,2.58,GD);tm(0,5.2,1.3,1.1,.82,.12,GD2);tg(0,5.42,1.37,.44,.38,.06,'#3a7aff');
  for(const s of[-1,1]){tm(s*1.1,3.5,1.02,1.78,1.85,.44,AR);tm(s*1.1,3.45,1.03,1.84,.26,.5,GD);tm(s*1.1,4.45,1.05,1.82,.16,.48,GDD)}
  tc(0,1.6,1.2,1.25,3.75,.14,RED);tc(0,1.55,1.22,1.35,.24,.16,GD);for(const s of[-1,1])tc(s*.66,1.6,1.22,.12,3.75,.16,GD);tm(0,3.25,1.29,.55,.55,.06,GD2);
  tc(0,10.45,0,4.3,1.1,3.05,ERM);for(const x of[-1.6,-.5,.55,1.6])tc(x,10.72,1.53,.24,.42,.08,ERS);for(const x of[-1.1,0,1.1])tc(x,10.72,-1.53,.24,.42,.08,ERS);for(const s of[-1,1])tc(s*2.15,10.72,.35*s,.08,.42,.24,ERS);
  tm(0,10.2,1.55,1.0,.6,.1,GD);tg(0,10.32,1.61,.36,.36,.05,'#ff3b3b');
  A(4,.42,-.2,0,3.3,1.3,3.1,AR);A(4,.42,-.3,0,3.36,.24,3.16,GD);A(4,.42,1.06,0,2.3,.22,2.3,GD2);
  A(4,.48,-1.1,0,3.08,.88,2.9,AR);A(4,.48,-1.18,0,3.14,.2,2.96,GD);A(4,.54,-1.88,0,2.78,.72,2.6,ARD);A(4,.54,-1.95,0,2.84,.18,2.66,GD);
  A(4,0,-4.15,0,2.1,1.42,2.1,AR);A(4,0,-2.85,0,2.16,.24,2.16,GD);A(4,0,-4.22,0,2.16,.2,2.16,GD);A(4,0,-5.62,0,2.18,1.44,2.18,STL);A(4,0,-5.66,0,2.22,.3,2.22,STD);
  km(0,-2.55,0,2.04,2.45,2.04,AR);km(0,-3.3,.6,1.6,1.1,1.02,GD);km(0,-3.05,1.12,.62,.6,.08,GD2);km(0,-5.2,.03,2.08,2.05,2.08,AR);km(0,-3.18,0,2.12,.16,2.12,GDD);
  k(0,-5.62,.3,2.12,.66,2.52,STD);km(0,-5.6,1.5,1.5,.46,.12,GD);
  hm(0,10.55,0,3.3,.7,3.1,STD);hm(0,10.9,0,4.22,4.08,4.22,STL);hc(0,14.98,0,3.9,.78,3.9,RED);hc(0,15.76,0,2.9,.32,2.9,RED);hm(0,10.84,0,4.3,.32,4.3,GD);
  hm(0,11.0,2.09,3.86,3.85,.14,STL2);hd(0,12.76,2.18,3.24,.36,.06,DK);hd(0,11.3,2.18,.38,1.46,.06,DK);for(const x of[-1.25,-.85,.85,1.25])for(const y of[11.45,11.95])hd(x,y,2.18,.2,.2,.05,DK);
  hm(0,13.12,2.2,3.42,.18,.06,GD);hm(0,12.56,2.2,3.42,.18,.06,GD);hm(0,13.3,2.22,.36,1.68,.08,GD);
  for(const s of[-1,1]){hm(s*2.13,11.25,-.15,.1,2.9,3.2,AR);hm(s*2.18,12.15,.25,.1,1.0,1.0,GD);hm(s*2.22,12.4,.25,.08,.5,.5,GD2)}
  hc(0,11.4,-2.2,3.3,2.9,.16,RED);hc(0,11.3,-2.24,3.4,.22,.18,GD);
  hm(0,14.3,0,4.52,.8,4.52,GD);hm(0,14.24,0,4.58,.18,4.58,GDD);hm(0,15.02,0,4.58,.14,4.58,GD2);
  hg(0,14.45,2.29,.58,.5,.07,'#ff2f3f');for(const s of[-1,1])hg(s*1.22,14.52,2.29,.34,.34,.06,'#3a7aff');for(const s of[-1,1])hg(s*2.29,14.48,0,.07,.44,.44,'#2fd07a');hg(0,14.45,-2.29,.5,.46,.07,'#ff2f3f');
  const fl=(x,z,al)=>{hm(x,15.1,z,.52,1.2,.52,GD);hm(x+(al?0:.44),15.42,z+(al?.44:0),.36,.46,.36,GD);hm(x-(al?0:.44),15.42,z-(al?.44:0),.36,.46,.36,GD);hm(x,16.28,z,.36,.46,.36,GD2);hg(x,16.72,z,.26,.26,.26,'#fff3d6')};
  fl(0,2.14,0);fl(0,-2.14,0);fl(2.14,0,1);fl(-2.14,0,1);hm(0,16.06,0,.44,.38,3.7,GD);hm(0,16.06,0,3.7,.38,.44,GD);for(const s of[-1,1]){hm(0,15.3,s*1.75,.44,.8,.44,GD);hm(s*1.75,15.3,0,.44,.8,.44,GD)}hm(0,16.44,0,.8,.72,.8,GD2);hm(0,17.16,0,.28,.62,.28,GD);hg(0,17.78,0,.22,.22,.22,'#fff3d6');for(const[x,z]of[[1.98,1.98],[-1.98,1.98],[1.98,-1.98],[-1.98,-1.98]]){hm(x,15.1,z,.38,.78,.38,GD);hg(x,15.88,z,.3,.3,.3,'#f6f0e2')}
  return{h:23}}
 /* royal guard: blue plate, crimson tabard with the royal sun, plumed great helm */
 if(type==='guard'){const AR=thp(),ARD=thd(),ARL=lighten(AR,.16),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,RED='#9e1b26',STL='#c3cad6',STD='#5a6272',DK=HA.dk;
  mcTorso(G,{shirt:ARD,belt:GDD});mcLimbs(G,LG,AG,{pants:ARD,sleeve:ARD,hand:STL,shoes:STD,bare:false});
  tm(0,6.3,0,4.12,4.4,2.36,AR);tm(0,10.36,0,4.18,.4,2.46,GD);tm(0,6.2,0,4.2,.32,2.44,GD);for(const s of[-1,1])tm(s*2.0,6.4,0,.2,4.0,2.44,GD);
  tc(0,1.9,1.22,2.5,8.05,.12,RED);for(const s of[-1,1])tc(s*1.2,1.9,1.25,.14,8.05,.14,GD);tc(0,1.85,1.25,2.6,.24,.14,GD);
  tc(0,6.9,1.3,1.4,1.4,.06,GD);tc(0,7.2,1.34,.8,.8,.05,GD2);for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?.92:1.06,s=k%2?.22:.3;tc(Math.sin(a)*r,7.6+Math.cos(a)*r-s/2,1.31,s,s,.06,GD)}
  tm(0,5.3,0,4.26,.55,2.62,GDD);tm(0,5.25,1.32,.8,.65,.08,GD);
  A(4,.36,-.25,0,3.0,1.15,2.8,AR);A(4,.36,-.33,0,3.06,.22,2.86,GD);A(4,.42,-1.05,0,2.7,.75,2.5,ARD);A(4,.42,-1.12,0,2.76,.18,2.56,GD);
  A(4,0,-4.1,0,2.06,1.35,2.06,AR);A(4,0,-2.85,0,2.12,.22,2.12,GD);A(4,0,-5.6,0,2.14,1.4,2.14,STL);
  km(0,-2.5,0,2.0,2.4,2.0,AR);km(0,-3.2,.58,1.5,1.0,.95,GD);km(0,-5.2,.03,2.04,2.0,2.04,AR);k(0,-5.6,.28,2.08,.62,2.42,STD);
  hm(0,10.55,0,3.2,.65,3.0,STD);hm(0,10.92,0,4.12,4.06,4.12,AR);hm(0,14.98,0,3.7,.4,3.7,AR);hm(0,10.86,0,4.2,.3,4.2,GD);hm(0,13.0,0,4.2,.3,4.2,GD);hm(0,11.0,0,.42,3.98,4.2,ARL);
  for(const s of[-1,1])hd(s*.95,12.36,2.08,1.38,.36,.1,DK);hd(0,11.2,2.08,.42,1.52,.1,DK);hm(0,12.74,2.11,3.1,.14,.08,GD);
  hm(0,13.35,2.1,.5,.7,.1,GD);hm(0,14.05,2.1,.3,.3,.1,GD2);for(const s of[-1,1])hm(s*2.08,12.2,.2,.08,.6,.6,GD);
  hm(0,15.32,0,.5,.42,3.5,GD);hd(0,10.6,-1.55,3.6,.9,1.0,ARD);
  return{h:21}}
 /* knight / captain / bannerman */
 const cap=type==='captain',ban=type==='bannerman',pl=cap?HA.gd:HA.st,plh=cap?HA.gd2:HA.sth,pld=cap?HA.gdd:HA.st2,tr=cap?HA.sth:(AL>=2?HA.gd:HA.br);
 mcTorso(G,{shirt:P1,belt:P2});mcLimbs(G,LG,AG,{pants:'#55555e',sleeve:HA.ml,hand:skin,shoes:'#3a3a42',bare:false});mcHead(G,skin,ban?'#4a2e16':null);
 t(0,5.5,0,3.86,5.5,1.98,HA.ml);A(0,0,-5.4,0,1.9,5.4,1.9,HA.ml);k(0,-5.4,0,1.9,5.3,1.9,HA.ml2);
 const b0=ban?7.7:6.9;tm(0,b0,0,3.62,10.65-b0,2.12,pl);tm(0,b0+.2,0,.5,10.4-b0,2.26,plh);tm(0,10.45,0,3.1,.62,2.36,pld);
 if(!ban)for(const s of[-1,1])tm(s*1.55,7.4,0,.5,2.4,2.18,pld);
 tc(0,5.0,1.1,2.2,4.3,.14,P1);tc(0,5.0,-1.1,2.2,4.3,.14,PD);tc(-1.08,5.0,1.12,.12,4.3,.16,tr);tc(1.08,5.0,1.12,.12,4.3,.16,tr);tc(0,5.0,1.12,2.24,.16,.16,tr);
 tc(0,6.05,1.19,.42,2.6,.04,HA.em);tc(0,7.6,1.19,1.45,.42,.04,HA.em);
 t(0,5.82,0,3.98,.5,2.4,HA.lt2);tm(0,5.76,1.2,.62,.62,.06,tr);
 const pw=ban?2.3:2.55,ph=ban?1.5:1.85;
 A(4,.18,.6-ph,0,pw,ph,pw,pl);A(4,.18,.6,0,pw-.5,.3,pw-.3,plh);A(4,.32,.1-ph,0,pw-.2,.5,pw-.15,pld);A(4,.18,.52-ph,0,pw+.06,.16,pw+.08,tr);
 if(!ban){A(4,0,-2.65,0,1.98,1.0,1.98,pld);A(4,.62,-3.25,-.1,.8,.8,1.3,pl)}
 A(ban?0:4,0,-5.5,0,2.04,2.0,2.04,ban?HA.lt:pl);A(4,0,-3.62,0,2.18,.28,2.18,tr);A(4,0,-5.5,0,2.1,.5,2.1,ban?HA.lt2:pld);
 if(!ban){km(0,-2.3,.02,1.98,2.1,1.98,pl);km(0,-1.55,.55,1.94,1.5,.98,pld);km(0,-1.62,1.02,1.96,.14,.1,tr)}
 km(0,-3.05,.62,1.3,.8,.9,plh);km(0,-5.0,0,1.98,2.0,1.98,ban?HA.st2:pl);km(0,-5.5,.15,2.02,.56,2.26,pld);
 if(!ban){hm(0,10.95,0,4.0,3.95,4.0,pl);hm(0,13.15,0,4.14,.4,4.14,tr);hm(0,11.0,0,.42,3.9,4.12,plh);hd(-.9,12.45,2.06,1.31,.34,.12,HA.dk);hd(.9,12.45,2.06,1.31,.34,.12,HA.dk);
  for(const[x,y]of[[.75,11.6],[1.15,11.6],[.75,11.95],[1.15,11.95]])hd(x,y,2.06,.17,.17,.12,HA.dk);hm(0,14.9,0,3.4,.3,3.4,pld);hm(0,15.2,0,.5,.32,3.0,plh);hd(0,10.62,-1.55,3.6,.9,1.0,HA.ml)}
 else{hd(0,13.95,0,3.98,.85,3.98,HA.ml);hd(1.93,11.0,0,.14,3.8,3.98,HA.ml);hd(-1.93,11.0,0,.14,3.8,3.98,HA.ml);hd(0,11.0,-1.93,3.98,3.8,.14,HA.ml);
  hm(0,14.3,0,5.0,.28,5.0,pl);hm(0,14.58,0,3.7,.75,3.7,pl);hm(0,15.33,0,2.5,.25,2.5,plh);hm(0,14.58,0,3.8,.2,3.8,tr)}
 if(AL>=1){A(4,.3,.25,0,pw-.25,.5,pw-.1,plh);A(4,-.5,.55,0,.3,.85,pw-.3,pl);tm(0,6.15,0,3.3,.75,2.22,pld);
  if(!ban){hm(0,15.2,0,.36,.8,3.2,tr);km(.75,-3.15,.4,.3,.75,.95,pl);km(-.75,-3.15,.4,.3,.75,.95,pl)}else hm(0,15.58,0,.4,.3,.4,tr)}
 if(AL>=2){tm(0,9.25,1.19,1.0,1.0,.08,HA.gd);tg(0,9.45,1.24,.6,.6,.04,HA.hx);A(4,1.0,-.25,0,.3,1.35,1.5,HA.gd);A(4,0,-5.5,0,2.14,.5,2.14,HA.gd);
  if(type==='knight'){hc(0,15.95,-.3,.42,.55,2.8,P1);hc(0,15.5,-1.75,.42,.9,.6,P1);hc(0,15.2,-2.05,.42,.9,.5,P2)}
  if(ban){hm(0,14.3,0,5.06,.1,5.06,HA.gd);tg(0,14.65,1.86,.4,.4,.06,HA.hx)}}
 return null}
function mcModel(type,z){
 const G=newG(),HG=newG(),LA=newG(),LG=newG(),AG=newG(),P0={G,HG,LA,hy:11,lax:2.2};RT=P0;let sc=1.35,h=15.6,parts=null,X=null;
 const skin='#c68a5e',hair='#3a2410';
 if(type==='zombie'||type==='husk'||type==='runner'||type==='brute'||type==='bomber'||type==='acid'||type==='miner'){
  sc={zombie:1.35,husk:1.0,runner:1.2,brute:2.15,bomber:1.5,acid:1.3,miner:1.35}[type];if(type==='brute')h=18;zombieKit(type,ZVAR,{G,HG,LA,LG,AG});
 }else if(type==='peasant'||type==='archer'||type==='gunner'||type==='gunner2'){humanKit(type,ALB,{G,HG,LA,LG,AG})}
 else{const cap=type==='captain';humanKit(type,ALB,{G,HG,LA,LG,AG});
  if(cap){h=19;P0.X={cape:newG(),plume:newG()};vb(G,0,14.5,0,1.4,.6,3.6,'#d03030');
   vx('cape',0,-9,-.4,4.2,9,.5,thp());vx('cape',0,-9.4,-.4,4.4,.8,.7,'#e6b83a');vx('plume',0,0,0,1.2,1.1,1.4,'#d03030');vx('plume',0,1.0,-1.1,1.0,1.4,2.4,'#e04040');vx('plume',0,1.0,-3.4,.9,1.2,2.4,'#ff6a5a');vx('plume',0,.2,-5.4,.7,1.0,2.2,'#ff8a7a');
   parts=[{k:'cape',x:0,y:10.8*VX,z:-1.2*VX},{k:'plume',x:0,y:15.2*VX,z:-.6*VX}]}
  if(type==='bannerman'){h=40;const B=bannerKit(G);P0.X=B.X;parts=B.parts}
  if(type==='king'){h=23;sc=1.72;P0.X={cape:newG(),cape2:newG()};const L1=5.0,L2=5.3,RED='#9e1b26',REDD='#6c111b',REDL='#b8283a',ERM='#f3efe6',ERS='#141418',GD=HA.gd,GD2=HA.gd2;
   vx('cape',0,-L1,-.42,5.6,L1,.5,RED);for(const x of[-1.95,-.65,.65,1.95]){vx('cape',x,-L1,-.69,.3,L1-.9,.06,REDD);vx('cape',x+.3,-L1,-.69,.18,L1-.9,.05,REDL)}
   for(const s of[-1,1]){vx('cape',s*2.62,-L1,-.42,.36,L1,.56,ERM);for(let y=-1.3;y>-L1;y-=1.25)vx('cape',s*2.62,y,-.72,.16,.3,.05,ERS)}
   vx('cape',0,-.95,-.42,6.0,.95,.66,ERM);for(const x of[-2.3,-1.15,0,1.15,2.3])vx('cape',x,-.62,-.77,.22,.3,.05,ERS);
   vx('cape',0,-4.35,-.72,1.7,1.7,.08,GD);vx('cape',0,-4.0,-.77,1.0,1.0,.06,GD2);for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?1.15:1.32,s=k%2?.26:.34;vx('cape',Math.sin(a)*r,-3.5+Math.cos(a)*r-s/2,-.73,s,s,.06,k%2?GD2:GD)}
   vx('cape2',0,-L2,-.42,6.6,L2,.5,RED);for(const x of[-2.3,-.78,.78,2.3]){vx('cape2',x,-L2+.5,-.69,.32,L2-.5,.06,REDD);vx('cape2',x+.32,-L2+.5,-.69,.2,L2-.5,.05,REDL)}
   for(const s of[-1,1]){vx('cape2',s*3.12,-L2,-.42,.36,L2,.56,ERM);for(let y=-.6;y>-L2;y-=1.25)vx('cape2',s*3.12,y,-.72,.16,.3,.05,ERS)}
   vx('cape2',0,-L2-.32,-.42,6.7,.5,.62,GD);vx('cape2',0,-L2+.3,-.42,6.66,.14,.6,GD2);
   parts=[{k:'cape',x:0,y:10.75*VX,z:-1.32*VX},{k:'cape2',par:'cape',x:0,y:-L1*VX,z:0}]}
  if(type==='guard'){h=21;sc=1.5;P0.X={cape:newG(),plume:newG()};const L=7.6,W=4.5,RED='#9e1b26',REDD='#6c111b';
   vx('cape',0,-L,-.4,W,L,.5,RED);for(const x of[-1.4,0,1.4])vx('cape',x,-L+.3,-.66,.26,L-1.2,.05,REDD);vx('cape',0,-L-.3,-.4,W+.1,.45,.6,HA.gd);vx('cape',0,-.7,-.4,W+.2,.7,.62,thd());
   vx('plume',0,0,0,.5,.9,1.2,RED);vx('plume',0,.3,-1.0,.48,1.1,1.6,RED);vx('plume',0,.1,-2.4,.46,1.0,1.6,REDD);vx('plume',0,-.4,-3.6,.42,.9,1.2,REDD);
   parts=[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}

 }
 const T=toolGeos(),r=fin({G,HG,LA,LG,AG,parts:parts,X:P0.X},{hip:5.5,sh:10.4,neck:11,lx:.95,ax:2.76,h,sc});r.tools=type==='peasant'?T:null;r.weap=NOWEAP||MVAR==='cine'?null:type==='knight'?'sword':type==='captain'?'gsword':type==='king'?'rsword':type==='guard'?'halberd':type==='archer'?'bow':null;r.shield=(type==='knight'||type==='captain'||type==='guard')&&MVAR!=='cine'?shieldGeo(type,ALB):null;r.shp=[.2*VX,-5.0*VX,2.1*VX];RT=null;return r}

function mkModel0(type,z){return mcModel(type,z)}
/* ================= v73: medieval undead — decomposition, half-skeletons, skeletons ================= */
let ZVAR=null;
const ZNV={zombie:24,husk:12,runner:12,brute:8,bomber:6,acid:6,miner:6};
const ZSK={livid:['#8a9078','#666c58','#a6ac92'],putrid:['#6e7e4c','#4e5a34','#8a9a62'],grave:['#7c8070','#5a5e50','#9a9e8c'],bruise:['#74626e','#544650','#907e8a'],
 waxy:['#aea88e','#868068','#c8c2a6'],rot:['#5e5236','#40381f','#7a6c48'],drown:['#6e8488','#4e6266','#8aa2a6'],dried:['#7c6040','#58422a','#9a7c56'],ash:['#8e8a80','#6a665e','#aaa69c'],moss:['#5f7a46','#435832','#7a9660']};
const ZBN=[['#e0d6b8','#bcb092','#8a7e62'],['#d2c6a2','#ada07e','#7e7256'],['#c8bc98','#a49674','#766a4e']];
const ZCL={linen:'#bdae8c',linen2:'#a89a78',wool:'#6a4e32',dkwool:'#4a3622',green:'#56603e',red:'#72352a',woad:'#46566a',grey:'#68645a',black:'#2e2a26',ochre:'#84662e',burlap:'#96805a'};
const ZTUN=['wool','dkwool','green','red','woad','grey','linen2','ochre','burlap','black'],ZHOSE=['wool','dkwool','green','woad','grey','linen2','black'];
const ZEYE=['#ff3a2a','#ff3a2a','#ff6a20','#ffb02a','#9affd8','#c8f0ff','#7aff6a'];
const MPIV={T:12,H:24,AR:0,AL:0,L:12};
const MUTX={brute:{T:[1.32,1.06,1.38,0,-.2],H:[.84,.84,.86,-2.6,1.7],AR:[1.8,1.42,1.8,0,0],AL:[1.12,1.05,1.12,0,0],L:[1.28,1,1.3,0,0]},
 runner:{T:[.84,1.04,.86,0,0],H:[.9,.92,1,-.4,.9],AR:[.8,1.28,.8,0,0],AL:[.8,1.28,.8,0,0],L:[.84,1,.86,0,0]},
 bomber:{T:[1.42,.98,1.8,0,.5],H:[.78,.8,.8,-1.6,.6],AR:[1.1,.78,1.1,0,0],AL:[1.1,.78,1.1,0,0],L:[1.34,1,1.34,0,0]},
 acid:{T:[1,1,1.15,0,0],H:[.95,.95,.95,-2.4,2],AR:[.95,1.14,.95,0,0],AL:[.95,1.14,.95,0,0],L:[.95,1,.95,0,0]},
 miner:{T:[1.16,1,1.25,0,0],H:[.95,.95,.95,-1.2,1],AR:[1.15,1.05,1.15,0,0],AL:[1.2,1,1.2,0,0],L:[1.15,1,1.15,0,0]}};
function zRand(seed){let s=((seed|0)*2654435761>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
/* hint = former type of a converted unit (knight, archer, peasant...) */
function zSpec(kind,v,hint){const r=zRand(v*7919+({zombie:1,husk:2,runner:3,brute:4}[kind]||5)*104729+(hint?hint.length*977:0)),pick=a=>a[(r()*a.length)|0];
 const decay=kind==='husk'?pick(['dried','dried','mummy','dried']):kind==='runner'?pick(['bones','skel','skel','rot']):kind==='brute'?pick(['rot','rot','bones']):pick(['rot','rot','rot','rot','bones','bones','bones','skel','skel','skel']);
 const S={kind,v,decay,sk:ZSK[kind==='husk'?pick(['dried','rot','ash','dried']):pick(['livid','putrid','grave','bruise','waxy','rot','drown','ash','moss'])],bn:pick(ZBN),
  tun:ZCL[pick(ZTUN)],tun2:ZCL[pick(['red','woad','green','ochre','black'])],hose:ZCL[pick(ZHOSE)],eye:pick(ZEYE),shoes:pick(['leather','leather','wrap','bare']),legwrap:r()<.35,
  hairc:pick(['#2a1a10','#4a3a2a','#6a6a62','#1a1a1a','#6a4a24','#8a8a80']),hair:pick(['none','patchy','stringy','long','none']),arrows:r()<.3?1+(r()<.3?1:0):0,
  armL:r()<.5,armR:r()<.5,legB:r()<.4,cheek:r()<.5?(r()<.5?-1:1):0,skullPatch:r()<.45,jawOff:r()<.3,crack:r()<.5,slvL:r()<.5,slvR:r()<.5,patches:3+((r()*5)|0),seed:(r()*1e9)|0};
 S.outfit=kind==='husk'?(decay==='mummy'?'shroud':pick(['shroud','rags','monk','bare','rags'])):kind==='brute'?pick(['bare','rags','soldier','gambeson','bare']):kind==='runner'?pick(['rags','bare','tunic','peasant','rags']):
  pick(['tunic','peasant','soldier','gambeson','monk','noble','rags','shroud','bare','tunic','soldier','peasant']);
 const o=S.outfit;S.head=o==='soldier'?pick(['kettle','nasal','coif','nasal','none']):o==='monk'?'hood':o==='peasant'?pick(['straw','lcoif','none','none']):o==='noble'?pick(['circlet','none','hood']):o==='tunic'?pick(['lcoif','none','hood','none']):o==='shroud'&&decay!=='mummy'?pick(['shroud','none']):'none';
 if(hint==='knight'||hint==='captain'||hint==='bannerman'||hint==='king'||hint==='guard'){S.outfit='soldier';S.tun2=thp();S.head=pick(['nasal','kettle','coif'])}
 else if(hint==='archer'){S.outfit='hooded';S.tun=ZCL.green;S.head='ghood'}
 else if(hint==='peasant'){S.outfit=pick(['peasant','tunic']);S.head=pick(['straw','lcoif','none'])}
 if(kind==='brute'){S.decay='rot';S.outfit=pick(['bare','bare','rags']);S.head='none';S.sk=ZSK[pick(['bruise','putrid','bruise','moss'])];S.arrows=0;S.eye=pick(['#ff3a2a','#ff6a20'])}
 if(kind==='bomber'){S.decay='rot';S.outfit='bare';S.head='none';S.legwrap=false;S.hair='none';S.sk=ZSK[pick(['putrid','bruise','livid','moss'])];S.arrows=0;S.eye=pick(['#ffb02a','#ff6a20'])}
 else if(kind==='acid'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['bare','bare','rags']);S.head='none';S.hair=pick(['none','patchy']);S.sk=['#8c9a3c','#6a7a28','#aab858'];S.eye='#c8ff40';S.arrows=0}
 else if(kind==='miner'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['peasant','tunic','rags']);S.head='mhelm';S.sk=ZSK[pick(['grave','ash','livid','rot'])];S.eye=pick(['#ff3a2a','#ffb02a'])}
 return S}
/* E(region,x0,y0,z0,x1,y1,z1,colour,mat,skin) — px boxes; regions: T torso (abs), H head (abs), AL/AR arm (local: x +outer, y -12..0 from shoulder, z front), L leg (local: x +outer, y 0..12) */
function zBuild(S,E){const LD=!!S.lod,r=zRand(S.seed^1540483477),[SK,SKD,SKL]=S.sk,[BN,BN2,BND]=S.bn,FL='#5e1a12',DK='#120a06',RU='#7a4a2a',o=S.outfit,dc=S.decay,WR='#cbbd98',WR2='#a99c7a';
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
 if(S.kind==='miner'){const LE='#5a4630',LE2='#463624',IRL='#9a9ca2',OR='#ffd23c',ST='#8a8a92';
  b('H',-4.1,28.6,-3.0,4.1,31.4,5.0,LE);b('H',-4.8,28.4,-3.7,4.8,29.0,5.8,LE2);b('H',-4.12,29.4,-3.02,4.12,29.9,5.02,'#3a2a1a');b('H',-1.2,29.0,4.9,1.2,31.0,5.7,'#5e5e5a',4);b('H',-.85,29.3,5.6,.85,30.7,6.0,'#ffe890',5);
  for(const[x,y,c,s]of[[-2.6,20,ST,1.4],[1.8,22.4,OR,1.0],[-.4,16.8,ST,1.2],[3.0,17.4,OR,.8],[-3.6,23.2,ST,1.0],[.6,19.6,'#6a6a72',.9]])b('T',x-s,y-s,-3.5,x+s,y+s,-2.4,c,c===OR?4:0);
  b('T',-3.6,12.4,2.5,3.6,20.4,2.8,'#6a4a2a');b('T',-4.66,14.4,-2.56,4.66,15.2,2.56,'#2e2014');
  b('AR',-2.3,-13,-2.3,2.3,-6,2.3,'#5a4632');b('AR',-1.7,-17,-1.7,1.7,-12,1.7,BN);b('AR',-1.3,-21,-1.3,1.3,-16.8,1.3,BN2);b('AR',-1.3,-23.6,-8.6,1.3,-20.8,9.4,BN);b('AR',-1,-23.2,9.2,1,-21.2,11.6,BN2);b('AR',-1,-23.2,-10.6,1,-21.2,-8.4,BN2);b('AR',-.6,-22.9,11.4,.6,-21.5,12.6,'#e8e2d0');b('AR',-.6,-22.9,-11.6,.6,-21.5,-10.4,'#e8e2d0');b('AL',-2.3,-12,-2.3,2.3,-6,2.3,'#5a4632');
  b('T',-3.8,19,-6.8,3.8,27.4,-2.5,'#6a5434');b('T',-3.0,26.8,-6.2,3.0,27.9,-3.0,'#4e3c24');b('T',-2.2,21.2,-6.9,-.6,22.8,-6.7,OR,4);b('T',.8,23.4,-6.9,2.6,25.0,-6.7,OR,4);b('T',-.4,24.8,-6.9,1.2,26.2,-6.7,'#8a8a92');
  for(const x of[-1.45,0,1.45])b('AL',x-.55,-16.6,-.9,x+.55,-11.4,.9,BN2)}}
/* unit models (Minecraft-style groups; 1 px = .46 vb) */
function zombieKit(type,ZV,P){const{G,HG,LA,LG,AG}=P,k=.46,S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null);
/* fixed tiny epsilon (bxc's counter-based one could swallow sub-pixel details such as eyes) */
 const put=(Gx,m,yo,x0,y0,z0,x1,y1,z1,c)=>{const o=BMAT;BMAT=m;try{const e=.00012,q=k*VX;addBox(Gx,x0*q-e,(yo+y0*k)*VX-e,z0*q-e,x1*q+e,(yo+y1*k)*VX+e,z1*q+e,rgb(c))}finally{BMAT=o}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m)=>{
  if(R==='T')put(G,m,5.5-12*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='H')put(HG,m,11-24*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AR')put(AG,m,0,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AL')put(LA,m,10.45,-2.76/k-x1,y0,z0,-2.76/k-x0,y1,z1,c);
  else if(R==='L')put(LG,m,-5.5,x0,y0,z0,x1,y1,z1,c)});
 return S}
/* swarm geometry: same generator, swarm pixel units (SWPX), parts for the vertex animation, glow + skin flags; tiny details dropped */
function swGeoV(S){S.lod=1;const P=[],N=[],C=[],I=[],A=[],GL=[],SKA=[],u=SWPX;
 const box=(x0,y0,z0,x1,y1,z1,c,part,gl,sk)=>{const G=newG();addBox(G,x0*u,y0*u,z0*u,x1*u,y1*u,z1*u,rgb(c));const o=P.length/3;for(const v of G.P)P.push(v);for(const v of G.N)N.push(v);for(const v of G.C)C.push(v);for(const ix of G.I)I.push(ix+o);for(let q=0;q<G.P.length/3;q++){A.push(part);GL.push(gl);SKA.push(sk)}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m,sk)=>{const gl=m===5?1:0;if(!gl&&Math.max(x1-x0,y1-y0,z1-z0)<(R==='H'?.75:1.05))return;
  if(R==='T'||R==='H')box(x0,y0,z0,x1,y1,z1,c,0,gl,sk);
  else if(R==='AR')box(6+x0,24+y0,z0,6+x1,24+y1,z1,c,2,gl,sk);
  else if(R==='AL')box(-6-x1,24+y0,z0,-6-x0,24+y1,z1,c,1,gl,sk);
  else if(R==='L'){box(-2-x1,y0,z0,-2-x0,y1,z1,c,3,gl,sk);box(2+x0,y0,z0,2+x1,y1,z1,c,4,gl,sk)}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 g.setAttribute('aPart',new THREE.Float32BufferAttribute(A,1));g.setAttribute('aGl',new THREE.Float32BufferAttribute(GL,1));g.setAttribute('aSk',new THREE.Float32BufferAttribute(SKA,1));g.setIndex(I);return g}
const SWV=[];for(let v=0;v<16;v++)SWV.push(v<10?['zombie',100+v]:v<13?['husk',100+v]:['runner',100+v]);
const swVar=sd=>((sd>>3)^(sd>>9))&15;
const zKeyOf=u=>{const n=ZNV[u.type];if(!n||u.t!==1)return null;const h=(u.uid*2654435761)>>>0;return u.zk&&u.zk!=='zombie'?{v:h%6,hint:u.zk}:{v:h%n,hint:null}};

/* ================= v70: heater shields on their own mesh, heraldic banner, title army ================= */
let MVAR='';
const HER={
 chev:[
  ".....#.....",
  "....###....",
  "...##.##...",
  "..##...##..",
  ".##.....##.",
  "##.......##"],
 crown:[
  "#...#...#",
  "##.###.##",
  "#########",
  "#r#b#r#b#",
  "#########"],
 fleur:[
  ".........#.........",
  ".........#.........",
  "........###........",
  "........###........",
  ".......#####.......",
  ".......#####.......",
  ".####..#####..####.",
  ".#####.#####.#####.",
  "#######.###.#######",
  "###..##.###.##..###",
  ".#....##.#.##....#.",
  ".#....##.#.##....#.",
  ".......#.#.#.......",
  "....###########....",
  "....###########....",
  "......##.#.##......",
  ".....##..#..##.....",
  ".....#...#...#....."]};
/* pixel emblem -> boxes (horizontal runs merged); put(m,x,y0,z,w,h,d,c) with x = centre, y0 = bottom */
function embPut(rows,put,cx,ytop,z,px,d,col,keep){const W=rows[0].length;
 for(let r=0;r<rows.length;r++){const row=rows[r];let x=0;while(x<W){const ch=row[x];if(ch==='.'){x++;continue}let e=x;while(e+1<W&&row[e+1]===ch)e++;
  const n=e-x+1,mx=cx+(x+n/2-W/2)*px,y=ytop-(r+1)*px;if(!keep||keep(mx,y,n*px)){const q=col[ch]||col['#'];put(q[0],mx,y,z,n*px,px,d,q[1])}x=e+1}}}
/* heater shield, face toward +z, origin = strap point; kind knight|captain, AL armour level */
function shieldGeo(kind,AL){const G=newG(),put=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(G,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}};
 if(kind==='guard'){const F=thp(),FL=lighten(F,.12),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,W=4.9,Y0=-6.2,Y1=3.3,H=Y1-Y0,cy=-1.0;
  put(0,0,Y0,-.08,W,H,.34,'#5c4126');put(4,0,Y0-.1,.12,W+.2,H+.2,.18,GDD);put(0,0,Y0+.35,.24,W-.7,H-.7,.16,F);put(0,0,Y0+.9,.33,W-1.8,H-1.8,.06,FL);
  put(4,0,Y1-.38,.3,W,.38,.14,GD);put(4,0,Y0,.3,W,.38,.14,GD);for(const s of[-1,1])put(4,s*(W/2-.19),Y0,.3,.38,H,.14,GD);put(4,0,Y1-.05,.3,1.6,.42,.14,GD);put(4,0,Y1+.3,.3,.7,.3,.14,GD2);
  put(4,0,Y0+.6,.38,.3,H-1.2,.06,GDD);put(4,0,cy-.75,.42,1.5,1.5,.1,GD);put(4,0,cy-.45,.48,.9,.9,.08,GD2);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;put(4,Math.sin(a)*1.35,cy+Math.cos(a)*1.35-.2,.42,.38,.4,.08,k%2?GDD:GD)}
  for(const[x,y]of[[-1.85,2.3],[1.85,2.3],[-1.85,-5.4],[1.85,-5.4]])put(4,x,y,.42,.42,.42,.1,GD2);return toGeo(G)}
 const cap=kind==='captain',W=cap?5.0:4.7,TOP=3.0,STR=cap?2.3:2.5,H=STR+W*.866,F=thp(),FD=thd(),FL=lighten(F,.1),
  gold=cap||AL>=2,RIM=gold?HA.gd:AL>=1?HA.sth:HA.st2,RIMD=gold?HA.gdd:HA.st3,EM=gold?HA.gd2:HA.em,
  hw=dy=>dy<=STR?W/2:Math.max(0,Math.sqrt(W*W-(dy-STR)*(dy-STR))-W/2);
 const rows=[[0,STR]];for(let a=STR;a<H-.04;){const s=Math.min(.3,H-a);rows.push([a,a+s]);a+=s}
 for(const[a,b]of rows){const w=hw(b>STR?(a+b)/2:a)*2,y0=TOP-b,h=b-a;if(w<.3)continue;
  put(0,0,y0,-.05,w,h,.32,FD);
  if(w>1.3)put(0,0,y0,.16,w-1.0,h,.14,F);
  if(w>2.7)put(0,0,y0,.25,w-2.5,h,.06,FL);
  put(0,0,y0,-.24,Math.max(.2,w-.5),h,.07,'#5c4126');
  put(4,-(w/2-.17),y0,.05,.36,h,.52,RIM);put(4,w/2-.17,y0,.05,.36,h,.52,RIM)}
 put(4,0,TOP-.36,.05,W,.38,.54,RIM);put(4,0,TOP-.06,.05,W-.4,.07,.56,RIMD);put(4,0,TOP-H-.05,.05,.4,.3,.5,RIM);
 /* enarmes on the back */
 put(0,-.85,-1.9,-.36,.32,2.8,.14,HA.lt2);put(0,.85,-1.9,-.36,.32,2.8,.14,HA.lt2);put(0,0,-.55,-.4,2.1,.34,.18,HA.lt);put(0,0,-1.75,-.4,2.1,.34,.18,HA.lt);
 const inside=(mx,y,w)=>Math.abs(mx)+w/2<=hw(TOP-y)-.3&&Math.abs(mx)+w/2<=hw(TOP-y-.3)-.3;
 if(cap){embPut(HER.crown,put,0,1.35,.33,.38,.1,{'#':[4,HA.gd2],'r':[5,'#ff5a4a'],'b':[5,HA.hx]},inside);put(4,0,-.95,.31,.34,.34,.08,HA.gd)}
 else{embPut(HER.chev,put,0,.95,.32,.28,.1,{'#':[gold?4:0,EM]},inside);if(AL>=2)put(5,0,-1.15,.34,.46,.46,.1,HA.hx);else put(4,0,-1.1,.31,.36,.36,.08,RIM)}
 if(AL>=1||cap)for(const dy of[.55,1.5,STR+.45,STR+1.35,STR+2.2]){const x=hw(dy+.1)-.17;if(x>.35){put(4,-x,TOP-dy-.09,.34,.17,.17,.06,HA.sth);put(4,x,TOP-dy-.09,.34,.17,.17,.06,HA.sth)}}
 return toGeo(G)}
/* the shield follows the forearm but stays upright; s = brace amount (0 rest .. 1 shield forward) */
function shdPose(d,s){if(!d.shd)return;d.shd.rotation.x=-d.armL.rotation.x+.03;d.shd.rotation.y=-.14+.1*s;d.shd.position.z=d.mdl.shp[2]+.03*s}
/* standard bearer: pole with gold ferrules, crossbar, spear finial; three chained cloth strips (ripple), fleur-de-lis, swallowtail with fringe, forked streamer */
function bannerKit(G){const X={ban:newG(),ban2:newG(),ban3:newG(),pen:newG(),tip:newG(),cape:newG()},F=thp(),FD=thd(),S2=ths(),WD='#6b4423',WD2='#8a5a2a',
  g=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{vb(G,x,y,z,w,h,d,c)}finally{BMAT=o}},
  q=(k,m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(X[k],x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}};
 const Z=-3.0,ZC=-3.95,ZB=-3.42,TB=31.6,BW=11.2,SH=5.6,TH=.5;
 g(2,0,2,Z,.8,34.4,.8,WD);for(const y of[12.2,21.4,28.8])g(4,0,y,Z,1.02,.42,1.02,HA.gd);
 g(2,0,TB,ZB,12.4,.7,.7,WD2);for(const s of[-1,1]){g(4,s*6.55,TB-.17,ZB,1.0,1.04,1.0,HA.gd);g(4,s*6.55,TB+.87,ZB,.46,.46,.46,HA.gd2)}
 g(4,0,36.3,Z,1.3,1.1,1.3,HA.gd);g(4,0,37.35,Z,.8,.5,.8,HA.gd2);g(4,0,37.85,Z,1.1,1.2,.42,HA.sth);g(4,0,39.0,Z,.72,1.1,.36,HA.sth);g(4,0,40.05,Z,.36,.9,.3,'#ffffff');
 g(0,0,9,-2.3,.8,.8,1.2,WD2);
 const LIM=[0,-SH,-2*SH,-99],KEYS=['ban','ban2','ban3'];
 const cb=(m,x,y0,w,h,c,d)=>{const a=y0,b=y0+h;for(let i=0;i<3;i++){const lo=Math.max(a,LIM[i+1]),hi=Math.min(b,LIM[i]);if(hi-lo>1e-4)q(KEYS[i],m,x,lo+SH*i,0,w,hi-lo,d||TH,c)}};
 cb(7,0,-12.6,BW,12.6,F);
 for(let k=0;k<10;k++){const y=-12.6-(k+1)*.4,nw=(k+1)*.33,sw=BW/2-nw;cb(7,-(nw+sw/2),y,sw,.4,F);cb(7,nw+sw/2,y,sw,.4,F)}
 for(const s of[-1,1]){cb(7,s*(BW/2-.36),-16.6,.72,16.6,S2,TH+.05);cb(4,s*(BW/2-.95),-15.3,.16,14.1,HA.gd2,TH+.07)}
 cb(4,0,-1.05,BW+.24,1.05,HA.gd,TH+.12);cb(7,0,-1.32,BW,.27,FD,TH+.07);cb(4,0,-12.0,BW-1.9,.24,HA.gd2,TH+.07);
 embPut(HER.fleur,(m,x,y,z,w,h,d,c)=>cb(m,x,y,w,h,c,d),0,-2.0,0,.44,TH+.14,{'#':[4,HA.gd2]});
 for(const s of[-1,1])for(let x=3.75;x<=5.45;x+=.56)cb(4,s*x,-17.25,.24,.65,HA.gd2,.3);
 q('pen',7,.6,-2.4,0,1.2,2.4,.24,F);q('pen',7,1.8,-2.15,0,1.2,1.9,.24,F);q('pen',7,3.0,-1.9,0,1.2,1.4,.24,F);q('pen',7,1.8,-1.32,0,3.6,.24,.28,S2);q('pen',4,.12,-2.5,0,.24,2.6,.3,HA.gd);
 q('tip',7,.6,-1.65,0,1.2,.9,.24,F);q('tip',7,1.6,-1.45,0,.8,.5,.24,F);q('tip',7,.6,-1.32,0,1.2,.24,.28,S2);
 q('cape',7,0,-.7,-.3,4.2,.7,.5,F);for(const s of[-1,1]){q('cape',7,s*1.4,-8,-.3,1.4,7.3,.5,F);q('cape',7,s*1.42,-8.2,-.3,1.5,.7,.7,S2)}
 return{X,parts:[{k:'ban',x:0,y:TB*VX,z:ZC*VX},{k:'ban2',par:'ban',x:0,y:-SH*VX,z:0},{k:'ban3',par:'ban2',x:0,y:-SH*VX,z:0},{k:'pen',x:.4*VX,y:36.1*VX,z:Z*VX},{k:'tip',par:'pen',x:3.6*VX,y:0,z:0},{k:'cape',x:0,y:10.6*VX,z:-1.3*VX}]}}
/* poses for the title army (applied after animUnit) */
function titlePose(u,d){if(!u.pose||u.atk>0||!d.armL)return;const s=Math.sin(TT*1.1+u.ph0);
 if(u.pose==='guard'){d.armL.rotation.x=-.66+s*.02;d.armL.rotation.z=.14;d.arm.rotation.x=-.45+s*.03;d.arm.rotation.z=-.08;if(d.weap)d.weap.rotation.x=-.62;shdPose(d,.7)}
 else if(u.pose==='shoulder'){d.arm.rotation.x=-1.0+s*.03;d.arm.rotation.z=-.28;if(d.weap)d.weap.rotation.x=-1.38;shdPose(d,0)}
 else{d.arm.rotation.x=-.15+s*.02;if(d.weap)d.weap.rotation.x=1.52;shdPose(d,0)}
 d.body.rotation.z=s*.01}
/* ---- instanced rear ranks of the title army (static posed soldiers, gentle sway) ---- */
let TRES=null;
function reserveDispose(){if(!TRES)return;for(const im of TRES.ims){TS3.remove(im);im.geometry.dispose()}TRES=null}
function mergePosed2(parts){const P=[],N=[],C=[],Mt=[],I=[];let off=0;
 for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array,ma=g.attributes.mat?g.attributes.mat.array:null,nv=p.length/3;
  for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}for(let i=0;i<nv;i++)Mt.push(ma?ma[i]:0);const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=nv;g.dispose()}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setAttribute('mat',new THREE.Float32BufferAttribute(Mt,1));r.setIndex(I);return r}
let PIKEG=null;
function pikeGeo(){if(PIKEG)return PIKEG;const G=newG(),t=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{tb(G,x,y,z,w,h,d,c)}finally{BMAT=o}};
 t(2,0,8.5,0,.44,33,.44,'#6b4423');t(0,0,0,0,.6,1.6,.6,'#4a2e16');t(4,0,25.3,0,.62,.9,.62,HA.st3);t(4,0,27.1,0,.78,2.8,.3,HA.sth);t(4,0,29.0,0,.4,1.1,.24,'#ffffff');t(4,0,24.6,0,1.6,.28,.36,HA.st2);
 PIKEG=toGeo(G);return PIKEG}
function soldierGeo(kind){const ty=kind==='pike'?'knight':kind,ab=ALB;ALB=2;let mdl;try{mdl=mkModel(ty,0)}finally{ALB=ab}
 const o=new THREE.Object3D(),M=(x,y,z,rx,ry,rz)=>{o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.updateMatrix();return o.matrix.clone()};
 const Q={knight:{ar:-1.0,arz:-.28,wr:-1.38,al:-.3,alz:0},pike:{ar:-.62,arz:-.05,wr:0,al:-.3,alz:0},archer:{ar:-.45,arz:0,wr:0,al:-1.28,alz:0}}[kind];
 const P=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,0,.05)],[mdl.leg,M(-mdl.lx,mdl.hip,0)],[mdl.leg,M(mdl.lx,mdl.hip,0)]];
 const A=M(mdl.ax,mdl.sh,0,Q.ar,0,Q.arz);P.push([mdl.arm,A]);const T2=toolGeos();
 if(kind==='knight')P.push([T2.sword,A.clone().multiply(M(0,HANDY*VX,.15*VX,Q.wr))]);
 if(kind==='pike'){const h=new THREE.Vector3(0,HANDY*VX,.15*VX).applyMatrix4(A);P.push([pikeGeo(),M(h.x,h.y,h.z)])}
 if(mdl.armL){const B=M(-mdl.ax,mdl.sh,0,Q.al,0,Q.alz);P.push([mdl.armL,B]);
  if(kind==='archer')P.push([T2.bow,B.clone().multiply(M(0,HANDY*VX,.1*VX))]);
  else if(mdl.shield)P.push([mdl.shield,B.clone().multiply(M(mdl.shp[0],mdl.shp[1],mdl.shp[2],-Q.al+.03,-.14))])}
 const g=mergePosed2(P);g.computeBoundingSphere();
 for(const q of[mdl.torso,mdl.head,mdl.leg,mdl.arm,mdl.armL,mdl.shield])if(q)q.dispose();return g}
function buildReserve(L){reserveDispose();const R=Math.random;TRES={ims:[],arr:[],arch:[]};
 for(const k in L){if(!L[k].length)continue;const g=soldierGeo(k),im=new THREE.InstancedMesh(g,matUI,L[k].length);im.frustumCulled=false;TS3.add(im);TRES.ims.push(im);
  L[k].forEach(([x,z],i)=>{TRES.arr.push({im,i,x,z,ry:Math.PI+(R()-.5)*.16,sc:1.35*TZ*(.96+R()*.08),ph:R()*6.28});if(k==='archer')TRES.arch.push({x:x*TS,y:z*TS,atk:0})})}
 resSway(0)}
function resSway(t){if(!TRES)return;for(const o of TRES.arr){const s=Math.sin(t*1.1+o.ph);_tm.position.set(o.x,0,o.z);_tm.rotation.set(0,o.ry+s*.02,s*.01);_tm.scale.set(o.sc,o.sc*(1+Math.abs(s)*.006),o.sc);_tm.updateMatrix();o.im.setMatrixAt(o.i,_tm.matrix)}
 for(const im of TRES.ims)im.instanceMatrix.needsUpdate=true}
/* the army: battalions of knights in front (2 animated ranks + an instanced third), archer companies behind, pike blocks in reserve, banners over every unit */
function buildArmy(){titleDispose();reserveDispose();const R=Math.random,J=a=>(R()-.5)*a,L={knight:[],archer:[],pike:[]};
 const mk=(type,x,z,face,pose)=>{const u=mkU(0,type,x*TS,z*TS);u.face=face===undefined?Math.PI:face;u.fa=u.face;u.dy=0;u.hp=1;u.ph0=Math.random()*9;u.ttl=1;u.pose=pose||null;ALF=2;let g;try{g=mkUnit(u)}finally{ALF=null}unitG.delete(u);g.scale.multiplyScalar(TZ);g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')o.visible=false});TS3.add(g);TARMY.push(u);return u};
 TCAP=null;
 for(const[cx,files]of[[-19.5,12],[0,15],[19.5,12]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.12+(r%2?.56:0)+J(.16),dx=(x-cx)/(files*.56),z=-5.25+r*1.08+dx*dx*.55+J(.14);
   if(r<2){const u=mk('knight',x,z,Math.PI+J(.1),r===0?'guard':R()<.5?'shoulder':'rest');if(r===0)u.front=1}else L.knight.push([x,z])}
  if(cx)mk('bannerman',cx+J(.6),-1.95+J(.15),Math.PI+J(.06))}
 for(const s of[-1,1])for(let r=0;r<3;r++)for(let f=0;f<7;f++)L.knight.push([s*(30.2+f*1.12+(r%2?.56:0))+J(.16),-5.0+r*1.08+J(.14)]);
 for(const[cx,files]of[[-25.5,9],[-9,11],[9,11],[25.5,9]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.1+(r%2?.55:0)+J(.18),z=-.45+r*1.05+J(.16);if(Math.abs(x-2.8)<2.4&&z>1.4)continue;
   if(r<2)mk('archer',x,z,Math.PI+J(.14));else L.archer.push([x,z])}
  mk('bannerman',cx+J(.6),2.75+J(.15),Math.PI+J(.06))}
 for(const[x0,x1]of[[-31.5,-7.6],[9.6,31.5]])for(let r=0;r<4;r++)for(let x=x0+(r%2?.56:0);x<=x1;x+=1.12)L.pike.push([x+J(.2),4.0+r*1.1+J(.18)]);
 /* King Naraige behind the centre with his royal guard */
 mk('king',0,-1.7,Math.PI);mk('guard',-.66,-1.12,Math.PI);mk('guard',.66,-1.12,Math.PI);for(const sd of[-1,1])mk('bannerman',sd*2.0,-1.8,Math.PI+J(.04));
 MVAR='cine';try{TCAP=mk('captain',-12,-7.6,Math.PI/2)}finally{MVAR=''}
 buildReserve(L)}

/* Minecraft-skin shading for characters: per-skin-pixel noise in model space (no world grid lines) */
const GLTOON=`
 {vec3 alb=max(diffuseColor.rgb,vec3(.004));vec3 irr=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/alb;float li=dot(irr,vec3(.299,.587,.114));float r=li/max(uLMax,.05);
  float bd=.42+.3*smoothstep(.24,.36,r)+.28*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);vec3 tnt=mix(vec3(.66,.76,1.08),vec3(1.06,1.,.9),smoothstep(.36,.7,r));
  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;reflectedLight.indirectDiffuse=vec3(0.);}
`;
const GLUMAT=`
 {if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.);float gl=smoothstep(.62,.9,dot(normal,normalize(vec3(-.35,.8,.5))));
  reflectedLight.directDiffuse=reflectedLight.directDiffuse*(.88+.16*gl)+diffuseColor.rgb*(fr*.42+gl*.26)*uLMax+vec3(1.,.95,.86)*fr*.08*uLMax;}
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse*=.35;totalEmissiveRadiance+=diffuseColor.rgb*1.3;}}
`;
function UNITSH(sh){sh.uniforms.uLMax=LMU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;vMat=mat;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying float vMat;uniform float uLMax;'+GLN).replace('#include <color_fragment>','#include <color_fragment>\n{float l0=dot(diffuseColor.rgb,vec3(.299,.587,.114));bool mt=vMat>3.5&&vMat<4.5;diffuseColor.rgb=mix(vec3(l0),diffuseColor.rgb,1.2)*(mt?.97+.05*vn3(vLP*22.):.93+.12*vn3(vLP*22.));}').replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+GLTOON+GLUMAT).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{float l=dot(gl_FragColor.rgb,vec3(.299,.587,.114));gl_FragColor.rgb=mix(vec3(l),gl_FragColor.rgb,1.07)*vec3(1.03,1.0,.96);}')}
const matUI=(()=>{const m=matV.clone();m.onBeforeCompile=UNITSH;return m})();
const cubeG=new THREE.BoxGeometry(1,1,1);
const RINGS={};function ringGeo(s){if(RINGS[s])return RINGS[s];const G=newG(),c=[1,.88,.29],t=.05;
 bxc(G,0,0,-s,2*s+t,.03,t,c);bxc(G,0,0,s,2*s+t,.03,t,c);bxc(G,-s,0,0,t,.03,2*s+t,c);bxc(G,s,0,0,t,.03,2*s+t,c);return RINGS[s]=toGeo(G)}
const ringMat=new THREE.MeshBasicMaterial({vertexColors:true});
const CARRYG=(()=>{const mk=f=>{const G=newG();f(G);return toGeo(G)};return{
 w:mk(G=>{[[0,0,.0],[.01,.11,.1],[.01,.11,-.1]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.46,.12,.12,k?'#a8723a':'#8a5a2a'));bxc(G,0,.05,0,.1,.2,.36,'#5a3a1a')}),
 g:mk(G=>{bxc(G,0,0,0,.3,.32,.22,'#c8a060');bxc(G,0,.3,0,.2,.06,.16,'#b08848');bxc(G,0,.14,.12,.18,.1,.04,'#ffd23c');bxc(G,0,.34,0,.14,.08,.1,'#ffd23c')}),
 s:mk(G=>{bxc(G,0,0,0,.32,.24,.26,'#b8bec8');bxc(G,.05,.2,0,.2,.16,.2,'#d4dae4');bxc(G,-.1,0,.14,.14,.12,.1,'#8e95a2')})}})();
const RS3={king:.52,guard:.46,gunner:.3,gunner2:.3,cannon:.56,husk:.26,peasant:.3,knight:.4,archer:.34,bannerman:.34,captain:.45,zombie:.32,runner:.3,brute:.5,bomber:.4,acid:.32,miner:.34};
function buildUnitGroup(type,t,zv){ALB=t===0?alv():0;const k=type+t+'a'+ALB+MVAR+(zv?'v'+zv.v+(zv.hint||''):''),mdl=UM[k]||(UM[k]=(()=>{const zo=ZVAR;ZVAR=zv||null;try{return mkModel(type,t)}finally{ZVAR=zo}})()),g=new THREE.Group();
 const mat=matV.clone();mat.onBeforeCompile=UNITSH;mat.emissive=new THREE.Color(0,0,0);
 const mesh=geo=>{const m=new THREE.Mesh(geo,mat);m.castShadow=SHADOWS&&type!=='husk';return m};
 const body=new THREE.Group();body.position.y=mdl.hip;const tor=mesh(mdl.torso);tor.position.y=-mdl.hip;body.add(tor);
 const head=mesh(mdl.head);head.position.set(0,mdl.neck,0);tor.add(head);
 const arm=mesh(mdl.arm);arm.position.set(mdl.ax,mdl.sh,0);tor.add(arm);
 let armL=null,shd=null;if(mdl.armL){armL=mesh(mdl.armL);armL.position.set(-mdl.ax,mdl.sh,0);tor.add(armL);if(mdl.shield){shd=mesh(mdl.shield);shd.position.set(mdl.shp[0],mdl.shp[1],mdl.shp[2]);shd.rotation.set(.33,-.14,0);armL.add(shd)}}
 const lL=mesh(mdl.leg),lR=mesh(mdl.leg);lL.position.set(-mdl.lx,mdl.hip,0);lR.position.set(mdl.lx,mdl.hip,0);g.add(lL,lR,body);
 const ex={};if(mdl.parts)for(const p of mdl.parts){const m=mesh(p.geo);m.position.set(p.x,p.y,p.z);(p.par?ex[p.par]:tor).add(m);ex[p.k]=m}
 const tools={};if(mdl.tools)for(const k2 of['axe','pick','hammer','hoe']){const m=mesh(mdl.tools[k2]);m.visible=false;m.position.set(0,HANDY*VX,.15*VX);arm.add(m);tools[k2]=m}
 let weap=null;if(mdl.weap){const T2=toolGeos(),m=mesh(T2[mdl.weap]);if(mdl.weap==='bow'){if(armL){m.position.set(0,HANDY*VX,.1*VX);armL.add(m);weap=m}}else{m.position.set(0,HANDY*VX,.15*VX);arm.add(m);weap=m}}
 const ring=new THREE.Mesh(ringGeo(RS3[type]),ringMat);ring.position.y=.04;ring.visible=false;g.add(ring);
 const carry=new THREE.Mesh(CARRYG.w,mat);carry.position.set(0,mdl.sh*.55,-.26);carry.visible=false;tor.add(carry);
 g.userData={ex,body,tor,head,lL,lR,arm,armL,shd,tools,weap,ring,carry,mdl,mat,z:t,wr:0};return g}
/* ---- instanced units: the per-unit groups still pose every part (animation code unchanged), but their meshes sit on a hidden layer;
   each frame the posed matrices are copied into one InstancedMesh per part model (and per shadow flag) ---- */
const _uPV=new THREE.Matrix4(),_uFr=new THREE.Frustum(),_uSp=new THREE.Sphere(new THREE.Vector3(),3.2);
const UL=5,UIB=new Map(),_uM=new THREE.Matrix4(),_uS=new THREE.Matrix4().makeScale(-1,1,1);let UIM=null;
function uiMat(){if(UIM)return UIM;const m=matV.clone();m.onBeforeCompile=function(sh,r){UNITSH(sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 iEm;varying vec3 vEm;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEm=iEm;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vEm;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vEm;')};return UIM=m}
function uiGrow(b,need){let cap=Math.max(32,b.cap);while(cap<need)cap*=2;const g2=new THREE.BufferGeometry();for(const k in b.geo.attributes)g2.setAttribute(k,b.geo.attributes[k]);g2.setIndex(b.geo.index);
 const em=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);em.setUsage(THREE.DynamicDrawUsage);g2.setAttribute('iEm',em);
 const m=new THREE.InstancedMesh(g2,uiMat(),cap);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);m.instanceColor.setUsage(THREE.DynamicDrawUsage);
 if(b.mesh){m.instanceMatrix.array.set(b.mesh.instanceMatrix.array);m.instanceColor.array.set(b.mesh.instanceColor.array);em.array.set(b.em.array);scene.remove(b.mesh);b.mesh.geometry.dispose()}
 m.frustumCulled=false;m.castShadow=b.sh;m.scale.set(-1,1,1);m.count=0;scene.add(m);m.updateMatrixWorld(true);b.mesh=m;b.em=em;b.cap=cap}
function uiAdd(g){const d=g.userData;if(!d.ip)return;const c=d.mat.color,e=d.mat.emissive;
 for(const m of d.ip){if(!m.visible)continue;let p=m.parent,vis=true;while(p&&p!==g){if(!p.visible){vis=false;break}p=p.parent}if(!vis)continue;
  const key=m.geometry.id*2+(m.castShadow?1:0);let b=UIB.get(key);if(!b){b={geo:m.geometry,sh:m.castShadow,cap:0,n:0,mesh:null,em:null};UIB.set(key,b)}
  if(b.n>=b.cap)uiGrow(b,b.n+1);const k=b.n++;_uM.multiplyMatrices(_uS,m.matrixWorld);b.mesh.setMatrixAt(k,_uM);b.mesh.instanceColor.setXYZ(k,c.r,c.g,c.b);b.em.setXYZ(k,e.r,e.g,e.b)}}
function uiUMW(force){if(this.visible)THREE.Object3D.prototype.updateMatrixWorld.call(this,force)}
function uiFlush(){for(const b of UIB.values())b.n=0;
 for(const[u,g]of unitG)if(g.userData.frame===frameN&&g.visible)uiAdd(g);
 for(const c of CORPSES)uiAdd(c.g);
 for(const b of UIB.values()){if(!b.mesh)continue;b.mesh.count=b.n;b.mesh.visible=b.n>0;if(b.n){b.mesh.instanceMatrix.needsUpdate=true;b.mesh.instanceColor.needsUpdate=true;b.em.needsUpdate=true}}}
/* units are drawn at 76% so a man stands about a quarter of a house high (the title screen keeps its own framing) */
const UNITK=.76;
const T_C=u=>T.cannon.cdt;
function cannonG(){const G=newG(),WD='#5e4026',WL='#7a5532',IR='#9a7438',IR2='#c09048',BR='#2c2e33';
 for(const sx of[-1,1]){const x=sx*.27;bxc(G,x,.02,.36,.07,.4,.16,WD);bxc(G,x,.14,.36,.07,.16,.4,WD);bxc(G,x,.07,.36,.07,.3,.3,WL);bxc(G,x+sx*.04,.17,.36,.05,.1,.1,IR)}
 bxc(G,0,.17,.36,.6,.06,.06,IR);bxc(G,0,.2,.2,.36,.1,.5,WD);bxc(G,0,.12,-.1,.16,.08,.36,WD);bxc(G,0,.08,-.27,.2,.06,.08,IR);
 bxc(G,0,.29,.3,.17,.17,.62,IR);bxc(G,0,.27,.04,.22,.21,.14,IR2);bxc(G,0,.31,-.05,.08,.08,.06,IR);bxc(G,0,.28,.62,.21,.21,.07,IR2);bxc(G,0,.33,.66,.08,.08,.01,BR);
 for(const[x,z]of[[.13,-.06],[.2,-.02],[.16,.04]])bxc(G,x-.4,.01,z+.1,.07,.07,.07,BR);return toGeo(G)}
function mkUnit(u){const g=buildUnitGroup(u.type==='cannon'?'gunner':u.type,u.t===2?20+(u.ci||0):u.t,zKeyOf(u)||(u.type==='peasant'&&u.t!==1?{v:((u.uid|0)*2654435761>>>0)%6,hint:'p'}:null)),mdl=g.userData.mdl,mat=g.userData.mat;
 if(u.type==='cannon'){const s0=(mdl.sc||1.35)*UNITK,cn=new THREE.Mesh(GEO.cannonU||(GEO.cannonU=cannonG()),mat);cn.castShadow=SHADOWS;cn.scale.setScalar(.8/s0);cn.position.z=.26/s0;g.add(cn);g.userData.cn=cn;g.userData.cnz=.26/s0;
  const c2=buildUnitGroup('gunner2',u.t,null),e2=c2.userData;c2.remove(e2.ring);c2.traverse(o=>{if(o.isMesh)o.material=mat});c2.position.set(.36/s0,0,.34/s0);c2.rotation.y=-.35;g.add(c2);g.userData.c2=c2}
 if(u.type==='bannerman'){const au=new THREE.Mesh(GEO.auB||(GEO.auB=new THREE.RingGeometry(HEAL_R/TS/1.35/UNITK-.12,HEAL_R/TS/1.35/UNITK,64)),new THREE.MeshBasicMaterial({color:0x7dffa0,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auBf||(GEO.auBf=new THREE.CircleGeometry(HEAL_R/TS/1.35/UNITK,48)),new THREE.MeshBasicMaterial({color:0x7dffa0,transparent:true,opacity:.09,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 if(u.type==='king'){const R=10/1.72/UNITK,au=new THREE.Mesh(GEO.auK||(GEO.auK=new THREE.RingGeometry(R-.14,R,72)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auKf||(GEO.auKf=new THREE.CircleGeometry(R,56)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.06,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 if(u.type==='captain'){const R=8/1.35/UNITK,au=new THREE.Mesh(GEO.auC||(GEO.auC=new THREE.RingGeometry(R-.14,R,64)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auCf||(GEO.auCf=new THREE.CircleGeometry(R,48)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.07,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 u.sv=u.sv||(.95+Math.random()*.1);const v=.93+Math.random()*.12;mat.color.setRGB(v,v,v);
 {const s0=(mdl.sc||1.35)*u.sv*(u.ttl?1:UNITK);g.scale.set(-s0,s0,s0);g.userData.sc=s0}if(!u.ttl){const ip=[];g.traverse(o=>{if(o.isMesh&&o.material===mat){o.layers.set(UL);ip.push(o)}});g.userData.ip=ip;g.updateMatrixWorld=uiUMW}u.m=g;u.mt=u.t;u.mal=u.t===0?alv():0;u.dy=gh(u.x/TS,u.y/TS);u.ap=Math.random()*6;u.fa=u.face||0;u.lph=0;scene.add(g);unitG.set(u,g);return g}
const angd=(a,b)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
const ATKT=.35,lerp=(a,b,t)=>a+(b-a)*t,sat=t=>Math.max(0,Math.min(1,t)),easeO=t=>1-(1-t)*(1-t),CHOPC={t:'#9d7a50',w:'#8b5a2b',s:'#cfd6e2',g:'#ffd23c',f:'#8a6a3a',p:'#6a5a3a'};
function animUnit(u,dt,anyDmg,frame){let g=u.m;if(g&&!u.ttl&&(u.mt!==u.t||(u.t===0&&u.mal!==alv()))){scene.remove(g);unitG.delete(u);g=null}if(!g)g=mkUnit(u);
 const d=g.userData,ty=u.type,z=u.t===1,wl=u.walk>0,T=clockT+u.ph0;d.frame=frame;
 if(u.atk>0)u.atk-=dt;if(u.hurt>0)u.hurt-=dt;
 const fast=ty==='runner',heavy=ty==='brute'||ty==='bomber',armored=ty==='knight'||ty==='captain'||ty==='king'||ty==='guard';
 if(u.rg&&u.cap&&wl&&u.cap.walk>0&&u.cap.m)u.ap=u.cap.ap;u.ap+=dt*(wl?(z?(fast?14:heavy?4.6:6.4):(armored?7.6:9.5)):0)*(u.ttl?1:1.25);u.dy+=((u.gar||u.onF?u.gz:gh(u.x/TS,u.y/TS))-u.dy)*Math.min(1,dt*(u.gar?6:12));
 u.fa+=angd(u.fa,u.face||0)*Math.min(1,dt*12);
 const k=Math.min(1,dt*16),sw=wl?Math.sin(u.ap)*(z?(fast?.95:.55):armored?.65:.85):0,ab=wl?Math.abs(Math.sin(u.ap)):0;
 /* attack / work phases */
 const atk=u.atk>0?1-u.atk/ATKT:-1,work=ty==='peasant'&&(!u.t||u.t===2)&&!wl&&!u.carry&&(u.job==='r'?anyDmg&&!u.o:u.work>0&&!u.o);
 let ar=0,al=0,lean=0,twist=0,lunge=0,headX=0,headY=0,headZ=0,sway=0,wr=0;
 if(wl){ar=sw*.85;al=-sw*.85;sway=Math.sin(u.ap)*(z?.1:.045);lean=z?.2:fast?.26:heavy?.12:.06;twist=Math.sin(u.ap)*.1;headX=z?.3:.02;headZ=z?Math.sin(u.ap*.5)*.2+.18:0}
 else{ar=Math.sin(T*1.3)*.05;al=-Math.sin(T*1.3)*.05;lean=z?.18:0;headY=Math.sin(T*.6)*.3*(atk<0?1:0);headX=z?.34+Math.sin(T*1.7)*.05:Math.sin(T*.9)*.03;headZ=z?.22:0}
 if(z){ar=-1.45+(wl?Math.sin(u.ap*.9)*.18:Math.sin(T*1.8)*.1);al=-1.35-(wl?Math.sin(u.ap*.9+1)*.18:Math.sin(T*1.6)*.1);const zr=(u.uid*2654435761)>>>0;ar+=((zr&15)/15-.5)*.36;al+=(((zr>>4)&15)/15-.5)*.36;if((zr>>8)%9===0)al=-.28+Math.sin(T*1.6)*.06;else if((zr>>12)%11===0)ar=-.24+Math.sin(T*1.4)*.06;headZ+=(((zr>>16)&15)/15-.5)*.34}
 if(ty==='brute'){if(wl){const s2=Math.sin(u.ap);ar=-.42-s2*.62;al=-.42+s2*.62;lean=.58+Math.abs(Math.cos(u.ap))*.06;sway=s2*.07;headX=-.42;headZ=0}else{ar=-.3+Math.sin(T*1.6)*.05;al=-.3-Math.sin(T*1.5)*.05;lean=.5;headX=-.36+Math.sin(T*1.7)*.04;headZ=0}}
 if(ty==='archer'){al=-1.28;ar=wl?-sw*.6-.2:-.45;lean=0}
 if(armored||ty==='bannerman'){al=d.shd?-.3+(wl?-sw*.14:Math.sin(T*1.3)*.02):wl?-sw*(armored?.25:.7):-Math.sin(T*1.3)*.03}
 if(armored&&u.atk<=0)ar=-.75+(wl?Math.sin(u.ap*.9)*.07:Math.sin(T*1.3)*.04);
 if(atk>=0){const p=atk;
  if(ty==='archer'){const dr=p<.55?easeO(p/.55):1-(p-.55)/.45*.6;ar=-1.35-.1*dr;al=-1.46;twist=.5*dr;lean=-.05*dr;if(p>.55&&p<.7)lean=-.12;headY=-.35*dr}
  else if(z){const t=p<.25?easeO(p/.25):p<.55?1-(p-.25)/.3*1.6:-.6*(1-(p-.55)/.45);ar=-1.45-.55*Math.max(0,t)+Math.max(0,-t)*1.3;al=ar+.1;lean=.18+.25*(p>.25&&p<.6?1:0);lunge=(p>.25&&p<.6)?.1:0;headX=.5}
  else{const wu=p<.25,st=p>=.25&&p<.5,t=wu?easeO(p/.25):st?(p-.25)/.25:1-(p-.5)/.5;
   ar=wu?-.2-2.3*t:st?-2.5+3.0*t:.5*(1-(p-.5)/.5)*(1);al=wu?-.5*t:st?-.5+.7*t:0;wr=wu?.55*t:st?.55-1.05*t:-.5*(1-(p-.5)/.5);twist=wu?.35*t:st?.35-.8*t:-.45*(1-(p-.5)/.5);lean=wu?-.12*t:st?-.12+.5*t:.38*(1-(p-.5)/.5);lunge=st?.14*t:p>=.5?.14*(1-(p-.5)/.5):0;headX=st?.2:0}}
 if(ty==='cannon'){ar=-1.15+(wl?Math.sin(u.ap)*.05:0);al=ar;lean=wl?.28:.1;twist=0;lunge=0;headX=0}
 if(ty==='guard'){if(wl)d.wasW=1;else if(d.wasW){d.wasW=0;d.pst=clockT}
  if(atk<0){if(wl){ar=-.3+Math.sin(u.ap*.9)*.05;u.gwr=-1.12}else{ar=-.14+Math.sin(T*1.2)*.01;u.gwr=-1.43;headX=-.03;headY=0;lean=-.02;const pk=clockT-(d.pst||-9);if(pk<.55){const e=Math.sin(Math.min(1,pk/.55)*Math.PI);ar-=.26*e;u.gwr-=.06*e}}}else{const p=atk,wu=p<.3,th=p>=.3&&p<.55,t=wu?easeO(p/.3):th?(p-.3)/.25:1-(p-.55)/.45;
  if(wu){ar=-.36-.24*t;u.gwr=-1.28+1.53*t;lunge=0;lean=0}else if(th){ar=-.6-.95*t;u.gwr=.25+1.25*t;lunge=.16*t;lean=.14*t}else{ar=-.36-1.19*t;u.gwr=-1.28+2.78*t;lunge=.16*t;lean=.14*t}twist=0}}
 let arz=0,alz=0,wy=0;
 if(ty==='king'){if(atk>=0)d.kcb=clockT;const rest=!wl&&atk<0&&clockT-(d.kcb||-99)>2.2;
  if(rest){const b=Math.sin(T*1.1)*.015;ar=-.5+b;al=-.5+b;arz=-.52;alz=.52;wy=.451;u.kwr=2.133-b;lean=-.03;headX=-.06+Math.sin(T*.5)*.02;headY=Math.sin(T*.37)*.16}
  else if(atk<0){ar=-.8+(wl?Math.sin(u.ap*.9)*.05:Math.sin(T*1.3)*.03);u.kwr=-1.4;al=wl?-sw*.3:-.1}
  else u.kwr=null}
 let sr=0;if(d.shd&&atk>=0&&!z){sr=atk<.25?easeO(atk/.25):atk<.6?1:1-(atk-.6)/.4;al=-.3-.55*sr}
 /* peasant work cycle */
 let tool=null;
 if(ty==='peasant'&&(!u.t||u.t===2)){const jb=u.job;tool=jb==='w'?'axe':(jb==='s'||jb==='g'||jb==='t')?'pick':jb==='r'?'hammer':(jb==='f'||jb==='p')?'hoe':null;if(u.carry)tool=null;
  if(work){const ph=((T*(jb==='r'?1.7:1.15))%1),pr=u.lph;const wu=ph<.55,st=ph>=.55&&ph<.72,t=wu?easeO(ph/.55):st?(ph-.55)/.17:1-(ph-.72)/.28;
   if(jb==='r'){const hs=Math.sin(ph*Math.PI*2)**2;ar=-.9-.8*hs;wr=.5*hs-.2;lean=.12;al=-.5}else{wr=wu?.6*t:st?.6-1.1*t:-.5*(1-(ph-.72)/.28);ar=wu?-.4-2.0*t:st?-2.4+3.0*t:.6*(1-(ph-.72)/.28);al=ar*.6;lean=wu?-.1*t:st?-.1+.4*t:.3*(1-(ph-.72)/.28);twist=wu?.2*t:st?.2-.4*t:-.2*(1-(ph-.72)/.28)}
   headX=.15;if(pr<.62&&ph>=.62){const tx2=Math.sin(u.fa)*18,ty2=Math.cos(u.fa)*18;puff(u.x+tx2,u.y+ty2,jb==='r'?'#d9c9a0':CHOPC[jb]||'#ccc',3,34);snd(jb==='w'?'chop':jb==='r'?'build':(jb==='t'||jb==='f'||jb==='p')?'dirt':'mine',u.x,u.y)}u.lph=ph}else u.lph=0}
 /* hurt flash */
 const hf=u.hurt>0?Math.min(1,u.hurt/.2)*.75:0;d.mat.emissive.setRGB(hf,hf*.25,hf*.25);
 /* apply pose */
 g.position.set(u.x/TS+Math.sin(u.fa)*lunge,u.dy,u.y/TS+Math.cos(u.fa)*lunge);g.rotation.y=u.fa;
 d.lL.rotation.x+=(sw-d.lL.rotation.x)*k;d.lR.rotation.x+=(-sw-d.lR.rotation.x)*k;
 const br=Math.sin(T*2.1)*.006;d.body.position.y=d.mdl.hip+(wl?ab*.03*(heavy?1.8:1):br);
 d.body.rotation.x+=(lean-d.body.rotation.x)*k;d.body.rotation.y+=(twist-d.body.rotation.y)*k;d.body.rotation.z+=(sway-d.body.rotation.z)*k;
 d.head.rotation.x+=(headX-d.head.rotation.x)*k;d.head.rotation.y+=(headY-d.head.rotation.y)*Math.min(1,dt*6);d.head.rotation.z+=(headZ-d.head.rotation.z)*k;
 const ka=Math.min(1,dt*(ty==='king'&&atk<0?7:22));d.arm.rotation.x+=(ar-d.arm.rotation.x)*ka;if(d.armL)d.armL.rotation.x+=(al-d.armL.rotation.x)*ka;if(d.shd){u.sr=(u.sr||0)+(sr-(u.sr||0))*Math.min(1,dt*14);d.armL.rotation.z+=(.2*u.sr-d.armL.rotation.z)*ka;shdPose(d,u.sr)}
 if(ty==='king'){const kz=Math.min(1,dt*7);d.arm.rotation.z+=(arz-d.arm.rotation.z)*kz;if(d.armL)d.armL.rotation.z+=(alz-d.armL.rotation.z)*kz;if(d.weap)d.weap.rotation.y+=(wy-d.weap.rotation.y)*kz}else if(d.arm.rotation.z!==0)d.arm.rotation.z*=.8;
 d.ring.visible=!!u.sel;
 for(const kk in d.tools)d.tools[kk].visible=tool===kk;
 if(ty==='archer'&&atk>=0)wr=0;else if(ty==='guard')wr=u.gwr;else if(ty==='king'&&u.kwr!=null)wr=u.kwr;else if(armored&&atk<0)wr=.18+(wl?Math.sin(u.ap*.9)*.06:0);
 d.wr+=(wr-d.wr)*Math.min(1,dt*(ty==='king'&&atk<0?7:20));if(tool&&d.tools[tool])d.tools[tool].rotation.x=d.wr;if(d.weap&&ty!=='archer')d.weap.rotation.x=d.wr;
 if(u.carry&&u.cj){d.carry.visible=true;if(d.carry.geometry!==CARRYG[u.cj])d.carry.geometry=CARRYG[u.cj]}else d.carry.visible=false;
 const X=d.ex;if(X.cape)X.cape.rotation.x=.1+(wl?.22+.22*Math.abs(Math.sin(u.ap)):0)+Math.sin(T*1.5)*.04+(atk>=0?.35:0);if(X.cape2)X.cape2.rotation.x=-.07+(wl?.12+.16*Math.abs(Math.sin(u.ap+.7)):0)+Math.sin(T*1.5-.9)*.05+(atk>=0?.2:0);
 if(X.plume){X.plume.rotation.x=-.15-(wl?.4:0)+Math.sin(T*3)*.07;X.plume.rotation.z=Math.sin(T*2.2)*.08+(wl?Math.sin(u.ap)*.12:0)}
 if(X.pen){X.pen.rotation.y=Math.sin(T*4.2)*.3-.1;X.pen.rotation.z=Math.sin(T*3)*.06;if(X.tip)X.tip.rotation.y=Math.sin(T*4.2-1.3)*.55}
 if(X.ban){X.ban.rotation.x=.05+Math.sin(T*2.4)*.05+(wl?.12:0);X.ban.rotation.z=Math.sin(T*1.8)*.05;if(X.ban2){X.ban2.rotation.x=.07+Math.sin(T*2.4-1.1)*.07+(wl?.07:0);X.ban2.rotation.y=Math.sin(T*1.7-.6)*.06}if(X.ban3){X.ban3.rotation.x=.1+Math.sin(T*2.4-2.2)*.1+(wl?.09:0);X.ban3.rotation.y=Math.sin(T*1.7-1.3)*.1}}
 if(d.aura)d.aura.material.opacity=.32+.1*Math.sin(clockT*3);
 if(ty==='cannon'){const rc=atk>=0?Math.max(0,1-atk*2.2):0;d.cn.position.z=d.cnz-rc*.14/(d.sc||1);d.cn.rotation.x=-rc*.06;const e2=d.c2.userData;e2.lL.rotation.x=d.lR.rotation.x;e2.lR.rotation.x=d.lL.rotation.x;
  const rl=!wl&&atk<0&&u.cd>.6,a2=wl?-1.0:atk>=0?-1.6+atk:rl?-1.3+Math.sin(T*6.5)*.42:-.35+Math.sin(T*1.4)*.05;e2.arm.rotation.x+=(a2-e2.arm.rotation.x)*ka;if(e2.armL)e2.armL.rotation.x+=((wl?-1.0:-.2)-e2.armL.rotation.x)*ka;e2.body.rotation.x=wl?.2:atk>=0?-.08:rl?.18+Math.sin(T*6.5)*.06:0;if(rl&&u.cd>T_C(u)*.75&&Math.random()<.08)puff(u.x+Math.sin(u.fa)*16,u.y+Math.cos(u.fa)*16,'#bbb4aa',1,10,{soft:1,T:1.2,s:.25,z:.45,vz:.4,g:-.1});e2.head.rotation.y=Math.sin(T*.5)*.3}}
/* ---- Minecraft death: tip over sideways, turn red, then poof ---- */
const CORPSES=[];
function mcCorpse(u){const g=u.m;if(!g)return false;unitG.delete(u);u.m=null;if(!g.visible){g.visible=true;g.position.set(u.x/TS,gh(u.x/TS,u.y/TS),u.y/TS)}g.rotation.order='YXZ';const d=g.userData;if(d.ring)d.ring.visible=false;if(d.aura)d.aura.visible=false;CORPSES.push({g,t:0,dir:Math.random()<.5?1:-1,x:u.x,y:u.y,z:u.t===1,big:u.type==='brute'});
 while(CORPSES.length>48){const o=CORPSES.shift();scene.remove(o.g);if(o.g.userData.mat)o.g.userData.mat.dispose()}return true}
function animCorpses(dt){for(let i=CORPSES.length-1;i>=0;i--){const c=CORPSES[i];c.t+=dt;const p=Math.min(1,c.t/.5),e=p*p*(3-2*p);c.g.rotation.z=c.dir*1.5708*e;const m=c.g.userData.mat;if(m&&m.emissive)m.emissive.setRGB(.6,0,0);
  if(c.t>1.0){const n=c.big?16:9;puff(c.x,c.y,'#efefef',n,c.big?44:30,{T:.85,z:.35,vz:1.5,g:-.7,s:c.big?.2:.13});puff(c.x,c.y,'#bdbdbd',n>>1,24,{T:.7,z:.25,vz:1.0,g:-.5,s:.1});if(c.z){puff(c.x,c.y,'#b8f040',2,22,{T:1.4,z:.3,vz:2.4,g:3.4,s:.08});puff(c.x,c.y,'#f0ff60',1,18,{T:1.4,z:.3,vz:2.6,g:3.4,s:.07})}
   scene.remove(c.g);if(m)m.dispose();CORPSES.splice(i,1)}}}
/* ---- death animation (legacy, unused) ---- */


/* ---- structures: connected voxel models ---- */
const ST='#7f7f7f',ST2='#8b8b8b',ST3='#979797',STD='#5f5f5f',STL='#b3b3b3',DK='#1b1b22',RED='#9b3b2e',WOOD='#9c7a46',IRON='#4a4a52';let BLU=thp();
const isW=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&(o.type==='wall'||o.type==='gate'||o.type==='tower'||o.type==='castle'||o.type==='keep')};
const isWl=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&o.type==='wall'};
const connMask=s=>{const x=s.tx,y=s.ty,n=isW(x,y-1),e=isW(x+1,y),so=isW(x,y+1),w=isW(x-1,y);let m=(n?1:0)|(e?2:0)|(so?4:0)|(w?8:0);if(s.type==='wall'){if(!e&&!so&&isWl(x+1,y+1))m|=16;if(!w&&!so&&isWl(x-1,y+1))m|=32}return m};
/* 2x2 tower: which of the 8 tiles around it hold rampart pieces (2 per side: N, E, S, W) */
const pMask=s=>{const x=s.tx,y=s.ty,q=(a,b)=>{const o=occ.get(b*TW+a);return o&&o!==s&&isW(a,b)};let m=0;[[x,y-1],[x+1,y-1],[x+2,y],[x+2,y+1],[x,y+2],[x+1,y+2],[x-1,y],[x-1,y+1]].forEach(([a,b],i)=>{if(gOK(a,b)&&q(a,b))m|=1<<i});return m};
const WH=1.7,WT=.3,CRS=[ST,ST2,ST3,ST2];

const DIRS=[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]];
/* box along an arm: t = distance along the arm, l = lateral */
const ab=(G,dx,dz,t,l,y,a,b,h,c)=>bxc(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);



/* gate: 2 tiles long (local x -1..1), depth .8 */



/* ---- siege turrets ---- */
const WD='#7a5230',WD2='#5a3a20',WD3='#92643a';
function ballBase(){const G=newG();bxc(G,0,0,0,.92,.14,.92,STD);bxc(G,0,.14,0,.84,.08,.84,'#6a4a28');
 for(let k=0;k<4;k++){const a=k*Math.PI/2;bxc(G,Math.cos(a)*.36,.0,Math.sin(a)*.36,.14,.18,.14,ST3)}
 bxc(G,0,.22,0,.26,.34,.26,WD2);bxc(G,0,.54,0,.4,.07,.4,IRON);[[.38,-.3],[-.36,.34],[.34,.36]].forEach(([x,z])=>{bxc(G,x,.22,z,.22,.12,.26,'#b89a60');bxc(G,x,.34,z,.14,.07,.18,'#a88a50')});
 bxc(G,-.36,.22,-.36,.1,.28,.1,WD);bxc(G,.36,.22,-.36,.1,.28,.1,WD);return toGeo(G)}
function ballBolt(){const G=newG();bxc(G,0,.11,.12,.055,.055,.96,'#e8dcb8');bxc(G,0,.11,.66,.09,.075,.14,'#d4dae6');bxc(G,0,.11,.73,.05,.05,.08,'#f4f8ff');bxc(G,0,.11,-.3,.05,.06,.06,'#c04030');return toGeo(G)}
function ballHead(){const G=newG();
 bxc(G,0,-.07,0,.15,.13,1.04,WD3);bxc(G,0,.06,.04,.07,.05,.86,IRON);bxc(G,0,-.12,.05,.1,.05,.8,WD2);
 bxc(G,0,-.04,.28,.34,.2,.17,WD2);bxc(G,0,-.04,.28,.38,.07,.19,IRON);
 [1,-1].forEach(sg=>{bxc(G,sg*.24,-.02,.28,.2,.12,.13,WD);bxc(G,sg*.42,-.01,.24,.18,.11,.12,WD3);bxc(G,sg*.57,0,.15,.14,.1,.12,WD);bxc(G,sg*.66,0,.05,.1,.1,.1,'#a89060');
  bxc(G,sg*.34,.04,.0,.62,.025,.04,'#efe6c8');bxc(G,sg*.62,.04,.1,.04,.025,.2,'#efe6c8');bxc(G,sg*.18,.04,-.12,.34,.025,.04,'#efe6c8')});
 bxc(G,0,-.02,-.46,.24,.2,.12,STD);bxc(G,0,.05,-.46,.34,.05,.05,IRON);bxc(G,.17,.05,-.46,.05,.18,.05,WD);
 bxc(G,0,.14,-.38,.04,.34,.04,'#3a2f20');bxc(G,.1,.38,-.38,.2,.1,.03,BLU);bxc(G,.05,.3,-.38,.1,.1,.03,BLU);return toGeo(G)}
function trebBase(){const G=newG();
 [.34,1.66].forEach(x=>{bxc(G,x,0,1,.16,.14,1.8,WD2);bxc(G,x,.14,.3,.12,.12,.4,WD);bxc(G,x,.14,1.7,.12,.12,.4,WD);
  [[.3,-1],[1.7,1]].forEach(([z,sg])=>{bxc(G,x,.14,z*.5+1*.5,.14,.1,.14,WD)});
  for(let k=0;k<5;k++){const t=k/4;bxc(G,x,.14+t*1.55,.55+t*.45*(1)-.02,.12,.4,.12,WD);bxc(G,x,.14+t*1.55,1.45-t*.45+.02,.12,.4,.12,WD)}
  bxc(G,x,1.5,1,.2,.34,.34,IRON)});
 bxc(G,1,0,.28,1.5,.12,.14,WD2);bxc(G,1,0,1.72,1.5,.12,.14,WD2);bxc(G,1,.14,1,1.4,.1,.1,WD);bxc(G,1,.7,.78,1.3,.08,.08,WD);bxc(G,1,.7,1.22,1.3,.08,.08,WD);
 bxc(G,1,1.78,1,1.34,.12,.12,'#3a2f20');
 bxc(G,1,0,1,.9,.06,1.6,'#6a5a3a');[[.3,.3],[1.7,.3],[.3,1.7],[1.7,1.7]].forEach(([x,z])=>{bxc(G,x,0,z,.28,.28,.28,ST3)});
 bxc(G,.1,.14,1.9,.2,.26,.2,'#b89a60');bxc(G,1.9,.14,.1,.22,.18,.26,'#b89a60');
 [.55,1.45].forEach(z=>{bxc(G,1.9,.0,z,.18,.28,.2,STD)});
 bxc(G,1.5,.5,1.82,.05,.34,.05,'#3a2f20');bxc(G,1.65,.78,1.82,.3,.1,.03,BLU);return toGeo(G)}
function trebArm(){const G=newG();
 bxc(G,0,-.06,.36,.16,.16,2.5,WD3);bxc(G,0,-.04,1.3,.12,.12,.95,WD);bxc(G,0,-.1,-.6,.2,.22,.5,WD2);bxc(G,0,.0,.3,.34,.2,.2,IRON);
 bxc(G,0,-.12,1.66,.05,.34,.05,'#d4c8a0');bxc(G,0,-.34,1.7,.34,.18,.3,'#8a7a50');bxc(G,0,-.2,1.7,.2,.2,.2,'#8a8d99');return toGeo(G)}
function trebCW(){const G=newG();bxc(G,0,-.62,0,.12,.58,.12,IRON);bxc(G,0,-.72,0,.9,.1,.1,IRON);
 bxc(G,0,-1.2,0,.8,.5,.56,STD);bxc(G,0,-1.2,0,.82,.12,.58,BLU);bxc(G,0,-.86,0,.84,.1,.6,ST3);bxc(G,0,-1.58,0,.82,.12,.58,BLU);bxc(G,.42,-1.2,0,.04,.2,.3,'#e0b030');return toGeo(G)}
const GEO={};

/* ---- wooden tier models ---- */
const LG1='#6b4f2e',LG2='#5b4326',LG3='#b8945f',LGD='#3f2d1a',THA='#7a5a34',THB='#6a4c2a',THC='#573e22',ROPE='#d9c28a';









/* ================= Minecraft-style small buildings (cobble, planks, logs, glass, stair roofs) ================= */
const COBL=['#7d7d7d','#8c8c8c','#6e6e6e','#838383'],PLKL=['#b8945f','#a98450'],SPRL=['#6e5230','#5f4527'],LGM='#5b4326',GLS='#bfe3f2',HAYC='#d8b23a';







/* houses merge with aligned neighbours (bits: 1 N, 2 E, 4 S, 8 W): shared walls, one continuous roof */

const RF0='#9b3b2e',RF1='#8a3228';


const CONNT=new Set(['storage','barracks','academy','market']);

function mergeMask(s){const T=s.type,tx=s.tx,ty=s.ty,P=s.pl|0,q=(x,y,ex,ey)=>{if(!gOK(x,y))return false;const o=occ.get(y*TW+x);return !!o&&o!==s&&o.type===T&&o.t===0&&(o.pl|0)===P&&o.tx===ex&&o.ty===ey};
 return (q(tx,ty-1,tx,ty-2)?1:0)|(q(tx+2,ty,tx+2,ty)?2:0)|(q(tx,ty+2,tx,ty+2)?4:0)|(q(tx-1,ty,tx-2,ty)?8:0)}
function scafGeo(w,d,h){const G=newG(),P='#9a6a38',Q='#6f4a24',B='#c9a36a';const x=w/2+.08,z=d/2+.08;
 [[-x,-z],[x,-z],[-x,z],[x,z]].forEach(([a,b])=>bxc(G,a,0,b,.1,h,.1,Q));
 for(let y=.55;y<h;y+=.65){bxc(G,0,y,z,2*x,.06,.07,P);bxc(G,0,y,-z,2*x,.06,.07,P);bxc(G,x,y,0,.07,.06,2*z,P);bxc(G,-x,y,0,.07,.06,2*z,P)}
 for(let y=1.1;y<h;y+=1.3){bxc(G,0,y,z+.06,2*x,.05,.18,B);bxc(G,0,y,-z-.06,2*x,.05,.18,B)}
 const dz=z+.01;for(let y=0;y+1.3<h;y+=1.3){const n=Math.max(2,Math.round(x*2/.5));for(let k=0;k<n;k++){const a=-x+(k+.5)*2*x/n,f=k%2?-1:1;bxc(G,a,y+.55,dz,.05,.7,.05,P);}}
 return toGeo(G)}

function sGeo(s,m){const MG=s.type==='house'||s.type==='farm'||s.type==='storage'||s.type==='barracks'||s.type==='academy'||s.type==='market',hm=MG?mergeMask(s):0;s.hm=hm;const op=s.type==='tower'&&!!s.weapon,sv=BLU,fx=s.t===2?'f'+s.ci:'';if(s.t===2)BLU=PAL[s.ci][1];try{const fixed=s.type==='castle'||s.type==='barracks'||s.type==='farm'||s.type==='storage'||s.type==='house'||s.type==='academy'||s.type==='market'||s.type==='forester'||s.type==='guild'||s.type==='torch'||s.type==='keep'||s.type==='gate'||s.type==='ballista'||s.type==='trebuchet',wd=s.tier===0&&s.type!=='ballista'&&s.type!=='trebuchet'&&s.type!=='torch',WDF={wall:1,gate:1,tower:1,castle:1,barracks:1,keep:1},k=s.type+(fixed?(hm?'m'+hm:''):m)+fx+(wd?'w':'')+(op?'o':'')+(s.sz===5?'5':'')+(s.type==='tower'&&s.sz===2?'2':'')+(s.type==='gate'&&s.gl===3?'3':'');if(wd&&!WDF[s.type]&&!GEO[k]){const kS=k.replace(fx+'w',fx),old=GEO[kS];delete GEO[kS];WOODY=true;try{GEO[k]=sGeo({...s,tier:1},m)}finally{WOODY=false;if(old)GEO[kS]=old;else delete GEO[kS]}return GEO[k]}return GEO[k]||(GEO[k]=wd?({wall:woodWallGeo,tower:s.sz===2?woodTowerGeo2:woodTowerGeo,gate:s.gl===3?woodGateGeo3:woodGateGeo,castle:s.sz===5?woodCastleGeo5:woodCastleGeo,barracks:woodBarracksGeo,keep:()=>keepGeo(true)})[s.type](MG?hm:m,op):({wall:wallGeo,tower:s.sz===2?towerGeo2:towerGeo,gate:s.gl===3?gateGeo3:gateGeo,castle:s.sz===5?castleGeo5:castleGeo,barracks:barracksGeo,farm:farmGeo,storage:storageGeo,house:houseGeo,academy:academyGeo,market:marketGeo,forester:foresterGeo,guild:guildGeo,torch:torchGeo,keep:()=>keepGeo(false),ballista:ballBase,trebuchet:trebBase})[s.type](MG?hm:m,op))}finally{BLU=sv}}
const flagMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),structO=new Set(),stairO=new Set();
const BANNER=cvs(128,192),bannerTex=new THREE.CanvasTexture(BANNER),bannerMat=new THREE.MeshBasicMaterial({map:bannerTex,transparent:true,alphaTest:.25,side:THREE.DoubleSide}),PLG={};
let BPLOFF=false;const bpl=(w,h,x,y,z,ry)=>{if(BPLOFF)return new THREE.Object3D();const k=w+'x'+h,g=PLG[k]||(PLG[k]=new THREE.PlaneGeometry(w,h)),m=new THREE.Mesh(g,bannerMat);m.position.set(x,y,z);m.rotation.y=ry||0;return m};
function retheme(){BLU=thp();for(const k in GEO)delete GEO[k];for(const k in UM)delete UM[k];thIcons();icons3D();drawBanner();bannerTex.needsUpdate=true;
 for(const s of structs)if(s.o3)buildStructMesh(s);for(const[u,g]of unitG){scene.remove(g)}unitG.clear();for(const u of units)u.m=null;titleDirty=true}
function buildStructMesh(s){BPLOFF=s.t===2||s.tier===0;try{buildStructMesh0(s)}finally{BPLOFF=false}}
function buildStructMesh0(s){const g=s.o3;while(g.children.length)g.remove(g.children[0]);let b=0;s.head=null;s.arm=null;s.bolt=null;s.tpv=null;
 for(const[i,j]of s.tiles)b=Math.max(b,HT[j*TW+i]);s.bh=b;
 const m=s.sz===1?connMask(s):s.type==='tower'?pMask(s):0,mesh=new THREE.Mesh(sGeo(s,m),matV);mesh.castShadow=SHADOWS;mesh.receiveShadow=SHADOWS;g.add(mesh);
 if(s.type==='gate'){g.position.set(s.x/TS,b,s.y/TS);g.rotation.y=s.ax?Math.PI/2:0}
 else if(s.sz===1){g.position.set(s.tx+.5,b,s.ty+.5);g.rotation.y=ROTT.has(s.type)&&!s.weapon?(s.rot|0)*Math.PI/2:0}else g.position.set(s.tx,b,s.ty);
 if(s.type==='gate'&&s.gl!==3)mesh.scale.x=(s.gl||2)/2;
 s.door=null;s.flag=null;
 if(s.type==='gate'){const g3=s.gl===3,gk=g3?1:(s.gl||2)/2;(g3?[-1,1]:[-.74*gk,.74*gk]).forEach(x=>{g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?.457:.435,0));g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?-.457:-.435,Math.PI))});let d;if(s.tier===0){const k=g3?1:gk,geo=GEO.doorw||(GEO.doorw=doorGeoW());d=new THREE.Group();d.position.set(0,1.32,0);d.userData.lv=[-1,1].map(sd=>{const pv=new THREE.Group();pv.position.x=sd*.46*k;const m=new THREE.Mesh(geo,matV);m.scale.x=k*.5;m.position.x=-sd*.23*k;m.castShadow=SHADOWS;pv.add(m);d.add(pv);return pv})}else{d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.scale.x=g3?1:gk;d.position.set(0,1.32,0);d.castShadow=SHADOWS}g.add(d);s.door=d;s.dop=s.dop||0}
 if(s.type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='trebuchet'){const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.castShadow=SHADOWS;g.add(a);s.arm=a;a.rotation.y=s.aim||0;const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);cw.castShadow=SHADOWS;a.add(cw);s.cw=cw;a.rotation.order='YXZ';{const P=new THREE.Group();P.position.set(1,0,1);g.add(P);mesh.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(mesh);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'&&s.weapon==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.scale.setScalar(s.sz===2?1:.82);if(s.sz===2)h.position.set(1,gtopOf(s)+.32,1);else h.position.set(0,3.28+.3,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='tower'&&s.weapon==='trebuchet'){const wg=new THREE.Group();if(s.sz===2){wg.scale.setScalar(.7);wg.position.set(.3,gtopOf(s),.3)}else{wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4)}const b2=new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),matV);b2.castShadow=SHADOWS;wg.add(b2);const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.order='YXZ';a.castShadow=SHADOWS;wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);a.add(cw);g.add(wg);s.arm=a;s.cw=cw;{const P=new THREE.Group();P.position.set(1,0,1);wg.add(P);b2.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(b2);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'){if(s.sz===2){[[1,1.86,0],[1,.14,Math.PI],[1.86,1,Math.PI/2],[.14,1,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.4,.72,x,2.75,z,r)))}else[[0,.405,0],[0,-.405,Math.PI],[.405,0,Math.PI/2],[-.405,0,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.3,.5,x,2.0,z,r)))}
 if(s.type==='castle'&&s.sz===5){const st=s.tier!==0,fg=new THREE.Group();fg.position.set(C5.kx,st?C5.flag:C5.wflag,st?C5.kz:1.25);fg.add(bpl(.8,1.1,.43,-.55,0,0));g.add(fg);s.flag=fg;
  if(st){[1.3,3.7].forEach(x=>g.add(bpl(.36,.62,x,2.0,.003,Math.PI)));[[.6,.6,6.6],[4.4,.6,6.6],[.6,4.4,5.85],[4.4,4.4,5.85]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.42,.32,.23,0,0,0));g.add(f2)})}}
 else if(s.type==='castle'){const fg=new THREE.Group();fg.position.set(1.5,8.45,1.18);fg.add(bpl(.7,1.0,.38,-.5,0,0));g.add(fg);s.flag=fg;[.46,2.54].forEach(x=>g.add(bpl(.3,.55,x,2.2,3.007,0)));[1.2,1.8].forEach(x=>g.add(bpl(.34,.6,x,1.45,.044,Math.PI)));
  [[.46,.46,6.25],[2.54,.46,6.25],[.46,2.54,5.5],[2.54,2.54,5.5]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.4,.3,.22,0,0,0));g.add(f2)})}
 if(s.sz>=2){const sz=s.sz,inner=new THREE.Group();while(g.children.length)inner.add(g.children[0]);inner.position.set(-sz/2,0,-sz/2);g.add(inner);g.position.set(s.tx+sz/2,b,s.ty+sz/2);g.rotation.y=(ROTT.has(s.type)&&!s.hm?(s.rot|0):0)*Math.PI/2;}}
const _rcS=new THREE.Raycaster(),_v2S=new THREE.Vector2();
function pickStruct(p){try{_v2S.set(p.x/cv.width*2-1,1-p.y/cv.height*2);_rcS.setFromCamera(_v2S,camera);const L=[],M=new Map();for(const s of structs){if(!s.o3||s.hp<=0)continue;s.o3.traverse(o=>{if(o.isMesh&&o.visible){L.push(o);M.set(o,s)}})}const h=_rcS.intersectObjects(L,false);return h.length?M.get(h[0].object):null}catch(e){return null}}
function addStruct(s){const g=new THREE.Group();s.o3=g;structO.add(g);buildStructMesh(s);scene.add(g)}
function rmStruct(s){if(s.o3){scene.remove(s.o3);structO.delete(s.o3);s.o3=null}}
function refreshNear(s){const seen=new Set(),rw=s.type==='wall'||s.type==='gate'||s.type==='tower'||s.type==='castle'||s.type==='keep';for(const[tx,ty]of s.tiles)for(const[dx,dy]of D8){const o=occ.get((ty+dy)*TW+tx+dx);if(o&&o!==s&&o.o3&&(o.sz===1&&(dx===0||dy===0||o.type==='wall')||(o.type==='tower'&&rw)||(o.type===s.type&&(dx===0||dy===0)&&(o.type==='house'||o.type==='farm'||CONNT.has(o.type))))&&!seen.has(o)){seen.add(o);buildStructMesh(o)}}if(s.o3&&s.hp>0)buildStructMesh(s)}
function addStairs(i,si){const tx=i%TW,ty=(i/TW)|0,df=si.hi-si.lo,n=df,G=newG();
 for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,a=si.sg>0?u0:1-u1,b=si.sg>0?u1:1-u0,h=(k+1)*df/n,c=rgb(k%2?'#a8a9b4':'#8f909c');
  if(si.ax===0)addBox(G,a,0,0,b,h,1,c);else addBox(G,0,0,a,1,h,b,c)}
 const m=new THREE.Mesh(toGeo(G),matV);m.position.set(tx,si.lo,ty);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);stairO.add(m)}
function build3D(){for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();
 for(const g of structO)scene.remove(g);structO.clear();for(const m of stairO){scene.remove(m);m.geometry.dispose()}stairO.clear();
 for(const[,g]of unitG)scene.remove(g);unitG.clear();
 for(const s of structs)addStruct(s);buildRoutes();home();
 const cx0=(CAM.x/CH)|0,cy0=(CAM.z/CH)|0;for(let j=-RM;j<=RM;j++)for(let i=-RM;i<=RM;i++)loadChunk(cx0+i,cy0+j)}
/* ================= Medieval Minecraft buildings: timber frames, stone bricks, steep roofs =================
   (these declarations replace the earlier building models; footprints, door sides and heights are unchanged) */
const MDK='#3b2a1a',MDK2='#4a3523',MSP='#6a4e2e',MSP2='#5a4126',MOK='#a6844f',MOK2='#977648',MPL='#e9e1cc',
 MSB=['#8f8f8f','#848484','#999999','#8a8a8a'],MSB2='#6e6e6e',MCB=['#7b7b7b','#8a8a8a','#6c6c6c','#828282'],MMS=['#6a8a52','#5d7d48'],
 MSL=['#4c4e57','#42444c','#575963'],MRF=['#3f2c1c','#4b3522'],MPU=['#5b3d8a','#4c3175'],MBK=['#904c3b','#7f4233'],MGL='#bfe0f0',MLT='#ffd36a',MIR='#38383f',MLOG='#5a4128',MLOGT='#9c7a48',MBAR='#5b5e66';
/* ---- kit ---- */









/* steep stair roof with plaster gables and a dark ridge beam; returns the ridge top */








/* ---- house (merges with aligned neighbours: bits 1 N, 2 E, 4 S, 8 W) ---- */

/* ---- farm (merges like houses) ---- */

/* ---- storage: timber warehouse with an open porch full of barrels and crates ---- */

/* ---- barracks: stone or timber hall with a training yard (weapon rack + archery target) ---- */



/* ---- academy: stone library with bookshelves, timber upper floor, purple roof and a wizard tower ---- */

/* ---- market: timber stall under a striped awning, goods on the counter, scales, barrels and a coin sign ---- */

/* ---- torch: a post with an iron fire basket that lights the night ---- */

/* ---- walls: stone bricks with a walkway and crenels / spruce log palisade ---- */


/* ---- towers ---- */


/* ---- gates: stone gatehouse with a portcullis / log gatehouse with plank doors ---- */




/* ---- castle (stone): curtain walls, round towers with slate cones, a keep and a gatehouse with portcullis ---- */

/* ---- castle (wood): spruce palisade, log watchtowers and a half-timbered great hall ---- */

/* ---- keep (four merged towers) ---- */

/* ================= REWORKED BUILDINGS (v67): warm limestone, brass, hextech lamps; slate / copper / terracotta roofs =================
   face materials: 1 stone, 2 wood, 3 smooth (plaster, iron, soil), 4 brass, 5 glow, 6 roof tiles, 7 cloth.
   Every 2x2 building merges with aligned neighbours of the same type (bits 1 N, 2 E, 4 S, 8 W): shared walls and roofs, and the
   north-west building of a merged block gets the upgrade (windmill, crane, watch turret, observatory, clock post, dormers). */
const bS=bxm(1),bW=bxm(2),bP=bxm(3),bM=bxm(4),bL=bxm(5),bR=bxm(6),bC=bxm(7);
const QS=['#d6c196','#cbb58a','#dfcba2','#c4ad82'],QSD='#9b8565',QSD2='#7f6c52',QTR='#ebdab2',QW1='#7a5333',QW2='#5a3b23',QW3='#9a6c40',QPL='#efe3c6',QIR='#3b3b45',QBR='#c9a24f',QBR2='#e8c873',QHX='#62e4ff',QFI='#ffb24a',QGL='#a9cbd9',
 QSL=['#66615f','#5b5755','#716c69'],QCU=['#3f7e74','#376f67','#4a8b81'],QTC=['#a8563c','#954a33','#b66246'],QMS='#6c8a4c',QBK=['#9a5442','#87493a'],QLOG='#6b4a2c',QLOGT='#a8814f';
const qab=(f,G,dx,dz,t,l,y,a,b,h,c)=>f(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);
const qP=(G,x,y,z,ax,n)=>(f,dx,dy,dn,w,h,dd,c)=>ax?f(G,x+dx,y+dy,z+n*dn,w,h,dd,c):f(G,x+n*dn,y+dy,z+dx,dd,h,w,c);
function qStone(G,x,y0,z,w,d,h,o){o=o||{};const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k++)bS(G,x,y0+k*q,z,w,q,d,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}
function qPlinth(G,x,y0,z,w,d,h){bS(G,x,y0,z,w,h,d,QSD);bS(G,x,y0+h,z,w-.04,.04,d-.04,QSD2)}
function qCornice(G,x,y,z,w,d,h){bS(G,x,y,z,w,h||.07,d,QTR)}
function qQuoin(G,x0,z0,x1,z1,y0,h){const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k+=2)for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bS(G,x,y0+k*q,z,.13,q,.13,QTR)}
function qWin(G,x,y,z,ax,n,o){o=o||{};const W=o.w||.2,H=o.h||.3,P=qP(G,x,y,z,ax,n),mf=o.wood?bW:bS,fr=o.wood?QW2:QTR,gc=o.glow?'#ffd98c':QGL,gf=o.glow?bL:bP;
 P(gf,0,0,0,W,H,.03,gc);P(gf,0,H,0,W*.56,.05,.03,gc);
 P(mf,0,-.05,.012,W+.1,.05,.06,fr);P(mf,-W/2-.03,0,.012,.05,H,.05,fr);P(mf,W/2+.03,0,.012,.05,H,.05,fr);
 P(mf,-W*.36,H,.012,W*.3,.05,.05,fr);P(mf,W*.36,H,.012,W*.3,.05,.05,fr);P(mf,0,H+.05,.012,W*.62,.05,.05,fr);if(!o.wood)P(bS,0,H+.08,.018,.07,.07,.06,QTR);
 P(bP,0,0,.016,.022,H,.02,QIR);P(bP,0,H*.5,.016,W,.02,.02,QIR);
 if(o.shut){P(bW,-W/2-.1,0,.022,.1,H,.03,o.sc||QW1);P(bW,W/2+.1,0,.022,.1,H,.03,o.sc||QW1)}
 if(o.box){P(bW,0,-.12,.06,W+.08,.07,.1,QW2);[[-.06,'#c8282a'],[0,'#f0d020'],[.06,'#e05a8a']].forEach(([a,c])=>P(bP,a,-.05,.06,.045,.05,.045,c));P(bP,-.03,-.05,.07,.03,.04,.03,'#4a8e32');P(bP,.03,-.05,.07,.03,.04,.03,'#4a8e32')}}
function qLamp(G,x,y,z,hex){bP(G,x,y+.06,z,.02,.06,.02,QIR);bM(G,x,y+.04,z,.1,.025,.1,QBR);bL(G,x,y-.06,z,.07,.1,.07,hex?QHX:QFI);bM(G,x,y-.09,z,.1,.03,.1,QBR);bM(G,x,y-.12,z,.03,.03,.03,QBR)}
function qPost(G,x,y,z,h,hex){bS(G,x,y,z,.16,.1,.16,QSD);bM(G,x,y+.1,z,.05,h,.05,QBR);bM(G,x,y+.1+h,z,.12,.03,.12,QBR);bL(G,x,y+.13+h,z,.09,.12,.09,hex?QHX:QFI);bM(G,x,y+.25+h,z,.12,.03,.12,QBR);bM(G,x,y+.28+h,z,.04,.06,.04,QBR)}
function qDoor(G,x,z,ax,n,o){o=o||{};const y0=o.y==null?.18:o.y,W=o.w||.32,H=o.h||.56,P=qP(G,x,y0,z,ax,n),fr=o.wood?bW:bS,fc=o.wood?QW2:QTR;
 P(fr,0,0,0,W+.12,H+.06,.04,fc);P(fr,0,H+.06,0,W*.78,.06,.05,fc);if(!o.wood)P(bS,0,H+.1,.006,.1,.08,.06,QTR);
 P(bW,0,0,.012,W,H,.04,o.c||QW1);P(bW,0,H,.012,W*.62,.05,.04,o.c||QW1);for(const a of[-W/3,0,W/3])P(bW,a,0,.03,.015,H,.01,QW2);
 P(bP,0,H*.22,.035,W,.035,.01,QIR);P(bP,0,H*.72,.035,W,.035,.01,QIR);P(bM,W*.3,H*.45,.04,.045,.045,.03,QBR);
 P(bS,0,-.06,.1,W+.16,.06,.16,QSD);if(o.lamp)qLamp(G,ax?x+W/2+.13:x+n*.09,y0+H+.08,ax?z+n*.09:z+W/2+.13,o.hex)}
function qBan(G,x,y,z,ax,n,w,h){w=w||.22;h=h||.5;const P=qP(G,x,y,z,ax,n);
 P(bM,0,0,.035,w+.08,.035,.035,QBR);P(bC,0,-h,.02,w,h,.02,BLU);P(bC,0,-h-.06,.02,w*.46,.06,.02,BLU);P(bM,0,-h+.04,.033,w,.03,.01,QBR2);P(bC,0,-h*.6,.033,.05,h*.38,.01,'#f4ecd8');P(bC,0,-h*.45,.033,w*.6,.045,.01,'#f4ecd8')}
function qFlag(G,x,y,z,h){h=h||.7;bP(G,x,y,z,.045,h,.045,QIR);bM(G,x,y+h,z,.08,.08,.08,QBR2);bC(G,x+.16,y+h-.3,z,.28,.22,.025,BLU);bC(G,x+.32,y+h-.27,z,.06,.15,.025,BLU)}
function qGem(G,x,y,z,ax,n,s){s=s||.12;const P=qP(G,x,y,z,ax,n);P(bM,0,-s*.25,0,s*1.6,s*1.5,.04,QBR);P(bL,0,0,.022,s,s,.04,QHX)}
function qMerl(G,x0,z0,x1,z1,y,h,step){step=step||.3;const s=.15,put=(x,z)=>{bS(G,x,y,z,s,h,s,QS[0]);bS(G,x,y+h,z,s+.02,.035,s+.02,QTR)};
 for(let x=x0+s/2;x<=x1-s/2+1e-6;x+=step){put(x,z0+s/2);put(x,z1-s/2)}for(let z=z0+s/2+step;z<=z1-s/2-step+1e-6;z+=step){put(x0+s/2,z);put(x1-s/2,z)}}
function qSlit(G,x,y,z,ax){bP(G,x,y,z,ax?.06:.03,.28,ax?.03:.06,'#1b1a20');bS(G,x,y+.28,z,ax?.12:.035,.035,ax?.035:.12,QTR)}
function qRound(G,x,z,y0,h,R,o){o=o||{};const n=Math.max(1,Math.round(h/.25)),q=h/n;for(let k=0;k<n;k++){const c=o.moss&&k===0?QMS:QS[k%4];bS(G,x,y0+k*q,z,R,q,R*.7,c);bS(G,x,y0+k*q,z,R*.7,q,R,c)}}
function qRing(G,x,z,y,R,h,c,f){(f||bS)(G,x,y,z,R,h,R*.7,c);(f||bS)(G,x,y,z,R*.7,h,R,c)}
function qCone(G,x,z,y0,R,cols,st){st=st||.15;let k=0;for(let a=R;a>.1;a-=st,k++){const c=cols[k%cols.length];bR(G,x,y0+k*.18,z,a,.18,a*.72,c);bR(G,x,y0+k*.18,z,a*.72,.18,a,c)}return y0+k*.18}
function qPyr(G,x,z,y0,w,d,cols,st,rs){st=st||.17;rs=rs||.1;let k=0;for(let a=w,b=d;a>.1&&b>.1;a-=2*rs,b-=2*rs,k++)bR(G,x,y0+k*st,z,a,st,b,cols[k%cols.length]);return y0+k*st}
function qRoof(G,cx,cz,len,span,y0,cols,alongX,o){o=o||{};const rise=o.rise||.22,run=o.run||.18,ov0=o.ov0==null?.12:o.ov0,ov1=o.ov1==null?.12:o.ov1,g0=o.g0!==false,g1=o.g1!==false,FL=o.fill||QPL,gf=o.stone?bS:bP;
 const L=len+ov0+ov1,ca=(ov1-ov0)/2,put=(f,al,la,y,lA,wd,h,c)=>alongX?f(G,cx+al,y,cz+la,lA,h,wd,c):f(G,cx+la,y,cz+al,wd,h,lA,c);
 let half=span/2+(o.side==null?.1:o.side),k=0;
 for(;half>run*1.05;k++,half-=run){const y=y0+k*rise,c=cols[k%cols.length];put(bR,ca,half-run/2,y,L,run+.012,rise,c);put(bR,ca,-(half-run/2),y,L,run+.012,rise,c);
  put(bR,ca,half-.012,y-.012,L,.035,.035,lighten(c,.14));put(bR,ca,-(half-.012),y-.012,L,.035,.035,lighten(c,.14));
  const inner=2*(half-run);if(inner>.02){if(g0)put(gf,-len/2+.05,0,y,.08,inner,rise,FL);if(g1)put(gf,len/2-.05,0,y,.08,inner,rise,FL)}}
 const yt=y0+k*rise,rw=Math.max(.12,2*half);put(bR,ca,0,yt,L,rw+.012,rise*.6,cols[k%cols.length]);put(bM,ca,0,yt+rise*.6,L+.02,.08,.06,o.ridge||QBR);
 if(o.fin){if(g0)put(bM,-len/2-ov0+.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2);if(g1)put(bM,len/2+ov1-.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2)}
 if(!o.stone){const F=o.frame||QW2;if(g0)put(bW,-len/2+.03,0,y0,.05,span,.06,F);if(g1)put(bW,len/2-.03,0,y0,.05,span,.06,F)}
 return yt+rise*.6+.06}
function qTimber(G,x0,z0,x1,z1,y0,y1,o){o=o||{};const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,h=y1-y0,F=o.frame||QW2,t=.07,p=.03,sk=o.skip||'';
 bP(G,cx,y0,cz,w,h,d,o.fill||QPL);
 const face=(nm,fx,fz,L,ax)=>{if(sk.includes(nm))return;const W=ax?L:p,D=ax?p:L;bW(G,fx,y0,fz,W,t,D,F);bW(G,fx,y1-t,fz,W,t,D,F);
  const n=Math.max(1,Math.round(L/(o.span||.5)));for(let i=0;i<=n;i++){const a=-L/2+t/2+i*(L-t)/n;bW(G,ax?fx+a:fx,y0,ax?fz:fz+a,ax?t:p,h,ax?p:t,F)}
  if(o.brace&&h>.35){const pw=(L-t)/n;for(let i=0;i<n;i++){if((i+(nm==='N'||nm==='E'?1:0))%2)continue;const st=4,bw=(pw-t)/st,bh=(h-2*t)/st,a0=-L/2+t+i*pw;
    for(let s=0;s<st;s++){const aa=a0+s*bw+bw/2,yy=y0+t+(i%4<2?s:(st-1-s))*bh;bW(G,ax?fx+aa:fx,yy,ax?fz:fz+aa,ax?bw+.012:p,bh,ax?p:bw+.012,F)}}}};
 face('N',cx,z0-p/2,w+2*p,true);face('S',cx,z1+p/2,w+2*p,true);face('W',x0-p/2,cz,d+2*p,false);face('E',x1+p/2,cz,d+2*p,false)}
function qChim(G,x,z,y0,h){const n=Math.max(1,Math.round(h/.18));for(let k=0;k<n;k++)bS(G,x,y0+k*h/n,z,.24,h/n,.24,QBK[k%2]);bS(G,x,y0+h,z,.29,.05,.29,QTR);bP(G,x,y0+h+.05,z,.13,.05,.13,'#262222')}
function qBarrel(G,x,z,y){y=y||0;bW(G,x,y,z,.26,.34,.26,'#8a6038');bP(G,x,y+.06,z,.275,.035,.275,QIR);bP(G,x,y+.26,z,.275,.035,.275,QIR);bW(G,x,y+.34,z,.22,.012,.22,'#6a4a2a')}
function qCrate(G,x,z,y,s){bW(G,x,y,z,s,s,s,'#a87e4c');bW(G,x,y,z,s+.012,.035,s+.012,QW2);bW(G,x,y+s-.035,z,s+.012,.035,s+.012,QW2);bW(G,x,y,z,s*.18,s,s+.012,QW2)}
const mBits=m=>({N:m&1,E:m&2,S:m&4,W:m&8,sk:((m&1)?'N':'')+((m&2)?'E':'')+((m&4)?'S':'')+((m&8)?'W':''),nw:!(m&1)&&!(m&8)&&!!(m&6)});
/* ---- house: stone ground floor, plastered timber upper floor (colour varies), terracotta roof; merged rows get dormers ---- */
function houseGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk}=mBits(m),alongX=!((N||S)&&!(E||W)),FL=['#efe3c6','#ecd3a2','#dde3e3','#f0d8c6'][(m*5+1)%4];
 const fx0=W?0:.06,fx1=E?2:1.94,fz0=N?0:.06,fz1=S?2:1.94;qPlinth(G,(fx0+fx1)/2,0,(fz0+fz1)/2,fx1-fx0,fz1-fz0,.16);
 const x0=W?0:.24,x1=E?2:1.76,z0=N?0:.24,z1=S?2:1.76;qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,.3);
 qTimber(G,x0,z0,x1,z1,.5,1.0,{skip:sk,fill:FL});
 const j=.07,jx0=W?0:x0-(alongX?0:j),jx1=E?2:x1+(alongX?0:j),jz0=N?0:z0-(alongX?j:0),jz1=S?2:z1+(alongX?j:0);
 bW(G,(jx0+jx1)/2,1.0,(jz0+jz1)/2,jx1-jx0,.08,jz1-jz0,QW2);qTimber(G,jx0,jz0,jx1,jz1,1.08,1.6,{skip:sk,brace:true,fill:FL});
 const dr=!S?'S':!N?'N':!E?'E':!W?'W':null,wo={wood:1,shut:1,box:1};
 if(!S){qWin(G,.5,.58,z1+.016,true,1,wo);qWin(G,1.5,.58,z1+.016,true,1,wo);qWin(G,.62,1.2,jz1+.016,true,1,{wood:1});qWin(G,1.38,1.2,jz1+.016,true,1,{wood:1});if(dr==='S')qDoor(G,1,z1+.016,true,1,{wood:1,lamp:1})}
 if(!N){qWin(G,.62,1.2,jz0-.016,true,-1,{wood:1});qWin(G,1.38,1.2,jz0-.016,true,-1,{wood:1});if(dr==='N')qDoor(G,1,z0-.016,true,-1,{wood:1,lamp:1});else qWin(G,1,.58,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E){qWin(G,jx1+.016,1.2,1,false,1,{wood:1});if(dr==='E')qDoor(G,x1+.016,1,false,1,{wood:1,lamp:1});else qWin(G,x1+.016,.58,1,false,1,wo)}
 if(!W){qWin(G,jx0-.016,1.2,1,false,-1,{wood:1});if(dr==='W')qDoor(G,x0-.016,1,false,-1,{wood:1,lamp:1});else qWin(G,x0-.016,.58,1,false,-1,wo)}
 let top;if(alongX)top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jx1-jx0,jz1-jz0,1.6,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fill:FL});
 else top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jz1-jz0,jx1-jx0,1.6,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1,fill:FL});
 if(alongX&&!E)qChim(G,x1-.24,(z0+z1)/2-.4,1.0,top-.85);else if(!alongX&&!S)qChim(G,(x0+x1)/2+.4,z1-.24,1.0,top-.85);
 if(m&&alongX&&!S){const dz=jz1-.3,dy=1.66;bP(G,1,dy,dz,.38,.32,.36,FL);bW(G,1,dy,dz+.18,.42,.05,.02,QW2);qWin(G,1,dy+.06,dz+.185,true,1,{wood:1,w:.16,h:.18});qPyr(G,1,dz,dy+.32,.5,.48,QTC,.1,.1)}
 return toGeo(G)}
/* ---- farm: crop rows, fences on the outer sides, scarecrow, hay; a merged field gets a windmill ---- */
function farmGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#6e4a2c');
 const mill=nw?[.42,.42]:null;
 for(let r=0;r<5;r++){const z=.22+r*.39;if(r===2){bP(G,1,.06,z,2,.05,.22,'#3a6fd0');continue}bP(G,1,.1,z,2,.03,.26,'#4a3020');
  for(let i=0;i<7;i++){const x=.15+i*.285,gr=(i*3+r*5)%4;if(mill&&x<.85&&z<.85)continue;
   if(r%2===0){const h=.12+gr*.07,c=gr>=3?'#d8b43a':gr===2?'#b8b040':'#5e9a36';bxc(G,x-.05,.13,z-.05,.035,h,.035,c);bxc(G,x+.05,.13,z+.05,.035,h,.035,c);if(gr>=2)bxc(G,x,.13+h,z,.07,.05,.07,gr>=3?'#e8c84a':'#c8c050')}
   else{bxc(G,x,.13,z,.12,.08,.1,'#4a8e32');bxc(G,x,.2,z,.06,.06,.06,'#5ea83e');if(gr>=2)bxc(G,x,.12,z+.05,.06,.03,.03,'#e07a1a')}}}
 const fence=(ax,fixed)=>{for(let i=0;i<=8;i++){const t=.06+i*.235;ax?bW(G,t,.1,fixed,.08,.42,.08,QW1):bW(G,fixed,.1,t,.08,.42,.08,QW1);ax?bW(G,t,.52,fixed,.05,.04,.05,QW3):bW(G,fixed,.52,t,.05,.04,.05,QW3)}for(const y of[.26,.42])ax?bW(G,1,y,fixed,1.9,.05,.04,QW3):bW(G,fixed,y,1,.04,.05,1.9,QW3)};
 if(!N)fence(true,.04);if(!S)fence(true,1.96);if(!W)fence(false,.04);if(!E)fence(false,1.96);
 if(!N&&!E){const x=1.74,z=.32;bW(G,x,.1,z,.05,.62,.05,QW1);bW(G,x,.5,z,.42,.05,.05,QW1);bC(G,x,.4,z,.18,.2,.12,'#b8542e');bC(G,x,.7,z,.18,.17,.18,'#e0b05a');bP(G,x-.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bP(G,x+.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bC(G,x,.87,z,.26,.04,.26,HAYC);bC(G,x,.91,z,.12,.08,.12,HAYC)}
 if(!S&&!W){bW(G,.32,.1,1.7,.3,.3,.3,QW1);bP(G,.32,.36,1.7,.24,.05,.24,'#5a3a1a');bP(G,.32,.4,1.7,.18,.02,.18,'#6b8a3a')}
 if(!S&&!E){bC(G,1.66,.1,1.66,.38,.36,.38,HAYC);bC(G,1.66,.24,1.66,.4,.07,.4,'#a98a2a');bC(G,1.36,.1,1.74,.24,.24,.24,HAYC)}
 if(mill){const[x,z]=mill;qRound(G,x,z,.1,1.3,.74,{moss:1});qRing(G,x,z,.7,.78,.05,QW2,bW);bW(G,x,1.4,z,.82,.07,.82,QW2);qCone(G,x,z,1.47,.86,QTC,.16);
  qDoor(G,x,z+.37,true,1,{wood:1,y:.1,w:.2,h:.36});qWin(G,x+.37,.8,z,false,1,{wood:1,w:.12,h:.18});const hy=1.3,hz=z+.47;bW(G,x,hy-.04,hz-.06,.1,.1,.16,QW2);bM(G,x,hy-.03,hz+.03,.07,.07,.04,QBR);
  for(const[ax,sg]of[[0,1],[0,-1],[1,1],[1,-1]]){const L=1.0;if(ax)bW(G,x+sg*L/2,hy,hz+.04,L,.04,.03,QW2);else bW(G,x,hy+(sg>0?0:-L)+.02,hz+.04,.04,L,.03,QW2);
   if(ax)bC(G,x+sg*(L/2+.02),hy+(sg>0?.03:-.15),hz+.05,L*.82,.12,.015,'#efe6d0');else bC(G,x+(sg>0?-.09:.09),hy+(sg>0?.1:-L+.1),hz+.05,.12,L*.82,.015,'#efe6d0')}}
 return toGeo(G)}
/* ---- storage: warehouse with stone footing, timber walls and a terracotta roof; merged halls share the roof and the north-west one hoists crates ---- */
function storageGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W));
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.12,z1=S?2:1.56;qPlinth(G,(x0+x1)/2,0,(z0+z1)/2,x1-x0+(W?0:.06)+(E?0:.06),z1-z0+(N?0:.06)+(S?0:.06),.14);
 qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.3,{moss:1});qTimber(G,x0,z0,x1,z1,.48,1.18,{skip:sk,brace:true,fill:'#e8d8b4'});
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.18,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.18,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1});
 if(!S){const P=qP(G,1,.18,z1+.016,true,1);P(bW,0,0,0,.72,.66,.04,QW2);P(bW,-.17,0,.012,.32,.6,.04,QW1);P(bW,.17,0,.012,.32,.6,.04,QW1);P(bW,-.17,0,.032,.3,.03,.01,QW2);P(bW,.17,0,.032,.3,.03,.01,QW2);
  for(const a of[-.17,.17]){P(bW,a,.3,.032,.03,.42,.01,QW2)}P(bP,0,.3,.04,.6,.035,.01,QIR);qLamp(G,1.48,.98,z1+.09,false);qWin(G,.4,.62,z1+.016,true,1,{wood:1,shut:1});qWin(G,1.62,.62,z1+.016,true,1,{wood:1,shut:1});
  qBarrel(G,.36,1.8);qBarrel(G,.64,1.86);qCrate(G,1.42,1.8,0,.26);qCrate(G,1.7,1.84,0,.22);qCrate(G,1.47,1.8,.26,.2);bC(G,1.06,0,1.86,.2,.16,.16,'#cbb88a')}
 if(!N){qWin(G,.6,.66,z0-.016,true,-1,{wood:1,shut:1});qWin(G,1.4,.66,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E)qWin(G,x1+.016,.66,(z0+z1)/2,false,1,{wood:1,shut:1});if(!W)qWin(G,x0-.016,.66,(z0+z1)/2,false,-1,{wood:1,shut:1});
 if(nw){const hy=top-.5;if(alongX){bW(G,x0-.22,hy,(z0+z1)/2,.56,.08,.08,QW2);bP(G,x0-.46,hy-.36,(z0+z1)/2,.015,.36,.015,ROPE);qCrate(G,x0-.46,(z0+z1)/2,hy-.62,.22);bW(G,x0-.05,hy-.3,(z0+z1)/2,.05,.32,.05,QW2)}
  else{bW(G,(x0+x1)/2,hy,z0-.22,.08,.08,.56,QW2);bP(G,(x0+x1)/2,hy-.36,z0-.46,.015,.36,.015,ROPE);qCrate(G,(x0+x1)/2,z0-.46,hy-.62,.22)}}
 return toGeo(G)}
/* ---- barracks: stone (slate roof) or timber (terracotta) hall with a training yard; merged halls get a watch turret ---- */
function mdBarracks(stone,m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m);
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.14,z1=S?2:1.5;qPlinth(G,1,0,1,2,2,.14);
 if(stone){qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.92,{moss:1});if(!m)qQuoin(G,x0,z0,x1,z1,.18,.92);qCornice(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0+.04,z1-z0+.04,.08)}
 else{qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.25);qTimber(G,x0,z0,x1,z1,.43,1.1,{skip:sk,fill:'#e6d6b2'});bW(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0,.08,z1-z0,QW2)}
 qTimber(G,x0,z0-(N?0:.07),x1,z1+(S?0:.07),1.18,1.7,{skip:sk,brace:true,fill:stone?'#e2d6bc':'#e6d6b2'});
 const top=qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0+(N?0:.07)+(S?0:.07),1.7,stone?QSL:WRF,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fin:stone});
 if(!S){qDoor(G,1,z1+.016,true,1,{w:.42,h:.64,y:.18,wood:!stone});if(stone)qGem(G,1,1.0,z1+.02,true,1,.09);qBan(G,.42,1.04,z1,true,1);qBan(G,1.58,1.04,z1,true,1);qLamp(G,.72,.98,z1+.07,stone);qLamp(G,1.28,.98,z1+.07,stone);
  qWin(G,.55,1.32,z1+.086,true,1,{wood:1});qWin(G,1.45,1.32,z1+.086,true,1,{wood:1});
  for(const x of[.22,.72])bW(G,x,.14,1.8,.06,.56,.06,QW2);bW(G,.47,.6,1.8,.56,.05,.06,QW2);[.32,.47,.62].forEach(x=>{bM(G,x,.26,1.84,.035,.3,.02,'#dadde4');bM(G,x,.52,1.84,.1,.03,.03,QBR);bW(G,x,.55,1.84,.03,.07,.03,QW1)});
  bC(G,.88,.14,1.84,.08,.3,.24,BLU);bM(G,.925,.2,1.84,.01,.18,.06,QBR2);
  bW(G,1.55,.14,1.82,.06,.3,.06,QW2);bC(G,1.55,.32,1.82,.36,.36,.14,HAYC);bC(G,1.55,.34,1.893,.3,.3,.01,'#f0f0f0');bC(G,1.55,.39,1.896,.2,.2,.01,'#c8282a');bC(G,1.55,.44,1.899,.1,.1,.01,'#f0f0f0');bC(G,1.55,.47,1.902,.04,.04,.01,'#c8282a')}
 if(!N){qWin(G,.55,1.32,z0-.086,true,-1,{wood:1});qWin(G,1.45,1.32,z0-.086,true,-1,{wood:1});if(stone){qSlit(G,.45,.55,z0-.016,true);qSlit(G,1.55,.55,z0-.016,true)}}
 if(!W){if(stone)qSlit(G,x0-.016,.55,(z0+z1)/2,false);else qWin(G,x0-.016,.6,(z0+z1)/2,false,-1,{wood:1,shut:1})}
 if(!E){if(stone)qSlit(G,x1+.016,.55,(z0+z1)/2,false);else qWin(G,x1+.016,.6,(z0+z1)/2,false,1,{wood:1,shut:1})}
 if(nw){const tx=x0+.3,tz=z0+.3;if(stone){qRound(G,tx,tz,.18,3.1,.5,{moss:1});qRing(G,tx,tz,3.28,.62,.08,QTR);for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]]){bS(G,tx+a*.25,3.36,tz+b*.25,.12,.18,.12,QS[0]);bS(G,tx+a*.25,3.54,tz+b*.25,.14,.03,.14,QTR)}qRing(G,tx,tz,2.2,.56,.05,QBR,bM);qFlag(G,tx,3.36,tz,.8)}
  else{for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.2,.14,tz+b*.2,.1,3.0,.1,QLOG);bW(G,tx,3.0,tz,.6,.08,.6,QW2);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.27,3.08,tz+b*.27,.05,.3,.05,QW1);const t=qPyr(G,tx,tz,3.4,.72,.72,WRF,.14,.1);qFlag(G,tx,t,tz,.6)}}
 else if(!m)qFlag(G,1,top-.02,(z0+z1)/2);
 return toGeo(G)}
function barracksGeo(m){return mdBarracks(true,m)}
function woodBarracksGeo(m){return mdBarracks(false,m)}
/* ---- academy: limestone library with arched glowing windows, a portico and a copper roof; its tower becomes a hextech observatory when merged ---- */
function academyGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W)),tw=!m||nw;
 const x0=W?0:.16,x1=E?2:1.84,z0=N?0:.3,z1=S?2:1.66;qPlinth(G,1,0,1,2,2,.16);
 qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,1.1);if(!m)qQuoin(G,x0,z0,x1,z1,.2,1.1);qCornice(G,(x0+x1)/2,1.3,(z0+z1)/2,x1-x0+.06,z1-z0+.06,.08);
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.38,QCU,true,{ov0:W?0:.1,ov1:E?0:.1,g0:!W,g1:!E,side:(N||S)?0:.08,stone:1,fill:QS[2],fin:1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.38,QCU,false,{ov0:N?0:.1,ov1:S?0:.1,g0:!N,g1:!S,side:(E||W)?0:.08,stone:1,fill:QS[2],fin:1});
 const wins=(n,ax,fixed,a0,a1)=>{for(let a=a0;a<=a1+1e-6;a+=.42){qWin(G,ax?a:fixed,.5,ax?fixed:a,ax,n,{glow:1,w:.18,h:.42})}};
 if(!S){wins(1,true,z1+.016,.36,.6);wins(1,true,z1+.016,1.4,1.64);bS(G,1,.2,z1+.12,.62,.06,.24,QTR);bS(G,1,.26,z1+.08,.52,.06,.16,QTR);
  for(const x of[.74,1.26]){bS(G,x,.32,z1+.14,.1,.9,.1,QTR);bS(G,x,1.2,z1+.14,.14,.06,.14,QTR)}bS(G,1,1.26,z1+.14,.68,.08,.18,QTR);qPyr(G,1,z1+.12,1.34,.72,.24,[QTR,QS[2]],.1,.08);
  qDoor(G,1,z1+.016,true,1,{y:.32,w:.3,h:.6});qGem(G,1,1.12,z1+.24,true,1,.09);qPost(G,.5,.2,z1+.24,.4,true);qPost(G,1.5,.2,z1+.24,.4,true)}
 if(!N)wins(-1,true,z0-.016,.4,1.6);if(!E)wins(1,false,x1+.016,z0+.25,z1-.25);if(!W&&!tw)wins(-1,false,x0-.016,z0+.25,z1-.25);
 if(tw){const tx=x0+.3,tz=z0+.3,H=nw?2.6:2.3;qRound(G,tx,tz,.2,H,.6,{moss:1});qRing(G,tx,tz,.2+H,.7,.08,QTR);qRing(G,tx,tz,1.5,.64,.05,QBR,bM);
  for(const a of[0,1])qWin(G,tx,1.1+a*.7,tz+.31,true,1,{glow:1,w:.12,h:.26});
  if(nw){const y=.28+H;qRing(G,tx,tz,y,.62,.1,QBR,bM);for(let k=0;k<4;k++){const r=.5-k*.11;qRing(G,tx,tz,y+.1+k*.13,r,.13,k%2?QCU[0]:QCU[2],bR)}bL(G,tx,y+.18,tz,.26,.3,.26,QHX);
   for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]])bM(G,tx+a*.28,y+.1,tz+b*.28,.04,.5,.04,QBR);bM(G,tx,y+.66,tz,.08,.2,.08,QBR2);bL(G,tx,y+.86,tz,.07,.07,.07,QHX)}
  else{const t=qCone(G,tx,tz,.28+H,.72,QCU);bM(G,tx,t,tz,.06,.18,.06,QBR2);bL(G,tx,t+.18,tz,.07,.07,.07,QHX)}}
 return toGeo(G)}
/* ---- forester's hut: a mossy log cabin with a sapling nursery, a log pile and a chopping stump; front = +z ---- */
const QMOSS=['#5b7a3e','#4d6a35','#668845'];
function foresterGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.11,cz,L,D,.16);for(let k=0;k<5;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25';if(ax){bW(G,cx,y,b0+.04,L,.13,.09,c);bW(G,cx,y,b1-.04,L,.13,.09,c)}else{bW(G,a0+.04,y,cz,.09,.13,D,c);bW(G,a1-.04,y,cz,.09,.13,D,c)}}
  bW(G,cx,.97,cz,L,.05,D,QW2);qRoof(G,cx,cz,ax?L:D,ax?D:L,1.0,QMOSS,ax,{rise:.13,run:.12,fill:'#8a6a42',ov0:0,ov1:0,side:.08,ridge:QW2,g0:false,g1:false})};
 if(hm&2)wing(1.26,2,.36,.9,true);if(hm&8)wing(0,.22,.36,.9,true);if(hm&1)wing(.96,1.3,0,.32,false);if(hm&4)wing(.96,1.3,1.24,2,false);bP(G,1,0,1,2,.08,2,'#5f6f38');bP(G,1,.08,1,1.94,.03,1.94,'#6f8a44');
 /* cabin of horizontal logs */
 const x0=.18,x1=1.3,z0=.28,z1=1.28,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.11,zc,x1-x0+.08,z1-z0+.08,.16);
 for(let k=0;k<6;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25',L=x1-x0,D=z1-z0;bW(G,xc,y,z1-.04,L+(k%2?.12:0),.13,.09,c);bW(G,xc,y,z0+.04,L+(k%2?.12:0),.13,.09,c);bW(G,x0+.04,y,zc,.09,.13,D+(k%2?0:.12),c);bW(G,x1-.04,y,zc,.09,.13,D+(k%2?0:.12),c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])for(let k=0;k<6;k+=2)bW(G,x,.27+k*.14,z,.12,.13,.12,QLOGT);
 qDoor(G,.6,z1+.016,true,1,{y:.27,w:.26,h:.5,wood:1,lamp:1});if(!(hm&4))qWin(G,1.02,.55,z1+.016,true,1,{wood:1,shut:1,glow:1,w:.16,h:.2});if(!(hm&8))qWin(G,x0-.016,.55,zc,false,-1,{wood:1,shut:1,glow:1,w:.16,h:.2});
 const rt=qRoof(G,xc,zc,x1-x0,z1-z0,1.11,QMOSS,true,{rise:.17,run:.13,fill:'#8a6a42',ov0:.1,ov1:.1,side:.12,ridge:QW2});
 qChim(G,.42,.52,.8,rt-.62);
 /* nursery: saplings in planters, the tallest at the back */
 for(let r=(hm&2)?2:0;r<3;r++)for(let c=0;c<2;c++){const x=1.55+c*.28,z=.42+r*.42,h=.16+(2-r)*.07+c*.03;bW(G,x,.11,z,.22,.1,.22,QW1);bP(G,x,.21,z,.18,.02,.18,'#4a3020');
  bW(G,x,.23,z,.03,h,.03,'#6b4a2c');bC(G,x,.23+h,z,.13,.11,.13,r===1?'#5fa845':'#4f9a3c');bC(G,x,.34+h,z,.07,.06,.07,'#6fbe52')}
 if(!(hm&2)){for(let k=0;k<=5;k++){bW(G,1.98,.11,.25+k*.3,.05,.22,.05,QW1)}bW(G,1.98,.26,1,.03,.04,1.55,QW3)}
 /* yard: log pile, chopping stump with an axe, a watering can */
 for(let k=0;k<3;k++){bW(G,.42+k*.17,.11,1.66,.16,.16,.42,QLOG);bW(G,.42+k*.17,.11,1.876,.12,.12,.012,QLOGT)}for(let k=0;k<2;k++){bW(G,.5+k*.17,.27,1.66,.16,.16,.42,QLOG);bW(G,.5+k*.17,.27,1.876,.12,.12,.012,QLOGT)}
 if(!(hm&4)){bW(G,1.25,.11,1.68,.24,.18,.24,'#7a5a34');bW(G,1.25,.29,1.68,.2,.01,.2,QLOGT);bW(G,1.25,.3,1.62,.03,.03,.2,'#9a6a34');bM(G,1.25,.33,1.71,.02,.08,.1,'#b9c0cc')}
 bM(G,1.62,.11,1.72,.12,.1,.09,QBR);bM(G,1.68,.17,1.72,.08,.02,.02,QBR2);
 return toGeo(G)}
/* ---- builders' guild: a timber workshop on a stone base, a treadwheel crane lifting a block, cut stone and planks in the yard ---- */
function guildGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.13,cz,L,D,.42);qTimber(G,a0,b0,a1,b1,.55,1.25,{brace:true,fill:'#e8d6b0',skip:ax?'EW':'NS'});bW(G,cx,1.25,cz,L,.06,D,QW2);
  qRoof(G,cx,cz,ax?L:D,ax?D:L,1.31,QSL,ax,{rise:.17,run:.13,ov0:0,ov1:0,side:.08,g0:false,g1:false})};
 if(hm&2)wing(1.31,2,.32,.9,true);if(hm&8)wing(0,.19,.32,.9,true);if(hm&1)wing(.95,1.3,0,.24,false);if(hm&4)wing(.95,1.3,1.26,2,false);qPlinth(G,1,0,1,2,2,.1);bS(G,1,.1,1,1.9,.03,1.9,QS[2]);
 const x0=.15,x1=1.35,z0=.2,z1=1.3,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.13,zc,x1-x0,z1-z0,.42);qQuoin(G,x0,z0,x1,z1,.13,.42);
 qTimber(G,x0,z0,x1,z1,.55,1.25,{brace:true,fill:'#e8d6b0'});bW(G,xc,1.25,zc,x1-x0+.08,.06,z1-z0+.08,QW2);qTimber(G,x0-.04,z0-.04,x1+.04,z1+.04,1.31,1.86,{fill:'#efe3c6',skip:'N'});
 const rt=qRoof(G,xc,zc,x1-x0+.08,z1-z0+.08,1.86,QSL,true,{rise:.2,run:.15,ov0:.12,ov1:.12,fin:1});
 qDoor(G,.55,z1+.016,true,1,{y:.13,w:.36,h:.62,wood:1,lamp:1});if(!(hm&4))qWin(G,1.08,.36,z1+.016,true,1,{wood:1,shut:1,box:1,w:.18,h:.18});
 qWin(G,.45,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,1.05,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,x1+.056,1.5,zc,false,1,{wood:1,glow:1});if(!(hm&2))qWin(G,x1+.016,.85,zc,false,1,{wood:1,shut:1});
 /* guild sign: crossed hammer and trowel over the door */
 const sy=.98;bW(G,.55,sy,z1+.1,.05,.05,.16,QW2);bW(G,.55,sy-.24,z1+.18,.3,.24,.03,QW1);bM(G,.55,sy-.24,z1+.2,.32,.26,.01,QBR);
 bM(G,.49,sy-.2,z1+.21,.04,.17,.012,QIR);bM(G,.49,sy-.06,z1+.21,.1,.05,.012,QIR);bM(G,.61,sy-.2,z1+.21,.04,.12,.012,QW3);bM(G,.61,sy-.08,z1+.21,.08,.07,.012,'#b9c0cc');
 /* treadwheel crane at the front right: the wheel faces the street, the jib reaches back over the stone pile */
 const cx=1.68,cz=1.66;bW(G,cx,.13,cz,.14,2.5,.14,QW2);for(const s of[-1,1])bW(G,cx+s*.26,.13,cz,.07,.72,.07,QW1);bW(G,cx,.82,cz,.6,.06,.08,QW2);
 for(let k=0;k<16;k++){const a=k/16*6.2832,r=.34;bW(G,cx+Math.cos(a)*r,.66+Math.sin(a)*r,cz+.1,.09,.09,.07,k%2?QW1:QW3)}
 for(let k=0;k<4;k++){const a=k/4*3.1416,c=Math.cos(a),n=Math.sin(a);bW(G,cx,.66-Math.abs(n)*.32,cz+.1,Math.abs(c)*.64+.04,Math.abs(n)*.64+.04,.04,QW3)}bM(G,cx,.62,cz+.14,.08,.08,.04,QIR);
 const jy=2.5;bW(G,cx,jy,cz-.42,.1,.09,1.04,QW2);bW(G,cx,jy-.44,cz-.2,.05,.46,.05,QW3);bW(G,cx,jy-.2,cz-.3,.05,.05,.26,QW3);bW(G,cx,jy+.09,cz-.92,.07,.07,.07,QW3);
 bP(G,cx,1.12,cz-.88,.015,jy-1.12,.015,'#c8b890');bM(G,cx,1.08,cz-.88,.06,.04,.06,QIR);qStone(G,cx,.82,cz-.88,.24,.24,.24,{ph:2});
 /* yard: cut stone blocks under the crane, a plank stack, a workbench with tools, scaffold poles */
 if(!(hm&2)){for(const[x,z,y]of[[1.56,.62,.13],[1.82,.6,.13],[1.69,.61,.33]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 for(let k=0;k<4;k++)bW(G,1.7,.13+k*.05,.24,.5,.045,.14,k%2?QW3:QW1)}else for(const[x,z,y]of[[1.62,1.12,.13],[1.86,1.1,.13]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 bW(G,.62,.13,1.72,.62,.04,.22,QW3);for(const s of[-1,1])bW(G,.62+s*.27,.13,1.72,.05,.26,.18,QW2);bW(G,.62,.39,1.72,.62,.04,.22,QW3);bM(G,.5,.43,1.72,.18,.03,.04,'#b9c0cc');bW(G,.72,.43,1.7,.04,.03,.18,QW1);
 if(!(hm&9)){for(const[x,z]of[[.06,.12],[.06,1.38],[1.42,.12]]){bW(G,x,.1,z,.05,2.1,.05,'#b08a58');for(const y of[.75,1.45])bW(G,x,y,z,.05,.03,.05,QW2)}
 for(const y of[.75,1.45]){bW(G,.06,y+.03,.75,.04,.03,1.26,'#b08a58');bW(G,.74,y+.03,.12,1.36,.03,.04,'#b08a58')}}
 return toGeo(G)}
/* ---- market: striped awnings over a counter of goods; merged stalls become one covered bazaar with a clock post ---- */
function marketGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#a99a7e');for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)bS(G,.25+i*.5,.1,.25+j*.5,.48,.012,.48,QS[(i+j)%4]);
 const x0=W?0:.22,x1=E?2:1.78,z0=N?0:.34,z1=S?2:1.5,y1=1.32;
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])if(!((x===0||x===2)&&(z===0||z===2))&&!(x===0&&W)&&!(x===2&&E)&&!(z===0&&N)&&!(z===2&&S)){bW(G,x,.1,z,.1,y1+(z===z0?.3:0)-.1,.1,QW2);bM(G,x,.1,z,.14,.06,.14,QBR)}
 if(!N){for(let k=0;k<4;k++)bW(G,(x0+x1)/2,.1+k*.25,z0,x1-x0-.08,.24,.06,k%2?QW1:QW3)}
 if(!W)bW(G,x0,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);if(!E)bW(G,x1,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);
 const yt=y1+.3,ay=(z)=>yt-(z-z0)/(Math.max(.5,z1-z0+.36))*.5;
 for(let x=0;x<2-1e-6;x+=.25){const a=Math.max(x,x0-.1),b=Math.min(x+.25,x1+.1);if(b<=a)continue;const c=Math.round(x/.25)%2?'#f2ead8':'#b83a2b';
  for(let k=0;k<6;k++){const zz0=z0-.06+k*(z1-z0+.36)/6,zz1=zz0+(z1-z0+.36)/6;bC(G,(a+b)/2,ay((zz0+zz1)/2),(zz0+zz1)/2,b-a+.004,.05,zz1-zz0+.012,c)}
  if(!S){bC(G,(a+b)/2,ay(z1+.3)-.12,z1+.31,(b-a)*.72,.12,.03,c);bC(G,(a+b)/2,ay(z1+.3)-.16,z1+.31,(b-a)*.36,.05,.03,c)}}
 if(!S){bW(G,1,.1,z1-.06,x1-x0-.1,.42,.22,QW3);bW(G,1,.52,z1-.04,x1-x0+.02,.05,.3,QW2);
  bW(G,.5,.57,z1-.04,.32,.12,.22,QW1);for(let i=0;i<3;i++)for(let j=0;j<2;j++)bP(G,.4+i*.1,.69,z1-.09+j*.1,.07,.06,.07,(i+j)%2?'#c8282a':'#e04030');
  bC(G,.9,.57,z1-.04,.16,.22,.16,'#d8c08a');bC(G,.9,.79,z1-.04,.1,.06,.1,'#e8d29a');bC(G,1.18,.57,z1-.04,.2,.08,.2,'#3a5a9a');bC(G,1.18,.65,z1-.04,.2,.06,.2,'#7a3a8a');
  bM(G,1.5,.57,z1-.04,.04,.24,.04,QBR);bM(G,1.5,.81,z1-.04,.34,.03,.03,QBR);bM(G,1.36,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.64,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.36,.7,z1-.04,.06,.04,.06,'#ffd23c');
  qLamp(G,x1+.06,1.22,z1+.1,false);qLamp(G,x0-.06,1.22,z1+.1,false)}
 if(!E){qBarrel(G,1.86,.5,.1);qBarrel(G,1.86,.82,.1)}if(!W){qCrate(G,.12,.62,.1,.24);qCrate(G,.12,.66,.34,.18)}
 if(!m||nw){const sx=nw?x0+.12:1,sz=nw?z0+.12:z0;if(nw){bS(G,sx,.1,sz,.24,.12,.24,QSD);bM(G,sx,.22,sz,.08,2.0,.08,QBR);bM(G,sx,2.22,sz,.4,.4,.4,QBR);for(const[ax,n]of[[1,1],[1,-1],[0,1],[0,-1]]){const P=qP(G,sx,2.42,sz,ax,n);P(bP,0,-.15,.205,.28,.28,.01,'#f4ecd8');P(bP,0,-.03,.21,.02,.12,.01,QIR);P(bP,.04,-.02,.21,.1,.02,.01,QIR)}bM(G,sx,2.62,sz,.14,.14,.14,QBR2);qLamp(G,sx+.26,1.6,sz,true);qLamp(G,sx-.26,1.6,sz,true)}
  else{bW(G,1,1.86,z0,.06,.26,.06,QW2);bW(G,1,2.1,z0,.5,.06,.06,QW2);bW(G,1.15,1.82,z0+.04,.03,.28,.03,QW2);bW(G,1.15,1.62,z0+.04,.34,.22,.04,QW1);bM(G,1.15,1.67,z0+.07,.13,.13,.02,'#ffd23c');qFlag(G,x0,1.62,z0,.6)}}
 return toGeo(G)}
/* ---- torch: a brass brazier on a stone post ---- */
function torchGeo(){const G=newG();bS(G,0,0,0,.36,.1,.36,QSD);qStone(G,0,.1,0,.2,.2,.66);bS(G,0,.76,0,.26,.06,.26,QTR);bM(G,0,.82,0,.08,.36,.08,QBR);
 bM(G,0,1.18,0,.3,.05,.3,QBR);[[-.12,0,.03,.28],[.12,0,.03,.28],[0,-.12,.28,.03],[0,.12,.28,.03]].forEach(([x,z,w,d])=>bP(G,x,1.23,z,w,.16,d,QIR));
 bL(G,0,1.23,0,.2,.13,.2,'#ff8a2a');bL(G,0,1.36,0,.13,.11,.13,'#ffc040');bL(G,0,1.47,0,.06,.08,.06,'#fff1b0');return toGeo(G)}
/* ---- walls: limestone with a cornice and crenels / log palisade with iron bands ---- */
/* ---- v79 walls: a lower, wider wall with a clear wall walk (units stand on the deck), merlons on the edges only ---- */
const WALLH=1.45,WALLT=.74,WDH=1.42;
function wallGeo(m){const G=newG(),T=WALLT,H=WALLH;qPlinth(G,0,0,0,T+.12,T+.12,.14);qStone(G,0,.18,0,T,T,H-.18,{moss:1});
 for(const[bit,dx,dz]of DIRS)if(m&bit){qab(bS,G,dx,dz,.41,0,0,.2,T+.12,.18,QSD);for(let k=0;k<6;k++)qab(bS,G,dx,dz,.415,0,.18+k*(H-.18)/6,.19,T,(H-.18)/6,k===0?QMS:QS[(k+1)%4])}
 bS(G,0,H,0,T+.05,.07,T+.05,QTR);for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.41,0,H,.2,T+.05,.07,QTR);
 const e=T/2-.06;
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const l of[-1,1]){qab(bS,G,dx,dz,.42,l*e,H+.07,.13,.12,.2,QS[0]);qab(bS,G,dx,dz,.42,l*e,H+.27,.15,.14,.03,QTR)}}
 for(const[bit,dx,dz]of[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]]){if(m&bit)continue;for(const l of[-1,1]){const a=dx?dx*e:l*e*.7,b=dx?l*e*.7:dz*e;bS(G,a,H+.07,b,.13,.2,.13,QS[0]);bS(G,a,H+.27,b,.15,.03,.15,QTR)}if(dx)qSlit(G,dx*(T/2+.005),.7,0,false);else qSlit(G,0,.7,dz*(T/2+.005),true)}
 for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.4,0,.92,.2,T+.012,.05,QTR);bS(G,0,.92,0,T+.012,.05,T+.012,QTR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5,c=.5;qPlinth(G,x,0,z,c+.1,c+.1,.14);qStone(G,x,.18,z,c,c,H-.18,{moss:1});bS(G,x,H,z,c+.05,.07,c+.05,QTR);bS(G,x+dx*.13,H+.07,z+.13,.13,.2,.13,QS[0]);bS(G,x+dx*.13,H+.27,z+.13,.15,.03,.15,QTR);bS(G,x,.92,z,c+.012,.05,c+.012,QTR)}
 if(!(m&15))qPost(G,0,H+.07,0,.22,true);
 return toGeo(G)}
/* log palisade with a plank fighting deck on top and pointed stakes along both edges */
function woodWallGeo(m){const G=newG(),D=WDH,stake=(x,z,h)=>{bW(G,x,0,z,.13,h,.13,QLOG);bW(G,x,h,z,.09,.06,.09,QLOGT);bW(G,x,h+.06,z,.045,.05,.045,QLOGT)};
 for(const[a,b]of[[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]])stake(a,b,D+.3+((a+b)>0?.04:0));
 for(const a of[-.07,.07])for(const b of[-.21,.21]){bW(G,a,0,b,.14,D,.14,QLOG);bW(G,b,0,a,.14,D,.14,QLOG)}
 bW(G,0,D,0,.5,.06,.5,QW3);for(let k=0;k<3;k++)bW(G,-.16+k*.16,D+.06,0,.012,.006,.5,QW2);
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const t of[.3,.43])for(const l of[-.21,.21]){const x=dx?dx*t:l,z=dz?dz*t:l;stake(x,z,D+.3+(((t*10|0)+(l>0?1:0))%2)*.05)}
  for(const t of[.3,.43])for(const l of[-.07,.07])bW(G,dx?dx*t:l,0,dz?dz*t:l,.14,D,.14,QLOG);
  qab(bW,G,dx,dz,.375,0,D,.25,.5,.06,QW3);for(const y of[.42,1.0])for(const l of[-.21,.21])qab(bP,G,dx,dz,.36,l,y,.3,.05,.06,QIR)}
 for(const y of[.42,1.0])for(const[a,b]of[[-.21,0],[.21,0],[0,-.21],[0,.21]])bP(G,a,y,b,a?.05:.46,.06,a?.46:.05,QIR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5;for(const[a,b]of[[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13],[0,0]])stake(x+a,z+b,D+.3+((a+b)>0?.05:0));for(const a of[-.07,.07])for(const b of[-.07,.07])bW(G,x+a,0,z+b,.14,D,.14,QLOG);bW(G,x,D,z,.4,.06,.4,QW3);for(const y of[.42,1.0])bP(G,x,y,z,.44,.06,.44,QIR)}
 if(!(m&15))qLamp(G,0,D+.5,0,false);
 return toGeo(G)}
/* ---- v79 gate: three tiles - two square towers and an arched passage in the middle with a wall walk over it ---- */
function gateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;qPlinth(G,x,0,0,1.0,.98,.14);qStone(G,x,.18,0,.9,.9,2.44,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.45,-.45,x+.45,.45,.18,2.44);
  qCornice(G,x,2.62,0,.98,.98,.08);bS(G,x,2.7,0,.94,.03,.94,QSD2);qMerl(G,x-.47,-.47,x+.47,.47,2.7,.24,.3);
  qSlit(G,x+sg*.455,1.2,0,false);qSlit(G,x,1.75,.455,true);qSlit(G,x,1.75,-.455,true);qWin(G,x+sg*.457,2.15,0,false,sg,{w:.13,h:.22,glow:1});
  qLamp(G,x-sg*.36,1.3,.5,true);qLamp(G,x-sg*.36,1.3,-.5,true);qGem(G,x,2.3,.455,true,1,.09);qGem(G,x,2.3,-.455,true,-1,.09)});
 qStone(G,0,1.5,0,1.12,.8,.72,{ph:2});bP(G,0,1.44,0,1.12,.06,.1,'#1b1a20');
 for(const sg of[-1,1]){bS(G,sg*.44,1.3,0,.14,.18,.82,QTR);bS(G,sg*.36,1.4,0,.1,.1,.82,QTR)}
 qCornice(G,0,2.22,0,1.12,.86,.08);bS(G,0,2.3,0,1.1,.03,.82,QSD2);
 qMerlL(G,-.44,.37,.44,.37,2.33,.22,.15);qMerlL(G,-.44,-.37,.44,-.37,2.33,.22,.15);
 qBan(G,0,2.2,.42,true,1,.3,.44);qBan(G,0,2.2,-.42,true,-1,.3,.44);bS(G,0,0,0,3.0,.05,.84,QSD2);return toGeo(G)}
function woodGateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,x+a*.36,0,b*.36,.17,2.75,.17,QLOG);bW(G,x+a*.36,2.75,b*.36,.11,.06,.11,QLOGT)}
  for(const s of[-1,1]){bW(G,x,0,s*.37,.62,1.9,.05,QW1);bW(G,x+s*.37,0,0,.05,1.9,.62,QW1)}for(const y of[.6,1.4])for(const s of[-1,1]){bP(G,x,y,s*.39,.8,.05,.03,QIR);bP(G,x+s*.39,y,0,.03,.05,.8,QIR)}
  bW(G,x,1.95,0,.94,.1,.94,QW3);for(const s of[-1,1]){bW(G,x,2.05,s*.45,.94,.36,.05,QW1);bW(G,x+s*.45,2.05,0,.05,.36,.94,QW1)}
  const t=qPyr(G,x,0,2.81,1.06,1.06,QSH,.1,.034);bW(G,x,t,0,.08,.1,.08,QW2);qLamp(G,x-sg*.3,1.25,.42,false);qLamp(G,x-sg*.3,1.25,-.42,false)});
 bW(G,0,1.46,0,1.2,.16,.5,QW2);bW(G,0,1.62,0,1.16,.28,.46,QLOG);bW(G,0,1.9,0,1.2,.06,.56,QW3);
 for(let i=0;i<5;i++){const x=-.4+i*.2;bW(G,x,1.96,.25,.12,.28+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.25,.12,.28+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.26,true,1,.26,.36);qBan(G,0,1.56,-.26,true,-1,.26,.36);bP(G,0,0,0,3.0,.05,.84,'#6a5a3a');return toGeo(G)}
/* ---- v79 towers: 2x2 keeps of their own (coordinates 0..2, centre 1,1) - four archers stand on the roof ---- */
const TT2S=3.55,TT2W=3.1;
const TSTB=[[.5,0],[1.5,0],[2,.5],[2,1.5],[.5,2],[1.5,2],[0,.5],[0,1.5]];
function towerStubs(G,m,wood){for(let i=0;i<8;i++){if(!(m&(1<<i)))continue;const sd=i>>1,ax=sd===0||sd===2,[px,pz]=TSTB[i],L=wood?.24:.2,cn=(ax?pz:px)===0?L/2-.01:2-L/2+.01,x=ax?px:cn,z=ax?cn:pz;
 if(wood){const D=WDH;for(const l of[-.21,-.07,.07,.21]){const a=ax?x+l:x,b=ax?z:z+l;bW(G,a,0,b,.14,D+(Math.abs(l)>.1?.3:0),.14,QLOG);if(Math.abs(l)>.1){bW(G,a,D+.3,b,.09,.06,.09,QLOGT)}}bW(G,x,D,z,ax?.5:L,.06,ax?L:.5,QW3);for(const y of[.42,1.0])bP(G,x,y,z,ax?.5:L+.02,.06,ax?L+.02:.5,QIR)}
 else{const T=WALLT,H=WALLH,w=ax?T:L,d=ax?L:T;bS(G,x,0,z,ax?T+.12:L,.18,ax?L:T+.12,QSD);qStone(G,x,.18,z,w,d,H-.18,{moss:1});bS(G,x,H,z,ax?T+.05:L,.07,ax?L:T+.05,QTR);bS(G,x,.92,z,ax?T+.012:L,.05,ax?L:T+.012,QTR);
  for(const l of[-1,1]){const e=T/2-.06,a=ax?x+l*e:x,b=ax?z:z+l*e;bS(G,a,H+.07,b,ax?.12:L,.2,ax?L:.12,QS[0]);bS(G,a,H+.27,b,ax?.14:L,.03,ax?L:.14,QTR)}}}}
function towerGeo2(m,op){const G=newG(),c=1,W=1.7,H=3.0;towerStubs(G,m|0,false);qPlinth(G,c,0,c,W+.2,W+.2,.18);qStone(G,c,.18,c,W,W,H,{moss:1});qQuoin(G,c-W/2,c-W/2,c+W/2,c+W/2,.18,H);
 for(const[x,z,ax,n]of[[c,c+W/2,true,1],[c,c-W/2,true,-1],[c+W/2,c,false,1],[c-W/2,c,false,-1]]){for(const o of[-.45,.45])qSlit(G,ax?x+o:x+n*.005,1.3,ax?z+n*.005:z+o,ax);qSlit(G,ax?x:x+n*.005,2.3,ax?z+n*.005:z,ax);qWin(G,ax?x-.42:x+n*.01,2.35,ax?z+n*.01:z-.42,ax,n,{w:.13,h:.24,glow:1});qWin(G,ax?x+.42:x+n*.01,2.35,ax?z+n*.01:z+.42,ax,n,{w:.13,h:.24,glow:1})}
 qDoor(G,c,c+W/2+.016,true,1,{y:.18,w:.42,h:.66});qRing(G,c,c,1.85,W+.06,.05,QBR,bM);
 for(let i=0;i<8;i++){const a=-W/2+.12+i*(W-.24)/7;bS(G,c+a,H+.04,c+W/2+.05,.1,.14,.1,QSD);bS(G,c+a,H+.04,c-W/2-.05,.1,.14,.1,QSD);bS(G,c+W/2+.05,H+.04,c+a,.1,.14,.1,QSD);bS(G,c-W/2-.05,H+.04,c+a,.1,.14,.1,QSD)}
 bS(G,c,H+.18,c,W+.2,.1,W+.2,QSD);qStone(G,c,H+.28,c,W+.26,W+.26,.22,{ph:2});qCornice(G,c,TT2S-.05,c,W+.3,W+.3,.05);
 qMerl(G,c-(W+.26)/2,c-(W+.26)/2,c+(W+.26)/2,c+(W+.26)/2,TT2S,.24,.3);
 if(!op){qCyl(G,bS,c,c,TT2S,.6,.62,QS[1]);qCorbR(G,c,c,TT2S+.62,.74,8);qTowR(G,c,c,TT2S+.6,.2,.74,{ph:2});qCyl(G,bC,c,c,TT2S+.8,.05,.78,BLU);const t=qSpire(G,c,c,TT2S+.85,.76,1.1,QSL,{band:2,eave:'#4c4846'});bM(G,c,t,c,.07,.09,.07,QBR2);qFlag(G,c,t+.09,c,.62);
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])qWin(G,c+a*.31,TT2S+.2,c+b*.31,a===0,a||b,{w:.1,h:.18,glow:1})}
 qLamp(G,c-.5,1.1,c+W/2+.08,true);qLamp(G,c+.5,1.1,c+W/2+.08,true);return toGeo(G)}
function woodTowerGeo2(m,op){const G=newG(),c=1,D=2.95;towerStubs(G,m|0,true);bS(G,c,0,c,1.9,.14,1.9,QSD);
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,c+a*.8,.14,c+b*.8,.2,D+.55,.2,QLOG);bW(G,c+a*.8,D+.69,c+b*.8,.13,.07,.13,QLOGT);for(const y of[.6,1.8])bP(G,c+a*.8,y,c+b*.8,.22,.04,.22,QIR)}
 for(const s of[-1,1]){bW(G,c,.14,c+s*.8,1.5,1.4,.06,QW1);bW(G,c+s*.8,.14,c,.06,1.4,1.5,QW1);for(const y of[1.5,2.4]){bW(G,c,y,c+s*.8,1.62,.08,.07,QW2);bW(G,c+s*.8,y,c,.07,.08,1.62,QW2)}
  for(let k=0;k<5;k++){const u=-.6+k*.3,y=1.6+k*.16;bW(G,c+u,y,c+s*.8,.18,.12,.05,QW2);bW(G,c+s*.8,y,c+u,.05,.12,.18,QW2)}}
 qDoor(G,c,c+.836,true,1,{y:.14,w:.4,h:.62,wood:1});
 bW(G,c,D,c,1.92,.1,1.92,QW3);bW(G,c,D-.1,c,1.7,.1,1.7,QW2);
 for(const s of[-1,1]){bW(G,c,D+.1,c+s*.94,1.92,.38,.05,QW1);bW(G,c+s*.94,D+.1,c,.05,.38,1.92,QW1);bW(G,c,D+.48,c+s*.945,1.96,.06,.06,QW2);bW(G,c+s*.945,D+.48,c,.06,.06,1.96,QW2)}
 if(!op){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,c+a*.28,D+.1,c+b*.28,.09,.9,.09,QLOG);bW(G,c,D+.1,c,.4,.5,.4,QW1);const t=qPyr(G,c,c,D+1.0,.86,.86,QSH,.1,.04);qFlag(G,c,t,c,.6)}
 qLamp(G,c+.5,1.2,c+.86,false);qLamp(G,c-.5,1.2,c+.86,false);return toGeo(G)}
/* garrison height of a building: where its men really stand */
function gtopOf(s){const st=s.tier!==0;if(s.type==='wall')return st?WALLH+.07:WDH+.06;if(s.type==='gate')return (s.gl||2)===3?(st?2.72:2.05):2.1;if(s.type==='tower')return s.sz===2?(st?TT2S:TT2W+.02):(st?3.28:3.2);return GTOP[s.type]||2}
/* ---- towers ---- */
function qArms(G,m,H){for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<5;k++)qab(bS,G,dx,dz,.4,0,k*H/5,.2,2*WT,H/5,k===0?QSD:QS[k%4]);
 qab(bS,G,dx,dz,.4,0,H,.2,2*WT+.04,.07,QTR);for(const l of[1,-1]){qab(bS,G,dx,dz,.4,l*(WT-.05),H+.07,.12,.1,.2,QS[0]);qab(bS,G,dx,dz,.4,l*(WT-.05),H+.27,.13,.11,.035,QTR)}}}
function towerGeo(m,op){const G=newG();qArms(G,m,1.5);qPlinth(G,0,0,0,1.0,1.0,.16);qStone(G,0,.2,0,.8,.8,2.66,{moss:1});qQuoin(G,-.4,-.4,.4,.4,.2,2.66);
 for(const[a,b]of[[0,.4],[0,-.4],[.4,0],[-.4,0]]){const z=Math.abs(b)>0;qSlit(G,a+(z?.2:0),1.25,b,z);qSlit(G,a,2.25,b+(z?0:.2),z)}
 bW(G,0,.2,.405,.28,.48,.03,QW1);bS(G,0,.68,.405,.38,.06,.05,QTR);bS(G,0,.74,.41,.1,.07,.05,QTR);bM(G,.08,.42,.425,.035,.035,.02,QBR);
 qRing(G,0,0,1.72,.86,.05,QBR,bM);bS(G,0,2.86,0,.92,.08,.92,QSD);for(const[a,b]of[[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42],[0,-.44],[0,.44],[-.44,0],[.44,0]])bS(G,a,2.74,b,.1,.14,.1,QSD);
 bS(G,0,2.94,0,1.04,.1,1.04,QS[0]);bS(G,0,3.04,0,1.06,.2,1.06,QS[1]);qCornice(G,0,3.24,0,1.1,1.1,.05);
 if(op){[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]].forEach(([a,b])=>{bS(G,a,3.29,b,.14,.18,.14,QS[0]);bS(G,a,3.47,b,.16,.03,.16,QTR)})}
 else{for(const[a,b]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45],[0,-.45],[0,.45],[-.45,0],[.45,0]]){bS(G,a,3.29,b,.16,.2,.16,QS[0]);bS(G,a,3.49,b,.18,.03,.18,QTR)}
  bC(G,0,3.52,0,1.12,.06,1.12,BLU);bM(G,0,3.58,0,1.1,.03,1.1,QBR);const t=qPyr(G,0,0,3.61,1.06,1.06,QSL,.2,.1);bM(G,0,t,0,.08,.1,.08,QBR2);qFlag(G,0,t+.1,0,.62)}
 qLamp(G,0,1.0,.48,true);return toGeo(G)}
function woodTowerGeo(m,op){const G=newG();
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<2;k++){const t=.42;for(const l of[-.09,.09]){const x=dx?dx*t:l,z=dz?dz*t:l;bW(G,x,0,z,.16,WH-.05+(k?.1:0),.16,QLOG)}}qab(bP,G,dx,dz,.42,0,.42,.18,.46,.06,QIR);qab(bP,G,dx,dz,.42,0,1.12,.18,.46,.06,QIR)}
 bS(G,0,0,0,.96,.14,.96,QSD);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,a*.36,.14,b*.36,.16,2.96,.16,QLOG);bP(G,a*.36,.6,b*.36,.18,.04,.18,QIR);bP(G,a*.36,1.9,b*.36,.18,.04,.18,QIR)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]]){bW(G,a,.14,b,ax?.58:.04,1.06,ax?.04:.58,QW1);bW(G,a,1.2,b,ax?.6:.05,.07,ax?.05:.6,QW2);bW(G,a,2.1,b,ax?.6:.05,.07,ax?.05:.6,QW2)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]])for(let s=0;s<4;s++){const u=-.22+s*.15,y=1.3+s*.18;bW(G,ax?a+u:a,y,ax?b:b+u,ax?.14:.04,.16,ax?.04:.14,QW2)}
 bW(G,-.09,.14,.41,.03,2.9,.03,QW3);bW(G,.09,.14,.41,.03,2.9,.03,QW3);for(let y=.35;y<3;y+=.22)bW(G,0,y,.415,.18,.03,.03,QW3);
 bW(G,0,2.98,0,.9,.1,.9,QW2);bW(G,0,3.08,0,1.14,.12,1.14,QW3);
 for(const[a,b]of[[-.54,-.54],[.54,-.54],[-.54,.54],[.54,.54],[0,-.54],[0,.54],[-.54,0],[.54,0]])bW(G,a,3.2,b,.07,.32,.07,QW2);
 for(const s of[-1,1]){bW(G,s*.54,3.44,0,.05,.05,1.1,QW3);bW(G,0,3.44,s*.54,1.1,.05,.05,QW3)}
 if(!op){for(const[a,b]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])bW(G,a,3.2,b,.08,.72,.08,QLOG);const t=qPyr(G,0,0,3.9,1.3,1.3,QTC,.17,.1);qFlag(G,0,t,0,.6)}
 qLamp(G,.3,1.1,.46,false);return toGeo(G)}
/* ---- gates ---- */
function gateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.74;qPlinth(G,x,0,0,.62,.92,.14);qStone(G,x,.18,0,.52,.84,2.02,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.26,-.42,x+.26,.42,.18,2.02);
  qCornice(G,x,2.2,0,.6,.92,.08);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bS(G,x+a*.2,2.28,b*.37,.15,.24,.15,QS[0]);bS(G,x+a*.2,2.52,b*.37,.17,.035,.17,QTR)}
  qSlit(G,sg*1.005,1.2,0,false);qLamp(G,x-sg*.3,1.32,.47,true);qLamp(G,x-sg*.3,1.32,-.47,true);qGem(G,x,1.86,.425,true,1,.08);qGem(G,x,1.86,-.425,true,-1,.08)});
 qStone(G,0,1.42,0,.96,.84,.52,{ph:2});bP(G,0,1.36,0,.96,.06,.12,'#1b1a20');[-1,1].forEach(sg=>{bS(G,sg*.42,1.26,0,.12,.16,.84,QTR);bS(G,sg*.34,1.34,0,.08,.08,.84,QTR)});
 qCornice(G,0,1.94,0,.96,.9,.1);[-.34,0,.34].forEach(x=>{bS(G,x,2.04,.37,.14,.22,.14,QS[0]);bS(G,x,2.04,-.37,.14,.22,.14,QS[0]);bS(G,x,2.26,.37,.16,.03,.16,QTR);bS(G,x,2.26,-.37,.16,.03,.16,QTR)});
 qBan(G,0,1.9,.42,true,1,.28,.42);qBan(G,0,1.9,-.42,true,-1,.28,.42);bS(G,0,0,0,1.0,.05,.84,QSD2);return toGeo(G)}
function woodGateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.78;for(const[a,b]of[[-.1,-.2],[.1,-.2],[-.1,.2],[.1,.2]]){const h=2.35+((a+b)>0?.08:0);bW(G,x+a,0,b,.17,h,.17,QLOG);bW(G,x+a,h,b,.12,.07,.12,QLOGT);bW(G,x+a,h+.07,b,.06,.06,.06,QLOGT)}
  for(const y of[.5,1.4])bP(G,x,y,0,.42,.07,.52,QIR);qLamp(G,x-sg*.26,1.12,.32,false);qLamp(G,x-sg*.26,1.12,-.32,false)});
 bW(G,0,1.42,0,1.2,.16,.5,QW2);bW(G,0,1.58,0,1.16,.3,.46,QLOG);bW(G,0,1.88,0,1.3,.08,.56,QW3);
 for(let i=0;i<7;i++){const x=-.6+i*.2;bW(G,x,1.96,.24,.12,.3+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.24,.12,.3+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.25,true,1,.26,.36);qBan(G,0,1.56,-.25,true,-1,.26,.36);bP(G,0,0,0,1.0,.05,.84,'#6a5a3a');return toGeo(G)}
function doorGeo(){const G=newG(),w=.92;for(let k=0;k<9;k++){const x=-w/2+.05+k*(w-.1)/8;bP(G,x,-1.3,0,.045,1.28,.05,QIR);bM(G,x,-1.4,0,.03,.1,.03,QBR)}
 for(const y of[-1.15,-.75,-.35])bP(G,0,y,0,w,.045,.06,QIR);bM(G,0,-.06,0,w,.06,.07,QBR);return toGeo(G)}
function doorGeoW(){const G=newG(),w=.92;for(let k=0;k<6;k++){const x=-w/2+w/12+k*w/6;bW(G,x,-1.3,0,w/6-.01,1.3,.07,k%2?QW1:QW3)}bW(G,0,-1.3,0,.03,1.3,.09,QW2);
 for(const y of[-1.1,-.42])bP(G,0,y,0,w,.07,.09,QIR);for(const x of[-.12,.12])bM(G,x,-.72,.05,.05,.05,.03,QBR);return toGeo(G)}
/* ---- castle helpers: round masonry from three boxes (a near-circular outline), smooth cones, merlon rings ---- */
function qCyl(G,f,x,z,y0,h,D,c){f(G,x,y0,z,D,h,D*.4,c);f(G,x,y0,z,D*.4,h,D,c);f(G,x,y0,z,D*.72,h,D*.72,c)}
function qTowR(G,x,z,y0,h,D,o){o=o||{};const n=Math.max(1,Math.round(h/.21)),q=h/n;for(let k=0;k<n;k++)qCyl(G,bS,x,z,y0+k*q,q,D,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}
function qSpire(G,x,z,y0,D,H,cols,o){o=o||{};const n=Math.max(3,Math.round(H/.1)),q=H/n,b=o.band||2;qCyl(G,bR,x,z,y0-.05,.07,D+.1,o.eave||cols[0]);
 for(let k=0;k<n;k++){const w=Math.max(.05,D*(1-(k+.35)/n)),c=cols[((k/b)|0)%cols.length];if(o.sq)bR(G,x,y0+k*q,z,w,q,w,c);else qCyl(G,bR,x,z,y0+k*q,q,w,c)}return y0+H}
function qMerlR(G,x,z,y,D,n,h){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.065,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y,pz,.13,h,.13,QS[k%2]);bS(G,px,y+h,pz,.15,.03,.15,QTR)}}
function qCorbR(G,x,z,y,D,n){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.01,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y-.13,pz,.09,.13,.09,QSD);bS(G,px,y-.2,pz,.06,.07,.06,QSD2)}}
function qMerlL(G,x0,z0,x1,z1,y,h,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/step));for(let k=0;k<=n;k+=2){const t=k/n,px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;bS(G,px,y,pz,.14,h,.14,QS[(k/2)%2]);bS(G,px,y+h,pz,.16,.03,.16,QTR)}}
/* ---- castle (stone): a tall keep with a lantern belfry under a copper spire, four round towers with slate cones,
   crenellated curtain walls and a gatehouse with a portcullis; front = +z ---- */
function castleGeo(){const G=newG();qPlinth(G,1.5,0,1.5,3,3,.2);
 for(let i=0;i<6;i++)for(let j=0;j<6;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.3;
 /* curtain walls between the towers (the gatehouse closes the front) */
 const cw=(x,z,w,d,ax)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});qCornice(G,x,WT,z,w+.05,d+.05,.07);bS(G,x,WT+.07,z,w,.025,d,QSD2)};
 cw(1.5,.2,1.3,.3);cw(.2,1.5,.3,1.3);cw(2.8,1.5,.3,1.3);
 qMerlL(G,.9,.09,2.1,.09,WT+.07,.22,.15);qMerlL(G,.09,.9,.09,2.1,WT+.07,.22,.15);qMerlL(G,2.91,.9,2.91,2.1,WT+.07,.22,.15);
 for(const z of[1.2,1.8])qSlit(G,.045,1.2,z,false),qSlit(G,2.955,1.2,z,false);
 /* round corner towers: the back pair taller */
 for(const[x,z]of[[.46,.46],[2.54,.46],[.46,2.54],[2.54,2.54]]){const bk=z<1.5,Ht=bk?3.55:3.05,D=.92,ox=x<1.5?-1:1,oz=z<1.5?-1:1;
  qCyl(G,bS,x,z,0,.22,D+.12,QSD);qTowR(G,x,z,.2,Ht-.2,D,{moss:1,ph:bk?1:0});qCyl(G,bM,x,z,1.75,.05,D+.02,QBR);
  qCorbR(G,x,z,Ht+.02,D+.14,10);qTowR(G,x,z,Ht,.32,D+.14,{ph:2});qCyl(G,bS,x,z,Ht+.32,.05,D+.18,QTR);qCyl(G,bC,x,z,Ht+.37,.05,D+.16,BLU);
  const t=qSpire(G,x,z,Ht+.42,D+.12,bk?1.85:1.6,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.08,.1,.08,QBR2);bP(G,x,t+.1,z,.035,.42,.035,QIR);bM(G,x,t+.5,z,.06,.06,.06,QBR2);
  qSlit(G,x+ox*(D/2+.005),1.25,z,false);qSlit(G,x,1.25,z+oz*(D/2+.005),true);qSlit(G,x+ox*(D/2+.005),2.35,z,false);qSlit(G,x,2.35,z+oz*(D/2+.005),true);
  qWin(G,x+ox*(D/2+.075),Ht+.08,z,false,ox,{w:.11,h:.16,glow:1});qWin(G,x,Ht+.08,z+oz*(D/2+.075),true,oz,{w:.11,h:.16,glow:1})}
 /* keep */
 const kx=1.5,kz=1.18,KW=1.34,KD=1.3,KH=4.45;qPlinth(G,kx,.2,kz,KW+.1,KD+.1,.1);qStone(G,kx,.3,kz,KW,KD,KH-.3,{ph:1});qQuoin(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.3,KH-.3);
 qCornice(G,kx,2.62,kz,KW+.06,KD+.06,.06);
 for(let i=0;i<7;i++){const a=-KW/2+.1+i*(KW-.2)/6;bS(G,kx+a,KH-.14,kz+KD/2+.04,.09,.14,.09,QSD);bS(G,kx+a,KH-.14,kz-KD/2-.04,.09,.14,.09,QSD);const b=-KD/2+.1+i*(KD-.2)/6;bS(G,kx+KW/2+.04,KH-.14,kz+b,.09,.14,.09,QSD);bS(G,kx-KW/2-.04,KH-.14,kz+b,.09,.14,.09,QSD)}
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.24,{ph:3});qCornice(G,kx,KH+.24,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.29,kz,KW+.12,.04,KD+.12,BLU);
 qMerl(G,kx-KW/2-.06,kz-KD/2-.06,kx+KW/2+.06,kz+KD/2+.06,KH+.29,.2,.28);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx,kz-KD/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){
  qWin(G,ax?x-.3:x+n*.01,3.12,ax?z+n*.01:z-.3,ax,n,{w:.15,h:.34,glow:1});qWin(G,ax?x+.3:x+n*.01,3.12,ax?z+n*.01:z+.3,ax,n,{w:.15,h:.34,glow:1});
  qGem(G,ax?x:x+n*.012,3.62,ax?z+n*.012:z,ax,n,.1);qSlit(G,ax?x:x+n*.005,1.9,ax?z+n*.005:z,ax)}
 /* belfry lantern and copper spire */
 const by=KH+.29,BW=.74;qStone(G,kx,by,kz,BW,BW,.95,{ph:1});
 for(const[x,z,ax,n]of[[kx,kz+BW/2,true,1],[kx,kz-BW/2,true,-1],[kx+BW/2,kz,false,1],[kx-BW/2,kz,false,-1]])qWin(G,x+(ax?0:n*.01),by+.32,z+(ax?n*.01:0),ax,n,{w:.2,h:.34,glow:1});
 qCornice(G,kx,by+.95,kz,BW+.14,BW+.14,.07);bM(G,kx,by+1.02,kz,BW+.1,.03,BW+.1,QBR);
 const kt=qPyr(G,kx,kz,by+1.05,BW+.12,BW+.12,QCU,.19,.042);bM(G,kx,kt,kz,.1,.12,.1,QBR2);bP(G,kx,kt+.12,kz,.04,.7,.04,QIR);bM(G,kx,kt+.82,kz,.07,.07,.07,QBR2);
 /* gatehouse */
 const gz0=2.42,gz1=3.0,gx0=.9,gx1=2.1,GH=2.78,gzc=(gz0+gz1)/2,GW=gx1-gx0,GD=gz1-gz0;
 qStone(G,1.5,.2,gzc,GW,GD,GH-.2,{moss:1,ph:2});qQuoin(G,gx0,gz0,gx1,gz1,.2,GH-.2);
 for(let i=0;i<6;i++){const a=gx0+.1+i*(GW-.2)/5;bS(G,a,GH-.14,gz1+.04,.09,.14,.09,QSD);bS(G,a,GH-.2,gz1+.04,.06,.06,.06,QSD2)}
 qStone(G,1.5,GH,gzc+.02,GW+.04,GD+.1,.18,{ph:1});qCornice(G,1.5,GH+.18,gzc+.02,GW+.08,GD+.14,.05);
 qMerlL(G,gx0+.02,gz1+.04,gx1-.02,gz1+.04,GH+.23,.22,.14);qMerlL(G,gx0+.02,gz0+.02,gx1-.02,gz0+.02,GH+.23,.22,.14);
 /* the arch: dark opening, stone voussoirs, raised portcullis and oak doors inside */
 const ax0=1.5,aw=.6,ah=1.0,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.78,.07,.06,'#18171c');bP(G,ax0,.27+ah,az-.02,aw*.5,.06,.06,'#18171c');
 for(const s of[-1,1]){bS(G,ax0+s*(aw/2+.05),.2,az,.1,ah,.05,QTR);bS(G,ax0+s*(aw/2+.01),.2+ah,az,.1,.08,.05,QTR);bS(G,ax0+s*(aw*.3),.27+ah,az,.12,.07,.05,QTR)}bS(G,ax0,.33+ah,az,aw*.44,.07,.05,QTR);bS(G,ax0,.4+ah,az+.005,.1,.09,.06,QTR);
 bW(G,ax0,.2,az-.1,aw-.02,ah-.02,.04,QW1);for(const a of[-aw/4,0,aw/4])bW(G,ax0+a,.2,az-.075,.02,ah-.04,.01,QW2);bP(G,ax0,.45,az-.07,aw-.04,.03,.01,QIR);bP(G,ax0,.95,az-.07,aw-.04,.03,.01,QIR);
 for(let i=0;i<6;i++)bP(G,ax0-aw/2+.06+i*(aw-.12)/5,.75,az-.035,.022,ah-.48,.022,QIR);bP(G,ax0,.75,az-.035,aw-.04,.022,.022,QIR);for(let i=0;i<6;i++)bM(G,ax0-aw/2+.06+i*(aw-.12)/5,.7,az-.035,.03,.05,.03,QBR);
 bS(G,ax0,.2,az+.12,aw+.24,.04,.26,QSD2);qBan(G,1.5,2.42,gz1+.04,true,1,.34,.62);qGem(G,1.5,2.52,gz1+.03,true,1,.09);
 for(const s of[-1,1]){qLamp(G,1.5+s*.45,1.36,gz1+.1,true);qSlit(G,1.5+s*.42,1.9,gz1+.005,true)}
 return toGeo(G)}
/* ---- castle (wood): a sharpened-log palisade, four watchtowers under shingle roofs, a gate with a fighting platform,
   and a timber great hall under a steep thatch roof ---- */
const QTH=['#c9a35c','#b8924c','#d4b06c'],QSH=['#6e5236','#5e4630','#7a5c3c'];
function woodCastleGeo(){const G=newG();bP(G,1.5,0,1.5,3,.2,3,'#5a4a32');bP(G,1.5,.2,1.5,2.92,.06,2.92,'#75664a');
 const pal=(x,z,h)=>{bW(G,x,.26,z,.21,h,.21,QLOG);bW(G,x,.26+h,z,.14,.08,.14,QLOGT);bW(G,x,.34+h,z,.07,.09,.07,QLOGT)};
 const hh=i=>1.4+((i*7)%3)*.09;
 for(let i=0;i<10;i++){const t=.15+i*.3;pal(t,.13,hh(i));if(t<2.2)pal(.13,t,hh(i+2)),pal(2.87,t,hh(i+4))}
 for(const t of[.93,2.07])pal(t,2.87,hh(t>1.5?1:3));
 for(const y of[.6,1.22]){bP(G,1.5,y,.13,2.94,.06,.26,QIR);bP(G,.13,y,1.2,.26,.06,2.0,QIR);bP(G,2.87,y,1.2,.26,.06,2.0,QIR)}
 /* front watchtowers */
 for(const x of[.42,2.58]){const z=2.58,P=1.95;
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.31,.2,z+b*.31,.16,P+.6,.16,QLOG);
  for(const y of[.8,1.45])for(const s of[-1,1]){bW(G,x+s*.31,y,z,.06,.06,.6,QW2);bW(G,x,y,z+s*.31,.6,.06,.06,QW2)}
  bW(G,x,P,z,.88,.1,.88,QW3);bW(G,x,P-.08,z,.72,.08,.72,QW2);
  for(const s of[-1,1]){bW(G,x+s*.41,P+.1,z,.05,.4,.82,QW1);bW(G,x,P+.1,z+s*.41,.82,.4,.05,QW1);bW(G,x+s*.415,P+.4,z,.05,.06,.86,QW2);bW(G,x,P+.4,z+s*.415,.86,.06,.05,QW2)}
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.39,P+.5,z+b*.39,.07,.36,.07,QLOG);
  const t=qPyr(G,x,z,P+.84,1.08,1.08,QSH,.095,.032);bW(G,x,t,z,.1,.12,.1,QW2);qLamp(G,x,P+.74,z,false)}
 /* gate: two big posts, a fighting platform with a little roof, oak doors */
 for(const s of[-1,1]){const x=1.5+s*.47;bW(G,x,.2,2.86,.24,2.1,.24,QLOG);bW(G,x,2.3,2.86,.18,.08,.18,QLOGT);qLamp(G,x+s*.2,1.15,3.02,false)}
 bW(G,1.5,1.58,2.86,1.22,.14,.36,QW2);bW(G,1.5,1.72,2.86,1.3,.06,.42,QW3);for(let i=0;i<6;i++)bW(G,1.04+i*.184,1.78,3.03,.08,.26+(i%2)*.05,.06,QLOG);
 qRoof(G,1.5,2.86,1.18,.5,2.08,QSH,true,{rise:.14,run:.16,fill:QW1});
 for(const s of[-1,1]){bW(G,1.5+s*.18,.26,2.88,.34,1.3,.08,QW1);for(const y of[.5,1.2])bP(G,1.5+s*.18,y,2.93,.34,.06,.03,QIR)}bW(G,1.5,.26,2.92,.03,1.3,.05,QW2);
 qBan(G,1.5,1.56,3.06,true,1,.28,.4);
 /* yard */
 qBarrel(G,.95,2.2,.26);qBarrel(G,1.12,2.32,.26);qCrate(G,2.05,2.25,.26,.22);qCrate(G,2.0,2.27,.48,.16);
 /* great hall: log walls, a steep thatch roof, crossed gable boards */
 const x0=.52,x1=2.48,z0=.42,z1=1.74,zc=(z0+z1)/2;qStone(G,1.5,.26,zc,x1-x0+.06,z1-z0+.06,.22);
 for(let k=0;k<7;k++){const y=.48+k*.155,c=k%2?QLOG:'#5d3f25';bW(G,1.5,y,z1-.045,x1-x0,.15,.09,c);bW(G,1.5,y,z0+.045,x1-x0,.15,.09,c);bW(G,x0+.045,y,zc,.09,.15,z1-z0,c);bW(G,x1-.045,y,zc,.09,.15,z1-z0,c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bW(G,x,.48,z,.16,1.1,.16,QLOGT);
 qDoor(G,1.5,z1+.016,true,1,{y:.48,w:.34,h:.6,wood:1,lamp:1});for(const x of[.92,2.08])qWin(G,x,.86,z1+.016,true,1,{wood:1,shut:1,glow:1});
 qWin(G,x0-.016,.86,zc,false,-1,{wood:1,shut:1,glow:1});qWin(G,x1+.016,.86,zc,false,1,{wood:1,shut:1,glow:1});
 const rt=qRoof(G,1.5,zc,x1-x0,z1-z0,1.565,QTH,true,{rise:.2,run:.115,fill:'#e2cfa4',ov0:.14,ov1:.14,side:.16,ridge:QW2});
 for(const s of[-1,1]){const gx=1.5+s*((x1-x0)/2+.14);for(const d of[-1,1]){bW(G,gx,rt-.2,zc+d*.1,.06,.34,.06,QW2);bW(G,gx,rt+.12,zc+d*.17,.06,.12,.06,QW3)}}
 qChim(G,2.12,.78,1.4,rt-1.25);
 /* lookout tower rising through the roof */
 const tx=1.5,tz=.95,TW2=.72,TB=2.75;bW(G,tx,1.5,tz,TW2,TB-1.5,TW2,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*TW2/2,1.5,tz+b*TW2/2,.12,TB-1.5+.06,.12,QLOG);
 for(const y of[2.1,2.7])bW(G,tx,y,tz,TW2+.04,.06,TW2+.04,QW2);qWin(G,tx,2.24,tz+TW2/2+.012,true,1,{wood:1,glow:1});qWin(G,tx+TW2/2+.012,2.24,tz,false,1,{wood:1,glow:1});qWin(G,tx-TW2/2-.012,2.24,tz,false,-1,{wood:1,glow:1});
 bW(G,tx,TB,tz,TW2+.24,.1,TW2+.24,QW3);for(const s of[-1,1]){bW(G,tx+s*.46,TB+.1,tz,.05,.34,.96,QW1);bW(G,tx,TB+.1,tz+s*.46,.96,.34,.05,QW1)}
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.45,TB+.44,tz+b*.45,.07,.36,.07,QLOG);qLamp(G,tx,TB+.66,tz,false);
 const tt=qPyr(G,tx,tz,TB+.78,1.16,1.16,QSH,.1,.03);bW(G,tx,tt,tz,.1,.1,.1,QW2);qFlag(G,tx,tt+.08,tz,.85);
 return toGeo(G)}
/* ---- keep (four merged towers) ---- */
/* ---- castle 5x5 (stone): a tall keep with a copper spire at the back, four round corner towers, square flank towers,
   crenellated curtain walls with a wall walk, a twin-turret gatehouse and a lived-in courtyard; front = +z ---- */
const C5={kx:2.5,kz:1.6,flag:8.9,wflag:6.2};
function castleGeo5(){const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.5,TH=.42;
 const cw=(x,z,w,d)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});qCornice(G,x,WT,z,w+.05,d+.05,.07);bS(G,x,WT+.07,z,w-.04,.025,d-.04,QSD2)};
 cw(2.5,.22,3.6,TH);cw(.22,2.5,TH,3.6);cw(4.78,2.5,TH,3.6);cw(1.08,4.78,1.0,TH);cw(3.92,4.78,1.0,TH);
 /* merlons on the outer edge only, so the wall walk stays clear */
 qMerlL(G,.95,.06,4.05,.06,WT+.07,.24,.16);qMerlL(G,.06,.95,.06,4.05,WT+.07,.24,.16);qMerlL(G,4.94,.95,4.94,4.05,WT+.07,.24,.16);qMerlL(G,.95,4.94,1.55,4.94,WT+.07,.24,.16);qMerlL(G,3.45,4.94,4.05,4.94,WT+.07,.24,.16);
 for(const z of[1.3,2.5,3.7]){qSlit(G,.005,1.3,z,false);qSlit(G,4.995,1.3,z,false)}for(const x of[1.6,3.4])qSlit(G,x,1.3,.005,true);
 /* round corner towers, the back pair taller */
 for(const[x,z]of[[.6,.6],[4.4,.6],[.6,4.4],[4.4,4.4]]){const bk=z<2.5,Ht=bk?4.0:3.5,D=1.15,ox=x<2.5?-1:1,oz=z<2.5?-1:1;
  qCyl(G,bS,x,z,0,.22,D+.14,QSD);qTowR(G,x,z,.2,Ht-.2,D,{moss:1,ph:bk?1:0});qCyl(G,bM,x,z,2.0,.05,D+.02,QBR);
  qCorbR(G,x,z,Ht+.02,D+.16,12);qTowR(G,x,z,Ht,.34,D+.16,{ph:2});qCyl(G,bS,x,z,Ht+.34,.05,D+.2,QTR);qCyl(G,bC,x,z,Ht+.39,.05,D+.18,BLU);
  const t=qSpire(G,x,z,Ht+.44,D+.14,bk?2.0:1.75,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.08,.1,.08,QBR2);bP(G,x,t+.1,z,.035,.42,.035,QIR);bM(G,x,t+.5,z,.06,.06,.06,QBR2);
  qSlit(G,x+ox*(D/2+.005),1.3,z,false);qSlit(G,x,1.3,z+oz*(D/2+.005),true);qSlit(G,x+ox*(D/2+.005),2.6,z,false);qSlit(G,x,2.6,z+oz*(D/2+.005),true);
  qWin(G,x+ox*(D/2+.085),Ht+.08,z,false,ox,{w:.12,h:.17,glow:1});qWin(G,x,Ht+.08,z+oz*(D/2+.085),true,oz,{w:.12,h:.17,glow:1})}
 /* square flank towers in the middle of each side wall */
 for(const s of[-1,1]){const x=2.5+s*2.28,z=2.5,W=.86,H=3.05;qPlinth(G,x,0,z,W+.12,W+.12,.2);qStone(G,x,.2,z,W,W,H-.2,{moss:1,ph:1});qQuoin(G,x-W/2,z-W/2,x+W/2,z+W/2,.2,H-.2);
  qCornice(G,x,H,z,W+.08,W+.08,.06);qMerl(G,x-W/2-.02,z-W/2-.02,x+W/2+.02,z+W/2+.02,H+.06,.2,.26);qSlit(G,x+s*(W/2+.005),1.5,z,false);qSlit(G,x+s*(W/2+.005),2.4,z,false);qWin(G,x-s*(W/2+.012),2.2,z,false,-s,{w:.14,h:.26,glow:1})}
 /* keep */
 const kx=C5.kx,kz=C5.kz,KW=2.0,KD=1.8,KH=5.0;qPlinth(G,kx,.2,kz,KW+.12,KD+.12,.12);qStone(G,kx,.32,kz,KW,KD,KH-.32,{ph:1});qQuoin(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.32,KH-.32);
 qCornice(G,kx,2.9,kz,KW+.06,KD+.06,.06);
 for(let i=0;i<9;i++){const a=-KW/2+.1+i*(KW-.2)/8;bS(G,kx+a,KH-.14,kz+KD/2+.04,.09,.14,.09,QSD);bS(G,kx+a,KH-.14,kz-KD/2-.04,.09,.14,.09,QSD);const b=-KD/2+.1+i*(KD-.2)/8;bS(G,kx+KW/2+.04,KH-.14,kz+b,.09,.14,.09,QSD);bS(G,kx-KW/2-.04,KH-.14,kz+b,.09,.14,.09,QSD)}
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.26,{ph:3});qCornice(G,kx,KH+.26,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.31,kz,KW+.12,.04,KD+.12,BLU);
 qMerl(G,kx-KW/2-.06,kz-KD/2-.06,kx+KW/2+.06,kz+KD/2+.06,KH+.31,.22,.28);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx,kz-KD/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){const L=ax?KW:KD;
  for(const o of[-.5,0,.5]){const w=o*L*.62;qWin(G,ax?x+w:x+n*.01,3.35,ax?z+n*.01:z+w,ax,n,{w:.16,h:.36,glow:1})}qWin(G,ax?x-.4:x+n*.01,1.6,ax?z+n*.01:z-.4,ax,n,{w:.15,h:.3,glow:1});qWin(G,ax?x+.4:x+n*.01,1.6,ax?z+n*.01:z+.4,ax,n,{w:.15,h:.3,glow:1});
  qGem(G,ax?x:x+n*.012,4.25,ax?z+n*.012:z,ax,n,.12)}
 qDoor(G,kx,kz+KD/2+.016,true,1,{y:.32,w:.5,h:.78});qBan(G,kx-.62,3.0,kz+KD/2+.04,true,1,.3,.7);qBan(G,kx+.62,3.0,kz+KD/2+.04,true,1,.3,.7);
 /* bartizans on the keep corners */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=kx+a*KW/2,z=kz+b*KD/2;qCorbR(G,x,z,KH-.3,.5,6);qTowR(G,x,z,KH-.3,.7,.46,{ph:1});const t=qSpire(G,x,z,KH+.4,.52,.7,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.05,.06,.05,QBR2)}
 /* belfry and copper spire */
 const by=KH+.31,BW=.9;qStone(G,kx,by,kz,BW,BW,1.05,{ph:1});
 for(const[x,z,ax,n]of[[kx,kz+BW/2,true,1],[kx,kz-BW/2,true,-1],[kx+BW/2,kz,false,1],[kx-BW/2,kz,false,-1]])qWin(G,x+(ax?0:n*.01),by+.34,z+(ax?n*.01:0),ax,n,{w:.22,h:.38,glow:1});
 qCornice(G,kx,by+1.05,kz,BW+.14,BW+.14,.07);bM(G,kx,by+1.12,kz,BW+.1,.03,BW+.1,QBR);
 const kt=qPyr(G,kx,kz,by+1.15,BW+.14,BW+.14,QCU,.19,.045);bM(G,kx,kt,kz,.1,.12,.1,QBR2);bP(G,kx,kt+.12,kz,.04,.6,.04,QIR);bM(G,kx,kt+.72,kz,.07,.07,.07,QBR2);C5.flag=kt+.8;
 /* gatehouse with two round turrets */
 const gx0=1.6,gx1=3.4,gz0=4.2,gz1=5.04,GH=3.1,gzc=(gz0+gz1)/2,GW=gx1-gx0,GD=gz1-gz0;
 qStone(G,2.5,.2,gzc,GW,GD,GH-.2,{moss:1,ph:2});qQuoin(G,gx0,gz0,gx1,gz1,.2,GH-.2);
 for(let i=0;i<8;i++){const a=gx0+.1+i*(GW-.2)/7;bS(G,a,GH-.14,gz1+.04,.09,.14,.09,QSD)}
 qStone(G,2.5,GH,gzc+.02,GW+.04,GD+.1,.18,{ph:1});qCornice(G,2.5,GH+.18,gzc+.02,GW+.08,GD+.14,.05);
 qMerlL(G,gx0+.02,gz1+.04,gx1-.02,gz1+.04,GH+.23,.22,.15);qMerlL(G,gx0+.02,gz0+.02,gx1-.02,gz0+.02,GH+.23,.22,.15);
 for(const s of[-1,1]){const x=2.5+s*1.0,z=gz1-.05,D=.62,H=3.5;qTowR(G,x,z,.2,H-.2,D,{moss:1,ph:1});qCorbR(G,x,z,H,D+.1,8);qTowR(G,x,z,H,.26,D+.1,{ph:2});const t=qSpire(G,x,z,H+.26,D+.1,1.1,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.06,.08,.06,QBR2);qSlit(G,x,1.6,z+D/2+.005,true);qSlit(G,x,2.6,z+D/2+.005,true)}
 const ax0=2.5,aw=.82,ah=1.25,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.78,.08,.06,'#18171c');bP(G,ax0,.28+ah,az-.02,aw*.5,.07,.06,'#18171c');
 for(const s of[-1,1]){bS(G,ax0+s*(aw/2+.05),.2,az,.1,ah,.05,QTR);bS(G,ax0+s*(aw/2+.01),.2+ah,az,.1,.09,.05,QTR);bS(G,ax0+s*(aw*.3),.29+ah,az,.13,.08,.05,QTR)}bS(G,ax0,.35+ah,az,aw*.44,.08,.05,QTR);bS(G,ax0,.43+ah,az+.005,.12,.1,.06,QTR);
 bW(G,ax0,.2,az-.1,aw-.02,ah-.02,.04,QW1);for(const a of[-aw/3,0,aw/3])bW(G,ax0+a,.2,az-.075,.02,ah-.04,.01,QW2);bP(G,ax0,.5,az-.07,aw-.04,.03,.01,QIR);bP(G,ax0,1.1,az-.07,aw-.04,.03,.01,QIR);
 for(let i=0;i<7;i++)bP(G,ax0-aw/2+.07+i*(aw-.14)/6,.95,az-.035,.022,ah-.6,.022,QIR);bP(G,ax0,.95,az-.035,aw-.04,.022,.022,QIR);
 bS(G,ax0,.2,az+.14,aw+.3,.04,.3,QSD2);qBan(G,2.5,2.9,gz1+.04,true,1,.38,.7);qGem(G,2.5,2.0,gz1+.03,true,1,.1);
 for(const s of[-1,1])qLamp(G,2.5+s*.58,1.5,gz1+.1,true);
 /* courtyard: a well, a smithy lean-to, stacked supplies, a cart and lamp posts */
 {const x=1.35,z=3.35;qCyl(G,bS,x,z,.22,.32,.5,QSD);qCyl(G,bP,x,z,.5,.03,.34,'#2a4a6a');for(const s of[-1,1])bW(G,x+s*.22,.54,z,.05,.5,.05,QW2);bW(G,x,1.04,z,.56,.05,.08,QW2);qPyr(G,x,z,1.09,.62,.36,QSL,.08,.06);bP(G,x,.6,z,.02,.44,.02,'#c8b890');bW(G,x,.58,z,.1,.1,.1,QW3)}
 {const x=3.75,z=3.4;bW(G,x,.22,z-.36,1.0,1.0,.06,QW1);for(const s of[-1,1])bW(G,x+s*.46,.22,z+.1,.07,.8,.07,QW2);qRoof(G,x,z-.02,1.05,.82,1.02,QTC,true,{rise:.1,run:.2,g0:false,g1:false});
  bS(G,x-.2,.22,z-.1,.36,.3,.3,QSD);bL(G,x-.2,.52,z-.1,.16,.06,.16,QFI);bM(G,x+.22,.22,z,.12,.24,.12,QIR);bM(G,x+.22,.46,z,.3,.06,.14,QIR)}
 qBarrel(G,3.2,3.05,.22);qBarrel(G,3.35,2.85,.22);qCrate(G,1.7,2.75,.22,.26);qCrate(G,1.72,2.78,.48,.18);
 {const x=3.15,z=3.75;bW(G,x,.32,z,.46,.08,.28,QW3);for(const s of[-1,1])qCyl(G,bW,x+s*.16,z-.18,.2,.06,.22,QW2);bW(G,x,.34,z+.3,.04,.04,.4,QW2)}
 for(const[x,z]of[[1.7,4.05],[3.3,4.05]])qPost(G,x,.22,z,.55,true);
 return toGeo(G)}
/* ---- castle 5x5 (wood): sharpened-log palisade with a wall walk, four watchtowers, a gate with a fighting platform,
   a great hall with a lookout tower and a busy yard; front = +z ---- */
function woodCastleGeo5(){const G=newG();bP(G,2.5,0,2.5,5,.2,5,'#5a4a32');bP(G,2.5,.2,2.5,4.92,.06,4.92,'#75664a');
 const pal=(x,z,h)=>{bW(G,x,.26,z,.21,h,.21,QLOG);bW(G,x,.26+h,z,.14,.08,.14,QLOGT);bW(G,x,.34+h,z,.07,.09,.07,QLOGT)};
 const hh=i=>1.75+((i*7)%3)*.1;
 for(let i=0;i<17;i++){const t=.14+i*.295;pal(t,.13,hh(i));if(t>.6&&t<4.4){pal(.13,t,hh(i+2));pal(4.87,t,hh(i+4))}if((t<1.75||t>3.25)&&t>.6&&t<4.4)pal(t,4.87,hh(i+1))}
 for(const y of[.62,1.38]){bP(G,2.5,y,.13,4.9,.06,.26,QIR);bP(G,.13,y,2.5,.26,.06,4.0,QIR);bP(G,4.87,y,2.5,.26,.06,4.0,QIR)}
 /* wall walk inside the palisade */
 for(const[x,z,w,d]of[[2.5,.42,4.2,.32],[.42,2.5,.32,3.8],[4.58,2.5,.32,3.8]]){bW(G,x,1.5,z,w,.07,d,QW3);for(let k=0;k<7;k++){const t=k/6-.5;bW(G,w>d?x+t*w*.95:x,.26,w>d?z:z+t*d*.95,.09,1.24,.09,QW2)}}
 /* corner watchtowers */
 for(const[x,z]of[[.5,.5],[4.5,.5],[.5,4.5],[4.5,4.5]]){const P=2.25;
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.34,.2,z+b*.34,.17,P+.62,.17,QLOG);
  for(const y of[.85,1.6])for(const s of[-1,1]){bW(G,x+s*.34,y,z,.06,.06,.66,QW2);bW(G,x,y,z+s*.34,.66,.06,.06,QW2)}
  bW(G,x,P,z,.96,.1,.96,QW3);bW(G,x,P-.08,z,.78,.08,.78,QW2);
  for(const s of[-1,1]){bW(G,x+s*.45,P+.1,z,.05,.42,.9,QW1);bW(G,x,P+.1,z+s*.45,.9,.42,.05,QW1);bW(G,x+s*.455,P+.42,z,.05,.06,.94,QW2);bW(G,x,P+.42,z+s*.455,.94,.06,.05,QW2)}
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.43,P+.52,z+b*.43,.07,.4,.07,QLOG);
  const t=qPyr(G,x,z,P+.9,1.18,1.18,QSH,.1,.034);bW(G,x,t,z,.1,.12,.1,QW2);qLamp(G,x,P+.8,z,false)}
 /* gate */
 for(const s of[-1,1]){const x=2.5+s*.72;bW(G,x,.2,4.86,.3,2.5,.3,QLOG);bW(G,x,2.7,4.86,.22,.09,.22,QLOGT);qLamp(G,x+s*.24,1.3,5.04,false)}
 bW(G,2.5,1.85,4.86,1.7,.15,.42,QW2);bW(G,2.5,2.0,4.86,1.8,.06,.48,QW3);for(let i=0;i<9;i++)bW(G,1.7+i*.2,2.06,5.06,.09,.28+(i%2)*.06,.06,QLOG);
 qRoof(G,2.5,4.86,1.7,.56,2.42,QSH,true,{rise:.15,run:.16,fill:QW1});
 for(const s of[-1,1]){bW(G,2.5+s*.27,.26,4.88,.52,1.5,.08,QW1);for(const y of[.55,1.35])bP(G,2.5+s*.27,y,4.93,.5,.06,.03,QIR)}bW(G,2.5,.26,4.92,.03,1.5,.05,QW2);
 qBan(G,2.5,1.84,5.07,true,1,.3,.46);
 /* great hall */
 const x0=1.2,x1=3.8,z0=.75,z1=2.55,zc=(z0+z1)/2;qStone(G,2.5,.26,zc,x1-x0+.06,z1-z0+.06,.22);
 for(let k=0;k<8;k++){const y=.48+k*.155,c=k%2?QLOG:'#5d3f25';bW(G,2.5,y,z1-.045,x1-x0,.15,.09,c);bW(G,2.5,y,z0+.045,x1-x0,.15,.09,c);bW(G,x0+.045,y,zc,.09,.15,z1-z0,c);bW(G,x1-.045,y,zc,.09,.15,z1-z0,c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bW(G,x,.48,z,.18,1.26,.18,QLOGT);
 qDoor(G,2.5,z1+.016,true,1,{y:.48,w:.42,h:.72,wood:1,lamp:1});for(const x of[1.65,3.35])qWin(G,x,.95,z1+.016,true,1,{wood:1,shut:1,glow:1});
 qWin(G,x0-.016,.95,zc,false,-1,{wood:1,shut:1,glow:1});qWin(G,x1+.016,.95,zc,false,1,{wood:1,shut:1,glow:1});
 const rt=qRoof(G,2.5,zc,x1-x0,z1-z0,1.72,QTH,true,{rise:.2,run:.115,fill:'#e2cfa4',ov0:.15,ov1:.15,side:.18,ridge:QW2});
 for(const s of[-1,1]){const gx=2.5+s*((x1-x0)/2+.15);for(const d of[-1,1]){bW(G,gx,rt-.2,zc+d*.1,.06,.34,.06,QW2);bW(G,gx,rt+.12,zc+d*.17,.06,.12,.06,QW3)}}
 qChim(G,3.3,1.1,1.6,rt-1.35);
 const tx=2.5,tz=1.25,TW2=.8,TB=3.2;bW(G,tx,1.7,tz,TW2,TB-1.7,TW2,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*TW2/2,1.7,tz+b*TW2/2,.12,TB-1.7+.06,.12,QLOG);
 for(const y of[2.4,3.0])bW(G,tx,y,tz,TW2+.04,.06,TW2+.04,QW2);qWin(G,tx,2.6,tz+TW2/2+.012,true,1,{wood:1,glow:1});qWin(G,tx+TW2/2+.012,2.6,tz,false,1,{wood:1,glow:1});qWin(G,tx-TW2/2-.012,2.6,tz,false,-1,{wood:1,glow:1});
 bW(G,tx,TB,tz,TW2+.26,.1,TW2+.26,QW3);for(const s of[-1,1]){bW(G,tx+s*.5,TB+.1,tz,.05,.36,1.04,QW1);bW(G,tx,TB+.1,tz+s*.5,1.04,.36,.05,QW1)}
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.49,TB+.46,tz+b*.49,.07,.38,.07,QLOG);qLamp(G,tx,TB+.7,tz,false);
 const tt=qPyr(G,tx,tz,TB+.84,1.26,1.26,QSH,.1,.03);bW(G,tx,tt,tz,.1,.1,.1,QW2);C5.wflag=tt+.08;
 /* yard: well, hay, woodpile, a hut with a workbench, crates and a cart */
 {const x=1.25,z=3.45;for(let k=0;k<8;k++){const a=k/8*6.283;bW(G,x+Math.cos(a)*.22,.26,z+Math.sin(a)*.22,.1,.28,.1,QLOG)}bP(G,x,.5,z,.32,.02,.32,'#2a4a6a');for(const s of[-1,1])bW(G,x+s*.24,.26,z,.05,.62,.05,QW2);bW(G,x,.88,z,.58,.05,.06,QW2);qPyr(G,x,z,.93,.6,.36,QSH,.08,.06)}
 {const x=3.85,z=3.45;bW(G,x,.26,z,.7,.6,.6,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.33,.26,z+b*.28,.08,.62,.08,QLOG);qRoof(G,x,z,.84,.74,.88,QTH,true,{rise:.16,run:.12,fill:'#e2cfa4'});qDoor(G,x,z+.31,true,1,{y:.26,w:.22,h:.42,wood:1})}
 for(let k=0;k<3;k++)bW(G,3.2,.26+k*.1,4.05,.6,.1,.18,k%2?QLOGT:QLOG);bW(G,1.85,.26,4.1,.36,.26,.3,'#d4b06c');bW(G,1.85,.52,4.1,.3,.1,.24,'#c9a35c');
 qBarrel(G,2.05,3.0,.26);qBarrel(G,3.0,2.95,.26);qCrate(G,1.9,3.1,.26,.24);
 return toGeo(G)}
function keepGeo(wd){const G=newG();
 if(!wd){qPlinth(G,1,0,1,2,2,.2);qStone(G,1,.2,1,1.8,1.8,3.2,{moss:1});qQuoin(G,.1,.1,1.9,1.9,.2,3.2);qRing(G,1,1,1.9,1.84,.05,QBR,bM);
  for(const[x,z,ax,n]of[[1,1.9,true,1],[1,.1,true,-1],[1.9,1,false,1],[.1,1,false,-1]]){qWin(G,x,2.3,z+n*.01,ax,n,{w:.22,h:.34,glow:1});qSlit(G,ax?x-.5:x+n*.01,1.3,ax?z+n*.01:z-.5,ax);qSlit(G,ax?x+.5:x+n*.01,1.3,ax?z+n*.01:z+.5,ax);qGem(G,ax?x:x+n*.012,2.85,ax?z+n*.012:z,ax,n,.1)}
  bS(G,1,3.4,1,1.94,.1,1.94,QSD);bS(G,1,3.5,1,2.0,.2,2.0,QS[1]);qCornice(G,1,3.7,1,2.04,2.04,.04);qMerl(G,0,0,2,2,3.74,.22,.3);
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){qRound(G,x,z,3.5,.8,.5);qRing(G,x,z,4.3,.56,.05,BLU,bC);qRing(G,x,z,4.35,.56,.03,QBR,bM);const t=qCone(G,x,z,4.38,.58,QSL,.14);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.916,true,1,{y:.2,w:.36,h:.66,lamp:1,hex:1});qBan(G,.5,1.62,1.9,true,1);qBan(G,1.5,1.62,1.9,true,1)}
 else{bP(G,1,0,1,2,.2,2,'#5a4a32');for(let k=0;k<12;k++){const y=.2+k*.27,c=k%2?QLOG:'#58402a';bW(G,1,y,1,1.84,.27,1.7,c);bW(G,1,y,1,1.7,.27,1.84,c)}
  for(const[a,b]of[[.1,.1],[1.9,.1],[.1,1.9],[1.9,1.9]]){bW(G,a,.2,b,.22,3.3,.22,QLOGT);for(const y of[.9,2.2])bP(G,a,y,b,.24,.05,.24,QIR)}
  bW(G,1,3.44,1,2.04,.12,2.04,QW3);for(let i=0;i<9;i++){const t=.1+i*.225;for(const[x,z]of[[t,.04],[t,1.96],[.04,t],[1.96,t]])bW(G,x,3.56,z,.08,.3,.08,QW2)}
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){const t=qPyr(G,x,z,3.86,.62,.62,QTC,.14,.08);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.936,true,1,{y:.2,w:.34,h:.62,wood:1,lamp:1});for(const x of[.5,1.5])qWin(G,x,1.6,1.936,true,1,{wood:1,shut:1});qBan(G,1,2.6,1.92,true,1,.3,.5)}
 return toGeo(G)}

/* ---- fx / particles ---- */
const PMAX=900,partM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({depthWrite:false}),PMAX);partM.frustumCulled=false;partM.renderOrder=6;partM.setColorAt(0,new THREE.Color(1,1,1));partM.count=0;scene.add(partM);
const AMAX=500,fxM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial(),AMAX);fxM.frustumCulled=false;fxM.setColorAt(0,new THREE.Color(1,1,1));fxM.count=0;scene.add(fxM);
const colCache=new Map(),colOf=c=>{let v=colCache.get(c);if(!v){v=new THREE.Color(c);colCache.set(c,v)}return v};
const _o=new THREE.Object3D(),_c1=new THREE.Color();
/* ---- glow sprites: soft additive billboards for lamps, sparks, arrows, fire and blasts (one draw call for all) ---- */
const GLMAX=1600,GLW=(()=>{const c=cvs(64,64),x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.6)');gr.addColorStop(.5,'rgba(255,255,255,.2)');gr.addColorStop(.78,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
 const P=new Float32Array(GLMAX*4),C=new Float32Array(GLMAX*4),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4);ip.setUsage(THREE.DynamicDrawUsage);ic.setUsage(THREE.DynamicDrawUsage);g.setAttribute('gP',ip);g.setAttribute('gC',ic);g.instanceCount=0;
 const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'attribute vec4 gP;attribute vec4 gC;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=gC;vec4 mv=modelViewMatrix*vec4(gP.xyz,1.);mv.xy+=position.xy*gP.w;mv.z+=min(gP.w*.9,1.6);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){float a=texture2D(tex,vU).a*vC.a;if(a<.003)discard;gl_FragColor=vec4(vC.rgb,a);}'});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=8;scene.add(mesh);return{g,P,C,ip,ic,n:0,mesh}})();
const SMKMAX=700,SMK=(()=>{const c=cvs(64,64),x=c.getContext('2d');
 for(let i=0;i<10;i++){const a=i/10*6.2832,r=11+((i*7)%5)*1.6,cx=32+Math.cos(a)*9*(i%2?1:.55),cy=33+Math.sin(a)*8*(i%2?1:.55),gr=x.createRadialGradient(cx-3,cy-4,0,cx,cy,r+7);
  gr.addColorStop(0,'rgba(255,255,255,.62)');gr.addColorStop(.55,'rgba(190,190,190,.42)');gr.addColorStop(1,'rgba(120,120,120,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)}
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
 const P=new Float32Array(SMKMAX*4),C=new Float32Array(SMKMAX*4),Rr=new Float32Array(SMKMAX),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4),ir=new THREE.InstancedBufferAttribute(Rr,1);[ip,ic,ir].forEach(a=>a.setUsage(THREE.DynamicDrawUsage));g.setAttribute('sP',ip);g.setAttribute('sC',ic);g.setAttribute('sR',ir);g.instanceCount=0;
 const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,
  vertexShader:'attribute vec4 sP;attribute vec4 sC;attribute float sR;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=sC;float c=cos(sR),s=sin(sR);vec2 q=vec2(c*position.x-s*position.y,s*position.x+c*position.y);vec4 mv=modelViewMatrix*vec4(sP.xyz,1.);mv.xy+=q*sP.w;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){vec4 t=texture2D(tex,vU);float a=t.a*vC.a;if(a<.004)discard;gl_FragColor=vec4(vC.rgb*(.62+.55*t.r),a);}'});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=7;scene.add(mesh);return{g,P,C,Rr,ip,ic,ir,n:0,mesh}})();
function smk(x,y,z,s,r,g,b,a,rot){const G=SMK;if(G.n>=SMKMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a;G.Rr[k]=rot||0}
function smkFlush(){const G=SMK;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){for(const a of[G.ip,G.ic,G.ir]){a.updateRange.offset=0;a.updateRange.count=G.n*a.itemSize;a.needsUpdate=true}}G.n=0}
/* night fireflies drifting around the camera */
const FFL=[];function fireflies(dt){if(nightK<.25){FFL.length=0;return}const R=REALR;while(FFL.length<34)FFL.push({x:CAM.x+(R()-.5)*36,z:CAM.z+(R()-.5)*30,ph:R()*6.28,sp:.4+R()*.6});
 for(const f of FFL){f.ph+=dt*f.sp;f.x+=Math.cos(f.ph*.7)*dt*.4;f.z+=Math.sin(f.ph*.53)*dt*.4;if(Math.abs(f.x-CAM.x)>20||Math.abs(f.z-CAM.z)>17){f.x=CAM.x+(R()-.5)*36;f.z=CAM.z+(R()-.5)*30}
  const tx=f.x|0,tz=f.z|0;if(!gOK(tx,tz)||ter[tz*TW+tx]===1)continue;const a=(.5+.5*Math.sin(f.ph*3.1))*nightK;glow(f.x,gh(f.x,f.z)+.6+.35*Math.sin(f.ph*1.3),f.z,.13,.75,1,.35,.85*a)}}
function glow(x,y,z,s,r,g,b,a){const G=GLW;if(G.n>=GLMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a}
function glowFlush(){const G=GLW;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){G.ip.updateRange.offset=0;G.ip.updateRange.count=G.n*4;G.ip.needsUpdate=true;G.ic.updateRange.offset=0;G.ic.updateRange.count=G.n*4;G.ic.needsUpdate=true}G.n=0}
/* short-lived light flashes and shock rings (blasts, muzzle flashes); purely visual */
const VFL=[],RINGP=[];const RINGM=new THREE.RingGeometry(.82,1,40);RINGM.rotateX(-Math.PI/2);
function vflash(x,y,h,s,c,T,ring){if(VFL.length<60)VFL.push({x,y,h,s,c,T,t:0,ring})}
let litTm=-9;
function updateLit(){if(nightK<.02||clockT-litTm<.25)return;litTm=clockT;litTex.fill(0);
 const ox=Math.round(CAM.x)-(LITN>>1),oz=Math.round(CAM.z)-(LITN>>1);FOWU.litP.value.x=ox;FOWU.litP.value.y=oz;
 for(const L of lightSources()){const lx=L[0]/TS-ox,ly=L[1]/TS-oz,r=L[2]/TS;if(lx+r<1||lx-r>LITN-2||ly+r<1||ly-r>LITN-2)continue;
  for(let j=Math.max(1,Math.floor(ly-r));j<=Math.min(LITN-2,Math.ceil(ly+r));j++)for(let i=Math.max(1,Math.floor(lx-r));i<=Math.min(LITN-2,Math.ceil(lx+r));i++){const d=hyp(i+.5-lx,j+.5-ly)/r;if(d>=1)continue;const v=d<.62?255:Math.round(255*(1-(d-.62)/.38)),k=j*LITN+i;if(litTex[k]<v)litTex[k]=v}}
 litT.needsUpdate=true}
function drawFlashes(dt){let ri=0;for(let i=VFL.length-1;i>=0;i--){const f=VFL[i];f.t+=dt;const p=f.t/f.T;if(p>=1){VFL.splice(i,1);continue}const a=(1-p)*(1-p);
  glow(f.x/TS,f.h,f.y/TS,f.s*(.55+.9*p),f.c[0],f.c[1],f.c[2],a*.9);glow(f.x/TS,f.h,f.y/TS,f.s*.35,1,1,1,a*.8);
  if(f.ring&&ri<8){let m=RINGP[ri];if(!m){m=new THREE.Mesh(RINGM,new THREE.MeshBasicMaterial({color:0xffd8a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.renderOrder=7;scene.add(m);RINGP[ri]=m}
   const r=.6+f.s*1.5*Math.sqrt(p);m.position.set(f.x/TS,f.h-.45,f.y/TS);m.scale.set(r,1,r);m.material.opacity=.7*(1-p);m.visible=true;ri++}}
 for(let k=ri;k<RINGP.length;k++)RINGP[k].visible=false}
const GLC={'#ffe9a0':[1,.88,.55],'#ff8a2a':[1,.48,.12],'#ffd23c':[1,.78,.2],'#ffb050':[1,.58,.22],'#b8f040':[.55,1,.2],'#f0ff60':[.8,1,.3],'#7dffa0':[.35,1,.55],'#ffe066':[1,.88,.35],'#b04bff':[.7,.3,1],'#e55':[1,.3,.25],'#ffe14a':[1,.86,.3]};
const tw3=(wx,wy)=>{const tx=Math.max(0,Math.min(TW-1,(wx/TS)|0)),ty=Math.max(0,Math.min(TH-1,(wy/TS)|0)),s=occ.get(ty*TW+tx);return s&&s.type==='tower'?s.bh+gtopOf(s)-.15:gh(wx/TS,wy/TS)+.42};
function syncFx(){let n=0;for(const p of pt){const a=Math.max(0,p.t/(p.T||.6));
  if(p.soft){const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),c=colOf(p.c),al=Math.min(1,(1-a)/.14)*a*.78,ss=(p.s||.3)*(1.1+(1-a)*2.2);if(p.r===undefined)p.r=REALR();smk(p.x/TS,py_,p.y/TS,ss,c.r,c.g,c.b,al,p.r*6.28+(1-a)*p.sp*.25);continue}
  if(n>=PMAX)break;const sz=p.s?p.s*(.4+.6*a)*(a>.85?1+(1-a)*2:1):.06+.1*a;
  const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),gc=GLC[p.c];if(gc)glow(p.x/TS,py_,p.y/TS,.14+sz*2.2,gc[0],gc[1],gc[2],.55*a);if(p.r===undefined)p.r=REALR();_o.position.set(p.x/TS,py_,p.y/TS);_o.rotation.set(p.r*6+(1-a)*(p.sp||0),p.r*4+(1-a)*(p.sp||0)*.7,0);_o.scale.set(sz,sz,sz);_o.updateMatrix();partM.setMatrixAt(n,_o.matrix);if(p.r===undefined)p.r=Math.random();_c1.copy(colOf(p.c)).multiplyScalar(.8+.4*p.r);partM.setColorAt(n,_c1);n++}
 partM.count=n;partM.instanceMatrix.needsUpdate=true;if(partM.instanceColor)partM.instanceColor.needsUpdate=true;
 n=0;for(const f of fx){if(n>=AMAX)break;const p=1-f.t/f.T;
  if(f.k==='rock'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.3,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*8;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*5,0);_o.scale.set(.42,.42,.42);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#7f7f7f'))}
  else if(f.k==='acid'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.25,ar=.9+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.18,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*7,p*5,0);_o.scale.set(.15,.15,.15);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#a8e030'));
   glow(x/TS,h,y/TS,.34,.55,1,.2,.6);for(let q=1;q<=3;q++){const pq=Math.max(0,p-q*.06),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,f.h0+(h1-f.h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.22-q*.04,.5,1,.2,.35/q)}}
  else if(f.k==='cball'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.2,ar=1+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.32,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*6,0);_o.scale.set(.13,.13,.13);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#2a2a2e'))}
  else if(f.k==='bolt'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h=f.h0+(.5-f.h0+gh(f.x2/TS,f.y2/TS))*p*.6;_o.position.set(x/TS,h,y/TS);_o.lookAt(f.x2/TS,h,f.y2/TS);_o.scale.set(.12,.12,1.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#8a6a42'));glow(x/TS,h,y/TS,.5,1,.9,.6,.55*(1-p))}
  else if(f.a){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h0=f.h0!==undefined?f.h0:tw3(f.x1,f.y1),h1=gh(f.x2/TS,f.y2/TS)+(f.arc?.12:.38),ar=f.arc?1.2+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.12:0,h=h0+(h1-h0)*p+Math.sin(p*Math.PI)*ar;
   _o.position.set(x/TS,h,y/TS);if(f.arc){const q=Math.min(1,p+.04);_o.lookAt((f.x1+(f.x2-f.x1)*q)/TS,h0+(h1-h0)*q+Math.sin(q*Math.PI)*ar,(f.y1+(f.y2-f.y1)*q)/TS)}else _o.lookAt(f.x2/TS,h1,f.y2/TS);if(f.arc)_o.scale.set(.085,.085,.66);else _o.scale.set(.06,.06,.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(f.arc?'#f4ead0':'#d8c8a0'));
   glow(x/TS,h,y/TS,.17,1,.86,.6,.5);for(let q=1;q<=2;q++){const pq=Math.max(0,p-q*.05),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,h0+(h1-h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.11-q*.03,1,.8,.5,.22/q)}if(p<.18)glow(f.x1/TS,h0,f.y1/TS,.45,1,.8,.45,(1-p/.18)*.55)}
  else{const r=.18+p*.5;_o.position.set(f.x2/TS,gh(f.x2/TS,f.y2/TS)+.45,f.y2/TS);_o.rotation.set(p*3,p*4,0);_o.scale.set(r,r,r);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(p<.5?'#ffffff':'#ffd060'))}
  n++}
 fxM.count=n;fxM.instanceMatrix.needsUpdate=true;if(fxM.instanceColor)fxM.instanceColor.needsUpdate=true;drawFlashes(1/60)}
/* ---- camera & picking ---- */
function updateCamera(dt){CAM.x=Math.max(2,Math.min(TW-2,CAM.x));CAM.z=Math.max(2,Math.min(TH-2,CAM.z));
 {const gy0=(gh(CAM.x,CAM.z)*2+gh(CAM.x+3,CAM.z)+gh(CAM.x-3,CAM.z)+gh(CAM.x,CAM.z+3)+gh(CAM.x,CAM.z-3))/6;CAM.y+=(gy0-CAM.y)*Math.min(1,dt*3)}const d=CAM.dist,cp=Math.cos(CAM.pitch);
 let px=CAM.x+d*Math.sin(CAM.yaw)*cp,py=CAM.y+d*Math.sin(CAM.pitch),pz=CAM.z+d*Math.cos(CAM.yaw)*cp;const gy=gh(px,pz)+2.5;if(py<gy)py=gy;
 if(shakeT>0&&dt>0&&started&&!paused&&!over){const k=Math.min(1,shakeT)*.3;px+=(Math.random()-.5)*k;py+=(Math.random()-.5)*k;pz+=(Math.random()-.5)*k}camera.position.set(px,py,pz);camera.lookAt(CAM.x,CAM.y,CAM.z);
 scene.fog.near=d*.55+6;scene.fog.far=d*1.9+38;
 if(SHADOWS){const e=Math.round(Math.min(70,Math.max(26,d*.95+14))),sc=sun.shadow.camera;if(sc.right!==e){sc.left=-e;sc.right=e;sc.top=e;sc.bottom=-e;sc.far=e*4+60;sc.updateProjectionMatrix()}}
 {/* shadow map snapped to its texel grid: no shadow crawling when the camera moves */
  const e=SHADOWS?sun.shadow.camera.right:30,tex=2*e/2048,Lz=_LD,Lx=_LR,Ly=_LU;let tx=CAM.x,ty=CAM.y,tz=CAM.z;const a=tx*Lx[0]+ty*Lx[1]+tz*Lx[2],b=tx*Ly[0]+ty*Ly[1]+tz*Ly[2],da=Math.round(a/tex)*tex-a,db=Math.round(b/tex)*tex-b;
  tx+=da*Lx[0]+db*Ly[0];ty+=da*Lx[1]+db*Ly[1];tz+=da*Lx[2]+db*Ly[2];sun.position.set(tx-24,ty+44,tz+18);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld()}}
const _LD=(()=>{const v=[-24,44,18],l=Math.hypot(...v);return v.map(q=>q/l)})(),_LR=(()=>{const d=_LD,u=[0,1,0],r=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]],l=Math.hypot(...r);return r.map(q=>q/l)})(),_LU=(()=>{const d=_LD,r=_LR;return[d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]]})();
const _rc=new THREE.Raycaster(),_v2=new THREE.Vector2(),_v3=new THREE.Vector3();
function pickGround(px,py){_v2.set(px/cv.width*2-1,-(py/cv.height*2-1));_rc.setFromCamera(_v2,camera);const o=_rc.ray.origin,d=_rc.ray.direction;
 if(d.y>=-1e-4)return null;let t=Math.max(0,(o.y-82)/-d.y),prev=t;
 for(;t<520;t+=.35){const x=o.x+d.x*t,z=o.z+d.z*t,y=o.y+d.y*t;
  if(x>=0&&z>=0&&x<TW&&z<TH&&y<=gh(x,z)){let a=prev,b=t;for(let k=0;k<7;k++){const m=(a+b)/2;if(o.y+d.y*m<=gh(o.x+d.x*m,o.z+d.z*m))b=m;else a=m}return{x:o.x+d.x*b,z:o.z+d.z*b}}
  if(y<0)break;prev=t}
 const tt=(o.y-LAND)/-d.y;return{x:Math.max(0,Math.min(TW-.01,o.x+d.x*tt)),z:Math.max(0,Math.min(TH-.01,o.z+d.z*tt))}}
const wpos=()=>{const p=pickGround(mouse.x,mouse.y);return p?{x:p.x*TS,y:p.z*TS}:{x:HOMEC().x,y:HOMEC().y}};
function scr(x,y,z){_v3.set(x,y,z).project(camera);return{x:(_v3.x+1)/2*cv.width,y:(1-_v3.y)/2*cv.height,ok:_v3.z<1}}
function home(){const hc=MP.on&&LPL()===1&&CS2?CS2:HOMEC();CAM.x=hc.x/TS;CAM.z=hc.y/TS;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.92;CAM.dist=window.innerWidth>=900?24:30}
/* ---- ghost (build preview) ---- */
const cubeG2=new THREE.BoxGeometry(1,1,1);
const GBM=new Set(['wall','gate','tower','barracks','farm','storage','house','academy','market','forester','guild','torch','movec']);
function mkGB(solid){const g=new THREE.Group();g.visible=false;scene.add(g);return{g,key:'',solid,mat:solid?matV:new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3})}}
const GB1=mkGB(false),GB2=mkGB(true),GB3=mkGB(true);
/* ---- transparent previews of what will be built: terrain blocks, ramps, paths, siege weapons, stone upgrades ---- */
let TGH=null,GBW=null,GBWK='',GHO=null;const TGEO={};
function tgBlock(G,y0,y1,top,side){const s=shade(side,.9),s2=shade(side,.72);quad(G,[0,y1,0],[0,y1,1],[1,y1,1],[1,y1,0],[0,1,0],top,top,top,top);
 quad(G,[1,y0,0],[1,y1,0],[1,y1,1],[1,y0,1],[1,0,0],s2,s,s,s2);quad(G,[0,y0,1],[0,y1,1],[0,y1,0],[0,y0,0],[-1,0,0],s2,s,s,s2);
 quad(G,[1,y0,1],[1,y1,1],[0,y1,1],[0,y0,1],[0,0,1],s2,s,s,s2);quad(G,[0,y0,0],[0,y1,0],[1,y1,0],[1,y0,0],[0,0,-1],s2,s,s,s2);quad(G,[0,y0,0],[1,y0,0],[1,y0,1],[0,y0,1],[0,-1,0],s2,s2,s2,s2)}
function tgRamp(G,d){const[dx,dy]=D4[d],ax=dx?0:1,sg=(dx+dy)>0,ns=2,st=.5,c=GRASS,rc=DIRT,gc=shade(c,.88),r7=shade(rc,.75);
 for(let k=0;k<ns;k++){const u0=k/ns,u1=(k+1)/ns,yt=(k+1)*st,yb=yt-st,p0=sg?u0:1-u1,p1=sg?u1:1-u0,ck=shade(c,.96+.04*(k&1));
  if(ax===0){quad(G,[p0,yt,0],[p0,yt,1],[p1,yt,1],[p1,yt,0],[0,1,0],ck,ck,ck,ck);const rx=sg?p0:p1;
   if(sg)quad(G,[rx,yb,1],[rx,yt,1],[rx,yt,0],[rx,yb,0],[-1,0,0],r7,gc,gc,r7);else quad(G,[rx,yb,0],[rx,yt,0],[rx,yt,1],[rx,yb,1],[1,0,0],r7,gc,gc,r7);
   quad(G,[p1,0,1],[p1,yt,1],[p0,yt,1],[p0,0,1],[0,0,1],rc,rc,rc,rc);quad(G,[p0,0,0],[p0,yt,0],[p1,yt,0],[p1,0,0],[0,0,-1],rc,rc,rc,rc)}
  else{quad(G,[0,yt,p0],[0,yt,p1],[1,yt,p1],[1,yt,p0],[0,1,0],ck,ck,ck,ck);const rz=sg?p0:p1;
   if(sg)quad(G,[0,yb,rz],[0,yt,rz],[1,yt,rz],[1,yb,rz],[0,0,-1],r7,gc,gc,r7);else quad(G,[1,yb,rz],[1,yt,rz],[0,yt,rz],[0,yb,rz],[0,0,1],r7,gc,gc,r7);
   quad(G,[1,0,p0],[1,yt,p0],[1,yt,p1],[1,0,p1],[1,0,0],rc,rc,rc,rc);quad(G,[0,0,p1],[0,yt,p1],[0,yt,p0],[0,0,p0],[-1,0,0],rc,rc,rc,rc)}}
 const s=shade(rc,.85);if(ax===0){if(sg)quad(G,[1,0,0],[1,1,0],[1,1,1],[1,0,1],[1,0,0],s,s,s,s);else quad(G,[0,0,1],[0,1,1],[0,1,0],[0,0,0],[-1,0,0],s,s,s,s)}
 else{if(sg)quad(G,[1,0,1],[1,1,1],[0,1,1],[0,0,1],[0,0,1],s,s,s,s);else quad(G,[0,0,0],[0,1,0],[1,1,0],[1,0,0],[0,0,-1],s,s,s,s)}}
function tgGeo(k){let q=TGEO[k];if(q)return q;const G=newG();
 if(k==='block')tgBlock(G,0,1,GRASS,DIRT);else if(k==='path1'||k==='path2'){const c=k==='path2'?[.56,.56,.57]:[.6,.49,.3];tgBlock(G,0,.08,c,shade(c,.8))}else tgRamp(G,+k.slice(4));
 return TGEO[k]=toGeo(G)}
function tgShow(k,x,y,z,good,sc,front){if(!TGH){TGH=new THREE.Mesh(tgGeo('block'),new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));TGH.renderOrder=5;scene.add(TGH)}
 TGH.geometry=tgGeo(k);TGH.position.set(x,y,z);TGH.scale.setScalar(sc||1);TGH.material.color.set(front?(good?0xffc27a:0xff6060):good?0xa6ffb4:0xff8686);TGH.material.depthTest=!front;TGH.material.side=front?THREE.BackSide:THREE.FrontSide;TGH.visible=true}
function gbwShow(type,o,aim,good){if(!GBW){GBW=new THREE.Group();GBW.userData.mat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,depthTest:false});scene.add(GBW)}const M=GBW.userData.mat;
 if(GBWK!==type){GBWK=type;while(GBW.children.length)GBW.remove(GBW.children[0]);
  if(type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),M);h.scale.setScalar(.82);h.position.set(0,3.58,0);GBW.add(h);GBW.userData.rot=h}
  else{const wg=new THREE.Group();wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4);wg.add(new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),M));const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),M);a.position.set(1,1.78,1);a.rotation.order='YXZ';wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),M);cw.position.set(0,0,-.86);a.add(cw);GBW.add(wg);GBW.userData.rot=a}}
 GBW.traverse(m=>{if(m.isMesh)m.renderOrder=7});GBW.userData.rot.rotation.y=aim;GBW.position.set(o.tx+.5,o.bh||HT[o.ty*TW+o.tx],o.ty+.5);M.color.set(good?0xa6ffb4:0xff8686);GBW.visible=true}

function ghostMake(G,type,tx,ty,ax,good,alpha){const sz=type==='castle'?5:(type==='tower'||type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'||type==='keep')?2:1,wd=!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower')),tier=GHO?GHO.tier:wd?0:1,gl=GHO?GHO.gl:gateLen,rot=GHO?GHO.rot:type==='castle'?(HOMEC()?HOMEC().rot|0:0):ROTT.has(type)?buildRot&3:0,key=type+'|'+tx+','+ty+'|'+(ax|0)+'|'+tier+'|'+gl+'|'+rot;
 if(G.key!==key){G.key=key;const s={t:0,type,tier,sz,tx,ty,ax:ax||0,gl,rot,tiles:tilesFor(type,tx,ty,sz,ax,gl),hp:1,max:1,prog:1,ci:0,x:(tx+(type==='gate'?(ax?.5:gl/2):sz/2))*TS,y:(ty+(type==='gate'?(ax?gl/2:.5):sz/2))*TS};
  while(G.g.children.length)G.g.remove(G.g.children[0]);s.o3=G.g;G.g.scale.set(1,1,1);BPLOFF=true;try{buildStructMesh0(s)}finally{BPLOFF=false}
  if(!G.solid)G.g.traverse(o=>{if(o.isMesh)o.material=G.mat})}
 if(!G.solid){G.mat.color.set(good?0xa6ffb4:0xff8686);G.mat.opacity=alpha||.62}G.g.visible=true}
const rampPool=[];function rampBox(i,x,y,z,sx,sy,sz,good){let m=rampPool[i];if(!m){m=new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({transparent:true,opacity:.8,depthWrite:false,depthTest:false}));m.renderOrder=6;scene.add(m);rampPool[i]=m}m.material.color.set(good?0x2bff6a:0xff4444);m.scale.set(sx*.96,sy,sz*.96);m.position.set(x,y,z);m.visible=true}
/* Minecraft block-breaking cracks on the resource a peasant is working */
const CRKT=(()=>{const R=rngf(77),pts=[];let x=8,y=8;for(let k=0;k<70;k++){pts.push([x,y]);const d=(R()*4)|0;x=Math.max(0,Math.min(15,x+[1,-1,0,0][d]));y=Math.max(0,Math.min(15,y+[0,0,1,-1][d]));if(R()<.12){x=(R()*16)|0;y=(R()*16)|0}}
 const T=[];for(let s=0;s<10;s++){const c=cvs(16,16),g=c.getContext('2d');const n=Math.round((s+1)/10*pts.length);g.fillStyle='rgba(0,0,0,.6)';for(let k=0;k<n;k++)g.fillRect(pts[k][0],pts[k][1],1,1);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;T.push(t)}return T})(),CRKG=(()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return g})(),CRKP=[];
const SAPM=(()=>{const G=newG();bxc(G,0,0,0,.07,.42,.07,'#6b4a2c');bxc(G,0,.3,0,.3,.22,.3,'#4f9a3c');bxc(G,0,.5,0,.2,.16,.2,'#62b148');bxc(G,.1,.22,.05,.12,.1,.12,'#5aa842');bxc(G,-.09,.36,-.06,.11,.1,.11,'#4a9238');
 const m=new THREE.InstancedMesh(toGeo(G),matV,1024);m.frustumCulled=false;m.count=0;m.castShadow=SHADOWS;scene.add(m);return m})();
function saplRender(){let n=0;if(SAPL.size){const R=(CAM.dist*1.7+26),q=new THREE.Object3D();for(const[i,v]of SAPL){const x=i%TW,y=(i/TW)|0;if(Math.abs(x-CAM.x)>R||Math.abs(y-CAM.z)>R)continue;
  if(!fowSeenAt((x+.5)*TS,(y+.5)*TS))continue;const p=Math.min(1,(time-v.t)/GROWT),s=.45+p*.95;q.position.set(x+.5+(((i*37)%7)-3)*.03,HT[i],y+.5+(((i*53)%7)-3)*.03);q.rotation.set(0,(i%8)*.7,0);q.scale.set(s,s,s);q.updateMatrix();SAPM.setMatrixAt(n++,q.matrix);if(n>=1024)break}}
 SAPM.count=n;if(n)SAPM.instanceMatrix.needsUpdate=true}
function crackAt(i,x,y,z,sx,sy,sz,st){let m=CRKP[i];if(!m){m=new THREE.Mesh(CRKG,new THREE.MeshBasicMaterial({map:CRKT[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.renderOrder=3;scene.add(m);CRKP[i]=m}if(m.material.map!==CRKT[st])m.material.map=CRKT[st];m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.visible=true}
/* green overlay: where the castle may be founded / moved */
const GOVM=new THREE.MeshBasicMaterial({color:0xd8ff5a,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}),GOVE=new THREE.MeshBasicMaterial({color:0xf2ffd8,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}),GOV={m:null,e:null,key:'',t:0};
function govBuild(key,cx,cy,R,ok){GOVM.opacity=.42+.14*Math.sin(clockT*3.2);const vis=()=>{if(GOV.m)GOV.m.visible=true;if(GOV.e)GOV.e.visible=true};if(GOV.key===key){vis();return}if(clockT-GOV.t<.35&&GOV.m&&GOV.key.split('|')[0]===key.split('|')[0]){vis();return}GOV.key=key;GOV.t=clockT;
 for(const q of['m','e'])if(GOV[q]){scene.remove(GOV[q]);GOV[q].geometry.dispose();GOV[q]=null}
 const S=2*R+1,V=new Uint8Array(S*S),at=(x,y)=>{const i=x-(cx-R),j=y-(cy-R);return i<0||j<0||i>=S||j>=S?0:V[j*S+i]};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++)if(gOK(x,y)&&genF[((y/CH)|0)*NCX+((x/CH)|0)]&&ok(x,y))V[(y-cy+R)*S+(x-cx+R)]=1;
 const P=[],I=[],PE=[],IE=[];let n=0,ne=0;const eq=(ax,az,bx,bz,h)=>{PE.push(ax,h,az,ax,h+.22,az,bx,h+.22,bz,bx,h,bz);IE.push(ne,ne+1,ne+2,ne,ne+2,ne+3);ne+=4};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!at(x,y))continue;const h=HT[y*TW+x]+.06;P.push(x,h,y,x,h,y+1,x+1,h,y+1,x+1,h,y);I.push(n,n+1,n+2,n,n+2,n+3);n+=4;
  if(!at(x,y-1))eq(x,y,x+1,y,h);if(!at(x,y+1))eq(x,y+1,x+1,y+1,h);if(!at(x-1,y))eq(x,y,x,y+1,h);if(!at(x+1,y))eq(x+1,y,x+1,y+1,h)}
 if(!n)return;const mk=(P,I,M)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,M);m.renderOrder=2;m.frustumCulled=false;scene.add(m);return m};
 GOV.m=mk(P,I,GOVM);if(ne)GOV.e=mk(PE,IE,GOVE)}
function govHide(){if(GOV.m)GOV.m.visible=false;if(GOV.e)GOV.e.visible=false}
const MCBOX=(()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return new THREE.EdgesGeometry(g)})(),MCSEL=new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.75})),MCHOV=new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.55}));MCSEL.visible=MCHOV.visible=false;scene.add(MCSEL,MCHOV);
const ghost=new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({color:0x66ff66,transparent:true,opacity:.45,depthWrite:false}));ghost.visible=false;scene.add(ghost);const SCAF=new Set(),SGEO={};const selRing=new THREE.Mesh(new THREE.RingGeometry(1,1.14,48),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));selRing.rotation.x=-Math.PI/2;selRing.visible=false;scene.add(selRing);
/* reach of the selected tower or castle: a ring laid on the ground (seen through hills), an inner one for the trebuchet's dead zone */
const SELRG=(()=>{const mk=c=>{const g=new THREE.BufferGeometry(),N=129;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*2*3),3));const ix=[];for(let k=0;k<N-1;k++){const a=k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(ix);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.75,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));m.renderOrder=8;m.visible=false;m.frustumCulled=false;scene.add(m);return m};return{o:mk(0xffd84a),i:mk(0xff7a4a),key:''}})();
function selRangeShow(sb,rg){if(!sb||!rg){SELRG.o.visible=SELRG.i.visible=false;return}const key=sb.sid+'|'+rg.r+'|'+(rg.min||0)+'|'+sb.x+','+sb.y+'|'+(dirtyT.size?SELRG.key:'');
 if(key!==SELRG.key){SELRG.key=key;const put=(M,r)=>{const P=M.geometry.attributes.position,w=Math.max(.22,r*.018);for(let k=0;k<=128;k++){const a=k/128*6.2832,c=Math.cos(a),sn=Math.sin(a);for(let e=0;e<2;e++){const rr=r+(e?w:-w),x=sb.x/TS+c*rr,z=sb.y/TS+sn*rr,tx=Math.max(0,Math.min(TW-1,Math.floor(x))),tz=Math.max(0,Math.min(TH-1,Math.floor(z)));P.setXYZ(k*2+e,x,(HT[tz*TW+tx]||LAND)+.35,z)}}P.needsUpdate=true;M.geometry.computeBoundingSphere()};put(SELRG.o,rg.r);if(rg.min)put(SELRG.i,rg.min)}
 SELRG.o.visible=true;SELRG.i.visible=!!rg.min}
/* outlines for the other buildings of a double-click group */
const MCSELP=[];function groupBoxes(L,sb){let n=0;for(const s of L){if(s===sb)continue;let m=MCSELP[n];if(!m){m=new THREE.LineSegments(MCBOX,MCSEL.material);scene.add(m);MCSELP[n]=m}n++;const H=selH(s),w=s.type==='gate'?(s.ax?1:(s.gl||2)):s.sz,d=s.type==='gate'?(s.ax?(s.gl||2):1):s.sz;m.position.set(s.x/TS,s.bh||LAND,s.y/TS);m.scale.set(w+.04,H,d+.04);m.visible=true}for(let k=n;k<MCSELP.length;k++)MCSELP[k].visible=false}
const rangeRing=(()=>{const pts=[];for(let i=0;i<=64;i++)pts.push(new THREE.Vector3(Math.cos(i/64*6.2832)*7.5,0,Math.sin(i/64*6.2832)*7.5));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.6}))})();rangeRing.visible=false;scene.add(rangeRing);
const RFLAG=[0x59ff8a,0xffc23c].map(col=>{const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0x2a2018,depthTest:false,transparent:true}),c=new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,depthTest:false,transparent:true});const p=new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,.12),m);p.position.y=1.6;const cl=new THREE.Mesh(new THREE.BoxGeometry(1.5,.9,.05),c);cl.position.set(.78,2.7,0);const rg=new THREE.Mesh(new THREE.RingGeometry(.9,1.2,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));rg.rotation.x=-Math.PI/2;rg.position.y=.08;const bm=new THREE.Mesh(new THREE.BoxGeometry(.14,9,.14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,depthWrite:false}));bm.position.y=4.5;
 const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,1)]),ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.8,depthTest:false}));ln.frustumCulled=false;scene.add(ln);
 [p,cl,rg].forEach(o=>o.renderOrder=7);g.add(p,cl,rg,bm);g.userData={cl,rg,ln,lg,col};g.visible=false;ln.visible=false;scene.add(g);return g});
const rflagUpd=()=>{const pl=LPL(),ok0=b=>b&&b.t===0&&structs.includes(b)&&b.prog>=1&&(b.pl|0)===pl,hc=HOMEC(),
  selBar=ok0(selB)&&selB.type==='barracks'?selB:null,anyBar=selBar||structs.find(s=>ok0(s)&&s.type==='barracks')||null,
  act=[!!selBar||mode==='rally',castleSel||mode==='rallyc'||(ok0(selB)&&selB.type==='castle')],src=[selBar||anyBar,ok0(selB)&&selB.type==='castle'?selB:hc];
 let hov=null;if((mode==='rally'||mode==='rallyc')&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))){const p=pickGround(mouse.x,mouse.y);if(p)hov={x:p.x*TS,y:p.z*TS}}
 RFLAG.forEach((g,i)=>{const b=src[i],set=b?b.rally:null,ph=hov&&mode===(i?'rallyc':'rally');if(!i&&!act[0]){g.visible=g.userData.ln.visible=false;return}let w=ph?hov:set;
  if(!w&&act[i]&&b)w=b.type==='castle'?dpt(b):{x:b.x,y:b.y+b.rad+24};
  if(!w||!b){g.visible=g.userData.ln.visible=false;return}
  const tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS),y0=(gOK(tx,ty)?HT[ty*TW+tx]:LAND)+.1;g.visible=true;
  g.position.set(w.x/TS,y0,w.y/TS);g.scale.setScalar(set||ph?1:.7);g.userData.cl.rotation.y=Math.sin(clockT*3)*.25;const q=1+Math.sin(clockT*4)*.12;g.userData.rg.scale.set(q,q,q);
  const L=g.userData.ln;L.visible=act[i]||ph;if(L.visible){const a=g.userData.lg.attributes.position;a.setXYZ(0,b.x/TS,(b.bh||LAND)+.8,b.y/TS);a.setXYZ(1,w.x/TS,y0+.4,w.y/TS);a.needsUpdate=true;g.userData.lg.computeBoundingSphere()}})};
/* ---- voxel clouds ---- */
const CLN=36,cloudM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8890a0,transparent:true,opacity:.92}),CLN*4);cloudM.frustumCulled=false;scene.add(cloudM);
const CLD=[];for(let i=0;i<CLN;i++)CLD.push({x:Math.random()*400,z:Math.random()*400,y:92+Math.random()*14,w:6+Math.random()*10,d:5+Math.random()*7,s:1+Math.random()*.6});
function syncClouds(){const o=new THREE.Object3D();let n=0;for(const c of CLD){const px=((c.x+clockT*1.2*c.s-CAM.x+200)%400+400)%400-200+CAM.x,pz=((c.z-CAM.z+200)%400+400)%400-200+CAM.z;
  for(let k=0;k<4;k++){o.position.set(px+(k-1.5)*c.w*.3,c.y+(k%2)*1.2,pz+((k*7)%3-1)*c.d*.25);o.scale.set(c.w*(.5+.2*(k%3)),2.6,c.d*(.6+.15*(k%2)));o.updateMatrix();cloudM.setMatrixAt(n++,o.matrix)}}
 cloudM.instanceMatrix.needsUpdate=true}
/* ---- swarm rendering: one instanced draw per skin, limbs animated in the vertex shader (no per-zombie objects) ---- */
const SWR={meshes:null,cap:4000},SWU={value:0},SWN8={value:0},SWPX=.023,SWHIP=12*SWPX,SWSH=22*SWPX;

function swMat(){const m=new THREE.MeshLambertMaterial({vertexColors:true});m.onBeforeCompile=function(sh){sh.uniforms.uT=SWU;sh.uniforms.uN=SWN8;sh.uniforms.uLMax=LMU;
 sh.vertexShader='attribute vec4 iPos;attribute vec3 iAnim;attribute float aPart;attribute float aGl;attribute float aSk;uniform float uT;varying vec3 vLP;varying float vGl;\n'+sh.vertexShader
  .replace('#include <color_vertex>','#include <color_vertex>\n{float zh=fract(iAnim.x*5.17),zb=.9+.2*fract(iAnim.x*11.3);vec3 zt=zh<.25?vec3(.9,1.07,.86):zh<.5?vec3(1.07,1.02,.88):zh<.75?vec3(.93,.96,1.07):vec3(1.02,.92,.96);vColor.rgb*=mix(vec3(1.),zt*zb,aSk);}')
  .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{float cy0=cos(iPos.w),sy0=sin(iPos.w);objectNormal=vec3(objectNormal.x*cy0+objectNormal.z*sy0,objectNormal.y,-objectNormal.x*sy0+objectNormal.z*cy0);}')
  .replace('#include <begin_vertex>',`vec3 p=position;vLP=position;vGl=aGl;float ph=iAnim.x+uT*iAnim.z;
 if(aPart>.5&&aPart<2.5){float sd=aPart<1.5?-1.:1.;float a=-1.42+.2*sin(ph*.9+sd*1.3)+(fract(iAnim.x*7.31+sd*.37)-.5)*.42;if(fract(iAnim.x*13.7)<.11&&sd<0.)a=-.26+.06*sin(ph*.8);vec3 q=p-vec3(0.,${SWSH.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWSH.toFixed(4)},0.);p.z+=${((SWSH-SWHIP)*.22).toFixed(4)};p.x+=sin(ph*.5)*${((SWSH-SWHIP)*.08).toFixed(4)};}
 else if(aPart>2.5){float sd=aPart<3.5?-1.:1.;float a=sd*.62*sin(ph);vec3 q=p-vec3(0.,${SWHIP.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWHIP.toFixed(4)},0.);}
 else{p.z+=max(0.,p.y-${SWHIP.toFixed(4)})*.22;p.x+=sin(ph*.5)*max(0.,p.y-${SWHIP.toFixed(4)})*.08;}
 p.y+=abs(sin(ph))*.02;p*=iAnim.y;float cy=cos(iPos.w),sy=sin(iPos.w);vec3 transformed=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy)+iPos.xyz;`);
 sh.fragmentShader='varying vec3 vLP;varying float vGl;uniform float uN;uniform float uLMax;\n'+GLN+sh.fragmentShader
  .replace('#include <color_fragment>','#include <color_fragment>\n{diffuseColor.rgb*=.9+.18*vn3(vLP*26.);}').replace('#include <aomap_fragment>','#include <aomap_fragment>'+GLTOON).replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb+=vGl*vColor*.3;');FOWH.call(this,sh)};return m}
function swInitR(){const mat=swMat();
 SWR.meshes=SWV.map(([kind,v])=>{const src=swGeoV(zSpec(kind,v)),g=new THREE.InstancedBufferGeometry();g.setIndex(src.index);for(const k of['position','normal','color','aPart','aGl','aSk'])g.setAttribute(k,src.attributes[k]);
  const pos=new Float32Array(SWR.cap*4),anim=new Float32Array(SWR.cap*3),ip=new THREE.InstancedBufferAttribute(pos,4),ia=new THREE.InstancedBufferAttribute(anim,3);ip.setUsage(THREE.DynamicDrawUsage);ia.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('iPos',ip);g.setAttribute('iAnim',ia);g.instanceCount=0;const mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);return{mesh,geo:g,pos,anim,ip,ia}})}
/* acid puddles: flat green discs that shrink as they dry, bubbles rising */
const PUDM=(()=>{const gg=new THREE.CircleGeometry(1,20);gg.rotateX(-Math.PI/2);const m=new THREE.MeshBasicMaterial({color:0x8fd030,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const im=new THREE.InstancedMesh(gg,m,48);im.count=0;im.frustumCulled=false;im.renderOrder=2;scene.add(im);return im})();
function pudRender(){let n=0;const o=new THREE.Object3D(),RR=CAM.dist*1.7+26;for(const P of PUD){const X=P.x/TS,Z=P.y/TS;if(Math.abs(X-CAM.x)>RR||Math.abs(Z-CAM.z)>RR||!fowVisAt(P.x,P.y))continue;
  const a=Math.min(1,P.t/1.5)*Math.min(1,(P.T-P.t)/.25),r=P.r/TS*(.35+.65*a),h=gh(X,Z)+.03;o.position.set(X,h,Z);o.rotation.set(0,(P.x*.013)%6.28,0);o.scale.set(r,1,r*.86);o.updateMatrix();PUDM.setMatrixAt(n++,o.matrix);
  glow(X,h+.05,Z,r*.45,.35,.85,.1,.12*a);for(let k=0;k<3;k++){const an=k*2.1+P.x*.01,rr=r*(.25+.2*k),ph=(clockT*1.1+k*.37+P.y*.001)%1;glow(X+Math.cos(an)*rr,h+.03+ph*.14,Z+Math.sin(an)*rr,.05*(1-ph)+.02,.6,1,.25,.6*a*(1-ph))}}
 PUDM.count=n;if(n)PUDM.instanceMatrix.needsUpdate=true}
/* a lit bomber: the fuse sparks and the keg glows */
function mutGlow(u){const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),k=.5+.5*Math.sin(clockT*(u.type==='acid'?2.2:3.1)+((u.uid|0)&15));
 if(u.type==='bomber'){const f=.17*s;glow(X+Math.sin(fa)*f,g0+.46*s,Z+Math.cos(fa)*f,.34*s,1,.5,.12,.16+.12*k)}else{const f=-.13*s;glow(X+Math.sin(fa)*f,g0+.6*s,Z+Math.cos(fa)*f,.3*s,.5,1,.2,.12+.1*k)}}
function fuseFx(u){const s=1.5*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),h=g0+.5*s,bx=X+Math.sin(fa)*.17*s,bz=Z+Math.cos(fa)*.17*s,k=.55+.45*Math.sin(clockT*38);
 glow(bx,h,bz,.2+.12*k,1,.75,.3,.95);glow(bx,h,bz,.55,1,.4,.1,.25*k);if(Math.random()<.5)puff(u.x+Math.sin(fa)*7,u.y+Math.cos(fa)*7,'#ffd060',1,30,{T:.3,z:h-g0+.05,vz:2,g:6,s:.05})}
/* red eyes in the dark: at night a zombie you cannot see (outside the light, or in the fog) shows only its eyes; in the light they go out */
/* the eyes are queued and drawn after every other glow of the frame, so lamps, fires and arrows always keep theirs */
const EYQ=[];const eg=(x,h,z,s,r,g2,b,a)=>EYQ.push(x,h,z,s,r,g2,b,a);function eyeFlush(){for(let k=0;k<EYQ.length;k+=8)glow(EYQ[k],EYQ[k+1],EYQ[k+2],EYQ[k+3],EYQ[k+4],EYQ[k+5],EYQ[k+6],EYQ[k+7]);EYQ.length=0}
function eyePair(X,Z,h,fa,lat,fwd,sz,a){const fx=Math.sin(fa),fz=Math.cos(fa),x=X+fx*fwd,z=Z+fz*fwd;sz*=Math.max(1,CAM.dist/13);if(CAM.dist>22){eg(x,h,z,sz*1.5,1,.13,.05,a);eg(x,h,z,sz*.5,1,.6,.4,a*.7);return}const ex=fz*lat,ez=-fx*lat;eg(x+ex,h,z+ez,sz,1,.13,.05,a);eg(x-ex,h,z-ez,sz,1,.13,.05,a)}
const litV=(X,Z)=>{const i=Math.floor(X)-FOWU.litP.value.x,j=Math.floor(Z)-FOWU.litP.value.y;return i<0||j<0||i>=LITN||j>=LITN?0:litTex[j*LITN+i]};
const darkA=(X,Z)=>Math.min(1,nightK*1.3)*Math.max(0,1-litV(X,Z)/150);
function swEyes(i,X,Z,h,fa,a){const s=(SW.k[i]?1.12:.98)*UNITK;eyePair(X,Z,h+.64*s,fa,.05*s,.1*s,.05+.04*s,a*(.72+.28*Math.sin(clockT*1.7+(SW.sd[i]&255))))}
const EYO0=[.642,.1],EYO={brute:[.577,.12],acid:[.594,.135],bomber:[.596,.09],miner:[.621,.11],runner:[.636,.113]};
const ZSC={zombie:1.35,husk:1.0,runner:1.2,brute:2.15,bomber:1.5,acid:1.3,miner:1.35};let ZEYN=0;
function zEyes(u,a,vis){if(ZEYN>=200||a<.03)return;ZEYN++;const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS;const eo=EYO[u.type]||EYO0;eyePair(X,Z,(vis&&u.dy!=null?u.dy:gh(X,Z))+eo[0]*s,vis&&u.fa!==undefined?u.fa:u.face||0,.051*s,eo[1]*s,.045+.035*s,a*(.72+.28*Math.sin(clockT*1.7+((u.uid|0)&255))))}
function swRender(dt){if(!SWR.meshes)swInitR();const M=SWR.meshes,cnt=SWR.cnt||(SWR.cnt=new Int32Array(M.length));cnt.fill(0);SWU.value=clockT;SWN8.value=nightK;
 if(SW.n){const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS,al=Math.min(1,SW.acc/SWDT),k=Math.min(1,dt*9);let ng=0;
  const FP_=_uFr.planes,Fa=[],Fb=[],Fc=[],Fd=[];for(let q=0;q<6;q++){const p=FP_[q];Fa.push(p.normal.x);Fb.push(p.normal.y);Fc.push(p.normal.z);Fd.push(p.constant+1.6)}
  for(let i=0;i<SW.n;i++){const x1=SW.x[i],y1=SW.y[i];if(x1-cx>R||cx-x1>R||y1-cy>R||cy-y1>R||SW.hp[i]<=0)continue;
   {const X=x1/TS,Y=HT[SW.ti[i]]+.5,Z=y1/TS;let out=false;for(let q=0;q<6;q++)if(Fa[q]*X+Fb[q]*Y+Fc[q]*Z+Fd[q]<0){out=true;break}if(out)continue}
   if(!fowVisAt(x1,y1)){if(nightK>.25&&ng<500){ng++;let ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);swEyes(i,x1/TS,y1/TS,gh(x1/TS,y1/TS),ta,Math.min(1,nightK*1.3))}continue}const kd=SW.k[i],vi=swVar(SW.sd[i]),j=cnt[vi];if(j>=SWR.cap)continue;
   const x=SW.px[i]+(x1-SW.px[i])*al,y=SW.py[i]+(y1-SW.py[i])*al;let fa=SW.fa[i],ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);fa+=angd(fa,ta)*k;SW.fa[i]=fa;
   const sd=SW.sd[i],D=SWD[SW.ti[i]];let h=gh(x/TS,y/TS);if(D>3)h+=((sd>>4)&15)/15*Math.min(1.5,(D-3)*.045);
   const m=M[vi],P=m.pos,A=m.anim;P[j*4]=x/TS;P[j*4+1]=h;P[j*4+2]=y/TS;P[j*4+3]=fa;if(nightK>.25&&ng<500){const ea=darkA(x/TS,y/TS);if(ea>.03){ng++;swEyes(i,x/TS,y/TS,h,fa,ea)}}A[j*3]=(sd&1023)*.00614;A[j*3+1]=(kd?1.12:.98)*(.92+((sd>>10)&7)*.024)*UNITK;A[j*3+2]=(5.4+((sd>>6)&7)*.3)*1.25; cnt[vi]=j+1}}
 for(let q=0;q<M.length;q++){const m=M[q],c=cnt[q];m.geo.instanceCount=c;m.mesh.visible=c>0;if(c){m.ip.updateRange.offset=0;m.ip.updateRange.count=c*4;m.ip.needsUpdate=true;m.ia.updateRange.offset=0;m.ia.updateRange.count=c*3;m.ia.needsUpdate=true}}}
/* ---- zombie route lines: a glowing ribbon with chevrons flowing toward the castle, drawn only ahead of a living horde ---- */
const routeMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4,
 vertexShader:'attribute vec2 auv;varying vec2 vUv;void main(){vUv=auv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float v=abs(vUv.y-.5)*2.;float edge=1.-smoothstep(.55,1.,v);float core=1.-smoothstep(0.,.3,v);float f=fract(vUv.x*.38-uT*1.15);float ch=1.-smoothstep(0.,.08,abs(f-.5+v*.24)-.06);float fade=smoothstep(0.,6.,vUv.x)*clamp(vUv.y*0.+1.,0.,1.);vec3 c=mix(vec3(.55,.03,.02),vec3(1.,.4,.22),clamp(core*.5+ch*.9,0.,1.));float a=edge*(.32+.5*ch+.18*core)*fade;gl_FragColor=vec4(c,a);}'});
const beamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float y=vUv.y;float s=.55+.45*sin(y*38.-uT*7.);float a=(1.-y)*(1.-y)*(.55+.35*s);gl_FragColor=vec4(vec3(1.,.18,.1)*a,a);}'});
const BEAMS=[];function beamAt(i,x,y,z){let m=BEAMS[i];if(!m){m=new THREE.Mesh(new THREE.CylinderGeometry(.55,.9,26,12,1,true),beamMat);m.renderOrder=4;scene.add(m);BEAMS[i]=m}m.position.set(x,y+13,z);m.visible=true}
let routeMesh=null,routeT=-9;const LANE_REAR=[];
/* lanes with a living horde, and for each the rear-most point of the horde along its route */
function visLanes(){const s=new Set();for(const u of units)if(u.t===1&&u.lane>=0)s.add(u.lane);if(typeof SWARMS!=='undefined')for(const w of SWARMS)if(w.n>0)s.add(w.lane);return s}
function laneRear(){const L=visLanes(),cnt={};for(const k of L)LANE_REAR[k]=1e9;
 for(const u of units){if(u.t!==1||u.lane<0||!L.has(u.lane))continue;const k=u.lane;cnt[k]=(cnt[k]||0)+1;if(cnt[k]>260&&((u.uid|0)%4))continue;const P=ROUTES[k].pts;let bi=u.rpi|0,bd=1e18;const x=u.x/TS,y=u.y/TS;
  const a0=u.rpi===undefined?0:Math.max(0,u.rpi-14),a1=u.rpi===undefined?P.length:Math.min(P.length,u.rpi+15);for(let i=a0;i<a1;i++){const dx=P[i][0]-x,dy=P[i][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}u.rpi=bi;if(bi<LANE_REAR[k])LANE_REAR[k]=bi}
 if(typeof SWARMS!=='undefined')for(const w of SWARMS)if(w.n>0)LANE_REAR[w.lane]=Math.min(LANE_REAR[w.lane],Math.max(0,swarmBackIdx(w)));
 for(const k of L)if(LANE_REAR[k]>=1e9)LANE_REAR[k]=0;return L}
function buildRoutes(){routeT=-9}
function updateRoutes(){if(clockT-routeT<.3)return;routeT=clockT;const L=laneRear(),P3=[],UV=[],IX=[];let n=0,bi=0;
 const sy=(x,z)=>{const tx=Math.floor(x),tz=Math.floor(z);if(!gOK(tx,tz))return LAND;const i=tz*TW+tx;return(ter[i]===1?WLV:HT[i])+.15};
 for(const k of L){const R=ROUTES[k],P=R.pts,ld=i=>CHK.has(keyOf((P[i][0]/CH)|0,(P[i][1]/CH)|0)),r0=Math.max(0,(LANE_REAR[k]|0)-2);let ul=0,prev=null;
  for(let i=r0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(!ld(i)||!ld(i+1)){prev=null;ul+=hyp(b[0]-a[0],b[1]-a[1]);continue}const dx=b[0]-a[0],dz=b[1]-a[1],l=hyp(dx,dz)||1,nx=-dz/l*.5,nz=dx/l*.5,st=Math.max(1,Math.round(l/.5));
   for(let q=(prev?1:0);q<=st;q++){const t=q/st,x=a[0]+dx*t,z=a[1]+dz*t,y=sy(x,z),u2=ul+l*t;P3.push(x-nx,y,z-nz,x+nx,y,z+nz);UV.push(u2,0,u2,1);if(prev!==null||q>0){const v=n;IX.push(v-2,v-1,v+1,v-2,v+1,v);}n+=2;prev=1}
   ul+=l}
  if(r0<5&&ld(0)){const s0=P[0];beamAt(bi++,s0[0],sy(s0[0],s0[1]),s0[1])}}
 for(let k=bi;k<BEAMS.length;k++)BEAMS[k].visible=false;
 if(routeMesh){scene.remove(routeMesh);routeMesh.geometry.dispose()}routeMesh=null;
 if(IX.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3));g.setAttribute('auv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(IX);g.computeBoundingSphere();routeMesh=new THREE.Mesh(g,routeMat);routeMesh.frustumCulled=false;routeMesh.renderOrder=2;scene.add(routeMesh)}}
let tfMesh=null,tfT=-9,tfN=-1;
function updateTf(){if(clockT-tfT<.25)return;tfT=clockT;let dn=0;for(const s of structs)if(s.dem)dn++;const tot=tfo.size+dn;if(!tot&&tfN===0)return;tfN=tot;if(tfMesh){scene.remove(tfMesh);tfMesh.geometry.dispose();tfMesh=null}if(!tot)return;const G=newG();
 for(const s of structs)if(s.dem){const bx0=s.x/TS,bz0=s.y/TS,hb=HT[s.tiles[0][1]*TW+s.tiles[0][0]]+((s.bh||0));for(const[x,y]of s.tiles){const h=HT[y*TW+x]+.08;quad(G,[x+.05,h,y+.05],[x+.05,h,y+.95],[x+.95,h,y+.95],[x+.95,h,y+.05],[0,1,0],[1,.2,.15],[1,.2,.15],[1,.2,.15],[1,.2,.15])}bxc(G,bx0,hb+2.6+Math.sin(clockT*4)*.12,bz0,.5,.5,.5,[1,.3,.2])}
 for(const[i,o]of tfo){const x=i%TW,y=(i/TW)|0,h=HT[i]+.06,c=o.t==='raise'?[1,.82,.24]:o.t==='ramp'?[.45,.72,1]:o.t==='unramp'?[1,.25,.2]:[.7,.42,.2];quad(G,[x+.08,h,y+.08],[x+.08,h,y+.92],[x+.92,h,y+.92],[x+.92,h,y+.08],[0,1,0],c,c,c,c);const d=[.2,.14,.06];bxc(G,x+.5,h,y+.5,.2,.5,.2,o.t==='raise'?[1,1,.6]:[.5,.3,.15])}
 tfMesh=new THREE.Mesh(toGeo(G),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));tfMesh.frustumCulled=false;tfMesh.renderOrder=3;scene.add(tfMesh)}
function pulseRoutes(){updateTf();updateRoutes();routeMat.uniforms.uT.value=clockT;beamMat.uniforms.uT.value=clockT}
/* ---- day / night ---- */
const SKYD=new THREE.Color(0x9ccaf0),SKYN=new THREE.Color(0x141c3c),SKYU=new THREE.Color(0xf0a070),_sk=new THREE.Color(),SUND=new THREE.Color(0xfff1d2),SUNU=new THREE.Color(0xff9a60),_sc=new THREE.Color();
let nightK=0,lampT=0,lampN=0;
function nightTarget(){if(!inGame||!started)return 0;return nightSim()}
const LP=[];for(let i=0;i<6;i++){const l=new THREE.PointLight(0xff9a48,0,17,2);l.position.set(0,-50,0);scene.add(l);LP.push(l)}
const LAMPM=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xffc070}),400),HALOM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff9a40,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}),400);
[LAMPM,HALOM].forEach(m=>{m.frustumCulled=false;m.count=0;scene.add(m)});
let LAMPS=[];
function lampList(){LAMPS=[];for(const s of structs){if(s.t!==0||s.prog<1)continue;const b=s.bh||0;
  if(s.type==='tower')LAMPS.push([s.x,s.y,b+(s.sz===2?(s.tier===0?4.2:4.6):(s.tier===0?5.45:4.95)),1]);else if(s.type==='gate'){LAMPS.push([s.x,s.y,b+2.6,1])}
  else if(s.type==='castle'){const[fx,fy]=DIR4[(s.rot|0)&3],st=s.tier!==0;for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const fr=dx*fx+dy*fy>0,K=s.sz===5?1.9:1.04;if(st)LAMPS.push([s.x+dx*TS*K,s.y+dy*TS*K,b+(s.sz===5?(fr?6.2:6.9):(fr?5.85:6.6)),1.1]);else if(fr)LAMPS.push([s.x+dx*TS*K*1.04,s.y+dy*TS*K*1.04,b+(s.sz===5?3.1:2.69),.9])}
   const ox=(1.5-1.18)*TS;LAMPS.push(st?[s.x-fx*ox,s.y-fy*ox,b+8.85,1.6]:[s.x-fx*.55*TS,s.y-fy*.55*TS,b+3.44,1.1])}
  else if(s.type==='wall'&&((s.tiles[0][0]+s.tiles[0][1]*3)%5===0))LAMPS.push([s.x,s.y,b+2.2,.6]);else if(s.type==='torch')LAMPS.push([s.x,s.y,b+1.45,.85]);else if(s.type==='market')LAMPS.push([s.x,s.y,b+1.5,.55])}}
function applyLamps(){const N=nightK;if(N<.02){LAMPM.count=0;HALOM.count=0;LP.forEach(l=>l.intensity=0);return}
 if(clockT-lampT>.5){lampT=clockT;lampList()}
 const cx=CAM.x*TS,cy=CAM.z*TS,R=(CAM.dist*1.8+30)*TS;let n=0;const near=[];
 for(const L of LAMPS){const dd=hyp(L[0]-cx,L[1]-cy);if(dd>R)continue;const fl=1+.12*Math.sin(clockT*9+L[0]*.01+L[1]*.02);
  _o.position.set(L[0]/TS,L[2],L[1]/TS);_o.rotation.set(0,clockT,0);const sc=.11*L[3]*N;_o.scale.set(sc,sc*1.5,sc);_o.updateMatrix();LAMPM.setMatrixAt(n,_o.matrix);
  glow(L[0]/TS,L[2],L[1]/TS,.8*L[3]*fl,1,.66,.3,.7*N);glow(L[0]/TS,L[2]-.2,L[1]/TS,2.2*L[3],1,.5,.2,.09*N*fl);n++;if(n>=400)break;if(L[3]>=1)near.push([dd,L])}
 LAMPM.count=n;HALOM.count=0;LAMPM.instanceMatrix.needsUpdate=true;
 near.sort((a,b)=>a[0]-b[0]);for(let i=0;i<6;i++){const l=LP[i],q=near[i];if(q){l.position.set(q[1][0]/TS,q[1][2]+.4,q[1][1]/TS);l.intensity=(q[1][3]>1?.58:.4)*N*(1+.1*Math.sin(clockT*8+i*2))}else l.intensity=0}}
/* territory borders drawn on the ground */
let terrM=null,terrT=-9;
function updateTerr(){if(clockT-terrT<.9)return;terrT=clockT;if(terrM){scene.remove(terrM);terrM.geometry.dispose();terrM=null}
 if(inGame)rebuildOwn();const P=[],C=[],col=new THREE.Color(),cx=CAM.x,cz=CAM.z,R=150,s3=(x0,y0,z0,x1,y1,z1)=>{P.push(x0,y0,z0,x1,y1,z1);C.push(col.r,col.g,col.b,col.r,col.g,col.b)},
  hA=(i,j)=>gOK(i,j)?gh(i+.5,j+.5):LAND,
  ex=(x,z,n)=>{let ph=null;for(let t=x;t<x+n;t++){const h=Math.max(hA(t,z-1),hA(t,z))+.1;if(ph!==null&&ph!==h)s3(t,ph,z,t,h,z);s3(t,h,z,t+1,h,z);ph=h}},
  ez=(x,z,n)=>{let ph=null;for(let t=z;t<z+n;t++){const h=Math.max(hA(x-1,t),hA(x,t))+.1;if(ph!==null&&ph!==h)s3(x,ph,t,x,h,t);s3(x,h,t,x,h,t+1);ph=h}};
 if(false){col.set(PAL[THEME.c][1]);const i0=Math.max(0,(cx-R)>>1),i1=(cx+R)>>1,j0=Math.max(0,(cz-R)>>1),j1=(cz+R)>>1;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(!OWN.has(j*4096+i))continue;const x=i*2,z=j*2;
   if(!OWN.has(j*4096+i-1))ez(x,z,2);if(!OWN.has(j*4096+i+1))ez(x+2,z,2);if(!OWN.has((j-1)*4096+i))ex(x,z,2);if(!OWN.has((j+1)*4096+i))ex(x,z+2,2)}}
 for(const b of BASES){if(!b.alive||hyp(b.tx-cx,b.ty-cz)>R+60)continue;col.set(PAL[b.ci][1]);const r=aiR(b),x0=b.tx-r,x1=b.tx+r,z0=b.ty-r,z1=b.ty+r;
  for(let t=x0;t<x1;t+=2){ex(t,z0,2);ex(t,z1,2)}for(let t=z0;t<z1;t+=2){ez(x0,t,2);ez(x1,t,2)}}
 if(!P.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 terrM=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:1}));terrM.frustumCulled=false;scene.add(terrM)}
function applyDay(dt){const tg=nightTarget();nightK+=(tg-nightK)*Math.min(1,(dt||.016)*1.4);const N=nightK,sm=1-N,dusk=Math.pow(Math.sin(N*Math.PI),2);
 _sk.copy(SKYN).lerp(SKYD,sm).lerp(SKYU,dusk*.45);scene.background.copy(_sk);scene.fog.color.copy(_sk);hemi.intensity=.3+.32*sm;sun.intensity=.12+.66*sm;LMU.value=hemi.intensity+sun.intensity;sun.color.copy(SUND).lerp(SUNU,dusk*.7);dayK=sm;applyLamps()}
let dayK=1;
let frameN=0;
function render3D(dt){frameN++;updateCamera(dt);updateChunks(7);
 let anyDmg=false;for(const s of structs)if(s.t===0&&(s.hp<s.max||s.prog<1)){anyDmg=true;break}
 {const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS;camera.updateMatrixWorld();_uPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_uFr.setFromProjectionMatrix(_uPV);
  ZEYN=0;for(const u of units){if(u.shel||Math.abs(u.x-cx)>R||Math.abs(u.y-cy)>R)continue;if(u.t!==0&&!fowVisAt(u.x,u.y)){if(u.t===1&&nightK>.25)zEyes(u,Math.min(1,nightK*1.3),0);continue}if(u.dy==null)u.dy=gh(u.x/TS,u.y/TS);_uSp.center.set(u.x/TS,u.dy+.65,u.y/TS);
   if(!_uFr.intersectsSphere(_uSp)){const g0=u.m;if(g0&&g0.userData){g0.userData.frame=frameN;g0.visible=false}continue}animUnit(u,dt,anyDmg,frameN);if(u.m)u.m.visible=true;if(u.fuse>0)fuseFx(u);else if(u.type==='bomber'||u.type==='acid')mutGlow(u);if(u.t===1&&nightK>.25)zEyes(u,darkA(u.x/TS,u.y/TS),1)}}
 animCorpses(dt);swRender(dt);saplRender();pudRender();
 {let ci=0;const WK=WORK*(RS2.done.tools?.75:1);for(const u of units){if(ci>=16)break;if(u.t!==0||u.type!=='peasant'||!(u.work>0)||u.carry||u.tl<0||u.o)continue;const j=u.job;if(j!=='w'&&j!=='s'&&j!=='g')continue;const tx=u.tl%TW,ty=(u.tl/TW)|0;if(Math.abs(tx-CAM.x)>34||Math.abs(ty-CAM.z)>34)continue;if(dist(u.x,u.y,(tx+.5)*TS,(ty+.5)*TS)>46)continue;
  const st=Math.max(0,Math.min(9,Math.floor(u.work/WK*10))),h=HT[u.tl];if(j==='w')crackAt(ci++,tx+.5,h,ty+.5,.34,.92,.34,st);else crackAt(ci++,tx+.5,h,ty+.5,.86,.82,.86,st)}for(let k=ci;k<CRKP.length;k++)CRKP[k].visible=false}
 for(const[u,g]of unitG)if(g.userData.frame!==frameN){scene.remove(g);unitG.delete(u);u.m=null;if(g.userData.mat)g.userData.mat.dispose()}
 {const sb=selB&&structs.includes(selB)?selB:castleSel?HOMEC():null,on=!!sb;MCSEL.visible=on;selRangeShow(sb,sb&&rangeOf(sb));groupBoxes(selBs(),sb);if(on){const selB=sb;const H=selH(selB),w=selB.type==='gate'?(selB.ax?1:(selB.gl||2)):selB.sz,d=selB.type==='gate'?(selB.ax?(selB.gl||2):1):selB.sz;MCSEL.position.set(selB.x/TS,selB.bh||LAND,selB.y/TS);MCSEL.scale.set(w+.04,H,d+.04)}}
 MCHOV.visible=false;if(!mode&&started&&!over&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)){const p=pickGround(mouse.x,mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const o=occ.get(ty*TW+tx);if(!o){const h=HT[ty*TW+tx],tr=ter[ty*TW+tx];MCHOV.visible=true;MCHOV.position.set(tx+.5,tr>=2&&tr<=4?h:h-1,ty+.5);MCHOV.scale.set(1.01,tr>=2&&tr<=4?(tr===2?1.9:.95):1.01,1.01)}}}}
 selRing.visible=false;if(false){selRing.position.set(selB.x/TS,(selB.bh||LAND)+.2,selB.y/TS);const q=selB.sz*.78+Math.sin(clockT*4)*.05;selRing.scale.set(q,q,q)}
 for(const s of SCAF){if(s.prog>=1||!structs.includes(s)){scene.remove(s.scaf);s.scaf=null;SCAF.delete(s)}}
 for(const s of structs){if(s.t===2&&s.o3)s.o3.visible=fowSeenAt(s.x,s.y);if(s.t===0&&s.prog<1&&!s.scaf&&s.o3){const H={wall:2.1,gate:2.8,tower:4.6,castle:6.2,barracks:3.1,farm:.8,storage:2.3,house:3.1,academy:3.4,market:2.3,forester:2.2,guild:3.0,torch:1.5,keep:4.9}[s.type]||2,w=s.type==='gate'?(s.gl||2)*1.05:s.sz,d=s.type==='gate'?.9:s.sz,k=s.type+w+'x'+d+'x'+H,m=new THREE.Mesh(SGEO[k]||(SGEO[k]=scafGeo(w,d,H)),matV);m.position.set(s.x/TS,s.bh||HT[s.ty*TW+s.tx],s.y/TS);if(s.type==='gate'&&s.ax)m.rotation.y=Math.PI/2;scene.add(m);s.scaf=m;SCAF.add(s)}
  if(s.prog>=1&&s.hp<s.max*.3&&s.hp>0&&s.o3&&Math.abs(s.x/TS-CAM.x)<CAM.dist*2+30&&Math.abs(s.y/TS-CAM.z)<CAM.dist*2+30){const fl=.75+.25*Math.sin(clockT*13+s.x)+.15*Math.sin(clockT*29+s.y),hb=(s.bh||LAND)+1.2+(s.sz||1)*.4;glow(s.x/TS,hb,s.y/TS,1.1*(s.sz||1)*fl,1,.42,.1,.5);glow(s.x/TS,hb+.5,s.y/TS,.5*fl,1,.85,.4,.6)}
  if(s.flag)s.flag.rotation.y=Math.sin(clockT*3)*.3;if(s.o3){const p=.2+.8*Math.min(1,s.prog);s.o3.scale.y=p}
  if(s.bolt){const c=s.wcd>0?s.wcd:0,p=c/3.4;s.bolt.visible=p<.5;s.bolt.position.z=-Math.max(0,Math.min(1,(p-.1)/.4))*.55}
  if(s.head){const a=s.aim||0;s.head.rotation.y+=angd(s.head.rotation.y,a)*Math.min(1,dt*8);s.head.position.z=-Math.max(0,s.rec||0)*.18*Math.cos(s.head.rotation.y);s.head.position.x=-Math.max(0,s.rec||0)*.18*Math.sin(s.head.rotation.y)}
  if(s.arm){const a=s.aim||0,c=s.wcd>0?s.wcd:0,rest=.95,fire=-.95;let ang;if(c>5.7)ang=rest+(fire-rest)*sat((6.2-c)/.22);else if(c>.3)ang=fire+(rest-fire)*easeO(sat((5.7-c)/5.2));else ang=rest;
   if(s.tpv){s.tpv.rotation.y+=angd(s.tpv.rotation.y,a)*Math.min(1,dt*2.2);s.arm.rotation.y=0}else s.arm.rotation.y+=angd(s.arm.rotation.y,a)*Math.min(1,dt*3);s.arm.rotation.x=ang;if(s.cw)s.cw.rotation.x=-ang}
  if(s.door){let op=0;for(const u of units)if(u.t===0&&!u.gar&&Math.abs(u.x-s.x)<TS*2.1&&Math.abs(u.y-s.y)<TS*2.1){op=1;break}
   if((op>.5)!==!!s.dopen){s.dopen=op>.5;snd('gate',s.x,s.y)}s.dop+=(op-s.dop)*Math.min(1,dt*(s.door.userData.lv?4:7));if(s.door.userData.lv){const a=s.dop*1.5;s.door.userData.lv[0].rotation.y=a;s.door.userData.lv[1].rotation.y=-a}else s.door.scale.y=Math.max(.08,1-s.dop*.92)}}
 
 WUT.value=clockT;updateLit();syncFx();fireflies(dt);smkFlush();syncClouds();applyDay(dt);updateTerr();pulseRoutes();
 rflagUpd();
 if(mode==='movec'&&!over){const hc=HOMEC();if(hc)govBuild('mv'+ver+':'+structs.length+':'+hc.tx+','+hc.ty+':'+(hc.rot|0)+':'+OWN.size,hc.tx+2,hc.ty+2,41,(x,y)=>moveOK(x,y))}else govHide();
 ghost.visible=rangeRing.visible=false;GB1.g.visible=false;rampPool.forEach(m=>m.visible=false);ghost.material.depthTest=true;if(TGH)TGH.visible=false;if(GBW)GBW.visible=false;
 if(mode&&!over&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))){const p=pickGround(mouse.x,mouse.y);if(p){let tx=Math.floor(p.x),ty=Math.floor(p.z);if(mode==='house'||mode==='farm'||CONNT.has(mode)){const sp=snapM(mode,tx,ty);tx=sp[0];ty=sp[1]}
  if(tx>=0&&ty>=0&&tx<TW&&ty<TH&&gOK(tx,ty)){let good=(mode==='path'?pathOK(tx,ty):valid(tx,ty))&&ok(C[mode]);if(mode==='tower')good=tilesFor('tower',tx,ty,2).every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y)))&&ok(C.tower);if(mode==='ballista'||mode==='trebuchet'){const o=occ.get(ty*TW+tx);good=!!o&&o.type==='tower'&&o.t===0&&o.prog>=1&&!o.weapon&&ok(C[mode])}if(mode==='raise'||mode==='dig')good=tfOK(tx,ty,true)&&ok(C[mode])&&!tfo.has(ty*TW+tx);if(mode==='ramp')good=rampOK(tx,ty)&&!tfo.has(ty*TW+tx);if(mode==='stairs')good=good&&!!stairInfo(tx,ty);if(mode==='path')good=good&&pth[ty*TW+tx]<(RS.done?2:1);if(mode==='barracks')good=tilesFor('barracks',tx,ty,2).every(([x,y])=>gOK(x,y)&&valid(x,y))&&ok(C.barracks);
   let hh=mode==='farm'?.9:mode==='storage'?1.1:mode==='house'?1.4:mode==='academy'?2.2:mode==='market'?1.8:mode==='forester'?1.5:mode==='guild'?2.2:mode==='torch'?1.3:mode==='rally'||mode==='rallyc'?.1:mode==='ramp'?.12:mode==='barracks'?1.9:mode==='tower'?3:mode==='path'?.06:mode==='stairs'?.5:mode==='gate'?2.2:mode==='ballista'||mode==='trebuchet'?3.6:mode==='raise'||mode==='dig'?1:1.7,h0=HT[ty*TW+tx];let gx=1.02,gz=1.02,cx2=tx+.5,cz2=ty+.5;if(mode==='gate'){const ax=gateAxAt(tx,ty);good=gateOK(tx,ty,ax,gateLen)&&ok(C.gate);gx=ax?1.02:gateLen+.02;gz=ax?gateLen+.02:1.02;cx2=tx+(ax?.5:gateLen/2);cz2=ty+(ax?gateLen/2:.5)}if(mode==='tower'||mode==='barracks'||mode==='farm'||mode==='storage'||mode==='house'||mode==='academy'||mode==='market'||mode==='forester'||mode==='guild'){gx=gz=2.02;cx2=tx+1;cz2=ty+1}let yy=h0+hh/2,showG=true;
    if(mode==='barracks'||mode==='farm'||mode==='storage'||mode==='house'||mode==='academy'||mode==='market'||mode==='forester'||mode==='guild'){const t2=tilesFor(mode,tx,ty,2),hs2=t2.map(([x,y])=>HT[y*TW+x]);good=t2.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs2)-Math.min(...hs2)<=2&&ok(C[mode])&&!placeErr(mode,tx,ty);yy=Math.max(...hs2)+hh/2}
    if(mode==='raise'){showG=false;tgShow('block',tx,ter[ty*TW+tx]===1?LAND-1:h0,ty,good)}
    if(mode==='dig'){showG=false;tgShow('block',tx-.015,h0-1.015,ty-.015,good,1.03,true)}
    if(mode==='path'){showG=false;tgShow(stoneOn()?'path2':'path1',tx,h0+.004,ty,good)}
    if(mode==='ballista'||mode==='trebuchet'){const o=occ.get(ty*TW+tx);if(o&&o.type==='tower'&&o.t===0){showG=false;gbwShow(mode,o,(buildRot&3)*Math.PI/2,good)}}
    if(mode==='upgrade'){const o=occ.get(ty*TW+tx);if(o&&o.t===0&&UPC[o.type]&&o.tier===0){showG=false;good=o.prog>=1&&ok(UPC[o.type]);GHO={tier:1,rot:o.rot|0,gl:o.gl||2};try{ghostMake(GB1,o.type,o.tx,o.ty,o.ax|0,good,.62)}finally{GHO=null}}else good=false}
    if(mode==='demolish'){const o=occ.get(ty*TW+tx);good=!!o&&o.t===0&&o.type!=='castle';if(!o&&stairs.has(ty*TW+tx)){good=true;showG=false;(stairs.get(ty*TW+tx).blk?[ty*TW+tx]:rampGroup(ty*TW+tx)).forEach((ii,bi)=>rampBox(bi,(ii%TW)+.5,HT[ii]+.14,((ii/TW)|0)+.5,1,.3,1,false))}else if(o){gx=o.sz*1.04;gz=o.sz*1.04;cx2=o.x/TS;cz2=o.y/TS;hh=2.4;yy=h0+hh/2}else showG=false;ghost.material.color.set(good?0xff9a3c:0xff5555)}
    if(mode==='ramp'){showG=false;tgShow('ramp'+(buildRot&3),tx,h0,ty,good)}
    if(mode==='movec')good=moveOK(tx,ty)&&ok(C.movec);ghost.material.color.set(good?0x66ff66:0xff5555);ghost.scale.set(gx,hh,gz);ghost.position.set(cx2,yy,cz2);ghost.visible=showG&&!GBM.has(mode);if(GBM.has(mode)){const a2=mode==='gate'?gateAxAt(tx,ty):0,mc=mode==='movec';ghostMake(GB1,mc?'castle':mode,mc?tx-2:tx,mc?ty-2:ty,a2,good,.62)}
   if(mode==='tower'||mode==='ballista'||mode==='trebuchet'){const rr=mode==='tower'?TOWR+(stoneOn()?1.5:0):mode==='ballista'?18:32;rangeRing.scale.set(rr/7.5,1,rr/7.5);rangeRing.position.set(cx2,h0+.15,cz2);rangeRing.visible=true}}}}
 eyeFlush();glowFlush();scene.updateMatrixWorld();uiFlush();postRender(scene,camera,true)}

/* ================= ARCANE POST-PROCESS =================
   pass 1: the scene into a colour + depth target; pass 2: black ink outlines where the depth bends or jumps (silhouettes AND creases),
   painted sky, painterly grade (cool shadows, warm light, rich colour, soft S-curve, vignette); pass 3: FXAA */
const POST=(()=>{const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const FS=`uniform sampler2D tC,tD;uniform vec2 px,nf,fogR;uniform float lw,uN,uT,uSky,uInk;uniform mat4 uIPV;uniform vec3 uCam,uHor,uZen;varying vec2 vUv;
 float W(vec2 u){float d=texture2D(tD,u).x;return(nf.y-d*(nf.y-nf.x))/(nf.x*nf.y);}
 float hs2(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
 float vn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hs2(i),hs2(i+vec2(1.,0.)),f.x),mix(hs2(i+vec2(0.,1.)),hs2(i+vec2(1.,1.)),f.x),f.y);}
 void main(){vec3 c=texture2D(tC,vUv).rgb;float d0=texture2D(tD,vUv).x;
  if(d0>=.99999){if(uSky>.5){vec4 pw=uIPV*vec4(vUv*2.-1.,1.,1.);vec3 rd=normalize(pw.xyz/pw.w-uCam);float el=clamp(rd.y,0.,1.);
    vec3 sky=mix(uHor,uZen,smoothstep(0.,.55,el));vec2 cp=rd.xz/(rd.y+.18)*1.4+vec2(uT*.012,uT*.004);
    float cl=vn2(cp)*.58+vn2(cp*2.3+3.)*.3+vn2(cp*5.2+7.)*.12;float cm=smoothstep(.5,.66,cl)*smoothstep(.02,.22,el);
    sky=mix(sky,mix(uHor*1.1+vec3(.07,.05,.03),vec3(1.,.92,.84),.45),cm*.7);float ce=(1.-smoothstep(0.,.05,abs(cl-.5)))*smoothstep(.02,.22,el);sky=mix(sky,sky*.55,ce*.5);c=sky;}}
  else if(uInk>.5){vec2 o=px*lw;
   float w0=W(vUv),wl=W(vUv-vec2(o.x,0.)),wr=W(vUv+vec2(o.x,0.)),wd=W(vUv-vec2(0.,o.y)),wu=W(vUv+vec2(0.,o.y)),wa=W(vUv+o),wb=W(vUv-o),wc=W(vUv+vec2(o.x,-o.y)),we=W(vUv+vec2(-o.x,o.y));
   float lap=abs(wl+wr-2.*w0)+abs(wd+wu-2.*w0)+.5*(abs(wa+wb-2.*w0)+abs(wc+we-2.*w0));
   float jmp=max(max(abs(wl-w0),abs(wr-w0)),max(abs(wd-w0),abs(wu-w0)));
   float z=1./w0,e=max(smoothstep(.0035,.011,lap/w0),smoothstep(.02,.06,jmp/w0));
   e*=1.-smoothstep(fogR.x,mix(fogR.x,fogR.y,.7),z);
   c=mix(c,c*vec3(.07,.06,.09),e*.95);}
  float L=dot(c,vec3(.299,.587,.114));c=mix(vec3(L),c,1.08);
  vec3 cool=mix(vec3(.85,.96,1.1),vec3(.8,.78,1.16),uN),warm=mix(vec3(1.06,1.,.9),vec3(1.14,.9,.86),uN);
  c*=mix(cool,warm,smoothstep(.12,.72,L));c=clamp(c,0.,1.);c=mix(c,c*c*(3.-2.*c),.32);
  vec2 q=vUv-.5;c*=1.-dot(q,q)*.5;gl_FragColor=vec4(c,1.);}`;
 const FX=`uniform sampler2D tC;uniform vec2 px;uniform float uVig;varying vec2 vUv;
 void main(){vec3 nw=texture2D(tC,vUv+vec2(-1.,-1.)*px).rgb,ne=texture2D(tC,vUv+vec2(1.,-1.)*px).rgb,sw=texture2D(tC,vUv+vec2(-1.,1.)*px).rgb,se=texture2D(tC,vUv+vec2(1.,1.)*px).rgb,m=texture2D(tC,vUv).rgb;
  vec3 lu=vec3(.299,.587,.114);float a=dot(nw,lu),b=dot(ne,lu),c=dot(sw,lu),d=dot(se,lu),e=dot(m,lu),mn=min(e,min(min(a,b),min(c,d))),mx=max(e,max(max(a,b),max(c,d)));
  vec2 dir=vec2(-((a+b)-(c+d)),((a+c)-(b+d)));float rd=max((a+b+c+d)*.03125,1./128.),rcp=1./(min(abs(dir.x),abs(dir.y))+rd);dir=clamp(dir*rcp,vec2(-8.),vec2(8.))*px;
  vec3 A=.5*(texture2D(tC,vUv+dir*(1./3.-.5)).rgb+texture2D(tC,vUv+dir*(2./3.-.5)).rgb),B=A*.5+.25*(texture2D(tC,vUv-dir*.5).rgb+texture2D(tC,vUv+dir*.5).rgb);
  float l=dot(B,lu);vec3 o=(l<mn||l>mx)?A:B;if(uVig>0.){vec2 rs=1./px,p=(vUv-.5)*rs;float r0=min(rs.x,rs.y)*.45,r1=length(rs)*.62;o=mix(o,vec3(.0314,.0235,.0627),.38*uVig*clamp((length(p)-r0)/(r1-r0),0.,1.));}gl_FragColor=vec4(o,1.);}`;
 const U={tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2(1,1)},nf:{value:new THREE.Vector2(.3,420)},fogR:{value:new THREE.Vector2(50,140)},lw:{value:1},uN:{value:0},uT:{value:0},uSky:{value:1},uInk:{value:1},
  uIPV:{value:new THREE.Matrix4()},uCam:{value:new THREE.Vector3()},uHor:{value:new THREE.Color()},uZen:{value:new THREE.Color()}};
 const geo=new THREE.PlaneGeometry(2,2),mk=(fs,u)=>{const m=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false}));m.frustumCulled=false;const sc=new THREE.Scene();sc.add(m);return sc};
 const U2={tC:{value:null},px:U.px,uVig:{value:0}};
 return{U,U2,sc:mk(FS,U),sc2:mk(FX,U2),cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),rt:null,rt2:null,w:0,h:0,
  ok:renderer.capabilities.isWebGL2||!!renderer.extensions.get('WEBGL_depth_texture')}})();
const _pv=new THREE.Vector2(),_pm=new THREE.Matrix4();
function postRender(scn,cmr,sky){const P=POST;if(!P.ok){renderer.render(scn,cmr);return}
 renderer.getDrawingBufferSize(_pv);const w=_pv.x|0,h=_pv.y|0;
 if(w!==P.w||h!==P.h||!P.rt){P.w=w;P.h=h;if(P.rt){P.rt.depthTexture.dispose();P.rt.dispose();P.rt2.dispose()}
  P.rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false});P.rt.depthTexture=new THREE.DepthTexture(w,h);P.rt.depthTexture.type=renderer.capabilities.isWebGL2?THREE.FloatType:THREE.UnsignedIntType;
  P.rt2=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false});
  P.U.tC.value=P.rt.texture;P.U.tD.value=P.rt.depthTexture;P.U2.tC.value=P.rt2.texture;P.U.px.value.set(1/w,1/h)}
 const U=P.U;U.nf.value.set(cmr.near,cmr.far);U.lw.value=Math.max(1.25,renderer.getPixelRatio()*1.2);U.uN.value=typeof nightK==='number'?nightK:0;U.uT.value=clockT;U.uSky.value=sky?1:0;U.uInk.value=1;
 if(scn.fog){U.fogR.value.set(scn.fog.near,scn.fog.far);U.uHor.value.copy(scn.fog.color)}else U.fogR.value.set(1e4,2e4);
 U.uZen.value.copy(U.uHor.value).multiply(_zenK.setRGB(.5+.12*U.uN.value,.64-.1*U.uN.value,.94));
 cmr.updateMatrixWorld();_pm.multiplyMatrices(cmr.projectionMatrix,cmr.matrixWorldInverse);U.uIPV.value.copy(_pm).invert();U.uCam.value.setFromMatrixPosition(cmr.matrixWorld);
 renderer.setRenderTarget(P.rt);renderer.render(scn,cmr);renderer.setRenderTarget(P.rt2);renderer.render(P.sc,P.cam);renderer.setRenderTarget(null);renderer.render(P.sc2,P.cam)}
const _zenK=new THREE.Color();
/* ---- live castle placement: the real generated world, game camera, castle ghost like any building ---- */
const PKL={on:false,seed:-1,hit:null,beam:null};
function pkLivePrep(){PKL.seed=SEED;PKL.site='';CX=CY=-2000;SITE2=null;initWorld();for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();GB2.g.visible=false;GB2.key='';GB1.key=''}
function pkLiveFocus(tx,ty){CAM.x=tx;CAM.z=ty;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.9;CAM.dist=Math.max(CAM.dist,40)}
/* the live view shows the ground as it will be once the game starts: the castle pad levelled (the castle sits on it instead of
   half buried in a slope), the starting resources and the zombie paths; the partner's site too in co-op */
function pkLiveSync(){const a=pickPos&&pickPos.ok?pickPos:null,b=MP.conn&&MP.theirs?MP.theirs:null,k=SEED+'|'+(a?a.tx+','+a.ty:'-')+'|'+(b?b.tx+','+b.ty:'-');if(k===PKL.site)return;PKL.site=k;
 CX=a?a.tx:b?b.tx:-2000;CY=a?a.ty:b?b.ty:-2000;SITE2=a&&b?{tx:b.tx,ty:b.ty}:null;
 initWorld();for(const k2 of[...CHK.keys()])dropChunk(k2);dirtyT.clear();dirtyP.clear();GB1.key='';GB2.key='';GB3.key=''}
function renderPickLive(dt){if(PKL.seed!==SEED)pkLivePrep();pkLiveSync();
 if(!PKL.beam){PKL.beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.5,depthWrite:false}));scene.add(PKL.beam)}
 const k=dt*(keys[KB.up]||keys.arrowup?-1:keys[KB.down]||keys.arrowdown?1:0),k2=dt*(keys[KB.left]||keys.arrowleft?-1:keys[KB.right]||keys.arrowright?1:0),sp=CAM.dist*.9,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);
 CAM.x+=(k2*c+k*s)*sp;CAM.z+=(-k2*s+k*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5;
 updateCamera(dt);updateChunks(12);ghost.visible=rangeRing.visible=false;GB1.g.visible=false;PKL.hit=null;
 {const M=siteMaskGet(),cx=CAM.x|0,cy=CAM.z|0;let gn=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const kx=((cx/CH)|0)+i,ky=((cy/CH)|0)+j;if(kx>=0&&ky>=0&&kx<NCX&&ky<NCY&&genF[ky*NCX+kx])gn++}govBuild('pk'+SEED+'|'+((cx/10)|0)+','+((cy/10)|0)+','+gn,cx,cy,56,(x,y)=>!!M[((y/PVS)|0)*PVW+((x/PVS)|0)])}
 const blocked=!(mouse.x>=0)||uiRects.some(r=>inR(mouse,r)),gho=GHO;
 GHO={tier:0,gl:2,rot:PKROT&3};try{
 if(!blocked){const p=pickGround(mouse.x,mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const ok=siteOK(tx,ty)&&sitesFar({tx,ty},MP.conn?MP.theirs:null);PKL.hit={tx,ty,ok};if(!(pickPos&&pickPos.tx===tx&&pickPos.ty===ty))ghostMake(GB1,'castle',tx-2,ty-2,0,ok,.6)}}}
 if(pickPos&&gOK(pickPos.tx,pickPos.ty)){ghostMake(GB2,'castle',pickPos.tx-2,pickPos.ty-2,0,true,1);PKL.beam.visible=true;PKL.beam.position.set(pickPos.tx+.5,HT[pickPos.ty*TW+pickPos.tx]+30,pickPos.ty+.5)}else{GB2.g.visible=false;PKL.beam.visible=false}
 }finally{GHO=gho}
 /* the partner's castle, or their cursor while they are still choosing: shown in this view too, with a blue beam and their name */
 if(MP.conn){const hh=PKL.hit||pickPos;if(hh&&performance.now()-_pcT>90){const kk=hh.tx+','+hh.ty;if(kk!==_pcL){_pcL=kk;mpSend({k:'pc',tx:hh.tx,ty:hh.ty})}_pcT=performance.now()}}
 const PO=MP.conn?(MP.theirs||MP.cur):null;
 if(PO&&gOK(PO.tx,PO.ty)){
  if(MP.theirs){GHO={tier:0,gl:2,rot:MP.theirs.rot&3};try{ghostMake(GB3,'castle',PO.tx-2,PO.ty-2,0,true,1)}finally{GHO=gho}}else GB3.g.visible=false;
  if(!PKL.beam2){PKL.beam2=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,60,8),new THREE.MeshBasicMaterial({color:0x5aa9ff,transparent:true,opacity:.6,depthWrite:false}));scene.add(PKL.beam2)}
  const h=HT[PO.ty*TW+PO.tx]||LAND;PKL.beam2.visible=true;PKL.beam2.position.set(PO.tx+.5,h+30,PO.ty+.5);pkLiveTag(PO.tx+.5,h+(MP.theirs?7.5:3),PO.ty+.5,(MP.pname||L('Partner'))+(MP.theirs?L(' - castle'):''))}
 else{GB3.g.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}
 glowFlush();scene.updateMatrixWorld();postRender(scene,camera,true);GB2.g.visible=false;GB3.g.visible=false;PKL.beam.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}
/* floating name over the partner's site in the live view */
function pkLiveTag(x,y,z,t){if(!PKL.tag){const c=document.createElement('canvas');c.width=256;c.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.renderOrder=10;sp.userData={c,t:null};scene.add(sp);PKL.tag=sp}
 const sp=PKL.tag;if(sp.userData.t!==t){sp.userData.t=t;const x2=sp.userData.c.getContext('2d');x2.clearRect(0,0,256,64);x2.font='700 28px '+FFT;x2.textAlign='center';x2.lineWidth=6;x2.strokeStyle='#0b0810';x2.fillStyle='#9fd0ff';x2.strokeText(t,128,42);x2.fillText(t,128,42);sp.material.map.needsUpdate=true}
 const k=Math.max(2.4,CAM.dist*.075);sp.scale.set(k*4,k,1);sp.position.set(x,y+k*.5,z);sp.visible=true}
/* ================= AUDIO (procedural WebAudio, no assets) ================= */
let vM=.9,vS=.5;try{const v=JSON.parse(localStorage.getItem('dk_vol')||'{}');if(typeof v.m==='number')vM=v.m;if(typeof v.s==='number')vS=v.s}catch(e){}
function saveVol(){try{localStorage.setItem('dk_vol',JSON.stringify({m:vM,s:vS}))}catch(e){}}
function applyVol(){if(MB)MB.gain.value=vM;if(SB)SB.gain.value=vS*.6}
/* ================= AUDIO (v68): procedural orchestra, Arcane-style beats, layered effects, reverb and stereo =================
   graph: effects -> stereo panner -> SFX bus --+--> master -> glue compressor -> limiter -> speakers
          music voices -> (duck) -> music bus --+--> reverb send (generated hall impulse) -> master */
let AC=null,MG=null,SB=null,MB=null,OUT=null,RV=null,MDUCK=null,sndOn=true,nbuf=null,lastS={},bud=0,budT=0,WIND=null;
try{sndOn=localStorage.getItem('dk_snd')!=='0'}catch(e){}
function mkIR(sec,dec){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){const t=i/n,w=Math.random()*2-1;lp+=(w-lp)*(.35+.5*(1-t));d[i]=lp*Math.pow(1-t,dec)*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1)}}return b}
function aInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;AC=new A();
 MG=AC.createGain();MG.gain.value=sndOn?.9:0;const cp=AC.createDynamicsCompressor();cp.threshold.value=-18;cp.ratio.value=3.5;cp.attack.value=.006;cp.release.value=.22;
 const lim=AC.createDynamicsCompressor();lim.threshold.value=-2.5;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.08;MG.connect(cp);cp.connect(lim);lim.connect(AC.destination);
 RV=AC.createConvolver();RV.buffer=mkIR(2.8,2.6);const rvo=AC.createGain();rvo.gain.value=.55;const rlp=AC.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=5200;RV.connect(rlp);rlp.connect(rvo);rvo.connect(MG);
 SB=AC.createGain();SB.connect(MG);const ss=AC.createGain();ss.gain.value=.16;SB.connect(ss);ss.connect(RV);
 MB=AC.createGain();MB.connect(MG);const ms=AC.createGain();ms.gain.value=.34;MB.connect(ms);ms.connect(RV);MDUCK=AC.createGain();MDUCK.connect(MB);applyVol();OUT=SB;
 nbuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 /* wind bed: two band-passed noise layers breathing slowly */
 WIND=[];for(const[f,q,v]of[[320,.7,.05],[900,1.4,.018]]){const w=AC.createBufferSource();w.buffer=nbuf;w.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=AC.createGain();g.gain.value=v;
  const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.07+Math.random()*.05;lg.gain.value=f*.45;l.connect(lg);lg.connect(bp.frequency);l.start();w.connect(bp);bp.connect(g);g.connect(SB);w.start(0,Math.random()*1.5);WIND.push(g)}
 mus.next=AC.currentTime+.15;setInterval(()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})},400);['pointerdown','keydown','touchstart','touchend','click'].forEach(ev=>addEventListener(ev,()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})},{passive:true}));
 setInterval(ambTick,900);setInterval(musTick,50)}catch(e){AC=null}}
function toggleSound(){sndOn=!sndOn;try{localStorage.setItem('dk_snd',sndOn?'1':'0')}catch(e){}aInit();if(MG)MG.gain.setTargetAtTime(sndOn?.9:0,AC.currentTime,.05);msgS='Sound '+(sndOn?'on':'off');msgT=1.5}
/* ---- synthesis kit ---- */
function env(g,t,a,v,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(a+.01,d))}
function tn(f,d,type,v,f2,t0,dst){const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
 env(g,t,Math.min(.01,d/4),v,d);o.connect(g);g.connect(dst||OUT);o.start(t);o.stop(t+d+.05)}
function ns(d,v,ft,f0,f1,q,t0,dst){const t=AC.currentTime+(t0||0),s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type=ft||'lowpass';f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);f.Q.value=q||1;
 const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dst||OUT);s.start(t,Math.random()*1.5,d+.06)}
function metal(fs,d,v,t0){for(let i=0;i<fs.length;i++)tn(fs[i],d*(1-i*.12),'sine',v/(1+i*.6),fs[i]*.995,t0)}
function formant(f,d,v,t0,vow,wob){const t=AC.currentTime+(t0||0),o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*(wob||.82),t+d);const out=AC.createGain();env(out,t,.06,v,d);
 for(const[ff,qq,gg]of(vow||[[520,8,1],[1150,10,.6]])){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=ff;b.Q.value=qq;const g=AC.createGain();g.gain.value=gg;o.connect(b);b.connect(g);g.connect(out)}out.connect(OUT);o.start(t);o.stop(t+d+.05)}
function horn(f,d,v,t0){const t=AC.currentTime+(t0||0),out=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.linearRampToValueAtTime(1500,t+.25);lp.frequency.setValueAtTime(1500,t+d-.3);lp.frequency.linearRampToValueAtTime(400,t+d);
 const vib=AC.createOscillator(),vg=AC.createGain();vib.frequency.value=5.2;vg.gain.value=f*.012;vib.connect(vg);
 for(const det of[-7,6]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.14);o.detune.value=det;vg.connect(o.frequency);o.connect(lp);o.start(t);o.stop(t+d+.05)}
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(v,t+.12);out.gain.setValueAtTime(v,t+d-.3);out.gain.exponentialRampToValueAtTime(.0001,t+d);lp.connect(out);out.connect(OUT);vib.start(t);vib.stop(t+d+.05)}
function knock(t0,f,v){tn(f,.09,'sine',v,f*.55,t0);ns(.05,v*.7,'bandpass',f*5,f*3,4,t0)}
const SFX={
 click:()=>{tn(1900,.025,'sine',.07,1500);ns(.018,.05,'highpass',5000,0,1)},
 select:()=>{tn(660,.07,'triangle',.12,0);tn(990,.1,'triangle',.09,0,.04);tn(1980,.08,'sine',.025,0,.04)},
 order:()=>{tn(392,.08,'triangle',.14,330);tn(588,.06,'sine',.05,0,.03);ns(.04,.05,'bandpass',2600,0,3)},
 err:()=>{tn(196,.15,'square',.05,150);tn(185,.15,'square',.04,140);tn(98,.16,'sine',.1,80)},
 build:()=>{knock(0,150,.38);knock(.11,170,.3);ns(.14,.18,'bandpass',900,500,1.6,.03)},
 path:()=>{ns(.09,.22,'bandpass',1500,700,1.2);ns(.06,.12,'highpass',3500,0,1,.03)},
 spawn:()=>{const N=[523,659,784];N.forEach((f,i)=>{tn(f,.28,'triangle',.11,0,i*.07);tn(f*2,.2,'sine',.03,0,i*.07)});ns(.3,.04,'highpass',6000,9000,1,.12)},
 coin:()=>{metal([1568,2350,3730],.24,.11);metal([2093,3140,4980],.3,.09,.07)},
 chop:()=>{tn(170,.1,'sine',.42,80);ns(.08,.55,'bandpass',1300,600,2.8);ns(.03,.3,'highpass',4000,0,1,.005)},
 mine:()=>{metal([2380,3110,4270],.12,.07);ns(.05,.38,'highpass',3200,6000,2);tn(220,.07,'sine',.28,110)},
 sword:()=>{metal([1840,2690,3910,5230],.22,.09);ns(.06,.42,'bandpass',4200,2200,2.5);tn(240,.07,'sine',.16,120)},
 zhit:()=>{tn(110,.13,'sine',.42,55);ns(.13,.38,'lowpass',800,220);ns(.05,.12,'bandpass',1800,900,3,.01)},
 arrow:()=>{tn(210,.06,'triangle',.11,150);ns(.2,.3,'bandpass',900,3800,2.2,.02)},
 stone:()=>{ns(.07,.32,'bandpass',950,450,1.6);tn(140,.06,'sine',.18,90)},
 bolt:()=>{tn(120,.22,'sawtooth',.16,60);ns(.25,.4,'bandpass',700,2600,1.4,.03);metal([980,1430],.14,.04)},
 trebl:()=>{tn(74,.45,'sawtooth',.12,60);ns(.55,.35,'bandpass',260,700,1.8,.1);ns(.4,.3,'lowpass',500,120,1,.35)},
 boom:()=>{ns(1.0,.95,'lowpass',420,45);tn(58,.7,'sine',.85,30);ns(.35,.3,'bandpass',1500,500,1,.05);for(let i=0;i<5;i++)ns(.04,.12,'highpass',2500,0,1,.15+i*.09*Math.random())},
 groan:()=>{const f=85+Math.random()*30;formant(f,.7+Math.random()*.3,.42,0,[[480+Math.random()*80,7,1],[1050,9,.5]],.75)},
 die:()=>{formant(130,.4,.36,0,[[600,6,1],[1300,8,.4]],.55);ns(.15,.25,'lowpass',600,150,1,.12)},
 horn:()=>{horn(147,1.5,.2);horn(220,1.3,.12,.08);tn(73,1.4,'sine',.12,0,.05)},
 fanfare:()=>{[[392,0,.32],[523,.16,.32],[659,.32,.32],[784,.5,.9]].forEach(([f,t,d])=>{horn(f,d,.13,t);tn(f*2,d,'sine',.025,0,t)});metal([2093,3140],.8,.05,.5)},
 victory:()=>{[[294,0,.4],[370,.22,.4],[440,.44,.4],[587,.7,1.4]].forEach(([f,t,d])=>horn(f,d,.12,t));metal([1175,1760,2640],1.4,.06,.7)},
 alarm:()=>{for(let i=0;i<3;i++){metal([880,1320,2210],.32,.1,i*.28);tn(440,.25,'triangle',.06,0,i*.28)}},
 night:()=>{metal([110,220,331,446,580],3.2,.22);metal([164,330,495],2.6,.08,.02);formant(70,2.4,.08,.6,[[350,6,1],[800,8,.4]],.9)},
 crumble:()=>{ns(1.3,.85,'lowpass',520,70);tn(66,.9,'sine',.6,32);for(let i=0;i<7;i++)knock(.1+i*.11*Math.random()+i*.05,240+Math.random()*200,.12)},
 gate:()=>{tn(78,.6,'sawtooth',.08,120);ns(.5,.18,'bandpass',320,560,3);knock(.55,110,.3)},
 heal:()=>{tn(880,.25,'sine',.07);tn(1320,.3,'sine',.06,0,.08);tn(1760,.35,'sine',.04,0,.16);ns(.4,.03,'highpass',7000,0,1,.05)},
 clank:()=>{metal([1500,2280,3460],.14,.06);ns(.07,.3,'highpass',2600,5000,2)},
 dirt:()=>{ns(.22,.48,'lowpass',700,220);ns(.08,.16,'bandpass',1600,700,2,.04)},
 fuse:()=>{ns(1.1,.2,'highpass',3600,7000,1.4);for(let i=0;i<7;i++)ns(.03,.2,'bandpass',5200,0,4,i*.15+Math.random()*.05)},
 spit:()=>{ns(.16,.4,'bandpass',900,300,2.5);tn(190,.12,'sine',.22,90);ns(.1,.18,'highpass',2600,0,1,.06)},
 sizzle:()=>{ns(.9,.17,'highpass',4200,2600,1.2);ns(.5,.09,'bandpass',2200,0,2,.1)}};
const SMIN={fuse:.4,spit:.12,sizzle:.5,sword:.05,zhit:.05,arrow:.06,stone:.09,die:.05,chop:.1,mine:.1,coin:.08,groan:.4,path:.05,dirt:.08,build:.12,click:.02,heal:.3,gate:.3,alarm:1.5,night:4,fanfare:1,victory:2,horn:1};
function snd(n,x,y){if(!AC||!sndOn||AC.state!=='running')return;const t=performance.now();if(t-budT>120){budT=t;bud=0}if(bud>=8)return;if(t-(lastS[n]||0)<(SMIN[n]||.03)*1000)return;
 let v=1,pan=0;if(x!==undefined){const wx=x/TS-CAM.x,wz=y/TS-CAM.z,d=hyp(wx,wz);v=Math.max(0,1-d/(CAM.dist+34));v*=v;if(v<.03)return;pan=Math.max(-.85,Math.min(.85,(wx*Math.cos(CAM.yaw)-wz*Math.sin(CAM.yaw))/(CAM.dist*.9+4)))}
 lastS[n]=t;bud++;const g=AC.createGain();g.gain.value=v;if(pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(SB)}else g.connect(SB);OUT=g;try{SFX[n]()}catch(e){}OUT=SB}
/* ambience: wind always, birds by day, crickets / owls / distant wolves by night */
function ambTick(){if(!AC||!sndOn||AC.state!=='running')return;OUT=SB;const on=started&&!paused;if(WIND)WIND.forEach((g,i)=>g.gain.setTargetAtTime(on?(i?.016:.045)*(1.2-dayK*.4):.02,AC.currentTime,1.2));if(!on)return;
 if(dayK>.55&&Math.random()<.38){const f=2400+Math.random()*1700,n=2+((Math.random()*4)|0);for(let i=0;i<n;i++){tn(f*(1+i%2*.12),.06,'sine',.028,f*1.35,i*.1);tn(f*2.01,.04,'sine',.008,0,i*.1)}}
 if(dayK<.42){if(Math.random()<.7)for(let i=0;i<4;i++){tn(4400,.05,'sine',.012,4380,i*.07);tn(4400,.05,'sine',.012,4380,.45+i*.07)}
  if(Math.random()<.06){tn(390,.32,'sine',.05,370);tn(330,.5,'sine',.045,315,.42)}
  if(Math.random()<.025){const t0=Math.random()*.3;tn(420,1.6,'triangle',.03,700,t0);tn(700,1.2,'triangle',.022,520,t0+1.4)}}}
/* ---------------- music: generative score, modes menu / calm / night / battle ---------------- */
const mus={step:0,next:0,mode:'menu',cur:'menu',loop:0};
const mf=m=>440*Math.pow(2,(m-69)/12);
const SCO=[[38,[62,65,69]],[34,[58,62,65]],[41,[60,65,69]],[36,[60,64,67]],[43,[62,67,70]],[38,[62,65,69]],[45,[61,64,69]],[38,[62,65,69]]];
const MEL=[[0,74,6],[6,72,2],[8,74,4],[12,77,4],[16,74,6],[22,70,2],[24,72,8],[32,69,6],[38,72,2],[40,77,4],[44,76,4],[48,74,8],[56,72,4],[60,67,4],
 [64,79,6],[70,77,2],[72,74,4],[76,79,4],[80,77,6],[86,76,2],[88,74,8],[96,73,6],[102,76,2],[104,81,8],[112,77,4],[116,76,4],[120,74,8]];
function vo(f,t,d,type,v,lp,det,att,dst,rel){const o=AC.createOscillator(),g=AC.createGain(),fl=AC.createBiquadFilter();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;fl.type='lowpass';fl.frequency.value=lp||2000;
 const a=att||.02,r=rel||.12;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-r));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);fl.connect(g);g.connect(dst||MB);o.start(t);o.stop(t+d+.05)}
function strings(n,t,d,v,lp){for(const det of[-9,0,8])vo(mf(n),t,d,'sawtooth',v*.38,lp||1200,det,Math.min(.45,d*.3),MDUCK,Math.min(.5,d*.35))}
function choir(n,t,d,v){const o=AC.createOscillator(),out=AC.createGain();o.type='sawtooth';o.frequency.value=mf(n);const vb=AC.createOscillator(),vg=AC.createGain();vb.frequency.value=4.6;vg.gain.value=mf(n)*.008;vb.connect(vg);vg.connect(o.frequency);
 for(const[ff,qq,gg]of[[700,6,1],[1150,8,.55],[2600,10,.18]]){const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=ff;b.Q.value=qq;const g=AC.createGain();g.gain.value=gg;o.connect(b);b.connect(g);g.connect(out)}
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(v,t+d*.35);out.gain.setValueAtTime(v,t+d*.7);out.gain.exponentialRampToValueAtTime(.0001,t+d);out.connect(MDUCK);o.start(t);o.stop(t+d+.05);vb.start(t);vb.stop(t+d+.05)}
function pluck(n,t,v,d){d=d||1.2;const f=mf(n);vo(f,t,d,'triangle',v,3200,0,.004,MB,d*.9);vo(f*2,t,d*.5,'sine',v*.35,4000,0,.004,MB,d*.45);vo(f*3,t,d*.25,'sine',v*.12,5000,0,.003,MB,d*.22)}
function bell(n,t,v){const f=mf(n);for(const[k,g,d]of[[1,1,1.6],[2.76,.45,.9],[5.4,.22,.5],[8.9,.1,.3]])vo(f*k,t,d,'sine',v*g,9000,0,.003,MB,d*.9)}
function bassN(n,t,d,v,lp){const f=mf(n);vo(f,t,d,'sine',v,400,0,.008,MDUCK,.06);vo(f,t,d,'sawtooth',v*.45,lp||520,0,.008,MDUCK,.06)}
function brass(n,t,d,v){const f=mf(n),o1=AC.createOscillator(),o2=AC.createOscillator(),lp=AC.createBiquadFilter(),g=AC.createGain();o1.type=o2.type='sawtooth';o1.frequency.value=f;o2.frequency.value=f;o1.detune.value=-6;o2.detune.value=7;
 lp.type='lowpass';lp.frequency.setValueAtTime(500,t);lp.frequency.linearRampToValueAtTime(2200,t+.09);lp.frequency.setTargetAtTime(1300,t+.1,.25);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.06);g.gain.setValueAtTime(v*.85,t+Math.max(.08,d-.12));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(MB);o1.start(t);o2.start(t);o1.stop(t+d+.05);o2.stop(t+d+.05)}
function kick(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(g);g.connect(MB);o.start(t);o.stop(t+.45);
 const c=AC.createBufferSource();c.buffer=nbuf;const cf=AC.createBiquadFilter();cf.type='highpass';cf.frequency.value=3000;const cg=AC.createGain();cg.gain.setValueAtTime(v*.25,t);cg.gain.exponentialRampToValueAtTime(.0001,t+.02);c.connect(cf);cf.connect(cg);cg.connect(MB);c.start(t,Math.random(),.03);
 MDUCK.gain.cancelScheduledValues(t);MDUCK.gain.setValueAtTime(.45,t);MDUCK.gain.linearRampToValueAtTime(1,t+.22)}
function snare(t,v){const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=.8;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);s.connect(f);f.connect(g);g.connect(MB);s.start(t,Math.random()*1.5,.25);
 vo(190,t,.1,'triangle',v*.55,1200,0,.002,MB,.08)}
function hat(t,v,open){const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=8000;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+(open?.22:.045));s.connect(f);f.connect(g);g.connect(MB);s.start(t,Math.random()*1.5,.3)}
function taiko(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(52,t+.3);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.connect(g);g.connect(MB);o.start(t);o.stop(t+.75);
 const s=AC.createBufferSource();s.buffer=nbuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=700;const sg=AC.createGain();sg.gain.setValueAtTime(v*.5,t);sg.gain.exponentialRampToValueAtTime(.0001,t+.25);s.connect(f);f.connect(sg);sg.connect(MB);s.start(t,Math.random(),.3)}
function curMode(){if(!started)return'menu';let n=0;const cx=CAM.x*TS,cy=CAM.z*TS;for(const u of units){if(u.t&&Math.abs(u.x-cx)<TS*30&&Math.abs(u.y-cy)<TS*24&&++n>=7)return'battle'}if(swNear(cx,cy,TS*24)>=0)return'battle';return dayK<.38||nightLv>=.5?'night':'calm'}
function musTick(){if(!AC||!sndOn||AC.state!=='running')return;if(paused&&started){mus.next=AC.currentTime+.1;return}
 while(mus.next<AC.currentTime+.3){const m=mus.cur,sp=m==='battle'?.163:m==='menu'?.17:m==='night'?.25:.21;musStep(mus.step,mus.next,m,sp);mus.next+=sp;mus.step++;if(mus.step%16===0){const nm=curMode();if(nm!==mus.cur){mus.cur=nm;mus.step=0;mus.loop=0}}if(mus.step%128===0)mus.loop++}}
function musStep(st,t,m,sp){const s128=st%128,bar=(s128/16)|0,s16=st%16,ch=SCO[bar],bd=sp*16,A=mus.loop%2===1;
 if(m==='menu'){
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.03,.06,1300));bassN(ch[0],t,bd,.15,300);choir(ch[1][0]+12,t,bd*1.05,.035);if(bar===0||bar===4)taiko(t,.5)}
  if(s16===8&&bar%2===1)taiko(t,.35);if(s16%4===0)pluck(ch[1][(s16/4+bar)%3]+12,t,.05,.9);
  for(const e of MEL)if(e[0]===s128){brass(e[1]-12,t,e[2]*sp,.075);brass(e[1],t,e[2]*sp,.05);if(e[2]>=6)bell(e[1]+12,t,.035)}
  if(s16===12&&(bar===3||bar===7)){taiko(t,.3);taiko(t+sp,.32);taiko(t+sp*2,.36);taiko(t+sp*3,.42)}}
 else if(m==='calm'){
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.02,.05,900));bassN(ch[0],t,bd,.12,250)}
  if(s16%2===0){const ar=[ch[1][0],ch[1][1],ch[1][2],ch[1][1]+12];pluck(ar[(s16/2)%4]+12,t,.055,1.1)}
  if(A&&s16===0&&bar%2===0){const e=MEL.find(q=>q[0]===s128);if(e)bell(e[1]+12,t,.04)}
  if(A)for(const e of MEL)if(e[0]===s128&&e[2]>=4)pluck(e[1]+12,t,.07,2.2)}
 else if(m==='night'){
  if(s16===0){choir(ch[1][0],t,bd*1.05,.04);strings(ch[0]+12,t,bd*1.05,.05,600);bassN(ch[0]-12,t,bd,.1,180)}
  if(s16===6||s16===14)pluck(ch[1][2]+(s16===6?0:12),t,.035,2.5);if(s16===0&&bar%4===3)bell(ch[1][0]+13,t,.03);if(s16===10&&bar%2===1)taiko(t,.18)}
 else{/* battle: half-time trap groove under an orchestral ostinato */
  if(s16===0){ch[1].forEach(n=>strings(n,t,bd*1.02,.045,1700));choir(ch[1][2]+12,t,bd*1.03,.026);brass(ch[1][0],t,sp*3,.06);brass(ch[1][2],t,sp*3,.042)}
  if(s16%2===0)bassN(ch[0]+(s16%8===6?12:0),t,sp*1.7,.12,700);
  vo(mf(ch[1][(s16+bar)%3]+12),t,sp*.8,'sawtooth',.03,2200,0,.004,MDUCK,.04);
  if(s16===0||s16===10||(A&&s16===7))kick(t,.46);if(s16===8)snare(t,.42);if(s16===14&&bar%2===1)snare(t,.2);
  if(s16%2===0)hat(t,.06);else if(A||bar%2)hat(t,.035);if(bar%4===3&&s16>=12){hat(t+sp/2,.04);snare(t+sp/2,.08)}
  if(s16===0&&bar%4===0)taiko(t,.55);if(A)for(const e of MEL)if(e[0]===s128&&e[2]>=6)brass(e[1]-12,t,e[2]*sp*.9,.06)}}

/* ================= ROAMING HORDES + AI KINGDOMS ================= */
const HORDES=[],BASES=[];let hdT=0,baseId=0,spawnHT=0,flagMsgT=0;
const BNAMES=['Ironhold','Oakmere','Stonegate','Highwatch','Redfern','Duskmoor','Whitecliff','Ashford','Greywall','Brightwater','Cinderfell','Hollowmere','Larkspur','Thornhaven','Wolfden','Eaglecrest','Mistral','Northwick','Sunhaven','Ravenmoor','Elderglen','Frostholm','Goldmere','Havenrock'];
const rI=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
/* attack reach of a building in tiles (null if it does not shoot): shown by the selection ring and in the info line */
function rangeOf(s){if(!s||s.t!==0||s.prog<1)return null;if(s.type==='castle')return{r:CASTLE_RNG};if(s.type!=='tower')return null;if(s.weapon==='ballista')return{r:720/TS};if(s.weapon==='trebuchet')return{r:1300/TS,min:240/TS};return{r:TOWR+(s.tier!==0?60/TS:0)}}
const selH=s=>({wall:1.9,gate:2.4,tower:4.5,castle:6.1,barracks:2.9,farm:.7,storage:2.2,house:3.0,academy:3.4,market:2.4,forester:2.2,guild:2.9,torch:1.6,keep:4.9,ballista:1.4,trebuchet:3})[s.type]||2;
const capPop=l=>14+l*11,TOWR=11,TR_CASTLE=45,TR_TOWER=15,aiR=b=>26+b.lvl*5;
let OWN=new Set(),ownSig='';
function ownKey(tx,ty){return (ty>>1)*4096+(tx>>1)}
function rebuildOwn(force){let sig=structs.length+':'+CS.x+':'+(CS2?CS2.x:0);let tw=0;for(const s of structs)if(s.t===0&&s.prog>=1)tw++;sig+=':'+tw;if(!force&&sig===ownSig)return;ownSig=sig;const S=new Set();
 const sq=(x,y,r)=>{const cx=Math.floor(x/TS),cy=Math.floor(y/TS);for(let j=(cy-r)>>1;j<=(cy+r)>>1;j++)for(let i=(cx-r)>>1;i<=(cx+r)>>1;i++)if(i>=0&&j>=0)S.add(j*4096+i)};
 for(const c0 of CASTLES())sq(c0.x,c0.y,TR_CASTLE);for(const s of structs)if(s.t===0&&s.prog>=1){if(s.type==='tower')sq(s.x,s.y,TR_TOWER);else if(s.type==='keep')sq(s.x,s.y,TR_TOWER+5);else sq(s.x,s.y,3)}OWN=S}
function inTerr(tx,ty){if(!OWN.size)rebuildOwn(true);return OWN.has(ownKey(tx,ty))}
function baseAt(tx,ty,m){for(const b of BASES)if(b.alive&&Math.max(Math.abs(tx-b.tx),Math.abs(ty-b.ty))<aiR(b)+(m||0))return b;return null}
/* the land around both co-op castles is protected the same way (AI kingdoms do not settle there) */
const claimed=(tx,ty,m)=>baseAt(tx,ty,m)||Math.max(Math.abs(tx-CX),Math.abs(ty-CY))<TR_CASTLE+(m||0)||(!!SITE2&&Math.max(Math.abs(tx-SITE2.tx),Math.abs(ty-SITE2.ty))<TR_CASTLE+(m||0));
function msgAI(s){if(msgT<=0||msgS.startsWith('The ')||msgS.endsWith('horde')){msgS=s;msgT=4}}
function addHorde(tx,ty,n){const dd=Math.min(hyp(tx-CX,ty-CY),SITE2?hyp(tx-SITE2.tx,ty-SITE2.ty):1e9);HORDES.push({x:(tx+.5)*TS,y:(ty+.5)*TS,n:n||(5+rI(0,9)+Math.min(24,(dd/38)|0)),act:false,us:[],home:null,wx:undefined,wy:0,wait:0})}
function addBase(tx,ty,lvl,pop,ci){const id=++baseId;let c=ci;if(c===undefined){do c=rI(0,7);while(c===THEME.c)}
 const b={id,name:BNAMES[(id-1)%BNAMES.length]+(id>BNAMES.length?' '+Math.ceil(id/BNAMES.length):''),tx,ty,x:(tx+.5)*TS,y:(ty+.5)*TS,ci:c,pop,lvl,gold:0,alive:true,mat:false,ss:[],us:[],n0:0,flat:false,fail:0,tExp:70+Math.random()*80};BASES.push(b);return b}
function initAI(){HORDES.length=0;BASES.length=0;baseId=0;hdT=0;spawnHT=10;aiInit()}
const nearPlayer=(x,y,r)=>{for(const u of units)if(u.t===0&&Math.abs(u.x-x)<r&&Math.abs(u.y-y)<r&&dist(u.x,u.y,x,y)<r)return true;return false};
function pickWp(h){const r=Math.random();let best=null,bd=1e9;
 if(r<.5)for(const b of BASES)if(b.alive){const d=dist(h.x,h.y,b.x,b.y);if(d<150*TS&&d<bd){bd=d;best=b}}
 if(best){h.wx=best.x+rnd(-90,90);h.wy=best.y+rnd(-90,90);return}
 if(r>.75&&dist(h.x,h.y,CS.x,CS.y)<80*TS){h.wx=CS.x+rnd(-300,300);h.wy=CS.y+rnd(-300,300);return}
 const a=Math.random()*6.283,d=rnd(50,170)*TS;h.wx=Math.max(20*TS,Math.min((TW-20)*TS,h.x+Math.cos(a)*d));h.wy=Math.max(20*TS,Math.min((TH-20)*TS,h.y+Math.sin(a)*d))}
function stepPos(o,h,sp,D){if(h.wx===undefined){pickWp(h)}
 const dx=h.wx-o.x,dy=h.wy-o.y,d=hyp(dx,dy);if(d<TS*2.5){if(h.wait<=0)h.wait=rnd(8,30);h.wait-=D;if(h.wait<=0)h.wx=undefined;return}
 const nx=o.x+dx/d*sp*D,ny=o.y+dy/d*sp*D;if(gOK((nx/TS)|0,(ny/TS)|0)&&solidAt(nx,ny)){h.wx=undefined;return}o.x=nx;o.y=ny}
function actHorde(h){h.us=[];const n=Math.min(h.n,70);h.home={x:h.x,y:h.y};const sp=TS*(1.5+Math.sqrt(n)*.42);
 for(let i=0;i<n;i++){const r=Math.random(),ty=r<.74?'husk':r<.95?'zombie':r<.985?'runner':'brute',x=h.x+rnd(-sp,sp),y=h.y+rnd(-sp,sp);if(solidAt(x,y))continue;
  const u=mkU(1,ty,x,y,null,-1);u.home=h.home;u.hh=h;units.push(u);h.us.push(u)}
 if(!h.us.length){h.x+=rnd(-200,200);h.y+=rnd(-200,200);h.x=Math.max(TS*10,Math.min((TW-10)*TS,h.x));h.y=Math.max(TS*10,Math.min((TH-10)*TS,h.y));return false}
 h.act=true;return true}
function updateHordes(dt){hdT-=dt;if(hdT>0)return;const D=.6-hdT;hdT=.6;const cam=focus();let nz=zcount();
 for(let i=HORDES.length-1;i>=0;i--){const h=HORDES[i];
  if(!h.act){if(h.n<1){HORDES.splice(i,1);continue}
   stepPos(h,h,26,D);
   if(nz<420&&gOK((h.x/TS)|0,(h.y/TS)|0)){let near=fdist(h.x,h.y)<58*TS;if(!near)near=nearPlayer(h.x,h.y,46*TS)||aiNear(h.x,h.y,40*TS);if(near&&actHorde(h))nz+=h.us.length}}
  else{h.us=h.us.filter(u=>u.hp>0&&u.hh===h);h.n=h.us.length;if(!h.n){HORDES.splice(i,1);continue}
   stepPos(h.home,h,13,D);
   if(fdist(h.home.x,h.home.y)>112*TS&&!nearPlayer(h.home.x,h.home.y,92*TS)&&!aiNear(h.home.x,h.home.y,64*TS)){let sx=0,sy=0;for(const u of h.us){sx+=u.x;sy+=u.y;u.hp=0;u.nokill=true}h.x=sx/h.n;h.y=sy/h.n;h.act=false;h.us=[]}}}
 spawnHT-=D;if(spawnHT<=0){const k=Math.min(1,time/1500);spawnHT=5-3.6*k+Math.random()*1.5;if(HORDES.length<340&&time>3)for(let a=0;a<14;a++){const side=rI(0,3),m=rI(14,46);let tx,ty;if(side<2){tx=side?TW-m:m;ty=rI(16,TH-16)}else{ty=side===3?TH-m:m;tx=rI(16,TW-16)}
   const x=(tx+.5)*TS,y=(ty+.5)*TS;if(fdist(x,y)<75*TS)continue;baseHW(tx,ty);if(_bwat)continue;addHorde(tx,ty,rI(7,14)+Math.min(26,(time/70)|0));const h=HORDES[HORDES.length-1];const ang=Math.atan2(TH/2-ty,TW/2-tx)+rnd(-.9,.9),d=rnd(180,520);h.wx=Math.max(20*TS,Math.min((TW-20)*TS,x+Math.cos(ang)*d*TS));h.wy=Math.max(20*TS,Math.min((TH-20)*TS,y+Math.sin(ang)*d*TS));break}}
 updateBases(D)}
/* ---- AI kingdoms ---- */
function expandBase(b){for(let a=0;a<14;a++){const an=Math.random()*6.283,r=aiR(b)+rnd(12,30),tx=Math.round(b.tx+Math.cos(an)*r),ty=Math.round(b.ty+Math.sin(an)*r);
  if(tx<70||ty<70||tx>TW-70||ty>TH-70||claimed(tx,ty,30))continue;
  const h=baseHW(tx,ty);if(_bwat||h>=ROCKH-2)continue;b.pop=Math.max(8,b.pop-12);addBase(tx,ty,0,8,b.ci);msgAI(b.name+' founds a new settlement');return true}return false}
function fallBase(b,h){b.alive=false;if(h){h.wait=0;h.wx=undefined;h.n=Math.min(95,h.n+Math.round(b.pop*.6)+b.lvl*3+4)}msgAI(b.name+' has fallen to the horde')}
function updateBases(D){aiTick(D)}
function siteFlatten(b){const R=7,offs=[];for(let dy=-26;dy<=26;dy+=3)for(let dx=-26;dx<=26;dx+=3)offs.push([dx,dy,dx*dx+dy*dy]);offs.sort((p,q)=>p[2]-q[2]);
 for(const[dx,dy]of offs){const cx=b.tx+dx,cy=b.ty+dy;if(cx<R+3||cy<R+3||cx>TW-R-3||cy>TH-R-3)continue;
  let ok=true,mn=99,mxh=0;const hs2=[];
  for(let j=-R-1;j<=R+1&&ok;j++)for(let i=-R-1;i<=R+1;i++){const x=cx+i,y=cy+j,k=y*TW+x;if(!gOK(x,y)||ter[k]===1||FLG[k]||occ.has(k)||pth[k]){ok=false;break}
   if(Math.abs(i)<=R&&Math.abs(j)<=R){if(HT[k]<LAND){ok=false;break}hs2.push(HT[k]);mn=Math.min(mn,HT[k]);mxh=Math.max(mxh,HT[k])}}
  if(!ok||mxh-mn>3)continue;
  hs2.sort((p,q)=>p-q);const hc=hs2[hs2.length>>1];
  for(let j=-R-2;j<=R+2;j++)for(let i=-R-2;i<=R+2;i++){const x=cx+i,y=cy+j,k=y*TW+x;if(!gOK(x,y)||occ.has(k))continue;const ch=Math.max(Math.abs(i),Math.abs(j));
   if(ch<=R){HT[k]=hc;ter[k]=0;amt[k]=0;stairs.delete(k)}else if(ter[k]!==1){HT[k]=Math.max(hc-1,Math.min(hc+1,HT[k]));if(ter[k]>=2&&ter[k]<=4&&ch<=R+1){ter[k]=0;amt[k]=0}}
   TFL[k]=1;markT(x,y);markP(x,y);mmTile(k)}
  b.tx=cx;b.ty=cy;b.x=(cx+.5)*TS;b.y=(cy+.5)*TS;fdDirty=true;return true}
 return false}
function matBase(b){ensureAround(b.tx,b.ty,1);
 if(!b.flat){if(!siteFlatten(b)){b.fail++;b.tx+=rI(-16,16);b.ty+=rI(-12,12);b.tx=Math.max(30,Math.min(TW-30,b.tx));b.ty=Math.max(30,Math.min(TH-30,b.ty));b.x=(b.tx+.5)*TS;b.y=(b.ty+.5)*TS;if(b.fail>5)b.alive=false;return}b.flat=true}
 const cx=b.tx,cy=b.ty,R=6;b.ss=[];b.us=[];
 const add=(type,x,y,w)=>{if(occ.has(y*TW+x))return null;const s=mk(2,type,x,y,1,true);s.tier=b.lvl>=4?1:0;s.ci=b.ci;s.base=b;if(w)s.weapon=w;addStruct(s);b.ss.push(s);return s};
 const keep=mk(2,'castle',cx-1,cy-1,3,true);keep.ci=b.ci;keep.base=b;keep.keep=true;keep.tier=b.lvl>=3?1:0;addStruct(keep);b.ss.push(keep);
 const towers=[];const tw2=(x,y,w)=>{const s=add('tower',x,y,w);if(s)towers.push(s)};
 if(b.lvl>=1)for(const[sx,sy]of[[1,1],[-1,1]])tw2(cx+sx*R,cy+sy*R,null);
 if(b.lvl>=2)for(const[sx,sy]of[[-1,-1],[1,-1]])tw2(cx+sx*R,cy+sy*R,b.lvl>=5?'ballista':null);
 if(b.lvl>=3)for(const[x,y]of[[cx+R,cy],[cx-R,cy],[cx,cy-R]])tw2(x,y,null);
 if(b.lvl>=4){tw2(cx-2,cy+R,null);tw2(cx+1,cy+R,null)}
 if(b.lvl>=5)for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]])tw2(cx+sx*3,cy+sy*3,b.lvl>=6?'ballista':null);
 if(b.lvl>=3){for(let k=-R;k<=R;k++)for(const[x,y]of[[cx+k,cy-R],[cx+k,cy+R],[cx-R,cy+k],[cx+R,cy+k]]){if(y===cy+R&&(x===cx-1||x===cx))continue;add('wall',x,y)}
 {const gt=mk(2,'gate',cx-1,cy+R,1,true,0);gt.tier=b.lvl>=4?1:0;gt.ci=b.ci;gt.base=b;gt.gate=true;addStruct(gt);b.ss.push(gt)}}
 for(const s of b.ss.slice())refreshNear(s);
 const mu=(type,x,y)=>{const u=mkU(2,type,x,y,null,-1);u.ci=b.ci;u.base=b;u.hx=x;u.hy=y;u.face=Math.random()*6;units.push(u);b.us.push(u);return u};
 const pos=()=>{for(let t=0;t<16;t++){const x=(cx+.5+rnd(-4.8,4.8))*TS,y=(cy+.5+rnd(-4.8,4.8))*TS;if(!solidAt(x,y)&&dist(x,y,keep.x,keep.y)>TS*2.4)return[x,y]}return[(cx+.5)*TS,(cy+4.5)*TS]};
 const nA=Math.min(14,2+Math.floor(b.lvl*2)),nK=Math.min(8,1+b.lvl),nP=Math.min(10,Math.round(b.pop/4));let ti=0;
 for(let i=0;i<nA;i++){const[x,y]=pos(),u=mu('archer',x,y);while(ti<towers.length&&(towers[ti].garr||[]).length>=GCAP.tower)ti++;if(ti<towers.length)garrison(u,towers[ti])}
 for(let i=0;i<nK;i++){const[x,y]=pos();mu('knight',x,y)}for(let i=0;i<nP;i++){const[x,y]=pos();mu('peasant',x,y)}
 b.n0=b.us.length;b.mat=true}
function unmatBase(b){const alive=b.us.filter(u=>u.hp>0).length,lost=b.n0-alive;if(lost>0)b.pop=Math.max(3,b.pop-lost*1.6);
 const set=new Set(b.ss);for(const s of b.ss){rmStruct(s);for(const[x,y]of s.tiles)occ.delete(y*TW+x)}structs=structs.filter(s=>!set.has(s));
 const us=new Set(b.us);units=units.filter(u=>!us.has(u));b.ss=[];b.us=[];b.mat=false;fdDirty=true}

/* ================= AI KINGDOMS =================
   Rival kingdoms play like a player: each starts with a castle and a few peasants, gathers wood, stone and gold,
   farms, builds houses, a barracks, towers, then walls and stone, trains an army and holds off the hordes.
   They are on your side against the dead; when a castle falls its people turn. Everything runs in the simulation (co-op safe). */
const AIK_N=4,AIR=11,AIC={house:{w:40},farm:{w:30},barracks:{w:90,s:20},tower:{w:45,s:10},wall:{w:6},gate:{w:20},storage:{w:50},academy:{w:80,s:40},guild:{w:60,s:30},market:{w:70,g:30},
 peasant:{f:20},knight:{g:50,f:20},archer:{g:35,w:15,f:20}},AIBT={house:22,farm:18,barracks:40,tower:30,wall:5,gate:12,storage:26,academy:45,guild:36,market:36};
const aiNear=(x,y,r)=>{for(const b of BASES)if(b.ai&&b.alive&&Math.abs(b.x-x)<r&&Math.abs(b.y-y)<r)return true;return false};
function aiInit(){const P=[[CX,CY]];if(SITE2)P.push([SITE2.tx,SITE2.ty]);
 for(let a=0;a<900&&BASES.length<AIK_N;a++){const tx=rI(110,TW-110),ty=rI(100,TH-100);if(P.some(([x,y])=>hyp(tx-x,ty-y)<170))continue;if(BASES.some(b=>hyp(b.tx-tx,b.ty-ty)<160))continue;
  const h=baseHW(tx,ty);if(_bwat||h>=ROCKH-3)continue;const b=addBase(tx,ty,0,6);if(!aiFound(b)){BASES.pop();baseId--}}}
/* a flat 7x7 spot near the chosen place, levelled for the castle */
function aiFound(b){ensureAround(b.tx,b.ty,1);
 for(let r=0;r<=18;r+=2)for(let k=0;k<Math.max(1,r*4);k++){const an=k/Math.max(1,r*4)*6.283,cx=Math.round(b.tx+Math.cos(an)*r),cy=Math.round(b.ty+Math.sin(an)*r);let ok=true,mn=99,mx=0;const hh=[];
  for(let j=-3;j<=3&&ok;j++)for(let i=-3;i<=3;i++){const x=cx+i,y=cy+j,q=y*TW+x;if(!gOK(x,y)||ter[q]===1||ter[q]===5||occ.has(q)||stairs.has(q)){ok=false;break}hh.push(HT[q]);mn=Math.min(mn,HT[q]);mx=Math.max(mx,HT[q])}
  if(!ok||mx-mn>2)continue;hh.sort((p,q)=>p-q);const h0=hh[hh.length>>1];
  for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const q=(cy+j)*TW+cx+i;if(ter[q]>=2&&ter[q]<=4){ter[q]=0;amt[q]=0;mmTile(q)}}
  levelGround(cx-2,cy-2,5,h0);b.tx=cx;b.ty=cy;b.x=(cx+.5)*TS;b.y=(cy+.5)*TS;
  const pv=CURPL;CURPL=0;let c;try{c=mk(2,'castle',cx-2,cy-2,5,true)}finally{CURPL=pv}c.ci=b.ci;c.base=b;c.keep=true;c.tier=0;c.max=Math.round(SH.castle*.5);c.hp=c.max;addStruct(c);
  Object.assign(b,{ai:1,mat:true,flat:true,castle:c,ss:[c],us:[],res:{g:120,w:120,s:30,f:100},lvl:0,proj:null,trT:4,bT:2,stone:false,ring:[],wallI:0,fireT:0,repT:0});
  for(let i=0;i<4;i++)aiSpawn(b,'peasant');aiSpawn(b,'knight');aiSpawn(b,'knight');fdDirty=true;return true}
 return false}
function aiSpawn(b,type){const c=b.castle;let x=c.x,y=c.y+TS*3.2;for(let t=0;t<12;t++){const a=Math.random()*6.283,r=TS*(3+Math.random()*1.5);x=c.x+Math.cos(a)*r;y=c.y+Math.sin(a)*r;if(!solidAt(x,y))break}
 const pv=CURPL;CURPL=0;let u;try{u=mkU(2,type,x,y,null,-1)}finally{CURPL=pv}u.ci=b.ci;u.base=b;u.face=Math.random()*6;
 if(type!=='peasant'){const k=b.us.filter(o=>o.type!=='peasant').length,an=k*2.4,r=TS*(4.2+(k%3)*.9);u.hx=c.x+Math.cos(an)*r;u.hy=c.y+Math.sin(an)*r}else{u.hx=x;u.hy=y}
 units.push(u);b.us.push(u);
 if(type==='archer'){for(const s of b.ss)if(s.type==='tower'&&s.prog>=1&&s.hp>0&&(s.garr||[]).length<GCAP.tower){garrison(u,s);break}}
 return u}
const aiCnt=(b,t,done)=>{let n=0;for(const s of b.ss)if(s.type===t&&s.hp>0&&(!done||s.prog>=1))n++;return n};
const aiPay=(b,c)=>{for(const k in c)if((b.res[k]||0)<c[k])return false;for(const k in c)b.res[k]-=c[k];return true};
/* the ring of towers (and later walls) around the castle */
function aiRing(b){if(b.ring.length)return b.ring;const R=AIR,c=[b.tx,b.ty];b.ring=[[-R,-R],[R,-R],[R,R],[-R,R],[0,-R],[R,0],[0,R],[-R,0]].map(([x,y])=>[c[0]+x,c[1]+y]);return b.ring}
let AIB=null;function aiTileOK(x,y){if(!gOK(x,y))return false;const q=y*TW+x;return ter[q]===0&&!occ.has(q)&&!stairs.has(q)&&!pth[q]&&!(AIB&&AIB.includes(q))}
/* a 2x2 spot inside the ring (on a 3-tile grid, so lanes stay open), else just outside it */
function aiSpot(b,type){const cx=b.tx,cy=b.ty,C=[];
 for(let dy=-AIR+2;dy<=AIR-3;dy+=3)for(let dx=-AIR+2;dx<=AIR-3;dx+=3){if(Math.abs(dx)<=3&&Math.abs(dy)<=3)continue;C.push([cx+dx,cy+dy,0])}
 for(let k=0;k<40;k++){const an=k/40*6.283,r=AIR+4+(k%3)*3;C.push([Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),1])}
 const far=type==='farm';C.sort((p,q)=>(p[2]-q[2])*1e4+((hyp(p[0]-cx,p[1]-cy)-hyp(q[0]-cx,q[1]-cy))*(far?-1:1)));
 for(const[x,y]of C){let ok=true,mn=99,mx=0;for(let j=0;j<2&&ok;j++)for(let i=0;i<2;i++){if(!aiTileOK(x+i,y+j)){ok=false;break}const h=HT[(y+j)*TW+x+i];mn=Math.min(mn,h);mx=Math.max(mx,h)}
  if(!ok||mx-mn>1)continue;for(const[dx,dy]of[[-1,0],[2,0],[0,-1],[0,2],[-1,1],[2,1],[1,-1],[1,2]]){const o=occ.get((y+dy)*TW+x+dx);if(o&&o.type!=='house'&&o.type!=='wall'){ok=false;break}}if(!ok)continue;return[x,y,mx]}
 return null}
function aiPlace(b,type,x,y,h,ax){if(type==='gate'){}else if(type==='tower'||type==='wall')levelGround(x,y,1,HT[y*TW+x]);else levelGround(x,y,2,h);
 const pv=CURPL;CURPL=0;let s;try{s=type==='gate'?mk(2,'gate',x,y,1,false,ax,2):mk(2,type,x,y,type==='tower'||type==='wall'?1:2,false)}finally{CURPL=pv}
 s.ci=b.ci;s.base=b;s.tier=b.stone?1:0;if(!b.stone){s.max=Math.round(s.max*.5)}s.hp=s.max*.12;s.bt=AIBT[type]||20;if(type==='gate')s.gate=true;addStruct(s);refreshNear(s);b.ss.push(s);b.proj=s;fdDirty=true;return s}
/* what to build next, in the order a careful player would */
function aiNext(b){const n=t=>aiCnt(b,t),P=b.us.filter(u=>u.type==='peasant').length,R=aiRing(b);
 const want=[['farm',n('farm')<1],['house',n('house')<1],['barracks',n('barracks')<1&&P>=4],['tower',n('tower')<2&&!b.twFull],['house',n('house')<2],['farm',n('farm')<1+Math.floor(P/5)],
  ['storage',n('storage')<1&&b.lvl>=1],['tower',n('tower')<4&&!b.twFull],['house',n('house')<2+b.lvl],['academy',n('academy')<1&&b.lvl>=2],['guild',n('guild')<1&&b.lvl>=2],['tower',n('tower')<8&&!b.twFull],
  ['market',n('market')<1&&b.lvl>=3],['wall',b.lvl>=3&&b.wallI<R.length],['house',n('house')<9]];
 for(const[t,c]of want)if(c)return t;return null}
function aiStartBuild(b){AIB=b.bad||null;try{aiStartBuild0(b)}finally{AIB=null}}
function aiStartBuild0(b){const t=aiNext(b);if(!t)return;
 if(t==='tower'){const R=aiRing(b);let left=0;for(const[x,y]of R){const o=occ.get(y*TW+x);if(o)continue;left++;let tx=x,ty=y;if(!aiTileOK(tx,ty)){let f=null;for(const[dx,dy]of D8)if(aiTileOK(x+dx,y+dy)){f=[x+dx,y+dy];break}if(!f)continue;[tx,ty]=f}if(!aiPay(b,AIC.tower))return;aiPlace(b,'tower',tx,ty);return}b.twFull=1;return}
 if(t==='wall'){const R=aiRing(b);const i=b.wallI%R.length,p=R[[0,4,1,5,2,6,3,7][i]],q=R[[4,1,5,2,6,3,7,0][i]];const L=[];
   const st=Math.max(Math.abs(q[0]-p[0]),Math.abs(q[1]-p[1]));for(let k=1;k<st;k++)L.push([p[0]+Math.sign(q[0]-p[0])*k,p[1]+Math.sign(q[1]-p[1])*k]);
   const gi=(i===4||i===0)&&L.length>3?L.length>>1:-1;for(let k=0;k<L.length;k++){const[x,y]=L[k];if(occ.has(y*TW+x))continue;if(gi>=0&&(k===gi||k===gi+1)){const gx=Math.min(L[gi][0],L[gi+1][0]);if(aiTileOK(gx,y)&&aiTileOK(gx+1,y)){if(!aiPay(b,AIC.gate))return;aiPlace(b,'gate',gx,y,0,0);return}continue}
    if(!aiTileOK(x,y))continue;if(!aiPay(b,AIC.wall))return;aiPlace(b,'wall',x,y);return}
   b.wallI++;return}
 const sp=aiSpot(b,t);if(!sp){if(t==='house')b.full=1;return}if(!aiPay(b,AIC[t]))return;aiPlace(b,t,sp[0],sp[1],sp[2])}
function aiFall(b){for(const u of b.us)if(u.hp>0){if(u.gar)ungar(u);u.zk=u.type;u.t=1;u.type='zombie';u.hp=T.zombie.hp;u.base=null;u.home=null;u.lane=-1;u.cd=1}
 for(const s of b.ss)s.base=null;b.ss=[];b.us=[];b.alive=false;puff(b.x,b.y,'#b04bff',20,120);msgAI(b.name+' has fallen to the horde')}
function aiTick(D){let nAI=0;for(const b of BASES)if(b.ai&&b.alive)nAI+=b.us.length;
 for(const b of BASES){if(!b.ai||!b.alive)continue;const c=b.castle;
  b.ss=b.ss.filter(s=>s.hp>0&&structs.includes(s));b.us=b.us.filter(u=>u.hp>0&&u.base===b&&u.t===2);
  if(!c||c.hp<=0||!structs.includes(c)){aiFall(b);continue}
  const P=b.us.filter(u=>u.type==='peasant'),S=b.us.length-P.length,F=aiCnt(b,'farm',1),Hs=aiCnt(b,'house',1),Tw=aiCnt(b,'tower',1),done=b.ss.filter(s=>s.prog>=1).length;
  b.res.f+=D*(.25+.55*F);b.res.g+=D*(.35+.05*b.lvl);b.pop=b.us.length;b.lvl=Math.min(6,Math.floor(done/4));
  /* stone age: castle and defences rebuilt in stone */
  if(!b.stone&&b.lvl>=3&&b.res.s>=160){b.res.s-=160;b.stone=true;for(const s of b.ss)if(s.prog>=1&&(s.type==='castle'||s.type==='tower'||s.type==='wall'||s.type==='gate'||s.type==='barracks')){const r=s.hp/s.max;s.tier=1;s.max=SH[s.type]||s.max*2;s.hp=s.max*r;if(s.o3)buildStructMesh(s)}msgAI(b.name+' rebuilds its castle in stone')}
  /* building */
  if(b.proj&&(b.proj.hp<=0||b.proj.prog>=1||!structs.includes(b.proj)))b.proj=null;
  if(b.proj){if(b.proj.prog!==b.pjP){b.pjP=b.proj.prog;b.pjT=0}else if((b.pjT=(b.pjT||0)+D)>50){const s=b.proj;b.bad=b.bad||[];for(const[x,y]of s.tiles)b.bad.push(y*TW+x);s.hp=-1;s.noCrumble=true;b.proj=null;b.pjT=0;for(const u of b.us)if(u.bj===s)u.bj=null}}
  b.bT-=D;if(!b.proj&&b.bT<=0){b.bT=3;aiStartBuild(b)}
  /* training */
  b.trT-=D;if(b.trT<=0){b.trT=8;const cap=8+5*Hs,pW=Math.min(16,4+2*Hs),sW=Math.min(22,2+b.lvl*3+Tw);
   if(b.us.length<cap&&nAI<230){if(P.length<pW&&aiPay(b,AIC.peasant))aiSpawn(b,'peasant');
    else if(aiCnt(b,'barracks',1)&&S<sW){const ar=b.us.filter(u=>u.type==='archer').length,t=ar<Tw*2&&ar<S*.6?'archer':'knight';if(aiPay(b,AIC[t]))aiSpawn(b,t)}}}
  /* a grown kingdom founds a new settlement */
  if(b.lvl>=6&&(b.kids||0)<2&&!b.proj&&!b.exS&&b.res.w>=500&&b.res.s>=250&&b.res.g>=300&&BASES.filter(q=>q.alive).length<10){b.exT=(b.exT||0)-D;if(b.exT<=0){b.exT=60;
   for(let a=0;a<30;a++){const an=Math.random()*6.283,r=rnd(55,85),tx=Math.round(b.tx+Math.cos(an)*r),ty=Math.round(b.ty+Math.sin(an)*r);if(tx<90||ty<90||tx>TW-90||ty>TH-90)continue;
    if(hyp(tx-CX,ty-CY)<90||SITE2&&hyp(tx-SITE2.tx,ty-SITE2.ty)<90||BASES.some(q=>q.alive&&hyp(q.tx-tx,q.ty-ty)<55))continue;const h=baseHW(tx,ty);if(_bwat||h>=ROCKH-3)continue;
    b.exS={tx,ty,k:0};break}}}
  if(b.exS){const E=b.exS,cx=(E.tx/CH)|0,cy=(E.ty/CH)|0;if(E.k<9){genChunk(cx+(E.k%3)-1,cy+((E.k/3)|0)-1);E.k++}else{b.exS=null;
   const nb=addBase(E.tx,E.ty,0,6,b.ci);const rt=b.root||b.name;nb.root=rt;const sib=BASES.filter(q=>q.root===rt).length;nb.name=rt+' '+['March','Hollow','Ford','Rise','Vale','Watch','Moor','Crest'][sib%8];if(aiFound(nb)){b.kids=(b.kids||0)+1;b.res.w-=500;b.res.s-=250;b.res.g-=300;msgAI(b.name+' founds '+nb.name)}else{BASES.pop();baseId--}}}
  /* archers on the towers */
  for(const u of b.us)if(u.type==='archer'&&!u.gar)for(const s of b.ss)if(s.type==='tower'&&s.prog>=1&&(s.garr||[]).length<GCAP.tower){if(garrison(u,s))break}
  /* repairs, paid in wood */
  b.repT-=D;if(b.repT<=0){b.repT=2;for(const s of b.ss)if(s.prog>=1&&s.hp<s.max&&b.res.w>=2){s.hp=Math.min(s.max,s.hp+s.max*.03);b.res.w-=2}}
  /* the castle shoots like yours */
  b.fireT-=D;if(b.fireT<=0){b.fireT=c.tier?.8:1.05;const R=CASTLE_RNG*TS;let z=null,bd=R;for(const e of units)if(e.t===1&&e.hp>0&&Math.abs(e.x-c.x)<R&&Math.abs(e.y-c.y)<R){const dd=dist(c.x,c.y,e.x,e.y);if(dd<bd){bd=dd;z=e}}
   if(z){z.hp-=c.tier?16:11;fx.push({x1:c.x,y1:c.y,x2:z.x,y2:z.y,t:.3,T:.3,a:1,h0:(c.bh||LAND)+(c.tier?3.5:2.5)});snd('arrow',c.x,c.y)}else b.fireT=.35}}}
/* AI peasant: build the current project, else gather what the kingdom lacks and carry it home */
function aiDepot(b,u){let best=b.castle,bd=dist(u.x,u.y,best.x,best.y);for(const s of b.ss)if(s.type==='storage'&&s.prog>=1){const d=dist(u.x,u.y,s.x,s.y);if(d<bd){bd=d;best=s}}return best}
function aiGo(u,x,y,dt){if(!u.ag||u.ag.x!==x||u.ag.y!==y)u.ag={x,y};chase(u,u.ag,dt)}
function aiFind(b,u,j){const T0=({w:2,s:3,g:4})[j],ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS),bx=b.tx,by=b.ty;let best=-1,bd=1e9;
 for(let dy=-30;dy<=30;dy++)for(let dx=-30;dx<=30;dx++){const x=bx+dx,y=by+dy;if(!gOK(x,y))continue;const q=y*TW+x;if(ter[q]!==T0||!(amt[q]>0)||BAD.get(q)>time)continue;if(!D4.some(([a,c])=>!solid(x+a,y+c)))continue;const d=Math.abs(x-ux)+Math.abs(y-uy)+(dx*dx+dy*dy)*.02;if(d<bd){bd=d;best=q}}return best}
function aiPeasant(u,b,dt){const[z]=targetZ(u,120);if(z&&!u.gar){u.work=0;aiGo(u,b.castle.x,b.castle.y,dt*1.15);return}
 const pj=b.proj;
 if(pj&&pj.prog<1&&pj.hp>0&&!u.carry){const nb=b.us.filter(o=>o.bj===pj).length;if(u.bj!==pj&&nb<2&&(!u.bj||u.bj.prog>=1))u.bj=pj}
 if(u.bj){const s=u.bj;if(s.prog>=1||s.hp<=0||!structs.includes(s)){u.bj=null}else{u.job='r';if(dist(u.x,u.y,s.x,s.y)<TS*(s.sz>1||s.type==='gate'?2.2:1.6)){u.face=Math.atan2(s.x-u.x,s.y-u.y);u.work=(u.work||0)+dt;u.walk=0;
    const dp=dt/s.bt;s.prog=Math.min(1,s.prog+dp);s.hp=Math.min(s.max,s.hp+s.max*dp*.88);if(Math.random()<.02)snd('build',s.x,s.y);
    if(s.prog>=1){s.hp=s.max;u.bj=null;u.work=0;if(s.o3)buildStructMesh(s);refreshNear(s);if(s.type==='storage')fdDirty=true}}else{u.work=0;aiGo(u,s.x,s.y,dt)}return}}
 if(u.carry){const d=aiDepot(b,u);if(dist(u.x,u.y,d.x,d.y)<TS*(d.sz/2+1.2)){b.res[u.cj]=(b.res[u.cj]||0)+GET[u.cj];u.carry=false;u.tl=-1}else aiGo(u,d.x,d.y,dt);return}
 if(!(u.tl>=0)||!(ter[u.tl]>=2&&ter[u.tl]<=4)||!(amt[u.tl]>0)){const r=b.res,need=[['w',r.w/3],['s',r.s/1.6],['g',r.g/2.2]].sort((p,q)=>p[1]-q[1]);
  u.tl=-1;for(const[j]of need){u.tl=aiFind(b,u,j);if(u.tl>=0)break}u.rt=0;if(u.tl<0){u.job=null;if(dist(u.x,u.y,u.hx,u.hy)>20)aiGo(u,u.hx,u.hy,dt*.6);return}}
 const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;u.job=({2:'w',3:'s',4:'g'})[ter[u.tl]];u.rt=(u.rt||0)+dt;if(u.rt>40){BAD.set(u.tl,time+60);u.tl=-1;return}
 if(dist(u.x,u.y,tx,ty)<46){u.walk=0;u.work=(u.work||0)+dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>WORK*1.15){u.work=0;u.carry=true;u.cj=u.job;snd(u.job==='w'?'chop':'mine',u.x,u.y);if(--amt[u.tl]<=0){const i=u.tl;ter[i]=0;mmTile(i);markP(i%TW,(i/TW)|0);fdDirty=true}}}
 else{u.work=0;aiGo(u,tx,ty,dt)}}
function aiRes(b,u){const want=Math.random();for(let k=0;k<40;k++){const a=Math.random()*6.283,r=rnd(9,26),x=Math.round(b.tx+Math.cos(a)*r),y=Math.round(b.ty+Math.sin(a)*r);if(!gOK(x,y))continue;const i=y*TW+x,t=ter[i];if(t<2||t>4||!(amt[i]>0)||occ.has(i))continue;if(t===4&&want>.35)continue;if(t===3&&want>.7)continue;return i}return -1}
function aiUnit(u,d,dt){const b=u.base;if(!b){u.t=1;return}
 if(u.gar){const s=u.gar;if(s.hp<=0||!structs.includes(s)){ungar(u);u.hp-=8}else{const j=s.garr.indexOf(u),sp=garSlot(s,j);u.x=sp.x;u.y=sp.y;u.gz=(s.bh||0)+gtopOf(s);const[z]=targetZ(u,d.rng*GRNG[s.type]+20);if(z&&u.cd<=0&&z.type in T)hit(u,z);u.walk=0}return}
 if(u.type==='peasant'&&b.ai){aiPeasant(u,b,dt);return}
 if(u.type==='peasant'){const[z]=targetZ(u,140);if(z){u.carry=false;u.job=null;u.work=0;moveTo(u,b.x,b.y,dt*1.2);return}
  if(u.carry){u.job=null;if(dist(u.x,u.y,b.x,b.y)<TS*3){b.gold+=GET[u.cj]*.5;u.carry=false;u.tl=-1;snd('coin',u.x,u.y)}else moveTo(u,b.x,b.y,dt*.9);return}
  if(u.tl===undefined||u.tl<0||!(ter[u.tl]>=2&&ter[u.tl]<=4)||!(amt[u.tl]>0)){u.tl=aiRes(b,u);u.rt=0;if(u.tl<0){u.job=null;u.wt=(u.wt||0)-dt;if(u.wt<=0){u.wt=2+Math.random()*4;u.wx=u.hx+rnd(-100,100);u.wy=u.hy+rnd(-100,100)}
    if(u.wx!==undefined&&dist(u.x,u.y,u.wx,u.wy)>6&&!solidAt(u.wx,u.wy))moveTo(u,u.wx,u.wy,dt*.5);return}}
  const tx=(u.tl%TW+.5)*TS,ty=((u.tl/TW|0)+.5)*TS;u.job=({2:'w',3:'s',4:'g'})[ter[u.tl]];u.rt=(u.rt||0)+dt;if(u.rt>30){u.tl=-1;return}
  if(dist(u.x,u.y,tx,ty)<56){u.work=(u.work||0)+dt;u.face=Math.atan2(tx-u.x,ty-u.y);if(u.work>WORK*1.3){u.work=0;u.carry=true;u.cj=u.job;snd(u.job==='w'?'chop':'mine',u.x,u.y);if(--amt[u.tl]<=0){const i=u.tl;ter[i]=0;mmTile(i);markP(i%TW,(i/TW)|0)}}}
  else{u.work=0;moveTo(u,tx,ty,dt*.7)}return}
 const ar=u.type==='archer',[z,zd]=targetZ(u,ar?300:230);
 if(z){if(zd<=d.rng+d.r){if(u.cd<=0)hit(u,z)}else if(!ar||dist(u.x,u.y,u.hx,u.hy)<TS*4.5)moveTo(u,z.x,z.y,dt);return}
 if(dist(u.x,u.y,u.hx,u.hy)>14){if(b.ai){if(!u.hp0||u.hp0.x!==u.hx||u.hp0.y!==u.hy)u.hp0={x:u.hx,y:u.hy};chase(u,u.hp0,dt)}else moveTo(u,u.hx,u.hy,dt)}}

function absorbUnit(u,b){let h=HORDES.find(o=>!o.act&&o.wave&&Math.abs(o.x-b.x)<TS*8&&Math.abs(o.y-b.y)<TS*8);if(!h){h={x:b.x+rnd(-100,100),y:b.y+rnd(-100,100),n:0,act:false,us:[],home:null,wx:b.x,wy:b.y,wait:1e9,wave:true};HORDES.push(h)}h.n++;u.hp=0;u.nokill=true}
/* ================= EPIC TITLE SCENE: army vs. endless horde at sunset ================= */
const TS3=new THREE.Scene();let titleInit=false,titleDirty=true,TT=0,TARMY=[],THORDE=[],TARR=[],TCLOUDS=[],TFLAMES=[],TLH=null,TLFL=null,TBOLT=null,TFLASH=0,TFLN=6,TASH=null,TASHP=null,TFIRES=[],TSMOKE=[],TEMB=null,TEMBP=null;
const TZ=1.5; // global scale of the title cast
function gradTex(){const c=cvs(4,256),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#150c18');gr.addColorStop(.3,'#3a1522');gr.addColorStop(.58,'#8a2e26');gr.addColorStop(.82,'#d8662c');gr.addColorStop(1,'#ffa85a');g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);return t}
function sqSunTex(){const c=cvs(16,16),g=c.getContext('2d');g.fillStyle='#ffb070';g.fillRect(2,2,12,12);g.fillStyle='#ffd8a0';g.fillRect(3,3,10,10);g.fillStyle='#fff0d0';g.fillRect(4,4,8,8);g.fillStyle='#ffffff';g.fillRect(5,5,6,6);g.fillStyle='rgba(255,176,112,.5)';g.fillRect(1,1,14,1);g.fillRect(1,14,14,1);g.fillRect(1,1,1,14);g.fillRect(14,1,1,14);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}
function glowTex(r,g2,b){const c=cvs(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g2},${b},1)`);gr.addColorStop(.18,`rgba(${r},${g2},${b},.85)`);gr.addColorStop(.5,`rgba(${r},${g2},${b},.25)`);gr.addColorStop(1,`rgba(${r},${g2},${b},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
function mergePosed(parts){const P=[],N=[],C=[],I=[];let off=0;for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array;for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=p.length/3}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setIndex(I);r.computeBoundingSphere();return r}
function zPose(type,zv){const zo=ZVAR;ZVAR=zv||null;let mdl;try{mdl=mkModel(type,1)}finally{ZVAR=zo}const o=new THREE.Object3D(),M=(x,y,z,rx)=>{o.position.set(x,y,z);o.rotation.set(rx||0,0,0);o.updateMatrix();return o.matrix.clone()};
 if(type==='brute'){/* knuckle-walker: body bent forward from the hips, long arms planted on the ground */const B=new THREE.Matrix4().makeTranslation(0,mdl.hip,0).multiply(new THREE.Matrix4().makeRotationX(.58)).multiply(new THREE.Matrix4().makeTranslation(0,-mdl.hip,0)),W=m=>B.clone().multiply(m);
  const parts=[[mdl.torso,W(M(0,0,0))],[mdl.head,W(M(0,mdl.neck,0,-.42))],[mdl.arm,W(M(mdl.ax,mdl.sh,0,-.95))],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,W(M(-mdl.ax,mdl.sh,0,-.15))]);return{geo:mergePosed(parts),sc:mdl.sc||1.35}}
 const parts=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,.0,.3)],[mdl.arm,M(mdl.ax,mdl.sh,0,-1.45)],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,M(-mdl.ax,mdl.sh,0,-1.35)]);
 return{geo:mergePosed(parts),sc:mdl.sc||1.35}}
function titleDispose(){for(const u of TARMY){if(u.m){TS3.remove(u.m);u.m.userData.mat.dispose()}}TARMY=[]}
let TCAP=null;
function initTitle(){titleInit=true;TS3.background=gradTex();TS3.fog=new THREE.Fog(0x7a3a30,40,330);
 TLH=new THREE.HemisphereLight(0xd8957f,0x3a2a30,.8);TS3.add(TLH);TLFL=new THREE.DirectionalLight(0xcfe0ff,0);TLFL.position.set(10,80,-60);TS3.add(TLFL);const sun=new THREE.DirectionalLight(0xff9a5a,1.05);sun.position.set(-60,40,-90);TS3.add(sun);const fill=new THREE.DirectionalLight(0x8a6a98,.3);fill.position.set(30,20,60);TS3.add(fill);
 /* voxel terrain in the in-game style: terraced grass hills, dirt, stone, water, blocky trees */
 const CELL=2,X0=-200,NX=200,Z0=-330,NZ2=190,sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 const nz=(x,z)=>Math.sin(x*.045+1.3)*Math.cos(z*.05)+.55*Math.sin(x*.11+z*.07)+.35*Math.sin(z*.13-x*.09+2)+.25*Math.sin(x*.27+z*.23);
 const bg=new THREE.BoxGeometry(1,1,1);bg.translate(0,.5,0);{const pos=bg.attributes.position,nrm=bg.attributes.normal,col=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const top=nrm.getY(i)>.5,bot=nrm.getY(i)<-.5;const c=top?[1,1,1]:bot?[.3,.25,.2]:[.46,.34,.22];col.set(c,i*3)}bg.setAttribute('color',new THREE.BufferAttribute(col,3))}
 const tm=matV.clone(),cells=[];tm.onBeforeCompile=matV.onBeforeCompile;tm.defines={TERR:''};const TH2=new Float32Array(NX*NZ2),KIND=new Uint8Array(NX*NZ2);
 for(let j=0;j<NZ2;j++)for(let i=0;i<NX;i++){const x=X0+i*CELL+CELL/2,z=Z0+j*CELL+CELL/2,az=-z;
  const side=sm(0,22,Math.abs(x)-(26+.72*Math.max(0,az))),back=sm(0,45,az-150),m=Math.max(side,back*1.2);let h=0,kind=0;
  if(m>0){const n=nz(x,z)*.5+.5,lv=Math.floor((n*3.2-.5)*m*1.6+m*1.2);h=Math.max(-.5,lv*1.4);if(lv<0){kind=3;h=-.6}else if(lv>=3){kind=2}else kind=0;if(back>.8&&lv>=2)kind=2}
  else if(az<34&&az>2&&Math.abs(x)<46)kind=1;
  TH2[j*NX+i]=h;KIND[j*NX+i]=kind;
  const jj=.93+.14*(((i*7+j*13)%9)/9),dry=Math.max(0,Math.min(1,(Math.sin(x*.05+2)*Math.cos(z*.06)*.5+.5-.5)*3));let c;
  if(kind===3)c=[.24*jj,.52*jj,.84*jj];else if(kind===2)c=h>=5.6?[.9,.92,.97]:h>=4.2?[.66*jj,.68*jj,.74*jj]:[.5*jj,.54*jj,.5*jj];else if(kind===1)c=[.58*jj,.42*jj,.27*jj];
  else{c=[.3+(.62-.3)*dry*.5,.62+(.6-.62)*dry*.3,.26+(.3-.26)*dry*.5];if(h>=2.8){const t=Math.min(1,(h-2.8)/3);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}c=[c[0]*jj,c[1]*jj,c[2]*jj]}
  cells.push([x,z,h,c])}
 const tI=new THREE.InstancedMesh(bg,tm,cells.length),oo=new THREE.Object3D(),cc=new THREE.Color();cells.forEach(([x,z,h,c],k)=>{oo.position.set(x,-4,z);oo.scale.set(CELL,h+4,CELL);oo.updateMatrix();tI.setMatrixAt(k,oo.matrix);cc.setRGB(c[0],c[1],c[2]);tI.setColorAt(k,cc)});tI.frustumCulled=false;TS3.add(tI);
 const hAt=(x,z)=>{const i=Math.floor((x-X0)/CELL),j=Math.floor((z-Z0)/CELL);return i<0||j<0||i>=NX||j>=NZ2?-9:{h:TH2[j*NX+i],k:KIND[j*NX+i]}};
 /* in-game props: the very same oak / pine / birch / forest / rock / gold / flower models */
 {const sets=[[VAR.t.slice(0,6),.4,'t'],[VAR.t.slice(6,10),.34,'t'],[VAR.t.slice(10),.14,'t'],[FOR,.12,'t']],place=(geo,x,y,z,sc)=>{const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.floor(Math.random()*4)*Math.PI/2),new THREE.Vector3(sc,sc*(.9+Math.random()*.25),sc));(P.get(geo)||P.set(geo,[]).get(geo)).push(m)},P=new Map();
  const pick=arr=>arr[(Math.random()*arr.length)|0];
  for(let tries=0;tries<14000;tries++){const x=-190+Math.random()*380,z=-320+Math.random()*365,az=-z;const inPlay=Math.abs(x)<26+.72*Math.max(0,az)-4&&az<150;const c=hAt(x,z);if(!c||c.k===3)continue;
   if(inPlay){if(c.k!==0||Math.random()>.35)continue;const r=Math.random();if(r<.5){place(pick(DEC.f),x,c.h,z,TZ)}else if(r<.8){place(pick(DEC.t),x,c.h,z,TZ)}else if(r<.93){place(pick(DEC.b),x,c.h,z,TZ)}else if(r<.97){place(DEC.m[0],x,c.h,z,TZ)}else place(DEC.l[0],x,c.h,z,TZ);continue}
   const r=Math.random();if(z>5||(z>-14&&Math.abs(x)<34)){if(c.k===0&&r<.5)place(r<.2?pick(DEC.f):pick(DEC.t),x,c.h,z,TZ);continue}if(c.k===2){if(r<.16)place(pick(VAR.r),x,c.h,z,TZ*1.5);else if(r<.19)place(pick(VAR.g),x,c.h,z,TZ*1.5);else if(r<.3&&c.h<5)place(pick(VAR.t.slice(6,10)),x,c.h,z,TZ*1.3);continue}
   if(r<.55){let q=Math.random(),set=sets[0];for(const st of sets){if(q<st[1]){set=st;break}q-=st[1]}place(pick(set[0]),x,c.h,z,TZ*(.9+Math.random()*.4))}else if(r<.66)place(pick(VAR.r),x,c.h,z,TZ);else if(r<.82)place(pick(DEC.b),x,c.h,z,TZ);else place(pick(DEC.f),x,c.h,z,TZ)}
  for(const[geo,list]of P){const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((m,k)=>im.setMatrixAt(k,m));im.frustumCulled=false;TS3.add(im)}}
 /* blocky clouds */
 TCLOUDS=[];const cm=new THREE.MeshBasicMaterial({color:0x3c2a3a,fog:false,transparent:true,opacity:.96});for(let i=0;i<26;i++){const gp=new THREE.Group();const n=4+(Math.random()*5|0);for(let k=0;k<n;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(9+Math.random()*8,3+Math.random()*2,6+Math.random()*4),cm);b.position.set(k*8-n*4+Math.random()*3,Math.random()*2,Math.random()*5);gp.add(b)}gp.position.set(-260+Math.random()*520,40+Math.random()*30,-240-Math.random()*140);TS3.add(gp);TCLOUDS.push({g:gp,v:1.5+Math.random()*2})}
 /* sun */
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(255,80,40),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(60,30,-300);sp.scale.set(190,190,1);TS3.add(sp);
 const sp2=new THREE.Sprite(new THREE.SpriteMaterial({map:sqSunTex(),transparent:true,depthWrite:false,fog:false}));sp2.position.set(60,30,-299);sp2.scale.set(46,46,1);TS3.add(sp2);
 /* horde: instanced posed zombies */
 const kinds=[['husk',.4,6],['zombie',.42,10],['runner',.12,5],['brute',.06,4]],NZ=1500;
 THORDE=[];for(const[k,f,nv]of kinds){const tot=Math.round(NZ*f);for(let vi=0;vi<nv;vi++){const d=zPose(k,{v:vi,hint:null}),n=Math.max(1,Math.round(tot/nv)),im=new THREE.InstancedMesh(d.geo,matUI,n);im.frustumCulled=false;TS3.add(im);const arr=[];
  for(let i=0;i<n;i++){const depth=Math.pow(Math.random(),.62),z=-12-depth*130,wd=26+(-z)*.7,x=(Math.random()*2-1)*wd;arr.push({x,z,ph:Math.random()*6.28,sp:.7+Math.random()*.8,sc:d.sc*TZ*1.25*(.92+Math.random()*.16)})}
  THORDE.push({im,arr,k})}}

 /* apocalypse: falling ash, ground fires with smoke, lightning */
 {const AN=700,ap=new Float32Array(AN*3);for(let i=0;i<AN;i++){ap[i*3]=(Math.random()-.5)*160;ap[i*3+1]=Math.random()*45;ap[i*3+2]=-Math.random()*130+20}
  const ag2=new THREE.BufferGeometry();ag2.setAttribute('position',new THREE.BufferAttribute(ap,3));TASHP=ap;TASH=new THREE.Points(ag2,new THREE.PointsMaterial({color:0xb8aaa8,size:.22,transparent:true,opacity:.75,depthWrite:false,fog:false}));TASH.frustumCulled=false;TS3.add(TASH)}
 {const pts=[[0,0],[2.5,18],[-1.5,34],[3,52],[-2,72],[1,95],[-3,120]],bm=new THREE.MeshBasicMaterial({color:0xe8f0ff,fog:false});TBOLT=new THREE.Group();for(let k=0;k<pts.length-1;k++){const[ax,ay]=pts[k],[bx,by]=pts[k+1],l=hyp(bx-ax,by-ay),m=new THREE.Mesh(new THREE.BoxGeometry(1.3,l,1.3),bm);m.position.set((ax+bx)/2,(ay+by)/2,0);m.rotation.z=-Math.atan2(bx-ax,by-ay);TBOLT.add(m)}TBOLT.visible=false;TS3.add(TBOLT)}
 /* embers */
 const EN=260,ep=new Float32Array(EN*3);for(let i=0;i<EN;i++){ep[i*3]=(Math.random()-.5)*120;ep[i*3+1]=Math.random()*30;ep[i*3+2]=-Math.random()*110+10}
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ep,3));TEMBP=ep;TEMB=new THREE.Points(eg,new THREE.PointsMaterial({color:0xc8b8b0,size:.3,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEMB.frustumCulled=false;TS3.add(TEMB);
 /* arrows */
 const ag=new THREE.BoxGeometry(.05,.05,1.1),am=new THREE.MeshBasicMaterial({color:0xfff0c0}),ai=new THREE.InstancedMesh(ag,am,170);ai.frustumCulled=false;TS3.add(ai);TARR={im:ai,list:[],next:1};
 buildArmy()}
const _tm=new THREE.Object3D();let TSH={i:0,t:0},TFADE=1,TEYE=null;
const TSHOTS=[
 {d:16,f:(t,T)=>({p:[-5+Math.sin(T*.11)*4,2.3+Math.sin(T*.17)*.25,13+Math.sin(T*.09)*1.2],l:[Math.sin(T*.1)*2,5.8,-40]})},
 {d:10,f:t=>{const k=t/10,e=k*k*(3-2*k);return{p:[-6+e*10,3.2+e*17,10-e*3],l:[e*4,1.5-e*1.5,-58]}}},
 {d:10,f:t=>{const k=t/10;return{p:[-21+k*26,1.35,-12.5],l:[-18+k*26,3.4,-2]}}},
 {d:9,f:t=>{const c=TCAP?TCAP.x/TS:0,k=t/9;return{p:[c+3.4-k*1.2,1.65,-11.4+k*.6],l:[c,2.7,-7.6]}}},
 {d:10,f:t=>{const k=t/10;return{p:[3.6-k*1.6,1.25,3.3],l:[-2,9+k*5,-34]}}}];
function titleEyes(){const N=THORDE.reduce((a,H)=>a+H.arr.length,0),pos=new Float32Array(N*6),gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(pos,3));
 TEYE=new THREE.Points(gm,new THREE.PointsMaterial({color:0xff3a22,size:.26,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEYE.frustumCulled=false;TS3.add(TEYE)}
function renderTitle(dt){if(!titleInit)initTitle();if(titleDirty){buildArmy();titleDirty=false}TT+=dt;
 /* camera: slow dolly with sway, scene shifted right on wide screens so the menu sits left */
 const wide=cv.width/cv.height>1.25,sh=0,t=TT;
 TSH.t+=dt;let S=TSHOTS[TSH.i];if(TSH.t>=S.d){TSH.t-=S.d;TSH.i=(TSH.i+1)%TSHOTS.length;S=TSHOTS[TSH.i];if(TSH.i===4&&TARR)TARR.next=.3}
 TFADE=TSH.t<.7?1-TSH.t/.7:TSH.t>S.d-.7?(TSH.t-(S.d-.7))/.7:0;const cm=S.f(TSH.t,t);camera.position.set(cm.p[0],cm.p[1],cm.p[2]);camera.lookAt(cm.l[0],cm.l[1],cm.l[2]);
 if(window.__cam){camera.position.set(...__cam.p);camera.lookAt(...__cam.l)}
 /* army idle + occasional volleys */
 frameN++;
 for(const u of TARMY){u.walk=0;
  if(u===TCAP){const dir=u.face>0?1:-1;u.x+=dir*dt*TS*.8;u.walk=.25;if(u.x/TS>13&&dir>0)u.face=-Math.PI/2;else if(u.x/TS<-13&&dir<0)u.face=Math.PI/2}
  else{u.x+=Math.sin(TT*.4+u.ph0)*dt*TS*.03;if(u.raise&&u.atk<=0&&Math.random()<dt*.15)u.atk=.35}
  animUnit(u,dt,false,frameN);if(u.m){u.m.position.y=0;const d=u.m.userData;
   if(u===TCAP){d.arm.rotation.x=.95;d.arm.rotation.z=-.78;if(d.armL){d.armL.rotation.x=.95;d.armL.rotation.z=.78}d.body.rotation.x=.08}
   else titlePose(u,d)}}
 resSway(TT);
 TARR.next-=dt;if(TARR.next<=0){TARR.next=3.4+Math.random()*2;const ar=TARMY.filter(u=>u.type==='archer').concat(TRES?TRES.arch:[]);for(const u of ar){if(Math.random()<.7){u.atk=.35;TARR.list.push({sx:u.x/TS,sz:u.y/TS-.5,tx:u.x/TS+(Math.random()-.5)*14,tz:-35-Math.random()*45,t0:TT+Math.random()*.25,dur:2.4+Math.random()*.6})}}}
 let ai=0;for(let i=TARR.list.length-1;i>=0;i--){const a=TARR.list[i],p=(TT-a.t0)/a.dur;if(p>1){TARR.list.splice(i,1);continue}if(p<0)continue;if(ai>=170)break;const x=a.sx+(a.tx-a.sx)*p,z=a.sz+(a.tz-a.sz)*p,y=2.2+28*4*p*(1-p)*.55,p2=Math.min(1,p+.02),x2=a.sx+(a.tx-a.sx)*p2,z2=a.sz+(a.tz-a.sz)*p2,y2=2.2+28*4*p2*(1-p2)*.55;
  _tm.position.set(x,y,z);_tm.lookAt(x2,y2,z2);_tm.scale.set(1,1,1);_tm.updateMatrix();TARR.im.setMatrixAt(ai++,_tm.matrix)}TARR.im.count=ai;TARR.im.instanceMatrix.needsUpdate=true;
 /* horde sway */
 if(!TEYE)titleEyes();const EP=TEYE.geometry.attributes.position.array;let ei=0;
 for(const H of THORDE){const im=H.im;for(let i=0;i<H.arr.length;i++){const z=H.arr[i],s=t*z.sp+z.ph,bob=Math.abs(Math.sin(s*2.2))*.16*(H.k==='runner'?1.6:1),px=z.x+Math.sin(s*.5)*.5,pz=z.z+Math.cos(s*.4)*.6+Math.sin(t*.3)*.8,ry=Math.sin(s*.7)*.35+(z.x>0?.04:-.04);
  _tm.position.set(px,bob,pz);_tm.rotation.set(0,ry,Math.sin(s*2.2)*.09);_tm.scale.set(z.sc,z.sc,z.sc);_tm.updateMatrix();im.setMatrixAt(i,_tm.matrix);
  const cy=Math.cos(ry),sy=Math.sin(ry),ey=bob+.597*z.sc,fz=.112*z.sc;for(const ex of[-.045,.045]){const lx=ex*z.sc;EP[ei++]=px+lx*cy+fz*sy;EP[ei++]=ey;EP[ei++]=pz-lx*sy+fz*cy}}im.instanceMatrix.needsUpdate=true}
 TEYE.geometry.attributes.position.needsUpdate=true;TEYE.material.opacity=.7+.3*Math.sin(t*2.1);
 for(const c of TCLOUDS){c.g.position.x+=c.v*dt;if(c.g.position.x>300)c.g.position.x=-300}

 TFLN-=dt;if(TFLN<=0){TFLN=4+Math.random()*7;TFLASH=.55;TBOLT.position.set((Math.random()-.5)*260,-3,-200-Math.random()*70);TBOLT.visible=true}
 if(TFLASH>0){TFLASH-=dt;const k=Math.max(0,TFLASH)/.55,fl=(Math.sin(TFLASH*60)>-.2?1:.3)*k;TLFL.intensity=3.2*fl;TLH.intensity=.8+1.4*fl;if(TFLASH<=.3)TBOLT.visible=false;if(TFLASH<=0){TLFL.intensity=0;TLH.intensity=.8;TBOLT.visible=false}}
 for(const f of TFIRES){const k=1+.3*Math.sin(t*10+f.ph);f.f.scale.set(k,k*1.5,k);f.f.rotation.y=t*2+f.ph;f.f2.scale.set(.6*k,1.1*k,.6*k);if(f.l)f.l.intensity=1.2+.5*Math.sin(t*9+f.ph*3)}
 for(const s2 of TSMOKE){s2.t+=dt;if(s2.t>8)s2.t-=8;const p=s2.t/8;s2.b.position.set(s2.x+p*7+Math.sin(p*5+s2.x)*1.2,2+p*20,s2.z-p*2);const sc=.8+p*2.6;s2.b.scale.set(sc,sc,sc);s2.b.rotation.y=p*3;s2.b.material.opacity=.55*(1-p)}
 for(let i=0;i<TASHP.length;i+=3){TASHP[i+1]-=dt*(2.2+(i%5)*.4);TASHP[i]+=dt*(2.5+Math.sin(t*.7+i)*1.2);if(TASHP[i+1]<0){TASHP[i+1]=45;TASHP[i]=(Math.random()-.5)*160;TASHP[i+2]=-Math.random()*130+20}if(TASHP[i]>90)TASHP[i]-=180}TASH.geometry.attributes.position.needsUpdate=true;
 for(const f of TFLAMES){const k=1+.25*Math.sin(t*11+f.x);f.f.scale.set(k,k*1.3,k);f.f.rotation.y=t*2;f.l.intensity=1.5+.4*Math.sin(t*9+f.x*3)}
 for(let i=0;i<TEMBP.length;i+=3){TEMBP[i+1]+=dt*(1.5+(i%7)*.2);TEMBP[i]+=dt*(.8+Math.sin(t+i)*.6);if(TEMBP[i+1]>32){TEMBP[i+1]=0;TEMBP[i]=(Math.random()-.5)*120;TEMBP[i+2]=-Math.random()*110+10}}TEMB.geometry.attributes.position.needsUpdate=true;
 postRender(TS3,camera,false)}
/* ---- 3D castle site picker ---- */
let PK=null;const PKS=.25,PKU=.5;
function pkInit(){const sc=new THREE.Scene();sc.background=new THREE.Color(0x9ccaf0);sc.fog=new THREE.Fog(0x9ccaf0,260,1100);
 sc.add(new THREE.HemisphereLight(0xffffff,0x6a7a60,.85));const dl=new THREE.DirectionalLight(0xfff2d8,.85);dl.position.set(-200,300,150);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(45,1,1,4000);
 const cg=new THREE.ConeGeometry(3,10,12);cg.rotateX(Math.PI);cg.translate(0,5,0);const hov=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:0x6fe08a}));hov.visible=false;sc.add(hov);
 const mark=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(6,10,6),new THREE.MeshLambertMaterial({color:0xffd23c}));b.position.y=5;mark.add(b);const bm=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.55}));bm.position.y=30;mark.add(bm);
 const rg=new THREE.Mesh(new THREE.RingGeometry(10,12,40),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.5;mark.add(rg);mark.visible=false;sc.add(mark);
 PK={sc,cam,yaw:.35,pitch:.85,dist:400,tx:PVW*PKU/2,tz:PVH*PKU/2,mesh:null,wat:null,key:-1,hov,mark,Y:null,hit:null}}
function pkBuild(){if(!PK)pkInit();if(pvKey!==SEED)buildPreview();PK.key=SEED;if(PK.mesh){PK.sc.remove(PK.mesh);PK.mesh.geometry.dispose()}if(PK.wat){PK.sc.remove(PK.wat);PK.wat.geometry.dispose()}if(PK.props)for(const m of PK.props)PK.sc.remove(m);PK.props=[];
 const n=PVW*PVH,pos=new Float32Array(n*3),col=new Float32Array(n*3),Y=new Float32Array(n),SM=siteMaskGet();
 const P0=GPR,TR=[],ROC=[],GLD=[],treeAt=(x,y,h)=>{const al=h-LAND,f=fb(x*.06,y*.06,SEED+50),d=(f-P0.tr)/.2;if(d>0&&al<14&&hs(x,y,SEED+11)<Math.min(.9,d*.9+.08))return 2;if(hs(x,y,SEED+12)<P0.tc)return 2;if(al>=2&&fb(x*.05,y*.05,SEED+60)>.78&&hs(x,y,SEED+14)<.42*P0.gd)return 4;if(al>=4&&hs(x,y,SEED+16)<.004*P0.gd)return 4;if(al>=3&&hs(x,y,SEED+13)<.01+.004*al)return 3;if(hs(x,y,SEED+15)<.0025)return 3;return 0};
 for(let j=0;j<PVH;j++)for(let i=0;i<PVW;i++){const k=j*PVW+i,h=pvH[k],wt=pvW[k],tx=Math.min(TW-1,i*PVS+1),ty=Math.min(TH-1,j*PVS+1);let c;const al=h-LAND,jit=.93+.14*hs(tx,ty,9);
  let code=0;if(!wt&&h<ROCKH)code=treeAt(tx,ty,h);
  if(wt)c=[.24,.52,.84];else if(h>=SNOW)c=[.9,.92,.97];else if(h>=ROCKH||al>=15)c=al>=19?[.66,.68,.74]:[.5,.54,.5];
  else{const m=fb(tx*.05,ty*.05,SEED+500),dry=Math.max(0,Math.min(1,(m-.5)*3));c=[.3+.32*dry*.5,.62-.02*dry*.3,.26+.04*dry*.5];if(al>=8){const t=Math.min(1,(al-8)/12);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}
   if(al<=1){const nb=(i>0&&pvW[k-1])||(i<PVW-1&&pvW[k+1])||(j>0&&pvW[k-PVW])||(j<PVH-1&&pvW[k+PVW]);if(nb)c=[.86,.78,.55]}
   if(code===2)c=c.map(v=>v*.78);else if(code===3)c=[.5,.5,.46];else if(code===4)c=[.9,.76,.2]}
  c=c.map(v=>v*jit);if(!wt){if(SM[k])c=[c[0]*.45+.14,c[1]*.45+.55,c[2]*.45+.08];else{const l=(c[0]+c[1]+c[2])/3;c=[l*.62+.06,l*.62+.06,l*.62+.06]}}
  const lvl=Math.round((h-LAND)/2)*2,y=(wt?BED-1:lvl)*PKS;Y[k]=y;pos[k*3]=i*PKU;pos[k*3+1]=y;pos[k*3+2]=j*PKU;col[k*3]=c[0];col[k*3+1]=c[1];col[k*3+2]=c[2];
  if(!wt){const r=hs(tx,ty,31);if(code===2)TR.push([i*PKU,y,j*PKU,al>=8?1:0,.8+hs(tx,ty,32)*.5]);else if(code===3)ROC.push([i*PKU,y,j*PKU,(hs(tx,ty,33)*6)|0]);else if(code===4)GLD.push([i*PKU,y,j*PKU,(hs(tx,ty,34)*3)|0])}}
 const idx=new Uint32Array((PVW-1)*(PVH-1)*6);let p=0;for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){const a=j*PVW+i,b=a+1,c=a+PVW,d=c+1;idx[p++]=a;idx[p++]=c;idx[p++]=b;idx[p++]=b;idx[p++]=c;idx[p++]=d}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
 PK.mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));PK.sc.add(PK.mesh);PK.Y=Y;
 const wg=new THREE.PlaneGeometry(PVW*PKU,PVH*PKU);wg.rotateX(-Math.PI/2);wg.translate(PVW*PKU/2,(WLV-LAND)*PKS,PVH*PKU/2);PK.wat=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({color:0x3f8fe0,transparent:true,opacity:.62}));PK.sc.add(PK.wat);
 PK.lists={TR,ROC,GLD};PK.idx=idx;PK.rect=null;pkProps()}
let PKG=null;function pkGeos(){if(PKG)return;const o=newG();bxc(o,0,0,0,.3,.7,.3,'#6b4423');bxc(o,0,.5,0,1.0,.55,1.0,'#4f9d45');bxc(o,0,.95,0,.7,.5,.7,'#63b457');bxc(o,0,1.4,0,.4,.2,.4,'#7bc86a');const p=newG();bxc(p,0,0,0,.25,.4,.25,'#5a3a1e');bxc(p,0,.3,0,.95,.4,.95,'#2f7a4a');bxc(p,0,.65,0,.7,.4,.7,'#3d8f58');bxc(p,0,1.0,0,.45,.4,.45,'#2a6e48');bxc(p,0,1.35,0,.2,.3,.2,'#4ea068');PKG=[toGeo(o),toGeo(p)]}
function pkProps(){pkGeos();const L=PK.lists;if(!L)return;if(PK.props)for(const m of PK.props){PK.sc.remove(m);m.dispose()}PK.props=[];const R=PK.rect,keep=p=>!R||p[0]<R[0]||p[0]>R[1]||p[2]<R[2]||p[2]>R[3];
 const TR=L.TR.filter(keep),ROC=L.ROC.filter(keep),GLD=L.GLD.filter(keep);
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),vv=new THREE.Vector3(),ss=new THREE.Vector3(),yA=new THREE.Vector3(0,1,0),addSet=(geo,list,sc)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((p,n)=>{q.setFromAxisAngle(yA,((p[3]*7+n)&3)*Math.PI/2);const k2=sc*(p[4]||1);m4.compose(vv.set(p[0],p[1],p[2]),q,ss.set(k2,k2*(geo===PKG[0]||geo===PKG[1]?1.1:1.05),k2));im.setMatrixAt(n,m4)});im.frustumCulled=false;PK.sc.add(im);PK.props.push(im)};
 const stp=Math.max(1,Math.ceil(TR.length/40000)),TA=TR.filter((p,n)=>n%stp===0);for(let v=0;v<2;v++)addSet(PKG[v],TA.filter((p,n)=>(p[3]?1:(n%3===0?1:0))===v),.55);for(let v=0;v<6;v++)addSet(VAR.r[v],ROC.filter(p=>p[3]===v),.9);for(let v=0;v<3;v++)addSet(VAR.g[v],GLD.filter(p=>p[3]===v),1.0)}
/* real generated world around the chosen site: the game's own chunk meshes (terrain, trees, rocks, gold) + the castle */
const PKR=3;let PKD={x:-1,y:-1,grp:null,t:0};
function pkDetail(tx,ty){if(!PK||!PK.idx)return;const t0=performance.now();CX=tx;CY=ty;CROT=PKROT&3;try{reset()}catch(e){return}
 if(PKD.grp){PK.sc.remove(PKD.grp);PKD.grp.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 const grp=new THREE.Group();grp.scale.set(PKU/PVS,PKS,PKU/PVS);grp.position.y=-LAND*PKS;
 const ccx=(tx/CH)|0,ccy=(ty/CH)|0,mv=m=>{if(!m)return;scene.remove(m);m.castShadow=false;m.receiveShadow=false;grp.add(m)};
 for(let j=-PKR;j<=PKR;j++)for(let i=-PKR;i<=PKR;i++){const cx=ccx+i,cy=ccy+j;if(cx<0||cy<0||cx>=NCX||cy>=NCY)continue;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)genChunk(cx+a,cy+b);const o=buildChunk(cx,cy);mv(o.m);mv(o.w);mv(buildProps(cx,cy))}
 for(const st of structs)if(st.o3){scene.remove(st.o3);grp.add(st.o3)}
 PK.sc.add(grp);PKD.grp=grp;PKD.x=tx;PKD.y=ty;PKD.r=PKROT&3;
 const x0=(ccx-PKR)*CH,x1=(ccx+PKR+1)*CH,y0=(ccy-PKR)*CH,y1=(ccy+PKR+1)*CH,u=PKU/PVS;PK.rect=[x0*u,x1*u,y0*u,y1*u];pkProps();
 const i0=Math.floor(x0/PVS),i1=Math.ceil(x1/PVS),j0=Math.floor(y0/PVS),j1=Math.ceil(y1/PVS),src=PK.idx,out=new Uint32Array(src.length);let p=0;
 for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){if(i>=i0&&i<i1&&j>=j0&&j<j1)continue;const k=(j*(PVW-1)+i)*6;out[p++]=src[k];out[p++]=src[k+1];out[p++]=src[k+2];out[p++]=src[k+3];out[p++]=src[k+4];out[p++]=src[k+5]}
 PK.mesh.geometry.setIndex(new THREE.BufferAttribute(out.subarray(0,p),1));PKD.ms=performance.now()-t0}
function pkCam(){const c=PK.cam,cp=Math.cos(PK.pitch);c.position.set(PK.tx+Math.sin(PK.yaw)*cp*PK.dist,Math.sin(PK.pitch)*PK.dist,PK.tz+Math.cos(PK.yaw)*cp*PK.dist);c.lookAt(PK.tx,0,PK.tz);c.aspect=cv.width/cv.height;c.updateProjectionMatrix();c.updateMatrixWorld()}
const _pkv=new THREE.Vector3();
function pkRay(p){if(!PK||!PK.Y)return null;pkCam();const c=PK.cam;_pkv.set(p.x/cv.width*2-1,-(p.y/cv.height*2-1),.5).unproject(c);const o=c.position,dx=_pkv.x-o.x,dy=_pkv.y-o.y,dz=_pkv.z-o.z,L=Math.sqrt(dx*dx+dy*dy+dz*dz),ux=dx/L,uy=dy/L,uz=dz/L;
 for(let t=0;t<4000;t+=1.2){const x=o.x+ux*t,y=o.y+uy*t,z=o.z+uz*t;if(x<0||z<0||x>(PVW-1)*PKU||z>(PVH-1)*PKU)continue;const k=Math.round(z/PKU)*PVW+Math.round(x/PKU);if(y<=PK.Y[k]){return{x,y,z}}}return null}
function pkTile(h){return{tx:Math.max(0,Math.min(TW-1,Math.round(h.x/PKU*PVS+1))),ty:Math.max(0,Math.min(TH-1,Math.round(h.z/PKU*PVS+1)))}}
function pkSet(tx,ty,ok){pickPos={tx,ty,ok}}
function renderPick(dt){if(!PK||PK.key!==SEED){pkBuild();PKD.x=-1;PKD.grp=null}
 if(pickPos&&pickPos.ok&&(pickPos.tx!==PKD.x||pickPos.ty!==PKD.y||(PKROT&3)!==PKD.r)){PKD.w=(PKD.w||0)+dt;if(PKD.w>.3||PKD.x<0){PKD.w=0;pkDetail(pickPos.tx,pickPos.ty)}}
 if(pickPos&&PK.mark){PK.mark.visible=true;const i=Math.max(0,Math.min(PVW-1,Math.round((pickPos.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((pickPos.ty-1)/PVS)));PK.mark.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);PK.mark.children[2].material.color.set(pickPos.ok?0xffd23c:0xff6b6b);PK.mark.children[0].visible=!(PKD.grp&&pickPos.ok&&PKD.x===pickPos.tx&&PKD.y===pickPos.ty);PK.mark.children[2].scale.set(.4,.4,.4)}else PK.mark.visible=false;
 const h=pkRay(mouse);if(h&&!uiRects.some(r=>inR(mouse,r))){const t=pkTile(h),ok=siteOK(t.tx,t.ty);PK.hov.visible=true;PK.hov.position.set(h.x,h.y+1,h.z);PK.hov.material.color.set(ok?0x6fe08a:0xff6b6b);PK.hov.position.y+=2+Math.sin(clockT*5)*1.2;PK.hit={...t,ok}}else{PK.hov.visible=false;PK.hit=null}
 pkCam();renderer.render(PK.sc,PK.cam)}
function pkFocus(){if(!PK||!pickPos)return;if(typeof pkLiveFocus==='function')pkLiveFocus(pickPos.tx,pickPos.ty);PK.tx=(pickPos.tx-1)/PVS*PKU;PK.tz=(pickPos.ty-1)/PVS*PKU}
/* ---- 3D rendered UI icons ---- */
let ICR=null;
function icoInit(){const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x9a8a78,.85));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-3,5,4);sc.add(dl);
 ICR={sc,cam:new THREE.PerspectiveCamera(28,1,.05,200),rt:new THREE.WebGLRenderTarget(ICO_RT,ICO_RT,{samples:4}),buf:new Uint8Array(ICO_RT*ICO_RT*4)}}
const icoMesh=(G)=>new THREE.Mesh(toGeo(G),matV);
const icoStd=(geo,c)=>new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));
function icoUnit(type,t){const u=mkU(t||0,type,0,0);u.face=0;u.fa=0;u.hp=1;u.ttl=1;animUnit(u,.016,false,0);const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);{const rm=[];g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o))}const w=new THREE.Group();w.add(g);return w}
function icoStruct(type,m,tier,extra){const s={type,t:0,tier:tier==null?1:tier,sz:1};const w=new THREE.Group();const me=new THREE.Mesh(sGeo(s,m||0),matV);w.add(me);if(extra)extra(w);return w}
let ICOT=-1;const ICT=[{},{}],TIERK=new Set(['wall','gate','tower','barracks','path']);
function icoObj(k){
 switch(k){
 case 'peasant':case 'idle':return icoUnit('peasant');case 'knight':return icoUnit('knight');case 'archer':return icoUnit('archer');case 'bannerman':return icoUnit('bannerman');case 'captain':return icoUnit('captain');
 case 'skull':return icoUnit('zombie',1);
 case 'cannon':{const w=new THREE.Group(),m=new THREE.Mesh(GEO.cannonU||(GEO.cannonU=cannonG()),matV);m.rotation.y=-.5;w.add(m);return w}
 case 'wall':return icoStruct('wall',10,ICOT<0?(RS.done?1:0):ICOT);case 'tower':return icoStruct('tower',0,ICOT<0?(RS.done?1:0):ICOT);case 'barracks':return icoStruct('barracks',0,ICOT<0?(RS.done?1:0):ICOT);case 'farm':return icoStruct('farm',0,1);
 case 'gate':return icoStruct('gate',0,ICOT<0?(RS.done?1:0):ICOT,w=>{const d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.position.set(0,1.32,0);w.add(d)});
 case 'home':case 'castle':{const w=icoStruct('castle',0,RS.done?1:0);return w}
 case 'upgrade':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<2;j++)bxc(G,-.5+i*.5,j*.32,0,.46,.3,.46,j%2?'#b9bcc8':'#9a9ba6');bxc(G,0,.64,0,.46,.3,.46,'#c7c9d4');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.55,4),0xffd23c);c.position.set(0,1.28,0);w.add(c);return w}
 case 'ballista':return icoStruct('ballista',0,1,w=>{const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);w.add(h)});
 case 'trebuchet':return icoStruct('trebuchet',0,1,w=>{const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.y=.4;w.add(a)});
 case 'path':{const G=newG(),st=ICOT===1;for(let i=0;i<3;i++)for(let j=0;j<3;j++)bxc(G,(i-1)*.55,0,(j-1)*.55,.5,.12+((i+j)%2)*.03,.5,st?((i+j)%2?'#8e9098':'#a9abb3'):((i+j)%2?'#b08a58':'#c4a06a'));return icoMesh(G)}
 case 'raise':{const w=new THREE.Group();const G=newG();for(let i=0;i<2;i++)for(let j=0;j<2;j++)bxc(G,(i-.5)*.6,0,(j-.5)*.6,.58,.5,.58,'#8a6238'),bxc(G,(i-.5)*.6,.5,(j-.5)*.6,.58,.14,.58,'#5fae48');bxc(G,0,.64,0,.58,.5,.58,'#8a6238');bxc(G,0,1.14,0,.58,.14,.58,'#5fae48');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.32,.6,4),0xffd23c);c.position.set(0,1.9,0);w.add(c);return w}
 case 'dig':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i===1&&j===1)continue;bxc(G,(i-1)*.5,0,(j-1)*.5,.48,.6,.48,'#8a6238');bxc(G,(i-1)*.5,.6,(j-1)*.5,.48,.14,.48,'#5fae48')}bxc(G,0,0,0,.48,.25,.48,'#5a3d1e');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.6,4),0xffd23c);c.rotation.x=Math.PI;c.position.set(0,1.5,0);w.add(c);return w}
 case 'coin':{const G=newG();const ing=(x,y,z)=>{bxc(G,x,y,z,1.0,.3,.5,'#e8b820');bxc(G,x,y+.3,z,.8,.1,.34,'#ffe266');bxc(G,x-.38,y+.2,z+.18,.1,.06,.06,'#fff6c0')};ing(0,0,0);ing(.12,.4,-.05);return icoMesh(G)}
 case 'wood':{const G=newG();bxc(G,0,0,0,1,1,1,'#6b5030');bxc(G,0,1,0,.94,.02,.94,'#b8945f');bxc(G,0,1.02,0,.64,.02,.64,'#9a7a48');bxc(G,0,1.04,0,.3,.02,.3,'#b8945f');bxc(G,.2,.3,.51,.12,.4,.02,'#4f3a22');bxc(G,-.25,.55,.51,.1,.3,.02,'#4f3a22');return icoMesh(G)}
 case 'stone':{const G=newG();bxc(G,0,0,0,1,1,1,'#7f7f7f');[[-.25,.7,.51,.4,.22],[.22,.3,.51,.36,.26],[-.2,.12,.51,.3,.2]].forEach(([x,y,z,w,h],k)=>bxc(G,x,y,z,w,h,.02,k%2?'#9a9a9a':'#646464'));[[.51,.6,.2],[.51,.25,-.2]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.02,.26,.36,k?'#9a9a9a':'#646464'));[[0,1.01,.1],[.2,1.01,-.25]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.36,.02,.3,k?'#9a9a9a':'#646464'));return icoMesh(G)}
 case 'heart':{const G=newG();[[0,1,3],[-1,.4,1],[1,.4,1]].forEach(()=>0);const rows=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];rows.forEach((r,j)=>{for(let i=0;i<7;i++)if(r[i]==='X')bxc(G,(i-3)*.3,(5-j)*.3,0,.3,.3,.3,j<2&&i>0&&i<3&&j===0?'#ff9a9a':'#e03a4a')});return icoMesh(G)}
 case 'sword':{const G=newG();vsp(G,sprites().sword,0,0,0,.1);return icoMesh(G)}
 case 'hammer':{return icoObj('upgrade')}
 case 'army':{const w=new THREE.Group();[[-.9,0],[0,0],[.9,0]].forEach(([x,z],i)=>{const u=icoUnit('knight');u.position.set(x*.8,0,i===1?-.7:0);w.add(u)});return w}
 case 'group':{const w=new THREE.Group();[[-.8,0],[.8,0],[0,-.8]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 case 'ungroup':{const w=new THREE.Group();[[-.9,0],[.9,0]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 }return null}
function icoShot(obj,yaw,pitch){const R=ICR,cam=R.cam;R.sc.add(obj);obj.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=Math.max(.01,sp.radius),d=r/Math.sin(cam.fov*Math.PI/360)*1.02;
 yaw=yaw==null?.6:yaw;pitch=pitch==null?.3:pitch;cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
 const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const fw0=FOWU.fowP.value.w,fz0=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(R.rt);renderer.clear();renderer.render(R.sc,cam);renderer.readRenderTargetPixels(R.rt,0,0,ICO_RT,ICO_RT,R.buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);FOWU.fowP.value.w=fw0;FOWU.fowP.value.z=fz0;R.sc.remove(obj);
 const N2=ICO_RT,cv2=cvs(N2,N2),g=cv2.getContext('2d'),im=g.createImageData(N2,N2);for(let y=0;y<N2;y++){const sy=N2-1-y;for(let x=0;x<N2;x++){const s=(sy*N2+x)*4,o=(y*N2+x)*4;im.data[o]=R.buf[s];im.data[o+1]=R.buf[s+1];im.data[o+2]=R.buf[s+2];im.data[o+3]=R.buf[s+3]}}g.putImageData(im,0,0);return arcIcon(cv2,ICO_N)}
function icons3D(){try{if(!ICR)icoInit();const keys=['cannon','peasant','idle','knight','archer','bannerman','captain','skull','wall','tower','gate','barracks','farm','home','upgrade','ballista','trebuchet','path','raise','dig','coin','wood','stone','heart','sword','army','group','ungroup'];
 for(const k of keys){const o=icoObj(k);if(!o)continue;const yaw=['coin','wood','stone','path','raise','dig','upgrade','heart','sword'].includes(k)?.5:.45;IC[k]=icoShot(o,k==='heart'?0:k==='sword'?Math.PI/2:yaw,k==='heart'||k==='sword'?0:.35)}IC.castle=IC.home;IC.hammer=IC.upgrade;
 try{for(const t of[0,1]){ICOT=t;for(const k of TIERK){const o=icoObj(k);if(o)ICT[t][k]=icoShot(o,k==='path'?.5:.45,.35)}}}finally{ICOT=-1}}catch(e){console.error('icons3D',e)}}
/* ================= UI toolkit: vector icons, rounded panels, smooth text ================= */
const FF='"NaxNum","Marcellus","Palatino Linotype","Book Antiqua",Georgia,serif',FFT='"Cinzel","Marcellus",Georgia,serif';
try{document.fonts&&document.fonts.load('400 16px NaxNum','0')}catch(e){}
const fontOf=sz=>{const px=sz*1.25;return px>=16?'700 '+Math.round(px*.84)+'px '+FFT:'400 '+Math.round(px*.92)+'px '+FF};
const setF=(sz,w)=>{ctx.font=fontOf(sz)};
const TWM=new Map();try{if(document.fonts){document.fonts.addEventListener('loadingdone',()=>TWM.clear());document.fonts.ready.then(()=>TWM.clear())}}catch(e){}

/* ================= LANGUAGES =================
   Every text drawn by the interface goes through L(): exact phrases, then templates ("Wave {0}", "{0} has fallen to the horde"),
   then pieces split on separators. English is the source; the choice is kept per player. */
const LANGS=[['English','gb'],['Français','fr'],['Español','es'],['Deutsch','de'],['Italiano','it'],['Português','pt']];
let LANG=0;try{LANG=Math.max(0,Math.min(LANGS.length-1,+(localStorage.getItem('dk_lang')||0)|0))}catch(e){}
const TRD={"    Best: wave ":["    Meilleur : vague ","    Récord: oleada ","    Bestwert: Welle ","    Record: ondata ","    Recorde: onda "],"    Zombies slain: ":["    Zombies tués : ","    Zombis abatidos: ","    Getötete Zombies: ","    Zombi uccisi: ","    Zumbis abatidos: "],"   Click to jump there":["   Cliquez pour y aller","   Haz clic para ir allí","   Klicken, um dorthin zu springen","   Clicca per andarci","   Clique para ir até lá"],"   Generating ":["   Génération ","   Generando ","   Erzeuge ","   Generazione ","   Gerando "],"  -  BRUTES!":["  -  BRUTES !","  -  ¡BRUTOS!","  -  SCHLÄGER!","  -  BRUTI!","  -  BRUTOS!"]," (host)":[" (hôte)"," (anfitrión)"," (Host)"," (host)"," (anfitrião)"]," (shared)":[" (partagé)"," (compartido)"," (geteilt)"," (condiviso)"," (partilhado)"]," (uses resources)":[" (coûte des ressources)"," (usa recursos)"," (kostet Rohstoffe)"," (usa risorse)"," (usa recursos)"]," - 3 tiles: two towers and a passage, [R] rotates":[" - 3 cases : deux tours et un passage, [R] pour tourner"," - 3 casillas: dos torres y un paso, [R] gira"," - 3 Felder: zwei Türme und ein Durchgang, [R] dreht"," - 3 caselle: due torri e un passaggio, [R] ruota"," - 3 casas: duas torres e uma passagem, [R] roda"]," - castle":[" - château"," - castillo"," - Burg"," - castello"," - castelo"]," - click a building":[" - cliquez sur un bâtiment"," - haz clic en un edificio"," - klicke auf ein Gebäude"," - clicca un edificio"," - clique num edifício"]," - click a tile - right-click or Esc cancels":[" - cliquez une case - clic droit ou Échap pour annuler"," - haz clic en una casilla - clic derecho o Esc cancela"," - klicke auf ein Feld - Rechtsklick oder Esc bricht ab"," - clicca una casella - tasto destro o Esc annulla"," - clique numa casa - botão direito ou Esc cancela"]," - click or drag over wood buildings":[" - cliquez ou glissez sur les bâtiments en bois"," - haz clic o arrastra sobre edificios de madera"," - klicke oder ziehe über Holzgebäude"," - clicca o trascina sugli edifici in legno"," - clique ou arraste sobre edifícios de madeira"]," - click the new centre of your castle":[" - cliquez le nouveau centre de votre château"," - haz clic en el nuevo centro de tu castillo"," - klicke auf die neue Mitte deiner Burg"," - clicca il nuovo centro del castello"," - clique no novo centro do seu castelo"]," - nobody works it: right-click it with a peasant":[" - personne n'y travaille : clic droit avec un paysan"," - nadie lo trabaja: clic derecho con un campesino"," - niemand arbeitet hier: Rechtsklick mit einem Bauern"," - nessuno ci lavora: tasto destro con un contadino"," - ninguém o trabalha: botão direito com um camponês"]," - one block that climbs 1 level, [R] turns it":[" - un bloc qui monte d'un niveau, [R] le tourne"," - un bloque que sube 1 nivel, [R] lo gira"," - ein Block, der 1 Ebene ansteigt, [R] dreht ihn"," - un blocco che sale di 1 livello, [R] lo gira"," - um bloco que sobe 1 nível, [R] roda-o"]," - paint tiles":[" - peignez les cases"," - pinta casillas"," - Felder bemalen"," - dipingi le caselle"," - pinte casas"]," - press Repair":[" - appuyez sur Réparer"," - pulsa Reparar"," - drücke Reparieren"," - premi Ripara"," - prima Reparar"]," - worked by a peasant":[" - travaillé par un paysan"," - trabajado por un campesino"," - von einem Bauern bewirtschaftet"," - lavorato da un contadino"," - trabalhado por um camponês"]," / 10 soldiers":[" / 10 soldats"," / 10 soldados"," / 10 Soldaten"," / 10 soldati"," / 10 soldados"]," BEATEN":[" VAINCU"," DERROTADO"," BESIEGT"," SCONFITTO"," DERROTADO"]," HP":[" PV"," PV"," LP"," PS"," PV"]," cannot be reached by your peasants":[" inaccessible pour vos paysans"," no es accesible para tus campesinos"," ist für deine Bauern unerreichbar"," non è raggiungibile dai tuoi contadini"," não é acessível aos seus camponeses"]," colours":[" couleurs"," colores"," Farben"," colori"," cores"]," deg":[" °"," °"," °"," °"," °"]," first":[" d'abord"," primero"," zuerst"," prima"," primeiro"]," for ":[" pour "," por "," für "," per "," por "]," founds ":[" fonde "," funda "," gründet "," fonda "," funda "]," founds a new settlement":[" fonde une nouvelle colonie"," funda un nuevo asentamiento"," gründet eine neue Siedlung"," fonda un nuovo insediamento"," funda um novo povoado"]," gold":[" or"," oro"," Gold"," oro"," ouro"]," gold to buy 50 ":[" or pour acheter 50 "," oro para comprar 50 "," Gold, um 50 zu kaufen: "," oro per comprare 50 "," ouro para comprar 50 "]," gold, +":[" or, +"," oro, +"," Gold, +"," oro, +"," ouro, +"]," growing":[" en croissance"," creciendo"," wachsen"," in crescita"," a crescer"]," has fallen to the horde":[" est tombé face à la horde"," ha caído ante la horda"," ist der Horde zum Opfer gefallen"," è caduto per mano dell'orda"," caiu perante a horda"]," idle":[" inactif"," inactivo"," untätig"," inattivo"," inativo"]," idle peasant":[" paysan inactif"," campesino inactivo"," untätiger Bauer"," contadino inattivo"," camponês inativo"]," inside":[" à l'intérieur"," dentro"," drinnen"," dentro"," lá dentro"]," is already used by another room: choose a different one.":[" est déjà utilisé par un autre salon : choisissez-en un autre."," ya lo usa otra sala: elige otro."," wird schon von einem anderen Raum benutzt: wähle einen anderen."," è già usato da un'altra stanza: scegline un altro."," já é usado por outra sala: escolha outro."]," is empty":[" est vide"," está vacío"," ist leer"," è vuoto"," está vazio"]," is full":[" est plein"," está lleno"," ist voll"," è pieno"," está cheio"]," is in progress":[" est en cours"," está en curso"," läuft"," è in corso"," está em curso"]," is not damaged":[" n'est pas endommagé"," no está dañado"," ist nicht beschädigt"," non è danneggiato"," não está danificado"]," is too expensive":[" est trop cher"," es demasiado caro"," ist zu teuer"," è troppo costoso"," é demasiado caro"]," is under attack!":[" est attaqué !"," está siendo atacado!"," wird angegriffen!"," è sotto attacco!"," está a ser atacado!"]," joined the lobby!":[" a rejoint le salon !"," se unió a la sala!"," ist dem Raum beigetreten!"," è entrato nella stanza!"," entrou na sala!"]," leave the castle and go back to work":[" quittent le château et retournent au travail"," salen del castillo y vuelven al trabajo"," verlassen die Burg und gehen wieder an die Arbeit"," lasciano il castello e tornano al lavoro"," saem do castelo e voltam ao trabalho"]," left)":[" restants)"," restantes)"," übrig)"," rimasti)"," restantes)"]," needs ":[" nécessite "," necesita "," benötigt "," richiede "," precisa de "]," not found. Check the code with the host.":[" introuvable. Vérifiez le code avec l'hôte."," no encontrado. Comprueba el código con el anfitrión."," nicht gefunden. Prüfe den Code mit dem Host."," non trovato. Controlla il codice con l'host."," não encontrado. Verifique o código com o anfitrião."]," off":[" désactivé"," desactivado"," aus"," disattivato"," desligado"]," on":[" activé"," activado"," an"," attivato"," ligado"]," on a tower - [R] sets facing":[" sur une tour - [R] règle l'orientation"," sobre una torre - [R] fija la orientación"," auf einem Turm - [R] legt die Richtung fest"," su una torre - [R] imposta la direzione"," numa torre - [R] define a orientação"]," peasant":[" paysan"," campesino"," Bauer"," contadino"," camponês"]," peasants selected":[" paysans sélectionnés"," campesinos seleccionados"," Bauern ausgewählt"," contadini selezionati"," camponeses selecionados"]," per kingdom":[" par royaume"," por reino"," pro Königreich"," per regno"," por reino"]," placed their castle":[" a placé son château"," ha colocado su castillo"," hat seine Burg platziert"," ha posizionato il castello"," colocou o seu castelo"]," promoted: ":[" promu : "," ascendido: "," befördert: "," promosso: "," promovido: "]," rdy":[" prêt"," listo"," bereit"," pronto"," pronto"]," rebuilds its castle in stone":[" reconstruit son château en pierre"," reconstruye su castillo en piedra"," baut seine Burg in Stein neu"," ricostruisce il castello in pietra"," reconstrói o seu castelo em pedra"]," rotated":[" tourné"," girado"," gedreht"," ruotato"," rodado"]," runs ":[" lance "," ejecuta "," startet "," avvia "," executa "]," sapling":[" pousse"," brote"," Setzling"," alberello"," rebento"]," saved (":[" sauvegardé ("," guardado ("," gespeichert ("," salvato ("," guardado ("]," selected":[" sélectionnés"," seleccionados"," ausgewählt"," selezionati"," selecionados"]," sent to repair the ":[" envoyé réparer le "," enviado a reparar el "," zum Reparieren geschickt: "," mandato a riparare "," enviado para reparar o "]," sheltering inside (Repair calls them out)":[" à l'abri (Réparer les fait sortir)"," refugiados dentro (Reparar los hace salir)"," im Schutz (Reparieren ruft sie heraus)"," al riparo (Ripara li fa uscire)"," abrigados (Reparar chama-os)"]," started ":[" a lancé "," inició "," hat gestartet: "," ha avviato "," iniciou "]," started Stonemasonry (shared)":[" a lancé la Maçonnerie (partagée)"," inició la Cantería (compartida)"," hat Steinmetzkunst gestartet (geteilt)"," ha avviato la Muratura (condivisa)"," iniciou a Cantaria (partilhada)"]," stone":[" pierre"," piedra"," Stein"," pietra"," pedra"]," tiles":[" cases"," casillas"," Felder"," caselle"," casas"]," to repair the ":[" pour réparer le "," para reparar el "," zum Reparieren: "," per riparare "," para reparar o "]," to sell":[" à vendre"," para vender"," zum Verkaufen"," da vendere"," para vender"]," types":[" types"," tipos"," Typen"," tipi"," tipos"]," villager":[" villageois"," aldeano"," Dorfbewohner"," abitante"," aldeão"]," walking to the ":[" en route vers le "," caminando hacia el "," auf dem Weg zu: "," in cammino verso "," a caminho do "]," wanted":[" souhaités"," deseados"," gewünscht"," voluti"," desejados"]," wood, +":[" bois, +"," madera, +"," Holz, +"," legno, +"," madeira, +"]," zombies slain":[" zombies tués"," zombis abatidos"," Zombies getötet"," zombi uccisi"," zumbis abatidos"],"!  -  from ":[" !  -  depuis "," !  -  desde "," !  -  von "," !  -  da "," !  -  de "],"). Check your connection and try again.":["). Vérifiez votre connexion et réessayez.","). Comprueba tu conexión e inténtalo de nuevo.","). Prüfe deine Verbindung und versuche es erneut.","). Controlla la connessione e riprova.","). Verifique a ligação e tente de novo."],"+6 food every 6 s while he farms it":["+6 nourriture toutes les 6 s quand il la cultive","+6 comida cada 6 s mientras la cultiva","+6 Nahrung alle 6 s, solange er sie bewirtschaftet","+6 cibo ogni 6 s mentre la coltiva","+6 comida a cada 6 s enquanto a cultiva"],". Use the same version or the game will desync.":[". Utilisez la même version, sinon la partie se désynchronisera.",". Usa la misma versión o la partida se desincronizará.",". Nutzt dieselbe Version, sonst läuft das Spiel auseinander.",". Usate la stessa versione o la partita si desincronizzerà.",". Usem a mesma versão ou o jogo vai dessincronizar."],"...and he rises among the dead":["...et il se relève parmi les morts","...y se alza entre los muertos","...und er erhebt sich unter den Toten","...e si rialza tra i morti","...e ergue-se entre os mortos"],"A Seedy Place":["Un coin bien planté","Un lugar sembrado","Ein saatreicher Ort","Un posto ben seminato","Um lugar bem semeado"],"A bomber blew up!":["Un kamikaze a explosé !","¡Un kamikaze ha explotado!","Ein Bomber ist explodiert!","Un kamikaze è esploso!","Um bombista explodiu!"],"A construction site":["Un chantier","Una obra","Eine Baustelle","Un cantiere","Uma obra"],"A merchant caravan passes: +":["Une caravane marchande passe : +","Pasa una caravana de mercaderes: +","Eine Händlerkarawane zieht vorbei: +","Passa una carovana di mercanti: +","Passa uma caravana de mercadores: +"],"A new halberdier to escort the king (2 at most)":["Un nouveau hallebardier pour escorter le roi (2 au maximum)","Un nuevo alabardero para escoltar al rey (2 como máximo)","Ein neuer Hellebardier als Eskorte des Königs (höchstens 2)","Un nuovo alabardiere per scortare il re (massimo 2)","Um novo alabardeiro para escoltar o rei (no máximo 2)"],"A peasant now works the ":["Un paysan travaille maintenant : ","Un campesino trabaja ahora: ","Ein Bauer arbeitet jetzt hier: ","Un contadino ora lavora: ","Um camponês trabalha agora: "],"A peasant who only builds new buildings":["Un paysan qui ne fait que construire les nouveaux bâtiments","Un campesino que solo construye edificios nuevos","Ein Bauer, der nur neue Gebäude baut","Un contadino che costruisce solo edifici nuovi","Um camponês que só constrói edifícios novos"],"A tower with a siege weapon cannot turn":["Une tour avec une arme de siège ne peut pas tourner","Una torre con arma de asedio no puede girar","Ein Turm mit Belagerungswaffe kann nicht gedreht werden","Una torre con arma d'assedio non può ruotare","Uma torre com arma de cerco não pode rodar"],"A villager is cut off from your castle and storages - open a way or build a gate":["Un villageois est coupé de votre château et des entrepôts - ouvrez un passage ou construisez une porte","Un aldeano está aislado de tu castillo y almacenes - abre paso o construye una puerta","Ein Dorfbewohner ist von Burg und Lagern abgeschnitten - öffne einen Weg oder baue ein Tor","Un abitante è isolato dal castello e dai magazzini - apri un varco o costruisci una porta","Um aldeão está isolado do castelo e armazéns - abra caminho ou construa um portão"],"ACID SPITTERS":["CRACHEURS D'ACIDE","ESCUPIDORES DE ÁCIDO","SÄURESPUCKER","SPUTA-ACIDO","CUSPIDORES DE ÁCIDO"],"Academy":["Académie","Academia","Akademie","Accademia","Academia"],"Academy: research upgrades here":["Académie : recherchez des améliorations ici","Academia: investiga mejoras aquí","Akademie: hier Verbesserungen erforschen","Accademia: ricerca potenziamenti qui","Academia: pesquise melhorias aqui"],"Achievement":["Succès","Logro","Erfolg","Obiettivo","Conquista"],"Acid! Your men and walls are burning":["De l'acide ! Vos hommes et vos murs brûlent","¡Ácido! Tus hombres y muros se queman","Säure! Deine Männer und Mauern brennen","Acido! I tuoi uomini e le mura bruciano","Ácido! Os seus homens e muralhas ardem"],"Add a builder":["Ajouter un bâtisseur","Añadir un constructor","Einen Baumeister hinzufügen","Aggiungi un costruttore","Adicionar um construtor"],"Add a repairer":["Ajouter un réparateur","Añadir un reparador","Einen Reparierer hinzufügen","Aggiungi un riparatore","Adicionar um reparador"],"Add a terraformer":["Ajouter un terrassier","Añadir un terraplenador","Einen Erdarbeiter hinzufügen","Aggiungi un terrazziere","Adicionar um terraplanador"],"Aggressive [1]":["Agressif [1]","Agresivo [1]","Aggressiv [1]","Aggressivo [1]","Agressivo [1]"],"Aggressive: chase every enemy in sight":["Agressif : poursuit tout ennemi en vue","Agresivo: persigue a todo enemigo a la vista","Aggressiv: jagt jeden sichtbaren Feind","Aggressivo: insegue ogni nemico in vista","Agressivo: persegue todo inimigo à vista"],"All visible ":["Tous les visibles ","Todos los visibles ","Alle sichtbaren ","Tutti i visibili ","Todos os visíveis "],"Allies within 8 tiles hit 25% harder":["Les alliés à moins de 8 cases frappent 25 % plus fort","Los aliados a menos de 8 casillas golpean un 25 % más fuerte","Verbündete im Umkreis von 8 Feldern treffen 25 % härter","Gli alleati entro 8 caselle colpiscono il 25% più forte","Aliados a menos de 8 casas atacam 25% mais forte"],"Already researched":["Déjà recherché","Ya investigado","Bereits erforscht","Già ricercato","Já pesquisado"],"Already water":["Déjà de l'eau","Ya es agua","Bereits Wasser","Già acqua","Já é água"],"Also try Co-op!":["Essayez aussi la coop !","¡Prueba también el cooperativo!","Probiere auch Koop!","Prova anche la coop!","Experimente também o cooperativo!"],"Amber":["Ambre","Ámbar","Bernstein","Ambra","Âmbar"],"Archer":["Archer","Arquero","Bogenschütze","Arciere","Arqueiro"],"Archers":["Archers","Arqueros","Bogenschützen","Arcieri","Arqueiros"],"Archers and towers hit 25-40% harder":["Archers et tours frappent 25 à 40 % plus fort","Arqueros y torres golpean un 25-40 % más fuerte","Bogenschützen und Türme treffen 25-40 % härter","Arcieri e torri colpiscono il 25-40% più forte","Arqueiros e torres atacam 25-40% mais forte"],"Army":["Armée","Ejército","Armee","Esercito","Exército"],"Attack":["Attaquer","Atacar","Angreifen","Attacca","Atacar"],"Autosave":["Sauvegarde auto","Autoguardado","Autospeicherung","Salvataggio automatico","Gravação automática"],"Azure":["Azur","Azur","Azur","Azzurro","Azul-celeste"],"BLOOD MOON - a bigger, faster horde! ":["LUNE DE SANG - une horde plus grande et plus rapide ! ","LUNA DE SANGRE - ¡una horda mayor y más rápida! ","BLUTMOND - eine größere, schnellere Horde! ","LUNA DI SANGUE - un'orda più grande e veloce! ","LUA DE SANGUE - uma horda maior e mais rápida! "],"BOMBERS":["KAMIKAZES","KAMIKAZES","BOMBER","KAMIKAZE","BOMBISTAS"],"Back":["Retour","Volver","Zurück","Indietro","Voltar"],"Back [Esc]":["Retour [Échap]","Volver [Esc]","Zurück [Esc]","Indietro [Esc]","Voltar [Esc]"],"Back to Game":["Retour au jeu","Volver al juego","Zurück zum Spiel","Torna al gioco","Voltar ao jogo"],"Back to base":["Retour à la base","Volver a la base","Zurück zur Basis","Torna alla base","Voltar à base"],"Back to base [H]":["Retour à la base [H]","Volver a la base [H]","Zurück zur Basis [H]","Torna alla base [H]","Voltar à base [H]"],"Back to work":["Retour au travail","Volver al trabajo","Zurück an die Arbeit","Torna al lavoro","Voltar ao trabalho"],"Backspace":["Retour arrière","Retroceso","Rücktaste","Backspace","Retrocesso"],"Ballista":["Baliste","Balista","Balliste","Balista","Balista"],"Ballista [B]":["Baliste [B]","Balista [B]","Balliste [B]","Balista [B]","Balista [B]"],"Ballista and trebuchet":["Baliste et trébuchet","Balista y trebuchet","Balliste und Trebuchet","Balista e trabucco","Balista e trabuco"],"Banner on your castle, towers and gates":["Bannière sur votre château, vos tours et vos portes","Estandarte en tu castillo, torres y puertas","Banner auf Burg, Türmen und Toren","Stendardo su castello, torri e porte","Estandarte no castelo, torres e portões"],"Bannerman":["Porte-étendard","Abanderado","Bannerträger","Portabandiera","Porta-estandarte"],"Barracks":["Caserne","Cuartel","Kaserne","Caserma","Quartel"],"Barracks [C]":["Caserne [C]","Cuartel [C]","Kaserne [C]","Caserma [C]","Quartel [C]"],"Barracks rally [-]":["Ralliement caserne [-]","Reunión del cuartel [-]","Kasernen-Sammelpunkt [-]","Raduno caserma [-]","Reunião do quartel [-]"],"Barracks rally point":["Point de ralliement de la caserne","Punto de reunión del cuartel","Sammelpunkt der Kaserne","Punto di raduno della caserma","Ponto de reunião do quartel"],"Barracks: train soldiers here":["Caserne : entraînez des soldats ici","Cuartel: entrena soldados aquí","Kaserne: hier Soldaten ausbilden","Caserma: addestra soldati qui","Quartel: treine soldados aqui"],"Base":["Base","Base","Basis","Base","Base"],"Bastion walls":["Murs bastionnés","Muros de bastión","Bastionsmauern","Mura bastionate","Muralhas abaluartadas"],"Bedrock: it cannot be dug":["Roche-mère : impossible à creuser","Roca madre: no se puede excavar","Grundgestein: kann nicht gegraben werden","Roccia madre: non si può scavare","Rocha-mãe: não pode ser escavada"],"Behaviour":["Comportement","Comportamiento","Verhalten","Comportamento","Comportamento"],"Bend":["Barre","Banda","Schrägbalken","Banda","Banda"],"Best: wave ":["Meilleur : vague ","Récord: oleada ","Bestwert: Welle ","Record: ondata ","Recorde: onda "],"Better tools":["Meilleurs outils","Mejores herramientas","Bessere Werkzeuge","Attrezzi migliori","Melhores ferramentas"],"Block":["Bloc","Bloque","Block","Blocco","Bloco"],"Bordure":["Bordure","Bordura","Bord","Bordura","Bordadura"],"Bought 50 ":["Acheté 50 ","Comprado 50 ","50 gekauft: ","Comprato 50 ","Comprado 50 "],"Build":["Construire","Construir","Bauen","Costruisci","Construir"],"Build a Market to trade":["Construisez un Marché pour commercer","Construye un Mercado para comerciar","Baue einen Markt zum Handeln","Costruisci un Mercato per commerciare","Construa um Mercado para negociar"],"Build a barracks":["Construire une caserne","Construir un cuartel","Eine Kaserne bauen","Costruisci una caserma","Construir um quartel"],"Build a barracks first":["Construisez d'abord une caserne","Construye primero un cuartel","Baue zuerst eine Kaserne","Costruisci prima una caserma","Construa primeiro um quartel"],"Build a farm":["Construire une ferme","Construir una granja","Einen Hof bauen","Costruisci una fattoria","Construir uma quinta"],"Build a gate":["Construire une porte","Construir una puerta","Ein Tor bauen","Costruisci una porta","Construir um portão"],"Build a guild first":["Construisez d'abord une guilde","Construye primero un gremio","Baue zuerst eine Gilde","Costruisci prima una gilda","Construa primeiro uma guilda"],"Build a house":["Construire une maison","Construir una casa","Ein Haus bauen","Costruisci una casa","Construir uma casa"],"Build a storage":["Construire un entrepôt","Construir un almacén","Ein Lager bauen","Costruisci un magazzino","Construir um armazém"],"Build a tower":["Construire une tour","Construir una torre","Einen Turm bauen","Costruisci una torre","Construir uma torre"],"Build a wall":["Construire un mur","Construir un muro","Eine Mauer bauen","Costruisci un muro","Construir uma muralha"],"Build academy":["Construire l'académie","Construir academia","Akademie bauen","Costruisci accademia","Construir academia"],"Build an Academy to research":["Construisez une Académie pour rechercher","Construye una Academia para investigar","Baue eine Akademie zum Forschen","Costruisci un'Accademia per ricercare","Construa uma Academia para pesquisar"],"Build an academy":["Construire une académie","Construir una academia","Eine Akademie bauen","Costruisci un'accademia","Construir uma academia"],"Build barracks":["Construire la caserne","Construir cuartel","Kaserne bauen","Costruisci caserma","Construir quartel"],"Build builders guild":["Construire la guilde des bâtisseurs","Construir gremio de constructores","Baumeistergilde bauen","Costruisci gilda dei costruttori","Construir guilda de construtores"],"Build farm":["Construire une ferme","Construir granja","Hof bauen","Costruisci fattoria","Construir quinta"],"Build forester hut":["Construire une cabane de forestier","Construir cabaña de guardabosques","Försterhütte bauen","Costruisci capanna del guardaboschi","Construir cabana de guarda-florestal"],"Build gate":["Construire une porte","Construir puerta","Tor bauen","Costruisci porta","Construir portão"],"Build house":["Construire une maison","Construir casa","Haus bauen","Costruisci casa","Construir casa"],"Build market":["Construire un marché","Construir mercado","Markt bauen","Costruisci mercato","Construir mercado"],"Build path":["Construire un chemin","Construir camino","Weg bauen","Costruisci sentiero","Construir caminho"],"Build storage":["Construire un entrepôt","Construir almacén","Lager bauen","Costruisci magazzino","Construir armazém"],"Build torch":["Construire une torche","Construir antorcha","Fackel bauen","Costruisci torcia","Construir tocha"],"Build tower":["Construire une tour","Construir torre","Turm bauen","Costruisci torre","Construir torre"],"Build towers!":["Construisez des tours !","¡Construye torres!","Baue Türme!","Costruisci torri!","Construa torres!"],"Build wall":["Construire un mur","Construir muro","Mauer bauen","Costruisci muro","Construir muralha"],"Builders":["Bâtisseurs","Constructores","Baumeister","Costruttori","Construtores"],"Builders guild: choose how many peasants build, repair and reshape the land":["Guilde des bâtisseurs : choisissez combien de paysans construisent, réparent et façonnent le terrain","Gremio de constructores: elige cuántos campesinos construyen, reparan y moldean el terreno","Baumeistergilde: lege fest, wie viele Bauern bauen, reparieren und das Land formen","Gilda dei costruttori: scegli quanti contadini costruiscono, riparano e modellano il terreno","Guilda de construtores: escolha quantos camponeses constroem, reparam e moldam o terreno"],"Builders' guild []]":["Guilde des bâtisseurs []]","Gremio de constructores []]","Baumeistergilde []]","Gilda dei costruttori []]","Guilda de construtores []]"],"Building tier [L]":["Matériau [L]","Material [L]","Baustoff [L]","Materiale [L]","Material [L]"],"Buildings have 40% more strength":["Les bâtiments sont 40 % plus solides","Los edificios son un 40 % más resistentes","Gebäude sind 40 % stabiler","Gli edifici sono il 40% più resistenti","Os edifícios são 40% mais resistentes"],"Buy 50 ":["Acheter 50 ","Comprar 50 ","50 kaufen: ","Compra 50 ","Comprar 50 "],"Call to Arms":["Aux armes","A las armas","Zu den Waffen","Alle armi","Às armas"],"Call wave":["Appeler la vague","Llamar oleada","Welle rufen","Chiama l'ondata","Chamar onda"],"Camera down":["Caméra bas","Cámara abajo","Kamera runter","Telecamera giù","Câmara para baixo"],"Camera left":["Caméra gauche","Cámara izquierda","Kamera links","Telecamera sinistra","Câmara à esquerda"],"Camera right":["Caméra droite","Cámara derecha","Kamera rechts","Telecamera destra","Câmara à direita"],"Camera up":["Caméra haut","Cámara arriba","Kamera hoch","Telecamera su","Câmara para cima"],"Cancel current orders and stay here":["Annule les ordres en cours et reste ici","Cancela las órdenes actuales y quédate aquí","Aktuelle Befehle abbrechen und hier bleiben","Annulla gli ordini e resta qui","Cancela as ordens atuais e fica aqui"],"Cannon":["Canon","Cañón","Kanone","Cannone","Canhão"],"Cannon [/]":["Canon [/]","Cañón [/]","Kanone [/]","Cannone [/]","Canhão [/]"],"Cannot move the castle there (5x5 free, within 40 tiles, flat ground)":["Impossible de déplacer le château ici (5x5 libre, à moins de 40 cases, terrain plat)","No se puede mover el castillo allí (5x5 libre, a menos de 40 casillas, terreno llano)","Die Burg kann nicht dorthin (5x5 frei, höchstens 40 Felder, flacher Boden)","Non puoi spostare il castello lì (5x5 libero, entro 40 caselle, terreno piano)","Não pode mover o castelo para lá (5x5 livre, a menos de 40 casas, terreno plano)"],"Cannot reshape this tile":["Impossible de modifier cette case","No se puede modificar esta casilla","Dieses Feld kann nicht umgeformt werden","Impossibile modificare questa casella","Não é possível alterar esta casa"],"Captain":["Capitaine","Capitán","Hauptmann","Capitano","Capitão"],"Castle health":["Santé du château","Salud del castillo","Burgzustand","Salute del castello","Vida do castelo"],"Castle moved":["Château déplacé","Castillo movido","Burg verlegt","Castello spostato","Castelo movido"],"Castle placed - ready":["Château placé - prêt","Castillo colocado - listo","Burg platziert - bereit","Castello posizionato - pronto","Castelo colocado - pronto"],"Castle rally point":["Point de ralliement du château","Punto de reunión del castillo","Sammelpunkt der Burg","Punto di raduno del castello","Ponto de reunião do castelo"],"Castle rally point set":["Point de ralliement du château défini","Punto de reunión del castillo fijado","Sammelpunkt der Burg gesetzt","Punto di raduno del castello impostato","Ponto de reunião do castelo definido"],"Castle rally: new peasants gather this resource":["Ralliement du château : les nouveaux paysans récoltent cette ressource","Reunión del castillo: los nuevos campesinos recogen este recurso","Burg-Sammelpunkt: neue Bauern sammeln diesen Rohstoff","Raduno del castello: i nuovi contadini raccolgono questa risorsa","Reunião do castelo: novos camponeses recolhem este recurso"],"Castle view":["Vue du château","Vista del castillo","Burgansicht","Vista castello","Vista do castelo"],"Castle: shoots arrows at zombies in range, trains peasants and builds":["Château : tire des flèches sur les zombies à portée, forme des paysans et construit","Castillo: dispara flechas a los zombis cercanos, entrena campesinos y construye","Burg: schießt Pfeile auf Zombies in Reichweite, bildet Bauern aus und baut","Castello: scaglia frecce sugli zombi a portata, addestra contadini e costruisce","Castelo: dispara flechas aos zumbis ao alcance, treina camponeses e constrói"],"Centers the camera on your castle":["Centre la caméra sur votre château","Centra la cámara en tu castillo","Zentriert die Kamera auf deine Burg","Centra la telecamera sul castello","Centra a câmara no seu castelo"],"Chain mail":["Cotte de mailles","Cota de malla","Kettenhemd","Cotta di maglia","Cota de malha"],"Champion":["Champion","Campeón","Champion","Campione","Campeão"],"Change my castle site":["Changer l'emplacement de mon château","Cambiar el sitio de mi castillo","Burgstandort ändern","Cambia il sito del mio castello","Mudar o local do meu castelo"],"Chase and attack every enemy in sight":["Poursuit et attaque tout ennemi en vue","Persigue y ataca a todo enemigo a la vista","Jagt und greift jeden sichtbaren Feind an","Insegue e attacca ogni nemico in vista","Persegue e ataca todo inimigo à vista"],"Cheap and links to its neighbours":["Bon marché, se relie à ses voisins","Barato y se une a sus vecinos","Günstig und verbindet sich mit Nachbarn","Economico, si collega ai vicini","Barato e liga-se aos vizinhos"],"Cheap and quick to build":["Bon marché et rapide à construire","Barato y rápido de construir","Günstig und schnell gebaut","Economico e veloce da costruire","Barato e rápido de construir"],"Cheap light: at night whatever stands":["Lumière bon marché : la nuit, tout ce qui se trouve","Luz barata: de noche, todo lo que esté","Günstiges Licht: nachts alles, was steht","Luce economica: di notte tutto ciò che si trova","Luz barata: à noite, tudo o que estiver"],"Chevron":["Chevron","Cabrio","Sparren","Scaglione","Asna"],"Choose my castle site":["Choisir l'emplacement de mon château","Elegir el sitio de mi castillo","Burgstandort wählen","Scegli il sito del mio castello","Escolher o local do meu castelo"],"Choose site":["Choisir l'emplacement","Elegir sitio","Standort wählen","Scegli il sito","Escolher local"],"Choose where YOUR castle will stand":["Choisissez où se dressera VOTRE château","Elige dónde estará TU castillo","Wähle, wo DEINE Burg stehen soll","Scegli dove sorgerà il TUO castello","Escolha onde ficará o SEU castelo"],"Choose where to found your kingdom":["Choisissez où fonder votre royaume","Elige dónde fundar tu reino","Wähle, wo du dein Königreich gründest","Scegli dove fondare il tuo regno","Escolha onde fundar o seu reino"],"Choose wood or stone for what you build":["Choisissez le bois ou la pierre pour vos constructions","Elige madera o piedra para lo que construyas","Wähle Holz oder Stein für deine Bauten","Scegli legno o pietra per ciò che costruisci","Escolha madeira ou pedra para o que constrói"],"Choosing a castle site...":["Choix de l'emplacement du château...","Eligiendo el sitio del castillo...","Burgstandort wird gewählt...","Scelta del sito del castello...","A escolher o local do castelo..."],"Click a building: peasants tear it down":["Cliquez un bâtiment : les paysans le démolissent","Haz clic en un edificio: los campesinos lo derriban","Klicke ein Gebäude: Bauern reißen es ab","Clicca un edificio: i contadini lo abbattono","Clique num edifício: os camponeses demolem-no"],"Click a finished tower to mount it":["Cliquez une tour terminée pour l'y installer","Haz clic en una torre terminada para montarla","Klicke einen fertigen Turm, um sie aufzusetzen","Clicca una torre finita per montarla","Clique numa torre acabada para a montar"],"Click a key, then press the new one  (Esc cancels)":["Cliquez une touche, puis appuyez sur la nouvelle  (Échap annule)","Haz clic en una tecla y pulsa la nueva  (Esc cancela)","Klicke eine Taste, dann drücke die neue  (Esc bricht ab)","Clicca un tasto, poi premi quello nuovo  (Esc annulla)","Clique numa tecla e prima a nova  (Esc cancela)"],"Click a marked tile again to cancel":["Cliquez à nouveau une case marquée pour annuler","Haz clic otra vez en una casilla marcada para cancelar","Klicke ein markiertes Feld erneut zum Abbrechen","Clicca di nuovo una casella segnata per annullare","Clique de novo numa casa marcada para cancelar"],"Click anywhere or press Space to resume":["Cliquez n'importe où ou appuyez sur Espace pour reprendre","Haz clic en cualquier sitio o pulsa Espacio para continuar","Klicke irgendwo oder drücke Leertaste zum Fortsetzen","Clicca ovunque o premi Spazio per riprendere","Clique em qualquer lado ou prima Espaço para continuar"],"Click one of your buildings (not the castle)":["Cliquez un de vos bâtiments (pas le château)","Haz clic en uno de tus edificios (no el castillo)","Klicke eines deiner Gebäude (nicht die Burg)","Clicca uno dei tuoi edifici (non il castello)","Clique num dos seus edifícios (não o castelo)"],"Click or drag over wooden buildings":["Cliquez ou glissez sur les bâtiments en bois","Haz clic o arrastra sobre edificios de madera","Klicke oder ziehe über Holzgebäude","Clicca o trascina sugli edifici in legno","Clique ou arraste sobre edifícios de madeira"],"Click or drag to paint":["Cliquez ou glissez pour peindre","Haz clic o arrastra para pintar","Klicken oder ziehen zum Malen","Clicca o trascina per dipingere","Clique ou arraste para pintar"],"Click the map: new soldiers from":["Cliquez la carte : les nouveaux soldats de","Haz clic en el mapa: los nuevos soldados de","Klicke auf die Karte: neue Soldaten aus","Clicca la mappa: i nuovi soldati da","Clique no mapa: novos soldados de"],"Click to place the castle  -  drag / WASD: move   Right drag: rotate   Wheel: zoom":["Cliquez pour placer le château  -  glisser / ZQSD : déplacer   Glisser droit : tourner   Molette : zoom","Haz clic para colocar el castillo  -  arrastrar / WASD: mover   Arrastre derecho: girar   Rueda: zoom","Klicke, um die Burg zu setzen  -  Ziehen / WASD: bewegen   Rechts ziehen: drehen   Mausrad: Zoom","Clicca per piazzare il castello  -  trascina / WASD: muovi   Trascina destro: ruota   Rotella: zoom","Clique para colocar o castelo  -  arrastar / WASD: mover   Arrastar direito: rodar   Roda: zoom"],"Close [M]":["Fermer [M]","Cerrar [M]","Schließen [M]","Chiudi [M]","Fechar [M]"],"Co-op lobby - ":["Salon coop - ","Sala cooperativa - ","Koop-Raum - ","Stanza coop - ","Sala cooperativa - "],"Co-op: OUT OF SYNC":["Coop : DÉSYNCHRONISÉ","Cooperativo: DESINCRONIZADO","Koop: NICHT SYNCHRON","Coop: FUORI SINCRONIA","Cooperativo: DESSINCRONIZADO"],"Co-op: waiting for your partner...":["Coop : en attente de votre partenaire...","Cooperativo: esperando a tu compañero...","Koop: warte auf deinen Partner...","Coop: in attesa del compagno...","Cooperativo: à espera do parceiro..."],"Colour":["Couleur","Color","Farbe","Colore","Cor"],"Command":["Commandement","Mando","Befehl","Comando","Comando"],"Connection error (":["Erreur de connexion (","Error de conexión (","Verbindungsfehler (","Errore di connessione (","Erro de ligação ("],"Construction cancelled: resources refunded":["Construction annulée : ressources remboursées","Construcción cancelada: recursos devueltos","Bau abgebrochen: Rohstoffe erstattet","Costruzione annullata: risorse rimborsate","Construção cancelada: recursos devolvidos"],"Controls":["Commandes","Controles","Steuerung","Comandi","Controlos"],"Costs ":["Coût ","Cuesta ","Kosten ","Costo ","Custa "],"Costs 100 gold, 150 wood":["Coûte 100 or, 150 bois","Cuesta 100 oro, 150 madera","Kostet 100 Gold, 150 Holz","Costa 100 oro, 150 legno","Custa 100 ouro, 150 madeira"],"Costs part of its wood / stone / gold":["Coûte une part de son bois / sa pierre / son or","Cuesta parte de su madera / piedra / oro","Kostet einen Teil seines Holzes / Steins / Goldes","Costa parte del suo legno / pietra / oro","Custa parte da sua madeira / pedra / ouro"],"Could not reach the matchmaking service. Check your connection and try again.":["Impossible de joindre le service de mise en relation. Vérifiez votre connexion et réessayez.","No se pudo contactar con el servicio de emparejamiento. Comprueba tu conexión e inténtalo de nuevo.","Der Vermittlungsdienst ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.","Impossibile raggiungere il servizio di abbinamento. Controlla la connessione e riprova.","Não foi possível contactar o serviço de emparelhamento. Verifique a ligação e tente de novo."],"Creating your room...":["Création de votre salon...","Creando tu sala...","Dein Raum wird erstellt...","Creazione della stanza...","A criar a sua sala..."],"Crest":["Cimier","Cimera","Kamm","Cresta","Crista"],"Crews":["Équipes","Dotaciones","Mannschaften","Squadre","Equipas"],"Crimson":["Cramoisi","Carmesí","Karmesin","Cremisi","Carmesim"],"Crop rotation":["Rotation des cultures","Rotación de cultivos","Fruchtwechsel","Rotazione delle colture","Rotação de culturas"],"Cycles None / Line / Block / Wedge / Ring":["Alterne Aucune / Ligne / Bloc / Coin / Cercle","Alterna Ninguna / Línea / Bloque / Cuña / Anillo","Wechselt Keine / Linie / Block / Keil / Ring","Alterna Nessuna / Linea / Blocco / Cuneo / Anello","Alterna Nenhuma / Linha / Bloco / Cunha / Anel"],"Daily map":["Carte du jour","Mapa diario","Tageskarte","Mappa del giorno","Mapa diário"],"Dawn - ":["Aube - ","Amanecer - ","Morgengrauen - ","Alba - ","Amanhecer - "],"Dawn is coming - next wave in ":["L'aube approche - prochaine vague dans ","Se acerca el amanecer - próxima oleada en ","Der Morgen naht - nächste Welle in ","Sta per albeggiare - prossima ondata tra ","O amanhecer aproxima-se - próxima onda em "],"Defend":["Défendre","Defender","Verteidigen","Difendi","Defender"],"Defense":["Défense","Defensa","Verteidigung","Difesa","Defesa"],"Defensive [2]":["Défensif [2]","Defensivo [2]","Defensiv [2]","Difensivo [2]","Defensivo [2]"],"Defensive: guard this spot":["Défensif : garde cette position","Defensivo: vigila este punto","Defensiv: bewacht diesen Ort","Difensivo: sorveglia questo punto","Defensivo: guarda este ponto"],"Delete":["Supprimer","Borrar","Löschen","Elimina","Apagar"],"Demolish":["Démolir","Demoler","Abreißen","Demolisci","Demolir"],"Demolish [P]":["Démolir [P]","Demoler [P]","Abreißen [P]","Demolisci [P]","Demolir [P]"],"Demolish building":["Démolir un bâtiment","Demoler edificio","Gebäude abreißen","Demolisci edificio","Demolir edifício"],"Demolished: resources recovered":["Démoli : ressources récupérées","Demolido: recursos recuperados","Abgerissen: Rohstoffe zurückgewonnen","Demolito: risorse recuperate","Demolido: recursos recuperados"],"Dig":["Creuser","Excavar","Graben","Scava","Escavar"],"Dig a ramp":["Creuser une rampe","Excavar una rampa","Eine Rampe graben","Scava una rampa","Escavar uma rampa"],"Dig ground":["Creuser le sol","Excavar terreno","Boden graben","Scava terreno","Escavar terreno"],"Dig ground [U]":["Creuser le sol [U]","Excavar terreno [U]","Boden graben [U]","Scava terreno [U]","Escavar terreno [U]"],"Do not let it fall":["Ne le laissez pas tomber","No dejes que caiga","Lass sie nicht fallen","Non lasciarlo cadere","Não o deixe cair"],"Done":["Fait","Hecho","Fertig","Fatto","Feito"],"Drill":["Exercice","Instrucción","Drill","Addestramento","Treino"],"Drill training":["Entraînement militaire","Instrucción militar","Drillausbildung","Addestramento militare","Treino militar"],"Each purchase raises the price for a while":["Chaque achat fait monter le prix un moment","Cada compra sube el precio durante un rato","Jeder Kauf erhöht den Preis eine Weile","Ogni acquisto alza il prezzo per un po'","Cada compra sobe o preço durante algum tempo"],"Each sale lowers the price for a while":["Chaque vente fait baisser le prix un moment","Cada venta baja el precio durante un rato","Jeder Verkauf senkt den Preis eine Weile","Ogni vendita abbassa il prezzo per un po'","Cada venda baixa o preço durante algum tempo"],"Economy":["Économie","Economía","Wirtschaft","Economia","Economia"],"Elite":["Élite","Élite","Elite","Élite","Elite"],"Ember":["Braise","Brasa","Glut","Brace","Brasa"],"Emblem":["Emblème","Emblema","Wappenbild","Emblema","Emblema"],"Emerald":["Émeraude","Esmeralda","Smaragd","Smeraldo","Esmeralda"],"Enchanter":["Enchanteur","Encantador","Verzauberer","Incantatore","Encantador"],"Enter":["Entrée","Intro","Eingabe","Invio","Enter"],"Esc":["Échap","Esc","Esc","Esc","Esc"],"Escape":["Échap","Escape","Escape","Esc","Escape"],"Every unit costs food to train":["Chaque unité coûte de la nourriture à former","Cada unidad cuesta comida para entrenarla","Jede Einheit kostet Nahrung in der Ausbildung","Ogni unità costa cibo per addestrarla","Cada unidade custa comida para treinar"],"Farm":["Ferme","Granja","Hof","Fattoria","Quinta"],"Farm [J]":["Ferme [J]","Granja [J]","Hof [J]","Fattoria [J]","Quinta [J]"],"Farms make it while a peasant works them":["Les fermes en produisent quand un paysan y travaille","Las granjas la producen mientras un campesino las trabaja","Höfe erzeugen sie, solange ein Bauer dort arbeitet","Le fattorie lo producono mentre un contadino ci lavora","As quintas produzem-na enquanto um camponês as trabalha"],"Farms yield 50% more food":["Les fermes produisent 50 % de nourriture en plus","Las granjas dan un 50 % más de comida","Höfe liefern 50 % mehr Nahrung","Le fattorie rendono il 50% di cibo in più","As quintas rendem 50% mais comida"],"Farms, forester hut, storage, market":["Fermes, cabane de forestier, entrepôt, marché","Granjas, cabaña de guardabosques, almacén, mercado","Höfe, Försterhütte, Lager, Markt","Fattorie, capanna del guardaboschi, magazzino, mercato","Quintas, cabana de guarda-florestal, armazém, mercado"],"Fast":["Rapide","Rápido","Schnell","Veloce","Rápido"],"Faster travel":["Déplacements plus rapides","Viajes más rápidos","Schnelleres Reisen","Spostamenti più rapidi","Deslocações mais rápidas"],"Fess":["Fasce","Faja","Balken","Fascia","Faixa"],"Field gun pushed by a crew of 2 (2 population)":["Canon de campagne poussé par 2 servants (2 de population)","Cañón de campaña empujado por 2 servidores (2 de población)","Feldgeschütz, von 2 Mann geschoben (2 Bevölkerung)","Cannone da campo spinto da 2 serventi (2 di popolazione)","Canhão de campanha empurrado por 2 servidores (2 de população)"],"Fight around their post, then walk back to it":["Combattent autour de leur poste, puis y retournent","Luchan alrededor de su puesto y luego vuelven a él","Kämpfen um ihren Posten und kehren dann zurück","Combattono attorno alla postazione, poi ci tornano","Lutam à volta do seu posto e depois regressam"],"Finish a research":["Terminer une recherche","Terminar una investigación","Eine Forschung abschließen","Completa una ricerca","Terminar uma pesquisa"],"Finish this wave first: the next one comes after the rest time":["Terminez d'abord cette vague : la suivante vient après le temps de repos","Termina primero esta oleada: la siguiente llega tras el descanso","Beende erst diese Welle: die nächste kommt nach der Pause","Finisci prima questa ondata: la prossima arriva dopo la pausa","Termine primeiro esta onda: a próxima vem após o descanso"],"Fletching":["Empennage","Emplumado","Befiederung","Impennatura","Emplumação"],"Food":["Nourriture","Comida","Nahrung","Cibo","Comida"],"Ford":["Gué","Vado","Furt","Guado","Vau"],"Forest":["Forêt","Bosque","Wald","Foresta","Floresta"],"Forester":["Forestier","Guardabosques","Förster","Guardaboschi","Guarda-florestal"],"Forester's hut [[]":["Cabane du forestier [[]","Cabaña del guardabosques [[]","Försterhütte [[]","Capanna del guardaboschi [[]","Cabana do guarda-florestal [[]"],"Formation":["Formation","Formación","Formation","Formazione","Formação"],"Formation [V]":["Formation [V]","Formación [V]","Formation [V]","Formazione [V]","Formação [V]"],"Formation: ":["Formation : ","Formación: ","Formation: ","Formazione: ","Formação: "],"Found kingdom":["Fonder le royaume","Fundar el reino","Königreich gründen","Fonda il regno","Fundar o reino"],"Four towers merged into a keep":["Quatre tours fusionnées en donjon","Cuatro torres fusionadas en un torreón","Vier Türme zu einem Bergfried vereint","Quattro torri fuse in un mastio","Quatro torres fundidas numa torre de menagem"],"Free":["Gratuit","Gratis","Kostenlos","Gratis","Grátis"],"Game Menu":["Menu du jeu","Menú del juego","Spielmenü","Menu di gioco","Menu do jogo"],"Game Paused":["Jeu en pause","Juego en pausa","Spiel pausiert","Gioco in pausa","Jogo em pausa"],"Game loaded - wave ":["Partie chargée - vague ","Partida cargada - oleada ","Spiel geladen - Welle ","Partita caricata - ondata ","Jogo carregado - onda "],"Game saved":["Partie sauvegardée","Partida guardada","Spiel gespeichert","Partita salvata","Jogo guardado"],"Game speed":["Vitesse du jeu","Velocidad del juego","Spieltempo","Velocità di gioco","Velocidade do jogo"],"Game speed [F]":["Vitesse du jeu [F]","Velocidad del juego [F]","Spieltempo [F]","Velocità di gioco [F]","Velocidade do jogo [F]"],"Gate":["Porte","Puerta","Tor","Porta","Portão"],"Gather":["Récolter","Recolectar","Sammeln","Raccogli","Recolher"],"General":["Général","General","Allgemein","Generale","Geral"],"Getting an Upgrade":["Une amélioration","Una mejora","Eine Verbesserung","Un potenziamento","Uma melhoria"],"Gold":["Or","Oro","Gold","Oro","Ouro"],"Gold! Wood! Stone!":["De l'or ! Du bois ! De la pierre !","¡Oro! ¡Madera! ¡Piedra!","Gold! Holz! Stein!","Oro! Legno! Pietra!","Ouro! Madeira! Pedra!"],"Good site - click to place your castle here":["Bon emplacement - cliquez pour placer votre château ici","Buen sitio - haz clic para colocar tu castillo aquí","Guter Platz - klicke, um deine Burg hierher zu setzen","Buon sito - clicca per piazzare qui il castello","Bom local - clique para colocar aqui o seu castelo"],"Graphics":["Graphismes","Gráficos","Grafik","Grafica","Gráficos"],"Group":["Groupe","Grupo","Gruppe","Gruppo","Grupo"],"Group ":["Groupe ","Grupo ","Gruppe ","Gruppo ","Grupo "],"Guild":["Guilde","Gremio","Gilde","Gilda","Guilda"],"Halt":["Halte","Alto","Halt","Alt","Alto"],"Halt [3]":["Halte [3]","Alto [3]","Halt [3]","Alt [3]","Alto [3]"],"Halt: hold position":["Halte : tenir la position","Alto: mantener la posición","Halt: Stellung halten","Alt: tieni la posizione","Alto: manter a posição"],"He goes back to gathering":["Il retourne à la récolte","Vuelve a recolectar","Er geht wieder sammeln","Torna a raccogliere","Volta a recolher"],"Heals nearby allies in a wide area":["Soigne les alliés proches sur une large zone","Cura a los aliados cercanos en una zona amplia","Heilt nahe Verbündete in weitem Umkreis","Cura gli alleati vicini in un'ampia area","Cura aliados próximos numa área ampla"],"His royal guard fights on":["Sa garde royale se bat toujours","Su guardia real sigue luchando","Seine Leibgarde kämpft weiter","La sua guardia reale combatte ancora","A sua guarda real continua a lutar"],"Hold position: never move, only strike":["Tenir la position : ne bouge jamais, frappe seulement","Mantener posición: nunca se mueve, solo golpea","Stellung halten: nie bewegen, nur zuschlagen","Tieni la posizione: non si muove mai, colpisce soltanto","Manter posição: nunca se move, só ataca"],"Hold the line!":["Tenez la ligne !","¡Mantened la línea!","Haltet die Linie!","Tenete la linea!","Mantenham a linha!"],"Hollow":["Creux","Hondonada","Senke","Conca","Vale"],"Home Sweet Home":["On est bien chez soi","Hogar, dulce hogar","Trautes Heim","Casa dolce casa","Lar, doce lar"],"Horde":["Horde","Horda","Horde","Orda","Horda"],"Horde ":["Horde ","Horda ","Horde ","Orda ","Horda "],"Horde from ":["Horde venant de ","Horda desde ","Horde aus ","Orda da ","Horda de "],"Host":["Hôte","Anfitrión","Host","Host","Anfitrião"],"House":["Maison","Casa","Haus","Casa","Casa"],"House [0]":["Maison [0]","Casa [0]","Haus [0]","Casa [0]","Casa [0]"],"Houses raise the limit (+6 each)":["Les maisons augmentent la limite (+6 chacune)","Las casas aumentan el límite (+6 cada una)","Häuser erhöhen das Limit (je +6)","Le case alzano il limite (+6 ciascuna)","As casas aumentam o limite (+6 cada)"],"Houses, barracks, builders guild, academy":["Maisons, caserne, guilde des bâtisseurs, académie","Casas, cuartel, gremio de constructores, academia","Häuser, Kaserne, Baumeistergilde, Akademie","Case, caserma, gilda dei costruttori, accademia","Casas, quartel, guilda de construtores, academia"],"Huge range, boulders crush a crowd":["Portée énorme, ses rochers écrasent une foule","Alcance enorme, sus rocas aplastan una multitud","Riesige Reichweite, Felsbrocken zermalmen Massen","Gittata enorme, i macigni schiacciano una folla","Alcance enorme, as pedras esmagam uma multidão"],"Idle":["Inactif","Inactivo","Untätig","Inattivo","Inativo"],"Idle peasants":["Paysans inactifs","Campesinos inactivos","Untätige Bauern","Contadini inattivi","Camponeses inativos"],"Idle peasants [.]":["Paysans inactifs [.]","Campesinos inactivos [.]","Untätige Bauern [.]","Contadini inattivi [.]","Camponeses inativos [.]"],"In progress: ":["En cours : ","En curso: ","Läuft: ","In corso: ","Em curso: "],"Interface size":["Taille de l'interface","Tamaño de la interfaz","Oberflächengröße","Dimensione interfaccia","Tamanho da interface"],"Iron weapons":["Armes en fer","Armas de hierro","Eisenwaffen","Armi di ferro","Armas de ferro"],"Its cannonballs blast whole groups of zombies":["Ses boulets dispersent des groupes entiers de zombies","Sus balas revientan grupos enteros de zombis","Seine Kugeln sprengen ganze Zombiegruppen","Le sue palle spazzano interi gruppi di zombi","As suas balas rebentam grupos inteiros de zumbis"],"Ivory":["Ivoire","Marfil","Elfenbein","Avorio","Marfim"],"Joining room ":["Connexion au salon ","Entrando en la sala ","Betrete Raum ","Ingresso nella stanza ","A entrar na sala "],"KING NARAIGE HAS FALLEN":["LE ROI NARAIGE EST TOMBÉ","EL REY NARAIGE HA CAÍDO","KÖNIG NARAIGE IST GEFALLEN","RE NARAIGE È CADUTO","O REI NARAIGE CAIU"],"Keep":["Donjon","Torreón","Bergfried","Mastio","Torre de menagem"],"Keep Calm":["Pas de panique","Mantén la calma","Ruhig Blut","Mantieni la calma","Mantenha a calma"],"Keep him behind the line":["Gardez-le derrière la ligne","Mantenlo detrás de la línea","Halte ihn hinter der Linie","Tienilo dietro la linea","Mantenha-o atrás da linha"],"King Naraige":["Roi Naraige","Rey Naraige","König Naraige","Re Naraige","Rei Naraige"],"King Naraige already has his 2 royal guards":["Le roi Naraige a déjà ses 2 gardes royaux","El rey Naraige ya tiene sus 2 guardias reales","König Naraige hat schon seine 2 Leibwächter","Re Naraige ha già le sue 2 guardie reali","O rei Naraige já tem os seus 2 guardas reais"],"King Naraige rides out with his royal guard":["Le roi Naraige part avec sa garde royale","El rey Naraige sale con su guardia real","König Naraige reitet mit seiner Leibgarde aus","Re Naraige parte con la sua guardia reale","O rei Naraige parte com a sua guarda real"],"Kingdom name":["Nom du royaume","Nombre del reino","Name des Königreichs","Nome del regno","Nome do reino"],"Knight":["Chevalier","Caballero","Ritter","Cavaliere","Cavaleiro"],"LONG LIVE KING NARAIGE":["LONGUE VIE AU ROI NARAIGE","LARGA VIDA AL REY NARAIGE","LANG LEBE KÖNIG NARAIGE","LUNGA VITA A RE NARAIGE","LONGA VIDA AO REI NARAIGE"],"Land":["Terrain","Terreno","Land","Terreno","Terreno"],"Large":["Grande","Grande","Groß","Grande","Grande"],"Left drag: move   Right drag: rotate   Wheel: zoom":["Glisser gauche : déplacer   Glisser droit : tourner   Molette : zoom","Arrastre izquierdo: mover   Arrastre derecho: girar   Rueda: zoom","Links ziehen: bewegen   Rechts ziehen: drehen   Mausrad: Zoom","Trascina sinistro: muovi   Trascina destro: ruota   Rotella: zoom","Arrastar esquerdo: mover   Arrastar direito: rodar   Roda: zoom"],"Lights the night. Archers garrison (3)":["Éclaire la nuit. Garnison d'archers (3)","Ilumina la noche. Guarnición de arqueros (3)","Erhellt die Nacht. Bogenschützen-Besatzung (3)","Illumina la notte. Guarnigione di arcieri (3)","Ilumina a noite. Guarnição de arqueiros (3)"],"Line":["Ligne","Línea","Linie","Linea","Linha"],"Load":["Charger","Cargar","Laden","Carica","Carregar"],"Load failed: ":["Échec du chargement : ","Error al cargar: ","Laden fehlgeschlagen: ","Caricamento fallito: ","Falha ao carregar: "],"Load game":["Charger une partie","Cargar partida","Spiel laden","Carica partita","Carregar jogo"],"Loading...":["Chargement...","Cargando...","Lädt...","Caricamento...","A carregar..."],"Locked":["Verrouillé","Bloqueado","Gesperrt","Bloccato","Bloqueado"],"Locked: research Masonry at the Academy":["Verrouillé : recherchez la Maçonnerie à l'Académie","Bloqueado: investiga Cantería en la Academia","Gesperrt: erforsche Steinmetzkunst in der Akademie","Bloccato: ricerca la Muratura all'Accademia","Bloqueado: pesquise Cantaria na Academia"],"Long calm between waves, then a slow swarm. It grows stronger each wave.":["Longue accalmie entre les vagues, puis un essaim lent. Il se renforce à chaque vague.","Larga calma entre oleadas, luego un enjambre lento. Se hace más fuerte en cada oleada.","Lange Ruhe zwischen den Wellen, dann ein langsamer Schwarm. Er wird mit jeder Welle stärker.","Lunga calma tra le ondate, poi uno sciame lento. Si rafforza a ogni ondata.","Longa calma entre ondas, depois um enxame lento. Fica mais forte a cada onda."],"Long range: volleys of 5 arrows":["Longue portée : volées de 5 flèches","Largo alcance: andanadas de 5 flechas","Große Reichweite: Salven aus 5 Pfeilen","Lunga gittata: raffiche di 5 frecce","Longo alcance: rajadas de 5 flechas"],"Long reach, sweeps several zombies at once":["Grande allonge, balaie plusieurs zombies à la fois","Gran alcance, barre varios zombis a la vez","Große Reichweite, fegt mehrere Zombies zugleich","Lungo raggio, spazza più zombi insieme","Grande alcance, varre vários zumbis de uma vez"],"MINERS":["MINEURS","MINEROS","GRÄBER","MINATORI","MINEIROS"],"Main menu [Esc]":["Menu principal [Échap]","Menú principal [Esc]","Hauptmenü [Esc]","Menu principale [Esc]","Menu principal [Esc]"],"Map":["Carte","Mapa","Karte","Mappa","Mapa"],"Map #":["Carte n°","Mapa n.º ","Karte Nr. ","Mappa n. ","Mapa n.º "],"March":["Marche","Marca","Mark","Marca","Marca"],"Market":["Marché","Mercado","Markt","Mercato","Mercado"],"Market [:]":["Marché [:]","Mercado [:]","Markt [:]","Mercato [:]","Mercado [:]"],"Market: sell wood, stone or food for gold, or buy them":["Marché : vendez bois, pierre ou nourriture contre de l'or, ou achetez-les","Mercado: vende madera, piedra o comida por oro, o cómpralos","Markt: verkaufe Holz, Stein oder Nahrung für Gold oder kaufe sie","Mercato: vendi legno, pietra o cibo per oro, o comprali","Mercado: venda madeira, pedra ou comida por ouro, ou compre-os"],"Masonry":["Maçonnerie","Cantería","Steinmetzkunst","Muratura","Cantaria"],"Masonry research":["Recherche de la maçonnerie","Investigación de cantería","Steinmetz-Forschung","Ricerca della muratura","Pesquisa de cantaria"],"Matchmaking error (":["Erreur de mise en relation (","Error de emparejamiento (","Vermittlungsfehler (","Errore di abbinamento (","Erro de emparelhamento ("],"Merge four towers into a keep":["Fusionner quatre tours en donjon","Fusionar cuatro torres en un torreón","Vier Türme zu einem Bergfried vereinen","Fondi quattro torri in un mastio","Fundir quatro torres numa torre de menagem"],"Message to your partner (Enter to send)":["Message à votre partenaire (Entrée pour envoyer)","Mensaje a tu compañero (Intro para enviar)","Nachricht an deinen Partner (Eingabe zum Senden)","Messaggio al compagno (Invio per inviare)","Mensagem ao parceiro (Enter para enviar)"],"Mind the swarm!":["Attention à l'essaim !","¡Cuidado con el enjambre!","Achtung, Schwarm!","Attenti allo sciame!","Cuidado com o enxame!"],"Mode":["Mode","Modo","Modus","Modalità","Modo"],"Monster Hunter":["Chasseur de monstres","Cazador de monstruos","Monsterjäger","Cacciatore di mostri","Caçador de monstros"],"Monsters Hunted":["Monstres chassés","Monstruos cazados","Monster gejagt","Mostri cacciati","Monstros caçados"],"Moor":["Lande","Páramo","Moor","Brughiera","Charneca"],"Mount it on a finished tower":["Installez-la sur une tour terminée","Móntala en una torre terminada","Setze sie auf einen fertigen Turm","Montala su una torre finita","Monte-a numa torre acabada"],"Mouse mode":["Mode souris","Modo del ratón","Mausmodus","Modalità mouse","Modo do rato"],"Move castle":["Déplacer le château","Mover castillo","Burg verlegen","Sposta castello","Mover castelo"],"Move castle [,]":["Déplacer le château [,]","Mover castillo [,]","Burg verlegen [,]","Sposta castello [,]","Mover castelo [,]"],"Move your castle":["Déplacez votre château","Mueve tu castillo","Verlege deine Burg","Sposta il tuo castello","Mova o seu castelo"],"Moving Day":["Jour de déménagement","Día de mudanza","Umzugstag","Giorno di trasloco","Dia de mudança"],"Much tougher: holds the horde far longer":["Bien plus solide : retient la horde bien plus longtemps","Mucho más resistente: frena a la horda mucho más tiempo","Viel robuster: hält die Horde weit länger auf","Molto più robusto: trattiene l'orda molto più a lungo","Muito mais resistente: segura a horda muito mais tempo"],"Multiplayer (Co-op)":["Multijoueur (coop)","Multijugador (cooperativo)","Mehrspieler (Koop)","Multigiocatore (coop)","Multijogador (cooperativo)"],"Music":["Musique","Música","Musik","Musica","Música"],"Mute sound":["Couper le son","Silenciar","Ton aus","Disattiva audio","Silenciar"],"NEW ZOMBIES: ":["NOUVEAUX ZOMBIES : ","NUEVOS ZOMBIS: ","NEUE ZOMBIES: ","NUOVI ZOMBI: ","NOVOS ZUMBIS: "],"Nameless":["Sans nom","Sin nombre","Namenlos","Senza nome","Sem nome"],"Needs Iron weapons":["Nécessite Armes en fer","Requiere Armas de hierro","Benötigt Eisenwaffen","Richiede Armi di ferro","Requer Armas de ferro"],"Needs Plate armor":["Nécessite Armure de plates","Requiere Armadura de placas","Benötigt Plattenrüstung","Richiede Armatura a piastre","Requer Armadura de placas"],"Needs Stonemasonry":["Nécessite la Maçonnerie","Requiere Cantería","Benötigt Steinmetzkunst","Richiede la Muratura","Requer Cantaria"],"Needs your own Academy":["Nécessite votre propre Académie","Requiere tu propia Academia","Benötigt deine eigene Akademie","Richiede la tua Accademia","Requer a sua própria Academia"],"New buildings are stone afterwards":["Les nouveaux bâtiments seront ensuite en pierre","Los nuevos edificios serán después de piedra","Neue Gebäude sind danach aus Stein","I nuovi edifici saranno poi in pietra","Os novos edifícios passam a ser de pedra"],"New buildings: ":["Nouveaux bâtiments : ","Edificios nuevos: ","Neue Gebäude: ","Nuovi edifici: ","Novos edifícios: "],"New game":["Nouvelle partie","Nueva partida","Neues Spiel","Nuova partita","Novo jogo"],"New kingdom":["Nouveau royaume","Nuevo reino","Neues Königreich","Nuovo regno","Novo reino"],"New map":["Nouvelle carte","Nuevo mapa","Neue Karte","Nuova mappa","Novo mapa"],"Next ":["Suivant ","Siguiente ","Nächste ","Prossimo ","Seguinte "],"Next wave":["Prochaine vague","Próxima oleada","Nächste Welle","Prossima ondata","Próxima onda"],"Next zombie route":["Prochaine route des zombies","Próxima ruta zombi","Nächste Zombieroute","Prossimo percorso zombi","Próxima rota dos zumbis"],"Night":["Nuit","Noche","Nacht","Notte","Noite"],"Night Watch":["Garde de nuit","Guardia nocturna","Nachtwache","Guardia notturna","Vigia noturna"],"No idle peasants":["Aucun paysan inactif","No hay campesinos inactivos","Keine untätigen Bauern","Nessun contadino inattivo","Nenhum camponês inativo"],"No peasants available":["Aucun paysan disponible","No hay campesinos disponibles","Keine Bauern verfügbar","Nessun contadino disponibile","Nenhum camponês disponível"],"No ramp here: free flat ground only":["Pas de rampe ici : terrain plat et libre uniquement","Aquí no hay rampa: solo terreno llano y libre","Keine Rampe hier: nur freier, flacher Boden","Niente rampa qui: solo terreno piano e libero","Sem rampa aqui: só terreno plano e livre"],"No recent attack":["Aucune attaque récente","Ningún ataque reciente","Kein Angriff in letzter Zeit","Nessun attacco recente","Nenhum ataque recente"],"No saved games yet":["Aucune partie sauvegardée","Aún no hay partidas guardadas","Noch keine gespeicherten Spiele","Nessuna partita salvata","Ainda não há jogos guardados"],"None":["Aucune","Ninguna","Keine","Nessuna","Nenhuma"],"Normal":["Normal","Normal","Normal","Normale","Normal"],"Not enough ":["Pas assez de ","No hay suficiente ","Nicht genug ","Non abbastanza ","Não há suficiente "],"Not enough food: build farms and put a peasant on each":["Pas assez de nourriture : construisez des fermes avec un paysan dans chacune","Falta comida: construye granjas y pon un campesino en cada una","Nicht genug Nahrung: baue Höfe und setze je einen Bauern ein","Cibo insufficiente: costruisci fattorie e metti un contadino in ognuna","Comida insuficiente: construa quintas e ponha um camponês em cada"],"Not enough resources to upgrade":["Pas assez de ressources pour améliorer","No hay recursos para mejorar","Nicht genug Rohstoffe zum Verbessern","Risorse insufficienti per potenziare","Recursos insuficientes para melhorar"],"Not suitable: needs dry, gentle land away from the edge":["Inadapté : il faut un terrain sec et doux, loin du bord","No apto: necesita tierra seca y suave, lejos del borde","Ungeeignet: trockenes, sanftes Land fern vom Rand nötig","Inadatto: serve terreno asciutto e dolce, lontano dal bordo","Inadequado: precisa de terreno seco e suave, longe da borda"],"Nothing to save":["Rien à sauvegarder","Nada que guardar","Nichts zu speichern","Niente da salvare","Nada para guardar"],"Now with keeps!":["Maintenant avec des donjons !","¡Ahora con torreones!","Jetzt mit Bergfrieden!","Ora con i mastii!","Agora com torres de menagem!"],"One research at a time: ":["Une recherche à la fois : ","Una investigación a la vez: ","Immer nur eine Forschung: ","Una ricerca alla volta: ","Uma pesquisa de cada vez: "],"Only one ":["Un seul ","Solo un ","Nur ein ","Solo un ","Apenas um "],"Open Sesame":["Sésame, ouvre-toi","Ábrete, sésamo","Sesam, öffne dich","Apriti sesamo","Abre-te, sésamo"],"Open saves folder":["Ouvrir le dossier des sauvegardes","Abrir carpeta de partidas","Speicherordner öffnen","Apri cartella salvataggi","Abrir pasta de gravações"],"Options":["Options","Opciones","Optionen","Opzioni","Opções"],"Paint":["Peindre","Pintar","Malen","Dipingi","Pintar"],"Paint tiles: idle or selected peasants":["Peindre les cases : paysans inactifs ou sélectionnés","Pintar casillas: campesinos inactivos o seleccionados","Felder malen: untätige oder ausgewählte Bauern","Dipingi caselle: contadini inattivi o selezionati","Pintar casas: camponeses inativos ou selecionados"],"Paint tiles: peasants lower them by 1":["Peindre les cases : les paysans les abaissent de 1","Pintar casillas: los campesinos las bajan 1","Felder malen: Bauern senken sie um 1","Dipingi caselle: i contadini le abbassano di 1","Pintar casas: os camponeses baixam-nas 1"],"Pan":["Déplacer","Desplazar","Schwenken","Sposta","Deslocar"],"Pan mode: drag moves the camera":["Mode déplacement : glisser déplace la caméra","Modo desplazar: arrastrar mueve la cámara","Schwenkmodus: Ziehen bewegt die Kamera","Modalità sposta: trascinare muove la telecamera","Modo deslocar: arrastar move a câmara"],"Pan: drag moves the camera":["Déplacer : glisser déplace la caméra","Desplazar: arrastrar mueve la cámara","Schwenken: Ziehen bewegt die Kamera","Sposta: trascinare muove la telecamera","Deslocar: arrastar move a câmara"],"Partner":["Partenaire","Compañero","Partner","Compagno","Parceiro"],"Partner disconnected - continuing solo":["Partenaire déconnecté - la partie continue en solo","Compañero desconectado - continúas en solitario","Partner getrennt - es geht allein weiter","Compagno disconnesso - si continua da soli","Parceiro desligado - continua sozinho"],"Path":["Chemin","Camino","Weg","Sentiero","Caminho"],"Path removed":["Chemin retiré","Camino eliminado","Weg entfernt","Sentiero rimosso","Caminho removido"],"Paths, raise and dig ground, ramps":["Chemins, surélever et creuser le sol, rampes","Caminos, elevar y excavar terreno, rampas","Wege, Boden heben und graben, Rampen","Sentieri, alzare e scavare il terreno, rampe","Caminhos, elevar e escavar terreno, rampas"],"Pattern":["Motif","Diseño","Muster","Motivo","Padrão"],"Pattern colour: ":["Couleur du motif : ","Color del diseño: ","Musterfarbe: ","Colore del motivo: ","Cor do padrão: "],"Pause":["Pause","Pausa","Pause","Pausa","Pausa"],"Pause [Space]":["Pause [Espace]","Pausa [Espacio]","Pause [Leertaste]","Pausa [Spazio]","Pausa [Espaço]"],"Peasant":["Paysan","Campesino","Bauer","Contadino","Camponês"],"Peasants":["Paysans","Campesinos","Bauern","Contadini","Camponeses"],"Peasants cannot reach it":["Les paysans ne peuvent pas y accéder","Los campesinos no pueden llegar","Bauern kommen nicht hin","I contadini non ci arrivano","Os camponeses não lá chegam"],"Peasants fix the selected building":["Les paysans réparent le bâtiment sélectionné","Los campesinos reparan el edificio seleccionado","Bauern reparieren das ausgewählte Gebäude","I contadini riparano l'edificio selezionato","Os camponeses reparam o edifício selecionado"],"Peasants gather 33% faster":["Les paysans récoltent 33 % plus vite","Los campesinos recolectan un 33 % más rápido","Bauern sammeln 33 % schneller","I contadini raccolgono il 33% più in fretta","Os camponeses recolhem 33% mais depressa"],"Peasants must build it: right-click the site":["Les paysans doivent le construire : clic droit sur le chantier","Los campesinos deben construirlo: clic derecho en la obra","Bauern müssen es bauen: Rechtsklick auf die Baustelle","I contadini devono costruirlo: tasto destro sul cantiere","Os camponeses têm de o construir: botão direito na obra"],"Peasants will remove this ramp":["Les paysans retireront cette rampe","Los campesinos quitarán esta rampa","Bauern entfernen diese Rampe","I contadini rimuoveranno questa rampa","Os camponeses vão remover esta rampa"],"Peasants will tear it down and recover 100% of the cost":["Les paysans le démoliront et récupéreront 100 % du coût","Los campesinos lo derribarán y recuperarán el 100 % del coste","Bauern reißen es ab und erhalten 100 % der Kosten zurück","I contadini lo abbatteranno e recupereranno il 100% del costo","Os camponeses vão demoli-lo e recuperar 100% do custo"],"Per pale":["Parti","Partido","Gespalten","Partito","Partido"],"Pick dry, gentle land away from the edge of the world":["Choisissez un terrain sec et doux, loin du bord du monde","Elige tierra seca y suave, lejos del borde del mundo","Wähle trockenes, sanftes Land fern vom Weltrand","Scegli terreno asciutto e dolce, lontano dal bordo del mondo","Escolha terreno seco e suave, longe da borda do mundo"],"Pierces a whole line of zombies":["Transperce toute une ligne de zombies","Atraviesa una fila entera de zombis","Durchbohrt eine ganze Reihe Zombies","Trafigge un'intera fila di zombi","Trespassa uma fila inteira de zumbis"],"Place ":["Placer ","Colocar ","Platzieren: ","Piazza ","Colocar "],"Place my castle":["Placer mon château","Colocar mi castillo","Meine Burg platzieren","Piazza il mio castello","Colocar o meu castelo"],"Places a ramp block that climbs 1 level":["Place un bloc de rampe qui monte d'un niveau","Coloca un bloque de rampa que sube 1 nivel","Setzt einen Rampenblock, der 1 Ebene ansteigt","Piazza un blocco rampa che sale di 1 livello","Coloca um bloco de rampa que sobe 1 nível"],"Plain":["Uni","Liso","Schlicht","Semplice","Liso"],"Plate armor":["Armure de plates","Armadura de placas","Plattenrüstung","Armatura a piastre","Armadura de placas"],"Play":["Jouer","Jugar","Spielen","Gioca","Jogar"],"Play (both players must place a castle)":["Jouer (les deux joueurs doivent placer un château)","Jugar (ambos jugadores deben colocar un castillo)","Spielen (beide müssen eine Burg platzieren)","Gioca (entrambi devono piazzare un castello)","Jogar (ambos têm de colocar um castelo)"],"Play again":["Rejouer","Jugar otra vez","Nochmal spielen","Gioca ancora","Jogar de novo"],"Player":["Joueur","Jugador","Spieler","Giocatore","Jogador"],"Population":["Population","Población","Bevölkerung","Popolazione","População"],"Population limit: build houses":["Limite de population : construisez des maisons","Límite de población: construye casas","Bevölkerungslimit: baue Häuser","Limite di popolazione: costruisci case","Limite de população: construa casas"],"Press Space to resume":["Appuyez sur Espace pour reprendre","Pulsa Espacio para continuar","Drücke Leertaste zum Fortsetzen","Premi Spazio per riprendere","Prima Espaço para continuar"],"Press any key or click for the music":["Appuyez sur une touche ou cliquez pour la musique","Pulsa una tecla o haz clic para la música","Taste drücken oder klicken für Musik","Premi un tasto o clicca per la musica","Prima uma tecla ou clique para a música"],"Protect the castle!":["Protégez le château !","¡Protege el castillo!","Schütze die Burg!","Proteggi il castello!","Proteja o castelo!"],"Quarterly":["Écartelé","Cuartelado","Geviert","Inquartato","Esquartelado"],"Raid - Wave ":["Raid - Vague ","Incursión - Oleada ","Überfall - Welle ","Incursione - Ondata ","Ataque - Onda "],"Raise":["Surélever","Elevar","Heben","Alza","Elevar"],"Raise ground":["Surélever le sol","Elevar terreno","Boden heben","Alza terreno","Elevar terreno"],"Raise ground [Y]":["Surélever le sol [Y]","Elevar terreno [Y]","Boden heben [Y]","Alza terreno [Y]","Elevar terreno [Y]"],"Rally point set for this barracks":["Point de ralliement défini pour cette caserne","Punto de reunión fijado para este cuartel","Sammelpunkt für diese Kaserne gesetzt","Punto di raduno impostato per questa caserma","Ponto de reunião definido para este quartel"],"Rally: barracks":["Ralliement : caserne","Reunión: cuartel","Sammelpunkt: Kaserne","Raduno: caserma","Reunião: quartel"],"Rally: castle":["Ralliement : château","Reunión: castillo","Sammelpunkt: Burg","Raduno: castello","Reunião: castelo"],"Ramp":["Rampe","Rampa","Rampe","Rampa","Rampa"],"Ramp [I]":["Rampe [I]","Rampa [I]","Rampe [I]","Rampa [I]","Rampa [I]"],"Ramp removed":["Rampe retirée","Rampa eliminada","Rampe entfernt","Rampa rimossa","Rampa removida"],"Random name":["Nom au hasard","Nombre aleatorio","Zufälliger Name","Nome casuale","Nome aleatório"],"Random spot":["Emplacement au hasard","Sitio aleatorio","Zufälliger Ort","Posto casuale","Local aleatório"],"Ranged attacker":["Attaque à distance","Atacante a distancia","Fernkämpfer","Attacco a distanza","Atacante à distância"],"Rebuilds this building in stone:":["Reconstruit ce bâtiment en pierre :","Reconstruye este edificio en piedra:","Baut dieses Gebäude in Stein neu:","Ricostruisce questo edificio in pietra:","Reconstrói este edifício em pedra:"],"Red eyes in the dark!":["Des yeux rouges dans le noir !","¡Ojos rojos en la oscuridad!","Rote Augen im Dunkeln!","Occhi rossi nel buio!","Olhos vermelhos no escuro!"],"Relocate your castle up to 40 tiles away":["Déplacez votre château jusqu'à 40 cases","Traslada tu castillo hasta 40 casillas","Verlege deine Burg bis zu 40 Felder weit","Sposta il castello fino a 40 caselle","Mude o castelo até 40 casas"],"Remove a builder":["Retirer un bâtisseur","Quitar un constructor","Einen Baumeister abziehen","Togli un costruttore","Remover um construtor"],"Remove a repairer":["Retirer un réparateur","Quitar un reparador","Einen Reparierer abziehen","Togli un riparatore","Remover um reparador"],"Remove a terraformer":["Retirer un terrassier","Quitar un terraplenador","Einen Erdarbeiter abziehen","Togli un terrazziere","Remover um terraplanador"],"Repair":["Réparer","Reparar","Reparieren","Ripara","Reparar"],"Repairers":["Réparateurs","Reparadores","Reparierer","Riparatori","Reparadores"],"Repairing the ":["Réparation : ","Reparando: ","Repariere: ","Riparazione: ","A reparar: "],"Repairs damaged buildings by himself (uses":["Répare seul les bâtiments endommagés (utilise","Repara solo los edificios dañados (usa","Repariert beschädigte Gebäude selbstständig (nutzt","Ripara da solo gli edifici danneggiati (usa","Repara sozinho os edifícios danificados (usa"],"Research":["Recherche","Investigar","Forschung","Ricerca","Pesquisa"],"Research (30 s): peasants gather":["Recherche (30 s) : les paysans récoltent","Investigación (30 s): los campesinos recolectan","Forschung (30 s): Bauern sammeln","Ricerca (30 s): i contadini raccolgono","Pesquisa (30 s): os camponeses recolhem"],"Research (35 s): units are trained":["Recherche (35 s) : les unités sont formées","Investigación (35 s): las unidades se entrenan","Forschung (35 s): Einheiten werden ausgebildet","Ricerca (35 s): le unità vengono addestrate","Pesquisa (35 s): as unidades são treinadas"],"Research (40 s): farms yield 50% more food":["Recherche (40 s) : les fermes produisent 50 % de nourriture en plus","Investigación (40 s): las granjas dan un 50 % más de comida","Forschung (40 s): Höfe liefern 50 % mehr Nahrung","Ricerca (40 s): le fattorie rendono il 50% di cibo in più","Pesquisa (40 s): as quintas rendem 50% mais comida"],"Research (40 s): your soldiers":["Recherche (40 s) : vos soldats","Investigación (40 s): tus soldados","Forschung (40 s): deine Soldaten","Ricerca (40 s): i tuoi soldati","Pesquisa (40 s): os seus soldados"],"Research (45 s): archers +25%,":["Recherche (45 s) : archers +25 %,","Investigación (45 s): arqueros +25 %,","Forschung (45 s): Bogenschützen +25 %,","Ricerca (45 s): arcieri +25%,","Pesquisa (45 s): arqueiros +25%,"],"Research (45 s): every wooden building,":["Recherche (45 s) : chaque bâtiment en bois,","Investigación (45 s): cada edificio de madera,","Forschung (45 s): jedes Holzgebäude,","Ricerca (45 s): ogni edificio in legno,","Pesquisa (45 s): cada edifício de madeira,"],"Research (50 s): your side takes":["Recherche (50 s) : votre camp subit","Investigación (50 s): tu bando recibe","Forschung (50 s): deine Seite erleidet","Ricerca (50 s): la tua parte subisce","Pesquisa (50 s): o seu lado sofre"],"Research (60 s): buildings take":["Recherche (60 s) : les bâtiments subissent","Investigación (60 s): los edificios reciben","Forschung (60 s): Gebäude erleiden","Ricerca (60 s): gli edifici subiscono","Pesquisa (60 s): os edifícios sofrem"],"Research (60 s): soldiers hit":["Recherche (60 s) : les soldats frappent","Investigación (60 s): los soldados golpean","Forschung (60 s): Soldaten treffen","Ricerca (60 s): i soldati colpiscono","Pesquisa (60 s): os soldados atacam"],"Research (70 s): your side takes":["Recherche (70 s) : votre camp subit","Investigación (70 s): tu bando recibe","Forschung (70 s): deine Seite erleidet","Ricerca (70 s): la tua parte subisce","Pesquisa (70 s): o seu lado sofre"],"Researching ":["Recherche en cours : ","Investigando ","Erforsche ","Ricerca in corso: ","A pesquisar "],"Researching Stonemasonry ":["Recherche de la Maçonnerie ","Investigando Cantería ","Erforsche Steinmetzkunst ","Ricerca della Muratura ","A pesquisar Cantaria "],"Researching Stonemasonry...":["Recherche de la Maçonnerie...","Investigando Cantería...","Erforsche Steinmetzkunst...","Ricerca della Muratura...","A pesquisar Cantaria..."],"Reset keys":["Réinitialiser les touches","Restablecer teclas","Tasten zurücksetzen","Ripristina tasti","Repor teclas"],"Return to the building categories":["Retour aux catégories de bâtiments","Volver a las categorías de edificios","Zurück zu den Gebäudekategorien","Torna alle categorie di edifici","Voltar às categorias de edifícios"],"Right-click a resource to harvest, a building to repair":["Clic droit sur une ressource pour récolter, sur un bâtiment pour réparer","Clic derecho en un recurso para recolectar, en un edificio para reparar","Rechtsklick auf Rohstoff zum Sammeln, auf Gebäude zum Reparieren","Tasto destro su una risorsa per raccogliere, su un edificio per riparare","Botão direito num recurso para recolher, num edifício para reparar"],"Right-click a wall, gate or tower":["Clic droit sur un mur, une porte ou une tour","Clic derecho en un muro, puerta o torre","Rechtsklick auf Mauer, Tor oder Turm","Tasto destro su muro, porta o torre","Botão direito numa muralha, portão ou torre"],"Right-click a wall, gate or tower to garrison":["Clic droit sur un mur, une porte ou une tour pour y poster des troupes","Clic derecho en un muro, puerta o torre para guarnecerlo","Rechtsklick auf Mauer, Tor oder Turm zum Besetzen","Tasto destro su muro, porta o torre per presidiarli","Botão direito numa muralha, portão ou torre para guarnecer"],"Right-click to move or attack":["Clic droit pour se déplacer ou attaquer","Clic derecho para mover o atacar","Rechtsklick zum Bewegen oder Angreifen","Tasto destro per muovere o attaccare","Botão direito para mover ou atacar"],"Ring":["Cercle","Anillo","Ring","Anello","Anel"],"Rise":["Hauteur","Alto","Anhöhe","Altura","Alto"],"Room ":["Salon ","Sala ","Raum ","Stanza ","Sala "],"Rose":["Rose","Rosa","Rosa","Rosa","Rosa"],"Rotate":["Tourner","Girar","Drehen","Ruota","Rodar"],"Rotate [R]":["Tourner [R]","Girar [R]","Drehen [R]","Ruota [R]","Rodar [R]"],"Rotate building":["Tourner le bâtiment","Girar edificio","Gebäude drehen","Ruota edificio","Rodar edifício"],"Rotate left [Z]":["Tourner à gauche [Z]","Girar a la izquierda [Z]","Links drehen [Z]","Ruota a sinistra [Z]","Rodar à esquerda [Z]"],"Rotate right [X]":["Tourner à droite [X]","Girar a la derecha [X]","Rechts drehen [X]","Ruota a destra [X]","Rodar à direita [X]"],"Rotated ":["Tourné ","Girado ","Gedreht ","Ruotato ","Rodado "],"Royal guard":["Garde royale","Guardia real","Leibgarde","Guardia reale","Guarda real"],"Royal guards serve King Naraige: summon him first":["Les gardes royaux servent le roi Naraige : appelez-le d'abord","Los guardias reales sirven al rey Naraige: invócalo primero","Die Leibgarde dient König Naraige: rufe ihn zuerst","Le guardie reali servono re Naraige: evocalo prima","Os guardas reais servem o rei Naraige: chame-o primeiro"],"STONE AGE":["ÂGE DE PIERRE","EDAD DE PIEDRA","STEINZEIT","ETÀ DELLA PIETRA","IDADE DA PEDRA"],"Saltire":["Sautoir","Sotuer","Andreaskreuz","Croce di Sant'Andrea","Aspa"],"Save / Load":["Sauvegarder / Charger","Guardar / Cargar","Speichern / Laden","Salva / Carica","Guardar / Carregar"],"Save failed: ":["Échec de la sauvegarde : ","Error al guardar: ","Speichern fehlgeschlagen: ","Salvataggio fallito: ","Falha ao guardar: "],"Save the game now":["Sauvegarder la partie maintenant","Guardar la partida ahora","Spiel jetzt speichern","Salva la partita ora","Guardar o jogo agora"],"Saves are not available here":["Les sauvegardes ne sont pas disponibles ici","Las partidas guardadas no están disponibles aquí","Speichern ist hier nicht verfügbar","I salvataggi non sono disponibili qui","As gravações não estão disponíveis aqui"],"Saving is for solo games":["La sauvegarde est réservée aux parties en solo","Guardar solo es posible en partidas en solitario","Speichern gibt es nur im Einzelspiel","Il salvataggio è solo per le partite in solitario","Guardar é só para jogos a solo"],"Score: ":["Score : ","Puntuación: ","Punkte: ","Punteggio: ","Pontuação: "],"See the whole world, spawns and routes":["Voir le monde entier, les apparitions et les routes","Ver el mundo entero, apariciones y rutas","Die ganze Welt, Spawns und Routen sehen","Vedi tutto il mondo, le comparse e i percorsi","Ver o mundo inteiro, aparecimentos e rotas"],"Select":["Sélection","Seleccionar","Auswahl","Seleziona","Selecionar"],"Select a building and press Upgrade, or use the Stone upgrade tool":["Sélectionnez un bâtiment et appuyez sur Améliorer, ou utilisez l'outil pierre","Selecciona un edificio y pulsa Mejorar, o usa la herramienta de piedra","Wähle ein Gebäude und drücke Verbessern oder nutze das Stein-Werkzeug","Seleziona un edificio e premi Potenzia, o usa lo strumento pietra","Selecione um edifício e prima Melhorar, ou use a ferramenta de pedra"],"Select a captain first":["Sélectionnez d'abord un capitaine","Selecciona primero un capitán","Wähle zuerst einen Hauptmann","Seleziona prima un capitano","Selecione primeiro um capitão"],"Select all peasants":["Sélectionner tous les paysans","Seleccionar todos los campesinos","Alle Bauern auswählen","Seleziona tutti i contadini","Selecionar todos os camponeses"],"Select army":["Sélectionner l'armée","Seleccionar ejército","Armee auswählen","Seleziona esercito","Selecionar exército"],"Select army [Q]":["Sélectionner l'armée [Q]","Seleccionar ejército [Q]","Armee auswählen [Q]","Seleziona esercito [Q]","Selecionar exército [Q]"],"Select it to open the research menu":["Sélectionnez-la pour ouvrir le menu de recherche","Selecciónala para abrir el menú de investigación","Auswählen, um das Forschungsmenü zu öffnen","Selezionala per aprire il menu ricerca","Selecione-a para abrir o menu de pesquisa"],"Select mode: drag draws a box":["Mode sélection : glisser trace un cadre","Modo selección: arrastrar dibuja un recuadro","Auswahlmodus: Ziehen zieht einen Rahmen","Modalità selezione: trascinare disegna un riquadro","Modo seleção: arrastar desenha uma caixa"],"Select peasants, then right-click a tree, rock or gold to harvest":["Sélectionnez des paysans, puis clic droit sur un arbre, un rocher ou de l'or pour récolter","Selecciona campesinos y haz clic derecho en un árbol, roca u oro para recolectar","Wähle Bauern, dann Rechtsklick auf Baum, Fels oder Gold zum Sammeln","Seleziona contadini, poi tasto destro su albero, roccia o oro per raccogliere","Selecione camponeses e clique com o botão direito numa árvore, rocha ou ouro para recolher"],"Select, then right-click a tree, rock":["Sélectionnez, puis clic droit sur un arbre, un rocher","Selecciona y haz clic derecho en un árbol, roca","Auswählen, dann Rechtsklick auf Baum, Fels","Seleziona, poi tasto destro su albero, roccia","Selecione e clique com o botão direito numa árvore, rocha"],"Select: drag draws a box":["Sélection : glisser trace un cadre","Selección: arrastrar dibuja un recuadro","Auswahl: Ziehen zieht einen Rahmen","Selezione: trascinare disegna un riquadro","Seleção: arrastar desenha uma caixa"],"Selects all fighters":["Sélectionne tous les combattants","Selecciona a todos los combatientes","Wählt alle Kämpfer","Seleziona tutti i combattenti","Seleciona todos os combatentes"],"Selects peasants with no job":["Sélectionne les paysans sans tâche","Selecciona a los campesinos sin tarea","Wählt Bauern ohne Arbeit","Seleziona i contadini senza lavoro","Seleciona camponeses sem tarefa"],"Sell 50 ":["Vendre 50 ","Vender 50 ","50 verkaufen: ","Vendi 50 ","Vender 50 "],"Send these peasants back to work now":["Renvoyer ces paysans au travail maintenant","Mandar a estos campesinos a trabajar ya","Diese Bauern jetzt zurück an die Arbeit schicken","Rimanda subito al lavoro questi contadini","Mandar estes camponeses trabalhar já"],"Settings":["Paramètres","Ajustes","Einstellungen","Impostazioni","Definições"],"Shared: helps both players":["Partagé : aide les deux joueurs","Compartido: ayuda a ambos jugadores","Geteilt: hilft beiden Spielern","Condiviso: aiuta entrambi i giocatori","Partilhado: ajuda ambos os jogadores"],"Siege":["Siège","Asedio","Belagerung","Assedio","Cerco"],"Siege weapons need Stonemasonry":["Les armes de siège nécessitent la Maçonnerie","Las armas de asedio requieren Cantería","Belagerungswaffen benötigen Steinmetzkunst","Le armi d'assedio richiedono la Muratura","As armas de cerco requerem Cantaria"],"Singleplayer":["Solo","Un jugador","Einzelspieler","Giocatore singolo","Um jogador"],"Sky":["Ciel","Cielo","Himmel","Cielo","Céu"],"Slay 100 zombies":["Tuer 100 zombies","Abatir 100 zombis","100 Zombies töten","Uccidi 100 zombi","Abater 100 zumbis"],"Slay 500 zombies":["Tuer 500 zombies","Abatir 500 zombis","500 Zombies töten","Uccidi 500 zombi","Abater 500 zumbis"],"Slay a zombie":["Tuer un zombie","Abatir un zombi","Einen Zombie töten","Uccidi uno zombi","Abater um zumbi"],"Slow, and weak up close. Needs Stonemasonry":["Lent et faible au contact. Nécessite la Maçonnerie","Lento y débil de cerca. Requiere Cantería","Langsam und schwach im Nahkampf. Benötigt Steinmetzkunst","Lento e debole da vicino. Richiede la Muratura","Lento e fraco de perto. Requer Cantaria"],"Small":["Petite","Pequeño","Klein","Piccola","Pequeno"],"Sold 50 ":["Vendu 50 ","Vendido 50 ","50 verkauft: ","Venduto 50 ","Vendido 50 "],"Sound ":["Son ","Sonido ","Ton ","Suono ","Som "],"Sound effects":["Effets sonores","Efectos de sonido","Soundeffekte","Effetti sonori","Efeitos sonoros"],"Sound is off":["Le son est coupé","El sonido está desactivado","Ton ist aus","L'audio è disattivato","O som está desligado"],"Sound on/off [O]":["Son activé/désactivé [O]","Sonido sí/no [O]","Ton an/aus [O]","Audio sì/no [O]","Som ligado/desligado [O]"],"Sound: ":["Son : ","Sonido: ","Ton: ","Suono: ","Som: "],"Sound: off":["Son : coupé","Sonido: no","Ton: aus","Suono: off","Som: desligado"],"Sound: on":["Son : activé","Sonido: sí","Ton: an","Suono: on","Som: ligado"],"Space":["Espace","Espacio","Leertaste","Spazio","Espaço"],"Spawn":["Apparition","Aparición","Spawn","Comparsa","Aparecimento"],"Squad disbanded":["Escouade dissoute","Escuadra disuelta","Trupp aufgelöst","Squadra sciolta","Esquadra dissolvida"],"Squad: ":["Escouade : ","Escuadra: ","Trupp: ","Squadra: ","Esquadra: "],"Steel weapons":["Armes en acier","Armas de acero","Stahlwaffen","Armi d'acciaio","Armas de aço"],"Stone":["Pierre","Piedra","Stein","Pietra","Pedra"],"Stone ":["Pierre ","Piedra ","Stein ","Pietra ","Pedra "],"Stone Wall":["Mur de pierre","Muro de piedra","Steinmauer","Muro di pietra","Muralha de pedra"],"Stone building needs Masonry (Academy)":["Construire en pierre nécessite la Maçonnerie (Académie)","Construir en piedra requiere Cantería (Academia)","Steinbau benötigt Steinmetzkunst (Akademie)","Costruire in pietra richiede la Muratura (Accademia)","Construir em pedra requer Cantaria (Academia)"],"Stone needs Stonemasonry":["La pierre nécessite la Maçonnerie","La piedra requiere Cantería","Stein benötigt Steinmetzkunst","La pietra richiede la Muratura","A pedra requer Cantaria"],"Stone tool":["Outil pierre","Herramienta de piedra","Stein-Werkzeug","Strumento pietra","Ferramenta de pedra"],"Stone upgrade tool":["Outil d'amélioration en pierre","Herramienta de mejora a piedra","Werkzeug: Steinverbesserung","Strumento di potenziamento in pietra","Ferramenta de melhoria em pedra"],"Stone upgrades need Stonemasonry (Academy)":["Les améliorations en pierre nécessitent la Maçonnerie (Académie)","Las mejoras a piedra requieren Cantería (Academia)","Steinverbesserungen benötigen Steinmetzkunst (Akademie)","I potenziamenti in pietra richiedono la Muratura (Accademia)","As melhorias em pedra requerem Cantaria (Academia)"],"Stonemasonry":["Maçonnerie","Cantería","Steinmetzkunst","Muratura","Cantaria"],"Stonemasonry [G]":["Maçonnerie [G]","Cantería [G]","Steinmetzkunst [G]","Muratura [G]","Cantaria [G]"],"Stonemasonry needs 200 stone and 100 wood":["La Maçonnerie coûte 200 pierre et 100 bois","La Cantería necesita 200 de piedra y 100 de madera","Steinmetzkunst braucht 200 Stein und 100 Holz","La Muratura richiede 200 pietra e 100 legno","A Cantaria precisa de 200 pedra e 100 madeira"],"Stop":["Stop","Parar","Stopp","Ferma","Parar"],"Stop [4]":["Stop [4]","Parar [4]","Stopp [4]","Ferma [4]","Parar [4]"],"Stopped":["Arrêtés","Detenidos","Gestoppt","Fermati","Parados"],"Storage":["Entrepôt","Almacén","Lager","Magazzino","Armazém"],"Storage Box":["Bien rangé","Bien guardado","Gut verstaut","Ben riposto","Bem arrumado"],"Storage [K]":["Entrepôt [K]","Almacén [K]","Lager [K]","Magazzino [K]","Armazém [K]"],"Summon King Naraige":["Appeler le roi Naraige","Invocar al rey Naraige","König Naraige rufen","Evoca re Naraige","Chamar o rei Naraige"],"Summoned at the castle with his 2 royal guards - one king only":["Apparaît au château avec ses 2 gardes royaux - un seul roi","Aparece en el castillo con sus 2 guardias reales - un solo rey","Erscheint an der Burg mit seinen 2 Leibwächtern - nur ein König","Compare al castello con le 2 guardie reali - un solo re","Surge no castelo com os 2 guardas reais - um único rei"],"Survive 10 waves":["Survivre à 10 vagues","Sobrevivir a 10 oleadas","10 Wellen überleben","Sopravvivi a 10 ondate","Sobreviver a 10 ondas"],"Survive 5 waves":["Survivre à 5 vagues","Sobrevivir a 5 oleadas","5 Wellen überleben","Sopravvivi a 5 ondate","Sobreviver a 5 ondas"],"Survive the night!":["Survivez à la nuit !","¡Sobrevive a la noche!","Überlebe die Nacht!","Sopravvivi alla notte!","Sobreviva à noite!"],"Survive your first wave":["Survivre à votre première vague","Sobrevive a tu primera oleada","Überlebe deine erste Welle","Sopravvivi alla prima ondata","Sobreviva à primeira onda"],"Survivor":["Survivant","Superviviente","Überlebender","Sopravvissuto","Sobrevivente"],"Tab":["Tab","Tab","Tab","Tab","Tab"],"Teal":["Sarcelle","Verde azulado","Petrol","Verde acqua","Azul-petróleo"],"Ten thousand zombies!":["Dix mille zombies !","¡Diez mil zombis!","Zehntausend Zombies!","Diecimila zombi!","Dez mil zumbis!"],"Terraformers":["Terrassiers","Terraplenadores","Erdarbeiter","Terrazzieri","Terraplanadores"],"The ":["Le ","El ","Die ","Il ","O "],"The End?":["La fin ?","¿El fin?","Das Ende?","La fine?","O fim?"],"The cannon needs Stonemasonry":["Le canon nécessite la Maçonnerie","El cañón requiere Cantería","Die Kanone benötigt Steinmetzkunst","Il cannone richiede la Muratura","O canhão requer Cantaria"],"The castle door needs the 3 tiles in front of it free":["La porte du château a besoin des 3 cases devant elle libres","La puerta del castillo necesita libres las 3 casillas de delante","Das Burgtor braucht die 3 Felder davor frei","La porta del castello richiede libere le 3 caselle davanti","A porta do castelo precisa das 3 casas à frente livres"],"The castle door turns with it":["La porte du château tourne avec lui","La puerta del castillo gira con él","Das Burgtor dreht sich mit","La porta del castello ruota con esso","A porta do castelo roda com ele"],"The code ":["Le code ","El código ","Der Code ","Il codice ","O código "],"The darkness hurts! Stay near the castle, towers, torches or a bannerman":["L'obscurité blesse ! Restez près du château, des tours, des torches ou d'un porte-étendard","¡La oscuridad hiere! Quédate cerca del castillo, torres, antorchas o un abanderado","Die Dunkelheit verletzt! Bleib nahe Burg, Türmen, Fackeln oder einem Bannerträger","Il buio ferisce! Resta vicino a castello, torri, torce o a un portabandiera","A escuridão fere! Fique perto do castelo, torres, tochas ou de um porta-estandarte"],"The horde turns on ":["La horde se tourne vers ","La horda se vuelve contra ","Die Horde wendet sich gegen ","L'orda si rivolge contro ","A horda vira-se contra "],"The host chose a map":["L'hôte a choisi une carte","El anfitrión eligió un mapa","Der Host hat eine Karte gewählt","L'host ha scelto una mappa","O anfitrião escolheu um mapa"],"The host chose a new map":["L'hôte a choisi une nouvelle carte","El anfitrión eligió un mapa nuevo","Der Host hat eine neue Karte gewählt","L'host ha scelto una nuova mappa","O anfitrião escolheu um novo mapa"],"The king is summoned at your castle":["Le roi apparaît à votre château","El rey aparece en tu castillo","Der König erscheint an deiner Burg","Il re compare al tuo castello","O rei surge no seu castelo"],"The ramp could not be built here":["Impossible de construire la rampe ici","No se pudo construir la rampa aquí","Die Rampe konnte hier nicht gebaut werden","Impossibile costruire la rampa qui","Não foi possível construir a rampa aqui"],"The sun burns the last zombies":["Le soleil brûle les derniers zombies","El sol quema a los últimos zombis","Die Sonne verbrennt die letzten Zombies","Il sole brucia gli ultimi zombi","O sol queima os últimos zumbis"],"The two castles are too close: one of you must move.":["Les deux châteaux sont trop proches : l'un de vous doit se déplacer.","Los dos castillos están demasiado cerca: uno de vosotros debe moverse.","Die beiden Burgen sind zu nah: einer von euch muss umziehen.","I due castelli sono troppo vicini: uno di voi deve spostarsi.","Os dois castelos estão demasiado perto: um de vocês tem de mudar."],"This tower already has a siege weapon":["Cette tour a déjà une arme de siège","Esta torre ya tiene un arma de asedio","Dieser Turm hat bereits eine Belagerungswaffe","Questa torre ha già un'arma d'assedio","Esta torre já tem uma arma de cerco"],"Title Screen":["Écran titre","Pantalla de título","Titelbildschirm","Schermata del titolo","Ecrã inicial"],"Too close to another forester: their planting areas would touch":["Trop près d'un autre forestier : leurs zones de plantation se toucheraient","Demasiado cerca de otro guardabosques: sus zonas de plantación se tocarían","Zu nah an einem anderen Förster: ihre Pflanzflächen würden sich berühren","Troppo vicino a un altro guardaboschi: le zone di piantagione si toccherebbero","Demasiado perto de outro guarda-florestal: as zonas de plantação tocar-se-iam"],"Too close to your partner: pick a site at least 45 tiles away":["Trop près de votre partenaire : choisissez un emplacement à au moins 45 cases","Demasiado cerca de tu compañero: elige un sitio a 45 casillas como mínimo","Zu nah an deinem Partner: wähle einen Ort mindestens 45 Felder entfernt","Troppo vicino al compagno: scegli un sito ad almeno 45 caselle","Demasiado perto do parceiro: escolha um local a pelo menos 45 casas"],"Too high":["Trop haut","Demasiado alto","Zu hoch","Troppo alto","Demasiado alto"],"Torch":["Torche","Antorcha","Fackel","Torcia","Tocha"],"Torch [']":["Torche [']","Antorcha [']","Fackel [']","Torcia [']","Tocha [']"],"Tough melee fighter":["Combattant robuste au corps à corps","Luchador cuerpo a cuerpo resistente","Robuster Nahkämpfer","Combattente robusto in mischia","Lutador robusto corpo a corpo"],"Tower":["Tour","Torre","Turm","Torre","Torre"],"Town":["Ville","Pueblo","Stadt","Città","Vila"],"Trade":["Commerce","Comerciar","Handel","Commercio","Comércio"],"Train":["Former","Entrenar","Ausbilden","Addestra","Treinar"],"Train a royal guard":["Former un garde royal","Entrenar un guardia real","Leibwächter ausbilden","Addestra una guardia reale","Treinar um guarda real"],"Train archer":["Former un archer","Entrenar arquero","Bogenschützen ausbilden","Addestra arciere","Treinar arqueiro"],"Train bannerman":["Former un porte-étendard","Entrenar abanderado","Bannerträger ausbilden","Addestra portabandiera","Treinar porta-estandarte"],"Train cannon":["Former un canon","Entrenar cañón","Kanone ausbilden","Addestra cannone","Treinar canhão"],"Train captain":["Former un capitaine","Entrenar capitán","Hauptmann ausbilden","Addestra capitano","Treinar capitão"],"Train knight":["Former un chevalier","Entrenar caballero","Ritter ausbilden","Addestra cavaliere","Treinar cavaleiro"],"Train peasant":["Former un paysan","Entrenar campesino","Bauern ausbilden","Addestra contadino","Treinar camponês"],"Trebuchet":["Trébuchet","Trebuchet","Trebuchet","Trabucco","Trabuco"],"Trebuchet [T]":["Trébuchet [T]","Trebuchet [T]","Trebuchet [T]","Trabucco [T]","Trabuco [T]"],"Turn camera left":["Tourner la caméra à gauche","Girar cámara a la izquierda","Kamera links drehen","Ruota telecamera a sinistra","Rodar câmara à esquerda"],"Turn camera right":["Tourner la caméra à droite","Girar cámara a la derecha","Kamera rechts drehen","Ruota telecamera a destra","Rodar câmara à direita"],"Turns the selected building 90 degrees":["Tourne le bâtiment sélectionné de 90 degrés","Gira el edificio seleccionado 90 grados","Dreht das ausgewählte Gebäude um 90 Grad","Ruota l'edificio selezionato di 90 gradi","Roda o edifício selecionado 90 graus"],"Type the room code first.":["Tapez d'abord le code du salon.","Escribe primero el código de la sala.","Gib zuerst den Raumcode ein.","Scrivi prima il codice della stanza.","Escreva primeiro o código da sala."],"Ultra HD":["Ultra HD","Ultra HD","Ultra HD","Ultra HD","Ultra HD"],"Units are trained in a Barracks: build one, then click it":["Les unités se forment dans une caserne : construisez-en une, puis cliquez dessus","Las unidades se entrenan en un cuartel: construye uno y haz clic en él","Einheiten werden in einer Kaserne ausgebildet: baue eine und klicke sie an","Le unità si addestrano in caserma: costruiscine una e cliccala","As unidades treinam num quartel: construa um e clique nele"],"Units train 25% faster":["Les unités se forment 25 % plus vite","Las unidades se entrenan un 25 % más rápido","Einheiten bilden 25 % schneller aus","Le unità si addestrano il 25% più in fretta","As unidades treinam 25% mais depressa"],"Units trained while it is selected":["Unités formées tant qu'il est sélectionné","Unidades entrenadas mientras está seleccionado","Einheiten, ausgebildet solange es ausgewählt ist","Unità addestrate mentre è selezionato","Unidades treinadas enquanto está selecionado"],"Unknown save format":["Format de sauvegarde inconnu","Formato de partida desconocido","Unbekanntes Speicherformat","Formato di salvataggio sconosciuto","Formato de gravação desconhecido"],"Upgrade":["Améliorer","Mejorar","Verbessern","Potenzia","Melhorar"],"Upgrade it to stone later":["Améliorez-le en pierre plus tard","Mejóralo a piedra más tarde","Später zu Stein verbessern","Potenzialo in pietra più tardi","Melhore-o para pedra mais tarde"],"Upgrade to stone":["Améliorer en pierre","Mejorar a piedra","Zu Stein verbessern","Potenzia in pietra","Melhorar para pedra"],"Used when you move 3+ selected soldiers":["Utilisée quand vous déplacez 3 soldats sélectionnés ou plus","Se usa al mover 3 o más soldados seleccionados","Wird genutzt, wenn du 3+ ausgewählte Soldaten bewegst","Usata quando muovi 3 o più soldati selezionati","Usada quando move 3 ou mais soldados selecionados"],"Vale":["Val","Valle","Tal","Valle","Vale"],"Version mismatch: you run ":["Versions différentes : vous avez ","Versiones distintas: tienes ","Versionen passen nicht: du hast ","Versioni diverse: hai ","Versões diferentes: tem "],"Veteran":["Vétéran","Veterano","Veteran","Veterano","Veterano"],"Violet":["Violet","Violeta","Violett","Viola","Violeta"],"WAVE ":["VAGUE ","OLEADA ","WELLE ","ONDATA ","ONDA "],"Wait: ":["Attendre : ","Espera: ","Warten: ","Attendi: ","Esperar: "],"Waiting for player 2...":["En attente du joueur 2...","Esperando al jugador 2...","Warte auf Spieler 2...","In attesa del giocatore 2...","À espera do jogador 2..."],"Waiting for the host to press Play":["En attente que l'hôte appuie sur Jouer","Esperando a que el anfitrión pulse Jugar","Warte, bis der Host Spielen drückt","In attesa che l'host prema Gioca","À espera que o anfitrião prima Jogar"],"Waiting for the host to press Play...":["En attente que l'hôte appuie sur Jouer...","Esperando a que el anfitrión pulse Jugar...","Warte, bis der Host Spielen drückt...","In attesa che l'host prema Gioca...","À espera que o anfitrião prima Jogar..."],"Waiting for your partner to join...":["En attente de votre partenaire...","Esperando a que se una tu compañero...","Warte auf deinen Partner...","In attesa del compagno...","À espera do parceiro..."],"Wall":["Mur","Muro","Mauer","Muro","Muralha"],"Wall replaced by a tower (wall refunded)":["Mur remplacé par une tour (mur remboursé)","Muro sustituido por una torre (muro devuelto)","Mauer durch Turm ersetzt (Mauer erstattet)","Muro sostituito da una torre (muro rimborsato)","Muralha substituída por uma torre (muralha reembolsada)"],"Walls replaced by the tower (refunded)":["Murs remplacés par la tour (remboursés)","Muros sustituidos por la torre (devueltos)","Mauern durch den Turm ersetzt (erstattet)","Muri sostituiti dalla torre (rimborsati)","Muralhas substituídas pela torre (reembolsadas)"],"Walls, gates, towers and torches":["Murs, portes, tours et torches","Muros, puertas, torres y antorchas","Mauern, Tore, Türme und Fackeln","Muri, porte, torri e torce","Muralhas, portões, torres e tochas"],"Watch":["Guet","Vigía","Wacht","Vedetta","Vigia"],"Watchtower":["Tour de guet","Atalaya","Wachturm","Torre di guardia","Torre de vigia"],"Wave ":["Vague ","Oleada ","Welle ","Ondata ","Onda "],"Wave called early: +":["Vague appelée en avance : +","Oleada adelantada: +","Welle früh gerufen: +","Ondata chiamata in anticipo: +","Onda chamada mais cedo: +"],"Waves survived: ":["Vagues survécues : ","Oleadas superadas: ","Überlebte Wellen: ","Ondate superate: ","Ondas sobrevividas: "],"Wedge":["Coin","Cuña","Keil","Cuneo","Cunha"],"Wine":["Lie-de-vin","Vino","Weinrot","Vinaccia","Vinho"],"Wood":["Bois","Madera","Holz","Legno","Madeira"],"Wood / stone tier":["Matériau bois / pierre","Material madera / piedra","Holz- / Steinstufe","Materiale legno / pietra","Material madeira / pedra"],"Wood row on top, stone row below":["Rangée bois en haut, rangée pierre en bas","Fila de madera arriba, de piedra abajo","Holzreihe oben, Steinreihe unten","Fila legno sopra, fila pietra sotto","Fila de madeira em cima, de pedra em baixo"],"Wooden ":["En bois ","De madera ","Holz-","In legno ","De madeira "],"Wooden gate":["Porte en bois","Puerta de madera","Holztor","Porta in legno","Portão de madeira"],"Wooden tower":["Tour en bois","Torre de madera","Holzturm","Torre in legno","Torre de madeira"],"Wooden wall":["Mur en bois","Muro de madera","Holzmauer","Muro in legno","Muralha de madeira"],"World map":["Carte du monde","Mapa del mundo","Weltkarte","Mappa del mondo","Mapa do mundo"],"World map [M]":["Carte du monde [M]","Mapa del mundo [M]","Weltkarte [M]","Mappa del mondo [M]","Mapa do mundo [M]"],"You":["Vous","Tú","Du","Tu","Você"],"You get ":["Vous obtenez ","Obtienes ","Du erhältst ","Ottieni ","Recebe "],"You need ":["Il vous faut ","Necesitas ","Du brauchst ","Ti serve ","Precisa de "],"You need 50 ":["Il vous faut 50 ","Necesitas 50 ","Du brauchst 50 ","Ti servono 50 ","Precisa de 50 "],"Your ":["Votre ","Tu ","Dein ","Il tuo ","O seu "],"Your base":["Votre base","Tu base","Deine Basis","La tua base","A sua base"],"Your castle alone supports 18":["Votre château seul en loge 18","Tu castillo solo aloja a 18","Deine Burg allein versorgt 18","Il tuo castello da solo ne ospita 18","O seu castelo sozinho aloja 18"],"Your code needs at least 3 letters or digits.":["Votre code doit avoir au moins 3 lettres ou chiffres.","Tu código necesita al menos 3 letras o cifras.","Dein Code braucht mindestens 3 Buchstaben oder Ziffern.","Il codice deve avere almeno 3 lettere o cifre.","O código precisa de pelo menos 3 letras ou algarismos."],"Your kingdom":["Votre royaume","Tu reino","Dein Königreich","Il tuo regno","O seu reino"],"Your kingdom already has a king":["Votre royaume a déjà un roi","Tu reino ya tiene un rey","Dein Königreich hat bereits einen König","Il tuo regno ha già un re","O seu reino já tem um rei"],"Your kingdom fell!":["Votre royaume est tombé !","¡Tu reino ha caído!","Dein Königreich ist gefallen!","Il tuo regno è caduto!","O seu reino caiu!"],"Your partner":["Votre partenaire","Tu compañero","Dein Partner","Il tuo compagno","O seu parceiro"],"Your partner left the lobby.":["Votre partenaire a quitté le salon.","Tu compañero salió de la sala.","Dein Partner hat den Raum verlassen.","Il compagno ha lasciato la stanza.","O parceiro saiu da sala."],"Your side takes 15% less damage again":["Votre camp subit encore 15 % de dégâts en moins","Tu bando recibe otro 15 % menos de daño","Deine Seite erleidet nochmals 15 % weniger Schaden","La tua parte subisce un altro 15% di danni in meno","O seu lado sofre mais 15% menos de dano"],"Your side takes 22% less damage":["Votre camp subit 22 % de dégâts en moins","Tu bando recibe un 22 % menos de daño","Deine Seite erleidet 22 % weniger Schaden","La tua parte subisce il 22% di danni in meno","O seu lado sofre 22% menos de dano"],"Your soldiers hit 20% harder again":["Vos soldats frappent encore 20 % plus fort","Tus soldados golpean otro 20 % más fuerte","Deine Soldaten treffen nochmals 20 % härter","I tuoi soldati colpiscono un altro 20% più forte","Os seus soldados atacam mais 20% mais forte"],"Your soldiers hit 25% harder":["Vos soldats frappent 25 % plus fort","Tus soldados golpean un 25 % más fuerte","Deine Soldaten treffen 25 % härter","I tuoi soldati colpiscono il 25% più forte","Os seus soldados atacam 25% mais forte"],"Your units are under attack!":["Vos unités sont attaquées !","¡Tus unidades están siendo atacadas!","Deine Einheiten werden angegriffen!","Le tue unità sono sotto attacco!","As suas unidades estão a ser atacadas!"],"Your units pass, zombies must break it":["Vos unités passent, les zombies doivent la briser","Tus unidades pasan, los zombis deben romperla","Deine Einheiten kommen durch, Zombies müssen es zerbrechen","Le tue unità passano, gli zombi devono sfondarla","As suas unidades passam, os zumbis têm de a partir"],"Zombie Slayer":["Tueur de zombies","Matazombis","Zombietöter","Ammazzazombi","Mata-zumbis"],"Zombies alive":["Zombies vivants","Zombis vivos","Lebende Zombies","Zombi vivi","Zumbis vivos"],"Zombies come along the red lines":["Les zombies arrivent par les lignes rouges","Los zombis llegan por las líneas rojas","Zombies kommen entlang der roten Linien","Gli zombi arrivano lungo le linee rosse","Os zumbis vêm pelas linhas vermelhas"],"Zombies hate walls!":["Les zombies détestent les murs !","¡Los zombis odian los muros!","Zombies hassen Mauern!","Gli zombi odiano le mura!","Os zumbis odeiam muralhas!"],"Zombies slain":["Zombies tués","Zombis abatidos","Getötete Zombies","Zombi uccisi","Zumbis abatidos"],"Zoom in":["Zoom avant","Acercar","Hineinzoomen","Ingrandisci","Aproximar"],"Zoom out":["Zoom arrière","Alejar","Herauszoomen","Riduci","Afastar"],"[G] group nearby soldiers behind the captain":["[G] regroupe les soldats proches derrière le capitaine","[G] agrupa a los soldados cercanos tras el capitán","[G] sammelt Soldaten in der Nähe hinter dem Hauptmann","[G] raggruppa i soldati vicini dietro al capitano","[G] agrupa os soldados próximos atrás do capitão"],"[R] turns it - peasants build it (free)":["[R] le tourne - les paysans le construisent (gratuit)","[R] lo gira - los campesinos lo construyen (gratis)","[R] dreht es - Bauern bauen es (kostenlos)","[R] lo ruota - i contadini lo costruiscono (gratis)","[R] roda-o - os camponeses constroem-no (grátis)"],"an older version":["une version plus ancienne","una versión más antigua","eine ältere Version","una versione più vecchia","uma versão mais antiga"],"and centers the camera on them":["et centre la caméra sur eux","y centra la cámara en ellos","und zentriert die Kamera auf sie","e centra la telecamera su di loro","e centra a câmara neles"],"and every new unit costs food":["et chaque nouvelle unité coûte de la nourriture","y cada unidad nueva cuesta comida","und jede neue Einheit kostet Nahrung","e ogni nuova unità costa cibo","e cada nova unidade custa comida"],"and give back 2 stone each":["et rendent 2 pierres chacun","y devuelven 2 de piedra cada uno","und geben je 2 Stein zurück","e restituiscono 2 pietre ciascuno","e devolvem 2 de pedra cada"],"and gold here: build it next to resources":["et l'or ici : construisez-le près des ressources","y el oro aquí: constrúyelo junto a los recursos","und Gold hier ab: baue es nahe den Rohstoffen","e l'oro qui: costruiscilo vicino alle risorse","e o ouro aqui: construa-o junto aos recursos"],"and speeds up their attacks":["et accélère leurs attaques","y acelera sus ataques","und beschleunigt ihre Angriffe","e velocizza i loro attacchi","e acelera os seus ataques"],"and take 20% less damage":["et subissent 20 % de dégâts en moins","y reciben un 20 % menos de daño","und erleiden 20 % weniger Schaden","e subiscono il 20% di danni in meno","e sofrem 20% menos de dano"],"and towers hit 25% harder":["et les tours frappent 25 % plus fort","y las torres golpean un 25 % más fuerte","und Türme treffen 25 % härter","e le torri colpiscono il 25% più forte","e as torres atacam 25% mais forte"],"and you recover 100% of its cost":["et vous récupérez 100 % de son coût","y recuperas el 100 % de su coste","und du erhältst 100 % der Kosten zurück","e recuperi il 100% del costo","e recupera 100% do seu custo"],"another 15% less damage":["encore 15 % de dégâts en moins","otro 15 % menos de daño","nochmals 15 % weniger Schaden","un altro 15% di danni in meno","mais 15% menos de dano"],"another 20% harder":["encore 20 % plus fort","otro 20 % más fuerte","nochmals 20 % härter","un altro 20% più forte","mais 20% mais forte"],"barracks walk there by themselves":["de la caserne s'y rendent d'eux-mêmes","del cuartel van allí solos","der Kaserne gehen von selbst dorthin","della caserma ci vanno da soli","do quartel vão lá sozinhos"],"castle included, becomes stone":["château compris, devient en pierre","castillo incluido, pasa a ser de piedra","Burg eingeschlossen, wird zu Stein","castello incluso, diventa di pietra","castelo incluído, passa a pedra"],"choose your castle site":["choisissez l'emplacement de votre château","elige el sitio de tu castillo","wähle deinen Burgstandort","scegli il sito del castello","escolha o local do seu castelo"],"choosing...":["choix en cours...","eligiendo...","wählt...","scelta in corso...","a escolher..."],"come out of it, 35% faster":["en sortent 35 % plus vite","salen de él un 35 % más rápido","verlassen sie 35 % schneller","ne escono il 35% più veloci","saem dele 35% mais depressa"],"enemies within weapon range":["ennemis à portée d'arme","enemigos al alcance del arma","Feinde in Waffenreichweite","nemici a portata d'arma","inimigos ao alcance da arma"],"hit 35% harder and take 20% less damage":["frappent 35 % plus fort et subissent 20 % de dégâts en moins","golpean un 35 % más fuerte y reciben un 20 % menos de daño","treffen 35 % härter und erleiden 20 % weniger Schaden","colpiscono il 35% più forte e subiscono il 20% di danni in meno","atacam 35% mais forte e sofrem 20% menos de dano"],"no worker":["aucun travailleur","sin trabajador","kein Arbeiter","nessun lavoratore","sem trabalhador"],"on a tree, rock or gold they start working it":["sur un arbre, un rocher ou de l'or, ils se mettent au travail","en un árbol, roca u oro empiezan a trabajarlo","auf einen Baum, Fels oder Gold beginnen sie zu arbeiten","su albero, roccia o oro iniziano a lavorarci","numa árvore, rocha ou ouro começam a trabalhá-lo"],"or gold to harvest it. Click a building to repair":["ou de l'or pour le récolter. Cliquez un bâtiment pour le réparer","u oro para recolectarlo. Haz clic en un edificio para repararlo","oder Gold, um es zu sammeln. Klicke ein Gebäude zum Reparieren","o oro per raccoglierlo. Clicca un edificio per ripararlo","ou ouro para o recolher. Clique num edifício para o reparar"],"outside the light is hurt by the dark":["hors de la lumière souffre de l'obscurité","fuera de la luz sufre por la oscuridad","außerhalb des Lichts leidet unter der Dunkelheit","fuori dalla luce soffre il buio","fora da luz sofre com a escuridão"],"peasants build, repair and reshape the land":["les paysans construisent, réparent et façonnent le terrain","los campesinos construyen, reparan y moldean el terreno","Bauern bauen, reparieren und formen das Land","i contadini costruiscono, riparano e modellano il terreno","os camponeses constroem, reparam e moldam o terreno"],"raise them by 1 block (free)":["les surélever d'un bloc (gratuit)","elevarlas 1 bloque (gratis)","um 1 Block erhöhen (kostenlos)","alzarle di 1 blocco (gratis)","elevá-las 1 bloco (grátis)"],"s selected":[" sélectionnés"," seleccionados"," ausgewählt"," selezionati"," selecionados"],"save not found":["sauvegarde introuvable","partida no encontrada","Spielstand nicht gefunden","salvataggio non trovato","gravação não encontrada"],"tab hidden":["onglet masqué","pestaña oculta","Tab verborgen","scheda nascosta","separador oculto"],"the other peasants keep gathering":["les autres paysans continuent de récolter","los demás campesinos siguen recolectando","die anderen Bauern sammeln weiter","gli altri contadini continuano a raccogliere","os outros camponeses continuam a recolher"],"their acid keeps burning men and walls - spread your troops":["leur acide continue de brûler hommes et murs - dispersez vos troupes","su ácido sigue quemando hombres y muros - dispersa tus tropas","ihre Säure verbrennt weiter Männer und Mauern - verteile deine Truppen","il loro acido continua a bruciare uomini e mura - disperdi le truppe","o ácido continua a queimar homens e muralhas - espalhe as tropas"],"they blow up at your walls, or when they die - shoot them from afar, ideally inside the horde":["ils explosent contre vos murs ou à leur mort - tirez-leur dessus de loin, idéalement au milieu de la horde","explotan contra tus muros o al morir - dispárales de lejos, mejor dentro de la horda","sie explodieren an deinen Mauern oder beim Tod - beschieße sie von weitem, am besten in der Horde","esplodono contro le mura o quando muoiono - colpiscili da lontano, meglio dentro l'orda","explodem nas muralhas ou ao morrer - dispare de longe, de preferência dentro da horda"],"they dig through cliffs, rock and woods to open a way for the horde":["ils creusent falaises, roche et bois pour ouvrir un passage à la horde","excavan acantilados, roca y bosques para abrir paso a la horda","sie graben sich durch Klippen, Fels und Wald, um der Horde einen Weg zu bahnen","scavano scogliere, roccia e boschi per aprire la strada all'orda","escavam falésias, rocha e bosques para abrir caminho à horda"],"to garrison it for more range":["pour y poster des troupes et gagner en portée","para guarnecerlo y ganar alcance","um ihn für mehr Reichweite zu besetzen","per presidiarlo e avere più gittata","para o guarnecer e ganhar alcance"],"to rebuild them in stone (walls...)":["pour les reconstruire en pierre (murs...)","para reconstruirlos en piedra (muros...)","um sie in Stein neu zu bauen (Mauern...)","per ricostruirli in pietra (mura...)","para os reconstruir em pedra (muralhas...)"],"towers +40% damage":["tours +40 % de dégâts","torres +40 % de daño","Türme +40 % Schaden","torri +40% di danno","torres +40% de dano"],"twice the hit points":["deux fois plus de points de vie","el doble de puntos de vida","doppelte Lebenspunkte","il doppio dei punti vita","o dobro dos pontos de vida"],"window inactive":["fenêtre inactive","ventana inactiva","Fenster inaktiv","finestra inattiva","janela inativa"],"wood, stone or food for gold, or buy them":["bois, pierre ou nourriture contre de l'or, ou les acheter","madera, piedra o comida por oro, o comprarlos","Holz, Stein oder Nahrung für Gold, oder sie kaufen","legno, pietra o cibo per oro, o comprarli","madeira, pedra ou comida por ouro, ou comprá-los"],"your castle: placed":["votre château : placé","tu castillo: colocado","deine Burg: platziert","il tuo castello: piazzato","o seu castelo: colocado"],"   Generating {0}%":["   Génération {0}%","   Generando {0}%","   Erzeuge {0}%","   Generazione {0}%","   A gerar {0}%"],"   {0} x {1} tiles":["   {0} x {1} cases","   {0} x {1} casillas","   {0} x {1} Felder","   {0} x {1} caselle","   {0} x {1} casas"]," - {0} sapling{1} growing":[" - {0} pousse(s) en croissance"," - {0} brote(s) creciendo"," - {0} Setzling(e) wachsen"," - {0} alberelli in crescita"," - {0} rebento(s) a crescer"]," - {0} villager{1} sheltering inside (Repair calls them out)":[" - {0} villageois à l'abri (Réparer les fait sortir)"," - {0} aldeano(s) refugiados (Reparar los hace salir)"," - {0} Dorfbewohner im Schutz (Reparieren ruft sie heraus)"," - {0} abitanti al riparo (Ripara li fa uscire)"," - {0} aldeão(ões) abrigados (Reparar chama-os)"],"+{0} gold":["+{0} or","+{0} oro","+{0} Gold","+{0} oro","+{0} ouro"],"A merchant caravan passes: +{0} gold, +{1} wood, +{2} stone":["Une caravane marchande passe : +{0} or, +{1} bois, +{2} pierre","Pasa una caravana de mercaderes: +{0} oro, +{1} madera, +{2} piedra","Eine Händlerkarawane zieht vorbei: +{0} Gold, +{1} Holz, +{2} Stein","Passa una carovana di mercanti: +{0} oro, +{1} legno, +{2} pietra","Passa uma caravana de mercadores: +{0} ouro, +{1} madeira, +{2} pedra"],"A peasant now works the {0}":["Un paysan travaille maintenant : {0}","Un campesino trabaja ahora: {0}","Ein Bauer bewirtschaftet jetzt: {0}","Un contadino ora lavora: {0}","Um camponês trabalha agora: {0}"],"All visible {0}s selected":["Tous les {0} visibles sélectionnés","Todos los {0} visibles seleccionados","Alle sichtbaren {0} ausgewählt","Tutti i {0} visibili selezionati","Todos os {0} visíveis selecionados"],"BLOOD MOON - a bigger, faster horde! {0}":["LUNE DE SANG - une horde plus grande et plus rapide ! {0}","LUNA DE SANGRE - ¡una horda mayor y más rápida! {0}","BLUTMOND - eine größere, schnellere Horde! {0}","LUNA DI SANGUE - un'orda più grande e veloce! {0}","LUA DE SANGUE - uma horda maior e mais rápida! {0}"],"Best: wave {0}":["Meilleur : vague {0}","Récord: oleada {0}","Bestwert: Welle {0}","Record: ondata {0}","Recorde: onda {0}"],"Best: wave {0}  -  {1} zombies slain":["Meilleur : vague {0}  -  {1} zombies tués","Récord: oleada {0}  -  {1} zombis abatidos","Bestwert: Welle {0}  -  {1} Zombies getötet","Record: ondata {0}  -  {1} zombi uccisi","Recorde: onda {0}  -  {1} zumbis abatidos"],"Bought 50 {0} for {1} gold":["Acheté 50 {0} pour {1} or","Comprado 50 {0} por {1} oro","50 {0} für {1} Gold gekauft","Comprato 50 {0} per {1} oro","Comprado 50 {0} por {1} ouro"],"Buy 50 {0}":["Acheter 50 {0}","Comprar 50 {0}","50 {0} kaufen","Compra 50 {0}","Comprar 50 {0}"],"Castle: shoots arrows at zombies in range, trains peasants and builds{0}":["Château : tire des flèches sur les zombies à portée, forme des paysans et construit{0}","Castillo: dispara flechas a los zombis cercanos, entrena campesinos y construye{0}","Burg: schießt Pfeile auf Zombies in Reichweite, bildet Bauern aus und baut{0}","Castello: scaglia frecce sugli zombi a portata, addestra contadini e costruisce{0}","Castelo: dispara flechas aos zumbis ao alcance, treina camponeses e constrói{0}"],"Co-op lobby - {0} | {1}: {2}":["Salon coop - {0} | {1} : {2}","Sala cooperativa - {0} | {1}: {2}","Koop-Raum - {0} | {1}: {2}","Stanza coop - {0} | {1}: {2}","Sala cooperativa - {0} | {1}: {2}"],"Connection error ({0}).":["Erreur de connexion ({0}).","Error de conexión ({0}).","Verbindungsfehler ({0}).","Errore di connessione ({0}).","Erro de ligação ({0})."],"Costs {0} gold":["Coûte {0} or","Cuesta {0} oro","Kostet {0} Gold","Costa {0} oro","Custa {0} ouro"],"Dawn - {0} villager{1} leave the castle and go back to work":["Aube - {0} villageois quittent le château et retournent au travail","Amanecer - {0} aldeano(s) salen del castillo y vuelven al trabajo","Morgengrauen - {0} Dorfbewohner verlassen die Burg und arbeiten weiter","Alba - {0} abitanti lasciano il castello e tornano al lavoro","Amanhecer - {0} aldeão(ões) saem do castelo e voltam ao trabalho"],"Dawn is coming - next wave in {0}":["L'aube approche - prochaine vague dans {0}","Se acerca el amanecer - próxima oleada en {0}","Der Morgen naht - nächste Welle in {0}","Sta per albeggiare - prossima ondata tra {0}","O amanhecer aproxima-se - próxima onda em {0}"],"Formation: {0}":["Formation : {0}","Formación: {0}","Formation: {0}","Formazione: {0}","Formação: {0}"],"Game loaded - wave {0}":["Partie chargée - vague {0}","Partida cargada - oleada {0}","Spiel geladen - Welle {0}","Partita caricata - ondata {0}","Jogo carregado - onda {0}"],"Group {0}":["Groupe {0}","Grupo {0}","Gruppe {0}","Gruppo {0}","Grupo {0}"],"Group {0} ({1})":["Groupe {0} ({1})","Grupo {0} ({1})","Gruppe {0} ({1})","Gruppo {0} ({1})","Grupo {0} ({1})"],"Group {0} is empty":["Le groupe {0} est vide","El grupo {0} está vacío","Gruppe {0} ist leer","Il gruppo {0} è vuoto","O grupo {0} está vazio"],"Group {0} saved ({1})":["Groupe {0} sauvegardé ({1})","Grupo {0} guardado ({1})","Gruppe {0} gespeichert ({1})","Gruppo {0} salvato ({1})","Grupo {0} guardado ({1})"],"Horde from {0}":["Horde venant de {0}","Horda desde {0}","Horde aus {0}","Orda da {0}","Horda de {0}"],"Horde {0} tiles":["Horde à {0} cases","Horda a {0} casillas","Horde {0} Felder entfernt","Orda a {0} caselle","Horda a {0} casas"],"In progress: {0}%":["En cours : {0} %","En curso: {0} %","Läuft: {0} %","In corso: {0}%","Em curso: {0}%"],"Joining room {0}...":["Connexion au salon {0}...","Entrando en la sala {0}...","Betrete Raum {0}...","Ingresso nella stanza {0}...","A entrar na sala {0}..."],"Load failed: {0}":["Échec du chargement : {0}","Error al cargar: {0}","Laden fehlgeschlagen: {0}","Caricamento fallito: {0}","Falha ao carregar: {0}"],"Map #{0}   Click to jump there":["Carte n°{0}   Cliquez pour y aller","Mapa n.º {0}   Haz clic para ir allí","Karte Nr. {0}   Klicken, um dorthin zu springen","Mappa n. {0}   Clicca per andarci","Mapa n.º {0}   Clique para ir até lá"],"Matchmaking error ({0}). Check your connection and try again.":["Erreur de mise en relation ({0}). Vérifiez votre connexion et réessayez.","Error de emparejamiento ({0}). Comprueba tu conexión e inténtalo de nuevo.","Vermittlungsfehler ({0}). Prüfe deine Verbindung und versuche es erneut.","Errore di abbinamento ({0}). Controlla la connessione e riprova.","Erro de emparelhamento ({0}). Verifique a ligação e tente de novo."],"NEW ZOMBIES: {0}":["NOUVEAUX ZOMBIES : {0}","NUEVOS ZOMBIS: {0}","NEUE ZOMBIES: {0}","NUOVI ZOMBI: {0}","NOVOS ZUMBIS: {0}"],"NEW ZOMBIES: {0}!  -  from {1}":["NOUVEAUX ZOMBIES : {0} !  -  depuis {1}","NUEVOS ZOMBIS: ¡{0}!  -  desde {1}","NEUE ZOMBIES: {0}!  -  aus {1}","NUOVI ZOMBI: {0}!  -  da {1}","NOVOS ZUMBIS: {0}!  -  de {1}"],"New buildings: {0}":["Nouveaux bâtiments : {0}","Edificios nuevos: {0}","Neue Gebäude: {0}","Nuovi edifici: {0}","Novos edifícios: {0}"],"Next {0}":["Suivant {0}","Siguiente {0}","Nächste {0}","Prossimo {0}","Seguinte {0}"],"Not enough {0}":["Pas assez de {0}","No hay suficiente {0}","Nicht genug {0}","Non abbastanza {0}","Não há {0} suficiente"],"Not enough {0} to repair the {1}":["Pas assez de {0} pour réparer : {1}","No hay suficiente {0} para reparar: {1}","Nicht genug {0} zum Reparieren: {1}","Non abbastanza {0} per riparare: {1}","Não há {0} suficiente para reparar: {1}"],"One research at a time: {0} is in progress":["Une recherche à la fois : {0} est en cours","Una investigación a la vez: {0} está en curso","Immer nur eine Forschung: {0} läuft","Una ricerca alla volta: {0} è in corso","Uma pesquisa de cada vez: {0} está em curso"],"Only one {0} per kingdom":["Un seul {0} par royaume","Solo un {0} por reino","Nur ein {0} pro Königreich","Solo un {0} per regno","Apenas um {0} por reino"],"Pattern colour: {0}":["Couleur du motif : {0}","Color del diseño: {0}","Musterfarbe: {0}","Colore del motivo: {0}","Cor do padrão: {0}"],"Place {0}":["Placer {0}","Colocar {0}","{0} platzieren","Piazza {0}","Colocar {0}"],"Place {0} - click a tile - right-click or Esc cancels":["Placer {0} - cliquez une case - clic droit ou Échap pour annuler","Colocar {0} - haz clic en una casilla - clic derecho o Esc cancela","{0} platzieren - klicke ein Feld - Rechtsklick oder Esc bricht ab","Piazza {0} - clicca una casella - tasto destro o Esc annulla","Colocar {0} - clique numa casa - botão direito ou Esc cancela"],"Raid - Wave {0}":["Raid - Vague {0}","Incursión - Oleada {0}","Überfall - Welle {0}","Incursione - Ondata {0}","Ataque - Onda {0}"],"Raid - Wave {0}  ({1} left)":["Raid - Vague {0}  ({1} restants)","Incursión - Oleada {0}  ({1} restantes)","Überfall - Welle {0}  ({1} übrig)","Incursione - Ondata {0}  ({1} rimasti)","Ataque - Onda {0}  ({1} restantes)"],"Repairing the {0}":["Réparation : {0}","Reparando: {0}","Repariere: {0}","Riparazione: {0}","A reparar: {0}"],"Repairing the {0} (uses resources)":["Réparation : {0} (coûte des ressources)","Reparando: {0} (usa recursos)","Repariere: {0} (kostet Rohstoffe)","Riparazione: {0} (usa risorse)","A reparar: {0} (usa recursos)"],"Researching Stonemasonry {0}%":["Recherche de la Maçonnerie {0} %","Investigando Cantería {0} %","Erforsche Steinmetzkunst {0} %","Ricerca della Muratura {0}%","A pesquisar Cantaria {0}%"],"Researching {0}":["Recherche : {0}","Investigando {0}","Erforsche {0}","Ricerca: {0}","A pesquisar {0}"],"Researching {0} {1}%":["Recherche : {0} {1} %","Investigando {0} {1} %","Erforsche {0} {1} %","Ricerca: {0} {1}%","A pesquisar {0} {1}%"],"Researching {0}...":["Recherche : {0}...","Investigando {0}...","Erforsche {0}...","Ricerca: {0}...","A pesquisar {0}..."],"Room {0}":["Salon {0}","Sala {0}","Raum {0}","Stanza {0}","Sala {0}"],"Room {0} not found. Check the code with the host.":["Salon {0} introuvable. Vérifiez le code avec l'hôte.","Sala {0} no encontrada. Comprueba el código con el anfitrión.","Raum {0} nicht gefunden. Prüfe den Code mit dem Host.","Stanza {0} non trovata. Controlla il codice con l'host.","Sala {0} não encontrada. Verifique o código com o anfitrião."],"Rotated {0} deg":["Tourné de {0}°","Girado {0}°","Um {0}° gedreht","Ruotato di {0}°","Rodado {0}°"],"Save failed: {0}":["Échec de la sauvegarde : {0}","Error al guardar: {0}","Speichern fehlgeschlagen: {0}","Salvataggio fallito: {0}","Falha ao guardar: {0}"],"Sell 50 {0}":["Vendre 50 {0}","Vender 50 {0}","50 {0} verkaufen","Vendi 50 {0}","Vender 50 {0}"],"Sold 50 {0} for {1} gold":["Vendu 50 {0} pour {1} or","Vendido 50 {0} por {1} oro","50 {0} für {1} Gold verkauft","Venduto 50 {0} per {1} oro","Vendido 50 {0} por {1} ouro"],"Sound {0}":["Son {0}","Sonido {0}","Ton {0}","Suono {0}","Som {0}"],"Sound: {0}":["Son : {0}","Sonido: {0}","Ton: {0}","Suono: {0}","Som: {0}"],"Squad: {0} / 10 soldiers":["Escouade : {0} / 10 soldats","Escuadra: {0} / 10 soldados","Trupp: {0} / 10 Soldaten","Squadra: {0} / 10 soldati","Esquadra: {0} / 10 soldados"],"The code {0} is already used by another room: choose a different one.":["Le code {0} est déjà utilisé par un autre salon : choisissez-en un autre.","El código {0} ya lo usa otra sala: elige otro.","Der Code {0} wird schon von einem anderen Raum benutzt: wähle einen anderen.","Il codice {0} è già usato da un'altra stanza: scegline un altro.","O código {0} já é usado por outra sala: escolha outro."],"The horde turns on {0}":["La horde se tourne vers {0}","La horda se vuelve contra {0}","Die Horde wendet sich gegen {0}","L'orda si rivolge contro {0}","A horda vira-se contra {0}"],"The {0}":["Le {0}","El {0}","Die {0}","Il {0}","O {0}"],"Version mismatch: you run {0}, {1} runs {2}. Use the same version or the game will desync.":["Versions différentes : vous avez {0}, {1} a {2}. Utilisez la même version, sinon la partie se désynchronisera.","Versiones distintas: tienes {0}, {1} tiene {2}. Usa la misma versión o la partida se desincronizará.","Versionen passen nicht: du hast {0}, {1} hat {2}. Nutzt dieselbe Version, sonst läuft das Spiel auseinander.","Versioni diverse: hai {0}, {1} ha {2}. Usate la stessa versione o la partita si desincronizzerà.","Versões diferentes: tem {0}, {1} tem {2}. Usem a mesma versão ou o jogo vai dessincronizar."],"WAVE {0}":["VAGUE {0}","OLEADA {0}","WELLE {0}","ONDATA {0}","ONDA {0}"],"WAVE {0} BEATEN":["VAGUE {0} VAINCUE","OLEADA {0} SUPERADA","WELLE {0} BESIEGT","ONDATA {0} SUPERATA","ONDA {0} VENCIDA"],"Wait: {0} first":["Attendre : {0} d'abord","Espera: primero {0}","Warten: zuerst {0}","Attendi: prima {0}","Esperar: primeiro {0}"],"Wave called early: +{0} gold":["Vague appelée en avance : +{0} or","Oleada adelantada: +{0} oro","Welle früh gerufen: +{0} Gold","Ondata chiamata in anticipo: +{0} oro","Onda chamada mais cedo: +{0} ouro"],"Wave {0}":["Vague {0}","Oleada {0}","Welle {0}","Ondata {0}","Onda {0}"],"Waves survived: {0}":["Vague {0} - {1}","Oleada {0} - {1}","Welle {0} - {1}","Ondata {0} - {1}","Onda {0} - {1}"],"Waves survived: {0}    Zombies slain: {1}    Best: wave {2}":["Vagues survécues : {0}    Zombies tués : {1}    Meilleur : vague {2}","Oleadas superadas: {0}    Zombis abatidos: {1}    Récord: oleada {2}","Überlebte Wellen: {0}    Getötete Zombies: {1}    Bestwert: Welle {2}","Ondate superate: {0}    Zombi uccisi: {1}    Record: ondata {2}","Ondas sobrevividas: {0}    Zumbis abatidos: {1}    Recorde: onda {2}"],"You get {0} gold":["Vous obtenez {0} or","Obtienes {0} oro","Du erhältst {0} Gold","Ottieni {0} oro","Recebe {0} ouro"],"You need 50 {0} to sell":["Il vous faut 50 {0} à vendre","Necesitas 50 {0} para vender","Du brauchst 50 {0} zum Verkaufen","Ti servono 50 {0} da vendere","Precisa de 50 {0} para vender"],"You need {0}":["Il vous faut {0}","Necesitas {0}","Du brauchst {0}","Ti serve {0}","Precisa de {0}"],"You need {0} gold to buy 50 {1}":["Il vous faut {0} or pour acheter 50 {1}","Necesitas {0} oro para comprar 50 {1}","Du brauchst {0} Gold, um 50 {1} zu kaufen","Ti servono {0} oro per comprare 50 {1}","Precisa de {0} ouro para comprar 50 {1}"],"Your {0}":["Votre {0}","Tu {0}","Dein {0}","Il tuo {0}","O seu {0}"],"Your {0} is under attack!":["Votre {0} est attaqué !","¡Tu {0} está siendo atacado!","Dein {0} wird angegriffen!","Il tuo {0} è sotto attacco!","O seu {0} está a ser atacado!"],"{0} (host)":["{0} (hôte)","{0} (anfitrión)","{0} (Host)","{0} (host)","{0} (anfitrião)"],"{0} cannot be reached by your peasants":["{0} : inaccessible pour vos paysans","{0}: no es accesible para tus campesinos","{0} ist für deine Bauern unerreichbar","{0} non è raggiungibile dai tuoi contadini","{0} não é acessível aos seus camponeses"],"{0} colours":["Couleurs {0}","Colores {0}","{0}-Farben","Colori {0}","Cores {0}"],"{0} founds a new settlement":["{0} fonde une nouvelle colonie","{0} funda un nuevo asentamiento","{0} gründet eine neue Siedlung","{0} fonda un nuovo insediamento","{0} funda um novo povoado"],"{0} founds {1}":["{0} fonde {1}","{0} funda {1}","{0} gründet {1}","{0} fonda {1}","{0} funda {1}"],"{0} has fallen to the horde":["{0} est tombé face à la horde","{0} ha caído ante la horda","{0} ist der Horde zum Opfer gefallen","{0} è caduto per mano dell'orda","{0} caiu perante a horda"],"{0} idle":["{0} inactif(s)","{0} inactivo(s)","{0} untätig","{0} inattivi","{0} inativo(s)"],"{0} idle peasant{1} selected":["{0} paysan(s) inactif(s) sélectionné(s)","{0} campesino(s) inactivo(s) seleccionado(s)","{0} untätige(r) Bauer/Bauern ausgewählt","{0} contadini inattivi selezionati","{0} camponês(es) inativo(s) selecionado(s)"],"{0} inside":["{0} à l'intérieur","{0} dentro","{0} drinnen","{0} dentro","{0} lá dentro"],"{0} is full":["{0} est plein","{0} está lleno","{0} ist voll","{0} è pieno","{0} está cheio"],"{0} is not damaged":["{0} n'est pas endommagé","{0} no está dañado","{0} ist nicht beschädigt","{0} non è danneggiato","{0} não está danificado"],"{0} is too expensive":["{0} est trop cher","{0} es demasiado caro","{0} ist zu teuer","{0} è troppo costoso","{0} é demasiado caro"],"{0} joined the lobby!":["{0} a rejoint le salon !","¡{0} se unió a la sala!","{0} ist dem Raum beigetreten!","{0} è entrato nella stanza!","{0} entrou na sala!"],"{0} needs {1}":["{0} nécessite {1}","{0} requiere {1}","{0} benötigt {1}","{0} richiede {1}","{0} requer {1}"],"{0} peasants selected":["{0} paysans sélectionnés","{0} campesinos seleccionados","{0} Bauern ausgewählt","{0} contadini selezionati","{0} camponeses selecionados"],"{0} peasant{1}":["{0} paysan(s)","{0} campesino(s)","{0} Bauer/Bauern","{0} contadini","{0} camponês(es)"],"{0} peasant{1} sent to repair the {2} (uses resources)":["{0} paysan(s) envoyé(s) réparer : {2} (coûte des ressources)","{0} campesino(s) enviado(s) a reparar: {2} (usa recursos)","{0} Bauer/Bauern zum Reparieren geschickt: {2} (kostet Rohstoffe)","{0} contadini mandati a riparare: {2} (usa risorse)","{0} camponês(es) enviado(s) para reparar: {2} (usa recursos)"],"{0} peasant{1} sent to repair the {2}":["{0} paysan(s) envoyé(s) réparer : {2}","{0} campesino(s) enviado(s) a reparar: {2}","{0} Bauer/Bauern zum Reparieren geschickt: {2}","{0} contadini mandati a riparare: {2}","{0} camponês(es) enviado(s) para reparar: {2}"],"{0} placed their castle":["{0} a placé son château","{0} ha colocado su castillo","{0} hat seine Burg platziert","{0} ha posizionato il castello","{0} colocou o seu castelo"],"{0} promoted: {1}":["{0} promu : {1}","{0} ascendido: {1}","{0} befördert: {1}","{0} promosso: {1}","{0} promovido: {1}"],"{0} rebuilds its castle in stone":["{0} reconstruit son château en pierre","{0} reconstruye su castillo en piedra","{0} baut seine Burg in Stein neu","{0} ricostruisce il castello in pietra","{0} reconstrói o seu castelo em pedra"],"{0} rotated":["{0} tourné","{0} girado","{0} gedreht","{0} ruotato","{0} rodado"],"{0} started Stonemasonry (shared)":["{0} a lancé la Maçonnerie (partagée)","{0} inició la Cantería (compartida)","{0} hat Steinmetzkunst gestartet (geteilt)","{0} ha avviato la Muratura (condivisa)","{0} iniciou a Cantaria (partilhada)"],"{0} started {1}":["{0} a lancé {1}","{0} inició {1}","{0} hat {1} gestartet","{0} ha avviato {1}","{0} iniciou {1}"],"{0} started {1} (shared)":["{0} a lancé {1} (partagé)","{0} inició {1} (compartido)","{0} hat {1} gestartet (geteilt)","{0} ha avviato {1} (condiviso)","{0} iniciou {1} (partilhado)"],"{0} types":["{0} types","{0} tipos","{0} Typen","{0} tipi","{0} tipos"],"{0} walking to the {1}":["{0} en route vers : {1}","{0} caminando hacia: {1}","{0} auf dem Weg zu: {1}","{0} in cammino verso: {1}","{0} a caminho de: {1}"],"{0}: {1} / {2} HP{3}":["{0} : {1} / {2} PV{3}","{0}: {1} / {2} PV{3}","{0}: {1} / {2} LP{3}","{0}: {1} / {2} PS{3}","{0}: {1} / {2} PV{3}"],"Language":["Langue","Idioma","Sprache","Lingua","Idioma"],"Choose your language":["Choisissez votre langue","Elige tu idioma","Wähle deine Sprache","Scegli la lingua","Escolha o seu idioma"],"Wave":["Vague","Oleada","Welle","Ondata","Onda"]},TRX=new Map(),TRT=[],TRC=new Map();
/* texts added in v88 */
Object.assign(TRD,{"Co-op: resynchronizing...": ["Coop : resynchronisation...", "Coop: resincronizando...", "Koop: wird neu synchronisiert...", "Coop: risincronizzazione...", "Coop: a ressincronizar..."], "Resynchronized with your partner": ["Resynchronisé avec votre partenaire", "Resincronizado con tu compañero", "Mit deinem Partner neu synchronisiert", "Risincronizzato con il compagno", "Ressincronizado com o parceiro"]});
/* texts added in v87 */
Object.assign(TRD,{"Your castles would overlap: move a little away from your partner": ["Vos châteaux se chevaucheraient : éloignez-vous un peu de votre partenaire", "Vuestros castillos se solaparían: aléjate un poco de tu compañero", "Eure Burgen würden sich überschneiden: rück ein Stück von deinem Partner weg", "I vostri castelli si sovrapporrebbero: allontanati un po' dal compagno", "Os vossos castelos ficariam sobrepostos: afaste-se um pouco do parceiro"], "{0} moved their castle": ["{0} a déplacé son château", "{0} ha movido su castillo", "{0} hat seine Burg versetzt", "{0} ha spostato il castello", "{0} mudou o seu castelo"], " moved their castle": [" a déplacé son château", " ha movido su castillo", " hat seine Burg versetzt", " ha spostato il castello", " mudou o seu castelo"], "Turn castle [{0}]": ["Tourner le château [{0}]", "Girar castillo [{0}]", "Burg drehen [{0}]", "Ruota castello [{0}]", "Rodar castelo [{0}]"], "Quit game": ["Quitter le jeu", "Salir de la partida", "Spiel verlassen", "Esci dalla partita", "Sair da partida"], "Exit to desktop": ["Fermer le jeu", "Salir al escritorio", "Zum Desktop", "Esci al desktop", "Sair para o ambiente de trabalho"], "range {0} tiles": ["portée {0} cases", "alcance {0} casillas", "Reichweite {0} Felder", "portata {0} caselle", "alcance {0} casas"], "All your {0}s selected ({1})": ["Tous vos {0}s sélectionnés ({1})", "Todos tus {0}s seleccionados ({1})", "Alle deine {0}s ausgewählt ({1})", "Tutti i tuoi {0} selezionati ({1})", "Todos os seus {0}s selecionados ({1})"], "Upgrade turns every wooden one to stone": ["Améliorer les passe tous en pierre s'ils sont en bois", "Mejorar convierte en piedra todos los de madera", "Ausbauen macht alle hölzernen zu Stein", "Migliora rende di pietra tutti quelli di legno", "Melhorar transforma em pedra todos os de madeira"], "Different versions ({0} and {1}): both players must run the same one": ["Versions différentes ({0} et {1}) : les deux joueurs doivent avoir la même", "Versiones distintas ({0} y {1}): los dos jugadores deben tener la misma", "Unterschiedliche Versionen ({0} und {1}): beide Spieler brauchen dieselbe", "Versioni diverse ({0} e {1}): entrambi i giocatori devono avere la stessa", "Versões diferentes ({0} e {1}): os dois jogadores têm de ter a mesma"], "restart the launcher or reload the page": ["relancez le lanceur ou rechargez la page", "reinicia el lanzador o recarga la página", "starte den Launcher neu oder lade die Seite neu", "riavvia il launcher o ricarica la pagina", "reinicie o iniciador ou recarregue a página"]});
for(const k in TRD){if(k.indexOf('{0}')<0){TRX.set(k,TRD[k]);continue}const ids=[];const re=k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\d)\}/g,(m,d)=>{ids.push(+d);return '(.*?)'});if(new Set(ids).size!==ids.length)continue;
 TRT.push({re:new RegExp('^'+re+'$'),ids,v:TRD[k],w:k.replace(/\{\d\}/g,'').length})}
TRT.sort((a,b)=>b.w-a.w);
function L(s){if(!LANG||typeof s!=='string'||!s)return s;let r=TRC.get(s);if(r!==undefined)return r;r=tr0(s);if(TRC.size>8000)TRC.clear();TRC.set(s,r);return r}
function tr0(s){const li=LANG-1;let e=TRX.get(s);if(e&&e[li])return e[li];
 const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(m[2]!==s&&m[2]){e=TRX.get(m[2]);if(e&&e[li])return m[1]+e[li]+m[3]}
 for(const t of TRT){const mm=t.re.exec(s);if(!mm||!t.v[li])continue;const val={};t.ids.forEach((d,i)=>{val[d]=mm[i+1]});return t.v[li].replace(/\{(\d)\}/g,(x,d)=>{const v=val[+d];return v===undefined?'':(/^[\d.,%+\- ]*$/.test(v)?v:L(v))})}
 for(const sep of['  -  ',' - ',' | ','   ']){if(s.indexOf(sep)>0){const P=s.split(sep),T=P.map(L);if(T.some((x,i)=>x!==P[i]))return T.join(sep)}}
 return s}
function setLang(i){LANG=i;TRC.clear();TWM.clear();try{localStorage.setItem('dk_lang',i)}catch(e){}try{i18nDom()}catch(e){}titleDirty=true}
/* the HTML parts (co-op lobby) follow too */
let I18NO=null;function i18nDom(){const roots=[...document.querySelectorAll('body > div, body > form')];
 const fix=n=>{if(n.nodeType===3){const v=n.nodeValue;if(v!==n.__tr)n.__en=v;const en=n.__en,tt=en.trim(),out=tt?en.replace(tt,L(tt)):en;n.__tr=out;if(out!==v)n.nodeValue=out}
  else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'&&n.tagName!=='CANVAS'){if(n.placeholder!==undefined&&n.placeholder){if(n.placeholder!==n.__pt)n.__ph=n.placeholder;n.__pt=n.placeholder=L(n.__ph)}for(const c of n.childNodes)fix(c)}};
 for(const r of roots)fix(r);
 if(!I18NO&&typeof MutationObserver!=='undefined'){I18NO=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else for(const a of m.addedNodes)fix(a)}});for(const r of roots)I18NO.observe(r,{subtree:true,childList:true,characterData:true})}}
/* little flags drawn in code */
function drawFlag(code,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();const R_=(c,a,b,cc,d)=>{ctx.fillStyle=c;ctx.fillRect(x+a*w,y+b*h,cc*w,d*h)};
 if(code==='fr'){R_('#0055a4',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ef4135',2/3,0,1/3,1)}
 else if(code==='it'){R_('#009246',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ce2b37',2/3,0,1/3,1)}
 else if(code==='de'){R_('#000',0,0,1,1/3);R_('#dd0000',0,1/3,1,1/3);R_('#ffce00',0,2/3,1,1/3)}
 else if(code==='es'){R_('#aa151b',0,0,1,1);R_('#f1bf00',0,.25,1,.5)}
 else if(code==='pt'){R_('#046a38',0,0,.4,1);R_('#da291c',.4,0,.6,1);ctx.fillStyle='#ffe000';ctx.beginPath();ctx.arc(x+.4*w,y+.5*h,h*.22,0,6.283);ctx.fill()}
 else{R_('#012169',0,0,1,1);ctx.lineCap='butt';const ln=(lw,c,ax,ay,bx,by)=>{ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x+ax*w,y+ay*h);ctx.lineTo(x+bx*w,y+by*h);ctx.stroke()};
  ln(h*.2,'#fff',0,0,1,1);ln(h*.2,'#fff',1,0,0,1);ln(h*.08,'#c8102e',0,0,1,1);ln(h*.08,'#c8102e',1,0,0,1);R_('#fff',.42,0,.16,1);R_('#fff',0,.36,1,.28);R_('#c8102e',.45,0,.1,1);R_('#c8102e',0,.4,1,.2)}
 ctx.restore();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}
let langOpen=false;
function langBtn(x,y,w,h,i,fn,sel){uiBtn(x,y,w,h,sel?GRN:BTN,sel?GRNH:BTNH,fn,null,(X,Y,W2,H2)=>{const fh=Math.min(H2-6,13),fw=fh*1.5;drawFlag(LANGS[i][1],X+6,Y+(H2-fh)/2,fw,fh);T_(LANGS[i][0],X+12+fw,Y+(H2-9)/2+.5,'#fff',1)})}
function drawLang(UW,UH,cx){const W=Math.min(UW-12,360),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),H=Math.min(UH-16,62+LANGS.length*26+30),Y=Math.max(8,(UH-H)/2);frame(X,Y,W,H,PAN,6);TTL(L('Choose your language'),X+10,Y+7,1.3);
 LANGS.forEach((l,i)=>langBtn(X+12,Y+34+i*26,W-24,22,i,()=>{setLang(i);langOpen=false},LANG===i));
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{langOpen=false},null,.9)}
const tw=(s,sc)=>{const f=fontOf(9*(sc||1));ctx.font=f;s=L(String(s));const k=f+'\u0001'+s;let v=TWM.get(k);if(v===undefined){v=ctx.measureText(s).width;if(TWM.size>3000)TWM.clear();TWM.set(k,v)}return v};
function T_(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);ctx.textBaseline='top';ctx.textAlign='left';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(s,x+.5*sc,y+.9*sc);ctx.fillStyle=col||'#fbf1de';ctx.fillText(s,x,y)}
function TC(s,cx,y,col,sc){T_(s,cx-tw(s,sc)/2,y,col,sc)}
const TTS=sc=>Math.round(9*sc*1.25*.86);
function TTL(s,x,y,sc,al){s=L(String(s));const S=TTS(sc);ctx.font='700 '+S+'px '+FFT;ctx.textBaseline='top';ctx.textAlign=al||'left';ctx.fillStyle='rgba(4,3,8,.82)';ctx.fillText(s,x+Math.max(1,S*.05),y+Math.max(1,S*.08));
 const g=ctx.createLinearGradient(0,y,0,y+S);g.addColorStop(0,'#fff5d2');g.addColorStop(.47,'#f2c862');g.addColorStop(.53,'#dca23e');g.addColorStop(1,'#a8721f');ctx.fillStyle=g;ctx.fillText(s,x,y);ctx.textAlign='left'}
function twH(s,sc){ctx.font='700 '+TTS(sc)+'px '+FFT;return ctx.measureText(L(String(s))).width}
const PAN=['#1d2530','#b8954c','#0a0d12'],BTN=['#263242','#c9a24f','#0b0f14'],BTNH=['#2c4a66','#86dcff','#0c141c'],BTNX=['#171d25','#4c4535','#0a0c10'],TABA=['#1e6a74','#7fe6e6','#0a2a2e'],GRN=['#1d6670','#79dede','#0a272b'],GRNH=['#278692','#a8f6f6','#0e3a40'],RDB=['#7a2630','#e0707a','#3a0e14'];
function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
const SHDM=new Map(),shd=(c,k)=>{const key=c+'|'+k;let r=SHDM.get(key);if(r===undefined){const h=hex(c);r='#'+h.map(v=>Math.max(0,Math.min(255,Math.round(k>=0?v+(255-v)*k:v*(1+k)))).toString(16).padStart(2,'0')).join('');if(SHDM.size>600)SHDM.clear();SHDM.set(key,r)}return r};
const LGC=new Map();function lgc(k,y,h,a,b,c,d,e,f){k+='|'+y+'|'+h;let g=LGC.get(k);if(g===undefined){g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(a,b);g.addColorStop(c,d);if(e!==undefined)g.addColorStop(e,f);if(LGC.size>900)LGC.clear();LGC.set(k,g)}return g}
function arcDia(cx,cy,r,c){ctx.beginPath();ctx.moveTo(cx,cy-r-1);ctx.lineTo(cx+r+1,cy);ctx.lineTo(cx,cy+r+1);ctx.lineTo(cx-r-1,cy);ctx.closePath();ctx.fillStyle='#07060b';ctx.fill();
 const g=ctx.createLinearGradient(0,cy-r,0,cy+r);g.addColorStop(0,shd(c,.5));g.addColorStop(.5,c);g.addColorStop(1,shd(c,-.5));ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx+r,cy);ctx.lineTo(cx,cy+r);ctx.lineTo(cx-r,cy);ctx.closePath();ctx.fillStyle=g;ctx.fill()}
function arcDeco(x,y,w,h,c,full){
 if(full){const L=Math.round(Math.min(14,w*.1,h*.28)),i=3;ctx.fillStyle=c;ctx.globalAlpha=.5;
  ctx.fillRect(x+i,y+i,L,1);ctx.fillRect(x+i,y+i,1,L);ctx.fillRect(x+w-i-L,y+i,L,1);ctx.fillRect(x+w-i-1,y+i,1,L);
  ctx.fillRect(x+i,y+h-i-1,L,1);ctx.fillRect(x+i,y+h-i-L,1,L);ctx.fillRect(x+w-i-L,y+h-i-1,L,1);ctx.fillRect(x+w-i-1,y+h-i-L,1,L);ctx.globalAlpha=1;
  if(w>=150){const m=Math.round(x+w/2);ctx.fillStyle=c;ctx.fillRect(m-24,y-1,16,1);ctx.fillRect(m+8,y-1,16,1);ctx.fillRect(m-24,y+h,16,1);ctx.fillRect(m+8,y+h,16,1);arcDia(m,y,3.4,c);arcDia(m,y+h,2.6,c)}}
 const r=2.4;arcDia(x+.5,y+.5,r,c);arcDia(x+w-.5,y+.5,r,c);arcDia(x+.5,y+h-.5,r,c);arcDia(x+w-.5,y+h-.5,r,c)}
function frame(x,y,w,h,p,r){if(p===SLOT||p===SLOTH||p===SLOTX){mcSlot(x,y,w,h,p);return}if(p===TIPP){mcTip(x,y,w,h);return}
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 if(p===CHAT){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x,y,w,h);
  if(y<0&&w>200){const gl=ctx.createLinearGradient(x,0,x+w,0);gl.addColorStop(0,'rgba(214,176,96,0)');gl.addColorStop(.08,'rgba(214,176,96,.9)');gl.addColorStop(.92,'rgba(214,176,96,.9)');gl.addColorStop(1,'rgba(214,176,96,0)');ctx.fillStyle='rgba(5,4,8,.75)';ctx.fillRect(x,y+h,w,1);ctx.fillStyle=gl;ctx.fillRect(x,y+h-1,w,1)}return}
  const Rd=Math.max(1,Math.min(4.5,h/4,w/4)),big=h>40;
  ctx.fillStyle=big?'rgba(0,0,0,.42)':'rgba(0,0,0,.34)';rr(x+(big?2:1),y+(big?3:2),w,h,Rd+1);ctx.fill();
  ctx.fillStyle='#07060b';rr(x-1,y-1,w+2,h+2,Rd+1);ctx.fill();
  ctx.fillStyle=lgc('f'+p[0],y,h,0,shd(p[0],.16),.5,p[0],1,shd(p[0],-.38));rr(x,y,w,h,Rd);ctx.fill();
  if(!big){ctx.fillStyle=lgc('gl',y,h*.55,0,'rgba(255,255,255,.13)',1,'rgba(255,255,255,0)');rr(x+1,y+1,w-2,h*.5,Math.max(0,Rd-1));ctx.fill()}
  else{const vg=ctx.createRadialGradient(x+w/2,y+h*.35,Math.min(w,h)*.2,x+w/2,y+h*.5,Math.max(w,h)*.75);vg.addColorStop(0,'rgba(255,240,210,.05)');vg.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=vg;rr(x,y,w,h,Rd);ctx.fill()}
  if(p===BTNH||p===GRNH||p===TABA){ctx.fillStyle=lgc('h',y,h,0,'rgba(134,220,255,0)',1,'rgba(134,220,255,.24)');rr(x,y,w,h,Rd);ctx.fill();ctx.save();ctx.shadowColor='rgba(134,220,255,.55)';ctx.shadowBlur=6;ctx.strokeStyle='rgba(134,220,255,.5)';ctx.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);ctx.stroke();ctx.restore()}
  const rim=p===MAPF?'#c9a24f':p[1];ctx.strokeStyle=lgc('r'+rim,y,h,0,shd(rim,.5),.5,rim,1,shd(rim,-.5));ctx.lineWidth=1.25;rr(x+.6,y+.6,w-1.2,h-1.2,Rd);ctx.stroke();
  if(h>6){ctx.strokeStyle='rgba(255,238,200,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+Rd+1,y+1.9);ctx.lineTo(x+w-Rd-1,y+1.9);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.moveTo(x+Rd+1,y+h-1.9);ctx.lineTo(x+w-Rd-1,y+h-1.9);ctx.stroke()}
 if((p===PAN||p===INV||p===MAPF)&&w>=60&&h>=30)arcDeco(x,y,w,h,rim,p===PAN&&h>=60)}
function gold(x,y,w,h,r){const Rd=Math.max(1,Math.min(3.5,w/5,h/5));ctx.save();ctx.shadowColor='rgba(255,214,120,.75)';ctx.shadowBlur=6;ctx.lineWidth=1.8;ctx.strokeStyle='#f6d98a';rr(x+.9,y+.9,w-1.8,h-1.8,Rd);ctx.stroke();ctx.restore()}
/* ---- vector icons (16x16 design space, drawn at any size) ---- */
const ICO_N=160,ICO_RT=320;
const ICN=fn=>{const S=12,c=cvs(16*S,16*S),g=c.getContext('2d');g.scale(S,S);g.lineJoin='round';g.lineCap='round';fn(g);const o=arcIcon(c,ICO_N);o.__vec=true;return o};
/* ---- Minecraft GUI kit: inventory panel, slots, tooltips, chat bars, pixel icons, hearts, dirt ---- */
const INV=['#1b2230','#c9a24f','#06080c'],SLOT=['#8b8b8b'],SLOTH=['#8b8b8b','h'],SLOTX=['#6d6d6d','x'],TIPP=['tip'],CHAT=['chat'],MAPF=['#d9c393','#f4e6c0','#8a6a3a'];
/* Arcane icon finish: smooth 64 px, warm light from the top-left, cool shade bottom-right, black ink outline */
function arcIcon(src,N){N=N||ICO_N;const pad=Math.round(N*.1),w=N-2*pad,a=cvs(N,N),ga=a.getContext('2d');ga.imageSmoothingEnabled=true;ga.imageSmoothingQuality='high';ga.drawImage(src,pad,pad,w,w);
 ga.globalCompositeOperation='source-atop';const gr=ga.createLinearGradient(0,0,N,N);gr.addColorStop(0,'rgba(255,238,196,.26)');gr.addColorStop(.48,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(10,18,48,.34)');ga.fillStyle=gr;ga.fillRect(0,0,N,N);
 const sp=ga.createRadialGradient(N*.32,N*.26,0,N*.32,N*.26,N*.42);sp.addColorStop(0,'rgba(255,250,230,.16)');sp.addColorStop(1,'rgba(255,250,230,0)');ga.fillStyle=sp;ga.fillRect(0,0,N,N);ga.globalCompositeOperation='source-over';
 const sil=(col)=>{const k=cvs(N,N),gk=k.getContext('2d');gk.drawImage(a,0,0);gk.globalCompositeOperation='source-in';gk.fillStyle=col;gk.fillRect(0,0,N,N);return k};
 /* rim light: the silhouette minus itself shifted toward the light, kept inside the shape */
 const rim=cvs(N,N),gr2=rim.getContext('2d'),rr2=Math.max(1,N/90);gr2.drawImage(sil('rgba(255,244,214,.55)'),0,0);gr2.globalCompositeOperation='destination-out';gr2.drawImage(a,rr2*1.4,rr2*1.4);gr2.globalCompositeOperation='destination-in';gr2.drawImage(a,0,0);
 const ink=sil('#0b0810'),o=cvs(N,N),go=o.getContext('2d'),r=Math.max(1.6,N/30);
 try{go.filter='blur('+(N/40).toFixed(1)+'px)';go.globalAlpha=.45;go.drawImage(ink,N/36,N/26);go.filter='none';go.globalAlpha=1}catch(e){}
 for(let i=0;i<24;i++){const t=i/24*6.2832;go.drawImage(ink,Math.cos(t)*r,Math.sin(t)*r)}go.drawImage(a,0,0);go.drawImage(rim,0,0);o.__hd=true;return o}
/* pixel art -> smooth shapes: two EPX passes (16 -> 64 px) before the painted finish */
function epx(src){const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data,o=cvs(w*2,h*2),go=o.getContext('2d'),im=go.createImageData(w*2,h*2),D=im.data;
 const P=(x,y)=>{x=x<0?0:x>=w?w-1:x;y=y<0?0:y>=h?h-1:y;const i=(y*w+x)*4;return((d[i]<<24)|(d[i+1]<<16)|(d[i+2]<<8)|d[i+3])>>>0},put=(x,y,v)=>{const i=(y*w*2+x)*4;D[i]=v>>>24;D[i+1]=(v>>>16)&255;D[i+2]=(v>>>8)&255;D[i+3]=v&255};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=P(x,y),A=P(x,y-1),B=P(x+1,y),C=P(x-1,y),E=P(x,y+1);put(2*x,2*y,C===A&&C!==E&&A!==B?A:p);put(2*x+1,2*y,A===B&&A!==C&&B!==E?B:p);put(2*x,2*y+1,E===C&&E!==B&&C!==A?C:p);put(2*x+1,2*y+1,B===E&&B!==A&&E!==C?E:p)}
 go.putImageData(im,0,0);return o}

function mcSlot(x,y,w,h,p){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const X=p===SLOTX,H=p===SLOTH,Rd=Math.max(1,Math.min(3.5,w/5,h/5));
 ctx.fillStyle='rgba(0,0,0,.36)';rr(x+1,y+2,w,h,Rd+1);ctx.fill();ctx.fillStyle='#07060b';rr(x-1,y-1,w+2,h+2,Rd+1);ctx.fill();
 ctx.fillStyle=X?lgc('sx',y,h,0,'#222a35',1,'#11151b'):H?lgc('sh',y,h,0,'#41698a',.55,'#28455e',1,'#183044'):lgc('sn',y,h,0,'#3b526b',.55,'#26364a',1,'#161f2b');rr(x,y,w,h,Rd);ctx.fill();
 if(!X){ctx.fillStyle=lgc('sg',y,h*.5,0,'rgba(255,255,255,.12)',1,'rgba(255,255,255,0)');rr(x+1,y+1,w-2,h*.48,Math.max(0,Rd-1));ctx.fill()}
 const ig=ctx.createRadialGradient(x+w/2,y+h*.45,Math.min(w,h)*.15,x+w/2,y+h*.5,Math.max(w,h)*.7);ig.addColorStop(0,'rgba(0,0,0,0)');ig.addColorStop(1,'rgba(0,0,0,.25)');ctx.fillStyle=ig;rr(x,y,w,h,Rd);ctx.fill();
 if(H){const gg=ctx.createRadialGradient(x+w/2,y+h*.42,1,x+w/2,y+h*.42,w*.75);gg.addColorStop(0,'rgba(120,220,255,.3)');gg.addColorStop(1,'rgba(120,220,255,0)');ctx.fillStyle=gg;rr(x,y,w,h,Rd);ctx.fill()}
 ctx.save();if(H){ctx.shadowColor='rgba(134,220,255,.7)';ctx.shadowBlur=7}
 ctx.strokeStyle=X?lgc('bx',y,h,0,'#5a5140',1,'#221e16'):H?lgc('bh',y,h,0,'#e6faff',.5,'#86dcff',1,'#2d779c'):lgc('bn',y,h,0,'#fbe6a6',.45,'#d0a952',1,'#5a4520');ctx.lineWidth=1.3;rr(x+.65,y+.65,w-1.3,h-1.3,Rd);ctx.stroke();ctx.restore();
 if(h>8){ctx.strokeStyle='rgba(255,238,200,.13)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+Rd+1,y+2);ctx.lineTo(x+w-Rd-1,y+2);ctx.stroke()}}
function mcTip(x,y,w,h){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const Rd=Math.min(4,h/3);
 ctx.fillStyle='rgba(0,0,0,.45)';rr(x+2,y+3,w,h,Rd+1);ctx.fill();const bg=ctx.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,'rgba(22,28,42,.97)');bg.addColorStop(1,'rgba(8,10,16,.97)');ctx.fillStyle=bg;rr(x,y,w,h,Rd);ctx.fill();
 const g=ctx.createLinearGradient(0,y+1,0,y+h-1);g.addColorStop(0,'rgba(246,214,130,.95)');g.addColorStop(1,'rgba(150,110,40,.9)');ctx.strokeStyle=g;ctx.lineWidth=1.2;rr(x+1.1,y+1.1,w-2.2,h-2.2,Rd);ctx.stroke();
 if(w>=50){arcDia(x+1,y+1,1.8,'#d8b060');arcDia(x+w-1,y+1,1.8,'#d8b060');arcDia(x+1,y+h-1,1.8,'#d8b060');arcDia(x+w-1,y+h-1,1.8,'#d8b060')}}
function TN(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);ctx.textBaseline='top';ctx.textAlign='left';ctx.fillStyle=col||'#d6b46a';ctx.fillText(s,x,y)}
const HRT=['.KKK.KKK.','KRRWKRRRK','KRWRRRRRK','KRRRRRRRK','.KRRRRRK.','..KRRRK..','...KRK...','....K....'];
function heart(x,y,kind,ps){const H=(c1,c2)=>{ctx.beginPath();ctx.moveTo(x+4.5,y+7.6);ctx.bezierCurveTo(x+1.2,y+5.4,x-.2,y+3.4,x+.4,y+1.9);ctx.bezierCurveTo(x+1,y+.2,x+3.5,y-.1,x+4.5,y+1.7);ctx.bezierCurveTo(x+5.5,y-.1,x+8,y+.2,x+8.6,y+1.9);ctx.bezierCurveTo(x+9.2,y+3.4,x+7.8,y+5.4,x+4.5,y+7.6);ctx.closePath()};
 {ctx.save();const g=ctx.createLinearGradient(x,y,x+9,y+8);g.addColorStop(0,'#ff8a7a');g.addColorStop(.5,'#d8262a');g.addColorStop(1,'#7a0c14');H();ctx.fillStyle=kind?g:'#3a1418';ctx.fill();
  if(kind===1){ctx.save();H();ctx.clip();ctx.fillStyle='#3a1418';ctx.fillRect(x+4.5,y-1,6,10);ctx.restore()}if(kind){ctx.fillStyle='rgba(255,230,220,.55)';ctx.beginPath();ctx.ellipse(x+2.6,y+2.4,1,.7,-.6,0,6.283);ctx.fill()}H();ctx.lineWidth=1.2;ctx.strokeStyle='#120608';ctx.stroke();ctx.restore();return}
 ps=ps||1;ps=ps||1;for(let r=0;r<8;r++)for(let c=0;c<9;c++){const ch=HRT[r][c];if(ch==='.')continue;let col=ch==='K'?'#1a0606':'';if(!col){const full=kind===2||(kind===1&&c<=4);col=full?(ch==='W'?'#ffb0b0':'#e81c1c'):(ch==='W'?'#5a1414':'#3a0a0a')}ctx.fillStyle=col;ctx.fillRect(x+c*ps,y+r*ps,ps,ps)}}
function hearts(x,y,f,n){n=n||10;const hv=Math.round(Math.max(0,Math.min(1,f))*n*2);for(let i=0;i<n;i++)heart(x+i*8,y,hv>=2*i+2?2:hv===2*i+1?1:0,1)}

let HDBG=null;function hdBg(){if(HDBG)return HDBG;const N=512,c=cvs(N,N),g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data,R=rngf(4242);
 const oct=[[6,.42],[14,.24],[32,.16],[80,.1],[200,.08]].map(([p,a])=>{const v=new Float32Array(p*p);for(let i=0;i<v.length;i++)v[i]=R();return{p,a,v}});
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(const o of oct){const p=o.p,fx=x/N*p,fy=y/N*p,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),i0=ix%p,i1=(ix+1)%p,j0=iy%p,j1=(iy+1)%p,a=o.v[j0*p+i0],b=o.v[j0*p+i1],c2=o.v[j1*p+i0],e=o.v[j1*p+i1];s+=o.a*((a+(b-a)*sx)*(1-sy)+(c2+(e-c2)*sx)*sy)}
  const t=Math.max(0,Math.min(1,(s-.22)*1.75)),k=(y*N+x)*4;d[k]=22+t*40;d[k+1]=28+t*42;d[k+2]=38+t*52;d[k+3]=255}
 g.putImageData(im,0,0);return HDBG=c}
function dirtBack(UW,UH,dark){const p=ctx.createPattern(hdBg(),'repeat');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.fillStyle=p;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();ctx.fillStyle='rgba(0,0,0,'+(dark==null?.55:dark)+')';ctx.fillRect(0,0,UW,UH)}
const lgr=(g,x0,y0,x1,y1,a,b)=>{const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
const poly=(g,pts,fill,stroke,lw)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const circ=(g,x,y,r,fill,stroke,lw)=>{g.beginPath();g.arc(x,y,r,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const rrg=(g,x,y,w,h,r,fill,stroke,lw)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const ln=(g,x0,y0,x1,y1,col,lw)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.strokeStyle=col;g.lineWidth=lw;g.stroke()};
let IC={
 coin:ICN(g=>{circ(g,8,8,6.6,lgr(g,3,2,13,14,'#ffe989','#e0a010'),'#8a5a00',1);circ(g,8,8,4.3,null,'rgba(138,90,0,.6)',.9);ln(g,8,5.6,8,10.4,'rgba(138,90,0,.75)',1.3);g.beginPath();g.arc(8,8,5.6,3.5,4.9);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.9;g.stroke()}),
 wood:ICN(g=>{[3,9.2].forEach(y=>{rrg(g,2.5,y,11.5,4.6,2.3,lgr(g,0,y,0,y+4.6,'#b9824a','#7a4e24'),'#3d2410',.9);circ(g,4.8,y+2.3,2.2,lgr(g,3,y,7,y+4,'#f0cf94','#d9a560'),'#3d2410',.8);circ(g,4.8,y+2.3,1.1,null,'rgba(120,70,20,.8)',.6)})}),
 stone:ICN(g=>{poly(g,[[1.5,12.5],[2.5,6],[6.5,2.5],[11.5,3.5],[14.5,8.5],[13.5,13]],lgr(g,2,2,14,14,'#c4cad4','#6d7480'),'#2f343d',1);poly(g,[[2.5,6],[6.5,2.5],[9,7.5],[5,10]],'rgba(255,255,255,.4)');poly(g,[[9,7.5],[14.5,8.5],[13.5,13],[8,12]],'rgba(0,0,0,.22)')}),
 heart:ICN(g=>{g.beginPath();g.moveTo(8,14.3);g.bezierCurveTo(.5,9.5,1.6,2.8,5.8,3.3);g.bezierCurveTo(7,3.45,7.8,4.4,8,5.2);g.bezierCurveTo(8.2,4.4,9,3.45,10.2,3.3);g.bezierCurveTo(14.4,2.8,15.5,9.5,8,14.3);g.closePath();g.fillStyle=lgr(g,3,3,12,14,'#ff7a7a','#c01f2f');g.fill();g.lineWidth=.9;g.strokeStyle='#5a0d16';g.stroke();g.beginPath();g.arc(5.4,6.4,1.6,3.3,4.5);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.9;g.stroke()}),
 skull:ICN(g=>{circ(g,8,7,5.6,lgr(g,3,2,13,12,'#f2f8e0','#b9c9a0'),'#3a4a2a',.9);rrg(g,5,10,6,4.3,1.3,'#dfe9c8','#3a4a2a',.8);circ(g,5.8,7.2,1.6,'#233014');circ(g,10.2,7.2,1.6,'#233014');poly(g,[[8,8.6],[7.2,10],[8.8,10]],'#233014');ln(g,7,11,7,13.8,'#3a4a2a',.6);ln(g,9,11,9,13.8,'#3a4a2a',.6)}),
 hammer:ICN(g=>{ln(g,3.5,13.5,10,7,'#4a2c12',3);ln(g,3.5,13.5,10,7,'#b07a40',1.8);g.save();g.translate(10.8,5.6);g.rotate(.78);rrg(g,-4.4,-2.4,8.8,4.8,1.2,lgr(g,0,-2.4,0,2.4,'#e4e9f1','#7e8794'),'#2f343d',.9);g.restore()}),
 sword:ICN(g=>{ln(g,5.2,10.8,13.6,2.4,'#2a303a',3.1);ln(g,5.2,10.8,13.6,2.4,'#eef2f8',1.7);ln(g,3.6,8.4,7.8,12.6,'#6a4a10',2.4);ln(g,3.6,8.4,7.8,12.6,'#f0c040',1.4);ln(g,4.6,11.4,2.4,13.6,'#4a2c12',2.4);circ(g,2.1,13.9,1.3,'#f0c040','#6a4a10',.6)}),
 plus:ICN(g=>{ln(g,8,3,8,13,'#fff',2.2);ln(g,3,8,13,8,'#fff',2.2)}),
 minus:ICN(g=>{ln(g,3,8,13,8,'#fff',2.2)}),
 close:ICN(g=>{ln(g,3.5,3.5,12.5,12.5,'#fff',2.2);ln(g,12.5,3.5,3.5,12.5,'#fff',2.2)}),
 wall:ICN(g=>{rrg(g,1,5,14,9.5,1,lgr(g,0,5,0,14,'#bfc3cf','#80869a'),'#2f343d',.9);[[1,2.4],[6.2,2.4],[11.4,2.4]].forEach(([x,y])=>rrg(g,x,y,3.6,3.4,.6,'#c9cdd8','#2f343d',.8));
  ln(g,1.5,8.5,14.5,8.5,'rgba(40,45,60,.55)',.7);ln(g,1.5,11.7,14.5,11.7,'rgba(40,45,60,.55)',.7);[5,10.5].forEach(x=>ln(g,x,5.4,x,8.5,'rgba(40,45,60,.55)',.7));[3,8,13].forEach(x=>ln(g,x,8.5,x,11.7,'rgba(40,45,60,.55)',.7))}),
 gate:ICN(g=>{rrg(g,1,2.5,14,12,1.2,lgr(g,0,2,0,14,'#bfc3cf','#80869a'),'#2f343d',.9);g.beginPath();g.moveTo(4.4,14.5);g.lineTo(4.4,8.4);g.arc(8,8.4,3.6,Math.PI,0);g.lineTo(11.6,14.5);g.closePath();g.fillStyle=lgr(g,0,5,0,14,'#a8743c','#5e3a1a');g.fill();g.strokeStyle='#2a1808';g.lineWidth=.9;g.stroke();
  [6.2,8,9.8].forEach(x=>ln(g,x,5.4,x,14.4,'rgba(30,15,5,.55)',.6));ln(g,4.6,10.5,11.4,10.5,'#3a3d46',.8);circ(g,9.8,11.4,.6,'#f0c040')}),
 path:ICN(g=>{g.beginPath();g.ellipse(8,8.5,7,4.2,-.35,0,6.2832);g.fillStyle=lgr(g,2,3,14,13,'#dcc79a','#a68a58');g.fill();g.strokeStyle='#6b5530';g.lineWidth=.9;g.stroke();[[5,9],[8,7.4],[10.5,9.6],[7,10.8],[11,7]].forEach(([x,y])=>circ(g,x,y,.8,'rgba(90,70,40,.65)'))}),
 stairs:ICN(g=>{poly(g,[[1,14.5],[1,11.5],[5,11.5],[5,8.5],[9,8.5],[9,5.5],[13,5.5],[13,2.5],[15,2.5],[15,14.5]],lgr(g,0,2,0,15,'#cfd2dc','#7f8596'),'#2f343d',.9);[[1,11.5,5],[5,8.5,9],[9,5.5,13],[13,2.5,15]].forEach(([a,y,b])=>ln(g,a,y,b,y,'rgba(255,255,255,.8)',1))}),
 tower:ICN(g=>{rrg(g,4,6,8,9,.6,lgr(g,4,0,12,0,'#c9ccd6','#80869a'),'#2f343d',.9);rrg(g,3,4.2,10,2.4,.5,'#d2d5de','#2f343d',.8);[3,6.9,10.8].forEach(x=>rrg(g,x,2.4,2.2,2.3,.4,'#d2d5de','#2f343d',.7));ln(g,8,2.6,8,.3,'#3a2a14',.8);poly(g,[[8,.4],[11,1.3],[8,2.3]],'#d0382e');rrg(g,7,8.4,2,3.6,1,'#232a3e');ln(g,4.4,13,11.6,13,'rgba(40,45,60,.45)',.6)}),
 ballista:ICN(g=>{rrg(g,3,12,10,2.6,.6,lgr(g,3,12,3,15,'#a0764a','#5a3a20'),'#2f1c0c',.8);ln(g,2,7.5,8,6,'#8a5a2a',1.8);ln(g,14,7.5,8,6,'#8a5a2a',1.8);ln(g,2,7.5,8,11.4,'#f2e8c8',.6);ln(g,14,7.5,8,11.4,'#f2e8c8',.6);rrg(g,7,4,2,9,.6,lgr(g,7,0,9,0,'#c59a62','#7a5230'),'#2f1c0c',.7);poly(g,[[8,.4],[9.6,3.6],[6.4,3.6]],'#d4dae6','#3a3f50',.6);rrg(g,6.4,10,3.2,2.4,.5,'#80869a','#2f343d',.6)}),
 trebuchet:ICN(g=>{rrg(g,1.5,13,13,1.8,.5,'#7a5230','#2f1c0c',.7);poly(g,[[4,13],[7,4],[9,4],[6,13]],'#92643a','#2f1c0c',.7);poly(g,[[12,13],[9,4],[7,4],[10,13]],'#7a5230','#2f1c0c',.7);ln(g,3,10.6,13.4,2.4,'#b98a50',1.6);ln(g,3,10.6,13.4,2.4,'#5a3a20',.5);rrg(g,1.2,10.4,4,4,.8,lgr(g,1,10,5,14,'#a8aebc','#5c6272'),'#2f343d',.8);circ(g,13.6,2.2,1.7,'#9aa0b0','#2f343d',.7);circ(g,8,4.6,1,'#d4dae6','#2f343d',.5)}),
 raise:ICN(g=>{poly(g,[[1,12],[5,6],[8,8],[12,3],[15,12]],lgr(g,0,3,0,13,'#78c25a','#4a8a3a'),'#244a1c',.9);rrg(g,1,11.4,14,3.4,.8,lgr(g,0,11,0,15,'#a97a4a','#6b4a28'),'#3a2410',.8);ln(g,8,.8,8,5.4,'#ffd23c',1.4);poly(g,[[5.6,3],[8,.6],[10.4,3]],'#ffd23c','#7a5a00',.5)}),
 dig:ICN(g=>{poly(g,[[1,4],[15,4],[15,13],[1,13]],lgr(g,0,4,0,13,'#a97a4a','#6b4a28'),'#3a2410',.9);poly(g,[[1,4],[15,4],[12,8],[4,8]],'#3a2a18',null);rrg(g,1,2.6,14,2.4,.8,lgr(g,0,2,0,5,'#78c25a','#4a8a3a'),'#244a1c',.8);ln(g,8,.4,8,5.6,'#ffd23c',1.2);poly(g,[[5.6,3.6],[8,6.4],[10.4,3.6]],'#ffd23c','#7a5a00',.5)}),
 sound:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.6],[9,13.4],[5,10],[2,10]],'#fbf0dc','#2a3350',.8);g.beginPath();g.arc(9.6,8,2.6,-1,1);g.strokeStyle='#fbf0dc';g.lineWidth=1.1;g.stroke();g.beginPath();g.arc(9.6,8,5,-1,1);g.stroke()}),
 mute:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.6],[9,13.4],[5,10],[2,10]],'#8a93b0','#2a3350',.8);ln(g,11,5.4,15,10.6,'#ff6a6a',1.4);ln(g,15,5.4,11,10.6,'#ff6a6a',1.4)}),
 idle:ICN(g=>{circ(g,8,9.4,4.9,lgr(g,4,5,12,14,'#ffe2b4','#d9a874'),'#6b4423',.8);g.beginPath();g.ellipse(8,6.6,7.2,1.9,0,0,6.2832);g.fillStyle='#f0d878';g.fill();g.strokeStyle='#6b5018';g.lineWidth=.8;g.stroke();circ(g,6.1,9.8,.75,'#2a2a2a');circ(g,9.9,9.8,.75,'#2a2a2a');ln(g,6.2,12,9.8,12,'#8a4a2a',.7);[[11,2,2.4],[13.4,.4,1.7]].forEach(([x,y,r])=>{ln(g,x,y,x+r,y,'#bcd0ff',.8);ln(g,x+r,y,x,y+r,'#bcd0ff',.8);ln(g,x,y+r,x+r,y+r,'#bcd0ff',.8)})}),
 peasant:ICN(g=>{circ(g,8,9.4,4.9,lgr(g,4,5,12,14,'#ffe2b4','#d9a874'),'#6b4423',.8);g.beginPath();g.ellipse(8,6.6,7.2,1.9,0,0,6.2832);g.fillStyle=lgr(g,0,5,0,8,'#f0d878','#c9a444');g.fill();g.strokeStyle='#6b5018';g.lineWidth=.8;g.stroke();g.beginPath();g.ellipse(8,5.6,3.9,3,0,Math.PI,0);g.fillStyle=lgr(g,0,2,0,6,'#f8e594','#d8b650');g.fill();g.stroke();rrg(g,4.2,5.2,7.6,1.1,.4,'#8a4a2a');circ(g,6.1,9.8,.75,'#2a2a2a');circ(g,9.9,9.8,.75,'#2a2a2a');g.beginPath();g.arc(8,11.2,1.6,.3,2.8);g.strokeStyle='#8a4a2a';g.lineWidth=.7;g.stroke()}),
 knight:ICN(g=>{poly(g,[[2.8,14.5],[2.8,8],[4.6,3.4],[11.4,3.4],[13.2,8],[13.2,14.5]],lgr(g,3,3,13,14,'#e4e9f4','#7d879c'),'#262d40',1);rrg(g,4.2,7.2,7.6,2.2,.8,'#141a2a');rrg(g,7.2,9,1.6,5,.5,'#aeb7ca','#262d40',.5);poly(g,[[7,3.6],[7.6,.6],[11.4,1.3],[9.6,3.6]],lgr(g,7,1,11,4,'#ff6a5a','#b0241c'),'#5a1010',.6);ln(g,5,5,6.4,4.2,'rgba(255,255,255,.85)',.8)}),
 archer:ICN(g=>{poly(g,[[3.2,14.5],[3.2,7],[5.2,4],[8,.9],[10.8,4],[12.8,7],[12.8,14.5]],lgr(g,3,1,13,14,'#68c36c','#2c7a38'),'#173d1c',.9);circ(g,8,9,3.6,lgr(g,5,6,11,12,'#ffe2b4','#d9a874'),'#6b4423',.6);circ(g,6.7,8.8,.65,'#1d3a22');circ(g,9.3,8.8,.65,'#1d3a22');g.beginPath();g.arc(14.4,8,4.6,-1.15,1.15);g.strokeStyle='#4a2c12';g.lineWidth=1.5;g.stroke();g.strokeStyle='#8a5a2a';g.lineWidth=.8;g.stroke();ln(g,11.1,4.4,11.1,11.6,'#f4f4f4',.5)}),
 home:ICN(g=>{poly(g,[[1,8.2],[8,2],[15,8.2],[13.2,8.2],[13.2,14.3],[2.8,14.3],[2.8,8.2]],lgr(g,0,2,0,14,'#f4e3b8','#c9a86a'),'#4a2c12',.9);poly(g,[[0.4,8.4],[8,1.4],[15.6,8.4],[14.2,8.4],[8,3.2],[1.8,8.4]],'#d0382e','#6a1410',.8);rrg(g,6.5,9.6,3,4.7,.6,'#6b3f1c','#2a1808',.7);rrg(g,10.4,9,2,2,.3,'#8ec6f0','#2a1808',.6)}),
 map:ICN(g=>{poly(g,[[1,3.4],[5.4,2.2],[10.6,3.8],[15,2.6],[15,12.6],[10.6,13.8],[5.4,12.2],[1,13.4]],lgr(g,0,2,16,14,'#f4e6bd','#cdb27a'),'#5a4220',.9);ln(g,5.4,2.4,5.4,12,'rgba(90,66,32,.6)',.7);ln(g,10.6,3.9,10.6,13.6,'rgba(90,66,32,.6)',.7);g.beginPath();g.moveTo(2.6,10.6);g.quadraticCurveTo(5.6,5.4,8,8.6);g.quadraticCurveTo(10,11,12.8,5.4);g.strokeStyle='#d0382e';g.lineWidth=1;g.setLineDash([1.6,1.2]);g.stroke();g.setLineDash([]);ln(g,11.4,4,13.4,6,'#d0382e',1.1);ln(g,13.4,4,11.4,6,'#d0382e',1.1)}),
 pause:ICN(g=>{rrg(g,3.5,2.8,3.2,10.4,.8,'#fff');rrg(g,9.3,2.8,3.2,10.4,.8,'#fff')}),
 play:ICN(g=>{poly(g,[[4,2.4],[13.4,8],[4,13.6]],'#fff','#fff',1)}),
 ff:ICN(g=>{poly(g,[[1.5,3],[8,8],[1.5,13]],'#fff','#fff',.8);poly(g,[[8,3],[14.5,8],[8,13]],'#fff','#fff',.8)}),
 menu:ICN(g=>{[3.6,8,12.4].forEach(y=>ln(g,2.8,y,13.2,y,'#fff',2))}),
 army:ICN(g=>{g.beginPath();g.moveTo(8,1.3);g.lineTo(14,3.3);g.lineTo(13.2,9);g.quadraticCurveTo(12.2,13,8,14.9);g.quadraticCurveTo(3.8,13,2.8,9);g.lineTo(2,3.3);g.closePath();g.fillStyle=lgr(g,2,1,14,15,'#6c9cf0','#2a4fa8');g.fill();g.lineWidth=1;g.strokeStyle='#142450';g.stroke();ln(g,8,4.2,8,11.6,'#fff',1.6);ln(g,5,7,11,7,'#fff',1.6)}),
 cursor:ICN(g=>{poly(g,[[3.6,2],[3.6,13.2],[6.4,10.4],[8.4,14.6],[10.4,13.7],[8.4,9.6],[12.2,9.6]],'#fff','#10151f',1)}),
 pan:ICN(g=>{ln(g,8,3,8,13,'#fff',1.6);ln(g,3,8,13,8,'#fff',1.6);poly(g,[[8,1],[10.2,3.8],[5.8,3.8]],'#fff');poly(g,[[8,15],[10.2,12.2],[5.8,12.2]],'#fff');poly(g,[[1,8],[3.8,5.8],[3.8,10.2]],'#fff');poly(g,[[15,8],[12.2,5.8],[12.2,10.2]],'#fff')}),
 rotL:ICN(g=>{g.beginPath();g.arc(8,8.6,4.8,3.6,6.9);g.strokeStyle='#fff';g.lineWidth=1.8;g.stroke();poly(g,[[1.4,6.6],[5.6,6.4],[3.4,10]],'#fff')}),
 rotR:ICN(g=>{g.beginPath();g.arc(8,8.6,4.8,-.7,2.6);g.strokeStyle='#fff';g.lineWidth=1.8;g.stroke();poly(g,[[14.6,6.6],[10.4,6.4],[12.6,10]],'#fff')}),
 zoomIn:ICN(g=>{circ(g,6.6,6.6,4.6,'rgba(255,255,255,.12)','#fff',1.6);ln(g,10,10,14,14,'#fff',2);ln(g,6.6,4.4,6.6,8.8,'#fff',1.4);ln(g,4.4,6.6,8.8,6.6,'#fff',1.4)}),
 zoomOut:ICN(g=>{circ(g,6.6,6.6,4.6,'rgba(255,255,255,.12)','#fff',1.6);ln(g,10,10,14,14,'#fff',2);ln(g,4.4,6.6,8.8,6.6,'#fff',1.4)}),
 clock:ICN(g=>{circ(g,8,8,6.4,lgr(g,2,2,14,14,'#fdfdfd','#c0c8d8'),'#2a3350',1);ln(g,8,8,8,4,'#2a3350',1.3);ln(g,8,8,11,9.6,'#d0382e',1.2)}),
 crown:ICN(g=>{poly(g,[[1.5,12.5],[1,4.5],[4.8,8],[8,2.5],[11.2,8],[15,4.5],[14.5,12.5]],lgr(g,0,2,0,13,'#ffe56a','#d9981a'),'#6a4a08',.9);rrg(g,1.5,11.4,13,2.4,.8,'#f0b830','#6a4a08',.8);[[8,2.5],[1,4.5],[15,4.5]].forEach(([x,y])=>circ(g,x,y,1,'#ff5a5a','#6a1010',.5))}),
 sound:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.8],[9,13.2],[5,10],[2,10]],'#fff');g.beginPath();g.arc(9.5,8,3.2,-.9,.9);g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke()}),
 brute:ICN(g=>{circ(g,8,8.6,6,lgr(g,3,3,13,14,'#8fc070','#4a7a3a'),'#1d3010',1);poly(g,[[3.2,4.5],[2,1.4],[5.4,3.2]],'#e8e4d0','#3a3020',.6);poly(g,[[12.8,4.5],[14,1.4],[10.6,3.2]],'#e8e4d0','#3a3020',.6);circ(g,5.8,7.8,1.1,'#ff3030');circ(g,10.2,7.8,1.1,'#ff3030');rrg(g,4.6,11,6.8,2.4,.8,'#2a3a1a');[5.8,7.4,9,10.6].forEach(x=>ln(g,x,11,x,12,'#e8e4d0',.7))}),
 runner:ICN(g=>{circ(g,8,8.6,5.6,lgr(g,3,3,13,14,'#e89a78','#a0502e'),'#3a1608',1);circ(g,5.9,7.8,1,'#ff3030');circ(g,10.1,7.8,1,'#ff3030');rrg(g,5,11,6,1.8,.8,'#3a1608');ln(g,1,6,3.4,6.6,'#fff',.9);ln(g,.8,9,3.2,9,'#fff',.9);ln(g,1.4,11.8,3.6,11.2,'#fff',.9)})};
function dIc(ic,x,y,s){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(ic,x,y,s||14,s||14)}

/* ---- more icons ---- */
function thIcons(){IC.bannerman=ICN(g=>{ln(g,3.2,15,3.2,1.2,'#5a3a1a',1.6);circ(g,3.2,1.2,1,'#f0c040');poly(g,[[4,2.2],[13.8,2.2],[13.8,10.2],[8.9,8.2],[4,10.2]],lgr(g,0,2,0,10,PAL[THEME.c][2],PAL[THEME.c][1]),'#1c2438',.8);ln(g,8.9,3.6,8.9,7,'#fff',1.4);ln(g,7.2,5.3,10.6,5.3,'#fff',1.4)});
IC.captain=ICN(g=>{poly(g,[[2.8,14.5],[2.8,8],[4.6,4],[11.4,4],[13.2,8],[13.2,14.5]],lgr(g,3,3,13,14,'#fff1a8','#c8921e'),'#5a3d08',1);rrg(g,4.2,7.4,7.6,2.2,.8,'#141a2a');rrg(g,7.2,9.2,1.6,5,.5,'#e0b030','#5a3d08',.5);poly(g,[[6.6,4],[7.2,.4],[10,.4],[10.6,1.6],[9.6,4]],lgr(g,7,0,10,4,PAL[THEME.c][2],PAL[THEME.c][1]),'#1c2438',.6);circ(g,8,5.4,.8,'#ff5a5a')})}
IC.group=ICN(g=>{[[4.2,10.2,2],[11.8,10.2,2],[8,6,2.3]].forEach(([x,y,r])=>{circ(g,x,y-2.4,r,'#ffe2b4','#2a1a0a',.6);g.beginPath();g.arc(x,y+2.6,r*1.5,Math.PI,0);g.lineTo(x+r*1.5,y+5);g.lineTo(x-r*1.5,y+5);g.closePath();g.fillStyle='#7aa0ff';g.fill();g.strokeStyle='#1c2848';g.lineWidth=.6;g.stroke()});ln(g,1.5,14.6,14.5,14.6,'#ffd23c',1)});
IC.ungroup=ICN(g=>{[[4.2,10.2,2],[11.8,10.2,2]].forEach(([x,y,r])=>{circ(g,x,y-2.4,r,'#ffe2b4','#2a1a0a',.6);g.beginPath();g.arc(x,y+2.6,r*1.5,Math.PI,0);g.lineTo(x+r*1.5,y+5);g.lineTo(x-r*1.5,y+5);g.closePath();g.fillStyle='#7aa0ff';g.fill();g.strokeStyle='#1c2848';g.lineWidth=.6;g.stroke()});ln(g,2,2,14,14,'#ff5a5a',1.8);ln(g,14,2,2,14,'#ff5a5a',1.8)});
IC.dice=ICN(g=>{rrg(g,2,2,12,12,2.4,lgr(g,2,2,14,14,'#fff','#c4ccdc'),'#2a3350',1);[[5,5],[11,5],[8,8],[5,11],[11,11]].forEach(([x,y])=>circ(g,x,y,1,'#2a3350'))});
/* ---- kingdom banner & emblems ---- */
const EMB=[
 g=>{rrg(g,6,1.5,4,13,1,g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,2,5.5,12,4,1,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const p=[];for(let i=0;i<10;i++){const r=i%2?3.2:7.2,a=-Math.PI/2+i*Math.PI/5;p.push([8+Math.cos(a)*r,8.4+Math.sin(a)*r])}poly(g,p,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{poly(g,[[1.5,12.5],[1,4.5],[4.8,8],[8,2.5],[11.2,8],[15,4.5],[14.5,12.5]],g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,1.5,11.6,13,2.4,.8,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle;ln(g,3,13,13,3,'rgba(0,0,0,.5)',3);ln(g,13,13,3,3,'rgba(0,0,0,.5)',3);ln(g,3,13,13,3,f,1.8);ln(g,13,13,3,3,f,1.8);ln(g,2.6,9.6,6.4,13.4,f,1.6);ln(g,13.4,9.6,9.6,13.4,f,1.6)},
 g=>{rrg(g,4.2,6,7.6,8.6,.6,g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,3,4.4,10,2.2,.4,g.fillStyle,'rgba(0,0,0,.5)',.5);[3,6.9,10.8].forEach(x=>rrg(g,x,2.4,2.2,2.2,.3,g.fillStyle,'rgba(0,0,0,.5)',.5))},
 g=>{const f=g.fillStyle;circ(g,8,8,3.4,f,'rgba(0,0,0,.5)',.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;ln(g,8+Math.cos(a)*4.8,8+Math.sin(a)*4.8,8+Math.cos(a)*7,8+Math.sin(a)*7,f,1.5)}},
 g=>{poly(g,[[8,1.5],[13,7],[3,7]],g.fillStyle,'rgba(0,0,0,.5)',.5);poly(g,[[8,4.5],[13.6,10.5],[2.4,10.5]],g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,7,10,2,4.5,.4,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{poly(g,[[9.2,1],[3,9],[7.4,9],[6,15],[13,6.4],[8.6,6.4]],g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle;g.beginPath();g.arc(8,8,6.6,Math.PI*.28,Math.PI*1.72,false);g.arc(10.6,8,5.1,Math.PI*1.62,Math.PI*.38,true);g.closePath();g.fillStyle=f;g.fill();g.lineWidth=.5;g.strokeStyle='rgba(0,0,0,.5)';g.stroke();const p=[];for(let i=0;i<10;i++){const r=i%2?.9:2.1,a=-Math.PI/2+i*Math.PI/5;p.push([12.2+Math.cos(a)*r,4.4+Math.sin(a)*r])}poly(g,p,f,null)},
 g=>{const f=g.fillStyle;circ(g,8,3,1.7,null,'rgba(0,0,0,.5)',2.4);circ(g,8,3,1.7,null,f,1.4);rrg(g,7.2,4.4,1.6,9.2,.4,f,'rgba(0,0,0,.5)',.5);rrg(g,4,6,8,1.5,.5,f,'rgba(0,0,0,.5)',.5);g.beginPath();g.arc(8,9,5,Math.PI*.12,Math.PI*.88,false);g.lineWidth=2.6;g.strokeStyle='rgba(0,0,0,.5)';g.stroke();g.lineWidth=1.6;g.strokeStyle=f;g.stroke();poly(g,[[1.8,9.6],[3.6,8.4],[3.8,11]],f,null);poly(g,[[14.2,9.6],[12.4,8.4],[12.2,11]],f,null)},
 g=>{const f=g.fillStyle;circ(g,5,5,3.2,null,'rgba(0,0,0,.5)',2.8);circ(g,5,5,3.2,null,f,1.8);ln(g,7.2,7.2,14,14,'rgba(0,0,0,.5)',2.8);ln(g,7.2,7.2,14,14,f,1.8);ln(g,11.4,11.4,9.6,13.2,f,1.6);ln(g,13,13,11.4,14.6,f,1.6)},
 g=>{const f=g.fillStyle;ln(g,4,14.5,11.5,3,'rgba(0,0,0,.5)',2.4);ln(g,4,14.5,11.5,3,'#c8a070',1.4);poly(g,[[9.4,2.2],[14.6,4.6],[14,9.8],[11.4,6.6]],f,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,1.5],[10,5],[9.2,9.5],[8,10.5],[6.8,9.5],[6,5]],f,S,.5);poly(g,[[6.6,9],[3.6,7.6],[2,4.6],[3.2,3.2],[4.6,5.4],[6.4,6.6]],f,S,.5);poly(g,[[9.4,9],[12.4,7.6],[14,4.6],[12.8,3.2],[11.4,5.4],[9.6,6.6]],f,S,.5);rrg(g,4.6,10,6.8,1.8,.5,f,S,.5);poly(g,[[7,11.8],[9,11.8],[9.6,14.6],[6.4,14.6]],f,S,.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,4.6],[11,6.2],[15,4.2],[13.6,7.4],[10.6,9],[9.6,12],[8,14.4],[6.4,12],[5.4,9],[2.4,7.4],[1,4.2],[5,6.2]],f,S,.5);circ(g,8,3.4,1.5,f,S,.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,1.2],[11.4,6.4],[12.4,10],[10.8,13.4],[8,14.8],[5.2,13.4],[3.6,10],[4.6,6.4],[6.4,8.6]],f,S,.5);poly(g,[[8,7.4],[9.8,10.4],[8,13.2],[6.2,10.4]],'rgba(0,0,0,.25)',null)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[2.4,2],[13.6,2],[13.6,8],[8,14.6],[2.4,8]],f,S,.5);poly(g,[[2.4,9],[8,4.6],[13.6,9],[13.6,11],[8,6.8],[2.4,11]],'rgba(0,0,0,.28)',null)}];
const lighten=(c,k)=>{const h=hex(c);return '#'+h.map(v=>Math.round(v+(255-v)*k).toString(16).padStart(2,'0')).join('')};
function bannerPattern(g,W,H,p,c2){g.fillStyle=c2;g.beginPath();
 if(p===1)g.rect(W/2,0,W/2,H);else if(p===2){g.moveTo(0,H*.62);g.lineTo(W/2,H*.3);g.lineTo(W,H*.62);g.lineTo(W,H*.8);g.lineTo(W/2,H*.48);g.lineTo(0,H*.8)}
 else if(p===3){g.moveTo(0,H*.08);g.lineTo(W*.3,0);g.lineTo(W,H*.62);g.lineTo(W,H*.84)}else if(p===4){g.rect(0,0,W/2,H*.38);g.rect(W/2,H*.38,W/2,H)}
 else if(p===5)g.rect(0,H*.3,W,H*.2);else if(p===6){g.rect(0,0,W,H);g.rect(W*.16,H*.08,W*.68,H*.86)}else if(p===7){g.moveTo(0,0);g.lineTo(W*.18,0);g.lineTo(W,H*.72);g.lineTo(W,H*.88);g.closePath();g.moveTo(W,0);g.lineTo(W*.82,0);g.lineTo(0,H*.72);g.lineTo(0,H*.88);g.closePath()}
 if(p)g.fill(p===6?'evenodd':'nonzero')}
function drawBanner(){const g=BANNER.getContext('2d'),W=128,H=192,p=PAL[THEME.c][1],s=PAL[THEME.c][2];g.clearRect(0,0,W,H);g.lineJoin='round';
 const path=()=>{g.beginPath();g.moveTo(8,4);g.lineTo(W-8,4);g.lineTo(W-8,H-30);g.lineTo(W/2,H-58);g.lineTo(8,H-30);g.closePath()};
 path();const q=g.createLinearGradient(0,0,0,H);q.addColorStop(0,lighten(p,.22));q.addColorStop(1,p);g.fillStyle=q;g.fill();g.save();path();g.clip();bannerPattern(g,W,H,THEME.p|0,PAL[THEME.c2|0][1]);const sh=g.createLinearGradient(0,0,W,0);sh.addColorStop(0,'rgba(255,255,255,.12)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=sh;g.fillRect(0,0,W,H);g.restore();path();g.lineWidth=11;g.strokeStyle=s;g.stroke();g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.4)';g.stroke();
 {const im=embImg(THEME.e|0,embMetal(THEME.c));g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,W/2-55,31,110,110)}
 {const rg=g.createLinearGradient(0,0,0,9);rg.addColorStop(0,'#fff1b0');rg.addColorStop(.5,'#c8922a');rg.addColorStop(1,'#7a5410');g.fillStyle=rg;g.fillRect(2,1,W-4,7);g.strokeStyle='#3a2406';g.lineWidth=1;g.strokeRect(2.5,1.5,W-5,6);
  for(const fx of[4,W-4]){const fg=g.createRadialGradient(fx-1.5,3,1,fx,4.5,5);fg.addColorStop(0,'#fff6c8');fg.addColorStop(1,'#a8741a');g.beginPath();g.arc(fx,4.5,4.6,0,6.283);g.fillStyle=fg;g.fill();g.stroke()}}}
function saveTheme(){try{localStorage.setItem('dk_theme',JSON.stringify(THEME))}catch(e){}}
function drawEmblem(x,y,s,e,col){ctx.save();ctx.translate(x,y);ctx.scale(s/16,s/16);ctx.fillStyle=col;EMB[e](ctx);ctx.restore()}
const EMBC={};const embMetal=c=>c===3||c===10||c===11?'s':'g';
function embImg(e,m){const k=e+m;if(EMBC[k])return EMBC[k];const N=128,c=cvs(N,N),q=c.getContext('2d');q.scale(N/20,N/20);q.translate(2,2);
 const gr=q.createLinearGradient(0,1,0,15);if(m==='s'){gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,'#d6dce8');gr.addColorStop(.55,'#9aa4b8');gr.addColorStop(1,'#eef2f8')}else{gr.addColorStop(0,'#fff6c4');gr.addColorStop(.42,'#f2c64a');gr.addColorStop(.58,'#b8801a');gr.addColorStop(1,'#ffd860')}
 q.fillStyle=gr;q.lineJoin='round';EMB[e](q);
 const o=cvs(N,N),p=o.getContext('2d');p.drawImage(c,0,0);p.globalCompositeOperation='source-in';p.fillStyle=m==='s'?'#1c2232':'#3a2406';p.fillRect(0,0,N,N);
 const f=cvs(N,N),h=f.getContext('2d');h.shadowColor='rgba(0,0,0,.7)';h.shadowBlur=5;h.shadowOffsetY=4;for(const[dx,dy]of[[-2.5,0],[2.5,0],[0,-2.5],[0,2.5],[-1.8,-1.8],[1.8,1.8],[-1.8,1.8],[1.8,-1.8]])h.drawImage(o,dx,dy);h.shadowColor='transparent';h.drawImage(c,0,0);
 const hi=cvs(N,N),j=hi.getContext('2d');j.drawImage(c,0,-2.5);j.globalCompositeOperation='source-in';j.fillStyle='rgba(255,255,255,.55)';j.fillRect(0,0,N,N);j.globalCompositeOperation='destination-out';j.drawImage(c,0,1);
 h.globalCompositeOperation='source-atop';h.drawImage(hi,0,0);return EMBC[k]=f}
function drawEmblemR(x,y,s,e,c){const im=embImg(e,embMetal(c==null?THEME.c:c)),p=s*.125;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-p,y-p,s+2*p,s+2*p)}
function shieldPath(x,y,w,h){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h*.52);ctx.quadraticCurveTo(x+w,y+h*.86,x+w/2,y+h);ctx.quadraticCurveTo(x,y+h*.86,x,y+h*.52);ctx.closePath()}
function shieldTile(x,y,s,inner){const w=s,h=s*1.12,y0=y-s*.06;ctx.save();ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;shieldPath(x,y0,w,h);const c=PAL[THEME.c][1],q=ctx.createLinearGradient(x,y0,x+w,y0+h);q.addColorStop(0,lighten(c,.28));q.addColorStop(1,c);ctx.fillStyle=q;ctx.fill();ctx.restore();
 ctx.save();shieldPath(x,y0,w,h);ctx.clip();inner(x,y0,w,h);const sh=ctx.createLinearGradient(x,y0,x+w,y0);sh.addColorStop(0,'rgba(255,255,255,.16)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.2)');ctx.fillStyle=sh;ctx.fillRect(x,y0,w,h);ctx.restore();
 shieldPath(x+.6,y0+.6,w-1.2,h-1.2);const gr=ctx.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'#fff1b0');gr.addColorStop(.5,'#c89a2e');gr.addColorStop(1,'#f6d878');ctx.lineWidth=1.2;ctx.strokeStyle=gr;ctx.stroke();shieldPath(x,y0,w,h);ctx.lineWidth=.5;ctx.strokeStyle='rgba(20,12,0,.8)';ctx.stroke()}
function gemSwatch(x,y,s,col){ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=1.5;ctx.shadowOffsetY=.8;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2-.3,0,6.283);const q=ctx.createRadialGradient(x+s*.36,y+s*.3,s*.05,x+s/2,y+s/2,s*.62);q.addColorStop(0,lighten(col,.6));q.addColorStop(.45,col);q.addColorStop(1,lighten(col,-.0)&&'#00000000'===''?col:col);ctx.fillStyle=q;ctx.fill();ctx.restore();
 ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2-.3,0,6.283);const d=ctx.createRadialGradient(x+s/2,y+s/2,s*.25,x+s/2,y+s/2,s*.52);d.addColorStop(0,'rgba(0,0,0,0)');d.addColorStop(1,'rgba(0,0,0,.38)');ctx.fillStyle=d;ctx.fill();
 ctx.lineWidth=.9;ctx.strokeStyle='#c99a3a';ctx.stroke();ctx.beginPath();ctx.ellipse(x+s*.38,y+s*.3,s*.15,s*.09,-.6,0,6.283);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill()}
thIcons();drawBanner();bannerTex.needsUpdate=true;
IC.gear=ICN(g=>{for(let k=0;k<8;k++){const a=k*Math.PI/4;ln(g,8+Math.cos(a)*4.5,8+Math.sin(a)*4.5,8+Math.cos(a)*7,8+Math.sin(a)*7,'#f6e9d2',2.6)}circ(g,8,8,5,'#f6e9d2','#2a303a',.8);circ(g,8,8,2,'#2a303a','#2a303a',.5)});IC.upgrade=ICN(g=>{poly(g,[[8,1.5],[14,8],[10,8],[10,14.5],[6,14.5],[6,8],[2,8]],'#ffd23c','#7a5a00',.9)});
/* ================= HUD, world map, title screen, input ================= */
let uiHits=[],uiRects=[],mmRect={x:0,y:0,w:0,h:0},mmDrag=false;
const U=(x,y,w,h)=>({x:x*UIS,y:y*UIS,w:w*UIS,h:h*UIS}),inR=(p,r)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
const mm2=cvs(900,500),m2g=mm2.getContext('2d');let mmT=-9;
function refreshMM(){m2g.imageSmoothingEnabled=true;m2g.imageSmoothingQuality='high';m2g.drawImage(mc,0,0,900,500)}
const NAMES={king:'King Naraige',guard:'Royal guard',stoneup:'Upgrade',upgtool:'Stone tool',cannon:'Cannon',repair:'Repair',agg:'Attack',def:'Defend',hold:'Halt',stop:'Stop',work:'Gather',keep:'Keep',movec:'Move castle',rotate:'Rotate',peasant:'Peasant',knight:'Knight',archer:'Archer',bannerman:'Bannerman',captain:'Captain',wall:'Wall',gate:'Gate',tower:'Tower',ballista:'Ballista',trebuchet:'Trebuchet',path:'Path',army:'Army',idle:'Idle',form:'Formation',mode:'Mode',raise:'Raise',dig:'Dig',upgrade:'Masonry',barracks:'Barracks',farm:'Farm',storage:'Storage',ramp:'Ramp',demolish:'Demolish',iron:'Iron weapons',plate:'Plate armor',drill:'Drill',steel:'Steel weapons',mail:'Chain mail',tools:'Better tools',harvest:'Crop rotation',fletch:'Fletching',bastion:'Bastion walls',house:'House',academy:'Academy',market:'Market',forester:'Forester',guild:'Guild','rb+':'+1','rb-':'-1','rr+':'+1','rr-':'-1','rt+':'+1','rt-':'-1',torch:'Torch',rally:'Rally: barracks',rallyc:'Rally: castle'},HK={agg:'1',def:'2',hold:'3',stop:'4',house:'0',academy:';',market:':',forester:'[',guild:']',torch:"'",rally:'-',rallyc:'=',peasant:1,knight:2,archer:3,bannerman:4,captain:5,wall:6,gate:7,tower:8,path:9,ballista:'B',trebuchet:'T',raise:'Y',dig:'U',army:'Q',idle:'.',form:'V',upgrade:'G',barracks:'C',farm:'J',storage:'K',ramp:'I',tier:'L',demolish:'P'};
const TIPS={repair:['Repair','Peasants fix the selected building','Costs part of its wood / stone / gold'],agg:['Aggressive [1]','Chase and attack every enemy in sight'],def:['Defensive [2]','Fight around their post, then walk back to it'],hold:['Halt [3]','Hold position: never move, only strike','enemies within weapon range'],stop:['Stop [4]','Cancel current orders and stay here'],work:['Gather','Send these peasants back to work now'],movec:['Move castle [,]','Relocate your castle up to 40 tiles away','Costs 100 gold, 150 wood'],rotate:['Rotate [R]','Turns the selected building 90 degrees','The castle door turns with it'],academy:['Academy [;]','2x2 school: all research is bought here.','Select it to open the research menu'],market:['Market [:]','2x2 trading post: select it to sell','wood, stone or food for gold, or buy them'],forester:["Forester's hut [[]",'2x2 log cabin: its peasant plants saplings','around it; they grow into trees (wood)'],guild:["Builders' guild []]",'2x2 workshop: select it to choose how many','peasants build, repair and reshape the land'],torch:["Torch [']",'Cheap light: at night whatever stands','outside the light is hurt by the dark'],rallyc:['Castle rally [=]','Click the map: new peasants walk there;','on a tree, rock or gold they start working it'],house:['House [0]','2x2 cottage: +6 population','Your castle alone supports 18'],rally:['Barracks rally [-]','Click the map: new soldiers from','barracks walk there by themselves'],steel:['Steel weapons','Research (60 s): soldiers hit','another 20% harder','Needs Iron weapons'],mail:['Chain mail','Research (70 s): your side takes','another 15% less damage','Needs Plate armor'],tools:['Better tools','Research (30 s): peasants gather','33% faster'],harvest:['Crop rotation','Research (40 s): farms yield 50% more food'],fletch:['Fletching','Research (45 s): archers +25%,','towers +40% damage'],bastion:['Bastion walls','Research (60 s): buildings take','28% less damage','Needs Stonemasonry'],tier:['Building tier [L]','Choose wood or stone for what you build','Stone needs Stonemasonry'],demolish:['Demolish [P]','Click a building: peasants tear it down','and you recover 100% of its cost'],storage:['Storage [K]','2x2 depot: peasants drop wood, stone','and gold here: build it next to resources'],ramp:['Ramp [I]','Places a ramp block that climbs 1 level','[R] turns it - peasants build it (free)'],farm:['Farm [J]','2x2 field worked by one peasant:','+6 food every 6 s while he farms it'],iron:['Iron weapons','Research (40 s): your soldiers','and towers hit 25% harder'],plate:['Plate armor','Research (50 s): your side takes','22% less damage'],drill:['Drill training','Research (35 s): units are trained','25% faster, at the castle or barracks'],peasant:['Peasant','Select, then right-click a tree, rock','or gold to harvest it. Click a building to repair'],knight:['Knight','Tough melee fighter'],archer:['Archer','Ranged attacker','Right-click a wall, gate or tower','to garrison it for more range'],bannerman:['Bannerman','Heals nearby allies in a wide area','and speeds up their attacks','Keep him behind the line'],captain:['Captain','Allies within 8 tiles hit 25% harder','and take 20% less damage'],king:['King Naraige','Summoned at the castle with his 2 royal guards - one king only','His sword cuts through the horde; allies within 10 tiles','hit 35% harder and take 20% less damage'],guard:['Royal guard','A new halberdier to escort the king (2 at most)','Long reach, sweeps several zombies at once'],stoneup:['Upgrade to stone','Rebuilds this building in stone:','twice the hit points','Needs Stonemasonry'],upgtool:['Stone upgrade tool','Click or drag over wooden buildings','to rebuild them in stone (walls...)'],cannon:['Cannon [/]','Field gun pushed by a crew of 2 (2 population)','Its cannonballs blast whole groups of zombies','Slow, and weak up close. Needs Stonemasonry'],barracks:['Barracks [C]','2x2 building, click it to select','Units trained while it is selected','come out of it, 35% faster'],upgrade:['Stonemasonry [G]','Research (45 s): every wooden building,','castle included, becomes stone','New buildings are stone afterwards'],wall:['Wooden wall','Cheap and links to its neighbours','Upgrade it to stone later'],gate:['Wooden gate','2 tiles long. R rotates it','Your units pass, zombies must break it'],tower:['Wooden tower','Long range: volleys of 5 arrows','Lights the night. Archers garrison (3)'],ballista:['Ballista [B]','Click a finished tower to mount it','Pierces a whole line of zombies'],trebuchet:['Trebuchet [T]','Click a finished tower to mount it','Huge range, boulders crush a crowd'],raise:['Raise ground [Y]','Paint tiles: idle or selected peasants','raise them by 1 block (free)','Click a marked tile again to cancel'],dig:['Dig ground [U]','Paint tiles: peasants lower them by 1','and give back 2 stone each'],form:['Formation [V]','Cycles None / Line / Block / Wedge / Ring','Used when you move 3+ selected soldiers'],idle:['Idle peasants [.]','Selects peasants with no job','and centers the camera on them'],path:['Path','Faster travel','Click or drag to paint'],
 army:['Select army [Q]','Selects all fighters'],'rb+':['Add a builder','A peasant who only builds new buildings','and demolishes; he waits at the guild'],'rb-':['Remove a builder','He goes back to gathering'],'rr+':['Add a repairer','Repairs damaged buildings by himself (uses','resources); stays out at night for the walls'],'rr-':['Remove a repairer','He goes back to gathering'],'rt+':['Add a terraformer','Digs, raises and builds the ramps you order;','the other peasants keep gathering'],'rt-':['Remove a terraformer','He goes back to gathering'],mode:['Mouse mode','Select: drag draws a box','Pan: drag moves the camera']};
const RN={g:'gold',w:'wood',s:'stone',f:'food'};
for(const k of['sellw','sells','buyw','buys','sellf','buyf']){const r=k[k.length-1],sl=k[0]==='s';Object.defineProperty(TIPS,k,{get:()=>sl?['Sell 50 '+RN[r],'You get '+tradeGain(r)+' gold','Each sale lowers the price for a while']:['Buy 50 '+RN[r],'Costs '+tradeCost(r)+' gold','Each purchase raises the price for a while'],enumerable:true,configurable:true});Object.defineProperty(NAMES,k,{get:()=>sl?'+'+tradeGain(r)+' gold':'+50 '+RN[r],enumerable:true,configurable:true})}Object.defineProperty(NAMES,'tier',{get:()=>RS.done&&BTIER?'Stone':'Wood',enumerable:true,configurable:true});
let CMP=false,FPV=null;const MW=34,MH=38;
/* build menu in categories: the bar shows Defense / Economy / Town / Land; a click opens that category (Back or Esc to return) */
let BCAT=null;const BCATS={def:['Defense',['wall','gate','tower','torch']],eco:['Economy',['farm','forester','storage','market']],town:['Town',['house','barracks','guild','academy']],land:['Land',['path','raise','dig','ramp']],siege:['Siege',['ballista','trebuchet']]},BCI={def:'tower',eco:'farm',town:'house',land:'raise',siege:'ballista'};
function catItems(c,siege){return BCATS[c][1]}
function catKeys(c,siege){const a=catItems(c,siege);return a.concat(a.filter(k=>TIERK.has(k)).map(k=>'s:'+k))}
function buildGroups(siege){const sg=siege&&RS.done;if(BCAT&&BCATS[BCAT]&&(BCAT!=='siege'||sg))return[[BCATS[BCAT][0],['back'].concat(catKeys(BCAT,siege))]];return[['Build',['cat:def','cat:eco','cat:town','cat:land'].concat(sg?['cat:siege']:[],RS.done?['upgtool']:[],['demolish'])]]}
for(const c in BCATS){NAMES['cat:'+c]=BCATS[c][0]}NAMES.back='Back';
TIPS['cat:def']=['Defense','Walls, gates, towers and torches','Wood row on top, stone row below'];TIPS['cat:siege']=['Siege','Ballista and trebuchet'];TIPS['cat:eco']=['Economy','Farms, forester hut, storage, market'];TIPS['cat:town']=['Town','Houses, barracks, builders guild, academy'];TIPS['cat:land']=['Land','Paths, raise and dig ground, ramps'];TIPS.back=['Back [Esc]','Return to the building categories'];
IC.cannon=IC.cannon||ICN(g=>{rrg(g,3,6,11,4,1,'#3b3e44','#15171a',.8);circ(g,5,11,3,'#7a5532','#2a1a0c',.8);circ(g,11,11,3,'#7a5532','#2a1a0c',.8)});
IC.back=ICN(g=>{poly(g,[[1.5,8],[7.5,2],[7.5,5.5],[14.5,5.5],[14.5,10.5],[7.5,10.5],[7.5,14]],'#f6e9d2','#2a303a',.9)});
function ctxGroups(){const S=sel();if(S.length){const sol=S.some(u=>u.type!=='peasant'),pea=S.some(u=>u.type==='peasant'),G=[];
  if(sol)G.push(['Behaviour',['agg','def','hold','stop']]);
  if(pea&&!sol)G.push(['Peasants',['work','stop']],...buildGroups(false));
  G.push(['Group',(sol&&S.length>=2?['form']:[]).concat(['army','idle','mode'])]);return G}
 const upI=b=>b&&b.tier===0&&UPC[b.type]?['stoneup']:[];
 if(selB&&structs.includes(selB)&&selB.prog>=1&&!TRB.has(selB.type))return[['Command',upI(selBs().find(s=>s.tier===0)||selB).concat(['repair','demolish'],ROTT.has(selB.type)?['rotate']:[])]];
 const t=curB().type;
 if(t==='market')return[['Trade',['sellw','sells','sellf','buyw','buys','buyf']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='guild')return[['Builders',['rb-','rb+']],['Repairers',['rr-','rr+']],['Terraformers',['rt-','rt+']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='academy')return[['Research',['upgrade','iron','plate','steel','mail','drill','tools','harvest','fletch','bastion']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='barracks')return[['Train',['knight','archer','bannerman','captain'].concat(RS.done?['cannon']:[])],['Command',upI(curB()).concat(['army','idle','rally','repair','demolish','rotate','form','mode'])]];
 return[['Train',['peasant'].concat(royalBtns())],...buildGroups(true),['Command',upI(HOMEC()).concat(['army','idle','rallyc','repair','rotate','movec','form','mode'])]]}
function menuItems(){CMP=cv.width/UIS<420;const L=[];ctxGroups().forEach(([n,ks0])=>{let ks=ks0;if(n==='Command'&&sel().length<2)ks=ks.filter(k=>k==='stoneup'||k==='rally'||k==='rallyc'||k==='rotate'||k==='movec'||k==='repair'||(k==='demolish'&&selB&&structs.includes(selB)));if(n==='Siege'&&!RS.done)return;if(!ks.length)return;if(L.length)L.push({gap:7});ks.forEach((k,i)=>{const nc=Object.keys(C[k.startsWith('s:')?k.slice(2):k]||{}).length,it={k:(k in T||k in C)?'buy':k,id:k,grp:n,first:i===0,w:CMP?25:MW+(nc>2?(nc-2)*9:0),h:CMP?25:MH};
  if(n!=='Build'&&TIERK.has(k)&&BCAT)it.tr=0;
  if(k.startsWith('s:')){it.k='buy';it.id=k.slice(2);it.tr=1;it.first=false;it.under=L.find(o=>o.id===it.id&&o.tr===0)||null}
  L.push(it)})});return L}
function flow(L,x0,y0,w){let x=x0,y=y0+(CMP?0:9),rh=0,mx=0,rowStart=true;for(const it of L){if(it.under){it.x=it.under.x;it.y=it.under.y+it.under.h+3;it.lab=false;rh=Math.max(rh,it.y+it.h-y);continue}if(it.br){x=x0+9999}if(it.gap!==undefined){x+=it.gap;continue}if(x+it.w>x0+w&&x>x0){x=x0;y+=rh+(CMP?3:12);rh=0;rowStart=true}it.x=x;it.y=y;it.lab=it.first;rowStart=false;x+=it.w+3;rh=Math.max(rh,it.h);mx=Math.max(mx,x-3)}return{h:y+rh-y0,w:mx-x0}}
const idleP=()=>units.filter(u=>u.t===0&&(!MP.on||(u.pl|0)===CURPL)&&u.type==='peasant'&&!u.job&&!u.o&&!u.carry&&u.hp>0&&!u.shel);
function selPeas(){const P=units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&!u.shel&&(!MP.on||(u.pl|0)===CURPL));if(!P.length)return;units.forEach(u=>u.sel=false);P.forEach(u=>u.sel=true);mode=null;msgS=P.length+' peasants selected';msgT=2}
function selIdle(){const I=idleP();if(!I.length){msgS='No idle peasants';msgT=2;return}units.forEach(u=>u.sel=false);mode=null;I.forEach(u=>u.sel=true);CAM.x=I[0].x/TS;CAM.z=I[0].y/TS;msgS=I.length+' idle peasant'+(I.length>1?'s':'')+' selected';msgT=3}
const upTarget=()=>selB&&structs.includes(selB)?selB:HOMEC();
function itemFn(it){return it.k==='stoneup'?()=>{const L=selBs().filter(s=>s.tier===0&&UPC[s.type]);if(L.length){for(const s of L)build('upgrade',s.tx,s.ty);return}const b=upTarget();if(b)build('upgrade',b.tx,b.ty)}:it.k==='upgtool'?()=>{if(!RS.done){msgS='Needs Stonemasonry';msgT=2;snd('err');return}units.forEach(u=>u.sel=false);mode=mode==='upgrade'?null:'upgrade';snd('click')}:it.k.startsWith('cat:')?()=>{BCAT=it.k.slice(4);snd('click')}:it.k==='back'?()=>{BCAT=null;snd('click')}:ROLEK.has(it.k)?()=>roleAdj(it.k[1],it.k[2]==='+'?1:-1):STNK.has(it.k)?()=>setStance(it.k):it.k==='form'?()=>{formType=(formType+1)%FORMS.length;msgS='Formation: '+FORMS[formType];msgT=2}:it.k==='idle'?selIdle:it.k==='buy'?(it.tr!==undefined?()=>tierPick(it):()=>buy(it.id)):it.k==='army'?army:it.k==='group'?groupSel:it.k==='ungroup'?ungroupSel:it.k==='mode'?()=>{panMode=!panMode}:null}
function uiBtn(x,y,w,h,pal,palH,fn,tip,draw,on,dis){const hit=U(x,y,w,h),hv=inR(mouse,hit)&&!dis&&!!fn;frame(x,y,w,h,dis?(pal===SLOT?SLOTX:BTNX):hv?palH:pal);if(on)gold(x,y,w,h);if(draw)draw(x,y,w,h,hv,dis);uiHits.push({...hit,fn:dis?null:fn,tip})}
const tierC=it=>it.tr===undefined?C[it.id]:(RS.done&&it.tr?CSTONE:CWOOD)[it.id];
function tierPick(it){const t=it.tr;if(t&&!RS.done){msgS='Stone building needs Masonry (Academy)';msgT=3;snd('err');return}const same=!RS.done||BTIER===t;if(mode===it.id&&!same){setTier(t);snd('click');return}setTier(t);buy(it.id)}
function costParts(id,cc){const c=cc||C[id]||{};return Object.entries(c).map(([k,v])=>[String(v),res[k]>=v?({g:'#ffd23c',w:'#e8b27a',s:'#d4dae6',f:'#f2c14e'})[k]:'#ff6a6a',k])}
const RIC=k=>k==='g'?IC.coin:k==='w'?IC.wood:k==='f'?IC.food:IC.stone;
function drawCost(cp,x,y,w,sc,is){const fit=q=>cp.reduce((a,p)=>a+tw(p[0],q)+is*q/sc+3,-3);while(sc>.45&&fit(sc)>w-1){sc-=.04;is-=.4}const tot=cp.reduce((a,p)=>a+tw(p[0],sc)+is+3,-3);let cx=x+(w-tot)/2;cp.forEach(p=>{dIc(RIC(p[2]),cx,y-1.5,is);cx+=is+1;T_(p[0],cx,y,p[1],sc);cx+=tw(p[0],sc)+3})}
const STNK=new Set(['agg','def','hold','stop','work']);function stanceOn(k){const S=sel().filter(u=>u.type!=='peasant');return S.length>0&&S.every(u=>(u.stn||'agg')===k)}
function drawItem(it){const cat=it.k.startsWith('cat:')?it.k.slice(4):null,on=(it.k==='upgtool'&&mode==='upgrade')||(cat&&catItems(cat,true).includes(mode))||(it.k==='buy'&&mode===it.id&&(it.tr===undefined||(it.tr?stoneOn():!stoneOn())))||(it.k==='mode'&&panMode)||(it.k==='form'&&formType>0)||(STNK.has(it.k)&&it.k!=='stop'&&it.k!=='work'&&stanceOn(it.k)),dis=it.k==='buy'&&((it.tr===1&&!RS.done)||!ok(tierC(it)||{})||over||(it.id==='upgrade'&&(RS.done||RS.on))||(((it.id in RT2)||it.id==='upgrade')&&!hasAcademy(LPL()))||((it.id in RT2)&&(RS2.done[it.id]||RS2.on||(RPRE[it.id]&&!(RPRE[it.id]==='masonry'?RS.done:RS2.done[RPRE[it.id]]))))||(it.id in T&&it.id!=='ballista'&&it.id!=='trebuchet'&&popUsed(LPL())+popOf(it.id)>popCap(LPL()))||(it.id==='cannon'&&!RS.done))||(it.k==='stoneup'&&(()=>{const b=upTarget(),c=b&&UPC[b.type];return !RS.done||!c||!ok(c)})());
 let tip=TIPS[it.id||it.k];if(it.k==='buy'&&C[it.id]&&!TRADEK.has(it.id))tip=[NAMES[it.id]].concat(TIPS[it.id].slice(1),['']);if(it.tr!==undefined)tip=[(it.tr?'Stone ':'Wooden ')+NAMES[it.id].toLowerCase()+(it.tr||HK[it.id]===undefined?'':' ['+HK[it.id]+']'),it.tr?'Much tougher: holds the horde far longer':'Cheap and quick to build'].concat(it.tr&&!RS.done?['Locked: research Masonry at the Academy']:[],['']);if(it.k==='buy'&&tip&&((it.id in RT2)||it.id==='upgrade')){const up=it.id==='upgrade',ex=[];if(up?RS.done:RS2.done[it.id])ex.push('Already researched');else if(up?RS.on:RS2.on===it.id)ex.push('In progress: '+Math.floor(up?RS.t/RT_TIME*100:RS2.t/RT2[it.id]*100)+'%');else if(!up&&RS2.on)ex.push('Wait: '+RN2[RS2.on]+' first');if(!hasAcademy(LPL()))ex.push('Needs your own Academy');if(MP.on)ex.push('Shared: helps both players');if(ex.length)tip=tip.slice(0,-1).concat(ex,[tip[tip.length-1]])}
 const ic=it.k==='stoneup'||it.k==='upgtool'?IC.upgrade:it.tr!==undefined?(ICT[it.tr][it.id]||IC[it.id]):cat?IC[BCI[cat]]:it.k==='back'?IC.back:ROLEK.has(it.k)?IC[({b:'wall',r:'repair',t:'raise'})[it.k[1]]]:STNK.has(it.k)?IC[it.k]:it.k==='buy'?IC[it.id]:it.k==='army'?IC.army:it.k==='idle'?IC.idle:it.k==='form'?IC.group:panMode?IC.pan:IC.cursor;
 const nm=NAMES[it.id]||'',idleN=it.k==='idle'?idleP().length:0;
 if(it.lab&&!CMP)TN(it.grp,it.x+1,it.y-9.5,'#d6b46a',.72);
 uiBtn(it.x,it.y,it.w,it.h,SLOT,SLOTH,itemFn(it),tip,(x,y,w,h)=>{ctx.globalAlpha=dis?.45:1;if(CMP){dIc(ic,x+((w-17)>>1),y+((h-17)>>1)+1,17);ctx.globalAlpha=1;if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+2,y+1.5,'#ffff55',.6);if(idleN)T_('!',x+w-5,y+1,'#ff6a6a',.7);return}dIc(ic,x+((w-16)>>1),y+4,16);
  let sc=.7;while(sc>.5&&tw(nm,sc)>w-3)sc-=.03;TC(nm,x+w/2,y+21.5,dis?'#b8b8b8':'#ffffff',sc);ctx.globalAlpha=1;
  const rdn=it.k==='buy'&&((it.id==='upgrade'&&RS.done)||((it.id in RT2)&&RS2.done[it.id])),ron=it.k==='buy'&&((it.id==='upgrade'&&RS.on)||((it.id in RT2)&&RS2.on===it.id));
  if(rdn){ctx.globalAlpha=1;T_('Done',x+(w-tw('Done',.62))/2,y+29.5,'#6aff7a',.62);ctx.strokeStyle='#0b0810';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(x+w-12,y+7);ctx.lineTo(x+w-8,y+11);ctx.lineTo(x+w-2.5,y+3.5);ctx.stroke();ctx.strokeStyle='#6aff7a';ctx.lineWidth=1.8;ctx.stroke()}
  else if(ron){const pc=Math.floor((it.id==='upgrade'?RS.t/RT_TIME:RS2.t/RT2[it.id])*100)+'%';T_(pc,x+(w-tw(pc,.62))/2,y+29.5,'#ffe066',.62);ctx.fillStyle='#ffe066';ctx.fillRect(x+3,y+h-3,(w-6)*Math.min(1,parseInt(pc)/100),1.5)}
  else if(it.k==='buy'&&(it.id==='dig'||it.id==='raise'||it.id==='ramp'))T_('Free',x+(w-tw('Free',.62))/2,y+29.5,'#55ff55',.62);else if(it.tr===1&&!RS.done){T_('Locked',x+(w-tw('Locked',.62))/2,y+29.5,'#ff8a6a',.62)}else if(it.k==='buy'){drawCost(costParts(it.id,tierC(it)),x,y+29.5,w,.62,7)}
  else if(it.k==='stoneup'){const b=upTarget(),c=b&&UPC[b.type],n=Math.max(1,selBs().filter(s=>s.tier===0&&UPC[s.type]).length);if(!RS.done)T_('Masonry',x+(w-tw('Masonry',.58))/2,y+29.5,'#ff8a6a',.58);else if(c)drawCost(Object.entries(c).map(([k,v])=>[String(v*n),res[k]>=v*n?'#d4dae6':res[k]>=v?'#f2c14e':'#ff6a6a',k]),x,y+29.5,w,.62,7)}
  else if(it.k==='upgtool')T_('Paint',x+(w-tw('Paint',.62))/2,y+29.5,mode==='upgrade'?'#ffff55':'#e0e0e0',.62);
  else if(cat){const s=BCATS[cat][1].length+' types';T_(s,x+(w-tw(s,.62))/2,y+29.5,'#d6b46a',.62)}
  else if(it.k==='back')T_('Esc',x+(w-tw('Esc',.62))/2,y+29.5,'#ffff55',.62);
  else if(it.k==='idle'){T_(idleN?idleN+' idle':'none',x+(w-tw(idleN?idleN+' idle':'none',.62))/2,y+29.5,idleN?'#ffff55':'#b0b0b0',.62)}
  else if(it.k==='mode')T_(panMode?'Pan':'Select',x+(w-tw(panMode?'Pan':'Select',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='army')T_('fighters',x+(w-tw('fighters',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='form')T_(FORMS[formType],x+(w-tw(FORMS[formType],.62))/2,y+29.5,formType?'#ffff55':'#e0e0e0',.62);
  else if(ROLEK.has(it.k)){const r=it.k[1],p=LPL(),s=RHAS[p][r]+' / '+ROLE[p][r];T_(s,x+(w-tw(s,.62))/2,y+29.5,ROLE[p][r]?'#ffff55':'#b0b0b0',.62)}
  if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+3,y+2.5,'#ffff55',.68);
  if(it.tr===1&&!RS.done){ctx.globalAlpha=1;const lx=x+w-10,ly=y+3;ctx.strokeStyle='#e8c070';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(lx+3.5,ly+3.5,2.2,Math.PI,0);ctx.stroke();ctx.fillStyle='#e8c070';ctx.fillRect(lx,ly+3.5,7,5.5);ctx.fillStyle='#3a2a10';ctx.fillRect(lx+3,ly+5.3,1,2)}
  if(idleN)T_('!',x+w-6,y+2,'#ff6a6a',.8);
  if(cat){ctx.fillStyle='#d6b46a';ctx.beginPath();ctx.moveTo(x+w-2.5,y+2.5);ctx.lineTo(x+w-2.5,y+8.5);ctx.lineTo(x+w-8.5,y+2.5);ctx.closePath();ctx.fill()}},on,dis);
 if(it.k==='buy'){const hh=uiHits[uiHits.length-1];hh.price=true;hh.cost=it.id}}
function bar(x,y,w,f,c1,c2){f=Math.max(0,Math.min(1,f));rr(x,y,w,7,3.5);ctx.fillStyle='#150e09';ctx.fill();if(f>0){const ww=Math.max(5,(w-2)*f);rr(x+1,y+1,ww,5,2.5);const g=ctx.createLinearGradient(0,y,0,y+7);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fill()}rr(x,y,w,7,3.5);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.stroke()}
function viewPoly(){const w=cv.width,h=cv.height,P=[[0,h*.02],[w,h*.02],[w,h],[0,h]].map(([a,b])=>pickGround(a,b));return P.every(p=>p)?P.map(p=>[p.x,p.z]):null}
const mmss=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
/* ---- world drawing shared by minimap and big map ---- */
const MMC={c:null,g:null,t:-9};
function drawWorld(x,y,w,h,big){
 if(!big){const W2=Math.max(1,Math.round(w*UIS)),H2=Math.max(1,Math.round(h*UIS));if(!MMC.c||MMC.c.width!==W2||MMC.c.height!==H2){MMC.c=cvs(W2,H2);MMC.g=MMC.c.getContext('2d');MMC.t=-9}
  if(clockT-MMC.t>.2||clockT<MMC.t){MMC.t=clockT;const o=ctx;ctx=MMC.g;try{ctx.setTransform(W2/w,0,0,H2/h,0,0);dwBase(0,0,w,h,false)}finally{ctx=o}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(MMC.c,Math.round(x*UIS),Math.round(y*UIS));ctx.restore()}
 else dwBase(x,y,w,h,true);
 const sx=w/TW,sy=h/TH,VL=visLanes();ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(const a of ALERTS){const X=x+a.x/TS*sx,Y=y+a.y/TS*sy,r=(big?4:3)+((a.t*3)%1)*(big?8:5);ctx.strokeStyle='rgba(255,70,70,.95)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(X,Y,r,0,6.283);ctx.stroke()}
 const vp=viewPoly();if(vp){ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1;ctx.beginPath();vp.forEach((p,i)=>{const X=x+p[0]*sx,Y=y+p[1]*sy;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.closePath();ctx.stroke()}
 ctx.restore();
 const cs=big?13:9;for(const c0 of CASTLES())dIc(IC.home,x+c0.x/TS*sx-cs/2,y+c0.y/TS*sy-cs/2-1,cs);
 ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const p=R.pts[0],X=x+p[0]*sx,Y=y+p[1]*sy,r=big?6:4;circ(ctx,X,Y,r,nextL.includes(k)?'#c01f2f':'#6a1a22','#fff',1);if(big)dIc(IC.skull,X-5,Y-5.5,10);else{ctx.fillStyle='#fff';ctx.fillRect(X-1,Y-1,2,2)}})}
function dwBase(x,y,w,h,big){const sx=w/TW,sy=h/TH;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.imageSmoothingEnabled=false;ctx.drawImage(big?mc:mm2,x,y,w,h);ctx.drawImage(FOWC,x,y,w,h);
 const VL=visLanes();ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const nx=nextL.includes(k),r0=Math.max(0,(LANE_REAR[k]|0)-2);ctx.beginPath();R.pts.forEach((p,i)=>{if(i<r0)return;i>r0?ctx.lineTo(x+p[0]*sx,y+p[1]*sy):ctx.moveTo(x+p[0]*sx,y+p[1]*sy)});ctx.lineJoin='round';
  ctx.strokeStyle='rgba(30,0,0,.7)';ctx.lineWidth=(big?4:2.8)*(nx?1.15:1);ctx.stroke();ctx.strokeStyle=nx?'#ff3b3b':'rgba(214,60,60,.72)';ctx.lineWidth=(big?2.2:1.4)*(nx?1.2:1);ctx.stroke()});
 for(const s of structs){ctx.fillStyle=s.type==='castle'?'#ffd23c':'#7fb2ff';const z=s.type==='castle'?(big?4:3):(big?2:1.4);ctx.fillRect(x+s.x/TS*sx-z/2,y+s.y/TS*sy-z/2,z,z)}
 ctx.lineWidth=big?1.4:1;for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const r=aiR(b)*sx,X=x+b.x/TS*sx,Y=y+b.y/TS*sy;ctx.beginPath();ctx.rect(X-r,Y-aiR(b)*sy,2*r,2*aiR(b)*sy);ctx.fillStyle=PAL[b.ci][1]+'26';ctx.fill();ctx.strokeStyle=PAL[b.ci][1]+'cc';ctx.stroke()}
 {ctx.save();ctx.beginPath();for(const k of OWN){const i=k&4095,j=k>>12,x0=x+i*2*sx,y0=y+j*2*sy,w2=2*sx,h2=2*sy;if(!OWN.has(k-1)){ctx.moveTo(x0,y0);ctx.lineTo(x0,y0+h2)}if(!OWN.has(k+1)){ctx.moveTo(x0+w2,y0);ctx.lineTo(x0+w2,y0+h2)}if(!OWN.has(k-4096)){ctx.moveTo(x0,y0);ctx.lineTo(x0+w2,y0)}if(!OWN.has(k+4096)){ctx.moveTo(x0,y0+h2);ctx.lineTo(x0+w2,y0+h2)}}ctx.strokeStyle=PAL[THEME.c][1];ctx.lineWidth=big?2:1.4;ctx.stroke();ctx.restore()}
{for(const c0 of CASTLES()){const X=x+c0.x/TS*sx,Y=y+c0.y/TS*sy;ctx.beginPath();ctx.rect(X-TR_CASTLE*sx,Y-TR_CASTLE*sy,2*TR_CASTLE*sx,2*TR_CASTLE*sy);ctx.fillStyle=PAL[THEME.c][1]+'2a';ctx.fill();ctx.strokeStyle=PAL[THEME.c][1];ctx.stroke()}for(const s of structs)if(s.t===0&&s.type==='tower'&&s.prog>=1){ctx.beginPath();ctx.rect(x+s.x/TS*sx-TR_TOWER*sx,y+s.y/TS*sy-TR_TOWER*sy,2*TR_TOWER*sx,2*TR_TOWER*sy);ctx.fillStyle=PAL[THEME.c][1]+'22';ctx.fill()}}
 for(const h of HORDES){if(h.act||!fowVisAt(h.x,h.y))continue;const z=(big?2.2:1.5)+Math.min(2,h.n/30);ctx.fillStyle='rgba(255,70,70,.85)';ctx.fillRect(x+h.x/TS*sx-z/2,y+h.y/TS*sy-z/2,z,z)}
 for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const z=(big?4:2.6)+b.lvl*.35,col=PAL[b.ci][1];ctx.fillStyle='#000';ctx.fillRect(x+b.x/TS*sx-z/2-1,y+b.y/TS*sy-z/2-1,z+2,z+2);ctx.fillStyle=col;ctx.fillRect(x+b.x/TS*sx-z/2,y+b.y/TS*sy-z/2,z,z)}
 {const st=Math.max(1,Math.ceil(SW.n/2500)),z=big?1.6:1.1;ctx.fillStyle='#ff5bff';for(let i=0;i<SW.n;i+=st){const x0=SW.x[i],y0=SW.y[i];if(!fowVisAt(x0,y0))continue;ctx.fillRect(x+x0/TS*sx-z/2,y+y0/TS*sy-z/2,z,z)}}
 for(const u of units){if(u.t===2||u.shel||(u.t&&!fowVisAt(u.x,u.y)))continue;ctx.fillStyle=u.t?'#ff5bff':'#ffffff';const z=u.type==='brute'?3:big?1.8:1.2;ctx.fillRect(x+u.x/TS*sx-z/2,y+u.y/TS*sy-z/2,z,z)}
 ctx.restore()}
/* ---- overlays ---- */
function pill(x,y,w,h,label,pal,palH,fn,ic,sc,on,dis){uiBtn(x,y,w,h,pal,palH,fn,null,(X,Y,W2,H2)=>{const s=sc||1,tx=tw(label,s),iw=ic?h*.62+4:0;let cx=X+(W2-tx-iw)/2;if(ic){dIc(ic,cx,Y+(H2-h*.62)/2,h*.62);cx+=iw}T_(label,cx,Y+(H2-9*s)/2+.5*s,dis?'#8a7660':'#fff',s)},on,dis)}
function drawMapModal(UW,UH){ctx.fillStyle='rgba(5,8,16,.8)';ctx.fillRect(0,0,UW,UH);
 const aw=UW-20,ah=UH-68,mw=Math.min(aw,ah*TW/TH),mh=mw*TH/TW,pw=mw+16,ph=mh+50,px=(UW-pw)/2,py=(UH-ph)/2,mx=px+8,my=py+30;
 uiHits=[];uiRects=[U(0,0,UW,UH)];frame(px,py,pw,ph,PAN,6);
 dIc(IC.map,px+8,py+7,15);TTL('World map',px+26,py+8,1.22);
 let lx=px+pw-8-18-6;const leg=[['Your base',IC.home,null],['Spawn',IC.skull,null],['Next zombie route',null,'#ff3b3b']];
 for(const[t,ic,col]of leg.slice().reverse()){const w=tw(t,.85)+(ic?12:14);lx-=w+8;if(lx<px+40+twH('World map',1.22))break;if(ic)dIc(ic,lx,py+9,10);else{ctx.fillStyle=col;ctx.fillRect(lx,py+13,10,2.4)}T_(t,lx+13,py+10.5,'#ead8ba',.85)}
 uiBtn(px+pw-8-18,py+6,18,18,RDB,RDB,()=>{showMap=false},['Close [M]'],(x,y,w,h)=>dIc(IC.close,x+3,y+3,12));
 frame(mx-2,my-2,mw+4,mh+4,['#0b0f1a','#1a2236','#070a12'],4);
 drawWorld(mx,my,mw,mh,true);
 uiHits.push({...U(mx,my,mw,mh),fn:()=>{CAM.x=Math.max(2,Math.min(TW-2,(mouse.x-mx*UIS)/(mw*UIS)*TW));CAM.z=Math.max(2,Math.min(TH-2,(mouse.y-my*UIS)/(mh*UIS)*TH));showMap=false},tip:null});
 const pr=Math.round(genN/(NCX*NCY)*100);T_('Map #'+((SEED*1000)|0)+(pr<100?'   Generating '+pr+'%':'   '+TW+' x '+TH+' tiles')+'   Click to jump there',mx,my+mh+6,'#b59773',.85)}
/* ---- castle site picker ---- */
let picking=false,pickPos=null,pvC=null,pvKey=-1,pvH=null,pvW=null,pickMsg='';const PVS=3,PVW=Math.ceil(TW/PVS),PVH=Math.ceil(TH/PVS);
function buildPreview(){pvKey=SEED;pvC=cvs(PVW,PVH);const g=pvC.getContext('2d'),im=g.createImageData(PVW,PVH);pvH=new Uint8Array(PVW*PVH);pvW=new Uint8Array(PVW*PVH);
 for(let y=0;y<PVH;y++)for(let x=0;x<PVW;x++){const h=baseHW(Math.min(TW-1,x*PVS+1),Math.min(TH-1,y*PVS+1)),wt=_bwat,i=y*PVW+x;pvH[i]=h;pvW[i]=wt?1:0;let c;
  if(wt)c=[45,111,174];else if(h>=SNOW)c=[238,242,248];else if(h>=ROCKH)c=[138,143,153];else{const k=Math.max(0,Math.min(1,(h-LAND)/24));c=[(79+60*k)|0,(157-20*k)|0,(69+30*k)|0]}
  if(x>0&&y>0&&!wt){const d=(h-pvH[i-PVW-1])*5;c=c.map(v=>Math.max(0,Math.min(255,v+d)))}
  im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255}
 g.putImageData(im,0,0)}
let SITEM=null,SITEK=-1;
/* every preview cell where a castle may be founded (same rule as siteOK, computed at once with a summed-area table) */
function siteMaskGet(){if(SITEK===SEED&&SITEM)return SITEM;if(pvKey!==SEED||!pvW)buildPreview();const W=PVW,H=PVH,W1=W+1,B=new Int32Array(W1*(H+1));
 for(let j=0;j<H;j++){let row=0;for(let i=0;i<W;i++){const k=j*W+i;row+=(pvW[k]||pvH[k]>=ROCKH)?1:0;B[(j+1)*W1+i+1]=B[j*W1+i+1]+row}}
 const M=new Uint8Array(W*H);for(let cy=6;cy<H-6;cy++)for(let cx=6;cx<W-6;cx++){const tx=cx*PVS+1,ty=cy*PVS+1;if(tx<140||ty<110||tx>TW-140||ty>TH-110)continue;const x0=cx-2,x1=cx+3,y0=cy-2,y1=cy+3;if(B[y1*W1+x1]-B[y0*W1+x1]-B[y1*W1+x0]+B[y0*W1+x0]===0)M[cy*W+cx]=1}
 SITEK=SEED;return SITEM=M}
function siteOK(tx,ty){if(tx<140||ty<110||tx>TW-140||ty>TH-110)return false;const cx=(tx/PVS)|0,cy=(ty/PVS)|0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const x=cx+i,y=cy+j;if(x<0||y<0||x>=PVW||y>=PVH)return false;const k=y*PVW+x;if(pvW[k]||pvH[k]>=ROCKH)return false}return true}
function randomSite(){if(pvKey!==SEED)buildPreview();for(let a=0;a<2000;a++){const tx=140+((Math.random()*(TW-280))|0),ty=110+((Math.random()*(TH-220))|0);if(siteOK(tx,ty)){pickPos={tx,ty,ok:true};return}}}
function openPicker(){picking=true;PKL.on=true;pickPos=null;pickMsg='';if(pvKey!==SEED)buildPreview();randomSite();if(!PK)pkInit();pkFocus();PK.dist=400;if(pickPos)pkLiveFocus(pickPos.tx,pickPos.ty)}
function confirmPick(){if(!pickPos||!pickPos.ok)return;CX=pickPos.tx;CY=pickPos.ty;CROT=PKROT&3;picking=false;setupOpen=false;reset();inGame=false;startGame()}
function drawPicker(UW,UH){nameBox=null;if(pvKey!==SEED)buildPreview();uiHits=[];
 const pw=Math.min(UW-12,600),px=(UW-pw)/2,ph=50,py=UH-ph-6;uiRects=[U(px,5,pw,22),U(px,py,pw,ph)];
 const rw=pw>=420?112:0;
 frame(px,5,pw,22,PAN,6);dIc(IC.home,px+8,8,15);{const s='Choose where to found your kingdom';let sc=1.12;while(sc>.7&&twH(s,sc)>pw-(pw>=300?132:34)-rw)sc-=.04;TTL(s,px+26,16-TTS(sc)/2,sc)}
 if(pw>=300)pill(px+pw-96,7,90,18,PKL.on?'World map':'Castle view',BTN,BTNH,()=>{PKL.on=!PKL.on;if(PKL.on&&pickPos)pkLiveFocus(pickPos.tx,pickPos.ty);else if(PK)pkFocus()},IC.map,.8);
 if(rw)pill(px+pw-96-rw,7,rw-6,18,'Turn castle ['+KB.rotate.toUpperCase()+']',BTN,BTNH,pkRotate,IC.rotate||null,.8);
 frame(px,py,pw,ph,PAN,6);const by=py+7,bw=Math.min(92,(pw-24)/4);
 pill(px+8,by,bw,18,'Random spot',BTN,BTNH,()=>{randomSite();pkFocus();pickMsg=''},IC.dice,.85);
 if(!(MP.conn&&!MP.host))pill(px+8+bw+5,by,bw,18,'New map',BTN,BTNH,()=>{rollWorld();randomSite();pkFocus();pickMsg=''},IC.map,.85);
 pill(px+8+(bw+5)*2,by,bw,18,'Back',BTN,BTNH,()=>{picking=false;if(MP.conn)lobbyShow()},null,.85);
 if(pw>=560&&!(MP.conn&&!MP.host))pill(px+8+(bw+5)*3,by,bw,18,'Daily map',BTN,BTNH,()=>{dailyMap();randomSite();pkFocus();pickMsg=''},IC.map,.85);
 const sw=Math.max(44,Math.min(140,pw-16-(bw+5)*(pw>=560?4:3)));pill(px+pw-8-sw,by,sw,18,MP.conn?'Place my castle':'Found kingdom',GRN,GRNH,confirmPick,IC.play,.9,false,!(pickPos&&pickPos.ok));
 const hv=PKL.on?PKL.hit:PK&&PK.hit;T_(pickMsg||(hv?(hv.ok?'Good site - click to place your castle here':'Not suitable: needs dry, gentle land away from the edge'):'Map #'+((SEED*1000)|0)),px+8,py+31,pickMsg?'#ff9a9a':hv&&hv.ok?'#9ff0b0':'#b59773',.8);
 T_(PKL.on?'Click to place the castle  -  drag / WASD: move   Right drag: rotate   Wheel: zoom':'Left drag: move   Right drag: rotate   Wheel: zoom',px+8,py+40,'#b59773',.7)}
/* turn the castle a quarter turn while choosing its site (its door faces the new side) */
function pkRotate(){PKROT=(PKROT+1)&3;snd('click');pickMsg=''}
let nameBox=null;
const nmI=document.createElement('input');nmI.type='text';nmI.maxLength=18;nmI.spellcheck=false;nmI.autocomplete='off';nmI.setAttribute('aria-label','Kingdom name');
Object.assign(nmI.style,{position:'fixed',display:'none',zIndex:5,color:'#f2e4c4',background:'#0b0f17',border:'1px solid #c9a24f',borderRadius:'0',padding:'0 7px',outline:'none',boxSizing:'border-box',fontWeight:'400',fontFamily:FF});
document.body.appendChild(nmI);nmI.value=THEME.n;nmI.oninput=()=>{THEME.n=nmI.value.slice(0,18)||'Nameless';saveTheme()};nmI.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')nmI.blur()};
function placeInput(){if(!nameBox||started){nmI.style.display='none';return}const k=UIS/DPR,s=nmI.style;s.display='block';s.left=(nameBox.x*k)+'px';s.top=(nameBox.y*k)+'px';s.width=(nameBox.w*k)+'px';s.height=(nameBox.h*k)+'px';s.fontSize=(9.5*k)+'px';if(document.activeElement!==nmI&&nmI.value!==THEME.n)nmI.value=THEME.n}
let uiMul=1;try{uiMul=+localStorage.getItem('dk_ui')||1}catch(e){}
let TOPH=28,fromGame=false,setupOpen=false,settingsOpen=false,rebind=null,sliderDrag=null;
const KDEF={cannon:'/',peasant:'1',knight:'2',archer:'3',bannerman:'4',captain:'5',wall:'6',gate:'7',tower:'8',path:'9',ballista:'b',trebuchet:'t',raise:'y',dig:'u',army:'q',idle:'.',form:'v',rotate:'r',sound:'o',wave:'n',home:'h',map:'m',upgrade:'g',barracks:'c',farm:'j',peas:'e',storage:'k',house:'0',movec:',',academy:';',market:':',forester:'[',guild:']',torch:"'",rally:'-',rallyc:'=',ramp:'i',tier:'l',demolish:'p',pause:' ',speed:'f',up:'w',down:'s',left:'a',right:'d',rotL:'z',rotR:'x'};
const ACTL={king:'Summon King Naraige',guard:'Train a royal guard',cannon:'Train cannon',movec:'Move castle',rotate:'Rotate building',peasant:'Train peasant',knight:'Train knight',archer:'Train archer',bannerman:'Train bannerman',captain:'Train captain',upgrade:'Masonry research',barracks:'Build barracks',farm:'Build farm',storage:'Build storage',house:'Build house',academy:'Build academy',market:'Build market',forester:'Build forester hut',guild:'Build builders guild',torch:'Build torch',rally:'Barracks rally point',rallyc:'Castle rally point',peas:'Select all peasants',tier:'Wood / stone tier',demolish:'Demolish building',ramp:'Dig a ramp',wall:'Build wall',gate:'Build gate',tower:'Build tower',path:'Build path',ballista:'Ballista',trebuchet:'Trebuchet',raise:'Raise ground',dig:'Dig ground',army:'Select army',idle:'Idle peasants',form:'Formation',rotate:'Rotate building',sound:'Mute sound',wave:'Call wave',home:'Back to base',map:'World map',pause:'Pause',speed:'Game speed',up:'Camera up',down:'Camera down',left:'Camera left',right:'Camera right',rotL:'Turn camera left',rotR:'Turn camera right'};
let KB={...KDEF};try{Object.assign(KB,JSON.parse(localStorage.getItem('dk_keys')||'{}'))}catch(e){}
const kdisp=k=>k===' '?'Space':k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1);
function syncHK(){for(const a of['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path','upgrade','barracks','farm','storage','house','academy','market','forester','guild','torch','rally','rallyc','movec','rotate','ramp','tier','demolish','ballista','trebuchet','raise','dig','army','idle','form'])HK[a]=kdisp(KB[a])}
function saveKB(){try{localStorage.setItem('dk_keys',JSON.stringify(KB))}catch(e){}syncHK()}syncHK();
function slider(x,y,w,val,set){const v=Math.max(0,Math.min(1,val));frame(x-4,y-1,w+8,13,BTNX,0);frame(Math.round(x-4+(w)*v),y-2,8,15,inR(mouse,U(x-5,y-2,w+10,15))?BTNH:BTN,0);
 uiHits.push({...U(x-5,y-2,w+10,15),fn:()=>{sliderDrag={x,w,set};set(Math.max(0,Math.min(1,(mouse.x/UIS-x)/w)))},tip:null})}
function setGfx(v){GQ=v?1:0;GQU.value=GQ;try{localStorage.setItem('dk_gfx',GQ)}catch(e){}DRS.lv=0;DRS.sum=DRS.cs=DRS.n=DRS.t=DRS.ok=DRS.chk=0;DRS.noDn=DRS.noUp=0;rs();if(SHADOWS){const ss=GQ?2048:1024;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}renderer.shadowMap.needsUpdate=true}}
let setTab=0;
function drawSettings(UW,UH,cx){const W=Math.min(UW-12,setTab?560:340),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=6,H=UH-12;frame(X,Y,W,H,PAN,6);TTL('Settings',X+10,Y+7,1.35);
 {const tw0=Math.min(62,(W-120)/2);[['General',0],['Controls',1]].forEach(([n,v],i)=>pill(X+W-10-(tw0+4)*(2-i)+4,Y+7,tw0,15,n,BTN,BTNH,()=>{setTab=v;rebind=null},null,.8,setTab===v))}
 let y=Y+28;
 if(setTab){T_('Click a key, then press the new one  (Esc cancels)',X+10,y+3,'#d9b27a',.75);pill(X+W-100,y,90,15,'Reset keys',BTN,BTNH,()=>{KB={...KDEF};saveKB()},null,.8);y+=21;
  const acts=Object.keys(KDEF),avail=Y+H-30-y;let cols=Math.max(1,Math.min(4,Math.floor((W-20)/130)));while(cols<4&&avail/Math.ceil(acts.length/cols)<12&&(W-20)/(cols+1)>=96)cols++;
  const rows=Math.ceil(acts.length/cols),cw=(W-20)/cols,rh=Math.min(16,avail/rows);
  acts.forEach((a,i)=>{const c=(i/rows)|0,r=i%rows,x=X+10+c*cw,yy=y+r*rh;const lb=ACTL[a];let sc=.72;while(sc>.5&&tw(lb,sc)>cw-48)sc-=.04;T_(lb,x,yy+Math.max(1,(rh-10)/2),'#ead8ba',sc);
   uiBtn(x+cw-44,yy,38,rh-2,rebind===a?GRN:BTN,rebind===a?GRNH:BTNH,()=>{rebind=a},null,(bx,by,bw,bh)=>TC(rebind===a?'...':kdisp(KB[a]),bx+bw/2,by+(bh-6)/2,'#fff',.7))})}
 else{T_('Music',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,vM,v=>{vM=v;applyVol();saveVol()});T_(Math.round(vM*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=17;
 T_('Sound effects',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,vS,v=>{vS=v;applyVol();saveVol()});T_(Math.round(vS*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=19;
 const bw3=Math.min(100,(W-30)/2);pill(X+10,y,bw3,16,'Sound: '+(sndOn?'on':'off'),BTN,BTNH,toggleSound,null,.85);y+=20;
 
 T_('Language',X+10,y+3,'#ead8ba',.85);{const lw=Math.min(150,W-120);langBtn(X+W-10-lw,y-2,lw,20,LANG,()=>{langOpen=true;settingsOpen=false},false)}y+=24;
  T_('Graphics',X+10,y+3,'#ead8ba',.85);{const bw6=Math.min(70,(W-130)/2);[['Ultra HD',1],['Fast',0]].forEach(([n,v],i)=>pill(X+W-10-(bw6+4)*(2-i)+4,y,bw6,16,n,BTN,BTNH,()=>setGfx(v),null,.8,GQ===v))}y+=22;
 T_('Interface size',X+10,y+3,'#ead8ba',.85);{const bw4=Math.min(60,(W-130)/3);[['Small',.8],['Normal',1],['Large',1.25]].forEach(([n,v],i)=>pill(X+W-10-(bw4+4)*(3-i)+4,y,bw4,16,n,BTN,BTNH,()=>{uiMul=v;try{localStorage.setItem('dk_ui',v)}catch(e){}rs()},null,.8,Math.abs(uiMul-v)<.01))}y+=22;}
 pill(X+W/2-40,Y+H-22,80,16,'Back',BTN,BTNH,()=>{settingsOpen=false;rebind=null;setTab=0;if(fromGame){fromGame=false;startGame()}},null,.9)}
function menuCx(UW,pw){return UW/2}

function titleBack(UW,UH,cx,pw){const g=ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(6,10,22,.08)');g.addColorStop(.55,'rgba(6,10,22,.12)');g.addColorStop(1,'rgba(6,10,22,.6)');ctx.fillStyle=g;ctx.fillRect(0,0,UW,UH);
 {const rg=ctx.createRadialGradient(cx,UH*.4,20,cx,UH*.4,Math.max(UW,UH)*.55);rg.addColorStop(0,'rgba(8,6,16,.5)');rg.addColorStop(1,'rgba(8,6,16,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,UW,UH)}}
function drawTitle(UW,UH){nameBox=null;uiHits=[];uiRects=[U(0,0,UW,UH)];const pw=Math.min(300,UW-16),cx=menuCx(UW,pw),small=UH<330;if(!inGame&&TFADE>.003&&!window.__cam){ctx.fillStyle='rgba(4,3,8,'+(TFADE*.92).toFixed(3)+')';ctx.fillRect(0,0,UW,UH)}titleBack(UW,UH,cx,pw);
 if(settingsOpen){dirtBack(UW,UH);drawSettings(UW,UH,cx);return}
  if(saveOpen){dirtBack(UW,UH);drawSaves(UW,UH,cx);return}
  if(langOpen){dirtBack(UW,UH);drawLang(UW,UH,cx);return}
 if(setupOpen){dirtBack(UW,UH);drawSetup(UW,UH,cx,Math.min(UW-16,380),small);return}
 let y=Math.max(8,UH*(small?.05:.1));uiBtn(UW-30,6,24,20,BTN,BTNH,()=>{settingsOpen=true},['Settings'],(x,yy,w,h)=>dIc(IC.gear,x+5,yy+3,14));
 if(inGame){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,UW,UH);y=Math.max(12,UH*.16);TTL('Game Menu',cx,y,1.75,'center');y+=34}else{
 const gw=Math.min(UW*.8,440),cs=Math.max(4,Math.floor(gw/47)),lw=cs*47,lx=Math.round(cx-lw/2);mcLogo('NARANXIA',lx,Math.round(y),cs);y+=cs*5+cs*1.1;
 {const sp=L(MCSPL[Math.floor(clockT/7)%MCSPL.length]),a=.7+.3*Math.sin(clockT*2.3),S=Math.round(Math.max(9,Math.min(cs*1.75,15)));ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.font='600 '+S+'px '+FFT;
  const tw2=ctx.measureText(sp).width;ctx.fillStyle='rgba(4,3,8,.75)';ctx.fillText(sp,cx+1,y+1.5);ctx.shadowColor='rgba(60,190,255,'+(.85*a).toFixed(3)+')';ctx.shadowBlur=Math.max(4,cs*1.5);ctx.fillStyle='#c8f3ff';ctx.fillText(sp,cx,y);ctx.shadowBlur=0;ctx.shadowColor='transparent';
  const ly=Math.round(y+S*.55),lg=Math.min(60,cs*7);for(const sd of[-1,1]){const x0=cx+sd*(tw2/2+8),gr=ctx.createLinearGradient(x0,0,x0+sd*lg,0);gr.addColorStop(0,'rgba(214,176,96,.9)');gr.addColorStop(1,'rgba(214,176,96,0)');ctx.fillStyle=gr;ctx.fillRect(Math.min(x0,x0+sd*lg),ly,lg,1);arcDia(x0,ly+.5,2,'#d8b060')}
  ctx.restore();y+=S+Math.round(small?6:cs*1.3)}
 }const bw=Math.min(UW-24,Math.max(200,Math.min(300,UW*.5))),bh=small?22:26,gp=small?5:9,bx=Math.round(cx-bw/2);
 const mb=(lab,fn)=>{pill(bx,y,bw,bh,lab,BTN,BTNH,fn,null,1.15);y+=bh+gp};
 mb(inGame?'Back to Game':'Singleplayer',inGame?startGame:()=>{setupOpen=true});if(inGame&&!MP.on)mb('Save / Load',()=>{saveOpen=true;svList=null});else if(!inGame)mb('Load game',()=>{saveOpen=true;svList=null});if(inGame)mb('New game',newGame);if(inGame)mb('Quit game',quitGame);mb('Multiplayer (Co-op)',mpOpen);if(!inGame&&window.NARX&&NARX.desktop)mb('Exit to desktop',()=>window.close());
 {const hw=Math.round((bw-gp)/2);pill(bx,y,hw,bh,'Options',BTN,BTNH,()=>{settingsOpen=true},null,1.15);pill(bx+hw+gp,y,bw-hw-gp,bh,sndOn?'Sound: on':'Sound: off',BTN,BTNH,()=>{toggleSound()},null,1.15);y+=bh+gp}
 if(best.w>0){TC('Best: wave '+best.w+'  -  '+best.k+' zombies slain',cx,y+2,'#ffff55',.9);y+=16}
 const ms=AC&&AC.state==='running'&&sndOn?'':(sndOn?'Press any key or click for the music':'Sound is off');TC(ms,cx,UH-14,'#c8c8c8',.8);T_(GVER,UW-24,UH-12,'#c8c8c8',.75);T_('Naranxia',6,UH-12,'#c8c8c8',.75);{const lw=Math.max(96,tw(LANGS[LANG][0],1)+40);langBtn(6,UH-42,lw,22,LANG,()=>{langOpen=true},false)}}
const MCSPL=['Survive the night!','Also try Co-op!','Hold the line!','100% blocky!','Mind the swarm!','Build towers!','Zombies hate walls!','Protect the castle!','Now with keeps!','Gold! Wood! Stone!','100x the swarm!','Ten thousand zombies!','Red eyes in the dark!'];

function mcLogo(txt,x0,y0,cs){const lw=cs*47,hh=cs*5;ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='center';
 let S=100;ctx.font='700 '+S+'px '+FFT;const w100=ctx.measureText(txt).width||1;S=Math.min(lw/w100*100,hh/.72);ctx.font='700 '+Math.round(S)+'px '+FFT;
 const cx=x0+lw/2,by=y0+hh;ctx.lineJoin='round';
 ctx.shadowColor='rgba(80,190,255,.6)';ctx.shadowBlur=cs*2.2;ctx.fillStyle='#0b0810';ctx.fillText(txt,cx,by);ctx.shadowBlur=0;ctx.shadowColor='transparent';
 ctx.lineWidth=Math.max(2,cs*.7);ctx.strokeStyle='#0b0810';ctx.strokeText(txt,cx,by+cs*.35);ctx.strokeText(txt,cx,by);
 const g=ctx.createLinearGradient(0,by-S*.72,0,by);g.addColorStop(0,'#fff3c8');g.addColorStop(.45,'#f1c55a');g.addColorStop(.55,'#d79a32');g.addColorStop(1,'#8a5a18');ctx.fillStyle=g;ctx.fillText(txt,cx,by);
 ctx.lineWidth=Math.max(1,cs*.18);ctx.strokeStyle='rgba(255,246,214,.55)';ctx.strokeText(txt,cx,by-cs*.1);
 {const sw=((clockT*.16)%1.7)-.3;if(sw>-.25&&sw<1.25){const bx=x0+sw*lw,w2=cs*2.2;ctx.save();ctx.beginPath();ctx.moveTo(bx-w2+cs*3,y0-cs);ctx.lineTo(bx+w2+cs*3,y0-cs);ctx.lineTo(bx+w2-cs*3,by+cs);ctx.lineTo(bx-w2-cs*3,by+cs);ctx.closePath();ctx.clip();ctx.globalAlpha=.6;ctx.fillStyle='#fffbea';ctx.fillText(txt,cx,by);ctx.restore()}}
 ctx.restore()}
function drawSetup(UW,UH,cx,pw,small){let y=Math.max(6,UH*(small?.03:.06));TTL('New kingdom',cx,y,1.65,'center');y+=22;
 const eh=small?86:138;frame(cx-pw/2,y,pw,eh,PAN,6);const bnx=cx-pw/2+10,bnh=eh-14,bnw=bnh*2/3;ctx.imageSmoothingEnabled=true;ctx.drawImage(BANNER,bnx,y+7,bnw,bnh);
 const ex=bnx+bnw+10,ew=cx+pw/2-10-ex;T_('Your kingdom',ex,y+5,'#c4a37a',.8);
 const fy=y+15;nameBox={x:ex,y:fy,w:ew-24,h:15};uiBtn(ex+ew-22,fy,22,15,BTN,BTNH,()=>{THEME.n=KNAMES[(Math.random()*KNAMES.length)|0];nmI.value=THEME.n;saveTheme()},['Random name'],(x,yy,w)=>dIc(IC.dice,x+4,yy+1.5,12));
 const LW=small?0:58,rx=ex+LW,rw=ew-LW,row=(lab,n,yy,sz,draw,sel,pick,tip)=>{if(LW)T_(lab,ex,yy+(sz-9*.72)/2,'#c4a37a',.72);const per=Math.max(1,Math.floor((rw+2.5)/(sz+2.5)));for(let i=0;i<n;i++){const sx2=rx+(i%per)*(sz+2.5),sy=yy+((i/per)|0)*(sz+3);draw(sx2,sy,sz,i);if(i===sel)gold(sx2-1,sy-1,sz+2,sz+2,4);uiHits.push({...U(sx2,sy,sz,sz),fn:()=>{pick(i);saveTheme();retheme()},tip:tip(i)})}return Math.ceil(n/per)*(sz+3)};
 const sq=(x,yy,sz,col)=>{rr(x,yy,sz,sz,3);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.stroke()};
 let ry=fy+20;const sw=Math.max(8,Math.min(15,(rw+2.5)/PAL.length-2.5));
 ry+=row('Colour',PAL.length,ry,sw,(x,yy,sz,i)=>gemSwatch(x,yy,sz,PAL[i][1]),THEME.c,i=>{THEME.c=i},i=>[PAL[i][0]+' colours']);
 if(!small)ry+=row('2nd colour',PAL.length,ry,sw,(x,yy,sz,i)=>{gemSwatch(x,yy,sz,PAL[i][1]);ctx.save();ctx.beginPath();ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);ctx.clip();ctx.fillStyle=PAL[THEME.c][1];ctx.fillRect(x,yy,sz/2,sz);ctx.restore();ctx.beginPath();ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);ctx.lineWidth=.9;ctx.strokeStyle='#c99a3a';ctx.stroke()},THEME.c2,i=>{THEME.c2=i},i=>['Pattern colour: '+PAL[i][0]]);
 if(!small)ry+=row('Pattern',8,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>{ctx.translate(X,Y);bannerPattern(ctx,W,H,i,PAL[THEME.c2][1])}),THEME.p|0,i=>{THEME.p=i},i=>[['Plain','Per pale','Chevron','Bend','Quarterly','Fess','Bordure','Saltire'][i]]);
 ry+=row('Emblem',EMB.length,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>drawEmblemR(X+W*.14,Y+H*.1,W*.72,i)),THEME.e,i=>{THEME.e=i},()=>['Emblem']);
 y+=eh+10;
 {const s='Long calm between waves, then a slow swarm. It grows stronger each wave.';let sc=.85;while(sc>.64&&tw(s,sc)>UW-14)sc-=.03;if(tw(s,sc)<=UW-14){TC(s,cx,y+3,'#c4a37a',sc);y+=22}else{const q=s.split('. ');TC(q[0]+'.',cx,y,'#c4a37a',.8);TC(q[1],cx,y+11,'#c4a37a',.8);y+=26}}
 const by=Math.min(UH-30,y+4);pill(cx-pw/2+14,by,(pw-28)*.34,22,'Back',BTN,BTNH,()=>{setupOpen=false},null,.95);pill(cx-pw/2+14+(pw-28)*.36,by,(pw-28)*.64,22,'Choose site',GRN,GRNH,()=>{openPicker()},IC.map,1)}
function drawEnd(UW,UH){const g=ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(80,0,0,.45)');g.addColorStop(1,'rgba(170,16,16,.68)');ctx.fillStyle=g;ctx.fillRect(0,0,UW,UH);uiHits=[];uiRects=[U(0,0,UW,UH)];const cx=UW/2,cy=UH/2,pw=Math.min(220,UW-16);
 let ts=3;while(ts>1.3&&twH('Your kingdom fell!',ts)>UW-16)ts-=.2;TTL('Your kingdom fell!',cx,cy-78,ts,'center');TC(THEME.n+' has fallen to the horde',cx,cy-78+9*ts+8,'#e0e0e0',1);
 {const a='Score: ',b=String(waveN*100+kills),w=tw(a,1.1)+tw(b,1.1);T_(a,cx-w/2,cy-22,'#ffffff',1.1);T_(b,cx-w/2+tw(a,1.1),cy-22,'#ffff55',1.1)}
 TC('Waves survived: '+waveN+'    Zombies slain: '+kills+'    Best: wave '+best.w,cx,cy-6,'#e0e0e0',.85);
 pill(cx-pw/2,cy+12,pw,22,'Play again',BTN,BTNH,newGame,null,1.1);pill(cx-pw/2,cy+40,pw,22,'Title Screen',BTN,BTNH,()=>{inGame=false;over=false;started=false;rollWorld()},null,1.1)}
function drawToasts(UW){for(let i=0;i<TOASTS.length;i++){const o=TOASTS[i];o.t+=UIDT;const T=o.t,sl=T<.35?1-T/.35:T>4.6?(T-4.6)/.35:0;if(T>4.95){TOASTS.splice(i,1);i--;continue}const d=ACHD[o.k],w=Math.max(150,Math.max(tw(d[0],.9),twH('Achievement',.95))+40),h=30,x=UW-w-4+sl*(w+8),y=TOPH+4+i*(h+4);
  frame(x,y,w,h,PAN,4);
  const ic=IC[o.k==='w1'||o.k==='w5'||o.k==='w10'?'shield':o.k==='k1'||o.k==='k100'||o.k==='k500'?'sword':o.k==='res'?'upgrade':o.k==='move'?'home':o.k==='keep'?'tower':o.k]||IC.sword;if(ic)dIc(ic,x+6,y+7,16);
  TTL('Achievement',x+28,y+4,.95);T_(d[0],x+28,y+17,'#ffffff',.85)}}
/* ---- main HUD ---- */
function drawUI(){ctx.setTransform(UIS,0,0,UIS,0,0);ctx.imageSmoothingEnabled=true;uiHits=[];uiRects=[];
 const UW=Math.floor(cv.width/UIS),UH=Math.floor(cv.height/UIS);
 if(!started){if(picking)drawPicker(UW,UH);else drawTitle(UW,UH);ctx.setTransform(1,0,0,1,0,0);return}
 frame(-3,-3,UW+6,27,CHAT,0);uiRects.push(U(0,0,UW,24));
 /* right cluster: menu / pause / speed */
 let rx=UW-5;const tb=(w,ic,fn,tip,on)=>{rx-=w;uiBtn(rx,3,w,17,BTN,BTNH,fn,tip,(x,y,W2,H2)=>dIc(ic,x+(W2-12)/2,y+2.5,12),on);rx-=3};
 tb(18,IC.menu,openMenu,['Main menu [Esc]']);tb(18,IC.gear,()=>{openMenu();settingsOpen=true;fromGame=true},['Settings']);tb(18,paused?IC.play:IC.pause,()=>{setPause(!paused)},['Pause [Space]'],paused);tb(18,sndOn?IC.sound:IC.mute,toggleSound,['Sound on/off [O]']);
 rx-=21;uiBtn(rx,3,21,17,BTN,BTNH,()=>{if(!MP.on)spd=spd%3+1},['Game speed [F]'],(x,y,W2)=>TC('x'+spd,x+W2/2,y+4,spd>1?'#ffd23c':'#fff',.95),spd>1);rx-=6;
 const wp=[['Wave '+waveN,'#d9b8ff'],[waveOn?(nightLv>=.5?'Night':(hordeD<5000?'Horde '+Math.round(hordeD)+' tiles':'Horde')):'Next '+mmss(waveT),waveOn?(nightLv>=.5?'#9fb4ff':'#ffb38a'):waveT<10&&((clockT*3)|0)%2?'#ff8a8a':'#ffffff'],[nextL.map(L=>ROUTES[L].dir).join(' '),'#ff7a7a']];
 let wwid=0;wp.forEach(p=>wwid+=tw(p[0],.95)+10);if(UW<560||rx-wwid>UW*.42){let x=UW<560?6:rx-wwid;wp.forEach(p=>{T_(p[0],x,7,p[1],.95);x+=tw(p[0],.95)+10});if(UW>=560)rx-=wwid+4;uiHits.push({...U(UW<560?6:rx,3,wwid,17),tip:['Next wave','Zombies come along the red lines']})}
 let x=6;{const nmw=Math.min(90,tw(THEME.n,.9)+4);if(UW>=560){ctx.drawImage(BANNER,x,2,13,19.5);T_(THEME.n,x+17,7,'#fff',.9);uiHits.push({...U(x,2,17+nmw,20),tip:['Your kingdom','Banner on your castle, towers and gates']});x+=21+nmw}}
 const two=UW<560;TOPH=two?46:28;let ry=3;if(two){frame(3,22,UW-6,19,CHAT,6);x=9;rx=UW-6;ry=23}
 const item=(ic,s,col,tip)=>{const n=16+tw(s)+10;if(x+n>rx-4)return;dIc(ic,x,ry+2,13);T_(s,x+16,ry+3.5,col);uiHits.push({...U(x,ry,n-4,17),tip});x+=n};
 item(IC.coin,res.g,'#ffd23c',['Gold']);item(IC.wood,res.w,'#e8b27a',['Wood']);item(IC.stone,res.s,'#d4dae6',['Stone']);item(IC.food,Math.floor(res.f||0),'#f2c14e',['Food','Farms make it while a peasant works them','Every unit costs food to train']);
 {const hf=Math.max(0,CS.hp+(CS2?CS2.hp:0))/(CS.max+(CS2?CS2.max:0));if(x+86<rx-4){hearts(x,ry+4.5,hf,10);uiHits.push({...U(x,ry,80,17),tip:['Castle health','Do not let it fall']});x+=86}else if(x+60<rx-4){dIc(IC.heart,x,ry+2,13);bar(x+16,ry+4.5,38,hf,'#ff6a6a','#c01f2f');uiHits.push({...U(x,ry,56,17),tip:['Castle health','Do not let it fall']});x+=62}}
 {const pu=popUsed(LPL()),pc=popCap(LPL());item(IC.bed,pu+'/'+pc,pu>=pc?'#ff8a7a':'#f2e2c0',['Population','Houses raise the limit (+6 each)','and every new unit costs food'])}item(IC.skull,units.filter(u=>u.t===1).length+SW.n,'#c4ee98',['Zombies alive']);item(IC.sword,kills,'#fbf0dc',['Zombies slain']);
 /* build menu */
 const L=menuItems(),narrow=UW<340,mw=narrow?100:150,mh=Math.round(mw*TH/TW),availW=narrow?UW-8:UW-mw-30,f0=flow(L,0,0,availW-8),ph=f0.h+10,py=UH-ph-6,pw=f0.w+10,px=narrow?4:Math.max(4,((UW-mw-18-pw)>>1));
 flow(L,px+5,py+5,availW-8);frame(px,py,pw,ph,INV,6);uiRects.push(U(px,py,pw,ph));for(const it of L)if(it.gap===undefined)drawItem(it);
 const S2=sel();let sy=py-4;const QB=queue.filter(q=>q.b===curB());if(QB.length)sy-=22;if(narrow){const yb0=py-mh-9-3-19-19;sy=Math.min(sy,yb0-3)}
 if(S2.length&&!over){const cnt={};S2.forEach(u=>cnt[u.type]=(cnt[u.type]||0)+1);const txt=Object.entries(cnt).map(([k,v])=>v+' '+NAMES[k]+(v>1?'s':'')).join(', '),hint=S2.some(u=>u.type==='archer')?'Right-click a wall, gate or tower to garrison':S2.some(u=>u.type==='peasant')?'Right-click a resource to harvest, a building to repair':S2.some(u=>u.type==='captain')?'[G] group nearby soldiers behind the captain':'Right-click to move or attack',w=Math.max(tw(txt,.9),tw(hint,.78))+14;frame(px,sy-26,w,26,CHAT,5);T_(txt,px+7,sy-22,'#ffff55',.9);T_(hint,px+7,sy-11,'#e0e0e0',.78);uiRects.push(U(px,sy-26,w,26))}
 if(QB.length)QB.forEach((q,i)=>{const bx=px+i*20,by=py-23;frame(bx,by,18,18,SLOT,4);dIc(IC[q.type],bx+2,by+1.5,14);ctx.fillStyle='#000';ctx.fillRect(bx+2,by+14,14,3);if(i===0){ctx.fillStyle='#55ff55';ctx.fillRect(bx+2,by+14,Math.max(1,Math.round(14*(1-q.left/q.tot))),2)}});
 /* minimap = world map */
 const mx2=UW-mw-9,my2=narrow?py-mh-9:UH-mh-9;
 frame(mx2-4,my2-4,mw+8,mh+8,MAPF,5);drawWorld(mx2,my2,mw,mh,false);mmRect=U(mx2,my2,mw,mh);uiRects.push(U(mx2-3,my2-3,mw+6,mh+6));
 const bw2=(mw+6-3)/2,ya=my2-3-19;
 uiBtn(mx2-3,ya,bw2,17,GRN,GRNH,home,['Back to base [H]','Centers the camera on your castle'],(x,y,w)=>{dIc(IC.compass,x+4,y+2.5,12);T_('Base',x+19,y+4,'#fff',.95)});
 uiBtn(mx2-3+bw2+3,ya,bw2,17,BTN,BTNH,()=>{showMap=true},['World map [M]','See the whole world, spawns and routes'],(x,y,w)=>{dIc(IC.map,x+4,y+2.5,12);T_('Map',x+19,y+4,'#fff',.95)});
 const qw=(mw+6-9)/4,yb=ya-19;[[IC.zoomIn,()=>camZoom(-1),'Zoom in'],[IC.zoomOut,()=>camZoom(1),'Zoom out'],[IC.rotL,()=>{CAM.yaw+=.4},'Rotate left [Z]'],[IC.rotR,()=>{CAM.yaw-=.4},'Rotate right [X]']].forEach(([ic,fn,t],i)=>uiBtn(mx2-3+i*(qw+3),yb,qw,17,BTN,BTNH,fn,[t],(x,y,w)=>dIc(ic,x+(w-12)/2,y+2.5,12)));
 /* banners & hints */
 let bossY=0;if(WAVEZ>0&&!over){let rem=SW.n+swPending();for(const u of units)if(u.t===1&&u.lane>=0)rem++;if(rem>0){const bw=Math.min(182,UW-40),bx=Math.round((UW-bw)/2),by=TOPH+13;TC('Raid - Wave '+waveN+'  ('+rem+' left)',UW/2,TOPH+2,'#ffffff',.85);ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,7);ctx.fillStyle='#4a0e0e';ctx.fillRect(bx,by,bw,5);const fw=Math.max(1,Math.round(bw*Math.min(1,rem/WAVEZ)));ctx.fillStyle='#d81e1e';ctx.fillRect(bx,by,fw,5);ctx.fillStyle='#ff6a6a';ctx.fillRect(bx,by,fw,1);ctx.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<10;k++)ctx.fillRect(bx+Math.round(bw*k/10),by,1,5);bossY=22}else WAVEZ=0}
 if(!over){let msg=mode?'Place '+NAMES[mode]+(mode==='gate'?' - 3 tiles: two towers and a passage, [R] rotates':mode==='movec'?' - click the new centre of your castle':mode==='ballista'||mode==='trebuchet'?' on a tower - [R] sets facing':mode==='raise'||mode==='dig'?' - paint tiles':mode==='ramp'?' - one block that climbs 1 level, [R] turns it':mode==='demolish'?' - click a building':mode==='upgrade'?' - click or drag over wood buildings':'')+' - click a tile - right-click or Esc cancels':msgT>0?msgS:time<30?'Select peasants, then right-click a tree, rock or gold to harvest':'';
  if(msg&&bannerT<=0){ctx.globalAlpha=mode||msgT>0?1:Math.min(1,(18-time)/3);let ms=.95;while(ms>.55&&tw(msg,ms)+16>UW-6)ms-=.05;const w=tw(msg,ms)+16;frame((UW-w)/2,TOPH+bossY,w,16,CHAT,8);TC(msg,UW/2,TOPH+bossY+4,'#ffffff',ms);ctx.globalAlpha=1}
  if(bannerT>0){ctx.globalAlpha=Math.min(1,bannerT*1.2);let bs=3.4;while(bs>1.6&&tw(bannerS,bs)>UW-20)bs-=.2;let b2=1.15;while(b2>.6&&tw(bannerS2,b2)>UW-20)b2-=.05;const yb=Math.max(TOPH+8,UH*.2);TC(bannerS,UW/2,yb,'#ff5555',bs);TC(bannerS2,UW/2,yb+9*bs+6,'#ffff55',b2);ctx.globalAlpha=1}
  if(paused){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,UW,UH);TC('Game Paused',UW/2,UH*.36,'#ffffff',2.2);TC(autoPaused?'Click anywhere or press Space to resume':'Press Space to resume',UW/2,UH*.36+28,'#a0a0a0',.95)}}
 const hv=uiHits.find(h=>h.tip&&inR(mouse,h));
 if(hv&&!over&&!showMap){const ln=hv.tip,cpp=hv.cost?costParts(hv.cost):null,cw0=cpp?cpp.reduce((q,p)=>q+tw(p[0],.9)+12,0):0,w=Math.max(cw0,...ln.map(s=>tw(s,.9)))+14,h=ln.length*11+8;let tx=Math.min(UW-w-2,Math.max(2,Math.round(hv.x/UIS))),ty=Math.round(hv.y/UIS)-h-4;if(ty<26)ty=Math.round((hv.y+hv.h)/UIS)+4;
  frame(tx,ty,w,h,TIPP,5);ln.forEach((s,i)=>{if(cpp&&i===ln.length-1){drawCost(cpp,tx+7,ty+5+i*11,w-14,.9,9)}else T_(s,tx+7,ty+5+i*11,i?'#aaaaaa':'#ffffff',.9)})}
 drawToasts(UW);
 if(showMap)drawMapModal(UW,UH);
 if(over)drawEnd(UW,UH);
 ctx.setTransform(1,0,0,1,0,0)}
/* ---- game flow ---- */
function startGame(){if(!inGame){res.g=D_().g;waveT=waveI=D_().first;inGame=true}started=true;showMap=false;if(camSave){Object.assign(CAM,camSave);camSave=null}else home()}
function newGame(){rollWorld();over=false;inGame=false;started=false;setupOpen=true;settingsOpen=false}
/* leave the current game for the title screen; in co-op the partner is told (the link closes) and carries on alone */
function quitGame(){if(MP.conn||MP.on){mpSend({k:'bye'});try{MP.pcon&&MP.pcon.close()}catch(e){}try{MP.peer&&MP.peer.destroy()}catch(e){}
  MP.peer=null;MP.pcon=null;MP.dc=null;MP.conn=false;MP.on=false;MP.host=false;MP.code='';MP.mine=null;MP.theirs=null;MP.desync=false;MP.stall=false;try{mpModal(false)}catch(e){}}
 inGame=false;started=false;over=false;paused=false;picking=false;setupOpen=false;settingsOpen=false;saveOpen=false;camSave=null;mode=null;selB=null;castleSel=false;SELBS=[]}
function openMenu(){camSave={...CAM};started=false;mode=null}
/* ---- input ---- */
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}};
function rs(){DPR=Math.min(window.devicePixelRatio||1,2);const w=window.innerWidth,h=window.innerHeight;cv.width=Math.floor(w*DPR);cv.height=Math.floor(h*DPR);
 UIS=Math.max(1.5,Math.round(DPR*(w<600?1.5:w>=1600?2.5:2)*uiMul*2)/2);cw.width=cv.width;cw.height=cv.height;CWD=1;UIT=-1;renderer.setPixelRatio(Math.min(DPR,GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
function drsApply(){renderer.setPixelRatio(Math.min(DPR,GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(window.innerWidth,window.innerHeight)}
function drsTick(ts,t0){const cpu=performance.now()-t0,iv=DRS.lt?ts-DRS.lt:16.7;DRS.lt=ts;if(iv>250||iv<=0||document.hidden)return;
 DRS.sum+=iv;DRS.cs+=cpu;DRS.n++;DRS.t+=iv;if(DRS.t<2000)return;
 const ft=DRS.sum/DRS.n,cp=DRS.cs/DRS.n;DRS.ft=ft;DRS.cpu=cp;DRS.sum=DRS.cs=DRS.n=DRS.t=0;
 if(DRS.chk){DRS.chk=0;if(ft>DRS.ftb*.92){DRS.lv--;DRS.noDn=clockT+90;DRS.ok=0;drsApply();return}}
 if(ft>24&&ft-cp>5&&DRS.lv<DRSL.length-1&&clockT>DRS.noDn){if(clockT-DRS.upT<12){DRS.noUp=clockT+DRS.bk;DRS.bk=Math.min(600,DRS.bk*2)}DRS.ftb=ft;DRS.chk=1;DRS.ok=0;DRS.lv++;drsApply()}
 else if(ft<18.5){if(DRS.lv>0&&clockT>DRS.noUp&&++DRS.ok>=3){DRS.ok=0;DRS.lv--;DRS.upT=clockT;drsApply()}}else DRS.ok=0}
function mmGo(p){CAM.x=Math.max(2,Math.min(TW-2,(p.x-mmRect.x)/mmRect.w*TW));CAM.z=Math.max(2,Math.min(TH-2,(p.y-mmRect.y)/mmRect.h*TH))}
function camZoom(d){CAM.dist=Math.max(7,Math.min(80,CAM.dist*(d>0?1.18:1/1.18)))}
function panCam(dx,dy){const u=2*CAM.dist*Math.tan(camera.fov*Math.PI/360)/cv.height,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw),sp=Math.sin(CAM.pitch);
 CAM.x-=(dx*c-dy*s/sp)*u;CAM.z-=(-dx*s-dy*c/sp)*u}
function pickUnit(p){let b=null,bd=20*DPR;for(const u of units)if(u.t===0&&!u.shel){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(!q.ok)continue;const dd=hyp(q.x-p.x,q.y-p.y);if(dd<bd){bd=dd;b=u}}return b}
let lastClk=0,lastTy='';const paint=()=>{const w=wpos(),tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS);if((mode==='raise'||mode==='dig')&&tfo.has(ty*TW+tx))return;build(mode,tx,ty)};
cv.oncontextmenu=e=>e.preventDefault();
cv.addEventListener('pointercancel',()=>{ptr=null;box=null;mmDrag=false;sliderDrag=null});addEventListener('mouseup',e=>{if(e.target!==cv){ptr=null;box=null;mmDrag=false}});document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);const p=pos(e);mouse=p;
 aInit();if(autoPaused&&paused&&started&&!MP.on){paused=false;autoPaused=false;ptr=null;return}const h=uiHits.find(h=>h.fn&&inR(p,h));if(h){snd('click');h.fn();ptr=null;return}if(picking){if(!uiRects.some(r=>inR(p,r)))ptr={x:e.clientX,y:e.clientY,m:0,btn:e.button,pk:1};return}if(!started||over||showMap)return;
 if(inR(p,mmRect)){mmDrag=true;mmGo(p);return}if(uiRects.some(r=>inR(p,r)))return;
 const fo=e.button===2&&!mode&&sel().some(u=>u.type!=='peasant');ptr={x:e.clientX,y:e.clientY,m:0,pan:e.button===0&&panMode,rot:e.button!==0&&!fo,fo:fo?{w0:wpos(),w1:null}:null,sx:p.x,sy:p.y,btn:e.button};box=null};
cv.onpointermove=e=>{mouse=pos(e);if(e.pointerType==='mouse'&&e.buttons===0&&(ptr||mmDrag||sliderDrag)){ptr=null;box=null;mmDrag=false;sliderDrag=null}if(sliderDrag){sliderDrag.set(Math.max(0,Math.min(1,(mouse.x/UIS-sliderDrag.x)/sliderDrag.w)));return}if(mmDrag){mmGo(mouse);return}if(!ptr)return;const dx=e.clientX-ptr.x,dy=e.clientY-ptr.y,k=cv.width/cv.getBoundingClientRect().width;
 ptr.m+=Math.abs(dx)+Math.abs(dy);ptr.x=e.clientX;ptr.y=e.clientY;
 if(ptr.pk&&PKL.on){if(ptr.m>6){if(ptr.btn===0)panCam(dx*k,dy*k);else{CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}return}
 if(ptr.pk){if(ptr.m>6&&PK){if(ptr.btn===0){const sp=PK.dist*.0012*k;PK.tx-=(dx*Math.cos(PK.yaw)-dy*Math.sin(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tz+=(dx*Math.sin(PK.yaw)+dy*Math.cos(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tx=Math.max(0,Math.min(PVW*PKU,PK.tx));PK.tz=Math.max(0,Math.min(PVH*PKU,PK.tz))}else{PK.yaw-=dx*.007;PK.pitch=Math.max(.3,Math.min(1.45,PK.pitch+dy*.005))}}return}

 if(ptr.fo){if(ptr.m>8)ptr.fo.w1=wpos()}
 else if(ptr.rot){if(ptr.m>8){CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}
 else if(ptr.pan){if(ptr.m>8)panCam(dx*k,dy*k)}
 else if(ptr.m>8){if((mode==='path'||mode==='raise'||mode==='dig'||mode==='upgrade')&&!over)paint();else box={x1:ptr.sx,y1:ptr.sy,x2:mouse.x,y2:mouse.y}}};
cv.onpointerup=()=>{mmDrag=false;if(ptr&&ptr.pk&&PKL.on){if(ptr.m<=6&&ptr.btn===0&&PKL.hit){pkSet(PKL.hit.tx,PKL.hit.ty,PKL.hit.ok);pickMsg=PKL.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click')}ptr=null;return}
 if(ptr&&ptr.pk){if(ptr.m<=6&&ptr.btn===0&&PK&&PK.hit){pkSet(PK.hit.tx,PK.hit.ty,PK.hit.ok);pickMsg=PK.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click');PKL.on=true;pkLiveFocus(PK.hit.tx,PK.hit.ty)}ptr=null;return}if(sliderDrag){sliderDrag=null;snd('sword');return}if(!ptr)return;
 if(ptr.fo&&ptr.m>8&&ptr.fo.w1){const a=ptr.fo.w0,b=ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),ft=formType;if(!formType)formType=1;FORCEF=fm;try{order(a)}finally{FORCEF=null;formType=ft}puff(a.x,a.y,'#ffe14a',8,40);ptr=null;FPV=null;return}
 if(ptr.m<=8){const w=wpos(),p=mouse;
  if(ptr.btn===2){if(mode){mode=null}else if(sel().length){const ps=pickStruct(p),w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}}
  else if(mode&&!over)build(mode,Math.floor(w.x/TS),Math.floor(w.y/TS));
  else{const b=pickUnit(p);if(b){snd('select');mode=null;const dbl=Date.now()-lastClk<380&&lastTy===b.type&&!b.gar;lastClk=Date.now();lastTy=b.type;units.forEach(u=>u.sel=false);if(dbl){units.forEach(u=>{if(u.t===0&&u.type===b.type&&!u.gar){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(q.ok&&q.x>=0&&q.x<=cv.width&&q.y>=0&&q.y<=cv.height)u.sel=true}});msgS='All visible '+NAMES[b.type]+'s selected';msgT=2}else b.sel=true;if(b.rg&&b.cap&&!dbl){b.cap.sel=true;if(b.cap.sq)b.cap.sq.forEach(f=>f.sel=true)}if(b.sq)b.sq.forEach(f=>f.sel=true);selB=null;castleSel=false}else{const ps=pickStruct(p),o=ps||occ.get(Math.floor(w.y/TS)*TW+Math.floor(w.x/TS));if(o&&o.t===0&&(!MP.on||(o.pl|0)===CURPL)&&o.prog>=1&&!sel().length){const dblB=Date.now()-lastClkB<380&&lastTyB===o.type&&o.type!=='castle';lastClkB=Date.now();lastTyB=o.type;SELBS=dblB?structs.filter(s=>s.t===0&&s.type===o.type&&s.prog>=1&&s.hp>0&&(!MP.on||(s.pl|0)===CURPL)):[];selB=o===HOMEC()?null:o;castleSel=o===HOMEC();snd('select');msgS=!TRB.has(o.type)?(NAMES[o.type]||o.type)+': '+Math.ceil(o.hp)+' / '+o.max+' HP'+(o.hp<o.max?' - press Repair':'')+(WKT.has(o.type)?(wkOf(o)?' - worked by a peasant':' - nobody works it: right-click it with a peasant'):'')+(o.type==='forester'?(n=>' - '+n+' sapling'+(n===1?'':'s')+' growing')([...SAPL.values()].filter(v=>v.s===o.sid).length):''):o===HOMEC()?'Castle: shoots arrows at zombies in range, trains peasants and builds'+(n=>n?' - '+n+' villager'+(n>1?'s':'')+' sheltering inside (Repair calls them out)':'')(units.filter(u=>u.shel===o).length):o.type==='guild'?'Builders guild: choose how many peasants build, repair and reshape the land':o.type==='academy'?'Academy: research upgrades here':o.type==='market'?'Market: sell wood, stone or food for gold, or buy them':'Barracks: train soldiers here';msgT=3;{const rg=rangeOf(o);if(rg)msgS+=' - range '+Math.round(rg.r)+' tiles'}if(SELBS.length>1){msgS='All your '+NAMES[o.type]+'s selected ('+SELBS.length+')'+(UPC[o.type]&&SELBS.some(s=>s.tier===0)?' - Upgrade turns every wooden one to stone':'');msgT=4}}else if(sel().length){const w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}else{selB=null;castleSel=false;SELBS=[]}}}}
 else if(!ptr.pan&&!ptr.rot&&box){const x0=Math.min(box.x1,box.x2),x1=Math.max(box.x1,box.x2),y0=Math.min(box.y1,box.y2),y1=Math.max(box.y1,box.y2);
  mode=null;castleSel=false;units.forEach(u=>{if(u.t!==0||u.shel||(MP.on&&(u.pl|0)!==CURPL)){u.sel=false;return}const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);u.sel=q.ok&&q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1});units.forEach(u=>{if(u.sel&&u.rg&&u.cap)u.cap.sel=true});units.forEach(u=>{if(u.sel&&u.sq)u.sq.forEach(f=>f.sel=true)})}
 ptr=null;box=null};
cv.onwheel=e=>{e.preventDefault();mouse=pos(e);if(started&&!showMap)camZoom(e.deltaY>0?1:-1);else if(picking&&PKL.on)camZoom(e.deltaY>0?1:-1);else if(picking&&PK)PK.dist=Math.max(50,Math.min(900,PK.dist*(e.deltaY>0?1.15:1/1.15)))};
const BK=['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path'];
addEventListener('keydown',e=>{aInit();if(document.activeElement===nmI)return;const k=e.key.toLowerCase();
 if(rebind){e.preventDefault();if(k==='escape'){rebind=null;return}const old=KB[rebind];for(const a in KB)if(a!==rebind&&KB[a]===k)KB[a]=old;KB[rebind]=k;rebind=null;saveKB();return}
 keys[k]=true;
 if(!started){if(k==='escape'){if(settingsOpen){settingsOpen=false;if(fromGame){fromGame=false;startGame()}}else if(picking){picking=false;if(MP.conn)lobbyShow()}else if(setupOpen)setupOpen=false}else if(k==='enter'&&!settingsOpen){e.preventDefault();if(picking)confirmPick();else if(setupOpen)openPicker();else if(inGame)startGame();else setupOpen=true}else if(picking&&k===KB.rotate&&!settingsOpen)pkRotate();return}
 if(over)return;
 if(k==='escape'){if(showMap)showMap=false;else if(mode||sel().length){mode=null;units.forEach(u=>u.sel=false)}else if(BCAT)BCAT=null;else openMenu();return}
 if(!e.ctrlKey&&!e.shiftKey&&!e.metaKey&&['1','2','3','4'].includes(k)&&sel().some(u=>u.type!=='peasant')){setStance(['agg','def','hold','stop'][+k-1]);return}
 const a=Object.keys(KB).find(x=>KB[x]===k);if(!a)return;if(k.length===1&&!/[a-z0-9]/.test(k))e.preventDefault();
 if(a==='map'){showMap=!showMap;return}
 if(showMap)return;
 if(BK.includes(a)||a==='upgrade'||a==='barracks'||a==='farm'||a==='storage'||a==='house'||a==='academy'||a==='market'||a==='forester'||a==='guild'||a==='torch'||a==='rally'||a==='rallyc'||a==='movec'||a==='ramp'||a==='tier'||a==='demolish'||a==='raise'||a==='dig'||a==='ballista'||a==='trebuchet'){buy(a);return}
 if(a==='rotate'){if(mode){buildRot=(buildRot+1)&3;msgS='Rotated '+buildRot*90+' deg';msgT=1.5}else if(selB&&selB.t===0&&ROTT.has(selB.type))build('rotate',selB.tx,selB.ty)}
 else if(a==='form'){formType=(formType+1)%FORMS.length;msgS='Formation: '+FORMS[formType];msgT=2}
 else if(a==='sound')toggleSound();else if(a==='idle')selIdle();else if(a==='wave')callWave();else if(a==='home')home();else if(a==='army')army();else if(a==='peas')selPeas();
 else if(a==='pause'){setPause(!paused);e.preventDefault()}else if(a==='speed'){if(!MP.on)spd=spd%3+1}
 if(k==='p'){panMode=!panMode;msgS=panMode?'Pan mode: drag moves the camera':'Select mode: drag draws a box';msgT=2}if(k==='+'||k==='=')camZoom(-1);if(k==='-')camZoom(1);if(k===','){selIdle()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',rs);
function drawBars(){ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,DPR);let drew=0;
 const bar2=(x,y,w,f,c)=>{drew=1;ctx.fillStyle='#000';ctx.fillRect(Math.round(x-w/2-1),Math.round(y-1),w+2,3*k+1);ctx.fillStyle=c;ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.max(1,Math.round(w*Math.max(0,Math.min(1,f)))),2*k)};
 for(const u of units){const m=T[u.type].hp;if(u.hp>=m||u.hp<=0||u.shel)continue;const md=u.m&&u.m.userData.mdl,q=scr(u.x/TS,(u.dy||0)+(md?md.h*(md.sc||1.35)*UNITK:.8)+.1,u.y/TS);if(q.ok)bar2(q.x,q.y,(u.type==='brute'?26:16)*k,u.hp/m,u.t===1?'#c66bff':u.t===2?'#e8c040':'#6fdc6f')}
 {let n0=0;for(const u of units)if(u.shel)n0++;if(n0)for(const c of aliveC()){let n=0;for(const u of units)if(u.shel===c)n++;if(!n)continue;const q=scr(c.x/TS,(c.bh||LAND)+(c.tier!==0?6.7:5.7),c.y/TS);
  if(q.ok){drew=1;ctx.font=Math.round(9*k*1.75)+'px '+FF;ctx.textAlign='center';const t=L(n+' inside');ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(t,q.x+1,q.y+1);ctx.fillStyle='#ffe08a';ctx.fillText(t,q.x,q.y)}}}
 if(!shelOn)for(const s of structs){if(s.t!==0||s.prog<1||s.hp<=0||!WKT.has(s.type)||(MP.on&&(s.pl|0)!==LPL())||wkOf(s))continue;const q=scr(s.x/TS,(s.bh||LAND)+1.4,s.y/TS);
  if(q.ok){drew=1;ctx.font=Math.round(8*k*1.75)+'px '+FF;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(L('no worker'),q.x+1,q.y+1);ctx.fillStyle='#ffb070';ctx.fillText(L('no worker'),q.x,q.y)}}
 for(const s of structs){if(s.garr&&s.garr.length){const q=scr(s.x/TS,(s.bh||LAND)+(s.type==='tower'?4.9:2.7),s.y/TS);if(q.ok){drew=1;ctx.font=Math.round(9*k*1.75)+'px '+FF;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x+1,q.y+1);ctx.fillStyle='#9fe870';ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x,q.y)}}
  if(s.hp>=s.max&&s.prog>=1)continue;const q=scr(s.x/TS,(s.bh||LAND)+(({tower:4.9,wall:2.2,gate:2.6,ballista:1.6,trebuchet:3.6,house:3.3,barracks:3.2,storage:2.5,academy:3.6,market:2.7,forester:2.4,guild:3.2,torch:1.9,farm:1.0,keep:5.2,castle:s.tier!==0?6.2:5.2})[s.type]||6.7),s.y/TS);if(!q.ok)continue;
  if(s.prog<1)bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.prog,'#ffd23c');else bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.hp/s.max,'#6fdc6f')}return drew}
function loop(ts){const lt0=performance.now(),dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;clockT+=dt;
 if(started){const sp=CAM.dist*.9*dt,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);let fx_=0,fz=0;
  if(!showMap){if(keys[KB.up]||keys.arrowup)fz-=1;if(keys[KB.down]||keys.arrowdown)fz+=1;if(keys[KB.left]||keys.arrowleft)fx_-=1;if(keys[KB.right]||keys.arrowright)fx_+=1;
   CAM.x+=(fx_*c+fz*s)*sp;CAM.z+=(-fx_*s+fz*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5}
  if(!MP.on&&!over&&!paused&&!showMap)for(let k=0;k<spd;k++)update(dt)}
 if(MP.on)mpFrame(dt);
 
 if(started||inGame){if(!MP.on){if(started&&window.requestIdleCallback){if(!BGI&&GI<GORD.length){BGI=1;requestIdleCallback(bgIdle,{timeout:700})}}else bgGen(started?2.5:14)}if(clockT-mmT>(genN<NCX*NCY?1.2:4)){mmT=clockT;refreshMM()}}
 FOWU.fowP.value.w=started&&inGame?1:0;FOWU.fowP.value.z=started&&inGame?nightK:0;POST.U2.uVig.value=started&&inGame?1:0;if(SHADOWS&&++SHF>=(DRS.lv>=3?3:2)){SHF=0;renderer.shadowMap.needsUpdate=true}if(started)render3D(dt);else if(picking)(PKL.on?renderPickLive(dt):renderPick(dt));else if(inGame&&!over)render3D(0);else renderTitle(dt);
 {const hc=ctx;ctx=cwx;try{if(CWD){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw.width,cw.height);CWD=0}if(started){CWD=drawBars()|0;
  if(ptr&&ptr.fo&&ptr.fo.w1&&ptr.m>8){CWD=1;const a=ptr.fo.w0,b=ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),FM=sel().filter(u=>u.type!=='peasant'&&!u.gar),ft=formType;if(!formType)formType=1;let sl;try{sl=formSlots(FM,a,fm)}finally{formType=ft}
   ctx.lineWidth=Math.max(1,DPR*1.2);for(const q of sl.values()){const P=scr(q.x/TS,gh(q.x/TS,q.y/TS)+.05,q.y/TS);if(!P.ok)continue;ctx.beginPath();ctx.ellipse(P.x,P.y,6*DPR,3.4*DPR,0,0,6.283);ctx.fillStyle='rgba(255,225,74,.28)';ctx.fill();ctx.strokeStyle='#ffe14a';ctx.stroke()}
   const P0=scr(a.x/TS,gh(a.x/TS,a.y/TS)+.05,a.y/TS),P1=scr((a.x+Math.sin(fm)*TS*2)/TS,gh(a.x/TS,a.y/TS)+.05,(a.y+Math.cos(fm)*TS*2)/TS);if(P0.ok&&P1.ok){ctx.strokeStyle='#ffe14a';ctx.lineWidth=2*DPR;ctx.beginPath();ctx.moveTo(P0.x,P0.y);ctx.lineTo(P1.x,P1.y);ctx.stroke();const an=Math.atan2(P1.y-P0.y,P1.x-P0.x);ctx.beginPath();ctx.moveTo(P1.x,P1.y);ctx.lineTo(P1.x-Math.cos(an-.5)*9*DPR,P1.y-Math.sin(an-.5)*9*DPR);ctx.lineTo(P1.x-Math.cos(an+.5)*9*DPR,P1.y-Math.sin(an+.5)*9*DPR);ctx.closePath();ctx.fillStyle='#ffe14a';ctx.fill()}}
  if(box){CWD=1;ctx.strokeStyle='#ffe14a';ctx.lineWidth=Math.max(1,DPR);ctx.fillStyle='rgba(255,225,74,.15)';const x=Math.min(box.x1,box.x2),y=Math.min(box.y1,box.y2),w=Math.abs(box.x2-box.x1),h=Math.abs(box.y2-box.y1);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(PINGS.length){CWD=1;drawPings()}}}finally{ctx=hc}}
 if(!started||UIT<0||ts-UIT>=22||ts<UIT){UIDT=UIT>=0&&ts>UIT?Math.min(.1,(ts-UIT)/1000):dt;UIT=ts;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);drawUI()}
 placeInput();{const cu=started&&mode?'crosshair':started&&panMode?'grab':'default';if(cu!==CUR0){CUR0=cu;cv.style.cursor=cu}}drsTick(ts,lt0);requestAnimationFrame(loop)}
let CWD=1,UIT=-1,UIDT=1/60,CUR0='',SHF=0,BGI=0;
function bgIdle(d){BGI=0;if(MP.on||!started)return;const t0=performance.now();while(GI<GORD.length&&(d.didTimeout?performance.now()-t0<2.5:d.timeRemaining()>4)){const k=GORD[GI++];if(!genF[k])genChunk(k%NCX,(k/NCX)|0)}}
rs();rollWorld();reset();icons3D();aInit();requestAnimationFrame(loop);

/* ================= Co-op: peer to peer lockstep (WebRTC, manual code exchange) ================= */
const MPD=6,MPSTEP=1/30;
Object.assign(MP,{pc:null,dc:null,tick:0,loc:{},rem:{},out:[],sent:0,acc:0,stall:false,hs:{},hr:{},desync:false,simR:null,lostAt:0});
/* visual helpers must never consume the shared simulation random stream */
const _puff=puff,_snd=snd;
puff=function(){const m=Math.random;Math.random=REALR;try{return _puff.apply(null,arguments)}finally{Math.random=m}};
snd=function(n){if(MP.ex&&MP.rmt&&(n==='err'||n==='click'))return;const m=Math.random;Math.random=REALR;try{return _snd.apply(null,arguments)}finally{Math.random=m}};
const _N={setStance,startResearch2,order,build,train,startResearch,callWave,groupSel,ungroupSel,confirmPick,trade};
const selIds=()=>sel().map(u=>u.uid),mpPush=c=>MP.out.push(c),gated=()=>MP.on&&!MP.ex;
order=function(w){if(gated()){mpPush({k:'o',i:selIds(),x:w.x,y:w.y,f:formType,fa:FORCEF});return}return _N.order(w)};
build=function(t,x,y){if(gated()){mpPush({k:'b',t,x,y,r:buildRot,ti:BTIER,gl:gateLen,sb:selB&&structs.includes(selB)?selB.sid:null});return}return _N.build(t,x,y)};
train=function(t){if(gated()){mpPush({k:'t',t,b:curB().sid});return}return _N.train(t)};
startResearch=function(){if(gated()){mpPush({k:'r'});return}return _N.startResearch()};
const repairB=function(sid){if(gated()){mpPush({k:'rp',b:sid});return}return repair0(sid)};
startResearch2=function(k){if(gated()){mpPush({k:'r2',n:k});return}return _N.startResearch2(k)};
callWave=function(){if(gated()){mpPush({k:'w'});return}return _N.callWave()};
trade=function(k){if(gated()){mpPush({k:'tr',n:k});return}return _N.trade(k)};
const ROLEK=new Set(['rb+','rb-','rr+','rr-','rt+','rt-']),roleAdj=function(r,d){if(gated()){mpPush({k:'ro',r,d});return}return roleAdj0(r,d)};
setStance=function(st){if(gated()){mpPush({k:'st',i:selIds(),s:st});return}return _N.setStance(st)};
groupSel=function(){if(gated()){mpPush({k:'g',i:selIds()});return}return _N.groupSel()};
ungroupSel=function(){if(gated()){mpPush({k:'u',i:selIds()});return}return _N.ungroupSel()};
function withSel(S,fn){const keep=units.map(u=>u.sel);units.forEach(u=>u.sel=S.has(u.uid));try{fn()}finally{units.forEach((u,i)=>u.sel=keep[i])}}
function mpExec(c,mine){const m0=msgS,mt0=msgT,sl=selB,fm=formType,br=buildRot;MP.ex=true;MP.rmt=!mine;MP.note=null;setPl(mine?LPL():1-LPL());
 try{switch(c.k){
  case'o':formType=c.f;FORCEF=c.fa==null?null:c.fa;try{withSel(new Set(c.i),()=>{if(sel().length)_N.order({x:c.x,y:c.y})})}finally{FORCEF=null}break;
  case'b':{buildRot=c.r;gateLen=c.gl||2;selB=c.sb!=null?(structs.find(s=>s.sid===c.sb)||null):null;const bt0=BTIER;setTier(c.ti===undefined?1:c.ti);try{_N.build(c.t,c.x,c.y)}finally{setTier(bt0)}break}
  case't':selB=structs.find(s=>s.sid===c.b&&(s.pl|0)===CURPL)||null;_N.train(c.t);break;
  case'r':{const was=RS.on;_N.startResearch();if(!mine&&!was&&RS.on)MP.note=(MP.pname||'Your partner')+' started Stonemasonry (shared)';break}
  case'rp':repair0(c.b);break;
  case'w':_N.callWave();break;
  case'r2':{const was=RS2.on;_N.startResearch2(c.n);if(!mine&&!was&&RS2.on===c.n)MP.note=(MP.pname||'Your partner')+' started '+RN2[c.n]+' (shared)';break}
  case'tr':_N.trade(c.n);break;
  case'ro':roleAdj0(c.r,c.d);break;
  case'g':withSel(new Set(c.i),()=>_N.groupSel());break;
  case'u':withSel(new Set(c.i),()=>_N.ungroupSel());break
  case'st':withSel(new Set(c.i),()=>_N.setStance(c.s));break}}
 finally{MP.ex=false;MP.rmt=false;setPl(LPL());selB=sl;formType=fm;buildRot=br;if(!mine){msgS=m0;msgT=mt0;if(MP.note){msgS=MP.note;msgT=4;MP.note=null}}}}
function setPause(v){paused=v;autoPaused=false;if(MP.on)mpSend({k:'p',v})}
function mpSend(o){try{if(MP.dc&&MP.dc.readyState==='open')MP.dc.send(JSON.stringify(o))}catch(e){}}
function mpHash(){let h=(units.length*7+structs.length*13+queue.length*3+RESP.reduce((a,R,i)=>Math.imul(a,131)+Math.round(R.g)*3+Math.round(R.w)*5+Math.round(R.s)*11+Math.round(R.f||0)*17+i,0))|0;
 for(const u of units)h=(Math.imul(h,31)+((u.x*8)|0)+Math.imul((u.y*8)|0,7)+(u.hp|0))|0;h=(Math.imul(h,31)+SW.n)|0;for(let i=0;i<SW.n;i+=17)h=(Math.imul(h,31)+((SW.x[i]*8)|0)+Math.imul((SW.y[i]*8)|0,7))|0;return h}
function mpChk(t){if(MP.hs[t]!==undefined&&MP.hr[t]!==undefined){if(MP.hs[t]!==MP.hr[t]){MP.desync=true;if(MP.host)mpResync();else mpSend({k:'rsq',e:MP.ep})}delete MP.hs[t];delete MP.hr[t]}}
/* ---- co-op: automatic resynchronisation ----
   when the state hashes of the two machines differ, the host freezes the lockstep, sends a full snapshot of its game (the save
   format, in chunks), the guest loads it, then the host loads the very same snapshot and both restart from that tick with a
   fresh shared random stream: everything rebuilt while loading is rebuilt the same way on both sides, so the games agree again.
   Command and hash messages carry an epoch so nothing from before the resync is applied after it. */
Object.assign(MP,{ep:0,rsy:null,rsLast:-1e9,rsTxt:null,rsMeta:null,rsBuf:null,rsGot:0});
const RSCH=48000;
async function mpResync(){if(!MP.on||!MP.host||MP.rsy||over)return;if(performance.now()-MP.rsLast<8000)return;MP.rsy='pack';MP.rsLast=performance.now();
 const T=MP.tick,M={ep:MP.ep+1,t:T,sd:(Math.imul(T+1,2654435761)^Math.floor(SEED*1e6))>>>0};let txt;
 try{txt=JSON.stringify(await svEncode())}catch(e){MP.rsy=null;return}
 const n=Math.ceil(txt.length/RSCH);mpSend({k:'rs0',ep:M.ep,t:T,n,sd:M.sd});for(let i=0;i<n;i++)mpSend({k:'rs1',ep:M.ep,i,d:txt.slice(i*RSCH,(i+1)*RSCH)});
 MP.rsTxt=txt;MP.rsMeta=M;MP.rsy='sent'}
function mpResMsg(m){
 if(m.k==='rsq'){if(MP.host)mpResync();return}
 if(m.k==='rs0'&&!MP.host){MP.rsy='recv';MP.rsBuf=new Array(m.n);MP.rsGot=0;MP.rsMeta={ep:m.ep,t:m.t,sd:m.sd};return}
 if(m.k==='rs1'&&!MP.host&&MP.rsy==='recv'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){if(MP.rsBuf[m.i]===undefined){MP.rsBuf[m.i]=m.d;MP.rsGot++}
  if(MP.rsGot===MP.rsBuf.length){const txt=MP.rsBuf.join(''),M=MP.rsMeta;MP.rsBuf=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsy='go';mpSend({k:'rsok',ep:M.ep})},()=>{MP.rsy=null})}return}
 if(m.k==='rsok'&&MP.host&&MP.rsy==='sent'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){const txt=MP.rsTxt,M=MP.rsMeta;MP.rsTxt=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsy=null;mpSend({k:'rsgo',ep:M.ep})},()=>{MP.rsy=null});return}
 if(m.k==='rsgo'&&!MP.host&&MP.rsy==='go'&&m.ep===MP.ep){MP.rsy=null;return}}
/* load a snapshot inside a running co-op game: the local view (camera, selection, menu) is kept. Same steps as svApply, but the
   decoding (asynchronous) comes first, then everything that touches the simulation runs in one go with a seeded random stream,
   so the host and the guest rebuild exactly the same game */
async function mpResApply(txt,M){const keep=new Set(units.filter(u=>u.sel).map(u=>u.uid)),sb=selB&&structs.includes(selB)?selB.sid:null,cs=castleSel;
 const S=JSON.parse(txt);if(!S||S.v!==SVVER)throw new Error('bad snapshot');const D=await svDecode(S);
 const R0=Math.random;Math.random=rngf((M.sd^0x5bd1e995)>>>0);
 try{mode=null;SEED=S.R.SEED;GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));CX=S.R.CX;CY=S.R.CY;
  SITE2=null;for(const q of structs||[])rmStruct(q);initWorld();for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
  for(const u of units){u.m=null;u._tc=null}for(const q of structs)q.o3=null;
  GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(LPL());calcFD();fdDirty=true;ver++;rebuildOwn(true);
  fowTm=-9;fowT.needsUpdate=true;build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}}
 finally{Math.random=R0}
 for(const u of units)u.sel=keep.has(u.uid);selB=sb!=null?structs.find(q=>q.sid===sb)||null:null;castleSel=cs;SELBS=[];
 MP.ep=M.ep;MP.simR=rngf(M.sd);MP.tick=M.t;MP.sent=M.t+MPD-1;MP.acc=0;MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;
 for(let k=M.t;k<M.t+MPD;k++){MP.loc[k]=[];MP.rem[k]=[]}
 msgS='Resynchronized with your partner';msgT=4}
function mpGen(){let n=0;while(GI<GORD.length&&n<2){const k=GORD[GI++];if(!genF[k]){genChunk(k%NCX,(k/NCX)|0);n++}}}
function mpFrame(dt){if(over||MP.rsy)return;MP.acc=Math.min(.3,MP.acc+dt);if(paused){MP.acc=0;return}
 let n=0;while(MP.acc>=MPSTEP&&n<8){
  while(MP.sent<MP.tick+MPD){MP.sent++;const c=MP.out;MP.out=[];MP.loc[MP.sent]=c;mpSend({k:'c',t:MP.sent,c,e:MP.ep})}
  const r=MP.rem[MP.tick];if(!r){MP.stall=true;break}MP.stall=false;
  const L=MP.loc[MP.tick]||[],cm=MP.host?[...L.map(c=>[c,1]),...r.map(c=>[c,0])]:[...r.map(c=>[c,0]),...L.map(c=>[c,1])];
  Math.random=MP.simR;try{mpGen();for(const[c,m]of cm)mpExec(c,m);update(MPSTEP)}finally{Math.random=REALR}
  delete MP.loc[MP.tick];delete MP.rem[MP.tick];MP.tick++;MP.acc-=MPSTEP;n++;
  if(MP.tick%90===0){const h=mpHash();MP.hs[MP.tick]=h;mpSend({k:'h',t:MP.tick,h,e:MP.ep});mpChk(MP.tick)}}
 if(n===8)MP.acc=0}
function mpBegin(st){SEED=st.seed;GPR=st.gpr;CX=st.cx;CY=st.cy;CROT=st.cr&3;diffI=0;SWF=100;SITE2={tx:st.cx2,ty:st.cy2,rot:st.cr2&3};picking=false;setupOpen=false;settingsOpen=false;
 MP.on=true;const sd=Math.floor(SEED*1e6)+1;Math.random=rngf(sd);try{reset()}finally{Math.random=REALR}
 inGame=false;camSave=null;startGame();spd=1;paused=false;over=false;setPl(LPL());home();
 MP.simR=rngf(sd+977);MP.tick=0;MP.sent=MPD-1;MP.acc=0;MP.out=[];MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;MP.ep=0;MP.rsy=null;MP.rsLast=-1e9;
 for(let i=0;i<MPD;i++){MP.loc[i]=[];MP.rem[i]=[]}
 MP.mine=null;MP.theirs=null;mpModal(false)}
MP.phase='';MP.mine=null;MP.theirs=null;MP.pname='';MP.code='';
/* the two castles may stand side by side: only their 5x5 walls and the 3 tiles in front of each door must not overlap */
const sitesFar=(a,b)=>!a||!b||Math.max(Math.abs(a.tx-b.tx),Math.abs(a.ty-b.ty))>=10;
/* ---- lobby state ---- */
function mpConnected(){MP.conn=true;MP.mine=null;MP.theirs=null;mpSend({k:'hello',n:THEME.n,v:GVER});if(MP.host)mpWorldSync();lobbyRender();lobbyShow()}
function mpWorldSync(){if(MP.conn&&MP.host){MP.theirs=null;mpSend({k:'w',seed:SEED,gpr:GPR,d:diffI});MP.mine=null;lobbyRender()}}
const _rw=rollWorld;rollWorld=function(){_rw();if(MP.conn&&MP.host&&!MP.on)mpWorldSync()};
confirmPick=function(){
 if(!MP.conn){SITE2=null;return _N.confirmPick()}
 if(!pickPos||!pickPos.ok)return;const me={tx:pickPos.tx,ty:pickPos.ty};
 if(!sitesFar(me,MP.theirs)){pickMsg='Your castles would overlap: move a little away from your partner';return}
 me.rot=PKROT&3;MP.mine=me;mpSend({k:'ready',cx:me.tx,cy:me.ty,r:me.rot});picking=false;setupOpen=false;lobbyRender();lobbyShow()};
function mpStart(){if(!MP.host||!MP.mine||!MP.theirs)return;if(MP.pver&&MP.pver!==GVER){lobbyNote('Different versions ('+GVER+' and '+MP.pver+'): both players must run the same one - restart the launcher or reload the page');return}if(!sitesFar(MP.mine,MP.theirs)){lobbyNote('The two castles are too close: one of you must move.');return}
 const st={k:'s',seed:SEED,gpr:GPR,cx:MP.mine.tx,cy:MP.mine.ty,cr:MP.mine.rot|0,cx2:MP.theirs.tx,cy2:MP.theirs.ty,cr2:MP.theirs.rot|0,d:diffI,sw:SWF};mpSend(st);mpBegin(st)}
function mpMsg(m){if(m.k==='c'){if((m.e|0)!==MP.ep)return;MP.rem[m.t]=m.c;if(document.hidden)bgTick()}else if(m.k==='h'){if((m.e|0)!==MP.ep)return;MP.hr[m.t]=m.h;mpChk(m.t)}else if(m.k&&m.k.startsWith('rs')){mpResMsg(m);return}else if(m.k==='p')paused=m.v;
 else if(m.k==='hello'){MP.pname=String(m.n||'Player').slice(0,24);MP.pver=String(m.v||'?');snd('spawn');lobbyNote(m.v===GVER?(MP.pname)+' joined the lobby!':'Version mismatch: you run '+GVER+', '+MP.pname+' runs '+(m.v||'an older version')+'. Use the same version or the game will desync.');if(MP.host)mpWorldSync();if(!picking&&!MP.on)lobbyShow();else lobbyRender()}
 else if(m.k==='w'&&!MP.host){SEED=m.seed;GPR=m.gpr;diffI=m.d;MP.mine=null;MP.theirs=null;if(picking){openPicker();pickMsg='The host chose a new map'}lobbyNote('The host chose a map');lobbyRender()}
 else if(m.k==='ready'){const again=!!MP.theirs;MP.theirs={tx:m.cx,ty:m.cy,rot:m.r&3};snd('click');lobbyNote(MP.pname+(again?' moved their castle':' placed their castle'));lobbyRender()}
 else if(m.k==='s'&&!MP.host)mpBegin(m)}
function mpLost(){if(!MP.conn&&!MP.on)return;const was=MP.on;MP.conn=false;MP.on=false;MP.mine=null;MP.theirs=null;if(was){msgS='Partner disconnected - continuing solo';msgT=6}lobbyNote('Your partner left the lobby.');lobbyRender()}
/* ---- connection 1: short room code through the free PeerJS broker ---- */
const PCFG=window.MP_PEER_CFG||{},CODEC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rcode=()=>Array.from({length:5},()=>CODEC[(REALR()*CODEC.length)|0]).join('');
function loadPeer(){return window.Peer?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src=window.MP_PEER_SRC||'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);setTimeout(()=>rej(new Error('timeout')),9000)})}
function attach(c){MP.pcon=c;c.on('open',()=>{MP.dc={readyState:'open',send:s=>c.send(s)};mpConnected()});c.on('data',d=>{try{mpMsg(typeof d==='string'?JSON.parse(d):d)}catch(e){}});c.on('close',mpLost);c.on('error',mpLost)}
const normCode=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16);
async function lobbyHost(custom,tries){tries=tries||0;custom=normCode(custom);if(custom&&custom.length<3){mpStatus('Your code needs at least 3 letters or digits.');return}mpStatus('Creating your room...');try{await loadPeer()}catch(e){mpStatus('Could not reach the matchmaking service. Check your connection and try again.');mpFallback(true);return}
 MP.host=true;MP.code=custom||rcode();const peer=new Peer('nrx-'+MP.code,PCFG);MP.peer=peer;
 peer.on('open',()=>{lobbyRender();lobbyShow();mpStatus('Waiting for your partner to join...')});
 peer.on('connection',c=>{if(MP.conn){c.close();return}attach(c)});
 peer.on('error',e=>{if(e.type==='unavailable-id'&&custom){peer.destroy();MP.code='';$m('mpHostP').style.display='block';$m('mpLobby').style.display='none';mpStatus('The code '+custom+' is already used by another room: choose a different one.')}else if(e.type==='unavailable-id'&&tries<4){peer.destroy();lobbyHost('',tries+1)}else{mpStatus('Matchmaking error ('+e.type+'). Check your connection and try again.');mpFallback(true)}})}
async function lobbyJoin(code){code=normCode(code);if(code.length<3){mpStatus('Type the room code first.');return}
 mpStatus('Joining room '+code+'...');try{await loadPeer()}catch(e){mpStatus('Could not reach the matchmaking service. Check your connection and try again.');mpFallback(true);return}
 MP.host=false;MP.code=code;const peer=new Peer(PCFG);MP.peer=peer;let t=setTimeout(()=>{if(!MP.conn)mpStatus('Room '+code+' not found. Check the code with the host.')},9000);
 peer.on('open',()=>{const c=peer.connect('nrx-'+code,{reliable:true});attach(c);c.on('open',()=>clearTimeout(t))});
 peer.on('error',e=>{mpStatus(e.type==='peer-unavailable'?'Room '+code+' not found. Check the code with the host.':'Connection error ('+e.type+').')})}
/* ---- connection 2 (fallback): manual WebRTC codes, no server at all ---- */

const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))),dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/\s+/g,'')))));






/* ---- DOM window (same visual identity as the game) ---- */
const mpEl=document.createElement('div');mpEl.id='mp';mpEl.style.display='none';
const mpCss=document.createElement('style');mpCss.textContent=`#mp{position:fixed;inset:0;z-index:20;background:rgba(10,6,3,.72);display:flex;align-items:center;justify-content:center;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;color:#f6e9d2}
#mp .bx{width:min(520px,94vw);max-height:94vh;overflow:auto;background:linear-gradient(#34261b,#1b120c);border:1px solid #0a0603;border-radius:10px;box-shadow:0 0 0 1px rgba(255,196,120,.18) inset,0 12px 40px rgba(0,0,0,.6);padding:14px 16px}
#mp h2{margin:0 0 4px;font-size:20px;color:#ffd23c;letter-spacing:.5px}#mp p{margin:6px 0;font-size:13px;color:#ead8ba;line-height:1.4}
#mp textarea,#mp input.cd{width:100%;background:#150e09;color:#fff1d8;border:1px solid #9a6c3c;border-radius:6px;padding:6px;box-sizing:border-box}
#mp textarea{height:70px;resize:none;font:11px/1.3 monospace;word-break:break-all}
#mp input.cd{font:700 22px "Trebuchet MS",monospace;letter-spacing:4px;text-align:center;text-transform:uppercase}
#mp button{font:700 13px "Trebuchet MS",sans-serif;color:#fff;border:1px solid #0a0603;border-radius:6px;padding:7px 12px;margin:4px 6px 4px 0;cursor:pointer;background:linear-gradient(#654530,#33200f);box-shadow:0 0 0 1px rgba(255,196,120,.2) inset}
#mp button:hover:not(:disabled){background:linear-gradient(#e39a48,#8a4a10)}#mp button.pri{background:linear-gradient(#ffb25a,#c25e10)}#mp button.pri:hover:not(:disabled){background:linear-gradient(#ffcf8a,#d9731c)}#mp button:disabled{opacity:.45;cursor:default}
#mp .st{margin-top:8px;padding:6px 8px;border-radius:6px;background:rgba(0,0,0,.35);font-size:12px;color:#ffd9a0;min-height:18px}#mp .step{font-size:12px;color:#d9b27a;margin-top:8px;font-weight:700}
#mp .code{font:700 30px "Trebuchet MS",monospace;letter-spacing:6px;word-break:break-all;color:#ffd23c;text-align:center;padding:6px;background:#150e09;border:1px solid #9a6c3c;border-radius:8px;margin:6px 0}
#mp .pl{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:5px 0;border-radius:8px;background:rgba(0,0,0,.32);border:1px solid rgba(255,196,120,.18)}
#mp .pl .dot{width:12px;height:12px;border-radius:50%;background:#6a5a4a;flex:none}#mp .pl.on .dot{background:#6fe08a;box-shadow:0 0 8px #6fe08a}#mp .pl.off{opacity:.55}
#mp .pl .nm{font-weight:700;flex:1}#mp .pl .rd{font-size:12px;color:#d9b27a}#mp .pl.rdy .rd{color:#9ff0b0}
#mp details{margin-top:8px;font-size:12px;color:#d9b27a}#mp summary{cursor:pointer}
#mpHud{position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:9;padding:3px 10px;border-radius:12px;background:rgba(24,15,9,.85);border:1px solid #9a6c3c;color:#ffd9a0;font:700 12px "Trebuchet MS",sans-serif;display:none;pointer-events:none}`;
document.head.appendChild(mpCss);
mpEl.innerHTML=`<div class="bx"><h2>Co-op (online, 2 players)</h2><p>Each player founds their own castle on the same map. The economy is shared and you fight the zombies together.</p>
<div id="mpHome"><button class="pri" id="mpBH">Host a game</button><button id="mpBJ">Join with a code</button></div>
<div id="mpHostP" style="display:none"><div class="step">Choose a room code (like a password) - or leave empty for a random one</div><input class="cd" id="mpHCode" maxlength="16" placeholder="ROSE42" autocomplete="off"><button class="pri" id="mpMk">Create room</button></div>
<div id="mpJoinP" style="display:none"><div class="step">Type the code your host gave you</div><input class="cd" id="mpCode" maxlength="16" placeholder="ROSE42" autocomplete="off"><button class="pri" id="mpGo">Join</button></div>
<div id="mpLobby" style="display:none"><div class="step">Your room code - your partner types it to join</div><div class="code" id="mpRoom">-----</div>
<div class="step">Players</div><div class="pl" id="mpP1"><span class="dot"></span><span class="nm"></span><span class="rd"></span></div><div class="pl" id="mpP2"><span class="dot"></span><span class="nm"></span><span class="rd"></span></div>
<div><button class="pri" id="mpSite">Choose my castle site</button><button class="pri" id="mpPlay" style="display:none">Play</button></div></div>

<div class="st" id="mpSt"></div><div style="margin-top:6px"><button id="mpClose">Close</button><button id="mpBack" style="display:none">Back</button></div></div>`;
document.body.appendChild(mpEl);
const mpHud=document.createElement('div');mpHud.id='mpHud';document.body.appendChild(mpHud);
const $m=id=>document.getElementById(id);
function mpStatus(t){$m('mpSt').textContent=t}
function mpModal(v){mpEl.style.display=v?'flex':'none'}
function lobbyNote(t){mpStatus(t)}
function mpFallback(v){}
function mpOpen(){mpModal(true);if(MP.conn)lobbyShow()}
function lobbyShow(){mpModal(true);$m('mpHostP').style.display='none';$m('mpHome').style.display='none';$m('mpJoinP').style.display='none';$m('mpLobby').style.display=(MP.conn||MP.code)?'block':'none';$m('mpBack').style.display='none';lobbyRender()}
function lobbyRender(){const L=$m('mpLobby');if(!L)return;$m('mpRoom').textContent=MP.code||'-----';
 const me=THEME.n||'You',row=(id,name,on,rdy,txt)=>{const e=$m(id);e.className='pl'+(on?' on':' off')+(rdy?' rdy':'');e.children[1].textContent=name;e.children[2].textContent=txt};
 const hostN=MP.host?me:(MP.pname||'Host'),guestN=MP.host?(MP.pname||''):me;
 row('mpP1',hostN+' (host)',MP.host||MP.conn,MP.host?!!MP.mine:!!MP.theirs,(MP.host?MP.mine:MP.theirs)?'Castle placed - ready':'Choosing a castle site...');
 const g=MP.host?MP.conn:true;row('mpP2',g?guestN:'Waiting for player 2...',g,MP.host?!!MP.theirs:!!MP.mine,g?((MP.host?MP.theirs:MP.mine)?'Castle placed - ready':'Choosing a castle site...'):'');
 $m('mpSite').textContent=MP.mine?'Change my castle site':'Choose my castle site';$m('mpSite').disabled=!MP.conn;
 const pb=$m('mpPlay');pb.style.display=MP.host?'inline-block':'none';const rd=MP.conn&&MP.mine&&MP.theirs;pb.disabled=!rd;pb.textContent=rd?'Play':'Play (both players must place a castle)';
 if(!MP.host&&MP.conn&&MP.mine&&MP.theirs)mpStatus('Waiting for the host to press Play...')}
$m('mpBH').onclick=()=>{$m('mpHome').style.display='none';$m('mpHostP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpHCode').focus()};
$m('mpMk').onclick=()=>{$m('mpHostP').style.display='none';$m('mpBack').style.display='none';lobbyHost($m('mpHCode').value)};
$m('mpHCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$m('mpMk').click()});
$m('mpBJ').onclick=()=>{$m('mpHome').style.display='none';$m('mpJoinP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpCode').focus()};
$m('mpBack').onclick=()=>{$m('mpJoinP').style.display='none';$m('mpHostP').style.display='none';$m('mpHome').style.display='block';$m('mpBack').style.display='none'};
$m('mpGo').onclick=()=>lobbyJoin($m('mpCode').value);
$m('mpCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')lobbyJoin($m('mpCode').value)});
$m('mpClose').onclick=()=>mpModal(false);
$m('mpSite').onclick=()=>{mpModal(false);setupOpen=false;settingsOpen=false;openPicker();pickMsg=MP.host?'':'Choose where YOUR castle will stand'};
$m('mpPlay').onclick=mpStart;
setInterval(()=>{let t='';if(MP.on){t=MP.rsy?'Co-op: resynchronizing...':MP.desync?'Co-op: OUT OF SYNC':MP.stall?'Co-op: waiting for your partner...':''}
 else if(MP.conn&&picking){t='Co-op lobby - '+(MP.mine?'your castle: placed':'choose your castle site')+' | '+(MP.pname||'partner')+': '+(MP.theirs?'ready':'choosing...')}
 else if(MP.conn&&!MP.host&&started===false&&MP.mine&&MP.theirs)t='Waiting for the host to press Play';
 if(t!==mpHud._t){mpHud._t=t;mpHud.textContent=t;mpHud.style.display=t?'block':'none';mpHud.style.color=MP.desync?'#ff8a8a':'#ffd9a0'}},300);

/* ================= Extras: forge icons, control groups, alerts, chat & pings, daily map ================= */
IC.iron=ICN(g=>{ln(g,3.5,12.5,12,4,'#2a303a',3.2);ln(g,3.5,12.5,12,4,'#eef2f8',1.8);ln(g,3.2,9.6,7,13.4,'#6a4a10',2.4);ln(g,3.2,9.6,7,13.4,'#f0c040',1.4);poly(g,[[12.6,1.2],[13.4,3],[15.2,3.8],[13.4,4.6],[12.6,6.4],[11.8,4.6],[10,3.8],[11.8,3]],'#ffd23c','#7a5a00',.5)});
IC.plate=ICN(g=>{poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5],[2.8,9],[2.4,3.4]],lgr(g,2,2,14,14,'#d8dde8','#6d7480'),'#2f343d',1);poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5]],'rgba(0,0,0,.2)');ln(g,8,3,8,12.2,'#e0b030',1.4);ln(g,4.4,6.4,11.6,6.4,'#e0b030',1.4)});
IC.drill=ICN(g=>{circ(g,8,8.6,6,lgr(g,3,3,13,14,'#f6e9d2','#c4a37a'),'#5a3a1a',1);ln(g,8,8.6,8,4.6,'#4a2c12',1.4);ln(g,8,8.6,11,10.4,'#4a2c12',1.4);rrg(g,6.2,1.2,3.6,2,.6,'#9a6c3c','#3a220e',.7)});
IC.house=ICN(g=>{rrg(g,2.5,7,11,7.5,.8,lgr(g,0,7,0,14,'#e6d4ac','#b89a68'),'#3a2a14',.9);poly(g,[[1,7.4],[8,1.6],[15,7.4]],lgr(g,0,2,0,8,'#d0603e','#a03a24'),'#3a1a10',1);rrg(g,6.6,9.6,2.8,4.9,.5,'#6a4420','#2a1808',.7);rrg(g,10,8.8,2.2,2.2,.3,'#7ec8e8','#2a3a4a',.6)});
IC.rally=ICN(g=>{ln(g,4,1.5,4,14.5,'#3a2410',1.6);poly(g,[[4.6,2],[13.5,4.4],[4.6,7.6]],lgr(g,4,2,14,8,'#8dffb0','#2fa05a'),'#124a28',.9);circ(g,4,14.6,1.4,'#6a4a2a','#2a1808',.6)});
IC.market=ICN(g=>{rrg(g,2.5,8,11,6,.6,lgr(g,0,8,0,14,'#c4904e','#7a5228'),'#3a2410',.9);for(let i=0;i<4;i++)poly(g,[[1.5+i*3.25,7.8],[4.75+i*3.25,7.8],[4.2+i*3.25,3],[2.1+i*3.25,3]],i%2?'#f2ead8':'#c0392b','#4a1a10',.6);circ(g,8,11,1.8,'#ffd23c','#8a5a00',.6)});
IC.forester=ICN(g=>{rrg(g,1.4,7.6,9.2,6.6,.6,lgr(g,0,7,0,14,'#9a6a3a','#6a4424'),'#2a1808',.9);for(const y of[9.4,11.4])ln(g,1.8,y,10.2,y,'rgba(40,20,8,.55)',.7);poly(g,[[.4,8],[6,3.2],[11.6,8]],lgr(g,0,3,0,8,'#76a84c','#3f6a2a'),'#1a3010',.9);rrg(g,4.7,10.2,2.4,4,.4,'#4a2c14','#1a0c04',.6);ln(g,13.2,14.6,13.2,9,'#6a4424',1.5);circ(g,13.2,7.4,2.7,lgr(g,11,5,15,10,'#8de06a','#3f8a2a'),'#1a4010',.8)});
IC.guild=ICN(g=>{rrg(g,1.6,9.2,12.8,5.6,.6,lgr(g,0,9,0,15,'#e0d6c2','#a09484'),'#3a3428',.9);ln(g,1.6,12,14.4,12,'rgba(58,52,40,.45)',.7);ln(g,6,9.2,6,12,'rgba(58,52,40,.45)',.7);ln(g,10.5,12,10.5,14.8,'rgba(58,52,40,.45)',.7);ln(g,3.4,8.4,11.4,1.8,'#6a4424',1.9);rrg(g,9.2,.5,4.8,3.1,.5,lgr(g,9,0,14,4,'#e4e8f0','#7a8090'),'#1a1a24',.8);ln(g,12.6,8.4,6.2,3,'#8a6a3a',1.5);poly(g,[[2.4,.8],[7.2,2.6],[5,5.4]],lgr(g,2,1,7,5,'#eef2f8','#8a90a0'),'#1a1a24',.7)});
IC.torch=ICN(g=>{ln(g,8,15,8,7,'#5a3a1a',2.4);ln(g,8,15,8,7,'#a8783e',1.2);rrg(g,5,5,6,3,.4,'#4a4a52','#1a1a20',.7);poly(g,[[8,.8],[11,5],[5,5]],lgr(g,0,1,0,5,'#fff1a0','#ff8a2a'),'#8a3a0a',.6)});
{const TRIC={},tic=(k,a,b)=>{const A=IC[a],B2=IC[b],o=TRIC[k];if(o&&o.a===A&&o.b===B2)return o.c;const c=cvs(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(A,0,0,44,44);g.drawImage(B2,22,22,42,42);TRIC[k]={a:A,b:B2,c};return c};
 for(const[k,a,b]of[['sellw','wood','coin'],['sells','stone','coin'],['buyw','coin','wood'],['buys','coin','stone'],['sellf','food','coin'],['buyf','coin','food']])Object.defineProperty(IC,k,{get:()=>tic(k,a,b),enumerable:true,configurable:true})}
IC.food=ICN(g=>{ln(g,11.6,1.2,9.4,8.6,'#8a6a1a',1.1);for(let k=0;k<4;k++){const y=2+k*1.45,x=11.3-k*.5;circ(g,x-1,y+.5,1.05,'#f0c850','#7a5a10',.5);circ(g,x+1,y+.2,1.05,'#e8bc40','#7a5a10',.5)}rrg(g,1.6,7.4,12.4,6.8,3.4,lgr(g,0,7,0,14,'#f2b860','#a8601c'),'#4a2608',.9);for(const x of[5,8,11])ln(g,x-1,9.4,x+1.2,11.6,'#ffe6b0',1.1)});
IC.rallyc=IC.rally;IC.repair=ICN(g=>{ln(g,3.2,14,10.4,6.8,'#3a2410',3.2);ln(g,3.2,14,10.4,6.8,'#b07a40',1.8);poly(g,[[7.2,2.6],[13.8,9.2],[11.6,11.4],[5,4.8]],lgr(g,6,3,13,11,'#e4e8f0','#7a8090'),'#1a1a24',.9);});IC.rotate=ICN(g=>{circ(g,8,8,4.6,null,'#e8d8a8',1.8);poly(g,[[9,1.5],[14,4],[9,6.5]],'#e8d8a8','#3a2410',.8)});IC.movec=ICN(g=>{rrg(g,2,6,12,8,.6,lgr(g,0,6,0,14,'#c8c8d0','#8a8a98'),'#2a2a38',.9);poly(g,[[1,15.5],[8,12.5],[15,15.5]],'#7dffa0','#124a28',.7)});IC.academy=ICN(g=>{rrg(g,2,7,12,7.5,.6,lgr(g,0,7,0,14,'#efe8d4','#b8ad90'),'#3a2a14',.9);poly(g,[[1,7.6],[8,2.2],[15,7.6]],lgr(g,0,2,0,8,'#4a6cb8','#2a3f80'),'#16204a',1);circ(g,8,2.2,1.3,'#ffd23c','#8a6a10',.6);rrg(g,6.6,9.8,2.8,4.7,.5,'#5a3a1e','#2a1808',.7);rrg(g,3,9,2,2.4,.3,'#7ec8e8','#2a3a4a',.5);rrg(g,11,9,2,2.4,.3,'#7ec8e8','#2a3a4a',.5)});
IC.steel=ICN(g=>{ln(g,3,13,12,4,'#2a303a',3);ln(g,3,13,12,4,'#cfe4ff',1.7);ln(g,3.2,10,6.6,13.4,'#2a303a',2.6);ln(g,3.2,10,6.6,13.4,'#6fd0ff',1.4);poly(g,[[12.6,1.2],[13.6,3.2],[15.4,4],[13.4,4.8],[12.4,6.6],[11.6,4.6],[9.8,3.8],[11.8,3.2]],'#ffffff','#2a303a',.6)});
IC.mail=ICN(g=>{poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5],[2.8,9],[2.4,3.4]],lgr(g,2,2,14,14,'#bfc8d8','#5a6478'),'#2f343d',1);for(let y=4;y<13;y+=2.2)for(let x=4+((y/2.2|0)%2)*1.2;x<12.5;x+=2.4)circ(g,x,y,.9,'rgba(255,255,255,.55)','#2f343d',.3)});
IC.tools=ICN(g=>{ln(g,3,13.5,11,3.5,'#5a3a1a',2);ln(g,3,13.5,11,3.5,'#c4904e',1.1);poly(g,[[9,1.8],[14.6,4.6],[13.6,7],[8.6,4.4]],'#cfd6e2','#2f343d',.8);ln(g,13.5,13.5,5,5,'#5a3a1a',2);ln(g,13.5,13.5,5,5,'#c4904e',1.1)});
IC.harvest=ICN(g=>{ln(g,8,14.5,8,6,'#8a6a2a',1.2);for(let i=0;i<4;i++){const y=3+i*2.4;poly(g,[[8,y],[5.6,y-1.6],[6.4,y+.4]],'#e0c23c','#8a6a1a',.5);poly(g,[[8,y],[10.4,y-1.6],[9.6,y+.4]],'#e0c23c','#8a6a1a',.5)}poly(g,[[8,.6],[7,2.6],[9,2.6]],'#f0d84a','#8a6a1a',.5)});
IC.fletch=ICN(g=>{ln(g,2.5,13.5,13,2.5,'#6a4a2a',1.4);poly(g,[[13,1.5],[15,3.6],[12.4,3.8]],'#e8eaf0','#2a303a',.7);poly(g,[[2,12],[4.6,12.6],[3.4,15.2]],'#e05a4a','#5a1a14',.6);poly(g,[[3.6,10.6],[6.2,11.4],[4.8,13.6]],'#e05a4a','#5a1a14',.6)});
IC.bastion=ICN(g=>{rrg(g,2,6,12,8.5,.6,lgr(g,0,6,0,15,'#b8bfcc','#6a7280'),'#2a303a',.9);[2,6,10].forEach(x=>rrg(g,x,3.4,3.2,3.4,.3,'#a8b0be','#2a303a',.7));rrg(g,6.4,9.8,3.2,4.7,1.4,'#3a2a1a','#1a1208',.7)});
IC.farm=IC.farm||ICN(g=>{rrg(g,1.5,6,13,8,1,lgr(g,0,6,0,14,'#8a5a2a','#5a3a1a'),'#2a1808',.9);[3,5.6,8.2,10.8].forEach((x,i)=>rrg(g,x,7,1.8,6,.5,i%2?'#e0c23c':'#6fb13e'));poly(g,[[2,6],[8,1.5],[14,6]],'#c9553a','#5a1a0a',.8)});
/* ---- control groups: Shift+1..9 recall, Ctrl+1..9 (or Shift+Alt+1..9) save ---- */
const CG={};
addEventListener('keydown',e=>{if(!started||over||document.activeElement===nmI||document.activeElement===mpChatI)return;const m=/^Digit([1-9])$/.exec(e.code);
 if(!m||!(e.ctrlKey||e.shiftKey||e.metaKey))return;const d=m[1];e.preventDefault();e.stopImmediatePropagation();
 if(e.ctrlKey||e.metaKey||(e.shiftKey&&e.altKey)){const S=sel().map(u=>u.uid);CG[d]=S;msgS='Group '+d+' saved ('+S.length+')';msgT=2;snd('click')}
 else{const S=new Set(CG[d]||[]);const L=units.filter(u=>S.has(u.uid)&&u.hp>0&&!u.gar);if(!L.length){msgS='Group '+d+' is empty';msgT=2;return}
  const again=CG.last===d&&Date.now()-(CG.lt||0)<450;units.forEach(u=>u.sel=false);L.forEach(u=>u.sel=true);mode=null;CG.last=d;CG.lt=Date.now();if(again){CAM.x=L[0].x/TS;CAM.z=L[0].y/TS}msgS='Group '+d+' ('+L.length+')';msgT=2;snd('select')}},true);
/* ---- Tab: jump to the last attack ---- */
addEventListener('keydown',e=>{if(e.key==='Tab'&&started){e.preventDefault();const a=ALERTS[ALERTS.length-1];if(a){CAM.x=a.x/TS;CAM.z=a.y/TS}else{msgS='No recent attack';msgT=2}}});
/* ---- daily map ---- */
function dailyMap(){const d=Math.floor(Date.now()/864e5),R=rngf(d*2654435761%4294967296);SEED=R()*500;GPR={fq:.009+R()*.007,wl:.28+R()*.08,mt:.5+R()*.1,rv:.008+R()*.008,rg:.93+R()*.03,am:.7+R()*.5,tr:.5+R()*.2,gd:.8+R()*.5,tc:.003+R()*.01};if(typeof mpWorldSync==='function')mpWorldSync()}
/* ---- co-op chat & pings ---- */
const mpChatBox=document.createElement('div'),mpChatI=document.createElement('input');
Object.assign(mpChatBox.style,{position:'fixed',left:'8px',bottom:'210px',zIndex:9,maxWidth:'46vw',pointerEvents:'none',font:'400 18px VT323,"Courier New",monospace',color:'#ffffff',textShadow:'2px 2px 0 #3f3f3f'});
Object.assign(mpChatI.style,{position:'fixed',left:'8px',bottom:'180px',width:'min(360px,60vw)',zIndex:10,display:'none',background:'rgba(12,16,24,.88)',color:'#f2e4c4',border:'1px solid #c9a24f',borderRadius:'2px',padding:'5px 9px',font:'400 16px "NaxNum","Marcellus",Georgia,serif',outline:'none',boxShadow:'0 0 0 1px #07060b'});
mpChatI.placeholder='Message to your partner (Enter to send)';mpChatI.maxLength=120;document.body.appendChild(mpChatBox);document.body.appendChild(mpChatI);
function chatLine(who,t){const d=document.createElement('div');d.style.cssText='background:rgba(0,0,0,.5);padding:1px 6px;margin-top:0;width:fit-content';const b=document.createElement('span');b.style.color=who==='You'?'#ffff55':'#55ffff';b.textContent='<'+who+'> ';d.appendChild(b);d.appendChild(document.createTextNode(t));mpChatBox.appendChild(d);setTimeout(()=>d.remove(),9000);while(mpChatBox.children.length>6)mpChatBox.firstChild.remove()}
mpChatI.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){const t=mpChatI.value.trim();if(t&&MP.conn){mpSend({k:'chat',t});chatLine('You',t)}mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}else if(e.key==='Escape'){mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}});
addEventListener('keydown',e=>{if(e.key==='Enter'&&MP.conn&&started&&document.activeElement!==mpChatI&&document.activeElement!==nmI){e.preventDefault();mpChatI.style.display='block';mpChatI.focus()}},true);
const PINGS=[];
function addPing(x,y,mine){PINGS.push({x,y,t:5,mine});snd('click')}
function drawPings(){if(!started||!PINGS.length)return;ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,DPR),dt=Math.min(.05,(performance.now()-(drawPings.t||performance.now()))/1000)||.016;drawPings.t=performance.now();
 for(let i=PINGS.length-1;i>=0;i--){const p=PINGS[i];p.t-=dt;if(p.t<=0){PINGS.splice(i,1);continue}
  const q=scr(p.x/TS,(HT[(p.y/TS|0)*TW+(p.x/TS|0)]||0)+.3,p.y/TS);if(!q.ok)continue;const r=(10+((p.t*2)%1)*22)*k;
  ctx.strokeStyle=p.mine?'rgba(255,210,60,.95)':'rgba(120,220,255,.95)';ctx.lineWidth=2.5*k;ctx.beginPath();ctx.arc(q.x,q.y,r,0,6.283);ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,3*k,0,6.283);ctx.fillStyle=ctx.strokeStyle;ctx.fill()}}
cv.addEventListener('pointerdown',e=>{if(e.altKey&&MP.conn&&started){const w=wpos();mpSend({k:'ping',x:w.x,y:w.y});addPing(w.x,w.y,true);e.stopImmediatePropagation();e.preventDefault()}},true);
const _mm=mpMsg;mpMsg=function(m){if(m.k==='chat'){chatLine('Partner',String(m.t||'').slice(0,120));snd('click')}else if(m.k==='ping')addPing(+m.x,+m.y,false);else return _mm(m)};
/* partner cursor + castle site during placement */
MP.cur=null;let _pcT=0,_pcL='';
function pkOther(){if(PK.oth)return PK.oth;const g=new THREE.Group(),m=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,depthTest:false});
 const cone=new THREE.Mesh(new THREE.ConeGeometry(5,14,10),m(0x5aa9ff));cone.rotation.x=Math.PI;cone.position.y=12;cone.renderOrder=9;
 const ring=new THREE.Mesh(new THREE.RingGeometry(10,12,40),m(0x5aa9ff));ring.rotation.x=-Math.PI/2;ring.position.y=1;ring.renderOrder=9;
 const cv2=document.createElement('canvas');cv2.width=256;cv2.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv2),depthTest:false,transparent:true}));sp.scale.set(40,10,1);sp.position.y=28;sp.renderOrder=10;
 g.add(cone,ring,sp);g.userData={cv:cv2,sp,ring,cone,nm:null};PK.sc.add(g);PK.oth=g;return g}
function pkOthName(g,t){if(g.userData.nm===t)return;g.userData.nm=t;const c=g.userData.cv,x=c.getContext('2d');x.clearRect(0,0,256,64);x.font='700 28px '+FFT;x.textAlign='center';x.lineWidth=6;x.strokeStyle='#0b0810';x.fillStyle='#f3d27a';x.strokeText(t,128,42);x.fillText(t,128,42);g.userData.sp.material.map.needsUpdate=true}
const _rp=renderPick;renderPick=function(dt){if(!PK||PK.key!==SEED)pkBuild();
 if(MP.conn){const h=PK.hit||pickPos;if(h&&performance.now()-_pcT>90){const k=h.tx+','+h.ty;if(k!==_pcL){_pcL=k;mpSend({k:'pc',tx:h.tx,ty:h.ty})}_pcT=performance.now()}
  const g=pkOther(),P=MP.theirs||MP.cur;
  if(P&&PK.Y){const i=Math.max(0,Math.min(PVW-1,Math.round((P.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((P.ty-1)/PVS)));g.visible=true;g.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);
   const placed=!!MP.theirs;g.userData.ring.scale.setScalar(placed?1.6:1);g.userData.cone.position.y=12+(placed?0:Math.sin(clockT*5)*1.5);pkOthName(g,(MP.pname||'Partner')+(placed?' - castle':''))}else g.visible=false}
 else if(PK.oth)PK.oth.visible=false;
 _rp(dt)};
const _mm2=mpMsg;mpMsg=function(m){if(m.k==='pc'){MP.cur={tx:+m.tx,ty:+m.ty}}else return _mm2(m)};
IC.storage=ICN(g=>{rrg(g,1,6,7,7,.8,lgr(g,0,6,0,13,'#c4904e','#8a5a2a'),'#3a2410',.9);rrg(g,8,8,6,5,.8,lgr(g,0,8,0,13,'#b8844a','#7a4a22'),'#3a2410',.9);rrg(g,4,1.5,7,5,.8,lgr(g,0,1.5,0,6.5,'#d6b36a','#a07a3a'),'#3a2410',.9);ln(g,1,9.5,8,9.5,'#4a3418',1);ln(g,4.5,4,10.5,4,'#6a4a1a',1)});
IC.ramp=ICN(g=>{poly(g,[[1,13],[1,10],[15,3],[15,13]],lgr(g,0,3,0,13,'#c9a060','#8a6238'),'#3a2410',.9);for(let i=0;i<5;i++)ln(g,3+i*2.4,12.2-i*1.4,3+i*2.4,9.8-i*1.4,'#5a3d1e',.9);poly(g,[[1,13],[15,13],[15,14.5],[1,14.5]],'#5fae48','#244a1c',.6)});
IC.demolish=ICN(g=>{poly(g,[[2,13],[2,7],[8,3],[14,7],[14,13]],lgr(g,0,3,0,13,'#b79a76','#7a5a3a'),'#3a2410',.9);ln(g,3,3,13,13,'#e04a3a',2.2);ln(g,13,3,3,13,'#e04a3a',2.2)});
Object.defineProperty(IC,'tier',{get:()=>RS.done&&BTIER?IC.stone:IC.wood,configurable:true,enumerable:true});
/* QoL: auto-pause when the tab is hidden (solo), Delete = demolish the selected building */
/* alt-tab / hidden tab: solo games pause themselves (and keys held down are released); co-op keeps simulating so the partner is never stalled */
let autoPaused=false;
function focusLost(why){for(const k in keys)keys[k]=false;ptr=null;box=null;mmDrag=false;sliderDrag=null;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)focusLost('tab hidden')});
addEventListener('blur',()=>focusLost('window inactive'));
/* while the tab is hidden requestAnimationFrame stops: keep the co-op lockstep running from timers and from incoming packets */
let bgLast=0;
function bgTick(){if(document.hidden&&!MP.on&&started&&inGame&&!over&&!paused){const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(30,(n-bgLast)/1000);if(e<.05)return;bgLast=n;try{while(e>.001){const d=Math.min(.05,e);for(let k=0;k<spd;k++)update(d);e-=d}}catch(er){}return}
 if(!(document.hidden&&MP.on&&started&&!over)){bgLast=0;return}const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(2,(n-bgLast)/1000);if(e<.03)return;bgLast=n;
 try{while(e>0){const d=Math.min(.25,e);mpFrame(d);e-=d;if(MP.stall)break}}catch(er){}}
setInterval(bgTick,100);try{const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),200)'],{type:'text/javascript'})));wk.onmessage=()=>{if(document.hidden)bgTick()}}catch(e){}
addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&inGame&&!over&&selB&&structs.includes(selB)&&selB.t===0&&selB.type!=='castle'&&document.activeElement===document.body){e.preventDefault();build('demolish',selB.tx,selB.ty)}});

addEventListener('keydown',e=>{if(!started||over||document.activeElement===nmI)return;});

/* Arcane look for the co-op lobby (DOM): navy panel, brass rim with art-deco studs, gold Cinzel titles, hextech-blue hover */
{const mcCss=document.createElement('style');mcCss.textContent=`
#mp{font-family:"NaxNum","Marcellus","Palatino Linotype",Georgia,serif !important;background:radial-gradient(ellipse at 50% 42%,rgba(16,22,38,.78),rgba(3,4,9,.94)) !important}
#mp .bx{position:relative;background:linear-gradient(#26313f,#151b25 60%,#10151d) !important;border:1px solid #c9a24f !important;border-radius:2px !important;padding:18px 22px !important;
 box-shadow:0 0 0 1px #07060b,0 0 0 5px rgba(201,162,79,.1),0 20px 60px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,236,190,.09) !important;overflow:visible !important}
#mp .bx::after{content:"";position:absolute;inset:5px;border:1px solid rgba(201,162,79,.26);pointer-events:none}
#mp .bx::before{content:"";position:absolute;left:50%;top:-7px;width:11px;height:11px;transform:translateX(-50%) rotate(45deg);background:linear-gradient(135deg,#f8e2a0,#c9a24f 50%,#6e5221);border:1px solid #07060b}
#mp h2{font-family:"Cinzel","Marcellus",Georgia,serif !important;font-weight:700 !important;font-size:25px !important;letter-spacing:1px;color:#f2c862 !important;
 background:linear-gradient(#fff5d2,#f2c862 47%,#dca23e 53%,#a8721f);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none !important;filter:drop-shadow(1px 2px 0 rgba(4,3,8,.85));margin-bottom:8px !important}
#mp p,#mp details{color:#ead8ba !important;font-size:15px !important;font-weight:400 !important;text-shadow:none !important}
#mp .step{color:#d9b27a !important;font-family:"Cinzel","Marcellus",serif !important;font-weight:600 !important;font-size:13px !important;letter-spacing:.6px;text-shadow:none !important;margin-top:12px !important}
#mp button{font:400 16px "NaxNum","Marcellus",Georgia,serif !important;color:#fbf1de !important;text-shadow:0 1px 0 rgba(0,0,0,.6) !important;background:linear-gradient(#2e3c4f,#1a222e) !important;
 border:1px solid #c9a24f !important;border-radius:2px !important;box-shadow:0 0 0 1px #07060b,inset 0 1px 0 rgba(255,236,190,.1) !important;padding:7px 16px !important;margin:6px 8px 4px 0 !important}
#mp button:hover:not(:disabled){background:linear-gradient(#305575,#1b3349) !important;border-color:#86dcff !important;box-shadow:0 0 0 1px #07060b,0 0 12px rgba(110,210,255,.38),inset 0 0 10px rgba(110,210,255,.16) !important}
#mp button.pri{background:linear-gradient(#25818b,#155059) !important;border-color:#79dede !important}
#mp button.pri:hover:not(:disabled){background:linear-gradient(#2d9aa6,#1b6872) !important;border-color:#bdf6f6 !important}
#mp button:disabled{opacity:.42 !important}
#mp textarea,#mp input.cd{background:#0b0f17 !important;color:#f2e4c4 !important;border:1px solid #8a6f36 !important;border-radius:2px !important;box-shadow:inset 0 2px 6px rgba(0,0,0,.6)}
#mp input.cd{font:700 22px "Cinzel",Georgia,serif !important;letter-spacing:5px !important}#mp input.cd:focus,#mp textarea:focus{outline:none;border-color:#86dcff !important;box-shadow:0 0 10px rgba(110,210,255,.3),inset 0 2px 6px rgba(0,0,0,.6)}
#mp .code{background:#0b0f17 !important;border:1px solid #c9a24f !important;border-radius:2px !important;color:#f2c862 !important;font-family:"NaxNum","Cinzel",serif !important;font-weight:700 !important;text-shadow:0 0 14px rgba(242,200,98,.35)}
#mp .st:empty{display:none}#mp .st{border-radius:2px !important;background:rgba(5,8,14,.6) !important;border-left:2px solid #c9a24f;color:#f2d27e !important;font-size:14px !important}
#mp .pl{border-radius:2px !important;background:rgba(5,8,14,.5) !important;border:1px solid rgba(201,162,79,.35) !important}
#mp .pl .dot{border-radius:0 !important;width:9px !important;height:9px !important;transform:rotate(45deg);background:#4a4536 !important;border:1px solid #07060b}#mp .pl.on .dot{background:#79dede !important;box-shadow:0 0 8px #79dede !important}
#mp .pl .nm{font-family:"Cinzel","Marcellus",serif;font-weight:700;color:#f2e4c4}#mp .pl .rd{color:#d9b27a !important}#mp .pl.rdy .rd{color:#9ff0d8 !important}
#mpHud{border-radius:2px !important;background:linear-gradient(#26313f,#151b25) !important;border:1px solid #c9a24f !important;color:#f2d27e !important;font:400 14px "NaxNum","Marcellus",Georgia,serif !important;box-shadow:0 0 0 1px #07060b}`;document.head.appendChild(mcCss)}
/* ================= Minecraft-style icons =================
   items  -> 16x16 pixel sprites with a dark outline (ingot, sword, armour, wheat, clock, map...)
   blocks -> isometric cubes (log, cobblestone, stone bricks, grass, TNT, piston, stairs, path)
   units  -> mob-head style heads; buildings -> isometric renders of the real medieval models */
function pc16(fn,ol){const c=cvs(16,16),g=c.getContext('2d'),P=(x,y,col)=>{if(x<0||y<0||x>15||y>15)return;g.fillStyle=col;g.fillRect(x|0,y|0,1,1)},R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},
 L=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let k=0;k<=n;k++)P(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),typeof col==='function'?col(k,n):col)},
 Gd=(rows,pal,x0,y0)=>rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch!=='.'&&pal[ch])P(x0+i,y0+j,pal[ch])}}),
 C=(cx,cy,f)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x+.5-cx,dy=y+.5-cy,col=f(hyp(dx,dy),Math.atan2(dy,dx),dx,dy);if(col)P(x,y,col)}};
 fn({P,R,L,Gd,C,g});const o=arcIcon(epx(epx(epx(c))),ICO_N);o.__px=true;return o}
const MI_IRN={i:'#c9ced6',w:'#f2f2f2',d:'#8a909c'},MI_STK=(k)=>k%2?'#5a3f1c':'#8a6a3a';
/* isometric block / model helpers (geometry built from 0..1 so the pixel shader's block grid lines up with the cube edges) */
function miMesh(G){return new THREE.Mesh(toGeo(G),matV)}
function miBlock(fn){const G=newG();fn(G);return miMesh(G)}
const MI_ISO=[Math.PI/4,.58];
function miShot(o,yaw,pitch){return icoShot(o,yaw==null?MI_ISO[0]:yaw,pitch==null?MI_ISO[1]:pitch)}
/* building renders: brighter light, slightly finer pixels so timber frames and roofs stay readable */
let MI_AMB=null;function miShotB(obj,yaw,pitch,n){const R=ICR,cam=R.cam;if(!MI_AMB){MI_AMB=new THREE.AmbientLight(0xffffff,.5);MI_AMB.visible=false;R.sc.add(MI_AMB)}MI_AMB.visible=true;
 R.sc.add(obj);obj.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=Math.max(.01,sp.radius),d=r/Math.sin(cam.fov*Math.PI/360)*.98;
 cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
 const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const fw0=FOWU.fowP.value.w,fz0=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(R.rt);renderer.clear();renderer.render(R.sc,cam);renderer.readRenderTargetPixels(R.rt,0,0,ICO_RT,ICO_RT,R.buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);FOWU.fowP.value.w=fw0;FOWU.fowP.value.z=fz0;R.sc.remove(obj);MI_AMB.visible=false;
 const N2=ICO_RT,cv2=cvs(N2,N2),g=cv2.getContext('2d'),im=g.createImageData(N2,N2);for(let y=0;y<N2;y++){const sy=N2-1-y;for(let x=0;x<N2;x++){const s0=(sy*N2+x)*4,o=(y*N2+x)*4;im.data[o]=R.buf[s0];im.data[o+1]=R.buf[s0+1];im.data[o+2]=R.buf[s0+2];im.data[o+3]=R.buf[s0+3]}}g.putImageData(im,0,0);return arcIcon(cv2,ICO_N)}
function miOverlay(c,rows,pal,x0,y0){const g=c.getContext('2d'),k=c.width/20;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.'||!pal[ch])continue;g.fillStyle=pal[ch];g.fillRect((x0+i)*k,(y0+j)*k,Math.ceil(k),Math.ceil(k))}});return c}
function miHead(type,t){const mdl=mkModel(type,t),g=new THREE.Group();g.add(new THREE.Mesh(mdl.head,matUI));
 if(mdl.parts)for(const p of mdl.parts)if(p.k==='plume'){const m=new THREE.Mesh(p.geo,matUI);m.position.set(p.x,p.y-mdl.neck,p.z);g.add(m)}
 return icoShot(g,.66,.4)}
function mcIcons(){if(!ICR)icoInit();const SW=sprites(),IC2={};
 /* ---------- items ---------- */
 IC2.coin=pc16(({R,P})=>{R(5,5,8,1,'#fff3a8');R(4,6,8,1,'#ffe060');P(12,6,'#d8a018');R(3,7,8,3,'#f0b820');R(11,7,1,3,'#c08a14');P(12,7,'#b07a10');P(12,8,'#a87410');R(3,9,8,1,'#d09a18');P(6,5,'#ffffff');P(7,5,'#ffffff');R(4,8,3,1,'#ffd45a')});
 IC2.heart=pc16(({Gd})=>Gd(["..rrr...rrr..",".rwwrr.rrrrr.","rrwrrrrrrrrrr","rrrrrrrrrrrrr","rrrrrrrrrrrrd",".rrrrrrrrrrd.","..rrrrrrrrd..","...rrrrrrd...","....rrrrd....",".....rrd.....","......d......"],{r:'#e81c1c',w:'#ffb0b0',d:'#a00e0e'},1,2));
 const swd=(rows,pal)=>pc16(({Gd})=>Gd(rows,pal,0,0),false);
 IC2.sword=swd(SW.sword,SPAL);IC2.iron=IC2.sword;IC2.steel=swd(SW.sword,{...SPAL,w:'#e0fffb',i:'#5ae6e0',d:'#24a49c'});
 IC2.tools=swd(SW.pick,SPAL);
 IC2.army=pc16(({Gd})=>{Gd(SW.sword.map(r=>[...r].reverse().join('')),SPAL,0,0);Gd(SW.sword,SPAL,0,0)},false);
 IC2.dig=pc16(({L,C})=>{C(11.5,4.5,(r,a,dx,dy)=>Math.abs(dx)+Math.abs(dy)<3.1?(dx+dy<-1?'#f2f2f2':dx+dy<1.2?'#c9ced6':'#8a909c'):null);L(2,13,8,7,MI_STK)});
 IC2.fletch=pc16(({L,P})=>{L(4,11,11,4,'#8a6a3a');P(12,3,'#4a4a4a');P(11,3,'#7a7a7a');P(12,4,'#7a7a7a');P(13,2,'#9a9a9a');P(12,2,'#5a5a5a');P(13,3,'#5a5a5a');P(3,12,'#f0f0f0');P(2,12,'#d8d8d8');P(3,13,'#d8d8d8');P(2,13,'#f0f0f0');P(4,12,'#c8c8c8');P(3,11,'#c8c8c8');P(1,14,'#e8e8e8');P(2,11,'#e0e0e0');P(4,13,'#e0e0e0')});
 IC2.harvest=pc16(({Gd})=>Gd([".....y......","..y..Yy..y..",".Yy..yY.yY..",".yY..Yy.Yy..",".Yy..yY.yY..","..yG.Yy.yG..","...G.GG.G...","...G..G.G...","....G.GG....","....GGG.....",".....G......",".....G......","....GGG.....",".....G......"],{y:'#e8c84a',Y:'#c8a030',G:'#7a8a2a'},2,1));
 const CHP=[".iii....iii.","iwii....iiid","iwiiiiiiiiid","iwiiiiiiiiid",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".dddddddddd."];
 IC2.plate=pc16(({Gd})=>Gd(CHP,MI_IRN,2,3));
 IC2.mail=pc16(({Gd,g})=>{Gd(CHP,{i:'#a2a2aa',w:'#d0d0d8',d:'#5e5e66'},2,3);g.fillStyle='#3a3a42';for(let y=5;y<12;y+=2)for(let x=4+((y>>1)&1);x<12;x+=2)g.fillRect(x,y,1,1)});
 IC2.bastion=pc16(({Gd})=>Gd(["iiiiiiiiii","iwwwccwwwi","iwvwccwvwi","iwvwccwvwi","icccccccci","icccccccci","iwvwccwvwi","iwvwccwvwi","iwvwccwvwi",".iwwccwwi.","..iwccwi..","...iiii..."],{i:'#8a909c',w:'#a6844f',v:'#8a6a3a',c:thp()},3,2));IC2.shield=IC2.bastion;
 IC2.drill=pc16(({C,P})=>{C(8,8,(r,a,dx,dy)=>r>6.2?null:r>5.0?(dx+dy<0?'#ffe060':'#c8962a'):dy<0?'#4a8ad8':'#3a2a1a');P(6,5,'#ffe060');P(7,5,'#ffe060');P(6,6,'#ffe060');P(7,6,'#ffe060');P(10,10,'#5a9a36');P(9,11,'#5a9a36');P(8,8,'#1a1a1a');P(8,7,'#1a1a1a');P(8,6,'#1a1a1a')});
 IC2.compass=pc16(({C,L,P})=>{C(8,8,(r,a,dx,dy)=>r>6.2?null:r>5.0?'#6a6a72':r>4.0?(dx+dy<0?'#c8c8d0':'#9a9aa2'):'#3a3a44');L(8,8,11,5,'#e02a2a');L(8,8,5,11,'#e8e8e8');P(8,8,'#1a1a1a')});
 IC2.gear=pc16(({C})=>C(8,8,(r,a,dx,dy)=>{const tooth=Math.cos(a*8)>.15;if(r<2.1)return null;if(r<=4.9||(r<=6.6&&tooth))return dx+dy<-1?'#e0e0e0':dx+dy<2?'#b8b8c0':'#80808a';return null}));
 IC2.map=pc16(({R,P})=>{R(2,2,12,12,'#b8a070');R(3,3,10,10,'#ece0b4');R(4,4,4,3,'#7aa84a');R(9,8,3,3,'#7aa84a');R(4,9,3,3,'#5a8ad8');R(10,4,2,2,'#5a8ad8');P(8,6,'#a07040');P(7,7,'#a07040');P(8,8,'#a07040');P(10,11,'#a07040');P(9,6,'#c8282a');P(10,6,'#c8282a')});
 IC2.dice=pc16(({R})=>{R(3,3,10,10,'#f4f4f4');R(12,4,1,9,'#c8c8c8');R(4,12,9,1,'#c8c8c8');for(const[x,y]of[[5,5],[9,9],[7,7],[9,5],[5,9]])R(x,y,2,2,'#1a1a1a')});
 IC2.menu=pc16(({R})=>{for(const y of[4,7,10]){R(3,y,10,2,'#f0f0f0');R(3,y+1,10,1,'#c8c8c8')}});
 IC2.play=pc16(({R})=>{for(let y=3;y<=12;y++){const w=Math.round(Math.min(y-3,12-y)*1.6)+1;R(5,y,w,1,'#f0f0f0')}});
 IC2.pause=pc16(({R})=>{R(4,3,3,10,'#f0f0f0');R(9,3,3,10,'#f0f0f0');R(6,3,1,10,'#c8c8c8');R(11,3,1,10,'#c8c8c8')});
 const spk=(R)=>{R(2,6,3,4,'#e0e0e0');R(5,5,1,6,'#e0e0e0');R(6,4,1,8,'#e0e0e0');R(7,3,1,10,'#e0e0e0')};
 IC2.sound=pc16(({R,C})=>{spk(R);C(7,8,(r,a)=>Math.abs(a)<.9&&((r>2.6&&r<3.6)||(r>5.0&&r<6.0))?'#e0e0e0':null)});
 IC2.mute=pc16(({R,L})=>{spk(R);L(10,5,14,10,'#ff5555');L(14,5,10,10,'#ff5555')});
 const mag=(C,R,plus)=>{C(6.5,6.5,(r)=>r>4.4?null:r>3.2?'#d0d0d0':'#8ac8e8');R(10,10,2,2,'#7a5a2a');R(11,11,2,2,'#7a5a2a');R(12,12,2,2,'#5a3f1c');R(4,6,5,1,'#ffffff');if(plus)R(6,4,1,5,'#ffffff')};
 IC2.zoomIn=pc16(({C,R})=>mag(C,R,true));IC2.zoomOut=pc16(({C,R})=>mag(C,R,false));
 const arc=(C,R,P,dir)=>{C(8,9.5,(r,a)=>{if(r<3.3||r>4.9)return null;const deg=a*180/Math.PI;return deg<-12&&deg>-168?'#f0f0f0':null});if(dir<0){R(2,9,5,1,'#f0f0f0');R(3,10,3,1,'#f0f0f0');P(4,11,'#f0f0f0')}else{R(9,9,5,1,'#f0f0f0');R(10,10,3,1,'#f0f0f0');P(11,11,'#f0f0f0')}};
 IC2.rotL=pc16(({C,R,P})=>arc(C,R,P,-1));IC2.rotR=pc16(({C,R,P})=>arc(C,R,P,1));
 IC2.rotate=pc16(({C,R,P})=>{C(8,8,(r,a)=>{if(r<3.6||r>5.2)return null;const deg=a*180/Math.PI;return deg>-60||deg<-100?'#f0f0f0':null});R(8,1,1,6,'#f0f0f0');R(9,2,1,4,'#f0f0f0');R(10,3,1,2,'#f0f0f0')});
 IC2.close=pc16(({R})=>{for(let k=0;k<9;k++){R(3+k,3+k,2,2,'#ff5555');R(11-k,3+k,2,2,'#ff5555')}});
 IC2.cursor=pc16(({Gd})=>Gd(["w.......","ww......","www.....","wwww....","wwwww...","wwwwww..","wwwwwww.","wwwwwwww","wwwww...","ww.ww...","w...ww..","....ww..",".....ww."],{w:'#ffffff'},4,1));
 IC2.pan=pc16(({R,P})=>{const c='#f0f0f0';R(7,4,2,8,c);R(4,7,8,2,c);P(7,2,c);P(8,2,c);R(6,3,4,1,c);R(5,4,6,1,c);R(5,11,6,1,c);R(6,12,4,1,c);P(7,13,c);P(8,13,c);R(4,5,1,6,c);R(3,6,1,4,c);P(2,7,c);P(2,8,c);R(11,5,1,6,c);R(12,6,1,4,c);P(13,7,c);P(13,8,c)});
 const flag=(R,P,col,dk)=>{R(4,1,1,13,'#6b4a2a');R(3,14,3,1,'#5a5a5a');R(5,2,6,1,col);R(5,3,7,1,col);R(5,4,8,1,col);R(5,5,7,1,col);R(5,6,6,1,col);P(10,3,dk);P(11,4,dk);P(12,4,dk);P(10,5,dk);P(9,6,dk);R(6,4,2,1,'#ffffff')};
 IC2.rally=pc16(({R,P})=>flag(R,P,'#55e070','#2a9a40'));IC2.rallyc=pc16(({R,P})=>flag(R,P,'#ffd23c','#c8962a'));
 const ban=(R,P,col,dk)=>{R(3,1,10,1,'#8a6a3a');R(4,2,8,10,col);R(11,2,1,10,dk);P(4,12,col);P(5,12,col);P(7,12,col);P(8,12,col);P(10,12,col);P(11,12,dk);R(7,13,2,2,'#6b4a2a');R(7,4,2,6,'#f0f0f0');R(5,6,6,2,'#f0f0f0')};
 IC2.bannerman=pc16(({R,P})=>ban(R,P,thp(),ths()));
 const HLM=[".iiii.","iwiiid","iwiiid","ii..dd","i....d"];
 IC2.group=pc16(({Gd})=>{Gd(HLM,MI_IRN,5,2);Gd(HLM,MI_IRN,1,9);Gd(HLM,MI_IRN,9,9)});IC2.ungroup=pc16(({Gd})=>{Gd(HLM,MI_IRN,1,6);Gd(HLM,MI_IRN,9,6)});
IC2.plus=pc16(({R})=>{R(7,3,2,10,'#f0f0f0');R(3,7,10,2,'#f0f0f0')});IC2.minus=pc16(({R})=>R(3,7,10,2,'#f0f0f0'));
 IC2.ff=pc16(({R})=>{for(let y=3;y<=12;y++){const w=Math.round(Math.min(y-3,12-y)*1.0)+1;R(2,y,w,1,'#f0f0f0');R(8,y,w,1,'#f0f0f0')}});
 IC2.clock=IC2.drill;IC2.crown=pc16(({R,P})=>{R(2,7,12,5,'#ffd23c');R(2,11,12,1,'#c8962a');for(const x of[2,7,12]){R(x,4,2,3,'#ffd23c');P(x,3,'#ffe060')}P(4,6,'#ffd23c');P(10,6,'#ffd23c');R(4,9,2,1,'#c8282a');R(10,9,2,1,'#3a6fd0');R(7,9,2,1,'#55e070')});
IC2.agg=pc16(({Gd,P})=>{Gd(SW.sword,{...SPAL,w:'#ffe0e0',i:'#ff7a6a',d:'#c03a2a'},0,0)},false);
 IC2.def=IC2.shield;
 IC2.hold=pc16(({Gd})=>Gd(["...h..h.....","h..h..h.....","h..h..h..h..","h..h..h..h..","hh.hh.hh.h..","hhhhhhhhhh.h","hhhhhhhhhhhh","hhhhhhhhhhh.","hhhhhhhhhhh.",".hhhhhhhhhh.",".hhhhhhhhh..","..hhhhhhhh..","..hhhhhhh...","...dddddd..."],{h:'#e8b88a',d:'#a8744a'},2,1));
 IC2.stop=pc16(({C,R})=>{C(8,8,(r,a,dx,dy)=>Math.abs(dx)<6.4&&Math.abs(dy)<6.4&&Math.abs(dx)+Math.abs(dy)<9?(Math.abs(dx)+Math.abs(dy)>7.6||Math.abs(dx)>5.6||Math.abs(dy)>5.6?'#8a1010':'#e02a2a'):null);R(4,7,8,2,'#ffffff')});
 IC2.work=IC2.tools;
 IC2.bed=pc16(({R})=>{R(1,7,4,3,'#f4f4f4');R(1,7,4,1,'#ffffff');R(5,6,10,4,'#c8282a');R(5,6,10,1,'#e04848');R(5,9,10,1,'#9a1a1a');R(1,10,14,2,'#a98450');R(1,10,14,1,'#c8a060');R(1,12,2,2,'#6b4a2a');R(13,12,2,2,'#6b4a2a')});
 /* ---------- blocks (isometric) ---------- */
 IC2.wood=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#6b5030');for(const[x,w]of[[.18,.07],[.47,.05],[.78,.08]]){bxc(G,x,.06,1.0,w,.88,.006,'#4f3a22');bxc(G,1.0,.06,x,.006,.88,w,'#4f3a22')}bxc(G,.5,1.0,.5,.98,.006,.98,'#b8945f');bxc(G,.5,1.004,.5,.7,.006,.7,'#9a7a48');bxc(G,.5,1.008,.5,.42,.006,.42,'#b8945f');bxc(G,.5,1.012,.5,.14,.006,.14,'#9a7a48')}));
 const cob=(G,base,sd)=>{const R=rngf(sd||91);bxc(G,.5,0,.5,1,1,1,base||'#7f7f7f');for(let k=0;k<21;k++){const a=.12+R()*.76,b=.12+R()*.76,w=.12+R()*.18,h=.1+R()*.14,c=R()<.5?'#9c9c9c':'#5c5c5c',f=k%3;if(f===0)bxc(G,a,b-h/2,1.0,w,h,.006,c);else if(f===1)bxc(G,1.0,b-h/2,a,.006,h,w,c);else bxc(G,a,1.0,b,w,.006,h,c)}};
 IC2.stone=miShot(miBlock(G=>cob(G)));
 IC2.upgrade=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#8f8f8f');const m='#5e5e5e';for(const f of[0,1]){const F=(a,y,w,h)=>f?bxc(G,1.0,y,a,.006,h,w,m):bxc(G,a,y,1.0,w,h,.006,m);F(.5,.48,1,.04);F(.5,.96,1,.04);F(.5,.5,.04,.48);F(.25,0,.04,.48);F(.75,0,.04,.48)}bxc(G,.5,1.0,.5,1,.006,.04,m);bxc(G,.5,1.0,.5,.04,.006,1,m);bxc(G,.25,1.0,.25,.3,.008,.3,'#a0a0a0')}));IC2.hammer=IC2.upgrade;
 IC2.raise=miOverlay(miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#866043');bxc(G,.5,1.0,.5,1,.006,1,'#5aa036');bxc(G,.5,.8,.5,1.006,.2,1.006,'#5aa036');for(const x of[.15,.42,.7,.9]){bxc(G,x,.7,1.003,.08,.12,.006,'#5aa036');bxc(G,1.003,.7,x,.006,.1,.08,'#5aa036')}})),
  ["..K..",".KgK.","KgggK","KKgKK",".KgK.",".KKK."],{K:'#102010',g:'#55ff55'},14,0);
 IC2.path=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.94,1,'#866043');bxc(G,.5,.94,.5,1,.006,1,'#9b7a46');const R=rngf(7);for(let k=0;k<12;k++)bxc(G,.08+R()*.84,.946,.08+R()*.84,.08,.006,.08,R()<.5?'#b0905a':'#7a5a34')}));
 IC2.ramp=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.5,1,'#7f7f7f');bxc(G,.5,.5,.25,1,.5,.5,'#8a8a8a')}));
 IC2.demolish=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#c8282a');for(const x of[.2,.6])bxc(G,x,.08,1.0,.04,.84,.006,'#a01818');bxc(G,.5,.33,1.0,1.002,.34,.008,'#f0f0f0');bxc(G,1.0,.33,.5,.008,.34,1.002,'#f0f0f0');for(const x of[.22,.5,.78]){bxc(G,x,.39,1.004,.16,.22,.008,'#2a2a2a');bxc(G,1.004,.39,x,.008,.22,.16,'#2a2a2a')}bxc(G,.5,1.0,.5,1,.006,1,'#d6d6d6');bxc(G,.5,1.004,.5,.34,.006,.34,'#5a5a5a');bxc(G,.5,1.0,.5,.06,.12,.06,'#3a3a3a')}));
 IC2.movec=miShot(miBlock(G=>{cob(G,'#7a7a7a',33);bxc(G,.5,.72,.5,1.004,.28,1.004,'#b8945f');bxc(G,.5,1.0,.5,1,.008,1,'#c8a46a');bxc(G,.5,1.006,.5,.36,.008,.36,'#9a9aa2');for(const x of[.25,.5,.75]){bxc(G,x,.72,1.004,.02,.28,.008,'#8a6a3a');bxc(G,1.004,.72,x,.008,.28,.02,'#8a6a3a')}}));
 /* ---------- heads ---------- */
 IC2.peasant=miHead('peasant',0);IC2.knight=miHead('knight',0);IC2.archer=miHead('archer',0);IC2.captain=miHead('captain',0);IC2.bannerman=miHead('bannerman',0);IC2.king=miHead('king',0);IC2.guard=miHead('guard',0);
 IC2.skull=miHead('zombie',1);IC2.brute=miHead('brute',1);IC2.runner=miHead('runner',1);
 IC2.idle=miOverlay(miHead('peasant',0),["KKKKK","KzzzK","KKzKK","KzKKK","KzzzK","KKKKK"],{K:'#101018',z:'#ffffff'},14,0);
 /* ---------- buildings: renders of the medieval models ---------- */
 const tr=RS.done?1:0,SZI={tower:2,castle:5},st=(t,m,tier,ex)=>{const s={type:t,t:0,tier:tier==null?1:tier,sz:SZI[t]||1,gl:t==='gate'?3:0,tiles:[]},w=new THREE.Group();w.add(new THREE.Mesh(sGeo(s,m||0),matV));if(ex)ex(w);return w};
 const yaw=.62,pit=.36,B=(o,p,n)=>miShotB(o,yaw,p==null?pit:p,n);
 IC2.wall=B(st('wall',10,tr),.3,22);IC2.tower=B(st('tower',0,tr),.3,26);
 IC2.gate=B(st('gate',0,tr,w=>{const d=new THREE.Mesh(tr?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)}),.3,24);
 IC2.barracks=B(st('barracks',0,tr));IC2.farm=B(st('farm',0,1),.62);IC2.house=B(st('house',0,0));IC2.storage=B(st('storage',0,0));IC2.academy=B(st('academy',0,0));IC2.market=B(st('market',0,0));IC2.forester=B(st('forester',0,0));IC2.guild=B(st('guild',0,0));IC2.torch=B(st('torch',0,1),.3,22);
 IC2.home=B(st('castle',0,tr),.42);IC2.castle=IC2.home;IC2.keep=B(st('keep',0,tr));
 IC2.ballista=B(st('ballista',0,1,w=>{const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);h.rotation.y=.5;w.add(h)}),.45,24);
 IC2.trebuchet=B(st('trebuchet',0,1,w=>{const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.y=.4;w.add(a)}),.4,24);
 const door=t=>w=>{const d=new THREE.Mesh(t?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)};
 for(const t of[0,1]){ICT[t].wall=B(st('wall',10,t),.3,22);ICT[t].tower=B(st('tower',0,t),.3,26);ICT[t].gate=B(st('gate',0,t,door(t)),.3,24);ICT[t].barracks=B(st('barracks',0,t))}
 ICT[0].path=IC2.path;ICT[1].path=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.9,1,'#7a7468');const R=rngf(11);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const c=['#a9abb3','#8e9098','#b8bac2','#9a9ca4'][(i+j*2)%4];bxc(G,.18+i*.32,.9,.18+j*.32,.28,.06+R()*.03,.28,c)}}));
 for(const k in IC2){if(IC2[k].__px&&IC[k]&&(IC[k].__vec||IC[k].__hd))continue;IC[k]=IC2[k]}}
/* a research only changes a few icons: redraw just those (tier: the stone-able buildings, units: the soldier heads) */
function icoPart(kind,i){if(!ICR)icoInit();i=i|0;const set=(k,v)=>{if(v)IC[k]=v};let J;
 if(kind==='tier'){const tr=RS.done?1:0,SZI={tower:2,castle:5},st=(t,m,tier,ex)=>{const s={type:t,t:0,tier,sz:SZI[t]||1,gl:t==='gate'?3:0,tiles:[]},w=new THREE.Group();w.add(new THREE.Mesh(sGeo(s,m||0),matV));if(ex)ex(w);return w},B=(o,p,n)=>miShotB(o,.62,p==null?.36:p,n);
  J=[()=>set('wall',B(st('wall',10,tr),.3,22)),()=>set('tower',B(st('tower',0,tr),.3,26)),()=>set('gate',B(st('gate',0,tr,w=>{const d=new THREE.Mesh(tr?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)}),.3,24)),
   ()=>set('barracks',B(st('barracks',0,tr))),()=>{set('home',B(st('castle',0,tr),.42));IC.castle=IC.home},()=>set('keep',B(st('keep',0,tr)))]}
 else J=['knight','archer','captain','bannerman','king','guard'].map(k=>()=>set(k,miHead(k,0)));
 /* one icon per task so the redraw never holds a frame for long */
 if(i<J.length){J[i]();if(i+1<J.length)setTimeout(()=>{try{icoPart(kind,i+1)}catch(e){}},20)}}
/* every later 3D-icon refresh (research done, new kingdom colour) re-applies the Minecraft set */
{const _i3=icons3D;icons3D=function(){try{_i3()}catch(e){}try{mcIcons()}catch(e){console.error('mcIcons',e)}}}
try{mcIcons()}catch(e){console.error('mcIcons',e)}
/* three.js draws every object's UUID from Math.random: whatever builds meshes must use the real random, never the shared co-op stream
   (otherwise a cached geometry on one machine and a fresh one on the other would split the two simulations) */
{const viz=f=>function(){const m=Math.random;Math.random=REALR;try{return f.apply(this,arguments)}finally{Math.random=m}};
 addStruct=viz(addStruct);buildStructMesh=viz(buildStructMesh);if(typeof mcCorpse==='function')mcCorpse=viz(mcCorpse);build3D=viz(build3D);icons3D=viz(icons3D);icoPart=viz(icoPart);if(typeof addStairs==='function')addStairs=viz(addStairs)}

/* ================= SAVE / LOAD =================
   The whole simulation state is written as an object graph (shared references kept), the big world arrays gzipped.
   Desktop app: one file per save in the app-data folder (window.NARX); browser: IndexedDB. */
const SAVA={SEED:[()=>SEED,v=>{SEED=v}],GPR:[()=>GPR,v=>{GPR=v}],CX:[()=>CX,v=>{CX=v}],CY:[()=>CY,v=>{CY=v}],SITE2:[()=>SITE2,v=>{SITE2=v}],HT:[()=>HT,null],ter:[()=>ter,null],amt:[()=>amt,null],pth:[()=>pth,null],FLG:[()=>FLG,null],TFL:[()=>TFL,null],genF:[()=>genF,null],stairs:[()=>stairs,null],ROUTES:[()=>ROUTES,v=>{ROUTES=v}],RCH:[()=>RCH,v=>{RCH=v}],GORD:[()=>GORD,v=>{GORD=v}],GI:[()=>GI,v=>{GI=v}],genN:[()=>genN,v=>{genN=v}],SEALD:[()=>SEALD,null],CAMPS:[()=>CAMPS,null],UID:[()=>UID,v=>{UID=v}],SID:[()=>SID,v=>{SID=v}],occ:[()=>occ,null],units:[()=>units,v=>{units=v}],structs:[()=>structs,v=>{structs=v}],fx:[()=>fx,v=>{fx=v}],pt:[()=>pt,v=>{pt=v}],queue:[()=>queue,v=>{queue=v}],over:[()=>over,v=>{over=v}],time:[()=>time,v=>{time=v}],waveT:[()=>waveT,v=>{waveT=v}],waveI:[()=>waveI,v=>{waveI=v}],waveN:[()=>waveN,v=>{waveN=v}],nextL:[()=>nextL,v=>{nextL=v}],CS:[()=>CS,v=>{CS=v}],CS2:[()=>CS2,v=>{CS2=v}],kills:[()=>kills,v=>{kills=v}],RESP:[()=>RESP,v=>{RESP=v}],SAPL:[()=>SAPL,null],PRES:[()=>PRES,null],saplT:[()=>saplT,v=>{saplT=v}],SW:[()=>SW,null],SWH:[()=>SWH,null],SWN:[()=>SWN,null],SWD:[()=>SWD,null],SWARMS:[()=>SWARMS,v=>{SWARMS=v}],hordeT:[()=>hordeT,v=>{hordeT=v}],hordeOn:[()=>hordeOn,v=>{hordeOn=v}],waveOn:[()=>waveOn,v=>{waveOn=v}],hordeD:[()=>hordeD,v=>{hordeD=v}],burnAt:[()=>burnAt,v=>{burnAt=v}],nightLv:[()=>nightLv,v=>{nightLv=v}],nightCk:[()=>nightCk,v=>{nightCk=v}],waveST:[()=>waveST,v=>{waveST=v}],LITL:[()=>LITL,v=>{LITL=v}],darkT:[()=>darkT,v=>{darkT=v}],campT:[()=>campT,v=>{campT=v}],SIMTK:[()=>SIMTK,v=>{SIMTK=v}],shelOn:[()=>shelOn,v=>{shelOn=v}],shelRel:[()=>shelRel,v=>{shelRel=v}],mergeT:[()=>mergeT,v=>{mergeT=v}],ACH:[()=>ACH,null],WAVEZ:[()=>WAVEZ,v=>{WAVEZ=v}],HORDES:[()=>HORDES,null],BASES:[()=>BASES,null],hdT:[()=>hdT,v=>{hdT=v}],spawnHT:[()=>spawnHT,v=>{spawnHT=v}],baseId:[()=>baseId,v=>{baseId=v}],RS:[()=>RS,null],RS2:[()=>RS2,null],ROLE:[()=>ROLE,null],RHAS:[()=>RHAS,null],roleT:[()=>roleT,v=>{roleT=v}],RALLY:[()=>RALLY,null],RALLYC:[()=>RALLYC,null],PRICE:[()=>PRICE,null],priceT:[()=>priceT,v=>{priceT=v}],CLM:[()=>CLM,null],BAD:[()=>BAD,null],tfo:[()=>tfo,null],LVO:[()=>LVO,null],SCRT:[()=>SCRT,null],C:[()=>C,null],BTIER:[()=>BTIER,v=>{BTIER=v}],RL:[()=>RL,null],FGS:[()=>FGS,v=>{FGS=v}],FORCEF:[()=>FORCEF,v=>{FORCEF=v}],PUD:[()=>PUD,null],alertT:[()=>alertT,v=>{alertT=v}],farmT:[()=>farmT,v=>{farmT=v}],fowSeen:[()=>fowSeen,null],fowVis:[()=>fowVis,null],fowTex:[()=>fowTex,null],fowRA:[()=>fowRA,null],fowLo:[()=>fowLo,null],fowHi:[()=>fowHi,null],diffI:[()=>diffI,v=>{diffI=v}]};
const SVVER=1,SVSKIP=new Set(['zf','zft','_tc','pfS']);
const svX=v=>!!v&&typeof v==='object'&&typeof THREE!=='undefined'&&(v instanceof THREE.Object3D||v.isMaterial||v.isBufferGeometry||v.isTexture||v.isBufferAttribute);
const b64e=u8=>{let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s)};
const b64d=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function gzU8(u8,de){const cs=de?new DecompressionStream('gzip'):new CompressionStream('gzip');const st=new Blob([u8]).stream().pipeThrough(cs);return new Uint8Array(await new Response(st).arrayBuffer())}
const TACT={Uint8Array,Int8Array,Uint16Array,Int16Array,Uint32Array,Int32Array,Float32Array,Float64Array,Uint8ClampedArray};
async function svEncode(){const ids=new Map(),objs=[],Q=[],big=[];
 const ref=v=>{if(v===null)return null;const t=typeof v;if(t==='number')return Number.isFinite(v)?v:{$n:String(v)};if(t==='string'||t==='boolean')return v;if(t!=='object')return {$u:1};
  if(svX(v)||(typeof Node!=='undefined'&&v instanceof Node)||v instanceof CanvasRenderingContext2D)return {$u:1};
  let id=ids.get(v);if(id===undefined){id=objs.length;ids.set(v,id);objs.push(null);Q.push(v)}return {$r:id}};
 const R={};for(const k in SAVA)R[k]=ref(SAVA[k][0]());
 for(let q=0;q<Q.length;q++){const v=Q[q],id=ids.get(v);let o;
  if(ArrayBuffer.isView(v)){const u8=new Uint8Array(v.buffer,v.byteOffset,v.byteLength);o={$t:v.constructor.name,n:v.length};if(v.byteLength>8192)big.push([o,u8.slice()]);else o.d=b64e(u8)}
  else if(Array.isArray(v))o={$a:v.map(ref)};
  else if(v instanceof Map)o={$m:[...v].map(([a,b])=>[ref(a),ref(b)])};
  else if(v instanceof Set)o={$s:[...v].map(ref)};
  else if(typeof v.mk==='function'&&'tx' in v&&'sx' in v)o={$g:[v.tx,v.ty,v.sx,v.sy,v.big|0,v.q|0]};
  else if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null){o={$x:1};(window.__svw||(window.__svw=[])).push('class:'+(v.constructor&&v.constructor.name))}
  else{const p={};for(const k in v){if(SVSKIP.has(k))continue;const x=v[k];if(typeof x==='function'){(window.__svw||(window.__svw=[])).push('fn:'+k);continue}if(svX(x))continue;p[k]=ref(x)}o={$o:p}}
  objs[id]=o}
 for(const[o,u8]of big)o.z=b64e(await gzU8(u8));
 return {v:SVVER,gv:GVER,R,objs}}
async function svDecode(S){const O=S.objs,live=new Array(O.length);
 for(let i=0;i<O.length;i++){const o=O[i];if(o.$t){const T0=TACT[o.$t];const u8=o.z?await gzU8(b64d(o.z),true):b64d(o.d||'');live[i]=new T0(u8.buffer,0,o.n)}
  else if(o.$a)live[i]=[];else if(o.$m)live[i]=new Map();else if(o.$s)live[i]=new Set();else if(o.$g){const a=o.$g,G=mkG(a[0],a[1],a[2],a[3],!!a[5]);G.big=a[4];live[i]=G}else if(o.$x)live[i]=undefined;else live[i]={}}
 const val=x=>x===null||typeof x!=='object'?x:x.$r!==undefined?live[x.$r]:x.$n!==undefined?Number(x.$n):undefined;
 for(let i=0;i<O.length;i++){const o=O[i],L=live[i];if(o.$a){for(const x of o.$a)L.push(val(x))}else if(o.$m){for(const[a,b]of o.$m)L.set(val(a),val(b))}else if(o.$s){for(const x of o.$s)L.add(val(x))}
  else if(o.$o){for(const k in o.$o){const x=o.$o[k];if(x&&x.$u)continue;L[k]=val(x)}}}
 const out={};for(const k in S.R)out[k]=val(S.R[k]);return out}
/* const bindings are refilled in place, let bindings reassigned */
function svAssign(k,v){const A=SAVA[k];if(!A)return;if(A[1]){A[1](v);return}const c=A[0]();
 if(ArrayBuffer.isView(c)){if(v&&v.length===c.length)c.set(v)}else if(c instanceof Map){c.clear();if(v)for(const[a,b]of v)c.set(a,b)}else if(c instanceof Set){c.clear();if(v)for(const x of v)c.add(x)}
 else if(Array.isArray(c)){c.length=0;if(v)for(const x of v)c.push(x)}else if(c&&typeof c==='object'){for(const kk of Object.keys(c))delete c[kk];Object.assign(c,v||{})}}
async function svPack(){const S=await svEncode();S.meta={wave:waveN,kills,time:Math.round(time),date:Date.now(),king:'Naraige'};return JSON.stringify(S)}
async function svApply(txt){const S=JSON.parse(txt);if(!S||S.v!==SVVER)throw new Error('Unknown save format');
 paused=true;MP.on=false;picking=false;setupOpen=false;settingsOpen=false;saveOpen=false;mode=null;selB=null;
 SEED=S.R.SEED;GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));CX=S.R.CX;CY=S.R.CY;
 const D=await svDecode(S);
 SITE2=null;for(const s of structs||[])rmStruct(s);initWorld();for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
 for(const u of units){u.m=null;u._tc=null}for(const s of structs)s.o3=null;
 GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(0);calcFD();fdDirty=true;ver++;rebuildOwn(true);
 fowTm=-9;fowT.needsUpdate=true;inGame=true;started=true;paused=false;showMap=false;camSave=null;
 build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}
 msgS='Game loaded - wave '+waveN;msgT=3}
/* redraw the minimap for every chunk already generated */
function svMini(){mg.fillStyle='#10151f';mg.fillRect(0,0,TW,TH);for(let cy=0;cy<NCY;cy++)for(let cx=0;cx<NCX;cx++){if(!genF[cy*NCX+cx])continue;const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),im=mg.createImageData(x1-x0,y1-y0);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=mmRGB(y*TW+x),k=((y-y0)*(x1-x0)+x-x0)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255}mg.putImageData(im,x0,y0)}}
/* storage: desktop files, else IndexedDB */
const SVDB={db:null,open(){return this.db||(this.db=new Promise((ok,ko)=>{const r=indexedDB.open('naranxia_saves',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}))},
 async tx(mode,fn){const d=await this.open();return new Promise((ok,ko)=>{const t=d.transaction('s',mode),st=t.objectStore('s'),q=fn(st);t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>ko(t.error)})}};
const SVST={async list(){if(window.NARX)return NARX.list();const keys=await SVDB.tx('readonly',s=>s.getAllKeys())||[];const out=[];for(const k of keys){const m=await SVDB.tx('readonly',s=>s.get('meta:'+k));if(!String(k).startsWith('meta:'))out.push({name:k,t:m&&m.date||0})}return out.filter(o=>o.name).sort((a,b)=>b.t-a.t)},
 async put(n,d,meta){if(window.NARX)return NARX.save(n,d);await SVDB.tx('readwrite',s=>s.put(d,n));await SVDB.tx('readwrite',s=>s.put(meta||{},'meta:'+n))},
 async get(n){if(window.NARX)return NARX.load(n);return SVDB.tx('readonly',s=>s.get(n))},
 async del(n){if(window.NARX)return NARX.del(n);await SVDB.tx('readwrite',s=>s.delete(n));await SVDB.tx('readwrite',s=>s.delete('meta:'+n))}};
let saveOpen=false,svList=null,svBusy='',svSel=-1;
const svName=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return 'Wave '+waveN+' - '+d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+'h'+p(d.getMinutes())};
async function svRefresh(){try{svList=await SVST.list()}catch(e){svList=[];svBusy='Saves are not available here'}}
async function saveGame(name,quiet){if(MP.on||!inGame||over){if(!quiet){msgS=MP.on?'Saving is for solo games':'Nothing to save';msgT=3}return}
 svBusy='Saving...';try{const d=await svPack();await SVST.put(name||svName(),d,{date:Date.now(),wave:waveN});svBusy='';if(!quiet){msgS='Game saved';msgT=3;snd('build')}await svRefresh()}catch(e){svBusy='';msgS='Save failed: '+e.message;msgT=4;console.error(e)}}
async function loadGame(name){svBusy='Loading...';try{const d=await SVST.get(name);if(!d)throw new Error('save not found');await svApply(d);svBusy=''}catch(e){svBusy='';msgS='Load failed: '+e.message;msgT=4;console.error(e)}}
function drawSaves(UW,UH,cx){const W=Math.min(UW-12,420),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=8,H=UH-16;frame(X,Y,W,H,PAN,6);TTL(inGame&&!MP.on?'Save / Load':'Load game',X+10,Y+7,1.35);
 if(!svList){svList=[];svRefresh()}let y=Y+30;
 if(inGame&&!MP.on&&!over){pill(X+10,y,W-20,20,svBusy||'Save the game now',GRN,GRNH,()=>{if(!svBusy)saveGame()},null,1);y+=28}
 if(svBusy&&!(inGame&&!MP.on)){TC(svBusy,X+W/2,y,'#ffd25a',.9);y+=18}
 if(!svList.length)T_('No saved games yet',X+12,y+4,'#b59773',.85);
 const rows=Math.max(1,Math.floor((Y+H-58-y)/22));
 svList.slice(0,rows).forEach((s,i)=>{const yy=y+i*22;const d=new Date(s.t||0);T_(String(s.name).slice(0,34),X+12,yy+4,'#ead8ba',.82);
  pill(X+W-128,yy,62,18,'Load',BTN,BTNH,()=>{if(!svBusy)loadGame(s.name)},null,.8);pill(X+W-62,yy,52,18,'Delete',RDB,RDB,async()=>{await SVST.del(s.name);svRefresh()},null,.8)});
 if(window.NARX)pill(X+10,Y+H-24,120,16,'Open saves folder',BTN,BTNH,()=>NARX.openFolder(),null,.75);
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{saveOpen=false},null,.9)}

try{setTimeout(()=>{try{i18nDom()}catch(e){}},0)}catch(e){}
