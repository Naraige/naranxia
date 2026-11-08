import { rebuildOwn } from '../ai/kingdoms.js';
import { LFLD, LFQS, LFQT } from '../ai/zombie-lanes.js';
import { setPl } from '../gameplay/players.js';
import { TH, TW } from '../gameplay/rules.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { SEPM } from '../gameplay/simulation.js';
import { MP } from '../multiplayer/session.js';
import { SAVA, svAssign, svDecode, svMigrate } from './save-format.js';
import { fogState, fowT } from '../rendering/fog.js';
import { icoPart } from '../rendering/pixel-icons.js';
import { build3D, rmStruct } from '../rendering/structures.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { saveMenuState } from '../ui/save-menu.js';
import { settingsState } from '../ui/settings.js';
import { sitePickerState } from '../ui/site-picker.js';
import { calcFD } from '../world/connectivity.js';
import { mmRGB } from '../world/minimap.js';
import { GF } from '../world/pathfinding.js';
import { CH, genF, initWorld, mg, NCX, NCY, RAWD, smDone, terrainState } from '../world/terrain.js';

export async function svApply(txt){const S=svMigrate(JSON.parse(txt));
 sessionState.paused=true;MP.on=false;sitePickerState.picking=false;settingsState.setupOpen=false;settingsState.settingsOpen=false;saveMenuState.saveOpen=false;sessionState.mode=null;selectionState.selB=null;
 terrainState.SEED=S.R.SEED;terrainState.GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));terrainState.CX=S.R.CX;terrainState.CY=S.R.CY;
 const D=await svDecode(S);
 sessionState.SITE2=null;for(const s of sessionState.structs||[])rmStruct(s);initWorld();for(const k in SAVA)if(!(k in D)&&!SAVA[k][1])svAssign(k,undefined);for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
 for(const u of sessionState.units){u.m=null;u._tc=null}for(const s of sessionState.structs)s.o3=null;
 GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(0);calcFD();sessionState.fdDirty=true;sessionState.ver++;rebuildOwn(true);
 fogState.fowTm=-9;fowT.needsUpdate=true;sessionState.inGame=true;sessionState.started=true;sessionState.paused=false;sessionState.showMap=false;sessionState.camSave=null;
 build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}
 hudDisplayState.msgS='Game loaded - wave '+sessionState.waveN;hudDisplayState.msgT=3}

/* redraw the minimap for every chunk already generated */
export function svMini(){mg.fillStyle='#10151f';mg.fillRect(0,0,TW,TH);for(let cy=0;cy<NCY;cy++)for(let cx=0;cx<NCX;cx++){if(!genF[cy*NCX+cx])continue;const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),im=mg.createImageData(x1-x0,y1-y0);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=mmRGB(y*TW+x),k=((y-y0)*(x1-x0)+x-x0)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255}mg.putImageData(im,x0,y0)}}
