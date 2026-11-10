async()=>{/* same town at night: the night level is forced (visual check only), the frame loop is stopped */
 window.requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,200));
 hordeOn=true;nightLv=1;const o=renderer.render;renderer.render=function(){};for(let i=0;i<14;i++)render3D(.5);renderer.render=o;render3D(.016);render3D(.016);
 return 'night'}
