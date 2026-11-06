import { bxc, newG, toGeo, WRF } from '../geometry.js';
import {
  bC,
  bL,
  bM,
  bP,
  bR,
  bS,
  bW,
  mBits,
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
  qFlag,
  qGem,
  QHX,
  QIR,
  qLamp,
  QLOG,
  QLOGT,
  qP,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  qRoof,
  qRound,
  QS,
  QSD,
  QSL,
  qSlit,
  qStone,
  QTC,
  qTimber,
  QTR,
  QW1,
  QW2,
  QW3,
  qWin,
} from './building-parts.js';
import { HAYC, ROPE, structureModelsState } from './structures.js';

/* ---- house: stone ground floor, plastered timber upper floor (colour varies), terracotta roof; merged rows get dormers ---- */
export function houseGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk}=mBits(m),alongX=!((N||S)&&!(E||W)),FL=['#efe3c6','#ecd3a2','#dde3e3','#f0d8c6'][(m*5+1)%4];
 const fx0=W?0:.06,fx1=E?2:1.94,fz0=N?0:.06,fz1=S?2:1.94;qPlinth(G,(fx0+fx1)/2,0,(fz0+fz1)/2,fx1-fx0,fz1-fz0,.16);
 const x0=W?0:.24,x1=E?2:1.76,z0=N?0:.24,z1=S?2:1.76;qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,.3);
 qTimber(G,x0,z0,x1,z1,.5,1.0,{skip:sk,fill:FL});
 const j=.07,jx0=W?0:x0-(alongX?0:j),jx1=E?2:x1+(alongX?0:j),jz0=N?0:z0-(alongX?j:0),jz1=S?2:z1+(alongX?j:0);
 bW(G,(jx0+jx1)/2,1.0,(jz0+jz1)/2,jx1-jx0,.08,jz1-jz0,QW2);qTimber(G,jx0,jz0,jx1,jz1,1.08,1.6,{skip:sk,brace:true,fill:FL});
 const dr=!S?'S':!N?'N':!E?'E':!W?'W':null,wo={wood:1,shut:1,box:1};
 if(!S){qWin(G,.5,.58,z1+.016,true,1,wo);qWin(G,1.5,.58,z1+.016,true,1,wo);qWin(G,.62,1.2,jz1+.016,true,1,{wood:1});qWin(G,1.38,1.2,jz1+.016,true,1,{wood:1});if(dr==='S')qDoor(G,1,z1+.016,true,1,{wood:1,lamp:1})}
 if(!N){qWin(G,.62,1.2,jz0-.016,true,-1,{wood:1});qWin(G,1.38,1.2,jz0-.016,true,-1,{wood:1});if(dr==='N')qDoor(G,1,z0-.016,true,-1,{wood:1,lamp:1});else qWin(G,1,.58,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E){qWin(G,jx1+.016,1.2,1,false,1,{wood:1});if(dr==='E')qDoor(G,x1+.016,1,false,1,{wood:1,lamp:1});else qWin(G,x1+.016,.58,1,false,1,wo)}
 if(!W){qWin(G,jx0-.016,1.2,1,false,-1,{wood:1});if(dr==='W')qDoor(G,x0-.016,1,false,-1,{wood:1,lamp:1});else qWin(G,x0-.016,.58,1,false,-1,wo)}
 let top;if(alongX)top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jx1-jx0,jz1-jz0,1.6,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fill:FL});
 else top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jz1-jz0,jx1-jx0,1.6,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1,fill:FL});
 if(alongX&&!E)qChim(G,x1-.24,(z0+z1)/2-.4,1.0,top-.85);else if(!alongX&&!S)qChim(G,(x0+x1)/2+.4,z1-.24,1.0,top-.85);
 if(m&&alongX&&!S){const dz=jz1-.3,dy=1.66;bP(G,1,dy,dz,.38,.32,.36,FL);bW(G,1,dy,dz+.18,.42,.05,.02,QW2);qWin(G,1,dy+.06,dz+.185,true,1,{wood:1,w:.16,h:.18});qPyr(G,1,dz,dy+.32,.5,.48,QTC,.1,.1)}
 return toGeo(G)}

