import { mus, musBench, musTick, setMusicAudioState } from "./music.js";
import { hyp } from "../core/math.js";
import { REALR } from "../core/random.js";
import { TS } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { languageState } from "../i18n/language-state.js";
import { dayK } from "../rendering/lighting.js";
import { CAM } from "../rendering/scene.js";
import { seasonIdx, WX } from "../rendering/weather.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { convoyPanelState, modeState, saveMenuState, settingsState, troopPanelState } from "../ui/panel-state.js";

/* slider positions 0..1 (Settings > Display & sound), saved in dk_vol. The gain is the square of the position (a slider that feels even). */
export const soundState = {
  vM: 0.55,
  vS: 0.55,
};
/* bus gains at slider = 1 and the trim after the limiter; set from the offline measurements in docs/studio-notes/audio.md */
const MUSK = 1.7,
  SFXK = 0.85,
  TRIM = 0.45,
  FADE = 1.6;

/* every random draw of the audio code: the real generator, never the seeded one of the simulation */
const R = () => (REALR || Math.random)(),
  ri = (n) => (R() * n) | 0;

export function saveVol() {
  try {
    localStorage.setItem("dk_vol", JSON.stringify({ m: soundState.vM, s: soundState.vS }));
  } catch {
    /* Keep the current volume for this session when storage is unavailable. */
  }
}

const musG = () => soundState.vM * soundState.vM * MUSK,
  sfxG = () => soundState.vS * soundState.vS * SFXK;
export function applyVol() {
  if (!AC) return;
  const t = AC.currentTime;
  MB.gain.setTargetAtTime(musG(), t, 0.03);
  SB.gain.setTargetAtTime(sfxG(), t, 0.03);
}

/* ================= AUDIO: procedural orchestra and layered effects, no assets =================
   graph: world effects -> panner -> FXB (ducked by alerts) --+--> SB (effects volume) --+--> MG (on/off, fade) -> glue compressor -> limiter -> trim -> speakers
          menu clicks and alerts -> UIB ----------------------+                         |
          music voices -> theme bus -> MB (music volume) -> MF (fade-in at launch) -----+     reverb send from SB and MB (generated hall impulse) */
export let AC = null;
let MG = null;
export let SB = null;
export let MB = null;
let MF = null;
let FXB = null;
let UIB = null;
let OUT = null;
let RV = null;
export let sndOn = true;
export let nbuf = null;
let lastS = {};
let lastP = {};
const lastA = {};
let VO = [];
let bud = 0;
let budT = 0;
let WIND = null;
let woke = false;
/* offline measurement: BENCH on, BT = time of the sound being scheduled */
export let BENCH = false;

const musicAudioState = {
  get AC() {
    return AC;
  },
  get BENCH() {
    return BENCH;
  },
  get MB() {
    return MB;
  },
  get nbuf() {
    return nbuf;
  },
  get sndOn() {
    return sndOn;
  },
  audioWake,
};
let BT = 0;
/* per-sound variation, set by snd(): pitch factor, name */
let PV = 1;
let CUR = "";
let ERRN = 0;

function mkIR(sec, dec) {
  const n = Math.floor(AC.sampleRate * sec),
    b = AC.createBuffer(2, n, AC.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n,
        w = R() * 2 - 1;
      lp += (w - lp) * (0.35 + 0.5 * (1 - t));
      d[i] = lp * Math.pow(1 - t, dec) * (i < AC.sampleRate * 0.012 ? i / (AC.sampleRate * 0.012) : 1);
    }
  }
  return b;
}

/* builds the whole graph on AC (the live context, or an offline one for measurements). Starts silent: audioWake() fades it in. */
function graph() {
  MG = AC.createGain();
  MG.gain.value = 0;
  const cp = AC.createDynamicsCompressor();
  cp.threshold.value = -24;
  cp.knee.value = 18;
  cp.ratio.value = 3;
  cp.attack.value = 0.008;
  cp.release.value = 0.25;
  const lim = AC.createDynamicsCompressor();
  lim.threshold.value = -6;
  lim.knee.value = 0;
  lim.ratio.value = 20;
  lim.attack.value = 0.002;
  lim.release.value = 0.12;
  /* both compressors add make-up gain: TRIM takes it back, so quiet passages are not pushed up and the ceiling sits well under full scale */
  const trim = AC.createGain();
  trim.gain.value = TRIM;
  MG.connect(cp);
  cp.connect(lim);
  lim.connect(trim);
  trim.connect(AC.destination);
  RV = AC.createConvolver();
  RV.buffer = mkIR(2.8, 2.6);
  const rvo = AC.createGain();
  rvo.gain.value = 0.5;
  const rlp = AC.createBiquadFilter();
  rlp.type = "lowpass";
  rlp.frequency.value = 5200;
  RV.connect(rlp);
  rlp.connect(rvo);
  rvo.connect(MG);
  SB = AC.createGain();
  SB.connect(MG);
  const ss = AC.createGain();
  ss.gain.value = 0.16;
  SB.connect(ss);
  ss.connect(RV);
  FXB = AC.createGain();
  FXB.connect(SB);
  UIB = AC.createGain();
  UIB.connect(SB);
  MF = AC.createGain();
  MF.gain.value = 0;
  MF.connect(MG);
  MB = AC.createGain();
  MB.connect(MF);
  const ms = AC.createGain();
  ms.gain.value = 0.3;
  MB.connect(ms);
  ms.connect(RV);
  MB.gain.value = musG();
  SB.gain.value = sfxG();
  OUT = FXB;
  nbuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = nbuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
  /* wind bed: two band-passed noise layers breathing slowly */
  WIND = [];
  for (const [f, q, v] of [
    [320, 0.7, 0.05],
    [900, 1.4, 0.018],
  ]) {
    const w = AC.createBufferSource();
    w.buffer = nbuf;
    w.loop = true;
    const bp = AC.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = q;
    const g = AC.createGain();
    g.gain.value = v * 0.4;
    const l = AC.createOscillator(),
      lg = AC.createGain();
    l.frequency.value = 0.07 + R() * 0.05;
    lg.gain.value = f * 0.45;
    l.connect(lg);
    lg.connect(bp.frequency);
    l.start();
    w.connect(bp);
    bp.connect(g);
    g.connect(FXB);
    w.start(0, R() * 1.5);
    WIND.push(g);
  }
}

