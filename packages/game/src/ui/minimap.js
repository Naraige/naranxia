import { aiR, BASES, HORDES, OWN, TR_CASTLE, TR_TOWER } from '../ai/kingdoms.js';
import { ALERTS } from '../gameplay/economy.js';
import { CASTLES } from '../gameplay/players.js';
import { TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW } from '../gameplay/swarm.js';
import { fitSc, T_, TTL, tw, twH } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { pickGround } from '../rendering/camera.js';
import { FOWC, fowSeenAt, fowVisAt } from '../rendering/fog.js';
import { LANE_REAR, visLanes } from '../rendering/routes.js';
import { CAM } from '../rendering/scene.js';
import { uiBtn } from './build-menu.js';
import { canvasesState, cv, cvs } from './canvases.js';
import { cb } from '../core/prefs.js';
import { circ, frame, PAN, RDB, rr } from './drawing.js';
import { hudState, U } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { dIc, IC } from './icons.js';
import { PAL, THEME } from './kingdom-theme.js';
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

export function drawWorld(x,y,w,h,big){
 if(!big){const W2=Math.max(1,Math.round(w*hudDisplayState.UIS)),H2=Math.max(1,Math.round(h*hudDisplayState.UIS));if(!MMC.c||MMC.c.width!==W2||MMC.c.height!==H2){MMC.c=cvs(W2,H2);MMC.g=MMC.c.getContext('2d');MMC.t=-9}
  if(sessionState.clockT-MMC.t>.2||sessionState.clockT<MMC.t){MMC.t=sessionState.clockT;const o=canvasesState.ctx;canvasesState.ctx=MMC.g;try{canvasesState.ctx.setTransform(W2/w,0,0,H2/h,0,0);dwBase(0,0,w,h,false)}finally{canvasesState.ctx=o}}
  canvasesState.ctx.save();canvasesState.ctx.setTransform(1,0,0,1,0,0);canvasesState.ctx.imageSmoothingEnabled=false;canvasesState.ctx.drawImage(MMC.c,Math.round(x*hudDisplayState.UIS),Math.round(y*hudDisplayState.UIS));canvasesState.ctx.restore()}
 else dwBase(x,y,w,h,true);
 const sx=w/TW,sy=h/TH,VL=visLanes();canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.rect(x,y,w,h);canvasesState.ctx.clip();
 for(const a of ALERTS){const X=x+a.x/TS*sx,Y=y+a.y/TS*sy,r=(big?4:3)+((a.t*3)%1)*(big?8:5);canvasesState.ctx.strokeStyle='rgba(255,70,70,.95)';canvasesState.ctx.lineWidth=1.6;canvasesState.ctx.beginPath();canvasesState.ctx.arc(X,Y,r,0,6.283);canvasesState.ctx.stroke()}
 const vp=viewPoly();if(vp){canvasesState.ctx.strokeStyle='rgba(255,255,255,.95)';canvasesState.ctx.lineWidth=1;canvasesState.ctx.beginPath();vp.forEach((p,i)=>{const X=x+p[0]*sx,Y=y+p[1]*sy;i?canvasesState.ctx.lineTo(X,Y):canvasesState.ctx.moveTo(X,Y)});canvasesState.ctx.closePath();canvasesState.ctx.stroke()}
 canvasesState.ctx.restore();
 const cs=big?13:9;for(const c0 of CASTLES())dIc(IC.home,x+c0.x/TS*sx-cs/2,y+c0.y/TS*sy-cs/2-1,cs);
 for(const u of sessionState.units)if(u.cv&&u.hp>0)circ(canvasesState.ctx,x+u.x/TS*sx,y+u.y/TS*sy,big?3.4:2.4,u.cv.back?'#c9a060':'#ffd23c','#2a1a08',1);
 for(const r of RUINS.values()){if(!fowSeenAt(r.x,r.y))continue;const X=x+r.x/TS*sx,Y=y+r.y/TS*sy,q=big?4.5:3;canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(X,Y-q);canvasesState.ctx.lineTo(X+q,Y);canvasesState.ctx.lineTo(X,Y+q);canvasesState.ctx.lineTo(X-q,Y);canvasesState.ctx.closePath();canvasesState.ctx.fillStyle=r.done?'#8a8a8a':'#f0c040';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle='#2a1a08';canvasesState.ctx.lineWidth=1;canvasesState.ctx.stroke()}
 terrainState.ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const p=R.pts[0],X=x+p[0]*sx,Y=y+p[1]*sy,r=big?6:4;circ(canvasesState.ctx,X,Y,r,sessionState.nextL.includes(k)?cb('#c01f2f','#e69f00'):cb('#6a1a22','#7a5200'),'#fff',1);if(big)dIc(IC.skull,X-5,Y-5.5,10);else{canvasesState.ctx.fillStyle='#fff';canvasesState.ctx.fillRect(X-1,Y-1,2,2)}})}

