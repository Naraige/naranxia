import { newG, toGeo } from "../geometry.js";
import {
  bC,
  bL,
  bM,
  bP,
  bR,
  bS,
  bW,
  qBan,
  qBarrel,
  QBR,
  QBR2,
  qChim,
  qCone,
  qCornice,
  qCrate,
  QCU,
  qDoor,
  QFI,
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
  qRoof,
  qRound,
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
  qWheel,
} from "./building-parts.js";
import { structureModelsState } from "./structures.js";
import { PXON } from "./units.js";

/* ================= ROUND 4b: the castle, rebuilt the Minecraft way (square towers, chunky crenels, steep block roofs) =================
   A = square fortress: curtain walls, four square corner towers, a keep with a steep slate roof, a gatehouse with a portcullis
   B = great keep: one massive square keep with four corner turrets and a stepped slate spire, low walls and corner towers
   front = +z, the 5 x 5 tiles go from 0 to 5; C5.flag = where the animated flag stands */
/* wood or stone: the same castle A in logs and planks for the wooden tier */
let PXCW = false;

const pS = (G, x, y, z, w, h, d, c) =>
  PXCW ? bW(G, x, y, z, w, h, d, c === QTR || c === QSD2 ? QW3 : c === QS[1] ? QLOG : QW2) : bS(G, x, y, z, w, h, d, c);

const pSt = (G, x, y0, z, w, d, h, o) => {
  if (!PXCW) return qStone(G, x, y0, z, w, d, h, o);
  const n = Math.max(1, Math.round(h / 0.2)),
    q = h / n;
  for (let k = 0; k < n; k++) bW(G, x, y0 + k * q, z, w, q, d, k % 2 ? QW1 : QW2);
};

const pQu = (G, x0, z0, x1, z1, y0, h) => {
  if (!PXCW) return qQuoin(G, x0, z0, x1, z1, y0, h);
};

function pxCastleMer(G, x0, z0, x1, z1, y, s) {
  s = s || 0.26;
  const put = (x, z) => {
    pS(G, x, y, z, s, s, s, QS[1]);
    pS(G, x, y + s, z, s + 0.03, 0.03, s + 0.03, QTR);
  };
  const nx = Math.max(1, Math.round((x1 - x0) / (s * 2))),
    nz = Math.max(1, Math.round((z1 - z0) / (s * 2)));
  for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx;
    put(x, z0);
    put(x, z1);
  }
  for (let j = 1; j < nz; j++) {
    const z = z0 + ((z1 - z0) * j) / nz;
    put(x0, z);
    put(x1, z);
  }
}

function pxCastleGate(G, gz1) {
  const ax0 = 2.5,
    aw = 0.82,
    ah = 1.25,
    az = gz1 + 0.005;
  bP(G, ax0, 0.2, az - 0.02, aw, ah, 0.06, "#18171c");
  bP(G, ax0, 0.2 + ah, az - 0.02, aw * 0.6, 0.12, 0.06, "#18171c");
  for (const s of [-1, 1]) {
    pS(G, ax0 + s * (aw / 2 + 0.06), 0.2, az, 0.12, ah + 0.12, 0.06, QTR);
  }
  pS(G, ax0, 0.32 + ah, az, aw + 0.24, 0.14, 0.06, QTR);
  for (let i = 0; i < 6; i++)
    bP(G, ax0 - aw / 2 + 0.08 + (i * (aw - 0.16)) / 5, 0.6, az - 0.035, 0.03, ah - 0.42, 0.03, QIR);
  for (const y of [0.75, 1.15]) bP(G, ax0, y, az - 0.035, aw - 0.06, 0.03, 0.03, QIR);
  pS(G, ax0, 0.2, az + 0.14, aw + 0.3, 0.04, 0.3, QSD2);
  for (const s of [-1, 1]) qLamp(G, 2.5 + s * 0.62, 1.45, gz1 + 0.1, true);
}

function pxCastleA(wood) {
  PXCW = !!wood;
  const G = newG();
  qPlinth(G, 2.5, 0, 2.5, 5, 5, 0.2);
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) pS(G, 0.25 + i * 0.5, 0.2, 0.25 + j * 0.5, 0.49, 0.025, 0.49, QS[(i * 3 + j * 5) % 4]);
  const WT = 2.3,
    TH = 0.5;
  const cw = (x, z, w, d) => {
    pSt(G, x, 0.2, z, w, d, WT - 0.2, { moss: 1 });
    pS(G, x, WT, z, w + 0.06, 0.08, d + 0.06, QTR);
  };
  cw(2.5, 0.3, 3.4, TH);
  cw(0.3, 2.5, TH, 3.4);
  cw(4.7, 2.5, TH, 3.4);
  cw(1.05, 4.7, 1.1, TH);
  cw(3.95, 4.7, 1.1, TH);
  pxCastleMer(G, 0.9, 0.08, 4.1, 0.08, WT + 0.08);
  pxCastleMer(G, 0.08, 0.9, 0.08, 4.1, WT + 0.08);
  pxCastleMer(G, 4.92, 0.9, 4.92, 4.1, WT + 0.08);
  for (const z of [1.4, 2.5, 3.6]) {
    qSlit(G, 0.045, 1.2, z, false);
    qSlit(G, 4.955, 1.2, z, false);
  }
  /* square corner towers with a cornice, chunky crenels, banners on the front pair */
  for (const [x, z] of [
    [0.65, 0.65],
    [4.35, 0.65],
    [0.65, 4.35],
    [4.35, 4.35],
  ]) {
    const bk = z < 2.5,
      H = bk ? 3.9 : 3.4,
      W = 1.25,
      ox = x < 2.5 ? -1 : 1,
      oz = z < 2.5 ? -1 : 1;
    qPlinth(G, x, 0, z, W + 0.12, W + 0.12, 0.2);
    pSt(G, x, 0.2, z, W, W, H - 0.2, { moss: 1, ph: bk ? 1 : 0 });
    pQu(G, x - W / 2, z - W / 2, x + W / 2, z + W / 2, 0.2, H - 0.2);
    pS(G, x, H, z, W + 0.18, 0.12, W + 0.18, QTR);
    pS(G, x, H + 0.12, z, W + 0.1, 0.06, W + 0.1, QSD2);
    pxCastleMer(G, x - W / 2 - 0.04, z - W / 2 - 0.04, x + W / 2 + 0.04, z + W / 2 + 0.04, H + 0.12, 0.28);
    qSlit(G, x + ox * (W / 2 + 0.005), 1.3, z, false);
    qSlit(G, x, 1.3, z + oz * (W / 2 + 0.005), true);
    qWin(G, x + ox * (W / 2 + 0.012), 2.6, z, false, ox, { w: 0.16, h: 0.24, glow: 1 });
    qWin(G, x, 2.6, z + oz * (W / 2 + 0.012), true, oz, { w: 0.16, h: 0.24, glow: 1 });
    if (!bk) qBan(G, x, H - 0.95, z + W / 2 + 0.03, true, 1, 0.36, 0.8);
    else qFlag(G, x, H + 0.18, z, 0.8);
  }
  /* keep: square, steep slate gable roof with dormers, banners, a door */
  const kx = 2.5,
    kz = 1.75,
    KW = 2.2,
    KD = 1.9,
    KH = 3.9;
  qPlinth(G, kx, 0.2, kz, KW + 0.12, KD + 0.12, 0.12);
  pSt(G, kx, 0.32, kz, KW, KD, KH - 0.32, { ph: 1 });
  pQu(G, kx - KW / 2, kz - KD / 2, kx + KW / 2, kz + KD / 2, 0.32, KH - 0.32);
  pS(G, kx, KH, kz, KW + 0.16, 0.1, KD + 0.16, QTR);
  for (const [x, z, ax, n] of [
    [kx, kz + KD / 2, true, 1],
    [kx + KW / 2, kz, false, 1],
    [kx - KW / 2, kz, false, -1],
  ]) {
    const L = ax ? KW : KD;
    for (const o of [-0.3, 0.3]) {
      const w = o * L;
      qWin(G, ax ? x + w : x + n * 0.012, 2.7, ax ? z + n * 0.012 : z + w, ax, n, { w: 0.18, h: 0.34, glow: 1 });
    }
  }
  qDoor(G, kx, kz + KD / 2 + 0.016, true, 1, { y: 0.32, w: 0.5, h: 0.8, wood: 1 });
  qBan(G, kx - 0.7, 1.6, kz + KD / 2 + 0.04, true, 1, 0.3, 0.7);
  qBan(G, kx + 0.7, 1.6, kz + KD / 2 + 0.04, true, 1, 0.3, 0.7);
  const rt = qRoof(G, kx, kz, KW + 0.1, KD + 0.1, KH + 0.1, PXCW ? QSH : QSL, true, { rise: 0.3, run: 0.17 });
  C5.flag = (typeof rt === "number" ? rt : KH + 1.9) + 0.05;
  C5.wflag = C5.flag;
  pS(G, kx - 0.55, KH + 0.1, kz + 0.5, 0.1, 0.9, 0.1, QSD);
  qFlag(G, kx, C5.flag - 0.05, kz, 0.9);
  /* gatehouse: a square block over the gate, crenellated, the arms of the kingdom */
  const gz0 = 4.15,
    gz1 = 5.05,
    GH = 3.0,
    gzc = (gz0 + gz1) / 2;
  pSt(G, 2.5, 0.2, gzc, 1.9, gz1 - gz0, GH - 0.2, { moss: 1, ph: 2 });
  pQu(G, 1.55, gz0, 3.45, gz1, 0.2, GH - 0.2);
  pS(G, 2.5, GH, gzc, 2.06, 0.12, gz1 - gz0 + 0.12, QTR);
  pxCastleMer(G, 1.5, gz0 - 0.02, 3.5, gz1 + 0.04, GH + 0.12, 0.26);
  pxCastleGate(G, gz1);
  qBan(G, 2.5, 1.75, gz1 + 0.04, true, 1, 0.4, 0.75);
  qBarrel(G, 3.3, 3.2, 0.22);
  qBarrel(G, 3.5, 3.0, 0.22);
  qCrate(G, 1.6, 3.0, 0.22, 0.26);
  for (const [x, z] of [
    [1.6, 3.9],
    [3.4, 3.9],
  ])
    qPost(G, x, 0.22, z, 0.55, true);
  /* courtyard life: a covered well, a hay cart; the keep's chimney smokes */
  {
    const wx = 1.25,
      wz = 3.5;
    qRound(G, wx, wz, 0.22, 0.26, 0.5);
    bP(G, wx, 0.46, wz, 0.3, 0.02, 0.3, "#2a4a7a");
    for (const s of [-1, 1]) bW(G, wx + s * 0.22, 0.22, wz, 0.05, 0.72, 0.05, QW2);
    bW(G, wx, 0.86, wz, 0.5, 0.05, 0.06, QW2);
    qPyr(G, wx, wz, 0.92, 0.62, 0.44, PXCW ? QSH : QSL, 0.09, 0.09);
    bP(G, wx, 0.6, wz, 0.012, 0.26, 0.012, "#d9c28a");
    bW(G, wx, 0.52, wz, 0.08, 0.08, 0.08, QW1);
  }
  {
    const hx = 3.7,
      hz = 3.6;
    bW(G, hx, 0.36, hz, 0.5, 0.05, 0.34, QW1);
    bC(G, hx, 0.41, hz, 0.44, 0.2, 0.3, "#d8b23a");
    qWheel(G, hx - 0.12, 0.34, hz + 0.19, 0.12, true);
    qWheel(G, hx - 0.12, 0.34, hz - 0.19, 0.12, true);
    bW(G, hx + 0.36, 0.36, hz, 0.3, 0.03, 0.04, QW3);
  }
  qChim(G, kx + 0.72, kz + 0.34, KH + 0.1, 1.72);
  return toGeo(G);
}

