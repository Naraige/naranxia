import { RS2 } from "../../gameplay/rules.js";
import { bxc, geometryState, newG } from "../geometry.js";
import { lighten } from "../kingdom-banner.js";
import { bannerKit, heraldryState, shieldGeo } from "./heraldry.js";
import { pxBannerman, pxCaptain, pxEngineer, pxEnvoy, pxGunner, pxKing, pxScout } from "./royal-skins.js";
import { pxArcher, pxGuard, pxKnight, pxPeasant, skinV2 } from "./soldier-skins.js";
import { PX2 } from "./unit-skins-v2.js";
import { uv2 } from "./unit-style.js";
import { pxBanner, pxCapes } from "./unit-accessories.js";
import { fin, mcHead, mcLimbs, mcTorso, NOWEAP, toolGeos, unitPartsState, vb, vx, VX } from "./unit-parts.js";
import { zombieKit, zombiesState } from "./zombies.js";
import { thd, thp, ths } from "../../ui/kingdom-theme.js";

export const unitsState = {
  ALB: 0,
  ALF: null,
  RKB: 0,
};

export const PXON = true;
let SHZ;
export const alv = () => (unitsState.ALF != null ? unitsState.ALF : (RS2.done.plate ? 1 : 0) + (RS2.done.mail ? 1 : 0));

export const HA = {
  st: "#a9b0be",
  st2: "#878e9d",
  st3: "#666c7a",
  sth: "#cfd5df",
  ml: "#7f8591",
  ml2: "#61666f",
  br: "#c39a45",
  br2: "#e2c06a",
  gd: "#d4a234",
  gd2: "#ecc964",
  gdd: "#9a6e1e",
  lt: "#6b4423",
  lt2: "#4a2e16",
  lt3: "#8a5a32",
  em: "#f4ecd8",
  hx: "#62e4ff",
  dk: "#141218",
};

function hkPut(Gx, m) {
  return (x, y, z, w, h, d, c) => {
    const o = geometryState.BMAT;
    geometryState.BMAT = m;
    try {
      bxc(Gx, x * VX, y * VX, z * VX, w * VX, h * VX, d * VX, c);
    } finally {
      geometryState.BMAT = o;
    }
  };
}

