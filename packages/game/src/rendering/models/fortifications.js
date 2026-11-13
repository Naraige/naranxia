import { GTOP } from "../../gameplay/rules.js";
import { newG, toGeo } from "../geometry.js";
import {
  bC,
  bM,
  bP,
  bS,
  bW,
  qab,
  qBan,
  QBR,
  QBR2,
  qCornice,
  qDoor,
  qFlag,
  qGem,
  QIR,
  qLamp,
  QLOG,
  QLOGT,
  qMerl,
  QMS,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  QS,
  QSD,
  QSD2,
  QSL,
  qSlit,
  qStone,
  QTC,
  QTR,
  QW1,
  QW2,
  QW3,
  qWin,
} from "./building-parts.js";
import { qCorbR, qCyl, qMerlL, QSH, qSpire, qTowR } from "./castles.js";
import { DIRS, structureModelsState, WH, WT } from "./structures.js";

/* ---- walls: limestone with a cornice and crenels / log palisade with iron bands ---- */
/* ---- v79 walls: a lower, wider wall with a clear wall walk (units stand on the deck), merlons on the edges only ---- */
const WALLH = 1.45,
  WALLT = 0.74,
  WDH = 1.42;

export function wallGeo(m) {
  const G = newG(),
    T = WALLT,
    H = WALLH;
  qPlinth(G, 0, 0, 0, T + 0.12, T + 0.12, 0.14);
  qStone(G, 0, 0.18, 0, T, T, H - 0.18, { moss: 1 });
  for (const [bit, dx, dz] of DIRS)
    if (m & bit) {
      qab(bS, G, dx, dz, 0.41, 0, 0, 0.2, T + 0.12, 0.18, QSD);
      for (let k = 0; k < 6; k++)
        qab(
          bS,
          G,
          dx,
          dz,
          0.415,
          0,
          0.18 + (k * (H - 0.18)) / 6,
          0.19,
          T,
          (H - 0.18) / 6,
          k === 0 ? QMS : QS[(k + 1) % 4],
        );
    }
  bS(G, 0, H, 0, T + 0.05, 0.07, T + 0.05, QTR);
  for (const [bit, dx, dz] of DIRS) if (m & bit) qab(bS, G, dx, dz, 0.41, 0, H, 0.2, T + 0.05, 0.07, QTR);
  const e = T / 2 - 0.06;
  for (const [bit, dx, dz] of DIRS)
    if (m & bit) {
      for (const l of [-1, 1]) {
        qab(bS, G, dx, dz, 0.42, l * e, H + 0.07, 0.13, 0.12, 0.2, QS[0]);
        qab(bS, G, dx, dz, 0.42, l * e, H + 0.27, 0.15, 0.14, 0.03, QTR);
      }
    }
  for (const [bit, dx, dz] of [
    [1, 0, -1],
    [2, 1, 0],
    [4, 0, 1],
    [8, -1, 0],
  ]) {
    if (m & bit) continue;
    for (const l of [-1, 1]) {
      const a = dx ? dx * e : l * e * 0.7,
        b = dx ? l * e * 0.7 : dz * e;
      bS(G, a, H + 0.07, b, 0.13, 0.2, 0.13, QS[0]);
      bS(G, a, H + 0.27, b, 0.15, 0.03, 0.15, QTR);
    }
    if (dx) qSlit(G, dx * (T / 2 + 0.005), 0.7, 0, false);
    else qSlit(G, 0, 0.7, dz * (T / 2 + 0.005), true);
  }
  for (const [bit, dx, dz] of DIRS) if (m & bit) qab(bS, G, dx, dz, 0.4, 0, 0.92, 0.2, T + 0.012, 0.05, QTR);
  bS(G, 0, 0.92, 0, T + 0.012, 0.05, T + 0.012, QTR);
  for (const [bit, dx] of [
    [16, 1],
    [32, -1],
  ])
    if (m & bit) {
      const x = dx * 0.5,
        z = 0.5,
        c = 0.5;
      qPlinth(G, x, 0, z, c + 0.1, c + 0.1, 0.14);
      qStone(G, x, 0.18, z, c, c, H - 0.18, { moss: 1 });
      bS(G, x, H, z, c + 0.05, 0.07, c + 0.05, QTR);
      bS(G, x + dx * 0.13, H + 0.07, z + 0.13, 0.13, 0.2, 0.13, QS[0]);
      bS(G, x + dx * 0.13, H + 0.27, z + 0.13, 0.15, 0.03, 0.15, QTR);
      bS(G, x, 0.92, z, c + 0.012, 0.05, c + 0.012, QTR);
    }
  if (!(m & 15)) qPost(G, 0, H + 0.07, 0, 0.22, true);
  return toGeo(G);
}

