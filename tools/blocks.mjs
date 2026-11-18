/* Minecraft block name -> how the game draws it: colour (average of the block's texture), kind (cube, slab, stair, fence, wall, pane, trapdoor, door, sign, post, lamp, small, plate, skip), optional end colour for logs, optional glow.
   First matching rule wins. Plants, buttons and other tiny decor are skipped; ground blocks (grass, dirt, paths) are stripped by the importer. */
export const RULES = [
  [/^(grass_block|dirt|coarse_dirt|dirt_path|podzol|farmland|mud|rooted_dirt)$/, { k: "ground", c: "#5f8a3a" }],
  [
    /(^|_)(grass|tall_grass|fern|large_fern|dandelion|poppy|tulip|orchid|lily_of_the_valley|peony|rose_bush|lilac|sunflower|cornflower|azure_bluet|allium|oxeye_daisy|vine|moss_carpet|sweet_berry_bush|bush|flower|potted_.*|stone_button|button|pressure_plate|torch|redstone.*|lever|tripwire.*)$/,
    { k: "skip" },
  ],
  [/^potted_/, { k: "skip" }],
  [/button$/, { k: "skip" }],
  [/^white_stained_glass_pane$|_glass_pane$|^glass_pane$/, { k: "pane", c: "#cfe9f2", glass: 1 }],
  [/glass$/, { k: "cube", c: "#cfe9f2", glass: 1 }],
  [/^iron_bars$/, { k: "pane", c: "#6b6e70" }],
  [/^chain$/, { k: "post", c: "#3a3f45", t: 0.1875 }],
  [/^lantern$|^soul_lantern$/, { k: "lamp", c: "#f2b94a", glow: 1 }],
  [/^campfire$|^soul_campfire$/, { k: "slab", c: "#c75b1b", glow: 1, h: 0.45 }],
  [/^anvil$|^chipped_anvil$|^damaged_anvil$/, { k: "small", c: "#35353a" }],
  [/^grindstone$/, { k: "small", c: "#8d8d8d" }],
  [/^cauldron$|^water_cauldron$|^lava_cauldron$/, { k: "cube", c: "#3d3d42" }],
  [/^barrel$/, { k: "cube", c: "#7a5a34", c2: "#6a4c2a" }],
  [/^blast_furnace$|^furnace$|^smoker$/, { k: "cube", c: "#5b5b5e" }],
  [/^smithing_table$/, { k: "cube", c: "#3c2f2a" }],
  [/^netherite_block$/, { k: "cube", c: "#403b3e" }],
  [/^iron_trapdoor$/, { k: "trapdoor", c: "#b4b4b4" }],
  [/_trapdoor$/, { k: "trapdoor", wood: 1 }],
  [/_door$/, { k: "door", wood: 1 }],
  [/_wall_sign$|_wall_hanging_sign$/, { k: "sign", wood: 1 }],
  [/_sign$/, { k: "skip" }],
  [/_fence_gate$/, { k: "skip" }],
  [/_fence$/, { k: "fence", wood: 1 }],
  [/_wall$/, { k: "wall", stone: 1 }],
  [/_stairs$/, { k: "stair" }],
  [/_slab$/, { k: "slab" }],
  [/^stripped_(\w+)_log$|^stripped_(\w+)_wood$/, { k: "cube", log: 1 }],
  [/_log$|_wood$/, { k: "cube", log: 1 }],
  [/_planks$/, { k: "cube", wood: 1 }],
  [/^polished_andesite$/, { k: "cube", c: "#888a86" }],
  [/^andesite$/, { k: "cube", c: "#858585" }],
  [/^stone_bricks$|^stone_brick/, { k: "cube", c: "#7b7b7b" }],
  [/^stone$/, { k: "cube", c: "#7d7d7d" }],
  [/^cobblestone$|^mossy_cobblestone$/, { k: "cube", c: "#7a7a7a" }],
  [/^bricks$|^brick$/, { k: "cube", c: "#96563f" }],
  [/^deepslate_tiles$/, { k: "cube", c: "#36363a" }],
  [/^deepslate_bricks$|^polished_deepslate$/, { k: "cube", c: "#434347" }],
  [/^deepslate$/, { k: "cube", c: "#4c4c50" }],
  [/^white_wool$|^white_concrete$/, { k: "cube", c: "#e8e8e8" }],
  [/^yellow_concrete$/, { k: "cube", c: "#f0af15" }],
  [/^honeycomb_block$/, { k: "cube", c: "#e5a02a" }],
  [/^cyan_terracotta$/, { k: "cube", c: "#565b5b" }],
  [/^gray_glazed_terracotta$/, { k: "cube", c: "#53595d" }],
  [/^hay_block$/, { k: "cube", c: "#b89a2a" }],
  [/^air$|^cave_air$|^void_air$/, { k: "air" }],
];

