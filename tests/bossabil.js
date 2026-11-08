async()=>{let s=47;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
 const O={};const x=(CX+14.5)*TS,y=(CY+14.5)*TS;
 const mk=(bn)=>{const b=mkU(1,'brute',x,y,null,0);b.boss=1;b.bn=bn;b.sv=1.6;b.hp=3000;b.bmax=6000;units.push(b);return b};
 const zc=()=>units.filter(u=>u.t===1&&u.hp>0).length;
 {const b=mk(0);b.hp=3000;for(let i=0;i<400;i++)update(.05);O.heal=b.hp>3000;b.hp=0;}
 {const z0=zc();const b=mk(1);for(let i=0;i<400;i++)update(.05);O.bell=zc()>=z0+4;b.hp=0;}
 {const z0=zc();const b=mk(3);for(let i=0;i<400;i++)update(.05);O.hive=zc()>=z0+3;b.hp=0;}
 {const b=mk(2);const k=mkU(0,'knight',x+TS*2,y);units.push(k);const h0=k.hp;for(let i=0;i<400;i++)update(.05);O.frost=k.hp<h0;b.hp=0}
 Math.random=RR;return JSON.stringify({ok:O.heal&&O.bell&&O.hive&&O.frost,O})}
