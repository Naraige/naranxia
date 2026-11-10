import { newG, toGeo } from '../geometry.js';
import {
  bC,
  bL,
  bM,
  bP,
  bR,
  bS,
  bW,
  qBan,
  qBarrel,
  QBR,
  QBR2,
  qChim,
  qCone,
  qCornice,
  qCrate,
  QCU,
  qDoor,
  QFI,
  qFlag,
  qGem,
  QIR,
  qLamp,
  QLOG,
  QLOGT,
  qMerl,
  QMS,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  qRoof,
  qRound,
  QS,
  QSD,
  QSD2,
  QSL,
  qSlit,
  qStone,
  QTC,
  QTR,
  QW1,
  QW2,
  QW3,
  qWin,
  qWheel,
} from './building-parts.js';
import { structureModelsState } from './structures.js';
import { PXON } from './units.js';

/* ================= ROUND 4b: the castle, rebuilt the Minecraft way (square towers, chunky crenels, steep block roofs) =================
   A = square fortress: curtain walls, four square corner towers, a keep with a steep slate roof, a gatehouse with a portcullis
   B = great keep: one massive square keep with four corner turrets and a stepped slate spire, low walls and corner towers
   front = +z, the 5 x 5 tiles go from 0 to 5; C5.flag = where the animated flag stands */
/* wood or stone: the same castle A in logs and planks for the wooden tier */
let PXCW=false;

const pS=(G,x,y,z,w,h,d,c)=>PXCW?bW(G,x,y,z,w,h,d,(c===QTR||c===QSD2)?QW3:(c===QS[1]?QLOG:QW2)):bS(G,x,y,z,w,h,d,c);

const pSt=(G,x,y0,z,w,d,h,o)=>{if(!PXCW)return qStone(G,x,y0,z,w,d,h,o);const n=Math.max(1,Math.round(h/.2)),q=h/n;for(let k=0;k<n;k++)bW(G,x,y0+k*q,z,w,q,d,k%2?QW1:QW2)};

const pQu=(G,x0,z0,x1,z1,y0,h)=>{if(!PXCW)return qQuoin(G,x0,z0,x1,z1,y0,h)};

function pxCastleMer(G,x0,z0,x1,z1,y,s){s=s||.26;const put=(x,z)=>{pS(G,x,y,z,s,s,s,QS[1]);pS(G,x,y+s,z,s+.03,.03,s+.03,QTR)};
 const nx=Math.max(1,Math.round((x1-x0)/(s*2))),nz=Math.max(1,Math.round((z1-z0)/(s*2)));
 for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx;put(x,z0);put(x,z1)}for(let j=1;j<nz;j++){const z=z0+(z1-z0)*j/nz;put(x0,z);put(x1,z)}}

function pxCastleGate(G,gz1){const ax0=2.5,aw=.82,ah=1.25,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.6,.12,.06,'#18171c');
 for(const s of[-1,1]){pS(G,ax0+s*(aw/2+.06),.2,az,.12,ah+.12,.06,QTR)}pS(G,ax0,.32+ah,az,aw+.24,.14,.06,QTR);
 for(let i=0;i<6;i++)bP(G,ax0-aw/2+.08+i*(aw-.16)/5,.6,az-.035,.03,ah-.42,.03,QIR);for(const y of[.75,1.15])bP(G,ax0,y,az-.035,aw-.06,.03,.03,QIR);
 pS(G,ax0,.2,az+.14,aw+.3,.04,.3,QSD2);for(const s of[-1,1])qLamp(G,2.5+s*.62,1.45,gz1+.1,true)}

