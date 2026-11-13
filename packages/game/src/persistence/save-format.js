import { campsState } from "../ai/camps.js";
import { BASES, HORDES, kingdomsState } from "../ai/kingdoms.js";
import { RHAS, ROLE, workerRolesState } from "../ai/worker-roles.js";
import { PRES, SAPL, workplacesState } from "../ai/workplaces.js";
import { PUD, SCRT } from "../ai/zombies.js";
import { GVER } from "../core/version.js";
import { ACH } from "../gameplay/achievements.js";
import { constructionState, tfo } from "../gameplay/construction.js";
import { economyState, FAT, PRICE } from "../gameplay/economy.js";
import { eventsState } from "../gameplay/events.js";
import { formationsState } from "../gameplay/formations.js";
import { lightingState } from "../gameplay/lighting.js";
import { BAD, playersState } from "../gameplay/players.js";
import { CLM, RL } from "../gameplay/resources.js";
import { C, RALLY, RALLYC, RS, RS2, rulesState, SH, T } from "../gameplay/rules.js";
import { qFix, questsState } from "../gameplay/quests.js";
import { sessionState } from "../gameplay/session.js";
import { simulationState } from "../gameplay/simulation.js";
import { statisticsState } from "../gameplay/statistics.js";
import { SW, swarmState, SWD, SWH, SWN } from "../gameplay/swarm.js";
import { wavesState } from "../gameplay/waves.js";
import { SPK } from "../multiplayer/objectives.js";
import { fowHi, fowLo, fowRA, fowSeen, fowTex, fowVis } from "../rendering/fog.js";
import { THREE } from "../rendering/three.js";
import { mkG } from "../world/pathfinding.js";
import {
  amt,
  CAMPS,
  RUINS,
  FLG,
  genF,
  HT,
  occ,
  pth,
  SEALD,
  stairs,
  ter,
  terrainState,
  TFL,
} from "../world/terrain-state.js";
import { LVO } from "../world/traversal.js";

/* ================= SAVE / LOAD =================
   The whole simulation state is written as an object graph (shared references kept), the big world arrays gzipped.
   Desktop app: one file per save in the app-data folder (window.NARX); browser: IndexedDB. */
