/* ---- fx / particles ---- */
const PMAX=900,partM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({depthWrite:false}),PMAX);partM.frustumCulled=false;partM.renderOrder=6;partM.setColorAt(0,new THREE.Color(1,1,1));partM.count=0;scene.add(partM);
const AMAX=500,fxM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial(),AMAX);fxM.frustumCulled=false;fxM.setColorAt(0,new THREE.Color(1,1,1));fxM.count=0;scene.add(fxM);
const colCache=new Map(),colOf=c=>{let v=colCache.get(c);if(!v){v=new THREE.Color(c);colCache.set(c,v)}return v};
const _o=new THREE.Object3D(),_c1=new THREE.Color();
/* ---- glow sprites: soft additive billboards for lamps, sparks, arrows, fire and blasts (one draw call for all) ---- */
const GLMAX=1600,GLW=(()=>{const c=cvs(64,64),x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.6)');gr.addColorStop(.5,'rgba(255,255,255,.2)');gr.addColorStop(.78,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
 const P=new Float32Array(GLMAX*4),C=new Float32Array(GLMAX*4),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4);ip.setUsage(THREE.DynamicDrawUsage);ic.setUsage(THREE.DynamicDrawUsage);g.setAttribute('gP',ip);g.setAttribute('gC',ic);g.instanceCount=0;
 const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'attribute vec4 gP;attribute vec4 gC;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=gC;vec4 mv=modelViewMatrix*vec4(gP.xyz,1.);mv.xy+=position.xy*gP.w;mv.z+=min(gP.w*.9,1.6);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){float a=texture2D(tex,vU).a*vC.a;if(a<.003)discard;gl_FragColor=vec4(vC.rgb,a);}'});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=8;scene.add(mesh);return{g,P,C,ip,ic,n:0,mesh}})();
const SMKMAX=700,SMK=(()=>{const c=cvs(64,64),x=c.getContext('2d');
 for(let i=0;i<10;i++){const a=i/10*6.2832,r=11+((i*7)%5)*1.6,cx=32+Math.cos(a)*9*(i%2?1:.55),cy=33+Math.sin(a)*8*(i%2?1:.55),gr=x.createRadialGradient(cx-3,cy-4,0,cx,cy,r+7);
  gr.addColorStop(0,'rgba(255,255,255,.62)');gr.addColorStop(.55,'rgba(190,190,190,.42)');gr.addColorStop(1,'rgba(120,120,120,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)}
 const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex([0,1,2,0,2,3]);
 const P=new Float32Array(SMKMAX*4),C=new Float32Array(SMKMAX*4),Rr=new Float32Array(SMKMAX),ip=new THREE.InstancedBufferAttribute(P,4),ic=new THREE.InstancedBufferAttribute(C,4),ir=new THREE.InstancedBufferAttribute(Rr,1);[ip,ic,ir].forEach(a=>a.setUsage(THREE.DynamicDrawUsage));g.setAttribute('sP',ip);g.setAttribute('sC',ic);g.setAttribute('sR',ir);g.instanceCount=0;
 const m=new THREE.ShaderMaterial({uniforms:{tex:{value:new THREE.CanvasTexture(c)}},transparent:true,depthWrite:false,
  vertexShader:'attribute vec4 sP;attribute vec4 sC;attribute float sR;varying vec2 vU;varying vec4 vC;void main(){vU=position.xy*.5+.5;vC=sC;float c=cos(sR),s=sin(sR);vec2 q=vec2(c*position.x-s*position.y,s*position.x+c*position.y);vec4 mv=modelViewMatrix*vec4(sP.xyz,1.);mv.xy+=q*sP.w;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D tex;varying vec2 vU;varying vec4 vC;void main(){vec4 t=texture2D(tex,vU);float a=t.a*vC.a;if(a<.004)discard;gl_FragColor=vec4(vC.rgb*(.62+.55*t.r),a);}'});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=7;scene.add(mesh);return{g,P,C,Rr,ip,ic,ir,n:0,mesh}})();
function smk(x,y,z,s,r,g,b,a,rot){const G=SMK;if(G.n>=SMKMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a;G.Rr[k]=rot||0}
function smkFlush(){const G=SMK;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){for(const a of[G.ip,G.ic,G.ir]){a.updateRange.offset=0;a.updateRange.count=G.n*a.itemSize;a.needsUpdate=true}}G.n=0}
/* night fireflies drifting around the camera */
const FFL=[];function fireflies(dt){if(nightK<.25){FFL.length=0;return}const R=REALR;while(FFL.length<34)FFL.push({x:CAM.x+(R()-.5)*36,z:CAM.z+(R()-.5)*30,ph:R()*6.28,sp:.4+R()*.6});
 for(const f of FFL){f.ph+=dt*f.sp;f.x+=Math.cos(f.ph*.7)*dt*.4;f.z+=Math.sin(f.ph*.53)*dt*.4;if(Math.abs(f.x-CAM.x)>20||Math.abs(f.z-CAM.z)>17){f.x=CAM.x+(R()-.5)*36;f.z=CAM.z+(R()-.5)*30}
  const tx=f.x|0,tz=f.z|0;if(!gOK(tx,tz)||ter[tz*TW+tx]===1)continue;const a=(.5+.5*Math.sin(f.ph*3.1))*nightK;glow(f.x,gh(f.x,f.z)+.6+.35*Math.sin(f.ph*1.3),f.z,.13,.75,1,.35,.85*a)}}
function glow(x,y,z,s,r,g,b,a){const G=GLW;if(G.n>=GLMAX||a<=.004)return;const k=G.n++;G.P[k*4]=x;G.P[k*4+1]=y;G.P[k*4+2]=z;G.P[k*4+3]=s;G.C[k*4]=r;G.C[k*4+1]=g;G.C[k*4+2]=b;G.C[k*4+3]=a}
function glowFlush(){const G=GLW;G.g.instanceCount=G.n;G.mesh.visible=G.n>0;if(G.n){G.ip.updateRange.offset=0;G.ip.updateRange.count=G.n*4;G.ip.needsUpdate=true;G.ic.updateRange.offset=0;G.ic.updateRange.count=G.n*4;G.ic.needsUpdate=true}G.n=0}
/* short-lived light flashes and shock rings (blasts, muzzle flashes); purely visual */
const VFL=[],RINGP=[];const RINGM=new THREE.RingGeometry(.82,1,40);RINGM.rotateX(-Math.PI/2);
function vflash(x,y,h,s,c,T,ring){if(VFL.length<60)VFL.push({x,y,h,s,c,T,t:0,ring})}
let litTm=-9;
function updateLit(){if(nightK<.02||clockT-litTm<.25)return;litTm=clockT;litTex.fill(0);
 const ox=Math.round(CAM.x)-(LITN>>1),oz=Math.round(CAM.z)-(LITN>>1);FOWU.litP.value.x=ox;FOWU.litP.value.y=oz;
 for(const L of lightSources()){const lx=L[0]/TS-ox,ly=L[1]/TS-oz,r=L[2]/TS;if(lx+r<1||lx-r>LITN-2||ly+r<1||ly-r>LITN-2)continue;
  for(let j=Math.max(1,Math.floor(ly-r));j<=Math.min(LITN-2,Math.ceil(ly+r));j++)for(let i=Math.max(1,Math.floor(lx-r));i<=Math.min(LITN-2,Math.ceil(lx+r));i++){const d=hyp(i+.5-lx,j+.5-ly)/r;if(d>=1)continue;const v=d<.62?255:Math.round(255*(1-(d-.62)/.38)),k=j*LITN+i;if(litTex[k]<v)litTex[k]=v}}
 litT.needsUpdate=true}
function drawFlashes(dt){let ri=0;for(let i=VFL.length-1;i>=0;i--){const f=VFL[i];f.t+=dt;const p=f.t/f.T;if(p>=1){VFL.splice(i,1);continue}const a=(1-p)*(1-p);
  glow(f.x/TS,f.h,f.y/TS,f.s*(.55+.9*p),f.c[0],f.c[1],f.c[2],a*.9);glow(f.x/TS,f.h,f.y/TS,f.s*.35,1,1,1,a*.8);
  if(f.ring&&ri<8){let m=RINGP[ri];if(!m){m=new THREE.Mesh(RINGM,new THREE.MeshBasicMaterial({color:0xffd8a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.renderOrder=7;scene.add(m);RINGP[ri]=m}
   const r=.6+f.s*1.5*Math.sqrt(p);m.position.set(f.x/TS,f.h-.45,f.y/TS);m.scale.set(r,1,r);m.material.opacity=.7*(1-p);m.visible=true;ri++}}
 for(let k=ri;k<RINGP.length;k++)RINGP[k].visible=false}
const GLC={'#ffe9a0':[1,.88,.55],'#ff8a2a':[1,.48,.12],'#ffd23c':[1,.78,.2],'#ffb050':[1,.58,.22],'#b8f040':[.55,1,.2],'#f0ff60':[.8,1,.3],'#7dffa0':[.35,1,.55],'#ffe066':[1,.88,.35],'#b04bff':[.7,.3,1],'#e55':[1,.3,.25],'#ffe14a':[1,.86,.3]};
const tw3=(wx,wy)=>{const tx=Math.max(0,Math.min(TW-1,(wx/TS)|0)),ty=Math.max(0,Math.min(TH-1,(wy/TS)|0)),s=occ.get(ty*TW+tx);return s&&s.type==='tower'?s.bh+gtopOf(s)-.15:gh(wx/TS,wy/TS)+.42};
function syncFx(){let n=0;for(const p of pt){const a=Math.max(0,p.t/(p.T||.6));
  if(p.soft){const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),c=colOf(p.c),al=Math.min(1,(1-a)/.14)*a*.78,ss=(p.s||.3)*(1.1+(1-a)*2.2);if(p.r===undefined)p.r=REALR();smk(p.x/TS,py_,p.y/TS,ss,c.r,c.g,c.b,al,p.r*6.28+(1-a)*p.sp*.25);continue}
  if(n>=PMAX)break;const sz=p.s?p.s*(.4+.6*a)*(a>.85?1+(1-a)*2:1):.06+.1*a;
  const py_=gh(p.x/TS,p.y/TS)+(p.z!==undefined?p.z:.25+(1-a)*.7),gc=GLC[p.c];if(gc)glow(p.x/TS,py_,p.y/TS,.14+sz*2.2,gc[0],gc[1],gc[2],.55*a);if(p.r===undefined)p.r=REALR();_o.position.set(p.x/TS,py_,p.y/TS);_o.rotation.set(p.r*6+(1-a)*(p.sp||0),p.r*4+(1-a)*(p.sp||0)*.7,0);_o.scale.set(sz,sz,sz);_o.updateMatrix();partM.setMatrixAt(n,_o.matrix);if(p.r===undefined)p.r=Math.random();_c1.copy(colOf(p.c)).multiplyScalar(.8+.4*p.r);partM.setColorAt(n,_c1);n++}
 partM.count=n;partM.instanceMatrix.needsUpdate=true;if(partM.instanceColor)partM.instanceColor.needsUpdate=true;
 n=0;for(const f of fx){if(n>=AMAX)break;const p=1-f.t/f.T;
  if(f.k==='rock'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.3,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*8;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*5,0);_o.scale.set(.42,.42,.42);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#7f7f7f'))}
  else if(f.k==='acid'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.25,ar=.9+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.18,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*7,p*5,0);_o.scale.set(.15,.15,.15);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#a8e030'));
   glow(x/TS,h,y/TS,.34,.55,1,.2,.6);for(let q=1;q<=3;q++){const pq=Math.max(0,p-q*.06),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,f.h0+(h1-f.h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.22-q*.04,.5,1,.2,.35/q)}}
  else if(f.k==='cball'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h1=gh(f.x2/TS,f.y2/TS)+.2,ar=1+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.32,h=f.h0+(h1-f.h0)*p+Math.sin(p*Math.PI)*ar;_o.position.set(x/TS,h,y/TS);_o.rotation.set(p*9,p*6,0);_o.scale.set(.13,.13,.13);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#2a2a2e'))}
  else if(f.k==='bolt'){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h=f.h0+(.5-f.h0+gh(f.x2/TS,f.y2/TS))*p*.6;_o.position.set(x/TS,h,y/TS);_o.lookAt(f.x2/TS,h,f.y2/TS);_o.scale.set(.12,.12,1.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf('#8a6a42'));glow(x/TS,h,y/TS,.5,1,.9,.6,.55*(1-p))}
  else if(f.a){const x=f.x1+(f.x2-f.x1)*p,y=f.y1+(f.y2-f.y1)*p,h0=f.h0!==undefined?f.h0:tw3(f.x1,f.y1),h1=gh(f.x2/TS,f.y2/TS)+(f.arc?.12:.38),ar=f.arc?1.2+hyp(f.x2-f.x1,f.y2-f.y1)/TS*.12:0,h=h0+(h1-h0)*p+Math.sin(p*Math.PI)*ar;
   _o.position.set(x/TS,h,y/TS);if(f.arc){const q=Math.min(1,p+.04);_o.lookAt((f.x1+(f.x2-f.x1)*q)/TS,h0+(h1-h0)*q+Math.sin(q*Math.PI)*ar,(f.y1+(f.y2-f.y1)*q)/TS)}else _o.lookAt(f.x2/TS,h1,f.y2/TS);if(f.arc)_o.scale.set(.085,.085,.66);else _o.scale.set(.06,.06,.5);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(f.f?'#ff9a3a':f.arc?'#f4ead0':'#d8c8a0'));
   if(f.f){glow(x/TS,h,y/TS,.34,1,.55,.12,.85);glow(x/TS,h+.06,y/TS,.16,1,.9,.4,.7)}else glow(x/TS,h,y/TS,.17,1,.86,.6,.5);for(let q=1;q<=2;q++){const pq=Math.max(0,p-q*.05),xq=f.x1+(f.x2-f.x1)*pq,yq=f.y1+(f.y2-f.y1)*pq;glow(xq/TS,h0+(h1-h0)*pq+Math.sin(pq*Math.PI)*ar,yq/TS,.11-q*.03,1,.8,.5,.22/q)}if(p<.18)glow(f.x1/TS,h0,f.y1/TS,.45,1,.8,.45,(1-p/.18)*.55)}
  else{const r=.18+p*.5;_o.position.set(f.x2/TS,gh(f.x2/TS,f.y2/TS)+.45,f.y2/TS);_o.rotation.set(p*3,p*4,0);_o.scale.set(r,r,r);_o.updateMatrix();fxM.setMatrixAt(n,_o.matrix);fxM.setColorAt(n,colOf(p<.5?'#ffffff':'#ffd060'))}
  n++}
 fxM.count=n;fxM.instanceMatrix.needsUpdate=true;if(fxM.instanceColor)fxM.instanceColor.needsUpdate=true;drawFlashes(1/60)}
/* ---- camera & picking ---- */
function updateCamera(dt){CAM.x=Math.max(2,Math.min(TW-2,CAM.x));CAM.z=Math.max(2,Math.min(TH-2,CAM.z));
 {const gy0=(gh(CAM.x,CAM.z)*2+gh(CAM.x+3,CAM.z)+gh(CAM.x-3,CAM.z)+gh(CAM.x,CAM.z+3)+gh(CAM.x,CAM.z-3))/6;CAM.y+=(gy0-CAM.y)*Math.min(1,dt*3)}const d=CAM.dist,cp=Math.cos(CAM.pitch);
 let px=CAM.x+d*Math.sin(CAM.yaw)*cp,py=CAM.y+d*Math.sin(CAM.pitch),pz=CAM.z+d*Math.cos(CAM.yaw)*cp;const gy=gh(px,pz)+2.5;if(py<gy)py=gy;
 if(shakeT>0&&dt>0&&started&&!paused&&!over){const k=Math.min(1,shakeT)*.3;px+=(Math.random()-.5)*k;py+=(Math.random()-.5)*k;pz+=(Math.random()-.5)*k}camera.position.set(px,py,pz);camera.lookAt(CAM.x,CAM.y,CAM.z);
 scene.fog.near=d*.55+6;scene.fog.far=d*1.9+38;
 if(SHADOWS){const e=Math.round(Math.min(70,Math.max(26,d*.95+14))),sc=sun.shadow.camera;if(sc.right!==e){sc.left=-e;sc.right=e;sc.top=e;sc.bottom=-e;sc.far=e*4+60;sc.updateProjectionMatrix()}}
 {/* shadow map snapped to its texel grid: no shadow crawling when the camera moves */
  const e=SHADOWS?sun.shadow.camera.right:30,tex=2*e/2048,Lz=_LD,Lx=_LR,Ly=_LU;let tx=CAM.x,ty=CAM.y,tz=CAM.z;const a=tx*Lx[0]+ty*Lx[1]+tz*Lx[2],b=tx*Ly[0]+ty*Ly[1]+tz*Ly[2],da=Math.round(a/tex)*tex-a,db=Math.round(b/tex)*tex-b;
  tx+=da*Lx[0]+db*Ly[0];ty+=da*Lx[1]+db*Ly[1];tz+=da*Lx[2]+db*Ly[2];sun.position.set(tx-24,ty+44,tz+18);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld()}}
const _LD=(()=>{const v=[-24,44,18],l=Math.hypot(...v);return v.map(q=>q/l)})(),_LR=(()=>{const d=_LD,u=[0,1,0],r=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]],l=Math.hypot(...r);return r.map(q=>q/l)})(),_LU=(()=>{const d=_LD,r=_LR;return[d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]]})();
const _rc=new THREE.Raycaster(),_v2=new THREE.Vector2(),_v3=new THREE.Vector3();
function pickGround(px,py){_v2.set(px/cv.width*2-1,-(py/cv.height*2-1));_rc.setFromCamera(_v2,camera);const o=_rc.ray.origin,d=_rc.ray.direction;
 if(d.y>=-1e-4)return null;let t=Math.max(0,(o.y-82)/-d.y),prev=t;
 for(;t<520;t+=.35){const x=o.x+d.x*t,z=o.z+d.z*t,y=o.y+d.y*t;
  if(x>=0&&z>=0&&x<TW&&z<TH&&y<=gh(x,z)){let a=prev,b=t;for(let k=0;k<7;k++){const m=(a+b)/2;if(o.y+d.y*m<=gh(o.x+d.x*m,o.z+d.z*m))b=m;else a=m}return{x:o.x+d.x*b,z:o.z+d.z*b}}
  if(y<0)break;prev=t}
 const tt=(o.y-LAND)/-d.y;return{x:Math.max(0,Math.min(TW-.01,o.x+d.x*tt)),z:Math.max(0,Math.min(TH-.01,o.z+d.z*tt))}}