function pxCastleB() {
  const G = newG();
  qPlinth(G, 2.5, 0, 2.5, 5, 5, 0.2);
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) bS(G, 0.25 + i * 0.5, 0.2, 0.25 + j * 0.5, 0.49, 0.025, 0.49, QS[(i * 3 + j * 5) % 4]);
  const WT = 1.7,
    TH = 0.4;
  const cw = (x, z, w, d) => {
    qStone(G, x, 0.2, z, w, d, WT - 0.2, { moss: 1 });
    bS(G, x, WT, z, w + 0.06, 0.08, d + 0.06, QTR);
  };
  cw(2.5, 0.22, 3.8, TH);
  cw(0.22, 2.5, TH, 3.8);
  cw(4.78, 2.5, TH, 3.8);
  cw(1.0, 4.78, 1.2, TH);
  cw(4.0, 4.78, 1.2, TH);
  pxCastleMer(G, 0.8, 0.04, 4.2, 0.04, WT + 0.08, 0.24);
  pxCastleMer(G, 0.04, 0.8, 0.04, 4.2, WT + 0.08, 0.24);
  pxCastleMer(G, 4.96, 0.8, 4.96, 4.2, WT + 0.08, 0.24);
  for (const [x, z] of [
    [0.5, 0.5],
    [4.5, 0.5],
    [0.5, 4.5],
    [4.5, 4.5],
  ]) {
    const W = 0.95,
      H = 2.5;
    qStone(G, x, 0.2, z, W, W, H - 0.2, { moss: 1 });
    bS(G, x, H, z, W + 0.14, 0.1, W + 0.14, QTR);
    pxCastleMer(G, x - W / 2 - 0.03, z - W / 2 - 0.03, x + W / 2 + 0.03, z + W / 2 + 0.03, H + 0.1, 0.24);
  }
  /* the great keep */
  const kx = 2.5,
    kz = 2.2,
    KW = 2.7,
    KH = 4.6;
  qPlinth(G, kx, 0.2, kz, KW + 0.14, KW + 0.14, 0.14);
  qStone(G, kx, 0.34, kz, KW, KW, KH - 0.34, { ph: 1 });
  qQuoin(G, kx - KW / 2, kz - KW / 2, kx + KW / 2, kz + KW / 2, 0.34, KH - 0.34);
  for (const y of [1.6, 3.1]) bS(G, kx, y, kz, KW + 0.08, 0.08, KW + 0.08, QTR);
  bS(G, kx, KH, kz, KW + 0.2, 0.12, KW + 0.2, QTR);
  pxCastleMer(G, kx - KW / 2 - 0.06, kz - KW / 2 - 0.06, kx + KW / 2 + 0.06, kz + KW / 2 + 0.06, KH + 0.12, 0.3);
  for (const [x, z, ax, n] of [
    [kx, kz + KW / 2, true, 1],
    [kx, kz - KW / 2, true, -1],
    [kx + KW / 2, kz, false, 1],
    [kx - KW / 2, kz, false, -1],
  ]) {
    for (const o of [-0.65, 0, 0.65]) {
      qWin(G, ax ? x + o : x + n * 0.012, 3.55, ax ? z + n * 0.012 : z + o, ax, n, { w: 0.18, h: 0.36, glow: 1 });
    }
    qWin(G, ax ? x - 0.6 : x + n * 0.012, 2.1, ax ? z + n * 0.012 : z - 0.6, ax, n, { w: 0.16, h: 0.3, glow: 1 });
    qWin(G, ax ? x + 0.6 : x + n * 0.012, 2.1, ax ? z + n * 0.012 : z + 0.6, ax, n, { w: 0.16, h: 0.3, glow: 1 });
  }
  qDoor(G, kx, kz + KW / 2 + 0.016, true, 1, { y: 0.34, w: 0.56, h: 0.86, wood: 1 });
  qBan(G, kx - 0.85, 2.3, kz + KW / 2 + 0.04, true, 1, 0.34, 0.9);
  qBan(G, kx + 0.85, 2.3, kz + KW / 2 + 0.04, true, 1, 0.34, 0.9);
  /* corner turrets with stepped slate roofs, the stepped spire in the middle */
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const x = kx + a * (KW / 2 - 0.05),
      z = kz + b * (KW / 2 - 0.05),
      W = 0.72,
      H = KH + 0.9;
    qStone(G, x, KH - 0.4, z, W, W, H - KH + 0.4, { ph: 2 });
    bS(G, x, H, z, W + 0.12, 0.08, W + 0.12, QTR);
    qPyr(G, x, z, H + 0.08, W + 0.16, W + 0.16, QSL, 0.16, 0.09);
  }
  const sb = KH + 0.12,
    SW = 1.3;
  qStone(G, kx, sb, kz, SW, SW, 0.9, { ph: 1 });
  for (const [x, z, ax, n] of [
    [kx, kz + SW / 2, true, 1],
    [kx + SW / 2, kz, false, 1],
    [kx - SW / 2, kz, false, -1],
    [kx, kz - SW / 2, true, -1],
  ])
    qWin(G, x + (ax ? 0 : n * 0.012), sb + 0.3, z + (ax ? n * 0.012 : 0), ax, n, { w: 0.2, h: 0.36, glow: 1 });
  const kt = qPyr(G, kx, kz, sb + 0.9, SW + 0.2, SW + 0.2, QSL, 0.2, 0.1);
  C5.flag = (typeof kt === "number" ? kt : sb + 2.2) + 0.05;
  qFlag(G, kx, C5.flag - 0.05, kz, 0.9);
  /* small gatehouse */
  const gz0 = 4.35,
    gz1 = 5.05,
    GH = 2.3;
  qStone(G, 2.5, 0.2, (gz0 + gz1) / 2, 1.7, gz1 - gz0, GH - 0.2, { moss: 1 });
  bS(G, 2.5, GH, (gz0 + gz1) / 2, 1.84, 0.1, gz1 - gz0 + 0.12, QTR);
  pxCastleMer(G, 1.62, gz0, 3.38, gz1 + 0.03, GH + 0.1, 0.24);
  pxCastleGate(G, gz1);
  return toGeo(G);
}

/* ---- castle helpers: round masonry from three boxes (a near-circular outline), smooth cones, merlon rings ---- */
export function qCyl(G, f, x, z, y0, h, D, c) {
  f(G, x, y0, z, D, h, D * 0.4, c);
  f(G, x, y0, z, D * 0.4, h, D, c);
  f(G, x, y0, z, D * 0.72, h, D * 0.72, c);
}

export function qTowR(G, x, z, y0, h, D, o) {
  o = o || {};
  const n = Math.max(1, Math.round(h / 0.21)),
    q = h / n;
  for (let k = 0; k < n; k++) qCyl(G, bS, x, z, y0 + k * q, q, D, o.moss && k === 0 ? QMS : QS[(k + (o.ph | 0)) % 4]);
}

