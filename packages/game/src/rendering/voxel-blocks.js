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
  [/_glass_pane$|^glass_pane$/, { k: "pane", c: "#cfe9f2", glass: 1, stained: 1 }],
  [/glass$/, { k: "cube", c: "#cfe9f2", glass: 1, stained: 1 }],
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
  [/^gold_block$/, { k: "cube", c: "#f2d23a" }],
  [/^iron_block$/, { k: "cube", c: "#d8d8d8" }],
  [/^soil$/, { k: "cube", c: "#55391f" }],
  [/^crop_(\w+)$/, { k: "slab", h: 0.62, cropc: 1 }],
  [/^water$/, { k: "slab", c: "#3b6fb6", h: 0.85, glass: 1 }],
  [/_leaves$/, { k: "cube", leaf: 1 }],
  [/_wool$|_carpet$/, { k: "cube", wool: 1 }],
  [/^banner_(\w+)$/, { k: "flag", banner: 1 }],
  [/^bookshelf$/, { k: "cube", c: "#6b4f2d", c2: "#a58451" }],
  [/^crafting_table$/, { k: "cube", c: "#8a5a2b" }],
  [/^glowstone$|^sea_lantern$|^shroomlight$/, { k: "cube", c: "#f2c25a", glow: 1 }],
  [/^bell$/, { k: "small", c: "#e0b640" }],
  [/^chest$|^trapped_chest$|^ender_chest$/, { k: "small", c: "#8a5a2b" }],
  [/^lava$/, { k: "cube", c: "#e8571c", glow: 1 }],
  [/^smooth_stone$|^stone_slab$/, { k: "cube", c: "#8a8a8a" }],
  [/^terracotta$|^orange_terracotta$/, { k: "cube", c: "#a1583a" }],
  [/^red_terracotta$|^red_nether_bricks$|^nether_bricks$/, { k: "cube", c: "#7d3a2e" }],
  [/^hay_block$/, { k: "cube", c: "#b89a2a" }],
  [/^air$|^cave_air$|^void_air$/, { k: "air" }],
];

/* base colours by material family, used by stairs, slabs, walls, fences, trapdoors, doors, signs */
export const WOOL = {
  white: "#e8e8e8",
  red: "#a8322a",
  blue: "#3a49a8",
  yellow: "#e8c23a",
  green: "#4a6a2a",
  orange: "#e07a1a",
  purple: "#7a3aa0",
  black: "#1d1d21",
  gray: "#4a4d51",
  brown: "#6a4a2a",
  light_blue: "#4aa0d8",
  cyan: "#157788",
  pink: "#e8a0b8",
  lime: "#70b81a",
  magenta: "#b040b0",
  light_gray: "#9a9a94",
};
export const LEAF = {
  oak: "#4d7a2c",
  spruce: "#3a5a3a",
  birch: "#6a8a3a",
  dark_oak: "#3a6a22",
  cherry: "#e8a6c0",
  azalea: "#5a7a2e",
  jungle: "#3a7a1e",
  acacia: "#5a7a22",
};
export const CROP = { wheat: "#cfb44e", green: "#4f8a2e", carrot: "#e0861e", red: "#b83a2a" };
const FAM = [
  [/^prismarine_brick/, "#5fa090"],
  [/^dark_prismarine/, "#2f5a4a"],
  [/^(oxidized_)?cut_copper|^weathered_cut_copper/, "#4a9a7e"],
  [/^copper/, "#b8693a"],
  [/^warped/, "#2a7a7a"],
  [/^red_nether_brick/, "#6a2a2a"],
  [/^nether_brick/, "#3a1c20"],
  [/^mud_brick/, "#8a6a4a"],
  [/^purpur/, "#a77ba7"],
  [/^red_sandstone/, "#b5622a"],
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
  if (r.stained) o.c = n.startsWith("white") ? "#cfe9f2" : WOOL[n.replace(/_stained_glass(_pane)?$/, "")] || "#cfe9f2";
  else if (r.wool) o.c = WOOL[n.replace(/_(wool|carpet)$/, "")] || "#e8e8e8";
  else if (r.leaf) o.c = LEAF[n.replace(/_leaves$/, "")] || "#4d7a2c";
  else if (r.cropc) o.c = CROP[n.slice(5)] || "#cfb44e";
  else if (r.banner) o.c = WOOL[n.slice(7)] || "#a8322a";
  else o.c = r.c || (fam ? (r.log ? fam[2] || fam[1] : fam[1]) : "#7a7a7a");
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
