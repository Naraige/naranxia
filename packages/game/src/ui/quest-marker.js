import { LPL, HOMEC } from '../gameplay/players.js';
import { qActive, qCur } from '../gameplay/quests.js';
import { RS, RS2, TS } from '../gameplay/rules.js';
import { sel, selectionState, TRB } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { scr } from '../rendering/camera.js';
import { LAND } from '../world/terrain.js';
import { canvasesState } from './canvases.js';
import { hudDisplayState } from './hud-state.js';

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

/* called once per frame after the HUD buttons are drawn (from questLog in quest-panel.js); always empties the registry */
export function questMarker(UW,UH,logOpen){let t=null;
 if(!logOpen&&qActive()&&sessionState.started&&!sessionState.over&&!sessionState.showMap&&!sessionState.paused)t=target();
 R.clear();if(!t)return;
 const g=canvasesState.ctx,now=performance.now()/1000,pu=.5+.5*Math.sin(now*5),bo=Math.abs(Math.sin(now*3.2))*4;
 if(t[0]==='r'){const x=Math.round(t[1]),y=Math.round(t[2]),w=Math.round(t[3]),h=Math.round(t[4]);
  g.save();g.lineWidth=1;g.strokeStyle='rgba(255,216,107,'+(.55+.45*pu).toFixed(2)+')';g.strokeRect(x-.5,y-.5,w+1,h+1);
  g.strokeStyle='rgba(255,216,107,'+(.12+.3*pu).toFixed(2)+')';g.strokeRect(x-1.5,y-1.5,w+3,h+3);g.strokeStyle='rgba(255,236,160,'+(.05+.15*pu).toFixed(2)+')';g.strokeRect(x-2.5,y-2.5,w+5,h+5);
  g.fillStyle='rgba(255,216,107,'+(.08+.14*pu).toFixed(2)+')';g.fillRect(x,y,w,h);
  /* menu slots sit right under the tab strip: their arrow bounces inside the top of the slot; small buttons (tabs, pills) get it above */
  if(h>=20)arrow(g,x+w/2,y+11-bo*.75,1,1);else arrow(g,x+w/2,y-3-bo,1,1);g.restore();return}
 const s=t[1];if(!s)return;const q=scr(s.x/TS,(s.bh||LAND)+(WH[s.type]||3.6),s.y/TS);if(!q.ok)return;
 const X=q.x/hudDisplayState.UIS,Y=q.y/hudDisplayState.UIS;if(X<8||X>UW-8||Y<40||Y>UH-70)return;
 g.save();arrow(g,X,Y-bo*1.5,2,.95);g.restore()}
