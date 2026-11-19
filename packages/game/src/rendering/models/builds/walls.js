import { banner, model, palette, roundParapet, roundTower, stair, tower } from "../voxel-kit.js";

/* ---- fortifications in blocks: walls that join their neighbours, towers of one and four tiles, gates, the keep, the torch.
   The heights are those the game already uses for the men on top (wall walk 1.5 tiles = 6 blocks, tower 3.25 = 13, great tower 3.5 = 14, keep 3.75 = 15, gate 2.1 / 2.75).
   Models are larger than their tiles where a parapet or a corner piece overhangs: `o` is the offset of the model's first block from the middle (1-tile pieces, gates)
   or from the corner (2-tile pieces) of the footprint. ---- */
const mats = (t) => {
  const P = palette(t);
  return {
    P,
    W: P.t ? P.wall : "spruce_log",
    dk: P.t ? "stone_bricks" : "spruce_planks",
    band: P.t ? "polished_andesite" : "dark_oak_log",
  };
};
const DIR = [
  [1, 0, -1, "north"],
  [2, 1, 0, "east"],
  [4, 0, 1, "south"],
  [8, -1, 0, "west"],
];

/* a wall piece. m: neighbours (1 north, 2 east, 4 south, 8 west), 16 / 32: a wall touches only by the south-east / south-west corner, which gets a filler.
   A two-block body, a deck the full width of the tile on corbels, merlons on the sides that face out */
export function wall(t, m) {
  const { P, W, dk, band } = mats(t),
    vb = model(6, 9, 6),
    body = new Set(),
    add = (x, z) => body.add(x + "," + z),
    has = (x, z) => body.has(x + "," + z);
  for (const x of [2, 3]) for (const z of [2, 3]) add(x, z);
  if (m & 1) (add(2, 1), add(3, 1));
  if (m & 4) (add(2, 4), add(3, 4));
  if (m & 2) (add(4, 2), add(4, 3));
  if (m & 8) (add(1, 2), add(1, 3));
  const fill = [];
  if (m & 16) for (const x of [4, 5]) for (const z of [4, 5]) fill.push([x, z]);
  if (m & 32) for (const x of [0, 1]) for (const z of [4, 5]) fill.push([x, z]);
  for (const k of body) {
    const [x, z] = k.split(",").map(Number);
    vb.box(x, 0, z, x, 4, z, W).set(x, 0, z, P.base).set(x, 3, z, band);
  }
  for (const [x, z] of fill) vb.box(x, 0, z, x, 5, z, W).set(x, 0, z, P.base).set(x, 3, z, band);
  for (let x = 1; x <= 4; x++)
    for (let z = 1; z <= 4; z++) {
      vb.set(x, 5, z, dk);
      if (has(x, z)) continue;
      for (const [, dx, dz, f] of DIR)
        if (has(x + dx, z + dz)) {
          vb.set(x, 4, z, stair(P.t ? "stone_brick_stairs" : "spruce_stairs", f, "top"));
          break;
        }
    }
  const mer = P.t ? "stone_bricks" : "spruce_log";
  for (let i = 1; i <= 4; i += 2) {
    if (!(m & 1)) vb.set(i, 6, 1, mer);
    if (!(m & 4)) vb.set(i, 6, 4, mer);
    if (!(m & 8)) vb.set(1, 6, i, mer);
    if (!(m & 2)) vb.set(4, 6, i, mer);
  }
  for (const [x, z] of fill) if ((x + z) % 2 === 0) vb.set(x, 6, z, mer);
  return { M: vb.model(), o: -3 };
}

