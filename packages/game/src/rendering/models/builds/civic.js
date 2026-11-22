import {
  banner,
  bed,
  brackets,
  buttress,
  cart,
  chimney,
  cypress,
  doorway,
  dormer,
  fenceRect,
  flagPole,
  frameWalls,
  gabled,
  grow,
  hall,
  hedge,
  lampPost,
  model,
  oriel,
  palette,
  parapet,
  spireTop,
  path,
  plaza,
  plinth,
  porch,
  rect,
  roundTower,
  shrub,
  smallTree,
  stair,
  stall,
  stoneWalls,
  tower,
  windows,
} from "../voxel-kit.js";

/* ---- the buildings of town life: market, guild hall, academy, observatory, bell tower, sanctuary, embassy ---- */

/* the market: a hall on an arcade under a red roof with a bell turret, stalls with striped awnings round a fountain on a paved square */
export function market(t) {
  const P = palette(t, "red"),
    vb = model(20, 24, 20),
    T = P.t,
    r0 = rect(3, 2, 15, 7),
    pil = T ? "stone_bricks" : P.post,
    ast = T ? "stone_brick_stairs" : P.wst,
    piers = [3, 6, 9, 12, 15];
  plaza(vb, 1, 9, 18, 18, T ? "paving" : "path", T ? "paving_dark" : "path");
  plinth(vb, P, r0);
  vb.box(4, 0, 3, 14, 0, 7, T ? "paving_dark" : P.plank);
  /* back and side walls, the arcade on the square */
  if (T) stoneWalls(vb, P, r0, 1, 3);
  else
    frameWalls(vb, P, r0, 1, 3, {
      inset: 0,
      ps: { north: piers, east: [2, 5, 7], west: [2, 5, 7] },
      skip: { south: true },
    });
  vb.box(4, 1, 7, 14, 3, 7, 0);
  for (const x of piers) vb.box(x, 1, 7, x, 3, 7, pil);
  for (const x of piers.slice(0, -1))
    vb.set(x + 1, 3, 7, stair(ast, "west", "top")).set(x + 2, 3, 7, stair(ast, "east", "top"));
  for (const x of [3, 15]) {
    vb.box(x, 1, 4, x, 3, 6, 0)
      .set(x, 1, 4, pil)
      .set(x, 3, 5, stair(ast, "north", "top"))
      .set(x, 3, 6, stair(ast, "south", "top"));
    vb.box(x, 2, 4, x, 3, 4, pil);
  }
  windows(
    vb,
    P,
    "north",
    2,
    [
      [4, 2],
      [7, 2],
      [10, 2],
      [13, 2],
    ],
    2,
    1,
    {},
  );
  for (const x of [4, 5, 8, 11, 13, 14]) vb.set(x, 1, 3, ["crate", "barrel", "sacks", "barrel"][x % 4]);
  vb.set(5, 2, 3, "basket_red").set(13, 2, 3, "sacks").set(7, 1, 4, "barrel").set(10, 1, 3, "table");
  for (const x of [4, 7, 10, 13]) vb.set(x, 3, 6, "lantern[hanging=true]");
  /* the floor above, jettied over the arcade */
  let top = 4,
    r1 = r0;
  if (T) {
    r1 = grow(r0, { south: 1 });
    frameWalls(vb, P, r1, 4, 8, {
      sill: true,
      ps: { south: piers, north: piers, east: [2, 5, 8], west: [2, 5, 8] },
      ubrace: 0,
    });
    vb.box(4, 4, 3, 14, 4, 7, P.plank);
    brackets(vb, P, "south", 8, piers, 3);
    windows(
      vb,
      P,
      "south",
      7,
      [
        [4, 2],
        [7, 2],
        [10, 2],
        [13, 2],
      ],
      6,
      2,
      { box: ["red", "yellow", "white", "pink"] },
    );
    windows(
      vb,
      P,
      "east",
      14,
      [
        [3, 2],
        [6, 2],
      ],
      6,
      2,
      {},
    );
    windows(
      vb,
      P,
      "west",
      4,
      [
        [3, 2],
        [6, 2],
      ],
      6,
      2,
      {},
    );
    windows(
      vb,
      P,
      "north",
      3,
      [
        [4, 2],
        [10, 2],
        [13, 2],
      ],
      6,
      2,
      {},
    );
    top = 8;
  } else {
    for (let x = 3; x <= 15; x++) vb.set(x, 4, 7, P.bx).set(x, 4, 2, P.bx);
    for (let z = 3; z <= 6; z++) vb.set(3, 4, z, P.bz).set(15, 4, z, P.bz);
  }
  const ridge = gabled(vb, P, r1, top, { alongX: true, win: 2 }),
    zr = T ? 5 : 4;
  dormer(vb, P, "south", 6, r1.z1, top + 1);
  dormer(vb, P, "south", 12, r1.z1, top + 1);
  /* the bell turret on the ridge */
  for (const x of [8, 10]) for (const z of [zr - 1, zr + 1]) vb.box(x, ridge - 1, z, x, ridge + 2, z, P.post);
  vb.box(8, ridge + 3, zr - 1, 10, ridge + 3, zr + 1, P.plank);
  vb.set(9, ridge + 2, zr, "bell").set(9, ridge + 1, zr, 0);
  vb.hipRoof({
    x0: 7,
    z0: zr - 2,
    x1: 11,
    z1: zr + 2,
    y: ridge + 3,
    m: P.roof,
    t: P.trim,
    prof: [1, 1, 2],
    fin: [P.fin],
  });
  /* the square: stalls, a fountain, lamps, carts */
  stall(vb, P, 1, 10, 5, "red", "white", ["basket_red", "crate", "basket_yellow"]);
  stall(vb, P, 14, 10, 5, "blue", "white", ["barrel", "sacks", "crate"]);
  stall(vb, P, 2, 15, 4, "yellow", "green", ["basket_yellow", "basket_red"]);
  stall(vb, P, 14, 15, 4, "white", "red", ["sacks", "barrel"]);
  vb.box(7, 0, 12, 11, 0, 16, T ? "stone_bricks" : "cobblestone").box(8, 0, 13, 10, 0, 15, "water");
  vb.box(9, 0, 14, 9, 2, 14, T ? "polished_andesite" : "cobblestone").set(9, 3, 14, "lantern");
  for (const [x, z] of [
    [7, 12],
    [11, 12],
    [7, 16],
    [11, 16],
  ])
    vb.set(x, 1, z, `${T ? "stone_brick" : "cobblestone"}_slab[type=bottom]`);
  for (const [x, z] of [
    [1, 9],
    [18, 9],
    [7, 18],
    [12, 18],
  ])
    lampPost(vb, P, x, z);
  cart(vb, P, 6, 9, "basket_red");
  vb.add(12, 0, 10, "barrel")
    .add(13, 0, 9, "crate")
    .add(12, 0, 9, "sacks")
    .add(6, 0, 17, "bench[facing=north]")
    .add(13, 0, 13, "pot_red");
  return vb.model();
}

