import {
  bed,
  breast,
  cart,
  chimney,
  doorway,
  dormer,
  dummy,
  fenceCells,
  fenceLine,
  fenceRect,
  flowers,
  gabled,
  goods,
  hall,
  logPile,
  logWalls,
  model,
  palette,
  path,
  plankWalls,
  plinth,
  porch,
  rect,
  shrub,
  smallTree,
  spruce,
  stair,
  stoneWalls,
  well,
  windows,
} from "../voxel-kit.js";

/* ---- homes and the working buildings of the village: houses (three looks), farm, storehouse, granary, forester's lodge, orchard ---- */

/* look 0: a cottage under a long roof, a gabled bay over the door, a chimney breast on the east gable, a fenced front garden */
function cottage(P) {
  const vb = model(12, 20, 12),
    T = P.t,
    main = rect(1, 3, 9, 8),
    bay = rect(4, 8, 6, 10),
    M = hall(vb, P, {
      r: main,
      axis: "x",
      roof: false,
      gps: { south: [1, 4, 6, 9], north: [1, 4, 6, 9], east: [3, 8], west: [3, 5, 8] },
      ups: { south: [1, 4, 6, 9], north: [1, 4, 6, 9], east: [3, 8], west: [3, 5, 8] },
      gbrace: { north: [0, 2] },
      ubrace: { north: [1] },
    }),
    B = hall(vb, P, {
      r: bay,
      axis: "z",
      roof: false,
      feet: false,
      gps: { south: [4, 6] },
      ups: { south: [4, 6] },
      skip: { north: true },
    });
  gabled(vb, P, rect(4, 6, 6, 10), B.top, { alongX: false, prof: [1, 1, 2], finAt: "hi", crest: false });
  gabled(vb, P, main, M.top, { alongX: true, win: 2 });
  /* the door in the bay, windows either side */
  doorway(vb, P, "south", B.g("south"), 5, 1, { frame: T ? "polished_andesite" : false });
  vb.add(4, 3, 11, "lantern[hanging=true]");
  windows(
    vb,
    P,
    "south",
    M.g("south"),
    [
      [2, 2],
      [7, 2],
    ],
    2,
    2,
    T ? { sill: true, shutter: true } : { box: ["red", "yellow"] },
  );
  windows(
    vb,
    P,
    "north",
    M.g("north"),
    [
      [2, 2],
      [7, 2],
    ],
    2,
    2,
    T ? { sill: true } : {},
  );
  windows(vb, P, "west", M.g("west"), [[6, 2]], 2, 2, T ? { sill: true } : { box: "pink" });
  if (T) {
    windows(
      vb,
      P,
      "south",
      M.u("south"),
      [
        [2, 2],
        [7, 2],
      ],
      M.uy + 1,
      2,
      { box: ["red", "white"] },
    );
    windows(vb, P, "south", B.u("south"), [5], B.uy + 1, 2, { box: "yellow" });
    windows(
      vb,
      P,
      "north",
      M.u("north"),
      [
        [2, 2],
        [7, 2],
      ],
      M.uy + 1,
      2,
      {},
    );
    windows(vb, P, "west", M.u("west"), [4, [6, 2]], M.uy + 1, 2, {});
  }
  dormer(vb, P, "north", 5, 3, M.top + 1);
  breast(vb, P, "east", 10, 5, 6, 0, M.ridge + 1, { sh: M.top - 2 });
  /* the garden */
  path(vb, [[5, 11]], P.paving);
  fenceCells(
    vb,
    P.fence,
    [0, 1, 2, 3, 7, 8, 9, 10, 11].map((x) => [x, 11]),
  );
  vb.set(4, 0, 11, P.post).set(6, 0, 11, P.post).set(4, 1, 11, "lantern").set(6, 1, 11, "pot_red");
  bed(vb, 1, 9, 3, 10, ["flower_red", "grass_tuft", "flower_yellow", null, "flower_white", "shrub"]);
  bed(vb, 7, 9, 9, 10, ["shrub_pink", null, "flower_blue", "grass_tuft", null]);
  vb.add(11, 0, 8, "barrel").add(11, 0, 9, "barrel").add(11, 1, 8, "sacks");
  vb.add(0, 0, 9, "bench[facing=east]");
  shrub(vb, 0, 4);
  shrub(vb, 0, 6, "white");
  return vb.model();
}

