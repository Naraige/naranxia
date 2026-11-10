import { embassyGeo, forgeGeo, sappersGeo, warRoomGeo, beaconGeo, orchardGeo, bellGeo, granaryGeo, observatoryGeo, sanctuaryGeo } from './bastion-buildings.js';
import { TW } from '../../gameplay/rules.js';
import { bxc, geometryState, newG, toGeo } from '../geometry.js';
import {
  academyGeo,
  barracksGeo,
  farmGeo,
  foresterGeo,
  guildGeo,
  houseGeo,
  marketGeo,
  storageGeo,
  torchGeo,
  woodBarracksGeo,
} from './buildings.js';
import { castleGeo, castleGeo5, keepGeo, woodCastleGeo, woodCastleGeo5 } from './castles.js';
import {
  gateGeo,
  gateGeo3,
  towerGeo,
  towerGeo2,
  wallGeo,
  woodGateGeo,
  woodGateGeo3,
  woodTowerGeo,
  woodTowerGeo2,
  woodWallGeo,
} from './fortifications.js';
import { PAL, thp } from '../../ui/kingdom-theme.js';
import { gOK } from '../../world/routes.js';
import { occ } from '../../world/terrain.js';

export const structureModelsState = {
  BLU: undefined,
};

/* ---- structures: connected voxel models ---- */
const ST='#7f7f7f',ST2='#8b8b8b',ST3='#979797',STD='#5f5f5f',STL='#b3b3b3',DK='#1b1b22',RED='#9b3b2e',WOOD='#9c7a46',IRON='#4a4a52';

export const isW=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&(o.type==='wall'||o.type==='gate'||o.type==='tower'||o.type==='castle'||o.type==='keep')};

const isWl=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&o.type==='wall'};

export const connMask=s=>{const x=s.tx,y=s.ty,n=isW(x,y-1),e=isW(x+1,y),so=isW(x,y+1),w=isW(x-1,y);let m=(n?1:0)|(e?2:0)|(so?4:0)|(w?8:0);if(s.type==='wall'){if(!e&&!so&&isWl(x+1,y+1))m|=16;if(!w&&!so&&isWl(x-1,y+1))m|=32}return m};

/* 2x2 tower: which of the 8 tiles around it hold rampart pieces (2 per side: N, E, S, W) */
export const pMask=s=>{const x=s.tx,y=s.ty,q=(a,b)=>{const o=occ.get(b*TW+a);return o&&o!==s&&isW(a,b)};let m=0;[[x,y-1],[x+1,y-1],[x+2,y],[x+2,y+1],[x,y+2],[x+1,y+2],[x-1,y],[x-1,y+1]].forEach(([a,b],i)=>{if(gOK(a,b)&&q(a,b))m|=1<<i});return m};

export const WH = 1.7;
export const WT = .3;
const CRS = [ST,ST2,ST3,ST2];


export const DIRS=[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]];

/* box along an arm: t = distance along the arm, l = lateral */
const ab=(G,dx,dz,t,l,y,a,b,h,c)=>bxc(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);


/* gate: 2 tiles long (local x -1..1), depth .8 */

/* ---- siege turrets ---- */
const WD='#7a5230',WD2='#5a3a20',WD3='#92643a';

function ballBase(){const G=newG();bxc(G,0,0,0,.92,.14,.92,STD);bxc(G,0,.14,0,.84,.08,.84,'#6a4a28');
 for(let k=0;k<4;k++){const a=k*Math.PI/2;bxc(G,Math.cos(a)*.36,.0,Math.sin(a)*.36,.14,.18,.14,ST3)}
 bxc(G,0,.22,0,.26,.34,.26,WD2);bxc(G,0,.54,0,.4,.07,.4,IRON);[[.38,-.3],[-.36,.34],[.34,.36]].forEach(([x,z])=>{bxc(G,x,.22,z,.22,.12,.26,'#b89a60');bxc(G,x,.34,z,.14,.07,.18,'#a88a50')});
 bxc(G,-.36,.22,-.36,.1,.28,.1,WD);bxc(G,.36,.22,-.36,.1,.28,.1,WD);return toGeo(G)}

export function ballBolt(){const G=newG();bxc(G,0,.11,.12,.055,.055,.96,'#e8dcb8');bxc(G,0,.11,.66,.09,.075,.14,'#d4dae6');bxc(G,0,.11,.73,.05,.05,.08,'#f4f8ff');bxc(G,0,.11,-.3,.05,.06,.06,'#c04030');return toGeo(G)}

