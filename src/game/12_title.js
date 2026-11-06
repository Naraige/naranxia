/* ================= EPIC TITLE SCENE: army vs. endless horde at sunset ================= */
const TS3=new THREE.Scene();let titleInit=false,titleDirty=true,TT=0,TARMY=[],THORDE=[],TARR=[],TCLOUDS=[],TFLAMES=[],TLH=null,TLFL=null,TBOLT=null,TFLASH=0,TFLN=6,TASH=null,TASHP=null,TFIRES=[],TSMOKE=[],TEMB=null,TEMBP=null;
const TZ=1.5; // global scale of the title cast
function gradTex(){const c=cvs(4,256),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#150c18');gr.addColorStop(.3,'#3a1522');gr.addColorStop(.58,'#8a2e26');gr.addColorStop(.82,'#d8662c');gr.addColorStop(1,'#ffa85a');g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);return t}
function sqSunTex(){const c=cvs(16,16),g=c.getContext('2d');g.fillStyle='#ffb070';g.fillRect(2,2,12,12);g.fillStyle='#ffd8a0';g.fillRect(3,3,10,10);g.fillStyle='#fff0d0';g.fillRect(4,4,8,8);g.fillStyle='#ffffff';g.fillRect(5,5,6,6);g.fillStyle='rgba(255,176,112,.5)';g.fillRect(1,1,14,1);g.fillRect(1,14,14,1);g.fillRect(1,1,1,14);g.fillRect(14,1,1,14);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}
function glowTex(r,g2,b){const c=cvs(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g2},${b},1)`);gr.addColorStop(.18,`rgba(${r},${g2},${b},.85)`);gr.addColorStop(.5,`rgba(${r},${g2},${b},.25)`);gr.addColorStop(1,`rgba(${r},${g2},${b},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
function mergePosed(parts){const P=[],N=[],C=[],I=[];let off=0;for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array;for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=p.length/3}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setIndex(I);r.computeBoundingSphere();return r}
function zPose(type,zv){const zo=ZVAR;ZVAR=zv||null;let mdl;try{mdl=mkModel(type,1)}finally{ZVAR=zo}const o=new THREE.Object3D(),M=(x,y,z,rx)=>{o.position.set(x,y,z);o.rotation.set(rx||0,0,0);o.updateMatrix();return o.matrix.clone()};
 if(type==='brute'){/* knuckle-walker: body bent forward from the hips, long arms planted on the ground */const B=new THREE.Matrix4().makeTranslation(0,mdl.hip,0).multiply(new THREE.Matrix4().makeRotationX(.58)).multiply(new THREE.Matrix4().makeTranslation(0,-mdl.hip,0)),W=m=>B.clone().multiply(m);
  const parts=[[mdl.torso,W(M(0,0,0))],[mdl.head,W(M(0,mdl.neck,0,-.42))],[mdl.arm,W(M(mdl.ax,mdl.sh,0,-.95))],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,W(M(-mdl.ax,mdl.sh,0,-.15))]);return{geo:mergePosed(parts),sc:mdl.sc||1.35}}
 const parts=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,.0,.3)],[mdl.arm,M(mdl.ax,mdl.sh,0,-1.45)],[mdl.leg,M(-mdl.lx,mdl.hip,0,.35)],[mdl.leg,M(mdl.lx,mdl.hip,0,-.35)]];if(mdl.armL)parts.push([mdl.armL,M(-mdl.ax,mdl.sh,0,-1.35)]);
 return{geo:mergePosed(parts),sc:mdl.sc||1.35}}
