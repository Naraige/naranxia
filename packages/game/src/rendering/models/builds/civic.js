import {
  banner,
  brackets,
  bush,
  chimney,
  doorway,
  fenceCells,
  flagPole,
  footing,
  gabled,
  hedge,
  lampPost,
  model,
  oak,
  palette,
  plaza,
  roundTower,
  spruce,
  stair,
  stall,
  storey,
  tower,
  well,
  windows,
} from "../voxel-kit.js";

/* ---- the buildings of town life: market, guild hall, academy, observatory, bell tower, sanctuary, embassy ---- */

/* the market: a hall on stone arcades under a red roof, four stalls with striped awnings round a well on a paved square */
export function market(t) {
  const P = palette(t, "red", true),
    vb = model(20, 18, 20),
    pil = P.t ? "stone_bricks" : P.post,
    ast = P.t ? "stone_brick_stairs" : P.wst;
  plaza(vb, 1, 7, 18, 18);
  footing(vb, P, 4, 1, 15, 6);
  vb.box(4, 1, 1, 15, 3, 1, P.t ? P.wall : P.fill);
  for (const x of [4, 15]) vb.box(x, 1, 1, x, 3, 2, P.t ? P.wall : P.fill);
  /* arcade: pillars and arches */
  for (const x of [4, 7, 12, 15]) vb.box(x, 1, 6, x, 3, 6, pil);
  for (const [x, f] of [
    [5, "west"],
    [6, "east"],
    [8, "west"],
    [11, "east"],
    [13, "west"],
    [14, "east"],
  ])
    vb.set(x, 3, 6, stair(ast, f, "top"));
  for (const x of [4, 15]) {
    vb.box(x, 1, 3, x, 3, 3, pil);
    vb.set(x, 3, 4, stair(ast, "north", "top")).set(x, 3, 5, stair(ast, "south", "top"));
  }
  vb.set(6, 1, 2, "barrel[facing=up]")
    .set(7, 1, 2, "crate")
    .set(7, 2, 2, "sack")
    .set(12, 1, 2, "crate")
    .set(13, 1, 2, "barrel[facing=up]")
    .set(13, 1, 3, "sack");
  vb.set(9, 3, 5, "lantern[hanging=true]").set(10, 3, 5, "lantern[hanging=true]");
  /* the hall above */
  vb.box(4, 4, 1, 15, 4, 6, P.plank);
  storey(vb, P, 4, 1, 15, 6, 4, 8, {
    sill: true,
    xs: [4, 7, 12, 15],
    zs: [1, 6],
    posts: true,
    fill: P.t ? ["plaster", "plaster", "plaster_dark"] : P.fill,
  });
  windows(vb, P, "south", 6, [5, 9, 13], 6, 2, { wide: true, flower: "red" });
  windows(vb, P, "north", 1, [5, 9, 13], 6, 2, { wide: true, sill: false });
  windows(vb, P, "east", 15, [3], 6, 2, { wide: true, sill: false });
  windows(vb, P, "west", 4, [3], 6, 2, { wide: true, sill: false });
  gabled(vb, P, 4, 1, 15, 6, 8, { alongX: true, win: 2 });
  flagPole(vb, P, 9, 3, 14, 4, "red");
  /* stalls round the well */
  stall(vb, P, 2, 9, 4, "red", "white");
  stall(vb, P, 14, 9, 4, "blue", "white", ["crate", "barrel"]);
  stall(vb, P, 2, 14, 5, "yellow", "white", ["hay_block", "barrel", "melon"]);
  stall(vb, P, 13, 14, 5, "green", "white", ["crate", "melon", "barrel"]);
  well(vb, P, 9, 12);
  for (const [x, z] of [
    [1, 7],
    [18, 7],
    [7, 18],
    [12, 18],
  ])
    lampPost(vb, P, x, z);
  vb.set(8, 0, 16, "crate")
    .set(8, 1, 16, "pumpkin")
    .set(11, 0, 9, "barrel[facing=up]")
    .set(18, 0, 13, "crate")
    .set(1, 0, 13, "barrel[facing=up]");
  return vb.model();
}

