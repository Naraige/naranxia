import { aiR, BASES, HORDES, OWN, TR_CASTLE, TR_TOWER } from '../ai/kingdoms.js';
import { ALERTS } from '../gameplay/economy.js';
import { CASTLES } from '../gameplay/players.js';
import { TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW } from '../gameplay/swarm.js';
import { fitSc, L, T_, TTL, tw, twH } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { pickGround } from '../rendering/camera.js';
import { fowBox, FOWC, fowSeenAt, fowVisAt } from '../rendering/fog.js';
import { LANE_REAR, visLanes } from '../rendering/routes.js';
import { CAM } from '../rendering/scene.js';
import { uiBtn } from './build-menu.js';
import { canvasesState, cv, cvs } from './canvases.js';
import { cb, cbOn } from '../core/prefs.js';
import { circ, drawLock, frame, MS, PAN, RDB, rr, UIT } from './drawing.js';
import { hudState, U } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { dIc, IC } from './icons.js';
import { PAL, THEME } from './kingdom-theme.js';
import { FFP } from './typography.js';
import { mc, NCX, NCY, RUINS, terrainState } from '../world/terrain.js';

export const minimapState = {
  mmT: -9,
};

let mm2;
let m2g;

export function refreshMM(){m2g.imageSmoothingEnabled=true;m2g.imageSmoothingQuality='high';m2g.drawImage(mc,0,0,900,500)}

export function bar(x,y,w,f,c1,c2){f=Math.max(0,Math.min(1,f));rr(x,y,w,7,3.5);canvasesState.ctx.fillStyle='#150e09';canvasesState.ctx.fill();if(f>0){const ww=Math.max(5,(w-2)*f);rr(x+1,y+1,ww,5,2.5);const g=canvasesState.ctx.createLinearGradient(0,y,0,y+7);g.addColorStop(0,c1);g.addColorStop(1,c2);canvasesState.ctx.fillStyle=g;canvasesState.ctx.fill()}rr(x,y,w,7,3.5);canvasesState.ctx.strokeStyle='rgba(255,255,255,.18)';canvasesState.ctx.lineWidth=1;canvasesState.ctx.stroke()}

function viewPoly(){const w=cv.width,h=cv.height,P=[[0,h*.02],[w,h*.02],[w,h],[0,h]].map(([a,b])=>pickGround(a,b));return P.every(p=>p)?P.map(p=>[p.x,p.z]):null}

export const mmss=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};

/* ---- world drawing shared by minimap and big map ---- */
const MMC={c:null,g:null,t:-9};

/* ---- minimap framing (v94) ----
   The minimap shows the part of the world the player knows, not the whole 2250 x 1250 tiles (where a kingdom was a few pixels in the dark):
   the box of the explored land (fog of war "seen", which holds both castles in co-op, the camps, ruins and events once seen), of the
   player's buildings and castles and of the seen camps with their ground, plus the camera. Same shape as the world (square pixels),
   a margin, never less than MMMIN tiles wide, never outside the world. The box is looked at once a second and the frame only moves when
   the land comes close to its edge, the camera leaves it, or it became far too wide; then it glides there. Render only: nothing here is
   saved or read by the simulation. The big map (M) still shows the whole world. */
const MMALL={x:0,y:0,w:TW,h:TH},MMMIN=180,MMPAD=.16,MMEDGE=.04,MMWIDE=1.5;
export const mmView={x:0,y:0,w:TW,h:TH,tx:0,ty:0,tw:TW,ok:false,mv:false,look:-9,last:-9};
/* minimap fraction (0..1 across, 0..1 down) to the world tile shown there */
export const mmToWorld=(fx,fy)=>({x:mmView.x+fx*mmView.w,y:mmView.y+fy*mmView.h});
function mmBox(){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(ax,ay,bx,by)=>{if(ax<x0)x0=ax;if(ay<y0)y0=ay;if(bx>x1)x1=bx;if(by>y1)y1=by};
 const f=fowBox();if(f)add(f[0],f[1],f[2],f[3]);
 for(const s of sessionState.structs)if(s.t===0){const X=s.x/TS,Y=s.y/TS;add(X-2,Y-2,X+2,Y+2)}
 for(const c of CASTLES()){const X=c.x/TS,Y=c.y/TS;add(X-TR_CASTLE,Y-TR_CASTLE,X+TR_CASTLE,Y+TR_CASTLE)}
 for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const X=b.x/TS,Y=b.y/TS,r=aiR(b);add(X-r,Y-r,X+r,Y+r)}
 if(x1<x0)return null;return[Math.max(0,x0),Math.max(0,y0),Math.min(TW,x1),Math.min(TH,y1)]}