function titleDispose(){for(const u of TARMY){if(u.m){TS3.remove(u.m);u.m.userData.mat.dispose()}}TARMY=[]}
let TCAP=null;
function initTitle(){titleInit=true;TS3.background=gradTex();TS3.fog=new THREE.Fog(0x7a3a30,40,330);
 TLH=new THREE.HemisphereLight(0xd8957f,0x3a2a30,.8);TS3.add(TLH);TLFL=new THREE.DirectionalLight(0xcfe0ff,0);TLFL.position.set(10,80,-60);TS3.add(TLFL);const sun=new THREE.DirectionalLight(0xff9a5a,1.05);sun.position.set(-60,40,-90);TS3.add(sun);const fill=new THREE.DirectionalLight(0x8a6a98,.3);fill.position.set(30,20,60);TS3.add(fill);
 /* voxel terrain in the in-game style: terraced grass hills, dirt, stone, water, blocky trees */
 const CELL=2,X0=-200,NX=200,Z0=-330,NZ2=190,sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 const nz=(x,z)=>Math.sin(x*.045+1.3)*Math.cos(z*.05)+.55*Math.sin(x*.11+z*.07)+.35*Math.sin(z*.13-x*.09+2)+.25*Math.sin(x*.27+z*.23);
 const bg=new THREE.BoxGeometry(1,1,1);bg.translate(0,.5,0);{const pos=bg.attributes.position,nrm=bg.attributes.normal,col=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const top=nrm.getY(i)>.5,bot=nrm.getY(i)<-.5;const c=top?[1,1,1]:bot?[.3,.25,.2]:[.46,.34,.22];col.set(c,i*3)}bg.setAttribute('color',new THREE.BufferAttribute(col,3))}
 const tm=matV.clone(),cells=[];tm.onBeforeCompile=matV.onBeforeCompile;tm.defines={TERR:''};const TH2=new Float32Array(NX*NZ2),KIND=new Uint8Array(NX*NZ2);
 for(let j=0;j<NZ2;j++)for(let i=0;i<NX;i++){const x=X0+i*CELL+CELL/2,z=Z0+j*CELL+CELL/2,az=-z;
  const side=sm(0,22,Math.abs(x)-(26+.72*Math.max(0,az))),back=sm(0,45,az-150),m=Math.max(side,back*1.2);let h=0,kind=0;
  if(m>0){const n=nz(x,z)*.5+.5,lv=Math.floor((n*3.2-.5)*m*1.6+m*1.2);h=Math.max(-.5,lv*1.4);if(lv<0){kind=3;h=-.6}else if(lv>=3){kind=2}else kind=0;if(back>.8&&lv>=2)kind=2}
  else if(az<34&&az>2&&Math.abs(x)<46)kind=1;
  TH2[j*NX+i]=h;KIND[j*NX+i]=kind;
  const jj=.93+.14*(((i*7+j*13)%9)/9),dry=Math.max(0,Math.min(1,(Math.sin(x*.05+2)*Math.cos(z*.06)*.5+.5-.5)*3));let c;
  if(kind===3)c=[.24*jj,.52*jj,.84*jj];else if(kind===2)c=h>=5.6?[.9,.92,.97]:h>=4.2?[.66*jj,.68*jj,.74*jj]:[.5*jj,.54*jj,.5*jj];else if(kind===1)c=[.58*jj,.42*jj,.27*jj];
  else{c=[.3+(.62-.3)*dry*.5,.62+(.6-.62)*dry*.3,.26+(.3-.26)*dry*.5];if(h>=2.8){const t=Math.min(1,(h-2.8)/3);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}c=[c[0]*jj,c[1]*jj,c[2]*jj]}
  cells.push([x,z,h,c])}
 const tI=new THREE.InstancedMesh(bg,tm,cells.length),oo=new THREE.Object3D(),cc=new THREE.Color();cells.forEach(([x,z,h,c],k)=>{oo.position.set(x,-4,z);oo.scale.set(CELL,h+4,CELL);oo.updateMatrix();tI.setMatrixAt(k,oo.matrix);cc.setRGB(c[0],c[1],c[2]);tI.setColorAt(k,cc)});tI.frustumCulled=false;TS3.add(tI);
 const hAt=(x,z)=>{const i=Math.floor((x-X0)/CELL),j=Math.floor((z-Z0)/CELL);return i<0||j<0||i>=NX||j>=NZ2?-9:{h:TH2[j*NX+i],k:KIND[j*NX+i]}};
 /* in-game props: the very same oak / pine / birch / forest / rock / gold / flower models */
 {const sets=[[VAR.t.slice(0,6),.4,'t'],[VAR.t.slice(6,10),.34,'t'],[VAR.t.slice(10),.14,'t'],[FOR,.12,'t']],place=(geo,x,y,z,sc)=>{const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.floor(Math.random()*4)*Math.PI/2),new THREE.Vector3(sc,sc*(.9+Math.random()*.25),sc));(P.get(geo)||P.set(geo,[]).get(geo)).push(m)},P=new Map();
  const pick=arr=>arr[(Math.random()*arr.length)|0];
  for(let tries=0;tries<14000;tries++){const x=-190+Math.random()*380,z=-320+Math.random()*365,az=-z;const inPlay=Math.abs(x)<26+.72*Math.max(0,az)-4&&az<150;const c=hAt(x,z);if(!c||c.k===3)continue;
   if(inPlay){if(c.k!==0||Math.random()>.35)continue;const r=Math.random();if(r<.5){place(pick(DEC.f),x,c.h,z,TZ)}else if(r<.8){place(pick(DEC.t),x,c.h,z,TZ)}else if(r<.93){place(pick(DEC.b),x,c.h,z,TZ)}else if(r<.97){place(DEC.m[0],x,c.h,z,TZ)}else place(DEC.l[0],x,c.h,z,TZ);continue}
   const r=Math.random();if(z>5||(z>-14&&Math.abs(x)<34)){if(c.k===0&&r<.5)place(r<.2?pick(DEC.f):pick(DEC.t),x,c.h,z,TZ);continue}if(c.k===2){if(r<.16)place(pick(VAR.r),x,c.h,z,TZ*1.5);else if(r<.19)place(pick(VAR.g),x,c.h,z,TZ*1.5);else if(r<.3&&c.h<5)place(pick(VAR.t.slice(6,10)),x,c.h,z,TZ*1.3);continue}
   if(r<.55){let q=Math.random(),set=sets[0];for(const st of sets){if(q<st[1]){set=st;break}q-=st[1]}place(pick(set[0]),x,c.h,z,TZ*(.9+Math.random()*.4))}else if(r<.66)place(pick(VAR.r),x,c.h,z,TZ);else if(r<.82)place(pick(DEC.b),x,c.h,z,TZ);else place(pick(DEC.f),x,c.h,z,TZ)}
  for(const[geo,list]of P){const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((m,k)=>im.setMatrixAt(k,m));im.frustumCulled=false;TS3.add(im)}}
 /* blocky clouds */
 TCLOUDS=[];const cm=new THREE.MeshBasicMaterial({color:0x3c2a3a,fog:false,transparent:true,opacity:.96});for(let i=0;i<26;i++){const gp=new THREE.Group();const n=4+(Math.random()*5|0);for(let k=0;k<n;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(9+Math.random()*8,3+Math.random()*2,6+Math.random()*4),cm);b.position.set(k*8-n*4+Math.random()*3,Math.random()*2,Math.random()*5);gp.add(b)}gp.position.set(-260+Math.random()*520,40+Math.random()*30,-240-Math.random()*140);TS3.add(gp);TCLOUDS.push({g:gp,v:1.5+Math.random()*2})}
 /* sun */
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(255,80,40),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.position.set(60,30,-300);sp.scale.set(190,190,1);TS3.add(sp);
 const sp2=new THREE.Sprite(new THREE.SpriteMaterial({map:sqSunTex(),transparent:true,depthWrite:false,fog:false}));sp2.position.set(60,30,-299);sp2.scale.set(46,46,1);TS3.add(sp2);
 /* horde: instanced posed zombies */
 const kinds=[['husk',.4,6],['zombie',.42,10],['runner',.12,5],['brute',.06,4]],NZ=1500;
 THORDE=[];for(const[k,f,nv]of kinds){const tot=Math.round(NZ*f);for(let vi=0;vi<nv;vi++){const d=zPose(k,{v:vi,hint:null}),n=Math.max(1,Math.round(tot/nv)),im=new THREE.InstancedMesh(d.geo,matUI,n);im.frustumCulled=false;TS3.add(im);const arr=[];
  for(let i=0;i<n;i++){const depth=Math.pow(Math.random(),.62),z=-12-depth*130,wd=26+(-z)*.7,x=(Math.random()*2-1)*wd;arr.push({x,z,ph:Math.random()*6.28,sp:.7+Math.random()*.8,sc:d.sc*TZ*1.25*(.92+Math.random()*.16)})}
  THORDE.push({im,arr,k})}}

 /* apocalypse: falling ash, ground fires with smoke, lightning */
 {const AN=700,ap=new Float32Array(AN*3);for(let i=0;i<AN;i++){ap[i*3]=(Math.random()-.5)*160;ap[i*3+1]=Math.random()*45;ap[i*3+2]=-Math.random()*130+20}
  const ag2=new THREE.BufferGeometry();ag2.setAttribute('position',new THREE.BufferAttribute(ap,3));TASHP=ap;TASH=new THREE.Points(ag2,new THREE.PointsMaterial({color:0xb8aaa8,size:.22,transparent:true,opacity:.75,depthWrite:false,fog:false}));TASH.frustumCulled=false;TS3.add(TASH)}
 {const pts=[[0,0],[2.5,18],[-1.5,34],[3,52],[-2,72],[1,95],[-3,120]],bm=new THREE.MeshBasicMaterial({color:0xe8f0ff,fog:false});TBOLT=new THREE.Group();for(let k=0;k<pts.length-1;k++){const[ax,ay]=pts[k],[bx,by]=pts[k+1],l=hyp(bx-ax,by-ay),m=new THREE.Mesh(new THREE.BoxGeometry(1.3,l,1.3),bm);m.position.set((ax+bx)/2,(ay+by)/2,0);m.rotation.z=-Math.atan2(bx-ax,by-ay);TBOLT.add(m)}TBOLT.visible=false;TS3.add(TBOLT)}
 /* embers */
 const EN=260,ep=new Float32Array(EN*3);for(let i=0;i<EN;i++){ep[i*3]=(Math.random()-.5)*120;ep[i*3+1]=Math.random()*30;ep[i*3+2]=-Math.random()*110+10}
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ep,3));TEMBP=ep;TEMB=new THREE.Points(eg,new THREE.PointsMaterial({color:0xc8b8b0,size:.3,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEMB.frustumCulled=false;TS3.add(TEMB);
 /* arrows */
 const ag=new THREE.BoxGeometry(.05,.05,1.1),am=new THREE.MeshBasicMaterial({color:0xfff0c0}),ai=new THREE.InstancedMesh(ag,am,170);ai.frustumCulled=false;TS3.add(ai);TARR={im:ai,list:[],next:1};
 buildArmy()}
const _tm=new THREE.Object3D();let TSH={i:0,t:0},TFADE=1,TEYE=null;
const TSHOTS=[
 {d:16,f:(t,T)=>({p:[-5+Math.sin(T*.11)*4,2.3+Math.sin(T*.17)*.25,13+Math.sin(T*.09)*1.2],l:[Math.sin(T*.1)*2,5.8,-40]})},
 {d:10,f:t=>{const k=t/10,e=k*k*(3-2*k);return{p:[-6+e*10,3.2+e*17,10-e*3],l:[e*4,1.5-e*1.5,-58]}}},
 {d:10,f:t=>{const k=t/10;return{p:[-21+k*26,1.35,-12.5],l:[-18+k*26,3.4,-2]}}},
 {d:9,f:t=>{const c=TCAP?TCAP.x/TS:0,k=t/9;return{p:[c+3.4-k*1.2,1.65,-11.4+k*.6],l:[c,2.7,-7.6]}}},
 {d:10,f:t=>{const k=t/10;return{p:[3.6-k*1.6,1.25,3.3],l:[-2,9+k*5,-34]}}}];
function titleEyes(){const N=THORDE.reduce((a,H)=>a+H.arr.length,0),pos=new Float32Array(N*6),gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(pos,3));
 TEYE=new THREE.Points(gm,new THREE.PointsMaterial({color:0xff3a22,size:.26,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));TEYE.frustumCulled=false;TS3.add(TEYE)}
function renderTitle(dt){if(!titleInit)initTitle();if(titleDirty){buildArmy();titleDirty=false}TT+=dt;
 /* camera: slow dolly with sway, scene shifted right on wide screens so the menu sits left */
 const wide=cv.width/cv.height>1.25,sh=0,t=TT;
 TSH.t+=dt;let S=TSHOTS[TSH.i];if(TSH.t>=S.d){TSH.t-=S.d;TSH.i=(TSH.i+1)%TSHOTS.length;S=TSHOTS[TSH.i];if(TSH.i===4&&TARR)TARR.next=.3}
 TFADE=TSH.t<.7?1-TSH.t/.7:TSH.t>S.d-.7?(TSH.t-(S.d-.7))/.7:0;const cm=S.f(TSH.t,t);camera.position.set(cm.p[0],cm.p[1],cm.p[2]);camera.lookAt(cm.l[0],cm.l[1],cm.l[2]);
 if(window.__cam){camera.position.set(...__cam.p);camera.lookAt(...__cam.l)}
 /* army idle + occasional volleys */
 frameN++;
 for(const u of TARMY){u.walk=0;
  if(u===TCAP){const dir=u.face>0?1:-1;u.x+=dir*dt*TS*.8;u.walk=.25;if(u.x/TS>13&&dir>0)u.face=-Math.PI/2;else if(u.x/TS<-13&&dir<0)u.face=Math.PI/2}
  else{u.x+=Math.sin(TT*.4+u.ph0)*dt*TS*.03;if(u.raise&&u.atk<=0&&Math.random()<dt*.15)u.atk=.35}
  animUnit(u,dt,false,frameN);if(u.m){u.m.position.y=0;const d=u.m.userData;
   if(u===TCAP){d.arm.rotation.x=.95;d.arm.rotation.z=-.78;if(d.armL){d.armL.rotation.x=.95;d.armL.rotation.z=.78}d.body.rotation.x=.08}
   else titlePose(u,d)}}
 resSway(TT);
 TARR.next-=dt;if(TARR.next<=0){TARR.next=3.4+Math.random()*2;const ar=TARMY.filter(u=>u.type==='archer').concat(TRES?TRES.arch:[]);for(const u of ar){if(Math.random()<.7){u.atk=.35;TARR.list.push({sx:u.x/TS,sz:u.y/TS-.5,tx:u.x/TS+(Math.random()-.5)*14,tz:-35-Math.random()*45,t0:TT+Math.random()*.25,dur:2.4+Math.random()*.6})}}}
 let ai=0;for(let i=TARR.list.length-1;i>=0;i--){const a=TARR.list[i],p=(TT-a.t0)/a.dur;if(p>1){TARR.list.splice(i,1);continue}if(p<0)continue;if(ai>=170)break;const x=a.sx+(a.tx-a.sx)*p,z=a.sz+(a.tz-a.sz)*p,y=2.2+28*4*p*(1-p)*.55,p2=Math.min(1,p+.02),x2=a.sx+(a.tx-a.sx)*p2,z2=a.sz+(a.tz-a.sz)*p2,y2=2.2+28*4*p2*(1-p2)*.55;
  _tm.position.set(x,y,z);_tm.lookAt(x2,y2,z2);_tm.scale.set(1,1,1);_tm.updateMatrix();TARR.im.setMatrixAt(ai++,_tm.matrix)}TARR.im.count=ai;TARR.im.instanceMatrix.needsUpdate=true;
 /* horde sway */
 if(!TEYE)titleEyes();const EP=TEYE.geometry.attributes.position.array;let ei=0;
 for(const H of THORDE){const im=H.im;for(let i=0;i<H.arr.length;i++){const z=H.arr[i],s=t*z.sp+z.ph,bob=Math.abs(Math.sin(s*2.2))*.16*(H.k==='runner'?1.6:1),px=z.x+Math.sin(s*.5)*.5,pz=z.z+Math.cos(s*.4)*.6+Math.sin(t*.3)*.8,ry=Math.sin(s*.7)*.35+(z.x>0?.04:-.04);
  _tm.position.set(px,bob,pz);_tm.rotation.set(0,ry,Math.sin(s*2.2)*.09);_tm.scale.set(z.sc,z.sc,z.sc);_tm.updateMatrix();im.setMatrixAt(i,_tm.matrix);
  const cy=Math.cos(ry),sy=Math.sin(ry),ey=bob+.597*z.sc,fz=.112*z.sc;for(const ex of[-.045,.045]){const lx=ex*z.sc;EP[ei++]=px+lx*cy+fz*sy;EP[ei++]=ey;EP[ei++]=pz-lx*sy+fz*cy}}im.instanceMatrix.needsUpdate=true}
 TEYE.geometry.attributes.position.needsUpdate=true;TEYE.material.opacity=.7+.3*Math.sin(t*2.1);
 for(const c of TCLOUDS){c.g.position.x+=c.v*dt;if(c.g.position.x>300)c.g.position.x=-300}

 TFLN-=dt;if(TFLN<=0){TFLN=4+Math.random()*7;TFLASH=.55;TBOLT.position.set((Math.random()-.5)*260,-3,-200-Math.random()*70);TBOLT.visible=true}
 if(TFLASH>0){TFLASH-=dt;const k=Math.max(0,TFLASH)/.55,fl=(Math.sin(TFLASH*60)>-.2?1:.3)*k;TLFL.intensity=3.2*fl;TLH.intensity=.8+1.4*fl;if(TFLASH<=.3)TBOLT.visible=false;if(TFLASH<=0){TLFL.intensity=0;TLH.intensity=.8;TBOLT.visible=false}}
 for(const f of TFIRES){const k=1+.3*Math.sin(t*10+f.ph);f.f.scale.set(k,k*1.5,k);f.f.rotation.y=t*2+f.ph;f.f2.scale.set(.6*k,1.1*k,.6*k);if(f.l)f.l.intensity=1.2+.5*Math.sin(t*9+f.ph*3)}
 for(const s2 of TSMOKE){s2.t+=dt;if(s2.t>8)s2.t-=8;const p=s2.t/8;s2.b.position.set(s2.x+p*7+Math.sin(p*5+s2.x)*1.2,2+p*20,s2.z-p*2);const sc=.8+p*2.6;s2.b.scale.set(sc,sc,sc);s2.b.rotation.y=p*3;s2.b.material.opacity=.55*(1-p)}
 for(let i=0;i<TASHP.length;i+=3){TASHP[i+1]-=dt*(2.2+(i%5)*.4);TASHP[i]+=dt*(2.5+Math.sin(t*.7+i)*1.2);if(TASHP[i+1]<0){TASHP[i+1]=45;TASHP[i]=(Math.random()-.5)*160;TASHP[i+2]=-Math.random()*130+20}if(TASHP[i]>90)TASHP[i]-=180}TASH.geometry.attributes.position.needsUpdate=true;
 for(const f of TFLAMES){const k=1+.25*Math.sin(t*11+f.x);f.f.scale.set(k,k*1.3,k);f.f.rotation.y=t*2;f.l.intensity=1.5+.4*Math.sin(t*9+f.x*3)}
 for(let i=0;i<TEMBP.length;i+=3){TEMBP[i+1]+=dt*(1.5+(i%7)*.2);TEMBP[i]+=dt*(.8+Math.sin(t+i)*.6);if(TEMBP[i+1]>32){TEMBP[i+1]=0;TEMBP[i]=(Math.random()-.5)*120;TEMBP[i+2]=-Math.random()*110+10}}TEMB.geometry.attributes.position.needsUpdate=true;
 postRender(TS3,camera,false)}
/* ---- 3D castle site picker ---- */
let PK=null;const PKS=.25,PKU=.5;
function pkInit(){const sc=new THREE.Scene();sc.background=new THREE.Color(0x9ccaf0);sc.fog=new THREE.Fog(0x9ccaf0,260,1100);
 sc.add(new THREE.HemisphereLight(0xffffff,0x6a7a60,.85));const dl=new THREE.DirectionalLight(0xfff2d8,.85);dl.position.set(-200,300,150);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(45,1,1,4000);
 const cg=new THREE.ConeGeometry(3,10,12);cg.rotateX(Math.PI);cg.translate(0,5,0);const hov=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:0x6fe08a}));hov.visible=false;sc.add(hov);
 const mark=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(6,10,6),new THREE.MeshLambertMaterial({color:0xffd23c}));b.position.y=5;mark.add(b);const bm=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.55}));bm.position.y=30;mark.add(bm);
 const rg=new THREE.Mesh(new THREE.RingGeometry(10,12,40),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.5;mark.add(rg);mark.visible=false;sc.add(mark);
 PK={sc,cam,yaw:.35,pitch:.85,dist:400,tx:PVW*PKU/2,tz:PVH*PKU/2,mesh:null,wat:null,key:-1,hov,mark,Y:null,hit:null}}