/* ---- farm: crop rows, fences on the outer sides, scarecrow, hay; a merged field gets a windmill ---- */
export function farmGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#6e4a2c');
 const mill=nw?[.42,.42]:null;
 for(let r=0;r<5;r++){const z=.22+r*.39;if(r===2){bP(G,1,.06,z,2,.05,.22,'#3a6fd0');continue}bP(G,1,.1,z,2,.03,.26,'#4a3020');
  for(let i=0;i<7;i++){const x=.15+i*.285,gr=(i*3+r*5)%4;if(mill&&x<.85&&z<.85)continue;
   if(r%2===0){const h=.12+gr*.07,c=gr>=3?'#d8b43a':gr===2?'#b8b040':'#5e9a36';bxc(G,x-.05,.13,z-.05,.035,h,.035,c);bxc(G,x+.05,.13,z+.05,.035,h,.035,c);if(gr>=2)bxc(G,x,.13+h,z,.07,.05,.07,gr>=3?'#e8c84a':'#c8c050')}
   else{bxc(G,x,.13,z,.12,.08,.1,'#4a8e32');bxc(G,x,.2,z,.06,.06,.06,'#5ea83e');if(gr>=2)bxc(G,x,.12,z+.05,.06,.03,.03,'#e07a1a')}}}
 const fence=(ax,fixed)=>{for(let i=0;i<=8;i++){const t=.06+i*.235;ax?bW(G,t,.1,fixed,.08,.42,.08,QW1):bW(G,fixed,.1,t,.08,.42,.08,QW1);ax?bW(G,t,.52,fixed,.05,.04,.05,QW3):bW(G,fixed,.52,t,.05,.04,.05,QW3)}for(const y of[.26,.42])ax?bW(G,1,y,fixed,1.9,.05,.04,QW3):bW(G,fixed,y,1,.04,.05,1.9,QW3)};
 if(!N)fence(true,.04);if(!S)fence(true,1.96);if(!W)fence(false,.04);if(!E)fence(false,1.96);
 if(!N&&!E){const x=1.74,z=.32;bW(G,x,.1,z,.05,.62,.05,QW1);bW(G,x,.5,z,.42,.05,.05,QW1);bC(G,x,.4,z,.18,.2,.12,'#b8542e');bC(G,x,.7,z,.18,.17,.18,'#e0b05a');bP(G,x-.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bP(G,x+.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bC(G,x,.87,z,.26,.04,.26,HAYC);bC(G,x,.91,z,.12,.08,.12,HAYC)}
 if(!S&&!W){bW(G,.32,.1,1.7,.3,.3,.3,QW1);bP(G,.32,.36,1.7,.24,.05,.24,'#5a3a1a');bP(G,.32,.4,1.7,.18,.02,.18,'#6b8a3a')}
 if(!S&&!E){bC(G,1.66,.1,1.66,.38,.36,.38,HAYC);bC(G,1.66,.24,1.66,.4,.07,.4,'#a98a2a');bC(G,1.36,.1,1.74,.24,.24,.24,HAYC)}
 if(mill){const[x,z]=mill;qRound(G,x,z,.1,1.3,.74,{moss:1});qRing(G,x,z,.7,.78,.05,QW2,bW);bW(G,x,1.4,z,.82,.07,.82,QW2);qCone(G,x,z,1.47,.86,QTC,.16);
  qDoor(G,x,z+.37,true,1,{wood:1,y:.1,w:.2,h:.36});qWin(G,x+.37,.8,z,false,1,{wood:1,w:.12,h:.18});const hy=1.3,hz=z+.47;bW(G,x,hy-.04,hz-.06,.1,.1,.16,QW2);bM(G,x,hy-.03,hz+.03,.07,.07,.04,QBR);
  for(const[ax,sg]of[[0,1],[0,-1],[1,1],[1,-1]]){const L=1.0;if(ax)bW(G,x+sg*L/2,hy,hz+.04,L,.04,.03,QW2);else bW(G,x,hy+(sg>0?0:-L)+.02,hz+.04,.04,L,.03,QW2);
   if(ax)bC(G,x+sg*(L/2+.02),hy+(sg>0?.03:-.15),hz+.05,L*.82,.12,.015,'#efe6d0');else bC(G,x+(sg>0?-.09:.09),hy+(sg>0?.1:-L+.1),hz+.05,.12,L*.82,.015,'#efe6d0')}}
 return toGeo(G)}

/* ---- storage: warehouse with stone footing, timber walls and a terracotta roof; merged halls share the roof and the north-west one hoists crates ---- */
export function storageGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W));
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.12,z1=S?2:1.56;qPlinth(G,(x0+x1)/2,0,(z0+z1)/2,x1-x0+(W?0:.06)+(E?0:.06),z1-z0+(N?0:.06)+(S?0:.06),.14);
 qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.3,{moss:1});qTimber(G,x0,z0,x1,z1,.48,1.18,{skip:sk,brace:true,fill:'#e8d8b4'});
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.18,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.18,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1});
 if(!S){const P=qP(G,1,.18,z1+.016,true,1);P(bW,0,0,0,.72,.66,.04,QW2);P(bW,-.17,0,.012,.32,.6,.04,QW1);P(bW,.17,0,.012,.32,.6,.04,QW1);P(bW,-.17,0,.032,.3,.03,.01,QW2);P(bW,.17,0,.032,.3,.03,.01,QW2);
  for(const a of[-.17,.17]){P(bW,a,.3,.032,.03,.42,.01,QW2)}P(bP,0,.3,.04,.6,.035,.01,QIR);qLamp(G,1.48,.98,z1+.09,false);qWin(G,.4,.62,z1+.016,true,1,{wood:1,shut:1});qWin(G,1.62,.62,z1+.016,true,1,{wood:1,shut:1});
  qBarrel(G,.36,1.8);qBarrel(G,.64,1.86);qCrate(G,1.42,1.8,0,.26);qCrate(G,1.7,1.84,0,.22);qCrate(G,1.47,1.8,.26,.2);bC(G,1.06,0,1.86,.2,.16,.16,'#cbb88a')}
 if(!N){qWin(G,.6,.66,z0-.016,true,-1,{wood:1,shut:1});qWin(G,1.4,.66,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E)qWin(G,x1+.016,.66,(z0+z1)/2,false,1,{wood:1,shut:1});if(!W)qWin(G,x0-.016,.66,(z0+z1)/2,false,-1,{wood:1,shut:1});
 if(nw){const hy=top-.5;if(alongX){bW(G,x0-.22,hy,(z0+z1)/2,.56,.08,.08,QW2);bP(G,x0-.46,hy-.36,(z0+z1)/2,.015,.36,.015,ROPE);qCrate(G,x0-.46,(z0+z1)/2,hy-.62,.22);bW(G,x0-.05,hy-.3,(z0+z1)/2,.05,.32,.05,QW2)}
  else{bW(G,(x0+x1)/2,hy,z0-.22,.08,.08,.56,QW2);bP(G,(x0+x1)/2,hy-.36,z0-.46,.015,.36,.015,ROPE);qCrate(G,(x0+x1)/2,z0-.46,hy-.62,.22)}}
 return toGeo(G)}

