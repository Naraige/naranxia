import { REALR } from "../core/random.js";
import { TS } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { swNear } from "../gameplay/swarm.js";
import { wavesState } from "../gameplay/waves.js";
import { dayK } from "../rendering/lighting.js";
import { CAM } from "../rendering/scene.js";
import { seasonIdx } from "../rendering/weather.js";

let AUDIO = null;
export function setMusicAudioState(audio) {
  AUDIO = audio;
}

/* ---------------- music: generative score ----------------
   Seven themes (menu, calm, night, battle, boss, triumph, defeat). Each theme has several chord progressions; a "phrase" is one pass over a
   progression with its own key, melody (the title theme or a generated one), lead instrument, arpeggio shape and layers, so two passes never
   sound the same. Layers run on loops of different lengths (the arpeggio follows a global step counter, not the bar), phrases are separated by
   breaths, and themes cross-fade on their own bus. The game state is only READ (never written) and every random draw uses REALR: the score
   runs on the audio clock, outside update(), and has no effect on the simulation. */
export const mus = {
  step: 0,
  next: 0,
  cur: "",
  gs: 0,
  rest: 0,
  I: 0,
  hot: -99,
  tri: 0,
  wv: false,
  force: null,
  run: 0,
};

const R = () => (REALR || Math.random)(),
  ri = (n) => (R() * n) | 0,
  pick = (a) => a[ri(a.length)],
  hv = (v) => v * (0.85 + R() * 0.3);
const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* chords: [bass, [three voices], name] */
const CH = {
  Dm: [38, [62, 65, 69]],
  Bb: [34, [58, 62, 65]],
  F: [41, [60, 65, 69]],
  C: [36, [60, 64, 67]],
  Gm: [43, [62, 67, 70]],
  A: [45, [61, 64, 69]],
  Am: [45, [60, 64, 69]],
  G: [43, [62, 67, 71]],
  Eb: [39, [58, 63, 67]],
  D: [38, [62, 66, 69]],
  Bm: [35, [62, 66, 71]],
};
const MIN = [2, 4, 5, 7, 9, 10, 0],
  MAJ = [2, 4, 6, 7, 9, 11, 1];
/* sp: seconds per step (16 steps a bar); lv: bus level (themes measured at the same loudness, battle and boss a little above);
   tr: keys a phrase group may move to; mel: generated melody (density, range, centre, long notes, share of bars that sing) */
const TH = {
  menu: {
    sp: 0.17,
    lv: 0.7,
    progs: ["Dm Bb F C Gm Dm A Dm", "Dm C Bb A Dm F Gm A", "Dm Bb Gm A F C Dm Dm", "Bb C Dm Dm Bb C F A"],
    tr: [0, 0, -2, 3],
    mel: { dens: 0.85, lo: 67, hi: 84, c: 74, bars: 0.85, sc: MIN },
  },
  calm: {
    sp: 0.21,
    lv: 1.05,
    progs: ["F C Dm Bb F C Bb C", "Dm G Dm G Bb C Dm Dm", "Bb F C Dm Bb F C C", "Dm Am Bb F Gm Dm C Dm", "F Am Bb C"],
    tr: [0, -2, 2, -5, 3],
    mel: { dens: 0.7, lo: 69, hi: 86, c: 77, bars: 0.7, sc: MIN },
  },
  night: {
    sp: 0.25,
    lv: 1.05,
    progs: ["Dm Dm Bb Bb Gm Gm A A", "Dm Eb Dm Eb Gm A Dm Dm", "Dm C Bb Am", "Dm Gm Dm A"],
    tr: [0, -2, -4, 1],
    mel: { dens: 0.5, lo: 62, hi: 77, c: 69, bars: 0.6, long: 1, sc: MIN },
  },
  battle: {
    sp: 0.163,
    lv: 1.05,
    progs: ["Dm Bb F C Gm Dm A Dm", "Dm Dm Bb C Dm Dm Gm A", "Dm F C Gm Dm F A A", "Dm C Bb A"],
    tr: [0, 0, 2, -2],
    mel: { dens: 0.8, lo: 67, hi: 82, c: 74, bars: 0.8, sc: MIN },
  },
  boss: {
    sp: 0.148,
    lv: 1.1,
    progs: ["Dm Eb Dm Eb Dm Eb A A", "Dm Dm Eb Eb F Eb Dm A", "Dm Bb Eb A"],
    tr: [0, -1, 1],
    mel: { dens: 0.75, lo: 64, hi: 79, c: 70, bars: 0.9, sc: MIN },
  },
  triumph: {
    sp: 0.185,
    lv: 0.8,
    progs: ["D G A D Bm G A D"],
    tr: [0],
    mel: { dens: 0.9, lo: 69, hi: 86, c: 78, bars: 1, sc: MAJ },
  },
  defeat: {
    sp: 0.3,
    lv: 0.95,
    progs: ["Dm Bb Gm A", "Dm Gm Bb A Dm Bb Gm Dm"],
    tr: [0, -2],
    mel: { dens: 0.6, lo: 60, hi: 76, c: 69, bars: 0.8, long: 1, sc: MIN },
  },
};

