async()=>{/* spearman: trained at the barracks for its cost, reach over a front rank, bonus against brutes, weaker than a knight per head */
 let s=33;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 const O={},C0=[];const chk=(n,v)=>{O[n]=v;C0.push(!!v)};
 const R=RESP[0];R.g=5000;R.w=900;R.s=900;R.f=900;CURPL=0;
 /* numbers (docs/studio-notes/spearman.md) */
 const SPEAR_BIG=1.6,d=T.spearman,k=T.knight,sum=c=>(c.g||0)+(c.w||0)+(c.s||0)+(c.f||0);
 chk('stats',d.hp===85&&d.dmg===11&&d.rng===36&&d.cdt===1&&TRAIN.spearman===15);
 chk('cheaper',sum(C.spearman)<sum(C.knight)&&!C.spearman.s);
 /* never better than the knight per resource against ordinary zombies, nor per head against anything */
 chk('costPerDps',sum(C.spearman)/(d.dmg/d.cdt)>sum(C.knight)/(k.dmg/k.cdt));
 chk('perHead',d.hp<k.hp&&d.dmg/d.cdt*SPEAR_BIG<k.dmg/k.cdt);
 /* training: barracks, cost paid, one population */
 let bk=null;for(let a=0;a<40&&!bk;a++){const n0=structs.length,f=freeTile(CS.tx+7+(a%5)*4,CS.ty+7+(a/5|0)*4);build('barracks',f[0],f[1]);if(structs.length>n0)bk=structs[structs.length-1]}
 bk.prog=1;bk.hp=bk.max;selB=bk;const g0=R.g,w0=R.w,f0=R.f,s0=R.s,n0=units.filter(u=>u.type==='spearman').length;
 buy('spearman');chk('paid',g0-R.g===90&&w0-R.w===30&&f0-R.f===25&&s0===R.s);
 for(let i=0;i<260&&units.filter(u=>u.type==='spearman').length===n0;i++)update(.05);
 const sp0=units.find(u=>u.type==='spearman');chk('trained',!!sp0&&sp0.t===0&&sp0.hp===85);
 selB=null;buy('spearman');chk('notAtCastle',!queue.some(q=>q.type==='spearman'));
 /* reach: a zombie held 40 px away is struck by a spearman standing still, not by a knight */
 const f=freeTile(CS.tx+16,CS.ty+16),X=(f[0]+.5)*TS,Y=(f[1]+.5)*TS;
 const firstHit=(type,foe,gap)=>{const u=mkU(0,type,X,Y);u.stn='hold';units.push(u);const z=mkU(1,foe,X,Y+gap,null,-1);units.push(z);const h0=z.hp;let dm=0;
  for(let i=0;i<50&&!dm;i++){u.x=X;u.y=Y;z.x=X;z.y=Y+gap;z.cd=9;update(.05);dm=h0-z.hp}u.hp=0;z.hp=0;z.nokill=1;for(let i=0;i<3;i++)update(.05);return Math.round(dm*100)/100};
 const zS=firstHit('spearman','zombie',40),zK=firstHit('knight','zombie',40);O.zS=zS;O.zK=zK;
 chk('reach',zS===11&&zK===0);
 /* bonus against big targets */
 const bS=firstHit('spearman','brute',46);O.bS=bS;chk('bigBonus',Math.abs(bS-11*SPEAR_BIG)<.01);
 Math.random=RR;return JSON.stringify({ok:C0.every(Boolean),...O})}
