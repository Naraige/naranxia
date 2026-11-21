import { doorway, frameWalls, grow, logWalls, model, palette, rect, stair, windows } from "../voxel-kit.js";

/* ---- fortifications, on the scale of the block-built buildings. They are laid on a grid of four tiles (FCELL in gameplay/rules.js):
   a wall piece is one cell, a rampart four blocks thick with a wall walk between two parapets; a tower two cells a side, a shaft on a broad foot
   under a fighting top; a gate two or three cells long, a vaulted passage between two posts or two towers.
   FORT_TOP is where the garrison stands (blocks above the ground; rendering/models/fortifications.js `gtopOf` reads it), FORT_H how tall a piece is.
   Every builder returns { M: the model, o / oz: the offset of its first block } from the corner of the footprint (from the middle of a gate). ---- */
export const FORT_TOP = { wall: 5, gate: 8, tower: 11, tower1: 8, keep: 15 };
export const FORT_H = { wall: 7, gate: 11, gate3: 14, tower: 22, tower1: 16, keep: 27, torch: 3 };

const BX = "iron_bars[east=true,west=true]",
  BZ = "iron_bars[north=true,south=true]",
  WX = "window[east=true,west=true]",
  WZ = "window[north=true,south=true]";

/* stone (tier 1): mixed masonry on a rougher footing, dressed bands, flagged walks. Timber (tier 0): a stockade of spruce logs bound by pale rails */
const mats = (t) => {
  const P = palette(t),
    T = P.t;
  return {
    P,
    T,
    W: T ? P.wall : "spruce_log",
    base: T ? P.base : "spruce_log",
    cap: T ? "stone_bricks" : "spruce_planks",
    mer: T ? "stone_bricks" : "dark_oak_planks",
    band: T ? "polished_andesite" : "stripped_spruce_log",
    walk: T ? "flagstone" : "oak_planks",
    st: T ? "stone_brick_stairs" : "spruce_stairs",
    quoin: T ? P.quoin : "dark_oak_log",
  };
};

/* ---- walls ----
   The look of a wall piece, one character per tile of its cell (row by row from the north-west): "-" no wall on that tile, else a digit in
   base 32: which of its four sides are open country (1 north, 2 east, 4 south, 8 west), or 16 when only a corner is. A tile with no open side
   is wall walk; the others carry the parapet. own(i, j): the piece stands on tile (i, j) of its cell; fort(i, j): another fortification does
   (both are asked about tiles around the cell too). An "L" after the 16 characters hangs a fire basket on the piece. */
export function wallLook(own, fort) {
  const f = (i, j) => own(i, j) || fort(i, j);
  let s = "";
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      if (!own(i, j)) {
        s += "-";
        continue;
      }
      let v = (f(i, j - 1) ? 0 : 1) | (f(i + 1, j) ? 0 : 2) | (f(i, j + 1) ? 0 : 4) | (f(i - 1, j) ? 0 : 8);
      if (!v && !(f(i - 1, j - 1) && f(i + 1, j - 1) && f(i - 1, j + 1) && f(i + 1, j + 1))) v = 16;
      s += v.toString(32);
    }
  return s;
}
/* a piece in the middle of a wall running east-west, and one standing alone */
export const WALL_RUN = "1111000000004444",
  WALL_ALONE = "9113800280026446";
const digit = (c) => (c === "-" ? -1 : parseInt(c, 32));
/* is the tile a merlon? Merlons are two tiles wide (the corners of a cell), so are the gaps between them */
const merlon = (c, i, j) =>
  c > 0 && (c & 5 && c & 10 ? true : c & 5 ? i === 0 || i === 3 : c & 10 ? j === 0 || j === 3 : true);
/* the tile of a piece that carries its fire basket (the first merlon), or null */
export function wallLamp(look) {
  for (let q = 0; q < 16; q++) if (merlon(digit(look[q]), q & 3, q >> 2)) return [q & 3, q >> 2];
  return null;
}

/* a wall piece. Stone: five courses, the wall walk on top between two breast walls with merlons, a dressed band under them, and a blind arch
   under each gap on the faces that have the walk behind them. Timber: two rows of sharpened logs bound by a rail, a plank walk between them.
   v: which mix of stones (so a long wall does not repeat) */
