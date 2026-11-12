/* The release notes (game/NOTES.md) as the Update page draws them: one entry per non-empty line.
   h = section heading (a line written **Title** or # Title), b = bullet (a line starting with - or *), t = the text without any
   Markdown marker. Each t is a translation key, looked up whole. tools/textaudit.mjs uses this same function to refuse a release
   whose notes are not translated, so keep it free of imports. */
export function notesLines(md) {
  const out = [];
  for (let s of String(md || '').split('\n')) {
    s = s.trim(); if (!s) continue;
    const m = /^\*\*(.+?)\*\*:?$/.exec(s) || /^#{1,6}\s+(.+)$/.exec(s);
    let b = false;
    if (m) s = m[1]; else if (/^(?:[-+]\s*|\*\s+)/.test(s)) { b = true; s = s.replace(/^(?:[-+]\s*|\*\s+)/, '') }
    s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|__|`/g, '').trim();
    if (s) out.push({ t: s, h: !!m, b });
  }
  return out;
}
