import { VB } from "../voxel-build.js";

/* ---- the kit the block-built buildings are made from, in the manner of a careful Minecraft builder: nothing is flat. Timber frames stand one
   block proud of their panels, upper floors jetty out on brackets, roofs are steep, flared at the eave, outlined by a darker trim and crowned by
   a crest, with dormers and chimneys breaking their slopes; stone walls get quoins, sills and buttresses; yards are dressed with props.
   Everything is written in Minecraft blocks; x east, y up, z south (the door side). Layer y = 0 is the ground: plinths, paths and props stand on it. ---- */
const R = (st, sl, bl, wl) => ({ st, sl, bl, wl });
export const ROOF = {
  slate: R("deepslate_tile_stairs", "deepslate_tile_slab", "deepslate_tiles", "deepslate_tile_wall"),
  dslate: R("deepslate_brick_stairs", "deepslate_brick_slab", "deepslate_bricks", "deepslate_brick_wall"),
  black: R(
    "polished_blackstone_brick_stairs",
    "polished_blackstone_brick_slab",
    "polished_blackstone_bricks",
    "polished_blackstone_brick_wall",
  ),
  shingle: R("shingle_stairs", "shingle_slab", "shingle"),
  darkShingle: R("dark_shingle_stairs", "dark_shingle_slab", "dark_shingle"),
  spruce: R("spruce_stairs", "spruce_slab", "spruce_planks"),
  dark: R("dark_oak_stairs", "dark_oak_slab", "dark_oak_planks"),
  oak: R("oak_stairs", "oak_slab", "oak_planks"),
  red: R("red_tile_stairs", "red_tile_slab", "red_tiles"),
  clay: R("clay_tile_stairs", "clay_tile_slab", "clay_tiles"),
  blue: R("blue_tile_stairs", "blue_tile_slab", "blue_tiles"),
  green: R("green_tile_stairs", "green_tile_slab", "green_tiles"),
  thatch: R("thatch_stairs", "thatch_slab", "thatch"),
  thatchDark: R("thatch_dark_stairs", "thatch_dark_slab", "thatch_dark"),
  copper: R("cut_copper_stairs", "cut_copper_slab", "cut_copper"),
  stone: R("stone_brick_stairs", "stone_brick_slab", "stone_bricks", "stone_brick_wall"),
  cobble: R("cobblestone_stairs", "cobblestone_slab", "cobblestone", "cobblestone_wall"),
  brick: R("brick_stairs", "brick_slab", "bricks", "brick_wall"),
};

/* tier 0: a timber village (spruce frames filled with daub or planks on a cobble plinth, thatch and wooden shingles);
   tier 1: a stone town (stone-brick ground floors, plastered upper floors in dark oak frames, tiled roofs outlined in dark slate).
   `accent` is the roof a building type is known by in stone; in timber every roof is thatch (accent "thatch", or o.wood) or shingles */
export function palette(t, accent, o = {}) {
  const stone = t !== 0,
    roof = stone ? ROOF[accent || "slate"] : ROOF[o.wood || (accent === "thatch" ? "thatch" : "shingle")],
    thatch = roof === ROOF.thatch,
    trim = thatch
      ? ROOF.thatchDark
      : stone
        ? ROOF[o.trim || (roof === ROOF.slate || roof === ROOF.dslate ? "black" : "dslate")]
        : ROOF.darkShingle,
    W = stone ? "dark_oak" : "spruce";
  return {
    t: stone ? 1 : 0,
    stone,
    base: stone
      ? ["stone_bricks", "stone_bricks", "stone_bricks", "cracked_stone_bricks", "andesite", "mossy_stone_bricks"]
      : ["cobblestone", "cobblestone", "cobblestone", "andesite", "mossy_cobblestone"],
    /* walls of stone (ground floors in stone; in timber the same word gives a planked wall) and the panels of a frame */
    wall: stone
      ? ["stone_bricks", "stone_bricks", "stone_bricks", "stone_bricks", "cracked_stone_bricks", "andesite"]
      : "oak_planks",
    fill: stone ? ["plaster", "plaster", "plaster", "plaster_dark"] : ["daub", "daub", "daub", "daub_dark"],
    quoin: stone ? "polished_andesite" : "spruce_log",
    wood: W,
    post: `${W}_log`,
    bx: `${W}_log[axis=x]`,
    bz: `${W}_log[axis=z]`,
    plank: `${W}_planks`,
    wst: `${W}_stairs`,
    wsl: `${W}_slab`,
    trap: `${W}_trapdoor`,
    fence: `${W}_fence`,
    door: W,
    sst: stone ? "stone_brick_stairs" : "cobblestone_stairs",
    ssl: stone ? "stone_brick_slab" : "cobblestone_slab",
    wallb: stone ? "stone_brick_wall" : "cobblestone_wall",
    roof,
    trim,
    thatch,
    prof: [1, 1, 2, 2],
    crest: thatch ? "block" : "teeth",
    fin: thatch ? `${W}_fence` : stone ? trim.wl : `${W}_fence`,
    pane: "window",
    brick: stone ? ["bricks", "bricks", "bricks", "granite"] : ["cobblestone", "cobblestone", "andesite", "stone"],
    paving: stone ? "paving" : "path",
  };
}

export const model = (w, h, l) => new VB(w, h, l);
const sT = (n, f, h = "bottom", s = "straight") => `${n}[facing=${f},half=${h},shape=${s}]`;
export { sT as stair };
export const rect = (x0, z0, x1, z1) => ({ x0, z0, x1, z1 });

const BARX = "iron_bars[east=true,west=true]",
  BARZ = "iron_bars[north=true,south=true]";