/* the guild hall: two tall gables side by side over a jettied floor, yellow banners over the double door, a chimney on each flank */
export function guild(t) {
  const P = palette(t, "slate"),
    vb = model(20, 20, 20);
  footing(vb, P, 2, 3, 17, 14);
  storey(vb, P, 2, 3, 17, 14, 1, 5, { fill: P.t ? P.wall : P.fill, xs: [2, 5, 8, 11, 14, 17], zs: [3, 7, 10, 14] });
  vb.box(2, 5, 3, 17, 5, 15, P.plank);
  storey(vb, P, 2, 3, 17, 15, 5, 9, { sill: true, xs: [2, 5, 9, 10, 14, 17], zs: [3, 7, 11, 15] });
  brackets(vb, P, "south", 14, 2, 17, 4, 3);
  for (const [x0, x1] of [
    [1, 9],
    [10, 18],
  ])
    vb.roof({
      x0,
      x1,
      z0: 2,
      z1: 16,
      y: 9,
      alongX: false,
      m: P.roof,
      t: P.trim,
      prof: [1, 1, 2, 2, 2],
      fill: (u, v) =>
        Math.abs(u) < 1 ? (v >= 3 && v < 5 ? "window" : P.post) : Math.abs(u) === 2 && v < 3 ? P.post : P.fill,
    });
  windows(vb, P, "south", 15, [3, 6, 12, 15], 7, 2, { wide: true, flower: "yellow" });
  windows(vb, P, "east", 17, [5, 9, 13], 7, 2, { sill: false });
  windows(vb, P, "west", 2, [5, 9, 13], 7, 2, { sill: false });
  windows(vb, P, "north", 3, [3, 6, 12, 15], 7, 2, { wide: true, sill: false });
  windows(vb, P, "south", 14, [3, 6, 12, 15], 2, 2, { wide: true, sill: false });
  windows(vb, P, "east", 17, [5, 12], 2, 2, { sill: false });
  windows(vb, P, "west", 2, [5, 12], 2, 2, { sill: false });
  doorway(vb, P, "south", 14, 9, 1, { wide: true, wood: "dark_oak", lantern: false });
  banner(vb, 9, 8, 16, "south", "yellow");
  banner(vb, 10, 8, 16, "south", "yellow");
  vb.set(7, 4, 15, "lantern[hanging=true]").set(12, 4, 15, "lantern[hanging=true]");
  chimney(vb, P, 18, 8, 0, 15);
  chimney(vb, P, 1, 8, 0, 15);
  /* forecourt */
  plaza(vb, 8, 15, 11, 19);
  vb.set(3, 0, 15, "crate")
    .set(4, 0, 15, "barrel[facing=up]")
    .set(16, 0, 15, "crate")
    .set(16, 1, 15, "sack")
    .set(15, 0, 15, "crate");
  hedge(vb, 2, 18, 6, 18, "yellow");
  hedge(vb, 13, 18, 17, 18, "yellow");
  lampPost(vb, P, 7, 18);
  lampPost(vb, P, 12, 18);
  vb.set(4, 0, 17, stair(P.wst, "north"))
    .set(5, 0, 17, stair(P.wst, "north"))
    .set(14, 0, 17, stair(P.wst, "north"))
    .set(15, 0, 17, stair(P.wst, "north"));
  return vb.model();
}

