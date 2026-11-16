const failure = /^Traceback|^EXC|^FIRST DIVERGENCE|"ds"\s*:\s*true/m;

function errorListsAreEmpty(line) {
  let rest = line.slice(4).trim();
  let lists = 0;
  while (rest.startsWith("[]")) {
    lists++;
    rest = rest.slice(2).trimStart();
  }
  return lists > 0 && rest === "";
}

function outputIsClean(output) {
  if (failure.test(output)) return false;
  return output.split(/\r?\n/).every((line) => !/^ERRS(?:\s|$)/.test(line) || errorListsAreEmpty(line));
}

export function testPassed(code, timedOut, output, passPattern) {
  if (timedOut || code !== 0 || !outputIsClean(output)) return false;
  passPattern.lastIndex = 0;
  return passPattern.test(output);
}

// Versioned result contract. Legacy marker parsing remains exported for callers,
// but the suite runner accepts only complete, named, assertion-bearing records.
export function validateResults(code, timedOut, output, expectedIds) {
  const fail = (category, error) => ({ passed: false, category, error, results: [] });
  if (timedOut) return fail("timeout", "Child exceeded its execution deadline");
  let results;
  try {
    results = output
      .split(/\r?\n/)
      .filter((line) => line.startsWith("TEST_RESULT "))
      .map((line) => JSON.parse(line.slice(12)));
  } catch (error) {
    return fail("infrastructure_failure", `Malformed TEST_RESULT: ${error.message}`);
  }
  if (results.length !== expectedIds.length || new Set(results.map((r) => r?.id)).size !== results.length)
    return fail("infrastructure_failure", "Missing, duplicate, or unexpected result identities");
  for (const id of expectedIds) {
    const r = results.find((r) => r?.id === id);
    if (
      !r ||
      r.schema !== 1 ||
      r.complete !== true ||
      !["passed", "failed"].includes(r.status) ||
      ![
        null,
        "assertion_failure",
        "timeout",
        "infrastructure_failure",
        "simulation_divergence",
        "performance_regression",
      ].includes(r.category) ||
      (r.status === "passed" && r.category !== null) ||
      typeof r.purpose !== "string" ||
      !r.purpose.trim() ||
      !Number.isFinite(r.durationMs) ||
      r.durationMs < 0 ||
      !r.phasesMs ||
      typeof r.phasesMs !== "object" ||
      Array.isArray(r.phasesMs) ||
      Object.values(r.phasesMs).some((v) => !Number.isFinite(v) || v < 0) ||
      !r.configuration ||
      typeof r.configuration !== "object" ||
      Array.isArray(r.configuration) ||
      !Array.isArray(r.assertions) ||
      r.assertions.length === 0 ||
      r.assertions.every((a) => a?.name === "scenario completed successfully") ||
      r.assertions.some(
        (a) =>
          !a ||
          typeof a.name !== "string" ||
          !a.name.trim() ||
          typeof a.passed !== "boolean" ||
          !("actual" in a) ||
          !("expected" in a),
      )
    )
      return fail("infrastructure_failure", `${id}: incomplete result or zero meaningful assertions`);
    if (r.status !== "passed" || r.error || r.assertions.some((a) => !a.passed))
      return {
        passed: false,
        category: /^FIRST DIVERGENCE|"ds"\s*:\s*true/m.test(output)
          ? "simulation_divergence"
          : r.category || "assertion_failure",
        error: r.error || `${id}: assertion failed`,
        results,
      };
  }
  if (/^FIRST DIVERGENCE|"ds"\s*:\s*true/m.test(output))
    return { passed: false, category: "simulation_divergence", error: "Peers diverged", results };
  if (code !== 0 || !outputIsClean(output))
    return {
      passed: false,
      category: "infrastructure_failure",
      error: `Unexpected exception, error log, or child exit ${code}`,
      results,
    };
  return { passed: true, category: null, error: null, results };
}