export const SAVA = {
  SPK: [() => SPK, null],
  QST: [
    () => questsState.Q,
    (v) => {
      questsState.Q = qFix(v);
    },
  ],
  OBJ: [
    () => statisticsState.OBJ,
    (v) => {
      statisticsState.OBJ = v && v.w ? v : { w: 1, k: 1 };
    },
  ],
  GST: [
    () => rulesState.GST,
    (v) => {
      rulesState.GST = v && v.k ? v : { k: {}, g: 0, w: 0, s: 0, f: 0, lost: 0 };
    },
  ],
  SEED: [
    () => terrainState.SEED,
    (v) => {
      terrainState.SEED = v;
    },
  ],
  GPR: [
    () => terrainState.GPR,
    (v) => {
      terrainState.GPR = v;
    },
  ],
  CX: [
    () => terrainState.CX,
    (v) => {
      terrainState.CX = v;
    },
  ],
  CY: [
    () => terrainState.CY,
    (v) => {
      terrainState.CY = v;
    },
  ],
  SITE2: [
    () => sessionState.SITE2,
    (v) => {
      sessionState.SITE2 = v;
    },
  ],
  HT: [() => HT, null],
  ter: [() => ter, null],
  amt: [() => amt, null],
  pth: [() => pth, null],
  FLG: [() => FLG, null],
  TFL: [() => TFL, null],
  genF: [() => genF, null],
  stairs: [() => stairs, null],
  ROUTES: [
    () => terrainState.ROUTES,
    (v) => {
      terrainState.ROUTES = v;
    },
  ],
  RCH: [
    () => terrainState.RCH,
    (v) => {
      terrainState.RCH = v;
    },
  ],
  GORD: [
    () => terrainState.GORD,
    (v) => {
      terrainState.GORD = v;
    },
  ],
  GI: [
    () => terrainState.GI,
    (v) => {
      terrainState.GI = v;
    },
  ],
  genN: [
    () => terrainState.genN,
    (v) => {
      terrainState.genN = v;
    },
  ],
  SEALD: [() => SEALD, null],
  CAMPS: [() => CAMPS, null],
  RUINS: [() => RUINS, null],
  UID: [
    () => sessionState.UID,
    (v) => {
      sessionState.UID = v;
    },
  ],
  SID: [
    () => sessionState.SID,
    (v) => {
      sessionState.SID = v;
    },
  ],
  occ: [() => occ, null],
  units: [
    () => sessionState.units,
    (v) => {
      sessionState.units = v;
    },
  ],
  structs: [
    () => sessionState.structs,
    (v) => {
      sessionState.structs = v;
    },
  ],
  fx: [
    () => sessionState.fx,
    (v) => {
      sessionState.fx = v;
    },
  ],
  pt: [
    () => sessionState.pt,
    (v) => {
      sessionState.pt = v;
    },
  ],
  queue: [
    () => sessionState.queue,
    (v) => {
      sessionState.queue = v;
    },
  ],
  over: [
    () => sessionState.over,
    (v) => {
      sessionState.over = v;
    },
  ],
  time: [
    () => sessionState.time,
    (v) => {
      sessionState.time = v;
    },
  ],
  waveT: [
    () => sessionState.waveT,
    (v) => {
      sessionState.waveT = v;
    },
  ],
  waveI: [
    () => sessionState.waveI,
    (v) => {
      sessionState.waveI = v;
    },
  ],
  waveN: [
    () => sessionState.waveN,
    (v) => {
      sessionState.waveN = v;
    },
  ],
  JRN: [
    () => sessionState.jrn || [],
    (v) => {
      sessionState.jrn = Array.isArray(v) ? v : [];
    },
  ],
  EVT: [() => eventsState, null],
  nextL: [
    () => sessionState.nextL,
    (v) => {
      sessionState.nextL = v;
    },
  ],
  CS: [
    () => sessionState.CS,
    (v) => {
      sessionState.CS = v;
    },
  ],
  CS2: [
    () => sessionState.CS2,
    (v) => {
      sessionState.CS2 = v;
    },
  ],
  kills: [
    () => sessionState.kills,
    (v) => {
      sessionState.kills = v;
    },
  ],
  RESP: [
    () => playersState.RESP,
    (v) => {
      playersState.RESP = v;
    },
  ],
  SAPL: [() => SAPL, null],
  PRES: [() => PRES, null],
  saplT: [
    () => workplacesState.saplT,
    (v) => {
      workplacesState.saplT = v;
    },
  ],
  SW: [() => SW, null],
  SWH: [() => SWH, null],
  SWN: [() => SWN, null],
  SWD: [() => SWD, null],
  SWARMS: [
    () => swarmState.SWARMS,
    (v) => {
      swarmState.SWARMS = v;
    },
  ],
  hordeT: [
    () => wavesState.hordeT,
    (v) => {
      wavesState.hordeT = v;
    },
  ],
  hordeOn: [
    () => wavesState.hordeOn,
    (v) => {
      wavesState.hordeOn = v;
    },
  ],
  waveOn: [
    () => wavesState.waveOn,
    (v) => {
      wavesState.waveOn = v;
    },
  ],
  hordeD: [
    () => wavesState.hordeD,
    (v) => {
      wavesState.hordeD = v;
    },
  ],
  burnAt: [
    () => wavesState.burnAt,
    (v) => {
      wavesState.burnAt = v;
    },
  ],
  nightLv: [
    () => wavesState.nightLv,
    (v) => {
      wavesState.nightLv = v;
    },
  ],
  nightCk: [
    () => wavesState.nightCk,
    (v) => {
      wavesState.nightCk = v;
    },
  ],
  waveST: [
    () => wavesState.waveST,
    (v) => {
      wavesState.waveST = v;
    },
  ],
  LITL: [
    () => lightingState.LITL,
    (v) => {
      lightingState.LITL = v;
    },
  ],
  darkT: [
    () => lightingState.darkT,
    (v) => {
      lightingState.darkT = v;
    },
  ],
  campT: [
    () => campsState.campT,
    (v) => {
      campsState.campT = v;
    },
  ],
  SIMTK: [
    () => simulationState.SIMTK,
    (v) => {
      simulationState.SIMTK = v;
    },
  ],
  shelOn: [
    () => simulationState.shelOn,
    (v) => {
      simulationState.shelOn = v;
    },
  ],
  shelRel: [
    () => simulationState.shelRel,
    (v) => {
      simulationState.shelRel = v;
    },
  ],
  mergeT: [
    () => constructionState.mergeT,
    (v) => {
      constructionState.mergeT = v;
    },
  ],
  ACH: [() => ACH, null],
  WAVEZ: [
    () => wavesState.WAVEZ,
    (v) => {
      wavesState.WAVEZ = v;
    },
  ],
  HORDES: [() => HORDES, null],
  BASES: [() => BASES, null],
  hdT: [
    () => kingdomsState.hdT,
    (v) => {
      kingdomsState.hdT = v;
    },
  ],
  spawnHT: [
    () => kingdomsState.spawnHT,
    (v) => {
      kingdomsState.spawnHT = v;
    },
  ],
  baseId: [
    () => kingdomsState.baseId,
    (v) => {
      kingdomsState.baseId = v;
    },
  ],
  RS: [() => RS, null],
  RS2: [() => RS2, null],
  ROLE: [() => ROLE, null],
  RHAS: [() => RHAS, null],
  roleT: [
    () => workerRolesState.roleT,
    (v) => {
      workerRolesState.roleT = v;
    },
  ],
  RALLY: [() => RALLY, null],
  RALLYC: [() => RALLYC, null],
  PRICE: [() => PRICE, null],
  FAT: [() => FAT, null],
  priceT: [
    () => economyState.priceT,
    (v) => {
      economyState.priceT = v;
    },
  ],
  CLM: [() => CLM, null],
  BAD: [() => BAD, null],
  tfo: [() => tfo, null],
  LVO: [() => LVO, null],
  SCRT: [() => SCRT, null],
  C: [() => C, null],
  BTIER: [
    () => playersState.BTIER,
    (v) => {
      playersState.BTIER = v;
    },
  ],
  RL: [() => RL, null],
  FGS: [
    () => formationsState.FGS,
    (v) => {
      formationsState.FGS = v;
    },
  ],
  FORCEF: [
    () => formationsState.FORCEF,
    (v) => {
      formationsState.FORCEF = v;
    },
  ],
  PUD: [() => PUD, null],
  alertT: [
    () => economyState.alertT,
    (v) => {
      economyState.alertT = v;
    },
  ],
  farmT: [
    () => economyState.farmT,
    (v) => {
      economyState.farmT = v;
    },
  ],
  fowSeen: [() => fowSeen, null],
  fowVis: [() => fowVis, null],
  fowTex: [() => fowTex, null],
  fowRA: [() => fowRA, null],
  fowLo: [() => fowLo, null],
  fowHi: [() => fowHi, null],
  diffI: [
    () => sessionState.diffI,
    (v) => {
      sessionState.diffI = v;
    },
  ],
  /* v94: timers the simulation reads, absent from older saves. fdT / fdDirty: when the walking fields are next rebuilt (after a co-op resync the two
    machines kept their own timer and rebuilt at different ticks from then on); lastFm: the facing a short formation order inherits */
  fdT: [
    () => sessionState.fdT,
    (v) => {
      sessionState.fdT = Number.isFinite(v) ? v : 0;
    },
  ],
  fdDirty: [
    () => sessionState.fdDirty,
    (v) => {
      sessionState.fdDirty = v !== false;
    },
  ],
  lastFm: [
    () => constructionState.lastFm,
    (v) => {
      constructionState.lastFm = Number.isFinite(v) ? v : 0;
    },
  ],
};

