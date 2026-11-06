/* ================= RESTYLE ROUND 2: king, captain, bannerman, gunners, zombies =================
   Same Blockbench manner as the knight / royal guard: the Minecraft player model with an outer layer, a few extra
   cubes, the detail in the pixel art. Steel shades are the digits 0 (darkest) .. 5, gold g G o, leather b B n,
   the team colours V t T U Y come from pxMap. */
const PXF2={s:'#e0a07c',S:'#c27f5c',w:'#f4f4f4',e:'#3a6ec2',m:'#8e4a3c',0:'#141519',1:'#2c2e34',2:'#4a4d55',3:'#6d717a',4:'#949aa3',5:'#c4c8ce',
 g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16'};
const pxMap2=(o,tm)=>pxMap(Object.assign({},PXF2,o),tm);
const rep2=(r,n)=>Array(n).fill(r);
const CH4=Array.from({length:12},(_,i)=>i%2?'2121':'1212'),CH8=CH4.map(r=>r+r);
const FACE2=(mid,low,R)=>({F:['hhhhhhhh','hhhhhhhh','hssssssh','srrssrrs','swessews','sssSSsss',mid||'sssmmsss',low||'ssssssss'],
 R:R||['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:rep2('hhhhhhhh',7).concat(['ssssssss']),T:rep2('hhhhhhhh',8),D:rep2('ssssssss',8)});
/* a pixel cut-out wall of a crown: rows top first, '.' = gap; plane xy (front / back) or yz (sides) */
function pxCut(G,rows,map,o){const H=rows.length,W=rows[0].length;pxSpriteF(G,W,H,(u,v)=>{const c=rows[H-1-v][u];return c==='.'?null:map[c]},o)}
/* ---------------- KING NARAIGE: A open face, beard and crown / B royal great helm under the crown ---------------- */
function pxKing(P,AL){const vr=(window.__KV||'B'),helm=vr==='B',
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
function pxCaptain(P,AL){const map=pxMap2({h:'#4a2c16',r:'#2e1a0c',R:'#b8323c',Q:'#de5a62',X:'#7a1a24'},thp());
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
function pxBannerman(P,AL){const map=pxMap2({h:'#5a3a1a',r:'#3a2410',a:'#ddd0ae',A:'#b4a682',c:'#f2ecdc',y:'#d9a83a',P:'#433824',p:'#2e2618'},thp());
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
function pxGunner(P,AL){const map=pxMap2({h:'#3a2410',r:'#24160a',y:'#d9a83a',z:'#f2cc66',c:'#f2efe6',C:'#cfcabc',P:'#3e3a36',p:'#2a2622'},thp());
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
/* ---------------- gear: the king's sword, the captain's sword, the captain's shield ---------------- */
function pxRoyalSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,60,9,(u,v)=>{const L=60,hw=u<L-10?4:Math.max(0,4-(u-(L-10))*.45),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-12)return u%7===3?RGO[3]:S[0];const n=pxN('K',u>>1,v,5);if(n>.9)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.4,ps:.5,d:1.2});
  gx(G,-.85,-1.6,2.6,1.7,3.2,1.2,pGo);
  gx(G,-.95,-5.2,1.6,1.9,10.4,1.6,pGo);gx(G,-1.1,-6.7,.5,2.2,1.9,2.6,pGo);gx(G,-1.1,4.8,.5,2.2,1.9,2.6,pGo);
  gem(G,.9,-.7,1.7,.4,1.4,1.4,RRU);gem(G,-1.3,-.7,1.7,.4,1.4,1.4,RRU);
  gx(G,-.75,-.75,-5.6,1.5,1.5,6.6,pWrap(RRU),{mat:0});gx(G,-.95,-.95,-3,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.3,1.9,1.9,.7,pGo);
  gx(G,-1.1,-1.6,-8.2,2.2,3.2,2.6,pGo);gem(G,1.1,-.6,-7.6,.35,1.2,1.2,RRU);gem(G,-1.45,-.6,-7.6,.35,1.2,1.2,RRU);
 });return gScale(toGeo(G),.92)}
function pxCapSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,58,9,(u,v)=>{const L=58,hw=u<L-9?4:Math.max(0,4-(u-(L-9))*.5),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-11)return S[0];const n=pxN('Q',u>>1,v,7);if(n>.92)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.3,ps:.5,d:1.2});
  gx(G,-.85,-1.7,2.3,1.7,3.4,1.3,pBev(RSV));
  gx(G,-.95,-5.4,1.1,1.9,10.8,1.4,pBev(RSV));gx(G,-1.15,-6.8,.6,2.3,1.8,2.2,pGo);gx(G,-1.15,5,.6,2.3,1.8,2.2,pGo);
  gx(G,-.75,-.75,-5.8,1.5,1.5,6.8,pWrap(RLE),{mat:0});gx(G,-.95,-.95,-2.8,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.4,1.9,1.9,.7,pGo);
  gx(G,-.95,-1.8,-8.4,1.9,3.6,2.6,pGo);gem(G,.95,-.6,-7.8,.35,1.2,1.2,teamGem());gem(G,-1.3,-.6,-7.8,.35,1.2,1.2,teamGem());
 });return gScale(toGeo(G),.9)}