export function wall(t, look = WALL_RUN, v = 0) {
  const m = mats(t),
    vb = model(4, 9, 4),
    at = (i, j) => (i < 0 || j < 0 || i > 3 || j > 3 ? -1 : digit(look[j * 4 + i])),
    lamp = look.length > 16 ? wallLamp(look) : null;
  vb.sx = v * 31;
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      const c = at(i, j);
      if (c < 0) continue;
      const mer = merlon(c, i, j);
      if (m.T) {
        vb.box(i, 0, j, i, 3, j, m.W);
        if (!c) vb.set(i, 4, j, m.walk);
        else {
          if (c & 15) vb.set(i, 0, j, m.base);
          vb.set(i, 4, j, m.band).set(i, 5, j, m.cap);
          if (mer) vb.set(i, 6, j, m.mer);
        }
      } else if (!c) vb.box(i, 0, j, i, 3, j, "spruce_planks").set(i, 4, j, m.walk);
      else {
        const post = (c & 5 && c & 10) || !(c & 15),
          top = mer ? 5 : 4;
        vb.box(i, 0, j, i, top, j, post ? m.quoin : m.W).set(i, top + 1, j, "stake");
        if (!post) vb.set(i, 3, j, `${m.band}[axis=${c & 5 ? "x" : "z"}]`);
      }
    }
  if (m.T)
    for (const [p, q, e, dx, dz, f0, f1] of [
      [[1, 0], [2, 0], 1, 0, 1, "west", "east"],
      [[1, 3], [2, 3], 4, 0, -1, "west", "east"],
      [[0, 1], [0, 2], 8, 1, 0, "north", "south"],
      [[3, 1], [3, 2], 2, -1, 0, "north", "south"],
    ]) {
      if (
        (at(...p) & 31) !== e ||
        (at(...q) & 31) !== e ||
        at(p[0] + dx, p[1] + dz) < 0 ||
        at(q[0] + dx, q[1] + dz) < 0
      )
        continue;
      for (const [i, j] of [p, q]) vb.box(i, 1, j, i, 2, j, 0);
      vb.set(p[0], 3, p[1], stair(m.st, f0, "top")).set(q[0], 3, q[1], stair(m.st, f1, "top"));
    }
  if (lamp) vb.set(lamp[0], m.T ? 7 : 6, lamp[1], "brazier");
  return { M: vb.model(), o: 0 };
}

/* what shows under a piece where the ground falls away below its floor: footing under each tile, as deep as `drops` says (w x l tiles, row by row) */
export function footing(t, w, l, drops) {
  const m = mats(t),
    D = Math.max(...drops),
    vb = model(w, D, l);
  for (let j = 0; j < l; j++)
    for (let i = 0; i < w; i++) {
      const d = drops[j * w + i];
      if (d > 0) vb.box(i, D - d, j, i, D - 1, j, m.T ? "cobblestone" : m.base);
    }
  return { M: vb.model(), D };
}

/* ---- tops ---- */
/* the fighting top of a tower: the floor on the shaft r at the course y, a breast wall one block out on corbels, merlons two blocks wide at
   its corners and between them. The garrison stands on y + 1 */
function crown(vb, m, r, y) {
  const g = grow(r, 1),
    { st } = m,
    n = g.x1 - g.x0 + 1,
    p = n % 4 === 0 ? 4 : 3;
  for (let x = r.x0; x <= r.x1; x++)
    vb.set(x, y, g.z0, stair(st, "south", "top")).set(x, y, g.z1, stair(st, "north", "top"));
  for (let z = r.z0; z <= r.z1; z++)
    vb.set(g.x0, y, z, stair(st, "east", "top")).set(g.x1, y, z, stair(st, "west", "top"));
  vb.set(g.x0, y, g.z0, stair(st, "south", "top", "outer_left")).set(
    g.x1,
    y,
    g.z0,
    stair(st, "south", "top", "outer_right"),
  );
  vb.set(g.x0, y, g.z1, stair(st, "north", "top", "outer_right")).set(
    g.x1,
    y,
    g.z1,
    stair(st, "north", "top", "outer_left"),
  );
  vb.box(r.x0, y, r.z0, r.x1, y, r.z1, m.walk).walls(g.x0, y + 1, g.z0, g.x1, y + 1, g.z1, m.cap);
  for (let k = 0; k < n; k++)
    if (k % p === 0 || k % p === p - 1)
      vb.set(g.x0 + k, y + 2, g.z0, m.mer)
        .set(g.x0 + k, y + 2, g.z1, m.mer)
        .set(g.x0, y + 2, g.z0 + k, m.mer)
        .set(g.x1, y + 2, g.z0 + k, m.mer);
}
/* a pointed roof on the square r: rings of stairs that step in by one, each `rises[k]` blocks high, the first of the trim; the last four
   stairs meet in a point. Returns the height of its top */
