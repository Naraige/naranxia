import { hex } from '../../core/math.js';
import { bxc, newG, toGeo } from '../geometry.js';
import { lighten } from '../kingdom-banner.js';
import { mkModel0, PXON, unitsState } from './units.js';
import { gear2, gearSig } from './gear-style.js';
import { g2Axe, g2Bow, g2CapSword, g2Hammer, g2Halberd, g2Hoe, g2Pick, g2RoyalSword, g2Sword } from './gear2.js';
import { pxBow, pxCapSword, pxHalberd, pxRoyalSword, pxSword } from './weapons.js';
import { THEME, thp } from '../../ui/kingdom-theme.js';

export const unitPartsState = {
  RT: null,
};

/* ---- unit models: voxel characters with separate head / both arms / tools (1 voxel = .05 tile) ---- */
export let NOWEAP=false;
export const VX=.05,UM={};

export function vb(G,cx,y0,cz,w,h,d,c){let T2=G;if(unitPartsState.RT&&G===unitPartsState.RT.G){if(cx<=-(unitPartsState.RT.lax||3.2)&&y0>=1.8&&y0<13)T2=unitPartsState.RT.LA;else if(y0>=unitPartsState.RT.hy&&Math.abs(cx)<3.6&&cz>-2.9&&y0<24)T2=unitPartsState.RT.HG}bxc(T2,cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c)}

/* ---- Minecraft-style items: 16x16 pixel sprites extruded into cubes, outlined ---- */
export const SPAL={b:'#7a5a2a',B:'#5a3f1c',w:'#f2f2f2',i:'#c9ced6',d:'#8a909c',g:'#ffd23c',G:'#fff1a0',h:'#c8962a',S:'#e8edf5',K:'#17171c',r:'#c04040',s:'#8a8a92'};

function sprGrid(){return Array.from({length:16},()=>Array(16).fill('.'))}

function sprLine(g,x0,y0,x1,y1,f){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=f(k,n)}}

function sprOutline(g){const o=g.map(r=>r.slice());for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(g[y][x]==='.')for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a>=0&&a<16&&b>=0&&b<16&&g[b][a]!=='.'){o[y][x]='K';break}}return o.map(r=>r.join(''))}

const SPR={};

export function sprites(){if(SPR.pick)return SPR;
 const stick=(g,x0,y0,x1,y1)=>sprLine(g,x0,y0,x1,y1,k=>k%2?'B':'b');
 {const g=sprGrid();stick(g,0,15,10,5);for(let s=-5;s<=5;s++){const c=s*s*.07,x=Math.round(10+s*.707-.707*c),y=Math.round(5+s*.707+.707*c);if(x>=0&&x<16&&y>=0&&y<16){g[y][x]=s<-1?'w':s<3?'i':'d';if(x+1<16&&g[y][x+1]==='.')g[y][x+1]=s<1?'i':'d'}}SPR.pick=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);[[1,9,12],[2,8,13],[3,8,14],[4,8,14],[5,9,13],[6,10,12]].forEach(([y,a,b])=>{for(let x=a;x<=b;x++)g[y][x]=y<=2?'w':y>=5?'d':'i'});for(let y=2;y<=4;y++)g[y][14]='d';SPR.axe=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);for(let y=2;y<=6;y++)for(let x=8;x<=12;x++)if(x-8+ (y-2)>=1&&x-8+(y-2)<=7)g[y][x]=(x+y)%5===0?'d':'i';g[2][11]='w';g[3][12]='w';g[2][12]='w';SPR.hammer=sprOutline(g)}
 const sword=(w,i,d,hl)=>{const g=sprGrid();sprLine(g,3,12,14,1,k=>'i');sprLine(g,4,12,14,2,k=>'d');sprLine(g,3,11,13,1,k=>'w');sprLine(g,1,10,5,14,(k)=>'b');sprLine(g,0,15,3,12,k=>k?'B':'g');g[14][1]='b';g[15][0]='g';return sprOutline(g.map(r=>r.map(c=>c==='i'?i:c==='d'?d:c==='w'?w:c==='b'&&hl?'h':c)))};
 SPR.sword=sword('w','i','d',0);SPR.gsword=sword('G','g','h',1);
 {const g=sprGrid();for(let a=-70;a<=70;a+=5){const r=a*Math.PI/180,x=Math.round(Math.cos(r)*8),y=Math.round(8+Math.sin(r)*7.6);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=a%10?'B':'b'}sprLine(g,3,1,3,15,()=>'S');SPR.bow=sprOutline(g)}
 return SPR}

