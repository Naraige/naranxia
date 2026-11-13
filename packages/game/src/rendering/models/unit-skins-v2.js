import { pxArms, pxBox, pxRot, pxScene, shadeHex } from './pixel-geometry.js';
import { pxEngineer, pxEnvoy, pxKing, pxScout } from './royal-skins.js';
import { pxHead2, pxMap, pxPaint, pxRankK, pxSkin, pxSkinArms } from './soldier-skins.js';
import { pxSpriteF } from './weapons.js';
import { zombiesState } from './zombies.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ================= UNITS BOARD, LOOK B (switch: unit-style.js) =================
   Same Blockbench manner as the current skins: the Minecraft player model, an outer layer with transparent pixels, the detail in the
   pixel art, and 2 to 4 identity cubes per unit (cowl, fauld, double pauldrons, wings, basket, horn...). New here: every material is
   drawn with 3 to 4 tones (pxTone in soldier-skins.js adds hem shadow, lit shoulders and worn pixels), faces come from pxHead2, and a
   base cube that is fully covered by its outer layer is not drawn at all (K.body = 0: kept as an ambient-occlusion blocker only), which
   pays for the added cubes. Letters: s S K skin, w e m eyes and mouth, 0..5 steel, g G o gold, b B n N leather, c C linen, W white,
   V t T U Y the kingdom colour from dark to light (pxMap with thp()). Rows are written top first; F front, B back, R / L sides. */
