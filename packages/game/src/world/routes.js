import { fb, hs } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { MAPD, sessionState } from "../gameplay/session.js";
import { amt, CH, FLG, genF, HT, NCX, NCY, occ, stairs, ter, terrainState } from "./terrain-state.js";
import { islandReach } from "./island.js";
import { canStep } from "./traversal-rules.js";

export const D4 = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
  D8 = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
  FD = [null];

export const gOK = (x, y) => x >= 0 && y >= 0 && x < TW && y < TH && genF[((y / CH) | 0) * NCX + ((x / CH) | 0)] === 1;

/* Route bending (v95): the way points used to be laid without looking at the land, so a lane could run straight into a mountain massif (the terrain then cut a canyon for it) or
   through the middle of a wood. `ground(x, y)` (given by terrain.js: pure noise of the seed, no route, no chunk) returns the cost of standing on a tile: water, height above the
   plains, woods. A dynamic programme over the lateral offset of every way point (RSTEP tiles apart, at most RMAX steps (40 x 2 = 80 tiles since lot A, was 48) from the base curve, zero near the castle and at the map edge)
   finds the cheapest bend, then the offsets are smoothed and interpolated along the polyline. No RNG, no terrain generation: same seed + same castles = same routes. */
const RSTEP = 2,
  RMAX = 56,
  RTAPER = 60;

function bendOffsets(ground, CX, CY, ex, ey, px, py, D, lat0, m) {
  const ns = 2 * RMAX + 1,
    INF = 1e12,
    cap = new Int16Array(m),
    row = new Float64Array(ns + 8),
    cell = new Float64Array(m * ns),
    best = new Float64Array(m * ns),
    from = new Int8Array(m * ns),
    G = (x, y) => ground(Math.max(1, Math.min(TW - 2, Math.round(x))), Math.max(1, Math.min(TH - 2, Math.round(y))));
  for (let j = 0; j < m; j++) {
    const d = D - j * 4.5;
    cap[j] = Math.floor(RMAX * Math.max(0, Math.min(1, (D - d) / RTAPER, (d - 8) / RTAPER)));
    /* the side samples (4 and 8 tiles, 2 and 4 steps to each side: a valley narrower than 16 tiles is a corridor where the horde piles up) lie on the same lateral lattice as the centre samples: one ground call per lattice point, not three */
    for (let s = -cap[j] - 4; s <= cap[j] + 4; s++) {
      const lat = lat0[j] + s * RSTEP;
      row[s + 4 + RMAX] = G(CX + 0.5 + ex * d + px * lat, CY + 0.5 + ey * d + py * lat);
    }
    for (let s = -cap[j]; s <= cap[j]; s++)
      cell[j * ns + s + RMAX] =
        4.5 *
          (0.4 * row[s + 4 + RMAX] +
            0.15 * (row[s + 6 + RMAX] + row[s + 2 + RMAX]) +
            0.15 * (row[s + 8 + RMAX] + row[s + RMAX])) +
        0.12 * Math.abs(s * RSTEP);
  }
  best.fill(INF);
  best[RMAX] = cell[RMAX];
  for (let j = 1; j < m; j++)
    for (let s = -cap[j]; s <= cap[j]; s++) {
      let bv = INF,
        bf = 0;
      for (let q = -2; q <= 2; q++) {
        const s0 = s + q;
        if (s0 < -cap[j - 1] || s0 > cap[j - 1]) continue;
        const v = best[(j - 1) * ns + s0 + RMAX] + 0.5 * q * q;
        if (v < bv) {
          bv = v;
          bf = q;
        }
      }
      best[j * ns + s + RMAX] = bv + cell[j * ns + s + RMAX];
      from[j * ns + s + RMAX] = bf;
    }
  const off = new Float64Array(m);
  let s = 0,
    bv = INF;
  for (let t = -cap[m - 1]; t <= cap[m - 1]; t++) {
    const v = best[(m - 1) * ns + t + RMAX];
    if (v < bv) {
      bv = v;
      s = t;
    }
  }
  for (let j = m - 1; j >= 0; j--) {
    off[j] = s * RSTEP;
    s += from[j * ns + s + RMAX];
  }
  for (let pass = 0; pass < 2; pass++) {
    const o2 = off.slice();
    for (let j = 1; j < m - 1; j++) off[j] = (o2[j - 1] + 2 * o2[j] + o2[j + 1]) / 4;
  }
  return off;
}

