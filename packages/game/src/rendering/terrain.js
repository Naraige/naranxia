import { SCRT } from "../ai/zombies.js";
import { fb, hs } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { MP } from "../multiplayer/session.js";
import { BK, blocksState } from "./blocks.js";
import { geometryState, newG, quad, shade, toGeo } from "./geometry.js";
import { matT, matWater } from "./materials.js";
import { CAM, scene, SHADOWS } from "./scene.js";
import { buildProps } from "./terrain-props.js";
import { THREE } from "./three.js";
import { gOK } from "../world/routes.js";
import { genChunk } from "../world/terrain.js";
import { markP, markT, setTerrainInvalidationHandlers } from "../world/terrain-invalidation.js";
import {
  BED,
  CH,
  FLG,
  genF,
  HT,
  LAND,
  NCX,
  NCY,
  occ,
  pth,
  SNOW,
  stairs,
  ter,
  terrainState,
  TFL,
  WLV,
} from "../world/terrain-state.js";

export { gh } from "../world/terrain-queries.js";

/* ---- terrain chunk meshes ---- */
export const unitG = new Map(),
  CHK = new Map(),
  dirtyT = new Set(),
  dirtyP = new Set(),
  RM = 3;

export const keyOf = (cx, cy) => cy * NCX + cx;

function markTImpl(tx, ty) {
  const cx = (tx / CH) | 0,
    cy = (ty / CH) | 0;
  dirtyT.add(keyOf(cx, cy));
  const ex = tx % CH,
    ey = ty % CH;
  if (ex === 0 && cx > 0) dirtyT.add(keyOf(cx - 1, cy));
  if (ex === CH - 1 && cx < NCX - 1) dirtyT.add(keyOf(cx + 1, cy));
  if (ey === 0 && cy > 0) dirtyT.add(keyOf(cx, cy - 1));
  if (ey === CH - 1 && cy < NCY - 1) dirtyT.add(keyOf(cx, cy + 1));
}

/* block world: canopies reach half a tile into the neighbours, so a prop change next to a chunk border also rebuilds the neighbour */
function markPImpl(tx, ty) {
  const cx = (tx / CH) | 0,
    cy = (ty / CH) | 0;
  dirtyP.add(keyOf(cx, cy));
  if (!blocksState.D) return;
  const ex = tx % CH,
    ey = ty % CH,
    ax = ex === 0 && cx > 0 ? -1 : ex === CH - 1 && cx < NCX - 1 ? 1 : 0,
    ay = ey === 0 && cy > 0 ? -1 : ey === CH - 1 && cy < NCY - 1 ? 1 : 0;
  if (ax) dirtyP.add(keyOf(cx + ax, cy));
  if (ay) dirtyP.add(keyOf(cx, cy + ay));
  if (ax && ay) dirtyP.add(keyOf(cx + ax, cy + ay));
}

export { markP, markT };

export const DIRT = [0.53, 0.38, 0.26];
export const GRASS = [0.37, 0.6, 0.25];
const AOK = [1, 0.8, 0.66, 0.55];

function topCol(i, x, y, np) {
  const h = HT[i],
    v = ter[i],
    al = h - LAND,
    j = 0.97 + 0.06 * hs(x, y, 9);
  let b;
  if (!np && pth[i] === 2) return shade([0.56, 0.56, 0.57], 0.9 + 0.12 * hs(x, y, 19) + ((x + y) & 1 ? 0.07 : 0));
  if (!np && pth[i]) return shade([0.6, 0.49, 0.3], 0.92 + 0.12 * hs(x, y, 19) + ((x + y) & 1 ? 0.04 : 0));
  if (v === 0 && SCRT.has(i)) return shade([0.34, 0.27, 0.2], 0.82 + 0.22 * hs(x, y, 31));
  if (v === 1) return shade(FLG[i] & 4 ? [0.42, 0.44, 0.36] : [0.26, 0.34, 0.36], j);
  if (v === 0 && TFL[i] && h < LAND) {
    if (h <= BED) return shade([0.2, 0.2, 0.23], 0.85 + 0.25 * hs(x, y, 37));
    if (h <= LAND - 3) return shade([0.5, 0.5, 0.52], 0.88 + 0.2 * hs(x, y, 37) + ((x + y) & 1 ? 0.04 : 0));
    return shade(DIRT, 0.9 + 0.16 * hs(x, y, 37));
  }
  if (v === 5 || al >= 15) {
    b = h >= SNOW ? [0.95, 0.97, 0.99] : al >= 19 ? [0.6, 0.6, 0.62] : [0.49, 0.49, 0.5];
  } else {
    const m = fb(x * 0.05, y * 0.05, terrainState.SEED + 500),
      dry = Math.max(0, Math.min(1, (m - 0.5) * 3));
    b = [
      GRASS[0] + (0.62 - GRASS[0]) * dry * 0.5,
      GRASS[1] + (0.6 - GRASS[1]) * dry * 0.3,
      GRASS[2] + (0.3 - GRASS[2]) * dry * 0.5,
    ];
    if (al >= 8) {
      const t = Math.min(1, (al - 8) / 12);
      b = [b[0] + (0.5 - b[0]) * t, b[1] + (0.54 - b[1]) * t, b[2] + (0.42 - b[2]) * t];
    }
    if (al <= 1 && (FLG[i] & 4 || ter[i + 1] === 1 || ter[i - 1] === 1 || ter[i + TW] === 1 || ter[i - TW] === 1))
      b = [0.88, 0.82, 0.6];
    else if (FLG[i] & 8 && al <= 1) b = [(b[0] + 0.88) / 2, (b[1] + 0.82) / 2, (b[2] + 0.6) / 2];
    if (v === 2) b = shade(b, 0.78);
    else if (v === 3) b = [0.5, 0.5, 0.46];
    else if (v === 4) b = [0.42, 0.4, 0.36];
  }
  return shade(b, j);
}