/* first moment the context really runs (browsers hold it until a click or a key): master up in .3 s, music in FADE s, score starts on a clean beat */
export function audioWake() {
  if (woke || !AC || AC.state !== "running") return;
  woke = true;
  const t = AC.currentTime;
  MG.gain.cancelScheduledValues(t);
  MG.gain.setValueAtTime(0, t);
  MG.gain.linearRampToValueAtTime(sndOn ? 1 : 0, t + 0.3);
  MF.gain.setValueAtTime(0, t);
  MF.gain.linearRampToValueAtTime(1, t + FADE);
}

export function aInit() {
  if (AC) {
    if (AC.state === "suspended") AC.resume();
    return;
  }
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return;
    AC = new A();
    graph();
    AC.onstatechange = audioWake;
    const res = () => {
      if (AC && AC.state === "suspended") AC.resume().catch(() => {});
    };
    setInterval(res, 400);
    ["pointerdown", "keydown", "touchstart", "touchend", "click"].forEach((ev) =>
      addEventListener(ev, res, { passive: true }),
    );
    setInterval(ambTick, 900);
    setInterval(musTick, 50);
    setInterval(uiWatch, 90);
  } catch {
    AC = null;
  }
}

export function toggleSound() {
  sndOn = !sndOn;
  try {
    localStorage.setItem("dk_snd", sndOn ? "1" : "0");
  } catch {
    /* The mute toggle still applies for this session if storage is unavailable. */
  }
  aInit();
  if (MG) {
    const t = AC.currentTime;
    woke = woke || AC.state === "running";
    MG.gain.cancelScheduledValues(t);
    MG.gain.setTargetAtTime(sndOn ? 1 : 0, t, sndOn ? 0.25 : 0.05);
    if (sndOn) {
      MF.gain.cancelScheduledValues(t);
      MF.gain.setValueAtTime(0, t);
      MF.gain.linearRampToValueAtTime(1, t + FADE);
      mus.next = t + 0.2;
    }
  }
  hudDisplayState.msgS = "Sound " + (sndOn ? "on" : "off");
  hudDisplayState.msgT = 1.5;
}

/* ---- synthesis kit (PV: pitch variation of the sound being played) ---- */
function env(g, t, a, v, d) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, d));
}

function tn(f, d, type, v, f2, t0, dst) {
  const t = AC.currentTime + BT + (t0 || 0),
    o = AC.createOscillator(),
    g = AC.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(f * PV, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2 * PV), t + d);
  env(g, t, Math.min(0.01, d / 4), v, d);
  o.connect(g);
  g.connect(dst || OUT);
  o.start(t);
  o.stop(t + d + 0.05);
}

export function ns(d, v, ft, f0, f1, q, t0, dst) {
  const t = AC.currentTime + BT + (t0 || 0),
    s = AC.createBufferSource();
  s.buffer = nbuf;
  const f = AC.createBiquadFilter();
  f.type = ft || "lowpass";
  f.frequency.setValueAtTime(f0 * PV, t);
  if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1 * PV), t + d);
  f.Q.value = q || 1;
  const g = AC.createGain();
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f);
  f.connect(g);
  g.connect(dst || OUT);
  s.start(t, R() * 1.5, d + 0.06);
}

function metal(fs, d, v, t0) {
  for (let i = 0; i < fs.length; i++) tn(fs[i], d * (1 - i * 0.12), "sine", v / (1 + i * 0.6), fs[i] * 0.995, t0);
}

function formant(f, d, v, t0, vow, wob) {
  const t = AC.currentTime + BT + (t0 || 0),
    o = AC.createOscillator();
  o.type = "sawtooth";
  f *= PV;
  o.frequency.setValueAtTime(f, t);
  o.frequency.linearRampToValueAtTime(f * (wob || 0.82), t + d);
  const out = AC.createGain();
  env(out, t, 0.06, v, d);
  for (const [ff, qq, gg] of vow || [
    [520, 8, 1],
    [1150, 10, 0.6],
  ]) {
    const b = AC.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = ff;
    b.Q.value = qq;
    const g = AC.createGain();
    g.gain.value = gg;
    o.connect(b);
    b.connect(g);
    g.connect(out);
  }
  out.connect(OUT);
  o.start(t);
  o.stop(t + d + 0.05);
}

