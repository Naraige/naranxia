import { bugReport, devToggle } from "../debug/tools.js";
import { build } from "../gameplay/construction.js";
import { ALERTS } from "../gameplay/economy.js";
import { TS } from "../gameplay/rules.js";
import { selectionState } from "../gameplay/selection.js";
import { sessionState } from "../gameplay/session.js";
import { mpChatI } from "../multiplayer/chat.js";
import { CAM } from "../rendering/scene.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { openMenu } from "../gameplay/lifecycle.js";
import { nmI, settingsDebug, settingsState } from "../ui/settings.js";
import { troopPanelState } from "../ui/troop-panel.js";

export function initializeShortcuts() {
  /* ---- Tab: jump to the last attack ---- */
  addEventListener("keydown", (e) => {
    if (e.key === "F8" && document.activeElement !== mpChatI && document.activeElement !== nmI) {
      e.preventDefault();
      bugReport();
      return;
    }
    if (e.key === "F1" && document.activeElement !== mpChatI && document.activeElement !== nmI) {
      e.preventDefault();
      if (sessionState.started && !settingsState.settingsOpen) {
        openMenu();
        settingsState.fromGame = true;
      }
      settingsState.settingsOpen = true;
      settingsDebug.tab(3);
      return;
    }
    if (e.key === "F10") {
      e.preventDefault();
      devToggle();
      return;
    }
    if (
      (e.key === "F2" || e.key === "²" || e.key === "`") &&
      sessionState.started &&
      document.activeElement !== mpChatI &&
      document.activeElement !== nmI
    ) {
      e.preventDefault();
      troopPanelState.troopsOpen = !troopPanelState.troopsOpen;
    }
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Tab" && sessionState.started) {
      e.preventDefault();
      const a = ALERTS[ALERTS.length - 1];
      if (a) {
        CAM.x = a.x / TS;
        CAM.z = a.y / TS;
      } else {
        hudDisplayState.msgS = "No recent attack";
        hudDisplayState.msgT = 2;
      }
    }
  });
}

export function initializeBuildShortcuts() {
  addEventListener("keydown", (e) => {
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      sessionState.inGame &&
      !sessionState.over &&
      selectionState.selB &&
      sessionState.structs.includes(selectionState.selB) &&
      selectionState.selB.t === 0 &&
      selectionState.selB.type !== "castle" &&
      document.activeElement === document.body
    ) {
      e.preventDefault();
      build("demolish", selectionState.selB.tx, selectionState.selB.ty);
    }
  });

  addEventListener("keydown", (_e) => {
    if (!sessionState.started || sessionState.over || document.activeElement === nmI) return;
  });
}
