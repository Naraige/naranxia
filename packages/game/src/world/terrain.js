import { fb, hs, hyp } from "../core/math.js";
import { N, TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { markP, markT } from "./terrain-invalidation.js";
import { cvs } from "../ui/canvases.js";
import { mmChunk, mmTile } from "./minimap.js";
import { GF } from "./pathfinding-state.js";
import { setTerrainRectPreparer } from "./chunk-provider.js";
import { carveRamps, D4, D8, fixAccess, mkRoutes, RAMPT, tryRamp } from "./routes.js";
import { canStep } from "./traversal-rules.js";
import {
  CAMPS,
  CH,
  FLG,
  HT,
  LAND,
  BED,
  WLV,
  ROCKH,
  NCX,
  NCY,
  occ,
  stairs,
  ter,
  amt,
  pth,
  genF,
  TFL,
  mg,
  RAWD,
  smDone,
  SEALD,
  RUINS,
  terrainState,
  setTerrainGridState,
  setTerrainCacheState,
} from "./terrain-state.js";

export {
  terrainState,
  CH,
  NCX,
  NCY,
  LAND,
  BED,
  WLV,
  ROCKH,
  SNOW,
  HT,
  ter,
  amt,
  pth,
  FLG,
  genF,
  occ,
  stairs,
  CAMPS,
  RUINS,
  TFL,
  mc,
  mg,
  RAWD,
  smDone,
  SEALD,
} from "./terrain-state.js";

/* ================= WORLD (lazy chunks) ================= */
function mkGord() {
  const o = [],
    ccx = terrainState.CX / CH,
    ccy = terrainState.CY / CH;
  for (let j = 0; j < NCY; j++)
    for (let i = 0; i < NCX; i++)
      o.push([
        Math.min(
          hyp(i + 0.5 - ccx, j + 0.5 - ccy),
          sessionState.SITE2 ? hyp(i + 0.5 - sessionState.SITE2.tx / CH, j + 0.5 - sessionState.SITE2.ty / CH) : 1e9,
        ),
        j * NCX + i,
      ]);
  o.sort((a, b) => a[0] - b[0]);
  terrainState.GORD = o.map((a) => a[1]);
}

export function bgGen(ms) {
  const t0 = performance.now();
  while (terrainState.GI < terrainState.GORD.length && performance.now() - t0 < ms) {
    const k = terrainState.GORD[terrainState.GI++];
    if (!genF[k]) genChunk(k % NCX, (k / NCX) | 0);
  }
}

/* ancient ruins: one explorable landmark in some chunks far from the castle (loot once, see gameplay/ruins.js) */
function mkRuin(cx, cy, k) {
  const dc = Math.max(Math.abs(cx * CH + 16 - terrainState.CX), Math.abs(cy * CH + 16 - terrainState.CY));
  if (dc < 48 || hs(cx, cy, terrainState.SEED + 171) > 0.2) return;
  for (let t = 0; t < 12; t++) {
    const x = cx * CH + 4 + ((hs(cx, cy, terrainState.SEED + 172 + t) * (CH - 8)) | 0),
      y = cy * CH + 4 + ((hs(cx, cy, terrainState.SEED + 190 + t) * (CH - 8)) | 0),
      i = y * TW + x;
    if (ter[i] !== 0 || FLG[i] || stairs.has(i) || HT[i] <= WLV + 1) continue;
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const j = i + dy * TW + dx;
        if (ter[j] !== 0 || FLG[j] || stairs.has(j) || HT[j] !== HT[i]) {
          ok = false;
          break;
        }
      }
    if (!ok) continue;
    RUINS.set(k, {
      x: (x + 0.5) * TS,
      y: (y + 0.5) * TS,
      tx: x,
      ty: y,
      h: HT[i],
      d: Math.round(dc),
      done: false,
      cx,
      cy,
      v: (hs(cx, cy, terrainState.SEED + 173) * 3) | 0,
    });
    return;
  }
}

export let _bwat = false;

