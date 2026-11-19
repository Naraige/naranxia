import {
  banner,
  bush,
  chimney,
  doorway,
  dummy,
  fenceLine,
  flagPole,
  footing,
  gabled,
  lampPost,
  logPile,
  model,
  palette,
  plaza,
  roundParapet,
  roundTower,
  stair,
  storey,
  tower,
  well,
  windows,
} from "../voxel-kit.js";

/* ---- the buildings of war: barracks, war room, sappers' yard, beacon, and the castle ---- */

/* the barracks: a long hall with dormers closing the north of a walled drill yard: dummies, archery butts, an armoury shelter, a watchtower over the gate side */
export function barracks(t) {
  const P = palette(t, "red", true),
    vb = model(24, 22, 24);
  for (let x = 1; x <= 22; x++) for (let z = 8; z <= 22; z++) vb.set(x, 0, z, "path");
  plaza(vb, 9, 8, 14, 10);
  /* the yard wall: a palisade of logs, or stone with merlons */
  const per = (x, z) => {
    if (z === 23 && x >= 10 && x <= 13) return;
    if (P.t) {
      vb.box(x, 0, z, x, 2, z, P.wall);
      if ((x + z) % 2 === 0) vb.set(x, 3, z, "stone_bricks");
    } else vb.box(x, 0, z, x, (x + z) % 2 ? 2 : 3, z, "spruce_log");
  };
  for (let i = 0; i <= 23; i++) per(i, 23);
  for (let z = 8; z <= 22; z++) {
    per(0, z);
    per(23, z);
  }
  per(1, 8);
  per(22, 8);
  /* gate */
  for (const x of [9, 14]) vb.box(x, 0, 23, x, 5, 23, P.t ? "stone_bricks" : P.post);
  vb.box(10, 5, 23, 13, 5, 23, P.bx);
  vb.set(9, 6, 23, "lantern").set(14, 6, 23, "lantern");
  banner(vb, 11, 4, 23, "south", "red");
  banner(vb, 12, 4, 23, "south", "red");
  /* the hall */
  footing(vb, P, 2, 1, 21, 7);
  storey(vb, P, 2, 1, 21, 7, 1, 5, { fill: P.t ? P.wall : P.fill, xs: [2, 5, 8, 10, 13, 15, 18, 21], zs: [1, 4, 7] });
  gabled(vb, P, 2, 1, 21, 7, 5, { alongX: true, win: 2 });
  for (const x of [4, 10, 16]) {
    const w = x === 10 ? 3 : 2;
    vb.box(x, 7, 6, x + w, 8, 7, P.fill);
    vb.box(x, 7, 7, x, 8, 7, P.post).box(x + w, 7, 7, x + w, 8, 7, P.post);
    for (let i = 1; i < w; i++) vb.set(x + i, 8, 7, "window[east=true,west=true]");
    vb.roof({
      x0: x - 1,
      x1: x + w + 1,
      z0: 4,
      z1: 8,
      y: 8,
      alongX: false,
      m: P.roof,
      t: P.trim,
      prof: [1],
      end: 1,
      fill: () => P.post,
    });
  }
  doorway(vb, P, "south", 7, 11, 1, { wide: true, wood: "dark_oak", lantern: false });
  windows(vb, P, "south", 7, [3, 6, 16, 19], 2, 2, { sill: false });
  windows(vb, P, "north", 1, [3, 6, 11, 16, 19], 2, 2, { sill: false });
  banner(vb, 9, 4, 8, "south", "red");
  banner(vb, 14, 4, 8, "south", "red");
  vb.set(10, 3, 8, "lantern[hanging=true]").set(13, 3, 8, "lantern[hanging=true]");
  chimney(vb, P, 22, 4, 0, 12);
  chimney(vb, P, 1, 4, 0, 12);
  /* watchtower */
  const wy = tower(vb, P, 18, 18, 5, 0, 9, { wall: P.t ? P.wall : "spruce_planks" });
  for (const [x, z] of [
    [18, 18],
    [22, 18],
    [18, 22],
    [22, 22],
  ])
    vb.box(x, wy + 1, z, x, wy + 3, z, P.post);
  const top = vb.spire({ x0: 17, z0: 17, x1: 23, z1: 23, y: wy + 4, m: P.roof, prof: [1, 2] });
  flagPole(vb, P, 20, 20, top + 1, 3, "red");
  vb.set(18, 1, 20, `${P.door}_door[facing=west,half=lower]`).set(18, 2, 20, `${P.door}_door[facing=west,half=upper]`);
  /* armoury shelter on the west wall */
  for (const z of [11, 14, 17]) vb.box(4, 0, z, 4, 2, z, P.fence);
  vb.shed({ x0: 1, x1: 4, z0: 10, z1: 18, y: 3, dir: "east", m: P.roof, t: P.trim });
  for (const z of [11, 12, 13]) vb.set(1, 0, z, P.fence).set(1, 1, z, "iron_bars[north=true,south=true]");
  vb.set(1, 0, 15, "chest")
    .set(1, 0, 16, "barrel[facing=up]")
    .set(2, 0, 16, "barrel[facing=up]")
    .set(1, 1, 16, "barrel[facing=up]")
    .set(1, 0, 17, "iron_block");
  /* drill ground */
  for (const x of [8, 11, 14]) dummy(vb, P, x, 13);
  vb.box(22, 0, 10, 22, 1, 14, "hay_block")
    .set(21, 1, 11, "target")
    .set(21, 0, 11, P.fence)
    .set(21, 1, 13, "target")
    .set(21, 0, 13, P.fence);
  fenceLine(vb, P.fence, 16, 10, 16, 14);
  vb.set(11, 0, 18, "campfire")
    .set(10, 0, 19, "spruce_log[axis=x]")
    .set(12, 0, 19, "spruce_log[axis=x]")
    .set(9, 0, 17, "spruce_log[axis=z]");
  /* a tent */
  for (let z = 17; z <= 20; z++) vb.set(5, 0, z, "white_wool").set(7, 0, z, "white_wool").set(6, 1, z, "red_wool");
  vb.set(6, 0, 17, "white_wool");
  vb.set(14, 0, 20, "crate").set(15, 0, 20, "barrel[facing=up]").set(14, 0, 21, "sack");
  return vb.model();
}