function pxCastleA(wood){PXCW=!!wood;const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)pS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.3,TH=.5;const cw=(x,z,w,d)=>{pSt(G,x,.2,z,w,d,WT-.2,{moss:1});pS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.3,3.4,TH);cw(.3,2.5,TH,3.4);cw(4.7,2.5,TH,3.4);cw(1.05,4.7,1.1,TH);cw(3.95,4.7,1.1,TH);
 pxCastleMer(G,.9,.08,4.1,.08,WT+.08);pxCastleMer(G,.08,.9,.08,4.1,WT+.08);pxCastleMer(G,4.92,.9,4.92,4.1,WT+.08);
 for(const z of[1.4,2.5,3.6]){qSlit(G,.045,1.2,z,false);qSlit(G,4.955,1.2,z,false)}
 /* square corner towers with a cornice, chunky crenels, banners on the front pair */
 for(const[x,z]of[[.65,.65],[4.35,.65],[.65,4.35],[4.35,4.35]]){const bk=z<2.5,H=bk?3.9:3.4,W=1.25,ox=x<2.5?-1:1,oz=z<2.5?-1:1;
  qPlinth(G,x,0,z,W+.12,W+.12,.2);pSt(G,x,.2,z,W,W,H-.2,{moss:1,ph:bk?1:0});pQu(G,x-W/2,z-W/2,x+W/2,z+W/2,.2,H-.2);
  pS(G,x,H,z,W+.18,.12,W+.18,QTR);pS(G,x,H+.12,z,W+.1,.06,W+.1,QSD2);pxCastleMer(G,x-W/2-.04,z-W/2-.04,x+W/2+.04,z+W/2+.04,H+.12,.28);
  qSlit(G,x+ox*(W/2+.005),1.3,z,false);qSlit(G,x,1.3,z+oz*(W/2+.005),true);qWin(G,x+ox*(W/2+.012),2.6,z,false,ox,{w:.16,h:.24,glow:1});qWin(G,x,2.6,z+oz*(W/2+.012),true,oz,{w:.16,h:.24,glow:1});
  if(!bk)qBan(G,x,H-.95,z+W/2+.03,true,1,.36,.8);else qFlag(G,x,H+.18,z,.8)}
 /* keep: square, steep slate gable roof with dormers, banners, a door */
 const kx=2.5,kz=1.75,KW=2.2,KD=1.9,KH=3.9;qPlinth(G,kx,.2,kz,KW+.12,KD+.12,.12);pSt(G,kx,.32,kz,KW,KD,KH-.32,{ph:1});pQu(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.32,KH-.32);
 pS(G,kx,KH,kz,KW+.16,.1,KD+.16,QTR);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){const L=ax?KW:KD;for(const o of[-.3,.3]){const w=o*L;qWin(G,ax?x+w:x+n*.012,2.7,ax?z+n*.012:z+w,ax,n,{w:.18,h:.34,glow:1})}}
 qDoor(G,kx,kz+KD/2+.016,true,1,{y:.32,w:.5,h:.8,wood:1});qBan(G,kx-.7,1.6,kz+KD/2+.04,true,1,.3,.7);qBan(G,kx+.7,1.6,kz+KD/2+.04,true,1,.3,.7);
 const rt=qRoof(G,kx,kz,KW+.1,KD+.1,KH+.1,PXCW?QSH:QSL,true,{rise:.3,run:.17});C5.flag=(typeof rt==='number'?rt:KH+1.9)+.05;C5.wflag=C5.flag;
 pS(G,kx-.55,KH+.1,kz+.5,.1,.9,.1,QSD);qFlag(G,kx,C5.flag-.05,kz,.9);
 /* gatehouse: a square block over the gate, crenellated, the arms of the kingdom */
 const gz0=4.15,gz1=5.05,GH=3.0,gzc=(gz0+gz1)/2;pSt(G,2.5,.2,gzc,1.9,gz1-gz0,GH-.2,{moss:1,ph:2});pQu(G,1.55,gz0,3.45,gz1,.2,GH-.2);
 pS(G,2.5,GH,gzc,2.06,.12,gz1-gz0+.12,QTR);pxCastleMer(G,1.5,gz0-.02,3.5,gz1+.04,GH+.12,.26);pxCastleGate(G,gz1);qBan(G,2.5,1.75,gz1+.04,true,1,.4,.75);
 qBarrel(G,3.3,3.2,.22);qBarrel(G,3.5,3.0,.22);qCrate(G,1.6,3.0,.22,.26);for(const[x,z]of[[1.6,3.9],[3.4,3.9]])qPost(G,x,.22,z,.55,true);
 /* courtyard life: a covered well, a hay cart; the keep's chimney smokes */
 {const wx=1.25,wz=3.5;qRound(G,wx,wz,.22,.26,.5);bP(G,wx,.46,wz,.3,.02,.3,'#2a4a7a');for(const s of[-1,1])bW(G,wx+s*.22,.22,wz,.05,.72,.05,QW2);bW(G,wx,.86,wz,.5,.05,.06,QW2);qPyr(G,wx,wz,.92,.62,.44,PXCW?QSH:QSL,.09,.09);bP(G,wx,.6,wz,.012,.26,.012,'#d9c28a');bW(G,wx,.52,wz,.08,.08,.08,QW1)}
 {const hx=3.7,hz=3.6;bW(G,hx,.36,hz,.5,.05,.34,QW1);bC(G,hx,.41,hz,.44,.2,.3,'#d8b23a');qWheel(G,hx-.12,.34,hz+.19,.12,true);qWheel(G,hx-.12,.34,hz-.19,.12,true);bW(G,hx+.36,.36,hz,.3,.03,.04,QW3)}
 qChim(G,kx+.72,kz+.34,KH+.1,1.72);
 return toGeo(G)}

