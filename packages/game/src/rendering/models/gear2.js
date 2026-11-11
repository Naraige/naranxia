import { newG, toGeo } from '../geometry.js';
import { PDP, pxBox, pxN, pxScene, PXV, teamPal } from './pixel-geometry.js';
import { pxSpriteF } from './weapons.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ================= GEAR BOARD, LOOK B (switch: gear-style.js) =================
   Every hand-held item redrawn as one family, in the Blockbench item manner: voxel weapons on the pixel grid of the units
   (1 cell = 1 unit pixel, where the current blades use half pixels), flat pixel-art parts for blades and heads, chunky 3D parts
   for guards, sockets, pommels and hammer heads. One shared palette (gearPal) with the tones of the unit skins of look B:
   ST steel, BL polished blade steel (one step brighter), IR iron, GO gold, WD wood, WL light wood (hafts, bow), LE leather, CL cloth, RU ruby, BZ bronze, SN stone; each from dark [0] to glint [4],
   3 to 4 of them on any one part (lit top row and top face, dark lip and underside, a few worn pixels: the rule of pxTone).
   Our own designs; sizes, grips and anchors are those of the current items (the animation code is untouched).
   Tool space: x = thickness, y = width, z = length, grip at the origin, the striking edge faces -y. Units: pixels. */
let GM=null;

export const gearPal=()=>GM||(GM={
 ST:PDP(['#3d4048','#6d717a','#949aa3','#c4c8ce','#eceff2']),
 BL:PDP(['#55585f','#7f848d','#aab0b8','#d3d7dc','#f6f8fa']),
 IR:PDP(['#1c1d22','#2c2e34','#4a4d55','#6d717a','#949aa3']),
 GO:PDP(['#6e4a12','#9a6e1e','#d4a234','#f0cc5c','#fff0b0']),
 WD:PDP(['#3a2812','#5a3e1e','#7a5a2e','#9a7640','#b89256']),
 WL:PDP(['#5a3e1e','#7a5a2e','#9a7640','#b89256','#d0ac70']),
 LE:PDP(['#2e1c0e','#4a2e16','#6e4826','#8d6136','#a87a48']),
 CL:PDP(['#8a7e60','#b4a682','#ddd0ae','#f2ecdc','#fbf7ec']),
 RU:PDP(['#6c111b','#a81c26','#d42a36','#ff6a70','#ffc0c8']),
 BZ:PDP(['#4a3010','#7a5220','#a87a30','#d0a048','#ecc870']),
 SN:PDP(['#5a5c62','#84878c','#aeb1b5','#cfd1d4','#e6e7e9'])});

/* a solid part in 4 tones: lit top face and top row, dark underside and lip, worn pixels */
export const g2Tone=(P,s)=>(f,u,v,W,H)=>{if(f==='T')return P[3];if(f==='D')return P[0];if(H>=2&&v===H-1)return P[3];if(H>=3&&v===0)return P[1];
 const n=pxN(f,u,v,s||1);return n>.88?P[3]:n<.12?P[1]:P[2]};

/* index of a pixel along z on the four long faces of a part lying along z */
const zi=(f,u,v,W,H)=>f==='R'?W-1-u:f==='L'?u:f==='T'?H-1-v:f==='D'?v:0;

/* a grip wrapped in leather or cloth: rings along z */
const wrap=P=>(f,u,v,W,H)=>{const d=zi(f,u,v,W,H)%2===1;return f==='D'?(d?P[0]:P[1]):f==='T'?(d?P[2]:P[3]):(d?P[1]:P[2])};

/* a wooden haft along z: grain in 3 tones, lit on top */
const haft=(P,s)=>(f,u,v,W,H)=>{const n=pxN('S',zi(f,u,v,W,H),0,s||3),k=n>.78?1:n<.22?-1:0;return f==='T'?P[k>0?4:3]:f==='D'?P[k<0?0:1]:P[2+k]};

/* a wooden pole standing along y */
const pole=(P,s)=>(f,u,v,W,H)=>{if(f==='T')return P[3];if(f==='D')return P[0];const n=pxN('S',v,0,s||3);return n>.8?P[3]:n<.2?P[1]:(u===0?P[3]:P[2])};

const gemP=P=>(f,u,v,W,H)=>(u===0&&v===H-1)?P[3]:((u===W-1||v===0)?P[1]:P[2]);