export function qSpire(G, x, z, y0, D, H, cols, o) {
  o = o || {};
  const n = Math.max(3, Math.round(H / 0.1)),
    q = H / n,
    b = o.band || 2;
  qCyl(G, bR, x, z, y0 - 0.05, 0.07, D + 0.1, o.eave || cols[0]);
  for (let k = 0; k < n; k++) {
    const w = Math.max(0.05, D * (1 - (k + 0.35) / n)),
      c = cols[((k / b) | 0) % cols.length];
    if (o.sq) bR(G, x, y0 + k * q, z, w, q, w, c);
    else qCyl(G, bR, x, z, y0 + k * q, q, w, c);
  }
  return y0 + H;
}

export function qCorbR(G, x, z, y, D, n) {
  for (let k = 0; k < n; k++) {
    const a = ((k + 0.5) / n) * 6.2832,
      r = D / 2 - 0.01,
      px = x + Math.cos(a) * r,
      pz = z + Math.sin(a) * r;
    bS(G, px, y - 0.13, pz, 0.09, 0.13, 0.09, QSD);
    bS(G, px, y - 0.2, pz, 0.06, 0.07, 0.06, QSD2);
  }
}

export function qMerlL(G, x0, z0, x1, z1, y, h, step) {
  const L = Math.hypot(x1 - x0, z1 - z0),
    n = Math.max(1, Math.round(L / step));
  for (let k = 0; k <= n; k += 2) {
    const t = k / n,
      px = x0 + (x1 - x0) * t,
      pz = z0 + (z1 - z0) * t;
    bS(G, px, y, pz, 0.14, h, 0.14, QS[(k / 2) % 2]);
    bS(G, px, y + h, pz, 0.16, 0.03, 0.16, QTR);
  }
}

/* ---- castle (stone): a tall keep with a lantern belfry under a copper spire, four round towers with slate cones,
   crenellated curtain walls and a gatehouse with a portcullis; front = +z ---- */
export function castleGeo() {
  const G = newG();
  qPlinth(G, 1.5, 0, 1.5, 3, 3, 0.2);
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 6; j++) bS(G, 0.25 + i * 0.5, 0.2, 0.25 + j * 0.5, 0.49, 0.025, 0.49, QS[(i * 3 + j * 5) % 4]);
  const WT = 2.3;
  /* curtain walls between the towers (the gatehouse closes the front) */
  const cw = (x, z, w, d, _ax) => {
    qStone(G, x, 0.2, z, w, d, WT - 0.2, { moss: 1 });
    qCornice(G, x, WT, z, w + 0.05, d + 0.05, 0.07);
    bS(G, x, WT + 0.07, z, w, 0.025, d, QSD2);
  };
  cw(1.5, 0.2, 1.3, 0.3);
  cw(0.2, 1.5, 0.3, 1.3);
  cw(2.8, 1.5, 0.3, 1.3);
  qMerlL(G, 0.9, 0.09, 2.1, 0.09, WT + 0.07, 0.22, 0.15);
  qMerlL(G, 0.09, 0.9, 0.09, 2.1, WT + 0.07, 0.22, 0.15);
  qMerlL(G, 2.91, 0.9, 2.91, 2.1, WT + 0.07, 0.22, 0.15);
  for (const z of [1.2, 1.8]) (qSlit(G, 0.045, 1.2, z, false), qSlit(G, 2.955, 1.2, z, false));
  /* round corner towers: the back pair taller */
  for (const [x, z] of [
    [0.46, 0.46],
    [2.54, 0.46],
    [0.46, 2.54],
    [2.54, 2.54],
  ]) {
    const bk = z < 1.5,
      Ht = bk ? 3.55 : 3.05,
      D = 0.92,
      ox = x < 1.5 ? -1 : 1,
      oz = z < 1.5 ? -1 : 1;
    qCyl(G, bS, x, z, 0, 0.22, D + 0.12, QSD);
    qTowR(G, x, z, 0.2, Ht - 0.2, D, { moss: 1, ph: bk ? 1 : 0 });
    qCyl(G, bM, x, z, 1.75, 0.05, D + 0.02, QBR);
    qCorbR(G, x, z, Ht + 0.02, D + 0.14, 10);
    qTowR(G, x, z, Ht, 0.32, D + 0.14, { ph: 2 });
    qCyl(G, bS, x, z, Ht + 0.32, 0.05, D + 0.18, QTR);
    qCyl(G, bC, x, z, Ht + 0.37, 0.05, D + 0.16, structureModelsState.BLU);
    const t = qSpire(G, x, z, Ht + 0.42, D + 0.12, bk ? 1.85 : 1.6, QSL, { band: 2, eave: "#4c4846" });
    bM(G, x, t, z, 0.08, 0.1, 0.08, QBR2);
    bP(G, x, t + 0.1, z, 0.035, 0.42, 0.035, QIR);
    bM(G, x, t + 0.5, z, 0.06, 0.06, 0.06, QBR2);
    qSlit(G, x + ox * (D / 2 + 0.005), 1.25, z, false);
    qSlit(G, x, 1.25, z + oz * (D / 2 + 0.005), true);
    qSlit(G, x + ox * (D / 2 + 0.005), 2.35, z, false);
    qSlit(G, x, 2.35, z + oz * (D / 2 + 0.005), true);
    qWin(G, x + ox * (D / 2 + 0.075), Ht + 0.08, z, false, ox, { w: 0.11, h: 0.16, glow: 1 });
    qWin(G, x, Ht + 0.08, z + oz * (D / 2 + 0.075), true, oz, { w: 0.11, h: 0.16, glow: 1 });
  }
  /* keep */
  const kx = 1.5,
    kz = 1.18,
    KW = 1.34,
    KD = 1.3,
    KH = 4.45;
  qPlinth(G, kx, 0.2, kz, KW + 0.1, KD + 0.1, 0.1);
  qStone(G, kx, 0.3, kz, KW, KD, KH - 0.3, { ph: 1 });
  qQuoin(G, kx - KW / 2, kz - KD / 2, kx + KW / 2, kz + KD / 2, 0.3, KH - 0.3);
  qCornice(G, kx, 2.62, kz, KW + 0.06, KD + 0.06, 0.06);
  for (let i = 0; i < 7; i++) {
    const a = -KW / 2 + 0.1 + (i * (KW - 0.2)) / 6;
    bS(G, kx + a, KH - 0.14, kz + KD / 2 + 0.04, 0.09, 0.14, 0.09, QSD);
    bS(G, kx + a, KH - 0.14, kz - KD / 2 - 0.04, 0.09, 0.14, 0.09, QSD);
    const b = -KD / 2 + 0.1 + (i * (KD - 0.2)) / 6;
    bS(G, kx + KW / 2 + 0.04, KH - 0.14, kz + b, 0.09, 0.14, 0.09, QSD);
    bS(G, kx - KW / 2 - 0.04, KH - 0.14, kz + b, 0.09, 0.14, 0.09, QSD);
  }
  qStone(G, kx, KH, kz, KW + 0.14, KD + 0.14, 0.24, { ph: 3 });
  qCornice(G, kx, KH + 0.24, kz, KW + 0.18, KD + 0.18, 0.05);
  bC(G, kx, KH + 0.29, kz, KW + 0.12, 0.04, KD + 0.12, structureModelsState.BLU);
  qMerl(G, kx - KW / 2 - 0.06, kz - KD / 2 - 0.06, kx + KW / 2 + 0.06, kz + KD / 2 + 0.06, KH + 0.29, 0.2, 0.28);
  for (const [x, z, ax, n] of [
    [kx, kz + KD / 2, true, 1],
    [kx, kz - KD / 2, true, -1],
    [kx + KW / 2, kz, false, 1],
    [kx - KW / 2, kz, false, -1],
  ]) {
    qWin(G, ax ? x - 0.3 : x + n * 0.01, 3.12, ax ? z + n * 0.01 : z - 0.3, ax, n, { w: 0.15, h: 0.34, glow: 1 });
    qWin(G, ax ? x + 0.3 : x + n * 0.01, 3.12, ax ? z + n * 0.01 : z + 0.3, ax, n, { w: 0.15, h: 0.34, glow: 1 });
    qGem(G, ax ? x : x + n * 0.012, 3.62, ax ? z + n * 0.012 : z, ax, n, 0.1);
    qSlit(G, ax ? x : x + n * 0.005, 1.9, ax ? z + n * 0.005 : z, ax);
  }
  /* belfry lantern and copper spire */
  const by = KH + 0.29,
    BW = 0.74;
  qStone(G, kx, by, kz, BW, BW, 0.95, { ph: 1 });
  for (const [x, z, ax, n] of [
    [kx, kz + BW / 2, true, 1],
    [kx, kz - BW / 2, true, -1],
    [kx + BW / 2, kz, false, 1],
    [kx - BW / 2, kz, false, -1],
  ])
    qWin(G, x + (ax ? 0 : n * 0.01), by + 0.32, z + (ax ? n * 0.01 : 0), ax, n, { w: 0.2, h: 0.34, glow: 1 });
  qCornice(G, kx, by + 0.95, kz, BW + 0.14, BW + 0.14, 0.07);
  bM(G, kx, by + 1.02, kz, BW + 0.1, 0.03, BW + 0.1, QBR);
  const kt = qPyr(G, kx, kz, by + 1.05, BW + 0.12, BW + 0.12, QCU, 0.19, 0.042);
  bM(G, kx, kt, kz, 0.1, 0.12, 0.1, QBR2);
  bP(G, kx, kt + 0.12, kz, 0.04, 0.7, 0.04, QIR);
  bM(G, kx, kt + 0.82, kz, 0.07, 0.07, 0.07, QBR2);
  /* gatehouse */
  const gz0 = 2.42,
    gz1 = 3.0,
    gx0 = 0.9,
    gx1 = 2.1,
    GH = 2.78,
    gzc = (gz0 + gz1) / 2,
    GW = gx1 - gx0,
    GD = gz1 - gz0;
  qStone(G, 1.5, 0.2, gzc, GW, GD, GH - 0.2, { moss: 1, ph: 2 });
  qQuoin(G, gx0, gz0, gx1, gz1, 0.2, GH - 0.2);
  for (let i = 0; i < 6; i++) {
    const a = gx0 + 0.1 + (i * (GW - 0.2)) / 5;
    bS(G, a, GH - 0.14, gz1 + 0.04, 0.09, 0.14, 0.09, QSD);
    bS(G, a, GH - 0.2, gz1 + 0.04, 0.06, 0.06, 0.06, QSD2);
  }
  qStone(G, 1.5, GH, gzc + 0.02, GW + 0.04, GD + 0.1, 0.18, { ph: 1 });
  qCornice(G, 1.5, GH + 0.18, gzc + 0.02, GW + 0.08, GD + 0.14, 0.05);
  qMerlL(G, gx0 + 0.02, gz1 + 0.04, gx1 - 0.02, gz1 + 0.04, GH + 0.23, 0.22, 0.14);
  qMerlL(G, gx0 + 0.02, gz0 + 0.02, gx1 - 0.02, gz0 + 0.02, GH + 0.23, 0.22, 0.14);
  /* the arch: dark opening, stone voussoirs, raised portcullis and oak doors inside */
  const ax0 = 1.5,
    aw = 0.6,
    ah = 1.0,
    az = gz1 + 0.005;
  bP(G, ax0, 0.2, az - 0.02, aw, ah, 0.06, "#18171c");
  bP(G, ax0, 0.2 + ah, az - 0.02, aw * 0.78, 0.07, 0.06, "#18171c");
  bP(G, ax0, 0.27 + ah, az - 0.02, aw * 0.5, 0.06, 0.06, "#18171c");
  for (const s of [-1, 1]) {
    bS(G, ax0 + s * (aw / 2 + 0.05), 0.2, az, 0.1, ah, 0.05, QTR);
    bS(G, ax0 + s * (aw / 2 + 0.01), 0.2 + ah, az, 0.1, 0.08, 0.05, QTR);
    bS(G, ax0 + s * (aw * 0.3), 0.27 + ah, az, 0.12, 0.07, 0.05, QTR);
  }
  bS(G, ax0, 0.33 + ah, az, aw * 0.44, 0.07, 0.05, QTR);
  bS(G, ax0, 0.4 + ah, az + 0.005, 0.1, 0.09, 0.06, QTR);
  bW(G, ax0, 0.2, az - 0.1, aw - 0.02, ah - 0.02, 0.04, QW1);
  for (const a of [-aw / 4, 0, aw / 4]) bW(G, ax0 + a, 0.2, az - 0.075, 0.02, ah - 0.04, 0.01, QW2);
  bP(G, ax0, 0.45, az - 0.07, aw - 0.04, 0.03, 0.01, QIR);
  bP(G, ax0, 0.95, az - 0.07, aw - 0.04, 0.03, 0.01, QIR);
  for (let i = 0; i < 6; i++)
    bP(G, ax0 - aw / 2 + 0.06 + (i * (aw - 0.12)) / 5, 0.75, az - 0.035, 0.022, ah - 0.48, 0.022, QIR);
  bP(G, ax0, 0.75, az - 0.035, aw - 0.04, 0.022, 0.022, QIR);
  for (let i = 0; i < 6; i++)
    bM(G, ax0 - aw / 2 + 0.06 + (i * (aw - 0.12)) / 5, 0.7, az - 0.035, 0.03, 0.05, 0.03, QBR);
  bS(G, ax0, 0.2, az + 0.12, aw + 0.24, 0.04, 0.26, QSD2);
  qBan(G, 1.5, 2.42, gz1 + 0.04, true, 1, 0.34, 0.62);
  qGem(G, 1.5, 2.52, gz1 + 0.03, true, 1, 0.09);
  for (const s of [-1, 1]) {
    qLamp(G, 1.5 + s * 0.45, 1.36, gz1 + 0.1, true);
    qSlit(G, 1.5 + s * 0.42, 1.9, gz1 + 0.005, true);
  }
  return toGeo(G);
}