const P2={s:'#e0a07c',S:'#c27f5c',K:'#f2b896',w:'#f4f4f4',e:'#3a6ec2',m:'#8e4a3c',0:'#141519',1:'#2c2e34',2:'#4a4d55',3:'#6d717a',4:'#949aa3',5:'#c4c8ce',
 g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',N:'#2e1c0e',c:'#ddd0ae',C:'#b4a682',W:'#f2ecdc'};
const mp=(o,tm)=>pxMap(Object.assign({},P2,o),tm);
const rep=(r,n)=>Array(n).fill(r);
const bad=(F,w,h)=>{if(F.length!==h||F.some(r=>r.length!==w))console.log('unit-skins-v2: bad rows',w,h,F.join('|'))};
/* a torso layer from its front (and back): the sides repeat the edge pixel of each row unless given */
const fc=(F,o)=>{o=o||{};bad(F,8,12);if(o.B)bad(o.B,8,12);if(o.R)bad(o.R,4,12);return{F,B:o.B||F,R:o.R||F.map(r=>r[7].repeat(4)),L:o.R?'~R':F.map(r=>r[0].repeat(4)),T:o.T===undefined?rep(F[0][1].repeat(8),4):o.T,D:o.D===undefined?rep(F[11][1].repeat(8),4):o.D}};
/* a limb layer: the same art on the four sides unless a back is given */
const lim=(F,B,o)=>{o=o||{};bad(F,4,12);if(B)bad(B,4,12);return{F,B:B||F,R:o.R||F,L:o.R?'~R':F,T:o.T===undefined?rep(F[0],4):o.T,D:o.D===undefined?rep(F[11],4):o.D}};
const MAILA=lim(['....','....','....','....','xyxy','....','....','yxyx','....','....','....','....']),MAILL=lim(['....','....','....','xyxy','....','....','....','yxyx','....','....','....','....']);
/* a pixel cut-out (wings): rows top first, '.' = gap */
const cut=(G,rows,map,o)=>{const H=rows.length,W=rows[0].length;pxSpriteF(G,W,H,(u,v)=>{const c=rows[H-1-v][u];return c==='.'?null:map[c]},o)};
/* plain cube painters */
const bev=(top,mid,low)=>(f,u,v,W,H)=>f==='T'?top:f==='D'?low:(H>=2&&v===H-1)?top:(H>=3&&v===0)?low:mid;
/* pauldron with a rim, and the lame under it (both arms through pxArms) */
function pauldrons(T,m,a,b,c,rim,rimL){pxBox(T,-3.3,-1.3,-3.3,6.6,3.3,6.6,(f,u,v,W,H)=>f==='D'?m[1]:f==='T'?((u===0||u===W-1||v===0||v===H-1)?b:a):v===H-1?a:v===0?((u===0||u===W-1)?rim:rimL):b,{mat:4,grid:[6,3,6]});
 pxBox(T,-2.85,-3.2,-2.85,5.7,2,5.7,(f,u,v,_W,_H)=>f==='T'?b:f==='D'?m[1]:v===0?rim:c,{mat:4,grid:[5,2,5]})}
/* fauld: armour skirt around the hips, the tabard (cols 2..6 front and back) runs over it */
function fauld(P,m,a,b,c,tab,tabD,rim){pxBox(P.G,-4.7,9.7,-2.8,9.4,3,5.6,(f,u,v,W,H)=>f==='T'?a:f==='D'?m[1]:((f==='F'||f==='B')&&u>=2&&u<=6)?(v===0?tabD:tab):v===H-1?a:v===0?(rim||c):b,{mat:4,grid:[9,3,6]})}

/* ---------------- PEASANT (six variants): tunic in 3 tones, apron with straps, rope belt and pouch, rolled sleeves, leg wraps, wicker basket on the back ---------------- */
export function px2Peasant(P){const pv=zombiesState.ZVAR&&zombiesState.ZVAR.hint==='p'?zombiesState.ZVAR.v%6:0;
 const SH=[['#6e4424','#8a5a32'],['#56642c','#6e7e3e'],['#6a3a32','#7c4a42'],['#3e4e62','#55667a'],['#6e6038','#8a7a52'],['#563a54','#6a4a6a']][pv],
  HR=[['#5a3a1a','#3a2410'],['#2a1a10','#160e08'],['#8a6a3a','#6a5028'],['#1e1a18','#120f0e'],['#a0522d','#6e3216'],['#6a6a62','#4a4a44']][pv],
  SK=[['#e8a684','#c98262'],['#f0bc96','#d69c78'],['#d4946e','#b57452'],['#e8a684','#c98262'],['#b07a54','#93603f'],['#f0bc96','#d69c78']][pv],hat=[0,2,0,1,3,0][pv],beard=pv===3||pv===5;
 const m=mp({s:SK[0],S:SK[1],K:shadeHex(SK[0],1.06),h:HR[0],r:HR[1],H:shadeHex(HR[0],1.35),e:['#3a78c2','#6b4423','#3fa65a','#6b4423','#3a78c2','#6b4423'][pv],
  V:SH[1],v:SH[0],Y:shadeHex(SH[1],1.22),a:'#ddd0ae',A:'#b4a682',P:'#4e4028',p:'#342a18',x:'#d4c6aa',X:'#b8a98e',Z:'#d4b45c',z:'#a88a42',y:'#ecd27a',k:'#6a5038',l:'#86684a',
  q:'#d8cbaa',Q:'#b0a284',j:'#8a6a34',J:'#a8884a',i:'#5e4420',R:'#a8433a',f:['#ecd27a','#6e9a3e','#c0483a'][pv%3],F:['#d4b45c','#4e7a2e','#8a2e26'][pv%3]});
 const K={head:pxHead2({beard:beard?2:0}),
  hat:hat===1?{F:['llllllll','kkkkkkkk','kkkkkkkk','........','........','........','........','........'],R:['llllllll','kkkkkkkk','kkkkkkkk','kkkk....','........','........','........','........'],L:'~R',B:['llllllll','kkkkkkkk','kkkkkkkk','kkkkkkkk','kkkkkkkk','........','........','........'],T:rep('llllllll',8)}
   :hat===2?{F:['qqqqqqqq','QqqqqqqQ','Q......Q','........','........','........','........','........'],R:['qqqqqqqq','qqqqqqqq','qqqqqqqq','Qqqqqqqq','.Qqqqqqq','..QQqqqq','.....QQq','........'],L:'~R',B:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','QqqqqqqQ','QQqqqqQQ','..QqqQ..'],T:rep('qqqqqqqq',8)}:null,
  body:fc(['VVYssYVV','VVVSsVVV','VVVVVVVV','VYVVVVYV','VVVVVVVV','vVVVVVVv','vVVVVVVv','VVVVVVVV','vVVVVVVv','vVVVVVVv','vvVVVVvv','vvvvvvvv'],{B:['VVVVVVVV','VVYVVYVV','VVVVVVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','VVVVVVVV','vVVVVVVv','vVVVVVVv','vvVVVVvv','vvvvvvvv']}),
  jacket:{F:['.A....A.','.A....A.','.aaaaaa.','.aaaaaa.','.aaAaaa.','.aaaaaa.','cCcCcCcC','.aaaaaC.','.aaaaac.','.aAaaaa.','.aaaaAa.','..AAAA..'],
   B:['.A....A.','..A..A..','...AA...','...AA...','..A..A..','.A....A.','cCcCcCcC'].concat(rep('........',5)),R:rep('....',6).concat(['cCcC'],rep('....',5)),L:'R',T:null,D:null},
  arm:lim(['VVVV','VYVV','VVVV','vVVV','VVVV','vvvv','ssss','sKss','ssss','ssss','SsSs','SSSS']),
  sleeve:lim(rep('....',4).concat(['YYYY','VvVV'],rep('....',6))),
  leg:lim(['PPPP','PPPP','PpPP','PPPP','PPpP','pPPp','PPPP','PPPP','PPPP','pppp','bbbb','nnnn']),
  pants:lim(rep('....',6).concat(['xxxx','XxXx','xXxX','XxXx','BBBB','nbbn']))};
 pxScene(()=>{pxSkin(P,K,m);
  if(hat===0){pxBox(P.HG,-4.25,31.75,-4.25,8.5,2.6,8.5,(f,u,v,W,H)=>f==='T'?((u*3+v)%5===0?m.y:m.Z):v===0?m.R:v===H-1?m.y:(u+v)%3===0?m.z:m.Z,{mat:0,grid:[8,3,8]});
   pxBox(P.HG,-6.5,31.2,-6.5,13,.8,13,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?m.z:(u*5+v*3)%11===0?m.y:m.Z):m.z,{mat:0,grid:[13,1,13]})}
  if(hat===1)pxBox(P.HG,-3,29.7,4.5,6,.8,2,f=>f==='T'?m.l:m.k,{mat:0,grid:[6,1,2]});
  if(hat===3)pxBox(P.HG,-4.4,29.4,-4.4,8.8,1.3,8.8,(f,u,_v,_W,_H)=>f==='T'||f==='D'?null:(u%3===1?m.F:m.R),{mat:0,grid:[8,1,8]});
  /* belt pouch, wicker basket with the day's load */
  pxBox(P.G,-4.9,8.6,2.2,2.6,3,1.3,(f,u,v,W,H)=>v===H-1?m.B:(f==='F'&&u===1&&v===1?m.g:m.b),{mat:0,grid:[3,3,1]});
  pxBox(P.G,-3.2,13.4,-5.8,6.4,7.2,3.6,(f,u,v,W,H)=>f==='T'?((u+v)%3===0?m.F:m.f):f==='D'?m.i:v===H-1?m.i:(v%2?m.j:(u%3===1?m.i:m.J)),{mat:0,grid:[6,7,3]})});
 pxArms(P,T=>pxSkinArms(T,K,m));
}

/* ---------------- ARCHER: deep hood with a hanging tip, cowl over the shoulders with a kingdom-colour hem, laced leather jerkin, bracers, quiver, belt pouch ---------------- */
export function px2Archer(P){const m=mp({h:'#6b3e1e',r:'#4a2a14',H:'#8e5a30',e:'#3fa65a',l:'#62b45a',d:'#3f8a3e',q:'#2f6a30',Q:'#214a24',P:'#4e3a26',p:'#3a2a1a',y:'#ecbd3a',f:'#c8a070',R:'#d03a2e'},thp());
 const K=pxRankK({hatMat:7,jacketMat:0,
  head:pxHead2(),
  hat:{F:['llllllll','dddddddd','dq....qd','d......d','d......d','d......d','q......q','qq....qq'],
   R:['llllllll','dddddddd','dddddddd','qddddddd','.ddddddd','.qdddddd','..qddddq','..qqqqqq'],L:'~R',
   B:['llllllll','dddldddd','dddldddd','dddqdddd','dddqdddd','dddqdddd','qddqdddq','qqqqqqqq'],
   T:['dddddddd','dldddldd','dddddddd','ddldddld','dddddddd','dldddddd','ddddlddd','llllllll']},
  body:fc(rep('dddddddd',10).concat(rep('qqqqqqqq',2))),
  jacket:{F:['.BBBBBn.','bBbNNnBb','bbbbnbbb','bbbnNbbb','bbnbbbbb','bnbNNbbb','nbbbbbbn','nnnyynnn','bBbbbbBb','bbbbbbbb','bbNbbNbb','nb.bb.bn'],
   R:['.bbb','Bbbb','bbbb','bbbb','bbbb','bbbb','nbbb','nnnn','bbbb','bbbb','bbbb','nbbn'],L:'~R',
   B:['.bbnbbb.','bbbbnbbb','bbbbbnbb','bbbbbbnb','bbbbbbbn','bbbbbbbb','nbbbbbbn','nnnnnnnn','bBbbbbBb','bbbbbbbb','bbNbbNbb','nb.bb.bn'],T:['bbbbbbbb','b......b','b......b','bbbbbbbb'],D:null},
  arm:lim(['dddd','dldd','dddd','qddd','dddd','qqqq','ssss','sKss','ssss','ssss','SsSs','SSSS']),
  sleeve:lim(rep('....',5).concat(['dddd','....','BBBB','bNbb','bybb','nnnn','....']),null,{T:null,D:null}),
  leg:lim(['PPPP','PPPP','PpPP','PPPP','PPPP','pPPp','PPPP','bbbb','bbbb','bbbb','bbbb','nnnn']),
  pants:lim(rep('....',6).concat(['BBBB','bbbb','bNbb','bbbb','bbbb','nNNn']),null,{T:null})},'arm',[3,1,5],['F'],'y');
 pxScene(()=>{pxSkin(P,K,m);
  /* hood tip hanging behind the head */
  pxBox(P.HG,-2,26.8,-6.3,4,4.2,1.9,(f,u,v,_W,_H)=>f==='T'?m.l:v===0?m.q:m.d,{mat:7,grid:[4,4,2]});pxBox(P.HG,-1,25.2,-7.3,2,2.6,1.5,(f,u,v,_W,_H)=>v===0?m.Q:m.q,{mat:7,grid:[2,3,1]});
  /* cowl: wide shoulders, kingdom hem, gold clasp */
  pxBox(P.G,-5.4,20.6,-3,10.8,3.7,6,(f,u,v,W,H)=>f==='T'?((u+v)%4===0?m.l:m.d):f==='D'?m.Q:v===0?m.U:(f==='F'&&v===2&&(u===5))?m.y:v===H-1?m.l:(u+v)%5===0?m.q:m.d,{mat:7,grid:[11,4,6]});
  /* quiver across the back, arrows fletched white and kingdom colour */
  pxRot(P.G,T=>{pxBox(T,.6,13,-5.3,3,8.5,2.6,pxPaint({F:['BBB','bbb','bnb','bbb','bbb','byb','yyy','nnn'],B:'F',R:['BB','bb','bb','bb','bb','bb','yy','nn'],L:'R',T:['NNN','NNN'],D:['nnn','nnn']},m),{mat:0,grid:[3,8,2]});
   pxBox(T,.8,21.5,-4.7,2.6,2,1.4,pxPaint({F:['wUw','ffR'],B:['UwU','fff'],R:['w','f'],L:['U','f'],T:['wUw'],D:['fff']},m),{mat:0,grid:[3,2,1]})},[0,0,-.32],[2,17,-4]);
  pxBox(P.G,2.9,9,2.2,2.2,2.8,1.2,(f,u,v,W,H)=>v===H-1?m.B:m.b,{mat:0,grid:[2,3,1]})});
 pxArms(P,T=>pxSkinArms(T,K,m));
}

/* ---------------- KNIGHT: great helm with a gold cross and a crest, mail under steel plates, kingdom tabard with a gold cross, double pauldrons, fauld ---------------- */
export function px2Knight(P,AL){const m=mp({x:'#2e3138',y:'#474b55',R:'#c0392b',Q:'#8a2a20'},thp());
 const K=pxRankK({hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,head:0,body:0,
  hat:{F:['45555554','34444443','333gG333','000gG000','233gG332','2313g132','2233g322','12222221'],
   R:['45555554','34444443','33333334','00333333','23333333','21333332','22333322','11222221'],L:'~R',
   B:['45555554','34445443','33345333','33345333','23345332','23345332','22345322','11222211'],
   T:['34444443','45555554','455gg554','45gGGg54','45gGGg54','455gg554','45555554','34444443'],D:rep('11111111',8)},
  jacket:{F:['54444445','4tUUUUt4','3tUggUt3','3tggggt3','3tUggUt3','2tUggUt2','2tUUUUt2','nbbGGbbn','3tUUUUt3','4tUTTUt4','3tTTTTt3','2tt11tt2'],
   R:['4444','3443','3333','3333','2332','2222','2222','bbbn','3333','4444','3333','2222'],L:'~R',
   B:['54444445','4tUUUUt4','3tUUUUt3','3tUYYUt3','3tUUUUt3','2tUUUUt2','2tUUUUt2','nbbbbbbn','3tUUUUt3','4tUTTUt4','3tTTTTt3','2tt11tt2'],
   T:['44444444','45555554','45555554','54444445'],D:rep('11111111',4)},
  arm:MAILA,
  sleeve:lim(['5555','4444','3443','2332','....','5445','3443','....','4444','3443','4554','3232'],['4444','3333','2332','2222','....','4444','3333','....','3333','2332','3443','2121'],{T:['5555','5445','5445','5555'],D:rep('1111',4)}),
  leg:MAILL,
  pants:lim(['4444','3333','2332','....','5555','4554','3443','....','4334','3443','bBBb','2332'],['3333','2222','1221','....','3333','3333','2222','....','3333','2222','bbbb','1221'],{T:rep('3333',4),D:rep('1111',4)})},'sleeve',[4,6,8],['F','R','B'],'G');
 pxScene(()=>{pxSkin(P,K,m);
  pxBox(P.HG,-.6,32.5,-4.25,1.2,1.8,8.5,(f,u,v,_W,_H)=>f==='T'?m.R:v===0?m.Q:m.R,{mat:4,grid:[1,2,8]});
  if(AL>=2){pxBox(P.HG,-.6,34.3,-3,1.2,2,4.4,pxPaint({F:['Y','U'],B:['T','t'],R:['YUUU','TTTT'],L:'R',T:['Y','U','U','U'],D:['t','t','t','t']},m),{mat:7,grid:[1,2,4]});pxBox(P.HG,-.6,32,-5.8,1.2,3,2,pxPaint({F:['U','T','t'],B:'F',R:['UT','TT','tt'],L:'R',T:['U','T'],D:['t','t']},m),{mat:7,grid:[1,3,2]})}
  fauld(P,m,m[5],m[4],m[3],m.U,m.t,AL>=1?m.g:m[2])});
 pxArms(P,T=>{pxSkinArms(T,K,m);pauldrons(T,m,m[5],m[4],m[3],AL>=1?m.o:m[2],AL>=1?m.g:m[3])});
}

/* ---------------- SPEARMAN: wide kettle helmet, padded jack quilted in the kingdom colour, arming collar, baldric and belt, bedroll on the back, leather gloves and boots.
   No shield and no plate: armour research adds steel spaulders (1) and a gold band on the helmet (2). Extra cubes: brim, crown, collar, bedroll. ---------------- */
export function px2Spearman(P,AL){const m=mp({h:'#5a3a1a',r:'#3a2410',H:'#7a5226',a:'#ddd0ae',A:'#b4a682',y:'#d9a83a',P:'#5a4a36',p:'#43382a'},thp());
 const Q8=Array.from({length:12},(_,i)=>i%4===3?'TTtTTtTT':'UUtUUtUU'),Q4=Q8.map(r=>r.slice(0,4));
 const K={hatMat:4,jacketMat:0,sleeveMat:AL>=1?4:0,
  head:pxHead2({beard:1}),
  hat:{F:['45555554','34444443','23333332','........','........','........','........','........'],R:'F',L:'F',B:'F',T:['34444443','45555554','45444454','45455454','45455454','45444454','45555554','34444443'],D:null},
  body:fc(Q8,{R:Q4}),
  jacket:{F:['.a2332a.','......b.','.....b..','....b...','...b....','..b.....','nbbyybbn','........','........','UUtUUtUU','TTtTTtTT','tt.tt.tt'],
   R:['a23a','....','....','....','....','....','nbbn','....','....','UtUU','TtTT','tttt'],L:'~R',
   B:['.a2332a.','.b......','..b.....','...b....','....b...','.....b..','nbbbbbbn','........','........','UUtUUtUU','TTtTTtTT','tt.tt.tt'],T:['aaaaaaaa','a222222a','a222222a','aaaaaaaa'],D:null},
  arm:lim(Q4.slice(0,8).concat(['AAAA','bBbb','bbbb','nnnn'])),
  sleeve:AL>=1?lim(['5555','4444','3333'].concat(rep('....',9)),['4444','3333','2222'].concat(rep('....',9)),{T:rep('5555',4),D:null}):null,
  leg:lim(['PPPP','PPPP','PpPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP']),
  pants:lim(rep('....',6).concat(['BBBB','bBbB','bbbb','bNbb','bbbb','nnnn']),null,{T:null})};
 pxScene(()=>{pxSkin(P,K,m);
  /* kettle helmet: wide brim, low crown */
  pxBox(P.HG,-6.5,29.2,-6.5,13,.8,13,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?m[5]:m[4]):(f==='D'?m[1]:m[2]),{mat:4,grid:[13,1,13]});
  pxBox(P.HG,-3,32.5,-3,6,.8,6,(f,_u,_v,_W,_H)=>f==='T'?m[5]:m[3],{mat:4,grid:[6,1,6]});
  if(AL>=2)pxBox(P.HG,-4.7,30,-4.7,9.4,.8,9.4,(f,u,_v,_W,_H)=>f==='T'?m.G:(u%3===1?m.G:m.g),{mat:4,grid:[9,1,9]});
  /* padded arming collar */
  pxBox(P.G,-4.8,22.5,-2.8,9.6,1.8,5.6,(f,u,v,_W,_H)=>f==='T'?m.a:f==='D'?m.A:v===0?m.T:(u%2?m.a:m.A),{mat:0,grid:[10,2,6]});
  /* bedroll strapped across the back */
  pxBox(P.G,-3.5,13.4,-4.4,7,2.2,2.2,(f,u,v,_W,_H)=>(f==='B'||f==='T'||f==='D')&&(u===1||u===5)?m.n:f==='T'?m.a:f==='D'?m.A:(v===0?m.A:m.a),{mat:0,grid:[7,2,2]})});
 pxArms(P,T=>{pxSkinArms(T,K,m);if(AL>=1)pxBox(T,-2.8,-1.6,-2.8,5.6,2.4,5.6,bev(m[5],m[4],m[2]),{mat:4,grid:[5,2,5]})});
}