export function baseHW(x, y) {
  const sd = terrainState.SEED,
    P = terrainState.GPR,
    wx = x + (fb(x * 0.011, y * 0.011, sd + 700) - 0.5) * 34,
    wy = y + (fb(x * 0.011, y * 0.011, sd + 710) - 0.5) * 34,
    mm = fb(wx * P.fq, wy * P.fq, sd + 400),
    r = 1 - Math.abs(fb(wx * 0.02, wy * 0.02, sd + 300) * 2 - 1),
    dt = fb(x * 0.2, y * 0.2, sd + 500),
    bn = fb(x * 0.02, y * 0.02, sd + 20);
  const up = Math.max(0, mm - P.mt),
    u = Math.min(1.25, up / 0.22),
    E = Math.max(
      0,
      u * Math.sqrt(Math.sqrt(u)) * P.am * 17 + Math.max(0, r - P.rg) * P.am * 55 + (dt - 0.5) * 2 * Math.min(1, u * 3),
    );
  const h = LAND + (bn < 0.36 ? -1 : bn > 0.64 ? 1 : 0) + (E < 4 ? Math.round(E) : 4 + 2 * Math.round((E - 4) / 2));
  const lk = fb(x * 0.0042, y * 0.0042, sd + 1300),
    rv1 = Math.abs(fb(x * 0.0065, y * 0.0065, sd + 900) - 0.5),
    rv2 = Math.abs(fb(x * 0.011, y * 0.011, sd + 950) - 0.5),
    rw = 0.012 + P.rv * 0.5;
  let water = lk < 0.27 - (P.wl - 0.28) * 0.4;
  if (!water && h < LAND + 9 && (rv1 < rw || (rv2 < rw * 0.55 && lk < 0.42))) water = true;
  _bwat = water;
  return h;
}

const CTRS = () =>
  sessionState.SITE2
    ? [
        [terrainState.CX, terrainState.CY],
        [sessionState.SITE2.tx, sessionState.SITE2.ty],
      ]
    : [[terrainState.CX, terrainState.CY]];

/* height of a castle square: the ground under its centre (rock and the heights stay below the rock line) */
const CSITEHC = new Map();
function CSITEH(x, y) {
  const k = terrainState.SEED + ":" + x + ":" + y;
  let v = CSITEHC.get(k);
  if (v === undefined) {
    const hh = [];
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) hh.push(baseHW(x + i, y + j));
    hh.sort((a, b) => a - b);
    v = Math.max(LAND, Math.min(ROCKH - 2, hh[12]));
    CSITEHC.set(k, v);
  }
  return v;
}

/* ---- terrain stages (pure: any chunk order gives the same world) ----
   raw: noise heights + castle / route limits; smooth: majority filter, slivers narrower than 3 tiles merged into a neighbour terrace,
   majority again; coasts; flat: plateaus or pits smaller than FT tiles take the height of the big terrace around them */
let RAWH;
let RAWF;
let RAWL;
let SMH;
let SMF;
const FT = 56;

function rawAt(x, y) {
  const i = y * TW + x;
  if (RAWD[i]) return i;
  RAWD[i] = 1;
  let h = baseHW(x, y),
    water = _bwat,
    cheb = Math.max(Math.abs(x - terrainState.CX), Math.abs(y - terrainState.CY)),
    hc = CSITEH(terrainState.CX, terrainState.CY);
  if (sessionState.SITE2) {
    const c2 = Math.max(Math.abs(x - sessionState.SITE2.tx), Math.abs(y - sessionState.SITE2.ty));
    if (c2 < cheb) {
      cheb = c2;
      hc = CSITEH(sessionState.SITE2.tx, sessionState.SITE2.ty);
    }
  }
  let lim = 999,
    flag = 0;
  if (cheb <= 3) flag = 1;
  const pl = terrainState.RCH.get(((y / CH) | 0) * NCX + ((x / CH) | 0));
  if (pl && cheb > 44) {
    let md = 1e9;
    for (let j = 0; j < pl.length; j += 2) {
      const a = x - pl[j],
        b = y - pl[j + 1],
        dd = a * a + b * b;
      if (dd < md) md = dd;
    }
    md = Math.sqrt(md);
    if (md <= 3.1) flag |= 2;
    else if (md <= 22) {
      const l2 = LAND + Math.ceil((md - 3.1) / 4.5);
      if (l2 < lim) lim = l2;
    }
  }
  if (flag & 1) {
    h = hc;
    water = false;
  } else if (flag) {
    h = LAND;
    water = false;
  } else if (h > lim) h = lim;
  RAWH[i] = h;
  RAWL[i] = lim > 255 ? 255 : lim;
  RAWF[i] = flag | (water ? 16 : 0);
  return i;
}

const SMC = new Int32Array(256);

