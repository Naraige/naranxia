import { rmotion } from "../core/prefs.js";
import { REALR } from "../core/random.js";
import { mkU } from "../gameplay/entities.js";
import { CASTLES } from "../gameplay/players.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { frameState } from "./frame.js";
import { nightK } from "./lighting.js";
import { CAM } from "./scene.js";
import { animUnit } from "./unit-animation.js";
import { gh } from "../world/terrain-queries.js";
import { ter } from "../world/terrain-state.js";
import { solid } from "../world/traversal.js";

/* ---- the people of the castle (the King, v101, #111: "les châteaux font spawn des civils qui se baladent") ----
   A few villagers stroll around every castle by day: they walk to a spot, stand a while, walk on, and go back inside when night falls.
   Drawing only, from the real clock and the real random stream: they are not units (not in sessionState.units, not saved, never counted,
   never a target), each machine has its own, and the simulation never reads them. Reduced motion turns them off. */
const PER = 6 /* villagers per castle */,
  NEAR = 4 /* how far from the walls they stroll, tiles */,
  FAR = 15,
  SPEED = 1.5 /* tiles a second: a stroll */,
  VIEW = 70; /* none are animated further than this from the camera */
let CIV = [],
  HOMES = [];

const free = (x, z) => {
  const tx = Math.floor(x),
    ty = Math.floor(z);
  return tx > 1 && ty > 1 && tx < TW - 2 && ty < TH - 2 && ter[ty * TW + tx] === 0 && !solid(tx, ty);
};
function spot(c) {
  const h = (c.sz || 20) / 2;
  for (let k = 0; k < 12; k++) {
    const a = REALR() * 6.2832,
      r = h * 1.2 + NEAR + REALR() * (FAR - NEAR),
      x = c.x / TS + Math.cos(a) * r,
      z = c.y / TS + Math.sin(a) * r;
    if (free(x, z)) return [x, z];
  }
  return null;
}
function make(c) {
  const p = spot(c);
  if (!p) return null;
  /* a peasant's body and one of his six looks, without touching the unit counter of the simulation */
  const id0 = sessionState.UID,
    u = mkU(0, "peasant", p[0] * TS, p[1] * TS);
  sessionState.UID = id0;
  u.uid = (REALR() * 1e6) | 0;
  u.pl = c.pl | 0;
  u.civ = { c, to: null, wait: REALR() * 4 };
  return u;
}
function drop() {
  /* the frame loop takes away the model of a unit it was not asked to draw (rendering/frame.js), so leaving them is enough */
  CIV = [];
}

export function civilians(dt) {
  if (!sessionState.started || sessionState.over || rmotion()) {
    HOMES = [];
    if (CIV.length) drop();
    return;
  }
  const C = CASTLES().filter((c) => c && c.hp > 0 && c.prog >= 1);
  if (C.length !== HOMES.length || C.some((c, i) => c !== HOMES[i])) {
    /* a new game, a load, a castle more or less: start again */
    HOMES = C;
    drop();
    for (const c of C)
      for (let i = 0; i < PER; i++) {
        const u = make(c);
        if (u) CIV.push(u);
      }
  }
  const home = nightK > 0.3 || sessionState.showMap,
    step = sessionState.paused ? 0 : dt;
  for (const u of CIV) {
    const v = u.civ,
      x = u.x / TS,
      z = u.y / TS;
    u.walk = 0;
    if (home) {
      /* at night they are indoors: not drawn, and back at a fresh spot in the morning */
      v.in = true;
      continue;
    }
    if (v.in) {
      v.in = false;
      const p = spot(v.c);
      if (p) {
        u.x = p[0] * TS;
        u.y = p[1] * TS;
        u.dy = gh(p[0], p[1]);
      }
      v.to = null;
      v.wait = REALR() * 3;
      continue;
    }
    if (Math.abs(x - CAM.x) > VIEW || Math.abs(z - CAM.z) > VIEW) continue;
    if (!v.to) {
      v.wait -= step;
      if (v.wait <= 0) v.to = spot(v.c);
    } else {
      const dx = v.to[0] - x,
        dz = v.to[1] - z,
        l = Math.hypot(dx, dz),
        s = SPEED * step;
      if (l < 0.4 || !free(x + (dx / l) * 1.2, z + (dz / l) * 1.2)) {
        /* arrived, or a wall in the way: stand a while, then choose again */
        v.to = null;
        v.wait = 1.5 + REALR() * 6;
      } else {
        u.x += (dx / l) * s * TS;
        u.y += (dz / l) * s * TS;
        u.face = Math.atan2(dx, dz);
        u.walk = 0.25;
      }
    }
    animUnit(u, step, false, frameState.frameN + 1);
    if (u.m) u.m.visible = true;
  }
}
