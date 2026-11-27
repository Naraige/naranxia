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
/* world size = how far from the castle the zombie lanes start (tiles): 0 Large is the whole world (the original rule, and what old saves and co-op messages without a size mean), 1 Medium, 2 Small.
   Only read when the lanes are laid out (world/routes.js); chosen in the settings, kept in localStorage dk_msize, sent by the co-op host, saved with the game. */
export const MAPD = [1e9, 380, 170];
export const mapSizeValid = (v) => (v === 1 || v === 2 ? v : 0);
export const worldSizePref = () => {
  try {
    return mapSizeValid(+localStorage.getItem("dk_msize"));
  } catch {
    return 0;
  }
};
export const setWorldSizePref = (v) => {
  try {
    localStorage.setItem("dk_msize", String(mapSizeValid(v)));
  } catch {
    /* Keep the default size when storage is unavailable. */
  }
};
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