function humanKit(type, AL, P) {
  const { G, HG, LA, LG, AG } = P,
    t = hkPut(G, 0),
    tm = hkPut(G, 4),
    tc = hkPut(G, 7),
    tg = hkPut(G, 5),
    hd = hkPut(HG, 0),
    hm = hkPut(HG, 4),
    hc = hkPut(HG, 7),
    hg = hkPut(HG, 5),
    k = hkPut(LG, 0),
    km = hkPut(LG, 4),
    A = (m, dx, y, z, w, h, d, c) => {
      hkPut(AG, m)(dx, y, z, w, h, d, c);
      hkPut(LA, m)(-2.76 - dx, y + 10.45, z, w, h, d, c);
    },
    AE = (m, dx, y, z, w, h, d, c) => hkPut(AG, m)(dx, y, z, w, h, d, c),
    AW = (m, dx, y, z, w, h, d, c) => hkPut(LA, m)(-2.76 - dx, y + 10.45, z, w, h, d, c),
    P1 = thp(),
    P2 = ths(),
    PD = thd(),
    skin = "#c68a5e";
  /* units board, look B (unit-style.js): new skins, same parts and anchors */
  if (PXON && uv2(type) && PX2[type]) {
    skinV2.on = 1;
    try {
      PX2[type](P, AL);
    } finally {
      skinV2.on = 0;
    }
    if (type === "gunner2") {
      AE(0, 0, -4.65, 1.6, 0.3, 0.3, 7.4, "#8a6a3a");
      AE(0, 0, -4.85, 5.5, 0.68, 0.68, 1.0, "#4a3a2a");
      AE(0, 0, -4.75, -2.3, 0.4, 0.4, 0.4, "#5a4428");
    }
    return null;
  }
  if (PXON && (type === "king" || type === "captain" || type === "bannerman")) {
    ({ king: pxKing, captain: pxCaptain, bannerman: pxBannerman })[type](P, AL);
    return null;
  }
  if (PXON && (type === "gunner" || type === "gunner2")) {
    pxGunner(P, AL);
    if (type === "gunner2") {
      AE(0, 0, -4.65, 1.6, 0.3, 0.3, 7.4, "#8a6a3a");
      AE(0, 0, -4.85, 5.5, 0.68, 0.68, 1.0, "#4a3a2a");
      AE(0, 0, -4.75, -2.3, 0.4, 0.4, 0.4, "#5a4428");
    }
    return { h: 15.6 };
  }
  if (PXON && (type === "peasant" || type === "archer" || type === "guard")) {
    ({ peasant: pxPeasant, archer: pxArcher, guard: pxGuard })[type](P, AL);
    return { h: type === "guard" ? 21 : 15.6 };
  }
  if (PXON && (type === "scout" || type === "engineer" || type === "envoy")) {
    ({ scout: pxScout, engineer: pxEngineer, envoy: pxEnvoy })[type](P, AL);
    return { h: { scout: 16, engineer: 16.4, envoy: 16 }[type] };
  }
  if (type === "scout") {
    const CL = "#4e6b56",
      CLD = "#3a5142";
    mcTorso(G, { shirt: "#5d7a62", belt: HA.lt });
    mcLimbs(G, LG, AG, { pants: "#4a4a3a", sleeve: "#5d7a62", hand: skin, shoes: "#3a2a18" });
    mcHead(G, skin, "#5a3a1a");
    tc(0, 9.45, 0, 4.12, 1.55, 2.26, CL);
    tc(0, 6.4, -1.1, 3.5, 3.1, 0.14, CL);
    tc(0, 6.4, -1.12, 3.56, 0.2, 0.16, CLD);
    t(0, 5.5, 0, 3.98, 0.42, 2.08, HA.lt2);
    t(1.3, 5.6, 1.06, 0.72, 0.72, 0.32, HA.lt);
    tm(1.3, 6.0, 1.24, 0.3, 0.2, 0.04, HA.br);
    hc(0, 14.05, -0.05, 3.98, 0.9, 3.96, CL);
    hc(1.93, 11.0, -0.05, 0.14, 3.4, 3.9, CL);
    hc(-1.93, 11.0, -0.05, 0.14, 3.4, 3.9, CL);
    hc(0, 11.0, -1.96, 3.98, 3.95, 0.14, CL);
    hc(0, 14.5, -1.45, 1.7, 0.75, 1.35, CL);
    hc(0, 13.68, 1.9, 3.98, 0.44, 0.18, CLD);
    AE(0, 0, -5.2, 1.2, 0.56, 0.56, 4.8, "#8a6a3a");
    AE(4, 0, -5.3, 3.2, 0.7, 0.7, 0.7, HA.br);
    AE(4, 0, -5.3, 0.4, 0.64, 0.64, 0.3, HA.br);
    return { h: 15.6 };
  }
  if (type === "engineer") {
    const VE = "#c9852c",
      VED = "#9a6420",
      HH = "#d8b04a";
    mcTorso(G, { shirt: "#6a5a46", belt: HA.lt2 });
    mcLimbs(G, LG, AG, { pants: "#4a4038", sleeve: "#6a5a46", hand: skin, shoes: "#2a2018" });
    mcHead(G, skin, "#4a2e16");
    t(0, 5.5, 0, 3.86, 4.25, 1.98, VE);
    t(0, 6.1, 1.0, 0.12, 3.4, 0.04, VED);
    t(0, 5.5, 0, 3.98, 0.42, 2.08, HA.lt2);
    tm(0, 5.47, 1.06, 0.5, 0.5, 0.06, HA.br);
    t(-1.3, 6.3, -1.3, 2.4, 2.6, 1.2, HA.lt);
    t(-1.3, 6.7, -1.9, 0.5, 2.0, 0.2, "#9aa3b0");
    t(-0.3, 6.9, -1.9, 0.4, 1.6, 0.2, HA.lt3);
    t(0.4, 6.2, -1.9, 0.5, 0.5, 0.2, "#9aa3b0");
    hc(0, 14.1, 0, 4.5, 0.5, 4.5, HH);
    hc(0, 14.6, 0, 3.9, 0.7, 3.9, "#e0bc58");
    hc(0, 15.0, 1.2, 1.2, 0.4, 1.4, HH);
    hd(0, 11.7, 1.9, 3.8, 0.7, 0.1, "#2a2a30");
    hd(-0.95, 11.7, 2.0, 1.0, 0.5, 0.06, "#9ad8ff");
    hd(0.95, 11.7, 2.0, 1.0, 0.5, 0.06, "#9ad8ff");
    AE(0, 0, -5.2, 1.0, 0.56, 0.56, 4.4, "#8a6a3a");
    AE(4, 0, -5.5, 2.9, 1.2, 1.2, 1.0, "#9aa3b0");
    return { h: 15.6 };
  }
  if (type === "envoy") {
    const RB = "#d9d2c0",
      RBD = "#b8b09c",
      SS = "#a83232";
    mcTorso(G, { shirt: "#e4dccb", belt: SS });
    mcLimbs(G, LG, AG, { pants: "#6a6254", sleeve: "#e4dccb", hand: skin, shoes: "#3a2a18" });
    mcHead(G, skin, "#6a4a2a");
    t(0, 5.5, 0, 3.9, 4.3, 2.0, RB);
    t(0, 6.1, 1.0, 0.12, 3.4, 0.04, RBD);
    t(0, 5.5, 0, 3.98, 0.42, 2.08, SS);
    t(0, 9.4, 0, 4.1, 0.8, 2.2, SS);
    hc(0, 14.1, 0, 4.2, 0.5, 4.2, RB);
    hc(0, 14.6, 0, 3.4, 0.6, 3.4, SS);
    AE(0, 0, -3.2, 1.0, 0.5, 7.0, 0.5, "#8a6a3a");
    AE(0, 0, -1.4, 1.0 + 1.5, 0.2, 2.4, 2.6, "#f4f0e6");
    AE(0, 0, -1.4, 1.0 + 1.5, 0.22, 0.7, 2.62, SS);
    return { h: 16 };
  }
  if (type === "peasant") {
    const pv = zombiesState.ZVAR && zombiesState.ZVAR.hint === "p" ? zombiesState.ZVAR.v % 6 : 0,
      psh = ["#8a5a32", "#6e7a3e", "#7c4a42", "#55667a", "#8a7a52", "#6a4a6a"][pv],
      psk = ["#c68a5e", "#d8a07a", "#a8704a", "#c88a62", "#b67e56", "#dca888"][pv],
      phr = ["#5a3a1a", "#2a1a10", "#8a6a3a", "#1e1a18", "#a0522d", "#6a6a62"][pv],
      phat = [0, 2, 0, 1, 3, 0][pv];
    mcTorso(G, { shirt: psh, belt: "#5a3a1a" });
    mcLimbs(G, LG, AG, {
      pants: ["#5a4a30", "#4a4038", "#5e5240", "#3e3a36", "#5a4a30", "#4e4234"][pv],
      sleeve: psh,
      hand: psk,
      shoes: "#3a2a18",
    });
    mcHead(G, psk, phr);
    A(7, 0, -3.0, 0, 1.98, 0.36, 1.98, "#9a6a3c");
    k(0, -5.5, 0.06, 1.96, 1.6, 2.06, "#3a2a18");
    k(0, -4.0, 0.06, 2.02, 0.24, 2.1, "#5a3f24");
    if (AL >= 1) {
      t(0, 5.95, 0, 3.92, 4.3, 2.04, "#a88a5a");
      for (let i = 0; i < 4; i++) t(0, 6.5 + i * 0.95, 1.03, 3.3, 0.13, 0.04, "#7a6038");
      t(0, 6.3, 1.03, 0.13, 3.7, 0.04, "#7a6038");
      t(0, 6.3, -1.03, 0.13, 3.7, 0.04, "#7a6038");
    }
    tc(0, 5.6, 1.06, 2.5, 3.3, 0.08, "#e2d3a8");
    tc(0, 8.9, 1.06, 1.6, 0.9, 0.08, "#e2d3a8");
    tc(-0.7, 9.8, 1.06, 0.16, 1.2, 0.06, "#c9b78a");
    tc(0.7, 9.8, 1.06, 0.16, 1.2, 0.06, "#c9b78a");
    tc(0, 6.6, 1.11, 1.2, 0.9, 0.05, "#cdbd90");
    t(0, 5.8, 0, 3.96, 0.32, 2.16, "#c9a86a");
    t(0.9, 5.3, 1.08, 0.18, 0.6, 0.1, "#c9a86a");
    t(-1.35, 5.62, 1.06, 0.7, 0.78, 0.34, HA.lt);
    tm(-1.35, 6.15, 1.24, 0.22, 0.18, 0.04, HA.br);
    t(0, 10.35, 0, 2.6, 0.62, 2.08, "#7a4e2c");
    if (AL >= 2) {
      A(0, 0.1, -1.05, 0, 2.14, 1.05, 2.14, HA.lt);
      A(4, 0.1, -1.1, 0, 2.18, 0.14, 2.18, HA.br);
      A(0, 0, -4.5, 0, 2.0, 1.3, 2.0, HA.lt);
      A(4, 0, -3.32, 0, 2.06, 0.12, 2.06, HA.br);
    }
    if (phat === 0) {
      hc(0, 14.3, 0, 5.6, 0.4, 5.6, "#e0c060");
      hc(0, 14.7, 0, 3.9, 0.9, 3.9, "#f0d878");
      hc(0, 14.62, 0, 4.0, 0.32, 4.0, "#8a4a2a");
      hc(0, 15.6, 0, 2.6, 0.2, 2.6, "#e8cc68");
    } else if (phat === 1) {
      hc(0, 14.05, 0, 4.0, 0.95, 4.0, "#6a5038");
      hc(0, 14.05, 0, 4.06, 0.25, 4.06, "#4e3a28");
      hc(0, 15.0, -0.4, 2.6, 0.35, 2.8, "#6a5038");
    } else if (phat === 2) {
      hc(0, 13.9, -0.1, 4.04, 1.0, 4.0, "#d8cbaa");
      hc(0, 11.6, -1.98, 4.04, 2.4, 0.16, "#d8cbaa");
      hc(1.98, 12.1, -0.4, 0.16, 1.9, 3.0, "#d8cbaa");
      hc(-1.98, 12.1, -0.4, 0.16, 1.9, 3.0, "#d8cbaa");
      hc(0, 13.85, 1.98, 4.06, 0.22, 0.16, "#b8a984");
    }
    t(0, 6.2, -1.55, 2.8, 2.8, 1.0, "#7a5a2a");
    t(0, 6.8, -2.15, 2.2, 0.6, 0.3, "#9a7a3a");
    t(0, 8.9, -1.55, 2.9, 0.3, 1.06, "#5a3f1c");
    return { h: 15.6 };
  }
  if (type === "gunner" || type === "gunner2") {
    const CO = P1,
      COD = PD,
      LT2 = HA.lt2,
      BRS = HA.br;
    mcTorso(G, { shirt: CO, belt: LT2 });
    mcLimbs(G, LG, AG, { pants: "#3e3a36", sleeve: CO, hand: skin, shoes: "#2a2420" });
    mcHead(G, skin, "#3a2410");
    t(0, 4.5, 0, 3.94, 1.05, 2.0, CO);
    t(0, 4.5, 0, 3.98, 0.22, 2.04, COD);
    tc(0, 5.0, 1.0, 2.6, 4.6, 0.1, "#6a4a2a");
    tc(0, 5.0, 1.0, 2.7, 0.2, 0.12, "#4a321c");
    for (let i = 0; i < 7; i++) t(-1.5 + i * 0.5, 6.0 + i * 0.68, 1.05, 0.62, 0.46, 0.08, LT2);
    for (const [x, y] of [
      [-1.0, 6.6],
      [0, 7.95],
      [1.0, 9.3],
    ]) {
      tm(x, y, 1.13, 0.44, 0.56, 0.2, BRS);
      tm(x, y + 0.56, 1.13, 0.2, 0.16, 0.14, "#7a5a2a");
    }
    t(0, 5.5, 0, 3.98, 0.42, 2.08, LT2);
    tm(0, 5.47, 1.06, 0.52, 0.52, 0.06, BRS);
    t(0, 10.3, 0, 2.7, 0.6, 2.06, COD);
    A(0, 0, -5.5, 0, 2.0, 1.75, 2.0, "#4a3424");
    A(0, 0, -3.85, 0, 2.07, 0.32, 2.07, "#5e4430");
    A(7, 0, -1.2, 0, 2.02, 0.3, 2.02, COD);
    k(0, -5.5, 0.08, 2.0, 2.5, 2.12, "#2a2420");
    k(0, -3.1, 0.08, 2.08, 0.32, 2.2, "#3a3028");
    k(0, -1.0, 0.06, 1.94, 0.3, 1.96, COD);
    hc(0, 14.35, 0, 4.7, 0.34, 4.7, "#2e2a2c");
    hc(0, 14.69, 0, 3.92, 0.78, 3.92, CO);
    hc(0, 14.62, 0, 4.02, 0.24, 4.02, BRS);
    hc(1.55, 15.0, -0.7, 0.3, 1.7, 0.3, "#f2efe6");
    hc(1.55, 16.5, -1.05, 0.3, 0.9, 0.3, "#e0dccf");
    hc(1.55, 17.2, -1.5, 0.26, 0.6, 0.26, "#cfcabc");
    hd(-0.9, 11.55, 1.88, 1.0, 0.38, 0.06, "#6a5a4e");
    hd(0.8, 12.0, 1.88, 0.6, 0.3, 0.06, "#6a5a4e");
    if (type === "gunner2") {
      AE(0, 0, -4.65, 1.6, 0.3, 0.3, 7.4, "#8a6a3a");
      AE(0, 0, -4.85, 5.5, 0.68, 0.68, 1.0, "#4a3a2a");
      AE(0, 0, -4.75, -2.3, 0.4, 0.4, 0.4, "#5a4428");
    }
    return { h: 15.6 };
  }
  if (type === "archer") {
    const HO = "#2f6e35",
      HOD = "#22552a";
    mcTorso(G, { shirt: "#3f9a45", belt: HA.lt });
    mcLimbs(G, LG, AG, { pants: "#6a5a3a", sleeve: "#3f9a45", hand: skin, shoes: "#3a2a18" });
    mcHead(G, skin, "#6a3a18");
    t(0, 5.5, 0, 3.86, 4.25, 1.98, HA.lt3);
    for (let i = 0; i < 4; i++) {
      t(-0.22, 6.25 + i * 0.85, 1.0, 0.34, 0.1, 0.04, HA.lt2);
      t(0.22, 6.25 + i * 0.85, 1.0, 0.34, 0.1, 0.04, HA.lt2);
    }
    t(0, 6.05, 1.0, 0.1, 3.4, 0.04, HA.lt2);
    tc(0, 9.45, 0, 4.12, 1.55, 2.26, HO);
    tc(0, 9.3, 0, 4.16, 0.2, 2.3, HOD);
    tc(0, 6.4, -1.1, 3.5, 3.1, 0.14, HO);
    tc(0, 6.4, -1.12, 3.56, 0.2, 0.16, HOD);
    for (let i = 0; i < 6; i++) t(-1.55 + i * 0.62, 5.9 + i * 0.86, 1.04, 0.66, 0.52, 0.1, HA.lt2);
    t(0.9, 6.0, -1.55, 1.4, 4.0, 1.2, HA.lt);
    tm(0.9, 6.4, -1.55, 1.48, 0.2, 1.28, HA.br);
    tm(0.9, 9.1, -1.55, 1.48, 0.2, 1.28, HA.br);
    for (const [x, z, c] of [
      [0.6, -1.3, "#f2f2f2"],
      [1.1, -1.65, "#e04a3a"],
      [0.82, -1.8, "#f2f2f2"],
      [1.28, -1.3, "#e04a3a"],
    ]) {
      t(x, 9.9, z, 0.08, 0.6, 0.08, "#c8a070");
      tc(x, 10.3, z, 0.24, 0.62, 0.24, c);
    }
    t(0, 5.5, 0, 3.98, 0.45, 2.1, HA.lt2);
    tm(0, 5.47, 1.06, 0.5, 0.5, 0.06, AL >= 2 ? HA.gd : HA.br);
    t(1.3, 5.6, 1.06, 0.72, 0.72, 0.32, HA.lt);
    t(-1.35, 5.6, 1.06, 0.56, 0.6, 0.32, HA.lt);
    AW(0, 0, -4.65, 0, 2.02, 1.55, 2.02, HA.lt);
    AW(4, 0, -3.2, 0, 2.08, 0.14, 2.08, HA.br);
    AE(0, 0, -5.5, 0, 1.98, 1.05, 1.98, HA.lt2);
    k(0, -5.5, 0.08, 1.98, 2.1, 2.12, HA.lt2);
    k(0, -3.55, 0.08, 2.08, 0.32, 2.22, HA.lt);
    hc(0, 14.05, -0.05, 3.98, 0.9, 3.96, HO);
    hc(1.93, 11.0, -0.05, 0.14, 3.4, 3.9, HO);
    hc(-1.93, 11.0, -0.05, 0.14, 3.4, 3.9, HO);
    hc(0, 11.0, -1.96, 3.98, 3.95, 0.14, HO);
    hc(0, 14.5, -1.45, 1.7, 0.75, 1.35, HO);
    hc(0, 15.0, -1.9, 0.9, 0.5, 0.8, HO);
    hc(0, 13.68, 1.9, 3.98, 0.44, 0.18, HOD);
    hc(1.93, 11.0, 1.7, 0.16, 2.9, 0.5, HOD);
    hc(-1.93, 11.0, 1.7, 0.16, 2.9, 0.5, HOD);
    if (AL >= 1) {
      for (const [x, y] of [
        [-1.3, 6.6],
        [1.3, 6.6],
        [-1.3, 7.7],
        [1.3, 7.7],
        [-1.3, 8.7],
        [1.3, 8.7],
      ])
        tm(x, y, 1.0, 0.24, 0.24, 0.06, "#d8c890");
      A(0, 0.12, -0.95, 0, 2.22, 1.2, 2.22, HA.lt);
      A(4, 0.12, -1.0, 0, 2.28, 0.16, 2.28, HA.br);
      for (const z of [-0.6, 0, 0.6]) A(4, 0.12, -0.4, z, 0.2, 0.2, 2.26, "#d8c890");
      AE(0, 0, -4.65, 0, 2.02, 1.55, 2.02, HA.lt);
    }
    if (AL >= 2) {
      A(0, 0, -2.75, 0, 1.96, 1.3, 1.96, HA.ml);
      A(4, 0, -4.55, 0, 2.08, 1.25, 2.08, HA.st3);
      A(4, 0, -3.3, 0, 2.14, 0.14, 2.14, HA.gd);
      tm(0, 10.45, 0, 2.9, 0.55, 2.34, HA.st2);
      hc(0, 13.66, 1.93, 4.02, 0.14, 0.16, HA.gd);
      tm(0, 5.4, 1.1, 0.7, 0.7, 0.06, HA.gd);
      tg(0, 5.55, 1.14, 0.4, 0.4, 0.04, HA.hx);
    }
    return { h: 15.6 };
  }
  /* King Naraige: royal blue enamel plate with gilded edges, ermine collar, crowned great helm */
  if (type === "king") {
    const AR = thp(),
      ARD = thd(),
      ARL = lighten(AR, 0.18),
      GD = HA.gd,
      GD2 = HA.gd2,
      GDD = HA.gdd,
      RED = "#9e1b26",
      ERM = "#f3efe6",
      ERS = "#141418",
      STL = "#c3cad6",
      STL2 = "#e2e6ee",
      STD = "#5a6272",
      DK = "#0b0a0e";
    mcTorso(G, { shirt: ARD, belt: GDD });
    mcLimbs(G, LG, AG, { pants: ARD, sleeve: ARD, hand: STL, shoes: STD, bare: false });
    tm(0, 6.25, 0, 4.18, 4.5, 2.42, AR);
    tm(0, 6.35, 0, 0.62, 4.3, 2.52, ARL);
    tm(0, 10.42, 0, 4.24, 0.42, 2.52, GD);
    tm(0, 6.15, 0, 4.26, 0.36, 2.54, GD);
    for (const s of [-1, 1]) tm(s * 2.04, 6.35, 0, 0.22, 4.1, 2.52, GD);
    tm(0, 7.45, 1.25, 1.8, 1.8, 0.12, GD);
    tm(0, 7.8, 1.32, 1.1, 1.1, 0.08, GD2);
    tg(0, 8.1, 1.37, 0.5, 0.5, 0.06, "#ff3b3b");
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4,
        r = k % 2 ? 1.18 : 1.36,
        s = k % 2 ? 0.28 : 0.36;
      tm(Math.sin(a) * r, 8.35 + Math.cos(a) * r - s / 2, 1.26, s, s, 0.1, k % 2 ? GD2 : GD);
    }
    tm(0, 5.3, 0, 4.32, 0.62, 2.58, GD);
    tm(0, 5.2, 1.3, 1.1, 0.82, 0.12, GD2);
    tg(0, 5.42, 1.37, 0.44, 0.38, 0.06, "#3a7aff");
    for (const s of [-1, 1]) {
      tm(s * 1.1, 3.5, 1.02, 1.78, 1.85, 0.44, AR);
      tm(s * 1.1, 3.45, 1.03, 1.84, 0.26, 0.5, GD);
      tm(s * 1.1, 4.45, 1.05, 1.82, 0.16, 0.48, GDD);
    }
    tc(0, 1.6, 1.2, 1.25, 3.75, 0.14, RED);
    tc(0, 1.55, 1.22, 1.35, 0.24, 0.16, GD);
    for (const s of [-1, 1]) tc(s * 0.66, 1.6, 1.22, 0.12, 3.75, 0.16, GD);
    tm(0, 3.25, 1.29, 0.55, 0.55, 0.06, GD2);
    tc(0, 10.45, 0, 4.3, 1.1, 3.05, ERM);
    for (const x of [-1.6, -0.5, 0.55, 1.6]) tc(x, 10.72, 1.53, 0.24, 0.42, 0.08, ERS);
    for (const x of [-1.1, 0, 1.1]) tc(x, 10.72, -1.53, 0.24, 0.42, 0.08, ERS);
    for (const s of [-1, 1]) tc(s * 2.15, 10.72, 0.35 * s, 0.08, 0.42, 0.24, ERS);
    tm(0, 10.2, 1.55, 1.0, 0.6, 0.1, GD);
    tg(0, 10.32, 1.61, 0.36, 0.36, 0.05, "#ff3b3b");
    A(4, 0.42, -0.2, 0, 3.3, 1.3, 3.1, AR);
    A(4, 0.42, -0.3, 0, 3.36, 0.24, 3.16, GD);
    A(4, 0.42, 1.06, 0, 2.3, 0.22, 2.3, GD2);
    A(4, 0.48, -1.1, 0, 3.08, 0.88, 2.9, AR);
    A(4, 0.48, -1.18, 0, 3.14, 0.2, 2.96, GD);
    A(4, 0.54, -1.88, 0, 2.78, 0.72, 2.6, ARD);
    A(4, 0.54, -1.95, 0, 2.84, 0.18, 2.66, GD);
    A(4, 0, -4.15, 0, 2.1, 1.42, 2.1, AR);
    A(4, 0, -2.85, 0, 2.16, 0.24, 2.16, GD);
    A(4, 0, -4.22, 0, 2.16, 0.2, 2.16, GD);
    A(4, 0, -5.62, 0, 2.18, 1.44, 2.18, STL);
    A(4, 0, -5.66, 0, 2.22, 0.3, 2.22, STD);
    km(0, -2.55, 0, 2.04, 2.45, 2.04, AR);
    km(0, -3.3, 0.6, 1.6, 1.1, 1.02, GD);
    km(0, -3.05, 1.12, 0.62, 0.6, 0.08, GD2);
    km(0, -5.2, 0.03, 2.08, 2.05, 2.08, AR);
    km(0, -3.18, 0, 2.12, 0.16, 2.12, GDD);
    k(0, -5.62, 0.3, 2.12, 0.66, 2.52, STD);
    km(0, -5.6, 1.5, 1.5, 0.46, 0.12, GD);
    hm(0, 10.55, 0, 3.3, 0.7, 3.1, STD);
    hm(0, 10.9, 0, 4.22, 4.08, 4.22, STL);
    hc(0, 14.98, 0, 3.9, 0.78, 3.9, RED);
    hc(0, 15.76, 0, 2.9, 0.32, 2.9, RED);
    hm(0, 10.84, 0, 4.3, 0.32, 4.3, GD);
    hm(0, 11.0, 2.09, 3.86, 3.85, 0.14, STL2);
    hd(0, 12.76, 2.18, 3.24, 0.36, 0.06, DK);
    hd(0, 11.3, 2.18, 0.38, 1.46, 0.06, DK);
    for (const x of [-1.25, -0.85, 0.85, 1.25]) for (const y of [11.45, 11.95]) hd(x, y, 2.18, 0.2, 0.2, 0.05, DK);
    hm(0, 13.12, 2.2, 3.42, 0.18, 0.06, GD);
    hm(0, 12.56, 2.2, 3.42, 0.18, 0.06, GD);
    hm(0, 13.3, 2.22, 0.36, 1.68, 0.08, GD);
    for (const s of [-1, 1]) {
      hm(s * 2.13, 11.25, -0.15, 0.1, 2.9, 3.2, AR);
      hm(s * 2.18, 12.15, 0.25, 0.1, 1.0, 1.0, GD);
      hm(s * 2.22, 12.4, 0.25, 0.08, 0.5, 0.5, GD2);
    }
    hc(0, 11.4, -2.2, 3.3, 2.9, 0.16, RED);
    hc(0, 11.3, -2.24, 3.4, 0.22, 0.18, GD);
    hm(0, 14.3, 0, 4.52, 0.8, 4.52, GD);
    hm(0, 14.24, 0, 4.58, 0.18, 4.58, GDD);
    hm(0, 15.02, 0, 4.58, 0.14, 4.58, GD2);
    hg(0, 14.45, 2.29, 0.58, 0.5, 0.07, "#ff2f3f");
    for (const s of [-1, 1]) hg(s * 1.22, 14.52, 2.29, 0.34, 0.34, 0.06, "#3a7aff");
    for (const s of [-1, 1]) hg(s * 2.29, 14.48, 0, 0.07, 0.44, 0.44, "#2fd07a");
    hg(0, 14.45, -2.29, 0.5, 0.46, 0.07, "#ff2f3f");
    const fl = (x, z, al) => {
      hm(x, 15.1, z, 0.52, 1.2, 0.52, GD);
      hm(x + (al ? 0 : 0.44), 15.42, z + (al ? 0.44 : 0), 0.36, 0.46, 0.36, GD);
      hm(x - (al ? 0 : 0.44), 15.42, z - (al ? 0.44 : 0), 0.36, 0.46, 0.36, GD);
      hm(x, 16.28, z, 0.36, 0.46, 0.36, GD2);
      hg(x, 16.72, z, 0.26, 0.26, 0.26, "#fff3d6");
    };
    fl(0, 2.14, 0);
    fl(0, -2.14, 0);
    fl(2.14, 0, 1);
    fl(-2.14, 0, 1);
    hm(0, 16.06, 0, 0.44, 0.38, 3.7, GD);
    hm(0, 16.06, 0, 3.7, 0.38, 0.44, GD);
    for (const s of [-1, 1]) {
      hm(0, 15.3, s * 1.75, 0.44, 0.8, 0.44, GD);
      hm(s * 1.75, 15.3, 0, 0.44, 0.8, 0.44, GD);
    }
    hm(0, 16.44, 0, 0.8, 0.72, 0.8, GD2);
    hm(0, 17.16, 0, 0.28, 0.62, 0.28, GD);
    hg(0, 17.78, 0, 0.22, 0.22, 0.22, "#fff3d6");
    for (const [x, z] of [
      [1.98, 1.98],
      [-1.98, 1.98],
      [1.98, -1.98],
      [-1.98, -1.98],
    ]) {
      hm(x, 15.1, z, 0.38, 0.78, 0.38, GD);
      hg(x, 15.88, z, 0.3, 0.3, 0.3, "#f6f0e2");
    }
    return { h: 23 };
  }
  /* royal guard: blue plate, crimson tabard with the royal sun, plumed great helm */
  if (type === "guard") {
    const AR = thp(),
      ARD = thd(),
      ARL = lighten(AR, 0.16),
      GD = HA.gd,
      GD2 = HA.gd2,
      GDD = HA.gdd,
      RED = "#9e1b26",
      STL = "#c3cad6",
      STD = "#5a6272",
      DK = HA.dk;
    mcTorso(G, { shirt: ARD, belt: GDD });
    mcLimbs(G, LG, AG, { pants: ARD, sleeve: ARD, hand: STL, shoes: STD, bare: false });
    tm(0, 6.3, 0, 4.12, 4.4, 2.36, AR);
    tm(0, 10.36, 0, 4.18, 0.4, 2.46, GD);
    tm(0, 6.2, 0, 4.2, 0.32, 2.44, GD);
    for (const s of [-1, 1]) tm(s * 2.0, 6.4, 0, 0.2, 4.0, 2.44, GD);
    tc(0, 1.9, 1.22, 2.5, 8.05, 0.12, RED);
    for (const s of [-1, 1]) tc(s * 1.2, 1.9, 1.25, 0.14, 8.05, 0.14, GD);
    tc(0, 1.85, 1.25, 2.6, 0.24, 0.14, GD);
    tc(0, 6.9, 1.3, 1.4, 1.4, 0.06, GD);
    tc(0, 7.2, 1.34, 0.8, 0.8, 0.05, GD2);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4,
        r = k % 2 ? 0.92 : 1.06,
        s = k % 2 ? 0.22 : 0.3;
      tc(Math.sin(a) * r, 7.6 + Math.cos(a) * r - s / 2, 1.31, s, s, 0.06, GD);
    }
    tm(0, 5.3, 0, 4.26, 0.55, 2.62, GDD);
    tm(0, 5.25, 1.32, 0.8, 0.65, 0.08, GD);
    A(4, 0.36, -0.25, 0, 3.0, 1.15, 2.8, AR);
    A(4, 0.36, -0.33, 0, 3.06, 0.22, 2.86, GD);
    A(4, 0.42, -1.05, 0, 2.7, 0.75, 2.5, ARD);
    A(4, 0.42, -1.12, 0, 2.76, 0.18, 2.56, GD);
    A(4, 0, -4.1, 0, 2.06, 1.35, 2.06, AR);
    A(4, 0, -2.85, 0, 2.12, 0.22, 2.12, GD);
    A(4, 0, -5.6, 0, 2.14, 1.4, 2.14, STL);
    km(0, -2.5, 0, 2.0, 2.4, 2.0, AR);
    km(0, -3.2, 0.58, 1.5, 1.0, 0.95, GD);
    km(0, -5.2, 0.03, 2.04, 2.0, 2.04, AR);
    k(0, -5.6, 0.28, 2.08, 0.62, 2.42, STD);
    hm(0, 10.55, 0, 3.2, 0.65, 3.0, STD);
    hm(0, 10.92, 0, 4.12, 4.06, 4.12, AR);
    hm(0, 14.98, 0, 3.7, 0.4, 3.7, AR);
    hm(0, 10.86, 0, 4.2, 0.3, 4.2, GD);
    hm(0, 13.0, 0, 4.2, 0.3, 4.2, GD);
    hm(0, 11.0, 0, 0.42, 3.98, 4.2, ARL);
    for (const s of [-1, 1]) hd(s * 0.95, 12.36, 2.08, 1.38, 0.36, 0.1, DK);
    hd(0, 11.2, 2.08, 0.42, 1.52, 0.1, DK);
    hm(0, 12.74, 2.11, 3.1, 0.14, 0.08, GD);
    hm(0, 13.35, 2.1, 0.5, 0.7, 0.1, GD);
    hm(0, 14.05, 2.1, 0.3, 0.3, 0.1, GD2);
    for (const s of [-1, 1]) hm(s * 2.08, 12.2, 0.2, 0.08, 0.6, 0.6, GD);
    hm(0, 15.32, 0, 0.5, 0.42, 3.5, GD);
    hd(0, 10.6, -1.55, 3.6, 0.9, 1.0, ARD);
    return { h: 21 };
  }
  /* knight / captain / bannerman */
  if (type === "knight" && PXON) {
    pxKnight(P, AL);
    return null;
  }
  const cap = type === "captain",
    ban = type === "bannerman",
    pl = cap ? HA.gd : HA.st,
    plh = cap ? HA.gd2 : HA.sth,
    pld = cap ? HA.gdd : HA.st2,
    tr = cap ? HA.sth : AL >= 2 ? HA.gd : HA.br;
  mcTorso(G, { shirt: P1, belt: P2 });
  mcLimbs(G, LG, AG, { pants: "#55555e", sleeve: HA.ml, hand: skin, shoes: "#3a3a42", bare: false });
  mcHead(G, skin, ban ? "#4a2e16" : null);
  t(0, 5.5, 0, 3.86, 5.5, 1.98, HA.ml);
  A(0, 0, -5.4, 0, 1.9, 5.4, 1.9, HA.ml);
  k(0, -5.4, 0, 1.9, 5.3, 1.9, HA.ml2);
  const b0 = ban ? 7.7 : 6.9;
  tm(0, b0, 0, 3.62, 10.65 - b0, 2.12, pl);
  tm(0, b0 + 0.2, 0, 0.5, 10.4 - b0, 2.26, plh);
  tm(0, 10.45, 0, 3.1, 0.62, 2.36, pld);
  if (!ban) for (const s of [-1, 1]) tm(s * 1.55, 7.4, 0, 0.5, 2.4, 2.18, pld);
  tc(0, 5.0, 1.1, 2.2, 4.3, 0.14, P1);
  tc(0, 5.0, -1.1, 2.2, 4.3, 0.14, PD);
  tc(-1.08, 5.0, 1.12, 0.12, 4.3, 0.16, tr);
  tc(1.08, 5.0, 1.12, 0.12, 4.3, 0.16, tr);
  tc(0, 5.0, 1.12, 2.24, 0.16, 0.16, tr);
  tc(0, 6.05, 1.19, 0.42, 2.6, 0.04, HA.em);
  tc(0, 7.6, 1.19, 1.45, 0.42, 0.04, HA.em);
  t(0, 5.82, 0, 3.98, 0.5, 2.4, HA.lt2);
  tm(0, 5.76, 1.2, 0.62, 0.62, 0.06, tr);
  const pw = ban ? 2.3 : 2.55,
    ph = ban ? 1.5 : 1.85;
  A(4, 0.18, 0.6 - ph, 0, pw, ph, pw, pl);
  A(4, 0.18, 0.6, 0, pw - 0.5, 0.3, pw - 0.3, plh);
  A(4, 0.32, 0.1 - ph, 0, pw - 0.2, 0.5, pw - 0.15, pld);
  A(4, 0.18, 0.52 - ph, 0, pw + 0.06, 0.16, pw + 0.08, tr);
  if (!ban) {
    A(4, 0, -2.65, 0, 1.98, 1.0, 1.98, pld);
    A(4, 0.62, -3.25, -0.1, 0.8, 0.8, 1.3, pl);
  }
  A(ban ? 0 : 4, 0, -5.5, 0, 2.04, 2.0, 2.04, ban ? HA.lt : pl);
  A(4, 0, -3.62, 0, 2.18, 0.28, 2.18, tr);
  A(4, 0, -5.5, 0, 2.1, 0.5, 2.1, ban ? HA.lt2 : pld);
  if (!ban) {
    km(0, -2.3, 0.02, 1.98, 2.1, 1.98, pl);
    km(0, -1.55, 0.55, 1.94, 1.5, 0.98, pld);
    km(0, -1.62, 1.02, 1.96, 0.14, 0.1, tr);
  }
  km(0, -3.05, 0.62, 1.3, 0.8, 0.9, plh);
  km(0, -5.0, 0, 1.98, 2.0, 1.98, ban ? HA.st2 : pl);
  km(0, -5.5, 0.15, 2.02, 0.56, 2.26, pld);
  if (!ban) {
    hm(0, 10.95, 0, 4.0, 3.95, 4.0, pl);
    hm(0, 13.15, 0, 4.14, 0.4, 4.14, tr);
    hm(0, 11.0, 0, 0.42, 3.9, 4.12, plh);
    hd(-0.9, 12.45, 2.06, 1.31, 0.34, 0.12, HA.dk);
    hd(0.9, 12.45, 2.06, 1.31, 0.34, 0.12, HA.dk);
    for (const [x, y] of [
      [0.75, 11.6],
      [1.15, 11.6],
      [0.75, 11.95],
      [1.15, 11.95],
    ])
      hd(x, y, 2.06, 0.17, 0.17, 0.12, HA.dk);
    hm(0, 14.9, 0, 3.4, 0.3, 3.4, pld);
    hm(0, 15.2, 0, 0.5, 0.32, 3.0, plh);
    hd(0, 10.62, -1.55, 3.6, 0.9, 1.0, HA.ml);
  } else {
    hd(0, 13.95, 0, 3.98, 0.85, 3.98, HA.ml);
    hd(1.93, 11.0, 0, 0.14, 3.8, 3.98, HA.ml);
    hd(-1.93, 11.0, 0, 0.14, 3.8, 3.98, HA.ml);
    hd(0, 11.0, -1.93, 3.98, 3.8, 0.14, HA.ml);
    hm(0, 14.3, 0, 5.0, 0.28, 5.0, pl);
    hm(0, 14.58, 0, 3.7, 0.75, 3.7, pl);
    hm(0, 15.33, 0, 2.5, 0.25, 2.5, plh);
    hm(0, 14.58, 0, 3.8, 0.2, 3.8, tr);
  }
  if (AL >= 1) {
    A(4, 0.3, 0.25, 0, pw - 0.25, 0.5, pw - 0.1, plh);
    A(4, -0.5, 0.55, 0, 0.3, 0.85, pw - 0.3, pl);
    tm(0, 6.15, 0, 3.3, 0.75, 2.22, pld);
    if (!ban) {
      hm(0, 15.2, 0, 0.36, 0.8, 3.2, tr);
      km(0.75, -3.15, 0.4, 0.3, 0.75, 0.95, pl);
      km(-0.75, -3.15, 0.4, 0.3, 0.75, 0.95, pl);
    } else hm(0, 15.58, 0, 0.4, 0.3, 0.4, tr);
  }
  if (AL >= 2) {
    tm(0, 9.25, 1.19, 1.0, 1.0, 0.08, HA.gd);
    tg(0, 9.45, 1.24, 0.6, 0.6, 0.04, HA.hx);
    A(4, 1.0, -0.25, 0, 0.3, 1.35, 1.5, HA.gd);
    A(4, 0, -5.5, 0, 2.14, 0.5, 2.14, HA.gd);
    if (type === "knight") {
      hc(0, 15.95, -0.3, 0.42, 0.55, 2.8, P1);
      hc(0, 15.5, -1.75, 0.42, 0.9, 0.6, P1);
      hc(0, 15.2, -2.05, 0.42, 0.9, 0.5, P2);
    }
    if (ban) {
      hm(0, 14.3, 0, 5.06, 0.1, 5.06, HA.gd);
      tg(0, 14.65, 1.86, 0.4, 0.4, 0.06, HA.hx);
    }
  }
  return null;
}

