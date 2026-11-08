async()=>{/* market barter + next wave preview (read only) */
 let s=57;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};
 const R=RESP[0];R.g=5000;R.w=500;R.s=500;R.f=500;
 const f=freeTile(CS.tx+7,CS.ty+7);build('market',f[0],f[1]);const m=structs[structs.length-1];m.prog=1;m.hp=m.max;
 CURPL=0;
 /* barter wood -> stone: -50 wood, + floor(50*pw/ps*.9) stone, wood price down, stone price up */
 const pw=PRICE.w,ps=PRICE.s,exp=Math.max(1,Math.floor(50*pw/ps*.9)),w0=R.w,s0=R.s;
 buy('xws');
 chk('barterWood',R.w===w0-50);chk('barterGot',R.s===s0+exp&&exp>=1);chk('priceMoves',PRICE.w<pw&&PRICE.s>ps);
 /* barter is better than selling then buying back */
 PRICE.w=1;PRICE.s=1.3;PRICE.f=.8;const g0=R.g,sBefore=R.s;R.w=500;buy('xws');const viaBarter=R.s-sBefore;R.g=g0;
 chk('betterThanRoundTrip',viaBarter>(50*1*.8)/Math.round(50*1.3*1.25)*50);
 /* too poor: nothing happens */
 R.w=10;const s1=R.s;buy('xws');chk('needs50',R.w===10&&R.s===s1);
 /* no market: nothing happens */
 R.w=500;m.hp=0;const w1=R.w;buy('xwf');chk('needsMarket',R.w===w1);
 /* prices drift back, deterministic */
 PRICE.w=.5;for(let i=0;i<400;i++)update(.05);chk('priceDrift',PRICE.w>.5&&PRICE.w<=1);
 /* preview: pure read, matches waves.js rules */
 const p0=JSON.stringify([waveN,nextL,R.g,R.w,units.length]);
 const a=wavePreview(1),b=wavePreview(3),c=wavePreview(10),d=wavePreview(15);
 chk('previewRead',JSON.stringify([waveN,nextL,R.g,R.w,units.length])===p0);
 chk('w1',a.n===1&&a.kinds.join()==='Husks,Zombies'&&a.ev.length===0);
 chk('w3',b.ev.includes('Blood Moon')&&b.kinds.includes('Runners'));
 chk('w10',c.boss==='The Hollow Warden'&&c.ev.includes('Boss')&&c.kinds.includes('Brutes')&&c.kinds.includes('Acid spitters'));
 chk('w15',d.kinds.includes('Miners')&&d.ev.length===0);
 waveN=5;chk('defaultNext',wavePreview().n===6);waveN=0;
 Math.random=RR;return JSON.stringify({ok:C.every(Boolean),...O})}