/* ---- castle (wood): a sharpened-log palisade, four watchtowers under shingle roofs, a gate with a fighting platform,
   and a timber great hall under a steep thatch roof ---- */
const QTH = ["#c9a35c", "#b8924c", "#d4b06c"];
export const QSH = ["#6e5236", "#5e4630", "#7a5c3c"];

export function woodCastleGeo() {
  const G = newG();
  bP(G, 1.5, 0, 1.5, 3, 0.2, 3, "#5a4a32");
  bP(G, 1.5, 0.2, 1.5, 2.92, 0.06, 2.92, "#75664a");
  const pal = (x, z, h) => {
    bW(G, x, 0.26, z, 0.21, h, 0.21, QLOG);
    bW(G, x, 0.26 + h, z, 0.14, 0.08, 0.14, QLOGT);
    bW(G, x, 0.34 + h, z, 0.07, 0.09, 0.07, QLOGT);
  };
  const hh = (i) => 1.4 + ((i * 7) % 3) * 0.09;
  for (let i = 0; i < 10; i++) {
    const t = 0.15 + i * 0.3;
    pal(t, 0.13, hh(i));
    if (t < 2.2) (pal(0.13, t, hh(i + 2)), pal(2.87, t, hh(i + 4)));
  }
  for (const t of [0.93, 2.07]) pal(t, 2.87, hh(t > 1.5 ? 1 : 3));
  for (const y of [0.6, 1.22]) {
    bP(G, 1.5, y, 0.13, 2.94, 0.06, 0.26, QIR);
    bP(G, 0.13, y, 1.2, 0.26, 0.06, 2.0, QIR);
    bP(G, 2.87, y, 1.2, 0.26, 0.06, 2.0, QIR);
  }
  /* front watchtowers */
  for (const x of [0.42, 2.58]) {
    const z = 2.58,
      P = 1.95;
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, x + a * 0.31, 0.2, z + b * 0.31, 0.16, P + 0.6, 0.16, QLOG);
    for (const y of [0.8, 1.45])
      for (const s of [-1, 1]) {
        bW(G, x + s * 0.31, y, z, 0.06, 0.06, 0.6, QW2);
        bW(G, x, y, z + s * 0.31, 0.6, 0.06, 0.06, QW2);
      }
    bW(G, x, P, z, 0.88, 0.1, 0.88, QW3);
    bW(G, x, P - 0.08, z, 0.72, 0.08, 0.72, QW2);
    for (const s of [-1, 1]) {
      bW(G, x + s * 0.41, P + 0.1, z, 0.05, 0.4, 0.82, QW1);
      bW(G, x, P + 0.1, z + s * 0.41, 0.82, 0.4, 0.05, QW1);
      bW(G, x + s * 0.415, P + 0.4, z, 0.05, 0.06, 0.86, QW2);
      bW(G, x, P + 0.4, z + s * 0.415, 0.86, 0.06, 0.05, QW2);
    }
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, x + a * 0.39, P + 0.5, z + b * 0.39, 0.07, 0.36, 0.07, QLOG);
    const t = qPyr(G, x, z, P + 0.84, 1.08, 1.08, QSH, 0.095, 0.032);
    bW(G, x, t, z, 0.1, 0.12, 0.1, QW2);
    qLamp(G, x, P + 0.74, z, false);
  }
  /* gate: two big posts, a fighting platform with a little roof, oak doors */
  for (const s of [-1, 1]) {
    const x = 1.5 + s * 0.47;
    bW(G, x, 0.2, 2.86, 0.24, 2.1, 0.24, QLOG);
    bW(G, x, 2.3, 2.86, 0.18, 0.08, 0.18, QLOGT);
    qLamp(G, x + s * 0.2, 1.15, 3.02, false);
  }
  bW(G, 1.5, 1.58, 2.86, 1.22, 0.14, 0.36, QW2);
  bW(G, 1.5, 1.72, 2.86, 1.3, 0.06, 0.42, QW3);
  for (let i = 0; i < 6; i++) bW(G, 1.04 + i * 0.184, 1.78, 3.03, 0.08, 0.26 + (i % 2) * 0.05, 0.06, QLOG);
  qRoof(G, 1.5, 2.86, 1.18, 0.5, 2.08, QSH, true, { rise: 0.14, run: 0.16, fill: QW1 });
  for (const s of [-1, 1]) {
    bW(G, 1.5 + s * 0.18, 0.26, 2.88, 0.34, 1.3, 0.08, QW1);
    for (const y of [0.5, 1.2]) bP(G, 1.5 + s * 0.18, y, 2.93, 0.34, 0.06, 0.03, QIR);
  }
  bW(G, 1.5, 0.26, 2.92, 0.03, 1.3, 0.05, QW2);
  qBan(G, 1.5, 1.56, 3.06, true, 1, 0.28, 0.4);
  /* yard */
  qBarrel(G, 0.95, 2.2, 0.26);
  qBarrel(G, 1.12, 2.32, 0.26);
  qCrate(G, 2.05, 2.25, 0.26, 0.22);
  qCrate(G, 2.0, 2.27, 0.48, 0.16);
  /* great hall: log walls, a steep thatch roof, crossed gable boards */
  const x0 = 0.52,
    x1 = 2.48,
    z0 = 0.42,
    z1 = 1.74,
    zc = (z0 + z1) / 2;
  qStone(G, 1.5, 0.26, zc, x1 - x0 + 0.06, z1 - z0 + 0.06, 0.22);
  for (let k = 0; k < 7; k++) {
    const y = 0.48 + k * 0.155,
      c = k % 2 ? QLOG : "#5d3f25";
    bW(G, 1.5, y, z1 - 0.045, x1 - x0, 0.15, 0.09, c);
    bW(G, 1.5, y, z0 + 0.045, x1 - x0, 0.15, 0.09, c);
    bW(G, x0 + 0.045, y, zc, 0.09, 0.15, z1 - z0, c);
    bW(G, x1 - 0.045, y, zc, 0.09, 0.15, z1 - z0, c);
  }
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    bW(G, x, 0.48, z, 0.16, 1.1, 0.16, QLOGT);
  qDoor(G, 1.5, z1 + 0.016, true, 1, { y: 0.48, w: 0.34, h: 0.6, wood: 1, lamp: 1 });
  for (const x of [0.92, 2.08]) qWin(G, x, 0.86, z1 + 0.016, true, 1, { wood: 1, shut: 1, glow: 1 });
  qWin(G, x0 - 0.016, 0.86, zc, false, -1, { wood: 1, shut: 1, glow: 1 });
  qWin(G, x1 + 0.016, 0.86, zc, false, 1, { wood: 1, shut: 1, glow: 1 });
  const rt = qRoof(G, 1.5, zc, x1 - x0, z1 - z0, 1.565, QTH, true, {
    rise: 0.2,
    run: 0.115,
    fill: "#e2cfa4",
    ov0: 0.14,
    ov1: 0.14,
    side: 0.16,
    ridge: QW2,
  });
  for (const s of [-1, 1]) {
    const gx = 1.5 + s * ((x1 - x0) / 2 + 0.14);
    for (const d of [-1, 1]) {
      bW(G, gx, rt - 0.2, zc + d * 0.1, 0.06, 0.34, 0.06, QW2);
      bW(G, gx, rt + 0.12, zc + d * 0.17, 0.06, 0.12, 0.06, QW3);
    }
  }
  qChim(G, 2.12, 0.78, 1.4, rt - 1.25);
  /* lookout tower rising through the roof */
  const tx = 1.5,
    tz = 0.95,
    TW2 = 0.72,
    TB = 2.75;
  bW(G, tx, 1.5, tz, TW2, TB - 1.5, TW2, QW1);
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    bW(G, tx + (a * TW2) / 2, 1.5, tz + (b * TW2) / 2, 0.12, TB - 1.5 + 0.06, 0.12, QLOG);
  for (const y of [2.1, 2.7]) bW(G, tx, y, tz, TW2 + 0.04, 0.06, TW2 + 0.04, QW2);
  qWin(G, tx, 2.24, tz + TW2 / 2 + 0.012, true, 1, { wood: 1, glow: 1 });
  qWin(G, tx + TW2 / 2 + 0.012, 2.24, tz, false, 1, { wood: 1, glow: 1 });
  qWin(G, tx - TW2 / 2 - 0.012, 2.24, tz, false, -1, { wood: 1, glow: 1 });
  bW(G, tx, TB, tz, TW2 + 0.24, 0.1, TW2 + 0.24, QW3);
  for (const s of [-1, 1]) {
    bW(G, tx + s * 0.46, TB + 0.1, tz, 0.05, 0.34, 0.96, QW1);
    bW(G, tx, TB + 0.1, tz + s * 0.46, 0.96, 0.34, 0.05, QW1);
  }
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    bW(G, tx + a * 0.45, TB + 0.44, tz + b * 0.45, 0.07, 0.36, 0.07, QLOG);
  qLamp(G, tx, TB + 0.66, tz, false);
  const tt = qPyr(G, tx, tz, TB + 0.78, 1.16, 1.16, QSH, 0.1, 0.03);
  bW(G, tx, tt, tz, 0.1, 0.1, 0.1, QW2);
  qFlag(G, tx, tt + 0.08, tz, 0.85);
  return toGeo(G);
}