function pkBuild(){if(!PK)pkInit();if(pvKey!==SEED)buildPreview();PK.key=SEED;if(PK.mesh){PK.sc.remove(PK.mesh);PK.mesh.geometry.dispose()}if(PK.wat){PK.sc.remove(PK.wat);PK.wat.geometry.dispose()}if(PK.props)for(const m of PK.props)PK.sc.remove(m);PK.props=[];
 const n=PVW*PVH,pos=new Float32Array(n*3),col=new Float32Array(n*3),Y=new Float32Array(n),SM=siteMaskGet();
 const P0=GPR,TR=[],ROC=[],GLD=[],treeAt=(x,y,h)=>{const al=h-LAND,f=fb(x*.06,y*.06,SEED+50),d=(f-P0.tr)/.2;if(d>0&&al<14&&hs(x,y,SEED+11)<Math.min(.9,d*.9+.08))return 2;if(hs(x,y,SEED+12)<P0.tc)return 2;if(al>=2&&fb(x*.05,y*.05,SEED+60)>.78&&hs(x,y,SEED+14)<.42*P0.gd)return 4;if(al>=4&&hs(x,y,SEED+16)<.004*P0.gd)return 4;if(al>=3&&hs(x,y,SEED+13)<.01+.004*al)return 3;if(hs(x,y,SEED+15)<.0025)return 3;return 0};
 for(let j=0;j<PVH;j++)for(let i=0;i<PVW;i++){const k=j*PVW+i,h=pvH[k],wt=pvW[k],tx=Math.min(TW-1,i*PVS+1),ty=Math.min(TH-1,j*PVS+1);let c;const al=h-LAND,jit=.93+.14*hs(tx,ty,9);
  let code=0;if(!wt&&h<ROCKH)code=treeAt(tx,ty,h);
  if(wt)c=[.24,.52,.84];else if(h>=SNOW)c=[.9,.92,.97];else if(h>=ROCKH||al>=15)c=al>=19?[.66,.68,.74]:[.5,.54,.5];
  else{const m=fb(tx*.05,ty*.05,SEED+500),dry=Math.max(0,Math.min(1,(m-.5)*3));c=[.3+.32*dry*.5,.62-.02*dry*.3,.26+.04*dry*.5];if(al>=8){const t=Math.min(1,(al-8)/12);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}
   if(al<=1){const nb=(i>0&&pvW[k-1])||(i<PVW-1&&pvW[k+1])||(j>0&&pvW[k-PVW])||(j<PVH-1&&pvW[k+PVW]);if(nb)c=[.86,.78,.55]}
   if(code===2)c=c.map(v=>v*.78);else if(code===3)c=[.5,.5,.46];else if(code===4)c=[.9,.76,.2]}
  c=c.map(v=>v*jit);if(!wt){if(SM[k])c=[c[0]*.45+.14,c[1]*.45+.55,c[2]*.45+.08];else{const l=(c[0]+c[1]+c[2])/3;c=[l*.62+.06,l*.62+.06,l*.62+.06]}}
  const lvl=Math.round((h-LAND)/2)*2,y=(wt?BED-1:lvl)*PKS;Y[k]=y;pos[k*3]=i*PKU;pos[k*3+1]=y;pos[k*3+2]=j*PKU;col[k*3]=c[0];col[k*3+1]=c[1];col[k*3+2]=c[2];
  if(!wt){const r=hs(tx,ty,31);if(code===2)TR.push([i*PKU,y,j*PKU,al>=8?1:0,.8+hs(tx,ty,32)*.5]);else if(code===3)ROC.push([i*PKU,y,j*PKU,(hs(tx,ty,33)*6)|0]);else if(code===4)GLD.push([i*PKU,y,j*PKU,(hs(tx,ty,34)*3)|0])}}
 const idx=new Uint32Array((PVW-1)*(PVH-1)*6);let p=0;for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){const a=j*PVW+i,b=a+1,c=a+PVW,d=c+1;idx[p++]=a;idx[p++]=c;idx[p++]=b;idx[p++]=b;idx[p++]=c;idx[p++]=d}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
 PK.mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));PK.sc.add(PK.mesh);PK.Y=Y;
 const wg=new THREE.PlaneGeometry(PVW*PKU,PVH*PKU);wg.rotateX(-Math.PI/2);wg.translate(PVW*PKU/2,(WLV-LAND)*PKS,PVH*PKU/2);PK.wat=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({color:0x3f8fe0,transparent:true,opacity:.62}));PK.sc.add(PK.wat);
 PK.lists={TR,ROC,GLD};PK.idx=idx;PK.rect=null;pkProps()}