/* captain's arms: a team chief with the gold sun, a gold chevron, red below */
const ART_CAPTAIN=['TTTTTTTTTT','TTTTggTTTT','TTTgGGgTTT','TTgGYYGgTT','TTTgGGgTTT','TTTTggTTTT','TTTTTTTTTT',
 'TTTTGGTTTT','TTTGggGTTT','TTGgRRgGTT','TGgRRRRgGT','GgRRRRRRgG','gRRRRRRRRg','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR'];
function pxCaptainShield(AL,vr){return gScale(toGeo(pxMcShield(vr==='0'?null:ART_CAPTAIN,shPal(),AL)),.95)}
/* ================= ZOMBIES: the same random undead (zSpec: skin, decay, outfit, headgear, wounds) as pixel skins =================
   the part sizes follow the old body mutations (MUTX: the brute's big arm, the bomber's barrel chest...); arms are built one by one */
function pxArms2(P,fR,fL){const TR=newG(),TL=newG();pxScene(()=>fR(TR));pxScene(()=>fL(TL));pxCat(P.AG,TR);pxCat(P.LA,TL,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}
function pxZombie(type,ZV,P){
 const S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null),MT=MUTX[type],sd=S.seed>>>0,o=S.outfit,dc=S.decay,hd=S.head;
 const skel=dc==='skel',bony=dc==='bones',mum=dc==='mummy',dried=dc==='dried'||mum,C=PD;
 const mixH=(a,b,t)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')},
  zg=h=>dried?h:mixH(h,'#4f8a44',.32);
 const SK=C(zg(S.sk[0])),SKD=C(zg(S.sk[1])),SKL=C(zg(S.sk[2])),BN=C(S.bn[0]),BN2=C(S.bn[1]),BND=C(S.bn[2]),DK=C('#160c08'),FL=C('#6a1e14'),FL2=C('#9a3424'),
  WR=C('#cbbd98'),WR2=C('#a99c7a'),HAIR=C(S.hairc),EY=C(S.eye),RU=C('#5a3a20'),ST=PDP(['#2c2e34','#4a4d55','#6d717a','#949aa3']),GO=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const TUNh=o==='soldier'?'#6e7078':o==='gambeson'?'#b6a684':o==='monk'?((sd&1)?ZCL.wool:ZCL.black):o==='shroud'?'#cbbd98':o==='rags'||o==='peasant'?ZCL.burlap:o==='hooded'?'#5a3a22':S.tun;
 const TC=C(TUNh),TD=shadeHex(TC,.78),T2=C(S.tun2||TUNh),T2D=shadeHex(T2,.78),HO=C(S.hose);
 const nz=(f,u,v)=>pxN(f,u+(sd%89),v+((sd>>7)%83),sd%13);
 const tT=(MT&&MT.T)||[1,1,1,0,0];
 const zb=(R,Gx,x,y,z,w,h,d,paint,op)=>{const t=MT&&MT[R];if(t){const py=R==='H'?24:R==='T'?12:0;x*=t[0];w*=t[0];y=(y-py)*t[1]+py+t[3];h*=t[1];z=z*t[2]+t[4];d*=t[2]}pxBox(Gx,x,y,z,w,h,d,paint,op)};
 const skin=(f,u,r)=>{const n=nz(f,u,r);if(dried)return n<.18?SKD:(n>.86?SKL:SK);const w=nz('W'+f,u>>1,r>>1);if(w>.95)return (u+r)%2?FL2:FL;if(n<.13)return SKD;if(n>.93)return SKL;return SK};
 const wrap=(f,u,r)=>{const n=nz('w'+f,u,r);if(n<.05)return DK;return ((r+(n<.22?1:0))%2)?WR:WR2};
 const bone=(f,u,r)=>{const n=nz('b'+f,u,r);return n<.15?BN2:(n>.93?BND:BN)};
 /* ---- head ---- */
 const hairOn=S.hair!=='none'&&!skel&&!mum;
 const head=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if((r===3||r===4)&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return DK;if(r===6)return (u===0||u===7)?BN2:(u%2?BN:DK);if(r===7)return (u>=1&&u<=6)?BN2:BND}return bone(f,u,r)}
  if(mum){if(f==='F'&&r===4&&(u===2||u===5||u===6))return DK;return wrap(f,u,r)}
  if(hairOn&&(f==='T'||(f==='B'&&r<6)||((f==='R'||f==='L')&&r<3)||(f==='F'&&r<1))){const n=nz('h'+f,u,r);if(S.hair==='patchy'&&n<.45)return skin(f,u,r);if(S.hair==='stringy'&&n<.25)return skin(f,u,r);return n>.8?shadeHex(HAIR,.8):HAIR}
  if(f==='F'){if(r===4&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return SKD;
   if(type==='acid'&&r>=6&&(u===3||u===4))return C('#b8f040');
   if(r===6&&u>=2&&u<=5)return (S.jawOff||u===3||u===4)?DK:SKD;if(r===7&&S.jawOff&&u>=2&&u<=5)return u%2?BN:DK;
   if(S.cheek&&r>=5&&r<=6&&(S.cheek<0?u<=1:u>=6))return r===5?BN:BN2;if(S.skullPatch&&r<=2&&u<=2)return BN}
  if(S.skullPatch&&f==='T'&&u<3&&r<3)return BN;
  return skin(f,u,r)};
 /* ---- torso, arms, legs (bare body) ---- */
 const body=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if(u===3||u===4)return r<11?BN2:BND;if(r>=1&&r<=7)return r%2?BN:DK;return (r>=8&&r<=9)?DK:BN2}if(f==='B'){if(u===3||u===4)return BN;return (r>=1&&r<=7&&r%2)?BN2:DK}return (r>=1&&r<=7&&r%2)?BN:DK}
  if(mum)return wrap(f,u,r);
  if(bony&&f==='F'&&r>=2&&r<=7&&u>=1&&u<=6&&((S.cheek>=0?u<=3:u>=4)||nz('rb',u,r)<.35))return r%2?BN:FL;
  if(type==='acid'&&nz('p'+f,u,r)>.93)return C('#c8ff60');
  return skin(f,u,r)};
 const limb=(bare,k)=>(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(bare&&r>=6){const n=nz('a'+k+f,u,r);return r>=10?(n<.5?BN:BN2):(n<.3?FL:(n<.7?BN:BN2))}return skin(f,u,r)};
 const leg=(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(o==='bare')return r>=11?SKD:skin(f,u,r);if(r>=10)return r===11?DK:RU;return nz('l'+f,u,r)<.1?shadeHex(HO,.8):HO};
 /* ---- clothes (outer layer): torn hems and holes from the seed ---- */
 const torn=(f,u,r,k,lim)=>{const n=nz('t'+f+k,u,r);return r>=lim-((n*3)|0)};
 const hole=(f,u,r,p)=>nz('o'+f,u,r)<p;
 let jacket=null,sleeve=null,pants=null;const sh=(c,f)=>f==='T'?c:(f==='D'?null:c);
 if(o==='tunic'||o==='peasant'||o==='rags'||o==='gambeson'||o==='hooded'){const qu=o==='gambeson',rag=o==='rags'?.3:.07,BELT=o==='peasant'?C('#c8a868'):C('#4a3622');
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return TC;if(torn(f,u,r,'j',11))return null;if(hole(f,u,r,rag))return null;if(r===6&&o!=='rags')return BELT;
   if(qu)return ((u+r)%3===0)?TD:TC;if(o==='peasant'&&nz('pa'+f,u>>1,r>>1)>.85)return lighten(TC,.1);return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v,len=qu?9:o==='hooded'?11:5;if(f==='D')return null;if(f==='T')return TC;if(r>=len||torn(f,u,r,'s',len))return null;if(hole(f,u,r,rag))return null;return (qu&&(u+r)%3===0)?TD:TC}}
 else if(o==='soldier'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(torn(f,u,r,'j',12))return null;if(hole(f,u,r,.06))return null;
   if((f==='F'||f==='B')&&u>=2&&u<=5&&r>=1)return r===6?C('#4a3622'):(nz('c'+f,u,r)<.12?T2D:T2);return (u+r)%2?ST[1]:ST[2]};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||r>=6||torn(f,u,r,'s',6))return null;return (u+r)%2?ST[1]:ST[2]}}
 else if(o==='monk'||o==='shroud'||o==='noble'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return hole(f,u,r,.12)?null:wrap(f,u,r);
   if(o==='noble'){if(r===0)return C('#e6e0d0');if((f==='F')&&(u===3||u===4)&&r>=1&&r<=8&&r%2)return GO[1];if(torn(f,u,r,'j',12))return null;return nz('c'+f,u,r)<.12?T2D:T2}
   if(r===6)return C('#c8a868');if(hole(f,u,r,.05))return null;return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return (r>=9||hole(f,u,r,.15))?null:wrap(f,u,r);if(r>=(o==='noble'?11:10)||torn(f,u,r,'s',10))return null;return o==='noble'?(r%3===1?GO[1]:T2):TC};
  if(o==='monk')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;if(torn(f,u,r,'p',11))return null;return nz('m'+f,u,r)<.15?TD:TC};
  if(o==='shroud')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;return hole(f,u,r,.25)?null:wrap(f,u,r)}}
 if(o==='bare'&&!skel&&!mum)pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D'||r>3)return null;if(torn(f,u,r,'p',4))return null;return C(ZCL.burlap)};
 if(type==='bomber'){const s0=jacket;jacket=(f,u,v,W,H)=>{const r=H-1-v;if((f==='F'||f==='B')&&Math.abs((f==='F'?u:7-u)-(r*.62+.5))<.9)return C('#4a2e16');if(f==='T'&&(u===1||u===2))return C('#4a2e16');return s0?s0(f,u,v,W,H):null}}
 /* ---- headgear (outer layer) ---- */
 const win=(f,u,r,a,b)=>f==='F'&&r>=a&&r<=b&&u>=1&&u<=6;
 const STEEL=(f,u,r)=>f==='T'?ST[3]:(r===0?ST[3]:(r===1?ST[2]:ST[1]));
 let hat=null,brim=null,lamp=false;
 if(hd==='kettle'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<3?STEEL(f,u,r):null)};brim=[ST[2],ST[1],ST[3]]}
 else if(hd==='nasal')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<3)return STEEL(f,u,r);if(f==='F'&&(u===3||u===4)&&r<6)return ST[2];return null};
 else if(hd==='coif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,6))return null;return (u+r)%2?ST[1]:ST[2]};
 else if(hd==='hood'||hd==='ghood'){const HC=hd==='ghood'?C(ZCL.green):TC;hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,7))return null;if(hole(f,u,r,.06))return null;return nz('hd'+f,u,r)<.15?shadeHex(HC,.8):HC}}
 else if(hd==='straw'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<2?C(nz('st'+f,u,r)<.3?'#a88a42':'#d4b45c'):null)};brim=[C('#d4b45c'),C('#a88a42'),C('#ecd27a')]}
 else if(hd==='lcoif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<2)return C('#d8cbaa');if((f==='R'||f==='L')&&r<6)return C('#c4b694');return null};
 else if(hd==='circlet')hat=(f,u,v,W,H)=>{const r=H-1-v;return (f!=='T'&&f!=='D'&&r===2)?(u%3===1?GO[2]:GO[1]):null};
 else if(hd==='shroud')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,3,5))return null;return wrap(f,u,r)};
 else if(hd==='mhelm'){hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return C(nz('mh',u,r)<.2?'#8a6a2a':'#a8823a');if(r<3)return r===2?C('#5a3a1a'):C('#a8823a');return null};lamp=true}
 /* ---- build ---- */
 const lw=skel?2:4;
 pxScene(()=>{
  zb('H',P.HG,-4,24,-4,8,8,8,head,{mat:0,grid:[8,8,8]});
  if(hat)zb('H',P.HG,-4.5,23.5,-4.5,9,9,9,hat,{mat:hd==='kettle'||hd==='nasal'||hd==='coif'?4:0,grid:[8,8,8],ao:false});
  if(brim)zb('H',P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?brim[2]:brim[0]):(f==='D'?brim[1]:brim[0]),{mat:hd==='kettle'?4:0,grid:[12,1,12]});
  if(lamp){zb('H',P.HG,-1.2,30.2,4.4,2.4,2,1.2,f=>f==='F'?C('#fff2a0'):C('#6a5a3a'),{mat:5,grid:[2,2,1]});zb('H',P.HG,-4.6,29.7,3.2,9.2,.6,2,()=>C('#5a3a1a'),{mat:0,grid:[8,1,2]})}
  /* eyes that glow in the dark sockets (one for a mummy) */
  for(const x of(mum?[1]:[-2,1]))zb('H',P.HG,x,27,4,1,1,.14,()=>EY,{mat:5,grid:[1,1,1],ao:false});
  zb('T',P.G,-4,12,-2,8,12,4,body,{mat:0,grid:[8,12,4]});
  if(jacket)zb('T',P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,jacket,{mat:o==='soldier'?4:0,grid:[8,12,4],ao:false});
  zb('L',P.LG,-lw/2,-12,-lw/2,lw,12,lw,leg,{mat:0,grid:[4,12,4]});
  if(pants&&!skel)zb('L',P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,pants,{mat:0,grid:[4,12,4],ao:false});
  pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true});
  /* arrows stuck in the back */
  for(let i=0;i<S.arrows;i++){const ax=-2.5+5*nz('ar',i,1),ay=15+6*nz('ar',i,2),z0=-2*tT[2]+tT[4];
   pxBox(P.G,ax-.25,ay-.25,z0-5.5,.5,.5,6.2,()=>C('#8a6a3a'),{mat:0,grid:[1,1,6],ao:false});pxBox(P.G,ax-.1,ay-.9,z0-5.6,.2,1.8,1.4,()=>C('#efe9d6'),{mat:0,grid:[1,2,1],ao:false})}
  /* the bomber's powder keg, fuse and spark; the acid spitter's glowing sacs */
  const zB=-2.25*tT[2]+tT[4],xW=4.25*tT[0];
  if(type==='bomber'){const W2=6,yk=(13-12)*tT[1]+12;pxBox(P.G,-W2/2,yk,zB-5,W2,8,5,(f,u,v,W,H)=>{if(f==='T'||f==='D')return (u+v)%3?RWD[2]:RWD[1];if(v===1||v===6)return RDS[1];return u%2?RWD[2]:RWD[3]},{mat:0,grid:[6,8,5]});
   pxBox(P.G,-.3,yk+8,zB-2.8,.6,2,.6,()=>C('#3a2a1a'),{mat:0,grid:[1,2,1],ao:false});pxBox(P.G,-.45,yk+10,zB-2.95,.9,.9,.9,()=>C('#ffb02a'),{mat:5,grid:[1,1,1],ao:false})}
  if(type==='acid')for(const[sx,sy,sz,s]of[[-2.6,19,0,3.4],[1.4,16,-.6,2.8],[-.4,21.2,-.2,2.4]])pxBox(P.G,sx,sy*tT[1]+(1-tT[1])*12,zB-s*.75+sz,s,s,s,(f,u,v)=>((u+v)%2?C('#9ae030'):C('#c8ff60')),{mat:5,grid:[2,2,2],ao:false});
 });
 /* arms one by one: the brute's right arm is huge, shackle and chain on its left wrist, bone spikes on its shoulder; the miner holds a pick */
 const arm=(R)=>T=>{const t=MT&&MT[R],ab=(x,y,z,w,h,d,p,op)=>{if(t){x*=t[0];w*=t[0];y=y*t[1];h*=t[1];z*=t[2];d*=t[2]}pxBox(T,x,y,z,w,h,d,p,op)};
  ab(-lw/2,-12,-lw/2,lw,12,lw,limb(R==='AR'?S.armR:S.armL,R),{mat:0,grid:[4,12,4]});
  if(sleeve&&!skel)ab(-2.25,-12.25,-2.25,4.5,12.5,4.5,sleeve,{mat:o==='soldier'?4:0,grid:[4,12,4],ao:false});
  if(type==='brute'&&R==='AR')for(const[x,z,h]of[[-.8,-1,3.4],[.6,.9,2.6]])ab(x,0,z,1.2,h,1.2,(f)=>f==='T'?BN2:BN,{mat:0,grid:[1,3,1]});
  if(type==='brute'&&R==='AL'){ab(-2.6,-9.6,-2.6,5.2,1.8,5.2,(f,u,v)=>f==='T'||f==='D'?ST[1]:(u%2?ST[2]:ST[1]),{mat:4,grid:[5,2,5]});for(let i=0;i<3;i++)ab(-.5,-11.2-i*1.4,2.4,1,1.2,.6,()=>ST[i%2?1:2],{mat:4,grid:[1,1,1],ao:false})}
  if(type==='miner'&&R==='AR'){ab(-.5,-11.5,-1.5,1,1,11,(f,u,v)=>((u+v)%2?RWD[2]:RWD[3]),{mat:0,grid:[1,1,11]});ab(-.6,-16,8.6,1.2,9,1.5,(f,u,v,W,H)=>v===0||v===H-1?RDS[1]:RDS[3],{mat:4,grid:[1,9,1]})}};
 pxArms2(P,arm('AR'),arm('AL'));
}
/* ================= ROUND 3: capes, the bannerman's banner, the cannon, the swarm's skin tone ================= */
const pxZg=h=>{const A=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),B=[0x4f,0x8a,0x44];return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*.32).toString(16).padStart(2,'0')).join('')};
/* capes: a Minecraft cape (one pixel thick, the art on the back) with folds, hems and an emblem; s = 1 / PXV converts old units */
function pxCapes(type,P0){const X=P0.X;if(!X)return;const s=1/PXV,Tm=teamPal(thp()),C=PD;
 const R=PDP(['#6c111b','#8e1a26','#a62832','#c94450']),E=C('#f3efe6'),Ex=C('#18181c'),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const cape=(Gx,w,h,z,W,H,col)=>pxBox(Gx,-w/2,-h,z,w,h,1.1,(f,u,v)=>{const r=H-1-v;return col(f,u,r,W,H)},{mat:0,grid:[W,H,1]});
 const fold=(u,W)=>u%3===1?1:(u%3===2?2:0);
 const sun=(u,r,u0,r0)=>{const du=u-u0,dr=r-r0;if(Math.abs(du)+Math.abs(dr)<=1)return G[2];if((du===0&&Math.abs(dr)===2)||(dr===0&&Math.abs(du)===2))return G[1];return null};
 if(type==='guard'){X.cape=newG();cape(X.cape,4.5*s,7.6*s,-.65*s,10,16,(f,u,r,W,H)=>{if(r<=1)return r?Tm[2]:Tm[3];if(r===H-1)return G[1];if(f==='B'||f==='F'){const c=sun(u,r,4.5|0,5);if(c&&f==='B')return c}return R[[2,1,3][fold(u)]]})}
 if(type==='captain'){X.cape=newG();cape(X.cape,4.2*s,9*s,-.65*s,10,18,(f,u,r,W,H)=>{if(r>=H-2)return r===H-1?G[0]:G[1];if(f==='B'){const c=sun(u,r,4,4);if(c)return c}return [Tm[3],Tm[2],Tm[4]][fold(u)]})}
 if(type==='king'){X.cape=newG();X.cape2=newG();
  const erm=(u,r,W)=>(u===0||u===W-1)?((r%3===1)?Ex:E):null;
  cape(X.cape,5.6*s,5*s,-.67*s,12,11,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r<=1)return (r===1&&u%3===1)?Ex:E;
   if(f==='B'&&r>=3&&r<=7&&u>=3&&u<=8){const du=u-5.5,dr=r-5;if(Math.abs(du)<=2&&Math.abs(dr)<=2){if(dr===-2)return (u%2)?G[2]:null;return dr===2?G[0]:G[1]}}return R[[2,1,3][fold(u)]]});
  cape(X.cape2,6.6*s,5.3*s,-.67*s,14,12,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r>=H-2)return r===H-1?G[0]:G[2];return R[[2,1,3][fold(u)]]})}}
