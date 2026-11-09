async()=>{let s=57;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 const out={};const bad=[];const need=(c,m)=>{if(!c)bad.push(m)};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 /* ---- camp personalities ---- */
 const bs=BASES.filter(b=>b.alive);out.nb=bs.length;out.traits=bs.map(b=>b.trait).join(',');
 need(bs.length>0,'no camp');need(bs.every(b=>TRAITS.includes(b.trait)),'every camp has a trait');
 {const keep=bs[0].trait;delete bs[0].trait;need(baseTrait(bs[0])===keep,'trait of a camp without the field is recomputed identically')}
 {const a=[],b2=[];for(let i=1;i<=60;i++){a.push(baseTrait({id:i}));b2.push(baseTrait({id:i}))}need(a.join()===b2.join(),'trait is a pure function of seed and id');need(new Set(a).size===TRAITS.length,'all traits occur')}
 need(campLabel(bs[0]).startsWith(bs[0].name+' - '),'label = name - trait');
 /* ---- events with a choice, through the real command path (co-op wrapper + mpExec) ---- */
 MP.on=true;MP.host=true;MP.out=[];const R=RESP[0];
 const cmd=()=>{const c=MP.out.shift();return c};
 R.g=0;R.w=0;R.s=0;R.f=0;
 waveN=1;wave();/* wave 2: caravan */
 need(EVS.cur&&EVS.cur.k==='car'&&EVS.cur.i===9,'caravan opens at wave 2');need(R.g===0,'no automatic gift any more');
 out.ttl=Math.round(EVS.cur.exp-time);need(out.ttl===30,'30 s of sim time to answer');
 evChoose(0);const c1=cmd();need(c1&&c1.k==='ev'&&c1.i===9&&c1.c===0,'click becomes an ev command');need(R.g===0&&EVS.cur,'nothing applied before the command runs');
 mpExec(c1,true);need(R.g===60&&R.w===42&&R.s===30&&EVS.cur===null,'take now: wave 2 goods '+R.g+'/'+R.w+'/'+R.s);
 mpExec({k:'ev',i:9,c:1},false);need(R.g===60&&EVS.pay.length===0,'stale command ignored');
 /* escort: gold only, 2.5x, paid 40 s later */
 R.g=0;R.w=0;R.s=0;waveN=5;wave();/* wave 6: caravan (6%4=2), no envoys */
 need(EVS.cur&&EVS.cur.k==='car'&&EVS.cur.i===25,'caravan at wave 6');
 evChoose(1);mpExec(cmd(),true);need(EVS.cur===null&&EVS.pay.length===1&&R.g===0&&R.w===0,'escort: nothing yet, one payment queued');
 time+=20;eventsTick();need(R.g===0,'not paid after 20 s');
 time+=21;eventsTick();need(R.g===Math.round(100*2.5)&&EVS.pay.length===0,'escort pays 2.5x gold after 40 s: '+R.g);
 /* nobody answers: first choice after 30 s, and the whole thing is the same with MP off (solo path) */
 R.g=0;R.w=0;R.s=0;waveN=1;wave();time+=29;eventsTick();need(EVS.cur&&R.g===0,'still open at 29 s');
 time+=2;eventsTick();need(EVS.cur===null&&R.g===60,'default = take the goods at 30 s');
 /* wave 10: caravan and envoys together, the second waits its turn */
 R.g=0;R.w=0;R.s=0;R.f=0;waveN=9;wave();
 need(EVS.cur&&EVS.cur.k==='car'&&EVS.q.length===1&&EVS.q[0].k==='env','envoys queue behind the caravan');
 evChoose(0);mpExec(cmd(),true);eventsTick();need(EVS.cur&&EVS.cur.k==='env'&&EVS.q.length===0,'envoys open next');
 out.envCamp=EVS.cur.cn;need(!!EVS.cur.cn&&EVS.cur.cn.indexOf(' - ')>0,'envoys come from a named camp with its trait: '+EVS.cur.cn);
 need(Math.abs(EVS.cur.exp-time-30)<.01,'queued event gets its own 30 s');
 evChoose(1);mpExec(cmd(),true);need(EVS.cur===null&&R.ren===1&&R.g===140&&R.f===0,'refuse: +1 renown, no tribute (g '+R.g+' ren '+R.ren+')');
 need(Math.abs(renownMul(0)-1.1)<1e-9,'renown +10% per point');
 /* accept with renown (wave 4: 4%6=4, 4%4=0 so envoys alone) */
 R.g=0;R.f=0;waveN=3;wave();const mu=EVS.cur.mu,eg=Math.round((30+4*6)*mu*1.1),ef=Math.round((40+4*5)*mu*1.1);
 evChoose(0);mpExec(cmd(),true);need(R.g===eg&&R.f===ef,'accept pays renown x camp trait: '+R.g+'/'+R.f+' want '+eg+'/'+ef);
 R.ren=40;need(Math.abs(renownMul(0)-2)<1e-9,'renown capped at 10 points');R.ren=1;
 MP.on=false;MP.out=[];
 /* solo path: no command, applied at once */
 R.g=0;waveN=1;wave();evChoose(0);need(EVS.cur===null&&R.g===60,'solo click applies directly');
 /* ---- camp traits on the envoy unit ---- */
 const b=bs[0];const gain=(tr,wrf)=>{b.trait=tr;b.wrf=wrf;b.envT=0;b.envN=0;b.envG=0;b.envF=0;const g0=R.g,u=mkU(0,'envoy',b.x+TS,b.y);units.push(u);for(let i=0;i<4;i++)update(.05);return{g:R.g-g0,dead:u.hp<=0,u}};
 const base=gain('warlike',0);const expect=Math.round((80+Math.min(waveN,20)*8)*renownMul(0));
 need(base.dead&&base.g===expect,'neutral camp pays the base tribute '+base.g+' vs '+expect);
 const mer=gain('merchant',0);need(mer.dead&&mer.g===Math.round((80+Math.min(waveN,20)*8)*1.5*renownMul(0)),'merchants pay 50% more '+mer.g);
 const w1=gain('wary',0);need(!w1.dead&&w1.g===0&&b.wrf===1&&b.envT>time,'wary camp turns the first envoy away (envoy lives, no pay)');
 time=b.envT+1;for(let i=0;i<4;i++)update(.05);need(w1.u.hp<=0&&R.g>0,'wary camp pays on the second visit');
 /* ---- warlike: the group sent against a warlike camp is 25% tougher; the camp is moved onto the lane so the wave finds it ---- */
 {const L=nextL[0],wp=ROUTES[L].wps[0],ox=b.tx,oy=b.ty;for(const q of BASES)q.trait='warlike';b.alive=true;b.tx=wp[0];b.ty=wp[1];waveN=20;const n0=units.length;wave();b.tx=ox;b.ty=oy;
  const tbz=units.slice(n0).filter(u=>u.t===1&&u.tb===b&&u.type==='zombie');const ref=mkU(1,'zombie',0,0).hp*(1+.05*waveN);
  out.warlike=tbz.length?+(tbz[0].hp/ref).toFixed(3):null;need(tbz.length>0&&Math.abs(out.warlike-1.25)<.01,'warlike camp: horde 25% tougher, ratio '+out.warlike);
  for(const q of BASES)q.trait='merchant';waveN=24;const n1=units.length;b.tx=wp[0];b.ty=wp[1];wave();b.tx=ox;b.ty=oy;const tz2=units.slice(n1).filter(u=>u.t===1&&u.tb===b&&u.type==='zombie');
  need(tz2.length>0&&Math.abs(tz2[0].hp/(mkU(1,'zombie',0,0).hp*(1+.05*waveN))-1)<.01,'other camps: no bonus')}
 /* ---- save: the open event and queued payments survive a round trip ---- */
 for(const q of BASES)q.trait=null;
 EVS.cur=null;EVS.q=[];EVS.pay=[];R.ren=3;waveN=9;MP.on=false;wave();/* caravan open, envoys queued */EVS.pay.push({t:time+100,g:77});
 const want=JSON.stringify(EVS);need('EVT' in SAVA&&SAVA.EVT[0]()===EVS,'EVT in SAVA');
 /* the full svPack/svApply round trip is the job of the save test (EVT is in SAVA, so it travels); here: plain data survives JSON and svAssign */
 const clone=JSON.parse(want);EVS.cur=null;EVS.q=[];EVS.pay=[];svAssign('EVT',clone);
 need(JSON.stringify(EVS)===want&&EVS.cur&&EVS.cur.k==='car'&&EVS.q.length===1&&EVS.pay.length===1,'event state restored by svAssign');
 need(BASES.every(q=>q.alive===false||TRAITS.includes(baseTrait(q))),'traits recomputed after load');
 /* an old save without EVT leaves a usable state */
 for(const k of Object.keys(EVS))delete EVS[k];eventsTick();need(EVS.cur===null&&Array.isArray(EVS.q)&&Array.isArray(EVS.pay),'absent fields tolerated');
 Math.random=RR;
 out.bad=bad;out.ok=bad.length===0;return JSON.stringify(out)}
