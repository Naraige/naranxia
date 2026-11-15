import { bxc, newG, toGeo, WRF } from "../geometry.js";
import {
  bC,
  bL,
  bM,
  bP,
  bR,
  bS,
  bW,
  mBits,
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
  qFlag,
  qGem,
  QHX,
  QIR,
  qLamp,
  QLOG,
  QLOGT,
  qP,
  qPlinth,
  qPost,
  qPyr,
  qQuoin,
  qRing,
  qRoof,
  qRound,
  QS,
  QSD,
  QSL,
  qSlit,
  qStone,
  QTC,
  qTimber,
  QTR,
  QW1,
  QW2,
  QW3,
  qWin,
} from "./building-parts.js";
import { HAYC, ROPE, structureModelsState } from "./structures.js";

/* ---- house: stone ground floor, plastered timber upper floor (colour varies), terracotta roof; merged rows get dormers ---- */
export function houseGeo(m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, sk } = mBits(m),
    alongX = !((N || S) && !(E || W)),
    FL = ["#efe3c6", "#ecd3a2", "#dde3e3", "#f0d8c6"][(m * 5 + 1) % 4];
  const fx0 = W ? 0 : 0.06,
    fx1 = E ? 2 : 1.94,
    fz0 = N ? 0 : 0.06,
    fz1 = S ? 2 : 1.94;
  qPlinth(G, (fx0 + fx1) / 2, 0, (fz0 + fz1) / 2, fx1 - fx0, fz1 - fz0, 0.16);
  const x0 = W ? 0 : 0.24,
    x1 = E ? 2 : 1.76,
    z0 = N ? 0 : 0.24,
    z1 = S ? 2 : 1.76;
  qStone(G, (x0 + x1) / 2, 0.2, (z0 + z1) / 2, x1 - x0, z1 - z0, 0.3);
  qTimber(G, x0, z0, x1, z1, 0.5, 1.0, { skip: sk, fill: FL });
  const j = 0.07,
    jx0 = W ? 0 : x0 - (alongX ? 0 : j),
    jx1 = E ? 2 : x1 + (alongX ? 0 : j),
    jz0 = N ? 0 : z0 - (alongX ? j : 0),
    jz1 = S ? 2 : z1 + (alongX ? j : 0);
  bW(G, (jx0 + jx1) / 2, 1.0, (jz0 + jz1) / 2, jx1 - jx0, 0.08, jz1 - jz0, QW2);
  qTimber(G, jx0, jz0, jx1, jz1, 1.08, 1.6, { skip: sk, brace: true, fill: FL });
  const dr = !S ? "S" : !N ? "N" : !E ? "E" : !W ? "W" : null,
    wo = { wood: 1, shut: 1, box: 1 };
  if (!S) {
    qWin(G, 0.5, 0.58, z1 + 0.016, true, 1, wo);
    qWin(G, 1.5, 0.58, z1 + 0.016, true, 1, wo);
    qWin(G, 0.62, 1.2, jz1 + 0.016, true, 1, { wood: 1 });
    qWin(G, 1.38, 1.2, jz1 + 0.016, true, 1, { wood: 1 });
    if (dr === "S") qDoor(G, 1, z1 + 0.016, true, 1, { wood: 1, lamp: 1 });
  }
  if (!N) {
    qWin(G, 0.62, 1.2, jz0 - 0.016, true, -1, { wood: 1 });
    qWin(G, 1.38, 1.2, jz0 - 0.016, true, -1, { wood: 1 });
    if (dr === "N") qDoor(G, 1, z0 - 0.016, true, -1, { wood: 1, lamp: 1 });
    else qWin(G, 1, 0.58, z0 - 0.016, true, -1, { wood: 1, shut: 1 });
  }
  if (!E) {
    qWin(G, jx1 + 0.016, 1.2, 1, false, 1, { wood: 1 });
    if (dr === "E") qDoor(G, x1 + 0.016, 1, false, 1, { wood: 1, lamp: 1 });
    else qWin(G, x1 + 0.016, 0.58, 1, false, 1, wo);
  }
  if (!W) {
    qWin(G, jx0 - 0.016, 1.2, 1, false, -1, { wood: 1 });
    if (dr === "W") qDoor(G, x0 - 0.016, 1, false, -1, { wood: 1, lamp: 1 });
    else qWin(G, x0 - 0.016, 0.58, 1, false, -1, wo);
  }
  let top;
  if (alongX)
    top = qRoof(G, (jx0 + jx1) / 2, (jz0 + jz1) / 2, jx1 - jx0, jz1 - jz0, 1.6, QTC, true, {
      ov0: W ? 0 : 0.12,
      ov1: E ? 0 : 0.12,
      g0: !W,
      g1: !E,
      side: N || S ? 0 : 0.1,
      fill: FL,
    });
  else
    top = qRoof(G, (jx0 + jx1) / 2, (jz0 + jz1) / 2, jz1 - jz0, jx1 - jx0, 1.6, QTC, false, {
      ov0: N ? 0 : 0.12,
      ov1: S ? 0 : 0.12,
      g0: !N,
      g1: !S,
      side: E || W ? 0 : 0.1,
      fill: FL,
    });
  if (alongX && !E) qChim(G, x1 - 0.24, (z0 + z1) / 2 - 0.4, 1.0, top - 0.85);
  else if (!alongX && !S) qChim(G, (x0 + x1) / 2 + 0.4, z1 - 0.24, 1.0, top - 0.85);
  if (alongX && !S) {
    const dz = jz1 - 0.3,
      dy = 1.66;
    bP(G, 1, dy, dz, 0.38, 0.32, 0.36, FL);
    bW(G, 1, dy, dz + 0.18, 0.42, 0.05, 0.02, QW2);
    qWin(G, 1, dy + 0.06, dz + 0.185, true, 1, { wood: 1, w: 0.16, h: 0.18 });
    qPyr(G, 1, dz, dy + 0.32, 0.5, 0.48, QTC, 0.1, 0.1);
  }
  if (!E && alongX) {
    for (let k = 0; k < 3; k++)
      for (let j = 0; j < 2 - (k > 1 ? 1 : 0); j++) {
        bW(G, x1 + 0.1, 0.16 + k * 0.1, 0.62 + j * 0.34 + (k % 2) * 0.06, 0.11, 0.1, 0.3, k % 2 ? "#5d3f25" : QLOG);
        bW(G, x1 + 0.1, 0.17 + k * 0.1, 0.772 + j * 0.34 + (k % 2) * 0.06, 0.08, 0.08, 0.012, QLOGT);
      }
  }
  if (!S && !E) qBarrel(G, 1.84, 1.86, 0.16);
  return toGeo(G);
}

