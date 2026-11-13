import { bxm } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { structureModelsState } from './structures.js';

/* ================= Medieval Minecraft buildings: timber frames, stone bricks, steep roofs =================
   (these declarations replace the earlier building models; footprints, door sides and heights are unchanged) */
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
export let bS;
export let bW;
export let bP;
export let bM;
export let bL;
export let bR;
export let bC;
export let bG;

export const QS = ['#d6c196','#cbb58a','#dfcba2','#c4ad82'];
export const QSD = '#9b8565';
export const QSD2 = '#7f6c52';
export const QTR = '#ebdab2';
export const QW1 = '#7a5333';
export const QW2 = '#5a3b23';
export const QW3 = '#9a6c40';
const QPL = '#efe3c6';
export const QIR = '#3b3b45';
export const QBR = '#c9a24f';
export const QBR2 = '#e8c873';
export const QHX = '#62e4ff';
export const QFI = '#ffb24a';
const QGL = '#a9cbd9';
export const QSL = ['#66615f','#5b5755','#716c69'];
export const QCU = ['#3f7e74','#376f67','#4a8b81'];
export const QTC = ['#a8563c','#954a33','#b66246'];
export const QMS = '#6c8a4c';
const QBK = ['#9a5442','#87493a'];
export const QLOG = '#6b4a2c';
export const QLOGT = '#a8814f';

export const qab=(f,G,dx,dz,t,l,y,a,b,h,c)=>f(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);

export const qP=(G,x,y,z,ax,n)=>(f,dx,dy,dn,w,h,dd,c)=>ax?f(G,x+dx,y+dy,z+n*dn,w,h,dd,c):f(G,x+n*dn,y+dy,z+dx,dd,h,w,c);

export function qStone(G,x,y0,z,w,d,h,o){o=o||{};const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k++)bS(G,x,y0+k*q,z,w,q,d,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}

export function qPlinth(G,x,y0,z,w,d,h){bS(G,x,y0,z,w,h,d,QSD);bS(G,x,y0+h,z,w-.04,.04,d-.04,QSD2)}

export function qCornice(G,x,y,z,w,d,h){bS(G,x,y,z,w,h||.07,d,QTR)}

export function qQuoin(G,x0,z0,x1,z1,y0,h){const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k+=2)for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bS(G,x,y0+k*q,z,.13,q,.13,QTR)}

export function qWin(G,x,y,z,ax,n,o){o=o||{};const W=o.w||.2,H=o.h||.3,P=qP(G,x,y,z,ax,n),mf=o.wood?bW:bS,fr=o.wood?QW2:QTR,gc=o.glow?'#ffd98c':QGL,gf=o.glow?bL:bG;
 P(gf,0,0,0,W,H,.03,gc);P(gf,0,H,0,W*.56,.05,.03,gc);
 P(mf,0,-.05,.012,W+.1,.05,.06,fr);P(mf,-W/2-.03,0,.012,.05,H,.05,fr);P(mf,W/2+.03,0,.012,.05,H,.05,fr);
 P(mf,-W*.36,H,.012,W*.3,.05,.05,fr);P(mf,W*.36,H,.012,W*.3,.05,.05,fr);P(mf,0,H+.05,.012,W*.62,.05,.05,fr);if(!o.wood)P(bS,0,H+.08,.018,.07,.07,.06,QTR);
 P(bP,0,0,.016,.022,H,.02,QIR);P(bP,0,H*.5,.016,W,.02,.02,QIR);
 if(o.shut){P(bW,-W/2-.1,0,.022,.1,H,.03,o.sc||QW1);P(bW,W/2+.1,0,.022,.1,H,.03,o.sc||QW1)}
 if(o.box){P(bW,0,-.12,.06,W+.08,.07,.1,QW2);[[-.06,'#c8282a'],[0,'#f0d020'],[.06,'#e05a8a']].forEach(([a,c])=>P(bP,a,-.05,.06,.045,.05,.045,c));P(bP,-.03,-.05,.07,.03,.04,.03,'#4a8e32');P(bP,.03,-.05,.07,.03,.04,.03,'#4a8e32')}}