export function vsp(G,rows,x,oy,oz,p,th){for(let r=0;r<16;r++)for(let c=0;c<16;c++){const ch=rows[r][c];if(ch==='.')continue;vb(G,x,oy+(15-r)*p,oz+c*p,th||p*1.1,p,p,SPAL[ch])}}

/* tools in the grip frame (voxel units): origin = centre of the fist, handle along +z, the striking edge faces -y (down at the end of a swing) */
const TOOLG={};
/* gear board, look B (gear-style.js): one tool set per switch value, kingdom colour and armour research; items left on the current
   look, and the new tools that carry no kingdom colour, are shared by every set (same geometry, same draw call) */
const TOOLS2={},G2SH={},G2MK={axe:g2Axe,pick:g2Pick,hoe:g2Hoe,hammer:g2Hammer,rsword:g2RoyalSword,sword:()=>g2Sword(unitsState.ALB),gsword:g2CapSword,halberd:g2Halberd,bow:g2Bow},G2TEAM={sword:1,gsword:1,halberd:1,bow:1};
export const HANDY=-4.5;

export function tb(G,x,y,z,w,h,d,c){bxc(G,x*VX,(y-h/2)*VX,z*VX,w*VX,h*VX,d*VX,c)}

function handleG(G,L,wood,wrap){tb(G,0,0,(L-1.6)/2,.62,.62,L+1.6,wood);tb(G,0,0,0,.82,.82,1.8,wrap||'#4a2e16');tb(G,0,0,-1.55,.78,.78,.5,'#2e1c0e');tb(G,0,0,L-.25,.72,.72,.5,lighten(wood,-.2))}

export function toolGeos(){const sg=gearSig();if(!sg)return toolGeos0();const k=sg+'|'+thp()+'|'+unitsState.ALB;if(TOOLS2[k])return TOOLS2[k];const T=Object.assign({},toolGeos0()),sh=G2SH[sg]||(G2SH[sg]={});
 for(const key in G2MK)if(gear2(key))T[key]=G2TEAM[key]?G2MK[key]():(sh[key]||(sh[key]=G2MK[key]()));return TOOLS2[k]=T}