function sideCol(i, k, x, y) {
  let b;
  if (k + 1 >= SNOW) b = [0.9, 0.92, 0.95];
  else if (ter[i] === 5 || k >= LAND + 9) b = shade([0.49, 0.49, 0.5], 1 + (k - LAND) * 0.004);
  else if (FLG[i] & 4 && k >= LAND - 2) b = [0.8, 0.74, 0.52];
  else b = DIRT;
  if (k <= BED) b = [0.2, 0.2, 0.23];
  return shade(b, ((k >> 1) & 1 ? 0.98 : 1) * (0.94 + 0.12 * hs(x * 3 + k, y * 5, k)));
}

const OB = (a, b) => a < 0 || b < 0 || a >= TW || b >= TH;

/* block world: the block kind of a terrain colour (grass, dirt, stone, sand, snow, gravel) */
export function kindOf(c) {
  const r = c[0],
    g = c[1],
    b = c[2],
    mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    l = r * 0.3 + g * 0.59 + b * 0.11;
  if (g - Math.max(r, b) > 0.025) return BK.grass;
  if (l > 0.8 && mx - mn < 0.12) return BK.snow;
  if (mx - mn < 0.05) return l < 0.3 ? BK.gravel : BK.stone;
  if (r - b > 0.2 && l > 0.66) return BK.sand;
  if (r - b > 0.1) return BK.dirt;
  return BK.gravel;
}
let SKB;

/* ---- v79 paths: a real trail on the grass - the path is drawn as a band joining its neighbours (no more square tiles),
   with a grassy verge; wood = packed earth with wheel ruts and log edging, stone = cobbles with curb stones.
   Along the edges it picks up what grows next to it: leaves and mushrooms by the woods, reeds by water, pebbles by rocks,
   flowers by houses, tufts and wild flowers in the meadow ---- */
function pbox(G, x0, y0, z0, x1, y1, z1, c) {
  const t = shade(c, 1.08),
    s1 = shade(c, 0.86),
    s2 = shade(c, 0.74);
  quad(G, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], t, t, t, t);
  quad(G, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], s1, s1, s1, s1);
  quad(G, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], s2, s2, s2, s2);
  quad(G, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], s1, s1, s1, s1);
  quad(G, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], s2, s2, s2, s2);
}

