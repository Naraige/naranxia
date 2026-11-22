import {
  banner,
  bed,
  breast,
  butt,
  cart,
  doorway,
  dormer,
  dummy,
  fenceRect,
  flagPole,
  frameWalls,
  gabled,
  goods,
  hall,
  lampPost,
  logPile,
  model,
  palette,
  parapet,
  plaza,
  plinth,
  rect,
  roundParapet,
  roundTower,
  spireTop,
  stair,
  tent,
  tower,
  windows,
} from "../voxel-kit.js";

/* ---- the buildings of war: barracks, war room, sappers' yard, beacon, and the castle ---- */

/* a ring of defences round a yard: a palisade of sharpened logs in timber, a wall with merlons in stone. gap(x, z): where it opens */
function ring(vb, P, x0, z0, x1, z1, gap) {
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      if ((x !== x0 && x !== x1 && z !== z0 && z !== z1) || (gap && gap(x, z))) continue;
      if (P.t) {
        vb.box(x, 0, z, x, 2, z, P.wall);
        if ((x + z) % 2 === 0) vb.set(x, 3, z, "stone_bricks");
      } else {
        vb.box(x, 0, z, x, 1 + ((x + z) % 2), z, "spruce_log");
        vb.set(x, 2 + ((x + z) % 2), z, "stake");
      }
    }
}

/* the barracks: a long hall with dormers and an armoury closing the north of a walled drill yard: dummies, archery butts, a sparring ring, tents, a gate between two turrets */
export function barracks(t) {
  const P = palette(t, "red"),
    vb = model(24, 22, 24),
    T = P.t;
  for (let x = 1; x <= 22; x++) for (let z = 10; z <= 22; z++) vb.set(x, 0, z, "path");
  ring(vb, P, 0, 0, 23, 23, (x, z) => z === 23 && x >= 8 && x <= 15);
  /* the gate: two turrets and a lintel; the banner of the kingdom hangs on each turret */
  banner(vb, 9.5, 5.7, 23, "south", 1.2);
  banner(vb, 14.5, 5.7, 23, "south", 1.2);
  for (const x0 of [8, 13]) {
    const r = rect(x0, 20, x0 + 2, 22);
    if (T) tower(vb, P, r, 0, 5, { slit: false, parapet: false });
    else {
      vb.box(r.x0, 0, r.z0, r.x1, 5, r.z1, "spruce_log");
    }
    parapet(vb, P, r, 6);
  }
  vb.box(11, 5, 21, 12, 5, 21, T ? "stone_bricks" : P.bx).box(
    11,
    6,
    21,
    12,
    6,
    21,
    T ? "stone_brick_slab[type=bottom]" : P.wsl + "[type=bottom]",
  );
  vb.set(11, 4, 21, stair(P.sst, "west", "top")).set(12, 4, 21, stair(P.sst, "east", "top"));
  /* the hall */
  const Hh = hall(vb, P, {
    r: rect(2, 2, 14, 8),
    axis: "x",
    jet: { south: 1 },
    gps: { south: [2, 5, 7, 9, 11, 14], north: [2, 5, 8, 11, 14], east: [2, 5, 8], west: [2, 5, 8] },
    ups: { south: [2, 5, 8, 11, 14], north: [2, 5, 8, 11, 14], east: [2, 5, 9], west: [2, 5, 9] },
    gbrace: { north: [0, 2] },
    ubrace: { north: [1, 3] },
    roof: { win: 2 },
  });
  doorway(vb, P, "south", Hh.g("south"), 8, 1, { frame: T ? "polished_andesite" : false, lantern: true });
  windows(
    vb,
    P,
    "south",
    Hh.g("south"),
    [
      [3, 2],
      [12, 2],
    ],
    2,
    2,
    T ? { sill: true, shutter: true } : {},
  );
  windows(vb, P, "south", Hh.g("south"), [6, 10], 2, 2, T ? { sill: true } : {});
  windows(
    vb,
    P,
    "north",
    Hh.g("north"),
    [
      [3, 2],
      [9, 2],
      [12, 2],
    ],
    2,
    2,
    T ? { sill: true } : {},
  );
  if (T) {
    windows(
      vb,
      P,
      "south",
      Hh.u("south"),
      [
        [3, 2],
        [6, 2],
        [9, 2],
        [12, 2],
      ],
      Hh.uy + 1,
      2,
      {},
    );
    windows(
      vb,
      P,
      "north",
      Hh.u("north"),
      [
        [3, 2],
        [9, 2],
      ],
      Hh.uy + 1,
      2,
      {},
    );
    vb.set(8, Hh.uy - 1, Hh.r1.z1 + 1, "shield_red[facing=south]");
  }
  dormer(vb, P, "south", 5, Hh.r1.z1, Hh.top + 1);
  dormer(vb, P, "south", 11, Hh.r1.z1, Hh.top + 1);
  breast(vb, P, "west", 1, 4, 5, 0, Hh.ridge + 1, { sh: Hh.top - 2 });
  /* the armoury */
  const A = hall(vb, P, {
    r: rect(17, 2, 21, 9),
    axis: "z",
    up: 0,
    gh: 4,
    gps: { south: [17, 19, 21], north: [17, 19, 21], east: [2, 5, 9], west: [2, 5, 9] },
    roof: { prof: [1, 1, 2], win: 1, winH: 1 },
  });
  doorway(vb, P, "south", A.g("south"), 18, 1, { wide: true, arch: true, step: false });
  vb.set(17, 4, 10, "sconce[facing=south]").set(21, 4, 10, "sconce[facing=south]");
  for (const z of [4, 7]) vb.set(16, 1, z, "weapon_rack[facing=west]");
  vb.set(16, 0, 4, "crate").set(16, 0, 7, "barrel");
  /* the yard */
  dummy(vb, P, 4, 13);
  dummy(vb, P, 7, 13);
  dummy(vb, P, 10, 13);
  butt(vb, P, 18, 12);
  butt(vb, P, 20, 12);
  fenceRect(vb, P.fence, 16, 16, 22, 16, 0, (x) => x === 19);
  fenceRect(vb, P.fence, 10, 15, 14, 19, 0, (x, z) => z === 19 && x === 12);
  tent(vb, 3, 15, 4, "white", "red");
  tent(vb, 7, 17, 4, "white");
  vb.set(19, 0, 19, "campfire")
    .add(18, 0, 20, "bench[facing=north]")
    .add(20, 0, 20, "bench[facing=north]")
    .add(21, 0, 18, "bench[facing=west]");
  flagPole(vb, P, 2, 21, 0, 7);
  vb.add(16, 0, 21, "barrel")
    .add(17, 0, 22, "crate")
    .add(16, 1, 21, "sacks")
    .add(6, 0, 21, "weapon_rack[facing=north]")
    .add(5, 0, 21, "barrel");
  lampPost(vb, P, 7, 20);
  lampPost(vb, P, 16, 13);
  return vb.model();
}

