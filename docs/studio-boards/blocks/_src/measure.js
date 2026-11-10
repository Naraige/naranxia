async()=>{/* chunk build time and triangle count of the 49 loaded chunks, switch off then on (3 passes each, best pass kept) */
 const NCXv=Math.ceil(TW/32),ks=[...blkChunks.CHK.keys()],out={};
 const run=()=>{let tT=1e9,tP=1e9,triT=0,triP=0,triW=0;for(let pass=0;pass<3;pass++){let a=0,b=0;triT=triP=triW=0;
   for(const k of ks){const cx=k%NCXv,cy=(k/NCXv)|0;let t0=performance.now();const o=blkChunks.buildChunk(cx,cy);a+=performance.now()-t0;t0=performance.now();const p=blkChunks.buildProps(cx,cy);b+=performance.now()-t0;
    triT+=o.m.geometry.index.count/3;if(o.w)triW+=o.w.geometry.index.count/3;if(p)triP+=p.geometry.index.count/3;
    for(const q of[o.m,o.w,p])if(q){scene.remove(q);q.geometry.dispose()}}
   tT=Math.min(tT,a);tP=Math.min(tP,b)}
  return{chunks:ks.length,terrain_ms:+(tT/ks.length).toFixed(2),props_ms:+(tP/ks.length).toFixed(2),terrain_tris:triT,water_tris:triW,props_tris:triP,total_tris:triT+triW+triP}};
 setBlocks(false);out.A=run();setBlocks(true,.5);out.B=run();setBlocks(true,1/3);out.C=run();setBlocks(false);
 return JSON.stringify(out)}