let PKG=null;function pkGeos(){if(PKG)return;const o=newG();bxc(o,0,0,0,.3,.7,.3,'#6b4423');bxc(o,0,.5,0,1.0,.55,1.0,'#4f9d45');bxc(o,0,.95,0,.7,.5,.7,'#63b457');bxc(o,0,1.4,0,.4,.2,.4,'#7bc86a');const p=newG();bxc(p,0,0,0,.25,.4,.25,'#5a3a1e');bxc(p,0,.3,0,.95,.4,.95,'#2f7a4a');bxc(p,0,.65,0,.7,.4,.7,'#3d8f58');bxc(p,0,1.0,0,.45,.4,.45,'#2a6e48');bxc(p,0,1.35,0,.2,.3,.2,'#4ea068');PKG=[toGeo(o),toGeo(p)]}
function pkProps(){pkGeos();const L=PK.lists;if(!L)return;if(PK.props)for(const m of PK.props){PK.sc.remove(m);m.dispose()}PK.props=[];const R=PK.rect,keep=p=>!R||p[0]<R[0]||p[0]>R[1]||p[2]<R[2]||p[2]>R[3];
 const TR=L.TR.filter(keep),ROC=L.ROC.filter(keep),GLD=L.GLD.filter(keep);
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),vv=new THREE.Vector3(),ss=new THREE.Vector3(),yA=new THREE.Vector3(0,1,0),addSet=(geo,list,sc)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((p,n)=>{q.setFromAxisAngle(yA,((p[3]*7+n)&3)*Math.PI/2);const k2=sc*(p[4]||1);m4.compose(vv.set(p[0],p[1],p[2]),q,ss.set(k2,k2*(geo===PKG[0]||geo===PKG[1]?1.1:1.05),k2));im.setMatrixAt(n,m4)});im.frustumCulled=false;PK.sc.add(im);PK.props.push(im)};
 const stp=Math.max(1,Math.ceil(TR.length/40000)),TA=TR.filter((p,n)=>n%stp===0);for(let v=0;v<2;v++)addSet(PKG[v],TA.filter((p,n)=>(p[3]?1:(n%3===0?1:0))===v),.55);for(let v=0;v<6;v++)addSet(VAR.r[v],ROC.filter(p=>p[3]===v),.9);for(let v=0;v<3;v++)addSet(VAR.g[v],GLD.filter(p=>p[3]===v),1.0)}