/* the four sides of a building: the step outward, the opposite side, whether the side runs along x */
export const SIDES = ["south", "east", "north", "west"];
const OUT = { south: [0, 1], north: [0, -1], east: [1, 0], west: [-1, 0] },
  OPP = { south: "north", north: "south", east: "west", west: "east" },
  H = (s) => s === "south" || s === "north",
  cell = (side, fixed, c) => (H(side) ? [c, fixed] : [fixed, c]),
  /* the plane of a side of a rectangle and its range along the side */
  sideOf = (r, s) =>
    s === "south"
      ? [r.z1, r.x0, r.x1]
      : s === "north"
        ? [r.z0, r.x0, r.x1]
        : s === "east"
          ? [r.x1, r.z0, r.z1]
          : [r.x0, r.z0, r.z1],
  /* the sign of the outward step along the fixed axis of a side */
  sg = (s) => (s === "south" || s === "east" ? 1 : -1),
  paneOf = (P, side, b) => (b || P.pane) + (H(side) ? "[east=true,west=true]" : "[north=true,south=true]");
export const grow = (r, g) =>
  typeof g === "number"
    ? rect(r.x0 - g, r.z0 - g, r.x1 + g, r.z1 + g)
    : rect(r.x0 - (g.west || 0), r.z0 - (g.north || 0), r.x1 + (g.east || 0), r.z1 + (g.south || 0));

/* evenly spread post positions from a to b, about every `step` blocks, ends included */
export function spread(a, b, step = 3) {
  const n = Math.max(1, Math.round((b - a) / step)),
    r = [];
  for (let i = 0; i <= n; i++) r.push(a + Math.round((i * (b - a)) / n));
  return r;
}
/* the middles of the bays between posts (where windows go) */
export const bays = (ps) => ps.slice(1).map((p, i) => (p + ps[i]) >> 1);

/* ---- walls ---- */
/* a plinth: a course of mixed stone under the walls; a stair flares out from it at the foot of every corner and of the given posts (o.feet: { side: [c...] }) */
export function plinth(vb, P, r, y = 0, o = {}) {
  vb.box(r.x0, y, r.z0, r.x1, y + (o.h || 1) - 1, r.z1, o.b || P.base);
  if (o.feet === false) return;
  for (const s of SIDES) {
    const [f, a, b] = sideOf(r, s),
      cs = o.feet && o.feet[s] ? o.feet[s] : [a, b];
    for (const c of cs) {
      const [x, z] = cell(s, f + sg(s), c);
      vb.add(x, y, z, sT(P.sst, OPP[s]));
    }
  }
}

/* walls of stone from y0 to y1: mixed masonry with dressed quoins that alternate up the corners, an optional string course (o.band: its height) */
export function stoneWalls(vb, P, r, y0, y1, o = {}) {
  const w = o.wall || P.wall;
  vb.walls(r.x0, y0, r.z0, r.x1, y1, r.z1, w);
  if (o.quoin !== false)
    for (const x of [r.x0, r.x1])
      for (const z of [r.z0, r.z1])
        for (let y = y0; y <= y1; y++) if ((y - y0) % 2 === 0) vb.set(x, y, z, o.quoin || P.quoin);
  if (o.band !== undefined) vb.walls(r.x0, o.band, r.z0, r.x1, o.band, r.z1, o.bandB || P.quoin);
}

/* a timber frame from y0 to y1 on the rectangle r: posts and a top beam on r itself, the panels one block behind (o.inset: 0 for a flush wall).
   o.sill: a beam along the bottom too (a jettied floor); o.ps: { side: [post positions] } (else every o.step blocks);
   o.brace: knee braces under the beam in the bays listed ({ side: true | [bay indexes] }); o.skip: { side: true } sides left bare (hidden).
   Returns { q: the rectangle of the panels, ps } */
export function frameWalls(vb, P, r, y0, y1, o = {}) {
  const ins = o.inset === undefined ? 1 : o.inset,
    q = rect(r.x0 + ins, r.z0 + ins, r.x1 - ins, r.z1 - ins),
    ps = {};
  vb.walls(q.x0, y0, q.z0, q.x1, y1, q.z1, o.fill || P.fill);
  for (const s of SIDES) {
    const [f, a, b] = sideOf(r, s);
    ps[s] = (o.ps && o.ps[s]) || spread(a, b, o.step || 3);
    if (o.skip && o.skip[s]) continue;
    const beam = o.beam || (H(s) ? P.bx : P.bz);
    for (let c = a; c <= b; c++) {
      const [x, z] = cell(s, f, c);
      vb.set(x, y1, z, beam);
      if (o.sill) vb.set(x, y0, z, beam);
    }
    for (const c of ps[s]) {
      const [x, z] = cell(s, f, c);
      vb.box(x, y0 + (o.sill ? 1 : 0), z, x, y1 - 1, z, o.post || P.post);
    }
    const br = o.brace && o.brace[s];
    if (br)
      ps[s].slice(1).forEach((p1, i) => {
        const p0 = ps[s][i];
        if (p1 - p0 < 3 || (Array.isArray(br) && !br.includes(i))) return;
        const [xa, za] = cell(s, f, p0 + 1),
          [xb, zb] = cell(s, f, p1 - 1);
        vb.add(xa, y1 - 1, za, sT(P.wst, H(s) ? "west" : "north", "top"));
        vb.add(xb, y1 - 1, zb, sT(P.wst, H(s) ? "east" : "south", "top"));
      });
  }
  for (const x of [r.x0, r.x1]) for (const z of [r.z0, r.z1]) vb.box(x, y0, z, x, y1, z, o.post || P.post);
  return { q, ps };
}

