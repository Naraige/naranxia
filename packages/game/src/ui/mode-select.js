import { T_, TC, tw } from "../i18n/language.js";
import { inputState } from "../input/state.js";
import { mpOpen, mpOpenJoin } from "../multiplayer/lobby.js";
import { canvasesState } from "./canvases.js";
import { focusRing } from "./drawing.js";
import { footH, menuFooter } from "./menu-footer.js";
import { bevelBtn, KC, kitEnd, kitHitAdd, kitScreen, kitTabs, pxText } from "./menu-kit.js";
import { NAV, navAdd, navBegin, navPoll } from "./menu-nav.js";
import { inR, U } from "./hud.js";
import { modeState, settingsState } from "./panel-state.js";

/* ================= game mode choice (lot C): three cards with check / cross lines, keyboard and gamepad navigable =================
   The lines are what the code really does: solo = pause + speed, manual and auto saves, records and achievements, no second player;
   co-op = 2 players on one world (host seed), chat, automatic resync (mpResync), and NO saving (saveGame / autosave refuse while MP.on);
   join = type the host's code, the world is the host's seed, chat, the guest cannot pick the world. */
export { modeState };

export function openModes() {
  modeState.open = true;
  NAV.sel = 0;
}

const hostCoop = () => {
  mpOpen();
  try {
    document.getElementById("mpBH").click();
  } catch {
    /* Leave the co-op modal open if its host button is unavailable. */
  }
};

const CARDS = [
  {
    id: "solo",
    name: "Solo",
    sub: "You alone against the horde",
    btn: "Play",
    go: () => {
      modeState.open = false;
      settingsState.setupOpen = true;
    },
    rows: [
      [1, "Pause and game speed"],
      [1, "Save and load"],
      [1, "Records and achievements"],
      [0, "Second player"],
    ],
  },
  {
    id: "coop",
    name: "Co-op",
    sub: "Host a room for a friend",
    btn: "Host",
    go: () => {
      modeState.open = false;
      hostCoop();
    },
    rows: [
      [1, "2 players, one world"],
      [1, "Chat with your partner"],
      [1, "Automatic resync"],
      [0, "Save and load"],
    ],
  },
  {
    id: "join",
    name: "Join",
    sub: "Enter a friend's room code",
    btn: "Join",
    go: () => {
      modeState.open = false;
      mpOpenJoin();
    },
    rows: [
      [1, "Enter the host's code"],
      [1, "Same world as the host"],
      [1, "Chat with your partner"],
      [0, "Choose the world"],
    ],
  },
];

/* the current mode: shown on the title band over the Play button, kept in localStorage (dk_mode). Picking a card selects it and returns to the title;
   the button inside a card starts that mode at once. Never read by the simulation. */
let MODE = null;
export function curMode() {
  if (MODE === null) {
    try {
      MODE = localStorage.getItem("dk_mode");
    } catch {
      /* The fallback below selects solo mode when storage cannot be read. */
    }
    if (!CARDS.some((c) => c.id === MODE)) MODE = "solo";
  }
  return CARDS.find((c) => c.id === MODE);
}
export function setMode(id) {
  MODE = id;
  try {
    localStorage.setItem("dk_mode", id);
  } catch {
    /* Keep the selected mode for this session when storage is unavailable. */
  }
}
export function playMode() {
  curMode().go();
}
export function modeIcon(id, cx, cy, u) {
  icon(id, cx, cy, u);
}