/* the banners that are not the kingdom's own (colour, second colour, pattern: PAL of ui/kingdom-theme.js, PATS of rendering/banner-art.js):
   the two of the guild (wine lozenge on gold, a gold roundel on teal) and those of the four realms that keep an envoy at the embassy */
const GUILD_BN = [
    { c: 10, c2: 13, p: 10 },
    { c: 5, c2: 10, p: 11 },
  ],
  REALMS = [
    { c: 1, c2: 11, p: 7 },
    { c: 9, c2: 10, p: 1 },
    { c: 7, c2: 12, p: 2 },
    { c: 4, c2: 11, p: 5 },
  ];

/* the guild hall: a great timbered hall, its gable and an oriel to the street over a porch, a stair tower with a spire, a yard for the craftsmen */
export function guild(t) {
  const P = palette(t, "slate"),
    vb = model(20, 26, 20),
    T = P.t,
    Hh = hall(vb, P, {
      r: rect(2, 4, 12, 13),
      up: 1,
      uh: 4,
      jet: { south: 1 },
      axis: "z",
      gps: { south: [2, 5, 9, 12], north: [2, 5, 9, 12], east: [4, 7, 10, 13], west: [4, 7, 10, 13] },
      ups: { south: [2, 5, 9, 12], north: [2, 5, 9, 12], east: [4, 7, 11, 14], west: [4, 7, 11, 14] },
      gbrace: { north: true },
      ubrace: { north: true, west: [1], east: [2] },
      roof: { prof: [1, 1, 2, 2, 2], win: 4, winH: 2 },
    }),
    gs = Hh.g("south"),
    us = Hh.u("south");
  /* the porch and the door, the oriel over them */
  doorway(vb, P, "south", gs, 7, 1, { arch: true, frame: T ? "polished_andesite" : false });
  porch(vb, P, "south", Hh.r1.z1, 7, 1, { d: 2, hw: 2, h: 4, post: T ? "stone_brick_wall" : P.fence });
  windows(
    vb,
    P,
    "south",
    gs,
    [
      [3, 2],
      [10, 2],
    ],
    2,
    2,
    T ? { sill: true, shutter: true } : { box: "yellow" },
  );
  oriel(vb, P, "south", Hh.r1.z1, 6, 8, Hh.uy + 1, { h: 3 });
  windows(
    vb,
    P,
    "south",
    us,
    [
      [3, 2],
      [10, 2],
    ],
    Hh.uy + 1,
    3,
    { box: ["yellow", "blue"] },
  );
  for (const s of ["west", "east"]) {
    windows(
      vb,
      P,
      s,
      Hh.g(s),
      [
        [5, 2],
        [8, 2],
        [11, 2],
      ],
      2,
      2,
      T ? { sill: true } : {},
    );
    windows(
      vb,
      P,
      s,
      Hh.u(s),
      [
        [5, 2],
        [8, 2],
        [12, 2],
      ],
      Hh.uy + 1,
      3,
      {},
    );
  }
  banner(vb, 4.5, Hh.uy - 0.1, Hh.r1.z1 + 1, "south", 0.8, GUILD_BN[0]);
  banner(vb, 10.5, Hh.uy - 0.1, Hh.r1.z1 + 1, "south", 0.8, GUILD_BN[1]);
  dormer(vb, P, "west", 9, 2, Hh.top + 1);
  chimney(vb, P, 4, 6, Hh.top + 3, Hh.ridge - 1);
  /* the stair tower */
  const tw = rect(13, 5, 17, 9),
    tt = Hh.top + 5;
  if (T) tower(vb, P, tw, 0, tt, { parapet: false, slitEvery: 4 });
  else {
    plinth(vb, P, tw);
    frameWalls(vb, P, tw, 1, tt, {
      inset: 0,
      ps: { south: [13, 15, 17], north: [13, 15, 17], east: [5, 7, 9], west: [5, 7, 9] },
    });
    for (const y of [5, 9]) vb.walls(13, y, 5, 17, y, 9, P.bx);
  }
  windows(vb, P, "south", 9, [15], tt - 3, 2, {});
  windows(vb, P, "east", 17, [7], tt - 3, 2, {});
  vb.set(15, tt - 5, 9, "gold_block");
  spireTop(vb, P, tw, tt, { fin: [P.fin, "gold_block"] });
  /* the yard: benches and anvil of the craftsmen, the court in front */
  path(
    vb,
    [5, 6, 7, 8, 9].flatMap((x) => [15, 16, 17, 18, 19].map((z) => [x, z])),
    P.paving,
  );
  lampPost(vb, P, 4, 18);
  lampPost(vb, P, 10, 18);
  vb.add(14, 0, 12, "anvil")
    .add(15, 0, 12, "table")
    .add(16, 0, 12, "barrel")
    .add(17, 0, 13, "crate")
    .add(17, 1, 13, "sacks");
  vb.add(14, 0, 15, "bench[facing=east]")
    .add(16, 0, 15, "grindstone")
    .add(17, 0, 16, "barrel")
    .add(14, 0, 17, "weapon_rack[facing=north]");
  fenceRect(vb, P.fence, 13, 10, 18, 18, 0, (x, z) => (z === 18 && x > 14 && x < 17) || z === 10 || x === 13);
  flagPole(vb, P, 15, 18, 1, 5, GUILD_BN[0], 1);
  bed(vb, 0, 5, 1, 12, ["shrub", null, "grass_tuft", "flower_yellow", null, null]);
  vb.add(2, 0, 15, "pot_yellow").add(12, 0, 15, "pot_blue").add(1, 0, 16, "barrel").add(1, 0, 17, "crate");
  return vb.model();
}