/* log palisade with a plank fighting deck on top and pointed stakes along both edges */
export function woodWallGeo(m) {
  const G = newG(),
    D = WDH,
    stake = (x, z, h) => {
      bW(G, x, 0, z, 0.13, h, 0.13, QLOG);
      bW(G, x, h, z, 0.09, 0.06, 0.09, QLOGT);
      bW(G, x, h + 0.06, z, 0.045, 0.05, 0.045, QLOGT);
    };
  for (const [a, b] of [
    [-0.21, -0.21],
    [0.21, -0.21],
    [-0.21, 0.21],
    [0.21, 0.21],
  ])
    stake(a, b, D + 0.3 + (a + b > 0 ? 0.04 : 0));
  for (const a of [-0.07, 0.07])
    for (const b of [-0.21, 0.21]) {
      bW(G, a, 0, b, 0.14, D, 0.14, QLOG);
      bW(G, b, 0, a, 0.14, D, 0.14, QLOG);
    }
  bW(G, 0, D, 0, 0.5, 0.06, 0.5, QW3);
  for (let k = 0; k < 3; k++) bW(G, -0.16 + k * 0.16, D + 0.06, 0, 0.012, 0.006, 0.5, QW2);
  for (const [bit, dx, dz] of DIRS)
    if (m & bit) {
      for (const t of [0.3, 0.43])
        for (const l of [-0.21, 0.21]) {
          const x = dx ? dx * t : l,
            z = dz ? dz * t : l;
          stake(x, z, D + 0.3 + ((((t * 10) | 0) + (l > 0 ? 1 : 0)) % 2) * 0.05);
        }
      for (const t of [0.3, 0.43])
        for (const l of [-0.07, 0.07]) bW(G, dx ? dx * t : l, 0, dz ? dz * t : l, 0.14, D, 0.14, QLOG);
      qab(bW, G, dx, dz, 0.375, 0, D, 0.25, 0.5, 0.06, QW3);
      for (const y of [0.42, 1.0]) for (const l of [-0.21, 0.21]) qab(bP, G, dx, dz, 0.36, l, y, 0.3, 0.05, 0.06, QIR);
    }
  for (const y of [0.42, 1.0])
    for (const [a, b] of [
      [-0.21, 0],
      [0.21, 0],
      [0, -0.21],
      [0, 0.21],
    ])
      bP(G, a, y, b, a ? 0.05 : 0.46, 0.06, a ? 0.46 : 0.05, QIR);
  for (const [bit, dx] of [
    [16, 1],
    [32, -1],
  ])
    if (m & bit) {
      const x = dx * 0.5,
        z = 0.5;
      for (const [a, b] of [
        [-0.13, -0.13],
        [0.13, -0.13],
        [-0.13, 0.13],
        [0.13, 0.13],
        [0, 0],
      ])
        stake(x + a, z + b, D + 0.3 + (a + b > 0 ? 0.05 : 0));
      for (const a of [-0.07, 0.07]) for (const b of [-0.07, 0.07]) bW(G, x + a, 0, z + b, 0.14, D, 0.14, QLOG);
      bW(G, x, D, z, 0.4, 0.06, 0.4, QW3);
      for (const y of [0.42, 1.0]) bP(G, x, y, z, 0.44, 0.06, 0.44, QIR);
    }
  if (!(m & 15)) qLamp(G, 0, D + 0.5, 0, false);
  return toGeo(G);
}