/* real generated world around the chosen site: the game's own chunk meshes (terrain, trees, rocks, gold) + the castle */
const PKR=3;let PKD={x:-1,y:-1,grp:null,t:0};
function pkDetail(tx,ty){if(!PK||!PK.idx)return;const t0=performance.now();CX=tx;CY=ty;CROT=PKROT&3;try{reset()}catch(e){return}
 if(PKD.grp){PK.sc.remove(PKD.grp);PKD.grp.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 const grp=new THREE.Group();grp.scale.set(PKU/PVS,PKS,PKU/PVS);grp.position.y=-LAND*PKS;
 const ccx=(tx/CH)|0,ccy=(ty/CH)|0,mv=m=>{if(!m)return;scene.remove(m);m.castShadow=false;m.receiveShadow=false;grp.add(m)};
 for(let j=-PKR;j<=PKR;j++)for(let i=-PKR;i<=PKR;i++){const cx=ccx+i,cy=ccy+j;if(cx<0||cy<0||cx>=NCX||cy>=NCY)continue;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)genChunk(cx+a,cy+b);const o=buildChunk(cx,cy);mv(o.m);mv(o.w);mv(buildProps(cx,cy))}
 for(const st of structs)if(st.o3){scene.remove(st.o3);grp.add(st.o3)}
 PK.sc.add(grp);PKD.grp=grp;PKD.x=tx;PKD.y=ty;PKD.r=PKROT&3;
 const x0=(ccx-PKR)*CH,x1=(ccx+PKR+1)*CH,y0=(ccy-PKR)*CH,y1=(ccy+PKR+1)*CH,u=PKU/PVS;PK.rect=[x0*u,x1*u,y0*u,y1*u];pkProps();
 const i0=Math.floor(x0/PVS),i1=Math.ceil(x1/PVS),j0=Math.floor(y0/PVS),j1=Math.ceil(y1/PVS),src=PK.idx,out=new Uint32Array(src.length);let p=0;
 for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){if(i>=i0&&i<i1&&j>=j0&&j<j1)continue;const k=(j*(PVW-1)+i)*6;out[p++]=src[k];out[p++]=src[k+1];out[p++]=src[k+2];out[p++]=src[k+3];out[p++]=src[k+4];out[p++]=src[k+5]}
 PK.mesh.geometry.setIndex(new THREE.BufferAttribute(out.subarray(0,p),1));PKD.ms=performance.now()-t0}
