import { bastionHas } from '../gameplay/economy.js';
import { EV_ESC, EV_ESCK, evChoose, evCur, evLeft, RENOWN_MAX, RENOWN_STEP, renownMul, renownOf } from '../gameplay/events.js';
import { LPL } from '../gameplay/players.js';
import { sessionState } from '../gameplay/session.js';
import { TC, TCf } from '../i18n/language.js';
import { uiBtn } from './build-menu.js';
import { BTN, BTNH, CHAT, frame, GRN, GRNH } from './drawing.js';
import { barX } from './hud-state.js';

/* ================= EVENT BAR (events-camps) =================
   A framed banner under the top bars while a choice event is open: a title with the seconds left and two buttons.
   Nothing here changes state: a click calls evChoose(0|1), which in co-op is a lockstep command ('ev'). The simulation goes on meanwhile. */
export function eventBar(UW, y) {
  const e = evCur();
  if (!e || sessionState.over || !sessionState.inGame) return 0;
  const p = LPL(), em = bastionHas(p, 'embassy') ? 1.5 : 1, secs = Math.ceil(evLeft());
  let title, labs, tips;
  if (e.k === 'car') {
    const a = e.a, g = Math.round(a.g * em), w = Math.round(a.w * em), s = Math.round(a.s * em);
    title = 'Merchant caravan';
    labs = ['Take the goods now', 'Escort it to market'];
    tips = [
      [labs[0], 'You receive ' + g + ' gold, ' + w + ' wood and ' + s + ' stone now', 'Chosen automatically when the time runs out'],
      [labs[1], 'Pays ' + Math.round(a.g * EV_ESCK * em) + ' gold in ' + EV_ESC + ' s, no wood or stone'],
    ];
  } else {
    const m = em * (e.mu || 1) * renownMul(p);
    title = e.cn ? 'Envoys of ' + e.cn : 'Rebel envoys';
    labs = ['Accept the tribute', 'Refuse and gain renown'];
    tips = [
      [labs[0], 'You receive ' + Math.round(e.a.g * m) + ' gold and ' + Math.round(e.a.f * m) + ' food', 'Chosen automatically when the time runs out'],
      [labs[1], 'Renown +1 (now ' + (renownOf(p) + 1) + '): rebel tributes pay ' + Math.round(RENOWN_STEP * 100) + '% more per point (max ' + RENOWN_MAX + ')'],
    ];
  }
  const w = Math.min(UW - 12, 330), h = 38, x = barX(UW, w, y, h), bw = Math.floor((w - 18) / 2);
  frame(x, y, w, h, CHAT, 8);
  TC(title + ' - ' + secs + ' s', x + w / 2, y + 4, '#ffd23c', .85);
  for (let i = 0; i < 2; i++) {
    uiBtn(x + 6 + i * (bw + 6), y + 17, bw, 17, i ? BTN : GRN, i ? BTNH : GRNH, () => evChoose(i), tips[i],
      (bx, by, bw2) => TCf(labs[i], bx + bw2 / 2, by + 4, '#fff', .8, bw2 - 8));
  }
  return h + 3;
}