const wpos=()=>{const p=pickGround(mouse.x,mouse.y);return p?{x:p.x*TS,y:p.z*TS}:{x:HOMEC().x,y:HOMEC().y}};
function scr(x,y,z){_v3.set(x,y,z).project(camera);return{x:(_v3.x+1)/2*cv.width,y:(1-_v3.y)/2*cv.height,ok:_v3.z<1}}
function home(){const hc=MP.on&&LPL()===1&&CS2?CS2:HOMEC();CAM.x=hc.x/TS;CAM.z=hc.y/TS;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.92;CAM.dist=window.innerWidth>=900?24:30}
/* ---- ghost (build preview) ---- */
const cubeG2=new THREE.BoxGeometry(1,1,1);
const GBM=new Set(['wall','gate','tower','barracks','farm','storage','house','academy','market','forester','guild','torch','movec']);
function mkGB(solid){const g=new THREE.Group();g.visible=false;scene.add(g);return{g,key:'',solid,mat:solid?matV:new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3})}}
const GB1=mkGB(false),GB2=mkGB(true),GB3=mkGB(true);
/* ---- transparent previews of what will be built: terrain blocks, ramps, paths, siege weapons, stone upgrades ---- */
let TGH=null,GBW=null,GBWK='',GHO=null;const TGEO={};
function tgBlock(G,y0,y1,top,side){const s=shade(side,.9),s2=shade(side,.72);quad(G,[0,y1,0],[0,y1,1],[1,y1,1],[1,y1,0],[0,1,0],top,top,top,top);
 quad(G,[1,y0,0],[1,y1,0],[1,y1,1],[1,y0,1],[1,0,0],s2,s,s,s2);quad(G,[0,y0,1],[0,y1,1],[0,y1,0],[0,y0,0],[-1,0,0],s2,s,s,s2);
 quad(G,[1,y0,1],[1,y1,1],[0,y1,1],[0,y0,1],[0,0,1],s2,s,s,s2);quad(G,[0,y0,0],[0,y1,0],[1,y1,0],[1,y0,0],[0,0,-1],s2,s,s,s2);quad(G,[0,y0,0],[1,y0,0],[1,y0,1],[0,y0,1],[0,-1,0],s2,s2,s2,s2)}
function tgRamp(G,d){const[dx,dy]=D4[d],ax=dx?0:1,sg=(dx+dy)>0,ns=2,st=.5,c=GRASS,rc=DIRT,gc=shade(c,.88),r7=shade(rc,.75);
 for(let k=0;k<ns;k++){const u0=k/ns,u1=(k+1)/ns,yt=(k+1)*st,yb=yt-st,p0=sg?u0:1-u1,p1=sg?u1:1-u0,ck=shade(c,.96+.04*(k&1));
  if(ax===0){quad(G,[p0,yt,0],[p0,yt,1],[p1,yt,1],[p1,yt,0],[0,1,0],ck,ck,ck,ck);const rx=sg?p0:p1;
   if(sg)quad(G,[rx,yb,1],[rx,yt,1],[rx,yt,0],[rx,yb,0],[-1,0,0],r7,gc,gc,r7);else quad(G,[rx,yb,0],[rx,yt,0],[rx,yt,1],[rx,yb,1],[1,0,0],r7,gc,gc,r7);
   quad(G,[p1,0,1],[p1,yt,1],[p0,yt,1],[p0,0,1],[0,0,1],rc,rc,rc,rc);quad(G,[p0,0,0],[p0,yt,0],[p1,yt,0],[p1,0,0],[0,0,-1],rc,rc,rc,rc)}
  else{quad(G,[0,yt,p0],[0,yt,p1],[1,yt,p1],[1,yt,p0],[0,1,0],ck,ck,ck,ck);const rz=sg?p0:p1;
   if(sg)quad(G,[0,yb,rz],[0,yt,rz],[1,yt,rz],[1,yb,rz],[0,0,-1],r7,gc,gc,r7);else quad(G,[1,yb,rz],[1,yt,rz],[0,yt,rz],[0,yb,rz],[0,0,1],r7,gc,gc,r7);
   quad(G,[1,0,p0],[1,yt,p0],[1,yt,p1],[1,0,p1],[1,0,0],rc,rc,rc,rc);quad(G,[0,0,p1],[0,yt,p1],[0,yt,p0],[0,0,p0],[-1,0,0],rc,rc,rc,rc)}}
 const s=shade(rc,.85);if(ax===0){if(sg)quad(G,[1,0,0],[1,1,0],[1,1,1],[1,0,1],[1,0,0],s,s,s,s);else quad(G,[0,0,1],[0,1,1],[0,1,0],[0,0,0],[-1,0,0],s,s,s,s)}
 else{if(sg)quad(G,[1,0,1],[1,1,1],[0,1,1],[0,0,1],[0,0,1],s,s,s,s);else quad(G,[0,0,0],[0,1,0],[1,1,0],[1,0,0],[0,0,-1],s,s,s,s)}}