/* ---------------- CAPTAIN: winged champion helm, gilded plate, red officer sash, kingdom skirt, gold pauldrons (cape and plume: animated parts as before) ---------------- */
export function px2Captain(P){const m=mp({h:'#4a2c16',r:'#2e1a0c',H:'#6a4222',R:'#b8323c',Q:'#de5a62',X:'#7a1a24',a:'#fff0b8',x:'#2e3138',y:'#474b55',f:'#dcd6c6'},thp());
 const K={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,body:0,
  head:pxHead2({beard:1}),
  hat:{F:['45555554','3gGGGGg3','4......4','3......3','3......3','3......3','33....33','43....34'],
   R:['45555554','3ggggggg','43333333','.4333333','.3333333','..333332','..333322','...22222'],L:'~R',
   B:['45555554','3ggggggg','33343333','33343333','23343332','23343332','22343322','12222221'],
   T:['34444443','45555554','455gg554','45gGGg54','45gGGg54','455gg554','45555554','34444443'],D:null},
  jacket:{F:['oGGGGGGo','gRQGaGGg','gGRQGGGg','gGGRQGGg','ogGGRQgo','ooggGRQo','nbbGGbRn','TUUUUUUT','tUYUUYUt','tUUTTUUt','tTUttUTt','ttV11Vtt'],
   R:['oGGg','gGGg','gGgg','gggg','oggg','oooo','nbbn','TUUU','tUUU','tUUU','tTTT','tttt'],L:'~R',
   B:['oGGGGGGo','gGGggGGg','gGggggGg','gggggggg','oggggggo','oooggooo','nbbbbbbn','TUUUUUUT','tUUUUUUt','tUUTTUUt','tTUttUTt','ttV11Vtt'],
   T:['oggggggo','gGGGGGGg','gGGGGGGg','oggggggo'],D:rep('11111111',4)},
  arm:MAILA,
  sleeve:lim(['GGGG','gGGg','oggo','....','GaGG','gGGg','oggo','....','5555','3443','gGGg','2323'],['gggg','oggo','oooo','....','gggg','oggo','oooo','....','3333','2222','oggo','1212'],{T:['GGGG','GaaG','GaaG','GGGG'],D:rep('1111',4)}),
  leg:MAILL,
  pants:lim(['UUUU','UYUU','TUUT','....','gGGg','oggo','3443','....','4554','3443','2332','1221'],['TTTT','TTTT','tTTt','....','gggg','oooo','3333','....','3333','2222','1221','1111'],{T:rep('UUUU',4),D:rep('1111',4)})};
 pxScene(()=>{pxSkin(P,K,m);
  /* helm wings, swept back */
  for(const s of[-1,1])pxRot(P.HG,G=>cut(G,s>0?['...ww','..wwf','.wwwf','gwwf.','Gwf..','gg...']:['ww...','fww..','fwww.','.fwwg','..fwG','...gg'],m,{x:s>0?4.3:-4.3-5.5,y:27.6,z:0,ps:1.1,d:.9,mat:0}),[0,s*.62,0],[s*4.3,30,0])});
 pxArms(P,T=>{pxSkinArms(T,K,m);pauldrons(T,m,m.a,m.G,m.g,m.X,m.R)});
}

