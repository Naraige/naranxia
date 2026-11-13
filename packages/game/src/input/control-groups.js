import { snd } from "../audio/sound.js";
import { TS } from "../gameplay/rules.js";
import { sel } from "../gameplay/selection.js";
import { sessionState } from "../gameplay/session.js";
import { mpChatI } from "../multiplayer/chat.js";
import { CAM } from "../rendering/scene.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { nmI } from "../ui/settings.js";

/* ---- control groups: Shift+1..9 recall, Ctrl+1..9 (or Shift+Alt+1..9) save ---- */
const CG = {};

export function initializeControlGroups() {
  addEventListener(
    "keydown",
    (e) => {
      if (
        !sessionState.started ||
        sessionState.over ||
        document.activeElement === nmI ||
        document.activeElement === mpChatI
      )
        return;
      const m = /^Digit([1-9])$/.exec(e.code);
      if (!m || !(e.ctrlKey || e.shiftKey || e.metaKey)) return;
      const d = m[1];
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.ctrlKey || e.metaKey || (e.shiftKey && e.altKey)) {
        const S = sel().map((u) => u.uid);
        CG[d] = S;
        hudDisplayState.msgS = "Group " + d + " saved (" + S.length + ")";
        hudDisplayState.msgT = 2;
        snd("click");
      } else {
        const S = new Set(CG[d] || []);
        const L = sessionState.units.filter((u) => S.has(u.uid) && u.hp > 0 && !u.gar);
        if (!L.length) {
          hudDisplayState.msgS = "Group " + d + " is empty";
          hudDisplayState.msgT = 2;
          return;
        }
        const again = CG.last === d && Date.now() - (CG.lt || 0) < 450;
        sessionState.units.forEach((u) => (u.sel = false));
        L.forEach((u) => (u.sel = true));
        sessionState.mode = null;
        CG.last = d;
        CG.lt = Date.now();
        if (again) {
          CAM.x = L[0].x / TS;
          CAM.z = L[0].y / TS;
        }
        hudDisplayState.msgS = "Group " + d + " (" + L.length + ")";
        hudDisplayState.msgT = 2;
        snd("select");
      }
    },
    true,
  );
}
