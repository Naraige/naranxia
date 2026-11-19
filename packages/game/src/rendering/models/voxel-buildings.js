import { chimney, fenceLine, fenceRect, hall, model, palette, stall, tower, tree, well } from "./voxel-parts.js";
import forgeWood from "../../assets/builds/pixl-5.js";
import forgeStone from "../../assets/builds/pixl-5-gray.js";

/* ---- the buildings, drawn in blocks like Minecraft builds. One tile of the map is BPT blocks; a model fills its footprint (BSZ tiles) and is built at
   (BSZ * BPT) blocks square, 1 block of margin all round for roof overhangs and yard props. Each builder takes the tier (0 timber, 1 stone). ---- */
export const BPT = 4;

const sT = (n, f, h = "bottom", s = "straight") => `${n}[facing=${f},half=${h},shape=${s}]`;

/* houses come in three looks, chosen from the tile they stand on, so a village is not one house repeated */
const HOUSE_LOOK = [
  {},
  { st: "brick_stairs", sl: "brick_slab", wall: "birch_planks" },
  { st: "dark_oak_stairs", sl: "dark_oak_slab", wall: "oak_planks" },
];
function house(t, v = 0) {
  const P = palette(t),
    vb = model(12, 14, 12),
    L = t ? {} : HOUSE_LOOK[v % 3];
  hall(vb, P, 1, 2, 10, 9, L);
  chimney(vb, 9, 4, 1, 9, t ? "stone_bricks" : "bricks");
  vb.set(3, 1, 10, "barrel[facing=up]").set(9, 1, 10, "chest");
  vb.box(1, 1, 10, 1, 3, 10, P.fence).set(1, 4, 10, "lantern");
  return vb.model();
}

function farm(t) {
  const P = palette(t),
    vb = model(16, 12, 16);
  hall(vb, P, 1, 1, 8, 7, { wall: t ? "stone_bricks" : "red_terracotta" });
  vb.set(2, 1, 8, "hay_block").set(3, 1, 8, "hay_block").set(3, 2, 8, "hay_block").set(7, 1, 8, "barrel[facing=up]");
  const plot = (x0, z0, x1, z1, crop) => {
    vb.box(x0, 0, z0, x1, 0, z1, "soil");
    for (let x = x0; x <= x1; x++)
      for (let z = z0; z <= z1; z++) if ((x - x0) % 2 === 0) vb.set(x, 1, z, `crop_${crop}`);
    for (let z = z0; z <= z1; z++) if (z % 4 === 0) vb.set(x0 + 1, 0, z, "water");
  };
  plot(10, 1, 14, 6, "wheat");
  plot(10, 9, 14, 14, "green");
  plot(1, 10, 8, 14, "carrot");
  fenceRect(vb, P.fence, 9, 0, 15, 15, 1, (x, z) => z === 7 || z === 8 || (x === 9 && z > 8));
  vb.box(15, 1, 8, 15, 3, 8, P.fence)
    .set(15, 4, 8, "hay_block")
    .set(14, 3, 8, "hay_block")
    .set(16 - 1, 3, 8, "hay_block");
  return vb.model();
}

function storage(t) {
  const P = palette(t),
    vb = model(16, 13, 16);
  hall(vb, P, 1, 1, 11, 9, { fh: 5, alongX: true });
  vb.box(5, 2, 9, 7, 5, 9, "dark_oak_planks");
  vb.door(6, 2, 9, "south", "dark_oak");
  for (let i = 0; i < 4; i++)
    vb.set(13, 1 + (i > 1 ? 1 : 0), 2 + i * 2, "barrel[facing=up]").set(14, 1, 2 + i * 2, "chest");
  vb.box(12, 1, 11, 14, 2, 13, "oak_planks").box(13, 3, 12, 13, 3, 12, "oak_planks");
  vb.box(2, 1, 11, 8, 1, 12, "oak_log[axis=x]")
    .box(3, 2, 11, 7, 2, 12, "oak_log[axis=x]")
    .box(4, 3, 11, 6, 3, 12, "oak_log[axis=x]");
  return vb.model();
}

