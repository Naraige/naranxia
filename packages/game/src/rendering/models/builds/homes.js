import {
  ROOF,
  brackets,
  bush,
  chimney,
  doorway,
  fenceCells,
  fenceLine,
  fenceRect,
  footing,
  gabled,
  logPile,
  model,
  oak,
  palette,
  spruce,
  stair,
  storey,
  well,
  windows,
} from "../voxel-kit.js";

/* ---- homes and the working buildings of the village: houses (three looks), farm, storehouse, granary, forester's lodge, orchard ---- */

/* look 0: a cottage under a long flared roof, a gabled porch on the front, a chimney on the east gable */
function cottage(P) {
  const vb = model(12, 16, 12);
  footing(vb, P, 2, 2, 9, 7);
  storey(vb, P, 2, 2, 9, 7, 1, 4, { fill: P.t ? P.wall : P.fill, xs: [2, 6, 9] });
  windows(vb, P, "north", 2, [4, 7], 2, 2);
  windows(vb, P, "west", 2, [4], 2, 2, { wide: true, flower: "red" });
  windows(vb, P, "south", 7, [8], 2, 2, { flower: "yellow" });
  gabled(vb, P, 2, 2, 9, 7, 4, { alongX: true, win: 3 });
  /* porch */
  footing(vb, P, 3, 8, 6, 9);
  vb.box(3, 1, 8, 6, 3, 9, 0);
  storey(vb, P, 3, 7, 6, 9, 1, 3, { xs: [3, 6], zs: [9] });
  vb.box(4, 1, 7, 5, 3, 8, 0);
  gabled(vb, P, 3, 7, 6, 9, 3, {
    alongX: false,
    prof: [1, 1],
    end: 1,
    fill: (u) => (Math.abs(u) < 1 ? P.post : P.fill),
  });
  doorway(vb, P, "south", 9, 4, 1, { lantern: false });
  vb.set(5, 1, 9, P.fill).set(5, 2, 9, P.pane + "[east=true,west=true]");
  vb.set(6, 2, 10, "lantern[hanging=true]");
  chimney(vb, P, 10, 4, 0, 10);
  vb.set(10, 0, 5, P.brick).set(10, 1, 5, stair(P.t ? "stone_brick_stairs" : "brick_stairs", "north"));
  /* yard */
  vb.set(4, 0, 11, P.paving).set(4, 0, 10, P.paving);
  vb.set(8, 0, 9, "barrel[facing=up]");
  bush(vb, 2, 9, 0, "azalea_leaves", "pink");
  bush(vb, 1, 8, 0, "oak_leaves");
  logPile(vb, 10, 8, 3, "z", "spruce_log");
  fenceLine(vb, P.fence, 0, 11, 2, 11);
  fenceLine(vb, P.fence, 0, 9, 0, 10);
  return vb.model();
}

/* look 1: a tall town house, gable to the street, the upper floor jettied out on brackets, a chimney through the roof */
function townHouse(P) {
  const vb = model(12, 20, 12);
  footing(vb, P, 3, 3, 8, 8);
  storey(vb, P, 3, 3, 8, 8, 1, 4, { fill: P.t ? P.wall : P.fill, xs: [3, 5, 8], zs: [3, 8] });
  doorway(vb, P, "south", 8, 4, 1, { lantern: false });
  windows(vb, P, "south", 8, [6], 2, 2, { wide: true, sill: false });
  windows(vb, P, "west", 3, [5], 2, 2, { wide: true, sill: false });
  /* the jettied floor */
  vb.box(2, 4, 3, 9, 4, 9, P.plank);
  storey(vb, P, 2, 3, 9, 9, 4, 8, { sill: true, xs: [2, 5, 6, 9], zs: [3, 6, 9] });
  brackets(vb, P, "south", 8, 3, 8, 3, 5);
  brackets(vb, P, "east", 8, 4, 7, 3, 3);
  brackets(vb, P, "west", 3, 4, 7, 3, 3);
  windows(vb, P, "south", 9, [3, 7], 6, 2, { wide: true, flower: "red" });
  windows(vb, P, "east", 9, [4, 7], 6, 2, { sill: false });
  windows(vb, P, "west", 2, [4, 7], 6, 2, { sill: false });
  windows(vb, P, "north", 3, [3, 7], 6, 2, { wide: true, sill: false });
  gabled(vb, P, 2, 3, 9, 9, 8, { alongX: false, prof: [1, 1, 2, 2, 2], win: 3, winH: 2 });
  chimney(vb, P, 3, 5, 9, 15);
  vb.set(5, 3, 9, "lantern[hanging=true]");
  /* street side and a side yard */
  for (let x = 3; x <= 8; x++) vb.set(x, 0, 10, P.paving).set(x, 0, 9, P.paving);
  vb.set(8, 0, 9, "barrel[facing=up]").set(3, 0, 9, "crate");
  vb.set(10, 0, 5, "crate")
    .set(10, 1, 5, "sack")
    .set(10, 0, 6, "barrel[facing=up]")
    .set(10, 0, 4, "crate")
    .set(9, 0, 4, "crate");
  bush(vb, 1, 4, 0, "azalea_leaves", "yellow");
  bush(vb, 1, 6, 0, "oak_leaves");
  bush(vb, 1, 7, 0, "azalea_leaves", "red");
  fenceLine(vb, P.fence, 0, 3, 0, 8);
  return vb.model();
}

