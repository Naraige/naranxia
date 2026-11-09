import { hex } from '../core/math.js';
import { rngf } from '../core/random.js';
import { cbOn } from '../core/prefs.js';
import { L } from '../i18n/language.js';
import { canvasesState, cv, cvs } from './canvases.js';
import { btnAdd, ink, inBtn, setF } from './typography.js';

export const PAN = ['#1d2530','#b8954c','#0a0d12'];
export const BTN = ['#263242','#c9a24f','#0b0f14'];
export const BTNH = ['#2c4a66','#86dcff','#0c141c'];
export const BTNX = ['#171d25','#4c4535','#0a0c10'];
const TABA = ['#1e6a74','#7fe6e6','#0a2a2e'];
export const GRN = ['#1d6670','#79dede','#0a272b'];
export const GRNH = ['#278692','#a8f6f6','#0e3a40'];
export const RDB = ['#7a2630','#e0707a','#3a0e14'];
/* colour-blind palette (Okabe-Ito based): red/green status frames become orange/blue; recoloured in place so every import follows */
const CBP={GRN:['#1f4f8f','#8cc4ff','#0a1a33'],GRNH:['#2a68b8','#bcdcff','#10284a'],RDB:['#8a4a00','#ffb347','#3a1e00']},CB0={GRN:GRN.slice(),GRNH:GRNH.slice(),RDB:RDB.slice()};
export function applyCB(){const on=cbOn(),T={GRN,GRNH,RDB};for(const k in T)for(let i=0;i<3;i++)T[k][i]=(on?CBP:CB0)[k][i]}

export function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(x+r,y);canvasesState.ctx.arcTo(x+w,y,x+w,y+h,r);canvasesState.ctx.arcTo(x+w,y+h,x,y+h,r);canvasesState.ctx.arcTo(x,y+h,x,y,r);canvasesState.ctx.arcTo(x,y,x+w,y,r);canvasesState.ctx.closePath()}

const SHDM=new Map(),shd=(c,k)=>{const key=c+'|'+k;let r=SHDM.get(key);if(r===undefined){const h=hex(c);r='#'+h.map(v=>Math.max(0,Math.min(255,Math.round(k>=0?v+(255-v)*k:v*(1+k)))).toString(16).padStart(2,'0')).join('');if(SHDM.size>600)SHDM.clear();SHDM.set(key,r)}return r};

const LGC=new Map();
function lgc(k,y,h,a,b,c,d,e,f){k+='|'+y+'|'+h;let g=LGC.get(k);if(g===undefined){g=canvasesState.ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(a,b);g.addColorStop(c,d);if(e!==undefined)g.addColorStop(e,f);if(LGC.size>900)LGC.clear();LGC.set(k,g)}return g}

export function arcDia(cx,cy,r,c){canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(cx,cy-r-1);canvasesState.ctx.lineTo(cx+r+1,cy);canvasesState.ctx.lineTo(cx,cy+r+1);canvasesState.ctx.lineTo(cx-r-1,cy);canvasesState.ctx.closePath();canvasesState.ctx.fillStyle='#07060b';canvasesState.ctx.fill();
 const g=canvasesState.ctx.createLinearGradient(0,cy-r,0,cy+r);g.addColorStop(0,shd(c,.5));g.addColorStop(.5,c);g.addColorStop(1,shd(c,-.5));canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(cx,cy-r);canvasesState.ctx.lineTo(cx+r,cy);canvasesState.ctx.lineTo(cx,cy+r);canvasesState.ctx.lineTo(cx-r,cy);canvasesState.ctx.closePath();canvasesState.ctx.fillStyle=g;canvasesState.ctx.fill()}