/* walls of upright planks between corner posts, a rail at o.rail and a plate on top (barns, sheds) */
export function plankWalls(vb, P, r, y0, y1, o = {}) {
  vb.walls(r.x0, y0, r.z0, r.x1, y1, r.z1, o.wall || P.plank);
  for (const s of SIDES) {
    const [f, a, b] = sideOf(r, s);
    for (let c = a; c <= b; c++) {
      const [x, z] = cell(s, f, c);
      vb.set(x, y1, z, H(s) ? P.bx : P.bz);
      if (o.rail !== undefined) vb.set(x, o.rail, z, H(s) ? P.bx : P.bz);
    }
    for (const c of (o.ps && o.ps[s]) || []) {
      const [x, z] = cell(s, f, c);
      vb.box(x, y0, z, x, y1, z, P.post);
    }
  }
  for (const x of [r.x0, r.x1]) for (const z of [r.z0, r.z1]) vb.box(x, y0, z, x, y1, z, P.post);
}

/* a cabin of round logs, their ends crossing at the corners */
export function logWalls(vb, P, r, y0, y1, log) {
  for (let y = y0; y <= y1; y++) {
    vb.box(r.x0, y, r.z0, r.x1, y, r.z0, `${log}[axis=x]`).box(r.x0, y, r.z1, r.x1, y, r.z1, `${log}[axis=x]`);
    vb.box(r.x0, y, r.z0 + 1, r.x0, y, r.z1 - 1, `${log}[axis=z]`).box(
      r.x1,
      y,
      r.z0 + 1,
      r.x1,
      y,
      r.z1 - 1,
      `${log}[axis=z]`,
    );
    if ((y - y0) % 2)
      for (const z of [r.z0, r.z1]) vb.set(r.x0 - 1, y, z, `${log}[axis=x]`).set(r.x1 + 1, y, z, `${log}[axis=x]`);
    else
      for (const x of [r.x0, r.x1]) {
        vb.set(x, y, r.z0, `${log}[axis=z]`).set(x, y, r.z1, `${log}[axis=z]`);
        vb.set(x, y, r.z0 - 1, `${log}[axis=z]`).set(x, y, r.z1 + 1, `${log}[axis=z]`);
      }
  }
}

/* windows on one side. f: the plane of the glass, cs: positions along the wall (a number, or [c, width]), y: the bottom of the glass, h: its height.
   What dresses them stands one block out (in the recess of a frame, or proud of a stone wall): o.box: a flower box (a colour) under the glass,
   o.shutter: shutters on both sides, o.sill: a stone ledge, o.hood: a little pent of roof stairs over it, o.pane: another glass */
export function windows(vb, P, side, f, cs, y, h = 2, o = {}) {
  const [ox, oz] = OUT[side];
  for (const c0 of cs) {
    const [c, w] = Array.isArray(c0) ? c0 : [c0, o.w || 1];
    for (let k = 0; k < w; k++) {
      const [x, z] = cell(side, f, c + k);
      for (let i = 0; i < h; i++) vb.set(x, y + i, z, paneOf(P, side, o.pane));
      if (o.box)
        vb.add(
          x + ox,
          y - 1,
          z + oz,
          `window_box_${Array.isArray(o.box) ? o.box[(c + k) % o.box.length] : o.box}[facing=${side}]`,
        );
      if (o.sill) vb.add(x + ox, y - 1, z + oz, sT(typeof o.sill === "string" ? o.sill : P.sst, OPP[side], "top"));
      if (o.hood) vb.add(x + ox, y + h, z + oz, sT((o.hood === true ? P.trim : o.hood).st, OPP[side]));
    }
    if (o.shutter)
      for (const cc of [c - 1, c + w]) {
        const [x, z] = cell(side, f, cc);
        for (let i = 0; i < h; i++) vb.add(x + ox, y + i, z + oz, `${P.trap}[facing=${side},open=true]`);
      }
  }
}

/* arrow slits */
export function slits(vb, side, f, cs, y, h = 2) {
  for (const c of cs) {
    const [x, z] = cell(side, f, c);
    for (let i = 0; i < h; i++) vb.set(x, y + i, z, H(side) ? BARX : BARZ);
  }
}

/* a doorway on one side. f: the plane of the door, c: its (first) position, y: the threshold. o.wide: two leaves; o.arch: a stone arch (three blocks high);
   o.step: a step outside (default); o.frame: posts and a lintel around it (default in timber); o.lantern: a lantern hung beside it */
export function doorway(vb, P, side, f, c, y, o = {}) {
  const [ox, oz] = OUT[side],
    w = o.wide ? 2 : 1,
    [dx, dz] = H(side) ? [1, 0] : [0, 1],
    [x, z] = cell(side, f, c),
    wood = o.wood || P.door;
  for (let i = 0; i < w; i++) {
    const X = x + dx * i,
      Z = z + dz * i;
    vb.set(X, y, Z, `${wood}_door[facing=${side},half=lower]`).set(
      X,
      y + 1,
      Z,
      `${wood}_door[facing=${side},half=upper]`,
    );
    if (o.arch) vb.set(X, y + 2, Z, `${wood}_door[facing=${side},half=upper]`);
    if (o.step !== false) vb.add(X + ox, y - 1, Z + oz, sT(o.stepB || P.sst, OPP[side]));
  }
  if (o.frame) {
    const top = y + (o.arch ? 3 : 2);
    for (const i of [-1, w])
      vb.box(x + dx * i, y, z + dz * i, x + dx * i, top, z + dz * i, o.frame === true ? P.post : o.frame);
    for (let i = 0; i < w; i++)
      vb.set(x + dx * i, top, z + dz * i, o.frame === true ? (H(side) ? P.bx : P.bz) : o.frame);
  }
  if (o.lantern) vb.add(x + dx * w + ox, y + 1, z + dz * w + oz, `sconce[facing=${side}]`);
}

/* brackets: upside-down stairs at the positions cs of the plane f (under a jetty, an eave, a balcony) */
export function brackets(vb, P, side, f, cs, y, b) {
  for (const c of cs) {
    const [x, z] = cell(side, f, c);
    vb.add(x, y, z, sT(b || P.wst, OPP[side], "top"));
  }
}

