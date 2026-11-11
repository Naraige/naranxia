import { wkOf, wkSet, WKT } from '../ai/workplaces.js';
import { snd } from '../audio/sound.js';
import { dist, hyp, rnd } from '../core/math.js';
import { exposed, hit, reach } from './combat.js';
import { constructionState } from './construction.js';
import { mkU } from './entities.js';
import { chase, losClear, moveTo, stepF, walk } from './movement.js';
import { LPL, playersState } from './players.js';
import { CLM } from './resources.js';
import { GCAP, T, TS, TW } from './rules.js';
import { sel } from './selection.js';
import { sessionState } from './session.js';
import { simulationState } from './simulation.js';
import { leaveSquad, royalPost, slotPos } from './squads.js';
import { targetZ } from './swarm.js';
import { MP } from '../multiplayer/session.js';
import { puff } from '../rendering/effects.js';
import { gtopOf } from '../rendering/models/fortifications.js';
import { NAMES } from '../ui/build-menu.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { reachLong, sameComp } from '../world/connectivity.js';
import { mkG } from '../world/pathfinding.js';
import { D4, gOK } from '../world/routes.js';
import { occ, ter } from '../world/terrain.js';
import { solid, solidAt } from '../world/traversal.js';

export const formationsState = {
  FGS: [],
  FORCEF: null,
};

/* bodyguard: strike whatever comes near the King, otherwise stand at your post beside him (march with him when he walks) */
export function royalEscort(u,d,dt){const K=u.cap,j=K.sq?K.sq.indexOf(u):-1;if(j<0)return false;
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

export function capField(C){const tx=Math.floor(C.x/TS),ty=Math.floor(C.y/TS);if(!C.cfg||Math.abs(C.cfg.tx-tx)+Math.abs(C.cfg.ty-ty)>6)C.cfg=mkG(tx,ty,tx,ty,1);return C.cfg}

export function garSlot(s,j){if(s.type==='keep'){const a=j/12*6.283;return{x:s.x+Math.cos(a)*26,y:s.y+Math.sin(a)*26}}if(s.type==='tower'){if(s.sz===2){const o=[[-22,-22],[22,-22],[-22,22],[22,22]][j%4];return{x:s.x+o[0],y:s.y+o[1]}}const o=[[-12,-9],[12,-9],[0,12]][j%3];return{x:s.x+o[0],y:s.y+o[1]}}if(s.type==='gate'){const d=j?1:-1,o=s.gl===3?40:30;return s.ax?{x:s.x,y:s.y+d*o}:{x:s.x+d*o,y:s.y}}return{x:s.x,y:s.y}}

export function ungar(u){const s=u.gar;if(!s)return;u.gar=null;if(s.garr)s.garr=s.garr.filter(a=>a!==u);const a=Math.random()*6.28;for(let k=0;k<8;k++){const x=s.x+Math.cos(a+k)*(s.rad+14),y=s.y+Math.sin(a+k)*(s.rad+14);if(!solidAt(x,y)){u.x=x;u.y=y;break}}u.o=null}

export function garTarget(s,u){for(let r=1;r<=5;r++){let b=null,bd=1e12;for(const[tx,ty]of s.tiles)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=tx+dx,y=ty+dy;if(!gOK(x,y)||solid(x,y))continue;const px=(x+.5)*TS,py=(y+.5)*TS,d=dist(px,py,u.x,u.y);if(d<bd){bd=d;b={x:px,y:py,r}}}if(b)return b}return{x:s.x,y:s.y,r:1}}

export function garrison(u,s){u.fg=null;u.fpos=null;if(u.gar===s)return true;s.garr=s.garr||[];if(s.garr.length>=GCAP[s.type])return false;ungar(u);leaveSquad(u);u.o=null;u.gar=s;s.garr.push(u);u.gz=(s.bh||0)+gtopOf(s);return true}

const FPRI={king:0,guard:1,knight:0,spearman:.5,captain:0,archer:1,bannerman:2,cannon:3,peasant:4,scout:1,engineer:4,envoy:4};

