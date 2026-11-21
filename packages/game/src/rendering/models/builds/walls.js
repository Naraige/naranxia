import { model, palette, stair } from "../voxel-kit.js";

/* ---- fortifications, one block per tile like everything else: a wall is a stack of blocks one tile thick, a tower a shaft under a fighting top
   that overhangs its neighbours, a gate a lintel across the passage. They stand tall enough to mean something beside houses of two floors.
   FORT_TOP is where the garrison stands (in blocks = tiles above the ground); rendering/models/fortifications.js `gtopOf` reads it.
   `o` is the offset of the model's first block from the middle of a one-tile piece or a gate, from the corner of a 2 x 2 piece. ---- */
export const FORT_TOP = { wall: 4, gate: 5, tower: 7, tower2: 9, keep: 12 };

const mats = (t) => {
  const P = palette(t);
  return {
    P,
    W: P.t ? P.wall : "spruce_log",
    dk: P.t ? "stone_bricks" : "spruce_planks",
    band: P.t ? "polished_andesite" : "dark_oak_planks",
    st: P.t ? "stone_brick_stairs" : "spruce_stairs",
  };
};

/* a wall tile: footing, body, a dressed top course. alt: every other tile takes a lighter top, so a long wall reads as a row of blocks */
export function wall(t, alt) {
  const { P, W, dk, band } = mats(t),
    vb = model(1, FORT_TOP.wall, 1);
  vb.box(0, 0, 0, 0, FORT_TOP.wall - 2, 0, W)
    .set(0, 0, 0, P.base)
    .set(0, FORT_TOP.wall - 1, 0, alt ? band : dk);
  if (!P.t && alt) vb.set(0, 2, 0, band);
  return { M: vb.model(), o: -0.5 };
}

/* the fighting top of a tower: a platform one block wider than the shaft all round on corbels, merlons on its rim; without an engine (op false)
   a pointed roof on corner posts. (x0,z0)-(x1,z1): the shaft, y: the platform course */
function top(vb, m, x0, z0, x1, z1, y, op) {
  const { P, dk, st } = m;
  for (let x = x0; x <= x1; x++)
    vb.set(x, y - 1, z0 - 1, stair(st, "south", "top")).set(x, y - 1, z1 + 1, stair(st, "north", "top"));
  for (let z = z0; z <= z1; z++)
    vb.set(x0 - 1, y - 1, z, stair(st, "east", "top")).set(x1 + 1, y - 1, z, stair(st, "west", "top"));
  vb.box(x0 - 1, y, z0 - 1, x1 + 1, y, z1 + 1, dk);
  for (let x = x0 - 1; x <= x1 + 1; x++)
    for (let z = z0 - 1; z <= z1 + 1; z++) {
      const rim = x === x0 - 1 || x === x1 + 1 || z === z0 - 1 || z === z1 + 1,
        corner = (x === x0 - 1 || x === x1 + 1) && (z === z0 - 1 || z === z1 + 1);
      if (rim && (corner || (x1 - x0 > 0 && (x + z) % 2 === 0))) vb.set(x, y + 1, z, dk);
    }
  if (op) return;
  for (const x of [x0 - 1, x1 + 1])
    for (const z of [z0 - 1, z1 + 1]) vb.box(x, y + 1, z, x, y + 2, z, P.t ? "stone_bricks" : P.post);
  vb.hipRoof({
    x0: x0 - 1,
    z0: z0 - 1,
    x1: x1 + 1,
    z1: z1 + 1,
    y: y + 3,
    m: P.roof,
    t: P.trim,
    prof: [1, 1],
    fin: [P.fence],
  });
}

/* a one-tile tower: a banded shaft, its top at 7 */
export function tower1(t, op) {
  const m = mats(t),
    y = FORT_TOP.tower - 1,
    vb = model(3, y + 8, 3);
  vb.box(1, 0, 1, 1, y - 1, 1, m.W)
    .set(1, 0, 1, m.P.base)
    .set(1, 3, 1, m.band);
  top(vb, m, 1, 1, 1, 1, y, op);
  return { M: vb.model(), o: -1.5 };
}

/* the great tower (2 x 2 tiles): a shaft with a door and bands, its top at 9 */
export function tower2(t, op) {
  const m = mats(t),
    y = FORT_TOP.tower2 - 1,
    vb = model(4, y + 8, 4);
  vb.box(1, 0, 1, 2, y - 1, 2, m.W)
    .box(1, 0, 1, 2, 0, 2, m.P.base)
    .box(1, 3, 1, 2, 3, 2, m.band)
    .box(1, 6, 1, 2, 6, 2, m.band);
  vb.set(1, 1, 2, `${m.P.door}_door[facing=south,half=lower]`).set(
    1,
    2,
    2,
    `${m.P.door}_door[facing=south,half=upper]`,
  );
  vb.set(2, 5, 2, "iron_bars[east=true,west=true]").set(1, 5, 1, "iron_bars[east=true,west=true]");
  top(vb, m, 1, 1, 2, 2, y, op);
  return { M: vb.model(), o: -1 };
}

/* a gate n tiles long (2: the whole span is the passage, a lintel carried by the walls beside it; 3: a pylon at each end, the passage in the middle).
   The passage is four blocks high; the door leaves are separate, animated meshes */
export function gate(t, n) {
  const { P, W, dk, band, st } = mats(t),
    y = FORT_TOP.gate - 1,
    vb = model(n, y + 1, 1);
  if (n === 3)
    for (const x of [0, 2])
      vb.box(x, 0, 0, x, y - 1, 0, W)
        .set(x, 0, 0, P.base)
        .set(x, y - 1, 0, band);
  vb.box(0, y, 0, n - 1, y, 0, dk);
  if (n === 2) vb.set(0, y - 1, 0, stair(st, "west", "top")).set(1, y - 1, 0, stair(st, "east", "top"));
  return { M: vb.model(), o: -n / 2, oz: -0.5 };
}

/* the keep (2 x 2 tiles): the tallest tower of the walls, banded, with windows, its top at 12 */
export function keep(t) {
  const m = mats(t),
    y = FORT_TOP.keep - 1,
    vb = model(4, y + 8, 4);
  vb.box(1, 0, 1, 2, y - 1, 2, m.W)
    .box(1, 0, 1, 2, 0, 2, m.P.base)
    .box(1, 3, 1, 2, 3, 2, m.band)
    .box(1, 7, 1, 2, 7, 2, m.band);
  vb.set(1, 1, 2, "dark_oak_door[facing=south,half=lower]").set(1, 2, 2, "dark_oak_door[facing=south,half=upper]");
  for (const yy of [5, 9]) vb.set(2, yy, 2, "window[east=true,west=true]").set(1, yy, 1, "window[east=true,west=true]");
  top(vb, m, 1, 1, 2, 2, y, false);
  return { M: vb.model(), o: -1 };
}

/* the torch: a stone post with a fire basket on it */
export function torch() {
  const vb = model(1, 3, 1);
  vb.set(0, 0, 0, "stone_brick_wall").set(0, 1, 0, "stone_brick_wall").set(0, 2, 0, "brazier");
  return { M: vb.model(), o: -0.5 };
}
