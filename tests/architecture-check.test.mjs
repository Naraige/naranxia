import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildGraph,
  cycleEdges,
  inspectArchitecture,
  stronglyConnectedComponents,
} from "../tools/check-architecture.mjs";
import { prepareTerrainRect, setTerrainRectPreparer } from "../packages/game/src/world/chunk-provider.js";
import { markP, markT, setTerrainInvalidationHandlers } from "../packages/game/src/world/terrain-invalidation.js";

const sourceRoot = "packages/game/src/";
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("finds multi-module cycles and self-imports", () => {
  const graph = new Map([
    ["a.js", new Set(["b.js"])],
    ["b.js", new Set(["a.js", "c.js"])],
    ["c.js", new Set(["c.js"])],
    ["d.js", new Set()],
  ]);

  assert.deepEqual(stronglyConnectedComponents(graph), [["a.js", "b.js"], ["c.js"]]);
  assert.deepEqual([...cycleEdges(graph)].sort(), ["a.js -> b.js", "b.js -> a.js", "c.js -> c.js"]);
});

test("rejects new cyclic edges and boundary violations while allowing removals", () => {
  const main = `${sourceRoot}main.js`;
  const debug = `${sourceRoot}debug/browser-console.js`;
  const math = `${sourceRoot}core/math.js`;
  const pathfindingState = `${sourceRoot}world/pathfinding-state.js`;
  const buildCatalog = `${sourceRoot}ui/build-catalog.js`;
  const terrain = `${sourceRoot}world/terrain.js`;
  const renderer = `${sourceRoot}rendering/terrain.js`;
  const music = `${sourceRoot}audio/music.js`;
  const sound = `${sourceRoot}audio/sound.js`;
  const hudState = `${sourceRoot}ui/hud-state.js`;
  const audioUI = `${sourceRoot}ui/settings.js`;
  const game = `${sourceRoot}gameplay/session.js`;
  const graph = new Map([
    [main, new Set([game, debug])],
    [debug, new Set([game])],
    [game, new Set([debug, main])],
    [math, new Set([game])],
    [pathfindingState, new Set([game])],
    [buildCatalog, new Set([game])],
    [terrain, new Set([renderer])],
    [music, new Set([sound, hudState, audioUI])],
  ]);
  const baseline = { cycleEdges: [`${debug} -> ${game}`, `${game} -> ${debug}`] };

  const result = inspectArchitecture(graph, baseline);
  assert.deepEqual(result.removedCycleEdges, []);
  assert.ok(result.newCycleEdges.includes(`${game} -> ${main}`));
  assert.ok(result.newCycleEdges.includes(`${main} -> ${game}`));
  assert.ok(result.violations.some((message) => message.includes("entry point is imported")));
  assert.ok(result.violations.some((message) => message.includes("outside main.js")));
  assert.equal(result.violations.filter((message) => message.includes("Pure data/state leaf")).length, 3);
  assert.ok(result.violations.some((message) => message.includes("World modules must not import rendering")));
  assert.ok(result.violations.some((message) => message.includes("Music must receive its audio provider")));
  assert.ok(result.violations.some((message) => message.includes("Audio modules must not import UI feature modules")));
  assert.ok(!result.violations.some((message) => message.includes(`${music} -> ${hudState}`)));

  graph.get(main).delete(debug);
  graph.get(game).delete(debug);
  const cleaned = inspectArchitecture(graph, baseline);
  assert.deepEqual(cleaned.removedCycleEdges, [`${debug} -> ${game}`, `${game} -> ${debug}`]);
});

test("does not report an existing baseline cycle as new", () => {
  const graph = new Map([
    ["a.js", new Set(["b.js"])],
    ["b.js", new Set(["a.js"])],
  ]);
  const baseline = { cycleEdges: ["a.js -> b.js", "b.js -> a.js"] };
  assert.deepEqual(inspectArchitecture(graph, baseline).newCycleEdges, []);
});

test("rejects a cycle edge removed from the ratcheted baseline when it returns", () => {
  const graph = new Map([
    ["a.js", new Set(["b.js"])],
    ["b.js", new Set(["a.js"])],
  ]);
  const baseline = { cycleEdges: ["a.js -> b.js"] };
  assert.deepEqual(inspectArchitecture(graph, baseline).newCycleEdges, ["b.js -> a.js"]);
});

test("preserves terrain invalidation order before renderer setup", () => {
  const calls = [];
  markT(1, 2);
  markP(3, 4);
  markT(5, 6);
  setTerrainInvalidationHandlers(
    (x, y) => calls.push(["terrain", x, y]),
    (x, y) => calls.push(["props", x, y]),
  );
  assert.deepEqual(calls, [
    ["terrain", 1, 2],
    ["props", 3, 4],
    ["terrain", 5, 6],
  ]);
  markP(7, 8);
  assert.deepEqual(calls.at(-1), ["props", 7, 8]);
});

test("terrain rectangle preparation stays synchronous through its provider", () => {
  const calls = [];
  const result = {};
  assert.throws(() => prepareTerrainRect(0, 0, 1, 1), /initializeTerrain/);
  setTerrainRectPreparer((...args) => {
    calls.push(args);
    return result;
  });
  assert.equal(prepareTerrainRect(11, 17, 23, 29), result);
  assert.deepEqual(calls, [[11, 17, 23, 29]]);
});

test("builds the repository graph when launched outside the workspace", () => {
  const script = path.join(projectRoot, "tools", "check-architecture.mjs");
  const result = spawnSync(process.execPath, [script], { cwd: os.tmpdir(), encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Architecture graph: \d+ modules, \d+ internal imports\./);
});

test("architecture checker rejects unresolved internal imports", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "naranxia-architecture-"));
  try {
    const sourceDirectory = path.join(directory, sourceRoot);
    await mkdir(sourceDirectory, { recursive: true });
    await writeFile(path.join(sourceDirectory, "entry.js"), "import './missing.js';\n", "utf8");
    await assert.rejects(buildGraph(directory), /Could not resolve/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("build-menu keeps the legacy catalog exports bound to the shared objects", () => {
  const script = `
    globalThis.__NX_VERSION__ = "test";
    globalThis.__NX_NOTES__ = "";
    globalThis.window = globalThis;
    globalThis.document = { getElementById: () => null, createElement: () => ({ getContext: () => ({}) }) };
    Object.defineProperty(globalThis, "navigator", { value: { webdriver: true }, configurable: true });
    globalThis.matchMedia = () => ({ matches: false });
    globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
    globalThis.addEventListener = () => {};
    globalThis.removeEventListener = () => {};
    globalThis.MessageChannel = class { constructor() { this.port1 = {}; this.port2 = { postMessage() {} }; } };
    const value = new Proxy(function () {}, { apply: () => value, construct: () => value });
    class ThreeValue { constructor() { return value; } }
    globalThis.THREE = new Proxy({}, { get: () => ThreeValue });
    const catalog = await import("./packages/game/src/ui/build-catalog.js");
    const menu = await import("./packages/game/src/ui/build-menu.js");
    console.log(JSON.stringify({ names: catalog.NAMES === menu.NAMES, hotkeys: catalog.HK === menu.HK }));
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(JSON.parse(result.stdout.trim()), { names: true, hotkeys: true });
});
