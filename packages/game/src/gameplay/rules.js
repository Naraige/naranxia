export const rulesState = {
  GST: {k:{},g:0,w:0,s:0,f:0,lost:0},
};

export const TW=2250,TH=1250,TS=40,W=TW*TS,H=TH*TS,N=TW*TH;

export const T={cannon:{r:9,hp:180,spd:62,dmg:45,rng:520,cdt:5.5,col:'#4a4a50'},peasant:{r:5,hp:30,spd:120,col:'#d9a65a'},knight:{r:10,hp:130,spd:110,dmg:16,rng:14,cdt:.8,col:'#4a7bd8'},archer:{r:6,hp:45,spd:100,dmg:9,rng:120,cdt:1,col:'#4caf50'},zombie:{r:6,hp:55,spd:150,dmg:7,rng:10,cdt:1.1,col:'#7fae5a'},bannerman:{r:6,hp:85,spd:104,dmg:5,rng:12,cdt:1.2,col:'#e8c040'},captain:{r:9,hp:230,spd:108,dmg:22,rng:15,cdt:.85,col:'#f0b830'},runner:{r:5,hp:34,spd:215,dmg:5,rng:10,cdt:.8,col:'#c8785a'},husk:{r:4,hp:24,spd:158,dmg:3,rng:9,cdt:1,col:'#9ab87a'},brute:{r:11,hp:430,spd:112,dmg:26,rng:15,cdt:1.5,col:'#5f8a4a'},king:{r:11,hp:950,spd:100,dmg:44,rng:17,cdt:.9,col:'#3f6fd0'},guard:{r:9,hp:340,spd:100,dmg:26,rng:28,cdt:1.1,col:'#3f6fd0'}};

export const C={cannon:{g:200,w:80,s:60,f:40},peasant:{g:60,f:25},knight:{g:150,s:30,f:40},archer:{g:120,w:30,f:30},bannerman:{g:110,w:40,f:35},captain:{g:220,s:60,f:60},king:{g:450,s:120,f:90},guard:{g:120,s:20,f:30},wall:{w:12},gate:{w:25},tower:{w:50},barracks:{w:100},upgrade:{s:200,w:100},ballista:{w:100,s:80},trebuchet:{w:160,s:220},raise:{},dig:{},ramp:{},demolish:{},tier:{},path:{w:3},};

export const TRAIN={cannon:30,peasant:9,knight:22,archer:16,bannerman:20,captain:32,king:40,guard:18},BT={barracks:40,wall:8,gate:14,tower:34,ballista:24,trebuchet:46},SZ={trebuchet:2},GCAP={wall:1,gate:2,tower:3},GRNG={wall:1.6,gate:1.6,tower:2.3},GTOP={wall:1.8,gate:2.1,tower:3.28};

export const CWOOD={wall:{w:12},gate:{w:25},tower:{w:50},barracks:{w:100},path:{w:3}},CSTONE={wall:{s:30},gate:{w:30,s:40},tower:{w:80,s:120},barracks:{w:70,s:90},path:{s:2}},RS={done:false,on:false,t:0},RT_TIME=45,UPC={barracks:{s:70},wall:{s:30},gate:{s:70},tower:{s:140,w:20},castle:{s:300,w:100},house:{s:40},farm:{s:20},storage:{s:40},academy:{s:80},market:{s:60},forester:{s:30},guild:{s:60}},SH={wall:400,tower:520,gate:360,barracks:700,castle:3000,ballista:260,trebuchet:420},GET={g:10,w:8,s:7},CODE={g:4,w:2,s:3},WORK=4.5;

export const RS2={on:null,t:0,done:{iron:false,plate:false,drill:false,steel:false,mail:false,tools:false,harvest:false,fletch:false,fire:false,bastion:false,oil:false,era:false}},RT2={iron:40,plate:50,drill:35,steel:60,mail:70,tools:30,harvest:40,fletch:45,fire:50,bastion:60,oil:55,era:70},RN2={iron:'Iron weapons',plate:'Plate armor',drill:'Drill training',steel:'Steel weapons',mail:'Chain mail',tools:'Better tools',harvest:'Crop rotation',fletch:'Fletching',fire:'Fire arrows',bastion:'Bastion walls',oil:'Boiling oil',era:'Iron age'},RPRE={steel:'iron',mail:'plate',fire:'fletch',bastion:'masonry',oil:'bastion',era:'steel'};
export const ROTT=new Set(['barracks','farm','storage','house','academy','market','forester','guild','observatory','granary','bell','sanctuary','beacon','orchard','forge','embassy','warroom','sappers','tower','keep','castle']),DIR4=[[0,1],[1,0],[0,-1],[-1,0]];