function toolGeos0(){if(TOOLG.axe)return TOOLG;const mk=f=>{const G=newG();f(G);return toGeo(G)},WD='#9a6a34',IR='#b9c0cc',ID='#7c8492',IL='#eef2f8';
 TOOLG.axe=mk(G=>{handleG(G,8.6,WD);tb(G,0,-.1,7.5,.7,1.1,1.5,ID);tb(G,0,-1.25,7.55,.42,1.5,1.9,IR);tb(G,0,-2.2,7.6,.4,.7,2.35,IR);tb(G,0,-2.62,7.6,.44,.32,2.5,IL);tb(G,0,.75,7.45,.62,.7,1.1,ID)});
 TOOLG.pick=mk(G=>{handleG(G,8.6,WD);tb(G,0,0,7.7,.85,1.2,1.3,ID);[[.95,7.55],[1.8,7.2],[2.55,6.75],[3.15,6.25]].forEach(([y,z],k)=>{tb(G,0,y,z,.55-.06*k,.8,.95,k===3?IL:IR);tb(G,0,-y,z,.55-.06*k,.8,.95,k===3?IL:IR)})});
 TOOLG.hoe=mk(G=>{handleG(G,9.4,WD);tb(G,0,-.55,9.05,.45,1.3,.5,ID);tb(G,0,-1.55,9.1,1.5,.75,.42,IR);tb(G,0,-1.98,9.1,1.56,.22,.46,IL)});
 TOOLG.hammer=mk(G=>{handleG(G,7.4,WD);tb(G,0,-.6,7.15,1.35,2.5,1.7,ID);tb(G,0,-1.95,7.15,1.45,.35,1.8,IL);tb(G,0,.62,7.15,1.4,.3,1.75,IR);tb(G,0,-.6,7.15,1.42,.3,1.78,'#5a606c')});
 const sword=(bl,bd,gd,gd2)=>mk(G=>{tb(G,0,0,0,.7,.7,2.0,'#4a2e16');tb(G,0,0,-1.45,1.0,1.0,.9,gd);tb(G,0,0,-1.95,.6,.6,.3,gd2);tb(G,0,0,1.25,.9,3.4,.75,gd);tb(G,0,1.85,1.25,.7,.5,.8,gd2);tb(G,0,-1.85,1.25,.7,.5,.8,gd2);
  tb(G,0,0,6.0,.34,1.25,8.6,bl);tb(G,0,0,5.6,.38,.32,7.0,bd);tb(G,0,0,10.6,.3,.8,1.0,bl);tb(G,0,0,11.25,.26,.36,.6,bl)});
 TOOLG.sword=PXON?pxSword():sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');TOOLG.gsword=PXON?pxCapSword():sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');
 TOOLG.rsword=PXON?pxRoyalSword():mk(G=>{const GDc='#d4a234',GD2c='#ecc964',ST='#dfe5ee',SD='#9aa3b2',SL='#f7f9fc';
  tb(G,0,0,-.1,.62,.62,2.5,'#1f2c5c');for(const z of[-.9,-.1,.7])tb(G,0,0,z,.68,.68,.16,GDc);
  tb(G,0,0,-1.75,1.0,1.0,.8,GDc);tb(G,0,0,-2.3,.62,.62,.4,GD2c);tb(G,0,0,-1.75,1.08,.42,.42,'#d8283a');
  tb(G,0,0,1.55,.95,5.4,.8,GDc);for(const s of[1,-1]){tb(G,0,s*2.9,1.75,.85,.7,1.1,GD2c);tb(G,0,s*2.95,2.35,.6,.45,.5,GDc)}tb(G,0,0,1.55,1.02,.9,.9,GD2c);tb(G,0,0,1.55,1.06,.46,.46,'#3a7aff');
  tb(G,0,0,2.4,.5,1.7,.9,GDc);
  tb(G,0,0,6.6,.38,1.6,7.6,ST);tb(G,0,0,11.5,.34,1.25,2.2,ST);tb(G,0,0,13.1,.3,.82,1.0,ST);tb(G,0,0,13.9,.24,.4,.6,SL);
  tb(G,0,0,7.2,.42,.36,8.6,SD);for(const s of[1,-1])tb(G,0,s*.74,7.6,.3,.12,10.2,SL)});
 TOOLG.halberd=PXON?pxHalberd():mk(G=>{const WD='#5e3f24',WD2='#3b2614',ST='#c9d0dc',SD='#7e8797',SL='#f2f5fa',GDc='#d4a234',GD2c='#ecc964',H=15.6;
  tb(G,0,0,5.0,.56,.56,21.6,WD);for(const z of[-1.9,-1.1,-.3,.5])tb(G,0,0,z,.64,.64,.3,WD2);
  tb(G,0,0,-5.75,.74,.74,.6,GDc);tb(G,0,0,-6.15,.5,.5,.3,GD2c);tb(G,0,0,7.2,.66,.66,.36,GDc);
  for(const s of[-1,1])tb(G,0,s*.32,H-1.9,.3,.1,3.6,SD);tb(G,0,0,H+.1,.84,.84,.9,GDc);tb(G,0,0,H-.5,.72,.72,.3,GD2c);
  tb(G,0,0,H+1.1,.42,1.12,1.2,ST);tb(G,0,0,H+2.4,.38,.9,1.4,ST);tb(G,0,0,H+3.8,.32,.64,1.4,ST);tb(G,0,0,H+5.0,.26,.4,1.0,SL);tb(G,0,0,H+5.75,.2,.2,.5,SL);tb(G,0,0,H+2.8,.46,.16,4.4,SL);
  tb(G,0,-.85,H,.34,1.0,2.3,SD);tb(G,0,-1.75,H,.3,.9,3.5,ST);tb(G,0,-2.55,H,.3,.8,4.3,ST);tb(G,0,-3.15,H,.3,.5,4.8,ST);tb(G,0,-3.48,H,.24,.24,4.6,SL);
  tb(G,0,-3.36,H-2.55,.26,.42,.5,ST);tb(G,0,-3.36,H+2.55,.26,.42,.5,ST);tb(G,0,-1.95,H,.38,.62,.62,GDc);tb(G,0,-1.95,H,.42,.28,.28,'#c42a36');
  tb(G,0,.85,H+.1,.3,1.0,.7,SD);tb(G,0,1.7,H-.1,.26,.8,.55,ST);tb(G,0,2.35,H-.4,.22,.6,.45,ST);tb(G,0,2.8,H-.75,.18,.4,.4,SL);
  tb(G,0,0,H-2.6,1.0,1.0,.16,GDc);tb(G,0,0,H-3.1,.96,.96,.8,'#a3202a');tb(G,0,0,H-3.8,.8,.8,.7,'#86161f');tb(G,0,0,H-4.35,.6,.6,.45,'#6a1018')});
 /* bow: grip in the fist, limbs along z, bent toward the archer (+y), string on the archer side */
 TOOLG.bow=PXON?pxBow():mk(G=>{tb(G,0,0,0,.8,.95,1.5,'#4a2e16');for(let k=0;k<6;k++){const z=1.05+k*1.08,y=.07*k*k;[1,-1].forEach(sg=>tb(G,0,y,sg*z,.55-.04*k,.75,1.2,k===5?'#5a3a1a':'#8a5a2a'))}[1,-1].forEach(sg=>tb(G,0,2.6,sg*6.75,.5,.5,.5,'#d9b13a'));
  tb(G,0,2.72,0,.14,.14,13.5,'#efe9d6')});
 return TOOLG}