/* look 1: a town house, its gable to the street. In stone the upper floor jetties out over the ground floor on three sides */
function townHouse(P) {
  const vb = model(12, 21, 12),
    T = P.t,
    Hh = hall(vb, P, {
      r: rect(2, 2, 9, 8),
      jet: { south: 1, east: 1, west: 1 },
      axis: "z",
      gps: { south: [2, 4, 6, 9], north: [2, 5, 9], east: [2, 5, 8], west: [2, 5, 8] },
      gbrace: { north: true, east: [0], west: [0] },
      ups: { south: [1, 4, 7, 10], north: [1, 4, 7, 10], east: [2, 6, 9], west: [2, 6, 9] },
      ubrace: { south: [1], north: true },
      roof: { prof: [1, 1, 2, 2, 2], win: 3 },
    }),
    gs = Hh.g("south");
  /* ground floor: the door between two posts, a small window and a large one */
  doorway(vb, P, "south", gs, 5, 1, { lantern: true, frame: T ? "polished_andesite" : false });
  windows(vb, P, "south", gs, [[7, 2]], 2, 2, T ? { sill: true } : { box: "red" });
  windows(vb, P, "south", gs, [3], 2, 2, T ? { sill: true } : {});
  windows(vb, P, "west", Hh.g("west"), [[6, 2]], 2, 2, T ? { sill: true } : { box: "yellow" });
  windows(vb, P, "east", Hh.g("east"), [[6, 2]], 2, 2, T ? { sill: true } : {});
  if (T) {
    /* the jettied floor */
    windows(
      vb,
      P,
      "south",
      Hh.u("south"),
      [
        [2, 2],
        [8, 2],
      ],
      Hh.uy + 1,
      2,
      { box: ["red", "yellow"] },
    );
    windows(vb, P, "west", Hh.u("west"), [4, [7, 2]], Hh.uy + 1, 2, { box: "pink" });
    windows(vb, P, "east", Hh.u("east"), [4, [7, 2]], Hh.uy + 1, 2, {});
    vb.set(5, Hh.uy, 9, "shield_red[facing=south]").set(6, Hh.uy, 9, "shield_blue[facing=south]");
    dormer(vb, P, "east", 5, 9, 10);
    dormer(vb, P, "west", 5, 2, 10);
    chimney(vb, P, 7, 3, 12, 17);
  } else {
    dormer(vb, P, "east", 5, 8, 5);
    chimney(vb, P, 7, 3, 7, 11);
  }
  /* the street */
  path(
    vb,
    [3, 4, 5, 6, 7, 8].flatMap((x) => [
      [x, 10],
      [x, 11],
    ]),
    P.paving,
  );
  vb.set(4, 3, gs + 1, "hanging_sign[facing=south]");
  vb.add(9, 0, 10, "barrel").add(10, 0, 9, "crate").add(10, 0, 10, "barrel").add(10, 1, 10, "sacks");
  vb.add(2, 0, 10, "pot_red").add(1, 0, 10, "bench[facing=east]");
  shrub(vb, 0, 4, "yellow");
  shrub(vb, 0, 6);
  flowers(vb, 0, 5, "red");
  bed(vb, 10, 3, 11, 6, ["grass_tuft", null, "flower_white", null, null]);
  fenceLine(vb, P.fence, 0, 8, 0, 9);
  return vb.model();
}

