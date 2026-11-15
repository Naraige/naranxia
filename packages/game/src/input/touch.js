import { order } from "../gameplay/formations.js";
import { TS, TW } from "../gameplay/rules.js";
import { sel } from "../gameplay/selection.js";
import { sessionState } from "../gameplay/session.js";
import { panCam, pickUnit } from "./desktop.js";
import { inputState } from "./state.js";
import { wpos } from "../rendering/camera.js";
import { rs } from "../rendering/resolution.js";
import { puff } from "../rendering/effects.js";
import { CAM } from "../rendering/scene.js";
import { pickStruct } from "../rendering/structures.js";
import { cv } from "../ui/canvases.js";
import { hudState } from "../ui/hud.js";
import { occ } from "../world/terrain-state.js";

/* ================= TOUCH MODE (#17) =================
   Pointer events already give taps and drags. Added here for a finger (capture phase, before the mouse handlers):
   two fingers = pinch to zoom and drag to move the camera; one tap on empty ground with units selected = move order (the right click),
   a tap on a unit or building still selects it. The 'Pan' button in the menu stays for one-finger camera moves. Mouse play is unchanged. */
const TCH = new Map();
let TG = null,
  TGEND = false,
  TCHON = false;

const tchK = () => cv.width / Math.max(1, cv.getBoundingClientRect().width);

const tchUp = (e) => {
  if (e.pointerType !== "touch") return;
  const swallow = TG || TGEND;
  TCH.delete(e.pointerId);
  if (TCH.size < 2) TG = null;
  if (swallow) {
    if (!TCH.size) TGEND = false;
    inputState.ptr = null;
    inputState.box = null;
    e.stopImmediatePropagation();
    return;
  }
  /* one-finger tap on empty ground with units selected: the right click */
  if (
    TCHON &&
    inputState.ptr &&
    inputState.ptr.m <= 8 &&
    inputState.ptr.btn === 0 &&
    !sessionState.mode &&
    sessionState.started &&
    !sessionState.over &&
    !sessionState.showMap &&
    sel().length
  ) {
    const w = wpos();
    if (
      !pickUnit(inputState.mouse) &&
      !pickStruct(inputState.mouse) &&
      !occ.get(Math.floor(w.y / TS) * TW + Math.floor(w.x / TS))
    ) {
      order(w);
      puff(w.x, w.y, "#ffe14a", 8, 40);
      inputState.ptr = null;
      inputState.box = null;
      e.stopImmediatePropagation();
    }
  }
};

export function initializeTouch() {
  addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType !== "touch" || e.target !== cv) return;
      TCHON = true;
      if (!inputState.touch) {
        inputState.touch = true;
        rs();
      }
      TCH.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (TCH.size === 2) {
        inputState.ptr = null;
        inputState.box = null;
        hudState.mmDrag = false;
        const [a, b] = [...TCH.values()];
        TG = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
        TGEND = true;
      }
      if (TCH.size >= 2) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "touch" || !TCH.has(e.pointerId)) return;
      TCH.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (TCH.size >= 2 && TG) {
        const [a, b] = [...TCH.values()],
          d = Math.hypot(a.x - b.x, a.y - b.y),
          cx = (a.x + b.x) / 2,
          cy = (a.y + b.y) / 2;
        if (sessionState.started && !sessionState.showMap) {
          if (d > 8 && TG.d > 8) CAM.dist = Math.max(7, Math.min(80, (CAM.dist * TG.d) / d));
          panCam((cx - TG.cx) * tchK(), (cy - TG.cy) * tchK());
        }
        TG = { d, cx, cy };
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  addEventListener("pointerup", tchUp, true);
  addEventListener(
    "pointercancel",
    (e) => {
      if (e.pointerType === "touch") {
        TCH.delete(e.pointerId);
        if (TCH.size < 2) TG = null;
        if (!TCH.size) TGEND = false;
      }
    },
    true,
  );
}