/* the title theme (fits the first menu / battle progression) */
const MEL = [
  [0, 74, 6],
  [6, 72, 2],
  [8, 74, 4],
  [12, 77, 4],
  [16, 74, 6],
  [22, 70, 2],
  [24, 72, 8],
  [32, 69, 6],
  [38, 72, 2],
  [40, 77, 4],
  [44, 76, 4],
  [48, 74, 8],
  [56, 72, 4],
  [60, 67, 4],
  [64, 79, 6],
  [70, 77, 2],
  [72, 74, 4],
  [76, 79, 4],
  [80, 77, 6],
  [86, 76, 2],
  [88, 74, 8],
  [96, 73, 6],
  [102, 76, 2],
  [104, 81, 8],
  [112, 77, 4],
  [116, 76, 4],
  [120, 74, 8],
];
const RH = [
    [6, 2, 4, 4],
    [8, 8],
    [4, 4, 8],
    [12, 4],
    [6, 6, 4],
    [2, 2, 4, 8],
    [8, 4, 4],
    [4, 12],
    [6, 2, 8],
    [4, 4, 4, 4],
  ],
  RHL = [[16], [8, 8], [12, 4], [4, 12], [10, 6]];
/* arpeggio shapes of different lengths (0-2 chord voices, 3 = first voice an octave up) */
const ARP = [
    [0, 1, 2, 1],
    [0, 2, 1, 2, 0, 1],
    [0, 1, 2, 3, 2, 1],
    [2, 1, 0, 1, 2],
    [0, 2, 3, 2, 1, 2, 0],
  ],
  arpN = (ch, i) => (i < 3 ? ch[1][i] : ch[1][i - 3] + 12);
const KP = [
    [0, 10],
    [0, 6, 10],
    [0, 3, 10],
  ],
  BAC = [0, 3, 6, 8, 11, 14];

/* ---- buses: one per theme pass, cross-faded ---- */
let BUS = null,
  B = null,
  P = null;
const ST = {};
function mkBus(t, lv, fade) {
  const g = AUDIO.AC.createGain(),
    d = AUDIO.AC.createGain();
  d.connect(g);
  g.connect(AUDIO.MB);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(lv, t + fade);
  return { g, d };
}
function dropBus(o, t, tc) {
  try {
    if (o.g.gain.cancelAndHoldAtTime) o.g.gain.cancelAndHoldAtTime(t);
    else o.g.gain.cancelScheduledValues(t);
    o.g.gain.setTargetAtTime(0, t, tc);
  } catch {
    /* If a gain node has been detached, skip its fade and continue with cleanup. */
  }
  if (!mus.force)
    setTimeout(
      () => {
        try {
          o.g.disconnect();
        } catch {
          /* Disconnect is best-effort because WebAudio may already have released the node. */
        }
      },
      (tc * 5 + 4) * 1000,
    );
}