/* look 2: an L-shaped house, the door in the corner of the two wings, a well and a fenced garden in front */
function wingHouse(P) {
  const vb = model(12, 16, 12);
  footing(vb, P, 1, 1, 10, 5);
  footing(vb, P, 6, 5, 10, 9);
  storey(vb, P, 1, 1, 10, 5, 1, 4, { fill: P.t ? P.wall : P.fill, xs: [1, 4, 6, 10], zs: [1, 5] });
  storey(vb, P, 6, 5, 10, 9, 1, 4, { xs: [6, 10], zs: [5, 9] });
  vb.box(7, 1, 5, 9, 4, 5, 0);
  gabled(vb, P, 1, 1, 10, 5, 4, { alongX: true });
  gabled(vb, P, 6, 3, 10, 9, 4, { alongX: false, win: 2 });
  windows(vb, P, "south", 9, [8], 2, 2, { shutter: true, flower: "red" });
  windows(vb, P, "east", 10, [3, 7], 2, 2, { sill: false });
  windows(vb, P, "north", 1, [2, 5, 8], 2, 2, { sill: false });
  windows(vb, P, "west", 1, [3], 2, 2, { flower: "yellow" });
  windows(vb, P, "west", 6, [7], 2, 2, { sill: false });
  doorway(vb, P, "south", 5, 3, 1, { canopy: P.trim });
  windows(vb, P, "south", 5, [2], 2, 1, { sill: false });
  chimney(vb, P, 3, 3, 8, 10);
  /* garden */
  vb.set(3, 0, 6, P.paving)
    .set(3, 0, 7, P.paving)
    .set(3, 0, 8, P.paving)
    .set(3, 0, 9, P.paving)
    .set(3, 0, 10, P.paving);
  well(vb, P, 1, 8);
  vb.set(5, 0, 6, "barrel[facing=up]");
  bush(vb, 5, 8, 0, "azalea_leaves", "pink");
  bush(vb, 5, 9, 0, "oak_leaves", "white");
  bush(vb, 4, 10, 0, "azalea_leaves", "yellow");
  fenceCells(
    vb,
    P.fence,
    [0, 1, 2, 4, 5, 6, 7, 8, 9, 10].map((x) => [x, 11]),
  );
  vb.set(11, 0, 11, P.fence).set(11, 0, 10, P.fence);
  return vb.model();
}

const HOUSE_STONE = ["red", "slate", "blue"];
export function house(t, look) {
  const v = (look | 0) % 3;
  const P = palette(t, t ? HOUSE_STONE[v % 3] : v % 3 === 1 ? "thatch" : undefined);
  if (!t && v % 3 === 2) {
    P.roof = ROOF.dark;
    P.trim = ROOF.spruce;
  }
  return [cottage, townHouse, wingHouse][v % 3](P);
}

