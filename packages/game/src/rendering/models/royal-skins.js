import { newG } from '../geometry.js';
import { pxArms, pxBox, pxCat, pxScene } from './pixel-geometry.js';
import { pxMap, pxPaint, pxSkin, pxSkinArms } from './soldier-skins.js';
import { pxSpriteF } from './weapons.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ================= RESTYLE ROUND 2: king, captain, bannerman, gunners, zombies =================
   Same Blockbench manner as the knight / royal guard: the Minecraft player model with an outer layer, a few extra
   cubes, the detail in the pixel art. Steel shades are the digits 0 (darkest) .. 5, gold g G o, leather b B n,
   the team colours V t T U Y come from pxMap. */
const PXF2={s:'#e0a07c',S:'#c27f5c',w:'#f4f4f4',e:'#3a6ec2',m:'#8e4a3c',0:'#141519',1:'#2c2e34',2:'#4a4d55',3:'#6d717a',4:'#949aa3',5:'#c4c8ce',
 g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16'};

const pxMap2=(o,tm)=>pxMap(Object.assign({},PXF2,o),tm);

const rep2=(r,n)=>Array(n).fill(r);

let CH4;
let CH8;

const FACE2=(mid,low,R)=>({F:['hhhhhhhh','hhhhhhhh','hssssssh','srrssrrs','swessews','sssSSsss',mid||'sssmmsss',low||'ssssssss'],
 R:R||['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:rep2('hhhhhhhh',7).concat(['ssssssss']),T:rep2('hhhhhhhh',8),D:rep2('ssssssss',8)});

/* a pixel cut-out wall of a crown: rows top first, '.' = gap; plane xy (front / back) or yz (sides) */
function pxCut(G,rows,map,o){const H=rows.length,W=rows[0].length;pxSpriteF(G,W,H,(u,v)=>{const c=rows[H-1-v][u];return c==='.'?null:map[c]},o)}

/* ---------------- KING NARAIGE: A open face, beard and crown / B royal great helm under the crown ---------------- */
export function pxKing(P,AL){const vr=(window.__KV||'B'),helm=vr==='B',
  map=pxMap2({h:'#7a4422',r:'#4e2a12',E:'#f3efe6',q:'#d6d0c2',x:'#18181c',R:'#a62832',Q:'#c94450',X:'#6c111b',j:'#e8303a',z:'#3a7aff'},thp());
 const K={hatMat:4,jacketMat:0,sleeveMat:4,pantsMat:4,
  head:FACE2('shhmmhhs','hhhhhhhh',['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','hhsshhhh','hhhhhhhh']),
  hat:helm?{F:['oggggggo','44444444','333gG333','000gG000','333gG333','313gG313','3333g333','22222222'],
    R:['oggggggo','44444444','33333334','00333333','33333333','31333333','33333332','22222222'],L:'~R',
    B:['oggggggo','44444444','33343333','33343333','33343333','23343332','23343332','22222222'],
    T:['44444444','43333334','433gg334','43gGGg34','43gGGg34','433gg334','43333334','44444444']}:null,
  body:{F:CH8,B:'F',R:CH4,L:'R',T:rep2('11111111',4),D:'T'},
  jacket:{F:['EExEExEE','qEEEEEEq','gUUUUUUg','gUGUUGUg','gUGGGGUg','gUUUUUUg','XRRGGRRX','gUUUUUUg','gUUUUUUg','gTUUUUTg','gTTUUTTg','oggggggo'],
   R:['EExE','qEEq','gUUU','UUUU','UUUU','UUUU','XRRR','UUUU','UUUU','TUUU','TTUU','oggg'],L:'~R',
   B:['EExEExEE','qEEEEEEq','gUUUUUUg','gUUUUUUg','gUUUUUUg','gUUUUUUg','XRRRRRRX','gUUUUUUg','gUUUUUUg','gTUUUUTg','gTTUUTTg','oggggggo'],
   T:['EEEEEEEE','ExEEExEE','EEExEEEx','EEEEEEEE']},
  arm:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  sleeve:{F:['4444','3443','3333','2332','4444','gGGg','4554','3443','3333','2332','gGGg','2222'],R:'F',L:'F',
   B:['3333','2332','2222','1221','3333','oggo','3333','2332','2222','1221','oggo','1111'],T:['4444','4334','4334','4444'],D:rep2('1111',4)},
  leg:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  pants:{F:['3333','2222','1221','....','4444','gGGg','3443','....','4334','3443','2222','1111'],R:['3333','2222','1222','....','4444','gGGg','3443','....','4333','3443','2222','1111'],L:'~R',
   B:['3333','2222','1221','....','3333','2222','1221','....','3333','2222','1111','1111'],T:rep2('3333',4),D:rep2('1111',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  /* ermine collar over the shoulders */
  pxBox(P.G,-4.3,21.6,-2.6,8.6,2.6,5.2,pxPaint({F:['EExEEExEE','qEEEqEEEq'],B:'F',R:['ExEEE','qEEqE'],L:'R',T:['EEExEEEEE','ExEEEEExE','EEEEEEEEE','EExEEEExE','EEEEEEEEE']},map),{mat:0,grid:[9,2,5]});
  /* the crown: four cut-out gold walls with rubies and sapphires */
  const y0=helm?32.3:31.1,h=helm?4.9:4.6,ps=(2*h)/9,FR=['G...G...G','gG.GgG.Gg','ggggggggg','gjgzgzgjg'],SD=['...G...','..GgG..','ggggggg','gzgjgzg'],o={ps,d:.9,mat:4};
  pxCut(P.HG,FR,map,Object.assign({x:-h,y:y0,z:h-.45},o));pxCut(P.HG,FR,map,Object.assign({x:-h,y:y0,z:-h+.45},o));
  pxCut(P.HG,SD,map,Object.assign({plane:'yz',x:h-.45,y:y0,z:-h+ps},o));pxCut(P.HG,SD,map,Object.assign({plane:'yz',x:-h+.45,y:y0,z:-h+ps},o));
 });
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.1,-1.4,-3.1,6.2,3.2,6.2,pxPaint({T:['oggggo','g5445g','g4554g','g4554g','g5445g','oggggo'],F:['444444','333333','oggggo'],B:'F',R:'F',L:'F',D:rep2('111111',6)},map),{mat:4,grid:[6,3,6]})});
}

/* ---------------- CAPTAIN: gilded breastplate, red officer sash, team skirt, open bascinet, gold pauldrons ---------------- */
export function pxCaptain(P,AL){const map=pxMap2({h:'#4a2c16',r:'#2e1a0c',R:'#b8323c',Q:'#de5a62',X:'#7a1a24'},thp());
 const K={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
  head:FACE2('shhmmhhs'),
  hat:{F:['44444444','3gggggg3','3......3','3......3','3......3','3......3','33....33','33....33'],
   R:['44444444','33333333','33333333','33333332','33333332','33333322','33333322','22222222'],L:'~R',
   B:['44444444','33333333','33333333','33333333','23333332','23333332','22222222','22222222'],
   T:['44444444','43333334','433gg334','433gg334','433gg334','433gg334','43333334','44444444']},
  body:{F:CH8,B:'F',R:CH4,L:'R',T:rep2('11111111',4),D:'T'},
  jacket:{F:['oggggggo','gRQGGGGg','gGRQGGGg','gGGRQGGg','ggGGRQgg','ogGGGRQo','nbbGGbRn','TUUUUUUT','tUUTTUUt','tUUTTUUt','tTTttTTt','tttttttt'],
   R:['oggg','gGGg','gGGg','gGGg','ggGg','oggg','nbbn','TUUU','tUUU','tUUU','tTTT','tttt'],L:'~R',
   B:['oggggggo','gggggggg','gGggggGg','gggggggg','gggggggg','oggggggo','nbbbbbbn','TUUUUUUT','tUUUUUUt','tUUUUUUt','tTTttTTt','tttttttt'],
   T:['oggggggo','gGGGGGGg','gGGGGGGg','oggggggo']},
  arm:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  sleeve:{F:['GGGG','gggg','oggo','....','GGGG','gGGg','oggo','....','4444','3443','gggg','2323'],R:'F',L:'F',
   B:['gggg','oooo','oooo','....','gggg','oggo','oooo','....','3333','2222','oooo','1212'],T:['GGGG','GggG','GggG','GGGG'],D:rep2('1111',4)},
  leg:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  pants:{F:['UUUU','UUUU','TUUT','....','gGGg','oggo','3443','....','4334','3443','2222','1111'],R:['UUUU','UUUU','TUUU','....','gGGg','oggo','3443','....','4333','3443','2222','1111'],L:'~R',
   B:['TTTT','TTTT','tTTt','....','gggg','oooo','3333','....','3333','2222','1111','1111'],T:rep2('UUUU',4),D:rep2('1111',4)}};
 pxScene(()=>pxSkin(P,K,map));
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.1,-1.4,-3.1,6.2,3.2,6.2,pxPaint({T:['oggggo','gGGGGg','gGRRGg','gGRRGg','gGGGGg','oggggo'],F:['GGGGGG','gggggg','oooooo'],B:'F',R:'F',L:'F',D:rep2('111111',6)},map),{mat:4,grid:[6,3,6]})});
}