/* the war room: a fortified hall crowned with battlements round a commander's tower, turrets on its corners, banners on its face, the map table under an awning */
export function warroom(t) {
  const P = palette(t, "slate"),
    vb = model(20, 26, 20),
    T = P.t,
    r = rect(4, 3, 15, 12),
    wl = T ? P.wall : "spruce_log";
  plinth(vb, P, r);
  if (T) tower(vb, P, r, 0, 9, { band: [5], slit: false });
  else {
    frameWalls(vb, P, r, 1, 9, {
      inset: 0,
      fill: "spruce_planks",
      ps: { south: [4, 7, 9, 10, 12, 15], north: [4, 7, 10, 12, 15], east: [3, 6, 9, 12], west: [3, 6, 9, 12] },
    });
    vb.walls(4, 5, 3, 15, 5, 12, P.bx);
    parapet(vb, P, r, 9);
  }
  vb.box(5, 9, 4, 14, 9, 11, T ? "stone_bricks" : P.plank);
  /* the commander's tower */
  const k = rect(8, 6, 11, 9);
  if (T) tower(vb, P, k, 9, 15, { slit: false, parapet: false });
  else
    frameWalls(vb, P, k, 10, 15, {
      inset: 0,
      fill: "spruce_planks",
      ps: { south: [8, 11], north: [8, 11], east: [6, 9], west: [6, 9] },
    });
  for (const [x, z, s] of [
    [9, 9, "south"],
    [10, 9, "south"],
    [9, 6, "north"],
    [10, 6, "north"],
  ])
    windows(vb, P, s, z, [x], 12, 2, {});
  windows(vb, P, "east", 11, [7, 8], 12, 2, {});
  windows(vb, P, "west", 8, [7, 8], 12, 2, {});
  spireTop(vb, P, k, 15, { prof: [1, 1, 2, 2], fin: [P.fin, P.fin, P.fin] });
  /* turrets on the four corners */
  for (const [cx, cz] of [
    [4.5, 3.5],
    [15.5, 3.5],
    [4.5, 12.5],
    [15.5, 12.5],
  ]) {
    for (let y = 5; y <= 12; y++)
      vb.disc(cx, cz, 1.6, y, y === 5 ? (T ? "stone_brick_slab[type=top]" : P.wsl + "[type=top]") : wl);
    vb.set(Math.floor(cx), 10, Math.floor(cz + (cz > 8 ? 1 : -1)), "iron_bars[east=true,west=true]");
    vb.cone(cx, cz, 1.6, 13, P.roof, [2, 3], 1, true, P.trim, [P.fin]);
  }
  /* the gate and the braziers, the banners of the kingdom either side of the window over it */
  banner(vb, 7, 8.9, 13, "south", 1.5);
  banner(vb, 13, 8.9, 13, "south", 1.5);
  doorway(vb, P, "south", 12, 9, 1, { wide: true, arch: true, frame: T ? "polished_andesite" : true, step: false });
  vb.set(9, 0, 13, stair(P.sst, "north")).set(10, 0, 13, stair(P.sst, "north"));
  windows(vb, P, "south", 12, [6, 7, 12, 13], 2, 2, { sill: T });
  for (const s of ["east", "west"]) windows(vb, P, s, s === "east" ? 15 : 4, [5, 6, 9, 10], 6, 2, {});
  windows(vb, P, "south", 12, [[9, 2]], 6, 2, {});
  vb.set(7, 0, 14, P.base).set(7, 1, 14, "brazier").set(12, 0, 14, P.base).set(12, 1, 14, "brazier");
  /* the yard: the map table under its awning, stakes, racks */
  plaza(vb, 7, 14, 12, 19, T ? "paving" : "path", T ? "paving_dark" : "path");
  for (const x of [15, 18]) for (const z of [14, 17]) vb.box(x, 0, z, x, 2, z, P.fence);
  for (let x = 15; x <= 18; x++)
    for (let z = 14; z <= 17; z++) vb.set(x, 3, z, `${(x + z) % 2 ? "red" : "white"}_cloth_slab[type=bottom]`);
  vb.set(16, 0, 15, "table").set(17, 0, 15, "table").set(16, 0, 16, "table").set(17, 0, 16, "table");
  vb.set(16, 1, 15, "white_carpet").set(17, 1, 16, "white_carpet").set(17, 1, 15, "pot_red");
  vb.add(15, 0, 18, "bench[facing=north]").add(18, 0, 13, "weapon_rack[facing=south]");
  for (let x = 0; x <= 5; x++) if (x % 2 === 0) vb.set(x, 0, 19, "stake").set(x, 0, 17, "stake");
  vb.add(2, 0, 15, "barrel").add(3, 0, 15, "crate").add(2, 1, 15, "sacks").add(1, 0, 13, "weapon_rack[facing=south]");
  flagPole(vb, P, 3, 18, 0, 7);
  lampPost(vb, P, 6, 19);
  lampPost(vb, P, 13, 19);
  bed(vb, 0, 4, 2, 11, ["grass_tuft", null, null, "fern", null]);
  return vb.model();
}