export function frame(x,y,w,h,p,r){if(p===SLOT||p===SLOTH||p===SLOTX){mcSlot(x,y,w,h,p);return}if(p===TIPP){mcTip(x,y,w,h);return}
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 if(p===CHAT){canvasesState.ctx.fillStyle='rgba(12,17,26,.74)';canvasesState.ctx.fillRect(x,y,w,h);
  if(y<0&&w>200){const gl=canvasesState.ctx.createLinearGradient(x,0,x+w,0);gl.addColorStop(0,'rgba(120,210,255,0)');gl.addColorStop(.08,'rgba(120,210,255,.55)');gl.addColorStop(.92,'rgba(120,210,255,.55)');gl.addColorStop(1,'rgba(120,210,255,0)');canvasesState.ctx.fillStyle='rgba(5,4,8,.75)';canvasesState.ctx.fillRect(x,y+h,w,1);canvasesState.ctx.fillStyle=gl;canvasesState.ctx.fillRect(x,y+h-1,w,1)}return}
  const g=canvasesState.ctx,big=h>40,Rd=Math.max(2,Math.min(big?12:8,h/3,w/3)),
   hv=p===BTNH||p===GRNH||p===TABA,ok=p===GRN,bad=p===RDB,off=p===BTNX,btn=hv||ok||bad||off||p===BTN,
   tint=hv?'47,125,246':ok?'20,160,130':bad?'220,60,70':null;
  /* glass buttons: translucent body, top gloss, light rim over a dark hairline, soft shadow, blue / teal / red accent */
  if(btn){btnAdd(x,y,w,h);
   g.fillStyle=big?'rgba(0,0,0,.22)':'rgba(0,0,0,.14)';rr(x,y+(big?3:1.5),w,h,Rd+1);g.fill();
   if(tint&&!off){g.fillStyle='rgba(255,255,255,.55)';rr(x,y,w,h,Rd);g.fill()}
   g.fillStyle=off?'rgba(225,231,240,.34)':tint?lgc('lt'+tint,y,h,0,'rgba('+tint+','+(hv?.34:.26)+')',1,'rgba('+tint+','+(hv?.16:.12)+')'):lgc('lb',y,h,0,'rgba(255,255,255,.84)',.55,'rgba(248,250,254,.7)',1,'rgba(236,241,250,.62)');
   rr(x,y,w,h,Rd);g.fill();
   if(!off){g.fillStyle=lgc('gl',y,h,0,'rgba(255,255,255,.42)',.5,'rgba(255,255,255,.08)',1,'rgba(255,255,255,0)');rr(x+1,y+1,w-2,h*.55,Math.max(1,Rd-1));g.fill()}
   g.strokeStyle=off?'rgba(0,0,0,.14)':'rgba(8,14,26,.38)';g.lineWidth=1;rr(x-.5,y-.5,w+1,h+1,Rd+.5);g.stroke();
   g.strokeStyle=off?lgc('rf',y,h,0,'rgba(255,255,255,.4)',1,'rgba(255,255,255,.14)'):tint?'rgb('+tint+')':lgc('rm',y,h,0,'rgba(255,255,255,.95)',1,'rgba(255,255,255,.4)');g.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);g.stroke();
   if(tint&&!off){g.globalAlpha=.28;g.strokeStyle='rgb('+tint+')';g.lineWidth=3;rr(x-1.5,y-1.5,w+3,h+3,Rd+2);g.stroke();g.globalAlpha=1}return}
  g.fillStyle=big?UIT.shadeBig:UIT.shade;rr(x,y+(big?4:2),w,h,Rd+1);g.fill();
  g.fillStyle=lgc('pg'+(big?1:0),y,h,0,'rgba(20,27,40,.80)',1,'rgba(10,14,22,.80)');rr(x,y,w,h,Rd);g.fill();
  g.strokeStyle=UIT.line;g.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);g.stroke()}

/* shared UI tokens: corner radii, hairline border and soft shadows used by panels, slots, tooltips and the minimap frame */
export const UIT={rad:{panel:6,small:5,tip:8},line:'rgba(255,255,255,.16)',shade:'rgba(0,0,0,.22)',shadeBig:'rgba(0,0,0,.34)'};