/* base colours by material family, used by stairs, slabs, walls, fences, trapdoors, doors, signs */
const FAM = [
  [/^(stripped_)?spruce/, "#735530", "#85683d", "#6b4f2d"],
  [/^(stripped_)?dark_oak/, "#43301a", "#4b3822", "#43301a"],
  [/^(stripped_)?oak/, "#a58451", "#b09258", "#9c7a44"],
  [/^(stripped_)?birch/, "#c5b377", "#d2c184", "#bfae72"],
  [/^(stripped_)?jungle/, "#a07350", "#ad8359", "#9a6e4a"],
  [/^(stripped_)?acacia/, "#a85a32", "#b0653c", "#a35630"],
  [/^deepslate_tile/, "#36363a"],
  [/^deepslate_brick/, "#434347"],
  [/^polished_deepslate|^cobbled_deepslate|^deepslate/, "#4c4c50"],
  [/^polished_andesite|^andesite/, "#888a86"],
  [/^stone_brick|^mossy_stone_brick/, "#7b7b7b"],
  [/^cobblestone|^mossy_cobblestone/, "#7a7a7a"],
  [/^brick/, "#96563f"],
  [/^stone|^smooth_stone/, "#7d7d7d"],
  [/^sandstone|^cut_sandstone|^smooth_sandstone/, "#d9cb98"],
  [/^quartz/, "#ebe5de"],
];

/* "minecraft:spruce_stairs[facing=east,...]" -> {n:"spruce_stairs", s:{facing:"east",...}} */
export function splitState(full) {
  const m = /^(?:minecraft:)?([^[]+)(?:\[(.*)\])?$/.exec(full),
    s = {};
  if (m[2])
    for (const kv of m[2].split(",")) {
      const [k, v] = kv.split("=");
      s[k] = v;
    }
  return { n: m[1], s };
}

/* the drawing definition of one palette entry (a JSON-friendly object), or null when nothing is drawn */
export function defOf(full, unknown) {
  const { n, s } = splitState(full);
  let r = null;
  for (const [re, d] of RULES)
    if (re.test(n)) {
      r = d;
      break;
    }
  if (!r) {
    for (const f of FAM)
      if (f[0].test(n)) {
        r = { k: "cube", c: f[1] };
        break;
      }
    if (!r) {
      unknown.add(n);
      r = { k: "cube", c: "#ff00ff" };
    }
  }
  if (r.k === "air" || r.k === "skip" || r.k === "ground") return r.k === "ground" ? { k: "ground" } : null;
  const o = { k: r.k };
  const base = n.replace(/_(stairs|slab|wall|fence|trapdoor|door|wall_sign|log|wood|planks)$/, "");
  let fam = null;
  for (const f of FAM)
    if (f[0].test(n)) {
      fam = f;
      break;
    }
  o.c = r.c || (fam ? (r.log ? fam[2] || fam[1] : fam[1]) : "#7a7a7a");
  if (r.log) {
    o.c2 = fam && fam[3] ? (n.startsWith("stripped") ? fam[1] : fam[3]) : o.c;
    if (s.axis) o.ax = s.axis;
    if (n.startsWith("stripped")) o.c2 = fam ? fam[1] : o.c;
    else o.c2 = fam ? fam[1] : o.c;
  }
  if (r.c2) o.c2 = r.c2;
  if (r.glow) o.glow = 1;
  if (r.glass) o.glass = 1;
  if (r.t) o.t = r.t;
  if (r.h) o.h = r.h;
  for (const k of ["facing", "half", "type", "shape", "open", "hinge", "east", "west", "north", "south"])
    if (s[k] !== undefined) o[k] = s[k];
  void base;
  return o;
}
