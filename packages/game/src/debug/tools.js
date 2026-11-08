import { snd } from '../audio/sound.js';
import { GVER } from '../core/version.js';
import { diagnosticsState, ERRLOG, MSGL } from './diagnostics.js';
import { finishResearch } from '../gameplay/economy.js';
import { mkU } from '../gameplay/entities.js';
import { HOMEC, playersState } from '../gameplay/players.js';
import { RS, RS2, T, TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { SW, swReset } from '../gameplay/swarm.js';
import { wavesState } from '../gameplay/waves.js';
import { LANG, LANGS, T_ } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { svEncode } from '../persistence/save-format.js';
import { icoPart } from '../rendering/pixel-icons.js';
import { CAM, g3, renderer } from '../rendering/scene.js';
import { buildStructMesh } from '../rendering/structures.js';
import { uiBtn } from '../ui/build-menu.js';
import { cv, cw } from '../ui/canvases.js';
import { BTN, BTNH, frame, GRN, GRNH, PAN, TN } from '../ui/drawing.js';
import { hudState, U } from '../ui/hud.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { dIc, IC } from '../ui/icons.js';
import { pill } from '../ui/minimap.js';
import { settingsState } from '../ui/settings.js';
import { terrainState } from '../world/terrain.js';
import { freeTile } from '../world/traversal.js';

/* ================= TOOLS: bug report (F8) and test mode (F10, solo) ================= */
/* bug report: one JSON file with the version, the seed, the whole game (save format), a screenshot, the last errors and
   messages and, in co-op, the last hash checks. tools/repro.py loads it in the headless game. Nothing here touches the simulation. */
let bugBusy=false;

export function bugCapture(){const q=diagnosticsState.BUGQ;diagnosticsState.BUGQ=null;try{const W=g3.width,H=g3.height,k=Math.min(1,1280/Math.max(1,W)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*k));c.height=Math.max(1,Math.round(H*k));
 const x=c.getContext('2d');x.drawImage(g3,0,0,c.width,c.height);x.drawImage(cw,0,0,c.width,c.height);x.drawImage(cv,0,0,c.width,c.height);q(c.toDataURL('image/jpeg',.72))}catch(e){q(null)}}

export async function bugReport(){if(bugBusy)return;bugBusy=true;hudDisplayState.msgS='Preparing the bug report...';hudDisplayState.msgT=3;
 try{const shot=await new Promise(r=>{diagnosticsState.BUGQ=r;setTimeout(()=>{if(diagnosticsState.BUGQ===r){diagnosticsState.BUGQ=null;r(null)}},1500)});
  let save=null;if(sessionState.started||sessionState.inGame){try{save=await svEncode()}catch(e){save={error:String(e&&e.message||e)}}}
  let gpu='';try{const gl=renderer.getContext(),d=gl.getExtension('WEBGL_debug_renderer_info');gpu=d?String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)):''}catch(e){}
  const rep={game:'Naranxia',kind:'bug report',ver:GVER,date:new Date().toISOString(),ua:navigator.userAgent,desktop:!!(window.NARX&&NARX.desktop),lang:LANGS[LANG][0],gpu,
   screen:[innerWidth,innerHeight,devicePixelRatio],mode:MP.on?(MP.host?'co-op host':'co-op guest'):sessionState.started?'solo':'menu',test:diagnosticsState.DEVU,seed:terrainState.SEED,time:+(+sessionState.time).toFixed(1),wave:sessionState.waveN,over:!!sessionState.over,paused:!!sessionState.paused,speed:sessionState.spd,
   units:sessionState.units.length,structs:sessionState.structs.length,swarm:SW.n,res:playersState.RESP.map(R=>({g:R.g|0,w:R.w|0,s:R.s|0,f:R.f|0})),
   cam:{x:+CAM.x.toFixed(2),z:+CAM.z.toFixed(2),dist:+CAM.dist.toFixed(1),yaw:+CAM.yaw.toFixed(2),pitch:+CAM.pitch.toFixed(2)},
   coop:MP.on?{tick:MP.tick,ep:MP.ep|0,desync:!!MP.desync,desyncs:MP.dsN|0,partner:MP.pname||'',partnerVer:MP.pver||'',hashes:(MP.hl||[]).slice(-40)}:null,
   errors:ERRLOG.slice(),messages:MSGL.slice(),save,shot};
  const d=new Date(),p2=n=>String(n).padStart(2,'0'),nm='naranxia-bug-'+GVER+'-'+d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+'.json';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(rep)],{type:'application/json'}));a.download=nm;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000);
  try{const sm='Naranxia '+GVER+' | '+rep.mode+' | wave '+rep.wave+' | '+rep.units+' units | '+rep.errors.length+' errors'+(rep.errors.length?'\n'+rep.errors.slice(-3).map(e=>String(typeof e==='string'?e:JSON.stringify(e)).slice(0,300)).join('\n'):'');navigator.clipboard.writeText(sm).catch(()=>{})}catch(e){}
  window.__bug=rep;hudDisplayState.msgS='Bug report saved: '+nm+' - send it on Discord with a few words';hudDisplayState.msgT=8;snd('click')}
 catch(e){hudDisplayState.msgS='Bug report failed: '+String(e&&e.message||e).slice(0,80);hudDisplayState.msgT=5;snd('err')}finally{bugBusy=false}}

