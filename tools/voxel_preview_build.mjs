import { build } from "esbuild";
await build({
  entryPoints: ["tools/voxel_preview_entry.js"],
  bundle: true,
  format: "iife",
  outfile: process.argv[2],
  logLevel: "error",
  define: { __NX_VERSION__: '"dev"', __NX_NOTES__: '""' },
});