/* the academy: a two-storey hall of tall windows under a blue roof, a wing, and a round tower with a pointed blue cap */
export function academy(t) {
  const P = palette(t, "blue", true),
    vb = model(20, 28, 20),
    G = P.t ? P.wall : P.fill;
  footing(vb, P, 1, 8, 13, 15);
  storey(vb, P, 1, 8, 13, 15, 1, 5, { fill: G, xs: [1, 4, 7, 10, 13], zs: [8, 11, 15] });
  storey(vb, P, 1, 8, 13, 15, 6, 9, { xs: [1, 4, 7, 10, 13], zs: [8, 11, 15] });
  /* the wing to the tower */
  footing(vb, P, 8, 3, 13, 8);
  storey(vb, P, 8, 3, 13, 8, 1, 5, { fill: G, xs: [8, 13], zs: [3, 8] });
  gabled(vb, P, 8, 3, 13, 8, 5, { alongX: false });
  gabled(vb, P, 1, 8, 13, 15, 9, { alongX: true, prof: [1, 1, 2, 2, 2], win: 3, winH: 2 });
  windows(vb, P, "south", 15, [2, 5, 8, 11], 7, 2, { wide: true });
  windows(vb, P, "south", 15, [2, 11], 2, 2, { wide: true, sill: false });
  windows(vb, P, "south", 15, [5, 9], 2, 2, { sill: false });
  windows(vb, P, "north", 8, [2, 5], 7, 2, { wide: true, sill: false });
  windows(vb, P, "north", 8, [2, 5], 2, 2, { wide: true, sill: false });
  windows(vb, P, "west", 1, [9, 12], 7, 2, { wide: true, sill: false });
  windows(vb, P, "west", 1, [9, 12], 2, 2, { wide: true, sill: false });
  windows(vb, P, "west", 8, [5], 2, 2, { wide: true, sill: false });
  doorway(vb, P, "south", 15, 7, 1, { canopy: true });
  banner(vb, 4, 5, 16, "south", "blue");
  banner(vb, 10, 5, 16, "south", "blue");
  /* tower */
  roundTower(vb, P, 16, 5, 3.2, 0, 15, {
    band: [5, 10, 15],
    wall: P.t ? P.wall : "spruce_planks",
    bandB: P.t ? "polished_andesite" : "dark_oak_planks",
  });
  for (const y of [7, 8, 12, 13]) {
    vb.set(15, y, 7, "window[east=true,west=true]").set(16, y, 7, "window[east=true,west=true]");
    vb.set(18, y, 4, "window[north=true,south=true]").set(18, y, 5, "window[north=true,south=true]");
  }
  const top = vb.cone(16, 5, 3.2, 16, P.roof, 2, 1);
  vb.set(16, top + 1, 5, P.fence).set(16, top + 2, 5, "gold_block");
  vb.set(15, 1, 7, P.plank).set(15, 2, 7, P.plank);
  /* garden */
  plaza(vb, 6, 16, 8, 19);
  hedge(vb, 1, 17, 4, 17, "blue");
  hedge(vb, 10, 17, 13, 17, "white");
  oak(vb, 17, 14, 0, 4, "birch_leaves", "birch_log");
  vb.set(15, 0, 11, "paving").set(16, 0, 11, "paving").set(15, 0, 10, "paving").set(16, 0, 10, "paving");
  vb.set(15, 1, 10, "lectern").set(18, 0, 18, P.fence).set(18, 1, 18, "gold_block");
  vb.set(14, 0, 18, stair(P.wst, "north")).set(15, 0, 18, stair(P.wst, "north"));
  lampPost(vb, P, 5, 19);
  lampPost(vb, P, 9, 19);
  return vb.model();
}