function cap(vb, P, r, y, rises) {
  const S = (M, f, sh) => `${M.st}[facing=${f},half=bottom,shape=${sh}]`;
  let { x0, z0, x1, z1 } = r,
    yy = y;
  for (let k = 0; x0 < x1; k++, x0++, z0++, x1--, z1--) {
    const h = rises[Math.min(k, rises.length - 1)],
      M = k === 0 ? P.trim : P.roof,
      t = yy + h - 1;
    vb.box(x0, yy, z0, x1, t - 1, z1, M.bl);
    for (let x = x0 + 1; x < x1; x++)
      vb.set(x, t, z0, S(M, "south", "straight")).set(x, t, z1, S(M, "north", "straight"));
    for (let z = z0 + 1; z < z1; z++)
      vb.set(x0, t, z, S(M, "east", "straight")).set(x1, t, z, S(M, "west", "straight"));
    vb.set(x0, t, z0, S(M, "south", "outer_left")).set(x1, t, z0, S(M, "south", "outer_right"));
    vb.set(x0, t, z1, S(M, "north", "outer_right")).set(x1, t, z1, S(M, "north", "outer_left"));
    if (x1 - x0 > 2) vb.box(x0 + 1, t, z0 + 1, x1 - 1, t, z1 - 1, M.bl);
    yy += h;
  }
  return yy - 1;
}

/* ---- towers ---- */
/* the tower of the build menu, two cells a side: a foot as high as the walls, its top a ledge level with their wall walk, a shaft one block in,
   a fighting top as wide as the foot; in its middle a turret under a pointed roof, or nothing when an engine stands there (op).
   The garrison stands in the corners of the top. top: the floor course of the fighting top (FORT_TOP - 1) */
