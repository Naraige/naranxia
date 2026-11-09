async()=>{/* King XP and talents: xp sources, levels, talent choice, skill interaction, save round trip */
 renderer.render=function(){};/* headless WebGL is slow, no picture needed */
 let s=77;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();CX=pickPos.tx;CY=pickPos.ty;reset();startGame();for(const R of RESP){R.g=99999;R.w=99999;R.s=99999}
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};waveT=1e9;
 let kg=kingOf(0);if(!kg){kg=mkU(0,'king',(CS.tx+3.5)*TS,(CS.ty+3.5)*TS,null,-1);units.push(kg)}
 const kx=kg.x,ky=kg.y;
 chk('startLevel1',kxLevel(kg)===1&&kPoints(kg)===0&&!(kg.kxp>0));
 /* a talent with no point does nothing */
 kingTalent0(0);chk('noPointNoTalent',!kg.kt);
 /* kill xp: a zombie dying near the King gives 1, far away gives nothing */
 const zn=mkU(1,'zombie',kx+TS*3,ky,null,-1);units.push(zn);zn.hp=0;
 const zf=mkU(1,'zombie',kx+TS*30,ky+TS*30,null,-1);units.push(zf);zf.hp=0;
 update(.05);chk('killNear',kg.kxp===1);
 /* wave xp: wave 1 gives nothing, wave 2 gives 3 */
 waveN=0;wave();chk('wave1NoXp',kg.kxp===1);wave();chk('wave2Xp',kg.kxp===4);
 /* boss xp reaches the King wherever he stands */
 const bz=mkU(1,'brute',kx+TS*40,ky+TS*40,null,-1);bz.boss=1;bz.bn=0;units.push(bz);bz.hp=0;update(.05);chk('bossXp',kg.kxp===16);
 /* levels: 25 -> level 2 and one point */
 kingXp(kg,9);chk('level2',kxLevel(kg)===2&&kPoints(kg)===1&&kg.kxp===25);
 kingTalent0(2);chk('badBranch',!kg.kt&&kPoints(kg)===1);kingTalent0(0);chk('branchOrder',kHas(kg,0)&&!kHas(kg,2)&&kPoints(kg)===0);
 kingTalent0(0);chk('noSecondPoint',!kHas(kg,1)&&kg.kt===1);
 kingXp(kg,45);chk('level3',kxLevel(kg)===3&&kPoints(kg)===1);kingTalent0(1);chk('combatBranch',kHas(kg,4)&&kg.kt===17);
 kingXp(kg,500);chk('level5cap',kxLevel(kg)===5&&kPoints(kg)===2&&GST.kl===5);
 /* war cry: talent 0 lasts 12 s */
 const kn=mkU(0,'knight',kx+TS,ky,null,-1);units.push(kn);const t0=time;
 kg.sk_cry=0;kingSkill0('cry');chk('cryLong',kn.wcT>t0+11.9&&kn.wcT<t0+12.1&&kn.wcM===1.35&&kskLeft(kg,'cry')>44);
 /* learn the rest: points 2 and 3 */
 kingTalent0(0);kingTalent0(1);chk('allPoints',kg.kt===(1|2|16|32)&&kPoints(kg)===0);
 kg.sk_cry=0;kn.wcT=0;kingSkill0('cry');chk('cryWide',kn.wcT>0&&kskLeft(kg,'cry')>44);
 const far=mkU(0,'knight',kx+TS*13,ky,null,-1);units.push(far);kg.sk_cry=0;kingSkill0('cry');chk('cryRange15',far.wcT>time);
 /* plate: 20 % less damage taken and slow regeneration */
 kingTick(.05);chk('plate',kg.kdr===.8);const h0=kg.hp=100;kingTick(1);chk('regen',kg.hp>100.5&&kg.hp<101.5);
 /* charge: heavy charge reaches 4 tiles and hits harder */
 const zc=mkU(1,'zombie',kx+TS*3.6,ky,null,-1);zc.hp=500;units.push(zc);const zh=zc.hp;kg.sk_charge=0;kingSkill0('charge');chk('heavyCharge',zh-zc.hp>=(60+waveN*2)*1.5-.01&&kg.chT>time+3.9&&kg.chT<time+4.1);
 /* the same level-5 King with all talents: force the remaining bits to test the rest */
 kg.kt=255;kg.sk_charge=0;kg.chT=0;const bs=mkU(1,'brute',kx+TS*2,ky,null,-1);bs.boss=1;bs.bn=2;bs.hp=9999;bs.bmax=9999;bs.bs=2;units.push(bs);
 const bh=bs.hp;kingSkill0('charge');chk('bossBreaker',bh-bs.hp>=(60+waveN*2)*1.5*2-.01&&bs.bs>=7.9&&kg.chT>time+5.9&&kskLeft(kg,'charge')<=28.01);
 /* warlord ward: units under the cry take half of the Frost King chill */
 kn.wcT=0;kn.hp=100;const fk=mkU(1,'brute',kx+TS*30,ky,null,-1);fk.boss=1;fk.bn=2;fk.hp=9999;fk.bmax=9999;fk.bs=.01;fk.x=kn.x;fk.y=kn.y;
 kg.sk_cry=0;kingSkill0('cry');kn.hp=100;units.push(fk);const hb=kn.hp;fk.bs=.01;update(.05);const d1=hb-kn.hp;
 const kn2=mkU(0,'knight',kn.x,kn.y,null,-1);units.push(kn2);kn2.hp=100;fk.bs=.01;update(.05);const d2=100-kn2.hp;
 chk('frostWard',d1>0&&d2>0&&d1<d2*.75);
 /* nothing loses its fields on a King created by an old save: absent kxp / kt means level 1 */
 const old=mkU(0,'king',kx+TS*5,ky,null,-1);chk('absentFields',kxLevel(old)===1&&kPoints(old)===0&&!kHas(old,0));
 /* save round trip: xp, talents and cooldowns come back */
 kg.kxp=150;kg.kt=0b1011;paused=true;const txt=await svPack();kg.kxp=0;kg.kt=0;await svApply(txt);
 const k2=kingOf(0);chk('saveRoundTrip',!!k2&&k2.kxp===150&&k2.kt===11&&kxLevel(k2)===4&&kPoints(k2)===0);
 /* a save without the fields (old save): load keeps working and the King is level 1 */
 const S=JSON.parse(txt);let stripped=0;for(const o of S.objs){const q=o&&o.$o;if(q&&q.type==='king'){delete q.kxp;delete q.kt;delete q.kdr;stripped++}}
 await svApply(JSON.stringify(S));const k3=kingOf(0);for(let i=0;i<5;i++)update(.05);chk('oldSave',stripped>0&&!!k3&&kxLevel(k3)===1);
 Math.random=RR;
 O.ok=C.every(Boolean);O.fails=Object.keys(O).filter(k=>k!=='ok'&&k!=='fails'&&!O[k]);return JSON.stringify(O)}
