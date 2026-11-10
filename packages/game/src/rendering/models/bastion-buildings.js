import { newG, toGeo } from '../geometry.js';
import { bC, bM, bP, bS, bW, bL, bR, qAnvil, qBan, qBarrel, qChim, qCone, qCornice, qCrate, qDoor, qFire, qFlag, qGrind, qLadder, qLamp, qMerl, qPlinth, qPost, qPyr, qQuoin, qRing, qRoof, qRound, qSack, qSign, qSlit, qStone, qTimber, qTree, qWheel, qWin, QBR, QBR2, QHX, QIR, QLOG, QLOGT, QS, QSD, QSL, QTC, QTR, QW1, QW2, QW3 } from './building-parts.js';
import { HAYC, ROPE, structureModelsState } from './structures.js';

/* ---- last-bastion buildings (2x2 tiles, front = +z). Each one is told apart by its outline first (dome and telescope, stilts and
   hoist, belfry, steeple, fire basket, tree tops, great chimney, pillared porch, flag turret, mine mouth), then by its props ---- */
const grass = (G, c) => { qPlinth(G, 1, 0, 1, 2, 2, .1); bP(G, 1, .1, 1, 1.9, .03, 1.9, c || '#6f8a44') };
const flags = (G, x, z, w, d, n) => { for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) bS(G, x - w / 2 + (i + .5) * w / n, .13, z - d / 2 + (j + .5) * d / 2, w / n - .02, .012, d / 2 - .02, QS[(i + j) % 4]) };
const BLS = ['#2f5d86', '#3a6b97', '#2a4f75'], GLD = ['#d8b04a', '#c9a03e', '#e2bd58'], RED = ['#9a3a32', '#8a3029', '#a8443a'], CRM = ['#8a4a3a', '#7a3f32', '#96543f'];

/* round stone tower with a timber gallery under a blue slate dome; a brass telescope pokes out of the slit; a study leans on the tower */
export function observatoryGeo() {
  const G = newG(), x = 1.1, z = .86; grass(G);
  qStone(G, .5, .13, 1.4, .7, .62, .6, { ph: 1 }); qCornice(G, .5, .73, 1.4, .76, .68, .05);
  for (let k = 0; k < 4; k++) bR(G, .5, .78 + k * .09, 1.46 - k * .09, .84, .09, .62 - k * .12, QSL[k % 3]);
  qDoor(G, .5, 1.726, true, 1, { y: .13, w: .24, h: .42, wood: 1, lamp: 1 }); qWin(G, .134, .36, 1.4, false, -1, { w: .12, h: .16 });
  qRound(G, x, z, .13, 1.5, 1.12, { moss: 1 }); qRing(G, x, z, .86, 1.18, .05, QBR, bM);
  qWin(G, x, 1.08, z + .565, true, 1, { glow: 1, w: .14, h: .28 }); qWin(G, x + .565, .5, z, false, 1, { w: .12, h: .24 }); qWin(G, x, .5, z - .565, true, -1, { w: .12, h: .24 });
  qRing(G, x, z, 1.63, 1.44, .07, QW2, bW);
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832 + .39, r = .64; bW(G, x + Math.cos(a) * r, 1.7, z + Math.sin(a) * r, .05, .2, .05, QW1) }
  for (const [a, b, w, d] of [[0, .68, .86, .04], [0, -.68, .86, .04], [.68, 0, .04, .86], [-.68, 0, .04, .86]]) bW(G, x + a, 1.88, z + b, w, .035, d, QW3);
  qRound(G, x, z, 1.7, .34, 1.0, { ph: 2 }); qRing(G, x, z, 2.04, 1.08, .06, QBR, bM);
  let y = 2.1; [[1.0, .14], [.9, .14], [.74, .14], [.52, .12], [.28, .1]].forEach(([r, h], k) => { qRing(G, x, z, y, r, h, BLS[k % 3], bR); y += h });
  bM(G, x, y, z, .07, .16, .07, QBR2); bL(G, x, y + .16, z, .08, .08, .08, QHX);
  bP(G, x, 2.1, z + .3, .22, .5, .46, '#16161c');
  for (let k = 0; k < 4; k++) bM(G, x, 2.2 + k * .12, z + .36 + k * .17, k > 2 ? .1 : .13, .13, .2, k % 2 ? QBR : QBR2);
  bL(G, x, 2.69, z + .98, .08, .08, .03, QHX);
  /* yard: an armillary sphere on a pedestal, a star chart on a table, scroll crate */
  const ax = 1.62, az = 1.66; bS(G, ax, .13, az, .2, .2, .2, QSD); bM(G, ax, .33, az, .04, .08, .04, QBR);
  bM(G, ax, .41, az, .32, .028, .028, QBR); bM(G, ax, .7, az, .32, .028, .028, QBR); for (const s of [-1, 1]) bM(G, ax + s * .146, .41, az, .028, .32, .028, QBR);
  bM(G, ax, .55, az, .028, .028, .32, QBR2); bM(G, ax, .55, az, .36, .028, .028, QBR2); bL(G, ax, .52, az, .09, .09, .09, QHX);
  bW(G, 1.14, .13, 1.74, .36, .2, .24, QW2); bP(G, 1.14, .33, 1.74, .32, .015, .2, '#2a3a6a'); for (const [a, b] of [[-.08, .04], [.05, -.05], [.1, .06], [-.02, -.02]]) bL(G, 1.14 + a, .345, 1.74 + b, .025, .01, .025, '#fff0b0');
  return toGeo(G);
}

