import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = readFileSync(path.join(root, 'game', 'VERSION'), 'utf8').trim();
let notes = '';
try { notes = readFileSync(path.join(root, 'game', 'NOTES.md'), 'utf8').trim() } catch { /* The dev title page works with no release notes. */ }

export default defineConfig({
  root: path.join(root, 'packages', 'game'),
  define: { __NX_VERSION__: JSON.stringify(version), __NX_NOTES__: JSON.stringify(notes) },
  server: { host: '127.0.0.1' },
  plugins: [{
    name: 'naranxia-versioned-title',
    transformIndexHtml(html) {
      return html.replace('<title>Naranxia</title>', `<title>Naranxia ${version}</title>`);
    },
  }],
});
