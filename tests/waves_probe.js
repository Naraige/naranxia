async()=>{/* NOT in the suite: probe of "the wave cannot end" (#27). Many seeded worlds and sites, solo and two castles, rendering stubbed.
   python3 tools/run.py tests/waves_probe.js   -> one line per trial (LOG), then TOTAL.
   Each trial plays one wave with a perfect defence: the castles cannot fall and every zombie that comes within KR tiles of a castle dies.
   What is left is what a player could never kill at his walls. Per trial: end = seconds of simulation until the wave is beaten (900 = the game's own time limit),
   z = zombies of the wave, left = alive at the end, wat = of these standing on a water tile, stk = not moved a tile in 30 s (and not biting),
   stk2 = the same over 60 s,
   wmax = most zombies seen on water tiles at one sample, st = states of the left ones, at = a few positions "tx,ty:tiles to the castle:state". */
 renderer.render=function(){};const N=typeof WPN==='number'?WPN:24,W0=typeof WPW==='number'?WPW:3,KR=8,out=[];let bad=0,n=0;
 MP.dc={readyState:'open',send:()=>{}};
 for(let trial=typeof WP0==='number'?WP0:0;trial<N;trial++){const coop=trial%2===1;
  const RR=Math.random;let sd=(trial*7919+4242)%2147483646+1;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};for(let i=0;i<20;i++)rn();Math.random=rn;
  rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;
  for(let t=0;t<20000&&!(a&&(b||!coop));t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
  if(coop&&!b){Math.random=RR;console.log(JSON.stringify({trial,nob:1}));continue}
  if(coop){MP.host=true;MP.conn=true;MP.mine=a;MP.theirs=b;mpStart()}else{MP.on=false;MP.conn=false;pickPos={tx:a.tx,ty:a.ty,ok:true};confirmPick()}
  waveT=1e9;for(let i=0;i<40;i++)update(.05);
  waveN=W0-1;waveST=time;wave();waveOn=hordeOn=true;hordeT=time;waveT=0;const t0=time,z=SW.n+SW.q.reduce((n,q)=>n+q.left,0)+units.filter(u=>u.t===1&&u.lane>=0).length,cs=()=>structs.filter(s=>s.type==='castle');
  const last=new Map();let stk=new Set(),stk2=new Set(),wmax=0,k=0;
  for(;k<18400&&waveOn;k++){update(.05);const C=cs();for(const c of C)c.hp=c.max;over=false;
   for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;for(const c of C)if(Math.abs(SW.x[i]-c.x)<KR*TS&&Math.abs(SW.y[i]-c.y)<KR*TS){SW.hp[i]=0;break}}
   for(const u of units)if(u.t===1&&u.hp>0)for(const c of C)if(Math.abs(u.x-c.x)<KR*TS&&Math.abs(u.y-c.y)<KR*TS){u.hp=0;break}
   if(k%600===599){const pv=stk;stk=new Set();stk2=new Set();let w=0;for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;const id=SW.id[i],x=SW.x[i],y=SW.y[i],p=last.get(id);if(ter[((y/TS)|0)*TW+((x/TS)|0)]===1)w++;
     if(p&&Math.abs(p[0]-x)<TS&&Math.abs(p[1]-y)<TS&&SW.st[i]!==1&&SW.st[i]!==7){stk.add(id);if(pv.has(id))stk2.add(id)}last.set(id,[x,y])}if(w>wmax)wmax=w}}
  const C=cs(),dc=(x,y)=>{let d=1e9;for(const c of C)d=Math.min(d,Math.hypot(x-c.x,y-c.y)/TS);return Math.round(d)};let left=0,wat=0,ns=0,n2=0;const st={},at=[];
  for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;left++;const x=SW.x[i],y=SW.y[i],tw=ter[((y/TS)|0)*TW+((x/TS)|0)]===1;if(tw)wat++;if(stk.has(SW.id[i]))ns++;if(stk2.has(SW.id[i]))n2++;st[SW.st[i]]=(st[SW.st[i]]|0)+1;
   if(at.length<6&&(tw||stk.has(SW.id[i])))at.push(((x/TS)|0)+','+((y/TS)|0)+':'+dc(x,y)+':'+SW.st[i]+(tw?'w':''))}
  const lu=units.filter(u=>u.t===1&&u.lane>=0&&u.hp>0).map(u=>u.type[0]+((u.x/TS)|0)+','+((u.y/TS)|0)+':'+dc(u.x,u.y)+(ter[((u.y/TS)|0)*TW+((u.x/TS)|0)]===1?'w':''));
  const end=Math.round(time-t0),r={trial,coop:coop?1:0,seed:Math.round(SEED*1000)/1000,a,b,w:W0,z,end,left,wat,stk:ns,stk2:n2,wmax,st,at,lu:lu.slice(0,8),nlu:lu.length};n++;if(end>=880||n2>0||wat>0)bad++;
  console.log(JSON.stringify(r));out.push(r);Math.random=RR;MP.on=false}
 return 'TOTAL '+n+' trials, '+bad+' that hit the time limit or left zombies stuck for 60 s or in water'}
