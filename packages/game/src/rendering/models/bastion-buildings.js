import { newG, toGeo } from '../geometry.js';
import { bC, bM, bP, bS, bW, bL, qCone, qDoor, qPlinth, qRoof, qStone, qTimber, qWin, QBR, QBR2, QIR, QS, QSL, QW1, QW2, QW3 } from './building-parts.js';

/* ---- last-bastion buildings (2x2 tiles, front = +z): observatory, granary, alarm bell, sanctuary ---- */
const grass = G => { qPlinth(G, 1, 0, 1, 2, 2, .1); bP(G, 1, .1, 1, 1.9, .03, 1.9, '#6f8a44') };

/* stone tower topped by a blue slate dome, a brass telescope poking out of the slit */
export function observatoryGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.0, 1.0, 1.3);
  bS(G, 1, 1.43, 1, 1.16, .08, 1.16, QS[2]);
  qDoor(G, 1, 1.516, true, 1, { y: .13, w: .3, h: .5, wood: 1, lamp: 1 });
  qWin(G, 1, .95, 1.516, true, 1, { glow: 1 });
  qCone(G, 1, 1, 1.51, .62, ['#2f5d86', '#3a6b97', '#2a4f75'], .14);
  bM(G, 1.32, 1.56, .72, .1, .1, .62, QBR); bM(G, 1.32, 1.5, .98, .05, .22, .05, QIR);
  return toGeo(G);
}

/* timber store on stone stilts with a steep roof, a ramp and sacks */
export function granaryGeo() {
  const G = newG(); grass(G);
  for (const x of [.45, 1.55]) for (const z of [.4, 1.6]) bS(G, x, .1, z, .14, .34, .14, QS[1]);
  bW(G, 1, .44, 1, 1.5, .08, 1.5, QW1);
  qTimber(G, .28, .28, 1.72, 1.72, .52, 1.3, { fill: '#d9c08a' });
  qRoof(G, 1, 1, 1.52, 1.52, 1.3, ['#8a5a2a', '#7a4e24'], true, { rise: .2, run: .14, ov0: .12, ov1: .12, side: .12 });
  qDoor(G, 1, 1.736, true, 1, { y: .52, w: .34, h: .56, wood: 1 });
  for (let k = 0; k < 4; k++) bW(G, 1, .1 + k * .1, 1.95 - k * .08, .4, .06, .14, QW2);
  for (let k = 0; k < 3; k++) bW(G, .45 + k * .2, .1, 1.9, .18, .15, .15, '#d9c9a0');
  return toGeo(G);
}

/* open timber frame on a stone foot: a big brass bell under a slate roof */
export function bellGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.2, 1.2, .3);
  for (const x of [.58, 1.42]) for (const z of [.58, 1.42]) bW(G, x, .43, z, .1, 1.1, .1, QW2);
  bW(G, 1, 1.2, .58, .94, .08, .1, QW1); bW(G, 1, 1.2, 1.42, .94, .08, .1, QW1);
  bW(G, 1, 1.0, 1, .08, .08, .84, QW2);
  bM(G, 1, .66, 1, .3, .34, .3, QBR); bM(G, 1, .6, 1, .38, .06, .38, QBR2); bM(G, 1, .54, 1, .04, .1, .04, QIR);
  qRoof(G, 1, 1, 1.1, 1.1, 1.28, QSL, true, { rise: .2, run: .15, ov0: .12, ov1: .12, side: .12 });
  return toGeo(G);
}

/* pale stone chapel with a golden roof and a glowing sun over the door */
export function sanctuaryGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.4, 1.0, .1);
  bP(G, 1, .23, 1, 1.3, .8, .94, '#ece4d0');
  qRoof(G, 1, 1, 1.38, 1.04, 1.03, ['#d8b04a', '#c9a03e', '#bf9534'], true, { rise: .22, run: .15, ov0: .1, ov1: .1, side: .1 });
  qDoor(G, 1, 1.486, true, 1, { y: .23, w: .3, h: .52, wood: 1, lamp: 1 });
  bL(G, 1, .85, 1.49, .16, .16, .03, '#ffd98c');
  for (const x of [.72, 1.28]) qWin(G, x, .55, 1.486, true, 1, { glow: 1, w: .14, h: .22 });
  for (let k = 0; k < 2; k++) bS(G, 1, .13 + k * .05, 1.52 + (1 - k) * .1, .6, .05, .14, QS[2]);
  return toGeo(G);
}

/* stone beacon tower: a brazier of living flames on a stone crown */
export function beaconGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, .8, .8, 1.6);
  bS(G, 1, 1.73, 1, 1.0, .1, 1.0, QS[2]);
  for (const x of [.55, 1.45]) for (const z of [.55, 1.45]) bS(G, x, 1.83, z, .1, .2, .1, QS[1]);
  bM(G, 1, 1.83, 1, .56, .12, .56, QIR);
  bL(G, 1, 1.95, 1, .34, .3, .34, '#ff9a2a'); bL(G, 1, 2.25, 1, .2, .26, .2, '#ffd25a'); bL(G, 1.06, 2.5, .96, .1, .16, .1, '#fff0b0');
  qDoor(G, 1, 1.416, true, 1, { y: .13, w: .26, h: .46, wood: 1, lamp: 1 });
  qWin(G, 1, 1.0, 1.416, true, 1, { glow: 1, w: .1, h: .26 });
  return toGeo(G);
}

/* fenced orchard: four apple trees and a crate of fruit */
export function orchardGeo() {
  const G = newG(); grass(G);
  for (let k = 0; k <= 5; k++) { const t = .2 + k * .32; for (const z of [.2, 1.8]) bW(G, t, .1, z, .05, .22, .05, QW1); if (k > 0 && k < 5) for (const x of [.2, 1.8]) bW(G, x, .1, t, .05, .22, .05, QW1) }
  bW(G, 1, .24, .2, 1.65, .03, .03, QW3); bW(G, .2, .24, 1, .03, .03, 1.65, QW3); bW(G, 1.8, .24, 1, .03, .03, 1.65, QW3);
  for (const [x, z] of [[.6, .6], [1.4, .6], [.6, 1.3], [1.4, 1.3]]) {
    bW(G, x, .1, z, .12, .42, .12, '#6b4a2c'); bC(G, x, .5, z, .56, .34, .56, '#4f9a3c'); bC(G, x, .8, z, .36, .24, .36, '#5fa845');
    for (const [dx, dz] of [[.22, .1], [-.2, .2], [.05, -.24]]) bM(G, x + dx, .58, z + dz, .07, .07, .07, '#d8402a');
  }
  bW(G, 1, .1, 1.62, .34, .16, .22, QW2); bM(G, .94, .26, 1.62, .08, .08, .08, '#d8402a'); bM(G, 1.06, .26, 1.6, .08, .08, .08, '#e0b030');
  return toGeo(G);
}
