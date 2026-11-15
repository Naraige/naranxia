import { BASES } from "../ai/kingdoms.js";
import { ROLE } from "../ai/worker-roles.js";
import { snd } from "../audio/sound.js";
import { diagnosticsState } from "../debug/diagnostics.js";
import { convoyLinked } from "../multiplayer/convoys.js";
import { SPK } from "../multiplayer/objectives.js";
import { MP } from "../multiplayer/session.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { playersState } from "./players.js";
import { RS, RS2 } from "./rules.js";
import { sessionState } from "./session.js";
import { wavesState } from "./waves.js";

/* ================= QUEST LINE (guide for a first game) =================
   Twenty-one quests in seven chapters, one active at a time, in the order a first game goes. Each one completes from simulation state
   (structures, units, traps, research, waves, resources gathered, a few event counters) and pays a small reward, so everything here
   IS simulation: the progress is questsState.Q (plain data, saved in SAVA as QST, so it survives a save and a co-op resync), checked
   once per tick in qTick (called by the update wrapper in statistics.js), no random numbers, no clock.
   Solo and co-op: in co-op the line is shared (the structures and units of both players count, what both gather counts) and a reward
   is paid to BOTH players, like the shared goals of multiplayer/objectives.js. The On / Off switch is a player action: questSwitch in
   multiplayer/commands.js (command 'qs') calls qSetOn0. Nothing moves in test mode (F10, solo only, like the achievements).
   The panel and the log are in ui/quest-panel.js and only read this state.
   Q = {v:2, on, d:{id:1 done | 2 skipped}, a:[gold, wood, stone gathered since the active quest started], e:{tr trades, cv convoys delivered},
        dt (sim time of the last completion), last (its id), ct (sim time of the next route check of the convoy quest)}. Quests are known by id, never by index, so the list can change between versions. */
export const questsState = { Q: null };

const cntS = (type) => {
  let n = 0;
  for (const s of sessionState.structs) if (s.t === 0 && s.type === type && s.prog >= 1 && s.hp > 0) n++;
  return n;
};
const cntU = (type) => {
  let n = 0;
  for (const u of sessionState.units) if (u.t === 0 && u.type === type && u.hp > 0) n++;
  return n;
};
const wavesDone = () => Math.max(0, sessionState.waveN - (wavesState.waveOn ? 1 : 0));
const anyRes = () => {
  if (RS.done) return 1;
  for (const k in RS2.done) if (RS2.done[k]) return 1;
  return 0;
};
const kingUsed = () => {
  for (const u of sessionState.units) if (u.t === 0 && u.type === "king" && (u.sk_cry || u.sk_charge)) return 1;
  return 0;
};
const roles = () => {
  let n = 0;
  for (const R of ROLE) n += (R.b | 0) + (R.r | 0) + (R.t | 0);
  return n;
};
const tributes = () => {
  let n = 0;
  for (const b of BASES) n += b.envN | 0;
  return n;
};
const campLeft = () => {
  for (const b of BASES) if (b.alive) return true;
  return false;
};
const ev = (k) => (questsState.Q.e && questsState.Q.e[k]) | 0;
const two = (a, b) => (a ? 1 + (b ? 1 : 0) : 0);
/* co-op convoy quest: no convoy can go when the two castles have no land route between them (river, castle on a closed ledge: the
   command is refused at once by multiplayer/convoys.js) or when one castle has fallen. Looked at when the quest comes up, then every
   30 s of simulation time; the time of the next look is Q.ct, in the saved state, so both machines look at the same ticks, also after a resync */
const cvCut = () => {
  const Q = questsState.Q;
  if (sessionState.time < Q.ct) return false;
  Q.ct = sessionState.time + 30;
  return !convoyLinked();
};

export const QCH = [
  "First steps",
  "A village",
  "An army",
  "Defences",
  "Trade and craft",
  "The crown",
  "Beyond the walls",
];

/* id (never reused), c chapter, t title, d what to do, n goal, p progress (0..n, from simulation state only), r reward (to each player),
   mp: co-op only (not listed in a solo game), s: when true the quest cannot be done in this game and is passed without reward */
