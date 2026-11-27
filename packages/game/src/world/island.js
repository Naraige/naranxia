import { fb, hs } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { terrainState } from "./terrain-state.js";

/* the world is a round island (v101, #52). The King removed the rival kingdoms, so the land is small: a disc of ISL_R tiles around the middle of the map,
   the sea beyond. The shore wobbles with a slow noise. The routes end ISL_END inside the sea line, where the portals open, so a horde never walks
   more than a few hundred tiles (the swarm moves slowly: the old 2250 x 1250 rectangle had its edge 1000 tiles away). The heart of the island
   (ISL_CORE) is a flat meadow without water: the castles are founded there (ISL_SITE) and the big block buildings fit.
   The heart is wider than the founding disc (#68): wherever the castle stands it has at least 50 tiles of flat dry land on every side, and the
   woods and boulder fields are thinner there (terrain.js), so a kingdom has room to grow before it meets hills, lakes or forest. */
export const ISL_R = 260,
  ISL_SEA = 0.93,
  ISL_END = 0.8,
  ISL_CORE = 0.6,
  ISL_SITE = 0.23 /* a castle is founded within this distance (a fraction of ISL_R) from the middle of the founding disc */,
  ISL_SHIFT = 50; /* the founding disc is moved this many tiles towards the bridge, so the horde's road is 190 to 300 tiles whatever the site */
const rawN = (x, y) => Math.hypot(x - TW / 2, y - TH / 2) / ISL_R;
export function islandN(x, y) {
  return rawN(x, y) + (fb(x * 0.01, y * 0.01, terrainState.SEED + 1700) - 0.5) * 0.07;
}
/* 1 in the flat heart of the island, 0 from ISL_CORE + 0.12 outwards */
export function islandCore(x, y) {
  const t = Math.max(0, Math.min(1, (rawN(x, y) - ISL_CORE) / 0.12));
  return 1 - t * t * (3 - 2 * t);
}
/* the distance from (cx, cy) along the unit direction (ex, ey) to the circle where the routes end */
export function islandReach(cx, cy, ex, ey) {
  const px = cx - TW / 2,
    py = cy - TH / 2,
    R = ISL_END * ISL_R,
    B = 2 * (px * ex + py * ey),
    C = px * px + py * py - R * R,
    d = B * B - 4 * C;
  return d <= 0 || C > 0 ? 60 : (-B + Math.sqrt(d)) / 2;
}

/* ---- the bridge and the islet of the portals (#69) ----
   The King: "one huge island with a bridge, and on the far side of the bridge the portal of the zombies". Beyond the sea, in a direction the
   seed picks, lies a small round islet; a straight causeway of land joins it to the island. Every route of the horde starts on the islet (its
   portals stand there side by side), crosses the bridge, reaches the bridge head on the island and only then spreads towards the castles
   (world/routes.js). Nothing else joins the islet to the island: the bridge is the one way in. */
export const ISLET_R = 16,
  BRIDGE_HW = 4.5; /* half the width of the causeway, in tiles */
let GK = NaN,
  G = null;
export function islandGate() {
  if (GK === terrainState.SEED && G) return G;
  GK = terrainState.SEED;
  const a = hs(3, 7, terrainState.SEED + 77) * 6.283185,
    ex = Math.cos(a),
    ey = Math.sin(a),
    R = ISL_R * ISL_SEA + 9 + 18 + ISLET_R /* shore, its wobble, the open water, the islet */,
    H = ISL_R * 0.75; /* the bridge head, well inside the shore */
  G = { a, ex, ey, R, H, x: TW / 2 + ex * R, y: TH / 2 + ey * R, hx: TW / 2 + ex * H, hy: TH / 2 + ey * H };
  return G;
}
/* 2 on the islet, 1 on the causeway, 0 elsewhere */
export function islandBridge(x, y) {
  const g = islandGate(),
    dx = x - TW / 2,
    dy = y - TH / 2,
    t = dx * g.ex + dy * g.ey;
  if (t < g.H) return 0;
  if (Math.hypot(x - g.x, y - g.y) < ISLET_R) return 2;
  return t < g.R && Math.abs(dy * g.ex - dx * g.ey) < BRIDGE_HW ? 1 : 0;
}

/* the middle of the disc where castles are founded, and how far (x, y) lies from it as a fraction of ISL_R (compare with ISL_SITE) */
export function islandSiteMid() {
  const g = islandGate();
  return [TW / 2 + g.ex * ISL_SHIFT, TH / 2 + g.ey * ISL_SHIFT];
}
export function islandSiteN(x, y) {
  const m = islandSiteMid();
  return Math.hypot(x - m[0], y - m[1]) / ISL_R;
}