export const SVVER = 1;

/* ---- compatibility across updates ----
   Rules: (1) never reject a save for its version; (2) a format change adds a step to SVMIG (key = version it upgrades FROM, the function
   edits the raw save S in place); (3) new fields must tolerate being absent (setters use defaults, see svFix); (4) removed or unknown
   unit / structure types are dropped on load instead of crashing; (5) a save from a newer build loads as far as this build understands it. */
const SVMIG = {/* 1: S=>{...upgrade to 2...} */};
export function svMigrate(S) {
  if (!S || typeof S !== "object" || !S.R || !Array.isArray(S.objs)) throw new Error("Unknown save format");
  let v = Number(S.v) || 1;
  S.sv0 = v;
  while (v < SVVER) {
    const f = SVMIG[v];
    if (f) f(S);
    v++;
  }
  if (v <= SVVER) S.v = SVVER;
  return S;
}

/* after decoding: make the lists safe whatever build wrote them */
export function svFix(D) {
  const ok = (a) => (Array.isArray(a) ? a : []);
  if ("units" in D) {
    const U = ok(D.units).filter((u) => u && typeof u === "object" && T[u.type]);
    for (const u of U) {
      if (!Number.isFinite(u.hp)) u.hp = T[u.type].hp;
      if (!Number.isFinite(u.x) || !Number.isFinite(u.y)) {
        u.x = 0;
        u.y = 0;
      }
      if (u.buff == null) u.buff = 1;
      if (u.cd == null) u.cd = 0;
    }
    D.units = U;
  }
  if ("structs" in D) {
    const Q = ok(D.structs).filter(
      (q) => q && typeof q === "object" && (q.type in SH || q.type in C || q.type === "wall" || q.type === "gate"),
    );
    for (const q of Q) if (!Number.isFinite(q.hp)) q.hp = SH[q.type] || 100;
    D.structs = Q;
    if (D.units) {
      const set = new Set(Q);
      for (const u of D.units) if (u.gar && typeof u.gar === "object" && !set.has(u.gar)) u.gar = null;
    }
  }
  /* references to units / structures that no longer exist (type unknown to this build, or dropped above): squad members, captain, base and camp lists */
  if (D.units) {
    const us = new Set(D.units),
      ss = D.structs ? new Set(D.structs) : null;
    for (const u of D.units) {
      if (Array.isArray(u.sq)) u.sq = u.sq.filter((f) => us.has(f));
      else if (u.sq) u.sq = null;
      if (u.cap && typeof u.cap === "object" && !us.has(u.cap)) u.cap = null;
    }
    const cl = (o) => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o.us)) o.us = o.us.filter((f) => us.has(f));
      if (ss && Array.isArray(o.ss)) o.ss = o.ss.filter((f) => ss.has(f));
    };
    for (const k of ["BASES", "HORDES"]) if (Array.isArray(D[k])) D[k].forEach(cl);
    if (D.CAMPS)
      for (const c of D.CAMPS instanceof Map ? D.CAMPS.values() : Array.isArray(D.CAMPS) ? D.CAMPS : [])
        cl(Array.isArray(c) ? c[1] : c);
  }
  return D;
}
/* Not saved: pfS (the path field a peasant last walked, an object rebuilt on demand; movement.js stepF takes the new one after a load).
   Saved since v94, because the simulation reads them and a loaded game must go on exactly like the game that was saved:
   _tc (the target a unit or tower keeps for up to 2 ticks, combat.js target(); only for what is alive, a dead target keeps none)
   and zf / zft (the walking field around a rebel base, kept 30 s, zombie-lanes.js baseZF). Older saves lack them: rebuilt as before. */
