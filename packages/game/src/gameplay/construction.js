import { FOR_R } from "../ai/workplaces.js";
import { snd } from "../audio/sound.js";
import { dist, hyp } from "../core/math.js";
import { ach } from "./achievements.js";
import { doUpgrade, ok, pay } from "./economy.js";
import { mk } from "./entities.js";
import { ungar } from "./formations.js";
import { HOMEC, LPL, playersState, stoneOn } from "./players.js";
import { bsz, BSZ, C, CSZ, DIR4, fcell, FCELL, FSZ, GCAP, GTOP, ROTT, RS, SH, TS, TW } from "./rules.js";
import { selectionState } from "./selection.js";
import { sessionState } from "./session.js";
import { demolish, rampGroup, tfOrder } from "./terraforming.js";
import { placeSpike, removeSpike } from "./traps.js";
import { MP } from "../multiplayer/session.js";
import { puff } from "../rendering/effects.js";
import { CONNT } from "../rendering/models/structures.js";
import { snapM } from "../rendering/render-settings.js";
import { addStruct, buildStructMesh, refreshNear, rmStruct } from "../rendering/structures.js";
import { markP, markT } from "../world/terrain-invalidation.js";
import { NAMES } from "../ui/build-catalog.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { mmTile } from "../world/minimap.js";
import { gOK } from "../world/routes.js";
import { amt, HT, occ, pth, stairs, ter, terrainState } from "../world/terrain-state.js";
import { freeTile, levelGround, solid } from "../world/traversal.js";

export const constructionState = {
  gateLen: 3,
  buildRot: 0,
  formType: 0,
  lastFm: 0,
  mergeT: 0,
};

export let HEAL_R;
export const HEAL_RATE = 5;

export const FORMS = ["None", "Line", "Block", "Wedge", "Ring"];

export const tfo = new Map();

export function gateAxAt(_tx, _ty) {
  return constructionState.buildRot & 1;
}

export function tilesFor(type, tx, ty, sz, ax, gl) {
  if (type === "gate") {
    /* gl cells long (along x, or along y when ax), one cell thick */
    gl = gl || constructionState.gateLen;
    const t = [],
      w = (ax ? 1 : gl) * FCELL,
      h = (ax ? gl : 1) * FCELL;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) t.push([tx + i, ty + j]);
    return t;
  }
  const t = [];
  for (let j = 0; j < sz; j++) for (let i = 0; i < sz; i++) t.push([tx + i, ty + j]);
  return t;
}

/* ---- the site of a block-built building. Its footprint is large (12 to 24 tiles a side), so the ground is prepared for it: trees, stone and gold
   standing on it are cleared away, and the footprint is levelled to its middle height when the ground varies by 3 levels at most. Water, other buildings,
   stairs and the castle door stay in the way. ---- */
export const siteTile = (x, y) => {
  if (!gOK(x, y)) return false;
  const i = y * TW + x,
    t = ter[i];
  return (t === 0 || (t >= 2 && t <= 4)) && !occ.has(i) && !stairs.has(i) && !inDoor(x, y);
};
/* the height the footprint would be levelled to, or -1 when the building does not fit there */
export function siteFit(type, tx, ty) {
  const z = bsz(type),
    hs = [];
  for (let j = 0; j < z; j++)
    for (let i = 0; i < z; i++) {
      if (!siteTile(tx + i, ty + j)) return -1;
      hs.push(HT[(ty + j) * TW + tx + i]);
    }
  hs.sort((a, b) => a - b);
  return hs[hs.length - 1] - hs[0] > 3 ? -1 : hs[hs.length >> 1];
}
function clearTiles(T) {
  for (const [x, y] of T) {
    const q = y * TW + x;
    if (ter[q] >= 2 && ter[q] <= 4) {
      ter[q] = 0;
      amt[q] = 0;
      mmTile(q);
      markP(x, y);
    }
  }
}
const clearSite = (tx, ty, z) => clearTiles(tilesFor("", tx, ty, z));