function horn(f, d, v, t0) {
  const t = AC.currentTime + BT + (t0 || 0),
    out = AC.createGain(),
    lp = AC.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.linearRampToValueAtTime(1500, t + 0.25);
  lp.frequency.setValueAtTime(1500, t + d - 0.3);
  lp.frequency.linearRampToValueAtTime(400, t + d);
  const vib = AC.createOscillator(),
    vg = AC.createGain();
  vib.frequency.value = 5.2;
  vg.gain.value = f * 0.012;
  vib.connect(vg);
  for (const det of [-7, 6]) {
    const o = AC.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 0.94, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.14);
    o.detune.value = det;
    vg.connect(o.frequency);
    o.connect(lp);
    o.start(t);
    o.stop(t + d + 0.05);
  }
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(v, t + 0.12);
  out.gain.setValueAtTime(v, t + d - 0.3);
  out.gain.exponentialRampToValueAtTime(0.0001, t + d);
  lp.connect(out);
  out.connect(OUT);
  vib.start(t);
  vib.stop(t + d + 0.05);
}

function coinSnd() {
  metal([1568, 2350, 3730], 0.24, 0.08, 0.3);
  metal([2093, 3140], 0.3, 0.06, 0.38);
}

function knock(t0, f, v) {
  tn(f, 0.09, "sine", v, f * 0.55, t0);
  ns(0.05, v * 0.7, "bandpass", f * 5, f * 3, 4, t0);
}

/* one of k timbres for the current sound, never the same twice in a row */
function alt(k) {
  let a = ri(k);
  if (a === lastA[CUR]) a = (a + 1 + ri(k - 1)) % k;
  lastA[CUR] = a;
  return a;
}

