import { hex } from '../core/math.js';
import { THREE } from './three.js';
import { EMBART, EMBG, EMBNAME } from './emblem-art.js';
import { BANNER, bannerTex } from './structures.js';
import { canvasesState, cvs } from '../ui/canvases.js';
import { circ, ICN, ln, poly } from '../ui/drawing.js';
import { IC, thIcons } from '../ui/icons.js';
import { PAL, THEME } from '../ui/kingdom-theme.js';

/* ---- kingdom banner & emblems: pixel art, drawn on a grid and blitted at a whole number of screen pixels per art pixel ----
   Visual only (THEME lives in localStorage, never in a save or a co-op message). The emblem index is what THEME.e stores: the art list is append only. */
export const EMB=EMBART;
export { EMBNAME };

export const lighten=(c,k)=>{const h=hex(c);return '#'+h.map(v=>Math.round(v+(255-v)*k).toString(16).padStart(2,'0')).join('')};
/* tone: k > 0 towards white, k < 0 towards black */
export const tone=(c,k)=>k>=0?lighten(c,k):'#'+hex(c).map(v=>Math.round(v*(1+k)).toString(16).padStart(2,'0')).join('');

const METAL={g:{o:'#3a2406',h:'#fff6c4',l:'#ffd860',m:'#e8b030',d:'#a8701a',w:'#c79a62',u:'#a37645',v:'#70502c'},
 s:{o:'#1c2232',h:'#ffffff',l:'#e4e9f2',m:'#b8c2d2',d:'#7c879c',w:'#c79a62',u:'#a37645',v:'#70502c'}};
const embMetal=c=>c===3||c===10||c===11?'s':'g';

/* sprites: paint(put) draws on a gw x gh grid, put(x, y, colour, w, h); one canvas per key and scale k */
const SPR=new Map();
function sprite(key,gw,gh,k,paint){const id=key+'@'+k;let c=SPR.get(id);if(c)return c;if(SPR.size>600)SPR.clear();
 c=cvs(gw*k,gh*k);const q=c.getContext('2d');paint((x,y,col,w,h)=>{q.fillStyle=col;q.fillRect(x*k,y*k,(w||1)*k,(h||1)*k)});SPR.set(id,c);return c}
/* draws a sprite centred in the box (x, y, w, h) of the current canvas, as large as a whole scale allows (crisp pixels); smaller than the grid: smooth downscale */
function drawPx(key,gw,gh,paint,x,y,w,h){const g=canvasesState.ctx,t=g.getTransform(),k=Math.floor(Math.min(w*t.a/gw,h*t.d/gh)+1e-4);
 if(k<1){const im=sprite(key,gw,gh,4,paint),sc=Math.min(w/gw,h/gh);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,x+(w-gw*sc)/2,y+(h-gh*sc)/2,gw*sc,gh*sc);return}
 const im=sprite(key,gw,gh,k,paint);g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.drawImage(im,Math.round(t.e+(x+w/2)*t.a-im.width/2),Math.round(t.f+(y+h/2)*t.d-im.height/2));g.restore()}
/* device-pixel rectangle of a box of the current canvas, and u = the size of one "UI pixel" (at least 1 screen pixel) */
function devBox(x,y,w,h){const t=canvasesState.ctx.getTransform(),X=Math.round(t.e+x*t.a),Y=Math.round(t.f+y*t.d);return{X,Y,W:Math.round(t.e+(x+w)*t.a)-X,H:Math.round(t.f+(y+h)*t.d)-Y,u:Math.max(1,Math.round(t.a/2))}}

const embPaint=(e,m,ox,oy)=>put=>{const r=EMBART[e]||EMBART[0],P=METAL[m];for(let y=0;y<EMBG;y++)for(let x=0;x<EMBG;x++){const c=r[y][x];if(c!=='.')put(x+(ox|0),y+(oy|0),P[c])}};
export function drawEmblemR(x,y,s,e,c){const m=embMetal(c==null?THEME.c:c);drawPx('e'+e+m,EMBG,EMBG,embPaint(e,m),x,y,s,s)}