/* ---- instruments (all on the current bus B; d = side-chained by the kick) ---- */
function vo(f, t, d, type, v, lp, det, att, dk, rel) {
  const o = AUDIO.AC.createOscillator(),
    g = AUDIO.AC.createGain(),
    fl = AUDIO.AC.createBiquadFilter();
  o.type = type;
  o.frequency.value = f;
  if (det) o.detune.value = det;
  fl.type = "lowpass";
  fl.frequency.value = lp || 2000;
  const a = att || 0.02,
    r = rel || 0.12;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.setValueAtTime(v, t + Math.max(a, d - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(fl);
  fl.connect(g);
  g.connect(dk ? B.d : B.g);
  o.start(t);
  o.stop(t + d + 0.05);
}
function nz(t, d, v, type, f, q) {
  const s = AUDIO.AC.createBufferSource();
  s.buffer = AUDIO.nbuf;
  const fl = AUDIO.AC.createBiquadFilter();
  fl.type = type;
  fl.frequency.value = f;
  fl.Q.value = q || 1;
  const g = AUDIO.AC.createGain();
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl);
  fl.connect(g);
  g.connect(B.g);
  s.start(t, R() * 1.5, d + 0.05);
}
function strings(n, t, d, v, lp) {
  for (const det of [-9, 0, 8])
    vo(mf(n), t, d, "sawtooth", v * 0.38, lp || 1200, det, Math.min(0.45, d * 0.3), 1, Math.min(0.5, d * 0.35));
}
function choir(n, t, d, v) {
  const o = AUDIO.AC.createOscillator(),
    out = AUDIO.AC.createGain();
  o.type = "sawtooth";
  o.frequency.value = mf(n);
  const vb = AUDIO.AC.createOscillator(),
    vg = AUDIO.AC.createGain();
  vb.frequency.value = 4.6;
  vg.gain.value = mf(n) * 0.008;
  vb.connect(vg);
  vg.connect(o.frequency);
  for (const [ff, qq, gg] of [
    [700, 6, 1],
    [1150, 8, 0.55],
    [2600, 10, 0.18],
  ]) {
    const b = AUDIO.AC.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = ff;
    b.Q.value = qq;
    const g = AUDIO.AC.createGain();
    g.gain.value = gg;
    o.connect(b);
    b.connect(g);
    g.connect(out);
  }
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(v, t + d * 0.35);
  out.gain.setValueAtTime(v, t + d * 0.7);
  out.gain.exponentialRampToValueAtTime(0.0001, t + d);
  out.connect(B.d);
  o.start(t);
  o.stop(t + d + 0.05);
  vb.start(t);
  vb.stop(t + d + 0.05);
}
function pluck(n, t, v, d) {
  d = d || 1.2;
  t += R() * 0.008;
  const f = mf(n);
  vo(f, t, d, "triangle", v, 3200, 0, 0.004, 0, d * 0.9);
  vo(f * 2, t, d * 0.5, "sine", v * 0.35, 4000, 0, 0.004, 0, d * 0.45);
  vo(f * 3, t, d * 0.25, "sine", v * 0.12, 5000, 0, 0.003, 0, d * 0.22);
}
function bell(n, t, v) {
  const f = mf(n);
  for (const [k, g, d] of [
    [1, 1, 1.6],
    [2.76, 0.45, 0.9],
    [5.4, 0.22, 0.5],
    [8.9, 0.1, 0.3],
  ])
    vo(f * k, t, d, "sine", v * g, 9000, 0, 0.003, 0, d * 0.9);
}
function bassN(n, t, d, v, lp) {
  const f = mf(n);
  vo(f, t, d, "sine", v, 400, 0, 0.008, 1, 0.06);
  vo(f, t, d, "sawtooth", v * 0.45, lp || 520, 0, 0.008, 1, 0.06);
}
function cello(n, t, d, v) {
  const f = mf(n);
  vo(f, t, d, "sawtooth", v, 750, -4, 0.12, 1, 0.3);
  vo(f, t, d, "triangle", v * 0.7, 1000, 5, 0.12, 1, 0.3);
}
function brass(n, t, d, v) {
  const f = mf(n),
    o1 = AUDIO.AC.createOscillator(),
    o2 = AUDIO.AC.createOscillator(),
    lp = AUDIO.AC.createBiquadFilter(),
    g = AUDIO.AC.createGain();
  o1.type = o2.type = "sawtooth";
  o1.frequency.value = f;
  o2.frequency.value = f;
  o1.detune.value = -6;
  o2.detune.value = 7;
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(2200, t + 0.09);
  lp.frequency.setTargetAtTime(1300, t + 0.1, 0.25);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.06);
  g.gain.setValueAtTime(v * 0.85, t + Math.max(0.08, d - 0.12));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(g);
  g.connect(B.g);
  o1.start(t);
  o2.start(t);
  o1.stop(t + d + 0.05);
  o2.stop(t + d + 0.05);
}
function flute(n, t, d, v) {
  const f = mf(n),
    o = AUDIO.AC.createOscillator(),
    o2 = AUDIO.AC.createOscillator(),
    g = AUDIO.AC.createGain(),
    g2 = AUDIO.AC.createGain(),
    vb = AUDIO.AC.createOscillator(),
    vg = AUDIO.AC.createGain();
  o.type = "sine";
  o2.type = "triangle";
  o.frequency.value = f;
  o2.frequency.value = f * 2;
  g2.gain.value = 0.16;
  vb.frequency.value = 4.6 + R();
  vg.gain.setValueAtTime(0, t);
  vg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.5, d * 0.6));
  vb.connect(vg);
  vg.connect(o.frequency);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.07);
  g.gain.setValueAtTime(v * 0.9, t + Math.max(0.08, d - 0.1));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.1);
  o.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect(B.g);
  for (const x of [o, o2, vb]) {
    x.start(t);
    x.stop(t + d + 0.16);
  }
  nz(t, 0.08, v * 0.2, "bandpass", f * 2, 2);
}
function kick(t, v) {
  const o = AUDIO.AC.createOscillator(),
    g = AUDIO.AC.createGain();
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  o.connect(g);
  g.connect(B.g);
  o.start(t);
  o.stop(t + 0.45);
  nz(t, 0.02, v * 0.25, "highpass", 3000);
  B.d.gain.cancelScheduledValues(t);
  B.d.gain.setValueAtTime(0.5, t);
  B.d.gain.linearRampToValueAtTime(1, t + 0.22);
}
function snare(t, v) {
  nz(t, 0.2, v, "bandpass", 1900, 0.8);
  vo(190, t, 0.1, "triangle", v * 0.55, 1200, 0, 0.002, 0, 0.08);
}
function hat(t, v, open) {
  nz(t, open ? 0.22 : 0.045, v, "highpass", 8000);
}
function taiko(t, v) {
  const o = AUDIO.AC.createOscillator(),
    g = AUDIO.AC.createGain();
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(52, t + 0.3);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  o.connect(g);
  g.connect(B.g);
  o.start(t);
  o.stop(t + 0.75);
  nz(t, 0.25, v * 0.5, "lowpass", 700);
}
function riser(t, d, v) {
  const s = AUDIO.AC.createBufferSource();
  s.buffer = AUDIO.nbuf;
  s.loop = true;
  const f = AUDIO.AC.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(5000, t + d);
  const g = AUDIO.AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + d);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3);
  s.connect(f);
  f.connect(g);
  g.connect(B.g);
  s.start(t, R());
  s.stop(t + d + 0.35);
}