export function mkRoutes(ground) {
  terrainState.ROUTES = [];
  terrainState.RCH = new Map();
  const a0 = Math.random() * 6.283,
    CT = sessionState.SITE2
      ? [
          [terrainState.CX, terrainState.CY],
          [sessionState.SITE2.tx, sessionState.SITE2.ty],
        ]
      : [[terrainState.CX, terrainState.CY]];
  for (let k = 0; k < 3 * CT.length; k++) {
    const CX = CT[(k / 3) | 0][0],
      CY = CT[(k / 3) | 0][1],
      th = a0 + k * 2.094 + (Math.random() - 0.5) * 0.9,
      ex = Math.cos(th),
      ey = Math.sin(th),
      px = -ey,
      py = ex,
      A = 30 + Math.random() * 34,
      ph = Math.random() * 90,
      pts = [],
      wps = [];
    const D = Math.min(islandReach(CX, CY, ex, ey), MAPD[sessionState.mapSize | 0] || 1e9),
      lats = [];
    for (let d = D; d >= 8; d -= 1.5)
      lats.push(
        (fb(d * 0.02, ph, terrainState.SEED + k * 7) - 0.5) *
          4 *
          A *
          Math.min(1, (D - d) / 40) *
          Math.min(1, (d - 8) / 40),
      );
    const m = Math.ceil(lats.length / 3),
      off =
        ground && m > 3
          ? bendOffsets(
              ground,
              CX,
              CY,
              ex,
              ey,
              px,
              py,
              D,
              lats.filter((_, n) => n % 3 === 0),
              m,
            )
          : null;
    for (let n = 0; n < lats.length; n++) {
      const d = D - n * 1.5;
      let lat = lats[n];
      if (off) {
        const j = Math.min(m - 1, Math.floor(n / 3)),
          f = (n % 3) / 3;
        lat += j + 1 < m ? off[j] * (1 - f) + off[j + 1] * f : off[j];
      }
      const p = [
        Math.max(9, Math.min(TW - 10, CX + 0.5 + ex * d + px * lat)),
        Math.max(9, Math.min(TH - 10, CY + 0.5 + ey * d + py * lat)),
      ];
      pts.push(p);
      if (n % 3 === 0) wps.push(p);
    }
    terrainState.ROUTES.push({
      th,
      pts,
      wps,
      dir: ["E", "SE", "S", "SW", "W", "NW", "N", "NE"][((Math.round(th / 0.7854) % 8) + 8) % 8],
    });
    for (const p of pts) {
      const c0 = Math.floor((p[0] - 17) / CH),
        c1 = Math.floor((p[0] + 17) / CH),
        r0 = Math.floor((p[1] - 17) / CH),
        r1 = Math.floor((p[1] + 17) / CH);
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          if (c < 0 || r < 0 || c >= NCX || r >= NCY) continue;
          const key = r * NCX + c;
          let L = terrainState.RCH.get(key);
          if (!L) {
            L = [];
            terrainState.RCH.set(key, L);
          }
          L.push(p[0], p[1]);
        }
    }
  }
}