function greatTower(t, op, top, keep) {
  const m = mats(t),
    { P } = m,
    vb = model(10, top + 16, 10),
    f = rect(1, 1, 8, 8),
    r = rect(2, 2, 7, 7),
    q = rect(3, 3, 6, 6),
    rows = keep ? [7, 11] : [7];
  if (m.T) {
    vb.box(1, 0, 1, 8, 4, 8, m.W).walls(1, 0, 1, 8, 0, 8, m.base).walls(1, 4, 1, 8, 4, 8, m.band);
    for (const x of [1, 8]) for (const z of [1, 8]) vb.set(x, 0, z, m.quoin).set(x, 2, z, m.quoin);
    /* the blind arches of the walls run on round the foot, two to a side; the door takes their place in front */
    for (const c of [2, 6]) {
      vb.box(c, 1, 1, c + 1, 2, 1, 0)
        .set(c, 3, 1, stair(m.st, "west", "top"))
        .set(c + 1, 3, 1, stair(m.st, "east", "top"));
      for (const x of [1, 8])
        vb.box(x, 1, c, x, 2, c + 1, 0)
          .set(x, 3, c, stair(m.st, "north", "top"))
          .set(x, 3, c + 1, stair(m.st, "south", "top"));
    }
    doorway(vb, P, "south", 8, 4, 0, { wide: true, arch: true, step: false, wood: "dark_oak" });
    vb.box(2, 5, 2, 7, top, 7, m.W).walls(2, top - 1, 2, 7, top - 1, 7, m.band);
    for (const x of [2, 7]) for (const z of [2, 7]) for (let y = 5; y < top - 1; y += 2) vb.set(x, y, z, m.quoin);
    /* a slit either side of the banner that hangs down each face */
    for (const y0 of rows)
      for (const c of [3, 6])
        for (const y of [y0, y0 + 1]) vb.set(c, y, 2, BX).set(c, y, 7, BX).set(2, y, c, BZ).set(7, y, c, BZ);
  } else {
    logWalls(vb, P, f, 0, 4, "spruce_log");
    vb.box(2, 0, 2, 7, 4, 7, "spruce_planks");
    doorway(vb, P, "south", 8, 4, 0, { wide: true, step: false });
    frameWalls(vb, P, r, 5, top, {
      sill: true,
      ps: { south: [2, 7], north: [2, 7], east: [2, 7], west: [2, 7] },
      brace: { south: true, north: true, east: true, west: true },
    });
    for (const y of rows) {
      windows(vb, P, "south", 6, [[4, 2]], y, 2);
      windows(vb, P, "north", 3, [[4, 2]], y, 2);
      windows(vb, P, "east", 6, [[4, 2]], y, 2);
      windows(vb, P, "west", 3, [[4, 2]], y, 2);
    }
  }
  vb.set(3, 2, 9, "sconce[facing=south]").set(6, 2, 9, "sconce[facing=south]");
  crown(vb, m, r, top);
  if (op) return { M: vb.model(), o: -1 };
  /* the turret stands tall, so the men on the walk around it are seen under the eave of its roof */
  const h = keep ? 6 : 5;
  if (m.T) {
    /* a door to the walk, lit windows on its three other sides */
    vb.box(q.x0, top + 1, q.z0, q.x1, top + h, q.z1, m.W).walls(q.x0, top + h, q.z0, q.x1, top + h, q.z1, m.band);
    for (const x of [q.x0, q.x1])
      for (const z of [q.z0, q.z1]) for (let y = top + 1; y < top + h; y += 2) vb.set(x, y, z, m.quoin);
    doorway(vb, P, "south", q.z1, 4, top + 1, { wide: true, step: false, wood: "dark_oak" });
    for (const c of [4, 5])
      for (const y of [top + 3, top + 4])
        vb.set(c, y, q.z0, WX).set(c, y, q.z1, WX).set(q.x0, y, c, WZ).set(q.x1, y, c, WZ);
  } else {
    /* a look-out roof on four posts over a fire basket */
    for (const x of [q.x0, q.x1]) for (const z of [q.z0, q.z1]) vb.box(x, top + 1, z, x, top + h, z, P.post);
    vb.walls(q.x0, top + h, q.z0, q.x1, top + h, q.z1, P.plank);
    for (const x of [q.x0, q.x1]) for (const z of [q.z0, q.z1]) vb.set(x, top + h, z, P.post);
    vb.set(4, top + 1, 4, "brazier");
  }
  cap(vb, P, grow(q, 1), top + h + 1, [1, 2, 2]);
  return { M: vb.model(), o: -1 };
}
export const tower = (t, op) => greatTower(t, op, FORT_TOP.tower - 1, false);
/* the keep: the same tower, taller, with two rows of openings */
export const keep = (t) => greatTower(t, false, FORT_TOP.keep - 1, true);

/* a tower of one cell (the camps raise these along their walls): a shaft with a top that overhangs it, under a pointed roof on four posts */
export function tower1(t, op) {
  const m = mats(t),
    { P } = m,
    y = FORT_TOP.tower1 - 1,
    vb = model(6, y + 10, 6),
    r = rect(1, 1, 4, 4),
    g = grow(r, 1);
  if (m.T) {
    vb.box(1, 0, 1, 4, y, 4, m.W).walls(1, 0, 1, 4, 0, 4, m.base).walls(1, 5, 1, 4, 5, 4, m.band);
    for (const x of [1, 4]) for (const z of [1, 4]) for (let k = 0; k < 5; k += 2) vb.set(x, k, z, m.quoin);
    for (const c of [2, 3]) vb.set(c, 3, 1, BX).set(1, 3, c, BZ).set(4, 3, c, BZ);
    doorway(vb, P, "south", 4, 2, 0, { wide: true, step: false, wood: "dark_oak" });
  } else {
    logWalls(vb, P, r, 0, y, "spruce_log");
    vb.box(2, 0, 2, 3, y, 3, "spruce_planks");
    doorway(vb, P, "south", 4, 2, 0, { wide: true, step: false });
  }
  crown(vb, m, r, y);
  if (!op) {
    for (const x of [g.x0, g.x1]) for (const z of [g.z0, g.z1]) vb.set(x, y + 3, z, m.T ? "stone_bricks" : P.post);
    cap(vb, P, g, y + 4, [1, 2, 2]);
  }
  return { M: vb.model(), o: -1 };
}

