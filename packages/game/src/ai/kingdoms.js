import { zcount } from "./zombie-lanes.js";
import { snd } from "../audio/sound.js";
import { dist, hyp, rnd } from "../core/math.js";
import { CASTLE_RNG, hit } from "../gameplay/combat.js";
import { mk, mkU } from "../gameplay/entities.js";
import { garrison, garSlot, ungar } from "../gameplay/formations.js";
import { chase, moveTo } from "../gameplay/movement.js";
import { BAD, CASTLES, fdist, playersState } from "../gameplay/players.js";
import { GCAP, GET, GRNG, SH, T, TH, TS, TW, WORK } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { targetZ } from "../gameplay/swarm.js";
import { puff } from "../rendering/effects.js";
import { gtopOf } from "../rendering/models/fortifications.js";
import { addStruct, buildStructMesh, refreshNear } from "../rendering/structures.js";
import { markP } from "../world/terrain-invalidation.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { THEME } from "../ui/kingdom-theme.js";
import { mmTile } from "../world/minimap.js";
import { D4, D8, gOK } from "../world/routes.js";
import { _bwat, baseHW, ensureAround, genChunk } from "../world/terrain.js";
import { amt, CH, HT, LAND, occ, pth, ROCKH, stairs, ter, terrainState } from "../world/terrain-state.js";
import { levelGround, solid, solidAt } from "../world/traversal.js";

export const kingdomsState = {
  hdT: 0,
  baseId: 0,
  spawnHT: 0,
};

/* ================= ROAMING HORDES + AI KINGDOMS ================= */
export const HORDES = [],
  BASES = [];

const BNAMES = [
  "Ironhold",
  "Oakmere",
  "Stonegate",
  "Highwatch",
  "Redfern",
  "Duskmoor",
  "Whitecliff",
  "Ashford",
  "Greywall",
  "Brightwater",
  "Cinderfell",
  "Hollowmere",
  "Larkspur",
  "Thornhaven",
  "Wolfden",
  "Eaglecrest",
  "Mistral",
  "Northwick",
  "Sunhaven",
  "Ravenmoor",
  "Elderglen",
  "Frostholm",
  "Goldmere",
  "Havenrock",
];

const rI = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ---- camp personalities (events-camps): every rebel camp has one trait, a pure hash of the world seed and the camp id (deterministic,
   does not touch the RNG stream; a camp without the field, e.g. from an older save, gets the same trait lazily; settlements inherit it).
   merchants: the envoy tribute is 50% richer; warlike: a horde sent against the camp is 25% tougher; wary: the first envoy is turned away. */
export const TRAITS = ["merchant", "warlike", "wary"];
const TRNAME = { merchant: "merchants", warlike: "warlike", wary: "wary" };
export function baseTrait(b) {
  if (!b.trait || TRAITS.indexOf(b.trait) < 0) {
    let h =
      (Math.imul(((+terrainState.SEED || 0) | 0) ^ 0x5bd1e995, 0x9e3779b1) + Math.imul((b.id | 0) + 1, 0x85ebca6b)) | 0;
    h ^= h >>> 15;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 13;
    b.trait = TRAITS[(h >>> 0) % TRAITS.length];
  }
  return b.trait;
}
/* ---- spearmen in the rebel camps (v93): how many of n melee fighters of a camp carry a spear instead of a sword, by trait: merchants pay for
   knights (1 in 4), wary camps hold their gate with spears (1 in 3), warlike camps raise a levy (1 in 2). From 2 melee fighters on there is
   always 1 spearman, and always at least 1 knight. Used by the training of aiTick. Pure function of the trait and the head count: no RNG,
   nothing new to save (units are saved whole, the trait is on the camp). */
export const SPEAR_DIV = { merchant: 4, wary: 3, warlike: 2 };
export const spearN = (b, n) => (n < 2 ? 0 : Math.max(1, Math.floor(n / SPEAR_DIV[baseTrait(b)])));
export const campLabel = (b) => b.name + " - " + TRNAME[baseTrait(b)];

/* attack reach of a building in tiles (null if it does not shoot): shown by the selection ring and in the info line */
export function rangeOf(s) {
  if (!s || s.t !== 0 || s.prog < 1) return null;
  if (s.type === "castle") return { r: CASTLE_RNG };
  if (s.type !== "tower") return null;
  if (s.weapon === "ballista") return { r: 720 / TS };
  if (s.weapon === "trebuchet") return { r: 1300 / TS, min: 240 / TS };
  return { r: TOWR + (s.tier !== 0 ? 60 / TS : 0) };
}

export const selH = (s) =>
  ({
    wall: 1.9,
    gate: 2.4,
    tower: 4.5,
    castle: 6.1,
    barracks: 2.9,
    farm: 0.7,
    storage: 2.2,
    house: 3.0,
    academy: 3.4,
    market: 2.4,
    forester: 2.2,
    guild: 2.9,
    observatory: 3.1,
    granary: 2.4,
    bell: 2.4,
    sanctuary: 2.4,
    beacon: 3.2,
    orchard: 2.2,
    forge: 2.8,
    embassy: 2.6,
    warroom: 2.7,
    sappers: 2.4,
    torch: 1.6,
    keep: 4.9,
    ballista: 1.4,
    trebuchet: 3,
  })[s.type] || 2;

export const TOWR = 11;
export const TR_CASTLE = 45;
export const TR_TOWER = 15;
export const aiR = (b) => 26 + b.lvl * 5;

export let OWN = new Set();
let ownSig = "";

function ownKey(tx, ty) {
  return (ty >> 1) * 4096 + (tx >> 1);
}