/* ---- v79 gate: three tiles - two square towers and an arched passage in the middle with a wall walk over it ---- */
export function gateGeo3() {
  const G = newG();
  [-1, 1].forEach((sg) => {
    const x = sg * 1.0;
    qPlinth(G, x, 0, 0, 1.0, 0.98, 0.14);
    qStone(G, x, 0.18, 0, 0.9, 0.9, 2.44, { moss: 1, ph: sg > 0 ? 1 : 0 });
    qQuoin(G, x - 0.45, -0.45, x + 0.45, 0.45, 0.18, 2.44);
    qCornice(G, x, 2.62, 0, 0.98, 0.98, 0.08);
    bS(G, x, 2.7, 0, 0.94, 0.03, 0.94, QSD2);
    qMerl(G, x - 0.47, -0.47, x + 0.47, 0.47, 2.7, 0.24, 0.3);
    qSlit(G, x + sg * 0.455, 1.2, 0, false);
    qSlit(G, x, 1.75, 0.455, true);
    qSlit(G, x, 1.75, -0.455, true);
    qWin(G, x + sg * 0.457, 2.15, 0, false, sg, { w: 0.13, h: 0.22, glow: 1 });
    qLamp(G, x - sg * 0.36, 1.3, 0.5, true);
    qLamp(G, x - sg * 0.36, 1.3, -0.5, true);
    qGem(G, x, 2.3, 0.455, true, 1, 0.09);
    qGem(G, x, 2.3, -0.455, true, -1, 0.09);
  });
  qStone(G, 0, 1.5, 0, 1.12, 0.8, 0.72, { ph: 2 });
  bP(G, 0, 1.44, 0, 1.12, 0.06, 0.1, "#1b1a20");
  for (const sg of [-1, 1]) {
    bS(G, sg * 0.44, 1.3, 0, 0.14, 0.18, 0.82, QTR);
    bS(G, sg * 0.36, 1.4, 0, 0.1, 0.1, 0.82, QTR);
  }
  qCornice(G, 0, 2.22, 0, 1.12, 0.86, 0.08);
  bS(G, 0, 2.3, 0, 1.1, 0.03, 0.82, QSD2);
  qMerlL(G, -0.44, 0.37, 0.44, 0.37, 2.33, 0.22, 0.15);
  qMerlL(G, -0.44, -0.37, 0.44, -0.37, 2.33, 0.22, 0.15);
  qBan(G, 0, 2.2, 0.42, true, 1, 0.3, 0.44);
  qBan(G, 0, 2.2, -0.42, true, -1, 0.3, 0.44);
  bS(G, 0, 0, 0, 3.0, 0.05, 0.84, QSD2);
  return toGeo(G);
}

export function woodGateGeo3() {
  const G = newG();
  [-1, 1].forEach((sg) => {
    const x = sg * 1.0;
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      bW(G, x + a * 0.36, 0, b * 0.36, 0.17, 2.75, 0.17, QLOG);
      bW(G, x + a * 0.36, 2.75, b * 0.36, 0.11, 0.06, 0.11, QLOGT);
    }
    for (const s of [-1, 1]) {
      bW(G, x, 0, s * 0.37, 0.62, 1.9, 0.05, QW1);
      bW(G, x + s * 0.37, 0, 0, 0.05, 1.9, 0.62, QW1);
    }
    for (const y of [0.6, 1.4])
      for (const s of [-1, 1]) {
        bP(G, x, y, s * 0.39, 0.8, 0.05, 0.03, QIR);
        bP(G, x + s * 0.39, y, 0, 0.03, 0.05, 0.8, QIR);
      }
    bW(G, x, 1.95, 0, 0.94, 0.1, 0.94, QW3);
    for (const s of [-1, 1]) {
      bW(G, x, 2.05, s * 0.45, 0.94, 0.36, 0.05, QW1);
      bW(G, x + s * 0.45, 2.05, 0, 0.05, 0.36, 0.94, QW1);
    }
    const t = qPyr(G, x, 0, 2.81, 1.06, 1.06, QSH, 0.1, 0.034);
    bW(G, x, t, 0, 0.08, 0.1, 0.08, QW2);
    qLamp(G, x - sg * 0.3, 1.25, 0.42, false);
    qLamp(G, x - sg * 0.3, 1.25, -0.42, false);
  });
  bW(G, 0, 1.46, 0, 1.2, 0.16, 0.5, QW2);
  bW(G, 0, 1.62, 0, 1.16, 0.28, 0.46, QLOG);
  bW(G, 0, 1.9, 0, 1.2, 0.06, 0.56, QW3);
  for (let i = 0; i < 5; i++) {
    const x = -0.4 + i * 0.2;
    bW(G, x, 1.96, 0.25, 0.12, 0.28 + (i % 2) * 0.08, 0.08, QLOG);
    bW(G, x, 1.96, -0.25, 0.12, 0.28 + ((i + 1) % 2) * 0.08, 0.08, QLOG);
  }
  qBan(G, 0, 1.56, 0.26, true, 1, 0.26, 0.36);
  qBan(G, 0, 1.56, -0.26, true, -1, 0.26, 0.36);
  bP(G, 0, 0, 0, 3.0, 0.05, 0.84, "#6a5a3a");
  return toGeo(G);
}

/* ---- v79 towers: 2x2 keeps of their own (coordinates 0..2, centre 1,1) - four archers stand on the roof ---- */
const TT2S = 3.55,
  TT2W = 3.1;

const TSTB = [
  [0.5, 0],
  [1.5, 0],
  [2, 0.5],
  [2, 1.5],
  [0.5, 2],
  [1.5, 2],
  [0, 0.5],
  [0, 1.5],
];

