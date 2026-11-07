import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const game = path.join(root, 'packages', 'game');
const out = path.join(root, 'dist');
const version = (await fs.readFile(path.join(root, 'game', 'VERSION'), 'utf8')).trim();
if (!/^v\d+$/.test(version)) throw new Error(`Invalid game/VERSION: ${version}`);
const notes = await fs.readFile(path.join(root, 'game', 'NOTES.md'), 'utf8').catch(() => '');
await fs.mkdir(out, { recursive: true });

const entry = path.join(game, 'src', 'main.js');
const htmlPath = path.join(game, 'index.html');
const htmlSource = await fs.readFile(htmlPath, 'utf8');
const scriptTag = '<script type="module" src="./src/main.js"></script>';
const styleTag = '<link rel="stylesheet" href="./src/styles/game.css">';
if (htmlSource.split(scriptTag).length !== 2) {
  throw new Error(`Expected one ${scriptTag} in packages/game/index.html`);
}
if (htmlSource.split(styleTag).length !== 2) {
  throw new Error(`Expected one ${styleTag} in packages/game/index.html`);
}

const [js, css] = await Promise.all([
  build({
    entryPoints: [entry], outfile: path.join(out, 'naranxia-bundle.js'), bundle: true, write: false, platform: 'browser',
    format: 'iife', target: ['es2020'], define: { __NX_VERSION__: JSON.stringify(version), __NX_NOTES__: JSON.stringify(notes.trim()) },
    legalComments: 'none', charset: 'utf8', logLevel: 'warning',
  }),
  build({
    entryPoints: [path.join(game, 'src', 'styles', 'game.css')], outfile: path.join(out, 'naranxia-bundle.css'), bundle: true, write: false,
    platform: 'browser', loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.png': 'dataurl' },
    legalComments: 'none', logLevel: 'warning',
  }),
]);
const script = js.outputFiles[0]?.text;
const style = css.outputFiles[0]?.text;
if (!script || !style) throw new Error('Build did not produce bundled JavaScript and CSS');
if (/^\s*(?:import|export)\s/m.test(script)) {
  throw new Error('Browser game bundle contains module syntax; expected a classic standalone script');
}
if (script.includes('__NX_VERSION__')) throw new Error('Build did not substitute __NX_VERSION__ from game/VERSION');
if (/<\/script/i.test(script)) throw new Error('Game bundle contains a closing script tag');

const title = `Naranxia ${version}`;
let html = htmlSource
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(styleTag, () => `<style>\n${style}\n</style>`)
  .replace(scriptTag, () => `<script>\n${script}\n</script>`);
await fs.writeFile(path.join(out, 'naranxia_readable.html'), html, 'utf8');
console.log(`Built dist/naranxia_readable.html (${version})`);
