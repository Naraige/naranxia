import { LPL, HOMEC } from '../gameplay/players.js';
import { qActive, qCur } from '../gameplay/quests.js';
import { RS, RS2, TS } from '../gameplay/rules.js';
import { sel, selectionState, TRB } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { scr } from '../rendering/camera.js';
import { CAM } from '../rendering/scene.js';
import { LAND } from '../world/terrain-state.js';
import { canvasesState } from './canvases.js';
import { hudState } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { settingsState } from './panel-state.js';

/* ================= QUEST MARKER (display only) =================
   Shows which button to press for the active quest: a pulsing gold outline and a small bouncing arrow on the button, or an arrow over
   the building to click when its menu is not the one on screen. Nothing here is simulation: it reads the quest and the selection,
   the pulse runs on real time, no state is saved or hashed.
   Buttons announce themselves while they are drawn: qmReg(id, x, y, w, h) from drawItem (menu entries, id = item id), drawTabs
   ('tab:' + tab name) and kingBar ('sk:cry', 'sk:charge'). The table STEP gives, per quest id, the next target from the game state. */
const R=new Map();
export function qmReg(id,x,y,w,h){if(!R.has(id))R.set(id,[x,y,w,h])}

const CAT={wall:null,house:null,farm:null,gate:'def',tower:'def',spike:'def',market:'eco',embassy:'eco',barracks:'town',guild:'town',academy:'town',ballista:'siege'};
const mine=s=>s.t===0&&s.hp>0&&s.prog>=1&&(s.pl|0)===LPL();
const bOf=t=>{if(t==='castle')return HOMEC();let b=null,bd=1e18;const c=HOMEC();for(const s of sessionState.structs)if(s.type===t&&mine(s)){const d=(s.x-c.x)**2+(s.y-c.y)**2;if(d<bd){bd=d;b=s}}return b};
const nS=t=>{let n=0;for(const s of sessionState.structs)if(s.t===0&&s.type===t&&s.prog>=1&&s.hp>0)n++;return n};
const hasU=t=>sessionState.units.some(u=>u.t===0&&u.type===t&&u.hp>0&&(u.pl|0)===LPL());
const queued=t=>sessionState.queue.some(q=>q.type===t);
const B=t=>({build:t}),A=(at,it,tab)=>bOf(at)?{at,it,tab}:B(at);
const resBusy=()=>!!(RS.on||RS2.on);

/* quest id -> the next thing to press ({build: type} = an entry of the build menu, {at, it, tab} = entry `it` of the menu of building `at`
   behind tab `tab`, {sk} = a King skill button), or null when the step has no button (gathering, waves, sending the envoy) */
const STEP={
 house:()=>B('house'),farm:()=>B('farm'),barracks:()=>B('barracks'),
 knights:()=>A('barracks','knight','Train'),archers:()=>A('barracks','archer','Train'),
 walls:()=>B(nS('wall')<6?'wall':'gate'),tower:()=>B('tower'),traps:()=>B('spike'),
 market:()=>A('market','sellw','Trade'),guild:()=>A('guild','rb+','Builders'),
 research:()=>resBusy()?null:A('academy','iron','Research'),
 king:()=>hasU('king')||queued('king')?null:A('castle','king','Train'),
 skill:()=>({sk:'cry'}),
 siege:()=>RS.done?B('ballista'):resBusy()?null:A('academy','upgrade','Research'),
 envoy:()=>!bOf('embassy')?B('embassy'):hasU('envoy')||queued('envoy')?null:A('castle','envoy','Train'),
 convoy:()=>A('castle','convoy','Co-op')};

/* which menu is on screen: 'units' (a selection), 'other' (a building without its own menu), or the type of the building whose menu shows */
function ctx(){if(sel().length)return 'units';const b=selectionState.selB;if(b&&sessionState.structs.includes(b)&&b.prog>=1&&!TRB.has(b.type))return 'other';
 return b&&sessionState.structs.includes(b)&&b.prog>=1&&TRB.has(b.type)&&(b.pl|0)===LPL()?b.type:'castle'}