/* the academy: a stone hall of tall windows between buttresses, a round library tower under a blue cone, a court of clipped hedges */
export function academy(t) {
  const P = palette(t, "blue"),
    vb = model(20, 26, 20),
    T = P.t,
    r0 = rect(1, 6, 12, 13),
    Hh = hall(vb, P, {
      r: r0,
      up: 0,
      gh: 5,
      axis: "x",
      roof: false,
      gps: { south: [1, 4, 6, 7, 9, 12], north: [1, 4, 7, 9, 12], east: [6, 9, 13], west: [6, 9, 13] },
    }),
    gs = Hh.g("south");
  gabled(vb, P, r0, Hh.top, { alongX: true, prof: [1, 1, 2, 2, 2], gable: T ? "stone" : undefined, win: 3, winH: 2 });
  /* the portal under a gable of its own, tall windows either side */
  gabled(vb, P, rect(5, 10, 8, 13), Hh.top, {
    alongX: false,
    prof: [1, 1, 2],
    finAt: "hi",
    crest: false,
    gable: T ? "stone" : undefined,
    win: 1,
    winH: 2,
  });
  doorway(vb, P, "south", gs, 6, 1, { wide: true, arch: true, frame: T ? "polished_andesite" : false });
  windows(vb, P, "south", gs, [2, 3, 10, 11], 2, 4, T ? { sill: true, pane: "light_blue_stained_glass_pane" } : {});
  windows(vb, P, "north", Hh.g("north"), [2, 3, 5, 6, 10, 11], 2, 4, T ? { sill: true } : {});
  windows(
    vb,
    P,
    "west",
    Hh.g("west"),
    [
      [8, 2],
      [11, 2],
    ],
    2,
    4,
    T ? { sill: true } : {},
  );
  if (T) {
    buttress(vb, P, "south", 13, [1, 4, 9, 12], 0, 4);
    buttress(vb, P, "north", 6, [1, 4, 8, 12], 0, 4);
  }
  vb.set(5, 4, 14, "sconce[facing=south]").set(8, 4, 14, "sconce[facing=south]");
  dormer(vb, P, "south", 2, 13, Hh.top + 1);
  dormer(vb, P, "south", 10, 13, Hh.top + 1);
  /* the library tower */
  const cx = 15.5,
    cz = 6.5,
    wall = T ? P.wall : ["spruce_planks", "spruce_planks", "oak_planks"];
  roundTower(vb, P, cx, cz, 3.5, 0, 15, { wall, band: [5, 10, 15], bandB: T ? P.quoin : P.post, slit: false });
  for (const y of [7, 12]) {
    vb.set(15, y, 9, "window[east=true,west=true]").set(15, y + 1, 9, "window[east=true,west=true]");
    vb.set(18, y, 6, "window[north=true,south=true]").set(18, y + 1, 6, "window[north=true,south=true]");
    vb.set(15, y, 3, "window[east=true,west=true]").set(15, y + 1, 3, "window[east=true,west=true]");
  }
  vb.set(15, 1, 9, `${P.door}_door[facing=south,half=lower]`).set(15, 2, 9, `${P.door}_door[facing=south,half=upper]`);
  vb.disc(cx, cz, 4.5, 16, P.trim.sl + "[type=top]", 3.4);
  vb.cone(cx, cz, 3.5, 17, P.roof, 2, 1, true, P.trim, [P.fin, "gold_block"]);
  /* the court: hedges round a sundial, lamps, a reading bench */
  path(
    vb,
    [15, 16, 17, 18, 19].flatMap((z) => [
      [6, z],
      [7, z],
    ]),
    P.paving,
  );
  path(
    vb,
    [8, 9, 10, 11, 12, 13, 14, 15].map((x) => [x, 16]),
    P.paving,
  );
  path(
    vb,
    [10, 11, 12, 13, 14].map((z) => [15, z]),
    P.paving,
  );
  hedge(vb, 1, 15, 4, 15, "blue");
  hedge(vb, 1, 16, 1, 18);
  hedge(vb, 9, 18, 13, 18, "white");
  hedge(vb, 17, 11, 17, 17);
  vb.box(11, 0, 13, 11, 0, 13, "smooth_stone").set(11, 1, 13, "bell");
  vb.add(3, 0, 17, "bench[facing=north]").add(13, 0, 12, "lectern").add(12, 0, 15, "pot_blue");
  lampPost(vb, P, 5, 19);
  lampPost(vb, P, 8, 19);
  smallTree(vb, 16, 14, 0, 3, "birch_leaves", "birch_log");
  bed(vb, 2, 17, 4, 18, ["flower_blue", null, "flower_white", "grass_tuft", null]);
  bed(vb, 13, 17, 16, 17, ["flower_white", null, "flower_blue"]);
  return vb.model();
}