function towerStubs(G, m, wood) {
  for (let i = 0; i < 8; i++) {
    if (!(m & (1 << i))) continue;
    const sd = i >> 1,
      ax = sd === 0 || sd === 2,
      [px, pz] = TSTB[i],
      L = wood ? 0.24 : 0.2,
      cn = (ax ? pz : px) === 0 ? L / 2 - 0.01 : 2 - L / 2 + 0.01,
      x = ax ? px : cn,
      z = ax ? cn : pz;
    if (wood) {
      const D = WDH;
      for (const l of [-0.21, -0.07, 0.07, 0.21]) {
        const a = ax ? x + l : x,
          b = ax ? z : z + l;
        bW(G, a, 0, b, 0.14, D + (Math.abs(l) > 0.1 ? 0.3 : 0), 0.14, QLOG);
        if (Math.abs(l) > 0.1) {
          bW(G, a, D + 0.3, b, 0.09, 0.06, 0.09, QLOGT);
        }
      }
      bW(G, x, D, z, ax ? 0.5 : L, 0.06, ax ? L : 0.5, QW3);
      for (const y of [0.42, 1.0]) bP(G, x, y, z, ax ? 0.5 : L + 0.02, 0.06, ax ? L + 0.02 : 0.5, QIR);
    } else {
      const T = WALLT,
        H = WALLH,
        w = ax ? T : L,
        d = ax ? L : T;
      bS(G, x, 0, z, ax ? T + 0.12 : L, 0.18, ax ? L : T + 0.12, QSD);
      qStone(G, x, 0.18, z, w, d, H - 0.18, { moss: 1 });
      bS(G, x, H, z, ax ? T + 0.05 : L, 0.07, ax ? L : T + 0.05, QTR);
      bS(G, x, 0.92, z, ax ? T + 0.012 : L, 0.05, ax ? L : T + 0.012, QTR);
      for (const l of [-1, 1]) {
        const e = T / 2 - 0.06,
          a = ax ? x + l * e : x,
          b = ax ? z : z + l * e;
        bS(G, a, H + 0.07, b, ax ? 0.12 : L, 0.2, ax ? L : 0.12, QS[0]);
        bS(G, a, H + 0.27, b, ax ? 0.14 : L, 0.03, ax ? L : 0.14, QTR);
      }
    }
  }
}