/* natural ramps carved into terraces: chains of sloped tiles, 2 wide */
export function carveRamps(cx, cy) {
  const x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH),
    sd = terrainState.SEED,
    used = new Set(),
    ok1 = (i) => ter[i] === 0 || ter[i] === 2;
  for (let y = y0 + 2; y < y1 - 2; y++)
    for (let x = x0 + 2; x < x1 - 2; x++) {
      const P = y * TW + x;
      if (!ok1(P) || FLG[P]) continue;
      for (let di = 0; di < 4; di++) {
        const [dx, dy] = D4[di],
          Q = P + dy * TW + dx;
        if (!ok1(Q) || FLG[Q]) continue;
        const diff = HT[Q] - HT[P];
        if (diff < 1 || diff > 12) continue;
        if (hs(x * 1.3 + di, y * 1.7, sd + 31) > 0.085) continue;
        const step = 1 /* stairs rise one block a step (v101, #55) */,
          n = Math.ceil(diff / step),
          lo = HT[P],
          hi = HT[Q],
          mx = -dy,
          my = dx;
        let good = true;
        const T1 = [];
        for (let k = 0; k <= n && good; k++) {
          const qx = x + dx * (k + 1),
            qy = y + dy * (k + 1);
          if (qx < x0 + 1 || qy < y0 + 1 || qx >= x1 - 1 || qy >= y1 - 1) {
            good = false;
            break;
          }
          for (const t of [0, 1, 2]) {
            const ii = (qy + my * t) * TW + qx + mx * t;
            if (HT[ii] !== hi || !ok1(ii) || FLG[ii] || used.has(ii) || stairs.has(ii)) {
              good = false;
              break;
            }
            if (k < n) T1.push([ii, k, t]);
          }
        }
        const P2 = P + my * TW + mx,
          P3 = P2 + my * TW + mx;
        if (!good || HT[P2] !== lo || !ok1(P2) || HT[P3] !== lo || !ok1(P3) || used.has(P)) continue;
        /* accessibility: both ends must be clear, same-height, free ground (no tree/rock/water) */
        {
          let acc = ter[P] === 0 && ter[P2] === 0 && ter[P3] === 0;
          const fl = (ii, h) => HT[ii] === h && ter[ii] === 0 && !stairs.has(ii);
          for (const t of [0, 1, 2]) {
            if (!acc) break;
            const bx = x - dx + mx * t,
              by = y - dy + my * t,
              tx2 = x + dx * (n + 1) + mx * t,
              ty2 = y + dy * (n + 1) + my * t,
              ux = x + dx * (n + 2) + mx * t,
              uy = y + dy * (n + 2) + my * t;
            if (bx < x0 || by < y0 || bx >= x1 || by >= y1 || ux < x0 || uy < y0 || ux >= x1 || uy >= y1) {
              acc = false;
              break;
            }
            if (!fl(by * TW + bx, lo) || !fl(ty2 * TW + tx2, hi) || !fl(uy * TW + ux, hi)) acc = false;
          }
          if (!acc) continue;
        }
        for (const [ii, k] of T1) {
          const lk = lo + k * step,
            hk = Math.min(hi, lk + step);
          HT[ii] = lk;
          ter[ii] = 0;
          amt[ii] = 0;
          stairs.set(ii, { ax: dx ? 0 : 1, sg: dx + dy > 0 ? 1 : -1, lo: lk, hi: hk, nat: 1 });
          for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) used.add(ii + b * TW + a);
        }
        for (let k = -3; k <= n + 3; k++)
          for (let t = -4; t <= 6; t++) {
            const ii = (y + dy * (k + 1) + my * t) * TW + x + dx * (k + 1) + mx * t;
            used.add(ii);
          }
        used.add(P);
        used.add(P2);
        used.add(P3);
        break;
      }
    }
}