/* the frame for a box: centred, padded, world-shaped, inside the world */
function mmFit(b){const w=Math.min(TW,Math.max(MMMIN,(b[2]-b[0])*(1+2*MMPAD),(b[3]-b[1])*(1+2*MMPAD)*TW/TH)),h=w*TH/TW;
 return{x:Math.max(0,Math.min(TW-w,(b[0]+b[2])/2-w/2)),y:Math.max(0,Math.min(TH-h,(b[1]+b[3])/2-h/2)),w}}
/* look at the box and choose the frame; snap = go there at once (new game, loaded game, first frame) */
export function mmLook(snap){const V=mmView;V.look=sessionState.clockT;const b=mmBox();if(!b){if(snap||!V.ok){V.x=V.y=V.tx=V.ty=0;V.w=V.tw=TW;V.h=TH;V.ok=true;V.mv=false}return}
 const cx=Math.max(0,Math.min(TW,CAM.x)),cy=Math.max(0,Math.min(TH,CAM.z)),th=V.tw*TH/TW,e=V.tw*MMEDGE,e2=th*MMEDGE;
 /* still good: the land keeps a little room from every edge that is not the edge of the world, and the camera is inside */
 const fits=V.ok&&(b[0]>=V.tx+e||V.tx<=0)&&(b[1]>=V.ty+e2||V.ty<=0)&&(b[2]<=V.tx+V.tw-e||V.tx+V.tw>=TW)&&(b[3]<=V.ty+th-e2||V.ty+th>=TH)&&b[0]>=V.tx&&b[1]>=V.ty&&b[2]<=V.tx+V.tw&&b[3]<=V.ty+th&&cx>=V.tx&&cx<=V.tx+V.tw&&cy>=V.ty&&cy<=V.ty+th;
 const F=mmFit([Math.min(b[0],cx),Math.min(b[1],cy),Math.max(b[2],cx),Math.max(b[3],cy)]);
 if(snap||!fits||V.tw>F.w*MMWIDE){V.tx=F.x;V.ty=F.y;V.tw=F.w}
 /* nothing of the new frame in the old one (another game): no glide */
 if(snap||!V.ok||V.tx>V.x+V.w||V.tx+V.tw<V.x||V.ty>V.y+V.h||V.ty+V.tw*TH/TW<V.y){V.x=V.tx;V.y=V.ty;V.w=V.tw;V.h=V.w*TH/TW;V.mv=false}V.ok=true}
/* once per minimap draw: look once a second (not while the player drags on the minimap), glide toward the chosen frame */
function mmStep(){const V=mmView,t=sessionState.clockT;let dt=t-V.last;V.last=t;if(!V.ok||dt<0||dt>5){mmLook(true);return}
 if((t-V.look>1||t<V.look)&&!hudState.mmDrag)mmLook(false);
 const dx=V.tx-V.x,dy=V.ty-V.y,dw=V.tw-V.w;if(Math.abs(dx)<.2&&Math.abs(dy)<.2&&Math.abs(dw)<.2){V.x=V.tx;V.y=V.ty;V.w=V.tw;V.h=V.w*TH/TW;V.mv=false;return}
 const k=1-Math.exp(-dt*4.5);V.x+=dx*k;V.y+=dy*k;V.w+=dw*k;V.h=V.w*TH/TW;V.mv=true}
/* where a zombie route comes into the frame: its start when that is in view, else the point where it crosses the edge (m tiles inside) */
function mmEntry(P,V,m){const inV=(px,py)=>px>=V.x+m&&px<=V.x+V.w-m&&py>=V.y+m&&py<=V.y+V.h-m;if(inV(P[0][0],P[0][1]))return P[0];
 for(let i=1;i<P.length;i++){if(!inV(P[i][0],P[i][1]))continue;const a=P[i-1],b=P[i];let lo=0,hi=1;for(let n=0;n<10;n++){const md=(lo+hi)/2;if(inV(a[0]+(b[0]-a[0])*md,a[1]+(b[1]-a[1])*md))hi=md;else lo=md}return[a[0]+(b[0]-a[0])*hi,a[1]+(b[1]-a[1])*hi]}
 return null}