const bx=(G,x,y,z,w,h,d,p,m,g)=>pxBox(G,x,y,z,w,h,d,p,{mat:m===undefined?4:m,grid:g||null});

const fin=(G,k)=>{const g=toGeo(G);if(k&&k!==1)g.scale(k,k,k);return g};

/* a straight blade as pixel art, hw(u) = half width at pixel u: bright upper edge, lit upper half, a fuller, shaded lower half, dark lower edge */
const blade=(L,R,hw,full,P,s)=>(u,v)=>{const h=hw(u),y=v-R;if(Math.abs(y)>h)return null;if(h===0||y===h)return P[4];if(y===-h)return P[1];
 if(y===0){const c=full(u);if(c)return c}return y>=0?(pxN('F',u,v,s)>.86?P[4]:P[3]):P[2]};

/* ---------------- swords ----------------
   knight's arming sword, one per armour research (AL 0 iron hilt, 1 steel hilt and brass pommel, 2 gilded hilt and inlaid fuller);
   the pommel carries an enamel in the colour of its kingdom (rebels: their own colour) */
export function g2Sword(AL){const m=gearPal(),S=m.BL,G=newG(),Tm=teamPal(thp()),HL=AL>=2?m.GO:AL>=1?m.ST:m.IR.slice(1),PM=AL>=1?m.GO:m.IR.slice(1),L=26;
 pxScene(()=>{
  pxSpriteF(G,L,5,blade(L,2,u=>u<L-6?2:u<L-3?1:0,u=>u<L-8?(AL>=2&&u<5?m.GO[2]:S[1]):null,S,5),{plane:'yz',x:0,y:-2.5,z:3,ps:1,d:1.2});
  bx(G,-.9,-1.5,2,1.8,3,1.4,g2Tone(HL,2));
  bx(G,-1,-4.5,.8,2,9,1.6,g2Tone(HL,3),4,[2,9,2]);
  for(const y of[3.9,-5.9])bx(G,-1.2,y,.4,2.4,2,2.4,g2Tone(HL,4),4,[2,2,2]);
  bx(G,-.8,-.8,-5,1.6,1.6,5.8,wrap(m.LE),0,[2,2,6]);bx(G,-1,-1,-2.6,2,2,.8,g2Tone(PM,5),4,[2,2,1]);
  bx(G,-1,-1.6,-7.4,2,3.2,2.4,g2Tone(PM,6),4,[2,3,2]);
  for(const x of[1,-1.3])bx(G,x,-.6,-6.8,.3,1.2,1.2,gemP([Tm[1],Tm[2],Tm[3],Tm[4]]),0,[1,2,2]);
 });return fin(G,.9)}

/* captain's sword: longer, gilded guard with ends turned to the blade, gold bands, a glowing stone in the colour of the kingdom */
export function g2CapSword(){const m=gearPal(),S=m.BL,G=newG(),Tm=teamPal(thp()),L=30,go=g2Tone(m.GO,2);
 pxScene(()=>{
  pxSpriteF(G,L,5,blade(L,2,u=>u<L-6?2:u<L-3?1:0,u=>u<7?m.GO[u%3===1?3:2]:(u<L-8?S[1]:null),S,7),{plane:'yz',x:0,y:-2.5,z:3,ps:1,d:1.2});
  bx(G,-.9,-1.5,2,1.8,3,1.4,g2Tone(m.ST,2));
  bx(G,-1,-5.5,.8,2,11,1.6,go,4,[2,11,2]);
  for(const y of[4.6,-6.6])bx(G,-1.2,y,.6,2.4,2,3.4,g2Tone(m.GO,4),4,[2,2,3]);
  bx(G,-.8,-.8,-5.6,1.6,1.6,6.4,wrap(m.LE),0,[2,2,6]);for(const z of[-2.6,-5.2])bx(G,-1,-1,z,2,2,.8,g2Tone(m.GO,5),4,[2,2,1]);
  bx(G,-1,-1.8,-8.2,2,3.6,2.6,g2Tone(m.GO,6),4,[2,4,3]);
  for(const x of[1,-1.35])bx(G,x,-.7,-7.6,.35,1.4,1.4,gemP([Tm[1],Tm[2],Tm[3],Tm[4]]),5,[1,2,2]);
 });return fin(G,.9)}