/* ---- barracks: stone (slate roof) or timber (terracotta) hall with a training yard; merged halls get a watch turret ---- */
function mdBarracks(stone,m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m);
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.14,z1=S?2:1.5;qPlinth(G,1,0,1,2,2,.14);
 if(stone){qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.92,{moss:1});if(!m)qQuoin(G,x0,z0,x1,z1,.18,.92);qCornice(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0+.04,z1-z0+.04,.08)}
 else{qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.25);qTimber(G,x0,z0,x1,z1,.43,1.1,{skip:sk,fill:'#e6d6b2'});bW(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0,.08,z1-z0,QW2)}
 qTimber(G,x0,z0-(N?0:.07),x1,z1+(S?0:.07),1.18,1.7,{skip:sk,brace:true,fill:stone?'#e2d6bc':'#e6d6b2'});
 const top=qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0+(N?0:.07)+(S?0:.07),1.7,stone?QSL:WRF,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fin:stone});
 if(!S){qDoor(G,1,z1+.016,true,1,{w:.42,h:.64,y:.18,wood:!stone});if(stone)qGem(G,1,1.0,z1+.02,true,1,.09);qBan(G,.42,1.04,z1,true,1);qBan(G,1.58,1.04,z1,true,1);qLamp(G,.72,.98,z1+.07,stone);qLamp(G,1.28,.98,z1+.07,stone);
  qWin(G,.55,1.32,z1+.086,true,1,{wood:1});qWin(G,1.45,1.32,z1+.086,true,1,{wood:1});
  for(const x of[.22,.72])bW(G,x,.14,1.8,.06,.56,.06,QW2);bW(G,.47,.6,1.8,.56,.05,.06,QW2);[.32,.47,.62].forEach(x=>{bM(G,x,.26,1.84,.035,.3,.02,'#dadde4');bM(G,x,.52,1.84,.1,.03,.03,QBR);bW(G,x,.55,1.84,.03,.07,.03,QW1)});
  bC(G,.88,.14,1.84,.08,.3,.24,structureModelsState.BLU);bM(G,.925,.2,1.84,.01,.18,.06,QBR2);
  bW(G,1.55,.14,1.82,.06,.3,.06,QW2);bC(G,1.55,.32,1.82,.36,.36,.14,HAYC);bC(G,1.55,.34,1.893,.3,.3,.01,'#f0f0f0');bC(G,1.55,.39,1.896,.2,.2,.01,'#c8282a');bC(G,1.55,.44,1.899,.1,.1,.01,'#f0f0f0');bC(G,1.55,.47,1.902,.04,.04,.01,'#c8282a')}
 if(!N){qWin(G,.55,1.32,z0-.086,true,-1,{wood:1});qWin(G,1.45,1.32,z0-.086,true,-1,{wood:1});if(stone){qSlit(G,.45,.55,z0-.016,true);qSlit(G,1.55,.55,z0-.016,true)}}
 if(!W){if(stone)qSlit(G,x0-.016,.55,(z0+z1)/2,false);else qWin(G,x0-.016,.6,(z0+z1)/2,false,-1,{wood:1,shut:1})}
 if(!E){if(stone)qSlit(G,x1+.016,.55,(z0+z1)/2,false);else qWin(G,x1+.016,.6,(z0+z1)/2,false,1,{wood:1,shut:1})}
 if(nw){const tx=x0+.3,tz=z0+.3;if(stone){qRound(G,tx,tz,.18,3.1,.5,{moss:1});qRing(G,tx,tz,3.28,.62,.08,QTR);for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]]){bS(G,tx+a*.25,3.36,tz+b*.25,.12,.18,.12,QS[0]);bS(G,tx+a*.25,3.54,tz+b*.25,.14,.03,.14,QTR)}qRing(G,tx,tz,2.2,.56,.05,QBR,bM);qFlag(G,tx,3.36,tz,.8)}
  else{for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.2,.14,tz+b*.2,.1,3.0,.1,QLOG);bW(G,tx,3.0,tz,.6,.08,.6,QW2);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.27,3.08,tz+b*.27,.05,.3,.05,QW1);const t=qPyr(G,tx,tz,3.4,.72,.72,WRF,.14,.1);qFlag(G,tx,t,tz,.6)}}
 else if(!m)qFlag(G,1,top-.02,(z0+z1)/2);
 return toGeo(G)}