/* ---------------- BANNERMAN: kettle hat, quilted gambeson, kingdom tabard with a white cross, kingdom cowl with a gold hem, leather gloves, signal horn ---------------- */
export function px2Bannerman(P){const m=mp({h:'#5a3a1a',r:'#3a2410',H:'#7a5226',a:'#ddd0ae',A:'#b4a682',y:'#d9a83a',P:'#433824',p:'#2e2618',i:'#efe6d0',I:'#c8bc9c'},thp());
 const Q8=Array.from({length:12},(_,i)=>i%2?'aaAaaaAa':'aAaaaAaa'),Q4=Q8.map(r=>r.slice(0,4));
 const K={hatMat:4,jacketMat:0,sleeveMat:4,
  head:pxHead2(),
  hat:{F:['45555554','33333333','22222222','........','........','........','........','........'],R:'F',L:'F',B:'F',T:['34444443','45555554','45444454','45455454','45455454','45444454','45555554','34444443'],D:null},
  body:fc(Q8,{R:Q4}),
  jacket:{F:['aTUUUUTa','aTUWWUTa','aTUWWUTa','aWWWWWWa','aTUWWUTa','aTUWWUTa','nbbyybbn','aTUWWUTa','aTUWWUTa','AtTWWTtA','AttWWttA','AA.tt.AA'],
   R:['aaaa','aAaa','aaAa','aaaa','aAaa','aaAa','nbbn','aaaa','aAaa','aaAa','AaaA','AAAA'],L:'~R',
   B:['aTUUUUTa','aTUUUUTa','aTUUUUTa','aTUYYUTa','aTUUUUTa','aTUUUUTa','nbbbbbbn','aTUUUUTa','aTUUUUTa','AtTUUTtA','AttTTttA','AA.tt.AA'],T:['aaaaaaaa','aAaaaaAa','aaaaaaaa','aaaaaaaa'],D:null},
  arm:lim(Q4.slice(0,8).concat(['AAAA','bBbb','bbbb','nnnn'])),
  sleeve:lim(rep('....',4).concat(['5555','3443','3333','2222'],rep('....',4)),rep('....',4).concat(['3333','2222','2222','1111'],rep('....',4)),{T:null,D:null}),
  leg:lim(['PPPP','PPPP','PpPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP']),
  pants:lim(rep('....',6).concat(['BBBB','bBbB','bbbb','bNbb','bbbb','nnnn']),null,{T:null})};
 pxScene(()=>{pxSkin(P,K,m);
  pxBox(P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?m[5]:m[4]):(f==='D'?m[1]:m[2]),{mat:4,grid:[12,1,12]});
  pxBox(P.G,-5.4,20.7,-3,10.8,3.6,6,(f,u,v,W,H)=>f==='T'?m.U:f==='D'?m.V:v===0?m.g:v===1?m.t:v===H-1?m.Y:(f==='F'&&u===5&&v===2)?m.G:m.U,{mat:7,grid:[11,4,6]});
  /* horn at the hip */
  pxBox(P.G,-5.6,8.3,-.4,1.4,1.5,3.6,(f,u,_v,_W,_H)=>f==='F'?m.N:(f==='R'||f==='L')&&(u===1)?m.y:m.i,{mat:0,grid:[1,1,4]});pxBox(P.G,-5.6,9.8,-1.6,1.4,2.2,1.4,(f,u,v,W,H)=>v===H-1?m.y:m.I,{mat:0,grid:[1,2,1]})});
 pxArms(P,T=>pxSkinArms(T,K,m));
}