/* plank barn on staddle stones with a steep shingle roof, a hoist beam lifting a sack, a ramp, sacks and wheat sheaves */
export function granaryGeo() {
  const G = newG(), SHN = ['#8a5a2a', '#7a4e24', '#96642f'], x0 = .32, x1 = 1.68, z0 = .3, z1 = 1.46, zc = (z0 + z1) / 2; grass(G);
  for (const x of [.44, 1, 1.56]) for (const z of [.42, 1.34]) { bS(G, x, .1, z, .12, .26, .12, QS[1]); bS(G, x, .36, z, .24, .06, .24, QS[3]) }
  bW(G, 1, .42, zc, x1 - x0 + .1, .08, z1 - z0 + .1, QW2);
  for (let k = 0; k < 5; k++) bW(G, 1, .5 + k * .15, zc, x1 - x0, .15, z1 - z0, k % 2 ? '#a8814f' : '#9a6c40');
  for (const x of [x0, x1]) for (const z of [z0, z1]) bW(G, x, .5, z, .1, .75, .1, QW2);
  bW(G, 1, 1.25, zc, x1 - x0 + .08, .07, z1 - z0 + .08, QW2);
  const top = qRoof(G, 1, zc, x1 - x0, z1 - z0, 1.32, SHN, true, { rise: .2, run: .14, ov0: .14, ov1: .14, side: .14, fill: '#b08a52' });
  qDoor(G, 1, z1 + .016, true, 1, { y: .5, w: .36, h: .52, wood: 1, lamp: 1 });
  for (const x of [.56, 1.44]) for (let k = 0; k < 3; k++) bP(G, x, .74 + k * .09, z1 + .012, .2, .035, .02, '#3a2a1a');
  for (let k = 0; k < 5; k++) bW(G, 1, .1 + k * .08, 1.94 - k * .085, .44, .05, .1, k % 2 ? QW1 : QW3);
  bW(G, x1 + .02, 1.42, zc, .03, .3, .26, QW1); bW(G, x1 + .22, top - .4, zc, .52, .07, .07, QW2); bP(G, x1 + .4, top - .78, zc, .015, .38, .015, ROPE); qSack(G, x1 + .4, zc, top - .96);
  qSack(G, .34, 1.72, .13); qSack(G, .54, 1.78, .13); qSack(G, .44, 1.75, .27, '#cdbb90'); qSack(G, 1.9, 1.3, .13);
  for (const [x, z] of [[1.5, 1.76], [1.68, 1.82]]) { bC(G, x, .13, z, .12, .3, .12, HAYC); bC(G, x, .43, z, .2, .1, .2, '#e8c84a'); bC(G, x, .25, z, .14, .03, .14, '#8a6a2a') }
  qBarrel(G, .22, .5, .13);
  return toGeo(G);
}

/* alarm belfry: a stone base, an open timber frame with a great bronze bell, a slate spire with the kingdom's pennant and a pull rope */
export function bellGeo() {
  const G = newG(), c = 1; grass(G);
  bS(G, c, .1, c, 1.3, .1, 1.3, QSD); qStone(G, c, .2, c, 1.0, 1.0, .74, { moss: 1 }); qQuoin(G, .5, .5, 1.5, 1.5, .2, .74); qCornice(G, c, .94, c, 1.12, 1.12, .07);
  qDoor(G, c, 1.516, true, 1, { y: .2, w: .26, h: .44, wood: 1, lamp: 1 }); qSlit(G, 1.516, .42, c, false); qSlit(G, .484, .42, c, false);
  for (let k = 0; k < 2; k++) bS(G, c, .1 + k * .05, 1.74 - k * .08, .5, .05, .12, QS[2]);
  for (const x of [.58, 1.42]) for (const z of [.58, 1.42]) { bW(G, x, 1.01, z, .1, .84, .1, QW2); bW(G, x, 1.01, z, .14, .06, .14, QW1) }
  for (const [a, b, w, d] of [[0, .42, .76, .04], [0, -.42, .76, .04], [.42, 0, .04, .76], [-.42, 0, .04, .76]]) { bW(G, c + a, 1.22, c + b, w, .04, d, QW3); bW(G, c + a, 1.79, c + b, w + .18, .08, d + .06, QW1) }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 2; k++) bW(G, c + sx * (.34 - k * .09), 1.6 + k * .09, c + sz * .42, .09, .09, .05, QW2);
  bW(G, c, 1.66, c, .96, .1, .1, QW2); bM(G, c, 1.58, c, .12, .08, .12, QBR);
  bM(G, c, 1.34, c, .3, .24, .3, '#b8862e'); bM(G, c, 1.24, c, .4, .1, .4, QBR); bM(G, c, 1.2, c, .47, .045, .47, QBR2); bP(G, c, 1.1, c, .05, .12, .05, QIR);
  const t = qPyr(G, c, c, 1.87, 1.26, 1.26, QSL, .15, .1); bM(G, c, t, c, .06, .12, .06, QBR2); qFlag(G, c, t + .06, c, .42);
  bW(G, 1.58, 1.7, c, .26, .05, .05, QW2); bP(G, 1.68, .62, c, .018, 1.08, .018, ROPE); bW(G, 1.68, .56, c, .05, .06, .05, QW1);
  qCrate(G, .3, 1.66, .13, .22); bP(G, .3, .35, 1.66, .16, .02, .16, '#c8282a'); qPost(G, 1.7, .13, 1.7, .3, false);
  return toGeo(G);
}