/* ---- keep (four merged towers) ---- */
/* ---- castle 5x5 (stone): a tall keep with a copper spire at the back, four round corner towers, square flank towers,
   crenellated curtain walls with a wall walk, a twin-turret gatehouse and a lived-in courtyard; front = +z ---- */
export const C5 = { kx: 2.5, kz: 1.6, flag: 8.9, wflag: 6.2 };

export function castleGeo5() {
  if (PXON) return (window.__CV === "B" ? pxCastleB : pxCastleA)(false);
  const G = newG();
  qPlinth(G, 2.5, 0, 2.5, 5, 5, 0.2);
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) bS(G, 0.25 + i * 0.5, 0.2, 0.25 + j * 0.5, 0.49, 0.025, 0.49, QS[(i * 3 + j * 5) % 4]);
  const WT = 2.5,
    TH = 0.42;
  const cw = (x, z, w, d) => {
    qStone(G, x, 0.2, z, w, d, WT - 0.2, { moss: 1 });
    qCornice(G, x, WT, z, w + 0.05, d + 0.05, 0.07);
    bS(G, x, WT + 0.07, z, w - 0.04, 0.025, d - 0.04, QSD2);
  };
  cw(2.5, 0.22, 3.6, TH);
  cw(0.22, 2.5, TH, 3.6);
  cw(4.78, 2.5, TH, 3.6);
  cw(1.08, 4.78, 1.0, TH);
  cw(3.92, 4.78, 1.0, TH);
  /* merlons on the outer edge only, so the wall walk stays clear */
  qMerlL(G, 0.95, 0.06, 4.05, 0.06, WT + 0.07, 0.24, 0.16);
  qMerlL(G, 0.06, 0.95, 0.06, 4.05, WT + 0.07, 0.24, 0.16);
  qMerlL(G, 4.94, 0.95, 4.94, 4.05, WT + 0.07, 0.24, 0.16);
  qMerlL(G, 0.95, 4.94, 1.55, 4.94, WT + 0.07, 0.24, 0.16);
  qMerlL(G, 3.45, 4.94, 4.05, 4.94, WT + 0.07, 0.24, 0.16);
  for (const z of [1.3, 2.5, 3.7]) {
    qSlit(G, 0.005, 1.3, z, false);
    qSlit(G, 4.995, 1.3, z, false);
  }
  for (const x of [1.6, 3.4]) qSlit(G, x, 1.3, 0.005, true);
  /* round corner towers, the back pair taller */
  for (const [x, z] of [
    [0.6, 0.6],
    [4.4, 0.6],
    [0.6, 4.4],
    [4.4, 4.4],
  ]) {
    const bk = z < 2.5,
      Ht = bk ? 4.0 : 3.5,
      D = 1.15,
      ox = x < 2.5 ? -1 : 1,
      oz = z < 2.5 ? -1 : 1;
    qCyl(G, bS, x, z, 0, 0.22, D + 0.14, QSD);
    qTowR(G, x, z, 0.2, Ht - 0.2, D, { moss: 1, ph: bk ? 1 : 0 });
    qCyl(G, bM, x, z, 2.0, 0.05, D + 0.02, QBR);
    qCorbR(G, x, z, Ht + 0.02, D + 0.16, 12);
    qTowR(G, x, z, Ht, 0.34, D + 0.16, { ph: 2 });
    qCyl(G, bS, x, z, Ht + 0.34, 0.05, D + 0.2, QTR);
    qCyl(G, bC, x, z, Ht + 0.39, 0.05, D + 0.18, structureModelsState.BLU);
    const t = qSpire(G, x, z, Ht + 0.44, D + 0.14, bk ? 2.0 : 1.75, QSL, { band: 2, eave: "#4c4846" });
    bM(G, x, t, z, 0.08, 0.1, 0.08, QBR2);
    bP(G, x, t + 0.1, z, 0.035, 0.42, 0.035, QIR);
    bM(G, x, t + 0.5, z, 0.06, 0.06, 0.06, QBR2);
    qSlit(G, x + ox * (D / 2 + 0.005), 1.3, z, false);
    qSlit(G, x, 1.3, z + oz * (D / 2 + 0.005), true);
    qSlit(G, x + ox * (D / 2 + 0.005), 2.6, z, false);
    qSlit(G, x, 2.6, z + oz * (D / 2 + 0.005), true);
    qWin(G, x + ox * (D / 2 + 0.085), Ht + 0.08, z, false, ox, { w: 0.12, h: 0.17, glow: 1 });
    qWin(G, x, Ht + 0.08, z + oz * (D / 2 + 0.085), true, oz, { w: 0.12, h: 0.17, glow: 1 });
  }
  /* square flank towers in the middle of each side wall */
  for (const s of [-1, 1]) {
    const x = 2.5 + s * 2.28,
      z = 2.5,
      W = 0.86,
      H = 3.05;
    qPlinth(G, x, 0, z, W + 0.12, W + 0.12, 0.2);
    qStone(G, x, 0.2, z, W, W, H - 0.2, { moss: 1, ph: 1 });
    qQuoin(G, x - W / 2, z - W / 2, x + W / 2, z + W / 2, 0.2, H - 0.2);
    qCornice(G, x, H, z, W + 0.08, W + 0.08, 0.06);
    qMerl(G, x - W / 2 - 0.02, z - W / 2 - 0.02, x + W / 2 + 0.02, z + W / 2 + 0.02, H + 0.06, 0.2, 0.26);
    qSlit(G, x + s * (W / 2 + 0.005), 1.5, z, false);
    qSlit(G, x + s * (W / 2 + 0.005), 2.4, z, false);
    qWin(G, x - s * (W / 2 + 0.012), 2.2, z, false, -s, { w: 0.14, h: 0.26, glow: 1 });
  }
  /* keep */
  const kx = C5.kx,
    kz = C5.kz,
    KW = 2.0,
    KD = 1.8,
    KH = 5.0;
  qPlinth(G, kx, 0.2, kz, KW + 0.12, KD + 0.12, 0.12);
  qStone(G, kx, 0.32, kz, KW, KD, KH - 0.32, { ph: 1 });
  qQuoin(G, kx - KW / 2, kz - KD / 2, kx + KW / 2, kz + KD / 2, 0.32, KH - 0.32);
  qCornice(G, kx, 2.9, kz, KW + 0.06, KD + 0.06, 0.06);
  for (let i = 0; i < 9; i++) {
    const a = -KW / 2 + 0.1 + (i * (KW - 0.2)) / 8;
    bS(G, kx + a, KH - 0.14, kz + KD / 2 + 0.04, 0.09, 0.14, 0.09, QSD);
    bS(G, kx + a, KH - 0.14, kz - KD / 2 - 0.04, 0.09, 0.14, 0.09, QSD);
    const b = -KD / 2 + 0.1 + (i * (KD - 0.2)) / 8;
    bS(G, kx + KW / 2 + 0.04, KH - 0.14, kz + b, 0.09, 0.14, 0.09, QSD);
    bS(G, kx - KW / 2 - 0.04, KH - 0.14, kz + b, 0.09, 0.14, 0.09, QSD);
  }
  qStone(G, kx, KH, kz, KW + 0.14, KD + 0.14, 0.26, { ph: 3 });
  qCornice(G, kx, KH + 0.26, kz, KW + 0.18, KD + 0.18, 0.05);
  bC(G, kx, KH + 0.31, kz, KW + 0.12, 0.04, KD + 0.12, structureModelsState.BLU);
  qMerl(G, kx - KW / 2 - 0.06, kz - KD / 2 - 0.06, kx + KW / 2 + 0.06, kz + KD / 2 + 0.06, KH + 0.31, 0.22, 0.28);
  for (const [x, z, ax, n] of [
    [kx, kz + KD / 2, true, 1],
    [kx, kz - KD / 2, true, -1],
    [kx + KW / 2, kz, false, 1],
    [kx - KW / 2, kz, false, -1],
  ]) {
    const L = ax ? KW : KD;
    for (const o of [-0.5, 0, 0.5]) {
      const w = o * L * 0.62;
      qWin(G, ax ? x + w : x + n * 0.01, 3.35, ax ? z + n * 0.01 : z + w, ax, n, { w: 0.16, h: 0.36, glow: 1 });
    }
    qWin(G, ax ? x - 0.4 : x + n * 0.01, 1.6, ax ? z + n * 0.01 : z - 0.4, ax, n, { w: 0.15, h: 0.3, glow: 1 });
    qWin(G, ax ? x + 0.4 : x + n * 0.01, 1.6, ax ? z + n * 0.01 : z + 0.4, ax, n, { w: 0.15, h: 0.3, glow: 1 });
    qGem(G, ax ? x : x + n * 0.012, 4.25, ax ? z + n * 0.012 : z, ax, n, 0.12);
  }
  qDoor(G, kx, kz + KD / 2 + 0.016, true, 1, { y: 0.32, w: 0.5, h: 0.78 });
  qBan(G, kx - 0.62, 3.0, kz + KD / 2 + 0.04, true, 1, 0.3, 0.7);
  qBan(G, kx + 0.62, 3.0, kz + KD / 2 + 0.04, true, 1, 0.3, 0.7);
  /* bartizans on the keep corners */
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const x = kx + (a * KW) / 2,
      z = kz + (b * KD) / 2;
    qCorbR(G, x, z, KH - 0.3, 0.5, 6);
    qTowR(G, x, z, KH - 0.3, 0.7, 0.46, { ph: 1 });
    const t = qSpire(G, x, z, KH + 0.4, 0.52, 0.7, QSL, { band: 2, eave: "#4c4846" });
    bM(G, x, t, z, 0.05, 0.06, 0.05, QBR2);
  }
  /* belfry and copper spire */
  const by = KH + 0.31,
    BW = 0.9;
  qStone(G, kx, by, kz, BW, BW, 1.05, { ph: 1 });
  for (const [x, z, ax, n] of [
    [kx, kz + BW / 2, true, 1],
    [kx, kz - BW / 2, true, -1],
    [kx + BW / 2, kz, false, 1],
    [kx - BW / 2, kz, false, -1],
  ])
    qWin(G, x + (ax ? 0 : n * 0.01), by + 0.34, z + (ax ? n * 0.01 : 0), ax, n, { w: 0.22, h: 0.38, glow: 1 });
  qCornice(G, kx, by + 1.05, kz, BW + 0.14, BW + 0.14, 0.07);
  bM(G, kx, by + 1.12, kz, BW + 0.1, 0.03, BW + 0.1, QBR);
  const kt = qPyr(G, kx, kz, by + 1.15, BW + 0.14, BW + 0.14, QCU, 0.19, 0.045);
  bM(G, kx, kt, kz, 0.1, 0.12, 0.1, QBR2);
  bP(G, kx, kt + 0.12, kz, 0.04, 0.6, 0.04, QIR);
  bM(G, kx, kt + 0.72, kz, 0.07, 0.07, 0.07, QBR2);
  C5.flag = kt + 0.8;
  /* gatehouse with two round turrets */
  const gx0 = 1.6,
    gx1 = 3.4,
    gz0 = 4.2,
    gz1 = 5.04,
    GH = 3.1,
    gzc = (gz0 + gz1) / 2,
    GW = gx1 - gx0,
    GD = gz1 - gz0;
  qStone(G, 2.5, 0.2, gzc, GW, GD, GH - 0.2, { moss: 1, ph: 2 });
  qQuoin(G, gx0, gz0, gx1, gz1, 0.2, GH - 0.2);
  for (let i = 0; i < 8; i++) {
    const a = gx0 + 0.1 + (i * (GW - 0.2)) / 7;
    bS(G, a, GH - 0.14, gz1 + 0.04, 0.09, 0.14, 0.09, QSD);
  }
  qStone(G, 2.5, GH, gzc + 0.02, GW + 0.04, GD + 0.1, 0.18, { ph: 1 });
  qCornice(G, 2.5, GH + 0.18, gzc + 0.02, GW + 0.08, GD + 0.14, 0.05);
  qMerlL(G, gx0 + 0.02, gz1 + 0.04, gx1 - 0.02, gz1 + 0.04, GH + 0.23, 0.22, 0.15);
  qMerlL(G, gx0 + 0.02, gz0 + 0.02, gx1 - 0.02, gz0 + 0.02, GH + 0.23, 0.22, 0.15);
  for (const s of [-1, 1]) {
    const x = 2.5 + s * 1.0,
      z = gz1 - 0.05,
      D = 0.62,
      H = 3.5;
    qTowR(G, x, z, 0.2, H - 0.2, D, { moss: 1, ph: 1 });
    qCorbR(G, x, z, H, D + 0.1, 8);
    qTowR(G, x, z, H, 0.26, D + 0.1, { ph: 2 });
    const t = qSpire(G, x, z, H + 0.26, D + 0.1, 1.1, QSL, { band: 2, eave: "#4c4846" });
    bM(G, x, t, z, 0.06, 0.08, 0.06, QBR2);
    qSlit(G, x, 1.6, z + D / 2 + 0.005, true);
    qSlit(G, x, 2.6, z + D / 2 + 0.005, true);
  }
  const ax0 = 2.5,
    aw = 0.82,
    ah = 1.25,
    az = gz1 + 0.005;
  bP(G, ax0, 0.2, az - 0.02, aw, ah, 0.06, "#18171c");
  bP(G, ax0, 0.2 + ah, az - 0.02, aw * 0.78, 0.08, 0.06, "#18171c");
  bP(G, ax0, 0.28 + ah, az - 0.02, aw * 0.5, 0.07, 0.06, "#18171c");
  for (const s of [-1, 1]) {
    bS(G, ax0 + s * (aw / 2 + 0.05), 0.2, az, 0.1, ah, 0.05, QTR);
    bS(G, ax0 + s * (aw / 2 + 0.01), 0.2 + ah, az, 0.1, 0.09, 0.05, QTR);
    bS(G, ax0 + s * (aw * 0.3), 0.29 + ah, az, 0.13, 0.08, 0.05, QTR);
  }
  bS(G, ax0, 0.35 + ah, az, aw * 0.44, 0.08, 0.05, QTR);
  bS(G, ax0, 0.43 + ah, az + 0.005, 0.12, 0.1, 0.06, QTR);
  bW(G, ax0, 0.2, az - 0.1, aw - 0.02, ah - 0.02, 0.04, QW1);
  for (const a of [-aw / 3, 0, aw / 3]) bW(G, ax0 + a, 0.2, az - 0.075, 0.02, ah - 0.04, 0.01, QW2);
  bP(G, ax0, 0.5, az - 0.07, aw - 0.04, 0.03, 0.01, QIR);
  bP(G, ax0, 1.1, az - 0.07, aw - 0.04, 0.03, 0.01, QIR);
  for (let i = 0; i < 7; i++)
    bP(G, ax0 - aw / 2 + 0.07 + (i * (aw - 0.14)) / 6, 0.95, az - 0.035, 0.022, ah - 0.6, 0.022, QIR);
  bP(G, ax0, 0.95, az - 0.035, aw - 0.04, 0.022, 0.022, QIR);
  bS(G, ax0, 0.2, az + 0.14, aw + 0.3, 0.04, 0.3, QSD2);
  qBan(G, 2.5, 2.9, gz1 + 0.04, true, 1, 0.38, 0.7);
  qGem(G, 2.5, 2.0, gz1 + 0.03, true, 1, 0.1);
  for (const s of [-1, 1]) qLamp(G, 2.5 + s * 0.58, 1.5, gz1 + 0.1, true);
  /* courtyard: a well, a smithy lean-to, stacked supplies, a cart and lamp posts */
  {
    const x = 1.35,
      z = 3.35;
    qCyl(G, bS, x, z, 0.22, 0.32, 0.5, QSD);
    qCyl(G, bP, x, z, 0.5, 0.03, 0.34, "#2a4a6a");
    for (const s of [-1, 1]) bW(G, x + s * 0.22, 0.54, z, 0.05, 0.5, 0.05, QW2);
    bW(G, x, 1.04, z, 0.56, 0.05, 0.08, QW2);
    qPyr(G, x, z, 1.09, 0.62, 0.36, QSL, 0.08, 0.06);
    bP(G, x, 0.6, z, 0.02, 0.44, 0.02, "#c8b890");
    bW(G, x, 0.58, z, 0.1, 0.1, 0.1, QW3);
  }
  {
    const x = 3.75,
      z = 3.4;
    bW(G, x, 0.22, z - 0.36, 1.0, 1.0, 0.06, QW1);
    for (const s of [-1, 1]) bW(G, x + s * 0.46, 0.22, z + 0.1, 0.07, 0.8, 0.07, QW2);
    qRoof(G, x, z - 0.02, 1.05, 0.82, 1.02, QTC, true, { rise: 0.1, run: 0.2, g0: false, g1: false });
    bS(G, x - 0.2, 0.22, z - 0.1, 0.36, 0.3, 0.3, QSD);
    bL(G, x - 0.2, 0.52, z - 0.1, 0.16, 0.06, 0.16, QFI);
    bM(G, x + 0.22, 0.22, z, 0.12, 0.24, 0.12, QIR);
    bM(G, x + 0.22, 0.46, z, 0.3, 0.06, 0.14, QIR);
  }
  qBarrel(G, 3.2, 3.05, 0.22);
  qBarrel(G, 3.35, 2.85, 0.22);
  qCrate(G, 1.7, 2.75, 0.22, 0.26);
  qCrate(G, 1.72, 2.78, 0.48, 0.18);
  {
    const x = 3.15,
      z = 3.75;
    bW(G, x, 0.32, z, 0.46, 0.08, 0.28, QW3);
    for (const s of [-1, 1]) qCyl(G, bW, x + s * 0.16, z - 0.18, 0.2, 0.06, 0.22, QW2);
    bW(G, x, 0.34, z + 0.3, 0.04, 0.04, 0.4, QW2);
  }
  for (const [x, z] of [
    [1.7, 4.05],
    [3.3, 4.05],
  ])
    qPost(G, x, 0.22, z, 0.55, true);
  return toGeo(G);
}