/* a one-tile tower: a square shaft, a corbelled fighting top; without an engine on it (op false) a pointed roof stands on posts over the watch */
export function tower1(t, op) {
  const { P, dk } = mats(t),
    vb = model(6, 22, 6),
    wy = tower(vb, P, 1, 1, 4, 0, 12, { wall: P.t ? P.wall : "spruce_planks", cb: dk });
  vb.set(2, 1, 4, `${P.door}_door[facing=south,half=lower]`).set(2, 2, 4, `${P.door}_door[facing=south,half=upper]`);
  vb.walls(1, 6, 1, 4, 6, 4, P.t ? "polished_andesite" : "dark_oak_log");
  if (!op) {
    for (const x of [0, 5]) for (const z of [0, 5]) vb.box(x, wy + 1, z, x, wy + 2, z, P.t ? "stone_bricks" : P.post);
    const top = vb.spire({ x0: 0, z0: 0, x1: 5, z1: 5, y: wy + 3, m: P.roof, prof: [1, 1, 2] });
    vb.set(2, top + 1, 2, P.fence);
  }
  return { M: vb.model(), o: -3 };
}

/* the great tower (2 x 2 tiles): round in stone under a cone, square in timber; its fighting top is at 14 blocks (stone) or 12.5 (timber) */
export function tower2(t, op) {
  const { P, dk } = mats(t),
    vb = model(10, 26, 10);
  if (P.t) {
    roundTower(vb, P, 5, 5, 4.2, 0, 12, { band: [4, 8, 12] });
    roundParapet(vb, P, 5, 5, 4.2, 13, dk);
    vb.set(4, 1, 8, "dark_oak_door[facing=south,half=lower]").set(4, 2, 8, "dark_oak_door[facing=south,half=upper]");
    vb.set(5, 1, 8, "dark_oak_door[facing=south,half=lower]").set(5, 2, 8, "dark_oak_door[facing=south,half=upper]");
    if (!op) {
      for (const [x, z] of [
        [2, 2],
        [7, 2],
        [2, 7],
        [7, 7],
      ])
        vb.box(x, 14, z, x, 16, z, "polished_andesite");
      const top = vb.cone(5, 5, 4.2, 17, P.roof, 2, 1.4);
      vb.set(4, top + 1, 4, P.fence);
    }
  } else {
    const wy = tower(vb, P, 1, 1, 8, 0, 11, { wall: "spruce_planks", cb: dk });
    vb.box(1, wy, 1, 8, wy, 8, "spruce_slab[type=bottom]");
    for (const y of [4, 8]) vb.walls(1, y, 1, 8, y, 8, "dark_oak_log");
    vb.set(4, 1, 8, "spruce_door[facing=south,half=lower]").set(4, 2, 8, "spruce_door[facing=south,half=upper]");
    if (!op) {
      for (const x of [0, 9]) for (const z of [0, 9]) vb.box(x, wy + 1, z, x, wy + 3, z, P.post);
      const top = vb.spire({ x0: 0, z0: 0, x1: 9, z1: 9, y: wy + 4, m: P.roof, prof: [1, 1, 1, 2] });
      vb.set(4, top + 1, 4, P.fence);
    }
  }
  return { M: vb.model(), o: -1 };
}

/* a gate: two pylons and a lintel over a passage one tile wide (the door leaves are separate, animated meshes). n: its length in tiles (2 or 3) */
export function gate(t, n) {
  const { P, W, dk, band } = mats(t),
    big = n === 3,
    w = big ? 12 : 8,
    pw = big ? 4 : 2,
    H = big && P.t ? 10 : 7,
    vb = model(w, H + 4, 6),
    ast = P.t ? "stone_brick_stairs" : "spruce_stairs";
  for (const x0 of [0, w - pw]) {
    vb.box(x0, 0, 1, x0 + pw - 1, H, 4, W).box(x0, 0, 1, x0 + pw - 1, 0, 4, P.base);
    vb.box(x0, 4, 1, x0 + pw - 1, 4, 4, band);
    if (P.t) for (const x of [x0, x0 + pw - 1]) for (const z of [1, 4]) vb.box(x, 1, z, x, H, z, "polished_andesite");
  }
  vb.box(pw, 6, 1, w - pw - 1, H, 4, W);
  for (let z = 1; z <= 4; z++)
    vb.set(pw, 5, z, stair(ast, "west", "top")).set(w - pw - 1, 5, z, stair(ast, "east", "top"));
  /* fighting top: a deck half a block up on a 2-tile gate (2.1 tiles), merlons front and back on corbels */
  for (let x = 0; x < w; x++) {
    for (const [z, f] of [
      [0, "south"],
      [5, "north"],
    ]) {
      vb.set(x, H, z, stair(ast, f, "top"));
      vb.set(x, H + 1, z, dk);
      if (x % 2 === 0) vb.set(x, H + 2, z, dk);
    }
    if (!big || !P.t)
      for (let z = 1; z <= 4; z++) vb.set(x, H + 1, z, (P.t ? "stone_brick_slab" : "spruce_slab") + "[type=bottom]");
  }
  if (big) {
    for (const x of [1, 2, w - 3, w - 2]) for (const z of [1, 4]) vb.set(x, 6, z, "iron_bars[east=true,west=true]");
    for (const x of [5, 6])
      vb.set(x, 8, 1, "iron_bars[east=true,west=true]").set(x, 8, 4, "iron_bars[east=true,west=true]");
  }
  vb.set(pw - 1, 3, 5, "lantern[hanging=true]").set(w - pw, 3, 5, "lantern[hanging=true]");
  vb.set(pw - 1, 3, 0, "lantern[hanging=true]").set(w - pw, 3, 0, "lantern[hanging=true]");
  return { M: vb.model(), o: -w / 2, oz: -3 };
}

