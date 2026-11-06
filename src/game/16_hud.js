/* ================= HUD, world map, title screen, input ================= */
let uiHits=[],uiRects=[],mmRect={x:0,y:0,w:0,h:0},mmDrag=false;
const U=(x,y,w,h)=>({x:x*UIS,y:y*UIS,w:w*UIS,h:h*UIS}),inR=(p,r)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
const mm2=cvs(900,500),m2g=mm2.getContext('2d');let mmT=-9;
function refreshMM(){m2g.imageSmoothingEnabled=true;m2g.imageSmoothingQuality='high';m2g.drawImage(mc,0,0,900,500)}
const NAMES={
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
for(const k of['sellw','sells','buyw','buys','sellf','buyf']){const r=k[k.length-1],sl=k[0]==='s';Object.defineProperty(TIPS,k,{get:()=>sl?['Sell 50 '+RN[r],'You get '+tradeGain(r)+' gold','Each sale lowers the price for a while']:['Buy 50 '+RN[r],'Costs '+tradeCost(r)+' gold','Each purchase raises the price for a while'],enumerable:true,configurable:true});Object.defineProperty(NAMES,k,{get:()=>sl?'+'+tradeGain(r)+' gold':'+50 '+RN[r],enumerable:true,configurable:true})}Object.defineProperty(NAMES,'tier',{get:()=>RS.done&&BTIER?'Stone':'Wood',enumerable:true,configurable:true});
let CMP=false,FPV=null;const MW=34,MH=38;
/* build menu in categories: the bar shows Defense / Economy / Town / Land; a click opens that category (Back or Esc to return) */
let BCAT=null;const BCATS={def:['Defense',['wall','gate','tower','torch','spike']],eco:['Economy',['farm','forester','storage','market']],town:['Town',['house','barracks','guild','academy']],land:['Land',['path','raise','dig','ramp']],siege:['Siege',['ballista','trebuchet']]},BCI={def:'tower',eco:'farm',town:'house',land:'raise',siege:'ballista'};
function catItems(c,siege){return BCATS[c][1]}
function catKeys(c,siege){const a=catItems(c,siege);return a.concat(a.filter(k=>TIERK.has(k)).map(k=>'s:'+k))}
function buildGroups(siege){const sg=siege&&RS.done;if(BCAT&&BCATS[BCAT]&&(BCAT!=='siege'||sg))return[[BCATS[BCAT][0],['back'].concat(catKeys(BCAT,siege))]];return[['Build',['cat:def','cat:eco','cat:town','cat:land'].concat(sg?['cat:siege']:[],RS.done?['upgtool']:[],['demolish'])]]}
for(const c in BCATS){NAMES['cat:'+c]=BCATS[c][0]}NAMES.back='Back';
TIPS['cat:def']=['Defense','Walls, gates, towers and torches','Wood row on top, stone row below'];TIPS['cat:siege']=['Siege','Ballista and trebuchet'];TIPS['cat:eco']=['Economy','Farms, forester hut, storage, market'];TIPS['cat:town']=['Town','Houses, barracks, builders guild, academy'];TIPS['cat:land']=['Land','Paths, raise and dig ground, ramps'];TIPS.back=['Back [Esc]','Return to the building categories'];
IC.cannon=IC.cannon||ICN(g=>{rrg(g,3,6,11,4,1,'#3b3e44','#15171a',.8);circ(g,5,11,3,'#7a5532','#2a1a0c',.8);circ(g,11,11,3,'#7a5532','#2a1a0c',.8)});
IC.back=ICN(g=>{poly(g,[[1.5,8],[7.5,2],[7.5,5.5],[14.5,5.5],[14.5,10.5],[7.5,10.5],[7.5,14]],'#f6e9d2','#2a303a',.9)});
function ctxGroups(){const S=sel();if(S.length){const sol=S.some(u=>u.type!=='peasant'),pea=S.some(u=>u.type==='peasant'),G=[];
  if(sol)G.push(['Behaviour',['agg','def','hold','stop']]);
  if(pea&&!sol)G.push(['Peasants',['work','stop']],['Tasks',['jw','js','jg','jf','jr']],...buildGroups(false));
  G.push(['Group',(sol&&S.length>=2?['form']:[]).concat(['army','idle','mode'])]);return G}
 const upI=b=>b&&b.tier===0&&UPC[b.type]?['stoneup']:[];
 if(selB&&structs.includes(selB)&&selB.prog>=1&&!TRB.has(selB.type))return[['Command',upI(selBs().find(s=>s.tier===0)||selB).concat(['repair','demolish'],ROTT.has(selB.type)?['rotate']:[])]];
 const t=curB().type;
 if(t==='market')return[['Trade',['sellw','sells','sellf','buyw','buys','buyf']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='guild')return[['Builders',['rb-','rb+']],['Repairers',['rr-','rr+']],['Terraformers',['rt-','rt+']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='academy')return[['Research',['upgrade','iron','plate','steel','mail','drill','tools','harvest','fletch','fire','bastion','oil','era']],['Command',upI(curB()).concat(['repair','demolish','rotate'])]];
 if(t==='barracks')return[['Train',['knight','archer','bannerman','captain'].concat(RS.done?['cannon']:[])],['Command',upI(curB()).concat(['army','idle','rally','repair','demolish','rotate','form','mode'])]];
 return[['Train',['peasant'].concat(royalBtns())],...buildGroups(true),['Command',upI(HOMEC()).concat(['army','idle','rallyc','repair','rotate','movec','form','mode'])]].concat(MP.on&&CS2?[['Co-op',['convoy']]]:[])}
function menuItems(){CMP=cv.width/UIS<420;const L=[];ctxGroups().forEach(([n,ks0])=>{let ks=ks0;if(n==='Command'&&sel().length<2)ks=ks.filter(k=>k==='stoneup'||k==='rally'||k==='rallyc'||k==='rotate'||k==='movec'||k==='repair'||(k==='demolish'&&selB&&structs.includes(selB)));if(n==='Siege'&&!RS.done)return;if(!ks.length)return;if(L.length)L.push({gap:7});ks.forEach((k,i)=>{const nc=Object.keys(C[k.startsWith('s:')?k.slice(2):k]||{}).length,it={k:(k in T||k in C)?'buy':k,id:k,grp:n,first:i===0,w:CMP?25:MW+(nc>2?(nc-2)*9:0),h:CMP?25:MH};
  if(n!=='Build'&&TIERK.has(k)&&BCAT)it.tr=0;
  if(k.startsWith('s:')){it.k='buy';it.id=k.slice(2);it.tr=1;it.first=false;it.under=L.find(o=>o.id===it.id&&o.tr===0)||null}
  L.push(it)})});return L}
function flow(L,x0,y0,w){let x=x0,y=y0+(CMP?0:9),rh=0,mx=0,rowStart=true;for(const it of L){if(it.under){it.x=it.under.x;it.y=it.under.y+it.under.h+3;it.lab=false;rh=Math.max(rh,it.y+it.h-y);continue}if(it.br){x=x0+9999}if(it.gap!==undefined){x+=it.gap;continue}if(x+it.w>x0+w&&x>x0){x=x0;y+=rh+(CMP?3:12);rh=0;rowStart=true}it.x=x;it.y=y;it.lab=it.first;rowStart=false;x+=it.w+3;rh=Math.max(rh,it.h);mx=Math.max(mx,x-3)}return{h:y+rh-y0,w:mx-x0}}
const idleP=()=>units.filter(u=>u.t===0&&(!MP.on||(u.pl|0)===CURPL)&&u.type==='peasant'&&!u.job&&!u.o&&!u.carry&&u.hp>0&&!u.shel);
function selPeas(){const P=units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&!u.shel&&(!MP.on||(u.pl|0)===CURPL));if(!P.length)return;units.forEach(u=>u.sel=false);P.forEach(u=>u.sel=true);mode=null;msgS=P.length+' peasants selected';msgT=2}
function selIdle(){const I=idleP();if(!I.length){msgS='No idle peasants';msgT=2;return}units.forEach(u=>u.sel=false);mode=null;I.forEach(u=>u.sel=true);CAM.x=I[0].x/TS;CAM.z=I[0].y/TS;msgS=I.length+' idle peasant'+(I.length>1?'s':'')+' selected';msgT=3}
/* ---- tasks for the selected peasants: the nearest target of that kind, then an ordinary order (a command in co-op) ---- */
const JOBK=new Set(['jw','js','jg','jf','jr']),JOBI={jw:'wood',js:'stone',jg:'coin',jf:'farm',jr:'repair'},JOBL={jw:'Wood',js:'Stone',jg:'Gold',jf:'Farm',jr:'Build'};
function assignJob(c){const P=sel().filter(u=>u.type==='peasant');if(!P.length)return;let cx=0,cy=0;for(const u of P){cx+=u.x;cy+=u.y}const ux=Math.floor(cx/P.length/TS),uy=Math.floor(cy/P.length/TS);let best=null;
 if(c==='w'||c==='s'||c==='g'){const code={w:2,s:3,g:4}[c];for(let r=1;r<=60&&!best;r++)for(let j=-r;j<=r&&!best;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=ux+i,y=uy+j;if(!gOK(x,y))continue;const k=y*TW+x;if(ter[k]!==code||!(amt[k]>0)||!exposed(x,y))continue;if(reach(x,y)||reachLong(x,y)){best=[x,y];break}}}
 else{let bd=1e18;for(const q of structs){if(q.t!==0||q.hp<=0||(MP.on&&(q.pl|0)!==CURPL))continue;const ok=c==='f'?q.type==='farm'&&q.prog>=1&&!wkOf(q):(q.prog<1||(q.hp<q.max&&q.type!=='castle'));if(!ok)continue;const d=(q.x/TS-ux)**2+(q.y/TS-uy)**2+(c==='r'&&q.prog>=1?400:0);if(d<bd){bd=d;best=[q.tx,q.ty]}}}
 if(!best){msgS=({w:'No trees within reach',s:'No rocks within reach',g:'No gold within reach',f:'No free farm: build one',r:'Nothing to build or repair'})[c];msgT=3;snd('err');return}
 order({x:(best[0]+.5)*TS,y:(best[1]+.5)*TS});snd('click')}
/* ---- convoy panel: choose how much of each resource goes to the partner ---- */
let convoyOpen=false;const CVA={g:0,w:0,s:0,f:0};
function drawConvoy(UW,UH){if(!MP.on||!CS2){convoyOpen=false;return}const W=Math.min(310,UW-16),H=154,x=Math.round((UW-W)/2),y=Math.round(Math.max(TOPH+24,(UH-H)/2-60));
 frame(x,y,W,H,PAN,6);uiRects.push(U(x,y,W,H));TN('Convoy to '+(MP.pname||'your partner'),x+10,y+6,'#f2d48a',.84);
 [['g','coin'],['w','wood'],['s','stone'],['f','food']].forEach(([k,ic],i)=>{const yy=y+24+i*21,have=Math.max(0,Math.floor(res[k]||0));CVA[k]=Math.max(0,Math.min(CVA[k],have));dIc(IC[ic],x+10,yy+1,14);
  const bt=(dx,lab,d)=>uiBtn(x+dx,yy,31,16,BTN,BTNH,()=>{CVA[k]=Math.max(0,Math.min(have,CVA[k]+d));snd('click')},null,(bx,by,bw)=>TC(lab,bx+bw/2,by+3.5,'#ffffff',.68));
  bt(30,'-100',-100);bt(64,'-25',-25);TC(String(CVA[k]),x+Math.round(W/2)+2,yy+3,CVA[k]?'#ffffff':'#8a8a8a',.9);bt(W-104,'+25',25);bt(W-70,'+100',100);T_(String(have),x+W-34,yy+3.5,'#b59773',.62)});
 const tot=CVA.g+CVA.w+CVA.s+CVA.f,np=Math.max(1,Math.min(5,Math.ceil(tot/100)));
 T_(tot?np+' porter'+(np>1?'s':'')+' - zombies can stop them':'Choose what to send',x+10,y+H-34,'#b59773',.64);
 pill(x+W-152,y+H-24,74,18,'Send',GRN,GRNH,()=>{if(!tot)return;sendConvoy({...CVA});CVA.g=CVA.w=CVA.s=CVA.f=0;convoyOpen=false},null,.85,false,!tot);
 pill(x+W-74,y+H-24,66,18,'Cancel',BTN,BTNH,()=>{convoyOpen=false},null,.85)}
/* ---- troops panel: all your units by type, and what each group is doing; click a line or a task to select them ---- */
let troopsOpen=false;const PLUN={peasant:'Peasants',knight:'Knights',archer:'Archers',bannerman:'Bannermen',captain:'Captains',cannon:'Cannons',guard:'Royal guards'};
function unitTask(u){if(u.cv)return'convoy';if(u.gar)return'tower';if(u.shel)return'shelter';if(u.type==='peasant'){if(u.role)return'r'+u.role;if(u.job)return'j'+u.job;return u.o?'move':'idle'}if(u.atk>0||u.cd>0)return'fight';if(u.o)return'move';return'guard'}
const TASKN={convoy:'Convoy',tower:'In a tower',shelter:'Sheltering',idle:'Idle',move:'Moving',fight:'Fighting',guard:'On guard',jw:'Wood',js:'Stone',jg:'Gold',jf:'Farming',jp:'Planting',jt:'Terraforming',jr:'Building',rb:'Builder',rr:'Repairer',rt:'Terraformer'};
const TROOPO=['peasant','knight','archer','bannerman','captain','cannon','king','guard'],TRIC2={king:'crown',guard:'sword'};
function selectUnits(L){units.forEach(u=>u.sel=false);for(const u of L)if(u.hp>0)u.sel=true;selB=null;castleSel=false;SELBS=[];mode=null;snd('select')}
function drawTroops(UW,UH){const mine=units.filter(u=>u.t===0&&u.hp>0&&(!MP.on||(u.pl|0)===LPL()));const byT=new Map();
 for(const u of mine){let m=byT.get(u.type);if(!m){m=new Map();byT.set(u.type,m)}const k=unitTask(u);if(!m.has(k))m.set(k,[]);m.get(k).push(u)}
 const types=[...byT.keys()].sort((a,b)=>(TROOPO.indexOf(a)+99)%99-(TROOPO.indexOf(b)+99)%99),WM=Math.min(300,UW-20),x=8,lh=14,y0=TOPH+40,ttl='Troops ('+mine.length+')';
 /* one line per type: the type on the left (click: select all of them), what they are doing on the right (click: select those) */
 let tw0=58;for(const t of types){let n=0;for(const us of byT.get(t).values())n+=us.length;tw0=Math.max(tw0,tw(L(NAMES[t])+'  '+n,.74)+22)}tw0=Math.min(Math.ceil(tw0),Math.round(WM*.46));
 const rows=[],c0=x+tw0+5;let y=y0+17,mx=x+tw(ttl,.82)+30;
 for(const t of types){const m=byT.get(t);rows.push({t,y,all:[...m.values()].flat()});let cx=c0;
  for(const[k,us]of m){const lab=L(TASKN[k])+' '+us.length,w=Math.ceil(tw(lab,.66))+10;if(cx+w>x+WM&&cx>c0){y+=lh;cx=c0}rows.push({k,us,lab,x:cx,y,w});cx+=w+3;mx=Math.max(mx,cx)}
  y+=lh+2}
 if(!types.length)y+=12;const W=Math.min(WM,Math.max(mx-x,tw0+40));
 frame(x-3,y0-3,W+6,y-y0+4,PAN,5);uiRects.push(U(x-3,y0-3,W+6,y-y0+4));
 TN(ttl,x+4,y0+3,'#f2d48a',.82);uiBtn(x+W-17,y0,16,13,BTN,BTNH,()=>{troopsOpen=false},['Close [F2]'],(bx,by)=>dIc(IC.close,bx+2,by+.5,12));
 if(!types.length)T_('No troops',x+6,y0+18,'#b59773',.7);
 for(const r of rows){if(r.t){const t=r.t;uiBtn(x,r.y,tw0,lh,BTN,BTNH,()=>selectUnits(r.all),[NAMES[t]+': select all'],(bx,by)=>{dIc(IC[TRIC2[t]||t]||IC.army,bx+2,by+1,12);T_(L(NAMES[t])+'  '+r.all.length,bx+17,by+2.5,'#ffffff',.74)})}
  else uiBtn(r.x,r.y,r.w,lh,BTNX,BTNH,()=>selectUnits(r.us),[TASKN[r.k]+': select them'],(bx,by)=>T_(r.lab,bx+5,by+2.5,r.k==='fight'?'#ff9a8a':r.k==='idle'?'#ffd27a':'#d6dbe4',.66))}}
const upTarget=()=>selB&&structs.includes(selB)?selB:HOMEC();
function itemFn(it){return it.k==='convoy'?()=>{convoyOpen=!convoyOpen;snd('click')}:JOBK.has(it.k)?()=>assignJob(it.k[1]):it.k==='stoneup'?()=>{const L=selBs().filter(s=>s.tier===0&&UPC[s.type]);if(L.length){for(const s of L)build('upgrade',s.tx,s.ty);return}const b=upTarget();if(b)build('upgrade',b.tx,b.ty)}:it.k==='upgtool'?()=>{if(!RS.done){msgS='Needs Stonemasonry';msgT=2;snd('err');return}units.forEach(u=>u.sel=false);mode=mode==='upgrade'?null:'upgrade';snd('click')}:it.k.startsWith('cat:')?()=>{BCAT=it.k.slice(4);snd('click')}:it.k==='back'?()=>{BCAT=null;snd('click')}:ROLEK.has(it.k)?()=>roleAdj(it.k[1],it.k[2]==='+'?1:-1):STNK.has(it.k)?()=>setStance(it.k):it.k==='form'?()=>{formType=(formType+1)%FORMS.length;msgS='Formation: '+FORMS[formType];msgT=2}:it.k==='idle'?selIdle:it.k==='buy'?(it.tr!==undefined?()=>tierPick(it):()=>buy(it.id)):it.k==='army'?army:it.k==='group'?groupSel:it.k==='ungroup'?ungroupSel:it.k==='mode'?()=>{panMode=!panMode}:null}
function uiBtn(x,y,w,h,pal,palH,fn,tip,draw,on,dis){const hit=U(x,y,w,h),hv=inR(mouse,hit)&&!dis&&!!fn;frame(x,y,w,h,dis?(pal===SLOT?SLOTX:BTNX):hv?palH:pal);if(on)gold(x,y,w,h);if(draw)draw(x,y,w,h,hv,dis);uiHits.push({...hit,fn:dis?null:fn,tip})}
const tierC=it=>it.tr===undefined?C[it.id]:(RS.done&&it.tr?CSTONE:CWOOD)[it.id];
function tierPick(it){const t=it.tr;if(t&&!RS.done){msgS='Stone building needs Masonry (Academy)';msgT=3;snd('err');return}const same=!RS.done||BTIER===t;if(mode===it.id&&!same){setTier(t);snd('click');return}setTier(t);buy(it.id)}
function costParts(id,cc){const c=cc||C[id]||{};return Object.entries(c).map(([k,v])=>[String(v),res[k]>=v?({g:'#ffd23c',w:'#e8b27a',s:'#d4dae6',f:'#f2c14e'})[k]:'#ff6a6a',k])}
const RIC=k=>k==='g'?IC.coin:k==='w'?IC.wood:k==='f'?IC.food:IC.stone;
function drawCost(cp,x,y,w,sc,is){const fit=q=>cp.reduce((a,p)=>a+tw(p[0],q)+is*q/sc+3,-3);while(sc>.45&&fit(sc)>w-1){sc-=.04;is-=.4}const tot=cp.reduce((a,p)=>a+tw(p[0],sc)+is+3,-3);let cx=x+(w-tot)/2;cp.forEach(p=>{dIc(RIC(p[2]),cx,y-1.5,is);cx+=is+1;T_(p[0],cx,y,p[1],sc);cx+=tw(p[0],sc)+3})}
const STNK=new Set(['agg','def','hold','stop','work']);function stanceOn(k){const S=sel().filter(u=>u.type!=='peasant');return S.length>0&&S.every(u=>(u.stn||'agg')===k)}
function drawItem(it){const cat=it.k.startsWith('cat:')?it.k.slice(4):null,on=(it.k==='upgtool'&&mode==='upgrade')||(cat&&catItems(cat,true).includes(mode))||(it.k==='buy'&&mode===it.id&&(it.tr===undefined||(it.tr?stoneOn():!stoneOn())))||(it.k==='mode'&&panMode)||(it.k==='form'&&formType>0)||(STNK.has(it.k)&&it.k!=='stop'&&it.k!=='work'&&stanceOn(it.k)),dis=it.k==='buy'&&((it.tr===1&&!RS.done)||!ok(tierC(it)||{})||over||(it.id==='upgrade'&&(RS.done||RS.on))||(((it.id in RT2)||it.id==='upgrade')&&!hasAcademy(LPL()))||((it.id in RT2)&&(RS2.done[it.id]||RS2.on||(RPRE[it.id]&&!(RPRE[it.id]==='masonry'?RS.done:RS2.done[RPRE[it.id]]))))||(it.id in T&&it.id!=='ballista'&&it.id!=='trebuchet'&&popUsed(LPL())+popOf(it.id)>popCap(LPL()))||(it.id==='cannon'&&!RS.done))||(it.k==='stoneup'&&(()=>{const b=upTarget(),c=b&&UPC[b.type];return !RS.done||!c||!ok(c)})());
 let tip=TIPS[it.id||it.k];if(it.k==='buy'&&C[it.id]&&!TRADEK.has(it.id))tip=[NAMES[it.id]].concat(TIPS[it.id].slice(1),['']);if(it.tr!==undefined)tip=[(it.tr?'Stone ':'Wooden ')+NAMES[it.id].toLowerCase()+(it.tr||HK[it.id]===undefined?'':' ['+HK[it.id]+']'),it.tr?'Much tougher: holds the horde far longer':'Cheap and quick to build'].concat(it.tr&&!RS.done?['Locked: research Masonry at the Academy']:[],['']);if(it.k==='buy'&&tip&&((it.id in RT2)||it.id==='upgrade')){const up=it.id==='upgrade',ex=[];if(up?RS.done:RS2.done[it.id])ex.push('Already researched');else if(up?RS.on:RS2.on===it.id)ex.push('In progress: '+Math.floor(up?RS.t/RT_TIME*100:RS2.t/RT2[it.id]*100)+'%');else if(!up&&RS2.on)ex.push('Wait: '+RN2[RS2.on]+' first');if(!hasAcademy(LPL()))ex.push('Needs your own Academy');if(MP.on)ex.push('Shared: helps both players');if(ex.length)tip=tip.slice(0,-1).concat(ex,[tip[tip.length-1]])}
 const ic=it.k==='stoneup'||it.k==='upgtool'?IC.upgrade:it.tr!==undefined?(ICT[it.tr][it.id]||IC[it.id]):cat?IC[BCI[cat]]:it.k==='back'?IC.back:ROLEK.has(it.k)?IC[({b:'wall',r:'repair',t:'raise'})[it.k[1]]]:STNK.has(it.k)?IC[it.k]:JOBK.has(it.k)?IC[JOBI[it.k]]:it.k==='convoy'?IC.convoy:it.k==='buy'?IC[it.id]:it.k==='army'?IC.army:it.k==='idle'?IC.idle:it.k==='form'?IC.group:panMode?IC.pan:IC.cursor;
 const nm=NAMES[it.id]||'',idleN=it.k==='idle'?idleP().length:0;
 if(it.lab&&!CMP)TN(it.grp,it.x+1,it.y-9.5,'#d6b46a',.72);
 uiBtn(it.x,it.y,it.w,it.h,SLOT,SLOTH,itemFn(it),tip,(x,y,w,h)=>{ctx.globalAlpha=dis?.45:1;if(CMP){dIc(ic,x+((w-17)>>1),y+((h-17)>>1)+1,17);ctx.globalAlpha=1;if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+2,y+1.5,'#ffff55',.6);if(idleN)T_('!',x+w-5,y+1,'#ff6a6a',.7);return}dIc(ic,x+((w-16)>>1),y+4,16);
  let sc=.7;while(sc>.5&&tw(nm,sc)>w-3)sc-=.03;TC(nm,x+w/2,y+21.5,dis?'#b8b8b8':'#ffffff',sc);ctx.globalAlpha=1;
  const rdn=it.k==='buy'&&((it.id==='upgrade'&&RS.done)||((it.id in RT2)&&RS2.done[it.id])),ron=it.k==='buy'&&((it.id==='upgrade'&&RS.on)||((it.id in RT2)&&RS2.on===it.id));
  if(rdn){ctx.globalAlpha=1;T_('Done',x+(w-tw('Done',.62))/2,y+29.5,'#6aff7a',.62);ctx.strokeStyle='#0b0810';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(x+w-12,y+7);ctx.lineTo(x+w-8,y+11);ctx.lineTo(x+w-2.5,y+3.5);ctx.stroke();ctx.strokeStyle='#6aff7a';ctx.lineWidth=1.8;ctx.stroke()}
  else if(ron){const pc=Math.floor((it.id==='upgrade'?RS.t/RT_TIME:RS2.t/RT2[it.id])*100)+'%';T_(pc,x+(w-tw(pc,.62))/2,y+29.5,'#ffe066',.62);ctx.fillStyle='#ffe066';ctx.fillRect(x+3,y+h-3,(w-6)*Math.min(1,parseInt(pc)/100),1.5)}
  else if(it.k==='buy'&&(it.id==='dig'||it.id==='raise'||it.id==='ramp'))T_('Free',x+(w-tw('Free',.62))/2,y+29.5,'#55ff55',.62);else if(it.tr===1&&!RS.done){T_('Locked',x+(w-tw('Locked',.62))/2,y+29.5,'#ff8a6a',.62)}else if(it.k==='buy'){drawCost(costParts(it.id,tierC(it)),x,y+29.5,w,.62,7)}
  else if(it.k==='stoneup'){const b=upTarget(),c=b&&UPC[b.type],n=Math.max(1,selBs().filter(s=>s.tier===0&&UPC[s.type]).length);if(!RS.done)T_('Masonry',x+(w-tw('Masonry',.58))/2,y+29.5,'#ff8a6a',.58);else if(c)drawCost(Object.entries(c).map(([k,v])=>[String(v*n),res[k]>=v*n?'#d4dae6':res[k]>=v?'#f2c14e':'#ff6a6a',k]),x,y+29.5,w,.62,7)}
  else if(it.k==='upgtool')T_('Paint',x+(w-tw('Paint',.62))/2,y+29.5,mode==='upgrade'?'#ffff55':'#e0e0e0',.62);else if(it.k==='convoy')T_('Send',x+(w-tw('Send',.62))/2,y+29.5,convoyOpen?'#ffff55':'#e0e0e0',.62);else if(JOBK.has(it.k))T_(JOBL[it.k],x+(w-tw(JOBL[it.k],.62))/2,y+29.5,'#e0e0e0',.62);
  else if(cat){const s=BCATS[cat][1].length+' types';T_(s,x+(w-tw(s,.62))/2,y+29.5,'#d6b46a',.62)}
  else if(it.k==='back')T_('Esc',x+(w-tw('Esc',.62))/2,y+29.5,'#ffff55',.62);
  else if(it.k==='idle'){T_(idleN?idleN+' idle':'none',x+(w-tw(idleN?idleN+' idle':'none',.62))/2,y+29.5,idleN?'#ffff55':'#b0b0b0',.62)}
  else if(it.k==='mode')T_(panMode?'Pan':'Select',x+(w-tw(panMode?'Pan':'Select',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='army')T_('fighters',x+(w-tw('fighters',.62))/2,y+29.5,'#e0e0e0',.62);
  else if(it.k==='form')T_(FORMS[formType],x+(w-tw(FORMS[formType],.62))/2,y+29.5,formType?'#ffff55':'#e0e0e0',.62);
  else if(ROLEK.has(it.k)){const r=it.k[1],p=LPL(),s=RHAS[p][r]+' / '+ROLE[p][r];T_(s,x+(w-tw(s,.62))/2,y+29.5,ROLE[p][r]?'#ffff55':'#b0b0b0',.62)}
  if(HK[it.id||it.k]!==undefined&&it.tr!==1)T_(HK[it.id||it.k],x+3,y+2.5,'#ffff55',.68);
  if(it.tr===1&&!RS.done){ctx.globalAlpha=1;const lx=x+w-10,ly=y+3;ctx.strokeStyle='#e8c070';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(lx+3.5,ly+3.5,2.2,Math.PI,0);ctx.stroke();ctx.fillStyle='#e8c070';ctx.fillRect(lx,ly+3.5,7,5.5);ctx.fillStyle='#3a2a10';ctx.fillRect(lx+3,ly+5.3,1,2)}
  if(idleN)T_('!',x+w-6,y+2,'#ff6a6a',.8);
  if(cat){ctx.fillStyle='#d6b46a';ctx.beginPath();ctx.moveTo(x+w-2.5,y+2.5);ctx.lineTo(x+w-2.5,y+8.5);ctx.lineTo(x+w-8.5,y+2.5);ctx.closePath();ctx.fill()}},on,dis);
 if(it.k==='buy'){const hh=uiHits[uiHits.length-1];hh.price=true;hh.cost=it.id}}
function bar(x,y,w,f,c1,c2){f=Math.max(0,Math.min(1,f));rr(x,y,w,7,3.5);ctx.fillStyle='#150e09';ctx.fill();if(f>0){const ww=Math.max(5,(w-2)*f);rr(x+1,y+1,ww,5,2.5);const g=ctx.createLinearGradient(0,y,0,y+7);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fill()}rr(x,y,w,7,3.5);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.stroke()}
function viewPoly(){const w=cv.width,h=cv.height,P=[[0,h*.02],[w,h*.02],[w,h],[0,h]].map(([a,b])=>pickGround(a,b));return P.every(p=>p)?P.map(p=>[p.x,p.z]):null}
const mmss=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
/* ---- world drawing shared by minimap and big map ---- */
const MMC={c:null,g:null,t:-9};
function drawWorld(x,y,w,h,big){
 if(!big){const W2=Math.max(1,Math.round(w*UIS)),H2=Math.max(1,Math.round(h*UIS));if(!MMC.c||MMC.c.width!==W2||MMC.c.height!==H2){MMC.c=cvs(W2,H2);MMC.g=MMC.c.getContext('2d');MMC.t=-9}
  if(clockT-MMC.t>.2||clockT<MMC.t){MMC.t=clockT;const o=ctx;ctx=MMC.g;try{ctx.setTransform(W2/w,0,0,H2/h,0,0);dwBase(0,0,w,h,false)}finally{ctx=o}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(MMC.c,Math.round(x*UIS),Math.round(y*UIS));ctx.restore()}
 else dwBase(x,y,w,h,true);
 const sx=w/TW,sy=h/TH,VL=visLanes();ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(const a of ALERTS){const X=x+a.x/TS*sx,Y=y+a.y/TS*sy,r=(big?4:3)+((a.t*3)%1)*(big?8:5);ctx.strokeStyle='rgba(255,70,70,.95)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(X,Y,r,0,6.283);ctx.stroke()}
 const vp=viewPoly();if(vp){ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1;ctx.beginPath();vp.forEach((p,i)=>{const X=x+p[0]*sx,Y=y+p[1]*sy;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.closePath();ctx.stroke()}
 ctx.restore();
 const cs=big?13:9;for(const c0 of CASTLES())dIc(IC.home,x+c0.x/TS*sx-cs/2,y+c0.y/TS*sy-cs/2-1,cs);
 for(const u of units)if(u.cv&&u.hp>0)circ(ctx,x+u.x/TS*sx,y+u.y/TS*sy,big?3.4:2.4,u.cv.back?'#c9a060':'#ffd23c','#2a1a08',1);
 ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const p=R.pts[0],X=x+p[0]*sx,Y=y+p[1]*sy,r=big?6:4;circ(ctx,X,Y,r,nextL.includes(k)?'#c01f2f':'#6a1a22','#fff',1);if(big)dIc(IC.skull,X-5,Y-5.5,10);else{ctx.fillStyle='#fff';ctx.fillRect(X-1,Y-1,2,2)}})}
function dwBase(x,y,w,h,big){const sx=w/TW,sy=h/TH;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.imageSmoothingEnabled=false;ctx.drawImage(big?mc:mm2,x,y,w,h);ctx.drawImage(FOWC,x,y,w,h);
 const VL=visLanes();ROUTES.forEach((R,k)=>{if(!VL.has(k))return;const nx=nextL.includes(k),r0=Math.max(0,(LANE_REAR[k]|0)-2);ctx.beginPath();R.pts.forEach((p,i)=>{if(i<r0)return;i>r0?ctx.lineTo(x+p[0]*sx,y+p[1]*sy):ctx.moveTo(x+p[0]*sx,y+p[1]*sy)});ctx.lineJoin='round';
  ctx.strokeStyle='rgba(30,0,0,.7)';ctx.lineWidth=(big?4:2.8)*(nx?1.15:1);ctx.stroke();ctx.strokeStyle=nx?'#ff3b3b':'rgba(214,60,60,.72)';ctx.lineWidth=(big?2.2:1.4)*(nx?1.2:1);ctx.stroke()});
 for(const s of structs){ctx.fillStyle=s.type==='castle'?'#ffd23c':'#7fb2ff';const z=s.type==='castle'?(big?4:3):(big?2:1.4);ctx.fillRect(x+s.x/TS*sx-z/2,y+s.y/TS*sy-z/2,z,z)}
 ctx.lineWidth=big?1.4:1;for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const r=aiR(b)*sx,X=x+b.x/TS*sx,Y=y+b.y/TS*sy;ctx.beginPath();ctx.rect(X-r,Y-aiR(b)*sy,2*r,2*aiR(b)*sy);ctx.fillStyle=PAL[b.ci][1]+'26';ctx.fill();ctx.strokeStyle=PAL[b.ci][1]+'cc';ctx.stroke()}
 {ctx.save();ctx.beginPath();for(const k of OWN){const i=k&4095,j=k>>12,x0=x+i*2*sx,y0=y+j*2*sy,w2=2*sx,h2=2*sy;if(!OWN.has(k-1)){ctx.moveTo(x0,y0);ctx.lineTo(x0,y0+h2)}if(!OWN.has(k+1)){ctx.moveTo(x0+w2,y0);ctx.lineTo(x0+w2,y0+h2)}if(!OWN.has(k-4096)){ctx.moveTo(x0,y0);ctx.lineTo(x0+w2,y0)}if(!OWN.has(k+4096)){ctx.moveTo(x0,y0+h2);ctx.lineTo(x0+w2,y0+h2)}}ctx.strokeStyle=PAL[THEME.c][1];ctx.lineWidth=big?2:1.4;ctx.stroke();ctx.restore()}
{for(const c0 of CASTLES()){const X=x+c0.x/TS*sx,Y=y+c0.y/TS*sy;ctx.beginPath();ctx.rect(X-TR_CASTLE*sx,Y-TR_CASTLE*sy,2*TR_CASTLE*sx,2*TR_CASTLE*sy);ctx.fillStyle=PAL[THEME.c][1]+'2a';ctx.fill();ctx.strokeStyle=PAL[THEME.c][1];ctx.stroke()}for(const s of structs)if(s.t===0&&s.type==='tower'&&s.prog>=1){ctx.beginPath();ctx.rect(x+s.x/TS*sx-TR_TOWER*sx,y+s.y/TS*sy-TR_TOWER*sy,2*TR_TOWER*sx,2*TR_TOWER*sy);ctx.fillStyle=PAL[THEME.c][1]+'22';ctx.fill()}}
 for(const h of HORDES){if(h.act||!fowVisAt(h.x,h.y))continue;const z=(big?2.2:1.5)+Math.min(2,h.n/30);ctx.fillStyle='rgba(255,70,70,.85)';ctx.fillRect(x+h.x/TS*sx-z/2,y+h.y/TS*sy-z/2,z,z)}
 for(const b of BASES){if(!b.alive||!fowSeenAt(b.x,b.y))continue;const z=(big?4:2.6)+b.lvl*.35,col=PAL[b.ci][1];ctx.fillStyle='#000';ctx.fillRect(x+b.x/TS*sx-z/2-1,y+b.y/TS*sy-z/2-1,z+2,z+2);ctx.fillStyle=col;ctx.fillRect(x+b.x/TS*sx-z/2,y+b.y/TS*sy-z/2,z,z)}
 {const st=Math.max(1,Math.ceil(SW.n/2500)),z=big?1.6:1.1;ctx.fillStyle='#ff5bff';for(let i=0;i<SW.n;i+=st){const x0=SW.x[i],y0=SW.y[i];if(!fowVisAt(x0,y0))continue;ctx.fillRect(x+x0/TS*sx-z/2,y+y0/TS*sy-z/2,z,z)}}
 for(const u of units){if(u.t===2||u.shel||(u.t&&!fowVisAt(u.x,u.y)))continue;ctx.fillStyle=u.t?'#ff5bff':'#ffffff';const z=u.type==='brute'?3:big?1.8:1.2;ctx.fillRect(x+u.x/TS*sx-z/2,y+u.y/TS*sy-z/2,z,z)}
 ctx.restore()}
/* ---- overlays ---- */
function pill(x,y,w,h,label,pal,palH,fn,ic,sc,on,dis){uiBtn(x,y,w,h,pal,palH,fn,null,(X,Y,W2,H2)=>{const s=sc||1,tx=tw(label,s),iw=ic?h*.62+4:0;let cx=X+(W2-tx-iw)/2;if(ic){dIc(ic,cx,Y+(H2-h*.62)/2,h*.62);cx+=iw}T_(label,cx,Y+(H2-9*s)/2+.5*s,dis?'#8a7660':'#fff',s)},on,dis)}
function drawMapModal(UW,UH){ctx.fillStyle='rgba(5,8,16,.8)';ctx.fillRect(0,0,UW,UH);
 const aw=UW-20,ah=UH-68,mw=Math.min(aw,ah*TW/TH),mh=mw*TH/TW,pw=mw+16,ph=mh+50,px=(UW-pw)/2,py=(UH-ph)/2,mx=px+8,my=py+30;
 uiHits=[];uiRects=[U(0,0,UW,UH)];frame(px,py,pw,ph,PAN,6);
 dIc(IC.map,px+8,py+7,15);TTL('World map',px+26,py+8,1.22);
 let lx=px+pw-8-18-6;const leg=[['Your base',IC.home,null],['Spawn',IC.skull,null],['Next zombie route',null,'#ff3b3b']];
 for(const[t,ic,col]of leg.slice().reverse()){const w=tw(t,.85)+(ic?12:14);lx-=w+8;if(lx<px+40+twH('World map',1.22))break;if(ic)dIc(ic,lx,py+9,10);else{ctx.fillStyle=col;ctx.fillRect(lx,py+13,10,2.4)}T_(t,lx+13,py+10.5,'#ead8ba',.85)}
 uiBtn(px+pw-8-18,py+6,18,18,RDB,RDB,()=>{showMap=false},['Close [M]'],(x,y,w,h)=>dIc(IC.close,x+3,y+3,12));
 frame(mx-2,my-2,mw+4,mh+4,['#0b0f1a','#1a2236','#070a12'],4);
 drawWorld(mx,my,mw,mh,true);
 uiHits.push({...U(mx,my,mw,mh),fn:()=>{CAM.x=Math.max(2,Math.min(TW-2,(mouse.x-mx*UIS)/(mw*UIS)*TW));CAM.z=Math.max(2,Math.min(TH-2,(mouse.y-my*UIS)/(mh*UIS)*TH));showMap=false},tip:null});
 const pr=Math.round(genN/(NCX*NCY)*100);T_('Map #'+((SEED*1000)|0)+(pr<100?'   Generating '+pr+'%':'   '+TW+' x '+TH+' tiles')+'   Click to jump there',mx,my+mh+6,'#b59773',.85)}
/* ---- castle site picker ---- */
let picking=false,pickPos=null,pvC=null,pvKey=-1,pvH=null,pvW=null,pickMsg='';const PVS=3,PVW=Math.ceil(TW/PVS),PVH=Math.ceil(TH/PVS);
function buildPreview(){pvKey=SEED;pvC=cvs(PVW,PVH);const g=pvC.getContext('2d'),im=g.createImageData(PVW,PVH);pvH=new Uint8Array(PVW*PVH);pvW=new Uint8Array(PVW*PVH);
 for(let y=0;y<PVH;y++)for(let x=0;x<PVW;x++){const h=baseHW(Math.min(TW-1,x*PVS+1),Math.min(TH-1,y*PVS+1)),wt=_bwat,i=y*PVW+x;pvH[i]=h;pvW[i]=wt?1:0;let c;
  if(wt)c=[45,111,174];else if(h>=SNOW)c=[238,242,248];else if(h>=ROCKH)c=[138,143,153];else{const k=Math.max(0,Math.min(1,(h-LAND)/24));c=[(79+60*k)|0,(157-20*k)|0,(69+30*k)|0]}
  if(x>0&&y>0&&!wt){const d=(h-pvH[i-PVW-1])*5;c=c.map(v=>Math.max(0,Math.min(255,v+d)))}
  im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255}
 g.putImageData(im,0,0)}
let SITEM=null,SITEK=-1;
/* every preview cell where a castle may be founded (same rule as siteOK, computed at once with a summed-area table) */
function siteMaskGet(){if(SITEK===SEED&&SITEM)return SITEM;if(pvKey!==SEED||!pvW)buildPreview();const W=PVW,H=PVH,W1=W+1,B=new Int32Array(W1*(H+1));
 for(let j=0;j<H;j++){let row=0;for(let i=0;i<W;i++){const k=j*W+i;row+=(pvW[k]||pvH[k]>=ROCKH)?1:0;B[(j+1)*W1+i+1]=B[j*W1+i+1]+row}}
 const M=new Uint8Array(W*H);for(let cy=6;cy<H-6;cy++)for(let cx=6;cx<W-6;cx++){const tx=cx*PVS+1,ty=cy*PVS+1;if(tx<140||ty<110||tx>TW-140||ty>TH-110)continue;const x0=cx-2,x1=cx+3,y0=cy-2,y1=cy+3;if(B[y1*W1+x1]-B[y0*W1+x1]-B[y1*W1+x0]+B[y0*W1+x0]===0)M[cy*W+cx]=1}
 SITEK=SEED;return SITEM=M}
function siteOK(tx,ty){if(tx<140||ty<110||tx>TW-140||ty>TH-110)return false;const cx=(tx/PVS)|0,cy=(ty/PVS)|0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const x=cx+i,y=cy+j;if(x<0||y<0||x>=PVW||y>=PVH)return false;const k=y*PVW+x;if(pvW[k]||pvH[k]>=ROCKH)return false}return true}
function randomSite(){if(pvKey!==SEED)buildPreview();for(let a=0;a<2000;a++){const tx=140+((Math.random()*(TW-280))|0),ty=110+((Math.random()*(TH-220))|0);if(siteOK(tx,ty)){pickPos={tx,ty,ok:true};return}}}
function openPicker(){picking=true;PKL.on=true;pickPos=null;pickMsg='';if(pvKey!==SEED)buildPreview();randomSite();if(!PK)pkInit();pkFocus();PK.dist=400;if(pickPos)pkLiveFocus(pickPos.tx,pickPos.ty)}
function confirmPick(){if(!pickPos||!pickPos.ok)return;CX=pickPos.tx;CY=pickPos.ty;CROT=PKROT&3;picking=false;setupOpen=false;reset();inGame=false;startGame()}
function drawPicker(UW,UH){nameBox=null;if(pvKey!==SEED)buildPreview();uiHits=[];
 const pw=Math.min(UW-12,600),px=(UW-pw)/2,ph=50,py=UH-ph-6;uiRects=[U(px,5,pw,22),U(px,py,pw,ph)];
 const rw=pw>=420?112:0;
 frame(px,5,pw,22,PAN,6);dIc(IC.home,px+8,8,15);{const s='Choose where to found your kingdom';let sc=1.12;while(sc>.7&&twH(s,sc)>pw-(pw>=300?132:34)-rw)sc-=.04;TTL(s,px+26,16-TTS(sc)/2,sc)}
 if(pw>=300)pill(px+pw-96,7,90,18,PKL.on?'World map':'Castle view',BTN,BTNH,()=>{PKL.on=!PKL.on;if(PKL.on&&pickPos)pkLiveFocus(pickPos.tx,pickPos.ty);else if(PK)pkFocus()},IC.map,.8);
 if(rw)pill(px+pw-96-rw,7,rw-6,18,'Turn castle ['+KB.rotate.toUpperCase()+']',BTN,BTNH,pkRotate,IC.rotate||null,.8);
 frame(px,py,pw,ph,PAN,6);const by=py+7,bw=Math.min(92,(pw-24)/4);
 pill(px+8,by,bw,18,'Random spot',BTN,BTNH,()=>{randomSite();pkFocus();pickMsg=''},IC.dice,.85);
 if(!(MP.conn&&!MP.host))pill(px+8+bw+5,by,bw,18,'New map',BTN,BTNH,()=>{rollWorld();randomSite();pkFocus();pickMsg=''},IC.map,.85);
 pill(px+8+(bw+5)*2,by,bw,18,'Back',BTN,BTNH,()=>{picking=false;if(MP.conn)lobbyShow()},null,.85);
 if(pw>=560&&!(MP.conn&&!MP.host))pill(px+8+(bw+5)*3,by,bw,18,'Daily map',BTN,BTNH,()=>{dailyMap();randomSite();pkFocus();pickMsg=''},IC.map,.85);
 const sw=Math.max(44,Math.min(140,pw-16-(bw+5)*(pw>=560?4:3)));pill(px+pw-8-sw,by,sw,18,MP.conn?'Place my castle':'Found kingdom',GRN,GRNH,confirmPick,IC.play,.9,false,!(pickPos&&pickPos.ok));
 const hv=PKL.on?PKL.hit:PK&&PK.hit;T_(pickMsg||(hv?(hv.ok?'Good site - click to place your castle here':'Not suitable: needs dry, gentle land away from the edge'):'Map #'+((SEED*1000)|0)),px+8,py+31,pickMsg?'#ff9a9a':hv&&hv.ok?'#9ff0b0':'#b59773',.8);
 T_(PKL.on?'Click to place the castle  -  drag / WASD: move   Right drag: rotate   Wheel: zoom':'Left drag: move   Right drag: rotate   Wheel: zoom',px+8,py+40,'#b59773',.7)}
/* turn the castle a quarter turn while choosing its site (its door faces the new side) */
function pkRotate(){PKROT=(PKROT+1)&3;snd('click');pickMsg=''}
let nameBox=null;
const nmI=document.createElement('input');nmI.type='text';nmI.maxLength=18;nmI.spellcheck=false;nmI.autocomplete='off';nmI.setAttribute('aria-label','Kingdom name');
Object.assign(nmI.style,{position:'fixed',display:'none',zIndex:5,color:'#f2e4c4',background:'#0b0f17',border:'1px solid #c9a24f',borderRadius:'0',padding:'0 7px',outline:'none',boxSizing:'border-box',fontWeight:'400',fontFamily:FF});
document.body.appendChild(nmI);nmI.value=THEME.n;nmI.oninput=()=>{THEME.n=nmI.value.slice(0,18)||'Nameless';saveTheme()};nmI.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')nmI.blur()};
function placeInput(){if(!nameBox||started){nmI.style.display='none';return}const k=UIS/DPR,s=nmI.style;s.display='block';s.left=(nameBox.x*k)+'px';s.top=(nameBox.y*k)+'px';s.width=(nameBox.w*k)+'px';s.height=(nameBox.h*k)+'px';s.fontSize=(9.5*k)+'px';if(document.activeElement!==nmI&&nmI.value!==THEME.n)nmI.value=THEME.n}
let uiMul=1;try{uiMul=+localStorage.getItem('dk_ui')||1}catch(e){}
let TOPH=28,fromGame=false,setupOpen=false,settingsOpen=false,rebind=null,sliderDrag=null;
const KDEF={cry:'<',charge:'>',cannon:'/',peasant:'1',knight:'2',archer:'3',bannerman:'4',captain:'5',wall:'6',gate:'7',tower:'8',path:'9',ballista:'b',trebuchet:'t',raise:'y',dig:'u',army:'q',idle:'.',form:'v',rotate:'r',sound:'o',wave:'n',home:'h',map:'m',upgrade:'g',barracks:'c',farm:'j',peas:'e',storage:'k',house:'0',movec:',',academy:';',market:':',forester:'[',guild:']',torch:"'",rally:'-',rallyc:'=',ramp:'i',tier:'l',demolish:'p',pause:' ',speed:'f',up:'w',down:'s',left:'a',right:'d',rotL:'z',rotR:'x'};
const ACTL={cry:'King: war cry',charge:'King: royal charge',king:'Summon King Naraige',guard:'Train a royal guard',cannon:'Train cannon',movec:'Move castle',rotate:'Rotate building',peasant:'Train peasant',knight:'Train knight',archer:'Train archer',bannerman:'Train bannerman',captain:'Train captain',upgrade:'Masonry research',barracks:'Build barracks',farm:'Build farm',storage:'Build storage',house:'Build house',academy:'Build academy',market:'Build market',forester:'Build forester hut',guild:'Build builders guild',torch:'Build torch',rally:'Barracks rally point',rallyc:'Castle rally point',peas:'Select all peasants',tier:'Wood / stone tier',demolish:'Demolish building',ramp:'Dig a ramp',wall:'Build wall',gate:'Build gate',tower:'Build tower',path:'Build path',ballista:'Ballista',trebuchet:'Trebuchet',raise:'Raise ground',dig:'Dig ground',army:'Select army',idle:'Idle peasants',form:'Formation',rotate:'Rotate building',sound:'Mute sound',wave:'Call wave',home:'Back to base',map:'World map',pause:'Pause',speed:'Game speed',up:'Camera up',down:'Camera down',left:'Camera left',right:'Camera right',rotL:'Turn camera left',rotR:'Turn camera right'};
let KB={...KDEF};try{Object.assign(KB,JSON.parse(localStorage.getItem('dk_keys')||'{}'))}catch(e){}
const kdisp=k=>k===' '?'Space':k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1);
function syncHK(){for(const a of['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path','upgrade','barracks','farm','storage','house','academy','market','forester','guild','torch','rally','rallyc','movec','rotate','ramp','tier','demolish','ballista','trebuchet','raise','dig','army','idle','form'])HK[a]=kdisp(KB[a])}
function saveKB(){try{localStorage.setItem('dk_keys',JSON.stringify(KB))}catch(e){}syncHK()}syncHK();
function slider(x,y,w,val,set){const v=Math.max(0,Math.min(1,val));frame(x-4,y-1,w+8,13,BTNX,0);frame(Math.round(x-4+(w)*v),y-2,8,15,inR(mouse,U(x-5,y-2,w+10,15))?BTNH:BTN,0);
 uiHits.push({...U(x-5,y-2,w+10,15),fn:()=>{sliderDrag={x,w,set};set(Math.max(0,Math.min(1,(mouse.x/UIS-x)/w)))},tip:null})}
function setGfx(v){GQ=v?1:0;GQU.value=GQ;try{localStorage.setItem('dk_gfx',GQ)}catch(e){}DRS.lv=0;DRS.sum=DRS.cs=DRS.n=DRS.t=DRS.ok=DRS.chk=0;DRS.noDn=DRS.noUp=0;rs();if(SHADOWS){const ss=GQ?2048:1024;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}renderer.shadowMap.needsUpdate=true}}
let setTab=0;
function drawSettings(UW,UH,cx){const W=Math.min(UW-12,setTab?560:340),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=6,H=UH-12;frame(X,Y,W,H,PAN,6);TTL('Settings',X+10,Y+7,1.35);
 {const tw0=Math.min(62,(W-120)/2);[['General',0],['Controls',1]].forEach(([n,v],i)=>pill(X+W-10-(tw0+4)*(2-i)+4,Y+7,tw0,15,n,BTN,BTNH,()=>{setTab=v;rebind=null},null,.8,setTab===v))}
 let y=Y+28;
 if(setTab){T_('Click a key, then press the new one  (Esc cancels)',X+10,y+3,'#d9b27a',.75);pill(X+W-100,y,90,15,'Reset keys',BTN,BTNH,()=>{KB={...KDEF};saveKB()},null,.8);y+=21;
  const acts=Object.keys(KDEF),avail=Y+H-30-y;let cols=Math.max(1,Math.min(4,Math.floor((W-20)/130)));while(cols<4&&avail/Math.ceil(acts.length/cols)<12&&(W-20)/(cols+1)>=96)cols++;
  const rows=Math.ceil(acts.length/cols),cw=(W-20)/cols,rh=Math.min(16,avail/rows);
  acts.forEach((a,i)=>{const c=(i/rows)|0,r=i%rows,x=X+10+c*cw,yy=y+r*rh;const lb=ACTL[a];let sc=.72;while(sc>.5&&tw(lb,sc)>cw-48)sc-=.04;T_(lb,x,yy+Math.max(1,(rh-10)/2),'#ead8ba',sc);
   uiBtn(x+cw-44,yy,38,rh-2,rebind===a?GRN:BTN,rebind===a?GRNH:BTNH,()=>{rebind=a},null,(bx,by,bw,bh)=>TC(rebind===a?'...':kdisp(KB[a]),bx+bw/2,by+(bh-6)/2,'#fff',.7))})}
 else{T_('Music',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,vM,v=>{vM=v;applyVol();saveVol()});T_(Math.round(vM*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=17;
 T_('Sound effects',X+10,y+1,'#ead8ba',.85);slider(X+96,y,W-96-34,vS,v=>{vS=v;applyVol();saveVol()});T_(Math.round(vS*100)+'',X+W-28,y+1,'#d9b27a',.8);y+=19;
 const bw3=Math.min(100,(W-30)/2);pill(X+10,y,bw3,16,'Sound: '+(sndOn?'on':'off'),BTN,BTNH,toggleSound,null,.85);y+=20;
 
 T_('Language',X+10,y+3,'#ead8ba',.85);{const lw=Math.min(150,W-120);langBtn(X+W-10-lw,y-2,lw,20,LANG,()=>{langOpen=true;settingsOpen=false},false)}y+=24;
  T_('Graphics',X+10,y+3,'#ead8ba',.85);{const bw6=Math.min(70,(W-130)/2);[['Ultra HD',1],['Fast',0]].forEach(([n,v],i)=>pill(X+W-10-(bw6+4)*(2-i)+4,y,bw6,16,n,BTN,BTNH,()=>setGfx(v),null,.8,GQ===v))}y+=22;
 T_('Interface size',X+10,y+3,'#ead8ba',.85);{const bw4=Math.min(60,(W-130)/3);[['Small',.8],['Normal',1],['Large',1.25]].forEach(([n,v],i)=>pill(X+W-10-(bw4+4)*(3-i)+4,y,bw4,16,n,BTN,BTNH,()=>{uiMul=v;try{localStorage.setItem('dk_ui',v)}catch(e){}rs()},null,.8,Math.abs(uiMul-v)<.01))}y+=22;}
 pill(X+W/2-40,Y+H-22,80,16,'Back',BTN,BTNH,()=>{settingsOpen=false;rebind=null;setTab=0;if(fromGame){fromGame=false;startGame()}},null,.9)}
function menuCx(UW,pw){return UW/2}

function titleBack(UW,UH,cx,pw){const g=ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(6,10,22,.08)');g.addColorStop(.55,'rgba(6,10,22,.12)');g.addColorStop(1,'rgba(6,10,22,.6)');ctx.fillStyle=g;ctx.fillRect(0,0,UW,UH);
 {const rg=ctx.createRadialGradient(cx,UH*.4,20,cx,UH*.4,Math.max(UW,UH)*.55);rg.addColorStop(0,'rgba(8,6,16,.5)');rg.addColorStop(1,'rgba(8,6,16,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,UW,UH)}}
function drawTitle(UW,UH){nameBox=null;uiHits=[];uiRects=[U(0,0,UW,UH)];const pw=Math.min(300,UW-16),cx=menuCx(UW,pw),small=UH<330;if(!inGame&&TFADE>.003&&!window.__cam){ctx.fillStyle='rgba(4,3,8,'+(TFADE*.92).toFixed(3)+')';ctx.fillRect(0,0,UW,UH)}titleBack(UW,UH,cx,pw);
 if(settingsOpen){dirtBack(UW,UH);drawSettings(UW,UH,cx);return}
  if(saveOpen){dirtBack(UW,UH);drawSaves(UW,UH,cx);return}
  if(langOpen){dirtBack(UW,UH);drawLang(UW,UH,cx);return}
 if(setupOpen){dirtBack(UW,UH);drawSetup(UW,UH,cx,Math.min(UW-16,380),small);return}
 let y=Math.max(8,UH*(small?.05:.1));uiBtn(UW-30,6,24,20,BTN,BTNH,()=>{settingsOpen=true},['Settings'],(x,yy,w,h)=>dIc(IC.gear,x+5,yy+3,14));
 if(inGame){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,UW,UH);y=Math.max(12,UH*.16);TTL('Game Menu',cx,y,1.75,'center');y+=34}else{
 const gw=Math.min(UW*.8,440),cs=Math.max(4,Math.floor(gw/47)),lw=cs*47,lx=Math.round(cx-lw/2);mcLogo('NARANXIA',lx,Math.round(y),cs);y+=cs*5+cs*1.1;
 {const sp=L(MCSPL[Math.floor(clockT/7)%MCSPL.length]),a=.7+.3*Math.sin(clockT*2.3),S=Math.round(Math.max(9,Math.min(cs*1.75,15)));ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.font='600 '+S+'px '+FFT;
  const tw2=ctx.measureText(sp).width;ctx.fillStyle='rgba(4,3,8,.75)';ctx.fillText(sp,cx+1,y+1.5);ctx.shadowColor='rgba(60,190,255,'+(.85*a).toFixed(3)+')';ctx.shadowBlur=Math.max(4,cs*1.5);ctx.fillStyle='#c8f3ff';ctx.fillText(sp,cx,y);ctx.shadowBlur=0;ctx.shadowColor='transparent';
  const ly=Math.round(y+S*.55),lg=Math.min(60,cs*7);for(const sd of[-1,1]){const x0=cx+sd*(tw2/2+8),gr=ctx.createLinearGradient(x0,0,x0+sd*lg,0);gr.addColorStop(0,'rgba(214,176,96,.9)');gr.addColorStop(1,'rgba(214,176,96,0)');ctx.fillStyle=gr;ctx.fillRect(Math.min(x0,x0+sd*lg),ly,lg,1);arcDia(x0,ly+.5,2,'#d8b060')}
  ctx.restore();y+=S+Math.round(small?6:cs*1.3)}
 }const bw=Math.min(UW-24,Math.max(200,Math.min(300,UW*.5))),bh=small?22:26,gp=small?5:9,bx=Math.round(cx-bw/2);
 const mb=(lab,fn)=>{pill(bx,y,bw,bh,lab,BTN,BTNH,fn,null,1.15);y+=bh+gp};
 mb(inGame?'Back to Game':'Singleplayer',inGame?startGame:()=>{setupOpen=true});if(inGame&&!MP.on)mb('Save / Load',()=>{saveOpen=true;svList=null});else if(!inGame)mb('Load game',()=>{saveOpen=true;svList=null});if(inGame)mb('New game',newGame);if(inGame)mb('Quit game',quitGame);if(inGame&&!MP.on)mb('Tutorial',()=>{tutStart(true);startGame()});if(inGame)mb('Report a bug [F8]',bugReport);mb('Multiplayer (Co-op)',mpOpen);if(!inGame&&window.NARX&&NARX.desktop)mb('Exit to desktop',()=>window.close());
 {const hw=Math.round((bw-gp)/2);pill(bx,y,hw,bh,'Options',BTN,BTNH,()=>{settingsOpen=true},null,1.15);pill(bx+hw+gp,y,bw-hw-gp,bh,sndOn?'Sound: on':'Sound: off',BTN,BTNH,()=>{toggleSound()},null,1.15);y+=bh+gp}
 if(best.w>0){TC('Best: wave '+best.w+'  -  '+best.k+' zombies slain',cx,y+2,'#ffff55',.9);y+=16}
 const ms=AC&&AC.state==='running'&&sndOn?'':(sndOn?'Press any key or click for the music':'Sound is off');TC(ms,cx,UH-14,'#c8c8c8',.8);T_(GVER,UW-24,UH-12,'#c8c8c8',.75);T_('Naranxia',6,UH-12,'#c8c8c8',.75);{const lw=Math.max(96,tw(LANGS[LANG][0],1)+40);langBtn(6,UH-42,lw,22,LANG,()=>{langOpen=true},false)}}
const MCSPL=['Survive the night!','Also try Co-op!','Hold the line!','100% blocky!','Mind the swarm!','Build towers!','Zombies hate walls!','Protect the castle!','Now with keeps!','Gold! Wood! Stone!','100x the swarm!','Ten thousand zombies!','Red eyes in the dark!'];

function mcLogo(txt,x0,y0,cs){const lw=cs*47,hh=cs*5;ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='center';
 let S=100;ctx.font='700 '+S+'px '+FFT;const w100=ctx.measureText(txt).width||1;S=Math.min(lw/w100*100,hh/.72);ctx.font='700 '+Math.round(S)+'px '+FFT;
 const cx=x0+lw/2,by=y0+hh;ctx.lineJoin='round';
 ctx.shadowColor='rgba(80,190,255,.6)';ctx.shadowBlur=cs*2.2;ctx.fillStyle='#0b0810';ctx.fillText(txt,cx,by);ctx.shadowBlur=0;ctx.shadowColor='transparent';
 ctx.lineWidth=Math.max(2,cs*.7);ctx.strokeStyle='#0b0810';ctx.strokeText(txt,cx,by+cs*.35);ctx.strokeText(txt,cx,by);
 const g=ctx.createLinearGradient(0,by-S*.72,0,by);g.addColorStop(0,'#fff3c8');g.addColorStop(.45,'#f1c55a');g.addColorStop(.55,'#d79a32');g.addColorStop(1,'#8a5a18');ctx.fillStyle=g;ctx.fillText(txt,cx,by);
 ctx.lineWidth=Math.max(1,cs*.18);ctx.strokeStyle='rgba(255,246,214,.55)';ctx.strokeText(txt,cx,by-cs*.1);
 {const sw=((clockT*.16)%1.7)-.3;if(sw>-.25&&sw<1.25){const bx=x0+sw*lw,w2=cs*2.2;ctx.save();ctx.beginPath();ctx.moveTo(bx-w2+cs*3,y0-cs);ctx.lineTo(bx+w2+cs*3,y0-cs);ctx.lineTo(bx+w2-cs*3,by+cs);ctx.lineTo(bx-w2-cs*3,by+cs);ctx.closePath();ctx.clip();ctx.globalAlpha=.6;ctx.fillStyle='#fffbea';ctx.fillText(txt,cx,by);ctx.restore()}}
 ctx.restore()}
function drawSetup(UW,UH,cx,pw,small){let y=Math.max(6,UH*(small?.03:.06));TTL('New kingdom',cx,y,1.65,'center');y+=22;
 const eh=small?86:138;frame(cx-pw/2,y,pw,eh,PAN,6);const bnx=cx-pw/2+10,bnh=eh-14,bnw=bnh*2/3;ctx.imageSmoothingEnabled=true;ctx.drawImage(BANNER,bnx,y+7,bnw,bnh);
 const ex=bnx+bnw+10,ew=cx+pw/2-10-ex;T_('Your kingdom',ex,y+5,'#c4a37a',.8);
 const fy=y+15;nameBox={x:ex,y:fy,w:ew-24,h:15};uiBtn(ex+ew-22,fy,22,15,BTN,BTNH,()=>{THEME.n=KNAMES[(Math.random()*KNAMES.length)|0];nmI.value=THEME.n;saveTheme()},['Random name'],(x,yy,w)=>dIc(IC.dice,x+4,yy+1.5,12));
 const LW=small?0:58,rx=ex+LW,rw=ew-LW,row=(lab,n,yy,sz,draw,sel,pick,tip)=>{if(LW)T_(lab,ex,yy+(sz-9*.72)/2,'#c4a37a',.72);const per=Math.max(1,Math.floor((rw+2.5)/(sz+2.5)));for(let i=0;i<n;i++){const sx2=rx+(i%per)*(sz+2.5),sy=yy+((i/per)|0)*(sz+3);draw(sx2,sy,sz,i);if(i===sel)gold(sx2-1,sy-1,sz+2,sz+2,4);uiHits.push({...U(sx2,sy,sz,sz),fn:()=>{pick(i);saveTheme();retheme()},tip:tip(i)})}return Math.ceil(n/per)*(sz+3)};
 const sq=(x,yy,sz,col)=>{rr(x,yy,sz,sz,3);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.stroke()};
 let ry=fy+20;const sw=Math.max(8,Math.min(15,(rw+2.5)/PAL.length-2.5));
 ry+=row('Colour',PAL.length,ry,sw,(x,yy,sz,i)=>gemSwatch(x,yy,sz,PAL[i][1]),THEME.c,i=>{THEME.c=i},i=>[PAL[i][0]+' colours']);
 if(!small)ry+=row('2nd colour',PAL.length,ry,sw,(x,yy,sz,i)=>{gemSwatch(x,yy,sz,PAL[i][1]);ctx.save();ctx.beginPath();ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);ctx.clip();ctx.fillStyle=PAL[THEME.c][1];ctx.fillRect(x,yy,sz/2,sz);ctx.restore();ctx.beginPath();ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);ctx.lineWidth=.9;ctx.strokeStyle='#c99a3a';ctx.stroke()},THEME.c2,i=>{THEME.c2=i},i=>['Pattern colour: '+PAL[i][0]]);
 if(!small)ry+=row('Pattern',8,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>{ctx.translate(X,Y);bannerPattern(ctx,W,H,i,PAL[THEME.c2][1])}),THEME.p|0,i=>{THEME.p=i},i=>[['Plain','Per pale','Chevron','Bend','Quarterly','Fess','Bordure','Saltire'][i]]);
 ry+=row('Emblem',EMB.length,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>drawEmblemR(X+W*.14,Y+H*.1,W*.72,i)),THEME.e,i=>{THEME.e=i},()=>['Emblem']);
 y+=eh+10;
 {const s='Long calm between waves, then a slow swarm. It grows stronger each wave.';let sc=.85;while(sc>.64&&tw(s,sc)>UW-14)sc-=.03;if(tw(s,sc)<=UW-14){TC(s,cx,y+3,'#c4a37a',sc);y+=22}else{const q=s.split('. ');TC(q[0]+'.',cx,y,'#c4a37a',.8);TC(q[1],cx,y+11,'#c4a37a',.8);y+=26}}
 const by=Math.min(UH-30,y+4);pill(cx-pw/2+14,by,(pw-28)*.34,22,'Back',BTN,BTNH,()=>{setupOpen=false},null,.95);pill(cx-pw/2+14+(pw-28)*.36,by,(pw-28)*.64,22,'Choose site',GRN,GRNH,()=>{openPicker()},IC.map,1)}
function drawEnd(UW,UH){const g=ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(80,0,0,.45)');g.addColorStop(1,'rgba(170,16,16,.68)');ctx.fillStyle=g;ctx.fillRect(0,0,UW,UH);uiHits=[];uiRects=[U(0,0,UW,UH)];const cx=UW/2,cy=UH/2,pw=Math.min(220,UW-16);
 let ts=3;while(ts>1.3&&twH('Your kingdom fell!',ts)>UW-16)ts-=.2;TTL('Your kingdom fell!',cx,cy-78,ts,'center');TC(THEME.n+' has fallen to the horde',cx,cy-78+9*ts+8,'#e0e0e0',1);
 {const a='Score: ',b=String(waveN*100+kills),w=tw(a,1.1)+tw(b,1.1);T_(a,cx-w/2,cy-22,'#ffffff',1.1);T_(b,cx-w/2+tw(a,1.1),cy-22,'#ffff55',1.1)}
 TC('Waves survived: '+waveN+'    Zombies slain: '+kills+'    Best: wave '+best.w,cx,cy-6,'#e0e0e0',.85);
 {const G=GST,y1=cy+9;TC('Earned: '+Math.round(G.g)+' gold    '+Math.round(G.w)+' wood    '+Math.round(G.s)+' stone    '+Math.round(G.f)+' food',cx,y1,'#f0dca8',.8);
  const bu=gstBest(),nm=bu?(bu[0]==='other'?'Towers and cannons':L(NAMES[bu[0]]||bu[0])):'-',a1='Best unit: ',c1=bu?'('+bu[1]+' kills)':'',w1=tw(a1,.8)+tw(nm,.8)+(c1?tw(c1,.8)+6:0)+4;let xx=cx-w1/2;
  T_(a1,xx,y1+13,'#c4a37a',.8);xx+=tw(a1,.8);T_(nm,xx,y1+13,'#ffffff',.8);xx+=tw(nm,.8)+4;if(c1)T_(c1,xx,y1+13,'#ffff55',.8);
  TC('Units lost: '+G.lost,cx,y1+26,'#c4a37a',.8)}
 if(SBR){const y2=cy+48;TC((SBR.daily?'Daily map':'This map')+' - '+(SBR.rank===0?'NEW RECORD!':'Best runs'),cx,y2,SBR.rank===0?'#ffff55':'#f0dca8',.8);
  SBR.top.forEach((r,i)=>TC('#'+(i+1)+'   Wave '+r.w+'   '+r.k+' kills',cx,y2+12+i*11,i===SBR.rank?'#ffffff':'#c4a37a',.72))}
 pill(cx-pw/2,cy+100,pw,22,'Play again',BTN,BTNH,newGame,null,1.1);pill(cx-pw/2,cy+128,pw,22,'Title Screen',BTN,BTNH,()=>{inGame=false;over=false;started=false;rollWorld()},null,1.1)}
function drawToasts(UW){for(let i=0;i<TOASTS.length;i++){const o=TOASTS[i];o.t+=UIDT;const T=o.t,sl=T<.35?1-T/.35:T>4.6?(T-4.6)/.35:0;if(T>4.95){TOASTS.splice(i,1);i--;continue}const d=ACHD[o.k],w=Math.max(150,Math.max(tw(d[0],.9),twH('Achievement',.95))+40),h=30,x=UW-w-4+sl*(w+8),y=TOPH+4+i*(h+4);
  frame(x,y,w,h,PAN,4);
  const ic=IC[o.k==='w1'||o.k==='w5'||o.k==='w10'?'shield':o.k==='k1'||o.k==='k100'||o.k==='k500'?'sword':o.k==='res'?'upgrade':o.k==='move'?'home':o.k==='keep'?'tower':o.k]||IC.sword;if(ic)dIc(ic,x+6,y+7,16);
  TTL('Achievement',x+28,y+4,.95);T_(d[0],x+28,y+17,'#ffffff',.85)}}
/* ---- main HUD ---- */
function drawUI(){ctx.setTransform(UIS,0,0,UIS,0,0);ctx.imageSmoothingEnabled=true;uiHits=[];uiRects=[];
 const UW=Math.floor(cv.width/UIS),UH=Math.floor(cv.height/UIS);
 if(!started){if(picking)drawPicker(UW,UH);else drawTitle(UW,UH);ctx.setTransform(1,0,0,1,0,0);return}
 frame(-3,-3,UW+6,27,CHAT,0);uiRects.push(U(0,0,UW,24));
 /* right cluster: menu / pause / speed */
 let rx=UW-5;const tb=(w,ic,fn,tip,on)=>{rx-=w;uiBtn(rx,3,w,17,BTN,BTNH,fn,tip,(x,y,W2,H2)=>dIc(ic,x+(W2-12)/2,y+2.5,12),on);rx-=3};
 tb(18,IC.menu,openMenu,['Main menu [Esc]']);tb(18,IC.army,()=>{troopsOpen=!troopsOpen;snd('click')},['Troops [F2]','Every unit and what it is doing'],troopsOpen);tb(18,IC.gear,()=>{openMenu();settingsOpen=true;fromGame=true},['Settings']);tb(18,paused?IC.play:IC.pause,()=>{setPause(!paused)},['Pause [Space]'],paused);tb(18,sndOn?IC.sound:IC.mute,toggleSound,['Sound on/off [O]']);
 rx-=21;uiBtn(rx,3,21,17,BTN,BTNH,()=>{if(!MP.on)spd=spd%3+1},['Game speed [F]'],(x,y,W2)=>TC('x'+spd,x+W2/2,y+4,spd>1?'#ffd23c':'#fff',.95),spd>1);rx-=6;
 const wp=[['Wave '+waveN,'#d9b8ff'],[waveOn?(nightLv>=.5?'Night':(hordeD<5000?'Horde '+Math.round(hordeD)+' tiles':'Horde')):'Next '+mmss(waveT),waveOn?(nightLv>=.5?'#9fb4ff':'#ffb38a'):waveT<10&&((clockT*3)|0)%2?'#ff8a8a':'#ffffff'],[nextL.map(L=>ROUTES[L].dir).join(' '),'#ff7a7a'],[wxLabel(),SEASC[seasonIdx()]]];
 let wwid=0;wp.forEach(p=>wwid+=tw(p[0],.95)+10);if(UW<560||rx-wwid>UW*.42){let x=UW<560?6:rx-wwid;wp.forEach(p=>{T_(p[0],x,7,p[1],.95);x+=tw(p[0],.95)+10});if(UW>=560)rx-=wwid+4;uiHits.push({...U(UW<560?6:rx,3,wwid,17),tip:['Next wave','Zombies come along the red lines']})}
 let x=6;{const nmw=Math.min(90,tw(THEME.n,.9)+4);if(UW>=560){ctx.drawImage(BANNER,x,2,13,19.5);T_(THEME.n,x+17,7,'#fff',.9);uiHits.push({...U(x,2,17+nmw,20),tip:['Your kingdom','Banner on your castle, towers and gates']});x+=21+nmw}}
 const two=UW<560;TOPH=two?46:28;let ry=3;if(two){frame(3,22,UW-6,19,CHAT,6);x=9;rx=UW-6;ry=23}
 const item=(ic,s,col,tip)=>{const n=16+tw(s)+10;if(x+n>rx-4)return;dIc(ic,x,ry+2,13);T_(s,x+16,ry+3.5,col);uiHits.push({...U(x,ry,n-4,17),tip});x+=n};
 item(IC.coin,res.g,'#ffd23c',['Gold']);item(IC.wood,res.w,'#e8b27a',['Wood']);item(IC.stone,res.s,'#d4dae6',['Stone']);item(IC.food,Math.floor(res.f||0),'#f2c14e',['Food','Farms make it while a peasant works them','Every unit costs food to train']);
 {const hf=Math.max(0,CS.hp+(CS2?CS2.hp:0))/(CS.max+(CS2?CS2.max:0));if(x+86<rx-4){hearts(x,ry+4.5,hf,10);uiHits.push({...U(x,ry,80,17),tip:['Castle health','Do not let it fall']});x+=86}else if(x+60<rx-4){dIc(IC.heart,x,ry+2,13);bar(x+16,ry+4.5,38,hf,'#ff6a6a','#c01f2f');uiHits.push({...U(x,ry,56,17),tip:['Castle health','Do not let it fall']});x+=62}}
 {const pu=popUsed(LPL()),pc=popCap(LPL());item(IC.bed,pu+'/'+pc,pu>=pc?'#ff8a7a':'#f2e2c0',['Population','Houses raise the limit (+6 each)','and every new unit costs food'])}item(IC.skull,units.filter(u=>u.t===1).length+SW.n,'#c4ee98',['Zombies alive']);item(IC.sword,kills,'#fbf0dc',['Zombies slain']);
 /* build menu */
 const L=menuItems(),narrow=UW<340,mw=narrow?100:150,mh=Math.round(mw*TH/TW),availW=narrow?UW-8:UW-mw-30,f0=flow(L,0,0,availW-8),ph=f0.h+10,py=UH-ph-6,pw=f0.w+10,px=narrow?4:Math.max(4,((UW-mw-18-pw)>>1));
 flow(L,px+5,py+5,availW-8);frame(px,py,pw,ph,INV,6);uiRects.push(U(px,py,pw,ph));for(const it of L)if(it.gap===undefined)drawItem(it);
 const S2=sel();let sy=py-4;const QB=queue.filter(q=>q.b===curB());if(QB.length)sy-=22;if(narrow){const yb0=py-mh-9-3-19-19;sy=Math.min(sy,yb0-3)}
 if(S2.length&&!over){const cnt={};S2.forEach(u=>cnt[u.type]=(cnt[u.type]||0)+1);const txt=Object.entries(cnt).map(([k,v])=>v+' '+L(v>1?(PLUN[k]||NAMES[k]):NAMES[k])).join(', '),hint=S2.some(u=>u.type==='archer')?'Right-click a wall, gate or tower to garrison':S2.some(u=>u.type==='peasant')?'Right-click a resource to harvest, a building to repair':S2.some(u=>u.type==='captain')?'[G] group nearby soldiers behind the captain':'Right-click to move or attack',w=Math.max(tw(txt,.9),tw(hint,.78))+14;frame(px,sy-26,w,26,CHAT,5);T_(txt,px+7,sy-22,'#ffff55',.9);T_(hint,px+7,sy-11,'#e0e0e0',.78);uiRects.push(U(px,sy-26,w,26))}
 if(QB.length)QB.forEach((q,i)=>{const bx=px+i*20,by=py-23;frame(bx,by,18,18,SLOT,4);dIc(IC[q.type],bx+2,by+1.5,14);ctx.fillStyle='#000';ctx.fillRect(bx+2,by+14,14,3);if(i===0){ctx.fillStyle='#55ff55';ctx.fillRect(bx+2,by+14,Math.max(1,Math.round(14*(1-q.left/q.tot))),2)}});
 /* minimap = world map */
 const mx2=UW-mw-9,my2=narrow?py-mh-9:UH-mh-9;
 frame(mx2-4,my2-4,mw+8,mh+8,MAPF,5);drawWorld(mx2,my2,mw,mh,false);mmRect=U(mx2,my2,mw,mh);uiRects.push(U(mx2-3,my2-3,mw+6,mh+6));
 const bw2=(mw+6-3)/2,ya=my2-3-19;
 uiBtn(mx2-3,ya,bw2,17,GRN,GRNH,home,['Back to base [H]','Centers the camera on your castle'],(x,y,w)=>{dIc(IC.compass,x+4,y+2.5,12);T_('Base',x+19,y+4,'#fff',.95)});
 uiBtn(mx2-3+bw2+3,ya,bw2,17,BTN,BTNH,()=>{showMap=true},['World map [M]','See the whole world, spawns and routes'],(x,y,w)=>{dIc(IC.map,x+4,y+2.5,12);T_('Map',x+19,y+4,'#fff',.95)});
 const qw=(mw+6-9)/4,yb=ya-19;[[IC.zoomIn,()=>camZoom(-1),'Zoom in'],[IC.zoomOut,()=>camZoom(1),'Zoom out'],[IC.rotL,()=>{CAM.yaw+=.4},'Rotate left [Z]'],[IC.rotR,()=>{CAM.yaw-=.4},'Rotate right [X]']].forEach(([ic,fn,t],i)=>uiBtn(mx2-3+i*(qw+3),yb,qw,17,BTN,BTNH,fn,[t],(x,y,w)=>dIc(ic,x+(w-12)/2,y+2.5,12)));
 if(troopsOpen)drawTroops(UW,UH);if(convoyOpen)drawConvoy(UW,UH);if(devOpen)drawDev(UW,UH);
 /* banners & hints */
 let bossY=0;if(WAVEZ>0&&!over){let rem=SW.n+swPending();for(const u of units)if(u.t===1&&u.lane>=0)rem++;if(rem>0){const bw=Math.min(182,UW-40),bx=Math.round((UW-bw)/2),by=TOPH+13;TC('Raid - Wave '+waveN+'  ('+rem+' left)',UW/2,TOPH+2,'#ffffff',.85);ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,7);ctx.fillStyle='#4a0e0e';ctx.fillRect(bx,by,bw,5);const fw=Math.max(1,Math.round(bw*Math.min(1,rem/WAVEZ)));ctx.fillStyle='#d81e1e';ctx.fillRect(bx,by,fw,5);ctx.fillStyle='#ff6a6a';ctx.fillRect(bx,by,fw,1);ctx.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<10;k++)ctx.fillRect(bx+Math.round(bw*k/10),by,1,5);bossY=22}else WAVEZ=0;if(!over)bossY+=bossBar(UW,TOPH+bossY);bossY+=objBar(UW,TOPH+bossY);bossY+=kingBar(UW,TOPH+bossY);bossY+=tutBar(UW,TOPH+bossY)}
 if(!over){let msg=mode?'Place '+NAMES[mode]+(mode==='gate'?' - 3 tiles: two towers and a passage, [R] rotates':mode==='movec'?' - click the new centre of your castle':mode==='ballista'||mode==='trebuchet'?' on a tower - [R] sets facing':mode==='raise'||mode==='dig'?' - paint tiles':mode==='ramp'?' - one block that climbs 1 level, [R] turns it':mode==='demolish'?' - click a building':mode==='upgrade'?' - click or drag over wood buildings':'')+' - click a tile - right-click or Esc cancels':msgT>0?msgS:time<30?'Select peasants, then right-click a tree, rock or gold to harvest':'';
  if(msgT>0&&msgS&&msgS!==MSGL[MSGL.length-1]){MSGL.push(msgS);if(MSGL.length>25)MSGL.shift()}
  if(msg&&bannerT<=0){ctx.globalAlpha=mode||msgT>0?1:Math.min(1,(18-time)/3);let ms=.95;while(ms>.55&&tw(msg,ms)+16>UW-6)ms-=.05;const w=tw(msg,ms)+16;frame((UW-w)/2,TOPH+bossY,w,16,CHAT,8);TC(msg,UW/2,TOPH+bossY+4,'#ffffff',ms);ctx.globalAlpha=1}
  if(bannerT>0){ctx.globalAlpha=Math.min(1,bannerT*1.2);let bs=3.4;while(bs>1.6&&tw(bannerS,bs)>UW-20)bs-=.2;let b2=1.15;while(b2>.6&&tw(bannerS2,b2)>UW-20)b2-=.05;const yb=Math.max(TOPH+8,UH*.2);TC(bannerS,UW/2,yb,'#ff5555',bs);TC(bannerS2,UW/2,yb+9*bs+6,'#ffff55',b2);ctx.globalAlpha=1}
  if(paused){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,UW,UH);TC('Game Paused',UW/2,UH*.36,'#ffffff',2.2);TC(autoPaused?'Click anywhere or press Space to resume':'Press Space to resume',UW/2,UH*.36+28,'#a0a0a0',.95)}}
 const hv=uiHits.find(h=>h.tip&&inR(mouse,h));
 if(hv&&!over&&!showMap){const ln=hv.tip,cpp=hv.cost?costParts(hv.cost):null,cw0=cpp?cpp.reduce((q,p)=>q+tw(p[0],.9)+12,0):0,w=Math.max(cw0,...ln.map(s=>tw(s,.9)))+14,h=ln.length*11+8;let tx=Math.min(UW-w-2,Math.max(2,Math.round(hv.x/UIS))),ty=Math.round(hv.y/UIS)-h-4;if(ty<26)ty=Math.round((hv.y+hv.h)/UIS)+4;
  frame(tx,ty,w,h,TIPP,5);ln.forEach((s,i)=>{if(cpp&&i===ln.length-1){drawCost(cpp,tx+7,ty+5+i*11,w-14,.9,9)}else T_(s,tx+7,ty+5+i*11,i?'#aaaaaa':'#ffffff',.9)})}
 drawToasts(UW);
 if(showMap)drawMapModal(UW,UH);
 if(over)drawEnd(UW,UH);
 ctx.setTransform(1,0,0,1,0,0)}
