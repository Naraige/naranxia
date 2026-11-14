async()=>{/* NOT in the suite: how long does the horde walk from its spawn? Worlds SPW (default 0,1,2,9), wave SPV (default 3), perfect defence as tests/waves.js.
   python3 tools/run.py tests/spawn_pace.js   -> per world: t10 / t50 = seconds until 10 % / 50 % of the horde has come within 12 tiles of a castle (zombies in range die), end = wave beaten */
 renderer.render=function(){};const KR=8,W=typeof SPV==='number'?SPV:3,TR=typeof SPW==='object'?SPW:[0,1,2,9],out=[];MP.dc={readyState:'open',send:()=>{}};const RR=Math.random;
 for(const trial of TR){const coop=trial%2===1;let sd=(trial*7919+4242)%2147483646+1;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};for(let i=0;i<20;i++)rn();Math.random=rn;
  rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;
  for(let t=0;t<20000&&!(a&&(b||!coop));t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
  if(coop){MP.host=true;MP.conn=true;MP.mine=a;MP.theirs=b;mpStart()}else{MP.on=false;MP.conn=false;pickPos={tx:a.tx,ty:a.ty,ok:true};confirmPick()}
  waveT=1e9;for(let i=0;i<40;i++)update(.05);
  waveN=W-1;waveST=time;wave();waveOn=hordeOn=true;hordeT=time;waveT=0;const t0=time,z=SW.n+SW.q.reduce((n,q)=>n+q.left,0)+units.filter(u=>u.t===1&&u.lane>=0).length;let dead=0,t10=-1,t50=-1;
  for(let k=0;k<18400&&waveOn;k++){update(.05);const Cs=structs.filter(s=>s.type==='castle');for(const c of Cs)c.hp=c.max;over=false;
   for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;for(const c of Cs)if(Math.abs(SW.x[i]-c.x)<KR*TS&&Math.abs(SW.y[i]-c.y)<KR*TS){SW.hp[i]=0;dead++;break}}
   for(const u of units)if(u.t===1&&u.hp>0)for(const c of Cs)if(Math.abs(u.x-c.x)<KR*TS&&Math.abs(u.y-c.y)<KR*TS){u.hp=0;dead++;break}
   if(t10<0&&dead>=z*.1)t10=Math.round(time-t0);if(t50<0&&dead>=z*.5)t50=Math.round(time-t0)}
  const r={trial,coop,z,t10,t50,end:Math.round(time-t0)};console.log(JSON.stringify(r));out.push(r);Math.random=RR;MP.on=false}
 return 'DONE'}