/* the farm: a barn under a gambrel thatch with a hay loft and a hoist, fenced fields with a scarecrow, a pen with a trough */
export function farm(t) {
  const P = palette(t, "thatch"),
    vb = model(16, 14, 16),
    red = t ? P.wall : "mangrove_planks";
  footing(vb, P, 1, 1, 7, 8);
  storey(vb, P, 1, 1, 7, 8, 1, 5, { fill: red, xs: [1, 4, 7], zs: [1, 4, 8] });
  vb.box(1, 3, 1, 7, 3, 1, P.bx).box(1, 3, 8, 7, 3, 8, P.bx);
  gabled(vb, P, 1, 1, 7, 8, 5, {
    alongX: false,
    prof: [2, 2, 1, 1],
    fill: (u, v) => (Math.abs(u) < 1 && v > 1 ? P.post : t ? P.fill : red),
  });
  /* barn doors, hay loft and hoist */
  vb.box(3, 1, 8, 5, 3, 8, P.plank);
  vb.set(3, 4, 8, P.bx).set(4, 4, 8, P.bx).set(5, 4, 8, P.bx);
  for (const x of [3, 5])
    vb.set(x, 2, 9, `${P.trap}[facing=south,open=true]`).set(x, 1, 9, `${P.trap}[facing=south,open=true]`);
  vb.set(4, 5, 8, "hay_block").set(4, 6, 8, "hay_block");
  vb.set(4, 8, 9, P.bz).set(4, 8, 10, P.bz).set(4, 7, 10, "chain").set(4, 6, 10, "hay_block");
  windows(vb, P, "west", 1, [3, 6], 2, 1, { sill: false });
  windows(vb, P, "east", 7, [3], 2, 1, { sill: false });
  /* fields: rows of crops between ridges of soil */
  const plot = (x0, z0, x1, z1, crop) => {
    for (let x = x0; x <= x1; x++)
      for (let z = z0; z <= z1; z++) vb.set(x, 0, z, (x - x0) % 2 ? "soil_low" : `crop_${crop}`);
  };
  plot(10, 1, 14, 6, "wheat");
  plot(10, 9, 14, 14, "green");
  fenceRect(vb, P.fence, 9, 0, 15, 15, 0, (x, z) => (z === 7 || z === 8) && x === 9);
  fenceLine(vb, P.fence, 10, 7, 14, 7);
  vb.set(12, 0, 8, "water_low").set(13, 0, 8, "water_low").set(11, 0, 8, "water_low");
  /* scarecrow */
  vb.set(12, 0, 4, P.fence).set(12, 1, 4, "hay_block").set(12, 2, 4, "pumpkin");
  vb.set(11, 1, 4, `${P.fence}[east=true]`).set(13, 1, 4, `${P.fence}[west=true]`);
  /* pen and yard */
  fenceRect(vb, P.fence, 1, 11, 6, 15, 0, (x, z) => z === 11 && x === 4);
  vb.set(2, 0, 14, "hay_block").set(3, 0, 14, "hay_block").set(2, 1, 14, "hay_block");
  vb.set(5, 0, 13, "water_low").set(5, 0, 14, "water_low");
  vb.set(8, 0, 9, "hay_block")
    .set(8, 0, 10, "hay_block")
    .set(8, 1, 9, "hay_block")
    .set(7, 0, 10, "pumpkin")
    .set(1, 0, 9, "barrel[facing=up]");
  vb.set(8, 0, 5, "composter").set(8, 0, 3, "sack");
  return vb.model();
}

