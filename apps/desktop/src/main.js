// Naranxia desktop launcher: checks GitHub for a newer game build at every launch,
// keeps the game playable offline, and stores save files in the user's app-data folder.
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const BUNDLED = path.join(__dirname, 'game', 'naranxia.html');
const THREE = path.join(__dirname, 'three.min.js');
const UD = () => app.getPath('userData');
const GDIR = () => path.join(UD(), 'game');
const SDIR = () => path.join(UD(), 'saves');
const CDN_THREE = /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js"><\/script>/;

const vnum = v => { const m = String(v || '').match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/); return m ? [+m[1], +(m[2] || 0), +(m[3] || 0)] : [0, 0, 0]; };
const newer = (a, b) => { const x = vnum(a), y = vnum(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
const verOfHtml = html => { const m = html.match(/<title>Naranxia (v[\d.]+)/); return m ? m[1] : 'v0'; };

function readInstalled() {
  try { return JSON.parse(fs.readFileSync(path.join(GDIR(), 'version.json'), 'utf8')); } catch { return null; }
}
// writes a game build into app-data, pointing three.js at the bundled offline copy
function install(html, ver) {
  fs.mkdirSync(GDIR(), { recursive: true });
  const out = html.replace(CDN_THREE, '<script src="three.min.js"></script>');
  fs.writeFileSync(path.join(GDIR(), 'index.html.tmp'), out);
  fs.renameSync(path.join(GDIR(), 'index.html.tmp'), path.join(GDIR(), 'index.html'));
  fs.copyFileSync(THREE, path.join(GDIR(), 'three.min.js'));
  fs.writeFileSync(path.join(GDIR(), 'version.json'), JSON.stringify({ version: ver, at: new Date().toISOString() }));
}
function ensureInstalled() {
  const bundledHtml = fs.readFileSync(BUNDLED, 'utf8'), bv = verOfHtml(bundledHtml), cur = readInstalled();
  if (!cur || newer(bv, cur.version) || !fs.existsSync(path.join(GDIR(), 'index.html'))) install(bundledHtml, bv);
  return readInstalled().version;
}

function get(url, binary, redirects = 5) {
  return new Promise((res, rej) => {
    const req = (url.startsWith('http:') ? http : https).get(url, { headers: { 'User-Agent': 'Naranxia-Launcher', Accept: binary ? 'application/octet-stream' : 'application/vnd.github+json' }, timeout: 8000 }, r => {
      if ([301, 302, 303, 307, 308].includes(r.statusCode) && r.headers.location && redirects > 0) { r.resume(); return res(get(r.headers.location, binary, redirects - 1)); }
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
      const ch = []; r.on('data', c => ch.push(c)); r.on('end', () => res(Buffer.concat(ch)));
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', rej);
  });
}

let win = null;
const status = (msg, p) => { if (process.env.NARX_TEST) fs.appendFileSync(process.env.NARX_TEST, msg + '\n'); if (win && !win.isDestroyed()) win.webContents.send('upd', { msg, p }); };

async function checkUpdate(curVer) {
  if (!CFG.repo || CFG.repo.includes('YOUR_')) return { ok: false, why: 'no repo configured' };
  const api = CFG.api || 'https://api.github.com';
  const rel = JSON.parse((await get(`${api}/repos/${CFG.repo}/releases/latest`)).toString('utf8'));
  const tag = rel.tag_name || rel.name;
  if (!newer(tag, curVer)) return { ok: true, latest: tag, updated: false };
  const asset = (rel.assets || []).find(a => /\.html$/i.test(a.name));
  if (!asset) return { ok: false, why: 'release has no .html asset' };
  status('Downloading ' + tag + '...', .5);
  const html = (await get(asset.browser_download_url, true)).toString('utf8');
  if (!/<title>Naranxia/.test(html)) return { ok: false, why: 'download is not a Naranxia build' };
  install(html, tag);
  return { ok: true, latest: tag, updated: true, notes: rel.body || '' };
}

function createWindow() {
  try { CFG = Object.assign(CFG, JSON.parse(fs.readFileSync(path.join(UD(), 'config.json'), 'utf8'))); } catch { /* Missing or invalid user config keeps the packaged defaults. */ }
  win = new BrowserWindow({
    width: 1400, height: 860, minWidth: 900, minHeight: 560, backgroundColor: '#0d1220', show: false,
    title: 'Naranxia', icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, 'launcher.html'));
  win.webContents.on('before-input-event', (e, i) => { if (i.type === 'keyDown' && i.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); } });
  win.webContents.once('did-finish-load', async () => {
    let ver = ensureInstalled(), info;
    status('Checking for updates...', .2);
    try { info = await checkUpdate(ver); } catch (e) { info = { ok: false, why: e.message }; }
    if (info && info.updated) { ver = info.latest; status('Updated to ' + ver, 1); await new Promise(r => setTimeout(r, 900)); }
    else status(info && info.ok ? 'Up to date (' + ver + ')' : 'Offline - playing ' + ver, 1);
    await new Promise(r => setTimeout(r, 350));
    win.loadFile(path.join(GDIR(), 'index.html'));
    if (process.env.NARX_TEST_JS) win.webContents.once('did-finish-load', () => setTimeout(async () => {
      let r; try { r = await win.webContents.executeJavaScript(fs.readFileSync(process.env.NARX_TEST_JS, 'utf8')); } catch (e) { r = 'ERR ' + e.message; }
      fs.appendFileSync(process.env.NARX_TEST, 'JS ' + r + '\n');
      try { const img = await win.webContents.capturePage(); fs.writeFileSync(process.env.NARX_TEST + '.png', img.toPNG()); } catch { /* A captured test screenshot is optional; the game result is already recorded. */ }
      app.quit();
    }, 6000));
  });
}

// ---- save files: one JSON file per slot in <app-data>/saves ----
const slotFile = n => path.join(SDIR(), String(n).replace(/[^\w\- ]/g, '_').slice(0, 60) + '.nxs');
ipcMain.handle('save:write', (e, name, data) => { fs.mkdirSync(SDIR(), { recursive: true }); const f = slotFile(name); fs.writeFileSync(f + '.tmp', data); fs.renameSync(f + '.tmp', f); return true; });
ipcMain.handle('save:read', (e, name) => { try { return fs.readFileSync(slotFile(name), 'utf8'); } catch { return null; } });
ipcMain.handle('save:list', () => { try { return fs.readdirSync(SDIR()).filter(f => f.endsWith('.nxs')).map(f => { const s = fs.statSync(path.join(SDIR(), f)); return { name: f.slice(0, -4), t: s.mtimeMs, size: s.size }; }).sort((a, b) => b.t - a.t); } catch { return []; } });
ipcMain.handle('save:del', (e, name) => { try { fs.unlinkSync(slotFile(name)); } catch { /* Deletion is best-effort; list still exposes a file that remains. */ } return true; });
ipcMain.handle('save:folder', () => { fs.mkdirSync(SDIR(), { recursive: true }); shell.openPath(SDIR()); return true; });
ipcMain.handle('app:info', () => ({ version: (readInstalled() || {}).version, launcher: app.getVersion(), platform: process.platform }));

/* the launcher may play the title music without waiting for a click (a browser never allows it) */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