export function drawWorld(x,y,w,h,big){
 if(!big)mmStep();
 if(!big){const W2=Math.max(1,Math.round(w*hudDisplayState.UIS)),H2=Math.max(1,Math.round(h*hudDisplayState.UIS));if(!MMC.c||MMC.c.width!==W2||MMC.c.height!==H2){MMC.c=cvs(W2,H2);MMC.g=MMC.c.getContext('2d');MMC.t=-9}
  if(sessionState.clockT-MMC.t>.2||sessionState.clockT<MMC.t||mmView.mv){MMC.t=sessionState.clockT;const o=canvasesState.ctx;canvasesState.ctx=MMC.g;try{canvasesState.ctx.setTransform(W2/w,0,0,H2/h,0,0);dwBase(0,0,w,h,false)}finally{canvasesState.ctx=o}}
  canvasesState.ctx.save();canvasesState.ctx.setTransform(1,0,0,1,0,0);canvasesState.ctx.imageSmoothingEnabled=false;canvasesState.ctx.drawImage(MMC.c,Math.round(x*hudDisplayState.UIS),Math.round(y*hudDisplayState.UIS));canvasesState.ctx.restore()}
 else dwBase(x,y,w,h,true);
 const V=big?MMALL:mmView,sx=w/V.w,sy=h/V.h,ox=x-V.x*sx,oy=y-V.y*sy,VL=visLanes();canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.rect(x,y,w,h);canvasesState.ctx.clip();
 for(const a of ALERTS){const X=ox+a.x/TS*sx,Y=oy+a.y/TS*sy,r=(big?4:3)+((a.t*3)%1)*(big?8:5);canvasesState.ctx.strokeStyle='rgba(255,70,70,.95)';canvasesState.ctx.lineWidth=1.6;canvasesState.ctx.beginPath();canvasesState.ctx.arc(X,Y,r,0,6.283);canvasesState.ctx.stroke()}
 const vp=viewPoly();if(vp){canvasesState.ctx.strokeStyle='rgba(255,255,255,.95)';canvasesState.ctx.lineWidth=1;canvasesState.ctx.beginPath();vp.forEach((p,i)=>{const X=ox+p[0]*sx,Y=oy+p[1]*sy;i?canvasesState.ctx.lineTo(X,Y):canvasesState.ctx.moveTo(X,Y)});canvasesState.ctx.closePath();canvasesState.ctx.stroke()}
  const cs=big?13:9;for(const c0 of CASTLES())dIc(IC.home,ox+c0.x/TS*sx-cs/2,oy+c0.y/TS*sy-cs/2-1,cs);
 for(const u of sessionState.units)if(u.cv&&u.hp>0)circ(canvasesState.ctx,ox+u.x/TS*sx,oy+u.y/TS*sy,big?3.4:2.4,u.cv.back?'#c9a060':'#ffd23c','#2a1a08',1);
 for(const r of RUINS.values()){if(!fowSeenAt(r.x,r.y))continue;const X=ox+r.x/TS*sx,Y=oy+r.y/TS*sy,q=big?4.5:3;canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(X,Y-q);canvasesState.ctx.lineTo(X+q,Y);canvasesState.ctx.lineTo(X,Y+q);canvasesState.ctx.lineTo(X-q,Y);canvasesState.ctx.closePath();canvasesState.ctx.fillStyle=r.done?'#8a8a8a':'#f0c040';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle='#2a1a08';canvasesState.ctx.lineWidth=1;canvasesState.ctx.stroke()}
 terrainState.ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const r=big?6:4,p=big?R.pts[0]:mmEntry(R.pts,V,(r+1.5)/sx);if(!p)return;const X=ox+p[0]*sx,Y=oy+p[1]*sy;circ(canvasesState.ctx,X,Y,r,sessionState.nextL.includes(k)?cb('#c01f2f','#e69f00'):cb('#6a1a22','#7a5200'),'#fff',1);if(big)dIc(IC.skull,X-5,Y-5.5,10);else{canvasesState.ctx.fillStyle='#fff';canvasesState.ctx.fillRect(X-1,Y-1,2,2)}});
 canvasesState.ctx.restore()}

