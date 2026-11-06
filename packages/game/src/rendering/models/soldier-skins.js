import { PD, PDP, pxArms, pxBox, PXDK, PXLE, pxRot, pxScene, teamPal } from './pixel-geometry.js';
import { zombiesState } from './zombies.js';
import { thp } from '../../ui/kingdom-theme.js';

/* ---- faces: skin, eyes, brows, hair; hair styles: 0 short, 1 fringe, 2 long, 3 none ---- */
const SKINS=[['#a8664c','#c98262','#e8a684'],['#8f5a40','#b57452','#d4946e'],['#6e4430','#93603f','#b07a54'],['#b27a5c','#d69c78','#f0bc96']];

function pxHead(P,o){const Sk=PDP(SKINS[o.skin||0]),Hr=o.hair?PDP(o.hair):null,st=o.hs||0,EY=PD(o.eye||'#3fa65a'),WH=PD('#f4f4f4'),BR=Hr?Hr[0]:PD('#4a3020'),MO=PD('#8e4a3c'),Bd=o.beard?PDP(o.beard):null;
 pxBox(P.HG,-4,24,-4,8,8,8,(f,u,v,W,H)=>{
  if(f==='T')return Hr?((u+v)%3===0?Hr[2]:Hr[1]):Sk[1];if(f==='D')return Sk[0];
  if(f==='F'){if(Hr){if(v===7)return Hr[1];if(v===6&&(st===1?(u!==5):(u<=1||u>=6||u===3)))return u===3?Hr[2]:Hr[1];if(v===5&&(u===0||u===7)&&st!==3)return Hr[0]}
   if(v===4&&(u===1||u===2||u===5||u===6))return BR;if(v===3){if(u===1||u===6)return WH;if(u===2||u===5)return EY}
   if(Bd&&v<=2&&!(v>=1&&(u===3||u===4))&&!(v===2&&u>=2&&u<=5))return v===0?Bd[0]:Bd[1];
   if(v===2&&(u===3||u===4))return Sk[1];if(v===1&&(u===3||u===4))return MO;return v===0?Sk[1]:Sk[2]}
  const back=(f==='B')||(f==='R'&&u>=4)||(f==='L'&&u<=3);
  if(Hr){if(v>=6)return Hr[1];if(back&&v>=(st===2?1:3))return v===3&&st!==2?Hr[0]:Hr[1];if(st===2&&(f==='R'?u>=2:f==='L'?u<=5:false)&&v>=2)return Hr[1]}
  if((f==='R'&&u===3||f==='L'&&u===4)&&v===3)return Sk[0];return Sk[1]},{mat:0})}

/* ---- the body underneath: shirt (sleeves), bare forearms, trousers, boots ---- */
function pxBody(P,o){const Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),Pa=PDP(o.pants||['#1d2a42','#2a3b5c','#344a72']),Bt=o.boots?PDP(o.boots):PXLE;
 pxBox(P.G,-4,12,-2,8,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sh[0];if(v===H-1)return Sh[3];if(v<=1)return Sh[1];return Sh[2]},{mat:0});
 pxBox(P.LG,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Pa[2];if(f==='D')return Bt[0];if(v<=3)return v===3?Bt[3]:(v===0?Bt[1]:Bt[2]);return v===4?Pa[0]:Pa[1+(v>9?1:0)]},{mat:0});
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>PXDK,{only:true})}

function pxArm0(T,o){const Sk=PDP(SKINS[o.skin||0]),Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),bare=o.bare!==false,sl=o.sleeve||6;
 pxBox(T,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sk[0];if(!bare||v>=12-sl)return v===12-sl?Sh[1]:Sh[2];return v<=1?Sk[1]:Sk[2]},{mat:0})}


const pE=(u,v,W,H)=>Math.min(u,v,W-1-u,H-1-v);

/* ================= BLOCKBENCH-STYLE SKINS =================
   Each unit is the plain Minecraft player model: six base cubes and six outer-layer cubes (hat +0.5px, jacket / sleeves /
   trousers +0.25px, texture kept on the 64x64 grid, '.' = transparent so the base layer shows through), plus only a few
   extra cubes (crest, pauldrons, brim, quiver). The detail lives in the pixel art below, one string per row, top row first.
   A face given as '~R' is the mirror of face R; 'F' alone reuses face F. */
export function pxPaint(spec,map){return(f,u,v,W,H)=>{let s=spec&&spec[f];if(!s)return null;let mir=false;if(typeof s==='string'){mir=s[0]==='~';s=spec[mir?s.slice(1):s]}
 if(typeof s==='function')return s(u,v,W,H);const row=s[H-1-v];if(!row)return null;const c=row[mir?W-1-u:u];if(c===undefined||c==='.')return null;const col=map[c];return col===undefined?null:col}}