/* majority of the 3x3 land tiles (water, map outside and castle / route tiles keep their value); a tie keeps the centre, else the lowest */
function smMode(S, F, ww, wh, r) {
  const O = S.slice();
  for (let y = r; y < wh - r; y++)
    for (let x = r; x < ww - r; x++) {
      const q = y * ww + x;
      if (F[q] & 7) continue;
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (!(F[p] & 5)) SMC[S[p]]++;
        }
      const c0 = S[q];
      let bv = c0,
        bc = SMC[c0];
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (F[p] & 5) continue;
          const v = S[p],
            c = SMC[v];
          if (c > bc || (c === bc && bv !== c0 && v < bv)) {
            bc = c;
            bv = v;
          }
        }
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (!(F[p] & 5)) SMC[S[p]] = 0;
        }
      O[q] = bv;
    }
  return O;
}

/* opening: a tile stays on its terrace only if some 3x3 block of that terrace covers it; slivers 1-2 tiles wide take the commonest other height */
function smThin(S, F, ww, wh, r) {
  const O = S.slice(),
    I = new Uint8Array(ww * wh);
  for (let y = r - 1; y < wh - r + 1; y++)
    for (let x = r - 1; x < ww - r + 1; x++) {
      const q = y * ww + x;
      if (F[q] & 5) continue;
      const h = S[q];
      let ok = 1;
      for (let j = -ww; j <= ww && ok; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (!(F[p] & 5) && S[p] !== h) {
            ok = 0;
            break;
          }
        }
      I[q] = ok;
    }
  for (let y = r; y < wh - r; y++)
    for (let x = r; x < ww - r; x++) {
      const q = y * ww + x;
      if (F[q] & 7) continue;
      const h = S[q];
      let sup = 0;
      for (let j = -ww; j <= ww && !sup; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (I[p] && S[p] === h && !(F[p] & 5)) {
            sup = 1;
            break;
          }
        }
      if (sup) continue;
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (!(F[p] & 5) && S[p] !== h) SMC[S[p]]++;
        }
      let bv = -1,
        bc = 0;
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (F[p] & 5 || S[p] === h) continue;
          const v = S[p],
            c = SMC[v];
          if (c > bc || (c === bc && v < bv)) {
            bc = c;
            bv = v;
          }
        }
      for (let j = -ww; j <= ww; j += ww)
        for (let i = -1; i <= 1; i++) {
          const p = q + j + i;
          if (!(F[p] & 5)) SMC[S[p]] = 0;
        }
      if (bv >= 0) O[q] = bv;
    }
  return O;
}

function smChunk(cx, cy) {
  if (cx < 0 || cy < 0 || cx >= NCX || cy >= NCY) return;
  const k = cy * NCX + cx;
  if (smDone[k]) return;
  smDone[k] = 1;
  const M = 5,
    x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH),
    wx0 = x0 - M,
    wy0 = y0 - M,
    ww = x1 - x0 + 2 * M,
    wh = y1 - y0 + 2 * M,
    A = new Uint8Array(ww * wh),
    F = new Uint8Array(ww * wh);
  for (let y = 0; y < wh; y++)
    for (let x = 0; x < ww; x++) {
      const gx = wx0 + x,
        gy = wy0 + y,
        q = y * ww + x;
      if (gx < 0 || gy < 0 || gx >= TW || gy >= TH) {
        F[q] = 4;
        continue;
      }
      const i = rawAt(gx, gy),
        f = RAWF[i];
      A[q] = RAWH[i];
      F[q] = (f & 16 ? 1 : 0) | (f & 3 ? 2 : 0);
    }
  const D = smMode(smMode(smThin(smMode(A, F, ww, wh, 1), F, ww, wh, 2), F, ww, wh, 3), F, ww, wh, 4);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const q = (y - wy0) * ww + (x - wx0),
        i = y * TW + x;
      let fl = RAWF[i] & 3;
      if (F[q] & 1) {
        let sh = false;
        for (const [dx, dy] of D4)
          if (!(F[q + dy * ww + dx] & 1)) {
            sh = true;
            break;
          }
        SMH[i] = sh ? LAND - 1 : BED;
        SMF[i] = fl | 16 | (sh ? 4 : 0);
        continue;
      }
      /* routes run at ground level; a castle pad keeps the height of its site (it used to be dug down to LAND, leaving a castle
     built on a hill at the bottom of a pit) */
      let h = F[q] & 2 ? (RAWF[i] & 1 ? RAWH[i] : LAND) : Math.min(D[q], RAWL[i]),
        d = 3;
      for (let j = -2; j <= 2; j++)
        for (let p = -2; p <= 2; p++)
          if (F[q + j * ww + p] & 1) {
            const c = Math.max(Math.abs(j), Math.abs(p));
            if (c < d) d = c;
          }
      if (d === 1) {
        if (h <= LAND + 2) h = LAND;
        fl |= 4;
      } else if (d === 2) {
        if (h < LAND) h = LAND;
        fl |= 8;
      }
      SMH[i] = h;
      SMF[i] = fl;
    }
}