function pathTop(G, i, x, y, h, gc) {
  const st = pth[i] === 2,
    m = 0.17,
    H = h + 0.012;
  gc = gc || GRASS;
  quad(G, [x, h, y], [x, h, y + 1], [x + 1, h, y + 1], [x + 1, h, y], [0, 1, 0], gc, gc, gc, gc);
  const cn = (dx, dy) => {
      const a = x + dx,
        b = y + dy;
      if (a < 0 || b < 0 || a >= TW || b >= TH) return false;
      const j = b * TW + a;
      if (pth[j]) return true;
      const o = occ.get(j);
      return !!o && o.t === 0 && (o.type === "gate" || o.type === "castle");
    },
    N = cn(0, -1),
    S = cn(0, 1),
    E = cn(1, 0),
    Wd = cn(-1, 0),
    x0 = Wd ? 0 : m,
    x1 = E ? 1 : 1 - m,
    z0 = N ? 0 : m,
    z1 = S ? 1 : 1 - m;
  /* the band: a centre square plus an arm to each joined side */
  const rects = [[x + m, y + m, x + 1 - m, y + 1 - m]];
  if (N) rects.push([x + m, y, x + 1 - m, y + m]);
  if (S) rects.push([x + m, y + 1 - m, x + 1 - m, y + 1]);
  if (Wd) rects.push([x, y + m, x + m, y + 1 - m]);
  if (E) rects.push([x + 1 - m, y + m, x + 1, y + 1 - m]);
  if (!st) {
    const base = [0.56, 0.42, 0.27];
    for (const [a0, b0, a1, b1] of rects) {
      const n = 2;
      for (let u = 0; u < n; u++)
        for (let v = 0; v < n; v++) {
          const A = a0 + ((a1 - a0) * u) / n,
            B = b0 + ((b1 - b0) * v) / n,
            C2 = a0 + ((a1 - a0) * (u + 1)) / n,
            D2 = b0 + ((b1 - b0) * (v + 1)) / n,
            c = shade(base, 0.88 + 0.2 * hs(x * 7 + A * 13, y * 5 + B * 11, 61));
          quad(G, [A, H, B], [A, H, D2], [C2, H, D2], [C2, H, B], [0, 1, 0], c, c, c, c);
        }
    }
    /* wheel ruts along the main direction */
    const ns = N || S,
      ew = E || Wd,
      ax = ew && !ns ? 1 : 0,
      rc = shade(base, 0.7);
    for (const r of [0.37, 0.63]) {
      if (ax) {
        if (Wd || E)
          quad(
            G,
            [x0, H + 0.002, y + r - 0.03],
            [x0, H + 0.002, y + r + 0.03],
            [x1, H + 0.002, y + r + 0.03],
            [x1, H + 0.002, y + r - 0.03],
            [0, 1, 0],
            rc,
            rc,
            rc,
            rc,
          );
      } else
        quad(
          G,
          [x + r - 0.03, H + 0.002, z0],
          [x + r - 0.03, H + 0.002, z1],
          [x + r + 0.03, H + 0.002, z1],
          [x + r + 0.03, H + 0.002, z0],
          [0, 1, 0],
          rc,
          rc,
          rc,
          rc,
        );
    }
    for (let k = 0; k < 3; k++) {
      const px = x + m + 0.06 + hs(x + k, y, 71) * (1 - 2 * m - 0.12),
        pz = y + m + 0.06 + hs(x, y + k, 73) * (1 - 2 * m - 0.12),
        s = 0.03 + hs(x + k, y + k, 75) * 0.03,
        c = shade([0.6, 0.58, 0.54], 0.9 + 0.2 * hs(k, x, 77));
      pbox(G, px - s, H, pz - s, px + s, H + s * 0.9, pz + s, c);
    }
  } else {
    for (const [a0, b0, a1, b1] of rects) {
      const nx = Math.max(1, Math.round((a1 - a0) / 0.17)),
        nz = Math.max(1, Math.round((b1 - b0) / 0.17));
      for (let u = 0; u < nx; u++)
        for (let v = 0; v < nz; v++) {
          const o = (((v % 2) * 0.5) / nx) * (a1 - a0);
          let A = a0 + ((a1 - a0) * u) / nx + o,
            C2 = a0 + ((a1 - a0) * (u + 1)) / nx + o;
          A = Math.max(a0, A) + 0.012;
          C2 = Math.min(a1, C2) - 0.012;
          if (C2 <= A) continue;
          const B = b0 + ((b1 - b0) * v) / nz + 0.012,
            D2 = b0 + ((b1 - b0) * (v + 1)) / nz - 0.012,
            c = shade([0.64, 0.63, 0.62], 0.8 + 0.3 * hs(x * 9 + u, y * 7 + v, 63));
          pbox(G, A, h, B, C2, H + 0.02, D2, c);
        }
      const gm = shade([0.36, 0.35, 0.33], 1);
      quad(
        G,
        [a0, H - 0.004, b0],
        [a0, H - 0.004, b1],
        [a1, H - 0.004, b1],
        [a1, H - 0.004, b0],
        [0, 1, 0],
        gm,
        gm,
        gm,
        gm,
      );
    }
  }
  /* edging along the open sides of the band */
  const edge = (ax0, az0, ax1, az1) => {
    if (st) pbox(G, ax0, h, az0, ax1, H + 0.05, az1, shade([0.74, 0.72, 0.68], 0.9 + 0.15 * hs(ax0 * 9, az0 * 7, 67)));
    else pbox(G, ax0, h, az0, ax1, H + 0.045, az1, shade([0.42, 0.29, 0.17], 0.9 + 0.15 * hs(ax0 * 9, az0 * 7, 69)));
  };
  const ew2 = 0.05;
  if (!N) edge(x + m - ew2, y + m - ew2, x + 1 - m + ew2, y + m);
  if (!S) edge(x + m - ew2, y + 1 - m, x + 1 - m + ew2, y + 1 - m + ew2);
  if (!Wd) edge(x + m - ew2, y + m, x + m, y + 1 - m);
  if (!E) edge(x + 1 - m, y + m, x + 1 - m + ew2, y + 1 - m);
  if (N) {
    if (!Wd) edge(x + m - ew2, y, x + m, y + m);
    if (!E) edge(x + 1 - m, y, x + 1 - m + ew2, y + m);
  }
  if (S) {
    if (!Wd) edge(x + m - ew2, y + 1 - m, x + m, y + 1);
    if (!E) edge(x + 1 - m, y + 1 - m, x + 1 - m + ew2, y + 1);
  }
  if (Wd) {
    if (!N) edge(x, y + m - ew2, x + m, y + m);
    if (!S) edge(x, y + 1 - m, x + m, y + 1 - m + ew2);
  }
  if (E) {
    if (!N) edge(x + 1 - m, y + m - ew2, x + 1, y + m);
    if (!S) edge(x + 1 - m, y + 1 - m, x + 1, y + 1 - m + ew2);
  }
  /* what grows on the verge depends on the neighbourhood */
  let tr = 0,
    wa = 0,
    rk = 0,
    ho = 0;
  for (let b = -2; b <= 2; b++)
    for (let a = -2; a <= 2; a++) {
      const xx = x + a,
        yy = y + b;
      if (xx < 0 || yy < 0 || xx >= TW || yy >= TH) continue;
      const j = yy * TW + xx,
        t = ter[j];
      if (t === 2) tr++;
      else if (t === 1) wa++;
      else if (t === 3 || t === 5) rk++;
      const o = occ.get(j);
      if (o && o.t === 0 && o.type !== "wall" && o.type !== "gate") ho++;
    }
  const spots = [];
  for (let k = 0; k < 6; k++) {
    const side = (hs(x, y, 80 + k) * 4) | 0,
      t = 0.1 + hs(x + k, y, 90) * 0.8,
      d = 0.03 + hs(x, y + k, 95) * (m - 0.06);
    let px, pz;
    if (side === 0) {
      if (N && t > m && t < 1 - m) continue;
      px = x + t;
      pz = y + d;
    } else if (side === 1) {
      if (S && t > m && t < 1 - m) continue;
      px = x + t;
      pz = y + 1 - d;
    } else if (side === 2) {
      if (Wd && t > m && t < 1 - m) continue;
      px = x + d;
      pz = y + t;
    } else {
      if (E && t > m && t < 1 - m) continue;
      px = x + 1 - d;
      pz = y + t;
    }
    spots.push([px, pz, k]);
  }
  for (const [px, pz] of spots) {
    const r = hs(px * 13, pz * 17, 99);
    if (wa > 2 && r < 0.6) {
      const hh = 0.14 + r * 0.2;
      pbox(G, px - 0.012, h, pz - 0.012, px + 0.012, h + hh, pz + 0.012, [0.35, 0.55, 0.22]);
      pbox(G, px + 0.02, h, pz - 0.01, px + 0.04, h + hh * 0.8, pz + 0.01, [0.42, 0.6, 0.25]);
      if (r < 0.2) pbox(G, px - 0.018, h + hh, pz - 0.018, px + 0.018, h + hh + 0.05, pz + 0.018, [0.45, 0.3, 0.15]);
    } else if (tr > 3 && r < 0.55) {
      if (r < 0.18) {
        pbox(G, px - 0.012, h, pz - 0.012, px + 0.012, h + 0.05, pz + 0.012, [0.9, 0.88, 0.8]);
        pbox(
          G,
          px - 0.035,
          h + 0.05,
          pz - 0.035,
          px + 0.035,
          h + 0.075,
          pz + 0.035,
          r < 0.09 ? [0.8, 0.18, 0.15] : [0.62, 0.45, 0.3],
        );
      } else {
        const c = r < 0.36 ? [0.75, 0.45, 0.15] : [0.55, 0.32, 0.12];
        quad(
          G,
          [px - 0.04, h + 0.004, pz - 0.03],
          [px - 0.03, h + 0.004, pz + 0.04],
          [px + 0.04, h + 0.004, pz + 0.03],
          [px + 0.03, h + 0.004, pz - 0.04],
          [0, 1, 0],
          c,
          c,
          c,
          c,
        );
      }
    } else if (rk > 2 && r < 0.6) {
      const s = 0.025 + r * 0.04;
      pbox(G, px - s, h, pz - s, px + s, h + s * 1.2, pz + s * 0.8, shade([0.58, 0.58, 0.6], 0.85 + r * 0.3));
    } else if (ho > 3 && r < 0.5) {
      pbox(G, px - 0.01, h, pz - 0.01, px + 0.01, h + 0.08, pz + 0.01, [0.3, 0.55, 0.22]);
      const fc = [
        [0.9, 0.3, 0.35],
        [0.95, 0.85, 0.3],
        [0.6, 0.4, 0.9],
        [1, 1, 1],
      ][((r * 8) | 0) % 4];
      pbox(G, px - 0.025, h + 0.08, pz - 0.025, px + 0.025, h + 0.11, pz + 0.025, fc);
    } else if (r < 0.45) {
      const c = shade(gc, 0.8 + r * 0.3);
      pbox(G, px - 0.01, h, pz - 0.01, px + 0.01, h + 0.06 + r * 0.08, pz + 0.01, c);
      pbox(G, px + 0.012, h, pz - 0.008, px + 0.03, h + 0.05 + r * 0.06, pz + 0.008, c);
      if (r < 0.08) pbox(G, px - 0.02, h + 0.09, pz - 0.02, px + 0.02, h + 0.115, pz + 0.02, [0.95, 0.9, 0.35]);
    }
  }
}