/* -> ['r', x, y, w, h] a button, ['w', structure] a building in the world, or null */
function target(){const q=qCur();if(!q||!STEP[q.id])return null;const s=STEP[q.id]();if(!s)return null;
 if(s.sk)return R.has('sk:'+s.sk)?['r',...R.get('sk:'+s.sk)]:null;
 const c=ctx();
 if(s.build){if(sessionState.mode===s.build)return null;if(R.has(s.build))return ['r',...R.get(s.build)];
  const cat=CAT[s.build];if(cat&&R.has('cat:'+cat))return ['r',...R.get('cat:'+cat)];
  if(R.has('back'))return ['r',...R.get('back')];
  if(c==='castle'&&R.has('tab:Build'))return ['r',...R.get('tab:Build')];
  return c==='units'?null:['w',HOMEC()]}
 if(R.has(s.it)&&c===s.at)return ['r',...R.get(s.it)];
 if(c===s.at&&R.has('tab:'+s.tab))return ['r',...R.get('tab:'+s.tab)];
 const b=bOf(s.at);return b&&c!==s.at?['w',b]:null}

const WH={castle:6.4,barracks:3.9,academy:4.3,market:3.4,guild:3.9};

function arrow(g,cx,ty,k,a){/* pixel arrow pointing down, tip at (cx, ty) */
 const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(cx+x*k),Math.round(ty+y*k),Math.ceil(w*k),Math.ceil(h*k))};
 g.globalAlpha=a;for(const[c,o]of[['#3a2406',1],['#ffd86b',0]]){const e=o;px(-1.5-e,-9-e,3+2*e,5+e,c);for(let i=0;i<4;i++)px(-3.5+i-e,-4+i-e,7-2*i+2*e,1+2*e,c)}
 px(-.5,-8,1,4,'#fff3c0');g.globalAlpha=1}

/* hudDisplayState.qm = what was drawn this frame (for the tests): ['r', x, y] a button, ['w', x, y] the tip of an arrow over a building,
   ['e', x, y, vx, vy] the tip and the direction of an edge arrow, or null */
