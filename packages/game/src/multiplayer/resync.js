import { rebuildOwn } from '../ai/kingdoms.js';
import { LFLD, LFQS, LFQT } from '../ai/zombie-lanes.js';
import { rngf } from '../core/random.js';
import { LPL, setPl } from '../gameplay/players.js';
import { selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { SEPM } from '../gameplay/simulation.js';
import { MPD, mpSend } from './lockstep.js';
import { MP } from './session.js';
import { svMini } from '../persistence/restore.js';
import { SAVA, svAssign, svDecode, svEncode, svMigrate } from '../persistence/save-format.js';
import { fogState, fowT } from '../rendering/fog.js';
import { icoPart } from '../rendering/pixel-icons.js';
import { build3D, rmStruct } from '../rendering/structures.js';
import { CAM } from '../rendering/scene.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { calcFD } from '../world/connectivity.js';
import { GF } from '../world/pathfinding.js';
import { initWorld, RAWD, smDone, terrainState } from '../world/terrain.js';

const RSCH=48000;

export async function mpResync(){if(!MP.on||!MP.host||MP.rsy||sessionState.over)return;if(performance.now()-MP.rsLast<8000)return;MP.rsy='pack';MP.rsLast=performance.now();
 const T=MP.tick,M={ep:MP.ep+1,t:T,sd:(Math.imul(T+1,2654435761)^Math.floor(terrainState.SEED*1e6))>>>0};let txt;
 try{txt=JSON.stringify(await svEncode())}catch(e){MP.rsy=null;return}
 const n=Math.ceil(txt.length/RSCH);mpSend({k:'rs0',ep:M.ep,t:T,n,sd:M.sd});for(let i=0;i<n;i++)mpSend({k:'rs1',ep:M.ep,i,d:txt.slice(i*RSCH,(i+1)*RSCH)});
 MP.rsTxt=txt;MP.rsMeta=M;MP.rsy='sent'}

export function mpResMsg(m){
 /* a request from before the last resync (other epoch) is dropped: it used to start a second, needless one when the first took over 8 s */
 if(m.k==='rsq'){if(MP.host&&(m.f||(m.e|0)===MP.ep))mpResync();return}
 if(m.k==='rs0'&&!MP.host){MP.rsAt=performance.now();MP.rsy='recv';MP.rsBuf=new Array(m.n);MP.rsGot=0;MP.rsMeta={ep:m.ep,t:m.t,sd:m.sd};return}
 if(m.k==='rs1'&&!MP.host&&MP.rsy==='recv'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){MP.rsAt=performance.now();if(MP.rsBuf[m.i]===undefined){MP.rsBuf[m.i]=m.d;MP.rsGot++}
  if(MP.rsGot===MP.rsBuf.length){const txt=MP.rsBuf.join(''),M=MP.rsMeta;MP.rsBuf=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsAt=performance.now();MP.rsy='go';mpSend({k:'rsok',ep:M.ep})},()=>{MP.rsy=null})}return}
 if(m.k==='rsok'&&MP.host&&MP.rsy==='sent'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){const txt=MP.rsTxt,M=MP.rsMeta;MP.rsTxt=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsy=null;MP.rsLast=performance.now();mpSend({k:'rsgo',ep:M.ep})},()=>{MP.rsy=null});return}
 if(m.k==='rsgo'&&!MP.host&&MP.rsy==='go'&&m.ep===MP.ep){MP.rsy=null;return}}

/* load a snapshot inside a running co-op game: the local view (camera, selection, menu) is kept. Same steps as svApply, but the
   decoding (asynchronous) comes first, then everything that touches the simulation runs in one go with a seeded random stream,
   so the host and the guest rebuild exactly the same game */
async function mpResApply(txt,M){const cam={...CAM},keep=new Set(sessionState.units.filter(u=>u.sel).map(u=>u.uid)),sb=selectionState.selB&&sessionState.structs.includes(selectionState.selB)?selectionState.selB.sid:null,cs=selectionState.castleSel;
 const S=svMigrate(JSON.parse(txt));const D=await svDecode(S);
 const R0=Math.random;Math.random=rngf((M.sd^0x5bd1e995)>>>0);
 try{sessionState.mode=null;terrainState.SEED=S.R.SEED;terrainState.GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));terrainState.CX=S.R.CX;terrainState.CY=S.R.CY;
  sessionState.SITE2=null;for(const q of sessionState.structs||[])rmStruct(q);initWorld();for(const k in SAVA)if(!(k in D)&&!SAVA[k][1])svAssign(k,undefined);for(const k of['QST','fdT','fdDirty','lastFm'])if(!(k in D))svAssign(k,undefined);for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
  for(const u of sessionState.units)u.m=null;for(const q of sessionState.structs)q.o3=null;
  GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(LPL());{const fd=sessionState.fdDirty;calcFD();sessionState.fdDirty=fd}sessionState.ver++;rebuildOwn(true);
  fogState.fowTm=-9;fowT.needsUpdate=true;build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}}
 finally{Math.random=R0}
 Object.assign(CAM,cam);/* build3D() ends with home(): the view jumped back to the castle at every resync */
 for(const u of sessionState.units)u.sel=keep.has(u.uid);selectionState.selB=sb!=null?sessionState.structs.find(q=>q.sid===sb)||null:null;selectionState.castleSel=cs;selectionState.SELBS=[];
 /* what this player sent for ticks the snapshot does not hold yet (t >= M.t) was dropped with the old epoch on both machines: a click made just before a resync
    would vanish (nothing is paid, nothing built). Those commands go out again, in order, before anything new. */
 {const re=[];for(const[t,c]of(MP.sl||[]))if(t>=M.t)re.push(...c);MP.sl=[];if(re.length)MP.out=re.concat(MP.out)}
 MP.ep=M.ep;MP.simR=rngf(M.sd);MP.tick=M.t;MP.sent=M.t+MPD-1;MP.acc=0;MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;
 for(let k=M.t;k<M.t+MPD;k++){MP.loc[k]=[];MP.rem[k]=[]}
 hudDisplayState.msgS='Resynchronized with your partner';hudDisplayState.msgT=4}

export function initializeResync() {
  /* ---- co-op: automatic resynchronisation ----
     when the state hashes of the two machines differ, the host freezes the lockstep, sends a full snapshot of its game (the save
     format, in chunks), the guest loads it, then the host loads the very same snapshot and both restart from that tick with a
     fresh shared random stream: everything rebuilt while loading is rebuilt the same way on both sides, so the games agree again.
     Command and hash messages carry an epoch so nothing from before the resync is applied after it. */
  Object.assign(MP,{ep:0,rsy:null,rsLast:-1e9,rsTxt:null,rsMeta:null,rsBuf:null,rsGot:0});
}