function tgGeo(k){let q=TGEO[k];if(q)return q;const G=newG();
 if(k==='block')tgBlock(G,0,1,GRASS,DIRT);else if(k==='path1'||k==='path2'){const c=k==='path2'?[.56,.56,.57]:[.6,.49,.3];tgBlock(G,0,.08,c,shade(c,.8))}else tgRamp(G,+k.slice(4));
 return TGEO[k]=toGeo(G)}
function tgShow(k,x,y,z,good,sc,front){if(!TGH){TGH=new THREE.Mesh(tgGeo('block'),new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));TGH.renderOrder=5;scene.add(TGH)}
 TGH.geometry=tgGeo(k);TGH.position.set(x,y,z);TGH.scale.setScalar(sc||1);TGH.material.color.set(front?(good?0xffc27a:0xff6060):good?0xa6ffb4:0xff8686);TGH.material.depthTest=!front;TGH.material.side=front?THREE.BackSide:THREE.FrontSide;TGH.visible=true}
function gbwShow(type,o,aim,good){if(!GBW){GBW=new THREE.Group();GBW.userData.mat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,depthTest:false});scene.add(GBW)}const M=GBW.userData.mat;
 if(GBWK!==type){GBWK=type;while(GBW.children.length)GBW.remove(GBW.children[0]);
  if(type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),M);h.scale.setScalar(.82);h.position.set(0,3.58,0);GBW.add(h);GBW.userData.rot=h}
  else{const wg=new THREE.Group();wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4);wg.add(new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),M));const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),M);a.position.set(1,1.78,1);a.rotation.order='YXZ';wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),M);cw.position.set(0,0,-.86);a.add(cw);GBW.add(wg);GBW.userData.rot=a}}
 GBW.traverse(m=>{if(m.isMesh)m.renderOrder=7});GBW.userData.rot.rotation.y=aim;GBW.position.set(o.tx+.5,o.bh||HT[o.ty*TW+o.tx],o.ty+.5);M.color.set(good?0xa6ffb4:0xff8686);GBW.visible=true}

function ghostMake(G,type,tx,ty,ax,good,alpha){const sz=type==='castle'?5:(type==='tower'||type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'||type==='keep')?2:1,wd=!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower')),tier=GHO?GHO.tier:wd?0:1,gl=GHO?GHO.gl:gateLen,rot=GHO?GHO.rot:type==='castle'?(HOMEC()?HOMEC().rot|0:0):ROTT.has(type)?buildRot&3:0,key=type+'|'+tx+','+ty+'|'+(ax|0)+'|'+tier+'|'+gl+'|'+rot;
 if(G.key!==key){G.key=key;const s={t:0,type,tier,sz,tx,ty,ax:ax||0,gl,rot,tiles:tilesFor(type,tx,ty,sz,ax,gl),hp:1,max:1,prog:1,ci:0,x:(tx+(type==='gate'?(ax?.5:gl/2):sz/2))*TS,y:(ty+(type==='gate'?(ax?gl/2:.5):sz/2))*TS};
  while(G.g.children.length)G.g.remove(G.g.children[0]);s.o3=G.g;G.g.scale.set(1,1,1);BPLOFF=true;try{buildStructMesh0(s)}finally{BPLOFF=false}
  if(!G.solid)G.g.traverse(o=>{if(o.isMesh)o.material=G.mat})}
 if(!G.solid){G.mat.color.set(good?0xa6ffb4:0xff8686);G.mat.opacity=alpha||.62}G.g.visible=true}
const rampPool=[];function rampBox(i,x,y,z,sx,sy,sz,good){let m=rampPool[i];if(!m){m=new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({transparent:true,opacity:.8,depthWrite:false,depthTest:false}));m.renderOrder=6;scene.add(m);rampPool[i]=m}m.material.color.set(good?0x2bff6a:0xff4444);m.scale.set(sx*.96,sy,sz*.96);m.position.set(x,y,z);m.visible=true}
/* Minecraft block-breaking cracks on the resource a peasant is working */
const CRKT=(()=>{const R=rngf(77),pts=[];let x=8,y=8;for(let k=0;k<70;k++){pts.push([x,y]);const d=(R()*4)|0;x=Math.max(0,Math.min(15,x+[1,-1,0,0][d]));y=Math.max(0,Math.min(15,y+[0,0,1,-1][d]));if(R()<.12){x=(R()*16)|0;y=(R()*16)|0}}
 const T=[];for(let s=0;s<10;s++){const c=cvs(16,16),g=c.getContext('2d');const n=Math.round((s+1)/10*pts.length);g.fillStyle='rgba(0,0,0,.6)';for(let k=0;k<n;k++)g.fillRect(pts[k][0],pts[k][1],1,1);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;T.push(t)}return T})(),CRKG=(()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return g})(),CRKP=[];
const SAPM=(()=>{const G=newG();bxc(G,0,0,0,.07,.42,.07,'#6b4a2c');bxc(G,0,.3,0,.3,.22,.3,'#4f9a3c');bxc(G,0,.5,0,.2,.16,.2,'#62b148');bxc(G,.1,.22,.05,.12,.1,.12,'#5aa842');bxc(G,-.09,.36,-.06,.11,.1,.11,'#4a9238');
 const m=new THREE.InstancedMesh(toGeo(G),matV,1024);m.frustumCulled=false;m.count=0;m.castShadow=SHADOWS;scene.add(m);return m})();
function saplRender(){let n=0;if(SAPL.size){const R=(CAM.dist*1.7+26),q=new THREE.Object3D();for(const[i,v]of SAPL){const x=i%TW,y=(i/TW)|0;if(Math.abs(x-CAM.x)>R||Math.abs(y-CAM.z)>R)continue;
  if(!fowSeenAt((x+.5)*TS,(y+.5)*TS))continue;const p=Math.min(1,(time-v.t)/GROWT),s=.45+p*.95;q.position.set(x+.5+(((i*37)%7)-3)*.03,HT[i],y+.5+(((i*53)%7)-3)*.03);q.rotation.set(0,(i%8)*.7,0);q.scale.set(s,s,s);q.updateMatrix();SAPM.setMatrixAt(n++,q.matrix);if(n>=1024)break}}
 SAPM.count=n;if(n)SAPM.instanceMatrix.needsUpdate=true}
function crackAt(i,x,y,z,sx,sy,sz,st){let m=CRKP[i];if(!m){m=new THREE.Mesh(CRKG,new THREE.MeshBasicMaterial({map:CRKT[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.renderOrder=3;scene.add(m);CRKP[i]=m}if(m.material.map!==CRKT[st])m.material.map=CRKT[st];m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.visible=true}
/* green overlay: where the castle may be founded / moved */
const GOVM=new THREE.MeshBasicMaterial({color:0xd8ff5a,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}),GOVE=new THREE.MeshBasicMaterial({color:0xf2ffd8,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}),GOV={m:null,e:null,key:'',t:0};
function govBuild(key,cx,cy,R,ok){GOVM.opacity=.42+.14*Math.sin(clockT*3.2);const vis=()=>{if(GOV.m)GOV.m.visible=true;if(GOV.e)GOV.e.visible=true};if(GOV.key===key){vis();return}if(clockT-GOV.t<.35&&GOV.m&&GOV.key.split('|')[0]===key.split('|')[0]){vis();return}GOV.key=key;GOV.t=clockT;
 for(const q of['m','e'])if(GOV[q]){scene.remove(GOV[q]);GOV[q].geometry.dispose();GOV[q]=null}
 const S=2*R+1,V=new Uint8Array(S*S),at=(x,y)=>{const i=x-(cx-R),j=y-(cy-R);return i<0||j<0||i>=S||j>=S?0:V[j*S+i]};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++)if(gOK(x,y)&&genF[((y/CH)|0)*NCX+((x/CH)|0)]&&ok(x,y))V[(y-cy+R)*S+(x-cx+R)]=1;
 const P=[],I=[],PE=[],IE=[];let n=0,ne=0;const eq=(ax,az,bx,bz,h)=>{PE.push(ax,h,az,ax,h+.22,az,bx,h+.22,bz,bx,h,bz);IE.push(ne,ne+1,ne+2,ne,ne+2,ne+3);ne+=4};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!at(x,y))continue;const h=HT[y*TW+x]+.06;P.push(x,h,y,x,h,y+1,x+1,h,y+1,x+1,h,y);I.push(n,n+1,n+2,n,n+2,n+3);n+=4;
  if(!at(x,y-1))eq(x,y,x+1,y,h);if(!at(x,y+1))eq(x,y+1,x+1,y+1,h);if(!at(x-1,y))eq(x,y,x,y+1,h);if(!at(x+1,y))eq(x+1,y,x+1,y+1,h)}
 if(!n)return;const mk=(P,I,M)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,M);m.renderOrder=2;m.frustumCulled=false;scene.add(m);return m};
 GOV.m=mk(P,I,GOVM);if(ne)GOV.e=mk(PE,IE,GOVE)}
function govHide(){if(GOV.m)GOV.m.visible=false;if(GOV.e)GOV.e.visible=false}
const MCBOX=(()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return new THREE.EdgesGeometry(g)})(),MCSEL=new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.75})),MCHOV=new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.55}));MCSEL.visible=MCHOV.visible=false;scene.add(MCSEL,MCHOV);
const ghost=new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({color:0x66ff66,transparent:true,opacity:.45,depthWrite:false}));ghost.visible=false;scene.add(ghost);const SCAF=new Set(),SGEO={};const selRing=new THREE.Mesh(new THREE.RingGeometry(1,1.14,48),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));selRing.rotation.x=-Math.PI/2;selRing.visible=false;scene.add(selRing);
/* reach of the selected tower or castle: a ring laid on the ground (seen through hills), an inner one for the trebuchet's dead zone */
const SELRG=(()=>{const mk=c=>{const g=new THREE.BufferGeometry(),N=129;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*2*3),3));const ix=[];for(let k=0;k<N-1;k++){const a=k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(ix);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.75,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));m.renderOrder=8;m.visible=false;m.frustumCulled=false;scene.add(m);return m};return{o:mk(0xffd84a),i:mk(0xff7a4a),key:''}})();
function selRangeShow(sb,rg){if(!sb||!rg){SELRG.o.visible=SELRG.i.visible=false;return}const key=sb.sid+'|'+rg.r+'|'+(rg.min||0)+'|'+sb.x+','+sb.y+'|'+(dirtyT.size?SELRG.key:'');
 if(key!==SELRG.key){SELRG.key=key;const put=(M,r)=>{const P=M.geometry.attributes.position,w=Math.max(.22,r*.018);for(let k=0;k<=128;k++){const a=k/128*6.2832,c=Math.cos(a),sn=Math.sin(a);for(let e=0;e<2;e++){const rr=r+(e?w:-w),x=sb.x/TS+c*rr,z=sb.y/TS+sn*rr,tx=Math.max(0,Math.min(TW-1,Math.floor(x))),tz=Math.max(0,Math.min(TH-1,Math.floor(z)));P.setXYZ(k*2+e,x,(HT[tz*TW+tx]||LAND)+.35,z)}}P.needsUpdate=true;M.geometry.computeBoundingSphere()};put(SELRG.o,rg.r);if(rg.min)put(SELRG.i,rg.min)}
 SELRG.o.visible=true;SELRG.i.visible=!!rg.min}