/* ---------------- GUNNERS: kingdom doublet with brass buttons, leather apron, bandolier, felt hat with a wide brim and a white feather, powder horn ---------------- */
export function px2Gunner(P){const m=mp({h:'#3a2410',r:'#24160a',H:'#5a3a1c',y:'#d9a83a',z:'#f2cc66',f:'#f2efe6',F:'#cfcabc',P:'#3e3a36',p:'#2a2622',k:'#2e2a2c',l:'#4a4448',i:'#efe6d0'},thp());
 const K={jacketMat:0,
  head:pxHead2({mid:'shhhhhhs',low:'sSsmmsSs'}),
  hat:{F:['YUUUUUUY','UUUUUUUU','yyyyyyyy','........','........','........','........','........'],R:'F',L:'F',B:'F',T:['UUUUUUUU','UYYUUUUU','UYUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU'],D:null},
  body:fc(['UUUccUUU','UYUUUUYU','UUUyUUUU','tUUUUUUt','UUUyUUUU','tUUUUUUt','UUUyUUUU','tUUUUUUt','tUUyUUUt','tUUUUUUt','ttUUUUtt','tttttttt'],{B:['UUUUUUUU','UYUUUUYU','UUUUUUUU','tUUUUUUt','UUUUUUUU','tUUUUUUt','UUUUUUUU','tUUUUUUt','tUUUUUUt','tUUUUUUt','ttUUUUtt','tttttttt']}),
  jacket:{F:['......b.','.....by.','....bb..','...by...','..bb....','nnnyynnn','.BBBBBB.','.BbbbbB.','.BbbbbB.','.BbbbbB.','.BbnnbB.','..nnnn..'],
   R:rep('....',5).concat(['nnnn'],rep('....',6)),L:'R',B:['.b......','..b.....','...b....','....b...','.....b..','nnnnnnnn'].concat(rep('........',6)),T:null,D:null},
  arm:lim(['UUUU','UYUU','UUUU','tUUU','UUUU','UUUU','yUUy','tttt','ssss','sKss','SsSs','SSSS']),
  leg:lim(['PPPP','PPPP','PpPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP']),
  pants:lim(rep('....',7).concat(['BBBB','bNbb','bbbb','bbbb','nnnn']),null,{T:null})};
 pxScene(()=>{pxSkin(P,K,m);
  pxBox(P.HG,-5.7,29.5,-5.7,11.4,.8,11.4,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?m.l:m.k):m.k,{mat:0,grid:[11,1,11]});
  pxBox(P.HG,3.4,30.4,-1.2,1.1,4.2,1.1,f=>f==='D'?m.F:m.f,{mat:0,grid:[1,4,1]});pxBox(P.HG,3.4,33.8,-2.7,1.1,2,1.6,f=>f==='T'?m.f:m.F,{mat:0,grid:[1,2,2]});
  /* powder horn behind the hip */
  pxBox(P.G,3.3,8.2,-3.6,1.6,3.6,1.6,(f,u,v,W,H)=>v===H-1?m.y:v===0?m.N:m.i,{mat:0,grid:[1,4,1]})});
 pxArms(P,T=>pxSkinArms(T,K,m));
}

