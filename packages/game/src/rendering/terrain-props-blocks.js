import { fb, hs } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { BK, blocksState } from "./blocks.js";
import { newG, rgb, toGeo } from "./geometry.js";
import { matV } from "./materials.js";
import { scene, SHADOWS } from "./scene.js";
import { THREE } from "./three.js";
import { CH, FLG, HT, LAND, occ, pth, stairs, ter, terrainState } from "../world/terrain-state.js";

/* ================= BLOCK WORLD PROPS (switch `blocksState.on` + `decor`) =================
   Trees, rocks, ore, bushes and stumps are voxels on the world block grid (one block = blocksState.DBLK world units);
   flowers, tufts, mushrooms and reeds are boxes on the pixel grid (16 pixels per block). A chunk collects the voxels of its
   tiles plus a one-tile margin, then draws only the faces that touch air: touching canopies share no hidden or doubled
   face, whatever the chunk a tree stands in. Every choice comes from a hash of the tile or block position (never from
   call order), so both co-op machines and every rebuild draw the same thing. Visual only. */
const PAL = [],
  PIX = new Map();
const pc = (h) => {
  let i = PIX.get(h);
  if (i === undefined) {
    i = PAL.length;
    PAL.push(rgb(h));
    PIX.set(h, i);
  }
  return i;
};
const LEAF = [
  ["#3f7f2a", "#4a8e32", "#336f22"],
  ["#46862e", "#549638", "#3a7626"],
  ["#3a7a34", "#468a3e", "#2f6a2a"],
].map((a) => a.map(pc));
const PINE = [
  ["#2f7a4a", "#3d8f58", "#276a3e"],
  ["#2a6e48", "#37835a", "#215c3a"],
].map((a) => a.map(pc));
const BIRL = ["#8fb84a", "#a2c858", "#7ea23e"].map(pc);
const OAKT = ["#6b4a2a", "#5b3f22"].map(pc),
  PINT = ["#4f3418", "#3f2a14"].map(pc),
  BIRT = pc("#e8e4d8");
const ROCK = [
  ["#9aa1ac", "#a9b0bb", "#7e8590"],
  ["#868d98", "#9ea5b0", "#6a717e"],
  ["#a8aeb8", "#b8bec8", "#8c929e"],
  ["#707784", "#868d9a", "#5a606c"],
  ["#9c9a92", "#adab9f", "#7f7d74"],
  ["#8a9098", "#9aa0aa", "#6f757f"],
].map((a) => a.map(pc));
const ORE = pc("#8a8a8a");
const FLW = [
  ["#f0f0e8", "#e8c020"],
  ["#f0d020", "#e8a010"],
  ["#c8282a", "#2a2a2a"],
  ["#4a6ad8", "#2a3a8a"],
  ["#b060d8", "#7a2a9a"],
].map((a) => a.map(rgb));
const GOLD = rgb("#f2c23a"),
  CUT = rgb("#c9a56a"),
  FERN = rgb("#4c9a48"),
  STEM = rgb("#4f9a35"),
  BLADE = ["#86c95a", "#98d566", "#74b84c"].map(rgb),
  REED = rgb("#94c86a"),
  REEDH = rgb("#6a9a48"),
  MSTEM = rgb("#e8e0d0"),
  MCAP = [rgb("#c8282a"), rgb("#9a6a4a")];
const FK = [1, 0.9, 0.8, 0.86, 0.77, 0.55],
  RING8 = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ],
  PLUS4 = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

/* the blocks of one tree: [dx, dy, dz, leaf (1) or trunk (0)] around the foot of its trunk. sp: 0 broadleaf, 1 birch, 2 conifer; v: 0..5, its build;
   keep(dx, dz, layer, chance): the fixed coin of that block. One trunk per tile, a crown never wider than one block round it (two for an old oak),
   heights that differ from tree to tree so a wood is a tumbled canopy and not a lid, and kept low (4 to 8 blocks): a wood must not hide the
   ground in front of it from the camera more than it has to */
