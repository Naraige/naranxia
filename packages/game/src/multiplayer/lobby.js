import { GVER } from '../core/version.js';
import { sessionState } from '../gameplay/session.js';
import { swarmState } from '../gameplay/swarm.js';
import { L } from '../i18n/language.js';
import { _N } from './commands.js';
import { lobbyHost, lobbyJoin } from './connection.js';
import { mpBegin, mpSend } from './lockstep.js';
import { registryHide, registryList, registryOn } from './registry.js';
import { MP } from './session.js';
import { THEME } from '../ui/kingdom-theme.js';
import { settingsState } from '../ui/panel-state.js';
import { openPicker, setConfirmPickHandler, sitePickerState } from '../ui/site-picker.js';
import { rollWorld, setRollWorldHandler } from '../world/terrain.js';
import { terrainState } from '../world/terrain-state.js';

/* the two castles may stand side by side: only their 5x5 walls and the 3 tiles in front of each door must not overlap */
export const sitesFar=(a,b)=>!a||!b||Math.max(Math.abs(a.tx-b.tx),Math.abs(a.ty-b.ty))>=10;

/* ---- lobby state ---- */
export function mpConnected(){registryHide();MP.conn=true;MP.mine=null;MP.theirs=null;mpSend({k:'hello',n:THEME.n,v:GVER});if(MP.host)mpWorldSync();lobbyRender();lobbyShow()}

/* the one line on top during a co-op game: what is happening and what the player has to do. Nothing while the game runs: a short wait
   (under 1.5 s) for the partner's commands is not shown, and the line goes as soon as the game moves again */
export function mpBanner(now){const nm=MP.pname||'Player',ws=MP.stall&&!sessionState.paused?(now-(MP.stallAt||now))/1000:0,quiet=(now-(MP.rxAt||now))/1000;
 if(MP.rsy||MP.desync)return 'Co-op: putting both games back in step, a few seconds (nothing to do)';
 if(ws>=1.5&&quiet>=6)return 'Co-op: no answer from '+nm+' for '+Math.round(quiet)+' s, the game goes on when the connection is back';
 if(ws>=1.5)return 'Co-op: waiting for '+nm+', '+Math.round(ws)+' s (slow connection or computer)';
 if(MP.rtt>=250)return 'Co-op: slow connection ('+MP.rtt+' ms)';
 return ''}

export function mpWorldSync(){if(MP.conn&&MP.host){MP.theirs=null;mpSend({k:'w',seed:terrainState.SEED,gpr:terrainState.GPR,d:sessionState.diffI});MP.mine=null;lobbyRender()}}

let _rw;

export function mpStart(){if(!MP.host||!MP.mine||!MP.theirs)return;if(MP.pver&&MP.pver!==GVER){lobbyNote('Different versions ('+GVER+' and '+MP.pver+'): both players must run the same one - restart the launcher or reload the page');return}if(!sitesFar(MP.mine,MP.theirs)){lobbyNote('The two castles are too close: one of you must move.');return}
 const st={k:'s',seed:terrainState.SEED,gpr:terrainState.GPR,cx:MP.mine.tx,cy:MP.mine.ty,cr:MP.mine.rot|0,cx2:MP.theirs.tx,cy2:MP.theirs.ty,cr2:MP.theirs.rot|0,d:sessionState.diffI,sw:swarmState.SWF};mpSend(st);mpBegin(st)}


/* ---- DOM window (same visual identity as the game) ---- */
let mpEl;

let mpHud;

export const $m=id=>document.getElementById(id);

export function mpStatus(t){$m('mpSt').textContent=t}

export function mpModal(v){mpEl.style.display=v?'flex':'none'}

export function lobbyNote(t){mpStatus(t)}

export function mpFallback(_v){}

function pubLabel(){const on=$m('mpPub').checked;$m('mpPubT').textContent=(on?'\uD83C\uDF10 ':'\uD83D\uDD12 ')+L(on?'Public game: listed in the lobby':'Private game: only with the code')}

function lobbyTexts(){$m('mpBL').textContent=L('Public games');$m('mpPubH').textContent=L('Public games');pubLabel();$m('mpPubR').textContent=L('Refresh')}

export function mpOpenJoin(){mpOpen();$m('mpBJ').click()}

export function mpOpen(){lobbyTexts();mpModal(true);if(MP.conn)lobbyShow()}

export function lobbyShow(){mpModal(true);$m('mpHostP').style.display='none';$m('mpHome').style.display='none';$m('mpJoinP').style.display='none';$m('mpLobby').style.display=(MP.conn||MP.code)?'block':'none';$m('mpBack').style.display='none';$m('mpPubP').style.display='none';lobbyRender()}

