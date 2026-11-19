import { hex } from "../core/math.js";
import { newG, quad, toGeo } from "./geometry.js";

/* ---- voxel models imported from Minecraft plans (tools/schem2voxels.mjs): one block = one tile, drawn as merged geometry with hidden faces culled ----
   A model is {w,h,l,defs,vox}: vox[(y*l+z)*w+x] = 0 (empty) or the 1-based index of a block definition (kind, colour, orientation). Plan axes: x east, z south, y up. */
const DIRS = ["east", "south", "west", "north"];
const rot = (b, k) => {
  /* boxes are [x0,y0,z0,x1,y1,z1] in 0..1, written for east; k quarter turns clockwise seen from above (x east, z south): (x,z) -> (1-z, x) */
  let r = b;
  for (let i = 0; i < k; i++) {
    const [a, y0, c, d, y1, e] = r;
    r = [1 - e, y0, a, 1 - c, y1, d];
  }
  return r;
};
const turns = (f) => Math.max(0, DIRS.indexOf(f));
const T16 = 1 / 16;

/* the boxes that make one block, in 0..1 */
function boxesOf(d) {
  const f = d.facing,
    top = d.half === "top" || d.type === "top";
  switch (d.k) {
    case "cube":
      return [[0, 0, 0, 1, 1, 1]];
    case "slab":
      if (d.type === "double") return [[0, 0, 0, 1, 1, 1]];
      return d.h ? [[0, 0, 0, 1, d.h, 1]] : top ? [[0, 0.5, 0, 1, 1, 1]] : [[0, 0, 0, 1, 0.5, 1]];
    case "stair": {
      const y0 = top ? 0.5 : 0,
        y1 = top ? 1 : 0.5,
        u0 = top ? 0 : 0.5,
        u1 = top ? 0.5 : 1,
        sh = d.shape || "straight",
        B = [[0, y0, 0, 1, y1, 1]];
      if (sh === "straight") B.push([0.5, u0, 0, 1, u1, 1]);
      else if (sh === "outer_left") B.push([0.5, u0, 0, 1, u1, 0.5]);
      else if (sh === "outer_right") B.push([0.5, u0, 0.5, 1, u1, 1]);
      else if (sh === "inner_left") B.push([0.5, u0, 0, 1, u1, 1], [0, u0, 0, 0.5, u1, 0.5]);
      else B.push([0.5, u0, 0, 1, u1, 1], [0, u0, 0.5, 0.5, u1, 1]);
      return B.map((b) => rot(b, turns(f)));
    }
    case "fence":
    case "wall":
    case "pane": {
      const t = d.k === "pane" ? 2 * T16 : d.k === "wall" ? 8 * T16 : 4 * T16,
        a = 0.5 - t / 2,
        b = 0.5 + t / 2,
        hh = d.k === "pane" ? 1 : d.k === "wall" ? 0.875 : 1,
        B = [[a, 0, a, b, hh, b]],
        at = d.k === "pane" ? 2 * T16 : d.k === "wall" ? 6 * T16 : 2 * T16,
        c0 = 0.5 - at / 2,
        c1 = 0.5 + at / 2,
        ah = d.k === "wall" ? 0.8125 : d.k === "fence" ? 0.9375 : 1,
        ay = d.k === "fence" ? 0.375 : 0;
      const on = (v) => v && v !== "false" && v !== "none";
      if (on(d.east)) B.push([b, ay, c0, 1, ah, c1]);
      if (on(d.west)) B.push([0, ay, c0, a, ah, c1]);
      if (on(d.north)) B.push([c0, ay, 0, c1, ah, a]);
      if (on(d.south)) B.push([c0, ay, b, c1, ah, 1]);
      return B;
    }
    case "trapdoor": {
      if (d.open === "true") return [facePlate(f, 3 * T16)];
      return [top ? [0, 13 * T16, 0, 1, 1, 1] : [0, 0, 0, 1, 3 * T16, 1]];
    }
    case "door":
      return [facePlate(f, 3 * T16)];
    case "flag":
      return [facePlate(f, 2 * T16)];
    case "sign":
      return [facePlate(f, 2 * T16, 0.25, 0.75)];
    case "post": {
      const t = d.t || 0.1875;
      return [[0.5 - t / 2, 0, 0.5 - t / 2, 0.5 + t / 2, 1, 0.5 + t / 2]];
    }
    case "lamp":
      return [[0.31, 0, 0.31, 0.69, 0.5, 0.69]];
    case "small":
      return [[0.15, 0, 0.15, 0.85, 0.7, 0.85]];
  }
  return [[0, 0, 0, 1, 1, 1]];
}
/* a thin plate against the side opposite to the facing (trapdoors, doors, wall signs) */
function facePlate(f, t, y0 = 0, y1 = 1) {
  const p = {
    north: [0, y0, 1 - t, 1, y1, 1],
    south: [0, y0, 0, 1, y1, t],
    east: [0, y0, 0, t, y1, 1],
    west: [1 - t, y0, 0, 1, y1, 1],
  };
  return p[f] || p.north;
}