export function formSlots(U,w,fm){const n=U.length,f=[Math.sin(fm),Math.cos(fm)],p=[f[1],-f[0]],pos=[];const SP=26;
 const add=(row,col)=>pos.push({row,col,x:w.x-f[0]*row*SP+p[0]*col*SP,y:w.y-f[1]*row*SP+p[1]*col*SP});
 if(constructionState.formType===1){const per=Math.max(6,Math.ceil(n/2));for(let i=0;i<n;i++){const r=(i/per)|0,c=i%per,cnt=Math.min(per,n-r*per);add(r,c-(cnt-1)/2)}}
 else if(constructionState.formType===2){const cols=Math.max(3,Math.round(Math.sqrt(n*1.4)));for(let i=0;i<n;i++){const r=(i/cols)|0,c=i%cols,cnt=Math.min(cols,n-r*cols);add(r,c-(cnt-1)/2)}}
 else if(constructionState.formType===3){let r=0,k=0;while(k<n){const cnt=Math.min(n-k,r===0?1:2);for(let j=0;j<cnt;j++){add(r,cnt===1?0:(j?1:-1)*(Math.ceil(r/2)+.0))+(0);k++}r++}
  /* wedge: rows widen */pos.length=0;r=0;k=0;while(k<n){const wd=r+1,cnt=Math.min(n-k,wd);for(let j=0;j<cnt;j++){add(r,j-(cnt-1)/2);k++}r++}pos.forEach(q=>{q.x=w.x-f[0]*q.row*SP+p[0]*q.col*SP*1.15;q.y=w.y-f[1]*q.row*SP+p[1]*q.col*SP*1.15})}
 else{const R=Math.max(34,n*7.5);for(let i=0;i<n;i++){const a=fm+i/n*6.2832;pos.push({row:0,col:i,x:w.x+Math.sin(a)*R,y:w.y+Math.cos(a)*R})}}
 const lat=u=>(u.x*p[0]+u.y*p[1]),us=U.slice().sort((a,b)=>(FPRI[a.type]||0)-(FPRI[b.type]||0)||lat(a)-lat(b));
 const sp=constructionState.formType===4?pos:pos.slice().sort((a,b)=>a.row-b.row||a.col-b.col);const m=new Map();
 if(constructionState.formType===4){const ord=us.slice().sort((a,b)=>Math.atan2(a.x-w.x,a.y-w.y)-Math.atan2(b.x-w.x,b.y-w.y));ord.forEach((u,i)=>m.set(u,pos[i]))}
 else{let i=0;const rows=[];sp.forEach(q=>{(rows[q.row]=rows[q.row]||[]).push(q)});for(const R of rows){if(!R)continue;const take=us.slice(i,i+R.length);i+=R.length;take.sort((a,b)=>lat(a)-lat(b));const ci=take.findIndex(u=>u.type==='captain');if(ci>=0&&take.length>2){const c=take.splice(ci,1)[0];take.splice((take.length/2)|0,0,c)}R.forEach((q,j)=>{if(take[j])m.set(take[j],q)})}}
 /* support troops keep a gap behind the fighting line */
 for(const[u,q]of m)if(u.type==='bannerman'||u.type==='cannon'){const gp=u.type==='cannon'?22:14;q.x-=f[0]*gp;q.y-=f[1]*gp}
 return m}

function fgMake(FM,slots,w,g,fm){let cx=0,cy=0;FM.forEach(u=>{cx+=u.x;cy+=u.y});cx/=FM.length;cy/=FM.length;const A=mkU(0,'knight',cx,cy);
 const v=Math.min(...FM.map(u=>T[u.type].spd*(u.spj||1)))*.9;A.spj=v/T.knight.spd;const F={A,w:{x:w.x,y:w.y},g,fm,arr:false,mem:FM.slice(),t:0};
 FM.forEach(u=>{const s=slots.get(u);u.fg=F;u.fof={x:s.x-w.x,y:s.y-w.y};u.fpos=null;u.fwt=0});formationsState.FGS.push(F);return F}

export function fgTick(dt){if(!formationsState.FGS.length)return;formationsState.FGS=formationsState.FGS.filter(F=>{F.mem=F.mem.filter(u=>u.fg===F&&u.hp>0);if(!F.mem.length)return false;
 if(!F.arr){let lag=0;for(const u of F.mem){const d=dist(u.x,u.y,F.A.x+u.fof.x,F.A.y+u.fof.y);if(d>lag)lag=d}
  F.wt=lag<TS*1.8?0:(F.wt||0)+dt;const amv=F.wt===0||F.wt>4;if(amv){const g=F.g;if(g.ver!==sessionState.ver)g.mk();stepF(F.A,g.S,F.w.x,F.w.y,dt)}F.t+=dt;
  for(const u of F.mem){const d=dist(u.x,u.y,F.A.x+u.fof.x,F.A.y+u.fof.y);if(d>TS*8){u.flag=(u.flag||0)+dt;if(u.flag>12){u.fg=null;u.flag=0;u.o={x:F.w.x+u.fof.x,y:F.w.y+u.fof.y,g:F.g,f:1}}}else u.flag=0}
  {const dg=dist(F.A.x,F.A.y,F.w.x,F.w.y);if(F.bd===undefined||dg<F.bd-4){F.bd=dg;F.st=0}else if(amv)F.st=(F.st||0)+dt}
  if(dist(F.A.x,F.A.y,F.w.x,F.w.y)<12||F.t>300||F.st>5){if(F.st>5){F.w={x:F.A.x,y:F.A.y}}else{F.A.x=F.w.x;F.A.y=F.w.y}F.arr=true}}return true})}