export function ballHead(){const G=newG();
 bxc(G,0,-.07,0,.15,.13,1.04,WD3);bxc(G,0,.06,.04,.07,.05,.86,IRON);bxc(G,0,-.12,.05,.1,.05,.8,WD2);
 bxc(G,0,-.04,.28,.34,.2,.17,WD2);bxc(G,0,-.04,.28,.38,.07,.19,IRON);
 [1,-1].forEach(sg=>{bxc(G,sg*.24,-.02,.28,.2,.12,.13,WD);bxc(G,sg*.42,-.01,.24,.18,.11,.12,WD3);bxc(G,sg*.57,0,.15,.14,.1,.12,WD);bxc(G,sg*.66,0,.05,.1,.1,.1,'#a89060');
  bxc(G,sg*.34,.04,.0,.62,.025,.04,'#efe6c8');bxc(G,sg*.62,.04,.1,.04,.025,.2,'#efe6c8');bxc(G,sg*.18,.04,-.12,.34,.025,.04,'#efe6c8')});
 bxc(G,0,-.02,-.46,.24,.2,.12,STD);bxc(G,0,.05,-.46,.34,.05,.05,IRON);bxc(G,.17,.05,-.46,.05,.18,.05,WD);
 bxc(G,0,.14,-.38,.04,.34,.04,'#3a2f20');bxc(G,.1,.38,-.38,.2,.1,.03,structureModelsState.BLU);bxc(G,.05,.3,-.38,.1,.1,.03,structureModelsState.BLU);return toGeo(G)}

export function trebBase(){const G=newG();
 [.34,1.66].forEach(x=>{bxc(G,x,0,1,.16,.14,1.8,WD2);bxc(G,x,.14,.3,.12,.12,.4,WD);bxc(G,x,.14,1.7,.12,.12,.4,WD);
  [[.3,-1],[1.7,1]].forEach(([z,sg])=>{bxc(G,x,.14,z*.5+1*.5,.14,.1,.14,WD)});
  for(let k=0;k<5;k++){const t=k/4;bxc(G,x,.14+t*1.55,.55+t*.45*(1)-.02,.12,.4,.12,WD);bxc(G,x,.14+t*1.55,1.45-t*.45+.02,.12,.4,.12,WD)}
  bxc(G,x,1.5,1,.2,.34,.34,IRON)});
 bxc(G,1,0,.28,1.5,.12,.14,WD2);bxc(G,1,0,1.72,1.5,.12,.14,WD2);bxc(G,1,.14,1,1.4,.1,.1,WD);bxc(G,1,.7,.78,1.3,.08,.08,WD);bxc(G,1,.7,1.22,1.3,.08,.08,WD);
 bxc(G,1,1.78,1,1.34,.12,.12,'#3a2f20');
 bxc(G,1,0,1,.9,.06,1.6,'#6a5a3a');[[.3,.3],[1.7,.3],[.3,1.7],[1.7,1.7]].forEach(([x,z])=>{bxc(G,x,0,z,.28,.28,.28,ST3)});
 bxc(G,.1,.14,1.9,.2,.26,.2,'#b89a60');bxc(G,1.9,.14,.1,.22,.18,.26,'#b89a60');
 [.55,1.45].forEach(z=>{bxc(G,1.9,.0,z,.18,.28,.2,STD)});
 bxc(G,1.5,.5,1.82,.05,.34,.05,'#3a2f20');bxc(G,1.65,.78,1.82,.3,.1,.03,structureModelsState.BLU);return toGeo(G)}

export function trebArm(){const G=newG();
 bxc(G,0,-.06,.36,.16,.16,2.5,WD3);bxc(G,0,-.04,1.3,.12,.12,.95,WD);bxc(G,0,-.1,-.6,.2,.22,.5,WD2);bxc(G,0,.0,.3,.34,.2,.2,IRON);
 bxc(G,0,-.12,1.66,.05,.34,.05,'#d4c8a0');bxc(G,0,-.34,1.7,.34,.18,.3,'#8a7a50');bxc(G,0,-.2,1.7,.2,.2,.2,'#8a8d99');return toGeo(G)}

export function trebCW(){const G=newG();bxc(G,0,-.62,0,.12,.58,.12,IRON);bxc(G,0,-.72,0,.9,.1,.1,IRON);
 bxc(G,0,-1.2,0,.8,.5,.56,STD);bxc(G,0,-1.2,0,.82,.12,.58,structureModelsState.BLU);bxc(G,0,-.86,0,.84,.1,.6,ST3);bxc(G,0,-1.58,0,.82,.12,.58,structureModelsState.BLU);bxc(G,.42,-1.2,0,.04,.2,.3,'#e0b030');return toGeo(G)}

export const GEO={};


/* ---- wooden tier models ---- */
const LG1 = '#6b4f2e';
const LG2 = '#5b4326';
const LG3 = '#b8945f';
const LGD = '#3f2d1a';
const THA = '#7a5a34';
const THB = '#6a4c2a';
const THC = '#573e22';
export const ROPE = '#d9c28a';


/* ================= Minecraft-style small buildings (cobble, planks, logs, glass, stair roofs) ================= */
const COBL = ['#7d7d7d','#8c8c8c','#6e6e6e','#838383'];
const PLKL = ['#b8945f','#a98450'];
const SPRL = ['#6e5230','#5f4527'];
const LGM = '#5b4326';
const GLS = '#bfe3f2';
export const HAYC = '#d8b23a';