/* little pixel figures: 1 = solo, 2 = two players, 0 = a key-ring for the code */
function icon(id, cx, cy, u) {
  const g = canvasesState.ctx,
    fig = (x, y, body) => {
      g.fillStyle = "#1a0f08";
      g.fillRect(x - 3 * u, y - 1 * u, 6 * u, 15 * u);
      g.fillStyle = "#d9a46c";
      g.fillRect(x - 2 * u, y, 4 * u, 4 * u);
      g.fillStyle = body;
      g.fillRect(x - 2.5 * u, y + 4 * u, 5 * u, 8 * u);
      g.fillStyle = "rgba(255,255,255,.22)";
      g.fillRect(x - 2.5 * u, y + 4 * u, 5 * u, u);
    };
  if (id === "solo") fig(cx, cy - 7 * u, "#2f6fd6");
  else if (id === "coop") {
    fig(cx - 5 * u, cy - 7 * u, "#2f6fd6");
    fig(cx + 5 * u, cy - 7 * u, "#d6932f");
  } else {
    g.save();
    g.translate(cx, cy);
    g.fillStyle = "#1a2a4a";
    g.beginPath();
    g.arc(0, 0, 8 * u, 0, 6.2832);
    g.fill();
    g.fillStyle = "#8fd0ff";
    g.beginPath();
    g.arc(0, 0, 6.4 * u, 0, 6.2832);
    g.fill();
    g.fillStyle = "#2f7dd6";
    g.fillRect(-u * 6.4, -u * 1, u * 12.8, u * 2);
    g.fillRect(-u * 1, -u * 6.4, u * 2, u * 12.8);
    g.fillStyle = "#3aa65a";
    g.fillRect(-u * 4.5, -u * 4.5, u * 3, u * 3);
    g.restore();
  }
}

function mark(x, y, ok) {
  const g = canvasesState.ctx;
  g.save();
  g.lineCap = "butt";
  g.lineWidth = 2;
  if (ok) {
    g.strokeStyle = "#62c88c";
    g.beginPath();
    g.moveTo(x, y + 4);
    g.lineTo(x + 3, y + 7);
    g.lineTo(x + 8, y + 1);
    g.stroke();
  } else {
    g.strokeStyle = "#de5454";
    g.beginPath();
    g.moveTo(x + 1, y + 1);
    g.lineTo(x + 8, y + 8);
    g.moveTo(x + 8, y + 1);
    g.lineTo(x + 1, y + 8);
    g.stroke();
  }
  g.restore();
}

export function drawModes(UW, UH, cx, back) {
  const fh = footH(UH),
    narrow = UW < 520;
  NAV.onEsc = back;
  navBegin(true);
  NAV.horiz = true;
  navPoll();
  const b = kitScreen(UW, UH, { key: "mod", title: "Choose your game", close: back, fh, maxW: 620 }),
    low = b.h < 220;
  let y = b.y + 1;
  T_("Pick how you want to hold the night.", b.x + 1, y, KC.dim, 0.85);
  y += low ? 13 : 17;
  const hv = (x, yy, w, h) => inR(inputState.mouse, U(x, yy, w, h)),
    bottom = b.y + b.h,
    cur = curMode().id,
    pick = (c) => () => {
      setMode(c.id);
      back();
    };
  if (narrow) {
    /* one card at a time, three tabs on top (tap, or Left / Right) */
    CARDS.forEach((c) => navAdd(pick(c), false));
    const tab =
      NAV.sel >= 0 && NAV.sel < 3
        ? NAV.sel
        : Math.max(
            0,
            CARDS.findIndex((c) => c.id === cur),
          );
    if (NAV.sel < 0) NAV.sel = tab;
    y += 3;
    kitTabs(
      b.x,
      y,
      b.w,
      CARDS.map((c, i) => [
        c.name,
        () => {
          NAV.sel = i;
        },
      ]),
      tab,
      18,
      false,
    );
    y += 24;
    const W = Math.min(b.w, 260);
    cardAt(
      CARDS[tab],
      false,
      Math.round(cx - W / 2),
      y,
      W,
      Math.max(100, bottom - y),
      low,
      CARDS[tab].id === cur,
      pick(CARDS[tab]),
      false,
    );
  } else {
    const gap = 12,
      W = Math.min(196, Math.floor((b.w - gap * 2) / 3)),
      x0 = Math.round(cx - (W * 3 + gap * 2) / 2),
      H = Math.min(low ? 190 : 236, bottom - y);
    CARDS.forEach((c, i) => {
      const x = x0 + i * (W + gap),
        k = navAdd(pick(c), hv(x, y, W, H));
      cardAt(c, NAV.sel === k, x, y, W, H, low, c.id === cur, pick(c), hv(x, y, W, H));
    });
  }
  kitEnd();
  menuFooter(UW, UH, [
    ["Esc", "Back", back],
    ["Enter", "Select"],
  ]);
}

