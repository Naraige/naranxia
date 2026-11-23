import { fb } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { terrainState } from "./terrain-state.js";

/* the world is a round island (v101, #52). The King removed the rival kingdoms, so the land is small: a disc of ISL_R tiles around the middle of the map,
   the sea beyond. The shore wobbles with a slow noise. The routes end ISL_END inside the sea line, where the portals open, so a horde never walks
   more than a few hundred tiles (the swarm moves slowly: the old 2250 x 1250 rectangle had its edge 1000 tiles away). The heart of the island
   (ISL_CORE) is a flat meadow without water: the castles are founded there (ISL_SITE) and the big block buildings fit. */
export const ISL_R = 260,
  ISL_SEA = 0.93,
  ISL_END = 0.8,
  ISL_CORE = 0.3,
  ISL_SITE = 0.3; /* a castle is founded within this distance from the middle (a fraction of ISL_R) */
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
