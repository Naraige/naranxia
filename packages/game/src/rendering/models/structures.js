import {
  embassyGeo,
  forgeGeo,
  sappersGeo,
  warRoomGeo,
  beaconGeo,
  orchardGeo,
  bellGeo,
  granaryGeo,
  observatoryGeo,
  sanctuaryGeo,
} from "./bastion-buildings.js";
import { TW } from "../../gameplay/rules.js";
import { bxc, geometryState, newG, toGeo } from "../geometry.js";
import {
  academyGeo,
  barracksGeo,
  farmGeo,
  foresterGeo,
  guildGeo,
  houseGeo,
  marketGeo,
  storageGeo,
  torchGeo,
  woodBarracksGeo,
} from "./buildings.js";
import { castleGeo, castleGeo5, keepGeo, woodCastleGeo, woodCastleGeo5 } from "./castles.js";
import {
  gateGeo,
  gateGeo3,
  towerGeo,
  towerGeo2,
  wallGeo,
  woodGateGeo,
  woodGateGeo3,
  woodTowerGeo,
  woodTowerGeo2,
  woodWallGeo,
} from "./fortifications.js";
import { PAL, thp } from "../../ui/kingdom-theme.js";
import { gOK } from "../../world/routes.js";
import { occ } from "../../world/terrain-state.js";

export const structureModelsState = {
  BLU: undefined,
};

/* ---- structures: connected voxel models ---- */
const ST3 = "#979797",
  STD = "#5f5f5f",
  IRON = "#4a4a52";

export const isW = (tx, ty) => {
  const o = occ.get(ty * TW + tx);
  return (
    !!o && (o.type === "wall" || o.type === "gate" || o.type === "tower" || o.type === "castle" || o.type === "keep")
  );
};

const isWl = (tx, ty) => {
  const o = occ.get(ty * TW + tx);
  return !!o && o.type === "wall";
};

export const connMask = (s) => {
  const x = s.tx,
    y = s.ty,
    n = isW(x, y - 1),
    e = isW(x + 1, y),
    so = isW(x, y + 1),
    w = isW(x - 1, y);
  let m = (n ? 1 : 0) | (e ? 2 : 0) | (so ? 4 : 0) | (w ? 8 : 0);
  if (s.type === "wall") {
    if (!e && !so && isWl(x + 1, y + 1)) m |= 16;
    if (!w && !so && isWl(x - 1, y + 1)) m |= 32;
  }
  return m;
};

/* 2x2 tower: which of the 8 tiles around it hold rampart pieces (2 per side: N, E, S, W) */
export const pMask = (s) => {
  const x = s.tx,
    y = s.ty,
    q = (a, b) => {
      const o = occ.get(b * TW + a);
      return o && o !== s && isW(a, b);
    };
  let m = 0;
  [
    [x, y - 1],
    [x + 1, y - 1],
    [x + 2, y],
    [x + 2, y + 1],
    [x, y + 2],
    [x + 1, y + 2],
    [x - 1, y],
    [x - 1, y + 1],
  ].forEach(([a, b], i) => {
    if (gOK(a, b) && q(a, b)) m |= 1 << i;
  });
  return m;
};

export const WH = 1.7;
export const WT = 0.3;
export const DIRS = [
  [1, 0, -1],
  [2, 1, 0],
  [4, 0, 1],
  [8, -1, 0],
];

/* gate: 2 tiles long (local x -1..1), depth .8 */

/* ---- siege turrets ---- */
const WD = "#7a5230",
  WD2 = "#5a3a20",
  WD3 = "#92643a";

function ballBase() {
  const G = newG();
  bxc(G, 0, 0, 0, 0.92, 0.14, 0.92, STD);
  bxc(G, 0, 0.14, 0, 0.84, 0.08, 0.84, "#6a4a28");
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    bxc(G, Math.cos(a) * 0.36, 0.0, Math.sin(a) * 0.36, 0.14, 0.18, 0.14, ST3);
  }
  bxc(G, 0, 0.22, 0, 0.26, 0.34, 0.26, WD2);
  bxc(G, 0, 0.54, 0, 0.4, 0.07, 0.4, IRON);
  [
    [0.38, -0.3],
    [-0.36, 0.34],
    [0.34, 0.36],
  ].forEach(([x, z]) => {
    bxc(G, x, 0.22, z, 0.22, 0.12, 0.26, "#b89a60");
    bxc(G, x, 0.34, z, 0.14, 0.07, 0.18, "#a88a50");
  });
  bxc(G, -0.36, 0.22, -0.36, 0.1, 0.28, 0.1, WD);
  bxc(G, 0.36, 0.22, -0.36, 0.1, 0.28, 0.1, WD);
  return toGeo(G);
}