function dwBase(x,y,w,h,big){const sx=w/TW,sy=h/TH;
 canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.rect(x,y,w,h);canvasesState.ctx.clip();canvasesState.ctx.imageSmoothingEnabled=false;canvasesState.ctx.drawImage(big?mc:mm2,x,y,w,h);canvasesState.ctx.drawImage(FOWC,x,y,w,h);
 const VL=visLanes();terrainState.ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const nx=sessionState.nextL.includes(k),r0=Math.max(0,(LANE_REAR[k]|0)-2);canvasesState.ctx.beginPath();R.pts.forEach((p,i)=>{if(i<r0)return;i>r0?canvasesState.ctx.lineTo(x+p[0]*sx,y+p[1]*sy):canvasesState.ctx.moveTo(x+p[0]*sx,y+p[1]*sy)});canvasesState.ctx.lineJoin='round';
  canvasesState.ctx.strokeStyle='rgba(30,0,0,.7)';canvasesState.ctx.lineWidth=(big?4:2.8)*(nx?1.15:1);canvasesState.ctx.stroke();canvasesState.ctx.strokeStyle=nx?cb('#ff3b3b','#ffb000'):cb('rgba(214,60,60,.72)','rgba(230,159,0,.75)');canvasesState.ctx.lineWidth=(big?2.2:1.4)*(nx?1.2:1);canvasesState.ctx.stroke()});
 for(const s of sessionState.structs){canvasesState.ctx.fillStyle=s.type==='castle'?'#ffd23c':cb('#7fb2ff','#56b4e9');const z=s.type==='castle'?(big?4:3):(big?2:1.4);canvasesState.ctx.fillRect(x+s.x/TS*sx-z/2,y+s.y/TS*sy-z/2,z,z)}
 canvasesState.ctx.lineWidth=big?1.4:1;for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const r=aiR(b)*sx,X=x+b.x/TS*sx,Y=y+b.y/TS*sy;canvasesState.ctx.beginPath();canvasesState.ctx.rect(X-r,Y-aiR(b)*sy,2*r,2*aiR(b)*sy);canvasesState.ctx.fillStyle=PAL[b.ci][1]+'26';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle=PAL[b.ci][1]+'cc';canvasesState.ctx.stroke()}
 {canvasesState.ctx.save();canvasesState.ctx.beginPath();for(const k of OWN){const i=k&4095,j=k>>12,x0=x+i*2*sx,y0=y+j*2*sy,w2=2*sx,h2=2*sy;if(!OWN.has(k-1)){canvasesState.ctx.moveTo(x0,y0);canvasesState.ctx.lineTo(x0,y0+h2)}if(!OWN.has(k+1)){canvasesState.ctx.moveTo(x0+w2,y0);canvasesState.ctx.lineTo(x0+w2,y0+h2)}if(!OWN.has(k-4096)){canvasesState.ctx.moveTo(x0,y0);canvasesState.ctx.lineTo(x0+w2,y0)}if(!OWN.has(k+4096)){canvasesState.ctx.moveTo(x0,y0+h2);canvasesState.ctx.lineTo(x0+w2,y0+h2)}}canvasesState.ctx.strokeStyle=PAL[THEME.c][1];canvasesState.ctx.lineWidth=big?2:1.4;canvasesState.ctx.stroke();canvasesState.ctx.restore()}
{for(const c0 of CASTLES()){const X=x+c0.x/TS*sx,Y=y+c0.y/TS*sy;canvasesState.ctx.beginPath();canvasesState.ctx.rect(X-TR_CASTLE*sx,Y-TR_CASTLE*sy,2*TR_CASTLE*sx,2*TR_CASTLE*sy);canvasesState.ctx.fillStyle=PAL[THEME.c][1]+'2a';canvasesState.ctx.fill();canvasesState.ctx.strokeStyle=PAL[THEME.c][1];canvasesState.ctx.stroke()}for(const s of sessionState.structs)if(s.t===0&&s.type==='tower'&&s.prog>=1){canvasesState.ctx.beginPath();canvasesState.ctx.rect(x+s.x/TS*sx-TR_TOWER*sx,y+s.y/TS*sy-TR_TOWER*sy,2*TR_TOWER*sx,2*TR_TOWER*sy);canvasesState.ctx.fillStyle=PAL[THEME.c][1]+'22';canvasesState.ctx.fill()}}
 for(const h of HORDES){if(h.act||!fowVisAt(h.x,h.y))continue;const z=(big?2.2:1.5)+Math.min(2,h.n/30);canvasesState.ctx.fillStyle=cb('rgba(255,70,70,.85)','rgba(240,160,0,.9)');canvasesState.ctx.fillRect(x+h.x/TS*sx-z/2,y+h.y/TS*sy-z/2,z,z)}
 for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const z=(big?4:2.6)+b.lvl*.35,col=PAL[b.ci][1];canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(x+b.x/TS*sx-z/2-1,y+b.y/TS*sy-z/2-1,z+2,z+2);canvasesState.ctx.fillStyle=col;canvasesState.ctx.fillRect(x+b.x/TS*sx-z/2,y+b.y/TS*sy-z/2,z,z)}
 {const st=Math.max(1,Math.ceil(SW.n/2500)),z=big?1.6:1.1;canvasesState.ctx.fillStyle=cb('#ff5bff','#f0e442');for(let i=0;i<SW.n;i+=st){const x0=SW.x[i],y0=SW.y[i];if(!fowVisAt(x0,y0))continue;canvasesState.ctx.fillRect(x+x0/TS*sx-z/2,y+y0/TS*sy-z/2,z,z)}}
 for(const u of sessionState.units){if(u.t===2||u.shel||(u.t&&!fowVisAt(u.x,u.y)))continue;canvasesState.ctx.fillStyle=u.t?cb('#ff5bff','#f0e442'):'#ffffff';const z=u.type==='brute'?3:big?1.8:1.2;canvasesState.ctx.fillRect(x+u.x/TS*sx-z/2,y+u.y/TS*sy-z/2,z,z)}
 canvasesState.ctx.restore()}

