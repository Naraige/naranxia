/* ---- live castle placement: the real generated world, game camera, castle ghost like any building ---- */
const PKL={on:false,seed:-1,hit:null,beam:null};
function pkLivePrep(){PKL.seed=SEED;PKL.site='';CX=CY=-2000;SITE2=null;initWorld();for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();GB2.g.visible=false;GB2.key='';GB1.key=''}
function pkLiveFocus(tx,ty){CAM.x=tx;CAM.z=ty;CAM.y=LAND;CAM.yaw=0;CAM.pitch=.9;CAM.dist=Math.max(CAM.dist,40)}
/* the live view shows the ground as it will be once the game starts: the castle pad levelled (the castle sits on it instead of
   half buried in a slope), the starting resources and the zombie paths; the partner's site too in co-op */
function pkLiveSync(){const a=pickPos&&pickPos.ok?pickPos:null,b=MP.conn&&MP.theirs?MP.theirs:null,k=SEED+'|'+(a?a.tx+','+a.ty:'-')+'|'+(b?b.tx+','+b.ty:'-');if(k===PKL.site)return;PKL.site=k;
 CX=a?a.tx:b?b.tx:-2000;CY=a?a.ty:b?b.ty:-2000;SITE2=a&&b?{tx:b.tx,ty:b.ty}:null;
 initWorld();for(const k2 of[...CHK.keys()])dropChunk(k2);dirtyT.clear();dirtyP.clear();GB1.key='';GB2.key='';GB3.key=''}
function renderPickLive(dt){if(PKL.seed!==SEED)pkLivePrep();pkLiveSync();
 if(!PKL.beam){PKL.beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.5,depthWrite:false}));scene.add(PKL.beam)}
 const k=dt*(keys[KB.up]||keys.arrowup?-1:keys[KB.down]||keys.arrowdown?1:0),k2=dt*(keys[KB.left]||keys.arrowleft?-1:keys[KB.right]||keys.arrowright?1:0),sp=CAM.dist*.9,s=Math.sin(CAM.yaw),c=Math.cos(CAM.yaw);
 CAM.x+=(k2*c+k*s)*sp;CAM.z+=(-k2*s+k*c)*sp;if(keys[KB.rotL])CAM.yaw-=dt*1.5;if(keys[KB.rotR])CAM.yaw+=dt*1.5;
 updateCamera(dt);updateChunks(12);ghost.visible=rangeRing.visible=false;GB1.g.visible=false;PKL.hit=null;
 {const M=siteMaskGet(),cx=CAM.x|0,cy=CAM.z|0;let gn=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const kx=((cx/CH)|0)+i,ky=((cy/CH)|0)+j;if(kx>=0&&ky>=0&&kx<NCX&&ky<NCY&&genF[ky*NCX+kx])gn++}govBuild('pk'+SEED+'|'+((cx/10)|0)+','+((cy/10)|0)+','+gn,cx,cy,56,(x,y)=>!!M[((y/PVS)|0)*PVW+((x/PVS)|0)])}
 const blocked=!(mouse.x>=0)||uiRects.some(r=>inR(mouse,r)),gho=GHO;
 GHO={tier:0,gl:2,rot:PKROT&3};try{
 if(!blocked){const p=pickGround(mouse.x,mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const ok=siteOK(tx,ty)&&sitesFar({tx,ty},MP.conn?MP.theirs:null);PKL.hit={tx,ty,ok};if(!(pickPos&&pickPos.tx===tx&&pickPos.ty===ty))ghostMake(GB1,'castle',tx-2,ty-2,0,ok,.6)}}}
 if(pickPos&&gOK(pickPos.tx,pickPos.ty)){ghostMake(GB2,'castle',pickPos.tx-2,pickPos.ty-2,0,true,1);PKL.beam.visible=true;PKL.beam.position.set(pickPos.tx+.5,HT[pickPos.ty*TW+pickPos.tx]+30,pickPos.ty+.5)}else{GB2.g.visible=false;PKL.beam.visible=false}
 }finally{GHO=gho}
 /* the partner's castle, or their cursor while they are still choosing: shown in this view too, with a blue beam and their name */
 if(MP.conn){const hh=PKL.hit||pickPos;if(hh&&performance.now()-_pcT>90){const kk=hh.tx+','+hh.ty;if(kk!==_pcL){_pcL=kk;mpSend({k:'pc',tx:hh.tx,ty:hh.ty})}_pcT=performance.now()}}
 const PO=MP.conn?(MP.theirs||MP.cur):null;
 if(PO&&gOK(PO.tx,PO.ty)){
  if(MP.theirs){GHO={tier:0,gl:2,rot:MP.theirs.rot&3};try{ghostMake(GB3,'castle',PO.tx-2,PO.ty-2,0,true,1)}finally{GHO=gho}}else GB3.g.visible=false;
  if(!PKL.beam2){PKL.beam2=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,60,8),new THREE.MeshBasicMaterial({color:0x5aa9ff,transparent:true,opacity:.6,depthWrite:false}));scene.add(PKL.beam2)}
  const h=HT[PO.ty*TW+PO.tx]||LAND;PKL.beam2.visible=true;PKL.beam2.position.set(PO.tx+.5,h+30,PO.ty+.5);pkLiveTag(PO.tx+.5,h+(MP.theirs?7.5:3),PO.ty+.5,(MP.pname||L('Partner'))+(MP.theirs?L(' - castle'):''))}
 else{GB3.g.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}
 glowFlush();scene.updateMatrixWorld();postRender(scene,camera,true);GB2.g.visible=false;GB3.g.visible=false;PKL.beam.visible=false;if(PKL.beam2)PKL.beam2.visible=false;if(PKL.tag)PKL.tag.visible=false}
/* floating name over the partner's site in the live view */
function pkLiveTag(x,y,z,t){if(!PKL.tag){const c=document.createElement('canvas');c.width=256;c.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.renderOrder=10;sp.userData={c,t:null};scene.add(sp);PKL.tag=sp}
 const sp=PKL.tag;if(sp.userData.t!==t){sp.userData.t=t;const x2=sp.userData.c.getContext('2d');x2.clearRect(0,0,256,64);x2.font='700 28px '+FFT;x2.textAlign='center';x2.lineWidth=6;x2.strokeStyle='#0b0810';x2.fillStyle='#9fd0ff';x2.strokeText(t,128,42);x2.fillText(t,128,42);sp.material.map.needsUpdate=true}
 const k=Math.max(2.4,CAM.dist*.075);sp.scale.set(k*4,k,1);sp.position.set(x,y+k*.5,z);sp.visible=true}