/* outlines for the other buildings of a double-click group */
const MCSELP=[];function groupBoxes(L,sb){let n=0;for(const s of L){if(s===sb)continue;let m=MCSELP[n];if(!m){m=new THREE.LineSegments(MCBOX,MCSEL.material);scene.add(m);MCSELP[n]=m}n++;const H=selH(s),w=s.type==='gate'?(s.ax?1:(s.gl||2)):s.sz,d=s.type==='gate'?(s.ax?(s.gl||2):1):s.sz;m.position.set(s.x/TS,s.bh||LAND,s.y/TS);m.scale.set(w+.04,H,d+.04);m.visible=true}for(let k=n;k<MCSELP.length;k++)MCSELP[k].visible=false}
const rangeRing=(()=>{const pts=[];for(let i=0;i<=64;i++)pts.push(new THREE.Vector3(Math.cos(i/64*6.2832)*7.5,0,Math.sin(i/64*6.2832)*7.5));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.6}))})();rangeRing.visible=false;scene.add(rangeRing);
const RFLAG=[0x59ff8a,0xffc23c].map(col=>{const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0x2a2018,depthTest:false,transparent:true}),c=new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,depthTest:false,transparent:true});const p=new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,.12),m);p.position.y=1.6;const cl=new THREE.Mesh(new THREE.BoxGeometry(1.5,.9,.05),c);cl.position.set(.78,2.7,0);const rg=new THREE.Mesh(new THREE.RingGeometry(.9,1.2,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,depthTest:false}));rg.rotation.x=-Math.PI/2;rg.position.y=.08;const bm=new THREE.Mesh(new THREE.BoxGeometry(.14,9,.14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,depthWrite:false}));bm.position.y=4.5;
 const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,1)]),ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.8,depthTest:false}));ln.frustumCulled=false;scene.add(ln);
 [p,cl,rg].forEach(o=>o.renderOrder=7);g.add(p,cl,rg,bm);g.userData={cl,rg,ln,lg,col};g.visible=false;ln.visible=false;scene.add(g);return g});
const rflagUpd=()=>{const pl=LPL(),ok0=b=>b&&b.t===0&&structs.includes(b)&&b.prog>=1&&(b.pl|0)===pl,hc=HOMEC(),
  selBar=ok0(selB)&&selB.type==='barracks'?selB:null,anyBar=selBar||structs.find(s=>ok0(s)&&s.type==='barracks')||null,
  act=[!!selBar||mode==='rally',castleSel||mode==='rallyc'||(ok0(selB)&&selB.type==='castle')],src=[selBar||anyBar,ok0(selB)&&selB.type==='castle'?selB:hc];
 let hov=null;if((mode==='rally'||mode==='rallyc')&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))){const p=pickGround(mouse.x,mouse.y);if(p)hov={x:p.x*TS,y:p.z*TS}}
 RFLAG.forEach((g,i)=>{const b=src[i],set=b?b.rally:null,ph=hov&&mode===(i?'rallyc':'rally');if(!i&&!act[0]){g.visible=g.userData.ln.visible=false;return}let w=ph?hov:set;
  if(!w&&act[i]&&b)w=b.type==='castle'?dpt(b):{x:b.x,y:b.y+b.rad+24};
  if(!w||!b){g.visible=g.userData.ln.visible=false;return}
  const tx=Math.floor(w.x/TS),ty=Math.floor(w.y/TS),y0=(gOK(tx,ty)?HT[ty*TW+tx]:LAND)+.1;g.visible=true;
  g.position.set(w.x/TS,y0,w.y/TS);g.scale.setScalar(set||ph?1:.7);g.userData.cl.rotation.y=Math.sin(clockT*3)*.25;const q=1+Math.sin(clockT*4)*.12;g.userData.rg.scale.set(q,q,q);
  const L=g.userData.ln;L.visible=act[i]||ph;if(L.visible){const a=g.userData.lg.attributes.position;a.setXYZ(0,b.x/TS,(b.bh||LAND)+.8,b.y/TS);a.setXYZ(1,w.x/TS,y0+.4,w.y/TS);a.needsUpdate=true;g.userData.lg.computeBoundingSphere()}})};
/* ---- voxel clouds ---- */
const CLN=36,cloudM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8890a0,transparent:true,opacity:.92}),CLN*4);cloudM.frustumCulled=false;scene.add(cloudM);
const CLD=[];for(let i=0;i<CLN;i++)CLD.push({x:Math.random()*400,z:Math.random()*400,y:92+Math.random()*14,w:6+Math.random()*10,d:5+Math.random()*7,s:1+Math.random()*.6});
function syncClouds(){const o=new THREE.Object3D();let n=0;for(const c of CLD){const px=((c.x+clockT*1.2*c.s-CAM.x+200)%400+400)%400-200+CAM.x,pz=((c.z-CAM.z+200)%400+400)%400-200+CAM.z;
  for(let k=0;k<4;k++){o.position.set(px+(k-1.5)*c.w*.3,c.y+(k%2)*1.2,pz+((k*7)%3-1)*c.d*.25);o.scale.set(c.w*(.5+.2*(k%3)),2.6,c.d*(.6+.15*(k%2)));o.updateMatrix();cloudM.setMatrixAt(n++,o.matrix)}}
 cloudM.instanceMatrix.needsUpdate=true}
/* ---- swarm rendering: one instanced draw per skin, limbs animated in the vertex shader (no per-zombie objects) ---- */
const SWR={meshes:null,cap:4000},SWU={value:0},SWN8={value:0},SWPX=.023,SWHIP=12*SWPX,SWSH=22*SWPX;