export function rebuildOwn(force) {
  let sig = sessionState.structs.length + ":" + sessionState.CS.x + ":" + (sessionState.CS2 ? sessionState.CS2.x : 0);
  let tw = 0;
  for (const s of sessionState.structs) if (s.t === 0 && s.prog >= 1) tw++;
  sig += ":" + tw;
  if (!force && sig === ownSig) return;
  ownSig = sig;
  const S = new Set();
  const sq = (x, y, r) => {
    const cx = Math.floor(x / TS),
      cy = Math.floor(y / TS);
    for (let j = (cy - r) >> 1; j <= (cy + r) >> 1; j++)
      for (let i = (cx - r) >> 1; i <= (cx + r) >> 1; i++) if (i >= 0 && j >= 0) S.add(j * 4096 + i);
  };
  for (const c0 of CASTLES()) sq(c0.x, c0.y, TR_CASTLE);
  for (const s of sessionState.structs)
    if (s.t === 0 && s.prog >= 1) {
      if (s.type === "tower") sq(s.x, s.y, TR_TOWER);
      else if (s.type === "keep") sq(s.x, s.y, TR_TOWER + 5);
      else sq(s.x, s.y, 3);
    }
  OWN = S;
}

export function inTerr(tx, ty) {
  if (!OWN.size) rebuildOwn(true);
  return OWN.has(ownKey(tx, ty));
}

/* the land around both co-op castles is protected the same way (AI kingdoms do not settle there) */

function msgAI(s) {
  if (hudDisplayState.msgT <= 0 || hudDisplayState.msgS.startsWith("The ") || hudDisplayState.msgS.endsWith("horde")) {
    hudDisplayState.msgS = s;
    hudDisplayState.msgT = 4;
  }
}

function addHorde(tx, ty, n) {
  const dd = Math.min(
    hyp(tx - terrainState.CX, ty - terrainState.CY),
    sessionState.SITE2 ? hyp(tx - sessionState.SITE2.tx, ty - sessionState.SITE2.ty) : 1e9,
  );
  HORDES.push({
    x: (tx + 0.5) * TS,
    y: (ty + 0.5) * TS,
    n: n || 5 + rI(0, 9) + Math.min(24, (dd / 38) | 0),
    act: false,
    us: [],
    home: null,
    wx: undefined,
    wy: 0,
    wait: 0,
  });
}

function addBase(tx, ty, lvl, pop, ci) {
  const id = ++kingdomsState.baseId;
  let c = ci;
  if (c === undefined) {
    do c = rI(0, 7);
    while (c === THEME.c);
  }
  const b = {
    id,
    name: BNAMES[(id - 1) % BNAMES.length] + (id > BNAMES.length ? " " + Math.ceil(id / BNAMES.length) : ""),
    tx,
    ty,
    x: (tx + 0.5) * TS,
    y: (ty + 0.5) * TS,
    ci: c,
    pop,
    lvl,
    gold: 0,
    alive: true,
    mat: false,
    ss: [],
    us: [],
    n0: 0,
    flat: false,
    fail: 0,
    tExp: 70 + Math.random() * 80,
  };
  BASES.push(b);
  baseTrait(b);
  return b;
}

export function initAI() {
  HORDES.length = 0;
  BASES.length = 0;
  kingdomsState.baseId = 0;
  kingdomsState.hdT = 0;
  kingdomsState.spawnHT = 10;
  aiInit();
}

const nearPlayer = (x, y, r) => {
  for (const u of sessionState.units)
    if (u.t === 0 && Math.abs(u.x - x) < r && Math.abs(u.y - y) < r && dist(u.x, u.y, x, y) < r) return true;
  return false;
};

function pickWp(h) {
  const r = Math.random();
  let best = null,
    bd = 1e9;
  if (r < 0.5)
    for (const b of BASES)
      if (b.alive) {
        const d = dist(h.x, h.y, b.x, b.y);
        if (d < 150 * TS && d < bd) {
          bd = d;
          best = b;
        }
      }
  if (best) {
    h.wx = best.x + rnd(-90, 90);
    h.wy = best.y + rnd(-90, 90);
    return;
  }
  if (r > 0.75 && dist(h.x, h.y, sessionState.CS.x, sessionState.CS.y) < 80 * TS) {
    h.wx = sessionState.CS.x + rnd(-300, 300);
    h.wy = sessionState.CS.y + rnd(-300, 300);
    return;
  }
  const a = Math.random() * 6.283,
    d = rnd(50, 170) * TS;
  h.wx = Math.max(20 * TS, Math.min((TW - 20) * TS, h.x + Math.cos(a) * d));
  h.wy = Math.max(20 * TS, Math.min((TH - 20) * TS, h.y + Math.sin(a) * d));
}

function stepPos(o, h, sp, D) {
  if (h.wx === undefined) {
    pickWp(h);
  }
  const dx = h.wx - o.x,
    dy = h.wy - o.y,
    d = hyp(dx, dy);
  if (d < TS * 2.5) {
    if (h.wait <= 0) h.wait = rnd(8, 30);
    h.wait -= D;
    if (h.wait <= 0) h.wx = undefined;
    return;
  }
  const nx = o.x + (dx / d) * sp * D,
    ny = o.y + (dy / d) * sp * D;
  if (gOK((nx / TS) | 0, (ny / TS) | 0) && solidAt(nx, ny)) {
    h.wx = undefined;
    return;
  }
  o.x = nx;
  o.y = ny;
}

function actHorde(h) {
  h.us = [];
  const n = Math.min(h.n, 70);
  h.home = { x: h.x, y: h.y };
  const sp = TS * (1.5 + Math.sqrt(n) * 0.42);
  for (let i = 0; i < n; i++) {
    const r = Math.random(),
      ty = r < 0.74 ? "husk" : r < 0.95 ? "zombie" : r < 0.985 ? "runner" : "brute",
      x = h.x + rnd(-sp, sp),
      y = h.y + rnd(-sp, sp);
    if (solidAt(x, y)) continue;
    const u = mkU(1, ty, x, y, null, -1);
    u.home = h.home;
    u.hh = h;
    sessionState.units.push(u);
    h.us.push(u);
  }
  if (!h.us.length) {
    h.x += rnd(-200, 200);
    h.y += rnd(-200, 200);
    h.x = Math.max(TS * 10, Math.min((TW - 10) * TS, h.x));
    h.y = Math.max(TS * 10, Math.min((TH - 10) * TS, h.y));
    return false;
  }
  h.act = true;
  return true;
}

