import { PD, pxArms, pxBox, pxN, pxRot, pxScene, shadeHex, teamPal } from "./pixel-geometry.js";
import { zombiesState } from "./zombies.js";
import { unitsState } from "./units.js";
import { thp } from "../../ui/kingdom-theme.js";

/* ================= BLOCKBENCH-STYLE SKINS =================
   Each unit is the plain Minecraft player model: six base cubes and six outer-layer cubes (hat +0.5px, jacket / sleeves /
   trousers +0.25px, texture kept on the 64x64 grid, '.' = transparent so the base layer shows through), plus only a few
   extra cubes (crest, pauldrons, brim, quiver). The detail lives in the pixel art below, one string per row, top row first.
   A face given as '~R' is the mirror of face R; 'F' alone reuses face F. */
export function pxPaint(spec, map) {
  return (f, u, v, W, H) => {
    let s = spec && spec[f];
    if (!s) return null;
    let mir = false;
    if (typeof s === "string") {
      mir = s[0] === "~";
      s = spec[mir ? s.slice(1) : s];
    }
    if (typeof s === "function") return s(u, v, W, H);
    const row = s[H - 1 - v];
    if (!row) return null;
    const c = row[mir ? W - 1 - u : u];
    if (c === undefined || c === ".") return null;
    const col = map[c];
    return col === undefined ? null : col;
  };
}

/* ---- units board, look B: per-pixel shading on top of the drawn letters (3 to 4 tones per colour): dark hem rows, lit shoulder rows, a few worn pixels.
   kind 1 = cloth / leather, 2 = metal (no wear, dark foot row only). skinV2.on is set by the new-look dispatch in units.js (humanKit) and is 0 on the current look ---- */
export const skinV2 = { on: 0 };
const TNC = new Map(),
  tnC = (c, k) => {
    if (k === 1) return c;
    const q = c + k;
    let r = TNC.get(q);
    if (!r) {
      r = shadeHex(c, k);
      TNC.set(q, r);
    }
    return r;
  };
export const pxTone = (paint, kind, sd) =>
  !kind
    ? paint
    : (f, u, v, W, H) => {
        const c = paint(f, u, v, W, H);
        if (!c || f === "T") return c;
        if (f === "D") return tnC(c, 0.82);
        if (kind === 2) return v === 0 && H >= 8 ? tnC(c, 0.88) : c;
        let k = 1;
        if (H >= 8) {
          if (v <= 1) k = 0.87;
          else if (v >= H - 2) k = 1.06;
        }
        const n = pxN(f, u, v, sd || 0);
        if (n < 0.06) k *= 0.92;
        return tnC(c, Math.round(k * 100) / 100);
      };
const tk = (m, on) => (on ? (m === 4 ? 2 : 1) : 0);

export function pxSkin(P, K, map, _options) {
  const V = skinV2.on,
    B = (Gx, x, y, z, w, h, d, spec, g, m, ao, kd) => {
      if (spec)
        pxBox(Gx, x, y, z, w, h, d, pxTone(pxPaint(spec, map), kd, 7), { mat: m || 0, grid: g, ao: ao !== false });
      else if (spec === 0) pxBox(Gx, x, y, z, w, h, d, () => null, { only: true });
    };
  B(P.HG, -4, 24, -4, 8, 8, 8, K.head, null, 0);
  B(P.HG, -4.5, 23.5, -4.5, 9, 9, 9, K.hat, [8, 8, 8], K.hatMat || 0, false, tk(K.hatMat, V));
  B(P.G, -4, 12, -2, 8, 12, 4, K.body, null, 0, true, tk(K.bodyMat, V));
  B(P.G, -4.25, 11.75, -2.25, 8.5, 12.5, 4.5, K.jacket, [8, 12, 4], K.jacketMat || 0, false, tk(K.jacketMat, V));
  B(P.LG, -2, -12, -2, 4, 12, 4, K.leg, null, 0, true, tk(K.legMat, V));
  B(P.LG, -2.25, -12.25, -2.25, 4.5, 12.5, 4.5, K.pants, [4, 12, 4], K.pantsMat || 0, false, tk(K.pantsMat, V));
  pxBox(P.LG, -30, -40, -30, 60, 28, 60, () => null, { only: true });
}

export function pxSkinArms(T, K, map) {
  const V = skinV2.on;
  if (K.arm) pxBox(T, -2, -12, -2, 4, 12, 4, pxTone(pxPaint(K.arm, map), tk(K.armMat, V), 3), { mat: 0 });
  else if (K.arm === 0) pxBox(T, -2, -12, -2, 4, 12, 4, () => null, { only: true });
  if (K.sleeve)
    pxBox(T, -2.25, -12.25, -2.25, 4.5, 12.5, 4.5, pxTone(pxPaint(K.sleeve, map), tk(K.sleeveMat, V), 5), {
      mat: K.sleeveMat || 0,
      grid: [4, 12, 4],
      ao: false,
    });
}

