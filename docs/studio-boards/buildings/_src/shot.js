async()=>{window.requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,300));
 const N=+(window.__N||560),SPEC=window.__SPEC,sc=new THREE.Scene();
 const hl=new THREE.HemisphereLight(0xffffff,0x54606a,.62*1.06),dl=new THREE.DirectionalLight(0xe6f0ff,.78*1.19);sc.add(hl);sc.add(dl);sc.add(dl.target);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=true;dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);
 {const q=dl.shadow.camera;q.left=-9;q.right=9;q.top=9;q.bottom=-9;q.near=1;q.far=160;q.updateProjectionMatrix();dl.shadow.bias=-.0004;dl.shadow.normalBias=.03}
 const gm=new THREE.MeshLambertMaterial({color:0x5f8a3c}),gp=new THREE.Mesh(new THREE.PlaneGeometry(60,60),gm);gp.rotation.x=-Math.PI/2;gp.position.y=-.002;gp.receiveShadow=true;sc.add(gp);
 const cam=new THREE.PerspectiveCamera(24,1,.05,500),rt=new THREE.WebGLRenderTarget(N,N),buf=new Uint8Array(N*N*4);
 const NG=matV.userData&&matV.userData.NGU;
 const setNight=n=>{hl.intensity=(.3+.32*(1-n))*1.06;dl.intensity=(.12+.66*(1-n))*1.19;gm.color.set(n?0x2c4630:0x5f8a3c);if(NG)NG.value=n;renderer.setClearColor(n?0x141c3c:0xb9d2ee,1)};
 const mk=(q)=>{const[,type,tier,sz,ex]=q,g=new THREE.Group();
  if(type==='wallrun'){[[-1,2],[0,10],[1,8]].forEach(([x,m])=>{const s={type:'wall',t:0,tier,sz:1,tiles:[],tx:0,ty:0,pl:0,rot:0};const me=new THREE.Mesh(sGeo(s,m),matV);me.position.x=x;g.add(me)});return g}
  const s=Object.assign({type,t:0,tier,sz,tiles:[],tx:0,ty:0,x:0,y:0,pl:0,hm:0,rot:0,o3:new THREE.Group()},ex||{});
  buildStructMesh(s);s.o3.position.set(0,0,0);s.o3.rotation.y=0;g.add(s.o3);return g};
 const tris=g=>{let n=0;g.traverse(o=>{if(o.isMesh&&o.geometry){const ge=o.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3}});return n|0};
 const shot=(g,yaw,pitch)=>{g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=sp.radius,d=r/Math.sin(cam.fov*Math.PI/360)*1.02;
  cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);dl.position.set(c.x-24,c.y+44,c.z+18);dl.target.position.copy(c);dl.target.updateMatrixWorld();cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
  const f0=FOWU.fowP.value.w,f1=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.readRenderTargetPixels(rt,0,0,N,N,buf);renderer.setRenderTarget(null);FOWU.fowP.value.w=f0;FOWU.fowP.value.z=f1;
  const c2=document.createElement('canvas');c2.width=c2.height=N;const x2=c2.getContext('2d'),im=x2.createImageData(N,N);for(let y=0;y<N;y++){const sy=N-1-y;im.data.set(buf.subarray(sy*N*4,(sy+1)*N*4),y*N*4)}x2.putImageData(im,0,0);return c2.toDataURL('image/jpeg',.9)};
 const out={},T={},E=[];
 for(const q of SPEC){try{const g=mk(q);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});sc.add(g);T[q[0]]=tris(g);setNight(0);out[q[0]]=shot(g,.55,.62);if(q[5]){setNight(1);out[q[0]+'_n']=shot(g,.55,.62)}sc.remove(g)}catch(e){E.push(q[0]+': '+e.message)}}
 setNight(0);out.__T=JSON.stringify(T);out.__E=JSON.stringify(E);return JSON.stringify(out)}