/* the sappers' yard: an open workshop round its forge, a siege engine on the stocks, a crane, stone shot, powder and timber */
export function sappers(t) {
  const P = palette(t, "slate", { wood: "shingle" }),
    vb = model(16, 16, 16),
    T = P.t,
    r = rect(1, 1, 9, 6);
  for (let x = 0; x <= 15; x++) for (let z = 7; z <= 15; z++) if ((x * 3 + z * 5) % 7 < 5) vb.set(x, 0, z, "path");
  /* the workshop: three walls, posts in front, the forge at its west end */
  plinth(vb, P, r, 0, { feet: false });
  if (T) {
    vb.box(1, 1, 1, 9, 4, 1, P.wall).box(1, 1, 1, 1, 4, 6, P.wall).box(9, 1, 1, 9, 4, 6, P.wall);
  } else {
    frameWalls(vb, P, r, 1, 4, {
      inset: 0,
      fill: "spruce_planks",
      ps: { north: [1, 4, 6, 9], east: [1, 4, 6], west: [1, 4, 6] },
      skip: { south: true },
    });
    vb.box(2, 1, 6, 8, 4, 6, 0);
  }
  for (const x of [1, 5, 9]) vb.box(x, 1, 6, x, 3, 6, P.post);
  for (let x = 1; x <= 9; x++) vb.set(x, 4, 6, P.bx);
  for (const x of [2, 4, 6, 8]) vb.set(x, 3, 6, stair(P.wst, x % 4 === 2 ? "west" : "east", "top"));
  vb.box(2, 0, 2, 8, 0, 6, T ? "paving_dark" : P.plank);
  gabled(vb, P, r, 4, {
    alongX: true,
    prof: [1, 1, 2],
    gable: T ? "stone" : (u, v) => (v >= 1 ? "spruce_planks" : null),
  });
  vb.box(2, 1, 2, 3, 2, 3, "bricks").set(2, 3, 2, "bricks").set(3, 1, 3, "campfire").set(3, 2, 3, 0);
  breast(vb, P, "north", 0, 2, 2, 0, 10, { block: ["bricks", "bricks", "granite"] });
  vb.set(5, 1, 3, "anvil")
    .set(7, 1, 2, "table")
    .set(8, 1, 2, "barrel")
    .set(8, 2, 2, "sacks")
    .set(6, 1, 2, "grindstone");
  vb.set(5, 3, 5, "lantern[hanging=true]").set(8, 1, 5, "crate");
  /* the engine on the stocks: two sills, a trestle, the beam and its counterweight */
  vb.box(10, 0, 8, 10, 0, 14, "stripped_oak_log[axis=z]").box(13, 0, 8, 13, 0, 14, "stripped_oak_log[axis=z]");
  vb.box(10, 0, 9, 13, 0, 9, "stripped_oak_log[axis=x]").box(10, 0, 13, 13, 0, 13, "stripped_oak_log[axis=x]");
  for (const x of [10, 13])
    vb.box(x, 1, 11, x, 4, 11, P.post).set(x, 1, 10, stair(P.wst, "south")).set(x, 1, 12, stair(P.wst, "north"));
  vb.box(10, 5, 11, 13, 5, 11, P.bx);
  for (let i = 0; i < 7; i++) vb.set(11, 2 + i, 14 - i, i === 3 ? P.bz : `${P.wood}_fence[north=true,south=true]`);
  vb.box(11, 6, 8, 12, 7, 9, "crate").set(11, 1, 15, "chain");
  /* the crane */
  vb.box(3, 0, 10, 3, 6, 10, P.post).set(3, 0, 9, stair(P.wst, "south")).set(3, 0, 11, stair(P.wst, "north"));
  vb.box(1, 6, 10, 6, 6, 10, P.bx)
    .set(4, 5, 10, stair(P.wst, "west", "top"))
    .set(2, 5, 10, stair(P.wst, "east", "top"));
  vb.set(6, 5, 10, "chain").set(6, 4, 10, "chain").set(6, 3, 10, "stone").set(1, 5, 10, "chain").set(1, 4, 10, "crate");
  /* stores: shot, powder, timber, wheels */
  vb.add(0, 0, 13, "heap_stone").add(1, 0, 13, "heap_stone").add(0, 0, 14, "heap_stone").add(1, 0, 15, "heap_coal");
  goods(vb, 5, 13, 7, 15, 0, ["barrel", "crate", null, "barrel"]);
  logPile(vb, 5, 8, 4, "x", "spruce_log");
  vb.add(15, 0, 9, "wheel[facing=west]")
    .add(15, 0, 11, "wheel[facing=west]")
    .add(15, 0, 13, "weapon_rack[facing=west]");
  vb.add(11, 0, 2, "ladder[facing=east]")
    .add(11, 1, 2, "ladder[facing=east]")
    .add(12, 0, 4, "table")
    .add(13, 0, 4, "stool")
    .add(12, 0, 2, "barrel");
  cart(vb, P, 12, 5, "heap_stone");
  lampPost(vb, P, 8, 11);
  return vb.model();
}

