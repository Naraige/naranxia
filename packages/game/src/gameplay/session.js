export const sessionState = {
  UID: 0,
  SID: 0,
  CS2: null,
  SITE2: null,
  PKROT: 0,
  CROT: 0,
  started: false,
  inGame: false,
  showMap: false,
  spd: 1,
  paused: false,
  diffI: 1,
  mapSize: 0,
  bannerT: 0,
  bannerS: "",
  bannerS2: "",
  kills: 0,
  peace: 0 /* peaceful game (#93): no wave ever comes; no achievement, no best score. Chosen in the settings for the next solo game, saved */,
  best: { w: 0, k: 0 },
  jrn: [],
  /* the seasonal event of this game ("" for none), taken when it starts; sevPick: the one the co-op host sent, null in solo */
  sev: "",
  sevPick: null,
  clockT: 0,
  camSave: null,
  units: undefined,
  structs: undefined,
  res: undefined,
  fx: undefined,
  pt: undefined,
  over: undefined,
  time: undefined,
  waveT: undefined,
  waveI: 160,
  waveN: undefined,
  nextL: undefined,
  portals: [],
  queue: undefined,
  mode: undefined,
  last: undefined,
  CS: undefined,
  fdT: 0,
  fdDirty: true,
  ver: 0,
};

const DIFFS = [{ n: "Normal", zm: 1, tm: 1, g: 200, first: 600 }];
export const D_ = () => DIFFS[0];
/* world size: there is one size only, the whole island (the King, v101: "juste une grande taille"). The Medium and Small limits (1, 2) are kept
   for the saves made with them before: world/routes.js still reads them when such a save lays out its lanes. A new game is always 0. */
export const MAPD = [1e9, 380, 170];
export const worldSizePref = () => 0;
/* ================= GAME LOGIC ================= */

export function initializeSessionPreferences() {
  try {
    sessionState.diffI = 0;
    sessionState.mapSize = worldSizePref();
    sessionState.best = JSON.parse(localStorage.getItem("dk_best") || '{"w":0,"k":0}');
  } catch {
    /* Unavailable or invalid storage keeps the initialized session defaults. */
  }
}