/* the bannerman's banner: three chained cloth pieces painted as one 20 x 30 Minecraft banner: team field, gold border,
   a gold fleur-de-lis, a swallow tail cut in the bottom */
const FLEUR=['...GG...','..GGGG..','..GGGG..','G..GG..G','GG.GG.GG','GGGGGGGG','.GGGGGG.','...GG...','..GGGG..','...GG...'];
function pxBanner(X){const s=1/PXV,Tm=teamPal(thp()),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']),BW=11.2,SH=5.6,TOT=16.6,W=20,H=30,rp=TOT/H;
 const px=(u,r)=>{if(r>=24){const half=(r-23)*1.55;if(Math.abs(u-9.5)<half)return null}if(r===0)return G[0];if(r===1)return G[2];if(u===0||u===W-1)return G[1];
  if(r===H-1||(r>=24&&Math.abs(Math.abs(u-9.5)-(r-23)*1.55)<.9))return G[0];const fr=r-7,fc=u-6;if(fr>=0&&fr<10&&fc>=0&&fc<8&&FLEUR[fr][fc]!=='.')return fc<4?G[2]:G[1];
  if(r===3||r===21)return G[1];return (u%4===3)?Tm[2]:(r>18?Tm[2]:Tm[3])};
 ['ban','ban2','ban3'].forEach((k,i)=>{X[k]=newG();const g0=-SH*i,g1=i<2?-SH*(i+1):-TOT,r0=Math.round(-g0/rp),r1=Math.round(-g1/rp),nr=r1-r0;
  pxBox(X[k],-BW/2*s,-(g0-g1)*s,-.25*s,BW*s,(g0-g1)*s,.55*s,(f,u,v)=>{if(f==='T'||f==='D')return f==='T'&&i===0?G[1]:null;const r=r0+(nr-1-v);return px(f==='B'?W-1-u:u,r)},{mat:0,grid:[W,nr,1],ao:false})})}