export function updateHordes(dt) {
  kingdomsState.hdT -= dt;
  if (kingdomsState.hdT > 0) return;
  const D = 0.6 - kingdomsState.hdT;
  kingdomsState.hdT = 0.6;
  let nz = zcount();
  for (let i = HORDES.length - 1; i >= 0; i--) {
    const h = HORDES[i];
    if (!h.act) {
      if (h.n < 1) {
        HORDES.splice(i, 1);
        continue;
      }
      stepPos(h, h, 26, D);
      if (nz < 420 && gOK((h.x / TS) | 0, (h.y / TS) | 0)) {
        let near = fdist(h.x, h.y) < 58 * TS;
        if (!near) near = nearPlayer(h.x, h.y, 46 * TS) || aiNear(h.x, h.y, 40 * TS);
        if (near && actHorde(h)) nz += h.us.length;
      }
    } else {
      h.us = h.us.filter((u) => u.hp > 0 && u.hh === h);
      h.n = h.us.length;
      if (!h.n) {
        HORDES.splice(i, 1);
        continue;
      }
      stepPos(h.home, h, 13, D);
      if (
        fdist(h.home.x, h.home.y) > 112 * TS &&
        !nearPlayer(h.home.x, h.home.y, 92 * TS) &&
        !aiNear(h.home.x, h.home.y, 64 * TS)
      ) {
        let sx = 0,
          sy = 0;
        for (const u of h.us) {
          sx += u.x;
          sy += u.y;
          u.hp = 0;
          u.nokill = true;
        }
        h.x = sx / h.n;
        h.y = sy / h.n;
        h.act = false;
        h.us = [];
      }
    }
  }
  kingdomsState.spawnHT -= D;
  if (kingdomsState.spawnHT <= 0) {
    const k = Math.min(1, sessionState.time / 1500);
    kingdomsState.spawnHT = 5 - 3.6 * k + Math.random() * 1.5;
    if (HORDES.length < 340 && sessionState.time > 3)
      for (let a = 0; a < 14; a++) {
        const side = rI(0, 3),
          m = rI(14, 46);
        let tx, ty;
        if (side < 2) {
          tx = side ? TW - m : m;
          ty = rI(16, TH - 16);
        } else {
          ty = side === 3 ? TH - m : m;
          tx = rI(16, TW - 16);
        }
        const x = (tx + 0.5) * TS,
          y = (ty + 0.5) * TS;
        if (fdist(x, y) < 75 * TS) continue;
        baseHW(tx, ty);
        if (_bwat) continue;
        addHorde(tx, ty, rI(7, 14) + Math.min(26, (sessionState.time / 70) | 0));
        const h = HORDES[HORDES.length - 1];
        const ang = Math.atan2(TH / 2 - ty, TW / 2 - tx) + rnd(-0.9, 0.9),
          d = rnd(180, 520);
        h.wx = Math.max(20 * TS, Math.min((TW - 20) * TS, x + Math.cos(ang) * d * TS));
        h.wy = Math.max(20 * TS, Math.min((TH - 20) * TS, y + Math.sin(ang) * d * TS));
        break;
      }
  }
  updateBases(D);
}

/* ---- AI kingdoms ---- */

function updateBases(D) {
  aiTick(D);
}

/* ================= AI KINGDOMS =================
   Rival kingdoms play like a player: each starts with a castle and a few peasants, gathers wood, stone and gold,
   farms, builds houses, a barracks, towers, then walls and stone, trains an army and holds off the hordes.
   They are on your side against the dead; when a castle falls its people turn. Everything runs in the simulation (co-op safe). */
const AIK_N = 4,
  AIR = 11,
  AIC = {
    house: { w: 40 },
    farm: { w: 30 },
    barracks: { w: 90, s: 20 },
    tower: { w: 45, s: 10 },
    wall: { w: 6 },
    gate: { w: 20 },
    storage: { w: 50 },
    academy: { w: 80, s: 40 },
    guild: { w: 60, s: 30 },
    market: { w: 70, g: 30 },
    peasant: { f: 20 },
    knight: { g: 50, f: 20 },
    spearman: { g: 30, w: 10, f: 15 },
    archer: { g: 35, w: 15, f: 20 },
  },
  AIBT = {
    house: 22,
    farm: 18,
    barracks: 40,
    tower: 30,
    wall: 5,
    gate: 12,
    storage: 26,
    academy: 45,
    guild: 36,
    market: 36,
  };

const aiNear = (x, y, r) => {
  for (const b of BASES) if (b.ai && b.alive && Math.abs(b.x - x) < r && Math.abs(b.y - y) < r) return true;
  return false;
};

function aiInit() {
  const P = [[terrainState.CX, terrainState.CY]];
  if (sessionState.SITE2) P.push([sessionState.SITE2.tx, sessionState.SITE2.ty]);
  for (let a = 0; a < 900 && BASES.length < AIK_N; a++) {
    const tx = rI(110, TW - 110),
      ty = rI(100, TH - 100);
    if (P.some(([x, y]) => hyp(tx - x, ty - y) < 170)) continue;
    if (BASES.some((b) => hyp(b.tx - tx, b.ty - ty) < 160)) continue;
    const h = baseHW(tx, ty);
    if (_bwat || h >= ROCKH - 3) continue;
    const b = addBase(tx, ty, 0, 6);
    if (!aiFound(b)) {
      BASES.pop();
      kingdomsState.baseId--;
    }
  }
}

