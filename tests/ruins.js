async()=>{let s=41;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 for(let dx=-120;dx<=120;dx+=24)for(let dy=-120;dy<=120;dy+=24)ensureAround(Math.max(1,Math.min(TW-2,CX+dx)),Math.max(1,Math.min(TW-2,CY+dy)),1);
 const n=RUINS.size,r=[...RUINS.values()][0];const O={n};if(!r){Math.random=RR;return JSON.stringify({ok:false,n})}
 const g0=RESP[0].g+RESP[0].w+RESP[0].s+RESP[0].f;
 const u=mkU(0,'knight',r.x+TS,r.y);units.push(u);for(let i=0;i<20;i++)update(.05);
 const g1=RESP[0].g+RESP[0].w+RESP[0].s+RESP[0].f;
 const sv=await svPack(),back=JSON.parse(sv).R.RUINS!==undefined;
 render3D(.05);Math.random=RR;
 return JSON.stringify({ok:n>0&&r.done&&g1>g0&&back,n,done:r.done,gain:g1-g0,back,msg:hudDisplayState&&hudDisplayState.msgS})}