let FLB = null,
  FQ = null;

function tfFlat(x0, y0, x1, y1) {
  const wx0 = Math.max(0, x0 - FT),
    wy0 = Math.max(0, y0 - FT),
    wx1 = Math.min(TW, x1 + FT),
    wy1 = Math.min(TH, y1 + FT),
    ww = wx1 - wx0,
    wh = wy1 - wy0,
    n = ww * wh;
  if (!FLB || FLB.length < n) {
    FLB = new Int32Array(n);
    FQ = new Int32Array(n);
  }
  const lab = FLB,
    Q = FQ,
    SZ2 = [0],
    TC = [0];
  lab.fill(0, 0, n);
  const ok = (i) => !(SMF[i] & 16) && SMH[i] < ROCKH;
  let nl = 0;
  for (let y = 0; y < wh; y++)
    for (let x = 0; x < ww; x++) {
      const li = y * ww + x;
      if (lab[li]) continue;
      const i = (y + wy0) * TW + x + wx0;
      if (!ok(i)) continue;
      const id = ++nl,
        h = SMH[i];
      let hd = 0,
        tl = 0,
        tc = 0;
      lab[li] = id;
      Q[tl++] = li;
      while (hd < tl) {
        const a = Q[hd++],
          ax = a % ww,
          ay = (a / ww) | 0;
        if (
          (ax === 0 && wx0 > 0) ||
          (ay === 0 && wy0 > 0) ||
          (ax === ww - 1 && wx1 < TW) ||
          (ay === wh - 1 && wy1 < TH)
        )
          tc = 1;
        if (ax > 0) {
          const b = a - 1;
          if (!lab[b]) {
            const gi = (ay + wy0) * TW + ax - 1 + wx0;
            if (ok(gi) && SMH[gi] === h) {
              lab[b] = id;
              Q[tl++] = b;
            }
          }
        }
        if (ax < ww - 1) {
          const b = a + 1;
          if (!lab[b]) {
            const gi = (ay + wy0) * TW + ax + 1 + wx0;
            if (ok(gi) && SMH[gi] === h) {
              lab[b] = id;
              Q[tl++] = b;
            }
          }
        }
        if (ay > 0) {
          const b = a - ww;
          if (!lab[b]) {
            const gi = (ay - 1 + wy0) * TW + ax + wx0;
            if (ok(gi) && SMH[gi] === h) {
              lab[b] = id;
              Q[tl++] = b;
            }
          }
        }
        if (ay < wh - 1) {
          const b = a + ww;
          if (!lab[b]) {
            const gi = (ay + 1 + wy0) * TW + ax + wx0;
            if (ok(gi) && SMH[gi] === h) {
              lab[b] = id;
              Q[tl++] = b;
            }
          }
        }
      }
      SZ2[id] = tl;
      TC[id] = tc;
    }
  const big = (id) => TC[id] || SZ2[id] >= FT,
    tgt = new Map();
  const target = (id0) => {
    let r = tgt.get(id0);
    if (r !== undefined) return r;
    const V = new Map();
    let mn = 999,
      hd = 0,
      tl = 0;
    for (let y = y0; y < y1 && !tl; y++)
      for (let x = x0; x < x1; x++) {
        const li = (y - wy0) * ww + x - wx0;
        if (lab[li] === id0) {
          Q[tl++] = li;
          break;
        }
      }
    const seen = new Set([Q[0]]);
    while (hd < tl) {
      const a = Q[hd++],
        ax = a % ww,
        ay = (a / ww) | 0;
      for (const [dx, dy] of D4) {
        const bx = ax + dx,
          by = ay + dy;
        if (bx < 0 || by < 0 || bx >= ww || by >= wh) continue;
        const b = by * ww + bx;
        if (seen.has(b)) continue;
        if (lab[b] === id0) {
          seen.add(b);
          Q[tl++] = b;
          continue;
        }
        const gi = (by + wy0) * TW + bx + wx0;
        if (SMF[gi] & 16) continue;
        const hh = SMH[gi];
        if (hh < mn) mn = hh;
        if (lab[b] && big(lab[b])) V.set(hh, (V.get(hh) || 0) + 1);
      }
    }
    let bv = -1,
      bc = 0;
    for (const [hh, c] of V)
      if (c > bc || (c === bc && hh < bv)) {
        bc = c;
        bv = hh;
      }
    r = bv >= 0 ? bv : mn < 999 ? mn : -1;
    tgt.set(id0, r);
    return r;
  };
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * TW + x,
        f = SMF[i];
      let h = SMH[i];
      if (!(f & 19) && h < ROCKH) {
        const id0 = lab[(y - wy0) * ww + x - wx0];
        if (id0 && !big(id0)) {
          const t = target(id0);
          if (t >= 0) h = Math.min(t, RAWL[i]);
        }
      }
      HT[i] = h;
      ter[i] = f & 16 ? 1 : h >= ROCKH ? 5 : 0;
      FLG[i] = f & 15;
      pth[i] = 0;
      amt[i] = 0;
    }
}