/* the observatory: a round tower with a gallery, a copper dome split by the slit of the telescope, a porch at its foot */
export function observatory(t) {
  const P = palette(t, "copper", true),
    vb = model(16, 22, 16),
    cx = 8,
    cz = 7,
    r = 4.2;
  plaza(vb, 5, 12, 10, 15);
  footing(vb, P, 6, 10, 9, 13);
  storey(vb, P, 6, 10, 9, 13, 1, 4, { xs: [6, 9], zs: [13], fill: P.t ? P.wall : P.fill });
  roundTower(vb, P, cx, cz, r, 0, 11, {
    band: [4, 11],
    wall: P.t ? P.wall : "spruce_planks",
    bandB: P.t ? "polished_andesite" : "dark_oak_planks",
  });
  vb.roof({
    x0: 5,
    x1: 10,
    z0: 11,
    z1: 14,
    y: 4,
    alongX: false,
    m: P.roof,
    t: P.trim,
    prof: [1, 1],
    end: 1,
    fill: (u) => (Math.abs(u) < 1 ? P.post : P.fill),
  });
  doorway(vb, P, "south", 13, 7, 1, { wide: true, lantern: false });
  /* gallery */
  vb.disc(cx, cz, r + 1, 7, P.wsl + "[type=top]", r - 0.05);
  for (let z = 1; z <= 13; z++)
    for (let x = 2; x <= 14; x++) {
      const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
      if (d <= (r + 1) ** 2 && d > r * r && (x + z) % 2 === 0 && !vb.get(x, 8, z)) vb.set(x, 8, z, P.fence);
    }
  for (const y of [2, 3, 9, 10]) {
    vb.set(4, y, 6, "window[north=true,south=true]").set(4, y, 7, "window[north=true,south=true]");
    vb.set(11, y, 6, "window[north=true,south=true]").set(11, y, 7, "window[north=true,south=true]");
    vb.set(7, y, 3, "window[east=true,west=true]").set(8, y, 3, "window[east=true,west=true]");
  }
  for (const y of [9, 10]) vb.set(7, y, 10, "window[east=true,west=true]").set(8, y, 10, "window[east=true,west=true]");
  /* dome */
  vb.disc(cx, cz, 4.7, 12, P.trim.bl);
  for (const [rr, y] of [
    [4.4, 13],
    [4.0, 14],
    [3.2, 15],
    [2.2, 16],
  ])
    vb.disc(cx, cz, rr, y, P.roof.bl);
  for (let y = 13; y <= 16; y++) for (let z = 7; z <= 12; z++) vb.set(7, y, z, 0).set(8, y, z, 0);
  for (let z = 7; z <= 11; z++) vb.set(7, 12, z, "coal_block").set(8, 12, z, "coal_block");
  vb.set(7, 13, 8, "copper_wall")
    .set(7, 14, 9, "copper_wall")
    .set(7, 15, 10, "copper_wall")
    .set(7, 16, 11, "gold_block");
  vb.set(8, 17, 6, P.fence).set(8, 18, 6, "gold_block");
  /* instruments in the yard */
  vb.set(2, 0, 13, "stone_brick_wall").set(2, 1, 13, "gold_block");
  vb.set(13, 0, 13, "paving").set(13, 1, 13, "lectern");
  bush(vb, 12, 14, 0, "azalea_leaves", "blue");
  bush(vb, 3, 14, 0, "azalea_leaves", "white");
  lampPost(vb, P, 4, 12);
  lampPost(vb, P, 11, 12);
  return vb.model();
}

/* the bell tower: a stone shaft with a clock, an open belfry behind a parapet, the bell under a steep spire */
export function bell(t) {
  const P = palette(t, "slate"),
    vb = model(12, 28, 12),
    cb = P.t ? "stone_bricks" : P.plank;
  plaza(vb, 1, 1, 10, 10);
  tower(vb, P, 3, 3, 5, 0, 9, { wall: P.t ? P.wall : "spruce_planks" });
  vb.box(3, 10, 3, 7, 10, 7, cb);
  for (const [x, z] of [
    [3, 3],
    [7, 3],
    [3, 7],
    [7, 7],
  ])
    vb.box(x, 11, z, x, 14, z, P.t ? "polished_andesite" : P.post);
  const ast = P.t ? "stone_brick_stairs" : P.wst;
  for (const z of [3, 7]) vb.set(4, 14, z, stair(ast, "west", "top")).set(6, 14, z, stair(ast, "east", "top"));
  for (const x of [3, 7]) vb.set(x, 14, 4, stair(ast, "north", "top")).set(x, 14, 6, stair(ast, "south", "top"));
  vb.box(3, 15, 3, 7, 15, 7, cb);
  const top = vb.spire({ x0: 2, z0: 2, x1: 8, z1: 8, y: 15, m: P.roof, prof: [1, 2, 3] });
  vb.set(5, top + 1, 5, P.fence).set(5, top + 2, 5, "gold_block");
  vb.set(5, 14, 5, "chain").set(5, 13, 5, "chain").set(5, 12, 5, "bell");
  doorway(vb, P, "south", 7, 5, 1, { lantern: false });
  vb.set(5, 7, 7, "target").set(5, 7, 3, "target").set(3, 7, 5, "target").set(7, 7, 5, "target");
  vb.set(6, 3, 8, "lantern[hanging=true]");
  /* square */
  vb.set(2, 0, 9, stair(P.wst, "north")).set(1, 0, 9, stair(P.wst, "north"));
  lampPost(vb, P, 9, 9);
  bush(vb, 1, 1, 0, "azalea_leaves", "red");
  bush(vb, 10, 1, 0, "azalea_leaves", "yellow");
  bush(vb, 10, 5, 0, "oak_leaves");
  return vb.model();
}