/* a buttress against a stone wall: a pier one block out from y0 to y1 with a sloped cap */
export function buttress(vb, P, side, f, cs, y0, y1, b) {
  const [ox, oz] = OUT[side];
  for (const c of cs) {
    const [x, z] = cell(side, f, c);
    vb.box(x + ox, y0, z + oz, x + ox, y1 - 1, z + oz, b || P.base);
    vb.set(x + ox, y1, z + oz, sT(P.sst, OPP[side]));
    vb.add(x + 2 * ox, y0, z + 2 * oz, sT(P.sst, OPP[side]));
  }
}

/* ---- roofs ---- */
/* a house volume from the ground up: plinth, ground floor, jettied framed floors, gabled roof.
   o.r: the ground rectangle; o.y: the level of the plinth (0); o.gh: height of the ground storey (3); o.up: framed upper storeys (default: one in stone,
   none in timber); o.uh: height of their panels (3); o.jet: { side: 1 } the sides where they jetty out; o.ground: "stone", "frame" or "plank"
   (default: stone in the stone tier, frame in timber); o.axis: "x" or "z", the ridge; o.roof: options for gabled() (false: no roof);
   o.gps / o.ups: post positions { side: [...] }; o.gbrace / o.ubrace: braced bays; o.gfill / o.ufill: panels.
   Returns { r0, r1: the rectangle of the top floor, top: the wall plate, ridge, g(side) / u(side): the planes of the glass of the ground and
   upper floors, gy / uy: the bottom rows of their panels } */
export function hall(vb, P, o) {
  const r0 = o.r,
    y = o.y || 0,
    gh = o.gh || 3,
    up = o.up === undefined ? (P.t ? 1 : 0) : o.up,
    uh = o.uh || 3,
    ground = o.ground || (P.stone ? "stone" : "frame"),
    jet = o.jet || {};
  if (o.plinth !== false) plinth(vb, P, r0, y, { feet: o.feet });
  const g0 = y + 1,
    g1 = y + gh;
  let gq = r0;
  if (ground === "stone") stoneWalls(vb, P, r0, g0, g1 + (up ? 0 : 1), { wall: o.gwall, quoin: o.quoin });
  else if (ground === "plank") plankWalls(vb, P, r0, g0, g1 + (up ? 0 : 1), { wall: o.gwall, rail: o.rail, ps: o.gps });
  else
    gq = frameWalls(vb, P, r0, g0, g1 + (up ? 0 : 1), {
      ps: o.gps,
      brace: o.gbrace,
      fill: o.gfill,
      inset: o.ginset,
      skip: o.skip,
    }).q;
  let top = g1 + 1,
    r1 = r0,
    q = gq;
  for (let i = 0; i < up; i++) {
    if (i === 0) r1 = grow(r0, jet);
    const F = frameWalls(vb, P, r1, top, top + uh + 1, {
      sill: true,
      ps: o.ups,
      brace: o.ubrace,
      fill: o.ufill,
      skip: o.skip,
    });
    q = F.q;
    if (i === 0)
      for (const s of SIDES) {
        if (!jet[s]) continue;
        const [f] = sideOf(r1, s),
          [, a, b] = sideOf(r0, s),
          cs = [...new Set([a, b, ...F.ps[s].filter((c) => c > a && c < b)])];
        brackets(vb, P, s, f, cs, top - 1);
      }
    top += uh + 1;
  }
  const ridge = o.roof === false ? top : gabled(vb, P, r1, top, { alongX: o.axis === "x", ...(o.roof || {}) });
  return {
    r0,
    r1,
    q,
    top,
    ridge,
    g: (s) => sideOf(gq, s)[0],
    u: (s) => sideOf(q, s)[0],
    gy: g0,
    uy: g1 + 2,
  };
}

/* the two walls of a framed gable for VB.roof: on the frame, queen posts beside the window (or a king post) and a collar beam; one block behind,
   the panels and the attic window. o.win: height of the window above the eave (none when undefined), o.winH; o.alongX: the ridge runs along x */
export function gableFrame(P, o = {}) {
  const beam = o.alongX ? P.bz : P.bx,
    wv = o.win,
    wh = o.winH || 2,
    hasW = wv !== undefined;
  return {
    fill: (u, v) => {
      const a = Math.abs(u),
        even = a % 1 !== 0;
      if (hasW) return (even ? a === 1.5 : a === 1) ? P.post : v === wv + wh ? beam : null;
      return (even ? a === 0.5 : a === 0) ? P.post : o.collar !== undefined && v === o.collar ? beam : null;
    },
    fill2: (u, v) => (hasW && Math.abs(u) < 1 && v >= wv && v < wv + wh ? "window" : o.fill || P.fill),
  };
}
/* a gable of stone: masonry up to the ridge with a window (o.win, o.winH, o.winW half-width) */
export const gableStone =
  (P, o = {}) =>
  (u, v) =>
    o.win !== undefined && Math.abs(u) < (o.winW || 1) && v >= o.win && v < o.win + (o.winH || 2)
      ? o.pane || "window"
      : o.wall || P.wall;

/* a gabled roof over the walls r whose top course is wallTop. o.ov: overhang along the eaves, o.end: overhang at the gables, o.alongX: the ridge
   along x (default: the long side). o.gable: "frame" (default: gableFrame), "stone", or a fill function; the rest goes to VB.roof.
   Returns the height of the ridge */