/* a flat 7x7 spot near the chosen place, levelled for the castle */
function aiFound(b) {
  ensureAround(b.tx, b.ty, 1);
  for (let r = 0; r <= 18; r += 2)
    for (let k = 0; k < Math.max(1, r * 4); k++) {
      const an = (k / Math.max(1, r * 4)) * 6.283,
        cx = Math.round(b.tx + Math.cos(an) * r),
        cy = Math.round(b.ty + Math.sin(an) * r);
      let ok = true,
        mn = 99,
        mx = 0;
      const hh = [];
      for (let j = -3; j <= 3 && ok; j++)
        for (let i = -3; i <= 3; i++) {
          const x = cx + i,
            y = cy + j,
            q = y * TW + x;
          if (!gOK(x, y) || ter[q] === 1 || ter[q] === 5 || occ.has(q) || stairs.has(q)) {
            ok = false;
            break;
          }
          hh.push(HT[q]);
          mn = Math.min(mn, HT[q]);
          mx = Math.max(mx, HT[q]);
        }
      if (!ok || mx - mn > 2) continue;
      hh.sort((p, q) => p - q);
      const h0 = hh[hh.length >> 1];
      for (let j = -3; j <= 3; j++)
        for (let i = -3; i <= 3; i++) {
          const q = (cy + j) * TW + cx + i;
          if (ter[q] >= 2 && ter[q] <= 4) {
            ter[q] = 0;
            amt[q] = 0;
            mmTile(q);
          }
        }
      levelGround(cx - 2, cy - 2, 5, h0);
      b.tx = cx;
      b.ty = cy;
      b.x = (cx + 0.5) * TS;
      b.y = (cy + 0.5) * TS;
      const pv = playersState.CURPL;
      playersState.CURPL = 0;
      let c;
      try {
        c = mk(2, "castle", cx - 2, cy - 2, 5, true);
      } finally {
        playersState.CURPL = pv;
      }
      c.ci = b.ci;
      c.base = b;
      c.keep = true;
      c.tier = 0;
      c.max = Math.round(SH.castle * 0.5);
      c.hp = c.max;
      addStruct(c);
      Object.assign(b, {
        ai: 1,
        mat: true,
        flat: true,
        castle: c,
        ss: [c],
        us: [],
        res: { g: 120, w: 120, s: 30, f: 100 },
        lvl: 0,
        proj: null,
        trT: 4,
        bT: 2,
        stone: false,
        ring: [],
        wallI: 0,
        fireT: 0,
        repT: 0,
      });
      for (let i = 0; i < 4; i++) aiSpawn(b, "peasant");
      aiSpawn(b, "knight");
      aiSpawn(b, "knight");
      sessionState.fdDirty = true;
      return true;
    }
  return false;
}

function aiSpawn(b, type) {
  const c = b.castle;
  let x = c.x,
    y = c.y + TS * 3.2;
  for (let t = 0; t < 12; t++) {
    const a = Math.random() * 6.283,
      r = TS * (3 + Math.random() * 1.5);
    x = c.x + Math.cos(a) * r;
    y = c.y + Math.sin(a) * r;
    if (!solidAt(x, y)) break;
  }
  const pv = playersState.CURPL;
  playersState.CURPL = 0;
  let u;
  try {
    u = mkU(2, type, x, y, null, -1);
  } finally {
    playersState.CURPL = pv;
  }
  u.ci = b.ci;
  u.base = b;
  u.face = Math.random() * 6;
  if (type !== "peasant") {
    const k = b.us.filter((o) => o.type !== "peasant").length,
      an = k * 2.4,
      r = TS * (4.2 + (k % 3) * 0.9);
    u.hx = c.x + Math.cos(an) * r;
    u.hy = c.y + Math.sin(an) * r;
  } else {
    u.hx = x;
    u.hy = y;
  }
  sessionState.units.push(u);
  b.us.push(u);
  if (type === "archer") {
    for (const s of b.ss)
      if (s.type === "tower" && s.prog >= 1 && s.hp > 0 && (s.garr || []).length < GCAP.tower) {
        garrison(u, s);
        break;
      }
  }
  return u;
}

const aiCnt = (b, t, done) => {
  let n = 0;
  for (const s of b.ss) if (s.type === t && s.hp > 0 && (!done || s.prog >= 1)) n++;
  return n;
};

const aiPay = (b, c) => {
  for (const k in c) if ((b.res[k] || 0) < c[k]) return false;
  for (const k in c) b.res[k] -= c[k];
  return true;
};

/* the ring of towers (and later walls) around the castle */
function aiRing(b) {
  if (b.ring.length) return b.ring;
  const R = AIR,
    c = [b.tx, b.ty];
  b.ring = [
    [-R, -R],
    [R, -R],
    [R, R],
    [-R, R],
    [0, -R],
    [R, 0],
    [0, R],
    [-R, 0],
  ].map(([x, y]) => [c[0] + x, c[1] + y]);
  return b.ring;
}

let AIB = null;
function aiTileOK(x, y) {
  if (!gOK(x, y)) return false;
  const q = y * TW + x;
  return ter[q] === 0 && !occ.has(q) && !stairs.has(q) && !pth[q] && !(AIB && AIB.includes(q));
}