/* chapel of pale stone: the nave runs front to back under a golden roof, buttresses, a bell-cote on the front gable, a glowing sun window, an apse */
export function sanctuaryGeo() {
  const G = newG(), PL = ['#ece4d0', '#e2d9c2', '#f2ecdc', '#dcd2ba'], x0 = .52, x1 = 1.48, z0 = .46, z1 = 1.5, zc = (z0 + z1) / 2; grass(G);
  bS(G, 1, .1, zc, x1 - x0 + .16, .09, z1 - z0 + .16, QSD);
  for (let k = 0; k < 5; k++) bS(G, 1, .19 + k * .18, zc, x1 - x0, .18, z1 - z0, PL[k % 4]);
  for (const sx of [-1, 1]) for (const z of [.62, 1.0, 1.38]) { const x = sx > 0 ? x1 + .06 : x0 - .06; bS(G, x, .13, z, .14, .56, .14, PL[3]); bS(G, x - sx * .02, .69, z, .1, .2, .12, PL[1]); bS(G, x - sx * .04, .89, z, .06, .1, .1, PL[2]) }
  bS(G, 1, 1.09, zc, x1 - x0 + .06, .06, z1 - z0 + .06, QTR);
  const top = qRoof(G, 1, zc, z1 - z0, x1 - x0, 1.15, GLD, false, { rise: .22, run: .14, ov0: .06, ov1: .1, side: .1, stone: 1, fill: PL[2], ridge: QBR2 });
  qRound(G, 1, z0 - .06, .13, .82, .74, { ph: 1 }); qCone(G, 1, z0 - .06, .95, .82, GLD, .2);
  for (const sx of [-1, 1]) for (const z of [.81, 1.19]) qWin(G, sx > 0 ? x1 + .016 : x0 - .016, .44, z, false, sx, { glow: 1, w: .1, h: .34 });
  qDoor(G, 1, z1 + .016, true, 1, { y: .19, w: .28, h: .46 });
  bM(G, 1, .93, z1 + .03, .3, .3, .03, QBR); bL(G, 1, .97, z1 + .05, .2, .2, .03, '#ffd98c'); bM(G, 1, 1.05, z1 + .06, .03, .04, .02, QBR2);
  for (const [a, b] of [[-.2, .15], [.2, .15], [0, -.07], [0, .37]]) bL(G, 1 + a, .93 + b, z1 + .04, .05, .05, .03, '#ffd98c');
  bS(G, 1, top - .14, z1 - .1, .34, .42, .2, PL[0]); bP(G, 1, top + .04, z1 - .1, .16, .16, .22, '#1e1c22'); bM(G, 1, top + .06, z1 - .1, .1, .1, .1, QBR);
  const t = qPyr(G, 1, z1 - .1, top + .28, .44, .3, GLD, .1, .08); bM(G, 1, t, z1 - .1, .04, .12, .04, QBR2); bL(G, 1, t + .12, z1 - .1, .12, .12, .04, '#ffd98c');
  for (let k = 0; k < 2; k++) bS(G, 1, .1 + k * .05, 1.7 - k * .08, .56, .05, .14, PL[1]);
  qPost(G, .5, .13, 1.78, .26, false); qPost(G, 1.5, .13, 1.78, .26, false);
  for (const [x, z, h] of [[.2, .5, .22], [.22, .9, .16], [1.8, .6, .2]]) { bS(G, x, .13, z, .14, h, .06, QS[1]); bS(G, x, .13 + h, z, .09, .05, .06, QS[1]) }
  for (const [x, c] of [[.2, '#c8282a'], [.34, '#f0d020'], [1.66, '#e05a8a'], [1.8, '#f4f0e8']]) { bP(G, x, .13, 1.34, .1, .05, .1, '#4a8e32'); bP(G, x, .18, 1.34, .05, .05, .05, c) }
  return toGeo(G);
}