function lead(n, len, t, sp, v) {
  const d = len * sp;
  v = hv(v);
  switch (P.lead) {
    case "brass":
      brass(n - 12, t, d, v);
      brass(n, t, d, v * 0.66);
      if (len >= 6) bell(n + 12, t, v * 0.45);
      break;
    case "lowbrass":
      brass(n - 24, t, d, v * 1.1);
      brass(n - 12, t, d, v * 0.8);
      break;
    case "flute":
      flute(n, t, d * 0.95, v * 1.25);
      break;
    case "harp":
      pluck(n, t, v * 1.2, Math.max(1.4, d * 1.5));
      pluck(n - 12, t, v * 0.6, 1.4);
      break;
    case "cello":
      cello(n - 12, t, d * 1.05, v * 1.1);
      break;
    default:
      bell(n, t, v * 0.8);
  }
}

/* a melody over the chords: chord tones on the strong notes, steps of the scale between them, the rhythm of bars 1-2 answered in bars 3-4 */
function genMel(ch, tr, o) {
  const out = [],
    sc = o.sc.map((x) => (x + tr + 120) % 12),
    lo = o.lo + tr,
    hi = o.hi + tr;
  let p = o.c + tr,
    rh = null,
    last = -1;
  const ct = (c, near) => {
    let b = c[1][0] + 12,
      bd = 99;
    for (const n of c[1])
      for (const k of [0, 12, 24]) {
        const q = n + k;
        if (q < lo || q > hi) continue;
        const d = Math.abs(q - near) + (q === last ? 3 : 0);
        if (d < bd) {
          bd = d;
          b = q;
        }
      }
    return b;
  };
  const snap = (n, c) => {
    const pc = ((n % 12) + 12) % 12;
    return sc.includes(pc) || c[1].some((x) => x % 12 === pc) ? n : n - 1;
  };
  for (let b = 0; b < ch.length; b++) {
    const c = ch[b];
    if (b === ch.length - 1) {
      out.push([b * 16, ct(c, p), o.long ? 14 : 12]);
      break;
    }
    if (b > 0 && R() > o.bars) continue;
    const r = b % 4 >= 2 && rh && R() < 0.6 ? rh : pick(o.long ? RHL : RH);
    if (b % 4 < 2) rh = r;
    let s = 0;
    for (let i = 0; i < r.length; i++) {
      const len = r[i];
      if (i === 0 || len >= 6) p = ct(c, p + (ri(3) - 1) * (i === 0 ? 4 : 2));
      else {
        p = snap(p + pick([-2, -1, 1, 2, -3, 3]), c);
        if (p > hi) p -= 12;
        if (p < lo) p += 12;
      }
      if (i === 0 || R() < o.dens) {
        out.push([b * 16 + s, p, Math.max(2, len - (len > 4 ? 1 : 0))]);
        last = p;
      }
      s += len;
    }
  }
  return out;
}