/* look 2: a long house with a low kitchen wing in front, the door in their corner under a porch, a well and a kitchen garden in the yard */
function wingHouse(P) {
  const vb = model(12, 20, 12),
    T = P.t,
    main = rect(1, 1, 10, 6),
    wing = rect(6, 6, 10, 10),
    M = hall(vb, P, {
      r: main,
      axis: "x",
      roof: false,
      gps: { south: [1, 4, 6, 10], north: [1, 4, 7, 10], east: [1, 4, 6], west: [1, 4, 6] },
      ups: { south: [1, 4, 7, 10], north: [1, 4, 7, 10], east: [1, 4, 6], west: [1, 4, 6] },
      gbrace: { north: [1] },
      ubrace: { north: [1], south: [1] },
    }),
    Wg = hall(vb, P, {
      r: wing,
      axis: "z",
      up: 0,
      roof: false,
      feet: false,
      skip: { north: true },
      gps: { south: [6, 8, 10], east: [6, 8, 10], west: [6, 8, 10] },
    });
  gabled(vb, P, rect(6, T ? 7 : 4, 10, 10), Wg.top, {
    alongX: false,
    prof: [1],
    finAt: "hi",
    crest: false,
    win: 1,
    winH: 1,
  });
  gabled(vb, P, main, M.top, { alongX: true, win: 2 });
  /* the door in the corner, under a porch */
  doorway(vb, P, "south", M.g("south"), 3, 1, {});
  porch(vb, P, "south", 6, 3, 1, { d: 2, hw: 1, h: 3 });
  windows(vb, P, "south", Wg.g("south"), [7, 9], 2, 2, T ? { sill: true, shutter: true } : { box: "red" });
  windows(vb, P, "east", Wg.g("east"), [7, 9], 2, 2, T ? { sill: true } : {});
  windows(vb, P, "west", Wg.g("west"), [[8, 2]], 2, 2, T ? { sill: true } : { box: "yellow" });
  windows(
    vb,
    P,
    "north",
    M.g("north"),
    [
      [2, 2],
      [5, 2],
      [8, 2],
    ],
    2,
    2,
    T ? { sill: true } : {},
  );
  windows(vb, P, "west", M.g("west"), [[2, 2]], 2, 2, T ? { sill: true } : {});
  windows(vb, P, "east", M.g("east"), [[2, 2]], 2, 2, T ? { sill: true } : {});
  if (T) {
    windows(
      vb,
      P,
      "south",
      M.u("south"),
      [
        [2, 2],
        [8, 2],
      ],
      M.uy + 1,
      2,
      { box: ["red", "white"] },
    );
    windows(
      vb,
      P,
      "north",
      M.u("north"),
      [
        [2, 2],
        [8, 2],
      ],
      M.uy + 1,
      2,
      {},
    );
    windows(vb, P, "west", M.u("west"), [[2, 2]], M.uy + 1, 2, { box: "pink" });
    windows(vb, P, "east", M.u("east"), [[2, 2]], M.uy + 1, 2, {});
  }
  chimney(vb, P, 8, 2, M.top + 2, M.ridge + 1);
  dormer(vb, P, "north", 3, 1, M.top + 1);
  dormer(vb, P, "south", 3, 6, M.top + 1);
  /* the yard: well, vegetables, a fence */
  well(vb, P, 1, 9);
  path(
    vb,
    [
      [3, 7],
      [3, 8],
      [3, 9],
      [4, 9],
      [4, 10],
      [4, 11],
    ],
    P.paving,
  );
  for (const [x, c] of [
    [0, "cabbage"],
    [1, "carrot"],
    [2, "wheat"],
  ])
    vb.add(x, 0, 11, `crop_${c}`);
  vb.add(5, 0, 9, "barrel").add(5, 0, 10, "pot_yellow").add(5, 0, 11, "sacks");
  bed(vb, 11, 6, 11, 10, ["shrub", null, "flower_white", "grass_tuft"]);
  bed(vb, 0, 7, 0, 7, ["shrub_pink"]);
  return vb.model();
}

const HOUSE_STONE = ["red", "slate", "blue"];
export function house(t, look) {
  const v = (look | 0) % 3;
  const P = palette(t, t ? HOUSE_STONE[v] : v === 1 ? undefined : "thatch");
  return [cottage, townHouse, wingHouse][v](P);
}