function swMat(){const m=new THREE.MeshLambertMaterial({vertexColors:true});m.onBeforeCompile=function(sh){sh.uniforms.uT=SWU;sh.uniforms.uN=SWN8;sh.uniforms.uLMax=LMU;
 sh.vertexShader='attribute vec4 iPos;attribute vec3 iAnim;attribute float aPart;attribute float aGl;attribute float aSk;uniform float uT;varying vec3 vLP;varying float vGl;\n'+sh.vertexShader
  .replace('#include <color_vertex>','#include <color_vertex>\n{float zh=fract(iAnim.x*5.17),zb=.9+.2*fract(iAnim.x*11.3);vec3 zt=zh<.25?vec3(.9,1.07,.86):zh<.5?vec3(1.07,1.02,.88):zh<.75?vec3(.93,.96,1.07):vec3(1.02,.92,.96);vColor.rgb*=mix(vec3(1.),zt*zb,aSk);}')
  .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{float cy0=cos(iPos.w),sy0=sin(iPos.w);objectNormal=vec3(objectNormal.x*cy0+objectNormal.z*sy0,objectNormal.y,-objectNormal.x*sy0+objectNormal.z*cy0);}')
  .replace('#include <begin_vertex>',`vec3 p=position;vLP=position;vGl=aGl;float ph=iAnim.x+uT*iAnim.z;
 if(aPart>.5&&aPart<2.5){float sd=aPart<1.5?-1.:1.;float a=-1.42+.2*sin(ph*.9+sd*1.3)+(fract(iAnim.x*7.31+sd*.37)-.5)*.42;if(fract(iAnim.x*13.7)<.11&&sd<0.)a=-.26+.06*sin(ph*.8);vec3 q=p-vec3(0.,${SWSH.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWSH.toFixed(4)},0.);p.z+=${((SWSH-SWHIP)*.22).toFixed(4)};p.x+=sin(ph*.5)*${((SWSH-SWHIP)*.08).toFixed(4)};}
 else if(aPart>2.5){float sd=aPart<3.5?-1.:1.;float a=sd*.62*sin(ph);vec3 q=p-vec3(0.,${SWHIP.toFixed(4)},0.);float c=cos(a),s=sin(a);p=vec3(q.x,q.y*c-q.z*s,q.y*s+q.z*c)+vec3(0.,${SWHIP.toFixed(4)},0.);}
 else{p.z+=max(0.,p.y-${SWHIP.toFixed(4)})*.22;p.x+=sin(ph*.5)*max(0.,p.y-${SWHIP.toFixed(4)})*.08;}
 p.y+=abs(sin(ph))*.02;p*=iAnim.y;float cy=cos(iPos.w),sy=sin(iPos.w);vec3 transformed=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy)+iPos.xyz;`);
 sh.fragmentShader='varying vec3 vLP;varying float vGl;uniform float uN;uniform float uLMax;\n'+GLN+sh.fragmentShader
  .replace('#include <color_fragment>','#include <color_fragment>\n{diffuseColor.rgb*=.9+.18*vn3(vLP*26.);}').replace('#include <aomap_fragment>','#include <aomap_fragment>'+GLTOON).replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb+=vGl*vColor*.3;');FOWH.call(this,sh)};return m}
function swInitR(){const mat=swMat();
 SWR.meshes=SWV.map(([kind,v])=>{const src=swGeoV(zSpec(kind,v)),g=new THREE.InstancedBufferGeometry();g.setIndex(src.index);for(const k of['position','normal','color','aPart','aGl','aSk'])g.setAttribute(k,src.attributes[k]);
  const pos=new Float32Array(SWR.cap*4),anim=new Float32Array(SWR.cap*3),ip=new THREE.InstancedBufferAttribute(pos,4),ia=new THREE.InstancedBufferAttribute(anim,3);ip.setUsage(THREE.DynamicDrawUsage);ia.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('iPos',ip);g.setAttribute('iAnim',ia);g.instanceCount=0;const mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);return{mesh,geo:g,pos,anim,ip,ia}})}
/* acid puddles: flat green discs that shrink as they dry, bubbles rising */
const PUDM=(()=>{const gg=new THREE.CircleGeometry(1,20);gg.rotateX(-Math.PI/2);const m=new THREE.MeshBasicMaterial({color:0x8fd030,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const im=new THREE.InstancedMesh(gg,m,48);im.count=0;im.frustumCulled=false;im.renderOrder=2;scene.add(im);return im})();
function pudRender(){let n=0;const o=new THREE.Object3D(),RR=CAM.dist*1.7+26;for(const P of PUD){const X=P.x/TS,Z=P.y/TS;if(Math.abs(X-CAM.x)>RR||Math.abs(Z-CAM.z)>RR||!fowVisAt(P.x,P.y))continue;
  const a=Math.min(1,P.t/1.5)*Math.min(1,(P.T-P.t)/.25),r=P.r/TS*(.35+.65*a),h=gh(X,Z)+.03;o.position.set(X,h,Z);o.rotation.set(0,(P.x*.013)%6.28,0);o.scale.set(r,1,r*.86);o.updateMatrix();PUDM.setMatrixAt(n++,o.matrix);
  glow(X,h+.05,Z,r*.45,.35,.85,.1,.12*a);for(let k=0;k<3;k++){const an=k*2.1+P.x*.01,rr=r*(.25+.2*k),ph=(clockT*1.1+k*.37+P.y*.001)%1;glow(X+Math.cos(an)*rr,h+.03+ph*.14,Z+Math.sin(an)*rr,.05*(1-ph)+.02,.6,1,.25,.6*a*(1-ph))}}
 PUDM.count=n;if(n)PUDM.instanceMatrix.needsUpdate=true}
/* a lit bomber: the fuse sparks and the keg glows */
function mutGlow(u){const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),k=.5+.5*Math.sin(clockT*(u.type==='acid'?2.2:3.1)+((u.uid|0)&15));
 if(u.type==='bomber'){const f=.17*s;glow(X+Math.sin(fa)*f,g0+.46*s,Z+Math.cos(fa)*f,.34*s,1,.5,.12,.16+.12*k)}else{const f=-.13*s;glow(X+Math.sin(fa)*f,g0+.6*s,Z+Math.cos(fa)*f,.3*s,.5,1,.2,.12+.1*k)}}
function fuseFx(u){const s=1.5*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS,fa=u.fa||u.face||0,g0=u.dy!=null?u.dy:gh(X,Z),h=g0+.5*s,bx=X+Math.sin(fa)*.17*s,bz=Z+Math.cos(fa)*.17*s,k=.55+.45*Math.sin(clockT*38);
 glow(bx,h,bz,.2+.12*k,1,.75,.3,.95);glow(bx,h,bz,.55,1,.4,.1,.25*k);if(Math.random()<.5)puff(u.x+Math.sin(fa)*7,u.y+Math.cos(fa)*7,'#ffd060',1,30,{T:.3,z:h-g0+.05,vz:2,g:6,s:.05})}
/* red eyes in the dark: at night a zombie you cannot see (outside the light, or in the fog) shows only its eyes; in the light they go out */
/* the eyes are queued and drawn after every other glow of the frame, so lamps, fires and arrows always keep theirs */
const EYQ=[];const eg=(x,h,z,s,r,g2,b,a)=>EYQ.push(x,h,z,s,r,g2,b,a);function eyeFlush(){for(let k=0;k<EYQ.length;k+=8)glow(EYQ[k],EYQ[k+1],EYQ[k+2],EYQ[k+3],EYQ[k+4],EYQ[k+5],EYQ[k+6],EYQ[k+7]);EYQ.length=0}
function eyePair(X,Z,h,fa,lat,fwd,sz,a){const fx=Math.sin(fa),fz=Math.cos(fa),x=X+fx*fwd,z=Z+fz*fwd;sz*=Math.max(1,CAM.dist/13);if(CAM.dist>22){eg(x,h,z,sz*1.5,1,.13,.05,a);eg(x,h,z,sz*.5,1,.6,.4,a*.7);return}const ex=fz*lat,ez=-fx*lat;eg(x+ex,h,z+ez,sz,1,.13,.05,a);eg(x-ex,h,z-ez,sz,1,.13,.05,a)}
const litV=(X,Z)=>{const i=Math.floor(X)-FOWU.litP.value.x,j=Math.floor(Z)-FOWU.litP.value.y;return i<0||j<0||i>=LITN||j>=LITN?0:litTex[j*LITN+i]};
const darkA=(X,Z)=>Math.min(1,nightK*1.3)*Math.max(0,1-litV(X,Z)/150);
function swEyes(i,X,Z,h,fa,a){const s=(SW.k[i]?1.12:.98)*UNITK;eyePair(X,Z,h+.64*s,fa,.05*s,.1*s,.05+.04*s,a*(.72+.28*Math.sin(clockT*1.7+(SW.sd[i]&255))))}
const EYO0=[.642,.1],EYO={brute:[.577,.12],acid:[.594,.135],bomber:[.596,.09],miner:[.621,.11],runner:[.636,.113]};
const ZSC={zombie:1.35,husk:1.0,runner:1.2,brute:2.15,bomber:1.5,acid:1.3,miner:1.35};let ZEYN=0;
function zEyes(u,a,vis){if(ZEYN>=200||a<.03)return;ZEYN++;const s=(ZSC[u.type]||1.35)*(u.sv||1)*UNITK,X=u.x/TS,Z=u.y/TS;const eo=EYO[u.type]||EYO0;eyePair(X,Z,(vis&&u.dy!=null?u.dy:gh(X,Z))+eo[0]*s,vis&&u.fa!==undefined?u.fa:u.face||0,.051*s,eo[1]*s,.045+.035*s,a*(.72+.28*Math.sin(clockT*1.7+((u.uid|0)&255))))}
function swRender(dt){if(!SWR.meshes)swInitR();const M=SWR.meshes,cnt=SWR.cnt||(SWR.cnt=new Int32Array(M.length));cnt.fill(0);SWU.value=clockT;SWN8.value=nightK;
 if(SW.n){const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS,al=Math.min(1,SW.acc/SWDT),k=Math.min(1,dt*9);let ng=0;
  const FP_=_uFr.planes,Fa=[],Fb=[],Fc=[],Fd=[];for(let q=0;q<6;q++){const p=FP_[q];Fa.push(p.normal.x);Fb.push(p.normal.y);Fc.push(p.normal.z);Fd.push(p.constant+1.6)}
  for(let i=0;i<SW.n;i++){const x1=SW.x[i],y1=SW.y[i];if(x1-cx>R||cx-x1>R||y1-cy>R||cy-y1>R||SW.hp[i]<=0)continue;
   {const X=x1/TS,Y=HT[SW.ti[i]]+.5,Z=y1/TS;let out=false;for(let q=0;q<6;q++)if(Fa[q]*X+Fb[q]*Y+Fc[q]*Z+Fd[q]<0){out=true;break}if(out)continue}
   if(!fowVisAt(x1,y1)){if(nightK>.25&&ng<500){ng++;let ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);swEyes(i,x1/TS,y1/TS,gh(x1/TS,y1/TS),ta,Math.min(1,nightK*1.3))}continue}const kd=SW.k[i],vi=swVar(SW.sd[i]),j=cnt[vi];if(j>=SWR.cap)continue;
   const x=SW.px[i]+(x1-SW.px[i])*al,y=SW.py[i]+(y1-SW.py[i])*al;let fa=SW.fa[i],ta=SW.ta[i];if(ta!==ta)ta=Math.atan2(SW.mx[i],SW.my[i]);fa+=angd(fa,ta)*k;SW.fa[i]=fa;
   const sd=SW.sd[i],D=SWD[SW.ti[i]];let h=gh(x/TS,y/TS);if(D>3)h+=((sd>>4)&15)/15*Math.min(1.5,(D-3)*.045);
   const m=M[vi],P=m.pos,A=m.anim;P[j*4]=x/TS;P[j*4+1]=h;P[j*4+2]=y/TS;P[j*4+3]=fa;if(nightK>.25&&ng<500){const ea=darkA(x/TS,y/TS);if(ea>.03){ng++;swEyes(i,x/TS,y/TS,h,fa,ea)}}A[j*3]=(sd&1023)*.00614;A[j*3+1]=(kd?1.12:.98)*(.92+((sd>>10)&7)*.024)*UNITK;A[j*3+2]=(5.4+((sd>>6)&7)*.3)*1.25; cnt[vi]=j+1}}
 for(let q=0;q<M.length;q++){const m=M[q],c=cnt[q];m.geo.instanceCount=c;m.mesh.visible=c>0;if(c){m.ip.updateRange.offset=0;m.ip.updateRange.count=c*4;m.ip.needsUpdate=true;m.ia.updateRange.offset=0;m.ia.updateRange.count=c*3;m.ia.needsUpdate=true}}}
/* ---- zombie route lines: a glowing ribbon with chevrons flowing toward the castle, drawn only ahead of a living horde ---- */
const routeMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4,
 vertexShader:'attribute vec2 auv;varying vec2 vUv;void main(){vUv=auv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float v=abs(vUv.y-.5)*2.;float edge=1.-smoothstep(.55,1.,v);float core=1.-smoothstep(0.,.3,v);float f=fract(vUv.x*.38-uT*1.15);float ch=1.-smoothstep(0.,.08,abs(f-.5+v*.24)-.06);float fade=smoothstep(0.,6.,vUv.x)*clamp(vUv.y*0.+1.,0.,1.);vec3 c=mix(vec3(.55,.03,.02),vec3(1.,.4,.22),clamp(core*.5+ch*.9,0.,1.));float a=edge*(.32+.5*ch+.18*core)*fade;gl_FragColor=vec4(c,a);}'});
const beamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform float uT;varying vec2 vUv;void main(){float y=vUv.y;float s=.55+.45*sin(y*38.-uT*7.);float a=(1.-y)*(1.-y)*(.55+.35*s);gl_FragColor=vec4(vec3(1.,.18,.1)*a,a);}'});
const BEAMS=[];function beamAt(i,x,y,z){let m=BEAMS[i];if(!m){m=new THREE.Mesh(new THREE.CylinderGeometry(.55,.9,26,12,1,true),beamMat);m.renderOrder=4;scene.add(m);BEAMS[i]=m}m.position.set(x,y+13,z);m.visible=true}
let routeMesh=null,routeT=-9;const LANE_REAR=[];
/* lanes with a living horde, and for each the rear-most point of the horde along its route */
function visLanes(){const s=new Set();for(const u of units)if(u.t===1&&u.lane>=0)s.add(u.lane);if(typeof SWARMS!=='undefined')for(const w of SWARMS)if(w.n>0)s.add(w.lane);return s}
function laneRear(){const L=visLanes(),cnt={};for(const k of L)LANE_REAR[k]=1e9;
 for(const u of units){if(u.t!==1||u.lane<0||!L.has(u.lane))continue;const k=u.lane;cnt[k]=(cnt[k]||0)+1;if(cnt[k]>260&&((u.uid|0)%4))continue;const P=ROUTES[k].pts;let bi=u.rpi|0,bd=1e18;const x=u.x/TS,y=u.y/TS;
  const a0=u.rpi===undefined?0:Math.max(0,u.rpi-14),a1=u.rpi===undefined?P.length:Math.min(P.length,u.rpi+15);for(let i=a0;i<a1;i++){const dx=P[i][0]-x,dy=P[i][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}}u.rpi=bi;if(bi<LANE_REAR[k])LANE_REAR[k]=bi}
 if(typeof SWARMS!=='undefined')for(const w of SWARMS)if(w.n>0)LANE_REAR[w.lane]=Math.min(LANE_REAR[w.lane],Math.max(0,swarmBackIdx(w)));
 for(const k of L)if(LANE_REAR[k]>=1e9)LANE_REAR[k]=0;return L}