/* ---- farm: crop rows, fences on the outer sides, scarecrow, hay; a merged field gets a windmill ---- */
export function farmGeo(m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, nw } = mBits(m);
  bP(G, 1, 0, 1, 2, 0.1, 2, "#6e4a2c");
  const mill = nw ? [0.42, 0.42] : null;
  for (let r = 0; r < 5; r++) {
    const z = 0.22 + r * 0.39;
    if (r === 2) {
      bP(G, 1, 0.06, z, 2, 0.05, 0.22, "#3a6fd0");
      continue;
    }
    bP(G, 1, 0.1, z, 2, 0.03, 0.26, "#4a3020");
    for (let i = 0; i < 7; i++) {
      const x = 0.15 + i * 0.285,
        gr = (i * 3 + r * 5) % 4;
      if (mill && x < 0.85 && z < 0.85) continue;
      if (r % 2 === 0) {
        const h = 0.12 + gr * 0.07,
          c = gr >= 3 ? "#d8b43a" : gr === 2 ? "#b8b040" : "#5e9a36";
        bxc(G, x - 0.05, 0.13, z - 0.05, 0.035, h, 0.035, c);
        bxc(G, x + 0.05, 0.13, z + 0.05, 0.035, h, 0.035, c);
        if (gr >= 2) bxc(G, x, 0.13 + h, z, 0.07, 0.05, 0.07, gr >= 3 ? "#e8c84a" : "#c8c050");
      } else {
        bxc(G, x, 0.13, z, 0.12, 0.08, 0.1, "#4a8e32");
        bxc(G, x, 0.2, z, 0.06, 0.06, 0.06, "#5ea83e");
        if (gr >= 2) bxc(G, x, 0.12, z + 0.05, 0.06, 0.03, 0.03, "#e07a1a");
      }
    }
  }
  const fence = (ax, fixed) => {
    for (let i = 0; i <= 8; i++) {
      const t = 0.06 + i * 0.235;
      ax ? bW(G, t, 0.1, fixed, 0.08, 0.42, 0.08, QW1) : bW(G, fixed, 0.1, t, 0.08, 0.42, 0.08, QW1);
      ax ? bW(G, t, 0.52, fixed, 0.05, 0.04, 0.05, QW3) : bW(G, fixed, 0.52, t, 0.05, 0.04, 0.05, QW3);
    }
    for (const y of [0.26, 0.42])
      ax ? bW(G, 1, y, fixed, 1.9, 0.05, 0.04, QW3) : bW(G, fixed, y, 1, 0.04, 0.05, 1.9, QW3);
  };
  if (!N) fence(true, 0.04);
  if (!S) fence(true, 1.96);
  if (!W) fence(false, 0.04);
  if (!E) fence(false, 1.96);
  if (!N && !E) {
    const x = 1.74,
      z = 0.32;
    bW(G, x, 0.1, z, 0.05, 0.62, 0.05, QW1);
    bW(G, x, 0.5, z, 0.42, 0.05, 0.05, QW1);
    bC(G, x, 0.4, z, 0.18, 0.2, 0.12, "#b8542e");
    bC(G, x, 0.7, z, 0.18, 0.17, 0.18, "#e0b05a");
    bP(G, x - 0.045, 0.78, z + 0.092, 0.04, 0.04, 0.01, "#2a1a0a");
    bP(G, x + 0.045, 0.78, z + 0.092, 0.04, 0.04, 0.01, "#2a1a0a");
    bC(G, x, 0.87, z, 0.26, 0.04, 0.26, HAYC);
    bC(G, x, 0.91, z, 0.12, 0.08, 0.12, HAYC);
  }
  if (!S && !W) {
    bW(G, 0.32, 0.1, 1.7, 0.3, 0.3, 0.3, QW1);
    bP(G, 0.32, 0.36, 1.7, 0.24, 0.05, 0.24, "#5a3a1a");
    bP(G, 0.32, 0.4, 1.7, 0.18, 0.02, 0.18, "#6b8a3a");
  }
  if (!S && !E) {
    bC(G, 1.66, 0.1, 1.66, 0.38, 0.36, 0.38, HAYC);
    bC(G, 1.66, 0.24, 1.66, 0.4, 0.07, 0.4, "#a98a2a");
    bC(G, 1.36, 0.1, 1.74, 0.24, 0.24, 0.24, HAYC);
  }
  if (mill) {
    const [x, z] = mill;
    qRound(G, x, z, 0.1, 1.3, 0.74, { moss: 1 });
    qRing(G, x, z, 0.7, 0.78, 0.05, QW2, bW);
    bW(G, x, 1.4, z, 0.82, 0.07, 0.82, QW2);
    qCone(G, x, z, 1.47, 0.86, QTC, 0.16);
    qDoor(G, x, z + 0.37, true, 1, { wood: 1, y: 0.1, w: 0.2, h: 0.36 });
    qWin(G, x + 0.37, 0.8, z, false, 1, { wood: 1, w: 0.12, h: 0.18 });
    const hy = 1.3,
      hz = z + 0.47;
    bW(G, x, hy - 0.04, hz - 0.06, 0.1, 0.1, 0.16, QW2);
    bM(G, x, hy - 0.03, hz + 0.03, 0.07, 0.07, 0.04, QBR);
    for (const [ax, sg] of [
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
    ]) {
      const L = 1.0;
      if (ax) bW(G, x + (sg * L) / 2, hy, hz + 0.04, L, 0.04, 0.03, QW2);
      else bW(G, x, hy + (sg > 0 ? 0 : -L) + 0.02, hz + 0.04, 0.04, L, 0.03, QW2);
      if (ax) bC(G, x + sg * (L / 2 + 0.02), hy + (sg > 0 ? 0.03 : -0.15), hz + 0.05, L * 0.82, 0.12, 0.015, "#efe6d0");
      else
        bC(G, x + (sg > 0 ? -0.09 : 0.09), hy + (sg > 0 ? 0.1 : -L + 0.1), hz + 0.05, 0.12, L * 0.82, 0.015, "#efe6d0");
    }
  }
  return toGeo(G);
}

