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
    if (Array.isArray(b)) b = b[Math.floor(cellHash(x, y, z) * b.length)];
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
  /* gabled roof over [x0..x1] x [z0..z1] starting at height y; the ridge runs along x when alongX (else along z).
     st is a stair id ("spruce_stairs"), sl its slab id; the span is walked inward row by row, the last row is a slab (odd span) or a stair pair (even span) */
  gable(x0, z0, x1, z1, y, alongX, st, sl, gableB) {
    const lo = alongX ? z0 : x0,
      hi = alongX ? z1 : x1,
      n = alongX ? [x0, x1] : [z0, z1];
    for (let k = 0; lo + k <= hi - k; k++) {
      const a = lo + k,
        b = hi - k;
      for (let t = n[0]; t <= n[1]; t++) {
        const put = (c, face) => {
          const bl = `${st}[facing=${face},half=bottom,shape=straight]`;
          if (alongX) this.set(t, y + k, c, bl);
          else this.set(c, y + k, t, bl);
        };
        if (a === b) {
          if (alongX) this.set(t, y + k, a, sl + "[type=bottom]");
          else this.set(a, y + k, t, sl + "[type=bottom]");
        } else {
          put(a, alongX ? "south" : "east");
          put(b, alongX ? "north" : "west");
          for (let c = a + 1; c < b; c++) {
            if (!gableB || (t !== n[0] + 1 && t !== n[1] - 1)) break;
            if (alongX) this.set(t, y + k, c, gableB);
            else this.set(c, y + k, t, gableB);
          }
        }
      }
    }
    return this;
  }
  /* four-sided pyramid roof from stairs, finished by a slab or block at the top */
  hip(x0, z0, x1, z1, y, st, top) {
    let a = x0,
      b = z0,
      c = x1,
      d = z1,
      k = 0;
    for (; a <= c && b <= d; k++, a++, b++, c--, d--) {
      for (let x = a; x <= c; x++) {
        this.set(x, y + k, b, `${st}[facing=south,half=bottom,shape=straight]`);
        this.set(x, y + k, d, `${st}[facing=north,half=bottom,shape=straight]`);
      }
      for (let z = b; z <= d; z++) {
        this.set(a, y + k, z, `${st}[facing=east,half=bottom,shape=straight]`);
        this.set(c, y + k, z, `${st}[facing=west,half=bottom,shape=straight]`);
      }
      this.set(a, y + k, b, `${st}[facing=south,half=bottom,shape=outer_left]`);
      this.set(c, y + k, b, `${st}[facing=south,half=bottom,shape=outer_right]`);
      this.set(a, y + k, d, `${st}[facing=north,half=bottom,shape=outer_right]`);
      this.set(c, y + k, d, `${st}[facing=north,half=bottom,shape=outer_left]`);
      if (c - a < 2 || d - b < 2) {
        for (let z = b; z <= d; z++) for (let x = a; x <= c; x++) this.set(x, y + k + 1, z, top);
        break;
      }
    }
    return this;
  }
  /* a gabled roof with a profile, the way steep medieval roofs are built: o.prof lists how many blocks each row climbs from the eave inward
     (1 = a stair, 2 = a block with a stair on it...), so [1, 1, 2, 2] flares at the eave and steepens to the ridge.
     (x0,z0)-(x1,z1) is the whole roof with its overhangs, y the eave. m and t are materials {st, sl, bl} for the body and for the trim
     (the rows at both gable ends and the ridge). fill(u, v) gives the block of the gable walls (u: offset from the middle, v: height above the eave), set `end` blocks in from each end */
  roof(o) {
    const { x0, z0, x1, z1, y, m } = o,
      t = o.t || m,
      ax = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0,
      prof = o.prof || [1],
      end = o.end === undefined ? 1 : o.end,
      lo = ax ? z0 : x0,
      hi = ax ? z1 : x1,
      n0 = ax ? x0 : z0,
      n1 = ax ? x1 : z1,
      put = (tt, c, yy, b) => (ax ? this.set(tt, yy, c, b) : this.set(c, yy, tt, b)),
      fa = ax ? "south" : "east",
      fb = ax ? "north" : "west";
    let yk = y,
      top = y;
    for (let k = 0; lo + k <= hi - k; k++) {
      const a = lo + k,
        b = hi - k,
        r = prof[Math.min(k, prof.length - 1)];
      for (let tt = n0; tt <= n1; tt++) {
        const M = tt === n0 || tt === n1 ? t : m;
        if (a === b) {
          for (let i = 0; i < r - 1; i++) put(tt, a, yk + i, t.bl);
          put(tt, a, yk + r - 1, t.sl + "[type=bottom]");
        } else {
          for (let i = 0; i < r - 1; i++) {
            put(tt, a, yk + i, M.bl);
            put(tt, b, yk + i, M.bl);
          }
          put(tt, a, yk + r - 1, `${M.st}[facing=${fa},half=bottom,shape=straight]`);
          put(tt, b, yk + r - 1, `${M.st}[facing=${fb},half=bottom,shape=straight]`);
          if (b - a === 1 && o.cap !== false) {
            put(tt, a, yk + r, t.sl + "[type=bottom]");
            put(tt, b, yk + r, t.sl + "[type=bottom]");
          }
          if (o.fill && (tt === n0 + end || tt === n1 - end))
            for (let c = a + 1; c < b; c++)
              for (let i = 0; i < r; i++) {
                const bl = o.fill(c - (lo + hi) / 2, yk + i - y, tt === n0 + end ? 0 : 1);
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
      top = yk + r - 1;
      yk += r;
    }
    return top;
  }
  /* a lean-to roof: one slope climbing from the low side. dir is the side the roof falls toward ("south": low at z1) */
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
        const M = o.t && (tt === (ax ? x0 : z0) || tt === (ax ? x1 : z1)) ? o.t : m;
        for (let i = 0; i < r - 1; i++) ax ? this.set(tt, yk + i, c, M.bl) : this.set(c, yk + i, tt, M.bl);
        const s = `${M.st}[facing=${back},half=bottom,shape=straight]`;
        ax ? this.set(tt, yk + r - 1, c, s) : this.set(c, yk + r - 1, tt, s);
      }
      yk += r;
    }
    return yk - 1;
  }
  /* a pointed roof on a square: rings of stairs climbing by the profile, closed by a column of blocks */
  spire(o) {
    const { y, m } = o,
      prof = o.prof || [1];
    let a = o.x0,
      b = o.z0,
      c = o.x1,
      d = o.z1,
      yk = y;
    for (let k = 0; a <= c && b <= d; k++, a++, b++, c--, d--) {
      const r = prof[Math.min(k, prof.length - 1)];
      if (c - a < 2 || d - b < 2) {
        this.box(a, yk, b, c, yk + r - 1, d, m.bl);
        return yk + r - 1;
      }
      for (let i = 0; i < r - 1; i++) this.walls(a, yk + i, b, c, yk + i, d, m.bl);
      const yy = yk + r - 1,
        S = (f, sh) => `${m.st}[facing=${f},half=bottom,shape=${sh}]`;
      for (let x = a; x <= c; x++) this.set(x, yy, b, S("south", "straight")).set(x, yy, d, S("north", "straight"));
      for (let z = b; z <= d; z++) this.set(a, yy, z, S("east", "straight")).set(c, yy, z, S("west", "straight"));
      this.set(a, yy, b, S("south", "outer_left")).set(c, yy, b, S("south", "outer_right"));
      this.set(a, yy, d, S("north", "outer_right")).set(c, yy, d, S("north", "outer_left"));
      yk += r;
    }
    return yk - 1;
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
  /* a cone of blocks: the radius shrinks by `step` every `rise` layers, with a brim of slabs at the foot */
  cone(cx, cz, r, y, m, rise = 2, step = 1, brim = true) {
    if (brim) this.disc(cx, cz, r + 1, y, m.sl + "[type=bottom]");
    let yy = y;
    for (let rr = r; rr > 0.45; rr -= step) {
      for (let i = 0; i < rise; i++) this.disc(cx, cz, rr, yy + i, m.bl);
      yy += rise;
      if (rr - step > 0.45) this.disc(cx, cz, rr, yy, m.sl + "[type=bottom]", rr - step);
    }
    return yy - 1;
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
  model() {
    return { w: this.w, h: this.h, l: this.l, defs: this.defs, vox: this.vox, unk: [...this.unk] };
  }
}