export function gabled(vb, P, r, wallTop, o = {}) {
  const ax = o.alongX !== undefined ? o.alongX : r.x1 - r.x0 >= r.z1 - r.z0,
    ov = o.ov === undefined ? 1 : o.ov,
    end = o.end === undefined ? 1 : o.end,
    prof = o.prof || P.prof;
  let rise = 0;
  for (let i = 0; i < ov; i++) rise += prof[Math.min(i, prof.length - 1)];
  const g =
    typeof o.gable === "function"
      ? { fill: o.gable }
      : o.gable === "stone"
        ? { fill: gableStone(P, o) }
        : o.gable === false
          ? {}
          : gableFrame(P, { ...o, alongX: ax });
  return vb.roof({
    x0: ax ? r.x0 - end : r.x0 - ov,
    x1: ax ? r.x1 + end : r.x1 + ov,
    z0: ax ? r.z0 - ov : r.z0 - end,
    z1: ax ? r.z1 + ov : r.z1 + end,
    y: wallTop + 1 - rise,
    alongX: ax,
    m: o.m || P.roof,
    t: o.t || P.trim,
    eave: o.eave === undefined ? false : o.eave,
    prof,
    end,
    finAt: o.finAt,
    cap: o.cap,
    under: o.under === undefined ? true : o.under,
    crest: o.crest === undefined ? P.crest : o.crest,
    fin: o.fin === undefined ? P.fin : o.fin,
    fill: g.fill,
    fill2: g.fill2,
  });
}

/* a dormer on a roof slope. side: the slope it looks out of, c: its middle along the eave, f: the plane of its face, y: its sill
   (one above the top of the wall as a rule). A window of o.w panes (default 1) between two posts under its own little gable, run back into the
   roof until it disappears in it */
export function dormer(vb, P, side, c, f, y, o = {}) {
  const w = o.w || 1,
    h = o.h || 2,
    m = o.m || P.roof,
    t = o.t || P.trim,
    lo = c - 1,
    hi = c + w,
    put = (a, yy, d, b, force) => {
      const [x, z] = cell(side, f - sg(side) * d, a);
      return force ? vb.set(x, yy, z, b) : vb.add(x, yy, z, b);
    },
    mid = (lo + hi) / 2,
    fa = H(side) ? "east" : "south",
    fb = H(side) ? "west" : "north";
  /* the face */
  for (const a of [lo, hi]) for (let i = 0; i < h; i++) put(a, y + i, 0, P.post, true);
  for (let a = lo + 1; a < hi; a++) for (let i = 0; i < h; i++) put(a, y + i, 0, paneOf(P, side, o.pane), true);
  for (let a = lo; a <= hi; a++) put(a, y + h, 0, H(side) ? P.bx : P.bz, true);
  /* its roof, from one block in front of the face back into the slope */
  for (let d = -1; d < (o.depth || 12); d++) {
    const [rx, rz] = cell(side, f - sg(side) * d, Math.floor(mid));
    let yk = y + h;
    if (d > 0 && vb.get(rx, yk + Math.ceil((hi - lo + 2) / 2), rz)) break;
    for (let k = 0; lo - 1 + k <= hi + 1 - k; k++) {
      const a = lo - 1 + k,
        b = hi + 1 - k,
        M = d === -1 ? t : m;
      if (a === b) put(a, yk, d, t.sl + "[type=bottom]", d <= 0);
      else {
        put(a, yk, d, sT(M.st, fa), d <= 0);
        put(b, yk, d, sT(M.st, fb), d <= 0);
        if (b - a === 1) {
          put(a, yk + 1, d, t.sl + "[type=bottom]", d <= 0);
          put(b, yk + 1, d, t.sl + "[type=bottom]", d <= 0);
        } else if (d === 0) for (let q = a + 1; q < b; q++) if (yk > y + h) put(q, yk, d, P.plank, true);
      }
      yk++;
    }
    /* cheeks */
    if (d > 0) for (const a of [lo, hi]) for (let i = 0; i <= h; i++) put(a, y + i, d, o.cheek || P.fill);
  }
}

/* a chimney stack from y0 to y1 with a corbelled cap and a pot; o.smoke: embers glowing in the pot */
export function chimney(vb, P, x, z, y0, y1, o = {}) {
  const b = o.block || P.brick;
  vb.box(x, y0, z, x + (o.w || 1) - 1, y1, z + (o.l || 1) - 1, b);
  for (let i = 0; i < (o.w || 1); i++)
    for (let j = 0; j < (o.l || 1); j++) vb.set(x + i, y1 + 1, z + j, o.pot || P.wallb);
  if (o.cap !== false) {
    const st = o.capSt || (P.stone ? "brick_stairs" : "cobblestone_stairs"),
      x1 = x + (o.w || 1) - 1,
      z1 = z + (o.l || 1) - 1;
    for (let i = x; i <= x1; i++)
      vb.add(i, y1, z - 1, sT(st, "south", "top")).add(i, y1, z1 + 1, sT(st, "north", "top"));
    for (let j = z; j <= z1; j++) vb.add(x - 1, y1, j, sT(st, "east", "top")).add(x1 + 1, y1, j, sT(st, "west", "top"));
  }
}

/* a chimney breast against a wall: a stack one block out from the ground to above the roof, c0..c1 wide at the foot, narrowing to one flue
   above the shoulder (o.sh); f: the plane of the stack itself */
export function breast(vb, P, side, f, c0, c1, y0, y1, o = {}) {
  const b = o.block || P.brick,
    sh = o.sh === undefined ? y1 : o.sh,
    st = P.stone ? "brick_stairs" : "cobblestone_stairs",
    lo = H(side) ? "west" : "north",
    hi = H(side) ? "east" : "south";
  for (let c = c0; c <= c1; c++) {
    const [x, z] = cell(side, f, c);
    vb.box(x, y0, z, x, c === c0 || sh >= y1 ? y1 : sh, z, b);
    if (c !== c0 && sh < y1) vb.set(x, sh + 1, z, sT(st, lo));
  }
  const top = sh < y1 ? [c0] : [c0, c1];
  for (let c = top[0]; c <= top[top.length - 1]; c++) {
    const [x, z] = cell(side, f, c);
    vb.set(x, y1 + 1, z, o.pot || P.wallb);
  }
  const [xa, za] = cell(side, f, top[0] - 1),
    [xb, zb] = cell(side, f, top[top.length - 1] + 1);
  vb.add(xa, y1, za, sT(st, hi, "top")).add(xb, y1, zb, sT(st, lo, "top"));
}

