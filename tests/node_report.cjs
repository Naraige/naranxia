const native = require("node:assert/strict");
const { inspect } = require("node:util");
const assertions = [];
const started = performance.now();
// Preserve native assertion semantics and messages; count only executed checks.
function observe(fn, operation, args) {
  const unary = ["assert", "ok"].includes(operation);
  const message = args[unary ? 1 : 2];
  const name = operation + (typeof message === "string" ? ": " + message : "");
  const expected = unary ? true : (args[1] ?? "assertion succeeds");
  const describe = (value) => {
    if (value instanceof RegExp || typeof value === "function" || value === undefined) return String(value);
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return inspect(value, { depth: 3 });
    }
  };
  try {
    const value = fn(...args);
    if (value && typeof value.then === "function")
      return value.then(
        () => record(),
        (error) => {
          assertions.push({ name, passed: false, actual: String(error), expected: "assertion succeeds" });
          throw error;
        },
      );
    record();
    return value;
  } catch (error) {
    assertions.push({ name, passed: false, actual: describe(args[0]), expected: describe(expected) });
    throw error;
  }
  function record() {
    assertions.push({ name, passed: true, actual: describe(args[0]), expected: describe(expected) });
  }
}
const assert = new Proxy(native, {
  apply(target, _this, args) {
    return observe(target, "assert", args);
  },
  get(target, key) {
    return typeof target[key] === "function" ? (...args) => observe(target[key], String(key), args) : target[key];
  },
});
function finish(id, purpose) {
  const passed = assertions.length > 0 && assertions.every((a) => a.passed);
  console.log(
    "TEST_RESULT " +
      JSON.stringify({
        schema: 1,
        id,
        purpose,
        complete: true,
        status: passed ? "passed" : "failed",
        category: passed ? null : "assertion_failure",
        assertions,
        durationMs: performance.now() - started,
        phasesMs: {},
        configuration: { node: process.version },
      }),
  );
}
module.exports = { assert, finish };
