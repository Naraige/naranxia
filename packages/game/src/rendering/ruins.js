import { bxc, newG, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { scene, SHADOWS } from './scene.js';
import { THREE } from './three.js';
import { RUINS } from '../world/terrain.js';

/* meshes for the ancient ruins (placeholder look: broken pillars on a worn slab; looted ruins lose their standing pillar and chest) */
const M = new Map();
const ST = ['#8d8a82', '#7c7a73', '#9a968c'], MOSS = '#5f7a45', GOLD = '#e0b43a', WOOD = '#6e4a28';

function mk(r) {
  const G = newG(), x = r.tx + .5, z = r.ty + .5, y = r.h, v = r.v % 3;
  bxc(G, x, y, z, 2.6, .12, 2.6, ST[1]);
  bxc(G, x - 1, y + .12, z - 1, .5, .9 + v * .25, .5, ST[0]); bxc(G, x + 1, y + .12, z - 1, .5, .45, .5, ST[2]);
  bxc(G, x - 1, y + .12, z + 1, .5, .6, .5, ST[2]); bxc(G, x + 1, y + .12, z + 1, .5, 1.15, .5, ST[0]);
  bxc(G, x + .2, y + .12, z - 1.2, .8, .22, .45, ST[1]); bxc(G, x - .6, y + .12, z + .2, .45, .18, .7, MOSS);
  if (!r.done) { bxc(G, x, y + .12, z, .7, .38, .5, WOOD); bxc(G, x, y + .5, z, .72, .08, .52, GOLD); bxc(G, x, y + 1.3, z, .22, .22, .22, GOLD) }
  const m = new THREE.Mesh(toGeo(G), matV); m.castShadow = SHADOWS; m.receiveShadow = SHADOWS; scene.add(m); return m;
}

export function syncRuins() {
  if (!RUINS.size && !M.size) return;
  const live = new Set(RUINS.values());
  for (const [r, e] of M) if (!live.has(r)) { scene.remove(e.m); e.m.geometry.dispose(); M.delete(r) }
  for (const r of RUINS.values()) {
    let e = M.get(r);
    if (e && e.done !== r.done) { scene.remove(e.m); e.m.geometry.dispose(); M.delete(r); e = null }
    if (!e) M.set(r, { m: mk(r), done: r.done });
  }
}
