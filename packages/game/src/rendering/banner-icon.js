import { hex } from '../core/math.js';
import { bannerPattern } from './kingdom-banner.js';
import { BANNER } from './structures.js';
import { cvs } from '../ui/canvases.js';
import { PAL, THEME } from '../ui/kingdom-theme.js';

/* ================= BANNER BOARD (docs/studio-boards/banner): the kingdom banner picture of the HUD and the menus =================
   BANNER2 is the single switch: '' = the current picture (A, the 128x192 BANNER canvas, also the texture of the stone banners),
   'B' = the bannerman's standard (spear point, pennant, crossbar, swallow tail), 'C' = gonfalon on a side pole (title scene),
   'D' = wall banner hung from a gold rod (pointed cloth). B, C, D are pixel sprites on a 24x36 grid (same 2:3 box as A), drawn from
   the kingdom theme (colour, 2nd colour, pattern, emblem). Two letters = small picture (HUD, save list) then large one (New kingdom
   card), e.g. 'CB'; 'A' = current. window.__BANNER2 overrides it for previews only.
   Visual only: never read by the simulation; the 3D banner texture is not changed. */
export const BANNER2='C';

export const banner2Sig=()=>typeof window!=='undefined'&&window.__BANNER2!==undefined?String(window.__BANNER2):BANNER2;

const W=24,H=36,UP=8,OUT='#17121c',WD=['#8a5a2a','#6b4423','#4a2e14'],GD=['#f0cc5c','#d4a234','#9a6e1e'],ST=['#ffffff','#c9ced6','#8a909c'];
const mul=(c,k)=>'#'+hex(c).map(v=>Math.max(0,Math.min(255,Math.round(k>1?v+(255-v)*(k-1):v*k))).toString(16).padStart(2,'0')).join('');

/* the 16 emblems of EMB (same order) redrawn on an 11x11 pixel grid */
const EMB11=[
 '....###....|....###....|....###....|###########|###########|###########|....###....|....###....|....###....|....###....|....###....',
 '.....#.....|.....#.....|....###....|###########|.#########.|..#######..|...#####...|..#######..|..###.###..|.##.....##.|.#.......#.',
 '...........|#....#....#|#....#....#|##..###..##|###.###.###|###########|###########|###########|.#########.|###########|###########',
 '#.........#|##.......##|.##.....##.|..##...##..|...##.##...|....###....|...##.##...|..##...##..|####...####|.##.....##.|##.......##',
 '##.##.##.##|##.##.##.##|###########|###########|.#########.|..#######..|..#######..|..###.###..|..##...##..|..##...##..|.#########.',
 '.....#.....|.#...#...#.|..#.....#..|....###....|...#####...|##.#####.##|...#####...|....###....|..#.....#..|.#...#...#.|.....#.....',
 '.....#.....|....###....|...#####...|..#######..|....###....|...#####...|..#######..|.#########.|....###....|....###....|...#####...',
 '......###..|.....###...|....###....|...###.....|..#######..|.....###...|....###....|...###.....|..###......|..##.......|..#........',
 '...####....|..####.....|.####....#.|.###....###|####.....#.|####.......|####.......|.####....#.|.#####..##.|..#######..|...#####...',
 '....###....|....#.#....|....###....|.....#.....|..#######..|.....#.....|.....#.....|#....#....#|##...#...##|.###.#.###.|...#####...',
 '....###....|...#####...|...##.##...|...#####...|....###....|.....#.....|.....#.....|.....###...|.....#.....|.....###...|.....#.....',
 '.....###...|....######.|...#######.|...#######.|....#####..|...##.##...|..##.......|.##........|##.........|#..........|...........',
 '.....#.....|....###....|....###....|#...###...#|##..###..##|###.###.###|.#########.|...#####...|.#########.|...#####...|....###....',
 '.....#.....|....###....|#...###...#|##.#####.##|###########|.#########.|..#######..|...#####...|...#####...|..##.#.##..|.....#.....',
 '.....#.....|.....##....|....###....|...####....|..######...|..#######..|.####.###..|.###...###.|.###...###.|..###.###..|...#####...',
 '###########|###########|#####.#####|####...####|###..#..###|##..###..##|.#########.|.#########.|..#######..|...#####...|.....#.....'].map(s=>s.split('|'));

/* the theme pattern (bannerPattern, the vector one) cut to hard pixels on a w x h cloth */
function patMask(p,w,h){const m=new Uint8Array(w*h);if(!p)return m;const c=cvs(w,h),g=c.getContext('2d');bannerPattern(g,w,h,p,'#000');const d=g.getImageData(0,0,w,h).data;for(let i=0;i<w*h;i++)m[i]=d[i*4+3]>=128?1:0;return m}

