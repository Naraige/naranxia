import { newG, toGeo } from '../geometry.js';
import { mvMarker, mvRoof } from './model-variants.js';
import { bC, bM, bP, bS, bW, bL, qBan, qChim, qCone, qDoor, qPlinth, qRoof, qStone, qTimber, qWin, QBR, QBR2, QIR, QS, QSL, QW1, QW2, QW3 } from './building-parts.js';

/* ---- last-bastion buildings (2x2 tiles, front = +z): observatory, granary, alarm bell, sanctuary ---- */
/* Studio boards (model-variants.js): roof colour by function + a tall landmark, only when window.__MV names the building */
const mk = (G, k) => mvMarker(G, k, { bP, bM, bL, bC, bS, bW });
const grass = G => { qPlinth(G, 1, 0, 1, 2, 2, .1); bP(G, 1, .1, 1, 1.9, .03, 1.9, '#6f8a44') };

/* stone tower topped by a blue slate dome, a brass telescope poking out of the slit */
export function observatoryGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.0, 1.0, 1.3);
  bS(G, 1, 1.43, 1, 1.16, .08, 1.16, QS[2]);
  qDoor(G, 1, 1.516, true, 1, { y: .13, w: .3, h: .5, wood: 1, lamp: 1 });
  qWin(G, 1, .95, 1.516, true, 1, { glow: 1 });
  qCone(G, 1, 1, 1.51, .62, mvRoof('observatory', ['#2f5d86', '#3a6b97', '#2a4f75']), .14);
  bM(G, 1.32, 1.56, .72, .1, .1, .62, QBR); bM(G, 1.32, 1.5, .98, .05, .22, .05, QIR);
  mk(G, 'observatory');
  return toGeo(G);
}

/* timber store on stone stilts with a steep roof, a ramp and sacks */
export function granaryGeo() {
  const G = newG(); grass(G);
  for (const x of [.45, 1.55]) for (const z of [.4, 1.6]) bS(G, x, .1, z, .14, .34, .14, QS[1]);
  bW(G, 1, .44, 1, 1.5, .08, 1.5, QW1);
  qTimber(G, .28, .28, 1.72, 1.72, .52, 1.3, { fill: '#d9c08a' });
  qRoof(G, 1, 1, 1.52, 1.52, 1.3, mvRoof('granary', ['#8a5a2a', '#7a4e24']), true, { rise: .2, run: .14, ov0: .12, ov1: .12, side: .12 });
  qDoor(G, 1, 1.736, true, 1, { y: .52, w: .34, h: .56, wood: 1 });
  for (let k = 0; k < 4; k++) bW(G, 1, .1 + k * .1, 1.95 - k * .08, .4, .06, .14, QW2);
  for (let k = 0; k < 3; k++) bW(G, .45 + k * .2, .1, 1.9, .18, .15, .15, '#d9c9a0');
  mk(G, 'granary');
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
  qRoof(G, 1, 1, 1.1, 1.1, 1.28, mvRoof('bell', QSL), true, { rise: .2, run: .15, ov0: .12, ov1: .12, side: .12 });
  mk(G, 'bell');
  return toGeo(G);
}

/* pale stone chapel with a golden roof and a glowing sun over the door */
export function sanctuaryGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.4, 1.0, .1);
  bP(G, 1, .23, 1, 1.3, .8, .94, '#ece4d0');
  qRoof(G, 1, 1, 1.38, 1.04, 1.03, mvRoof('sanctuary', ['#d8b04a', '#c9a03e', '#bf9534']), true, { rise: .22, run: .15, ov0: .1, ov1: .1, side: .1 });
  qDoor(G, 1, 1.486, true, 1, { y: .23, w: .3, h: .52, wood: 1, lamp: 1 });
  bL(G, 1, .85, 1.49, .16, .16, .03, '#ffd98c');
  for (const x of [.72, 1.28]) qWin(G, x, .55, 1.486, true, 1, { glow: 1, w: .14, h: .22 });
  for (let k = 0; k < 2; k++) bS(G, 1, .13 + k * .05, 1.52 + (1 - k) * .1, .6, .05, .14, QS[2]);
  mk(G, 'sanctuary');
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
  mk(G, 'beacon');
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
  mk(G, 'orchard');
  return toGeo(G);
}