export function towerGeo2(m, op) {
  const G = newG(),
    c = 1,
    W = 1.7,
    H = 3.0;
  towerStubs(G, m | 0, false);
  qPlinth(G, c, 0, c, W + 0.2, W + 0.2, 0.18);
  qStone(G, c, 0.18, c, W, W, H, { moss: 1 });
  qQuoin(G, c - W / 2, c - W / 2, c + W / 2, c + W / 2, 0.18, H);
  for (const [x, z, ax, n] of [
    [c, c + W / 2, true, 1],
    [c, c - W / 2, true, -1],
    [c + W / 2, c, false, 1],
    [c - W / 2, c, false, -1],
  ]) {
    for (const o of [-0.45, 0.45]) qSlit(G, ax ? x + o : x + n * 0.005, 1.3, ax ? z + n * 0.005 : z + o, ax);
    qSlit(G, ax ? x : x + n * 0.005, 2.3, ax ? z + n * 0.005 : z, ax);
    qWin(G, ax ? x - 0.42 : x + n * 0.01, 2.35, ax ? z + n * 0.01 : z - 0.42, ax, n, { w: 0.13, h: 0.24, glow: 1 });
    qWin(G, ax ? x + 0.42 : x + n * 0.01, 2.35, ax ? z + n * 0.01 : z + 0.42, ax, n, { w: 0.13, h: 0.24, glow: 1 });
  }
  qDoor(G, c, c + W / 2 + 0.016, true, 1, { y: 0.18, w: 0.42, h: 0.66 });
  qRing(G, c, c, 1.85, W + 0.06, 0.05, QBR, bM);
  for (let i = 0; i < 8; i++) {
    const a = -W / 2 + 0.12 + (i * (W - 0.24)) / 7;
    bS(G, c + a, H + 0.04, c + W / 2 + 0.05, 0.1, 0.14, 0.1, QSD);
    bS(G, c + a, H + 0.04, c - W / 2 - 0.05, 0.1, 0.14, 0.1, QSD);
    bS(G, c + W / 2 + 0.05, H + 0.04, c + a, 0.1, 0.14, 0.1, QSD);
    bS(G, c - W / 2 - 0.05, H + 0.04, c + a, 0.1, 0.14, 0.1, QSD);
  }
  bS(G, c, H + 0.18, c, W + 0.2, 0.1, W + 0.2, QSD);
  qStone(G, c, H + 0.28, c, W + 0.26, W + 0.26, 0.22, { ph: 2 });
  qCornice(G, c, TT2S - 0.05, c, W + 0.3, W + 0.3, 0.05);
  qMerl(G, c - (W + 0.26) / 2, c - (W + 0.26) / 2, c + (W + 0.26) / 2, c + (W + 0.26) / 2, TT2S, 0.24, 0.3);
  if (!op) {
    qCyl(G, bS, c, c, TT2S, 0.6, 0.62, QS[1]);
    qCorbR(G, c, c, TT2S + 0.62, 0.74, 8);
    qTowR(G, c, c, TT2S + 0.6, 0.2, 0.74, { ph: 2 });
    qCyl(G, bC, c, c, TT2S + 0.8, 0.05, 0.78, structureModelsState.BLU);
    const t = qSpire(G, c, c, TT2S + 0.85, 0.76, 1.1, QSL, { band: 2, eave: "#4c4846" });
    bM(G, c, t, c, 0.07, 0.09, 0.07, QBR2);
    qFlag(G, c, t + 0.09, c, 0.62);
    for (const [a, b] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      qWin(G, c + a * 0.31, TT2S + 0.2, c + b * 0.31, a === 0, a || b, { w: 0.1, h: 0.18, glow: 1 });
  }
  qLamp(G, c - 0.5, 1.1, c + W / 2 + 0.08, true);
  qLamp(G, c + 0.5, 1.1, c + W / 2 + 0.08, true);
  return toGeo(G);
}

export function woodTowerGeo2(m, op) {
  const G = newG(),
    c = 1,
    D = 2.95;
  towerStubs(G, m | 0, true);
  bS(G, c, 0, c, 1.9, 0.14, 1.9, QSD);
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    bW(G, c + a * 0.8, 0.14, c + b * 0.8, 0.2, D + 0.55, 0.2, QLOG);
    bW(G, c + a * 0.8, D + 0.69, c + b * 0.8, 0.13, 0.07, 0.13, QLOGT);
    for (const y of [0.6, 1.8]) bP(G, c + a * 0.8, y, c + b * 0.8, 0.22, 0.04, 0.22, QIR);
  }
  for (const s of [-1, 1]) {
    bW(G, c, 0.14, c + s * 0.8, 1.5, 1.4, 0.06, QW1);
    bW(G, c + s * 0.8, 0.14, c, 0.06, 1.4, 1.5, QW1);
    for (const y of [1.5, 2.4]) {
      bW(G, c, y, c + s * 0.8, 1.62, 0.08, 0.07, QW2);
      bW(G, c + s * 0.8, y, c, 0.07, 0.08, 1.62, QW2);
    }
    for (let k = 0; k < 5; k++) {
      const u = -0.6 + k * 0.3,
        y = 1.6 + k * 0.16;
      bW(G, c + u, y, c + s * 0.8, 0.18, 0.12, 0.05, QW2);
      bW(G, c + s * 0.8, y, c + u, 0.05, 0.12, 0.18, QW2);
    }
  }
  qDoor(G, c, c + 0.836, true, 1, { y: 0.14, w: 0.4, h: 0.62, wood: 1 });
  bW(G, c, D, c, 1.92, 0.1, 1.92, QW3);
  bW(G, c, D - 0.1, c, 1.7, 0.1, 1.7, QW2);
  for (const s of [-1, 1]) {
    bW(G, c, D + 0.1, c + s * 0.94, 1.92, 0.38, 0.05, QW1);
    bW(G, c + s * 0.94, D + 0.1, c, 0.05, 0.38, 1.92, QW1);
    bW(G, c, D + 0.48, c + s * 0.945, 1.96, 0.06, 0.06, QW2);
    bW(G, c + s * 0.945, D + 0.48, c, 0.06, 0.06, 1.96, QW2);
  }
  if (!op) {
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, c + a * 0.28, D + 0.1, c + b * 0.28, 0.09, 0.9, 0.09, QLOG);
    bW(G, c, D + 0.1, c, 0.4, 0.5, 0.4, QW1);
    const t = qPyr(G, c, c, D + 1.0, 0.86, 0.86, QSH, 0.1, 0.04);
    qFlag(G, c, t, c, 0.6);
  }
  qLamp(G, c + 0.5, 1.2, c + 0.86, false);
  qLamp(G, c - 0.5, 1.2, c + 0.86, false);
  return toGeo(G);
}

