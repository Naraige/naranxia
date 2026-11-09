import { L, T_, TC, TTL, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { mpOpen, mpOpenJoin } from '../multiplayer/lobby.js';
import { settingsState } from './settings.js';
import { uiBtn } from './build-menu.js';
import { canvasesState } from './canvases.js';
import { BTN, BTNH, PAN, focusRing } from './drawing.js';
import { footH, menuFooter } from './menu-footer.js';
import { NAV, navAdd, navBegin, navPoll } from './menu-nav.js';
import { ornLine } from './title-frame.js';
import { pill } from './minimap.js';
import { inR, U } from './hud.js';

/* ================= game mode choice (lot C): three cards with check / cross lines, keyboard and gamepad navigable =================
   The lines are what the code really does: solo = pause + speed, manual and auto saves, records and achievements, no second player;
   co-op = 2 players on one world (host seed), chat, automatic resync (mpResync), and NO saving (saveGame / autosave refuse while MP.on);
   join = type the host's code, the world is the host's seed, chat, the guest cannot pick the world. */
export const modeState = { open: false };

export function openModes() { modeState.open = true; NAV.sel = 0 }

const hostCoop = () => { mpOpen(); try { document.getElementById('mpBH').click() } catch (e) { } };

const CARDS = [
  { id: 'solo', name: 'Solo', sub: 'You alone against the horde', btn: 'Play', go: () => { modeState.open = false; settingsState.setupOpen = true },
    rows: [[1, 'Pause and game speed'], [1, 'Save and load'], [1, 'Records and achievements'], [0, 'Second player']] },
  { id: 'coop', name: 'Co-op', sub: 'Host a room for a friend', btn: 'Host', go: () => { modeState.open = false; hostCoop() },
    rows: [[1, '2 players, one world'], [1, 'Chat with your partner'], [1, 'Automatic resync'], [0, 'Save and load']] },
  { id: 'join', name: 'Join', sub: 'Enter a friend\'s room code', btn: 'Join', go: () => { modeState.open = false; mpOpenJoin() },
    rows: [[1, 'Enter the host\'s code'], [1, 'Same world as the host'], [1, 'Chat with your partner'], [0, 'Choose the world']] },
];

/* little pixel figures: 1 = solo, 2 = two players, 0 = a key-ring for the code */
function icon(id, cx, cy, u) {
  const g = canvasesState.ctx, fig = (x, y, body) => {
    g.fillStyle = '#1a0f08'; g.fillRect(x - 3 * u, y - 1 * u, 6 * u, 15 * u);
    g.fillStyle = '#d9a46c'; g.fillRect(x - 2 * u, y, 4 * u, 4 * u);
    g.fillStyle = body; g.fillRect(x - 2.5 * u, y + 4 * u, 5 * u, 8 * u);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x - 2.5 * u, y + 4 * u, 5 * u, u);
  };
  if (id === 'solo') fig(cx, cy - 7 * u, '#2f6fd6');
  else if (id === 'coop') { fig(cx - 5 * u, cy - 7 * u, '#2f6fd6'); fig(cx + 5 * u, cy - 7 * u, '#d6932f') }
  else {
    g.save(); g.translate(cx, cy); g.fillStyle = '#1a2a4a'; g.beginPath(); g.arc(0, 0, 8 * u, 0, 6.2832); g.fill();
    g.fillStyle = '#8fd0ff'; g.beginPath(); g.arc(0, 0, 6.4 * u, 0, 6.2832); g.fill(); g.fillStyle = '#2f7dd6'; g.fillRect(-u * 6.4, -u * 1, u * 12.8, u * 2); g.fillRect(-u * 1, -u * 6.4, u * 2, u * 12.8);
    g.fillStyle = '#3aa65a'; g.fillRect(-u * 4.5, -u * 4.5, u * 3, u * 3); g.restore();
  }
}

function mark(x, y, ok) {
  const g = canvasesState.ctx; g.save(); g.lineCap = 'butt'; g.lineWidth = 2;
  if (ok) { g.strokeStyle = '#62c88c'; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 3, y + 7); g.lineTo(x + 8, y + 1); g.stroke() }
  else { g.strokeStyle = '#de5454'; g.beginPath(); g.moveTo(x + 1, y + 1); g.lineTo(x + 8, y + 8); g.moveTo(x + 8, y + 1); g.lineTo(x + 1, y + 8); g.stroke() }
  g.restore();
}

