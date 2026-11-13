import { cbOn, cbSet, pref, setPref } from "../core/prefs.js";
import { applyVol, saveVol, snd, soundState } from "../audio/sound.js";
import { startGame } from "../gameplay/lifecycle.js";
import { sessionState } from "../gameplay/session.js";
import { questsPref, questsState } from "../gameplay/quests.js";
import { questSwitch } from "../multiplayer/commands.js";
import { LANG, LANGS, languageState, T_, tw } from "../i18n/language.js";
import { inputState } from "../input/state.js";
import { saveTheme } from "../rendering/kingdom-banner.js";
import { rs } from "../rendering/resolution.js";
import { DRS, GQU, renderer, sceneState, SHADOWS, sun } from "../rendering/scene.js";
import { bugReport } from "../debug/tools.js";
import { HK } from "./build-catalog.js";
import { canvasesState } from "./canvases.js";
import { applyCB } from "./drawing.js";
import { bevelBtn, keyChip, kitRow, kitScreen, listBegin, listEnd } from "./menu-kit.js";
import { hudDisplayState } from "./hud-state.js";
import { settingsState } from "./panel-state.js";
import { THEME } from "./kingdom-theme.js";
import { FF, FFP } from "./typography.js";

export { settingsState };

export let nmI;

export function placeInput() {
  if (!settingsState.nameBox || sessionState.started) {
    nmI.style.display = "none";
    return;
  }
  const k = hudDisplayState.UIS / inputState.DPR,
    s = nmI.style;
  s.display = "block";
  s.left = settingsState.nameBox.x * k + "px";
  s.top = settingsState.nameBox.y * k + "px";
  s.width = settingsState.nameBox.w * k + "px";
  s.height = settingsState.nameBox.h * k + "px";
  s.fontSize = 9.5 * k + "px";
  if (document.activeElement !== nmI && nmI.value !== THEME.n) nmI.value = THEME.n;
}

export let uiMul = 1;

const KDEF = {
  cry: "<",
  charge: ">",
  cannon: "/",
  peasant: "1",
  knight: "2",
  spearman: "f4",
  archer: "3",
  bannerman: "4",
  captain: "5",
  wall: "6",
  gate: "7",
  tower: "8",
  path: "9",
  ballista: "b",
  trebuchet: "t",
  raise: "y",
  dig: "u",
  army: "KeyQ",
  idle: ".",
  form: "v",
  rotate: "r",
  sound: "o",
  wave: "n",
  home: "h",
  map: "m",
  upgrade: "g",
  barracks: "c",
  farm: "j",
  peas: "e",
  storage: "k",
  house: "0",
  movec: ",",
  academy: ";",
  market: ":",
  forester: "f9",
  guild: "f3",
  torch: "f6",
  rally: "f7",
  rallyc: "=",
  ramp: "i",
  tier: "l",
  demolish: "p",
  pause: " ",
  speed: "f",
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
  rotL: "KeyZ",
  rotR: "KeyX",
};

const ACTL = {
  cry: "King: war cry",
  charge: "King: royal charge",
  king: "Summon King Naraige",
  guard: "Train a royal guard",
  cannon: "Train cannon",
  movec: "Move castle",
  rotate: "Rotate building",
  peasant: "Train peasant",
  knight: "Train knight",
  spearman: "Train spearman",
  archer: "Train archer",
  bannerman: "Train bannerman",
  captain: "Train captain",
  upgrade: "Masonry research",
  barracks: "Build barracks",
  farm: "Build farm",
  storage: "Build storage",
  house: "Build house",
  academy: "Build academy",
  market: "Build market",
  forester: "Build forester hut",
  guild: "Build builders guild",
  torch: "Build torch",
  rally: "Barracks rally point",
  rallyc: "Castle rally point",
  peas: "Select all peasants",
  tier: "Wood / stone tier",
  demolish: "Demolish building",
  ramp: "Dig a ramp",
  wall: "Build wall",
  gate: "Build gate",
  tower: "Build tower",
  path: "Build path",
  ballista: "Ballista",
  trebuchet: "Trebuchet",
  raise: "Raise ground",
  dig: "Dig ground",
  army: "Select army",
  idle: "Idle peasants",
  form: "Formation",
  sound: "Mute sound",
  wave: "Call wave",
  home: "Back to base",
  map: "World map",
  pause: "Pause",
  speed: "Game speed",
  up: "Camera up",
  down: "Camera down",
  left: "Camera left",
  right: "Camera right",
  rotL: "Turn camera left",
  rotR: "Turn camera right",
};

