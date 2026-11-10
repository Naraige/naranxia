async()=>{/* close-ups: the ancient ruin, then the building site */
 window.requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,200));const w=window.__W||'ruin';
 if(w==='ruin'){CAM.x=window.__RU[0]+.5;CAM.z=window.__RU[1]+1.2;CAM.dist=11}else{const q=structs.find(x=>x.prog<1);CAM.x=q.tx+1;CAM.z=q.ty+1.6;CAM.dist=10}
 CAM.pitch=.8;const o=renderer.render;renderer.render=function(){};for(let i=0;i<8;i++)render3D(.3);renderer.render=o;render3D(.016);render3D(.016);return w}