function pkCam(){const c=PK.cam,cp=Math.cos(PK.pitch);c.position.set(PK.tx+Math.sin(PK.yaw)*cp*PK.dist,Math.sin(PK.pitch)*PK.dist,PK.tz+Math.cos(PK.yaw)*cp*PK.dist);c.lookAt(PK.tx,0,PK.tz);c.aspect=cv.width/cv.height;c.updateProjectionMatrix();c.updateMatrixWorld()}
const _pkv=new THREE.Vector3();
function pkRay(p){if(!PK||!PK.Y)return null;pkCam();const c=PK.cam;_pkv.set(p.x/cv.width*2-1,-(p.y/cv.height*2-1),.5).unproject(c);const o=c.position,dx=_pkv.x-o.x,dy=_pkv.y-o.y,dz=_pkv.z-o.z,L=Math.sqrt(dx*dx+dy*dy+dz*dz),ux=dx/L,uy=dy/L,uz=dz/L;
 for(let t=0;t<4000;t+=1.2){const x=o.x+ux*t,y=o.y+uy*t,z=o.z+uz*t;if(x<0||z<0||x>(PVW-1)*PKU||z>(PVH-1)*PKU)continue;const k=Math.round(z/PKU)*PVW+Math.round(x/PKU);if(y<=PK.Y[k]){return{x,y,z}}}return null}