/* the observatory: a round tower with a gallery, a copper dome open on the sky and its telescope, the lodge of the astronomers at its foot */
export function observatory(t) {
  const P = palette(t, "copper"),
    vb = model(16, 22, 16),
    T = P.t,
    cx = 7.5,
    cz = 6.5,
    wall = T ? P.wall : ["spruce_planks", "spruce_planks", "oak_planks"],
    dm = T ? "cut_copper" : "dark_shingle";
  roundTower(vb, P, cx, cz, 4.5, 0, 10, { wall, band: [4, 10], bandB: T ? P.quoin : P.post, slit: false });
  /* the gallery and the dome */
  vb.disc(cx, cz, 5.5, 10, T ? "stone_brick_slab[type=top]" : P.wsl + "[type=top]", 4.4);
  for (let z = 0; z <= 13; z++)
    for (let x = 1; x <= 14; x++) {
      const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
      if (d <= 5.5 * 5.5 && d > 4.7 * 4.7 && (x + z) % 2) vb.set(x, 11, z, T ? "stone_brick_wall" : P.fence);
    }
  vb.disc(cx, cz, 4.5, 11, T ? P.quoin : P.post, 3.4);
  vb.dome(cx, cz, 3.9, 12, dm);
  /* the slit and the telescope looking south over the gallery */
  for (let y = 13; y <= 16; y++) vb.set(7, y, 6 + (16 - y), 0).set(7, y, 7 + (16 - y), 0);
  vb.set(7, 13, 8, "copper_block").set(7, 14, 9, "copper_block").set(7, 15, 10, "gold_block");
  vb.set(7, 12, 7, "spruce_planks");
  /* windows up the shaft, the door */
  for (const y of [2, 6]) {
    vb.set(7, y, 11, "window[east=true,west=true]").set(7, y + 1, 11, "window[east=true,west=true]");
    vb.set(12, y, 6, "window[north=true,south=true]").set(12, y + 1, 6, "window[north=true,south=true]");
    vb.set(3, y, 6, "window[north=true,south=true]").set(3, y + 1, 6, "window[north=true,south=true]");
  }
  /* the lodge against the tower */
  const L = hall(vb, P, {
    r: rect(10, 9, 14, 13),
    up: 0,
    axis: "z",
    feet: false,
    gps: { south: [10, 12, 14], east: [9, 11, 13], west: [9, 11, 13], north: [10, 14] },
    roof: { prof: [1, 1, 2], crest: false, finAt: "hi", m: T ? undefined : undefined },
  });
  doorway(vb, P, "south", L.g("south"), 11, 1, {});
  windows(vb, P, "south", L.g("south"), [13], 2, 2, T ? { sill: true } : { box: "blue" });
  windows(vb, P, "east", L.g("east"), [[11, 2]], 2, 2, T ? { sill: true } : {});
  /* instruments in the yard */
  path(
    vb,
    [
      [11, 14],
      [11, 15],
      [10, 15],
      [9, 15],
      [8, 15],
      [7, 15],
      [7, 14],
      [7, 13],
      [7, 12],
    ],
    P.paving,
  );
  vb.box(3, 0, 13, 5, 0, 15, T ? "smooth_stone" : "cobblestone")
    .set(4, 1, 14, "bell")
    .set(4, 0, 12, "lectern");
  vb.add(1, 0, 11, "table").add(1, 1, 11, "pot_blue").add(13, 0, 15, "barrel").add(14, 0, 15, "crate");
  lampPost(vb, P, 8, 13);
  bed(vb, 0, 13, 1, 15, ["grass_tuft", null, "flower_blue", null]);
  shrub(vb, 14, 2);
  shrub(vb, 1, 1, "white");
  return vb.model();
}

