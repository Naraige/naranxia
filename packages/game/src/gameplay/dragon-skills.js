/* ---- levels, ranks, skill tree and looks of the dragon (Dragon role, #66) ----
   A module without imports: data and pure functions. The rider's progress (xp, renown, gold, bought skills, look) lives on his own machine
   (localStorage 'dk_dr_prog', see rendering/dragon-rider.js); what the simulation needs of it (level, skill counts, look) goes to both
   machines in the lockstep command 'dk' as whole numbers, so the burn, the fireball and the roar are the same on both. */

/* level from xp, and the xp a level starts at */
export const DR_MAXLV = 20;
export const drLvl = (xp) => Math.min(DR_MAXLV, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 40)));
export const drLvlXp = (l) => 40 * (l - 1) * (l - 1);
/* visual stage of the dragon: 0 wyrmling .. 5 legend */
export const DR_EVL = [1, 4, 8, 12, 16, 20];
export const drEv = (l) => (l >= 20 ? 5 : l >= 16 ? 4 : l >= 12 ? 3 : l >= 8 ? 2 : l >= 4 ? 1 : 0);
export const DR_STAGES = ["Wyrmling", "Drake", "Wyvern", "Elder Wyvern", "Ancient", "Legend"];
export const DR_EVS = [0.85, 0.95, 1.04, 1.12, 1.2, 1.28]; /* size of each stage */
/* renown ranks */
export const DR_RANKS = [
  [0, "Recruit"],
  [30, "Sentinel"],
  [100, "Sky Scout"],
  [250, "Wing Knight"],
  [500, "Warden of the Gate"],
  [900, "Dragon Knight"],
  [1500, "Dragonlord"],
  [2500, "Shield of Naranxia"],
  [4000, "King's Wing"],
];
export const drRank = (r) => {
  let i = 0;
  while (i + 1 < DR_RANKS.length && r >= DR_RANKS[i + 1][0]) i++;
  return i;
};

/* the three branches. Each skill: id, effect, name, text, gold, level needed, parent, column, row */
export const DR_TREE = [
  ["f1", "fire", "Searing Breath", "+30% breath damage", 30, 1, "", 0, 0],
  ["f2", "fire", "Searing Breath II", "+30% breath damage", 80, 3, "f1", 0, 1],
  ["b1", "ball", "Fireball", "Key E: an explosive shot", 150, 5, "f2", 0, 2],
  ["f3", "fire", "Searing Breath III", "+30% breath damage", 260, 8, "b1", 0, 3],
  ["b2", "ball", "Meteor", "Fireball: wider blast, +35% damage", 420, 11, "f3", 0, 4],
  ["f4", "fire", "Inferno", "+30% breath damage", 700, 15, "b2", 0, 5],
  ["l1", "lungs", "Forge Lungs", "Heat builds slower and cools faster", 40, 2, "f1", 1, 1],
  ["l2", "lungs", "Forge Lungs II", "Heat builds slower and cools faster", 160, 6, "l1", 1, 2],
  ["l3", "lungs", "Forge Lungs III", "Heat builds slower and cools faster", 340, 10, "l2", 1, 3],
  ["b3", "ball", "Cataclysm", "Fireball: wider blast, +35% damage", 600, 13, "l3", 1, 4],
  ["w1", "wings", "Mighty Wings", "+8% speed, turning and stamina", 30, 1, "", 2, 0],
  ["w2", "wings", "Mighty Wings II", "+8% speed, turning and stamina", 100, 4, "w1", 2, 1],
  ["g1", "grow", "Growth", "The dragon grows 6% larger", 200, 6, "w2", 2, 2],
  ["w3", "wings", "Mighty Wings III", "+8% speed, turning and stamina", 300, 9, "g1", 2, 3],
  ["g2", "grow", "Growth II", "The dragon grows 6% larger", 450, 12, "w3", 2, 4],
  ["g3", "grow", "Titan", "The dragon grows 6% larger", 800, 16, "g2", 2, 5],
  ["r1", "roar", "Roar", "Key R: slows the horde around the dragon", 90, 3, "w1", 3, 1],
  ["r2", "roar", "Thunder Roar", "The roar slows the horde 1 s longer", 220, 7, "r1", 3, 2],
  ["r3", "roar", "Dread Roar", "The roar slows the horde 1 s longer", 480, 13, "r2", 3, 3],
  ["k1", "wide", "Wide Flame", "+10% breath radius", 30, 1, "", 4, 0],
  ["k2", "wide", "Wide Flame II", "+10% breath radius", 100, 4, "k1", 4, 1],
  ["k3", "wide", "Wide Flame III", "+10% breath radius", 240, 8, "k2", 4, 2],
  ["k4", "wide", "Wide Flame IV", "+10% breath radius", 400, 12, "k3", 4, 3],
  ["k5", "wide", "Wide Flame V", "+10% breath radius", 750, 17, "k4", 4, 4],
  ["t1", "gold", "Tribute", "+15% gold earned", 60, 2, "k1", 5, 1],
  ["x1", "bond", "Rider Bond", "+10% dragon XP", 140, 5, "t1", 5, 2],
  ["t2", "gold", "Royal Tribute", "+15% gold earned", 300, 9, "x1", 5, 3],
  ["x2", "bond", "Old Bond", "+10% dragon XP", 500, 14, "t2", 5, 4],
];
export const DR_BRANCH = ["Flame", "Sky", "Bastion"];
export const DR_BYID = {};
for (const n of DR_TREE) DR_BYID[n[0]] = n;
/* the effects, in the order of the 'dk' command's list */
export const DR_FX = ["fire", "lungs", "wings", "ball", "roar", "grow", "wide", "gold", "bond"];