function pxCastleB(){const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=1.7,TH=.4;const cw=(x,z,w,d)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});bS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.22,3.8,TH);cw(.22,2.5,TH,3.8);cw(4.78,2.5,TH,3.8);cw(1.0,4.78,1.2,TH);cw(4.0,4.78,1.2,TH);
 pxCastleMer(G,.8,.04,4.2,.04,WT+.08,.24);pxCastleMer(G,.04,.8,.04,4.2,WT+.08,.24);pxCastleMer(G,4.96,.8,4.96,4.2,WT+.08,.24);
 for(const[x,z]of[[.5,.5],[4.5,.5],[.5,4.5],[4.5,4.5]]){const W=.95,H=2.5;qStone(G,x,.2,z,W,W,H-.2,{moss:1});bS(G,x,H,z,W+.14,.1,W+.14,QTR);pxCastleMer(G,x-W/2-.03,z-W/2-.03,x+W/2+.03,z+W/2+.03,H+.1,.24)}
 /* the great keep */
 const kx=2.5,kz=2.2,KW=2.7,KH=4.6;qPlinth(G,kx,.2,kz,KW+.14,KW+.14,.14);qStone(G,kx,.34,kz,KW,KW,KH-.34,{ph:1});qQuoin(G,kx-KW/2,kz-KW/2,kx+KW/2,kz+KW/2,.34,KH-.34);
 for(const y of[1.6,3.1])bS(G,kx,y,kz,KW+.08,.08,KW+.08,QTR);bS(G,kx,KH,kz,KW+.2,.12,KW+.2,QTR);pxCastleMer(G,kx-KW/2-.06,kz-KW/2-.06,kx+KW/2+.06,kz+KW/2+.06,KH+.12,.3);
 for(const[x,z,ax,n]of[[kx,kz+KW/2,true,1],[kx,kz-KW/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){for(const o of[-.65,0,.65]){qWin(G,ax?x+o:x+n*.012,3.55,ax?z+n*.012:z+o,ax,n,{w:.18,h:.36,glow:1})}qWin(G,ax?x-.6:x+n*.012,2.1,ax?z+n*.012:z-.6,ax,n,{w:.16,h:.3,glow:1});qWin(G,ax?x+.6:x+n*.012,2.1,ax?z+n*.012:z+.6,ax,n,{w:.16,h:.3,glow:1})}
 qDoor(G,kx,kz+KW/2+.016,true,1,{y:.34,w:.56,h:.86,wood:1});qBan(G,kx-.85,2.3,kz+KW/2+.04,true,1,.34,.9);qBan(G,kx+.85,2.3,kz+KW/2+.04,true,1,.34,.9);
 /* corner turrets with stepped slate roofs, the stepped spire in the middle */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=kx+a*(KW/2-.05),z=kz+b*(KW/2-.05),W=.72,H=KH+.9;qStone(G,x,KH-.4,z,W,W,H-KH+.4,{ph:2});bS(G,x,H,z,W+.12,.08,W+.12,QTR);qPyr(G,x,z,H+.08,W+.16,W+.16,QSL,.16,.09)}
 const sb=KH+.12,SW=1.3;qStone(G,kx,sb,kz,SW,SW,.9,{ph:1});for(const[x,z,ax,n]of[[kx,kz+SW/2,true,1],[kx+SW/2,kz,false,1],[kx-SW/2,kz,false,-1],[kx,kz-SW/2,true,-1]])qWin(G,x+(ax?0:n*.012),sb+.3,z+(ax?n*.012:0),ax,n,{w:.2,h:.36,glow:1});
 const kt=qPyr(G,kx,kz,sb+.9,SW+.2,SW+.2,QSL,.2,.1);C5.flag=(typeof kt==='number'?kt:sb+2.2)+.05;qFlag(G,kx,C5.flag-.05,kz,.9);
 /* small gatehouse */
 const gz0=4.35,gz1=5.05,GH=2.3;qStone(G,2.5,.2,(gz0+gz1)/2,1.7,gz1-gz0,GH-.2,{moss:1});bS(G,2.5,GH,(gz0+gz1)/2,1.84,.1,gz1-gz0+.12,QTR);pxCastleMer(G,1.62,gz0,3.38,gz1+.03,GH+.1,.24);pxCastleGate(G,gz1);
 return toGeo(G)}

