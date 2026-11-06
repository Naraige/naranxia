import { H, W } from './rules.js';
import { sessionState } from './session.js';

/* unit grids (rebuilt each tick, or whenever the unit list changed): one for the defenders (players + AI), one for the zombies.
   A query visits only the nearby cells of the side it looks for; ties keep the lowest array index, so every result is exactly
   what the old full scan of the army gave */
export const UGC = 80;
export let UGW;
export let UGHt;
export let UGH;
const UGT = [[],[]];
export let UGN = new Int32Array(1024);
export let UGU = [];
let UGL = null;
const UGQ=[];

export function ugBuild(){SGL=null;for(let t=0;t<2;t++){const Hh=UGH[t];for(const c of UGT[t])Hh[c]=-1;UGT[t].length=0}if(UGN.length<sessionState.units.length)UGN=new Int32Array(sessionState.units.length*2);UGU=sessionState.units.slice();UGL=sessionState.units;
 for(let k=UGU.length-1;k>=0;k--){const e=UGU[k],t=e.t===1?1:0,Hh=UGH[t],c=Math.max(0,Math.min(UGHt-1,(e.y/UGC)|0))*UGW+Math.max(0,Math.min(UGW-1,(e.x/UGC)|0));if(Hh[c]<0)UGT[t].push(c);UGN[k]=Hh[c];Hh[c]=k}}

export function ugFresh(){if(UGL!==sessionState.units||UGU.length!==sessionState.units.length)ugBuild()}

/* indices of the units of one side whose cell lies within r (+ slack for what moved during this tick); sorted = array order */
export function ugNear(t,x,y,r,sorted){ugFresh();const Hh=UGH[t],R=r+30,x0=Math.max(0,((x-R)/UGC)|0),x1=Math.min(UGW-1,((x+R)/UGC)|0),y0=Math.max(0,((y-R)/UGC)|0),y1=Math.min(UGHt-1,((y+R)/UGC)|0),Q=UGQ;Q.length=0;
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)for(let k=Hh[cy*UGW+cx];k>=0;k=UGN[k])Q.push(k);if(sorted&&Q.length>1)Q.sort((a,b)=>a-b);return Q}

export const SGC = 320;
export let SGW;
export let SGHt;
export let SGH;
const SGT = [];
export let SGN = new Int32Array(512);
export let SGU = [];
let SGL = null;
let SGLEN = -1;

export function sgFresh(){if(SGL===sessionState.structs&&SGLEN===sessionState.structs.length)return;for(const c of SGT)SGH[c]=-1;SGT.length=0;if(SGN.length<sessionState.structs.length)SGN=new Int32Array(sessionState.structs.length*2);SGU=sessionState.structs.slice();SGL=sessionState.structs;SGLEN=sessionState.structs.length;
 for(let k=SGU.length-1;k>=0;k--){const s=SGU[k],c=Math.max(0,Math.min(SGHt-1,(s.y/SGC)|0))*SGW+Math.max(0,Math.min(SGW-1,(s.x/SGC)|0));if(SGH[c]<0)SGT.push(c);SGN[k]=SGH[c];SGH[c]=k}}

export function initializeSpatialIndex() {
  UGW = Math.ceil(W/UGC);
  UGHt = Math.ceil(H/UGC);
  UGH = [new Int32Array(UGW*UGHt).fill(-1),new Int32Array(UGW*UGHt).fill(-1)];
  SGW = Math.ceil(W/SGC);
  SGHt = Math.ceil(H/SGC);
  SGH = new Int32Array(SGW*SGHt).fill(-1);
}
