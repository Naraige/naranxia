import { academy, bell, embassy, guild, market, observatory, sanctuary } from "./builds/civic.js";
import { farm, forester, granary, house, orchard, storage } from "./builds/homes.js";
import { barracks, beacon, castle, sappers, warroom } from "./builds/military.js";
import { gate, keep, torch, tower1, tower2, wall } from "./builds/walls.js";
import forgeWood from "../../assets/builds/pixl-5.js";
import forgeStone from "../../assets/builds/pixl-5-gray.js";

/* ---- the buildings, drawn in blocks like Minecraft builds. One block of a building is one tile of the map (BPT = 1), the same block as the trees,
   the rocks and the steps of the terrain: a model fills its footprint (BSZ tiles a side in gameplay/rules.js = its width in blocks), yard and roof overhangs included.
   Each builder takes the tier (0 timber, 1 stone) and, when it has several looks, which one.
   The designs live in builds/ (homes, civic, military, walls) and are made from the kit in voxel-kit.js; the forge is a plan drawn by the King (assets/builds). ---- */
export const BPT = 1;

const forge = (t) => (t ? forgeStone : forgeWood);

/* type -> { sz: tiles per side, make(tier, look) -> model, variants: number of looks, ox, oz: block offset inside the footprint } */
export const VOXB = {
  castle: { sz: 20, make: castle },
  house: { sz: 12, make: house, variants: 3 },
  farm: { sz: 16, make: farm },
  storage: { sz: 16, make: storage },
  barracks: { sz: 24, make: barracks },
  academy: { sz: 20, make: academy },
  market: { sz: 20, make: market },
  forester: { sz: 16, make: forester },
  guild: { sz: 20, make: guild },
  observatory: { sz: 16, make: observatory },
  granary: { sz: 16, make: granary },
  bell: { sz: 12, make: bell },
  sanctuary: { sz: 20, make: sanctuary },
  beacon: { sz: 12, make: beacon },
  orchard: { sz: 20, make: orchard },
  embassy: { sz: 20, make: embassy },
  warroom: { sz: 20, make: warroom },
  sappers: { sz: 16, make: sappers },
  forge: { sz: 24, make: forge, ox: 0, oz: 1 },
};

/* the fortifications depend on more than the tier: a tower on its size and on whether an engine stands on it (op), a gate on its length; walls
   alternate two looks along their length. Returns the cache key of the piece and how to build it ({ M: model, o / oz: offset of its first block }) */
export function fortOf(s, m, op) {
  const t = s.tier === 0 ? 0 : 1;
  switch (s.type) {
    case "wall": {
      const alt = ((s.tx | 0) + (s.ty | 0)) & 1;
      return { k: "wall" + t + alt, make: () => wall(t, alt) };
    }
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
