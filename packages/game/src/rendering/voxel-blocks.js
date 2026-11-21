import { BK, BKB, matOfKind } from "./blocks.js";

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
  [/^flower_(\w+)$/, { k: "tuft", flowerc: 1, c2: "#4f8a35" }],
  [/^grass_tuft$/, { k: "blades", c: "#5fa040" }],
  [/^fern$/, { k: "blades", c: "#3f7f3a" }],
  [/^shrub(_\w+)?$/, { k: "shrub", c: "#4a8032", shrubc: 1 }],
  [/^window_box_(\w+)$/, { k: "wbox", c: "#6b4a2a", c2: "#4f8a35", boxc: 1 }],
  [/^pot_(\w+)$/, { k: "pot", c: "#a85a3a", c2: "#4f8a35", potc: 1 }],
  [/^table$/, { k: "table", c: "#8a643a", c2: "#4a3524" }],
  [/^stool$/, { k: "stool", c: "#8a643a", c2: "#4a3524" }],
  [/^bench$/, { k: "bench", c: "#8a643a", c2: "#4a3524" }],
  [/^stake$/, { k: "stake", c: "#6a4c2e" }],
  [/^sconce$/, { k: "torch", c: "#3a3f45", c2: "#ffb040" }],
  [/^brazier$/, { k: "brazier", c: "#3a3f45", c2: "#ff9a30" }],
  [/^hanging_sign$/, { k: "board", c: "#9c7a44", c2: "#3a3f45" }],
  [/^shield_(\w+)$/, { k: "shield", c2: "#c8c8c8", shieldc: 1 }],
  [/^wheel$/, { k: "wheel", c: "#7a5a34", c2: "#3a3f45" }],
  [/^weapon_rack$/, { k: "rack", c: "#6a4c2e", c2: "#b8bcc4" }],
  [/^headstone$/, { k: "headstone", c: "#787a77" }],
  [/^ivy$/, { k: "vine", c: "#3f7a2c" }],
  [/^sail$/, { k: "sail", c: "#efe9d8", c2: "#6a4c2e" }],
  [/^sail_h$/, { k: "sail_h", c: "#efe9d8", c2: "#6a4c2e" }],
  [/^millstone$/, { k: "disc", c: "#787a78" }],
  [/^sacks$/, { k: "sacks", c: "#cdbd98", c2: "#b9a57c" }],
  [/^basket_(\w+)$/, { k: "basket", c: "#a8823e", basketc: 1 }],
  [/^heap_(\w+)$/, { k: "heap", heapc: 1 }],
  [/^fire$/, { k: "small", c: "#ff8a2a", glow: 1 }],
  [/^path$/, { k: "slab", c: "#9c8c64", h: 0.12 }],
  [/^paving$/, { k: "slab", c: "#7c7a74", h: 0.14 }],
  [/^flagstone$/, { k: "cube", c: "#76746e", v: 0.05 }],
  [/^gate_leaf$/, { k: "gleaf", c: "#6d4c2f", c2: "#3a3f45" }],
  [/^gate_band$/, { k: "gband", c: "#6d4c2f", c2: "#3a3f45" }],
  [/^paving_dark$/, { k: "slab", c: "#66645f", h: 0.14 }],
  [/^soil_low$/, { k: "slab", c: "#55391f", h: 0.2 }],
  [/^water_low$/, { k: "slab", c: "#3b6fb6", h: 0.14, glass: 1 }],
  [/^sack$/, { k: "small", c: "#cdbd98" }],
  [/^crate$/, { k: "cube", c: "#9a7442", c2: "#84612f" }],
  [/^thatch$/, { k: "cube", c: "#ba8630", v: 0.12 }],
  [/^thatch_dark$/, { k: "cube", c: "#6e5428", v: 0.12 }],
  [/^daub$/, { k: "cube", c: "#ecd9a8", v: 0.04 }],
  [/^daub_dark$/, { k: "cube", c: "#d2bc88", v: 0.04 }],
  [/^window$/, { k: "pane", c: "#5c93b8", glass: 1 }],
  [/^apple_leaves$/, { k: "cube", c: "#4d7a2c" }],
  [/^plaster$/, { k: "cube", c: "#f4e9cf", v: 0.03 }],
  [/^plaster_dark$/, { k: "cube", c: "#dccfae", v: 0.03 }],
  [/^target$/, { k: "cube", c: "#e3d9c6", c2: "#c0392b" }],
  [/^pumpkin$/, { k: "small", c: "#d07a18" }],
  [/^melon$/, { k: "small", c: "#6f9a26" }],
  [/^beehive$/, { k: "cube", c: "#c9a14e", c2: "#a67c32" }],
  [/^composter$/, { k: "cube", c: "#7a5a34" }],
  [/^lectern$/, { k: "small", c: "#a58451" }],
  [/^ladder$/, { k: "sign", c: "#8a6a3a", full: 1 }],
  [/^scaffolding$/, { k: "fence", c: "#d9b56a" }],
  [/^cobweb$/, { k: "skip" }],
  [/^moss_block$/, { k: "cube", c: "#5b7030" }],
  [/^packed_mud$/, { k: "cube", c: "#8e6a4f" }],
  [/^calcite$/, { k: "cube", c: "#dcdcd6" }],
  [/^tuff$/, { k: "cube", c: "#6c6d66" }],
  [/^cracked_stone_bricks$/, { k: "cube", c: "#605e5a", v: 0.09 }],
  [/^mossy_stone_bricks$/, { k: "cube", c: "#5e6e52", v: 0.09 }],
  [/^mossy_cobblestone$/, { k: "cube", c: "#52684e", v: 0.1 }],
  [/^gravel$/, { k: "cube", c: "#857f7c" }],
  [/^coal_block$/, { k: "cube", c: "#191919" }],
  [/^copper_block$/, { k: "cube", c: "#c06a4a" }],
  [/^amethyst_block$/, { k: "cube", c: "#8a62c4" }],
  [/^chain$/, { k: "post", c: "#3a3f45", t: 0.1875 }],
  [/^lantern$|^soul_lantern$/, { k: "lamp", c: "#f2b94a", glow: 1 }],
  [/^campfire$|^soul_campfire$/, { k: "slab", c: "#c75b1b", glow: 1, h: 0.45 }],
  [/^anvil$|^chipped_anvil$|^damaged_anvil$/, { k: "anvil", c: "#35353a" }],
  [/^grindstone$/, { k: "small", c: "#8d8d8d" }],
  [/^cauldron$|^water_cauldron$|^lava_cauldron$/, { k: "cube", c: "#3d3d42" }],
  [/^barrel$/, { k: "cube", c: "#7a5a34", c2: "#6a4c2a" }],
  [/^blast_furnace$|^furnace$|^smoker$/, { k: "cube", c: "#5b5b5e" }],
  [/^smithing_table$/, { k: "cube", c: "#3c2f2a" }],
  [/^netherite_block$/, { k: "cube", c: "#403b3e" }],
  [/_cloth_stairs$/, { k: "stair", wool: 1 }],
  [/_cloth_slab$/, { k: "slab", wool: 1 }],
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
  [/^polished_andesite$/, { k: "cube", c: "#7e817f" }],
  [/^andesite$/, { k: "cube", c: "#6c6e6c", v: 0.08 }],
  [/^stone_bricks$/, { k: "cube", c: "#6a6862", v: 0.09 }],
  [/^stone$/, { k: "cube", c: "#686862", v: 0.08 }],
  [/^cobblestone$/, { k: "cube", c: "#62625e", v: 0.1 }],
  [/^bricks$|^brick$/, { k: "cube", c: "#954637", v: 0.1 }],
  [/^deepslate_tiles$/, { k: "cube", c: "#394058", v: 0.12 }],
  [/^deepslate_bricks$|^polished_deepslate$/, { k: "cube", c: "#3e4150", v: 0.1 }],
  [/^deepslate$/, { k: "cube", c: "#4c4c50" }],
  [/^white_wool$|^white_concrete$/, { k: "cube", c: "#e8e8e8" }],
  [/^yellow_concrete$/, { k: "cube", c: "#f0af15" }],
  [/^honeycomb_block$/, { k: "cube", c: "#e5a02a" }],
  [/^cyan_terracotta$/, { k: "cube", c: "#565b5b" }],
  [/^gray_glazed_terracotta$/, { k: "cube", c: "#53595d" }],
  [/^gold_block$/, { k: "cube", c: "#f2d23a" }],
  [/^iron_block$/, { k: "cube", c: "#d8d8d8" }],
  [/^soil$/, { k: "cube", c: "#55391f" }],
  [/^crop_(\w+)$/, { k: "rows", cropc: 1, c2: "#5a3c22" }],
  [/^water$/, { k: "slab", c: "#3b6fb6", h: 0.85, glass: 1 }],
  [/_leaves$/, { k: "cube", leaf: 1 }],
  [/_carpet$/, { k: "slab", wool: 1, h: 0.08 }],
  [/_wool$|_cloth$/, { k: "cube", wool: 1 }],
  [/^banner_(\w+)$/, { k: "flag", banner: 1 }],
  [/^bookshelf$/, { k: "cube", c: "#6b4f2d", c2: "#a58451" }],
  [/^crafting_table$/, { k: "cube", c: "#8a5a2b" }],
  [/^glowstone$|^sea_lantern$|^shroomlight$/, { k: "cube", c: "#f2c25a", glow: 1 }],
  [/^bell$/, { k: "bell", c: "#e0b640", c2: "#8a6a2a" }],
  [/^chest$|^trapped_chest$|^ender_chest$/, { k: "small", c: "#8a5a2b" }],
  [/^lava$/, { k: "cube", c: "#e8571c", glow: 1 }],
  [/^smooth_stone$|^stone_slab$/, { k: "cube", c: "#787876" }],
  [/^terracotta$|^orange_terracotta$/, { k: "cube", c: "#a1583a" }],
  [/^red_terracotta$|^red_nether_bricks$|^nether_bricks$/, { k: "cube", c: "#7d3a2e" }],
  [/^hay_block$/, { k: "cube", c: "#b89a2a" }],
  [/^(\w+)_terracotta$/, { k: "cube", terra: 1 }],
  [/^(\w+)_concrete$/, { k: "cube", wool: 1, conc: 1 }],
  [/^air$|^cave_air$|^void_air$/, { k: "air" }],
];