const SVSKIP = new Set(["pfS"]);

const svX = (v) =>
  !!v &&
  typeof v === "object" &&
  typeof THREE !== "undefined" &&
  (v instanceof THREE.Object3D || v.isMaterial || v.isBufferGeometry || v.isTexture || v.isBufferAttribute);

const b64e = (u8) => {
  let s = "";
  for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(s);
};

const b64d = (s) => {
  const b = atob(s),
    u = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
  return u;
};

async function gzU8(u8, de) {
  const cs = de ? new DecompressionStream("gzip") : new CompressionStream("gzip");
  const st = new Blob([u8]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(st).arrayBuffer());
}

const TACT = {
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray,
};

export async function svEncode() {
  const ids = new Map(),
    objs = [],
    Q = [],
    big = [];
  const alive = new Set(sessionState.units);
  for (const q of sessionState.structs) alive.add(q);
  const ref = (v) => {
    if (v === null) return null;
    const t = typeof v;
    if (t === "number") return Number.isFinite(v) ? v : { $n: String(v) };
    if (t === "string" || t === "boolean") return v;
    if (t !== "object") return { $u: 1 };
    if (svX(v) || (typeof Node !== "undefined" && v instanceof Node) || v instanceof CanvasRenderingContext2D)
      return { $u: 1 };
    let id = ids.get(v);
    if (id === undefined) {
      id = objs.length;
      ids.set(v, id);
      objs.push(null);
      Q.push(v);
    }
    return { $r: id };
  };
  const R = {};
  for (const k in SAVA) R[k] = ref(SAVA[k][0]());
  for (let q = 0; q < Q.length; q++) {
    const v = Q[q],
      id = ids.get(v);
    let o;
    if (ArrayBuffer.isView(v)) {
      const u8 = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
      o = { $t: v.constructor.name, n: v.length };
      if (v.byteLength > 8192) big.push([o, u8.slice()]);
      else o.d = b64e(u8);
    } else if (Array.isArray(v)) o = { $a: v.map(ref) };
    else if (v instanceof Map) o = { $m: [...v].map(([a, b]) => [ref(a), ref(b)]) };
    else if (v instanceof Set) o = { $s: [...v].map(ref) };
    else if (typeof v.mk === "function" && "tx" in v && "sx" in v)
      o = { $g: [v.tx, v.ty, v.sx, v.sy, v.big | 0, v.q | 0] };
    else if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) {
      o = { $x: 1 };
      (window.__svw || (window.__svw = [])).push("class:" + (v.constructor && v.constructor.name));
    } else {
      const p = {};
      for (const k in v) {
        if (SVSKIP.has(k) || (k === "_tc" && !alive.has(v))) continue;
        const x = v[k];
        if (typeof x === "function") {
          (window.__svw || (window.__svw = [])).push("fn:" + k);
          continue;
        }
        if (svX(x)) continue;
        p[k] = ref(x);
      }
      o = { $o: p };
    }
    objs[id] = o;
  }
  for (const [o, u8] of big) o.z = b64e(await gzU8(u8));
  return { v: SVVER, gv: GVER, R, objs };
}

