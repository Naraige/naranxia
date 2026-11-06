/* ================= GAME LOGIC ================= */
let units,structs,res,fx,pt,over,time,waveT,waveI=160,waveN,nextL,queue,mode,last,CS,fdT=0,fdDirty=true,ver=0,ptr=null,box=null,panMode=false,mouse={x:-1,y:-1},keys={},UIS=2,DPR=1,msgT=0,msgS='';
const PAL=[['Azure','#3f6fd0','#8ab4ff'],['Crimson','#c8353a','#ff9a8a'],['Emerald','#2f9a55','#8be0a8'],['Amber','#d9a020','#ffe08a'],['Violet','#7a48c8','#c8a8ff'],['Teal','#1f9aa8','#8ae8f0'],['Ember','#e0702a','#ffc08a'],['Night','#3a3f4c','#c4cad8'],['Rose','#d0507e','#ffb0cc'],['Forest','#2c6a34','#9ad49a'],['Gold','#c9a227','#fff0a0'],['Ivory','#d8cfb8','#fffaf0'],['Sky','#4aa8e0','#c0e8ff'],['Wine','#7a2338','#e08aa0']];
const KNAMES=['Ashvale','Brightmoor','Crowhold','Dunhaven','Eldermere','Frostmark','Goldcrest','Highwatch','Ironvale','Oakenshield','Stormreach','Whitecliff','Redmere','Silverfen'];
let THEME={n:KNAMES[(Math.random()*KNAMES.length)|0],c:0,e:0,c2:10,p:0};
try{const t=JSON.parse(localStorage.getItem('dk_theme')||'null');if(t&&typeof t.n==='string')THEME={n:t.n.slice(0,18),c:Math.abs(t.c|0)%PAL.length,e:Math.abs(t.e|0)%16,c2:t.c2==null?10:Math.abs(t.c2|0)%PAL.length,p:Math.abs(t.p|0)%8}}catch(e){}
const thp=()=>PAL[THEME.c][1],ths=()=>PAL[THEME.c][2],thd=()=>{const h=hex(PAL[THEME.c][1]);return '#'+h.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join('')};
const HEAL_R=7*TS,HEAL_RATE=5;

let gateAx=0,gateLen=3,buildRot=0,formType=0,lastFm=0;const FORMS=['None','Line','Block','Wedge','Ring'];
const tfo=new Map();