export function fgUnit(u,dt){const F=u.fg;let X=F.A.x+u.fof.x,Y=F.A.y+u.fof.y;if(!F.arr&&solidAt(X,Y)){X=F.A.x;Y=F.A.y}const dd=dist(u.x,u.y,X,Y);
 if(F.arr){u.fwt+=dt;if(dd<8||u.fwt>5||solidAt(X,Y)){u.fg=null;u.o=null;u.fpos={x:dd<8?X:u.x,y:dd<8?Y:u.y,fm:F.fm};u.face=F.fm;u.gx=u.x;u.gy=u.y;return}}
 if(dd>3){u.flt=(u.flt||0)-dt;if(u.flt<=0){u.flt=.3;u.flos=losClear(u.x,u.y,X,Y)}if(u.flos||dd<TS*.8)moveTo(u,X,Y,dt);else{if(F.g.ver!==sessionState.ver)F.g.mk();stepF(u,F.g.S,X,Y,dt)}}else u.face=F.fm}

export let order = function order(w){const S0=sel();if(!S0.length)return;if(simulationState.shelOn)for(const u of S0)if(u.type==='peasant')u.nso=1;const tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS),ti=ty*TW+tx,inW=gOK(tx,ty);
 const P=S0.filter(u=>u.type==='peasant'),rj=inW?({2:'w',3:'s',4:'g'})[ter[ti]]:null,st=inW?occ.get(ti):null;let used=null;
 if(P.length&&rj){if(!(exposed(tx,ty)&&(reach(tx,ty)||reachLong(tx,ty)))){hudDisplayState.msgS='Peasants cannot reach it';hudDisplayState.msgT=3}
  else{let given=false;P.forEach(u=>{u.role=null;u.job=rj;u.lastT=ti;u.stk2=0;const ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS);let t=-1;if(!given&&D4.some(([dx,dy])=>!solid(tx+dx,ty+dy)&&sameComp(ux,uy,tx+dx,ty+dy))){t=ti;given=true;CLM.set(ti,u)}u.tl=t;u.o=null;leaveSquad(u)});used=P;puff((tx+.5)*TS,(ty+.5)*TS,rj==='g'?'#ffd23c':rj==='w'?'#8bd06a':'#cfd6e2',8,40)}}
 else if(P.length&&st&&st.t===0&&(st.pl|0)===(playersState.CURPL|0)&&st.prog>=1&&WKT.has(st.type)&&(!wkOf(st)||st.hp>=st.max)){const u=P.find(q=>q.wk===st)||P[0];wkSet(u,st);if(simulationState.shelOn)u.nso=1;used=P;if(playersState.CURPL===LPL()){hudDisplayState.msgS='A peasant now works the '+NAMES[st.type].toLowerCase();hudDisplayState.msgT=3}}
 else if(P.length&&st&&st.t===0&&(st.pl|0)===(playersState.CURPL|0)&&(st.hp<st.max||st.prog<1)){P.forEach(u=>{u.job='r';u.o=null;u.rb=st;u.rk=1;u.tl=-1});used=P;if(st.prog>=1&&playersState.CURPL===LPL()){hudDisplayState.msgS='Repairing the '+NAMES[st.type]+' (uses resources)';hudDisplayState.msgT=3}}
 const AR=S0.filter(u=>u.type==='archer'||(u.type==='cannon'&&st&&(st.type==='wall'||st.type==='tower'||st.type==='gate')));let gused=[];
 if(AR.length&&st&&st.t===0&&st.prog>=1&&GCAP[st.type]&&(st.pl|0)===(playersState.CURPL|0)){let room=GCAP[st.type]-(st.garr||[]).length-sessionState.units.filter(v=>v.goG===st&&!AR.includes(v)).length,n=0;
  for(const u of AR){if(u.gar===st){gused.push(u);continue}if(room<=0)break;room--;n++;gused.push(u);if(u.gar)ungar(u);leaveSquad(u);u.goG=st;u.goT=0;const tp=garTarget(st,u);u.goR=tp.r;u.o={x:tp.x,y:tp.y,g:mkG(Math.floor(tp.x/TS),Math.floor(tp.y/TS),u.x/TS,u.y/TS),f:1}}
  if(playersState.CURPL===LPL()){if(n){hudDisplayState.msgS=(AR.some(u=>u.type==='cannon')?'Crews':'Archers')+' walking to the '+NAMES[st.type];hudDisplayState.msgT=3;puff(st.x,st.y,'#9fe870',6,40)}else{hudDisplayState.msgS=NAMES[st.type]+' is full';hudDisplayState.msgT=3}}}
 const M=S0.filter(u=>!(used&&used.includes(u))&&!gused.includes(u)).filter(u=>{if(u.cap&&!u.cap.sel&&!u.rg){leaveSquad(u)}return !u.cap});if(!M.length)return;
 let sx=0,sy=0;for(const u of M){sx+=u.x;sy+=u.y}sx=sx/M.length/TS;sy=sy/M.length/TS;const g=mkG(tx,ty,sx,sy);
 const KG=M.find(u=>u.type==='king'),FM=M.filter(u=>u.type!=='peasant'&&!u.gar&&!(KG&&u===KG&&M.length>1));let slots=null,wb=w;
 /* with the King: he leads at the point, his guard on his flanks, the army forms up behind them */
 if(KG&&M.length>1){let cx=0,cy=0;M.forEach(u=>{cx+=u.x;cy+=u.y});cx/=M.length;cy/=M.length;const fm=formationsState.FORCEF!=null?formationsState.FORCEF:hyp(w.x-cx,w.y-cy)>40?Math.atan2(w.x-cx,w.y-cy):(KG.fm||0);wb={x:w.x-Math.sin(fm)*TS*2.2,y:w.y-Math.cos(fm)*TS*2.2};if(solidAt(wb.x,wb.y))wb=w;KG.fmK=fm}
 for(const u of M){u.fg=null;u.fpos=null}
 if((constructionState.formType>0||(KG&&wb!==w))&&FM.length>=(KG&&wb!==w?1:formationsState.FORCEF!=null?2:3)){let cx=0,cy=0;FM.forEach(u=>{cx+=u.x;cy+=u.y});cx/=FM.length;cy/=FM.length;const dx=w.x-cx,dy=w.y-cy;if(KG&&wb!==w)constructionState.lastFm=KG.fmK;else if(formationsState.FORCEF!=null)constructionState.lastFm=formationsState.FORCEF;else if(hyp(dx,dy)>40)constructionState.lastFm=Math.atan2(dx,dy);const ft0=constructionState.formType;if(!constructionState.formType)constructionState.formType=1;try{slots=formSlots(FM,wb,constructionState.lastFm)}finally{constructionState.formType=ft0}}
 M.forEach(u=>{if(u.gar)ungar(u);u.goG=null;const sl=slots&&slots.get(u);const wc=KG&&u!==KG?wb:w;u.o=sl?{x:sl.x,y:sl.y,g,f:1}:u===KG?{x:w.x,y:w.y,g,f:1}:{x:wc.x+rnd(-25,25),y:wc.y+rnd(-25,25),g,f:1};if(u.type==='peasant'){u.job=null;u.tl=-1;u.rb=null;u.rk=0}});snd('order');
 if(slots)fgMake(FM.filter(u=>slots.has(u)),slots,wb,g,constructionState.lastFm);
 M.filter(u=>u.type==='captain'||u.type==='king').forEach(C=>formSquad(C,w,g));if(KG&&KG.fmK!==undefined){KG.fm=KG.fmK;delete KG.fmK}};

