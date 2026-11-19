import { VB } from "../voxel-build.js";

/* ---- the kit the block-built buildings are made from: materials by tier, timber-framed storeys, profiled roofs, windows with shutters,
   doorways, chimneys, round towers, trees and yard props. Everything is written in Minecraft blocks; x east, y up, z south (the door side).
   Layer y = 0 is the ground: foundations, paths and yard props all stand on it. ---- */
const R = (st, sl, bl) => ({ st, sl, bl });
export const ROOF = {
  slate: R("deepslate_tile_stairs", "deepslate_tile_slab", "deepslate_tiles"),
  black: R("polished_blackstone_brick_stairs", "polished_blackstone_brick_slab", "polished_blackstone_bricks"),
  spruce: R("spruce_stairs", "spruce_slab", "spruce_planks"),
  dark: R("dark_oak_stairs", "dark_oak_slab", "dark_oak_planks"),
  oak: R("oak_stairs", "oak_slab", "oak_planks"),
  red: R("red_tile_stairs", "red_tile_slab", "red_tiles"),
  blue: R("blue_tile_stairs", "blue_tile_slab", "blue_tiles"),
  green: R("green_tile_stairs", "green_tile_slab", "green_tiles"),
  thatch: R("thatch_stairs", "thatch_slab", "thatch"),
  thatchDark: R("thatch_dark_stairs", "thatch_dark_slab", "thatch_dark"),
  copper: R("cut_copper_stairs", "cut_copper_slab", "cut_copper"),
  stone: R("stone_brick_stairs", "stone_brick_slab", "stone_bricks"),
  cobble: R("cobblestone_stairs", "cobblestone_slab", "cobblestone"),
  brick: R("brick_stairs", "brick_slab", "bricks"),
  mangrove: R("mangrove_stairs", "mangrove_slab", "mangrove_planks"),
};

/* tier 0: a timber village (plank walls in dark frames on a cobble footing, wooden roofs);
   tier 1: a stone town (stone-brick ground floors, plastered upper floors in dark frames, slate roofs).
   `accent` is the roof a building type is known by; in timber it is kept only where it is cheap (thatch), else the wooden roof is used */
export function palette(t, accent, both) {
  const stone = t !== 0,
    roof = stone || both ? ROOF[accent || "slate"] : accent === "thatch" ? ROOF.thatch : ROOF.spruce;
  return {
    t: stone ? 1 : 0,
    stone,
    base: stone
      ? ["stone_bricks", "stone_bricks", "stone_bricks", "cracked_stone_bricks", "andesite", "mossy_stone_bricks"]
      : ["cobblestone", "cobblestone", "cobblestone", "andesite", "mossy_cobblestone"],
    /* ground-floor walls and upper-floor infill */
    wall: stone ? ["stone_bricks", "stone_bricks", "stone_bricks", "cracked_stone_bricks", "andesite"] : "oak_planks",
    fill: stone ? ["plaster", "plaster", "plaster", "plaster_dark"] : "oak_planks",
    post: "dark_oak_log",
    bx: "dark_oak_log[axis=x]",
    bz: "dark_oak_log[axis=z]",
    plank: stone ? "dark_oak_planks" : "spruce_planks",
    wst: stone ? "dark_oak_stairs" : "spruce_stairs",
    wsl: stone ? "dark_oak_slab" : "spruce_slab",
    trap: stone ? "dark_oak_trapdoor" : "spruce_trapdoor",
    fence: stone ? "dark_oak_fence" : "spruce_fence",
    door: stone ? "dark_oak" : "spruce",
    wallb: stone ? "stone_brick_wall" : "cobblestone_wall",
    roof,
    trim: accent === "thatch" ? ROOF.thatchDark : stone ? ROOF.black : ROOF.dark,
    prof: [1, 1, 2, 2],
    pane: "window",
    brick: stone ? ["stone_bricks", "andesite", "cobblestone"] : ["bricks", "bricks", "granite"],
    paving: stone ? "paving" : "path",
  };
}

export const model = (w, h, l) => new VB(w, h, l);
const sT = (n, f, h = "bottom", s = "straight") => `${n}[facing=${f},half=${h},shape=${s}]`;
export { sT as stair };

const BARX = "iron_bars[east=true,west=true]",
  BARZ = "iron_bars[north=true,south=true]";

/* the four sides of a building: the step outward and the name of the opposite side */
const OUT = { south: [0, 1], north: [0, -1], east: [1, 0], west: [-1, 0] },
  OPP = { south: "north", north: "south", east: "west", west: "east" },
  cell = (side, fixed, c) => (side === "south" || side === "north" ? [c, fixed] : [fixed, c]);

