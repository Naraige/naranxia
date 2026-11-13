import { dist } from "../core/math.js";
import { doorTiles } from "../gameplay/construction.js";
import { aliveC, dpt, nearC } from "../gameplay/players.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { bfsT, ringT, swarmState } from "../gameplay/swarm.js";
import { D4, FD, gOK } from "./routes.js";
import { terrainState } from "./terrain-state.js";
import { bfsW, canStep, fv, solid } from "./traversal.js";

export const DSIDE = 3000;
let DEPOTS = [],
  COMPW = [];

export const ringOf = (c) => {
  const s = [];
  for (let j = c.ty - 1; j <= c.ty + c.sz; j++)
    for (let i = c.tx - 1; i <= c.tx + c.sz; i++) if (!solid(i, j)) s.push([i, j]);
  return s;
};

/* peasants' field to a castle: its door wherever the door can be walked to, any side of the castle otherwise (+DSIDE) */
function castleField(c, x0, y0, w, h) {
  const s = ringOf(c),
    sd = doorTiles(c, 1).filter(([i, j]) => !solid(i, j)),
    F = bfsW(sd.length ? sd : s, true, x0, y0, w, h);
  if (sd.length) {
    const Fs = bfsW(s, true, x0, y0, w, h),
      a = F.F,
      b = Fs.F;
    for (let k = 0; k < a.length; k++) if (a[k] === 65535 && b[k] !== 65535) a[k] = Math.min(65000, b[k] + DSIDE);
  }
  F.dep = c;
  return F;
}

export function calcFD() {
  const A = [],
    B = [];
  DEPOTS = [];
  for (const c of aliveC()) {
    A.push(bfsW(ringOf(c), false, c.tx - 63, c.ty - 63, 129, 129));
    B.push(castleField(c, c.tx - 80, c.ty - 80, 161, 161));
    DEPOTS.push(c);
  }
  for (const c of sessionState.structs)
    if (c.t === 0 && c.type === "storage" && c.prog >= 1 && c.hp > 0) {
      const F = bfsW(ringOf(c), true, c.tx - 48, c.ty - 48, 97, 97);
      F.dep = c;
      B.push(F);
      DEPOTS.push(c);
    }
  {
    const Z = aliveC().map((c) => bfsT(ringT(c), c.tx - 64, c.ty - 64, 129, 129));
    swarmState.FZ = Z.length === 1 ? Z[0] : Z.length ? { list: Z } : null;
  }
  FD[0] = A.length === 1 ? A[0] : { list: A };
  terrainState.FP = B.length === 1 ? B[0] : { list: B };
  compLabel();
  sessionState.fdDirty = false;
  sessionState.ver++;
}

/* walkable regions around each castle, so peasants never pick a resource they cannot walk to */
function compLabel() {
  COMPW = [];
  const gs = terrainState.gateSolid;
  terrainState.gateSolid = false;
  try {
    for (const c of aliveC()) {
      const x0 = Math.max(0, c.tx - 80),
        y0 = Math.max(0, c.ty - 80),
        w = Math.min(161, TW - x0),
        h = Math.min(161, TH - y0),
        L = new Int32Array(w * h).fill(-1),
        Q = new Int32Array(w * h);
      let lab = 0;
      for (let s0 = 0; s0 < w * h; s0++) {
        if (L[s0] !== -1) continue;
        const sx = (s0 % w) + x0,
          sy = ((s0 / w) | 0) + y0;
        if (solid(sx, sy)) continue;
        L[s0] = lab;
        let hd = 0,
          tl = 0;
        Q[tl++] = s0;
        while (hd < tl) {
          const k = Q[hd++],
            lx = k % w,
            ly = (k / w) | 0,
            tx = lx + x0,
            ty = ly + y0,
            a = ty * TW + tx;
          for (const [dx, dy] of D4) {
            const nx = lx + dx,
              ny = ly + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const n = ny * w + nx;
            if (L[n] !== -1) continue;
            const gx = tx + dx,
              gy = ty + dy;
            if (solid(gx, gy) || !canStep(a, gy * TW + gx)) continue;
            L[n] = lab;
            Q[tl++] = n;
          }
        }
        lab++;
      }
      COMPW.push({ x0, y0, w, h, L });
    }
  } finally {
    terrainState.gateSolid = gs;
  }
}

export function sameComp(ax, ay, bx, by) {
  for (const W of COMPW) {
    if (
      ax < W.x0 ||
      ay < W.y0 ||
      ax >= W.x0 + W.w ||
      ay >= W.y0 + W.h ||
      bx < W.x0 ||
      by < W.y0 ||
      bx >= W.x0 + W.w ||
      by >= W.y0 + W.h
    )
      continue;
    const la = W.L[(ay - W.y0) * W.w + ax - W.x0],
      lb = W.L[(by - W.y0) * W.w + bx - W.x0];
    return la >= 0 && la === lb;
  }
  return true;
}

/* far from every depot window: a long field from the nearest castle, cached per 32x32 area */
const LF = new Map();
let lfVer = -1;

export function longField(tx, ty) {
  if (lfVer !== sessionState.ver) {
    LF.clear();
    lfVer = sessionState.ver;
  }
  const hc = nearC((tx + 0.5) * TS, (ty + 0.5) * TS),
    gx = Math.floor(tx / 32),
    gy = Math.floor(ty / 32),
    key = hc.sid + ":" + gx + "," + gy;
  let S = LF.get(key);
  if (!S) {
    const x0 = Math.min(hc.tx, gx * 32) - 50,
      y0 = Math.min(hc.ty, gy * 32) - 50,
      x1 = Math.max(hc.tx + 3, gx * 32 + 32) + 50,
      y1 = Math.max(hc.ty + 3, gy * 32 + 32) + 50;
    S = castleField(hc, x0, y0, x1 - x0, y1 - y0);
    LF.set(key, S);
    if (LF.size > 24) LF.delete(LF.keys().next().value);
  }
  return S;
}

export function depFieldAt(tx, ty) {
  return fv(terrainState.FP, tx, ty) < 65535 ? terrainState.FP : longField(tx, ty);
}

export function depBest(S, tx, ty) {
  const L = S && S.list ? S.list : S ? [S] : [];
  let b = null,
    bv = 65535;
  for (const q of L) {
    const v = fv(q, tx, ty);
    if (v < bv) {
      bv = v;
      b = q;
    }
  }
  return b ? { S: b, v: bv } : null;
}

export function atDepot(u) {
  for (const s of DEPOTS) {
    if (s.hp <= 0 || !sessionState.structs.includes(s)) continue;
    if (s.type === "castle") {
      const p = dpt(s);
      if (dist(u.x, u.y, p.x, p.y) < 46) return s;
    } else if (dist(u.x, u.y, s.x, s.y) < 76) return s;
  }
  return null;
}

export function reachTile(S, tx, ty) {
  for (let r = 1; r <= 12; r++)
    for (let j = -r; j <= r; j++)
      for (let i = -r; i <= r; i++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
        const x = tx + i,
          y = ty + j;
        if (gOK(x, y) && !solid(x, y) && fv(S, x, y) < 65535) return [x, y];
      }
  return null;
}

export function reachLong(tx, ty) {
  const S = longField(tx, ty);
  return D4.some(([dx, dy]) => !solid(tx + dx, ty + dy) && fv(S, tx + dx, ty + dy) < 65535);
}
