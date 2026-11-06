/* ---- game flow ---- */
function startGame(){if(!inGame){res.g=D_().g;waveT=waveI=D_().first;inGame=true}started=true;showMap=false;if(camSave){Object.assign(CAM,camSave);camSave=null}else home()}
function newGame(){rollWorld();over=false;inGame=false;started=false;setupOpen=true;settingsOpen=false}
/* leave the current game for the title screen; in co-op the partner is told (the link closes) and carries on alone */
function quitGame(){if(MP.conn||MP.on){mpSend({k:'bye'});try{MP.pcon&&MP.pcon.close()}catch(e){}try{MP.peer&&MP.peer.destroy()}catch(e){}
  MP.peer=null;MP.pcon=null;MP.dc=null;MP.conn=false;MP.on=false;MP.host=false;MP.code='';MP.mine=null;MP.theirs=null;MP.desync=false;MP.stall=false;try{mpModal(false)}catch(e){}}
 inGame=false;started=false;over=false;paused=false;picking=false;setupOpen=false;settingsOpen=false;saveOpen=false;camSave=null;mode=null;selB=null;castleSel=false;SELBS=[]}
function openMenu(){camSave={...CAM};started=false;mode=null}
/* ---- input ---- */
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}};
function rs(){DPR=Math.min(window.devicePixelRatio||1,2);const w=window.innerWidth,h=window.innerHeight;cv.width=Math.floor(w*DPR);cv.height=Math.floor(h*DPR);
 UIS=Math.max(1.5,Math.round(DPR*(w<600?1.5:w>=1600?2.5:2)*uiMul*2)/2);cw.width=cv.width;cw.height=cv.height;CWD=1;UIT=-1;renderer.setPixelRatio(Math.min(DPR,GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
function drsApply(){renderer.setPixelRatio(Math.min(DPR,GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(window.innerWidth,window.innerHeight)}
function drsTick(ts,t0){const cpu=performance.now()-t0,iv=DRS.lt?ts-DRS.lt:16.7;DRS.lt=ts;if(iv>250||iv<=0||document.hidden)return;
 DRS.sum+=iv;DRS.cs+=cpu;DRS.n++;DRS.t+=iv;if(DRS.t<2000)return;
 const ft=DRS.sum/DRS.n,cp=DRS.cs/DRS.n;DRS.ft=ft;DRS.cpu=cp;DRS.sum=DRS.cs=DRS.n=DRS.t=0;
 if(DRS.chk){DRS.chk=0;if(ft>DRS.ftb*.92){DRS.lv--;DRS.noDn=clockT+90;DRS.ok=0;drsApply();return}}
 if(ft>24&&ft-cp>5&&DRS.lv<DRSL.length-1&&clockT>DRS.noDn){if(clockT-DRS.upT<12){DRS.noUp=clockT+DRS.bk;DRS.bk=Math.min(600,DRS.bk*2)}DRS.ftb=ft;DRS.chk=1;DRS.ok=0;DRS.lv++;drsApply()}
 else if(ft<18.5){if(DRS.lv>0&&clockT>DRS.noUp&&++DRS.ok>=3){DRS.ok=0;DRS.lv--;DRS.upT=clockT;drsApply()}}else DRS.ok=0}
function mmGo(p){CAM.x=Math.max(2,Math.min(TW-2,(p.x-mmRect.x)/mmRect.w*TW));CAM.z=Math.max(2,Math.min(TH-2,(p.y-mmRect.y)/mmRect.h*TH))}
function camZoom(d){CAM.dist=Math.max(7,Math.min(80,CAM.dist*(d>0?1.18:1/1.18)))}
function panCam(dx,dy){const u=2*CAM.dist*Math.tan(camera.fov*Math.PI/360)/cv.height,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw),sp=Math.sin(CAM.pitch);
 CAM.x-=(dx*c-dy*s/sp)*u;CAM.z-=(-dx*s-dy*c/sp)*u}
function pickUnit(p){let b=null,bd=20*DPR;for(const u of units)if(u.t===0&&!u.shel){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(!q.ok)continue;const dd=hyp(q.x-p.x,q.y-p.y);if(dd<bd){bd=dd;b=u}}return b}
let lastClk=0,lastTy='';const paint=()=>{const w=wpos(),tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS);if((mode==='raise'||mode==='dig')&&tfo.has(ty*TW+tx))return;build(mode,tx,ty)};
cv.oncontextmenu=e=>e.preventDefault();
cv.addEventListener('pointercancel',()=>{ptr=null;box=null;mmDrag=false;sliderDrag=null});addEventListener('mouseup',e=>{if(e.target!==cv){ptr=null;box=null;mmDrag=false}});document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);const p=pos(e);mouse=p;
 aInit();if(autoPaused&&paused&&started&&!MP.on){paused=false;autoPaused=false;ptr=null;return}const h=uiHits.find(h=>h.fn&&inR(p,h));if(h){snd('click');h.fn();ptr=null;return}if(picking){if(!uiRects.some(r=>inR(p,r)))ptr={x:e.clientX,y:e.clientY,m:0,btn:e.button,pk:1};return}if(!started||over||showMap)return;
 if(inR(p,mmRect)){mmDrag=true;mmGo(p);return}if(uiRects.some(r=>inR(p,r)))return;
 const fo=e.button===2&&!mode&&sel().some(u=>u.type!=='peasant');ptr={x:e.clientX,y:e.clientY,m:0,pan:e.button===0&&panMode,rot:e.button!==0&&!fo,fo:fo?{w0:wpos(),w1:null}:null,sx:p.x,sy:p.y,btn:e.button};box=null};
cv.onpointermove=e=>{mouse=pos(e);if(e.pointerType==='mouse'&&e.buttons===0&&(ptr||mmDrag||sliderDrag)){ptr=null;box=null;mmDrag=false;sliderDrag=null}if(sliderDrag){sliderDrag.set(Math.max(0,Math.min(1,(mouse.x/UIS-sliderDrag.x)/sliderDrag.w)));return}if(mmDrag){mmGo(mouse);return}if(!ptr)return;const dx=e.clientX-ptr.x,dy=e.clientY-ptr.y,k=cv.width/cv.getBoundingClientRect().width;
 ptr.m+=Math.abs(dx)+Math.abs(dy);ptr.x=e.clientX;ptr.y=e.clientY;
 if(ptr.pk&&PKL.on){if(ptr.m>6){if(ptr.btn===0)panCam(dx*k,dy*k);else{CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}return}
 if(ptr.pk){if(ptr.m>6&&PK){if(ptr.btn===0){const sp=PK.dist*.0012*k;PK.tx-=(dx*Math.cos(PK.yaw)-dy*Math.sin(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tz+=(dx*Math.sin(PK.yaw)+dy*Math.cos(PK.yaw)/Math.max(.3,Math.sin(PK.pitch)))*sp;PK.tx=Math.max(0,Math.min(PVW*PKU,PK.tx));PK.tz=Math.max(0,Math.min(PVH*PKU,PK.tz))}else{PK.yaw-=dx*.007;PK.pitch=Math.max(.3,Math.min(1.45,PK.pitch+dy*.005))}}return}

 if(ptr.fo){if(ptr.m>8)ptr.fo.w1=wpos()}
 else if(ptr.rot){if(ptr.m>8){CAM.yaw-=dx*.007;CAM.pitch=Math.max(.35,Math.min(1.38,CAM.pitch+dy*.005))}}
 else if(ptr.pan){if(ptr.m>8)panCam(dx*k,dy*k)}
 else if(ptr.m>8){if((mode==='path'||mode==='raise'||mode==='dig'||mode==='upgrade'||mode==='spike')&&!over)paint();else box={x1:ptr.sx,y1:ptr.sy,x2:mouse.x,y2:mouse.y}}};
cv.onpointerup=()=>{mmDrag=false;if(ptr&&ptr.pk&&PKL.on){if(ptr.m<=6&&ptr.btn===0&&PKL.hit){pkSet(PKL.hit.tx,PKL.hit.ty,PKL.hit.ok);pickMsg=PKL.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click')}ptr=null;return}
 if(ptr&&ptr.pk){if(ptr.m<=6&&ptr.btn===0&&PK&&PK.hit){pkSet(PK.hit.tx,PK.hit.ty,PK.hit.ok);pickMsg=PK.hit.ok?'':'Pick dry, gentle land away from the edge of the world';snd('click');PKL.on=true;pkLiveFocus(PK.hit.tx,PK.hit.ty)}ptr=null;return}if(sliderDrag){sliderDrag=null;snd('sword');return}if(!ptr)return;
 if(ptr.fo&&ptr.m>8&&ptr.fo.w1){const a=ptr.fo.w0,b=ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),ft=formType;if(!formType)formType=1;FORCEF=fm;try{order(a)}finally{FORCEF=null;formType=ft}puff(a.x,a.y,'#ffe14a',8,40);ptr=null;FPV=null;return}
 if(ptr.m<=8){const w=wpos(),p=mouse;
  if(ptr.btn===2){if(mode){mode=null}else if(sel().length){const ps=pickStruct(p),w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}}
  else if(mode&&!over)build(mode,Math.floor(w.x/TS),Math.floor(w.y/TS));
  else{const b=pickUnit(p);if(b){snd('select');mode=null;const dbl=Date.now()-lastClk<380&&lastTy===b.type&&!b.gar;lastClk=Date.now();lastTy=b.type;units.forEach(u=>u.sel=false);if(dbl){units.forEach(u=>{if(u.t===0&&u.type===b.type&&!u.gar){const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);if(q.ok&&q.x>=0&&q.x<=cv.width&&q.y>=0&&q.y<=cv.height)u.sel=true}});msgS='All visible '+NAMES[b.type]+'s selected';msgT=2}else b.sel=true;if(b.rg&&b.cap&&!dbl){b.cap.sel=true;if(b.cap.sq)b.cap.sq.forEach(f=>f.sel=true)}if(b.sq)b.sq.forEach(f=>f.sel=true);selB=null;castleSel=false}else{const ps=pickStruct(p),o=ps||occ.get(Math.floor(w.y/TS)*TW+Math.floor(w.x/TS));if(o&&o.t===0&&(!MP.on||(o.pl|0)===CURPL)&&o.prog>=1&&!sel().length){const dblB=Date.now()-lastClkB<380&&lastTyB===o.type&&o.type!=='castle';lastClkB=Date.now();lastTyB=o.type;SELBS=dblB?structs.filter(s=>s.t===0&&s.type===o.type&&s.prog>=1&&s.hp>0&&(!MP.on||(s.pl|0)===CURPL)):[];selB=o===HOMEC()?null:o;castleSel=o===HOMEC();snd('select');msgS=!TRB.has(o.type)?(NAMES[o.type]||o.type)+': '+Math.ceil(o.hp)+' / '+o.max+' HP'+(o.hp<o.max?' - press Repair':'')+(WKT.has(o.type)?(wkOf(o)?' - worked by a peasant':' - nobody works it: right-click it with a peasant'):'')+(o.type==='forester'?(n=>' - '+n+' sapling'+(n===1?'':'s')+' growing')([...SAPL.values()].filter(v=>v.s===o.sid).length):''):o===HOMEC()?'Castle: shoots arrows at zombies in range, trains peasants and builds'+(n=>n?' - '+n+' villager'+(n>1?'s':'')+' sheltering inside (Repair calls them out)':'')(units.filter(u=>u.shel===o).length):o.type==='guild'?'Builders guild: choose how many peasants build, repair and reshape the land':o.type==='academy'?'Academy: research upgrades here':o.type==='market'?'Market: sell wood, stone or food for gold, or buy them':'Barracks: train soldiers here';msgT=3;{const rg=rangeOf(o);if(rg)msgS+=' - range '+Math.round(rg.r)+' tiles'}if(SELBS.length>1){msgS='All your '+NAMES[o.type]+'s selected ('+SELBS.length+')'+(UPC[o.type]&&SELBS.some(s=>s.tier===0)?' - Upgrade turns every wooden one to stone':'');msgT=4}}else if(sel().length){const w2=ps&&ps.t===0?{x:ps.x,y:ps.y}:w;order(w2);puff(w2.x,w2.y,'#ffe14a',8,40)}else{selB=null;castleSel=false;SELBS=[]}}}}
 else if(!ptr.pan&&!ptr.rot&&box){const x0=Math.min(box.x1,box.x2),x1=Math.max(box.x1,box.x2),y0=Math.min(box.y1,box.y2),y1=Math.max(box.y1,box.y2);
  mode=null;castleSel=false;units.forEach(u=>{if(u.t!==0||u.shel||(MP.on&&(u.pl|0)!==CURPL)){u.sel=false;return}const q=scr(u.x/TS,(u.dy||0)+.32,u.y/TS);u.sel=q.ok&&q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1});units.forEach(u=>{if(u.sel&&u.rg&&u.cap)u.cap.sel=true});units.forEach(u=>{if(u.sel&&u.sq)u.sq.forEach(f=>f.sel=true)})}
 ptr=null;box=null};
cv.onwheel=e=>{e.preventDefault();mouse=pos(e);if(started&&!showMap)camZoom(e.deltaY>0?1:-1);else if(picking&&PKL.on)camZoom(e.deltaY>0?1:-1);else if(picking&&PK)PK.dist=Math.max(50,Math.min(900,PK.dist*(e.deltaY>0?1.15:1/1.15)))};
const BK=['cannon','peasant','knight','archer','bannerman','captain','wall','gate','tower','path'];
addEventListener('keydown',e=>{aInit();if(document.activeElement===nmI)return;const k=e.key.toLowerCase();
 if(rebind){e.preventDefault();if(k==='escape'){rebind=null;return}const old=KB[rebind];for(const a in KB)if(a!==rebind&&KB[a]===k)KB[a]=old;KB[rebind]=k;rebind=null;saveKB();return}
 keys[k]=true;
 if(!started){if(k==='escape'){if(settingsOpen){settingsOpen=false;if(fromGame){fromGame=false;startGame()}}else if(picking){picking=false;if(MP.conn)lobbyShow()}else if(setupOpen)setupOpen=false}else if(k==='enter'&&!settingsOpen){e.preventDefault();if(picking)confirmPick();else if(setupOpen)openPicker();else if(inGame)startGame();else setupOpen=true}else if(picking&&k===KB.rotate&&!settingsOpen)pkRotate();return}
 if(over)return;
 if(k==='escape'){if(showMap)showMap=false;else if(mode||sel().length){mode=null;units.forEach(u=>u.sel=false)}else if(BCAT)BCAT=null;else openMenu();return}
 if(!e.ctrlKey&&!e.shiftKey&&!e.metaKey&&['1','2','3','4'].includes(k)&&sel().some(u=>u.type!=='peasant')){setStance(['agg','def','hold','stop'][+k-1]);return}
 const a=Object.keys(KB).find(x=>KB[x]===k);if(!a)return;if(k.length===1&&!/[a-z0-9]/.test(k))e.preventDefault();
 if(a==='map'){showMap=!showMap;return}
 if(a==='cry'||a==='charge'){kingSkill(a);return}
 if(showMap)return;
 if(BK.includes(a)||a==='upgrade'||a==='barracks'||a==='farm'||a==='storage'||a==='house'||a==='academy'||a==='market'||a==='forester'||a==='guild'||a==='torch'||a==='rally'||a==='rallyc'||a==='movec'||a==='ramp'||a==='tier'||a==='demolish'||a==='raise'||a==='dig'||a==='ballista'||a==='trebuchet'){buy(a);return}
 if(a==='rotate'){if(mode){buildRot=(buildRot+1)&3;msgS='Rotated '+buildRot*90+' deg';msgT=1.5}else if(selB&&selB.t===0&&ROTT.has(selB.type))build('rotate',selB.tx,selB.ty)}
 else if(a==='form'){formType=(formType+1)%FORMS.length;msgS='Formation: '+FORMS[formType];msgT=2}
 else if(a==='sound')toggleSound();else if(a==='idle')selIdle();else if(a==='wave')callWave();else if(a==='home')home();else if(a==='army')army();else if(a==='peas')selPeas();
 else if(a==='pause'){setPause(!paused);e.preventDefault()}else if(a==='speed'){if(!MP.on)spd=spd%3+1}
 if(k==='p'){panMode=!panMode;msgS=panMode?'Pan mode: drag moves the camera':'Select mode: drag draws a box';msgT=2}if(k==='+'||k==='=')camZoom(-1);if(k==='-')camZoom(1);if(k===','){selIdle()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',rs);
function drawBars(){ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,DPR);let drew=0;
 const bar2=(x,y,w,f,c)=>{drew=1;ctx.fillStyle='#000';ctx.fillRect(Math.round(x-w/2-1),Math.round(y-1),w+2,3*k+1);ctx.fillStyle=c;ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.max(1,Math.round(w*Math.max(0,Math.min(1,f)))),2*k)};
 for(const u of units){const m=T[u.type].hp;if(u.hp>=m||u.hp<=0||u.shel)continue;const md=u.m&&u.m.userData.mdl,q=scr(u.x/TS,(u.dy||0)+(md?md.h*(md.sc||1.35)*UNITK:.8)+.1,u.y/TS);if(q.ok)bar2(q.x,q.y,(u.type==='brute'?26:16)*k,u.hp/m,u.t===1?'#c66bff':u.t===2?'#e8c040':'#6fdc6f')}
 {let n0=0;for(const u of units)if(u.shel)n0++;if(n0)for(const c of aliveC()){let n=0;for(const u of units)if(u.shel===c)n++;if(!n)continue;const q=scr(c.x/TS,(c.bh||LAND)+(c.tier!==0?6.7:5.7),c.y/TS);
  if(q.ok){drew=1;ctx.font=Math.round(9*k*1.75)+'px '+FF;ctx.textAlign='center';const t=L(n+' inside');ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(t,q.x+1,q.y+1);ctx.fillStyle='#ffe08a';ctx.fillText(t,q.x,q.y)}}}
 if(!shelOn)for(const s of structs){if(s.t!==0||s.prog<1||s.hp<=0||!WKT.has(s.type)||(MP.on&&(s.pl|0)!==LPL())||wkOf(s))continue;const q=scr(s.x/TS,(s.bh||LAND)+1.4,s.y/TS);
  if(q.ok){drew=1;ctx.font=Math.round(8*k*1.75)+'px '+FF;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(L('no worker'),q.x+1,q.y+1);ctx.fillStyle='#ffb070';ctx.fillText(L('no worker'),q.x,q.y)}}
 for(const s of structs){if(s.garr&&s.garr.length){const q=scr(s.x/TS,(s.bh||LAND)+(s.type==='tower'?4.9:2.7),s.y/TS);if(q.ok){drew=1;ctx.font=Math.round(9*k*1.75)+'px '+FF;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x+1,q.y+1);ctx.fillStyle='#9fe870';ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x,q.y)}}
  if(s.hp>=s.max&&s.prog>=1)continue;const q=scr(s.x/TS,(s.bh||LAND)+(({tower:4.9,wall:2.2,gate:2.6,ballista:1.6,trebuchet:3.6,house:3.3,barracks:3.2,storage:2.5,academy:3.6,market:2.7,forester:2.4,guild:3.2,torch:1.9,farm:1.0,keep:5.2,castle:s.tier!==0?6.2:5.2})[s.type]||6.7),s.y/TS);if(!q.ok)continue;
  if(s.prog<1)bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.prog,'#ffd23c');else bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.hp/s.max,'#6fdc6f')}return drew}
function loop(ts){const lt0=performance.now(),dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;clockT+=dt;
 if(started){const sp=CAM.dist*.9*dt,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);let fx_=0,fz=0;
  if(!showMap){if(keys[KB.up]||keys.arrowup)fz-=1;if(keys[KB.down]||keys.arrowdown)fz+=1;if(keys[KB.left]||keys.arrowleft)fx_-=1;if(keys[KB.right]||keys.arrowright)fx_+=1;
   CAM.x+=(fx_*c+fz*s)*sp;CAM.z+=(-fx_*s+fz*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5}
  if(!MP.on&&!over&&!paused&&!showMap)for(let k=0;k<spd;k++)update(dt)}
 if(MP.on)mpFrame(dt);
 
 if(started||inGame){if(!MP.on){if(started&&window.requestIdleCallback){if(!BGI&&GI<GORD.length){BGI=1;requestIdleCallback(bgIdle,{timeout:700})}}else bgGen(started?2.5:14)}if(clockT-mmT>(genN<NCX*NCY?1.2:4)){mmT=clockT;refreshMM()}}
 FOWU.fowP.value.w=started&&inGame?1:0;FOWU.fowP.value.z=started&&inGame?nightK:0;POST.U2.uVig.value=started&&inGame?1:0;if(SHADOWS&&++SHF>=(DRS.lv>=3?3:2)){SHF=0;renderer.shadowMap.needsUpdate=true}if(started)render3D(dt);else if(picking)(PKL.on?renderPickLive(dt):renderPick(dt));else if(inGame&&!over)render3D(0);else renderTitle(dt);
 {const hc=ctx;ctx=cwx;try{if(CWD){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw.width,cw.height);CWD=0}if(started){CWD=drawBars()|0;
  if(ptr&&ptr.fo&&ptr.fo.w1&&ptr.m>8){CWD=1;const a=ptr.fo.w0,b=ptr.fo.w1,fm=Math.atan2(b.x-a.x,b.y-a.y),FM=sel().filter(u=>u.type!=='peasant'&&!u.gar),ft=formType;if(!formType)formType=1;let sl;try{sl=formSlots(FM,a,fm)}finally{formType=ft}
   ctx.lineWidth=Math.max(1,DPR*1.2);for(const q of sl.values()){const P=scr(q.x/TS,gh(q.x/TS,q.y/TS)+.05,q.y/TS);if(!P.ok)continue;ctx.beginPath();ctx.ellipse(P.x,P.y,6*DPR,3.4*DPR,0,0,6.283);ctx.fillStyle='rgba(255,225,74,.28)';ctx.fill();ctx.strokeStyle='#ffe14a';ctx.stroke()}
   const P0=scr(a.x/TS,gh(a.x/TS,a.y/TS)+.05,a.y/TS),P1=scr((a.x+Math.sin(fm)*TS*2)/TS,gh(a.x/TS,a.y/TS)+.05,(a.y+Math.cos(fm)*TS*2)/TS);if(P0.ok&&P1.ok){ctx.strokeStyle='#ffe14a';ctx.lineWidth=2*DPR;ctx.beginPath();ctx.moveTo(P0.x,P0.y);ctx.lineTo(P1.x,P1.y);ctx.stroke();const an=Math.atan2(P1.y-P0.y,P1.x-P0.x);ctx.beginPath();ctx.moveTo(P1.x,P1.y);ctx.lineTo(P1.x-Math.cos(an-.5)*9*DPR,P1.y-Math.sin(an-.5)*9*DPR);ctx.lineTo(P1.x-Math.cos(an+.5)*9*DPR,P1.y-Math.sin(an+.5)*9*DPR);ctx.closePath();ctx.fillStyle='#ffe14a';ctx.fill()}}
  if(box){CWD=1;ctx.strokeStyle='#ffe14a';ctx.lineWidth=Math.max(1,DPR);ctx.fillStyle='rgba(255,225,74,.15)';const x=Math.min(box.x1,box.x2),y=Math.min(box.y1,box.y2),w=Math.abs(box.x2-box.x1),h=Math.abs(box.y2-box.y1);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(PINGS.length){CWD=1;drawPings()}}}finally{ctx=hc}}
 if(!started||UIT<0||ts-UIT>=22||ts<UIT){UIDT=UIT>=0&&ts>UIT?Math.min(.1,(ts-UIT)/1000):dt;UIT=ts;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);drawUI()}
 placeInput();{const cu=started&&mode?'crosshair':started&&panMode?'grab':'default';if(cu!==CUR0){CUR0=cu;cv.style.cursor=cu}}drsTick(ts,lt0);if(BUGQ)bugCapture();requestAnimationFrame(loop)}
let CWD=1,UIT=-1,UIDT=1/60,CUR0='',SHF=0,BGI=0;
function bgIdle(d){BGI=0;if(MP.on||!started)return;const t0=performance.now();while(GI<GORD.length&&(d.didTimeout?performance.now()-t0<2.5:d.timeRemaining()>4)){const k=GORD[GI++];if(!genF[k])genChunk(k%NCX,(k/NCX)|0)}}
rs();rollWorld();reset();icons3D();aInit();requestAnimationFrame(loop);

