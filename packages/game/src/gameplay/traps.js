import { snd } from "../audio/sound.js";
import { dist } from "../core/math.js";
import { REALR } from "../core/random.js";
import { valid } from "./construction.js";
import { ok, pay } from "./economy.js";
import { LPL, playersState } from "./players.js";
import { RS2, TS, TW } from "./rules.js";
import { sessionState } from "./session.js";
import { ugNear, UGU } from "./spatial-index.js";
import { SW, swSplash } from "./swarm.js";
import { wavesState } from "./waves.js";
import { objectivesState, SPK } from "../multiplayer/objectives.js";
import { MP } from "../multiplayer/session.js";
import { puff } from "../rendering/effects.js";
import { scene } from "../rendering/scene.js";
import { gh } from "../world/terrain-queries.js";
import { THREE } from "../rendering/three.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { IC } from "../ui/icons.js";
import { gOK } from "../world/routes.js";
import { occ, ter } from "../world/terrain-state.js";

/* tile -> hp */
/* ================= SPIKE TRAPS AND BOILING OIL (#9) =================
   Spike trap (Defense menu, 10 gold + 15 wood): one tile, passable, zombies standing on it are hurt every 0.5 s until the trap breaks.
   Boiling oil (Academy research after Bastion walls): every finished wall, gate and tower scalds zombies within 1.3 tiles every 1.5 s.
   Both are simulation (timers in sim time, damage through the same lists the bombers use), traps are a Map tile -> hp saved with the game (SAVA). */
const SPKC = { g: 10, w: 15 };

export function placeSpike(tx, ty) {
  if (sessionState.over) return;
  const i = ty * TW + tx;
  if (!gOK(tx, ty) || !valid(tx, ty) || ter[i] === 1 || SPK.has(i) || occ.has(i)) {
    if (!MP.on || playersState.CURPL === LPL()) {
      hudDisplayState.msgS = "Cannot place a trap here";
      hudDisplayState.msgT = 2;
      snd("err");
    }
    return;
  }
  if (!ok(SPKC)) {
    if (!MP.on || playersState.CURPL === LPL()) {
      hudDisplayState.msgS = "Not enough resources";
      hudDisplayState.msgT = 2;
      snd("err");
    }
    return;
  }
  pay(SPKC);
  SPK.set(i, 120);
  objectivesState.SPKV++;
  snd("build", (tx + 0.5) * TS, (ty + 0.5) * TS);
  puff((tx + 0.5) * TS, (ty + 0.5) * TS, "#8a7058", 6, 40, { T: 0.5, z: 0.1, vz: 0.8, g: 2, s: 0.1 });
}

/* Periodic ticks are decided from sessionState.time alone (like ruins): module-level accumulators were outside SAVA and reset(),
   so each co-op machine (and every resync or load) started at a different phase. true when a multiple of `per` was crossed this tick. */
function edge(dt, per) {
  return Math.floor(sessionState.time / per) !== Math.floor((sessionState.time - dt) / per);
}