function sealAround(cx, cy) {
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const x = cx + i,
        y = cy + j;
      if (x < 0 || y < 0 || x >= NCX || y >= NCY) continue;
      const k = y * NCX + x;
      if (SEALD[k] || !genF[k]) continue;
      let all = true;
      for (let b = -1; b <= 1 && all; b++)
        for (let a = -1; a <= 1; a++) {
          const xx = x + a,
            yy = y + b;
          if (xx >= 0 && yy >= 0 && xx < NCX && yy < NCY && !genF[yy * NCX + xx]) {
            all = false;
            break;
          }
        }
      if (all) {
        SEALD[k] = 1;
        seal(x, y);
        seal(x, y);
      }
    }
}

function seal(cx, cy) {
  const X0 = Math.max(0, (cx - 1) * CH),
    Y0 = Math.max(0, (cy - 1) * CH),
    X1 = Math.min(TW, (cx + 2) * CH),
    Y1 = Math.min(TH, (cy + 2) * CH),
    w = X1 - X0,
    h = Y1 - Y0,
    c0x = cx * CH,
    c0y = cy * CH,
    c1x = Math.min(TW, c0x + CH),
    c1y = Math.min(TH, c0y + CH),
    lab = new Int32Array(w * h),
    walk = (i) => ter[i] !== 1 && ter[i] !== 5,
    C = [null];
  for (let y = Y0; y < Y1; y++)
    for (let x = X0; x < X1; x++) {
      const li = (y - Y0) * w + x - X0,
        i = y * TW + x;
      if (lab[li] || !walk(i)) continue;
      const id = C.length,
        st = [i],
        T = [];
      let open = false;
      lab[li] = id;
      while (st.length) {
        const a = st.pop(),
          ax = a % TW,
          ay = (a / TW) | 0;
        T.push(a);
        if ((ax === X0 && X0 > 0) || (ay === Y0 && Y0 > 0) || (ax === X1 - 1 && X1 < TW) || (ay === Y1 - 1 && Y1 < TH))
          open = true;
        for (const [dx, dy] of D4) {
          const bx = ax + dx,
            by = ay + dy;
          if (bx < X0 || by < Y0 || bx >= X1 || by >= Y1) continue;
          const b = by * TW + bx,
            lb = (by - Y0) * w + bx - X0;
          if (lab[lb] || !walk(b) || !canStep(a, b)) continue;
          lab[lb] = id;
          st.push(b);
        }
      }
      C.push({ T, open });
    }
  const L = (i) => lab[(((i / TW) | 0) - Y0) * w + (i % TW) - X0];
  let changed = false;
  for (let c = 1; c < C.length; c++) {
    const K = C[c];
    if (
      K.open ||
      K.done ||
      !K.T.some((i) => {
        const x = i % TW,
          y = (i / TW) | 0;
        return x >= c0x && x < c1x && y >= c0y && y < c1y;
      })
    )
      continue;
    const hO = K.T.some((i) => occ.has(i));
    const cand = [];
    for (const a of K.T) {
      const ax = a % TW,
        ay = (a / TW) | 0;
      for (const [dx, dy] of D4) {
        const bx = ax + dx,
          by = ay + dy;
        if (bx < X0 || by < Y0 || bx >= X1 || by >= Y1) continue;
        const b = by * TW + bx,
          lb = L(b);
        if (!lb || lb === c || !walk(b)) continue;
        const df = HT[b] - HT[a];
        if (!df || Math.abs(df) > 12) continue;
        const pr = (C[lb].open ? 0 : 1) + hs(a % 197, (a / 197) | 0, terrainState.SEED + 8);
        if (df > 0) cand.push([a, b - a, pr]);
        else cand.push([b, a - b, pr]);
      }
    }
    cand.sort((p, q) => p[2] - q[2]);
    let ok = false;
    for (let k = 0; (K.T.length >= 300 || hO) && k < Math.min(cand.length, 300) && !ok; k++) {
      const [P, dd] = cand[k];
      if (tryRamp(P, dd, X0, Y0, X1, Y1)) {
        ok = true;
        for (const ii of RAMPT) {
          const x = ii % TW,
            y = (ii / TW) | 0;
          markT(x, y);
          markP(x, y);
          mmTile(ii);
        }
      }
    }
    if (ok) {
      changed = true;
      K.done = true;
      continue;
    }
    if (hO) continue;
    const cnt = new Map();
    let rk = 999;
    for (const a of K.T) {
      const ax = a % TW,
        ay = (a / TW) | 0;
      for (const [dx, dy] of D4) {
        const bx = ax + dx,
          by = ay + dy;
        if (bx < 0 || by < 0 || bx >= TW || by >= TH) continue;
        const b = by * TW + bx;
        if (L(b) === c && bx >= X0 && by >= Y0 && bx < X1 && by < Y1) continue;
        if (ter[b] === 5) {
          rk = Math.min(rk, HT[b]);
          continue;
        }
        if (ter[b] === 1 || stairs.has(b)) continue;
        const lb = bx >= X0 && by >= Y0 && bx < X1 && by < Y1 ? L(b) : 0,
          wgt = lb && C[lb].open ? 3 : 1;
        cnt.set(HT[b], (cnt.get(HT[b]) || 0) + wgt);
      }
    }
    let bh = -1,
      bc = 0;
    for (const [hh, n] of cnt)
      if (n > bc || (n === bc && hh < bh)) {
        bc = n;
        bh = hh;
      }
    for (const a of K.T) stairs.delete(a);
    if (bh >= 0) {
      for (const a of K.T) {
        HT[a] = bh;
        if (bh >= ROCKH) {
          ter[a] = 5;
          amt[a] = 0;
        }
      }
    } else if (rk < 999) {
      for (const a of K.T) {
        HT[a] = Math.max(HT[a], rk);
        ter[a] = 5;
        amt[a] = 0;
      }
    } else {
      let ch = false;
      for (const a of K.T)
        if (HT[a] > LAND) {
          HT[a] = LAND;
          ch = true;
        }
      if (!ch) continue;
    }
    changed = true;
    K.done = true;
    for (const a of K.T) {
      const x = a % TW,
        y = (a / TW) | 0;
      markT(x, y);
      markP(x, y);
      mmTile(a);
    }
  }
  if (changed) {
    sessionState.ver++;
    GF.clear();
    sessionState.fdDirty = true;
  }
}