/* the cannon: bronze barrel with reinforcing rings and a cascabel, plank carriage, spoked wheels with iron tyres */
function pxCannon(){const G=newG(),BZ=PDP(['#5a3a10','#8a5a1e','#b8822e','#dca84a','#f2cc6a']),k=1/(PXV*VX);
 const wood=(f,u,v)=>((u+v)%5===0?RWD[1]:(f==='T'?RWD[3]:RWD[2])),iron=(f)=>f==='T'?RDS[3]:RDS[1];
 pxScene(()=>{
  for(const sx of[-1,1]){const x=sx*11.8,y=7.4,z=15.7,X0=sx>0?x:x-2.2;
   pxBox(G,X0,y-7,z-3,2.2,14,6,iron,{mat:4,grid:[2,14,6]});pxBox(G,X0,y-3,z-7,2.2,6,14,iron,{mat:4,grid:[2,6,14]});pxBox(G,X0,y-5.5,z-5.5,2.2,11,11,iron,{mat:4,grid:[2,11,11]});
   pxBox(G,X0+(sx>0?-.2:.2),y-5.2,z-5.2,2.6,10.4,10.4,(f,u,v)=>(f==='R'||f==='L')?((u===5||v===5||u===v||u===10-v)?RWD[3]:RWD[1]):RWD[2],{mat:0,grid:[2,11,11]});
   pxBox(G,sx>0?x+2.2:x-3.6,y-1.6,z-1.6,1.4,3.2,3.2,pBev(BZ),{grid:[1,3,3]})}
  pxBox(G,-11,6.4,14.6,22,2,2,iron,{mat:4,grid:[22,2,2]});
  pxBox(G,-4,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});pxBox(G,2,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});
  pxBox(G,-3,2,-14,6,4,17,wood,{mat:0,grid:[6,4,17]});pxBox(G,-2.5,1.5,-14.5,5,3,2,iron,{mat:4,grid:[5,3,2]});
  pxBox(G,-3.6,10,-1,7.2,7.2,28,(f,u,v,W,H)=>{if(f==='F')return (u>=2&&u<=4&&v>=2&&v<=4)?RDS[0]:BZ[3];if(f==='B')return BZ[1];const q=f==='T'||f==='D'?v:u;return f==='T'?BZ[3]:(v===H-1?BZ[3]:BZ[2])},{grid:[7,7,28]});
  for(const[z0,l]of[[-1.5,3.5],[11,1.6],[23.6,3.8]])pxBox(G,-4.4,9.2,z0,8.8,8.8,l,pBev(BZ),{grid:[8,8,2]});
  pxBox(G,-1.6,12,-4,3.2,3.2,3,pBev(BZ),{grid:[3,3,3]});
  for(const[x,z]of[[-17,-2],[-14,-3],[-15.5,.5]])pxBox(G,x,0,z,3,3,3,()=>RDS[0],{mat:4,grid:[3,3,3]});
 });return toGeo(G)}