/* a mode card: dark slab, the current mode ringed in gold with a check badge; the bevelled button starts the mode at once */
function cardAt(c, foc, x, y, w, h, small, cur, pick, hover) {
  const g = canvasesState.ctx,
    lit = foc || hover;
  g.fillStyle = "rgba(0,0,0,.4)";
  g.fillRect(x + 1, y + 3, w, h);
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, lit ? "#2c3040" : "#20232d");
  gr.addColorStop(1, lit ? "#1c1f2a" : "#15171e");
  g.fillStyle = gr;
  g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(255,255,255,.07)";
  g.fillRect(x, y, w, 1);
  g.fillStyle = cur ? "#f0cd73" : lit ? "rgba(240,205,115,.6)" : "rgba(184,149,76,.35)";
  {
    const t = cur ? 2 : 1;
    g.fillRect(x, y, w, t);
    g.fillRect(x, y + h - t, w, t);
    g.fillRect(x, y, t, h);
    g.fillRect(x + w - t, y, t, h);
  }
  if (cur) {
    g.fillStyle = "#f0cd73";
    g.fillRect(x + w - 17, y, 17, 15);
    g.strokeStyle = "#2a1804";
    g.lineWidth = 2;
    g.lineCap = "butt";
    g.beginPath();
    g.moveTo(x + w - 13, y + 7);
    g.lineTo(x + w - 10, y + 10);
    g.lineTo(x + w - 4.5, y + 3.5);
    g.stroke();
  }
  const cx = x + w / 2,
    u = small ? 1.5 : 2,
    rowH = small ? 15 : 22,
    bh = small ? 20 : 26;
  let yy = y + (small ? 7 : 12);
  icon(c.id, cx, yy + 8 * u, u);
  yy += 16 * u + (small ? 3 : 6);
  pxText(c.name, cx, yy + 8, small ? 14 : 18, "#ffd86b", { al: "center", max: w - 16 });
  yy += small ? 16 : 22;
  let sc = 0.85;
  while (sc > 0.5 && tw(c.sub, sc) > w - 14) sc -= 0.04;
  TC(c.sub, cx, yy, "#b9ae96", sc);
  yy += small ? 13 : 17;
  g.fillStyle = "rgba(184,149,76,.35)";
  g.fillRect(x + 10, yy, w - 20, 1);
  yy += 5;
  const rows = Math.min(c.rows.length, Math.max(2, Math.floor((y + h - bh - 14 - yy) / rowH)));
  for (let r = 0; r < rows; r++) {
    const [ok, t] = c.rows[r],
      ry = yy + r * rowH;
    if (r % 2 === 0) {
      g.fillStyle = "rgba(255,255,255,.04)";
      g.fillRect(x + 6, ry, w - 12, rowH);
    }
    mark(x + 12, ry + (rowH - 9) / 2, ok);
    let s2 = 0.85;
    while (s2 > 0.5 && tw(t, s2) > w - 40) s2 -= 0.04;
    T_(t, x + 28, ry + (rowH - 9 * s2) / 2 + 0.5, ok ? "#f0e8d6" : "#8b8678", s2);
  }
  bevelBtn(x + 10, y + h - bh - 9, w - 20, bh, c.btn, "go", c.go, { nav: false });
  if (foc) focusRing(x - 2, y - 2, w + 4, h + 4);
  kitHitAdd(x, y, w, h, pick);
}