/* a 2x2 spot inside the ring (on a 3-tile grid, so lanes stay open), else just outside it */
function aiSpot(b, type) {
  const cx = b.tx,
    cy = b.ty,
    C = [];
  for (let dy = -AIR + 2; dy <= AIR - 3; dy += 3)
    for (let dx = -AIR + 2; dx <= AIR - 3; dx += 3) {
      if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) continue;
      C.push([cx + dx, cy + dy, 0]);
    }
  for (let k = 0; k < 40; k++) {
    const an = (k / 40) * 6.283,
      r = AIR + 4 + (k % 3) * 3;
    C.push([Math.round(cx + Math.cos(an) * r), Math.round(cy + Math.sin(an) * r), 1]);
  }
  const far = type === "farm";
  C.sort((p, q) => (p[2] - q[2]) * 1e4 + (hyp(p[0] - cx, p[1] - cy) - hyp(q[0] - cx, q[1] - cy)) * (far ? -1 : 1));
  for (const [x, y] of C) {
    let ok = true,
      mn = 99,
      mx = 0;
    for (let j = 0; j < 2 && ok; j++)
      for (let i = 0; i < 2; i++) {
        if (!aiTileOK(x + i, y + j)) {
          ok = false;
          break;
        }
        const h = HT[(y + j) * TW + x + i];
        mn = Math.min(mn, h);
        mx = Math.max(mx, h);
      }
    if (!ok || mx - mn > 1) continue;
    for (const [dx, dy] of [
      [-1, 0],
      [2, 0],
      [0, -1],
      [0, 2],
      [-1, 1],
      [2, 1],
      [1, -1],
      [1, 2],
    ]) {
      const o = occ.get((y + dy) * TW + x + dx);
      if (o && o.type !== "house" && o.type !== "wall") {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    return [x, y, mx];
  }
  return null;
}

function aiPlace(b, type, x, y, h, ax) {
  if (type === "gate") {
    /* Gates keep the existing ground height. */
  } else if (type === "tower" || type === "wall") levelGround(x, y, 1, HT[y * TW + x]);
  else levelGround(x, y, 2, h);
  const pv = playersState.CURPL;
  playersState.CURPL = 0;
  let s;
  try {
    s =
      type === "gate"
        ? mk(2, "gate", x, y, 1, false, ax, 2)
        : mk(2, type, x, y, type === "tower" || type === "wall" ? 1 : 2, false);
  } finally {
    playersState.CURPL = pv;
  }
  s.ci = b.ci;
  s.base = b;
  s.tier = b.stone ? 1 : 0;
  if (!b.stone) {
    s.max = Math.round(s.max * 0.5);
  }
  s.hp = s.max * 0.12;
  s.bt = AIBT[type] || 20;
  if (type === "gate") s.gate = true;
  addStruct(s);
  refreshNear(s);
  b.ss.push(s);
  b.proj = s;
  sessionState.fdDirty = true;
  return s;
}

/* what to build next, in the order a careful player would */
function aiNext(b) {
  const n = (t) => aiCnt(b, t),
    P = b.us.filter((u) => u.type === "peasant").length,
    R = aiRing(b);
  const want = [
    ["farm", n("farm") < 1],
    ["house", n("house") < 1],
    ["barracks", n("barracks") < 1 && P >= 4],
    ["tower", n("tower") < 2 && !b.twFull],
    ["house", n("house") < 2],
    ["farm", n("farm") < 1 + Math.floor(P / 5)],
    ["storage", n("storage") < 1 && b.lvl >= 1],
    ["tower", n("tower") < 4 && !b.twFull],
    ["house", n("house") < 2 + b.lvl],
    ["academy", n("academy") < 1 && b.lvl >= 2],
    ["guild", n("guild") < 1 && b.lvl >= 2],
    ["tower", n("tower") < 8 && !b.twFull],
    ["market", n("market") < 1 && b.lvl >= 3],
    ["wall", b.lvl >= 3 && b.wallI < R.length],
    ["house", n("house") < 9],
  ];
  for (const [t, c] of want) if (c) return t;
  return null;
}

function aiStartBuild(b) {
  AIB = b.bad || null;
  try {
    aiStartBuild0(b);
  } finally {
    AIB = null;
  }
}

function aiStartBuild0(b) {
  const t = aiNext(b);
  if (!t) return;
  if (t === "tower") {
    const R = aiRing(b);
    for (const [x, y] of R) {
      const o = occ.get(y * TW + x);
      if (o) continue;
      let tx = x,
        ty = y;
      if (!aiTileOK(tx, ty)) {
        let f = null;
        for (const [dx, dy] of D8)
          if (aiTileOK(x + dx, y + dy)) {
            f = [x + dx, y + dy];
            break;
          }
        if (!f) continue;
        [tx, ty] = f;
      }
      if (!aiPay(b, AIC.tower)) return;
      aiPlace(b, "tower", tx, ty);
      return;
    }
    b.twFull = 1;
    return;
  }
  if (t === "wall") {
    const R = aiRing(b);
    const i = b.wallI % R.length,
      p = R[[0, 4, 1, 5, 2, 6, 3, 7][i]],
      q = R[[4, 1, 5, 2, 6, 3, 7, 0][i]];
    const L = [];
    const st = Math.max(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1]));
    for (let k = 1; k < st; k++) L.push([p[0] + Math.sign(q[0] - p[0]) * k, p[1] + Math.sign(q[1] - p[1]) * k]);
    const gi = (i === 4 || i === 0) && L.length > 3 ? L.length >> 1 : -1;
    for (let k = 0; k < L.length; k++) {
      const [x, y] = L[k];
      if (occ.has(y * TW + x)) continue;
      if (gi >= 0 && (k === gi || k === gi + 1)) {
        const gx = Math.min(L[gi][0], L[gi + 1][0]);
        if (aiTileOK(gx, y) && aiTileOK(gx + 1, y)) {
          if (!aiPay(b, AIC.gate)) return;
          aiPlace(b, "gate", gx, y, 0, 0);
          return;
        }
        continue;
      }
      if (!aiTileOK(x, y)) continue;
      if (!aiPay(b, AIC.wall)) return;
      aiPlace(b, "wall", x, y);
      return;
    }
    b.wallI++;
    return;
  }
  const sp = aiSpot(b, t);
  if (!sp) {
    if (t === "house") b.full = 1;
    return;
  }
  if (!aiPay(b, AIC[t])) return;
  aiPlace(b, t, sp[0], sp[1], sp[2]);
}

function aiFall(b) {
  for (const u of b.us)
    if (u.hp > 0) {
      if (u.gar) ungar(u);
      u.zk = u.type;
      u.t = 1;
      u.type = "zombie";
      u.hp = T.zombie.hp;
      u.base = null;
      u.home = null;
      u.lane = -1;
      u.cd = 1;
    }
  for (const s of b.ss) s.base = null;
  b.ss = [];
  b.us = [];
  b.alive = false;
  puff(b.x, b.y, "#b04bff", 20, 120);
  msgAI(b.name + " has fallen to the horde");
}

