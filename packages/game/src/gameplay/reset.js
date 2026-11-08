import { campsState } from '../ai/camps.js';
import { initAI } from '../ai/kingdoms.js';
import { RHAS, ROLE, workerRolesState } from '../ai/worker-roles.js';
import { PRES, SAPL, workplacesState } from '../ai/workplaces.js';
import { PUD, SCRT } from '../ai/zombies.js';
import { diagnosticsState } from '../debug/diagnostics.js';
import { ACH, TOASTS } from './achievements.js';
import { castleRotAt, tfo } from './construction.js';
import { ALERTS, economyState, PBASE, PRICE, syncTradeC } from './economy.js';
import { mk, spawn } from './entities.js';
import { formationsState } from './formations.js';
import { lightingState } from './lighting.js';
import { BAD, playersState, setPl } from './players.js';
import { CLM, RL } from './resources.js';
import { C, CWOOD, FOOD0, RALLY, RALLYC, RS, RS2 } from './rules.js';
import { selectionState } from './selection.js';
import { D_, sessionState } from './session.js';
import { simulationState } from './simulation.js';
import { gstReset } from './statistics.js';
import { swReset } from './swarm.js';
import { wavesState } from './waves.js';
import { objectivesState, objReset, SPK } from '../multiplayer/objectives.js';
import { home } from '../rendering/camera.js';
import { fowReset } from '../rendering/fog.js';
import { ICR } from '../rendering/model-icons.js';
import { icoPart } from '../rendering/pixel-icons.js';
import { build3D } from '../rendering/structures.js';
import { tutStart } from '../ui/tutorial.js';
import { calcFD } from '../world/connectivity.js';
import { GF } from '../world/pathfinding.js';
import { ensureAround, initWorld, terrainState } from '../world/terrain.js';
import { LVO } from '../world/traversal.js';

export function pickLanes(){const n=Math.min(3,1+(sessionState.waveN>2?1:0)+(sessionState.waveN>6?1:0)+(Math.random()<.25?1:0)),A=[0,1,2].sort(()=>Math.random()-.5).slice(0,n);if(!sessionState.SITE2)return A;const n2=Math.min(3,1+(sessionState.waveN>2?1:0)+(sessionState.waveN>6?1:0)+(Math.random()<.25?1:0));return A.concat([3,4,5].sort(()=>Math.random()-.5).slice(0,n2))}

export function reset(){sessionState.jrn=[];diagnosticsState.DEVU=false;diagnosticsState.devOpen=false;simulationState.SIMTK=0;formationsState.FGS=[];formationsState.FORCEF=null;PUD.length=0;SCRT.clear();LVO.clear();simulationState.shelOn=false;simulationState.shelRel=0;for(const o of ROLE.concat(RHAS))o.b=o.r=o.t=0;workerRolesState.roleT=0;SAPL.clear();PRES.clear();workplacesState.saplT=0;swReset();wavesState.hordeT=-1e9;wavesState.hordeOn=false;wavesState.waveOn=false;wavesState.burnAt=0;wavesState.hordeD=1e9;wavesState.nightLv=0;wavesState.nightCk=0;wavesState.waveST=-1e9;lightingState.LITL=[];lightingState.darkT=0;Object.assign(PRICE,PBASE);economyState.priceT=0;syncTradeC();CLM.clear();ACH.clear();wavesState.WAVEZ=0;TOASTS.length=0;RALLY[0]=RALLY[1]=RALLYC[0]=RALLYC[1]=null;RS2.on=null;RS2.t=0;for(const k in RS2.done)RS2.done[k]=false;ALERTS.length=0;economyState.alertT=0;economyState.farmT=0;sessionState.UID=0;sessionState.SID=0;BAD.clear();fowReset();RS.done=false;RS.on=false;RS.t=0;Object.assign(C,CWOOD);playersState.BTIER=1;selectionState.selB=null;if(ICR){icoPart('tier');icoPart('units')}tfo.clear();campsState.campT=0;sessionState.units=[];sessionState.structs=[];sessionState.fx=[];sessionState.pt=[];sessionState.queue=[];playersState.RESP=[{g:D_().g,w:0,s:0,f:FOOD0},{g:D_().g,w:0,s:0,f:FOOD0}];setPl(0);sessionState.over=false;sessionState.time=0;sessionState.waveT=sessionState.waveI=D_().first;sessionState.kills=0;gstReset();objReset();tutStart();sessionState.paused=false;sessionState.bannerT=0;sessionState.waveN=0;sessionState.mode=null;SPK.clear();objectivesState.SPKV++;GF.clear();for(const k in RL)delete RL[k];
 initWorld();sessionState.CS2=null;sessionState.CS=mk(0,'castle',terrainState.CX-2,terrainState.CY-2,5,true);sessionState.CS.rot=castleRotAt(sessionState.CS,sessionState.CROT);if(sessionState.SITE2){ensureAround(sessionState.SITE2.tx,sessionState.SITE2.ty,3);setPl(1);sessionState.CS2=mk(0,'castle',sessionState.SITE2.tx-2,sessionState.SITE2.ty-2,5,true);sessionState.CS2.rot=castleRotAt(sessionState.CS2,sessionState.SITE2.rot|0);setPl(0)}sessionState.nextL=pickLanes();calcFD();initAI();
 ['g','w','s'].forEach(j=>spawn(0,'peasant',1,j));if(sessionState.CS2){setPl(1);['g','w','s'].forEach(j=>spawn(0,'peasant',1,j,sessionState.CS2));setPl(0)}build3D();home()}
