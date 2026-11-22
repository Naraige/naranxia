import { FCELL, lampWall, ROTT, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { home } from "./camera.js";
import { addBox, newG, rgb, toGeo } from "./geometry.js";
import { drawBanner } from "./kingdom-banner.js";
import { matV } from "./materials.js";
import { icons3D } from "./model-icons.js";
import { bannerGeo } from "./models/banner.js";
import { VOXB } from "./models/voxel-buildings.js";
import { BARRACKS_BANNERS, CASTLE_BANNERS, CASTLE_FLAG, WARROOM_BANNERS } from "./models/builds/military.js";
import { footing, FORT_H, wallLamp } from "./models/builds/walls.js";
import { gtopOf } from "./models/fortifications.js";
import {
  ballBolt,
  ballHead,
  CONNT,
  GEO,
  leafGeo,
  portcGeo,
  sGeo,
  structureModelsState,
  trebArm,
  trebBase,
  trebCW,
  wallLookOf,
} from "./models/structures.js";
import { UM } from "./models/unit-parts.js";
import { buildRoutes } from "./routes.js";
import { CAM, camera, scene, SHADOWS } from "./scene.js";
import { CHK, dirtyP, dirtyT, dropChunk, loadChunk, RM, unitG } from "./terrain.js";
import { THREE } from "./three.js";
import { titleSceneState } from "./title-scene.js";
import { voxelGeo } from "./voxel-model.js";
import { cv, cvs } from "../ui/canvases.js";
import { thIcons } from "../ui/icons.js";
import { THEME, thp } from "../ui/kingdom-theme.js";
import { D8 } from "../world/routes.js";
import { CH, HT, LAND, occ, ter } from "../world/terrain-state.js";

export const structuresState = {
  BPLOFF: false,
};

const structO = new Set();
const stairO = new Set();

/* the picture of the banner of the kingdom (kingdom-banner.js drawBanner paints it) */
export let BANNER;
/* hangs a banner of the kingdom (models/banner.js: a crossbar, a cloth of 20 x 40 pixels) on g: the middle of its crossbar at x, y, z, the cloth
   facing ry, k blocks to 16 pixels; both: painted on its back too. Against a wall the crossbar sits a pixel and a half out. The cloth swings
   about its crossbar: rendering/frame.js turns the banners listed in userData.bn */
const hang = (g, x, y, z, ry, k, both) => {
  if (structuresState.BPLOFF) return null;
  const key = "banner" + k + (both ? "b" : ""),
    m = new THREE.Mesh(GEO[key] || (GEO[key] = bannerGeo(THEME, k, both)), matV);
  m.position.set(x, y, z);
  m.rotation.order = "YXZ";
  m.rotation.y = ry || 0;
  /* a banner against a wall takes the shadows of the wall but throws none (one draw less per banner in the shadow pass) */
  m.castShadow = both ? SHADOWS : false;
  m.receiveShadow = SHADOWS;
  g.add(m);
  (g.userData.bn || (g.userData.bn = [])).push(m);
  return m;
};
/* how far the crossbar of a banner of one block to 16 pixels sits from the wall it hangs on (its half thickness and half a pixel of air) */
const WALLBN = 1.5 / 16;
/* the block buildings that fly the banners of the kingdom on a wall looking south: [x, y of the crossbar, z of the wall, blocks to 16 pixels] */
const WALLBNS = { castle: CASTLE_BANNERS, barracks: BARRACKS_BANNERS, warroom: WARROOM_BANNERS };

export function retheme() {
  structureModelsState.BLU = thp();
  for (const k in GEO) delete GEO[k];
  for (const k in UM) delete UM[k];
  thIcons();
  icons3D();
  drawBanner();
  for (const s of sessionState.structs) if (s.o3) buildStructMesh(s);
  for (const [, g] of unitG) {
    scene.remove(g);
  }
  unitG.clear();
  for (const u of sessionState.units) u.m = null;
  titleSceneState.titleDirty = true;
}

export let buildStructMesh = function buildStructMesh(s) {
  structuresState.BPLOFF = s.t === 2;
  try {
    buildStructMesh0(s);
  } finally {
    structuresState.BPLOFF = false;
  }
};

export function buildStructMesh0(s) {
  const g = s.o3;
  while (g.children.length) g.remove(g.children[0]);
  let b = 0;
  s.head = null;
  s.arm = null;
  s.bolt = null;
  s.tpv = null;
  /* a fortification stands on its highest land (a wall piece may reach over the water of a shore) */
  const fort = s.type === "wall" || s.type === "tower" || s.type === "keep" || s.type === "gate";
  for (const [i, j] of s.tiles) if (!(fort && ter[j * TW + i] === 1)) b = Math.max(b, HT[j * TW + i]);
  /* (the preview of a piece that would stand in open water floats on it) */
  if (fort && !b) b = LAND;
  s.bh = b;
  g.userData.mh = 0;
  g.userData.lamp = null;
  g.userData.bn = null;
  const m = s.type === "wall" ? wallLookOf(s) + (lampWall(s) ? "L" : "") : 0,
    mesh = new THREE.Mesh(sGeo(s, m), matV);
  mesh.castShadow = SHADOWS;
  mesh.receiveShadow = SHADOWS;
  g.add(mesh);
  if (s.type === "gate") {
    g.position.set(s.x / TS, b, s.y / TS);
    g.rotation.y = s.ax ? Math.PI / 2 : 0;
  } else if (s.sz === 1) {
    g.position.set(s.tx + 0.5, b, s.ty + 0.5);
    g.rotation.y = ROTT.has(s.type) && !s.weapon ? ((s.rot | 0) * Math.PI) / 2 : 0;
  } else g.position.set(s.tx, b, s.ty);
  s.door = null;
  s.flag = null;
  if (fort)
    g.userData.mh =
      s.type === "gate"
        ? s.gl === 3
          ? FORT_H.gate3
          : FORT_H.gate
        : s.type === "tower"
          ? s.sz > FCELL
            ? FORT_H.tower
            : FORT_H.tower1
          : FORT_H[s.type];
  if (s.type === "wall") {
    /* a wall follows the ground as it is: where it falls away under the piece its footing shows (one course below the water on a shore) */
    const dr = new Array(FCELL * FCELL).fill(0),
      t = s.tier === 0 ? 0 : 1;
    let any = false;
    for (const [i, j] of s.tiles) {
      const q = j * TW + i,
        d = Math.min(12, ter[q] === 1 ? b - LAND + 2 : b - HT[q]);
      if (d > 0) {
        dr[(j - s.ty) * FCELL + i - s.tx] = d;
        any = true;
      }
    }
    if (any) {
      const k = "ft" + t + dr.join(".");
      let fg = GEO[k];
      if (!fg) {
        const F = footing(t, FCELL, FCELL, dr);
        fg = GEO[k] = voxelGeo(F.M, { ox: 0, oz: 0, k: 1 });
        fg.userData.D = F.D;
      }
      const fm = new THREE.Mesh(fg, matV);
      fm.position.y = -fg.userData.D;
      fm.castShadow = SHADOWS;
      fm.receiveShadow = SHADOWS;
      g.add(fm);
    }
    const lk = m.length > FCELL * FCELL ? wallLamp(m) : null;
    if (lk) g.userData.lamp = [s.tx + lk[0] + 0.5, s.ty + lk[1] + 0.5, b + (t ? 7.75 : 6.75)];
  }
  if (s.type === "gate") {
    /* the banner of the kingdom on both faces of each end (a tower of one cell, or a post two blocks wide), and the doors: two leaves that swing
       in timber, a portcullis that lifts in stone */
    const bx = s.gl === 3 ? 4 : 3,
      by = s.gl === 3 ? 9.6 : 8.4,
      bk = s.gl === 3 ? 1.4 : 1,
      bz = 2 + WALLBN * bk;
    for (const x of [-bx, bx]) {
      hang(g, x, by, bz, 0, bk);
      hang(g, x, by, -bz, Math.PI, bk);
    }
    const d = new THREE.Group();
    if (s.tier === 0)
      d.userData.lv = [-1, 1].map((sd) => {
        const pv = new THREE.Group(),
          lm = new THREE.Mesh(leafGeo(sd), matV);
        pv.position.x = sd * 2;
        lm.castShadow = SHADOWS;
        pv.add(lm);
        d.add(pv);
        return pv;
      });
    else {
      /* hung from the head of the passage: it is drawn up by flattening it there (frame.js) */
      const pm = new THREE.Mesh(portcGeo(), matV);
      pm.position.y = -4;
      pm.castShadow = SHADOWS;
      d.position.y = 4;
      d.add(pm);
    }
    g.add(d);
    s.door = d;
    s.dop = s.dop || 0;
  }
  if (s.type === "ballista") {
    const h = new THREE.Mesh(GEO.bh || (GEO.bh = ballHead()), matV);
    h.position.set(0, 0.6, 0);
    h.castShadow = SHADOWS;
    g.add(h);
    s.head = h;
    h.rotation.y = s.aim || 0;
    const bo = new THREE.Mesh(GEO.bbo || (GEO.bbo = ballBolt()), matV);
    h.add(bo);
    s.bolt = bo;
  }
  if (s.type === "trebuchet") {
    const a = new THREE.Mesh(GEO.ta || (GEO.ta = trebArm()), matV);
    a.position.set(1, 1.78, 1);
    a.castShadow = SHADOWS;
    g.add(a);
    s.arm = a;
    a.rotation.y = s.aim || 0;
    const cw = new THREE.Mesh(GEO.tcw || (GEO.tcw = trebCW()), matV);
    cw.position.set(0, 0, -0.86);
    cw.castShadow = SHADOWS;
    a.add(cw);
    s.cw = cw;
    a.rotation.order = "YXZ";
    {
      const P = new THREE.Group();
      P.position.set(1, 0, 1);
      g.add(P);
      mesh.position.set(-1, 0, -1);
      a.position.set(0, 1.78, 0);
      P.add(mesh);
      P.add(a);
      s.tpv = P;
      P.rotation.y = s.aim || 0;
      a.rotation.y = 0;
    }
  }
  /* the engine of a tower stands in the middle of its fighting top, sized to it (the models are two tiles wide) */
  const big = s.sz > FCELL,
    tc = s.sz / 2;
  if (s.type === "tower" && s.weapon === "ballista") {
    /* the head turns and recoils about its own origin (frame.js): it hangs in a group that puts that origin on the middle of the top */
    const h = new THREE.Mesh(GEO.bh || (GEO.bh = ballHead()), matV),
      k = big ? 3 : 1.7,
      hp = new THREE.Group();
    hp.scale.setScalar(k);
    hp.position.set(tc, gtopOf(s) + 0.32 * k, tc);
    h.castShadow = SHADOWS;
    hp.add(h);
    g.add(hp);
    s.head = h;
    h.rotation.y = s.aim || 0;
    const bo = new THREE.Mesh(GEO.bbo || (GEO.bbo = ballBolt()), matV);
    h.add(bo);
    s.bolt = bo;
  }
  if (s.type === "tower" && s.weapon === "trebuchet") {
    const wg = new THREE.Group(),
      k = big ? 2.4 : 1.3;
    wg.scale.setScalar(k);
    wg.position.set(tc - k, gtopOf(s), tc - k);
    const b2 = new THREE.Mesh(GEO.tb || (GEO.tb = trebBase()), matV);
    b2.castShadow = SHADOWS;
    wg.add(b2);
    const a = new THREE.Mesh(GEO.ta || (GEO.ta = trebArm()), matV);
    a.position.set(1, 1.78, 1);
    a.rotation.order = "YXZ";
    a.castShadow = SHADOWS;
    wg.add(a);
    const cw = new THREE.Mesh(GEO.tcw || (GEO.tcw = trebCW()), matV);
    cw.position.set(0, 0, -0.86);
    a.add(cw);
    g.add(wg);
    s.arm = a;
    s.cw = cw;
    {
      const P = new THREE.Group();
      P.position.set(1, 0, 1);
      wg.add(P);
      b2.position.set(-1, 0, -1);
      a.position.set(0, 1.78, 0);
      P.add(b2);
      P.add(a);
      s.tpv = P;
      P.rotation.y = s.aim || 0;
      a.rotation.y = 0;
    }
  }
  if (s.type === "tower" || s.type === "keep") {
    /* the banner of the kingdom down each face of the shaft (one block in from the foot of a great tower), between its two slits */
    const k = big ? 1.5 : 1,
      f = (big ? 1 : 0) - WALLBN * k,
      y = big ? (s.type === "keep" ? 12.9 : 8.9) : 6.9;
    [
      [tc, s.sz - f, 0],
      [tc, f, Math.PI],
      [s.sz - f, tc, Math.PI / 2],
      [f, tc, -Math.PI / 2],
    ].forEach(([x, z, r]) => hang(g, x, y, z, r, k));
  }
  if (s.type === "castle" && VOXB.castle) {
    /* the standard of the kingdom on the pole of the keep roof: it hangs from a crossbar in front of the pole and turns with the wind */
    const fg = new THREE.Group();
    fg.position.set(CASTLE_FLAG.x, CASTLE_FLAG.y, CASTLE_FLAG.z);
    hang(fg, 0, -0.15, 0.2, 0, 1.8, true);
    g.userData.bn = fg.userData.bn;
    g.add(fg);
    s.flag = fg;
  }
  /* the banners on the walls of the castle (over its gate, down the face of its keep), of the barracks and of the war room */
  if (WALLBNS[s.type] && VOXB[s.type]) for (const [x, y, z, k] of WALLBNS[s.type]) hang(g, x, y, z + WALLBN * k, 0, k);
  if (s.sz >= 2 && s.type !== "gate") {
    const sz = s.sz,
      inner = new THREE.Group();
    while (g.children.length) inner.add(g.children[0]);
    inner.position.set(-sz / 2, 0, -sz / 2);
    g.add(inner);
    g.position.set(s.tx + sz / 2, b, s.ty + sz / 2);
    g.rotation.y = ((ROTT.has(s.type) && !s.hm ? s.rot | 0 : 0) * Math.PI) / 2;
  }
}

let _rcS;
let _v2S;

export function pickStruct(p) {
  try {
    _v2S.set((p.x / cv.width) * 2 - 1, 1 - (p.y / cv.height) * 2);
    _rcS.setFromCamera(_v2S, camera);
    const L = [],
      M = new Map();
    for (const s of sessionState.structs) {
      if (!s.o3 || s.hp <= 0) continue;
      s.o3.traverse((o) => {
        if (o.isMesh && o.visible) {
          L.push(o);
          M.set(o, s);
        }
      });
    }
    const h = _rcS.intersectObjects(L, false);
    return h.length ? M.get(h[0].object) : null;
  } catch {
    return null;
  }
}

export let addStruct = function addStruct(s) {
  const g = new THREE.Group();
  s.o3 = g;
  structO.add(g);
  buildStructMesh(s);
  scene.add(g);
};

export function rmStruct(s) {
  if (s.o3) {
    scene.remove(s.o3);
    structO.delete(s.o3);
    s.o3 = null;
  }
}

export function refreshNear(s) {
  const seen = new Set(),
    rw = s.type === "wall" || s.type === "gate" || s.type === "tower" || s.type === "keep";
  for (const [tx, ty] of s.tiles)
    for (const [dx, dy] of D8) {
      const o = occ.get((ty + dy) * TW + tx + dx);
      if (
        o &&
        o !== s &&
        o.o3 &&
        /* a wall piece is drawn by what stands around it: its parapet opens where another fortification joins it */
        ((o.type === "wall" && rw) ||
          (o.type === s.type &&
            (dx === 0 || dy === 0) &&
            (o.type === "house" || o.type === "farm" || CONNT.has(o.type)))) &&
        !seen.has(o)
      ) {
        seen.add(o);
        buildStructMesh(o);
      }
    }
  if (s.o3 && s.hp > 0) buildStructMesh(s);
}

export let addStairs = function addStairs(i, si) {
  const tx = i % TW,
    ty = (i / TW) | 0,
    df = si.hi - si.lo,
    n = df,
    G = newG();
  for (let k = 0; k < n; k++) {
    const u0 = k / n,
      u1 = (k + 1) / n,
      a = si.sg > 0 ? u0 : 1 - u1,
      b = si.sg > 0 ? u1 : 1 - u0,
      h = ((k + 1) * df) / n,
      c = rgb(k % 2 ? "#a8a9b4" : "#8f909c");
    if (si.ax === 0) addBox(G, a, 0, 0, b, h, 1, c);
    else addBox(G, 0, 0, a, 1, h, b, c);
  }
  const m = new THREE.Mesh(toGeo(G), matV);
  m.position.set(tx, si.lo, ty);
  m.castShadow = SHADOWS;
  m.receiveShadow = SHADOWS;
  scene.add(m);
  stairO.add(m);
};

export let build3D = function build3D() {
  for (const k of [...CHK.keys()]) dropChunk(k);
  dirtyT.clear();
  dirtyP.clear();
  for (const g of structO) scene.remove(g);
  structO.clear();
  for (const m of stairO) {
    scene.remove(m);
    m.geometry.dispose();
  }
  stairO.clear();
  for (const [, g] of unitG) scene.remove(g);
  unitG.clear();
  for (const s of sessionState.structs) addStruct(s);
  buildRoutes();
  home();
  const cx0 = (CAM.x / CH) | 0,
    cy0 = (CAM.z / CH) | 0;
  for (let j = -RM; j <= RM; j++) for (let i = -RM; i <= RM; i++) loadChunk(cx0 + i, cy0 + j);
};

export function setAddStructHandler(handler) {
  addStruct = handler;
}

export function setBuildStructMeshHandler(handler) {
  buildStructMesh = handler;
}

export function setBuild3DHandler(handler) {
  build3D = handler;
}

export function setAddStairsHandler(handler) {
  addStairs = handler;
}

export function initializeStructures() {
  // Preserve Three.js allocation order and UUID random draws.
  new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  BANNER = cvs(128, 192);
  /* (the banners were textured planes once: their texture and material are still allocated here, for the same reason) */
  new THREE.CanvasTexture(BANNER);
  new THREE.MeshBasicMaterial();
  _rcS = new THREE.Raycaster();
  _v2S = new THREE.Vector2();
}