/* garrison height of a building: where its men really stand */
export function gtopOf(s) {
  const st = s.tier !== 0;
  if (s.type === "wall") return st ? WALLH + 0.07 : WDH + 0.06;
  if (s.type === "gate") return (s.gl || 2) === 3 ? (st ? 2.72 : 2.05) : 2.1;
  if (s.type === "tower") return s.sz === 2 ? (st ? TT2S : TT2W + 0.02) : st ? 3.28 : 3.2;
  return GTOP[s.type] || 2;
}

/* ---- towers ---- */
function qArms(G, m, H) {
  for (const [bit, dx, dz] of DIRS)
    if (m & bit) {
      for (let k = 0; k < 5; k++)
        qab(bS, G, dx, dz, 0.4, 0, (k * H) / 5, 0.2, 2 * WT, H / 5, k === 0 ? QSD : QS[k % 4]);
      qab(bS, G, dx, dz, 0.4, 0, H, 0.2, 2 * WT + 0.04, 0.07, QTR);
      for (const l of [1, -1]) {
        qab(bS, G, dx, dz, 0.4, l * (WT - 0.05), H + 0.07, 0.12, 0.1, 0.2, QS[0]);
        qab(bS, G, dx, dz, 0.4, l * (WT - 0.05), H + 0.27, 0.13, 0.11, 0.035, QTR);
      }
    }
}

export function towerGeo(m, op) {
  const G = newG();
  qArms(G, m, 1.5);
  qPlinth(G, 0, 0, 0, 1.0, 1.0, 0.16);
  qStone(G, 0, 0.2, 0, 0.8, 0.8, 2.66, { moss: 1 });
  qQuoin(G, -0.4, -0.4, 0.4, 0.4, 0.2, 2.66);
  for (const [a, b] of [
    [0, 0.4],
    [0, -0.4],
    [0.4, 0],
    [-0.4, 0],
  ]) {
    const z = Math.abs(b) > 0;
    qSlit(G, a + (z ? 0.2 : 0), 1.25, b, z);
    qSlit(G, a, 2.25, b + (z ? 0 : 0.2), z);
  }
  bW(G, 0, 0.2, 0.405, 0.28, 0.48, 0.03, QW1);
  bS(G, 0, 0.68, 0.405, 0.38, 0.06, 0.05, QTR);
  bS(G, 0, 0.74, 0.41, 0.1, 0.07, 0.05, QTR);
  bM(G, 0.08, 0.42, 0.425, 0.035, 0.035, 0.02, QBR);
  qRing(G, 0, 0, 1.72, 0.86, 0.05, QBR, bM);
  bS(G, 0, 2.86, 0, 0.92, 0.08, 0.92, QSD);
  for (const [a, b] of [
    [-0.42, -0.42],
    [0.42, -0.42],
    [-0.42, 0.42],
    [0.42, 0.42],
    [0, -0.44],
    [0, 0.44],
    [-0.44, 0],
    [0.44, 0],
  ])
    bS(G, a, 2.74, b, 0.1, 0.14, 0.1, QSD);
  bS(G, 0, 2.94, 0, 1.04, 0.1, 1.04, QS[0]);
  bS(G, 0, 3.04, 0, 1.06, 0.2, 1.06, QS[1]);
  qCornice(G, 0, 3.24, 0, 1.1, 1.1, 0.05);
  if (op) {
    [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ].forEach(([a, b]) => {
      bS(G, a, 3.29, b, 0.14, 0.18, 0.14, QS[0]);
      bS(G, a, 3.47, b, 0.16, 0.03, 0.16, QTR);
    });
  } else {
    for (const [a, b] of [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
      [0, -0.45],
      [0, 0.45],
      [-0.45, 0],
      [0.45, 0],
    ]) {
      bS(G, a, 3.29, b, 0.16, 0.2, 0.16, QS[0]);
      bS(G, a, 3.49, b, 0.18, 0.03, 0.18, QTR);
    }
    bC(G, 0, 3.52, 0, 1.12, 0.06, 1.12, structureModelsState.BLU);
    bM(G, 0, 3.58, 0, 1.1, 0.03, 1.1, QBR);
    const t = qPyr(G, 0, 0, 3.61, 1.06, 1.06, QSL, 0.2, 0.1);
    bM(G, 0, t, 0, 0.08, 0.1, 0.08, QBR2);
    qFlag(G, 0, t + 0.1, 0, 0.62);
  }
  qLamp(G, 0, 1.0, 0.48, true);
  return toGeo(G);
}