export function pxSkin(P,K,map,o){o=o||{};const B=(Gx,x,y,z,w,h,d,spec,g,m,ao)=>{if(spec)pxBox(Gx,x,y,z,w,h,d,pxPaint(spec,map),{mat:m||0,grid:g,ao:ao!==false})};
 B(P.HG,-4,24,-4,8,8,8,K.head,null,0);B(P.HG,-4.5,23.5,-4.5,9,9,9,K.hat,[8,8,8],K.hatMat||0,false);
 B(P.G,-4,12,-2,8,12,4,K.body,null,0);B(P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,K.jacket,[8,12,4],K.jacketMat||0,false);
 B(P.LG,-2,-12,-2,4,12,4,K.leg,null,0);B(P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,K.pants,[4,12,4],K.pantsMat||0,false);
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true})}

export function pxSkinArms(T,K,map){if(K.arm)pxBox(T,-2,-12,-2,4,12,4,pxPaint(K.arm,map),{mat:0});if(K.sleeve)pxBox(T,-2.25,-12.25,-2.25,4.5,12.5,4.5,pxPaint(K.sleeve,map),{mat:K.sleeveMat||0,grid:[4,12,4],ao:false})}

/* colour maps: letters to display colours, turned into albedo once */
export const pxMap=(o,tm)=>{const m={};for(const k in o)m[k]=PD(o[k]);if(tm){const T=teamPal(tm);m.V=T[0];m.t=T[1];m.T=T[2];m.U=T[3];m.Y=T[4]}return m};

/* ---------------- KNIGHT ---------------- */
const SK_KNIGHT={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
 head:{F:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss'],B:'F',R:'F',L:'F',T:'F',D:'F'},
 hat:{F:['hhhhhhhh','llllllll','mmmGGmmm','kkkGGkkk','mmmGGmmm','mmmggmmm','dmdggdmd','dddddddd'],
  R:['hhhhhhhh','llllllll','mmmmmmml','kkmmGmmm','dmmmmmmm','mmmmmmmm','mmmmmmmd','dddddddd'],L:'~R',
  B:['hhhhhhhh','lllhllll','mmmlmmmm','mmmlmmmm','mmmlmmmm','dmmlmmmd','dmmlmmmd','dddddddd'],
  T:['lhhhhhhl','hlmggmlh','hmmggmmh','hmmggmmh','hmmggmmh','hmmggmmh','hlmggmlh','lhhGGhhl']},
 body:{F:['xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx'],B:'F',R:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],L:'R',T:['dddddddd','dddddddd','dddddddd','dddddddd'],D:'T'},
 jacket:{F:['whhhhhhw','hlmmmmlh','lmtTTtml','lmtGGtml','lmGGggml','dmtggtmd','dmtTTtmd','nbbGGbbn','dltTTtld','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  R:['hhhh','llll','mmml','mmmm','mmmm','dmmm','dddd','bbbn','mmmm','hhhh','mmmm','dddd'],L:'~R',
  B:['hhhhhhhh','llllllll','mmtTTtmm','mmtTTtmm','dmtTTtmd','dmtTTtmd','dmtTTtmd','nbbbbbbn','dmtTTtmd','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  T:['hhhhhhhh','hllllllh','hllllllh','whhhhhhw']},
 arm:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 sleeve:{F:['hhhh','llll','mlmm','dmmd','....','whhw','lmml','....','hhhh','lmml','hhhh','lmlm'],
  R:['hhhh','llll','mmmm','dmmd','....','hhhh','lmml','....','hhhh','mmmm','hhhh','mdmd'],L:'R',
  B:['llll','mmmm','dmmd','dddd','....','hhhh','mmmm','....','llll','mmmm','llll','dmdm'],T:['hhhh','hllh','hllh','hhhh'],D:['dddd','dddd','dddd','dddd']},
 leg:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 pants:{F:['llll','mmmm','dmmd','....','hhhh','hwwh','lmml','....','hllh','lmml','bBBb','dmmd'],
  R:['llll','mmmm','dmmm','....','hhhh','hhhl','lmml','....','hlll','lmml','bBBb','dmmd'],L:'~R',
  B:['llll','mmmm','dmmd','....','llll','mmmm','dmmd','....','llll','mmmm','bbbb','dddd'],T:['llll','llll','llll','llll'],D:['dddd','dddd','dddd','dddd']}};

export function pxKnight(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262'},thp()),K=SK_KNIGHT,S=n=>map[n];
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.5,32.5,-4.25,1,1,8.5,pxPaint({F:['G'],B:['o'],R:['GGGGGGGG'],L:'R',T:['g','G','G','G','G','G','G','g'],D:['o','o','o','o','o','o','o','o']},{G:map.G,o:map.o,g:map.g}),{mat:4,grid:[1,1,8]});
  if(AL>=2){pxBox(P.HG,-.5,33.5,-3,1,2,4,pxPaint({F:['U','T'],B:['T','t'],R:['UUUU','TTTT'],L:'R',T:['U','U','U','U'],D:['t','t','t','t']},map),{mat:7,grid:[1,2,4]});pxBox(P.HG,-.5,32,-5.6,1,2.5,2,pxPaint({F:['T','T','t'],B:'F',R:['TT','TT','tt'],L:'R',T:['T','T'],D:['t','t']},map),{mat:7,grid:[1,3,2]})}});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3,-1.25,-3,6,3,6,pxPaint({T:['mllllm','lhhhhl','lhwwhl','lhhhhl','lhhhhl','mllllm'],F:['hhhhhh','lmmmml','oggggo'],B:'F',R:'F',L:'F',D:['dddddd','dddddd','dddddd','dddddd','dddddd','dddddd']},map),{mat:4})});
}

