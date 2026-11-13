export const canvasesState = {
  ctx: undefined,
};

export let cv;
export let cw;
export let cwx;

export const cvs = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

export function initializeCanvases() {
  cv = document.getElementById("c");
  cw = document.getElementById("cw");
  cwx = cw.getContext("2d");
  canvasesState.ctx = cv.getContext("2d");
}
