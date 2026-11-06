import { HOMEC, playersState } from './players.js';
import { sessionState } from './session.js';
import { MP } from '../multiplayer/session.js';

export const selectionState = {
  selB: null,
  pendB: false,
  castleSel: false,
  SELBS: [],
  lastClkB: 0,
  lastTyB: '',
};

/* double click on a building selects all of yours of that type (SELBS); it holds while selB is one of them */
export const selBs=()=>selectionState.selB&&selectionState.SELBS.length>1&&selectionState.SELBS.includes(selectionState.selB)?selectionState.SELBS.filter(s=>sessionState.structs.includes(s)&&s.hp>0&&s.prog>=1):[];
export const TRB=new Set(['barracks','academy','market','guild','castle']),curB=()=>selectionState.selB&&sessionState.structs.includes(selectionState.selB)&&selectionState.selB.prog>=1&&(!MP.on||(selectionState.selB.pl|0)===playersState.CURPL)&&TRB.has(selectionState.selB.type)?selectionState.selB:HOMEC();

export const sel=()=>sessionState.units.filter(u=>u.sel&&(!MP.on||u.t!==0||(u.pl|0)===playersState.CURPL));