/* look B face: lit hair, brows, eyes with whites, cheek light, jaw shadow, ears and sideburns on the sides. o.beard 0 none, 1 stubble, 2 full; o.mid / o.low replace the
   mouth and chin rows; o.plain keeps to the letters every map has (h r s S w e m) */
export function pxHead2(o) {
  o = o || {};
  const p = o.plain,
    q = (r) => (p ? r.replace(/H/g, "h").replace(/K/g, "s") : r),
    b = o.beard | 0;
  return {
    F: [
      "hhHhhhhh",
      "hHhhhhHh",
      "hhsKKshh",
      "SrrssrrS",
      "swessews",
      "sKsSSsKs",
      o.mid || (b === 2 ? "rhhmmhhr" : b === 1 ? "sSSmmSSs" : "ssSmmSss"),
      o.low || (b === 2 ? "rrhhhhrr" : b === 1 ? "SSSSSSSS" : "SssssssS"),
    ].map(q),
    R: [
      "hhhhHhhh",
      "hHhhhhhh",
      "sshhhhhh",
      "sSshHhhh",
      "ssSshhhr",
      "ssshhhrr",
      b === 2 ? "hhsshrrr" : "sssshrrr",
      b === 2 ? "rhhsssss" : "Ssssssss",
    ].map(q),
    L: "~R",
    B: ["hhHhhhhh", "hhhhHhhh", "hHhhhhhh", "hhhhhhHh", "hhhHhhhh", "hrhhhhrh", "rrhhhhrr", "rrrssrrr"].map(q),
    T: ["hhhhhhhh", "hHhhhHhh", "hhhhhhhh", "hhHhhhHh", "hhhhhhhh", "hHhhhhhh", "hhhhHhhh", "hhhhhhhh"].map(q),
    D: Array(8).fill("ssssssss"),
  };
}

/* colour maps: letters to display colours, turned into albedo once */
export const pxMap = (o, tm) => {
  const m = {};
  for (const k in o) m[k] = PD(o[k]);
  if (tm) {
    const T = teamPal(tm);
    m.V = T[0];
    m.t = T[1];
    m.T = T[2];
    m.U = T[3];
    m.Y = T[4];
  }
  return m;
};

/* ---- rank galons (King's board choice, rank row A): rank 0..3 = 0..3 gold bands on both sleeves (row numbers count from the top of the arm piece, c = gold colour letter) ---- */
export function pxRankK(K, part, rows, faces, c) {
  const rk = unitsState.RKB | 0;
  if (!rk) return K;
  const o = Object.assign({}, K),
    q = Object.assign({}, K[part]);
  for (const f of faces)
    if (Array.isArray(q[f])) {
      q[f] = q[f].slice();
      for (const j of rows.slice(0, rk)) q[f][j] = c + c + c + c;
    }
  o[part] = q;
  return o;
}

