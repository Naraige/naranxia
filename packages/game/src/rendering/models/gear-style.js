/* ================= GEAR BOARD (docs/studio-boards/gear): which hand-held items wear the new look (B) =================
   GEAR2_ON is the single switch: '' = every item keeps the current look (A), 'all' = every item on the new look, or a comma list of
   the item keys the King picked, e.g. 'sword,shield,axe'. Keys: sword gsword rsword halberd bow shield cshield gshield
   axe pick hoe hammer carry banner cannon.
   window.__GEAR2 (same format) overrides it for previews only (docs/studio-boards/gear/_src). Visual only: never read by the simulation. */
export const GEAR2_ON='';

/* the raw switch value: part of the model and tool cache keys, so a preview can change it without reloading */
export const gearSig=()=>typeof window!=='undefined'&&window.__GEAR2!==undefined?String(window.__GEAR2):GEAR2_ON;

export const gear2=key=>{const s=gearSig();return s==='all'||(s!==''&&(','+s+',').indexOf(','+key+',')>=0)};