/* ---- overlays ---- */
export function pill(x,y,w,h,label,pal,palH,fn,ic,sc,on,dis){uiBtn(x,y,w,h,pal,palH,fn,null,(X,Y,W2,H2)=>{const iw=ic?h*.62+4:0,s=fitSc(label,W2-iw-8,sc||1),tx=tw(label,s);let cx=X+(W2-tx-iw)/2;if(ic){dIc(ic,cx,Y+(H2-h*.62)/2,h*.62);cx+=iw}T_(label,cx,Y+(H2-9*s)/2+.5*s,dis?'#8a7660':'#fff',s)},on,dis)}

export function drawMapModal(UW,UH){canvasesState.ctx.fillStyle='rgba(5,8,16,.8)';canvasesState.ctx.fillRect(0,0,UW,UH);
 const aw=UW-20,ah=UH-68,mw=Math.min(aw,ah*TW/TH),mh=mw*TH/TW,pw=mw+16,ph=mh+50,px=(UW-pw)/2,py=(UH-ph)/2,mx=px+8,my=py+30;
 hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];frame(px,py,pw,ph,PAN,6);
 dIc(IC.map,px+8,py+7,15);TTL('World map',px+26,py+8,1.22);
 let lx=px+pw-8-18-6;const leg=[['Your base',IC.home,null],['Spawn',IC.skull,null],['Next zombie route',null,cb('#ff3b3b','#ffb000')]];
 for(const[t,ic,col]of leg.slice().reverse()){const w=tw(t,.85)+(ic?12:14);lx-=w+8;if(lx<px+40+twH('World map',1.22))break;if(ic)dIc(ic,lx,py+9,10);else{canvasesState.ctx.fillStyle=col;canvasesState.ctx.fillRect(lx,py+13,10,2.4)}T_(t,lx+13,py+10.5,'#ead8ba',.85)}
 uiBtn(px+pw-8-18,py+6,18,18,RDB,RDB,()=>{sessionState.showMap=false},['Close [M]'],(x,y,w,h)=>dIc(IC.close,x+3,y+3,12));
 frame(mx-2,my-2,mw+4,mh+4,['#0b0f1a','#1a2236','#070a12'],4);
 drawWorld(mx,my,mw,mh,true);
 hudState.uiHits.push({...U(mx,my,mw,mh),fn:()=>{CAM.x=Math.max(2,Math.min(TW-2,(inputState.mouse.x-mx*hudDisplayState.UIS)/(mw*hudDisplayState.UIS)*TW));CAM.z=Math.max(2,Math.min(TH-2,(inputState.mouse.y-my*hudDisplayState.UIS)/(mh*hudDisplayState.UIS)*TH));sessionState.showMap=false},tip:null});
 const pr=Math.round(terrainState.genN/(NCX*NCY)*100);T_('Map #'+((terrainState.SEED*1000)|0)+(pr<100?'   Generating '+pr+'%':'   '+TW+' x '+TH+' tiles')+'   Click to jump there',mx,my+mh+6,'#b59773',.85)}

export function initializeMinimapDisplay() {
  mm2 = cvs(900,500);
  m2g = mm2.getContext('2d');
}
