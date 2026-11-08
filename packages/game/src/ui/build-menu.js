import { RHAS, ROLE } from '../ai/worker-roles.js';
import { snd } from '../audio/sound.js';
import { build, constructionState, FORMS } from '../gameplay/construction.js';
import {
  army,
  buy,
  hasAcademy,
  ok,
  popCap,
  popOf,
  popUsed,
  royalBtns,
  tradeCost,
  tradeGain,
  TRADEK,
} from '../gameplay/economy.js';
import { setStance } from '../gameplay/formations.js';
import { HOMEC, LPL, playersState, setTier, stoneOn } from '../gameplay/players.js';
import { C, CSTONE, CWOOD, RN2, ROTT, RPRE, RS, RS2, RT_TIME, RT2, T, UPC } from '../gameplay/rules.js';
import { curB, sel, selBs, selectionState, TRB } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { groupSel, ungroupSel } from '../gameplay/squads.js';
import { setClipBox, T_, TC, TCf, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { roleAdj, ROLEK } from '../multiplayer/commands.js';
import { MP } from '../multiplayer/session.js';
import { ICT, TIERK } from '../rendering/model-icons.js';
import { canvasesState, cv } from './canvases.js';
import { convoyPanelState } from './convoy-panel.js';
import { BTNX, circ, frame, gold, ICN, poly, rrg, SLOT, SLOTH, SLOTX, TN } from './drawing.js';
import { hudState, idleP, inR, selIdle, U } from './hud.js';
import { hudDisplayState } from './hud-state.js';
import { dIc, IC } from './icons.js';
import { assignJob, JOBI, JOBK, JOBL } from './worker-controls.js';

export const buildMenuState = {
  FPV: null,
  BCAT: null,
};

export const NAMES={
king:'King Naraige',
guard:'Royal guard',
stoneup:'Upgrade',
upgtool:'Stone tool',
cannon:'Cannon',
repair:'Repair',
agg:'Attack',
def:'Defend',
hold:'Halt',
stop:'Stop',
work:'Gather',
keep:'Keep',
movec:'Move castle',
rotate:'Rotate',
peasant:'Peasant',
knight:'Knight',
archer:'Archer',
bannerman:'Bannerman',
captain:'Captain',
wall:'Wall',
gate:'Gate',
tower:'Tower',
ballista:'Ballista',
trebuchet:'Trebuchet',
path:'Path',
army:'Army',
idle:'Idle',
form:'Formation',
mode:'Mode',
raise:'Raise',
dig:'Dig',
upgrade:'Masonry',
barracks:'Barracks',
farm:'Farm',
storage:'Storage',
ramp:'Ramp',
demolish:'Demolish',
iron:'Iron weapons',
plate:'Plate armor',
drill:'Drill',
steel:'Steel weapons',
mail:'Chain mail',
tools:'Better tools',
harvest:'Crop rotation',
fletch:'Fletching',
fire:'Fire arrows',
oil:'Boiling oil',era:'Iron age',spike:'Spike trap',
bastion:'Bastion walls',
house:'House',
academy:'Academy',
market:'Market',
forester:'Forester',
guild:'Guild',
'rb+':'+1',
'rb-':'-1',
'rr+':'+1',
'rr-':'-1',
'rt+':'+1',
'rt-':'-1',
torch:'Torch',
rally:'Rally: barracks',
rallyc:'Rally: castle'
},HK={agg:'1',
def:'2',
hold:'3',
stop:'4',
house:'0',
academy:';',
market:':',
forester:'[',
guild:']',
torch:"'",
rally:'-',
rallyc:'=',
peasant:1,
knight:2,
archer:3,
bannerman:4,
captain:5,
wall:6,
gate:7,
tower:8,
path:9,
ballista:'B',
trebuchet:'T',
raise:'Y',
dig:'U',
army:'Q',
idle:'.',
form:'V',
upgrade:'G',
barracks:'C',
farm:'J',
storage:'K',
ramp:'I',
tier:'L',
demolish:'P'
};

const TIPS={
convoy:['Convoy','Peasants carry gold, wood, stone or food','to your partner\'s castle, then come back'],
jw:['Cut wood','Sends the selected peasants to the nearest trees'],
js:['Quarry stone','Sends the selected peasants to the nearest rocks'],
jg:['Mine gold','Sends the selected peasants to the nearest gold'],
jf:['Farm','One selected peasant works the nearest free farm'],
jr:['Build and repair','Sends the selected peasants to the nearest building site','or damaged building'],
repair:['Repair','Peasants fix the selected building','Costs part of its wood / stone / gold'],
agg:['Aggressive [1]','Chase and attack every enemy in sight'],
def:['Defensive [2]','Fight around their post, then walk back to it'],
hold:['Halt [3]','Hold position: never move, only strike','enemies within weapon range'],
stop:['Stop [4]','Cancel current orders and stay here'],
work:['Gather','Send these peasants back to work now'],
movec:['Move castle [,]','Relocate your castle up to 40 tiles away','Costs 100 gold, 150 wood'],
rotate:['Rotate [R]','Turns the selected building 90 degrees','The castle door turns with it'],
academy:['Academy [;]','2x2 school: all research is bought here.','Select it to open the research menu'],
market:['Market [:]','2x2 trading post: select it to sell','wood, stone or food for gold, or buy them'],
forester:["Forester's hut [[]",'2x2 log cabin: its peasant plants saplings','around it; they grow into trees (wood)'],
guild:["Builders' guild []]",'2x2 workshop: select it to choose how many','peasants build, repair and reshape the land'],
torch:["Torch [']",'Cheap light: at night whatever stands','outside the light is hurt by the dark'],
rallyc:['Castle rally [=]','Click the map: new peasants walk there;','on a tree, rock or gold they start working it'],
house:['House [0]','2x2 cottage: +6 population','Your castle alone supports 18'],
rally:['Barracks rally [-]','Click the map: new soldiers from','barracks walk there by themselves'],
steel:['Steel weapons','Research (60 s): soldiers hit','another 20% harder','Needs Iron weapons'],
mail:['Chain mail','Research (70 s): your side takes','another 15% less damage','Needs Plate armor'],
tools:['Better tools','Research (30 s): peasants gather','33% faster'],
harvest:['Crop rotation','Research (40 s): farms yield 50% more food'],
fletch:['Fletching','Research (45 s): archers +25%,','towers +40% damage'],
fire:['Fire arrows','Research (50 s, after Fletching): archers set','zombies on fire, they burn for 3 seconds'],
era:['Iron age','Research (70 s, after Steel weapons): your units','hit 10% harder and buildings slowly mend'],
oil:['Boiling oil','Research (55 s, after Bastion walls): walls, gates','and towers scald zombies next to them'],
spike:['Spike trap','Passable: zombies standing on it are hurt','every half second until the spikes break'],
bastion:['Bastion walls','Research (60 s): buildings take','28% less damage','Needs Stonemasonry'],
tier:['Building tier [L]','Choose wood or stone for what you build','Stone needs Stonemasonry'],
demolish:['Demolish [P]','Click a building: peasants tear it down','and you recover 100% of its cost'],
storage:['Storage [K]','2x2 depot: peasants drop wood, stone','and gold here: build it next to resources'],
ramp:['Ramp [I]','Places a ramp block that climbs 1 level','[R] turns it - peasants build it (free)'],
farm:['Farm [J]','2x2 field worked by one peasant:','+6 food every 6 s while he farms it'],
iron:['Iron weapons','Research (40 s): your soldiers','and towers hit 25% harder'],
plate:['Plate armor','Research (50 s): your side takes','22% less damage'],
drill:['Drill training','Research (35 s): units are trained','25% faster, at the castle or barracks'],
peasant:['Peasant','Select, then right-click a tree, rock','or gold to harvest it. Click a building to repair'],
knight:['Knight','Tough melee fighter'],
archer:['Archer','Ranged attacker','Right-click a wall, gate or tower','to garrison it for more range'],
bannerman:['Bannerman','Heals nearby allies in a wide area','and speeds up their attacks','Keep him behind the line'],
captain:['Captain','Allies within 8 tiles hit 25% harder','and take 20% less damage'],
king:['King Naraige','Summoned at the castle with his 2 royal guards - one king only','His sword cuts through the horde; allies within 10 tiles','hit 35% harder and take 20% less damage'],
guard:['Royal guard','A new halberdier to escort the king (2 at most)','Long reach, sweeps several zombies at once'],
stoneup:['Upgrade to stone','Rebuilds this building in stone:','twice the hit points','Needs Stonemasonry'],
upgtool:['Stone upgrade tool','Click or drag over wooden buildings','to rebuild them in stone (walls...)'],
cannon:['Cannon [/]','Field gun pushed by a crew of 2 (2 population)','Its cannonballs blast whole groups of zombies','Slow, and weak up close. Needs Stonemasonry'],
barracks:['Barracks [C]','2x2 building, click it to select','Units trained while it is selected','come out of it, 35% faster'],
upgrade:['Stonemasonry [G]','Research (45 s): every wooden building,','castle included, becomes stone','New buildings are stone afterwards'],
wall:['Wooden wall','Cheap and links to its neighbours','Upgrade it to stone later'],
gate:['Wooden gate','2 tiles long. R rotates it','Your units pass, zombies must break it'],
tower:['Wooden tower','Long range: volleys of 5 arrows','Lights the night. Archers garrison (3)'],
ballista:['Ballista [B]','Click a finished tower to mount it','Pierces a whole line of zombies'],
trebuchet:['Trebuchet [T]','Click a finished tower to mount it','Huge range, boulders crush a crowd'],
raise:['Raise ground [Y]','Paint tiles: idle or selected peasants','raise them by 1 block (free)','Click a marked tile again to cancel'],
dig:['Dig ground [U]','Paint tiles: peasants lower them by 1','and give back 2 stone each'],
form:['Formation [V]','Cycles None / Line / Block / Wedge / Ring','Used when you move 3+ selected soldiers'],
idle:['Idle peasants [.]','Selects peasants with no job','and centers the camera on them'],
path:['Path','Faster travel','Click or drag to paint'],

 army:['Select army [Q]','Selects all fighters'],'rb+':['Add a builder','A peasant who only builds new buildings','and demolishes; he waits at the guild'],'rb-':['Remove a builder','He goes back to gathering'],'rr+':['Add a repairer','Repairs damaged buildings by himself (uses','resources); stays out at night for the walls'],'rr-':['Remove a repairer','He goes back to gathering'],'rt+':['Add a terraformer','Digs, raises and builds the ramps you order;','the other peasants keep gathering'],'rt-':['Remove a terraformer','He goes back to gathering'],mode:['Mouse mode','Select: drag draws a box','Pan: drag moves the camera']};

const RN={g:'gold',w:'wood',s:'stone',f:'food'};

export let CMP = false;
const MW=34,MH=38;
/* build menu in categories: the bar shows Defense / Economy / Town / Land; a click opens that category (Back or Esc to return) */
const BCATS={def:['Defense',['wall','gate','tower','torch','spike']],eco:['Economy',['farm','forester','storage','market']],town:['Town',['house','barracks','guild','academy']],land:['Land',['path','raise','dig','ramp']],siege:['Siege',['ballista','trebuchet']]},BCI={def:'tower',eco:'farm',town:'house',land:'raise',siege:'ballista'};

function catItems(c,siege){return BCATS[c][1]}

function catKeys(c,siege){const a=catItems(c,siege);return a.concat(a.filter(k=>TIERK.has(k)).map(k=>'s:'+k))}

function buildGroups(siege){const sg=siege&&RS.done;if(buildMenuState.BCAT&&BCATS[buildMenuState.BCAT]&&(buildMenuState.BCAT!=='siege'||sg))return[[BCATS[buildMenuState.BCAT][0],['back'].concat(catKeys(buildMenuState.BCAT,siege))]];return[['Build',['cat:def','cat:eco','cat:town','cat:land'].concat(sg?['cat:siege']:[],RS.done?['upgtool']:[],['demolish'])]]}

function ctxGroups(){const S=sel();if(S.length){const sol=S.some(u=>u.type!=='peasant'),pea=S.some(u=>u.type==='peasant'),G=[];
  if(sol)G.push(['Behaviour',['agg','def','hold','stop']]);
  if(pea&&!sol)G.push(['Peasants',['work','stop']],['Tasks',['jw','js','jg','jf','jr']],...buildGroups(false));
  G.push(['Group',(sol&&S.length>=2?['form']:[]).concat(['army','idle','mode'])]);return G}
 const upI=b=>b&&b.tier===0&&UPC[b.type]?['stoneup']:[];
 if(selectionState.selB&&sessionState.structs.includes(selectionState.selB)&&selectionState.selB.prog>=1&&!TRB.has(selectionState.selB.type))return[['Command',upI(selBs().find(s=>s.tier===0)||selectionState.selB).concat(['repair','demolish'],ROTT.has(selectionState.selB.type)?['rotate']:[])]];
 const t=curB().type;
 if(t==='market')return[['Trade',['sellw','sells','sellf','buyw','buys','buyf']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='guild')return[['Builders',['rb-','rb+']],['Repairers',['rr-','rr+']],['Terraformers',['rt-','rt+']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='academy')return[['Research',['upgrade','iron','plate','steel','mail','drill','tools','harvest','fletch','fire','bastion','oil','era']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='barracks')return[['Train',['knight','archer','bannerman','captain'].concat(RS.done?['cannon']:[])],['Command',upI(curB()).concat(['army','idle','rally','repair','demolish','rotate','form','mode'])]];
 return[['Train',['peasant'].concat(royalBtns())],...buildGroups(true),['Command',upI(HOMEC()).concat(['army','idle','rallyc','repair','rotate','movec','form','mode'])]].concat(MP.on&&sessionState.CS2?[['Co-op',['convoy']]]:[])}

export function menuItems(){CMP=cv.width/hudDisplayState.UIS<420;const L=[];ctxGroups().forEach(([n,ks0])=>{let ks=ks0;if(n==='Command'&&sel().length<2)ks=ks.filter(k=>k==='stoneup'||k==='rally'||k==='rallyc'||k==='rotate'||k==='movec'||k==='repair'||(k==='demolish'&&selectionState.selB&&sessionState.structs.includes(selectionState.selB)));if(n==='Siege'&&!RS.done)return;if(!ks.length)return;if(L.length)L.push({gap:7});ks.forEach((k,i)=>{const nc=Object.keys(C[k.startsWith('s:')?k.slice(2):k]||{}).length,it={k:(k in T||k in C)?'buy':k,id:k,grp:n,first:i===0,w:CMP?25:MW+(nc>2?(nc-2)*9:0),h:CMP?25:MH};
  if(n!=='Build'&&TIERK.has(k)&&buildMenuState.BCAT)it.tr=0;
  if(k.startsWith('s:')){it.k='buy';it.id=k.slice(2);it.tr=1;it.first=false;it.under=L.find(o=>o.id===it.id&&o.tr===0)||null}
  L.push(it)})});return L}

const upTarget=()=>selectionState.selB&&sessionState.structs.includes(selectionState.selB)?selectionState.selB:HOMEC();

function itemFn(it){return it.k==='convoy'?()=>{convoyPanelState.convoyOpen=!convoyPanelState.convoyOpen;snd('click')}:JOBK.has(it.k)?()=>assignJob(it.k[1]):it.k==='stoneup'?()=>{const L=selBs().filter(s=>s.tier===0&&UPC[s.type]);if(L.length){for(const s of L)build('upgrade',s.tx,s.ty);return}const b=upTarget();if(b)build('upgrade',b.tx,b.ty)}:it.k==='upgtool'?()=>{if(!RS.done){hudDisplayState.msgS='Needs Stonemasonry';hudDisplayState.msgT=2;snd('err');return}sessionState.units.forEach(u=>u.sel=false);sessionState.mode=sessionState.mode==='upgrade'?null:'upgrade';snd('click')}:it.k.startsWith('cat:')?()=>{buildMenuState.BCAT=it.k.slice(4);snd('click')}:it.k==='back'?()=>{buildMenuState.BCAT=null;snd('click')}:ROLEK.has(it.k)?()=>roleAdj(it.k[1],it.k[2]==='+'?1:-1):STNK.has(it.k)?()=>setStance(it.k):it.k==='form'?()=>{constructionState.formType=(constructionState.formType+1)%FORMS.length;hudDisplayState.msgS='Formation: '+FORMS[constructionState.formType];hudDisplayState.msgT=2}:it.k==='idle'?selIdle:it.k==='buy'?(it.tr!==undefined?()=>tierPick(it):()=>buy(it.id)):it.k==='army'?army:it.k==='group'?groupSel:it.k==='ungroup'?ungroupSel:it.k==='mode'?()=>{inputState.panMode=!inputState.panMode}:null}

let hovK='';
export function uiBtn(x,y,w,h,pal,palH,fn,tip,draw,on,dis){const hit=U(x,y,w,h),hv=inR(inputState.mouse,hit)&&!dis&&!!fn;{const k=x+','+y+','+w;if(hv&&hovK!==k){hovK=k;snd('hover')}else if(!hv&&hovK===k)hovK=''}frame(x,y,w,h,dis?(pal===SLOT?SLOTX:BTNX):hv?palH:pal);if(on)gold(x,y,w,h);if(draw){const c=canvasesState.ctx;c.save();c.beginPath();c.rect(x+1,y+1,w-2,h-2);c.clip();setClipBox([x,y,w,h]);draw(x,y,w,h,hv,dis);setClipBox(null);c.restore()}hudState.uiHits.push({...hit,fn:dis?null:fn,tip})}

const tierC=it=>it.tr===undefined?C[it.id]:(RS.done&&it.tr?CSTONE:CWOOD)[it.id];

function tierPick(it){const t=it.tr;if(t&&!RS.done){hudDisplayState.msgS='Stone building needs Masonry (Academy)';hudDisplayState.msgT=3;snd('err');return}const same=!RS.done||playersState.BTIER===t;if(sessionState.mode===it.id&&!same){setTier(t);snd('click');return}setTier(t);buy(it.id)}

export function costParts(id,cc){const c=cc||C[id]||{};return Object.entries(c).map(([k,v])=>[String(v),sessionState.res[k]>=v?({g:'#ffd23c',w:'#e8b27a',s:'#d4dae6',f:'#f2c14e'})[k]:'#ff6a6a',k])}

const RIC=k=>k==='g'?IC.coin:k==='w'?IC.wood:k==='f'?IC.food:IC.stone;

export function drawCost(cp,x,y,w,sc,is){const fit=q=>cp.reduce((a,p)=>a+tw(p[0],q)+is*q/sc+3,-3);while(sc>.34&&fit(sc)>w-4){sc-=.04;is-=.4}const tot=cp.reduce((a,p)=>a+tw(p[0],sc)+is+3,-3);let cx=x+(w-tot)/2;cp.forEach(p=>{dIc(RIC(p[2]),cx,y-1.5,is);cx+=is+1;T_(p[0],cx,y,p[1],sc);cx+=tw(p[0],sc)+3})}

const STNK=new Set(['agg','def','hold','stop','work']);
function stanceOn(k){const S=sel().filter(u=>u.type!=='peasant');return S.length>0&&S.every(u=>(u.stn||'agg')===k)}

export function drawItem(it){const cat=it.k.startsWith('cat:')?it.k.slice(4):null,on=(it.k==='upgtool'&&sessionState.mode==='upgrade')||(cat&&catItems(cat,true).includes(sessionState.mode))||(it.k==='buy'&&sessionState.mode===it.id&&(it.tr===undefined||(it.tr?stoneOn():!stoneOn())))||(it.k==='mode'&&inputState.panMode)||(it.k==='form'&&constructionState.formType>0)||(STNK.has(it.k)&&it.k!=='stop'&&it.k!=='work'&&stanceOn(it.k)),dis=it.k==='buy'&&((it.tr===1&&!RS.done)||!ok(tierC(it)||{})||sessionState.over||(it.id==='upgrade'&&(RS.done||RS.on))||(((it.id in RT2)||it.id==='upgrade')&&!hasAcademy(LPL()))||((it.id in RT2)&&(RS2.done[it.id]||RS2.on||(RPRE[it.id]&&!(RPRE[it.id]==='masonry'?RS.done:RS2.done[RPRE[it.id]]))))||(it.id in T&&it.id!=='ballista'&&it.id!=='trebuchet'&&popUsed(LPL())+popOf(it.id)>popCap(LPL()))||(it.id==='cannon'&&!RS.done))||(it.k==='stoneup'&&(()=>{const b=upTarget(),c=b&&UPC[b.type];return !RS.done||!c||!ok(c)})());
 let tip=TIPS[it.id||it.k];if(it.k==='buy'&&C[it.id]&&!TRADEK.has(it.id))tip=[NAMES[it.id]].concat(TIPS[it.id].slice(1),['']);if(it.tr!==undefined)tip=[(it.tr?'Stone ':'Wooden ')+NAMES[it.id].toLowerCase()+(it.tr||HK[it.id]===undefined?'':' ['+HK[it.id]+']'),it.tr?'Much tougher: holds the horde far longer':'Cheap and quick to build'].concat(it.tr&&!RS.done?['Locked: research Masonry at the Academy']:[],['']);if(it.k==='buy'&&tip&&((it.id in RT2)||it.id==='upgrade')){const up=it.id==='upgrade',ex=[];if(up?RS.done:RS2.done[it.id])ex.push('Already researched');else if(up?RS.on:RS2.on===it.id)ex.push('In progress: '+Math.floor(up?RS.t/RT_TIME*100:RS2.t/RT2[it.id]*100)+'%');else if(!up&&RS2.on)ex.push('Wait: '+RN2[RS2.on]+' first');if(!hasAcademy(LPL()))ex.push('Needs your own Academy');if(MP.on)ex.push('Shared: helps both players');if(ex.length)tip=tip.slice(0,-1).concat(ex,[tip[tip.length-1]])}
 const ic=it.k==='stoneup'||it.k==='upgtool'?IC.upgrade:it.tr!==undefined?(ICT[it.tr][it.id]||IC[it.id]):cat?IC[BCI[cat]]:it.k==='back'?IC.back:ROLEK.has(it.k)?IC[({b:'wall',r:'repair',t:'raise'})[it.k[1]]]:STNK.has(it.k)?IC[it.k]:JOBK.has(it.k)?IC[JOBI[it.k]]:it.k==='convoy'?IC.convoy:it.k==='buy'?IC[it.id]:it.k==='army'?IC.army:it.k==='idle'?IC.idle:it.k==='form'?IC.group:inputState.panMode?IC.pan:IC.cursor;
 const nm=NAMES[it.id]||'',idleN=it.k==='idle'?idleP().length:0;
 if(it.lab&&!CMP)TN(it.grp,it.x+1,it.y-9.5,'#d6b46a',.72);
 uiBtn(it.x,it.y,it.w,it.h,SLOT,SLOTH,itemFn(it),tip,(x,y,w,h)=>{canvasesState.ctx.globalAlpha=dis?.45:1;if(CMP){dIc(ic,x+((w-17)>>1),y+((h-17)>>1)+1,17);canvasesState.ctx.globalAlpha=1;if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+2,y+1.5,'#ffff55',.6);if(idleN)T_('!',x+w-5,y+1,'#ff6a6a',.7);return}dIc(ic,x+((w-16)>>1),y+4,16);
  TCf(nm,x+w/2,y+21.5,dis?'#b8b8b8':'#ffffff',.7,w-3,.42);canvasesState.ctx.globalAlpha=1;
  const rdn=it.k==='buy'&&((it.id==='upgrade'&&RS.done)||((it.id in RT2)&&RS2.done[it.id])),ron=it.k==='buy'&&((it.id==='upgrade'&&RS.on)||((it.id in RT2)&&RS2.on===it.id));
  if(rdn){canvasesState.ctx.globalAlpha=1;TCf('Done',x+w/2,y+29.5,'#6aff7a',.62,w-14,.4);canvasesState.ctx.strokeStyle='#0b0810';canvasesState.ctx.lineWidth=3.2;canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(x+w-12,y+7);canvasesState.ctx.lineTo(x+w-8,y+11);canvasesState.ctx.lineTo(x+w-2.5,y+3.5);canvasesState.ctx.stroke();canvasesState.ctx.strokeStyle='#6aff7a';canvasesState.ctx.lineWidth=1.8;canvasesState.ctx.stroke()}
  else if(ron){const pc=Math.floor((it.id==='upgrade'?RS.t/RT_TIME:RS2.t/RT2[it.id])*100)+'%';T_(pc,x+(w-tw(pc,.62))/2,y+29.5,'#ffe066',.62);canvasesState.ctx.fillStyle='#ffe066';canvasesState.ctx.fillRect(x+3,y+h-3,(w-6)*Math.min(1,parseInt(pc)/100),1.5)}
  else if(it.k==='buy'&&(it.id==='dig'||it.id==='raise'||it.id==='ramp'))TCf('Free',x+w/2,y+29.5,'#55ff55',.62,w-3,.4);else if(it.tr===1&&!RS.done){TCf('Locked',x+w/2,y+29.5,'#ff8a6a',.62,w-3,.4)}else if(it.k==='buy'){drawCost(costParts(it.id,tierC(it)),x,y+29.5,w,.62,7)}
  else if(it.k==='stoneup'){const b=upTarget(),c=b&&UPC[b.type],n=Math.max(1,selBs().filter(s=>s.tier===0&&UPC[s.type]).length);if(!RS.done)TCf('Masonry',x+w/2,y+29.5,'#ff8a6a',.58,w-3,.4);else if(c)drawCost(Object.entries(c).map(([k,v])=>[String(v*n),sessionState.res[k]>=v*n?'#d4dae6':sessionState.res[k]>=v?'#f2c14e':'#ff6a6a',k]),x,y+29.5,w,.62,7)}
  else if(it.k==='upgtool')T_('Paint',x+(w-tw('Paint',.62))/2,y+29.5,sessionState.mode==='upgrade'?'#ffff55':'#e0e0e0',.62);else if(it.k==='convoy')T_('Send',x+(w-tw('Send',.62))/2,y+29.5,convoyPanelState.convoyOpen?'#ffff55':'#e0e0e0',.62);else if(JOBK.has(it.k))T_(JOBL[it.k],x+(w-tw(JOBL[it.k],.62))/2,y+29.5,'#e0e0e0',.62);
  else if(cat){const s=BCATS[cat][1].length+' types';T_(s,x+(w-tw(s,.62))/2,y+29.5,'#d6b46a',.62)}
  else if(it.k==='back')T_('Esc',x+(w-tw('Esc',.62))/2,y+29.5,'#ffff55',.62);
  else if(it.k==='idle'){T_(idleN?idleN+' idle':'none',x+(w-tw(idleN?idleN+' idle':'none',.62))/2,y+29.5,idleN?'#ffff55':'#b0b0b0',.62)}
  else if(it.k==='mode')T_(inputState.panMode?'Pan':'Select',x+(w-tw(inputState.panMode?'Pan':'Select',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='army')T_('fighters',x+(w-tw('fighters',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='form')T_(FORMS[constructionState.formType],x+(w-tw(FORMS[constructionState.formType],.62))/2,y+29.5,constructionState.formType?'#ffff55':'#e0e0e0',.62);
  else if(ROLEK.has(it.k)){const r=it.k[1],p=LPL(),s=RHAS[p][r]+' / '+ROLE[p][r];T_(s,x+(w-tw(s,.62))/2,y+29.5,ROLE[p][r]?'#ffff55':'#b0b0b0',.62)}
  if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+3,y+2.5,'#ffff55',.68);
  if(it.tr===1&&!RS.done){canvasesState.ctx.globalAlpha=1;const lx=x+w-10,ly=y+3;canvasesState.ctx.strokeStyle='#e8c070';canvasesState.ctx.lineWidth=1.2;canvasesState.ctx.beginPath();canvasesState.ctx.arc(lx+3.5,ly+3.5,2.2,Math.PI,0);canvasesState.ctx.stroke();canvasesState.ctx.fillStyle='#e8c070';canvasesState.ctx.fillRect(lx,ly+3.5,7,5.5);canvasesState.ctx.fillStyle='#3a2a10';canvasesState.ctx.fillRect(lx+3,ly+5.3,1,2)}
  if(idleN)T_('!',x+w-6,y+2,'#ff6a6a',.8);
  if(cat){canvasesState.ctx.fillStyle='#d6b46a';canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(x+w-2.5,y+2.5);canvasesState.ctx.lineTo(x+w-2.5,y+8.5);canvasesState.ctx.lineTo(x+w-8.5,y+2.5);canvasesState.ctx.closePath();canvasesState.ctx.fill()}},on,dis);
 if(it.k==='buy'){const hh=hudState.uiHits[hudState.uiHits.length-1];hh.price=true;hh.cost=it.id}}

export function initializeBuildMenu() {
  for(const k of['sellw','sells','buyw','buys','sellf','buyf']){const r=k[k.length-1],sl=k[0]==='s';Object.defineProperty(TIPS,k,{get:()=>sl?['Sell 50 '+RN[r],'You get '+tradeGain(r)+' gold','Each sale lowers the price for a while']:['Buy 50 '+RN[r],'Costs '+tradeCost(r)+' gold','Each purchase raises the price for a while'],enumerable:true,configurable:true});Object.defineProperty(NAMES,k,{get:()=>sl?'+'+tradeGain(r)+' gold':'+50 '+RN[r],enumerable:true,configurable:true})}
  Object.defineProperty(NAMES,'tier',{get:()=>RS.done&&playersState.BTIER?'Stone':'Wood',enumerable:true,configurable:true});

  for(const c in BCATS){NAMES['cat:'+c]=BCATS[c][0]}
  NAMES.back='Back';

  TIPS['cat:def']=['Defense','Walls, gates, towers and torches','Wood row on top, stone row below'];
  TIPS['cat:siege']=['Siege','Ballista and trebuchet'];
  TIPS['cat:eco']=['Economy','Farms, forester hut, storage, market'];
  TIPS['cat:town']=['Town','Houses, barracks, builders guild, academy'];
  TIPS['cat:land']=['Land','Paths, raise and dig ground, ramps'];
  TIPS.back=['Back [Esc]','Return to the building categories'];

  IC.cannon=IC.cannon||ICN(g=>{rrg(g,3,6,11,4,1,'#3b3e44','#15171a',.8);circ(g,5,11,3,'#7a5532','#2a1a0c',.8);circ(g,11,11,3,'#7a5532','#2a1a0c',.8)});

  IC.back=ICN(g=>{poly(g,[[1.5,8],[7.5,2],[7.5,5.5],[14.5,5.5],[14.5,10.5],[7.5,10.5],[7.5,14]],'#f6e9d2','#2a303a',.9)});
}
