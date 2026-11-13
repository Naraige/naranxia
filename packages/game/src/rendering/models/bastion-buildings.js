import { newG, toGeo } from "../geometry.js";
import {
  bC,
  bM,
  bP,
  bS,
  bW,
  bL,
  bR,
  qAnvil,
  qBan,
  qBarrel,
  qCone,
  qCornice,
  qCrate,
  qDoor,
  qFire,
  qFlag,
  qGrind,
  qLadder,
  qLamp,
  qMerl,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  qRoof,
  qRound,
  qSack,
  qSign,
  qSlit,
  qStone,
  qTimber,
  qTree,
  qWheel,
  qWin,
  QBR,
  QBR2,
  QHX,
  QIR,
  QLOG,
  QLOGT,
  QS,
  QSD,
  QSL,
  QTR,
  QW1,
  QW2,
  QW3,
} from "./building-parts.js";
import { HAYC, ROPE, structureModelsState } from "./structures.js";

/* ---- last-bastion buildings (2x2 tiles, front = +z). Each one is told apart by its outline first (dome and telescope, stilts and
   hoist, belfry, steeple, fire basket, tree tops, great chimney, pillared porch, flag turret, mine mouth), then by its props ---- */
const grass = (G, c) => {
  qPlinth(G, 1, 0, 1, 2, 2, 0.1);
  bP(G, 1, 0.1, 1, 1.9, 0.03, 1.9, c || "#6f8a44");
};
const flags = (G, x, z, w, d, n) => {
  for (let i = 0; i < n; i++)
    for (let j = 0; j < 2; j++)
      if ((i + j) % 2)
        bS(
          G,
          x - w / 2 + ((i + 0.5) * w) / n,
          0.13,
          z - d / 2 + ((j + 0.5) * d) / 2,
          w / n - 0.02,
          0.012,
          d / 2 - 0.02,
          QS[(i + j) % 4],
        );
};
const BLS = ["#2f5d86", "#3a6b97", "#2a4f75"],
  GLD = ["#d8b04a", "#c9a03e", "#e2bd58"],
  RED = ["#9a3a32", "#8a3029", "#a8443a"],
  CRM = ["#8a4a3a", "#7a3f32", "#96543f"];

/* round stone tower with a timber gallery under a blue slate dome; a brass telescope pokes out of the slit; a study leans on the tower */
export function observatoryGeo() {
  const G = newG(),
    x = 1.1,
    z = 0.86;
  grass(G);
  qStone(G, 0.5, 0.13, 1.4, 0.7, 0.62, 0.6, { ph: 1 });
  qCornice(G, 0.5, 0.73, 1.4, 0.76, 0.68, 0.05);
  for (let k = 0; k < 4; k++) bR(G, 0.5, 0.78 + k * 0.09, 1.46 - k * 0.09, 0.84, 0.09, 0.62 - k * 0.12, QSL[k % 3]);
  qDoor(G, 0.5, 1.726, true, 1, { y: 0.13, w: 0.24, h: 0.42, wood: 1, lamp: 1 });
  qWin(G, 0.134, 0.36, 1.4, false, -1, { w: 0.12, h: 0.16 });
  qRound(G, x, z, 0.13, 1.5, 1.12, { moss: 1 });
  qRing(G, x, z, 0.86, 1.18, 0.05, QBR, bM);
  qWin(G, x, 1.08, z + 0.565, true, 1, { glow: 1, w: 0.14, h: 0.28 });
  qWin(G, x + 0.565, 0.5, z, false, 1, { w: 0.12, h: 0.24 });
  qWin(G, x, 0.5, z - 0.565, true, -1, { w: 0.12, h: 0.24 });
  qRing(G, x, z, 1.63, 1.44, 0.07, QW2, bW);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 6.2832 + 0.39,
      r = 0.64;
    bW(G, x + Math.cos(a) * r, 1.7, z + Math.sin(a) * r, 0.05, 0.2, 0.05, QW1);
  }
  for (const [a, b, w, d] of [
    [0, 0.68, 0.86, 0.04],
    [0, -0.68, 0.86, 0.04],
    [0.68, 0, 0.04, 0.86],
    [-0.68, 0, 0.04, 0.86],
  ])
    bW(G, x + a, 1.88, z + b, w, 0.035, d, QW3);
  qRound(G, x, z, 1.7, 0.34, 1.0, { ph: 2 });
  qRing(G, x, z, 2.04, 1.08, 0.06, QBR, bM);
  let y = 2.1;
  [
    [1.0, 0.14],
    [0.9, 0.14],
    [0.74, 0.14],
    [0.52, 0.12],
    [0.28, 0.1],
  ].forEach(([r, h], k) => {
    qRing(G, x, z, y, r, h, BLS[k % 3], bR);
    y += h;
  });
  bM(G, x, y, z, 0.07, 0.16, 0.07, QBR2);
  bL(G, x, y + 0.16, z, 0.08, 0.08, 0.08, QHX);
  bP(G, x, 2.1, z + 0.3, 0.22, 0.5, 0.46, "#16161c");
  for (let k = 0; k < 4; k++)
    bM(G, x, 2.2 + k * 0.12, z + 0.36 + k * 0.17, k > 2 ? 0.1 : 0.13, 0.13, 0.2, k % 2 ? QBR : QBR2);
  bL(G, x, 2.69, z + 0.98, 0.08, 0.08, 0.03, QHX);
  /* yard: an armillary sphere on a pedestal, a star chart on a table, scroll crate */
  const ax = 1.62,
    az = 1.66;
  bS(G, ax, 0.13, az, 0.2, 0.2, 0.2, QSD);
  bM(G, ax, 0.33, az, 0.04, 0.08, 0.04, QBR);
  bM(G, ax, 0.41, az, 0.32, 0.028, 0.028, QBR);
  bM(G, ax, 0.7, az, 0.32, 0.028, 0.028, QBR);
  for (const s of [-1, 1]) bM(G, ax + s * 0.146, 0.41, az, 0.028, 0.32, 0.028, QBR);
  bM(G, ax, 0.55, az, 0.028, 0.028, 0.32, QBR2);
  bM(G, ax, 0.55, az, 0.36, 0.028, 0.028, QBR2);
  bL(G, ax, 0.52, az, 0.09, 0.09, 0.09, QHX);
  bW(G, 1.14, 0.13, 1.74, 0.36, 0.2, 0.24, QW2);
  bP(G, 1.14, 0.33, 1.74, 0.32, 0.015, 0.2, "#2a3a6a");
  for (const [a, b] of [
    [-0.08, 0.04],
    [0.05, -0.05],
    [0.1, 0.06],
    [-0.02, -0.02],
  ])
    bL(G, 1.14 + a, 0.345, 1.74 + b, 0.025, 0.01, 0.025, "#fff0b0");
  return toGeo(G);
}