/* the storehouse: a long hall under a tall roof, a loading dormer with a hoist over the big door, a lean-to full of barrels */
export function storage(t) {
  const P = palette(t, "slate"),
    vb = model(16, 18, 16);
  footing(vb, P, 1, 2, 12, 9);
  storey(vb, P, 1, 2, 12, 9, 1, 5, { fill: P.t ? P.wall : P.fill, xs: [1, 4, 5, 8, 9, 12], zs: [2, 5, 9] });
  vb.box(1, 3, 2, 12, 3, 2, P.bx).box(1, 3, 9, 12, 3, 9, P.bx);
  gabled(vb, P, 1, 2, 12, 9, 5, { alongX: true, prof: [1, 1, 2, 2, 2], win: 3 });
  /* loading dormer */
  storey(vb, P, 5, 9, 8, 9, 6, 9, { xs: [5, 8], zs: [9] });
  gabled(vb, P, 5, 5, 8, 9, 9, { alongX: false, prof: [1, 1, 2], fill: (u) => (Math.abs(u) < 1 ? P.post : P.fill) });
  vb.box(6, 6, 9, 7, 8, 9, P.plank);
  vb.set(6, 11, 10, P.bz).set(6, 11, 11, P.bz).set(6, 10, 11, "chain").set(6, 9, 11, "chain").set(6, 8, 11, "crate");
  /* the big door */
  vb.box(6, 1, 9, 7, 3, 9, "dark_oak_planks");
  for (const x of [6, 7])
    vb.set(x, 1, 9, "dark_oak_door[facing=south,half=lower]").set(x, 2, 9, "dark_oak_door[facing=south,half=upper]");
  vb.set(6, 4, 9, P.bx).set(7, 4, 9, P.bx);
  vb.set(5, 3, 10, "lantern[hanging=true]").set(8, 3, 10, "lantern[hanging=true]");
  windows(vb, P, "south", 9, [2, 10], 2, 1, { sill: false, wide: true });
  windows(vb, P, "north", 2, [2, 6, 10], 2, 1, { sill: false, wide: true });
  windows(vb, P, "west", 1, [5], 2, 2, { sill: false, wide: true });
  /* lean-to on the east */
  for (const z of [3, 8]) vb.box(15, 0, z, 15, 2, z, P.fence);
  vb.shed({ x0: 13, x1: 15, z0: 2, z1: 9, y: 3, dir: "east", m: P.roof, t: P.trim });
  vb.set(13, 0, 3, "barrel[facing=up]").set(14, 0, 3, "barrel[facing=up]").set(13, 1, 3, "barrel[facing=up]");
  vb.set(13, 0, 5, "crate")
    .set(13, 1, 5, "crate")
    .set(14, 0, 5, "crate")
    .set(13, 0, 6, "sack")
    .set(14, 0, 7, "barrel[facing=up]")
    .set(13, 0, 8, "crate");
  /* yard */
  for (let x = 5; x <= 8; x++) for (let z = 10; z <= 13; z++) vb.set(x, 0, z, P.paving);
  vb.set(2, 0, 10, "crate")
    .set(3, 0, 10, "crate")
    .set(2, 1, 10, "crate")
    .set(2, 0, 11, "sack")
    .set(4, 0, 10, "barrel[facing=up]");
  logPile(vb, 10, 11, 4, "x", "spruce_log");
  /* a hand cart */
  vb.box(1, 1, 13, 3, 1, 14, P.wsl + "[type=bottom]")
    .set(1, 0, 13, P.fence)
    .set(3, 0, 13, P.fence)
    .set(1, 0, 14, P.fence)
    .set(3, 0, 14, P.fence);
  vb.set(2, 1, 13, "sack").set(4, 1, 14, `${P.fence}[west=true]`);
  return vb.model();
}

