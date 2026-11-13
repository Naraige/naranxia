import { dist } from '../core/math.js';
import { C, CSTONE, CWOOD, DIR4, RS, TS } from './rules.js';
import { sessionState } from './session.js';
import { MP } from '../multiplayer/session.js';
import { CAM } from '../rendering/scene.js';

export const playersState = {
  BTIER: 1,
  CURPL: 0,
  RESP: [{g:0,w:0,s:0,f:0},{g:0,w:0,s:0,f:0}],
};

export const BAD=new Map();
export const CASTLES=()=>sessionState.CS2?[sessionState.CS,sessionState.CS2]:[sessionState.CS];
export const aliveC=()=>CASTLES().filter(c=>c.hp>0&&sessionState.structs.includes(c));
export const nearC=(x,y)=>{let b=sessionState.CS,bd=1e12;for(const c of aliveC()){const d=(c.x-x)*(c.x-x)+(c.y-y)*(c.y-y);if(d<bd){bd=d;b=c}}return b};
export const stoneOn=()=>RS.done&&playersState.BTIER;
export function setTier(v){playersState.BTIER=v?1:0;Object.assign(C,RS.done&&playersState.BTIER?CSTONE:CWOOD)}
/* the local player's index. A guest whose partner left goes on alone as player 2 (MP.side): it used to fall back to 0 and found itself
   running the host's kingdom (resources, buildings, home key) for the rest of the game */
export const LPL=()=>MP.on?(MP.host?0:1):(MP.side|0),setPl=p=>{playersState.CURPL=p;sessionState.res=playersState.RESP[p]};

export const HOMEC=()=>playersState.CURPL===1&&sessionState.CS2?sessionState.CS2:sessionState.CS;
export const killPl=u=>!sessionState.CS2||!sessionState.SITE2?0:u.lane>=3?1:u.lane>=0?0:dist(u.x,u.y,sessionState.CS2.x,sessionState.CS2.y)<dist(u.x,u.y,sessionState.CS.x,sessionState.CS.y)?1:0;
export const homeOf=u=>{if(u.dpV===sessionState.ver&&u.dp&&u.dp.hp>0)return u.dp;let b=null,bd=1e12;for(const s of sessionState.structs)if(s.t===0&&s.hp>0&&s.prog>=1&&(s.type==='castle'||s.type==='storage')){const d=(s.x-u.x)*(s.x-u.x)+(s.y-u.y)*(s.y-u.y);if(d<bd){bd=d;b=s}}u.dp=b||nearC(u.x,u.y);u.dpV=sessionState.ver;return u.dp};
export const dpt=h=>{if(h.type!=='castle')return h;const[dx,dy]=DIR4[(h.rot|0)&3],z=h.sz||3;return dy?{x:(h.tx+z/2)*TS,y:(dy>0?h.ty+z+.5:h.ty-.5)*TS}:{x:(dx>0?h.tx+z+.5:h.tx-.5)*TS,y:(h.ty+z/2)*TS}};

export const LC=l=>l>=3&&sessionState.CS2?sessionState.CS2:sessionState.CS;

export const fdist=(x,y)=>{if(!MP.on)return dist(CAM.x*TS,CAM.z*TS,x,y);let m=1e12;for(const q of aliveC())m=Math.min(m,dist(q.x,q.y,x,y));return m};
export const focus=()=>MP.on?{x:sessionState.CS.x,y:sessionState.CS.y}:{x:CAM.x*TS,y:CAM.z*TS};

const myTerr=(tx,ty)=>!MP.on||!sessionState.CS2||nearC((tx+.5)*TS,(ty+.5)*TS)===HOMEC()||!aliveC().includes(HOMEC());
