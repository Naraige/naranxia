/* ================= UI toolkit: vector icons, rounded panels, smooth text ================= */
const FF='"NaxNum","Marcellus","Palatino Linotype","Book Antiqua",Georgia,serif',FFT='"Cinzel","Marcellus",Georgia,serif';
try{document.fonts&&document.fonts.load('400 16px NaxNum','0')}catch(e){}
const fontOf=sz=>{const px=sz*1.25;return px>=16?'700 '+Math.round(px*.84)+'px '+FFT:'400 '+Math.round(px*.92)+'px '+FF};
const setF=(sz,w)=>{ctx.font=fontOf(sz)};
const TWM=new Map();try{if(document.fonts){document.fonts.addEventListener('loadingdone',()=>TWM.clear());document.fonts.ready.then(()=>TWM.clear())}}catch(e){}

/* ================= LANGUAGES =================
   Every text drawn by the interface goes through L(): exact phrases, then templates ("Wave {0}", "{0} has fallen to the horde"),
   then pieces split on separators. English is the source; the choice is kept per player. */
const LANGS=[['English','gb'],['Français','fr'],['Español','es'],['Deutsch','de'],['Italiano','it'],['Português','pt']];
let LANG=0;try{LANG=Math.max(0,Math.min(LANGS.length-1,+(localStorage.getItem('dk_lang')||0)|0))}catch(e){}