export function treeShape(sp, v, keep) {
  const B = [],
    leaf = (a, b, c) => B.push([a, b, c, 1]);
  if (sp === 0) {
    const th = 2 + (v % 3) + (v === 5 ? 1 : 0),
      old = v >= 4;
    for (let k = 0; k < th; k++) B.push([0, k, 0, 0]);
    for (const [a, c] of RING8) {
      if (!(a && c) || keep(a, c, 1, 0.5)) leaf(a, th - 1, c);
      if (!(a && c) || keep(a, c, 2, 0.8)) leaf(a, th, c);
      if (!(a && c) ? keep(a, c, 3, 0.9) : keep(a, c, 3, 0.25)) leaf(a, th + 1, c);
    }
    if (old && th > 3) {
      leaf(0, th - 2, 1);
      leaf(1, th - 2, 0);
      if (keep(0, 0, 9, 0.5)) leaf(-1, th - 2, 0);
    }
    leaf(0, th, 0);
    leaf(0, th + 1, 0);
    if (v % 2 || old) leaf(0, th + 2, 0);
    if (old)
      for (const [a, c] of PLUS4) {
        if (keep(a, c, 4, 0.7)) leaf(a * 2, th, c * 2);
        if (keep(a, c, 5, 0.4)) leaf(a * 2, th - 1, c * 2);
      }
  } else if (sp === 1) {
    const th = 3 + (v % 3);
    for (let k = 0; k < th; k++) B.push([0, k, 0, 0]);
    for (const [a, c] of PLUS4) {
      if (keep(a, c, 1, 0.75)) leaf(a, th - 2, c);
      leaf(a, th - 1, c);
      if (keep(a, c, 3, 0.6)) leaf(a, th, c);
    }
    for (const [a, c] of RING8) if (a && c && keep(a, c, 2, 0.55)) leaf(a, th - 1, c);
    leaf(0, th, 0);
    if (v % 3) leaf(0, th + 1, 0);
  } else {
    const th = 3 + (v % 3); /* a block lower than before (#74): the tallest trees hid the most */
    for (let k = 0; k < th; k++) B.push([0, k, 0, 0]);
    for (let k = 2; k < th; k++) {
      const wide = (th - k) % 2 === 0;
      for (const [a, c] of PLUS4) leaf(a, k, c);
      if (wide) for (const [a, c] of RING8) if (a && c && keep(a, c, k, 0.8)) leaf(a, k, c);
    }
    leaf(0, th, 0);
    leaf(0, th + 1, 0);
    if (v > 2) leaf(0, th + 2, 0);
  }
  return B;
}

