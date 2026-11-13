import { snd } from "../audio/sound.js";
import { bastionHas, bastionHasNow } from "./economy.js";
import { playersState } from "./players.js";
import { sessionState } from "./session.js";
import { MP } from "../multiplayer/session.js";
import { hudDisplayState } from "../ui/hud-state.js";

/* ================= EVENTS WITH A CHOICE (events-camps) =================
   Two wave events used to be automatic gifts: the merchant caravan (wave %4 = 2) and the rebel envoys (wave %6 = 4).
   Now each opens a banner with two buttons. The decision is a lockstep command ('ev', see multiplayer/commands.js), the first click decides
   for both players, and the simulation never waits: after EV_TTL seconds of SIM time the first (safe) choice is taken.
   State lives in eventsState (SAVA key EVT, tolerant of absent fields): cur = the open event, q = events waiting for their turn,
   pay = escorted caravans on their way. An event is plain data {k,i,a,cn,mu,exp}, texts are built when drawn.
     caravan  0 take the goods now (gold, wood, stone)      1 escort it: gold x EV_ESCK, paid EV_ESC seconds later
     envoys   0 accept the tribute (gold, food)             1 refuse: +1 renown (RESP[p].ren), each point adds RENOWN_STEP to every rebel tribute */
export const EV_TTL = 30;
export const EV_ESC = 40;
export const EV_ESCK = 2.5;
export const RENOWN_STEP = 0.1;
export const RENOWN_MAX = 10;

export const eventsState = { cur: null, q: [], pay: [] };

/* a save without the EVT key leaves the fields missing: always go through here */
const E = () => {
  const s = eventsState;
  if (!s.cur) s.cur = null;
  if (!Array.isArray(s.q)) s.q = [];
  if (!Array.isArray(s.pay)) s.pay = [];
  return s;
};

export function evReset() {
  eventsState.cur = null;
  eventsState.q = [];
  eventsState.pay = [];
}

export const renownOf = (p) => (playersState.RESP[p] || {}).ren | 0;

export const renownMul = (p) => 1 + RENOWN_STEP * Math.min(RENOWN_MAX, renownOf(p));

export const evCur = () => E().cur;

export const evLeft = () => {
  const e = E().cur;
  return e ? Math.max(0, e.exp - sessionState.time) : 0;
};

function activate(e) {
  e.exp = sessionState.time + EV_TTL;
  E().cur = e;
  snd(e.k === "car" ? "caravan" : "envoy");
}

/* called from wave(): the event opens now, or waits behind the one still open (stable order) */
export function evPush(e) {
  const S = E();
  if (!S.cur) activate(e);
  else S.q.push(e);
}

/* a message for the chooser; the partner gets it as a note, the timeout shows it to both */
function evMsg(text) {
  if (MP.ex && MP.rmt) {
    MP.note = text;
  } else {
    hudDisplayState.msgS = text;
    hudDisplayState.msgT = 6;
  }
}

function payOut(p) {
  const R = playersState.RESP;
  for (let pi = 0; pi < R.length; pi++) {
    const m = bastionHas(pi, "embassy") ? 1.5 : 1;
    R[pi].g += Math.round((p.g | 0) * m);
  }
  hudDisplayState.msgS = "The caravan reaches the market: +" + (p.g | 0) + " gold";
  hudDisplayState.msgT = 6;
  snd("caravan");
}

/* c = 0 or 1. A wrong or stale id (already decided, expired) is ignored, so a late click on one machine cannot split the two. */
export function resolveEvent0(id, c) {
  const S = E(),
    e = S.cur;
  if (!e || e.i !== id) return;
  S.cur = null;
  c = c === 1 ? 1 : 0;
  const R = playersState.RESP;
  if (e.k === "car") {
    const a = e.a;
    if (c === 0) {
      for (let pi = 0; pi < R.length; pi++) {
        const m = bastionHasNow(pi, "embassy") ? 1.5 : 1;
        R[pi].g += Math.round(a.g * m);
        R[pi].w += Math.round(a.w * m);
        R[pi].s += Math.round(a.s * m);
      }
      snd("caravan");
      evMsg("A merchant caravan passes: +" + a.g + " gold, +" + a.w + " wood, +" + a.s + " stone");
    } else {
      const g = Math.round(a.g * EV_ESCK);
      S.pay.push({ t: sessionState.time + EV_ESC, g });
      evMsg("The caravan is escorted: it pays " + g + " gold in " + EV_ESC + " s");
    }
  } else {
    if (c === 0) {
      let gs = 0,
        fs = 0;
      for (let pi = 0; pi < R.length; pi++) {
        const m = (bastionHasNow(pi, "embassy") ? 1.5 : 1) * (e.mu || 1) * renownMul(pi);
        const g = Math.round(e.a.g * m),
          f = Math.round(e.a.f * m);
        R[pi].g += g;
        R[pi].f = (R[pi].f || 0) + f;
        if (!pi) {
          gs = g;
          fs = f;
        }
      }
      snd("envoy");
      evMsg("Tribute of " + (e.cn || "the rebel camps") + ": +" + gs + " gold, +" + fs + " food");
    } else {
      for (let pi = 0; pi < R.length; pi++) R[pi].ren = renownOf(pi) + 1;
      evMsg("Tribute refused: renown " + renownOf(0));
    }
  }
}

/* every sim tick (update0): escorted caravans arrive, an unanswered event takes its first choice, the next one in line opens */
export function eventsTick() {
  const S = E(),
    t = sessionState.time;
  for (let i = 0; i < S.pay.length; i++) {
    const p = S.pay[i];
    if (p.t <= t) {
      S.pay.splice(i, 1);
      i--;
      payOut(p);
    }
  }
  if (S.cur && t >= S.cur.exp) resolveEvent0(S.cur.i, 0);
  if (!S.cur && S.q.length) activate(S.q.shift());
}

/* player click: a lockstep command in co-op (handler installed by multiplayer/commands.js) */
export let evChoose = function evChoose(c) {
  const e = E().cur;
  if (e) resolveEvent0(e.i, c);
};

export function setEvChooseHandler(handler) {
  evChoose = handler;
}
