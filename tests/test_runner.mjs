import report from "./node_report.cjs";
const { assert, finish } = report;
import { testPassed, validateResults } from "../tools/test_result.mjs";

const ok = /"ok":true/;

assert.equal(testPassed(0, false, '{"ok":true}\nERRS []\n', ok), true);
assert.equal(testPassed(0, false, "RESULT OK\n", /^RESULT OK$/m), true);
assert.equal(testPassed(0, false, "ERRS []\n", ok), false);
assert.equal(testPassed(0, false, '{"ok":false}\nERRS []\n', ok), false);
assert.equal(testPassed(1, false, '{"ok":true}\nERRS []\n', ok), false);
assert.equal(testPassed(0, true, '{"ok":true}\nERRS []\n', ok), false);

for (const output of [
  "EXC page evaluation failed",
  "Traceback (most recent call last):",
  "FIRST DIVERGENCE tick 12",
  "ERRS ['TypeError']",
  'ERRS ["can\'t load"]',
  "ERRS [] ['TypeError']",
  'ERRS [] ["can\'t load"]',
  "ERRS [] unexpected",
  "ERRS not-an-array",
  '{"ds": true}',
]) {
  assert.equal(testPassed(0, false, `${output}\n{"ok":true}`, /./s), false, output);
}
assert.equal(testPassed(0, false, 'ERRS ["can\'t load"]\nRESULT OK\n', /^RESULT OK$/m), false);

const record = {
  schema: 1,
  id: "example",
  purpose: "observable requirement",
  complete: true,
  status: "passed",
  category: null,
  durationMs: 1,
  phasesMs: {},
  configuration: { seed: 42 },
  assertions: [{ name: "damage", passed: true, actual: 7, expected: 7 }],
};
const output = (r) => "TEST_RESULT " + JSON.stringify(r) + "\n";
assert.equal(validateResults(0, false, output(record), ["example"]).passed, true);
for (const changed of [
  null,
  { ...record, complete: false },
  { ...record, assertions: [] },
  { ...record, id: "other" },
  { ...record, status: "unknown" },
  { ...record, category: "unknown" },
  { ...record, category: "timeout" },
  { ...record, durationMs: -1 },
  { ...record, phasesMs: [] },
  { ...record, configuration: "missing" },
  { ...record, phasesMs: { load: -1 } },
  { ...record, assertions: [{ name: "scenario completed successfully", passed: true, actual: true, expected: true }] },
  { ...record, assertions: [{ name: "x", passed: false, actual: 0, expected: 1 }] },
  { ...record, assertions: [{ name: "x", passed: "true", actual: 1, expected: 1 }] },
]) {
  assert.equal(validateResults(0, false, output(changed), ["example"]).passed, false);
}
for (const text of [
  "",
  '{"ok":true}',
  "TEST_RESULT {",
  output(record) + output(record),
  output(record) + "\nEXC hidden error",
  output(record) + "\nFIRST DIVERGENCE tick 1",
]) {
  assert.equal(validateResults(0, false, text, ["example"]).passed, false);
}
assert.equal(validateResults(1, false, output(record), ["example"]).passed, false);
assert.equal(validateResults(0, true, output(record), ["example"]).category, "timeout");
const { selectTests, tiers } = await import("../tools/test_suite.mjs");
assert.equal(selectTests([]).tier, "core");
assert.deepEqual(selectTests(["det", "det"]).selected, ["det"]);
assert.ok(tiers.core.every((n) => tiers.full.includes(n)));
assert.ok(tiers.full.length > tiers.core.length);
assert.ok(tiers.full.includes("mp_resync_deep") && tiers.full.includes("mp_soak"));
for (const args of [["--tier"], ["--tier", "missing"], ["--full", "det"], ["--full", "--full"], ["--wat"], ["bogus"]])
  assert.throws(() => selectTests(args));
const { readdirSync } = await import("node:fs");
const { suite } = await import("../tools/test_suite.mjs");
const registered = new Set(
  Object.values(suite)
    .flatMap((s) => [s.file, ...(s.assets || [])])
    .map((file) => file.split("/").at(-1)),
);
const helpers = new Set([
  "assertions.js",
  "browser_fixture.py",
  "mp_harness.py",
  "mp_observer.js",
  "node_report.cjs",
  "runtime_parity.py",
]);
for (const file of readdirSync(new URL(".", import.meta.url)).filter((n) => /\.(?:js|mjs|cjs|py)$/.test(n))) {
  assert.ok(
    registered.has(file) || helpers.has(file),
    file + " must be registered or explicitly classified as a helper/artifact comparison",
  );
}
console.log("runner contracts PASS");
finish("runner", "Reject missing, malformed, zero-assertion and contradictory success results");
