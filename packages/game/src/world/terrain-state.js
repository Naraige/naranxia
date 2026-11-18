import { TH, TW } from "../gameplay/rules.js";

export const terrainState = {
  CX: undefined,
  CY: undefined,
  GORD: [],
  GI: 0,
  genN: 0,
  SEED: 0,
  GPR: {},
  ROUTES: [],
  RCH: new Map(),
  gateSolid: true,
  FP: null,
};

export const CH = 32;
export let NCX;
export let NCY;

export const LAND = 12,
  BED = 7,
  WLV = LAND - 0.08,
  ROCKH = LAND + 11,
  SNOW = LAND + 21;

export let HT;
export let ter;
export let amt;
export let pth;
export let FLG;
export let genF;

/* tile -> structure. OCCB mirrors the keys (1 = a structure stands there) so the hot solid() tests of the swarm skip the Map lookup on free tiles */
export const OCCB = new Uint8Array(TW * TH);
class OccMap extends Map {
  set(k, v) {
    OCCB[k] = 1;
    return super.set(k, v);
  }
  delete(k) {
    OCCB[k] = 0;
    return super.delete(k);
  }
  clear() {
    OCCB.fill(0);
    super.clear();
  }
}
export const occ = new OccMap();
export const stairs = new Map();
export const CAMPS = new Map();
export const RUINS = new Map();
export let TFL;

export let mc;
export let mg;
export let RAWD;
export let smDone;
export let SEALD;

export function setTerrainGridState(
  ncx,
  ncy,
  height,
  terrain,
  amount,
  paths,
  flags,
  generated,
  terraform,
  canvas,
  context,
) {
  NCX = ncx;
  NCY = ncy;
  HT = height;
  ter = terrain;
  amt = amount;
  pth = paths;
  FLG = flags;
  genF = generated;
  TFL = terraform;
  mc = canvas;
  mg = context;
}

export function setTerrainCacheState(raw, done, sealed) {
  RAWD = raw;
  smDone = done;
  SEALD = sealed;
}