/* the farm: a barn under a gambrel roof with a hay loft and a hoist, a cart shed under the same slope, fenced fields with a scarecrow, a pen with a hen house */
export function farm(t) {
  const P = palette(t, "thatch"),
    vb = model(16, 14, 16),
    T = P.t,
    barn = rect(1, 1, 8, 8),
    ps = { south: [3, 6], north: [3, 6], east: [4, 5], west: [4, 5] };
  plinth(vb, P, barn);
  if (T) {
    stoneWalls(vb, P, barn, 1, 3);
    plankWalls(vb, P, barn, 4, 5, { ps });
  } else plankWalls(vb, P, barn, 1, 5, { rail: 3, ps });
  gabled(vb, P, barn, 5, {
    alongX: false,
    prof: [2, 2, 1, 1],
    gable: (u, v, far) => {
      const a = Math.abs(u);
      if (v < 2) return null;
      if (v === 4) return P.bx;
      if (a === 1.5) return P.post;
      return a < 1 && v < 4 ? (far ? "hay_block" : P.pane) : P.plank;
    },
  });
  /* the barn doors, the hoist over them */
  doorway(vb, P, "south", 8, 4, 1, { wide: true, arch: true, frame: true, step: false });
  vb.set(4, 8, 9, P.bz).set(4, 8, 10, P.bz).set(4, 7, 10, "chain").set(4, 6, 10, "chain").set(4, 5, 10, "hay_block");
  windows(vb, P, "west", 1, [3, 6], 2, 1, T ? { sill: true } : {});
  vb.set(3, 3, 9, "sconce[facing=south]").set(6, 3, 9, "sconce[facing=south]");
  /* the cart shed: the roof of the barn runs on down over it */
  vb.shed({ x0: 10, x1: 13, z0: 1, z1: 8, y: 1, dir: "east", m: P.roof, t: P.trim });
  for (const z of [1, 4, 8]) vb.box(12, 0, z, 12, 1, z, P.fence);
  vb.set(10, 0, 2, "hay_block").set(10, 1, 2, "hay_block").set(11, 0, 2, "hay_block").set(10, 0, 3, "hay_block");
  cart(vb, P, 9, 5, "sacks");
  vb.set(10, 0, 7, "barrel").set(11, 0, 7, "sacks");
  /* the fields */
  fenceRect(vb, P.fence, 0, 10, 9, 15, 0, (x, z) => z === 10 && (x === 4 || x === 5));
  for (let x = 1; x <= 8; x++)
    for (let z = 11; z <= 14; z++)
      vb.set(x, 0, z, x === 5 ? "path" : x < 5 ? "crop_wheat" : z < 13 ? "crop_cabbage" : "crop_carrot");
  dummy(vb, P, 2, 12);
  path(
    vb,
    [
      [4, 9],
      [5, 9],
      [4, 10],
      [5, 10],
      [6, 9],
      [7, 9],
      [8, 9],
      [9, 9],
      [10, 9],
    ],
    "path",
  );
  vb.add(1, 0, 9, "hay_block").add(2, 0, 9, "hay_block").add(1, 1, 9, "hay_block").add(3, 0, 9, "basket_yellow");
  /* the pen: a trough, straw, a hen house on legs */
  fenceRect(vb, P.fence, 11, 10, 15, 15, 0, (x, z) => z === 10 && x === 13);
  vb.set(12, 0, 11, "water_low").set(12, 0, 12, "water_low").set(14, 0, 11, "hay_block");
  for (const [x, z] of [
    [13, 13],
    [14, 13],
    [13, 14],
    [14, 14],
  ])
    vb.set(x, 0, z, P.fence).set(x, 1, z, P.plank);
  for (const z of [13, 14]) vb.set(13, 2, z, stair(P.roof.st, "east")).set(14, 2, z, stair(P.roof.st, "west"));
  vb.set(12, 0, 14, "ladder[facing=west]");
  vb.add(14, 0, 9, "hay_block").add(15, 0, 9, "hay_block").add(15, 1, 9, "hay_block").add(13, 0, 9, "barrel");
  return vb.model();
}