export function trapTick(dt) {
  if (SPK.size) {
    if (edge(dt, 0.5)) {
      const dm = (14 + 0.5 * sessionState.waveN) * 0.5,
        dead = [];
      for (const [i, hp] of SPK) {
        const x = ((i % TW) + 0.5) * TS,
          y = (((i / TW) | 0) + 0.5) * TS;
        let n = 0;
        const Q = ugNear(1, x, y, TS * 0.62);
        for (let q = 0; q < Q.length; q++) {
          const z = UGU[Q[q]];
          if (z.t === 1 && z.hp > 0 && dist(z.x, z.y, x, y) < TS * 0.62) {
            z.hp -= dm;
            z.hurt = 0.25;
            n++;
          }
        }
        n += swSplash(x, y, TS * 0.6, dm, 40) || 0;
        if (n) {
          puff(x, y, "#c8ccd4", 3, 30, { T: 0.3, z: 0.2, vz: 1, g: -0.4, s: 0.08 });
          const nh = hp - n * 7;
          if (nh <= 0) dead.push(i);
          else SPK.set(i, nh);
        }
      }
      if (dead.length) {
        for (const i of dead) SPK.delete(i);
        objectivesState.SPKV++;
      }
    }
  }
  if (RS2.done.oil && (wavesState.waveOn || SW.n)) {
    if (edge(dt, 0.25)) {
      const dm = 12 + 0.5 * sessionState.waveN;
      for (const s of sessionState.structs) {
        if (s.t !== 0 || s.prog < 1 || s.hp <= 0 || !(s.type === "wall" || s.type === "gate" || s.type === "tower"))
          continue;
        if ((s.ot || 0) > sessionState.time) continue;
        s.ot = sessionState.time + 1.5 + ((s.sid | 0) % 8) * 0.04;
        const Q = ugNear(1, s.x, s.y, TS * 1.3);
        let n = 0;
        for (let q = 0; q < Q.length; q++) {
          const z = UGU[Q[q]];
          if (z.t === 1 && z.hp > 0 && dist(z.x, z.y, s.x, s.y) < TS * 1.3 + (s.rad || 0)) {
            z.hp -= dm;
            z.hurt = 0.25;
            n++;
          }
        }
        n += swSplash(s.x, s.y, TS * 1.3, dm, 40) || 0;
        if (n) {
          puff(s.x, s.y, "#ffb040", 4, 40, { T: 0.4, z: 0.8, vz: 1.2, g: 3, s: 0.1 });
          if (REALR() < 0.4) snd("sizzle", s.x, s.y);
        }
      }
    }
  }
}

/* ---- look: dark pit with five spikes, one instanced mesh each (rebuilt only when the traps change) ---- */
let SPKM = null,
  SPKP = null,
  SPKS = -1;

export function spkSync() {
  if (!SPK.size && !SPKM) return;
  if (SPKS === objectivesState.SPKV && SPKM) return;
  if (!SPKM) {
    SPKM = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.06, 0.34, 4),
      new THREE.MeshLambertMaterial({ color: 0xaab0ba }),
      1500,
    );
    SPKP = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.02, 10),
      new THREE.MeshLambertMaterial({ color: 0x2e2218 }),
      300,
    );
    for (const m of [SPKM, SPKP]) {
      m.frustumCulled = false;
      m.count = 0;
      scene.add(m);
    }
  }
  SPKS = objectivesState.SPKV;
  const o = new THREE.Object3D(),
    offs = [
      [0, 0],
      [0.22, 0.2],
      [-0.22, 0.2],
      [0.2, -0.22],
      [-0.2, -0.2],
    ];
  let n = 0,
    p = 0;
  for (const i of SPK.keys()) {
    if (p >= 300 || n + 5 > 1500) break;
    const x = (i % TW) + 0.5,
      z = ((i / TW) | 0) + 0.5,
      h = gh(x, z);
    o.rotation.set(0, 0, 0);
    o.scale.set(1, 1, 1);
    o.position.set(x, h + 0.012, z);
    o.updateMatrix();
    SPKP.setMatrixAt(p++, o.matrix);
    for (const [a, b] of offs) {
      o.position.set(x + a, h + 0.17, z + b);
      o.updateMatrix();
      SPKM.setMatrixAt(n++, o.matrix);
    }
  }
  SPKM.count = n;
  SPKP.count = p;
  SPKM.instanceMatrix.needsUpdate = true;
  SPKP.instanceMatrix.needsUpdate = true;
}

export function eraTick(dt) {
  if (!RS2.done.era) return;
  if (!edge(dt, 2)) return;
  for (const s of sessionState.structs)
    if (s.t === 0 && s.prog >= 1 && s.hp > 0 && s.hp < s.max) s.hp = Math.min(s.max, s.hp + s.max * 0.01);
}

export function initializeTraps() {
  IC.era = IC.steel || IC.iron;
  IC.oil = IC.fire;
  IC.spike = IC.bastion || IC.torch;
}