/* the sanctuary: a buttressed nave with tall stained glass, an apse, a front tower with a rose window and a spire topped by a golden cross */
export function sanctuary(t) {
  const P = palette(t, "green", true),
    vb = model(20, 34, 20),
    W = P.t ? P.wall : P.fill,
    GL = ["blue", "purple", "yellow", "red"];
  footing(vb, P, 5, 2, 13, 13);
  storey(vb, P, 5, 2, 13, 13, 1, 7, { fill: W, xs: [5, 13], zs: [2, 5, 8, 11, 13] });
  /* buttresses and stained glass */
  const bst = P.t ? "stone_brick_stairs" : "cobblestone_stairs";
  [2, 5, 8, 11].forEach((z, i) => {
    for (const [x, f, o] of [
      [4, "east", -1],
      [14, "west", 1],
    ]) {
      vb.box(x, 0, z, x, 4, z, P.base)
        .set(x, 5, z, stair(bst, f))
        .set(x + o, 0, z, stair(bst, f));
    }
    if (z < 11) {
      windows(vb, P, "west", 5, [z + 1], 3, 3, { wide: true, sill: false, pane: `${GL[i]}_stained_glass_pane` });
      windows(vb, P, "east", 13, [z + 1], 3, 3, {
        wide: true,
        sill: false,
        pane: `${GL[(i + 2) % 4]}_stained_glass_pane`,
      });
    }
  });
  gabled(vb, P, 5, 2, 13, 13, 7, { alongX: false, prof: [1, 2, 2, 2, 2], fill: (u) => (Math.abs(u) < 1 ? P.post : W) });
  /* apse */
  for (let y = 0; y <= 8; y++) {
    const rr = y <= 5 ? 3.3 : y === 6 ? 2.9 : y === 7 ? 2.2 : 1.3;
    for (let x = 5; x <= 13; x++)
      for (let z = 0; z <= 1; z++) {
        const d = (x + 0.5 - 9.5) ** 2 + (z + 0.5 - 2.5) ** 2;
        if (d <= rr * rr) vb.set(x, y, z, y > 5 ? P.roof.bl : y === 0 ? P.base : W);
      }
  }
  vb.set(9, 3, 0, "yellow_stained_glass_pane[east=true,west=true]").set(
    9,
    4,
    0,
    "yellow_stained_glass_pane[east=true,west=true]",
  );
  /* front tower */
  tower(vb, P, 7, 13, 5, 0, 19, { parapet: false, slit: false, wall: W });
  for (const y of [5, 10, 15]) vb.walls(7, y, 13, 11, y, 17, P.t ? "polished_andesite" : P.bx);
  doorway(vb, P, "south", 17, 9, 1, { wood: "dark_oak", lantern: false });
  vb.set(8, 7, 17, "red_stained_glass")
    .set(10, 7, 17, "red_stained_glass")
    .set(9, 8, 17, "red_stained_glass")
    .set(9, 6, 17, "red_stained_glass")
    .set(9, 7, 17, "yellow_stained_glass");
  for (const y of [16, 17]) {
    vb.set(9, y, 17, "iron_bars[east=true,west=true]").set(9, y, 13, "iron_bars[east=true,west=true]");
    vb.set(7, y, 15, "iron_bars[north=true,south=true]").set(11, y, 15, "iron_bars[north=true,south=true]");
  }
  const top = vb.spire({ x0: 6, z0: 12, x1: 12, z1: 18, y: 20, m: P.roof, prof: [1, 2, 3] });
  vb.box(9, top + 1, 15, 9, top + 3, 15, "gold_block")
    .set(8, top + 2, 15, "gold_block")
    .set(10, top + 2, 15, "gold_block");
  vb.set(8, 3, 18, "lantern[hanging=true]").set(10, 3, 18, "lantern[hanging=true]");
  /* churchyard */
  for (let z = 18; z <= 19; z++) vb.set(9, 0, z, P.paving);
  for (const [x, z] of [
    [1, 4],
    [1, 7],
    [2, 10],
    [17, 5],
    [18, 8],
    [17, 11],
  ])
    vb.set(x, 0, z, "cobblestone_wall");
  spruce(vb, 3, 16, 0, 6);
  spruce(vb, 16, 16, 0, 6);
  hedge(vb, 5, 19, 7, 19, "white");
  hedge(vb, 11, 19, 13, 19, "white");
  lampPost(vb, P, 6, 17);
  lampPost(vb, P, 12, 17);
  bush(vb, 1, 13, 0, "azalea_leaves", "pink");
  bush(vb, 18, 14, 0, "azalea_leaves", "white");
  return vb.model();
}

