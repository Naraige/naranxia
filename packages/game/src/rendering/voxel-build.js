import { defOf } from "./voxel-blocks.js";

/* ---- a tiny builder for voxel models, written in Minecraft terms: place blocks by name, fill boxes, raise gabled roofs from stairs.
   Coordinates are blocks: x east, y up, z south. A block name is a Minecraft id ("stone_bricks", "spruce_stairs[facing=north,half=bottom]"); the result is {w,h,l,defs,vox} for voxelGeo. ---- */
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
  set(x, y, z, b) {
    if (this.inside(x, y, z)) this.vox[(y * this.l + z) * this.w + x] = typeof b === "number" ? b : this.id(b);
    return this;
  }
  get(x, y, z) {
    return this.inside(x, y, z) ? this.vox[(y * this.l + z) * this.w + x] : 0;
  }
  /* inclusive box */
  box(x0, y0, z0, x1, y1, z1, b) {
    const i = this.id(b);
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