function pkTile(h){return{tx:Math.max(0,Math.min(TW-1,Math.round(h.x/PKU*PVS+1))),ty:Math.max(0,Math.min(TH-1,Math.round(h.z/PKU*PVS+1)))}}
function pkSet(tx,ty,ok){pickPos={tx,ty,ok}}
function renderPick(dt){if(!PK||PK.key!==SEED){pkBuild();PKD.x=-1;PKD.grp=null}
 if(pickPos&&pickPos.ok&&(pickPos.tx!==PKD.x||pickPos.ty!==PKD.y||(PKROT&3)!==PKD.r)){PKD.w=(PKD.w||0)+dt;if(PKD.w>.3||PKD.x<0){PKD.w=0;pkDetail(pickPos.tx,pickPos.ty)}}
 if(pickPos&&PK.mark){PK.mark.visible=true;const i=Math.max(0,Math.min(PVW-1,Math.round((pickPos.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((pickPos.ty-1)/PVS)));PK.mark.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);PK.mark.children[2].material.color.set(pickPos.ok?0xffd23c:0xff6b6b);PK.mark.children[0].visible=!(PKD.grp&&pickPos.ok&&PKD.x===pickPos.tx&&PKD.y===pickPos.ty);PK.mark.children[2].scale.set(.4,.4,.4)}else PK.mark.visible=false;
 const h=pkRay(mouse);if(h&&!uiRects.some(r=>inR(mouse,r))){const t=pkTile(h),ok=siteOK(t.tx,t.ty);PK.hov.visible=true;PK.hov.position.set(h.x,h.y+1,h.z);PK.hov.material.color.set(ok?0x6fe08a:0xff6b6b);PK.hov.position.y+=2+Math.sin(clockT*5)*1.2;PK.hit={...t,ok}}else{PK.hov.visible=false;PK.hit=null}
 pkCam();renderer.render(PK.sc,PK.cam)}
function pkFocus(){if(!PK||!pickPos)return;if(typeof pkLiveFocus==='function')pkLiveFocus(pickPos.tx,pickPos.ty);PK.tx=(pickPos.tx-1)/PVS*PKU;PK.tz=(pickPos.ty-1)/PVS*PKU}
/* ---- 3D rendered UI icons ---- */
let ICR=null;
function icoInit(){const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x9a8a78,.85));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-3,5,4);sc.add(dl);
 ICR={sc,cam:new THREE.PerspectiveCamera(28,1,.05,200),rt:new THREE.WebGLRenderTarget(ICO_RT,ICO_RT,{samples:4}),buf:new Uint8Array(ICO_RT*ICO_RT*4)}}
