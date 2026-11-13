import { bxc, geometryState, newG, toGeo } from "../geometry.js";
import { lighten } from "../kingdom-banner.js";
import { vb, VX } from "./unit-parts.js";
import { HA, PXON } from "./units.js";
import { pxCaptainShield, pxGuardShield, pxShield } from "./weapons.js";
import { thd, thp, ths } from "../../ui/kingdom-theme.js";
import { gear2 } from "./gear-style.js";
import { g2Pole } from "./gear2.js";

export const heraldryState = {
  MVAR: "",
};

/* ================= v70: heater shields on their own mesh, heraldic banner, title army ================= */

const HER = {
  chev: [".....#.....", "....###....", "...##.##...", "..##...##..", ".##.....##.", "##.......##"],
  crown: ["#...#...#", "##.###.##", "#########", "#r#b#r#b#", "#########"],
  fleur: [
    ".........#.........",
    ".........#.........",
    "........###........",
    "........###........",
    ".......#####.......",
    ".......#####.......",
    ".####..#####..####.",
    ".#####.#####.#####.",
    "#######.###.#######",
    "###..##.###.##..###",
    ".#....##.#.##....#.",
    ".#....##.#.##....#.",
    ".......#.#.#.......",
    "....###########....",
    "....###########....",
    "......##.#.##......",
    ".....##..#..##.....",
    ".....#...#...#.....",
  ],
};

/* pixel emblem -> boxes (horizontal runs merged); put(m,x,y0,z,w,h,d,c) with x = centre, y0 = bottom */
function embPut(rows, put, cx, ytop, z, px, d, col, keep) {
  const W = rows[0].length;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    let x = 0;
    while (x < W) {
      const ch = row[x];
      if (ch === ".") {
        x++;
        continue;
      }
      let e = x;
      while (e + 1 < W && row[e + 1] === ch) e++;
      const n = e - x + 1,
        mx = cx + (x + n / 2 - W / 2) * px,
        y = ytop - (r + 1) * px;
      if (!keep || keep(mx, y, n * px)) {
        const q = col[ch] || col["#"];
        put(q[0], mx, y, z, n * px, px, d, q[1]);
      }
      x = e + 1;
    }
  }
}

