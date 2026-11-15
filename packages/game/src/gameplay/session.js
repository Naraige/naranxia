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
  bannerT: 0,
  bannerS: "",
  bannerS2: "",
  kills: 0,
  best: { w: 0, k: 0 },
  jrn: [],
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
/* ================= GAME LOGIC ================= */

export function initializeSessionPreferences() {
  try {
    sessionState.diffI = 0;
    sessionState.best = JSON.parse(localStorage.getItem("dk_best") || '{"w":0,"k":0}');
  } catch {
    /* Unavailable or invalid storage keeps the initialized session defaults. */
  }
}