/* signal beacon: a tapering stone tower, a corbelled crown with an iron fire basket, a ladder, the kingdom's banner and a covered woodpile */
export function beaconGeo() {
  const G = newG(), c = 1; grass(G);
  bS(G, c, .1, c, 1.16, .1, 1.16, QSD); qStone(G, c, .2, c, .98, .98, .5, { moss: 1 }); bS(G, c, .7, c, 1.04, .05, 1.04, QTR);
  qStone(G, c, .75, c, .78, .78, 1.14, { ph: 1 }); qQuoin(G, c - .39, c - .39, c + .39, c + .39, .75, 1.14);
  for (const [a, b] of [[-.26, .43], [.26, .43], [-.26, -.43], [.26, -.43], [.43, -.26], [.43, .26], [-.43, -.26], [-.43, .26]]) { bS(G, c + a, 1.77, c + b, .1, .12, .1, QSD); bS(G, c + a * 1.1, 1.69, c + b * 1.1, .07, .08, .07, QSD) }
  bS(G, c, 1.89, c, 1.12, .1, 1.12, QS[2]); qMerl(G, c - .56, c - .56, c + .56, c + .56, 1.99, .16, .485);
  for (const [a, b] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) bP(G, c + a, 1.99, c + b, .05, .2, .05, QIR);
  bP(G, c, 2.19, c, .56, .05, .56, QIR); for (const [a, b, w, d] of [[0, .27, .58, .04], [0, -.27, .58, .04], [.27, 0, .04, .58], [-.27, 0, .04, .58]]) bP(G, c + a, 2.24, c + b, w, .14, d, QIR);
  bW(G, c, 2.24, c, .46, .08, .12, QLOG); bW(G, c, 2.3, c, .12, .08, .46, '#5d3f25'); qFire(G, c, 2.36, c, 1.15);
  qDoor(G, c, 1.506, true, 1, { y: .2, w: .26, h: .42, wood: 1, lamp: 1 }); qSlit(G, c, 1.0, 1.396, true); qSlit(G, 1.396, 1.3, c, false); qSlit(G, .604, 1.3, c, false);
  qBan(G, c, 1.78, 1.39, true, 1, .2, .36);
  qLadder(G, .56, c, .7, 1.3, false);
  for (const z of [.5, .96]) bW(G, 1.74, .13, z, .06, .5, .06, QW2); for (let k = 0; k < 3; k++) bR(G, 1.76 - k * .07, .63 + k * .06, .73, .12, .06, .62, QSL[k % 3]);
  for (let k = 0; k < 3; k++) { bW(G, 1.72, .13 + k * .11, .6 + (k % 2) * .05, .2, .11, .11, QLOG); bW(G, 1.72, .13 + k * .11, .78 + (k % 2) * .05, .2, .11, .11, '#5d3f25'); bW(G, 1.824, .14 + k * .11, .69 + (k % 2) * .05, .012, .09, .26, QLOGT) }
  return toGeo(G);
}

/* fenced orchard: four apple trees heavy with fruit, a picking ladder, baskets, a straw beehive and a wheelbarrow */
export function orchardGeo() {
  const G = newG(); grass(G, '#62803c'); bP(G, 1, .13, 1, 1.5, .012, .2, '#7a6a48'); bP(G, 1, .13, 1, .2, .012, 1.5, '#7a6a48');
  for (let k = 0; k <= 6; k++) { const t = .1 + k * .3; for (const z of [.1, 1.9]) if (!(z > 1 && k === 3)) { bW(G, t, .1, z, .06, .3, .06, QW1); bW(G, t, .4, z, .04, .03, .04, QW3) } if (k > 0 && k < 6) for (const x of [.1, 1.9]) { bW(G, x, .1, t, .06, .3, .06, QW1); bW(G, x, .4, t, .04, .03, .04, QW3) } }
  for (const y of [.2, .32]) { bW(G, 1, y, .1, 1.8, .035, .03, QW3); bW(G, .1, y, 1, .03, .035, 1.8, QW3); bW(G, 1.9, y, 1, .03, .035, 1.8, QW3); bW(G, .47, y, 1.9, .74, .035, .03, QW3); bW(G, 1.53, y, 1.9, .74, .035, .03, QW3) }
  const F = [[.3, .12, .2], [-.24, .26, .3], [.08, -.33, .22], [-.3, -.12, .42], [.2, .34, .44], [.34, -.1, .06]];
  qTree(G, .56, .56, .1, .5, { fruit: F, s: 1.02 }); qTree(G, 1.44, .56, .1, .58, { fruit: F, a: '#58a23e', b: '#6cb44c' }); qTree(G, .56, 1.38, .1, .46, { fruit: F, a: '#58a23e', b: '#6cb44c', s: .95 }); qTree(G, 1.44, 1.38, .1, .52, { fruit: F, s: .98 });
  qLadder(G, 1.44, 1.72, .1, .62, true);
  for (const [x, z, c] of [[.86, 1.66, '#d8402a'], [1.06, 1.74, '#d8402a'], [.98, .96, '#e0b030']]) { bW(G, x, .1, z, .17, .11, .17, '#b08a58'); bW(G, x, .19, z, .19, .025, .19, QW2); bM(G, x - .03, .21, z + .02, .07, .06, .07, c); bM(G, x + .04, .21, z - .03, .07, .05, .07, c) }
  for (let k = 0; k < 4; k++) bC(G, 1.74, .1 + k * .07, .98, .22 - k * .045, .07, .22 - k * .045, k % 2 ? '#c9a03e' : HAYC); bP(G, 1.74, .13, 1.092, .05, .04, .01, '#2a1a0a'); bW(G, 1.74, .08, .98, .28, .03, .28, QW2);
  bW(G, .3, .22, 1.0, .3, .1, .2, QW1); bW(G, .3, .3, 1.0, .32, .03, .22, QW2); qWheel(G, .3, .19, .84, .08, false); for (const s of [-1, 1]) bW(G, .3 + s * .13, .3, 1.16, .03, .03, .2, QW3);
  bM(G, .28, .32, .98, .07, .06, .07, '#d8402a'); bM(G, .34, .32, 1.04, .07, .05, .07, '#d8402a');
  return toGeo(G);
}