export function barracksGeo(m){return mdBarracks(true,m)}

export function woodBarracksGeo(m){return mdBarracks(false,m)}

/* ---- academy: limestone library with arched glowing windows, a portico and a copper roof; its tower becomes a hextech observatory when merged ---- */
export function academyGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W)),tw=!m||nw;
 const x0=W?0:.16,x1=E?2:1.84,z0=N?0:.3,z1=S?2:1.66;qPlinth(G,1,0,1,2,2,.16);
 qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,1.1);if(!m)qQuoin(G,x0,z0,x1,z1,.2,1.1);qCornice(G,(x0+x1)/2,1.3,(z0+z1)/2,x1-x0+.06,z1-z0+.06,.08);
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.38,QCU,true,{ov0:W?0:.1,ov1:E?0:.1,g0:!W,g1:!E,side:(N||S)?0:.08,stone:1,fill:QS[2],fin:1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.38,QCU,false,{ov0:N?0:.1,ov1:S?0:.1,g0:!N,g1:!S,side:(E||W)?0:.08,stone:1,fill:QS[2],fin:1});
 const wins=(n,ax,fixed,a0,a1)=>{for(let a=a0;a<=a1+1e-6;a+=.42){qWin(G,ax?a:fixed,.5,ax?fixed:a,ax,n,{glow:1,w:.18,h:.42})}};
 if(!S){wins(1,true,z1+.016,.36,.6);wins(1,true,z1+.016,1.4,1.64);bS(G,1,.2,z1+.12,.62,.06,.24,QTR);bS(G,1,.26,z1+.08,.52,.06,.16,QTR);
  for(const x of[.74,1.26]){bS(G,x,.32,z1+.14,.1,.9,.1,QTR);bS(G,x,1.2,z1+.14,.14,.06,.14,QTR)}bS(G,1,1.26,z1+.14,.68,.08,.18,QTR);qPyr(G,1,z1+.12,1.34,.72,.24,[QTR,QS[2]],.1,.08);
  qDoor(G,1,z1+.016,true,1,{y:.32,w:.3,h:.6});qGem(G,1,1.12,z1+.24,true,1,.09);qPost(G,.5,.2,z1+.24,.4,true);qPost(G,1.5,.2,z1+.24,.4,true)}
 if(!N)wins(-1,true,z0-.016,.4,1.6);if(!E)wins(1,false,x1+.016,z0+.25,z1-.25);if(!W&&!tw)wins(-1,false,x0-.016,z0+.25,z1-.25);
 if(tw){const tx=x0+.3,tz=z0+.3,H=nw?2.6:2.3;qRound(G,tx,tz,.2,H,.6,{moss:1});qRing(G,tx,tz,.2+H,.7,.08,QTR);qRing(G,tx,tz,1.5,.64,.05,QBR,bM);
  for(const a of[0,1])qWin(G,tx,1.1+a*.7,tz+.31,true,1,{glow:1,w:.12,h:.26});
  if(nw){const y=.28+H;qRing(G,tx,tz,y,.62,.1,QBR,bM);for(let k=0;k<4;k++){const r=.5-k*.11;qRing(G,tx,tz,y+.1+k*.13,r,.13,k%2?QCU[0]:QCU[2],bR)}bL(G,tx,y+.18,tz,.26,.3,.26,QHX);
   for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]])bM(G,tx+a*.28,y+.1,tz+b*.28,.04,.5,.04,QBR);bM(G,tx,y+.66,tz,.08,.2,.08,QBR2);bL(G,tx,y+.86,tz,.07,.07,.07,QHX)}
  else{const t=qCone(G,tx,tz,.28+H,.72,QCU);bM(G,tx,t,tz,.06,.18,.06,QBR2);bL(G,tx,t+.18,tz,.07,.07,.07,QHX)}}
 return toGeo(G)}