/* ---- storage: warehouse with stone footing, timber walls and a terracotta roof; merged halls share the roof and the north-west one hoists crates ---- */
export function storageGeo(m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, sk, nw } = mBits(m),
    alongX = !((N || S) && !(E || W));
  const x0 = W ? 0 : 0.12,
    x1 = E ? 2 : 1.88,
    z0 = N ? 0 : 0.12,
    z1 = S ? 2 : 1.56;
  qPlinth(
    G,
    (x0 + x1) / 2,
    0,
    (z0 + z1) / 2,
    x1 - x0 + (W ? 0 : 0.06) + (E ? 0 : 0.06),
    z1 - z0 + (N ? 0 : 0.06) + (S ? 0 : 0.06),
    0.14,
  );
  qStone(G, (x0 + x1) / 2, 0.18, (z0 + z1) / 2, x1 - x0, z1 - z0, 0.3, { moss: 1 });
  qTimber(G, x0, z0, x1, z1, 0.48, 1.18, { skip: sk, brace: true, fill: "#e8d8b4" });
  const top = alongX
    ? qRoof(G, (x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, 1.18, QTC, true, {
        ov0: W ? 0 : 0.12,
        ov1: E ? 0 : 0.12,
        g0: !W,
        g1: !E,
        side: N || S ? 0 : 0.1,
      })
    : qRoof(G, (x0 + x1) / 2, (z0 + z1) / 2, z1 - z0, x1 - x0, 1.18, QTC, false, {
        ov0: N ? 0 : 0.12,
        ov1: S ? 0 : 0.12,
        g0: !N,
        g1: !S,
        side: E || W ? 0 : 0.1,
      });
  if (!S) {
    const P = qP(G, 1, 0.18, z1 + 0.016, true, 1);
    P(bW, 0, 0, 0, 0.72, 0.66, 0.04, QW2);
    P(bW, -0.17, 0, 0.012, 0.32, 0.6, 0.04, QW1);
    P(bW, 0.17, 0, 0.012, 0.32, 0.6, 0.04, QW1);
    P(bW, -0.17, 0, 0.032, 0.3, 0.03, 0.01, QW2);
    P(bW, 0.17, 0, 0.032, 0.3, 0.03, 0.01, QW2);
    for (const a of [-0.17, 0.17]) {
      P(bW, a, 0.3, 0.032, 0.03, 0.42, 0.01, QW2);
    }
    P(bP, 0, 0.3, 0.04, 0.6, 0.035, 0.01, QIR);
    qLamp(G, 1.48, 0.98, z1 + 0.09, false);
    qWin(G, 0.4, 0.62, z1 + 0.016, true, 1, { wood: 1, shut: 1 });
    qWin(G, 1.62, 0.62, z1 + 0.016, true, 1, { wood: 1, shut: 1 });
    qBarrel(G, 0.36, 1.8);
    qBarrel(G, 0.64, 1.86);
    qCrate(G, 1.42, 1.8, 0, 0.26);
    qCrate(G, 1.7, 1.84, 0, 0.22);
    qCrate(G, 1.47, 1.8, 0.26, 0.2);
    bC(G, 1.06, 0, 1.86, 0.2, 0.16, 0.16, "#cbb88a");
  }
  if (!N) {
    qWin(G, 0.6, 0.66, z0 - 0.016, true, -1, { wood: 1, shut: 1 });
    qWin(G, 1.4, 0.66, z0 - 0.016, true, -1, { wood: 1, shut: 1 });
  }
  if (!E) qWin(G, x1 + 0.016, 0.66, (z0 + z1) / 2, false, 1, { wood: 1, shut: 1 });
  if (!W) qWin(G, x0 - 0.016, 0.66, (z0 + z1) / 2, false, -1, { wood: 1, shut: 1 });
  if (nw) {
    const hy = top - 0.5;
    if (alongX) {
      bW(G, x0 - 0.22, hy, (z0 + z1) / 2, 0.56, 0.08, 0.08, QW2);
      bP(G, x0 - 0.46, hy - 0.36, (z0 + z1) / 2, 0.015, 0.36, 0.015, ROPE);
      qCrate(G, x0 - 0.46, (z0 + z1) / 2, hy - 0.62, 0.22);
      bW(G, x0 - 0.05, hy - 0.3, (z0 + z1) / 2, 0.05, 0.32, 0.05, QW2);
    } else {
      bW(G, (x0 + x1) / 2, hy, z0 - 0.22, 0.08, 0.08, 0.56, QW2);
      bP(G, (x0 + x1) / 2, hy - 0.36, z0 - 0.46, 0.015, 0.36, 0.015, ROPE);
      qCrate(G, (x0 + x1) / 2, z0 - 0.46, hy - 0.62, 0.22);
    }
  }
  return toGeo(G);
}

