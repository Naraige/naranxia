export const inputState = {
  ptr: null,
  uiDown: 0 /* time (ms) of the last press on a UI button: drives the pressed look only */,
  box: null,
  fslots: null /* formation slot preview (iterable of slots), set each frame by core/frame-loop.js, visual only */,
  panMode: false,
  mouse: { x: -1, y: -1 },
  DPR: 1,
  /* touch mode (set by a first finger touch or a coarse pointer): bigger UI scale, 44 px hit slop, long-press tips, floating buttons. Visual and input only. */
  touch: (() => {
    try {
      return matchMedia("(pointer:coarse)").matches;
    } catch {
      return false;
    }
  })(),
  lp: null,
};

export const keys = {};