export function drawModes(UW, UH, cx, back) {
  const g = canvasesState.ctx, fh = footH(UH), small = UH < 300, narrow = UW < 520;
  NAV.onEsc = back; navBegin(true); NAV.horiz = true; navPoll();
  g.fillStyle = 'rgba(3,4,9,.38)'; g.fillRect(0, 0, UW, UH);
  let y = Math.max(6, UH * (small ? .025 : .05));
  TTL('Choose your game', cx, y, small ? 1.45 : 1.9, 'center'); y += small ? 22 : 31;
  if (!small) { ornLine(cx, y, Math.min(UW - 40, 260)); y += 9 }
  TC('Pick how you want to hold the night.', cx, y + 2, '#c9bfa8', .85); y += small ? 14 : 18;
  const hv = (x, yy, w, h) => inR(inputState.mouse, U(x, yy, w, h)), bottom = UH - fh - 8;
  if (narrow) {
    /* one card at a time, three tabs on top (tap, or Left / Right) */
    const tw3 = Math.min(96, (UW - 20) / 3 - 4), tx = Math.round(cx - (tw3 * 3 + 8) / 2), ks = [];
    CARDS.forEach((c, i) => { ks.push(navAdd(c.go, hv(tx + i * (tw3 + 4), y, tw3, 16))) });
    const tab = NAV.sel >= 0 && NAV.sel < 3 ? NAV.sel : 0;
    CARDS.forEach((c, i) => pill(tx + i * (tw3 + 4), y, tw3, 16, c.name, BTN, BTNH, () => { NAV.sel = i }, null, .8, i === tab));
    y += 22;
    const W = Math.min(UW - 12, 260);
    cardAt(CARDS[tab], true, Math.round(cx - W / 2), y, W, Math.max(100, bottom - y), small, true);
  } else {
    const gap = 14, W = Math.min(190, Math.floor((UW - 24 - gap * 2) / 3)), x0 = Math.round(cx - (W * 3 + gap * 2) / 2), H = Math.min(small ? 190 : 240, bottom - y);
    CARDS.forEach((c, i) => { const k = navAdd(c.go, hv(x0 + i * (W + gap), y, W, H)); cardAt(c, NAV.sel === k || (NAV.sel < 0 && i === 0), x0 + i * (W + gap), y, W, H, small, false) });
  }
  menuFooter(UW, UH, [['Esc', 'Back', back], ['Enter', 'Select']]);
}

function cardAt(c, on, x, y, w, h, small, noRing) {
  const g = canvasesState.ctx;
  uiBtn(x, y, w, h, PAN, PAN, c.go, null, (X, Y, W, H) => {
    const cx = X + W / 2, u = small ? 1.5 : 2, rowH = small ? 15 : 24, bh = small ? 18 : 22;
    let yy = Y + (small ? 8 : 14);
    icon(c.id, cx, yy + 8 * u, u); yy += 16 * u + 4;
    TTL(c.name, cx, yy, small ? 1.25 : 1.6, 'center'); yy += small ? 15 : 22;
    let sc = .85; while (sc > .5 && tw(c.sub, sc) > W - 14) sc -= .04;
    TC(c.sub, cx, yy, '#b9ae96', sc); yy += small ? 13 : 17;
    ornLine(cx, yy, W - 24); yy += 6;
    const rows = Math.min(c.rows.length, Math.max(2, Math.floor((Y + H - bh - 12 - yy) / rowH)));
    for (let r = 0; r < rows; r++) {
      const [ok, t] = c.rows[r], ry = yy + r * rowH;
      if (r % 2 === 0) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(X + 6, ry, W - 12, rowH) }
      mark(X + 12, ry + (rowH - 9) / 2, ok);
      let s2 = .85; while (s2 > .5 && tw(t, s2) > W - 40) s2 -= .04;
      T_(t, X + 28, ry + (rowH - 9 * s2) / 2 + .5, ok ? '#f0e8d6' : '#8b8678', s2);
    }
  }, false, false, false);
  pill(x + 10, y + h - (small ? 24 : 30), w - 20, small ? 18 : 22, c.btn, BTN, BTNH, c.go, null, 1, on);
  if (on && !noRing) focusRing(x - 2, y - 2, w + 4, h + 4);
}
