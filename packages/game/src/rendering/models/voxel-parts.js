import { VB } from "../voxel-build.js";

/* ---- shared parts for the block-built buildings: palettes by tier (0 timber, 1 stone) and small builders (halls, trees, stalls, towers, fences) ---- */
export const palette = (t) =>
  t === 0
    ? {
        wall: "spruce_planks",
        log: "stripped_dark_oak_log",
        post: "dark_oak_log",
        base: "cobblestone",
        st: "spruce_stairs",
        sl: "spruce_slab",
        trim: "dark_oak_planks",
        pane: "white_stained_glass_pane",
        fence: "spruce_fence",
      }
    : {
        wall: "stone_bricks",
        log: "dark_oak_log",
        post: "dark_oak_log",
        base: "stone",
        st: "deepslate_tile_stairs",
        sl: "deepslate_tile_slab",
        trim: "dark_oak_planks",
        pane: "white_stained_glass_pane",
        fence: "stone_brick_wall",
      };

export const model = (w, h, l) => new VB(w, h, l);

/* a hall: base course, walls with corner posts and a beam per floor, windows, a door on the south wall (z1) and optionally a gabled roof with 1 block overhang.
   (x0,z0)-(x1,z1) are the wall corners, y the floor level */
export function hall(vb, P, x0, z0, x1, z1, o = {}) {
  const y = o.y || 0,
    fl = o.floors || 1,
    fh = o.fh || 4,
    top = y + fl * fh,
    wall = o.wall || P.wall,
    ax = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0;
  vb.box(x0, y, z0, x1, y, z1, P.base);
  vb.walls(x0, y + 1, z0, x1, top, z1, wall);
  /* posts at the corners and every few blocks, beams at each floor */
  const px = [x0, x1],
    pz = [z0, z1];
  for (let x = x0 + 4; x < x1 - 1; x += 4) px.push(x);
  for (let z = z0 + 4; z < z1 - 1; z += 4) pz.push(z);
  for (const x of px) for (const z of [z0, z1]) vb.box(x, y + 1, z, x, top, z, P.post);
  for (const z of pz) for (const x of [x0, x1]) vb.box(x, y + 1, z, x, top, z, P.post);
  for (let f = 1; f <= fl; f++) {
    const by = y + f * fh;
    vb.box(x0, by, z0, x1, by, z0, P.log).box(x0, by, z1, x1, by, z1, P.log);
    vb.box(x0, by, z0, x0, by, z1, P.log).box(x1, by, z0, x1, by, z1, P.log);
    if (o.win !== false) {
      const wy = y + (f - 1) * fh + 2;
      for (let x = x0 + 2; x < x1 - 1; x += 2)
        if (!px.includes(x) && !px.includes(x - 1)) vb.set(x, wy, z0, P.pane).set(x, wy, z1, P.pane);
      for (let z = z0 + 2; z < z1 - 1; z += 2)
        if (!pz.includes(z) && !pz.includes(z - 1)) vb.set(x0, wy, z, P.pane).set(x1, wy, z, P.pane);
    }
  }
  if (o.door !== false) {
    const dx = o.doorX !== undefined ? o.doorX : (x0 + x1) >> 1;
    vb.box(dx, y + 1, z1, dx, y + 3, z1, P.wall);
    vb.door(dx, y + 1, z1, "south");
    vb.set(dx, y + 3, z1, P.log);
    vb.set(dx, y, z1 + 1, `${P.st}[facing=north,half=bottom,shape=straight]`);
    vb.set(dx - 1, y + 3, z1 + 1, "lantern");
  }
  if (o.roof !== false) {
    vb.gable(x0 - 1, z0 - 1, x1 + 1, z1 + 1, top + 1, ax, o.st || P.st, o.sl || P.sl, wall);
  }
  return top;
}

/* a stone chimney from y0 up to y1 at (x,z) with a smoky cap */
export function chimney(vb, x, z, y0, y1, block = "bricks") {
  vb.box(x, y0, z, x, y1, z, block);
  vb.set(x, y1 + 1, z, "campfire");
}