/* royal forge: a stone smithy with a glowing hearth window, a chimney and an anvil */
export function forgeGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, 1, 1.3, .9, .85);
  const rt = qRoof(G, 1, 1, 1.38, 1.0, .98, mvRoof('forge', QSL), true, { rise: .2, run: .15, ov0: .1, ov1: .1, side: .1 });
  qChim(G, .55, .75, .8, rt - .5);
  qDoor(G, .75, 1.456, true, 1, { y: .13, w: .3, h: .52, wood: 1, lamp: 1 });
  qWin(G, 1.3, .55, 1.456, true, 1, { glow: 1, w: .24, h: .22 });
  bM(G, 1.6, .13, 1.62, .34, .14, .18, QIR); bM(G, 1.6, .27, 1.62, .46, .07, .22, QIR); bM(G, 1.78, .27, 1.62, .16, .05, .1, QIR);
  bW(G, 1.15, .13, 1.7, .3, .16, .2, QW2);
  mk(G, 'forge');
  return toGeo(G);
}

/* embassy: a pale hall with a pillared porch and two banners, for the rebel camps' envoys */
export function embassyGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, .85, 1.6, 1.1, .1);
  bP(G, 1, .23, .85, 1.5, .8, 1.0, '#e8dcc0');
  qRoof(G, 1, .85, 1.6, 1.1, 1.03, mvRoof('embassy', ['#8a4a3a', '#7a3f32', '#6e382d']), true, { rise: .22, run: .15, ov0: .1, ov1: .1, side: .1 });
  for (const x of [.45, .8, 1.2, 1.55]) bS(G, x, .23, 1.55, .12, .8, .12, QS[2]);
  bS(G, 1, 1.03, 1.55, 1.3, .08, .3, QS[2]);
  qDoor(G, 1, 1.356, true, 1, { y: .23, w: .3, h: .54, wood: 1, lamp: 1 });
  qBan(G, .55, .45, 1.356, true, 1, .2, .45); qBan(G, 1.45, .45, 1.356, true, 1, .2, .45);
  mk(G, 'embassy');
  return toGeo(G);
}

/* war room: a timber hall with a red roof, a map table and a pole with a war flag */
export function warRoomGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, .9, 1.5, 1.1, .12);
  qTimber(G, .25, .35, 1.75, 1.45, .25, 1.0, { fill: '#d9c9a0' });
  qRoof(G, 1, .9, 1.58, 1.18, 1.0, mvRoof('warroom', ['#9a3a32', '#8a3029', '#7a2a24']), true, { rise: .22, run: .15, ov0: .1, ov1: .1, side: .1 });
  qDoor(G, .8, 1.456, true, 1, { y: .25, w: .3, h: .5, wood: 1, lamp: 1 });
  bW(G, 1.5, .1, 1.72, .5, .22, .34, QW2); bP(G, 1.5, .32, 1.72, .44, .02, .28, '#e8d8a8'); bP(G, 1.4, .34, 1.7, .05, .05, .05, '#b83a3a'); bP(G, 1.6, .34, 1.76, .05, .05, .05, '#2f6ea8');
  bW(G, .3, .1, 1.75, .05, .9, .05, QW2); bP(G, .42, .76, 1.75, .22, .14, .02, '#b83a3a');
  mk(G, 'warroom');
  return toGeo(G);
}

/* sappers' workshop: a shed of timber and slate with powder barrels, a cog and a pickaxe */
export function sappersGeo() {
  const G = newG(); grass(G);
  qStone(G, 1, .13, .9, 1.4, 1.0, .1);
  qTimber(G, .3, .4, 1.7, 1.4, .23, .9, { fill: '#cdbb90' });
  qRoof(G, 1, .9, 1.5, 1.1, .9, mvRoof('sappers', QSL), true, { rise: .2, run: .15, ov0: .1, ov1: .1, side: .1 });
  qDoor(G, 1, 1.416, true, 1, { y: .23, w: .4, h: .5, wood: 1 });
  for (const [x, z] of [[.4, 1.65], [.62, 1.7], [.5, 1.9]]) { bW(G, x, .1, z, .2, .28, .2, '#7a5a34'); bM(G, x, .2, z, .22, .03, .22, QIR) }
  bW(G, 1.45, .1, 1.7, .26, .2, .26, QW1); bW(G, 1.72, .1, 1.62, .22, .16, .22, QW2);
  bW(G, 1.65, .1, 1.95, .04, .5, .04, QW2); bM(G, 1.65, .55, 1.95, .24, .05, .05, QIR);
  bM(G, 1.72, .42, .55, .3, .3, .05, QIR);
  mk(G, 'sappers');
  return toGeo(G);
}