/* ---- barracks: stone (slate roof) or timber (terracotta) hall with a training yard; merged halls get a watch turret ---- */
function mdBarracks(stone, m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, sk, nw } = mBits(m);
  const x0 = W ? 0 : 0.12,
    x1 = E ? 2 : 1.88,
    z0 = N ? 0 : 0.14,
    z1 = S ? 2 : 1.5;
  qPlinth(G, 1, 0, 1, 2, 2, 0.14);
  if (stone) {
    qStone(G, (x0 + x1) / 2, 0.18, (z0 + z1) / 2, x1 - x0, z1 - z0, 0.92, { moss: 1 });
    if (!m) qQuoin(G, x0, z0, x1, z1, 0.18, 0.92);
    qCornice(G, (x0 + x1) / 2, 1.1, (z0 + z1) / 2, x1 - x0 + 0.04, z1 - z0 + 0.04, 0.08);
  } else {
    qStone(G, (x0 + x1) / 2, 0.18, (z0 + z1) / 2, x1 - x0, z1 - z0, 0.25);
    qTimber(G, x0, z0, x1, z1, 0.43, 1.1, { skip: sk, fill: "#e6d6b2" });
    bW(G, (x0 + x1) / 2, 1.1, (z0 + z1) / 2, x1 - x0, 0.08, z1 - z0, QW2);
  }
  qTimber(G, x0, z0 - (N ? 0 : 0.07), x1, z1 + (S ? 0 : 0.07), 1.18, 1.7, {
    skip: sk,
    brace: true,
    fill: stone ? "#e2d6bc" : "#e6d6b2",
  });
  const top = qRoof(
    G,
    (x0 + x1) / 2,
    (z0 + z1) / 2,
    x1 - x0,
    z1 - z0 + (N ? 0 : 0.07) + (S ? 0 : 0.07),
    1.7,
    stone ? QSL : WRF,
    true,
    { ov0: W ? 0 : 0.12, ov1: E ? 0 : 0.12, g0: !W, g1: !E, side: N || S ? 0 : 0.1, fin: stone },
  );
  if (!S) {
    qDoor(G, 1, z1 + 0.016, true, 1, { w: 0.42, h: 0.64, y: 0.18, wood: !stone });
    if (stone) qGem(G, 1, 1.0, z1 + 0.02, true, 1, 0.09);
    qBan(G, 0.42, 1.04, z1, true, 1);
    qBan(G, 1.58, 1.04, z1, true, 1);
    qLamp(G, 0.72, 0.98, z1 + 0.07, stone);
    qLamp(G, 1.28, 0.98, z1 + 0.07, stone);
    qWin(G, 0.55, 1.32, z1 + 0.086, true, 1, { wood: 1 });
    qWin(G, 1.45, 1.32, z1 + 0.086, true, 1, { wood: 1 });
    for (const x of [0.22, 0.72]) bW(G, x, 0.14, 1.8, 0.06, 0.56, 0.06, QW2);
    bW(G, 0.47, 0.6, 1.8, 0.56, 0.05, 0.06, QW2);
    [0.32, 0.47, 0.62].forEach((x) => {
      bM(G, x, 0.26, 1.84, 0.035, 0.3, 0.02, "#dadde4");
      bM(G, x, 0.52, 1.84, 0.1, 0.03, 0.03, QBR);
      bW(G, x, 0.55, 1.84, 0.03, 0.07, 0.03, QW1);
    });
    bW(G, 1.16, 0.14, 1.84, 0.05, 0.52, 0.05, QW2);
    bC(G, 1.16, 0.34, 1.84, 0.2, 0.24, 0.12, HAYC);
    bW(G, 1.16, 0.5, 1.84, 0.36, 0.04, 0.04, QW2);
    bC(G, 1.16, 0.62, 1.84, 0.14, 0.13, 0.13, "#e0c060");
    bM(G, 1.16, 0.74, 1.84, 0.16, 0.05, 0.15, "#8a8f9a");
    bC(G, 0.88, 0.14, 1.84, 0.08, 0.3, 0.24, structureModelsState.BLU);
    bM(G, 0.925, 0.2, 1.84, 0.01, 0.18, 0.06, QBR2);
    bW(G, 1.55, 0.14, 1.82, 0.06, 0.3, 0.06, QW2);
    bC(G, 1.55, 0.32, 1.82, 0.36, 0.36, 0.14, HAYC);
    bC(G, 1.55, 0.34, 1.893, 0.3, 0.3, 0.01, "#f0f0f0");
    bC(G, 1.55, 0.39, 1.896, 0.2, 0.2, 0.01, "#c8282a");
    bC(G, 1.55, 0.44, 1.899, 0.1, 0.1, 0.01, "#f0f0f0");
    bC(G, 1.55, 0.47, 1.902, 0.04, 0.04, 0.01, "#c8282a");
  }
  if (!N) {
    qWin(G, 0.55, 1.32, z0 - 0.086, true, -1, { wood: 1 });
    qWin(G, 1.45, 1.32, z0 - 0.086, true, -1, { wood: 1 });
    if (stone) {
      qSlit(G, 0.45, 0.55, z0 - 0.016, true);
      qSlit(G, 1.55, 0.55, z0 - 0.016, true);
    }
  }
  if (!W) {
    if (stone) qSlit(G, x0 - 0.016, 0.55, (z0 + z1) / 2, false);
    else qWin(G, x0 - 0.016, 0.6, (z0 + z1) / 2, false, -1, { wood: 1, shut: 1 });
  }
  if (!E) {
    if (stone) qSlit(G, x1 + 0.016, 0.55, (z0 + z1) / 2, false);
    else qWin(G, x1 + 0.016, 0.6, (z0 + z1) / 2, false, 1, { wood: 1, shut: 1 });
  }
  if (nw) {
    const tx = x0 + 0.3,
      tz = z0 + 0.3;
    if (stone) {
      qRound(G, tx, tz, 0.18, 3.1, 0.5, { moss: 1 });
      qRing(G, tx, tz, 3.28, 0.62, 0.08, QTR);
      for (const [a, b] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        bS(G, tx + a * 0.25, 3.36, tz + b * 0.25, 0.12, 0.18, 0.12, QS[0]);
        bS(G, tx + a * 0.25, 3.54, tz + b * 0.25, 0.14, 0.03, 0.14, QTR);
      }
      qRing(G, tx, tz, 2.2, 0.56, 0.05, QBR, bM);
      qFlag(G, tx, 3.36, tz, 0.8);
    } else {
      for (const [a, b] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        bW(G, tx + a * 0.2, 0.14, tz + b * 0.2, 0.1, 3.0, 0.1, QLOG);
      bW(G, tx, 3.0, tz, 0.6, 0.08, 0.6, QW2);
      for (const [a, b] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        bW(G, tx + a * 0.27, 3.08, tz + b * 0.27, 0.05, 0.3, 0.05, QW1);
      const t = qPyr(G, tx, tz, 3.4, 0.72, 0.72, WRF, 0.14, 0.1);
      qFlag(G, tx, t, tz, 0.6);
    }
  } else if (!m) qFlag(G, 1, top - 0.02, (z0 + z1) / 2);
  return toGeo(G);
}

export function barracksGeo(m) {
  return mdBarracks(true, m);
}

export function woodBarracksGeo(m) {
  return mdBarracks(false, m);
}

/* ---- academy: limestone library with arched glowing windows, a portico and a copper roof; its tower becomes a hextech observatory when merged ---- */
export function academyGeo(m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, nw } = mBits(m),
    alongX = !((N || S) && !(E || W)),
    tw = !m || nw;
  const x0 = W ? 0 : 0.16,
    x1 = E ? 2 : 1.84,
    z0 = N ? 0 : 0.3,
    z1 = S ? 2 : 1.66;
  qPlinth(G, 1, 0, 1, 2, 2, 0.16);
  qStone(G, (x0 + x1) / 2, 0.2, (z0 + z1) / 2, x1 - x0, z1 - z0, 1.1);
  if (!m) qQuoin(G, x0, z0, x1, z1, 0.2, 1.1);
  qCornice(G, (x0 + x1) / 2, 1.3, (z0 + z1) / 2, x1 - x0 + 0.06, z1 - z0 + 0.06, 0.08);
  alongX
    ? qRoof(G, (x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, 1.38, QCU, true, {
        ov0: W ? 0 : 0.1,
        ov1: E ? 0 : 0.1,
        g0: !W,
        g1: !E,
        side: N || S ? 0 : 0.08,
        stone: 1,
        fill: QS[2],
        fin: 1,
      })
    : qRoof(G, (x0 + x1) / 2, (z0 + z1) / 2, z1 - z0, x1 - x0, 1.38, QCU, false, {
        ov0: N ? 0 : 0.1,
        ov1: S ? 0 : 0.1,
        g0: !N,
        g1: !S,
        side: E || W ? 0 : 0.08,
        stone: 1,
        fill: QS[2],
        fin: 1,
      });
  const wins = (n, ax, fixed, a0, a1) => {
    for (let a = a0; a <= a1 + 1e-6; a += 0.42) {
      qWin(G, ax ? a : fixed, 0.5, ax ? fixed : a, ax, n, { glow: 1, w: 0.18, h: 0.42 });
    }
  };
  if (!S) {
    wins(1, true, z1 + 0.016, 0.36, 0.6);
    wins(1, true, z1 + 0.016, 1.4, 1.64);
    bS(G, 1, 0.2, z1 + 0.12, 0.62, 0.06, 0.24, QTR);
    bS(G, 1, 0.26, z1 + 0.08, 0.52, 0.06, 0.16, QTR);
    for (const x of [0.74, 1.26]) {
      bS(G, x, 0.32, z1 + 0.14, 0.1, 0.9, 0.1, QTR);
      bS(G, x, 1.2, z1 + 0.14, 0.14, 0.06, 0.14, QTR);
    }
    bS(G, 1, 1.26, z1 + 0.14, 0.68, 0.08, 0.18, QTR);
    qPyr(G, 1, z1 + 0.12, 1.34, 0.72, 0.24, [QTR, QS[2]], 0.1, 0.08);
    qDoor(G, 1, z1 + 0.016, true, 1, { y: 0.32, w: 0.3, h: 0.6 });
    qGem(G, 1, 1.12, z1 + 0.24, true, 1, 0.09);
    qPost(G, 0.5, 0.2, z1 + 0.24, 0.4, true);
    qPost(G, 1.5, 0.2, z1 + 0.24, 0.4, true);
  }
  if (!N) wins(-1, true, z0 - 0.016, 0.4, 1.6);
  if (!E) wins(1, false, x1 + 0.016, z0 + 0.25, z1 - 0.25);
  if (!W && !tw) wins(-1, false, x0 - 0.016, z0 + 0.25, z1 - 0.25);
  if (tw) {
    const tx = x0 + 0.3,
      tz = z0 + 0.3,
      H = nw ? 2.6 : 2.3;
    qRound(G, tx, tz, 0.2, H, 0.6, { moss: 1 });
    qRing(G, tx, tz, 0.2 + H, 0.7, 0.08, QTR);
    qRing(G, tx, tz, 1.5, 0.64, 0.05, QBR, bM);
    for (const a of [0, 1]) qWin(G, tx, 1.1 + a * 0.7, tz + 0.31, true, 1, { glow: 1, w: 0.12, h: 0.26 });
    if (nw) {
      const y = 0.28 + H;
      qRing(G, tx, tz, y, 0.62, 0.1, QBR, bM);
      for (let k = 0; k < 4; k++) {
        const r = 0.5 - k * 0.11;
        qRing(G, tx, tz, y + 0.1 + k * 0.13, r, 0.13, k % 2 ? QCU[0] : QCU[2], bR);
      }
      bL(G, tx, y + 0.18, tz, 0.26, 0.3, 0.26, QHX);
      for (const [a, b] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ])
        bM(G, tx + a * 0.28, y + 0.1, tz + b * 0.28, 0.04, 0.5, 0.04, QBR);
      bM(G, tx, y + 0.66, tz, 0.08, 0.2, 0.08, QBR2);
      bL(G, tx, y + 0.86, tz, 0.07, 0.07, 0.07, QHX);
    } else {
      const t = qCone(G, tx, tz, 0.28 + H, 0.72, QCU);
      bM(G, tx, t, tz, 0.06, 0.18, 0.06, QBR2);
      bL(G, tx, t + 0.18, tz, 0.07, 0.07, 0.07, QHX);
    }
  }
  return toGeo(G);
}

