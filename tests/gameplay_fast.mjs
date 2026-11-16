import report from "./node_report.cjs";
import { rngf } from "../packages/game/src/core/random.js";
import { canStep, canStepZ } from "../packages/game/src/world/traversal-rules.js";
import { setTerrainGridState, stairs } from "../packages/game/src/world/terrain-state.js";
const { assert, finish } = report;

// Exercise the production RNG and terrain traversal rules without DOM or WebGL.
const a = rngf(1),
  b = rngf(1);
assert.equal(a(), 1015568748 / 4294967296, "pinned first RNG value");
assert.equal(b(), 1015568748 / 4294967296);
assert.deepEqual(Array.from({ length: 128 }, a), Array.from({ length: 128 }, b), "repeated seeded RNG sequence");
assert.notEqual(rngf(2)(), rngf(1)(), "different seeds produce different streams");
assert.equal(rngf(0)(), rngf(1)(), "zero seed uses the documented fallback");

const height = new Uint8Array(16),
  flags = new Uint8Array(16);
setTerrainGridState(
  1,
  1,
  height,
  new Uint8Array(16),
  new Uint8Array(16),
  new Uint8Array(16),
  new Uint8Array(16),
  new Uint8Array(1),
  flags,
);
for (const [label, ha, hb, flag, unit, zombie] of [
  ["flat", 12, 12, 0, true, true],
  ["cliff", 12, 14, 0, false, false],
  ["natural step", 12, 13, 0, false, false],
  ["levelled step", 12, 13, 1, true, true],
  ["miner step", 12, 13, 2, false, true],
  ["player block", 12, 13, 3, false, false],
  ["levelled cliff", 12, 14, 1, false, false],
]) {
  height[4] = ha;
  height[5] = hb;
  flags[4] = flag;
  assert.equal(canStep(4, 5), unit, label + " friendly");
  assert.equal(canStepZ(4, 5), zombie, label + " zombie");
  assert.equal(canStep(5, 4), unit, label + " reverse");
}
flags.fill(0);
height[4] = 12;
height[5] = 13;
stairs.set(4, { ax: 0, lo: 12, hi: 13 });
assert.equal(canStep(4, 5), true, "ramp permits its axis");
height[8] = 13;
assert.equal(canStep(4, 8), false, "ramp blocks its perpendicular axis");
stairs.clear();
assert.equal(canStep(4, 5), false, "demolished ramp no longer permits crossing");
finish("gameplay_fast", "Seeded RNG and terrain collision boundary invariants using production modules");
