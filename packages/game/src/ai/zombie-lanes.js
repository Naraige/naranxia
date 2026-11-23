import { dist } from "../core/math.js";
import { moveTo, stepF } from "../gameplay/movement.js";
import { nearC } from "../gameplay/players.js";
import { TS } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { SW } from "../gameplay/swarm.js";
import { longField } from "../world/connectivity.js";
import { FD, gOK } from "../world/routes.js";
import { ensureAround } from "../world/terrain.js";
import { onLandChange } from "../world/terrain-invalidation.js";
import { terrainState } from "../world/terrain-state.js";
import { bfsW, fv, solid } from "../world/traversal.js";

export const zombieLanesState = {
  lfBud: 3,
};

/* path field of the zombies toward an AI kingdom, shared by the whole horde and refreshed every 30 s */
export function baseZF(b) {
  if (b.zf !== undefined && sessionState.time - b.zft < 30) return b.zf;
  const s = [];
  for (let j = -3; j <= 3; j++)
    for (let i = -3; i <= 3; i++) {
      const x = b.tx + i,
        y = b.ty + j;
      if (gOK(x, y) && !solid(x, y)) s.push([x, y]);
    }
  b.zf = s.length ? bfsW(s, false, b.tx - 56, b.ty - 56, 113, 113) : null;
  b.zft = sessionState.time;
  return b.zf;
}

export const zcount = () => {
  let n = 0;
  for (const u of sessionState.units) if (u.t === 1) n++;
  return n;
};

/* far from the castle a horde follows its lane through a chain of local path fields (one per few waypoints), so cliffs, lakes and woods no longer trap it at its spawn;
   where no path exists at all the zombies clamber over the obstacle */
export const WSPN = 1e9,
  WSEE = 130,
  LSEG = 8,
  DETK = 2.2,
  DETA = 16,
  LFLD = new Map();

/* where a horde of lane L appears: the far end of its route (the start of the map), at the very end of the route, on the shore of the island (WSPN is unlimited since v101: the portals open at the edge of the map).
   It must lie at least WSEE straight tiles from every castle of both players (the widest camera zoom shows about 90): when the point at WSPN is nearer,
   the search goes on outward to the map edge, then inward, and takes the first point that is far enough (else the farthest one).
   Pure geometry (route + castle tiles, no terrain, no RNG), so every client and pickLanes agree. Returns {i: route index (even), d: straight distance to the nearest castle, rem: path left} */
export function laneSpawnIdx(L) {
  const RT = terrainState.ROUTES[L],
    P = RT.pts,
    n = P.length,
    C = [[terrainState.CX, terrainState.CY]];
  if (sessionState.SITE2) C.push([sessionState.SITE2.tx, sessionState.SITE2.ty]);
  const ck = C.join(",");
  if (RT.spk === ck) return RT.spv;
  const dm = (i) => {
      let d = 1e9;
      for (const c of C) {
        const q = Math.hypot(P[i][0] - c[0], P[i][1] - c[1]);
        if (q < d) d = q;
      }
      return d;
    },
    R = new Float64Array(n);
  for (let i = n - 2; i >= 0; i--) R[i] = R[i + 1] + Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
  let i0 = 0;
  while (i0 < n - 2 && R[i0] > WSPN) i0++;
  i0 -= i0 & 1;
  let bi = i0,
    bd = -1;
  for (let i = i0; i >= 0; i -= 2) {
    const d = dm(i);
    if (d >= WSEE) return ((RT.spk = ck), (RT.spv = { i, d, rem: R[i] }));
    if (d > bd) {
      bd = d;
      bi = i;
    }
  }
  for (let i = i0 + 2; i < n; i += 2) {
    const d = dm(i);
    if (d >= WSEE) return ((RT.spk = ck), (RT.spv = { i, d, rem: R[i] }));
    if (d > bd) {
      bd = d;
      bi = i;
    }
  }
  return ((RT.spk = ck), (RT.spv = { i: bi, d: bd, rem: R[bi] }));
}

export let LFQS;
export let LFQT;

export function laneFieldQ(L, sg) {
  if (L < 0 || L > 5 || sg > 127) return laneField(L, sg);
  const k = L * 128 + sg;
  if (LFQT[k] === SW.step) return LFQS[k];
  const S = laneField(L, sg);
  LFQS[k] = S;
  LFQT[k] = SW.step;
  return S;
}

