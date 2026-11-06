/* ================= Extras: forge icons, control groups, alerts, chat & pings, daily map ================= */
IC.iron=ICN(g=>{ln(g,3.5,12.5,12,4,'#2a303a',3.2);ln(g,3.5,12.5,12,4,'#eef2f8',1.8);ln(g,3.2,9.6,7,13.4,'#6a4a10',2.4);ln(g,3.2,9.6,7,13.4,'#f0c040',1.4);poly(g,[[12.6,1.2],[13.4,3],[15.2,3.8],[13.4,4.6],[12.6,6.4],[11.8,4.6],[10,3.8],[11.8,3]],'#ffd23c','#7a5a00',.5)});
IC.plate=ICN(g=>{poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5],[2.8,9],[2.4,3.4]],lgr(g,2,2,14,14,'#d8dde8','#6d7480'),'#2f343d',1);poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5]],'rgba(0,0,0,.2)');ln(g,8,3,8,12.2,'#e0b030',1.4);ln(g,4.4,6.4,11.6,6.4,'#e0b030',1.4)});
IC.drill=ICN(g=>{circ(g,8,8.6,6,lgr(g,3,3,13,14,'#f6e9d2','#c4a37a'),'#5a3a1a',1);ln(g,8,8.6,8,4.6,'#4a2c12',1.4);ln(g,8,8.6,11,10.4,'#4a2c12',1.4);rrg(g,6.2,1.2,3.6,2,.6,'#9a6c3c','#3a220e',.7)});
IC.house=ICN(g=>{rrg(g,2.5,7,11,7.5,.8,lgr(g,0,7,0,14,'#e6d4ac','#b89a68'),'#3a2a14',.9);poly(g,[[1,7.4],[8,1.6],[15,7.4]],lgr(g,0,2,0,8,'#d0603e','#a03a24'),'#3a1a10',1);rrg(g,6.6,9.6,2.8,4.9,.5,'#6a4420','#2a1808',.7);rrg(g,10,8.8,2.2,2.2,.3,'#7ec8e8','#2a3a4a',.6)});
IC.rally=ICN(g=>{ln(g,4,1.5,4,14.5,'#3a2410',1.6);poly(g,[[4.6,2],[13.5,4.4],[4.6,7.6]],lgr(g,4,2,14,8,'#8dffb0','#2fa05a'),'#124a28',.9);circ(g,4,14.6,1.4,'#6a4a2a','#2a1808',.6)});
IC.market=ICN(g=>{rrg(g,2.5,8,11,6,.6,lgr(g,0,8,0,14,'#c4904e','#7a5228'),'#3a2410',.9);for(let i=0;i<4;i++)poly(g,[[1.5+i*3.25,7.8],[4.75+i*3.25,7.8],[4.2+i*3.25,3],[2.1+i*3.25,3]],i%2?'#f2ead8':'#c0392b','#4a1a10',.6);circ(g,8,11,1.8,'#ffd23c','#8a5a00',.6)});
IC.forester=ICN(g=>{rrg(g,1.4,7.6,9.2,6.6,.6,lgr(g,0,7,0,14,'#9a6a3a','#6a4424'),'#2a1808',.9);for(const y of[9.4,11.4])ln(g,1.8,y,10.2,y,'rgba(40,20,8,.55)',.7);poly(g,[[.4,8],[6,3.2],[11.6,8]],lgr(g,0,3,0,8,'#76a84c','#3f6a2a'),'#1a3010',.9);rrg(g,4.7,10.2,2.4,4,.4,'#4a2c14','#1a0c04',.6);ln(g,13.2,14.6,13.2,9,'#6a4424',1.5);circ(g,13.2,7.4,2.7,lgr(g,11,5,15,10,'#8de06a','#3f8a2a'),'#1a4010',.8)});
IC.guild=ICN(g=>{rrg(g,1.6,9.2,12.8,5.6,.6,lgr(g,0,9,0,15,'#e0d6c2','#a09484'),'#3a3428',.9);ln(g,1.6,12,14.4,12,'rgba(58,52,40,.45)',.7);ln(g,6,9.2,6,12,'rgba(58,52,40,.45)',.7);ln(g,10.5,12,10.5,14.8,'rgba(58,52,40,.45)',.7);ln(g,3.4,8.4,11.4,1.8,'#6a4424',1.9);rrg(g,9.2,.5,4.8,3.1,.5,lgr(g,9,0,14,4,'#e4e8f0','#7a8090'),'#1a1a24',.8);ln(g,12.6,8.4,6.2,3,'#8a6a3a',1.5);poly(g,[[2.4,.8],[7.2,2.6],[5,5.4]],lgr(g,2,1,7,5,'#eef2f8','#8a90a0'),'#1a1a24',.7)});
IC.torch=ICN(g=>{ln(g,8,15,8,7,'#5a3a1a',2.4);ln(g,8,15,8,7,'#a8783e',1.2);rrg(g,5,5,6,3,.4,'#4a4a52','#1a1a20',.7);poly(g,[[8,.8],[11,5],[5,5]],lgr(g,0,1,0,5,'#fff1a0','#ff8a2a'),'#8a3a0a',.6)});
{const TRIC={},tic=(k,a,b)=>{const A=IC[a],B2=IC[b],o=TRIC[k];if(o&&o.a===A&&o.b===B2)return o.c;const c=cvs(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(A,0,0,44,44);g.drawImage(B2,22,22,42,42);TRIC[k]={a:A,b:B2,c};return c};
 for(const[k,a,b]of[['sellw','wood','coin'],['sells','stone','coin'],['buyw','coin','wood'],['buys','coin','stone'],['sellf','food','coin'],['buyf','coin','food']])Object.defineProperty(IC,k,{get:()=>tic(k,a,b),enumerable:true,configurable:true})}
IC.food=ICN(g=>{ln(g,11.6,1.2,9.4,8.6,'#8a6a1a',1.1);for(let k=0;k<4;k++){const y=2+k*1.45,x=11.3-k*.5;circ(g,x-1,y+.5,1.05,'#f0c850','#7a5a10',.5);circ(g,x+1,y+.2,1.05,'#e8bc40','#7a5a10',.5)}rrg(g,1.6,7.4,12.4,6.8,3.4,lgr(g,0,7,0,14,'#f2b860','#a8601c'),'#4a2608',.9);for(const x of[5,8,11])ln(g,x-1,9.4,x+1.2,11.6,'#ffe6b0',1.1)});
IC.rallyc=IC.rally;IC.repair=ICN(g=>{ln(g,3.2,14,10.4,6.8,'#3a2410',3.2);ln(g,3.2,14,10.4,6.8,'#b07a40',1.8);poly(g,[[7.2,2.6],[13.8,9.2],[11.6,11.4],[5,4.8]],lgr(g,6,3,13,11,'#e4e8f0','#7a8090'),'#1a1a24',.9);});IC.rotate=ICN(g=>{circ(g,8,8,4.6,null,'#e8d8a8',1.8);poly(g,[[9,1.5],[14,4],[9,6.5]],'#e8d8a8','#3a2410',.8)});IC.movec=ICN(g=>{rrg(g,2,6,12,8,.6,lgr(g,0,6,0,14,'#c8c8d0','#8a8a98'),'#2a2a38',.9);poly(g,[[1,15.5],[8,12.5],[15,15.5]],'#7dffa0','#124a28',.7)});IC.academy=ICN(g=>{rrg(g,2,7,12,7.5,.6,lgr(g,0,7,0,14,'#efe8d4','#b8ad90'),'#3a2a14',.9);poly(g,[[1,7.6],[8,2.2],[15,7.6]],lgr(g,0,2,0,8,'#4a6cb8','#2a3f80'),'#16204a',1);circ(g,8,2.2,1.3,'#ffd23c','#8a6a10',.6);rrg(g,6.6,9.8,2.8,4.7,.5,'#5a3a1e','#2a1808',.7);rrg(g,3,9,2,2.4,.3,'#7ec8e8','#2a3a4a',.5);rrg(g,11,9,2,2.4,.3,'#7ec8e8','#2a3a4a',.5)});
IC.steel=ICN(g=>{ln(g,3,13,12,4,'#2a303a',3);ln(g,3,13,12,4,'#cfe4ff',1.7);ln(g,3.2,10,6.6,13.4,'#2a303a',2.6);ln(g,3.2,10,6.6,13.4,'#6fd0ff',1.4);poly(g,[[12.6,1.2],[13.6,3.2],[15.4,4],[13.4,4.8],[12.4,6.6],[11.6,4.6],[9.8,3.8],[11.8,3.2]],'#ffffff','#2a303a',.6)});
IC.mail=ICN(g=>{poly(g,[[8,1.5],[13.6,3.4],[13.2,9],[8,14.5],[2.8,9],[2.4,3.4]],lgr(g,2,2,14,14,'#bfc8d8','#5a6478'),'#2f343d',1);for(let y=4;y<13;y+=2.2)for(let x=4+((y/2.2|0)%2)*1.2;x<12.5;x+=2.4)circ(g,x,y,.9,'rgba(255,255,255,.55)','#2f343d',.3)});
IC.tools=ICN(g=>{ln(g,3,13.5,11,3.5,'#5a3a1a',2);ln(g,3,13.5,11,3.5,'#c4904e',1.1);poly(g,[[9,1.8],[14.6,4.6],[13.6,7],[8.6,4.4]],'#cfd6e2','#2f343d',.8);ln(g,13.5,13.5,5,5,'#5a3a1a',2);ln(g,13.5,13.5,5,5,'#c4904e',1.1)});
IC.harvest=ICN(g=>{ln(g,8,14.5,8,6,'#8a6a2a',1.2);for(let i=0;i<4;i++){const y=3+i*2.4;poly(g,[[8,y],[5.6,y-1.6],[6.4,y+.4]],'#e0c23c','#8a6a1a',.5);poly(g,[[8,y],[10.4,y-1.6],[9.6,y+.4]],'#e0c23c','#8a6a1a',.5)}poly(g,[[8,.6],[7,2.6],[9,2.6]],'#f0d84a','#8a6a1a',.5)});
IC.convoy=ICN(g=>{rrg(g,3,3.5,10,6.5,.8,lgr(g,0,3.5,0,10,'#d6a560','#8a5a2a'),'#3a2410',.9);ln(g,3.5,6.8,12.5,6.8,'#5a3a1a',.8);ln(g,8,4,8,9.6,'#5a3a1a',.8);rrg(g,1.5,9.6,13,2,.6,'#7a4e24','#3a2410',.8);circ(g,4.5,12.6,2,'#4a3420','#1a1008',.8);circ(g,11.5,12.6,2,'#4a3420','#1a1008',.8);circ(g,4.5,12.6,.7,'#c9a060',null,0);circ(g,11.5,12.6,.7,'#c9a060',null,0)});
IC.fire=ICN(g=>{ln(g,2.5,13.5,11.5,4.5,'#6a4a2a',1.4);poly(g,[[2,12],[4.6,12.6],[3.4,15.2]],'#e05a4a','#5a1a14',.6);poly(g,[[11,2.2],[14.6,1.2],[13.6,5.2],[12.6,6.4],[10.2,5.6]],'#ff8a2a','#7a2a0a',.7);poly(g,[[12,3],[13.6,2.6],[13,4.8],[11.6,4.6]],'#ffe066',null,0)});
IC.fletch=ICN(g=>{ln(g,2.5,13.5,13,2.5,'#6a4a2a',1.4);poly(g,[[13,1.5],[15,3.6],[12.4,3.8]],'#e8eaf0','#2a303a',.7);poly(g,[[2,12],[4.6,12.6],[3.4,15.2]],'#e05a4a','#5a1a14',.6);poly(g,[[3.6,10.6],[6.2,11.4],[4.8,13.6]],'#e05a4a','#5a1a14',.6)});
IC.bastion=ICN(g=>{rrg(g,2,6,12,8.5,.6,lgr(g,0,6,0,15,'#b8bfcc','#6a7280'),'#2a303a',.9);[2,6,10].forEach(x=>rrg(g,x,3.4,3.2,3.4,.3,'#a8b0be','#2a303a',.7));rrg(g,6.4,9.8,3.2,4.7,1.4,'#3a2a1a','#1a1208',.7)});
IC.farm=IC.farm||ICN(g=>{rrg(g,1.5,6,13,8,1,lgr(g,0,6,0,14,'#8a5a2a','#5a3a1a'),'#2a1808',.9);[3,5.6,8.2,10.8].forEach((x,i)=>rrg(g,x,7,1.8,6,.5,i%2?'#e0c23c':'#6fb13e'));poly(g,[[2,6],[8,1.5],[14,6]],'#c9553a','#5a1a0a',.8)});
/* ---- control groups: Shift+1..9 recall, Ctrl+1..9 (or Shift+Alt+1..9) save ---- */
const CG={};
addEventListener('keydown',e=>{if(!started||over||document.activeElement===nmI||document.activeElement===mpChatI)return;const m=/^Digit([1-9])$/.exec(e.code);
 if(!m||!(e.ctrlKey||e.shiftKey||e.metaKey))return;const d=m[1];e.preventDefault();e.stopImmediatePropagation();
 if(e.ctrlKey||e.metaKey||(e.shiftKey&&e.altKey)){const S=sel().map(u=>u.uid);CG[d]=S;msgS='Group '+d+' saved ('+S.length+')';msgT=2;snd('click')}
 else{const S=new Set(CG[d]||[]);const L=units.filter(u=>S.has(u.uid)&&u.hp>0&&!u.gar);if(!L.length){msgS='Group '+d+' is empty';msgT=2;return}
  const again=CG.last===d&&Date.now()-(CG.lt||0)<450;units.forEach(u=>u.sel=false);L.forEach(u=>u.sel=true);mode=null;CG.last=d;CG.lt=Date.now();if(again){CAM.x=L[0].x/TS;CAM.z=L[0].y/TS}msgS='Group '+d+' ('+L.length+')';msgT=2;snd('select')}},true);
/* ---- Tab: jump to the last attack ---- */
addEventListener('keydown',e=>{if(e.key==='F8'&&document.activeElement!==mpChatI&&document.activeElement!==nmI){e.preventDefault();bugReport();return}if(e.key==='F10'){e.preventDefault();devToggle();return}if((e.key==='F2'||e.key==='²'||e.key==='`')&&started&&document.activeElement!==mpChatI&&document.activeElement!==nmI){e.preventDefault();troopsOpen=!troopsOpen}});
addEventListener('keydown',e=>{if(e.key==='Tab'&&started){e.preventDefault();const a=ALERTS[ALERTS.length-1];if(a){CAM.x=a.x/TS;CAM.z=a.y/TS}else{msgS='No recent attack';msgT=2}}});
/* ---- daily map ---- */
function dailyMap(){const d=Math.floor(Date.now()/864e5),R=rngf(d*2654435761%4294967296);SEED=R()*500;GPR={fq:.009+R()*.007,wl:.28+R()*.08,mt:.5+R()*.1,rv:.008+R()*.008,rg:.93+R()*.03,am:.7+R()*.5,tr:.5+R()*.2,gd:.8+R()*.5,tc:.003+R()*.01};if(typeof mpWorldSync==='function')mpWorldSync()}
/* ---- co-op chat & pings ---- */
const mpChatBox=document.createElement('div'),mpChatI=document.createElement('input');
Object.assign(mpChatBox.style,{position:'fixed',left:'8px',bottom:'210px',zIndex:9,maxWidth:'46vw',pointerEvents:'none',font:'400 18px VT323,"Courier New",monospace',color:'#ffffff',textShadow:'2px 2px 0 #3f3f3f'});
Object.assign(mpChatI.style,{position:'fixed',left:'8px',bottom:'180px',width:'min(360px,60vw)',zIndex:10,display:'none',background:'rgba(12,16,24,.88)',color:'#f2e4c4',border:'1px solid #c9a24f',borderRadius:'2px',padding:'5px 9px',font:'400 16px "NaxNum","Marcellus",Georgia,serif',outline:'none',boxShadow:'0 0 0 1px #07060b'});
mpChatI.placeholder='Message to your partner (Enter to send)';mpChatI.maxLength=120;document.body.appendChild(mpChatBox);document.body.appendChild(mpChatI);
function chatLine(who,t){const d=document.createElement('div');d.style.cssText='background:rgba(0,0,0,.5);padding:1px 6px;margin-top:0;width:fit-content';const b=document.createElement('span');b.style.color=who==='You'?'#ffff55':'#55ffff';b.textContent='<'+who+'> ';d.appendChild(b);d.appendChild(document.createTextNode(t));mpChatBox.appendChild(d);setTimeout(()=>d.remove(),9000);while(mpChatBox.children.length>6)mpChatBox.firstChild.remove()}
mpChatI.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){const t=mpChatI.value.trim();if(t&&MP.conn){mpSend({k:'chat',t});chatLine('You',t)}mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}else if(e.key==='Escape'){mpChatI.value='';mpChatI.style.display='none';mpChatI.blur()}});
addEventListener('keydown',e=>{if(e.key==='Enter'&&MP.conn&&started&&document.activeElement!==mpChatI&&document.activeElement!==nmI){e.preventDefault();mpChatI.style.display='block';mpChatI.focus()}},true);
const PINGS=[];
const PNGT=[['Look here','#ffd23c'],['Defend here','#6fa8ff'],['Gather here','#7fe08a'],['Attack here','#ff6a6a']];
function addPing(x,y,mine,p){p=p>=0&&p<4?p|0:0;PINGS.push({x,y,t:p?7:5,mine,p});snd('click')}
function drawPings(){if(!started||!PINGS.length)return;ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,DPR),dt=Math.min(.05,(performance.now()-(drawPings.t||performance.now()))/1000)||.016;drawPings.t=performance.now();
 for(let i=PINGS.length-1;i>=0;i--){const p=PINGS[i];p.t-=dt;if(p.t<=0){PINGS.splice(i,1);continue}
  const q=scr(p.x/TS,(HT[(p.y/TS|0)*TW+(p.x/TS|0)]||0)+.3,p.y/TS);if(!q.ok)continue;const r=(10+((p.t*2)%1)*22)*k;
  ctx.strokeStyle=p.p?PNGT[p.p][1]:p.mine?'rgba(255,210,60,.95)':'rgba(120,220,255,.95)';ctx.lineWidth=2.5*k;ctx.beginPath();ctx.arc(q.x,q.y,r,0,6.283);ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,3*k,0,6.283);ctx.fillStyle=ctx.strokeStyle;ctx.fill();
  if(p.p){ctx.save();ctx.scale(k,k);const lab=PNGT[p.p][0],w=tw(lab,.8)+10,lx=q.x/k-w/2,ly=q.y/k-34;ctx.fillStyle='rgba(20,14,8,.78)';ctx.fillRect(lx,ly,w,13);ctx.fillStyle=PNGT[p.p][1];ctx.fillRect(lx,ly+12,w,1.5);T_(lab,lx+5,ly+3,'#ffffff',.8);ctx.restore()}}}
