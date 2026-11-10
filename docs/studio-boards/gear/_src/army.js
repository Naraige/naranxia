async()=>{window.__GEAR2='MODE_';//@PRELUDE
 /* a loaded scene: the whole roster in ranks in front of the castle, a horde facing it; then draw calls, triangles and frame time */
 let kg=kingOf(0);if(!kg){kg=mkU(0,'king',(CS.tx+3.5)*TS,(CS.ty+3.5)*TS,null,-1);units.push(kg)}
 settle(3);explore(20);RS2.done.mail=true;RS2.done.plate=true;
 const X0=cast.x,Y0=cast.y+TS*7,HX=X0-TS*6,ZX=X0+TS*6.6,row=(t,n,r,dx)=>{for(let i=0;i<n;i++){const u=mkU(0,t,HX+(i-(n-1)/2)*TS*(dx||1.3),Y0+r*TS*1.45);u.xp=(i%4)*4;units.push(u)}};
 kg.x=HX;kg.y=Y0-TS*1.5;row('guard',6,0,1.9);
 row('captain',3,1,3);row('bannerman',2,1,9);row('knight',9,2);row('knight',9,3);row('archer',9,4);row('archer',9,5);row('cannon',3,6,3.4);
 row('peasant',9,7);{let i=0;for(const u of units)if(u.type==='peasant'){const k=i++%9;if(k<4)u.job='wsfr'[k];else if(k<7){u.carry=1;u.cj='wgs'[k-4]}}}row('scout',2,8,1.6);row('engineer',2,8,5);row('envoy',2,8,8.4);
 /* army and horde are placed after the last simulation tick (the land was uncovered by explore), so everybody stands still for the picture */
 const Z=['zombie','zombie','husk','runner','zombie','brute','bomber','acid','miner','zombie'];
 for(let i=0;i<63;i++){const u=mkU(1,Z[i%Z.length],ZX+((i%9)-4)*TS*1.4,Y0+(((i/9)|0)*1.5+.5)*TS);u.face=Math.PI;units.push(u)}
 const bz=mkU(1,'brute',ZX,Y0-TS*1.6);bz.boss=1;bz.bn=0;bz.sv=1.6;units.push(bz);
 look(X0/TS+OX_,Y0/TS+OY_,ZOOM_,PITCH_,YAW_);window.requestAnimationFrame=()=>0;render3D(.05);render3D(.05);
 const ts=[];for(let i=0;i<FRAMES_;i++){const t=performance.now();render3D(.016);renderer.getContext().finish();ts.push(performance.now()-t)}ts.sort((a,b)=>a-b);
 renderer.info.autoReset=false;renderer.info.reset();render3D(.016);const inf={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};renderer.info.autoReset=true;Math.random=RR;return JSON.stringify({mode:'MODE_',units:units.length,calls:inf.calls,tris:inf.triangles,msMedian:+ts[ts.length>>1].toFixed(1),msMin:+ts[0].toFixed(1)})}
