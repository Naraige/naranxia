import { snd } from '../audio/sound.js';
import { startGame } from '../gameplay/lifecycle.js';
import { reset } from '../gameplay/reset.js';
import { TH, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { T_, TTL, TTS, twH } from '../i18n/language.js';
import { lobbyShow } from '../multiplayer/lobby.js';
import { MP } from '../multiplayer/session.js';
import { PKL, pkLiveFocus } from '../rendering/live-site-preview.js';
import { PK, pkFocus, pkInit } from '../rendering/site-picker.js';
import { cvs } from './canvases.js';
import { BTN, BTNH, frame, menuSkin, PAN } from './drawing.js';
import { bevelBtn } from './menu-kit.js';
import { fxTitleSeen } from './menu-fx.js';
import { hudState, U } from './hud.js';
import { dIc, IC } from './icons.js';
import { pill } from './minimap.js';
import { camKeys, KB } from './settings.js';
import { settingsState } from './panel-state.js';
import { dailyMap } from '../world/daily-map.js';
import { _bwat, baseHW, rollWorld } from '../world/terrain.js';
import { LAND, ROCKH, SNOW, terrainState } from '../world/terrain-state.js';

export const sitePickerState = {
  picking: false,
  pickPos: null,
  pvKey: -1,
  pickMsg: '',
};

/* ---- castle site picker ---- */
let pvC = null;
export let pvH = null;
export let pvW = null;
export const PVS = 3;
export let PVW;
export let PVH;

export function buildPreview(){sitePickerState.pvKey=terrainState.SEED;pvC=cvs(PVW,PVH);const g=pvC.getContext('2d'),im=g.createImageData(PVW,PVH);pvH=new Uint8Array(PVW*PVH);pvW=new Uint8Array(PVW*PVH);
 for(let y=0;y<PVH;y++)for(let x=0;x<PVW;x++){const h=baseHW(Math.min(TW-1,x*PVS+1),Math.min(TH-1,y*PVS+1)),wt=_bwat,i=y*PVW+x;pvH[i]=h;pvW[i]=wt?1:0;let c;
  if(wt)c=[45,111,174];else if(h>=SNOW)c=[238,242,248];else if(h>=ROCKH)c=[138,143,153];else{const k=Math.max(0,Math.min(1,(h-LAND)/24));c=[(79+60*k)|0,(157-20*k)|0,(69+30*k)|0]}
  if(x>0&&y>0&&!wt){const d=(h-pvH[i-PVW-1])*5;c=c.map(v=>Math.max(0,Math.min(255,v+d)))}
  im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255}
 g.putImageData(im,0,0)}

let SITEM=null,SITEK=-1;

/* every preview cell where a castle may be founded (same rule as siteOK, computed at once with a summed-area table) */
export function siteMaskGet(){if(SITEK===terrainState.SEED&&SITEM)return SITEM;if(sitePickerState.pvKey!==terrainState.SEED||!pvW)buildPreview();const W=PVW,H=PVH,W1=W+1,B=new Int32Array(W1*(H+1));
 for(let j=0;j<H;j++){let row=0;for(let i=0;i<W;i++){const k=j*W+i;row+=(pvW[k]||pvH[k]>=ROCKH)?1:0;B[(j+1)*W1+i+1]=B[j*W1+i+1]+row}}
 const M=new Uint8Array(W*H);for(let cy=6;cy<H-6;cy++)for(let cx=6;cx<W-6;cx++){const tx=cx*PVS+1,ty=cy*PVS+1;if(tx<140||ty<110||tx>TW-140||ty>TH-110)continue;const x0=cx-2,x1=cx+3,y0=cy-2,y1=cy+3;if(B[y1*W1+x1]-B[y0*W1+x1]-B[y1*W1+x0]+B[y0*W1+x0]===0)M[cy*W+cx]=1}
 SITEK=terrainState.SEED;return SITEM=M}

export function siteOK(tx,ty){if(tx<140||ty<110||tx>TW-140||ty>TH-110)return false;const cx=(tx/PVS)|0,cy=(ty/PVS)|0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const x=cx+i,y=cy+j;if(x<0||y<0||x>=PVW||y>=PVH)return false;const k=y*PVW+x;if(pvW[k]||pvH[k]>=ROCKH)return false}return true}

export function randomSite(){if(sitePickerState.pvKey!==terrainState.SEED)buildPreview();for(let a=0;a<2000;a++){const tx=140+((Math.random()*(TW-280))|0),ty=110+((Math.random()*(TH-220))|0);if(siteOK(tx,ty)){sitePickerState.pickPos={tx,ty,ok:true};return}}}

