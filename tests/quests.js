async()=>{/* quest line: order, rewards, gather counters, new quests (market, guild, siege, envoy), off switch, test mode inert, same run twice = same state,
   co-op (shared line, switch command, snapshot round trip), save round trip, saves of the first version (16 quests by index) and saves without quests */
 try{renderer.render=()=>{}}catch{/* Rendering is optional for quest assertions; continue with the live renderer. */}
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};const RR=Math.random;const cur=()=>{const q=qCur();return q?q.id:'END'};
 const run=()=>{let s=41;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
  rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;const R=RESP[0],log=[];
  const st=()=>cur()+':'+Math.round(R.g)+':'+Math.round(R.w)+':'+Math.round(R.s)+':'+Math.round(R.f||0);
  const done=(t,a,b0)=>{const m=structs.length;for(let k=0;k<40&&structs.length===m;k++){const f=freeTile(CX+a+(k%5)*3*(a<0?-1:1),CY+b0+((k/5)|0)*3*(b0<0?-1:1));if(f)build(t,f[0],f[1])}if(structs.length===m){log.push('NOBUILD '+t);return null}const b=structs[structs.length-1];b.prog=1;b.hp=b.max;return b};
  const tick=n=>{for(let i=0;i<n;i++)update(.05)};
  log.push('start '+st());R.g=5000;R.w=5000;R.s=5000;R.f=500;
  /* gathering: only what the simulation step adds counts (the stock set above does not) */
  tick(2);log.push('noGather '+cur());
  for(let k=0;k<6000&&cur()!=='house';k++)update(.05);log.push('gathered '+cur()+' t'+Math.round(time));
  const g2=R.g;done('house',0,12);tick(1);log.push('house '+cur());done('farm',-8,5);tick(1);done('barracks',10,-8);tick(1);log.push('barracks '+cur()+' g+'+Math.round(R.g-g2));
  for(const t of['knight','knight','archer','archer']){const p=spawnPos(CS);units.push(mkU(0,t,p.x,p.y))}tick(2);log.push('army '+cur());
  for(let i=0;i<6;i++)done('wall',16,i-3);tick(1);log.push('walls '+cur());done('gate',-16,0);tick(1);log.push('gate '+cur());done('tower',6,-3);tick(1);
  for(let i=0;i<3;i++){const f=freeTile(CS.tx-9-i*2,CS.ty+9);build('spike',f[0],f[1])}tick(1);log.push('traps '+cur()+' spk'+SPK.size);
  /* switch off: nothing moves; on again */
  questSwitch(false);waveN=1;waveOn=false;tick(3);log.push('off '+cur());questSwitch(true);tick(1);log.push('wave1 '+cur());
  /* market: the building alone is half, a real trade finishes it */
  done('market',-4,-6);tick(1);log.push('marketBuilt '+cur());setPl(0);const w0=R.w;_N.trade('sellw');tick(1);log.push('traded '+cur()+' w'+Math.round(R.w-w0));
  done('guild',-4,10);tick(1);log.push('guildBuilt '+cur());roleAdj0('b',1);tick(1);log.push('builder '+cur());
  RS2.done.iron=true;tick(1);const kg=mkU(0,'king',(CS.tx+3.5)*TS,(CS.ty+7.5)*TS);units.push(kg);tick(1);log.push('king '+cur());kingSkill0('cry');tick(1);log.push('skill '+cur());
  waveN=5;tick(1);log.push('w5 '+cur());RS.done=true;tick(1);log.push('masonry '+cur());{const p=spawnPos(CS);units.push(mkU(0,'cannon',p.x,p.y))}tick(1);log.push('cannon '+cur());
  /* envoy: a tribute paid by a camp finishes it; a map without any camp passes it without reward */
  {const b=BASES.find(q=>q.alive),g0=R.g;if(b)b.envN=(b.envN|0)+1;tick(1);log.push('envoy '+cur()+(b?' g+'+Math.round(R.g-g0):' skipped g+'+Math.round(R.g-g0))+' d'+QST.d.envoy);if(b)b.envN-=1}
  waveN=9;tick(1);log.push('w9 '+cur());waveN=10;waveOn=false;tick(1);log.push('end '+st()+' n'+Object.keys(QST.d).length);RS2.done.iron=false;RS.done=false;return log};
 const a=run();const b=run();chk('same',JSON.stringify(a)===JSON.stringify(b));O.log=a;const at=p=>a.find(s=>s.startsWith(p+' '))||'';
 chk('order',at('noGather')==='noGather wood'&&/^gathered house/.test(at('gathered'))&&at('house')==='house farm'&&at('barracks')==='barracks knights g+40'&&at('army')==='army walls'&&at('walls')==='walls walls'&&at('gate')==='gate tower'&&/^traps wave1/.test(at('traps'))&&at('off')==='off wave1'&&at('wave1')==='wave1 market');
 chk('newQuests',at('marketBuilt')==='marketBuilt market'&&/^traded guild w-10$/.test(at('traded'))&&at('guildBuilt')==='guildBuilt guild'&&at('builder')==='builder research'&&at('king')==='king skill'&&at('skill')==='skill wave5'&&at('w5')==='w5 siege'&&at('masonry')==='masonry siege'&&at('cannon')==='cannon envoy'&&(/^envoy wave10 g\+60 d1$/.test(at('envoy'))||/^envoy wave10 skipped g\+0 d2$/.test(at('envoy')))&&at('w9')==='w9 wave10'&&/^end END:.* n20$/.test(at('end'))&&!a.some(s=>/NOBUILD/.test(s)));
 /* totals paid to a player over the whole line (convoy is co-op only) */
 {let g=0,w=0,s=0,f=0;for(const q of QUESTS){g+=q.r.g||0;w+=q.r.w||0;s+=q.r.s||0;f+=q.r.f||0}O.totals=[g,w,s,f].join('/');chk('totals',g===630&&w===200&&s===60&&f===110&&QUESTS.length===21&&new Set(QUESTS.map(q=>q.id)).size===21)}
 /* test mode: the line does not move and pays nothing */
 {QST.d={wood:1,ore:1};QST.a=[0,0,0];DEVU=true;update(.05);const c1=cur();DEVU=false;update(.05);chk('devInert',c1==='house'&&cur()==='farm')}
 /* save round trip; saves of the first version; saves without quests */
 {QST.d={wood:1,ore:1,house:1,market:2};QST.a=[3,4,5];QST.e={tr:2,cv:1};QST.dt=12.5;QST.last='house';paused=true;const txt=await svPack();QST.d={};QST.a=[9,9,9];QST.e={tr:0,cv:0};await svApply(txt);
  chk('saveBack',QST.v===2&&QST.d.house===1&&QST.d.market===2&&Object.keys(QST.d).length===4&&QST.a.join()==='3,4,5'&&QST.e.tr===2&&QST.e.cv===1&&QST.dt===12.5&&QST.on===1&&QST.last==='house');
  const S=JSON.parse(txt);delete S.R.QST;await svApply(JSON.stringify(S));chk('oldSaveOff',QST.on===0&&cur()==='wood');
  const m=qFix({v:1,on:1,i:11,a:[1,2,3],dt:40});QST=m;chk('lot1Mid',m.v===2&&m.on===1&&Object.keys(m.d).length===11&&m.d.wave1===1&&!m.d.research&&cur()==='market'&&m.a.join()==='1,2,3');
  QST=qFix({v:1,on:1,i:16,a:[0,0,0],dt:900});chk('lot1End',Object.keys(QST.d).length===16&&cur()==='market');
  QST=qFix({v:1,on:0,i:3});chk('lot1Off',QST.on===0&&cur()==='farm');QST=qFix({v:2,on:1,d:{wood:1,gone:1,ore:7}});chk('unknownIds',Object.keys(QST.d).join()==='wood')}
 /* co-op (one machine, as det does): the line runs, starts on whatever the local preference says, same run twice = same hashes and state,
    the switch is a command, a snapshot (what a resync sends) carries the state */
 {let pref=null;try{pref=localStorage.getItem('dk_quests');localStorage.setItem('dk_quests','0')}catch{/* The game can still test quest state when storage is unavailable. */}
  const co=()=>{MP.on=true;MP.host=true;SEED=123.456;GPR={fq:.012,wl:.3,mt:.55,rv:.012,rg:.95,am:.9,tr:.6,gd:1,tc:.006};SITE2=null;Math.random=rngf(777);randomSite();CX=pickPos.tx;CY=pickPos.ty;reset();inGame=true;started=false;waveT=1e9;Math.random=rngf(999);
   const on0=QST.on,hs=[];for(let k=0;k<1400;k++){update(1/30);if(k%350===349)hs.push(mpHash()+':'+cur()+':'+RESP.map(R=>Math.round(R.g)+'/'+Math.round(R.w)).join(','))}return {on0,hs,q:JSON.stringify(QST)}};
  const c1=co(),c2=co();O.coop=c1.hs;chk('coopOnByDefault',c1.on0===1);chk('coopMoves',!/:wood:/.test(c1.hs[c1.hs.length-1]));chk('coopSame',JSON.stringify(c1)===JSON.stringify(c2));
  let lp='x';try{lp=localStorage.getItem('dk_quests')}catch{/* The assertion below reports when persistence is unavailable. */}
  const n0=MP.out.length;questSwitch(false);const sent=MP.out[MP.out.length-1];chk('switchIsCommand',MP.out.length===n0+1&&sent&&sent.k==='qs'&&sent.on===0&&QST.on===1);MP.out.length=n0;
  mpExec({k:'qs',on:0},false);const off=QST.on;const h0=mpHash();mpExec({k:'qs',on:1},true);chk('switchExec',off===0&&QST.on===1&&h0!==mpHash());let lp2='y';try{lp2=localStorage.getItem('dk_quests')}catch{/* Keep the distinct sentinel so the persistence assertion fails clearly. */}chk('coopKeepsPref',lp===lp2);
  paused=true;const q0=JSON.stringify(QST),hq=mpHash(),txt=await svPack();QST.d={};QST.on=0;QST.a=[7,7,7];await svApply(txt);chk('snapshotKeeps',JSON.stringify(QST)===q0&&mpHash()===hq);
  /* convoy quest (co-op only): it stays while the two castles are linked by land and is looked at again only every 30 s (QST.ct, kept by
     a snapshot); with no land route (here a closed ring of walls around the partner's castle) it is skipped for both, without reward;
     a convoy already delivered is paid even then. All from simulation state: the same run twice gives the same result and hash. */
  {const cvq=async()=>{MP.on=true;MP.host=true;SITE2=null;Math.random=rngf(777);randomSite();CX=pickPos.tx;CY=pickPos.ty;let b=null;for(let t=0;t<20000&&!b;t++){randomSite();if(!pickPos||!pickPos.ok)continue;const d=Math.hypot(pickPos.tx-CX,pickPos.ty-CY);if(d>24&&d<45)b={tx:pickPos.tx,ty:pickPos.ty,rot:0}}
    SITE2=b;reset();inGame=true;started=false;paused=false;waveT=1e9;Math.random=rngf(999);const r={cs2:!!CS2};if(!CS2)return r;
    for(const q of QUESTS)if(q.id!=='convoy'&&q.id!=='wave10')QST.d[q.id]=1;for(const R of RESP){R.w=99999;R.s=99999;R.g=99999}
    update(1/30);r.l0=convoyLinked();r.cur0=qCur().id;r.ct=QST.ct>time+29;
    const cx=CS2.tx+2,cy=CS2.ty+2,rr=11;let n=0;setPl(1);for(let i=-rr;i<=rr;i++)for(const[x,y]of[[cx+i,cy-rr],[cx+i,cy+rr],[cx-rr,cy+i],[cx+rr,cy+i]]){const m=structs.length;_N.build('wall',x,y);if(structs.length>m){const w=structs[structs.length-1];w.prog=1;w.hp=w.max;n++}}setPl(0);
    r.walls=n;r.l1=convoyLinked();update(1/30);r.wait=qCur().id;/* not looked at again yet */
    paused=true;const c0=QST.ct,txt=await svPack();QST.ct=-5;await svApply(txt);r.ctKept=QST.ct===c0;r.mp=MP.on;MP.on=true;MP.host=true;paused=false;/* (a load outside a resync may leave co-op: back on for the rest) */
    time=QST.ct;const f0=RESP.map(R=>R.f||0);update(1/30);r.d=QST.d.convoy;r.cur=qCur().id;r.gain=RESP.map((R,i)=>Math.round((R.f||0)-f0[i]));r.msg=msgS;r.h=mpHash();
    /* delivered before the look: paid to both, not skipped */
    delete QST.d.convoy;QST.e.cv=1;QST.ct=-1e9;const f1=RESP.map(R=>R.f||0);update(1/30);r.paid=QST.d.convoy+':'+RESP.map((R,i)=>Math.round((R.f||0)-f1[i])).join();return r};
   const a=await cvq(),b=await cvq();O.convoy=a;
   chk('convoyLinkedStays',a.cs2&&a.l0===true&&a.cur0==='convoy'&&a.ct&&a.wait==='convoy'&&a.ctKept);
   chk('convoySkipped',a.l1===false&&a.d===2&&a.cur==='wave10'&&a.gain.every(v=>v<25)&&/^Quest skipped/.test(a.msg));
   chk('convoyPaidFirst',a.paid==='1:30,30');chk('convoySame',JSON.stringify(a)===JSON.stringify(b))}
  MP.on=false;MP.host=false;try{if(pref===null)localStorage.removeItem('dk_quests');else localStorage.setItem('dk_quests',pref)}catch{/* This test page is discarded after the preference restore attempt. */}}
 Math.random=RR;O.ok=C.every(Boolean);return JSON.stringify(O)}
