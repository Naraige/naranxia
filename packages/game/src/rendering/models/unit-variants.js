/* ---- Hammerdawn Studio "model" boards: unit look variants A / B / C (see model-variants.js for the selector) ----
   scout, engineer, envoy: replace the production kit (boxes only, the King picks the look before any pixel texturing).
   king, guard: drawn on top of the production kit (taller crown / flat crest + pavois).
   Voxel units as in units.js (1 unit = 2 px, y up, front = +z). Visual only. */
import { bxc, geometryState, newG, toGeo } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { thd, thp } from '../../ui/kingdom-theme.js';
import { mcHead, mcLimbs, mcTorso, VX } from './unit-parts.js';

const skin = '#c68a5e';
const LT = '#6b4423', LT2 = '#4a2e16', LT3 = '#8a5a32', BR = '#c39a45', BR2 = '#e2c06a', GD = '#d4a234', GD2 = '#ecc964', GDD = '#9a6e1e', STL = '#9aa3b0', STL2 = '#cfd6e0';

function kit(P, hkPut) {
  const { G, HG, LA, LG, AG } = P;
  return {
    G, HG, LA, LG, AG,
    t: hkPut(G, 0), tm: hkPut(G, 4), tc: hkPut(G, 7), tg: hkPut(G, 5),
    hd: hkPut(HG, 0), hm: hkPut(HG, 4), hc: hkPut(HG, 7), hg: hkPut(HG, 5),
    k: hkPut(LG, 0), km: hkPut(LG, 4),
    AE: (m, dx, y, z, w, h, d, c) => hkPut(AG, m)(dx, y, z, w, h, d, c),
    AW: (m, dx, y, z, w, h, d, c) => hkPut(LA, m)(-2.76 - dx, y + 10.45, z, w, h, d, c),
    A: (m, dx, y, z, w, h, d, c) => { hkPut(AG, m)(dx, y, z, w, h, d, c); hkPut(LA, m)(-2.76 - dx, y + 10.45, z, w, h, d, c) },
  };
}