/* a porch in front of a door: a little gable on two posts. c: the middle of the door, f: the plane of the wall, y: the threshold */
export function porch(vb, P, side, f, c, y, o = {}) {
  const d = o.d || 2,
    hw = o.hw || 1,
    m = o.m || P.roof,
    t = o.t || P.trim,
    s = sg(side),
    fa = H(side) ? "east" : "south",
    fb = H(side) ? "west" : "north",
    h = o.h || 3;
  for (const a of [c - hw, c + hw]) {
    const [x, z] = cell(side, f + s * d, a);
    vb.box(x, y, z, x, y + h - 1, z, o.post || P.fence);
    vb.set(x, y - 1, z, P.base);
  }
  for (let q = 1; q <= d + 1; q++) {
    let yk = y + h;
    for (let k = 0; c - hw - 1 + k <= c + hw + 1 - k; k++) {
      const a = c - hw - 1 + k,
        b = c + hw + 1 - k,
        M = q === d + 1 ? t : m,
        [xa, za] = cell(side, f + s * q, a),
        [xb, zb] = cell(side, f + s * q, b);
      if (a === b) vb.set(xa, yk, za, t.sl + "[type=bottom]");
      else {
        vb.set(xa, yk, za, sT(M.st, fa)).set(xb, yk, zb, sT(M.st, fb));
        if (q === d)
          for (let u = a + 1; u < b; u++) {
            const [xu, zu] = cell(side, f + s * q, u);
            if (yk > y + h) vb.set(xu, yk, zu, P.plank);
            else if (yk === y + h) vb.set(xu, yk, zu, H(side) ? P.bx : P.bz);
          }
      }
      yk++;
    }
  }
  if (o.lantern !== false) {
    const [x, z] = cell(side, f + s * d, c);
    vb.add(x, y + h - 1, z, "lantern[hanging=true]");
  }
}

/* an oriel: a bay of windows hung on the wall on corbels, under its own pent roof. c0..c1 along the wall, f: the plane of the wall, y: its floor */
export function oriel(vb, P, side, f, c0, c1, y, o = {}) {
  const s = sg(side),
    h = o.h || 3,
    m = o.m || P.trim;
  for (let c = c0; c <= c1; c++) {
    const [x, z] = cell(side, f + s, c),
      end = c === c0 || c === c1;
    vb.set(x, y - 1, z, sT(P.wst, OPP[side], "top"));
    vb.set(x, y, z, H(side) ? P.bx : P.bz);
    for (let i = 1; i < h; i++) vb.set(x, y + i, z, end ? P.post : paneOf(P, side, o.pane));
    vb.set(x, y + h, z, H(side) ? P.bx : P.bz);
    const [x2, z2] = cell(side, f + 2 * s, c);
    vb.set(x2, y + h, z2, sT(m.st, OPP[side]));
    vb.set(x, y + h + 1, z, sT(m.st, OPP[side]));
  }
}

/* ---- towers ---- */
/* a square tower: mixed stone shaft with quoins, arrow slits, a parapet carried out on corbels with merlons (o.parapet false: none).
   r: its rectangle, y0 base, top: the last course of the shaft. Returns the height of the wall walk */
export function tower(vb, P, r, y0, top, o = {}) {
  const wall = o.wall || P.wall,
    q = o.quoin || (P.stone ? P.quoin : P.post);
  vb.walls(r.x0, y0, r.z0, r.x1, top, r.z1, wall);
  vb.walls(r.x0, y0, r.z0, r.x1, y0, r.z1, P.base);
  for (const x of [r.x0, r.x1])
    for (const z of [r.z0, r.z1])
      for (let y = y0; y <= top; y++) if (P.stone ? (y - y0) % 2 === 0 : true) vb.set(x, y, z, q);
  if (o.slit !== false) {
    const mx = (r.x0 + r.x1) >> 1,
      mz = (r.z0 + r.z1) >> 1;
    for (let y = y0 + 3; y < top - 2; y += o.slitEvery || 5) {
      vb.set(mx, y, r.z1, BARX)
        .set(mx, y + 1, r.z1, BARX)
        .set(mx, y, r.z0, BARX)
        .set(mx, y + 1, r.z0, BARX);
      vb.set(r.x0, y, mz, BARZ)
        .set(r.x0, y + 1, mz, BARZ)
        .set(r.x1, y, mz, BARZ)
        .set(r.x1, y + 1, mz, BARZ);
    }
  }
  if (o.band) for (const y of o.band) vb.walls(r.x0, y, r.z0, r.x1, y, r.z1, o.bandB || P.quoin);
  if (o.parapet === false) return top;
  return parapet(vb, P, r, top, o);
}
/* a parapet on the rectangle r: a ring one block out resting on corbels at the height y, merlons on it. Returns the height of the walk */
export function parapet(vb, P, r, y, o = {}) {
  const st = o.cst || (P.stone ? "stone_brick_stairs" : P.wst),
    cb = o.cb || (P.stone ? "stone_bricks" : P.plank),
    g = grow(r, 1);
  for (let x = r.x0; x <= r.x1; x++) vb.set(x, y, g.z0, sT(st, "south", "top")).set(x, y, g.z1, sT(st, "north", "top"));
  for (let z = r.z0; z <= r.z1; z++) vb.set(g.x0, y, z, sT(st, "east", "top")).set(g.x1, y, z, sT(st, "west", "top"));
  vb.set(g.x0, y, g.z0, sT(st, "south", "top", "outer_left")).set(g.x1, y, g.z0, sT(st, "south", "top", "outer_right"));
  vb.set(g.x0, y, g.z1, sT(st, "north", "top", "outer_right")).set(g.x1, y, g.z1, sT(st, "north", "top", "outer_left"));
  if (o.floor !== false) vb.box(r.x0, y, r.z0, r.x1, y, r.z1, cb);
  vb.walls(g.x0, y + 1, g.z0, g.x1, y + 1, g.z1, cb);
  for (let x = g.x0; x <= g.x1; x++)
    for (let z = g.z0; z <= g.z1; z++) {
      const edge = x === g.x0 || x === g.x1 || z === g.z0 || z === g.z1;
      if (edge && (x - g.x0 + (z - g.z0)) % 2 === 0) vb.set(x, y + 2, z, o.merlon || cb);
    }
  return y;
}

