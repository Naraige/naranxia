async()=>{let s=43;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 const bs=BASES.filter(b=>b.alive);if(!bs.length){Math.random=RR;return JSON.stringify({ok:false,why:'no base',n:BASES.length})}
 const b=bs[0],R=RESP[0],g0=R.g,f0=R.f,u=mkU(0,'envoy',b.x+TS,b.y);units.push(u);
 for(let i=0;i<10;i++)update(.05);
 const gain=R.g-g0,dead=u.hp<=0,cd=b.envT>0;
 const u2=mkU(0,'envoy',b.x+TS,b.y);units.push(u2);for(let i=0;i<10;i++)update(.05);
 const second=u2.hp>0;
 Math.random=RR;return JSON.stringify({ok:!!(gain>0&&dead&&cd&&second&&T.envoy&&C.envoy),gain,dead,cd,second})}