/* ---- test mode: try a feature in seconds (resources, research, waves, zombies, speed). Solo only, because co-op runs
   the same simulation on both machines; a game where it was used earns no achievements and no best score. ---- */
const devOK=()=>sessionState.started&&sessionState.inGame&&!MP.on&&!sessionState.over;

export function devToggle(){if(MP.on){hudDisplayState.msgS='Test mode is for solo games';hudDisplayState.msgT=3;snd('err');return}if(!devOK())return;diagnosticsState.devOpen=!diagnosticsState.devOpen;snd('click')}

function devSpawn(type,n,r){const c=HOMEC();if(!c)return 0;let k=0;for(let i=0;i<n;i++){const a=i/n*6.283,f=freeTile(Math.round(c.tx+2+Math.cos(a)*r),Math.round(c.ty+2+Math.sin(a)*r));if(f){sessionState.units.push(mkU(1,type,(f[0]+.5)*TS,(f[1]+.5)*TS,null,-1));k++}}return k}

export function devAct(k){if(k==='bug'){bugReport();return}if(!devOK())return;diagnosticsState.DEVU=true;const R=playersState.RESP[playersState.CURPL|0];let m='';
 if(k==='res'){R.g+=10000;R.w+=10000;R.s+=10000;R.f=(R.f||0)+2000;m='+10000 gold, wood and stone, +2000 food'}
 else if(k==='rsch'){for(const q in RS2.done)RS2.done[q]=true;RS2.on=null;if(!RS.done)finishResearch();setTimeout(()=>{try{icoPart('units')}catch(e){}},0);m='All research done'}
 else if(k==='wave'){if(wavesState.waveOn)m='A wave is already under way';else{sessionState.waveT=.01;m='The next wave is coming'}}
 else if(k==='zomb')m=devSpawn('zombie',20,12)+' zombies spawned';
 else if(k==='brute')m=devSpawn('brute',3,14)+' brutes spawned';
 else if(k==='kill'){let n=SW.n;for(const u of sessionState.units)if(u.t===1&&u.hp>0){u.hp=0;n++}swReset();m=n+' zombies removed'}
 else if(k==='build'){let n=0;for(const s of sessionState.structs)if(s.t===0&&(s.pl|0)===(playersState.CURPL|0)&&s.prog<1){s.prog=1;s.hp=s.max;if(s.type==='storage')sessionState.fdDirty=true;if(s.o3)buildStructMesh(s);n++}m=n+' buildings finished'}
 else if(k==='heal'){for(const u of sessionState.units)if(u.t===0&&u.hp>0)u.hp=Math.max(u.hp,T[u.type].hp);for(const s of sessionState.structs)if(s.t===0&&s.prog>=1&&s.hp>0)s.hp=s.max;m='Everything healed'}
 else if(k==='spd'){sessionState.spd=sessionState.spd>=8?1:sessionState.spd>=4?8:sessionState.spd>=2?4:2;m='Speed x'+sessionState.spd}
 hudDisplayState.msgS=m;hudDisplayState.msgT=3;snd('click')}

export function drawDev(UW,UH){if(!devOK()){diagnosticsState.devOpen=false;return}const W=Math.min(238,UW-16),x=UW-W-8,y=settingsState.TOPH+40,bw=Math.floor((W-26)/2),bh=18;
 const B=[['+10000 resources','res'],['Unlock all research','rsch'],['Next wave now','wave'],['Spawn 20 zombies','zomb'],['Spawn 3 brutes','brute'],['Kill all zombies','kill'],['Finish all buildings','build'],['Heal everything','heal'],['Speed x'+sessionState.spd,'spd'],['Bug report [F8]','bug']];
 const H=38+Math.ceil(B.length/2)*(bh+4)+4;frame(x,y,W,H,PAN,6);hudState.uiRects.push(U(x,y,W,H));
 TN('Test mode [F10]',x+10,y+6,'#f2d48a',.84);uiBtn(x+W-20,y+4,16,13,BTN,BTNH,()=>{diagnosticsState.devOpen=false},['Close [F10]'],(bx,by)=>dIc(IC.close,bx+2,by+.5,12));
 T_('Solo only - no achievements in this game',x+10,y+21,'#b59773',.62);
 B.forEach(([lab,k],i)=>pill(x+10+(i%2)*(bw+6),y+36+Math.floor(i/2)*(bh+4),bw,bh,lab,k==='bug'?GRN:BTN,k==='bug'?GRNH:BTNH,()=>devAct(k),null,.72))}
