import { pxArms, pxBox, pxScene } from './pixel-geometry.js';
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

export function initializeRoyalSkins() {
  CH4 = Array.from({length:12},(_,i)=>i%2?'2121':'1212');
  CH8 = CH4.map(r=>r+r);
}