/* ---- gates ---- */
/* a gate n cells long (n * 4 blocks; its middle is the origin). The passage is four blocks wide and four high under an arch; over it a
   chamber with two slits, then the deck and its two breast walls, where the garrison stands. n = 2: a post two blocks wide at each end,
   n = 3: a tower of one cell at each end. The doors are separate meshes because they move (gateLeaf, portcullis) */
export function gate(t, n) {
  const m = mats(t),
    { st } = m,
    L = n * 4,
    a = 1 + (L - 4) / 2,
    b = a + 3,
    deck = FORT_TOP.gate - 1,
    vb = model(L + 2, 16, 6);
  vb.box(a, 0, 1, b, 0, 4, m.T ? "paving_dark" : "path");
  for (let z = 1; z <= 4; z++) vb.set(a, 3, z, stair(st, "west", "top")).set(b, 3, z, stair(st, "east", "top"));
  vb.box(a, 4, 1, b, deck - 1, 4, m.T ? m.W : "spruce_planks").box(a, deck, 1, b, deck, 4, m.walk);
  for (const z of [1, 4]) {
    vb.box(a, 4, z, b, 4, z, m.T ? m.band : "dark_oak_log[axis=x]").box(a, deck + 1, z, b, deck + 1, z, m.cap);
    vb.set(a, deck + 2, z, m.mer).set(b, deck + 2, z, m.mer);
    if (m.T)
      vb.box(a, deck, z, b, deck, z, m.band)
        .set(a + 1, 5, z, BX)
        .set(b - 1, 5, z, BX);
    else
      vb.box(a, deck, z, b, deck, z, "dark_oak_log[axis=x]")
        .set(a + 1, 5, z, WX)
        .set(b - 1, 5, z, WX);
  }
  for (const [x0, x1, xi] of [
    [1, a - 1, a - 1],
    [b + 1, L, b + 1],
  ]) {
    const y = deck + (n === 3 ? 3 : 2);
    vb.box(x0, 0, 1, x1, y, 4, m.W);
    if (m.T) {
      vb.walls(x0, 0, 1, x1, 0, 4, m.base).walls(x0, deck, 1, x1, deck, 4, m.band);
      if (n === 3)
        for (const x of [x0, x1]) for (const z of [1, 4]) for (let k = 0; k < y; k += 2) vb.set(x, k, z, m.quoin);
    } else {
      for (const z of [1, 4]) vb.box(x0, deck, z, x1, deck, z, `${m.band}[axis=x]`);
      for (const x of [x0, x1]) vb.box(x, deck, 2, x, deck, 3, `${m.band}[axis=z]`);
      for (const x of [x0, x1]) for (const z of [1, 4]) vb.box(x, 0, z, x, y, z, m.quoin);
    }
    if (n === 3) crown(vb, m, rect(x0, 1, x1, 4), y);
    else if (m.T) for (const z of [1, 4]) vb.set(x0, y + 1, z, m.mer).set(x1, y + 1, z, m.mer);
    else vb.box(x0, y + 1, 1, x1, y + 1, 4, "stake");
    /* a torch beside the arch on both faces */
    vb.set(xi, 2, 0, "sconce[facing=north]").set(xi, 2, 5, "sconce[facing=south]");
  }
  return { M: vb.model(), o: -L / 2 - 1, oz: -3 };
}
/* one leaf of the doors of a timber gate: two blocks wide and four high, boards under two iron straps. Its first column is the hinge */
export function gateLeaf() {
  const vb = model(2, 4, 1);
  for (let y = 0; y < 4; y++)
    vb.box(0, y, 0, 1, y, 0, `${y === 0 || y === 3 ? "gate_band" : "gate_leaf"}[facing=south]`);
  return vb.model();
}
/* the portcullis of a stone gate: four by four */
export function portcullis() {
  return model(4, 4, 1).box(0, 0, 0, 3, 3, 0, BX).model();
}

/* the torch: a stone post with a fire basket on it */
export function torch() {
  const vb = model(1, 3, 1);
  vb.set(0, 0, 0, "stone_brick_wall").set(0, 1, 0, "stone_brick_wall").set(0, 2, 0, "brazier");
  return { M: vb.model(), o: -0.5 };
}