const SHADE = [1, 0.9, 0.8, 0.86, 0.77, 0.55];
const col = (c) => {
  const h = hex(c);
  return [h[0] / 255, h[1] / 255, h[2] / 255];
};
const hash = (x, y, z) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function voxelGeo(M, opts = {}) {
  const { w, h, l, defs } = M,
    vox = M.vox instanceof Uint8Array ? M.vox : Uint8Array.from(atob(M.vox), (c) => c.charCodeAt(0)),
    G = newG(),
    P = defs.map((d) => ({ d, c: col(d.c), c2: d.c2 ? col(d.c2) : null, B: boxesOf(d) })),
    idx = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= l ? 0 : vox[(y * l + z) * w + x]),
    opaque = (x, y, z) => {
      const i = idx(x, y, z);
      return i > 0 && defs[i - 1].k === "cube" && !defs[i - 1].glass;
    },
    ox = opts.ox === undefined ? -w / 2 : opts.ox,
    oz = opts.oz === undefined ? -l / 2 : opts.oz,
    k = opts.k || 1;
  for (let y = 0; y < h; y++)
    for (let z = 0; z < l; z++)
      for (let x = 0; x < w; x++) {
        const i = vox[(y * l + z) * w + x];
        if (!i) continue;
        const p = P[i - 1],
          v = 0.94 + hash(x, y, z) * 0.12;
        for (const b of p.B) {
          const [a0, b0, c0, a1, b1, c1] = b,
            X0 = (ox + x + a0) * k,
            X1 = (ox + x + a1) * k,
            Y0 = (y + b0) * k,
            Y1 = (y + b1) * k,
            Z0 = (oz + z + c0) * k,
            Z1 = (oz + z + c1) * k;
          /* a face on the edge of its block is hidden when the block next to it is a full opaque cube */
          const show = [
            !(b1 >= 1 && opaque(x, y + 1, z)),
            !(a1 >= 1 && opaque(x + 1, y, z)),
            !(a0 <= 0 && opaque(x - 1, y, z)),
            !(c1 >= 1 && opaque(x, y, z + 1)),
            !(c0 <= 0 && opaque(x, y, z - 1)),
            !(b0 <= 0 && (y === 0 || opaque(x, y - 1, z))),
          ];
          const ax = p.d.ax,
            fc = (k) => {
              const end =
                (ax === "y" && k < 1) ||
                (ax === "y" && k === 5) ||
                (ax === "x" && (k === 1 || k === 2)) ||
                (ax === "z" && (k === 3 || k === 4));
              const c = end && p.c2 ? p.c2 : p.c,
                s = SHADE[k] * v * (p.d.glow ? 1.25 : 1);
              return [Math.min(1, c[0] * s), Math.min(1, c[1] * s), Math.min(1, c[2] * s)];
            };
          if (show[0]) {
            const c = fc(0);
            quad(G, [X0, Y1, Z0], [X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [0, 1, 0], c, c, c, c);
          }
          if (show[1]) {
            const c = fc(1);
            quad(G, [X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1], [X1, Y0, Z1], [1, 0, 0], c, c, c, c);
          }
          if (show[2]) {
            const c = fc(2);
            quad(G, [X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0], [X0, Y0, Z0], [-1, 0, 0], c, c, c, c);
          }
          if (show[3]) {
            const c = fc(3);
            quad(G, [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1], [X0, Y0, Z1], [0, 0, 1], c, c, c, c);
          }
          if (show[4]) {
            const c = fc(4);
            quad(G, [X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0], [X1, Y0, Z0], [0, 0, -1], c, c, c, c);
          }
          if (show[5]) {
            const c = fc(5);
            quad(G, [X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1], [0, -1, 0], c, c, c, c);
          }
        }
      }
  return toGeo(G);
}
