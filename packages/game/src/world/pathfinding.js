import { nearC } from "../gameplay/players.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { D4 } from "./routes.js";
import { prepareTerrainRect } from "./chunk-provider.js";
import { pth, terrainState } from "./terrain-state.js";
import { bfsW, canStep, freeTile, fv, solid } from "./traversal.js";
import { GF } from "./pathfinding-state.js";

export { GF } from "./pathfinding-state.js";

/* order fields: Dijkstra over the walk grid where roads are cheaper (dirt 4, stone 3, grass 6), searched in a window that grows when
   the detour leaves it; an unreachable target sends the group to the closest tile they can actually reach (alt) */
function dijW(seeds, pl, x0, y0, w, h) {
  x0 = Math.max(0, x0);
  y0 = Math.max(0, y0);
  w = Math.min(w, TW - x0);
  h = Math.min(h, TH - y0);
  prepareTerrainRect(x0, y0, w, h);
  terrainState.gateSolid = !pl;
  const F = new Uint16Array(w * h).fill(65535),
    B = [[], [], [], [], [], [], [], []];
  let pend = 0;
  for (const [sx, sy] of seeds) {
    if (sx < x0 || sy < y0 || sx >= x0 + w || sy >= y0 + h) continue;
    const k = (sy - y0) * w + sx - x0;
    if (F[k] === 0) continue;
    F[k] = 0;
    B[0].push(k);
    pend++;
  }
  for (let d = 0; pend > 0 && d < 65000; d++) {
    const q = B[d & 7];
    while (q.length) {
      const k = q.pop();
      pend--;
      if (F[k] !== d) continue;
      const lx = k % w,
        ly = (k / w) | 0,
        tx = lx + x0,
        ty = ly + y0,
        a = ty * TW + tx;
      for (const [dx, dy] of D4) {
        const nx = lx + dx,
          ny = ly + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx,
          gx = tx + dx,
          gy = ty + dy,
          gi = gy * TW + gx,
          nd = d + (pth[gi] === 2 ? 3 : pth[gi] ? 4 : 6);
        if (nd >= F[n] || solid(gx, gy) || !canStep(a, gi)) continue;
        F[n] = nd;
        B[nd & 7].push(n);
        pend++;
      }
    }
  }
  terrainState.gateSolid = true;
  return { F, x0, y0, w, h };
}

export function mkG(tx, ty, sx, sy, quick) {
  return {
    ver: -1,
    S: null,
    tx,
    ty,
    sx,
    sy,
    alt: null,
    big: 0,
    q: quick ? 1 : 0,
    mk() {
      const ft = freeTile(tx, ty);
      this.alt = null;
      this.ver = sessionState.ver;
      if (!ft) {
        this.S = null;
        return;
      }
      const si = Math.floor(this.sx),
        sj = Math.floor(this.sy);
      let x0, y0, x1, y1;
      for (const m of quick ? [24] : this.big ? [160] : [24, 72, 160]) {
        x0 = Math.floor(Math.min(tx, sx)) - m;
        y0 = Math.floor(Math.min(ty, sy)) - m;
        x1 = Math.ceil(Math.max(tx, sx)) + m;
        y1 = Math.ceil(Math.max(ty, sy)) + m;
        if (x1 - x0 > 460) {
          const c = (tx + si) >> 1;
          x0 = c - 230;
          x1 = c + 230;
        }
        if (y1 - y0 > 460) {
          const c = (ty + sj) >> 1;
          y0 = c - 230;
          y1 = c + 230;
        }
        this.S = dijW([ft], true, x0, y0, x1 - x0, y1 - y0);
        if (quick || fv(this.S, si, sj) < 65535) return;
      }
      const st = freeTile(si, sj);
      if (!st) return;
      const Bf = bfsW([st], true, x0, y0, x1 - x0, y1 - y0);
      let bk = -1,
        bd = 1e18;
      for (let k = 0; k < Bf.F.length; k++) {
        if (Bf.F[k] === 65535) continue;
        const x = Bf.x0 + (k % Bf.w),
          y = Bf.y0 + ((k / Bf.w) | 0),
          d = (x - tx) * (x - tx) + (y - ty) * (y - ty);
        if (d < bd || (d === bd && Bf.F[k] < Bf.F[bk])) {
          bd = d;
          bk = k;
        }
      }
      if (bk < 0) return;
      const bx = Bf.x0 + (bk % Bf.w),
        by = Bf.y0 + ((bk / Bf.w) | 0);
      this.S = dijW([[bx, by]], true, x0, y0, x1 - x0, y1 - y0);
      this.alt = { x: (bx + 0.5) * TS, y: (by + 0.5) * TS };
    },
  };
}

let gfVer = -1;

export function gField(key, tx, ty, sz) {
  if (gfVer !== sessionState.ver) {
    GF.clear();
    gfVer = sessionState.ver;
  }
  let S = GF.get(key);
  if (!S) {
    const s = [];
    for (let j = ty - 1; j <= ty + sz; j++)
      for (let i = tx - 1; i <= tx + sz; i++) {
        if (i >= tx && i < tx + sz && j >= ty && j < ty + sz) continue;
        if (!solid(i, j)) s.push([i, j]);
      }
    const hq = nearC((tx + 0.5) * TS, (ty + 0.5) * TS),
      x0 = Math.min(tx, hq.tx) - 60,
      y0 = Math.min(ty, hq.ty) - 60,
      x1 = Math.max(tx + sz, hq.tx) + 60,
      y1 = Math.max(ty + sz, hq.ty) + 60;
    S = bfsW(s, true, x0, y0, x1 - x0, y1 - y0);
    GF.set(key, S);
    if (GF.size > 60) GF.delete(GF.keys().next().value);
  }
  return S;
}