/* called once per frame after the HUD buttons are drawn (from questLog in quest-panel.js); always empties the registry */
export function questMarker(UW,UH,logOpen){let t=null;
 if(!logOpen&&qActive()&&sessionState.started&&!sessionState.over&&!sessionState.showMap&&!sessionState.paused)t=target();
 R.clear();hudDisplayState.qm=null;if(!t)return;
 const g=canvasesState.ctx,now=performance.now()/1000,pu=.5+.5*Math.sin(now*5),bo=Math.abs(Math.sin(now*3.2))*4;
 if(t[0]==='r'){const x=Math.round(t[1]),y=Math.round(t[2]),w=Math.round(t[3]),h=Math.round(t[4]);
  g.save();g.lineWidth=1;g.strokeStyle='rgba(255,216,107,'+(.55+.45*pu).toFixed(2)+')';g.strokeRect(x-.5,y-.5,w+1,h+1);
  g.strokeStyle='rgba(255,216,107,'+(.12+.3*pu).toFixed(2)+')';g.strokeRect(x-1.5,y-1.5,w+3,h+3);g.strokeStyle='rgba(255,236,160,'+(.05+.15*pu).toFixed(2)+')';g.strokeRect(x-2.5,y-2.5,w+5,h+5);
  g.fillStyle='rgba(255,216,107,'+(.08+.14*pu).toFixed(2)+')';g.fillRect(x,y,w,h);
  /* menu slots sit right under the tab strip: their arrow bounces inside the top of the slot; small buttons (tabs, pills) get it above */
  if(h>=20)arrow(g,x+w/2,y+11-bo*.75,1,1);else arrow(g,x+w/2,y-3-bo,1,1);g.restore();hudDisplayState.qm=['r',x,y];return}
 const s=t[1];if(!s)return;const K=hudDisplayState.UIS,q=scr(s.x/TS,(s.bh||LAND)+(WH[s.type]||3.6),s.y/TS),X=q.x/K;let Y=q.y/K;
 /* The arrow never lies on the HUD. yT = the highest place for its tip: under the top resource bar, and under the centre bars (raid,
    boss, goals, King skills: hudDisplayState.cbar) where the building stands behind them. A building whose roof is behind those bars
    but whose foot shows below them keeps its arrow, lowered to yT. A building off screen, or behind the bars, the menu or the minimap,
    gets an arrow on the edge of the free part of the screen, turned toward it. */
 const cb=hudDisplayState.cbar,top=settingsState.TOPH,under=x=>cb&&x>cb[0]-10&&x<cb[0]+cb[2]+10?cb[1]+cb[3]:top,yT=under(X)+26;
 const inHud=(x,y)=>{for(const r of hudState.uiRects)if(x*K>r.x-6*K&&x*K<r.x+r.w+6*K&&y*K>r.y-4*K&&y*K<r.y+r.h+4*K)return r;return null};
 /* a panel over the whole screen: no arrow */
 for(const r of hudState.uiRects)if(r.w>=UW*K*.9&&r.h>=UH*K*.9)return;
 let on=q.ok&&X>=8&&X<=UW-8&&Y<=UH-8;
 if(on&&Y<yT){const f=scr(s.x/TS,s.bh||LAND,s.y/TS);if(f.ok&&f.y/K>=yT+6)Y=yT;else on=false}
 /* a building standing behind the quest panel: the arrow goes just under the panel instead of over its buttons */
 const qb=hudDisplayState.qbox;if(on&&qb&&X>qb[0]-7&&X<qb[0]+qb[2]+7&&Y>qb[1]-2&&Y-26<qb[1]+qb[3])Y=qb[1]+qb[3]+26;
 if(on&&inHud(X,Y-4))on=false;
 if(on){hudDisplayState.qm=['w',X,Y];g.save();arrow(g,X,Y-bo*1.5,2,.95);g.restore();return}
 /* direction on screen: from the point the camera looks at toward the building, along the ground (right even when the building is behind the camera) */
 let dx=s.x/TS-CAM.x,dz=s.y/TS-CAM.z;const dl=Math.hypot(dx,dz);if(dl<.01)return;dx/=dl;dz/=dl;
 const c0=scr(CAM.x,LAND,CAM.z),c1=scr(CAM.x+dx*2,LAND,CAM.z+dz*2);let vx=c1.x-c0.x,vy=c1.y-c0.y;const vl=Math.hypot(vx,vy);if(!(vl>.01))return;vx/=vl;vy/=vl;
 /* where the ray from the middle of the free band leaves it */
 const x0=16,x1=UW-16,y0=top+16,y1=UH-16,mx=UW/2,my=(y0+y1)/2,kx=vx>0?(x1-mx)/vx:vx<0?(x0-mx)/vx:1e9,ky=vy>0?(y1-my)/vy:vy<0?(y0-my)/vy:1e9,kk=Math.min(kx,ky);
 const ex=mx+vx*kk;let ey=my+vy*kk;
 /* pushed out of the HUD: up from what stands in the lower half (menu, its tabs, minimap), down from what stands at the top (bars, quest panel) */
 for(let n=0;n<8;n++){const r=inHud(ex,ey);if(!r)break;ey=r.y+r.h/2>UH*K/2?r.y/K-10:(r.y+r.h)/K+10}
 if(ey<under(ex)+10)ey=under(ex)+10;
 hudDisplayState.qm=['e',ex,ey,vx,vy];
 g.save();g.translate(ex-vx*bo*1.5,ey-vy*bo*1.5);g.rotate(Math.atan2(vy,vx)-Math.PI/2);arrow(g,0,0,2,.95);g.restore()}