function barracks(t) {
  const P = palette(t),
    vb = model(24, 16, 24);
  hall(vb, P, 4, 2, 19, 9, { fh: 5, door: false });
  tower(vb, P, 1, 1, 4, 0, 11);
  tower(vb, P, 19, 1, 4, 0, 11);
  /* courtyard wall with a gate in the middle */
  vb.box(1, 0, 10, 22, 0, 22, "stone_bricks");
  vb.box(1, 1, 22, 22, 3, 22, P.base).box(1, 1, 10, 1, 3, 22, P.base).box(22, 1, 10, 22, 3, 22, P.base);
  vb.box(10, 1, 22, 13, 3, 22, 0).box(10, 4, 22, 13, 4, 22, P.log);
  vb.box(1, 4, 10, 1, 4, 22, P.log).box(22, 4, 10, 22, 4, 22, P.log).box(1, 4, 22, 22, 4, 22, P.log);
  vb.box(10, 1, 9, 13, 3, 9, 0).door(11, 1, 9, "south", "dark_oak").door(12, 1, 9, "south", "dark_oak");
  for (const x of [6, 10, 14, 18])
    vb.box(x, 1, 15, x, 2, 15, "spruce_fence")
      .set(x, 3, 15, "hay_block")
      .set(x - 1, 2, 15, "iron_bars");
  for (const x of [7, 16]) vb.set(x, 3, 10, "banner_red[facing=south]").set(x, 4, 10, "banner_red[facing=south]");
  vb.set(5, 1, 12, "barrel[facing=up]").set(18, 1, 12, "chest");
  return vb.model();
}

function academy(t) {
  const P = palette(t),
    vb = model(20, 22, 20);
  hall(vb, P, 1, 9, 18, 17, { fh: 4, alongX: true });
  const cy = tower(vb, P, 7, 2, 6, 0, 13, { slit: false });
  void cy;
  vb.hip(6, 1, 13, 8, 14, "prismarine_brick_stairs", "prismarine_bricks");
  for (const y of [4, 8, 11])
    for (const x of [9, 10]) vb.set(x, y, 8, "white_stained_glass_pane").set(x, y, 2, "white_stained_glass_pane");
  vb.set(9, 18, 4, "lantern");
  for (const x of [3, 5, 14, 16]) vb.set(x, 3, 18, "bookshelf");
  vb.set(2, 1, 18, "lantern").set(17, 1, 18, "lantern");
  return vb.model();
}

function market(t) {
  const P = palette(t),
    vb = model(20, 12, 20);
  vb.box(1, 0, 1, 18, 0, 18, "stone_bricks");
  hall(vb, P, 4, 1, 15, 6, { fh: 4 });
  well(vb, 9, 11);
  stall(vb, 1, 8, 4, 4, "red", "white");
  stall(vb, 14, 8, 4, 4, "blue", "white");
  stall(vb, 2, 14, 5, 4, "yellow", "white");
  stall(vb, 13, 14, 5, 4, "green", "white");
  vb.box(9, 1, 17, 9, 4, 17, P.fence).set(9, 5, 17, "banner_red[facing=south]");
  return vb.model();
}

function forester(t) {
  const P = palette(t),
    vb = model(16, 14, 16);
  hall(vb, P, 1, 2, 8, 8, { wall: "oak_planks" });
  vb.box(10, 1, 2, 14, 1, 3, "oak_log[axis=z]")
    .box(10, 2, 2, 14, 2, 3, "oak_log[axis=z]")
    .box(11, 3, 2, 13, 3, 3, "oak_log[axis=z]");
  vb.box(10, 1, 6, 13, 1, 6, "oak_log[axis=x]")
    .box(10, 1, 8, 13, 1, 8, "oak_log[axis=x]")
    .box(10, 1, 7, 13, 1, 7, "stripped_oak_log[axis=x]");
  tree(vb, 12, 12, 1, 5, "spruce_leaves", "spruce_log");
  tree(vb, 3, 13, 1, 4, "oak_leaves");
  tree(vb, 14, 10, 1, 5, "oak_leaves");
  vb.set(5, 1, 9, "campfire").set(6, 1, 10, "barrel[facing=up]");
  return vb.model();
}

function guild(t) {
  const P = palette(t),
    vb = model(20, 18, 20);
  hall(vb, P, 2, 2, 17, 14, { floors: 2, fh: 4, alongX: true });
  for (const x of [5, 14]) vb.set(x, 5, 15, "banner_yellow[facing=south]").set(x, 6, 15, "banner_yellow[facing=south]");
  vb.box(8, 4, 15, 11, 4, 16, P.trim);
  for (const x of [8, 11]) vb.box(x, 1, 16, x, 3, 16, P.fence);
  vb.set(8, 4, 17, P.fence).set(11, 4, 17, P.fence);
  vb.set(3, 1, 15, "barrel[facing=up]").set(16, 1, 15, "chest").set(9, 1, 17, "lantern").set(10, 1, 17, "lantern");
  return vb.model();
}