/* field patterns, in banner units (32 x 48, u v = pixel centres, d = distance to the edge of the cloth); slopes are 1:1 so the steps stay regular */
const patAt=(p,u,v,d)=>p===1?u>=16:p===2?v>=14+Math.abs(u-16)&&v<22+Math.abs(u-16):p===3?v-u>=-8&&v-u<4:p===4?(u<16)===(v<18):p===5?v>=13&&v<23:p===6?d<=5:p===7?Math.abs(v-1-u)<3.2||Math.abs(v-33+u)<3.2:false;

/* cloth: mask(x, y) on a gw x gh grid -> distance map (1 = edge pixel), 0 outside */
function clothDist(gw,gh,mask){const D=new Uint8Array(gw*gh),at=(x,y)=>x>=0&&y>=0&&x<gw&&y<gh&&mask(x,y);let q=[];
 for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)if(at(x,y)&&!(at(x-1,y)&&at(x+1,y)&&at(x,y-1)&&at(x,y+1))){D[y*gw+x]=1;q.push(x,y)}
 for(let n=2;q.length;n++){const nq=[];for(let i=0;i<q.length;i+=2)for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=q[i]+a,y=q[i+1]+b;if(at(x,y)&&!D[y*gw+x]){D[y*gw+x]=n;nq.push(x,y)}}q=nq}
 return D}

/* the banner: 32 x 42 art pixels. Gold rod with finials, swallow-tailed cloth (dark edge, light trim, field in 3 stepped tones, pattern in the 2nd colour),
   the emblem with a hard shadow. */
const BW=32,BH=42,bMask=(x,y)=>x>=1&&x<=30&&y>=3&&y<=33+Math.floor(Math.abs(x-15.5)/2);
let BDIST=null;
const bannerPaint=(T)=>put=>{const p=PAL[T.c][1],s=PAL[T.c][2],c2=PAL[T.c2|0][1],pt=T.p|0,D=BDIST||(BDIST=clothDist(BW,BH,bMask)),edge=tone(p,-.6);
 const sh=y=>y<11?.14:y<27?0:y<34?-.14:-.26;
 for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const d=D[y*BW+x];if(!d)continue;
  put(x,y,d===1?edge:d===2?tone(s,Math.min(0,sh(y))):tone(pt&&patAt(pt,x+.5,y+.5,d-2)?c2:p,sh(y)))}
 for(let x=2;x<=29;x++)put(x,4,'rgba(0,0,0,.28)');
 const e=T.e|0,r=EMBART[e]||EMBART[0];for(let y=0;y<EMBG;y++)for(let x=0;x<EMBG;x++)if(r[y][x]!=='.'&&D[(y+7)*BW+x+5]>1)put(x+5,y+7,'rgba(0,0,0,.3)');
 embPaint(e,embMetal(T.c),4,6)(put);
 put(0,0,'#3a2406',BW,4);put(1,1,'#ffe07a',BW-2,1);put(1,2,'#c8922a',BW-2,1);
 for(const fx of[0,BW-3]){put(fx,0,'#3a2406',3,5);put(fx+1,1,'#fff6c4');put(fx+1,2,'#e8b030');put(fx+1,3,'#a8701a')}};
const themeKey=T=>'b'+T.c+'.'+(T.c2|0)+'.'+(T.p|0)+'.'+(T.e|0);

/* the texture used on buildings, in the HUD and in the save list: 128 x 192, 4 screen pixels per art pixel */
export function drawBanner(){const g=BANNER.getContext('2d');g.clearRect(0,0,BANNER.width,BANNER.height);g.imageSmoothingEnabled=false;g.drawImage(sprite(themeKey(THEME),BW,BH,4,bannerPaint(THEME)),0,0)}
/* the same banner, crisp, as large as the box allows (New kingdom preview) */
export function drawBannerPx(x,y,w,h){drawPx(themeKey(THEME),BW,BH,bannerPaint(THEME),x,y,w,h)}

export function saveTheme(){try{localStorage.setItem('dk_theme',JSON.stringify(THEME))}catch(e){}}