/* the war room: a squat keep with a battered foot, corner turrets (two capped, two flying flags), black and red banners, a command tent and the map table outside */
export function warroom(t) {
  const P = palette(t, "slate"),
    vb = model(20, 24, 20),
    W = P.t ? P.wall : "spruce_planks",
    bst = P.t ? "stone_brick_stairs" : "cobblestone_stairs";
  plaza(vb, 1, 14, 18, 19, "paving_dark", "paving");
  for (let x = 4; x <= 15; x++) vb.set(x, 0, 2, stair(bst, "south")).set(x, 0, 13, stair(bst, "north"));
  for (let z = 3; z <= 12; z++) vb.set(3, 0, z, stair(bst, "east")).set(16, 0, z, stair(bst, "west"));
  const wy = tower(vb, P, 4, 3, 12, 0, 9, { l: 10, wall: W, slit: false });
  for (const y of [3, 6]) vb.walls(4, y, 3, 15, y, 12, P.t ? "polished_andesite" : P.bx);
  /* corner turrets */
  for (const [x, z, cap] of [
    [3, 2, 1],
    [14, 2, 1],
    [3, 11, 0],
    [14, 11, 0],
  ]) {
    const ty = tower(vb, P, x, z, 3, 0, 12, { wall: W, slit: false });
    if (cap) {
      const tp = vb.spire({ x0: x - 1, z0: z - 1, x1: x + 3, z1: z + 3, y: ty + 2, m: P.roof, prof: [1, 2] });
      vb.set(x + 1, tp + 1, z + 1, P.fence);
    } else flagPole(vb, P, x + 1, z + 1, ty, 4, x < 10 ? "black" : "red");
  }
  /* the hall roof inside the parapet */
  vb.spire({ x0: 5, z0: 4, x1: 14, z1: 11, y: wy, m: P.roof, prof: [1] });
  /* gate */
  vb.box(8, 1, 12, 11, 4, 12, P.t ? "polished_andesite" : P.post);
  vb.box(9, 1, 12, 10, 3, 12, "dark_oak_planks");
  for (const x of [9, 10])
    vb.set(x, 1, 12, "dark_oak_door[facing=south,half=lower]").set(x, 2, 12, "dark_oak_door[facing=south,half=upper]");
  for (let x = 8; x <= 11; x++) vb.set(x, 0, 13, stair(bst, "north")).set(x, 0, 12, P.base);
  banner(vb, 7, 8, 13, "south", "black");
  banner(vb, 12, 8, 13, "south", "red");
  for (const x of [6, 13])
    vb.set(x, 5, 12, "iron_bars[east=true,west=true]").set(x, 7, 12, "iron_bars[east=true,west=true]");
  for (const z of [5, 8, 10])
    for (const y of [5, 7])
      vb.set(4, y, z, "iron_bars[north=true,south=true]").set(15, y, z, "iron_bars[north=true,south=true]");
  for (const x of [7, 12]) vb.set(x, 0, 14, P.wallb).set(x, 1, 14, "campfire");
  /* command tent */
  for (let z = 15; z <= 18; z++) {
    vb.set(2, 0, z, "red_wool")
      .set(6, 0, z, "red_wool")
      .set(3, 1, z, "white_wool")
      .set(5, 1, z, "white_wool")
      .set(4, 2, z, "red_wool");
  }
  vb.set(3, 0, 15, "white_wool").set(4, 0, 15, "white_wool").set(5, 0, 15, "white_wool").set(4, 1, 15, "white_wool");
  /* map table, stools, weapon rack */
  vb.box(13, 0, 16, 15, 0, 17, "dark_oak_planks")
    .set(13, 1, 16, "white_carpet")
    .set(14, 1, 16, "white_carpet")
    .set(14, 1, 17, "white_carpet")
    .set(15, 1, 17, "red_carpet");
  vb.set(12, 0, 17, stair(P.wst, "east")).set(16, 0, 16, stair(P.wst, "west")).set(14, 0, 18, stair(P.wst, "north"));
  for (const x of [9, 10, 11]) vb.set(x, 0, 18, P.fence).set(x, 1, 18, "iron_bars[east=true,west=true]");
  lampPost(vb, P, 1, 19);
  lampPost(vb, P, 18, 19);
  return vb.model();
}