cv.addEventListener('pointerdown',e=>{if(e.altKey&&MP.conn&&started){const w=wpos(),pt=(e.shiftKey?1:0)+(e.ctrlKey?2:0)+(e.shiftKey&&e.ctrlKey?0:0),pp=e.shiftKey&&e.ctrlKey?3:e.shiftKey?1:e.ctrlKey?2:0;mpSend({k:'ping',x:w.x,y:w.y,p:pp});addPing(w.x,w.y,true,pp);e.stopImmediatePropagation();e.preventDefault()}},true);
const _mm=mpMsg;mpMsg=function(m){if(m.k==='chat'){chatLine('Partner',String(m.t||'').slice(0,120));snd('click')}else if(m.k==='ping')addPing(+m.x,+m.y,false,m.p|0);else return _mm(m)};
/* partner cursor + castle site during placement */
MP.cur=null;let _pcT=0,_pcL='';
function pkOther(){if(PK.oth)return PK.oth;const g=new THREE.Group(),m=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,depthTest:false});
 const cone=new THREE.Mesh(new THREE.ConeGeometry(5,14,10),m(0x5aa9ff));cone.rotation.x=Math.PI;cone.position.y=12;cone.renderOrder=9;
 const ring=new THREE.Mesh(new THREE.RingGeometry(10,12,40),m(0x5aa9ff));ring.rotation.x=-Math.PI/2;ring.position.y=1;ring.renderOrder=9;
 const cv2=document.createElement('canvas');cv2.width=256;cv2.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv2),depthTest:false,transparent:true}));sp.scale.set(40,10,1);sp.position.y=28;sp.renderOrder=10;
 g.add(cone,ring,sp);g.userData={cv:cv2,sp,ring,cone,nm:null};PK.sc.add(g);PK.oth=g;return g}