function newPhrase(m) {
  const T = TH[m],
    S = ST[m] || (ST[m] = { pi: -1, tr: 0, k: 0 }),
    np = T.progs.length;
  let pi = ri(np);
  if (np > 1 && pi === S.pi) pi = (pi + 1 + ri(np - 1)) % np;
  if (m === "menu" && !S.k) pi = 0;
  S.pi = pi;
  if (S.k > 0 && S.k % 3 === 0) S.tr = pick(T.tr);
  const tr = S.tr,
    ch = T.progs[pi].split(" ").map((c) => [CH[c][0] + tr, CH[c][1].map((n) => n + tr), c]),
    theme = (m === "menu" || m === "battle") && pi === 0 && (!S.k || R() < 0.5);
  const mel = theme ? MEL.map((e) => [e[0], e[1] + tr, e[2]]) : genMel(ch, tr, T.mel),
    ms = {};
  for (const e of mel) ms[e[0]] = e;
  const p = {
    m,
    ch,
    bars: ch.length,
    k: S.k,
    theme,
    ms,
    arp: ri(ARP.length),
    tempo: 0.97 + R() * 0.06,
    lay: {},
    lead: "brass",
    sp: [ri(16), ri(16), ri(16)],
  };
  if (m === "menu") {
    p.lay = { choir: !S.k || R() < 0.7, perc: S.k ? pick([0, 1, 1, 2]) : 1, pl: S.k ? ri(3) : 0 };
    p.lead = theme ? "brass" : pick(["brass", "flute", "harp"]);
  } else if (m === "calm") {
    p.lay = { pad: R() < 0.8, ai: pick([2, 2, 2, 3, 4]), mel: R() < 0.65, sh: R() < 0.25 };
    p.lead = pick(["flute", "harp", "bell", "flute"]);
  } else if (m === "night") {
    p.lay = { mel: R() < 0.5 };
    p.lead = pick(["cello", "bell", "flute"]);
  } else if (m === "battle")
    p.lay = { ost: ri(3), kp: ri(KP.length), stab: R() < 0.7, mel: theme || R() < 0.7, A: R() < 0.5 };
  else if (m === "boss") p.lead = "lowbrass";
  else if (m === "defeat") p.lead = "cello";
  S.k++;
  return p;
}

/* breath between two phrases, in steps */
function breath(m) {
  return m === "menu"
    ? R() < 0.3
      ? 8
      : 0
    : m === "calm"
      ? R() < 0.5
        ? 16 * pick([1, 2, 3])
        : 0
      : m === "night"
        ? R() < 0.6
          ? 16 * pick([1, 2, 4])
          : 0
        : m === "defeat"
          ? 32
          : 0;
}