/* ---- forester's hut: a mossy log cabin with a sapling nursery, a log pile and a chopping stump; front = +z ---- */
const QMOSS=['#5b7a3e','#4d6a35','#668845'];

export function foresterGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.11,cz,L,D,.16);for(let k=0;k<5;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25';if(ax){bW(G,cx,y,b0+.04,L,.13,.09,c);bW(G,cx,y,b1-.04,L,.13,.09,c)}else{bW(G,a0+.04,y,cz,.09,.13,D,c);bW(G,a1-.04,y,cz,.09,.13,D,c)}}
  bW(G,cx,.97,cz,L,.05,D,QW2);qRoof(G,cx,cz,ax?L:D,ax?D:L,1.0,QMOSS,ax,{rise:.13,run:.12,fill:'#8a6a42',ov0:0,ov1:0,side:.08,ridge:QW2,g0:false,g1:false})};
 if(hm&2)wing(1.26,2,.36,.9,true);if(hm&8)wing(0,.22,.36,.9,true);if(hm&1)wing(.96,1.3,0,.32,false);if(hm&4)wing(.96,1.3,1.24,2,false);bP(G,1,0,1,2,.08,2,'#5f6f38');bP(G,1,.08,1,1.94,.03,1.94,'#6f8a44');
 /* cabin of horizontal logs */
 const x0=.18,x1=1.3,z0=.28,z1=1.28,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.11,zc,x1-x0+.08,z1-z0+.08,.16);
 for(let k=0;k<6;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25',L=x1-x0,D=z1-z0;bW(G,xc,y,z1-.04,L+(k%2?.12:0),.13,.09,c);bW(G,xc,y,z0+.04,L+(k%2?.12:0),.13,.09,c);bW(G,x0+.04,y,zc,.09,.13,D+(k%2?0:.12),c);bW(G,x1-.04,y,zc,.09,.13,D+(k%2?0:.12),c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])for(let k=0;k<6;k+=2)bW(G,x,.27+k*.14,z,.12,.13,.12,QLOGT);
 qDoor(G,.6,z1+.016,true,1,{y:.27,w:.26,h:.5,wood:1,lamp:1});if(!(hm&4))qWin(G,1.02,.55,z1+.016,true,1,{wood:1,shut:1,glow:1,w:.16,h:.2});if(!(hm&8))qWin(G,x0-.016,.55,zc,false,-1,{wood:1,shut:1,glow:1,w:.16,h:.2});
 const rt=qRoof(G,xc,zc,x1-x0,z1-z0,1.11,QMOSS,true,{rise:.17,run:.13,fill:'#8a6a42',ov0:.1,ov1:.1,side:.12,ridge:QW2});
 qChim(G,.42,.52,.8,rt-.62);
 /* nursery: saplings in planters, the tallest at the back */
 for(let r=(hm&2)?2:0;r<3;r++)for(let c=0;c<2;c++){const x=1.55+c*.28,z=.42+r*.42,h=.16+(2-r)*.07+c*.03;bW(G,x,.11,z,.22,.1,.22,QW1);bP(G,x,.21,z,.18,.02,.18,'#4a3020');
  bW(G,x,.23,z,.03,h,.03,'#6b4a2c');bC(G,x,.23+h,z,.13,.11,.13,r===1?'#5fa845':'#4f9a3c');bC(G,x,.34+h,z,.07,.06,.07,'#6fbe52')}
 if(!(hm&2)){for(let k=0;k<=5;k++){bW(G,1.98,.11,.25+k*.3,.05,.22,.05,QW1)}bW(G,1.98,.26,1,.03,.04,1.55,QW3)}
 /* yard: log pile, chopping stump with an axe, a watering can */
 for(let k=0;k<3;k++){bW(G,.42+k*.17,.11,1.66,.16,.16,.42,QLOG);bW(G,.42+k*.17,.11,1.876,.12,.12,.012,QLOGT)}for(let k=0;k<2;k++){bW(G,.5+k*.17,.27,1.66,.16,.16,.42,QLOG);bW(G,.5+k*.17,.27,1.876,.12,.12,.012,QLOGT)}
 if(!(hm&4)){bW(G,1.25,.11,1.68,.24,.18,.24,'#7a5a34');bW(G,1.25,.29,1.68,.2,.01,.2,QLOGT);bW(G,1.25,.3,1.62,.03,.03,.2,'#9a6a34');bM(G,1.25,.33,1.71,.02,.08,.1,'#b9c0cc')}
 bM(G,1.62,.11,1.72,.12,.1,.09,QBR);bM(G,1.68,.17,1.72,.08,.02,.02,QBR2);
 return toGeo(G)}