export function buildPropsB(cx, cy) {
  const B = blocksState.DBLK,
    N = Math.max(1, Math.round(1 / B)),
    p = B / 16,
    x0 = cx * CH,
    y0 = cy * CH,
    x1 = Math.min(TW, x0 + CH),
    y1 = Math.min(TH, y0 + CH);
  const OFF = 4 * N,
    W = CH * N + 2 * OFF,
    V = new Map(),
    KEY = (bx, by, bz) => ((bx + OFF) * W + bz + OFF) * 512 + by;
  /* a trunk, rock or ore block replaces leaves; otherwise the first block set stays */
  const put = (bx, by, bz, kind, ci) => {
    const k = KEY(bx, by, bz),
      o = V.get(k);
    if (o === undefined || (((o & 31) === BK.leaves || (o & 31) === BK.pine) && kind !== BK.leaves && kind !== BK.pine))
      V.set(k, (ci << 5) | kind);
  };
  const G = newG();
  G.hm = 1;
  const quadM = (a, b, c, d, n, col, m) => {
    const o = G.P.length / 3;
    G.P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    for (let q = 0; q < 4; q++) {
      G.N.push(n[0], n[1], n[2]);
      G.C.push(col[0], col[1], col[2]);
      G.M.push(m);
    }
    G.I.push(o, o + 1, o + 2, o, o + 2, o + 3);
  };
  const sh = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  /* a box of whole pixels (plants): five faces, no bottom */
  const box = (X0, Y0, Z0, X1, Y1, Z1, c, m = 20 + BK.plant) => {
    quadM([X0, Y1, Z0], [X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [0, 1, 0], c, m);
    quadM([X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1], [X1, Y0, Z1], [1, 0, 0], sh(c, FK[1]), m);
    quadM([X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0], [X0, Y0, Z0], [-1, 0, 0], sh(c, FK[2]), m);
    quadM([X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1], [X0, Y0, Z1], [0, 0, 1], sh(c, FK[3]), m);
    quadM([X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0], [X1, Y0, Z0], [0, 0, -1], sh(c, FK[4]), m);
  };
  const lf = (L, bx, by, bz) => L[(hs(bx + x0 * N, bz + y0 * N, 300 + by) * 3) | 0];
  const tree = (bx, by, bz, x, y, al) => {
    const f = fb(x * 0.045, y * 0.045, terrainState.SEED + 610),
      r = hs(x, y, 7),
      v = (hs(x, y, 4) * 6) | 0;
    let sp = al >= 7 || f > 0.64 ? 2 : f < 0.34 ? 1 : 0;
    if (r < 0.1) sp = (sp + 1 + (((r * 30) | 0) % 2)) % 3;
    const L = sp === 0 ? LEAF[v % 3] : sp === 1 ? BIRL : PINE[v % 2],
      lk = sp === 2 ? BK.pine : BK.leaves,
      keep = (a, c, b, t) => hs(bx + a + x0 * N, bz + c + y0 * N, 400 + b) < t;
    for (const [a, b, c, isLeaf] of treeShape(sp, v, keep))
      if (isLeaf) put(bx + a, by + b, bz + c, lk, lf(L, bx + a, by + b, bz + c));
      else
        put(bx + a, by + b, bz + c, sp === 1 ? BK.birch : BK.bark, sp === 1 ? BIRT : (sp === 0 ? OAKT : PINT)[b & 1]);
  };
  for (let y = Math.max(0, y0 - 1); y < Math.min(TH, y1 + 1); y++)
    for (let x = Math.max(0, x0 - 1); x < Math.min(TW, x1 + 1); x++) {
      const i = y * TW + x,
        v = ter[i];
      if (v === 1 || v === 5) continue;
      const hh = HT[i],
        al = hh - LAND,
        by = Math.round(hh / B),
        ox = (hs(x, y, 61) * N) | 0,
        oz = (hs(x, y, 62) * N) | 0,
        bx = (x - x0) * N + ox,
        bz = (y - y0) * N + oz,
        ax = N > 1 ? (ox + 1 < N ? 1 : -1) : 0,
        inside = x >= x0 && x < x1 && y >= y0 && y < y1;
      if (v === 2) {
        tree(bx, by, bz, x, y, al);
        continue;
      }
      if (v === 3 || v === 4) {
        /* a deposit: every tile a block of rock, the heart of a large one two blocks high, a boulder or a ledge lying on most of them;
           gold shows as nuggets in the stone and on it */
        const ore = v === 4,
          C = ROCK[(hs(x, y, 6) * 6) | 0],
          vv = (hs(x, y, 65) * 8) | 0,
          kind = ore ? BK.ore : BK.rock,
          col = (k) => (ore ? ORE : C[k]),
          rk = (dx, dy) => {
            const t2 = ter[(y + dy) * TW + x + dx];
            return t2 === 3 || t2 === 4 ? 1 : 0;
          };
        put(bx, by, bz, kind, col(0));
        if (N > 1) {
          if (vv >= 2) put(bx + ax, by, bz, kind, col(2));
          if (vv >= 4) put(bx, by + 1, bz, kind, col(1));
          continue;
        }
        let top = hh + 1;
        if (vv >= 5 && rk(1, 0) + rk(-1, 0) + rk(0, 1) + rk(0, -1) >= 3) {
          put(bx, by + 1, bz, kind, col(1));
          top += 1;
        }
        if (inside) {
          const m = 20 + kind;
          if (vv % 3 === 0) box(x + 3 * p, top, y + 4 * p, x + 12 * p, top + 6 * p, y + 13 * p, PAL[col(1)], m);
          else if (vv % 3 === 1) {
            box(x + p, top, y + 2 * p, x + 9 * p, top + 4 * p, y + 9 * p, PAL[col(2)], m);
            box(x + 9 * p, top, y + 8 * p, x + 14 * p, top + 3 * p, y + 14 * p, PAL[col(1)], m);
          }
          if (ore) {
            const g0 = vv % 3 === 0 ? 6 : vv % 3 === 1 ? 4 : 0;
            box(x + 5 * p, top + g0 * p, y + 6 * p, x + 8 * p, top + (g0 + 2) * p, y + 9 * p, GOLD);
            box(x + 11 * p, top, y + 3 * p, x + 13 * p, top + 2 * p, y + 5 * p, GOLD);
          }
        }
        continue;
      }
      if (v !== 0 || pth[i] || occ.has(i) || stairs.has(i) || hh < LAND) continue;
      const q = hs(x, y, 201);
      if (q > 0.06) continue;
      const wet = ter[i + 1] === 1 || ter[i - 1] === 1 || ter[i + TW] === 1 || ter[i - TW] === 1,
        S = 16 * N,
        px = x + Math.round((0.3 + hs(x, y, 61) * 0.4) * S) / S,
        pz = y + Math.round((0.3 + hs(x, y, 62) * 0.4) * S) / S;
      if (!inside) continue;
      if (wet) {
        if (q < 0.045)
          for (let k = 0; k < 3; k++) {
            const a = px + [0, 4, -3][k] * p,
              c = pz + [0, 2, 3][k] * p,
              h2 = (10 + ((hs(x + k, y, 66) * 7) | 0)) * p;
            box(a, hh, c, a + 2 * p, hh + h2, c + 2 * p, REED);
            box(a, hh + h2, c, a + 2 * p, hh + h2 + 3 * p, c + 2 * p, REEDH);
          }
        continue;
      }
      if (FLG[i] & 12 || al >= 9 || FLG[i] & 1) continue;
      if (q < 0.016) {
        /* flowers: three stems, a head of four pixels and its heart */
        const C = FLW[(hs(x, y, 202) * 5) | 0];
        for (let k = 0; k < 3; k++) {
          const a = px + [0, 5, -4][k] * p,
            c = pz + [0, 4, 3][k] * p,
            h2 = (3 + (k & 1) * 2) * p;
          box(a, hh, c, a + 2 * p, hh + h2, c + 2 * p, STEM);
          box(a - p, hh + h2, c - p, a + 3 * p, hh + h2 + 2 * p, c + 3 * p, C[0]);
          box(a, hh + h2 + 2 * p, c, a + 2 * p, hh + h2 + 3 * p, c + 2 * p, C[1]);
        }
      } else if (q < 0.032) {
        /* a tuft of grass: blades two pixels thick, so their colour shows inside the ink */
        for (let k = 0; k < 4; k++) {
          const a = px + [0, 3, -3, 1][k] * p,
            c = pz + [0, 3, 2, -3][k] * p;
          box(a, hh, c, a + 2 * p, hh + (4 + ((hs(x + k, y, 67) * 6) | 0)) * p, c + 2 * p, BLADE[k % 3]);
        }
      } else if (q < 0.043) {
        /* a bush: a mound of leaves, a few berries on one in three */
        const L = LEAF[(hs(x, y, 204) * 3) | 0],
          m = 20 + BK.leaves,
          a = x + 3 * p,
          c = y + 3 * p;
        box(a, hh, c, a + 10 * p, hh + 6 * p, c + 10 * p, PAL[L[0]], m);
        box(a + 2 * p, hh + 6 * p, c + 2 * p, a + 8 * p, hh + 9 * p, c + 8 * p, PAL[L[1]], m);
        if (hs(x, y, 68) < 0.34) {
          const F = FLW[(hs(x, y, 69) * 5) | 0][0];
          box(a + p, hh + 4 * p, c + 10 * p, a + 3 * p, hh + 6 * p, c + 11 * p, F);
          box(a + 10 * p, hh + 3 * p, c + 6 * p, a + 11 * p, hh + 5 * p, c + 8 * p, F);
          box(a + 4 * p, hh + 9 * p, c + 4 * p, a + 6 * p, hh + 10 * p, c + 6 * p, F);
        }
      } else if (q < 0.047) {
        box(px, hh, pz, px + 2 * p, hh + 3 * p, pz + 2 * p, MSTEM);
        box(px - 2 * p, hh + 3 * p, pz - 2 * p, px + 4 * p, hh + 6 * p, pz + 4 * p, MCAP[0]);
        box(px + 6 * p, hh, pz + 3 * p, px + 7 * p, hh + 2 * p, pz + 4 * p, MSTEM);
        box(px + 5 * p, hh + 2 * p, pz + 2 * p, px + 8 * p, hh + 4 * p, pz + 5 * p, MCAP[1]);
      } else if (q < 0.051) {
        if (fb(x * 0.03, y * 0.03, terrainState.SEED + 88) > 0.45) {
          /* a stump: bark, and the pale wood of its cut */
          const a = x + 4 * p,
            c = y + 4 * p;
          box(a, hh, c, a + 8 * p, hh + 5 * p, c + 8 * p, PAL[OAKT[1]], 20 + BK.bark);
          box(a + p, hh + 5 * p, c + p, a + 7 * p, hh + 6 * p, c + 7 * p, CUT);
        }
      } else if (q < 0.056) {
        /* loose stones */
        const C = PAL[ROCK[(hs(x, y, 6) * 6) | 0][0]],
          m = 20 + BK.rock;
        box(px, hh, pz, px + 5 * p, hh + 3 * p, pz + 4 * p, C, m);
        box(px - 4 * p, hh, pz + 3 * p, px - p, hh + 2 * p, pz + 6 * p, C, m);
      } else {
        /* a fern: a low spray of darker leaves */
        box(px - 3 * p, hh, pz, px + 5 * p, hh + 3 * p, pz + 2 * p, FERN);
        box(px, hh, pz - 3 * p, px + 2 * p, hh + 3 * p, pz + 5 * p, FERN);
        box(px, hh + 3 * p, pz, px + 2 * p, hh + 6 * p, pz + 2 * p, FERN);
      }
    }
  /* faces that touch air, for the blocks of this chunk only */
  const NX = (x1 - x0) * N,
    NZ = (y1 - y0) * N;
  for (const [k, val] of V) {
    const by = k % 512,
      r = (k - by) / 512,
      bz = (r % W) - OFF,
      bx = (r - (bz + OFF)) / W - OFF;
    if (bx < 0 || bz < 0 || bx >= NX || bz >= NZ) continue;
    const kind = val & 31,
      c = PAL[val >> 5],
      m = 20 + kind,
      X0 = x0 + bx * B,
      X1 = X0 + B,
      Y0 = by * B,
      Y1 = Y0 + B,
      Z0 = y0 + bz * B,
      Z1 = Z0 + B,
      lv = kind === BK.leaves || kind === BK.pine;
    if (!V.has(KEY(bx, by + 1, bz))) quadM([X0, Y1, Z0], [X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [0, 1, 0], c, m);
    if (!V.has(KEY(bx + 1, by, bz)))
      quadM([X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1], [X1, Y0, Z1], [1, 0, 0], sh(c, FK[1]), m);
    if (!V.has(KEY(bx - 1, by, bz)))
      quadM([X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0], [X0, Y0, Z0], [-1, 0, 0], sh(c, FK[2]), m);
    if (!V.has(KEY(bx, by, bz + 1)))
      quadM([X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1], [X0, Y0, Z1], [0, 0, 1], sh(c, FK[3]), m);
    if (!V.has(KEY(bx, by, bz - 1)))
      quadM([X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0], [X1, Y0, Z0], [0, 0, -1], sh(c, FK[4]), m);
    if (lv && !V.has(KEY(bx, by - 1, bz)))
      quadM([X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1], [0, -1, 0], sh(c, FK[5]), m);
  }
  if (!G.P.length) return null;
  const mesh = new THREE.Mesh(toGeo(G), matV);
  mesh.castShadow = SHADOWS;
  mesh.receiveShadow = SHADOWS;
  scene.add(mesh);
  return mesh;
}