function gateAxAt(tx,ty){return buildRot&1;const w=(x,y)=>isW(x,y);if(w(tx-1,ty)||w(tx+2,ty)||w(tx-1,ty)&&w(tx+2,ty))if(!(w(tx,ty-1)||w(tx,ty+1)))return 0;if(w(tx,ty-1)||w(tx,ty+2))if(!(w(tx-1,ty)||w(tx+1,ty)))return 1;return buildRot&1}
function tilesFor(type,tx,ty,sz,ax,gl){if(type==='gate'){gl=gl||gateLen;const t=[];for(let k=0;k<gl;k++)t.push(ax?[tx,ty+k]:[tx+k,ty]);return t}const t=[];for(let j=0;j<sz;j++)for(let i=0;i<sz;i++)t.push([tx+i,ty+j]);return t}
function gateOK(tx,ty,ax,gl){const t=tilesFor('gate',tx,ty,1,ax,gl),hs=t.map(([x,y])=>HT[y*TW+x]);return t.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs)-Math.min(...hs)<=2}
function mk(t,type,tx,ty,sz,done,ax,gl){gl=type==='gate'?(gl||2):0;const tiles=tilesFor(type,tx,ty,sz,ax,gl),g=type==='gate',s={sid:++SID,pl:CURPL,t,type,tx,ty,sz,tiles,ax:ax||0,gl,rot:t===0&&type!=='castle'&&ROTT.has(type)?(buildRot&3):0,rad:g?20*gl:sz*20,x:g?(tx+(ax?.5:gl/2))*TS:(tx+sz/2)*TS,y:g?(ty+(ax?gl/2:.5))*TS:(ty+sz/2)*TS,hp:SH[type],max:SH[type],cd:0,prog:done?1:0,bt:BT[type]||1};
 s.tier=1;if(t===0)s.cost={...(C[type]||{})};if(t===0&&type!=='ballista'&&type!=='trebuchet'&&type!=='torch'&&type!=='keep'&&!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower'))){s.tier=0;s.max=Math.round(s.max*.5);s.hp=s.max}if(!done){s.hp=s.max*.12;if(t===0){msgS='Peasants must build it: right-click the site';msgT=4}}structs.push(s);for(const[x,y]of tiles)occ.set(y*TW+x,s);fdDirty=true;return s}
/* only our units belong to a player; zombies and AI units are created during the simulation, where CURPL is the local player
   (0 on the host, 1 on the guest), so they would otherwise carry a different owner on each machine */
function mkU(t,type,x,y,jb,lane){return{uid:++UID,pl:t===0?CURPL:0,spj:.88+Math.random()*.24,gar:null,buff:1,t,type,x,y,hp:T[type].hp,cd:0,carry:false,cj:null,work:0,job:jb||null,cap:null,sq:null,hc:0,tl:-1,sel:false,o:null,px:x,py:y,sT:.6,det:0,dir:1,mv:false,walk:0,face:0,atk:0,ph0:Math.random()*9,lane:lane==null?-1:lane,ph:0}}
function pickLanes(){const n=Math.min(3,1+(waveN>2?1:0)+(waveN>6?1:0)+(Math.random()<.25?1:0)),A=[0,1,2].sort(()=>Math.random()-.5).slice(0,n);if(!SITE2)return A;const n2=Math.min(3,1+(waveN>2?1:0)+(waveN>6?1:0)+(Math.random()<.25?1:0));return A.concat([3,4,5].sort(()=>Math.random()-.5).slice(0,n2))}
function reset(){DEVU=false;devOpen=false;SIMTK=0;FGS=[];FORCEF=null;PUD.length=0;SCRT.clear();LVO.clear();shelOn=false;shelRel=0;for(const o of ROLE.concat(RHAS))o.b=o.r=o.t=0;roleT=0;SAPL.clear();PRES.clear();saplT=0;swReset();hordeT=-1e9;hordeOn=false;waveOn=false;burnAt=0;hordeD=1e9;nightLv=0;nightCk=0;waveST=-1e9;LITL=[];darkT=0;Object.assign(PRICE,PBASE);priceT=0;syncTradeC();CLM.clear();ACH.clear();WAVEZ=0;TOASTS.length=0;RALLY[0]=RALLY[1]=RALLYC[0]=RALLYC[1]=null;RS2.on=null;RS2.t=0;for(const k in RS2.done)RS2.done[k]=false;ALERTS.length=0;alertT=0;farmT=0;UID=0;SID=0;BAD.clear();fowReset();RS.done=false;RS.on=false;RS.t=0;Object.assign(C,CWOOD);BTIER=1;selB=null;if(ICR){icoPart('tier');icoPart('units')}tfo.clear();campT=0;units=[];structs=[];fx=[];pt=[];queue=[];RESP=[{g:D_().g,w:0,s:0,f:FOOD0},{g:D_().g,w:0,s:0,f:FOOD0}];setPl(0);over=false;time=0;waveT=waveI=D_().first;kills=0;gstReset();objReset();tutStart();paused=false;bannerT=0;waveN=0;mode=null;SPK.clear();SPKV++;GF.clear();for(const k in RL)delete RL[k];
 initWorld();CS2=null;CS=mk(0,'castle',CX-2,CY-2,5,true);CS.rot=castleRotAt(CS,CROT);if(SITE2){ensureAround(SITE2.tx,SITE2.ty,3);setPl(1);CS2=mk(0,'castle',SITE2.tx-2,SITE2.ty-2,5,true);CS2.rot=castleRotAt(CS2,SITE2.rot|0);setPl(0)}nextL=pickLanes();calcFD();initAI();
 ['g','w','s'].forEach(j=>spawn(0,'peasant',1,j));if(CS2){setPl(1);['g','w','s'].forEach(j=>spawn(0,'peasant',1,j,CS2));setPl(0)}build3D();home()}
let shakeT=0;
function puff(x,y,c,n,sp,o){if(pt.length>760)return;o=o||{};const soft=o.soft!==undefined?!!o.soft:(o.g!==undefined&&o.g<=0&&(o.s||0)>=.1&&!GLC[c]);for(let i=0;i<(n||8);i++){const a=Math.random()*6.28,s=rnd(.3,1)*(sp||60);pt.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:o.T||.6,T:o.T||.6,c,z:o.z,vz:o.vz?o.vz*rnd(.6,1.2):0,g:o.g||0,s:o.s,soft,sp:rnd(-5,5)})}}
const SLOWK=.22;
const spark=(x,y,z)=>puff(x,y,'#ffe9a0',5,90,{T:.28,z:z||.6,vz:3,g:12,s:.07});
const blood=(x,y,c)=>puff(x,y,c,6,60,{T:.5,z:.5,vz:2.5,g:10,s:.08});
const dust=(x,y)=>puff(x,y,'#b9a98a',2,22,{T:.55,z:.1,vz:.8,g:-.4,s:.14});
const smoke=(x,y,z)=>puff(x,y,'#5a5a60',1,12,{T:1.6,z:z||2,vz:1.2,g:-.2,s:.38});
const ember=(x,y)=>puff(x,y,'#ff8a2a',3,40,{T:1.0,z:.6,vz:2,g:-.4,s:.09});
function ring(x,y,c,n,sp){puff(x,y,c,n||18,sp||220,{T:.45,z:.15,vz:.1,s:.16})}
const shake=v=>{shakeT=Math.max(shakeT,v)};
function spawnPos(s){if(s.type==='castle'&&s.tiles){const D=doorTiles(s,1).filter(([x,y])=>!solid(x,y));if(D.length){const[x,y]=D[(Math.random()*D.length)|0];return{x:(x+.5)*TS+rnd(-8,8),y:(y+.5)*TS+rnd(-8,8)}}}
 for(let k=0;k<40;k++){const a=Math.random()*6.28,r=s.rad+24,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;if(!solidAt(x,y)&&(k>30||fv(FP,Math.floor(x/TS),Math.floor(y/TS))<65535))return{x,y}}return{x:s.x,y:s.y}}
