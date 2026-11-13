async()=>{/* small interface rules (v93): the digit row is matched by the physical key (AZERTY types & é " ' ( - è _ ç à there), the video guide
   closes with the screen it was opened from, the quest arrow stays off the HUD and goes to the screen edge when its building is out of view */
 try{renderer.render=()=>{}}catch(e){}
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};const RR=Math.random;
 const LS=localStorage,k0=LS.getItem('dk_keys'),v0=LS.getItem('dk_keyv');LS.removeItem('dk_keys');loadKB();
 let s=41;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;Math.random=RR;
 for(const R of RESP){R.g=5000;R.w=5000;R.s=5000;R.f=5000}
 /* sent to the page body like a real key press (the control groups listen in the capture phase on the window) */
 const key=(k,code,o)=>document.body.dispatchEvent(new KeyboardEvent('keydown',Object.assign({key:k,code,cancelable:true,bubbles:true},o||{})));
 const qn=t=>queue.filter(q=>q.type===t).length;
 const none=()=>{units.forEach(u=>u.sel=false);selB=null;mode=null};
 /* ---- keys ---- */
 none();let n=qn('peasant');key('1','Digit1');chk('qwertyDigit',qn('peasant')===n+1);
 n=qn('peasant');key('&','Digit1');chk('azertyDigit',qn('peasant')===n+1);
 n=qn('peasant');key('1','Numpad1');chk('numpad',qn('peasant')===n+1);
 /* Shift + digit belongs to the control groups (on AZERTY it types the digit) */
 n=qn('peasant');key('1','Digit1',{shiftKey:true});chk('shiftIsGroups',qn('peasant')===n);
 none();key('à','Digit0');O.m0=mode;chk('azertyZero',mode==='house');none();
 /* AZERTY 4 types an apostrophe, the default key of the torch: the digit wins (bannerman; no barracks here, so nothing happens);
    the real apostrophe key (QWERTY) still places a torch */
 key("'",'Digit4');O.m4=mode;chk('azertyQuoteIsFour',mode!=='torch');none();key("'",'Quote');chk('quoteKey',mode==='torch');none();
 /* stances 1 to 4 with soldiers selected */
 {const p=spawnPos(CS),u=mkU(0,'knight',p.x,p.y);units.push(u);u.sel=true;key('"','Digit3');const a=u.stn;key('2','Digit2');const b=u.stn;key("'",'Digit4');O.stn=[a,b].join();chk('stances',a==='hold'&&b==='def');u.sel=false;none()}
 /* a key the player saved from an AZERTY keyboard (the character) keeps working, and wins over the digit of that key */
 KB.farm='é';key('é','Digit2');chk('savedAzertyKey',mode==='farm');none();LS.removeItem('dk_keys');loadKB();
 /* rebinding: a digit-row key that types a sign is stored as its digit (shown as the digit, swapped with the action that had it) */
 settingsState.rebind='farm';key('è','Digit7');chk('rebindDigit',KB.farm==='7'&&KB.gate==='j'&&settingsState.rebind===null);key('è','Digit7');chk('reboundWorks',mode==='farm');none();
 settingsState.rebind='farm';key('g','KeyG');chk('rebindLetter',KB.farm==='g');
 if(k0===null)LS.removeItem('dk_keys');else LS.setItem('dk_keys',k0);if(v0!==null)LS.setItem('dk_keyv',v0);loadKB();
 /* ---- quest arrow ---- */
 {const frame=()=>{render3D(.05);drawUI();drawUI();return hudDisplayState.qm};
  let b=null;for(let k=0;k<60&&!b;k++){const f=freeTile(CS.tx+12+(k%6)*3,CS.ty-9+((k/6)|0)*3),m=structs.length;if(f)build('barracks',f[0],f[1]);if(structs.length>m){b=structs[structs.length-1];b.prog=1;b.hp=b.max}}
  {const p=spawnPos(CS);units.push(mkU(0,'king',p.x,p.y))}/* the King bar (centre bars) is on screen */
  for(const q of QUESTS){if(q.id==='knights')break;QST.d[q.id]=1}QST.on=1;none();update(.05);
  const K=hudDisplayState.UIS,UW=Math.floor(cv.width/K),UH=Math.floor(cv.height/K);
  /* is the tip clear of the HUD: under the top bar and the centre bars, out of every HUD rectangle */
  const clear=(q)=>{const cb=hudDisplayState.cbar,x=q[1],y=q[2],top=cb&&x>cb[0]&&x<cb[0]+cb[2]?cb[1]+cb[3]:settingsState.TOPH;
   if(y<top+(q[0]==='w'?20:8)||x<4||x>UW-4||y>UH-4)return false;
   for(const r of hudState.uiRects)if(x*K>r.x&&x*K<r.x+r.w&&y*K>r.y&&y*K<r.y+r.h)return false;return true};
  const bx=b.x/TS,bz=b.y/TS;CAM.x=bx;CAM.z=bz+2;const q0=frame();O.qm0=q0&&q0.map(v=>typeof v==='number'?Math.round(v*100)/100:v);O.cbar=hudDisplayState.cbar;
  chk('arrowOnBuilding',!!q0&&q0[0]==='w'&&clear(q0));chk('kingBarShown',!!hudDisplayState.cbar);
  /* the building far to the left, then far to the right: an arrow on the edge, turned toward it */
  CAM.x=bx+90;CAM.z=bz;const l=frame();CAM.x=bx-90;const r=frame();O.edge=[l,r].map(q=>q&&q.map(v=>typeof v==='number'?Math.round(v*100)/100:v));
  chk('edgeArrow',!!l&&!!r&&l[0]==='e'&&r[0]==='e'&&l[3]<-.7&&r[3]>.7&&l[1]<UW*.2&&r[1]>UW*.8&&clear(l)&&clear(r));
  /* sweep the camera around the building: there is always an arrow and its tip is never on the HUD */
  let bad=[],kinds={w:0,e:0},low=0;for(let dz=-26;dz<=26;dz+=2)for(const dx of[-30,-8,0,8,30]){CAM.x=bx+dx;CAM.z=bz+dz;const q=frame();if(!q||q[0]==='r'||!clear(q)){if(bad.length<6)bad.push([dx,dz,q&&q.map(v=>typeof v==='number'?Math.round(v):v)])}else kinds[q[0]]++}
  O.sweep=kinds;O.bad=bad;chk('sweepClear',bad.length===0&&kinds.w>0&&kinds.e>0);
  CAM.x=bx;CAM.z=bz}
 /* ---- achievement toasts and wave banner against the bars under the top bar (v94) ---- */
 {none();time=Math.max(time,40);evPush({k:'car',i:1,a:{g:40,w:30,s:20}});ACH.clear();TOASTS.length=0;ach('w1');ach('k1');
  msgS='Night falls - the horde is coming. The villagers shelter in the castle; keep your soldiers in the light!';hudDisplayState.msgT=30;
  drawUI();drawUI();const q=hudDisplayState.tq,hit=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
  const ev=q.b.find(b=>b[3]===38),ms=q.b.find(b=>b[3]===16);O.toast=q.t.map(b=>b.map(Math.round));O.tb=q.b.length;
  chk('toastsDrawn',q.t.length===2&&!!ev&&!!ms);chk('toastsClearBars',q.t.every(t=>q.b.every(b=>!hit(t,b)))&&!hit(q.t[0],q.t[1]));
  bannerT=3;bannerS='WAVE 6';bannerS2='Horde from N';drawUI();drawUI();O.bny=Math.round(hudDisplayState.bny);chk('bannerUnderEventBar',!!ev&&hudDisplayState.bny>=ev[1]+ev[3]);
  bannerT=0;hudDisplayState.msgT=0;EVS.cur=null;TOASTS.length=0}
 /* ---- video guide ---- */
 {openMenu();openGuide();guideWatch();const a=guideState.open;startGame();guideWatch();chk('guideClosesOnResume',a&&!guideState.open);
  /* the game ends under the open guide (co-op: the lockstep runs under the menu): closed, back on the game view for the end panel */
  openMenu();openGuide();over=true;guideWatch();chk('guideClosesOnEnd',!guideState.open&&started===true);over=false;
  openMenu();openGuide();quitGame();guideWatch();chk('guideClosesOnTitle',!guideState.open&&!inGame);
  /* opened from the title it stays, until a game starts */
  openGuide();guideWatch();const t1=guideState.open;inGame=true;guideWatch();chk('titleGuide',t1&&!guideState.open);inGame=false}
 /* ---- co-op line on top (#28): nothing while the game runs, one clear line otherwise, gone as soon as play resumes ---- */
 {const keep={...MP},now=1e6,B=()=>mpBanner(now);Object.assign(MP,{on:true,pname:'Mira',rsy:null,desync:false,stall:false,stallAt:0,rxAt:now,rtt:40});const was=paused;paused=false;
  chk('bannerQuiet',B()==='');
  MP.stall=true;MP.stallAt=now-900;chk('bannerShortWaitHidden',B()==='');
  MP.stallAt=now-3200;const w=B();chk('bannerWaiting',w==='Co-op: waiting for Mira, 3 s (slow connection or computer)');
  MP.rxAt=now-9000;const n=B();chk('bannerNoAnswer',n==='Co-op: no answer from Mira for 9 s, the game goes on when the connection is back');
  MP.stall=false;chk('bannerGoneWhenPlayResumes',B()==='');
  MP.rsy='go';const r=B();chk('bannerResync',r==='Co-op: putting both games back in step, a few seconds (nothing to do)');
  MP.rsy=null;MP.desync=true;chk('bannerDesyncSameLine',B()===r);MP.desync=false;
  MP.rtt=320;chk('bannerSlow',B()==='Co-op: slow connection (320 ms)');MP.rtt=40;
  MP.pname='';MP.rxAt=now;MP.stall=true;MP.stallAt=now-2000;const w2=B();chk('bannerNoName',w2==='Co-op: waiting for Player, 2 s (slow connection or computer)');
  /* every line has its translation (French here), the numbers and the name kept */
  if(typeof trL==='function'&&languageState){const T=[w,n,r,w2].map(x=>trL(x));O.bannerFr=T;}
  for(const k of Object.keys(MP))if(!(k in keep))delete MP[k];Object.assign(MP,keep);paused=was}
 O.ok=C.every(Boolean);return JSON.stringify(O)}