/* royal forge: a stone smithy with a great brick chimney, an open lean-to over the glowing hearth, anvil, bellows, quench barrel, grindstone, blades */
export function forgeGeo() {
  const G = newG(), x0 = .2, x1 = 1.22, z0 = .22, z1 = 1.24, xc = (x0 + x1) / 2, zc = (z0 + z1) / 2; grass(G, '#6a7a48'); flags(G, 1.1, 1.62, 1.7, .64, 6);
  qStone(G, xc, .13, zc, x1 - x0, z1 - z0, .84, { moss: 1 }); qQuoin(G, x0, z0, x1, z1, .13, .84);
  const rt = qRoof(G, xc, zc, z1 - z0, x1 - x0, .97, QSL, false, { rise: .2, run: .15, ov0: .08, ov1: .1, side: .08, fill: QS[2] });
  for (let k = 0; k < 11; k++) bS(G, .44, .13 + k * .2, .42, k < 5 ? .46 : .36, .2, k < 5 ? .46 : .36, k % 2 ? '#9a5442' : '#87493a');
  bS(G, .44, 2.33, .42, .44, .06, .44, QTR); bP(G, .44, 2.39, .42, .24, .05, .24, '#262222'); bL(G, .44, 2.4, .42, .14, .04, .14, '#ff7a1a'); (G.chim || (G.chim = [])).push([.44, 2.5, .42]);
  qDoor(G, .62, z1 + .016, true, 1, { y: .13, w: .28, h: .5, wood: 1, lamp: 1 }); qWin(G, 1.0, .5, z1 + .016, true, 1, { glow: 1, w: .16, h: .2 }); qWin(G, x0 - .016, .5, .9, false, -1, { wood: 1, w: .14, h: .2 });
  qSign(G, .62, .98, z1, true, 1, [[-.18, .2, .3, .22, '#565662'], [-.02, .42, .34, .16, '#565662'], [.14, .3, .08, .5, QBR2], [.1, .7, .16, .14, '#b9c0cc']]);
  /* the open smithy: slate lean-to on two posts against the east wall */
  for (const z of [.4, 1.22]) { bW(G, 1.86, .13, z, .09, .78, .09, QW2); bW(G, 1.86, .13, z, .14, .06, .14, QSD) } bW(G, 1.86, .91, .81, .1, .07, .96, QW1);
  for (let k = 0; k < 4; k++) bR(G, 1.33 + k * .18, 1.2 - k * .08, .81, .2, .08, 1.04, QSL[k % 3]);
  bS(G, 1.42, .13, .52, .34, .36, .46, QSD); bS(G, 1.42, .49, .52, .38, .05, .5, QS[1]); bL(G, 1.44, .54, .52, .26, .05, .36, '#ff7a1a'); bL(G, 1.44, .59, .5, .14, .05, .18, '#ffd25a');
  bS(G, 1.36, .82, .52, .26, .3, .46, QS[3]); bS(G, 1.4, .76, .52, .36, .06, .52, QSD);
  bW(G, 1.74, .44, .46, .22, .1, .2, QW1); bC(G, 1.74, .46, .6, .18, .08, .1, '#6a4a2a'); bM(G, 1.6, .49, .5, .08, .03, .03, QIR); for (const s of [-1, 1]) bW(G, 1.74 + s * .09, .13, .46, .04, .32, .16, QW2);
  qAnvil(G, 1.5, 1.12, .13); bW(G, 1.3, .39, 1.2, .03, .03, .2, QW3); bM(G, 1.3, .38, 1.3, .08, .06, .06, '#565662');
  qBarrel(G, 1.84, 1.52, .13); bP(G, 1.84, .476, 1.52, .2, .01, .2, '#3a6fd0'); qGrind(G, .3, 1.7, .13);
  bW(G, 1.16, .13, 1.7, .5, .04, .1, QW2); for (const x of [.94, 1.38]) bW(G, x, .13, 1.7, .05, .46, .08, QW2); bW(G, 1.16, .55, 1.7, .5, .04, .08, QW2);
  [[1.02, '#dadde4', .36], [1.12, '#c9d0dc', .3], [1.22, '#dadde4', .34], [1.31, '#b9c0cc', .26]].forEach(([x, c, h]) => { bM(G, x, .19, 1.73, .035, h, .02, c); bM(G, x, .17 + h, 1.73, .09, .025, .03, QBR) });
  bP(G, .78, .13, 1.76, .2, .1, .16, '#2c2c34'); bP(G, .8, .23, 1.76, .1, .05, .1, '#3a3a44');
  return toGeo(G);
}