/* ================= ROUND 4b: the castle, rebuilt the Minecraft way (square towers, chunky crenels, steep block roofs) =================
   A = square fortress: curtain walls, four square corner towers, a keep with a steep slate roof, a gatehouse with a portcullis
   B = great keep: one massive square keep with four corner turrets and a stepped slate spire, low walls and corner towers
   front = +z, the 5 x 5 tiles go from 0 to 5; C5.flag = where the animated flag stands */
/* wood or stone: the same castle A in logs and planks for the wooden tier */
let PXCW=false;
const pS=(G,x,y,z,w,h,d,c)=>PXCW?bW(G,x,y,z,w,h,d,(c===QTR||c===QSD2)?QW3:(c===QS[1]?QLOG:QW2)):bS(G,x,y,z,w,h,d,c);
const pSt=(G,x,y0,z,w,d,h,o)=>{if(!PXCW)return qStone(G,x,y0,z,w,d,h,o);const n=Math.max(1,Math.round(h/.2)),q=h/n;for(let k=0;k<n;k++)bW(G,x,y0+k*q,z,w,q,d,k%2?QW1:QW2)};
const pQu=(G,x0,z0,x1,z1,y0,h)=>{if(!PXCW)return qQuoin(G,x0,z0,x1,z1,y0,h)};
function pxCastleMer(G,x0,z0,x1,z1,y,s){s=s||.26;const put=(x,z)=>{pS(G,x,y,z,s,s,s,QS[1]);pS(G,x,y+s,z,s+.03,.03,s+.03,QTR)};
 const nx=Math.max(1,Math.round((x1-x0)/(s*2))),nz=Math.max(1,Math.round((z1-z0)/(s*2)));
 for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx;put(x,z0);put(x,z1)}for(let j=1;j<nz;j++){const z=z0+(z1-z0)*j/nz;put(x0,z);put(x1,z)}}