/* the bell tower: a tall belfry on a paved square, its great bell hung in the open under a spire */
export function bell(t) {
  const P = palette(t, "slate"),
    vb = model(12, 30, 12),
    T = P.t,
    r = rect(4, 4, 8, 8),
    top = 12;
  plaza(vb, 1, 1, 10, 10, T ? "paving" : "path", T ? "paving_dark" : "path");
  if (T) tower(vb, P, r, 0, top, { parapet: false, band: [4, 8], slitEvery: 4 });
  else {
    plinth(vb, P, r);
    frameWalls(vb, P, r, 1, top, {
      inset: 0,
      ps: { south: [4, 6, 8], north: [4, 6, 8], east: [4, 6, 8], west: [4, 6, 8] },
    });
    for (const y of [4, 8]) vb.walls(4, y, 4, 8, y, 8, P.bx);
    for (const y of [2, 6, 10]) {
      vb.set(5, y, 8, P.fill).set(7, y, 8, P.fill).set(5, y, 4, P.fill).set(7, y, 4, P.fill);
    }
  }
  plinth(vb, P, r, 0, {});
  doorway(vb, P, "south", 8, 6, 1, { frame: T ? "polished_andesite" : false });
  vb.set(6, 6, 8, "gold_block").set(6, 6, 4, "gold_block").set(4, 6, 6, "gold_block").set(8, 6, 6, "gold_block");
  /* the belfry: four piers, arches, the bell */
  const st = T ? "stone_brick_stairs" : P.wst,
    pier = T ? "stone_bricks" : P.post;
  parapet(vb, P, r, top + 1, { merlon: 0, cb: T ? "stone_bricks" : P.plank });
  for (const x of [4, 8]) for (const z of [4, 8]) vb.box(x, top + 2, z, x, top + 5, z, pier);
  for (const [a, b, f1, f2] of [[5, 7, "west", "east"]]) {
    for (const z of [4, 8]) vb.set(a, top + 5, z, stair(st, f1, "top")).set(b, top + 5, z, stair(st, f2, "top"));
    for (const x of [4, 8])
      vb.set(x, top + 5, a, stair(st, "north", "top")).set(x, top + 5, b, stair(st, "south", "top"));
  }
  vb.walls(4, top + 6, 4, 8, top + 6, 8, pier);
  vb.set(6, top + 5, 6, P.bx)
    .set(6, top + 4, 6, "gold_block")
    .set(6, top + 3, 6, "bell");
  vb.box(5, top + 6, 5, 7, top + 6, 7, P.plank);
  vb.hipRoof({
    x0: 3,
    z0: 3,
    x1: 9,
    z1: 9,
    y: top + 7,
    m: P.roof,
    t: P.trim,
    prof: [1, 2, 2, 3],
    fin: [P.fin, P.fin, "gold_block"],
  });
  /* the square */
  for (const [x, z] of [
    [1, 1],
    [10, 1],
    [1, 10],
    [10, 10],
  ])
    lampPost(vb, P, x, z);
  vb.add(3, 0, 10, "bench[facing=north]")
    .add(8, 0, 10, "bench[facing=north]")
    .add(1, 0, 6, "bench[facing=east]")
    .add(10, 0, 6, "bench[facing=west]");
  vb.add(5, 0, 9, "pot_red").add(7, 0, 9, "pot_red");
  vb.add(3, 0, 3, "shrub_white").add(9, 0, 3, "shrub_white");
  return vb.model();
}

