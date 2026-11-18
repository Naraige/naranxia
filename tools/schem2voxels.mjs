/* node tools/schem2voxels.mjs plan.schem out.json [name] [--crop=x0,z0,x1,z1]: Minecraft plan -> compact voxel model for the game.
   Ground (grass, dirt, paths) and plants are stripped, the model is cropped to its blocks, one block = one tile.
   out.json: {name, w,h,l, defs:[{k,c,...}], vox: base64 of Uint8Array(w*h*l), index = (y*l+z)*w+x, 0 = empty, n = defs[n-1]} */
import { writeFileSync } from "node:fs";
import { readSchem } from "./schem.mjs";
import { defOf } from "./blocks.mjs";

const crop = (process.argv.find((a) => a.startsWith("--crop=")) || "").slice(7).split(",").map(Number),
  [, , src, out, name] = process.argv.filter((a) => !a.startsWith("--crop="));
if (!src || !out) {
  console.error("usage: schem2voxels in.schem out.json [name]");
  process.exit(1);
}
const s = readSchem(src),
  unknown = new Set(),
  pd = s.pal.map((p) => (p ? defOf(p, unknown) : null));
let x0 = 1e9,
  x1 = -1,
  y0 = 1e9,
  y1 = -1,
  z0 = 1e9,
  z1 = -1;
const inCrop = (x, z) => crop.length < 4 || (x >= crop[0] && z >= crop[1] && x <= crop[2] && z <= crop[3]),
  at = (x, y, z) => (inCrop(x, z) ? pd[s.data[(y * s.l + z) * s.w + x]] : null);
for (let y = 0; y < s.h; y++)
  for (let z = 0; z < s.l; z++)
    for (let x = 0; x < s.w; x++) {
      const d = at(x, y, z);
      if (!d || d.k === "ground") continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      z0 = Math.min(z0, z);
      z1 = Math.max(z1, z);
    }
const w = x1 - x0 + 1,
  h = y1 - y0 + 1,
  l = z1 - z0 + 1,
  defs = [],
  key = new Map(),
  vox = new Uint8Array(w * h * l);
for (let y = y0; y <= y1; y++)
  for (let z = z0; z <= z1; z++)
    for (let x = x0; x <= x1; x++) {
      const d = at(x, y, z);
      if (!d || d.k === "ground") continue;
      const k = JSON.stringify(d);
      if (!key.has(k)) {
        defs.push(d);
        key.set(k, defs.length);
      }
      vox[((y - y0) * l + (z - z0)) * w + (x - x0)] = key.get(k);
    }
if (defs.length > 255) throw new Error("too many block states");
const solid = vox.reduce((a, v) => a + (v ? 1 : 0), 0);
writeFileSync(
  out,
  JSON.stringify({
    name:
      name ||
      src
        .split("/")
        .pop()
        .replace(/\.schem$/, ""),
    w,
    h,
    l,
    defs,
    vox: Buffer.from(vox).toString("base64"),
  }),
);
console.log(
  out,
  w + "x" + h + "x" + l,
  "blocks",
  solid,
  "states",
  defs.length,
  unknown.size ? "UNKNOWN: " + [...unknown].join(" ") : "",
);