/* the granary: a round stone silo under a thatch cone, and a grain loft raised on posts out of reach of the rats */
export function granary(t) {
  const P = palette(t, "thatch"),
    vb = model(16, 18, 16);
  /* silo */
  for (let y = 0; y <= 9; y++)
    vb.disc(4, 5, 3.2, y, P.t ? P.wall : ["cobblestone", "cobblestone", "andesite", "stone"], 2.1);
  vb.disc(4, 5, 3.8, 0, P.base, 2.1);
  for (const y of [3, 7]) vb.disc(4, 5, 3.2, y, P.t ? "polished_andesite" : "spruce_planks", 2.1);
  vb.cone(4, 5, 3.2, 10, P.roof, 2, 1);
  vb.set(4, 17, 5, P.fence);
  vb.set(4, 1, 8, P.plank).set(4, 2, 8, P.plank).set(4, 5, 8, "iron_bars");
  /* loft on posts */
  for (const x of [8, 11, 14]) for (const z of [3, 6, 10]) vb.box(x, 0, z, x, 1, z, P.t ? "stone_brick_wall" : P.post);
  vb.box(8, 2, 3, 14, 2, 10, P.plank);
  vb.box(7, 2, 3, 7, 2, 10, P.wsl + "[type=top]").box(15, 2, 3, 15, 2, 10, P.wsl + "[type=top]");
  storey(vb, P, 8, 3, 14, 10, 3, 6, { xs: [8, 11, 14], zs: [3, 6, 10], fill: P.fill });
  gabled(vb, P, 8, 3, 14, 10, 6, { alongX: false, win: 3 });
  doorway(vb, P, "south", 10, 10, 3, { step: false });
  windows(vb, P, "south", 10, [13], 4, 1, { sill: false });
  windows(vb, P, "east", 14, [5, 8], 4, 1, { sill: false });
  vb.box(9, 2, 11, 12, 2, 11, P.wsl + "[type=top]");
  vb.set(10, 1, 12, stair(P.wst, "north"))
    .set(10, 0, 13, stair(P.wst, "north"))
    .set(11, 1, 12, stair(P.wst, "north"))
    .set(11, 0, 13, stair(P.wst, "north"));
  /* yard */
  vb.set(13, 0, 12, "sack")
    .set(14, 0, 12, "sack")
    .set(14, 1, 12, "sack")
    .set(13, 0, 13, "hay_block")
    .set(14, 0, 14, "hay_block");
  vb.set(1, 0, 10, "hay_block")
    .set(2, 0, 10, "hay_block")
    .set(1, 1, 10, "hay_block")
    .set(3, 0, 11, "barrel[facing=up]");
  for (let z = 9; z <= 14; z++) vb.set(4, 0, z, P.paving);
  for (let x = 5; x <= 9; x++) vb.set(x, 0, 14, P.paving);
  vb.set(6, 0, 11, "crop_wheat").set(7, 0, 11, "crop_wheat").set(6, 0, 12, "crop_wheat");
  return vb.model();
}

/* the forester's lodge: a cabin of crossed logs with a fieldstone chimney, a covered wood store, a saw frame, stumps and trees */
export function forester(t) {
  const P = palette(t, "green"),
    vb = model(16, 16, 16),
    lg = t ? "dark_oak_log" : "spruce_log";
  footing(vb, P, 2, 3, 8, 8);
  for (let y = 1; y <= 4; y++) {
    vb.box(2, y, 3, 8, y, 3, `${lg}[axis=x]`).box(2, y, 8, 8, y, 8, `${lg}[axis=x]`);
    vb.box(2, y, 4, 2, y, 7, `${lg}[axis=z]`).box(8, y, 4, 8, y, 7, `${lg}[axis=z]`);
    if (y % 2) for (const z of [3, 8]) vb.set(1, y, z, `${lg}[axis=x]`).set(9, y, z, `${lg}[axis=x]`);
    else
      for (const x of [2, 8]) {
        vb.box(x, y, 3, x, y, 8, `${lg}[axis=z]`);
        vb.set(x, y, 2, `${lg}[axis=z]`).set(x, y, 9, `${lg}[axis=z]`);
      }
  }
  gabled(vb, P, 2, 3, 8, 8, 4, { alongX: true, m: t ? ROOF.green : ROOF.spruce, fill: () => `${lg}[axis=z]` });
  doorway(vb, P, "south", 8, 4, 1, { lantern: false });
  windows(vb, P, "south", 8, [6], 2, 1, { shutter: false });
  windows(vb, P, "north", 3, [5], 2, 1, { sill: false });
  /* fieldstone chimney on the west gable */
  vb.box(1, 0, 5, 1, 9, 6, ["cobblestone", "andesite", "mossy_cobblestone", "stone"]);
  vb.box(0, 0, 5, 0, 2, 6, ["cobblestone", "mossy_cobblestone"]);
  vb.set(1, 10, 5, "cobblestone_wall").set(1, 10, 6, "campfire");
  vb.set(3, 3, 9, "lantern[hanging=true]");
  /* wood store against the east wall */
  for (const z of [4, 7]) vb.box(11, 0, z, 11, 2, z, P.fence);
  vb.shed({ x0: 9, x1: 11, z0: 3, z1: 8, y: 3, dir: "east", m: t ? ROOF.green : ROOF.spruce });
  vb.box(9, 0, 4, 10, 1, 7, "oak_log[axis=x]").box(9, 2, 5, 10, 2, 6, "birch_log[axis=x]");
  /* saw frame, stumps, piles */
  vb.set(5, 0, 11, P.fence).set(8, 0, 11, P.fence).box(4, 1, 11, 9, 1, 11, "stripped_oak_log[axis=x]");
  vb.set(2, 0, 11, "oak_log").set(2, 1, 11, "iron_bars").set(3, 0, 13, "spruce_log");
  logPile(vb, 5, 13, 4, "x", "oak_log");
  logPile(vb, 11, 10, 3, "z", "birch_log");
  for (let z = 9; z <= 10; z++) vb.set(4, 0, z, "path");
  spruce(vb, 13, 2, 0, 7);
  spruce(vb, 14, 13, 0, 6);
  oak(vb, 1, 14, 0, 4);
  bush(vb, 12, 6, 0, "spruce_leaves");
  bush(vb, 10, 14, 0, "oak_leaves");
  return vb.model();
}