/* ---- fortifications. Walls, towers and gates are laid on the grid of FCELL tiles (rules.js), so pieces always line up.
   A wall piece takes the free tiles of its cell: it closes against a building, a rock face, a ramp or the castle door, spans the water of a shore,
   and follows the ground as it is (no levelling: it stands on the highest tile of its cell). A tower or a gate needs its whole footprint and is
   levelled like a building; finished walls of the player in the way are replaced and refunded. ---- */
/* the corner of the footprint for the cursor tile: the cell under the cursor for a wall (and the passage of a three-cell gate); a footprint
   of two cells is centred on the nearest corner of the grid */
export function fortAt(type, tx, ty, ax, gl) {
  const two = (c) => fcell(c + FCELL / 2) - FCELL;
  if (type === "wall") return [fcell(tx), fcell(ty)];
  if (type === "gate") {
    const along = (c) => ((gl || constructionState.gateLen) === 3 ? fcell(c) - FCELL : two(c));
    return ax ? [fcell(tx), along(ty)] : [along(tx), fcell(ty)];
  }
  return [two(tx), two(ty)];
}
/* the tiles a wall piece would stand on in the cell at (x0, y0), or null when no land of the cell is free */
export function wallTiles(x0, y0) {
  const t = [];
  let land = 0;
  for (let j = 0; j < FCELL; j++)
    for (let i = 0; i < FCELL; i++) {
      const x = x0 + i,
        y = y0 + j;
      if (!gOK(x, y)) continue;
      const q = y * TW + x;
      if (ter[q] === 5 || occ.has(q) || stairs.has(q) || inDoor(x, y)) continue;
      t.push([x, y]);
      if (ter[q] !== 1) land++;
    }
  return land ? t : null;
}
/* can a tower or a gate stand on these tiles? { h: the level it is built on, walls: the wall pieces it replaces }, or null */
export function fortFit(tiles) {
  const hs = [],
    walls = [];
  for (const [x, y] of tiles) {
    if (!gOK(x, y)) return null;
    const q = y * TW + x,
      o = occ.get(q);
    /* (a wall piece may reach over water; what replaces it may not) */
    if (ter[q] === 1 || ter[q] === 5) return null;
    if (o) {
      if (wallAt(x, y) !== o) return null;
      if (!walls.includes(o)) walls.push(o);
    } else if (!siteTile(x, y)) return null;
    hs.push(HT[q]);
  }
  hs.sort((a, b) => a - b);
  return hs[hs.length - 1] - hs[0] > 3 ? null : { h: hs[hs.length >> 1], walls };
}
/* what building a wall, a tower or a gate with the cursor on (tx, ty) would give: its corner, its tiles, and whether it fits (ok) */
export function fortPlan(type, tx, ty) {
  const ax = type === "gate" ? gateAxAt(tx, ty) : 0,
    gl = type === "gate" ? constructionState.gateLen : 0,
    [x0, y0] = fortAt(type, tx, ty, ax, gl);
  if (type === "wall") {
    const t = wallTiles(x0, y0);
    return { x0, y0, ax, gl, sz: FCELL, tiles: t || tilesFor("wall", x0, y0, FCELL), ok: !!t, h: 0, walls: [] };
  }
  const sz = type === "gate" ? FCELL : FSZ.tower,
    tiles = tilesFor(type, x0, y0, sz, ax, gl),
    F = fortFit(tiles);
  return { x0, y0, ax, gl, sz, tiles, ok: !!F, h: F ? F.h : 0, walls: F ? F.walls : [] };
}
/* nobody is walled in: whoever stands where a piece is laid steps off it, to the nearest free tile (a one-tile wall used to push them aside
   by itself; the middle of a piece four tiles wide has no free tile beside it) */