function pxCastleGate(G,gz1){const ax0=2.5,aw=.82,ah=1.25,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.6,.12,.06,'#18171c');
 for(const s of[-1,1]){pS(G,ax0+s*(aw/2+.06),.2,az,.12,ah+.12,.06,QTR)}pS(G,ax0,.32+ah,az,aw+.24,.14,.06,QTR);
 for(let i=0;i<6;i++)bP(G,ax0-aw/2+.08+i*(aw-.16)/5,.6,az-.035,.03,ah-.42,.03,QIR);for(const y of[.75,1.15])bP(G,ax0,y,az-.035,aw-.06,.03,.03,QIR);
 pS(G,ax0,.2,az+.14,aw+.3,.04,.3,QSD2);for(const s of[-1,1])qLamp(G,2.5+s*.62,1.45,gz1+.1,true)}
function pxCastleA(wood){PXCW=!!wood;const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)pS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.3,TH=.5;const cw=(x,z,w,d)=>{pSt(G,x,.2,z,w,d,WT-.2,{moss:1});pS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.3,3.4,TH);cw(.3,2.5,TH,3.4);cw(4.7,2.5,TH,3.4);cw(1.05,4.7,1.1,TH);cw(3.95,4.7,1.1,TH);
 pxCastleMer(G,.9,.08,4.1,.08,WT+.08);pxCastleMer(G,.08,.9,.08,4.1,WT+.08);pxCastleMer(G,4.92,.9,4.92,4.1,WT+.08);
 for(const z of[1.4,2.5,3.6]){qSlit(G,.045,1.2,z,false);qSlit(G,4.955,1.2,z,false)}
 /* square corner towers with a cornice, chunky crenels, banners on the front pair */
 for(const[x,z]of[[.65,.65],[4.35,.65],[.65,4.35],[4.35,4.35]]){const bk=z<2.5,H=bk?3.9:3.4,W=1.25,ox=x<2.5?-1:1,oz=z<2.5?-1:1;
  qPlinth(G,x,0,z,W+.12,W+.12,.2);pSt(G,x,.2,z,W,W,H-.2,{moss:1,ph:bk?1:0});pQu(G,x-W/2,z-W/2,x+W/2,z+W/2,.2,H-.2);
  pS(G,x,H,z,W+.18,.12,W+.18,QTR);pS(G,x,H+.12,z,W+.1,.06,W+.1,QSD2);pxCastleMer(G,x-W/2-.04,z-W/2-.04,x+W/2+.04,z+W/2+.04,H+.12,.28);
  qSlit(G,x+ox*(W/2+.005),1.3,z,false);qSlit(G,x,1.3,z+oz*(W/2+.005),true);qWin(G,x+ox*(W/2+.012),2.6,z,false,ox,{w:.16,h:.24,glow:1});qWin(G,x,2.6,z+oz*(W/2+.012),true,oz,{w:.16,h:.24,glow:1});
  if(!bk)qBan(G,x,H-.95,z+W/2+.03,true,1,.36,.8);else qFlag(G,x,H+.18,z,.8)}
 /* keep: square, steep slate gable roof with dormers, banners, a door */
 const kx=2.5,kz=1.75,KW=2.2,KD=1.9,KH=3.9;qPlinth(G,kx,.2,kz,KW+.12,KD+.12,.12);pSt(G,kx,.32,kz,KW,KD,KH-.32,{ph:1});pQu(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.32,KH-.32);
 pS(G,kx,KH,kz,KW+.16,.1,KD+.16,QTR);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){const L=ax?KW:KD;for(const o of[-.3,.3]){const w=o*L;qWin(G,ax?x+w:x+n*.012,2.7,ax?z+n*.012:z+w,ax,n,{w:.18,h:.34,glow:1})}}
 qDoor(G,kx,kz+KD/2+.016,true,1,{y:.32,w:.5,h:.8,wood:1});qBan(G,kx-.7,1.6,kz+KD/2+.04,true,1,.3,.7);qBan(G,kx+.7,1.6,kz+KD/2+.04,true,1,.3,.7);
 const rt=qRoof(G,kx,kz,KW+.1,KD+.1,KH+.1,PXCW?QSH:QSL,true,{rise:.3,run:.17});C5.flag=(typeof rt==='number'?rt:KH+1.9)+.05;C5.wflag=C5.flag;
 pS(G,kx-.55,KH+.1,kz+.5,.1,.9,.1,QSD);qFlag(G,kx,C5.flag-.05,kz,.9);
 /* gatehouse: a square block over the gate, crenellated, the arms of the kingdom */
 const gz0=4.15,gz1=5.05,GH=3.0,gzc=(gz0+gz1)/2;pSt(G,2.5,.2,gzc,1.9,gz1-gz0,GH-.2,{moss:1,ph:2});pQu(G,1.55,gz0,3.45,gz1,.2,GH-.2);
 pS(G,2.5,GH,gzc,2.06,.12,gz1-gz0+.12,QTR);pxCastleMer(G,1.5,gz0-.02,3.5,gz1+.04,GH+.12,.26);pxCastleGate(G,gz1);qBan(G,2.5,1.75,gz1+.04,true,1,.4,.75);
 qBarrel(G,3.3,3.2,.22);qBarrel(G,3.5,3.0,.22);qCrate(G,1.6,3.0,.22,.26);for(const[x,z]of[[1.6,3.9],[3.4,3.9]])qPost(G,x,.22,z,.55,true);
 return toGeo(G)}
