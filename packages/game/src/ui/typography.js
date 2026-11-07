import { canvasesState } from './canvases.js';

/* ================= UI toolkit: vector icons, rounded panels, smooth text ================= */
export const FF='"Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif',FFT='"Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif';

export const fontOf=sz=>{const px=sz*1.25;return px>=16?'700 '+Math.round(px*.8)+'px '+FFT:'500 '+Math.round(px*.88)+'px '+FF};

export const setF=(sz,w)=>{canvasesState.ctx.font=fontOf(sz)};

export const TWM=new Map();

export function initializeTypography() {
  try{document.fonts&&document.fonts.load('500 16px Inter','0')}catch(e){}
  try{if(document.fonts){document.fonts.addEventListener('loadingdone',()=>TWM.clear());document.fonts.ready.then(()=>TWM.clear())}}catch(e){}
}
