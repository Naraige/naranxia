async()=>{window.requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,300));
 /* gear board renders: for each mode (A = current, B = window.__GEAR2='all') every unit of CFG.units is built once; its picture
    (3/4 front, at rest) and the pictures of the items it holds (taken from its own meshes) are returned as PNG data URIs */
 const CFG=window.__CFG,N=CFG.N||480,SS=2,M=N*SS,sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff0dc,0x403830,.8));const dl=new THREE.DirectionalLight(0xfff2e0,1.0);dl.position.set(-4,7,6);sc.add(dl);const dl2=new THREE.DirectionalLight(0x9fb8ff,.35);dl2.position.set(5,3,-4);sc.add(dl2);
 const cam=new THREE.PerspectiveCamera(24,1,.05,500),rt=new THREE.WebGLRenderTarget(M,M),buf=new Uint8Array(M*M*4);
 const shot=(g,yaw,pitch,fill,R)=>{sc.add(g);g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),c=R?new THREE.Vector3(0,R*.92,0):bb.getCenter(new THREE.Vector3()),r=R||bb.getBoundingSphere(new THREE.Sphere()).radius,d=r/Math.sin(cam.fov*Math.PI/360)*(fill||1.05);
  cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
  const f0=FOWU.fowP.value.w,f1=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x15131a,1);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.readRenderTargetPixels(rt,0,0,M,M,buf);renderer.setRenderTarget(null);FOWU.fowP.value.w=f0;FOWU.fowP.value.z=f1;sc.remove(g);
  const c2=document.createElement('canvas');c2.width=c2.height=M;const x2=c2.getContext('2d'),im=x2.createImageData(M,M);for(let y=0;y<M;y++){const sy=M-1-y;im.data.set(buf.subarray(sy*M*4,(sy+1)*M*4),y*M*4)}x2.putImageData(im,0,0);
  const cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(c2,0,0,N,N);return cv.toDataURL('image/png')};
 const out={},tri={};
 const mk=(type,hint,al,rk,o)=>{o=o||{};const d0=[RS2.done.mail,RS2.done.plate];RS2.done.mail=al>=1;RS2.done.plate=al>=2;const zt=hint==='rebel'?2:0,u=mkU(zt,type,0,0);if(hint==='rebel')u.ci=1;if(rk)u.xp=rk*4;if(o.job)u.job=o.job;if(o.cj){u.carry=1;u.cj=o.cj}
  u.uid=1;u.face=0;u.fa=0;u.hp=1;u.ttl=1;animUnit(u,.016,false,0);const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);const rm=[];let t=0,dc=0;g.traverse(q=>{if(q.material&&q.material.transparent&&q.material.type==='MeshBasicMaterial')rm.push(q);else if(q.isMesh&&q.visible&&q.geometry&&q.geometry.index){t+=q.geometry.index.count/3;dc++}});rm.forEach(q=>q.parent&&q.parent.remove(q));
  const w=new THREE.Group();w.add(g);const md=g.userData.mdl,R=(type==='cannon'||type==='bannerman')?0:Math.max(.62,md.h*g.userData.sc*.6);const i=units.indexOf(u);if(i>=0)units.splice(i,1);RS2.done.mail=d0[0];RS2.done.plate=d0[1];return{g:w,d:g.userData,t,dc,R}};
 /* an item alone: its geometry on a plain mesh; 'v' stands it upright (tool space z -> up) */
 const item=(geo,mode,yaw,pitch)=>{const g2=mode==='v'?geo.clone().rotateX(-Math.PI/2):geo,g=new THREE.Group();g.add(new THREE.Mesh(g2,matUI));return shot(g,yaw,pitch,1.08)};
 const gt=g=>g&&g.index?g.index.count/3:0;
 for(const mode of CFG.modes){window.__GEAR2=mode==='B'?'all':'';
  for(const e of CFG.units){const[name,type,hint,al,rk,o,items]=e;let m;try{m=mk(type,hint,al,rk,o)}catch(er){out['ERR_'+name+mode]=String(er.stack).slice(0,400);continue}
   tri['u_'+name+'_'+mode]=[m.t,m.dc];
   try{for(const it of items||[]){const[k,src,vm,yaw,pitch]=it,geo=src==='weap'?m.d.weap&&m.d.weap.geometry:src==='shd'?m.d.shd&&m.d.shd.geometry:src==='carry'?m.d.carry.geometry:src==='cn'?m.d.cn.geometry:m.d.tools[src].geometry;
     if(!geo){out['ERR_'+k+mode]='no geometry';continue}tri['i_'+k+'_'+mode]=[gt(geo),1];out['i_'+k+'_'+mode]=item(geo,vm,yaw,pitch)}}catch(er){out['ERR_i_'+name+mode]=String(er.stack).slice(0,400)}
   out['u_'+name+'_'+mode]=shot(m.g,(o&&o.yaw)||((type==='knight'||type==='captain'||type==='guard')?-.6:.6),.14,1.0,m.R)}}
 out.tri=JSON.stringify(tri);return JSON.stringify(out)}