const SFX = {
  click: () => {
    tn(1900, 0.025, "sine", 0.07, 1500);
    ns(0.018, 0.05, "highpass", 5000, 0, 1);
  },
  hover: () => {
    tn(1250, 0.02, "sine", 0.028, 1100);
  },
  tab: () => {
    tn(1400, 0.03, "sine", 0.045, 1750);
    ns(0.03, 0.022, "bandpass", 3200, 4200, 2);
  },
  open: () => {
    ns(0.14, 0.05, "bandpass", 600, 1900, 1.2);
    tn(520, 0.09, "sine", 0.035, 780, 0.02);
  },
  close: () => {
    ns(0.12, 0.045, "bandpass", 1700, 500, 1.2);
    tn(700, 0.08, "sine", 0.03, 460);
  },
  tick: () => {
    tn(2100, 0.02, "sine", 0.05, 1900);
    tn(1050, 0.03, "triangle", 0.03, 1000);
  },
  ok: () => {
    tn(880, 0.07, "triangle", 0.08, 0);
    tn(1320, 0.1, "triangle", 0.07, 0, 0.05);
    ns(0.02, 0.03, "highpass", 6000, 0, 1, 0.05);
  },
  back: () => {
    tn(700, 0.06, "triangle", 0.07, 520);
    tn(480, 0.09, "triangle", 0.06, 380, 0.04);
  },
  notice: () => {
    tn(1175, 0.12, "sine", 0.07, 0);
    tn(1568, 0.2, "sine", 0.06, 0, 0.1);
    tn(2350, 0.25, "sine", 0.02, 0, 0.1);
  },
  caravan: () => {
    for (let i = 0; i < 4; i++) {
      knock(i * 0.2, 130 + (i % 2) * 25, 0.14);
      metal([2800 + i * 160, 4100], 0.08, 0.04, i * 0.2 + 0.03);
    }
    tn(262, 0.5, "triangle", 0.07, 0, 0.1);
    tn(330, 0.5, "triangle", 0.06, 0, 0.4);
    tn(392, 0.7, "triangle", 0.07, 0, 0.7);
    metal([1568, 2350, 3730], 0.4, 0.07, 0.85);
  },
  convoy: () => {
    knock(0, 150, 0.16);
    knock(0.14, 170, 0.14);
    metal([1760, 2640, 3960], 0.3, 0.08, 0.2);
    metal([2093, 3140], 0.35, 0.06, 0.3);
  },
  meteor: () => {
    ns(0.9, 0.28, "bandpass", 4200, 500, 1.2);
    tn(900, 0.8, "sine", 0.04, 120);
    for (let i = 0; i < 4; i++) {
      const t = 0.5 + i * 0.17 + R() * 0.1;
      tn(95, 0.4, "sine", 0.34, 40, t);
      ns(0.3, 0.3, "lowpass", 700, 120, 1, t);
      metal([1900, 2800], 0.1, 0.04, t);
    }
  },
  bloodmoon: () => {
    tn(55, 2.6, "sawtooth", 0.09, 45);
    tn(82, 2.4, "sine", 0.2, 60, 0.1);
    formant(
      70,
      2.4,
      0.1,
      0.3,
      [
        [300, 7, 1],
        [760, 9, 0.4],
      ],
      0.8,
    );
    horn(110, 2.2, 0.1, 0.6);
    tn(104, 2.2, "sine", 0.06, 98, 0.6);
    for (let i = 0; i < 3; i++) knock(1.1 + i * 0.55, 62, 0.32);
  },
  wolves: () => {
    for (const [t0, f] of [
      [0, 330],
      [0.9 + R() * 0.3, 290],
      [1.6 + R() * 0.4, 360],
    ]) {
      const q = f * (0.94 + R() * 0.12);
      tn(q, 1.5, "sine", 0.07, q * 1.45, t0);
      tn(q * 1.5, 1.3, "triangle", 0.02, q * 2.1, t0 + 0.05);
      tn(q * 1.5, 0.9, "sine", 0.05, q * 0.85, t0 + 1.3);
    }
    ns(0.6, 0.04, "bandpass", 600, 300, 1.5, 0.2);
  },
  eclipse: () => {
    tn(98, 3, "sine", 0.2, 64);
    tn(147, 2.8, "sine", 0.12, 98, 0.1);
    metal([196, 294, 392, 588], 3, 0.1, 0.4);
    tn(1760, 0.8, "sine", 0.05, 1320, 1.4);
    tn(1320, 0.9, "sine", 0.045, 990, 1.9);
    ns(1.8, 0.1, "bandpass", 500, 180, 1.3, 0.2);
  },
  envoy: () => {
    horn(262, 0.6, 0.09);
    horn(330, 0.5, 0.09, 0.5);
    horn(392, 0.9, 0.1, 0.9);
    metal([1568, 2350], 0.4, 0.05, 1);
    coinSnd();
  },
  ruin: () => {
    ns(0.9, 0.38, "lowpass", 500, 80, 1);
    tn(70, 0.7, "sine", 0.4, 38);
    for (let i = 0; i < 4; i++) knock(0.15 + i * 0.1, 200 + R() * 120, 0.1);
    tn(330, 1.4, "sine", 0.06, 0, 0.45);
    tn(494, 1.4, "sine", 0.05, 0, 0.52);
    tn(659, 1.6, "sine", 0.04, 0, 0.6);
    metal([1568, 2350, 3730], 0.7, 0.05, 0.7);
  },
  select: () => {
    tn(660, 0.07, "triangle", 0.12, 0);
    tn(990, 0.1, "triangle", 0.09, 0, 0.04);
    tn(1980, 0.08, "sine", 0.025, 0, 0.04);
  },
  order: () => {
    tn(392, 0.08, "triangle", 0.14, 330);
    tn(588, 0.06, "sine", 0.05, 0, 0.03);
    ns(0.04, 0.05, "bandpass", 2600, 0, 3);
  },
  err: () => {
    tn(196, 0.15, "square", 0.05, 150);
    tn(185, 0.15, "square", 0.04, 140);
    tn(98, 0.16, "sine", 0.1, 80);
  },
  build: () => {
    const a = alt(3);
    knock(0, 150 + a * 14, 0.38);
    knock(0.11 + a * 0.02, 170 - a * 10, 0.3);
    if (a === 2) knock(0.24, 140, 0.2);
    ns(0.14, 0.18, "bandpass", 900, 500, 1.6, 0.03);
  },
  path: () => {
    ns(0.09, 0.22, "bandpass", 1500, 700, 1.2);
    ns(0.06, 0.12, "highpass", 3500, 0, 1, 0.03);
  },
  spawn: () => {
    const N = [
      [523, 659, 784],
      [523, 659, 880],
      [587, 740, 880],
    ][alt(3)];
    N.forEach((f, i) => {
      tn(f, 0.28, "triangle", 0.11, 0, i * 0.07);
      tn(f * 2, 0.2, "sine", 0.03, 0, i * 0.07);
    });
    ns(0.3, 0.04, "highpass", 6000, 9000, 1, 0.12);
  },
  coin: () => {
    metal([1568, 2350, 3730], 0.24, 0.11);
    metal([2093, 3140, 4980], 0.3, 0.09, 0.05 + R() * 0.05);
  },
  chop: () => {
    const a = alt(3);
    tn(170 - a * 18, 0.1, "sine", 0.42, 80);
    ns(0.08, 0.55, "bandpass", 1300 - a * 160, 600, 2.8);
    ns(0.03, 0.3, "highpass", 4000, 0, 1, 0.005);
    if (a === 1) ns(0.12, 0.1, "bandpass", 2600, 1200, 3, 0.05);
  },
  mine: () => {
    const a = alt(3);
    metal(
      [
        [2380, 3110, 4270],
        [2140, 3350, 4630],
        [2620, 3480, 4010],
      ][a],
      0.12,
      0.07,
    );
    ns(0.05, 0.38, "highpass", 3200, 6000, 2);
    tn(220 - a * 20, 0.07, "sine", 0.28, 110);
    if (a === 2) ns(0.1, 0.08, "bandpass", 900, 400, 2, 0.06);
  },
  sword: () => {
    const a = alt(4);
    metal(
      [
        [1840, 2690, 3910, 5230],
        [2060, 2940, 4380],
        [1620, 2480, 3620, 4870],
        [2290, 3170, 4610],
      ][a],
      0.18 + a * 0.02,
      0.09,
    );
    ns(0.06, 0.42, "bandpass", 4200 - a * 350, 2200, 2.5);
    tn(240, 0.07, "sine", 0.16, 120);
    if (a === 3) ns(0.12, 0.12, "highpass", 5200, 7000, 1, 0.03);
  },
  zhit: () => {
    const a = alt(3);
    tn(110 + a * 12, 0.13, "sine", 0.42, 55);
    ns(0.13, 0.38, "lowpass", 800 - a * 120, 220);
    ns(0.05, 0.12, "bandpass", 1800, 900, 3, 0.01);
    if (a === 2) tn(70, 0.1, "sine", 0.2, 45, 0.03);
  },
  arrow: () => {
    const a = alt(3);
    tn(210 + a * 18, 0.06, "triangle", 0.11, 150);
    ns(0.2 - a * 0.03, 0.3, "bandpass", 900 + a * 200, 3800 + a * 500, 2.2, 0.02);
  },
  stone: () => {
    const a = alt(3);
    ns(0.07, 0.32, "bandpass", 950 - a * 130, 450, 1.6);
    tn(140 - a * 14, 0.06, "sine", 0.18, 90);
  },
  bolt: () => {
    tn(120, 0.22, "sawtooth", 0.16, 60);
    ns(0.25, 0.4, "bandpass", 700, 2600, 1.4, 0.03);
    metal([980, 1430], 0.14, 0.04);
  },
  trebl: () => {
    tn(74, 0.45, "sawtooth", 0.12, 60);
    ns(0.55, 0.35, "bandpass", 260, 700, 1.8, 0.1);
    ns(0.4, 0.3, "lowpass", 500, 120, 1, 0.35);
  },
  boom: () => {
    ns(1.0, 0.95, "lowpass", 420, 45);
    tn(58, 0.7, "sine", 0.85, 30);
    ns(0.35, 0.3, "bandpass", 1500, 500, 1, 0.05);
    for (let i = 0; i < 5; i++) ns(0.04, 0.12, "highpass", 2500, 0, 1, 0.15 + i * 0.09 * R());
  },
  groan: () => {
    const f = 85 + R() * 30;
    formant(
      f,
      0.7 + R() * 0.3,
      0.42,
      0,
      [
        [
          [480 + R() * 80, 7, 1],
          [1050, 9, 0.5],
        ],
        [
          [380 + R() * 60, 6, 1],
          [900, 8, 0.5],
        ],
        [
          [560 + R() * 60, 7, 1],
          [1250, 9, 0.4],
        ],
      ][alt(3)],
      0.7 + R() * 0.12,
    );
  },
  die: () => {
    const a = alt(3);
    formant(
      130 - a * 14,
      0.4 + a * 0.06,
      0.36,
      0,
      [
        [600 - a * 60, 6, 1],
        [1300 - a * 90, 8, 0.4],
      ],
      0.55 - a * 0.05,
    );
    ns(0.15, 0.25, "lowpass", 600, 150, 1, 0.12);
  },
  horn: () => {
    horn(147, 1.5, 0.2);
    horn(220, 1.3, 0.12, 0.08);
    tn(73, 1.4, "sine", 0.12, 0, 0.05);
  },
  fanfare: () => {
    [
      [392, 0, 0.32],
      [523, 0.16, 0.32],
      [659, 0.32, 0.32],
      [784, 0.5, 0.9],
    ].forEach(([f, t, d]) => {
      horn(f, d, 0.13, t);
      tn(f * 2, d, "sine", 0.025, 0, t);
    });
    metal([2093, 3140], 0.8, 0.05, 0.5);
  },
  victory: () => {
    [
      [294, 0, 0.4],
      [370, 0.22, 0.4],
      [440, 0.44, 0.4],
      [587, 0.7, 1.4],
    ].forEach(([f, t, d]) => horn(f, d, 0.12, t));
    metal([1175, 1760, 2640], 1.4, 0.06, 0.7);
  },
  alarm: () => {
    for (let i = 0; i < 3; i++) {
      metal([880, 1320, 2210], 0.32, 0.1, i * 0.28);
      tn(440, 0.25, "triangle", 0.06, 0, i * 0.28);
    }
  },
  night: () => {
    metal([110, 220, 331, 446, 580], 3.2, 0.22);
    metal([164, 330, 495], 2.6, 0.08, 0.02);
    formant(
      70,
      2.4,
      0.08,
      0.6,
      [
        [350, 6, 1],
        [800, 8, 0.4],
      ],
      0.9,
    );
  },
  crumble: () => {
    ns(1.3, 0.85, "lowpass", 520, 70);
    tn(66, 0.9, "sine", 0.6, 32);
    for (let i = 0; i < 7; i++) knock(0.1 + i * 0.11 * R() + i * 0.05, 240 + R() * 200, 0.12);
  },
  gate: () => {
    tn(78, 0.6, "sawtooth", 0.08, 120);
    ns(0.5, 0.18, "bandpass", 320, 560, 3);
    knock(0.55, 110, 0.3);
  },
  heal: () => {
    tn(880, 0.25, "sine", 0.07);
    tn(1320, 0.3, "sine", 0.06, 0, 0.08);
    tn(1760, 0.35, "sine", 0.04, 0, 0.16);
    ns(0.4, 0.03, "highpass", 7000, 0, 1, 0.05);
  },
  clank: () => {
    const a = alt(3);
    metal(
      [
        [1500, 2280, 3460],
        [1340, 2460, 3180],
        [1680, 2150, 3720],
      ][a],
      0.14,
      0.06,
    );
    ns(0.07, 0.3, "highpass", 2600, 5000, 2);
  },
  dirt: () => {
    const a = alt(2);
    ns(0.22, 0.48, "lowpass", 700 - a * 150, 220);
    ns(0.08, 0.16, "bandpass", 1600, 700, 2, 0.04 + a * 0.03);
  },
  fuse: () => {
    ns(1.1, 0.2, "highpass", 3600, 7000, 1.4);
    for (let i = 0; i < 7; i++) ns(0.03, 0.2, "bandpass", 5200, 0, 4, i * 0.15 + R() * 0.05);
  },
  spit: () => {
    ns(0.16, 0.4, "bandpass", 900, 300, 2.5);
    tn(190, 0.12, "sine", 0.22, 90);
    ns(0.1, 0.18, "highpass", 2600, 0, 1, 0.06);
  },
  sizzle: () => {
    ns(0.9, 0.17, "highpass", 4200, 2600, 1.2);
    ns(0.5, 0.09, "bandpass", 2200, 0, 2, 0.1);
  },
};