/* group behaviour: aggressive / defensive / halt, stop, peasants back to work */
export let setStance = function setStance(st){const S=sel();if(!S.length)return;let n=0;
 for(const u of S){if(u.t!==0)continue;if(u.type==='peasant'){if(simulationState.shelOn)u.nso=1;u.role=null;if(st==='stop'){u.job=null;u.tl=-1;u.o=null;u.carry=u.carry;u.work=0;u.idle=-25;n++}else if(st==='work'){u.o=null;u.job=null;u.tl=-1;u.idle=99;n++}continue}
  u.fg=null;if(st==='stop')u.fpos=null;if(st==='work')continue;if(st==='stop'){u.o=null;u.ret=false;u.gx=u.x;u.gy=u.y;n++;continue}
  u.stn=st;u.ret=false;u.gx=u.x;u.gy=u.y;if(st==='hold'){u.o=null;if(u.cap)leaveSquad(u)}n++}
 if(n&&(!MP.on||playersState.CURPL===LPL())){hudDisplayState.msgS={agg:'Aggressive: chase every enemy in sight',def:'Defensive: guard this spot',hold:'Halt: hold position',stop:'Stopped',work:'Back to work'}[st]+' ('+n+')';hudDisplayState.msgT=2.5;snd('order')}};

export function setOrderHandler(handler) {
  order = handler;
}

export function setSetStanceHandler(handler) {
  setStance = handler;
}