/* plank barn on staddle stones with a steep shingle roof, a hoist beam lifting a sack, a ramp, sacks and wheat sheaves */
export function granaryGeo() {
  const G = newG(),
    SHN = ["#8a5a2a", "#7a4e24", "#96642f"],
    x0 = 0.32,
    x1 = 1.68,
    z0 = 0.3,
    z1 = 1.46,
    zc = (z0 + z1) / 2;
  grass(G);
  for (const x of [0.44, 1, 1.56])
    for (const z of [0.42, 1.34]) {
      bS(G, x, 0.1, z, 0.12, 0.26, 0.12, QS[1]);
      bS(G, x, 0.36, z, 0.24, 0.06, 0.24, QS[3]);
    }
  bW(G, 1, 0.42, zc, x1 - x0 + 0.1, 0.08, z1 - z0 + 0.1, QW2);
  for (let k = 0; k < 5; k++) bW(G, 1, 0.5 + k * 0.15, zc, x1 - x0, 0.15, z1 - z0, k % 2 ? "#a8814f" : "#9a6c40");
  for (const x of [x0, x1]) for (const z of [z0, z1]) bW(G, x, 0.5, z, 0.1, 0.75, 0.1, QW2);
  bW(G, 1, 1.25, zc, x1 - x0 + 0.08, 0.07, z1 - z0 + 0.08, QW2);
  const top = qRoof(G, 1, zc, x1 - x0, z1 - z0, 1.32, SHN, true, {
    rise: 0.2,
    run: 0.14,
    ov0: 0.14,
    ov1: 0.14,
    side: 0.14,
    fill: "#b08a52",
  });
  qDoor(G, 1, z1 + 0.016, true, 1, { y: 0.5, w: 0.36, h: 0.52, wood: 1, lamp: 1 });
  for (const x of [0.56, 1.44])
    for (let k = 0; k < 3; k++) bP(G, x, 0.74 + k * 0.09, z1 + 0.012, 0.2, 0.035, 0.02, "#3a2a1a");
  for (let k = 0; k < 5; k++) bW(G, 1, 0.1 + k * 0.08, 1.94 - k * 0.085, 0.44, 0.05, 0.1, k % 2 ? QW1 : QW3);
  bW(G, x1 + 0.02, 1.42, zc, 0.03, 0.3, 0.26, QW1);
  bW(G, x1 + 0.22, top - 0.4, zc, 0.52, 0.07, 0.07, QW2);
  bP(G, x1 + 0.4, top - 0.78, zc, 0.015, 0.38, 0.015, ROPE);
  qSack(G, x1 + 0.4, zc, top - 0.96);
  qSack(G, 0.34, 1.72, 0.13);
  qSack(G, 0.54, 1.78, 0.13);
  qSack(G, 0.44, 1.75, 0.27, "#cdbb90");
  qSack(G, 1.9, 1.3, 0.13);
  for (const [x, z] of [
    [1.5, 1.76],
    [1.68, 1.82],
  ]) {
    bC(G, x, 0.13, z, 0.12, 0.3, 0.12, HAYC);
    bC(G, x, 0.43, z, 0.2, 0.1, 0.2, "#e8c84a");
    bC(G, x, 0.25, z, 0.14, 0.03, 0.14, "#8a6a2a");
  }
  qBarrel(G, 0.22, 0.5, 0.13);
  return toGeo(G);
}