export function qLamp(G,x,y,z,hex){bP(G,x,y+.06,z,.02,.06,.02,QIR);bM(G,x,y+.04,z,.1,.025,.1,QBR);bL(G,x,y-.06,z,.07,.1,.07,hex?QHX:QFI);bM(G,x,y-.09,z,.1,.03,.1,QBR);bM(G,x,y-.12,z,.03,.03,.03,QBR)}

export function qPost(G,x,y,z,h,hex){bS(G,x,y,z,.16,.1,.16,QSD);bM(G,x,y+.1,z,.05,h,.05,QBR);bM(G,x,y+.1+h,z,.12,.03,.12,QBR);bL(G,x,y+.13+h,z,.09,.12,.09,hex?QHX:QFI);bM(G,x,y+.25+h,z,.12,.03,.12,QBR);bM(G,x,y+.28+h,z,.04,.06,.04,QBR)}

export function qDoor(G,x,z,ax,n,o){o=o||{};const y0=o.y==null?.18:o.y,W=o.w||.32,H=o.h||.56,P=qP(G,x,y0,z,ax,n),fr=o.wood?bW:bS,fc=o.wood?QW2:QTR;
 P(fr,0,0,0,W+.12,H+.06,.04,fc);P(fr,0,H+.06,0,W*.78,.06,.05,fc);if(!o.wood)P(bS,0,H+.1,.006,.1,.08,.06,QTR);
 P(bW,0,0,.012,W,H,.04,o.c||QW1);P(bW,0,H,.012,W*.62,.05,.04,o.c||QW1);for(const a of[-W/3,0,W/3])P(bW,a,0,.03,.015,H,.01,QW2);
 P(bP,0,H*.22,.035,W,.035,.01,QIR);P(bP,0,H*.72,.035,W,.035,.01,QIR);P(bM,W*.3,H*.45,.04,.045,.045,.03,QBR);
 P(bS,0,-.06,.1,W+.16,.06,.16,QSD);if(o.lamp)qLamp(G,ax?x+W/2+.13:x+n*.09,y0+H+.08,ax?z+n*.09:z+W/2+.13,o.hex)}

export function qBan(G,x,y,z,ax,n,w,h){w=w||.22;h=h||.5;const P=qP(G,x,y,z,ax,n);
 P(bM,0,0,.035,w+.08,.035,.035,QBR);P(bC,0,-h,.02,w,h,.02,structureModelsState.BLU);P(bC,0,-h-.06,.02,w*.46,.06,.02,structureModelsState.BLU);P(bM,0,-h+.04,.033,w,.03,.01,QBR2);P(bC,0,-h*.6,.033,.05,h*.38,.01,'#f4ecd8');P(bC,0,-h*.45,.033,w*.6,.045,.01,'#f4ecd8')}

export function qFlag(G,x,y,z,h){h=h||.7;bP(G,x,y,z,.045,h,.045,QIR);bM(G,x,y+h,z,.08,.08,.08,QBR2);bC(G,x+.16,y+h-.3,z,.28,.22,.025,structureModelsState.BLU);bC(G,x+.32,y+h-.27,z,.06,.15,.025,structureModelsState.BLU)}

export function qGem(G,x,y,z,ax,n,s){s=s||.12;const P=qP(G,x,y,z,ax,n);P(bM,0,-s*.25,0,s*1.6,s*1.5,.04,QBR);P(bL,0,0,.022,s,s,.04,QHX)}

export function qMerl(G,x0,z0,x1,z1,y,h,step){step=step||.3;const s=.15,put=(x,z)=>{bS(G,x,y,z,s,h,s,QS[0]);bS(G,x,y+h,z,s+.02,.035,s+.02,QTR)};
 for(let x=x0+s/2;x<=x1-s/2+1e-6;x+=step){put(x,z0+s/2);put(x,z1-s/2)}for(let z=z0+s/2+step;z<=z1-s/2-step+1e-6;z+=step){put(x0+s/2,z);put(x1-s/2,z)}}