/* the beacon: a slender tower with an outside stair, a fighting top and a fire basket that is seen for leagues; a wood store at its foot */
export function beacon(t) {
  const P = palette(t, "slate"),
    vb = model(12, 26, 12),
    T = P.t,
    cx = 5.5,
    cz = 5.5,
    top = 16;
  plaza(vb, 2, 2, 9, 10, T ? "paving" : "path", T ? "paving_dark" : "path");
  if (T) {
    roundTower(vb, P, cx, cz, 2.5, 0, top, { band: [5, 11], slitEvery: 5 });
    vb.disc(cx, cz, 3.5, 1, P.base, 2.4);
  } else {
    /* a timber frame tower: four posts, rails and braces, planked in */
    const r = rect(3, 3, 7, 7);
    plinth(vb, P, r);
    frameWalls(vb, P, r, 1, top, {
      inset: 0,
      fill: "spruce_planks",
      ps: { south: [3, 5, 7], north: [3, 5, 7], east: [3, 5, 7], west: [3, 5, 7] },
    });
    for (const y of [5, 10]) vb.walls(3, y, 3, 7, y, 7, P.bx);
  }
  vb.set(5, 1, T ? 7 : 7, `${P.door}_door[facing=south,half=lower]`).set(
    5,
    2,
    7,
    `${P.door}_door[facing=south,half=upper]`,
  );
  /* the fighting top and the fire */
  if (T) roundParapet(vb, P, cx, cz, 2.5, top + 1);
  else parapet(vb, P, rect(3, 3, 7, 7), top + 1);
  vb.set(5, top + 2, 5, T ? "stone_bricks" : "cobblestone").set(5, top + 3, 5, "brazier");
  for (const [x, z] of [
    [4, 4],
    [6, 4],
    [4, 6],
    [6, 6],
  ])
    vb.box(x, top + 2, z, x, top + 4, z, "iron_bars");
  vb.box(4, top + 5, 4, 6, top + 5, 6, P.trim.sl + "[type=bottom]")
    .set(5, top + 5, 5, 0)
    .set(5, top + 4, 5, "fire");
  /* an outside stair to a landing, then the ladder up the shaft */
  for (let i = 0; i < 6; i++) {
    vb.set(9, i, 4 + i, stair(P.wst, "south"));
    if (i > 1 && i % 2 === 0) vb.box(9, 0, 4 + i, 9, i - 1, 4 + i, P.fence);
  }
  for (let z = 5; z <= 10; z++) vb.set(8, 5, z, P.wsl + "[type=top]");
  vb.set(9, 5, 10, P.wsl + "[type=top]")
    .box(9, 0, 10, 9, 4, 10, P.fence)
    .box(8, 0, 10, 8, 4, 10, P.fence);
  for (let y = 6; y <= top; y++) vb.set(8, y, 5, "ladder[facing=east]");
  /* the wood store */
  for (const z of [8, 10]) vb.box(1, 0, z, 1, 1, z, P.fence);
  vb.shed({ x0: 0, x1: 3, z0: 8, z1: 10, y: 2, dir: "west", m: P.roof, t: P.trim });
  vb.box(2, 0, 9, 3, 0, 9, "oak_log[axis=x]").set(2, 1, 9, "birch_log[axis=x]").set(3, 0, 10, "barrel");
  logPile(vb, 0, 3, 3, "z", "spruce_log");
  lampPost(vb, P, 3, 11);
  vb.add(7, 0, 10, "barrel").add(7, 0, 11, "heap_coal").add(10, 0, 10, "crate");
  return vb.model();
}

