async()=>{/* quest line: order, rewards, gather counters, off switch, co-op and test mode inert, same run twice = same state, save round trip */
 try{renderer.render=()=>{}}catch(e){}
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};const RR=Math.random;
 const run=()=>{let s=41;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
  rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;const R=RESP[0],log=[];
  const st=()=>QST.i+':'+Math.round(R.g)+':'+Math.round(R.w)+':'+Math.round(R.s)+':'+Math.round(R.f||0);
  const done=(t,a,b0)=>{const m=structs.length;for(let k=0;k<40&&structs.length===m;k++){const f=freeTile(CX+a+(k%5)*3*(a<0?-1:1),CY+b0+((k/5)|0)*3*(b0<0?-1:1));if(f)build(t,f[0],f[1])}if(structs.length===m){log.push('NOBUILD '+t);return null}const b=structs[structs.length-1];b.prog=1;b.hp=b.max;return b};
  const tick=n=>{for(let i=0;i<n;i++)update(.05)};
  log.push('start '+st());R.g=5000;R.w=5000;R.s=5000;R.f=500;
  /* 1-2 gathering: only what the simulation step adds counts (the stock set above does not) */
  tick(2);log.push('noGather '+QST.i);
  for(let k=0;k<6000&&QST.i<2;k++)update(.05);log.push('gathered '+QST.i+' t'+Math.round(time));
  const g2=R.g;done('house',0,12);tick(1);log.push('house '+QST.i);done('farm',-8,5);tick(1);done('barracks',10,-8);tick(1);log.push('barracks '+QST.i+' g+'+Math.round(R.g-g2));
  for(const t of['knight','knight','archer','archer']){const p=spawnPos(CS);units.push(mkU(0,t,p.x,p.y))}tick(2);log.push('army '+QST.i);
  for(let i=0;i<6;i++)done('wall',16,i-3);tick(1);log.push('walls '+QST.i);done('gate',-16,0);tick(1);log.push('gate '+QST.i);done('tower',6,-3);tick(1);
  for(let i=0;i<3;i++){const f=freeTile(CS.tx-9-i*2,CS.ty+9);build('spike',f[0],f[1])}tick(1);log.push('traps '+QST.i+' spk'+SPK.size);
  /* switch off: nothing moves; on again */
  qSetOn(false);waveN=1;waveOn=false;tick(3);log.push('off '+QST.i);qSetOn(true);tick(1);log.push('wave1 '+QST.i);
  RS2.done.iron=true;tick(1);const kg=mkU(0,'king',(CS.tx+3.5)*TS,(CS.ty+7.5)*TS);units.push(kg);tick(1);log.push('king '+QST.i);kingSkill0('cry');tick(1);log.push('skill '+QST.i);
  waveN=5;tick(1);waveN=9;tick(1);log.push('w9 '+QST.i);waveN=10;waveOn=false;tick(1);log.push('end '+st());RS2.done.iron=false;return log};
 const a=run();const b=run();chk('same',JSON.stringify(a)===JSON.stringify(b));O.log=a;
 chk('order',a[1]==='noGather 0'&&/^gathered 2/.test(a[2])&&a[3]==='house 3'&&/^barracks 5 g\+40$/.test(a[4])&&a[5]==='army 7'&&a[6]==='walls 7'&&a[7]==='gate 8'&&/^traps 10/.test(a[8])&&a[9]==='off 10'&&a[10]==='wave1 11'&&a[11]==='king 13'&&a[12]==='skill 14'&&a[13]==='w9 15'&&/^end 16:/.test(a[14]));
 /* totals paid over the whole line */
 {let g=0,w=0,s=0,f=0;for(const q of QUESTS){g+=q.r.g||0;w+=q.r.w||0;s+=q.r.s||0;f+=q.r.f||0}O.totals=[g,w,s,f].join('/');chk('totals',g===540&&w===120&&s===40&&f===80&&QUESTS.length===16)}
 /* co-op and test mode: the line does not move and pays nothing */
 {QST.i=2;QST.a=[0,0,0];MP.on=true;update(.05);const i1=QST.i;MP.on=false;DEVU=true;update(.05);const i2=QST.i;DEVU=false;chk('coopDevInert',i1===2&&i2===2);update(.05);chk('soloMoves',QST.i===3)}
 /* save round trip: progress and counters come back; a save without QST loads with the line off */
 {QST.i=7;QST.a=[3,4,5];QST.dt=12.5;paused=true;const txt=await svPack();QST.i=1;QST.a=[9,9,9];await svApply(txt);chk('saveBack',QST.i===7&&QST.a.join()==='3,4,5'&&QST.dt===12.5&&QST.on===1);
  const S=JSON.parse(txt);delete S.R.QST;await svApply(JSON.stringify(S));chk('oldSaveOff',QST.on===0&&QST.i===0)}
 Math.random=RR;O.ok=C.every(Boolean);return JSON.stringify(O)}