export async function svDecode(S) {
  svMigrate(S);
  const O = S.objs,
    live = new Array(O.length);
  for (let i = 0; i < O.length; i++) {
    const o = O[i];
    if (o.$t) {
      const T0 = TACT[o.$t];
      const u8 = o.z ? await gzU8(b64d(o.z), true) : b64d(o.d || "");
      live[i] = new T0(u8.buffer, 0, o.n);
    } else if (o.$a) live[i] = [];
    else if (o.$m) live[i] = new Map();
    else if (o.$s) live[i] = new Set();
    else if (o.$g) {
      const a = o.$g,
        G = mkG(a[0], a[1], a[2], a[3], !!a[5]);
      G.big = a[4];
      live[i] = G;
    } else if (o.$x) live[i] = undefined;
    else live[i] = {};
  }
  const val = (x) =>
    x === null || typeof x !== "object"
      ? x
      : x.$r !== undefined
        ? live[x.$r]
        : x.$n !== undefined
          ? Number(x.$n)
          : undefined;
  for (let i = 0; i < O.length; i++) {
    const o = O[i],
      L = live[i];
    if (o.$a) {
      for (const x of o.$a) L.push(val(x));
    } else if (o.$m) {
      for (const [a, b] of o.$m) L.set(val(a), val(b));
    } else if (o.$s) {
      for (const x of o.$s) L.add(val(x));
    } else if (o.$o) {
      for (const k in o.$o) {
        const x = o.$o[k];
        if (x && x.$u) continue;
        L[k] = val(x);
      }
    }
  }
  const out = {};
  for (const k in S.R) out[k] = val(S.R[k]);
  return svFix(out);
}

/* const bindings are refilled in place, let bindings reassigned */
export function svAssign(k, v) {
  const A = SAVA[k];
  if (!A) return;
  if (A[1]) {
    A[1](v);
    return;
  }
  const c = A[0]();
  if (ArrayBuffer.isView(c)) {
    if (v && v.length === c.length) c.set(v);
  } else if (c instanceof Map) {
    c.clear();
    if (v) for (const [a, b] of v) c.set(a, b);
  } else if (c instanceof Set) {
    c.clear();
    if (v) for (const x of v) c.add(x);
  } else if (Array.isArray(c)) {
    c.length = 0;
    if (v) for (const x of v) c.push(x);
  } else if (c && typeof c === "object") {
    for (const kk of Object.keys(c)) delete c[kk];
    Object.assign(c, v || {});
  }
}

export async function svPack() {
  const S = await svEncode();
  S.meta = {
    wave: sessionState.waveN,
    kills: sessionState.kills,
    time: Math.round(sessionState.time),
    date: Date.now(),
    king: "Naraige",
  };
  return JSON.stringify(S);
}
