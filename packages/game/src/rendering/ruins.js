import { bxc, geometryState, newG, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { scene, SHADOWS } from './scene.js';
import { THREE } from './three.js';
import { RUINS } from '../world/terrain-state.js';

/* meshes for the ancient ruins (placeholder look: broken pillars on a worn slab; looted ruins lose their standing pillar and chest) */
const M = new Map();
const ST = ['#8d8a82', '#7c7a73', '#9a968c'], MOSS = '#5f7a45', GOLD = '#e0b43a', WOOD = '#6e4a28';

function mk(r) {
  const G = newG(), x = r.tx + .5, z = r.ty + .5, y = r.h, o = geometryState.BMAT, B = (m, cx, y0, cz, w, h, d, c) => { geometryState.BMAT = m; bxc(G, cx, y0, cz, w, h, d, c) };
  try {
    /* worn slab of big flagstones, a few missing */
    B(1, x, y, z, 2.6, .12, 2.6, ST[1]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i * 7 + j * 3) % 5) B(1, x - .975 + i * .65, y + .12, z - .975 + j * .65, .6, .02, .6, ST[(i + j) % 3]);
    /* tower stump (look chosen by the King: 1C), now in courses of brick with a broken crown, ivy and rubble */
    for (let k = 0; k < 2; k++) B(1, x, y + .14 + k * .25, z, 1.9, .25, 1.9, ST[k % 3]);
    for (let k = 0; k < 2; k++) B(1, x, y + .64 + k * .25, z, 1.6, .25, 1.6, ST[(k + 2) % 3]);
    B(3, x + .1, y + .9, z + .1, 1.3, .25, 1.3, '#2a2824');
    B(1, x - .45, y + 1.14, z - .45, .7, .25, .7, ST[0]); B(1, x - .5, y + 1.39, z - .5, .5, .25, .5, ST[2]); B(1, x - .58, y + 1.64, z - .58, .3, .2, .3, ST[1]);
    B(1, x + .5, y + 1.14, z + .5, .5, .3, .5, ST[1]); B(1, x + .56, y + 1.14, z - .5, .34, .2, .44, ST[2]); B(1, x - .5, y + 1.14, z + .56, .44, .16, .3, ST[0]);
    for (const [a, b, h] of [[-.96, -.3, .5], [-.96, .1, .3], [.3, -.96, .44], [-.2, .96, .26]]) B(3, x + a * (Math.abs(a) > .9 ? .995 : 1), y + .5, z + b * (Math.abs(b) > .9 ? .995 : 1), Math.abs(a) > .9 ? .03 : .3, h, Math.abs(b) > .9 ? .03 : .3, MOSS);
    B(3, x - .3, y + 1.14, z + .2, .5, .03, .4, MOSS); B(3, x - 1, y + .14, z + .9, .4, .16, .6, MOSS);
    B(1, x + 1.1, y + .14, z - .9, .5, .3, .5, ST[2]); B(1, x + 1.05, y + .14, z - .4, .3, .18, .34, ST[0]); B(1, x - 1.1, y + .14, z - 1.0, .34, .2, .3, ST[1]); B(1, x + .8, y + .14, z + 1.1, .4, .14, .26, ST[2]);
    /* a fallen column */
    for (let k = 0; k < 3; k++) B(1, x - 1.12, y + .14, z - .5 + k * .34, .26, .26, .3, ST[k % 3]);
    if (!r.done) {
      B(2, x, y + .14, z + 1.2, .7, .36, .5, WOOD); B(2, x, y + .5, z + 1.2, .74, .1, .54, '#7e5630'); for (const s of [-1, 1]) B(4, x + s * .3, y + .14, z + 1.2, .06, .48, .56, '#4a4a55');
      B(4, x, y + .5, z + 1.2, .76, .04, .56, GOLD); B(4, x, y + .36, z + 1.46, .12, .16, .03, GOLD); B(5, x, y + 1.3, z + 1.2, .22, .22, .22, GOLD);
    }
  } finally { geometryState.BMAT = o }
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