/* ---- castle helpers: round masonry from three boxes (a near-circular outline), smooth cones, merlon rings ---- */
export function qCyl(G,f,x,z,y0,h,D,c){f(G,x,y0,z,D,h,D*.4,c);f(G,x,y0,z,D*.4,h,D,c);f(G,x,y0,z,D*.72,h,D*.72,c)}

export function qTowR(G,x,z,y0,h,D,o){o=o||{};const n=Math.max(1,Math.round(h/.21)),q=h/n;for(let k=0;k<n;k++)qCyl(G,bS,x,z,y0+k*q,q,D,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}

export function qSpire(G,x,z,y0,D,H,cols,o){o=o||{};const n=Math.max(3,Math.round(H/.1)),q=H/n,b=o.band||2;qCyl(G,bR,x,z,y0-.05,.07,D+.1,o.eave||cols[0]);
 for(let k=0;k<n;k++){const w=Math.max(.05,D*(1-(k+.35)/n)),c=cols[((k/b)|0)%cols.length];if(o.sq)bR(G,x,y0+k*q,z,w,q,w,c);else qCyl(G,bR,x,z,y0+k*q,q,w,c)}return y0+H}

function qMerlR(G,x,z,y,D,n,h){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.065,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y,pz,.13,h,.13,QS[k%2]);bS(G,px,y+h,pz,.15,.03,.15,QTR)}}

export function qCorbR(G,x,z,y,D,n){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.01,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y-.13,pz,.09,.13,.09,QSD);bS(G,px,y-.2,pz,.06,.07,.06,QSD2)}}

export function qMerlL(G,x0,z0,x1,z1,y,h,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/step));for(let k=0;k<=n;k+=2){const t=k/n,px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;bS(G,px,y,pz,.14,h,.14,QS[(k/2)%2]);bS(G,px,y+h,pz,.16,.03,.16,QTR)}}

/* ---- castle (stone): a tall keep with a lantern belfry under a copper spire, four round towers with slate cones,
   crenellated curtain walls and a gatehouse with a portcullis; front = +z ---- */
export function castleGeo(){const G=newG();qPlinth(G,1.5,0,1.5,3,3,.2);
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
  qCorbR(G,x,z,Ht+.02,D+.14,10);qTowR(G,x,z,Ht,.32,D+.14,{ph:2});qCyl(G,bS,x,z,Ht+.32,.05,D+.18,QTR);qCyl(G,bC,x,z,Ht+.37,.05,D+.16,structureModelsState.BLU);
  const t=qSpire(G,x,z,Ht+.42,D+.12,bk?1.85:1.6,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.08,.1,.08,QBR2);bP(G,x,t+.1,z,.035,.42,.035,QIR);bM(G,x,t+.5,z,.06,.06,.06,QBR2);
  qSlit(G,x+ox*(D/2+.005),1.25,z,false);qSlit(G,x,1.25,z+oz*(D/2+.005),true);qSlit(G,x+ox*(D/2+.005),2.35,z,false);qSlit(G,x,2.35,z+oz*(D/2+.005),true);
  qWin(G,x+ox*(D/2+.075),Ht+.08,z,false,ox,{w:.11,h:.16,glow:1});qWin(G,x,Ht+.08,z+oz*(D/2+.075),true,oz,{w:.11,h:.16,glow:1})}
 /* keep */
 const kx=1.5,kz=1.18,KW=1.34,KD=1.3,KH=4.45;qPlinth(G,kx,.2,kz,KW+.1,KD+.1,.1);qStone(G,kx,.3,kz,KW,KD,KH-.3,{ph:1});qQuoin(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.3,KH-.3);
 qCornice(G,kx,2.62,kz,KW+.06,KD+.06,.06);
 for(let i=0;i<7;i++){const a=-KW/2+.1+i*(KW-.2)/6;bS(G,kx+a,KH-.14,kz+KD/2+.04,.09,.14,.09,QSD);bS(G,kx+a,KH-.14,kz-KD/2-.04,.09,.14,.09,QSD);const b=-KD/2+.1+i*(KD-.2)/6;bS(G,kx+KW/2+.04,KH-.14,kz+b,.09,.14,.09,QSD);bS(G,kx-KW/2-.04,KH-.14,kz+b,.09,.14,.09,QSD)}
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.24,{ph:3});qCornice(G,kx,KH+.24,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.29,kz,KW+.12,.04,KD+.12,structureModelsState.BLU);
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
const QTH = ['#c9a35c','#b8924c','#d4b06c'];
export const QSH = ['#6e5236','#5e4630','#7a5c3c'];