function spawn(t,type,free,jb,cc){const p=spawnPos(cc||CS);units.push(mkU(t,type,p.x,p.y,jb))}
let selB=null,pendB=false,castleSel=false,SELBS=[],lastClkB=0,lastTyB='';
/* double click on a building selects all of yours of that type (SELBS); it holds while selB is one of them */
const selBs=()=>selB&&SELBS.length>1&&SELBS.includes(selB)?SELBS.filter(s=>structs.includes(s)&&s.hp>0&&s.prog>=1):[];const TRB=new Set(['barracks','academy','market','guild','castle']),curB=()=>selB&&structs.includes(selB)&&selB.prog>=1&&(!MP.on||(selB.pl|0)===CURPL)&&TRB.has(selB.type)?selB:HOMEC();
/* ================= MARKET: sell wood / stone for gold, buy them back; prices move with every trade and drift back ================= */
const PBASE={w:1,s:1.3,f:.8},PRICE={w:1,s:1.3,f:.8},TRADEK=new Set(['sellw','sells','buyw','buys','sellf','buyf']);let priceT=0;
const tradeGain=k=>Math.max(1,Math.round(50*PRICE[k]*.8)),tradeCost=k=>Math.max(1,Math.round(50*PRICE[k]*1.25));
function syncTradeC(){C.sellw={w:50};C.sells={s:50};C.sellf={f:50};C.buyw={g:tradeCost('w')};C.buys={g:tradeCost('s')};C.buyf={g:tradeCost('f')}}syncTradeC();
function hasMarket(p){p|=0;for(const s of structs)if(s.t===0&&s.type==='market'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)return true;return false}
function trade(k){if(over||!TRADEK.has(k))return;if(!hasMarket(CURPL)){msgS='Build a Market to trade';msgT=3;snd('err');return}const r=k[k.length-1],nm=r==='w'?'wood':r==='f'?'food':'stone';
 if(k[0]==='s'){if(res[r]<50){msgS='You need 50 '+nm+' to sell';msgT=2.5;snd('err');return}const g=tradeGain(r);res[r]-=50;res.g+=g;PRICE[r]=Math.max(.3,PRICE[r]*.95);msgS='Sold 50 '+nm+' for '+g+' gold'}
 else{const c=tradeCost(r);if(res.g<c){msgS='You need '+c+' gold to buy 50 '+nm;msgT=2.5;snd('err');return}res.g-=c;res[r]+=50;PRICE[r]=Math.min(4,PRICE[r]*1.05);msgS='Bought 50 '+nm+' for '+c+' gold'}
 msgT=2.5;snd('coin');syncTradeC()}
function priceTick(dt){priceT-=dt;if(priceT>0)return;priceT=5;let ch=0;for(const k in PBASE){const d=PBASE[k]-PRICE[k];if(Math.abs(d)>.002){PRICE[k]+=d*.12;ch=1}}if(ch)syncTradeC()}
function hasAcademy(p){p|=0;for(const s of structs)if(s.t===0&&s.type==='academy'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)return true;return false}
const popOf=t=>t==='cannon'?2:t==='king'?3:t==='guard'?0:1;
/* the king of player p (one at most) and what the castle offers: the king, or a guard to refill his escort */
const royalOf=p=>{p|=0;for(const k of units)if(k.t===0&&k.type==='king'&&k.hp>0&&(k.pl|0)===p)return k;return null};
function royalBtns(){const p=CURPL|0,K=royalOf(p);if(!K)return queue.some(q=>q.type==='king'&&(q.b.pl|0)===p)?[]:['king'];const n=(K.sq?K.sq.length:0)+queue.filter(q=>q.type==='guard'&&(q.b.pl|0)===p).length;return n<2?['guard']:[]}
function popUsed(p){p|=0;let n=0;for(const u of units)if(u.t===0&&u.hp>0&&(u.pl|0)===p)n+=popOf(u.type);for(const q of queue)if((q.b.pl|0)===p)n+=popOf(q.type);return n}
function popCap(p){p|=0;let n=0;for(const s of structs)if(s.t===0&&s.type==='house'&&s.prog>=1&&s.hp>0&&(s.pl|0)===p)n++;return Math.min(POPMAX,POPBASE+n*POPHOUSE)}
function train(type){const b=curB();if(b.type==='academy'||b.type==='market'||b.type==='guild')return;if(type==='cannon'&&!RS.done){msgS='The cannon needs Stonemasonry';msgT=3;snd('err');return}if(!over&&popUsed(CURPL)+popOf(type)>popCap(CURPL)){msgS='Population limit: build houses';msgT=3;snd('err');return}if(type==='king'||type==='guard'){if(b.type!=='castle'){msgS='The king is summoned at your castle';msgT=3;snd('err');return}const p=CURPL|0,K=royalOf(p);
  if(type==='king'&&(K||queue.some(q=>q.type==='king'&&(q.b.pl|0)===p))){msgS='Your kingdom already has a king';msgT=3;snd('err');return}
  if(type==='guard'){if(!K){msgS='Royal guards serve King Naraige: summon him first';msgT=3;snd('err');return}if((K.sq?K.sq.length:0)+queue.filter(q=>q.type==='guard'&&(q.b.pl|0)===p).length>=2){msgS='King Naraige already has his 2 royal guards';msgT=3;snd('err');return}}}
 else if(type!=='peasant'&&b.type==='castle'){msgS='Units are trained in a Barracks: build one, then click it';msgT=3;snd('err');return}if(over||queue.filter(q=>q.b===b).length>=6)return;if(!ok(C[type])){if((C[type].f||0)>(res.f||0)&&CURPL===LPL()){msgS='Not enough food: build farms and put a peasant on each';msgT=3;snd('err')}return}pay(C[type]);const tt=TRAIN[type]*(b.type==='castle'?1:.65)*(RS2.done.drill?.75:1);queue.push({type,left:tt,tot:tt,b})}
const ok=c=>Object.entries(c).every(([k,v])=>res[k]>=v),pay=c=>Object.entries(c).forEach(([k,v])=>res[k]-=v);
/* the rotation chosen when placing a castle, or the next one (clockwise) whose door opens on free ground */
function castleRotAt(c,want){for(let k=0;k<4;k++){const r=(want+k)&3;if(doorTiles({tx:c.tx,ty:c.ty,sz:5,rot:r},1).every(([x,y])=>gOK(x,y)&&!solid(x,y)&&!stairs.has(y*TW+x)))return r}return want&3}
function doorTiles(c,depth){const[dx,dy]=DIR4[(c.rot|0)&3],t=[],z=c.sz||3,a0=(z-3)>>1;for(let a=a0;a<a0+3;a++)for(let d=0;d<depth;d++){if(dy)t.push([c.tx+a,dy>0?c.ty+z+d:c.ty-1-d]);else t.push([dx>0?c.tx+z+d:c.tx-1-d,c.ty+a])}return t}
const inDoor=(tx,ty)=>{for(const c of[CS,CS2])if(c&&c.type==='castle'&&doorTiles(c,1).some(([x,y])=>x===tx&&y===ty))return true;return false};
function pathOK(tx,ty){const i=ty*TW+tx;return gOK(tx,ty)&&ter[i]===0}
const UNIQB={guild:'Guild',academy:'Academy'};
function placeErr(type,tx,ty){if(UNIQB[type]){for(const s of structs)if(s.t===0&&s.type===type&&s.hp>0&&(s.pl|0)===(CURPL|0))return 'Only one '+UNIQB[type]+' per kingdom'}
 if(type==='forester'){const cx=tx+1,cy=ty+1;for(const s of structs)if(s.t===0&&s.type==='forester'&&s.hp>0&&Math.hypot(s.tx+1-cx,s.ty+1-cy)<2*FOR_R+1)return 'Too close to another forester: their planting areas would touch'}return ''}