/* the storehouse: a long warehouse, a loading gable with a hoist over its great door, a dock stacked with goods, a lean-to full of barrels */
export function storage(t) {
  const P = palette(t, "slate"),
    vb = model(16, 22, 16),
    T = P.t,
    main = rect(1, 3, 12, 10),
    M = hall(vb, P, {
      r: main,
      axis: "x",
      roof: false,
      gh: 4,
      jet: { south: 1 },
      gps: { south: [1, 4, 5, 8, 9, 12], north: [1, 4, 7, 9, 12], east: [3, 6, 10], west: [3, 6, 10] },
      ups: { south: [1, 4, 5, 8, 9, 12], north: [1, 5, 8, 12], east: [3, 7, 11], west: [3, 7, 11] },
      gbrace: { north: [0, 3] },
      ubrace: { north: [0, 2] },
    }),
    zf = M.r1.z1;
  /* the loading gable, then the long roof */
  gabled(vb, P, rect(5, 7, 8, zf), M.top, {
    alongX: false,
    prof: [1, 1, 2],
    finAt: "hi",
    crest: false,
    gable: (u, v) => {
      const a = Math.abs(u);
      if (v < 1) return null;
      return v === 3 ? P.bx : a === 1.5 ? P.post : P.plank;
    },
  });
  gabled(vb, P, M.r1, M.top, { alongX: true, prof: [1, 1, 2, 2, 2], win: 3 });
  vb.set(6, M.top + 3, zf + 1, P.bz)
    .set(6, M.top + 3, zf + 2, P.bz)
    .set(6, M.top + 2, zf + 2, "chain")
    .set(6, M.top + 1, zf + 2, "chain")
    .set(6, M.top, zf + 2, "crate");
  /* the great door and the dock */
  doorway(vb, P, "south", M.g("south"), 6, 1, {
    wide: true,
    arch: true,
    frame: T ? "polished_andesite" : false,
    step: false,
  });
  windows(
    vb,
    P,
    "south",
    M.g("south"),
    [
      [2, 2],
      [10, 2],
    ],
    2,
    2,
    T ? { sill: true, shutter: true } : {},
  );
  windows(
    vb,
    P,
    "north",
    M.g("north"),
    [
      [5, 2],
      [10, 2],
    ],
    3,
    1,
    {},
  );
  windows(vb, P, "west", M.g("west"), [[7, 2]], 2, 2, T ? { sill: true } : {});
  if (T) {
    windows(
      vb,
      P,
      "south",
      M.u("south"),
      [
        [2, 2],
        [10, 2],
      ],
      M.uy + 1,
      2,
      { shutter: false },
    );
    windows(
      vb,
      P,
      "north",
      M.u("north"),
      [
        [2, 2],
        [6, 2],
        [9, 2],
      ],
      M.uy + 1,
      2,
      {},
    );
    windows(
      vb,
      P,
      "west",
      M.u("west"),
      [
        [4, 2],
        [8, 2],
      ],
      M.uy + 1,
      2,
      {},
    );
    windows(
      vb,
      P,
      "east",
      M.u("east"),
      [
        [4, 2],
        [8, 2],
      ],
      M.uy + 1,
      2,
      {},
    );
  }
  vb.box(4, 0, 11, 9, 0, 13, P.plank);
  vb.set(6, 0, 14, stair(P.wst, "north")).set(7, 0, 14, stair(P.wst, "north"));
  goods(vb, 4, 12, 5, 13, 1, ["crate", "barrel", "crate"]);
  goods(vb, 8, 12, 9, 13, 1, ["sacks", "crate", "barrel"]);
  vb.set(5, 3, 11, "lantern[hanging=true]").set(8, 3, 11, "lantern[hanging=true]");
  /* the lean-to against the east gable */
  vb.shed({ x0: 13, x1: 15, z0: 4, z1: 9, y: 2, dir: "east", m: P.roof, t: P.trim });
  for (const z of [4, 9]) vb.box(15, 0, z, 15, 1, z, P.fence);
  goods(vb, 13, 5, 14, 8, 0, ["barrel", "barrel", "crate", "sacks"]);
  /* the yard */
  cart(vb, P, 0, 12, "crate");
  logPile(vb, 11, 12, 4, "x", "spruce_log");
  vb.add(1, 0, 11, "barrel").add(2, 0, 11, "barrel").add(1, 1, 11, "barrel").add(3, 0, 11, "crate");
  vb.add(13, 0, 14, "crate").add(14, 0, 14, "crate").add(13, 1, 14, "sacks").add(15, 0, 13, "barrel");
  return vb.model();
}