export function woodTowerGeo(m, op) {
  const G = newG();
  for (const [bit, dx, dz] of DIRS)
    if (m & bit) {
      for (let k = 0; k < 2; k++) {
        const t = 0.42;
        for (const l of [-0.09, 0.09]) {
          const x = dx ? dx * t : l,
            z = dz ? dz * t : l;
          bW(G, x, 0, z, 0.16, WH - 0.05 + (k ? 0.1 : 0), 0.16, QLOG);
        }
      }
      qab(bP, G, dx, dz, 0.42, 0, 0.42, 0.18, 0.46, 0.06, QIR);
      qab(bP, G, dx, dz, 0.42, 0, 1.12, 0.18, 0.46, 0.06, QIR);
    }
  bS(G, 0, 0, 0, 0.96, 0.14, 0.96, QSD);
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    bW(G, a * 0.36, 0.14, b * 0.36, 0.16, 2.96, 0.16, QLOG);
    bP(G, a * 0.36, 0.6, b * 0.36, 0.18, 0.04, 0.18, QIR);
    bP(G, a * 0.36, 1.9, b * 0.36, 0.18, 0.04, 0.18, QIR);
  }
  for (const [a, b, ax] of [
    [0, 0.37, 1],
    [0, -0.37, 1],
    [0.37, 0, 0],
    [-0.37, 0, 0],
  ]) {
    bW(G, a, 0.14, b, ax ? 0.58 : 0.04, 1.06, ax ? 0.04 : 0.58, QW1);
    bW(G, a, 1.2, b, ax ? 0.6 : 0.05, 0.07, ax ? 0.05 : 0.6, QW2);
    bW(G, a, 2.1, b, ax ? 0.6 : 0.05, 0.07, ax ? 0.05 : 0.6, QW2);
  }
  for (const [a, b, ax] of [
    [0, 0.37, 1],
    [0, -0.37, 1],
    [0.37, 0, 0],
    [-0.37, 0, 0],
  ])
    for (let s = 0; s < 4; s++) {
      const u = -0.22 + s * 0.15,
        y = 1.3 + s * 0.18;
      bW(G, ax ? a + u : a, y, ax ? b : b + u, ax ? 0.14 : 0.04, 0.16, ax ? 0.04 : 0.14, QW2);
    }
  bW(G, -0.09, 0.14, 0.41, 0.03, 2.9, 0.03, QW3);
  bW(G, 0.09, 0.14, 0.41, 0.03, 2.9, 0.03, QW3);
  for (let y = 0.35; y < 3; y += 0.22) bW(G, 0, y, 0.415, 0.18, 0.03, 0.03, QW3);
  bW(G, 0, 2.98, 0, 0.9, 0.1, 0.9, QW2);
  bW(G, 0, 3.08, 0, 1.14, 0.12, 1.14, QW3);
  for (const [a, b] of [
    [-0.54, -0.54],
    [0.54, -0.54],
    [-0.54, 0.54],
    [0.54, 0.54],
    [0, -0.54],
    [0, 0.54],
    [-0.54, 0],
    [0.54, 0],
  ])
    bW(G, a, 3.2, b, 0.07, 0.32, 0.07, QW2);
  for (const s of [-1, 1]) {
    bW(G, s * 0.54, 3.44, 0, 0.05, 0.05, 1.1, QW3);
    bW(G, 0, 3.44, s * 0.54, 1.1, 0.05, 0.05, QW3);
  }
  if (!op) {
    for (const [a, b] of [
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5],
    ])
      bW(G, a, 3.2, b, 0.08, 0.72, 0.08, QLOG);
    const t = qPyr(G, 0, 0, 3.9, 1.3, 1.3, QTC, 0.17, 0.1);
    qFlag(G, 0, t, 0, 0.6);
  }
  qLamp(G, 0.3, 1.1, 0.46, false);
  return toGeo(G);
}

