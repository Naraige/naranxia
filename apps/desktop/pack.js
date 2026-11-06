const fs = require('fs');
const os = require('os');
const path = require('path');
const { packager } = require('@electron/packager');

const root = path.resolve(__dirname, '../..');
const source = path.join(__dirname, 'src');
const bundle = path.join(root, 'dist', 'naranxia.html');
const out = path.join(__dirname, 'dist');
const platforms = (process.argv[2] || 'linux:x64').split(',').map(s => s.split(':'));

(async () => {
  if (!fs.existsSync(bundle)) {
    throw new Error(`Missing browser build ${bundle}; run the root release build first.`);
  }

  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'naranxia-desktop-'));
  try {
    fs.cpSync(source, stage, { recursive: true });
    fs.copyFileSync(require.resolve('three/build/three.min.js'), path.join(stage, 'three.min.js'));
    fs.mkdirSync(path.join(stage, 'game'), { recursive: true });
    fs.copyFileSync(bundle, path.join(stage, 'game', 'naranxia.html'));

    for (const [platform, arch] of platforms) {
      const icon = platform === 'darwin' ? 'icon.icns' : platform === 'win32' ? 'icon.ico' : null;
      const built = await packager({
        dir: stage,
        out,
        platform,
        arch,
        overwrite: true,
        asar: false,
        prune: true,
        electronVersion: require('electron/package.json').version,
        name: 'Naranxia',
        executableName: platform === 'linux' ? 'naranxia' : 'Naranxia',
        appBundleId: 'com.naranxia.game',
        appCopyright: 'Naranxia clan',
        ...(icon ? { icon: path.join(__dirname, icon) } : {}),
        win32metadata: { CompanyName: 'Naranxia', ProductName: 'Naranxia', FileDescription: 'Naranxia' }
      });
      if (!built.length) {
        throw new Error(`No ${platform}:${arch} package was created. Check Electron Packager's host requirements.`);
      }
      console.log('built', built);
    }
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
})().catch(e => {
  console.error('ERR', e.message);
  process.exit(1);
});