/* the world ends in a cut: earth and stone walls down the map border, and the rivers that reach it end in a wall of water */
function waterSkirt(G, x, y, h) {
  for (let q = 0; q < 4; q++) {
    const dx = q === 0 ? 1 : q === 1 ? -1 : 0,
      dy = q === 2 ? 1 : q === 3 ? -1 : 0;
    if (!OB(x + dx, y + dy)) continue;
    const k = [0.9, 0.8, 0.95, 0.75][q];
    const face = (b, t, s, s2) => {
      if (q === 0) quad(G, [x + 1, b, y], [x + 1, t, y], [x + 1, t, y + 1], [x + 1, b, y + 1], [1, 0, 0], s, s2, s2, s);
      else if (q === 1) quad(G, [x, b, y + 1], [x, t, y + 1], [x, t, y], [x, b, y], [-1, 0, 0], s, s2, s2, s);
      else if (q === 2)
        quad(G, [x + 1, b, y + 1], [x + 1, t, y + 1], [x, t, y + 1], [x, b, y + 1], [0, 0, 1], s, s2, s2, s);
      else quad(G, [x, b, y], [x, t, y], [x + 1, t, y], [x + 1, b, y], [0, 0, -1], s, s2, s2, s);
    };
    for (let b = SKB; b < h; b++) {
      const s = shade(b < h - 2 ? [0.5, 0.5, 0.5] : DIRT, k * (0.9 + 0.2 * hs(x * 3 + b, y * 5, b)));
      face(b, b + 1, s, s);
    }
    face(h, WLV, shade([0.14, 0.33, 0.6], k), shade([0.32, 0.6, 0.84], k));
  }
}

