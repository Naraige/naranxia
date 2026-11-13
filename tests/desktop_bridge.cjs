const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourceDir = path.resolve(__dirname, "../apps/desktop/src");
const distDir = path.resolve(__dirname, "../dist");
fs.mkdirSync(distDir, { recursive: true });
const userData = fs.mkdtempSync(path.join(distDir, ".desktop-bridge-"));
const tempRoot = fs.realpathSync(distDir);
const testRoot = fs.realpathSync(userData);
assert.equal(path.dirname(testRoot), tempRoot, `Refusing to remove unexpected temp path: ${testRoot}`);

async function main() {
  try {
    const handlers = new Map();
    const listeners = new Map();
    const openedPaths = [];
    const switches = [];
    let exposed;
    const app = {
      getPath(name) {
        assert.equal(name, "userData");
        return userData;
      },
      getVersion: () => "1.0.0",
      commandLine: { appendSwitch: (name, value) => switches.push([name, value]) },
      whenReady: () =>
        new Promise(() => {
          /* Keep the GUI path out of this IPC-only harness. */
        }),
      on() {
        /* The test never creates a window. */
      },
      quit() {
        /* The test never starts the launcher. */
      },
    };
    const electron = {
      app,
      BrowserWindow: class {},
      ipcMain: {
        handle(channel, callback) {
          assert.equal(handlers.has(channel), false, `duplicate IPC handler: ${channel}`);
          handlers.set(channel, callback);
        },
      },
      shell: {
        openExternal() {
          /* External navigation is outside this save bridge contract. */
        },
        openPath: (target) => openedPaths.push(target),
      },
      Menu: {
        setApplicationMenu() {
          /* The test never creates a window. */
        },
      },
    };
    const mockedRequire = (name) => (name === "electron" ? electron : require(name));
    const loadCommonJs = (file) => {
      const code = fs.readFileSync(file, "utf8");
      const wrapper = new vm.Script(`(function (require, module, exports, __dirname, __filename) {\n${code}\n})`, {
        filename: file,
      });
      const module = { exports: {} };
      wrapper.runInThisContext()(mockedRequire, module, module.exports, path.dirname(file), file);
      return module.exports;
    };

    loadCommonJs(path.join(sourceDir, "main.js"));
    assert.deepEqual(switches, [["autoplay-policy", "no-user-gesture-required"]]);
    const ipcRenderer = {
      invoke: async (channel, ...args) => {
        const handler = handlers.get(channel);
        assert.equal(typeof handler, "function", `missing IPC handler: ${channel}`);
        return handler({}, ...args);
      },
      on(channel, callback) {
        listeners.set(channel, callback);
      },
    };
    const contextBridge = {
      exposeInMainWorld(name, api) {
        exposed = { name, api };
      },
    };
    const preloadFile = path.join(sourceDir, "preload.js");
    const preload = new vm.Script(
      `(function (require, module, exports, __dirname, __filename) {\n${fs.readFileSync(preloadFile, "utf8")}\n})`,
      { filename: preloadFile },
    );
    const preloadModule = { exports: {} };
    preload.runInThisContext()(
      (name) => (name === "electron" ? { contextBridge, ipcRenderer } : require(name)),
      preloadModule,
      preloadModule.exports,
      sourceDir,
      preloadFile,
    );

    assert.equal(exposed.name, "NARX");
    assert.equal(exposed.api.desktop, true);
    assert.deepEqual(await exposed.api.list(), []);
    assert.equal(await exposed.api.load("missing"), null);

    const gameDir = path.join(userData, "game");
    fs.mkdirSync(gameDir, { recursive: true });
    fs.writeFileSync(path.join(gameDir, "version.json"), JSON.stringify({ version: "v92" }));
    const payload = JSON.stringify({ wave: 17, map: "Été" });
    assert.equal(await exposed.api.save("summer slot", payload), true);
    assert.equal(await exposed.api.load("summer slot"), payload);
    assert.deepEqual(await exposed.api.list(), [
      {
        name: "summer slot",
        t: (await fs.promises.stat(path.join(userData, "saves", "summer slot.nxs"))).mtimeMs,
        size: Buffer.byteLength(payload),
      },
    ]);

    const firstFile = path.join(userData, "saves", "summer slot.nxs");
    fs.utimesSync(firstFile, new Date(1000), new Date(1000));
    assert.equal(await exposed.api.save("../../escape", "safe"), true);
    const savesDir = path.join(userData, "saves");
    const files = fs.readdirSync(savesDir).filter((name) => name.endsWith(".nxs"));
    assert.equal(
      files.some((name) => path.dirname(path.resolve(savesDir, name)) !== path.resolve(savesDir)),
      false,
    );
    assert.equal(fs.existsSync(path.join(userData, "escape.nxs")), false);
    const ordered = await exposed.api.list();
    assert.equal(ordered[0].name, "______escape");
    assert.equal(ordered[1].name, "summer slot");

    const updatedPayload = JSON.stringify({ wave: 18 });
    assert.equal(await exposed.api.save("summer slot", updatedPayload), true);
    assert.equal(await exposed.api.load("summer slot"), updatedPayload);
    assert.equal((await exposed.api.list()).filter((item) => item.name === "summer slot").length, 1);
    assert.deepEqual(await exposed.api.info(), { version: "v92", launcher: "1.0.0", platform: process.platform });
    assert.equal(await exposed.api.openFolder(), true);
    assert.deepEqual(openedPaths, [savesDir]);
    assert.equal(fs.existsSync(savesDir), true);

    let status;
    exposed.api.onStatus((value) => {
      status = value;
    });
    listeners.get("upd")({}, { msg: "Updated to v93", p: 1 });
    assert.deepEqual(status, { msg: "Updated to v93", p: 1 });

    assert.equal(await exposed.api.del("summer slot"), true);
    assert.equal(await exposed.api.load("summer slot"), null);
    console.log("desktop bridge PASS");
  } finally {
    fs.rmSync(testRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
