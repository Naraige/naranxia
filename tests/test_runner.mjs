import assert from "node:assert/strict";
import { testPassed } from "../tools/test_result.mjs";

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

console.log("runner contracts PASS");
