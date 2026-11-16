import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "dist/test-faults");
await fs.mkdir(directory, { recursive: true });
const html = await fs.readFile(path.join(root, "dist/naranxia_readable.html"), "utf8");
const begin = html.indexOf("<script>\n"),
  end = html.lastIndexOf("</script>");
if (begin < 0 || end < begin) throw new Error("Readable build has no game script");
const cases = [
  { id: "control", file: "", from: "", to: "", test: "command_contract" },
  {
    id: "ownership",
    file: "multiplayer/commands.js",
    from: "setPl(mine ? LPL() : 1 - LPL());",
    to: "setPl(LPL());",
    test: "command_contract",
  },
  {
    id: "dropped-command",
    file: "multiplayer/commands.js",
    from: "export const mpPush = (c) => MP.out.push(c);",
    to: "export const mpPush = (c) => 0;",
    test: "command_contract",
  },
  {
    id: "damage",
    file: "gameplay/rules.js",
    from: "spearman: { r: 7, hp: 85, spd: 108, dmg: 11,",
    to: "spearman: { r: 7, hp: 85, spd: 108, dmg: 1,",
    test: "spearman",
  },
  {
    id: "trap-damage",
    file: "gameplay/traps.js",
    from: "(14 + 0.5 * sessionState.waveN) * 0.5",
    to: "(140 + 0.5 * sessionState.waveN) * 0.5",
    test: "traps",
  },
  { id: "sapper-repair", file: "gameplay/simulation.js", from: "x.hp + dt * 2", to: "x.hp + dt * 0", test: "bastion" },
  { id: "frost-damage", file: "ai/wave-boss.js", from: "(8 + wn * 0.8)", to: "(0 + wn * 0.8)", test: "bossabil" },
  {
    id: "save-traps",
    file: "persistence/save-format.js",
    from: "export function svAssign(k, v) {",
    to: 'export function svAssign(k, v) { if(k === "SPK") return;',
    test: "save",
  },
  {
    id: "save-terrain",
    file: "persistence/save-format.js",
    from: "if (v && v.length === c.length) c.set(v);",
    to: 'if (v && v.length === c.length) { c.set(v); if(k === "HT") c[3] ^= 1; }',
    test: "save",
  },
  {
    id: "ui-demolition",
    file: "gameplay/traps.js",
    from: "    return true;\n  }\n  SPK.delete(i);",
    to: "    return true;\n  }\n  SPK.has(i);",
    test: "trap_controls",
  },
  {
    id: "trap-mesh-invalidation",
    file: "gameplay/traps.js",
    from: "SPO.delete(i);\n  objectivesState.SPKV++;",
    to: "SPO.delete(i);",
    test: "trap_controls",
  },
  {
    id: "startup-curtain",
    file: "core/boot.js",
    from: 'el.classList.add("done");\n    setTimeout(() => el.remove(), 1300);',
    to: "void el;",
    test: "trap_controls",
  },
  {
    id: "wave-water",
    file: "gameplay/swarm.js",
    from: "if (gho || ter[ti] > 0) ph = true;",
    to: "if (gho || ter[ti] > 0) ph = false;",
    test: "waves",
  },
];
for (const fault of cases) {
  let edits = 0;
  const bundle = await build({
    entryPoints: [path.join(root, "packages/game/src/main.js")],
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    target: "es2020",
    define: {
      __NX_VERSION__: JSON.stringify((await fs.readFile(path.join(root, "game/VERSION"), "utf8")).trim()),
      __NX_NOTES__: JSON.stringify((await fs.readFile(path.join(root, "game/NOTES.md"), "utf8")).trim()),
    },
    plugins: [
      {
        name: "fault",
        setup(b) {
          b.onLoad({ filter: /\.js$/ }, async ({ path: file }) => {
            if (!fault.file || !file.replaceAll("\\", "/").endsWith(fault.file)) return;
            const source = await fs.readFile(file, "utf8");
            if (source.split(fault.from).length !== 2)
              throw new Error(`${fault.id}: expected exactly one mutation site`);
            edits++;
            return { contents: source.replace(fault.from, fault.to), loader: "js" };
          });
        },
      },
    ],
  });
  if (edits !== (fault.file ? 1 : 0)) throw new Error(`${fault.id}: mutation was not applied`);
  await fs.writeFile(
    path.join(directory, fault.id + ".html"),
    html.slice(0, begin) + "<script>\n" + bundle.outputFiles[0].text + "\n" + html.slice(end),
  );
}
await fs.writeFile(path.join(directory, "manifest.json"), JSON.stringify(cases));
