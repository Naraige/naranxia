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
      return [d.full ? facePlate(f, 2 * T16) : facePlate(f, 2 * T16, 0.25, 0.75)];
    case "post": {
      const t = d.t || 0.1875;
      return [[0.5 - t / 2, 0, 0.5 - t / 2, 0.5 + t / 2, 1, 0.5 + t / 2]];
    }
    case "lamp":
      return d.hanging === "true"
        ? [
            [0.31, 0.3, 0.31, 0.69, 0.8, 0.69],
            [0.45, 0.8, 0.45, 0.55, 1, 0.55],
          ]
        : [[0.31, 0, 0.31, 0.69, 0.5, 0.69]];
    case "small":
      return [[0.15, 0, 0.15, 0.85, 0.7, 0.85]];
    case "tuft":
      return [[0.25, 0, 0.25, 0.75, 0.4, 0.75]];
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

const XP = [1, 0, 0],
  XN = [-1, 0, 0],
  YP = [0, 1, 0],
  YN = [0, -1, 0],
  ZP = [0, 0, 1],
  ZN = [0, 0, -1],
  AO = [1, 0.86, 0.74, 0.62];
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
    /* what casts ambient shade on its neighbours: full cubes and stairs, and the ground under the model */
    solid = (x, y, z) => {
      if (y < 0) return 1;
      const i = idx(x, y, z);
      if (!i) return 0;
      const d = defs[i - 1];
      return (d.k === "cube" && !d.glass) || d.k === "stair" ? 1 : 0;
    },
    /* the air nobody can see: empty cells that cannot be reached from outside the model (rooms, attics, tower shafts). Faces turned to it are not drawn.
       Only blocks that fill the view of their cell stop the search (cubes, stairs, slabs, doors, joined panes): a lone bar or a fence lets it through, and the room behind stays drawn */
    on = (v) => v && v !== "false" && v !== "none",
    blocks = defs.map(
      (d) =>
        d.k === "cube" ||
        d.k === "stair" ||
        d.k === "slab" ||
        d.k === "door" ||
        (d.k === "pane" && ((on(d.east) && on(d.west)) || (on(d.north) && on(d.south)))),
    ),
    seen = new Uint8Array(w * h * l),
    open = (x, y, z) => {
      if (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= l) return y >= 0;
      return seen[(y * l + z) * w + x] === 1;
    },
    ox = opts.ox === undefined ? -w / 2 : opts.ox,
    oz = opts.oz === undefined ? -l / 2 : opts.oz,
    k = opts.k || 1;
  {
    const Q = [],
      visit = (x, y, z) => {
        if (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= l) return;
        const j = (y * l + z) * w + x;
        if (seen[j] || (vox[j] && blocks[vox[j] - 1])) return;
        seen[j] = 1;
        Q.push(x, y, z);
      };
    for (let y = 0; y < h; y++)
      for (let z = 0; z < l; z++)
        for (let x = 0; x < w; x++) if (x === 0 || z === 0 || x === w - 1 || z === l - 1 || y === h - 1) visit(x, y, z);
    for (let q = 0; q < Q.length; q += 3) {
      const x = Q[q],
        y = Q[q + 1],
        z = Q[q + 2];
      visit(x + 1, y, z);
      visit(x - 1, y, z);
      visit(x, y + 1, z);
      visit(x, y - 1, z);
      visit(x, y, z + 1);
      visit(x, y, z - 1);
    }
  }
  /* a face on the edge of its block is drawn unless a full cube covers it or it looks into sealed air */
  const hid = (x, y, z) => {
      if (opaque(x, y, z)) return true;
      const i = idx(x, y, z);
      return !(i && blocks[i - 1]) && !open(x, y, z);
    },
    /* is the face of a part block covered by one box of the block next to it? ax: 0 x, 1 y, 2 z; far: the neighbour's near side is its low one;
       (u0,u1,v0,v1) is the face in the two other axes (x: y,z  y: x,z  z: x,y). Stairs in a roof hide each other's sides this way */
    cov = (x, y, z, ax, far, u0, u1, v0, v1) => {
      const i = idx(x, y, z);
      if (!i || P[i - 1].d.glass) return false;
      for (const b of P[i - 1].B) {
        if (far ? b[ax] > 0 : b[ax + 3] < 1) continue;
        const U = ax === 0 ? 1 : 0,
          V = ax === 2 ? 1 : 2;
        if (b[U] <= u0 && b[U + 3] >= u1 && b[V] <= v0 && b[V + 3] >= v1) return true;
      }
      return false;
    };
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
            !(b1 >= 1 && (hid(x, y + 1, z) || cov(x, y + 1, z, 1, true, a0, a1, c0, c1))),
            !(a1 >= 1 && (hid(x + 1, y, z) || cov(x + 1, y, z, 0, true, b0, b1, c0, c1))),
            !(a0 <= 0 && (hid(x - 1, y, z) || cov(x - 1, y, z, 0, false, b0, b1, c0, c1))),
            !(c1 >= 1 && (hid(x, y, z + 1) || cov(x, y, z + 1, 2, true, a0, a1, b0, b1))),
            !(c0 <= 0 && (hid(x, y, z - 1) || cov(x, y, z - 1, 2, false, a0, a1, b0, b1))),
            !(b0 <= 0 && (y === 0 || hid(x, y - 1, z) || cov(x, y - 1, z, 1, false, a0, a1, c0, c1))),
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
            },
            /* a face with ambient occlusion: each corner is darkened by the blocks that touch it in the layer in front of the face (n), u and v being the two axes of the face */
            face = (kf, on, V, n, S) => {
              const c = fc(kf);
              if (!on || p.d.glow) return quad(G, V[0], V[1], V[2], V[3], n, c, c, c, c);
              const a = S.map(([du, dv]) => {
                  const s1 = solid(x + n[0] + du[0], y + n[1] + du[1], z + n[2] + du[2]),
                    s2 = solid(x + n[0] + dv[0], y + n[1] + dv[1], z + n[2] + dv[2]),
                    cc = solid(x + n[0] + du[0] + dv[0], y + n[1] + du[1] + dv[1], z + n[2] + du[2] + dv[2]);
                  return AO[s1 && s2 ? 3 : s1 + s2 + cc];
                }),
                C = a.map((f) => [c[0] * f, c[1] * f, c[2] * f]);
              if (a[1] + a[3] > a[0] + a[2]) quad(G, V[1], V[2], V[3], V[0], n, C[1], C[2], C[3], C[0]);
              else quad(G, V[0], V[1], V[2], V[3], n, C[0], C[1], C[2], C[3]);
            };
          if (show[0])
            face(
              0,
              b1 >= 1,
              [
                [X0, Y1, Z0],
                [X0, Y1, Z1],
                [X1, Y1, Z1],
                [X1, Y1, Z0],
              ],
              [0, 1, 0],
              [
                [XN, ZN],
                [XN, ZP],
                [XP, ZP],
                [XP, ZN],
              ],
            );
          if (show[1])
            face(
              1,
              a1 >= 1,
              [
                [X1, Y0, Z0],
                [X1, Y1, Z0],
                [X1, Y1, Z1],
                [X1, Y0, Z1],
              ],
              [1, 0, 0],
              [
                [YN, ZN],
                [YP, ZN],
                [YP, ZP],
                [YN, ZP],
              ],
            );
          if (show[2])
            face(
              2,
              a0 <= 0,
              [
                [X0, Y0, Z1],
                [X0, Y1, Z1],
                [X0, Y1, Z0],
                [X0, Y0, Z0],
              ],
              [-1, 0, 0],
              [
                [YN, ZP],
                [YP, ZP],
                [YP, ZN],
                [YN, ZN],
              ],
            );
          if (show[3])
            face(
              3,
              c1 >= 1,
              [
                [X1, Y0, Z1],
                [X1, Y1, Z1],
                [X0, Y1, Z1],
                [X0, Y0, Z1],
              ],
              [0, 0, 1],
              [
                [XP, YN],
                [XP, YP],
                [XN, YP],
                [XN, YN],
              ],
            );
          if (show[4])
            face(
              4,
              c0 <= 0,
              [
                [X0, Y0, Z0],
                [X0, Y1, Z0],
                [X1, Y1, Z0],
                [X1, Y0, Z0],
              ],
              [0, 0, -1],
              [
                [XN, YN],
                [XN, YP],
                [XP, YP],
                [XP, YN],
              ],
            );
          if (show[5]) {
            const c = fc(5);
            quad(G, [X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1], [0, -1, 0], c, c, c, c);
          }
        }
      }
  return toGeo(G);
}