/* the sappers' yard: a workshop with a hot chimney, an open shed over the benches, a battering ram on its frame, powder kegs and the timbered mouth of a mine */
export function sappers(t) {
  const P = palette(t, "slate"),
    vb = model(16, 16, 16);
  for (let x = 1; x <= 14; x++) for (let z = 7; z <= 14; z++) vb.set(x, 0, z, "path");
  footing(vb, P, 1, 1, 7, 6);
  storey(vb, P, 1, 1, 7, 6, 1, 4, { fill: P.t ? P.wall : P.fill, xs: [1, 4, 7], zs: [1, 6] });
  gabled(vb, P, 1, 1, 7, 6, 4, { alongX: true });
  doorway(vb, P, "south", 6, 3, 1, { lantern: false });
  windows(vb, P, "south", 6, [5], 2, 2, { wide: false });
  windows(vb, P, "west", 1, [3], 2, 2, { wide: true, sill: false });
  vb.box(8, 0, 2, 8, 11, 3, P.brick);
  vb.set(8, 12, 2, P.wallb).set(8, 12, 3, P.wallb);
  vb.set(2, 3, 7, "lantern[hanging=true]");
  /* open shed */
  for (const [x, z] of [
    [9, 5],
    [12, 5],
    [15, 5],
    [15, 1],
    [12, 1],
  ])
    vb.box(x, 0, z, x, 3, z, P.post);
  vb.roof({ x0: 9, x1: 15, z0: 0, z1: 6, y: 3, alongX: true, m: P.roof, t: P.trim, prof: [1], end: 0 });
  vb.set(10, 0, 2, "crafting_table")
    .set(11, 0, 2, "anvil")
    .set(13, 0, 2, "grindstone")
    .set(14, 0, 2, "barrel[facing=up]")
    .set(14, 0, 3, "crate");
  vb.box(10, 0, 4, 11, 0, 4, "spruce_planks").set(10, 1, 4, "spruce_slab[type=bottom]");
  /* battering ram on its frame */
  for (const x of [1, 6]) {
    for (const z of [9, 11]) vb.box(x, 0, z, x, 2, z, P.fence);
    vb.box(x, 3, 9, x, 3, 11, P.bz);
    vb.set(x, 2, 10, "chain");
  }
  vb.box(0, 1, 10, 7, 1, 10, "dark_oak_log[axis=x]").set(8, 1, 10, "iron_block");
  /* powder kegs and planks */
  vb.set(2, 0, 13, "red_terracotta")
    .set(3, 0, 13, "red_terracotta")
    .set(2, 1, 13, "red_terracotta")
    .set(4, 0, 14, "red_terracotta")
    .set(1, 0, 14, "barrel[facing=up]");
  logPile(vb, 5, 13, 3, "x", "spruce_log");
  /* the mine */
  const rock = ["cobblestone", "stone", "andesite", "gravel", "mossy_cobblestone"];
  vb.box(10, 0, 9, 15, 0, 14, rock)
    .box(10, 1, 10, 15, 1, 14, rock)
    .box(11, 2, 10, 15, 2, 13, rock)
    .box(12, 3, 11, 14, 3, 12, rock);
  vb.box(12, 0, 13, 13, 1, 15, 0);
  vb.box(12, 0, 12, 13, 1, 12, "coal_block");
  for (const x of [11, 14]) vb.box(x, 0, 14, x, 1, 14, P.post);
  vb.box(11, 2, 14, 14, 2, 14, P.bx);
  vb.set(12, 0, 15, "path").set(13, 0, 15, "path").set(13, 0, 14, "cauldron").set(14, 2, 15, "lantern[hanging=true]");
  vb.set(9, 0, 12, "gravel").set(9, 0, 11, "gravel").set(9, 1, 12, "gravel").set(9, 0, 13, "cobblestone");
  bush(vb, 15, 8, 0, "oak_leaves");
  return vb.model();
}

