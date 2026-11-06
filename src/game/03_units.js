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
function hit(u,e){if(u.type==='cannon'){cannonFire(u,e);return}if(e.swarm){hitSw(u,e);return}if(u.t===0)LH.set(e,u.type);if(u.type!=='archer'&&!u.gar)puff(e.x,e.y,e.t===1?'#9fd084':'#ffd890',2,32,{T:.28,z:.5,vz:.9,g:-.6,s:.1});u.face=Math.atan2(e.x-u.x,e.y-u.y);u.atk=.25;const z=u.t===1,d=T[u.type],ar=u.type==='archer',fa=ar&&u.t===0&&RS2.done.fire;fx.push({x1:u.x,y1:u.y,x2:e.x,y2:e.y,t:ar?.2:.12,T:ar?.2:.12,a:ar,f:fa?1:0,h0:u.gar?u.gz+.42:undefined});if(fa&&e.t===1){e.burn=3;e.burnD=6+.2*waveN}
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
/* ---- co-op convoys: peasants carry resources to the partner's castle, then walk home and go back to work.
   Zombies can kill them on the way: what they carry is lost. Sent as a command, so both machines run the same errand. ---- */
function cvText(a){return[['g','gold'],['w','wood'],['s','stone'],['f','food']].filter(([k])=>a[k]>0).map(([k,n])=>a[k]+' '+L(n)).join(', ')}
function cvGo(u,c){u.o={x:c.x,y:c.y,g:mkG(c.tx+2,c.ty+2,u.x/TS,u.y/TS)}}
function sendConvoy0(c){const p=CURPL|0,q=1-p,from=p?CS2:CS,to=q?CS2:CS;if(!MP.on||!CS2||!from||!to||from.hp<=0||to.hp<=0)return;
 const R=RESP[p],a={g:Math.max(0,Math.min(Math.floor(R.g),c.g|0)),w:Math.max(0,Math.min(Math.floor(R.w),c.w|0)),s:Math.max(0,Math.min(Math.floor(R.s),c.s|0)),f:Math.max(0,Math.min(Math.floor(R.f||0),c.f|0))},tot=a.g+a.w+a.s+a.f;if(tot<=0)return;
 const P=units.filter(u=>u.t===0&&u.hp>0&&(u.pl|0)===p&&u.type==='peasant'&&!u.gar&&!u.shel&&!u.cv);
 P.sort((x,y)=>((x.job||x.o||x.carry)?1:0)-((y.job||y.o||y.carry)?1:0)||dist(x.x,x.y,from.x,from.y)-dist(y.x,y.y,from.x,from.y)||x.uid-y.uid);
 const n=Math.min(P.length,Math.max(1,Math.min(5,Math.ceil(tot/100))));if(!n){if(p===LPL()){msgS='No peasant free to carry the convoy';msgT=3;snd('err')}return}
 R.g-=a.g;R.w-=a.w;R.s-=a.s;R.f=(R.f||0)-a.f;
 for(let i=0;i<n;i++){const u=P[i],sh=k=>Math.floor(a[k]/n)+(i<a[k]%n?1:0);u.cv={to:q,from:p,g:sh('g'),w:sh('w'),s:sh('s'),f:sh('f'),back:false,t:0,rt:0};
  u.job=null;u.role=null;u.tl=-1;u.work=0;u.carry=true;u.cj=a.g>=a.w&&a.g>=a.s?'g':a.w>=a.s?'w':'s';leaveSquad(u);cvGo(u,to)}
 if(p===LPL()){msgS='Convoy sent: '+cvText(a)+' ('+n+' porter'+(n>1?'s':'')+')';msgT=4}else MP.note=(MP.pname||'Your partner')+' sends you a convoy: '+cvText(a)}
function convoyStep(u,dt){const c=u.cv,dest=c.back?(c.from?CS2:CS):(c.to?CS2:CS);c.t+=dt;
 if(!dest||dest.hp<=0||!structs.includes(dest)){u.cv=null;u.o=null;u.carry=false;return}
 if(dist(u.x,u.y,dest.x,dest.y)<TS*4.6){
  if(!c.back){const Rr=RESP[c.to];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;
   if(c.to===LPL()){msgS='Convoy delivered: +'+cvText(c);msgT=4}else if(c.from===LPL()){msgS='Your convoy reached your partner';msgT=3}
   puff(u.x,u.y,'#ffd23c',6,40);c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;u.carry=false;cvGo(u,c.from?CS2:CS)}
  else{u.cv=null;u.o=null;u.carry=false}
  return}
 /* no way through for two minutes: the goods go back to the sender */
 if(!c.back&&c.t>120){const Rr=RESP[c.from];Rr.g+=c.g;Rr.w+=c.w;Rr.s+=c.s;Rr.f=(Rr.f||0)+c.f;c.g=c.w=c.s=c.f=0;c.back=true;c.t=0;u.carry=false;if(c.from===LPL()){msgS='The convoy cannot reach your partner: goods returned';msgT=4}cvGo(u,c.from?CS2:CS);return}
 if(!u.o){if(time<c.rt)return;c.rt=time+2;cvGo(u,dest)}
 walk(u,dt)}
const shelC=u=>{const own=(u.pl|0)===1&&CS2?CS2:CS;return own&&own.hp>0&&structs.includes(own)?own:aliveC().length?nearC(u.x,u.y):null};
function shelGo(u,dt){if(u.cv){peasant(u,dt);return}let c=shelC(u);if(!c){peasant(u,dt);return}u.work=0;if(u.o&&!u.nso)u.o=null;
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
   else if(cur.length<W){const C2=units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&(u.pl|0)===p&&!u.role&&!u.shel&&!u.gar&&!u.cv&&u.job!=='f'&&u.job!=='p');
    C2.sort((a,b)=>((!!a.job)-(!!b.job))||(((a.x-G.x)**2+(a.y-G.y)**2)-((b.x-G.x)**2+(b.y-G.y)**2))||(a.uid-b.uid));for(const u of C2.slice(0,W-cur.length)){roleOn(u,r);cur.push(u)}}
   RHAS[p][r]=cur.length}}}