/* the granary: a windmill on a round base with a gallery, its four sails to the south, and a grain loft raised on staddle stones out of reach of the rats */
export function granary(t) {
  const P = palette(t, "thatch"),
    vb = model(16, 22, 16),
    T = P.t,
    cx = 5.5,
    cz = 6.5,
    low = T ? P.wall : ["cobblestone", "cobblestone", "andesite", "mossy_cobblestone"],
    upw = T ? ["plaster", "plaster", "plaster", "plaster_dark"] : "spruce_planks";
  /* the tower: a wide base, a gallery on brackets, a slimmer shaft, a cap */
  for (let y = 0; y <= 5; y++) vb.disc(cx, cz, 3.5, y, y === 0 ? P.base : low);
  vb.disc(cx, cz, 3.5, 3, P.quoin, 2.45);
  vb.disc(cx, cz, 4.6, 5, P.wsl + "[type=top]", 3.5);
  for (let z = 1; z <= 11; z++)
    for (let x = 0; x <= 10; x++) {
      const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
      if (d <= 4.6 * 4.6 && d > 3.75 * 3.75) vb.set(x, 6, z, P.fence);
    }
  for (let y = 6; y <= 12; y++) vb.disc(cx, cz, 2.6, y, upw);
  for (const y of [6, 12]) vb.disc(cx, cz, 2.6, y, P.post, 1.55);
  vb.cone(cx, cz, 2.6, 13, P.roof, 1, 1, true, P.trim, P.fence);
  /* door and windows */
  vb.set(5, 1, 9, `${P.door}_door[facing=south,half=lower]`).set(5, 2, 9, `${P.door}_door[facing=south,half=upper]`);
  vb.set(5, 0, 10, stair(P.sst, "north"));
  vb.set(8, 2, 6, "window[north=true,south=true]").set(2, 2, 6, "window[north=true,south=true]");
  vb.set(7, 9, 6, "window[north=true,south=true]")
    .set(3, 9, 6, "window[north=true,south=true]")
    .set(5, 9, 4, "window[east=true,west=true]");
  /* the wind shaft and the four sails */
  vb.set(5, 11, 9, `${P.wood}_log[axis=z]`)
    .set(5, 11, 10, `${P.wood}_log[axis=z]`)
    .set(5, 11, 11, `${P.wood}_log[axis=z]`);
  for (let i = 1; i <= 5; i++) {
    vb.set(5, 11 + i, 11, "sail[facing=south]").set(5, 11 - i, 11, "sail[facing=south]");
    vb.set(5 + i, 11, 11, "sail_h[facing=south]").set(5 - i, 11, 11, "sail_h[facing=south]");
  }
  /* the grain loft on staddle stones */
  const loft = rect(10, 3, 14, 8);
  for (const x of [10, 12, 14]) for (const z of [3, 6, 8]) vb.set(x, 0, z, P.wallb);
  vb.box(10, 1, 3, 14, 1, 8, P.plank);
  const L = hall(vb, P, {
    r: loft,
    y: 1,
    plinth: false,
    gh: 2,
    up: 0,
    ground: "frame",
    axis: "z",
    gps: { south: [10, 12, 14], north: [10, 12, 14], east: [3, 6, 8], west: [3, 6, 8] },
    roof: { prof: [1, 1, 2], crest: false },
  });
  vb.set(11, 2, L.g("south"), `${P.door}_door[facing=south,half=lower]`).set(
    11,
    3,
    L.g("south"),
    `${P.door}_door[facing=south,half=upper]`,
  );
  vb.set(11, 1, 9, stair(P.wst, "north")).set(11, 0, 10, stair(P.wst, "north"));
  windows(vb, P, "south", L.g("south"), [13], 3, 1, {});
  windows(vb, P, "east", L.g("east"), [[4, 2]], 3, 1, {});
  /* the yard: sacks, a millstone, a cart of grain, sheaves */
  vb.add(9, 0, 10, "millstone[facing=east]").add(1, 0, 10, "sacks").add(2, 0, 11, "sacks").add(1, 1, 10, "sacks");
  cart(vb, P, 11, 12, "sacks");
  vb.add(1, 0, 13, "hay_block").add(2, 0, 13, "hay_block").add(1, 1, 13, "hay_block").add(3, 0, 14, "barrel");
  path(
    vb,
    [
      [5, 11],
      [5, 12],
      [5, 13],
      [6, 13],
      [7, 13],
      [8, 13],
      [9, 13],
      [5, 14],
      [5, 15],
    ],
    P.paving,
  );
  for (const [x, z] of [
    [7, 15],
    [8, 15],
    [9, 15],
    [8, 14],
  ])
    vb.add(x, 0, z, "crop_wheat");
  bed(vb, 0, 1, 1, 3, ["grass_tuft", null, "flower_yellow", null]);
  return vb.model();
}