/* houses merge with aligned neighbours (bits: 1 N, 2 E, 4 S, 8 W): shared walls, one continuous roof */

const RF0='#9b3b2e',RF1='#8a3228';


export const CONNT=new Set(['storage','barracks','academy','market']);


function mergeMask(s){const T=s.type,tx=s.tx,ty=s.ty,P=s.pl|0,q=(x,y,ex,ey)=>{if(!gOK(x,y))return false;const o=occ.get(y*TW+x);return !!o&&o!==s&&o.type===T&&o.t===0&&(o.pl|0)===P&&o.tx===ex&&o.ty===ey};
 return (q(tx,ty-1,tx,ty-2)?1:0)|(q(tx+2,ty,tx+2,ty)?2:0)|(q(tx,ty+2,tx,ty+2)?4:0)|(q(tx-1,ty,tx-2,ty)?8:0)}

export function scafGeo(w,d,h){const G=newG(),P='#9a6a38',Q='#6f4a24',B='#c9a36a';const x=w/2+.08,z=d/2+.08;
 [[-x,-z],[x,-z],[-x,z],[x,z]].forEach(([a,b])=>bxc(G,a,0,b,.1,h,.1,Q));
 for(let y=.55;y<h;y+=.65){bxc(G,0,y,z,2*x,.06,.07,P);bxc(G,0,y,-z,2*x,.06,.07,P);bxc(G,x,y,0,.07,.06,2*z,P);bxc(G,-x,y,0,.07,.06,2*z,P)}
 for(let y=1.1;y<h;y+=1.3){bxc(G,0,y,z+.06,2*x,.05,.18,B);bxc(G,0,y,-z-.06,2*x,.05,.18,B)}
 const dz=z+.01;for(let y=0;y+1.3<h;y+=1.3){const n=Math.max(2,Math.round(x*2/.5));for(let k=0;k<n;k++){const a=-x+(k+.5)*2*x/n,f=k%2?-1:1;bxc(G,a,y+.55,dz,.05,.7,.05,P);}}
 return toGeo(G)}


export function sGeo(s,m){const MG=s.type==='house'||s.type==='farm'||s.type==='storage'||s.type==='barracks'||s.type==='academy'||s.type==='market',hm=MG?mergeMask(s):0;s.hm=hm;const op=s.type==='tower'&&!!s.weapon,sv=structureModelsState.BLU,fx=s.t===2?'f'+s.ci:'';if(s.t===2)structureModelsState.BLU=PAL[s.ci][1];try{const fixed=s.type==='castle'||s.type==='barracks'||s.type==='farm'||s.type==='storage'||s.type==='house'||s.type==='academy'||s.type==='market'||s.type==='forester'||s.type==='guild'||s.type==='torch'||s.type==='keep'||s.type==='gate'||s.type==='ballista'||s.type==='trebuchet',wd=s.tier===0&&s.type!=='ballista'&&s.type!=='trebuchet'&&s.type!=='torch',WDF={wall:1,gate:1,tower:1,castle:1,barracks:1,keep:1},k=s.type+(fixed?(hm?'m'+hm:''):m)+fx+(wd?'w':'')+(op?'o':'')+(s.sz===5?'5':'')+(s.type==='tower'&&s.sz===2?'2':'')+(s.type==='gate'&&s.gl===3?'3':'');if(wd&&!WDF[s.type]&&!GEO[k]){const wi=k.lastIndexOf('w'),kS=k.slice(0,wi)+k.slice(wi+1),old=GEO[kS];delete GEO[kS];geometryState.WOODY=true;try{GEO[k]=sGeo({...s,tier:1},m)}finally{geometryState.WOODY=false;if(old)GEO[kS]=old;else delete GEO[kS]}return GEO[k]}return GEO[k]||(GEO[k]=wd?({wall:woodWallGeo,tower:s.sz===2?woodTowerGeo2:woodTowerGeo,gate:s.gl===3?woodGateGeo3:woodGateGeo,castle:s.sz===5?woodCastleGeo5:woodCastleGeo,barracks:woodBarracksGeo,keep:()=>keepGeo(true)})[s.type](MG?hm:m,op):({wall:wallGeo,tower:s.sz===2?towerGeo2:towerGeo,gate:s.gl===3?gateGeo3:gateGeo,castle:s.sz===5?castleGeo5:castleGeo,barracks:barracksGeo,farm:farmGeo,storage:storageGeo,house:houseGeo,academy:academyGeo,market:marketGeo,forester:foresterGeo,observatory:observatoryGeo,beacon:beaconGeo,forge:forgeGeo,embassy:embassyGeo,warroom:warRoomGeo,sappers:sappersGeo,orchard:orchardGeo,granary:granaryGeo,bell:bellGeo,sanctuary:sanctuaryGeo,guild:guildGeo,torch:torchGeo,keep:()=>keepGeo(false),ballista:ballBase,trebuchet:trebBase})[s.type](MG?hm:m,op))}finally{structureModelsState.BLU=sv}}

export function initializeStructureModels() {
  structureModelsState.BLU = thp();
}