/* the King's sword: a wide blade with a gold fuller, a heavy gold guard with a ruby on each face, a grip wrapped in red, a ruby pommel */
export function g2RoyalSword(){const m=gearPal(),S=m.BL,G=newG(),L=34,ps=.85;
 pxScene(()=>{
  pxSpriteF(G,L,7,blade(L,3,u=>u<L-6?3:u<L-4?2:u<L-2?1:0,u=>u<L-9?m.GO[u%4===1?3:2]:null,S,9),{plane:'yz',x:0,y:-3.5*ps,z:3.4,ps,d:1.3});
  bx(G,-.9,-1.7,2.4,1.8,3.4,1.4,g2Tone(m.GO,2));
  bx(G,-1,-5.6,1.4,2,11.2,1.8,g2Tone(m.GO,3),4,[2,11,2]);
  for(const y of[4.9,-6.9])bx(G,-1.2,y,.2,2.4,2,3.2,g2Tone(m.GO,4),4,[2,2,3]);
  for(const x of[1,-1.4])bx(G,x,-.8,1.5,.4,1.6,1.6,gemP(m.RU),5,[1,2,2]);
  bx(G,-.8,-.8,-5.6,1.6,1.6,7,wrap(m.RU),0,[2,2,7]);for(const z of[-2.9,-5.3])bx(G,-1,-1,z,2,2,.7,g2Tone(m.GO,5),4,[2,2,1]);
  bx(G,-1.1,-1.7,-8.2,2.2,3.4,2.6,g2Tone(m.GO,6),4,[2,3,3]);
  for(const x of[1.1,-1.45])bx(G,x,-.6,-7.5,.35,1.2,1.2,gemP(m.RU),5,[1,2,2]);
 });return fin(G,.92)}

/* ---------------- halberd (royal guard) ----------------
   every pixel a cube one shaft-thickness wide: spear point, a crescent axe with two notches, a beak, a steel socket, a gold collar,
   a tassel in the colour of the kingdom, banded haft, leather grip, steel foot. Rows top first, the haft is column 7. */
const HALB2=[
 '.......H.......','.......L.......','......HLD......','......LLD......','......LMD......','......LMD......','...H...M.......','..HL...K.......',
 '.HLM...S...D...','.HLMD..S..MD...','HLLMDD.S.MMD...','HLMMDDDSMMD....','HLMMDDDSMM.....','HLMMDDDSM......','HLMMDDDS.......','HLLMDD.S.......',
 '.HLMD..G.......','.HLM...wT......','..HL...WTt.....','...H...wTt.....','.......WT......','.......wt......','.......W.......','.......w.......'];

export function g2Halberd(){const m=gearPal(),S=m.BL,G=newG(),V=1.4,Tm=teamPal(thp()),N=52,G0=37,
 C={H:S[4],L:S[3],M:S[2],D:S[1],K:m.IR[1],W:m.WL[2],w:m.WL[1],V:m.WL[3],T:Tm[3],t:Tm[1],B:m.LE[1],b:m.LE[3]};
 const rows=[];
 for(let r=0;r<N;r++){if(r<HALB2.length){rows.push(HALB2[r]);continue}
  let ch=(r>=34&&r<=40)?(r%2?'B':'b'):(['W','w','V'][Math.floor(pxN('P',r,0,4)*3)]);if(r===49)ch='K';if(r>=50)ch=r===50?'L':'D';
  rows.push('.......'+ch+'.......')}
 const zc=r=>(G0-r)*V;
 pxScene(()=>{
  pxSpriteF(G,N,15,(u,v)=>{const ch=rows[N-1-u][v];return (ch==='.'||ch==='S'||ch==='G')?null:C[ch]},{plane:'yz',x:0,y:-7.5*V,z:zc(N-1)-V/2,ps:V,d:V});
  bx(G,-.9*V,-.8*V,zc(15)-V/2,1.8*V,1.6*V,8*V,g2Tone(m.ST,2),4,[2,2,8]);
  bx(G,-V,-V,zc(16)-V/2,2*V,2*V,V,g2Tone(m.GO,3),4,[2,2,1]);
 });return fin(G,1)}

