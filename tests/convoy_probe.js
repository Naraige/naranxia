async()=>{/* NOT in the suite: probe of co-op convoys between pairs of valid castle sites 24 to 60 tiles apart (one page, the guest's convoy command run directly).
   python3 tools/run.py tests/convoy_probe.js   -> per pair: delivered / partly / returned, seconds, porter positions every 15 s ('!' = no path order, 'b' = walking back).
   Worlds are seeded 101.. (pair 103 is the one used by mp_quests and mp_convoy). With random worlds 5 pairs of 36 were not delivered within the 120 s of convoyStep. */
 renderer.render=function(){};const out=[];
 MP.dc={readyState:'open',send:()=>{}};MP.host=true;MP.conn=true;
 for(let trial=0;trial<10;trial++){
  const RR=Math.random;let sd=101+trial;Math.random=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
  rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;
  for(let t=0;t<20000&&!(a&&b);t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
  Math.random=RR;
  if(!b){out.push({trial,nob:1});continue}
  MP.mine=a;MP.theirs=b;mpStart();waveT=1e9;for(const R of RESP){R.w=5000;R.s=5000}
  for(let i=0;i<40;i++)update(.05);
  mpExec({k:'cv',g:0,w:120,s:60,f:0},false);
  const cv=()=>units.filter(u=>u.cv);let res='?',t=0;const tr=[],e0=QST.e.cv|0;
  for(;t<3600;t++){update(.05);const c=cv();if(!c.length){res='gone';break}if(c.every(u=>u.cv.back)){res=(QST.e.cv|0)-e0>=c.length?'delivered':(QST.e.cv|0)>e0?'partly':'returned';break}
   if(t%300===0)tr.push(c.map(u=>Math.round(u.x/TS)+','+Math.round(u.y/TS)+(u.cv.back?'b':'')+(u.o?'':'!')).join(' '))}
  const sec=Math.round(t*.05);out.push(sec>60||res!=='delivered'?{trial,seed:SEED,a,b,d:Math.round(Math.hypot(a.tx-b.tx,a.ty-b.ty)),res,sec,dl:(QST.e.cv|0)-e0,tr}:{trial,a,b,res,sec,d:Math.round(Math.hypot(a.tx-b.tx,a.ty-b.ty))});
  MP.on=false}
 return JSON.stringify(out)}