/* alarm belfry: a stone base, an open timber frame with a great bronze bell, a slate spire with the kingdom's pennant and a pull rope */
export function bellGeo() {
  const G = newG(),
    c = 1;
  grass(G);
  bS(G, c, 0.1, c, 1.3, 0.1, 1.3, QSD);
  qStone(G, c, 0.2, c, 1.0, 1.0, 0.74, { moss: 1 });
  qQuoin(G, 0.5, 0.5, 1.5, 1.5, 0.2, 0.74);
  qCornice(G, c, 0.94, c, 1.12, 1.12, 0.07);
  qDoor(G, c, 1.516, true, 1, { y: 0.2, w: 0.26, h: 0.44, wood: 1, lamp: 1 });
  qSlit(G, 1.516, 0.42, c, false);
  qSlit(G, 0.484, 0.42, c, false);
  for (let k = 0; k < 2; k++) bS(G, c, 0.1 + k * 0.05, 1.74 - k * 0.08, 0.5, 0.05, 0.12, QS[2]);
  for (const x of [0.58, 1.42])
    for (const z of [0.58, 1.42]) {
      bW(G, x, 1.01, z, 0.1, 0.84, 0.1, QW2);
      bW(G, x, 1.01, z, 0.14, 0.06, 0.14, QW1);
    }
  for (const [a, b, w, d] of [
    [0, 0.42, 0.76, 0.04],
    [0, -0.42, 0.76, 0.04],
    [0.42, 0, 0.04, 0.76],
    [-0.42, 0, 0.04, 0.76],
  ]) {
    bW(G, c + a, 1.22, c + b, w, 0.04, d, QW3);
    bW(G, c + a, 1.79, c + b, w + 0.18, 0.08, d + 0.06, QW1);
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      for (let k = 0; k < 2; k++)
        bW(G, c + sx * (0.34 - k * 0.09), 1.6 + k * 0.09, c + sz * 0.42, 0.09, 0.09, 0.05, QW2);
  bW(G, c, 1.66, c, 0.96, 0.1, 0.1, QW2);
  bM(G, c, 1.58, c, 0.12, 0.08, 0.12, QBR);
  bM(G, c, 1.34, c, 0.3, 0.24, 0.3, "#b8862e");
  bM(G, c, 1.24, c, 0.4, 0.1, 0.4, QBR);
  bM(G, c, 1.2, c, 0.47, 0.045, 0.47, QBR2);
  bP(G, c, 1.1, c, 0.05, 0.12, 0.05, QIR);
  const t = qPyr(G, c, c, 1.87, 1.26, 1.26, QSL, 0.15, 0.1);
  bM(G, c, t, c, 0.06, 0.12, 0.06, QBR2);
  qFlag(G, c, t + 0.06, c, 0.42);
  bW(G, 1.58, 1.7, c, 0.26, 0.05, 0.05, QW2);
  bP(G, 1.68, 0.62, c, 0.018, 1.08, 0.018, ROPE);
  bW(G, 1.68, 0.56, c, 0.05, 0.06, 0.05, QW1);
  qCrate(G, 0.3, 1.66, 0.13, 0.22);
  bP(G, 0.3, 0.35, 1.66, 0.16, 0.02, 0.16, "#c8282a");
  qPost(G, 1.7, 0.13, 1.7, 0.3, false);
  return toGeo(G);
}

/* chapel of pale stone: the nave runs front to back under a golden roof, buttresses, a bell-cote on the front gable, a glowing sun window, an apse */
export function sanctuaryGeo() {
  const G = newG(),
    PL = ["#ece4d0", "#e2d9c2", "#f2ecdc", "#dcd2ba"],
    x0 = 0.52,
    x1 = 1.48,
    z0 = 0.46,
    z1 = 1.5,
    zc = (z0 + z1) / 2;
  grass(G);
  bS(G, 1, 0.1, zc, x1 - x0 + 0.16, 0.09, z1 - z0 + 0.16, QSD);
  for (let k = 0; k < 5; k++) bS(G, 1, 0.19 + k * 0.18, zc, x1 - x0, 0.18, z1 - z0, PL[k % 4]);
  for (const sx of [-1, 1])
    for (const z of [0.62, 1.0, 1.38]) {
      const x = sx > 0 ? x1 + 0.06 : x0 - 0.06;
      bS(G, x, 0.13, z, 0.14, 0.56, 0.14, PL[3]);
      bS(G, x - sx * 0.02, 0.69, z, 0.1, 0.2, 0.12, PL[1]);
      bS(G, x - sx * 0.04, 0.89, z, 0.06, 0.1, 0.1, PL[2]);
    }
  bS(G, 1, 1.09, zc, x1 - x0 + 0.06, 0.06, z1 - z0 + 0.06, QTR);
  const top = qRoof(G, 1, zc, z1 - z0, x1 - x0, 1.15, GLD, false, {
    rise: 0.22,
    run: 0.14,
    ov0: 0.06,
    ov1: 0.1,
    side: 0.1,
    stone: 1,
    fill: PL[2],
    ridge: QBR2,
  });
  qRound(G, 1, z0 - 0.06, 0.13, 0.82, 0.74, { ph: 1 });
  qCone(G, 1, z0 - 0.06, 0.95, 0.82, GLD, 0.2);
  for (const sx of [-1, 1])
    for (const z of [0.81, 1.19])
      qWin(G, sx > 0 ? x1 + 0.016 : x0 - 0.016, 0.44, z, false, sx, { glow: 1, w: 0.1, h: 0.34 });
  qDoor(G, 1, z1 + 0.016, true, 1, { y: 0.19, w: 0.28, h: 0.46 });
  bM(G, 1, 0.93, z1 + 0.03, 0.3, 0.3, 0.03, QBR);
  bL(G, 1, 0.97, z1 + 0.05, 0.2, 0.2, 0.03, "#ffd98c");
  bM(G, 1, 1.05, z1 + 0.06, 0.03, 0.04, 0.02, QBR2);
  for (const [a, b] of [
    [-0.2, 0.15],
    [0.2, 0.15],
    [0, -0.07],
    [0, 0.37],
  ])
    bL(G, 1 + a, 0.93 + b, z1 + 0.04, 0.05, 0.05, 0.03, "#ffd98c");
  bS(G, 1, top - 0.14, z1 - 0.1, 0.34, 0.42, 0.2, PL[0]);
  bP(G, 1, top + 0.04, z1 - 0.1, 0.16, 0.16, 0.22, "#1e1c22");
  bM(G, 1, top + 0.06, z1 - 0.1, 0.1, 0.1, 0.1, QBR);
  const t = qPyr(G, 1, z1 - 0.1, top + 0.28, 0.44, 0.3, GLD, 0.1, 0.08);
  bM(G, 1, t, z1 - 0.1, 0.04, 0.12, 0.04, QBR2);
  bL(G, 1, t + 0.12, z1 - 0.1, 0.12, 0.12, 0.04, "#ffd98c");
  for (let k = 0; k < 2; k++) bS(G, 1, 0.1 + k * 0.05, 1.7 - k * 0.08, 0.56, 0.05, 0.14, PL[1]);
  qPost(G, 0.5, 0.13, 1.78, 0.26, false);
  qPost(G, 1.5, 0.13, 1.78, 0.26, false);
  for (const [x, z, h] of [
    [0.2, 0.5, 0.22],
    [0.22, 0.9, 0.16],
    [1.8, 0.6, 0.2],
  ]) {
    bS(G, x, 0.13, z, 0.14, h, 0.06, QS[1]);
    bS(G, x, 0.13 + h, z, 0.09, 0.05, 0.06, QS[1]);
  }
  for (const [x, c] of [
    [0.2, "#c8282a"],
    [0.34, "#f0d020"],
    [1.66, "#e05a8a"],
    [1.8, "#f4f0e8"],
  ]) {
    bP(G, x, 0.13, 1.34, 0.1, 0.05, 0.1, "#4a8e32");
    bP(G, x, 0.18, 1.34, 0.05, 0.05, 0.05, c);
  }
  return toGeo(G);
}

/* signal beacon: a tapering stone tower, a corbelled crown with an iron fire basket, a ladder, the kingdom's banner and a covered woodpile */
export function beaconGeo() {
  const G = newG(),
    c = 1;
  grass(G);
  bS(G, c, 0.1, c, 1.16, 0.1, 1.16, QSD);
  qStone(G, c, 0.2, c, 0.98, 0.98, 0.5, { moss: 1 });
  bS(G, c, 0.7, c, 1.04, 0.05, 1.04, QTR);
  qStone(G, c, 0.75, c, 0.78, 0.78, 1.14, { ph: 1 });
  qQuoin(G, c - 0.39, c - 0.39, c + 0.39, c + 0.39, 0.75, 1.14);
  for (const [a, b] of [
    [-0.26, 0.43],
    [0.26, 0.43],
    [-0.26, -0.43],
    [0.26, -0.43],
    [0.43, -0.26],
    [0.43, 0.26],
    [-0.43, -0.26],
    [-0.43, 0.26],
  ]) {
    bS(G, c + a, 1.77, c + b, 0.1, 0.12, 0.1, QSD);
    bS(G, c + a * 1.1, 1.69, c + b * 1.1, 0.07, 0.08, 0.07, QSD);
  }
  bS(G, c, 1.89, c, 1.12, 0.1, 1.12, QS[2]);
  qMerl(G, c - 0.56, c - 0.56, c + 0.56, c + 0.56, 1.99, 0.16, 0.485);
  for (const [a, b] of [
    [-0.2, -0.2],
    [0.2, -0.2],
    [-0.2, 0.2],
    [0.2, 0.2],
  ])
    bP(G, c + a, 1.99, c + b, 0.05, 0.2, 0.05, QIR);
  bP(G, c, 2.19, c, 0.56, 0.05, 0.56, QIR);
  for (const [a, b, w, d] of [
    [0, 0.27, 0.58, 0.04],
    [0, -0.27, 0.58, 0.04],
    [0.27, 0, 0.04, 0.58],
    [-0.27, 0, 0.04, 0.58],
  ])
    bP(G, c + a, 2.24, c + b, w, 0.14, d, QIR);
  bW(G, c, 2.24, c, 0.46, 0.08, 0.12, QLOG);
  bW(G, c, 2.3, c, 0.12, 0.08, 0.46, "#5d3f25");
  qFire(G, c, 2.36, c, 1.15);
  qDoor(G, c, 1.506, true, 1, { y: 0.2, w: 0.26, h: 0.42, wood: 1, lamp: 1 });
  qSlit(G, c, 1.0, 1.396, true);
  qSlit(G, 1.396, 1.3, c, false);
  qSlit(G, 0.604, 1.3, c, false);
  qBan(G, c, 1.78, 1.39, true, 1, 0.2, 0.36);
  qLadder(G, 0.56, c, 0.7, 1.3, false);
  for (const z of [0.5, 0.96]) bW(G, 1.74, 0.13, z, 0.06, 0.5, 0.06, QW2);
  for (let k = 0; k < 3; k++) bR(G, 1.76 - k * 0.07, 0.63 + k * 0.06, 0.73, 0.12, 0.06, 0.62, QSL[k % 3]);
  for (let k = 0; k < 3; k++) {
    bW(G, 1.72, 0.13 + k * 0.11, 0.6 + (k % 2) * 0.05, 0.2, 0.11, 0.11, QLOG);
    bW(G, 1.72, 0.13 + k * 0.11, 0.78 + (k % 2) * 0.05, 0.2, 0.11, 0.11, "#5d3f25");
    bW(G, 1.824, 0.14 + k * 0.11, 0.69 + (k % 2) * 0.05, 0.012, 0.09, 0.26, QLOGT);
  }
  return toGeo(G);
}

/* fenced orchard: four apple trees heavy with fruit, a picking ladder, baskets, a straw beehive and a wheelbarrow */
export function orchardGeo() {
  const G = newG();
  grass(G, "#62803c");
  bP(G, 1, 0.13, 1, 1.5, 0.012, 0.2, "#7a6a48");
  bP(G, 1, 0.13, 1, 0.2, 0.012, 1.5, "#7a6a48");
  for (let k = 0; k <= 6; k++) {
    const t = 0.1 + k * 0.3;
    for (const z of [0.1, 1.9])
      if (!(z > 1 && k === 3)) {
        bW(G, t, 0.1, z, 0.06, 0.3, 0.06, QW1);
        bW(G, t, 0.4, z, 0.04, 0.03, 0.04, QW3);
      }
    if (k > 0 && k < 6)
      for (const x of [0.1, 1.9]) {
        bW(G, x, 0.1, t, 0.06, 0.3, 0.06, QW1);
        bW(G, x, 0.4, t, 0.04, 0.03, 0.04, QW3);
      }
  }
  for (const y of [0.2, 0.32]) {
    bW(G, 1, y, 0.1, 1.8, 0.035, 0.03, QW3);
    bW(G, 0.1, y, 1, 0.03, 0.035, 1.8, QW3);
    bW(G, 1.9, y, 1, 0.03, 0.035, 1.8, QW3);
    bW(G, 0.47, y, 1.9, 0.74, 0.035, 0.03, QW3);
    bW(G, 1.53, y, 1.9, 0.74, 0.035, 0.03, QW3);
  }
  const F = [
    [0.3, 0.12, 0.2],
    [-0.24, 0.26, 0.3],
    [0.08, -0.33, 0.22],
    [-0.3, -0.12, 0.42],
    [0.2, 0.34, 0.44],
    [0.34, -0.1, 0.06],
  ];
  qTree(G, 0.56, 0.56, 0.1, 0.5, { fruit: F, s: 1.02 });
  qTree(G, 1.44, 0.56, 0.1, 0.58, { fruit: F, a: "#58a23e", b: "#6cb44c" });
  qTree(G, 0.56, 1.38, 0.1, 0.46, { fruit: F, a: "#58a23e", b: "#6cb44c", s: 0.95 });
  qTree(G, 1.44, 1.38, 0.1, 0.52, { fruit: F, s: 0.98 });
  qLadder(G, 1.44, 1.72, 0.1, 0.62, true);
  for (const [x, z, c] of [
    [0.86, 1.66, "#d8402a"],
    [1.06, 1.74, "#d8402a"],
    [0.98, 0.96, "#e0b030"],
  ]) {
    bW(G, x, 0.1, z, 0.17, 0.11, 0.17, "#b08a58");
    bW(G, x, 0.19, z, 0.19, 0.025, 0.19, QW2);
    bM(G, x - 0.03, 0.21, z + 0.02, 0.07, 0.06, 0.07, c);
    bM(G, x + 0.04, 0.21, z - 0.03, 0.07, 0.05, 0.07, c);
  }
  for (let k = 0; k < 4; k++)
    bC(G, 1.74, 0.1 + k * 0.07, 0.98, 0.22 - k * 0.045, 0.07, 0.22 - k * 0.045, k % 2 ? "#c9a03e" : HAYC);
  bP(G, 1.74, 0.13, 1.092, 0.05, 0.04, 0.01, "#2a1a0a");
  bW(G, 1.74, 0.08, 0.98, 0.28, 0.03, 0.28, QW2);
  bW(G, 0.3, 0.22, 1.0, 0.3, 0.1, 0.2, QW1);
  bW(G, 0.3, 0.3, 1.0, 0.32, 0.03, 0.22, QW2);
  qWheel(G, 0.3, 0.19, 0.84, 0.08, false);
  for (const s of [-1, 1]) bW(G, 0.3 + s * 0.13, 0.3, 1.16, 0.03, 0.03, 0.2, QW3);
  bM(G, 0.28, 0.32, 0.98, 0.07, 0.06, 0.07, "#d8402a");
  bM(G, 0.34, 0.32, 1.04, 0.07, 0.05, 0.07, "#d8402a");
  return toGeo(G);
}

/* royal forge: a stone smithy with a great brick chimney, an open lean-to over the glowing hearth, anvil, bellows, quench barrel, grindstone, blades */
export function forgeGeo() {
  const G = newG(),
    x0 = 0.2,
    x1 = 1.22,
    z0 = 0.22,
    z1 = 1.24,
    xc = (x0 + x1) / 2,
    zc = (z0 + z1) / 2;
  grass(G, "#6a7a48");
  flags(G, 1.1, 1.62, 1.7, 0.64, 6);
  qStone(G, xc, 0.13, zc, x1 - x0, z1 - z0, 0.84, { moss: 1 });
  qQuoin(G, x0, z0, x1, z1, 0.13, 0.84);
  qRoof(G, xc, zc, z1 - z0, x1 - x0, 0.97, QSL, false, {
    rise: 0.2,
    run: 0.15,
    ov0: 0.08,
    ov1: 0.1,
    side: 0.08,
    fill: QS[2],
  });
  for (let k = 0; k < 11; k++)
    bS(G, 0.44, 0.13 + k * 0.2, 0.42, k < 5 ? 0.46 : 0.36, 0.2, k < 5 ? 0.46 : 0.36, k % 2 ? "#9a5442" : "#87493a");
  bS(G, 0.44, 2.33, 0.42, 0.44, 0.06, 0.44, QTR);
  bP(G, 0.44, 2.39, 0.42, 0.24, 0.05, 0.24, "#262222");
  bL(G, 0.44, 2.4, 0.42, 0.14, 0.04, 0.14, "#ff7a1a");
  (G.chim || (G.chim = [])).push([0.44, 2.5, 0.42]);
  qDoor(G, 0.62, z1 + 0.016, true, 1, { y: 0.13, w: 0.28, h: 0.5, wood: 1, lamp: 1 });
  qWin(G, 1.0, 0.5, z1 + 0.016, true, 1, { glow: 1, w: 0.16, h: 0.2 });
  qWin(G, x0 - 0.016, 0.5, 0.9, false, -1, { wood: 1, w: 0.14, h: 0.2 });
  qSign(G, 0.62, 0.98, z1, true, 1, [
    [-0.18, 0.2, 0.3, 0.22, "#565662"],
    [-0.02, 0.42, 0.34, 0.16, "#565662"],
    [0.14, 0.3, 0.08, 0.5, QBR2],
    [0.1, 0.7, 0.16, 0.14, "#b9c0cc"],
  ]);
  /* the open smithy: slate lean-to on two posts against the east wall */
  for (const z of [0.4, 1.22]) {
    bW(G, 1.86, 0.13, z, 0.09, 0.78, 0.09, QW2);
    bW(G, 1.86, 0.13, z, 0.14, 0.06, 0.14, QSD);
  }
  bW(G, 1.86, 0.91, 0.81, 0.1, 0.07, 0.96, QW1);
  for (let k = 0; k < 4; k++) bR(G, 1.33 + k * 0.18, 1.2 - k * 0.08, 0.81, 0.2, 0.08, 1.04, QSL[k % 3]);
  bS(G, 1.42, 0.13, 0.52, 0.34, 0.36, 0.46, QSD);
  bS(G, 1.42, 0.49, 0.52, 0.38, 0.05, 0.5, QS[1]);
  bL(G, 1.44, 0.54, 0.52, 0.26, 0.05, 0.36, "#ff7a1a");
  bL(G, 1.44, 0.59, 0.5, 0.14, 0.05, 0.18, "#ffd25a");
  bS(G, 1.36, 0.82, 0.52, 0.26, 0.3, 0.46, QS[3]);
  bS(G, 1.4, 0.76, 0.52, 0.36, 0.06, 0.52, QSD);
  bW(G, 1.74, 0.44, 0.46, 0.22, 0.1, 0.2, QW1);
  bC(G, 1.74, 0.46, 0.6, 0.18, 0.08, 0.1, "#6a4a2a");
  bM(G, 1.6, 0.49, 0.5, 0.08, 0.03, 0.03, QIR);
  for (const s of [-1, 1]) bW(G, 1.74 + s * 0.09, 0.13, 0.46, 0.04, 0.32, 0.16, QW2);
  qAnvil(G, 1.5, 1.12, 0.13);
  bW(G, 1.3, 0.39, 1.2, 0.03, 0.03, 0.2, QW3);
  bM(G, 1.3, 0.38, 1.3, 0.08, 0.06, 0.06, "#565662");
  qBarrel(G, 1.84, 1.52, 0.13);
  bP(G, 1.84, 0.476, 1.52, 0.2, 0.01, 0.2, "#3a6fd0");
  qGrind(G, 0.3, 1.7, 0.13);
  bW(G, 1.16, 0.13, 1.7, 0.5, 0.04, 0.1, QW2);
  for (const x of [0.94, 1.38]) bW(G, x, 0.13, 1.7, 0.05, 0.46, 0.08, QW2);
  bW(G, 1.16, 0.55, 1.7, 0.5, 0.04, 0.08, QW2);
  [
    [1.02, "#dadde4", 0.36],
    [1.12, "#c9d0dc", 0.3],
    [1.22, "#dadde4", 0.34],
    [1.31, "#b9c0cc", 0.26],
  ].forEach(([x, c, h]) => {
    bM(G, x, 0.19, 1.73, 0.035, h, 0.02, c);
    bM(G, x, 0.17 + h, 1.73, 0.09, 0.025, 0.03, QBR);
  });
  bP(G, 0.78, 0.13, 1.76, 0.2, 0.1, 0.16, "#2c2c34");
  bP(G, 0.8, 0.23, 1.76, 0.1, 0.05, 0.1, "#3a3a44");
  return toGeo(G);
}

/* embassy: a pale two-floor hall under a hipped roof, a pillared porch with a balcony, a carpet, two tall banners and two flags */
export function embassyGeo() {
  const G = newG(),
    PL = "#eadfc4",
    x0 = 0.22,
    x1 = 1.78,
    z0 = 0.22,
    z1 = 1.3,
    zc = (z0 + z1) / 2;
  grass(G);
  flags(G, 1, 1.66, 1.8, 0.56, 6);
  bS(G, 1, 0.1, zc, x1 - x0 + 0.1, 0.1, z1 - z0 + 0.1, QSD);
  qStone(G, 1, 0.2, zc, x1 - x0, z1 - z0, 0.22);
  bP(G, 1, 0.42, zc, x1 - x0 - 0.02, 0.5, z1 - z0 - 0.02, PL);
  bS(G, 1, 0.92, zc, x1 - x0 + 0.04, 0.06, z1 - z0 + 0.04, QTR);
  bP(G, 1, 0.98, zc, x1 - x0 - 0.02, 0.46, z1 - z0 - 0.02, "#f0e7d0");
  bS(G, 1, 1.44, zc, x1 - x0 + 0.08, 0.07, z1 - z0 + 0.08, QTR);
  qQuoin(G, x0, z0, x1, z1, 0.2, 1.24);
  let y = 1.51;
  [
    [1.76, 1.26],
    [1.48, 0.98],
    [1.2, 0.7],
    [0.92, 0.42],
  ].forEach(([w, d], k) => {
    bR(G, 1, y, zc, w, 0.16, d, CRM[k % 3]);
    y += 0.16;
  });
  bM(G, 1, y, zc, 0.7, 0.06, 0.1, QBR);
  for (const x of [0.36, 1.64]) qFlag(G, x, 1.5, z0 + 0.16, 0.62);
  /* porch: four pillars carry a balcony */
  for (const x of [0.56, 0.86, 1.14, 1.44]) {
    bS(G, x, 0.13, 1.6, 0.14, 0.06, 0.14, QSD);
    bS(G, x, 0.19, 1.6, 0.1, 0.64, 0.1, QTR);
    bS(G, x, 0.83, 1.6, 0.15, 0.05, 0.15, QTR);
  }
  bS(G, 1, 0.88, 1.46, 1.06, 0.07, 0.4, QTR);
  for (let k = 0; k < 7; k++) bS(G, 0.52 + k * 0.16, 0.95, 1.63, 0.05, 0.16, 0.05, QTR);
  bS(G, 1, 1.11, 1.63, 1.06, 0.04, 0.07, QTR);
  for (const x of [0.5, 1.5]) {
    bS(G, x, 0.95, 1.47, 0.05, 0.16, 0.3, QTR);
    bS(G, x, 1.11, 1.47, 0.07, 0.04, 0.34, QTR);
  }
  qDoor(G, 1, z1 + 0.016, true, 1, { y: 0.2, w: 0.32, h: 0.56 });
  qDoor(G, 1, z1 + 0.016, true, 1, { y: 0.95, w: 0.22, h: 0.34, wood: 1 });
  bM(G, 1, 0.8, z1 + 0.03, 0.16, 0.12, 0.02, QBR);
  bC(G, 1, 0.81, z1 + 0.045, 0.1, 0.09, 0.02, structureModelsState.BLU);
  for (const x of [0.42, 1.58]) {
    qWin(G, x, 0.5, z1 + 0.016, true, 1, { w: 0.16, h: 0.24 });
    qWin(G, x, 1.06, z1 + 0.016, true, 1, { w: 0.16, h: 0.22, wood: 1, shut: 1, sc: structureModelsState.BLU });
  }
  for (const x of [0.6, 1.4]) qWin(G, x, 1.06, z0 - 0.016, true, -1, { w: 0.16, h: 0.22 });
  for (const sx of [-1, 1]) {
    qWin(G, sx > 0 ? x1 + 0.016 : x0 - 0.016, 0.5, zc, false, sx, { w: 0.16, h: 0.24 });
    qWin(G, sx > 0 ? x1 + 0.016 : x0 - 0.016, 1.06, zc, false, sx, { w: 0.16, h: 0.22 });
  }
  qBan(G, 0.7, 0.86, 1.66, true, 1, 0.2, 0.5);
  qBan(G, 1.3, 0.86, 1.66, true, 1, 0.2, 0.5);
  bC(G, 1, 0.132, 1.62, 0.3, 0.012, 0.62, "#a8322c");
  for (const s of [-1, 1]) bC(G, 1 + s * 0.16, 0.133, 1.62, 0.03, 0.012, 0.62, "#e0b43a");
  qPost(G, 0.2, 0.13, 1.8, 0.34, false);
  qPost(G, 1.8, 0.13, 1.8, 0.34, false);
  return toGeo(G);
}

/* war room: a timber hall under a red roof with a flag turret, a striped command tent over the map table, a spear rack, shields and a war drum */
export function warRoomGeo() {
  const G = newG(),
    x0 = 0.2,
    x1 = 1.5,
    z0 = 0.26,
    z1 = 1.26,
    xc = (x0 + x1) / 2,
    zc = (z0 + z1) / 2,
    B = structureModelsState.BLU;
  grass(G);
  qStone(G, xc, 0.13, zc, x1 - x0, z1 - z0, 0.24, { moss: 1 });
  qTimber(G, x0, z0, x1, z1, 0.37, 1.0, { fill: "#d9c9a0", brace: true });
  const rt = qRoof(G, xc, zc, x1 - x0, z1 - z0, 1.0, RED, true, {
    rise: 0.22,
    run: 0.15,
    ov0: 0.1,
    ov1: 0.1,
    side: 0.1,
    fill: "#d9c9a0",
  });
  /* flag turret riding the ridge */
  qTimber(G, xc - 0.2, zc - 0.2, xc + 0.2, zc + 0.2, rt - 0.34, rt + 0.24, { fill: "#d9c9a0", span: 0.4 });
  for (const [a, b] of [
    [0, 0.21],
    [0, -0.21],
    [0.21, 0],
    [-0.21, 0],
  ])
    bP(G, xc + a, rt, zc + b, a ? 0.02 : 0.14, 0.14, a ? 0.14 : 0.02, "#1e1c22");
  const t = qPyr(G, xc, zc, rt + 0.24, 0.58, 0.58, RED, 0.13, 0.09);
  bP(G, xc, t, zc, 0.04, 0.5, 0.04, QIR);
  bM(G, xc, t + 0.5, zc, 0.07, 0.07, 0.07, QBR2);
  bC(G, xc + 0.2, t + 0.2, zc, 0.36, 0.26, 0.025, "#a8322c");
  bC(G, xc + 0.43, t + 0.23, zc, 0.1, 0.2, 0.025, "#a8322c");
  bC(G, xc + 0.2, t + 0.29, zc, 0.12, 0.08, 0.03, "#f4ecd8");
  qDoor(G, 0.6, z1 + 0.016, true, 1, { y: 0.13, w: 0.32, h: 0.56, wood: 1, lamp: 1 });
  qWin(G, 1.14, 0.52, z1 + 0.016, true, 1, { wood: 1, w: 0.16, h: 0.22 });
  qWin(G, x0 - 0.016, 0.52, zc, false, -1, { wood: 1, w: 0.16, h: 0.22 });
  /* crossed swords over the door, a shield on each side */
  bM(G, 0.6, 0.82, z1 + 0.05, 0.3, 0.03, 0.02, "#dadde4");
  bM(G, 0.6, 0.76, z1 + 0.055, 0.03, 0.15, 0.02, "#dadde4");
  bM(G, 0.6, 0.8, z1 + 0.06, 0.08, 0.07, 0.02, QBR);
  for (const x of [0.3, 0.9]) {
    bM(G, x, 0.5, z1 + 0.05, 0.16, 0.2, 0.03, QBR);
    bC(G, x, 0.52, z1 + 0.065, 0.12, 0.16, 0.02, B);
    bC(G, x, 0.5, z1 + 0.07, 0.12, 0.04, 0.02, "#f4ecd8");
  }
  /* command tent on the east side: striped cloth on poles over the map table */
  for (const [x, z] of [
    [1.62, 0.34],
    [1.94, 0.34],
    [1.62, 1.3],
    [1.94, 1.3],
  ])
    bW(G, x, 0.13, z, 0.05, x < 1.7 ? 0.92 : 0.7, 0.05, QW2);
  for (let k = 0; k < 6; k++)
    for (let j = 0; j < 2; j++)
      bC(G, 1.67 + j * 0.19, 1.0 - j * 0.13, 0.3 + (k + 0.5) * 0.175, 0.2, 0.05, 0.18, k % 2 ? "#f2ead8" : "#a8322c");
  for (let k = 0; k < 6; k++)
    bC(G, 1.955, 0.76, 0.3 + (k + 0.5) * 0.175, 0.02, 0.1, k % 2 ? 0.1 : 0.16, k % 2 ? "#f2ead8" : "#a8322c");
  bW(G, 1.78, 0.13, 0.82, 0.26, 0.22, 0.56, QW2);
  bW(G, 1.78, 0.35, 0.82, 0.32, 0.03, 0.64, QW3);
  bP(G, 1.78, 0.38, 0.82, 0.26, 0.012, 0.5, "#e8d8a8");
  bP(G, 1.74, 0.392, 0.8, 0.12, 0.006, 0.2, "#8fae6a");
  bP(G, 1.84, 0.392, 0.96, 0.06, 0.006, 0.12, "#5a8ac8");
  bP(G, 1.72, 0.39, 0.7, 0.045, 0.06, 0.045, "#b83a3a");
  bP(G, 1.84, 0.39, 0.78, 0.045, 0.06, 0.045, "#b83a3a");
  bP(G, 1.76, 0.39, 0.98, 0.045, 0.06, 0.045, "#2f6ea8");
  bM(G, 1.86, 0.39, 0.62, 0.04, 0.08, 0.04, QBR2);
  /* yard: spear rack, war drum, a banner pole */
  for (const x of [0.24, 0.7]) bW(G, x, 0.13, 1.74, 0.05, 0.5, 0.05, QW2);
  bW(G, 0.47, 0.55, 1.74, 0.56, 0.04, 0.05, QW2);
  bW(G, 0.47, 0.3, 1.74, 0.56, 0.04, 0.05, QW2);
  [0.32, 0.44, 0.56, 0.66].forEach((x, _k) => {
    bW(G, x, 0.15, 1.78, 0.025, 0.68, 0.025, "#b08a58");
    bM(G, x, 0.83, 1.78, 0.05, 0.1, 0.02, "#dadde4");
  });
  bW(G, 1.2, 0.13, 1.72, 0.26, 0.2, 0.26, QW1);
  bC(G, 1.2, 0.33, 1.72, 0.28, 0.03, 0.28, "#e8dcc0");
  bC(G, 1.2, 0.2, 1.72, 0.28, 0.05, 0.28, "#a8322c");
  bW(G, 1.36, 0.36, 1.66, 0.16, 0.025, 0.025, QW3);
  bP(G, 1.5, 0.13, 1.84, 0.045, 1.1, 0.045, QIR);
  bM(G, 1.5, 1.23, 1.84, 0.08, 0.06, 0.08, QBR2);
  bC(G, 1.5, 0.8, 1.87, 0.22, 0.4, 0.02, B);
  bC(G, 1.5, 0.74, 1.87, 0.1, 0.06, 0.02, B);
  bC(G, 1.5, 0.94, 1.885, 0.14, 0.04, 0.012, "#f4ecd8");
  bC(G, 1.5, 0.88, 1.885, 0.04, 0.16, 0.012, "#f4ecd8");
  return toGeo(G);
}

/* sappers' workshop: a slate shed beside a timbered mine mouth in a rock mound, rails and an ore cart, powder kegs, a cog wheel, picks and a lantern */
export function sappersGeo() {
  const G = newG(),
    x0 = 0.16,
    x1 = 1.06,
    z0 = 0.3,
    z1 = 1.24,
    xc = (x0 + x1) / 2,
    zc = (z0 + z1) / 2;
  grass(G, "#6a7446");
  bP(G, 1.2, 0.13, 1.6, 1.5, 0.012, 0.7, "#7a6a52");
  qStone(G, xc, 0.13, zc, x1 - x0, z1 - z0, 0.22, { moss: 1 });
  qTimber(G, x0, z0, x1, z1, 0.35, 0.92, { fill: "#cdbb90", brace: true });
  qRoof(G, xc, zc, z1 - z0, x1 - x0, 0.92, QSL, false, {
    rise: 0.2,
    run: 0.15,
    ov0: 0.08,
    ov1: 0.1,
    side: 0.1,
    fill: "#cdbb90",
  });
  qDoor(G, xc, z1 + 0.016, true, 1, { y: 0.13, w: 0.34, h: 0.52, wood: 1, lamp: 1 });
  qWin(G, x0 - 0.016, 0.5, zc, false, -1, { wood: 1, w: 0.14, h: 0.2 });
  qWheel(G, xc, 1.14, z1 + 0.06, 0.15, true, QIR);
  bM(G, xc, 1.105, z1 + 0.08, 0.07, 0.07, 0.03, QBR);
  /* the mound and the mine mouth */
  const mx = 1.5,
    mz = 0.72;
  [
    [0.96, 1.0, 0.34, 0],
    [0.84, 0.86, 0.3, 1],
    [0.66, 0.7, 0.26, 2],
    [0.42, 0.46, 0.2, 3],
  ].reduce((y, [w, d, h, k]) => {
    bP(G, mx + (k % 2 ? 0.02 : -0.02), y, mz - k * 0.03, w, h, d, ["#7d7a74", "#8a8780", "#74716b", "#86837c"][k]);
    return y + h;
  }, 0.13);
  for (const [x, y, z, w, h, d, c] of [
    [mx - 0.2, 0.55, 1.125, 0.14, 0.1, 0.03, "#5c5a56"],
    [mx + 0.22, 0.62, 1.125, 0.06, 0.05, 0.03, "#e0b43a"],
    [mx + 0.05, 0.85, 1.015, 0.16, 0.1, 0.03, "#5c5a56"],
    [mx - 0.18, 0.92, 1.015, 0.05, 0.05, 0.03, "#e0b43a"],
    [1.965, 0.24, 0.6, 0.03, 0.1, 0.16, "#5c5a56"],
    [1.965, 0.34, 0.86, 0.03, 0.05, 0.06, "#e0b43a"],
    [1.945, 0.58, 0.7, 0.03, 0.1, 0.14, "#5c5a56"],
  ])
    bP(G, x, y, z, w, h, d, c);
  bP(G, 1.74, 0.47, 0.5, 0.2, 0.05, 0.3, "#5f7a45");
  bP(G, 1.2, 0.77, 0.9, 0.22, 0.04, 0.2, "#5f7a45");
  bP(G, 1.92, 0.13, 1.1, 0.14, 0.12, 0.16, "#74716b");
  bP(G, 1.1, 0.13, 0.34, 0.16, 0.14, 0.14, "#86837c");
  bP(G, mx, 0.13, mz + 0.47, 0.4, 0.52, 0.12, "#141318");
  for (const s of [-1, 1]) bW(G, mx + s * 0.24, 0.13, mz + 0.54, 0.09, 0.58, 0.09, QLOG);
  bW(G, mx, 0.71, mz + 0.54, 0.66, 0.1, 0.1, "#5d3f25");
  bW(G, mx, 0.81, mz + 0.52, 0.5, 0.04, 0.06, QW3);
  qLamp(G, mx + 0.24, 0.66, mz + 0.62, false);
  /* rails and the ore cart */
  for (const s of [-1, 1]) bP(G, mx + s * 0.1, 0.142, 1.52, 0.025, 0.02, 0.86, "#565662");
  for (let k = 0; k < 5; k++) bW(G, mx, 0.132, 1.18 + k * 0.18, 0.34, 0.014, 0.06, QW2);
  bW(G, mx, 0.22, 1.58, 0.3, 0.16, 0.34, QW1);
  bP(G, mx, 0.2, 1.58, 0.32, 0.03, 0.36, QIR);
  bP(G, mx, 0.35, 1.58, 0.32, 0.03, 0.36, QIR);
  bP(G, mx, 0.38, 1.58, 0.22, 0.06, 0.26, "#86837c");
  bP(G, mx - 0.03, 0.44, 1.56, 0.1, 0.05, 0.1, "#74716b");
  bM(G, mx + 0.06, 0.44, 1.64, 0.06, 0.04, 0.06, "#e0b43a");
  for (const s of [-1, 1]) for (const z of [1.48, 1.68]) bP(G, mx + s * 0.1, 0.15, z, 0.03, 0.08, 0.08, "#34343c");
  /* powder kegs with a red band, a fuse, a crate, picks and a shovel */
  for (const [x, z, y] of [
    [0.3, 1.62, 0.13],
    [0.54, 1.68, 0.13],
    [0.42, 1.65, 0.47],
  ]) {
    qBarrel(G, x, z, y);
    bC(G, x, y + 0.15, z, 0.28, 0.06, 0.28, "#b8322a");
  }
  bP(G, 0.42, 0.81, 1.65, 0.02, 0.08, 0.02, ROPE);
  bL(G, 0.42, 0.89, 1.65, 0.035, 0.035, 0.035, "#ffb24a");
  qCrate(G, 0.84, 1.76, 0.13, 0.24);
  bP(G, 0.84, 0.2, 1.884, 0.14, 0.1, 0.006, "#b8322a");
  bW(G, 1.12, 0.13, 1.3, 0.03, 0.56, 0.03, QW3);
  bM(G, 1.12, 0.64, 1.3, 0.3, 0.04, 0.04, "#565662");
  bM(G, 0.98, 0.6, 1.3, 0.04, 0.05, 0.04, "#565662");
  bM(G, 1.26, 0.6, 1.3, 0.04, 0.05, 0.04, "#565662");
  bW(G, 1.9, 0.13, 1.74, 0.03, 0.5, 0.03, QW3);
  bM(G, 1.9, 0.13, 1.74, 0.1, 0.14, 0.02, "#565662");
  return toGeo(G);
}