/* the beacon: a round stone tower, a parapet, and the signal fire in an open lantern under a pointed roof */
export function beacon(t) {
  const P = palette(t, "slate"),
    vb = model(12, 28, 12),
    W = P.t ? P.wall : ["cobblestone", "cobblestone", "andesite", "stone"];
  plaza(vb, 2, 9, 9, 11);
  roundTower(vb, P, 6, 6, 3.2, 0, 13, { band: [5, 10], wall: W, bandB: P.t ? "polished_andesite" : "spruce_planks" });
  roundParapet(vb, P, 6, 6, 3.2, 14, "stone_bricks");
  for (const [x, z] of [
    [4, 4],
    [7, 4],
    [4, 7],
    [7, 7],
  ])
    vb.box(x, 15, z, x, 18, z, P.t ? "polished_andesite" : P.post);
  vb.box(5, 15, 5, 6, 15, 6, "stone_bricks")
    .box(5, 16, 5, 6, 16, 6, "lava")
    .set(5, 17, 5, "glowstone")
    .set(6, 17, 6, "glowstone");
  const top = vb.cone(6, 6, 2.9, 19, P.roof, 2, 1);
  vb.set(5, top + 1, 5, P.fence);
  vb.set(5, 1, 8, "dark_oak_door[facing=south,half=lower]").set(5, 2, 8, "dark_oak_door[facing=south,half=upper]");
  vb.set(6, 1, 8, "dark_oak_door[facing=south,half=lower]").set(6, 2, 8, "dark_oak_door[facing=south,half=upper]");
  vb.set(5, 3, 8, "polished_andesite").set(6, 3, 8, "polished_andesite");
  vb.set(5, 0, 9, stair("stone_brick_stairs", "north")).set(6, 0, 9, stair("stone_brick_stairs", "north"));
  vb.set(4, 3, 9, "lantern[hanging=true]");
  /* fuel */
  logPile(vb, 9, 9, 3, "x", "spruce_log");
  logPile(vb, 0, 7, 3, "z", "oak_log");
  vb.set(1, 0, 10, "barrel[facing=up]")
    .set(10, 0, 3, "coal_block")
    .set(10, 0, 4, "coal_block")
    .set(10, 1, 3, "coal_block");
  bush(vb, 1, 2, 0, "oak_leaves");
  return vb.model();
}

/* the castle: a curtain wall between four round towers under pointed roofs, a gatehouse on the south (the gate is 4 blocks wide in the middle),
   and a tall keep with a stair turret; the flag flies from the pole on the keep roof (CASTLE_FLAG, in tiles) */