export function tree(vb, x, z, y0, h, leaf = "oak_leaves", log = "oak_log") {
  vb.box(x, y0, z, x, y0 + h - 1, z, log);
  const r = 2;
  for (let dy = 0; dy < 3; dy++) {
    const rr = dy === 2 ? 1 : r;
    for (let dz = -rr; dz <= rr; dz++)
      for (let dx = -rr; dx <= rr; dx++) {
        if (Math.abs(dx) === rr && Math.abs(dz) === rr && dy !== 1) continue;
        if (!(dx === 0 && dz === 0 && dy === 0)) vb.set(x + dx, y0 + h - 1 + dy, z + dz, leaf);
      }
  }
}

/* a fence line (walls or fences connect to their neighbours by the states they carry, so the state is computed here) */
export function fenceLine(vb, name, x0, z0, x1, z1, y = 1) {
  const ax = x1 !== x0;
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      vb.set(
        x,
        y,
        z,
        `${name}[east=${ax && x < x1},west=${ax && x > x0},north=${!ax && z > z0},south=${!ax && z < z1}]`,
      );
    }
}
export function fenceRect(vb, name, x0, z0, x1, z1, y = 1, gap) {
  const keep = [];
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++)
      if ((x === x0 || x === x1 || z === z0 || z === z1) && !(gap && gap(x, z))) keep.push([x, z]);
  const has = (x, z) => keep.some((k) => k[0] === x && k[1] === z);
  for (const [x, z] of keep)
    vb.set(
      x,
      y,
      z,
      `${name}[east=${has(x + 1, z)},west=${has(x - 1, z)},north=${has(x, z - 1)},south=${has(x, z + 1)}]`,
    );
}

/* a square tower of stone with a crenellated top, from y0, size n x n at (x0,z0) */
export function tower(vb, P, x0, z0, n, y0, h, o = {}) {
  const x1 = x0 + n - 1,
    z1 = z0 + n - 1;
  vb.box(x0, y0, z0, x1, y0, z1, P.base);
  vb.walls(x0, y0 + 1, z0, x1, y0 + h, z1, o.wall || P.wall);
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    vb.box(x, y0 + 1, z, x, y0 + h, z, P.log);
  const cy = y0 + h + 1;
  vb.box(x0 - 1, cy - 1, z0 - 1, x1 + 1, cy - 1, z1 + 1, P.log);
  for (let x = x0 - 1; x <= x1 + 1; x++)
    for (const z of [z0 - 1, z1 + 1]) if ((x - x0) % 2 === 0) vb.set(x, cy, z, P.wall);
  for (let z = z0 - 1; z <= z1 + 1; z++)
    for (const x of [x0 - 1, x1 + 1]) if ((z - z0) % 2 === 0) vb.set(x, cy, z, P.wall);
  if (o.slit !== false)
    for (let y = y0 + 3; y < y0 + h - 1; y += 4)
      vb.set((x0 + x1) >> 1, y, z1, "iron_bars").set((x0 + x1) >> 1, y, z0, "iron_bars");
  return cy;
}

/* a market stall: four posts, striped cloth roof, a counter with crates */
export function stall(vb, x, z, w, l, c1 = "red", c2 = "white") {
  for (const [px, pz] of [
    [x, z],
    [x + w - 1, z],
    [x, z + l - 1],
    [x + w - 1, z + l - 1],
  ])
    vb.box(px, 1, pz, px, 3, pz, "spruce_fence");
  for (let i = 0; i < w; i++) for (let j = 0; j < l; j++) vb.set(x + i, 4, z + j, `${(i + j) % 2 ? c1 : c2}_wool`);
  vb.box(x + 1, 1, z + l - 1, x + w - 2, 1, z + l - 1, "spruce_planks");
  vb.set(x + 1, 2, z + l - 1, "barrel[facing=up]");
}

export function well(vb, x, z) {
  vb.box(x - 1, 1, z - 1, x + 1, 1, z + 1, "stone_bricks");
  vb.set(x, 1, z, "water");
  for (const dx of [-1, 1]) vb.box(x + dx, 2, z, x + dx, 4, z, "spruce_fence");
  vb.box(x - 1, 5, z, x + 1, 5, z, "spruce_slab");
  vb.set(x, 4, z, "chain");
}

export function banner(vb, x, y, z, face, color) {
  vb.set(x, y, z, `banner_${color}[facing=${face}]`);
}
