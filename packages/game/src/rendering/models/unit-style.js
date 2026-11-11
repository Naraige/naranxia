/* ================= UNITS BOARD (docs/studio-boards/units): which unit types wear the new look (B) =================
   UV2_ON is the single switch: '' = every unit keeps the current look (A), 'all' = every unit on the new look, or a comma list of
   the types the King picked, e.g. 'peasant,archer,knight'. Types: peasant archer knight spearman captain bannerman gunner gunner2 guard king
   scout engineer envoy zombie husk runner brute bomber acid miner boss.
   window.__UV2 (same format) overrides it for previews only (docs/studio-boards/units/_src/render.py). Visual only: never read by the simulation. */
export const UV2_ON='all';

export const uv2=type=>{const s=typeof window!=='undefined'&&window.__UV2!==undefined?window.__UV2:UV2_ON;return s==='all'||(s!==''&&(','+s+',').indexOf(','+type+',')>=0)};