export function ballBolt() {
  const G = newG();
  bxc(G, 0, 0.11, 0.12, 0.055, 0.055, 0.96, "#e8dcb8");
  bxc(G, 0, 0.11, 0.66, 0.09, 0.075, 0.14, "#d4dae6");
  bxc(G, 0, 0.11, 0.73, 0.05, 0.05, 0.08, "#f4f8ff");
  bxc(G, 0, 0.11, -0.3, 0.05, 0.06, 0.06, "#c04030");
  return toGeo(G);
}

export function ballHead() {
  const G = newG();
  bxc(G, 0, -0.07, 0, 0.15, 0.13, 1.04, WD3);
  bxc(G, 0, 0.06, 0.04, 0.07, 0.05, 0.86, IRON);
  bxc(G, 0, -0.12, 0.05, 0.1, 0.05, 0.8, WD2);
  bxc(G, 0, -0.04, 0.28, 0.34, 0.2, 0.17, WD2);
  bxc(G, 0, -0.04, 0.28, 0.38, 0.07, 0.19, IRON);
  [1, -1].forEach((sg) => {
    bxc(G, sg * 0.24, -0.02, 0.28, 0.2, 0.12, 0.13, WD);
    bxc(G, sg * 0.42, -0.01, 0.24, 0.18, 0.11, 0.12, WD3);
    bxc(G, sg * 0.57, 0, 0.15, 0.14, 0.1, 0.12, WD);
    bxc(G, sg * 0.66, 0, 0.05, 0.1, 0.1, 0.1, "#a89060");
    bxc(G, sg * 0.34, 0.04, 0.0, 0.62, 0.025, 0.04, "#efe6c8");
    bxc(G, sg * 0.62, 0.04, 0.1, 0.04, 0.025, 0.2, "#efe6c8");
    bxc(G, sg * 0.18, 0.04, -0.12, 0.34, 0.025, 0.04, "#efe6c8");
  });
  bxc(G, 0, -0.02, -0.46, 0.24, 0.2, 0.12, STD);
  bxc(G, 0, 0.05, -0.46, 0.34, 0.05, 0.05, IRON);
  bxc(G, 0.17, 0.05, -0.46, 0.05, 0.18, 0.05, WD);
  bxc(G, 0, 0.14, -0.38, 0.04, 0.34, 0.04, "#3a2f20");
  bxc(G, 0.1, 0.38, -0.38, 0.2, 0.1, 0.03, structureModelsState.BLU);
  bxc(G, 0.05, 0.3, -0.38, 0.1, 0.1, 0.03, structureModelsState.BLU);
  return toGeo(G);
}

export function trebBase() {
  const G = newG();
  [0.34, 1.66].forEach((x) => {
    bxc(G, x, 0, 1, 0.16, 0.14, 1.8, WD2);
    bxc(G, x, 0.14, 0.3, 0.12, 0.12, 0.4, WD);
    bxc(G, x, 0.14, 1.7, 0.12, 0.12, 0.4, WD);
    [
      [0.3, -1],
      [1.7, 1],
    ].forEach(([z, _sg]) => {
      bxc(G, x, 0.14, z * 0.5 + 1 * 0.5, 0.14, 0.1, 0.14, WD);
    });
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      bxc(G, x, 0.14 + t * 1.55, 0.55 + t * 0.45 * 1 - 0.02, 0.12, 0.4, 0.12, WD);
      bxc(G, x, 0.14 + t * 1.55, 1.45 - t * 0.45 + 0.02, 0.12, 0.4, 0.12, WD);
    }
    bxc(G, x, 1.5, 1, 0.2, 0.34, 0.34, IRON);
  });
  bxc(G, 1, 0, 0.28, 1.5, 0.12, 0.14, WD2);
  bxc(G, 1, 0, 1.72, 1.5, 0.12, 0.14, WD2);
  bxc(G, 1, 0.14, 1, 1.4, 0.1, 0.1, WD);
  bxc(G, 1, 0.7, 0.78, 1.3, 0.08, 0.08, WD);
  bxc(G, 1, 0.7, 1.22, 1.3, 0.08, 0.08, WD);
  bxc(G, 1, 1.78, 1, 1.34, 0.12, 0.12, "#3a2f20");
  bxc(G, 1, 0, 1, 0.9, 0.06, 1.6, "#6a5a3a");
  [
    [0.3, 0.3],
    [1.7, 0.3],
    [0.3, 1.7],
    [1.7, 1.7],
  ].forEach(([x, z]) => {
    bxc(G, x, 0, z, 0.28, 0.28, 0.28, ST3);
  });
  bxc(G, 0.1, 0.14, 1.9, 0.2, 0.26, 0.2, "#b89a60");
  bxc(G, 1.9, 0.14, 0.1, 0.22, 0.18, 0.26, "#b89a60");
  [0.55, 1.45].forEach((z) => {
    bxc(G, 1.9, 0.0, z, 0.18, 0.28, 0.2, STD);
  });
  bxc(G, 1.5, 0.5, 1.82, 0.05, 0.34, 0.05, "#3a2f20");
  bxc(G, 1.65, 0.78, 1.82, 0.3, 0.1, 0.03, structureModelsState.BLU);
  return toGeo(G);
}