function aiTick(D) {
  let nAI = 0;
  for (const b of BASES) if (b.ai && b.alive) nAI += b.us.length;
  for (const b of BASES) {
    if (!b.ai || !b.alive) continue;
    const c = b.castle;
    b.ss = b.ss.filter((s) => s.hp > 0 && sessionState.structs.includes(s));
    b.us = b.us.filter((u) => u.hp > 0 && u.base === b && u.t === 2);
    if (!c || c.hp <= 0 || !sessionState.structs.includes(c)) {
      aiFall(b);
      continue;
    }
    const P = b.us.filter((u) => u.type === "peasant"),
      S = b.us.length - P.length,
      F = aiCnt(b, "farm", 1),
      Hs = aiCnt(b, "house", 1),
      Tw = aiCnt(b, "tower", 1),
      done = b.ss.filter((s) => s.prog >= 1).length;
    b.res.f += D * (0.25 + 0.55 * F);
    b.res.g += D * (0.35 + 0.05 * b.lvl);
    b.pop = b.us.length;
    b.lvl = Math.min(6, Math.floor(done / 4));
    /* stone age: castle and defences rebuilt in stone */
    if (!b.stone && b.lvl >= 3 && b.res.s >= 160) {
      b.res.s -= 160;
      b.stone = true;
      for (const s of b.ss)
        if (
          s.prog >= 1 &&
          (s.type === "castle" || s.type === "tower" || s.type === "wall" || s.type === "gate" || s.type === "barracks")
        ) {
          const r = s.hp / s.max;
          s.tier = 1;
          s.max = SH[s.type] || s.max * 2;
          s.hp = s.max * r;
          if (s.o3) buildStructMesh(s);
        }
      msgAI(b.name + " rebuilds its castle in stone");
    }
    /* building */
    if (b.proj && (b.proj.hp <= 0 || b.proj.prog >= 1 || !sessionState.structs.includes(b.proj))) b.proj = null;
    if (b.proj) {
      if (b.proj.prog !== b.pjP) {
        b.pjP = b.proj.prog;
        b.pjT = 0;
      } else if ((b.pjT = (b.pjT || 0) + D) > 50) {
        const s = b.proj;
        b.bad = b.bad || [];
        for (const [x, y] of s.tiles) b.bad.push(y * TW + x);
        s.hp = -1;
        s.noCrumble = true;
        b.proj = null;
        b.pjT = 0;
        for (const u of b.us) if (u.bj === s) u.bj = null;
      }
    }
    b.bT -= D;
    if (!b.proj && b.bT <= 0) {
      b.bT = 3;
      aiStartBuild(b);
    }
    /* training */
    b.trT -= D;
    if (b.trT <= 0) {
      b.trT = 8;
      const cap = 8 + 5 * Hs,
        pW = Math.min(16, 4 + 2 * Hs),
        sW = Math.min(22, 2 + b.lvl * 3 + Tw);
      if (b.us.length < cap && nAI < 230) {
        if (P.length < pW && aiPay(b, AIC.peasant)) aiSpawn(b, "peasant");
        else if (aiCnt(b, "barracks", 1) && S < sW) {
          const ar = b.us.filter((u) => u.type === "archer").length,
            t =
              ar < Tw * 2 && ar < S * 0.6
                ? "archer"
                : b.us.filter((u) => u.type === "spearman").length < spearN(b, S - ar + 1)
                  ? "spearman"
                  : "knight";
          if (aiPay(b, AIC[t])) aiSpawn(b, t);
        }
      }
    }
    /* a grown kingdom founds a new settlement */
    if (
      b.lvl >= 6 &&
      (b.kids || 0) < 2 &&
      !b.proj &&
      !b.exS &&
      b.res.w >= 500 &&
      b.res.s >= 250 &&
      b.res.g >= 300 &&
      BASES.filter((q) => q.alive).length < 10
    ) {
      b.exT = (b.exT || 0) - D;
      if (b.exT <= 0) {
        b.exT = 60;
        for (let a = 0; a < 30; a++) {
          const an = Math.random() * 6.283,
            r = rnd(55, 85),
            tx = Math.round(b.tx + Math.cos(an) * r),
            ty = Math.round(b.ty + Math.sin(an) * r);
          if (tx < 90 || ty < 90 || tx > TW - 90 || ty > TH - 90) continue;
          if (
            hyp(tx - terrainState.CX, ty - terrainState.CY) < 90 ||
            (sessionState.SITE2 && hyp(tx - sessionState.SITE2.tx, ty - sessionState.SITE2.ty) < 90) ||
            BASES.some((q) => q.alive && hyp(q.tx - tx, q.ty - ty) < 55)
          )
            continue;
          const h = baseHW(tx, ty);
          if (_bwat || h >= ROCKH - 3) continue;
          b.exS = { tx, ty, k: 0 };
          break;
        }
      }
    }
    if (b.exS) {
      const E = b.exS,
        cx = (E.tx / CH) | 0,
        cy = (E.ty / CH) | 0;
      if (E.k < 9) {
        genChunk(cx + (E.k % 3) - 1, cy + ((E.k / 3) | 0) - 1);
        E.k++;
      } else {
        b.exS = null;
        const nb = addBase(E.tx, E.ty, 0, 6, b.ci);
        const rt = b.root || b.name;
        nb.root = rt;
        nb.trait = baseTrait(b);
        const sib = BASES.filter((q) => q.root === rt).length;
        nb.name = rt + " " + ["March", "Hollow", "Ford", "Rise", "Vale", "Watch", "Moor", "Crest"][sib % 8];
        if (aiFound(nb)) {
          b.kids = (b.kids || 0) + 1;
          b.res.w -= 500;
          b.res.s -= 250;
          b.res.g -= 300;
          msgAI(b.name + " founds " + nb.name);
        } else {
          BASES.pop();
          kingdomsState.baseId--;
        }
      }
    }
    /* archers on the towers */
    for (const u of b.us)
      if (u.type === "archer" && !u.gar)
        for (const s of b.ss)
          if (s.type === "tower" && s.prog >= 1 && (s.garr || []).length < GCAP.tower) {
            if (garrison(u, s)) break;
          }
    /* repairs, paid in wood */
    b.repT -= D;
    if (b.repT <= 0) {
      b.repT = 2;
      for (const s of b.ss)
        if (s.prog >= 1 && s.hp < s.max && b.res.w >= 2) {
          s.hp = Math.min(s.max, s.hp + s.max * 0.03);
          b.res.w -= 2;
        }
    }
    /* the castle shoots like yours */
    b.fireT -= D;
    if (b.fireT <= 0) {
      b.fireT = c.tier ? 0.8 : 1.05;
      const R = CASTLE_RNG * TS;
      let z = null,
        bd = R;
      for (const e of sessionState.units)
        if (e.t === 1 && e.hp > 0 && Math.abs(e.x - c.x) < R && Math.abs(e.y - c.y) < R) {
          const dd = dist(c.x, c.y, e.x, e.y);
          if (dd < bd) {
            bd = dd;
            z = e;
          }
        }
      if (z) {
        z.hp -= c.tier ? 16 : 11;
        sessionState.fx.push({
          x1: c.x,
          y1: c.y,
          x2: z.x,
          y2: z.y,
          t: 0.3,
          T: 0.3,
          a: 1,
          h0: (c.bh || LAND) + (c.tier ? 3.5 : 2.5),
        });
        snd("arrow", c.x, c.y);
      } else b.fireT = 0.35;
    }
  }
}