/* ---------------- spear (spearman, and the pike blocks of the title screen) ----------------
   same family as the halberd, thinner (1.2 px cubes): a leaf blade with a lit edge, a steel socket, a gold collar, a pennant in the colour
   of the kingdom under the head (on the -y side: it hangs down in a thrust), an ash haft, a leather grip, an iron foot.
   Rows top first, the haft is column 7; the grip is row SPG (48 px of spear above the fist, 11 below). */
const SPEAR2=[
 '.......H.......','.......H.......','......HLD......','......HLD......','.....HLLMD.....','.....HLMMD.....','.....HLMMD.....','......LMD......',
 '......LMD......','.......M.......','.......S.......','.......S.......','.......S.......','.......G.......','tTTTTTTW.......','.tUUUTTw.......',
 '..tUUTTW.......','...tTTTw.......','....tTTW.......','.....ttw.......'];

export function g2Spear(){const m=gearPal(),S=m.BL,G=newG(),V=1.2,Tm=teamPal(thp()),N=50,G0=40,
 C={H:S[4],L:S[3],M:S[2],D:S[1],K:m.IR[1],W:m.WL[2],w:m.WL[1],V:m.WL[3],T:Tm[3],t:Tm[1],U:Tm[4],B:m.LE[1],b:m.LE[3]};
 const rows=[];
 for(let r=0;r<N;r++){if(r<SPEAR2.length){rows.push(SPEAR2[r]);continue}
  let ch=(r>=37&&r<=42)?(r%2?'B':'b'):(['W','w','V'][Math.floor(pxN('P',r,0,6)*3)]);if(r===48)ch='K';if(r===49)ch='D';
  rows.push('.......'+ch+'.......')}
 const zc=r=>(G0-r)*V;
 pxScene(()=>{
  pxSpriteF(G,N,15,(u,v)=>{const ch=rows[N-1-u][v];return (ch==='.'||ch==='S'||ch==='G')?null:C[ch]},{plane:'yz',x:0,y:-7.5*V,z:zc(N-1)-V/2,ps:V,d:V});
  bx(G,-.9*V,-.8*V,zc(12)-V/2,1.8*V,1.6*V,3*V,g2Tone(m.ST,2),4,[2,2,3]);
  bx(G,-V,-V,zc(13)-V/2,2*V,2*V,V,g2Tone(m.GO,3),4,[2,2,1]);
 });return fin(G,1)}

/* ---------------- bow ----------------
   a voxel recurve bow: stepped limbs two pixels deep (lit belly, darker back), gold bands, horn tips, a wrapped grip with a band in
   the colour of the kingdom, a steel arrow rest, the string on the archer's side (+y) */
export function g2Bow(){const m=gearPal(),W=m.WL,G=newG(),Tm=teamPal(thp());
 const vc=a=>a>16?4:Math.min(5,Math.round(1+.018*a*a));
 pxScene(()=>{
  pxSpriteF(G,36,8,(u,v)=>{const a=Math.abs(u-17.5),c=vc(a);if(a<3||v>c+(a<6?1:0)||v<c-1)return null;const k=Math.floor(a);
   if(a>16)return v===c?m.CL[3]:m.CL[1];if(k===7||k===12)return v>=c?m.GO[3]:m.GO[1];
   return v>=c?(pxN('B',u,v,3)>.8?W[4]:W[3]):(pxN('B',u,v,5)<.3?W[0]:W[1])},{plane:'yz',x:0,y:-1.5,z:-18,ps:1,d:1.4,mat:0});
  bx(G,-1.05,-1.6,-3,2.1,3.2,6,wrap(m.LE),0,[2,3,6]);
  bx(G,-1.2,-1.75,-.5,2.4,3.5,1,(f,u,v,W2,H)=>f==='T'||v===H-1?Tm[4]:(v===0?Tm[1]:Tm[3]),0,[2,3,1]);
  bx(G,-.5,1.6,-.6,1,.8,1.2,g2Tone(m.ST,2));
  pxBox(G,-.15,2.85,-17.2,.3,.3,34.4,()=>m.CL[3],{mat:0,ao:false,grid:[1,1,1]});
 });return fin(G,.95)}

/* ---------------- peasant tools ----------------
   one haft for all (grain in 3 tones, leather-wrapped grip, dark butt), dark iron heads with a bright ground edge */