/* ---------------- ROYAL GUARD: kingdom-colour plate, crimson tabard with the royal sun, closed helm with a gold band and a tall crest, double pauldrons, fauld ---------------- */
export function px2Guard(P){const m=mp({x:'#2e3138',y:'#474b55',R:'#a62832',r:'#7a1a24',Q:'#c94450'},thp());
 const K={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,head:0,body:0,
  hat:{F:['YUUUUUUY','UTTUUTTU','oggGGggo','TTTTTTTT','t000000t','t344443t','t3g33g3t','tt2222tt'],
   R:['YUUUUUUU','TTTTTTTU','ggggggGo','TTTTTTTT','00TTTTTT','43tTTTTT','32tTTTTt','2ttttttt'],L:'~R',
   B:['YUUUUUUY','TTTTTTTT','gggggggg','TTTTTTTT','TTTTTTTT','tTTTTTTt','tTTTTTTt','tttttttt'],
   T:['TUUUUUUT','UYYYYYYU','UYTggTYU','UYTggTYU','UYTggTYU','UYTggTYU','UYYYYYYU','TUUUUUUT'],D:rep('tttttttt',8)},
  jacket:{F:['YUUUUUUY','UtrRRrtU','TtRgGRtT','TtgGGgtT','TtRgGRtT','TtRRRRtT','TtrRRrtT','nbbGGbbn','TtRQQRtT','UtRRRRtU','TtRRRRtT','ttggggtt'],
   R:['YUUU','TTTT','TTTT','TTTT','TTTT','tTTT','tttt','bbbn','TTTT','UUUU','TTTT','tttt'],L:'~R',
   B:['YUUUUUUY','TTrrrrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TtrRRrtT','nbbbbbbn','TtrRRrtT','UtrRRrtU','TtrRRrtT','ttggggtt'],
   T:['UUUUUUUU','UYYYYYYU','UYYYYYYU','YUUUUUUY'],D:rep('tttttttt',4)},
  arm:MAILA,
  sleeve:lim(['YUUU','TTTT','TTTT','oggo','....','YUUU','TttT','....','5555','3443','GggG','3232'],['TTTT','TTTT','tTTt','oggo','....','UUUU','TTTT','....','3333','2332','oggo','2121'],{T:['UUUU','UYYU','UYYU','UUUU'],D:rep('1111',4)}),
  leg:MAILL,
  pants:lim(['TTTT','TUTT','tTTt','....','5555','4554','3443','....','YUUU','TttT','bBBb','2332'],['TTTT','TTTT','tTTt','....','3333','3333','2222','....','UUUU','TTTT','bbbb','1221'],{T:rep('TTTT',4),D:rep('1111',4)})};
 pxScene(()=>{pxSkin(P,K,m);
  pxBox(P.HG,-.6,32.5,-2.5,1.2,3.4,3,pxPaint({F:['Q','R','R','r'],B:'F',R:['QQQ','QRR','RRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},m),{mat:7,grid:[1,4,3]});
  pxBox(P.HG,-.6,31,-5.4,1.2,3.8,2.9,pxPaint({F:['R','R','r','r'],B:'F',R:['QRR','RRR','rRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},m),{mat:7,grid:[1,4,3]});
  fauld(P,m,m.Y,m.U,m.T,m.R,m.r,m.g)});
 pxArms(P,T=>{pxSkinArms(T,K,m);pauldrons(T,m,m.Y,m.U,m.T,m.o,m.g)});
}

/* ---------------- KING: the current royal skin (crown, great helm, ermine), shaded in tones, plus a gilded fauld and the lame under each pauldron ---------------- */
export function px2King(P,AL){const m=mp({R:'#a62832',X:'#6c111b'},thp());pxKing(P,AL);
 pxScene(()=>fauld(P,m,m.G,m.U,m.T,m.R,m.X,m.g));
 pxArms(P,T=>pxBox(T,-2.85,-3.3,-2.85,5.7,2,5.7,(f,u,v,_W,_H)=>f==='T'?m[4]:f==='D'?m[1]:v===0?m.g:m[3],{mat:4,grid:[5,2,5]}));
}

export const PX2={peasant:px2Peasant,archer:px2Archer,knight:px2Knight,spearman:px2Spearman,captain:px2Captain,bannerman:px2Bannerman,gunner:px2Gunner,gunner2:px2Gunner,guard:px2Guard,king:px2King,
 scout:pxScout,engineer:pxEngineer,envoy:pxEnvoy};
