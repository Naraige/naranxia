import { dist, hyp } from '../core/math.js';
import { H, T, TH, TS, TW, W } from './rules.js';
import { sessionState } from './session.js';
import { dust, SLOWK } from '../rendering/effects.js';
import { mkG } from '../world/pathfinding.js';
import { D8, gOK } from '../world/routes.js';
import { HT, occ, pth, terrainState } from '../world/terrain.js';
import { blk, fv, solid, solidAt } from '../world/traversal.js';

export function moveTo(u,x,y,dt){let dx=x-u.x,dy=y-u.y;const d=hyp(dx,dy);if(d<1)return;u.mv=true;u.walk=.25;if(Math.random()<.02)dust(u.x,u.y);u.face=Math.atan2(dx,dy);
 if(u.det>0){const c=Math.cos(u.dir*1.3),s=Math.sin(u.dir*1.3);[dx,dy]=[dx*c-dy*s,dx*s+dy*c];u.det-=dt}
 const tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS))),k=pth[ty*TW+tx]===2?2.2:pth[ty*TW+tx]?1.7:1;
 const st=Math.min(d,T[u.type].spd*(u.t===1?SLOWK:1)*k*(u.spdK||1)*(u.spj||1)*dt)/d;const ox=u.x,oy=u.y;u.x+=dx*st;u.y+=dy*st;if(u.t===0&&!u.gar&&!u.onF)pushOut(u,ox,oy)}

function pushOut(u,ox,oy){const gs=terrainState.gateSolid;terrainState.gateSolid=false;try{pushOut0(u,ox,oy)}finally{terrainState.gateSolid=gs}}

function pushOut0(u,ox,oy){const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(solid(tx,ty)){if(!solid(Math.floor(ox/TS),Math.floor(oy/TS))){u.x=ox;u.y=oy}return}const R=9;
 for(const[a,b]of D8){const nx=tx+a,ny=ty+b;if(!solid(nx,ny))continue;const cx=Math.max(nx*TS,Math.min(u.x,nx*TS+TS)),cy=Math.max(ny*TS,Math.min(u.y,ny*TS+TS)),dx=u.x-cx,dy=u.y-cy,d=hyp(dx,dy);if(d>=R||d<1e-3)continue;u.x+=dx/d*(R-d);u.y+=dy/d*(R-d)}
 if(solid(Math.floor(u.x/TS),Math.floor(u.y/TS))){u.x=ox;u.y=oy}}

export function losClear(x0,y0,x1,y1){const gs=terrainState.gateSolid;terrainState.gateSolid=false;try{const d=hyp(x1-x0,y1-y0),n=Math.ceil(d/12),gx=Math.floor(x1/TS),gy=Math.floor(y1/TS);let px=Math.floor(x0/TS),py=Math.floor(y0/TS);
 for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n,tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx===px&&ty===py)continue;if(tx===gx&&ty===gy)return true;if(solid(tx,ty))return false;
  if(tx!==px&&ty!==py){if(blk(px,py,tx,py)||blk(px,py,px,ty)||blk(px,py,tx,ty))return false}else if(blk(px,py,tx,ty))return false;px=tx;py=ty}return true}finally{terrainState.gateSolid=gs}}

export function stepF(u,S,fx_,fy_,dt){u.wlk=sessionState.time;if(u.t===0&&S&&u.type==='peasant'){const v=fv(S,Math.floor(u.x/TS),Math.floor(u.y/TS)),dg=dist(u.x,u.y,fx_,fy_),gk=Math.round(fx_)*65536+Math.round(fy_);
  if(gk!==u.pfG){u.pfG=gk;u.pfS=S;u.pfB=v;u.pfD=dg;u.pfT=sessionState.time}else{if(S!==u.pfS){u.pfS=S;u.pfB=v}else if(v<u.pfB){u.pfB=v;u.pfT=sessionState.time}if(dg<u.pfD-TS*.4){u.pfD=dg;u.pfT=sessionState.time}}}if(u.t===0&&S){const dd=dist(u.x,u.y,fx_,fy_);if(dd<TS*14&&dd>TS*1.6){u.lt=(u.lt||0)-dt;if(u.lt<=0){u.lt=.25;u.los=losClear(u.x,u.y,fx_,fy_)}if(u.los){moveTo(u,fx_,fy_,dt);return}}else u.los=false}
 const tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS)));
 if(S&&dist(u.x,u.y,fx_,fy_)>TS*1.6){let bd=fv(S,tx,ty),bx=-1,by=0;
  if(bd<65535){const pp=u.type==='peasant',v0=bd,gs0=terrainState.gateSolid;terrainState.gateSolid=u.t===1;let pb=null;for(const[dx,dy]of D8){const a=tx+dx,b=ty+dy,v=fv(S,a,b);if(v>=v0)continue;if(dx&&dy?(HT[ty*TW+a]!==HT[ty*TW+tx]||HT[b*TW+tx]!==HT[ty*TW+tx]||blk(tx,ty,tx+dx,ty)||blk(tx,ty,tx,ty+dy)||blk(tx,ty,a,b)):blk(tx,ty,a,b))continue;if(v<bd){bd=v;bx=a;by=b}
    if(pp&&pth[b*TW+a]&&(!pb||v<pb[2]))pb=[a,b,v]}
   terrainState.gateSolid=gs0;if(pb&&pth[ty*TW+tx]&&pb[2]<=v0-1){bx=pb[0];by=pb[1]}else if(pb&&pb[2]<=bd+1){bx=pb[0];by=pb[1]}}
  if(bx>=0){moveTo(u,(bx+.5)*TS,(by+.5)*TS,dt);return}}
 moveTo(u,fx_,fy_,dt)}