/* the castle: a curtain wall between four round towers under pointed roofs, a gatehouse on the south (the gate is in the middle of the side),
   and a great keep with a stair turret. It flies the banners of the kingdom: the standard on the pole of the keep roof, one over the gate,
   two down the face of the keep */
export function castle(t) {
  const P = palette(t, "blue"),
    vb = model(20, 30, 20),
    T = P.t,
    W = T ? P.wall : "spruce_log",
    merlon = T ? "stone_bricks" : "stake";
  plaza(vb, 4, 4, 15, 15, T ? "paving" : "path", T ? "paving_dark" : "path");
  /* the curtain: two blocks thick, the outer one a parapet with merlons */
  vb.walls(2, 0, 2, 17, 6, 17, W).walls(3, 0, 3, 16, 5, 16, W);
  vb.walls(2, 0, 2, 17, 0, 17, P.base);
  for (let i = 2; i <= 17; i++)
    for (const [x, z] of [
      [i, 2],
      [i, 17],
      [2, i],
      [17, i],
    ])
      if (T ? (x + z) % 2 === 0 : true) vb.set(x, 7, z, merlon);
  if (T) vb.walls(2, 4, 2, 17, 4, 17, P.quoin);
  /* the corner towers: taller at the back */
  for (const [cx, cz, h] of [
    [3.5, 3.5, 12],
    [16.5, 3.5, 12],
    [3.5, 16.5, 10],
    [16.5, 16.5, 10],
  ]) {
    roundTower(vb, P, cx, cz, 2.5, 0, h, {
      wall: W,
      band: T ? [4, h - 3] : [4, h - 3],
      bandB: T ? P.quoin : "dark_oak_planks",
      slitEvery: 4,
    });
    roundParapet(vb, P, cx, cz, 2.5, h + 1, T ? "stone_bricks" : P.plank);
    vb.cone(cx, cz, 2.5, h + 2, P.roof, [2, 3, 2], 1, false, P.trim, [P.fin]);
  }
  /* the gatehouse */
  const gh = rect(7, 15, 12, 18);
  vb.box(7, 0, 15, 12, 8, 18, W);
  for (const x of [7, 12])
    for (const z of [15, 18]) for (let y = 0; y <= 8; y += 2) vb.set(x, y, z, T ? P.quoin : P.post);
  vb.box(9, 1, 15, 10, 3, 18, 0).box(9, 0, 15, 10, 0, 18, T ? "paving_dark" : P.plank);
  for (const z of [15, 18]) vb.set(9, 3, z, stair(P.sst, "west", "top")).set(10, 3, z, stair(P.sst, "east", "top"));
  for (const x of [9, 10]) vb.set(x, 3, 17, "iron_bars[east=true,west=true]");
  parapet(vb, P, gh, 8, { cb: T ? "stone_bricks" : P.plank });
  vb.set(8, 3, 19, "sconce[facing=south]").set(11, 3, 19, "sconce[facing=south]");
  banner(vb, 10, 7.9, 19, "south", 1.5);
  for (const x of [9, 10]) vb.set(x, 6, 18, "iron_bars[east=true,west=true]");
  /* the keep: three stages, a parapet on corbels, a steep roof and the pole of the flag */
  const kp = rect(6, 4, 13, 11);
  tower(vb, P, kp, 0, 17, {
    wall: W,
    band: [6, 12],
    bandB: T ? P.quoin : "dark_oak_planks",
    slitEvery: 6,
    cb: T ? "stone_bricks" : P.plank,
  });
  for (const y of [8, 14]) {
    windows(vb, P, "south", 11, [[9, 2]], y, 2, { sill: T });
    windows(vb, P, "east", 13, [[7, 2]], y, 2, {});
    windows(vb, P, "west", 6, [[7, 2]], y, 2, {});
  }
  doorway(vb, P, "south", 11, 9, 1, { wide: true, arch: true, step: false });
  vb.set(8, 3, 12, "sconce[facing=south]").set(11, 3, 12, "sconce[facing=south]");
  banner(vb, 8, 13.9, 12, "south", 1.5);
  banner(vb, 12, 13.9, 12, "south", 1.5);
  vb.hipRoof({
    x0: 6,
    z0: 4,
    x1: 13,
    z1: 11,
    y: 18,
    m: P.roof,
    t: P.trim,
    prof: [1, 1, 2, 2],
    fin: [P.fence, P.fence, P.fence, P.fence, P.fence],
  });
  /* the standard of the kingdom hangs from the top of that pole */
  vb.mark({ t: "pole", x: 9.5, y: 29, z: 7.5, k: 1.8 });
  /* bartizans on the corners of the parapet */
  for (const [x, z] of [
    [5, 12],
    [14, 12],
    [5, 3],
  ]) {
    vb.box(x, 19, z, x, 21, z, T ? "stone_bricks" : P.post)
      .set(x, 22, z, P.roof.bl)
      .set(x, 23, z, P.trim.sl + "[type=bottom]");
  }
  /* the stair turret on the corner of the keep */
  for (let y = 10; y <= 21; y++)
    vb.disc(13.5, 4.5, 1.6, y, y === 10 ? (T ? "stone_brick_slab[type=top]" : P.wsl + "[type=top]") : W);
  vb.set(13, 19, 6, "iron_bars[east=true,west=true]").set(15, 19, 4, "iron_bars[north=true,south=true]");
  vb.cone(13.5, 4.5, 1.6, 22, P.roof, [2, 3], 1, true, P.trim, [P.fin]);
  /* the ward */
  vb.box(4, 0, 13, 4, 0, 14, "barrel").set(4, 1, 13, "sacks").set(5, 0, 14, "crate");
  vb.set(15, 0, 13, "weapon_rack[facing=west]").set(15, 0, 14, "hay_block").set(14, 0, 14, "barrel");
  vb.set(6, 0, 13, "water").set(6, 1, 13, 0);
  return vb.model();
}
