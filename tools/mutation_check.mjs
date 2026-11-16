// Focused source mutations, compiled into disposable bundles. Never edit the
// checkout or accept a mutant failure caused by setup rather than an assertion.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import report from "../tests/node_report.cjs";
const { assert, finish } = report;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = await fs.mkdtemp(path.join(root, "dist", ".mutations-"));
try {
  for (const mutation of [
    { name: "control", file: "", from: "", to: "", fails: false },
    { name: "rng multiplier", file: "core/random.js", from: "1664525", to: "1664526", fails: true },
    {
      name: "terrain collision",
      file: "world/traversal-rules.js",
      from: "if (ha === hb) return true;",
      to: "if (ha !== hb) return true;",
      fails: true,
    },
    {
      name: "miner traversal",
      file: "world/traversal-rules.js",
      from: "((fa && fa < 3) || (fb && fb < 3))",
      to: "false",
      fails: true,
    },
  ]) {
    let edits = 0;
    const compiled = await build({
      entryPoints: [path.join(root, "tests/gameplay_fast.mjs")],
      bundle: true,
      write: false,
      platform: "node",
      format: "cjs",
      plugins: [
        {
          name: "targeted-fault",
          setup(b) {
            b.onLoad({ filter: /packages[\\/]game[\\/]src[\\/].*\.js$/ }, async ({ path: file }) => {
              let contents = await fs.readFile(file, "utf8");
              if (file.replaceAll("\\", "/").endsWith(mutation.file) && mutation.file) {
                assert.equal(contents.includes(mutation.from), true, mutation.name + " matches current source");
                contents = contents.replaceAll(mutation.from, mutation.to);
                edits++;
              }
              return { contents, loader: "js" };
            });
          },
        },
      ],
    });
    const target = path.join(directory, "scenario.cjs");
    await fs.writeFile(target, compiled.outputFiles[0].contents);
    const child = spawnSync(process.execPath, [target], {
      cwd: root,
      encoding: "utf8",
      timeout: 30000,
      windowsHide: true,
    });
    assert.equal(!!child.error, false, mutation.name + " launches and completes");
    assert.equal(edits, mutation.fails ? 1 : 0, mutation.name + " mutation count");
    assert.equal(child.status !== 0, mutation.fails, mutation.name + " detected");
    if (mutation.fails) assert.match(child.stderr, /AssertionError/, mutation.name + " fails a behavior assertion");
  }
  finish("faults", "Gameplay tests reject altered RNG, missing terrain collision and incorrect miner traversal");
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