export let KB;

/* is this action bound to a physical key by default (camera, camera turn, select army)? */
export const kbPhys = (a) => /^Key[A-Z]$/.test(KDEF[a] || "");

/* is this key a binding the player chose (not the default of its action)? Asked by the keyboard handler for digit-row keys */
export const kbCustom = (k) => {
  for (const a in KB) if (KB[a] === k && KDEF[a] !== k) return true;
  return false;
};

/* ---- physical keys (v94) ----
   Camera, camera turn and "select army" are bound to a physical key, written as its KeyboardEvent.code ('KeyW'): the same place on every
   keyboard, so the camera is W A S D on QWERTY and Z Q S D on AZERTY without a setting. Every other binding is the character typed
   (lower case), as before, and a character binding always wins over a physical one (German QWERTZ: the key that types y stays "raise").
   LAY = what each physical letter key types on this keyboard, for the labels: navigator.keyboard.getLayoutMap() when the browser has it,
   else the last character typed with that key (kept in dk_lay), else a guess from the browser language, else the QWERTY letter. */
export const isCode = (k) => typeof k === "string" && /^Key[A-Z]$/.test(k);
const LAY = {};
const LAYT = {
  azerty: { KeyQ: "a", KeyA: "q", KeyW: "z", KeyZ: "w", KeyS: "s", KeyD: "d", KeyX: "x", KeyY: "y" },
  qwertz: { KeyZ: "y", KeyY: "z", KeyQ: "q", KeyA: "a", KeyW: "w", KeyS: "s", KeyD: "d", KeyX: "x" },
  qwerty: { KeyQ: "q", KeyA: "a", KeyW: "w", KeyZ: "z", KeyS: "s", KeyD: "d", KeyX: "x", KeyY: "y" },
};
const laySave = () => {
  try {
    localStorage.setItem("dk_lay", JSON.stringify(LAY));
  } catch {
    /* Keep the detected layout in memory for this session. */
  }
};
/* a letter typed with a physical key: remember it; when only one known layout types it there (A, Q, W, Z, sometimes Y), fill the other letters of that layout */
export function layNote(code, ch) {
  if (!isCode(code) || typeof ch !== "string" || ch.length !== 1 || ch.toLowerCase() === ch.toUpperCase()) return;
  ch = ch.toLowerCase();
  if (LAY[code] === ch) return;
  LAY[code] = ch;
  {
    const M = Object.keys(LAYT).filter((n) => LAYT[n][code] === ch);
    if (M.length === 1) Object.assign(LAY, LAYT[M[0]]);
  }
  laySave();
  syncHK();
}
export function layInit() {
  for (const c in LAY) delete LAY[c];
  try {
    const lg = String(navigator.language || "").toLowerCase();
    if (/^fr(-fr|-be|-mc|-lu)?$/.test(lg)) Object.assign(LAY, LAYT.azerty);
    else if (/^de\b/.test(lg)) Object.assign(LAY, LAYT.qwertz);
  } catch {
    /* Use saved or QWERTY labels if the browser language is unavailable. */
  }
  try {
    const o = JSON.parse(localStorage.getItem("dk_lay") || "{}");
    for (const c in o) if (isCode(c) && typeof o[c] === "string" && o[c].length === 1) LAY[c] = o[c];
  } catch {
    /* Keep browser-language guesses when saved layout data is malformed or unavailable. */
  }
  try {
    if (navigator.keyboard && navigator.keyboard.getLayoutMap)
      navigator.keyboard
        .getLayoutMap()
        .then((m) => {
          let n = 0;
          for (let i = 65; i < 91; i++) {
            const c = "Key" + String.fromCharCode(i),
              v = m.get(c);
            if (typeof v === "string" && v.length === 1 && v.toLowerCase() !== v.toUpperCase()) {
              LAY[c] = v.toLowerCase();
              n++;
            }
          }
          if (n) {
            laySave();
            syncHK();
          }
        })
        .catch(() => {
          /* Keep saved or guessed labels if the browser cannot provide its layout map. */
        });
  } catch {
    /* Layout-map lookup is optional; retain saved or guessed labels. */
  }
}
/* the action a key press stands for: the character first, then the physical key, then a physical binding whose own letter was typed
   (a keyboard where that letter sits elsewhere and its place is taken by a character binding) */
