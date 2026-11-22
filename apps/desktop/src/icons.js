// The picture of the launcher (window, dock, desktop and menu shortcuts) follows the game releases: when the latest release
// carries an asset "icon.png" that differs from the one in use, the launcher downloads it, keeps it in <app-data>/icon and
// points the window and the shortcuts at it. To change the picture for every player: replace apps/desktop/src/icon.png,
// run `python3 tools/icons.py` and push (the installers workflow attaches icon.png to the latest release, release.yml to new ones).
// Everything here is best effort: a failure keeps the picture that was there and never stops the game from starting.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ASSET = "icon.png";
const MAX_BYTES = 4 * 1024 * 1024;
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const isPng = (b) => Buffer.isBuffer(b) && b.length > 24 && b.subarray(0, 8).equals(PNG_SIG);
const shaOf = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 16);

// an .ico file whose pictures are PNG files (read by Windows since Vista): list = [{ size, png }]
function icoFromPngs(list) {
  const head = Buffer.alloc(6 + 16 * list.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(list.length, 4);
  let offset = head.length;
  list.forEach(({ size, png }, i) => {
    const p = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, p);
    head.writeUInt8(size >= 256 ? 0 : size, p + 1);
    head.writeUInt16LE(1, p + 4);
    head.writeUInt16LE(32, p + 6);
    head.writeUInt32LE(png.length, p + 8);
    head.writeUInt32LE(offset, p + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...list.map((e) => e.png)]);
}

// the text of a Linux menu entry with its Icon line pointing at file
function desktopEntryWithIcon(text, file) {
  return /^Icon=.*$/m.test(text) ? text.replace(/^Icon=.*$/m, () => "Icon=" + file) : text;
}

const iconDir = (userData) => path.join(userData, "icon");
function readState(userData) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(iconDir(userData), "icon.json"), "utf8"));
    return s && typeof s.sha === "string" && /^[0-9a-f]{16}$/.test(s.sha) ? s : null;
  } catch {
    return null;
  }
}
// the PNG downloaded from a release, or null when the launcher still wears the one it was installed with
function storedPng(userData) {
  const s = readState(userData);
  if (!s) return null;
  const f = path.join(iconDir(userData), "icon-" + s.sha + ".png");
  return fs.existsSync(f) ? f : null;
}

// the shortcuts of this launcher on Windows: the two the installer makes, a pinned one, and any other on the desktop
function windowsShortcuts(app) {
  const out = [];
  const add = (f) => {
    if (!out.includes(f)) out.push(f);
  };
  const appData = app.getPath("appData"),
    desktop = app.getPath("desktop");
  add(path.join(desktop, "Naranxia.lnk"));
  add(path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Naranxia", "Naranxia.lnk"));
  add(path.join(appData, "Microsoft", "Internet Explorer", "Quick Launch", "User Pinned", "TaskBar", "Naranxia.lnk"));
  try {
    for (const f of fs.readdirSync(desktop)) if (/\.lnk$/i.test(f)) add(path.join(desktop, f));
  } catch {
    /* No readable desktop folder: the known places are enough. */
  }
  return out;
}

// point the window, the dock and the shortcuts at the stored picture; returns what was changed (for the test log)
function applyIcon({ platform, userData, app, shell, nativeImage, win, home, exe }) {
  const done = [];
  const png = storedPng(userData);
  if (!png) return done;
  const img = nativeImage.createFromPath(png);
  if (img.isEmpty()) return done;
  const sha = readState(userData).sha;
  try {
    if (platform === "darwin") {
      if (app.dock) {
        app.dock.setIcon(img);
        done.push("window");
      }
    } else if (win && !win.isDestroyed()) {
      win.setIcon(img);
      done.push("window");
    }
  } catch {
    /* The window keeps its picture. */
  }
  if (platform === "win32") {
    const ico = path.join(iconDir(userData), "icon-" + sha + ".ico");
    if (!fs.existsSync(ico)) {
      const list = ICO_SIZES.map((size) => ({
        size,
        png: img.resize({ width: size, height: size, quality: "best" }).toPNG(),
      }));
      fs.writeFileSync(ico + ".tmp", icoFromPngs(list));
      fs.renameSync(ico + ".tmp", ico);
    }
    for (const lnk of windowsShortcuts(app)) {
      try {
        if (!fs.existsSync(lnk)) continue;
        const cur = shell.readShortcutLink(lnk);
        if (String(cur.target || "").toLowerCase() !== String(exe).toLowerCase()) continue;
        if (String(cur.icon || "").toLowerCase() === ico.toLowerCase()) continue;
        /* a new file name each time: Windows keeps the old picture of a path it has already drawn */
        if (shell.writeShortcutLink(lnk, "update", { icon: ico, iconIndex: 0 })) done.push(lnk);
      } catch {
        /* Not a shortcut of ours, or not writable: left as it is. */
      }
    }
  } else if (platform === "linux") {
    const entry = path.join(home, ".local", "share", "applications", "naranxia.desktop");
    try {
      const text = fs.readFileSync(entry, "utf8"),
        next = desktopEntryWithIcon(text, png);
      if (next !== text) {
        fs.writeFileSync(entry + ".tmp", next);
        fs.renameSync(entry + ".tmp", entry);
        done.push(entry);
      }
    } catch {
      /* Not installed with install.sh: there is no menu entry to change. */
    }
  }
  /* the pictures of older releases are not needed any more */
  try {
    for (const f of fs.readdirSync(iconDir(userData)))
      if (/^icon-[0-9a-f]{16}\.(png|ico)$/.test(f) && !f.startsWith("icon-" + sha + "."))
        fs.unlinkSync(path.join(iconDir(userData), f));
  } catch {
    /* Old files may stay. */
  }
  return done;
}

// look at the latest release (rel: the GitHub API answer the updater already has) and take its icon.png when it changed.
// get(url, binary) downloads; env carries what applyIcon needs. Returns { changed, applied } or { why }.
async function syncIcon(rel, get, env) {
  const { userData, nativeImage } = env;
  const asset = ((rel && rel.assets) || []).find((a) => a && a.name === ASSET);
  if (!asset) return { changed: false, applied: applyIcon(env), why: "release has no " + ASSET };
  const key = asset.id + ":" + asset.updated_at,
    state = readState(userData);
  if (state && state.key === key && storedPng(userData)) return { changed: false, applied: applyIcon(env) };
  if (asset.size > MAX_BYTES) return { changed: false, applied: applyIcon(env), why: ASSET + " is too large" };
  const buf = await get(asset.browser_download_url, true);
  if (!isPng(buf) || buf.length > MAX_BYTES || nativeImage.createFromBuffer(buf).isEmpty())
    return { changed: false, applied: applyIcon(env), why: ASSET + " is not a PNG picture" };
  const sha = shaOf(buf),
    dir = iconDir(userData),
    file = path.join(dir, "icon-" + sha + ".png");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file + ".tmp", buf);
  fs.renameSync(file + ".tmp", file);
  fs.writeFileSync(path.join(dir, "icon.json.tmp"), JSON.stringify({ key, sha, at: new Date().toISOString() }));
  fs.renameSync(path.join(dir, "icon.json.tmp"), path.join(dir, "icon.json"));
  return { changed: !state || state.sha !== sha, applied: applyIcon(env) };
}

module.exports = { ASSET, isPng, icoFromPngs, desktopEntryWithIcon, storedPng, windowsShortcuts, applyIcon, syncIcon };
