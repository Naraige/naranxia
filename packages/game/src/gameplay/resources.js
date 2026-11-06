import { dist } from '../core/math.js';
import { lightingState, litAt } from './lighting.js';
import { BAD } from './players.js';
import { CODE, TH, TS, TW } from './rules.js';
import { sessionState } from './session.js';
import { reachLong, sameComp } from '../world/connectivity.js';
import { D4, gOK } from '../world/routes.js';
import { ter, terrainState } from '../world/terrain.js';
import { fv, solid } from '../world/traversal.js';

export const RL={};

function resList(j,pl){pl=pl|0;const H=pl===1&&sessionState.CS2?sessionState.CS2:sessionState.CS,cx=H.tx,cy=H.ty,K=j+(pl?'_1':'');let L=RL[K];if(L&&sessionState.time-L.t<4)return L.a;const a=[];const x0=Math.max(0,cx-160),y0=Math.max(0,cy-160),x1=Math.min(TW,cx+161),y1=Math.min(TH,cy+161);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!gOK(x,y))continue;const i=y*TW+x;if(ter[i]===CODE[j])a.push([i,dist((x+.5)*TS,(y+.5)*TS,H.x,H.y)])}
 a.sort((p,q)=>p[1]-q[1]);RL[K]={t:sessionState.time,a};return a}

export const CLM=new Map();
export const rclaimed=(i,u)=>{const c=CLM.get(i);return !!c&&c!==u&&c.hp>0&&c.tl===i&&c.job===(u?u.job:c.job)&&!c.o};

const inWin=(S,x,y)=>S&&S.list?S.list.some(q=>inWin(q,x,y)):!!S&&x>S.x0&&y>S.y0&&x<S.x0+S.w-1&&y<S.y0+S.h-1;

export function nearest(j,pl,u){const NW=sessionState.time,ux=u?Math.floor(u.x/TS):0,uy=u?Math.floor(u.y/TS):0,nt=lightingState.LITL.length>0;let best=-1,bw=1e9,k=0,nl=0;
 /* candidates: the resources nearest the castle, plus everything within 12 tiles of the peasant (forester groves included); the peasant takes the closest to himself */
 let C=resList(j,pl);if(u){const loc=[];for(let y=Math.max(0,uy-12);y<=Math.min(TH-1,uy+12);y++)for(let x=Math.max(0,ux-12);x<=Math.min(TW-1,ux+12);x++){const i=y*TW+x;if(ter[i]===CODE[j]&&gOK(x,y))loc.push([i,1])}if(loc.length)C=loc.concat(C)}
 const seen=u?new Set():null;for(const[i,lc]of C){if(seen){if(seen.has(i))continue;seen.add(i)}if(lc===1){if(ter[i]!==CODE[j]||rclaimed(i,u))continue;const x=i%TW,y=(i/TW)|0;if(nt&&!litAt((x+.5)*TS,(y+.5)*TS))continue;if(!D4.some(([dx,dy])=>!solid(x+dx,y+dy)&&sameComp(ux,uy,x+dx,y+dy)))continue;const sc=(Math.abs(x-ux)+Math.abs(y-uy))*1.5;if(sc<bw){bw=sc;best=i}continue}if(ter[i]!==CODE[j]||BAD.get(i)>NW||u&&rclaimed(i,u))continue;const x=i%TW,y=(i/TW)|0;if(nt&&!litAt((x+.5)*TS,(y+.5)*TS))continue;let w=65535;for(const[dx,dy]of D4)if(!solid(x+dx,y+dy)&&(!u||sameComp(ux,uy,x+dx,y+dy)))w=Math.min(w,fv(terrainState.FP,x+dx,y+dy));if(w>=65535){if(!inWin(terrainState.FP,x,y)&&Math.abs(x-ux)+Math.abs(y-uy)>8&&nl++<2&&reachLong(x,y))w=60000+k;else{if(inWin(terrainState.FP,x,y))BAD.set(i,NW+20);continue}}const sc=u?w+(w<60000?(Math.abs(x-ux)+Math.abs(y-uy))*1.5:0):w;if(sc<bw){bw=sc;best=i}if(++k>=140)break}nearest.w=bw;return best}

export function nearestLocal(j,u,R){const c=u.lastT,cx=c>=0?c%TW:Math.floor(u.x/TS),cy=c>=0?((c/TW)|0):Math.floor(u.y/TS),ux=Math.floor(u.x/TS),uy=Math.floor(u.y/TS),NW=sessionState.time;let best=-1,bd=1e9;
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!gOK(x,y))continue;const i=y*TW+x;if(ter[i]!==CODE[j]||BAD.get(i)>NW||rclaimed(i,u))continue;const d=(x-cx)*(x-cx)+(y-cy)*(y-cy);if(d>=bd)continue;if(lightingState.LITL.length&&!litAt((x+.5)*TS,(y+.5)*TS))continue;
  if(!D4.some(([dx,dy])=>!solid(x+dx,y+dy)&&sameComp(ux,uy,x+dx,y+dy)))continue;bd=d;best=i}return best}