function haftG(G,L){const m=gearPal();bx(G,-.7,-.7,-3.5,1.4,1.4,L+3.5,haft(m.WL,3),0,[1,1,Math.round((L+3.5)/2)]);
 bx(G,-.9,-.9,-2,1.8,1.8,4,wrap(m.LE),0,[1,1,4]);bx(G,-.85,-.85,-4,1.7,1.7,.9,()=>m.LE[0],0,[1,1,1])}

const art=(G,rows,map,o)=>{const H=rows.length,W=rows[0].length;pxSpriteF(G,W,H,(u,v)=>{const c=rows[H-1-v][u];return c==='.'?null:map[c]},o)};

const toolMap=()=>{const m=gearPal();return{D:m.IR[2],M:m.IR[3],L:m.IR[4],H:m.ST[4],K:m.IR[1]}};

export function g2Axe(){const G=newG();pxScene(()=>{haftG(G,18.7);
  art(G,['..KKK..','..DMD..','..MMM..','.DMMMM.','.DMMMML','DMMMMML','DMLLLLL','LLHHHHH'],toolMap(),{plane:'yz',x:0,y:-5.5,z:13,ps:1,d:1.3})});return fin(G,1)}

export function g2Pick(){const G=newG(),m=gearPal(),I=m.IR;
 pxScene(()=>{haftG(G,18.7);
  pxSpriteF(G,7,16,(u,v)=>{const d=Math.floor(Math.abs(v-7.5)),c=6-Math.round(.075*d*d);if(d===7)return u===c?m.ST[4]:null;return u===c?(d===6?m.ST[3]:I[4]):(u===c-1?I[2]:null)},{plane:'yz',x:0,y:-8,z:11,ps:1,d:1.3});
  bx(G,-.95,-1.4,15.6,1.9,2.8,2.8,g2Tone([I[1],I[2],I[3],I[4]],2),4,[2,3,3]);
 });return fin(G,1)}

export function g2Hoe(){const G=newG(),m=gearPal(),I=[m.IR[1],m.IR[2],m.IR[3],m.IR[4]];
 pxScene(()=>{haftG(G,20.5);
  bx(G,-.95,-.95,18.5,1.9,1.9,2.3,g2Tone(I,2),4,[2,2,2]);bx(G,-.5,-2.7,19.3,1,2,1,g2Tone(I,3),4,[1,2,1]);
  bx(G,-1.8,-5.3,19.2,3.6,2.8,1.1,g2Tone(I,4),4,[4,3,1]);bx(G,-1.9,-5.9,19.1,3.8,.7,1.3,()=>m.ST[4],4,[4,1,1]);
 });return fin(G,1)}

export function g2Hammer(){const G=newG(),m=gearPal(),I=[m.IR[1],m.IR[2],m.IR[3],m.IR[4]];
 pxScene(()=>{haftG(G,16.1);
  bx(G,-1.6,-4.1,13.4,3.2,5.6,4,g2Tone(I,2),4,[3,6,4]);
  bx(G,-1.75,-4.8,13.25,3.5,.8,4.3,(f)=>f==='D'?m.ST[3]:m.ST[4],4,[3,1,4]);
  bx(G,-1.75,-1.9,13.25,3.5,.9,4.3,(f)=>f==='T'?I[1]:I[0],4,[3,1,4]);
  bx(G,-1.7,1.5,13.3,3.4,.6,4.2,(f)=>f==='T'?I[3]:I[2],4,[3,1,4]);
 });return fin(G,1)}

/* ---------------- loads carried on the back (world units of the current ones x K) ----------------
   w = three logs under a leather strap, g = a small chest with iron bands and its gold, s = cut stone blocks */