/* how many skills of each effect an owned set holds: the list the command carries */
export function drCounts(own) {
  const u = DR_FX.map(() => 0);
  for (const n of DR_TREE) if (own[n[0]]) u[DR_FX.indexOf(n[1])]++;
  return u;
}
/* 2 owned, 1 can be bought (parent owned, level reached), 0 locked */
export const drNodeState = (n, own, lv) => (own[n[0]] ? 2 : (!n[6] || own[n[6]]) && lv >= n[5] ? 1 : 0);

/* what the counts do */
export const drFire = (u, lv) => (1 + 0.3 * u[0]) * (1 + 0.04 * (lv - 1)); /* breath damage */
export const drRad = (u) => 1 + 0.1 * u[6]; /* breath radius */
export const drBallDmg = (u) => 150 * (1 + 0.35 * (u[3] - 1)); /* fireball damage, with the skills 1..3 */
export const drBallRad = (u) => 6.5 + u[3]; /* fireball blast, in tiles */
export const drRoarT = (u) => 3 + u[4]; /* seconds of slowing */

/* looks: a body palette, and the colour of the flame */
export const DR_LOOKS = [
  ["Ash", {}],
  ["Ember", { body: "#b8402e", belly: "#e0b43a", wing: "#8a2a3c", horns: 2, crest: 1, tail: 0, frill: 1 }],
  [
    "Frost",
    {
      body: "#e4dfcf",
      belly: "#9fb8c8",
      wing: "#2f86b0",
      accent: "#2f86b0",
      crestC: "#2f86b0",
      eye: "#7df9ff",
      flame: "#9fe8ff",
      horns: 5,
      crest: 4,
      frill: 2,
      tail: 4,
      pattern: 0,
    },
  ],
  [
    "Jade",
    {
      body: "#2f8a6a",
      belly: "#e4dfcf",
      wing: "#5f7a45",
      crestC: "#e0b43a",
      eye: "#9dff5a",
      flame: "#5be37a",
      horns: 3,
      crest: 2,
      tail: 1,
      skin: 1,
      build: 2,
    },
  ],
  [
    "Night",
    {
      body: "#2c2c36",
      belly: "#34498f",
      wing: "#34498f",
      accent: "#7a4fb0",
      crestC: "#7a4fb0",
      eye: "#c77dff",
      flame: "#8a5cff",
      horns: 6,
      crest: 1,
      frill: 1,
      pattern: 3,
      build: 0,
    },
  ],
  [
    "Royal",
    {
      body: "#6e5a3a",
      belly: "#e0b43a",
      wing: "#34498f",
      crestC: "#e0b43a",
      horns: 4,
      crest: 2,
      armor: 3,
      saddle: 1,
      limbs: 1,
      pattern: 0,
    },
  ],
];
/* the flame colours the rider can pick (index 0 keeps the look's own) */
export const DR_FLAMES = [null, "#ff8a1f", "#9fe8ff", "#5be37a", "#8a5cff", "#ff4a6a", "#ffe46a"];