function observatory(t) {
  const P = palette(t),
    vb = model(16, 24, 16);
  vb.box(1, 0, 1, 14, 0, 14, "stone_bricks");
  tower(vb, P, 4, 4, 8, 0, 11, { slit: false });
  vb.hip(3, 3, 12, 12, 13, "cut_copper_stairs", "cut_copper");
  for (const y of [3, 7])
    for (const [x, z] of [
      [7, 12],
      [8, 12],
      [7, 3],
      [8, 3],
      [3, 7],
      [3, 8],
      [12, 7],
      [12, 8],
    ])
      vb.set(x, y, z, "white_stained_glass_pane");
  vb.box(12, 15, 12, 14, 17, 14, 0);
  for (let i = 0; i < 4; i++) vb.set(8 + i, 13 + i, 8 - 0, "iron_bars").set(8 + i, 13 + i, 9, "chain");
  return vb.model();
}

function granary(t) {
  const P = palette(t),
    vb = model(16, 14, 16);
  for (const x of [2, 6, 10, 13]) for (const z of [2, 6, 10, 13]) vb.box(x, 0, z, x, 2, z, P.post);
  vb.box(2, 3, 2, 13, 3, 13, "oak_planks");
  hall(vb, P, 2, 2, 13, 13, { y: 3, fh: 4, door: false, wall: "oak_planks" });
  vb.box(7, 4, 13, 8, 6, 13, "dark_oak_planks")
    .set(7, 4, 13, "dark_oak_door[facing=south,half=lower]")
    .set(7, 5, 13, "dark_oak_door[facing=south,half=upper]");
  for (let i = 0; i < 3; i++) vb.set(7, i, 14, sT("oak_stairs", "north")).set(8, i, 14, sT("oak_stairs", "north"));
  vb.set(6, 1, 14, "hay_block").set(10, 1, 14, "hay_block").set(10, 1, 15, "hay_block");
  return vb.model();
}

function bell(t) {
  const P = palette(t),
    vb = model(12, 18, 12);
  vb.box(1, 0, 1, 10, 0, 10, "stone_bricks");
  tower(vb, P, 3, 3, 5, 0, 8, { slit: true });
  for (const [x, z] of [
    [3, 3],
    [7, 3],
    [3, 7],
    [7, 7],
  ])
    vb.box(x, 10, z, x, 12, z, P.log);
  vb.set(5, 12, 5, "chain").set(5, 11, 5, "bell");
  vb.hip(2, 2, 8, 8, 13, P.st, P.sl.replace("_slab", "_block").replace("deepslate_tile_block", "deepslate_tiles"));
  vb.door(5, 1, 8, "south", "dark_oak");
  return vb.model();
}

function sanctuary(t) {
  const P = palette(t),
    vb = model(20, 24, 20);
  hall(vb, P, 5, 2, 14, 16, {
    fh: 7,
    alongX: false,
    door: false,
    win: false,
    wall: t ? "stone_bricks" : "white_terracotta".replace("white_terracotta", "stone_bricks"),
  });
  for (const z of [5, 8, 11, 14]) for (const x of [5, 14]) vb.box(x, 2, z, x, 5, z, "blue_stained_glass_pane");
  tower(vb, P, 7, 15, 5, 0, 12, { slit: false });
  vb.hip(6, 14, 12, 20, 13, P.st, P.sl.replace("_slab", "_block").replace("deepslate_tile_block", "deepslate_tiles"));
  vb.box(9, 19, 17, 9, 21, 17, "gold_block");
  vb.door(9, 1, 20, "south", "dark_oak");
  return vb.model();
}

function beacon(t) {
  const P = palette(t),
    vb = model(12, 20, 12);
  vb.box(1, 0, 1, 10, 0, 10, "stone_bricks");
  const cy = tower(vb, P, 3, 3, 5, 0, 12, { slit: true });
  vb.box(4, cy, 4, 6, cy, 6, "stone_bricks")
    .set(5, cy, 5, "campfire")
    .set(5, cy + 1, 5, "glowstone");
  vb.box(5, 1, 8, 5, 3, 8, 0);
  vb.door(5, 1, 8, "south", "dark_oak");
  return vb.model();
}