/* evenly spread post positions from a to b, about every `step` blocks, ends included */
export function spread(a, b, step = 3) {
  const n = Math.max(1, Math.round((b - a) / step)),
    r = [];
  for (let i = 0; i <= n; i++) r.push(a + Math.round((i * (b - a)) / n));
  return r;
}
/* the middles of the bays between posts (where windows go) */
export const bays = (ps) => ps.slice(1).map((p, i) => (p + ps[i]) >> 1);

/* one storey of framed wall from y0 to y1: infill between posts, a beam on top (y1), optionally a sill beam at the bottom */
export function storey(vb, P, x0, z0, x1, z1, y0, y1, o = {}) {
  const fill = o.fill || P.fill,
    xs = o.xs || spread(x0, x1, o.step || 3),
    zs = o.zs || spread(z0, z1, o.step || 3);
  vb.walls(x0, y0, z0, x1, y1, z1, fill);
  /* a wall of stone needs no posts: it gets dressed quoins on its corners */
  if (P.stone && fill === P.wall && o.posts !== true) {
    for (const x of [x0, x1]) for (const z of [z0, z1]) vb.box(x, y0, z, x, y1 - 1, z, "polished_andesite");
  } else if (o.posts !== false) {
    for (const x of xs) vb.box(x, y0, z0, x, y1, z0, P.post).box(x, y0, z1, x, y1, z1, P.post);
    for (const z of zs) vb.box(x0, y0, z, x0, y1, z, P.post).box(x1, y0, z, x1, y1, z, P.post);
  }
  for (const y of o.sill ? [y0, y1] : [y1]) {
    vb.box(x0 + 1, y, z0, x1 - 1, y, z0, P.bx).box(x0 + 1, y, z1, x1 - 1, y, z1, P.bx);
    vb.box(x0, y, z0 + 1, x0, y, z1 - 1, P.bz).box(x1, y, z0 + 1, x1, y, z1 - 1, P.bz);
  }
  return { xs, zs };
}

/* a footing: a course of mixed stone under the walls, one block proud at the corners */
export function footing(vb, P, x0, z0, x1, z1, y = 0, h = 1) {
  vb.box(x0, y, z0, x1, y + h - 1, z1, P.base);
}

/* windows on one side of a wall. cs: positions along the wall, y: sill height, h: height.
   o.shutter: plank shutters on both sides; o.sill: a ledge under it; o.flower: a flower colour on the ledge; o.wide: two panes */
export function windows(vb, P, side, fixed, cs, y, h = 2, o = {}) {
  const [ox, oz] = OUT[side];
  for (const c of cs) {
    const w = o.wide ? [c, c + 1] : [c];
    for (const cc of w) {
      const [x, z] = cell(side, fixed, cc);
      for (let i = 0; i < h; i++)
        vb.set(x, y + i, z, (o.pane || P.pane) + (ox ? "[north=true,south=true]" : "[east=true,west=true]"));
      if (o.sill !== false) vb.add(x + ox, y - 1, z + oz, sT(P.wst, OPP[side], "top"));
      if (o.flower) vb.add(x + ox, y, z + oz, `flower_${o.flower}`);
    }
    if (o.shutter)
      for (const cc of [w[0] - 1, w[w.length - 1] + 1]) {
        const [x, z] = cell(side, fixed, cc);
        for (let i = 0; i < h; i++) vb.add(x + ox, y + i, z + oz, `${P.trap}[facing=${side},open=true]`);
      }
  }
}

/* a doorway on one side: door, a log frame, a step and (o.canopy) a small awning of roof stairs with a hanging lantern */
export function doorway(vb, P, side, fixed, c, y, o = {}) {
  const [ox, oz] = OUT[side],
    [x, z] = cell(side, fixed, c),
    w = o.wide ? 2 : 1,
    [dx, dz] = side === "south" || side === "north" ? [1, 0] : [0, 1];
  for (let i = 0; i < w; i++) {
    vb.set(x + dx * i, y, z + dz * i, `${o.wood || P.door}_door[facing=${side},half=lower]`);
    vb.set(x + dx * i, y + 1, z + dz * i, `${o.wood || P.door}_door[facing=${side},half=upper]`);
    vb.set(x + dx * i, y + 2, z + dz * i, side === "south" || side === "north" ? P.bx : P.bz);
    if (o.step !== false)
      vb.add(
        x + dx * i + ox,
        y - 1,
        z + dz * i + oz,
        sT(P.stone ? "stone_brick_stairs" : "cobblestone_stairs", OPP[side]),
      );
  }
  for (const i of [-1, w]) vb.box(x + dx * i, y, z + dz * i, x + dx * i, y + 2, z + dz * i, P.post);
  if (o.canopy) {
    const m = o.canopy === true ? P.roof : o.canopy;
    for (let i = -1; i <= w; i++) vb.set(x + dx * i + ox, y + 2, z + dz * i + oz, sT(m.st, OPP[side]));
    vb.add(x + dx * w + ox, y + 1, z + dz * w + oz, "lantern[hanging=true]");
  } else if (o.lantern !== false) vb.add(x + dx * w + ox, y + 1, z + dz * w + oz, "lantern[hanging=true]");
}