/* pattern tile: a small heater shield (20 x 22) showing the top of the banner field */
const SW=20,SH=22,sHW=[10,10,10,10,10,10,10,10,10,10,10,10,10,9,9,8,7,6,5,4,3,1],sMask=(x,y)=>Math.abs(x-9.5)<sHW[y];
let SDIST=null;
export function patternTile(x,y,s,pt){const p=PAL[THEME.c][1],c2=PAL[THEME.c2|0][1];
 drawPx('p'+pt+'.'+THEME.c+'.'+(THEME.c2|0),SW,SH,put=>{const D=SDIST||(SDIST=clothDist(SW,SH,sMask)),edge=tone(p,-.62);
  for(let yy=0;yy<SH;yy++)for(let xx=0;xx<SW;xx++){const d=D[yy*SW+xx];if(!d)continue;
   put(xx,yy,d===1?edge:tone(pt&&patAt(pt,(xx+.5)*1.6,(yy+.5)*1.6+2,(d-1)*1.6)?c2:p,yy<5?.14:yy<14?0:-.14))}},x,y,s,s)}

/* option slot: dark inset square with a 1 px bevel, filled with col */
export function slotBox(x,y,s,col){const g=canvasesState.ctx,{X,Y,W,H,u}=devBox(x,y,s,s);g.save();g.setTransform(1,0,0,1,0,0);
 g.fillStyle='#05060a';g.fillRect(X,Y,W,H);g.fillStyle=col;g.fillRect(X+u,Y+u,W-2*u,H-2*u);
 g.fillStyle='rgba(255,255,255,.2)';g.fillRect(X+u,Y+u,W-2*u,u);g.fillRect(X+u,Y+u,u,H-2*u);g.fillStyle='rgba(0,0,0,.34)';g.fillRect(X+u,Y+H-2*u,W-2*u,u);g.fillRect(X+W-2*u,Y+u,u,H-2*u);g.restore()}
/* selected option: a gold pixel ring (light top and left, deep gold bottom and right, dark outline, bright corner studs) */
export function selRing(x,y,w,h){const g=canvasesState.ctx,{X,Y,W,H,u}=devBox(x,y,w,h),o=3*u,fr=(a,b,ww,hh,t,c1,c2)=>{g.fillStyle=c1;g.fillRect(a,b,ww,t);g.fillRect(a,b,t,hh);g.fillStyle=c2;g.fillRect(a,b+hh-t,ww,t);g.fillRect(a+ww-t,b,t,hh)};
 g.save();g.setTransform(1,0,0,1,0,0);fr(X-o,Y-o,W+2*o,H+2*o,u,'#1a1204','#1a1204');fr(X-2*u,Y-2*u,W+4*u,H+4*u,2*u,'#ffe07a','#c8922a');
 g.fillStyle='#fff6c4';for(const[a,b]of[[X-2*u,Y-2*u],[X+W,Y-2*u],[X-2*u,Y+H],[X+W,Y+H]])g.fillRect(a,b,2*u,2*u);g.restore()}

/* colour swatch: a cut gem, 12 x 12; left = colour of the left half (2nd colour row: the main colour) */
const GEM=['...oooooo...','..ollllllo..','.olhhlllmmo.','olhhllmmmmdo','olhllmmmmmdo','ollmmmmmmddo','olmmmmmmmddo','olmmmmmmdddo','ommmmmmddddo','.ommmddddeo.','..oddddeeo..','...oooooo...'];
const gemPal=c=>({o:tone(c,-.68),h:lighten(c,.72),l:lighten(c,.34),m:c,d:tone(c,-.26),e:tone(c,-.42)});
export function gemSwatch(x,y,s,col,left){drawPx('g'+col+(left||''),12,12,put=>{const A=gemPal(col),B=left?gemPal(left):A;
 for(let yy=0;yy<12;yy++)for(let xx=0;xx<12;xx++){const c=GEM[yy][xx];if(c!=='.')put(xx,yy,(xx<6?B:A)[c])}},x,y,s,s)}

export function initializeKingdomBanner() {
  thIcons();
  bannerTex.magFilter=THREE.NearestFilter;
  drawBanner();
  bannerTex.needsUpdate=true;

  IC.gear=ICN(g=>{for(let k=0;k<8;k++){const a=k*Math.PI/4;ln(g,8+Math.cos(a)*4.5,8+Math.sin(a)*4.5,8+Math.cos(a)*7,8+Math.sin(a)*7,'#f6e9d2',2.6)}circ(g,8,8,5,'#f6e9d2','#2a303a',.8);circ(g,8,8,2,'#2a303a','#2a303a',.5)});
  IC.upgrade=ICN(g=>{poly(g,[[8,1.5],[14,8],[10,8],[10,14.5],[6,14.5],[6,8],[2,8]],'#ffd23c','#7a5a00',.9)});
}
