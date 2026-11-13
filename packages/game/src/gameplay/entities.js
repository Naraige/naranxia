import { rnd } from '../core/math.js';
import { constructionState, doorTiles, tilesFor } from './construction.js';
import { playersState, stoneOn } from './players.js';
import { BT, C, ROTT, SH, T, TS, TW } from './rules.js';
import { sessionState } from './session.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { occ, terrainState } from '../world/terrain-state.js';
import { fv, solid, solidAt } from '../world/traversal.js';

export function mk(t,type,tx,ty,sz,done,ax,gl){gl=type==='gate'?(gl||2):0;const tiles=tilesFor(type,tx,ty,sz,ax,gl),g=type==='gate',s={sid:++sessionState.SID,pl:playersState.CURPL,t,type,tx,ty,sz,tiles,ax:ax||0,gl,rot:t===0&&type!=='castle'&&ROTT.has(type)?(constructionState.buildRot&3):0,rad:g?20*gl:sz*20,x:g?(tx+(ax?.5:gl/2))*TS:(tx+sz/2)*TS,y:g?(ty+(ax?gl/2:.5))*TS:(ty+sz/2)*TS,hp:SH[type],max:SH[type],cd:0,prog:done?1:0,bt:BT[type]||1};
 s.tier=1;if(t===0)s.cost={...(C[type]||{})};if(t===0&&type!=='ballista'&&type!=='trebuchet'&&type!=='torch'&&type!=='keep'&&!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower'))){s.tier=0;s.max=Math.round(s.max*.5);s.hp=s.max}if(!done){s.hp=s.max*.12;if(t===0){hudDisplayState.msgS='Peasants must build it: right-click the site';hudDisplayState.msgT=4}}sessionState.structs.push(s);for(const[x,y]of tiles)occ.set(y*TW+x,s);sessionState.fdDirty=true;return s}

/* only our units belong to a player; zombies and AI units are created during the simulation, where CURPL is the local player
   (0 on the host, 1 on the guest), so they would otherwise carry a different owner on each machine */
export function mkU(t,type,x,y,jb,lane){return{uid:++sessionState.UID,pl:t===0?playersState.CURPL:0,spj:.88+Math.random()*.24,gar:null,buff:1,t,type,x,y,hp:T[type].hp,cd:0,carry:false,cj:null,work:0,job:jb||null,cap:null,sq:null,hc:0,tl:-1,sel:false,o:null,px:x,py:y,sT:.6,det:0,dir:1,mv:false,walk:0,face:0,atk:0,ph0:Math.random()*9,lane:lane==null?-1:lane,ph:0}}

export function spawnPos(s){if(s.type==='castle'&&s.tiles){const D=doorTiles(s,1).filter(([x,y])=>!solid(x,y));if(D.length){const[x,y]=D[(Math.random()*D.length)|0];return{x:(x+.5)*TS+rnd(-8,8),y:(y+.5)*TS+rnd(-8,8)}}}
 for(let k=0;k<40;k++){const a=Math.random()*6.28,r=s.rad+24,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(!solidAt(x,y)&&(k>30||fv(terrainState.FP,Math.floor(x/TS),Math.floor(y/TS))<65535))return{x,y}}return{x:s.x,y:s.y}}

export function spawn(t,type,free,jb,cc){const p=spawnPos(cc||sessionState.CS);sessionState.units.push(mkU(t,type,p.x,p.y,jb))}
