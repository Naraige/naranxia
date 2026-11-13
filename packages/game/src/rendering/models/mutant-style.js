/* ================= MUTANTS BOARD (docs/studio-boards/mutants): which mutated undead wear the monstrosity look (B) =================
   MUT2_ON is the single switch: '' = every mutant keeps the current look (A), 'all' = every mutant on the new look, or a comma list of
   the types the King picked, e.g. 'brute,boss,acid'. Types: husk runner brute bomber acid miner boss (boss = the giant brute of waves 10, 20...).
   window.__MUT2 (same format) overrides it for previews only (docs/studio-boards/mutants/_src). Visual only: never read by the simulation. */
export const MUT2_ON = "all";

export const MUT2_TYPES = { husk: 1, runner: 1, brute: 1, bomber: 1, acid: 1, miner: 1, boss: 1 };

export const mut2 = (type) => {
  if (!MUT2_TYPES[type]) return false;
  const s = typeof window !== "undefined" && window.__MUT2 !== undefined ? window.__MUT2 : MUT2_ON;
  return s === "all" || (s !== "" && ("," + s + ",").indexOf("," + type + ",") >= 0);
};

/* night eye glows (rendering/swarm.js zEyes): [height, forward] in unit heights, for the heads moved by the new bodies */
export const MUT2_EYE = {
  brute: [0.6, 0.2],
  runner: [0.56, 0.3],
  bomber: [0.585, 0.16],
  acid: [0.6, 0.24],
  miner: [0.63, 0.2],
  husk: [0.62, 0.18],
};