/* embassy: a pale two-floor hall under a hipped roof, a pillared porch with a balcony, a carpet, two tall banners and two flags */
export function embassyGeo() {
  const G = newG(), PL = '#eadfc4', x0 = .22, x1 = 1.78, z0 = .22, z1 = 1.3, zc = (z0 + z1) / 2; grass(G); flags(G, 1, 1.66, 1.8, .56, 6);
  bS(G, 1, .1, zc, x1 - x0 + .1, .1, z1 - z0 + .1, QSD); qStone(G, 1, .2, zc, x1 - x0, z1 - z0, .22);
  bP(G, 1, .42, zc, x1 - x0 - .02, .5, z1 - z0 - .02, PL); bS(G, 1, .92, zc, x1 - x0 + .04, .06, z1 - z0 + .04, QTR);
  bP(G, 1, .98, zc, x1 - x0 - .02, .46, z1 - z0 - .02, '#f0e7d0'); bS(G, 1, 1.44, zc, x1 - x0 + .08, .07, z1 - z0 + .08, QTR);
  qQuoin(G, x0, z0, x1, z1, .2, 1.24);
  let y = 1.51; [[1.76, 1.26], [1.48, .98], [1.2, .7], [.92, .42]].forEach(([w, d], k) => { bR(G, 1, y, zc, w, .16, d, CRM[k % 3]); y += .16 }); bM(G, 1, y, zc, .7, .06, .1, QBR);
  for (const x of [.36, 1.64]) qFlag(G, x, 1.5, z0 + .16, .62);
  /* porch: four pillars carry a balcony */
  for (const x of [.56, .86, 1.14, 1.44]) { bS(G, x, .13, 1.6, .14, .06, .14, QSD); bS(G, x, .19, 1.6, .1, .64, .1, QTR); bS(G, x, .83, 1.6, .15, .05, .15, QTR) }
  bS(G, 1, .88, 1.46, 1.06, .07, .4, QTR); for (let k = 0; k < 7; k++) bS(G, .52 + k * .16, .95, 1.63, .05, .16, .05, QTR); bS(G, 1, 1.11, 1.63, 1.06, .04, .07, QTR);
  for (const x of [.5, 1.5]) { bS(G, x, .95, 1.47, .05, .16, .3, QTR); bS(G, x, 1.11, 1.47, .07, .04, .34, QTR) }
  qDoor(G, 1, z1 + .016, true, 1, { y: .2, w: .32, h: .56 }); qDoor(G, 1, z1 + .016, true, 1, { y: .95, w: .22, h: .34, wood: 1 });
  bM(G, 1, .8, z1 + .03, .16, .12, .02, QBR); bC(G, 1, .81, z1 + .045, .1, .09, .02, structureModelsState.BLU);
  for (const x of [.42, 1.58]) { qWin(G, x, .5, z1 + .016, true, 1, { w: .16, h: .24 }); qWin(G, x, 1.06, z1 + .016, true, 1, { w: .16, h: .22, wood: 1, shut: 1, sc: structureModelsState.BLU }) }
  for (const x of [.6, 1.4]) qWin(G, x, 1.06, z0 - .016, true, -1, { w: .16, h: .22 });
  for (const sx of [-1, 1]) { qWin(G, sx > 0 ? x1 + .016 : x0 - .016, .5, zc, false, sx, { w: .16, h: .24 }); qWin(G, sx > 0 ? x1 + .016 : x0 - .016, 1.06, zc, false, sx, { w: .16, h: .22 }) }
  qBan(G, .7, .86, 1.66, true, 1, .2, .5); qBan(G, 1.3, .86, 1.66, true, 1, .2, .5);
  bC(G, 1, .132, 1.62, .3, .012, .62, '#a8322c'); for (const s of [-1, 1]) bC(G, 1 + s * .16, .133, 1.62, .03, .012, .62, '#e0b43a');
  qPost(G, .2, .13, 1.8, .34, false); qPost(G, 1.8, .13, 1.8, .34, false);
  return toGeo(G);
}