function valid(tx,ty){return !solid(tx,ty)&&!inDoor(tx,ty)&&!stairs.has(ty*TW+tx)}
let alertT=0,farmT=0;const ALERTS=[];
function startResearch2(k){if(over||RS2.done[k])return;if(RS2.on){msgS='One research at a time: '+RN2[RS2.on]+' is in progress';msgT=3;snd('err');return}if(!hasAcademy(CURPL)){msgS='Build an Academy to research';msgT=3;snd('err');return}if(RPRE[k]&&!(RPRE[k]==='masonry'?RS.done:RS2.done[RPRE[k]])){msgS=RN2[k]+' needs '+(RPRE[k]==='masonry'?'Stonemasonry':RN2[RPRE[k]]);msgT=3;snd('err');return}if(!ok(C[k])){msgS=RN2[k]+' is too expensive';msgT=3;snd('err');return}pay(C[k]);RS2.on=k;RS2.t=0;snd('build');msgS='Researching '+RN2[k]+'...';msgT=3}
function farmCount(p){let n=0;for(const s of structs)if(s.t===0&&s.type==='farm'&&s.prog>=1&&(p===undefined||(s.pl|0)===p))n++;return n}
function extraSim(dt){{for(const s of structs)if(s.rally&&s.t===0&&(s.pl|0)===LPL()&&(s.type!=='barracks'||s===selB)&&REALR()<dt*.9)puff(s.rally.x,s.rally.y,'#7dffa0',2,26)}if(alertT>0)alertT-=dt;for(let i=ALERTS.length-1;i>=0;i--){ALERTS[i].t-=dt;if(ALERTS[i].t<=0)ALERTS.splice(i,1)}
 if(RS2.on){RS2.t+=dt;if(RS2.t>=RT2[RS2.on]){const k=RS2.on;RS2.done[k]=true;if(k==='plate'||k==='mail')setTimeout(()=>{try{icoPart('units')}catch(e){}},0);ach('res');RS2.on=null;snd('fanfare');bannerT=4;bannerS=RN2[k].toUpperCase();bannerS2=({iron:'Your soldiers hit 25% harder',plate:'Your side takes 22% less damage',drill:'Units train 25% faster',steel:'Your soldiers hit 20% harder again',mail:'Your side takes 15% less damage again',tools:'Peasants gather 33% faster',harvest:'Farms yield 50% more food',fletch:'Archers and towers hit 25-40% harder',fire:'Archers set zombies on fire',bastion:'Buildings have 40% more strength',oil:'Walls, gates and towers scald zombies next to them',era:'Iron age: your units hit 10% harder, buildings slowly mend'})[k]}else{msgS='Researching '+RN2[RS2.on]+' '+Math.floor(RS2.t/RT2[RS2.on]*100)+'%';msgT=1}}
}
function startResearch(){if(RS.done||RS.on||over)return;if(!hasAcademy(CURPL)){msgS='Build an Academy to research';msgT=3;snd('err');return}if(!ok(C.upgrade)){msgS='Stonemasonry needs 200 stone and 100 wood';msgT=3;snd('err');return}pay(C.upgrade);RS.on=true;RS.t=0;snd('build');msgS='Researching Stonemasonry...';msgT=3}
function finishResearch(){ach('res');RS.done=true;RS.on=false;Object.assign(C,BTIER?CSTONE:CWOOD);setTimeout(()=>{try{icoPart('tier')}catch(e){}},0);snd('horn');bannerT=5;bannerS='STONE AGE';bannerS2='Select a building and press Upgrade, or use the Stone upgrade tool'}
function doUpgrade(tx,ty){const o=occ.get(ty*TW+tx);if(!o||o.t!==0||o.tier!==0||o.prog<1)return;if(!RS.done){msgS='Stone upgrades need Stonemasonry (Academy)';msgT=3;snd('err');return}const c=UPC[o.type];if(!c)return;if(!ok(c)){msgS='Not enough resources to upgrade';msgT=2;snd('err');return}pay(c);const r=o.hp/o.max;o.max=SH[o.type];o.hp=Math.round(o.max*r);o.tier=1;buildStructMesh(o);refreshNear(o);puff(o.x,o.y,'#d9d9d9',12,80);snd('build',o.x,o.y)}
function build(type,tx,ty){if(type==='spike'){placeSpike(tx,ty);return}if(type==='upgrade'){if(!over)doUpgrade(tx,ty);return}if(over||!ok(C[type]))return;
 if(type==='tower'){const t=tilesFor('tower',tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y))))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;
  let rep=0;for(const[x,y]of t){const w=wallAt(x,y);if(!w)continue;rep++;if(w.garr)w.garr.slice().forEach(ungar);const Rr=RESP[w.pl|0];for(const k in(w.cost||{}))Rr[k]+=w.cost[k];w.hp=-1;w.noCrumble=true;rmStruct(w);for(const[a,b]of w.tiles)if(occ.get(b*TW+a)===w)occ.delete(b*TW+a);structs.splice(structs.indexOf(w),1);refreshNear(w)}
  if(rep){fdDirty=true;if(!MP.on||CURPL===LPL()){msgS='Walls replaced by the tower (refunded)';msgT=3}}
  pay(C.tower);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,'tower',tx,ty,2,false);if(rep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}if((type==='ballista'||type==='trebuchet')&&!RS.done){msgS='Siege weapons need Stonemasonry';msgT=3;snd('err');return}if(type==='upgrade'){doUpgrade(tx,ty);return}const i=ty*TW+tx;const wRep=type==='tower'?wallAt(tx,ty):null;if(type==='ballista'||type==='trebuchet'||type==='raise'||type==='dig'||type==='ramp'||type==='demolish'||type==='rallyc'||type==='rotate'||type==='movec'||wRep){}else if(type==='path'){if(!pathOK(tx,ty))return}else if(!valid(tx,ty))return;
 if(type==='rotate'){rotateB(occ.get(i));return}
 if(type==='movec'){moveCastle(tx,ty);return}
 if(type==='ballista'||type==='trebuchet'){const o=occ.get(i);if(!o||o.type!=='tower'||o.t!==0||o.prog<1){msgS='Mount it on a finished tower';msgT=3;snd('err');return}if(o.weapon){msgS='This tower already has a siege weapon';msgT=3;snd('err');return}pay(C[type]);o.weapon=type;o.aim=buildRot*Math.PI/2;o.wcd=2;buildStructMesh(o);puff(o.x,o.y,'#c9c9c9',10,70);snd('build',o.x,o.y);return}
 if(type==='raise'||type==='dig'||type==='ramp'){tfOrder(type,tx,ty);return}
 if(type==='demolish'&&!occ.get(i)&&pth[i]){pth[i]=0;const Rr=RESP[CURPL|0];for(const k in C.path)Rr[k]+=C.path[k];mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#b9a68a',3,30);snd('click');if(CURPL===LPL()){msgS='Path removed';msgT=2}return}
 if(type==='demolish'&&!occ.get(i)&&stairs.has(i)){const G=rampGroup(i);const q=G.find(k=>tfo.has(k));if(q!==undefined){tfo.delete(q);snd('click');return}tfo.set(i,{t:'unramp',w:0});snd('click');msgS='Peasants will remove this ramp';msgT=3;return}
 if(type==='demolish'){const o=occ.get(i);if(!o||o.t!==0||o===CS||o===CS2||o.type==='castle'||(MP.on&&(o.pl|0)!==CURPL)){msgS='Click one of your buildings (not the castle)';msgT=2;snd('err');return}if(o.prog<1){demolish(o);if(CURPL===LPL()){msgS='Construction cancelled: resources refunded';msgT=3}return}o.dem=!o.dem;o.dp=0;snd('click');if(o.dem){msgS='Peasants will tear it down and recover 100% of the cost';msgT=3}return}
 if(false){const sz=SZ[type],t=tilesFor(type,tx,ty,sz),h0=Math.max(...t.map(([x,y])=>HT[y*TW+x]));pay(C[type]);levelGround(tx,ty,sz,h0);const s=mk(0,type,tx,ty,sz,false);addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});return}
 if(type==='rally'||type==='rallyc'){const w={x:(tx+.5)*TS,y:(ty+.5)*TS};const rs=type==='rallyc'&&({2:1,3:1,4:1})[ter[ty*TW+tx]];if(!gOK(tx,ty)||(solid(tx,ty)&&!rs))return;
  let rb=null;if(type==='rallyc')rb=selB&&selB.type==='castle'&&structs.includes(selB)?selB:HOMEC();
  else{rb=selB&&selB.type==='barracks'&&structs.includes(selB)&&(selB.pl|0)===(CURPL|0)?selB:null;if(!rb){let bd=1e12;for(const s of structs)if(s.t===0&&s.type==='barracks'&&s.prog>=1&&(s.pl|0)===(CURPL|0)){const d=dist(s.x,s.y,w.x,w.y);if(d<bd){bd=d;rb=s}}}}
  if(!rb){if(CURPL===LPL()){msgS='Build a barracks first';msgT=3;snd('err')}return}rb.rally=w;
  if(CURPL===LPL()){msgS=type==='rally'?'Rally point set for this barracks':rs?'Castle rally: new peasants gather this resource':'Castle rally point set';msgT=3;mode=null}snd('order');puff(w.x,w.y,'#7dffa0',10,50);return}
 if(type==='house'||type==='farm'||CONNT.has(type)){const sp=snapM(type,tx,ty);tx=sp[0];ty=sp[1]}
 if(type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'){{const pe=placeErr(type,tx,ty);if(pe){if(!MP.on||CURPL===LPL()){msgS=pe;msgT=3;snd('err')}return}}const t=tilesFor(type,tx,ty,2);if(!t.every(([x,y])=>gOK(x,y)&&valid(x,y)))return;const hs=t.map(([x,y])=>HT[y*TW+x]);if(Math.max(...hs)-Math.min(...hs)>2)return;pay(C[type]);levelGround(tx,ty,2,Math.max(...hs));const s=mk(0,type,tx,ty,2,false);addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',10,70,{soft:1,T:1,s:.4,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='gate'){const ax=gateAxAt(tx,ty),gl=gateLen;if(!gateOK(tx,ty,ax,gl))return;pay(C.gate);const t=tilesFor('gate',tx,ty,1,ax,gl),h0=Math.max(...t.map(([x,y])=>HT[y*TW+x]));t.forEach(([x,y])=>levelGround(x,y,1,h0));const s=mk(0,'gate',tx,ty,1,false,ax,gl);s.gate=true;addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c4b6',8,60,{soft:1,T:1,s:.38,z:.3,vz:.7,g:-.3});snd('build',s.x,s.y);return}
 if(type==='path'){const want=stoneOn()?2:1;if(pth[i]===want)return;pay(C.path);pth[i]=want;mmTile(i);markT(tx,ty);puff((tx+.5)*TS,(ty+.5)*TS,'#d9c9a0',3,30);snd('path',(tx+.5)*TS,(ty+.5)*TS);return}

 if(wRep){if(wRep.garr)wRep.garr.slice().forEach(ungar);const Rr=RESP[wRep.pl|0];for(const k in(wRep.cost||{}))Rr[k]+=wRep.cost[k];wRep.hp=-1;wRep.noCrumble=true;rmStruct(wRep);for(const[x,y]of wRep.tiles)if(occ.get(y*TW+x)===wRep)occ.delete(y*TW+x);structs.splice(structs.indexOf(wRep),1);refreshNear(wRep);fdDirty=true;if(!MP.on||CURPL===LPL()){msgS='Wall replaced by a tower (wall refunded)';msgT=3}}
 pay(C[type]);levelGround(tx,ty,1,HT[i]);const s=mk(0,type,tx,ty,1,false);if(type==='gate')s.gate=true;if(wRep){s.prog=.3;s.hp=Math.max(s.hp,s.max*.3)}addStruct(s);refreshNear(s);puff(s.x,s.y,'#c9c9c9',6,50);snd('build',s.x,s.y)}
function wallAt(tx,ty){const o=occ.get(ty*TW+tx);return o&&o.t===0&&o.type==='wall'&&o.prog>=1&&o.hp>0&&(!MP.on||(o.pl|0)===CURPL)?o:null}
const sel=()=>units.filter(u=>u.sel&&(!MP.on||u.t!==0||(u.pl|0)===CURPL));
function tfOK(tx,ty,rmp){if(!gOK(tx,ty))return false;const i=ty*TW+tx;if(rmp&&stairs.has(i)&&!occ.has(i))return true;if(ter[i]>1&&ter[i]!==5||occ.has(i)||stairs.has(i))return false;return !D4.some(([dx,dy])=>{const s=stairs.get(i+dy*TW+dx);return s&&!s.blk})}
function tfOrder(type,tx,ty){const i=ty*TW+tx;if(tfo.has(i)){const o=tfo.get(i);tfo.delete(i);snd('click');return}
 if(type==='ramp'?!rampOK(tx,ty):!tfOK(tx,ty,true)){msgS=type==='ramp'?'No ramp here: free flat ground only':'Cannot reshape this tile';msgT=2;snd('err');return}
 if(type==='raise'&&HT[i]>=LAND+14){msgS='Too high';msgT=2;snd('err');return}
 if(type==='dig'&&ter[i]===1){msgS='Already water';msgT=2;snd('err');return}
 if(type==='dig'&&HT[i]<=BED){msgS='Bedrock: it cannot be dug';msgT=2;snd('err');return}
 tfo.set(i,{t:type,w:0,d:buildRot&3,pl:CURPL|0});snd('click');
 sel().filter(u=>u.type==='peasant').forEach(u=>{u.job='t';u.tl=-1;u.o=null;if(shelOn)u.nso=1})}
function rampGroup(i){const st=stairs.get(i);if(!st)return[];const seen=new Set([i]),Q=[i];while(Q.length){const k=Q.pop();for(const[dx,dy]of D4){const n=k+dy*TW+dx,s2=stairs.get(n);if(s2&&s2.ax===st.ax&&!seen.has(n)){seen.add(n);Q.push(n)}}}return[...seen]}
function unRamp(i){const s0=stairs.get(i),G=s0&&s0.blk?[i]:rampGroup(i);if(!G.length)return;for(const ii of G){const st=stairs.get(ii);HT[ii]=st.orig!==undefined?st.orig:st.hi;stairs.delete(ii);const x=ii%TW,y=(ii/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(ii)}
 fdDirty=true;GF.clear();ver++;const x=i%TW,y=(i/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS);if(!MP.on||CURPL===LPL()){msgS='Ramp removed';msgT=2}}
function doTf(i){const o=tfo.get(i);if(!o)return;tfo.delete(i);const x=i%TW,y=(i/TW)|0;if(o.t==='ramp'){doRamp(x,y,o.d);return}if(o.t==='unramp'){unRamp(i);return}if(stairs.has(i)){unRamp(i);if(o.t==='dig'&&HT[i]<=BED)return}if(o.t==='dig'&&HT[i]<=BED)return;const stn=o.t==='dig'&&HT[i]<=LAND-3;if(o.t==='raise'&&ter[i]===1)HT[i]=LAND;else HT[i]+=o.t==='raise'?1:-1;if(stn){const Rr=RESP[o.pl|0];if(Rr)Rr.s+=4}if(ter[i]!==1)ter[i]=HT[i]>=ROCKH?5:0;TFL[i]=3;
 for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+dx,y+dy)){markT(x+dx,y+dy);markP(x+dx,y+dy)}mmTile(i);fdDirty=true;GF.clear();puff((x+.5)*TS,(y+.5)*TS,stn?'#9a9aa0':'#9d7a50',10,60);snd(stn?'mine':'dirt',(x+.5)*TS,(y+.5)*TS);if(o.t==='dig')flood(i)}
