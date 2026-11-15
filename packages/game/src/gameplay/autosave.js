import { pref } from "../core/prefs.js";
import { MP } from "../multiplayer/session.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { saveGame } from "../ui/save-menu.js";
import { sessionState } from "./session.js";

/* solo QoL: save to the slot "Autosave" every 3 minutes of play (not paused, not in a menu, not over) */
export function initializeAutosave() {
  setInterval(async () => {
    if (
      !pref("as", true) ||
      MP.on ||
      !sessionState.started ||
      !sessionState.inGame ||
      sessionState.over ||
      sessionState.paused ||
      document.hidden
    )
      return;
    await saveGame("Autosave", true);
    hudDisplayState.msgS = "Autosaved";
    hudDisplayState.msgT = 2;
  }, 180000);
}
