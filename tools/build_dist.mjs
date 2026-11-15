// dist/naranxia_readable.html -> dist/naranxia_min.html (minified) + dist/naranxia.html (minified, gzip+base64, unpacked at load)
// run from the repo root (tools/build.sh --dist does it)
import fs from "fs";
import zlib from "zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify } from "terser";
import zopfli from "@gfx/zopfli";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  dist = path.join(root, "dist");
const html = fs.readFileSync(path.join(dist, "naranxia_readable.html"), "utf8");
const open = "<script>\n",
  i0 = html.indexOf(open),
  i1 = html.lastIndexOf("</script>");
if (i0 < 0 || i1 < i0) throw new Error("readable build is missing its inline game script");
const head = html.slice(0, i0),
  code = html.slice(i0 + open.length, i1),
  tail = html.slice(i1);
const V = fs.readFileSync(path.join(root, "game", "VERSION"), "utf8").trim();
if (!/^v\d+$/.test(V)) throw new Error(`Invalid game/VERSION: ${V}`);
const r = await minify(code, {
  ecma: 2020,
  toplevel: false,
  compress: {
    passes: 2,
    keep_fargs: true,
    keep_infinity: true,
    pure_getters: false,
    unsafe: false,
    unsafe_math: false,
    typeofs: false,
    hoist_funs: false,
    reduce_funcs: false,
    sequences: true,
    drop_console: false,
  },
  mangle: { toplevel: false, keep_fnames: false },
  format: { comments: false, ascii_only: false, semicolons: true },
});
const min = r.code;
// a minified line must never contain the closing tag of its <script> element
if (/<\/script/i.test(min)) throw new Error("script close tag inside code");
const headMin = head.replace(
  '<html lang="en">',
  '<html lang="en"><!-- Naranxia ' + V + " - optimized build. Readable source: Naranxia_" + V + "_source.html -->",
);
fs.writeFileSync(path.join(dist, "naranxia_min.html"), headMin + open + min + "\n" + tail);
// zopfli gzip (better ratio than zlib -9), checked by a round trip
let gz;
try {
  gz = Buffer.from(await zopfli.gzipAsync(Buffer.from(min, "utf8"), { numiterations: 15 }));
} catch {
  gz = zlib.gzipSync(min, { level: 9 });
}
if (zlib.gunzipSync(gz).toString("utf8") !== min) throw new Error("gzip round trip failed");
const b64 = gz.toString("base64");
const loader =
  "(()=>{const e=document.getElementById('nxz'),f=m=>document.body.insertAdjacentHTML('beforeend','<div style=\"position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:#141018;color:#f0e6d0;font:16px Georgia,serif;padding:24px;text-align:center\">'+m+'</div>');" +
  "if(!window.DecompressionStream||!window.Blob||!Blob.prototype.stream){f('This browser is too old to unpack the game. Please update it, or open Naranxia_" +
  V +
  "_source.html.');return}" +
  "let d=0;const u=()=>{if(d)return;d=1;try{const b=Uint8Array.from(atob(e.textContent.trim()),c=>c.charCodeAt(0));new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text().then(t=>{e.remove();const s=document.createElement('script');s.textContent=t;document.body.appendChild(s)}).catch(x=>f('Could not unpack the game: '+x))}catch(x){f('Could not unpack the game: '+x)}};" +
  // unpack only once the launch splash has been painted (two animation frames), so the intro starts before the heavy work; a hidden tab gets no frame: timer fallback; the headless tests unpack at once, as before
  "if(navigator.webdriver&&!window.__nxBootReal)u();else{requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(u,0)));setTimeout(u,700)}})();";
const headPack = head.replace(
  '<html lang="en">',
  '<html lang="en"><!-- Naranxia ' +
    V +
    " - compressed build (the game code is gzip+base64 below and unpacks itself at load). Readable source: Naranxia_" +
    V +
    "_source.html -->",
);
fs.writeFileSync(
  path.join(dist, "naranxia.html"),
  headPack + '<script type="text/plain" id="nxz">' + b64 + "</script>\n<script>" + loader + "</script></body></html>\n",
);
const sz = (f) => fs.statSync(path.join(dist, f)).size;
console.log(
  JSON.stringify({
    version: V,
    readable: sz("naranxia_readable.html"),
    minified: sz("naranxia_min.html"),
    packed: sz("naranxia.html"),
    code: code.length,
    min: min.length,
    gzip: gz.length,
    b64: b64.length,
  }),
);