export function openPicker(){sitePickerState.picking=true;PKL.on=true;sitePickerState.pickPos=null;sitePickerState.pickMsg='';if(sitePickerState.pvKey!==terrainState.SEED)buildPreview();randomSite();if(!PK)pkInit();pkFocus();PK.dist=400;if(sitePickerState.pickPos)pkLiveFocus(sitePickerState.pickPos.tx,sitePickerState.pickPos.ty)}

export let confirmPick = function confirmPick(){if(!sitePickerState.pickPos||!sitePickerState.pickPos.ok)return;terrainState.CX=sitePickerState.pickPos.tx;terrainState.CY=sitePickerState.pickPos.ty;sessionState.CROT=sessionState.PKROT&3;sitePickerState.picking=false;settingsState.setupOpen=false;MP.side=0;reset();sessionState.inGame=false;startGame()};

export function drawPicker(UW,UH){menuSkin(true);try{drawPickerIn(UW,UH)}finally{menuSkin(false)}}
function drawPickerIn(UW,UH){if(!sessionState.inGame)fxTitleSeen();settingsState.nameBox=null;if(sitePickerState.pvKey!==terrainState.SEED)buildPreview();hudState.uiHits=[];
 const pw=Math.min(UW-12,600),px=(UW-pw)/2,ph=50,py=UH-ph-6;hudState.uiRects=[U(px,5,pw,22),U(px,py,pw,ph)];
 const rw=pw>=420?112:0;
 frame(px,5,pw,22,PAN,6);dIc(IC.home,px+8,8,15);{const s='Choose where to found your kingdom';let sc=1.12;while(sc>.7&&twH(s,sc)>pw-(pw>=300?132:34)-rw)sc-=.04;TTL(s,px+26,16-TTS(sc)/2,sc)}
 if(pw>=300)pill(px+pw-96,7,90,18,PKL.on?'World map':'Castle view',BTN,BTNH,()=>{PKL.on=!PKL.on;if(PKL.on&&sitePickerState.pickPos)pkLiveFocus(sitePickerState.pickPos.tx,sitePickerState.pickPos.ty);else if(PK)pkFocus()},IC.map,.8);
 if(rw)pill(px+pw-96-rw,7,rw-6,18,'Turn castle ['+KB.rotate.toUpperCase()+']',BTN,BTNH,pkRotate,IC.rotate||null,.8);
 frame(px,py,pw,ph,PAN,6);const by=py+7,bw=Math.min(92,(pw-24)/4);
 pill(px+8,by,bw,18,'Random spot',BTN,BTNH,()=>{randomSite();pkFocus();sitePickerState.pickMsg=''},IC.dice,.85);
 if(!(MP.conn&&!MP.host))pill(px+8+bw+5,by,bw,18,'New map',BTN,BTNH,()=>{rollWorld();randomSite();pkFocus();sitePickerState.pickMsg=''},IC.map,.85);
 pill(px+8+(bw+5)*2,by,bw,18,'Back',BTN,BTNH,()=>{sitePickerState.picking=false;if(MP.conn)lobbyShow()},null,.85);
 if(pw>=560&&!(MP.conn&&!MP.host))pill(px+8+(bw+5)*3,by,bw,18,'Daily map',BTN,BTNH,()=>{dailyMap();randomSite();pkFocus();sitePickerState.pickMsg=''},IC.map,.85);
 const sw=Math.max(44,Math.min(140,pw-16-(bw+5)*(pw>=560?4:3)));bevelBtn(px+pw-8-sw,by-1,sw,20,MP.conn?'Place my castle':'Found kingdom','go',confirmPick,{nav:false,sc:.9,dis:!(sitePickerState.pickPos&&sitePickerState.pickPos.ok)});
 const hv=PKL.on?PKL.hit:PK&&PK.hit;T_(sitePickerState.pickMsg||(hv?(hv.ok?'Good site - click to place your castle here':'Not suitable: needs dry, gentle land away from the edge'):'Map #'+((terrainState.SEED*1000)|0)),px+8,py+31,sitePickerState.pickMsg?'#ff9a9a':hv&&hv.ok?'#9ff0b0':'#b59773',.8);
 T_(PKL.on?'Click to place the castle  -  drag / '+camKeys()+': move   Right drag: rotate   Wheel: zoom':'Left drag: move   Right drag: rotate   Wheel: zoom',px+8,py+40,'#b59773',.7)}

/* turn the castle a quarter turn while choosing its site (its door faces the new side) */
export function pkRotate(){sessionState.PKROT=(sessionState.PKROT+1)&3;snd('click');sitePickerState.pickMsg=''}

export function setConfirmPickHandler(handler) {
  confirmPick = handler;
}

export function initializeSitePickerMenu() {
  PVW = Math.ceil(TW/PVS);
  PVH = Math.ceil(TH/PVS);
}