/* a spire on a square tower: a cornice of corbels round the shaft r at the height y, then a pointed roof one block wider than the shaft.
   o.prof: its profile (default flared then steep), o.fin: its finial(s). Returns the height of its top */
export function spireTop(vb, P, r, y, o = {}) {
  const st = o.cst || (P.stone ? "stone_brick_stairs" : P.wst),
    g = grow(r, 1);
  for (let x = r.x0; x <= r.x1; x++) vb.set(x, y, g.z0, sT(st, "south", "top")).set(x, y, g.z1, sT(st, "north", "top"));
  for (let z = r.z0; z <= r.z1; z++) vb.set(g.x0, y, z, sT(st, "east", "top")).set(g.x1, y, z, sT(st, "west", "top"));
  vb.set(g.x0, y, g.z0, sT(st, "south", "top", "outer_left")).set(g.x1, y, g.z0, sT(st, "south", "top", "outer_right"));
  vb.set(g.x0, y, g.z1, sT(st, "north", "top", "outer_right")).set(g.x1, y, g.z1, sT(st, "north", "top", "outer_left"));
  return vb.hipRoof({
    x0: g.x0,
    z0: g.z0,
    x1: g.x1,
    z1: g.z1,
    y: y + 1,
    m: o.m || P.roof,
    t: o.t || P.trim,
    prof: o.prof || [1, 2, 2, 3],
    fin: o.fin === undefined ? [P.fin] : o.fin,
  });
}