export const FOOD0=150,FARMT=6,FARMY=6,POPBASE=18,POPHOUSE=6,POPMAX=120,RALLY=[null,null],RALLYC=[null,null],RANKN=['','Veteran','Elite','Champion'];
export const LH=new WeakMap();

export function initializeRules() {
  /* cinematic state (declared early: reset() touches it) */

  Object.assign(T,{bomber:{r:7,hp:90,spd:120,dmg:4,rng:10,cdt:1.2,col:'#a08a3a'},acid:{r:6,hp:60,spd:135,dmg:6,rng:115,cdt:2.4,col:'#9ac23a'},miner:{r:6,hp:120,spd:140,dmg:10,rng:10,cdt:1.1,col:'#8a6a4a'}});


  Object.assign(C,{storage:{w:40},ramp:{},farm:{w:60},iron:{g:200,s:60},plate:{g:260,s:120},drill:{g:180,w:80}});
  Object.assign(CWOOD,{farm:{w:60},storage:{w:40}});
  Object.assign(CSTONE,{farm:{w:50,s:20},storage:{w:30,s:15}});
  Object.assign(BT,{farm:26,storage:20});
  Object.assign(SH,{farm:260,storage:300});

  Object.assign(C,{steel:{g:320,s:120},mail:{g:380,s:160},tools:{g:100,w:120},harvest:{g:150,w:100},fletch:{g:200,w:120},fire:{g:260,w:160},bastion:{g:300,s:200},oil:{g:320,s:180},era:{g:450,s:250,w:150},spike:{g:10,w:15},house:{w:50},rally:{},rallyc:{},repair:{},academy:{g:80,w:120}});
  Object.assign(CWOOD,{house:{w:50},academy:{g:80,w:120}});
  Object.assign(CSTONE,{house:{w:40,s:20},academy:{g:80,w:80,s:40}});
  Object.assign(BT,{house:22,academy:40});
  Object.assign(SH,{house:280,academy:420});

  Object.assign(C,{market:{w:120},torch:{w:10}});
  Object.assign(BT,{market:30,torch:6});
  Object.assign(SH,{market:320,torch:90});

  Object.assign(C,{forester:{w:45},guild:{w:90,g:40}});
  Object.assign(BT,{forester:20,guild:32});
  Object.assign(SH,{forester:260,guild:420});

  /* last-bastion buildings: observatory sees far, granary +4 population, bell = nearby troops attack 15% faster, sanctuary heals nearby troops */
  Object.assign(C,{observatory:{w:60,s:80},granary:{w:70,s:20},bell:{w:50,g:30},sanctuary:{s:90,g:60}});
  Object.assign(BT,{observatory:30,granary:22,bell:18,sanctuary:36});
  Object.assign(SH,{observatory:380,granary:300,bell:240,sanctuary:360});
  /* watch beacon: wide light at night and a far view; orchard: a trickle of food without a peasant */
  Object.assign(C,{beacon:{w:40,s:60},orchard:{w:60}});
  Object.assign(BT,{beacon:20,orchard:24});
  Object.assign(SH,{beacon:280,orchard:200});
  /* forge: troops +8% damage; embassy: tribute and caravans +50%; war room: training 15% faster; sappers: nearby buildings repair themselves */
  Object.assign(C,{forge:{s:100,g:80},embassy:{w:80,g:100},warroom:{w:90,s:60,g:60},sappers:{w:70,s:40}});
  Object.assign(BT,{forge:36,embassy:32,warroom:34,sappers:24});
  Object.assign(SH,{forge:380,embassy:320,warroom:340,sappers:260});

  /* new units: scout (fast, far-seeing, trained at barracks), engineer (no weapon, repairs buildings fast) */
  Object.assign(T,{scout:{r:5,hp:40,spd:155,dmg:4,rng:90,cdt:1.4,col:'#7fb0a0'},engineer:{r:5,hp:50,spd:110,col:'#d8b04a'}});
  Object.assign(C,{scout:{g:40,f:20},engineer:{g:70,w:40,s:20}});
  Object.assign(TRAIN,{scout:10,engineer:14});

  Object.assign(C,{movec:{g:100,w:150},rotate:{}});
  Object.assign(SZ,{keep:2});
  Object.assign(SH,{keep:2400});
  Object.assign(BT,{keep:30});
  Object.assign(GCAP,{keep:12,tower:4});
  Object.assign(GRNG,{keep:2.8});
  Object.assign(GTOP,{keep:3.7});
  UPC.keep={s:360,w:80};
}