/* the forester's lodge: a cabin of crossed logs with a fieldstone chimney and a porch, a wood shed, a saw horse, stumps, piles and tall trees */
export function forester(t) {
  const P = palette(t, "green"),
    vb = model(16, 16, 16),
    lg = P.t ? "dark_oak_log" : "spruce_log",
    cab = rect(2, 3, 8, 8);
  plinth(vb, P, cab, 0, { feet: false });
  logWalls(vb, P, cab, 1, 4, lg);
  gabled(vb, P, cab, 4, { alongX: true, gable: (u, v) => (v >= 1 ? `${lg}[axis=z]` : null), end: 2, under: false });
  doorway(vb, P, "south", 8, 5, 1, { frame: false });
  porch(vb, P, "south", 8, 5, 1, { d: 2, hw: 1, h: 3 });
  windows(vb, P, "south", 8, [3, 7], 2, 1, { box: "white" });
  windows(vb, P, "north", 3, [4, 6], 2, 1, {});
  breast(vb, P, "west", 0, 5, 6, 0, 11, { block: ["cobblestone", "andesite", "mossy_cobblestone", "stone"], sh: 3 });
  /* the wood shed */
  vb.shed({ x0: 12, x1: 14, z0: 2, z1: 8, y: 2, dir: "east", m: P.roof, t: P.trim });
  for (const z of [2, 5, 8]) vb.box(14, 0, z, 14, 1, z, P.fence);
  for (const z of [2, 8]) vb.box(12, 0, z, 12, 3, z, P.fence);
  vb.box(12, 0, 3, 13, 1, 4, "oak_log[axis=x]")
    .box(12, 0, 6, 13, 0, 7, "birch_log[axis=x]")
    .set(12, 1, 6, "birch_log[axis=x]");
  vb.set(12, 2, 3, "oak_log[axis=x]");
  /* the saw horse, the chopping block, the piles */
  vb.set(5, 0, 12, P.fence).set(8, 0, 12, P.fence).box(4, 1, 12, 9, 1, 12, "stripped_oak_log[axis=x]");
  vb.set(2, 0, 12, "oak_log").set(1, 0, 14, "spruce_log").set(3, 0, 15, "oak_log");
  logPile(vb, 5, 14, 4, "x", "oak_log");
  logPile(vb, 11, 10, 3, "z", "birch_log");
  path(
    vb,
    [
      [5, 11],
      [5, 12],
      [5, 13],
    ],
    "path",
  );
  spruce(vb, 13, 13, 0, 5);
  spruce(vb, 11, 2, 0, 7);
  smallTree(vb, 2, 0, 0, 3);
  shrub(vb, 0, 10);
  shrub(vb, 9, 10, "white");
  bed(vb, 0, 11, 1, 13, ["fern", null, "grass_tuft", null, null]);
  return vb.model();
}

/* the fishing port (#90): a fisher's hut on a plank quay, a jetty on posts running out of its front, barrels, sacks and a lantern */
export function port(t) {
  const P = palette(t, "blue"),
    vb = model(12, 10, 12),
    hut = rect(1, 1, 7, 5),
    ps = { south: [3, 5], north: [3, 5], east: [3], west: [3] };
  vb.box(0, 0, 0, 11, 0, 7, P.plank);
  plinth(vb, P, hut);
  plankWalls(vb, P, hut, 1, 4, { ps });
  gabled(vb, P, hut, 4, { alongX: true });
  doorway(vb, P, "south", 5, 4, 1, { frame: true, step: false });
  windows(vb, P, "south", 5, [2, 6], 2, 1, {});
  /* the jetty */
  vb.box(3, 0, 8, 6, 0, 11, P.plank);
  for (const [x, z] of [
    [3, 8],
    [6, 8],
    [3, 11],
    [6, 11],
  ])
    vb.box(x, 0, z, x, 2, z, P.post);
  vb.set(6, 3, 11, "lantern");
  /* the catch and the gear on the quay */
  vb.set(9, 1, 2, "barrel").set(10, 1, 2, "barrel").set(9, 1, 3, "sacks").set(9, 2, 2, "barrel");
  vb.set(9, 1, 6, "hay_block").set(10, 1, 6, "basket_yellow");
  for (const z of [1, 4, 7]) vb.box(11, 1, z, 11, 2, z, P.fence);
  return vb.model();
}