/* ======================= 1. SCOUT: beige coat, pack, spyglass (the archer keeps the green hood) ======================= */
function scout(v, P, hkPut) {
  const { G, LG, AG, t, tm, tc, hc, hd, AE } = kit(P, hkPut), BG = '#cdb98f', BD = '#a8946c', BG2 = '#b8a47c';
  mcTorso(G, { shirt: '#8a7a58', belt: LT2 }); mcLimbs(G, LG, AG, { pants: '#5a4a32', sleeve: '#8a7a58', hand: skin, shoes: '#3a2a18' }); mcHead(G, skin, '#5a3a1a');
  const glass = (z0) => { AE(0, 0, -5.6, z0, .64, 5.6, .64, '#7a5a34'); AE(4, 0, -1.4, z0, .86, 1.7, .86, BR); AE(4, 0, -3.9, z0, .78, .45, .78, BR); AE(4, 0, -5.7, z0, .74, .45, .74, BR); AE(5, 0, .3, z0, .6, .14, .6, '#9ad8ff') };
  if (v === 'A') { /* short mantle, satchel + bedroll, flat cap with a feather */
    tc(0, 7.5, 0, 4.4, 3.0, 2.4, BG); tc(0, 7.35, 0, 4.44, .24, 2.44, BD); tc(0, 10.2, 0, 4.7, .7, 2.7, BD); tc(0, 5.0, -1.2, 4.2, 5.4, .18, BG); tc(0, 4.9, -1.22, 4.26, .24, .2, BD);
    t(0, 5.0, -2.2, 3.6, 4.0, 1.6, LT); t(0, 8.7, -2.2, 3.7, .6, 1.8, LT2); tm(0, 8.4, -3.05, .5, .5, .1, BR); tc(0, 9.7, -2.2, 4.2, 1.1, 1.3, '#a89a74'); tc(0, 10.25, -2.2, 4.3, .2, 1.4, LT2);
    t(1.45, 5.0, 1.0, .3, 5.6, .16, LT2); t(-1.45, 5.0, 1.0, .3, 5.6, .16, LT2);
    hc(0, 14.05, 0, 4.15, .75, 4.15, LT); hc(0, 13.85, 2.1, 4.15, .22, 1.4, LT2); hc(0, 14.0, 0, 4.25, .24, 4.25, LT2); hc(1.6, 14.4, -.4, .3, 1.7, .3, '#e8e0c4'); hc(1.9, 15.5, -.9, .26, .8, .5, '#cfc7aa'); glass(1.2);
  } else if (v === 'B') { /* long coat, tall frame pack with a bedroll above the head line, goggles pushed up */
    tc(0, 7.6, 0, 4.4, 2.9, 2.4, BG); tc(0, 10.2, 0, 4.7, .7, 2.7, BG2); tc(0, 3.3, 0, 4.36, 2.4, 2.4, BG); tc(0, 3.3, 0, 4.4, .24, 2.44, BD); tc(0, 3.2, 1.22, .3, 2.5, .08, BD); tc(0, 5.3, 0, 4.5, .35, 2.5, LT2); tm(0, 5.28, 1.26, .6, .5, .08, BR);
    t(0, 5.0, -2.3, 3.4, 7.2, 1.8, LT); t(0, 5.0, -3.25, 3.8, 1.2, .2, LT2); t(0, 8.8, -3.25, 3.8, 1.2, .2, LT2); t(1.3, 5.0, 1.0, .3, 5.9, .16, LT2); t(-1.3, 5.0, 1.0, .3, 5.9, .16, LT2);
    tc(0, 12.2, -2.3, 4.6, 1.5, 1.7, '#a89a74'); tc(0, 13.0, -2.3, 4.7, .22, 1.8, LT2); t(1.5, 5.6, -3.4, 1.2, 1.2, .8, '#6a6a72'); t(-1.5, 6.4, -3.4, .8, 2.4, .8, '#7a5a34');
    tc(0, 10.4, 0, 4.5, 1.0, 2.6, '#8a3a32'); hc(0, 13.6, 0, 4.1, .55, 4.1, '#5a3a1a'); hd(0, 13.1, 1.5, 4.1, .6, .6, LT2);
    hd(0, 13.45, 2.1, 3.6, .7, .16, '#3a3a40'); hd(-.95, 13.45, 2.2, 1.0, .5, .08, '#9ad8ff'); hd(.95, 13.45, 2.2, 1.0, .5, .08, '#9ad8ff'); glass(1.0);
  } else { /* poncho, wide straw hat, hip pouch, spyglass slung across the back */
    tc(0, 6.6, 0, 4.7, 4.0, 2.7, BG); tc(0, 6.5, 0, 4.76, .4, 2.76, BD); tc(0, 10.35, 0, 4.9, .6, 2.9, BD); tc(0, 4.8, -1.4, 4.6, 5.8, .2, BG); for (let i = 0; i < 6; i++) tc(-2.0 + i * .8, 6.1, 1.38, .3, .4, .06, BD);
    t(-1.4, 4.4, 1.2, 1.4, 1.5, .9, LT); tm(-1.4, 5.7, 1.62, .4, .3, .06, BR);
    for (let i = 0; i < 8; i++) t(-1.5 + i * .42, 5.0 + i * .95, -1.9, .72, .95, .72, i % 3 === 0 ? BR : '#7a5a34');
    t(1.3, 12.6, -1.9, .9, .9, .8, STL2); t(0, 4.8, -2.0, 2.8, 2.4, 1.1, LT2);
    hc(0, 13.9, 0, 7.8, .3, 7.8, '#c9ab62'); hc(0, 14.2, 0, 4.2, 1.2, 4.2, '#b8984e'); hc(0, 14.25, 0, 4.3, .36, 4.3, LT2); hc(0, 13.85, 0, 7.9, .1, 7.9, '#a8884a'); glass(1.2);
  }
  return { h: v === 'B' ? 17.6 : v === 'C' ? 16 : 15.8 };
}