const icoMesh=(G)=>new THREE.Mesh(toGeo(G),matV);
const icoStd=(geo,c)=>new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));
function icoUnit(type,t){const u=mkU(t||0,type,0,0);u.face=0;u.fa=0;u.hp=1;u.ttl=1;animUnit(u,.016,false,0);const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);{const rm=[];g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o))}const w=new THREE.Group();w.add(g);return w}
function icoStruct(type,m,tier,extra){const s={type,t:0,tier:tier==null?1:tier,sz:1};const w=new THREE.Group();const me=new THREE.Mesh(sGeo(s,m||0),matV);w.add(me);if(extra)extra(w);return w}
let ICOT=-1;const ICT=[{},{}],TIERK=new Set(['wall','gate','tower','barracks','path']);
function icoObj(k){
 switch(k){
 case 'peasant':case 'idle':return icoUnit('peasant');case 'knight':return icoUnit('knight');case 'archer':return icoUnit('archer');case 'bannerman':return icoUnit('bannerman');case 'captain':return icoUnit('captain');
 case 'skull':return icoUnit('zombie',1);
 case 'cannon':{const w=new THREE.Group(),m=new THREE.Mesh(GEO.cannonU||(GEO.cannonU=cannonG()),matV);m.rotation.y=-.5;w.add(m);return w}
 case 'wall':return icoStruct('wall',10,ICOT<0?(RS.done?1:0):ICOT);case 'tower':return icoStruct('tower',0,ICOT<0?(RS.done?1:0):ICOT);case 'barracks':return icoStruct('barracks',0,ICOT<0?(RS.done?1:0):ICOT);case 'farm':return icoStruct('farm',0,1);
 case 'gate':return icoStruct('gate',0,ICOT<0?(RS.done?1:0):ICOT,w=>{const d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.position.set(0,1.32,0);w.add(d)});
 case 'home':case 'castle':{const w=icoStruct('castle',0,RS.done?1:0);return w}
 case 'upgrade':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<2;j++)bxc(G,-.5+i*.5,j*.32,0,.46,.3,.46,j%2?'#b9bcc8':'#9a9ba6');bxc(G,0,.64,0,.46,.3,.46,'#c7c9d4');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.55,4),0xffd23c);c.position.set(0,1.28,0);w.add(c);return w}
 case 'ballista':return icoStruct('ballista',0,1,w=>{const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);w.add(h)});
 case 'trebuchet':return icoStruct('trebuchet',0,1,w=>{const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.y=.4;w.add(a)});
 case 'path':{const G=newG(),st=ICOT===1;for(let i=0;i<3;i++)for(let j=0;j<3;j++)bxc(G,(i-1)*.55,0,(j-1)*.55,.5,.12+((i+j)%2)*.03,.5,st?((i+j)%2?'#8e9098':'#a9abb3'):((i+j)%2?'#b08a58':'#c4a06a'));return icoMesh(G)}
 case 'raise':{const w=new THREE.Group();const G=newG();for(let i=0;i<2;i++)for(let j=0;j<2;j++)bxc(G,(i-.5)*.6,0,(j-.5)*.6,.58,.5,.58,'#8a6238'),bxc(G,(i-.5)*.6,.5,(j-.5)*.6,.58,.14,.58,'#5fae48');bxc(G,0,.64,0,.58,.5,.58,'#8a6238');bxc(G,0,1.14,0,.58,.14,.58,'#5fae48');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.32,.6,4),0xffd23c);c.position.set(0,1.9,0);w.add(c);return w}
 case 'dig':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i===1&&j===1)continue;bxc(G,(i-1)*.5,0,(j-1)*.5,.48,.6,.48,'#8a6238');bxc(G,(i-1)*.5,.6,(j-1)*.5,.48,.14,.48,'#5fae48')}bxc(G,0,0,0,.48,.25,.48,'#5a3d1e');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.6,4),0xffd23c);c.rotation.x=Math.PI;c.position.set(0,1.5,0);w.add(c);return w}
 case 'coin':{const G=newG();const ing=(x,y,z)=>{bxc(G,x,y,z,1.0,.3,.5,'#e8b820');bxc(G,x,y+.3,z,.8,.1,.34,'#ffe266');bxc(G,x-.38,y+.2,z+.18,.1,.06,.06,'#fff6c0')};ing(0,0,0);ing(.12,.4,-.05);return icoMesh(G)}
 case 'wood':{const G=newG();bxc(G,0,0,0,1,1,1,'#6b5030');bxc(G,0,1,0,.94,.02,.94,'#b8945f');bxc(G,0,1.02,0,.64,.02,.64,'#9a7a48');bxc(G,0,1.04,0,.3,.02,.3,'#b8945f');bxc(G,.2,.3,.51,.12,.4,.02,'#4f3a22');bxc(G,-.25,.55,.51,.1,.3,.02,'#4f3a22');return icoMesh(G)}
 case 'stone':{const G=newG();bxc(G,0,0,0,1,1,1,'#7f7f7f');[[-.25,.7,.51,.4,.22],[.22,.3,.51,.36,.26],[-.2,.12,.51,.3,.2]].forEach(([x,y,z,w,h],k)=>bxc(G,x,y,z,w,h,.02,k%2?'#9a9a9a':'#646464'));[[.51,.6,.2],[.51,.25,-.2]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.02,.26,.36,k?'#9a9a9a':'#646464'));[[0,1.01,.1],[.2,1.01,-.25]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.36,.02,.3,k?'#9a9a9a':'#646464'));return icoMesh(G)}
 case 'heart':{const G=newG();[[0,1,3],[-1,.4,1],[1,.4,1]].forEach(()=>0);const rows=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];rows.forEach((r,j)=>{for(let i=0;i<7;i++)if(r[i]==='X')bxc(G,(i-3)*.3,(5-j)*.3,0,.3,.3,.3,j<2&&i>0&&i<3&&j===0?'#ff9a9a':'#e03a4a')});return icoMesh(G)}
 case 'sword':{const G=newG();vsp(G,sprites().sword,0,0,0,.1);return icoMesh(G)}
 case 'hammer':{return icoObj('upgrade')}
 case 'army':{const w=new THREE.Group();[[-.9,0],[0,0],[.9,0]].forEach(([x,z],i)=>{const u=icoUnit('knight');u.position.set(x*.8,0,i===1?-.7:0);w.add(u)});return w}
 case 'group':{const w=new THREE.Group();[[-.8,0],[.8,0],[0,-.8]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 case 'ungroup':{const w=new THREE.Group();[[-.9,0],[.9,0]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 }return null}
function icoShot(obj,yaw,pitch){const R=ICR,cam=R.cam;R.sc.add(obj);obj.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=Math.max(.01,sp.radius),d=r/Math.sin(cam.fov*Math.PI/360)*1.02;
 yaw=yaw==null?.6:yaw;pitch=pitch==null?.3:pitch;cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
 const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const fw0=FOWU.fowP.value.w,fz0=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(R.rt);renderer.clear();renderer.render(R.sc,cam);renderer.readRenderTargetPixels(R.rt,0,0,ICO_RT,ICO_RT,R.buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);FOWU.fowP.value.w=fw0;FOWU.fowP.value.z=fz0;R.sc.remove(obj);
 const N2=ICO_RT,cv2=cvs(N2,N2),g=cv2.getContext('2d'),im=g.createImageData(N2,N2);for(let y=0;y<N2;y++){const sy=N2-1-y;for(let x=0;x<N2;x++){const s=(sy*N2+x)*4,o=(y*N2+x)*4;im.data[o]=R.buf[s];im.data[o+1]=R.buf[s+1];im.data[o+2]=R.buf[s+2];im.data[o+3]=R.buf[s+3]}}g.putImageData(im,0,0);return arcIcon(cv2,ICO_N)}
function icons3D(){try{if(!ICR)icoInit();const keys=['cannon','peasant','idle','knight','archer','bannerman','captain','skull','wall','tower','gate','barracks','farm','home','upgrade','ballista','trebuchet','path','raise','dig','coin','wood','stone','heart','sword','army','group','ungroup'];
 for(const k of keys){const o=icoObj(k);if(!o)continue;const yaw=['coin','wood','stone','path','raise','dig','upgrade','heart','sword'].includes(k)?.5:.45;IC[k]=icoShot(o,k==='heart'?0:k==='sword'?Math.PI/2:yaw,k==='heart'||k==='sword'?0:.35)}IC.castle=IC.home;IC.hammer=IC.upgrade;
 try{for(const t of[0,1]){ICOT=t;for(const k of TIERK){const o=icoObj(k);if(o)ICT[t][k]=icoShot(o,k==='path'?.5:.45,.35)}}}finally{ICOT=-1}}catch(e){console.error('icons3D',e)}}