/* the orchard: apple and cherry trees in rows inside a low wall with an arched gate, beehives, baskets, a ladder, a press house */
export function orchard(t) {
  const P = palette(t, "red"),
    vb = model(20, 12, 20),
    T = P.t,
    wl = T ? "stone_brick_wall" : "spruce_fence",
    pier = T ? "stone_bricks" : P.post;
  [
    [3, 3, 0],
    [7, 3, 1],
    [3, 8, 0],
    [7, 8, 0],
    [13, 8, 1],
    [17, 8, 0],
    [3, 13, 1],
    [7, 13, 0],
    [13, 13, 0],
    [17, 13, 0],
  ].forEach(([x, z, k]) =>
    k ? smallTree(vb, x, z, 0, 3, "cherry_leaves", "oak_log") : smallTree(vb, x, z, 0, 3, "apple_leaves", "oak_log"),
  );
  /* the wall, its piers and the arch over the gate */
  fenceRect(vb, wl, 0, 0, 19, 19, 0, (x, z) => z === 19 && x >= 9 && x <= 10);
  for (const [x, z] of [
    [0, 0],
    [19, 0],
    [0, 19],
    [19, 19],
    [0, 10],
    [19, 10],
    [10, 0],
  ])
    vb.box(x, 0, z, x, 1, z, pier);
  for (const x of [8, 11]) vb.box(x, 0, 19, x, 3, 19, pier);
  vb.set(8, 4, 19, stair(P.roof.st, "east"))
    .set(11, 4, 19, stair(P.roof.st, "west"))
    .set(9, 4, 19, P.roof.sl + "[type=top]")
    .set(10, 4, 19, P.roof.sl + "[type=top]")
    .set(9, 3, 19, "lantern[hanging=true]");
  path(
    vb,
    [...Array(13).keys()].flatMap((i) => [
      [9, 18 - i],
      [10, 18 - i],
    ]),
    "path",
  );
  /* the press house */
  const Hh = hall(vb, P, {
    r: rect(12, 1, 17, 5),
    axis: "x",
    up: 0,
    feet: false,
    gps: { south: [12, 14, 17], north: [12, 14, 17], east: [1, 5], west: [1, 3, 5] },
    roof: { prof: [1, 1, 2], crest: false },
  });
  doorway(vb, P, "west", Hh.g("west"), 2, 1, { step: false });
  windows(vb, P, "south", Hh.g("south"), [13, [15, 2]], 2, 2, { box: "red" });
  vb.add(11, 0, 4, "barrel")
    .add(11, 0, 5, "barrel")
    .add(11, 1, 4, "basket_red")
    .add(12, 0, 6, "table")
    .add(13, 0, 6, "barrel");
  /* hives, baskets, a ladder */
  for (const x of [12, 14, 16]) vb.set(x, 0, 17, P.fence).set(x, 1, 17, "beehive");
  vb.add(5, 0, 5, "basket_red").add(2, 0, 10, "basket_red").add(15, 0, 11, "basket_red").add(8, 0, 15, "basket_yellow");
  vb.add(6, 0, 8, "ladder[facing=west]").add(6, 1, 8, "ladder[facing=west]");
  vb.add(2, 0, 17, "bench[facing=south]").add(4, 0, 17, "crate").add(5, 0, 17, "sacks");
  bed(vb, 1, 16, 7, 18, [null, "grass_tuft", null, "flower_white", null, null, "flower_yellow"]);
  bed(vb, 12, 15, 18, 16, [null, "grass_tuft", null, null, "flower_pink"]);
  return vb.model();
}