/* every plateau must be reachable: isolated pockets get a forced ramp (or are levelled), unreachable resources are removed */
function rampCarve(P, dd, x0, y0, x1, y1, low, wide) {
  const px = P % TW,
    py = (P / TW) | 0,
    dx = dd === 1 ? 1 : dd === -1 ? -1 : 0,
    dy = dd === TW ? 1 : dd === -TW ? -1 : 0,
    Q = P + dd,
    lo = HT[P],
    hi = HT[Q],
    diff = hi - lo;
  if (diff < 1 || diff > 12) return false;
  const step = 1 /* stairs rise one block a step (v101, #55) */,
    n = Math.ceil(diff / step),
    mx = -dy,
    my = dx,
    ax = dx ? 0 : 1,
    sgn = dx + dy > 0 ? 1 : -1,
    okT = (i) => ter[i] !== 1 && ter[i] !== 5 && !stairs.has(i) && !occ.has(i),
    inb = (x, y) => x >= x0 + 1 && y >= y0 + 1 && x < x1 - 1 && y < y1 - 1;
  for (const sg of wide ? [1, -1] : [0]) {
    const side = wide ? [0, sg] : [0];
    let good = true;
    const T1 = [],
      L1 = [];
    for (const t of side) {
      const bx = low ? px + dx + mx * t : px + mx * t,
        by = low ? py + dy + my * t : py + my * t;
      if (!inb(bx, by)) {
        good = false;
        break;
      }
      const b = by * TW + bx;
      if (!okT(b) || HT[b] !== (low ? hi : lo)) {
        good = false;
        break;
      }
      L1.push(b);
    }
    for (let k = 0; k <= n && good; k++)
      for (const t of side) {
        const qx = low ? px - dx * k + mx * t : px + dx * (k + 1) + mx * t,
          qy = low ? py - dy * k + my * t : py + dy * (k + 1) + my * t;
        if (!inb(qx, qy)) {
          good = false;
          break;
        }
        const ii = qy * TW + qx;
        if (!okT(ii) || HT[ii] !== (low ? lo : hi) || FLG[ii] & 3) {
          good = false;
          break;
        }
        T1.push([ii, k]);
      }
    if (!good) continue;
    const sv = T1.map(([ii]) => [ii, HT[ii], ter[ii], amt[ii]]).concat(L1.map((i) => [i, HT[i], ter[i], amt[i]]));
    for (const [ii, k] of T1) {
      if (k < n) {
        let lk, hk;
        if (low) {
          hk = hi - k * step;
          lk = Math.max(lo, hk - step);
        } else {
          lk = lo + k * step;
          hk = Math.min(hi, lk + step);
        }
        HT[ii] = lk;
        stairs.set(ii, { ax, sg: sgn, lo: lk, hi: hk, nat: 1 });
      }
      ter[ii] = 0;
      amt[ii] = 0;
    }
    for (const i of L1) {
      ter[i] = 0;
      amt[i] = 0;
    }
    /* the cut must not strand a corner of the terrace it enters: every tile beside the run still reaches the landing */
    if (
      !rampKeeps(
        T1.filter((t) => t[1] < n).map((t) => t[0]),
        T1.filter((t) => t[1] === n).map((t) => t[0]),
        low ? lo : hi,
        x0,
        y0,
        x1,
        y1,
      )
    ) {
      for (const [ii, h0, t0, a0] of sv) {
        HT[ii] = h0;
        ter[ii] = t0;
        amt[ii] = a0;
        stairs.delete(ii);
      }
      continue;
    }
    RAMPT = T1.map((t) => t[0]).concat(L1);
    return true;
  }
  return false;
}

function rampKeeps(run, land, h, x0, y0, x1, y1) {
  const S = new Set(run),
    need = new Set();
  for (const ii of run)
    for (const [dx, dy] of D4) {
      const b = ii + dy * TW + dx;
      if (!S.has(b) && HT[b] === h && !stairs.has(b) && ter[b] !== 1 && ter[b] !== 5) need.add(b);
    }
  if (!need.size) return true;
  const seen = new Set(land),
    Q = [...land];
  let hd = 0;
  while (hd < Q.length && need.size && Q.length < 1500) {
    const a = Q[hd++];
    need.delete(a);
    const ax = a % TW,
      ay = (a / TW) | 0;
    for (const [dx, dy] of D4) {
      const bx = ax + dx,
        by = ay + dy;
      if (bx < x0 || by < y0 || bx >= x1 || by >= y1) continue;
      const b = by * TW + bx;
      if (seen.has(b) || HT[b] !== h || stairs.has(b) || ter[b] === 1 || ter[b] === 5) continue;
      seen.add(b);
      Q.push(b);
    }
  }
  return need.size === 0;
}

export let RAMPT = [];

export function tryRamp(P, dd, x0, y0, x1, y1) {
  return (
    rampCarve(P, dd, x0, y0, x1, y1, false, true) ||
    rampCarve(P, dd, x0, y0, x1, y1, true, true) ||
    rampCarve(P, dd, x0, y0, x1, y1, false, false) ||
    rampCarve(P, dd, x0, y0, x1, y1, true, false)
  );
}