/* water flows into a dry hole that opens next to it: every connected open tile below the water line fills (buildings and resources stay dry) */
function flood(i0){if(ter[i0]!==0||HT[i0]>=WLV||!D4.some(([dx,dy])=>{const x=i0%TW+dx,y=((i0/TW)|0)+dy;return gOK(x,y)&&ter[y*TW+x]===1}))return;
 const seen=new Set([i0]),Q=[i0],F=[];while(Q.length&&F.length<600){const i=Q.shift();F.push(i);const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*TW+nx;if(!gOK(nx,ny)||seen.has(n))continue;seen.add(n);if(ter[n]===0&&HT[n]<WLV&&!occ.has(n)&&!stairs.has(n))Q.push(n)}}
 for(const i of F){ter[i]=1;amt[i]=0;pth[i]=0;SAPL.delete(i);tfo.delete(i);const x=i%TW,y=(i/TW)|0;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b)){markT(x+a,y+b);markP(x+a,y+b)}mmTile(i)}
 const FS=new Set(F);for(const u of units){if(u.hp<=0||u.gar)continue;const tx=Math.floor(u.x/TS),ty=Math.floor(u.y/TS);if(!FS.has(ty*TW+tx))continue;const ft=freeTile(tx,ty);if(ft){u.x=(ft[0]+.5)*TS;u.y=(ft[1]+.5)*TS}}
 fdDirty=true;GF.clear();ver++;const x=i0%TW,y=(i0/TW)|0;puff((x+.5)*TS,(y+.5)*TS,'#8fc4e8',14,70,{T:.8,z:.2,vz:1.6,g:6,s:.12});snd('splash',(x+.5)*TS,(y+.5)*TS)}