export const vx=(k,cx,y0,cz,w,h,d,c)=>bxc(unitPartsState.RT.X[k],cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c);


export function fin(P,m){const parts=(P.parts||[]).map(p=>({...p,geo:toGeo(P.X[p.k])}));const t=g=>toGeo(g);const r={torso:t(P.G),head:t(P.HG),leg:t(P.LG),arm:t(P.AG),armL:P.LA.P.length?t(P.LA):null,hip:m.hip*VX,sh:m.sh*VX,neck:m.neck*VX,lx:m.lx*VX,ax:m.ax*VX,h:m.h*VX,sc:m.sc||1.35};
 r.head.translate(0,-r.neck,0);if(r.armL)r.armL.translate(r.ax,-r.sh,0);r.parts=parts;return r}

export function mkModel(type,z){if(z>=20){const sv=THEME.c;THEME.c=z-20;try{return mkModel0(type,0)}finally{THEME.c=sv}}return mkModel0(type,z)}


/* ================= Minecraft-style characters: 8x8x8 head, 8x12x4 torso, 4x12x4 limbs (1 px = .46 voxel) ================= */
const MP_=.46,mp=n=>n*MP_;

function mcFace(G,skin,o){o=o||{};const e1=o.eye||'#ffffff',e2=o.pupil||'#3a3a9a',y=12.55;
 vb(G,-.9,y,1.86,.95,.5,.12,e1);vb(G,.9,y,1.86,.95,.5,.12,e1);vb(G,-.62,y,1.9,.5,.5,.12,e2);vb(G,.62,y,1.9,.5,.5,.12,e2);
 vb(G,0,12.0,1.88,.5,.5,.12,lighten(skin,-.12>0?0:0));vb(G,0,11.35,1.86,1.2,.28,.12,o.mouth||'#7a4a3a')}

export function mcHead(G,skin,hair,o){o=o||{};vb(G,0,11,0,3.7,3.7,3.7,skin);
 if(hair){vb(G,0,14.05,0,3.85,.7,3.85,hair);vb(G,0,12.9,-1.75,3.85,1.9,.4,hair);vb(G,-1.8,13,0,.4,1.4,3.8,hair);vb(G,1.8,13,0,.4,1.4,3.8,hair);vb(G,0,13.6,1.8,3.85,.55,.3,hair)}
 mcFace(G,skin,o)}

export function mcLimbs(G,LG,AG,c){/* legs */
 vb(LG,0,-5.5,0,1.84,5.5,1.84,c.pants);vb(LG,0,-5.5,0,1.9,1.1,2.0,c.shoes||'#4a4a52');
 /* right arm (AG) and left arm (in G, routed to LA) */
 const ax=2.76;vb(AG,0,-5.5,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(AG,0,-5.5,0,1.9,2.6,1.9,c.hand);vb(AG,0,-2.8,0,1.95,.3,1.95,lighten(c.sleeve,-.0));
 vb(G,-ax,5.0,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(G,-ax,5.0,0,1.9,2.6,1.9,c.hand);vb(G,-ax,7.7,0,1.95,.3,1.95,lighten(c.sleeve,-.0))}

export function mcTorso(G,c){vb(G,0,5.5,0,3.7,5.5,1.84,c.shirt);vb(G,0,5.5,0,3.78,.5,1.9,c.belt||darkenC(c.shirt));if(c.chest)vb(G,0,7.6,.95,2.4,2.6,.1,c.chest)}

const darkenC=c=>lighten(c,-.0)&&(()=>{const h=hex(c);return '#'+h.map(v=>Math.round(v*.7).toString(16).padStart(2,'0')).join('')})();