export function trebArm() {
  const G = newG();
  bxc(G, 0, -0.06, 0.36, 0.16, 0.16, 2.5, WD3);
  bxc(G, 0, -0.04, 1.3, 0.12, 0.12, 0.95, WD);
  bxc(G, 0, -0.1, -0.6, 0.2, 0.22, 0.5, WD2);
  bxc(G, 0, 0.0, 0.3, 0.34, 0.2, 0.2, IRON);
  bxc(G, 0, -0.12, 1.66, 0.05, 0.34, 0.05, "#d4c8a0");
  bxc(G, 0, -0.34, 1.7, 0.34, 0.18, 0.3, "#8a7a50");
  bxc(G, 0, -0.2, 1.7, 0.2, 0.2, 0.2, "#8a8d99");
  return toGeo(G);
}

export function trebCW() {
  const G = newG();
  bxc(G, 0, -0.62, 0, 0.12, 0.58, 0.12, IRON);
  bxc(G, 0, -0.72, 0, 0.9, 0.1, 0.1, IRON);
  bxc(G, 0, -1.2, 0, 0.8, 0.5, 0.56, STD);
  bxc(G, 0, -1.2, 0, 0.82, 0.12, 0.58, structureModelsState.BLU);
  bxc(G, 0, -0.86, 0, 0.84, 0.1, 0.6, ST3);
  bxc(G, 0, -1.58, 0, 0.82, 0.12, 0.58, structureModelsState.BLU);
  bxc(G, 0.42, -1.2, 0, 0.04, 0.2, 0.3, "#e0b030");
  return toGeo(G);
}

export const GEO = {};

/* ---- wooden tier models ---- */
export const ROPE = "#d9c28a";

/* ================= Minecraft-style small buildings (cobble, planks, logs, glass, stair roofs) ================= */
export const HAYC = "#d8b23a";

/* houses merge with aligned neighbours (bits: 1 N, 2 E, 4 S, 8 W): shared walls, one continuous roof */

export const CONNT = new Set(["storage", "barracks", "academy", "market"]);

function mergeMask(s) {
  const T = s.type,
    tx = s.tx,
    ty = s.ty,
    P = s.pl | 0,
    q = (x, y, ex, ey) => {
      if (!gOK(x, y)) return false;
      const o = occ.get(y * TW + x);
      return !!o && o !== s && o.type === T && o.t === 0 && (o.pl | 0) === P && o.tx === ex && o.ty === ey;
    };
  return (
    (q(tx, ty - 1, tx, ty - 2) ? 1 : 0) |
    (q(tx + 2, ty, tx + 2, ty) ? 2 : 0) |
    (q(tx, ty + 2, tx, ty + 2) ? 4 : 0) |
    (q(tx - 1, ty, tx - 2, ty) ? 8 : 0)
  );
}