/* ---------------- KNIGHT ---------------- */
const SK_KNIGHT = {
  hatMat: 4,
  jacketMat: 4,
  sleeveMat: 4,
  pantsMat: 4,
  head: {
    F: ["ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss"],
    B: "F",
    R: "F",
    L: "F",
    T: "F",
    D: "F",
  },
  hat: {
    F: ["hhhhhhhh", "llllllll", "mmmGGmmm", "kkkGGkkk", "mmmGGmmm", "mmmggmmm", "dmdggdmd", "dddddddd"],
    R: ["hhhhhhhh", "llllllll", "mmmmmmml", "kkmmGmmm", "dmmmmmmm", "mmmmmmmm", "mmmmmmmd", "dddddddd"],
    L: "~R",
    B: ["hhhhhhhh", "lllhllll", "mmmlmmmm", "mmmlmmmm", "mmmlmmmm", "dmmlmmmd", "dmmlmmmd", "dddddddd"],
    T: ["lhhhhhhl", "hlmggmlh", "hmmggmmh", "hmmggmmh", "hmmggmmh", "hmmggmmh", "hlmggmlh", "lhhGGhhl"],
  },
  body: {
    F: [
      "xyxyxyxy",
      "yxyxyxyx",
      "xyxyxyxy",
      "yxyxyxyx",
      "xyxyxyxy",
      "yxyxyxyx",
      "xyxyxyxy",
      "yxyxyxyx",
      "xyxyxyxy",
      "yxyxyxyx",
      "xyxyxyxy",
      "yxyxyxyx",
    ],
    B: "F",
    R: ["xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx"],
    L: "R",
    T: ["dddddddd", "dddddddd", "dddddddd", "dddddddd"],
    D: "T",
  },
  jacket: {
    F: [
      "whhhhhhw",
      "htTTTTth",
      "ltTTTTtl",
      "ltTGGTtl",
      "ltTggTtl",
      "dtTTTTtd",
      "dtTTTTtd",
      "nbbGGbbn",
      "dtTTTTtd",
      "mtTTTTtm",
      "dtTTTTtd",
      "dttttttd",
    ],
    R: ["hhhh", "llll", "mmml", "mmmm", "mmmm", "dmmm", "dddd", "bbbn", "mmmm", "hhhh", "mmmm", "dddd"],
    L: "~R",
    B: [
      "hhhhhhhh",
      "htTTTTth",
      "ltTTTTtl",
      "ltTTTTtl",
      "dtTTTTtd",
      "dtTTTTtd",
      "dtTTTTtd",
      "nbbbbbbn",
      "dtTTTTtd",
      "mtTTTTtm",
      "dtTTTTtd",
      "dttttttd",
    ],
    T: ["hhhhhhhh", "hllllllh", "hllllllh", "whhhhhhw"],
  },
  arm: {
    F: ["xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx"],
    B: "F",
    R: "F",
    L: "F",
    T: ["xxxx", "xxxx", "xxxx", "xxxx"],
    D: "T",
  },
  sleeve: {
    F: ["hhhh", "llll", "mlmm", "dmmd", "....", "whhw", "lmml", "....", "hhhh", "lmml", "hhhh", "lmlm"],
    R: ["hhhh", "llll", "mmmm", "dmmd", "....", "hhhh", "lmml", "....", "hhhh", "mmmm", "hhhh", "mdmd"],
    L: "R",
    B: ["llll", "mmmm", "dmmd", "dddd", "....", "hhhh", "mmmm", "....", "llll", "mmmm", "llll", "dmdm"],
    T: ["hhhh", "hllh", "hllh", "hhhh"],
    D: ["dddd", "dddd", "dddd", "dddd"],
  },
  leg: {
    F: ["xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx", "xyxy", "yxyx"],
    B: "F",
    R: "F",
    L: "F",
    T: ["xxxx", "xxxx", "xxxx", "xxxx"],
    D: "T",
  },
  pants: {
    F: ["llll", "mmmm", "dmmd", "....", "hhhh", "hwwh", "lmml", "....", "hllh", "lmml", "bBBb", "dmmd"],
    R: ["llll", "mmmm", "dmmm", "....", "hhhh", "hhhl", "lmml", "....", "hlll", "lmml", "bBBb", "dmmd"],
    L: "~R",
    B: ["llll", "mmmm", "dmmd", "....", "llll", "mmmm", "dmmd", "....", "llll", "mmmm", "bbbb", "dddd"],
    T: ["llll", "llll", "llll", "llll"],
    D: ["dddd", "dddd", "dddd", "dddd"],
  },
};

export function pxKnight(P, AL) {
  const map = pxMap(
      {
        k: "#141519",
        d: "#2c2e34",
        m: "#4a4d55",
        l: "#6d717a",
        h: "#949aa3",
        w: "#c4c8ce",
        x: "#1d1e22",
        y: "#2c2e33",
        g: "#d4a234",
        G: "#f0cc5c",
        o: "#9a6e1e",
        b: "#6e4826",
        B: "#8d6136",
        n: "#4a2e16",
        s: "#c98262",
      },
      thp(),
    ),
    K = pxRankK(SK_KNIGHT, "sleeve", [4, 6, 8], ["F", "R", "B"], "G");
  pxScene(() => {
    pxSkin(P, K, map);
    pxBox(
      P.HG,
      -0.5,
      32.5,
      -4.25,
      1,
      1,
      8.5,
      pxPaint(
        {
          F: ["q"],
          B: ["Q"],
          R: ["qqqqqqqq"],
          L: "R",
          T: ["Q", "q", "q", "q", "q", "q", "q", "Q"],
          D: ["Q", "Q", "Q", "Q", "Q", "Q", "Q", "Q"],
        },
        { q: PD("#c0392b"), Q: PD("#8a2a20") },
      ),
      { mat: 4, grid: [1, 1, 8] },
    );
    if (AL >= 2) {
      pxBox(
        P.HG,
        -0.5,
        33.5,
        -3,
        1,
        2,
        4,
        pxPaint(
          {
            F: ["U", "T"],
            B: ["T", "t"],
            R: ["UUUU", "TTTT"],
            L: "R",
            T: ["U", "U", "U", "U"],
            D: ["t", "t", "t", "t"],
          },
          map,
        ),
        { mat: 7, grid: [1, 2, 4] },
      );
      pxBox(
        P.HG,
        -0.5,
        32,
        -5.6,
        1,
        2.5,
        2,
        pxPaint({ F: ["T", "T", "t"], B: "F", R: ["TT", "TT", "tt"], L: "R", T: ["T", "T"], D: ["t", "t"] }, map),
        { mat: 7, grid: [1, 3, 2] },
      );
    }
  });
  pxArms(P, (T) => {
    pxSkinArms(T, K, map);
    pxBox(
      T,
      -3,
      -1.25,
      -3,
      6,
      3,
      6,
      pxPaint(
        {
          T: ["mllllm", "lhhhhl", "lhwwhl", "lhhhhl", "lhhhhl", "mllllm"],
          F: ["hhhhhh", "lmmmml", "oggggo"],
          B: "F",
          R: "F",
          L: "F",
          D: ["dddddd", "dddddd", "dddddd", "dddddd", "dddddd", "dddddd"],
        },
        map,
      ),
      { mat: 4 },
    );
  });
}