function sprite(v){const c=THEME.c|0,P=PAL[c][1],S=PAL[c][2],C2=PAL[THEME.c2|0][1],silver=c===3||c===10||c===11,M=silver?['#ffffff','#d6dce8','#8a94a8']:['#fff1b0','#f2c64a','#a8741a'],
  px=new Array(W*H).fill(null),at=(x,y)=>x>=0&&y>=0&&x<W&&y<H?px[y*W+x]:null,set=(x,y,col)=>{if(x>=0&&y>=0&&x<W&&y<H)px[y*W+x]=col},
  R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col)},
  /* a wooden pole 3 px wide (light, mid, dark), a gold knob 2x2 */
  pole=(x,y,h)=>{R(x,y,1,h,WD[0]);R(x+1,y,1,h,WD[1]);R(x+2,y,1,h,WD[2])},knob=(x,y)=>{R(x,y,2,2,GD[1]);set(x,y,GD[0]);set(x+1,y+1,GD[2])},
  /* cloth: field in the kingdom colour with the pattern in the 2nd colour, fold shading every 4th column, darker towards the bottom, a 1 px edge */
  cloth=(x0,y0,w,h,inside,edge)=>{const pm=patMask(THEME.p|0,w,h),m=(i,j)=>i>=0&&j>=0&&i<w&&j<h&&inside(i,j);
   for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(!m(i,j))continue;let col=pm[j*w+i]?C2:P;if(i%4===3)col=mul(col,.84);else if(i%4===1)col=mul(col,1.1);if(j>h*.6)col=mul(col,.9);
    if(!m(i-1,j)||!m(i+1,j)||!m(i,j+1))col=typeof edge==='function'?edge(i,j):edge;set(x0+i,y0+j,col)}},
  /* emblem: 3 metal tones (lit from the top), a dark rim cut into the cloth */
  emb=(x0,y0)=>{const E=EMB11[(THEME.e|0)%EMB11.length],on=(i,j)=>j>=0&&j<11&&i>=0&&i<11&&E[j][i]==='#';
   for(let j=-1;j<12;j++)for(let i=-1;i<12;i++){if(on(i,j))set(x0+i,y0+j,!on(i,j-1)?M[0]:(!on(i,j+1)||!on(i+1,j))?M[2]:M[1]);
    else if(on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1)||on(i-1,j-1)){const q=at(x0+i,y0+j);if(q)set(x0+i,y0+j,mul(q,.5))}}},
  pennant=(x,y)=>{R(x,y,5,1,mul(P,1.18));R(x,y+1,7,1,P);R(x+5,y+1,2,1,S);R(x,y+2,4,1,mul(P,.78))};
 if(v==='B'){ /* the bannerman's standard: spear point, pennant, crossbar with gold knobs, gold-edged cloth, swallow tail, the pole showing below */
  pole(10,5,30);R(10,4,3,1,GD[1]);set(10,4,GD[0]);set(11,1,ST[0]);set(10,2,ST[1]);set(11,2,ST[0]);set(12,2,ST[2]);set(11,3,ST[1]);R(10,32,3,1,GD[1]);
  pennant(13,5);R(3,8,17,1,WD[0]);R(3,9,17,1,WD[1]);knob(1,8);knob(20,8);
  cloth(3,10,17,21,(i,j)=>j<16||Math.abs(i-8)>=(j-15)*1.4,GD[1]);R(3,10,17,1,GD[1]);R(4,10,15,1,GD[0]);R(4,11,15,1,mul(P,.68));R(4,24,15,1,GD[1]);
  emb(6,12);set(4,31,GD[2]);set(18,31,GD[2])}
 else if(v==='C'){ /* gonfalon of the title scene: tall pole on a stone foot, gold ball, an arm carrying the cloth, dagged bottom, pennant at the top */
  pole(3,4,29);R(3,1,3,3,GD[1]);set(3,1,GD[0]);set(4,1,GD[0]);set(5,3,GD[2]);R(1,33,7,2,ST[1]);R(1,34,7,1,ST[2]);set(1,33,ST[0]);
  pennant(6,2);R(6,6,15,1,WD[0]);R(6,7,15,1,WD[1]);knob(21,6);set(6,8,WD[2]);set(7,8,WD[2]);set(6,9,WD[2]);
  cloth(8,8,13,22,(i,j)=>j<20||[1,2,1,0][i%4]>j-20,GD[1]);R(8,8,13,1,GD[1]);R(9,8,11,1,GD[0]);R(9,9,11,1,mul(P,.68));
  emb(9,12)}
 else{ /* 'D' wall banner: nail and cords, gold rod with ball ends, wide cloth with a light edge ending in a point, gold tassel */
  set(11,1,ST[0]);set(11,2,ST[2]);for(const s of[-1,1]){R(11+s*2-(s<0?1:0),2,2,1,'#c8a070');R(11+s*4-(s<0?2:0),3,3,1,'#c8a070');R(11+s*7-(s<0?1:0),4,2,1,'#a8824e')}
  R(2,5,19,1,GD[0]);R(2,6,19,1,GD[2]);knob(1,5);knob(20,5);
  cloth(3,7,17,27,(i,j)=>j<19||Math.abs(i-8)<=26-j,S);R(4,7,15,1,mul(P,.68));
  emb(6,11);set(11,34,GD[1])}
 /* dark ink outline, as the other pixel icons */
 const o=px.slice();for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!px[y*W+x]&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)))o[y*W+x]=OUT;
 const cv=cvs(W*UP,H*UP),g=cv.getContext('2d');for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(o[y*W+x]){g.fillStyle=o[y*W+x];g.fillRect(x*UP,y*UP,UP,UP)}
 return cv}

const CACHE={};

/* the picture every menu and the HUD draw in a 2:3 box: switch off = the BANNER canvas itself */
export function bannerIcon(large){const q=banner2Sig(),v=q.length>1?q[large?1:0]:q;if(v!=='B'&&v!=='C'&&v!=='D')return BANNER;
 const k=v+'|'+THEME.c+'|'+THEME.c2+'|'+THEME.p+'|'+THEME.e;return CACHE[k]||(CACHE[k]=sprite(v))}