/* ---- forester's hut: a mossy log cabin with a sapling nursery, a log pile and a chopping stump; front = +z ---- */
const QMOSS = ["#5b7a3e", "#4d6a35", "#668845"];

export function foresterGeo(hm) {
  hm = hm | 0;
  const G = newG();
  const wing = (a0, a1, b0, b1, ax) => {
    const cx = (a0 + a1) / 2,
      cz = (b0 + b1) / 2,
      L = a1 - a0,
      D = b1 - b0;
    qStone(G, cx, 0.11, cz, L, D, 0.16);
    for (let k = 0; k < 5; k++) {
      const y = 0.27 + k * 0.14,
        c = k % 2 ? QLOG : "#5d3f25";
      if (ax) {
        bW(G, cx, y, b0 + 0.04, L, 0.13, 0.09, c);
        bW(G, cx, y, b1 - 0.04, L, 0.13, 0.09, c);
      } else {
        bW(G, a0 + 0.04, y, cz, 0.09, 0.13, D, c);
        bW(G, a1 - 0.04, y, cz, 0.09, 0.13, D, c);
      }
    }
    bW(G, cx, 0.97, cz, L, 0.05, D, QW2);
    qRoof(G, cx, cz, ax ? L : D, ax ? D : L, 1.0, QMOSS, ax, {
      rise: 0.13,
      run: 0.12,
      fill: "#8a6a42",
      ov0: 0,
      ov1: 0,
      side: 0.08,
      ridge: QW2,
      g0: false,
      g1: false,
    });
  };
  if (hm & 2) wing(1.26, 2, 0.36, 0.9, true);
  if (hm & 8) wing(0, 0.22, 0.36, 0.9, true);
  if (hm & 1) wing(0.96, 1.3, 0, 0.32, false);
  if (hm & 4) wing(0.96, 1.3, 1.24, 2, false);
  bP(G, 1, 0, 1, 2, 0.08, 2, "#5f6f38");
  bP(G, 1, 0.08, 1, 1.94, 0.03, 1.94, "#6f8a44");
  /* cabin of horizontal logs */
  const x0 = 0.18,
    x1 = 1.3,
    z0 = 0.28,
    z1 = 1.28,
    xc = (x0 + x1) / 2,
    zc = (z0 + z1) / 2;
  qStone(G, xc, 0.11, zc, x1 - x0 + 0.08, z1 - z0 + 0.08, 0.16);
  for (let k = 0; k < 6; k++) {
    const y = 0.27 + k * 0.14,
      c = k % 2 ? QLOG : "#5d3f25",
      L = x1 - x0,
      D = z1 - z0;
    bW(G, xc, y, z1 - 0.04, L + (k % 2 ? 0.12 : 0), 0.13, 0.09, c);
    bW(G, xc, y, z0 + 0.04, L + (k % 2 ? 0.12 : 0), 0.13, 0.09, c);
    bW(G, x0 + 0.04, y, zc, 0.09, 0.13, D + (k % 2 ? 0 : 0.12), c);
    bW(G, x1 - 0.04, y, zc, 0.09, 0.13, D + (k % 2 ? 0 : 0.12), c);
  }
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    for (let k = 0; k < 6; k += 2) bW(G, x, 0.27 + k * 0.14, z, 0.12, 0.13, 0.12, QLOGT);
  qDoor(G, 0.6, z1 + 0.016, true, 1, { y: 0.27, w: 0.26, h: 0.5, wood: 1, lamp: 1 });
  if (!(hm & 4)) qWin(G, 1.02, 0.55, z1 + 0.016, true, 1, { wood: 1, shut: 1, glow: 1, w: 0.16, h: 0.2 });
  if (!(hm & 8)) qWin(G, x0 - 0.016, 0.55, zc, false, -1, { wood: 1, shut: 1, glow: 1, w: 0.16, h: 0.2 });
  const rt = qRoof(G, xc, zc, x1 - x0, z1 - z0, 1.11, QMOSS, true, {
    rise: 0.17,
    run: 0.13,
    fill: "#8a6a42",
    ov0: 0.1,
    ov1: 0.1,
    side: 0.12,
    ridge: QW2,
  });
  qChim(G, 0.42, 0.52, 0.8, rt - 0.62);
  /* nursery: saplings in planters, the tallest at the back */
  for (let r = hm & 2 ? 2 : 0; r < 3; r++)
    for (let c = 0; c < 2; c++) {
      const x = 1.55 + c * 0.28,
        z = 0.42 + r * 0.42,
        h = 0.16 + (2 - r) * 0.07 + c * 0.03;
      bW(G, x, 0.11, z, 0.22, 0.1, 0.22, QW1);
      bP(G, x, 0.21, z, 0.18, 0.02, 0.18, "#4a3020");
      bW(G, x, 0.23, z, 0.03, h, 0.03, "#6b4a2c");
      bC(G, x, 0.23 + h, z, 0.13, 0.11, 0.13, r === 1 ? "#5fa845" : "#4f9a3c");
      bC(G, x, 0.34 + h, z, 0.07, 0.06, 0.07, "#6fbe52");
    }
  if (!(hm & 2)) {
    for (let k = 0; k <= 5; k++) {
      bW(G, 1.98, 0.11, 0.25 + k * 0.3, 0.05, 0.22, 0.05, QW1);
    }
    bW(G, 1.98, 0.26, 1, 0.03, 0.04, 1.55, QW3);
  }
  /* yard: log pile, chopping stump with an axe, a watering can */
  for (let k = 0; k < 3; k++) {
    bW(G, 0.42 + k * 0.17, 0.11, 1.66, 0.16, 0.16, 0.42, QLOG);
    bW(G, 0.42 + k * 0.17, 0.11, 1.876, 0.12, 0.12, 0.012, QLOGT);
  }
  for (let k = 0; k < 2; k++) {
    bW(G, 0.5 + k * 0.17, 0.27, 1.66, 0.16, 0.16, 0.42, QLOG);
    bW(G, 0.5 + k * 0.17, 0.27, 1.876, 0.12, 0.12, 0.012, QLOGT);
  }
  if (!(hm & 4)) {
    bW(G, 1.25, 0.11, 1.68, 0.24, 0.18, 0.24, "#7a5a34");
    bW(G, 1.25, 0.29, 1.68, 0.2, 0.01, 0.2, QLOGT);
    bW(G, 1.25, 0.3, 1.62, 0.03, 0.03, 0.2, "#9a6a34");
    bM(G, 1.25, 0.33, 1.71, 0.02, 0.08, 0.1, "#b9c0cc");
  }
  bM(G, 1.62, 0.11, 1.72, 0.12, 0.1, 0.09, QBR);
  bM(G, 1.68, 0.17, 1.72, 0.08, 0.02, 0.02, QBR2);
  return toGeo(G);
}