function laneField(L, sg) {
  const key = L * 4096 + sg,
    E = LFLD.get(key);
  if (E && (E.v === sessionState.ver || zombieLanesState.lfBud <= 0)) return E.S;
  if (E) {
    zombieLanesState.lfBud--;
    LFLD.delete(key);
  }
  const Wp = terrainState.ROUTES[L].wps,
    a = Math.min(Wp.length - 1, sg * LSEG),
    b = Math.min(Wp.length - 1, a + LSEG + 2);
  /* the target of a stretch is its farthest way point that has free ground around it; the way points were laid without looking at the land, so that one can sit in a pocket of
     rock or wood that is walled in or only reached by a long walk around. The field is then tried from the next way points back (4 tries, then a wider window once) and kept
     when it reaches the stretch's start tile with a walk of at most DETK times the straight line + DETA tiles; else the first field stands (the horde then clambers, as before) */
  const sp = Wp[a],
    stx = sp[0] | 0,
    sty = sp[1] | 0;
  ensureAround(stx, sty, 1);
  const tryK = (k, mg) => {
    const p = Wp[k],
      cx = p[0] | 0,
      cy = p[1] | 0;
    ensureAround(cx, cy, 1);
    const seeds = [];
    for (let j = -2; j <= 2; j++)
      for (let i = -2; i <= 2; i++) if (!solid(cx + i, cy + j)) seeds.push([cx + i, cy + j]);
    if (!seeds.length) return null;
    let x0 = 1e9,
      y0 = 1e9,
      x1 = -1e9,
      y1 = -1e9;
    for (let i = a; i <= b; i++) {
      x0 = Math.min(x0, Wp[i][0]);
      y0 = Math.min(y0, Wp[i][1]);
      x1 = Math.max(x1, Wp[i][0]);
      y1 = Math.max(y1, Wp[i][1]);
    }
    x0 = Math.floor(x0) - mg;
    y0 = Math.floor(y0) - mg;
    x1 = Math.ceil(x1) + mg;
    y1 = Math.ceil(y1) + mg;
    const F = bfsW(seeds, false, x0, y0, x1 - x0, y1 - y0);
    F.tg = k;
    const v = fv(F, stx, sty);
    return { F, v, ok: v < 65535 && v <= DETK * Math.hypot(p[0] - sp[0], p[1] - sp[1]) + DETA };
  };
  let S = null,
    first = null,
    bestR = null,
    n = 0;
  for (let k = b; k > a && n < 4 && !S; k--) {
    const r = tryK(k, 14);
    if (!r) continue;
    n++;
    if (!first) first = r;
    if (r.ok) S = r.F;
    else if (r.v < 65535 && (!bestR || r.v < bestR.v)) bestR = r;
    k -= 2;
  }
  if (!S && first) {
    const r = tryK(first.F.tg, 40);
    if (r && r.ok) S = r.F;
  }
  if (!S) S = bestR ? bestR.F : first ? first.F : null;
  let bx0 = 1e9,
    by0 = 1e9,
    bx1 = -1e9,
    by1 = -1e9;
  for (let i = a; i <= b; i++) {
    bx0 = Math.min(bx0, Wp[i][0]);
    by0 = Math.min(by0, Wp[i][1]);
    bx1 = Math.max(bx1, Wp[i][0]);
    by1 = Math.max(by1, Wp[i][1]);
  }
  LFLD.set(key, { S, v: sessionState.ver, bb: [bx0 - 16, by0 - 16, bx1 + 16, by1 + 16] });
  if (LFLD.size > 260) LFLD.delete(LFLD.keys().next().value);
  return S;
}

/* a tile of the land changed without a ver bump (a sapling grew into a tree): the fields whose window holds it are stale, so they are rebuilt (within the usual lfBud budget) at their next use.
   Deterministic: it only follows terrain changes, which every client makes on the same tick */
function laneTouch(x, y) {
  for (const [key, E] of LFLD) {
    if (E.v < 0 || x < E.bb[0] || y < E.bb[1] || x > E.bb[2] || y > E.bb[3]) continue;
    E.v = -1;
    const L = (key / 4096) | 0,
      sg = key % 4096;
    if (L < 6 && sg < 128) LFQT[L * 128 + sg] = -1;
  }
}

export function laneWalk(u, dt) {
  const Wp = terrainState.ROUTES[u.lane].wps;
  while (u.ph < Wp.length && dist(u.x, u.y, Wp[u.ph][0] * TS, Wp[u.ph][1] * TS) < TS * 2) u.ph++;
  if (u.ph >= Wp.length) return false;
  const S = laneField(u.lane, Math.floor(u.ph / LSEG)),
    tx = Math.floor(u.x / TS),
    ty = Math.floor(u.y / TS);
  if (S) {
    const v = fv(S, tx, ty);
    if (v < 65535) {
      u.lost = 0;
      u.reAnc = 0;
      if (v <= 3 && S.tg + 1 > u.ph) {
        u.ph = Math.min(Wp.length, S.tg + 1);
        return laneWalk(u, dt);
      }
      /* the way points left in this stretch lie in rock or water: over land to the castle when its field reaches this tile, else on to the next stretch */
      if (v <= 3) {
        if (fv(FD[0], tx, ty) < 65535) {
          u.inC = 1;
          return false;
        }
        u.ph = Math.min(Wp.length, (Math.floor(u.ph / LSEG) + 1) * LSEG);
        u.reAnc = 1;
        return laneWalk(u, dt);
      }
      const g = Wp[S.tg];
      stepF(u, S, g[0] * TS, g[1] * TS, dt);
      return true;
    }
  }
  u.lost = (u.lost || 0) + dt;
  if (u.lost > 1.5 && !u.reAnc) {
    u.reAnc = 1;
    let bj = u.ph,
      bd = 1e18;
    for (let j = 0; j < Wp.length; j++) {
      const dx = Wp[j][0] * TS - u.x,
        dy = Wp[j][1] * TS - u.y,
        d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        bj = j;
      }
    }
    if (bj !== u.ph) {
      u.ph = bj;
      return laneWalk(u, dt);
    }
  }
  if (u.lost > 4) {
    const L2 = longField(tx, ty);
    if (L2 && fv(L2, tx, ty) < 65535) {
      const hc = nearC(u.x, u.y);
      stepF(u, L2, hc.x, hc.y, dt);
      return true;
    }
  }
  u.clb = 0.4;
  moveTo(u, Wp[u.ph][0] * TS, Wp[u.ph][1] * TS, dt);
  return true;
}

export function initializeZombieLanes() {
  onLandChange(laneTouch);
  LFQS = new Array(6 * 128).fill(null);
  LFQT = new Int32Array(6 * 128).fill(-1);
}