/* colour-blind mode: camps differ by shape too (own = circle, zombies = diamond, rival kingdoms = square); k: 'c' | 'd' | else square */
function shp(k,X,Y,z){const c=canvasesState.ctx;if(k==='c'){c.beginPath();c.arc(X,Y,z*.62,0,6.283);c.fill()}else if(k==='d'){const q=z*.75;c.beginPath();c.moveTo(X,Y-q);c.lineTo(X+q,Y);c.lineTo(X,Y+q);c.lineTo(X-q,Y);c.closePath();c.fill()}else c.fillRect(X-z/2,Y-z/2,z,z)}

function dwBase(x,y,w,h,big){const V=big?MMALL:mmView,sx=w/V.w,sy=h/V.h,ox=x-V.x*sx,oy=y-V.y*sy,g=canvasesState.ctx;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.imageSmoothingEnabled=false;
 if(big){g.drawImage(mc,x,y,w,h);g.drawImage(FOWC,x,y,w,h)}
 else{/* the framed part of the world: the full map (1 pixel per tile, kept crisp when enlarged) while it is close, the small copy when far */
  const px=w*hudDisplayState.UIS,near=V.w<=px*1.5;
  if(near){g.imageSmoothingEnabled=V.w>px;g.drawImage(mc,V.x,V.y,V.w,V.h,x,y,w,h)}else{const q=mm2.width/TW,q2=mm2.height/TH;g.imageSmoothingEnabled=true;g.drawImage(mm2,V.x*q,V.y*q2,V.w*q,V.h*q2,x,y,w,h)}
  {const q=FOWC.width/TW,q2=FOWC.height/TH;g.imageSmoothingEnabled=true;g.drawImage(FOWC,V.x*q,V.y*q2,V.w*q,V.h*q2,x,y,w,h);g.imageSmoothingEnabled=false}}
 const VL=visLanes();terrainState.ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const nx=sessionState.nextL.includes(k),r0=Math.max(0,(LANE_REAR[k]|0)-2);canvasesState.ctx.beginPath();R.pts.forEach((p,i)=>{if(i<r0)return;i>r0?canvasesState.ctx.lineTo(ox+p[0]*sx,oy+p[1]*sy):canvasesState.ctx.moveTo(ox+p[0]*sx,oy+p[1]*sy)});canvasesState.ctx.lineJoin='round';
  canvasesState.ctx.strokeStyle='rgba(30,0,0,.7)';canvasesState.ctx.lineWidth=(big?4:2.8)*(nx?1.15:1);canvasesState.ctx.stroke();canvasesState.ctx.strokeStyle=nx?cb('#ff3b3b','#ffb000'):cb('rgba(214,60,60,.72)','rgba(230,159,0,.75)');canvasesState.ctx.lineWidth=(big?2.2:1.4)*(nx?1.2:1);canvasesState.ctx.stroke()});
 for(const s of sessionState.structs){canvasesState.ctx.fillStyle=s.type==='castle'?'#ffd23c':cb('#7fb2ff','#56b4e9');const z=s.type==='castle'?(big?4:Math.max(3,3*sx)):(big?2:Math.max(1.4,sx));if(cbOn())shp('c',ox+s.x/TS*sx,oy+s.y/TS*sy,Math.max(2.4,z));else canvasesState.ctx.fillRect(ox+s.x/TS*sx-z/2,oy+s.y/TS*sy-z/2,z,z)}
 canvasesState.ctx.lineWidth=big?1.4:1;for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const r=aiR(b)*sx,X=ox+b.x/TS*sx,Y=oy+b.y/TS*sy;canvasesState.ctx.beginPath();canvasesState.ctx.rect(X-r,Y-aiR(b)*sy,2*r,2*aiR(b)*sy);canvasesState.ctx.fillStyle=PAL[b.ci][1]+'26';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle=PAL[b.ci][1]+'cc';canvasesState.ctx.stroke()}
 {canvasesState.ctx.save();canvasesState.ctx.beginPath();for(const k of OWN){const i=k&4095,j=k>>12,x0=ox+i*2*sx,y0=oy+j*2*sy,w2=2*sx,h2=2*sy;if(!OWN.has(k-1)){canvasesState.ctx.moveTo(x0,y0);canvasesState.ctx.lineTo(x0,y0+h2)}if(!OWN.has(k+1)){canvasesState.ctx.moveTo(x0+w2,y0);canvasesState.ctx.lineTo(x0+w2,y0+h2)}if(!OWN.has(k-4096)){canvasesState.ctx.moveTo(x0,y0);canvasesState.ctx.lineTo(x0+w2,y0)}if(!OWN.has(k+4096)){canvasesState.ctx.moveTo(x0,y0+h2);canvasesState.ctx.lineTo(x0+w2,y0+h2)}}canvasesState.ctx.strokeStyle=PAL[THEME.c][1];canvasesState.ctx.lineWidth=big?2:1.4;canvasesState.ctx.stroke();canvasesState.ctx.restore()}
{for(const c0 of CASTLES()){const X=ox+c0.x/TS*sx,Y=oy+c0.y/TS*sy;canvasesState.ctx.beginPath();canvasesState.ctx.rect(X-TR_CASTLE*sx,Y-TR_CASTLE*sy,2*TR_CASTLE*sx,2*TR_CASTLE*sy);canvasesState.ctx.fillStyle=PAL[THEME.c][1]+'2a';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle=PAL[THEME.c][1];canvasesState.ctx.stroke()}for(const s of sessionState.structs)if(s.t===0&&s.type==='tower'&&s.prog>=1){canvasesState.ctx.beginPath();canvasesState.ctx.rect(ox+s.x/TS*sx-TR_TOWER*sx,oy+s.y/TS*sy-TR_TOWER*sy,2*TR_TOWER*sx,2*TR_TOWER*sy);canvasesState.ctx.fillStyle=PAL[THEME.c][1]+'22';canvasesState.ctx.fill()}}
 for(const h of HORDES){if(h.act||!fowVisAt(h.x,h.y))continue;const z=(big?2.2:1.5)+Math.min(2,h.n/30);canvasesState.ctx.fillStyle=cb('rgba(255,70,70,.85)','rgba(240,160,0,.9)');if(cbOn())shp('d',ox+h.x/TS*sx,oy+h.y/TS*sy,Math.max(3,z));else canvasesState.ctx.fillRect(ox+h.x/TS*sx-z/2,oy+h.y/TS*sy-z/2,z,z)}
 for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const z=(big?4:2.6)+b.lvl*.35,col=PAL[b.ci][1];canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(ox+b.x/TS*sx-z/2-1,oy+b.y/TS*sy-z/2-1,z+2,z+2);canvasesState.ctx.fillStyle=col;canvasesState.ctx.fillRect(ox+b.x/TS*sx-z/2,oy+b.y/TS*sy-z/2,z,z)}
 {const st=Math.max(1,Math.ceil(SW.n/2500)),z=big?1.6:1.1;canvasesState.ctx.fillStyle=cb('#ff5bff','#f0e442');for(let i=0;i<SW.n;i+=st){const x0=SW.x[i],y0=SW.y[i];if(!fowVisAt(x0,y0))continue;canvasesState.ctx.fillRect(ox+x0/TS*sx-z/2,oy+y0/TS*sy-z/2,z,z)}}
 for(const u of sessionState.units){if(u.t===2||u.shel||(u.t&&!fowVisAt(u.x,u.y)))continue;canvasesState.ctx.fillStyle=u.t?cb('#ff5bff','#f0e442'):'#ffffff';const z=u.type==='brute'?3:big?1.8:1.2;if(cbOn())shp(u.t?'d':'c',ox+u.x/TS*sx,oy+u.y/TS*sy,Math.max(u.t?2.8:2.2,z));else canvasesState.ctx.fillRect(ox+u.x/TS*sx-z/2,oy+u.y/TS*sy-z/2,z,z)}
 canvasesState.ctx.restore()}