/* the sanctuary: a chapel with buttresses and stained glass, a rose window over its porch, a round apse, a bell tower under a tall spire, the graveyard beside it */
export function sanctuary(t) {
  const P = palette(t, "green"),
    vb = model(20, 30, 20),
    T = P.t,
    nave = rect(7, 5, 14, 16),
    glass = ["red", "blue", "yellow", "green"].map((c) => `${c}_stained_glass_pane`),
    Hh = hall(vb, P, {
      r: nave,
      up: 0,
      gh: 5,
      axis: "z",
      roof: false,
      gps: { south: [7, 9, 12, 14], north: [7, 14], east: [5, 8, 11, 14, 16], west: [5, 8, 11, 14, 16] },
    }),
    gs = Hh.g("south");
  /* the apse behind the altar */
  const ax = 11,
    az = 4.5,
    aw = T ? P.wall : P.fill;
  for (let y = 0; y <= 5; y++) vb.disc(ax, az, 3, y, y === 0 ? P.base : aw);
  vb.set(10, 2, 1, glass[0] + "[east=true,west=true]").set(10, 3, 1, glass[0] + "[east=true,west=true]");
  vb.set(11, 2, 1, glass[1] + "[east=true,west=true]").set(11, 3, 1, glass[1] + "[east=true,west=true]");
  vb.cone(ax, az, 3, 6, P.roof, 1, 1, true, P.trim);
  gabled(vb, P, nave, Hh.top, {
    alongX: false,
    prof: [1, 1, 2, 2],
    gable: (u, v, far) =>
      far && Math.abs(u) < 1 && v >= 2 && v <= 3
        ? ["red_stained_glass_pane", "blue_stained_glass_pane"][v % 2] + "[east=true,west=true]"
        : T
          ? P.wall
          : P.fill,
  });
  /* the porch and the lancets */
  doorway(vb, P, "south", gs, 10, 1, { wide: true, arch: true, frame: T ? "polished_andesite" : false });
  porch(vb, P, "south", 16, 10, 1, { d: 2, hw: 2, h: 4, post: T ? "stone_brick_wall" : P.fence });
  for (const s of ["east", "west"]) {
    const cs = [6, 7, 9, 10, 12, 13];
    cs.forEach((c, i) => windows(vb, P, s, Hh.g(s), [c], 2, 4, { pane: glass[(i >> 1) % 4], sill: T }));
    if (T) buttress(vb, P, s, s === "east" ? 14 : 7, [5, 8, 11, 14], 0, 5);
  }
  /* the bell tower */
  const tw = rect(2, 11, 6, 15),
    tt = 15;
  if (T) tower(vb, P, tw, 0, tt, { parapet: false, band: [6, 11], slitEvery: 4 });
  else {
    plinth(vb, P, tw);
    frameWalls(vb, P, tw, 1, tt, {
      inset: 0,
      ps: { south: [2, 4, 6], north: [2, 4, 6], east: [11, 13, 15], west: [11, 13, 15] },
    });
    for (const y of [6, 11]) vb.walls(2, y, 11, 6, y, 15, P.bx);
  }
  for (const [x, z, s] of [
    [4, 15, "s"],
    [4, 11, "n"],
    [2, 13, "w"],
  ]) {
    const st = s === "w" ? "[north=true,south=true]" : "[east=true,west=true]";
    vb.set(x, tt - 2, z, "iron_bars" + st).set(x, tt - 3, z, "iron_bars" + st);
  }
  vb.set(4, tt - 2, 13, "bell");
  spireTop(vb, P, tw, tt, { prof: [1, 2, 3, 3], fin: [P.fin, P.fin, "gold_block"] });
  /* the graveyard and the garden */
  path(
    vb,
    [17, 18, 19].flatMap((z) => [
      [10, z],
      [11, z],
    ]),
    P.paving,
  );
  for (const [x, z] of [
    [16, 6],
    [18, 6],
    [16, 9],
    [18, 9],
    [17, 12],
    [16, 14],
    [18, 14],
  ])
    vb.add(x, 0, z, "headstone[facing=south]").add(x, 0, z + 1, (x + z) % 3 ? "flower_white" : "grass_tuft");
  cypress(vb, 17, 2, 0, 7);
  cypress(vb, 18, 17, 0, 6);
  cypress(vb, 2, 2, 0, 8);
  cypress(vb, 4, 7, 0, 6);
  fenceRect(
    vb,
    T ? "stone_brick_wall" : P.fence,
    0,
    0,
    19,
    19,
    0,
    (x, z) => (z === 19 && x >= 9 && x <= 12) || z === 0 || (x === 0 && z < 10),
  );
  lampPost(vb, P, 8, 19);
  lampPost(vb, P, 13, 19);
  bed(vb, 1, 17, 6, 18, ["flower_white", null, "grass_tuft", null, "flower_red", null, null]);
  bed(vb, 14, 17, 16, 18, ["shrub_white", null, null, "flower_yellow"]);
  return vb.model();
}

