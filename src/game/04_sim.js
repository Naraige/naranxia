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
function hitSw(u,e){const d=T[u.type],ar=u.type==='archer',fa=ar&&u.t===0&&RS2.done.fire;u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;
 fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,f:fa?1:0,h0:u.gar?u.gz+.42:undefined});
 const vr=u.t===0?Math.min(3,(u.xp||0)/4|0):0,dm=d.dmg*(u.buff||1)*(1+.12*vr)*(u.t===0&&RS2.done.iron?1.25:1)*(u.t===0&&RS2.done.steel?1.2:1)*(u.t===0&&ar&&RS2.done.fletch?1.25:1);
 let k;if(ar){const dx=e.x-u.x,dy=e.y-u.y,l=hyp(dx,dy)||1;k=swLine(u.x,u.y,e.x+dx/l*36,e.y+dy/l*36,9,fa?dm*1.35:dm,fa?4:3)}else k=swSplash(e.x,e.y,u.type==='king'?TS:u.type==='guard'?TS*.85:TS*.7,dm,u.type==='king'?7:u.type==='guard'?4:u.type==='captain'?5:u.type==='knight'?3:2);
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
 swUpdate(dt);waveTick();nightTick(dt);darkTick(dt);priceTick(dt);saplTick(dt);roleTick(dt);acidTick(dt);fireTick(dt);
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
function saveBest(){if(DEVU)return;try{if(waveN>best.w||(waveN===best.w&&kills>best.k)){best={w:waveN,k:kills};localStorage.setItem('dk_best',JSON.stringify(best))}}catch(e){}}

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
function ach(k){if(DEVU||ACH.has(k)||!ACHD[k])return;ACH.add(k);TOASTS.push({k,t:0});if(TOASTS.length>3)TOASTS.shift()}
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