/* heater shield, face toward +z, origin = strap point; kind knight|captain, AL armour level */
export function shieldGeo(kind, AL) {
  if (PXON && /^knight/.test(kind)) return pxShield(AL, kind.slice(6));
  if (PXON && /^guard/.test(kind)) return pxGuardShield(AL, kind.slice(5));
  if (PXON && /^captain/.test(kind)) return pxCaptainShield(AL, kind.slice(7));
  const G = newG(),
    put = (m, x, y, z, w, h, d, c) => {
      const o = geometryState.BMAT;
      geometryState.BMAT = m;
      try {
        bxc(G, x * VX, y * VX, z * VX, w * VX, h * VX, d * VX, c);
      } finally {
        geometryState.BMAT = o;
      }
    };
  if (kind === "guard") {
    const F = thp(),
      FL = lighten(F, 0.12),
      GD = HA.gd,
      GD2 = HA.gd2,
      GDD = HA.gdd,
      W = 4.9,
      Y0 = -6.2,
      Y1 = 3.3,
      H = Y1 - Y0,
      cy = -1.0;
    put(0, 0, Y0, -0.08, W, H, 0.34, "#5c4126");
    put(4, 0, Y0 - 0.1, 0.12, W + 0.2, H + 0.2, 0.18, GDD);
    put(0, 0, Y0 + 0.35, 0.24, W - 0.7, H - 0.7, 0.16, F);
    put(0, 0, Y0 + 0.9, 0.33, W - 1.8, H - 1.8, 0.06, FL);
    put(4, 0, Y1 - 0.38, 0.3, W, 0.38, 0.14, GD);
    put(4, 0, Y0, 0.3, W, 0.38, 0.14, GD);
    for (const s of [-1, 1]) put(4, s * (W / 2 - 0.19), Y0, 0.3, 0.38, H, 0.14, GD);
    put(4, 0, Y1 - 0.05, 0.3, 1.6, 0.42, 0.14, GD);
    put(4, 0, Y1 + 0.3, 0.3, 0.7, 0.3, 0.14, GD2);
    put(4, 0, Y0 + 0.6, 0.38, 0.3, H - 1.2, 0.06, GDD);
    put(4, 0, cy - 0.75, 0.42, 1.5, 1.5, 0.1, GD);
    put(4, 0, cy - 0.45, 0.48, 0.9, 0.9, 0.08, GD2);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      put(4, Math.sin(a) * 1.35, cy + Math.cos(a) * 1.35 - 0.2, 0.42, 0.38, 0.4, 0.08, k % 2 ? GDD : GD);
    }
    for (const [x, y] of [
      [-1.85, 2.3],
      [1.85, 2.3],
      [-1.85, -5.4],
      [1.85, -5.4],
    ])
      put(4, x, y, 0.42, 0.42, 0.42, 0.1, GD2);
    return toGeo(G);
  }
  const cap = kind === "captain",
    W = cap ? 5.0 : 4.7,
    TOP = 3.0,
    STR = cap ? 2.3 : 2.5,
    H = STR + W * 0.866,
    F = thp(),
    FD = thd(),
    FL = lighten(F, 0.1),
    gold = cap || AL >= 2,
    RIM = gold ? HA.gd : AL >= 1 ? HA.sth : HA.st2,
    RIMD = gold ? HA.gdd : HA.st3,
    EM = gold ? HA.gd2 : HA.em,
    hw = (dy) => (dy <= STR ? W / 2 : Math.max(0, Math.sqrt(W * W - (dy - STR) * (dy - STR)) - W / 2));
  const rows = [[0, STR]];
  for (let a = STR; a < H - 0.04;) {
    const s = Math.min(0.3, H - a);
    rows.push([a, a + s]);
    a += s;
  }
  for (const [a, b] of rows) {
    const w = hw(b > STR ? (a + b) / 2 : a) * 2,
      y0 = TOP - b,
      h = b - a;
    if (w < 0.3) continue;
    put(0, 0, y0, -0.05, w, h, 0.32, FD);
    if (w > 1.3) put(0, 0, y0, 0.16, w - 1.0, h, 0.14, F);
    if (w > 2.7) put(0, 0, y0, 0.25, w - 2.5, h, 0.06, FL);
    put(0, 0, y0, -0.24, Math.max(0.2, w - 0.5), h, 0.07, "#5c4126");
    put(4, -(w / 2 - 0.17), y0, 0.05, 0.36, h, 0.52, RIM);
    put(4, w / 2 - 0.17, y0, 0.05, 0.36, h, 0.52, RIM);
  }
  put(4, 0, TOP - 0.36, 0.05, W, 0.38, 0.54, RIM);
  put(4, 0, TOP - 0.06, 0.05, W - 0.4, 0.07, 0.56, RIMD);
  put(4, 0, TOP - H - 0.05, 0.05, 0.4, 0.3, 0.5, RIM);
  /* enarmes on the back */
  put(0, -0.85, -1.9, -0.36, 0.32, 2.8, 0.14, HA.lt2);
  put(0, 0.85, -1.9, -0.36, 0.32, 2.8, 0.14, HA.lt2);
  put(0, 0, -0.55, -0.4, 2.1, 0.34, 0.18, HA.lt);
  put(0, 0, -1.75, -0.4, 2.1, 0.34, 0.18, HA.lt);
  const inside = (mx, y, w) =>
    Math.abs(mx) + w / 2 <= hw(TOP - y) - 0.3 && Math.abs(mx) + w / 2 <= hw(TOP - y - 0.3) - 0.3;
  if (cap) {
    embPut(
      HER.crown,
      put,
      0,
      1.35,
      0.33,
      0.38,
      0.1,
      { "#": [4, HA.gd2], "r": [5, "#ff5a4a"], "b": [5, HA.hx] },
      inside,
    );
    put(4, 0, -0.95, 0.31, 0.34, 0.34, 0.08, HA.gd);
  } else {
    embPut(HER.chev, put, 0, 0.95, 0.32, 0.28, 0.1, { "#": [gold ? 4 : 0, EM] }, inside);
    if (AL >= 2) put(5, 0, -1.15, 0.34, 0.46, 0.46, 0.1, HA.hx);
    else put(4, 0, -1.1, 0.31, 0.36, 0.36, 0.08, RIM);
  }
  if (AL >= 1 || cap)
    for (const dy of [0.55, 1.5, STR + 0.45, STR + 1.35, STR + 2.2]) {
      const x = hw(dy + 0.1) - 0.17;
      if (x > 0.35) {
        put(4, -x, TOP - dy - 0.09, 0.34, 0.17, 0.17, 0.06, HA.sth);
        put(4, x, TOP - dy - 0.09, 0.34, 0.17, 0.17, 0.06, HA.sth);
      }
    }
  return toGeo(G);
}