/* a tile at the foot of a cliff (a neighbour 3+ levels higher, from the smoothed heights: the same whatever the chunk order) */
function cliffFoot(x, y, h) {
  for (const [dx, dy] of D8) {
    const a = x + dx,
      b = y + dy;
    if (a < 0 || b < 0 || a >= TW || b >= TH) continue;
    const j = b * TW + a;
    if (!(SMF[j] & 16) && SMH[j] >= h + 3) return true;
  }
  return false;
}

/* the only deposits laid out for you: 3 gold, 3 stone and 3 trees, about 12 tiles from each castle, each set in a little group;
   picked from the raw terrain (water, castle square and roads avoided), so it does not depend on which chunk is made first */
let STK0 = "",
  STL0 = null;

export function starterTiles() {
  const key =
    terrainState.SEED +
    "," +
    terrainState.CX +
    "," +
    terrainState.CY +
    "," +
    (sessionState.SITE2 ? sessionState.SITE2.tx + "," + sessionState.SITE2.ty : "");
  if (key === STK0 && STL0) return STL0;
  STK0 = key;
  STL0 = new Map();
  for (const [X, Y] of CTRS()) {
    const ga = hs(X & 1023, Y & 1023, terrainState.SEED + 7) * 6.283,
      used = new Set();
    const okT = (x, y) => {
      if (x < 3 || y < 3 || x >= TW - 3 || y >= TH - 3) return false;
      const c = Math.max(Math.abs(x - X), Math.abs(y - Y));
      if (c < 10 || c > 16) return false;
      const i = y * TW + x;
      if (used.has(i) || STL0.has(i)) return false;
      const r = rawAt(x, y);
      return !(RAWF[r] & 19);
    };
    [
      [4, 40],
      [3, 8],
      [2, 3],
    ].forEach(([code, am], k) => {
      for (let s = 0; s < 44; s++) {
        const a = ga + k * 2.094 + (s % 2 ? 1 : -1) * Math.ceil(s / 2) * 0.11,
          r = 12.5 + (s >= 24 ? 1.5 : 0),
          ax = Math.round(X + Math.cos(a) * r),
          ay = Math.round(Y + Math.sin(a) * r);
        if (!okT(ax, ay)) continue;
        const grp = [[ax, ay]];
        for (const [dx, dy] of code === 2
          ? [
              [1, 1],
              [-1, 1],
              [1, -1],
              [-1, -1],
              [2, 0],
              [0, 2],
            ]
          : [
              [1, 0],
              [0, 1],
              [-1, 0],
              [0, -1],
              [1, 1],
              [-1, -1],
            ]) {
          if (grp.length >= 3) break;
          if (okT(ax + dx, ay + dy)) grp.push([ax + dx, ay + dy]);
        }
        if (grp.length < 3) continue;
        for (const [x, y] of grp) {
          const i = y * TW + x;
          used.add(i);
          STL0.set(i, [code, am]);
        }
        break;
      }
    });
  }
  return STL0;
}