function pkOthName(g,t){if(g.userData.nm===t)return;g.userData.nm=t;const c=g.userData.cv,x=c.getContext('2d');x.clearRect(0,0,256,64);x.font='700 28px '+FFT;x.textAlign='center';x.lineWidth=6;x.strokeStyle='#0b0810';x.fillStyle='#f3d27a';x.strokeText(t,128,42);x.fillText(t,128,42);g.userData.sp.material.map.needsUpdate=true}
const _rp=renderPick;renderPick=function(dt){if(!PK||PK.key!==SEED)pkBuild();
 if(MP.conn){const h=PK.hit||pickPos;if(h&&performance.now()-_pcT>90){const k=h.tx+','+h.ty;if(k!==_pcL){_pcL=k;mpSend({k:'pc',tx:h.tx,ty:h.ty})}_pcT=performance.now()}
  const g=pkOther(),P=MP.theirs||MP.cur;
  if(P&&PK.Y){const i=Math.max(0,Math.min(PVW-1,Math.round((P.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((P.ty-1)/PVS)));g.visible=true;g.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);
   const placed=!!MP.theirs;g.userData.ring.scale.setScalar(placed?1.6:1);g.userData.cone.position.y=12+(placed?0:Math.sin(clockT*5)*1.5);pkOthName(g,(MP.pname||'Partner')+(placed?' - castle':''))}else g.visible=false}
 else if(PK.oth)PK.oth.visible=false;
 _rp(dt)};
const _mm2=mpMsg;mpMsg=function(m){if(m.k==='pc'){MP.cur={tx:+m.tx,ty:+m.ty}}else return _mm2(m)};
IC.storage=ICN(g=>{rrg(g,1,6,7,7,.8,lgr(g,0,6,0,13,'#c4904e','#8a5a2a'),'#3a2410',.9);rrg(g,8,8,6,5,.8,lgr(g,0,8,0,13,'#b8844a','#7a4a22'),'#3a2410',.9);rrg(g,4,1.5,7,5,.8,lgr(g,0,1.5,0,6.5,'#d6b36a','#a07a3a'),'#3a2410',.9);ln(g,1,9.5,8,9.5,'#4a3418',1);ln(g,4.5,4,10.5,4,'#6a4a1a',1)});
IC.ramp=ICN(g=>{poly(g,[[1,13],[1,10],[15,3],[15,13]],lgr(g,0,3,0,13,'#c9a060','#8a6238'),'#3a2410',.9);for(let i=0;i<5;i++)ln(g,3+i*2.4,12.2-i*1.4,3+i*2.4,9.8-i*1.4,'#5a3d1e',.9);poly(g,[[1,13],[15,13],[15,14.5],[1,14.5]],'#5fae48','#244a1c',.6)});
IC.demolish=ICN(g=>{poly(g,[[2,13],[2,7],[8,3],[14,7],[14,13]],lgr(g,0,3,0,13,'#b79a76','#7a5a3a'),'#3a2410',.9);ln(g,3,3,13,13,'#e04a3a',2.2);ln(g,13,3,3,13,'#e04a3a',2.2)});
Object.defineProperty(IC,'tier',{get:()=>RS.done&&BTIER?IC.stone:IC.wood,configurable:true,enumerable:true});
/* QoL: auto-pause when the tab is hidden (solo), Delete = demolish the selected building */
/* alt-tab / hidden tab: solo games pause themselves (and keys held down are released); co-op keeps simulating so the partner is never stalled */
let autoPaused=false;
function focusLost(why){for(const k in keys)keys[k]=false;ptr=null;box=null;mmDrag=false;sliderDrag=null;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)focusLost('tab hidden')});
addEventListener('blur',()=>focusLost('window inactive'));
/* while the tab is hidden requestAnimationFrame stops: keep the co-op lockstep running from timers and from incoming packets */
let bgLast=0;
function bgTick(){if(document.hidden&&!MP.on&&started&&inGame&&!over&&!paused){const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(30,(n-bgLast)/1000);if(e<.05)return;bgLast=n;try{while(e>.001){const d=Math.min(.05,e);for(let k=0;k<spd;k++)update(d);e-=d}}catch(er){}return}
 if(!(document.hidden&&MP.on&&started&&!over)){bgLast=0;return}const n=performance.now();if(!bgLast)bgLast=n-100;let e=Math.min(2,(n-bgLast)/1000);if(e<.03)return;bgLast=n;
 try{while(e>0){const d=Math.min(.25,e);mpFrame(d);e-=d;if(MP.stall)break}}catch(er){}}
