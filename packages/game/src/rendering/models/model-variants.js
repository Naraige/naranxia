/* ---- Hammerdawn Studio "model" boards: look-variant selector (visual only, no gameplay, no simulation state) ----
   Pick a variant with  window.__MV = 'scout:B,king:C,guard:A,engineer:B,envoy:A,observatory:C,forge:C,granary:C,sanctuary:C'
   (comma or space separated, key:LETTER, letters A / B / C). A key that is absent keeps the production model.
   Once the King has chosen, put the letters in MV_DEFAULT below (e.g. {scout:'B'}) and delete the variants he refused.
   Models are cached after the first build: set __MV before the first model is made (page load) or clear the caches. */
export const MV_DEFAULT = { scout: 'B', engineer: 'B', envoy: 'B' };

export function mvGet(key) {
  try {
    const raw = typeof window !== 'undefined' ? window.__MV : null;
    if (raw) { for (const p of String(raw).split(/[\s,;]+/)) { const [k, v] = p.split(':'); if (k === key && /^[ABC]$/.test(v)) return v } }
  } catch (e) { /* no window: production look */ }
  return MV_DEFAULT[key] || null;
}

/* building function -> roof colour and glow (economy green, defence blue, war red, city gold) */
export const MV_FUNC = { granary: 'eco', orchard: 'eco', observatory: 'def', beacon: 'def', bell: 'def', sappers: 'war', forge: 'war', warroom: 'war', sanctuary: 'city', embassy: 'city' };
export const MV_COL = {
  eco: { roof: ['#4f8a3a', '#467d34', '#5a9644'], cloth: '#3f9a45', glow: '#6ee03a', dark: '#2f6e35' },
  def: { roof: ['#2f5d86', '#3a6b97', '#2a4f75'], cloth: '#3a78c2', glow: '#3aa0ff', dark: '#24507c' },
  war: { roof: ['#a8382c', '#962f25', '#872a21'], cloth: '#c0382e', glow: '#ff5a1e', dark: '#7a2a24' },
  city: { roof: ['#e0b83e', '#d2a935', '#c49a2c'], cloth: '#e8c040', glow: '#ffcc2a', dark: '#a8801e' },
};

/* roof colours of a bastion building: variant A / B / C recolour by function, no variant keeps `dflt` */
export function mvRoof(key, dflt) {
  if (!mvGet(key)) return dflt;
  const f = MV_FUNC[key];
  return f ? MV_COL[f].roof : dflt;
}

/* tall landmark standing on the grass behind the building, one unique topper per building.
   A: pennant mast. B: long hanging banner with a glyph. C: lantern pillar glowing in the function colour. */
export function mvMarker(G, key, P) {
  const v = mvGet(key); if (!v) return;
  const { bP, bM, bL, bC, bS, bW } = P, f = MV_FUNC[key] || 'def', c = MV_COL[f];
  const X = key === 'sanctuary' || key === 'granary' ? 1.9 : 1.84, Z = .2, base = .1;
  const top = (x, y, z) => { /* unique topper */
    if (key === 'observatory') { bM(G, x, y, z, .26, .05, .05, '#e8c873'); bM(G, x, y, z, .05, .05, .26, '#e8c873'); bL(G, x, y + .05, z, .1, .1, .1, '#cfeeff'); bM(G, x, y + .15, z, .05, .16, .05, '#e8c873') }
    else if (key === 'granary') { for (const d of [-.1, 0, .1]) { bM(G, x + d, y, z, .04, .24 - Math.abs(d), .04, '#d8b23a'); bC(G, x + d, y + .24 - Math.abs(d), z, .08, .12, .08, '#e8c860') } bM(G, x, y - .02, z, .26, .05, .06, '#8a5a2a') }
    else if (key === 'sanctuary') { bM(G, x, y, z, .24, .24, .05, '#e8c873'); bL(G, x, y + .04, z, .16, .16, .06, '#fff2b0'); for (const [dx, dy] of [[0, .2], [0, -.06], [.19, .07], [-.19, .07]]) bM(G, x + dx, y + .08 + dy, z, .06, .06, .05, '#e8c873') }
    else if (key === 'forge') { bM(G, x, y, z, .18, .08, .18, '#3b3b45'); bL(G, x, y + .08, z, .12, .14, .12, '#ff9a2a'); bL(G, x, y + .22, z, .08, .12, .08, '#ffd25a'); for (let k = 0; k < 4; k++) bP(G, x + .04 * (k % 2 ? 1 : -1) + k * .02, y + .36 + k * .17, z, .14 + k * .04, .13, .14 + k * .04, k < 2 ? '#6a6a72' : '#8a8a92') }
    else { bM(G, x, y, z, .16, .16, .16, '#e8c873'); bL(G, x, y + .16, z, .1, .1, .1, c.glow) }
  };
  if (v === 'A') {
    bP(G, X, base, Z, .05, 2.2, .05, '#3b3b45'); bM(G, X, base + 2.2, Z, .09, .05, .09, '#e8c873');
    bC(G, X - .2, base + 1.86, Z, .34, .2, .03, c.cloth); bC(G, X - .5, base + 1.9, Z, .26, .12, .03, c.cloth); bC(G, X - .6, base + 1.98, Z, .08, .05, .03, c.dark);
    top(X, base + 2.26, Z);
  } else if (v === 'B') {
    bP(G, X, base, Z, .06, 2.0, .06, '#3b3b45'); bM(G, X - .2, base + 1.9, Z, .5, .05, .05, '#e8c873'); bM(G, X, base + 2.0, Z, .1, .06, .1, '#e8c873');
    bC(G, X - .2, base + 1.1, Z, .34, .8, .03, c.cloth); bC(G, X - .2, base + 1.1, Z, .34, .1, .035, c.dark); bC(G, X - .2, base + 1.0, Z, .12, .1, .035, c.cloth);
    bL(G, X - .2, base + 1.45, Z, .16, .16, .04, c.glow);
    top(X, base + 2.06, Z);
  } else {
    bS(G, X, base, Z, .24, .18, .24, '#9b8565'); bM(G, X, base + .18, Z, .07, 2.0, .07, '#c9a24f');
    bM(G, X, base + 1.3, Z, .2, .05, .2, '#c9a24f'); bL(G, X, base + 1.35, Z, .3, .46, .3, c.glow); bM(G, X, base + 1.81, Z, .32, .05, .32, '#c9a24f'); bM(G, X, base + 2.18, Z, .13, .05, .13, '#c9a24f');
    top(X, base + 2.23, Z);
  }
}