/* ---- overlays ---- */
export function pill(x,y,w,h,label,pal,palH,fn,ic,sc,on,dis,foc){uiBtn(x,y,w,h,pal,palH,fn,null,(X,Y,W2,H2,hv,ds)=>{const lk=MS.on&&ds&&H2>=14,iw=(ic?h*.62+4:0)+(lk?H2*.5:0);
 if(MS.on&&H2>=18){menuLabel(L(String(label)),X,Y,W2,H2,iw,(sc||1),hv,ds,lk,ic);return}
 const s=fitSc(label,W2-iw-8,sc||1),tx=tw(label,s);let cx=X+(W2-tx-iw)/2;if(lk){drawLock(cx+H2*.2,Y+H2/2,H2*.46,'#9aa3b4');cx+=H2*.5}if(ic){dIc(ic,cx,Y+(H2-h*.62)/2,h*.62);cx+=iw-(lk?H2*.5:0)}T_(label,cx,Y+(H2-9*s)/2+.5*s,MS.on?(ds?'#9aa3b4':hv?'#ffe08a':'#eef2fa'):ds?'#8a7660':'#fff',s)},on,dis,foc)}

/* menu plates (title, settings, saves...): label in the pixel font, light ink, gold when hovered, padlock when disabled */
function menuLabel(t,X,Y,W2,H2,iw,sc,hv,ds,lk,ic){const g=canvasesState.ctx;let S=Math.round(Math.min(15,Math.max(8,H2*.5*sc)));g.save();g.font='600 '+S+'px '+FFP;const room=W2-iw-12;let w=g.measureText(t).width;while(S>7&&w>room){S--;g.font='600 '+S+'px '+FFP;w=g.measureText(t).width}
 if(w>room+.5){const o=window.__ovf||(window.__ovf=[]);if(o.length<400)o.push(t+' @btn'+Math.round(W2))}
 let cx=X+(W2-w-iw)/2;const my=Y+H2/2;if(lk){drawLock(cx+H2*.2,my,H2*.46,'#9aa3b4');cx+=H2*.5}if(ic){dIc(ic,cx,my-H2*.31,H2*.62);cx+=iw-(lk?H2*.5:0)}
 g.textBaseline='middle';g.textAlign='left';g.fillStyle='rgba(0,0,0,.55)';g.fillText(t,cx+.5,my+1.1);g.fillStyle=ds?'#8d96a8':hv?'#ffe08a':'#eef2fa';g.fillText(t,cx,my+.4);g.restore()}