/* the orchard: apple and cherry trees in rows inside a low wall with an arched gate, beehives, baskets, a ladder and a tool shed */
export function orchard(t) {
  const P = palette(t, "red"),
    vb = model(20, 12, 20);
  const tree = (x, z, leaf) => {
    vb.box(x, 0, z, x, 2, z, "oak_log");
    for (let dy = 0; dy < 3; dy++) {
      const r = dy === 2 ? 1 : 2;
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
          if (dx === 0 && dz === 0 && dy === 0) continue;
          const fruit = leaf === "oak_leaves" && (dx * 3 + dz * 5 + dy * 7 + x) % 9 === 0;
          vb.add(x + dx, 2 + dy, z + dz, fruit ? "apple_leaves" : leaf);
        }
    }
  };
  for (const [x, z, l] of [
    [3, 3, "oak_leaves"],
    [9, 3, "cherry_leaves"],
    [15, 3, "oak_leaves"],
    [3, 9, "cherry_leaves"],
    [9, 9, "oak_leaves"],
    [15, 9, "oak_leaves"],
    [15, 15, "cherry_leaves"],
  ])
    tree(x, z, l);
  /* low wall with posts, an arch over the gate on the south side */
  const wl = P.t ? "stone_brick_wall" : "spruce_fence";
  fenceRect(vb, wl, 0, 0, 19, 19, 0, (x, z) => z === 19 && x >= 9 && x <= 10);
  for (const [x, z] of [
    [0, 0],
    [19, 0],
    [0, 19],
    [19, 19],
    [8, 19],
    [11, 19],
  ])
    vb.box(x, 0, z, x, 1, z, P.t ? "stone_bricks" : P.post);
  vb.box(8, 2, 19, 8, 3, 19, P.t ? "stone_bricks" : P.post).box(11, 2, 19, 11, 3, 19, P.t ? "stone_bricks" : P.post);
  vb.set(8, 4, 19, stair(P.roof.st, "east"))
    .set(11, 4, 19, stair(P.roof.st, "west"))
    .set(9, 4, 19, P.roof.sl + "[type=top]")
    .set(10, 4, 19, P.roof.sl + "[type=top]");
  for (let z = 12; z <= 18; z++) vb.set(9, 0, z, "path").set(10, 0, z, "path");
  /* tool shed */
  footing(vb, P, 2, 13, 6, 17);
  storey(vb, P, 2, 13, 6, 17, 1, 3, { xs: [2, 6], zs: [13, 17] });
  gabled(vb, P, 2, 13, 6, 17, 3, { alongX: false, prof: [1, 1] });
  doorway(vb, P, "east", 6, 15, 1, { lantern: false, step: false });
  windows(vb, P, "south", 17, [4], 2, 1, { flower: "red" });
  /* hives, baskets, ladder */
  for (const x of [12, 14, 16]) vb.set(x, 0, 12, P.fence).set(x, 1, 12, "beehive");
  vb.set(7, 0, 6, "barrel[facing=up]")
    .set(12, 0, 6, "barrel[facing=up]")
    .set(13, 0, 17, "crate")
    .set(12, 0, 17, "barrel[facing=up]")
    .set(13, 1, 17, "sack");
  vb.set(4, 0, 5, "ladder[facing=north]").set(4, 1, 5, "ladder[facing=north]");
  bush(vb, 17, 18, 0, "azalea_leaves", "pink");
  bush(vb, 1, 18, 0, "azalea_leaves", "yellow");
  return vb.model();
}