export function kbAct(k, code) {
  let c = null,
    l = null;
  for (const a in KB) {
    const v = KB[a];
    if (v === k) return a;
    if (code && v === code) c = c || a;
    else if (isCode(v) && k.length === 1 && v[3].toLowerCase() === k) l = l || a;
  }
  return c || l;
}
/* label of a key: a physical key shows what it types here, unless that character is bound to something else (then its own letter works) */
export const kdisp = (k) => {
  if (isCode(k)) {
    const ch = LAY[k];
    if (ch) {
      let taken = false;
      for (const a in KB) if (KB[a] === ch) taken = true;
      if (!taken) return ch.toUpperCase();
    }
    return k[3];
  }
  return k === " " ? "Space" : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1);
};
/* the four camera keys in one word for the hints: "WASD", "ZQSD" */
export const camKeys = () => ["up", "left", "down", "right"].map((a) => kdisp(KB[a])).join("");

function syncHK() {
  for (const a of [
    "cannon",
    "peasant",
    "knight",
    "spearman",
    "archer",
    "bannerman",
    "captain",
    "wall",
    "gate",
    "tower",
    "path",
    "upgrade",
    "barracks",
    "farm",
    "storage",
    "house",
    "academy",
    "market",
    "forester",
    "guild",
    "torch",
    "rally",
    "rallyc",
    "movec",
    "rotate",
    "ramp",
    "tier",
    "demolish",
    "ballista",
    "trebuchet",
    "raise",
    "dig",
    "army",
    "idle",
    "form",
  ])
    HK[a] = kdisp(KB[a]);
}

/* keys: the defaults, then what the player saved. v93: the spearman default went from backslash (AltGr on AZERTY) to F4. Once per browser
   (marker dk_keyv), saved keys that still hold the old default move to F4, unless F4 was given to another action.
   v94 (marker 3), the same way: torch ' to F6, barracks rally - to F7, forester [ to F9, guild ] to F3 (none of the old keys has a plain
   key on AZERTY), and camera w a s d, turn z x, army q become the physical keys KeyW ... KeyQ. A key the player changed is left alone. */
const KMIG = [
  ["torch", "'", "f6"],
  ["rally", "-", "f7"],
  ["forester", "[", "f9"],
  ["guild", "]", "f3"],
  ["up", "w", "KeyW"],
  ["down", "s", "KeyS"],
  ["left", "a", "KeyA"],
  ["right", "d", "KeyD"],
  ["rotL", "z", "KeyZ"],
  ["rotR", "x", "KeyX"],
  ["army", "q", "KeyQ"],
];
export function loadKB() {
  KB = { ...KDEF };
  try {
    Object.assign(KB, JSON.parse(localStorage.getItem("dk_keys") || "{}"));
  } catch {
    /* Keep default key bindings when saved data is malformed or storage is unavailable. */
  }
  try {
    const v = localStorage.getItem("dk_keyv");
    if (v !== "3") {
      let ch = false;
      const has = (k) => Object.keys(KB).some((a) => KB[a] === k);
      if (v !== "2" && KB.spearman === "\\" && !has("f4")) {
        KB.spearman = "f4";
        ch = true;
      }
      for (const [a, o, n] of KMIG)
        if (KB[a] === o && !has(n)) {
          KB[a] = n;
          ch = true;
        }
      if (ch && localStorage.getItem("dk_keys")) localStorage.setItem("dk_keys", JSON.stringify(KB));
      localStorage.setItem("dk_keyv", "3");
    }
  } catch {
    /* Key migration is best-effort when storage is unavailable; the current key map remains active. */
  }
  syncHK();
}