/* the one keyboard / gamepad focus ring (slots, pills, rows): dark keyline, bright amber ring */
export function focusRing(x,y,w,h){const g=canvasesState.ctx,Rd=Math.max(2,Math.min(7,w/4,h/4));g.save();g.lineWidth=3.4;g.strokeStyle='rgba(8,10,16,.8)';rr(x-.5,y-.5,w+1,h+1,Rd+1);g.stroke();g.lineWidth=1.8;g.strokeStyle='#ffd86b';rr(x-.5,y-.5,w+1,h+1,Rd+1);g.stroke();g.restore()}

export function gold(x,y,w,h,r){const Rd=Math.max(1,Math.min(3.5,w/5,h/5));canvasesState.ctx.save();canvasesState.ctx.shadowColor='rgba(47,125,246,.6)';canvasesState.ctx.shadowBlur=7;canvasesState.ctx.lineWidth=1.8;canvasesState.ctx.strokeStyle='#2f7df6';rr(x+.9,y+.9,w-1.8,h-1.8,Rd);canvasesState.ctx.stroke();canvasesState.ctx.restore()}

/* ---- vector icons (16x16 design space, drawn at any size) ---- */
export const ICO_N=160,ICO_RT=320;

export const ICN=fn=>{const S=12,c=cvs(16*S,16*S),g=c.getContext('2d');g.scale(S,S);g.lineJoin='round';g.lineCap='round';fn(g);const o=arcIcon(c,ICO_N);o.__vec=true;return o};

/* ---- Minecraft GUI kit: inventory panel, slots, tooltips, chat bars, pixel icons, hearts, dirt ---- */
export const INV=['#1b2230','#c9a24f','#06080c'],SLOT=['#8b8b8b'],SLOTH=['#8b8b8b','h'],SLOTX=['#6d6d6d','x'],TIPP=['tip'],CHAT=['chat'],MAPF=['#d9c393','#f4e6c0','#8a6a3a'];

/* Arcane icon finish: smooth 64 px, warm light from the top-left, cool shade bottom-right, black ink outline */
export function arcIcon(src,N){N=N||ICO_N;const pad=Math.round(N*.1),w=N-2*pad,a=cvs(N,N),ga=a.getContext('2d');ga.imageSmoothingEnabled=true;ga.imageSmoothingQuality='high';ga.drawImage(src,pad,pad,w,w);
 ga.globalCompositeOperation='source-atop';const gr=ga.createLinearGradient(0,0,N,N);gr.addColorStop(0,'rgba(255,238,196,.26)');gr.addColorStop(.48,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(10,18,48,.34)');ga.fillStyle=gr;ga.fillRect(0,0,N,N);
 const sp=ga.createRadialGradient(N*.32,N*.26,0,N*.32,N*.26,N*.42);sp.addColorStop(0,'rgba(255,250,230,.16)');sp.addColorStop(1,'rgba(255,250,230,0)');ga.fillStyle=sp;ga.fillRect(0,0,N,N);ga.globalCompositeOperation='source-over';
 const sil=(col)=>{const k=cvs(N,N),gk=k.getContext('2d');gk.drawImage(a,0,0);gk.globalCompositeOperation='source-in';gk.fillStyle=col;gk.fillRect(0,0,N,N);return k};
 /* rim light: the silhouette minus itself shifted toward the light, kept inside the shape */
 const rim=cvs(N,N),gr2=rim.getContext('2d'),rr2=Math.max(1,N/90);gr2.drawImage(sil('rgba(255,244,214,.55)'),0,0);gr2.globalCompositeOperation='destination-out';gr2.drawImage(a,rr2*1.4,rr2*1.4);gr2.globalCompositeOperation='destination-in';gr2.drawImage(a,0,0);
 const ink=sil('#0b0810'),o=cvs(N,N),go=o.getContext('2d'),r=Math.max(1.6,N/30);
 try{go.filter='blur('+(N/40).toFixed(1)+'px)';go.globalAlpha=.45;go.drawImage(ink,N/36,N/26);go.filter='none';go.globalAlpha=1}catch(e){}
 for(let i=0;i<24;i++){const t=i/24*6.2832;go.drawImage(ink,Math.cos(t)*r,Math.sin(t)*r)}go.drawImage(a,0,0);go.drawImage(rim,0,0);o.__hd=true;return o}

/* pixel art -> smooth shapes: two EPX passes (16 -> 64 px) before the painted finish */
export function epx(src){const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data,o=cvs(w*2,h*2),go=o.getContext('2d'),im=go.createImageData(w*2,h*2),D=im.data;
 const P=(x,y)=>{x=x<0?0:x>=w?w-1:x;y=y<0?0:y>=h?h-1:y;const i=(y*w+x)*4;return((d[i]<<24)|(d[i+1]<<16)|(d[i+2]<<8)|d[i+3])>>>0},put=(x,y,v)=>{const i=(y*w*2+x)*4;D[i]=v>>>24;D[i+1]=(v>>>16)&255;D[i+2]=(v>>>8)&255;D[i+3]=v&255};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=P(x,y),A=P(x,y-1),B=P(x+1,y),C=P(x-1,y),E=P(x,y+1);put(2*x,2*y,C===A&&C!==E&&A!==B?A:p);put(2*x+1,2*y,A===B&&A!==C&&B!==E?B:p);put(2*x,2*y+1,E===C&&E!==B&&C!==A?C:p);put(2*x+1,2*y+1,B===E&&B!==A&&E!==C?E:p)}
 go.putImageData(im,0,0);return o}