export function scafGeo(w, d, h) {
  const G = newG(),
    P = "#9a6a38",
    Q = "#6f4a24",
    B = "#c9a36a";
  const x = w / 2 + 0.08,
    z = d / 2 + 0.08;
  [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ].forEach(([a, b]) => bxc(G, a, 0, b, 0.1, h, 0.1, Q));
  for (let y = 0.55; y < h; y += 0.65) {
    bxc(G, 0, y, z, 2 * x, 0.06, 0.07, P);
    bxc(G, 0, y, -z, 2 * x, 0.06, 0.07, P);
    bxc(G, x, y, 0, 0.07, 0.06, 2 * z, P);
    bxc(G, -x, y, 0, 0.07, 0.06, 2 * z, P);
  }
  for (let y = 1.1; y < h; y += 1.3) {
    bxc(G, 0, y, z + 0.06, 2 * x, 0.05, 0.18, B);
    bxc(G, 0, y, -z - 0.06, 2 * x, 0.05, 0.18, B);
  }
  const dz = z + 0.01;
  for (let y = 0; y + 1.3 < h; y += 1.3) {
    const n = Math.max(2, Math.round((x * 2) / 0.5));
    for (let k = 0; k < n; k++) {
      const a = -x + ((k + 0.5) * 2 * x) / n;
      bxc(G, a, y + 0.55, dz, 0.05, 0.7, 0.05, P);
    }
  }
  return toGeo(G);
}

export function sGeo(s, m) {
  const MG =
      s.type === "house" ||
      s.type === "farm" ||
      s.type === "storage" ||
      s.type === "barracks" ||
      s.type === "academy" ||
      s.type === "market",
    hm = MG ? mergeMask(s) : 0;
  s.hm = hm;
  const op = s.type === "tower" && !!s.weapon,
    sv = structureModelsState.BLU,
    fx = s.t === 2 ? "f" + s.ci : "";
  if (s.t === 2) structureModelsState.BLU = PAL[s.ci][1];
  try {
    const fixed =
        s.type === "castle" ||
        s.type === "barracks" ||
        s.type === "farm" ||
        s.type === "storage" ||
        s.type === "house" ||
        s.type === "academy" ||
        s.type === "market" ||
        s.type === "forester" ||
        s.type === "guild" ||
        s.type === "torch" ||
        s.type === "keep" ||
        s.type === "gate" ||
        s.type === "ballista" ||
        s.type === "trebuchet",
      wd = s.tier === 0 && s.type !== "ballista" && s.type !== "trebuchet" && s.type !== "torch",
      WDF = { wall: 1, gate: 1, tower: 1, castle: 1, barracks: 1, keep: 1 },
      k =
        s.type +
        (fixed ? (hm ? "m" + hm : "") : m) +
        fx +
        (wd ? "w" : "") +
        (op ? "o" : "") +
        (s.sz === 5 ? "5" : "") +
        (s.type === "tower" && s.sz === 2 ? "2" : "") +
        (s.type === "gate" && s.gl === 3 ? "3" : "");
    if (wd && !WDF[s.type] && !GEO[k]) {
      const wi = k.lastIndexOf("w"),
        kS = k.slice(0, wi) + k.slice(wi + 1),
        old = GEO[kS];
      delete GEO[kS];
      geometryState.WOODY = true;
      try {
        GEO[k] = sGeo({ ...s, tier: 1 }, m);
      } finally {
        geometryState.WOODY = false;
        if (old) GEO[kS] = old;
        else delete GEO[kS];
      }
      return GEO[k];
    }
    return (
      GEO[k] ||
      (GEO[k] = wd
        ? {
            wall: woodWallGeo,
            tower: s.sz === 2 ? woodTowerGeo2 : woodTowerGeo,
            gate: s.gl === 3 ? woodGateGeo3 : woodGateGeo,
            castle: s.sz === 5 ? woodCastleGeo5 : woodCastleGeo,
            barracks: woodBarracksGeo,
            keep: () => keepGeo(true),
          }[s.type](MG ? hm : m, op)
        : {
            wall: wallGeo,
            tower: s.sz === 2 ? towerGeo2 : towerGeo,
            gate: s.gl === 3 ? gateGeo3 : gateGeo,
            castle: s.sz === 5 ? castleGeo5 : castleGeo,
            barracks: barracksGeo,
            farm: farmGeo,
            storage: storageGeo,
            house: houseGeo,
            academy: academyGeo,
            market: marketGeo,
            forester: foresterGeo,
            observatory: observatoryGeo,
            beacon: beaconGeo,
            forge: forgeGeo,
            embassy: embassyGeo,
            warroom: warRoomGeo,
            sappers: sappersGeo,
            orchard: orchardGeo,
            granary: granaryGeo,
            bell: bellGeo,
            sanctuary: sanctuaryGeo,
            guild: guildGeo,
            torch: torchGeo,
            keep: () => keepGeo(false),
            ballista: ballBase,
            trebuchet: trebBase,
          }[s.type](MG ? hm : m, op))
    );
  } finally {
    structureModelsState.BLU = sv;
  }
}

export function initializeStructureModels() {
  structureModelsState.BLU = thp();
}