/* per sound: [family, shortest gap (s), length (s), pitch variation (+-), level].
   families: 0 interface, 1 alerts and events (never dropped, duck the rest), 2 combat, 3 work, 4 voices. */
const META = {
    click: [0, 0.02, 0.05, 0.02, 1],
    hover: [0, 0.05, 0.03, 0.03, 1],
    tab: [0, 0.05, 0.05, 0.03, 1],
    open: [0, 0.15, 0.15, 0.04, 1],
    close: [0, 0.15, 0.15, 0.04, 1],
    tick: [0, 0.07, 0.04, 0.02, 1],
    ok: [0, 0.04, 0.15, 0.01, 1],
    back: [0, 0.04, 0.15, 0.01, 1],
    select: [0, 0.03, 0.14, 0.02, 0.8],
    order: [0, 0.03, 0.1, 0.03, 0.8],
    err: [0, 0.08, 0.2, 0.02, 1],
    coin: [0, 0.08, 0.3, 0.03, 0.8],
    path: [3, 0.05, 0.1, 0.08, 0.8],
    notice: [1, 0.3, 0.4, 0, 1],
    caravan: [1, 2, 1.3, 0, 1],
    convoy: [1, 1, 0.6, 0.02, 1],
    meteor: [1, 2, 1.4, 0.04, 0.8],
    bloodmoon: [1, 4, 2.8, 0, 0.9],
    wolves: [1, 3, 2.8, 0, 1],
    eclipse: [1, 4, 3.2, 0, 0.9],
    envoy: [1, 2, 1.8, 0, 1],
    ruin: [1, 1, 1.8, 0.03, 0.8],
    horn: [1, 1, 1.6, 0, 0.85],
    fanfare: [1, 1, 1.4, 0, 0.9],
    victory: [1, 2, 2.1, 0, 0.9],
    alarm: [1, 1.5, 0.9, 0, 0.9],
    night: [1, 4, 3.2, 0, 0.8],
    sword: [2, 0.06, 0.22, 0.07, 0.8],
    zhit: [2, 0.06, 0.15, 0.1, 0.8],
    arrow: [2, 0.07, 0.2, 0.09, 0.85],
    stone: [2, 0.09, 0.1, 0.1, 0.9],
    bolt: [2, 0.08, 0.28, 0.07, 0.85],
    trebl: [2, 0.2, 0.7, 0.06, 0.9],
    boom: [2, 0.15, 1, 0.08, 0.7],
    clank: [2, 0.06, 0.15, 0.08, 0.85],
    spit: [2, 0.12, 0.2, 0.09, 0.85],
    sizzle: [2, 0.5, 0.9, 0.06, 0.9],
    fuse: [2, 0.4, 1.1, 0.05, 0.9],
    crumble: [2, 0.3, 1.3, 0.07, 0.7],
    build: [3, 0.12, 0.25, 0.06, 0.8],
    chop: [3, 0.1, 0.12, 0.08, 0.7],
    mine: [3, 0.1, 0.14, 0.06, 0.75],
    dirt: [3, 0.08, 0.25, 0.1, 0.8],
    gate: [3, 0.3, 0.7, 0.05, 0.9],
    heal: [3, 0.3, 0.45, 0.03, 1],
    spawn: [3, 0.1, 0.4, 0.01, 0.85],
    groan: [4, 0.5, 0.9, 0.1, 0.6],
    die: [4, 0.07, 0.4, 0.1, 0.75],
  },
  DEF = [2, 0.05, 0.3, 0.05, 0.8];