/* ======================= 3a. ENGINEER: leather apron + big hammer ======================= */
function engineer(v, P, hkPut) {
  const { G, LG, AG, t, tm, tc, hc, hd, AE } = kit(P, hkPut), HH = '#d8b04a', AP = LT3;
  mcTorso(G, { shirt: v === 'C' ? '#4a4038' : '#6a5a46', belt: LT2 });
  mcLimbs(G, LG, AG, { pants: '#4a4038', sleeve: v === 'C' ? skin : '#6a5a46', hand: skin, shoes: '#2a2018' }); mcHead(G, skin, '#4a2e16');
  const apron = (c, rivet) => { tc(0, 3.7, 1.1, 3.4, 6.9, .16, c); tc(0, 3.6, 1.12, 3.5, .3, .18, LT2); tc(1.3, 10.0, 0, .5, 1.1, 2.3, c); tc(-1.3, 10.0, 0, .5, 1.1, 2.3, c); tc(0, 7.2, 1.2, 2.2, 1.6, .06, LT2); t(1.0, 5.6, 1.26, .9, .12, .06, rivet); t(-1.0, 5.6, 1.26, .9, .12, .06, rivet); t(0, 5.6, 1.26, .12, 2.6, .06, rivet); for (const x of [-1.4, 1.4]) tm(x, 9.7, 1.16, .2, .2, .06, rivet) };
  const hardhat = () => { hc(0, 14.1, 0, 4.5, .5, 4.5, HH); hc(0, 14.6, 0, 3.9, .7, 3.9, '#e0bc58'); hc(0, 15.0, 1.2, 1.2, .4, 1.4, HH); hc(0, 13.9, 2.5, 4.5, .24, 1.2, HH) };
  if (v === 'A') { /* apron, hammer held upright, yellow hat with goggles */
    apron(AP, BR); hardhat(); hd(0, 12.6, 2.05, 3.8, .7, .1, '#2a2a30'); hd(-.95, 12.6, 2.12, 1.0, .5, .06, '#9ad8ff'); hd(.95, 12.6, 2.12, 1.0, .5, .06, '#9ad8ff');
    AE(0, 0, -5.9, .9, .62, 8.2, .62, '#8a6a3a'); AE(0, 0, 2.0, .9, 1.9, 2.0, 4.0, STL); AE(0, 0, 2.0, .9, 2.0, .4, 4.1, STL2); AE(4, 0, 2.2, .9, 2.0, 1.6, .5, '#5a606c');
  } else if (v === 'B') { /* apron + tool belt, huge hammer across the back, wrench in hand */
    apron('#7a4e2c', STL2); hardhat(); hc(0, 14.75, 1.9, .9, .7, .5, '#fff2b0'); hd(0, 12.7, 2.05, 3.8, .6, .1, '#2a2a30');
    t(0, 5.0, 0, 4.1, .6, 2.2, LT2); t(1.9, 4.3, 1.0, .8, 1.5, .5, STL); t(-1.9, 4.2, 1.0, .8, 1.2, .5, LT);
    t(1.0, 3.2, -1.9, .66, 10.8, .66, '#8a6a3a'); t(1.0, 13.4, -1.9, 3.2, 2.2, 2.0, STL); t(1.0, 13.3, -1.9, 3.3, .4, 2.1, STL2); t(1.0, 13.4, -3.0, 3.1, 2.0, .3, '#5a606c');
    AE(0, 0, -5.8, .8, .6, 6.6, .6, STL); AE(4, 0, .5, .8, 1.5, 1.8, .8, STL); AE(4, 0, .5, 1.5, .5, 1.8, .5, STL2);
  } else { /* smith: bare forearms, soot apron, bandana, flipped goggles, cog on the back, mallet */
    apron('#3a3a40', STL2); hc(0, 14.0, 0, 4.2, .85, 4.2, '#a8362b'); hc(0, 13.9, -2.2, 4.2, 1.2, .4, '#a8362b'); hc(2.1, 13.8, -2.6, .5, 1.6, .5, '#8a2a22');
    hd(0, 13.2, 2.05, 3.8, .65, .12, '#2a2a30'); hd(-.95, 13.2, 2.14, 1.0, .5, .08, '#ffd25a'); hd(.95, 13.2, 2.14, 1.0, .5, .08, '#ffd25a');
    t(0, 6.3, -1.4, 3.4, 3.4, .6, STL); t(0, 5.7, -1.4, 1.4, 4.6, .6, STL); t(0, 7.4, -1.4, 4.6, 1.2, .6, STL); t(0, 7.2, -1.8, 1.4, 1.6, .3, '#3b3b45');
    AE(0, 0, -5.9, .9, .62, 6.0, .62, '#8a6a3a'); AE(0, 0, .2, .9, 1.7, 2.4, 2.4, '#5a606c'); AE(4, 0, .3, .9, 1.9, .5, 2.5, STL2);
  }
  return { h: 15.6 };
}