export function qSlit(G,x,y,z,ax){bP(G,x,y,z,ax?.06:.03,.28,ax?.03:.06,'#1b1a20');bS(G,x,y+.28,z,ax?.12:.035,.035,ax?.035:.12,QTR)}

export function qRound(G,x,z,y0,h,R,o){o=o||{};const n=Math.max(1,Math.round(h/.25)),q=h/n;for(let k=0;k<n;k++){const c=o.moss&&k===0?QMS:QS[k%4];bS(G,x,y0+k*q,z,R,q,R*.7,c);bS(G,x,y0+k*q,z,R*.7,q,R,c)}}

export function qRing(G,x,z,y,R,h,c,f){(f||bS)(G,x,y,z,R,h,R*.7,c);(f||bS)(G,x,y,z,R*.7,h,R,c)}

export function qCone(G,x,z,y0,R,cols,st){st=st||.15;let k=0;for(let a=R;a>.1;a-=st,k++){const c=cols[k%cols.length];bR(G,x,y0+k*.18,z,a,.18,a*.72,c);bR(G,x,y0+k*.18,z,a*.72,.18,a,c)}return y0+k*.18}

export function qPyr(G,x,z,y0,w,d,cols,st,rs){st=st||.17;rs=rs||.1;let k=0;for(let a=w,b=d;a>.1&&b>.1;a-=2*rs,b-=2*rs,k++)bR(G,x,y0+k*st,z,a,st,b,cols[k%cols.length]);return y0+k*st}

export function qRoof(G,cx,cz,len,span,y0,cols,alongX,o){o=o||{};const rise=o.rise||.22,run=o.run||.18,ov0=o.ov0==null?.12:o.ov0,ov1=o.ov1==null?.12:o.ov1,g0=o.g0!==false,g1=o.g1!==false,FL=o.fill||QPL,gf=o.stone?bS:bP;
 const L=len+ov0+ov1,ca=(ov1-ov0)/2,put=(f,al,la,y,lA,wd,h,c)=>alongX?f(G,cx+al,y,cz+la,lA,h,wd,c):f(G,cx+la,y,cz+al,wd,h,lA,c);
 let half=span/2+(o.side==null?.1:o.side),k=0;
 for(;half>run*1.05;k++,half-=run){const y=y0+k*rise,c=cols[k%cols.length];put(bR,ca,half-run/2,y,L,run+.012,rise,c);put(bR,ca,-(half-run/2),y,L,run+.012,rise,c);
  put(bR,ca,half-.012,y-.012,L,.035,.035,lighten(c,.14));put(bR,ca,-(half-.012),y-.012,L,.035,.035,lighten(c,.14));
  const inner=2*(half-run);if(inner>.02){if(g0)put(gf,-len/2+.05,0,y,.08,inner,rise,FL);if(g1)put(gf,len/2-.05,0,y,.08,inner,rise,FL)}
  if(!o.stone&&!o.nobarge){const F=o.frame||QW2;for(const sd of[-1,1]){if(g0)put(bW,-len/2-ov0+.018,sd*(half-run/2),y+rise*.3,.05,run+.05,rise*.8,F);if(g1)put(bW,len/2+ov1-.018,sd*(half-run/2),y+rise*.3,.05,run+.05,rise*.8,F)}}}
 const yt=y0+k*rise,rw=Math.max(.12,2*half);put(bR,ca,0,yt,L,rw+.012,rise*.6,cols[k%cols.length]);put(bM,ca,0,yt+rise*.6,L+.02,.08,.06,o.ridge||QBR);
 if(o.fin){if(g0)put(bM,-len/2-ov0+.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2);if(g1)put(bM,len/2+ov1-.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2)}
 if(!o.stone){const F=o.frame||QW2;if(g0)put(bW,-len/2+.03,0,y0,.05,span,.06,F);if(g1)put(bW,len/2-.03,0,y0,.05,span,.06,F)}
 return yt+rise*.6+.06}

