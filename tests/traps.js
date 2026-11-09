async()=>{/* trap, oil and era timers are decided from the simulation time alone: the result must not depend on what ran before (co-op machines, resync, load) */
 let s=33;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 const O={},C=[];const chk=(n,v)=>{O[n]=v;C.push(!!v)};
 for(const R of RESP){R.g=99999;R.w=99999;R.s=99999;R.f=999}
 const f=freeTile(CS.tx+6,CS.ty+6),tx=f[0],ty=f[1],ti=ty*TW+tx;
 const run=(pre)=>{SPK.clear();for(let i=units.length-1;i>=0;i--)if(units[i].t===1)units.splice(i,1);
  SPK.set(ti,120);const z0=mkU(1,'zombie',(tx+.5)*TS,(ty+.5)*TS,null,-1);units.push(z0);
  for(let i=0;i<pre;i++){z0.x=(tx+.5)*TS;z0.y=(ty+.5)*TS;update(.05)}/* history with a different phase */
  z0.hp=0;units.splice(units.indexOf(z0),1);SPK.clear();SPK.set(ti,120);const z=mkU(1,'zombie',(tx+.5)*TS,(ty+.5)*TS,null,-1);units.push(z);z.hp=z.max=1e6;
  time=1000;for(let i=0;i<40;i++){z.x=(tx+.5)*TS;z.y=(ty+.5)*TS;update(.05)}
  return [Math.round(1e6-z.hp),SPK.get(ti)]};
 const a=run(0),b=run(7),c=run(13);O.spk=[a,b,c];
 chk('spikeFired',a[0]>0);chk('spikePhaseIndependent',a[0]===b[0]&&b[0]===c[0]&&a[1]===b[1]&&b[1]===c[1]);
 /* era regeneration: +1% every 2 s of sim time, same whatever happened before */
 RS2.done.era=true;const q=structs.find(x=>x.t===0&&x.prog>=1&&x.hp>0&&x.max>0);
 const era=(pre)=>{q.hp=q.max*.5;for(let i=0;i<pre;i++)update(.05);q.hp=q.max*.5;time=1000;for(let i=0;i<41;i++)update(.05);return Math.round((q.hp-q.max*.5)/q.max*1000)};
 const e=[era(0),era(9),era(23)];O.era=e;chk('eraPhaseIndependent',e[0]===e[1]&&e[1]===e[2]&&e[0]>=5&&e[0]<=10);
 Math.random=RR;
 O.ok=C.every(Boolean);return JSON.stringify(O)}