export function g2Carry(k){const G=newG(),m=gearPal(),W=k==='w'?m.WL:m.WD;
 pxScene(()=>{
  if(k==='w'){const log=(f,u,v,W2,H)=>{if(f==='R'||f==='L')return (u===1&&v===1)?W[3]:((u+v)%2?W[4]:m.CL[1]);const n=pxN(f,u>>1,v,3);return f==='T'?(n>.7?W[3]:W[2]):f==='D'?W[0]:(v===H-1?W[2]:(n<.3?W[0]:W[1]))};
   for(const[y,z]of[[0,-2.6],[4.8,1.8],[4.8,-7]])bx(G,-10,y,z,20,5.2,5.2,log,0,[10,3,3]);
   bx(G,-2.2,2.2,-7.9,4.4,8.7,15.8,g2Tone(m.LE,2),0,[2,4,8])}
  else if(k==='g'){const I=m.IR;
   bx(G,-6.5,0,-5,13,11,10,(f,u,v,W2,H)=>{if(f==='T')return (u===1||u===W2-2)?I[3]:W[3];if(f==='D')return W[0];if((f==='F'||f==='B')&&(u===1||u===W2-2))return v===H-1?I[4]:I[2];if(v===H-1)return W[3];return v%2?W[1]:W[2]},0,[7,6,5]);
   bx(G,-1.5,5,4.6,3,3,.9,g2Tone(m.GO,2),4,[2,2,1]);
   bx(G,-4.5,11,-3.5,9,2,7,(f,u,v)=>f==='T'?((u+v)%2?m.GO[4]:m.GO[3]):m.GO[2],4,[5,1,4]);bx(G,-2.5,13,-2,5,1.6,4,(f,u,v)=>f==='T'?((u+v)%2?m.GO[3]:m.GO[4]):m.GO[2],4,[3,1,2])}
  else{const S=m.SN;bx(G,-7,0,-5.6,14,10.4,11.2,g2Tone(S,2),0,[7,5,6]);bx(G,-2.2,10.4,-4.4,8.8,7,8.8,g2Tone(S,3),0,[4,4,4]);bx(G,-7.4,0,3.9,6,5.2,4.4,g2Tone(S,4),0,[3,3,2])}
 });return fin(G,1)}

/* ---------------- the bannerman's pole (into the torso geometry; the cloth is pxBanner, unchanged) ----------------
   same sizes as the current pole: haft in 3 tones, three gold ferrules, crossbar with gold caps, gold socket, stepped steel spear point */
export function g2Pole(G){const m=gearPal(),s=1/PXV,Z=-3*s,ZB=-3.42*s,TB=31.6*s;
 pxScene(()=>{
  bx(G,-.9,2*s,Z-.9,1.8,34.4*s,1.8,pole(m.WL,3),0,[2,38,2]);
  for(const y of[12.2,21.4,28.8])bx(G,-1.2,y*s,Z-1.2,2.4,1.1,2.4,g2Tone(m.GO,2),4,[2,1,2]);
  bx(G,-.95,8.4*s,Z-.95,1.9,3.2*s,1.9,(f,u,v)=>v%2?m.LE[1]:m.LE[3],0,[2,6,2]);
  bx(G,-13.5,TB,ZB-.8,27,1.6,1.6,(f,u,v,W,H)=>f==='T'?m.WL[4]:f==='D'?m.WL[0]:(pxN('C',u,0,2)>.7?m.WL[3]:m.WL[2]),0,[14,1,1]);
  for(const sg of[-1,1]){bx(G,sg*14.3-1.15,TB-.4,ZB-1.15,2.3,2.4,2.3,g2Tone(m.GO,3),4,[2,2,2]);bx(G,sg*14.3-.5,TB+2,ZB-.5,1,1,1,()=>m.GO[4],4,[1,1,1])}
  bx(G,-1.4,36.3*s,Z-1.4,2.8,2.4,2.8,g2Tone(m.GO,4),4,[3,2,3]);bx(G,-.9,37.35*s,Z-.9,1.8,1.1,1.8,()=>m.GO[3],4,[2,1,2]);
  bx(G,-1.2,37.85*s,Z-.5,2.4,2.6,1,(f,u,v,W,H)=>f==='F'||f==='B'?(u===0?m.ST[4]:m.ST[2]):m.ST[3],4,[2,2,1]);
  bx(G,-.8,39*s,Z-.4,1.6,2.4,.8,(f,u)=>f==='F'||f==='B'?(u===0?m.ST[4]:m.ST[3]):m.ST[3],4,[2,2,1]);bx(G,-.4,40.05*s,Z-.3,.8,2,.6,()=>m.ST[4],4,[1,2,1]);
  bx(G,-.9,9*s,-2.3*s-1.3,1.8,1.8,2.6,g2Tone(m.LE,5),0,[2,2,2]);
 })}

/* ---------------- the cannon ----------------
   same build as the current one (bronze barrel with rings and a cascabel, plank carriage, spoked wheels with iron tyres, a pile
   of shot), repainted with the shared palette: barrel lit on top and dark underneath, planks with grain and iron straps */