/* reads the game: theme and intensity near the camera. Never writes. */
function sense(now) {
  if (mus.force) return mus.force;
  const S = sessionState;
  if (!S.started) {
    mus.wv = false;
    mus.I = 0;
    return "menu";
  }
  if (S.over) return "defeat";
  let n = 0,
    boss = 0;
  const cx = CAM.x * TS,
    cy = CAM.z * TS,
    U = S.units || [];
  for (let i = 0; i < U.length; i++) {
    const u = U[i];
    if (!u.t) continue;
    if (u.boss && u.hp > 0) boss = 1;
    if (n < 40 && Math.abs(u.x - cx) < TS * 30 && Math.abs(u.y - cy) < TS * 24) n++;
  }
  if (n < 12 && swNear(cx, cy, TS * 24) >= 0) n = 12;
  const w = !!wavesState.waveOn;
  if (mus.wv && !w) mus.tri = now + 30;
  mus.wv = w;
  mus.I += ((boss ? 1 : Math.min(1, n / 30)) - mus.I) * 0.3;
  if (boss) return "boss";
  if (n >= 7) return "battle";
  if (now < mus.tri) return "triumph";
  return dayK < 0.38 || wavesState.nightLv >= 0.5 ? "night" : "calm";
}

const hotM = (m) => m === "battle" || m === "boss";
function setMode(nm, t) {
  const old = mus.cur,
    T = TH[nm],
    hot = hotM(nm);
  if (BUS) dropBus(BUS, t, hot ? 0.45 : 1);
  mus.cur = nm;
  mus.step = 0;
  mus.rest = 0;
  BUS = B = mkBus(t, T.lv, !old ? 0.05 : hot ? 0.35 : 2);
  P = newPhrase(nm);
  /* entering a fight: four rising drum hits and a swell, then the theme */
  if (hot && old) {
    const sp = T.sp;
    for (let i = 0; i < 4; i++) taiko(t + i * sp, 0.26 + i * 0.08);
    riser(t, sp * 4, 0.05);
    mus.next += sp * 4;
    mus.gs += 4;
  }
  if (nm === "triumph") {
    riser(t, 0.5, 0.03);
    bell(86, t + 0.5, 0.05);
  }
}

function advance() {
  const t = mus.next,
    now = t;
  if (mus.step % 4 === 0 || !P) {
    const nm = sense(now),
      cur = mus.cur;
    if (hotM(nm)) mus.hot = now;
    if (nm !== cur) {
      const urgent = !cur || cur === "menu" || hotM(nm) || nm === "defeat" || nm === "menu";
      if (
        urgent ||
        (hotM(cur)
          ? now - mus.hot > 9 && mus.step % 16 === 0
          : cur === "triumph"
            ? mus.step === 0
            : mus.step % 16 === 0)
      ) {
        setMode(nm, mus.next);
        if (mus.next !== t) return;
      }
    }
  }
  const sp = TH[mus.cur].sp * P.tempo;
  if (mus.rest > 0) {
    mus.rest--;
    mus.next += sp;
    mus.gs++;
    return;
  }
  B = BUS;
  STEP[mus.cur](mus.step, t, sp);
  mus.next += sp;
  mus.step++;
  mus.gs++;
  if (mus.step >= P.bars * 16) {
    mus.step = 0;
    mus.rest = breath(mus.cur);
    if (mus.cur === "triumph") mus.tri = 0;
    P = newPhrase(mus.cur);
  }
}

export function musTick() {
  const A = AUDIO;
  if (!A || !A.AC || !A.sndOn || A.BENCH || A.AC.state !== "running") return;
  A.audioWake();
  const now = A.AC.currentTime;
  if (!mus.run) {
    mus.run = 1;
    mus.next = now + 0.3;
  }
  if (sessionState.paused && sessionState.started) {
    mus.next = now + 0.1;
    return;
  }
  if (mus.next < now - 0.25) mus.next = now + 0.1; /* the tab slept: never schedule a burst of late notes */
  let n = 0;
  while (mus.next < now + 0.3 && n++ < 12) advance();
}