/* AI peasant: build the current project, else gather what the kingdom lacks and carry it home */
function aiDepot(b, u) {
  let best = b.castle,
    bd = dist(u.x, u.y, best.x, best.y);
  for (const s of b.ss)
    if (s.type === "storage" && s.prog >= 1) {
      const d = dist(u.x, u.y, s.x, s.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
  return best;
}

function aiGo(u, x, y, dt) {
  if (!u.ag || u.ag.x !== x || u.ag.y !== y) u.ag = { x, y };
  chase(u, u.ag, dt);
}

function aiFind(b, u, j) {
  const T0 = { w: 2, s: 3, g: 4 }[j],
    ux = Math.floor(u.x / TS),
    uy = Math.floor(u.y / TS),
    bx = b.tx,
    by = b.ty;
  let best = -1,
    bd = 1e9;
  for (let dy = -30; dy <= 30; dy++)
    for (let dx = -30; dx <= 30; dx++) {
      const x = bx + dx,
        y = by + dy;
      if (!gOK(x, y)) continue;
      const q = y * TW + x;
      if (ter[q] !== T0 || !(amt[q] > 0) || BAD.get(q) > sessionState.time) continue;
      if (!D4.some(([a, c]) => !solid(x + a, y + c))) continue;
      const d = Math.abs(x - ux) + Math.abs(y - uy) + (dx * dx + dy * dy) * 0.02;
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
  return best;
}

function aiPeasant(u, b, dt) {
  const [z] = targetZ(u, 120);
  if (z && !u.gar) {
    u.work = 0;
    aiGo(u, b.castle.x, b.castle.y, dt * 1.15);
    return;
  }
  const pj = b.proj;
  if (pj && pj.prog < 1 && pj.hp > 0 && !u.carry) {
    const nb = b.us.filter((o) => o.bj === pj).length;
    if (u.bj !== pj && nb < 2 && (!u.bj || u.bj.prog >= 1)) u.bj = pj;
  }
  if (u.bj) {
    const s = u.bj;
    if (s.prog >= 1 || s.hp <= 0 || !sessionState.structs.includes(s)) {
      u.bj = null;
    } else {
      u.job = "r";
      if (dist(u.x, u.y, s.x, s.y) < TS * (s.sz > 1 || s.type === "gate" ? 2.2 : 1.6)) {
        u.face = Math.atan2(s.x - u.x, s.y - u.y);
        u.work = (u.work || 0) + dt;
        u.walk = 0;
        const dp = dt / s.bt;
        s.prog = Math.min(1, s.prog + dp);
        s.hp = Math.min(s.max, s.hp + s.max * dp * 0.88);
        if (Math.random() < 0.02) snd("build", s.x, s.y);
        if (s.prog >= 1) {
          s.hp = s.max;
          u.bj = null;
          u.work = 0;
          if (s.o3) buildStructMesh(s);
          refreshNear(s);
          if (s.type === "storage") sessionState.fdDirty = true;
        }
      } else {
        u.work = 0;
        aiGo(u, s.x, s.y, dt);
      }
      return;
    }
  }
  if (u.carry) {
    const d = aiDepot(b, u);
    if (dist(u.x, u.y, d.x, d.y) < TS * (d.sz / 2 + 1.2)) {
      b.res[u.cj] = (b.res[u.cj] || 0) + GET[u.cj];
      u.carry = false;
      u.tl = -1;
    } else aiGo(u, d.x, d.y, dt);
    return;
  }
  if (!(u.tl >= 0) || !(ter[u.tl] >= 2 && ter[u.tl] <= 4) || !(amt[u.tl] > 0)) {
    const r = b.res,
      need = [
        ["w", r.w / 3],
        ["s", r.s / 1.6],
        ["g", r.g / 2.2],
      ].sort((p, q) => p[1] - q[1]);
    u.tl = -1;
    for (const [j] of need) {
      u.tl = aiFind(b, u, j);
      if (u.tl >= 0) break;
    }
    u.rt = 0;
    if (u.tl < 0) {
      u.job = null;
      if (dist(u.x, u.y, u.hx, u.hy) > 20) aiGo(u, u.hx, u.hy, dt * 0.6);
      return;
    }
  }
  const tx = ((u.tl % TW) + 0.5) * TS,
    ty = (((u.tl / TW) | 0) + 0.5) * TS;
  u.job = { 2: "w", 3: "s", 4: "g" }[ter[u.tl]];
  u.rt = (u.rt || 0) + dt;
  if (u.rt > 40) {
    BAD.set(u.tl, sessionState.time + 60);
    u.tl = -1;
    return;
  }
  if (dist(u.x, u.y, tx, ty) < 46) {
    u.walk = 0;
    u.work = (u.work || 0) + dt;
    u.face = Math.atan2(tx - u.x, ty - u.y);
    if (u.work > WORK * 1.15) {
      u.work = 0;
      u.carry = true;
      u.cj = u.job;
      snd(u.job === "w" ? "chop" : "mine", u.x, u.y);
      if (--amt[u.tl] <= 0) {
        const i = u.tl;
        ter[i] = 0;
        mmTile(i);
        markP(i % TW, (i / TW) | 0);
        sessionState.fdDirty = true;
      }
    }
  } else {
    u.work = 0;
    aiGo(u, tx, ty, dt);
  }
}

function aiRes(b, _u) {
  const want = Math.random();
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * 6.283,
      r = rnd(9, 26),
      x = Math.round(b.tx + Math.cos(a) * r),
      y = Math.round(b.ty + Math.sin(a) * r);
    if (!gOK(x, y)) continue;
    const i = y * TW + x,
      t = ter[i];
    if (t < 2 || t > 4 || !(amt[i] > 0) || occ.has(i)) continue;
    if (t === 4 && want > 0.35) continue;
    if (t === 3 && want > 0.7) continue;
    return i;
  }
  return -1;
}

/* for the headless tests (tests/spearman.js): grow a camp and run its training without waiting for its economy */
export const campDebug = { aiSpot, aiPlace, aiTick };

export function aiUnit(u, d, dt) {
  const b = u.base;
  if (!b) {
    u.t = 1;
    return;
  }
  if (u.gar) {
    const s = u.gar;
    if (s.hp <= 0 || !sessionState.structs.includes(s)) {
      ungar(u);
      u.hp -= 8;
    } else {
      const j = s.garr.indexOf(u),
        sp = garSlot(s, j);
      u.x = sp.x;
      u.y = sp.y;
      u.gz = (s.bh || 0) + gtopOf(s);
      const [z] = targetZ(u, d.rng * GRNG[s.type] + 20);
      if (z && u.cd <= 0 && z.type in T) hit(u, z);
      u.walk = 0;
    }
    return;
  }
  if (u.type === "peasant" && b.ai) {
    aiPeasant(u, b, dt);
    return;
  }
  if (u.type === "peasant") {
    const [z] = targetZ(u, 140);
    if (z) {
      u.carry = false;
      u.job = null;
      u.work = 0;
      moveTo(u, b.x, b.y, dt * 1.2);
      return;
    }
    if (u.carry) {
      u.job = null;
      if (dist(u.x, u.y, b.x, b.y) < TS * 3) {
        b.gold += GET[u.cj] * 0.5;
        u.carry = false;
        u.tl = -1;
        snd("coin", u.x, u.y);
      } else moveTo(u, b.x, b.y, dt * 0.9);
      return;
    }
    if (u.tl === undefined || u.tl < 0 || !(ter[u.tl] >= 2 && ter[u.tl] <= 4) || !(amt[u.tl] > 0)) {
      u.tl = aiRes(b, u);
      u.rt = 0;
      if (u.tl < 0) {
        u.job = null;
        u.wt = (u.wt || 0) - dt;
        if (u.wt <= 0) {
          u.wt = 2 + Math.random() * 4;
          u.wx = u.hx + rnd(-100, 100);
          u.wy = u.hy + rnd(-100, 100);
        }
        if (u.wx !== undefined && dist(u.x, u.y, u.wx, u.wy) > 6 && !solidAt(u.wx, u.wy))
          moveTo(u, u.wx, u.wy, dt * 0.5);
        return;
      }
    }
    const tx = ((u.tl % TW) + 0.5) * TS,
      ty = (((u.tl / TW) | 0) + 0.5) * TS;
    u.job = { 2: "w", 3: "s", 4: "g" }[ter[u.tl]];
    u.rt = (u.rt || 0) + dt;
    if (u.rt > 30) {
      u.tl = -1;
      return;
    }
    if (dist(u.x, u.y, tx, ty) < 56) {
      u.work = (u.work || 0) + dt;
      u.face = Math.atan2(tx - u.x, ty - u.y);
      if (u.work > WORK * 1.3) {
        u.work = 0;
        u.carry = true;
        u.cj = u.job;
        snd(u.job === "w" ? "chop" : "mine", u.x, u.y);
        if (--amt[u.tl] <= 0) {
          const i = u.tl;
          ter[i] = 0;
          mmTile(i);
          markP(i % TW, (i / TW) | 0);
        }
      }
    } else {
      u.work = 0;
      moveTo(u, tx, ty, dt * 0.7);
    }
    return;
  }
  const ar = u.type === "archer",
    [z, zd] = targetZ(u, ar ? 300 : 230);
  if (z) {
    if (zd <= d.rng + d.r) {
      if (u.cd <= 0) hit(u, z);
    } else if (!ar || dist(u.x, u.y, u.hx, u.hy) < TS * 4.5) moveTo(u, z.x, z.y, dt);
    return;
  }
  if (dist(u.x, u.y, u.hx, u.hy) > 14) {
    if (b.ai) {
      if (!u.hp0 || u.hp0.x !== u.hx || u.hp0.y !== u.hy) u.hp0 = { x: u.hx, y: u.hy };
      chase(u, u.hp0, dt);
    } else moveTo(u, u.hx, u.hy, dt);
  }
}

export function absorbUnit(u, b) {
  let h = HORDES.find((o) => !o.act && o.wave && Math.abs(o.x - b.x) < TS * 8 && Math.abs(o.y - b.y) < TS * 8);
  if (!h) {
    h = {
      x: b.x + rnd(-100, 100),
      y: b.y + rnd(-100, 100),
      n: 0,
      act: false,
      us: [],
      home: null,
      wx: b.x,
      wy: b.y,
      wait: 1e9,
      wave: true,
    };
    HORDES.push(h);
  }
  h.n++;
  u.hp = 0;
  u.nokill = true;
}
