import { canvasesState } from './canvases.js';

/* ================= UI toolkit: vector icons, rounded panels, smooth text ================= */
export const FF='"NaxNum","Marcellus","Palatino Linotype","Book Antiqua",Georgia,serif',FFT='"Cinzel","Marcellus",Georgia,serif';

export const fontOf=sz=>{const px=sz*1.25;return px>=16?'700 '+Math.round(px*.84)+'px '+FFT:'400 '+Math.round(px*.92)+'px '+FF};

export const setF=(sz,w)=>{canvasesState.ctx.font=fontOf(sz)};

export const TWM=new Map();

export function initializeTypography() {
  try{document.fonts&&document.fonts.load('400 16px NaxNum','0')}catch(e){}
  try{if(document.fonts){document.fonts.addEventListener('loadingdone',()=>TWM.clear());document.fonts.ready.then(()=>TWM.clear())}}catch(e){}
}