setInterval(bgTick,100);try{const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),200)'],{type:'text/javascript'})));wk.onmessage=()=>{if(document.hidden)bgTick()}}catch(e){}
addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&inGame&&!over&&selB&&structs.includes(selB)&&selB.t===0&&selB.type!=='castle'&&document.activeElement===document.body){e.preventDefault();build('demolish',selB.tx,selB.ty)}});

addEventListener('keydown',e=>{if(!started||over||document.activeElement===nmI)return;});

/* Arcane look for the co-op lobby (DOM): navy panel, brass rim with art-deco studs, gold Cinzel titles, hextech-blue hover */
{const mcCss=document.createElement('style');mcCss.textContent=`
#mp{font-family:"NaxNum","Marcellus","Palatino Linotype",Georgia,serif !important;background:radial-gradient(ellipse at 50% 42%,rgba(16,22,38,.78),rgba(3,4,9,.94)) !important}
#mp .bx{position:relative;background:linear-gradient(#26313f,#151b25 60%,#10151d) !important;border:1px solid #c9a24f !important;border-radius:2px !important;padding:18px 22px !important;
 box-shadow:0 0 0 1px #07060b,0 0 0 5px rgba(201,162,79,.1),0 20px 60px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,236,190,.09) !important;overflow:visible !important}
#mp .bx::after{content:"";position:absolute;inset:5px;border:1px solid rgba(201,162,79,.26);pointer-events:none}
#mp .bx::before{content:"";position:absolute;left:50%;top:-7px;width:11px;height:11px;transform:translateX(-50%) rotate(45deg);background:linear-gradient(135deg,#f8e2a0,#c9a24f 50%,#6e5221);border:1px solid #07060b}
#mp h2{font-family:"Cinzel","Marcellus",Georgia,serif !important;font-weight:700 !important;font-size:25px !important;letter-spacing:1px;color:#f2c862 !important;
 background:linear-gradient(#fff5d2,#f2c862 47%,#dca23e 53%,#a8721f);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none !important;filter:drop-shadow(1px 2px 0 rgba(4,3,8,.85));margin-bottom:8px !important}
#mp p,#mp details{color:#ead8ba !important;font-size:15px !important;font-weight:400 !important;text-shadow:none !important}
#mp .step{color:#d9b27a !important;font-family:"Cinzel","Marcellus",serif !important;font-weight:600 !important;font-size:13px !important;letter-spacing:.6px;text-shadow:none !important;margin-top:12px !important}
#mp button{font:400 16px "NaxNum","Marcellus",Georgia,serif !important;color:#fbf1de !important;text-shadow:0 1px 0 rgba(0,0,0,.6) !important;background:linear-gradient(#2e3c4f,#1a222e) !important;
 border:1px solid #c9a24f !important;border-radius:2px !important;box-shadow:0 0 0 1px #07060b,inset 0 1px 0 rgba(255,236,190,.1) !important;padding:7px 16px !important;margin:6px 8px 4px 0 !important}
#mp button:hover:not(:disabled){background:linear-gradient(#305575,#1b3349) !important;border-color:#86dcff !important;box-shadow:0 0 0 1px #07060b,0 0 12px rgba(110,210,255,.38),inset 0 0 10px rgba(110,210,255,.16) !important}
#mp button.pri{background:linear-gradient(#25818b,#155059) !important;border-color:#79dede !important}
#mp button.pri:hover:not(:disabled){background:linear-gradient(#2d9aa6,#1b6872) !important;border-color:#bdf6f6 !important}
#mp button:disabled{opacity:.42 !important}
#mp textarea,#mp input.cd{background:#0b0f17 !important;color:#f2e4c4 !important;border:1px solid #8a6f36 !important;border-radius:2px !important;box-shadow:inset 0 2px 6px rgba(0,0,0,.6)}
#mp input.cd{font:700 22px "Cinzel",Georgia,serif !important;letter-spacing:5px !important}#mp input.cd:focus,#mp textarea:focus{outline:none;border-color:#86dcff !important;box-shadow:0 0 10px rgba(110,210,255,.3),inset 0 2px 6px rgba(0,0,0,.6)}
#mp .code{background:#0b0f17 !important;border:1px solid #c9a24f !important;border-radius:2px !important;color:#f2c862 !important;font-family:"NaxNum","Cinzel",serif !important;font-weight:700 !important;text-shadow:0 0 14px rgba(242,200,98,.35)}
#mp .st:empty{display:none}#mp .st{border-radius:2px !important;background:rgba(5,8,14,.6) !important;border-left:2px solid #c9a24f;color:#f2d27e !important;font-size:14px !important}
#mp .pl{border-radius:2px !important;background:rgba(5,8,14,.5) !important;border:1px solid rgba(201,162,79,.35) !important}
#mp .pl .dot{border-radius:0 !important;width:9px !important;height:9px !important;transform:rotate(45deg);background:#4a4536 !important;border:1px solid #07060b}#mp .pl.on .dot{background:#79dede !important;box-shadow:0 0 8px #79dede !important}
#mp .pl .nm{font-family:"Cinzel","Marcellus",serif;font-weight:700;color:#f2e4c4}#mp .pl .rd{color:#d9b27a !important}#mp .pl.rdy .rd{color:#9ff0d8 !important}
#mpHud{border-radius:2px !important;background:linear-gradient(#26313f,#151b25) !important;border:1px solid #c9a24f !important;color:#f2d27e !important;font:400 14px "NaxNum","Marcellus",Georgia,serif !important;box-shadow:0 0 0 1px #07060b}`;document.head.appendChild(mcCss)}