/* ---------------- ROYAL GUARD ---------------- */
let SK_GUARD;

export function pxGuard(P, _AL) {
  const map = pxMap(
      {
        k: "#141519",
        d: "#2c2e34",
        m: "#4a4d55",
        l: "#6d717a",
        h: "#949aa3",
        w: "#c4c8ce",
        x: "#1d1e22",
        y: "#2c2e33",
        g: "#d4a234",
        G: "#f0cc5c",
        o: "#9a6e1e",
        b: "#6e4826",
        B: "#8d6136",
        n: "#4a2e16",
        s: "#c98262",
        R: "#a62832",
        r: "#7a1a24",
        Q: "#c94450",
      },
      thp(),
    ),
    K = SK_GUARD;
  pxScene(() => {
    pxSkin(P, K, map);
    pxBox(
      P.HG,
      -0.6,
      32.5,
      -2.5,
      1.2,
      3,
      3,
      pxPaint(
        { F: ["Q", "R", "r"], B: "F", R: ["QQQ", "RRR", "rrr"], L: "R", T: ["Q", "Q", "Q"], D: ["r", "r", "r"] },
        map,
      ),
      { mat: 7, grid: [1, 3, 3] },
    );
    pxBox(
      P.HG,
      -0.6,
      31,
      -5.2,
      1.2,
      3.5,
      2.7,
      pxPaint(
        {
          F: ["R", "R", "r", "r"],
          B: "F",
          R: ["QRR", "RRR", "rRR", "rrr"],
          L: "R",
          T: ["Q", "Q", "Q"],
          D: ["r", "r", "r"],
        },
        map,
      ),
      { mat: 7, grid: [1, 4, 3] },
    );
  });
  pxArms(P, (T) => {
    pxSkinArms(T, K, map);
    pxBox(
      T,
      -3.25,
      -1.25,
      -3.25,
      6.5,
      3,
      6.5,
      pxPaint(
        {
          T: ["TUUUUT", "UYYYYU", "UYYYYU", "UYYYYU", "UYYYYU", "TUUUUT"],
          F: ["UUUUUU", "TTTTTT", "oggggo"],
          B: "F",
          R: "F",
          L: "F",
          D: ["tttttt", "tttttt", "tttttt", "tttttt", "tttttt", "tttttt"],
        },
        map,
      ),
      { mat: 4, grid: [6, 3, 6] },
    );
  });
}