/* the gable wall under a roof: a king post in the middle, infill either side, and an attic window when asked */
export const gableFill =
  (P, o = {}) =>
  (u, v) =>
    Math.abs(u) < 1
      ? o.win !== undefined && v >= o.win && v < o.win + (o.winH || 1)
        ? P.pane
        : P.post
      : o.fill || P.fill;

/* a gabled roof over the walls (x0,z0)-(x1,z1) whose top course is wallTop. ov: overhang along the eaves, end: overhang at the gables.
   Returns the height of the ridge */
export function gabled(vb, P, x0, z0, x1, z1, wallTop, o = {}) {
  const ax = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0,
    ov = o.ov === undefined ? 1 : o.ov,
    end = o.end === undefined ? 1 : o.end,
    prof = o.prof || P.prof;
  let rise = 0;
  for (let i = 0; i < ov; i++) rise += prof[Math.min(i, prof.length - 1)];
  return vb.roof({
    x0: ax ? x0 - end : x0 - ov,
    x1: ax ? x1 + end : x1 + ov,
    z0: ax ? z0 - ov : z0 - end,
    z1: ax ? z1 + ov : z1 + end,
    y: wallTop + 1 - rise,
    alongX: ax,
    m: o.m || P.roof,
    t: o.t || P.trim,
    prof,
    end,
    cap: o.cap,
    fill: o.fill === undefined ? gableFill(P, o) : o.fill,
  });
}

/* a chimney stack with a pot and embers */
export function chimney(vb, P, x, z, y0, y1, o = {}) {
  vb.box(x, y0, z, x, y1, z, o.block || P.brick);
  vb.set(x, y1 + 1, z, P.wallb);
}

/* brackets under an overhanging floor: upside-down stairs along one side at height y, every `step` blocks */
export function brackets(vb, P, side, fixed, c0, c1, y, step = 3) {
  const [ox, oz] = OUT[side];
  for (const c of spread(c0, c1, step)) {
    const [x, z] = cell(side, fixed, c);
    vb.add(x + ox, y, z + oz, sT(P.wst, OPP[side], "top"));
  }
}

/* ---- towers ---- */
/* a square tower: battered footing, mixed stone shaft with corner quoins, arrow slits, a corbelled parapet with merlons.
   (x0,z0) corner, n side (o.l: another depth), y0 base, h shaft height. Returns the walkway height (top of the corbel) */
export function tower(vb, P, x0, z0, n, y0, h, o = {}) {
  const x1 = x0 + n - 1,
    z1 = z0 + (o.l || n) - 1,
    wall = o.wall || P.wall,
    q = o.quoin || (P.stone ? "polished_andesite" : P.post),
    top = y0 + h;
  vb.walls(x0, y0, z0, x1, top, z1, wall);
  vb.walls(x0, y0, z0, x1, y0, z1, P.base);
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    vb.box(x, y0, z, x, top, z, q);
  if (o.slit !== false) {
    const m = (x0 + x1) >> 1,
      mz = (z0 + z1) >> 1;
    for (let y = y0 + 3; y < top - 1; y += 4) {
      vb.set(m, y, z1, BARX).set(m, y, z0, BARX).set(x0, y, mz, BARZ).set(x1, y, mz, BARZ);
    }
  }
  if (o.parapet === false) return top;
  /* corbel: a ring one block out resting on upside-down stairs, then merlons */
  const st = o.cst || (P.stone ? "stone_brick_stairs" : P.wst),
    cb = o.cb || (P.stone ? "stone_bricks" : P.plank);
  for (let x = x0; x <= x1; x++)
    vb.set(x, top, z0 - 1, sT(st, "south", "top")).set(x, top, z1 + 1, sT(st, "north", "top"));
  for (let z = z0; z <= z1; z++)
    vb.set(x0 - 1, top, z, sT(st, "east", "top")).set(x1 + 1, top, z, sT(st, "west", "top"));
  vb.box(x0, top, z0, x1, top, z1, cb);
  vb.walls(x0 - 1, top + 1, z0 - 1, x1 + 1, top + 1, z1 + 1, cb);
  for (let x = x0 - 1; x <= x1 + 1; x++)
    for (let z = z0 - 1; z <= z1 + 1; z++) {
      const edge = x === x0 - 1 || x === x1 + 1 || z === z0 - 1 || z === z1 + 1;
      if (edge && (x - x0 + 1 + (z - z0 + 1)) % 2 === 0) vb.set(x, top + 2, z, cb);
    }
  return top + 1;
}

