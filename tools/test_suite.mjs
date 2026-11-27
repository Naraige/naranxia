import { readFileSync } from "node:fs";
export const manualDiagnostics = JSON.parse(
  readFileSync(new URL("../tests/manual_diagnostics.json", import.meta.url), "utf8"),
);
const browserNames = [
  "smoke",
  "det",
  "features",
  "spearman",
  "dragon",
  "kingxp",
  "compat",
  "bossabil",
  "envoy",
  "ruins",
  "events",
  "traps",
  "stance",
  "frame_guard",
  "map_size",
  "portals",
  "voxel_buildings",
  "mp_side",
  "bastion",
  "research",
  "market",
  "quests",
  "ui",
  "waves",
  "save",
  "command_contract",
  "azerty_probe",
  "convoy_probe",
  "convoy_cut_probe",
  "waves_probe",
];
const mpNames = [
  "mp8",
  "mpk",
  "mp_kxp",
  "mp_events",
  "mp_resync",
  "mp_quests",
  "mp_convoy",
  "mp_build",
  "mp_dragon",
  "mp_lag",
  "mp_rematch",
  "mp_resync_deep",
  "mp_soak",
  "mp_cut",
];
export const suite = Object.fromEntries([
  ...browserNames.map((name) => [
    name,
    {
      kind: "browser",
      file: `tests/${name}.js`,
      html: name === "smoke" ? "naranxia.html" : "naranxia_readable.html",
      heavy: ["convoy_probe", "convoy_cut_probe", "waves_probe"].includes(name),
    },
  ]),
  ...mpNames.map((name) => [
    name,
    { kind: "python", file: `tests/${name}.py`, args: name === "mp_soak" ? ["naranxia_readable.html", "6000"] : [] },
  ]),
  ["observer", { kind: "python", file: "tests/observer_contract.py" }],
  ["architecture", { kind: "node", file: "tests/architecture-check.test.mjs" }],
  ["trap_controls", { kind: "python", file: "tests/trap_controls.py", assets: ["tests/trap_controls.js"] }],
  ["tools", { kind: "python", file: "tests/tools.py" }],
  ["runner", { kind: "node", file: "tests/test_runner.mjs" }],
  ["desktop", { kind: "node", file: "tests/desktop_bridge.cjs" }],
  ["gameplay_fast", { kind: "node", file: "tests/gameplay_fast.mjs" }],
  ["faults", { kind: "node", file: "tools/mutation_check.mjs" }],
  ["browser_faults", { kind: "python", file: "tools/browser_faults.py" }],
  ["performance", { kind: "python", file: "tools/benchmark.py" }],
]);
const purposes = {
  smoke: "Packed loader, starting rules, ramp paths, wave spawning and real rendered pixels",
  det: "Repeated 6000-tick simulation with pinned reference fingerprints",
  features: "Seasons, trap/oil damage, boss, King skills, statistics, records and co-op goals",
  dragon: "Dragon breath damage, reach clamp, idle breath and save round trip",
  spearman: "Training costs, reach, exact damage, camp composition and keyboard migration",
  kingxp: "King XP sources, talent requirements, skill effects and historical save fields",
  compat: "Mixed, older, newer and malformed save data handling",
  bossabil: "Distinct boss healing, summoning and exact frost damage",
  envoy: "Exact tribute, envoy consumption, cooldown and repeat visit rejection",
  ruins: "Ruin discovery, claim reward and save registration",
  events: "Event choices, deadlines, payouts, camp traits, renown and state assignment",
  mp_rematch: "Co-op rematch: Play again returns both players to the lobby and a second game runs in step",
  voxel_buildings: "Block-built buildings: footprints match the models, every block is known, geometry builds",
  portals: "Horde portals: one per lane, opened by its first horde, saved and restored",
  map_size: "World size: zombie lanes start within the chosen distance, Large keeps the whole world",
  frame_guard: "A frame that throws does not stop the loop and tells the player once",
  stance: "Defensive stance strikes in reach without chasing, aggressive moves, hold stays",
  mp_side: "Co-op save and load keeps each player on his own side",
  traps: "History-independent timers, exact trap damage/wear and exhausted removal",
  bastion: "Building abilities, food production and actual healing/repair",
  research: "Research exclusivity, prerequisites, fatigue, recovery and tribute caps",
  market: "Exact barter, refusal paths, price changes and wave previews",
  quests: "Quest progression, rewards, negative paths, historical saves and convoy ordering",
  ui: "Keyboard layouts, rebinding, minimap transforms, banners and guide transitions",
  waves: "Difficult seeded wave routes, living water escape and stuck-unit safety bounds",
  save: "Save round trip, every persisted typed-array byte, references and deterministic continuation",
  command_contract: "Command enqueueing, owner resolution, costs and duplicate rejection",
  azerty_probe: "Default physical and symbol bindings under QWERTY and AZERTY events",
  convoy_probe: "36 seeded convoy delivery/refusal journeys",
  convoy_cut_probe: "120 seeded route lookups with stable results and unchanged gameplay state",
  waves_probe: "24 seeded wave-three worlds with no unresolved water/stuck outcomes",
  mp8: "Natural co-op construction/research, ownership, conflicting commands, roles, quests and waves",
  mpk: "Two Kings, linked guards, rejected duplicate/full queues and combat",
  mp_kxp: "Both Kings reach exact talents and skills without matching-tick divergence",
  mp_events: "Atomic event order, exact payouts, deadlines and open-event recovery",
  mp_resync: "Guest state corruption triggers one recovery epoch and deterministic continuation",
  mp_quests: "Natural training, combat and same-tick quest/convoy rewards to both players",
  mp_convoy: "Equal porter delivery ticks, quantities and return home on both peers",
  mp_build: "Real host/guest pointer placement, meshes, ownership, recovery and guest-alone behavior",
  mp_dragon:
    "Castle and Dragon roles: one castle, player indexes either way, King walked by keys, dragon state equal on both peers",
  mp_lag:
    "Co-op with random packet delays, a slow machine and constant building: no desync, same structures, right owners",
  mp_resync_deep: "Five recoveries during events, convoy, raid, skills and host corruption",
  mp_soak: "6000 matching ticks with scripted co-op activity and no unsolicited recovery",
  mp_cut: "Disconnected-world convoy refusal and unrewarded quest skip on both peers",
};
for (const [name, purpose] of Object.entries(purposes)) suite[name].purpose = purpose;
export const tiers = {
  fast: ["architecture", "runner", "gameplay_fast", "desktop", "faults"],
  core: [
    "observer",
    "faults",
    "architecture",
    "command_contract",
    "runner",
    "gameplay_fast",
    "desktop",
    "features",
    "spearman",
    "dragon",
    "traps",
    "stance",
    "frame_guard",
    "map_size",
    "portals",
    "voxel_buildings",
    "mp_side",
    "trap_controls",
    "kingxp",
    "market",
    "research",
    "quests",
    "save",
    "mp_build",
    "mp_dragon",
    "mp_lag",
    "mp_rematch",
    "mp8",
    "mp_kxp",
    "mp_resync",
    "mp_convoy",
  ],
  full: Object.keys(suite).filter(
    (name) => !["performance", "convoy_probe", "convoy_cut_probe", "waves_probe"].includes(name),
  ),
  stress: ["convoy_probe", "convoy_cut_probe", "waves_probe", "mp_soak", "mp_resync_deep", "mp_cut", "waves"],
  performance: ["performance"],
};
export function selectTests(args) {
  let tier = null,
    build = false,
    list = false;
  const names = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--build") build = true;
    else if (arg === "--list") list = true;
    else if (arg === "--full") {
      if (tier) throw new Error("Choose one tier");
      tier = "full";
    } else if (arg === "--tier") {
      if (tier) throw new Error("Choose one tier");
      tier = args[++i];
      if (!tiers[tier]) throw new Error(`Unknown tier: ${tier}`);
    } else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else names.push(arg);
  }
  if (tier && names.length) throw new Error("Choose named tests or a tier, not both");
  const selected = [...new Set(names.length ? names : tiers[tier || "core"])];
  for (const name of selected) if (!suite[name]) throw new Error(`Unknown test: ${name}`);
  return { selected, tier: tier || (names.length ? "selected" : "core"), build, list };
}