/* a round tower centred on (cx, cz) (halves for even widths), radius r, from y0 to y1; a base ring one wider, bands, slits every 5 blocks */
export function roundTower(vb, P, cx, cz, r, y0, y1, o = {}) {
  const wall = o.wall || P.wall;
  for (let y = y0; y <= y1; y++) vb.disc(cx, cz, r, y, wall);
  vb.disc(cx, cz, r + 0.6, y0, P.base);
  if (o.band) for (const y of o.band) vb.disc(cx, cz, r, y, o.bandB || P.quoin, r - 1.05);
  if (o.slit !== false)
    for (let y = y0 + 3; y < y1 - 2; y += o.slitEvery || 5)
      for (let i = 0; i < 2; i++) {
        /* the outermost cell of the round wall on each of the four sides */
        vb.set(Math.floor(cx), y + i, Math.floor(cz + r - 0.5), BARX).set(
          Math.floor(cx + r - 0.5),
          y + i,
          Math.floor(cz),
          BARZ,
        );
        vb.set(Math.floor(cx), y + i, Math.ceil(cz - r - 0.5), BARX).set(
          Math.ceil(cx - r - 0.5),
          y + i,
          Math.floor(cz),
          BARZ,
        );
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

/* ---- nature ---- */
/* a broadleaf tree: a trunk and a crown of leaves rounded off at its corners */
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
/* a small round tree (orchards, gardens): three layers of leaves; fruit: a block mixed in the crown */
export function smallTree(vb, x, z, y0, h, leaf = "oak_leaves", log = "oak_log", fruit) {
  vb.box(x, y0, z, x, y0 + h - 1, z, log);
  for (let dy = 0; dy < 3; dy++) {
    const r = dy === 2 ? 1 : 2;
    for (let dz = -r; dz <= r; dz++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (r === 1 && dx && dz) continue;
        if (dx === 0 && dz === 0 && dy === 0) continue;
        const f = fruit && (dx * 3 + dz * 5 + dy * 7 + x + z * 2) % 7 === 0;
        vb.add(x + dx, y0 + h - 1 + dy, z + dz, f ? fruit : leaf);
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
/* a cypress: a slim dark column of leaves */
export function cypress(vb, x, z, y0, h) {
  vb.set(x, y0, z, "spruce_log");
  for (let y = y0 + 1; y < y0 + h; y++) {
    vb.set(x, y, z, "spruce_leaves");
    if (y > y0 + 1 && y < y0 + h - 2)
      for (const [a, b] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
        if ((y + a * 2 + b) % 3) vb.add(x + a, y, z + b, "spruce_leaves");
  }
}
/* low plants: a shrub (flowering when given a colour), flowers, grass */
export const shrub = (vb, x, z, flower, y = 0) => vb.add(x, y, z, flower ? `shrub_${flower}` : "shrub");
export const flowers = (vb, x, z, c, y = 0) => vb.add(x, y, z, `flower_${c}`);
/* a bed scattered over a rectangle from a fixed pattern: every cell takes one of the plants or stays bare */
export function bed(vb, x0, z0, x1, z1, plants, y = 0) {
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      const p = plants[(x * 7 + z * 13 + x * z) % plants.length];
      if (p) vb.add(x, y, z, p);
    }
}

/* ---- yard props ---- */
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
  for (const dz of [-1, 0, 1]) {
    vb.set(x - 1, y + 3, z + dz, sT(P.roof.st, "east")).set(x + 1, y + 3, z + dz, sT(P.roof.st, "west"));
    vb.set(x, y + 4, z + dz, P.trim.sl + "[type=bottom]");
  }
  vb.set(x, y + 3, z, P.bx).set(x, y + 2, z, "chain");
}

/* a market stall: four posts, a striped awning falling to the front (south), a counter loaded with goods */
export function stall(vb, P, x, z, w, c1 = "red", c2 = "white", goods = ["barrel", "crate"]) {
  for (const px of [x, x + w - 1]) {
    vb.box(px, 0, z, px, 3, z, P.fence);
    vb.box(px, 0, z + 2, px, 2, z + 2, P.fence);
  }
  for (let i = 0; i < w; i++) {
    const c = i % 2 ? c1 : c2;
    vb.set(x + i, 4, z, `${c}_cloth_slab[type=bottom]`)
      .set(x + i, 3, z + 1, sT(`${c}_cloth_stairs`, "north"))
      .set(x + i, 3, z + 2, `${c}_cloth_slab[type=bottom]`)
      .set(x + i, 2, z + 3, sT(`${c}_cloth_stairs`, "north"));
  }
  for (let i = 1; i < w - 1; i++) {
    vb.set(x + i, 0, z + 2, P.plank);
    vb.set(x + i, 1, z + 2, goods[i % goods.length]);
  }
  vb.set(x + 1, 0, z, "barrel").set(x + w - 2, 0, z, "crate");
}

/* a training dummy: a post, a body of straw with arms, a pumpkin head */
export function dummy(vb, P, x, z, y = 0) {
  vb.set(x, y, z, P.fence)
    .set(x, y + 1, z, "hay_block")
    .set(x, y + 2, z, "pumpkin");
  vb.set(x - 1, y + 1, z, `${P.fence}[east=true]`).set(x + 1, y + 1, z, `${P.fence}[west=true]`);
}
/* an archery butt on a stand */
export function butt(vb, P, x, z, y = 0) {
  vb.set(x, y, z, P.fence).set(x, y + 1, z, "target");
}

/* a banner hanging from a wall (two blocks tall) */
export function banner(vb, x, y, z, face, color) {
  vb.set(x, y, z, `banner_${color}[facing=${face}]`).set(x, y - 1, z, `banner_${color}[facing=${face}]`);
}
/* a free-standing flag pole with a flag flying east */
export function flagPole(vb, P, x, z, y0, h, color) {
  vb.box(x, y0, z, x, y0 + h - 1, z, P.fence);
  vb.set(x + 1, y0 + h - 1, z, `banner_${color}[facing=south]`).set(
    x + 2,
    y0 + h - 1,
    z,
    `banner_${color}[facing=south]`,
  );
  vb.set(x + 1, y0 + h - 2, z, `banner_${color}[facing=south]`);
}

/* a street lamp: a post with a lantern hung from an arm */
export function lampPost(vb, P, x, z, y = 0, h = 3) {
  vb.box(x, y, z, x, y + h - 1, z, P.fence).set(x, y + h, z, "lantern");
}
/* a clipped hedge, a flower on every other block */
export function hedge(vb, x0, z0, x1, z1, flower, y = 0) {
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      vb.add(x, y, z, "azalea_leaves");
      if (flower && (x + z) % 2 === 0) vb.add(x, y + 1, z, `flower_${flower}`);
    }
}
/* a square of paving, two tones in a checker; with a third block, a border */
export function plaza(vb, x0, z0, x1, z1, a = "paving", b = "paving_dark") {
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) vb.add(x, 0, z, (x + z) % 2 ? a : b);
}
/* a path of single blocks */
export function path(vb, cells, b) {
  for (const [x, z] of cells) vb.add(x, 0, z, b);
}
/* a hand cart: a tray on two wheels with its shafts toward +x, loaded */
export function cart(vb, P, x, z, load = "sacks") {
  vb.box(x, 1, z, x + 2, 1, z + 1, P.wsl + "[type=bottom]");
  vb.set(x + 1, 0, z - 1, "wheel[facing=north]").set(x + 1, 0, z + 2, "wheel[facing=south]");
  vb.set(x + 1, 0, z, P.fence).set(x + 1, 0, z + 1, P.fence);
  vb.set(x + 3, 1, z, `${P.fence}[west=true]`).set(x + 3, 1, z + 1, `${P.fence}[west=true]`);
  vb.set(x, 2, z, load).set(x + 1, 2, z + 1, load);
}
/* a stack of goods from a fixed pattern: crates, barrels, sacks */
export function goods(vb, x0, z0, x1, z1, y = 0, set = ["crate", "barrel", "sacks", null]) {
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      const k = (x * 5 + z * 11) % set.length;
      if (!set[k]) continue;
      vb.add(x, y, z, set[k]);
      if (set[k] !== "sacks" && (x + z * 3) % 4 === 0) vb.add(x, y + 1, z, set[(k + 1) % set.length] || "crate");
    }
}
/* a tent: a ridge of cloth along z, five blocks wide, open at both ends, a pole at each end */
export function tent(vb, x, z, l, c = "white", c2) {
  for (let i = 0; i < l; i++) {
    const cc = c2 && i % 2 ? c2 : c;
    vb.set(x - 2, 0, z + i, sT(`${cc}_cloth_stairs`, "east")).set(x + 2, 0, z + i, sT(`${cc}_cloth_stairs`, "west"));
    vb.set(x - 1, 1, z + i, sT(`${cc}_cloth_stairs`, "east")).set(x + 1, 1, z + i, sT(`${cc}_cloth_stairs`, "west"));
    vb.set(x, 2, z + i, `${cc}_cloth_slab[type=bottom]`);
  }
  for (const zz of [z, z + l - 1]) vb.box(x, 0, zz, x, 1, zz, "spruce_fence");
}