/* war room: a timber hall under a red roof with a flag turret, a striped command tent over the map table, a spear rack, shields and a war drum */
export function warRoomGeo() {
  const G = newG(), x0 = .2, x1 = 1.5, z0 = .26, z1 = 1.26, xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, B = structureModelsState.BLU; grass(G);
  qStone(G, xc, .13, zc, x1 - x0, z1 - z0, .24, { moss: 1 }); qTimber(G, x0, z0, x1, z1, .37, 1.0, { fill: '#d9c9a0', brace: true });
  const rt = qRoof(G, xc, zc, x1 - x0, z1 - z0, 1.0, RED, true, { rise: .22, run: .15, ov0: .1, ov1: .1, side: .1, fill: '#d9c9a0' });
  /* flag turret riding the ridge */
  qTimber(G, xc - .2, zc - .2, xc + .2, zc + .2, rt - .34, rt + .24, { fill: '#d9c9a0', span: .4 }); for (const [a, b] of [[0, .21], [0, -.21], [.21, 0], [-.21, 0]]) bP(G, xc + a, rt, zc + b, a ? .02 : .14, .14, a ? .14 : .02, '#1e1c22');
  const t = qPyr(G, xc, zc, rt + .24, .58, .58, RED, .13, .09); bP(G, xc, t, zc, .04, .5, .04, QIR); bM(G, xc, t + .5, zc, .07, .07, .07, QBR2);
  bC(G, xc + .2, t + .2, zc, .36, .26, .025, '#a8322c'); bC(G, xc + .43, t + .23, zc, .1, .2, .025, '#a8322c'); bC(G, xc + .2, t + .29, zc, .12, .08, .03, '#f4ecd8');
  qDoor(G, .6, z1 + .016, true, 1, { y: .13, w: .32, h: .56, wood: 1, lamp: 1 }); qWin(G, 1.14, .52, z1 + .016, true, 1, { wood: 1, w: .16, h: .22 }); qWin(G, x0 - .016, .52, zc, false, -1, { wood: 1, w: .16, h: .22 });
  /* crossed swords over the door, a shield on each side */
  bM(G, .6, .82, z1 + .05, .3, .03, .02, '#dadde4'); bM(G, .6, .76, z1 + .055, .03, .15, .02, '#dadde4'); bM(G, .6, .8, z1 + .06, .08, .07, .02, QBR);
  for (const x of [.3, .9]) { bM(G, x, .5, z1 + .05, .16, .2, .03, QBR); bC(G, x, .52, z1 + .065, .12, .16, .02, B); bC(G, x, .5, z1 + .07, .12, .04, .02, '#f4ecd8') }
  /* command tent on the east side: striped cloth on poles over the map table */
  for (const [x, z] of [[1.62, .34], [1.94, .34], [1.62, 1.3], [1.94, 1.3]]) bW(G, x, .13, z, .05, x < 1.7 ? .92 : .7, .05, QW2);
  for (let k = 0; k < 6; k++) for (let j = 0; j < 2; j++) bC(G, 1.67 + j * .19, 1.0 - j * .13, .3 + (k + .5) * .175, .2, .05, .18, k % 2 ? '#f2ead8' : '#a8322c');
  for (let k = 0; k < 6; k++) bC(G, 1.955, .76, .3 + (k + .5) * .175, .02, .1, k % 2 ? .1 : .16, k % 2 ? '#f2ead8' : '#a8322c');
  bW(G, 1.78, .13, .82, .26, .22, .56, QW2); bW(G, 1.78, .35, .82, .32, .03, .64, QW3); bP(G, 1.78, .38, .82, .26, .012, .5, '#e8d8a8'); bP(G, 1.74, .392, .8, .12, .006, .2, '#8fae6a'); bP(G, 1.84, .392, .96, .06, .006, .12, '#5a8ac8');
  bP(G, 1.72, .39, .7, .045, .06, .045, '#b83a3a'); bP(G, 1.84, .39, .78, .045, .06, .045, '#b83a3a'); bP(G, 1.76, .39, .98, .045, .06, .045, '#2f6ea8'); bM(G, 1.86, .39, .62, .04, .08, .04, QBR2);
  /* yard: spear rack, war drum, a banner pole */
  for (const x of [.24, .7]) bW(G, x, .13, 1.74, .05, .5, .05, QW2); bW(G, .47, .55, 1.74, .56, .04, .05, QW2); bW(G, .47, .3, 1.74, .56, .04, .05, QW2);
  [.32, .44, .56, .66].forEach((x, k) => { bW(G, x, .15, 1.78, .025, .68, .025, '#b08a58'); bM(G, x, .83, 1.78, .05, .1, .02, '#dadde4') });
  bW(G, 1.2, .13, 1.72, .26, .2, .26, QW1); bC(G, 1.2, .33, 1.72, .28, .03, .28, '#e8dcc0'); bC(G, 1.2, .2, 1.72, .28, .05, .28, '#a8322c'); bW(G, 1.36, .36, 1.66, .16, .025, .025, QW3);
  bP(G, 1.5, .13, 1.84, .045, 1.1, .045, QIR); bM(G, 1.5, 1.23, 1.84, .08, .06, .08, QBR2); bC(G, 1.5, .8, 1.87, .22, .4, .02, B); bC(G, 1.5, .74, 1.87, .1, .06, .02, B); bC(G, 1.5, .94, 1.885, .14, .04, .012, '#f4ecd8'); bC(G, 1.5, .88, 1.885, .04, .16, .012, '#f4ecd8');
  return toGeo(G);
}

