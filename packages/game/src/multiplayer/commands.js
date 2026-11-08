import { cancelTrain0 } from '../gameplay/economy.js';
import { repair0, roleAdj0 } from '../ai/worker-roles.js';
import { setSndHandler, snd } from '../audio/sound.js';
import { REALR } from '../core/random.js';
import { build, constructionState, setBuildHandler } from '../gameplay/construction.js';
import {
  setStartResearch2Handler,
  setStartResearchHandler,
  setTradeHandler,
  setTrainHandler,
  startResearch,
  startResearch2,
  trade,
  train,
} from '../gameplay/economy.js';
import {
  formationsState,
  order,
  setOrderHandler,
  setSetStanceHandler,
  setStance,
} from '../gameplay/formations.js';
import { kingSkill0, setKingSkillHandler } from '../gameplay/king-skills.js';
import { LPL, playersState, setPl, setTier } from '../gameplay/players.js';
import { RN2, RS, RS2 } from '../gameplay/rules.js';
import { curB, sel, selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { groupSel, setGroupSelHandler, setUngroupSelHandler, ungroupSel } from '../gameplay/squads.js';
import { callWave, setCallWaveHandler } from '../gameplay/waves.js';
import { sendConvoy0 } from './convoys.js';
import { MP } from './session.js';
import { puff, setPuffHandler } from '../rendering/effects.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { confirmPick } from '../ui/site-picker.js';

/* visual helpers must never consume the shared simulation random stream */
let _puff;
let _snd;

export let _N;

const selIds = ()=>sel().map(u=>u.uid);
export const mpPush = c=>MP.out.push(c);
const gated = ()=>MP.on&&!MP.ex;

export const repairB=function(sid){if(gated()){mpPush({k:'rp',b:sid});return}return repair0(sid)};

export const sendConvoy=function(c){if(gated()){mpPush({k:'cv',g:c.g|0,w:c.w|0,s:c.s|0,f:c.f|0});return}return sendConvoy0(c)};

export const cancelTrain=function(sid,i){if(gated()){mpPush({k:'cq',b:sid,i:i|0});return}return cancelTrain0(sid,i)};

export const ROLEK=new Set(['rb+','rb-','rr+','rr-','rt+','rt-']),roleAdj=function(r,d){if(gated()){mpPush({k:'ro',r,d});return}return roleAdj0(r,d)};

function withSel(S,fn){const keep=sessionState.units.map(u=>u.sel);sessionState.units.forEach(u=>u.sel=S.has(u.uid));try{fn()}finally{sessionState.units.forEach((u,i)=>u.sel=keep[i])}}

export let mpExec = function mpExec(c,mine){const m0=hudDisplayState.msgS,mt0=hudDisplayState.msgT,sl=selectionState.selB,fm=constructionState.formType,br=constructionState.buildRot;MP.ex=true;MP.rmt=!mine;MP.note=null;setPl(mine?LPL():1-LPL());
 try{switch(c.k){
  case'o':constructionState.formType=c.f;formationsState.FORCEF=c.fa==null?null:c.fa;try{withSel(new Set(c.i),()=>{if(sel().length)_N.order({x:c.x,y:c.y})})}finally{formationsState.FORCEF=null}break;
  case'b':{constructionState.buildRot=c.r;constructionState.gateLen=c.gl||2;selectionState.selB=c.sb!=null?(sessionState.structs.find(s=>s.sid===c.sb)||null):null;const bt0=playersState.BTIER;setTier(c.ti===undefined?1:c.ti);try{_N.build(c.t,c.x,c.y)}finally{setTier(bt0)}break}
  case't':selectionState.selB=sessionState.structs.find(s=>s.sid===c.b&&(s.pl|0)===playersState.CURPL)||null;_N.train(c.t);break;
  case'r':{const was=RS.on;_N.startResearch();if(!mine&&!was&&RS.on)MP.note=(MP.pname||'Your partner')+' started Stonemasonry (shared)';break}
  case'rp':repair0(c.b);break;
  case'w':_N.callWave();break;
  case'r2':{const was=RS2.on;_N.startResearch2(c.n);if(!mine&&!was&&RS2.on===c.n)MP.note=(MP.pname||'Your partner')+' started '+RN2[c.n]+' (shared)';break}
  case'tr':_N.trade(c.n);break;
  case'ro':roleAdj0(c.r,c.d);break;
  case'g':withSel(new Set(c.i),()=>_N.groupSel());break;
  case'u':withSel(new Set(c.i),()=>_N.ungroupSel());break
  case'st':withSel(new Set(c.i),()=>_N.setStance(c.s));break
  case'ks':kingSkill0(c.n);break;
  case'cq':cancelTrain0(c.b,c.i);break;
  case'cv':sendConvoy0(c);break}}
 finally{MP.ex=false;MP.rmt=false;setPl(LPL());selectionState.selB=sl;constructionState.formType=fm;constructionState.buildRot=br;if(!mine){hudDisplayState.msgS=m0;hudDisplayState.msgT=mt0;if(MP.note){hudDisplayState.msgS=MP.note;hudDisplayState.msgT=4;MP.note=null}}}};

export function setMpExecHandler(handler) {
  mpExec = handler;
}

export function initializeCommands() {
  _puff = puff;
  _snd = snd;

  setPuffHandler(function(){const m=Math.random;Math.random=REALR;try{return _puff.apply(null,arguments)}finally{Math.random=m}});

  setSndHandler(function(n){if(MP.ex&&MP.rmt&&(n==='err'||n==='click'))return;const m=Math.random;Math.random=REALR;try{return _snd.apply(null,arguments)}finally{Math.random=m}});
  _N = {setStance,startResearch2,order,build,train,startResearch,callWave,groupSel,ungroupSel,confirmPick,trade};

  setOrderHandler(function(w){if(gated()){mpPush({k:'o',i:selIds(),x:w.x,y:w.y,f:constructionState.formType,fa:formationsState.FORCEF});return}return _N.order(w)});

  setBuildHandler(function(t,x,y){if(gated()){mpPush({k:'b',t,x,y,r:constructionState.buildRot,ti:playersState.BTIER,gl:constructionState.gateLen,sb:selectionState.selB&&sessionState.structs.includes(selectionState.selB)?selectionState.selB.sid:null});return}return _N.build(t,x,y)});

  setTrainHandler(function(t){if(gated()){mpPush({k:'t',t,b:curB().sid});return}return _N.train(t)});

  setStartResearchHandler(function(){if(gated()){mpPush({k:'r'});return}return _N.startResearch()});

  setStartResearch2Handler(function(k){if(gated()){mpPush({k:'r2',n:k});return}return _N.startResearch2(k)});

  setCallWaveHandler(function(){if(gated()){mpPush({k:'w'});return}return _N.callWave()});

  setTradeHandler(function(k){if(gated()){mpPush({k:'tr',n:k});return}return _N.trade(k)});

  setKingSkillHandler(function(n){if(gated()){mpPush({k:'ks',n});return}return kingSkill0(n)});

  setSetStanceHandler(function(st){if(gated()){mpPush({k:'st',i:selIds(),s:st});return}return _N.setStance(st)});

  setGroupSelHandler(function(){if(gated()){mpPush({k:'g',i:selIds()});return}return _N.groupSel()});

  setUngroupSelHandler(function(){if(gated()){mpPush({k:'u',i:selIds()});return}return _N.ungroupSel()});
}