/* the keep (2 x 2 tiles): a great square tower on a battered foot, a turret with a pointed cap on one corner; the garrison stands at 15 blocks */
export function keep(t) {
  const { P, dk } = mats(t),
    vb = model(10, 26, 10),
    bst = P.t ? "stone_brick_stairs" : "cobblestone_stairs",
    wy = tower(vb, P, 1, 1, 8, 0, 14, { wall: P.t ? P.wall : P.fill, cb: dk });
  for (let i = 1; i <= 8; i++) {
    vb.set(i, 0, 0, stair(bst, "south"))
      .set(i, 0, 9, stair(bst, "north"))
      .set(0, 0, i, stair(bst, "east"))
      .set(9, 0, i, stair(bst, "west"));
  }
  for (const y of [5, 10]) vb.walls(1, y, 1, 8, y, 8, P.t ? "polished_andesite" : "dark_oak_log");
  for (const y of [7, 8, 12]) {
    for (const c of [3, 6]) {
      vb.set(c, y, 8, "window[east=true,west=true]").set(c, y, 1, "window[east=true,west=true]");
      vb.set(1, y, c, "window[north=true,south=true]").set(8, y, c, "window[north=true,south=true]");
    }
  }
  vb.box(4, 1, 8, 5, 3, 8, P.t ? "polished_andesite" : P.post);
  for (const x of [4, 5])
    vb.set(x, 1, 8, "dark_oak_door[facing=south,half=lower]").set(x, 2, 8, "dark_oak_door[facing=south,half=upper]");
  banner(vb, 3, 4, 9, "south", "red");
  banner(vb, 6, 4, 9, "south", "red");
  /* corner turret */
  vb.box(7, wy, 1, 8, wy + 4, 2, P.t ? P.wall : "spruce_planks");
  vb.set(7, wy + 2, 2, "iron_bars[east=true,west=true]");
  const top = vb.spire({ x0: 6, z0: 0, x1: 9, z1: 3, y: wy + 5, m: P.roof, prof: [1, 2] });
  vb.set(7, top + 1, 1, P.fence);
  return { M: vb.model(), o: -1 };
}

/* the torch: a stone post carrying an iron basket of fire */
export function torch() {
  const vb = model(3, 7, 3);
  vb.set(1, 0, 1, "stone_bricks")
    .set(1, 1, 1, "stone_brick_wall")
    .set(1, 2, 1, "stone_brick_wall")
    .set(1, 3, 1, "stone_brick_wall");
  vb.set(1, 4, 1, "cauldron").set(1, 5, 1, "fire");
  for (const [x, z, f] of [
    [0, 1, "east"],
    [2, 1, "west"],
    [1, 0, "south"],
    [1, 2, "north"],
  ])
    vb.set(x, 0, z, stair("stone_brick_stairs", f));
  return { M: vb.model(), o: -1.5 };
}