/* sappers' workshop: a slate shed beside a timbered mine mouth in a rock mound, rails and an ore cart, powder kegs, a cog wheel, picks and a lantern */
export function sappersGeo() {
  const G = newG(), x0 = .16, x1 = 1.06, z0 = .3, z1 = 1.24, xc = (x0 + x1) / 2, zc = (z0 + z1) / 2; grass(G, '#6a7446'); bP(G, 1.2, .13, 1.6, 1.5, .012, .7, '#7a6a52');
  qStone(G, xc, .13, zc, x1 - x0, z1 - z0, .22, { moss: 1 }); qTimber(G, x0, z0, x1, z1, .35, .92, { fill: '#cdbb90', brace: true });
  qRoof(G, xc, zc, z1 - z0, x1 - x0, .92, QSL, false, { rise: .2, run: .15, ov0: .08, ov1: .1, side: .1, fill: '#cdbb90' });
  qDoor(G, xc, z1 + .016, true, 1, { y: .13, w: .34, h: .52, wood: 1, lamp: 1 }); qWin(G, x0 - .016, .5, zc, false, -1, { wood: 1, w: .14, h: .2 });
  qWheel(G, xc, 1.14, z1 + .06, .15, true, QIR); bM(G, xc, 1.105, z1 + .08, .07, .07, .03, QBR);
  /* the mound and the mine mouth */
  const mx = 1.5, mz = .72; [[.96, 1.0, .34, 0], [.84, .86, .3, 1], [.66, .7, .26, 2], [.42, .46, .2, 3]].reduce((y, [w, d, h, k]) => { bP(G, mx + (k % 2 ? .02 : -.02), y, mz - k * .03, w, h, d, ['#7d7a74', '#8a8780', '#74716b', '#86837c'][k]); return y + h }, .13);
  for (const [x, y, z, w, h, d, c] of [[mx - .2, .55, 1.125, .14, .1, .03, '#5c5a56'], [mx + .22, .62, 1.125, .06, .05, .03, '#e0b43a'], [mx + .05, .85, 1.015, .16, .1, .03, '#5c5a56'], [mx - .18, .92, 1.015, .05, .05, .03, '#e0b43a'], [1.965, .24, .6, .03, .1, .16, '#5c5a56'], [1.965, .34, .86, .03, .05, .06, '#e0b43a'], [1.945, .58, .7, .03, .1, .14, '#5c5a56']]) bP(G, x, y, z, w, h, d, c);
  bP(G, 1.74, .47, .5, .2, .05, .3, '#5f7a45'); bP(G, 1.2, .77, .9, .22, .04, .2, '#5f7a45'); bP(G, 1.92, .13, 1.1, .14, .12, .16, '#74716b'); bP(G, 1.1, .13, .34, .16, .14, .14, '#86837c');
  bP(G, mx, .13, mz + .47, .4, .52, .12, '#141318'); for (const s of [-1, 1]) bW(G, mx + s * .24, .13, mz + .54, .09, .58, .09, QLOG); bW(G, mx, .71, mz + .54, .66, .1, .1, '#5d3f25'); bW(G, mx, .81, mz + .52, .5, .04, .06, QW3);
  qLamp(G, mx + .24, .66, mz + .62, false);
  /* rails and the ore cart */
  for (const s of [-1, 1]) bP(G, mx + s * .1, .142, 1.52, .025, .02, .86, '#565662'); for (let k = 0; k < 5; k++) bW(G, mx, .132, 1.18 + k * .18, .34, .014, .06, QW2);
  bW(G, mx, .22, 1.58, .3, .16, .34, QW1); bP(G, mx, .2, 1.58, .32, .03, .36, QIR); bP(G, mx, .35, 1.58, .32, .03, .36, QIR); bP(G, mx, .38, 1.58, .22, .06, .26, '#86837c'); bP(G, mx - .03, .44, 1.56, .1, .05, .1, '#74716b'); bM(G, mx + .06, .44, 1.64, .06, .04, .06, '#e0b43a');
  for (const s of [-1, 1]) for (const z of [1.48, 1.68]) bP(G, mx + s * .1, .15, z, .03, .08, .08, '#34343c');
  /* powder kegs with a red band, a fuse, a crate, picks and a shovel */
  for (const [x, z, y] of [[.3, 1.62, .13], [.54, 1.68, .13], [.42, 1.65, .47]]) { qBarrel(G, x, z, y); bC(G, x, y + .15, z, .28, .06, .28, '#b8322a') }
  bP(G, .42, .81, 1.65, .02, .08, .02, ROPE); bL(G, .42, .89, 1.65, .035, .035, .035, '#ffb24a');
  qCrate(G, .84, 1.76, .13, .24); bP(G, .84, .2, 1.884, .14, .1, .006, '#b8322a');
  bW(G, 1.12, .13, 1.3, .03, .56, .03, QW3); bM(G, 1.12, .64, 1.3, .3, .04, .04, '#565662'); bM(G, .98, .6, 1.3, .04, .05, .04, '#565662'); bM(G, 1.26, .6, 1.3, .04, .05, .04, '#565662');
  bW(G, 1.9, .13, 1.74, .03, .5, .03, QW3); bM(G, 1.9, .13, 1.74, .1, .14, .02, '#565662');
  return toGeo(G);
}