/* ---------------- ARCHER ---------------- */
const SK_ARCHER = {
  hatMat: 7,
  jacketMat: 0,
  head: {
    F: ["hhhhhhhh", "hhhhhhhh", "hsssssss", "srrssrrs", "swessews", "sssSSsss", "sssmmsss", "ssssssss"],
    R: ["hhhhhhhh", "hhhhhhhh", "sssshhhh", "sssshhhh", "ssSshhhh", "sssshhhh", "ssssshhh", "ssssssss"],
    L: "~R",
    B: ["hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "ssssssss"],
    T: ["hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh"],
    D: ["ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss"],
  },
  hat: {
    F: ["GGGGGGGG", "gggggggg", "g......g", "g......g", "g......g", "g......g", "q......q", "q......q"],
    R: ["GGGGGGGG", "gggggggg", "gggggggg", "qggggggg", "qggggggg", "qggggggq", "qqgggggq", "qqqqqqqq"],
    L: "~R",
    B: ["GGGGGGGG", "gggggggg", "gggggggg", "gggqgggg", "gggqgggg", "gggqgggg", "qggqgggq", "qqqqqqqq"],
    T: ["gggggggg", "gGgggGgg", "gggggggg", "ggGgggGg", "gggggggg", "gGgggggg", "ggggGggg", "GGGGGGGG"],
  },
  body: {
    F: [
      "VVVVVVVV",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vVVVVVVv",
      "vvvvvvvv",
      "vvvvvvvv",
    ],
    B: "F",
    R: ["VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "vvvv", "vvvv", "vvvv"],
    L: "R",
    T: ["VVVVVVVV", "VVVVVVVV", "VVVVVVVV", "VVVVVVVV"],
    D: ["vvvvvvvv", "vvvvvvvv", "vvvvvvvv", "vvvvvvvv"],
  },
  jacket: {
    F: [
      ".bbbbnb.",
      "bBbbbnBb",
      "bbBbnbbb",
      "bbBnbbbb",
      "bbnBbbbb",
      "bnbBbbbb",
      "nbbBbbbn",
      "nnnyynnn",
      "bbbBbbbb",
      "bbbBbbbb",
      "bbbbbbbb",
      "nbbbbbbn",
    ],
    R: ["bbbb", "bbbb", "bbbb", "bbbb", "bbbb", "bbbb", "nbbb", "nnnn", "bbbb", "bbbb", "bbbb", "nnnn"],
    L: "~R",
    B: [
      ".bbnbbb.",
      "bbbbnbbb",
      "bbbbbnbb",
      "bbbbbbnb",
      "bbbbbbnb",
      "bbbbbbbn",
      "nbbbbbbn",
      "nnnnnnnn",
      "bbbbbbbb",
      "bbbbbbbb",
      "bbbbbbbb",
      "nbbbbbbn",
    ],
    T: ["bbbbbbbb", "b......b", "b......b", "bbbbbbbb"],
  },
  arm: {
    F: ["VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "vvvv", "ssss", "ssss", "ssss", "ssss", "SsSs", "SSSS"],
    B: "F",
    R: "F",
    L: "F",
    T: ["VVVV", "VVVV", "VVVV", "VVVV"],
    D: ["SSSS", "SSSS", "SSSS", "SSSS"],
  },
  sleeve: {
    F: ["....", "....", "....", "....", "....", "VVVV", "....", "BBBB", "bnbb", "bybb", "nnnn", "...."],
    R: ["....", "....", "....", "....", "....", "VVVV", "....", "BBBB", "bbnb", "bbbb", "nnnn", "...."],
    L: "R",
    B: "R",
    T: null,
    D: null,
  },
  leg: {
    F: ["PPPP", "PPPP", "PPPP", "pPPp", "PPPP", "PPPP", "pPPp", "PPPP", "bbbb", "bbbb", "bbbb", "nnnn"],
    B: "F",
    R: "F",
    L: "F",
    T: ["PPPP", "PPPP", "PPPP", "PPPP"],
    D: ["nnnn", "nnnn", "nnnn", "nnnn"],
  },
  pants: {
    F: ["....", "....", "....", "....", "....", "....", "BBBB", "bbbb", "bnbb", "bbbb", "bbbb", "nnnn"],
    R: ["....", "....", "....", "....", "....", "....", "BBBB", "bbbb", "bbnb", "bbbb", "bbbb", "nnnn"],
    L: "~R",
    B: "R",
    T: null,
    D: ["nnnn", "nnnn", "nnnn", "nnnn"],
  },
};

export function pxArcher(P, _AL) {
  const map = pxMap({
      s: "#e8a684",
      S: "#c98262",
      h: "#6b3e1e",
      r: "#4a2a14",
      e: "#3fa65a",
      w: "#f4f4f4",
      m: "#8e4a3c",
      G: "#58a852",
      g: "#3f8a3e",
      q: "#2f6a30",
      V: "#3f8a3e",
      v: "#2f6a30",
      b: "#86522c",
      B: "#a96c3c",
      n: "#5e381c",
      y: "#ecbd3a",
      P: "#4e3a26",
      p: "#3a2a1a",
    }),
    K = pxRankK(SK_ARCHER, "arm", [3, 1, 5], ["F"], "y");
  pxScene(() => {
    pxSkin(P, K, map);
    pxBox(
      P.HG,
      -1.5,
      26.5,
      -5.75,
      3,
      3.5,
      1.25,
      pxPaint(
        { F: ["ggg", "ggg", "qqq"], B: ["GGG", "ggg", "qqq"], R: ["G", "g", "q"], L: "R", T: ["GGG"], D: ["qqq"] },
        map,
      ),
      { mat: 7, grid: [3, 3, 1] },
    );
    pxRot(
      P.G,
      (T) => {
        pxBox(
          T,
          0.6,
          13,
          -5.1,
          3,
          8.5,
          2.6,
          pxPaint(
            {
              F: ["BBB", "bbb", "bbb", "bnb", "bbb", "bbb", "yyy", "nnn"],
              B: "F",
              R: ["BB", "bb", "bb", "bb", "bb", "bb", "yy", "nn"],
              L: "R",
              T: ["nnn", "nnn"],
              D: ["nnn", "nnn"],
            },
            map,
          ),
          { mat: 0, grid: [3, 8, 2] },
        );
        pxBox(
          T,
          1,
          21.5,
          -4.4,
          2.2,
          1.4,
          1.2,
          pxPaint(
            { F: ["wQw", "ffr"], B: "F", R: ["w", "f"], L: "R", T: ["wQw"], D: ["fff"] },
            { w: PD("#f2f2f2"), Q: PD("#d03a2e"), f: PD("#c8a070"), r: PD("#d03a2e") },
          ),
          { mat: 0, grid: [3, 2, 1] },
        );
      },
      [0, 0, -0.32],
      [2, 17, -4],
    );
  });
  pxArms(P, (T) => pxSkinArms(T, K, map));
}

/* ---------------- PEASANT (six variants: hat, skin, hair, beard, tunic colour) ---------------- */
export function pxPeasant(P, _AL) {
  const pv = zombiesState.ZVAR && zombiesState.ZVAR.hint === "p" ? zombiesState.ZVAR.v % 6 : 0;
  const SH = [
      ["#6e4424", "#8a5a32"],
      ["#56642c", "#6e7e3e"],
      ["#6a3a32", "#7c4a42"],
      ["#3e4e62", "#55667a"],
      ["#6e6038", "#8a7a52"],
      ["#563a54", "#6a4a6a"],
    ][pv],
    HR = [
      ["#5a3a1a", "#3a2410"],
      ["#2a1a10", "#160e08"],
      ["#8a6a3a", "#6a5028"],
      ["#1e1a18", "#120f0e"],
      ["#a0522d", "#6e3216"],
      ["#6a6a62", "#4a4a44"],
    ][pv],
    SK = [
      ["#e8a684", "#c98262"],
      ["#f0bc96", "#d69c78"],
      ["#d4946e", "#b57452"],
      ["#e8a684", "#c98262"],
      ["#b07a54", "#93603f"],
      ["#f0bc96", "#d69c78"],
    ][pv],
    hat = [0, 2, 0, 1, 3, 0][pv],
    beard = pv === 3 || pv === 5;
  const map = pxMap({
    s: SK[0],
    S: SK[1],
    h: HR[0],
    r: HR[1],
    e: ["#3a78c2", "#6b4423", "#3fa65a", "#6b4423", "#3a78c2", "#6b4423"][pv],
    w: "#f4f4f4",
    m: "#8e4a3c",
    V: SH[1],
    v: SH[0],
    a: "#ddd0ae",
    A: "#b4a682",
    c: "#c8a868",
    C: "#a08448",
    P: "#433824",
    p: "#2e2618",
    b: "#86522c",
    n: "#5e381c",
    W: "#d4c6aa",
    X: "#b8a98e",
    Z: "#d4b45c",
    z: "#a88a42",
    Y: "#ecd27a",
    k: "#6a5038",
    K: "#86684a",
    q: "#d8cbaa",
    Q: "#b0a284",
  });
  const face = beard
    ? ["hhhhhhhh", "hhhhhhhh", "hsssssss", "srrssrrs", "swessews", "rssSSssr", "rrrmmrrr", "rrrrrrrr"]
    : ["hhhhhhhh", "hhhhhhhh", "hsssssss", "srrssrrs", "swessews", "sssSSsss", "sssmmsss", "ssssssss"];
  const K = {
    jacketMat: 0,
    head: {
      F: face,
      R: ["hhhhhhhh", "hhhhhhhh", "sssshhhh", "sssshhhh", "ssSshhhh", "sssshhhh", "ssssshhh", "ssssssss"],
      L: "~R",
      B: ["hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "ssssssss"],
      T: ["hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh", "hhhhhhhh"],
      D: ["ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss", "ssssssss"],
    },
    hat:
      hat === 0
        ? null
        : hat === 1
          ? {
              F: ["KKKKKKKK", "kkkkkkkk", "kkkkkkkk", "........", "........", "........", "........", "........"],
              R: ["KKKKKKKK", "kkkkkkkk", "kkkkkkkk", "kkkk....", "........", "........", "........", "........"],
              L: "~R",
              B: ["KKKKKKKK", "kkkkkkkk", "kkkkkkkk", "kkkkkkkk", "kkkkkkkk", "........", "........", "........"],
              T: ["KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK"],
            }
          : hat === 2
            ? {
                F: ["qqqqqqqq", "QqqqqqqQ", "Q......Q", "........", "........", "........", "........", "........"],
                R: ["qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "Qqqqqqqq", ".Qqqqqqq", "..QQqqqq", ".....QQq", "........"],
                L: "~R",
                B: ["qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "QqqqqqqQ", "QQqqqqQQ", "..QqqQ.."],
                T: ["qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq", "qqqqqqqq"],
              }
            : null,
    body: {
      F: [
        "VVVVVVVV",
        "VVVssVVV",
        "VVVVVVVV",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vvvvvvvv",
        "vvvvvvvv",
      ],
      B: [
        "VVVVVVVV",
        "VVVVVVVV",
        "VVVVVVVV",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vVVVVVVv",
        "vvvvvvvv",
        "vvvvvvvv",
      ],
      R: ["VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "vvvv", "vvvv", "vvvv"],
      L: "R",
      T: ["VVVVVVVV", "VVVVVVVV", "VVVVVVVV", "VVVVVVVV"],
      D: ["vvvvvvvv", "vvvvvvvv", "vvvvvvvv", "vvvvvvvv"],
    },
    jacket: {
      F: [
        "........",
        "........",
        "........",
        "........",
        "cCcCcCcC",
        ".aaaaaa.",
        ".aaaaaa.",
        ".aAaaAa.",
        ".aaaaaa.",
        ".aaaaaa.",
        ".AaaaaA.",
        "..AAAA..",
      ],
      R: ["....", "....", "....", "....", "cCcC", "....", "....", "....", "....", "....", "....", "...."],
      L: "R",
      B: [
        "........",
        "........",
        "........",
        "........",
        "cCcCcCcC",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........",
      ],
      T: null,
      D: null,
    },
    arm: {
      F: ["VVVV", "VVVV", "VVVV", "VVVV", "VVVV", "ssss", "ssss", "ssss", "ssss", "ssss", "SsSs", "SSSS"],
      B: "F",
      R: "F",
      L: "F",
      T: ["VVVV", "VVVV", "VVVV", "VVVV"],
      D: ["SSSS", "SSSS", "SSSS", "SSSS"],
    },
    sleeve: {
      F: ["....", "....", "....", "....", "....", "VVVV", "....", "....", "....", "....", "....", "...."],
      B: "F",
      R: "F",
      L: "F",
      T: null,
      D: null,
    },
    leg: {
      F: ["PPPP", "PPPP", "PPPP", "pPPp", "PPPP", "PPPP", "PPPP", "PPPP", "PPPP", "PPPP", "bbbb", "nnnn"],
      B: "F",
      R: "F",
      L: "F",
      T: ["PPPP", "PPPP", "PPPP", "PPPP"],
      D: ["nnnn", "nnnn", "nnnn", "nnnn"],
    },
    pants: {
      F: ["....", "....", "....", "....", "....", "....", "WWWW", "XWXW", "WXWX", "XWXW", "bbbb", "nnnn"],
      R: ["....", "....", "....", "....", "....", "....", "WWWW", "XWXW", "WXWX", "XWXW", "bbbb", "nnnn"],
      L: "R",
      B: "R",
      T: null,
      D: ["nnnn", "nnnn", "nnnn", "nnnn"],
    },
  };
  pxScene(() => {
    pxSkin(P, K, map);
    if (hat === 0)
      pxBox(
        P.HG,
        -4.25,
        31.75,
        -4.25,
        8.5,
        2.25,
        8.5,
        pxPaint(
          {
            F: ["YZZZZZZY", "zZZZZZZz", "kkkkkkkk"],
            B: "F",
            R: "F",
            L: "F",
            T: ["ZZZZZZZZ", "ZYZZZZYZ", "ZZZZZZZZ", "ZZZYZZZZ", "ZZZZZZZZ", "ZYZZZYZZ", "ZZZZZZZZ", "ZZZZZZZZ"],
            D: null,
          },
          map,
        ),
        { mat: 0, grid: [8, 3, 8] },
      );
    if (hat === 0)
      pxBox(
        P.HG,
        -6,
        31.25,
        -6,
        12,
        0.75,
        12,
        pxPaint(
          {
            T: [
              "zZZZZZZZZZZz",
              "ZZYZZZZZZYZZ",
              "ZZZZZZZZZZZZ",
              "ZZZZZYZZZZZZ",
              "ZYZZZZZZZZYZ",
              "ZZZZZZZZZZZZ",
              "ZZZZZZZZZZZZ",
              "ZZZYZZZZZYZZ",
              "ZZZZZZZZZZZZ",
              "ZZZZZZZYZZZZ",
              "ZZYZZZZZZZZZ",
              "zZZZZZZZZZZz",
            ],
            F: ["zzzzzzzzzzzz"],
            B: "F",
            R: "F",
            L: "F",
            D: [
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
              "zzzzzzzzzzzz",
            ],
          },
          map,
        ),
        { mat: 0 },
      );
  });
  pxArms(P, (T) => pxSkinArms(T, K, map));
}

export function initializeSoldierSkins() {
  SK_GUARD = {
    hatMat: 4,
    jacketMat: 4,
    sleeveMat: 4,
    pantsMat: 4,
    head: SK_KNIGHT.head,
    hat: {
      F: ["UUUUUUUU", "TTTUUTTT", "oggGGggo", "TTTTTTTT", "kkkkkkkk", "tllllllt", "tlhllhlt", "tddddddt"],
      R: ["UUUUUUUU", "TTTTTTTU", "gggggggo", "TTTTTTTT", "kkTTTTTT", "lltTTTTT", "ldtTTTTt", "dttttttt"],
      L: "~R",
      B: ["UUUUUUUU", "TTTTTTTT", "gggggggg", "TTTTTTTT", "TTTTTTTT", "tTTTTTTt", "tTTTTTTt", "tttttttt"],
      T: ["TUUUUUUT", "UTTTTTTU", "UTTggTTU", "UTTggTTU", "UTTggTTU", "UTTggTTU", "UTTTTTTU", "TUUUUUUT"],
    },
    body: SK_KNIGHT.body,
    jacket: {
      F: [
        "UUUUUUUU",
        "TtrRRrtT",
        "TtRgGRtT",
        "TtgGGgtT",
        "TtRgGRtT",
        "TtRRRRtT",
        "TtrRRrtT",
        "nbbGGbbn",
        "TtRRRRtT",
        "UtRRRRtU",
        "TtRRRRtT",
        "ttggggtt",
      ],
      R: ["UUUU", "TTTT", "TTTT", "TTTT", "TTTT", "tTTT", "tttt", "bbbn", "TTTT", "UUUU", "TTTT", "tttt"],
      L: "~R",
      B: [
        "UUUUUUUU",
        "TTrrrrTT",
        "TTrRRrTT",
        "TTrRRrTT",
        "TTrRRrTT",
        "TTrRRrTT",
        "TtrRRrtT",
        "nbbbbbbn",
        "TtrRRrtT",
        "UtrRRrtU",
        "TtrRRrtT",
        "ttggggtt",
      ],
      T: ["UUUUUUUU", "UTTTTTTU", "UTTTTTTU", "UUUUUUUU"],
    },
    arm: SK_KNIGHT.arm,
    sleeve: {
      F: ["UUUU", "TTTT", "TTTT", "oggo", "....", "UUUU", "TttT", "....", "hhhh", "lmml", "GggG", "lmlm"],
      R: ["UUUU", "TTTT", "TTTT", "oggo", "....", "UUUU", "TTTT", "....", "hhhh", "mmmm", "gggo", "mdmd"],
      L: "R",
      B: ["TTTT", "TTTT", "tTTt", "oggo", "....", "UUUU", "TTTT", "....", "llll", "mmmm", "oggo", "dmdm"],
      T: ["UUUU", "UTTU", "UTTU", "UUUU"],
      D: ["dddd", "dddd", "dddd", "dddd"],
    },
    leg: SK_KNIGHT.leg,
    pants: {
      F: ["TTTT", "TTTT", "tTTt", "....", "hhhh", "hwwh", "lmml", "....", "UUUU", "TttT", "bBBb", "dmmd"],
      R: ["TTTT", "TTTT", "tTTT", "....", "hhhh", "hhhl", "lmml", "....", "UUUU", "TTTT", "bBBb", "dmmd"],
      L: "~R",
      B: ["TTTT", "TTTT", "tTTt", "....", "llll", "mmmm", "dmmd", "....", "UUUU", "TTTT", "bbbb", "dddd"],
      T: ["TTTT", "TTTT", "TTTT", "TTTT"],
      D: ["dddd", "dddd", "dddd", "dddd"],
    },
  };
}
