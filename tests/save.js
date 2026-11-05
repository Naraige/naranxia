async()=>{const T0=performance.now();let s=31;const RR=Math.random;const seedR=k=>{s=k;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}};seedR(31);
 rollWorld();randomSite();CX=pickPos.tx;CY=pickPos.ty;reset();startGame();for(const R of RESP){R.g=99999;R.w=99999;R.s=99999}
 const f=(a,b)=>freeTile(CX+a,CY+b);for(const[t,a,b]of[['tower',6,-3],['farm',-8,5],['forester',-12,2],['guild',-4,10],['academy',8,8],['storage',-8,-8],['barracks',10,-8],['house',0,12],['market',-12,-6],['wall',6,0],['wall',6,1]]){const q=f(a,b);if(q)build(t,q[0],q[1])}
 for(let i=0;i<4;i++)units.push(mkU(0,'knight',(CX+4.5)*TS,(CY+4.5)*TS));
 for(let k=0;k<2400;k++){if(k===200)waveT=0;update(.05)}
 const dg=()=>{let h=0;for(const u of units)h=(h*31+Math.round(u.x)+Math.round(u.y)*7+Math.round(u.hp))|0;let hs=0;for(const q of structs)hs=(hs*31+Math.round(q.hp)+q.tx)|0;let ht=0;for(let i=0;i<HT.length;i+=97)ht=(ht*31+HT[i]+ter[i]*3)|0;return [units.length,structs.length,h,hs,ht,waveN,Math.round(time*100),JSON.stringify(RESP)].join('|')};
 const D1=dg();window.__svw=[];const t1=performance.now();const txt=await svPack();const tPack=performance.now()-t1;
 seedR(77);for(let k=0;k<400;k++)update(.05);const A=dg();
 seedR(5);rollWorld();randomSite();CX=pickPos.tx;CY=pickPos.ty;reset();startGame();for(let k=0;k<50;k++)update(.05);
 const t2=performance.now();await svApply(txt);const tLoad=performance.now()-t2;const D2=dg();
 seedR(77);for(let k=0;k<400;k++)update(.05);const B=dg();
 render3D(.05);Math.random=RR;
 const w={};for(const x of window.__svw)w[x]=(w[x]||0)+1;
 return JSON.stringify({ok:D1===D2&&A===B,len:txt.length,tPack:Math.round(tPack),tLoad:Math.round(tLoad),same0:D1===D2,sameCont:A===B,w})}