function buildRoutes(){routeT=-9}
function updateRoutes(){if(clockT-routeT<.3)return;routeT=clockT;const L=laneRear(),P3=[],UV=[],IX=[];let n=0,bi=0;
 const sy=(x,z)=>{const tx=Math.floor(x),tz=Math.floor(z);if(!gOK(tx,tz))return LAND;const i=tz*TW+tx;return(ter[i]===1?WLV:HT[i])+.15};
 for(const k of L){const R=ROUTES[k],P=R.pts,ld=i=>CHK.has(keyOf((P[i][0]/CH)|0,(P[i][1]/CH)|0)),r0=Math.max(0,(LANE_REAR[k]|0)-2);let ul=0,prev=null;
  for(let i=r0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(!ld(i)||!ld(i+1)){prev=null;ul+=hyp(b[0]-a[0],b[1]-a[1]);continue}const dx=b[0]-a[0],dz=b[1]-a[1],l=hyp(dx,dz)||1,nx=-dz/l*.5,nz=dx/l*.5,st=Math.max(1,Math.round(l/.5));
   for(let q=(prev?1:0);q<=st;q++){const t=q/st,x=a[0]+dx*t,z=a[1]+dz*t,y=sy(x,z),u2=ul+l*t;P3.push(x-nx,y,z-nz,x+nx,y,z+nz);UV.push(u2,0,u2,1);if(prev!==null||q>0){const v=n;IX.push(v-2,v-1,v+1,v-2,v+1,v);}n+=2;prev=1}
   ul+=l}
  if(r0<5&&ld(0)){const s0=P[0];beamAt(bi++,s0[0],sy(s0[0],s0[1]),s0[1])}}
 for(let k=bi;k<BEAMS.length;k++)BEAMS[k].visible=false;
 if(routeMesh){scene.remove(routeMesh);routeMesh.geometry.dispose()}routeMesh=null;
 if(IX.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3));g.setAttribute('auv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(IX);g.computeBoundingSphere();routeMesh=new THREE.Mesh(g,routeMat);routeMesh.frustumCulled=false;routeMesh.renderOrder=2;scene.add(routeMesh)}}
let tfMesh=null,tfT=-9,tfN=-1;
function updateTf(){if(clockT-tfT<.25)return;tfT=clockT;let dn=0;for(const s of structs)if(s.dem)dn++;const tot=tfo.size+dn;if(!tot&&tfN===0)return;tfN=tot;if(tfMesh){scene.remove(tfMesh);tfMesh.geometry.dispose();tfMesh=null}if(!tot)return;const G=newG();
 for(const s of structs)if(s.dem){const bx0=s.x/TS,bz0=s.y/TS,hb=HT[s.tiles[0][1]*TW+s.tiles[0][0]]+((s.bh||0));for(const[x,y]of s.tiles){const h=HT[y*TW+x]+.08;quad(G,[x+.05,h,y+.05],[x+.05,h,y+.95],[x+.95,h,y+.95],[x+.95,h,y+.05],[0,1,0],[1,.2,.15],[1,.2,.15],[1,.2,.15],[1,.2,.15])}bxc(G,bx0,hb+2.6+Math.sin(clockT*4)*.12,bz0,.5,.5,.5,[1,.3,.2])}
 for(const[i,o]of tfo){const x=i%TW,y=(i/TW)|0,h=HT[i]+.06,c=o.t==='raise'?[1,.82,.24]:o.t==='ramp'?[.45,.72,1]:o.t==='unramp'?[1,.25,.2]:[.7,.42,.2];quad(G,[x+.08,h,y+.08],[x+.08,h,y+.92],[x+.92,h,y+.92],[x+.92,h,y+.08],[0,1,0],c,c,c,c);const d=[.2,.14,.06];bxc(G,x+.5,h,y+.5,.2,.5,.2,o.t==='raise'?[1,1,.6]:[.5,.3,.15])}
 tfMesh=new THREE.Mesh(toGeo(G),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));tfMesh.frustumCulled=false;tfMesh.renderOrder=3;scene.add(tfMesh)}
function pulseRoutes(){updateTf();updateRoutes();routeMat.uniforms.uT.value=clockT;beamMat.uniforms.uT.value=clockT}
/* ---- day / night ---- */
const SKYD=new THREE.Color(0x9ccaf0),SKYN=new THREE.Color(0x141c3c),SKYU=new THREE.Color(0xf0a070),_sk=new THREE.Color(),SUND=new THREE.Color(0xfff1d2),SUNU=new THREE.Color(0xff9a60),_sc=new THREE.Color();
let nightK=0,lampT=0,lampN=0;
function nightTarget(){if(!inGame||!started)return 0;return nightSim()}
const LP=[];for(let i=0;i<6;i++){const l=new THREE.PointLight(0xff9a48,0,17,2);l.position.set(0,-50,0);scene.add(l);LP.push(l)}
const LAMPM=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xffc070}),400),HALOM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff9a40,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}),400);
[LAMPM,HALOM].forEach(m=>{m.frustumCulled=false;m.count=0;scene.add(m)});
let LAMPS=[];
function lampList(){LAMPS=[];for(const s of structs){if(s.t!==0||s.prog<1)continue;const b=s.bh||0;
  if(s.type==='tower')LAMPS.push([s.x,s.y,b+(s.sz===2?(s.tier===0?4.2:4.6):(s.tier===0?5.45:4.95)),1]);else if(s.type==='gate'){LAMPS.push([s.x,s.y,b+2.6,1])}
  else if(s.type==='castle'){const[fx,fy]=DIR4[(s.rot|0)&3],st=s.tier!==0;for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const fr=dx*fx+dy*fy>0,K=s.sz===5?1.9:1.04;if(st)LAMPS.push([s.x+dx*TS*K,s.y+dy*TS*K,b+(s.sz===5?(fr?6.2:6.9):(fr?5.85:6.6)),1.1]);else if(fr)LAMPS.push([s.x+dx*TS*K*1.04,s.y+dy*TS*K*1.04,b+(s.sz===5?3.1:2.69),.9])}
   const ox=(1.5-1.18)*TS;LAMPS.push(st?[s.x-fx*ox,s.y-fy*ox,b+8.85,1.6]:[s.x-fx*.55*TS,s.y-fy*.55*TS,b+3.44,1.1])}
  else if(s.type==='wall'&&((s.tiles[0][0]+s.tiles[0][1]*3)%5===0))LAMPS.push([s.x,s.y,b+2.2,.6]);else if(s.type==='torch')LAMPS.push([s.x,s.y,b+1.45,.85]);else if(s.type==='market')LAMPS.push([s.x,s.y,b+1.5,.55])}}
function applyLamps(){const N=nightK;if(N<.02){LAMPM.count=0;HALOM.count=0;LP.forEach(l=>l.intensity=0);return}
 if(clockT-lampT>.5){lampT=clockT;lampList()}
 const cx=CAM.x*TS,cy=CAM.z*TS,R=(CAM.dist*1.8+30)*TS;let n=0;const near=[];
 for(const L of LAMPS){const dd=hyp(L[0]-cx,L[1]-cy);if(dd>R)continue;const fl=1+.12*Math.sin(clockT*9+L[0]*.01+L[1]*.02);
  _o.position.set(L[0]/TS,L[2],L[1]/TS);_o.rotation.set(0,clockT,0);const sc=.11*L[3]*N;_o.scale.set(sc,sc*1.5,sc);_o.updateMatrix();LAMPM.setMatrixAt(n,_o.matrix);
  glow(L[0]/TS,L[2],L[1]/TS,.8*L[3]*fl,1,.66,.3,.7*N);glow(L[0]/TS,L[2]-.2,L[1]/TS,2.2*L[3],1,.5,.2,.09*N*fl);n++;if(n>=400)break;if(L[3]>=1)near.push([dd,L])}
 LAMPM.count=n;HALOM.count=0;LAMPM.instanceMatrix.needsUpdate=true;
 near.sort((a,b)=>a[0]-b[0]);for(let i=0;i<6;i++){const l=LP[i],q=near[i];if(q){l.position.set(q[1][0]/TS,q[1][2]+.4,q[1][1]/TS);l.intensity=(q[1][3]>1?.58:.4)*N*(1+.1*Math.sin(clockT*8+i*2))}else l.intensity=0}}
/* territory borders drawn on the ground */
let terrM=null,terrT=-9;
function updateTerr(){if(clockT-terrT<.9)return;terrT=clockT;if(terrM){scene.remove(terrM);terrM.geometry.dispose();terrM=null}
 if(inGame)rebuildOwn();const P=[],C=[],col=new THREE.Color(),cx=CAM.x,cz=CAM.z,R=150,s3=(x0,y0,z0,x1,y1,z1)=>{P.push(x0,y0,z0,x1,y1,z1);C.push(col.r,col.g,col.b,col.r,col.g,col.b)},
  hA=(i,j)=>gOK(i,j)?gh(i+.5,j+.5):LAND,
  ex=(x,z,n)=>{let ph=null;for(let t=x;t<x+n;t++){const h=Math.max(hA(t,z-1),hA(t,z))+.1;if(ph!==null&&ph!==h)s3(t,ph,z,t,h,z);s3(t,h,z,t+1,h,z);ph=h}},
  ez=(x,z,n)=>{let ph=null;for(let t=z;t<z+n;t++){const h=Math.max(hA(x-1,t),hA(x,t))+.1;if(ph!==null&&ph!==h)s3(x,ph,t,x,h,t);s3(x,h,t,x,h,t+1);ph=h}};
 if(false){col.set(PAL[THEME.c][1]);const i0=Math.max(0,(cx-R)>>1),i1=(cx+R)>>1,j0=Math.max(0,(cz-R)>>1),j1=(cz+R)>>1;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(!OWN.has(j*4096+i))continue;const x=i*2,z=j*2;
   if(!OWN.has(j*4096+i-1))ez(x,z,2);if(!OWN.has(j*4096+i+1))ez(x+2,z,2);if(!OWN.has((j-1)*4096+i))ex(x,z,2);if(!OWN.has((j+1)*4096+i))ex(x,z+2,2)}}
 for(const b of BASES){if(!b.alive||hyp(b.tx-cx,b.ty-cz)>R+60)continue;col.set(PAL[b.ci][1]);const r=aiR(b),x0=b.tx-r,x1=b.tx+r,z0=b.ty-r,z1=b.ty+r;
  for(let t=x0;t<x1;t+=2){ex(t,z0,2);ex(t,z1,2)}for(let t=z0;t<z1;t+=2){ez(x0,t,2);ez(x1,t,2)}}
 if(!P.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 terrM=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:1}));terrM.frustumCulled=false;scene.add(terrM)}
function applyDay(dt){const tg=nightTarget();nightK+=(tg-nightK)*Math.min(1,(dt||.016)*1.4);const N=nightK,sm=1-N,dusk=Math.pow(Math.sin(N*Math.PI),2);
 _sk.copy(SKYN).lerp(SKYD,sm).lerp(SKYU,dusk*.45);scene.background.copy(_sk);scene.fog.color.copy(_sk);hemi.intensity=.3+.32*sm;sun.intensity=.12+.66*sm;LMU.value=hemi.intensity+sun.intensity;sun.color.copy(SUND).lerp(SUNU,dusk*.7);dayK=sm;applyLamps()}