function tfNear(tx,ty){return true}
function rampFree(i){return ter[i]===0&&!occ.has(i)&&!stairs.has(i)&&HT[i]<LAND+14}
function rampOK(tx,ty){return gOK(tx,ty)&&rampFree(ty*TW+tx)&&tfNear(tx,ty)}
function doRamp(x,y,d){const i=y*TW+x;if(!gOK(x,y)||!rampFree(i)){msgS='The ramp could not be built here';msgT=2;return}const[dx,dy]=D4[d&3],h=HT[i];
 stairs.set(i,{ax:dx?0:1,sg:(dx+dy)>0?1:-1,lo:h,hi:h+1,nat:1,orig:h,built:1,blk:1});
 for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(gOK(x+a,y+b))markT(x+a,y+b);mmTile(i);
 fdDirty=true;GF.clear();ver++;puff((x+.5)*TS,(y+.5)*TS,'#9d7a50',14,70);snd('dirt',(x+.5)*TS,(y+.5)*TS)}
function demolish(s){if(!structs.includes(s))return;if(s.garr)s.garr.slice().forEach(ungar);const R=RESP[s.pl|0];for(const k in(s.cost||{}))R[k]+=s.cost[k];s.hp=-1;s.dem=false;s.noCrumble=true;puff(s.x,s.y,'#c9b899',18,90,{T:.8,z:.4,vz:2,g:5,s:.16});snd('build',s.x,s.y);if(!MP.on||(s.pl|0)===LPL()){msgS='Demolished: resources recovered';msgT=3}}
function nearestTf(u){let b=-1,bd=1e9;for(const[i]of tfo){const x=i%TW,y=(i/TW)|0,d=dist(u.x,u.y,(x+.5)*TS,(y+.5)*TS);if(d<bd&&exposed(x,y)&&reach(x,y)){bd=d;b=i}}return b}
function buy(k){if(over)return;if(k==='demolish'&&selB&&structs.includes(selB)&&selB!==HOMEC()&&selB.type!=='castle'){build('demolish',selB.tx,selB.ty);return}if(k==='repair'){const s=selB&&structs.includes(selB)?selB:HOMEC();if(s)repairB(s.sid);return}if(TRADEK.has(k)){trade(k);return}if(k==='rotate'){if(selB&&selB.t===0&&ROTT.has(selB.type))build('rotate',selB.tx,selB.ty);return}if(k==='tier'){if(!RS.done){msgS='Stone needs Stonemasonry';msgT=3;snd('err');return}setTier(!BTIER);msgS='New buildings: '+(BTIER?'stone':'wood');msgT=2;snd('click');return}if(k==='upgrade'){startResearch();return}if(k in RT2){startResearch2(k);return}if((k==='ballista'||k==='trebuchet')&&!RS.done){msgS='Siege weapons need Stonemasonry';msgT=3;snd('err');return}if(k in T){mode=null;snd('click');train(k)}else{units.forEach(u=>u.sel=false);mode=mode===k?null:k}}