export const CASTLE_FLAG = { x: 2.375, y: 6.2, z: 2.125 };
export function castle(t) {
  const P = palette(t, "blue", true),
    vb = model(20, 26, 20),
    W = P.t ? P.wall : "spruce_log",
    cb = P.t ? "stone_bricks" : "spruce_planks",
    KW = P.t ? P.wall : P.fill;
  plaza(vb, 3, 3, 16, 16);
  /* curtain */
  vb.walls(2, 0, 2, 17, 5, 17, W);
  vb.walls(2, 0, 2, 17, 0, 17, P.base);
  for (let i = 2; i <= 17; i++) {
    if (i % 2 === 0) vb.set(i, 6, 2, cb).set(i, 6, 17, cb).set(2, 6, i, cb).set(17, 6, i, cb);
    if (P.t)
      vb.set(i, 5, 2, "polished_andesite")
        .set(i, 5, 17, "polished_andesite")
        .set(2, 5, i, "polished_andesite")
        .set(17, 5, i, "polished_andesite");
  }
  /* corner towers */
  for (const [cx, cz] of [
    [3.5, 3.5],
    [16.5, 3.5],
    [3.5, 16.5],
    [16.5, 16.5],
  ]) {
    roundTower(vb, P, cx, cz, 2.6, 0, 10, { wall: W, band: P.t ? [10] : [] });
    vb.disc(cx, cz, 3.6, 11, cb);
    vb.disc(cx, cz, 3.6, 12, cb, 2.55);
    for (const [dx, dz] of [
      [0, 3],
      [0, -3],
      [3, 0],
      [-3, 0],
    ])
      vb.set(Math.floor(cx) + dx, 12, Math.floor(cz) + dz, "iron_bars");
    const tp = vb.cone(cx, cz, 3.0, 13, P.roof, 2, 1);
    vb.set(Math.floor(cx), tp + 1, Math.floor(cz), P.fence);
  }
  /* gatehouse */
  for (const x of [5, 12]) tower(vb, P, x, 15, 3, 0, 8, { l: 4, wall: W, slit: false, cb });
  vb.box(8, 5, 15, 11, 8, 18, W);
  vb.box(8, 0, 15, 11, 4, 18, 0);
  vb.box(8, 9, 15, 11, 9, 18, cb);
  for (const x of [8, 11]) vb.set(x, 10, 18, cb).set(x, 10, 15, cb);
  const ast = P.t ? "stone_brick_stairs" : "spruce_stairs";
  vb.set(8, 4, 18, stair(ast, "west", "top")).set(11, 4, 18, stair(ast, "east", "top"));
  for (let x = 8; x <= 11; x++)
    vb.set(x, 4, 16, "iron_bars[east=true,west=true]")
      .set(x, 0, 17, "paving")
      .set(x, 0, 18, "paving")
      .set(x, 0, 19, "paving");
  vb.set(9, 7, 18, "iron_bars[east=true,west=true]").set(10, 7, 18, "iron_bars[east=true,west=true]");
  banner(vb, 6, 7, 19, "south", "red");
  banner(vb, 13, 7, 19, "south", "red");
  vb.set(7, 3, 19, "lantern[hanging=true]").set(12, 3, 19, "lantern[hanging=true]");
  /* keep */
  const ky = tower(vb, P, 6, 4, 8, 0, 13, { wall: KW, cb });
  for (const y of [5, 9]) vb.walls(6, y, 4, 13, y, 11, P.t ? "polished_andesite" : P.bx);
  for (const y of [3, 7, 11])
    for (const x of [8, 11])
      vb.set(x, y, 11, "window[east=true,west=true]").set(x, y, 4, "window[east=true,west=true]");
  for (const y of [7, 11])
    for (const z of [6, 9])
      vb.set(6, y, z, "window[north=true,south=true]").set(13, y, z, "window[north=true,south=true]");
  vb.box(9, 1, 11, 10, 2, 11, 0);
  for (const x of [9, 10])
    vb.set(x, 1, 11, "dark_oak_door[facing=south,half=lower]")
      .set(x, 2, 11, "dark_oak_door[facing=south,half=upper]")
      .set(x, 0, 12, stair(P.t ? "stone_brick_stairs" : "cobblestone_stairs", "north"));
  banner(vb, 8, 5, 12, "south", "blue");
  banner(vb, 11, 5, 12, "south", "blue");
  const top = vb.spire({ x0: 6, z0: 4, x1: 13, z1: 11, y: ky, m: P.roof, prof: [1, 2, 2] });
  vb.box(9, top + 1, 8, 9, top + 4, 8, P.fence);
  /* stair turret on the keep's corner */
  roundTower(vb, P, 14.5, 4.5, 1.6, 0, 17, { wall: KW, slit: false });
  const tt = vb.cone(14.5, 4.5, 1.6, 18, P.roof, 2, 1);
  vb.set(14, tt + 1, 4, P.fence);
  /* courtyard */
  well(vb, P, 4, 9);
  for (const z of [9, 12]) vb.box(14, 0, z, 14, 2, z, P.fence);
  vb.shed({ x0: 14, x1: 16, z0: 8, z1: 13, y: 3, dir: "west", m: P.roof, t: P.trim });
  vb.set(16, 0, 9, "hay_block")
    .set(16, 0, 10, "hay_block")
    .set(16, 1, 9, "hay_block")
    .set(15, 0, 12, "barrel[facing=up]")
    .set(16, 0, 12, "crate");
  dummy(vb, P, 5, 13);
  vb.set(3, 0, 12, "barrel[facing=up]").set(3, 0, 6, "crate").set(4, 0, 6, "crate").set(3, 1, 6, "sack");
  lampPost(vb, P, 7, 13);
  lampPost(vb, P, 12, 13);
  return vb.model();
}
