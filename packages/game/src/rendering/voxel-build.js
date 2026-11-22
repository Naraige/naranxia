import { defOf } from "./voxel-blocks.js";

/* ---- a tiny builder for voxel models, written in Minecraft terms: place blocks by name, fill boxes, raise gabled roofs from stairs.
   Coordinates are blocks: x east, y up, z south. A block name is a Minecraft id ("stone_bricks", "spruce_stairs[facing=north,half=bottom]"); the result is {w,h,l,defs,vox} for voxelGeo. ---- */
const cellHash = (x, y, z) => {
  let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export class VB {
  constructor(w, h, l) {
    this.w = w;
    this.h = h;
    this.l = l;
    this.vox = new Uint8Array(w * h * l);
    this.defs = [];
    this.key = new Map();
    this.cache = new Map();
    this.unk = new Set();
    /* shifts the pattern of mixed blocks, so two models of the same shape need not mix their stones alike */
    this.sx = 0;
    this.marks = [];
  }
  id(b) {
    if (b === 0 || b === "air") return 0;
    let i = this.cache.get(b);
    if (i !== undefined) return i;
    const d = defOf(b, this.unk);
    if (!d || d.k === "ground") i = 0;
    else {
      const k = JSON.stringify(d);
      if (!this.key.has(k)) {
        this.defs.push(d);
        this.key.set(k, this.defs.length);
      }
      i = this.key.get(k);
    }
    this.cache.set(b, i);
    return i;
  }
  inside(x, y, z) {
    return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.h && z < this.l;
  }
  /* b is a block name, a block index, or a list of names: then one is picked per cell (a fixed pattern), which is how masons mix stone */
  set(x, y, z, b) {
    if (!this.inside(x, y, z)) return this;
    if (Array.isArray(b)) b = b[Math.floor(cellHash(x + this.sx, y, z) * b.length)];
    this.vox[(y * this.l + z) * this.w + x] = typeof b === "number" ? b : this.id(b);
    return this;
  }
  /* only where nothing stands yet */
  add(x, y, z, b) {
    return this.get(x, y, z) ? this : this.set(x, y, z, b);
  }
  get(x, y, z) {
    return this.inside(x, y, z) ? this.vox[(y * this.l + z) * this.w + x] : 0;
  }
  /* inclusive box */
  box(x0, y0, z0, x1, y1, z1, b) {
    const i = Array.isArray(b) ? b : this.id(b);
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, i);
    return this;
  }
  /* the four walls of a box, no floor or ceiling */
  walls(x0, y0, z0, x1, y1, z1, b) {
    this.box(x0, y0, z0, x1, y1, z0, b).box(x0, y0, z1, x1, y1, z1, b);
    return this.box(x0, y0, z0, x0, y1, z1, b).box(x1, y0, z0, x1, y1, z1, b);
  }
  /* a hollow box: walls plus floor and ceiling */
  shell(x0, y0, z0, x1, y1, z1, b) {
    return this.walls(x0, y0, z0, x1, y1, z1, b).box(x0, y0, z0, x1, y0, z1, b).box(x0, y1, z0, x1, y1, z1, b);
  }
  /* a gabled roof with a profile, the way steep medieval roofs are built: o.prof lists how many blocks each row climbs from the eave inward
     (1 = a stair, 2 = a block with a stair on it...), so [1, 1, 2, 2] flares at the eave and steepens to the ridge.
     (x0,z0)-(x1,z1) is the whole roof with its overhangs, y the eave. m and t are materials {st, sl, bl} for the body and for the trim: the trim
     draws the outline of the roof (the row at each gable end, the eave course unless o.eave says otherwise, the ridge).
     o.under thickens the barge boards (stairs under the trim rows); o.crest shapes the ridge: "teeth" (blocks and slabs alternate), "block",
     a block name (a ridge pole), else slabs; o.fin is a block set on both ends of the ridge (o.finAt "lo" / "hi": on one end only).
     o.fill(u, v, far) gives the blocks of the gable walls (u: offset from the middle, v: height above the eave), set `end` blocks in from each end;
     o.fill2 the same one block further in (the panels of a framed gable). Returns the height of the ridge; this.rf describes the courses
     ({ ys: top of each course, lo, hi, n0, n1, ax, top }) for whatever is set on the roof afterwards (dormers, chimneys) */
  roof(o) {
    const { x0, z0, x1, z1, y, m } = o,
      t = o.t || m,
      e = o.eave === false ? m : o.eave || t,
      ax = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0,
      prof = o.prof || [1],
      end = o.end === undefined ? 1 : o.end,
      lo = ax ? z0 : x0,
      hi = ax ? z1 : x1,
      n0 = ax ? x0 : z0,
      n1 = ax ? x1 : z1,
      put = (tt, c, yy, b) => (ax ? this.set(tt, yy, c, b) : this.set(c, yy, tt, b)),
      addb = (tt, c, yy, b) => (ax ? this.add(tt, yy, c, b) : this.add(c, yy, tt, b)),
      fa = ax ? "south" : "east",
      fb = ax ? "north" : "west",
      S = (M, f, h = "bottom") => `${M.st}[facing=${f},half=${h},shape=straight]`,
      slab = t.sl + "[type=bottom]",
      ridge = (tt) =>
        o.crest === "teeth"
          ? (tt - n0) % 2 === 0
            ? t.bl
            : slab
          : o.crest === "block"
            ? t.bl
            : typeof o.crest === "string"
              ? o.crest
              : slab,
      ys = [];
    let yk = y,
      top = y;
    for (let k = 0; lo + k <= hi - k; k++) {
      const a = lo + k,
        b = hi - k,
        r = a === b ? 1 : prof[Math.min(k, prof.length - 1)];
      for (let tt = n0; tt <= n1; tt++) {
        const edge = tt === n0 || tt === n1,
          M = edge ? t : k === 0 ? e : m;
        if (a === b) put(tt, a, yk, ridge(tt));
        else {
          for (let i = 0; i < r - 1; i++) {
            put(tt, a, yk + i, M.bl);
            put(tt, b, yk + i, M.bl);
          }
          put(tt, a, yk + r - 1, S(M, fa));
          put(tt, b, yk + r - 1, S(M, fb));
          if (edge && o.under && k > 0) {
            addb(tt, a, yk - 1, S(t, fa, "top"));
            addb(tt, b, yk - 1, S(t, fb, "top"));
          }
          if (b - a === 1 && o.cap !== false) {
            put(tt, a, yk + r, ridge(tt));
            put(tt, b, yk + r, ridge(tt));
          }
          for (const [fn, d] of [
            [o.fill, end],
            [o.fill2, end + 1],
          ]) {
            if (!fn || (tt !== n0 + d && tt !== n1 - d) || n0 + d > n1 - d) continue;
            for (let c = a + 1; c < b; c++)
              for (let i = 0; i < r; i++) {
                const bl = fn(c - (lo + hi) / 2, yk + i - y, tt === n0 + d ? 0 : 1);
                if (bl)
                  put(
                    tt,
                    c,
                    yk + i,
                    bl === "window" ? bl + (ax ? "[north=true,south=true]" : "[east=true,west=true]") : bl,
                  );
              }
          }
        }
      }
      ys.push(yk + r - 1);
      top = a === b ? yk : b - a === 1 && o.cap !== false ? yk + r : yk + r - 1;
      yk += r;
    }
    if (o.fin) {
      const c = (lo + hi) >> 1;
      for (const tt of o.finAt === "lo" ? [n0] : o.finAt === "hi" ? [n1] : [n0, n1]) put(tt, c, top + 1, o.fin);
    }
    this.rf = { ys, lo, hi, n0, n1, ax, top, y };
    return top;
  }
  /* a lean-to roof: one slope climbing from the low side. dir is the side the roof falls toward ("south": low at z1); o.t trims its two ends and its eave */
  shed(o) {
    const { x0, z0, x1, z1, y, m, dir } = o,
      prof = o.prof || [1],
      ax = dir === "south" || dir === "north",
      n = ax ? z1 - z0 : x1 - x0,
      back = { south: "north", north: "south", east: "west", west: "east" }[dir];
    let yk = y;
    for (let k = 0; k <= n; k++) {
      const r = prof[Math.min(k, prof.length - 1)],
        c = dir === "south" ? z1 - k : dir === "north" ? z0 + k : dir === "east" ? x1 - k : x0 + k;
      for (let tt = ax ? x0 : z0; tt <= (ax ? x1 : z1); tt++) {
        const M = o.t && (tt === (ax ? x0 : z0) || tt === (ax ? x1 : z1) || k === 0) ? o.t : m;
        for (let i = 0; i < r - 1; i++) ax ? this.set(tt, yk + i, c, M.bl) : this.set(c, yk + i, tt, M.bl);
        const s = `${M.st}[facing=${back},half=bottom,shape=straight]`;
        ax ? this.set(tt, yk + r - 1, c, s) : this.set(c, yk + r - 1, tt, s);
      }
      yk += r;
    }
    return yk - 1;
  }
  /* a hipped roof over a rectangle, or a spire over a square: rings of stairs climbing by the profile. The trim (o.t) draws the eave ring
     (unless o.eave is false) and the four hips; the last ring closes on a ridge of slabs, a square on a point (of the trim, or of o.tip)
     with its finial (o.fin). Returns the height of the top */
  hipRoof(o) {
    const { y, m } = o,
      t = o.t || m,
      prof = o.prof || [1],
      S = (M, f, sh) => `${M.st}[facing=${f},half=bottom,shape=${sh}]`;
    let a = o.x0,
      b = o.z0,
      c = o.x1,
      d = o.z1,
      yk = y;
    for (let k = 0; a <= c && b <= d; k++, a++, b++, c--, d--) {
      const r = prof[Math.min(k, prof.length - 1)];
      if (c - a < 2 || d - b < 2) {
        const point = c - a < 2 && d - b < 2;
        if (!point) {
          /* a ridge: one course of slabs */
          this.box(a, yk, b, c, yk, d, t.sl + "[type=bottom]");
          return yk;
        }
        for (let i = 0; i < r; i++) this.box(a, yk + i, b, c, yk + i, d, (o.tip || t).bl);
        if (o.fin && point) {
          const fs = Array.isArray(o.fin) ? o.fin : [o.fin];
          fs.forEach((f, i) => this.set(a, yk + r + i, b, f));
          return yk + r - 1 + fs.length;
        }
        return yk + r - 1;
      }
      const M = k === 0 && o.eave !== false ? o.eave || t : m;
      for (let i = 0; i < r - 1; i++) {
        this.walls(a, yk + i, b, c, yk + i, d, M.bl);
        for (const [x, z] of [
          [a, b],
          [c, b],
          [a, d],
          [c, d],
        ])
          this.set(x, yk + i, z, t.bl);
      }
      const yy = yk + r - 1;
      for (let x = a; x <= c; x++)
        this.set(x, yy, b, S(M, "south", "straight")).set(x, yy, d, S(M, "north", "straight"));
      for (let z = b; z <= d; z++) this.set(a, yy, z, S(M, "east", "straight")).set(c, yy, z, S(M, "west", "straight"));
      this.set(a, yy, b, S(t, "south", "outer_left")).set(c, yy, b, S(t, "south", "outer_right"));
      this.set(a, yy, d, S(t, "north", "outer_right")).set(c, yy, d, S(t, "north", "outer_left"));
      yk += r;
    }
    return yk - 1;
  }
  spire(o) {
    return this.hipRoof(o);
  }
  /* every cell of the layer y whose centre is within r of (cx, cz); with r0 only the ring between r0 and r. cx, cz may be halves (a tower of even width) */
  disc(cx, cz, r, y, b, r0 = -1) {
    for (let z = Math.floor(cz - r - 1); z <= cz + r + 1; z++)
      for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
        const d = (x + 0.5 - cx) ** 2 + (z + 0.5 - cz) ** 2;
        if (d <= r * r && (r0 < 0 || d > r0 * r0)) this.set(x, y, z, b);
      }
    return this;
  }
  /* a round wall from y0 to y1 */
  tube(cx, cz, r, y0, y1, b) {
    for (let y = y0; y <= y1; y++) this.disc(cx, cz, r, y, b, r - 1.05);
    return this;
  }
  /* a cone of blocks: the radius shrinks by `step` every `rise` layers (rise: a number, or a list of heights from the foot up, so a spire can
     flare then shoot up), with a brim of slabs at the foot and a slab between the steps.
     t: another material for the brim and the tip; fin: a finial. Returns the height of the top */
  cone(cx, cz, r, y, m, rise = 2, step = 1, brim = true, t, fin) {
    const T = t || m,
      rs = Array.isArray(rise) ? rise : null;
    if (brim) this.disc(cx, cz, r + 1, y, T.sl + "[type=bottom]");
    let yy = y,
      k = 0;
    for (let rr = r; rr > 0.45; rr -= step, k++) {
      const last = rr - step > 0.45 ? m : T,
        h = rs ? rs[Math.min(k, rs.length - 1)] : rise;
      for (let i = 0; i < h; i++) this.disc(cx, cz, rr, yy + i, last.bl);
      yy += h;
      if (rr - step > 0.45) this.disc(cx, cz, rr, yy, m.sl + "[type=bottom]", rr - step);
    }
    if (fin) {
      const fs = Array.isArray(fin) ? fin : [fin];
      fs.forEach((f, i) => this.set(Math.floor(cx), yy + i, Math.floor(cz), f));
      return yy - 1 + fs.length;
    }
    return yy - 1;
  }
  /* half a ball of blocks standing on the layer y */
  dome(cx, cz, r, y, b, hollow) {
    for (let k = 0; k <= r; k++) {
      const rr = Math.sqrt(Math.max(0, (r + 0.35) * (r + 0.35) - k * k));
      if (rr < 0.5) break;
      this.disc(cx, cz, rr, y + k, b, hollow ? rr - 1.3 : -1);
    }
    return this;
  }
  /* a door in a wall: lower and upper half, facing outward */
  door(x, y, z, face, wood = "spruce") {
    this.set(x, y, z, `${wood}_door[facing=${face},half=lower]`);
    return this.set(x, y + 1, z, `${wood}_door[facing=${face},half=upper]`);
  }
  /* a log post on every corner of a box (timber frame) with a beam line along the top */
  frame(x0, y0, z0, x1, y1, z1, log) {
    for (const [x, z] of [
      [x0, z0],
      [x1, z0],
      [x0, z1],
      [x1, z1],
    ])
      this.box(x, y0, z, x, y1, z, log);
    return this;
  }
  /* something that is not made of blocks and hangs on the model: a cloth banner (voxel-kit banner, flagPole). The marks go out with the model
     and rendering/structures.js hangs the real thing on them */
  mark(o) {
    this.marks.push(o);
    return this;
  }
  model() {
    return { w: this.w, h: this.h, l: this.l, defs: this.defs, vox: this.vox, unk: [...this.unk], marks: this.marks };
  }
}