export function buildChunk(cx, cy) {
  try {
    return buildChunk0(cx, cy);
  } finally {
    geometryState.BMAT = 0;
  }
}

const wetT = (x, y) => {
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) if (gOK(x + i, y + j) && ter[(y + j) * TW + x + i] === 1) return true;
  return false;
};

function buildChunk0(cx, cy) {
  const G = newG(),
    WG = newG(),
    x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH);
  const nh = (x, y, h) => (gOK(x, y) ? HT[y * TW + x] : h);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * TW + x,
        h = HT[i],
        c = topCol(i, x, y),
        BL = blocksState.T,
        WM = BL ? (wetT(x, y) ? 40 : 20) : 0,
        isP = pth[i] && ter[i] === 0 && !occ.has(i);
      geometryState.BMAT = BL ? WM + (isP ? (pth[i] === 2 ? BK.cobble : BK.path) : kindOf(c)) : wetT(x, y) ? 0 : 9;
      const rs = stairs.size ? stairs.get(i) : null;
      if (rs && rs.nat) {
        const hl = rs.lo,
          hh2 = rs.hi,
          sg = rs.sg > 0,
          ax = rs.ax,
          ns = Math.max(2, Math.round((hh2 - hl) * 2)),
          st = (hh2 - hl) / ns,
          rc = shade(DIRT, 0.8 * (0.9 + 0.2 * hs(x, y, 5))),
          gc = shade(c, 0.88);
        for (let k = 0; k < ns; k++) {
          const u0 = k / ns,
            u1 = (k + 1) / ns,
            yt = hl + (k + 1) * st,
            yb = yt - st,
            p0 = sg ? u0 : 1 - u1,
            p1 = sg ? u1 : 1 - u0,
            ck = shade(c, 0.96 + 0.04 * (k & 1));
          if (ax === 0) {
            quad(
              G,
              [x + p0, yt, y],
              [x + p0, yt, y + 1],
              [x + p1, yt, y + 1],
              [x + p1, yt, y],
              [0, 1, 0],
              ck,
              ck,
              ck,
              ck,
            );
            const rx = sg ? x + p0 : x + p1,
              nx = sg ? -1 : 1;
            if (nx < 0)
              quad(
                G,
                [rx, yb, y + 1],
                [rx, yt, y + 1],
                [rx, yt, y],
                [rx, yb, y],
                [-1, 0, 0],
                shade(rc, 0.75),
                gc,
                gc,
                shade(rc, 0.75),
              );
            else
              quad(
                G,
                [rx, yb, y],
                [rx, yt, y],
                [rx, yt, y + 1],
                [rx, yb, y + 1],
                [1, 0, 0],
                shade(rc, 0.75),
                gc,
                gc,
                shade(rc, 0.75),
              );
            for (const sd of [0, 1]) {
              const nb = nh(x, y + (sd ? 1 : -1), h);
              if (nb >= yt) continue;
              const z = y + sd,
                yb2 = Math.max(h, nb);
              if (sd)
                quad(
                  G,
                  [x + p1, yb2, z],
                  [x + p1, yt, z],
                  [x + p0, yt, z],
                  [x + p0, yb2, z],
                  [0, 0, 1],
                  rc,
                  rc,
                  rc,
                  rc,
                );
              else
                quad(
                  G,
                  [x + p0, yb2, z],
                  [x + p0, yt, z],
                  [x + p1, yt, z],
                  [x + p1, yb2, z],
                  [0, 0, -1],
                  rc,
                  rc,
                  rc,
                  rc,
                );
            }
          } else {
            quad(
              G,
              [x, yt, y + p0],
              [x, yt, y + p1],
              [x + 1, yt, y + p1],
              [x + 1, yt, y + p0],
              [0, 1, 0],
              ck,
              ck,
              ck,
              ck,
            );
            const rz = sg ? y + p0 : y + p1,
              nz = sg ? -1 : 1;
            if (nz < 0)
              quad(
                G,
                [x, yb, rz],
                [x, yt, rz],
                [x + 1, yt, rz],
                [x + 1, yb, rz],
                [0, 0, -1],
                shade(rc, 0.75),
                gc,
                gc,
                shade(rc, 0.75),
              );
            else
              quad(
                G,
                [x + 1, yb, rz],
                [x + 1, yt, rz],
                [x, yt, rz],
                [x, yb, rz],
                [0, 0, 1],
                shade(rc, 0.75),
                gc,
                gc,
                shade(rc, 0.75),
              );
            for (const sd of [0, 1]) {
              const nb = nh(x + (sd ? 1 : -1), y, h);
              if (nb >= yt) continue;
              const xx = x + sd,
                yb2 = Math.max(h, nb);
              if (sd)
                quad(
                  G,
                  [xx, yb2, y + p0],
                  [xx, yt, y + p0],
                  [xx, yt, y + p1],
                  [xx, yb2, y + p1],
                  [1, 0, 0],
                  rc,
                  rc,
                  rc,
                  rc,
                );
              else
                quad(
                  G,
                  [xx, yb2, y + p1],
                  [xx, yt, y + p1],
                  [xx, yt, y + p0],
                  [xx, yb2, y + p0],
                  [-1, 0, 0],
                  rc,
                  rc,
                  rc,
                  rc,
                );
            }
          }
        }
        {
          const bxn = ax === 0 ? (sg ? x + 1 : x - 1) : x,
            byn = ax === 0 ? y : sg ? y + 1 : y - 1,
            nb = nh(bxn, byn, h);
          if (nb < hh2) {
            const yb2 = Math.max(h, nb),
              s = shade(rc, 0.85);
            if (ax === 0) {
              const X = sg ? x + 1 : x;
              if (sg) quad(G, [X, yb2, y], [X, hh2, y], [X, hh2, y + 1], [X, yb2, y + 1], [1, 0, 0], s, s, s, s);
              else quad(G, [X, yb2, y + 1], [X, hh2, y + 1], [X, hh2, y], [X, yb2, y], [-1, 0, 0], s, s, s, s);
            } else {
              const Z = sg ? y + 1 : y;
              if (sg) quad(G, [x + 1, yb2, Z], [x + 1, hh2, Z], [x, hh2, Z], [x, yb2, Z], [0, 0, 1], s, s, s, s);
              else quad(G, [x, yb2, Z], [x, hh2, Z], [x + 1, hh2, Z], [x + 1, yb2, Z], [0, 0, -1], s, s, s, s);
            }
          }
        }
      } else if (isP && !BL) pathTop(G, i, x, y, h, topCol(i, x, y, 1));
      else {
        const oc = (xx, yy) => (gOK(xx, yy) && HT[yy * TW + xx] > h ? 1 : 0),
          av = (a, b, cn) => (a && b ? 3 : a + b + cn),
          L = oc(x - 1, y),
          Rr = oc(x + 1, y),
          U = oc(x, y - 1),
          D = oc(x, y + 1),
          a0 = av(L, U, oc(x - 1, y - 1)),
          a1 = av(L, D, oc(x - 1, y + 1)),
          a2 = av(Rr, D, oc(x + 1, y + 1)),
          a3 = av(Rr, U, oc(x + 1, y - 1));
        if (a0 | a1 | a2 | a3) {
          const c0 = shade(c, AOK[a0]),
            c1 = shade(c, AOK[a1]),
            c2 = shade(c, AOK[a2]),
            c3 = shade(c, AOK[a3]);
          if (a0 + a2 > a1 + a3)
            quad(G, [x, h, y + 1], [x + 1, h, y + 1], [x + 1, h, y], [x, h, y], [0, 1, 0], c1, c2, c3, c0);
          else quad(G, [x, h, y], [x, h, y + 1], [x + 1, h, y + 1], [x + 1, h, y], [0, 1, 0], c0, c1, c2, c3);
        } else quad(G, [x, h, y], [x, h, y + 1], [x + 1, h, y + 1], [x + 1, h, y], [0, 1, 0], c, c, c, c);
      }
      if (ter[i] === 1) {
        const cv = (a, b) => {
          let ld = 0,
            dp = 0,
            n = 0;
          for (const [u, v] of [
            [a - 2, b - 2],
            [a - 1, b - 2],
            [a, b - 2],
            [a + 1, b - 2],
            [a - 2, b - 1],
            [a - 1, b - 1],
            [a, b - 1],
            [a + 1, b - 1],
            [a - 2, b],
            [a - 1, b],
            [a, b],
            [a + 1, b],
            [a - 2, b + 1],
            [a - 1, b + 1],
            [a, b + 1],
            [a + 1, b + 1],
          ]) {
            n++;
            if (!gOK(u, v) || ter[v * TW + u] !== 1) {
              if (Math.abs(u - a + 0.5) < 1 && Math.abs(v - b + 0.5) < 1) ld++;
              continue;
            }
            dp += Math.min(4, WLV - HT[v * TW + u]);
          }
          const t = Math.min(1, dp / n / 2.6),
            c = [0.24 - 0.13 * t, 0.5 - 0.2 * t, 0.7 - 0.12 * t];
          if (!ld) return c;
          const f = Math.min(0.22, ld * 0.07);
          return [c[0] + (0.86 - c[0]) * f, c[1] + (0.94 - c[1]) * f, c[2] + (0.96 - c[2]) * f];
        };
        quad(
          WG,
          [x, WLV, y],
          [x, WLV, y + 1],
          [x + 1, WLV, y + 1],
          [x + 1, WLV, y],
          [0, 1, 0],
          cv(x, y),
          cv(x, y + 1),
          cv(x + 1, y + 1),
          cv(x + 1, y),
        );
        if (x === 0 || y === 0 || x === TW - 1 || y === TH - 1) waterSkirt(G, x, y, h);
      }
      let e;
      const capOK =
        ter[i] === 0 &&
        !pth[i] &&
        h - LAND < 8 &&
        !(ter[i + 1] === 1 || ter[i - 1] === 1 || ter[i + TW] === 1 || ter[i - TW] === 1);
      for (let q = 0; q < 4; q++) {
        const dx = q === 0 ? 1 : q === 1 ? -1 : 0,
          dy = q === 2 ? 1 : q === 3 ? -1 : 0,
          k = [0.9, 0.8, 0.95, 0.75][q];
        e = OB(x + dx, y + dy) ? SKB : nh(x + dx, y + dy, h);
        const face = (b, t, s, sb) => {
          sb = sb || s;
          if (q === 0)
            quad(G, [x + 1, b, y], [x + 1, t, y], [x + 1, t, y + 1], [x + 1, b, y + 1], [1, 0, 0], sb, s, s, sb);
          else if (q === 1) quad(G, [x, b, y + 1], [x, t, y + 1], [x, t, y], [x, b, y], [-1, 0, 0], sb, s, s, sb);
          else if (q === 2)
            quad(G, [x + 1, b, y + 1], [x + 1, t, y + 1], [x, t, y + 1], [x, b, y + 1], [0, 0, 1], sb, s, s, sb);
          else quad(G, [x, b, y], [x, t, y], [x + 1, t, y], [x + 1, b, y], [0, 0, -1], sb, s, s, sb);
        };
        if (BL) {
          /* one quad per run of the same block kind; the top block of a grass column wears a grass lip (kind cap) */
          let b0 = e,
            k0 = -1,
            s0 = null;
          const flush = (b1) => {
            if (k0 < 0 || b1 <= b0) return;
            geometryState.BMAT = WM + k0;
            face(b0, b1, s0, b0 === e && ter[(y + dy) * TW + x + dx] !== 1 ? shade(s0, b1 - b0 > 1 ? 0.8 : 0.7) : s0);
          };
          for (let b = e; b < h; b++) {
            const t = b + 1,
              dep = h - t;
            let s = sideCol(i, b, x, y),
              kk;
            if (ter[i] !== 5 && h - LAND < 9 && dep >= 3 && h - LAND < 15) s = [0.5, 0.5, 0.5];
            if (t <= WLV && !OB(x + dx, y + dy) && ter[(y + dy) * TW + x + dx] === 1) {
              const dd = Math.max(0, Math.min(1, (WLV - t) / 4));
              s = [0.36 - 0.14 * dd, 0.32 - 0.1 * dd, 0.24 - 0.04 * dd];
            }
            if (t === h && capOK) {
              kk = BK.cap;
              s = shade(c, k * 0.92);
            } else {
              kk = kindOf(s);
              s = shade(s, k);
            }
            if (kk !== k0 || kk === BK.cap) {
              flush(b);
              b0 = b;
              k0 = kk;
              s0 = s;
            }
          }
          flush(h);
          continue;
        }
        for (let b = e; b < h; b++) {
          const t = b + 1,
            dep = h - t;
          let s = shade(sideCol(i, b, x, y), k);
          if (ter[i] !== 5 && h - LAND < 9 && t < WLV + 99) {
            if (dep >= 3 && dep >= 0 && h - LAND < 15)
              s = shade([0.5, 0.5, 0.5], k * (0.9 + 0.2 * hs(x * 3 + b, y * 5, b)));
          }
          if (t <= WLV && ter[(y + dy) * TW + x + dx] === 1) {
            const dd = Math.max(0, Math.min(1, (WLV - t) / 4));
            s = shade([0.36 - 0.14 * dd, 0.32 - 0.1 * dd, 0.24 - 0.04 * dd], k);
          }
          const sb = b === e && ter[(y + dy) * TW + x + dx] !== 1 ? shade(s, 0.7) : s;
          if (t === h && capOK) {
            face(b, t - 0.28, s, sb);
            face(t - 0.28, t, shade(c, k * 0.92));
          } else face(b, t, s, sb);
        }
      }
    }
  const m = new THREE.Mesh(toGeo(G), matT);
  m.castShadow = SHADOWS;
  m.receiveShadow = SHADOWS;
  scene.add(m);
  let w = null;
  if (WG.P.length) {
    w = new THREE.Mesh(toGeo(WG), matWater);
    scene.add(w);
  }
  return { m, w };
}

