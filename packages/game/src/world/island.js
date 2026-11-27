import { fb, hs } from "../core/math.js";
import { TH, TW } from "../gameplay/rules.js";
import { terrainState } from "./terrain-state.js";

/* the world is one island (v101, #52, #70) of about ISL_R tiles around the middle of the map, the sea beyond; the rival kingdoms are gone.
   Its shore is natural (bays, headlands, coves), parts of it are cliffs. Around the founding disc (ISL_SITE, moved towards the bridge) lies the
   heart: a flat dry meadow where the castles are founded and the big block buildings fit, with thinner woods and boulder fields (terrain.js).
   The rest of the island keeps its hills, lakes, rivers and forests. */
export const ISL_R = 340,
  ISL_SEA = 0.93,
  ISL_HEART = 135 /* tiles of flat dry meadow around the middle of the founding disc, fading out over ISL_FADE more */,
  ISL_FADE = 45,
  ISL_SITE = 0.18 /* a castle is founded within this distance (a fraction of ISL_R) from the middle of the founding disc */,
  ISL_SHIFT = 110; /* the founding disc is moved this many tiles towards the bridge: the horde's road stays 220 to 340 tiles whatever the site */
const rawN = (x, y) => Math.hypot(x - TW / 2, y - TH / 2) / ISL_R;
/* 1 away from the line of the bridge, 0.25 on it: the shore keeps to its circle where the causeway leaves the island */
function calm(x, y) {
  const g = islandGate(),
    dx = x - TW / 2,
    dy = y - TH / 2;
  if (dx * g.ex + dy * g.ey < 0) return 1;
  const l = (dy * g.ex - dx * g.ey) / 95;
  return 1 - 0.75 * Math.exp(-l * l);
}
/* the island is bigger and its shore natural (#70): wide bays and headlands (a slow noise, up to an eighth of the radius) with small coves on
   them, instead of a near circle. Sea where this is over ISL_SEA. */
export function islandN(x, y) {
  const sd = terrainState.SEED;
  return (
    rawN(x, y) +
    ((fb(x * 0.0045, y * 0.0045, sd + 1700) - 0.5) * 0.28 + (fb(x * 0.018, y * 0.018, sd + 1750) - 0.5) * 0.05) *
      calm(x, y)
  );
}
/* 1 in the flat heart of the island (around the founding disc), 0 from ISL_HEART + ISL_FADE outwards */
export function islandCore(x, y) {
  /* its edge wanders (35 tiles either way) so the meadow does not read as a drawn circle */
  const m = islandSiteMid(),
    r = ISL_HEART + (fb(x * 0.012, y * 0.012, terrainState.SEED + 1800) - 0.5) * 70,
    t = Math.max(0, Math.min(1, (Math.hypot(x - m[0], y - m[1]) - r) / ISL_FADE));
  return 1 - t * t * (3 - 2 * t);
}
/* cliffs on parts of the coast (#70): how many levels the land rises here above its own height. Along stretches the seed picks (about a
   third of the shore), the last dozen tiles before the sea climb 4 to 7 levels and drop sheer into the water; never by the bridge or in the
   heart. */
export function islandCliff(x, y) {
  const n = islandN(x, y);
  if (n < ISL_SEA - 0.045 || n > ISL_SEA) return 0;
  const sd = terrainState.SEED,
    m = (fb(x * 0.0038 + 31, y * 0.0038, sd + 1900) - 0.55) / 0.07;
  if (m <= 0) return 0;
  const c = calm(x, y),
    k = Math.min(1, m) * Math.min(1, (n - (ISL_SEA - 0.045)) / 0.028) * (c < 0.8 ? 0 : 1) * (1 - islandCore(x, y));
  return Math.round(k * (4 + 3 * fb(x * 0.02, y * 0.02, sd + 1950)));
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
    R =
      ISL_R * (ISL_SEA + 0.045) + 18 + ISLET_R /* the shore at its furthest by the bridge, the open water, the islet */,
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