/* a round tower centred on (cx, cz) (halves for even widths), radius r, from y0 to y1; a base ring one wider, slits every 4 blocks */
export function roundTower(vb, P, cx, cz, r, y0, y1, o = {}) {
  const wall = o.wall || P.wall;
  for (let y = y0; y <= y1; y++) vb.disc(cx, cz, r, y, wall);
  vb.disc(cx, cz, r + 0.6, y0, P.base);
  if (o.band) for (const y of o.band) vb.disc(cx, cz, r, y, o.bandB || "polished_andesite", r - 1.05);
  if (o.slit !== false)
    for (let y = y0 + 3; y < y1 - 1; y += 4) {
      /* the outermost cell of the round wall on each of the four sides */
      vb.set(Math.floor(cx), y, Math.floor(cz + r - 0.5), BARX).set(Math.floor(cx + r - 0.5), y, Math.floor(cz), BARZ);
      vb.set(Math.floor(cx), y, Math.ceil(cz - r - 0.5), BARX).set(Math.ceil(cx - r - 0.5), y, Math.floor(cz), BARZ);
    }
}
/* a round parapet: a wider ring with merlons, on top of a round tower. Returns the walkway height */
export function roundParapet(vb, P, cx, cz, r, y, b) {
  const cb = b || (P.stone ? "stone_bricks" : P.plank);
  vb.disc(cx, cz, r + 1, y, cb);
  vb.disc(cx, cz, r + 1, y + 1, cb, r - 0.05);
  for (let z = Math.floor(cz - r - 2); z <= cz + r + 2; z++)
    for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) {
      const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
      if (d <= (r + 1) ** 2 && d > (r - 0.05) ** 2 && (x + z) % 2 === 0) vb.set(x, y + 2, z, cb);
    }
  return y;
}

/* ---- nature and yard props ---- */
export function oak(vb, x, z, y0, h, leaf = "oak_leaves", log = "oak_log") {
  vb.box(x, y0, z, x, y0 + h - 1, z, log);
  const y = y0 + h - 1;
  for (let dy = -1; dy <= 2; dy++) {
    const r = dy === 2 ? 1 : dy === -1 ? 1.6 : 2.3;
    for (let dz = -2; dz <= 2; dz++)
      for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dz * dz > r * r + 0.3) continue;
        if (dx === 0 && dz === 0 && dy < 1) continue;
        vb.add(x + dx, y + dy, z + dz, leaf);
      }
  }
}
export function spruce(vb, x, z, y0, h) {
  vb.box(x, y0, z, x, y0 + h - 1, z, "spruce_log");
  let y = y0 + 2;
  for (const r of [2, 1, 2, 1, 1, 0]) {
    if (y > y0 + h + 1) break;
    for (let dz = -r; dz <= r; dz++)
      for (let dx = -r; dx <= r; dx++)
        if (Math.abs(dx) + Math.abs(dz) <= r + (r > 1 ? 1 : 0)) vb.add(x + dx, y, z + dz, "spruce_leaves");
    y++;
  }
  vb.set(x, y, z, "spruce_leaves");
}
export function bush(vb, x, z, y = 0, leaf = "azalea_leaves", flower) {
  vb.add(x, y, z, leaf);
  if (flower) vb.add(x, y + 1, z, `flower_${flower}`);
}