export function saveKB() {
  try {
    localStorage.setItem("dk_keys", JSON.stringify(KB));
  } catch {
    /* Keyboard changes remain active for this session when storage is unavailable. */
  }
  syncHK();
}

function setGfx(v) {
  sceneState.GQ = v ? 1 : 0;
  GQU.value = sceneState.GQ;
  try {
    localStorage.setItem("dk_gfx", sceneState.GQ);
  } catch {
    /* Keep the graphics setting for this session when storage is unavailable. */
  }
  DRS.lv = 0;
  DRS.sum = DRS.cs = DRS.n = DRS.t = DRS.ok = DRS.chk = 0;
  DRS.noDn = DRS.noUp = 0;
  rs();
  if (SHADOWS) {
    const ss = sceneState.GQ ? 2048 : 1024;
    sun.shadow.mapSize.set(ss, ss);
    if (sun.shadow.map) {
      sun.shadow.map.dispose();
      sun.shadow.map = null;
    }
    renderer.shadowMap.needsUpdate = true;
  }
}

let setTab = 0;

export const settingsDebug = {
  tab(n) {
    setTab = n;
  },
};

/* tabs: 0 Game, 1 Display & sound (2 = its old Sound half), 3 Controls. Template: tabs as bevelled buttons, sections, full-width rows with the value on the right. */
export function drawSettings(UW, UH, fh, back) {
  const tb = setTab === 2 ? 1 : setTab,
    TABS = [
      ["Game", 0],
      ["Display & sound", 1],
      ["Controls", 3],
    ],
    ti = Math.max(
      0,
      TABS.findIndex((t) => t[1] === tb),
    );
  const b = kitScreen(UW, UH, {
    key: "set" + tb,
    title: "Settings",
    close: back,
    fh,
    maxW: tb === 3 ? 620 : 500,
    tabs: TABS.map((t) => [
      t[0],
      () => {
        setTab = t[1];
        settingsState.rebind = null;
      },
    ]),
    tab: ti,
  });
  const tog = (l, lab, on, set) =>
      l.row({
        label: lab,
        opts: [
          ["On", on, () => set(true)],
          ["Off", !on, () => set(false)],
        ],
        fn: () => set(!on),
      }),
    prow = (l, lab, k, d) => tog(l, lab, pref(k, d), (v) => setPref(k, v));
  if (tb === 3) {
    let y = b.y + 1;
    {
      const t = "Click a key, then press the new one  (Esc cancels)",
        rw = Math.min(110, b.w * 0.34);
      let sc = 0.78;
      while (sc > 0.6 && tw(t, sc) > b.w - rw - 8) sc -= 0.03;
      T_(t, b.x + 1, y + 5, "#d9b27a", sc);
      bevelBtn(
        b.x + b.w - rw,
        y,
        rw,
        18,
        "Reset keys",
        "dark",
        () => {
          KB = { ...KDEF };
          saveKB();
        },
        { sc: 0.85 },
      );
    }
    y += 25;
    const l = listBegin("set3", b.x, y, b.w, b.y + b.h - y),
      acts = Object.keys(KDEF),
      cols = Math.max(1, Math.min(3, Math.floor(b.w / 170))),
      cw = (b.w - (cols - 1) * 5) / cols,
      g = canvasesState.ctx;
    l.section("Keyboard");
    for (let i = 0; i < acts.length; i += cols) {
      for (let c = 0; c < cols && i + c < acts.length; c++) {
        const a = acts[i + c],
          on = settingsState.rebind === a,
          t = on ? "..." : kdisp(KB[a]);
        kitRow(b.x + c * (cw + 5), l.y, cw, 18, {
          label: ACTL[a],
          sc: 0.8,
          on,
          fn: () => {
            settingsState.rebind = a;
          },
          right: (rx, yy, h) => {
            g.font = "700 8px " + FFP;
            const w = Math.max(14, Math.ceil(g.measureText(t).width) + 8);
            keyChip(rx - w + 3, yy + (h - 13) / 2, t);
            return w;
          },
        });
      }
      l.gap(21);
    }
    listEnd();
    return;
  }
  const l = listBegin("set" + tb, b.x, b.y + 1, b.w, b.h - 1);
  if (tb === 1) {
    l.section("Sound");
    l.row({
      label: "Music",
      slider: {
        val: soundState.vM,
        set: (v) => {
          soundState.vM = v;
          applyVol();
          saveVol();
        },
      },
    });
    l.row({
      label: "Sound effects",
      slider: {
        val: soundState.vS,
        set: (v) => {
          soundState.vS = v;
          applyVol();
          saveVol();
          snd("tick");
        },
      },
    });
    l.section("Display");
    l.row({
      label: "Graphics",
      opts: [
        ["Ultra HD", 1],
        ["Fast", 0],
      ].map(([n, v]) => [n, sceneState.GQ === v, () => setGfx(v)]),
      fn: () => setGfx(sceneState.GQ ? 0 : 1),
    });
    {
      const SZ = [
          ["Small", 0.8],
          ["Normal", 1],
          ["Large", 1.25],
          ["Huge", 1.6],
        ],
        set = (v) => {
          uiMul = v;
          try {
            localStorage.setItem("dk_ui", v);
          } catch {
            /* Apply the interface scale for this session when storage is unavailable. */
          }
          rs();
        },
        ci = Math.max(
          0,
          SZ.findIndex((z) => Math.abs(uiMul - z[1]) < 0.01),
        );
      l.row({
        label: "Interface size",
        opts: SZ.map(([n, v], i) => [n, i === ci, () => set(v)]),
        fn: () => set(SZ[(ci + 1) % SZ.length][1]),
      });
    }

    tog(l, "Colour-blind mode", cbOn(), (v) => {
      cbSet(v);
      applyCB();
    });
  } else {
    l.section("General");
    l.row({
      label: "Language",
      value: LANGS[LANG][0],
      raw: false,
      fn: () => {
        languageState.langOpen = true;
        settingsState.settingsOpen = false;
      },
    });
    tog(l, "Quests", questsState.Q && sessionState.inGame ? !!questsState.Q.on : questsPref(), (on) => {
      if (sessionState.inGame) questSwitch(on);
      else {
        try {
          localStorage.setItem("dk_quests", on ? "1" : "0");
        } catch {
          /* Quest preferences cannot persist outside a game when storage is unavailable. */
        }
      }
    });
    prow(l, "Pause when away", "ap", true);
    prow(l, "Autosave", "as", true);
    {
      const on = pref("qi", false);
      l.row({
        label: "Studio intro",
        opts: [
          ["First launch only", on, () => setPref("qi", true)],
          ["Every launch", !on, () => setPref("qi", false)],
        ],
        fn: () => setPref("qi", !on),
      });
    }
    l.section("Accessibility");
    prow(l, "Reduce motion", "rm", false);
    l.section("Help");
    l.row({
      label: "Report a bug [F8]",
      fn: () => {
        settingsState.settingsOpen = false;
        bugReport();
      },
    });
  }
  listEnd();
}