/* voices allowed at once per family, and in total for the world (families 2-4) */
const CAP = [5, 4, 7, 4, 3],
  CAPW = 12;

/* an alert passes over the fight: world effects dip while it sounds */
function duck(d) {
  const t = AC.currentTime + BT;
  FXB.gain.cancelScheduledValues(t);
  FXB.gain.setTargetAtTime(0.45, t, 0.04);
  FXB.gain.setTargetAtTime(1, t + Math.min(1.6, d * 0.7), 0.35);
}

/* returns the gain node of the voice it started (nothing when the sound was dropped): the video guide fades its own voices on pause */
export let snd = function snd(n, x, y) {
  if (!AC || !sndOn || !SFX[n]) return;
  if (!BENCH) {
    if (AC.state !== "running") return;
    audioWake();
  }
  const M = META[n] || DEF,
    c = M[0],
    t = BENCH ? BT * 1000 : performance.now();
  if (t - (lastS[n] === undefined ? -1e9 : lastS[n]) < M[1] * 1000) return;
  if (c > 1) {
    if (t - budT > 120 || t < budT) {
      budT = t;
      bud = 0;
    }
    if (bud >= 6) return;
  }
  let k = 0,
    w = 0;
  for (let i = VO.length - 1; i >= 0; i--) {
    const q = VO[i];
    if (q[0] <= t || q[0] > t + 6000) VO.splice(i, 1);
    else {
      if (q[1] === c) k++;
      if (q[1] > 1) w++;
    }
  }
  if (k >= CAP[c] || (c > 1 && w >= CAPW)) return;
  let v = M[4],
    pan = 0;
  if (x !== undefined) {
    const wx = x / TS - CAM.x,
      wz = y / TS - CAM.z,
      d = hyp(wx, wz);
    v *= Math.pow(Math.max(0, 1 - d / (CAM.dist + 34)), 2);
    if (v < 0.03) return;
    pan = Math.max(-0.85, Math.min(0.85, (wx * Math.cos(CAM.yaw) - wz * Math.sin(CAM.yaw)) / (CAM.dist * 0.9 + 4)));
  }
  /* a crowd of the same family gets quieter per voice: a big fight grows denser, not louder */
  if (c > 1) v *= (0.88 + R() * 0.24) / (1 + k * 0.22);
  lastS[n] = t;
  if (c > 1) bud++;
  VO.push([t + M[2] * 1000, c]);
  /* pitch: random within the range of the sound, pushed away from the last one played */
  {
    const r = M[3];
    let p = (R() * 2 - 1) * r;
    const l = lastP[n] || 0;
    if (r && Math.abs(p - l) < r * 0.3) p = (l > 0 ? -1 : 1) * r * (0.35 + R() * 0.65);
    lastP[n] = p;
    PV = 1 + p;
  }
  CUR = n;
  const g = AC.createGain();
  g.gain.value = v;
  const dst = c < 2 ? UIB : FXB;
  if (pan && AC.createStereoPanner) {
    const p = AC.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    p.connect(dst);
  } else g.connect(dst);
  if (c === 1) duck(M[2]);
  OUT = g;
  try {
    SFX[n]();
  } catch {
    ERRN++;
  }
  OUT = FXB;
  PV = 1;
  return g;
};