/* ======================= 3b. ENVOY: long scarf + parchment ======================= */
function envoy(v, P, hkPut) {
  const { G, LG, AG, t, tm, tc, hc, AE } = kit(P, hkPut), RB = '#e4dccb', RBD = '#b8b09c', SS = '#a83232', SSD = '#7c2222', PA = '#f4f0e0';
  mcTorso(G, { shirt: RB, belt: v === 'C' ? GD : SS }); mcLimbs(G, LG, AG, { pants: '#6a6254', sleeve: RB, hand: skin, shoes: '#3a2a18' }); mcHead(G, skin, '#6a4a2a');
  t(0, 5.5, 0, 3.92, 4.3, 2.02, RB); t(0, 6.1, 1.0, .12, 3.4, .04, RBD); t(0, 3.4, 0, 4.0, 2.1, 2.1, RB); t(0, 3.35, 0, 4.06, .3, 2.14, v === 'C' ? GD : RBD);
  const cap = () => { hc(0, 14.1, 0, 4.2, .5, 4.2, RB); hc(0, 14.6, 0, 3.4, .6, 3.4, SS) };
  if (v === 'A') { /* scarf draped on both shoulders, two long ends in front, parchment scroll held out */
    tc(0, 9.5, 0, 4.5, 1.0, 2.5, SS); tc(-1.1, 2.6, 1.25, 1.2, 7.4, .14, SS); tc(-1.1, 2.6, 1.3, 1.2, .5, .16, SSD); tc(1.2, 4.0, 1.25, 1.2, 6.0, .14, SS); tc(1.2, 4.0, 1.3, 1.2, .5, .16, SSD);
    tc(0, 6.0, -1.15, 1.1, 4.4, .14, SS); cap();
    AE(0, 0, -4.6, 1.6, 2.8, .9, .9, PA); AE(0, 0, -4.7, 1.6, .5, 1.02, 1.02, SS); AE(0, 0, -4.7, 3.2, 2.9, 1.0, 1.0, '#cfc6aa'); AE(0, 0, -4.7, 0, 2.9, 1.0, 1.0, '#cfc6aa');
  } else if (v === 'B') { /* scarf wrapped high, a long tail streaming down the back, a big unrolled sheet */
    tc(0, 9.4, 0, 4.7, 1.5, 2.7, SS); tc(1.2, 1.4, -1.5, 1.3, 9.0, .16, SS); tc(1.2, 1.4, -1.55, 1.3, .6, .18, SSD); tc(-1.0, 3.2, -1.5, 1.2, 7.0, .16, SS); tc(-1.0, 3.2, -1.55, 1.2, .6, .18, SSD);
    hc(0, 14.1, 0, 4.2, .5, 4.2, SS); hc(0, 14.6, 0, 3.4, .6, 3.4, SSD);
    AE(0, 0, -8.2, 1.5, .22, 4.2, 3.2, PA); for (let i = 0; i < 4; i++) AE(0, 0, -7.4 + i * .8, 1.5, .26, .16, 2.3, '#8a7a5a'); AE(0, 0, -4.4, 1.5, .3, .5, 3.3, SS); AE(0, 0, -5.4, 0, .3, 1.4, .5, SS);
  } else { /* gold-trimmed robe, red sash across the chest, red cap, wax-sealed scroll raised */
    for (let i = 0; i < 7; i++) { tc(-1.6 + i * .55, 9.5 - i * .95, 1.12, .95, 1.0, .08, SS); tc(-1.6 + i * .55, 9.5 - i * .95, -1.12, .95, 1.0, .08, SS) } tc(0, 9.5, 0, 4.5, .7, 2.5, GD);
    tc(0, 3.5, 1.1, 1.0, 3.2, .1, SS); tm(0, 2.8, 1.18, .5, .5, .06, GD2); tm(0, 8.9, 1.2, 4.0, .3, .14, GD);
    hc(0, 14.1, 0, 4.6, .55, 4.6, SS); hc(.5, 14.65, 0, 3.8, .55, 3.9, SS); hc(1.3, 15.2, -.4, 2.2, .35, 2.4, SSD); hc(2.2, 14.1, -1.2, .4, 1.6, .4, GD);
    AE(0, 0, -5.4, 1.3, .8, 4.6, .8, PA); AE(0, 0, -.8, 1.3, 1.0, .4, 1.0, '#cfc6aa'); AE(0, 0, -5.6, 1.3, 1.0, 1.0, 1.0, '#cfc6aa'); AE(0, 0, -3.0, 1.3, .9, .5, .9, SS); AE(4, 0, -3.1, 1.85, .6, .6, .1, GD2); AE(0, 0, -3.0, .5, .24, .24, 1.8, SS);
  }
  return { h: 16 };
}

