import { rmotion } from "../core/prefs.js";
import { REALR } from "../core/random.js";
import { mkU } from "../gameplay/entities.js";
import { CASTLES } from "../gameplay/players.js";
import { DIR4, ROTT, TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { wavesState } from "../gameplay/waves.js";
import { frameState } from "./frame.js";
import { nightK } from "./lighting.js";
import { CAM } from "./scene.js";
import { animUnit } from "./unit-animation.js";
import { gh } from "../world/terrain-queries.js";
import { pth, ter } from "../world/terrain-state.js";
import { solid } from "../world/traversal.js";

/* ---- the people of the castle (the King, v101, #111: "les châteaux font spawn des civils qui se baladent") ----
   A few villagers live around every castle by day: they go from the castle to the doors of its buildings and back, keeping to the roads
   when there is one (#117), stand a while, walk on. When night falls or the horde comes they run home to the castle, and when a wave is
   beaten they come out and cheer.
   Drawing only, from the real clock and the real random stream: they are not units (not in sessionState.units, not saved, never counted,
   never a target), each machine has its own, and the simulation never reads them. Reduced motion turns them off. */
const PER = 6 /* villagers per castle */,
  NEAR = 4 /* how far from the walls they stroll, tiles */,
  FAR = 15,
  SPEED = 1.5 /* tiles a second: a stroll */,
  RUN = 4.2,
  CHEER = 8 /* seconds of joy after a wave */,
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
/* the tile in front of the door of a building (the front its `rot` turns to the castle) */
function door(s) {
  const [dx, dy] = DIR4[(s.rot | 0) & 3],
    h = s.sz / 2;
  return [s.x / TS + dx * (h + 1), s.y / TS + dy * (h + 1)];
}
/* where a villager of castle c may go: the doors of the buildings of its kingdom nearby, else a spot on the green */
function errand(c) {
  const D = [];
  for (const s of sessionState.structs)
    if (s.t === 0 && s !== c && (s.pl | 0) === (c.pl | 0) && s.prog >= 1 && s.hp > 0 && s.sz >= 4 && ROTT.has(s.type)) {
      if (Math.abs(s.x - c.x) > 60 * TS || Math.abs(s.y - c.y) > 60 * TS) continue;
      const p = door(s);
      if (free(p[0], p[1])) D.push(p);
    }
  if (D.length && REALR() < 0.75) return D[(REALR() * D.length) | 0];
  return REALR() < 0.4 ? door(c) : spot(c);
}
const road = (x, z) => pth[Math.floor(z) * TW + Math.floor(x)] > 0;
/* one step towards v.to: straight when the way is free, around what stands in it, and with a liking for the road */
const TURN = [0, 0.5, -0.5, 1, -1, 1.6, -1.6];
function walk(u, v, sp, step) {
  const x = u.x / TS,
    z = u.y / TS,
    dx = v.to[0] - x,
    dz = v.to[1] - z,
    l = Math.hypot(dx, dz);
  if (l < 0.6) return false;
  const a0 = Math.atan2(dx, dz);
  let best = null,
    bs = -9;
  for (const t of TURN) {
    const a = a0 + t,
      sx = Math.sin(a),
      sz = Math.cos(a);
    if (!free(x + sx * 1.1, z + sz * 1.1)) continue;
    const sc = Math.cos(t) + (road(x + sx * 1.6, z + sz * 1.6) ? 0.45 : 0) + (a === v.la ? 0.2 : 0);
    if (sc > bs) {
      bs = sc;
      best = a;
    }
  }
  if (best === null) return false;
  v.la = best;
  u.x += Math.sin(best) * sp * step * TS;
  u.y += Math.cos(best) * sp * step * TS;
  u.face = best;
  u.walk = 0.25;
  return true;
}

let wasWave = false,
  cheer = 0;
export function civilians(dt) {
  if (!sessionState.started || sessionState.over || rmotion()) {
    HOMES = [];
    wasWave = false;
    cheer = 0;
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
  const step = sessionState.paused ? 0 : dt;
  /* a wave has just been beaten: out they come, and they cheer */
  if (wasWave && !wavesState.waveOn) cheer = CHEER;
  wasWave = wavesState.waveOn;
  if (cheer > 0) cheer -= step;
  const danger = cheer <= 0 && (nightK > 0.3 || wavesState.hordeOn),
    T = sessionState.clockT;
  for (const u of CIV) {
    const v = u.civ,
      x = u.x / TS,
      z = u.y / TS;
    u.walk = 0;
    if (sessionState.showMap) continue;
    if (danger) {
      /* home, at a run; once through the door they are indoors and not drawn */
      if (v.in) continue;
      v.to = door(v.c);
      if (!walk(u, v, RUN, step)) {
        v.in = true;
        continue;
      }
    } else {
      if (v.in) {
        /* out again, from the door */
        v.in = false;
        const p = door(v.c);
        u.x = (p[0] + REALR() * 2 - 1) * TS;
        u.y = (p[1] + REALR() * 2 - 1) * TS;
        u.dy = gh(p[0], p[1]);
        v.to = null;
        v.wait = REALR() * 2;
      }
      if (Math.abs(x - CAM.x) > VIEW || Math.abs(z - CAM.z) > VIEW) continue;
      if (cheer > 0) v.to = null;
      else if (!v.to) {
        v.wait -= step;
        if (v.wait <= 0) v.to = errand(v.c);
      } else if (!walk(u, v, SPEED, step)) {
        /* arrived, or no way on: stand a while, then choose again */
        v.to = null;
        v.wait = 1.5 + REALR() * 6;
      }
    }
    animUnit(u, step, false, frameState.frameN + 1);
    if (u.m) {
      u.m.visible = true;
      if (cheer > 0) {
        /* both arms up and a hop, each in his own time */
        const d = u.m.userData,
          ph = T * 9 + (u.uid % 7);
        u.m.position.y += Math.abs(Math.sin(ph)) * 0.35;
        if (d.arm) d.arm.rotation.x = -2.7 + Math.sin(ph) * 0.25;
        if (d.armL) d.armL.rotation.x = -2.7 - Math.sin(ph) * 0.25;
      }
    }
  }
}