function army(){units.forEach(u=>u.sel=u.t===0&&u.type!=='peasant'&&(!MP.on||(u.pl|0)===CURPL))}
/* order fields: Dijkstra over the walk grid where roads are cheaper (dirt 4, stone 3, grass 6), searched in a window that grows when
   the detour leaves it; an unreachable target sends the group to the closest tile they can actually reach (alt) */
function dijW(seeds,pl,x0,y0,w,h){x0=Math.max(0,x0);y0=Math.max(0,y0);w=Math.min(w,TW-x0);h=Math.min(h,TH-y0);ensureRect(x0,y0,w,h);gateSolid=!pl;
 const F=new Uint16Array(w*h).fill(65535),B=[[],[],[],[],[],[],[],[]];let pend=0;
 for(const[sx,sy]of seeds){if(sx<x0||sy<y0||sx>=x0+w||sy>=y0+h)continue;const k=(sy-y0)*w+sx-x0;if(F[k]===0)continue;F[k]=0;B[0].push(k);pend++}
 for(let d=0;pend>0&&d<65000;d++){const q=B[d&7];while(q.length){const k=q.pop();pend--;if(F[k]!==d)continue;const lx=k%w,ly=(k/w)|0,tx=lx+x0,ty=ly+y0,a=ty*TW+tx;
   for(const[dx,dy]of D4){const nx=lx+dx,ny=ly+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx,gx=tx+dx,gy=ty+dy,gi=gy*TW+gx,nd=d+(pth[gi]===2?3:pth[gi]?4:6);
    if(nd>=F[n]||solid(gx,gy)||!canStep(a,gi))continue;F[n]=nd;B[nd&7].push(n);pend++}}}
 gateSolid=true;return{F,x0,y0,w,h}}