/* ---- builders' guild: a timber workshop on a stone base, a treadwheel crane lifting a block, cut stone and planks in the yard ---- */
export function guildGeo(hm) {
  hm = hm | 0;
  const G = newG();
  const wing = (a0, a1, b0, b1, ax) => {
    const cx = (a0 + a1) / 2,
      cz = (b0 + b1) / 2,
      L = a1 - a0,
      D = b1 - b0;
    qStone(G, cx, 0.13, cz, L, D, 0.42);
    qTimber(G, a0, b0, a1, b1, 0.55, 1.25, { brace: true, fill: "#e8d6b0", skip: ax ? "EW" : "NS" });
    bW(G, cx, 1.25, cz, L, 0.06, D, QW2);
    qRoof(G, cx, cz, ax ? L : D, ax ? D : L, 1.31, QSL, ax, {
      rise: 0.17,
      run: 0.13,
      ov0: 0,
      ov1: 0,
      side: 0.08,
      g0: false,
      g1: false,
    });
  };
  if (hm & 2) wing(1.31, 2, 0.32, 0.9, true);
  if (hm & 8) wing(0, 0.19, 0.32, 0.9, true);
  if (hm & 1) wing(0.95, 1.3, 0, 0.24, false);
  if (hm & 4) wing(0.95, 1.3, 1.26, 2, false);
  qPlinth(G, 1, 0, 1, 2, 2, 0.1);
  bS(G, 1, 0.1, 1, 1.9, 0.03, 1.9, QS[2]);
  const x0 = 0.15,
    x1 = 1.35,
    z0 = 0.2,
    z1 = 1.3,
    xc = (x0 + x1) / 2,
    zc = (z0 + z1) / 2;
  qStone(G, xc, 0.13, zc, x1 - x0, z1 - z0, 0.42);
  qQuoin(G, x0, z0, x1, z1, 0.13, 0.42);
  qTimber(G, x0, z0, x1, z1, 0.55, 1.25, { brace: true, fill: "#e8d6b0" });
  bW(G, xc, 1.25, zc, x1 - x0 + 0.08, 0.06, z1 - z0 + 0.08, QW2);
  qTimber(G, x0 - 0.04, z0 - 0.04, x1 + 0.04, z1 + 0.04, 1.31, 1.86, { fill: "#efe3c6", skip: "N" });
  qRoof(G, xc, zc, x1 - x0 + 0.08, z1 - z0 + 0.08, 1.86, QSL, true, {
    rise: 0.2,
    run: 0.15,
    ov0: 0.12,
    ov1: 0.12,
    fin: 1,
  });
  qDoor(G, 0.55, z1 + 0.016, true, 1, { y: 0.13, w: 0.36, h: 0.62, wood: 1, lamp: 1 });
  if (!(hm & 4)) qWin(G, 1.08, 0.36, z1 + 0.016, true, 1, { wood: 1, shut: 1, box: 1, w: 0.18, h: 0.18 });
  qWin(G, 0.45, 1.5, z1 + 0.056, true, 1, { wood: 1, glow: 1 });
  qWin(G, 1.05, 1.5, z1 + 0.056, true, 1, { wood: 1, glow: 1 });
  qWin(G, x1 + 0.056, 1.5, zc, false, 1, { wood: 1, glow: 1 });
  if (!(hm & 2)) qWin(G, x1 + 0.016, 0.85, zc, false, 1, { wood: 1, shut: 1 });
  /* guild sign: crossed hammer and trowel over the door */
  const sy = 0.98;
  bW(G, 0.55, sy, z1 + 0.1, 0.05, 0.05, 0.16, QW2);
  bW(G, 0.55, sy - 0.24, z1 + 0.18, 0.3, 0.24, 0.03, QW1);
  bM(G, 0.55, sy - 0.24, z1 + 0.2, 0.32, 0.26, 0.01, QBR);
  bM(G, 0.49, sy - 0.2, z1 + 0.21, 0.04, 0.17, 0.012, QIR);
  bM(G, 0.49, sy - 0.06, z1 + 0.21, 0.1, 0.05, 0.012, QIR);
  bM(G, 0.61, sy - 0.2, z1 + 0.21, 0.04, 0.12, 0.012, QW3);
  bM(G, 0.61, sy - 0.08, z1 + 0.21, 0.08, 0.07, 0.012, "#b9c0cc");
  /* treadwheel crane at the front right: the wheel faces the street, the jib reaches back over the stone pile */
  const cx = 1.68,
    cz = 1.66;
  bW(G, cx, 0.13, cz, 0.14, 2.5, 0.14, QW2);
  for (const s of [-1, 1]) bW(G, cx + s * 0.26, 0.13, cz, 0.07, 0.72, 0.07, QW1);
  bW(G, cx, 0.82, cz, 0.6, 0.06, 0.08, QW2);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 6.2832,
      r = 0.34;
    bW(G, cx + Math.cos(a) * r, 0.66 + Math.sin(a) * r, cz + 0.1, 0.09, 0.09, 0.07, k % 2 ? QW1 : QW3);
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * 3.1416,
      c = Math.cos(a),
      n = Math.sin(a);
    bW(G, cx, 0.66 - Math.abs(n) * 0.32, cz + 0.1, Math.abs(c) * 0.64 + 0.04, Math.abs(n) * 0.64 + 0.04, 0.04, QW3);
  }
  bM(G, cx, 0.62, cz + 0.14, 0.08, 0.08, 0.04, QIR);
  const jy = 2.5;
  bW(G, cx, jy, cz - 0.42, 0.1, 0.09, 1.04, QW2);
  bW(G, cx, jy - 0.44, cz - 0.2, 0.05, 0.46, 0.05, QW3);
  bW(G, cx, jy - 0.2, cz - 0.3, 0.05, 0.05, 0.26, QW3);
  bW(G, cx, jy + 0.09, cz - 0.92, 0.07, 0.07, 0.07, QW3);
  bP(G, cx, 1.12, cz - 0.88, 0.015, jy - 1.12, 0.015, "#c8b890");
  bM(G, cx, 1.08, cz - 0.88, 0.06, 0.04, 0.06, QIR);
  qStone(G, cx, 0.82, cz - 0.88, 0.24, 0.24, 0.24, { ph: 2 });
  /* yard: cut stone blocks under the crane, a plank stack, a workbench with tools, scaffold poles */
  if (!(hm & 2)) {
    for (const [x, z, y] of [
      [1.56, 0.62, 0.13],
      [1.82, 0.6, 0.13],
      [1.69, 0.61, 0.33],
    ])
      bS(G, x, y, z, 0.22, 0.2, 0.24, QS[((x * 10) | 0) % 4]);
    for (let k = 0; k < 4; k++) bW(G, 1.7, 0.13 + k * 0.05, 0.24, 0.5, 0.045, 0.14, k % 2 ? QW3 : QW1);
  } else
    for (const [x, z, y] of [
      [1.62, 1.12, 0.13],
      [1.86, 1.1, 0.13],
    ])
      bS(G, x, y, z, 0.22, 0.2, 0.24, QS[((x * 10) | 0) % 4]);
  bW(G, 0.62, 0.13, 1.72, 0.62, 0.04, 0.22, QW3);
  for (const s of [-1, 1]) bW(G, 0.62 + s * 0.27, 0.13, 1.72, 0.05, 0.26, 0.18, QW2);
  bW(G, 0.62, 0.39, 1.72, 0.62, 0.04, 0.22, QW3);
  bM(G, 0.5, 0.43, 1.72, 0.18, 0.03, 0.04, "#b9c0cc");
  bW(G, 0.72, 0.43, 1.7, 0.04, 0.03, 0.18, QW1);
  if (!(hm & 9)) {
    for (const [x, z] of [
      [0.06, 0.12],
      [0.06, 1.38],
      [1.42, 0.12],
    ]) {
      bW(G, x, 0.1, z, 0.05, 2.1, 0.05, "#b08a58");
      for (const y of [0.75, 1.45]) bW(G, x, y, z, 0.05, 0.03, 0.05, QW2);
    }
    for (const y of [0.75, 1.45]) {
      bW(G, 0.06, y + 0.03, 0.75, 0.04, 0.03, 1.26, "#b08a58");
      bW(G, 0.74, y + 0.03, 0.12, 1.36, 0.03, 0.04, "#b08a58");
    }
  }
  return toGeo(G);
}