/* ======================= entry point ======================= */
export function mvUnitKit(type, v, P, AL, hk) {
  if (type === 'scout') return scout(v, P, hk.hkPut);
  if (type === 'engineer') return engineer(v, P, hk.hkPut);
  if (type === 'envoy') return envoy(v, P, hk.hkPut);
  if (type === 'king' || type === 'guard') { const r = hk.base(); (type === 'king' ? king : guard)(v, P, hk.hkPut); return r }
  return hk.base();
}

/* ======================= 2. KING and GUARD: drawn over the production kit ======================= */
/* production crown: gold band at y 14.8, 2.3 units from the centre, about 2 units high (top 16.8). The variants rise from the same footprint. */
function king(v, P, hkPut) {
  const { hm, hg, hc } = kit(P, hkPut), Y = 14.8, R = 2.3, RED = '#9e1b26', REDD = '#6c111b';
  const spike = (x, z, y0, h, w, c, gem) => { const n = 4; for (let k = 0; k < n; k++) hm(x, y0 + k * h / n, z, w * (1 - k * .2), h / n + .02, w * (1 - k * .2), k > 1 ? GD2 : c); if (gem) hg(x, y0 + h, z, .34, .34, .34, gem) };
  hm(0, Y - .05, 0, R * 2 + .4, .5, R * 2 + .4, GD); hm(0, Y + .4, 0, R * 2 + .3, .22, R * 2 + .3, GDD);
  if (v === 'A') { /* eight tall points, taller at the corners, gems between */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) spike(sx * R, sz * R, Y + .4, 3.6, .8, GD, '#ff3b3b');
    for (const [x, z] of [[0, R], [0, -R], [R, 0], [-R, 0]]) spike(x, z, Y + .4, 2.6, .66, GD, '#3a7aff');
    hc(0, Y + .5, 0, R * 2 - .5, 1.4, R * 2 - .5, RED); for (const x of [-1.2, 0, 1.2]) hg(x, Y + .12, R + .2, .4, .34, .08, x ? '#3a7aff' : '#ff3b3b');
  } else if (v === 'B') { /* arched crown closed by a globe and a cross */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) hm(sx * R, Y + .4, sz * R, .6, 2.2, .6, GD);
    for (const s of [-1, 1]) { hm(0, Y + 2.5, s * R, R * 2, .45, .5, GD); hm(s * R, Y + 2.5, 0, .5, .45, R * 2, GD) }
    for (let i = 0; i < 4; i++) { const w = 4.6 - i * 1.15, y = Y + 2.95 + i * .55; hm(0, y, 0, w, .55, .6, GD2); hm(0, y, 0, .6, .55, w, GD2) }
    hc(0, Y + .5, 0, R * 2 - .5, 3.2, R * 2 - .5, RED); hg(0, Y + 5.15, 0, .95, .95, .95, '#f6f0e2'); hm(0, Y + 6.05, 0, .36, 1.5, .36, GD2); hm(0, Y + 6.55, 0, 1.1, .36, .36, GD2);
    for (const [x, z] of [[R, R], [-R, R], [R, -R], [-R, -R]]) hg(x, Y + 2.7, z, .5, .5, .5, '#3a7aff'); hg(0, Y + .15, R + .3, .6, .5, .1, '#ff2f3f');
  } else { /* spires: four very tall corner spires, a great fleur-de-lis at the front and a swelling red cap */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) spike(sx * R, sz * R, Y + .4, 5.2, .9, GD, '#fff3d6');
    hc(0, Y + .5, 0, R * 2 - .4, 3.6, R * 2 - .4, RED); hc(0, Y + 4.0, 0, R * 1.5, 1.1, R * 1.5, REDD); hg(0, Y + 5.1, 0, .6, .6, .6, '#fff3d6');
    hm(0, Y + .4, R + .1, .9, 4.8, .5, GD2); hm(0, Y + 2.4, R + .1, 3.0, .6, .5, GD2); hm(-1.3, Y + 2.0, R + .1, .7, 1.7, .5, GD); hm(1.3, Y + 2.0, R + .1, .7, 1.7, .5, GD); hg(0, Y + 5.2, R + .1, .6, .6, .5, '#ff3b3b');
    for (const s of [-1, 1]) { hm(s * R, Y + .4, 0, .5, 3.2, .8, GD); hm(0, Y + .4, s * R, .8, 3.2, .5, GD) }
  }
}

