import { TH, TS, TW } from "../gameplay/rules.js";
import { markT } from "./terrain-invalidation.js";
import { prepareTerrainRect } from "./chunk-provider.js";
import { D4, gOK } from "./routes.js";
import { canStep, canStepZ } from "./traversal-rules.js";
import { HT, occ, pth, stairs, ter, terrainState, TFL } from "./terrain-state.js";

export { canStep, canStepZ };

/* ---- passability ---- */
export const solid = (x, y) => {
  if (!gOK(x, y)) return true;
  const i = y * TW + x;
  if (ter[i] > 0) return true;
  const o = occ.get(i);
  return !!o && (!o.gate || terrainState.gateSolid || (o.gl === 3 && (o.ax ? y !== o.ty + 1 : x !== o.tx + 1)));
};

export const solidAt = (x, y) => solid(Math.floor(x / TS), Math.floor(y / TS));

/* a change of level needs a ramp (stairs). TFL marks terrain reshaped by the game: 1 = levelling around buildings and camps,
   bomb craters (anyone may step 1 level there), 2 = steps cut by zombie miners (only zombies climb them),
   3 = blocks raised or dug by the player (nobody climbs them: build a ramp). canStep is for our units, canStepZ for zombies. */

export function blk(tx, ty, i, j) {
  if (solid(i, j)) return true;
  const a = ty * TW + tx,
    b = j * TW + i;
  if (HT[a] === HT[b]) return false;
  if (i !== tx && j !== ty) return true;
  return !canStep(a, b);
}

export function bfsW(seeds, pl, x0, y0, w, h) {
  x0 = Math.max(0, x0);
  y0 = Math.max(0, y0);
  w = Math.min(w, TW - x0);
  h = Math.min(h, TH - y0);
  prepareTerrainRect(x0, y0, w, h);
  terrainState.gateSolid = !pl;
  const F = new Uint16Array(w * h).fill(65535),
    Q = new Int32Array(w * h);
  let hd = 0,
    tl = 0;
  for (const [sx, sy] of seeds) {
    if (sx < x0 || sy < y0 || sx >= x0 + w || sy >= y0 + h) continue;
    const k = (sy - y0) * w + sx - x0;
    if (F[k] === 0) continue;
    F[k] = 0;
    Q[tl++] = k;
  }
  while (hd < tl) {
    const k = Q[hd++],
      lx = k % w,
      ly = (k / w) | 0,
      tx = lx + x0,
      ty = ly + y0,
      d = F[k] + 1,
      a = ty * TW + tx;
    for (const [dx, dy] of D4) {
      const nx = lx + dx,
        ny = ly + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (F[n] !== 65535) continue;
      const gx = tx + dx,
        gy = ty + dy;
      if (solid(gx, gy) || !canStep(a, gy * TW + gx)) continue;
      F[n] = d;
      Q[tl++] = n;
    }
  }
  terrainState.gateSolid = true;
  return { F, x0, y0, w, h };
}

export const fv = (S, x, y) =>
  S && S.list
    ? S.list.reduce((m, q) => Math.min(m, fv(q, x, y)), 65535)
    : !S || x < S.x0 || y < S.y0 || x >= S.x0 + S.w || y >= S.y0 + S.h
      ? 65535
      : S.F[(y - S.y0) * S.w + x - S.x0];

export function freeTile(tx, ty) {
  for (let r = 0; r <= 4; r++)
    for (let j = -r; j <= r; j++)
      for (let i = -r; i <= r; i++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
        if (!solid(tx + i, ty + j)) return [tx + i, ty + j];
      }
  return null;
}

/* ---- stairs & ground leveling ---- */
export function stairInfo(tx, ty) {
  const i = ty * TW + tx;
  if (solid(tx, ty) || stairs.has(i) || pth[i]) return null;
  let best = null;
  for (const ax of [0, 1]) {
    const a = ax ? [tx, ty - 1] : [tx - 1, ty],
      b = ax ? [tx, ty + 1] : [tx + 1, ty];
    if (solid(a[0], a[1]) || solid(b[0], b[1])) continue;
    const ha = HT[a[1] * TW + a[0]],
      hb = HT[b[1] * TW + b[0]],
      df = Math.abs(ha - hb);
    if (df < 1 || df > 12) continue;
    const lo = Math.min(ha, hb),
      sc = (HT[i] === lo ? 0 : 1) * 100 + df;
    if (!best || sc < best.sc) best = { ax, sg: hb > ha ? 1 : -1, lo, hi: Math.max(ha, hb), sc };
  }
  return best;
}

export const LVO = new Map();

export function levelGround(tx, ty, sz, h0) {
  for (let j = ty - 1; j <= ty + sz; j++)
    for (let i = tx - 1; i <= tx + sz; i++) {
      const k = j * TW + i;
      if (!gOK(i, j)) continue;
      const inside = i >= tx && i < tx + sz && j >= ty && j < ty + sz;
      if (inside) {
        if (HT[k] !== h0) {
          const lv = LVO.get(k);
          LVO.set(k, { o: lv ? lv.o : HT[k], h: h0 });
          HT[k] = h0;
          markT(i, j);
        }
        continue;
      }
      if (ter[k] !== 0 || occ.has(k) || stairs.has(k)) continue;
      if (Math.abs(HT[k] - h0) === 1) TFL[k] = 1;
    }
}
