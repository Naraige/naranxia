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
function pxKing(P,AL){const vr=(window.__KV||'A'),helm=vr==='B',
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