export function dropChunk(k) {
  const o = CHK.get(k);
  if (!o) return;
  for (const q of [o.m, o.w, o.p])
    if (q) {
      scene.remove(q);
      q.geometry.dispose();
    }
  CHK.delete(k);
}

export function loadChunk(cx, cy) {
  const k = keyOf(cx, cy);
  if (MP.on)
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        const x = cx + i,
          y = cy + j;
        if (x >= 0 && y >= 0 && x < NCX && y < NCY && !genF[y * NCX + x]) return;
      }
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) genChunk(cx + i, cy + j);
  const o = buildChunk(cx, cy);
  o.p = buildProps(cx, cy);
  CHK.set(k, o);
}

export function updateChunks(ms) {
  const t0 = performance.now(),
    cx0 = (CAM.x / CH) | 0,
    cy0 = (CAM.z / CH) | 0;
  for (const k of dirtyT) {
    dirtyT.delete(k);
    const o = CHK.get(k);
    if (!o) continue;
    for (const q of [o.m, o.w])
      if (q) {
        scene.remove(q);
        q.geometry.dispose();
      }
    const n = buildChunk(k % NCX, (k / NCX) | 0);
    o.m = n.m;
    o.w = n.w;
  }
  for (const k of dirtyP) {
    dirtyP.delete(k);
    const o = CHK.get(k);
    if (!o) continue;
    if (o.p) {
      scene.remove(o.p);
      o.p.geometry.dispose();
    }
    o.p = buildProps(k % NCX, (k / NCX) | 0);
  }
  const need = [];
  for (let j = -RM; j <= RM; j++)
    for (let i = -RM; i <= RM; i++) {
      const cx = cx0 + i,
        cy = cy0 + j;
      if (cx < 0 || cy < 0 || cx >= NCX || cy >= NCY) continue;
      if (!CHK.has(keyOf(cx, cy))) need.push([i * i + j * j, cx, cy]);
    }
  need.sort((a, b) => a[0] - b[0]);
  for (const [, cx, cy] of need) {
    if (performance.now() - t0 > ms) break;
    loadChunk(cx, cy);
  }
  for (const [k] of CHK) {
    const cx = k % NCX,
      cy = (k / NCX) | 0;
    if (Math.abs(cx - cx0) > RM + 1 || Math.abs(cy - cy0) > RM + 1) dropChunk(k);
  }
}

export function initializeTerrainRendering() {
  setTerrainInvalidationHandlers(markTImpl, markPImpl);
  SKB = BED - 4;
  /* block world switch flipped: every loaded chunk is drawn again (terrain and props) */
  blocksState.onChange = () => {
    for (const k of CHK.keys()) {
      dirtyT.add(k);
      dirtyP.add(k);
    }
  };
}