export function qTimber(G,x0,z0,x1,z1,y0,y1,o){o=o||{};const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,h=y1-y0,F=o.frame||QW2,t=.07,p=.03,sk=o.skip||'';
 bP(G,cx,y0,cz,w,h,d,o.fill||QPL);
 const face=(nm,fx,fz,L,ax)=>{if(sk.includes(nm))return;const W=ax?L:p,D=ax?p:L;bW(G,fx,y0,fz,W,t,D,F);bW(G,fx,y1-t,fz,W,t,D,F);
  const n=Math.max(1,Math.round(L/(o.span||.5)));for(let i=0;i<=n;i++){const a=-L/2+t/2+i*(L-t)/n;bW(G,ax?fx+a:fx,y0,ax?fz:fz+a,ax?t:p,h,ax?p:t,F)}
  if(o.brace&&h>.35){const pw=(L-t)/n;for(let i=0;i<n;i++){if((i+(nm==='N'||nm==='E'?1:0))%2)continue;const st=4,bw=(pw-t)/st,bh=(h-2*t)/st,a0=-L/2+t+i*pw;
    for(let s=0;s<st;s++){const aa=a0+s*bw+bw/2,yy=y0+t+(i%4<2?s:(st-1-s))*bh;bW(G,ax?fx+aa:fx,yy,ax?fz:fz+aa,ax?bw+.012:p,bh,ax?p:bw+.012,F)}}}};
 face('N',cx,z0-p/2,w+2*p,true);face('S',cx,z1+p/2,w+2*p,true);face('W',x0-p/2,cz,d+2*p,false);face('E',x1+p/2,cz,d+2*p,false)}

export function qChim(G,x,z,y0,h){(G.chim||(G.chim=[])).push([x,y0+h+.12,z]);const n=Math.max(1,Math.round(h/.18));for(let k=0;k<n;k++)bS(G,x,y0+k*h/n,z,.24,h/n,.24,QBK[k%2]);bS(G,x,y0+h,z,.29,.05,.29,QTR);bP(G,x,y0+h+.05,z,.13,.05,.13,'#262222')}

export function qBarrel(G,x,z,y){y=y||0;bW(G,x,y,z,.26,.34,.26,'#8a6038');bP(G,x,y+.06,z,.275,.035,.275,QIR);bP(G,x,y+.26,z,.275,.035,.275,QIR);bW(G,x,y+.34,z,.22,.012,.22,'#6a4a2a')}

export function qCrate(G,x,z,y,s){bW(G,x,y,z,s,s,s,'#a87e4c');bW(G,x,y,z,s+.012,.035,s+.012,QW2);bW(G,x,y+s-.035,z,s+.012,.035,s+.012,QW2);bW(G,x,y,z,s*.18,s,s+.012,QW2)}

/* ---- small props that tell what a building is for ---- */
export function qSack(G,x,z,y,c){bC(G,x,y||0,z,.19,.14,.15,c||'#d9c9a0');bC(G,x,(y||0)+.14,z,.08,.04,.07,'#b8a678')}

export function qAnvil(G,x,z,y){bW(G,x,y,z,.2,.15,.2,QLOG);bW(G,x,y+.15,z,.16,.012,.16,QLOGT);bP(G,x,y+.162,z,.1,.07,.09,'#34343c');bM(G,x,y+.23,z,.28,.07,.12,'#565662');bM(G,x+.18,y+.25,z,.1,.04,.07,'#565662')}

export function qGrind(G,x,z,y){for(const s of[-1,1])bW(G,x+s*.1,y,z,.04,.24,.22,QW2);bS(G,x,y+.1,z,.09,.3,.2,'#a3a3a3');bS(G,x,y+.15,z,.09,.2,.3,'#a3a3a3');bP(G,x,y+.23,z,.26,.04,.04,QIR)}

export function qLadder(G,x,z,y0,h,ax){const w=.2;for(const s of[-1,1])ax?bW(G,x+s*w/2,y0,z,.035,h,.035,QW3):bW(G,x,y0,z+s*w/2,.035,h,.035,QW3);for(let y=y0+.1;y<y0+h-.04;y+=.14)ax?bW(G,x,y,z,w,.03,.03,QW1):bW(G,x,y,z,.03,.03,w,QW1)}

