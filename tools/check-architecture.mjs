import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = "packages/game/src/";

export function stronglyConnectedComponents(graph) {
  const nodes = new Set(graph.keys());
  for (const targets of graph.values()) for (const target of targets) nodes.add(target);

  let nextIndex = 0;
  const indices = new Map();
  const lowLinks = new Map();
  const stack = [];
  const onStack = new Set();
  const components = [];

  function visit(node) {
    indices.set(node, nextIndex);
    lowLinks.set(node, nextIndex++);
    stack.push(node);
    onStack.add(node);

    for (const target of graph.get(node) || []) {
      if (!indices.has(target)) {
        visit(target);
        lowLinks.set(node, Math.min(lowLinks.get(node), lowLinks.get(target)));
      } else if (onStack.has(target)) {
        lowLinks.set(node, Math.min(lowLinks.get(node), indices.get(target)));
      }
    }

    if (lowLinks.get(node) !== indices.get(node)) return;
    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== node);
    components.push(component.sort());
  }

  for (const node of [...nodes].sort()) if (!indices.has(node)) visit(node);
  return components
    .filter((component) => component.length > 1 || graph.get(component[0])?.has(component[0]))
    .sort((left, right) => left[0].localeCompare(right[0]));
}

export function cycleEdges(graph, components = stronglyConnectedComponents(graph)) {
  const edges = new Set();
  for (const component of components) {
    const members = new Set(component);
    for (const from of component) {
      for (const to of graph.get(from) || []) if (members.has(to)) edges.add(`${from} -> ${to}`);
    }
  }
  return edges;
}

export function inspectArchitecture(graph, baseline) {
  const components = stronglyConnectedComponents(graph);
  const currentCycleEdges = cycleEdges(graph, components);
  const allowedCycleEdges = new Set(baseline.cycleEdges);
  const newCycleEdges = [...currentCycleEdges].filter((edge) => !allowedCycleEdges.has(edge)).sort();
  const removedCycleEdges = baseline.cycleEdges.filter((edge) => !currentCycleEdges.has(edge)).sort();
  const violations = [];

  for (const [from, targets] of graph) {
    if (!from.startsWith(sourceRoot)) violations.push(`Module escapes game source: ${from}`);
    for (const to of targets) {
      if (!to.startsWith(sourceRoot)) violations.push(`Import escapes game source: ${from} -> ${to}`);
      if (to === `${sourceRoot}main.js`) violations.push(`The game entry point is imported by ${from}`);
      if (from.startsWith(`${sourceRoot}world/`) && to.startsWith(`${sourceRoot}rendering/`)) {
        violations.push(`World modules must not import rendering modules: ${from} -> ${to}`);
      }
      if (from === `${sourceRoot}audio/music.js` && to === `${sourceRoot}audio/sound.js`) {
        violations.push(`Music must receive its audio provider from sound initialization: ${from} -> ${to}`);
      }
      if (from.startsWith(`${sourceRoot}audio/`) && to.startsWith(`${sourceRoot}ui/`)) {
        const allowedState = new Set(["hud-state.js", "panel-state.js", "language-state.js"]);
        if (!allowedState.has(path.posix.basename(to))) {
          violations.push(`Audio modules must not import UI feature modules: ${from} -> ${to}`);
        }
      }
      if (to === `${sourceRoot}debug/browser-console.js` && from !== `${sourceRoot}main.js`) {
        violations.push(`Browser debug console is imported outside main.js: ${from}`);
      }
    }
  }

  for (const leaf of [
    "core/math.js",
    "core/random.js",
    "core/version.js",
    "i18n/language-state.js",
    "ui/build-catalog.js",
    "ui/panel-state.js",
    "world/terrain-state.js",
    "world/terrain-invalidation.js",
    "world/pathfinding-state.js",
    "world/chunk-provider.js",
  ]) {
    const modulePath = `${sourceRoot}${leaf}`;
    if ((graph.get(modulePath)?.size || 0) > 0)
      violations.push(`Pure data/state leaf must not import modules: ${modulePath}`);
  }

  return { components, currentCycleEdges, newCycleEdges, removedCycleEdges, violations };
}

async function jsFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return jsFiles(absolute);
      return entry.isFile() && entry.name.endsWith(".js") ? [absolute] : [];
    }),
  );
  return nested.flat();
}

export async function buildGraph(projectRoot = root) {
  const files = await jsFiles(path.join(projectRoot, sourceRoot));
  if (!files.length) throw new Error(`No JavaScript modules found under ${sourceRoot}`);
  const result = await build({
    absWorkingDir: projectRoot,
    entryPoints: files,
    outdir: path.join(projectRoot, "dist", "architecture-check"),
    bundle: true,
    splitting: true,
    format: "esm",
    write: false,
    metafile: true,
    platform: "browser",
    logLevel: "silent",
  });
  const graph = new Map();

  for (const [input, details] of Object.entries(result.metafile.inputs)) {
    const from = input.replaceAll("\\", "/");
    if (!from.startsWith(sourceRoot)) continue;
    const targets = new Set();
    for (const dependency of details.imports) {
      if (dependency.external) continue;
      const to = dependency.path.replaceAll("\\", "/");
      if (!result.metafile.inputs[to]) {
        if (dependency.original.startsWith("."))
          throw new Error(`Unresolved internal import: ${from} -> ${dependency.original}`);
        continue;
      }
      if (!to.startsWith(sourceRoot)) {
        if (dependency.original.startsWith(".")) {
          throw new Error(`Relative import escapes game source: ${from} -> ${dependency.original}`);
        }
        if (dependency.original.startsWith("@naranxia/")) {
          throw new Error(`Use a relative path for internal game imports: ${from} -> ${dependency.original}`);
        }
        continue;
      }
      targets.add(to);
    }
    graph.set(from, targets);
  }
  if (!graph.size) throw new Error(`esbuild produced no game source modules under ${sourceRoot}`);
  return graph;
}

async function main() {
  const baseline = JSON.parse(await fs.readFile(path.join(root, "tools", "architecture-baseline.json"), "utf8"));
  const graph = await buildGraph();
  const report = inspectArchitecture(graph, baseline);
  const lines = [
    `Architecture graph: ${graph.size} modules, ${[...graph.values()].reduce((sum, targets) => sum + targets.size, 0)} internal imports.`,
    `Existing cycle debt: ${report.components.map((component) => component.length).join(", ") || "none"} module SCCs; ${report.currentCycleEdges.size} cycle edges remain (${report.removedCycleEdges.length} baseline cycle edges removed).`,
  ];
  if (report.newCycleEdges.length)
    lines.push(`New cycle edges:\n${report.newCycleEdges.map((edge) => `  ${edge}`).join("\n")}`);
  if (report.violations.length)
    lines.push(`Boundary violations:\n${report.violations.map((item) => `  ${item}`).join("\n")}`);
  console.log(lines.join("\n"));
  if (report.newCycleEdges.length || report.violations.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