function stepOff(s) {
  const on = new Set();
  for (const [x, y] of s.tiles) on.add(y * TW + x);
  for (const u of sessionState.units) {
    if (u.gar || u.onF || u.shel || !(u.hp > 0)) continue;
    const tx = Math.floor(u.x / TS),
      ty = Math.floor(u.y / TS);
    if (!on.has(ty * TW + tx)) continue;
    const f = freeTile(tx, ty);
    if (!f) continue;
    u.x = (f[0] + 0.5) * TS;
    u.y = (f[1] + 0.5) * TS;
    u.lx = u.x;
    u.ly = u.y;
  }
}
function replaceWalls(L) {
  for (const w of L) {
    if (w.garr) w.garr.slice().forEach(ungar);
    const Rr = playersState.RESP[w.pl | 0];
    for (const k in w.cost || {}) Rr[k] += w.cost[k];
    w.hp = -1;
    w.noCrumble = true;
    rmStruct(w);
    for (const [a, b] of w.tiles) if (occ.get(b * TW + a) === w) occ.delete(b * TW + a);
    sessionState.structs.splice(sessionState.structs.indexOf(w), 1);
    refreshNear(w);
  }
  if (L.length) sessionState.fdDirty = true;
}

/* the rotation chosen when placing a castle, or the next one (clockwise) whose door opens on free ground */
export function castleRotAt(c, want) {
  for (let k = 0; k < 4; k++) {
    const r = (want + k) & 3;
    if (
      doorTiles({ tx: c.tx, ty: c.ty, sz: CSZ, rot: r }, 1).every(
        ([x, y]) => gOK(x, y) && !solid(x, y) && !stairs.has(y * TW + x),
      )
    )
      return r;
  }
  return want & 3;
}

export function doorTiles(c, depth) {
  const [dx, dy] = DIR4[(c.rot | 0) & 3],
    t = [],
    z = c.sz || 3,
    w = z >= 12 ? 4 : 3,
    a0 = (z - w) >> 1;
  for (let a = a0; a < a0 + w; a++)
    for (let d = 0; d < depth; d++) {
      if (dy) t.push([c.tx + a, dy > 0 ? c.ty + z + d : c.ty - 1 - d]);
      else t.push([dx > 0 ? c.tx + z + d : c.tx - 1 - d, c.ty + a]);
    }
  return t;
}

export const inDoor = (tx, ty) => {
  for (const c of [sessionState.CS, sessionState.CS2])
    if (c && c.type === "castle" && doorTiles(c, 1).some(([x, y]) => x === tx && y === ty)) return true;
  return false;
};

export function pathOK(tx, ty) {
  const i = ty * TW + tx;
  return gOK(tx, ty) && ter[i] === 0;
}

const UNIQB = { guild: "Guild", academy: "Academy" };

export function placeErr(type, tx, ty) {
  if (UNIQB[type]) {
    for (const s of sessionState.structs)
      if (s.t === 0 && s.type === type && s.hp > 0 && (s.pl | 0) === (playersState.CURPL | 0))
        return "Only one " + UNIQB[type] + " per kingdom";
  }
  if (type === "forester") {
    const h = bsz("forester") / 2,
      cx = tx + h,
      cy = ty + h;
    for (const s of sessionState.structs)
      if (
        s.t === 0 &&
        s.type === "forester" &&
        s.hp > 0 &&
        (s.pl | 0) === (playersState.CURPL | 0) &&
        Math.hypot(s.tx + h - cx, s.ty + h - cy) < 2 * FOR_R + 1
      )
        return "Too close to another forester: their planting areas would touch";
  }
  return "";
}

export function valid(tx, ty) {
  return !solid(tx, ty) && !inDoor(tx, ty) && !stairs.has(ty * TW + tx);
}

