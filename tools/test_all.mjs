#!/usr/bin/env node
import { createWriteStream, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateResults } from "./test_result.mjs";
import { selectTests, suite } from "./test_suite.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let selection;
try {
  selection = selectTests(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
if (selection.list) {
  console.log(JSON.stringify(selection, null, 2));
  process.exit(0);
}
const python = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const concurrency = Number(process.env.J || 1);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 2) {
  console.error("J must be 1 or 2 (browser CPU contention is expensive)");
  process.exit(2);
}
const started = performance.now();
const runId = new Date().toISOString().replace(/[:.]/g, "-") + `-${process.pid}`;
const logDir = path.join(root, "dist", "test-logs", runId);
mkdirSync(logDir, { recursive: true });
const phasesMs = {},
  outcomes = [],
  children = new Set();
function stop(child) {
  if (process.platform === "win32")
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      /* already exited */
    }
  }
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    for (const child of children) stop(child);
    process.exit(130);
  });
function execute(command, args, name, timeout = 20 * 60 * 1000) {
  return new Promise((resolve) => {
    const begin = performance.now();
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      detached: process.platform !== "win32",
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        PYTHONIOENCODING: "utf-8",
        TEST_ARTIFACT_DIR: logDir,
        TEST_PURPOSES: JSON.stringify(
          Object.fromEntries(
            Object.entries(suite)
              .filter(([, s]) => s.purpose)
              .map(([name, s]) => [name, s.purpose]),
          ),
        ),
      },
    });
    children.add(child);
    const chunks = [];
    let bytes = 0,
      timedOut = false;
    const logPath = path.join(logDir, `${name}.log`);
    const log = createWriteStream(logPath);
    for (const stream of [child.stdout, child.stderr])
      stream?.on("data", (chunk) => {
        chunks.push(chunk);
        log.write(chunk);
        bytes += chunk.length;
        if (bytes > 32 * 1024 * 1024) {
          timedOut = true;
          stop(child);
        }
      });
    child.on("error", (error) => {
      chunks.push(Buffer.from(String(error)));
      log.write(String(error));
    });
    const timer = setTimeout(() => {
      timedOut = true;
      stop(child);
    }, timeout);
    child.on("close", (code) => {
      clearTimeout(timer);
      children.delete(child);
      const output = Buffer.concat(chunks).toString("utf8");
      log.end(() => resolve({ code, timedOut, output, logPath, durationMs: performance.now() - begin }));
    });
  });
}
if (selection.build && selection.selected.some((name) => ["browser", "python"].includes(suite[name].kind))) {
  const built = await execute(process.execPath, ["tools/build.mjs"], "build");
  phasesMs.build = built.durationMs;
  if (built.code !== 0 || built.timedOut) {
    console.error(built.output);
    process.exit(1);
  }
  if (selection.selected.includes("smoke")) {
    const packed = await execute(process.execPath, ["tools/build_dist.mjs"], "pack");
    phasesMs.pack = packed.durationMs;
    if (packed.code !== 0 || packed.timedOut) {
      console.error(packed.output);
      process.exit(1);
    }
  }
}
const jobs = [];
for (const html of ["naranxia_readable.html", "naranxia.html"]) {
  const names = selection.selected.filter((name) => suite[name].kind === "browser" && suite[name].html === html);
  const regular = names.filter((name) => !suite[name].heavy);
  for (const name of names.filter((name) => suite[name].heavy))
    jobs.push({ names: [name], command: python, args: ["tools/browser_suite.py", suite[name].file, "--html", html] });
  if (regular.length)
    jobs.push({
      names: regular,
      command: python,
      args: ["tools/browser_suite.py", ...regular.map((name) => suite[name].file), "--html", html],
    });
}
for (const name of selection.selected.filter((name) => suite[name].kind !== "browser")) {
  const spec = suite[name];
  jobs.push({
    names: [name],
    command: spec.kind === "node" ? process.execPath : python,
    args: [spec.file, ...(spec.args || [])],
  });
}
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    const label = job.names.length > 1 ? "browser-" + suite[job.names[0]].html : job.names[0];
    const child = await execute(job.command, job.args, label);
    const validation = validateResults(child.code, child.timedOut, child.output, job.names);
    outcomes.push({
      names: job.names,
      durationMs: child.durationMs,
      setupTeardownMs: Math.max(0, child.durationMs - validation.results.reduce((sum, r) => sum + r.durationMs, 0)),
      ...validation,
    });
    saveReport(false);
    for (const name of job.names) {
      const r = validation.results.find((r) => r.id === name);
      const own = r ? validateResults(0, false, "TEST_RESULT " + JSON.stringify(r), [name]) : validation;
      const passed = own.passed && !child.timedOut;
      console.log(
        `${passed ? "PASS" : "FAIL"} ${name} ${((r?.durationMs ?? child.durationMs) / 1000).toFixed(2)}s ${r?.assertions.length || 0} assertions${!passed && own.category ? " [" + own.category + "]" : ""}`,
      );
    }
    if (validation.passed) unlinkSync(child.logPath);
    else {
      console.error(`${validation.error}\nLog: ${child.logPath}`);
      console.error(
        child.output
          .trimEnd()
          .split("\n")
          .slice(-8)
          .map((line) => line.slice(0, 2000))
          .join("\n"),
      );
    }
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
function saveReport(complete) {
  const summary = {
    schema: 1,
    complete,
    runId,
    tier: selection.tier,
    selected: selection.selected,
    concurrency,
    environment: { node: process.version, platform: process.platform, python },
    durationMs: performance.now() - started,
    phasesMs,
    outcomes,
  };
  writeFileSync(path.join(logDir, "results.json"), JSON.stringify(summary, null, 2));
}
saveReport(true);
const report = path.join(logDir, "results.json");
console.log(`Results: ${report}`);
process.exitCode = outcomes.every((r) => r.passed) ? 0 : 1;
