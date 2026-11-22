import { hex } from "../core/math.js";

export const PAL = [
  ["Azure", "#3f6fd0", "#8ab4ff"],
  ["Crimson", "#c8353a", "#ff9a8a"],
  ["Emerald", "#2f9a55", "#8be0a8"],
  ["Amber", "#d9a020", "#ffe08a"],
  ["Violet", "#7a48c8", "#c8a8ff"],
  ["Teal", "#1f9aa8", "#8ae8f0"],
  ["Ember", "#e0702a", "#ffc08a"],
  ["Night", "#3a3f4c", "#c4cad8"],
  ["Rose", "#d0507e", "#ffb0cc"],
  ["Forest", "#2c6a34", "#9ad49a"],
  ["Gold", "#c9a227", "#fff0a0"],
  ["Ivory", "#d8cfb8", "#fffaf0"],
  ["Sky", "#4aa8e0", "#c0e8ff"],
  ["Wine", "#7a2338", "#e08aa0"],
];

export const KNAMES = [
  "Ashvale",
  "Brightmoor",
  "Crowhold",
  "Dunhaven",
  "Eldermere",
  "Frostmark",
  "Goldcrest",
  "Highwatch",
  "Ironvale",
  "Oakenshield",
  "Stormreach",
  "Whitecliff",
  "Redmere",
  "Silverfen",
];

export let THEME;

export const thp = () => PAL[THEME.c][1],
  ths = () => PAL[THEME.c][2],
  thd = () => {
    const h = hex(PAL[THEME.c][1]);
    return (
      "#" +
      h
        .map((v) =>
          Math.round(v * 0.72)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  };

/* The kingdom: its name, its colour c and second colour c2 (PAL), and the pattern p of its banner (the 16 of rendering/banner-art.js PATS).
   A banner is made of patterns only: the emblem a kingdom once carried on it (e in older saved themes) is gone. v marks a theme saved since:
   an older one that showed the cross emblem on a plain field becomes the cross pattern, the banner it always had */
export function initializeKingdomTheme() {
  THEME = { n: KNAMES[(Math.random() * KNAMES.length) | 0], c: 0, c2: 10, p: 8, v: 2 };

  try {
    const t = JSON.parse(localStorage.getItem("dk_theme") || "null");
    if (t && typeof t.n === "string")
      THEME = {
        n: t.n.slice(0, 18),
        c: Math.abs(t.c | 0) % PAL.length,
        c2: t.c2 == null ? 10 : Math.abs(t.c2 | 0) % PAL.length,
        p: t.v !== 2 && !(t.p | 0) && !(t.e | 0) ? 8 : Math.abs(t.p | 0) % 16,
        v: 2,
      };
  } catch {
    /* Malformed or unavailable storage leaves the default kingdom theme. */
  }
}