function mcSlot(x,y,w,h,p){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const g=canvasesState.ctx,X=p===SLOTX,H=p===SLOTH,Rd=Math.max(2,Math.min(8,w/5,h/5));
 g.fillStyle='rgba(20,35,60,.12)';rr(x,y+2,w,h,Rd+1);g.fill();
 btnAdd(x,y,w,h);g.fillStyle=X?'rgba(235,239,245,.62)':H?lgc('slh',y,h,0,'rgba(47,125,246,.22)',1,'rgba(47,125,246,.12)'):lgc('sl',y,h,0,'rgba(255,255,255,.7)',1,'rgba(240,244,250,.5)');rr(x,y,w,h,Rd);g.fill();
 g.save();if(H){g.shadowColor='rgba(47,125,246,.45)';g.shadowBlur=7}
 g.strokeStyle=X?'rgba(20,30,50,.1)':H?'#2f7df6':'rgba(20,30,50,.2)';g.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);g.stroke();g.restore()}

function mcTip(x,y,w,h){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const g=canvasesState.ctx,Rd=Math.min(UIT.rad.tip,h/3);
 g.fillStyle='rgba(0,0,0,.38)';rr(x+1,y+3,w,h,Rd+1);g.fill();g.fillStyle='rgba(12,17,26,.92)';rr(x,y,w,h,Rd);g.fill();
 g.strokeStyle=UIT.line;g.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);g.stroke()}

export function TN(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);canvasesState.ctx.textBaseline='top';canvasesState.ctx.textAlign='left';canvasesState.ctx.fillStyle=inBtn(x+1,y+1)?ink(col||'#d6b46a'):(col||'#d6b46a');canvasesState.ctx.fillText(s,x,y)}

const HRT=['.KKK.KKK.','KRRWKRRRK','KRWRRRRRK','KRRRRRRRK','.KRRRRRK.','..KRRRK..','...KRK...','....K....'];