export function walk(u,dt){const o=u.o,g=o.g;if(g.ver!==sessionState.ver)g.mk();
 if(g.alt&&o.ax!==g.alt.x+g.alt.y){o.ax=g.alt.x+g.alt.y;o.x=g.alt.x+((u.uid*37)%21-10);o.y=g.alt.y+((u.uid*53)%21-10);o.bd=undefined}
 stepF(u,g.S,o.x,o.y,dt);const dd=dist(u.x,u.y,o.x,o.y),pv=g.S?fv(g.S,Math.floor(u.x/TS),Math.floor(u.y/TS)):65535,pr=pv<65535?pv:1e5+dd;
 if(o.bd===undefined||dd<o.bd-6){o.bd=dd;o.st=0}else o.st=(o.st||0)+dt;
 if(o.bp===undefined||pr<o.bp-(pv<65535?.5:6)){o.bp=pr;o.sp=0}else o.sp=(o.sp||0)+dt;
 if(dd<16||(dd<60&&solidAt(o.x,o.y))||(dd<TS*2.6&&o.st>1.1)||(o.sp>6&&g.big)){u.o=null;u.gx=u.x;u.gy=u.y;return}
 if(o.sp>6){g.big=1;g.ver=-1;o.sp=0}}

/* chase an enemy: straight when the way is clear, along a small path field when a cliff or wall is in between */
export function chase(u,b,dt){u.ct=(u.ct||0)-dt;if(u.ct<=0||u.ctg!==b){u.ct=.4;u.ctg=b;u.clos=losClear(u.x,u.y,b.x,b.y)}
 if(u.clos){moveTo(u,b.x,b.y,dt);return}
 const tx=Math.floor(b.x/TS),ty=Math.floor(b.y/TS),k=ty*TW+tx;u.cgt=(u.cgt||0)-dt;if(!u.cg||(u.cgk!==k&&u.cgt<=0)){u.cg=mkG(tx,ty,u.x/TS,u.y/TS,1);u.cgk=k;u.cgt=1.2}
 const g=u.cg;if(g.ver!==sessionState.ver)g.mk();stepF(u,g.S,b.x,b.y,dt)}

export function collide(u){if(u.gar||u.onF)return;const r=T[u.type].r;terrainState.gateSolid=u.t===1;
 if(u.clb>0){u.clb-=1/30;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS),o=gOK(tx,ty)&&occ.get(ty*TW+tx);if(o&&(!o.gate||terrainState.gateSolid)&&u.lx!==undefined){u.x=u.lx;u.y=u.ly}terrainState.gateSolid=true;u.x=Math.max(r,Math.min(W-r,u.x));u.y=Math.max(r,Math.min(H-r,u.y));u.lx=u.x;u.ly=u.y;return}
 let tx=Math.max(0,Math.min(TW-1,Math.floor(u.x/TS))),ty=Math.max(0,Math.min(TH-1,Math.floor(u.y/TS)));
 if(u.lx!==undefined){const ptx=Math.floor(u.lx/TS),pty=Math.floor(u.ly/TS);if((ptx!==tx||pty!==ty)&&!solid(ptx,pty)&&blk(ptx,pty,tx,ty)){u.x=u.lx;u.y=u.ly;tx=ptx;ty=pty}}
 if(solid(tx,ty)){const x0=tx*TS,y0=ty*TS,c=[[u.x-x0,-1,0],[x0+TS-u.x,1,0],[u.y-y0,0,-1],[y0+TS-u.y,0,1]].filter(e=>!solid(tx+e[1],ty+e[2])).sort((p,q)=>p[0]-q[0])[0];
  if(c){if(c[1])u.x=c[1]<0?x0-r:x0+TS+r;if(c[2])u.y=c[2]<0?y0-r:y0+TS+r;tx=Math.floor(u.x/TS);ty=Math.floor(u.y/TS)}}
 for(let j=ty-1;j<=ty+1;j++)for(let i=tx-1;i<=tx+1;i++){if(i===tx&&j===ty)continue;if(!blk(tx,ty,i,j))continue;
  const x0=i*TS,y0=j*TS,cx=Math.max(x0,Math.min(x0+TS,u.x)),cy=Math.max(y0,Math.min(y0+TS,u.y)),dd=dist(u.x,u.y,cx,cy);
  if(dd<r&&dd>=.01){u.x+=(u.x-cx)/dd*(r-dd);u.y+=(u.y-cy)/dd*(r-dd)}}
 terrainState.gateSolid=true;u.x=Math.max(r,Math.min(W-r,u.x));u.y=Math.max(r,Math.min(H-r,u.y));u.lx=u.x;u.ly=u.y}
