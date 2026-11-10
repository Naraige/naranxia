async()=>{window.requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,300));
 /* CFG: {N, modes:['A','B'], units:[[name,type,variant,hint]], views:[[key,yaw,pitch,bg,pose]]}  pose: i idle, w walk, a attack */
 const CFG=window.__CFG,N=CFG.N||480,SS=2,M=N*SS,sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff0dc,0x403830,.8));const dl=new THREE.DirectionalLight(0xfff2e0,1.0);dl.position.set(-4,7,6);sc.add(dl);const dl2=new THREE.DirectionalLight(0x9fb8ff,.35);dl2.position.set(5,3,-4);sc.add(dl2);
 const cam=new THREE.PerspectiveCamera(24,1,.05,500),rt=new THREE.WebGLRenderTarget(M,M),buf=new Uint8Array(M*M*4);
 const shot=(g,yaw,pitch,R,bg)=>{sc.add(g);g.updateMatrixWorld(true);const c=new THREE.Vector3(0,R*.8,0),d=R/Math.sin(cam.fov*Math.PI/360)*1.0;
  cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
  const f0=FOWU.fowP.value.w,f1=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(bg,1);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.readRenderTargetPixels(rt,0,0,M,M,buf);renderer.setRenderTarget(null);FOWU.fowP.value.w=f0;FOWU.fowP.value.z=f1;sc.remove(g);
  const c2=document.createElement('canvas');c2.width=c2.height=M;const x2=c2.getContext('2d'),im=x2.createImageData(M,M);for(let y=0;y<M;y++){const sy=M-1-y;im.data.set(buf.subarray(sy*M*4,(sy+1)*M*4),y*M*4)}x2.putImageData(im,0,0);
  const cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(c2,0,0,N,N);return cv.toDataURL('image/png')};
 const out={},tri={};
 const mk=(type,v,hint,pose)=>{const u=mkU(1,type,0,0);if(hint==='boss'){u.boss=1;u.bn=v|0;u.sv=1.6;v=null}else u.sv=1;if(v!=null){const n=ZNV[type];for(let k=1;k<5000;k++)if(((k*2654435761)>>>0)%n===+v){u.uid=k;break}}
  u.face=0;u.fa=0;u.hp=1;u.ttl=1;u.ph0=0;if(pose==='w'){u.walk=1;u.ap=1.2}
  for(let i=0;i<24;i++){if(pose==='w')u.ap=1.2;if(pose==='a')u.atk=.35*.62;animUnit(u,.05,false,0)}
  const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);const rm=[];let t=0,dc=0;g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')rm.push(o);else if(o.isMesh&&o.visible&&o.geometry&&o.geometry.index){t+=o.geometry.index.count/3;dc++}});rm.forEach(o=>o.parent&&o.parent.remove(o));const w=new THREE.Group();w.add(g);
  const md=g.userData.mdl,R=md.h*g.userData.sc*(CFG.rk||.78);const i=units.indexOf(u);if(i>=0)units.splice(i,1);return{g:w,t,dc,R}};
 for(const mode of CFG.modes){window.__MUT2=mode==='B'?'all':'';
  for(const e of CFG.units){const[name,type,v,hint]=e;
   for(const[key,yaw,pitch,bg,pose]of CFG.views){let m;try{m=mk(type,v,hint,pose)}catch(er){out['ERR_'+name+mode]=String(er.stack).slice(0,400);break}
    tri[name+'_'+mode]=[m.t,m.dc];out[name+'_'+mode+'_'+key]=shot(m.g,yaw,pitch,m.R,bg)}}}
 out.tri=JSON.stringify(tri);return JSON.stringify(out)}