export function genChunk(cx, cy) {
  if (cx < 0 || cy < 0 || cx >= NCX || cy >= NCY) return;
  const k = cy * NCX + cx;
  if (genF[k]) return;
  genF[k] = 1;
  terrainState.genN++;
  const x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH),
    sd = terrainState.SEED,
    P = terrainState.GPR;
  for (let j = -1; j <= 1; j++) for (let q = -1; q <= 1; q++) smChunk(cx + q, cy + j);
  tfFlat(x0, y0, x1, y1);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * TW + x;
      if (ter[i]) continue;
      if (FLG[i]) {
        if ((FLG[i] & 15) === 8 && HT[i] <= LAND + 1 && hs(x, y, sd + 21) < 0.012 * P.gd) {
          ter[i] = 4;
          amt[i] = 40;
        }
        continue;
      }
      const al = HT[i] - LAND,
        f = fb(x * 0.06, y * 0.06, sd + 50),
        d = (f - P.tr) / 0.2;
      /* woods, dense at heart and thinning at the edges; lone trees in the meadows */
      if (d > 0 && al < 14 && hs(x, y, sd + 11) < Math.min(0.9, d * 0.95 + 0.1)) {
        ter[i] = 2;
        amt[i] = 3;
        continue;
      }
      if (al < 12 && hs(x, y, sd + 12) < P.tc) {
        ter[i] = 2;
        amt[i] = 3;
        continue;
      }
      /* stone: boulder fields in clusters, more of them in the hills, and rockfall at the foot of the cliffs */
      const so = fb(x * 0.11, y * 0.11, sd + 70),
        sth = 0.74 - Math.min(0.08, Math.max(0, al) * 0.01);
      if (so > sth && hs(x, y, sd + 13) < (so - sth) * 5 + 0.1) {
        if (so > sth + 0.06 && hs(x, y, sd + 20) < 0.2 * P.gd) {
          ter[i] = 4;
          amt[i] = 40;
        } else {
          ter[i] = 3;
          amt[i] = 8;
        }
        continue;
      }
      const cf = cliffFoot(x, y, HT[i]);
      if (cf && hs(x, y, sd + 17) < 0.12) {
        ter[i] = 3;
        amt[i] = 8;
        continue;
      }
      /* gold: veins in the hills and in the heart of the boulder fields, a few specks where the cliffs rise */
      if (al >= 2 && fb(x * 0.05, y * 0.05, sd + 60) > 0.765 && hs(x, y, sd + 14) < 0.45 * P.gd) {
        ter[i] = 4;
        amt[i] = 40;
        continue;
      }
      if (cf && al >= 1 && hs(x, y, sd + 18) < 0.03 * P.gd) {
        ter[i] = 4;
        amt[i] = 40;
        continue;
      }
      if (al >= 4 && hs(x, y, sd + 16) < 0.004 * P.gd) {
        ter[i] = 4;
        amt[i] = 40;
        continue;
      }
      if (al >= 3 && hs(x, y, sd + 19) < 0.006 + 0.002 * al) {
        ter[i] = 3;
        amt[i] = 8;
      }
    }
  for (const [i, v] of starterTiles()) {
    const x = i % TW,
      y = (i / TW) | 0;
    if (x < x0 || y < y0 || x >= x1 || y >= y1 || ter[i] === 1 || ter[i] === 5) continue;
    ter[i] = v[0];
    amt[i] = v[1];
  }
  carveRamps(cx, cy);
  fixAccess(cx, cy);
  mkRuin(cx, cy, k);
  mmChunk(cx, cy);
  sealAround(cx, cy);
}