function orchard(t) {
  const P = palette(t),
    vb = model(20, 12, 20);
  for (const x of [4, 10, 16])
    for (const z of [4, 10, 16])
      tree(vb, x, z, 0, 3, (x + z) % 12 === 2 ? "cherry_leaves" : "azalea_leaves", "oak_log");
  fenceRect(vb, P.fence, 0, 0, 19, 19, 1, (x, z) => z === 19 && x >= 8 && x <= 11);
  vb.box(1, 0, 1, 18, 0, 1, "soil");
  vb.set(2, 1, 18, "barrel[facing=up]").set(17, 1, 18, "hay_block");
  void well;
  return vb.model();
}

function embassy(t) {
  const P = palette(t),
    vb = model(20, 20, 20);
  hall(vb, P, 2, 3, 17, 13, { fh: 5, alongX: true });
  for (let x = 3; x <= 16; x += 3) vb.box(x, 1, 15, x, 5, 15, "polished_andesite");
  vb.box(3, 6, 14, 16, 6, 15, P.log).hip(2, 14, 17, 16, 7, "polished_andesite_stairs", "polished_andesite");
  void tower;
  for (const [x, c] of [
    [4, "red"],
    [9, "blue"],
    [14, "yellow"],
  ])
    vb.set(x, 3, 14, `banner_${c}[facing=south]`).set(x, 4, 14, `banner_${c}[facing=south]`);
  for (const x of [1, 18])
    vb.box(x, 1, 17, x, 9, 17, P.fence).set(x, 8, 18, `banner_${x < 10 ? "red" : "blue"}[facing=south]`);
  vb.set(9, 1, 16, sT("polished_andesite_stairs", "north")).set(10, 1, 16, sT("polished_andesite_stairs", "north"));
  vb.door(9, 1, 13, "south", "dark_oak").door(10, 1, 13, "south", "dark_oak");
  return vb.model();
}

function warroom(t) {
  const P = palette(t),
    vb = model(20, 22, 20);
  vb.box(2, 0, 2, 17, 0, 17, "stone_bricks");
  vb.walls(2, 1, 2, 17, 5, 17, "stone_bricks");
  for (let i = 2; i <= 17; i += 2)
    for (const [x, z] of [
      [i, 2],
      [i, 17],
      [2, i],
      [17, i],
    ])
      vb.set(x, 6, z, "stone_bricks");
  vb.box(9, 1, 17, 10, 3, 17, 0).box(9, 4, 17, 10, 4, 17, "dark_oak_log");
  tower(vb, P, 7, 6, 6, 0, 11, { slit: true });
  vb.set(6, 1, 15, "campfire").set(13, 1, 15, "campfire");
  vb.box(4, 1, 4, 5, 1, 5, "oak_planks").set(4, 2, 4, "banner_black[facing=south]");
  for (const x of [8, 11]) vb.set(x, 3, 12, "banner_red[facing=south]");
  return vb.model();
}

function sappers(t) {
  const P = palette(t),
    vb = model(16, 14, 16);
  hall(vb, P, 1, 4, 9, 11, { fh: 4 });
  vb.box(10, 1, 5, 14, 1, 5, "spruce_fence").box(10, 6, 5, 14, 6, 5, "spruce_planks");
  for (const x of [10, 14]) vb.box(x, 1, 5, x, 6, 5, "spruce_fence").box(x, 1, 10, x, 6, 10, "spruce_fence");
  vb.box(10, 6, 5, 14, 6, 10, "spruce_slab[type=bottom]");
  vb.set(12, 5, 7, "chain")
    .set(12, 4, 7, "red_terracotta")
    .set(11, 1, 8, "red_terracotta")
    .set(13, 1, 8, "red_terracotta")
    .set(12, 2, 8, "red_terracotta");
  vb.set(2, 1, 12, "barrel[facing=up]").set(3, 1, 12, "chest").set(4, 1, 12, "barrel[facing=up]");
  void fenceLine;
  return vb.model();
}

/* the castle: a walled yard with a gatehouse on the south (+z, the door side), four corner towers and a keep with a tall donjon and the flagpole.
   20 x 20 blocks = the 5 x 5 tiles of the castle; the gate opening is 4 blocks wide at the middle of the south wall */