export let build = function build(type, tx, ty) {
  if (type === "spike") {
    placeSpike(tx, ty);
    return;
  }
  if (type === "upgrade") {
    if (!sessionState.over) doUpgrade(tx, ty);
    return;
  }
  if (sessionState.over || !ok(C[type])) return;
  if (type === "wall") {
    const P = fortPlan("wall", tx, ty);
    if (!P.ok) return;
    pay(C.wall);
    clearTiles(P.tiles);
    const s = mk(0, "wall", P.x0, P.y0, FCELL, false, 0, 0, P.tiles);
    stepOff(s);
    addStruct(s);
    refreshNear(s);
    puff(s.x, s.y, "#c9c9c9", 6, 50);
    snd("build", s.x, s.y);
    return;
  }
  if (type === "tower" || type === "gate") {
    const P = fortPlan(type, tx, ty);
    if (!P.ok) return;
    const rep = P.walls.length;
    replaceWalls(P.walls);
    pay(C[type]);
    clearTiles(P.tiles);
    if (type === "gate")
      for (let k = 0; k < P.gl; k++)
        levelGround(P.x0 + (P.ax ? 0 : k * FCELL), P.y0 + (P.ax ? k * FCELL : 0), FCELL, P.h, true);
    else levelGround(P.x0, P.y0, P.sz, P.h, true);
    const s =
      type === "gate" ? mk(0, "gate", P.x0, P.y0, FCELL, false, P.ax, P.gl) : mk(0, "tower", P.x0, P.y0, P.sz, false);
    if (type === "gate") s.gate = true;
    stepOff(s);
    if (rep) {
      s.prog = 0.3;
      s.hp = Math.max(s.hp, s.max * 0.3);
      if (!MP.on || playersState.CURPL === LPL()) {
        hudDisplayState.msgS =
          type === "tower" ? "Walls replaced by the tower (refunded)" : "Walls replaced by the gate (refunded)";
        hudDisplayState.msgT = 3;
      }
    }
    addStruct(s);
    refreshNear(s);
    puff(s.x, s.y, "#c9c4b6", 10, 70, { soft: 1, T: 1, s: 0.4, z: 0.3, vz: 0.7, g: -0.3 });
    snd("build", s.x, s.y);
    return;
  }
  if ((type === "ballista" || type === "trebuchet") && !RS.done) {
    hudDisplayState.msgS = "Siege weapons need Masonry";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (type === "upgrade") {
    doUpgrade(tx, ty);
    return;
  }
  const i = ty * TW + tx;
  if (
    type === "ballista" ||
    type === "trebuchet" ||
    type === "raise" ||
    type === "dig" ||
    type === "ramp" ||
    type === "demolish" ||
    type === "rallyc" ||
    type === "rotate" ||
    type === "movec"
  ) {
    /* These tools apply their own placement checks below. */
  } else if (type === "path") {
    if (!pathOK(tx, ty)) return;
  } else if (BSZ[type]) {
    /* A block-built building checks (and clears) its whole footprint below. */
  } else if (!valid(tx, ty)) return;
  if (type === "rotate") {
    rotateB(occ.get(i));
    return;
  }
  if (type === "movec") {
    moveCastle(tx, ty);
    return;
  }
  if (type === "ballista" || type === "trebuchet") {
    const o = occ.get(i);
    if (!o || o.type !== "tower" || o.t !== 0 || o.prog < 1) {
      hudDisplayState.msgS = "Mount it on a finished tower";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    if (o.weapon) {
      hudDisplayState.msgS = "This tower already has a siege weapon";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    pay(C[type]);
    o.weapon = type;
    o.aim = (constructionState.buildRot * Math.PI) / 2;
    o.wcd = 2;
    buildStructMesh(o);
    puff(o.x, o.y, "#c9c9c9", 10, 70);
    snd("build", o.x, o.y);
    return;
  }
  if (type === "raise" || type === "dig" || type === "ramp") {
    tfOrder(type, tx, ty);
    return;
  }
  if (type === "demolish" && !occ.get(i) && pth[i]) {
    pth[i] = 0;
    const Rr = playersState.RESP[playersState.CURPL | 0];
    for (const k in C.path) Rr[k] += C.path[k];
    mmTile(i);
    markT(tx, ty);
    puff((tx + 0.5) * TS, (ty + 0.5) * TS, "#b9a68a", 3, 30);
    snd("click");
    if (playersState.CURPL === LPL()) {
      hudDisplayState.msgS = "Path removed";
      hudDisplayState.msgT = 2;
    }
    return;
  }
  if (type === "demolish" && !occ.get(i) && removeSpike(tx, ty)) return;
  if (type === "demolish" && !occ.get(i) && stairs.has(i)) {
    const G = rampGroup(i);
    const q = G.find((k) => tfo.has(k));
    if (q !== undefined) {
      tfo.delete(q);
      snd("click");
      return;
    }
    tfo.set(i, { t: "unramp", w: 0 });
    snd("click");
    hudDisplayState.msgS = "Peasants will remove this ramp";
    hudDisplayState.msgT = 3;
    return;
  }
  if (type === "demolish") {
    const o = occ.get(i);
    if (
      !o ||
      o.t !== 0 ||
      o === sessionState.CS ||
      o === sessionState.CS2 ||
      o.type === "castle" ||
      (MP.on && (o.pl | 0) !== playersState.CURPL)
    ) {
      hudDisplayState.msgS = "Click one of your buildings (not the castle)";
      hudDisplayState.msgT = 2;
      snd("err");
      return;
    }
    if (o.prog < 1) {
      demolish(o);
      if (playersState.CURPL === LPL()) {
        hudDisplayState.msgS = "Construction cancelled: resources refunded";
        hudDisplayState.msgT = 3;
      }
      return;
    }
    o.dem = !o.dem;
    o.dp = 0;
    snd("click");
    if (o.dem) {
      hudDisplayState.msgS = "Peasants will tear it down and recover 100% of the cost";
      hudDisplayState.msgT = 3;
    }
    return;
  }

  if (type === "rally" || type === "rallyc") {
    const w = { x: (tx + 0.5) * TS, y: (ty + 0.5) * TS };
    const rs = type === "rallyc" && { 2: 1, 3: 1, 4: 1 }[ter[ty * TW + tx]];
    if (!gOK(tx, ty) || (solid(tx, ty) && !rs)) return;
    let rb;
    if (type === "rallyc")
      rb =
        selectionState.selB &&
        selectionState.selB.type === "castle" &&
        sessionState.structs.includes(selectionState.selB)
          ? selectionState.selB
          : HOMEC();
    else {
      rb =
        selectionState.selB &&
        selectionState.selB.type === "barracks" &&
        sessionState.structs.includes(selectionState.selB) &&
        (selectionState.selB.pl | 0) === (playersState.CURPL | 0)
          ? selectionState.selB
          : null;
      if (!rb) {
        let bd = 1e12;
        for (const s of sessionState.structs)
          if (s.t === 0 && s.type === "barracks" && s.prog >= 1 && (s.pl | 0) === (playersState.CURPL | 0)) {
            const d = dist(s.x, s.y, w.x, w.y);
            if (d < bd) {
              bd = d;
              rb = s;
            }
          }
      }
    }
    if (!rb) {
      if (playersState.CURPL === LPL()) {
        hudDisplayState.msgS = "Build a barracks first";
        hudDisplayState.msgT = 3;
        snd("err");
      }
      return;
    }
    rb.rally = w;
    if (playersState.CURPL === LPL()) {
      hudDisplayState.msgS =
        type === "rally"
          ? "Rally point set for this barracks"
          : rs
            ? "Castle rally: new peasants gather this resource"
            : "Castle rally point set";
      hudDisplayState.msgT = 3;
      sessionState.mode = null;
    }
    snd("order");
    puff(w.x, w.y, "#7dffa0", 10, 50);
    return;
  }
  if (type === "house" || type === "farm" || CONNT.has(type)) {
    const sp = snapM(type, tx, ty);
    tx = sp[0];
    ty = sp[1];
  }
  if (
    type === "barracks" ||
    type === "farm" ||
    type === "storage" ||
    type === "house" ||
    type === "academy" ||
    type === "market" ||
    type === "forester" ||
    type === "guild" ||
    type === "observatory" ||
    type === "granary" ||
    type === "bell" ||
    type === "sanctuary" ||
    type === "beacon" ||
    type === "orchard" ||
    type === "forge" ||
    type === "embassy" ||
    type === "warroom" ||
    type === "sappers"
  ) {
    {
      const pe = placeErr(type, tx, ty);
      if (pe) {
        if (!MP.on || playersState.CURPL === LPL()) {
          hudDisplayState.msgS = pe;
          hudDisplayState.msgT = 3;
          snd("err");
        }
        return;
      }
    }
    const bz = bsz(type),
      h0 = siteFit(type, tx, ty);
    if (h0 < 0) return;
    pay(C[type]);
    clearSite(tx, ty, bz);
    levelGround(tx, ty, bz, h0);
    const s = mk(0, type, tx, ty, bz, false);
    addStruct(s);
    refreshNear(s);
    puff(s.x, s.y, "#c9c4b6", 10, 70, { soft: 1, T: 1, s: 0.4, z: 0.3, vz: 0.7, g: -0.3 });
    snd("build", s.x, s.y);
    return;
  }
  if (type === "path") {
    const want = stoneOn() ? 2 : 1;
    if (pth[i] === want) return;
    pay(C.path);
    pth[i] = want;
    mmTile(i);
    markT(tx, ty);
    puff((tx + 0.5) * TS, (ty + 0.5) * TS, "#d9c9a0", 3, 30);
    snd("path", (tx + 0.5) * TS, (ty + 0.5) * TS);
    return;
  }

  /* the one-tile pieces (the torch) */
  pay(C[type]);
  levelGround(tx, ty, 1, HT[i]);
  const s = mk(0, type, tx, ty, 1, false);
  addStruct(s);
  refreshNear(s);
  puff(s.x, s.y, "#c9c9c9", 6, 50);
  snd("build", s.x, s.y);
};

export function wallAt(tx, ty) {
  const o = occ.get(ty * TW + tx);
  return o && o.t === 0 && o.type === "wall" && o.prog >= 1 && o.hp > 0 && (!MP.on || (o.pl | 0) === playersState.CURPL)
    ? o
    : null;
}

export function mergeTowers() {
  const T0 = [];
  for (const s of sessionState.structs)
    if (s.t === 0 && s.type === "tower" && s.sz === FCELL && s.prog >= 1 && s.hp > 0 && !s.merged) T0.push(s);
  if (T0.length < 4) return;
  const at = new Map();
  for (const s of T0) at.set(s.ty * TW + s.tx, s);
  for (const s of T0) {
    if (s.merged) continue;
    const g = [
      s,
      at.get(s.ty * TW + s.tx + FCELL),
      at.get((s.ty + FCELL) * TW + s.tx),
      at.get((s.ty + FCELL) * TW + s.tx + FCELL),
    ];
    if (g.some((q) => !q || q.merged || (q.pl | 0) !== (s.pl | 0))) continue;
    const garr = [];
    let tier = 1;
    for (const q of g) {
      if (q.garr) {
        garr.push(...q.garr);
        q.garr = [];
      }
      if (q.weapon) {
        const R = playersState.RESP[q.pl | 0],
          c = C[q.weapon] || {};
        for (const k in c) R[k] += c[k];
        q.weapon = null;
      }
      if (q.tier === 0) tier = 0;
      q.merged = true;
      q.hp = -1;
      q.noCrumble = true;
    }
    const prev = playersState.CURPL;
    playersState.CURPL = s.pl | 0;
    let k;
    try {
      k = mk(0, "keep", s.tx, s.ty, FSZ.keep, true);
    } finally {
      playersState.CURPL = prev;
    }
    k.tier = tier;
    k.max = tier ? SH.keep : Math.round(SH.keep * 0.5);
    k.hp = k.max;
    k.cost = { w: 200, s: tier ? 300 : 0 };
    addStruct(k);
    refreshNear(k);
    k.garr = [];
    for (const u of garr.slice(0, GCAP.keep)) {
      u.gar = k;
      k.garr.push(u);
      u.gz = (k.bh || 0) + GTOP.keep;
    }
    for (const u of garr.slice(GCAP.keep)) {
      u.gar = null;
    }
    puff(k.x, k.y, "#d9d9d9", 20, 100);
    snd("build", k.x, k.y);
    if ((k.pl | 0) === LPL()) ach("keep");
    if (!MP.on || (k.pl | 0) === LPL()) {
      hudDisplayState.msgS = "Four towers merged into a keep";
      hudDisplayState.msgT = 4;
    }
  }
}

function rotateB(s) {
  if (
    !s ||
    s.t !== 0 ||
    !sessionState.structs.includes(s) ||
    !ROTT.has(s.type) ||
    (MP.on && (s.pl | 0) !== playersState.CURPL)
  )
    return;
  if (s.type === "tower" && s.weapon) {
    hudDisplayState.msgS = "A tower with a siege weapon cannot turn";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  const old = s.rot | 0;
  s.rot = (old + 1) & 3;
  if (s.type === "castle") {
    const bad = doorTiles(s, 1).some(([x, y]) => !gOK(x, y) || solid(x, y) || stairs.has(y * TW + x));
    if (bad) {
      s.rot = old;
      hudDisplayState.msgS = "The castle door needs the 3 tiles in front of it free";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    sessionState.fdDirty = true;
  }
  buildStructMesh(s);
  snd("click");
  hudDisplayState.msgS = NAMES[s.type] + " rotated";
  hudDisplayState.msgT = 1.5;
}

export function moveOK(tx, ty) {
  const c = HOMEC();
  if (!c || c.hp <= 0 || !sessionState.structs.includes(c)) return false;
  const x0 = tx - (CSZ >> 1),
    y0 = ty - (CSZ >> 1),
    nt = tilesFor("castle", x0, y0, CSZ),
    own = new Set(c.tiles.map(([x, y]) => y * TW + x));
  if (hyp(x0 - c.tx, y0 - c.ty) > 40) return false;
  const ty0 = c.type;
  c.type = "castle_";
  let r;
  try {
    r = nt.every(([x, y]) => gOK(x, y) && (own.has(y * TW + x) || siteTile(x, y)));
    if (r) {
      const hs = nt.map(([x, y]) => HT[y * TW + x]);
      if (Math.max(...hs) - Math.min(...hs) > 3) r = false;
    }
    if (r) {
      const f = { tx: x0, ty: y0, sz: CSZ, rot: c.rot | 0 };
      r = doorTiles(f, 1).every(
        ([x, y]) => gOK(x, y) && (own.has(y * TW + x) || (!solid(x, y) && !stairs.has(y * TW + x))),
      );
    }
  } finally {
    c.type = ty0;
  }
  return r;
}

function moveCastle(tx, ty) {
  const c = HOMEC();
  if (!c || !moveOK(tx, ty)) {
    hudDisplayState.msgS = "Cannot move the castle there (20x20 free, within 40 tiles, flat ground)";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  pay(C.movec);
  const x0 = tx - (CSZ >> 1),
    y0 = ty - (CSZ >> 1),
    nt = tilesFor("castle", x0, y0, CSZ),
    ox = c.x,
    oy = c.y,
    hs = nt.map(([x, y]) => HT[y * TW + x]).sort((a, b) => a - b);
  for (const [x, y] of c.tiles) if (occ.get(y * TW + x) === c) occ.delete(y * TW + x);
  clearSite(x0, y0, CSZ);
  levelGround(x0, y0, CSZ, hs[hs.length >> 1]);
  c.tx = x0;
  c.ty = y0;
  c.tiles = nt;
  c.x = (x0 + CSZ / 2) * TS;
  c.y = (y0 + CSZ / 2) * TS;
  for (const [x, y] of nt) occ.set(y * TW + x, c);
  if (c === sessionState.CS) {
    terrainState.CX = x0 + (CSZ >> 1);
    terrainState.CY = y0 + (CSZ >> 1);
  } else if (c === sessionState.CS2 && sessionState.SITE2) {
    /* the second castle moved: its site follows (AI camps, hordes and the chunks not yet generated keep away from the real castle) */
    sessionState.SITE2.tx = x0 + (CSZ >> 1);
    sessionState.SITE2.ty = y0 + (CSZ >> 1);
  }
  buildStructMesh(c);
  refreshNear(c);
  sessionState.fdDirty = true;
  sessionState.ver++;
  sessionState.mode = null;
  puff(ox, oy, "#c9b899", 22, 110);
  puff(c.x, c.y, "#d9d9d9", 22, 110);
  snd("build", c.x, c.y);
  if (!MP.on || (c.pl | 0) === LPL()) {
    ach("move");
    hudDisplayState.msgS = "Castle moved";
    hudDisplayState.msgT = 3;
  }
}

export function setBuildHandler(handler) {
  build = handler;
}

export function initializeConstruction() {
  HEAL_R = 7 * TS;
}