export function qFire(G,x,y,z,s){s=s||1;bL(G,x,y,z,.34*s,.16*s,.34*s,'#ff7a1a');bL(G,x,y+.16*s,z,.24*s,.2*s,.24*s,'#ffa62a');bL(G,x+.03*s,y+.36*s,z-.02*s,.15*s,.18*s,.15*s,'#ffd25a');bL(G,x-.02*s,y+.54*s,z+.03*s,.07*s,.14*s,.07*s,'#fff0b0')}

/* a board hanging from a bracket, with a two-colour pixel icon: ic = [[dx,dy,w,h,colour]..] in board units */
export function qSign(G,x,y,z,ax,n,ic,o){o=o||{};const P=qP(G,x,y,z,ax,n),w=o.w||.3,h=o.h||.26;P(bW,0,0,.12,.045,.045,.24,QW2);P(bP,-w*.3,-.07,.18,.015,.07,.015,QIR);P(bP,w*.3,-.07,.18,.015,.07,.015,QIR);
 P(bW,0,-.07-h,.18,w,h,.035,o.c||QW1);P(bM,0,-.07-h,.18,w+.03,.025,.045,QBR);P(bM,0,-.095,.18,w+.03,.025,.045,QBR);
 for(const[dx,dy,iw,ih,c]of ic||[])for(const sg of[1,-1])P(c===QBR2||c===QBR?bM:bP,dx*w,-.07-h+dy*h,.18+sg*.02,iw*w,ih*h,.012,c)}

/* a wheel standing in the x-y plane (ax) or the z-y plane */
export function qWheel(G,x,y,z,r,ax,c){const n=12;for(let k=0;k<n;k++){const a=k/n*6.2832,u=Math.cos(a)*r,v=Math.sin(a)*r,t=r*.34;ax?bW(G,x+u,y+v-t/2,z,t,t,.05,c||(k%2?QW1:QW3)):bW(G,x,y+v-t/2,z+u,.05,t,t,c||(k%2?QW1:QW3))}
 ax?bW(G,x,y-.02,z,r*1.7,.04,.03,QW2):bW(G,x,y-.02,z,.03,.04,r*1.7,QW2);ax?bW(G,x,y-r*.85,z,.04,r*1.7,.03,QW2):bW(G,x,y-r*.85,z,.03,r*1.7,.04,QW2);bP(G,x,y-.035,z,ax?.07:.07,.07,ax?.07:.07,QIR)}

/* a small leafy tree: trunk and three stepped tiers of leaves */
export function qTree(G,x,z,y,h,o){o=o||{};const A=o.a||'#4f9a3c',B=o.b||'#5fa845',D=o.d||'#3f8232',s=o.s||1;bW(G,x,y,z,.12*s,h,.12*s,QLOG);bW(G,x,y,z,.18*s,.06,.18*s,'#5d3f25');
 bC(G,x,y+h-.06,z,.62*s,.2,.62*s,D);bC(G,x,y+h+.14,z,.74*s,.22,.5*s,A);bC(G,x,y+h+.14,z,.5*s,.22,.74*s,A);bC(G,x,y+h+.36,z,.52*s,.18,.52*s,B);bC(G,x+.03,y+h+.54,z-.02,.28*s,.14,.28*s,B);
 for(const[dx,dz,dy]of o.fruit||[])bM(G,x+dx*s,y+h+dy,z+dz*s,.075,.075,.075,o.fc||'#d8402a')}

export const mBits=m=>({N:m&1,E:m&2,S:m&4,W:m&8,sk:((m&1)?'N':'')+((m&2)?'E':'')+((m&4)?'S':'')+((m&8)?'W':''),nw:!(m&1)&&!(m&8)&&!!(m&6)});

export function initializeBuildingParts() {
  bS = bxm(1);
  bW = bxm(2);
  bP = bxm(3);
  bM = bxm(4);
  bL = bxm(5);
  bR = bxm(6);
  bC = bxm(7);
  bG = bxm(8);
}