export function drawMapModal(UW,UH){canvasesState.ctx.fillStyle='rgba(5,8,16,.8)';canvasesState.ctx.fillRect(0,0,UW,UH);
 const aw=UW-20,ah=UH-68,mw=Math.min(aw,ah*TW/TH),mh=mw*TH/TW,pw=mw+16,ph=mh+50,px=(UW-pw)/2,py=(UH-ph)/2,mx=px+8,my=py+30;
 hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];frame(px,py,pw,ph,PAN,UIT.rad.panel);
 dIc(IC.map,px+8,py+7,15);TTL('World map',px+26,py+8,1.22);
 let lx=px+pw-8-18-6;const leg=[['Your base',IC.home,null],['Spawn',IC.skull,null],['Next zombie route',null,cb('#ff3b3b','#ffb000')]];
 for(const[t,ic,col]of leg.slice().reverse()){const w=tw(t,.85)+(ic?12:14);lx-=w+8;if(lx<px+40+twH('World map',1.22))break;if(ic)dIc(ic,lx,py+9,10);else{canvasesState.ctx.fillStyle=col;canvasesState.ctx.fillRect(lx,py+13,10,2.4)}T_(t,lx+13,py+10.5,'#ead8ba',.85)}
 uiBtn(px+pw-8-18,py+6,18,18,RDB,RDB,()=>{sessionState.showMap=false},['Close [M]'],(x,y,w,h)=>dIc(IC.close,x+3,y+3,12));
 frame(mx-2,my-2,mw+4,mh+4,['#0b0f1a','#1a2236','#070a12'],UIT.rad.small);
 drawWorld(mx,my,mw,mh,true);
 hudState.uiHits.push({...U(mx,my,mw,mh),fn:()=>{CAM.x=Math.max(2,Math.min(TW-2,(inputState.mouse.x-mx*hudDisplayState.UIS)/(mw*hudDisplayState.UIS)*TW));CAM.z=Math.max(2,Math.min(TH-2,(inputState.mouse.y-my*hudDisplayState.UIS)/(mh*hudDisplayState.UIS)*TH));sessionState.showMap=false},tip:null});
 const pr=Math.round(terrainState.genN/(NCX*NCY)*100);T_('Map #'+((terrainState.SEED*1000)|0)+(pr<100?'   Generating '+pr+'%':'   '+TW+' x '+TH+' tiles')+'   Click to jump there',mx,my+mh+6,'#b59773',.85)}

export function initializeMinimapDisplay() {
  mm2 = cvs(900,500);
  m2g = mm2.getContext('2d');
}