export function lobbyRender(){const L=$m('mpLobby');if(!L)return;$m('mpRoom').textContent=MP.code||'-----';
 const me=THEME.n||'You',row=(id,name,on,rdy,txt)=>{const e=$m(id);e.className='pl'+(on?' on':' off')+(rdy?' rdy':'');e.children[1].textContent=name;e.children[2].textContent=txt};
 const hostN=MP.host?me:(MP.pname||'Host'),guestN=MP.host?(MP.pname||''):me;
 row('mpP1',hostN+' (host)',MP.host||MP.conn,MP.host?!!MP.mine:!!MP.theirs,(MP.host?MP.mine:MP.theirs)?'Castle placed - ready':'Choosing a castle site...');
 const g=MP.host?MP.conn:true;row('mpP2',g?guestN:'Waiting for player 2...',g,MP.host?!!MP.theirs:!!MP.mine,g?((MP.host?MP.theirs:MP.mine)?'Castle placed - ready':'Choosing a castle site...'):'');
 $m('mpSite').textContent=MP.mine?'Change my castle site':'Choose my castle site';$m('mpSite').disabled=!MP.conn;
 const pb=$m('mpPlay');pb.style.display=MP.host?'inline-block':'none';const rd=MP.conn&&MP.mine&&MP.theirs;pb.disabled=!rd;pb.textContent=rd?'Play':'Play (both players must place a castle)';
 if(!MP.host&&MP.conn&&MP.mine&&MP.theirs)mpStatus('Waiting for the host to press Play...')}

export function initializeLobbyState() {
  _rw = rollWorld;
  setRollWorldHandler(function(){_rw();if(MP.conn&&MP.host&&!MP.on)mpWorldSync()});

  setConfirmPickHandler(function(){
   if(!MP.conn){sessionState.SITE2=null;return _N.confirmPick()}
   if(!sitePickerState.pickPos||!sitePickerState.pickPos.ok)return;const me={tx:sitePickerState.pickPos.tx,ty:sitePickerState.pickPos.ty};
   if(!sitesFar(me,MP.theirs)){sitePickerState.pickMsg='Your castles would overlap: move a little away from your partner';return}
   me.rot=sessionState.PKROT&3;MP.mine=me;mpSend({k:'ready',cx:me.tx,cy:me.ty,r:me.rot});sitePickerState.picking=false;settingsState.setupOpen=false;lobbyRender();lobbyShow()});
}

/* ---- public games list ---- */
function pubBack(){$m('mpPubP').style.display='none';$m('mpJoinP').style.display='none';$m('mpHostP').style.display='none';$m('mpHome').style.display='block';$m('mpBack').style.display='none'}

export async function pubRefresh(){const box=$m('mpPubL'),note=t=>{box.textContent='';const d=document.createElement('div');d.className='none';d.textContent=L(t);box.appendChild(d)};
 if(!registryOn()){note('The public lobby is not set up yet: join with a code.');return}
 note('Loading...');let list;try{list=await registryList()}catch {note('Could not reach the lobby. Check your connection and try again.');return}
 if(!list.length){note('No public game right now: host one!');return}
 box.textContent='';for(const g of list){const r=document.createElement('div');r.className='pg';const n=document.createElement('span');n.className='nm';n.textContent=g.name||L('Nameless');const c=document.createElement('span');c.className='cd2';c.textContent=g.code+(g.ver&&g.ver!==GVER?'  ('+g.ver+')':'');const b=document.createElement('button');b.className='pri';b.textContent=L('Join');b.onclick=()=>{$m('mpPubP').style.display='none';lobbyJoin(g.code)};r.append(n,c,b);box.appendChild(r)}}

export function initializeLobby() {
  mpEl = document.createElement('div');
  mpEl.id='mp';
  mpEl.style.display='none';


  mpEl.appendChild(document.getElementById('coop-lobby-template').content.cloneNode(true));


  document.body.appendChild(mpEl);
  mpHud = document.createElement('div');
  mpHud.id='mpHud';
  document.body.appendChild(mpHud);

  $m('mpBH').onclick=()=>{$m('mpHome').style.display='none';$m('mpHostP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpHCode').focus()};

  $m('mpMk').onclick=()=>{$m('mpHostP').style.display='none';$m('mpBack').style.display='none';lobbyHost($m('mpHCode').value)};

  $m('mpHCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$m('mpMk').click()});

  $m('mpBJ').onclick=()=>{$m('mpHome').style.display='none';$m('mpJoinP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpCode').focus()};

  $m('mpBL').onclick=()=>{$m('mpHome').style.display='none';$m('mpPubP').style.display='block';$m('mpBack').style.display='inline-block';pubRefresh()};

  $m('mpPubR').onclick=pubRefresh;

  $m('mpPub').onchange=pubLabel;

  $m('mpBack').onclick=pubBack;

  $m('mpGo').onclick=()=>lobbyJoin($m('mpCode').value);

  $m('mpCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')lobbyJoin($m('mpCode').value)});

  $m('mpClose').onclick=()=>mpModal(false);

  $m('mpSite').onclick=()=>{mpModal(false);settingsState.setupOpen=false;settingsState.settingsOpen=false;openPicker();sitePickerState.pickMsg=MP.host?'':'Choose where YOUR castle will stand'};

  $m('mpPlay').onclick=mpStart;

  setInterval(()=>{if(MP.on)mpSend({k:'pg',t:performance.now()})},2000);
  setInterval(()=>{let t='';if(MP.on)t=mpBanner(performance.now());
   else if(MP.conn&&sitePickerState.picking){t='Co-op lobby - '+(MP.mine?'your castle: placed':'choose your castle site')+' | '+(MP.pname||'partner')+': '+(MP.theirs?'ready':'choosing...')}
   else if(MP.conn&&!MP.host&&sessionState.started===false&&MP.mine&&MP.theirs)t='Waiting for the host to press Play';
   if(t!==mpHud._t){mpHud._t=t;mpHud.textContent=t;mpHud.style.display=t?'block':'none'}},300);
}