/* ---- castle 5x5 (wood): sharpened-log palisade with a wall walk, four watchtowers, a gate with a fighting platform,
   a great hall with a lookout tower and a busy yard; front = +z ---- */
export function woodCastleGeo5() {
  if (PXON && window.__CV !== "B") {
    const r = pxCastleA(true);
    PXCW = false;
    return r;
  }
  const G = newG();
  bP(G, 2.5, 0, 2.5, 5, 0.2, 5, "#5a4a32");
  bP(G, 2.5, 0.2, 2.5, 4.92, 0.06, 4.92, "#75664a");
  const pal = (x, z, h) => {
    bW(G, x, 0.26, z, 0.21, h, 0.21, QLOG);
    bW(G, x, 0.26 + h, z, 0.14, 0.08, 0.14, QLOGT);
    bW(G, x, 0.34 + h, z, 0.07, 0.09, 0.07, QLOGT);
  };
  const hh = (i) => 1.75 + ((i * 7) % 3) * 0.1;
  for (let i = 0; i < 17; i++) {
    const t = 0.14 + i * 0.295;
    pal(t, 0.13, hh(i));
    if (t > 0.6 && t < 4.4) {
      pal(0.13, t, hh(i + 2));
      pal(4.87, t, hh(i + 4));
    }
    if ((t < 1.75 || t > 3.25) && t > 0.6 && t < 4.4) pal(t, 4.87, hh(i + 1));
  }
  for (const y of [0.62, 1.38]) {
    bP(G, 2.5, y, 0.13, 4.9, 0.06, 0.26, QIR);
    bP(G, 0.13, y, 2.5, 0.26, 0.06, 4.0, QIR);
    bP(G, 4.87, y, 2.5, 0.26, 0.06, 4.0, QIR);
  }
  /* wall walk inside the palisade */
  for (const [x, z, w, d] of [
    [2.5, 0.42, 4.2, 0.32],
    [0.42, 2.5, 0.32, 3.8],
    [4.58, 2.5, 0.32, 3.8],
  ]) {
    bW(G, x, 1.5, z, w, 0.07, d, QW3);
    for (let k = 0; k < 7; k++) {
      const t = k / 6 - 0.5;
      bW(G, w > d ? x + t * w * 0.95 : x, 0.26, w > d ? z : z + t * d * 0.95, 0.09, 1.24, 0.09, QW2);
    }
  }
  /* corner watchtowers */
  for (const [x, z] of [
    [0.5, 0.5],
    [4.5, 0.5],
    [0.5, 4.5],
    [4.5, 4.5],
  ]) {
    const P = 2.25;
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, x + a * 0.34, 0.2, z + b * 0.34, 0.17, P + 0.62, 0.17, QLOG);
    for (const y of [0.85, 1.6])
      for (const s of [-1, 1]) {
        bW(G, x + s * 0.34, y, z, 0.06, 0.06, 0.66, QW2);
        bW(G, x, y, z + s * 0.34, 0.66, 0.06, 0.06, QW2);
      }
    bW(G, x, P, z, 0.96, 0.1, 0.96, QW3);
    bW(G, x, P - 0.08, z, 0.78, 0.08, 0.78, QW2);
    for (const s of [-1, 1]) {
      bW(G, x + s * 0.45, P + 0.1, z, 0.05, 0.42, 0.9, QW1);
      bW(G, x, P + 0.1, z + s * 0.45, 0.9, 0.42, 0.05, QW1);
      bW(G, x + s * 0.455, P + 0.42, z, 0.05, 0.06, 0.94, QW2);
      bW(G, x, P + 0.42, z + s * 0.455, 0.94, 0.06, 0.05, QW2);
    }
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, x + a * 0.43, P + 0.52, z + b * 0.43, 0.07, 0.4, 0.07, QLOG);
    const t = qPyr(G, x, z, P + 0.9, 1.18, 1.18, QSH, 0.1, 0.034);
    bW(G, x, t, z, 0.1, 0.12, 0.1, QW2);
    qLamp(G, x, P + 0.8, z, false);
  }
  /* gate */
  for (const s of [-1, 1]) {
    const x = 2.5 + s * 0.72;
    bW(G, x, 0.2, 4.86, 0.3, 2.5, 0.3, QLOG);
    bW(G, x, 2.7, 4.86, 0.22, 0.09, 0.22, QLOGT);
    qLamp(G, x + s * 0.24, 1.3, 5.04, false);
  }
  bW(G, 2.5, 1.85, 4.86, 1.7, 0.15, 0.42, QW2);
  bW(G, 2.5, 2.0, 4.86, 1.8, 0.06, 0.48, QW3);
  for (let i = 0; i < 9; i++) bW(G, 1.7 + i * 0.2, 2.06, 5.06, 0.09, 0.28 + (i % 2) * 0.06, 0.06, QLOG);
  qRoof(G, 2.5, 4.86, 1.7, 0.56, 2.42, QSH, true, { rise: 0.15, run: 0.16, fill: QW1 });
  for (const s of [-1, 1]) {
    bW(G, 2.5 + s * 0.27, 0.26, 4.88, 0.52, 1.5, 0.08, QW1);
    for (const y of [0.55, 1.35]) bP(G, 2.5 + s * 0.27, y, 4.93, 0.5, 0.06, 0.03, QIR);
  }
  bW(G, 2.5, 0.26, 4.92, 0.03, 1.5, 0.05, QW2);
  qBan(G, 2.5, 1.84, 5.07, true, 1, 0.3, 0.46);
  /* great hall */
  const x0 = 1.2,
    x1 = 3.8,
    z0 = 0.75,
    z1 = 2.55,
    zc = (z0 + z1) / 2;
  qStone(G, 2.5, 0.26, zc, x1 - x0 + 0.06, z1 - z0 + 0.06, 0.22);
  for (let k = 0; k < 8; k++) {
    const y = 0.48 + k * 0.155,
      c = k % 2 ? QLOG : "#5d3f25";
    bW(G, 2.5, y, z1 - 0.045, x1 - x0, 0.15, 0.09, c);
    bW(G, 2.5, y, z0 + 0.045, x1 - x0, 0.15, 0.09, c);
    bW(G, x0 + 0.045, y, zc, 0.09, 0.15, z1 - z0, c);
    bW(G, x1 - 0.045, y, zc, 0.09, 0.15, z1 - z0, c);
  }
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    bW(G, x, 0.48, z, 0.18, 1.26, 0.18, QLOGT);
  qDoor(G, 2.5, z1 + 0.016, true, 1, { y: 0.48, w: 0.42, h: 0.72, wood: 1, lamp: 1 });
  for (const x of [1.65, 3.35]) qWin(G, x, 0.95, z1 + 0.016, true, 1, { wood: 1, shut: 1, glow: 1 });
  qWin(G, x0 - 0.016, 0.95, zc, false, -1, { wood: 1, shut: 1, glow: 1 });
  qWin(G, x1 + 0.016, 0.95, zc, false, 1, { wood: 1, shut: 1, glow: 1 });
  const rt = qRoof(G, 2.5, zc, x1 - x0, z1 - z0, 1.72, QTH, true, {
    rise: 0.2,
    run: 0.115,
    fill: "#e2cfa4",
    ov0: 0.15,
    ov1: 0.15,
    side: 0.18,
    ridge: QW2,
  });
  for (const s of [-1, 1]) {
    const gx = 2.5 + s * ((x1 - x0) / 2 + 0.15);
    for (const d of [-1, 1]) {
      bW(G, gx, rt - 0.2, zc + d * 0.1, 0.06, 0.34, 0.06, QW2);
      bW(G, gx, rt + 0.12, zc + d * 0.17, 0.06, 0.12, 0.06, QW3);
    }
  }
  qChim(G, 3.3, 1.1, 1.6, rt - 1.35);
  const tx = 2.5,
    tz = 1.25,
    TW2 = 0.8,
    TB = 3.2;
  bW(G, tx, 1.7, tz, TW2, TB - 1.7, TW2, QW1);
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    bW(G, tx + (a * TW2) / 2, 1.7, tz + (b * TW2) / 2, 0.12, TB - 1.7 + 0.06, 0.12, QLOG);
  for (const y of [2.4, 3.0]) bW(G, tx, y, tz, TW2 + 0.04, 0.06, TW2 + 0.04, QW2);
  qWin(G, tx, 2.6, tz + TW2 / 2 + 0.012, true, 1, { wood: 1, glow: 1 });
  qWin(G, tx + TW2 / 2 + 0.012, 2.6, tz, false, 1, { wood: 1, glow: 1 });
  qWin(G, tx - TW2 / 2 - 0.012, 2.6, tz, false, -1, { wood: 1, glow: 1 });
  bW(G, tx, TB, tz, TW2 + 0.26, 0.1, TW2 + 0.26, QW3);
  for (const s of [-1, 1]) {
    bW(G, tx + s * 0.5, TB + 0.1, tz, 0.05, 0.36, 1.04, QW1);
    bW(G, tx, TB + 0.1, tz + s * 0.5, 1.04, 0.36, 0.05, QW1);
  }
  for (const [a, b] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    bW(G, tx + a * 0.49, TB + 0.46, tz + b * 0.49, 0.07, 0.38, 0.07, QLOG);
  qLamp(G, tx, TB + 0.7, tz, false);
  const tt = qPyr(G, tx, tz, TB + 0.84, 1.26, 1.26, QSH, 0.1, 0.03);
  bW(G, tx, tt, tz, 0.1, 0.1, 0.1, QW2);
  C5.wflag = tt + 0.08;
  /* yard: well, hay, woodpile, a hut with a workbench, crates and a cart */
  {
    const x = 1.25,
      z = 3.45;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * 6.283;
      bW(G, x + Math.cos(a) * 0.22, 0.26, z + Math.sin(a) * 0.22, 0.1, 0.28, 0.1, QLOG);
    }
    bP(G, x, 0.5, z, 0.32, 0.02, 0.32, "#2a4a6a");
    for (const s of [-1, 1]) bW(G, x + s * 0.24, 0.26, z, 0.05, 0.62, 0.05, QW2);
    bW(G, x, 0.88, z, 0.58, 0.05, 0.06, QW2);
    qPyr(G, x, z, 0.93, 0.6, 0.36, QSH, 0.08, 0.06);
  }
  {
    const x = 3.85,
      z = 3.45;
    bW(G, x, 0.26, z, 0.7, 0.6, 0.6, QW1);
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      bW(G, x + a * 0.33, 0.26, z + b * 0.28, 0.08, 0.62, 0.08, QLOG);
    qRoof(G, x, z, 0.84, 0.74, 0.88, QTH, true, { rise: 0.16, run: 0.12, fill: "#e2cfa4" });
    qDoor(G, x, z + 0.31, true, 1, { y: 0.26, w: 0.22, h: 0.42, wood: 1 });
  }
  for (let k = 0; k < 3; k++) bW(G, 3.2, 0.26 + k * 0.1, 4.05, 0.6, 0.1, 0.18, k % 2 ? QLOGT : QLOG);
  bW(G, 1.85, 0.26, 4.1, 0.36, 0.26, 0.3, "#d4b06c");
  bW(G, 1.85, 0.52, 4.1, 0.3, 0.1, 0.24, "#c9a35c");
  qBarrel(G, 2.05, 3.0, 0.26);
  qBarrel(G, 3.0, 2.95, 0.26);
  qCrate(G, 1.9, 3.1, 0.26, 0.24);
  return toGeo(G);
}