export function woodCastleGeo(){const G=newG();bP(G,1.5,0,1.5,3,.2,3,'#5a4a32');bP(G,1.5,.2,1.5,2.92,.06,2.92,'#75664a');
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
export const C5={kx:2.5,kz:1.6,flag:8.9,wflag:6.2};

export function castleGeo5(){if(PXON)return (window.__CV==='B'?pxCastleB:pxCastleA)(false);const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
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
  qCorbR(G,x,z,Ht+.02,D+.16,12);qTowR(G,x,z,Ht,.34,D+.16,{ph:2});qCyl(G,bS,x,z,Ht+.34,.05,D+.2,QTR);qCyl(G,bC,x,z,Ht+.39,.05,D+.18,structureModelsState.BLU);
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
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.26,{ph:3});qCornice(G,kx,KH+.26,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.31,kz,KW+.12,.04,KD+.12,structureModelsState.BLU);
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
export function woodCastleGeo5(){if(PXON&&window.__CV!=='B'){const r=pxCastleA(true);PXCW=false;return r}const G=newG();bP(G,2.5,0,2.5,5,.2,5,'#5a4a32');bP(G,2.5,.2,2.5,4.92,.06,4.92,'#75664a');
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

export function keepGeo(wd){const G=newG();
 if(!wd){qPlinth(G,1,0,1,2,2,.2);qStone(G,1,.2,1,1.8,1.8,3.2,{moss:1});qQuoin(G,.1,.1,1.9,1.9,.2,3.2);qRing(G,1,1,1.9,1.84,.05,QBR,bM);
  for(const[x,z,ax,n]of[[1,1.9,true,1],[1,.1,true,-1],[1.9,1,false,1],[.1,1,false,-1]]){qWin(G,x,2.3,z+n*.01,ax,n,{w:.22,h:.34,glow:1});qSlit(G,ax?x-.5:x+n*.01,1.3,ax?z+n*.01:z-.5,ax);qSlit(G,ax?x+.5:x+n*.01,1.3,ax?z+n*.01:z+.5,ax);qGem(G,ax?x:x+n*.012,2.85,ax?z+n*.012:z,ax,n,.1)}
  bS(G,1,3.4,1,1.94,.1,1.94,QSD);bS(G,1,3.5,1,2.0,.2,2.0,QS[1]);qCornice(G,1,3.7,1,2.04,2.04,.04);qMerl(G,0,0,2,2,3.74,.22,.3);
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){qRound(G,x,z,3.5,.8,.5);qRing(G,x,z,4.3,.56,.05,structureModelsState.BLU,bC);qRing(G,x,z,4.35,.56,.03,QBR,bM);const t=qCone(G,x,z,4.38,.58,QSL,.14);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.916,true,1,{y:.2,w:.36,h:.66,lamp:1,hex:1});qBan(G,.5,1.62,1.9,true,1);qBan(G,1.5,1.62,1.9,true,1)}
 else{bP(G,1,0,1,2,.2,2,'#5a4a32');for(let k=0;k<12;k++){const y=.2+k*.27,c=k%2?QLOG:'#58402a';bW(G,1,y,1,1.84,.27,1.7,c);bW(G,1,y,1,1.7,.27,1.84,c)}
  for(const[a,b]of[[.1,.1],[1.9,.1],[.1,1.9],[1.9,1.9]]){bW(G,a,.2,b,.22,3.3,.22,QLOGT);for(const y of[.9,2.2])bP(G,a,y,b,.24,.05,.24,QIR)}
  bW(G,1,3.44,1,2.04,.12,2.04,QW3);for(let i=0;i<9;i++){const t=.1+i*.225;for(const[x,z]of[[t,.04],[t,1.96],[.04,t],[1.96,t]])bW(G,x,3.56,z,.08,.3,.08,QW2)}
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){const t=qPyr(G,x,z,3.86,.62,.62,QTC,.14,.08);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.936,true,1,{y:.2,w:.34,h:.62,wood:1,lamp:1});for(const x of[.5,1.5])qWin(G,x,1.6,1.936,true,1,{wood:1,shut:1});qBan(G,1,2.6,1.92,true,1,.3,.5)}
 return toGeo(G)}
