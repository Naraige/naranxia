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
 /* rebel camps (v93): the share of spearmen among the melee fighters follows the camp's trait: merchants 1 in 4, wary 1 in 3, warlike 1 in 2 */
 chk('shareRule',[1,2,4,8,9].map(n=>['merchant','wary','warlike'].map(t=>spearN({trait:t},n)).join('')).join(' ')==='000 111 112 224 234');
 const bs=BASES.filter(b=>b.alive&&b.ai),cnt=(b,t)=>b.us.filter(u=>u.hp>0&&u.type===t).length,camp={};O.camps=bs.length;
 ['merchant','wary','warlike'].forEach((tr,i)=>{const b=bs[i];if(!b)return;b.trait=tr;b.res={g:1e5,w:1e5,s:1e5,f:1e5};
  /* a grown camp: 4 houses, barracks, 2 towers, 4 farms, storage, all finished (level 3: room for 13 soldiers) */
  for(const t of['house','house','house','house','barracks','tower','tower','farm','farm','farm','farm','storage']){const sp=campDebug.aiSpot(b,t);if(!sp)continue;const st=campDebug.aiPlace(b,t,sp[0],sp[1],sp[2]);st.prog=1;st.hp=st.max;b.proj=null}
  for(let k=0;k<40;k++){b.trT=0;b.bT=99;campDebug.aiTick(8)}
  const kn=cnt(b,'knight'),sp=cnt(b,'spearman'),ar=cnt(b,'archer');camp[tr]=kn+'k'+sp+'s'+ar+'a';
  chk('camp_'+tr,sp===spearN(b,kn+sp)&&sp>=1&&kn>=1&&ar>=1);
  /* a fallen spearman is replaced by a spearman, a fallen knight by a knight */
  const d1=b.us.find(u=>u.type==='spearman');d1.hp=0;b.trT=0;campDebug.aiTick(8);const r1=cnt(b,'spearman')===sp&&cnt(b,'knight')===kn;
  const d2=b.us.find(u=>u.type==='knight'&&u.hp>0);d2.hp=0;b.trT=0;campDebug.aiTick(8);chk('refill_'+tr,r1&&cnt(b,'spearman')===sp&&cnt(b,'knight')===kn)});
 O.camp=camp;chk('campOrder',!!camp.warlike&&+camp.warlike.split('k')[1].split('s')[0]>+camp.merchant.split('k')[1].split('s')[0]);
 /* a rebel spearman is a camp unit (team 2, camp colour) and fights like ours: reach, and the bonus against a brute */
 {const b=bs[0],u=b.us.find(q=>q.type==='spearman'&&q.hp>0);chk('rebelUnit',u.t===2&&u.base===b&&u.ci===b.ci&&u.hp===85);
  const x0=u.hx,y0=u.hy;u.x=x0;u.y=y0;const z=mkU(1,'brute',x0,y0+46,null,-1);units.push(z);const h0=z.hp;let dm=0;
  for(let i=0;i<60&&!dm;i++){u.x=x0;u.y=y0;z.x=x0;z.y=y0+46;z.cd=9;update(.05);dm=h0-z.hp}z.hp=0;z.nokill=1;O.rebB=Math.round(dm*100)/100;chk('rebelBonus',Math.abs(dm-11*SPEAR_BIG)<.01)}
 /* the camps live on for 20 s of simulation with their spearmen, and the state hash is a number */
 for(let i=0;i<400;i++)update(.05);chk('runs',units.some(u=>u.t===2&&u.type==='spearman'&&u.hp>0)&&typeof mpHash()!=='undefined');
 /* hotkey (v93): F4 by default, used by nothing else; saved keys with the old default move once, a later choice of the player is kept */
 {const LS=localStorage,k0=LS.getItem('dk_keys'),v0=LS.getItem('dk_keyv'),put=(o,v)=>{if(o)LS.setItem('dk_keys',JSON.stringify(o));else LS.removeItem('dk_keys');if(v)LS.setItem('dk_keyv',v);else LS.removeItem('dk_keyv');loadKB();return KB.spearman+'/'+KB.knight+'/'+(o?JSON.parse(LS.getItem('dk_keys')).spearman:LS.getItem('dk_keys'))};
  const n=put(null);chk('keyDefault',n==='f4/2/null'&&Object.keys(KB).filter(q=>KB[q]==='f4').length===1);
  /* the key itself: F4 with the barracks selected queues a spearman */
  selB=bk;const q0=queue.filter(q=>q.type==='spearman').length;dispatchEvent(new KeyboardEvent('keydown',{key:'F4',cancelable:true}));O.q=queue.filter(q=>q.type==='spearman').length-q0;chk('keyPress',O.q===1);selB=null;
  const B=String.fromCharCode(92),a=put({...KB,spearman:B}),b=put({...KB,spearman:B,knight:'f4'}),c=put({...KB,spearman:B,knight:'2'},'2'),d=put({spearman:'f9'});O.keys=[n,a,b,c,d].join(' ');
  chk('keyMigrate',a==='f4/2/f4'&&b===B+'/f4/'+B&&c===B+'/2/'+B&&d==='f9/2/f9');
  if(k0===null)LS.removeItem('dk_keys');else LS.setItem('dk_keys',k0);if(v0===null)LS.removeItem('dk_keyv');else LS.setItem('dk_keyv',v0);loadKB()}
 Math.random=RR;return JSON.stringify({ok:C0.every(Boolean),...O})}