function pxCastleB(){const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=1.7,TH=.4;const cw=(x,z,w,d)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});bS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.22,3.8,TH);cw(.22,2.5,TH,3.8);cw(4.78,2.5,TH,3.8);cw(1.0,4.78,1.2,TH);cw(4.0,4.78,1.2,TH);
 pxCastleMer(G,.8,.04,4.2,.04,WT+.08,.24);pxCastleMer(G,.04,.8,.04,4.2,WT+.08,.24);pxCastleMer(G,4.96,.8,4.96,4.2,WT+.08,.24);
 for(const[x,z]of[[.5,.5],[4.5,.5],[.5,4.5],[4.5,4.5]]){const W=.95,H=2.5;qStone(G,x,.2,z,W,W,H-.2,{moss:1});bS(G,x,H,z,W+.14,.1,W+.14,QTR);pxCastleMer(G,x-W/2-.03,z-W/2-.03,x+W/2+.03,z+W/2+.03,H+.1,.24)}
 /* the great keep */
 const kx=2.5,kz=2.2,KW=2.7,KH=4.6;qPlinth(G,kx,.2,kz,KW+.14,KW+.14,.14);qStone(G,kx,.34,kz,KW,KW,KH-.34,{ph:1});qQuoin(G,kx-KW/2,kz-KW/2,kx+KW/2,kz+KW/2,.34,KH-.34);
 for(const y of[1.6,3.1])bS(G,kx,y,kz,KW+.08,.08,KW+.08,QTR);bS(G,kx,KH,kz,KW+.2,.12,KW+.2,QTR);pxCastleMer(G,kx-KW/2-.06,kz-KW/2-.06,kx+KW/2+.06,kz+KW/2+.06,KH+.12,.3);
 for(const[x,z,ax,n]of[[kx,kz+KW/2,true,1],[kx,kz-KW/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){for(const o of[-.65,0,.65]){qWin(G,ax?x+o:x+n*.012,3.55,ax?z+n*.012:z+o,ax,n,{w:.18,h:.36,glow:1})}qWin(G,ax?x-.6:x+n*.012,2.1,ax?z+n*.012:z-.6,ax,n,{w:.16,h:.3,glow:1});qWin(G,ax?x+.6:x+n*.012,2.1,ax?z+n*.012:z+.6,ax,n,{w:.16,h:.3,glow:1})}
 qDoor(G,kx,kz+KW/2+.016,true,1,{y:.34,w:.56,h:.86,wood:1});qBan(G,kx-.85,2.3,kz+KW/2+.04,true,1,.34,.9);qBan(G,kx+.85,2.3,kz+KW/2+.04,true,1,.34,.9);
 /* corner turrets with stepped slate roofs, the stepped spire in the middle */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=kx+a*(KW/2-.05),z=kz+b*(KW/2-.05),W=.72,H=KH+.9;qStone(G,x,KH-.4,z,W,W,H-KH+.4,{ph:2});bS(G,x,H,z,W+.12,.08,W+.12,QTR);qPyr(G,x,z,H+.08,W+.16,W+.16,QSL,.16,.09)}
 const sb=KH+.12,SW=1.3;qStone(G,kx,sb,kz,SW,SW,.9,{ph:1});for(const[x,z,ax,n]of[[kx,kz+SW/2,true,1],[kx+SW/2,kz,false,1],[kx-SW/2,kz,false,-1],[kx,kz-SW/2,true,-1]])qWin(G,x+(ax?0:n*.012),sb+.3,z+(ax?n*.012:0),ax,n,{w:.2,h:.36,glow:1});
 const kt=qPyr(G,kx,kz,sb+.9,SW+.2,SW+.2,QSL,.2,.1);C5.flag=(typeof kt==='number'?kt:sb+2.2)+.05;qFlag(G,kx,C5.flag-.05,kz,.9);
 /* small gatehouse */
 const gz0=4.35,gz1=5.05,GH=2.3;qStone(G,2.5,.2,(gz0+gz1)/2,1.7,gz1-gz0,GH-.2,{moss:1});bS(G,2.5,GH,(gz0+gz1)/2,1.84,.1,gz1-gz0+.12,QTR);pxCastleMer(G,1.62,gz0,3.38,gz1+.03,GH+.1,.24);pxCastleGate(G,gz1);
 return toGeo(G)}