/* production helm: blue, top at y 14.9, little red plume nub. Variants add a flat crest; the pavois comes from guardPavois (r.shield). */
function guard(v, P, hkPut) {
  const { hm, hc } = kit(P, hkPut), Y = 14.9, RED = '#9e1b26', REDD = '#6c111b';
  if (v === 'A') { /* long flat blade crest front to back, crimson edged with gold */
    hc(0, Y, -.3, .6, 2.2, 6.0, RED); hm(0, Y - .1, -.3, .9, .3, 6.2, GD); hm(0, Y + 2.15, -.3, .8, .22, 6.0, GD); hc(0, Y + 1.0, -3.0, .6, 1.8, .9, REDD);
  } else if (v === 'B') { /* centurion fan: a flat transverse crest, ear to ear */
    hc(0, Y, 0, 6.6, 2.0, .6, RED); hm(0, Y - .1, 0, 6.8, .3, .9, GD); hm(0, Y + 1.95, 0, 6.6, .22, .8, GD); for (const x of [-2.2, 0, 2.2]) hm(x, Y + .3, .35, .22, 1.4, .12, GD2); hc(0, Y, -.9, 5.6, 1.3, .5, REDD);
  } else { /* tall stepped gold-edged plate, higher at the back */
    hm(0, Y - .1, -.4, 1.0, .35, 5.6, GD); hm(0, Y + .25, -1.4, .55, 2.1, 3.2, GD2); hm(0, Y + .25, 1.1, .55, 1.1, 2.0, GD2); hc(0, Y + 2.3, -1.4, .5, 1.2, 2.4, RED); hc(0, Y + 1.3, 1.1, .5, .9, 1.7, RED); hm(0, Y + 3.5, -1.4, .62, .22, 2.6, GD);
  }
}