let dayK=1;
let frameN=0;
function render3D(dt){frameN++;updateCamera(dt);updateChunks(7);
 let anyDmg=false;for(const s of structs)if(s.t===0&&(s.hp<s.max||s.prog<1)){anyDmg=true;break}
 {const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS;camera.updateMatrixWorld();_uPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_uFr.setFromProjectionMatrix(_uPV);
  ZEYN=0;for(const u of units){if(u.shel||Math.abs(u.x-cx)>R||Math.abs(u.y-cy)>R)continue;if(u.t!==0&&!fowVisAt(u.x,u.y)){if(u.t===1&&nightK>.25)zEyes(u,Math.min(1,nightK*1.3),0);continue}if(u.dy==null)u.dy=gh(u.x/TS,u.y/TS);_uSp.center.set(u.x/TS,u.dy+.65,u.y/TS);
   if(!_uFr.intersectsSphere(_uSp)){const g0=u.m;if(g0&&g0.userData){g0.userData.frame=frameN;g0.visible=false}continue}animUnit(u,dt,anyDmg,frameN);if(u.m)u.m.visible=true;if(u.fuse>0)fuseFx(u);else if(u.type==='bomber'||u.type==='acid')mutGlow(u);if(u.t===1&&nightK>.25)zEyes(u,darkA(u.x/TS,u.y/TS),1)}}
 animCorpses(dt);swRender(dt);saplRender();pudRender();
 {let ci=0;const WK=WORK*(RS2.done.tools?.75:1);for(const u of units){if(ci>=16)break;if(u.t!==0||u.type!=='peasant'||!(u.work>0)||u.carry||u.tl<0||u.o)continue;const j=u.job;if(j!=='w'&&j!=='s'&&j!=='g')continue;const tx=u.tl%TW,ty=(u.tl/TW)|0;if(Math.abs(tx-CAM.x)>34||Math.abs(ty-CAM.z)>34)continue;if(dist(u.x,u.y,(tx+.5)*TS,(ty+.5)*TS)>46)continue;
  const st=Math.max(0,Math.min(9,Math.floor(u.work/WK*10))),h=HT[u.tl];if(j==='w')crackAt(ci++,tx+.5,h,ty+.5,.34,.92,.34,st);else crackAt(ci++,tx+.5,h,ty+.5,.86,.82,.86,st)}for(let k=ci;k<CRKP.length;k++)CRKP[k].visible=false}
 for(const[u,g]of unitG)if(g.userData.frame!==frameN){scene.remove(g);unitG.delete(u);u.m=null;if(g.userData.mat)g.userData.mat.dispose()}
 {const sb=selB&&structs.includes(selB)?selB:castleSel?HOMEC():null,on=!!sb;MCSEL.visible=on;selRangeShow(sb,sb&&rangeOf(sb));groupBoxes(selBs(),sb);if(on){const selB=sb;const H=selH(selB),w=selB.type==='gate'?(selB.ax?1:(selB.gl||2)):selB.sz,d=selB.type==='gate'?(selB.ax?(selB.gl||2):1):selB.sz;MCSEL.position.set(selB.x/TS,selB.bh||LAND,selB.y/TS);MCSEL.scale.set(w+.04,H,d+.04)}}
 MCHOV.visible=false;if(!mode&&started&&!over&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)){const p=pickGround(mouse.x,mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const o=occ.get(ty*TW+tx);if(!o){const h=HT[ty*TW+tx],tr=ter[ty*TW+tx];MCHOV.visible=true;MCHOV.position.set(tx+.5,tr>=2&&tr<=4?h:h-1,ty+.5);MCHOV.scale.set(1.01,tr>=2&&tr<=4?(tr===2?1.9:.95):1.01,1.01)}}}}
 selRing.visible=false;if(false){selRing.position.set(selB.x/TS,(selB.bh||LAND)+.2,selB.y/TS);const q=selB.sz*.78+Math.sin(clockT*4)*.05;selRing.scale.set(q,q,q)}
 for(const s of SCAF){if(s.prog>=1||!structs.includes(s)){scene.remove(s.scaf);s.scaf=null;SCAF.delete(s)}}
 for(const s of structs){if(s.t===2&&s.o3)s.o3.visible=fowSeenAt(s.x,s.y);if(s.t===0&&s.prog<1&&!s.scaf&&s.o3){const H={wall:2.1,gate:2.8,tower:4.6,castle:6.2,barracks:3.1,farm:.8,storage:2.3,house:3.1,academy:3.4,market:2.3,forester:2.2,guild:3.0,torch:1.5,keep:4.9}[s.type]||2,w=s.type==='gate'?(s.gl||2)*1.05:s.sz,d=s.type==='gate'?.9:s.sz,k=s.type+w+'x'+d+'x'+H,m=new THREE.Mesh(SGEO[k]||(SGEO[k]=scafGeo(w,d,H)),matV);m.position.set(s.x/TS,s.bh||HT[s.ty*TW+s.tx],s.y/TS);if(s.type==='gate'&&s.ax)m.rotation.y=Math.PI/2;scene.add(m);s.scaf=m;SCAF.add(s)}
  if(s.prog>=1&&s.hp<s.max*.3&&s.hp>0&&s.o3&&Math.abs(s.x/TS-CAM.x)<CAM.dist*2+30&&Math.abs(s.y/TS-CAM.z)<CAM.dist*2+30){const fl=.75+.25*Math.sin(clockT*13+s.x)+.15*Math.sin(clockT*29+s.y),hb=(s.bh||LAND)+1.2+(s.sz||1)*.4;glow(s.x/TS,hb,s.y/TS,1.1*(s.sz||1)*fl,1,.42,.1,.5);glow(s.x/TS,hb+.5,s.y/TS,.5*fl,1,.85,.4,.6)}
  if(s.flag)s.flag.rotation.y=Math.sin(clockT*3)*.3;if(s.o3){const p=.2+.8*Math.min(1,s.prog);s.o3.scale.y=p}
  if(s.bolt){const c=s.wcd>0?s.wcd:0,p=c/3.4;s.bolt.visible=p<.5;s.bolt.position.z=-Math.max(0,Math.min(1,(p-.1)/.4))*.55}
  if(s.head){const a=s.aim||0;s.head.rotation.y+=angd(s.head.rotation.y,a)*Math.min(1,dt*8);s.head.position.z=-Math.max(0,s.rec||0)*.18*Math.cos(s.head.rotation.y);s.head.position.x=-Math.max(0,s.rec||0)*.18*Math.sin(s.head.rotation.y)}
  if(s.arm){const a=s.aim||0,c=s.wcd>0?s.wcd:0,rest=.95,fire=-.95;let ang;if(c>5.7)ang=rest+(fire-rest)*sat((6.2-c)/.22);else if(c>.3)ang=fire+(rest-fire)*easeO(sat((5.7-c)/5.2));else ang=rest;
   if(s.tpv){s.tpv.rotation.y+=angd(s.tpv.rotation.y,a)*Math.min(1,dt*2.2);s.arm.rotation.y=0}else s.arm.rotation.y+=angd(s.arm.rotation.y,a)*Math.min(1,dt*3);s.arm.rotation.x=ang;if(s.cw)s.cw.rotation.x=-ang}
  if(s.door){let op=0;for(const u of units)if(u.t===0&&!u.gar&&Math.abs(u.x-s.x)<TS*2.1&&Math.abs(u.y-s.y)<TS*2.1){op=1;break}
   if((op>.5)!==!!s.dopen){s.dopen=op>.5;snd('gate',s.x,s.y)}s.dop+=(op-s.dop)*Math.min(1,dt*(s.door.userData.lv?4:7));if(s.door.userData.lv){const a=s.dop*1.5;s.door.userData.lv[0].rotation.y=a;s.door.userData.lv[1].rotation.y=-a}else s.door.scale.y=Math.max(.08,1-s.dop*.92)}}
 
 WUT.value=clockT;updateLit();syncFx();fireflies(dt);smkFlush();syncClouds();applyDay(dt);updateTerr();pulseRoutes();
 rflagUpd();
 if(mode==='movec'&&!over){const hc=HOMEC();if(hc)govBuild('mv'+ver+':'+structs.length+':'+hc.tx+','+hc.ty+':'+(hc.rot|0)+':'+OWN.size,hc.tx+2,hc.ty+2,41,(x,y)=>moveOK(x,y))}else govHide();
 ghost.visible=rangeRing.visible=false;GB1.g.visible=false;rampPool.forEach(m=>m.visible=false);ghost.material.depthTest=true;if(TGH)TGH.visible=false;if(GBW)GBW.visible=false;
 if(mode&&!over&&mouse.x>=0&&!uiRects.some(r=>inR(mouse,r))){const p=pickGround(mouse.x,mouse.y);if(p){let tx=Math.floor(p.x),ty=Math.floor(p.z);if(mode==='house'||mode==='farm'||CONNT.has(mode)){const sp=snapM(mode,tx,ty);tx=sp[0];ty=sp[1]}
  if(tx>=0&&ty>=0&&tx<TW&&ty<TH&&gOK(tx,ty)){let good=(mode==='path'?pathOK(tx,ty):valid(tx,ty))&&ok(C[mode]);if(mode==='tower')good=tilesFor('tower',tx,ty,2).every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y)))&&ok(C.tower);if(mode==='ballista'||mode==='trebuchet'){const o=occ.get(ty*TW+tx);good=!!o&&o.type==='tower'&&o.t===0&&o.prog>=1&&!o.weapon&&ok(C[mode])}if(mode==='raise'||mode==='dig')good=tfOK(tx,ty,true)&&ok(C[mode])&&!tfo.has(ty*TW+tx);if(mode==='ramp')good=rampOK(tx,ty)&&!tfo.has(ty*TW+tx);if(mode==='stairs')good=good&&!!stairInfo(tx,ty);if(mode==='path')good=good&&pth[ty*TW+tx]<(RS.done?2:1);if(mode==='barracks')good=tilesFor('barracks',tx,ty,2).every(([x,y])=>gOK(x,y)&&valid(x,y))&&ok(C.barracks);
   let hh=mode==='farm'?.9:mode==='storage'?1.1:mode==='house'?1.4:mode==='academy'?2.2:mode==='market'?1.8:mode==='forester'?1.5:mode==='guild'?2.2:mode==='torch'?1.3:mode==='rally'||mode==='rallyc'?.1:mode==='ramp'?.12:mode==='barracks'?1.9:mode==='tower'?3:mode==='path'?.06:mode==='stairs'?.5:mode==='gate'?2.2:mode==='ballista'||mode==='trebuchet'?3.6:mode==='raise'||mode==='dig'?1:1.7,h0=HT[ty*TW+tx];let gx=1.02,gz=1.02,cx2=tx+.5,cz2=ty+.5;if(mode==='gate'){const ax=gateAxAt(tx,ty);good=gateOK(tx,ty,ax,gateLen)&&ok(C.gate);gx=ax?1.02:gateLen+.02;gz=ax?gateLen+.02:1.02;cx2=tx+(ax?.5:gateLen/2);cz2=ty+(ax?gateLen/2:.5)}if(mode==='tower'||mode==='barracks'||mode==='farm'||mode==='storage'||mode==='house'||mode==='academy'||mode==='market'||mode==='forester'||mode==='guild'){gx=gz=2.02;cx2=tx+1;cz2=ty+1}let yy=h0+hh/2,showG=true;
    if(mode==='barracks'||mode==='farm'||mode==='storage'||mode==='house'||mode==='academy'||mode==='market'||mode==='forester'||mode==='guild'){const t2=tilesFor(mode,tx,ty,2),hs2=t2.map(([x,y])=>HT[y*TW+x]);good=t2.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs2)-Math.min(...hs2)<=2&&ok(C[mode])&&!placeErr(mode,tx,ty);yy=Math.max(...hs2)+hh/2}
    if(mode==='raise'){showG=false;tgShow('block',tx,ter[ty*TW+tx]===1?LAND-1:h0,ty,good)}
    if(mode==='dig'){showG=false;tgShow('block',tx-.015,h0-1.015,ty-.015,good,1.03,true)}
    if(mode==='path'){showG=false;tgShow(stoneOn()?'path2':'path1',tx,h0+.004,ty,good)}
    if(mode==='ballista'||mode==='trebuchet'){const o=occ.get(ty*TW+tx);if(o&&o.type==='tower'&&o.t===0){showG=false;gbwShow(mode,o,(buildRot&3)*Math.PI/2,good)}}
    if(mode==='upgrade'){const o=occ.get(ty*TW+tx);if(o&&o.t===0&&UPC[o.type]&&o.tier===0){showG=false;good=o.prog>=1&&ok(UPC[o.type]);GHO={tier:1,rot:o.rot|0,gl:o.gl||2};try{ghostMake(GB1,o.type,o.tx,o.ty,o.ax|0,good,.62)}finally{GHO=null}}else good=false}
    if(mode==='demolish'){const o=occ.get(ty*TW+tx);good=!!o&&o.t===0&&o.type!=='castle';if(!o&&stairs.has(ty*TW+tx)){good=true;showG=false;(stairs.get(ty*TW+tx).blk?[ty*TW+tx]:rampGroup(ty*TW+tx)).forEach((ii,bi)=>rampBox(bi,(ii%TW)+.5,HT[ii]+.14,((ii/TW)|0)+.5,1,.3,1,false))}else if(o){gx=o.sz*1.04;gz=o.sz*1.04;cx2=o.x/TS;cz2=o.y/TS;hh=2.4;yy=h0+hh/2}else showG=false;ghost.material.color.set(good?0xff9a3c:0xff5555)}
    if(mode==='ramp'){showG=false;tgShow('ramp'+(buildRot&3),tx,h0,ty,good)}
    if(mode==='movec')good=moveOK(tx,ty)&&ok(C.movec);ghost.material.color.set(good?0x66ff66:0xff5555);ghost.scale.set(gx,hh,gz);ghost.position.set(cx2,yy,cz2);ghost.visible=showG&&!GBM.has(mode);if(GBM.has(mode)){const a2=mode==='gate'?gateAxAt(tx,ty):0,mc=mode==='movec';ghostMake(GB1,mc?'castle':mode,mc?tx-2:tx,mc?ty-2:ty,a2,good,.62)}
   if(mode==='tower'||mode==='ballista'||mode==='trebuchet'){const rr=mode==='tower'?TOWR+(stoneOn()?1.5:0):mode==='ballista'?18:32;rangeRing.scale.set(rr/7.5,1,rr/7.5);rangeRing.position.set(cx2,h0+.15,cz2);rangeRing.visible=true}}}}
 eyeFlush();glowFlush();scene.updateMatrixWorld();uiFlush();postRender(scene,camera,true)}