function heart(x,y,kind,ps){const H=(c1,c2)=>{canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(x+4.5,y+7.6);canvasesState.ctx.bezierCurveTo(x+1.2,y+5.4,x-.2,y+3.4,x+.4,y+1.9);canvasesState.ctx.bezierCurveTo(x+1,y+.2,x+3.5,y-.1,x+4.5,y+1.7);canvasesState.ctx.bezierCurveTo(x+5.5,y-.1,x+8,y+.2,x+8.6,y+1.9);canvasesState.ctx.bezierCurveTo(x+9.2,y+3.4,x+7.8,y+5.4,x+4.5,y+7.6);canvasesState.ctx.closePath()};
 {canvasesState.ctx.save();const g=canvasesState.ctx.createLinearGradient(x,y,x+9,y+8);g.addColorStop(0,'#ff8a7a');g.addColorStop(.5,'#d8262a');g.addColorStop(1,'#7a0c14');H();canvasesState.ctx.fillStyle=kind?g:'#3a1418';canvasesState.ctx.fill();
  if(kind===1){canvasesState.ctx.save();H();canvasesState.ctx.clip();canvasesState.ctx.fillStyle='#3a1418';canvasesState.ctx.fillRect(x+4.5,y-1,6,10);canvasesState.ctx.restore()}if(kind){canvasesState.ctx.fillStyle='rgba(255,230,220,.55)';canvasesState.ctx.beginPath();canvasesState.ctx.ellipse(x+2.6,y+2.4,1,.7,-.6,0,6.283);canvasesState.ctx.fill()}H();canvasesState.ctx.lineWidth=1.2;canvasesState.ctx.strokeStyle='#120608';canvasesState.ctx.stroke();canvasesState.ctx.restore();return}
 ps=ps||1;ps=ps||1;for(let r=0;r<8;r++)for(let c=0;c<9;c++){const ch=HRT[r][c];if(ch==='.')continue;let col=ch==='K'?'#1a0606':'';if(!col){const full=kind===2||(kind===1&&c<=4);col=full?(ch==='W'?'#ffb0b0':'#e81c1c'):(ch==='W'?'#5a1414':'#3a0a0a')}canvasesState.ctx.fillStyle=col;canvasesState.ctx.fillRect(x+c*ps,y+r*ps,ps,ps)}}

export function hearts(x,y,f,n){n=n||10;const hv=Math.round(Math.max(0,Math.min(1,f))*n*2);for(let i=0;i<n;i++)heart(x+i*8,y,hv>=2*i+2?2:hv===2*i+1?1:0,1)}


let HDBG=null;
function hdBg(){if(HDBG)return HDBG;const N=512,c=cvs(N,N),g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data,R=rngf(4242);
 const oct=[[6,.42],[14,.24],[32,.16],[80,.1],[200,.08]].map(([p,a])=>{const v=new Float32Array(p*p);for(let i=0;i<v.length;i++)v[i]=R();return{p,a,v}});
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(const o of oct){const p=o.p,fx=x/N*p,fy=y/N*p,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),i0=ix%p,i1=(ix+1)%p,j0=iy%p,j1=(iy+1)%p,a=o.v[j0*p+i0],b=o.v[j0*p+i1],c2=o.v[j1*p+i0],e=o.v[j1*p+i1];s+=o.a*((a+(b-a)*sx)*(1-sy)+(c2+(e-c2)*sx)*sy)}
  const t=Math.max(0,Math.min(1,(s-.22)*1.75)),k=(y*N+x)*4;d[k]=22+t*40;d[k+1]=28+t*42;d[k+2]=38+t*52;d[k+3]=255}
 g.putImageData(im,0,0);return HDBG=c}

export function dirtBack(UW,UH,dark){const p=canvasesState.ctx.createPattern(hdBg(),'repeat');canvasesState.ctx.save();canvasesState.ctx.setTransform(1,0,0,1,0,0);canvasesState.ctx.imageSmoothingEnabled=true;canvasesState.ctx.fillStyle=p;canvasesState.ctx.fillRect(0,0,cv.width,cv.height);canvasesState.ctx.restore();canvasesState.ctx.fillStyle='rgba(0,0,0,'+(dark==null?.55:dark)+')';canvasesState.ctx.fillRect(0,0,UW,UH)}

export const lgr=(g,x0,y0,x1,y1,a,b)=>{const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};

export const poly=(g,pts,fill,stroke,lw)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};

export const circ=(g,x,y,r,fill,stroke,lw)=>{g.beginPath();g.arc(x,y,r,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};

export const rrg=(g,x,y,w,h,r,fill,stroke,lw)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};

export const ln=(g,x0,y0,x1,y1,col,lw)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.strokeStyle=col;g.lineWidth=lw;g.stroke()};
