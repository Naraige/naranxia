import { gOK } from "../world/routes.js";
import { mmTile } from "../world/minimap.js";
import { markT } from "../world/terrain-invalidation.js";
import { occ, pth, stairs, ter } from "../world/terrain-state.js";
import { canStep } from "../world/traversal-rules.js";
import { solid } from "../world/traversal.js";
import { CASTLES } from "./players.js";
import { DIR4, ROTT, RS, TH, TW } from "./rules.js";
import { sessionState } from "./session.js";

/* ---- paths laid by the kingdom (v101, #57): the King removed the path tool. When a building is finished a path is laid from the door of its castle to it, the
   cheapest way over free ground (an existing path costs less, so the branches join the road). Towers and gates are linked too, walls and torches are not.
   It runs inside the simulation (structures are saved whole, `lnk` says a building has been linked) so the host and the guest lay the same tiles. ---- */
const NOLINK = new Set(["wall", "castle", "torch", "path"]);
const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const MARGIN = 36;

/* the tile in front of the middle of the castle door (the same door as doorTiles of construction.js) */
function doorFront(c) {
  const [dx, dy] = DIR4[(c.rot | 0) & 3],
    z = c.sz || 3,
    w = z >= 12 ? 4 : 3,
    a = ((z - w) >> 1) + (w >> 1);
  return dy ? [c.tx + a, dy > 0 ? c.ty + z : c.ty - 1] : [dx > 0 ? c.tx + z : c.tx - 1, c.ty + a];
}

/* the road from the front of the castle door to the ring of tiles around building s; returns the tiles (building end first) or null */
function route(c, s, door) {
  const src = doorFront(c),
    x0 = Math.max(1, Math.min(src[0], s.tx) - MARGIN),
    y0 = Math.max(1, Math.min(src[1], s.ty) - MARGIN),
    x1 = Math.min(TW - 2, Math.max(src[0], s.tx + s.sz) + MARGIN),
    y1 = Math.min(TH - 2, Math.max(src[1], s.ty + s.sz) + MARGIN),
    w = x1 - x0 + 1,
    h = y1 - y0 + 1,
    D = new Int32Array(w * h).fill(1e9),
    prev = new Int32Array(w * h).fill(-1),
    goal = new Uint8Array(w * h);
  /* the road ends at the door of the building (#107: the two tiles in front of the middle of its front, the side `rot` turns to the castle);
     all around it when it has no front (door false: a gate, or a door that is walled in) */
  if (door) {
    const [dx, dy] = DIR4[(s.rot | 0) & 3],
      m = (s.sz >> 1) - 1;
    for (let a = m; a <= m + 1; a++) {
      const x = dy ? s.tx + a : dx > 0 ? s.tx + s.sz : s.tx - 1,
        y = dy ? (dy > 0 ? s.ty + s.sz : s.ty - 1) : s.ty + a;
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) goal[(y - y0) * w + x - x0] = 1;
    }
  } else
    for (let y = s.ty - 1; y <= s.ty + s.sz; y++)
      for (let x = s.tx - 1; x <= s.tx + s.sz; x++) {
        if (x >= s.tx && x < s.tx + s.sz && y >= s.ty && y < s.ty + s.sz) continue;
        if (x < x0 || x > x1 || y < y0 || y > y1) continue;
        goal[(y - y0) * w + x - x0] = 1;
      }
  const free = (x, y) => {
    if (!gOK(x, y)) return false;
    const i = y * TW + x;
    return ter[i] === 0 && !occ.has(i) && !stairs.has(i) && !solid(x, y);
  };
  const B = [[(src[1] - y0) * w + src[0] - x0]];
  D[B[0][0]] = 0;
  for (let d = 0, left = 1; left > 0 && d < 4000; d++) {
    const q = B[d];
    if (!q) continue;
    for (let n = 0; n < q.length; n++) {
      const k = q[n];
      left--;
      if (D[k] !== d) continue;
      if (goal[k]) {
        const out = [];
        for (let j = k; j >= 0; j = prev[j]) out.push([(j % w) + x0, ((j / w) | 0) + y0]);
        return out;
      }
      const lx = k % w,
        ly = (k / w) | 0,
        a = (ly + y0) * TW + lx + x0;
      for (const [dx, dy] of DIRS) {
        const nx = lx + dx,
          ny = ly + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const gx = nx + x0,
          gy = ny + y0,
          gi = gy * TW + gx,
          m = ny * w + nx;
        if (!free(gx, gy) || !canStep(a, gi)) continue;
        const nd = d + (pth[gi] ? 1 : 3);
        if (nd >= D[m]) continue;
        D[m] = nd;
        prev[m] = k;
        (B[nd] || (B[nd] = [])).push(m);
        left++;
      }
    }
  }
  return null;
}

function link(s) {
  const c = CASTLES()[s.pl | 0] || sessionState.CS;
  if (!c || c.hp <= 0) return;
  const r = (ROTT.has(s.type) && s.sz >= 2 && route(c, s, true)) || route(c, s, false);
  if (!r) return;
  const want = RS.done ? 2 : 1;
  /* a road three tiles wide: one tile was a thread beside buildings of 12 (the King, v101: "les bâtiments ne font pas de chemins ?") */
  for (const [rx, ry] of r)
    for (let y = ry - 1; y <= ry + 1; y++)
      for (let x = rx - 1; x <= rx + 1; x++) {
        if (x < 1 || y < 1 || x >= TW - 1 || y >= TH - 1) continue;
        const i = y * TW + x;
        if (ter[i] !== 0 || occ.has(i) || stairs.has(i) || pth[i] >= want || !gOK(x, y)) continue;
        pth[i] = want;
        mmTile(i);
        markT(x, y);
      }
}

/* one building per call, so a loaded old save is linked a little at a time */
export function autoPaths() {
  for (const s of sessionState.structs)
    if (s.t === 0 && s.prog >= 1 && s.hp > 0 && !s.lnk && !NOLINK.has(s.type)) {
      s.lnk = 1;
      link(s);
      return;
    }
}