/* ---- gates ---- */
export function gateGeo() {
  const G = newG();
  [-1, 1].forEach((sg) => {
    const x = sg * 0.74;
    qPlinth(G, x, 0, 0, 0.62, 0.92, 0.14);
    qStone(G, x, 0.18, 0, 0.52, 0.84, 2.02, { moss: 1, ph: sg > 0 ? 1 : 0 });
    qQuoin(G, x - 0.26, -0.42, x + 0.26, 0.42, 0.18, 2.02);
    qCornice(G, x, 2.2, 0, 0.6, 0.92, 0.08);
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      bS(G, x + a * 0.2, 2.28, b * 0.37, 0.15, 0.24, 0.15, QS[0]);
      bS(G, x + a * 0.2, 2.52, b * 0.37, 0.17, 0.035, 0.17, QTR);
    }
    qSlit(G, sg * 1.005, 1.2, 0, false);
    qLamp(G, x - sg * 0.3, 1.32, 0.47, true);
    qLamp(G, x - sg * 0.3, 1.32, -0.47, true);
    qGem(G, x, 1.86, 0.425, true, 1, 0.08);
    qGem(G, x, 1.86, -0.425, true, -1, 0.08);
  });
  qStone(G, 0, 1.42, 0, 0.96, 0.84, 0.52, { ph: 2 });
  bP(G, 0, 1.36, 0, 0.96, 0.06, 0.12, "#1b1a20");
  [-1, 1].forEach((sg) => {
    bS(G, sg * 0.42, 1.26, 0, 0.12, 0.16, 0.84, QTR);
    bS(G, sg * 0.34, 1.34, 0, 0.08, 0.08, 0.84, QTR);
  });
  qCornice(G, 0, 1.94, 0, 0.96, 0.9, 0.1);
  [-0.34, 0, 0.34].forEach((x) => {
    bS(G, x, 2.04, 0.37, 0.14, 0.22, 0.14, QS[0]);
    bS(G, x, 2.04, -0.37, 0.14, 0.22, 0.14, QS[0]);
    bS(G, x, 2.26, 0.37, 0.16, 0.03, 0.16, QTR);
    bS(G, x, 2.26, -0.37, 0.16, 0.03, 0.16, QTR);
  });
  qBan(G, 0, 1.9, 0.42, true, 1, 0.28, 0.42);
  qBan(G, 0, 1.9, -0.42, true, -1, 0.28, 0.42);
  bS(G, 0, 0, 0, 1.0, 0.05, 0.84, QSD2);
  return toGeo(G);
}

export function woodGateGeo() {
  const G = newG();
  [-1, 1].forEach((sg) => {
    const x = sg * 0.78;
    for (const [a, b] of [
      [-0.1, -0.2],
      [0.1, -0.2],
      [-0.1, 0.2],
      [0.1, 0.2],
    ]) {
      const h = 2.35 + (a + b > 0 ? 0.08 : 0);
      bW(G, x + a, 0, b, 0.17, h, 0.17, QLOG);
      bW(G, x + a, h, b, 0.12, 0.07, 0.12, QLOGT);
      bW(G, x + a, h + 0.07, b, 0.06, 0.06, 0.06, QLOGT);
    }
    for (const y of [0.5, 1.4]) bP(G, x, y, 0, 0.42, 0.07, 0.52, QIR);
    qLamp(G, x - sg * 0.26, 1.12, 0.32, false);
    qLamp(G, x - sg * 0.26, 1.12, -0.32, false);
  });
  bW(G, 0, 1.42, 0, 1.2, 0.16, 0.5, QW2);
  bW(G, 0, 1.58, 0, 1.16, 0.3, 0.46, QLOG);
  bW(G, 0, 1.88, 0, 1.3, 0.08, 0.56, QW3);
  for (let i = 0; i < 7; i++) {
    const x = -0.6 + i * 0.2;
    bW(G, x, 1.96, 0.24, 0.12, 0.3 + (i % 2) * 0.08, 0.08, QLOG);
    bW(G, x, 1.96, -0.24, 0.12, 0.3 + ((i + 1) % 2) * 0.08, 0.08, QLOG);
  }
  qBan(G, 0, 1.56, 0.25, true, 1, 0.26, 0.36);
  qBan(G, 0, 1.56, -0.25, true, -1, 0.26, 0.36);
  bP(G, 0, 0, 0, 1.0, 0.05, 0.84, "#6a5a3a");
  return toGeo(G);
}

export function doorGeo() {
  const G = newG(),
    w = 0.92;
  for (let k = 0; k < 9; k++) {
    const x = -w / 2 + 0.05 + (k * (w - 0.1)) / 8;
    bP(G, x, -1.3, 0, 0.045, 1.28, 0.05, QIR);
    bM(G, x, -1.4, 0, 0.03, 0.1, 0.03, QBR);
  }
  for (const y of [-1.15, -0.75, -0.35]) bP(G, 0, y, 0, w, 0.045, 0.06, QIR);
  bM(G, 0, -0.06, 0, w, 0.06, 0.07, QBR);
  return toGeo(G);
}

export function doorGeoW() {
  const G = newG(),
    w = 0.92;
  for (let k = 0; k < 6; k++) {
    const x = -w / 2 + w / 12 + (k * w) / 6;
    bW(G, x, -1.3, 0, w / 6 - 0.01, 1.3, 0.07, k % 2 ? QW1 : QW3);
  }
  bW(G, 0, -1.3, 0, 0.03, 1.3, 0.09, QW2);
  for (const y of [-1.1, -0.42]) bP(G, 0, y, 0, w, 0.07, 0.09, QIR);
  for (const x of [-0.12, 0.12]) bM(G, x, -0.72, 0.05, 0.05, 0.05, 0.03, QBR);
  return toGeo(G);
}