function mcModel(type, _z) {
  const G = newG(),
    HG = newG(),
    LA = newG(),
    LG = newG(),
    AG = newG(),
    P0 = { G, HG, LA, hy: 11, lax: 2.2 };
  unitPartsState.RT = P0;
  let sc = 1.35,
    h = 15.6,
    parts = null;
  if (
    type === "zombie" ||
    type === "husk" ||
    type === "runner" ||
    type === "brute" ||
    type === "bomber" ||
    type === "acid" ||
    type === "miner"
  ) {
    sc = { zombie: 1.35, husk: 1.0, runner: 1.2, brute: 2.15, bomber: 1.5, acid: 1.3, miner: 1.35 }[type];
    if (type === "brute") h = 18;
    zombieKit(type, zombiesState.ZVAR, { G, HG, LA, LG, AG });
  } else if (type === "peasant" || type === "archer" || type === "gunner" || type === "gunner2") {
    humanKit(type, unitsState.ALB, { G, HG, LA, LG, AG });
  } else {
    const cap = type === "captain";
    humanKit(type, unitsState.ALB, { G, HG, LA, LG, AG });
    if (cap) {
      h = 19;
      P0.X = { cape: newG(), plume: newG() };
      vb(G, 0, 14.5, 0, 1.4, 0.6, 3.6, "#d03030");
      vx("cape", 0, -9, -0.4, 4.2, 9, 0.5, thp());
      vx("cape", 0, -9.4, -0.4, 4.4, 0.8, 0.7, "#e6b83a");
      vx("plume", 0, 0, 0, 1.2, 1.1, 1.4, "#d03030");
      vx("plume", 0, 1.0, -1.1, 1.0, 1.4, 2.4, "#e04040");
      vx("plume", 0, 1.0, -3.4, 0.9, 1.2, 2.4, "#ff6a5a");
      vx("plume", 0, 0.2, -5.4, 0.7, 1.0, 2.2, "#ff8a7a");
      parts = [
        { k: "cape", x: 0, y: 10.8 * VX, z: -1.2 * VX },
        { k: "plume", x: 0, y: 15.2 * VX, z: -0.6 * VX },
      ];
    }
    if (type === "bannerman") {
      h = 40;
      const B = bannerKit(G);
      P0.X = B.X;
      parts = B.parts;
      if (PXON) pxBanner(B.X);
    }
    if (type === "king") {
      h = 23;
      sc = 1.72;
      P0.X = { cape: newG(), cape2: newG() };
      const L1 = 5.0,
        L2 = 5.3,
        RED = "#9e1b26",
        REDD = "#6c111b",
        REDL = "#b8283a",
        ERM = "#f3efe6",
        ERS = "#141418",
        GD = HA.gd,
        GD2 = HA.gd2;
      vx("cape", 0, -L1, -0.42, 5.6, L1, 0.5, RED);
      for (const x of [-1.95, -0.65, 0.65, 1.95]) {
        vx("cape", x, -L1, -0.69, 0.3, L1 - 0.9, 0.06, REDD);
        vx("cape", x + 0.3, -L1, -0.69, 0.18, L1 - 0.9, 0.05, REDL);
      }
      for (const s of [-1, 1]) {
        vx("cape", s * 2.62, -L1, -0.42, 0.36, L1, 0.56, ERM);
        for (let y = -1.3; y > -L1; y -= 1.25) vx("cape", s * 2.62, y, -0.72, 0.16, 0.3, 0.05, ERS);
      }
      vx("cape", 0, -0.95, -0.42, 6.0, 0.95, 0.66, ERM);
      for (const x of [-2.3, -1.15, 0, 1.15, 2.3]) vx("cape", x, -0.62, -0.77, 0.22, 0.3, 0.05, ERS);
      vx("cape", 0, -4.35, -0.72, 1.7, 1.7, 0.08, GD);
      vx("cape", 0, -4.0, -0.77, 1.0, 1.0, 0.06, GD2);
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4,
          r = k % 2 ? 1.15 : 1.32,
          s = k % 2 ? 0.26 : 0.34;
        vx("cape", Math.sin(a) * r, -3.5 + Math.cos(a) * r - s / 2, -0.73, s, s, 0.06, k % 2 ? GD2 : GD);
      }
      vx("cape2", 0, -L2, -0.42, 6.6, L2, 0.5, RED);
      for (const x of [-2.3, -0.78, 0.78, 2.3]) {
        vx("cape2", x, -L2 + 0.5, -0.69, 0.32, L2 - 0.5, 0.06, REDD);
        vx("cape2", x + 0.32, -L2 + 0.5, -0.69, 0.2, L2 - 0.5, 0.05, REDL);
      }
      for (const s of [-1, 1]) {
        vx("cape2", s * 3.12, -L2, -0.42, 0.36, L2, 0.56, ERM);
        for (let y = -0.6; y > -L2; y -= 1.25) vx("cape2", s * 3.12, y, -0.72, 0.16, 0.3, 0.05, ERS);
      }
      vx("cape2", 0, -L2 - 0.32, -0.42, 6.7, 0.5, 0.62, GD);
      vx("cape2", 0, -L2 + 0.3, -0.42, 6.66, 0.14, 0.6, GD2);
      parts = [
        { k: "cape", x: 0, y: 10.75 * VX, z: -1.32 * VX },
        { k: "cape2", par: "cape", x: 0, y: -L1 * VX, z: 0 },
      ];
    }
    if (type === "guard") {
      h = 21;
      sc = 1.5;
      P0.X = { cape: newG(), plume: newG() };
      const L = 7.6,
        W = 4.5,
        RED = "#9e1b26",
        REDD = "#6c111b";
      vx("cape", 0, -L, -0.4, W, L, 0.5, RED);
      for (const x of [-1.4, 0, 1.4]) vx("cape", x, -L + 0.3, -0.66, 0.26, L - 1.2, 0.05, REDD);
      vx("cape", 0, -L - 0.3, -0.4, W + 0.1, 0.45, 0.6, HA.gd);
      vx("cape", 0, -0.7, -0.4, W + 0.2, 0.7, 0.62, thd());
      vx("plume", 0, 0, 0, 0.5, 0.9, 1.2, RED);
      vx("plume", 0, 0.3, -1.0, 0.48, 1.1, 1.6, RED);
      vx("plume", 0, 0.1, -2.4, 0.46, 1.0, 1.6, REDD);
      vx("plume", 0, -0.4, -3.6, 0.42, 0.9, 1.2, REDD);
      parts = PXON
        ? [{ k: "cape", x: 0, y: 10.8 * VX, z: -1.45 * VX }]
        : [
            { k: "cape", x: 0, y: 10.8 * VX, z: -1.3 * VX },
            { k: "plume", x: 0, y: 15.55 * VX, z: 0.9 * VX },
          ];
    }
  }
  if (PXON) pxCapes(type, P0);
  const T = toolGeos(),
    r = fin({ G, HG, LA, LG, AG, parts: parts, X: P0.X }, { hip: 5.5, sh: 10.4, neck: 11, lx: 0.95, ax: 2.76, h, sc });
  r.tools = type === "peasant" ? T : null;
  r.T = T;
  r.weap =
    NOWEAP || heraldryState.MVAR === "cine"
      ? null
      : type === "knight"
        ? "sword"
        : type === "captain"
          ? "gsword"
          : type === "king"
            ? "rsword"
            : type === "guard"
              ? "halberd"
              : type === "spearman"
                ? "spear"
                : type === "archer"
                  ? "bow"
                  : null;
  r.shield =
    (type === "knight" || type === "captain" || type === "guard") && heraldryState.MVAR !== "cine"
      ? shieldGeo(type, unitsState.ALB)
      : null;
  r.shp = [0.2 * VX, -5.0 * VX, (PXON ? SHZ : 2.1) * VX];
  unitPartsState.RT = null;
  return r;
}

export function mkModel0(type, z) {
  return mcModel(type, z);
}

export function initializeUnits() {
  SHZ = +(window.__SHZ || 1.35);
}
