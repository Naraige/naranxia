const { assert, finish } = require("./node_report.cjs");
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
    const mockedRequire = (name) =>
      name === "electron" ? electron : name.startsWith("./") ? loadCommonJs(path.join(sourceDir, name)) : require(name);
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
    await launcherPicture(loadCommonJs(path.join(sourceDir, "icons.js")));
    console.log("desktop bridge PASS");
    finish("desktop", "Actual Electron preload and save IPC boundary");
  } finally {
    fs.rmSync(testRoot, { recursive: true, force: true });
  }
}

/* the picture of the launcher follows the releases (apps/desktop/src/icons.js): Windows shortcuts and the Linux menu entry, on fakes */
async function launcherPicture(icons) {
  const png = (tail) =>
    Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(24), Buffer.from(tail)]);
  assert.equal(icons.isPng(png("a")), true);
  assert.equal(icons.isPng(Buffer.from("<html>not a picture at all, a page</html>")), false);
  const ico = icons.icoFromPngs([
    { size: 16, png: Buffer.from("abc") },
    { size: 256, png: Buffer.from("defgh") },
  ]);
  assert.deepEqual(
    [ico.readUInt16LE(2), ico.readUInt16LE(4), ico[6], ico[22]],
    [1, 2, 16, 0],
    "ico header: type, count, sizes",
  );
  assert.deepEqual(
    [ico.readUInt32LE(14), ico.readUInt32LE(18), ico.readUInt32LE(30), ico.readUInt32LE(34)],
    [3, 38, 5, 41],
  );
  assert.equal(ico.subarray(38).toString(), "abcdefgh");
  assert.equal(
    icons.desktopEntryWithIcon("Name=N\nIcon=/old/i.png\nType=Application\n", "/new/$1.png"),
    "Name=N\nIcon=/new/$1.png\nType=Application\n",
  );

  const root = path.join(userData, "picture"),
    ud = path.join(root, "userData"),
    desktop = path.join(root, "Desktop"),
    appData = path.join(root, "AppData"),
    home = path.join(root, "home"),
    exe = "C:\\Games\\Naranxia\\Naranxia.exe";
  const mine = path.join(desktop, "Naranxia.lnk"),
    renamed = path.join(desktop, "My kingdom.lnk"),
    other = path.join(desktop, "Other game.lnk"),
    entry = path.join(home, ".local", "share", "applications", "naranxia.desktop");
  for (const d of [ud, desktop, appData, path.dirname(entry)]) fs.mkdirSync(d, { recursive: true });
  const links = new Map([
    [mine, { target: exe, icon: "C:\\Games\\Naranxia\\icon.ico" }],
    [renamed, { target: exe.toUpperCase(), icon: "" }],
    [other, { target: "C:\\Other\\other.exe", icon: "C:\\Other\\o.ico" }],
  ]);
  for (const f of links.keys()) fs.writeFileSync(f, "lnk");
  fs.writeFileSync(
    entry,
    "[Desktop Entry]\nName=Naranxia\nIcon=/opt/naranxia/resources/app/icon.png\nType=Application\n",
  );
  const writes = [],
    windowIcons = [];
  const env = (platform) => ({
    platform,
    userData: ud,
    home,
    exe,
    app: { getPath: (n) => ({ desktop, appData })[n] },
    shell: {
      readShortcutLink: (f) => links.get(f),
      writeShortcutLink(f, op, o) {
        writes.push([path.basename(f), op]);
        Object.assign(links.get(f), o);
        return true;
      },
    },
    nativeImage: {
      createFromBuffer: (b) => ({ isEmpty: () => b.toString().endsWith("empty") }),
      createFromPath: (f) => ({
        isEmpty: () => !fs.existsSync(f),
        resize: ({ width }) => ({ toPNG: () => Buffer.from("png" + width) }),
      }),
    },
    win: { isDestroyed: () => false, setIcon: (i) => windowIcons.push(i) },
  });
  let served = png("first"),
    downloads = 0;
  const get = async (url, binary) => {
    assert.deepEqual([url, binary], ["https://dl/icon.png", true]);
    downloads++;
    return served;
  };
  const release = (id) => ({
    tag_name: "v97",
    assets: [
      { name: "naranxia.html", id: 1 },
      {
        name: "icon.png",
        id,
        updated_at: "2026-11-22",
        size: served.length,
        browser_download_url: "https://dl/icon.png",
      },
    ],
  });

  let r = await icons.syncIcon({ tag_name: "v96", assets: [{ name: "naranxia.html" }] }, get, env("win32"));
  assert.deepEqual(
    [r.changed, r.applied, downloads, icons.storedPng(ud)],
    [false, [], 0, null],
    "a release without icon.png changes nothing",
  );

  r = await icons.syncIcon(release(10), get, env("win32"));
  const first = icons.storedPng(ud),
    firstIco = first.replace(/png$/, "ico");
  assert.equal(r.changed, true);
  assert.deepEqual(
    r.applied,
    ["window", mine, renamed],
    "the launcher's shortcuts take the picture, the others are left alone",
  );
  assert.equal(fs.readFileSync(first).equals(served), true);
  assert.deepEqual(
    [links.get(mine).icon, links.get(renamed).icon, links.get(other).icon],
    [firstIco, firstIco, "C:\\Other\\o.ico"],
  );
  assert.equal(fs.readFileSync(firstIco).readUInt16LE(4), 7, "seven sizes in the .ico");

  r = await icons.syncIcon(release(10), get, env("win32"));
  assert.deepEqual(
    [r.changed, r.applied, downloads, writes.length],
    [false, ["window"], 1, 2],
    "the same asset is not downloaded or written again",
  );

  served = png("second");
  r = await icons.syncIcon(release(11), get, env("win32"));
  const second = icons.storedPng(ud);
  assert.deepEqual(
    [r.changed, downloads, second !== first, links.get(mine).icon],
    [true, 2, true, second.replace(/png$/, "ico")],
  );
  assert.deepEqual(fs.readdirSync(path.join(ud, "icon")).length, 3, "the pictures of the release before are removed");

  served = Buffer.from("<html>GitHub is having a bad day, this is an error page</html>");
  r = await icons.syncIcon(release(12), get, env("win32"));
  assert.deepEqual([r.changed, r.why, icons.storedPng(ud)], [false, "icon.png is not a PNG picture", second]);
  served = png("empty");
  r = await icons.syncIcon(release(13), get, env("win32"));
  assert.deepEqual([r.changed, icons.storedPng(ud)], [false, second], "a PNG that cannot be drawn is refused");

  r = icons.applyIcon(env("linux"));
  assert.deepEqual(r, ["window", entry]);
  assert.equal(
    fs.readFileSync(entry, "utf8"),
    "[Desktop Entry]\nName=Naranxia\nIcon=" + second + "\nType=Application\n",
  );
  assert.deepEqual(icons.applyIcon(env("linux")), ["window"], "the menu entry is written once");
  assert.equal(windowIcons.length > 0, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
