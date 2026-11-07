import { selectionState } from './selection.js';
import { D_, sessionState } from './session.js';
import { mpModal } from '../multiplayer/lobby.js';
import { mpSend } from '../multiplayer/lockstep.js';
import { MP } from '../multiplayer/session.js';
import { home } from '../rendering/camera.js';
import { CAM } from '../rendering/scene.js';
import { saveMenuState } from '../ui/save-menu.js';
import { registryHide } from '../multiplayer/registry.js';
import { settingsState } from '../ui/settings.js';
import { sitePickerState } from '../ui/site-picker.js';
import { rollWorld } from '../world/terrain.js';

/* ---- game flow ---- */
export let startGame = function startGame(){if(!sessionState.inGame){sessionState.res.g=D_().g;sessionState.waveT=sessionState.waveI=D_().first;sessionState.inGame=true}sessionState.started=true;sessionState.showMap=false;if(sessionState.camSave){Object.assign(CAM,sessionState.camSave);sessionState.camSave=null}else home()};

export function setStartGameHandler(handler) {
  startGame = handler;
}

export function newGame(){rollWorld();sessionState.over=false;sessionState.inGame=false;sessionState.started=false;settingsState.setupOpen=true;settingsState.settingsOpen=false}

/* leave the current game for the title screen; in co-op the partner is told (the link closes) and carries on alone */
export function quitGame(){if(MP.conn||MP.on){mpSend({k:'bye'});try{MP.pcon&&MP.pcon.close()}catch(e){}try{MP.peer&&MP.peer.destroy()}catch(e){}
  registryHide();MP.peer=null;MP.pcon=null;MP.dc=null;MP.conn=false;MP.on=false;MP.host=false;MP.code='';MP.mine=null;MP.theirs=null;MP.desync=false;MP.stall=false;try{mpModal(false)}catch(e){}}
 sessionState.inGame=false;sessionState.started=false;sessionState.over=false;sessionState.paused=false;sitePickerState.picking=false;settingsState.setupOpen=false;settingsState.settingsOpen=false;saveMenuState.saveOpen=false;sessionState.camSave=null;sessionState.mode=null;selectionState.selB=null;selectionState.castleSel=false;selectionState.SELBS=[]}

export function openMenu(){sessionState.camSave={...CAM};sessionState.started=false;sessionState.mode=null}
