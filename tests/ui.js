async()=>{/* small interface rules (v93, v94: physical letter keys, new default keys, minimap framed on the explored land): the digit row is matched by the physical key (AZERTY types & é " ' ( - è _ ç à there), the video guide
   closes with the screen it was opened from, the quest arrow stays off the HUD and goes to the screen edge when its building is out of view */
 try{renderer.render=()=>{}}catch(e){}
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};const RR=Math.random;
 const LS=localStorage,k0=LS.getItem('dk_keys'),v0=LS.getItem('dk_keyv'),l0=LS.getItem('dk_lay');LS.removeItem('dk_keys');LS.removeItem('dk_lay');layInit();loadKB();
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
    the real apostrophe key (QWERTY) no longer does anything since the torch went to F6 (v94) */
 key("'",'Digit4');O.m4=mode;chk('azertyQuoteIsFour',mode!=='torch');none();key("'",'Quote');chk('quoteKeyFree',mode===null);none();
 /* stances 1 to 4 with soldiers selected */
 {const p=spawnPos(CS),u=mkU(0,'knight',p.x,p.y);units.push(u);u.sel=true;key('"','Digit3');const a=u.stn;key('2','Digit2');const b=u.stn;key("'",'Digit4');O.stn=[a,b].join();chk('stances',a==='hold'&&b==='def');u.sel=false;none()}
 /* a key the player saved from an AZERTY keyboard (the character) keeps working, and wins over the digit of that key */
 KB.farm='é';key('é','Digit2');chk('savedAzertyKey',mode==='farm');none();LS.removeItem('dk_keys');loadKB();
 /* rebinding: a digit-row key that types a sign is stored as its digit (shown as the digit, swapped with the action that had it) */
 settingsState.rebind='farm';key('è','Digit7');chk('rebindDigit',KB.farm==='7'&&KB.gate==='j'&&settingsState.rebind===null);key('è','Digit7');chk('reboundWorks',mode==='farm');none();
 settingsState.rebind='farm';key('g','KeyG');chk('rebindLetter',KB.farm==='g');
 LS.removeItem('dk_keys');loadKB();
 /* ---- letters by physical key, new defaults, hard-wired keys, migration (v94) ---- */
 {const ev=(t,k,code,o)=>{const e=new KeyboardEvent(t,Object.assign({key:k,code,cancelable:true,bubbles:true},o||{}));document.body.dispatchEvent(e);return e.defaultPrevented};
  const up=(k,code)=>ev('keyup',k,code),held=()=>['up','down','left','right','rotL','rotR'].filter(a=>keys[KB[a]]).join();
  /* press, read which camera actions are held, release, check nothing stays held */
  const tap=(k,code)=>{key(k,code);const h=held();up(k,code);return h+(held()?'!stuck':'')};
  const p=spawnPos(CS),kn=mkU(0,'knight',p.x,p.y);units.push(kn);
  const armyOn=(k,code)=>{none();key(k,code);up(k,code);const r=kn.sel;none();return r};
  /* QWERTY: W A S D camera, Z X turn, Q army */
  O.qw=[tap('w','KeyW'),tap('a','KeyA'),tap('s','KeyS'),tap('d','KeyD'),tap('z','KeyZ'),tap('x','KeyX')].join(' ');
  chk('qwertyCamera',O.qw==='up left down right rotL rotR');chk('qwertyArmy',armyOn('q','KeyQ')&&mode===null);
  /* AZERTY: the same places type Z Q S D (camera), W X (turn), A (army); z no longer turns, q no longer selects the army */
  O.az=[tap('z','KeyW'),tap('q','KeyA'),tap('s','KeyS'),tap('d','KeyD'),tap('w','KeyZ'),tap('x','KeyX')].join(' ');
  chk('azertyCamera',O.az==='up left down right rotL rotR');chk('azertyArmy',armyOn('a','KeyQ'));chk('azertyQIsCamera',!armyOn('q','KeyA'));
  /* German QWERTZ: the key that types y (KeyZ) stays "raise ground" (a character binding wins), the key that types z still turns */
  none();key('y','KeyZ');const hy=held();O.qz=[mode,hy];up('y','KeyZ');chk('qwertzY',mode==='raise'&&hy==='');none();chk('qwertzZ',tap('z','KeyY')==='rotL');
  /* a letter typed elsewhere than any binding does nothing */
  chk('arrowKeys',(key('ArrowUp','ArrowUp'),keys.arrowup===true)&&(up('ArrowUp','ArrowUp'),!keys.arrowup));
  /* labels follow the keyboard: unknown = QWERTY letters; one AZERTY letter typed tells the layout */
  LS.removeItem('dk_lay');layInit();layNote('KeyQ','q');layNote('KeyW','w');O.lab0=['up','left','down','right','rotL','rotR','army'].map(a=>kdisp(KB[a])).join('');
  key('a','KeyQ');up('a','KeyQ');none();O.lab1=['up','left','down','right','rotL','rotR','army'].map(a=>kdisp(KB[a])).join('');O.hkArmy=HK.army;
  chk('labelsQwerty',O.lab0==='WASDZXQ');chk('labelsAzerty',O.lab1==='ZQSDWXA'&&HK.army==='A');
  /* QWERTZ: KeyZ types y, which is "raise": the turn key shows Z (the key that works) */
  layNote('KeyQ','q');layNote('KeyA','a');layNote('KeyW','w');layNote('KeyY','z');O.lab2=kdisp(KB.rotL)+kdisp(KB.raise)+kdisp(KB.up);chk('labelsQwertz',O.lab2==='ZYW');
  LS.removeItem('dk_lay');layInit();
  /* the four new defaults: one plain key each, kept away from the browser (F3 find, F6 address bar, F7 caret browsing) */
  {const R={};for(const[k,a]of[['F6','torch'],['F9','forester'],['F3','guild'],['F7','rally']]){none();if(a==='rally')selB=structs.find(s=>s.type==='barracks')||null;const pd=ev('keydown',k,k);R[a]=[KB[a],pd,mode];none()}
   O.fk=R;chk('newDefaults',R.torch[0]==='f6'&&R.forester[0]==='f9'&&R.guild[0]==='f3'&&R.rally[0]==='f7'&&R.torch[2]==='torch'&&R.forester[2]==='forester'&&R.guild[2]==='guild');
   chk('fKeysPrevented',R.torch[1]&&R.forester[1]&&R.guild[1]&&R.rally[1]);
   /* F5 (reload) and F12 are not ours: left to the browser */
   chk('otherFKeysFree',!ev('keydown','F5','F5')&&!ev('keydown','F12','F12'))}
  /* hard-wired keys act only when the key is bound to nothing: - zooms out (free since the rally point left it), + zooms in,
     = is the castle rally point (no zoom), p demolishes (no pan mode), "," moves the castle (does not also select idle workers) */
  {const d0=CAM.dist;key('-','Minus');const d1=CAM.dist;key('+','Equal',{shiftKey:true});const d2=CAM.dist;key('-','NumpadSubtract');const d3=CAM.dist;CAM.dist=d0;
   none();key('=','Equal');const d4=CAM.dist,m4=mode;none();const pm=inputState.panMode;key('p','KeyP');const m5=mode,pm2=inputState.panMode;none();
   const pe=mkU(0,'peasant',p.x,p.y);units.push(pe);key(',','Comma');const m6=mode,s6=pe.sel;none();units.splice(units.indexOf(pe),1);
   O.hw=[d1>d0,d2<d1,d3>d2,d4===d0,m4,m5,pm2===pm,m6,s6];chk('minusZoomsOut',d1>d0&&d3>d2);chk('plusZoomsIn',d2<d1);chk('equalIsRallyOnly',d4===d0&&m4==='rallyc');chk('pIsDemolishOnly',m5==='demolish'&&pm2===pm);chk('commaIsMoveOnly',m6==='movec'&&!s6);
   /* unbound, the same keys fall back to the hard-wired action */
   KB.demolish='f12';key('p','KeyP');const pm3=inputState.panMode;chk('pPansWhenFree',pm3!==pm&&mode===null);inputState.panMode=pm;hudDisplayState.msgT=0;LS.removeItem('dk_keys');loadKB()}
  /* rebinding: a camera action takes the physical key, another action the character; the action that had the key gets the old one */
  settingsState.rebind='up';key('Shift','ShiftLeft');const still=settingsState.rebind==='up';key('i','KeyI');chk('rebindPhysical',still&&KB.up==='KeyI'&&KB.ramp==='KeyW'&&tap('i','KeyI')==='up');
  settingsState.rebind='farm';key('a','KeyQ');chk('rebindOverPhysical',KB.farm==='a'&&KB.army==='j'&&(none(),key('a','KeyQ'),mode==='farm'));none();
  LS.removeItem('dk_keys');loadKB();
  /* migration of saved keys (once, marker dk_keyv 3): only the keys still on the old default move */
  {const OLD=Object.assign({},KB,{torch:"'",rally:'-',forester:'[',guild:']',up:'w',down:'s',left:'a',right:'d',rotL:'z',rotR:'x',army:'q'});
   const mig=(over,v)=>{LS.setItem('dk_keys',JSON.stringify(Object.assign({},OLD,over)));if(v===null)LS.removeItem('dk_keyv');else LS.setItem('dk_keyv',v);loadKB();return JSON.parse(LS.getItem('dk_keys'))};
   let S=mig({farm:'é'},'2');O.mig1=[KB.torch,KB.rally,KB.forester,KB.guild,KB.up,KB.left,KB.rotL,KB.army,KB.farm,LS.getItem('dk_keyv'),S.torch,S.up].join();
   chk('migrateDefaults',O.mig1==='f6,f7,f9,f3,KeyW,KeyA,KeyZ,KeyQ,é,3,f6,KeyW');
   /* a key the player chose stays; a new key already given to something else is not taken */
   S=mig({torch:'ù',wave:'f7',up:'z',rotL:'w',left:'q',army:'a'},'2');O.mig2=[KB.torch,KB.rally,KB.wave,KB.up,KB.rotL,KB.left,KB.army,KB.down,KB.forester].join();
   chk('migrateKeepsChoices',O.mig2==="ù,-,f7,z,w,q,a,KeyS,f9");chk('savedAzertyCamera',tap('z','KeyW')==='up'&&tap('w','KeyZ')==='rotL'&&tap('q','KeyA')==='left'&&armyOn('a','KeyQ'));
   /* from before v93 (no marker): the spearman moves too */
   S=mig({spearman:'\\'},null);chk('migrateFromOld',KB.spearman==='f4'&&KB.torch==='f6'&&LS.getItem('dk_keyv')==='3');
   /* already migrated: a player who puts the torch back on the apostrophe keeps it */
   S=mig({},'3');chk('migrateOnce',KB.torch==="'"&&KB.up==='w'&&tap('w','KeyW')==='up')}
  units.splice(units.indexOf(kn),1)}
 if(k0===null)LS.removeItem('dk_keys');else LS.setItem('dk_keys',k0);if(v0!==null)LS.setItem('dk_keyv',v0);else LS.removeItem('dk_keyv');if(l0!==null)LS.setItem('dk_lay',l0);else LS.removeItem('dk_lay');layInit();loadKB();
 /* ---- minimap framed on the explored land (v94) ---- */
 {none();drawUI();drawUI();const R=()=>mmRect,V=mmView,near=(a,b,e)=>Math.abs(a-b)<=(e||1e-6),cx=CS.x/TS,cy=CS.y/TS;
  const inV=(x,y)=>x>=V.x&&x<=V.x+V.w&&y>=V.y&&y<=V.y+V.h,shape=()=>near(V.w/V.h,TW/TH,1e-9)&&V.x>=0&&V.y>=0&&V.x+V.w<=TW+1e-6&&V.y+V.h<=TH+1e-6;
  /* a click at fraction (fx, fy) of the minimap sends the camera to the tile drawn there */
  const click=(fx,fy)=>{const r=R();mmGo({x:r.x+r.w*fx,y:r.y+r.h*fy});return[CAM.x,CAM.z]};
  const cam0=[CAM.x,CAM.z];CAM.x=cx;CAM.z=cy;mmLook(true);O.mm1=[V.x,V.y,V.w,V.h].map(Math.round);
  chk('mmEarlyFrame',V.w>=180&&V.w<TW/3&&shape()&&inV(cx,cy));
  {const a=click(.25,.75),b=click((cx-V.x)/V.w,(cy-V.y)/V.h);O.mmc1=a.concat(b).map(v=>Math.round(v*10)/10);
   chk('mmClickEarly',near(a[0],V.x+.25*V.w,1e-6)&&near(a[1],V.y+.75*V.h,1e-6)&&near(b[0],cx,1e-6)&&near(b[1],cy,1e-6))}
  /* the frame does not move for small changes: the camera a little away, still inside */
  const f1=[V.tx,V.ty,V.tw];CAM.x=cx+20;CAM.z=cy+8;mmLook(false);chk('mmSteady',V.tx===f1[0]&&V.ty===f1[1]&&V.tw===f1[2]);
  /* the camera far outside: a new frame is chosen and the view glides there (not in one step) */
  CAM.x=Math.min(TW-5,cx+420)===cx+420?cx+420:cx-420;CAM.z=cy;const far=CAM.x;mmLook(false);const w0=V.w,tw=V.tw;clockT+=.1;drawUI();const w1=V.w;clockT+=.1;drawUI();const w2=V.w;
  O.mmg=[w0,w1,w2,tw].map(Math.round);chk('mmGlides',tw>w0+100&&w1>w0&&w1<tw&&w2>w1&&w2<tw&&V.mv===true&&shape());
  /* while it glides a click is still exact for what is drawn */
  {const a=click(.6,.4);chk('mmClickGliding',near(a[0],V.x+.6*V.w,1e-6)&&near(a[1],V.y+.4*V.h,1e-6))}
  CAM.x=far;CAM.z=cy;mmLook(true);O.mm2=[V.x,V.y,V.w,V.h].map(Math.round);chk('mmWideFrame',V.w>400&&shape()&&inV(cx,cy)&&inV(far,cy)&&V.mv===false);
  {const a=click(.1,.9),b=click((cx-V.x)/V.w,(cy-V.y)/V.h);chk('mmClickWide',near(a[0],V.x+.1*V.w,1e-6)&&near(a[1],V.y+.9*V.h,1e-6)&&near(b[0],cx,1e-6)&&near(b[1],cy,1e-6))}
  /* back home: far too wide now, so it narrows again */
  CAM.x=cx;CAM.z=cy;mmLook(false);chk('mmNarrowsBack',V.tw<V.w-100);mmLook(true);CAM.x=cam0[0];CAM.z=cam0[1]}
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