function castle(t) {
  const P = palette(t),
    vb = model(20, 26, 20),
    W = t ? "stone_bricks" : "spruce_planks";
  vb.box(0, 0, 0, 19, 0, 19, "stone_bricks");
  for (let x = 1; x < 19; x += 2) for (let z = 1; z < 19; z += 2) vb.set(x, 0, z, "cobblestone");
  /* curtain wall with crenels */
  vb.walls(0, 1, 0, 19, 5, 19, W);
  for (let i = 0; i < 20; i++) {
    vb.set(i, 6, 0, i % 2 ? 0 : W)
      .set(i, 6, 19, i % 2 ? 0 : W)
      .set(0, 6, i, i % 2 ? 0 : W)
      .set(19, 6, i, i % 2 ? 0 : W);
    vb.set(i, 5, 0, P.log).set(i, 5, 19, P.log).set(0, 5, i, P.log).set(19, 5, i, P.log);
  }
  /* corner towers and the two gatehouse towers */
  for (const [x, z, h] of [
    [0, 0, 10],
    [16, 0, 10],
    [0, 16, 10],
    [16, 16, 10],
    [5, 16, 8],
    [11, 16, 8],
  ])
    tower(vb, P, x, z, x === 5 || x === 11 ? 4 : 4, 0, h, { wall: W, slit: false });
  for (const [x, z] of [
    [1, 1],
    [17, 1],
    [1, 17],
    [17, 17],
  ])
    vb.set(x, 11, z, "lantern");
  /* the gate: an opening 4 wide through the front wall and the gatehouse, an arch of beams above */
  vb.box(8, 1, 16, 11, 5, 19, 0);
  vb.box(8, 6, 16, 11, 6, 19, P.log).box(8, 5, 19, 11, 5, 19, P.log);
  vb.set(7, 5, 20 - 1, "lantern").set(12, 5, 19, "lantern");
  for (const x of [8, 11]) vb.set(x, 4, 19, `iron_bars`);
  /* the keep: a hall between two turrets, a tall donjon behind its middle */
  hall(vb, P, 5, 4, 14, 12, { fh: 5, floors: 2, door: false, win: true, roof: false, wall: W });
  vb.box(5, 11, 4, 14, 11, 12, P.log);
  for (let i = 5; i <= 14; i++) for (const z of [4, 12]) if (i % 2) vb.set(i, 12, z, W);
  for (let z = 4; z <= 12; z++) for (const x of [5, 14]) if (z % 2 === 0) vb.set(x, 12, z, W);
  tower(vb, P, 7, 5, 6, 11, 7, { wall: W, slit: false });
  vb.hip(6, 4, 13, 12, 19, t ? "deepslate_tile_stairs" : "spruce_stairs", t ? "deepslate_tiles" : "spruce_planks");
  vb.box(9, 20, 8, 9, 24, 8, "spruce_fence");
  for (const x of [7, 12]) vb.set(x, 6, 13, "banner_blue[facing=south]").set(x, 7, 13, "banner_blue[facing=south]");
  vb.set(9, 4, 13, "dark_oak_door[facing=south,half=lower]").set(9, 5, 13, "dark_oak_door[facing=south,half=upper]");
  for (const [x, z] of [
    [2, 6],
    [3, 8],
    [16, 7],
    [17, 9],
    [6, 15],
    [13, 15],
  ])
    vb.set(x, 1, z, "barrel[facing=up]");
  vb.box(1, 1, 12, 2, 1, 13, "hay_block").box(17, 1, 12, 17, 2, 13, "oak_planks");
  return vb.model();
}

const FORGE_OFS = { ox: 0, oz: 1 };
const forge = (t) => (t ? forgeStone : forgeWood);

/* type -> { sz: tiles per side, make(tier) -> model, ox, oz: block offset inside the footprint } */
export const VOXB = {
  castle: { sz: 5, make: castle, flag: { x: 2.5, y: 6.5, z: 2.1 } },
  house: { sz: 3, make: house, variants: 3 },
  farm: { sz: 4, make: farm },
  storage: { sz: 4, make: storage },
  barracks: { sz: 6, make: (t) => barracks(t) },
  academy: { sz: 5, make: academy },
  market: { sz: 5, make: market },
  forester: { sz: 4, make: forester },
  guild: { sz: 5, make: guild },
  observatory: { sz: 4, make: observatory },
  granary: { sz: 4, make: granary },
  bell: { sz: 3, make: bell },
  sanctuary: { sz: 5, make: sanctuary },
  beacon: { sz: 3, make: beacon },
  orchard: { sz: 5, make: orchard },
  embassy: { sz: 5, make: embassy },
  warroom: { sz: 5, make: warroom },
  sappers: { sz: 4, make: sappers },
  forge: { sz: 6, make: forge, ...FORGE_OFS },
};