/* ---------------- BANNERMAN: kettle hat, quilted gambeson, team tabard with a white cross, steel vambraces ---------------- */
export function pxBannerman(P,AL){const map=pxMap2({h:'#5a3a1a',r:'#3a2410',a:'#ddd0ae',A:'#b4a682',c:'#f2ecdc',y:'#d9a83a',P:'#433824',p:'#2e2618'},thp());
 const Q8=Array.from({length:12},(_,i)=>i%2?'aaAaaaAa':'aAaaaAaa'),Q4=Q8.map(r=>r.slice(0,4));
 const K={hatMat:4,jacketMat:0,sleeveMat:4,
  head:FACE2(),
  hat:{F:['44444444','33333333','22222222','........','........','........','........','........'],R:'F',L:'F',B:'F',
   T:['44444444','43333334','43333334','43344334','43344334','43333334','43333334','44444444']},
  body:{F:Q8,B:'F',R:Q4,L:'R',T:rep2('aaaaaaaa',4),D:'T'},
  jacket:{F:['aaaaaaaa','aTTccTTa','aTTccTTa','acccccca','aTTccTTa','aTTccTTa','nbbyybbn','aTTccTTa','aTTccTTa','AtTccTtA','AttccttA','AAAAAAAA'],
   R:['aaaa','aAaa','aaAa','aaaa','aAaa','aaAa','nbbn','aaaa','aAaa','aaAa','AaaA','AAAA'],L:'~R',B:'F',T:['aaaaaaaa','aAaaaaAa','aaaaaaaa','aaaaaaaa']},
  arm:{F:Q4.slice(0,9).concat(['ssss','ssss','SSSS']),B:'F',R:'F',L:'F',T:rep2('aaaa',4),D:rep2('SSSS',4)},
  sleeve:{F:['....','....','....','....','....','4444','3443','3333','2222','....','....','....'],R:'F',L:'F',B:['....','....','....','....','....','3333','2222','2222','1111','....','....','....'],T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP'],B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('nnnn',4)},
  pants:{F:['....','....','....','....','....','....','BBBB','bBbB','bbbb','bnbb','bbbb','nnnn'],R:'F',L:'F',B:'F',T:null,D:rep2('nnnn',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?map['4']:map['3']):(f==='D'?map['1']:map['2']),{mat:4,grid:[12,1,12]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}

/* ---------------- GUNNERS: team doublet, brass buttons, leather apron, bandolier of flasks, cap with a white feather ---------------- */
export function pxGunner(P,AL){const map=pxMap2({h:'#3a2410',r:'#24160a',y:'#d9a83a',z:'#f2cc66',c:'#f2efe6',C:'#cfcabc',P:'#3e3a36',p:'#2a2622'},thp());
 const K={jacketMat:0,
  head:FACE2('shhhhhhs','sssmmsss'),
  hat:{F:['UUUUUUUU','yyyyyyyy','........','........','........','........','........','........'],R:'F',L:'F',B:'F',
   T:['UUUUUUUU','UYYUUUUU','UYUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU']},
  body:{F:rep2('UUUUUUUU',12),B:'F',R:rep2('UUUU',12),L:'R',T:rep2('UUUUUUUU',4),D:'T'},
  jacket:{F:['tUUUUUbt','UUUUUbyU','UUUUbbUU','UUUbyUUU','UUbbUUUU','nnnyynnn','UBBBBBBU','UBbbbbBU','UBbbbbBU','tBbbbbBt','tBbnnbBt','tnnnnnnt'],
   R:['tUUU','UUUU','UUUU','UUUU','UUUU','nnnn','UUUU','UUUU','tUUU','tUUU','ttUU','tttt'],L:'~R',
   B:['tUUUUUUt','UbUUUUUU','UUbUUUUU','UUUbUUUU','UUUUbUUU','nnnnnnnn','UUUUUUUU','UUUUUUUU','tUUUUUUt','tUUUUUUt','ttUUUUtt','tttttttt'],
   T:['tUUUUUbt','UUUUUbUU','UUUUUUUU','tUUUUUUt']},
  arm:{F:rep2('UUUU',7).concat(['tttt','ssss','ssss','SsSs','SSSS']),B:'F',R:'F',L:'F',T:rep2('UUUU',4),D:rep2('SSSS',4)},
  sleeve:{F:['....','....','....','....','....','....','yUUy','tttt','....','....','....','....'],R:'F',L:'F',B:'F',T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP'],B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('nnnn',4)},
  pants:{F:['....','....','....','....','....','....','....','bbbb','bnbb','bbbb','bbbb','nnnn'],R:'F',L:'F',B:'F',T:null,D:rep2('nnnn',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,3.4,30.4,-1.2,1.1,4.2,1.1,f=>f==='D'?map.C:map.c,{mat:0,grid:[1,4,1]});pxBox(P.HG,3.4,33.8,-2.7,1.1,2,1.6,f=>f==='T'?map.c:map.C,{mat:0,grid:[1,2,2]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}

/* ================= SCOUT, ENGINEER, ENVOY (King's choice B, ex box kits): same silhouettes, now Blockbench pixel layers =================
   Letters are the colours you see (pxMap2). Extra cubes: scout = frame pack + bedroll + goggles + spyglass, engineer = hard hat,
   tool belt, hammer on the back + wrench, envoy = high scarf with two long tails + unrolled sheet. Hand items go on the right arm only. */
const fl=c=>()=>c;
const handItems=(P,fn)=>{const T=newG();pxScene(()=>fn(T));pxCat(P.AG,T)};

/* ---------------- SCOUT: beige long coat, red scarf, flat brown cap with goggles pushed up, tall frame pack with a bedroll, spyglass ---------------- */
export function pxScout(P,AL){const map=pxMap2({h:'#5a3a1a',r:'#3a2410',C:'#cdb98f',D:'#a8946c',E:'#b8a47c',R:'#8a3a32',Q:'#5e2620',a:'#8a7a58',A:'#6e6046',P:'#5a4a32',p:'#463a26',z:'#3a2a18',H:'#5a3a1a',I:'#3f2812',k:'#3a3a40',l:'#9ad8ff',q:'#7a5a34',f:'#a89a74'});
 const coat=(n)=>['RRRRRRRR','QRRRRRRQ','CDaaaaDC','CCDaaDCC','CCCDDCCC','CCCDDCCC','nnnggnnn','CCCDDCCC','CCDDDCCC','CCCDDCCC','CCCDDCCC','DDDDDDDD'].slice(0,n);
 const side=['RRRR','RRRR','CCCC','CCCC','CCCC','CCCC','nnnn','CCCC','CCCC','CCCC','CCCC','DDDD'];
 const K={jacketMat:0,
  head:FACE2(),
  hat:{F:['HHHHHHHH','HIHHHHIH','kkkkkkkk','........','........','........','........','........'],R:['HHHHHHHH','HHHHHHHH','kkkkkkkk','........','........','........','........','........'],L:'R',B:'R',T:rep2('HHHHHHHH',8)},
  body:{F:rep2('aaaaaaaa',12),B:'F',R:rep2('aaaa',12),L:'R',T:rep2('aaaaaaaa',4),D:'T'},
  jacket:{F:coat(12),B:['RRRRRRRR','QRRRRRRQ'].concat(rep2('CCCCCCCC',9),['DDDDDDDD']),R:side,L:'R',T:rep2('RRRRRRRR',4)},
  arm:{F:rep2('aaaa',7).concat(['AAAA','ssss','ssss','SsSs','SSSS']),B:'F',R:'F',L:'F',T:rep2('aaaa',4),D:rep2('SSSS',4)},
  sleeve:{F:rep2('....',7).concat(['DDDD'],rep2('....',4)),R:'F',L:'F',B:'F',T:null,D:null},
  leg:{F:rep2('PPPP',9).concat(['pppp','zzzz','zzzz']),B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('zzzz',4)},
  pants:{F:rep2('CCCC',4).concat(['DDDD'],rep2('....',7)),R:'F',L:'F',B:'F',T:null,D:null}};
 pxScene(()=>{pxSkin(P,K,map);
  /* frame pack, bedroll above it, buckled straps, a pot and a staff hung on the side */
  pxBox(P.G,-3.7,11,-7,7.4,15.5,4.8,(f,u,v,W,H)=>f==='T'?map.B:f==='D'?map.n:v>=H-3?map.n:f==='B'?(v===H-4?(u===3?map.g:map.n):u===0||u===W-1?map.n:(v%5===0?map.b:map.B)):map.b,{mat:0,grid:[7,15,5]});
  pxBox(P.G,-5,26.5,-7.2,10,4,3,(f,u,v)=>f==='T'?map.f:(f==='F'||f==='B'||f==='R'||f==='L')&&(u===2||u===7&&f!=='R'&&f!=='L')?map.n:v%2?map.f:map.E,{mat:0,grid:[10,4,3]});
  pxBox(P.G,-4.4,16,2,2.4,2.4,1.2,fl(map.b),{mat:0,grid:[2,2,1]});
  pxBox(P.G,2.6,12.5,-7.8,2.6,2.6,1.6,f=>f==='T'?map[4]:map[3],{mat:4,grid:[3,3,2]});
  /* goggles pushed up on the cap */
  for(const x of[-3.7,.7])pxBox(P.HG,x,28.4,4.5,3,2.2,.9,(f,u,v,W,H)=>f==='F'&&u>0&&u<W-1&&v>0&&v<H-1?map.l:map.k,{mat:0,grid:[3,2,1]});
  pxBox(P.HG,-.7,28.8,4.5,1.4,.8,.7,fl(map.k),{mat:0,grid:[1,1,1]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
 handItems(P,T=>{/* spyglass, brass ferrule and bands, glass on top */
  pxBox(T,-.7,-12.2,1.9,1.4,12.2,1.4,fl(map.q),{mat:0,grid:[1,6,1]});
  pxBox(T,-.95,-3.2,1.65,1.9,3.8,1.9,(f,u,v)=>f==='T'?map.G:v%2?map.g:map.o,{mat:4,grid:[1,4,1]});
  for(const y of[-8.4,-12.3])pxBox(T,-.95,y,1.65,1.9,.9,1.9,fl(map.g),{mat:4,grid:[1,1,1]});
  pxBox(T,-.65,.6,1.95,1.3,.35,1.3,fl(map.l),{mat:5,grid:[1,1,1]})})}

/* ---------------- ENGINEER: yellow hard hat with a lamp, leather apron with steel rivets, tool belt, huge hammer on the back, wrench ---------------- */
export function pxEngineer(P,AL){const map=pxMap2({h:'#4a2e16',r:'#2e1c0e',a:'#6a5a46',A:'#524634',P:'#4a4038',p:'#3a322a',z:'#2a2018',X:'#7a4e2c',x:'#5e3a1e',J:'#d8b04a',K:'#e0bc58',M:'#fff2b0',k:'#2a2a30',l:'#9ad8ff',q:'#8a6a3a'});
 const K={jacketMat:0,
  head:FACE2(),
  hat:{F:['JJJJJJJJ','JKJJJJKJ','kllkkllk','........','........','........','........','........'],R:['JJJJJJJJ','JJJJJJJJ','kkkkkkkk','........','........','........','........','........'],L:'R',B:'R',T:rep2('JJJJJJJJ',8)},
  body:{F:rep2('aaaaaaaa',12),B:'F',R:rep2('aaaa',12),L:'R',T:rep2('aaaaaaaa',4),D:'T'},
  jacket:{F:['aXaaaaXa','aXXXXXXa','aXXXXXXa','aXxxxxXa','aXxXXxXa','aXXXXXXa','aXX55XXa','aXXXXXXa','aXXXXXXa','aXXXXXXa','aXXXXXXa','nnnggnnn'],
   B:['aXaaaaXa','aXaaaaXa'].concat(rep2('........',9),['nnnnnnnn']),R:['XXXX','XXXX'].concat(rep2('....',9),['nnnn']),L:'R',T:rep2('aXaaaaXa',4)},
  arm:{F:rep2('aaaa',7).concat(['AAAA','ssss','ssss','SsSs','SSSS']),B:'F',R:'F',L:'F',T:rep2('aaaa',4),D:rep2('SSSS',4)},
  sleeve:{F:rep2('....',7).concat(['nnnn'],rep2('....',4)),R:'F',L:'F',B:'F',T:null,D:null},
  leg:{F:rep2('PPPP',9).concat(['pppp','zzzz','zzzz']),B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('zzzz',4)},
  pants:{F:rep2('XXXX',3).concat(['xxxx'],rep2('....',8)),R:'.',L:'.',B:'.',T:null,D:null}};
 K.pants.R=rep2('....',12);K.pants.L='R';K.pants.B='R';
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-4,32.5,-4,8,1.7,8,f=>f==='T'?map.K:map.J,{mat:0,grid:[8,2,8]});
  pxBox(P.HG,-1,31,4.55,2,1.8,1.1,fl(map.M),{mat:5,grid:[1,1,1]});
  pxBox(P.G,-5.1,9.3,2.2,1.9,2.7,1.1,(f,u,v,W,H)=>v===H-1?map.B:map.b,{mat:0,grid:[2,3,1]});
  pxBox(P.G,3.3,9.4,2.2,1.8,3.6,1.1,(f,u,v,W,H)=>v===H-1?map[5]:map[3],{mat:4,grid:[2,4,1]});
  /* hammer slung across the back: long haft, big steel head above the shoulder */
  pxBox(P.G,1.5,7,-4.8,1.4,23,1.4,(f,u,v)=>f==='T'?map.B:v%6===0?map.n:map.q,{mat:0,grid:[1,23,1]});
  pxBox(P.G,-1.3,29,-6.1,7,4.8,4.2,(f,u,v,W,H)=>f==='T'?map[5]:f==='D'?map[2]:f==='R'||f==='L'?(u>0&&u<W-1&&v>0&&v<H-1?map[3]:map[4]):v===H-1?map[4]:f==='B'?map[2]:map[3],{mat:4,grid:[7,5,4]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
 handItems(P,T=>{pxBox(T,-.65,-12.6,1.1,1.3,14.3,1.3,(f,u,v)=>f==='T'?map[4]:v%5===0?map[2]:map[3],{mat:4,grid:[1,14,1]});
  pxBox(T,-1.6,1.1,.7,3.3,3.9,1.8,(f,u,v,W,H)=>f==='F'&&u===1&&v<2?null:f==='T'?map[5]:map[4],{mat:4,grid:[3,4,2]})})}

/* ---------------- ENVOY: cream robe, red scarf wrapped high with two long tails down the back, red cap, big unrolled sheet in hand ---------------- */
export function pxEnvoy(P,AL){const map=pxMap2({h:'#6a4a2a',r:'#442d16',O:'#e4dccb',N:'#b8b09c',W:'#a83232',Z:'#7c2222',c:'#f4f0e0',d:'#cfc6aa',i:'#8a7a5a',P:'#6a6254',p:'#4e463a',z:'#3a2a18'});
 const K={jacketMat:0,
  head:FACE2(),
  hat:{F:['WWWWWWWW','WZWWWWZW'].concat(rep2('........',6)),R:['WWWWWWWW','WWWWWWWW'].concat(rep2('........',6)),L:'R',B:'R',T:rep2('WWWWWWWW',8)},
  body:{F:rep2('OOOOOOOO',12),B:'F',R:rep2('OOOO',12),L:'R',T:rep2('OOOOOOOO',4),D:'T'},
  jacket:{F:rep2('OOOOOOOO',4).concat(rep2('OOONOOOO',7),['WWWWWWWW']),B:rep2('OOOOOOOO',11).concat(['WWWWWWWW']),R:rep2('OOOO',11).concat(['WWWW']),L:'R',T:rep2('OOOOOOOO',4)},
  arm:{F:rep2('OOOO',6).concat(['NNNN','ssss','ssss','ssss','SsSs','SSSS']),B:'F',R:'F',L:'F',T:rep2('OOOO',4),D:rep2('SSSS',4)},
  leg:{F:rep2('PPPP',9).concat(['pppp','zzzz','zzzz']),B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('zzzz',4)},
  pants:{F:rep2('OOOO',4).concat(['NNNN'],rep2('....',7)),R:'F',L:'F',B:'F',T:null,D:null}};
 K.arm.F[6]='OOOO';K.arm.F[7]='NNNN';
 const tail=(c,d)=>(f,u,v,W,H)=>f==='T'?c:v<2?d:(f==='F'||f==='B')&&v%7===3&&u===1?d:c;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.G,-5.1,20.4,-2.9,10.2,3.3,5.9,(f,u,v,W,H)=>f==='T'||f==='D'?map.W:v===0?map.Z:(u+v)%4===0?map.Z:map.W,{mat:0,grid:[10,3,6]});
  pxBox(P.HG,-3.7,32.5,-3.7,7.4,1.3,7.4,f=>map.Z,{mat:0,grid:[7,1,7]});
  pxBox(P.G,1.4,3,-3.6,2.8,19.6,1.2,tail(map.W,map.Z),{mat:0,grid:[3,20,1]});
  pxBox(P.G,-3.6,7,-3.6,2.8,15.2,1.2,tail(map.W,map.Z),{mat:0,grid:[3,15,1]});
  pxBox(P.G,1.4,3,-3.6,2.8,.8,1.2,fl(map.Z),{mat:0,grid:[3,1,1]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
 handItems(P,T=>{/* unrolled sheet hanging from the fist: rollers red, lines of script */
  pxBox(T,-.4,-17.8,-.2,.8,9.1,7,(f,u,v,W,H)=>f==='R'||f==='L'?(v===H-1||v===0?map.W:v%2?map.i:map.c):f==='T'?map.W:f==='D'?map.W:map.d,{mat:0,grid:[1,9,7]});
  pxBox(T,-.7,-10,-.2,1.4,1,7.2,fl(map.W),{mat:0,grid:[1,1,7]})})}

export function initializeRoyalSkins() {
  CH4 = Array.from({length:12},(_,i)=>i%2?'2121':'1212');
  CH8 = CH4.map(r=>r+r);
}
