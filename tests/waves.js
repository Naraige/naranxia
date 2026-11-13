async()=>{/* waves end (#27): fixed worlds where v93 left the horde standing, played with a perfect defence (castles cannot fall, zombies die within KR tiles of a castle).
   World 1 (two castles): the lane to the second castle runs into a rock massif 50 tiles out; v93 piled the whole horde on one way point and hit the 900 s limit.
   World 9 (two castles): a lake lies between the spawn and the castles; hundreds of zombies wade through it.
   World 0 (solo): plain land with a one-tile ramp, as a reference.
   Then on the last world: zombies put on a water tile near the castle walk out; a zombie held on one spot is taken away without a kill; a swarm saved before v94 (no sa / sk) steps.
   Same worlds and seeds as tests/waves_probe.js (trial = world). */
 renderer.render=function(){};const KR=8,O={},C=[],chk=(n,v)=>{O[n]=v;C.push(!!v)};
 MP.dc={readyState:'open',send:()=>{}};const RR=Math.random;
 const castles=()=>structs.filter(s=>s.type==='castle'),isW=(x,y)=>ter[((y/TS)|0)*TW+((x/TS)|0)]===1;
 const tick=()=>{update(.05);const Cs=castles();for(const c of Cs)c.hp=c.max;over=false;
  for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;for(const c of Cs)if(Math.abs(SW.x[i]-c.x)<KR*TS&&Math.abs(SW.y[i]-c.y)<KR*TS){SW.hp[i]=0;break}}
  for(const u of units)if(u.t===1&&u.hp>0)for(const c of Cs)if(Math.abs(u.x-c.x)<KR*TS&&Math.abs(u.y-c.y)<KR*TS){u.hp=0;break}};
 const world=trial=>{const coop=trial%2===1;let sd=(trial*7919+4242)%2147483646+1;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};for(let i=0;i<20;i++)rn();Math.random=rn;
  rollWorld();if(pvKey!==SEED)buildPreview();let a=null,b=null;
  for(let t=0;t<20000&&!(a&&(b||!coop));t++){randomSite();if(!pickPos||!pickPos.ok)continue;const s={tx:pickPos.tx,ty:pickPos.ty};if(!a)a=s;else{const d=Math.hypot(a.tx-s.tx,a.ty-s.ty);if(d>=24&&d<=60)b=s}}
  if(coop){MP.host=true;MP.conn=true;MP.mine=a;MP.theirs=b;mpStart()}else{MP.on=false;MP.conn=false;pickPos={tx:a.tx,ty:a.ty,ok:true};confirmPick()}
  waveT=1e9;for(let i=0;i<40;i++)update(.05)};
 const playWave=w=>{waveN=w-1;waveST=time;wave();waveOn=hordeOn=true;hordeT=time;waveT=0;const t0=time,z=SW.n+SW.q.reduce((n,q)=>n+q.left,0);const last=new Map();let stk=new Set(),stk2=new Set(),wmax=0;
  for(let k=0;k<18400&&waveOn;k++){tick();
   if(k%600===599){const pv=stk;stk=new Set();stk2=new Set();let wn=0;for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;const id=SW.id[i],x=SW.x[i],y=SW.y[i],p=last.get(id);if(isW(x,y))wn++;
     if(p&&Math.abs(p[0]-x)<TS&&Math.abs(p[1]-y)<TS&&SW.st[i]!==1&&SW.st[i]!==7){stk.add(id);if(pv.has(id))stk2.add(id)}last.set(id,[x,y])}if(wn>wmax)wmax=wn}}
  let left=0,wat=0,s2=0;for(let i=0;i<SW.n;i++){if(SW.hp[i]<=0)continue;left++;if(isW(SW.x[i],SW.y[i]))wat++;if(stk2.has(SW.id[i]))s2++}
  return{z,end:Math.round(time-t0),left,wat,stk2:s2,wmax}};
 for(const trial of[0,1,9]){world(trial);const r=playWave(1);O['w'+trial]=r;chk('ends'+trial,r.end<600&&r.z>500);chk('noneStuck'+trial,r.stk2===0);chk('noneInWater'+trial,r.wat===0);if(trial!==9)MP.on=false}
 chk('lakeCrossed',O.w9.wmax>50);
 /* zombies standing on a water tile near a castle (as v93 left them) walk out */
 {for(let k=0;k<700;k++)tick();/* past the dawn that burns the stragglers */let c=CS,wt=null,bd=1e9;
  for(const cc of[CS,CS2])for(let j=-45;j<=45;j++)for(let i=-45;i<=45;i++){const x=cc.tx+i,y=cc.ty+j,d=Math.hypot(i,j);if(d<12||d>45||d>=bd||!gOK(x,y)||ter[y*TW+x]!==1)continue;let dp=true;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(ter[(y+dy)*TW+x+dx]!==1)dp=false;if(dp){bd=d;wt=[x,y];c=cc}}
  O.waterAt=wt?wt.join(',')+' '+Math.round(bd):null;chk('waterNear',!!wt);
  if(wt){const f=freeTile(c.tx+10,c.ty+10),n0=SW.n;SW.q.push({ln:0,x:f[0]+.5,y:f[1]+.5,ph:65535,left:30,rate:600,hp:5});update(.05);const D=swDbg.SWD,ids=new Set();
   for(let i=n0;i<SW.n;i++){D[SW.ti[i]]--;SW.x[i]=SW.px[i]=(wt[0]+.5)*TS;SW.y[i]=SW.py[i]=(wt[1]+.5)*TS;SW.ti[i]=wt[1]*TW+wt[0];SW.sa[i]=SW.ti[i];D[SW.ti[i]]++;ids.add(SW.id[i])}
   O.put=ids.size;let inW=0,t=0;for(;t<2400;t++){tick();inW=0;let al=0;for(let i=0;i<SW.n;i++)if(ids.has(SW.id[i])&&SW.hp[i]>0){al++;if(isW(SW.x[i],SW.y[i]))inW++}if(!al)break}
   O.outSec=Math.round(t*.05);O.stillInWater=inW;chk('wadesOut',ids.size>=20&&inW===0&&t<2400)}}
 /* last resort: a zombie that still stands 80 s after giving up its path is taken away, without a kill */
 {const c=CS,f=freeTile(c.tx-30,c.ty-30);SW.q.push({ln:0,x:f[0]+.5,y:f[1]+.5,ph:65535,left:1,rate:600,hp:5});const n0=SW.n;update(.05);const id=SW.id[n0],x=SW.x[n0],y=SW.y[n0],k0=kills;
  const at=()=>{for(let i=0;i<SW.n;i++)if(SW.id[i]===id)return i;return -1};let gone=-1,gave=-1;
  for(let t=0;t<2600&&gone<0;t++){const i=at();if(i<0){gone=t;break}if(gave<0&&SW.sk[i]>=10)gave=t;if(SW.st[i]===1||SW.st[i]===7)SW.st[i]=0;SW.x[i]=x;SW.y[i]=y;update(.05);const j=at();if(j>=0){swDbg.SWD[SW.ti[j]]--;SW.x[j]=x;SW.y[j]=y;SW.ti[j]=((y/TS)|0)*TW+((x/TS)|0);swDbg.SWD[SW.ti[j]]++}}
  O.gaveUpSec=Math.round(gave*.05);O.goneSec=Math.round(gone*.05);chk('givesUp',gave>500&&gave<720);chk('takenAway',gone>2000&&gone<2400&&kills===k0)}
 /* a swarm saved before v94 has no sa / sk */
 {const c=CS,f=freeTile(c.tx+14,c.ty+14);SW.q.push({ln:0,x:f[0]+.5,y:f[1]+.5,ph:65535,left:5,rate:600,hp:5});update(.05);delete SW.sa;delete SW.sk;let ok=true;try{for(let k=0;k<80;k++)update(.05)}catch(e){ok=false;O.err=String(e)}
  chk('oldSwarm',ok&&SW.sa instanceof Int32Array&&SW.sk instanceof Uint8Array)}
 Math.random=RR;MP.on=false;O.ok=C.every(v=>v);return JSON.stringify(O)}