function mkG(tx,ty,sx,sy,quick){return{ver:-1,S:null,tx,ty,sx,sy,alt:null,big:0,q:quick?1:0,mk(){const ft=freeTile(tx,ty);this.alt=null;this.ver=ver;if(!ft){this.S=null;return}
  const si=Math.floor(this.sx),sj=Math.floor(this.sy);let x0,y0,x1,y1;
  for(const m of quick?[24]:this.big?[160]:[24,72,160]){x0=Math.floor(Math.min(tx,sx))-m;y0=Math.floor(Math.min(ty,sy))-m;x1=Math.ceil(Math.max(tx,sx))+m;y1=Math.ceil(Math.max(ty,sy))+m;
   if(x1-x0>460){const c=(tx+si)>>1;x0=c-230;x1=c+230}if(y1-y0>460){const c=(ty+sj)>>1;y0=c-230;y1=c+230}
   this.S=dijW([ft],true,x0,y0,x1-x0,y1-y0);if(quick||fv(this.S,si,sj)<65535)return}
  const st=freeTile(si,sj);if(!st)return;const Bf=bfsW([st],true,x0,y0,x1-x0,y1-y0);let bk=-1,bd=1e18;
  for(let k=0;k<Bf.F.length;k++){if(Bf.F[k]===65535)continue;const x=Bf.x0+k%Bf.w,y=Bf.y0+((k/Bf.w)|0),d=(x-tx)*(x-tx)+(y-ty)*(y-ty);if(d<bd||(d===bd&&Bf.F[k]<Bf.F[bk])){bd=d;bk=k}}
  if(bk<0)return;const bx=Bf.x0+bk%Bf.w,by=Bf.y0+((bk/Bf.w)|0);this.S=dijW([[bx,by]],true,x0,y0,x1-x0,y1-y0);this.alt={x:(bx+.5)*TS,y:(by+.5)*TS}}}}
const FRM_COLS=5;
function slotPos(C,j){const f=[Math.sin(C.fm||0),Math.cos(C.fm||0)],p=[f[1],-f[0]];if(C.type==='king'){const s=j?1:-1;return{x:C.x+p[0]*s*30-f[0]*8,y:C.y+p[1]*s*30-f[1]*8}}const row=j>=FRM_COLS?1:0,col=(j%FRM_COLS)-2;return{x:C.x-f[0]*(34+row*30)+p[0]*col*26,y:C.y-f[1]*(34+row*30)+p[1]*col*26}}
function leaveSquad(u){if(u.cap){if(u.cap.sq)u.cap.sq=u.cap.sq.filter(f=>f!==u);u.cap=null}}
function royalSpawn(nu,b){const pl=nu.pl|0;
 if(nu.type==='king'){nu.sq=[];nu.fm=Math.PI;for(const q of units)if(q.t===0&&q.type==='guard'&&q.hp>0&&(q.pl|0)===pl&&!q.cap&&nu.sq.length<2){q.cap=nu;q.rg=1;nu.sq.push(q)}
  while(nu.sq.length<2){const p=spawnPos(b),q=mkU(0,'guard',p.x,p.y);q.cap=nu;q.rg=1;units.push(q);nu.sq.push(q)}
  if(pl===LPL()){bannerT=4.5;bannerS='LONG LIVE KING NARAIGE';bannerS2='King Naraige rides out with his royal guard';snd('fanfare');}}
 else{const K=royalOf(pl);nu.rg=1;if(K){if(!K.sq)K.sq=[];if(K.sq.length<2){nu.cap=K;K.sq.push(nu)}}}}
function kingFell(u){if(u.kdead)return;u.kdead=1;if(u.sq){u.sq.forEach(f=>{f.cap=null});u.sq=null}if((u.pl|0)===LPL()){bannerT=5;bannerS='KING NARAIGE HAS FALLEN';bannerS2=u.conv?'...and he rises among the dead':'His royal guard fights on';snd('horn');ALERTS.push({x:u.x,y:u.y,t:6})}}
function disband(C){if(C.sq)C.sq.forEach(f=>{f.cap=null});C.sq=null}
function groupSel(){const S=sel(),C=S.find(u=>u.type==='captain');if(!C){msgS='Select a captain first';msgT=3;return}
 if(!C.sq)C.sq=[];const free=u=>u.t===0&&!u.cap&&u.type!=='peasant'&&u.type!=='captain'&&u.type!=='king'&&!u.rg&&u.hp>0;
 let cand=S.filter(free);if(!cand.length)cand=units.filter(u=>free(u)&&dist(u.x,u.y,C.x,C.y)<TS*16).sort((a,b)=>dist(a.x,a.y,C.x,C.y)-dist(b.x,b.y,C.x,C.y));
 for(const u of cand){if(C.sq.length>=10)break;C.sq.push(u);u.cap=C;u.o=null;u.sel=true}
 msgS='Squad: '+C.sq.length+' / 10 soldiers';msgT=3;if(C.sq.length)puff(C.x,C.y,'#ffd23c',8,50)}
function ungroupSel(){let n=0;for(const C of sel())if(C.type==='captain'&&C.sq&&C.sq.length){n+=C.sq.length;disband(C)}if(n){msgS='Squad disbanded';msgT=3}}
const RGS=27,RGF=-20;
function royalPost(K,j,fa){const f=[Math.sin(fa),Math.cos(fa)],p=[f[1],-f[0]],s=j?1:-1;return{x:K.x+p[0]*s*RGS+f[0]*RGF,y:K.y+p[1]*s*RGS+f[1]*RGF}}