/* the shield follows the forearm but stays upright; s = brace amount (0 rest .. 1 shield forward) */
export function shdPose(d, s) {
  if (!d.shd) return;
  d.shd.rotation.x = -d.armL.rotation.x + 0.03;
  d.shd.rotation.y = -0.14 + 0.1 * s;
  d.shd.position.z = d.mdl.shp[2] + 0.03 * s;
}

/* standard bearer: pole with gold ferrules, crossbar, spear finial; three chained cloth strips (ripple), fleur-de-lis, swallowtail with fringe, forked streamer */
export function bannerKit(G) {
  const X = { ban: newG(), ban2: newG(), ban3: newG(), pen: newG(), tip: newG(), cape: newG() },
    F = thp(),
    FD = thd(),
    S2 = ths(),
    WD = "#6b4423",
    WD2 = "#8a5a2a",
    g = (m, x, y, z, w, h, d, c) => {
      const o = geometryState.BMAT;
      geometryState.BMAT = m;
      try {
        vb(G, x, y, z, w, h, d, c);
      } finally {
        geometryState.BMAT = o;
      }
    },
    q = (k, m, x, y, z, w, h, d, c) => {
      const o = geometryState.BMAT;
      geometryState.BMAT = m;
      try {
        bxc(X[k], x * VX, y * VX, z * VX, w * VX, h * VX, d * VX, c);
      } finally {
        geometryState.BMAT = o;
      }
    };
  const Z = -3.0,
    ZC = -3.95,
    ZB = -3.42,
    TB = 31.6,
    BW = 11.2,
    SH = 5.6,
    TH = 0.5;
  /* gear board, look B (gear-style.js): the pole, its ferrules, crossbar and spear point in the shared gear palette */
  if (gear2("banner")) g2Pole(G);
  else {
    g(2, 0, 2, Z, 0.8, 34.4, 0.8, WD);
    for (const y of [12.2, 21.4, 28.8]) g(4, 0, y, Z, 1.02, 0.42, 1.02, HA.gd);
    g(2, 0, TB, ZB, 12.4, 0.7, 0.7, WD2);
    for (const s of [-1, 1]) {
      g(4, s * 6.55, TB - 0.17, ZB, 1.0, 1.04, 1.0, HA.gd);
      g(4, s * 6.55, TB + 0.87, ZB, 0.46, 0.46, 0.46, HA.gd2);
    }
    g(4, 0, 36.3, Z, 1.3, 1.1, 1.3, HA.gd);
    g(4, 0, 37.35, Z, 0.8, 0.5, 0.8, HA.gd2);
    g(4, 0, 37.85, Z, 1.1, 1.2, 0.42, HA.sth);
    g(4, 0, 39.0, Z, 0.72, 1.1, 0.36, HA.sth);
    g(4, 0, 40.05, Z, 0.36, 0.9, 0.3, "#ffffff");
    g(0, 0, 9, -2.3, 0.8, 0.8, 1.2, WD2);
  }
  const LIM = [0, -SH, -2 * SH, -99],
    KEYS = ["ban", "ban2", "ban3"];
  const cb = (m, x, y0, w, h, c, d) => {
    const a = y0,
      b = y0 + h;
    for (let i = 0; i < 3; i++) {
      const lo = Math.max(a, LIM[i + 1]),
        hi = Math.min(b, LIM[i]);
      if (hi - lo > 1e-4) q(KEYS[i], m, x, lo + SH * i, 0, w, hi - lo, d || TH, c);
    }
  };
  cb(7, 0, -12.6, BW, 12.6, F);
  for (let k = 0; k < 10; k++) {
    const y = -12.6 - (k + 1) * 0.4,
      nw = (k + 1) * 0.33,
      sw = BW / 2 - nw;
    cb(7, -(nw + sw / 2), y, sw, 0.4, F);
    cb(7, nw + sw / 2, y, sw, 0.4, F);
  }
  for (const s of [-1, 1]) {
    cb(7, s * (BW / 2 - 0.36), -16.6, 0.72, 16.6, S2, TH + 0.05);
    cb(4, s * (BW / 2 - 0.95), -15.3, 0.16, 14.1, HA.gd2, TH + 0.07);
  }
  cb(4, 0, -1.05, BW + 0.24, 1.05, HA.gd, TH + 0.12);
  cb(7, 0, -1.32, BW, 0.27, FD, TH + 0.07);
  cb(4, 0, -12.0, BW - 1.9, 0.24, HA.gd2, TH + 0.07);
  embPut(HER.fleur, (m, x, y, z, w, h, d, c) => cb(m, x, y, w, h, c, d), 0, -2.0, 0, 0.44, TH + 0.14, {
    "#": [4, HA.gd2],
  });
  for (const s of [-1, 1]) for (let x = 3.75; x <= 5.45; x += 0.56) cb(4, s * x, -17.25, 0.24, 0.65, HA.gd2, 0.3);
  q("pen", 7, 0.6, -2.4, 0, 1.2, 2.4, 0.24, F);
  q("pen", 7, 1.8, -2.15, 0, 1.2, 1.9, 0.24, F);
  q("pen", 7, 3.0, -1.9, 0, 1.2, 1.4, 0.24, F);
  q("pen", 7, 1.8, -1.32, 0, 3.6, 0.24, 0.28, S2);
  q("pen", 4, 0.12, -2.5, 0, 0.24, 2.6, 0.3, HA.gd);
  q("tip", 7, 0.6, -1.65, 0, 1.2, 0.9, 0.24, F);
  q("tip", 7, 1.6, -1.45, 0, 0.8, 0.5, 0.24, F);
  q("tip", 7, 0.6, -1.32, 0, 1.2, 0.24, 0.28, S2);
  q("cape", 7, 0, -0.7, -0.3, 4.2, 0.7, 0.5, F);
  for (const s of [-1, 1]) {
    q("cape", 7, s * 1.4, -8, -0.3, 1.4, 7.3, 0.5, F);
    q("cape", 7, s * 1.42, -8.2, -0.3, 1.5, 0.7, 0.7, S2);
  }
  return {
    X,
    parts: [
      { k: "ban", x: 0, y: TB * VX, z: ZC * VX },
      { k: "ban2", par: "ban", x: 0, y: -SH * VX, z: 0 },
      { k: "ban3", par: "ban2", x: 0, y: -SH * VX, z: 0 },
      { k: "pen", x: 0.4 * VX, y: 36.1 * VX, z: Z * VX },
      { k: "tip", par: "pen", x: 3.6 * VX, y: 0, z: 0 },
      { k: "cape", x: 0, y: 10.6 * VX, z: -1.3 * VX },
    ],
  };
}
