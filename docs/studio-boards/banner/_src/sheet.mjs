/* fast art check without loading the game: bundles rendering/banner-icon.js alone (3D and UI modules stubbed) and draws every
   emblem x variant in a blank headless page.  node docs/studio-boards/banner/_src/sheet.mjs && python3 docs/studio-boards/banner/_src/sheet.py  -> _src/sheet.png */
import { build } from "esbuild";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const D = path.dirname(fileURLToPath(import.meta.url)),
  ROOT = path.resolve(D, "../../../.."),
  SRC = path.join(ROOT, "packages/game/src");
const stub = {
  name: "stub",
  setup(b) {
    b.onResolve({ filter: /(structures|drawing|icons)\.js$/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents:
        "export const BANNER=null,bannerTex={},IC={},thIcons=()=>{},ICN=()=>({}),circ=()=>{},ln=()=>{},poly=()=>{},rrg=()=>{};",
    }));
  },
};
const r = await build({
  stdin: {
    contents: `import {bannerIcon} from './rendering/banner-icon.js';import {THEME,initializeKingdomTheme} from './ui/kingdom-theme.js';initializeKingdomTheme();window.bannerIcon=bannerIcon;window.TH=()=>THEME;`,
    resolveDir: SRC,
  },
  bundle: true,
  write: false,
  format: "iife",
  plugins: [stub],
});
fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist/banner_bundle.js"), r.outputFiles[0].text);
console.log("dist/banner_bundle.js");