export function keepGeo(wd) {
  const G = newG();
  if (!wd) {
    qPlinth(G, 1, 0, 1, 2, 2, 0.2);
    qStone(G, 1, 0.2, 1, 1.8, 1.8, 3.2, { moss: 1 });
    qQuoin(G, 0.1, 0.1, 1.9, 1.9, 0.2, 3.2);
    qRing(G, 1, 1, 1.9, 1.84, 0.05, QBR, bM);
    for (const [x, z, ax, n] of [
      [1, 1.9, true, 1],
      [1, 0.1, true, -1],
      [1.9, 1, false, 1],
      [0.1, 1, false, -1],
    ]) {
      qWin(G, x, 2.3, z + n * 0.01, ax, n, { w: 0.22, h: 0.34, glow: 1 });
      qSlit(G, ax ? x - 0.5 : x + n * 0.01, 1.3, ax ? z + n * 0.01 : z - 0.5, ax);
      qSlit(G, ax ? x + 0.5 : x + n * 0.01, 1.3, ax ? z + n * 0.01 : z + 0.5, ax);
      qGem(G, ax ? x : x + n * 0.012, 2.85, ax ? z + n * 0.012 : z, ax, n, 0.1);
    }
    bS(G, 1, 3.4, 1, 1.94, 0.1, 1.94, QSD);
    bS(G, 1, 3.5, 1, 2.0, 0.2, 2.0, QS[1]);
    qCornice(G, 1, 3.7, 1, 2.04, 2.04, 0.04);
    qMerl(G, 0, 0, 2, 2, 3.74, 0.22, 0.3);
    for (const [x, z] of [
      [0.22, 0.22],
      [1.78, 0.22],
      [0.22, 1.78],
      [1.78, 1.78],
    ]) {
      qRound(G, x, z, 3.5, 0.8, 0.5);
      qRing(G, x, z, 4.3, 0.56, 0.05, structureModelsState.BLU, bC);
      qRing(G, x, z, 4.35, 0.56, 0.03, QBR, bM);
      const t = qCone(G, x, z, 4.38, 0.58, QSL, 0.14);
      qFlag(G, x, t, z, 0.5);
    }
    qDoor(G, 1, 1.916, true, 1, { y: 0.2, w: 0.36, h: 0.66, lamp: 1, hex: 1 });
    qBan(G, 0.5, 1.62, 1.9, true, 1);
    qBan(G, 1.5, 1.62, 1.9, true, 1);
  } else {
    bP(G, 1, 0, 1, 2, 0.2, 2, "#5a4a32");
    for (let k = 0; k < 12; k++) {
      const y = 0.2 + k * 0.27,
        c = k % 2 ? QLOG : "#58402a";
      bW(G, 1, y, 1, 1.84, 0.27, 1.7, c);
      bW(G, 1, y, 1, 1.7, 0.27, 1.84, c);
    }
    for (const [a, b] of [
      [0.1, 0.1],
      [1.9, 0.1],
      [0.1, 1.9],
      [1.9, 1.9],
    ]) {
      bW(G, a, 0.2, b, 0.22, 3.3, 0.22, QLOGT);
      for (const y of [0.9, 2.2]) bP(G, a, y, b, 0.24, 0.05, 0.24, QIR);
    }
    bW(G, 1, 3.44, 1, 2.04, 0.12, 2.04, QW3);
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + i * 0.225;
      for (const [x, z] of [
        [t, 0.04],
        [t, 1.96],
        [0.04, t],
        [1.96, t],
      ])
        bW(G, x, 3.56, z, 0.08, 0.3, 0.08, QW2);
    }
    for (const [x, z] of [
      [0.22, 0.22],
      [1.78, 0.22],
      [0.22, 1.78],
      [1.78, 1.78],
    ]) {
      const t = qPyr(G, x, z, 3.86, 0.62, 0.62, QTC, 0.14, 0.08);
      qFlag(G, x, t, z, 0.5);
    }
    qDoor(G, 1, 1.936, true, 1, { y: 0.2, w: 0.34, h: 0.62, wood: 1, lamp: 1 });
    for (const x of [0.5, 1.5]) qWin(G, x, 1.6, 1.936, true, 1, { wood: 1, shut: 1 });
    qBan(G, 1, 2.6, 1.92, true, 1, 0.3, 0.5);
  }
  return toGeo(G);
}