/* ---------------- ROYAL GUARD ---------------- */
let SK_GUARD;

export function pxGuard(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262',R:'#a62832',r:'#7a1a24',Q:'#c94450'},thp()),K=SK_GUARD;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.6,32.5,-2.5,1.2,3,3,pxPaint({F:['Q','R','r'],B:'F',R:['QQQ','RRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,3,3]});
  pxBox(P.HG,-.6,31,-5.2,1.2,3.5,2.7,pxPaint({F:['R','R','r','r'],B:'F',R:['QRR','RRR','rRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,4,3]})});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.25,-1.25,-3.25,6.5,3,6.5,pxPaint({T:['TUUUUT','UYYYYU','UYYYYU','UYYYYU','UYYYYU','TUUUUT'],F:['UUUUUU','TTTTTT','oggggo'],B:'F',R:'F',L:'F',D:['tttttt','tttttt','tttttt','tttttt','tttttt','tttttt']},map),{mat:4,grid:[6,3,6]})});
}

/* ---------------- ARCHER ---------------- */
const SK_ARCHER={hatMat:7,jacketMat:0,
 head:{F:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'],
  R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',
  B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
 hat:{F:['GGGGGGGG','gggggggg','g......g','g......g','g......g','g......g','q......q','q......q'],
  R:['GGGGGGGG','gggggggg','gggggggg','qggggggg','qggggggg','qggggggq','qqgggggq','qqqqqqqq'],L:'~R',
  B:['GGGGGGGG','gggggggg','gggggggg','gggqgggg','gggqgggg','gggqgggg','qggqgggq','qqqqqqqq'],
  T:['gggggggg','gGgggGgg','gggggggg','ggGgggGg','gggggggg','gGgggggg','ggggGggg','GGGGGGGG']},
 body:{F:['VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:'F',R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
 jacket:{F:['.bbbbnb.','bBbbbnBb','bbBbnbbb','bbBnbbbb','bbnBbbbb','bnbBbbbb','nbbBbbbn','nnnyynnn','bbbBbbbb','bbbBbbbb','bbbbbbbb','nbbbbbbn'],
  R:['bbbb','bbbb','bbbb','bbbb','bbbb','bbbb','nbbb','nnnn','bbbb','bbbb','bbbb','nnnn'],L:'~R',
  B:['.bbnbbb.','bbbbnbbb','bbbbbnbb','bbbbbbnb','bbbbbbnb','bbbbbbbn','nbbbbbbn','nnnnnnnn','bbbbbbbb','bbbbbbbb','bbbbbbbb','nbbbbbbn'],T:['bbbbbbbb','b......b','b......b','bbbbbbbb']},
 arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
 sleeve:{F:['....','....','....','....','....','VVVV','....','BBBB','bnbb','bybb','nnnn','....'],R:['....','....','....','....','....','VVVV','....','BBBB','bbnb','bbbb','nnnn','....'],L:'R',B:'R',T:null,D:null},
 leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','pPPp','PPPP','bbbb','bbbb','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
 pants:{F:['....','....','....','....','....','....','BBBB','bbbb','bnbb','bbbb','bbbb','nnnn'],R:['....','....','....','....','....','....','BBBB','bbbb','bbnb','bbbb','bbbb','nnnn'],L:'~R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};

export function pxArcher(P,AL){const map=pxMap({s:'#e8a684',S:'#c98262',h:'#6b3e1e',r:'#4a2a14',e:'#3fa65a',w:'#f4f4f4',m:'#8e4a3c',
  G:'#58a852',g:'#3f8a3e',q:'#2f6a30',V:'#3f8a3e',v:'#2f6a30',b:'#86522c',B:'#a96c3c',n:'#5e381c',y:'#ecbd3a',P:'#4e3a26',p:'#3a2a1a'}),K=SK_ARCHER;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-1.5,26.5,-5.75,3,3.5,1.25,pxPaint({F:['ggg','ggg','qqq'],B:['GGG','ggg','qqq'],R:['G','g','q'],L:'R',T:['GGG'],D:['qqq']},map),{mat:7,grid:[3,3,1]});
  pxRot(P.G,T=>{pxBox(T,.6,13,-5.1,3,8.5,2.6,pxPaint({F:['BBB','bbb','bbb','bnb','bbb','bbb','yyy','nnn'],B:'F',R:['BB','bb','bb','bb','bb','bb','yy','nn'],L:'R',T:['nnn','nnn'],D:['nnn','nnn']},map),{mat:0,grid:[3,8,2]});
   pxBox(T,1,21.5,-4.4,2.2,1.4,1.2,pxPaint({F:['wQw','ffr'],B:'F',R:['w','f'],L:'R',T:['wQw'],D:['fff']},{w:PD('#f2f2f2'),Q:PD('#d03a2e'),f:PD('#c8a070'),r:PD('#d03a2e')}),{mat:0,grid:[3,2,1]})},[0,0,-.32],[2,17,-4]);
 });
 pxArms(P,T=>pxSkinArms(T,K,map));
}

/* ---------------- PEASANT (six variants: hat, skin, hair, beard, tunic colour) ---------------- */
export function pxPeasant(P,AL){const pv=zombiesState.ZVAR&&zombiesState.ZVAR.hint==='p'?zombiesState.ZVAR.v%6:0;
 const SH=[['#6e4424','#8a5a32'],['#56642c','#6e7e3e'],['#6a3a32','#7c4a42'],['#3e4e62','#55667a'],['#6e6038','#8a7a52'],['#563a54','#6a4a6a']][pv],
  HR=[['#5a3a1a','#3a2410'],['#2a1a10','#160e08'],['#8a6a3a','#6a5028'],['#1e1a18','#120f0e'],['#a0522d','#6e3216'],['#6a6a62','#4a4a44']][pv],
  SK=[['#e8a684','#c98262'],['#f0bc96','#d69c78'],['#d4946e','#b57452'],['#e8a684','#c98262'],['#b07a54','#93603f'],['#f0bc96','#d69c78']][pv],hat=[0,2,0,1,3,0][pv],beard=pv===3||pv===5;
 const map=pxMap({s:SK[0],S:SK[1],h:HR[0],r:HR[1],e:['#3a78c2','#6b4423','#3fa65a','#6b4423','#3a78c2','#6b4423'][pv],w:'#f4f4f4',m:'#8e4a3c',
  V:SH[1],v:SH[0],a:'#ddd0ae',A:'#b4a682',c:'#c8a868',C:'#a08448',P:'#433824',p:'#2e2618',b:'#86522c',n:'#5e381c',W:'#d4c6aa',X:'#b8a98e',
  Z:'#d4b45c',z:'#a88a42',Y:'#ecd27a',k:'#6a5038',K:'#86684a',q:'#d8cbaa',Q:'#b0a284'});
 const face=beard?['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','rssSSssr','rrrmmrrr','rrrrrrrr']:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'];
 const K={jacketMat:0,
  head:{F:face,R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
  hat:hat===0?null
   :hat===1?{F:['KKKKKKKK','kkkkkkkk','kkkkkkkk','........','........','........','........','........'],R:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkk....','........','........','........','........'],L:'~R',B:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkkkkkk','kkkkkkkk','........','........','........'],T:['KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK']}
   :hat===2?{F:['qqqqqqqq','QqqqqqqQ','Q......Q','........','........','........','........','........'],R:['qqqqqqqq','qqqqqqqq','qqqqqqqq','Qqqqqqqq','.Qqqqqqq','..QQqqqq','.....QQq','........'],L:'~R',B:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','QqqqqqqQ','QQqqqqQQ','..QqqQ..'],T:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq']}
   :null,
  body:{F:['VVVVVVVV','VVVssVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:['VVVVVVVV','VVVVVVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
  jacket:{F:['........','........','........','........','cCcCcCcC','.aaaaaa.','.aaaaaa.','.aAaaAa.','.aaaaaa.','.aaaaaa.','.AaaaaA.','..AAAA..'],R:['....','....','....','....','cCcC','....','....','....','....','....','....','....'],L:'R',B:['........','........','........','........','cCcCcCcC','........','........','........','........','........','........','........'],T:null,D:null},
  arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','ssss','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
  sleeve:{F:['....','....','....','....','....','VVVV','....','....','....','....','....','....'],B:'F',R:'F',L:'F',T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
  pants:{F:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],R:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],L:'R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};
 pxScene(()=>{pxSkin(P,K,map);if(hat===0)pxBox(P.HG,-4.25,31.75,-4.25,8.5,2.25,8.5,pxPaint({F:['YZZZZZZY','zZZZZZZz','kkkkkkkk'],B:'F',R:'F',L:'F',T:['ZZZZZZZZ','ZYZZZZYZ','ZZZZZZZZ','ZZZYZZZZ','ZZZZZZZZ','ZYZZZYZZ','ZZZZZZZZ','ZZZZZZZZ'],D:null},map),{mat:0,grid:[8,3,8]});if(hat===0)pxBox(P.HG,-6,31.25,-6,12,.75,12,pxPaint({T:['zZZZZZZZZZZz','ZZYZZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZYZZZZZZ','ZYZZZZZZZZYZ','ZZZZZZZZZZZZ','ZZZZZZZZZZZZ','ZZZYZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZZZYZZZZ','ZZYZZZZZZZZZ','zZZZZZZZZZZz'],F:['zzzzzzzzzzzz'],B:'F',R:'F',L:'F',D:['zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz']},map),{mat:0})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}

export function initializeSoldierSkins() {
  SK_GUARD = {hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
   head:SK_KNIGHT.head,
   hat:{F:['UUUUUUUU','TTTUUTTT','oggGGggo','TTTTTTTT','kkkkkkkk','tllllllt','tlhllhlt','tddddddt'],
    R:['UUUUUUUU','TTTTTTTU','gggggggo','TTTTTTTT','kkTTTTTT','lltTTTTT','ldtTTTTt','dttttttt'],L:'~R',
    B:['UUUUUUUU','TTTTTTTT','gggggggg','TTTTTTTT','TTTTTTTT','tTTTTTTt','tTTTTTTt','tttttttt'],
    T:['TUUUUUUT','UTTTTTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTTTTTU','TUUUUUUT']},
   body:SK_KNIGHT.body,
   jacket:{F:['UUUUUUUU','TtrRRrtT','TtRgGRtT','TtgGGgtT','TtRgGRtT','TtRRRRtT','TtrRRrtT','nbbGGbbn','TtRRRRtT','UtRRRRtU','TtRRRRtT','ttggggtt'],
    R:['UUUU','TTTT','TTTT','TTTT','TTTT','tTTT','tttt','bbbn','TTTT','UUUU','TTTT','tttt'],L:'~R',
    B:['UUUUUUUU','TTrrrrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TtrRRrtT','nbbbbbbn','TtrRRrtT','UtrRRrtU','TtrRRrtT','ttggggtt'],
    T:['UUUUUUUU','UTTTTTTU','UTTTTTTU','UUUUUUUU']},
   arm:SK_KNIGHT.arm,
   sleeve:{F:['UUUU','TTTT','TTTT','oggo','....','UUUU','TttT','....','hhhh','lmml','GggG','lmlm'],
    R:['UUUU','TTTT','TTTT','oggo','....','UUUU','TTTT','....','hhhh','mmmm','gggo','mdmd'],L:'R',
    B:['TTTT','TTTT','tTTt','oggo','....','UUUU','TTTT','....','llll','mmmm','oggo','dmdm'],T:['UUUU','UTTU','UTTU','UUUU'],D:['dddd','dddd','dddd','dddd']},
   leg:SK_KNIGHT.leg,
   pants:{F:['TTTT','TTTT','tTTt','....','hhhh','hwwh','lmml','....','UUUU','TttT','bBBb','dmmd'],
    R:['TTTT','TTTT','tTTT','....','hhhh','hhhl','lmml','....','UUUU','TTTT','bBBb','dmmd'],L:'~R',
    B:['TTTT','TTTT','tTTt','....','llll','mmmm','dmmd','....','UUUU','TTTT','bbbb','dddd'],T:['TTTT','TTTT','TTTT','TTTT'],D:['dddd','dddd','dddd','dddd']}};
}