export function ensureAround(tx, ty, r) {
  const cx = (tx / CH) | 0,
    cy = (ty / CH) | 0;
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) genChunk(cx + i, cy + j);
}

export function ensureRect(x0, y0, w, h) {
  for (let cy = Math.max(0, (y0 / CH) | 0); cy <= Math.min(NCY - 1, ((y0 + h) / CH) | 0); cy++)
    for (let cx = Math.max(0, (x0 / CH) | 0); cx <= Math.min(NCX - 1, ((x0 + w) / CH) | 0); cx++) genChunk(cx, cy);
}

export let rollWorld = function rollWorld() {
  terrainState.SEED = Math.random() * 500;
  const R = Math.random;
  terrainState.GPR = {
    fq: 0.009 + R() * 0.007,
    wl: 0.28 + R() * 0.08,
    mt: 0.5 + R() * 0.1,
    rv: 0.008 + R() * 0.008,
    rg: 0.93 + R() * 0.03,
    am: 0.7 + R() * 0.5,
    tr: 0.5 + R() * 0.2,
    gd: 0.8 + R() * 0.5,
    tc: 0.003 + R() * 0.01,
  };
};

export function initWorld() {
  mkGord();
  RAWD.fill(0);
  smDone.fill(0);
  SEALD.fill(0);
  HT.fill(0);
  ter.fill(0);
  amt.fill(0);
  pth.fill(0);
  FLG.fill(0);
  genF.fill(0);
  terrainState.GI = 0;
  terrainState.genN = 0;
  occ.clear();
  stairs.clear();
  CAMPS.clear();
  RUINS.clear();
  TFL.fill(0);
  mg.fillStyle = "#10151f";
  mg.fillRect(0, 0, TW, TH);
  mkRoutes();
  ensureAround(terrainState.CX, terrainState.CY, 2);
}

export function setRollWorldHandler(handler) {
  rollWorld = handler;
}

export function initializeTerrain() {
  const ncx = Math.ceil(TW / CH);
  const ncy = Math.ceil(TH / CH);
  const height = new Uint8Array(N);
  const terrain = new Uint8Array(N);
  const amount = new Uint8Array(N);
  const paths = new Uint8Array(N);
  const flags = new Uint8Array(N);
  const generated = new Uint8Array(ncx * ncy);
  const terraform = new Uint8Array(N);
  const canvas = cvs(TW, TH);
  const context = canvas.getContext("2d");
  setTerrainGridState(ncx, ncy, height, terrain, amount, paths, flags, generated, terraform, canvas, context);
  terrainState.CX = TW >> 1;
  terrainState.CY = TH >> 1;
  mkGord();
  RAWH = new Uint8Array(N);
  RAWF = new Uint8Array(N);
  RAWL = new Uint8Array(N);
  const raw = new Uint8Array(N);
  SMH = new Uint8Array(N);
  SMF = new Uint8Array(N);
  const done = new Uint8Array(ncx * ncy);
  const sealed = new Uint8Array(ncx * ncy);
  setTerrainCacheState(raw, done, sealed);
  setTerrainRectPreparer(ensureRect);
}