export function settingsBack() {
  settingsState.settingsOpen = false;
  settingsState.rebind = null;
  setTab = 0;
  if (settingsState.fromGame) {
    settingsState.fromGame = false;
    startGame();
  }
}

export function initializeSettings() {
  nmI = document.createElement("input");
  nmI.type = "text";
  nmI.maxLength = 18;
  nmI.spellcheck = false;
  nmI.autocomplete = "off";
  nmI.setAttribute("aria-label", "Kingdom name");

  Object.assign(nmI.style, {
    position: "fixed",
    display: "none",
    zIndex: 5,
    color: "#f2e4c4",
    background: "#0b0f17",
    border: "1px solid #c9a24f",
    borderRadius: "0",
    padding: "0 7px",
    outline: "none",
    boxSizing: "border-box",
    fontWeight: "400",
    fontFamily: FF,
  });

  document.body.appendChild(nmI);
  nmI.value = THEME.n;
  nmI.oninput = () => {
    THEME.n = nmI.value.slice(0, 18) || "Nameless";
    saveTheme();
  };
  nmI.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") nmI.blur();
  };
  try {
    uiMul = +localStorage.getItem("dk_ui") || 1;
  } catch {
    /* Keep the default interface scale when saved preferences cannot be read. */
  }
  layInit();
  loadKB();
  applyCB();
}