/* pavois: tall rectangular planked shield replacing the guard's heater (same frame as shieldGeo, anchor at the fist) */
export function guardPavois(v) {
  const G = newG(), put = (m, x, y, z, w, h, d, c) => { const o = geometryState.BMAT; geometryState.BMAT = m; try { bxc(G, x * VX, y * VX, z * VX, w * VX, h * VX, d * VX, c) } finally { geometryState.BMAT = o } };
  const W = 6.2, Y0 = -5.4, Y1 = 6.4, H = Y1 - Y0, F = thp(), FL = lighten(F, .14), RED = '#9e1b26', REDD = '#6c111b', cy = (Y0 + Y1) / 2 + .6, WD = '#5c4126', WD2 = '#7a5733';
  put(0, 0, Y0, -.1, W, H, .4, WD);
  const field = v === 'B' ? F : RED, fieldL = v === 'B' ? FL : '#b8283a';
  for (let i = 0; i < 4; i++) put(0, -W / 2 + .45 + i * (W - .9) / 3, Y0 + .3, .3, (W - .9) / 3 - .06, H - .6, .16, i % 2 ? field : (v === 'B' ? thd() : REDD));
  put(0, 0, Y0 + .3, .42, W - .9, H - .6, .06, field); put(0, 0, Y0 + .8, .5, W - 1.7, H - 1.6, .04, fieldL);
  put(4, 0, Y0 - .1, .3, W + .2, .42, .16, GD); put(4, 0, Y1 - .3, .3, W + .2, .42, .16, GD); for (const s of [-1, 1]) put(4, s * (W / 2 - .2), Y0, .3, .42, H, .16, GD);
  if (v === 'B') { /* crenellated top, two gold bands, central rib */
    for (const x of [-2.4, -.8, .8, 2.4]) { put(0, x, Y1, -.05, 1.2, .9, .4, WD); put(4, x, Y1 + .9, .28, 1.3, .2, .18, GD) }
    for (const y of [cy + 2.6, cy - 2.6]) put(4, 0, y, .38, W - .6, .5, .14, GD); put(4, 0, Y0 + .3, .46, .5, H - .6, .1, GDD);
    put(4, 0, cy - .75, .52, 1.5, 1.5, .12, GD2); put(5, 0, cy - .35, .6, .7, .7, .08, '#ff3b3b');
  } else if (v === 'C') { /* pointed foot and a fleur-de-lis */
    for (let i = 0; i < 3; i++) { put(0, 0, Y0 - .1 - (i + 1) * .5, -.1, W * (1 - (i + 1) * .26), .5, .4, WD); put(0, 0, Y0 - (i + 1) * .5, .3, W * (1 - (i + 1) * .26) - .8, .5, .16, i % 2 ? REDD : RED); put(4, 0, Y0 - (i + 1) * .5 - .08, .32, W * (1 - (i + 1) * .26) + .1, .16, .16, GD) }
    put(4, 0, cy - 1.7, .46, .9, 3.8, .12, GD2); put(4, 0, cy + .6, .46, 3.0, .6, .12, GD2); put(4, -1.2, cy, .46, .7, 1.6, .12, GD); put(4, 1.2, cy, .46, .7, 1.6, .12, GD); put(5, 0, cy + 2.2, .5, .7, .7, .1, '#fff3d6');
    for (const [x, y] of [[-2.2, Y1 - 1.1], [2.2, Y1 - 1.1], [-2.2, Y0 + .7], [2.2, Y0 + .7]]) put(4, x, y, .42, .5, .5, .12, GD2);
  } else { /* A: golden sun on crimson, studs */
    put(4, 0, cy - .8, .46, 1.6, 1.6, .12, GD); put(4, 0, cy - .5, .52, 1.0, 1.0, .1, GD2);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; put(4, Math.sin(a) * 1.7, cy + Math.cos(a) * 1.7 - .2, .46, .4, .4, .1, k % 2 ? GDD : GD) }
    for (const y of [Y1 - 1.0, Y0 + .6]) for (const x of [-2.2, 2.2]) put(4, x, y, .42, .44, .44, .12, GD2);
  }
  return toGeo(G);
}