/* ambience: wind always, birds by day, crickets / owls / distant wolves by night */
function ambTick() {
  if (!AC || !sndOn || BENCH || AC.state !== "running") return;
  OUT = FXB;
  PV = 1;
  const on = sessionState.started && !sessionState.paused;
  if (WIND)
    WIND.forEach((g, i) =>
      g.gain.setTargetAtTime(on ? (i ? 0.016 : 0.045) * (1.2 - dayK * 0.4) : 0.02, AC.currentTime, 1.2),
    );
  if (!on) return;
  if (dayK > 0.55 && seasonIdx() !== 3 && WX.w[1] < 0.4 && R() < 0.38) {
    const f = 2400 + R() * 1700,
      n = 2 + ri(4),
      k = ri(3);
    for (let i = 0; i < n; i++) {
      if (k === 0) {
        tn(f * (1 + (i % 2) * 0.12), 0.06, "sine", 0.028, f * 1.35, i * 0.1);
        tn(f * 2.01, 0.04, "sine", 0.008, 0, i * 0.1);
      } else if (k === 1) tn(f * 0.8, 0.09, "sine", 0.024, f * (i % 2 ? 0.62 : 1.05), i * 0.14);
      else {
        tn(f * 1.1, 0.03, "sine", 0.022, f * 1.2, i * 0.06);
        tn(f * 1.1, 0.03, "sine", 0.018, f * 1.2, i * 0.06 + 0.03);
      }
    }
  }
  if (dayK < 0.42) {
    if (R() < 0.7) {
      const f = 4200 + R() * 400;
      for (let i = 0; i < 4; i++) {
        tn(f, 0.05, "sine", 0.012, f - 20, i * 0.07);
        tn(f, 0.05, "sine", 0.012, f - 20, 0.45 + i * 0.07);
      }
    }
    if (R() < 0.06) {
      const f = 370 + R() * 40;
      tn(f, 0.32, "sine", 0.05, f * 0.95);
      tn(f * 0.85, 0.5, "sine", 0.045, f * 0.8, 0.42);
    }
    if (R() < 0.025) {
      const t0 = R() * 0.3,
        f = 390 + R() * 60;
      tn(f, 1.6, "triangle", 0.03, f * 1.65, t0);
      tn(f * 1.65, 1.2, "triangle", 0.022, f * 1.25, t0 + 1.4);
    }
  }
}

