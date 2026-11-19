import { academy, bell, embassy, guild, market, observatory, sanctuary } from "./builds/civic.js";
import { farm, forester, granary, house, orchard, storage } from "./builds/homes.js";
import { barracks, beacon, castle, sappers, warroom } from "./builds/military.js";
import { gate, keep, torch, tower1, tower2, wall } from "./builds/walls.js";
import forgeWood from "../../assets/builds/pixl-5.js";
import forgeStone from "../../assets/builds/pixl-5-gray.js";

/* ---- the buildings, drawn in blocks like Minecraft builds. One tile of the map is BPT blocks; a model fills its footprint (BSZ tiles, so BSZ * BPT blocks square),
   yard and roof overhangs included. Each builder takes the tier (0 timber, 1 stone) and, when it has several looks, which one.
   The designs live in builds/ (homes, civic, military) and are made from the kit in voxel-kit.js; the forge is a plan drawn by the King (assets/builds). ---- */
export const BPT = 4;

const forge = (t) => (t ? forgeStone : forgeWood);

/* type -> { sz: tiles per side, make(tier, look) -> model, variants: number of looks, ox, oz: block offset inside the footprint } */
export const VOXB = {
  castle: { sz: 5, make: castle },
  house: { sz: 3, make: house, variants: 3 },
  farm: { sz: 4, make: farm },
  storage: { sz: 4, make: storage },
  barracks: { sz: 6, make: barracks },
  academy: { sz: 5, make: academy },
  market: { sz: 5, make: market },
  forester: { sz: 4, make: forester },
  guild: { sz: 5, make: guild },
  observatory: { sz: 4, make: observatory },
  granary: { sz: 4, make: granary },
  bell: { sz: 3, make: bell },
  sanctuary: { sz: 5, make: sanctuary },
  beacon: { sz: 3, make: beacon },
  orchard: { sz: 5, make: orchard },
  embassy: { sz: 5, make: embassy },
  warroom: { sz: 5, make: warroom },
  sappers: { sz: 4, make: sappers },
  forge: { sz: 6, make: forge, ox: 0, oz: 1 },
};

/* the fortifications depend on more than the tier: a wall on its neighbours (m), a tower on its size and on whether an engine stands on it (op), a gate on its length.
   Returns the cache key of the piece and how to build it ({ M: model, o / oz: offset of its first block }) */
export function fortOf(s, m, op) {
  const t = s.tier === 0 ? 0 : 1;
  switch (s.type) {
    case "wall":
      return { k: "wall" + t + "m" + (m & 63), make: () => wall(t, m & 63) };
    case "tower":
      return s.sz === 2
        ? { k: "tower2" + t + (op ? "o" : ""), make: () => tower2(t, op) }
        : { k: "tower" + t + (op ? "o" : ""), make: () => tower1(t, op) };
    case "gate":
      return (s.gl || 2) === 2 || s.gl === 3 ? { k: "gate" + t + (s.gl || 2), make: () => gate(t, s.gl || 2) } : null;
    case "keep":
      return { k: "keep" + t, make: () => keep(t) };
    case "torch":
      return { k: "torch", make: torch };
  }
  return null;
}
