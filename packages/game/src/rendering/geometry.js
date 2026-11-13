import { hex } from "../core/math.js";
import { THREE } from "./three.js";

export const geometryState = {
  BMAT: 0,
  WOODY: false,
};

/* ---- geometry helpers ---- */
export const newG = () => ({ P: [], N: [], C: [], I: [], M: [], hm: 0 });

export function quad(G, a, b, c, d, n, ca, cb, cc, cd) {
  const o = G.P.length / 3;
  if (G.M) {
    if (G.M.length < o) for (let i = G.M.length; i < o; i++) G.M.push(0);
    G.M.push(geometryState.BMAT, geometryState.BMAT, geometryState.BMAT, geometryState.BMAT);
    if (geometryState.BMAT) G.hm = 1;
  }
  G.P.push(...a, ...b, ...c, ...d);
  G.N.push(...n, ...n, ...n, ...n);
  G.C.push(...ca, ...cb, ...cc, ...cd);
  G.I.push(o, o + 1, o + 2, o, o + 2, o + 3);
}

export function tri(G, A, B, C, n, c) {
  const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]],
    v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]],
    cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0) {
    const t = B;
    B = C;
    C = t;
  }
  quad(G, A, B, C, C, n, c, c, c, c);
}

export function toGeo(G) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(G.P, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(G.N, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(G.C, 3));
  if (G.hm) {
    const n = G.P.length / 3,
      M = G.M.slice(0, n);
    while (M.length < n) M.push(0);
    g.setAttribute("mat", new THREE.Float32BufferAttribute(M, 1));
  }
  g.setIndex(G.I);
  g.computeBoundingSphere();
  if (G.chim) g.userData.chim = G.chim;
  return g;
}

export const rgb = (h) => {
  const c = hex(h);
  return [c[0] / 255, c[1] / 255, c[2] / 255];
};

export const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

const FK = [1, 0.9, 0.8, 0.86, 0.77, 0.55];

export function addBox(G, x0, y0, z0, x1, y1, z1, c) {
  const s = (k) => shade(c, FK[k]),
    d = (k) => shade(c, FK[k] * 0.78);
  quad(G, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], s(0), s(0), s(0), s(0));
  quad(G, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0], d(1), s(1), s(1), d(1));
  quad(G, [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [-1, 0, 0], d(2), s(2), s(2), d(2));
  quad(G, [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1], [0, 0, 1], d(3), s(3), s(3), d(3));
  quad(G, [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [0, 0, -1], d(4), s(4), s(4), d(4));
  quad(G, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], s(5), s(5), s(5), s(5));
}
const WDP = ["#4a321f", "#5a3b23", "#6b4a2c", "#7a5333", "#8a6038", "#9a6c40", "#a8814f"];
/* thatch tones: every roof drawn in these colours is straw (material 9) */
export const WRF = ["#a88a44", "#b89850", "#c8a85e"];
/* stone footings and chimney bricks stay stone in the timber tier (footings turn to grey cobble) */
const WKEEP = { "#9a5442": "#9a5442", "#87493a": "#87493a", "#9b8565": "#8b8882", "#7f6c52": "#6f6c68" };
const WDC = new Map();

function woodOf(c, roof) {
  const k = (roof ? "r" : "") + (typeof c === "string" ? c : c.join(","));
  let v = WDC.get(k);
  if (v) return v;
  const q = typeof c === "string" ? rgb(c) : c,
    L = q[0] * 0.3 + q[1] * 0.55 + q[2] * 0.15;
  v = roof
    ? WRF[Math.min(2, Math.max(0, ((L - 0.25) * 6) | 0))]
    : WDP[Math.min(6, Math.max(0, ((L - 0.18) * 9.5) | 0))];
  WDC.set(k, v);
  return v;
}

export const bxm = (m) => (G, cx, y0, cz, w, h, d, c) => {
  const o = geometryState.BMAT;
  let mm = m,
    cc = c;
  if (geometryState.WOODY && (m === 1 || m === 6)) {
    if (m === 1 && WKEEP[c]) cc = WKEEP[c];
    else {
      cc = woodOf(c, m === 6);
      if (m === 1) mm = 2;
    }
  }
  if (mm === 6 && WRF.includes(cc)) mm = 9;
  geometryState.BMAT = mm;
  try {
    bxc(G, cx, y0, cz, w, h, d, cc);
  } finally {
    geometryState.BMAT = o;
  }
};

let BXN = 0;
export const bxc = (G, cx, y0, cz, w, h, d, c) => {
  const e = Math.min((1 + (BXN++ % 4)) * 0.0006, Math.min(w, h, d) * 0.12);
  return addBox(
    G,
    cx - w / 2 - e,
    y0 - e,
    cz - d / 2 - e,
    cx + w / 2 + e,
    y0 + h + e,
    cz + d / 2 + e,
    typeof c === "string" ? rgb(c) : c,
  );
};
