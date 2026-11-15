import { bxc, geometryState, newG, toGeo } from "./geometry.js";
import { matV } from "./materials.js";
import { scene, SHADOWS } from "./scene.js";
import { THREE } from "./three.js";
import { RUINS } from "../world/terrain-state.js";

/* meshes for the ancient ruins (placeholder look: broken pillars on a worn slab; looted ruins lose their standing pillar and chest) */
const M = new Map();
const ST = ["#8d8a82", "#7c7a73", "#9a968c"],
  MOSS = "#5f7a45",
  GOLD = "#e0b43a",
  WOOD = "#6e4a28";

function mk(r) {
  const G = newG(),
    x = r.tx + 0.5,
    z = r.ty + 0.5,
    y = r.h,
    o = geometryState.BMAT,
    B = (m, cx, y0, cz, w, h, d, c) => {
      geometryState.BMAT = m;
      bxc(G, cx, y0, cz, w, h, d, c);
    };
  try {
    /* worn slab of big flagstones, a few missing */
    B(1, x, y, z, 2.6, 0.12, 2.6, ST[1]);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        if ((i * 7 + j * 3) % 5)
          B(1, x - 0.975 + i * 0.65, y + 0.12, z - 0.975 + j * 0.65, 0.6, 0.02, 0.6, ST[(i + j) % 3]);
    /* tower stump (look chosen by the King: 1C), now in courses of brick with a broken crown, ivy and rubble */
    for (let k = 0; k < 2; k++) B(1, x, y + 0.14 + k * 0.25, z, 1.9, 0.25, 1.9, ST[k % 3]);
    for (let k = 0; k < 2; k++) B(1, x, y + 0.64 + k * 0.25, z, 1.6, 0.25, 1.6, ST[(k + 2) % 3]);
    B(3, x + 0.1, y + 0.9, z + 0.1, 1.3, 0.25, 1.3, "#2a2824");
    B(1, x - 0.45, y + 1.14, z - 0.45, 0.7, 0.25, 0.7, ST[0]);
    B(1, x - 0.5, y + 1.39, z - 0.5, 0.5, 0.25, 0.5, ST[2]);
    B(1, x - 0.58, y + 1.64, z - 0.58, 0.3, 0.2, 0.3, ST[1]);
    B(1, x + 0.5, y + 1.14, z + 0.5, 0.5, 0.3, 0.5, ST[1]);
    B(1, x + 0.56, y + 1.14, z - 0.5, 0.34, 0.2, 0.44, ST[2]);
    B(1, x - 0.5, y + 1.14, z + 0.56, 0.44, 0.16, 0.3, ST[0]);
    for (const [a, b, h] of [
      [-0.96, -0.3, 0.5],
      [-0.96, 0.1, 0.3],
      [0.3, -0.96, 0.44],
      [-0.2, 0.96, 0.26],
    ])
      B(
        3,
        x + a * (Math.abs(a) > 0.9 ? 0.995 : 1),
        y + 0.5,
        z + b * (Math.abs(b) > 0.9 ? 0.995 : 1),
        Math.abs(a) > 0.9 ? 0.03 : 0.3,
        h,
        Math.abs(b) > 0.9 ? 0.03 : 0.3,
        MOSS,
      );
    B(3, x - 0.3, y + 1.14, z + 0.2, 0.5, 0.03, 0.4, MOSS);
    B(3, x - 1, y + 0.14, z + 0.9, 0.4, 0.16, 0.6, MOSS);
    B(1, x + 1.1, y + 0.14, z - 0.9, 0.5, 0.3, 0.5, ST[2]);
    B(1, x + 1.05, y + 0.14, z - 0.4, 0.3, 0.18, 0.34, ST[0]);
    B(1, x - 1.1, y + 0.14, z - 1.0, 0.34, 0.2, 0.3, ST[1]);
    B(1, x + 0.8, y + 0.14, z + 1.1, 0.4, 0.14, 0.26, ST[2]);
    /* a fallen column */
    for (let k = 0; k < 3; k++) B(1, x - 1.12, y + 0.14, z - 0.5 + k * 0.34, 0.26, 0.26, 0.3, ST[k % 3]);
    if (!r.done) {
      B(2, x, y + 0.14, z + 1.2, 0.7, 0.36, 0.5, WOOD);
      B(2, x, y + 0.5, z + 1.2, 0.74, 0.1, 0.54, "#7e5630");
      for (const s of [-1, 1]) B(4, x + s * 0.3, y + 0.14, z + 1.2, 0.06, 0.48, 0.56, "#4a4a55");
      B(4, x, y + 0.5, z + 1.2, 0.76, 0.04, 0.56, GOLD);
      B(4, x, y + 0.36, z + 1.46, 0.12, 0.16, 0.03, GOLD);
      B(5, x, y + 1.3, z + 1.2, 0.22, 0.22, 0.22, GOLD);
    }
  } finally {
    geometryState.BMAT = o;
  }
  const m = new THREE.Mesh(toGeo(G), matV);
  m.castShadow = SHADOWS;
  m.receiveShadow = SHADOWS;
  scene.add(m);
  return m;
}

let stamp = 0;
export function syncRuins() {
  if (!RUINS.size && !M.size) return;
  /* no per-frame allocation: every live ruin is stamped, the meshes left unstamped belong to ruins that are gone */
  stamp++;
  for (const r of RUINS.values()) {
    let e = M.get(r);
    if (e && e.done !== r.done) {
      scene.remove(e.m);
      e.m.geometry.dispose();
      M.delete(r);
      e = null;
    }
    if (!e) {
      e = { m: mk(r), done: r.done, s: 0 };
      M.set(r, e);
    }
    e.s = stamp;
  }
  for (const [r, e] of M)
    if (e.s !== stamp) {
      scene.remove(e.m);
      e.m.geometry.dispose();
      M.delete(r);
    }
}