const STEP = {
  menu(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      L = P.lay,
      e = P.ms[st];
    if (s16 === 0) {
      ch[1].forEach((n) => strings(n, t, bd * 1.03, 0.06, 1300));
      bassN(ch[0], t, bd, 0.15, 300);
      if (L.choir) choir(ch[1][0] + 12, t, bd * 1.05, 0.035);
      if (L.perc && bar % 4 === 0 && (bar || P.k)) taiko(t, 0.42);
    }
    if (L.perc && s16 === 8 && bar % 2 === 1) taiko(t, 0.3);
    if (L.pl === 0) {
      if (s16 % 4 === 0) pluck(ch[1][(s16 / 4 + bar) % 3] + 12, t, hv(0.05), 0.9);
    } else if (L.pl === 1) {
      if (s16 % 2 === 0) {
        const a = ARP[P.arp];
        pluck(arpN(ch, a[(mus.gs >> 1) % a.length]) + 12, t, hv(0.04), 1);
      }
    } else if (s16 === 0 || s16 === 6 || s16 === 12) pluck(ch[1][((s16 / 6) | 0) % 3] + 12, t, hv(0.05), 1.4);
    if (e) lead(e[1], e[2], t, sp, 0.07);
    if (L.perc > 1 && s16 === 12 && bar % 4 === 3) {
      taiko(t, 0.24);
      taiko(t + sp, 0.26);
      taiko(t + sp * 2, 0.3);
      taiko(t + sp * 3, 0.34);
    }
  },
  calm(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      L = P.lay,
      e = P.ms[st],
      a = ARP[P.arp];
    if (s16 === 0) {
      if (L.pad) ch[1].forEach((n) => strings(n, t, bd * 1.02, 0.05, 900));
      bassN(ch[0], t, bd, 0.12, 250);
    }
    if (mus.gs % L.ai === 0) pluck(arpN(ch, a[((mus.gs / L.ai) | 0) % a.length]) + 12, t, hv(0.052), 1.1);
    if (L.mel && e) lead(e[1], e[2], t, sp, 0.055);
    else if (!L.mel && s16 === 0 && bar % 2 === 0) bell(ch[1][ri(3)] + 24, t, 0.03);
    if (L.sh && s16 % 4 === 2) nz(t, 0.04, 0.012, "highpass", 6000);
    if (seasonIdx() === 3 && s16 === 8 && bar % 2 === 0) bell(ch[1][1] + 24, t, 0.026);
    if (seasonIdx() === 2 && s16 === 12 && bar % 4 === 1) pluck(ch[1][0] + 7, t, 0.04, 1.6);
  },
  night(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      e = P.ms[st];
    if (s16 === 0) {
      choir(ch[1][0], t, bd * 1.05, 0.04);
      strings(ch[0] + 12, t, bd * 1.05, 0.05, 600);
      bassN(ch[0] - 12, t, bd, 0.1, 180);
    }
    if (s16 === P.sp[0] || s16 === P.sp[1] || (bar % 2 && s16 === P.sp[2]))
      pluck(ch[1][(s16 + bar) % 3] + (s16 % 2 ? 12 : 0), t, hv(0.035), 2.5);
    if (P.lay.mel && e) lead(e[1], e[2], t, sp, 0.05);
    if (s16 === 0 && bar % 4 === 3) bell(ch[1][0] + 13, t, 0.03);
    if (mus.gs % 80 === 40) taiko(t, 0.18);
    /* a wave is on somewhere: slow heartbeat under the night */
    if (wavesState.waveOn && (s16 === 0 || s16 === 3)) vo(52, t, 0.3, "sine", s16 ? 0.07 : 0.11, 200, 0, 0.01, 0, 0.2);
  },
  battle(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      L = P.lay,
      I = mus.force ? 1 : mus.I,
      e = P.ms[st],
      A = L.A;
    if (s16 === 0) {
      ch[1].forEach((n) => strings(n, t, bd * 1.02, 0.045, 1700));
      choir(ch[1][2] + 12, t, bd * 1.03, 0.026);
      if (L.stab) {
        brass(ch[1][0], t, sp * 3, 0.06);
        brass(ch[1][2], t, sp * 3, 0.042);
      }
    }
    if (s16 % 2 === 0) bassN(ch[0] + (s16 % 8 === 6 ? 12 : 0), t, sp * 1.7, 0.12, 700);
    {
      const oi =
        L.ost === 0
          ? (s16 + bar) % 3
          : L.ost === 1
            ? [0, 1, 2, 1, 0, 2, 1, 2][s16 % 8]
            : [0, 0, 1, 0, 2, 0, 1, 0][s16 % 8];
      vo(mf(ch[1][oi] + 12), t, sp * 0.8, "sawtooth", 0.03, 2200, 0, 0.004, 1, 0.04);
    }
    if (KP[L.kp].includes(s16) || (A && s16 === 7)) kick(t, 0.42);
    if (s16 === 8) snare(t, 0.36);
    if (s16 === 14 && bar % 2 === 1) snare(t, 0.17);
    if (s16 % 2 === 0) hat(t, hv(0.05));
    else if (I > 0.3 && (A || bar % 2)) hat(t, 0.03);
    if (bar % 4 === 3 && s16 >= 12) {
      hat(t + sp / 2, 0.035);
      snare(t + sp / 2, 0.07);
    }
    if (s16 === 0 && bar % 4 === 0) taiko(t, 0.48);
    if (L.mel && I > 0.25 && e && (!P.theme || e[2] >= 6)) lead(e[1], e[2], t, sp, 0.058);
  },
  boss(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      e = P.ms[st];
    if (s16 === 0) {
      ch[1].forEach((n) => strings(n, t, bd * 1.02, 0.045, 2000));
      choir(ch[1][0] + 12, t, bd, 0.028);
      choir(ch[0] + 12, t, bd, 0.03);
      brass(ch[0] + 12, t, bd * 0.9, 0.045);
      if (bar % 4 === 0) bell(ch[0] + 24, t, 0.05);
      if (bar % 2 === 0) taiko(t, 0.5);
    }
    if (BAC.includes(s16)) {
      kick(t, s16 ? 0.32 : 0.44);
      bassN(ch[0], t, sp * 1.5, 0.13, 800);
    }
    vo(mf(ch[1][(s16 >> 2) % 3] + 12), t, sp * 0.7, "sawtooth", 0.022, 2600, 0, 0.004, 1, 0.03);
    if (s16 === 4 || s16 === 12) snare(t, 0.32);
    hat(t, s16 % 2 ? 0.025 : 0.04);
    if (bar === P.bars - 1 && s16 >= 8) taiko(t, 0.16 + 0.03 * (s16 - 8));
    if (e) lead(e[1], e[2], t, sp, 0.065);
  },
  triumph(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      e = P.ms[st],
      a = ARP[P.arp];
    if (s16 === 0) {
      ch[1].forEach((n) => strings(n, t, bd * 1.02, 0.055, 1600));
      bassN(ch[0], t, bd, 0.13, 320);
      choir(ch[1][2] + 12, t, bd, 0.028);
      if (bar % 4 === 0) bell(ch[1][0] + 24, t, 0.04);
      if (bar % 2 === 0) taiko(t, 0.36);
    }
    if (s16 % 2 === 0) pluck(arpN(ch, a[(mus.gs >> 1) % a.length]) + 12, t, hv(0.045), 1);
    if (s16 === 0 || s16 === 4 || s16 === 6 || s16 === 8 || s16 === 12 || s16 === 14) snare(t, s16 % 8 ? 0.05 : 0.08);
    if (e) lead(e[1], e[2], t, sp, 0.065);
  },
  defeat(st, t, sp) {
    const s16 = st % 16,
      bar = (st / 16) | 0,
      ch = P.ch[bar],
      bd = sp * 16,
      e = P.ms[st];
    if (s16 === 0) {
      ch[1].forEach((n) => strings(n - 12, t, bd * 1.04, 0.055, 700));
      choir(ch[1][0], t, bd * 1.05, 0.04);
      bassN(ch[0] - 12, t, bd, 0.1, 180);
    }
    if (s16 === 8 && bar % 2 === 0) bell(ch[0] + 24, t, 0.035);
    if (e) lead(e[1], e[2], t, sp, 0.06);
  },
};

/* offline measurement (audioBench in sound.js): renders one theme from t=.3 s */
export function musBench(m, sec) {
  const k = [BUS, B, P, { ...mus }];
  for (const q in ST) delete ST[q];
  BUS = B = P = null;
  Object.assign(mus, { force: m, cur: "", next: 0.3, step: 0, rest: 0, gs: 0 });
  let n = 0;
  while (mus.next < sec - 0.3 && n++ < 4000) advance();
  [BUS, B, P] = k;
  Object.assign(mus, k[3]);
}