/* ---- market: striped awnings over a counter of goods; merged stalls become one covered bazaar with a clock post ---- */
export function marketGeo(m) {
  m = m || 0;
  const G = newG(),
    { N, E, S, W, nw } = mBits(m);
  bP(G, 1, 0, 1, 2, 0.1, 2, "#a99a7e");
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      if ((i + j) % 2) bS(G, 0.25 + i * 0.5, 0.1, 0.25 + j * 0.5, 0.48, 0.012, 0.48, QS[(i + j) % 4]);
  const x0 = W ? 0 : 0.22,
    x1 = E ? 2 : 1.78,
    z0 = N ? 0 : 0.34,
    z1 = S ? 2 : 1.5,
    y1 = 1.32;
  for (const [x, z] of [
    [x0, z0],
    [x1, z0],
    [x0, z1],
    [x1, z1],
  ])
    if (
      !((x === 0 || x === 2) && (z === 0 || z === 2)) &&
      !(x === 0 && W) &&
      !(x === 2 && E) &&
      !(z === 0 && N) &&
      !(z === 2 && S)
    ) {
      bW(G, x, 0.1, z, 0.1, y1 + (z === z0 ? 0.3 : 0) - 0.1, 0.1, QW2);
      bM(G, x, 0.1, z, 0.14, 0.06, 0.14, QBR);
    }
  if (!N) {
    for (let k = 0; k < 4; k++) bW(G, (x0 + x1) / 2, 0.1 + k * 0.25, z0, x1 - x0 - 0.08, 0.24, 0.06, k % 2 ? QW1 : QW3);
  }
  if (!W) bW(G, x0, 0.1, (z0 + z1) / 2, 0.06, 0.5, z1 - z0 - 0.08, QW3);
  if (!E) bW(G, x1, 0.1, (z0 + z1) / 2, 0.06, 0.5, z1 - z0 - 0.08, QW3);
  const yt = y1 + 0.3,
    ay = (z) => yt - ((z - z0) / Math.max(0.5, z1 - z0 + 0.36)) * 0.5;
  for (let x = 0; x < 2 - 1e-6; x += 0.25) {
    const a = Math.max(x, x0 - 0.1),
      b = Math.min(x + 0.25, x1 + 0.1);
    if (b <= a) continue;
    const c = Math.round(x / 0.25) % 2 ? "#f2ead8" : "#b83a2b";
    for (let k = 0; k < 6; k++) {
      const zz0 = z0 - 0.06 + (k * (z1 - z0 + 0.36)) / 6,
        zz1 = zz0 + (z1 - z0 + 0.36) / 6;
      bC(G, (a + b) / 2, ay((zz0 + zz1) / 2), (zz0 + zz1) / 2, b - a + 0.004, 0.05, zz1 - zz0 + 0.012, c);
    }
    if (!S) {
      bC(G, (a + b) / 2, ay(z1 + 0.3) - 0.12, z1 + 0.31, (b - a) * 0.72, 0.12, 0.03, c);
      bC(G, (a + b) / 2, ay(z1 + 0.3) - 0.16, z1 + 0.31, (b - a) * 0.36, 0.05, 0.03, c);
    }
  }
  if (!S) {
    bW(G, 1, 0.1, z1 - 0.06, x1 - x0 - 0.1, 0.42, 0.22, QW3);
    bW(G, 1, 0.52, z1 - 0.04, x1 - x0 + 0.02, 0.05, 0.3, QW2);
    bW(G, 0.5, 0.57, z1 - 0.04, 0.32, 0.12, 0.22, QW1);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        bP(G, 0.4 + i * 0.1, 0.69, z1 - 0.09 + j * 0.1, 0.07, 0.06, 0.07, (i + j) % 2 ? "#c8282a" : "#e04030");
    bC(G, 0.9, 0.57, z1 - 0.04, 0.16, 0.22, 0.16, "#d8c08a");
    bC(G, 0.9, 0.79, z1 - 0.04, 0.1, 0.06, 0.1, "#e8d29a");
    bC(G, 1.18, 0.57, z1 - 0.04, 0.2, 0.08, 0.2, "#3a5a9a");
    bC(G, 1.18, 0.65, z1 - 0.04, 0.2, 0.06, 0.2, "#7a3a8a");
    bM(G, 1.5, 0.57, z1 - 0.04, 0.04, 0.24, 0.04, QBR);
    bM(G, 1.5, 0.81, z1 - 0.04, 0.34, 0.03, 0.03, QBR);
    bM(G, 1.36, 0.68, z1 - 0.04, 0.12, 0.02, 0.12, QBR2);
    bM(G, 1.64, 0.68, z1 - 0.04, 0.12, 0.02, 0.12, QBR2);
    bM(G, 1.36, 0.7, z1 - 0.04, 0.06, 0.04, 0.06, "#ffd23c");
    qLamp(G, x1 + 0.06, 1.22, z1 + 0.1, false);
    qLamp(G, x0 - 0.06, 1.22, z1 + 0.1, false);
  }
  if (!E) {
    qBarrel(G, 1.86, 0.5, 0.1);
    qBarrel(G, 1.86, 0.82, 0.1);
  }
  if (!W) {
    qCrate(G, 0.12, 0.62, 0.1, 0.24);
    qCrate(G, 0.12, 0.66, 0.34, 0.18);
  }
  if (!m || nw) {
    const sx = nw ? x0 + 0.12 : 1,
      sz = nw ? z0 + 0.12 : z0;
    if (nw) {
      bS(G, sx, 0.1, sz, 0.24, 0.12, 0.24, QSD);
      bM(G, sx, 0.22, sz, 0.08, 2.0, 0.08, QBR);
      bM(G, sx, 2.22, sz, 0.4, 0.4, 0.4, QBR);
      for (const [ax, n] of [
        [1, 1],
        [1, -1],
        [0, 1],
        [0, -1],
      ]) {
        const P = qP(G, sx, 2.42, sz, ax, n);
        P(bP, 0, -0.15, 0.205, 0.28, 0.28, 0.01, "#f4ecd8");
        P(bP, 0, -0.03, 0.21, 0.02, 0.12, 0.01, QIR);
        P(bP, 0.04, -0.02, 0.21, 0.1, 0.02, 0.01, QIR);
      }
      bM(G, sx, 2.62, sz, 0.14, 0.14, 0.14, QBR2);
      qLamp(G, sx + 0.26, 1.6, sz, true);
      qLamp(G, sx - 0.26, 1.6, sz, true);
    } else {
      bW(G, 1, 1.86, z0, 0.06, 0.26, 0.06, QW2);
      bW(G, 1, 2.1, z0, 0.5, 0.06, 0.06, QW2);
      bW(G, 1.15, 1.82, z0 + 0.04, 0.03, 0.28, 0.03, QW2);
      bW(G, 1.15, 1.62, z0 + 0.04, 0.34, 0.22, 0.04, QW1);
      bM(G, 1.15, 1.67, z0 + 0.07, 0.13, 0.13, 0.02, "#ffd23c");
      qFlag(G, x0, 1.62, z0, 0.6);
    }
  }
  return toGeo(G);
}

/* ---- torch: a brass brazier on a stone post ---- */
export function torchGeo() {
  const G = newG();
  bS(G, 0, 0, 0, 0.36, 0.1, 0.36, QSD);
  qStone(G, 0, 0.1, 0, 0.2, 0.2, 0.66);
  bS(G, 0, 0.76, 0, 0.26, 0.06, 0.26, QTR);
  bM(G, 0, 0.82, 0, 0.08, 0.36, 0.08, QBR);
  bM(G, 0, 1.18, 0, 0.3, 0.05, 0.3, QBR);
  [
    [-0.12, 0, 0.03, 0.28],
    [0.12, 0, 0.03, 0.28],
    [0, -0.12, 0.28, 0.03],
    [0, 0.12, 0.28, 0.03],
  ].forEach(([x, z, w, d]) => bP(G, x, 1.23, z, w, 0.16, d, QIR));
  bL(G, 0, 1.23, 0, 0.2, 0.13, 0.2, "#ff8a2a");
  bL(G, 0, 1.36, 0, 0.13, 0.11, 0.13, "#ffc040");
  bL(G, 0, 1.47, 0, 0.06, 0.08, 0.06, "#fff1b0");
  return toGeo(G);
}