/* the embassy: a formal house of two floors under a hipped roof, a pediment over a columned porch and its balcony, the flags of the realms along the court */
export function embassy(t) {
  const P = palette(t, "slate"),
    vb = model(20, 22, 20),
    T = P.t,
    r = rect(3, 3, 16, 11),
    pl = ["plaster", "plaster", "plaster", "plaster_dark"],
    ps = { south: [3, 6, 8, 11, 13, 16], north: [3, 6, 9, 10, 13, 16], east: [3, 7, 11], west: [3, 7, 11] };
  plinth(vb, P, r);
  if (T) {
    stoneWalls(vb, P, r, 1, 4);
    stoneWalls(vb, P, r, 5, 9, { wall: pl, band: 5 });
  } else {
    frameWalls(vb, P, r, 1, 4, { inset: 0, ps });
    frameWalls(vb, P, r, 5, 9, { inset: 0, ps });
  }
  /* cornice and hipped roof */
  const g = grow(r, 1),
    cst = T ? "stone_brick_stairs" : P.wst;
  for (let x = g.x0; x <= g.x1; x++)
    vb.set(x, 9, g.z0, stair(cst, "south", "top")).set(x, 9, g.z1, stair(cst, "north", "top"));
  for (let z = g.z0; z <= g.z1; z++)
    vb.set(g.x0, 9, z, stair(cst, "east", "top")).set(g.x1, 9, z, stair(cst, "west", "top"));
  vb.hipRoof({ x0: g.x0, z0: g.z0, x1: g.x1, z1: g.z1, y: 10, m: P.roof, t: P.trim, prof: [1, 1, 1, 1, 2] });
  /* the middle bay: columns, a balcony, a pediment */
  const bay = rect(8, 11, 11, 12);
  vb.box(8, 0, 12, 11, 0, 13, P.base);
  if (T) {
    stoneWalls(vb, P, bay, 1, 4);
    stoneWalls(vb, P, bay, 5, 9, { wall: pl, band: 5 });
  } else {
    frameWalls(vb, P, bay, 1, 4, { inset: 0, ps: { south: [8, 11] }, skip: { north: true } });
    frameWalls(vb, P, bay, 5, 9, { inset: 0, ps: { south: [8, 11] }, skip: { north: true } });
  }
  gabled(vb, P, rect(8, 9, 11, 12), 9, {
    alongX: false,
    prof: [1, 1, 1],
    finAt: "hi",
    crest: false,
    gable: T ? "stone" : undefined,
    wall: pl,
    win: 1,
    winH: 1,
  });
  doorway(vb, P, "south", 12, 9, 1, { wide: true, arch: true, step: false });
  for (const x of [8, 11]) vb.box(x, 1, 14, x, 3, 14, T ? "stone_brick_wall" : P.fence).set(x, 0, 14, P.base);
  vb.box(8, 4, 13, 11, 4, 14, T ? "stone_brick_slab[type=top]" : P.wsl + "[type=top]");
  for (let x = 8; x <= 11; x++)
    vb.set(x, 5, 14, T ? "stone_brick_wall[east=true,west=true]" : `${P.fence}[east=true,west=true]`);
  for (const x of [8, 11])
    vb.set(x, 5, 13, T ? "stone_brick_wall[north=true,south=true]" : `${P.fence}[north=true,south=true]`);
  for (const x of [9, 10])
    vb.set(x, 5, 12, `${P.door}_door[facing=south,half=lower]`).set(
      x,
      6,
      12,
      `${P.door}_door[facing=south,half=upper]`,
    );
  vb.set(9, 0, 14, stair(P.sst, "north")).set(10, 0, 14, stair(P.sst, "north"));
  banner(vb, 8.5, 8.9, 13, "south", 0.8, REALMS[0]);
  banner(vb, 11.5, 8.9, 13, "south", 0.8, REALMS[1]);
  /* windows in ranks: shutters below, flower boxes above */
  for (const [y, h] of [
    [2, 2],
    [6, 3],
  ]) {
    windows(vb, P, "south", 11, [4, 5, 14, 15], y, h, y === 2 ? { sill: T, shutter: true } : { box: ["red", "blue"] });
    windows(vb, P, "north", 3, [4, 5, 7, 8, 11, 12, 14, 15], y, h, {});
    windows(vb, P, "east", 16, [4, 5, 9, 10], y, h, {});
    windows(vb, P, "west", 3, [4, 5, 9, 10], y, h, {});
  }
  dormer(vb, P, "south", 5, 11, 10);
  dormer(vb, P, "south", 14, 11, 10);
  dormer(vb, P, "north", 9, 3, 10, { w: 2 });
  chimney(vb, P, 5, 7, 12, 16);
  chimney(vb, P, 14, 7, 12, 16);
  /* the court: paving, the flags of four realms, hedges, a basin, gate piers */
  plaza(vb, 7, 15, 12, 19, T ? "paving" : "path", T ? "paving_dark" : "path");
  [
    [5, 16],
    [14, 16],
    [5, 19],
    [14, 19],
  ].forEach(([x, z], i) => flagPole(vb, P, x, z, 0, 7, REALMS[i]));
  hedge(vb, 1, 14, 3, 14, "red");
  hedge(vb, 1, 15, 1, 18);
  hedge(vb, 16, 14, 18, 14, "white");
  hedge(vb, 18, 15, 18, 18);
  for (const x of [6, 13]) vb.box(x, 0, 19, x, 1, 19, T ? "stone_bricks" : P.post).set(x, 2, 19, "lantern");
  vb.box(2, 0, 16, 3, 0, 17, "water")
    .add(16, 0, 16, "bench[facing=west]")
    .add(16, 0, 17, "pot_red")
    .add(3, 0, 18, "pot_yellow");
  cypress(vb, 1, 1, 0, 7);
  cypress(vb, 18, 1, 0, 7);
  bed(vb, 0, 4, 1, 12, ["grass_tuft", null, null, "shrub", null, "flower_red", null]);
  bed(vb, 18, 4, 19, 12, [null, "grass_tuft", null, "flower_blue", null]);
  return vb.model();
}