/* fences and low walls join their neighbours by the states they carry, so they are laid as a set of cells */
export function fenceCells(vb, name, cells, y = 0) {
  const has = (x, z) => cells.some((k) => k[0] === x && k[1] === z);
  for (const [x, z] of cells)
    vb.set(
      x,
      y,
      z,
      `${name}[east=${has(x + 1, z)},west=${has(x - 1, z)},north=${has(x, z - 1)},south=${has(x, z + 1)}]`,
    );
}
export function fenceRect(vb, name, x0, z0, x1, z1, y = 0, gap) {
  const keep = [];
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++)
      if ((x === x0 || x === x1 || z === z0 || z === z1) && !(gap && gap(x, z))) keep.push([x, z]);
  fenceCells(vb, name, keep, y);
}
export function fenceLine(vb, name, x0, z0, x1, z1, y = 0) {
  const c = [];
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) c.push([x, z]);
  fenceCells(vb, name, c, y);
}

/* a pile of logs lying along x (ax "x") or z, n long, 2 wide at the bottom */
export function logPile(vb, x, z, n, ax = "x", log = "oak_log", y = 0) {
  const b = `${log}[axis=${ax}]`;
  if (ax === "x") vb.box(x, y, z, x + n - 1, y, z + 1, b).box(x, y + 1, z, x + n - 1, y + 1, z, b);
  else vb.box(x, y, z, x + 1, y, z + n - 1, b).box(x, y + 1, z, x, y + 1, z + n - 1, b);
}

/* a well: a round stone curb with water, two posts and a little roof with a hanging bucket chain */
export function well(vb, P, x, z, y = 0) {
  vb.box(x - 1, y, z - 1, x + 1, y, z + 1, P.base);
  vb.set(x, y, z, "water");
  for (const dx of [-1, 1]) vb.box(x + dx, y + 1, z, x + dx, y + 2, z, P.fence);
  vb.set(x - 1, y + 3, z, sT(P.roof.st, "east")).set(x + 1, y + 3, z, sT(P.roof.st, "west"));
  vb.set(x, y + 3, z, P.roof.sl + "[type=top]").set(x, y + 2, z, "chain");
}

/* a market stall: four posts, a striped awning sloping to the front (south), a counter with goods */
export function stall(vb, P, x, z, w, c1 = "red", c2 = "white", goods = ["barrel", "crate"]) {
  for (const px of [x, x + w - 1]) {
    vb.box(px, 0, z, px, 2, z, P.fence);
    vb.box(px, 0, z + 2, px, 1, z + 2, P.fence);
  }
  for (let i = 0; i < w; i++) {
    const c = i % 2 ? c1 : c2;
    vb.set(x + i, 3, z, `${c}_wool`)
      .set(x + i, 2, z + 1, `${c}_wool`)
      .set(x + i, 2, z + 2, `${c}_carpet`);
  }
  for (let i = 1; i < w - 1; i++) vb.set(x + i, 0, z + 2, P.plank).set(x + i, 0, z, goods[i % goods.length]);
  vb.set(x + 1, 1, z + 2, "sack");
  if (w > 3) vb.set(x + w - 2, 1, z + 2, goods.includes("melon") ? "melon" : "pumpkin");
}

/* a training dummy: a post with a hay body and arms */
export function dummy(vb, P, x, z, y = 0) {
  vb.set(x, y, z, P.fence)
    .set(x, y + 1, z, "hay_block")
    .set(x, y + 2, z, "pumpkin");
}

/* a banner hanging from a wall (two blocks tall) */
export function banner(vb, x, y, z, face, color) {
  vb.set(x, y, z, `banner_${color}[facing=${face}]`).set(x, y - 1, z, `banner_${color}[facing=${face}]`);
}
/* a free-standing flag pole with a flag flying east */
export function flagPole(vb, P, x, z, y0, h, color) {
  vb.box(x, y0, z, x, y0 + h - 1, z, P.fence);
  vb.set(x + 1, y0 + h - 1, z, `${color}_wool`).set(x + 2, y0 + h - 1, z, `${color}_wool`);
  vb.set(x + 1, y0 + h - 2, z, `${color}_wool`);
}

/* a street lamp: a post with a lantern on top */
export function lampPost(vb, P, x, z, y = 0, h = 3) {
  vb.box(x, y, z, x, y + h - 1, z, P.fence).set(x, y + h, z, "lantern");
}
/* a clipped hedge along x or z, a flower on every other block */
export function hedge(vb, x0, z0, x1, z1, flower, y = 0) {
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      vb.add(x, y, z, "azalea_leaves");
      if (flower && (x + z) % 2 === 0) vb.add(x, y + 1, z, `flower_${flower}`);
    }
}
/* a square of paving, two tones in a checker */
export function plaza(vb, x0, z0, x1, z1, a = "paving", b = "paving_dark") {
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) vb.add(x, 0, z, (x + z) % 2 ? a : b);
}