export function fixAccess(cx, cy) {
  const x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH),
    w = x1 - x0,
    h = y1 - y0,
    lab = new Int16Array(w * h),
    comps = [];
  let nl = 0;
  const walk = (i) => ter[i] !== 1 && ter[i] !== 5;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * TW + x,
        li = (y - y0) * w + (x - x0);
      if (lab[li] || !walk(i)) continue;
      const id = ++nl,
        st = [i],
        C = { id, t: [], border: false };
      lab[li] = id;
      while (st.length) {
        const a = st.pop(),
          ax = a % TW,
          ay = (a / TW) | 0;
        C.t.push(a);
        if (ax === x0 || ay === y0 || ax === x1 - 1 || ay === y1 - 1) C.border = true;
        for (const [dx, dy] of D4) {
          const bx = ax + dx,
            by = ay + dy;
          if (bx < x0 || by < y0 || bx >= x1 || by >= y1) continue;
          const b = by * TW + bx,
            lb = (by - y0) * w + (bx - x0);
          if (lab[lb] || !walk(b) || !canStep(a, b)) continue;
          lab[lb] = id;
          st.push(b);
        }
      }
      comps.push(C);
    }
  if (comps.length < 2) return;
  let big = comps[0];
  for (const C of comps) if (C.t.length > big.t.length) big = C;
  const par = comps.map((_, i) => i),
    find = (i) => {
      while (par[i] !== i) i = par[i] = par[par[i]];
      return i;
    };
  const order = comps.slice().sort((a, b) => a.t.length - b.t.length);
  for (const C of order) {
    if (C === big || find(C.id - 1) === find(big.id - 1)) continue;
    const cand = [];
    for (const a of C.t) {
      const ax = a % TW,
        ay = (a / TW) | 0;
      for (const [dx, dy] of D4) {
        const bx = ax + dx,
          by = ay + dy;
        if (bx < x0 || by < y0 || bx >= x1 || by >= y1) continue;
        const b = by * TW + bx,
          L = lab[(by - y0) * w + (bx - x0)];
        if (!L || L === C.id || find(L - 1) === find(C.id - 1) || !walk(b)) continue;
        const df = HT[b] - HT[a];
        if (df === 0 || Math.abs(df) > 12) continue;
        if (df > 0) cand.push([a, b - a, L, hs(a % 97, (a / 97) | 0, terrainState.SEED + 5)]);
        else cand.push([b, a - b, L, hs(a % 97, (a / 97) | 0, terrainState.SEED + 6)]);
      }
    }
    cand.sort((p, q) => p[3] - q[3]);
    let done = false;
    for (let k = 0; k < Math.min(cand.length, 240) && !done; k++) {
      const [P, dd, L] = cand[k];
      if (tryRamp(P, dd, x0, y0, x1, y1)) {
        par[find(C.id - 1)] = find(L - 1);
        done = true;
      }
    }
    if (done) continue;
    if (C.border) continue;
    const cnt = new Map();
    for (const a of C.t) {
      const ax = a % TW,
        ay = (a / TW) | 0;
      for (const [dx, dy] of D4) {
        const bx = ax + dx,
          by = ay + dy;
        if (bx < x0 || by < y0 || bx >= x1 || by >= y1) continue;
        const b = by * TW + bx;
        if (lab[(by - y0) * w + (bx - x0)] === C.id || ter[b] === 1 || ter[b] === 5 || stairs.has(b)) continue;
        cnt.set(HT[b], (cnt.get(HT[b]) || 0) + 1);
      }
    }
    let bh = -1,
      bc = 0;
    for (const [hh, c] of cnt)
      if (c > bc) {
        bc = c;
        bh = hh;
      }
    if (bh >= 0 && !C.t.some((a) => stairs.has(a))) {
      for (const a of C.t) {
        HT[a] = bh;
        if (ter[a] === 5) ter[a] = 0;
      }
    } else
      for (const a of C.t)
        if (ter[a] >= 2 && ter[a] <= 4) {
          ter[a] = 0;
          amt[a] = 0;
        }
  }
}