export const QUESTS = [
  {
    id: "wood",
    c: 0,
    t: "Gather wood",
    d: "Double-click a peasant to select them all, then right-click a tree",
    n: 40,
    p: () => questsState.Q.a[1],
    r: { g: 20 },
  },
  {
    id: "ore",
    c: 0,
    t: "Stone and gold",
    d: "Send peasants to a rock and to a gold vein",
    n: 60,
    p: () => Math.min(30, questsState.Q.a[2]) + Math.min(30, questsState.Q.a[0]),
    r: { w: 20 },
  },
  {
    id: "house",
    c: 1,
    t: "A roof for your people",
    d: "Build a house: each one raises the population limit",
    n: 1,
    p: () => cntS("house"),
    r: { w: 30 },
  },
  {
    id: "farm",
    c: 1,
    t: "Fill the granary",
    d: "Build a farm: a peasant working it makes food",
    n: 1,
    p: () => cntS("farm"),
    r: { f: 30 },
  },
  {
    id: "barracks",
    c: 2,
    t: "Raise a barracks",
    d: "Build a barracks to train soldiers",
    n: 1,
    p: () => cntS("barracks"),
    r: { g: 40 },
  },
  {
    id: "knights",
    c: 2,
    t: "First knights",
    d: "Train 2 knights at the barracks: knights fight the zombies",
    n: 2,
    p: () => cntU("knight"),
    r: { g: 40 },
  },
  {
    id: "archers",
    c: 2,
    t: "Bows on the wall",
    d: "Train 2 archers: they can garrison walls and towers",
    n: 2,
    p: () => cntU("archer"),
    r: { w: 30 },
  },
  {
    id: "walls",
    c: 3,
    t: "Close the road",
    d: "Zombies follow the red lines: build 6 walls and a gate across one",
    n: 7,
    p: () => Math.min(6, cntS("wall")) + Math.min(1, cntS("gate")),
    r: { w: 40 },
  },
  {
    id: "tower",
    c: 3,
    t: "Eyes on the road",
    d: "Build a tower: archers inside shoot far",
    n: 1,
    p: () => cntS("tower"),
    r: { g: 30 },
  },
  {
    id: "traps",
    c: 3,
    t: "Sharp welcome",
    d: "Place 3 spike traps where the zombies walk",
    n: 3,
    p: () => SPK.size,
    r: { g: 30 },
  },
  {
    id: "wave1",
    c: 3,
    t: "The first night",
    d: "Survive wave 1: keep your castle standing",
    n: 1,
    p: wavesDone,
    r: { g: 60 },
  },
  {
    id: "market",
    c: 4,
    t: "Open for trade",
    d: "Build a market, then sell, buy or swap something there",
    n: 2,
    p: () => two(cntS("market") || ev("tr"), ev("tr")),
    r: { w: 40 },
  },
  {
    id: "guild",
    c: 4,
    t: "Master builders",
    d: "Build a builders guild and ask for a builder there",
    n: 2,
    p: () => two(cntS("guild"), roles()),
    r: { w: 40 },
  },
  {
    id: "research",
    c: 4,
    t: "Knowledge",
    d: "Build an academy and finish a research",
    n: 2,
    p: () => two(cntS("academy") || anyRes(), anyRes()),
    r: { g: 60 },
  },
  {
    id: "king",
    c: 5,
    t: "Long live the King",
    d: "Summon King Naraige at the castle",
    n: 1,
    p: () => cntU("king"),
    r: { f: 50 },
  },
  {
    id: "skill",
    c: 5,
    t: "Royal might",
    d: "Use War cry or Royal charge with the King",
    n: 1,
    p: kingUsed,
    r: { g: 40 },
  },
  { id: "wave5", c: 5, t: "Hold the line", d: "Survive wave 5", n: 5, p: wavesDone, r: { g: 100 } },
  {
    id: "siege",
    c: 6,
    t: "Engines of war",
    d: "Research Masonry, then put a ballista on a tower or train a cannon",
    n: 2,
    p: () => {
      const m = cntS("ballista") + cntS("trebuchet") + cntU("cannon");
      return two(RS.done || m, m);
    },
    r: { s: 60 },
  },
  {
    id: "envoy",
    c: 6,
    t: "Friends in the wild",
    d: "Build an embassy, train an envoy at the castle and send it to a rebel camp",
    n: 2,
    p: () => two(cntS("embassy") || tributes(), tributes()),
    r: { g: 60 },
    s: () => !campLeft() && !tributes(),
  },
  {
    id: "convoy",
    c: 6,
    t: "Share the load",
    d: "Send a convoy of resources to your partner",
    n: 1,
    p: () => ev("cv"),
    r: { f: 30 },
    mp: 1,
    s: () => !sessionState.CS2 || cvCut(),
  },
  { id: "wave10", c: 6, t: "The last bastion", d: "Survive wave 10", n: 10, p: wavesDone, r: { g: 150 } },
];

/* the 16 quests of the first version (saves of that build keep an index into this list) */
const OLD1 = [
  "wood",
  "ore",
  "house",
  "farm",
  "barracks",
  "knights",
  "archers",
  "walls",
  "tower",
  "traps",
  "wave1",
  "research",
  "king",
  "skill",
  "wave5",
  "wave10",
];

/* the player's choice (Settings, quest log) is the default of the next new SOLO game; a co-op game always starts with the line on,
   because a local preference must not make the two machines differ */
export const questsPref = () => {
  try {
    return localStorage.getItem("dk_quests") !== "0";
  } catch {
    return true;
  }
};

const fresh = (on) => ({
  v: 2,
  on: on ? 1 : 0,
  d: {},
  a: [0, 0, 0],
  e: { tr: 0, cv: 0 },
  dt: -1e9,
  last: "",
  ct: -1e9,
});