export function g2Cannon(){const G=newG(),m=gearPal(),BZ=m.BZ,W=m.WD,I=m.IR;
 const wood=(f,u,v,W2,H)=>{if(f==='T')return (u+v)%5===0?W[2]:W[3];if(f==='D')return W[0];const q=(f==='R'||f==='L')?u:v;if((f==='R'||f==='L')&&(u===3||u===W2-4))return v===H-1?I[4]:I[2];return v===H-1?W[3]:(v===0?W[1]:((q+v*3)%7===0?W[1]:W[2]))},
  iron=(f,u,v,W2,H)=>f==='T'?I[3]:f==='D'?I[0]:(v===H-1?I[3]:((u+v)%4===0?I[1]:I[2])),
  brz=g2Tone([BZ[0],BZ[1],BZ[2],BZ[3]],2);
 pxScene(()=>{
  for(const sx of[-1,1]){const x=sx*11.8,y=7.4,z=15.7,X0=sx>0?x:x-2.2;
   pxBox(G,X0,y-7,z-3,2.2,14,6,iron,{mat:4,grid:[2,14,6]});pxBox(G,X0,y-3,z-7,2.2,6,14,iron,{mat:4,grid:[2,6,14]});pxBox(G,X0,y-5.5,z-5.5,2.2,11,11,iron,{mat:4,grid:[2,11,11]});
   pxBox(G,X0+(sx>0?-.2:.2),y-5.2,z-5.2,2.6,10.4,10.4,(f,u,v)=>(f==='R'||f==='L')?((u===5||v===5||u===v||u===10-v)?(v>=5?W[3]:W[2]):W[0]):W[1],{mat:0,grid:[2,11,11]});
   pxBox(G,sx>0?x+2.2:x-3.6,y-1.6,z-1.6,1.4,3.2,3.2,brz,{mat:4,grid:[1,3,3]})}
  pxBox(G,-11,6.4,14.6,22,2,2,iron,{mat:4,grid:[22,2,2]});
  pxBox(G,-4,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});pxBox(G,2,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});
  pxBox(G,-3,2,-14,6,4,17,wood,{mat:0,grid:[6,4,17]});pxBox(G,-2.5,1.5,-14.5,5,3,2,iron,{mat:4,grid:[5,3,2]});
  pxBox(G,-3.6,10,-1,7.2,7.2,28,(f,u,v,W2,H)=>{if(f==='F')return (u>=2&&u<=4&&v>=2&&v<=4)?I[0]:((u===0||v===0||u===W2-1||v===H-1)?BZ[2]:BZ[3]);if(f==='B')return BZ[1];if(f==='T')return (u===3)?BZ[4]:BZ[3];if(f==='D')return BZ[0];
   return v===H-1?BZ[3]:(v<=1?BZ[1]:(pxN(f,u,v,4)>.9?BZ[3]:BZ[2]))},{mat:4,grid:[7,7,28]});
  for(const[z0,l]of[[-1.5,3.5],[11,1.6],[23.6,3.8]])pxBox(G,-4.4,9.2,z0,8.8,8.8,l,(f,u,v,W2,H)=>f==='T'?BZ[3]:f==='D'?BZ[0]:(v===H-1?BZ[4]:(v<=1?BZ[1]:BZ[2])),{mat:4,grid:[8,8,2]});
  pxBox(G,-1.6,12,-4,3.2,3.2,3,brz,{mat:4,grid:[3,3,3]});
  for(const[x,z]of[[-17,-2],[-14,-3],[-15.5,.5]])pxBox(G,x,0,z,3,3,3,(f,u,v,W2,H)=>f==='T'?(u===0&&v===0?I[4]:I[2]):f==='D'?I[0]:(v===H-1?I[2]:(u===0&&v===1?I[3]:I[1])),{mat:4,grid:[3,3,3]});
 });return toGeo(G)}

/* ---------------- shields: palette and tone rule of look B for pxMcShield (weapons.js) ----------------
   the build stays the Minecraft shield (12 x 22 x 1 planks, iron rim, rivets, bracket handle); the rim follows the armour research
   (iron, steel, gold) and the painted heraldry gets a lit chief and a shaded base */
export const g2ShieldPal=AL=>{const m=gearPal(),I=m.IR;return{W:m.WD,R:AL>=2?m.GO:AL>=1?m.ST:I,I:m.ST,K:[I[0],I[1],I[2],I[3]],LE:m.LE}};
