import { hex } from '../core/math.js';

export const PAL=[['Azure','#3f6fd0','#8ab4ff'],['Crimson','#c8353a','#ff9a8a'],['Emerald','#2f9a55','#8be0a8'],['Amber','#d9a020','#ffe08a'],['Violet','#7a48c8','#c8a8ff'],['Teal','#1f9aa8','#8ae8f0'],['Ember','#e0702a','#ffc08a'],['Night','#3a3f4c','#c4cad8'],['Rose','#d0507e','#ffb0cc'],['Forest','#2c6a34','#9ad49a'],['Gold','#c9a227','#fff0a0'],['Ivory','#d8cfb8','#fffaf0'],['Sky','#4aa8e0','#c0e8ff'],['Wine','#7a2338','#e08aa0']];

export const KNAMES=['Ashvale','Brightmoor','Crowhold','Dunhaven','Eldermere','Frostmark','Goldcrest','Highwatch','Ironvale','Oakenshield','Stormreach','Whitecliff','Redmere','Silverfen'];

export let THEME;

export const thp=()=>PAL[THEME.c][1],ths=()=>PAL[THEME.c][2],thd=()=>{const h=hex(PAL[THEME.c][1]);return '#'+h.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join('')};

export function initializeKingdomTheme() {
  THEME = {n:KNAMES[(Math.random()*KNAMES.length)|0],c:0,e:0,c2:10,p:0};

  try{const t=JSON.parse(localStorage.getItem('dk_theme')||'null');if(t&&typeof t.n==='string')THEME={n:t.n.slice(0,18),c:Math.abs(t.c|0)%PAL.length,e:Math.abs(t.e|0)%16,c2:t.c2==null?10:Math.abs(t.c2|0)%PAL.length,p:Math.abs(t.p|0)%8}}catch(e){}
}