export function qReset() {
  questsState.Q = fresh(MP.on ? true : questsPref());
}

/* a save without quests (older build) loads with the quest line off: a kingdom at wave 20 does not cash every reward at once.
   A save of the first version (index i into the 16 quests of that build) keeps what was done, by id. */
export function qFix(v) {
  if (!v || typeof v !== "object") return fresh(false);
  const a = Array.isArray(v.a) ? v.a : [],
    Q = fresh(v.on);
  Q.a = [+a[0] || 0, +a[1] || 0, +a[2] || 0];
  Q.dt = Number.isFinite(v.dt) ? v.dt : -1e9;
  Q.ct = Number.isFinite(v.ct) ? v.ct : -1e9;
  if (v.d && typeof v.d === "object") {
    for (const q of QUESTS) {
      const x = v.d[q.id] | 0;
      if (x === 1 || x === 2) Q.d[q.id] = x;
    }
  } else {
    const n = Math.max(0, Math.min(OLD1.length, v.i | 0));
    for (let i = 0; i < n; i++) Q.d[OLD1[i]] = 1;
    Q.dt = -1e9;
  }
  if (v.e && typeof v.e === "object") {
    Q.e.tr = v.e.tr | 0;
    Q.e.cv = v.e.cv | 0;
  }
  Q.last = typeof v.last === "string" && QUESTS.some((q) => q.id === v.last) ? v.last : "";
  return Q;
}

/* shown and running: on, and not in test mode */
export const qActive = () => {
  const Q = questsState.Q;
  return !!Q && !!Q.on && !diagnosticsState.DEVU;
};

/* the quests of this game, in order (co-op only ones are left out of a solo game) */
export const qList = () => (MP.on ? QUESTS : QUESTS.filter((q) => !q.mp));
export const qIsDone = (q) => !!questsState.Q.d[q.id];
/* the active quest: the first one not done, or null when the line is finished */
export function qCur() {
  const Q = questsState.Q;
  for (const q of QUESTS) {
    if (Q.d[q.id] || (q.mp && !MP.on)) continue;
    return q;
  }
  return null;
}
export const qById = (id) => {
  for (const q of QUESTS) if (q.id === id) return q;
  return null;
};

/* simulation side of the switch (see questSwitch in multiplayer/commands.js) */
export function qSetOn0(on) {
  const Q = questsState.Q;
  if (Q && sessionState.inGame) Q.on = on ? 1 : 0;
}

export const qProg = (q) => (q ? Math.max(0, Math.min(q.n, Math.floor(q.p()))) : 0);

/* counted events (called from the simulation: a trade done, a convoy delivered) */
export function qNote(k) {
  const Q = questsState.Q;
  if (!Q) return;
  if (!Q.e) Q.e = { tr: 0, cv: 0 };
  Q.e[k] = Math.min(9999, (Q.e[k] | 0) + 1);
}

const B0 = [
  [0, 0, 0],
  [0, 0, 0],
];

/* called by the update wrapper just before the simulation step: what the step adds to the stocks counts as gathered */
export function qBegin() {
  const P = playersState.RESP;
  for (let p = 0; p < 2 && p < P.length; p++) {
    B0[p][0] = P[p].g;
    B0[p][1] = P[p].w;
    B0[p][2] = P[p].s;
  }
}

export function qTick() {
  const Q = questsState.Q;
  if (!Q || !Q.on || diagnosticsState.DEVU || sessionState.over || !sessionState.inGame) return;
  const P = playersState.RESP,
    np = sessionState.CS2 ? 2 : 1;
  for (let p = 0; p < np && p < P.length; p++) {
    Q.a[0] += Math.max(0, P[p].g - B0[p][0]);
    Q.a[1] += Math.max(0, P[p].w - B0[p][1]);
    Q.a[2] += Math.max(0, P[p].s - B0[p][2]);
  }
  const q = qCur();
  if (!q) return;
  /* a quest that cannot be done in this game is passed: no reward, shown as skipped in the log (a quest already fulfilled is paid first) */
  if (q.p() < q.n) {
    if (q.s && q.s()) {
      Q.d[q.id] = 2;
      Q.a = [0, 0, 0];
      hudDisplayState.msgS = "Quest skipped: " + q.t;
      hudDisplayState.msgT = 4;
    }
    return;
  }
  const r = q.r;
  for (let p = 0; p < np && p < P.length; p++) {
    const R = P[p];
    if (r.g) R.g += r.g;
    if (r.w) R.w += r.w;
    if (r.s) R.s += r.s;
    if (r.f) R.f = (R.f || 0) + r.f;
  }
  Q.d[q.id] = 1;
  Q.a = [0, 0, 0];
  Q.dt = sessionState.time;
  Q.last = q.id;
  hudDisplayState.msgS = "Quest complete: " + q.t;
  hudDisplayState.msgT = 4;
  snd("coin");
}
