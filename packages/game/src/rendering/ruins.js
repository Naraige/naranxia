import { bxc, newG, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { scene, SHADOWS } from './scene.js';
import { THREE } from './three.js';
import { RUINS } from '../world/terrain.js';

/* meshes for the ancient ruins (placeholder look: broken pillars on a worn slab; looted ruins lose their standing pillar and chest) */
const M = new Map();
const ST = ['#8d8a82', '#7c7a73', '#9a968c'], MOSS = '#5f7a45', GOLD = '#e0b43a', WOOD = '#6e4a28';

function mk(r) {
  const G = newG(), x = r.tx + .5, z = r.ty + .5, y = r.h, v = 2;
  bxc(G, x, y, z, 2.6, .12, 2.6, ST[1]);
  { /* tower stump (look chosen by the King: 1C) */
    bxc(G, x, y + .12, z, 1.9, .5, 1.9, ST[0]); bxc(G, x, y + .62, z, 1.6, .5, 1.6, ST[2]); bxc(G, x - .45, y + 1.12, z - .45, .7, .5, .7, ST[0]);
    bxc(G, x + .5, y + 1.12, z + .5, .5, .3, .5, ST[1]); bxc(G, x + 1.1, y + .12, z - .9, .5, .3, .5, ST[2]); bxc(G, x - 1, y + .12, z + .9, .4, .18, .6, MOSS);
  }
  if (!r.done) { bxc(G, x, y + .12, z + (v === 2 ? 1.2 : 0), .7, .38, .5, WOOD); bxc(G, x, y + .5, z + (v === 2 ? 1.2 : 0), .72, .08, .52, GOLD); bxc(G, x, y + 1.3, z + (v === 2 ? 1.2 : 0), .22, .22, .22, GOLD) }
  const m = new THREE.Mesh(toGeo(G), matV); m.castShadow = SHADOWS; m.receiveShadow = SHADOWS; scene.add(m); return m;
}

let stamp = 0;
export function syncRuins() {
  if (!RUINS.size && !M.size) return;
  /* no per-frame allocation: every live ruin is stamped, the meshes left unstamped belong to ruins that are gone */
  stamp++;
  for (const r of RUINS.values()) {
    let e = M.get(r);
    if (e && e.done !== r.done) { scene.remove(e.m); e.m.geometry.dispose(); M.delete(r); e = null }
    if (!e) { e = { m: mk(r), done: r.done, s: 0 }; M.set(r, e) }
    e.s = stamp;
  }
  for (const [r, e] of M) if (e.s !== stamp) { scene.remove(e.m); e.m.geometry.dispose(); M.delete(r) }
}