/* windows opening and closing: read from the menu flags (never written here), so the menus need no sound code of their own */
let UW0 = -1;
function uiWatch() {
  if (BENCH) return;
  let n = 0;
  try {
    for (const x of [
      settingsState.settingsOpen,
      settingsState.setupOpen,
      languageState.langOpen,
      saveMenuState.saveOpen,
      modeState.open,
      troopPanelState.troopsOpen,
      convoyPanelState.convoyOpen,
      sessionState.showMap,
    ])
      if (x) n++;
  } catch {
    return;
  }
  if (UW0 >= 0 && n !== UW0) snd(n > UW0 ? "open" : "close");
  UW0 = n;
}

export function setSndHandler(handler) {
  snd = handler;
}

/* offline measurement of what the speakers get (peak and RMS, dBFS). sc: 'launch' (first click, fade-in, title music), 'battle' (battle music + a
   dense fight through snd()), 'cal' (a quiet sine straight into the master: gain of the chain), or a theme name. Used by tools/run.py, never in play. */
export async function audioBench(sc, sec) {
  const keep = [AC, MG, SB, MB, MF, FXB, UIB, RV, nbuf, WIND, OUT, woke, lastS, lastP, VO, bud, budT],
    sr = 44100;
  sec = sec || 12;
  AC = new OfflineAudioContext(2, sr * sec, sr);
  graph();
  BENCH = true;
  lastS = {};
  lastP = {};
  VO = [];
  bud = 0;
  budT = 0;
  let b;
  try {
    MG.gain.setValueAtTime(0, 0);
    MG.gain.linearRampToValueAtTime(1, 0.3);
    MF.gain.setValueAtTime(0, 0);
    MF.gain.linearRampToValueAtTime(1, FADE);
    if (sc === "cal") {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.frequency.value = 440;
      g.gain.value = 0.01;
      o.connect(g);
      g.connect(MG);
      o.start();
    } else {
      const ev = sc === "launch" ? [["click", 0]] : [];
      if (sc === "battle") {
        ev.push(["horn", 0]);
        for (let t = 0.5; t < sec - 1; t += 0.1) {
          ev.push(["sword", t], ["zhit", t + 0.03], ["arrow", t + 0.05]);
          if (Math.round(t * 10) % 4 === 0) ev.push(["die", t + 0.02], ["groan", t + 0.06]);
        }
        ev.push(["boom", 2], ["boom", 5]);
        ev.sort((p, q) => p[1] - q[1]);
      }
      musBench(sc === "launch" ? "menu" : sc, sec);
      for (const [n, t] of ev) {
        BT = t;
        snd(n);
      }
    }
    BT = 0;
    b = await AC.startRendering();
  } finally {
    BENCH = false;
    BT = 0;
    [AC, MG, SB, MB, MF, FXB, UIB, RV, nbuf, WIND, OUT, woke, lastS, lastP, VO, bud, budT] = keep;
  }
  const L = b.getChannelData(0),
    Rr = b.getChannelData(1),
    n = L.length,
    wn = Math.floor(sr * 0.4),
    n3 = Math.min(n, sr * 3);
  let pk = 0,
    ss = 0,
    s3 = 0,
    mx = 0,
    w = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(Math.abs(L[i]), Math.abs(Rr[i])),
      e = (L[i] * L[i] + Rr[i] * Rr[i]) / 2;
    if (a > pk) pk = a;
    ss += e;
    if (i < n3) s3 += e;
    w += e;
    if (i >= wn) {
      const j = i - wn;
      w -= (L[j] * L[j] + Rr[j] * Rr[j]) / 2;
    }
    if (i >= wn - 1 && w > mx) mx = w;
  }
  const db = (x) => (20 * Math.log10(Math.max(1e-9, x))).toFixed(1);
  return (
    sc +
    " " +
    sec +
    "s: peak " +
    db(pk) +
    " dBFS, RMS " +
    db(Math.sqrt(ss / n)) +
    ", RMS first 3s " +
    db(Math.sqrt(s3 / n3)) +
    ", loudest 0.4s RMS " +
    db(Math.sqrt(mx / wn))
  );
}

export function initializeSound() {
  setMusicAudioState(musicAudioState);
  /* the levels and the slider curve changed: old saved volumes and an old mute are dropped once */
  try {
    if (localStorage.getItem("dk_aud") !== "2") {
      localStorage.removeItem("dk_vol");
      localStorage.removeItem("dk_snd");
      localStorage.setItem("dk_aud", "2");
    }
  } catch {
    /* Audio preference migration is best-effort when browser storage is blocked. */
  }
  try {
    const v = JSON.parse(localStorage.getItem("dk_vol") || "{}");
    if (typeof v.m === "number") soundState.vM = Math.max(0, Math.min(1, v.m));
    if (typeof v.s === "number") soundState.vS = Math.max(0, Math.min(1, v.s));
  } catch {
    /* Ignore malformed or unavailable volume data and keep the current defaults. */
  }

  try {
    sndOn = localStorage.getItem("dk_snd") !== "0";
  } catch {
    /* If storage is unavailable, keep the default sound-enabled state. */
  }
  try {
    window.__abench = audioBench;
    window.__audio = {
      mus,
      snd: (n) => snd(n),
      names: () => Object.keys(SFX),
      state: () => (AC ? AC.state : "none"),
      errs: () => ERRN,
      resume: () => AC && AC.resume(),
    };
  } catch {
    /* Debug hooks are optional when the page does not allow window properties. */
  }
}