/* which pixel texture a block gets (a kind of rendering/blocks.js); first match wins, anything else is flat */
const TEX = [
  [/glass|^window$/, BKB.glass],
  [/^apple_leaves$/, BKB.fruit],
  [/^spruce_leaves$/, BK.pine],
  [/_leaves$|^moss_block$|^shrub|^ivy$/, BK.leaves],
  [/_door$/, "door"],
  [/_log$|_wood$/, "log"],
  [/^iron_bars$/, BKB.bars],
  [/^(lantern|soul_lantern|campfire|soul_campfire|fire|lava|glowstone|sea_lantern|shroomlight)$/, BKB.glow],
  [
    /^(iron|gold|copper|coal|netherite|amethyst)_block$|anvil$|^cauldron$|^chain$|^iron_trapdoor$|^bell$|^grindstone$/,
    BKB.metal,
  ],
  [/^barrel$/, BKB.barrel],
  [/^crate$|chest$/, BKB.crate],
  [/^target$/, BKB.target],
  [/^path$/, BK.path],
  [/^paving|^flagstone$/, BKB.flagstone],
  [/^water/, BKB.water],
  [/^soil/, BKB.farmland],
  [/^crop_/, BKB.crop],
  [/^thatch|^hay_block$/, BKB.thatch],
  [/_wool$|_carpet$|_cloth|^banner_|^sack|^sail/, BKB.wool],
  [/deepslate_tile|^red_tile|^blue_tile|^green_tile|^clay_tile|shingle|cut_copper/, BKB.tiles],
  [/stone_brick|deepslate_brick|blackstone_brick|prismarine_brick|furnace$|^smoker$/, BKB.stoneBricks],
  [/^cobblestone|^mossy_cobblestone/, BK.cobble],
  [/^bricks$|^brick_|nether_brick|^mud_brick/, BKB.bricks],
  [/^polished_|^smooth_stone|^stone_slab$|^quartz|^calcite$|^smithing_table$/, BKB.polished],
  [/^gravel$/, BK.gravel],
  [/^(stone|andesite|tuff|deepslate|cobbled_deepslate|blackstone|granite|diorite)(_stairs|_slab|_wall)?$/, BK.stone],
  [/^heap_|^headstone$|^millstone$/, BK.stone],
  [/^(sconce|brazier|anvil|shield_\w+)$/, BKB.metal],
  [
    /_planks$|_stairs$|_slab$|_fence$|_trapdoor$|_sign$|^ladder$|^scaffolding$|^lectern$|^composter$|^crafting_table$|^bookshelf$|^beehive$|^(table|stool|bench|stake|wheel|weapon_rack|hanging_sign|gate_leaf|gate_band)$/,
    BKB.planks,
  ],
];
function texOf(n, s) {
  for (const [re, k] of TEX)
    if (re.test(n)) {
      if (k === "log") return matOfKind(s.axis === "x" ? BKB.logX : s.axis === "z" ? BKB.logZ : BKB.logY);
      if (k === "door") return matOfKind(s.half === "upper" ? BKB.doorTop : BKB.doorLow);
      return matOfKind(k);
    }
  return matOfKind(BKB.flat);
}

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
export const TERRA = {
  white: "#d2b2a1",
  red: "#8f3d2e",
  orange: "#a1583a",
  yellow: "#ba8523",
  brown: "#4d3323",
  light_gray: "#876b62",
  gray: "#3a2a24",
  cyan: "#565b5b",
  blue: "#4a3c5b",
  green: "#4c532a",
  black: "#251610",
  pink: "#a14e4e",
};
export const FLOWER = {
  red: "#d8372b",
  yellow: "#f0cf3a",
  white: "#f1f1ea",
  blue: "#4a74e0",
  pink: "#ee8fc0",
  orange: "#f08a1c",
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
export const CROP = {
  wheat: "#d2a83a",
  green: "#4f8a2e",
  carrot: "#6aa02c",
  red: "#b83a2a",
  cabbage: "#7ab648",
  vine: "#3f7a2c",
};
const HEAP = { stone: "#62625e", coal: "#26262a", gold: "#e0b640", ore: "#8c7a6a", iron: "#b8bcc4", sand: "#d9cb98" };
const FAM = [
  [/^prismarine_brick/, "#5fa090"],
  [/^dark_prismarine/, "#2f5a4a"],
  [/^(oxidized_)?cut_copper|^weathered_cut_copper/, "#1c7667"],
  [/^copper/, "#b8693a"],
  [/^warped/, "#2a7a7a"],
  [/^red_nether_brick/, "#6a2a2a"],
  [/^nether_brick/, "#3a1c20"],
  [/^mud_brick/, "#8a6a4a"],
  [/^purpur/, "#a77ba7"],
  [/^red_sandstone/, "#b5622a"],
  [/^polished_blackstone|^blackstone/, "#24222c"],
  [/^(stripped_)?mangrove/, "#763630", "#7d3d36", "#54382a"],
  [/^(stripped_)?cherry/, "#e2b3ac", "#e6bcb5", "#3a2530"],
  [/^(stripped_)?crimson/, "#653147", "#6f3850", "#5a2a3e"],
  [/^granite|^polished_granite/, "#95674f"],
  [/^diorite|^polished_diorite/, "#bcbcbc"],
  [/^tuff/, "#6c6d66"],
  [/^thatch_dark/, "#6e5428"],
  [/^thatch/, "#ba8630"],
  [/^red_tile/, "#6d2620"],
  [/^clay_tile/, "#8b3c21"],
  [/^blue_tile/, "#2c4474"],
  [/^green_tile/, "#204c3d"],
  [/^dark_shingle/, "#35271e"],
  [/^shingle/, "#583a28"],
  [/^exposed_cut_copper/, "#a07a66"],
  [/^(stripped_)?spruce/, "#6d4c2f", "#85683d", "#533c28"],
  [/^(stripped_)?dark_oak/, "#4a3524", "#5a422c", "#423022"],
  [/^(stripped_)?oak/, "#b08a52", "#b09258", "#624a30"],
  [/^(stripped_)?birch/, "#d9c58a", "#d2c184", "#d8d4c4"],
  [/^(stripped_)?jungle/, "#a07350", "#ad8359", "#9a6e4a"],
  [/^(stripped_)?acacia/, "#a85a32", "#b0653c", "#a35630"],
  [/^deepslate_tile/, "#394058"],
  [/^deepslate_brick/, "#3e4150"],
  [/^polished_deepslate|^cobbled_deepslate|^deepslate/, "#4c4c50"],
  [/^polished_andesite/, "#7e817f"],
  [/^andesite/, "#6c6e6c"],
  [/^mossy_stone_brick/, "#5e6e52"],
  [/^stone_brick/, "#6a6862"],
  [/^mossy_cobblestone/, "#52684e"],
  [/^cobblestone/, "#62625e"],
  [/^brick/, "#954637"],
  [/^stone|^smooth_stone/, "#686862"],
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
  else if (r.wool) o.c = WOOL[n.replace(/_(wool|carpet|concrete|cloth|cloth_stairs|cloth_slab)$/, "")] || "#e8e8e8";
  else if (r.terra) o.c = TERRA[n.replace(/_terracotta$/, "")] || "#a1583a";
  else if (r.flowerc) o.c = FLOWER[n.slice(7)] || "#d8372b";
  else if (r.shieldc) o.c = WOOL[n.slice(7)] || "#a8322a";
  else if (r.heapc) o.c = HEAP[n.slice(5)] || "#7b7b78";
  else if (r.leaf) o.c = LEAF[n.replace(/_leaves$/, "")] || "#4d7a2c";
  else if (r.cropc) o.c = CROP[n.slice(5)] || "#cfb44e";
  else if (r.banner) o.c = WOOL[n.slice(7)] || "#a8322a";
  else o.c = r.c || (fam ? (r.log ? fam[2] || fam[1] : fam[1]) : "#7a7a7a");
  if (r.log) {
    /* a log shows its bark (or its stripped wood) on its sides and the cut wood on its ends; FAM lists planks, stripped wood, bark */
    const st = n.startsWith("stripped");
    if (fam) {
      o.c = st ? fam[2] || fam[1] : fam[3] || fam[2] || fam[1];
      o.c2 = st ? fam[1] : fam[2] || fam[1];
    } else o.c2 = o.c;
    if (s.axis) o.ax = s.axis;
  }
  if (r.c2) o.c2 = r.c2;
  if (r.boxc) o.c3 = FLOWER[n.slice(11)] || "#d8372b";
  if (r.potc) o.c3 = FLOWER[n.slice(4)] || "#d8372b";
  if (r.shrubc && n.length > 6) o.c3 = FLOWER[n.slice(6)] || "#f1f1ea";
  if (r.basketc) o.c2 = FLOWER[n.slice(7)] || "#d8372b";
  if (r.v) o.v = r.v;
  else if (/_tile|^thatch|shingle|cut_copper/.test(n)) o.v = 0.14;
  else if (/brick|cobble/.test(n)) o.v = 0.1;
  if (r.glow) o.glow = 1;
  if (r.glass) o.glass = 1;
  if (r.t) o.t = r.t;
  if (r.h) o.h = r.h;
  if (r.full) o.full = 1;
  for (const k of ["hanging", "facing", "half", "type", "shape", "open", "hinge", "east", "west", "north", "south"])
    if (s[k] !== undefined) o[k] = s[k];
  void base;
  o.m = texOf(n, s);
  return o;
}