/* ---- builders' guild: a timber workshop on a stone base, a treadwheel crane lifting a block, cut stone and planks in the yard ---- */
export function guildGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.13,cz,L,D,.42);qTimber(G,a0,b0,a1,b1,.55,1.25,{brace:true,fill:'#e8d6b0',skip:ax?'EW':'NS'});bW(G,cx,1.25,cz,L,.06,D,QW2);
  qRoof(G,cx,cz,ax?L:D,ax?D:L,1.31,QSL,ax,{rise:.17,run:.13,ov0:0,ov1:0,side:.08,g0:false,g1:false})};
 if(hm&2)wing(1.31,2,.32,.9,true);if(hm&8)wing(0,.19,.32,.9,true);if(hm&1)wing(.95,1.3,0,.24,false);if(hm&4)wing(.95,1.3,1.26,2,false);qPlinth(G,1,0,1,2,2,.1);bS(G,1,.1,1,1.9,.03,1.9,QS[2]);
 const x0=.15,x1=1.35,z0=.2,z1=1.3,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.13,zc,x1-x0,z1-z0,.42);qQuoin(G,x0,z0,x1,z1,.13,.42);
 qTimber(G,x0,z0,x1,z1,.55,1.25,{brace:true,fill:'#e8d6b0'});bW(G,xc,1.25,zc,x1-x0+.08,.06,z1-z0+.08,QW2);qTimber(G,x0-.04,z0-.04,x1+.04,z1+.04,1.31,1.86,{fill:'#efe3c6',skip:'N'});
 const rt=qRoof(G,xc,zc,x1-x0+.08,z1-z0+.08,1.86,QSL,true,{rise:.2,run:.15,ov0:.12,ov1:.12,fin:1});
 qDoor(G,.55,z1+.016,true,1,{y:.13,w:.36,h:.62,wood:1,lamp:1});if(!(hm&4))qWin(G,1.08,.36,z1+.016,true,1,{wood:1,shut:1,box:1,w:.18,h:.18});
 qWin(G,.45,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,1.05,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,x1+.056,1.5,zc,false,1,{wood:1,glow:1});if(!(hm&2))qWin(G,x1+.016,.85,zc,false,1,{wood:1,shut:1});
 /* guild sign: crossed hammer and trowel over the door */
 const sy=.98;bW(G,.55,sy,z1+.1,.05,.05,.16,QW2);bW(G,.55,sy-.24,z1+.18,.3,.24,.03,QW1);bM(G,.55,sy-.24,z1+.2,.32,.26,.01,QBR);
 bM(G,.49,sy-.2,z1+.21,.04,.17,.012,QIR);bM(G,.49,sy-.06,z1+.21,.1,.05,.012,QIR);bM(G,.61,sy-.2,z1+.21,.04,.12,.012,QW3);bM(G,.61,sy-.08,z1+.21,.08,.07,.012,'#b9c0cc');
 /* treadwheel crane at the front right: the wheel faces the street, the jib reaches back over the stone pile */
 const cx=1.68,cz=1.66;bW(G,cx,.13,cz,.14,2.5,.14,QW2);for(const s of[-1,1])bW(G,cx+s*.26,.13,cz,.07,.72,.07,QW1);bW(G,cx,.82,cz,.6,.06,.08,QW2);
 for(let k=0;k<16;k++){const a=k/16*6.2832,r=.34;bW(G,cx+Math.cos(a)*r,.66+Math.sin(a)*r,cz+.1,.09,.09,.07,k%2?QW1:QW3)}
 for(let k=0;k<4;k++){const a=k/4*3.1416,c=Math.cos(a),n=Math.sin(a);bW(G,cx,.66-Math.abs(n)*.32,cz+.1,Math.abs(c)*.64+.04,Math.abs(n)*.64+.04,.04,QW3)}bM(G,cx,.62,cz+.14,.08,.08,.04,QIR);
 const jy=2.5;bW(G,cx,jy,cz-.42,.1,.09,1.04,QW2);bW(G,cx,jy-.44,cz-.2,.05,.46,.05,QW3);bW(G,cx,jy-.2,cz-.3,.05,.05,.26,QW3);bW(G,cx,jy+.09,cz-.92,.07,.07,.07,QW3);
 bP(G,cx,1.12,cz-.88,.015,jy-1.12,.015,'#c8b890');bM(G,cx,1.08,cz-.88,.06,.04,.06,QIR);qStone(G,cx,.82,cz-.88,.24,.24,.24,{ph:2});
 /* yard: cut stone blocks under the crane, a plank stack, a workbench with tools, scaffold poles */
 if(!(hm&2)){for(const[x,z,y]of[[1.56,.62,.13],[1.82,.6,.13],[1.69,.61,.33]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 for(let k=0;k<4;k++)bW(G,1.7,.13+k*.05,.24,.5,.045,.14,k%2?QW3:QW1)}else for(const[x,z,y]of[[1.62,1.12,.13],[1.86,1.1,.13]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 bW(G,.62,.13,1.72,.62,.04,.22,QW3);for(const s of[-1,1])bW(G,.62+s*.27,.13,1.72,.05,.26,.18,QW2);bW(G,.62,.39,1.72,.62,.04,.22,QW3);bM(G,.5,.43,1.72,.18,.03,.04,'#b9c0cc');bW(G,.72,.43,1.7,.04,.03,.18,QW1);
 if(!(hm&9)){for(const[x,z]of[[.06,.12],[.06,1.38],[1.42,.12]]){bW(G,x,.1,z,.05,2.1,.05,'#b08a58');for(const y of[.75,1.45])bW(G,x,y,z,.05,.03,.05,QW2)}
 for(const y of[.75,1.45]){bW(G,.06,y+.03,.75,.04,.03,1.26,'#b08a58');bW(G,.74,y+.03,.12,1.36,.03,.04,'#b08a58')}}
 return toGeo(G)}

/* ---- market: striped awnings over a counter of goods; merged stalls become one covered bazaar with a clock post ---- */
export function marketGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#a99a7e');for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)bS(G,.25+i*.5,.1,.25+j*.5,.48,.012,.48,QS[(i+j)%4]);
 const x0=W?0:.22,x1=E?2:1.78,z0=N?0:.34,z1=S?2:1.5,y1=1.32;
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])if(!((x===0||x===2)&&(z===0||z===2))&&!(x===0&&W)&&!(x===2&&E)&&!(z===0&&N)&&!(z===2&&S)){bW(G,x,.1,z,.1,y1+(z===z0?.3:0)-.1,.1,QW2);bM(G,x,.1,z,.14,.06,.14,QBR)}
 if(!N){for(let k=0;k<4;k++)bW(G,(x0+x1)/2,.1+k*.25,z0,x1-x0-.08,.24,.06,k%2?QW1:QW3)}
 if(!W)bW(G,x0,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);if(!E)bW(G,x1,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);
 const yt=y1+.3,ay=(z)=>yt-(z-z0)/(Math.max(.5,z1-z0+.36))*.5;
 for(let x=0;x<2-1e-6;x+=.25){const a=Math.max(x,x0-.1),b=Math.min(x+.25,x1+.1);if(b<=a)continue;const c=Math.round(x/.25)%2?'#f2ead8':'#b83a2b';
  for(let k=0;k<6;k++){const zz0=z0-.06+k*(z1-z0+.36)/6,zz1=zz0+(z1-z0+.36)/6;bC(G,(a+b)/2,ay((zz0+zz1)/2),(zz0+zz1)/2,b-a+.004,.05,zz1-zz0+.012,c)}
  if(!S){bC(G,(a+b)/2,ay(z1+.3)-.12,z1+.31,(b-a)*.72,.12,.03,c);bC(G,(a+b)/2,ay(z1+.3)-.16,z1+.31,(b-a)*.36,.05,.03,c)}}
 if(!S){bW(G,1,.1,z1-.06,x1-x0-.1,.42,.22,QW3);bW(G,1,.52,z1-.04,x1-x0+.02,.05,.3,QW2);
  bW(G,.5,.57,z1-.04,.32,.12,.22,QW1);for(let i=0;i<3;i++)for(let j=0;j<2;j++)bP(G,.4+i*.1,.69,z1-.09+j*.1,.07,.06,.07,(i+j)%2?'#c8282a':'#e04030');
  bC(G,.9,.57,z1-.04,.16,.22,.16,'#d8c08a');bC(G,.9,.79,z1-.04,.1,.06,.1,'#e8d29a');bC(G,1.18,.57,z1-.04,.2,.08,.2,'#3a5a9a');bC(G,1.18,.65,z1-.04,.2,.06,.2,'#7a3a8a');
  bM(G,1.5,.57,z1-.04,.04,.24,.04,QBR);bM(G,1.5,.81,z1-.04,.34,.03,.03,QBR);bM(G,1.36,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.64,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.36,.7,z1-.04,.06,.04,.06,'#ffd23c');
  qLamp(G,x1+.06,1.22,z1+.1,false);qLamp(G,x0-.06,1.22,z1+.1,false)}
 if(!E){qBarrel(G,1.86,.5,.1);qBarrel(G,1.86,.82,.1)}if(!W){qCrate(G,.12,.62,.1,.24);qCrate(G,.12,.66,.34,.18)}
 if(!m||nw){const sx=nw?x0+.12:1,sz=nw?z0+.12:z0;if(nw){bS(G,sx,.1,sz,.24,.12,.24,QSD);bM(G,sx,.22,sz,.08,2.0,.08,QBR);bM(G,sx,2.22,sz,.4,.4,.4,QBR);for(const[ax,n]of[[1,1],[1,-1],[0,1],[0,-1]]){const P=qP(G,sx,2.42,sz,ax,n);P(bP,0,-.15,.205,.28,.28,.01,'#f4ecd8');P(bP,0,-.03,.21,.02,.12,.01,QIR);P(bP,.04,-.02,.21,.1,.02,.01,QIR)}bM(G,sx,2.62,sz,.14,.14,.14,QBR2);qLamp(G,sx+.26,1.6,sz,true);qLamp(G,sx-.26,1.6,sz,true)}
  else{bW(G,1,1.86,z0,.06,.26,.06,QW2);bW(G,1,2.1,z0,.5,.06,.06,QW2);bW(G,1.15,1.82,z0+.04,.03,.28,.03,QW2);bW(G,1.15,1.62,z0+.04,.34,.22,.04,QW1);bM(G,1.15,1.67,z0+.07,.13,.13,.02,'#ffd23c');qFlag(G,x0,1.62,z0,.6)}}
 return toGeo(G)}

/* ---- torch: a brass brazier on a stone post ---- */
export function torchGeo(){const G=newG();bS(G,0,0,0,.36,.1,.36,QSD);qStone(G,0,.1,0,.2,.2,.66);bS(G,0,.76,0,.26,.06,.26,QTR);bM(G,0,.82,0,.08,.36,.08,QBR);
 bM(G,0,1.18,0,.3,.05,.3,QBR);[[-.12,0,.03,.28],[.12,0,.03,.28],[0,-.12,.28,.03],[0,.12,.28,.03]].forEach(([x,z,w,d])=>bP(G,x,1.23,z,w,.16,d,QIR));
 bL(G,0,1.23,0,.2,.13,.2,'#ff8a2a');bL(G,0,1.36,0,.13,.11,.13,'#ffc040');bL(G,0,1.47,0,.06,.08,.06,'#fff1b0');return toGeo(G)}