/* the embassy: a pale central block behind a portico of columns and a pediment, a hipped wing on each side, flags on the forecourt */
export function embassy(t) {
  const P = palette(t, "slate"),
    vb = model(20, 18, 20),
    W = P.t ? ["calcite", "calcite", "calcite", "diorite"] : P.fill,
    col = P.t ? "quartz_pillar" : "stripped_birch_log",
    ent = P.t ? "polished_andesite" : P.plank;
  plaza(vb, 1, 13, 18, 19);
  for (const [x0, x1] of [
    [1, 6],
    [13, 18],
  ]) {
    footing(vb, P, x0, 4, x1, 11);
    storey(vb, P, x0, 4, x1, 11, 1, 5, { fill: W, posts: !P.t });
    vb.spire({ x0: x0 - 1, z0: 3, x1: x1 + 1, z1: 12, y: 5, m: P.roof, prof: [1] });
    windows(vb, P, "south", 11, [x0 + 2], 2, 2, { wide: true, shutter: true });
    windows(vb, P, "north", 4, [x0 + 2], 2, 2, { wide: true, sill: false });
  }
  windows(vb, P, "west", 1, [6, 9], 2, 2, { sill: false });
  windows(vb, P, "east", 18, [6, 9], 2, 2, { sill: false });
  footing(vb, P, 6, 3, 13, 12);
  storey(vb, P, 6, 3, 13, 12, 1, 5, { fill: W, xs: [6, 13], zs: [3, 12] });
  storey(vb, P, 6, 3, 13, 12, 6, 9, { fill: W, xs: [6, 13], zs: [3, 12] });
  gabled(vb, P, 6, 3, 13, 12, 9, { alongX: false, prof: [1, 1, 1, 1], fill: () => W });
  windows(vb, P, "south", 12, [7, 11], 7, 2, { wide: true, sill: false });
  windows(vb, P, "north", 3, [7, 11], 7, 2, { wide: true, sill: false });
  windows(vb, P, "north", 3, [7, 11], 2, 2, { wide: true, sill: false });
  doorway(vb, P, "south", 12, 9, 1, { wide: true, wood: "dark_oak", lantern: false, step: false });
  /* portico */
  vb.box(5, 0, 13, 14, 0, 15, P.t ? "polished_andesite" : P.base);
  for (let x = 6; x <= 13; x++) vb.set(x, 0, 16, stair(P.t ? "stone_brick_stairs" : "cobblestone_stairs", "north"));
  for (const x of [6, 8, 11, 13]) vb.box(x, 1, 15, x, 5, 15, col);
  vb.box(5, 6, 13, 14, 6, 15, ent);
  vb.roof({
    x0: 5,
    x1: 14,
    z0: 13,
    z1: 15,
    y: 7,
    alongX: false,
    m: P.roof,
    t: P.trim,
    prof: [1],
    end: 0,
    fill: () => (P.t ? "calcite" : P.fill),
  });
  banner(vb, 9, 5, 16, "south", "red");
  banner(vb, 10, 5, 16, "south", "blue");
  vb.set(7, 5, 14, "lantern[hanging=true]").set(12, 5, 14, "lantern[hanging=true]");
  chimney(vb, P, 1, 7, 6, 9);
  chimney(vb, P, 18, 7, 6, 9);
  /* forecourt */
  flagPole(vb, P, 2, 17, 0, 8, "red");
  flagPole(vb, P, 15, 17, 0, 8, "blue");
  hedge(vb, 1, 13, 4, 13, "red");
  hedge(vb, 15, 13, 18, 13, "blue");
  lampPost(vb, P, 5, 18);
  lampPost(vb, P, 14, 18);
  fenceCells(
    vb,
    P.t ? "stone_brick_wall" : P.fence,
    [0, 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19].map((x) => [x, 19]),
  );
  return vb.model();
}