/* ================= ARCANE POST-PROCESS =================
   pass 1: the scene into a colour + depth target; pass 2: black ink outlines where the depth bends or jumps (silhouettes AND creases),
   painted sky, painterly grade (cool shadows, warm light, rich colour, soft S-curve, vignette); pass 3: FXAA */
const POST=(()=>{const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const FS=`uniform sampler2D tC,tD;uniform vec2 px,nf,fogR;uniform float lw,uN,uT,uSky,uInk;uniform mat4 uIPV;uniform vec3 uCam,uHor,uZen;varying vec2 vUv;
 float W(vec2 u){float d=texture2D(tD,u).x;return(nf.y-d*(nf.y-nf.x))/(nf.x*nf.y);}
 float hs2(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
 float vn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hs2(i),hs2(i+vec2(1.,0.)),f.x),mix(hs2(i+vec2(0.,1.)),hs2(i+vec2(1.,1.)),f.x),f.y);}
 void main(){vec3 c=texture2D(tC,vUv).rgb;float d0=texture2D(tD,vUv).x;
  if(d0>=.99999){if(uSky>.5){vec4 pw=uIPV*vec4(vUv*2.-1.,1.,1.);vec3 rd=normalize(pw.xyz/pw.w-uCam);float el=clamp(rd.y,0.,1.);
    vec3 sky=mix(uHor,uZen,smoothstep(0.,.55,el));vec2 cp=rd.xz/(rd.y+.18)*1.4+vec2(uT*.012,uT*.004);
    float cl=vn2(cp)*.58+vn2(cp*2.3+3.)*.3+vn2(cp*5.2+7.)*.12;float cm=smoothstep(.5,.66,cl)*smoothstep(.02,.22,el);
    sky=mix(sky,mix(uHor*1.1+vec3(.07,.05,.03),vec3(1.,.92,.84),.45),cm*.7);float ce=(1.-smoothstep(0.,.05,abs(cl-.5)))*smoothstep(.02,.22,el);sky=mix(sky,sky*.55,ce*.5);c=sky;}}
  else if(uInk>.5){vec2 o=px*lw;
   float w0=W(vUv),wl=W(vUv-vec2(o.x,0.)),wr=W(vUv+vec2(o.x,0.)),wd=W(vUv-vec2(0.,o.y)),wu=W(vUv+vec2(0.,o.y)),wa=W(vUv+o),wb=W(vUv-o),wc=W(vUv+vec2(o.x,-o.y)),we=W(vUv+vec2(-o.x,o.y));
   float lap=abs(wl+wr-2.*w0)+abs(wd+wu-2.*w0)+.5*(abs(wa+wb-2.*w0)+abs(wc+we-2.*w0));
   float jmp=max(max(abs(wl-w0),abs(wr-w0)),max(abs(wd-w0),abs(wu-w0)));
   float z=1./w0,e=max(smoothstep(.0035,.011,lap/w0),smoothstep(.02,.06,jmp/w0));
   e*=1.-smoothstep(fogR.x,mix(fogR.x,fogR.y,.7),z);
   c=mix(c,c*vec3(.07,.06,.09),e*.95);}
  float L=dot(c,vec3(.299,.587,.114));c=mix(vec3(L),c,1.08);
  vec3 cool=mix(vec3(.85,.96,1.1),vec3(.8,.78,1.16),uN),warm=mix(vec3(1.06,1.,.9),vec3(1.14,.9,.86),uN);
  c*=mix(cool,warm,smoothstep(.12,.72,L));c=clamp(c,0.,1.);c=mix(c,c*c*(3.-2.*c),.32);
  vec2 q=vUv-.5;c*=1.-dot(q,q)*.5;gl_FragColor=vec4(c,1.);}`;
 const FX=`uniform sampler2D tC;uniform vec2 px;uniform float uVig;varying vec2 vUv;
 void main(){vec3 nw=texture2D(tC,vUv+vec2(-1.,-1.)*px).rgb,ne=texture2D(tC,vUv+vec2(1.,-1.)*px).rgb,sw=texture2D(tC,vUv+vec2(-1.,1.)*px).rgb,se=texture2D(tC,vUv+vec2(1.,1.)*px).rgb,m=texture2D(tC,vUv).rgb;
  vec3 lu=vec3(.299,.587,.114);float a=dot(nw,lu),b=dot(ne,lu),c=dot(sw,lu),d=dot(se,lu),e=dot(m,lu),mn=min(e,min(min(a,b),min(c,d))),mx=max(e,max(max(a,b),max(c,d)));
  vec2 dir=vec2(-((a+b)-(c+d)),((a+c)-(b+d)));float rd=max((a+b+c+d)*.03125,1./128.),rcp=1./(min(abs(dir.x),abs(dir.y))+rd);dir=clamp(dir*rcp,vec2(-8.),vec2(8.))*px;
  vec3 A=.5*(texture2D(tC,vUv+dir*(1./3.-.5)).rgb+texture2D(tC,vUv+dir*(2./3.-.5)).rgb),B=A*.5+.25*(texture2D(tC,vUv-dir*.5).rgb+texture2D(tC,vUv+dir*.5).rgb);
  float l=dot(B,lu);vec3 o=(l<mn||l>mx)?A:B;if(uVig>0.){vec2 rs=1./px,p=(vUv-.5)*rs;float r0=min(rs.x,rs.y)*.45,r1=length(rs)*.62;o=mix(o,vec3(.0314,.0235,.0627),.38*uVig*clamp((length(p)-r0)/(r1-r0),0.,1.));}gl_FragColor=vec4(o,1.);}`;
 const U={tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2(1,1)},nf:{value:new THREE.Vector2(.3,420)},fogR:{value:new THREE.Vector2(50,140)},lw:{value:1},uN:{value:0},uT:{value:0},uSky:{value:1},uInk:{value:1},
  uIPV:{value:new THREE.Matrix4()},uCam:{value:new THREE.Vector3()},uHor:{value:new THREE.Color()},uZen:{value:new THREE.Color()}};
 const geo=new THREE.PlaneGeometry(2,2),mk=(fs,u)=>{const m=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false}));m.frustumCulled=false;const sc=new THREE.Scene();sc.add(m);return sc};
 const U2={tC:{value:null},px:U.px,uVig:{value:0}};
 return{U,U2,sc:mk(FS,U),sc2:mk(FX,U2),cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),rt:null,rt2:null,w:0,h:0,
  ok:renderer.capabilities.isWebGL2||!!renderer.extensions.get('WEBGL_depth_texture')}})();
const _pv=new THREE.Vector2(),_pm=new THREE.Matrix4();
function postRender(scn,cmr,sky){const P=POST;if(!P.ok){renderer.render(scn,cmr);return}
 renderer.getDrawingBufferSize(_pv);const w=_pv.x|0,h=_pv.y|0;
 if(w!==P.w||h!==P.h||!P.rt){P.w=w;P.h=h;if(P.rt){P.rt.depthTexture.dispose();P.rt.dispose();P.rt2.dispose()}
  P.rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false});P.rt.depthTexture=new THREE.DepthTexture(w,h);P.rt.depthTexture.type=renderer.capabilities.isWebGL2?THREE.FloatType:THREE.UnsignedIntType;
  P.rt2=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false});
  P.U.tC.value=P.rt.texture;P.U.tD.value=P.rt.depthTexture;P.U2.tC.value=P.rt2.texture;P.U.px.value.set(1/w,1/h)}
 const U=P.U;U.nf.value.set(cmr.near,cmr.far);U.lw.value=Math.max(1.25,renderer.getPixelRatio()*1.2);U.uN.value=typeof nightK==='number'?nightK:0;U.uT.value=clockT;U.uSky.value=sky?1:0;U.uInk.value=1;
 if(scn.fog){U.fogR.value.set(scn.fog.near,scn.fog.far);U.uHor.value.copy(scn.fog.color)}else U.fogR.value.set(1e4,2e4);
 U.uZen.value.copy(U.uHor.value).multiply(_zenK.setRGB(.5+.12*U.uN.value,.64-.1*U.uN.value,.94));
 cmr.updateMatrixWorld();_pm.multiplyMatrices(cmr.projectionMatrix,cmr.matrixWorldInverse);U.uIPV.value.copy(_pm).invert();U.uCam.value.setFromMatrixPosition(cmr.matrixWorld);
 renderer.setRenderTarget(P.rt);renderer.render(scn,cmr);renderer.setRenderTarget(P.rt2);renderer.render(P.sc,P.cam);renderer.setRenderTarget(null);renderer.render(P.sc2,P.cam)}
const _zenK=new THREE.Color();