function guildWait(u,dt){u.gwT=time;u.work=0;const G=guildOf(u.pl|0,u.x,u.y);if(!G)return;if(dist(u.x,u.y,G.x,G.y)>TS*2.4)stepF(u,gField('s'+G.ty*TW+G.tx,G.tx,G.ty,G.sz),G.x,G.y,dt)}
function roleAdj0(r,d){if(!(r in ROLE[0]))return;const R0=ROLE[CURPL|0],n=Math.max(0,Math.min(30,R0[r]+d));R0[r]=n;const me=CURPL===LPL();
 if(me){if(!guildOf(CURPL|0,CS.x,CS.y)){msgS='Build a guild first';msgT=3;snd('err');return}msgS=n+' '+ROLEN[r]+(n===1?'':'s')+' wanted';msgT=2.5;snd('click')}}
function peasant(u,dt){if(u.cv){convoyStep(u,dt);return}const px=u.x,py=u.y,hadO=!!u.o;peasant0(u,dt);
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
/* zombies hit by fire arrows burn for 3 s (burnD damage per second) */
function fireTick(dt){for(const e of units)if(e.burn>0){e.burn-=dt;if(e.hp>0){e.hp-=e.burnD*dt;e.hurt=.12;if(REALR()<dt*6)puff(e.x,e.y,REALR()<.5?'#ff8a2a':'#ffd040',1,18,{T:.45,z:.6,vz:1.8,g:-.6,s:.07})}if(e.burn<=0)e.burnD=0}}
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
function zomb(u,d,dt){if(u.boss)bossAI(u,dt);if(u.home){const hm=u.home,far=dist(u.x,u.y,hm.x,hm.y);let[b,bd]=target(u,far>TS*22?0:260,0);if(b&&b===u.ign&&time<u.ignT)b=null;
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
 bossSpawn(L0);if(mc){const g=40+waveN*10,w=30+waveN*6,st=20+waveN*5;for(const R of RESP){R.g+=g;R.w+=w;R.s+=st}const cm='A merchant caravan passes: +'+g+' gold, +'+w+' wood, +'+st+' stone';if(ZNEW[waveN]){msgS+='  --  '+cm;msgT=12}else{msgS=cm;msgT=6}}WAVEZ=SW.n+swPending();for(const u of units)if(u.t===1&&u.lane>=0)WAVEZ++}
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
